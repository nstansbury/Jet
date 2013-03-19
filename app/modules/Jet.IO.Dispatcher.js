
importScripts("Jet.IO.Common.js");

Jet.IO.OperationDispatcher = {
	
	__handlers : [],
	
	__opqueue : [],
	
	__requests : Jet.IO.OperationRequests,
	
	/** @returns {Jet.IO.OperationRequests} */
	get requests(){
		return this.__requests;
	},
	
	/** @param {String} file */
	/** @returns {Void} */
	createHandler : function(file){
		var dispatcher = this;
		var handler = new Jet.IO.OperationHandler(file);
		handler.onready = function(){
			// When a Handler becomes ready give it some work or re-queue it
			if(dispatcher.__opqueue.length){
				handler.dispatchOperation(dispatcher.__opqueue.pop());
			}
			else {
				this.__handlers.push(handler);	
			}
		}
	},
	
	/** @param {Jet.IO.OperationRequest} request */
	/** @returns {Void} */
	dispatchRequest : function(request){		// This dispatches Operation requests into an Operation Handler
		if(this.__handlers.length){
			this.__handlers.pop().dispatchRequest(request);
		}
		else {
			// We have no Handler available
			this.__opqueue.push(request);
		}
	},
	
	/** @param {Jet.IO.OperationRequest} request */
	/** @returns {Void} */
	requestDispatch : function(request){
		// A new request bubbling up must have affinity for a handler - unless action is Signal
		
		/*	If this is a new request (not in the queue)
				Wrap it and store it in the request queue
					If we canDispatch()
						Dispatch the wrapped request to another handler
					Else
						postMessage(request) to controller
			Else
				This is a request response
					Unwrap the request from the queue
					If we canDispatch()
						It must go back to the same handler that dispatched it
					Else
						postMessage(request)
		*/
				
		if(this.canDispatch(op)){
			this.dispatchRequest(op);
		}
		else {
			// We can't handle this operation request so post to parent Controller
			postMessage(op);	
		}
	},
	
	/** @param {Operation} op */
	/** @returns {Boolean} */
	canDispatch : function(op){
		return false;
	}
}

onmessage = function(e){
	var op = e.data;
	// Create an OperationHandler for each slave thread
	for(var i = 0; i < op.object; i++){
		Jet.IO.OperationDispatcher.createHandler(op.resource);
	}
	onmessage = function(e){
		Jet.IO.OperationDispatcher.dispatchRequest(e.data);
	}
	
	
	// GET the handlers' operations
	var op = {
		resource : file,
		action : Jet.IO.OperationActions.Get,
		object : null,
	}
	Jet.IO.OperationDispatcher.dispatchOperation(op);
}


Jet.IO.OperationHandler = function OperationHandler(file){
	var handler = this;
	function onrequest(e){
		handler.requestDispatch(e.data);
	}
	this.__worker = new Worker("../../app/modules/Jet.IO.Handler.js");
	
	// We post a message into the delegate Operation Handler to initialise itself & its operations
	// When we receive a success status back the handler is ready to use
	this.__worker.onmessage = function(e){
		var op = e.data;
		if(op.status == 200){
			handler.__worker.onmessage = onrequest;
			handler.isReady = true;
		}
		else {
			// Do something when the handler fails
		}
	}
	
	var op = {
		resource : file,
		action : Jet.IO.OperationActions.Put,
		object : null,
	}
	// Handler isn't ready yet so we post into it directly
	this.__worker.postMessage(op);
}
Jet.IO.OperationHandler.prototype = {
	__isReady : false,
	
	/** @param {Boolean} */
	set isReady(value){
		this.__isReady = value;
		if(value){
			this.onready();	// Fire the onready listener
		}
	},
	
	/** @returns {Boolean} */
	get isReady(){
		return this.__isReady;
	},
	
	onready : function(){},
	
	/** @param {Jet.IO.OperationRequest} request */
	/** @returns {Void} */
	dispatchRequest : function(request){		// This dispatches Operation requests into the delegate Operation Handler
		this.isReady = false;
		this.__worker.postMessage(request);	
	},
	
	/** @param {Jet.IO.OperationRequest} request */
	/** @returns {Void} */
	requestDispatch : function(request){
		if(request == null){
			this.isReady = true;
			return;
		}
		Jet.IO.OperationDispatcher.requestDispatch(request)
	},
}