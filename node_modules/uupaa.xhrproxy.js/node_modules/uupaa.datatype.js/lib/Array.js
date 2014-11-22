(function(global) {
"use strict";

// --- dependency modules ----------------------------------
// --- define / local variables ----------------------------
//var _runOnNode = "process" in global;
//var _runOnWorker = "WorkerLocation" in global;
//var _runOnBrowser = "document" in global;

// --- class / interfaces ----------------------------------
var DataType_Array = {
    "toString":         DataType_Array_toString,        // DataType.Array.toString(source:IntegerArray = undefined):BinaryString
    "fromString":       DataType_Array_fromString,      // DataType.Array.fromString(source:BinaryString, bytes:Integer = 1):IntegerArray
    "clampValue":       DataType_Array_clampValue,      // DataType.Array.clampValue(source:TypedArray|IntegerArray, bytes:Integer = 1):TypedArray|IntegerArray
    "toHexStringArray": DataType_Array_toHexStringArray // DataType.Array.toHexStringArray(source:TypedArray|IntegerArray, hexEncode:Boolean = false, bytes:Integer = 1):HexStringArray
};

// --- implements ------------------------------------------
function DataType_Array_toString(source) { // @arg IntegerArray(= undefined): [0xff, ...]
                                           // @ret BinaryString:
//{@dev
    $valid($type(source, "IntegerArray|omit"), DataType_Array_toString, "source");
//}@dev

    if (!source) {
        return "";
    }
    var rv = [], i = 0, iz = source.length, bulkSize = 32000;

    // Avoid String.fromCharCode.apply(null, BigArray) exception
    if (iz < bulkSize) {
        return String.fromCharCode.apply(null, source);
    }
    for (; i < iz; i += bulkSize) {
        rv.push( String.fromCharCode.apply(null, source.slice(i, i + bulkSize)) );
    }
    return rv.join("");
}

function DataType_Array_fromString(source,  // @arg BinaryString -
                                   bytes) { // @arg Integer = 1  - byte size(from 1 to 4)
                                            // @ret IntegerArray - [value, ...]
//{@dev
    $valid($type(source, "BinaryString"), DataType_Array_fromString, "source");
    $valid($type(bytes,  "Integer|omit"), DataType_Array_fromString, "bytes");
    if (bytes) {
        $valid(bytes >= 1 && bytes <= 4, DataType_Array_fromString, "bytes");
    }
//}@dev

    bytes = bytes || 1;

    var i = 0, iz = source.length, rv = new Array(iz);
    var filterBits = Math.pow(256, bytes) - 1; // 0xff, 0xffff, 0xffffff

    for (; i < iz; ++i) {
        rv[i] = source.charCodeAt(i) & filterBits;
    }
    return rv;
}

function DataType_Array_clampValue(source,  // @arg TypedArray|IntegerArray - source: [0x100, 0x101, 0x102]
                                   bytes) { // @arg Integer = 1             - byte size(from 1 to 4): 1 -> 0xff, 2 -> 0xffff, 4 -> 0xffffffff
                                            // @ret TypedArray|IntegerArray - clamped value: [0xff, 0xff, 0xff]
                                            // @desc clamp byte array
//{@dev
    $valid($type(source, "TypedArray|IntegerArray"), DataType_Array_clampValue, "source");
    $valid($type(bytes,  "Integer|omit"),            DataType_Array_clampValue, "bytes");
    if (bytes) {
        $valid(bytes >= 1 && bytes <= 4, DataType_Array_clampValue, "bytes");
    }
//}@dev

    bytes = bytes || 1;

    var i = 0, iz = source.length;
    var value = 0, min = 0, max = Math.pow(256, bytes) - 1;

    for (; i < iz; ++i) {
        value = source[i];
        // clamp
        source[i] = value < min ? min
                  : value > max ? max
                  : value;
    }
    return source;
}

function DataType_Array_toHexStringArray(source,    // @arg TypedArray|IntegerArray - [0x00, 0x41, 0x53, 0x43, 0x49, 0x49, 0xff, ...]
                                         hexEncode, // @arg Boolean = false         - hex encode.
                                         bytes) {   // @arg Integer = 1             - byte size(from 1 to 8). 1 -> 00 ~ ff, 2 -> 0000 ~ ffff, 4 -> 00000000 ~ ffffffff
                                                    // @ret HexStringArray          - ["00", "41", "53", "43", "49", "49", "ff", ...]
                                                    // @desc Convert ByteArray to HexString.
//{@dev
    $valid($type(source,    "TypedArray|IntegerArray"), DataType_Array_toHexStringArray, "source");
    $valid($type(hexEncode, "Boolean|omit"),            DataType_Array_toHexStringArray, "hexEncode");
    $valid($type(bytes,     "Integer|omit"),            DataType_Array_toHexStringArray, "bytes");
    if (bytes) {
        $valid(bytes >= 1 && bytes <= 4, DataType_Array_toHexStringArray, "bytes");
    }
//}@dev

    bytes     = bytes || 1;
    hexEncode = hexEncode || false;

    var rv = [];
    var i = 0, iz = source.length;
    var from = -(bytes * 2);

    if (hexEncode) {
        var rex = /\w/; // [A-Za-z0-9_]

        for (; i < iz; ++i) {
            var c = String.fromCharCode(source[i]);

            if ( rex.test(c) ) {
                rv.push(c);
            } else {
                rv.push( "%" + (source[i] + 0x100000000).toString(16).slice(from) );
            }
        }
    } else {
        for (; i < iz; ++i) {
            rv.push( (source[i] + 0x100000000).toString(16).slice(from) );

        }
    }
    return rv;
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
                             : "DataType"]["Array"] = DataType_Array;

})((this || 0).self || global); // WebModule idiom. http://git.io/WebModule

