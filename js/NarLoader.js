var Encoding, JSZip, NanikaDirectory, NanikaFile, NarLoader, Promise, WMDescript;

if (typeof require !== "undefined" && require !== null) {
  JSZip = require('jszip');
  Encoding = require('encoding-japanese');
  WMDescript = require('ikagaka.wmdescript.js');
  if (typeof Promise === "undefined" || Promise === null) {
    Promise = require('bluebird');
  }
} else {
  JSZip = this.JSZip;
  Encoding = this.Encoding;
  WMDescript = this.WMDescript;
  if (Promise == null) {
    Promise = this.Promise;
  }
}

NarLoader = (function() {
  function NarLoader() {}

  NarLoader.loadFromBuffer = function(buffer) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return resolve(new NanikaDirectory(NarLoader.unzip(buffer), {
          has_install: true
        }));
      };
    })(this));
  };

  NarLoader.loadFromURL = function(src) {
    return NarLoader.wget(src, "arraybuffer").then(this.loadFromBuffer);
  };

  NarLoader.loadFromBlob = function(blob) {
    var url;
    url = URL.createObjectURL(blob);
    return this.loadFromURL(url).then(function(directory) {
      URL.revokeObjectURL(url);
      return directory;
    });
  };

  NarLoader.unzip = function(buffer) {
    var dir, filePath, path, zip;
    zip = new JSZip();
    zip.load(buffer, {
      checkCRC32: true
    });
    dir = {};
    for (filePath in zip.files) {
      path = filePath.split("\\").join("/");
      dir[path] = new NanikaFile(zip.files[filePath]);
    }
    return dir;
  };

  NarLoader.wget = function(url, type) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.addEventListener("load", function() {
          var _ref;
          if ((200 <= (_ref = xhr.status) && _ref < 300)) {
            return resolve(xhr.response);
          } else {
            return reject(xhr.statusText);
          }
        });
        xhr.addEventListener("error", function() {
          return reject(xhr.statusText);
        });
        xhr.open("GET", url);
        xhr.responseType = type;
        return xhr.send();
      };
    })(this));
  };

  return NarLoader;

})();

NanikaFile = (function() {
  function NanikaFile(_buffer) {
    this._buffer = _buffer;
  }

  NanikaFile.prototype.buffer = function() {
    if (this._buffer.asArrayBuffer != null) {
      return this._buffer = this._buffer.asArrayBuffer();
    } else {
      return this._buffer;
    }
  };

  NanikaFile.prototype.toString = function() {
    return Encoding.codeToString(Encoding.convert(new Uint8Array(this.buffer()), 'UNICODE', 'AUTO'));
  };

  NanikaFile.prototype.valueOf = function() {
    return this.buffer();
  };

  return NanikaFile;

})();

NanikaDirectory = (function() {
  function NanikaDirectory(files, options) {
    this.files = files != null ? files : {};
    this.parse(options);
  }

  NanikaDirectory.prototype.parse = function(_arg) {
    var has_descript, has_install, _ref;
    _ref = _arg != null ? _arg : {}, has_install = _ref.has_install, has_descript = _ref.has_descript;
    if (this.files["install.txt"] != null) {
      this.install = WMDescript.parse(this.files["install.txt"].toString());
    } else if (has_install) {
      throw "install.txt not found";
    }
    if (this.files["descript.txt"] != null) {
      return this.descript = WMDescript.parse(this.files["descript.txt"].toString());
    } else if (has_descript) {
      throw "descript.txt not found";
    }
  };

  NanikaDirectory.prototype.asArrayBuffer = function() {
    var directory, file, path, _ref;
    directory = {};
    _ref = this.files;
    for (path in _ref) {
      file = _ref[path];
      directory[path] = this.files[path].buffer();
    }
    return directory;
  };

  NanikaDirectory.prototype.listChildren = function() {
    var children, path, result;
    children = {};
    for (path in this.files) {
      if (result = path.match(/^([^\/]+)/)) {
        children[result[1]] = true;
      }
    }
    return Object.keys(children);
  };

  NanikaDirectory.prototype.getDirectory = function(dirpath, options) {
    var directory, dirpathre;
    dirpathre = this.pathToRegExp(dirpath);
    directory = {};
    Object.keys(this.files).filter(function(path) {
      return dirpathre.test(path);
    }).forEach((function(_this) {
      return function(path) {
        return directory[path.replace(dirpathre, "")] = _this.files[path];
      };
    })(this));
    return new NanikaDirectory(directory, options);
  };

  NanikaDirectory.prototype.wrapDirectory = function(dirpath, options) {
    var directory, dirpathcanon;
    dirpathcanon = this.path.canonical(dirpath);
    directory = {};
    Object.keys(this.files).forEach((function(_this) {
      return function(path) {
        return directory[dirpathcanon + '/' + path] = _this.files[path];
      };
    })(this));
    return new NanikaDirectory(directory, options);
  };

  NanikaDirectory.prototype.getElements = function(elempaths, options) {
    var directory, elempath, elempathre, _i, _len;
    if (!(elempaths instanceof Array)) {
      elempaths = [elempaths];
    }
    directory = {};
    for (_i = 0, _len = elempaths.length; _i < _len; _i++) {
      elempath = elempaths[_i];
      elempathre = this.pathToRegExp(elempath);
      Object.keys(this.files).filter(function(path) {
        return elempathre.test(path);
      }).forEach(function(path) {
        return directory[path] = this.files[path];
      });
    }
    return new NanikaDirectory(directory, options);
  };

  NanikaDirectory.prototype.removeElements = function(elempaths, options) {
    var directory, elempath, elempathre, file, path, _i, _len, _ref;
    if (!(elempaths instanceof Array)) {
      elempaths = [elempaths];
    }
    directory = {};
    _ref = this.files;
    for (path in _ref) {
      file = _ref[path];
      directory[path] = file;
    }
    for (_i = 0, _len = elempaths.length; _i < _len; _i++) {
      elempath = elempaths[_i];
      elempathre = this.pathToRegExp(elempath);
      Object.keys(directory).filter(function(path) {
        return elempathre.test(path);
      }).forEach(function(path) {
        return delete directory[path];
      });
    }
    return new NanikaDirectory(directory, options);
  };

  NanikaDirectory.prototype.pathToRegExp = function(path) {
    return new RegExp('^' + this.path.canonical(path).replace(/(\W)/g, '\\$1') + '(?:$|/)');
  };

  NanikaDirectory.prototype.path = {
    canonical: function(path) {
      return path.replace(/\\/g, '/').replace(/^\.?\//, '').replace(/\/?$/, '');
    }
  };

  return NanikaDirectory;

})();

if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
  module.exports = {
    NarLoader: NarLoader,
    NanikaFile: NanikaFile,
    NanikaDirectory: NanikaDirectory
  };
} else {
  this.NarLoader = NarLoader;
  this.NanikaFile = NanikaFile;
  this.NanikaDirectory = NanikaDirectory;
}
