"use strict";

importScripts("Jet.IO.Common.js");

var global = this;

Jet.IO.OperationHandler = {
	
	__requests : {},
	
	__operations : {},
	
	/** @returns {[Jet.IO.Operation]} */
	get operations(){
		return this.__operations;
	},
	
	
	/** @param {Object} operation */
	/** @returns {Jet.IO.Operation} */
	getOperation : function(operation){
		return this.__operations[operation.resource][operation.action];
	},
	
	/** @param {Jet.IO.Operation} operation */
	/** @returns {Void} */
	addOperation : function(operation){
		if(this.__operations[operation.resource] == undefined){
			this.__operations[operation.resource] = {}
		}
		this.__operations[operation.resource][operation.action] = operation;
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
			var operation = request.operations[0];
			var delegate = this.getOperation(operation);
			
			operation.oncomplete = function(){
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


var putHandlerOperations = {
	resource : "jet://io/operations",
	
	action : Jet.IO.OperationActions.Put,
	
	dispatchType : Jet.IO.OperationDispatchTypes.Slave,
	
	register : function(){},
	
	dispatch : function(){
		try {
			importScripts(this.object);
			for(var i = 0; i < EXPORTED_SYMBOLS.length; i++){
				var symbol = EXPORTED_SYMBOLS[i];
				var delegate = global[symbol];
				delegate.register();
				Jet.IO.OperationHandler.addOperation(delegate);
			}
				
			// Register an GET operation for this handlers resource
			getHandlerOperations.register();
			Jet.IO.OperationHandler.addOperation(getHandlerOperations);
			
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
	resource : "jet://io/operations",
	
	action : Jet.IO.OperationActions.Get,
	
	dispatchType : Jet.IO.OperationDispatchTypes.Slave,
	
	register : function(){
		this.object = [];
		var operations = Jet.IO.OperationHandler.operations;
		for(var definition in operations){
			var op = {
				resource : definition.resource,
				action : definition.action,
				object : definition.dispatchType
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
	resource : "jet://io/operations",
	
	action : Jet.IO.OperationActions.Delete,
	
	dispatchType : Jet.IO.OperationDispatchTypes.Slave,
	
	register : function(){},
	
	dispatch : function(){
		
	}
}

Jet.IO.OperationHandler.addOperation(putHandlerOperations);
Jet.IO.OperationHandler.addOperation(deleteHandlerOperations);

onmessage = function(e){
	Jet.IO.OperationHandler._requestDispatch(e.data);
}