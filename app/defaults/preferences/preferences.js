// General Startup
pref("toolkit.defaultChromeURI", "");
pref("toolkit.defaultChromeFeatures", "chrome,modal=yes,resizable=no,dialog=no,titlebar=yes,centerscreen");

// Debugging
pref("browser.dom.window.dump.enabled", true);
pref("javascript.options.showInConsole", true);
pref("javascript.options.strict", true);
pref("nglayout.debug.disable_xul_cache", true);
pref("nglayout.debug.disable_xul_fastload", true);


// Javascript JIT Compiler
pref("javascript.options.jit.content", true);
pref("javascript.options.jit.chrome", true);

// Re-enable E4X
pref("javascript.options.xml.chrome", true);
pref("javascript.options.xml.content", true);
  

// Security Policy
pref("security.checkloaduri", false);
pref("security.fileuri.strict_origin_policy", false );


// Network Proxies
//pref("network.proxy.http", "127.0.0.1");
//pref("network.proxy.http_port", 8888);
//pref("network.proxy.type", 1);
//pref("network.proxy.no_proxies_on","");


// Extension Manager
pref("xpinstall.dialog.confirm", "chrome://mozapps/content/xpinstall/xpinstallConfirm.xul");
pref("xpinstall.dialog.progress.skin", "chrome://mozapps/content/extensions/extensions.xul?type=themes");
pref("xpinstall.dialog.progress.chrome", "chrome://mozapps/content/extensions/extensions.xul?type=extensions");
pref("xpinstall.dialog.progress.type.skin", "Extension:Manager-themes");
pref("xpinstall.dialog.progress.type.chrome", "Extension:Manager-extensions");
pref("extensions.update.enabled", true);
pref("extensions.update.interval", 86400);
pref("extensions.dss.enabled", false);
pref("extensions.dss.switchPending", false);
pref("extensions.ignoreMTimeChanges", false);
pref("extensions.logging.enabled", false);
pref("general.skins.selectedSkin", "classic/1.0");
pref("extensions.logging.enabled", true);
pref("extensions.update.url", "chrome://mozapps/locale/extensions/extensions.properties");
pref("extensions.getMoreExtensionsURL", "chrome://mozapps/locale/extensions/extensions.properties");
pref("extensions.getMoreThemesURL", "chrome://mozapps/locale/extensions/extensions.properties");

pref("extensions.blocklist.enabled", false);
pref("extensions.getAddons.cache.enabled", false);

