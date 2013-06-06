"use strict";

let EXPORTED_SYMBOLS = ["register", "unregister", "Controller", "DispatchTypes", "RequestMethods", "Message", "Headers", "Queue"];


if(Components != undefined){	// Which it will be if we're being imported into a web worker
	Components.utils.import("resource://Jet/Core.jsm");
	ImportNS("Jet.DOM", this, true);
	ImportNS("Jet.Messaging.Controller");
}
else {
	importScripts("Jet")
	if(Jet == undefined){
		var Jet = {
			Messaging : {}
		};
	}
	for(var i = 0; i < EXPORTED_SYMBOLS.length; i++){
		var symbol = EXPORTED_SYMBOLS[i];
		Jet.Messaging[symbol] = this[symbol];
	}
	
	onmessage = function(e){
		Jet.Messaging.Controller.requestDispatch(e.data);
	}
}





var Controller = {
	/** @type {Jet.Messaging.Queue} */
	messages : new Queue(),
	
	/** @type {Jet.Messaging.Queue} */
	dispatchers : new Queue(),

	/** @param {String} resource */
	/** @param {String} handler */
	/** @param {Integer} threads */
	/** @returns {Void} */
	register : function(resource, handler, numThreads){
		for(var i = 0; i < numThreads; i++){
			var dispatcher = this.createDispatcher(handler);
		}
		
	},

	/** @param {String} resource */
	/** @returns {Void} */
	unregister : function(resource){
	
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
	
	getDispatcher : function(){
		
	},
	
	/** @param {Jet.Messaging.Message} message */
	/** @returns {Void} */
	requestDispatch : function(message){
		// Can we dispatch this resource?
		// Get a dispatcher
		// Or queue it on it's message queue
	}
}



var DispatchTypes = {
	Master : 0x0,
	Worker : 0x1,
	Slave : 0x2
}

var RequestMethods = { 
	Signal : 0x0,
	Get : 0x1,
	Head : 0x2,
	Post : 0x3,
	Put : 0x4,
	Delete : 0x5,
	Trace : 0x6,
	Options : 0x7,
	Connect : 0x8,
	Patch : 0x9
}

var Message = {
	/** @type{String} */
	version : "",
	
	/** @type {Jet.Messaging.RequestMethods} */
	method : null,
	
	/** @type{String} */
	resource : "",
	
	/** @type{Object} */
	headers : {},
	
	/** @type{String} */
	content : "",
	
	/** @type{String} */
	status : 0x0
}



var Headers = {
	get : function(name){
		
	},
	
	set : function(name, value){
		
	}
}


/** @constructor */
function Queue()	{
	this.clear();
}
Queue.prototype = {
	queue : function(item)	{
		var tail = {
			next : null,
			prev : null,
			item : null
		}
		tail.item = item;	// Just don't ask why - but the destructuring assignment fails if the item property is set on the object initialisation!!
		
		[this.tail, tail] = [tail, this.tail];
		if(tail)	{
			this.tail.prev = tail;
			tail.next = this.tail;
		}
		else {
			this.head = this.tail;	
		}
	},
	
	dequeue : function()	{
		if(this.head){
			var head = this.head.next;
			[this.head, head] = [head, this.head]
			if(!this.head)	{
				this.tail = null;
			}
			head.prev = head.next = null;
			return head.item;	
		}
		return null;
	},
	
	peek : function(){
		return this.head;
	},
	
	clear : function()	{
		this.head = this.tail = null;
	}
}

