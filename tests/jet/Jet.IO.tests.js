

var onmessage = function(){}

var EXPORTED_SYMBOLS = ["testOperation1", "testOperation2"];

var testOperation1 = {
	resource : "test://operations/1",
	
	action : Jet.IO.OperationActions.Get,
	
	dispatchType : Jet.IO.OperationDispatchTypes.Slave,
	
	register : function(){},
	
	dispatch : function(){
		
	}
	
}

var testOperation2 = {
	resource : "test://operations/2",
	
	action : Jet.IO.OperationActions.Get,
	
	dispatchType : Jet.IO.OperationDispatchTypes.Slave,
	
	register : function(){},
	
	dispatch : function(){
		
	}
	
}