// Generated by CoffeeScript 1.8.0
(function() {
  var EventEmitter, Nanika, NanikaDirectory, Promise, SakuraScriptPlayer,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Promise = this.Promise;

  SakuraScriptPlayer = this.SakuraScriptPlayer;

  NanikaDirectory = this.NanikaDirectory;

  EventEmitter = this.EventEmitter2;

  Nanika = (function(_super) {
    __extends(Nanika, _super);

    function Nanika(nanikamanager, storage, namedmanager, ghostpath, profile, plugins, eventdefinitions, options) {
      this.nanikamanager = nanikamanager;
      this.storage = storage;
      this.namedmanager = namedmanager;
      this.ghostpath = ghostpath;
      this.profile = profile;
      this.plugins = plugins != null ? plugins : {};
      this.eventdefinitions = eventdefinitions != null ? eventdefinitions : {};
      this.options = options != null ? options : {};
      this.setMaxListeners(0);
      this.charset = 'UTF-8';
      this.sender = 'Ikagaka';
      this.state = 'init';
    }

    Nanika.prototype.log = function(message) {
      return console.log(message);
    };

    Nanika.prototype.warn = function(message) {
      return console.warn(message);
    };

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
      this.log("initializing ghost");
      ghost = new Ghost("/ghost/" + this.ghostpath + "/ghost/master/", this.storage.ghost_master(this.ghostpath).asArrayBuffer(), this.options.append_path);
      ghost.logging = this.options.logging;
      return ghost.push().then(function() {
        return ghost.load();
      }).then((function(_this) {
        return function() {
          _this.log("ghost loaded");
          return ghost;
        };
      })(this));
    };

    Nanika.prototype.load_shell = function(shellpath) {
      var shell;
      this.log("initializing shell");
      shell = new Shell(this.storage.shell(this.ghostpath, shellpath).asArrayBuffer());
      return shell.load().then((function(_this) {
        return function() {
          _this.log("shell loaded");
          _this.profile.profile.shellpath = shellpath;
          return shell;
        };
      })(this));
    };

    Nanika.prototype.load_balloon = function(balloonpath) {
      var balloon;
      this.log("initializing balloon");
      balloon = new Balloon(this.storage.balloon(balloonpath).asArrayBuffer());
      return balloon.load().then((function(_this) {
        return function() {
          _this.log("balloon loaded");
          _this.profile.profile.balloonpath = balloonpath;
          return balloon;
        };
      })(this));
    };

    Nanika.prototype.materialize = function() {
      var balloonpath, shellpath;
      shellpath = this.profile.profile.shellpath || 'master';
      balloonpath = this.profile.profile.balloonpath || this.nanikamanager.profile.profile.balloonpath;
      return Promise.all([this.load_ghost(), this.materialize_named(shellpath, balloonpath)]).then((function(_this) {
        return function(_arg) {
          var ghost;
          ghost = _arg[0];
          return new Promise(function(resolve, reject) {
            var _base;
            _this.ghost = ghost;
            if ((_base = _this.profile.profile).boot_count == null) {
              _base.boot_count = 0;
            }
            _this.profile.profile.boot_count++;
            _this.resource = {};
            _this.protocol_version = '2.6';
            _this.transaction = new Promise(function(resolve) {
              return resolve();
            });
            _this.initialize_plugins();
            _this.state = 'running';
            _this.log("materialized");
            _this.on('version.set', function() {
              return resolve(_this);
            });
            _this.emit('materialized');
            return _this.named.load();
          });
        };
      })(this))["catch"](this["throw"]);
    };

    Nanika.prototype.initialize_plugins = function() {
      var initialize, name, _ref, _results;
      _ref = this.plugins;
      _results = [];
      for (name in _ref) {
        initialize = _ref[name].initialize;
        if (initialize != null) {
          _results.push(initialize(this));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Nanika.prototype.destroy_plugins = function() {
      var destroy, name, _ref, _results;
      _ref = this.plugins;
      _results = [];
      for (name in _ref) {
        destroy = _ref[name].destroy;
        if (destroy != null) {
          _results.push(destroy(this));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Nanika.prototype.add_plugin = function(name, plugin) {
      if (this.plugins[name] != null) {
        throw new Error("plugin [" + name + "] is already installed");
      }
      this.plugins[name] = plugin;
      if (this.state === 'running' && (plugin.initialize != null)) {
        return plugin.initialize(this);
      }
    };

    Nanika.prototype.remove_plugin = function(name) {
      var plugin;
      if (this.plugins[name] == null) {
        throw new Error("plugin [" + name + "] is not installed");
      }
      plugin = this.plugins[name];
      if (plugin.destroy != null) {
        plugin.destroy(this);
      }
      return delete this.plugins[name];
    };

    Nanika.prototype.request = function(event, request_args, callback, ssp_callbacks, optionals) {
      var event_definition, method, submethod;
      method = null;
      submethod = null;
      event_definition = this.eventdefinitions[event];
      return this.transaction = this.transaction.then((function(_this) {
        return function() {
          var header_definition, header_name, headers, headers_definition, id, name, request_definition, value, _ref;
          if (event_definition == null) {
            throw new Error("event definition of [" + event + "] not found");
          }
          if (_this.state !== 'running') {
            if (event_definition.drop_when_not_running) {
              return;
            }
          }
          request_definition = event_definition.request;
          if (request_definition instanceof Function) {
            _ref = request_definition(_this, request_args, optionals), method = _ref.method, submethod = _ref.submethod, id = _ref.id, headers = _ref.headers;
            if (method == null) {
              method = 'GET';
            }
          } else if (request_definition instanceof Object) {
            headers_definition = request_definition.headers;
            if (headers_definition instanceof Function) {
              headers = headers_definition(_this, request_args, optionals);
            } else if (headers_definition instanceof Object && (request_args != null)) {
              headers = {};
              for (name in request_args) {
                value = request_args[name];
                header_definition = headers_definition[name];
                if (typeof header_definition === 'string' || header_definition instanceof String || typeof header_definition === 'number' || header_definition instanceof Number) {
                  if (value != null) {
                    header_name = !isNaN(header_definition) ? "Reference" + header_definition : header_definition;
                    headers[header_name] = value;
                  }
                } else if (header_definition instanceof Object) {
                  if (header_definition.name == null) {
                    throw new Error("event definition of [" + event + "] has no header name [" + name + "] header definition");
                  }
                  if (header_definition.value instanceof Function) {
                    value = header_definition.value(value, _this, request_args, optionals);
                  } else if (header_definition.value != null) {
                    throw new Error("event definition of [" + event + "] has invalid [" + name + "] header definition");
                  }
                  if (value != null) {
                    header_name = !isNaN(header_definition.name) ? "Reference" + header_definition.name : header_definition.name;
                    headers[header_name] = value;
                  }
                } else if (header_definition != null) {
                  throw new Error("event definition of [" + event + "] has invalid [" + name + "] header definition");
                }
              }
            } else if (headers_definition != null) {
              throw new Error("event definition of [" + event + "] has no valid request header definition");
            }
            method = request_definition.method || 'GET';
            submethod = request_definition.submethod;
            id = request_definition.id;
            if (id == null) {
              throw new Error("event definition of [" + event + "] has no id");
            }
          } else {
            throw new Error("event definition of [" + event + "] has no valid request definition");
          }
          _this.emit("request." + event, request_args, optionals);
          _this.emit("request", request_args, optionals);
          return _this.send_request([method, submethod], _this.protocol_version, id, headers);
        };
      })(this)).then((function(_this) {
        return function(response) {
          var name, response_args, response_definition, result, value, value_name, _ref, _ref1;
          if (response == null) {
            return;
          }
          response_definition = event_definition.response;
          if (response_definition != null ? response_definition.args : void 0) {
            response_args = response_definition.args(_this, response);
          } else {
            response_args = {};
            if (response.status_line.version === '3.0') {
              if (response.headers.header.Value != null) {
                response_args.value = response.headers.header.Value;
              }
              _ref = response.headers.header;
              for (name in _ref) {
                value = _ref[name];
                if (name !== 'Value') {
                  response_args[name] = value;
                }
              }
            } else {
              if (submethod === 'String') {
                value_name = 'String';
              } else if (submethod === 'Word') {
                value_name = 'Word';
              } else if (submethod === 'Status') {
                value_name = 'Status';
              } else {
                value_name = 'Sentence';
              }
              if (response.headers.header[value_name] != null) {
                response_args.value = response.headers.header[value_name];
              }
              _ref1 = response.headers.header;
              for (name in _ref1) {
                value = _ref1[name];
                if (result = name.match(/^Reference(\d+)$/)) {
                  response_args["Reference" + (result[1] + 1)] = value;
                } else if (name === 'To') {
                  response_args.Reference0 = value;
                } else if (name !== value_name) {
                  response_args[name] = value;
                }
              }
            }
          }
          _this.emit("response." + event, response_args, optionals);
          _this.emit("response", response_args, optionals);
          if (method === 'GET' && ((submethod == null) || submethod === 'Sentence')) {
            if (response_args.value && (typeof response_args.value === "string" || response_args.value instanceof String)) {
              _this.ssp.play(response_args.value, {
                finish: function() {
                  _this.emit("ssp.finish." + event, response_args, optionals);
                  _this.emit("ssp.finish", response_args, optionals);
                  return ssp_callbacks != null ? typeof ssp_callbacks.finish === "function" ? ssp_callbacks.finish(response_args, response) : void 0 : void 0;
                },
                reject: function() {
                  _this.emit("ssp.reject." + event, response_args, optionals);
                  _this.emit("ssp.reject", response_args, optionals);
                  return ssp_callbacks != null ? typeof ssp_callbacks.reject === "function" ? ssp_callbacks.reject(response_args, response) : void 0 : void 0;
                },
                "break": function() {
                  _this.emit("ssp.break." + event, response_args, optionals);
                  _this.emit("ssp.break", response_args, optionals);
                  return ssp_callbacks != null ? typeof ssp_callbacks["break"] === "function" ? ssp_callbacks["break"](response_args, response) : void 0 : void 0;
                }
              });
            }
          }
          if (callback != null) {
            callback(response_args, response);
          }
        };
      })(this))["catch"](this.error);
    };

    Nanika.prototype.send_request = function(method, version, id, headers) {
      if (headers == null) {
        headers = {};
      }

      /*
      		SHIORI/2.x互換変換
      		- GET : Sentence : OnCommunicate はGET Sentence SHIORI/2.3に変換され、ヘッダの位置が変更されます。
      		- GET : TEACH : OnTeach はTEACH SHIORI/2.4に変換され、ヘッダの位置が変更されます。
       */
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var ghosts, ghosts_headers, key, request, result, value;
          request = new ShioriJK.Message.Request();
          request.request_line.protocol = "SHIORI";
          request.request_line.version = version;
          request.headers.header["Sender"] = _this.sender;
          request.headers.header["Charset"] = _this.charset;
          if (version === '3.0') {
            request.request_line.method = method[0];
            request.headers.header["ID"] = id;
          } else {
            if (method[1] === null) {
              resolve();
            }
            if (method[1] == null) {
              method[1] = 'Sentence';
            }
            if (method[1] !== 'TEACH') {
              request.request_line.method = method[0] + ' ' + method[1];
            } else {
              request.request_line.method = method[1];
            }
            if (method[1] === 'Sentence' && (id != null)) {
              if (id === "OnCommunicate") {
                request.headers.header["Sender"] = headers["Reference0"];
                request.headers.header["Sentence"] = headers["Reference1"];
                request.headers.header["Age"] = headers.Age || "0";
                for (key in headers) {
                  value = headers[key];
                  if (result = key.match(/^Reference(\d+)$/)) {
                    request.headers.header["Reference" + (result[1] - 2)] = '' + value;
                  } else {
                    request.headers.header[key] = '' + value;
                  }
                }
                headers = null;
              } else {
                headers["Event"] = id;
              }
            } else if (method[1] === 'String' && (id != null)) {
              headers["ID"] = id;
            } else if (method[1] === 'TEACH') {
              request.headers.header["Word"] = headers["Reference0"];
              for (key in headers) {
                value = headers[key];
                if (result = key.match(/^Reference(\d+)$/)) {
                  request.headers.header["Reference" + (result[1] - 1)] = '' + value;
                } else {
                  request.headers.header[key] = '' + value;
                }
              }
              headers = null;
            } else if (method[1] === 'OwnerGhostName') {
              request.headers.header["Ghost"] = headers["Reference0"];
              headers = null;
            } else if (method[1] === 'OtherGhostName') {
              ghosts = [];
              for (key in headers) {
                value = headers[key];
                if (key.match(/^Reference\d+$/)) {
                  ghosts.push('' + value);
                } else {
                  request.headers.header[key] = '' + value;
                }
              }
              ghosts_headers = (ghosts.map(function(ghost) {
                return "GhostEx: " + ghost + "\r\n";
              })).join("");
              request = request.request_line + "\r\n" + request.headers + ghosts_headers + "\r\n";
              headers = null;
            }
          }
          if (headers != null) {
            for (key in headers) {
              value = headers[key];
              request.headers.header[key] = '' + value;
            }
          }
          _this.emit("request_raw." + id, request);
          _this.emit("request_raw", request);
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
          if (!/\r\n\r\n$/.test(response_str)) {
            _this.warn("SHIORI Response does not end with termination string (CRLFCRLF)\n[" + response_str + "]\nreplace CRLF end to CRLFCRLF");
            response_str = response_str.replace(/\r\n(?:\r\n)?$/, '\r\n\r\n');
          }
          parser = new ShioriJK.Shiori.Response.Parser();
          try {
            response = parser.parse(response_str);
          } catch (_error) {
            _this.warn("SHIORI Response is invalid\n[" + response_str + "]");
            return;
          }
          _this.emit("response_raw." + id, response);
          _this.emit("response_raw", response);
          if (response.headers.header.Charset != null) {
            _this.charset = response.headers.header.Charset;
          }
          return response;
        };
      })(this));
    };

    Nanika.prototype.halt = function(event, args, optionals) {
      if (this.state === 'halted') {
        return;
      }
      this.emit("halt." + event, args, optionals);
      this.emit('halt', args, optionals);
      this.state = 'halted';
      this.transaction = null;
      this.vanish_named();
      return this.ghost.unload().then((function(_this) {
        return function() {
          return _this.ghost.pull();
        };
      })(this)).then((function(_this) {
        return function(directory) {
          _this.storage.ghost_master(_this.ghostpath, new NanikaDirectory(directory));
          _this.emit("halted." + event, args, optionals);
          _this.emit('halted', args, optionals);
          _this.removeAllListeners();
        };
      })(this));
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

    return Nanika;

  })(EventEmitter);

  if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
    module.exports = Nanika;
  } else if (this.Ikagaka != null) {
    this.Ikagaka.Nanika = Nanika;
  } else {
    this.Nanika = Nanika;
  }

}).call(this);
