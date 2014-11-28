var Named, Promise, SakuraScriptPlayer, Single;

Promise = this.Promise;

Named = this.Named;

SakuraScriptPlayer = this.SakuraScriptPlayer;

if (typeof require !== "undefined" && require !== null) {
  if (Promise == null) {
    Promise = require('bluebird');
  }
}

Single = (function() {
  function Single() {}

  Single.prototype.error = function(err) {
    return console.error(err.stack);
  };

  Single.prototype["throw"] = function(err) {
    if (typeof alert === "function") {
      alert(err);
    }
    throw err;
  };

  Single.prototype.load_nar = function(ghost_nar, balloon_nar, options) {
    return Promise.all([
      new Promise(function(resolve, reject) {
        var ghost;
        ghost = new Ghost(ghost_nar.getDirectory(/ghost\/master\//));
        ghost.path = options.path;
        ghost.logging = options.logging;
        return ghost.load(function(err) {
          if (err != null) {
            return reject(err);
          } else {
            return resolve(ghost);
          }
        });
      }), new Promise(function(resolve, reject) {
        var shell;
        shell = new Shell(ghost_nar.getDirectory(/shell\/master\//));
        return shell.load(function(err) {
          if (err != null) {
            return reject(err);
          } else {
            return resolve(shell);
          }
        });
      }), new Promise(function(resolve, reject) {
        var balloon;
        balloon = new Balloon(balloon_nar.directory);
        return balloon.load(function(err) {
          if (err != null) {
            return reject(err);
          } else {
            return resolve(balloon);
          }
        });
      })
    ]).then((function(_this) {
      return function(_arg) {
        var balloon, ghost, shell;
        ghost = _arg[0], shell = _arg[1], balloon = _arg[2];
        return _this.load(ghost, shell, balloon);
      };
    })(this))["catch"](this["throw"]);
  };

  Single.prototype.load = function(ghost, shell, balloon) {
    this.ghost = ghost;
    this.shell = shell;
    this.balloon = balloon;
    this.named = new Named(this.shell, this.balloon);
    this.ssp = new SakuraScriptPlayer(this.named);
    this.resource = {};
    this.charset = 'UTF-8';
    return this.sender = 'Ikagaka';
  };

  Single.prototype.run = function(dom) {
    this.transaction = new Promise(function(resolve) {
      return resolve();
    });
    $(this.named.element).on("IkagakaSurfaceEvent", (function(_this) {
      return function(ev) {
        return _this.transaction = _this.transaction.then(function() {
          return _this.send_request(['GET', 'Sentence'], _this.protocol_version, ev.detail).then(function(response) {
            return _this.recv_response(response);
          });
        });
      };
    })(this)).appendTo(dom);
    this.run_version();
    this.run_boot();
    return this.run_timer();
  };

  Single.prototype.run_version = function() {
    return this.transaction = this.transaction.then((function(_this) {
      return function() {
        return _this.send_request(['GET', 'Version'], '2.6', {});
      };
    })(this)).then((function(_this) {
      return function(response) {
        if (response.status_line.code === 200 && response.status_line.version !== '3.0') {
          _this.protocol_version = '2.6';
          _this.charset = response.headers.header.Charset;
          return _this.resource.version = response.headers.header.Version({
            name: response.headers.header.ID,
            craftman: response.headers.header.Craftman,
            craftmanw: response.headers.header.Craftman
          });
        } else {
          _this.protocol_version = '3.0';
          _this.charset = response.headers.header.Charset;
          return _this.send_request(['GET'], _this.protocol_version, {
            ID: 'version'
          }).then(function(response) {
            return _this.resource.version = response.headers.header.Value;
          }).then(function() {
            return _this.send_request(['GET'], _this.protocol_version, {
              ID: 'name'
            });
          }).then(function(response) {
            return _this.resource.name = response.headers.header.Value;
          }).then(function() {
            return _this.send_request(['GET'], _this.protocol_version, {
              ID: 'craftman'
            });
          }).then(function(response) {
            return _this.resource.craftman = response.headers.header.Value;
          }).then(function() {
            return _this.send_request(['GET'], _this.protocol_version, {
              ID: 'craftmanw'
            });
          }).then(function(response) {
            return _this.resource.craftmanw = response.headers.header.Value;
          });
        }
      };
    })(this));
  };

  Single.prototype.run_boot = function() {
    return this.transaction = this.transaction.then((function(_this) {
      return function() {
        if (_this.protocol_version === '3.0') {
          return _this.send_request(['NOTIFY'], _this.protocol_version, {
            ID: "ownerghostname",
            Reference0: _this.ghost.descript['name']
          }).then(function() {
            return _this.send_request(['NOTIFY'], _this.protocol_version, {
              ID: "basewareversion",
              Reference0: '0.0.0',
              Reference1: 'Ikagaka'
            });
          }).then(function() {
            return _this.send_request(['NOTIFY'], _this.protocol_version, {
              ID: "OnNotifySelfInfo",
              Reference0: _this.ghost.descript['name'],
              Reference1: _this.ghost.descript['sakura.name'],
              Reference2: _this.ghost.descript['kero.name'],
              Reference3: _this.shell.descript['name'],
              Reference5: _this.balloon.descript['name']
            });
          }).then(function() {
            return _this.send_request(['NOTIFY'], _this.protocol_version, {
              ID: "OnNotifyBalloonInfo",
              Reference0: _this.balloon.descript['name']
            });
          }).then(function() {
            return _this.send_request(['NOTIFY'], _this.protocol_version, {
              ID: "OnNotifyShellInfo",
              Reference0: _this.shell.descript['name']
            });
          });
        } else {
          return _this.send_request(['NOTIFY', 'OwnerGhostName'], _this.protocol_version, {
            Ghost: _this.ghost.descript['name']
          });
        }
      };
    })(this)).then((function(_this) {
      return function() {
        return _this.send_request(['GET', 'String'], _this.protocol_version, {
          ID: "username"
        });
      };
    })(this)).then((function(_this) {
      return function(response) {
        return _this.resource.username = response.headers.header[_this.string_header(_this.protocol_version)];
      };
    })(this)).then((function(_this) {
      return function() {
        return _this.send_request(['NOTIFY', null], _this.protocol_version, {
          ID: "otherghostname"
        });
      };
    })(this)).then((function(_this) {
      return function() {
        return _this.send_request(['NOTIFY', null], _this.protocol_version, {
          ID: "installedghostname",
          Reference0: _this.ghost.descript['name']
        });
      };
    })(this)).then((function(_this) {
      return function() {
        return _this.send_request(['NOTIFY', null], _this.protocol_version, {
          ID: "installedballoonname",
          Reference0: _this.balloon.descript['name']
        });
      };
    })(this)).then((function(_this) {
      return function() {
        return _this.send_request(['NOTIFY', null], _this.protocol_version, {
          ID: "installedshellname",
          Reference0: _this.shell.descript['name']
        });
      };
    })(this)).then((function(_this) {
      return function() {
        return _this.send_request(['GET', 'String'], _this.protocol_version, {
          ID: "sakura.recommendsites"
        });
      };
    })(this)).then((function(_this) {
      return function(response) {
        return _this.resource["sakura.recommendsites"] = response.headers.get_separated2(_this.string_header(_this.protocol_version));
      };
    })(this)).then((function(_this) {
      return function() {
        return _this.send_request(['GET', 'String'], _this.protocol_version, {
          ID: "sakura.portalsites"
        });
      };
    })(this)).then((function(_this) {
      return function(response) {
        return _this.resource["sakura.portalsites"] = response.headers.get_separated2(_this.string_header(_this.protocol_version));
      };
    })(this)).then((function(_this) {
      return function() {
        return _this.send_request(['GET', 'String'], _this.protocol_version, {
          ID: "kero.recommendsites"
        });
      };
    })(this)).then((function(_this) {
      return function(response) {
        return _this.resource["kero.recommendsites"] = response.headers.get_separated2(_this.string_header(_this.protocol_version));
      };
    })(this)).then((function(_this) {
      return function() {
        return _this.send_request(['GET'], _this.protocol_version, {
          ID: "OnBoot",
          Reference0: "0",
          Reference6: "",
          Reference7: ""
        });
      };
    })(this)).then((function(_this) {
      return function(response) {
        return _this.recv_response(response);
      };
    })(this));
  };

  Single.prototype.run_timer = function() {
    var id_OnMinuteChange, id_OnSecondChange;
    id_OnSecondChange = setInterval((function(_this) {
      return function() {
        if (!_this.transaction) {
          return clearInterval(id_OnSecondChange);
        }
        return _this.transaction = _this.transaction.then(function() {
          return _this.send_request(['GET'], _this.protocol_version, {
            ID: "OnSecondChange",
            Reference0: "0",
            Reference1: "0",
            Reference2: "0",
            Reference3: "1"
          });
        }).then(function(response) {
          return _this.recv_response(response);
        });
      };
    })(this), 1000);
    return id_OnMinuteChange = setInterval((function(_this) {
      return function() {
        if (!_this.transaction) {
          return clearInterval(id_OnMinuteChange);
        }
        return _this.transaction = _this.transaction.then(function() {
          return _this.send_request(['GET'], _this.protocol_version, {
            ID: "OnMinuteChange",
            Reference0: "0",
            Reference1: "0",
            Reference2: "0",
            Reference3: "1"
          });
        }).then(function(response) {
          return _this.recv_response(response);
        });
      };
    })(this), 60000);
  };

  Single.prototype.send_request = function(method, version, headers) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var key, request, value;
        request = new ShioriJK.Message.Request();
        request.request_line.protocol = "SHIORI";
        request.request_line.version = version;
        request.headers.header["Sender"] = _this.sender;
        request.headers.header["Charset"] = _this.charset;
        if (version === '3.0') {
          request.request_line.method = method[0];
        } else {
          if (method[1] === null) {
            return;
          }
          request.request_line.method = method[0] + ' ' + (method[1] || 'Sentence');
          if (method[1] === 'Sentence' && (headers["ID"] != null)) {
            headers["Event"] = headers["ID"];
            delete headers["ID"];
          }
        }
        for (key in headers) {
          value = headers[key];
          request.headers.header[key] = '' + value;
        }
        return _this.ghost.request("" + request, function(err, response) {
          if (err != null) {
            return reject(err);
          } else {
            return resolve(response);
          }
        });
      };
    })(this))["catch"](this["throw"]).then(function(response) {
      var parser;
      if (response == null) {
        return;
      }
      parser = new ShioriJK.Shiori.Response.Parser();
      return parser.parse(response);
    });
  };

  Single.prototype.recv_response = function(response) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var ss;
        if (response.status_line.code === 200) {
          ss = null;
          if (response.status_line.version === '3.0') {
            ss = response.headers.header.Value;
          } else {
            ss = response.headers.header.Sentence;
          }
          if ((ss != null) && (typeof ss === "string" || ss instanceof String)) {
            _this.ssp.play(ss);
          }
        }
        return resolve(response);
      };
    })(this))["catch"](this.error);
  };

  Single.prototype.string_header = function(version) {
    if (version === '3.0') {
      return 'Value';
    } else {
      return 'String';
    }
  };

  return Single;

})();

if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
  module.exports = Single;
} else if (this.Ikagaka != null) {
  this.Ikagaka.Single = Single;
} else {
  this.Single = Single;
}
