"use strict";

importScripts("Jet.IO.Common.js");

Jet.IO.Dispatcher = {
	
	/** @type {Jet.IO.Queue} */
	workToDo : new Jet.IO.Queue(),
	
	/** @type {Jet.IO.Queue} */
	handlers : new Jet.IO.Queue(),
	
	/** @param {String} file */
	/** @returns {Jet.IO.RequestHandler} */
	createHandler : function(file){
		var dispatcher = this;
		var handler = new Jet.IO.RequestHandler(file);
		handler.onready = function(){
			// When a Handler becomes ready give it some work or re-queue it
			if(dispatcher.workToDo.peek()){
				handler.dispatchRequest(dispatcher.workToDo.dequeue());
			}
			else {
				Jet.IO.Dispatcher.handlers.queue(handler);	
			}
		}
		return handler;
	},
	
	/** @param {Jet.IO.OperationRequest} request */
	/** @returns {Void} */
	dispatchRequest : function(request){		// This dispatches Operation requests into an Operation Handler
		if(this.handlers.peek()){
			this.handlers.dequeue().dispatchRequest(request);
		}
		else {
			this.workToDo.queue(request);	// We have no Handler available
		}
	},
	
	/** @param {Jet.IO.OperationRequest} request */
	/** @returns {Void} */
	requestDispatch : function(request){
		function oncomplete(request){
			postMessage(request);
		}
		if(Jet.IO.Requests.hasRequest(request)){
			Jet.IO.Requests.endRequest(request);
		}
		else {
			var newRequest = Jet.IO.Requests.appendRequest(request, oncomplete);
			var type = Jet.IO.Operations.dispatchType(request.operation);
			
			if(type == Jet.IO.OperationDispatchTypes.Slave){
				this.dispatchRequest(newRequest);
			}
			else if(type == Jet.IO.OperationDispatchTypes.Worker){
				
			}
			else {
				postMessage(newRequest);
			}
		}
	},
	
	/** @param {Jet.IO.OperationRequest} request */
	/** @returns {Boolean} */
	canDispatch : function(request){		
		var delegate = Jet.IO.Operations.get(request.operation);
		if(!delegate || delegate.dispatchType == Jet.IO.OperationDispatchTypes.Master){
			return false;
		}
		return true;
	},
	
	/** @returns {Void} */
	init : function(){
		Jet.IO.Operations.clear();
		Jet.IO.Operations.add(putHandlerOperations);
		
		onmessage = function(e){
			Jet.IO.Dispatcher.requestDispatch(e.data);
		}
	}
}

Jet.IO.Dispatcher.init();



var putHandlerOperations = {
	__proto__ : Jet.IO.OperationDelegate,
	
	resource : "jet://io/operations",
	
	action : Jet.IO.OperationActions.Put,
	
	dispatchType : Jet.IO.OperationDispatchTypes.Worker,
	
	register : function(){},
	
	dispatch : function(){
		Jet.IO.OperationHandler.init();
		
		var count = this.object.numHandlers;
		var file = this.object.script;
		for(var i = 0; i < count; i++){
			var handler = Jet.IO.Dispatcher.createHandler(file);
		}
		this.oncomplete();
	}
}

var getHandlerOperations = {
	__proto__ : Jet.IO.OperationDelegate,
		
	resource : "jet://io/operations",
	
	action : Jet.IO.OperationActions.Get,
	
	dispatchType : Jet.IO.OperationDispatchTypes.Slave,
	
	register : function(){},
	
	dispatch : function(){}
	
}


/** @param {String} file */
/** @constructor */
Jet.IO.RequestHandler = function RequestHandler(file){
	var handler = this;
	this.__worker = new Worker("../../app/modules/Jet.IO.Handler.js");
	
	// We post a message into the delegate Operation Handler to initialise itself & its operations
	// When we receive a success status back the handler is ready to use
	this.__worker.onmessage = function(e){
		var op = e.data;
		if(op.status == 200){
			handler.__worker.onmessage = function(e){handler.onmessage(e)};
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
Jet.IO.RequestHandler.prototype = {
	__worker : null,
	
	__isReady : false,
	
	/** @type {Number} */
	id : Date.now(),
	
	/** @type {Jet.IO.Queue} */
	workToDo : new Jet.IO.Queue(),
	
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
	dispatchRequest : function(request){		// This dispatches Operation requests into the Operation Handler
		if(this.isReady()){
			this.isReady = false;
			this.__worker.postMessage(request);	
		}
		else {
			this.workToDo.queue(request);
		}	
	},
	
	/** @param {Jet.IO.OperationRequest} request */
	/** @returns {Void} */
	requestDispatch : function(request){
		if(request == null){			// A null request means the Handler is free
			if(this.workToDo.peek()){
				this.dispatchRequest(this.workToDo.dequeue());
			}
			else {
				this.isReady = true;
			}
			return;
		}
		// NB. A new request bubbling up must have affinity for the handler requesting it - unless action is Jet.IO.OperationActions.Signal
		var handler = this;
		function oncomplete(request){
			handler.dispatchRequest(request);
		}
		Jet.IO.Dispatcher.requestDispatch(request, oncomplete)
	},
	
	/** @param {MessageEvent} e */
	/** @returns {Void} */
	onmessage : function(e){
		this.requestDispatch(e.data);
	}
}