Master
	OperationController
		Worker
			OperationControllerDelegate
			OperationHandler
				Slave
					OperationHandlerDelegate
						Operation

Operation
	resource
	action
	object
	
	oncomplete()

//---------------------------------------------------------------
function OperationController(file){
	this.__worker = new Worker("OperationControllerDelegate.js");
	this.__worker.onessage = function(e){			// This routes messages to other OperationControllers
		var operation = e.data;
		
	}
	var op = {
		resource : file,
		action : "GET",
		object : 5		// Max handlers
	}
	this.__worker.postMessage(op);
}

OperationController.prototype = {
	
	/** @param {Operation} op */
	/** @returns {Void} */
	dispatchOperation : function(op, callback){		// This dispatches Operations into an OperationControllerDelegate
		if(this.canDispatch(op)){
			this.__worker.postMessage(op);	
		}
	},
	
	/** @param {Operation} op */
	/** @returns {Boolean} */
	canDispatch : function(op){
		
	}
}
//---------------------------------------------------------------


//--------------------------------------------------------------- OperationControllerDelegate.js
OperationControllerDelegate = {
	__handlers : [],
	
	__opqueue : [],
	
	createHandler : function(file){
		var oh = new OperationHandler(this, file);
		this.__handlers.push(oh);
	},
	
	/** @param {Operation} op */
	/** @returns {Void} */
	dispatchOperation : function(op){		// This dispatches Operations into an OperationHandler
		if(this.__handlers.length){
			this.__handlers.pop().dispatchOperation(op);
		}
		else {
			this.__opqueue.push(op);
		}
	},
	
	requestOperation : function(op){
		
	},
	
	/** @param {Operation} op */
	/** @returns {Boolean} */
	canDispatch : function(op){
		
	}
}

onmessage = function(e){
	var op = e.data;
	// Create an OperationHandler for each slave thread
	for(var i = 0; i < op.object; i++){
		OperationControllerDelegate.createHandler(op.resource);
	}
	self.onmessage = function(e){OperationControllerDelegate.dispatchOperation(e.data);}
}


function OperationHandler(controller, file){
	this.__worker = new Worker("OperationHandlerDelegate.js");
	this.__worker.onessage = function(e){controller.requestOperation(e.data)};		// This recieves messages from OperationHandlerDelegates
	var op = {
		resource : file,
		action : "GET",
		object : null,
	}
	this.dispatchOperation(op);
}
OperationHandler.prototype = {
	/** @param {Operation} op */
	/** @returns {Void} */
	dispatchOperation : function(op){		// This dispatches Operations into an OperationHandlerDelegate
		this.__worker.postMessage(op);	
	},
}
//---------------------------------------------------------------


//--------------------------------------------------------------- OperationHandlerDelegate.js

OperationHandlerDelegate = {
	__operations : [],
	
	/** @param {Operation} op */
	/** @returns {Void} */
	dispatchOperation : function(op){	// This ensures any operations dispatched in this thread remain asychronous
		self.postMessage(op);	
	},
	
	requestOperation : function(op){
		// Dispatch a concrete operation object
		concreteOperation.dispatch(op);
	},
}

onmessage = function(e){
	importScripts(e.data.resource);
	self.onmessage = function(e){
		OperationHandlerDelegate.requestOperation(e.data);
		OperationHandlerDelegate.dispatchOperation("FREE");
	}
}

//---------------------------------------------------------------

OperationDispatchTypes = {
	Master : 0x0,
	Worker : 0x1,
	Slave : 0x2
}

OperationHandler = {
	callstack : [],
	
	operation : {
		"jet://commands/register" : registerCommands
	},
	
	registerCommands : function(e){
		importScripts(e.data);
		for(var i = 0; i < EXPORTED_SYMBOLS.length; i++){
			var symbol = EXPORTED_SYMBOLS[ i ];
			var commandUri = symbol.register();
			// Must register it as a master or worker so dispatcher can run on Main or Worker thread
			postMessage("registerCommand " +commandUri);
			this.commands[ symbol ] = this[ symbol ];
		}
	}
}




Operation = {
	/** @type {Jet.IO.OperationDispatchTypes} */
	type : null,
	
	/** @returns {Boolean} */
	register : function(){},

	/** @returns {Void} */
	dispatch : function(){}
}


registerCommands = {
	type : CommandTypes.Worker,
	
	register : function(){
		return "jet://commands/register";
	},
	
	dispatch : function(e){
		CommandHandler.registerCommands(e);
	}
}