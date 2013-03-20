
if(!this.Jet){
	Jet = {IO : {}};	
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

Jet.IO.DispatchRequest = {
	
	/** @type {Number} */
	id : 0,
	
	/** @type {[Operation]} */
	operations : []
}




Jet.IO.Queue = function Queue()	{
	this.clear();
}
Jet.IO.Queue.prototype = {
	queue : function(item)	{
		var tail = {
			next : null,
			prev : null,
			item : item
		}
		[this.tail] = [tail];
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
			[this.head] = [head];
		}
		else {
			[this.tail] = [head];
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
