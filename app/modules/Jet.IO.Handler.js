"use strict";

importScripts("Jet.IO.Common.js");

var global = this;


Jet.IO.OperationHandler = {
	
	/** @returns {Void} */
	init : function(){
		Jet.IO.Operations.clear();
		Jet.IO.Operations.add(putHandlerOperations);
		Jet.IO.Operations.add(deleteHandlerOperations);
		Jet.IO.Operations.add(getHandlerOperations);
		
		onmessage = function(e){
			Jet.IO.OperationHandler.requestDispatch(e.data);
		}
		
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
	requestDispatch : function(request){
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


var putHandlerOperations = {
	__proto__ : Jet.IO.OperationDelegate,
	
	resource : "jet://io/operations",
	
	action : Jet.IO.OperationActions.Put,
	
	dispatchType : Jet.IO.OperationDispatchTypes.Slave,
	
	register : function(){},
	
	dispatch : function(){
		try {
			Jet.IO.OperationHandler.init();
			importScripts(this.object);
			for(var i = 0; i < EXPORTED_SYMBOLS.length; i++){
				var symbol = EXPORTED_SYMBOLS[i];
				var delegate = global[symbol];
				delegate.register();
				Jet.IO.Operations.add(delegate);
			}
				
			// Register the GET operation for this handlers resource
			getHandlerOperations.register();
			
			this.status = 200;
		}
		catch(e){
			this.status = 500;
		}
		finally {
			this.oncomplete();	
		}
	}
}


var getHandlerOperations = {
	__proto__ : Jet.IO.OperationDelegate,
		
	resource : "jet://io/operations",
	
	action : Jet.IO.OperationActions.Get,
	
	dispatchType : Jet.IO.OperationDispatchTypes.Slave,
	
	register : function(){
		this.object = [];
		var operations = Jet.IO.Operations.getEnumerator();
		while(operations.hasMore()){
			var operation = operations.getNext();
			var op = {
				resource : operation.resource,
				action : operation.action,
				object : operation.dispatchType
			}
			this.object.push(op);
		}
	},
	
	dispatch : function(){
		// Return the list of operations this handler can dispatch
		this.oncomplete();
	}
	
}

var deleteHandlerOperations = {
	__proto__ : Jet.IO.OperationDelegate,
	
	resource : "jet://io/operations",
	
	action : Jet.IO.OperationActions.Delete,
	
	dispatchType : Jet.IO.OperationDispatchTypes.Slave,
	
	register : function(){},
	
	dispatch : function(){
		
	}
}

Jet.IO.OperationHandler.init();

