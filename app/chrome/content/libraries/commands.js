
function cmdReloadChrome(){
	var registry = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService(Components.interfaces.nsIXULChromeRegistry);
	registry.reloadChrome();
}

function cmdRestartApp(){
	var appStartup = Components.classes["@mozilla.org/toolkit/app-startup;1"].getService(Components.interfaces.nsIAppStartup);
	appStartup.quit(Components.interfaces.nsIAppStartup.eRestart | Components.interfaces.nsIAppStartup.eAttemptQuit);
}

function cmdOpenJsConsole(){
	window.open("chrome://global/content/console.xul", "", "chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar");
}