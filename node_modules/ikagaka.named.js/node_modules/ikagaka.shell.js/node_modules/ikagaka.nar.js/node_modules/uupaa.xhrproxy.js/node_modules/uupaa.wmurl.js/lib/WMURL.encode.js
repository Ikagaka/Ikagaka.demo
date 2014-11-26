//{@wmurlencode
(function(global) {

// --- dependency modules ----------------------------------
// --- define / local variables ----------------------------
//var _runOnNode = "process" in global;
//var _runOnWorker = "WorkerLocation" in global;
//var _runOnBrowser = "document" in global;

// --- class / interfaces ----------------------------------
// --- implements ------------------------------------------
function WMURL_encode(source) { // @arg String
                                // @ret String - percent encoded string
                                // @desc encodeURIComponent impl
//{@dev
    $valid($type(source, "String"), WMURL_encode, "source");
//}@dev

    function _hex(num) {
        return (num < 16) ? "0" + num.toString(16)  // 0x00 ~ 0x0f
                          :       num.toString(16); // 0x10 ~ 0xff
    }

    var rv = [], i = 0, iz = source.length, c = 0, safe;

    for (; i < iz; ++i) {
        c = source.charCodeAt(i);

        if (c < 0x80) { // encode ASCII(0x00 ~ 0x7f)
            safe = c === 95 ||              // _
                   (c >= 48 && c <=  57) || // 0~9
                   (c >= 65 && c <=  90) || // A~Z
                   (c >= 97 && c <= 122);   // a~z

            if (!safe) {
                safe = c === 33  || // !
                       c === 45  || // -
                       c === 46  || // .
                       c === 126 || // ~
                       (c >= 39 && c <= 42); // '()*
            }
            if (safe) {
                rv.push(source.charAt(i));
            } else {
                rv.push("%", _hex(c));
            }
        } else if (c < 0x0800) { // encode UTF-8
            rv.push("%", _hex(((c >>>  6) & 0x1f) | 0xc0),
                    "%", _hex( (c         & 0x3f) | 0x80));
        } else if (c < 0x10000) { // encode UTF-8
            rv.push("%", _hex(((c >>> 12) & 0x0f) | 0xe0),
                    "%", _hex(((c >>>  6) & 0x3f) | 0x80),
                    "%", _hex( (c         & 0x3f) | 0x80));
        }
    }
    return rv.join("");
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
global["WMURL_" in global ? "WMURL_" : "WMURL"]["encode"] =
    global["encodeURIComponent"] || WMURL_encode; // WMURL.encode(source:String):String

})((this || 0).self || global); // WebModule idiom. http://git.io/WebModule
//}@wmurlencode

