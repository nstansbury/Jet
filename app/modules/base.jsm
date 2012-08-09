let EXPORTED_SYMBOLS = ["Jet", "RegisterNS", "RegisterAlias", "ImportNS", "UnloadNS", "LoadScript", "ReadFile", "WriteFile", "GetFile", "Trace", "TryCatch", "Mozilla"];

/**	RegisterNS() expect to be able to register a resource://alias/module path and import loader.jsm to initialise the Namespace
		ImportNS() will then be able to import modules registered in those namespaces
*/



Jet = {
	__scope : null,
	
	/** @param {Object} scope */
	/** @returns {Void} */
	Start : function(scope)	{
		Jet.__scope = scope;
		RegisterAlias("Lib", GetFile("app/libraries"));
		RegisterAlias("Res", GetFile("app/res"));
		RegisterAlias("Tests", GetFile("tests"));
		
		Trace.enabled = true;
		
		ImportNS("Jet");
		Jet.App.start();
	}
};


/** @param {String} namespace */
/** @param {Object} [scope] */
/** @param {Boolean} [relative] Import exported object relative to the scope in use */
/** @returns {Object} */
function ImportNS(namespace, scope, relative)		{
	try {
		Trace("# Importing Namespace :: "+namespace);
		var path = namespace.split(".");									//** Expecting format:  x.y.z
		
		if(relative != true)	{													//** Ensure the full namespace object hierachy exists
			scope = (scope == undefined) ? Jet.__scope : scope;
			var len = path.length;
			for(var i = 0; i < len; i++)	{
				var name = path[ i ];
				if(scope.hasOwnProperty(name) == false)	{		//** Because testing for undefined in strict mode generates a "referenced to undefined property" warning
					scope[ name ] = {};
				}
				scope = scope[ name ];
			}
		}
		//	else We import the namespace exports directly into the scope argument
		var resource = "resource://" + path[ 0 ] +"/" +namespace +".jsm";
		Components.utils.import(resource, scope);
	}
	catch(e)	{
		throw new Components.Exception("Module Import Failed :: " +resource, null, Components.stack.caller, null, e);
	}
	return scope;
}

/** @param {String} namespace */
/** @param {Object} [scope] */
function UnloadNS(namespace, scope)		{
	Trace("# Unloading Namespace :: "+namespace);
	var path = namespace.split(".");									//** Expecting format:  x.y.z
	
	scope = (scope == undefined) ? Jet.__scope : scope;
	if(scope.Dispose){
		scope.Dispose();
	}
	var resource = "resource://" + path[ 0 ] +"/" +namespace +".jsm";
	Components.utils.unload(resource);	
}

	
/** @param {String} namespace */
/** @param {nsIFile} [path] */
/** @returns {Void} */
function RegisterNS(namespace, path)	{
	try {
		var ioService = Mozilla.Components.Service("@mozilla.org/network/io-service;1", "nsIIOService");
		var resourceHandler = ioService.getProtocolHandler("resource").QueryInterface(Components.interfaces.nsIResProtocolHandler);
		
		if(path)		{
			var appBaseDir = path;
		}
		else {
			var dirService = Mozilla.Components.Service("@mozilla.org/file/directory_service;1", "nsIProperties");
			var procDir = dirService.get("CurProcD", Components.interfaces.nsIFile);	
			
			var appBaseDir = procDir.parent;
			appBaseDir.append("app");	
		}
		
		var modulesDir = appBaseDir.clone();
		modulesDir.append("modules");
		var fileUri = ioService.newFileURI(modulesDir);
		resourceHandler.setSubstitution(namespace.toLowerCase(), fileUri);
		
		var nsChromeReg = Mozilla.Components.Service("@mozilla.org/chrome/chrome-registry;1", "nsIChromeRegistry");
		nsChromeReg.checkForNewChrome();
		/*
		var compDir = appBaseDir.clone();
		compDir.append("components");
		Components.manager.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		Components.manager.autoRegister(compDir);
		*/
		
		// Now import the loader module for this namespace into the default scope
		Components.utils.import("resource://" +namespace +"/loader.jsm", Jet.__scope);
		Trace("# Namespace Registered :: "+namespace);
	}
	catch(e)	{
		Trace(e.message);
		Trace("! Namespace Registration Failed :: "+namespace);
	}
}

