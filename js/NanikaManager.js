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
    var nanika, profile;
    profile = this.profile.ghost(dirpath);
    nanika = new Nanika(this, this.storage, this.namedmanager, dirpath, profile, this.options);
    nanika.on('halted', (function(_this) {
      return function() {
        nanika = _this.nanikas[dirpath];
        delete _this.nanikas[dirpath];
        return _this.emit('ghost.halted', dirpath, nanika);
      };
    })(this));
    nanika.options.append_path = "./vendor/js/";
    nanika.options.logging = true;
    return nanika.boot(event, args).then((function(_this) {
      return function() {
        _this.nanikas[dirpath] = nanika;
        switch (event) {
          case 'boot':
            return _this.emit('ghost.booted', dirpath, nanika);
          case 'change':
            return _this.emit('ghost.changed', dirpath, nanika);
          case 'call':
            return _this.emit('ghost.called', dirpath, nanika);
        }
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
