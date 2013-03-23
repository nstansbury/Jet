
describe("Jet.IO.Handler: ", function() {
	
	var operations = {
		resource : "test://operations",
		action : "SomeTestAction",
		object : "SomeTestObject"
	}
	
	var operation1 = {
		resource : "test://operations",
		action : "SomeTestAction",
		object : "SomeTestObject"
	}
		
	it("WHEN a request to start a Jet.IO.OperationHandler THEN the handler loads its base script", function() {
		
		
		var e = {
			data : operations
		}
		
		onmessage.call(window, e);
		
		runs(function(){
			expect(importedScripts).toEqual(operations.resource);
		})
		
	});
	
	it("WHEN a request to start a Jet.IO.OperationHandler THEN the handler loads its getHandlerOperations delegate", function() {
		
		runs(function(){
			var delegate = Jet.IO.OperationHandler.getOperation(operations);
			expect(delegate.resource).toEqual(operations.resource);
		})
		
	});
});