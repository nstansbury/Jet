"use strict";

let EXPORTED_SYMBOLS = ["register", "unregister", "ResourceHandler", "DispatchTypes", "RequestMethods", "Message", "Headers", "Queue"];

if(Components != undefined){	// Which it will be if we're being imported into a web worker
	Components.utils.import("resource://Jet/Core.jsm");
	ImportNS("Jet.DOM", this, true);
}
else {	
	if(Jet == undefined){
		var Jet = {
			Messaging : {}
		};
	}
	for(var i = 0; i < EXPORTED_SYMBOLS.length; i++){
		var symbol = EXPORTED_SYMBOLS[i];
		Jet.Messaging[symbol] = this[symbol];
	}
}


/*	Apache <=> HTTP Service <=> ResourceHandler
	
	Master
		ResourceHandler
			Worker
				MessageController
				MessageDispatcher
					Slave
						MessageListener
						MessageHandler + Request
							register
							unregister
							execute
*/

const MESSAGE_TIMEOUT = 5000;

const CONTROLLER_SCRIPT_PATH = "../../app/modules/Jet.Messaging.Controller.js";
const HANDLER_SCRIPT_PATH = "../../app/modules/Jet.Messaging.Handler.js";

var handlers = {};

/** @param {String} resource */
/** @param {String} alias */
/** @param {Integer} count */
/** @returns {Jet.Messaging.ResourceHandler} */
function register(resource, alias, count){
	handlers[resource] = new Jet.Messaging.ResourceHandler(resource, alias, count);
	return handlers[resource];
}

/** @param {Jet.Messaging.ResourceHandler} handler */
/** @returns {Void} */
function unregister(handler){
	
}

/** @param {String} resource */
/** @param {String} path */
/** @param {Integer} count */
/** @constructor */
function ResourceHandler(resource, path, count){
	
}
ResourceHandler.prototype = {
	resource : "",
	
	path : "",
	
	numThreads : 1,
	
	beginRequest : function beginRequest(metadata, httpResponse)	{
		var handler = this;
		function timeout(){
			handler.onTimeout(metadata, httpResponse);
		}
		try{
			Trace("# Jet.Messaging :: beginRequest");
			setTimeout(timeout, MESSAGE_TIMEOUT);
			httpResponse.processAsync();
			
			// Do the thing
		}
		catch(e)	{
			Trace(e);
		}
	},
	
	endRequest : function endRequest(metadata, httpResponse, data)	{
		Trace("# Jet.Messaging :: endRequest");
		//WriteFile(results, "D:\\Dev\\out.xml");
		//httpResponse.setHeader("Content-Type", "text/xml");
		httpResponse.write(data);
		httpResponse.finish();
	},
	
	onTimeout : function onTimeout(metadata, httpResponse){
		Trace("# Jet.Messaging :: Resource Timeout");
		httpResponse.setStatusLine(metadata.httpVersion, "504", "Gateway Timeout");
		this.endRequest(metadata, httpResponse, "");
	},
	
	onError : function onerror(status){
		Trace("# Jet.Messaging :: Handler Error");
		
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