SCENARIO.require("criteria.js");

SCENARIO("When a Jet.IO.OperationHandler is initialised successfully it posts a status 200").
	GIVEN("A Jet.IO.OperationHandler").
		AND("Initialisation Operation").
			WHEN("a valid Jet.IO.Operation is sent").
				THEN("It posts a status 200 response").
END();

SCENARIO("When a Jet.IO.OperationHandler is NOT initialised successfully it posts a status 500").
	GIVEN("A Jet.IO.OperationHandler").
		AND("an initialisation Operation").
			WHEN("an invalid Jet.IO.Operation is sent").
				THEN("It posts a status 500 response").
END();

SCENARIO("When a Jet.IO.OperationHandler is initialised it can return its list of operation delegates").
	GIVEN("A Jet.IO.OperationHandler").
		AND("A Jet.IO.OperationRequest for its operations").
			WHEN("it is initialised").
				THEN("It posts an array of its operations").
END();


/*
var importScriptsScript = null;
function importScripts(script){importScriptsScript = script;}

var postMessageData = null;
function postMessage(data){postMessageData = data;}

var operations = {
	resource : "test://operations",
	action : "SomeTestAction",
	object : "SomeTestObject"
}

var operation1 = {
	resource : "test://operations/1",
	action : "SomeTestAction1",
	object : "SomeTestObject1"
}

var operation2 = {
	resource : "test://operations/2",
	action : "SomeTestAction2",
	object : "SomeTestObject2"
}


describe("Jet.IO.OperationHandler: ", function() {
	
	describe("WHEN Jet.IO.OperationHandler is initialised: ", function() {
		
		it("AND the handler script executes incorrectly THEN it posts a Status 500", function() {
			
			window.importScripts = function importScripts(script){throw("Error in Script");};
			
			onmessage.call(window, {data : operations});
			
			runs(function(){
				expect(postMessageData.status).toEqual(500);
			})
			
		});
			
		it("AND the handler script executes correctly THEN it posts a Status 200", function() {
			
			window.importScripts = function importScripts(script){};
			
			onmessage.call(window, {data : operations});
			
			runs(function(){
				expect(postMessageData.status).toEqual(200);
			})
		});
		
		it("AND the handler script executes correctly THEN the handler defines its getHandlerOperations delegate", function() {
			
			runs(function(){
				var delegate = Jet.IO.OperationHandler.getOperation(getHandlerOperations);
				expect(delegate.resource).toEqual(operations.resource);
			})
			
		});
		
		it("AND the handler script executes correctly THEN the handler defines its script operation delegates", function() {
			
			runs(function(){
				var delegate1 = Jet.IO.OperationHandler.getOperation(operation1);
				expect(delegate1.resource).toEqual(operation1.resource);
				
				var delegate2 = Jet.IO.OperationHandler.getOperation(operation2);
				expect(delegate2.resource).toEqual(operation2.resource);
			})
			
		});
	
	});
	
	it("WHEN .dispatchOperation() is called THEN a new Jet.IO.OperationRequest is dispatched through postMessage()", function() {
		var request = null;
		window.postMessage = function postMessage(data){request = data;}
		
		function oncomplete(){}
		Jet.IO.OperationHandler.dispatchOperation(operations, oncomplete);
		
		runs(function(){
			expect(Jet.IO.Requests.hasRequest(request)).toEqual(true);
		})
	});
	
	it("WHEN Jet.IO.OperationHandler is called THEN a new Jet.IO.OperationRequest is dispatched through postMessage()", function() {

	});
	
});

*/