/** @param {String} alias */
/** @param {nsIFile} path */
/** @returns {Void} */
function RegisterAlias(alias, path)	{
	try {
		var ioService = Mozilla.Components.Service("@mozilla.org/network/io-service;1", "nsIIOService");
		var resourceHandler = ioService.getProtocolHandler("resource").QueryInterface(Components.interfaces.nsIResProtocolHandler);
			
		var fileUri = ioService.newFileURI(path);
		resourceHandler.setSubstitution(alias.toLowerCase(), fileUri);
		var nsChromeReg = Mozilla.Components.Service("@mozilla.org/chrome/chrome-registry;1", "nsIChromeRegistry");
		nsChromeReg.checkForNewChrome();
		Trace("# Alias Registered :: "+alias);
	}
	catch(e)	{
		Trace(e);
		Trace("! Alias Registration Failed :: "+alias);
	}
}


/** @param {Object} thing */
/** @param {Boolean} [all] Exclude private variables by default*/
/** @returns {Void} */
function Trace(thing, all)	{
	if(Trace.enabled == false)	{
		return;
	}
	if(thing instanceof Components.Exception || thing.constructor.name == "TypeError" || thing.constructor.name == "ReferenceError")	{ // instanceof TypeError returns false ;-(
		dump("Exception :: File: " +(thing.filename || thing.fileName) +", Line: " +thing.lineNumber +", Message: " +thing.message +"\n");
	}
	else if(typeof thing == "object")	{
		var name = (thing.constructor.name == undefined) ? "[Object]" : "[" +thing.constructor.name +"]";
		dump(name +"\n");
		
		for(var key in thing)	{
			if(key.indexOf("_") == 0 && !all)	{
				continue;	
			}
			var eol = ";";
			try {
				if(thing[key])		{
					if(typeof thing[key] === "function")	{
						eol = "();";
					}
					else if(thing[key].push != undefined)	{	// Array.isArray( thing[key] ) is bust
						eol = "[];";
					}
				}
			}
			catch(e){}
			dump(" |- " +key +eol +"\n");
		}
		dump("\n");
	}
	else {
		dump(thing +"\n");
	}
}


/** @param {String} path */
/** @param {Object} [scope] */
/** @returns {Void} */
function LoadScript(path, scope)	{
	if(!scope)	{
		throw new Components.Exception("No scope argument supplied to LoadScript() :: " +path, null, Components.stack.caller);
	}
	var loader = Mozilla.Components.Service("@mozilla.org/moz/jssubscript-loader;1", "mozIJSSubScriptLoader");  
	loader.loadSubScript(path, scope);
}




/** @param {String} path */
/** @param {Function} callback */
/** @returns {Void} */
function ReadFile(path, callback)	{
	Components.utils.import("resource://gre/modules/NetUtil.jsm");
	
	function onDataAvailable()	{
		if (!Components.isSuccessCode(status)) {
			callback(status, null);
		}
		var data = NetUtil.readInputStreamToString(inputStream, inputStream.available());
		callback(status, data);
	}
	
	NetUtil.asyncFetch(file, onDataAvailable);
}


/** @param {String} data */
/** @param {String} path Native path to file*/
/** @param {Function} [callback] */
/** @returns {Void} */
function WriteFile(data, path, callback)	{
	Components.utils.import("resource://gre/modules/NetUtil.jsm");  
	Components.utils.import("resource://gre/modules/FileUtils.jsm");  
	
	var converter = Mozilla.Components.Instance("@mozilla.org/intl/scriptableunicodeconverter", "nsIScriptableUnicodeConverter");  
	converter.charset = "UTF-8";  
	var inputStream = converter.convertToInputStream(data);  
	
	var file = new FileUtils.File(path);
	
	var outputStream = FileUtils.openSafeFileOutputStream(file);
	NetUtil.asyncCopy(inputStream, outputStream, callback);
}


