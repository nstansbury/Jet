"use strict";

/*
let EXPORTED_SYMBOLS = ["OperationController"];

Components.utils.import("resource://jet/base.jsm");

Service
	Master
		OperationController
			Worker
				OperationDispatcher
				OperationHandler
					Slave
						OperationHandler Delegate
						Operation
*/

function OperationController(file){
	var opController = this;
	this.__worker = new Worker("../../app/modules/Jet.IO.Dispatcher.js");
	this.__worker.onmessage = function(e){
		console.log(e.data);
		return;
		// The first message is an array of operations that the controller can dispatch
		opController.__operations = e.data;
		opController.__worker.onmessage = opController._requestDispatch(e.data);
	}
	var op = {
		resource : file,
		action : Jet.IO.OperationActions.Get,
		object : 5		// Max handlers
	}
	this.__worker.postMessage(op);
}

OperationController.prototype = {
	__operations : [],
	
	/** @param {Operation} op */
	/** @returns {Void} */
	dispatchOperation : function(op, callback){		// This dispatches Operations into an Operation Dispatcher
		if(this.canDispatch(op)){
			this.__worker.postMessage(op);	
		}
	},
	
	/** @private */
	/** @param {Jet.IO.OperationRequest} request */
	/** @returns {Void} */
	_requestDispatch : function(request){				// This routes messages to other Operation Controllers
		// Here we need to route each
	},
	
	/** @param {Operation} op */
	/** @returns {Boolean} */
	canDispatch : function(op){
		return (this.__operations[ op.resource ] != undefined);
	}
}