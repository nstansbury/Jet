	let EXPORTED_SYMBOLS = [];

	Components.utils.import("resource://jet/base.jsm");
	
	ImportNS("Jet", this);
	ImportNS("Jester", this);
	
	// www.jetjs.com/jester?t=path_to_testfile.js
	var jetTestSuite = "resource://tests/jet/all.js";
	
	Jester.onRunReady = function()	{
		Trace("_____onRunReady");
		Jester.load(jetTestSuite);
	}
	
	Jester.onRunComplete = function(results)		{
		//WriteFile(results, "D:\\Dev\\out.xml");
		Trace("_____onRunComplete");
		Jet.stop();
	}
	
	Jester.start();
	
	
	