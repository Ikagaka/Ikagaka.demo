//{@wmurldecode
(function(global) {

// --- dependency modules ----------------------------------
// --- define / local variables ----------------------------
//var _runOnNode = "process" in global;
//var _runOnWorker = "WorkerLocation" in global;
//var _runOnBrowser = "document" in global;

// --- class / interfaces ----------------------------------
// --- implements ------------------------------------------
function WMURL_decode(source) { // @arg String - percent encoded string.
                                // @ret String - decode string.
                                // @throws Error("invalid WMURL.decode")
                                // @desc decodeURIComponent impl.
//{@dev
    $valid($type(source, "String"), WMURL_decode, "source");
//}@dev

    return source.replace(/(%[\da-f][\da-f])+/g, function(match) {
        var rv = [];
        var ary = match.split("%").slice(1), i = 0, iz = ary.length;
        var a = 0, b = 0, c = 0; // UTF-8 bytes

        for (; i < iz; ++i) {
            a = parseInt(ary[i], 16);

            if (a !== a) { // isNaN(a)
                throw new Error("invalid WMURL.decode");
            }

            // decode UTF-8
            if (a < 0x80) { // ASCII(0x00 ~ 0x7f)
                rv.push(a);
            } else if (a < 0xE0) {
                b = parseInt(ary[++i], 16);
                rv.push((a & 0x1f) <<  6 | (b & 0x3f));
            } else if (a < 0xF0) {
                b = parseInt(ary[++i], 16);
                c = parseInt(ary[++i], 16);
                rv.push((a & 0x0f) << 12 | (b & 0x3f) << 6
                                         | (c & 0x3f));
            }
        }
        return String.fromCharCode.apply(null, rv);
    });
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
global["WMURL_" in global ? "WMURL_" : "WMURL"]["decode"] =
    global["decodeURIComponent"] || WMURL_decode; // WMURL.decode(source:String):String

})((this || 0).self || global); // WebModule idiom. http://git.io/WebModule
//}@wmurldecode

