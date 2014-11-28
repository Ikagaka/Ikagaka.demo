(function(global) {
"use strict";

// --- runtime define --------------------------------------
var _runOnNode = "process" in global;
//var _runOnWorker = "WorkerLocation" in global;
var _runOnBrowser = "document" in global;

// --- dependency modules ----------------------------------
var WMURL    = global["WMURL"]    || require("uupaa.wmurl.js");
var WMEvent  = global["WMEvent"]  || require("uupaa.wmevent.js");
var DataType = global["DataType"] || require("uupaa.datatype.js");

if (_runOnNode) {
    var http = require("http");
    var fs   = require("fs");
}

// --- define / local variables ----------------------------
// readyState codes -> http://www.w3.org/TR/XMLHttpRequest/
var READY_STATE_UNSENT           = 0;
var READY_STATE_OPENED           = 1;
var READY_STATE_HEADERS_RECEIVED = 2;
var READY_STATE_LOADING          = 3;
var READY_STATE_DONE             = 4;

// function level
var FUNCTION_LEVEL_0 = 0; // XMLHttpRequest simulate for Node.js
var FUNCTION_LEVEL_1 = 1; // XMLHttpRequest Level 1
var FUNCTION_LEVEL_2 = 2; // XMLHttpRequest Level 2

var ALLOW_XHR_EVENTS = "loadstart,load,loadend,progress,readystatechange,error,timeout".split(",");

// --- class / interfaces ----------------------------------
function XHRProxy(options) { // @arg Object = {} - { verbose }
                             // @options.verbose Boolean = false
//{@dev
    $valid($type(options, "Object|omit"), XHRProxy, "options");
//}@dev

    options = options || {};
    this._verbose = options["verbose"] || false;

//{@dev
    $valid($type(options.verbose, "Boolean|omit"), XHRProxy, "options.verbose");
//}@dev

    this._event = new WMEvent()["register"](ALLOW_XHR_EVENTS);
    this._xhr = null;
    this._lv = FUNCTION_LEVEL_0;

    if (global["XMLHttpRequest"]) { // _runOnBrowser
        this._lv = FUNCTION_LEVEL_1;
        this._xhr = new XMLHttpRequest();

        if ("onload"          in this._xhr &&
            "responseType"    in this._xhr &&
            "withCredentials" in this._xhr) {
            this._lv = FUNCTION_LEVEL_2;
        }
    } else { // _runOnNode -> simulate XMLHttpRequest Object
        this._xhr = {
            "readyState":       READY_STATE_UNSENT,
            // --- request ---
            "method":           "",     // "GET" or "POST"
            "url":              "",
            "async":            true,
            "auth":             "",     // "" or "user:password"
            "requestHeader":    {},     // { header: value, ... }
            // --- response ---
            "response":         null,
            "responseText":     "",
            "responseXML":      null,
            "responseHeaders":  {},     // { header: value, ... }
            "status":           0,
            "statusText":       "",
            "upload":           null,
            "withCredentials":  false
        };
    }

//{@dev
    if (this._verbose) {
        console.log("XMLHttpRequest Level is " + this._lv);
    }
//}@dev

    this._lastRequestURL = "";
    this._lastReadyState = READY_STATE_UNSENT;

    // setup property getter and setter.
    Object.defineProperties(this, {
        "readyState":     { "get": getReadyState                                },
        "response":       { "get": getResponse                                  },
        "responseText":   { "get": getResponseText                              },
        "responseType":   { "get": getResponseType,   "set": setResponseType    },
        "responseXML":    { "get": getResponseXML                               },
        "status":         { "get": getStatus                                    },
        "statusText":     { "get": getStatusText                                },
        "upload":         { "get": getUpload,         "set": setUpload          },
        "withCredentials":{ "get": getWithCredentials,"set": setWithCredentials }
    });
}

//{@dev
XHRProxy["repository"] = "https://github.com/uupaa/XHRProxy.js";
//}@dev

XHRProxy["get"] =           XHRProxy_get;                   // XHRProxy.get(url:URLString, callback:Function):void
XHRProxy["prototype"] = {
    "constructor":          XHRProxy,                       // new XHRProxy(options:Object = null)
    "getAllResponseHeaders":XHRProxy_getAllResponseHeaders, // XHRProxy#getAllResponseHeaders():String
    "getResponseHeader":    XHRProxy_getResponseHeader,     // XHRProxy#getResponseHeader(name:String):String
    "open":                 XHRProxy_open,                  // XHRProxy#open(method:String, url:URLString, async:Boolean = true,
                                                            //               username:String = "", password:String = ""):void
    "overrideMimeType":     XHRProxy_overrideMimeType,      // XHRProxy#overrideMimeType():void
    "send":                 XHRProxy_send,                  // XHRProxy#send(data:Any = null):void
    "setRequestHeader":     XHRProxy_setRequestHeader,      // XHRProxy#setRequestHeader():void
    "addEventListener":     XHRProxy_on,                    // XHRProxy#on(type:EventTypeString, callback:Function):this
    "removeEventListener":  XHRProxy_off,                   // XHRProxy#off(type:EventTypeString, callback:Function):this
    "on":                   XHRProxy_on,                    // XHRProxy#on(type:EventTypeString, callback:Function):this
    "off":                  XHRProxy_off,                   // XHRProxy#off(type:EventTypeString, callback:Function):this
    "clear":                XHRProxy_clear,                 // XHRProxy#clear():this
    "abort":                XHRProxy_abort,                 // XHRProxy#abort():void
    "getLevel":             XHRProxy_getLevel,              // XHRProxy#getLevel():Integer
    // --- internal ---
    "handleEvent":          XHRProxy_handleEvent
};

// --- implements ------------------------------------------
function getReadyState()        { return this._xhr["readyState"]; }
function getResponse()          { return this._xhr["response"]; }
function getResponseText()      { return this._xhr["responseText"]; }
function getResponseType()      { return this._xhr["responseType"]; }
function setResponseType(type) {
    if ( _isValidResponseType(type) ) {
        this._xhr["responseType"] = type;
    } else {
        throw new TypeError("Unsupported responseType: " + type);
    }
}
function getResponseXML()       { return this._xhr["responseXML"]; }
function getStatus()            { return this._xhr["status"]; }
function getStatusText()        { return this._xhr["statusText"]; }
function getUpload()            { return this._xhr["upload"] || null; }
function setUpload(v)           {        this._xhr["upload"] = v; }
function getWithCredentials()   { return this._xhr["withCredentials"] || false; }
function setWithCredentials(v)  {        this._xhr["withCredentials"] = v;  }
function XHRProxy_abort()       {        this._xhr["abort"](); }
function XHRProxy_getLevel()    { return this._lv; }
function XHRProxy_get(url,       // @arg URLString
                      callback,  // @arg Function - callback.call(xhr, error, response):void
                      options) { // @arg Object = {} - { responseType }
                                 // @arg options.responseType String = "text" - responseType: "arraybuffer", "blob", "document", "text", "json"
                                 // @desc convenient function.
//{@dev
    $valid($type(url,      "URLString"),   XHRProxy_get, "url");
    $valid($type(callback, "Function"),    XHRProxy_get, "callback");
    $valid($type(options,  "Object|omit"), XHRProxy_get, "options");
//}@dev

    options = options || {};
    var responseType = options["responseType"] || "text";

//{@dev
    $valid($type(responseType, "String|omit"), XHRProxy_get, "options.responseType");
    $valid($some(responseType, "arraybuffer|blob|document|text|json"), XHRProxy_get, "options.responseType");
//}@dev

    //
    // XHRProxy.get is convenient "GET" function.
    //
    //  1:  XHRProxy.get(url, function(error, response) {
    //  2:      console.log(response.byteLength);
    //  3:  }, { responseType: "arraybuffer" });
    //
    // without XHRProxy.get function (not recommended).
    //
    //  1:  var xhr = new XHRProxy();
    //  2:  xhr.on("load", function(event) {
    //  3:      console.log(xhr.response.byteLength);
    //  4:  });
    //  5:  xhr.responseType = "arraybuffer";
    //  6:  xhr.open("GET", url);
    //  7:  xhr.send();
    //

    var xhr = new XHRProxy();

    xhr["on"]("load", function() {
        var xhr = this;

        if ( _isSuccess(xhr["status"], /^file\:/.test(url)) ) {
            callback.call(xhr, null, xhr["response"] || xhr["responseText"]);
        } else {
            callback.call(xhr, new Error(xhr["status"]), "");
        }
    });
    if (responseType && responseType !== "text") {
        xhr["responseType"] = responseType;
    }
    xhr["open"]("GET", url);
    xhr["send"]();
}

function XHRProxy_getAllResponseHeaders() { // @ret String
    if (this._lv > FUNCTION_LEVEL_0) {
        return this._xhr["getAllResponseHeaders"]();
    }
    var headers = this._xhr["responseHeaders"];

    return Object.keys(headers).map(function(key) {
                return key + ":" + headers[key];
            }).join("\n");
}

function XHRProxy_getResponseHeader(name) { // @arg String
                                            // @ret String
//{@dev
    $valid($type(name, "String"), XHRProxy_getResponseHeader, "name");
//}@dev

    if (this._lv > FUNCTION_LEVEL_0) {
        return this._xhr["getResponseHeader"](name);
    }
    return this._xhr["responseHeaders"][name];
}

function XHRProxy_open(method,     // @arg String - "GET" or "POST"
                       url,        // @arg URLString
                       async,      // @arg Boolean = true
                       username,   // @arg String = ""
                       password) { // @arg String = ""
//{@dev
    $valid(this._xhr["readyState"] === READY_STATE_UNSENT,
                                            XHRProxy_open, "sequence error");
    $valid($type(method,   "String"),       XHRProxy_open, "method");
    $valid($some(method,   "GET|POST"),     XHRProxy_open, "method");
    $valid($type(url,      "URLString"),    XHRProxy_open, "url");
    $valid($type(async,    "Boolean|omit"), XHRProxy_open, "async");
    $valid($type(username, "String|omit"),  XHRProxy_open, "username");
    $valid($type(password, "String|omit"),  XHRProxy_open, "password");
//}@dev

    async = async === undefined ? true : async;

    this._lastRequestURL = url;
    this._lastReadyState = READY_STATE_UNSENT;

//{@dev
    if (this._verbose) {
        console.log("XHRProxy#open(" + method + ", " + url + ")");
    }
//}@dev

    switch (this._lv) {
    case FUNCTION_LEVEL_0:
        this._xhr["method"] = method;
        this._xhr["url"]    = url;
        this._xhr["async"]  = async;
        this._xhr["auth"]   = username && password ? (username + ":" + password) : "";

        if (this._xhr["readyState"] === READY_STATE_UNSENT) {
          //this._xhr["readyState"] = READY_STATE_OPENED;
            this._xhr["status"] = 0;
            this._xhr["responseText"] = "";
            _fireEvent(this, "readystatechange");
            this._xhr["readyState"] = READY_STATE_OPENED;
        }
        break;
    case FUNCTION_LEVEL_1:
        this._xhr["addEventListener"]("readystatechange", this); // call handleEvent
        this._xhr["open"](method, url, async, username, password);
        break;
    case FUNCTION_LEVEL_2:
        this._xhr["open"](method, url, async, username, password);
    }
}

function XHRProxy_overrideMimeType(mimeType) { // @arg String
//{@dev
    $valid($type(mimeType, "String"), XHRProxy_overrideMimeType, "mimeType");
//}@dev
//{@dev
    if (this._verbose) {
        console.log("XHRProxy#overrideMimeType(" + mimeType + ")");
    }
//}@dev

    if (this._lv > FUNCTION_LEVEL_0) {
        this._xhr["overrideMimeType"](mimeType);
    }
}

function XHRProxy_send(data) { // @arg Any = null - POST request body
//{@dev
    $valid(this._xhr["readyState"] === READY_STATE_OPENED, XHRProxy_send, "sequence error");
//}@dev
//{@dev
    if (this._verbose) {
        console.log("XHRProxy#send(" + ((data == null) ? "null" : "data") + ")");
    }
//}@dev

    switch (this._lv) {
    case FUNCTION_LEVEL_0:
        var url = WMURL["parse"](this._xhr["url"]);
        var username = url["username"] || "";
        var password = url["password"] || "";
        var auth = (username && password) ? (username + ":" + password) : "";
        var options = {
                host:   url["hostname"],   // without port number, "example.com:80" -> Error
                port:   url["port"] || 80,
                path:   url["path"],
                auth:   this._xhr["auth"] || auth || "",
                mehtod: this._xhr["method"],
                headers:this._xhr["requestHeader"]
            };
        if (url["host"]) {
            _getRemoteFile(this, options);
        } else {
            _getLocalFile(this, url["pathname"]);
        }
        break;
    case FUNCTION_LEVEL_1: // XHR Lv1 && binary -> overrideMimeType
        if ( /arraybuffer|blob/.test(this._xhr["responseType"]) ) {
            this._xhr["overrideMimeType"]("text/plain; charset=x-user-defined");
        }
        this._xhr["send"](data);
        break;
    case FUNCTION_LEVEL_2:
        this._xhr["send"](data);
    }
}

function _getRemoteFile(that, options) {
    http["get"](options, function(response) {
        response["setEncoding"]("utf8");

        that.handleEvent();

        // sequence --------------------------------------
        that._xhr["readyState"] = READY_STATE_HEADERS_RECEIVED;
        that._xhr["responseHeaders"] = response["headers"];
        that._xhr["status"] = response["statusCode"];
        that.handleEvent();

        // sequence --------------------------------------
        that._xhr["readyState"] = READY_STATE_LOADING;
        that.handleEvent();

        response["on"]("data", function(chunk) {
            that._xhr["responseText"] += chunk;
            that.handleEvent();
        });
        // sequence --------------------------------------
        response["on"]("end", function() {
            that._xhr["readyState"] = READY_STATE_DONE;

            that.handleEvent();
        });
    })["on"]("error", function(error) {
        that._xhr["readyState"] = READY_STATE_DONE;
        that._xhr["statusText"] = error["message"];
        that._xhr["status"] = 400;

        that.handleEvent();
        _fireEvent(that, "error");
    });
}

function _getLocalFile(that, file) {
    if ( !fs["existsSync"](file) ) {
        _error(404);
    } else {
        fs["readFile"](file, { "encoding": "utf8" }, function(err, data) {
            if (err) {
                _error(400);
            } else {
                that.handleEvent();

                // sequence --------------------------------------
                that._xhr["readyState"] = READY_STATE_HEADERS_RECEIVED;
                that._xhr["responseHeaders"] = {};
                that._xhr["status"] = 200;
                that.handleEvent();

                // sequence --------------------------------------
                that._xhr["readyState"] = READY_STATE_LOADING;
                that.handleEvent();

                that._xhr["responseText"] = data;

                // sequence --------------------------------------
                that._xhr["readyState"] = READY_STATE_DONE;

                that.handleEvent();
            }
        });
    }

    function _error(status) {
        that._xhr["readyState"] = READY_STATE_DONE;
        that._xhr["status"] = status || 400;

        that.handleEvent();
        _fireEvent(that, "error");
    }
}

function XHRProxy_setRequestHeader(name,    // @arg String - header name
                                   value) { // @arg String - header value
//{@dev
    $valid($type(name,  "String"), XHRProxy_setRequestHeader, "name");
    $valid($type(value, "String"), XHRProxy_setRequestHeader, "value");
//}@dev
//{@dev
    if (this._verbose) {
        console.log("XHRProxy#setRequestHeader(" + name + ", " + value + ")");
    }
//}@dev

    if (this._lv === FUNCTION_LEVEL_0) {
        this._xhr["requestHeader"][ name.toLowerCase() ] = value;
    } else {
        this._xhr["setRequestHeader"](name, value);
    }
}

function XHRProxy_on(type,       // @arg EventTypeString - "readystatechange"
                     callback) { // @arg Function
                                 // @ret this
//{@dev
    if (this._verbose) {
        console.log("XHRProxy#on(" + type + ")");
    }
//}@dev

    this._event["on"](this._lv === FUNCTION_LEVEL_2 ? this._xhr : null, type, callback);
    return this;
}

function XHRProxy_off(type,       // @arg EventTypeString - "readystatechange"
                      callback) { // @arg Function
                                  // @ret this
//{@dev
    if (this._verbose) {
        console.log("XHRProxy#off(" + type + ")");
    }
//}@dev

    this._event["off"](this._lv === FUNCTION_LEVEL_2 ? this._xhr : null, type, callback);
    return this;
}

function XHRProxy_clear() { // @ret this
//{@dev
    if (this._verbose) {
        console.log("XHRProxy#clear()");
    }
//}@dev

    this._event["clear"](this._lv === FUNCTION_LEVEL_2 ? this._xhr : null);
    return this;
}

function XHRProxy_handleEvent(event) { // @arg EventObject|null
                                       // @desc simulate XHR Lv2 events
    var xhr = this._xhr;
    var status = xhr["status"];
    var readyState = xhr["readyState"];

    if (this._lastReadyState !== readyState) {
        this._lastReadyState = readyState;
        _fireEvent(this, "readystatechange", event);
    }

    switch (readyState) {
    case READY_STATE_OPENED:
        _fireEvent(this, "loadstart", event);
        break;
    case READY_STATE_HEADERS_RECEIVED:
        _fireEvent(this, "progress", event);
        break;
    case READY_STATE_LOADING:
        _fireEvent(this, "progress", event);
        break;
    case READY_STATE_DONE:
        if ( _isSuccess(status, /^file\:/.test(this._lastRequestURL)) ) {
            try {
                xhr["response"] = _convertDataType(xhr["responseText"],
                                                   xhr["responseType"]);
            } catch (o_O) {
            }
            _fireEvent(this, "load", event);
        }
        _fireEvent(this, "loadend", event);

        if (this._lv === FUNCTION_LEVEL_1) {
            xhr.removeEventListener("readystatechange", this);
        }
    }
}

function _fireEvent(that,    // @arg this
                    type,    // @arg EventTypeString - "readystatechange", "loadstart", "progress", "load", "error", "loadend"
                    event) { // @arg EventObject = null - { type, ... }
    event = event || { type: type };

    if ( that._event["has"](type) ) {
        that._event["list"](type).forEach(function(callback) {
//{@dev
            if (that._verbose) {
                if (event.type === "readystatechange") {
                    console.log("XHRProxy#fire event(" + event.type + "), readyState = " + that._xhr["readyState"]);
                } else if (event.type === "progress") {
                    console.log("XHRProxy#fire event(" + event.type + "), responseText.length = " + that._xhr["responseText"].length);
                } else {
                    console.log("XHRProxy#fire event(" + event.type + ")");
                }
            }
//}@dev
            callback.call(that._xhr, event);
        });
    }
}

/*
function XHRProxy_convert() { // @ret Any
    var xhr = this._xhr;
    var status = xhr["status"];
    var readyState = xhr["readyState"];

    if (readyState === READY_STATE_DONE) {
        if ( _isSuccess(status, /^file\:/.test(this._lastRequestURL)) ) {
            return _convertDataType(xhr["responseText"],
                                    xhr["responseType"]);
        }
    }
    return "";
}
 */

function _convertDataType(text, type) {
    switch (type) {
    case "json":    return JSON.parse(text);                      // -> Object
    case "document":return _createHTMLDocument(text);             // -> Document|String
    case "arraybuffer":
    case "blob":    return DataType["Array"]["fromString"](text); // -> ByteArray
    }
    return text;
}

function _createHTMLDocument(text) {
    if (_runOnBrowser) {
        var body = document.createElement("body");

        body["innerHTML"] = text;
        return body;
    }
    return text;
}

function _isSuccess(status,         // @arg Integer - HTTP_STATUS_CODE
                    isFileScheme) { // @arg Boolean = false
                                    // @ret Boolean
    var ok = status >= 200 && status < 300;

    return isFileScheme ? (status === 0 || ok)
                        : ok;
}

function _isValidResponseType(type) {
//{@dev
    $valid($type(type, "String|omit"), _isValidResponseType, "type");
    $valid($some(type, "arraybuffer|blob|document|text|json"), _isValidResponseType, "type");
//}@dev

    switch (type) {
    case "arraybuffer": return !!global["ArrayBuffer"];
    case "blob":        return !!global["Blob"];
    case "document":    return !!global["HTMLDocument"];
    case "text":        return true;
    case "json":        return true;
    }
    return false;
}

// --- validate / assertions -------------------------------
//{@dev
function $valid(val, fn, hint) { if (global["Valid"]) { global["Valid"](val, fn, hint); } }
function $type(obj, type) { return global["Valid"] ? global["Valid"].type(obj, type) : true; }
//function $keys(obj, str) { return global["Valid"] ? global["Valid"].keys(obj, str) : true; }
function $some(val, str, ignore) { return global["Valid"] ? global["Valid"].some(val, str, ignore) : true; }
//function $args(fn, args) { if (global["Valid"]) { global["Valid"].args(fn, args); } }
//}@dev

// --- exports ---------------------------------------------
if ("process" in global) {
    module["exports"] = XHRProxy;
}
global["XHRProxy" in global ? "XHRProxy_" : "XHRProxy"] = XHRProxy; // switch module. http://git.io/Minify

})((this || 0).self || global); // WebModule idiom. http://git.io/WebModule

