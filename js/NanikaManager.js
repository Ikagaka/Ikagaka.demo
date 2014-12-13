var EventEmitter, Nanika, NanikaManager, Promise,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Promise = this.Promise;

Nanika = this.Nanika;

EventEmitter = this.EventEmitter2;

NanikaManager = (function(_super) {
  __extends(NanikaManager, _super);

  function NanikaManager(storage, profile, namedmanager, options) {
    this.storage = storage;
    this.profile = profile;
    this.namedmanager = namedmanager;
    this.options = options;
    this.nanikas = {};
  }

  NanikaManager.prototype.boot = function(dirpath, event, args) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var nanika, profile;
        if (_this.nanikas[dirpath] != null) {
          reject(new Error("ghost [" + dirpath + "] already running"));
        }
        profile = _this.profile.ghost(dirpath);
        nanika = new Nanika(_this, _this.storage, _this.namedmanager, dirpath, profile, _this.options);
        nanika.on('halted', function() {
          nanika = _this.nanikas[dirpath];
          delete _this.nanikas[dirpath];
          return _this.emit('ghost.halted', dirpath, nanika);
        });
        nanika.options.append_path = "./vendor/js/";
        nanika.options.logging = true;
        return nanika.boot(event, args).then(function() {
          _this.nanikas[dirpath] = nanika;
          switch (event) {
            case 'boot':
              _this.emit('ghost.booted', dirpath, nanika);
              break;
            case 'change':
              _this.emit('ghost.changed', dirpath, nanika);
              break;
            case 'call':
              _this.emit('ghost.called', dirpath, nanika);
          }
          return resolve();
        });
      };
    })(this));
  };

  NanikaManager.prototype.call = function(old_dirpath, new_dirpath) {};

  NanikaManager.prototype.change = function(old_dirpath, new_dirpath) {
    var change;
    change = (function(_this) {
      return function(dirpath, nanika) {
        if (dirpath === old_dirpath) {
          _this.off('ghost.halted', change);
          return _this.boot(new_dirpath, 'change', {
            from: nanika
          });
        }
      };
    })(this);
    this.on('ghost.halted', change);
    return this.halt(old_dirpath, 'change');
  };

  NanikaManager.prototype.halt = function(dirpath, event, args) {
    if (this.nanikas[dirpath] == null) {
      throw "ghost [" + dirpath + "] not running";
    }
    return this.nanikas.send_halt(event, args);
  };

  return NanikaManager;

})(EventEmitter);
