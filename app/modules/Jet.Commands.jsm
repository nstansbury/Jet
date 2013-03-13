let EXPORTED_SYMBOLS = ["CommandController", "CommandHandler", "Command", "CommandTypes"];

/*
	The Command Controller maintains one or more Command Handlers
	And routes Command requests to the correct Command Handler
	Each Command Handler invokes its' Commands in its' own thread context
	The Controller queues Command requests when all its' handlers are busy
*/



function CommandController(file){
	var worker = new Worker("Jet.Commands.js");
	worker.onmessage = this.raiseEvent;
	worker.postMessage("jet://register" +file);
}
CommandController.prototype = {
	raiseEvent : function raiseEvent(e){
		
	}
}

CommandHandler = {
	
	commands : {
		"jet://register" : registerCommands
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
	
	dispatchCommand : function(e){
		var result = this.commands[ cmd ].dispatch(e);
		postMessage(result);
	}
}

CommandTypes = {
	Master : 0x0,
	Worker : 0x1,
	Slave : 0x2
}

registerCommands = {
	type : CommandHandler.CommandTypes.Worker,
	
	register : function(){
		return "jet://register";
	},
	
	dispatch : function(e){
		CommandHandler.registerCommands(e);
	}
}

onmessage = function(e){CommandHandler.dispatchCommand(e)};