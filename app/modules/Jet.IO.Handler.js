
OperationHandlerDelegate = {
	__operations : [],
	
	/** @param {Operation} op */
	/** @returns {Void} */
	dispatchOperation : function(op){	// This ensures any operations dispatched in this thread remain asychronous
		self.postMessage(op);	
	},
	
	requestOperation : function(op){
		// Dispatch a concrete operation object
		concreteOperation.dispatch(op);
	},
}

onmessage = function(e){
	importScripts(e.data.resource);
	var operations = [];
	for(var i = 0; i < EXPORTED_SYMBOLS.length; i++){
		var symbol = EXPORTED_SYMBOLS[ i ];
		var operation = this[ symbol ];
		operation.register();
		// Must register it as a master or worker so dispatcher can run on Main or Worker thread
		var op = {
			resource : operation.resource,
			action : operation.action,
			object : operation.dispatchType
		}
		this.__operations[ operation.resource ] = operation;
		operations.push(op);
	}
	OperationHandlerDelegate.dispatchOperation(operations);
	self.onmessage = function(e){
		OperationHandlerDelegate.requestOperation(e.data);
		OperationHandlerDelegate.dispatchOperation("FREE");
	}
}