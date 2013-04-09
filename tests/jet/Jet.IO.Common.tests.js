SCENARIO.Reporter = new SCENARIO.HTMLReporter();

SCENARIO.Criteria = {
	"A Jet.IO.Requests" : function(){
		return Jet.IO.Requests;
	},
	"createRequest() is called" : function(scenario){
		var operation = {
			resource : "some://resource/url",
			action : "SomeTestAction",
			object : "SomeTestObject"
		}
		function oncomplete(){};
		return scenario.Given("A Jet.IO.Requests").createRequest(operation, oncomplete);
	},
	"a new Jet.IO.OperationRequest is created" : function(scenario){
		var request = scenario.The("createRequest() is called");
		return scenario.Given("A Jet.IO.Requests").hasRequest(request);
	}
}

SCENARIO("Jet.IO.Requests.createRequest() should return a new Jet.IO.OperationRequest").
	GIVEN("A Jet.IO.Requests").
		WHEN("createRequest() is called").
			THEN("a new Jet.IO.OperationRequest is created").
END();



SCENARIO.Criteria = {
	"A Jet.IO.Queue" : function(){
		return new Jet.IO.Queue();
	},
	"the first item is queued" : function(scenario){
		var item = 1;
		scenario.Given("A Jet.IO.Queue").queue(item);
		return item;
	},
	"head and tail should equal each other" : function(scenario){
		var Q = scenario.Given("A Jet.IO.Queue");
		return Q.head == Q.tail;
	},
	"head.item should equal the new item" : function(scenario){
		var Q = scenario.Given("A Jet.IO.Queue");
		return Q.head.item == scenario.The("the first item is queued");
	}
}

SCENARIO("Jet.IO.Queue :: Given one item is queued, then the head & tail equal the same item").
	GIVEN("A Jet.IO.Queue").
		WHEN("the first item is queued").
			THEN("head and tail should equal each other").
				AND("head.item should equal the new item").
END();


SCENARIO.Criteria = {
	"A Jet.IO.Queue" : function(){
		return new Jet.IO.Queue();
	},
	"the first item is queued" : function(scenario){
		var item = 1;
		scenario.Given("A Jet.IO.Queue").queue(item);
		return item;
	},
	"a second item is queued" : function(scenario){
		var item = 2;
		scenario.Given("A Jet.IO.Queue").queue(item);
		return item;
	},
	"head and tail should not equal each other" : function(scenario){
		var Q = scenario.Given("A Jet.IO.Queue");
		return Q.head != Q.tail;
	},
	"head.item should not equal the new item" : function(scenario){
		var Q = scenario.Given("A Jet.IO.Queue");
		return Q.head.item != scenario.The("a second item is queued");
	}
}

SCENARIO("Jet.IO.Queue :: Given two items are queued, then the head & tail do not equal the same item").
	GIVEN("A Jet.IO.Queue").
		AND("the first item is queued").
			WHEN("a second item is queued").
				THEN("head and tail should not equal each other").
					AND("head.item should not equal the new item").
END();


SCENARIO.Criteria = {
	"A Jet.IO.Queue" : function(){
		return new Jet.IO.Queue();
	},
	"A next head" : function(scenario){
		var Q = scenario.Given("A Jet.IO.Queue");
		
		var item = 1;
		Q.queue(item);
		
		var item = 2;
		Q.queue(item);
		
		return Q.head.next;
	},
	"an item is dequeued" : function(scenario){
		var Q = scenario.Given("A Jet.IO.Queue");
		return Q.dequeue();
	},
	"head should equal head.next" : function(scenario){
		var Q = scenario.Given("A Jet.IO.Queue");
		var nextHead = scenario.Given("A next head");
		return Q.head == nextHead;
	}
}

SCENARIO("Jet.IO.Queue :: Given a queue with two items, after dequing one item, then the head should equal the next item").
	GIVEN("A Jet.IO.Queue").
		AND("A next head").
			WHEN("an item is dequeued").
				THEN("head should equal head.next").
END();




SCENARIO.Criteria = {
	"A Jet.IO.Queue with multiple items" : function(){
		var Q = new Jet.IO.Queue();
		
		var item = 1;
		Q.queue(item);
		
		var item = 2;
		Q.queue(item);
		
		return Q;
	},
	"the last item is dequeued" : function(scenario){
		var Q = scenario.Given("A Jet.IO.Queue with multiple items");
		
		var head = true;
		while(head){
			head = Q.dequeue();
		}
		return true;
	},
	"head should equal tail which is null" : function(scenario){
		var Q = scenario.Given("A Jet.IO.Queue with multiple items");
		return (Q.head == Q.tail) && (Q.head == null);
	}
}

SCENARIO("Jet.IO.Queue :: When the last item is dequeued, then the head and tail should equal null").
	GIVEN("A Jet.IO.Queue with multiple items").
		WHEN("the last item is dequeued").
			THEN("head should equal tail which is null").
END();