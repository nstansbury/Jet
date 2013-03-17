
OperationDispatchTypes = {
	Master : 0x0,
	Worker : 0x1,
	Slave : 0x2
}

OperationControllerDelegate = {
	__handlers : [],
	
	__opqueue : [],
	
	createHandler : function(file){
		var oh = new OperationHandler(file);
		this.__handlers.push(oh);
	},
	
	/** @param {Operation} op */
	/** @returns {Void} */
	dispatchOperation : function(op){		// This dispatches Operations into an OperationHandler
		if(this.__handlers.length){
			this.__handlers.pop().dispatchOperation(op);
		}
		else {
			this.__opqueue.push(op);
		}
	},
	
	requestOperation : function(op){
		if(this.canDispatch(op)){
			this.dispatchOperation(op);
		}
		else {
			self.postMessage(op);	
		}
	},
	
	/** @param {Operation} op */
	/** @returns {Boolean} */
	canDispatch : function(op){
		
	}
}

onmessage = function(e){
	var op = e.data;
	// Create an OperationHandler for each slave thread
	for(var i = 0; i < op.object; i++){
		OperationControllerDelegate.createHandler(op.resource);
	}
	self.onmessage = function(e){OperationControllerDelegate.dispatchOperation(e.data);}
}


function OperationHandler(file){
	this.__worker = new Worker("Jet.IO.Handler.js");
	this.__worker.onessage = function(e){OperationControllerDelegate.requestOperation(e.data)};		// This receives messages from OperationHandlerDelegates
	var op = {
		resource : file,
		action : "GET",
		object : null,
	}
	this.dispatchOperation(op);
}
OperationHandler.prototype = {
	/** @param {Operation} op */
	/** @returns {Void} */
	dispatchOperation : function(op){		// This dispatches Operations into an OperationHandlerDelegate
		this.__worker.postMessage(op);	
	},
}