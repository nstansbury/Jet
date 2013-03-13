var EXPORTED_SYMBOLS = ["ServiceProvider"];

Components.utils.import("resource://jet/base.jsm");


ServiceProvider = {
	get name(){throw new Components.Exception("Not Implemented");},
	
	/** @param {Object} params */
	/** @returns {Void} */
	start : function(params){throw new Components.Exception("Not Implemented");},
	
	/** @param {Boolean} restart */
	/** @returns {Void} */
	stop : function(restart){throw new Components.Exception("Not Implemented");},
	
	/** @param {Jet.Events.EventType} type */
	/** @param {Function} calback */
	/** @param {Number} delay */
	/** @returns {Void} */
	addEventListener : function(type, callback, delay){throw new Components.Exception("Not Implemented");},
	
	/** @param {Jet.Events.EventType} type */
	/** @param {Function} calback */
	/** @param {Number} delay */
	/** @returns {Void} */
	removeEventListener : function(type, callback, delay){throw new Components.Exception("Not Implemented");}

}

EndpointServer = {
	registerEndpoint : function registerEndpoint(service){
	
	},
	
	getService : function getService(cmd){
		
	},
	
	dispatchCommand : function dispatchCommand(cmd, callback) {
		var service = this.getService(cmd);			// 503 Service Unavailable
		var command = service.getCommand(cmd);		// 404 Command not found
		command.dispatch(cmd, callback);
	}
}

EndpointService = {
	uri : "jet://maestro/",
	
	getCommand : function getCommand(cmd){
		// A command might have a 1:1 relationship with a worker
		// This means
		//		a) CommandHandler.dispatch() must be able to dispatch multiple simultanious commands
		//		b) CommandHandlers must be reusable so we don't new Worker("jsfile"); on every dispatch
		
		
		// Each command is a function with arg, callback
		// If the command is an
		
		var handler = new CommandHandler("commands.js");
			var chw = new Worker("commands.js");
			chw.onmessage = someCallback;
			chw.postMessage("register");
			// The CommandHandler listens for each command the worker is registering
			
		handler.dispatchCommand(cmd, callback);
			chw.onmessage = cmdListener
			chw.postMessage(cmd)
		
	},
	
	addCommand : function addCommand(handler){
		
	}
}