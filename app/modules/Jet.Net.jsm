"use strict";

let EXPORTED_SYMBOLS = ["HttpService"];


//** @See https://developer.mozilla.org/en-US/docs/HTTP_server_for_unit_tests */
Components.utils.import("resource://Lib/httpd.js");
var HttpService = HttpServer;
