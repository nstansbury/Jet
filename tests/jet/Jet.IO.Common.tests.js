
describe("Jet.IO.Requests: ", function() {

	function oncomplete(){};
	
	it("WHEN createRequest() is called THEN a new Jet.IO.OperationRequest is created", function() {
		
		var operation = {
			resource : "some://resource/url",
			action : "SomeTestAction",
			object : "SomeTestObject"
		}
		var request = Jet.IO.Requests.createRequest(operation, oncomplete);
		
		runs(function(){
			expect(request).toBeDefined();
			expect(Jet.IO.Requests.hasRequest(request)).toEqual(true);
		})
		
	});
});

describe("Jet.IO.Queue: ", function() {
	
	var Q = new Jet.IO.Queue();
	
	it("WHEN first item is queued THEN head and tail equal each other", function() {
		
		var item = 1;
		Q.queue(item);
		
		runs(function(){
			expect(Q.head).toEqual(Q.tail);
			expect(Q.head.item).toEqual(item);
			expect(Q.tail.item).toEqual(item);
		});
		
	});
	
	it("WHEN second item is queued THEN head and tail do not equal each other", function() {
		
		var item = 2
		Q.queue(item);
		
		runs(function(){
			expect(Q.head).not.toEqual(Q.tail);
			expect(Q.head.item).not.toEqual(item);
			expect(Q.tail.item).toEqual(item);
		});
		
	});
	
	it("WHEN an item is dequeued THEN head should equal head.next", function() {
		
		var headItem = Q.head.item;
		var nextHead = Q.head.next;
		
		var item = Q.dequeue();
		
		runs(function(){
			expect(item).toEqual(headItem);
			expect(Q.head).toEqual(nextHead);
		});
		
	});
	
	it("WHEN the last item is dequeued THEN head should equal tail", function() {
		
		var head = true;
		while(head){
			head = Q.dequeue();
		}
		
		runs(function(){
			expect(Q.head).toEqual(Q.tail);
			
		});
		
	});
	
});