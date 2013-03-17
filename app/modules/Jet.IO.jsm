let EXPORTED_SYMBOLS = ["OperationController"];

Components.utils.import("resource://jet/base.jsm");

OperationDispatchTypes = {
	Master : 0x0,
	Worker : 0x1,
	Slave : 0x2
}

function OperationController(file){
	var OperationController = this;
	this.__worker = new Worker("Jet.IO.Controller.js");
	this.__worker.onmessage = function(e){
		// The first message is an array of operations that the controller can dispatch
		OperationController.__operations = e.data;
		OperationController.__worker.onmessage = OperationController.requestOperation(e.data);
	}
	var op = {
		resource : file,
		action : "GET",
		object : 5		// Max handlers
	}
	this.__worker.postMessage(op);
}

OperationController.prototype = {
	__operations : null,
	
	/** @param {Operation} op */
	/** @returns {Void} */
	dispatchOperation : function(op, callback){		// This dispatches Operations into an OperationControllerDelegate
		if(this.canDispatch(op)){
			this.__worker.postMessage(op);	
		}
	},
	
	requestOperation : function(op){				// This routes messages to other OperationControllers
		if(Array.isArray(op)){
			
		}
		else {
			
		}
	},
	
	/** @param {Operation} op */
	/** @returns {Boolean} */
	canDispatch : function(op){
		return (this.__operations[ op.resource ] != undefined);
	}
}