/** @param {String} path Relative path to app root*/
/** @returns {nsIFile} */
function GetFile(path)	{
	var dirService = Mozilla.Components.Service("@mozilla.org/file/directory_service;1", "nsIProperties");
	var file = dirService.get("CurProcD", Components.interfaces.nsIFile);
	file = file.parent;	// Jet root
	
	var paths = path.split("/");
	for(var i = 0; i < paths.length; i++)	{
		file.append(paths[ i ]);
	}
	return file;
}


/** @param {Object} [thisArg] */
/** @param {Function|String} func Method to try */
/** @param {Array} [argsArray] */
/** @param {Function} [onerror] */
/** @returns {Boolean} */
function TryCatch(thisArg, func, argsArray, onerror)	{
	try {
		if(typeof(thisArg) == "function"){	// No this arg
			argsArray = func;
			func = thisArg;
			func.apply(null, argsArray);
		}
		else if(typeof(func) == "string"){
			thisArg[ func ].apply(thisArg, argsArray);
		}
	}
	catch(e) {
		if(onerror){
			onerror(e);
		}
		else {
			Trace(e);
		}
		return false
	}
	return true;
}

Mozilla = {
	Components : {

		Instance : function Instance( contractID, interfaceName, initializer )	{
			function constructor()		{
				var instance = Components.classes[ contractID ].createInstance( Components.interfaces.nsISupports );
				if ( interfaceName )	{
					instance.QueryInterface( Components.interfaces[ interfaceName ] );
					if ( initializer )	{
						instance[ initializer ].apply( instance, arguments );
					}
				}
				return instance;
			}
			return constructor();
		},

		Service : function Service( contractID, interfaceName, initializer )		{
			function constructor()		{
				if( Components.classes[ contractID ] == undefined )	{
					throw new Components.Exception("Invalid XPCOM ContactID specified: '" +contractID, null, Components.stack.caller, null, e);
				}
				var service = Components.classes[ contractID ].getService( Components.interfaces.nsISupports );
				if ( interfaceName )	{
					if( Components.interfaces[ interfaceName ] == undefined )	{
						throw new Components.Exception("Invalid XPCOM Interface specified: '" +contractID, null, Components.stack.caller, null, e);
					}
					service.QueryInterface( Components.interfaces[ interfaceName ] );
					if ( initializer )	{
						service[ initializer ].apply( service, arguments );
					}
				}	
				return service;
			}
			return constructor();
		},
		
		//** @param{Object} object
		//** @param{Array} interfaces
		//** @returns{Void}
		SupportsInterface : function SupportsInterface( object, interfaces )	{
			this.__wrappedJSObject = object;
			if( interfaces == undefined )	{
				interfaces = [];
			}
			//interfaces.push( "xuluSystemObject" );
			interfaces.push( "nsISupports" );
			this.__interfaces = interfaces;
		},
		
		ArrayEnumerator : function ArrayEnumerator(array) {
			this.array = array;
			this.index = 0;
		}
	}
}

Mozilla.Components.SupportsInterface.prototype = {
	
	constructor : Mozilla.Components.SupportsInterface,
	
	get Interfaces()	{
		return this.__interfaces;
	},
	
	get wrappedJSObject()	{
		return this.__wrappedJSObject;
	},
	
	QueryInterface: function( iid, result )	{
		for( var i = 0; i < this.__interfaces.length; i++ )	{
			if ( iid.equals( Components.interfaces[ this.__interfaces[ i ] ] ) )	{
				return this;
			}
		}
		throw Components.results.NS_ERROR_NO_INTERFACE;
	}
}

Mozilla.Components.ArrayEnumerator.prototype = {
	constructor : Mozilla.Components.ArrayEnumerator,
	hasMoreElements: function() { return this.index < this.array.length; },
	getNext: function () { return ( this.index < this.array.length ) ? this.array[this.index++] : null; }
}
