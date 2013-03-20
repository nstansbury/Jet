
importScripts("Jet.IO.Common.js");

Jet.IO.OperationDispatcher = {
	
	/** @type {Jet.IO.Queue} */
	workToDo : new Jet.IO.Queue(),
	
	/** @type {Jet.IO.Queue} */
	handlers : new Jet.IO.Queue(),
	
	/** @type {Object} */
	requests : {},
	
	/** @param {String} file */
	/** @returns {Void} */
	createHandler : function(file){
		var dispatcher = this;
		var handler = new Jet.IO.OperationHandler(file);
		handler.onready = function(){
			// When a Handler becomes ready give it some work or re-queue it
			if(dispatcher.workToDo.peek()){
				handler.dispatchOperation(dispatcher.workToDo.dequeue());
			}
			else {
				this.handlers.queue(handler);	
			}
		}
	},
	
	/** @param {Jet.IO.OperationRequest} request */
	/** @returns {Void} */
	dispatchRequest : function(request){		// This dispatches Operation requests into an Operation Handler
		if(this.handlers.peek()){
			this.handlers.dequeue().dispatchRequest(request);
		}
		else {
			// We have no Handler available
			this.workToDo.queue(request);
		}
	},
	
	/** @param {Jet.IO.OperationRequest} request */
	/** @param {Function} onrequest */
	/** @returns {Void} */
	requestDispatch : function(request, onrequest){
		if(this.requests[ request.id ] != undefined){
			var callback = this.requests[ request.id ];
			delete this.requests[ request.id ];
			callback(unwrapRequest(request));
			return;
		}
		
		request = wrapRequest(request);
		this.requests[ request.id ] = onrequest;
		
		if(this.canDispatch(request.operations[0])){
			this.dispatchRequest(request, onrequest);
		}
		else {
			postMessage(request);
		}
	},
	
	/** @param {Operation} op */
	/** @returns {Boolean} */
	canDispatch : function(op){
		return false;
	},
	
	/** @param {MessageEvent} e */
	/** @returns {Void} */
	onmessage : function(e){
		function onrequest(request){
			postMessage(request);
		}
		this.requestDispatch(e.data, onrequest);
	}
}

onmessage = function(e){
	var op = e.data;
	// Create an OperationHandler for each slave thread
	for(var i = 0; i < op.object; i++){
		Jet.IO.OperationDispatcher.createHandler(op.resource);
	}
	
	onmessage = function(e){Jet.IO.OperationDispatcher.onmessage(e)};
	
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
Jet.IO.OperationHandler.prototype = {
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
	dispatchRequest : function(request){		// This dispatches Operation requests into the delegate Operation Handler
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
		function onrequest(request){
			handler.dispatchRequest(request);
		}
		Jet.IO.OperationDispatcher.requestDispatch(request, onrequest)
	},
	
	/** @param {MessageEvent} e */
	/** @returns {Void} */
	onmessage : function(e){
		this.requestDispatch(e.data);
	}
}