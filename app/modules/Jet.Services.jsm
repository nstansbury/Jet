var EXPORTED_SYMBOLS = ["ServiceProvider"];

Components.utils.import("resource://jet/base.jsm");

ServiceProvider = {
	get name(){throw new Components.Exception("Not Implemented");},
	
	/** @param {Object} params */
	/** @returns {Void} */
	start : function(params){throw new Components.Exception("Not Implemented");},
	
	/** @param {Boolean} restart */
	/** @returns {Void} */
	stop : function(restart){throw new Components.Exception("Not Implemented");},
	
	/** @param {Jet.Events.EventType} type */
	/** @param {Function} calback */
	/** @param {Number} delay */
	/** @returns {Void} */
	addEventListener : function(type, callback, delay){throw new Components.Exception("Not Implemented");},
	
	/** @param {Jet.Events.EventType} type */
	/** @param {Function} calback */
	/** @param {Number} delay */
	/** @returns {Void} */
	removeEventListener : function(type, callback, delay){throw new Components.Exception("Not Implemented");}

}

