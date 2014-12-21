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
    this.setMaxListeners(0);
    this.nanikas = {};
  }

  NanikaManager.prototype.existing_ghosts = function() {
    return Object.keys(this.nanikas);
  };

  NanikaManager.prototype.is_existing_ghost = function(dirpath) {
    return this.nanikas[dirpath] != null;
  };

  NanikaManager.prototype.bootall = function() {
    var dirpath, _i, _len, _ref, _results;
    if (this.profile.profile.ghosts != null) {
      _ref = this.profile.profile.ghosts;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        dirpath = _ref[_i];
        _results.push(this.boot(dirpath));
      }
      return _results;
    }
  };

  NanikaManager.prototype.boot = function(dirpath) {
    return this.materialize(dirpath).then((function(_this) {
      return function(nanika) {
        var promise;
        if (nanika.profile.profile.boot_count === 1) {
          promise = _this.transact_firstboot(nanika, nanika.profile.profile.vanish_count || 0);
        } else {
          promise = _this.transact_boot(nanika, false, null);
        }
        return promise.then(function(boot_script) {});
      };
    })(this));
  };

  NanikaManager.prototype.change = function(src_dirpath, dst_dirpath, reason) {
    var src_nanika, src_nanika_descript;
    if (reason == null) {
      reason = 'manual';
    }
    src_nanika = this.nanikas[src_dirpath];
    src_nanika_descript = {
      ghost: src_nanika.ghost.descript,
      shell: src_nanika.named.shell.descript
    };
    return new Promise((function(_this) {
      return function(resolve, reject) {
        if (src_nanika == null) {
          reject(new Error("ghost [" + src_dirpath + "] not running"));
        }
        if (_this.nanikas[dst_dirpath] != null) {
          reject(new Error("ghost [" + dst_dirpath + "] already running"));
        }
        return resolve();
      };
    })(this)).then((function(_this) {
      return function() {
        var close_promise, dst_ghost_master, halt_promise;
        dst_ghost_master = _this.storage.ghost_master(dst_dirpath);
        halt_promise = new Promise(function(resolve, reject) {
          return src_nanika.on('halted', function() {
            return resolve();
          });
        });
        close_promise = new Promise(function(resolve, reject) {
          _this.no_halt = true;
          return _this.transact_changing(src_nanika, dst_ghost_master, reason).then(function(changing_script) {
            if (changing_script == null) {
              delete _this.no_halt;
              return;
            }
            src_nanika.halt();
            return resolve(changing_script);
          });
        });
        return Promise.all([close_promise, halt_promise]);
      };
    })(this)).then((function(_this) {
      return function(_arg) {
        var changing_script;
        changing_script = _arg[0];
        return _this.materialize(dst_dirpath).then(function(dst_nanika) {
          var promise;
          delete _this.no_halt;
          if (dst_nanika.profile.profile.boot_count === 1) {
            promise = _this.transact_firstboot(dst_nanika, dst_nanika.profile.profile.vanish_count || 0);
          } else {
            promise = _this.transact_changed(src_nanika_descript, dst_nanika, changing_script);
          }
          return promise.then(function(changed_script) {
            var other_dirpath, other_nanika, _ref;
            _ref = _this.nanikas;
            for (other_dirpath in _ref) {
              other_nanika = _ref[other_dirpath];
              if (src_dirpath !== other_dirpath && dst_dirpath !== other_dirpath) {
                _this.transact_otherchanged(other_nanika, src_nanika_descript, dst_nanika, changing_script, changed_script);
              }
            }
          });
        });
      };
    })(this));
  };

  NanikaManager.prototype.call = function(src_dirpath, dst_dirpath, reason) {
    var src_nanika;
    if (reason == null) {
      reason = 'manual';
    }
    src_nanika = this.nanikas[src_dirpath];
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var dst_ghost_master;
        if (src_nanika == null) {
          reject(new Error("ghost [" + src_dirpath + "] not running"));
        }
        if (_this.nanikas[dst_dirpath] != null) {
          reject(new Error("ghost [" + dst_dirpath + "] already running"));
        }
        dst_ghost_master = _this.storage.ghost_master(dst_dirpath);
        return resolve(_this.transact_calling(src_nanika, dst_ghost_master, reason));
      };
    })(this)).then((function(_this) {
      return function(calling_script) {
        if (calling_script == null) {
          return;
        }
        return _this.materialize(dst_dirpath).then(function(dst_nanika) {
          var promise;
          if (dst_nanika.profile.profile.boot_count === 1) {
            promise = _this.transact_firstboot(dst_nanika, dst_nanika.profile.profile.vanish_count || 0);
          } else {
            promise = _this.transact_called(src_nanika, dst_nanika, calling_script);
          }
          return promise.then(function(called_script) {
            var other_dirpath, other_nanika, _ref;
            _this.transact_callcomplete(src_nanika, dst_nanika, called_script);
            _ref = _this.nanikas;
            for (other_dirpath in _ref) {
              other_nanika = _ref[other_dirpath];
              if (src_dirpath !== other_dirpath && dst_dirpath !== other_dirpath) {
                _this.transact_otherbooted(other_nanika, dst_nanika, called_script);
              }
            }
          });
        });
      };
    })(this));
  };

  NanikaManager.prototype.close = function(dirpath, reason) {
    var nanika, nanika_descript;
    if (reason == null) {
      reason = 'user';
    }
    nanika = this.nanikas[dirpath];
    nanika_descript = {
      ghost: nanika.ghost.descript,
      shell: nanika.named.shell.descript
    };
    return new Promise((function(_this) {
      return function(resolve, reject) {
        if (nanika == null) {
          throw "ghost [" + dirpath + "] not running";
        }
        return resolve();
      };
    })(this)).then((function(_this) {
      return function() {
        var close_promise, halt_promise;
        halt_promise = new Promise(function(resolve, reject) {
          return nanika.on('halted', function() {
            return resolve();
          });
        });
        close_promise = new Promise(function(resolve, reject) {
          return _this.transact_close(nanika, reason).then(function(close_script) {
            if (close_script == null) {
              return;
            }
            nanika.halt();
            return resolve(close_script);
          });
        });
        return Promise.all([close_promise, halt_promise]);
      };
    })(this)).then((function(_this) {
      return function(_arg) {
        var close_script, other_dirpath, other_nanika, _ref, _results;
        close_script = _arg[0];
        _ref = _this.nanikas;
        _results = [];
        for (other_dirpath in _ref) {
          other_nanika = _ref[other_dirpath];
          if (dirpath !== other_dirpath) {
            _results.push(_this.transact_otherclosed(other_nanika, nanika_descript, close_script));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
    })(this));
  };

  NanikaManager.prototype.closeall = function(reason) {
    var dirpath, nanika, promise, promises, _ref;
    if (reason == null) {
      reason = 'user';
    }
    this.haltghosts = Object.keys(this.nanikas);
    promises = [];
    _ref = this.nanikas;
    for (dirpath in _ref) {
      nanika = _ref[dirpath];
      promise = this.transact_closeall(nanika, reason).then(((function(_this) {
        return function(nanika) {
          return function(script) {
            if (script != null) {
              return nanika.halt();
            } else {
              return delete _this.haltghosts;
            }
          };
        };
      })(this))(nanika));
      promises.push(promise);
    }
    return Promise.all(promises);
  };

  NanikaManager.prototype.materialize = function(dirpath) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var nanika, profile;
        if (_this.nanikas[dirpath] != null) {
          return reject(new Error("ghost [" + dirpath + "] already running"));
        }
        profile = _this.profile.ghost(dirpath);
        nanika = new Nanika(_this, _this.storage, _this.namedmanager, dirpath, profile, NanikaPlugin, NanikaEventDefinition, _this.options);
        nanika.on('halted', function() {
          return _this.halted(dirpath);
        });
        nanika.options.append_path = "./vendor/js/";
        nanika.options.logging = true;
        return nanika.materialize().then(function(nanika) {
          _this.nanikas[dirpath] = nanika;
          _this.emit('change.existing.ghosts');
          return resolve(nanika);
        });
      };
    })(this));
  };

  NanikaManager.prototype.halted = function(dirpath) {
    delete this.nanikas[dirpath];
    this.emit('change.existing.ghosts');
    if (!this.no_halt && !Object.keys(this.nanikas).length) {
      if (this.haltghosts) {
        this.profile.profile.ghosts = this.haltghosts;
      } else {
        this.profile.profile.ghosts = [dirpath];
      }
      return this.destroy();
    }
  };

  NanikaManager.prototype.destroy = function() {
    this.emit('destroy');
    delete this.storage;
    delete this.profile;
    delete this.namedmanager;
    delete this.options;
    delete this.nanikas;
    this.emit('destroyed');
    return this.removeAllListeners();
  };

  NanikaManager.prototype.communicate = function(from, to, script, args, age, surface) {
    var dirpath, nanika, to_match, to_single, _i, _len, _ref, _ref1, _ref2, _results;
    if (to === '__SYSTEM_ALL_GHOST__') {
      to_match = {};
      _ref = this.nanikas;
      for (dirpath in _ref) {
        nanika = _ref[dirpath];
        to_match[nanika.ghost.descript.sakuraname] = true;
      }
    } else if (/\x01/.test(to)) {
      to_match = {};
      _ref1 = to.split(/\x01/);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        to_single = _ref1[_i];
        to_match[to_single] = true;
      }
    } else {
      to_match = {
        to: true
      };
    }
    _ref2 = this.nanikas;
    _results = [];
    for (dirpath in _ref2) {
      nanika = _ref2[dirpath];
      if (to_match[nanika.ghost.descript.sakuraname]) {
        _results.push(nanika.request('communicate', {
          sender: from,
          content: script,
          args: args,
          age: age,
          surface: surface
        }));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  NanikaManager.prototype._request_callback = function(resolve) {
    return function(args) {
      var _ref;
      if (!((_ref = args.value) != null ? _ref.length : void 0)) {
        return resolve('');
      }
    };
  };

  NanikaManager.prototype._request_ssp_callbacks = function(resolve) {
    return {
      finish: function(args) {
        return resolve(args.value);
      },
      reject: function(args) {
        return resolve(null);
      },
      "break": function(args) {
        return resolve(null);
      }
    };
  };

  NanikaManager.prototype.transact_firstboot = function(nanika, vanish_count) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return nanika.request('firstboot', {
          vanish_count: vanish_count
        }, _this._request_callback(resolve), _this._request_ssp_callbacks(resolve));
      };
    })(this)).then((function(_this) {
      return function(script) {
        if (script != null ? script.length : void 0) {
          return script;
        } else {
          return _this.transact_boot(nanika, false, null);
        }
      };
    })(this));
  };

  NanikaManager.prototype.transact_boot = function(nanika, halted, halted_ghost) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return nanika.request('boot', {
          shell_name: nanika.named.shell.descript.name,
          halted: false,
          halted_ghost: null
        }, _this._request_callback(resolve), _this._request_ssp_callbacks(resolve));
      };
    })(this));
  };

  NanikaManager.prototype.transact_close = function(nanika, reason) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return nanika.request('close', {
          reason: reason
        }, _this._request_callback(resolve), _this._request_ssp_callbacks(resolve));
      };
    })(this));
  };

  NanikaManager.prototype.transact_closeall = function(nanika, reason) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return nanika.request('closeall', {
          reason: reason
        }, _this._request_callback(resolve), _this._request_ssp_callbacks(resolve));
      };
    })(this)).then((function(_this) {
      return function(script) {
        if (script != null ? script.length : void 0) {
          return script;
        } else {
          return _this.transact_close(nanika, reason);
        }
      };
    })(this));
  };

  NanikaManager.prototype.transact_changed = function(src_nanika_descript, dst_nanika, changing_script) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return dst_nanika.request('changed', {
          from_sakuraname: src_nanika_descript.ghost.sakuraname,
          from_script: changing_script,
          from_name: src_nanika_descript.ghost.name,
          shell_name: dst_nanika.named.shell.descript.name
        }, _this._request_callback(resolve), _this._request_ssp_callbacks(resolve));
      };
    })(this)).then((function(_this) {
      return function(script) {
        if (script != null ? script.length : void 0) {
          return script;
        } else {
          return _this.transact_boot(dst_nanika, false, null);
        }
      };
    })(this));
  };

  NanikaManager.prototype.transact_changing = function(src_nanika, dst_ghost_master, reason) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return src_nanika.request('changing', {
          to_sakuraname: dst_ghost_master.descript.sakuraname,
          reason: reason,
          to_name: dst_ghost_master.descript.name
        }, _this._request_callback(resolve), _this._request_ssp_callbacks(resolve));
      };
    })(this)).then((function(_this) {
      return function(script) {
        if (script != null ? script.length : void 0) {
          return script;
        } else {
          return _this.transact_close(src_nanika, 'user');
        }
      };
    })(this));
  };

  NanikaManager.prototype.transact_called = function(src_nanika, dst_nanika, calling_script) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return dst_nanika.request('called', {
          from_sakuraname: src_nanika.ghost.descript.sakuraname,
          from_script: calling_script,
          from_name: src_nanika.ghost.descript.name,
          shell_name: dst_nanika.named.shell.descript.name
        }, _this._request_callback(resolve), _this._request_ssp_callbacks(resolve));
      };
    })(this)).then((function(_this) {
      return function(script) {
        if (script != null ? script.length : void 0) {
          return script;
        } else {
          return _this.transact_boot(dst_nanika, false, null);
        }
      };
    })(this));
  };

  NanikaManager.prototype.transact_calling = function(src_nanika, dst_ghost_master, reason) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return src_nanika.request('calling', {
          other_sakuraname: dst_ghost_master.descript.sakuraname,
          reason: reason,
          other_name: dst_ghost_master.descript.name
        }, _this._request_callback(resolve), _this._request_ssp_callbacks(resolve));
      };
    })(this));
  };

  NanikaManager.prototype.transact_callcomplete = function(src_nanika, dst_nanika, called_script) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return src_nanika.request('callcomplete', {
          other_sakuraname: dst_nanika.ghost.descript.sakuraname,
          other_script: called_script,
          other_name: dst_nanika.ghost.descript.name,
          other_shell_name: dst_nanika.named.shell.descript.name
        }, _this._request_callback(resolve), _this._request_ssp_callbacks(resolve));
      };
    })(this));
  };

  NanikaManager.prototype.transact_otherbooted = function(other_nanika, nanika, boot_script) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return other_nanika.request('otherbooted', {
          other_sakuraname: nanika.ghost.descript.sakuraname,
          other_script: boot_script,
          other_name: nanika.ghost.descript.name,
          other_shell_name: nanika.named.shell.descript.name
        }, _this._request_callback(resolve), _this._request_ssp_callbacks(resolve));
      };
    })(this));
  };

  NanikaManager.prototype.transact_otherchanged = function(other_nanika, src_nanika_descript, dst_nanika, changing_script, changed_script) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return other_nanika.request('otherchanged', {
          from_sakuraname: src_nanika_descript.ghost.sakuraname,
          to_sakuraname: dst_nanika.ghost.descript.sakuraname,
          from_script: changing_script,
          to_script: changed_script,
          from_name: src_nanika_descript.ghost.name,
          to_name: dst_nanika.ghost.descript.name,
          from_shell_name: src_nanika_descript.shell.name,
          to_shell_name: dst_nanika.named.shell.descript.name
        }, _this._request_callback(resolve), _this._request_ssp_callbacks(resolve));
      };
    })(this));
  };

  NanikaManager.prototype.transact_otherclosed = function(other_nanika, nanika_descript, close_script) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return other_nanika.request('otherclosed', {
          other_sakuraname: nanika_descript.ghost.sakuraname,
          other_script: close_script,
          other_name: nanika_descript.ghost.name,
          other_shell_name: nanika_descript.shell.name
        }, _this._request_callback(resolve), _this._request_ssp_callbacks(resolve));
      };
    })(this));
  };

  return NanikaManager;

})(EventEmitter);
