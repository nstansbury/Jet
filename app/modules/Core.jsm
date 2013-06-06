"use strict";

let EXPORTED_SYMBOLS = ["Jet", "RegisterNS", "ImportNS", "UnloadNS", "RegisterAlias", "Trace", "Mozilla"];

// RegisterNS() expects to be able to register a resource://alias/module path and import loader.jsm to initialise the Namespace
// ImportNS() will then be able to import modules registered in those namespaces

var global = this;

var Jet = {
	version: 0.1,
	
	/** @param {Object} params */
	/** @returns {Void} */
	start : function(params)	{
		Trace("\n\n________ Jet Server v"+this.version +" ________");
		
		try{
			ImportNS("Jet.Messaging");
			ImportNS("Jet.Net.Http");
			//ImportNS("Jet.IO");
			
			var HttpServer = new Jet.Net.Http.HttpServer();
			
			//var file = Jet.IO.File.open("app/resources");
			//HttpServer.registerDirectory("/jet/", file);
			
			var resource = "/about";
			var handler = "Jet.About.js"
			var threads = 5;
			
			Jet.Messaging.register(resource, handler, threads);
			
			var controller = Jet.Messaging.getControllerForResource(message.resource);
			Controller.requestDispatch(message);
			
			
			Jet.Messaging.requestDispatch()
			
			
			HttpServer.registerPathHandler(resource, function(metadata, httpResponse){
				handler.beginRequest(metadata, httpResponse);
				
				Jet.Messaging.Controller.requestDispatch(message, oncomplete)
				
			});
			
			
			HttpServer.start(params.port);
			Trace("# Listening on: " +params.port);
		
			var nsThreadManager = Mozilla.Components.Service("@mozilla.org/thread-manager;1", "nsIThreadManager");
			var mainThread = nsThreadManager.currentThread;
			
			Trace("# Jet is running.... <Ctrl+C> to Exit");
			
			while(!this.__isStopping)		{
				mainThread.processNextEvent(true);
			}
			while(mainThread.hasPendingEvents())		{
				mainThread.processNextEvent(true);
			}
		}
		catch(e){
			Trace(e)
		}
	},
	
	__isStopping : false,
	
	stop : function stop(){
		this.__isStopping = true;
	},
	
};


/** @param {String} namespace */
/** @param {Object} [scope] */
/** @param {Boolean} [relative] Import exported object relative to the scope in use */
/** @returns {Object} */
function ImportNS(namespace, scope, relative)		{
	try {
		Trace("# Importing Namespace :: "+namespace);
		var path = namespace.split(".");									//** Expecting format:  x.y.z
		
		if(relative != true)	{											//** Ensure the full namespace object hierachy exists
			scope = (scope == undefined) ? global : scope;
			var len = path.length;
			for(var i = 0; i < len; i++)	{
				var name = path[ i ];
				if(scope.hasOwnProperty(name) == false)	{					//** Because testing for undefined in strict mode generates a "referenced to undefined property" warning
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


var Mozilla = {
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
