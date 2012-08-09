let EXPORTED_SYMBOLS = ["Runner", "Dispose"];

Components.utils.import("resource://jet/base.jsm");

ImportNS("Jet");
ImportNS("Jet.Data");
ImportNS("Jet.DOM");
ImportNS("Jet.DOM", this, true);

var scope = this;

Runner = {
	reporter : null,
	
	load : function(testfile, reporter){
		function loaded(){
			try {
				document = window.document;		// We always need to re-export the new document
				LoadScript(testfile, scope);			// The testfile has scope access to all the Jet & Jester API calls
			}
			catch(e)	{
				Trace("! Test load error :: "+testfile +"  " +e.toString());
				var results = new Jet.Data.DataTemplate("JUnitTestResults");
				results.testsuites.push(Jet.DOM.encodeEntities(e.toString()));
				reporter.onruncomplete(results.toString());
			}	
		}
		Trace("# Jester :: Loading test : " +testfile);
		this.testfile = testfile;
		this.reporter = reporter;
		
		LoadScript("resource://lib/jasmine.js", scope);
		LoadScript("resource://lib/jasmine-html.js", scope);
		LoadScript("resource://lib/jam.js", scope);
		jasmine.getEnv().addReporter(reporter);

		window.addEventListener("DOMContentLoaded",  loaded, false);
	},
	
	run : function(){
		try {
			jasmine.getEnv().execute();
		}
		catch(e)	{
			Trace("Test run error :: "+testfile +"  " +e.toString());
			var results = new Jet.Data.DataTemplate("JUnitTestResults");
			results.testsuites.push(Jet.DOM.encodeEntities(e.toString()));
			this.reporter.onruncomplete(results.toString());
		}
	}
}

function Dispose()	{
	UnloadNS("Jet.DOM");
	scope = null;
}