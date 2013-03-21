"use strict";

/*
let EXPORTED_SYMBOLS = ["OperationController"];

Components.utils.import("resource://jet/base.jsm");

LoadScript("resource://jet/Jet.IO.Common.js", this);
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
	var controller = this;
	this.__worker = new Worker("../../app/modules/Jet.IO.Dispatcher.js");
	
	this.__worker.onmessage = function(e){console.log(e.data)}
	
	//this.__worker.onmessage = function(e){controller.onmessage(e)};
	
	// GET the handlers' operations
	var getOperations = {
		resource : file,
		action : Jet.IO.OperationActions.Get,
		object : 5		// Max handlers
	}
	controller.__operations[ file ] = getOperations;
	
	function oncomplete(operations){
		console.log(operations);
	}
	this.dispatchOperation(getOperations, oncomplete)
	
}

OperationController.prototype = {
	__operations : {},
	
	/** @param {Jet.IO.Operation} operation */
	/** @param {Function} oncomplete */
	/** @returns {Void} */
	dispatchOperation : function(operation, oncomplete){
		if(this.canDispatch(operation)){
			var request = Jet.IO.Requests.createRequest(operation, oncomplete);
			this.__worker.postMessage(request);
		}
		else {
			throw("Jet.IO.OperationController :: Operation not supported: " +operation.resource);
		}
	},
	
	/** @param {Jet.IO.OperationRequest} request */
	/** @param {Function} oncomplete */
	/** @returns {Void} */
	requestDispatch : function(request, oncomplete){
		if(Jet.IO.Requests.hasRequest(request)){
			Jet.IO.Requests.endRequest(request);
		}
		else {
			var newRequest = Jet.IO.Requests.appendRequest(request, oncomplete);
			// Forward the request to another controller
		}
	},
	
	/** @param {Jet.IO.Operation} operation */
	/** @returns {Boolean} */
	canDispatch : function(operation){
		return (this.__operations[ operation.resource ] != undefined);
	},
	
	/** @param {MessageEvent} e */
	/** @returns {Void} */
	onmessage : function(e){
		function oncomplete(request){
			postMessage(request);
		}
		this.requestDispatch(e.data, oncomplete);
	}
}