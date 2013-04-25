SCENARIO.Criteria = {
	"A Jet.IO.OperationHandler" : function(scenario){
		scenario.Idle();
		return Jet.IO.OperationHandler;
	},
	
	"a putHandlerOperations request" : function(){
		var putHandlerOperations = new Jet.IO.Operation("jet://io/operations", Jet.IO.OperationActions.Put);
		putHandlerOperations.object = "file.js";
		
		return new Jet.IO.OperationRequest(putHandlerOperations);
	},
	
	"a getHandlerOperations request" : function(){
		var getHandlerOperations = new Jet.IO.Operation("jet://io/operations", Jet.IO.OperationActions.Get);
		getHandlerOperations.object = "file.js";
		
		return new Jet.IO.OperationRequest(getHandlerOperations);
	},
	
	"an invalid putHandlerOperations is sent" : function(scenario){
		var request = scenario.Get("a putHandlerOperations request");
		function callback(request){
			importScripts = restore;
			scenario.Assert("a response is received", request);
		}
		var restore = importScripts;
		importScripts = function importScripts(script){
			throw "A Script Error";
		}
		scenario.postMessage(request, callback);
		return true;
	},
	
	"a putHandlerOperations is sent" : function(scenario){
		var request = scenario.Get("a putHandlerOperations request");
		function callback(request){
			scenario.Assert("a response is received", request);
		}
		scenario.postMessage(request, callback);
		return true;
	},
	
	"a getHandlerOperations is sent" : function(scenario){
		var request = scenario.Get("a getHandlerOperations request");
		function callback(request){
			scenario.Assert("a response is received", request);
		}
		scenario.postMessage(request, callback);
		return true;
	},
	
	"a response is received" : function(){
		return this.result;
	},
	
	"it has a status of 200" : function(scenario){
		var operation = scenario.Get("a response is received").operation;
		return operation.status == 200;
	},
	
	"it has a status of 500" : function(scenario){
		var operation = scenario.Get("a response is received").operation;
		return operation.status == 500;
	},
	
	"it returns its operations" : function(scenario){
		var operation = scenario.Get("a response is received").operation;
		return Array.isArray(operation.object) && operation.object.length > 2;
	}
}


SCENARIO("When a Jet.IO.OperationHandler is NOT initialised successfully it posts a status 500").
	GIVEN("A Jet.IO.OperationHandler").
		AND("a putHandlerOperations request").
			WHEN("an invalid putHandlerOperations is sent").
				AND("a response is received").
					THEN("it has a status of 500").
END();


SCENARIO("When a Jet.IO.OperationHandler is initialised successfully it posts a status 200").
	GIVEN("A Jet.IO.OperationHandler").
		AND("a putHandlerOperations request").
			WHEN("a putHandlerOperations is sent").
				AND("a response is received").
					THEN("it has a status of 200").
END();


SCENARIO("When a Jet.IO.OperationHandler is initialised it can return its list of operation delegates").
	GIVEN("A Jet.IO.OperationHandler").
		AND("a getHandlerOperations request").
			WHEN("a getHandlerOperations is sent").
				AND("a response is received").
					THEN("it returns its operations").
END();


SCENARIO("When a Jet.IO.OperationHandler dispatches a command to another handler, it receives a response back and execute its callbacks").
END();