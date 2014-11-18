(function(global) {
"use strict";

// --- dependency modules ----------------------------------
// --- define / local variables ----------------------------
//var _runOnNode = "process" in global;
//var _runOnWorker = "WorkerLocation" in global;
//var _runOnBrowser = "document" in global;

// --- class / interfaces ----------------------------------
var DataType_Object = {
    "clone":            DataType_Object_clone           // DataType.Object.clone(source:Any, depth:Integer = 0, hook:Function = null):Any
};

// --- implements ------------------------------------------
function DataType_Object_clone(source, // @arg Any             - source object.
                               depth,  // @arg Integer = 0     - max depth, 0 is infinity.
                               hook) { // @arg Function = null - handle the unknown object.
                                       // @ret Any             - copied object.
                                       // @throw TypeError("DataCloneError: ...")
                                       // @desc Object with the reference -> deep copy
                                       //       Object without the reference -> shallow copy
                                       //       do not look prototype chain.
//{@dev
    $valid($type(depth, "Number|omit"),  DataType_Object_clone, "depth");
    $valid($type(hook, "Function|omit"), DataType_Object_clone, "hook");
//}@dev

    return _clone(source, depth || 0, hook, 0);
}

function _clone(source, // @arg Any      - source object.
                depth,  // @arg Integer  - max depth, 0 is infinity.
                hook,   // @arg Function - handle the unknown object.
                nest) { // @arg Integer  - current nest count.
                        // @recursive
    if (depth && nest > depth) {
        throw new TypeError("DataCloneError: " + source);
    }
    if (source === null || source === undefined) {
        return source;
    }

    var baseClass = _getBaseClassName(source); // detect [[Class]]

    switch (baseClass) {
    case "Function":return source; // does not clone
    case "String":
    case "Number":
    case "Boolean": return source.valueOf();
    case "RegExp":  return new RegExp(source["source"], (source + "").slice(source["source"].length + 2));
    case "Date":    return new Date(+source);
    case "Array":   return _cloneArray(source, depth, hook, nest);
    case "Object":  return _cloneObject(source, depth, hook, nest);
    case "Error":   return new source["constructor"](source["message"]);
    case "Uint8ClampedArray":
    case "Uint8Array":
    case "Uint16Array":
    case "Uint32Array":
    case "Int8Array":
    case "Int16Array":
    case "Int32Array":
    case "Float32Array":
    case "Float64Array":
                    return new global[baseClass]( source.buffer.slice(0) );
  //case "File":
  //case "Blob":
  //case "FileList":
  //case "ImageData":
  //case "CanvasPixelArray":
  //case "ImageBitmap":
    }
    // --- Node, Attr, Style, HostObjects ---
    if (source.nodeType) { // Node
        return source["cloneNode"](true);
    }
    if (source instanceof global["NamedNodeMap"]) { // NodeAttribute -> {}
        return _convertNodeAttributeToObject(source);
    }
    if (source instanceof global["CSSStyleDeclaration"]) { // CSSStyleDeclaration -> {}
        return _convertCSSStyleDeclarationToObject(source);
    }
    // --- convert ArrayLike(Arguments, NodeList, HTMLCollection) to Object ---
    if ("length" in source && typeof source["item"] === "function") {
        return _cloneArrayLike(source, depth, hook, nest);
    }
    if (hook) { // hook unknown type
        return hook(source, depth, hook, nest);
    }
    return source;
}

function _getBaseClassName(value) { // @arg Any
                                    // @ret String
    // Object.prototype.toString.call(new Error());     -> "[object Error]"
    // Object.prototype.toString.call(new TypeError()); -> "[object Error]"
    return Object.prototype.toString.call(value).split(" ")[1].slice(0, -1); // -> "Error"
}

//function _getConstructorName(value) { // @arg Any   instance, exclude null and undefined.
//                                      // @ret String
//    // _getConstructorName(new (function Aaa() {})); -> "Aaa"
//    return value.constructor["name"] ||
//          (value.constructor + "").split(" ")[1].split("\x28")[0]; // for IE
//}

function _cloneArray(source, depth, hook, nest) {
    var result = [];

    result.length = source.length;
    for (var i = 0, iz = source.length; i < iz; ++i) {
        if (i in source) {
            result[i] = _clone(source[i], depth, hook, nest + 1);
        }
    }
    return result;
}

function _cloneObject(source, depth, hook, nest) {
    var result = {};
    var keys = Object.keys(source);

    for (var i = 0, iz = keys.length; i < iz; ++i) {
        var key = keys[i];

        result[key] = _clone(source[key], depth, hook, nest + 1);
    }
    return result;
}

function _cloneArrayLike(source, depth, hook, nest) {
    var result = [];

    for (var i = 0, iz = source.length; i < iz; ++i) {
        result[i] = _clone(source[i], depth, hook, nest + 1);
    }
    return result;
}

function _convertNodeAttributeToObject(source) { // @arg Attr: NamedNodeMap
                                                 // @ret Object:
                                                 // @desc: NodeAttribute normalization.
    var result = {}, i = 0, attr;

    while ( !!(attr = source[i++]) ) { // avoid jshint message `Expected a conditional expression and instead saw an assignment`
        result[attr["name"]] = attr["value"];
    }
    return result;
}

function _convertCSSStyleDeclarationToObject(source) { // @arg Style: CSSStyleDeclaration
                                                       // @ret Object:
                                                       // @desc: CSSStyleDeclaration normalization.
    var result = {}, key, value, i = 0, iz = source.length;

    for (; i < iz; ++i) {
        key = source["item"](i);
        value = source[key];
        if (value && typeof value === "string") { // value only (skip methods)
            result[key] = value;
        }
    }
    return result;
}

// --- validate / assertions -------------------------------
//{@dev
function $valid(val, fn, hint) { if (global["Valid"]) { global["Valid"](val, fn, hint); } }
function $type(obj, type) { return global["Valid"] ? global["Valid"].type(obj, type) : true; }
//function $keys(obj, str) { return global["Valid"] ? global["Valid"].keys(obj, str) : true; }
//function $some(val, str, ignore) { return global["Valid"] ? global["Valid"].some(val, str, ignore) : true; }
//function $args(fn, args) { if (global["Valid"]) { global["Valid"].args(fn, args); } }
//}@dev

// --- exports ---------------------------------------------
global["DataType_" in global ? "DataType_"
                             : "DataType"]["Object"] = DataType_Object;

})((this || 0).self || global); // WebModule idiom. http://git.io/WebModule

