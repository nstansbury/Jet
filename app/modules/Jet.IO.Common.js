
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
	
	/** @returns {Jet.IO.OperationActions} */
	action : Jet.IO.OperationActions.Get,
	
	/** @returns {Object} */
	object : null,

	
	/** @returns {Void} */
	register : function register(){},
	
	/** @param {OperationRequest} */
	/** @returns {Void} */
	dispatch : function dispatch(op){}
}

Jet.IO.DispatchRequest = {
	
	/** @type {String} */
	id : "",
	
	/** @type {[Operation]} */
	operations : []
}

Jet.IO.OperationRequests = {
	__timestamp : Date.now(),
	
	__requests : {},
	
	/** @param {Jet.IO.OperationRequest} request */
	/** @returns {Jet.IO.OperationRequest} */
	add : function(request){
		var newRequest = this.createRequest(request.operations);
		this.__requests[ newRequest.id ] = request;
		return newRequest;
	},
	
	/** @param {Jet.IO.OperationRequest} request */
	/** @returns {Jet.IO.OperationRequest} */
	remove : function(request){
		var oldRequest = __requests[ request.id ];
		oldRequest.operations = request.operations
		return oldRequest;
	},
	
	/** @param {[Operation]} operations */
	/** @returns {Jet.IO.OperationRequest} */
	createRequest : function createRequest(operations){
		return {
			id : (this.__timestamp++),
			operations : Array.isArray(operations) ? operations : [ operations ]
		};
	},
	
	/** @param {Jet.IO.OperationRequest} request */
	/** @returns {Boolean} */
	hasRequest : function(request){
		return this.__requests[ request.id ] ? true : false;
	}
}