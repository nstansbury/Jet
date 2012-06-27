let EXPORTED_SYMBOLS = ["TemplateFactory", "DataTemplate"];

// Data Templating Objects

Components.utils.import("resource://jet/base.jsm");

var templateRegEx = new RegExp(/[{\[]\w*[\]}]/gim);

TemplateCache = {};

TemplateFactory = {
	
	/** @param {String} name */
	/** @param {String} content */
	/** @returns {Void} */
	importTemplate : function(name, content)	{
		if(TemplateCache[ name ] == undefined)	{
			TemplateCache[ name ] = new Template(name, content);
		}
		else {
			throw new Components.Exception("DataTemplate already registered :: " +name, null, Components.stack.caller);
		}
	},
	
	/** @param {String} name */
	/** @returns {Function} */
	getTemplate : function(name)	{
		if(TemplateCache[ name ] != undefined)	{
			return TemplateCache[ name ];
		}
		else {
			throw new Components.Exception("DataTemplate not registered :: " +name, null, Components.stack.caller);
		}
	}
	
}

/** @constructor */
function wrappedArray()	{}
wrappedArray.prototype = {
	__proto__ : Array.prototype,
	
	/** @returns {String} */
	join : function()	{		// Because a join()ing a multi-dimensional array doesn't inherit original separator call
		return Array.prototype.join.call(this, "");
	}
}



function fnGetStack(index)	{
	return function()	{
		return this.__stack[ index ];
	}
}

function fnSetStack(index)	{
	return function(value)	{
		if(value == undefined) value = null;
		this.__stack[ index ] = value;
	}
}


function fnGetBase(obj, key)	{
	return function()	{
		return obj[ key ];
	}
}


function fnGetArray(index)	{
	return function()	{
		var a = new wrappedArray();
		this[ index ] = a;
		return a;
	}
}

/** @param {String} name */
/** @param {String} content */
function Template(name, content)	{
	function builder(match, pos)	{
		var property = match.substr(1, match.length -2);
		
		if(properties[ property ] != undefined)	{
			throw new Components.Exception("Duplicate data property on template :: " +property, null, Components.stack.caller);
		}
		
		var len = pos - start;
		var data = content.substr(start, len);
		
		base.push(data);	// Push the template string into base
		var index = base.length -1;
		stack.__defineGetter__( index, fnGetBase(base, index) );
		
		base.push("");		// Create an empty value position in the base template
		index++;
		
		if(match[0] == "[")	{		// If it's an array key..
			template.__defineGetter__( property, fnGetStack(index) );
			stack.__defineGetter__( index, fnGetArray(index) );
		}
		else {
			template.__defineGetter__( property, fnGetStack(index) );
			template.__defineSetter__( property, fnSetStack(index) );
			stack.push("");		// Create an empty value position in the stack
		}
		properties[ property ] = index;
		start = pos +match.length;
		return null;
	}
	
	var base = [];
	var stack = [];
	var properties = {};
	
	var start = 0;
	var template = this;
	content.replace(templateRegEx, builder);
	stack.push(content.substr(start));	// Push on any remainder content
	
	this.__name = name;
	this.__base = base;
	this.__stack = stack;
	this.__properties = properties;	
}
Template.prototype = {
	__base : null,
	__stack : null,
	__fields : null,
	
	clone : function()	{
		var instance = Object.create(this);
		instance.__stack = this.__stack.slice(0);		// Slice allows a
		return instance;
	},
	
	/** @returns {String} */
	get name()	{
		return this.__name;
	},
	
	/** @returns {Array} */
	get properties()	{
		return this.__properties;
	},
	
	/** @returns {String} */
	toString : function()	{
		return this.__stack.join("");
	},
	
	/** @param {String} property */
	/** @returns {Integer} */
	indexOf : function(property)	{
		return this.properties()[ property ];
	}
}

	
	

/** @param {String} name */
/** @param {Array} stack */
/** @param {Object} keys */
/** @constructor */
function DataTemplate(name)	{
	var template = TemplateFactory.getTemplate(name);
	return template.clone();
}





/*
	Example implementation to help understand the templating architecture
	{property:type} = Object of Type
	[property:type] = Array of Type
	(property) = Function
	<?JS arbitraryJavaScriptCode(); ?> =  JavaScript XML Processing Instruction
	<?JET href="http://www.example.com/template.xml" ?> =  Jet Template XML Processing Instruction
	
	
	var content = '<testcase name="{name}" classname="{classname}" time="{time}">\
							[error][failure]\
						</testcase>'

	
	var base = ['<testcase name="', "", '" classname="', "", '" time="', "", '">', "", "", '</testcase>'];
	
	var fields = {		// Field index into base
		name : 1,
		classname : 3,
		time : 5,
		error : 7,
		failure : 8
	}
	
	function getBase(index)	{
		return function()	{
			return base[index];
		}
	}
	function getArray(index)	{
		return function()	{
			var a = new wrappedArray();
			this[ index ] = a;
			return a;
		}
	}
	var stack = new Array(master.length);
	stack.__defineGetter__( 0, getBase(0) );
	// stack[1] is property value
	stack.__defineGetter__( 2, getBase(2) );
	// stack[3] is property value
	stack.__defineGetter__( 4, getBase(4) );
	// stack[5] is property value
	stack.__defineGetter__( 6, getBase(6) );
	stack.__defineGetter__( 7, getArray(7) );	// stack[6] is property array value
	stack.__defineGetter__( 8, getArray(8) );	// stack[6] is property array value
	stack.__defineGetter__( 9, getBase(9) );
	
	
	
	// Create template instances
	var clone1 = stack.slice(0);
	var clone2 = stack.slice(0);
	
	clone1[ fields["name"] ] = "name1";
	clone2[ fields["name"] ] = "name2";
	
	clone1[ fields["classname"] ] = "classname1";
	clone2[ fields["classname"] ] = "classname2";
	
	clone1[ fields["error"] ].push("Clone1Error1");
	clone1[ fields["error"] ].push("Clone1Error2");
	
	clone2[ fields["error"] ].push("Clone2Error1");
	clone2[ fields["error"] ].push("Clone2Error2");
	
	
	Trace(stack.join(""));
	Trace(clone1.join(""));
	Trace(clone2.join(""));
*/




