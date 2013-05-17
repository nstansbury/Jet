"use strict";

importScripts("Jet.Messaging.jsm");

Jet.Messaging.MessageListener = {
	
	/** @param {Jet.Messaging.Message} message */
	/** @param {Function} oncomplete */
	/** @returns {Void} */
	dispatchMessage : function(message, oncomplete){
		// We never dispatch into ourselves. This ensures any operations dispatched by this thread remain asychronous
		var request = Jet.IO.Requests.createRequest(operation, oncomplete);
		postMessage(request);
	},
	
	/** @private */
	/** @param {Jet.Messaging.Message} message */
	/** @returns {Void} */
	requestDispatch : function(message){
		if(Jet.IO.Requests.hasRequest(request)){
			Jet.IO.Requests.endRequest(request);
		}
		else {
			// This is a request that we dispatch this operation
			// Get a Jet.IO.OperationDelegate
			var operation = request.operation;
			var delegate = Jet.IO.Operations.get(operation);
			if(delegate){
				operation.oncomplete = function(){
					delete operation.oncomplete;				// Because it won't serialise across thread boundaries otherwise
					operation.object = delegate.object;
					request.operation = operation;			
					postMessage(request);
				}
				delegate.dispatch.call(operation);
			}
			else {
				operation.status = 404;
				postMessage(request);
			}
		}
		// We always free the handler after dispatch returns
		postMessage(null);
	}
}

Jet.Messaging.MessageHandler = function MessageHandler(){

}
Jet.Messaging.MessageHandler.prototype = {
	register : function(){
		
	},
	
	unregister : function(){
		
	},
	
	execute: function(){
		
	}
}