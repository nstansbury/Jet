let EXPORTED_SYMBOLS = ["App"];

Components.utils.import("resource://jet/base.jsm");

ImportNS("Jet");
ImportNS("Jet.Services");
ImportNS("Jet.Net");
ImportNS("Jet.Data");



App = {
	__proto__ : Jet.Services.ServiceProvider,
	__httpService : null,
	
	test : null,
	
	/** @returns {Void} */
	start : function()	{
		var file = GetFile("app/extensions/jester@jet/modules/html");
		this.__httpService = new Jet.Net.HttpService();
		this.__httpService.registerDirectory("/jester/", file);
		this.__httpService.registerPathHandler( "/jester", App.beginRequest );
		Jet.Net.Server.listen(8080, this.__httpService);
	},
	
	/** @returns {Void} */
	stop : function(){
		this.__started = false;
		this.__httpService.stop();
	},
	
	beginRequest : function(metadata, httpResponse)	{
		try{
			Trace("# Jester :: beginRequest");
			httpResponse.processAsync();
			
			App.test = {};
			ImportNS("Jester.Runner", App.test, true);
			
			function oncomplete(results){
				App.endRequest(metadata, httpResponse, results);
			}
			
			if(metadata.queryString){
				var keyval = metadata.queryString.split("&");
				var params = keyval[ 0 ].split("=");
				if(params[ 0 ] == "run")	{
					var testfile = params[ 1 ];
				}
			}
			
			//var testfile = "resource://tests/jet/all.js";
			var reporter = new jUnitReporter(oncomplete);
			App.test.Runner.load(testfile, reporter);
		}
		catch(e)	{
			Trace(e);
		}
	},
	
	endRequest : function(metadata, httpResponse, results)	{
		Trace("# Jester :: endRequest");
		//WriteFile(results, "D:\\Dev\\out.xml");
		httpResponse.setHeader("Content-Type", "text/xml");
		httpResponse.write(results);
		httpResponse.finish();
		
		UnloadNS("Jester.Runner", App.test);
	}
	
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





jUnitReporter = function jUnitReporter(onruncomplete)	{
	this.__testResults = new Jet.Data.DataTemplate("JUnitTestResults");
	this.onruncomplete = onruncomplete;
}

jUnitReporter.prototype = {
	
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
			this.onruncomplete(this.__testResults.toString());
		}
		catch(e)	{
			// We just bin any onruncomplete exceptions
		}
	}
}
