(function(global) {
"use strict";

// --- dependency modules ----------------------------------
// --- define / local variables ----------------------------
//var _runOnNode = "process" in global;
//var _runOnWorker = "WorkerLocation" in global;
//var _runOnBrowser = "document" in global;

// --- class / interfaces ----------------------------------
function WMDescript() {
//{@dev
  //$args(WMDescript, arguments);
  //$valid($type(value, "Number|Integer|omit"), WMDescript, "value");
//}@dev
}

//{@dev
WMDescript["repository"] = "https://github.com/ikagaka/WMDescript.js"; // GitHub repository URL. http://git.io/Help
//}@dev

WMDescript["parse"] = WMDescript_parse; // WMDescript#parse(descript:String): {[id: string]: string;}


// --- implements ------------------------------------------
function WMDescript_parse(text) { // @arg String
                                  // @ret {[id: String]: String;}
//{@dev
    $args(WMDescript_parse, arguments);
//}@dev
    text = text.replace(/(?:\r\n|\r|\n)/g, "\n"); // CRLF->LF
    while(true){// remove commentout
        var match = (/(?:(?:^|\s)\/\/.*)|^\s+?$/g.exec(text) || ["",""])[0];
        if(match.length === 0) break;
        text = text.replace(match, "");
    }
    var lines = text.split("\n");
    lines = lines.filter(function(line){ return line.length !== 0; }); // remove no content line
    var dic = lines.reduce(function(dic, line){
      var tmp = line.split(",");
      var key = tmp[0];
      var vals = tmp.slice(1);
      key = key.trim();
      var val = vals.join(",").trim();
      dic[key] = val;
      return dic;
    }, {});
    return dic;
}


// --- validate / assertions -------------------------------
//{@dev
//function $valid(val, fn, hint) { if (global["Valid"]) { global["Valid"](val, fn, hint); } }
//function $type(obj, type) { return global["Valid"] ? global["Valid"].type(obj, type) : true; }
//function $keys(obj, str) { return global["Valid"] ? global["Valid"].keys(obj, str) : true; }
//function $some(val, str, ignore) { return global["Valid"] ? global["Valid"].some(val, str, ignore) : true; }
function $args(fn, args) { if (global["Valid"]) { global["Valid"].args(fn, args); } }
//}@dev

// --- exports ---------------------------------------------
if ("process" in global) {
    module["exports"] = WMDescript;
}
global["WMDescript" in global ? "WMDescript_" : "WMDescript"] = WMDescript; // switch module. http://git.io/Minify

})((this || 0).self || global); // WebModule idiom. http://git.io/WebModule
