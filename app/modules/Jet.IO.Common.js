"use strict";

if(!this.Jet){
	var Jet = {IO : {}};	
}

Jet.IO.OperationDispatchTypes = {
	Master : 0x0,
	Worker : 0x1,
	Slave : 0x2
}

Jet.IO.OperationActions = { 
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


Jet.IO.Operation = {
	/** @type {String} */
	resource : "",
	
	/** @type {Jet.IO.OperationActions} */
	action : Jet.IO.OperationActions.Get,
	
	/** @type {Object} */
	object : null,

	/** @type {Number} */
	status : 0,
	
	/** @returns {Void} */
	register : function register(){},
	
	/** @param {OperationRequest} */
	/** @returns {Void} */
	dispatch : function dispatch(op){}
}

Jet.IO.OperationRequest = {
	
	/** @type {Number} */
	id : 0,
	
	/** @type {[Jet.IO.Operation]} */
	operations : []
}


Jet.IO.Requests = {
	_requestid : Date.now(),	// Saves us Date.now()ing for every request
	
	_requests : {},
	
	/** @param {Jet.IO.Operation} [operations] */
	/** @param {Function} oncomplete */
	/** @returns {Jet.IO.OperationRequest} */
	createRequest : function newRequest(operations, oncomplete){
		operations = Array.isArray(operations) ? operations : [operations];
		var request = {
			id : this._requestid++,
			operations : operations
		}
		
		this._requests[ request.id ] = {
			original : null,
			operations : operations,
			oncomplete : oncomplete
		}
		return request;
	},
	
	/** @param {Jet.IO.OperationRequest} request */
	/** @param {Function} oncomplete */
	/** @returns {Jet.IO.OperationRequest} */
	appendRequest : function createRequest(request, oncomplete){
		var newRequest = {
			id : this._requestid++,
			operations : request.operations
		}
		this._requests[ newRequest.id ] = {
			original : request,
			oncomplete : oncomplete
		}
		return newRequest;
	},
	
	/** @param {Jet.IO.OperationRequest} request */
	/** @returns {Boolean} */
	hasRequest : function hasRequest(request){
		return (this._requests[ request.id ]) ? true : false;
	},
	
	/** @param {Jet.IO.OperationRequest} request */
	/** @returns {Void} */
	endRequest : function endRequest(request){
		var envelope = this._requests[ request.id ];
		delete this._requests[ request.id ];
		if(request.original == null){
			envelope.oncomplete(envelope.operations);
		}
		else {
			envelope.oncomplete.call(envelope.original, envelope.original);	
		}
	}
}


Jet.IO.Queue = function Queue()	{
	this.clear();
}
Jet.IO.Queue.prototype = {
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
		var head = this.head.next;
		if(head)	{
			[this.head, head] = [head, this.head];
			return head.item;
		}
		else {
			[this.tail, head] = [head, this.tail];
		}
		return head.item;
	},
	
	peek : function(){
		return this.head;
	},
	
	clear : function()	{
		this.head = this.tail = null;
	}
}
