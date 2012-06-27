var EXPORTED_SYMBOLS = [];

Components.utils.import("resource://jet/base.jsm");
//ImportNS("Jet.DOM", this);

Trace("WORKER");
function Work(doWork, workContext)	{
	this.doWork = doWork;
	this.workContext = workContext;
}
Work.prototype = {
	QueryInterface: function(iid) {
		if (iid.equals(Components.interfaces.nsIRunnable) || iid.equals(Components.interfaces.nsISupports))	{
			return this;
		}
		throw Components.results.NS_ERROR_NO_INTERFACE;
	},
	run: function() {
		Trace("Running Work");
		this.doWork(this.workContext);
	}
};


function dumpStuff()	{
	Trace("Dumping Stuff");
}

var threadManager = Components.classes["@mozilla.org/thread-manager;1"].getService();

var target1 = threadManager.currentThread;
var target2 = threadManager.newThread(0);


//target1.dispatch(new Work(dumpStuff), Components.interfaces.nsIThread.DISPATCH_NORMAL);
//target1.dispatch(new Work(dumpStuff), Components.interfaces.nsIThread.DISPATCH_NORMAL);


var worker = new ChromeWorker("file:///D:/Dev/Jet/app/modules/Jet.IO.jsm");  
	worker.addEventListener('message', function(event) {  
		Trace("Called back by the worker!\n");  
	}, false);  
  
	worker.postMessage({}); // start the worker.