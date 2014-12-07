

var EventEmitter, Nanika, Promise, SakuraScriptPlayer,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

Promise = this.Promise;

SakuraScriptPlayer = this.SakuraScriptPlayer;

EventEmitter = this.EventEmitter2;

Nanika = (function(_super) {
  __extends(Nanika, _super);

  function Nanika(nanikamanager, storage, namedmanager, ghostpath, profile, options) {
    this.nanikamanager = nanikamanager;
    this.storage = storage;
    this.namedmanager = namedmanager;
    this.ghostpath = ghostpath;
    this.profile = profile;
    this.options = options;
    this.charset = 'UTF-8';
    this.sender = 'Ikagaka';
    this.state = 'init';
    this.options = {};
  }

  Nanika.prototype.error = function(err) {
    return console.error(err.stack);
  };

  Nanika.prototype["throw"] = function(err) {
    if (typeof alert === "function") {
      alert(err);
    }
    throw err;
  };

  Nanika.prototype.load_ghost = function() {
    var ghost;
    console.log("initializing ghost");
    ghost = new Ghost(this.storage.ghost_master(this.ghostpath).asArrayBuffer());
    ghost.path += this.options.append_path;
    ghost.logging = this.options.logging;
    return ghost.load().then(function() {
      console.log("ghost loaded");
      return ghost;
    });
  };

  Nanika.prototype.load_shell = function(shellpath) {
    var shell;
    console.log("initializing shell");
    shell = new Shell(this.storage.shell(this.ghostpath, shellpath).asArrayBuffer());
    return shell.load().then((function(_this) {
      return function() {
        console.log("shell loaded");
        _this.profile.profile.shellpath = shellpath;
        return shell;
      };
    })(this));
  };

  Nanika.prototype.load_balloon = function(balloonpath) {
    var balloon;
    console.log("initializing balloon");
    balloon = new Balloon(this.storage.balloon(balloonpath).asArrayBuffer());
    return balloon.load().then((function(_this) {
      return function() {
        console.log("balloon loaded");
        _this.profile.profile.balloonpath = balloonpath;
        return balloon;
      };
    })(this));
  };

  Nanika.prototype.boot = function(event, args) {
    var balloonpath, shellpath;
    shellpath = this.profile.profile.shellpath || 'master';
    balloonpath = this.profile.profile.balloonpath || this.nanikamanager.profile.profile.balloonpath;
    return Promise.all([this.load_ghost(), this.materialize_named(shellpath, balloonpath)]).then((function(_this) {
      return function(_arg) {
        var ghost;
        ghost = _arg[0];
        _this.ghost = ghost;
        _this.resource = {};
        return console.log("materialized");
      };
    })(this)).then((function(_this) {
      return function() {
        _this.transaction = new Promise(function(resolve) {
          return resolve();
        });
        _this.state = 'running';
        _this.set_named_handler();
        _this.set_ssp_handler();
        _this.run_version();
        _this.run_pre_boot();
        _this.run_boot(event, args);
        return _this.run_timer();
      };
    })(this))["catch"](this["throw"]);
  };

  Nanika.prototype.change_named = function(shellpath, balloonpath) {
    if (this.named != null) {
      this.vanish_named();
    }
    return this.materialize_named(shellpath, balloonpath);
  };

  Nanika.prototype.materialize_named = function(shellpath, balloonpath) {
    return Promise.all([this.load_shell(shellpath), this.load_balloon(balloonpath)]).then((function(_this) {
      return function(_arg) {
        var balloon, shell;
        shell = _arg[0], balloon = _arg[1];
        _this.namedid = _this.namedmanager.materialize(shell, balloon);
        _this.named = _this.namedmanager.named(_this.namedid);
        _this.ssp = new SakuraScriptPlayer(_this.named);
      };
    })(this));
  };

  Nanika.prototype.vanish_named = function() {
    if (this.ssp != null) {
      this.ssp.off();
      delete this.ssp;
    }
    if (this.namedid != null) {
      this.namedmanager.vanish(this.namedid);
      delete this.named;
      return delete this.namedid;
    }
  };

  Nanika.prototype.send_halt = function(event, args) {
    return this.transaction = this.transaction.then((function(_this) {
      return function() {
        switch (event) {
          case 'close':
            return _this.send_request(['GET'], _this.protocol_version, {
              ID: "OnClose",
              Reference0: args.reason
            }).then(function(response) {
              if (response.status_line.code !== 200) {
                return _this.halt();
              } else {
                return _this.recv_response(response, {
                  finish: function() {
                    return _this.halt();
                  }
                });
              }
            });
          case 'closeall':
            return _this.send_request(['GET'], _this.protocol_version, {
              ID: "OnCloseAll",
              Reference0: args.reason
            }).then(function(response) {
              if (response.status_line.code === 200) {
                return _this.recv_response(response, {
                  finish: function() {
                    return _this.halt();
                  }
                });
              } else {
                return _this.send_request(['GET'], _this.protocol_version, {
                  ID: "OnClose"
                }).then(function(response) {
                  if (response.status_line.code !== 200) {
                    return _this.halt();
                  } else {
                    return _this.recv_response(response, {
                      finish: function() {
                        return _this.halt();
                      }
                    });
                  }
                });
              }
            });
          case 'change':
            return _this.send_request(['GET'], _this.protocol_version, {
              ID: "OnGhostChanging",
              Reference0: args.to.sakuraname,
              Reference1: args.reason,
              Reference2: args.to.name
            }).then(function(response) {
              if (response.status_line.code !== 200) {
                return _this.halt();
              } else {
                return _this.recv_response(response, {
                  finish: function() {
                    return _this.halt();
                  }
                });
              }
            });
          default:
            throw 'unknown event';
        }
      };
    })(this));
  };

  Nanika.prototype.halt = function() {
    var e;
    if (this.state === 'halted') {
      return;
    }
    this.state = 'halted';
    this.transaction = null;
    try {
      this.vanish_named();
    } catch (_error) {
      e = _error;
      console.error(e);
    }
    this.ghost.unload().then((function(_this) {
      return function() {
        _this.emit('halted');
        return _this.removeAllListeners();
      };
    })(this));
  };

  Nanika.prototype.run_version = function() {
    return this.transaction = this.transaction.then((function(_this) {
      return function() {
        return _this.send_request(['GET', 'Version'], '2.6', {});
      };
    })(this)).then((function(_this) {
      return function(response) {
        if (response.status_line.code === 200 && response.status_line.version !== '3.0') {
          _this.protocol_version = '2.6';
          _this.resource.version = response.headers.header.Version;
          _this.resource.name = response.headers.header.ID;
          _this.resource.craftman = response.headers.header.Craftman;
          return _this.resource.craftmanw = response.headers.header.Craftman;
        } else {
          _this.protocol_version = '3.0';
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

  Nanika.prototype.run_pre_boot = function() {
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
              Reference3: _this.named.shell.descript['name'],
              Reference5: _this.named.balloon.descript['name']
            });
          }).then(function() {
            return _this.send_request(['NOTIFY'], _this.protocol_version, {
              ID: "OnNotifyBalloonInfo",
              Reference0: _this.named.balloon.descript['name']
            });
          }).then(function() {
            return _this.send_request(['NOTIFY'], _this.protocol_version, {
              ID: "OnNotifyShellInfo",
              Reference0: _this.named.shell.descript['name']
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
          Reference0: _this.named.balloon.descript['name']
        });
      };
    })(this)).then((function(_this) {
      return function() {
        return _this.send_request(['NOTIFY', null], _this.protocol_version, {
          ID: "installedshellname",
          Reference0: _this.named.shell.descript['name']
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
    })(this));
  };

  Nanika.prototype.run_boot = function(event, args) {
    return this.transaction = this.transaction.then((function(_this) {
      return function() {
        switch (event) {
          case 'firstboot':
            return _this.send_request(['GET'], _this.protocol_version, {
              ID: "OnFirstBoot",
              Reference0: args.vanishcount
            });
          case 'boot':
            return _this.send_request(['GET'], _this.protocol_version, {
              ID: "OnBoot",
              Reference0: _this.named.shell.descript.name,
              Reference6: args.halt ? 'halt' : '',
              Reference7: args.halt ? args.halt : ''
            });
          case 'change':
            return _this.send_request(['GET'], _this.protocol_version, {
              ID: "OnGhostChanged",
              Reference0: args.from.sakuraname,
              Reference1: args.from.script,
              Reference2: args.from.name,
              Reference7: _this.named.shell.descript.name
            });
          case 'call':
            return _this.send_request(['GET'], _this.protocol_version, {
              ID: "OnGhostCalled",
              Reference0: args.from.sakuraname,
              Reference1: args.from.script,
              Reference2: args.from.name,
              Reference7: _this.named.shell.descript.name
            });
          default:
            throw 'unknown event';
        }
      };
    })(this)).then((function(_this) {
      return function(response) {
        return _this.recv_response(response);
      };
    })(this));
  };

  Nanika.prototype.run_timer = function() {
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

  Nanika.prototype.set_named_handler = function() {
    var event, mouseevents, _i, _len;
    mouseevents = [
      {
        type: 'mousedown',
        id: 'OnMouseDown'
      }, {
        type: 'mousemove',
        id: 'OnMouseMove'
      }, {
        type: 'mouseup',
        id: 'OnMouseUp'
      }, {
        type: 'mouseclick',
        id: 'OnMouseClick'
      }, {
        type: 'mousedblclick',
        id: 'OnMouseDoubleClick'
      }
    ];
    for (_i = 0, _len = mouseevents.length; _i < _len; _i++) {
      event = mouseevents[_i];
      this.named.on(event.type, ((function(_this) {
        return function(id) {
          return function(event) {
            return _this.transaction = _this.transaction.then(function() {
              return _this.send_request(['GET', 'Sentence'], _this.protocol_version, {
                ID: id,
                Reference0: event.offsetX,
                Reference1: event.offsetY,
                Reference2: event.wheel,
                Reference3: event.scope,
                Reference4: event.region,
                Reference5: event.button
              }).then(function(response) {
                return _this.recv_response(response);
              });
            });
          };
        };
      })(this))(event.id));
    }
    this.named.on('choiceselect', (function(_this) {
      return function(event) {
        if (/^On/.test(event.id)) {
          return _this.transaction = _this.transaction.then(function() {
            var headers, index, value, _j, _len1, _ref;
            headers = {
              ID: event.id
            };
            _ref = event.args;
            for (index = _j = 0, _len1 = _ref.length; _j < _len1; index = ++_j) {
              value = _ref[index];
              headers["Reference" + index] = value;
            }
            return _this.send_request(['GET', 'Sentence'], _this.protocol_version, headers).then(function(response) {
              return _this.recv_response(response);
            });
          });
        } else if (/^script:/.test(event.id)) {
          return _this.ssp.play(event.id.replace(/^script:/, ''));
        } else if (event.args.length) {
          return _this.transaction = _this.transaction.then(function() {
            var headers, index, value, _j, _len1, _ref;
            headers = {
              ID: 'OnChoiceSelectEx',
              Reference0: event.text,
              Reference1: event.id
            };
            _ref = event.args;
            for (index = _j = 0, _len1 = _ref.length; _j < _len1; index = ++_j) {
              value = _ref[index];
              headers["Reference" + (index + 2)] = value;
            }
            return _this.send_request(['GET', 'Sentence'], _this.protocol_version, headers).then(function(response) {
              return _this.recv_response(response);
            });
          });
        } else {
          return _this.transaction = _this.transaction.then(function() {
            return _this.send_request(['GET', 'Sentence'], _this.protocol_version, {
              ID: 'OnChoiceSelect',
              Reference0: event.id
            }).then(function(response) {
              return _this.recv_response(response);
            });
          });
        }
      };
    })(this));
    this.named.on('anchorselect', (function(_this) {
      return function(event) {
        if (/^On/.test(event.id)) {
          return _this.transaction = _this.transaction.then(function() {
            var headers, index, value, _j, _len1, _ref;
            headers = {
              ID: event.id
            };
            _ref = event.args;
            for (index = _j = 0, _len1 = _ref.length; _j < _len1; index = ++_j) {
              value = _ref[index];
              headers["Reference" + index] = value;
            }
            return _this.send_request(['GET', 'Sentence'], _this.protocol_version, headers).then(function(response) {
              return _this.recv_response(response);
            });
          });
        } else if (event.args.length) {
          return _this.transaction = _this.transaction.then(function() {
            var headers, index, value, _j, _len1, _ref;
            headers = {
              ID: 'OnAnchorSelectEx',
              Reference0: event.text,
              Reference1: event.id
            };
            _ref = event.args;
            for (index = _j = 0, _len1 = _ref.length; _j < _len1; index = ++_j) {
              value = _ref[index];
              headers["Reference" + (index + 2)] = value;
            }
            return _this.send_request(['GET', 'Sentence'], _this.protocol_version, headers).then(function(response) {
              return _this.recv_response(response);
            });
          });
        } else {
          return _this.transaction = _this.transaction.then(function() {
            return _this.send_request(['GET', 'Sentence'], _this.protocol_version, {
              ID: 'OnAnchorSelect',
              Reference0: event.id
            }).then(function(response) {
              return _this.recv_response(response);
            });
          });
        }
      };
    })(this));
    this.named.on('userinput', (function(_this) {
      return function(event) {
        if (event.content != null) {
          return _this.transaction = _this.transaction.then(function() {
            return _this.send_request(['GET', 'Sentence'], _this.protocol_version, {
              ID: 'OnUserInput',
              Reference0: event.id,
              Reference1: event.content
            }).then(function(response) {
              return _this.recv_response(response);
            });
          });
        } else {
          return _this.transaction = _this.transaction.then(function() {
            return _this.send_request(['GET', 'Sentence'], _this.protocol_version, {
              ID: 'OnUserInputCancel',
              Reference0: event.id,
              Reference1: 'close'
            }).then(function(response) {
              return _this.recv_response(response);
            });
          });
        }
      };
    })(this));
    this.named.on('communicateinput', (function(_this) {
      return function(event) {
        if (event.content != null) {
          return _this.transaction = _this.transaction.then(function() {
            return _this.send_request(['GET', 'Sentence'], _this.protocol_version, {
              ID: 'OnCommunicate',
              Reference0: event.sender,
              Reference1: event.content
            }).then(function(response) {
              return _this.recv_response(response);
            });
          });
        } else {
          return _this.transaction = _this.transaction.then(function() {
            return _this.send_request(['GET', 'Sentence'], _this.protocol_version, {
              ID: 'OnCommunicateInputCancel',
              Reference1: 'cancel'
            }).then(function(response) {
              return _this.recv_response(response);
            });
          });
        }
      };
    })(this));
    return this.named.load();
  };

  Nanika.prototype.set_ssp_handler = function() {
    this.ssp.on('script:raise', (function(_this) {
      return function(_arg) {
        var id, references;
        id = _arg[0], references = 2 <= _arg.length ? __slice.call(_arg, 1) : [];
        return _this.transaction = _this.transaction.then(function() {
          var headers, index, reference, _i, _len;
          headers = {
            ID: id
          };
          for (index = _i = 0, _len = references.length; _i < _len; index = ++_i) {
            reference = references[index];
            headers["Reference" + index] = reference;
          }
          return _this.send_request(['GET'], _this.protocol_version, headers);
        }).then(function(response) {
          return _this.recv_response(response);
        });
      };
    })(this));
    return this.ssp.on('script:halt', (function(_this) {
      return function() {
        return _this.halt();
      };
    })(this));
  };

  Nanika.prototype.send_request = function(method, version, headers) {
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
            resolve();
          }
          if (method[1] == null) {
            method[1] = 'Sentence';
          }
          request.request_line.method = method[0] + ' ' + method[1];
          if (method[1] === 'Sentence' && (headers["ID"] != null)) {
            if (headers["ID"] === "OnCommunicate") {
              request.headers.header["Sender"] = headers["Reference0"];
              request.headers.header["Sentence"] = headers["Reference1"];
              request.headers.header["Age"] = "0";
              headers = {};
            } else {
              headers["Event"] = headers["ID"];
              delete headers["ID"];
            }
          }
        }
        for (key in headers) {
          value = headers[key];
          request.headers.header[key] = '' + value;
        }
        return _this.ghost.request("" + request).then(function(response) {
          return resolve(response);
        })["catch"](function(err) {
          return reject(err);
        });
      };
    })(this))["catch"](this["throw"]).then((function(_this) {
      return function(response_str) {
        var parser, response;
        if (response_str == null) {
          return;
        }
        response_str = response_str.replace(/\r\n(?:\r\n)?$/, '\r\n\r\n');
        parser = new ShioriJK.Shiori.Response.Parser();
        response = parser.parse(response_str);
        if (response.headers.header.Charset != null) {
          _this.charset = response.headers.header.Charset;
        }
        return response;
      };
    })(this));
  };

  Nanika.prototype.recv_response = function(response, listener) {
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
            _this.ssp.play(ss, listener);
          }
        }
        return resolve(response);
      };
    })(this))["catch"](this.error);
  };

  Nanika.prototype.get_sentence = function(headers, callback) {
    return this.transaction = this.transaction.then((function(_this) {
      return function() {
        return _this.send_request(['GET', 'Sentence'], _this.protocol_version, headers);
      };
    })(this)).then(callback != null ? callback : (function(_this) {
      return function(response) {
        return _this.recv_response(response);
      };
    })(this));
  };

  Nanika.prototype.get_string = function(headers, callback) {
    return this.transaction = this.transaction.then((function(_this) {
      return function() {
        return _this.send_request(['GET', 'String'], _this.protocol_version, headers);
      };
    })(this)).then(callback);
  };

  Nanika.prototype.notify_ownerghostname = function(headers) {
    return this.transaction = this.transaction.then((function(_this) {
      return function() {
        return _this.send_request(['NOTIFY', 'OwnerGhostName'], _this.protocol_version, headers);
      };
    })(this));
  };

  Nanika.prototype.notify_otherghostname = function(headers) {
    return this.transaction = this.transaction.then((function(_this) {
      return function() {
        return _this.send_request(['NOTIFY', 'OtherGhostName'], _this.protocol_version, headers);
      };
    })(this));
  };

  Nanika.prototype.notify = function(headers) {
    return this.transaction = this.transaction.then((function(_this) {
      return function() {
        return _this.send_request(['NOTIFY', null], _this.protocol_version, headers);
      };
    })(this));
  };

  Nanika.prototype.string_header = function(version) {
    if (version === '3.0') {
      return 'Value';
    } else {
      return 'String';
    }
  };

  return Nanika;

})(EventEmitter);

if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
  module.exports = Nanika;
} else if (this.Ikagaka != null) {
  this.Ikagaka.Nanika = Nanika;
} else {
  this.Nanika = Nanika;
}
