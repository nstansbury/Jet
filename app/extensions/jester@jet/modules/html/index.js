"use strict";
/** @namespace */
var Jester = {

	testSuite : '<ul class="{status}">\
						<li>\
							<h2>{title}</h2>\
							<ol>{testcases}</ol>\
						</li>\
					</ul>',

	testCase : '<li class="{status}">\
						<h3>{title}</h3>{failure}{error}\
					</li>',

	run : function()	{
		jQuery.get("http://localhost:8080/jester?run=resource://tests/jet/all.js", function(data){Jester.write(data)});	
	},
	
	write : function(data)	{
		var testsuites = [];
		jQuery(data).find("testsuite").each(function(index, testsuite){
			var hasFailed = false;
			var testcases = [];
			jQuery(testsuite).find("testcase").each(function(index, testcase){
				var tc = Jester.testCase;
				tc = tc.replace("{title}", jQuery(testcase).attr("name"));
				var status = "passed";
				var failure = jQuery(testcase).children("failure").attr("message") || "";
				var error = jQuery(testcase).children("error").attr("message") || "";
				if(failure){
					hasFailed = true;
					status = "failed";
				}
				else if(error){
					hasFailed = true;
					status = "error";
				}
				tc = tc.replace("{status}", status);
				tc = tc.replace("{failure}", failure);
				tc = tc.replace("{error}", error);
				testcases.push(tc);
			});
			var ts = Jester.testSuite;
			ts = ts.replace("{status}", hasFailed == true ? "failed" : "passed");
			ts = ts.replace("{title}", jQuery(testsuite).attr("name"));
			ts = ts.replace("{testcases}", testcases.join(""));
			testsuites.push(ts);
		});
		jQuery("#testResults").parent().append(testsuites.join(""));
	},
	
	toggleSection : function(e)	{
		var elem = e.target;
		while(elem.tagName !== "UL"){
			elem = elem.parentNode;
			if(elem.tagName === "OL"){
				return;	
			}
		}
		jQuery(elem).toggleClass("collapsed");
	},
	
	onload : function()	{
		jQuery("ul").bind("click", Jester.toggleSection);
	}
	
}

jQuery(document).ready(Jester.onload);