EXPORTED_SYMBOLS = ["testOperationSlave1", "testOperationSlave2"];

testOperationSlave1 = {
	resource : "jet://rest/test/slave1",
	
	dispatchType : Jet.IO.OperationDispatchTypes.Slave,
	
	register : function(){
		
	},
	
	dispatch : function(e){
		
	}
	
}

testOperationSlave2 = {
	resource : "jet://rest/test/slave2",
	
	dispatchType : Jet.IO.OperationDispatchTypes.Slave,
	
	register : function(){
		
	},
	
	dispatch : function(e){
		
	}
}


testOperationMaster1 = {
	dispatchType : Jet.IO.OperationDispatchTypes.Master
	
}

testOperationMaster2 = {
	dispatchType : Jet.IO.OperationDispatchTypes.Master
	
}
