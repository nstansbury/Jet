"use strict";

importScripts("Jet.IO.Common.js");

Jet.IO.OperationHandler = {
	
	__requests : {},
	
	__operations : {},
	
	/** @returns {[Jet.IO.Operations]} */
	get operations(){
		return this.__operations;
	},
	
	
	/** @param {Object} operation */
	/** @returns {Jet.IO.Operation} */
	getOperation : function(operation){
		return this.__operations[ operation.resource ];
	},
	
	/** @param {Jet.IO.Operation} operation */
	/** @returns {Void} */
	addOperation : function(operation){
		this.__operations[ operation.resource ] = operation;
	},
	
	/** @param {Jet.IO.Operation} operation */
	/** @param {Function} oncomplete */
	/** @returns {Void} */
	dispatchOperation : function(operation, oncomplete){
		// We never dispatch into ourselves. This ensures any operations dispatched by this thread remain asychronous
		var request = Jet.IO.Requests.createRequest(operation, oncomplete);
		postMessage(request);
	},
	
	/** @private */
	/** @param {Jet.IO.OperationRequest} request */
	/** @returns {Void} */
	_requestDispatch : function(request){
		if(Jet.IO.Requests.hasRequest(request)){
			Jet.IO.Requests.endRequest(request);
		}
		else { // This is a request that we dispatch this operation
			// Get a Jet.IO.Operation delegate
			var delegate = this.getOperation(operation);
			
			var operation = request.operations[0];
			operation.oncomplete = function(operation){
				delete operation.oncomplete;				// Because it won't serialise across thread boundaries otherwise
				request.operations = [operation];
				postMessage(request);
			}
			delegate.dispatch.call(operation);
		}
		// We always free the handler after dispatch returns
		postMessage(null);
	}
}

onmessage = function(e){
	var operation = e.data;
	
	// Register a GET operation for this handlers resource
	getHandlerOperations.resource = op.resource;
	getHandlerOperations.register();
	Jet.IO.OperationHandler.addOperation(getHandlerOperations);
	
	onmessage = function(e){
		Jet.IO.OperationHandler._requestDispatch(e.data);
	}
	
	operation.status = "200";
	postMessage(operation);
}


getHandlerOperations = {
	resource : "",
	
	action : Jet.IO.OperationActions.Get,
	
	dispatchType : Jet.IO.OperationDispatchTypes.Slave,
	
	register : function(){
		importScripts(this.resource);
		
		for(var i = 0; i < EXPORTED_SYMBOLS.length; i++){
			var symbol = EXPORTED_SYMBOLS[ i ];
			var opDefinition = this[ symbol ];
			opDefinition.register();
			Jet.IO.OperationHandler.addOperation(opDefinition);
		}
	},
	
	dispatch : function(){
		// Return the list of operations this handler can dispatch
		var opArray = [];
		var operations = Jet.IO.OperationHandler.operations;
		for(var opDefinition in operations){
			var op = {
				resource : opDefinition.resource,
				action : opDefinition.action,
				object : opDefinition.dispatchType
			}
			opArray.push(op);
		}
		operation.object = opArray;
		this.oncomplete(operation);
	}
	
}