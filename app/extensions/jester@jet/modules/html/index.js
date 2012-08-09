"use strict";
/** @namespace */
var Jester = {

	testSuite : "<ul>\
						<li>\
							<h2>{title}</h2>\
							<ol>{testcases}</ol>\
						</li>\
					</ul>",

	testCase : "<li>\
						<h3>{title}</h3>{failure}\
					</li>",

	run : function()	{
		jQuery.get("http://localhost:8080/jester?run=resource://tests/jet/all.js", Jester.write(data));	
	},
	
	write : function(data)	{
		console.log(data);
		
		jQuery(data).each("testsuite", function(index, elem){
			var testcases = [];
			jQuery(elem).each("testcase", function(index, elem){
				var tc = Jester.testCase;
				ts.replace("{title}", jQuery(elem).att("name"));
				var message = jQuery(elem).children("failure").attr("message");
				ts.replace("{failure}", message);
			});
			var ts = Jester.testSuite;
			ts.replace("{title}", jQuery(elem).att("name"));
			ts.replace("{testcases}", testcases.join(""));
			var suite = jQuery(ts);
		});
		
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