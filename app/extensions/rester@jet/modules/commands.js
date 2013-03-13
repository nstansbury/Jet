let EXPORTED_SYMBOLS = ["cmdCommand1", "cmdCommand2", "cmdCommand3"];


cmdCommand1 = {
	type : CommandHandler.CommandTypes.Worker,
	
	register : function(){
		return "jet://command1";
	},
	
	dispatch : function(e){
		// Do Something
		var result = true;
		return result;
	}
}