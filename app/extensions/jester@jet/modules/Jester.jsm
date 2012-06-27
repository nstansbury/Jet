let EXPORTED_SYMBOLS = ["Jester"];

Components.utils.import("resource://jet/base.jsm");


ImportNS("Jet", this);
ImportNS("Jet.Data");
ImportNS("Jet.Services");

ImportNS("Jet.DOM");
ImportNS("Jet.DOM", this);


var scope = this;

var Jester = {
	__proto__ : Jet.Services.ServiceProvider,
	
	/** @returns {Void} */
	start : function()	{
		LoadScript("resource://lib/jasmine.js", scope);
		LoadScript("resource://lib/jasmine-html.js", scope);
		LoadScript("resource://lib/jam.js", scope);
		jasmine.getEnv().addReporter(new Jester.jUnitReporter());
		
		function onRunReady()	{
			document = window.document;		// We always need to re-export the new document
			Jester.onRunReady();
		}
		window.addEventListener("DOMContentLoaded", onRunReady, false);
	},
	
	/** @returns {Void} */
	run : function()	{
		try {
			jasmine.getEnv().execute();
		}
		catch(e)	{
			var results = new Jet.Data.DataTemplate("JUnitTestResults");
			results.testsuites.push(Jet.DOM.encodeEntities(e.toString()));
			Trace("Jester run error :: "+e.toString());
			this.onRunComplete(results.toString());
		}
	},
	
	/** @param {Array} params */
	/** @returns {Void} */
	load : function(testfile)	{
		try {
			LoadScript(testfile, scope);	// The testfile has scope access to all the Jet & Jester API calls
		}
		catch(e)	{
			var results = new Jet.Data.DataTemplate("JUnitTestResults");
			results.testsuites.push(Jet.DOM.encodeEntities(e.toString()));
			Trace("Jester load error :: "+testfile +"  " +e.toString());
			this.onRunComplete(results.toString());
		}
	},
	
	onRunComplete : function(results){},
	
	onRunReady : function(){}
}



var TestResults = {
	JUnitTestResults : '<?xml version="1.0" encoding="UTF-8"?>\
								<testsuites>[testsuites]</testsuites>',
	
	JUnitTestSuite : 	'<testsuite name="{name}" timestamp="{timestamp}" hostname="{hostname}" tests="{tests}" failures="{failures}" errors="{errors}" time="{time}">\
									<properties>[properties]</properties>\
									[testcases]\
									<system-out>{stdOut}</system-out>\
									<system-err>{stdErr}</system-err>\
								</testsuite>',
	
	JUnitTestSuiteProperty : '<property>{name}</property>',
	
	JUnitTestCase :	'<testcase name="{name}" classname="{classname}" time="{time}">\
									[error][failure]\
								</testcase>',
	
	JUnitTestError :	'<error message="{message}" type="{type}"/>',
	
	JUnitTestFailure :	'<failure message="{message}" type="{type}"/>'
	
}


for(var key in TestResults)		{
	try {
		Jet.Data.TemplateFactory.importTemplate(key, TestResults[key]);
	}
	catch(e)	{
		Trace(e);	
	}
}





Jester.jUnitReporter = function jUnitReporter()	{
	this.__testResults = new Jet.Data.DataTemplate("JUnitTestResults");
}

Jester.jUnitReporter.prototype = {
	
	/** @param {Jasmine.Suite} suite */
	/** @returns {String} */
	getFullName : function(suite)	{
		var fullName = suite.description;
        for (var parent = suite.parentSuite; parent; parent = parent.parentSuite) {
			fullName = parent.description + "." + fullName;
        }
		return Jet.DOM.encodeEntities(fullName);
	},
	
	/** @param {Number} start */
	/** @returns {Number} */
	getDuration : function(start)	{
		return (Date.now() - start) / 1000;
	},
	
	/** @param {Jasmine.Spec} spec */
	/** @returns {Void} */
	reportSpecStarting : function(spec)	{
		var now = Date.now();
		if(spec.suite.startTime == null)		{		// Starting a new testsuite
			spec.suite.startTime = now;
			var testsuite = new Jet.Data.DataTemplate("JUnitTestSuite");
			testsuite.tests = 0;
			testsuite.failures = 0;
			testsuite.errors = 0;
			this.__testSuite = testsuite;
		}
		spec.startTime = now;
	},
	
	/** @param {Jasmine.Spec} spec */
	/** @returns {Void} */
	reportSpecResults : function(spec)	{
		var results = spec.results();
		
		var testcase = new Jet.Data.DataTemplate("JUnitTestCase");
		testcase.name = Jet.DOM.encodeEntities(results.description);
		testcase.classname = this.getFullName(spec.suite);		
		testcase.time = this.getDuration(spec.startTime);
		
		var resultItems = results.getItems();
		for (var i = 0; i < resultItems.length; i++) {
			var result = resultItems[i];
			if(result.type == "expect" && result.passed() == false) {
				if(!result.matcherName)	{
					var error = new Jet.Data.DataTemplate("JUnitTestError");
					error.message = Jet.DOM.encodeEntities(result.message);
					testcase.error.push(error);
					this.__testSuite.errors++;
				}
				else {
					var failure = new Jet.Data.DataTemplate("JUnitTestFailure");
					failure.message = Jet.DOM.encodeEntities(result.message);
					failure.type = result.matcherName;
					testcase.failure.push(failure);
					this.__testSuite.failures++;
				}
			}
			this.__testSuite.tests++;
		}
		this.__testSuite.testcases.push(testcase);
	},
	
	/** @param {Jasmine.Spec} spec */
	/** @returns {Void} */
	reportSuiteResults : function(suite)	{
		this.__testSuite.name = this.getFullName(suite);
		this.__testSuite.time = this.getDuration(suite.startTime);
		this.__testResults.testsuites.push(this.__testSuite);
	},
	
	/** @param {Jasmine.Runner} runner */
	/** @returns {Void} */
	reportRunnerStarting : function(runner){
		Trace("Starting Jasmine Reporter..");
	},
	
	/** @param {Jasmine.Runner} runner */
	/** @returns {Void} */
	reportRunnerResults : function(runner){
		var results = runner.results();
		Trace("Ending Jasmine Reporter.. "+results.totalCount +" Spec/s, " +results.failedCount +" Failed");
		try {
			Jester.onRunComplete(this.__testResults.toString());
		}
		catch(e)	{
			// We just bin any onRunComplete exceptions
		}
	}
}
