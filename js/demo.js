var Console, Nanika, NanikaStorage, NarLoader, Promise,
  __slice = [].slice;

Promise = this.Promise;

if (this.Ikagaka != null) {
  NarLoader = this.Ikagaka.NarLoader || this.NarLoader;
  Nanika = this.Ikagaka.Nanika || this.Nanika;
  NanikaStorage = this.Ikagaka.NanikaStorage || this.Nanika;
} else {
  NarLoader = this.NarLoader;
  Nanika = this.Nanika;
  NanikaStorage = this.NanikaStorage;
}

Console = (function() {
  function Console(dom) {
    this.window = $('<div />').addClass('ConsoleWindow');
    this.console = $('<div />').addClass('Console');
    this.console.appendTo(this.window);
    this.window.appendTo(dom);
    this.window.hide();
    this.has_error = false;
  }

  Console.prototype.finish = function() {
    this.window.scrollTop(9999999);
    clearTimeout(this.hidetimer);
    if (!this.has_error) {
      return this.hidetimer = setTimeout((function(_this) {
        return function() {
          return _this.window.hide();
        };
      })(this), 3000);
    }
  };

  Console.prototype.log = function(message) {
    var text;
    this.window.show();
    text = $('<span />').addClass('log').html((message + "\n").replace(/\r\n|[\r\n]/g, '<br>'));
    this.console.append(text);
    return this.finish();
  };

  Console.prototype.warn = function(message) {
    var text;
    this.window.show();
    text = $('<span />').addClass('warn').html((message + "\n").replace(/\r\n|[\r\n]/g, '<br>'));
    this.console.append(text);
    this.has_error = true;
    return this.finish();
  };

  Console.prototype.error = function(message) {
    var text;
    this.window.show();
    text = $('<span />').addClass('error').html((message + "\n").replace(/\r\n|[\r\n]/g, '<br>'));
    this.console.append(text);
    this.has_error = true;
    return this.finish();
  };

  return Console;

})();

