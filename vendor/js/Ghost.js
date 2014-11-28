// Generated by CoffeeScript 1.8.0
var Ghost;

Ghost = (function() {
  var Nar, Worker, _;

  _ = window["_"];

  Nar = window["Nar"] || window["Ikagaka"]["Nar"] || require("ikagaka.nar.js");

  Worker = window["Worker"];

  function Ghost(directory) {
    var buffer, descriptTxt;
    console.log(directory);
    if (!directory["descript.txt"]) {
      throw new Error("descript.txt not found");
    }
    this.directory = directory;
    buffer = this.directory["descript.txt"].asArrayBuffer();
    descriptTxt = Nar.convert(buffer);
    this.descript = Nar.parseDescript(descriptTxt);
    this.worker = null;
  }

  Ghost.prototype.path = "./";

  Ghost.prototype.logging = false;

  Ghost.prototype.load = function(callback) {
    var buffers, directory, _ref;
    if (!this.directory[this.descript["shiori"]] && !this.directory["shiori.dll"]) {
      return callback(new Error("shiori not found"));
    }
    console.log(this.path);
    switch (Ghost.detectShiori(this.directory)) {
      case "kawari":
        this.worker = new Worker(this.path + "KawariWorker.js");
        break;
      case "kawari7":
        this.worker = new Worker(this.path + "Kawari7Worker.js");
        break;
      case "satori":
        this.worker = new Worker(this.path + "SatoriWorker.js");
        break;
      case "yaya":
        this.worker = new Worker(this.path + "YAYAWorker.js");
        break;
      case "aya5":
        this.worker = new Worker(this.path + "AYA5Worker.js");
        break;
      case "aya":
        return callback(new Error("unsupport shiori"));
      case "miyojs":
        return callback(new Error("unsupport shiori"));
      case "misaka":
        return callback(new Error("unsupport shiori"));
      default:
        return callback(new Error("cannot detect shiori type: " + this.descript["shiori"]));
    }
    _ref = Ghost.createTransferable(this.directory), directory = _ref.directory, buffers = _ref.buffers;
    this.worker.addEventListener("error", function(ev) {
      return console.error(ev.error);
    });
    this.worker.postMessage({
      event: "load",
      data: directory
    }, buffers);
    this.worker.onmessage = function(_arg) {
      var error, event, _ref1;
      _ref1 = _arg.data, event = _ref1.event, error = _ref1.error;
      if (event === "loaded") {
        return callback(error);
      }
    };
    return void 0;
  };

  Ghost.prototype.request = function(request, callback) {
    if (this.logging) {
      console.log(request);
    }
    this.worker.postMessage({
      event: "request",
      data: request
    });
    this.worker.onmessage = (function(_this) {
      return function(_arg) {
        var error, event, response, _ref;
        _ref = _arg.data, event = _ref.event, error = _ref.error, response = _ref.data;
        if (_this.logging) {
          console.log(response);
        }
        if (event === "response") {
          return callback(error, response);
        }
      };
    })(this);
    return void 0;
  };

  Ghost.prototype.unload = function(callback) {
    this.worker.postMessage({
      event: "unload"
    });
    this.worker.onmessage = function(_arg) {
      var error, event, _ref;
      _ref = _arg.data, event = _ref.event, error = _ref.error;
      if (event === "unloaded") {
        return callback(error);
      }
    };
    return void 0;
  };

  Ghost.detectShiori = function(directory) {
    if (!!directory["kawarirc.kis"]) {
      return "kawari";
    }
    if (!!directory["kawari.ini"]) {
      return "kawari7";
    }
    if (!!directory["satori.dll"]) {
      return "satori";
    }
    if (!!directory["yaya.dll"]) {
      return "yaya";
    }
    if (!!directory["aya5.dll"]) {
      return "aya5";
    }
    if (!!directory["aya.dll"]) {
      return "aya";
    }
    if (!!directory["node.exe"]) {
      return "miyojs";
    }
    if (!!directory["misaka.dll"]) {
      return "misaka";
    }
    return "";
  };

  Ghost.createTransferable = function(_directory) {
    return Object.keys(_directory).filter(function(filepath) {
      return !!filepath;
    }).reduce((function(_arg, filepath) {
      var buffer, buffers, directory;
      directory = _arg.directory, buffers = _arg.buffers;
      buffer = _directory[filepath].asArrayBuffer();
      directory[filepath] = buffer;
      buffers.push(buffer);
      return {
        directory: directory,
        buffers: buffers
      };
    }), {
      directory: {},
      buffers: []
    });
  };

  return Ghost;

})();

if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
  module.exports = Ghost;
}

if (window["Ikagaka"] != null) {
  window["Ikagaka"]["Ghost"] = Ghost;
}
