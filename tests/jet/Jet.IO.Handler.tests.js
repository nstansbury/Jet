SCENARIO.Criteria = {
	"A Jet.IO.OperationHandler" : function(scenario){
		return Jet.IO.OperationHandler;
	},
	
	"a putHandlerOperations request" : function(){
		var putHandlerOperations = {
			resource : "jet://io/operations",
			action : Jet.IO.OperationActions.Put,
			object : "file.js"
		}
		var request = {
			operations : [putHandlerOperations]
		}
		return request;
	},
	
	"a putHandlerOperations is sent" : function(scenario){
		var request = scenario.The("a putHandlerOperations request");
		function callback(request){
			scenario.Assert("a response is received", request);
		}
		scenario.postMessage(request, callback);
		scenario.Idle();
		return true;
	},
	
	"an invalid putHandlerOperations is sent" : function(scenario){
		var request = scenario.The("a putHandlerOperations request");
		function callback(request){
			scenario.Assert("a response is received", request);
		}
		importScripts = function importScripts(script){
			throw "A Script Error";
		}
		scenario.postMessage(request, callback);
		return true;
	},
	
	"a response is received" : function(){
		return this.result;
	},
	
	"it has a status of 200" : function(scenario){
		var operation = scenario.The("a response is received").operations[0];
		return operation.status == 200;
	},
	
	"it has a status of 500" : function(scenario){
		var operation = scenario.The("a response is received").operations[0];
		return operation.status == 500;
	}
}


SCENARIO("When a Jet.IO.OperationHandler is initialised successfully it posts a status 200").
	GIVEN("A Jet.IO.OperationHandler").
		AND("a putHandlerOperations request").
			WHEN("a putHandlerOperations is sent").
				AND("a response is received").
					THEN("it has a status of 200").
END();


SCENARIO("When a Jet.IO.OperationHandler is NOT initialised successfully it posts a status 500").
	GIVEN("A Jet.IO.OperationHandler").
		AND("a putHandlerOperations request").
			WHEN("an invalid putHandlerOperations is sent").
				AND("a response is received").
					THEN("it has a status of 500").
END();
/*
SCENARIO("When a Jet.IO.OperationHandler is initialised it can return its list of operation delegates").
	GIVEN("A Jet.IO.OperationHandler").
		AND("A Jet.IO.OperationRequest for its operations").
			WHEN("it is initialised").
				THEN("It posts an array of its operations").
END();


SCENARIO("When an operation calls dispatchOperation() then a new request is dispatched through postMessage()").
	GIVEN("A Jet.IO.OperationHandler").
		WHEN("it is initialised").
			AND("dispatchOperation() is called").
				THEN("it dispatches a new Request through postMessage()").
END();

*/
