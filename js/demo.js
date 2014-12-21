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
  var balloon_nar, boot_nanikamanager, con, error, ghost_nar, halt_nanikamanager, install_nar, log, namedmanager, nanikamanager, profile, storage, warn;
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
  storage = new NanikaStorage();
  balloon_nar = './vendor/nar/origin.nar';
  ghost_nar = './vendor/nar/touhoku-zunko_or__.nar';
  profile = new Profile.Baseware();
  profile.profile.balloonpath = 'origin';
  profile.profile.ghosts = ['touhoku-zunko_or__'];
  namedmanager = new NamedManager();
  $(namedmanager.element).appendTo("body");
  nanikamanager = null;
  boot_nanikamanager = function() {
    if (nanikamanager) {
      return;
    }
    nanikamanager = new NanikaManager(storage, profile, namedmanager, {
      append_path: './vendor/js/',
      logging: true
    });
    $('#ikagaka_boot').attr('disabled', true);
    $('#ikagaka_halt').removeAttr('disabled');
    nanikamanager.on('change.existing.ghosts', function() {
      var call, change, close, container, container_dropdown, container_label, container_menu, dirpath, install, install_file, label, nanika, nanikas_dom, _ref, _results;
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
            var dst_dirpath, elem, ghost, list, _ref1;
            if (container_dropdown.hasClass('change')) {
              container_dropdown.removeClass('change call');
              return container_dropdown.html('');
            } else {
              container_dropdown.removeClass('change call');
              container_dropdown.addClass('change');
              container_dropdown.html('');
              list = $('<ul />').addClass('list');
              _ref1 = storage.ghosts;
              for (dst_dirpath in _ref1) {
                ghost = _ref1[dst_dirpath];
                if (nanikamanager.is_existing_ghost(dst_dirpath)) {
                  elem = $('<li />').addClass('ng').text(ghost.install.name + ' に交代');
                } else {
                  elem = $('<li />').addClass('ok').text(ghost.install.name + ' に交代').on('click', (function(dst_dirpath) {
                    return function() {
                      return nanikamanager.change(dirpath, dst_dirpath);
                    };
                  })(dst_dirpath));
                }
                list.append(elem);
              }
              return container_dropdown.append(list);
            }
          };
        })(dirpath, container_dropdown));
        call = $('<button />').text('呼出').addClass('call').on('click', (function(dirpath, container_dropdown) {
          return function() {
            var dst_dirpath, elem, ghost, list, _ref1;
            if (container_dropdown.hasClass('call')) {
              container_dropdown.removeClass('change call');
              return container_dropdown.html('');
            } else {
              container_dropdown.removeClass('change call');
              container_dropdown.addClass('call');
              container_dropdown.html('');
              list = $('<ul />').addClass('list');
              _ref1 = storage.ghosts;
              for (dst_dirpath in _ref1) {
                ghost = _ref1[dst_dirpath];
                if (nanikamanager.is_existing_ghost(dst_dirpath)) {
                  elem = $('<li />').addClass('ng').text(ghost.install.name + ' を呼出');
                } else {
                  elem = $('<li />').addClass('ok').text(ghost.install.name + ' を呼出').on('click', (function(dst_dirpath) {
                    return function() {
                      return nanikamanager.call(dirpath, dst_dirpath);
                    };
                  })(dst_dirpath));
                }
                list.append(elem);
              }
              return container_dropdown.append(list);
            }
          };
        })(dirpath, container_dropdown));
        close = $('<button />').text('終了').addClass('close').on('click', (function(dirpath) {
          return function() {
            return nanikamanager.close(dirpath, 'user');
          };
        })(dirpath));
        container_label.append(label);
        container_menu.append(change).append(call).append(close).append(install);
        container.append(container_label).append(container_menu).append(container_dropdown);
        _results.push(nanikas_dom.append(container));
      }
      return _results;
    });
    nanikamanager.on('destroyed', function() {
      nanikamanager = null;
      $('#ikagaka_boot').removeAttr('disabled');
      return $('#ikagaka_halt').attr('disabled', true);
    });
    return nanikamanager.bootall();
  };
  halt_nanikamanager = function() {
    return nanikamanager.closeall('user');
  };
  console.log("load nar : " + balloon_nar);
  Promise.all([
    NarLoader.loadFromURL(balloon_nar).then(function(nar) {
      console.log("nar loaded : " + balloon_nar);
      return storage.install_nar(nar);
    }), NarLoader.loadFromURL(ghost_nar).then(function(nar) {
      console.log("nar loaded : " + ghost_nar);
      return storage.install_nar(nar);
    })
  ]).then(function() {
    $('#ikagaka_boot').click(boot_nanikamanager);
    $('#ikagaka_halt').click(halt_nanikamanager);
    return $('#ikagaka_boot').click();
  });
  return install_nar = function(file, dirpath) {
    console.log("load nar : " + file.name);
    return NarLoader.loadFromBlob(file).then(function(nar) {
      var balloon, err, ghost, install_result, install_results, _i, _len;
      console.log("nar loaded : " + file.name);
      try {
        install_results = storage.install_nar(nar, dirpath);
      } catch (_error) {
        err = _error;
        console.error('install failure');
        console.error(err.stack);
        return;
      }
      if (install_results == null) {
        console.error('install not accepted');
        return;
      }
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
          return profile.ghost(ghost.directory).profile.balloonpath = balloon.directory;
        }
      }
    })["catch"](function(err) {
      console.error(err, err.stack);
      return alert(err);
    });
  };
});
