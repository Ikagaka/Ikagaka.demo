(function(global) {
"use strict";

// --- dependency modules ----------------------------------
// --- define / local variables ----------------------------
//var _runOnNode = "process" in global;
//var _runOnWorker = "WorkerLocation" in global;
//var _runOnBrowser = "document" in global;

// --- class / interfaces ----------------------------------
var DataType_Uint8Array = {
    "clone":            DataType_Uint8Array_clone,      // DataType.Uint8Array.clone(source:Uint8Array, begin:Integer = 0, end:Integer = source.length):Uint8Array
    "concat":           DataType_Uint8Array_concat,     // DataType.Uint8Array.concat(...:Array|Uint8Array):Uint8Array
    "expand":           DataType_Uint8Array_expand,     // DataType.Uint8Array.expand(source:Uint8Array, scale:Number = 2):Uint8Array
    "toArray":          DataType_Uint8Array_toArray,    // DataType.Uint8Array.toArray(source:Uint8Array):Array
    "toString":         DataType_Uint8Array_toString,   // DataType.Uint8Array.toString(source:Uint8Array):BinaryString
    "fromString":       DataType_Uint8Array_fromString  // DataType.Uint8Array.fromString(source:BinaryString):Uint8Array
};

// --- implements ------------------------------------------
function DataType_Uint8Array_clone(source,  // @arg Uint8Array
                                   begin,   // @arg Integer = 0 - begin offset
                                   end) {   // @arg Integer = source.length - end offset
                                            // @ret Uint8Array
                                            // @desc make clone (not reference)
//{@dev
    $valid($type(source, "Uint8Array"),   DataType_Uint8Array_clone, "source");
    $valid($type(begin,  "Integer|omit"), DataType_Uint8Array_clone, "begin");
    $valid($type(end,    "Integer|omit"), DataType_Uint8Array_clone, "end");
//}@dev

    if (end !== undefined) {
        return new Uint8Array( source.buffer.slice(begin, end) );
    }
    return new Uint8Array( source.buffer.slice(begin || 0) );
}

function DataType_Uint8Array_concat(/* ... */) { // @var_args Array|Uint8Array
                                                 // @ret Uint8Array
                                                 // @desc [].concat(value1, value2, ...)
    var args = arguments;
    var i = 0, iz = args.length;
    var length = 0;
    var offset = 0;

    for (; i < iz; ++i) {
        length += args[i].length;
    }

    var result = new Uint8Array(length);

    for (i = 0; i < iz; ++i) {
        result.set(args[i], offset);
        offset += args[i].length;
    }
    return result;
}

function DataType_Uint8Array_expand(source,  // @arg Uint8Array
                                    scale) { // @arg Number = 2 - scale factor
                                             // @ret Uint8Array
//{@dev
    $valid($type(source, "Uint8Array"),  DataType_Uint8Array_expand, "source");
    $valid($type(scale,  "Number|omit"), DataType_Uint8Array_expand, "scale");
//}@dev

    scale = scale || 2;

    var result = new Uint8Array( (source.length * scale) | 0 );

    result.set(source);
    return result;
}

function DataType_Uint8Array_toArray(source) { // @arg Uint8Array
                                               // @ret Array
//{@dev
    $valid($type(source, "Uint8Array"), DataType_Uint8Array_toArray, "source");
//}@dev

    return Array.prototype.slice.call(source);
}

function DataType_Uint8Array_toString(source) { // @arg Uint8Array: [0xff, ...]
                                                // @ret BinaryString:
//{@dev
    $valid($type(source, "Uint8Array"), DataType_Uint8Array_toString, "source");
//}@dev

    var rv = [], i = 0, iz = source.length, bulkSize = 32000;

    // Avoid String.fromCharCode.apply(null, BigArray) exception
    if (iz < bulkSize) {
        return String.fromCharCode.apply(null, source);
    }
    for (; i < iz; i += bulkSize) {
        rv.push( String.fromCharCode.apply(null, source.subarray(i, i + bulkSize)) );
    }
    return rv.join("");
}

function DataType_Uint8Array_fromString(source) { // @arg BinaryString
                                                  // @ret Uint8Array
//{@dev
    $valid($type(source, "BinaryString"), DataType_Uint8Array_fromString, "source");
//}@dev

    var i = 0, iz = source.length;
    var result = new Uint8Array(iz);

    for (; i < iz; ++i) {
        result[i] = source.charCodeAt(i) & 0xff;
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
                             : "DataType"]["Uint8Array"] = DataType_Uint8Array;

})((this || 0).self || global); // WebModule idiom. http://git.io/WebModule

