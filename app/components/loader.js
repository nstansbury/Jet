"use strict";

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://Jet/Core.jsm");

function JetLoader() {}
 
JetLoader.prototype = {
	_xpcom_categories: [{category: "command-line-handler", entry: "m-jetloader"}],
	
	classDescription: "Jet Loader",
	
	classID: Components.ID("{6e9620f8-a65e-4dc0-b26f-0812b8b62c7b}"),
	
	contractID: "@jetjs.io/loader;1",
	
	helpInfo : "  -port               Port Jet should listen on\n",
	
	/** @param {nsICommandLineHandler} cmdLine */
	/** @returns {Void} */
	handle : function(cmdLine){
		var params = {};
		var port = cmdLine.handleFlagWithParam("port", false);
		if(port) {
			params.port = port;
		}
		Jet.start(params);
	},
	
	QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsICommandLineHandler]),
}

var NSGetFactory = XPCOMUtils.generateNSGetFactory([JetLoader]);
