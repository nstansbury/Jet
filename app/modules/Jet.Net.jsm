let EXPORTED_SYMBOLS = ["Server", "HttpService"];

Components.utils.import("resource://jet/base.jsm");

//** @See https://developer.mozilla.org/en-US/docs/HTTP_server_for_unit_tests */
Components.utils.import("resource://lib/httpd.js");
HttpService = HttpServer;

var threadManager = Mozilla.Components.Service("@mozilla.org/thread-manager;1", "nsIThreadManager");


Server = {
	__services : {},
	
	/** @param {Number} port */
	/** @param {ConnectionHandler} service */
	/** @returns {Void} */
	listen : function(port, service)	{
		try {
			if(this.__services[ port ] == null)	{
				/*
				socket = Mozilla.Components.Instance("@mozilla.org/network/server-socket;1", "nsIServerSocket");
				socket.init(port, false, -1);
				socket.asyncListen(this);
				*/
				service.start(port);
				this.__services[ port ] = service;
				Trace("Listening on: " +port);
			}
			else {
				Trace("Error :: Server already listening on: " +port);
			}
		}
		catch(e){
			Trace(e);
		}
	},
	
	/** @param {nsIServerSocket} socket */
	/** @param {nsISocketTransport} transport */
	onSocketAccepted : function(socket, transport)	{
		try {
			var connection = new Connection();
			var handler = this.__services[ socket.port ];
			connection.open(transport, handler);
			Trace("onSocketAccepted");
		}
		catch(e){
			Trace(e.toString());
		}
	},
		
	/** @param {nsIServerSocket} socket */
	/** @param {Integer} status */
	onStopListening : function(socket, status)	{
		Trace("onStopListening: " +status);
	}	
}



function Connection(transport)	{
	this.__isOpen = false;
	this.__outputStream = null;
	this.__scriptableInputStream = Mozilla.Components.Instance("@mozilla.org/scriptableinputstream;1", "nsIScriptableInputStream");
	this.__bytesRead = this.__bytesWritten = 0;
}
Connection.prototype = {
	get bytesRead()		{
		return this.__bytesRead;
	},
	
	get bytesWritten()		{
		return this.__bytesWritten;
	},
	
	get inputStream()	{
		return this.__scriptableInputStream;
	},
	
	get outputStream()	{
		return this.__outputStream;
	},
	
	/** @param {nsITransport} transport */
	/** @param {Jet.Net.ConnectionHandler} handler */
	/** @returns {Void} */
	open : function(transport, handler)	{
		this.__transport = transport;
		this.__handler = handler;
		
		transport.setEventSink(this, threadManager.currentThread);
		var inputStream = transport.openInputStream(0, 0, 0);
		this.__scriptableInputStream.init(inputStream);
		this.__isOpen = true;
		// Should be async notification
		handler.onConnectionOpen(this);
	},
	
	close : function()	{
		this.__transport.close(Components.results.NS_OK);
		// Should be async notification
		this.__handler.onConnectionClosed(this);
	},
	
	isOpen : function()	{
		return (this.__transport.isAlive() && this.__isOpen) ? true : false;
	},
	
	/** @returns {Void} */
	read : function()	{
		this.__scriptableInputStream.asyncWait(this, 0, 0, threadManager.currentThread);
	},
	
	onInputStreamReady : function(asyncInputStream)	{
		Trace("onInputStreamReady");
		try {
			if(this.isOpen())	{
				this.__bytesRead += asyncInputStream.available();
				this.__handler.onDataAvailable(this);
				asyncInputStream.asyncWait(this, 0, 0, threadManager.currentThread);	
			}
		}
		catch(e){
			Trace(e.toString());
		}
	},
	
	write : function(stream)	{},
	
	/*
	onOutputStreamReady : function onOuputStreamReady(asyncOutputStream)	{
		try {
			Trace("_onOutputStreamReady");
			var written = asyncOutputStream.write(this.__writeBuffer, this.__writeBuffer.length);
			this.__bytesWritten += written;
			if(written < this.__writeBuffer.length)	{
				this.__writeBuffer = this.__writeBuffer.slice(written -1);
				this.__outputStream.asyncWait(this, 0, 0, threadManager.currentThread);
				Trace("__Wait for OutputStream");
			}
			else {
				this.__writeListener(this.session, written);
			}
			Trace("_Written :: " +written);
		}
		catch(e){
			Trace(e.toString());
		}
	}
	*/
	
	onTransportStatus : function onTransportStatus(transport, status, progress, progressMax)	{
		Trace("onTransportStatus:: Status: " +status +"  Progress: " +progress +"  Max: " +progressMax);
	}

}


/*
	RequestHandler
	Takes a MasterStream and splits the stream data into individual RequestStreams and then concrete request objects
	
	MasterStream > RequestStream > Request
	                      > RequestStream > Request
  
*/

ConnectionHandler = {
	/** @param {Jet.Net.Connection} connection */
	/** @returns {Void} */
	onConnectionOpen : function(connection){},
	
	/** @param {Jet.Net.Connection} connection */
	/** @returns {Void} */
	onConnectionClosed : function(connection){},
	
	/** @param {Jet.Net.Connection} connection */
	/** @returns {Void} */
	onDataAvailable : function(connection){}
}


WebService = {
	__proto__ : ConnectionHandler,
	
	beginProcessRequest : function(request)	{},
	endProcessRequest : function(request)	{},
	
	onBeginRequest : function(request){},
	onEndRequest : function(request){},
	
	addEventListener : function(type, listener){},
	addResourceHandler : function(url, handler){},
	addRequestHandler : function(handler){}
}


var httpBodyRequest = new RegExp(/\r\n\r\n/gim);

