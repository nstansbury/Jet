/*
 *	CommandController.js
 *		This file is loaded into the CommandController worker thread
 *		The CommandController maintains a stack of CommandHandlers and
 *		Marshals command messages in and out of them
 *
 */


CommandController = {
	handlers : [],
	
	raiseEvent : function raiseEvent(e){	// This routes messages to other CommandControllers
		
	},
	
	dispatchCommand : function(data){		// This dispatches messages from other CommandControllers
		
	},
	
	hasCommand : function(cmd){
		
	},
	
	// Tell the controller where it's commandHandler is and how many it should create
	init : function(e){
		var handler = new CommandHandler("myCommands.js");
		this.handlers.push(handler);
		
		self.onmessage = function(e){CommandController.dispatchCommand(e);};
	}
}


self.onmessage = CommandController.init;

function CommandHandler(commandFile) {
	this.worker = new Worker("CommandHandler.js, " +commandFile);
}
CommandHandler.prototype = {
	dispatchCommand : function(data){
		
	},
	
	terminate : function(){
		
	}
}