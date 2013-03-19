
importScripts("Jet.IO.Common.js");

Jet.IO.OperationHandler = {
	
	__requests : Jet.IO.OperationRequests,
	
	/** @returns {Jet.IO.OperationRequests} */
	get requests(){
		return this.__requests;
	},
	
	__operations : {},
	
	/** @returns {Object} */
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
	
	/** @param {Object} operation */
	/** @returns {Void} */
	dispatchOperation : function(operation, callback){
		// We never dispatch into ourselves. This ensures any operations dispatched by this thread remain asychronous
		
		requests[ newRequest.id ] = oncomplete;
		
		requests[ newRequest.id ] = oldRequest
		
		
		// Create new Request & add to Queue
		// Create new Request, 
		
		
		var request = this.requests.create(operation, callback);
		postMessage(request);
	},
	
	/** @private */
	/** @param {Jet.IO.OperationRequest} request */
	/** @returns {Void} */
	_requestDispatch : function(request){
		for(var i = 0; i < request.operations.length; i++){
			var operation = request.operations[i];
			// Dispatch a concrete operation object
			var op = this.getOperation(operation);
			op.dispatch(operation);
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
	
	dispatch : function(operation){
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
		Jet.IO.OperationHandler.dispatchOperation(operation);
	}
	
}