$(function() {
  var balloon_nar, boot_nanikamanager, cb, con, error, ghost_nar, ghost_nar2, gui, halt_nanikamanager, install_nar, log, namedmanager, nanikamanager, storage, warn, win;
  if (typeof require !== "undefined" && require !== null) {
    gui = require('nw.gui');
    win = gui.Window.get();
    win.resizeTo(screen.availWidth, screen.availHeight);
    win.moveTo(0, 0);
  }
  con = new Console("body");
  log = console.log;
  warn = console.warn;
  error = console.error;
  console.log = (function(_this) {
    return function() {
      var args, t;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      log.apply(console, args);
      t = args.join('');
      if (!/SHIORI\/\d\.\d|^\[object Object\]$/.test(t)) {
        return con.log(t);
      }
    };
  })(this);
  console.warn = (function(_this) {
    return function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      warn.apply(console, args);
      return con.warn(args.join(''));
    };
  })(this);
  console.error = (function(_this) {
    return function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      error.apply(console, args);
      return con.error(args.join(''));
    };
  })(this);
  balloon_nar = './vendor/nar/origin.nar';
  ghost_nar = './vendor/nar/ikaga.nar';
  ghost_nar2 = './vendor/nar/touhoku-zunko_or__.nar';
  namedmanager = new NamedManager();
  $(namedmanager.element).appendTo("body");
  nanikamanager = null;
  boot_nanikamanager = function() {
    if (nanikamanager) {
      return;
    }
    nanikamanager = new NanikaManager(storage, namedmanager, {
      append_path: './vendor/js/',
      logging: true
    });
    $('#ikagaka_boot').attr('disabled', true);
    $('#ikagaka_halt').removeAttr('disabled');
    nanikamanager.on('change.existing.ghosts', function() {
      var call, change, close, container, container_dropdown, container_label, container_menu, dirpath, install, install_file, label, nanika, nanikas_dom, shell, _ref, _results;
      nanikas_dom = $('.ghosts').html('');
      _ref = nanikamanager.nanikas;
      _results = [];
      for (dirpath in _ref) {
        nanika = _ref[dirpath];
        container = $('<li />');
        container_label = $('<p />');
        container_menu = $('<p />');
        container_dropdown = $('<p />');
        label = $('<span />').text(nanika.ghost.descript.name).addClass('name');
        install_file = $('<input type="file" />').change((function(dirpath) {
          return (function(_this) {
            return function(ev) {
              var file, _i, _len, _ref1, _results1;
              _ref1 = ev.target.files;
              _results1 = [];
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                file = _ref1[_i];
                _results1.push(install_nar(file, dirpath));
              }
              return _results1;
            };
          })(this);
        })(dirpath));
        install = $('<label draggable="true">narをドロップしてインストール</label>').addClass('install').on('dragenter', (function(_this) {
          return function(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            ev.dataTransfer.dropEffect = 'copy';
            return false;
          };
        })(this)).on('dragover', (function(_this) {
          return function(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            ev.dataTransfer.dropEffect = 'copy';
            return false;
          };
        })(this)).on('drop', (function(dirpath) {
          return (function(_this) {
            return function(ev) {
              var file, _i, _len, _ref1, _results1;
              ev.stopPropagation();
              ev.preventDefault();
              ev.dataTransfer.dropEffect = 'copy';
              _ref1 = ev.dataTransfer.files;
              _results1 = [];
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                file = _ref1[_i];
                _results1.push(install_nar(file, dirpath));
              }
              return _results1;
            };
          })(this);
        })(dirpath));
        install.append(install_file);
        change = $('<button />').text('交代').addClass('change').on('click', (function(dirpath, container_dropdown) {
          return function() {
            var list;
            if (container_dropdown.hasClass('change')) {
              container_dropdown.removeClass('change call shell');
              return container_dropdown.html('');
            } else {
              container_dropdown.removeClass('change call shell');
              container_dropdown.addClass('change');
              container_dropdown.html('');
              list = $('<ul />').addClass('list');
              return storage.ghosts().then(function(ghosts) {
                var dst_dirpath, _fn, _i, _len;
                _fn = function(dst_dirpath) {
                  return storage.ghost_name(dst_dirpath).then(function(name) {
                    var elem;
                    elem = $('<li />').addClass('ok').text(name + ' に交代').on('click', function() {
                      return nanikamanager.change(dirpath, dst_dirpath);
                    });
                    return list.append(elem);
                  });
                };
                for (_i = 0, _len = ghosts.length; _i < _len; _i++) {
                  dst_dirpath = ghosts[_i];
                  _fn(dst_dirpath);
                }
                return container_dropdown.append(list);
              });
            }
          };
        })(dirpath, container_dropdown));
        call = $('<button />').text('呼出').addClass('call').on('click', (function(dirpath, container_dropdown) {
          return function() {
            var list;
            if (container_dropdown.hasClass('call')) {
              container_dropdown.removeClass('change call shell');
              return container_dropdown.html('');
            } else {
              container_dropdown.removeClass('change call shell');
              container_dropdown.addClass('call');
              container_dropdown.html('');
              list = $('<ul />').addClass('list');
              return storage.ghosts().then(function(ghosts) {
                var dst_dirpath, _fn, _i, _len;
                _fn = function(dst_dirpath) {
                  return storage.ghost_name(dst_dirpath).then(function(name) {
                    var elem;
                    if (nanikamanager.is_existing_ghost(dst_dirpath)) {
                      elem = $('<li />').addClass('ng').text(name + ' を呼出');
                    } else {
                      elem = $('<li />').addClass('ok').text(name + ' を呼出').on('click', function() {
                        return nanikamanager.call(dirpath, dst_dirpath);
                      });
                    }
                    return list.append(elem);
                  });
                };
                for (_i = 0, _len = ghosts.length; _i < _len; _i++) {
                  dst_dirpath = ghosts[_i];
                  _fn(dst_dirpath);
                }
                return container_dropdown.append(list);
              });
            }
          };
        })(dirpath, container_dropdown));
        shell = $('<button />').text('シェル').addClass('shell').on('click', (function(dirpath, container_dropdown) {
          return function() {
            var list;
            if (container_dropdown.hasClass('shell')) {
              container_dropdown.removeClass('change call shell');
              return container_dropdown.html('');
            } else {
              container_dropdown.removeClass('change call shell');
              container_dropdown.addClass('shell');
              container_dropdown.html('');
              list = $('<ul />').addClass('list');
              return storage.shells(dirpath).then(function(shells) {
                var dst_shellpath, _fn, _i, _len;
                _fn = function(dst_shellpath) {
                  return storage.shell_name(dirpath, dst_shellpath).then(function(name) {
                    var elem;
                    nanika = nanikamanager.nanikas[dirpath];
                    if (nanika.named.shell.descript.name === name) {
                      elem = $('<li />').addClass('ng').text(name + ' に変更');
                    } else {
                      elem = $('<li />').addClass('ok').text(name + ' に変更').on('click', function() {
                        return nanika.change_named(dst_shellpath, nanika.profile.balloonpath);
                      });
                    }
                    return list.append(elem);
                  });
                };
                for (_i = 0, _len = shells.length; _i < _len; _i++) {
                  dst_shellpath = shells[_i];
                  _fn(dst_shellpath);
                }
                return container_dropdown.append(list);
              });
            }
          };
        })(dirpath, container_dropdown));
        close = $('<button />').text('終了').addClass('close').on('click', (function(dirpath) {
          return function() {
            return nanikamanager.close(dirpath, 'user');
          };
        })(dirpath));
        container_label.append(label);
        container_menu.append(change).append(call).append(shell).append(close).append(install);
        container.append(container_label).append(container_menu).append(container_dropdown);
        _results.push(nanikas_dom.append(container));
      }
      return _results;
    });
    nanikamanager.on('destroyed', function() {
      nanikamanager = null;
      $('#ikagaka_boot').removeAttr('disabled');
      $('#ikagaka_halt').attr('disabled', true);
      return window.onbeforeunload = function() {};
    });
    console.log('baseware booting');
    window.onbeforeunload = function(event) {
      return event.returnValue = 'ベースウェアを終了していません。\n状態が保存されませんが本当にページを閉じますか？';
    };
    return nanikamanager.initialize().then(function() {
      return nanikamanager.bootall();
    });
  };
  halt_nanikamanager = function() {
    return nanikamanager.closeall('user');
  };
  install_nar = function(file, dirpath, type) {
    var promise;
    if (type == null) {
      type = "blob";
    }
    console.log("load nar : " + (file.name || file));
    if (type === "url") {
      promise = NarLoader.loadFromURL(file);
    } else {
      promise = NarLoader.loadFromBlob(file);
    }
    return promise.then(function(nar) {
      console.log("nar loaded : " + (file.name || file));
      return storage.install_nar(nar, dirpath);
    })["catch"](function(err) {
      console.error('install failure: ' + (file.name || file));
      console.error(err.stack);
      throw err;
    }).then(function(install_results) {
      var balloon, ghost, install_result, _i, _len;
      if (install_results == null) {
        console.error('install not accepted: ' + (file.name || file));
        return;
      }
      console.log('install succeed: ' + (file.name || file));
      ghost = null;
      balloon = null;
      for (_i = 0, _len = install_results.length; _i < _len; _i++) {
        install_result = install_results[_i];
        if (install_result.type === 'ghost') {
          ghost = install_result;
        } else if (install_result.type === 'balloon') {
          balloon = install_result;
        }
      }
      if (ghost != null) {
        if (balloon != null) {
          return storage.ghost_profile(ghost.directory).then(function(profile) {
            profile.balloonpath = balloon.directory;
            return storage.ghost_profile(ghost.directory, profile);
          });
        }
      }
    })["catch"](function(err) {
      console.error(err, err.stack);
      return alert(err);
    });
  };
  storage = null;
  cb = function(err, idbfs) {
    var buffer, fs, path;
    if (typeof require === "undefined" || require === null) {
      BrowserFS.install(window);
      BrowserFS.initialize(idbfs);
    }
    fs = require('fs');
    path = require('path');
    buffer = require('buffer');
    storage = new NanikaStorage(new NanikaStorage.Backend.FS('/ikagaka', fs, path, buffer.Buffer));
    return storage.base_profile().then(function(profile) {
      if (profile.ghosts == null) {
        profile.balloonpath = 'origin';
        profile.ghosts = ['ikaga'];
        return storage.base_profile(profile).then(function() {
          install_nar(ghost_nar2, '', 'url');
          return Promise.all([install_nar(balloon_nar, '', 'url'), install_nar(ghost_nar, '', 'url')]);
        });
      }
    }).then(function() {
      $('#ikagaka_boot').click(boot_nanikamanager);
      $('#ikagaka_halt').click(halt_nanikamanager);
      $('#ikagaka_clean').click(function() {
        if (window.confirm('本当に削除しますか？')) {
          return storage.backend._rmAll('/ikagaka').then(function() {
            return location.reload();
          });
        }
      });
      return $('#ikagaka_boot').click();
    });
  };
  if (typeof require !== "undefined" && require !== null) {
    return cb();
  } else {
    return new BrowserFS.FileSystem.IndexedDB(cb);
  }
});
