/*
let EXPORTED_SYMBOLS = ["cmdCommand1", "cmdCommand2", "cmdCommand3"];

cmdCommand1 = {
	type : Jet.Commands.CommandTypes.Worker,
	
	register : function(){
		return "jet://command1";
	},
	
	dispatch : function(data, callback){		
		
	}
}
*/

self.onmessage = function(e){
	var message = e.data;
	
	var kv = {};
	for(var key in e){
		kv[ key ] = "";// e[ key ];
	}
	kv.url = message.body.url;
	message.body = kv;
	self.postMessage(message);
}