/** @constructor */
function _HttpService()	{
	this.__sessions = new BucketQueue();
}
_HttpService.prototype = {
	__proto__ : WebService,
	
	onConnectionOpen : function(connection)		{
		//var session = new Session(connection);
		//this.addSession(session);
		connection.read();
	},
	
	onConnectionClosed : function(connection)			{
		// Get Session object & remove
	},
	
	onDataAvailable : function(connection, session)				{
		var data = connection.inputStream.read(connection.inputStream.available());
		
		session.requestStream
		
		var h = new HttpRequest(session.requestStream)
		
		context.requestStream = new RequestStream();
		
		/*
		var requestStart = 0;
		function matcher(match, requestEnd)		{		// Each match is the start of the request body (if there is one)		
			if(session.requestStream == null)	{
				session.beginRequestStream();
			}
			var requestData = data.slice(requestStart, requestEnd).trim();
			session.writeRequestStream(requestData)
			requestStart = requestEnd;
			
			var request = new HttpRequest(session.requestStream);
			this.dispatchEvent("processrequest", request);
			
			session.endRequestStream();
		}
		data.replace(httpBodyRequest, matcher);
	
		if(requestStart < data.length)	{		// RequestOffset contains a partial request or not termininated correctly
			session.requestStream.write(data.slice(requestStart, data.length));
		}
		if(session.inputStream.available() == 0)	{
			session.endRequestStream();
		}
		*/
	}
}






/** @constructor */
function Session()	{
	
}
Session.prototype = {
	
}


function RequestStream()		{
	this.__pipe = Mozilla.Components.Instance("@mozilla.org/pipe;1", "nsIPipe");
	this.__scriptableInputStream = Mozilla.Components.Instance("@mozilla.org/scriptableinputstream;1", "nsIScriptableInputStream");
	this.__isOpen = false;
	this.__size = 0;
}
RequestStream.prototype = {
	get inputStream()	{
		return this.__scriptableInputStream;
	},
	
	get outputStream()	{
		return this.__pipe.outputStream;
	},
	
	get size()	{
		return this.__size;	
	},
	
	isOpen : function()	{
		return this.__isOpen;
	},
	
	open : function()	{
		this.__pipe.init(true, true, 0, 0, null);
		this.__scriptableInputStream.init(this.__pipe.inputStream);
		this.__isOpen = true;
	},
	
	write : function(data)	{
		if(this.isOpen())	{
			this.__pipe.inputStream.write(data);
			this.__size += data.length;
		}
		else {
			throw "Request Stream closed";	
		}
	},
	
	close : function(){
		this.__isOpen = false;
		this.__pipe.outputStream.closeWithStatus(Components.results.NS_OK);
	}
}





RequestContext = {
	request : {},
	response : {},
	handler :{}
}


var httpHeaders = new RegExp(/\r\n([\w-]*):\s*(.*)/gim);		// This won't match headers broken over multiple-lines

/** @param {String} data */
/** @constructor */
function HttpRequest(requestStream)	{
	var headers = {};
	var bodyStart = 0;
	
	function matcher(match, field, value, offset)	{
		headers[field] = value;
		bodyStart = offset +match.length;
	}
	var data = requestStream.read(requestStream.available());
	data.replace(httpHeaders, matcher);
	
	this.__headers = headers;
	this.__body = data.slice(bodyStart).trim();
}
HttpRequest.prototype = {
	get method(){},
	get path(){},
	get queryString(){},
	
	/** @returns {String} */
	get body(){
		return this.__body;
	},
	
	/** @returns {Jet.Net.HttpResponse} */
	get response()	{
		if(!this.__response)	{
			this.__response = new HttpResponse(this);
		}
		return this.__response;
	},
	
	/** @returns {String} */
	getAllRequestHeaders : function(){
		return this.__headers.join("\r\n");
	},
	
	/** @param {String} header */
	/** @returns {String} */
	getRequestHeader : function(header){
		return this.__headers[header] || null;
	}
}

/** @constructor */
function HttpResponse(request)	{
	this.__request = request;
	this.__headers = [];
	this.__response = null;
}
HttpResponse.prototype = {
	
	open : function(status, statusText)	{
		this.__headers.push("HTTP/1.1 "+status +" " +statusText+"\r\n");
	},
	
	setResponseHeader : function(){
		this.__headers.push(key +":"+value +"\r\n");	
	},
	
	send : function(body)	{
		this.setResponseHeader("Server", "JetHttpd");
		this.setResponseHeader("Date", new Date().toLocaleString());
		this.setResponseHeader("Content-Length", body.length);
		
		this.__response = this.__headers.join("") +"\r\n" +body;
		
		this.__request.pending = true;
	}
}


function Bucket(item)	{
	this.item = item;
}
Bucket.prototype = {
	next : null,
	prev : null,
	item : null
}

function BucketQueue()	{
	this.head = null;
	this.tail = null;
}
BucketQueue.prototype = {
	add : function(item)	{
		var tail = new Bucket(item);
		[this.tail] = [tail];
		if(tail)	{
			this.tail.prev = tail;
			tail.next = this.tail;
		}
		else {
			this.head = this.tail;	
		}
	},
	
	getNext : function()	{
		var head = this.head.next;
		if(head)	{
			[this.head] = [head];
		}
		else {
			[this.back] = [head];
		}
		return head.item;
	},
	
	clear : function()	{
		this.head = this.tail = null;
	}
}






function Work(work, context)	{
	this.doWork = work;
	this.context = context;
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
		this.doWork(this.context);
	}
};



function compare_and_swap(compare, oldval, newval)	{
	if(compare === oldval)	{
		[oldval, newval] = [newval, oldval];
	}
	return compare;
}