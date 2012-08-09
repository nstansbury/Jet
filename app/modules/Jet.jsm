let EXPORTED_SYMBOLS = ["App"];

Components.utils.import("resource://jet/base.jsm");

var Services = ImportNS("Jet.Services");

App = {
	__proto__ : Services.ServiceProvider,	// Just so you know really...
	
	// Startup options object.  Eg. -start jester args
	Options : {
		app : []
	},
	
	get name(){ return "Jet.App"; },
	
	/** @param {Array} [params] */
	/** @returns {Void} */
	start : function start(params)	{
		if(params){
			jetOptions(params);
		}
		jetRegister();
		
		Trace("# Jet is running.... <Ctrl+C> to Exit");
		var nsThreadManager = Mozilla.Components.Service("@mozilla.org/thread-manager;1", "nsIThreadManager");
		var mainThread = nsThreadManager.currentThread;
		
		while(!this.__isStopping)		{
			mainThread.processNextEvent(true);
		}
		while(mainThread.hasPendingEvents())		{
			mainThread.processNextEvent(true);
		}
		
	},
	
	__isStopping : false,
	
	stop : function stop(){
		this.__isStopping = true;
	}

}




/** @param {Array} args */
/** @returns {Object} */
function jetOptions(args)	{
	
	var name = "app";		// Default option
	for(var i = 0; i < args.length; i++)	{
		var arg = args[i];
		if(arg.indexOf("-") == 0)	{		// Option eg. -start
			name = arg.substring(1);
			App.Options[ name ] = [];
		}
		else {
			App.Options[ name ].push(arg);
		}
	}	
}

function jetRegister()	{
	var registerAll =  true;
	if(App.Options.start != undefined)	{
		registerAll = false;
		var extList = App.Options["start"].join().toLowerCase();
	}
	var extns = [];
	
	var nsDirService = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
	var procDir = nsDirService.get("CurProcD", Components.interfaces.nsIFile);
	
	var appBaseDir = procDir.parent;
	appBaseDir.append("app");
	
	var extnDir = appBaseDir.clone();
	extnDir.append("extensions");
	
	var dirEntries = extnDir.directoryEntries;
	while( dirEntries.hasMoreElements() )	{
		var file = dirEntries.getNext().QueryInterface(Components.interfaces.nsIFile);
		if(file.isDirectory())	{				// To prevent us trying to register XPIs
			var name = file.leafName.split("@")[ 0 ];
			if((registerAll) || (extList.indexOf(name.toLowerCase()) != -1))	{
				RegisterNS(name, file);
			}
		}
	}
}

