let EXPORTED_SYMBOLS = ["CommandController", "CommandHandler", "Command", "CommandTypes"];

/*
	EndpointService
		Master
			CommandControllerProxy
				Worker
					CommandController
					CommandHandlerProxy
						Slave
							CommandHandler
	
	Dispatch concrete commands?
	
	var cmd = new Command(url, callback);
	cmd.params[ "prop" ] = x;
	
	Controller.dispatchCommand([cmd, cmd]);
	
	Command
		id
		type
		messageId
		params
		
		
	We must remain RESTful otherwise the Command pattern breaks and this is just RPC
	
*/

/** @param {String} commandfile */
/** @returns {CommandControllerProxy} */
function CommandControllerProxy(commandfile){
	var self = this;
	this.__worker = new Worker("CommandController.js");
	this.__worker.onmessage = function(e){self.raiseEvent(e);};
}
CommandControllerProxy.prototype = {
	__worker : null,
	
	__stack : {},
	
	/** @param {Command} command */
	/** @param {Function} callback */
	/** @returns {Void} */
	dispatchCommand : function(command, callback){		// This dispatches messages from other CommandControllers
		this.__stack[ command.id ] = command;
		this.__worker.postMessage(command.toMessage());
	},
	
	/** @param {MessageEvent} e */
	/** @returns {Void} */
	raiseEvent : function raiseEvent(e){			// This routes messages to other CommandControllers
		// NB. We're running on the Master thread here!
		
	},
	
	/** @param {String} cmd */
	/** @returns {Boolean} */
	hasCommand : function(cmd){
		
	}
}


function CommandController(file){
	this.worker = new Worker("CommandController.js");
}

CommandController.prototype = {
	raiseEvent : function raiseEvent(e){			// This routes messages to other CommandControllers
		
	},
	
	dispatchCommand : function(data, callback){		// This dispatches messages from other CommandControllers
		this.worker.postMessage(data);
	},
	
	hasCommand : function(cmd){
		
	}
}

CommandTypes = {
	Master : 0x0,
	Worker : 0x1,
	Slave : 0x2
}

CommandHandler = {
	callstack : [],
	
	commands : {
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
	},
	
	dispatchCommand : function(data, callback, async){
		if(callback){
			onmessage = function asyncHandler(e){
				onmessage = dispatchCommand;		// We should check someone hasn't tried to dispatch a new command into a handler waiting for an async result
				callback(e.data);
			}
		}
			
		var command = this.commands[ data.url ];
		if(command && command.type == CommandTypes.Worker){		// This handler can dispatch command
			return command.dispatch(data, callback);
		}
		else {													// Not a command in this handler - post it to controller
			postMessage(data);
			return false;
		}
	}
}

function dispatchCommand(e){
	CommandHandler.dispatchCommand(e.data)
}

onmessage = dispatchCommand;


Command = {
	/** @type {Jet.Commands.CommandTypes} */
	type : null,
	
	/** @returns {Boolean} */
	register : function(){},
	
	/** @param {Object} data */
	/** @param {Function} [callback] */
	/** @returns {Boolean} */
	dispatch : function(data, callback){}
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
