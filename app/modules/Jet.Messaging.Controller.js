"use strict";

importScripts("Jet.Messaging.jsm");


Jet.Messaging.Controller = {
	/** @type {Jet.Messaging.Queue} */
	messages : new Jet.Messaging.Queue(),
	
	/** @type {Jet.Messaging.Queue} */
	dispatchers : new Jet.Messaging.Queue(),
	
	/** @returns {Void} */
	start : function(){		
		onmessage = function(e){
			Jet.Messaging.Controller.requestDispatch(e.data);
		}
	},
	
	/** @returns {Void} */
	stop : function(){
		onmessage = null;
	},
	
	/** @param {String} file */
	/** @returns {Jet.Messaging.Dispatcher} */
	createDispatcher : function(file){
		var controller = this;
		var dispatcher = new Jet.Messaging.Dispatcher(file);
		dispatcher.onready = function(){
			// When a Dispatcher becomes ready give it some work or re-queue it
			if(Jet.Messaging.Controller.messages.peek()){
				dispatcher.dispatchRequest(controller.messages.dequeue());
			}
			else {
				controller.dispatchers.queue(dispatcher);	
			}
		}
		return dispatcher;
	},
	
	/** @param {Jet.Messaging.Message} message */
	/** @returns {Void} */
	requestDispatch : function(message){
		
	}
}

Jet.Messaging.Controller.start();


/** @param {String} file */
/** @constructor */
Jet.Messaging.Dispatcher = function Dispatcher(file){
	var dispatcher = this;
	this.__worker = new Worker(HANDLER_SCRIPT_PATH);
	this.__worker.onmessage = function(e){
		dispatcher.onmessage(e)
	};
	this.isReady = true;
}

Jet.Messaging.Dispatcher.prototype = {
	__worker : null,
	
	__isReady : false,
	
	/** @type {Number} */
	id : Date.now(),
	
	/** @type {Jet.Messaging.Queue} */
	messages : new Jet.Messaging.Queue(),
	
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
	
	/** @param {Jet.Messaging.Message} message */
	/** @returns {Void} */
	dispatchMessage : function(message){		// This dispatches Message into the Message Listener
		if(this.isReady()){
			this.isReady = false;
			this.__worker.postMessage(message);	
		}
		else {
			this.messages.queue(message);
		}	
	},
	
	/** @param {Jet.Messaging.Message} message */
	/** @returns {Void} */
	requestDispatch : function(message){
		if(message == null){			// A null message means the Dispatcher is free
			if(this.messages.peek()){
				this.dispatchMessage(this.messages.dequeue());
			}
			else {
				this.isReady = true;
			}
			return;
		}
		// NB. A new request bubbling up must have affinity for the handler requesting it - unless action is Jet.Messaging.RequestMethods.Signal
		Jet.Messaging.Controller.requestDispatch(message, this)
	},
	
	/** @param {MessageEvent} e */
	/** @returns {Void} */
	onmessage : function(e){
		this.requestDispatch(e.data);
	}
}