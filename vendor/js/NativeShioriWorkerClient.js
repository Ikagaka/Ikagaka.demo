// Generated by CoffeeScript 1.9.2
(function() {
  var BrowserFS, NanikaStorage, NativeShioriWorkerClient, _buffer, _path, _window;

  NanikaStorage = this.NanikaStorage;

  BrowserFS = this.BrowserFS;

  _window = {};

  BrowserFS.install(_window);

  _path = _window.require('path');

  _buffer = _window.require('buffer');

  NativeShioriWorkerClient = (function() {
    NativeShioriWorkerClient.prototype.worker = function() {
      throw new Error('worker() not implemented');
    };

    function NativeShioriWorkerClient(fs) {
      this.fs = fs;
    }

    NativeShioriWorkerClient.prototype.load = function(dirpath) {
      var fs_root, result;
      result = dirpath.match(/^(.+)ghost[\\\/]([^\/]+)[\\\/]ghost[\\\/]master[\\\/]$/);
      fs_root = result[1];
      this.dirpath = dirpath;
      this.ghostpath = result[2];
      this.storage = new NanikaStorage(new NanikaStorage.Backend.FS(fs_root, this.fs, _path, _buffer.Buffer));
      return this._push(dirpath).then((function(_this) {
        return function() {
          return _this._load(dirpath);
        };
      })(this));
    };

    NativeShioriWorkerClient.prototype._push = function(dirpath) {
      return this.storage.ghost_master(this.ghostpath).then(function(directory) {
        return directory.asArrayBuffer();
      }).then((function(_this) {
        return function(directory) {
          var data, path, transferable;
          transferable = [];
          for (path in directory) {
            data = directory[path];
            transferable.push(data);
          }
          return _this.worker().request('push', [dirpath, directory], transferable);
        };
      })(this));
    };

    NativeShioriWorkerClient.prototype._load = function(dirpath) {
      return this.worker().request('load', dirpath);
    };

    NativeShioriWorkerClient.prototype.request = function(request) {
      return this.worker().request('request', request);
    };

    NativeShioriWorkerClient.prototype.unload = function() {
      return this._unload().then((function(_this) {
        return function(code) {
          return _this._pull(_this.dirpath).then(function() {
            return _this.worker().terminate();
          }).then(function() {
            return code;
          });
        };
      })(this));
    };

    NativeShioriWorkerClient.prototype._unload = function() {
      return this.worker().request('unload');
    };

    NativeShioriWorkerClient.prototype._pull = function(dirpath) {
      return this.worker().request('pull', dirpath).then((function(_this) {
        return function(directory) {
          return _this.storage.ghost_master(_this.ghostpath, new NanikaDirectory(directory));
        };
      })(this));
    };

    return NativeShioriWorkerClient;

  })();

  this.NativeShioriWorkerClient = NativeShioriWorkerClient;

}).call(this);
