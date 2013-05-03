"use strict";

let EXPORTED_SYMBOLS = ["File"];

Components.utils.import("resource://Jet/Core.jsm");

var File = {
	
	/** @param {String} path Relative path to app root*/
	/** @returns {nsIFile} */
	open : function open(path)	{
		var dirService = Mozilla.Components.Service("@mozilla.org/file/directory_service;1", "nsIProperties");
		var file = dirService.get("CurProcD", Components.interfaces.nsIFile);
		file = file.parent;	// Jet root
		
		var paths = path.split("/");
		for(var i = 0; i < paths.length; i++)	{
			file.append(paths[ i ]);
		}
		return file;
	},

	/** @param {String} path */
	/** @param {Function} callback */
	/** @returns {Void} */
	read : function read(path, callback)	{
		Components.utils.import("resource://gre/modules/NetUtil.jsm");
		
		function onDataAvailable(inputStream, result)	{
			var data = null;
			if(Components.isSuccessCode(result)) {
				data = NetUtil.readInputStreamToString(inputStream, inputStream.available());
			}
			callback(result, data);
		}
		
		NetUtil.asyncFetch(path, onDataAvailable);
	},
	
	/** @param {String} data */
	/** @param {String} path Native path to file*/
	/** @param {Function} [callback] */
	/** @returns {Void} */
	write : function write(data, path, callback)	{
		Components.utils.import("resource://gre/modules/NetUtil.jsm");  
		Components.utils.import("resource://gre/modules/FileUtils.jsm");  
		
		var converter = Mozilla.Components.Instance("@mozilla.org/intl/scriptableunicodeconverter", "nsIScriptableUnicodeConverter");  
		converter.charset = "UTF-8";  
		var inputStream = converter.convertToInputStream(data);  
		
		var file = new FileUtils.File(path);
		
		var outputStream = FileUtils.openSafeFileOutputStream(file);
		NetUtil.asyncCopy(inputStream, outputStream, callback);
	}
}