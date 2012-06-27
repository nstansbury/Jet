let EXPORTED_SYMBOLS = ["TimerType", "addTimedEventListener", "removeTimedEventListener", "addEventListener", "removeEventListener"];

Components.utils.import("resource://jet/base.jsm");


var timedEvents = {};


var TimerType = {
	/** @const */
	OneShot : Components.interfaces.nsITimer.TYPE_ONE_SHOT,
	/** @const */
	RepeatingPrecise : Components.interfaces.nsITimer.TYPE_REPEATING_PRECISE,
	/** @const */
	RepeatingSlack : Components.interfaces.nsITimer.TYPE_REPEATING_SLACK
}

/** @param {Jet.Events.EventType} type */
/** @param {Function} calback */
/** @param {Number} delay */
/** @returns {Void} */
function addTimedEventListener(type, callback, delay)	{
	if(delay == 0)	{
		callback();
		return;
	}
	var event = {
		callback : callback,
		observe : function(subject, topic, data)	{
			this.callback();
		}
	}
	var timerId = Date.now();
	var nsTimer = Mozilla.Components.Instance("@mozilla.org/timer;1", "nsITimer");
	timedEvents[ "t" +timerId ] = nsTimer;
	nsTimer.init(event, delay, type);
}

/** @param {Jet.Events.EventType} type */
/** @param {Function} calback */
/** @param {Number} delay */
/** @returns {Void} */
function removeTimedEventListener(type, callback, delay)	{
	if(timedEvents[ timerId ] != undefined)		{
		delete timedEvents[ "t" +timerId ];
	}
}


/** @param {Jet.Events.EventType} type */
/** @param {Function} calback */
/** @param {Number} delay */
/** @returns {Void} */
function addEventListener(type, callback, delay)	{}
/** @param {Jet.Events.EventType} type */
/** @param {Function} calback */
/** @param {Number} delay */
/** @returns {Void} */
function removeEventListener(type, callback, delay)	{}
