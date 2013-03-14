let EXPORTED_SYMBOLS = ["cmdCommand1", "cmdCommand2", "cmdCommand3"];

cmdCommand1 = {
	type : Jet.Commands.CommandTypes.Worker,
	
	register : function(){
		return "jet://command1";
	},
	
	dispatch : function(data, callback){		
		
	}
}
