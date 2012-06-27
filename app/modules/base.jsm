let EXPORTED_SYMBOLS = ["RegisterNS", "RegisterAlias", "ImportNS", "LoadScript", "ReadFile", "WriteFile", "GetFile", "Trace", "Mozilla"];

/**	RegisterNS() expect to be able to register a resource://alias/module path and import loader.jsm to initialise the Namespace
		ImportNS() will then be able to import modules registered in those namespaces
*/


/** @param {String} namespace */
/** @param {Object} scope */
/** @returns {Object} */
function ImportNS(namespace, scope)		{
	if(!ImportNS.__Global)	{
		ImportNS.__Global = scope;		// The first Import() call sets the Global scope
		var ns = scope;
	}
	else if(!scope)	{
		var ns = ImportNS.__Global;
	}
	else {
		var ns = scope;
	}
	
	var keys = namespace.split(".");	//** Expecting format:  x.y.z
	var len = keys.length;
	//** Ensure the full namespace object hierachy exists
	for(var i = 0; i < len; i++)	{
		var key = keys[ i ];
		//** Because testing for undefined in strict mode generates a "referenced to undefined property" warning
		if(ns.hasOwnProperty(key) == false)	{
			ns[ key ] = {};
			var imported = false;
		}
		ns = ns[ key ];
	}
	
	var resource = "resource://" + keys[ 0 ] +"/" +namespace +".jsm";
	
	try {
		Trace("# Import Namespace :: "+namespace);
		if(!scope)	{
			scope = ns;
		}
		Components.utils.import(resource, scope);
	}
	catch(e)	{
		throw new Components.Exception("Module Import Failed :: " +resource, null, Components.stack.caller, null, e);
	}
	return scope[ keys[ 0 ] ];
}


	
/** @param {String} namespace */
/** @param {nsIFile} [path] */
/** @returns {Void} */
function RegisterNS(namespace, path)	{
	try {
		var ioService = Mozilla.Components.Service("@mozilla.org/network/io-service;1", "nsIIOService");
		var resourceHandler = ioService.getProtocolHandler("resource").QueryInterface(Components.interfaces.nsIResProtocolHandler);
			
		if(path)		{
			path.append("modules");
			var fileUri = ioService.newFileURI(path);
		}
		else {
			var dirService = Mozilla.Components.Service("@mozilla.org/file/directory_service;1", "nsIProperties");
			var procDir = dirService.get("CurProcD", Components.interfaces.nsIFile);	
			
			var appBaseDir = procDir.parent;
			appBaseDir.append("app");
		
			var modulesDir = appBaseDir.clone();
			modulesDir.append("modules");
			var fileUri = ioService.newFileURI(modulesDir);		
		}
		resourceHandler.setSubstitution(namespace.toLowerCase(), fileUri);
		
		var nsChromeReg = Mozilla.Components.Service("@mozilla.org/chrome/chrome-registry;1", "nsIChromeRegistry");
		nsChromeReg.checkForNewChrome();
		// Now import the loader module for this namespace
		Components.utils.import("resource://" +namespace +"/loader.jsm");
		Trace("# Namespace Registered :: "+namespace);
	}
	catch(e)	{
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
	if(thing instanceof Components.Exception || thing instanceof TypeError)	{
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
		throw new Components.Exception("No scope argument supplied to LoadScript() :: " +script, null, Components.stack.caller);
	}
	var loader = Mozilla.Components.Service("@mozilla.org/moz/jssubscript-loader;1", "mozIJSSubScriptLoader");  
	loader.loadSubScript(path, scope);
}


/** @param {String} path */
/** @param {Function} callback */
/** @returns {String} */
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
