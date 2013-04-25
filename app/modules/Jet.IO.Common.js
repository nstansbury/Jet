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


/** @param {String} resource */
/** @param {Jet.IO.OperationActions} action */
/** @constructor */
Jet.IO.Operation = function Operation(resource, action){
	this.resource = resource;
	this.action = action || Jet.IO.OperationActions.Get;
}
Jet.IO.Operation.prototype = {
	/** @type {String} */
	resource : "",
	
	/** @type {Jet.IO.OperationActions} */
	action : Jet.IO.OperationActions.Get,
	
	/** @type {Object} */
	object : null,

	/** @type {Number} */
	status : 0,
}

Jet.IO.OperationDelegate = {
	__proto__ : Jet.IO.Operation.prototype,
	
	/** @type {Jet.IO.OperationDispatchTypes} */
	dispatchType : Jet.IO.OperationDispatchTypes.Slave,
	
	/** @returns {Void} */
	register : function register(){},
	
	/** @param {OperationRequest} request */
	/** @returns {Void} */
	dispatch : function dispatch(request){}
}


Jet.IO.Operations = {
	__stack : [],
	__table : {},
	
	/** @param {Jet.IO.Operation} operation */
	/** @returns {Jet.IO.Operation} */
	get: function get(operation){
		return this.__table[operation.resource][operation.action];
	},
	
	/** @param {Jet.IO.Operation} operation */
	/** @returns {Void} */
	add: function add(operation){
		if(this.__table[operation.resource] == undefined){
			this.__table[operation.resource] = {};
		}
		this.__stack.push(operation);
		this.__table[operation.resource][operation.action] = operation;
	},
	
	/** @param {Jet.IO.Operation} operation */
	/** @returns {Void} */
	remove: function(operation){
		var index = this.__table[operation.resource][operation.action];
		if(index){		
			for(var i = 0; i < this.__stack.length; i++){
				var op = this.__stack[i];
				if(op.resource == operation.resource && op.action == operation.action){
					this.__stack.splice(i, 1);
					delete this.__table[operation.resource][operation.action];
					return;
				}
			}
		}
	},
	
	/** @returns {Void} */
	clear: function(){
		this.__table = {};
		this.__stack = [];
	},
	
	/** @returns {Jet.IO.Enumerator} */
	getEnumerator : function(){
		return new Jet.IO.Enumerator(this.__stack);
	}
}

Jet.IO.OperationRequest = function OperationRequest(operation){
	return {
		id : Jet.IO.OperationRequest.uniqueId++,
		operation : operation
	}
}
Jet.IO.OperationRequest.uniqueId = Date.now(),	// Saves us Date.now()ing for every new request

Jet.IO.OperationRequest.prototype = {
	
	/** @type {Number} */
	id : 0,
	
	/** @type {Jet.IO.Operation} */
	operation : null
}


Jet.IO.Requests = {
	
	_requests : {},
	
	/** @param {Jet.IO.Operation} operation */
	/** @param {Function} oncomplete */
	/** @returns {Jet.IO.OperationRequest} */
	createRequest : function newRequest(operation, oncomplete){
		var request = new Jet.IO.OperationRequest(operation);
		this._requests[ request.id ] = {
			original : null,
			operation : operation,
			oncomplete : oncomplete
		}
		return request;
	},
	
	/** @param {Jet.IO.OperationRequest} request */
	/** @param {Function} oncomplete */
	/** @returns {Jet.IO.OperationRequest} */
	appendRequest : function appendRequest(request, oncomplete){
		var newRequest = new Jet.IO.OperationRequest(request.operation);
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
		if(envelope.original == null){		// The original source request - not appended
			envelope.oncomplete(envelope.operation);
		}
		else {
			envelope.oncomplete.call(envelope.original, envelope.original);	
		}
	},
	
	/** @param {Jet.IO.OperationRequest} request */
	/** @returns {Void} */
	cancelRequest : function cancelRequest(request){
		var envelope = this._requests[ request.id ];
		delete this._requests[ request.id ];
		if(request.original == null){
			envelope.oncomplete(null);
		}
		else {
			envelope.oncomplete.call(envelope.original, null);	
		}
	},
}


/** @constructor */
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

/** @param {Array|Object} enumerable */
/** @constructor */
Jet.IO.Enumerator = function Enumerator(enumerable){
	this.__array = enumerable || [];
    this.__index = 0;
}
Jet.IO.Enumerator.prototype = {
	/** @returns {Boolean} */
	isEmpty: function(){ return (this.__array.length > 0) ? true : false; },
	/** @returns {Boolean} */
    hasMore: function() { return this.__index < this.__array.length; },
	/** @returns {Object} */
    getNext: function () { return ( this.__index < this.__array.length ) ? this.__array[this.__index++] : null; }
}