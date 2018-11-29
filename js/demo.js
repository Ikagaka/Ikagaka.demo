var ikagakaConfig;
if (!ikagakaConfig) ikagakaConfig = {};

var Console, Nanika, NanikaStorage, NarLoader, Promise,
  slice = [].slice;

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
    if (!ikagakaConfig.console) this.window.show = function() {};
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

var ikagakaLoadingImage;

function showIkagakaLoadingImage() {
  if (!ikagakaConfig.loadingImage) return;
  ikagakaLoadingImage = document.createElement("img");
  ikagakaLoadingImage.src = ikagakaConfig.loadingImage;
  ikagakaLoadingImage.className = "ikagaka-loading-image";
  document.body.appendChild(ikagakaLoadingImage);
}

function hideIkagakaLoadingImage() {
  if (ikagakaLoadingImage) document.body.removeChild(ikagakaLoadingImage);
}

$(function() {
  var balloon_nar, balloonnames, boot_nanikamanager, cb, con, delete_storage, error, fs_root, ghost_nar, ghost_nar2, ghostnames, gui, halt_nanikamanager, install_nar, log, namedmanager, nanikamanager, shellnames, storage, update_balloonnames, update_ghostnames, update_shellnames, warn, win;
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
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
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
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      warn.apply(console, args);
      return con.warn(args.join(''));
    };
  })(this);
  console.error = (function(_this) {
    return function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      error.apply(console, args);
      return con.error(args.join(''));
    };
  })(this);
  fs_root = 'ikagaka';
  balloon_nar = './vendor/nar/origin.nar';
  ghost_nar = './vendor/nar/ikaga.nar';
  ghost_nar2 = './vendor/nar/touhoku-zunko_or__.nar';
  delete_storage = function() {
    if (window.confirm('本当に削除しますか？')) {
      return storage.backend._rmAll(fs_root).then(function() {
        window.onbeforeunload = function() {};
        return location.reload();
      });
    }
  };
  namedmanager = new cuttlebone.NamedManager();
  $(namedmanager.element).appendTo("body");
  nanikamanager = null;
  boot_nanikamanager = function() {
    var contextmenu, install, notice_events;
    if (nanikamanager) {
      return;
    }
    nanikamanager = new NanikaManager(storage, namedmanager, {
      append_path: './vendor/js/',
      logging: true
    });
    showIkagakaLoadingImage();
    $('#ikagaka_boot').attr('disabled', true);
    $('#ikagaka_halt').removeAttr('disabled');
    contextmenu = {
      initialize: function(nanika) {
        update_ghostnames(nanika);
        update_shellnames(nanika);
        update_balloonnames(nanika);
        return nanika.on('named.initialized', function() {
          var named;
          console.log("named.initialized", nanika);
          if (nanika.namedid == null) {
            return;
          }
          named = namedmanager.named(nanika.namedid);
          return named.contextmenu(function(ev) {
            var scopeId;
            scopeId = ev.scopeId;
            return {
              items: {
                changeGhost: {
                  name: "ゴースト切り替え",
                  items: ghostnames.reduce((function(o, arg) {
                    var dst_dirpath, name;
                    name = arg[0], dst_dirpath = arg[1];
                    o["changeGhost>" + dst_dirpath] = nanikamanager.is_existing_ghost(dst_dirpath) && nanika.ghostpath !== dst_dirpath ? {
                      name: name + "に変更",
                      disabled: true
                    } : {
                      name: name + "に変更",
                      callback: function() {
                        console.log("change Ghost>", name, dst_dirpath);
                        return nanikamanager.change(nanika.ghostpath, dst_dirpath);
                      }
                    };
                    return o;
                  }), {})
                },
                callGhost: {
                  name: "他のゴーストを呼ぶ",
                  items: ghostnames.reduce((function(o, arg) {
                    var dst_dirpath, name;
                    name = arg[0], dst_dirpath = arg[1];
                    o["callGhost>" + dst_dirpath] = nanikamanager.is_existing_ghost(dst_dirpath) ? {
                      name: name + "を呼ぶ",
                      disabled: true
                    } : {
                      name: name + "を呼ぶ",
                      callback: function() {
                        console.log("call Ghost>", name, dst_dirpath);
                        return nanikamanager.call(nanika.ghostpath, dst_dirpath);
                      }
                    };
                    return o;
                  }), {})
                },
                changeShell: {
                  name: "シェル",
                  items: shellnames.reduce((function(o, arg) {
                    var dst_dirpath, name;
                    name = arg[0], dst_dirpath = arg[1];
                    o["changeShell>" + dst_dirpath] = named.shell.descript.name === name ? {
                      name: name + "に変更",
                      disabled: true
                    } : {
                      name: name + "に変更",
                      callback: function() {
                        var scope_surfaces;
                        console.log("change Shell>", name, dst_dirpath);
                        scope_surfaces = {};
                        Object.keys(named.scopes).forEach(function(scopeId) {
                          return scope_surfaces[scopeId] = named.scopes[scopeId].currentSurface.surfaceId;
                        });
                        return nanika.change_named(dst_dirpath, nanika.profile.balloonpath).then(function() {
                          return Object.keys(scope_surfaces).forEach(function(scopeId) {
                            return named.scope(scopeId).surface(scope_surfaces[scopeId]);
                          });
                        });
                      }
                    };
                    return o;
                  }), {})
                },
                changeBalloon: {
                  name: "バルーン",
                  items: balloonnames.reduce((function(o, arg) {
                    var dst_dirpath, name;
                    name = arg[0], dst_dirpath = arg[1];
                    o["changeBalloon>" + dst_dirpath] = named.balloon.descript.name === name ? {
                      name: name + "に変更",
                      disabled: true
                    } : {
                      name: name + "に変更",
                      callback: function() {
                        var scope_surfaces;
                        console.log("change Balloon>", name, dst_dirpath);
                        scope_surfaces = {};
                        Object.keys(named.scopes).forEach(function(scopeId) {
                          return scope_surfaces[scopeId] = named.scopes[scopeId].currentSurface.surfaceId;
                        });
                        return nanika.change_named(nanika.profile.shellpath, dst_dirpath).then(function() {
                          return Object.keys(scope_surfaces).forEach(function(scopeId) {
                            return named.scope(scopeId).surface(scope_surfaces[scopeId]);
                          });
                        });
                      }
                    };
                    return o;
                  }), {})
                },
                install: {
                  name: "インストール",
                  callback: function() {
                    var install_field;
                    $('#install_field').remove();
                    install_field = $('<input type="file" />').attr('id', 'install_field').css({
                      display: 'none'
                    }).change((function(_this) {
                      return function(ev) {
                        var file, i, len, ref;
                        ref = ev.target.files;
                        for (i = 0, len = ref.length; i < len; i++) {
                          file = ref[i];
                          install_nar(file, nanika.ghostpath, nanika.ghost.descript['sakura.name']).then(function() {
                            update_ghostnames(nanika);
                            update_shellnames(nanika);
                            return update_balloonnames(nanika);
                          });
                        }
                        return $('#install_field').remove();
                      };
                    })(this));
                    $('body').append(install_field);
                    return install_field.click();
                  }
                },
                inputScript: {
                  name: '開発用 スクリプト入力',
                  callback: function() {
                    return nanika.ssp.play(window.prompt('send'));
                  }
                },
                clearAll: {
                  name: '全消去',
                  callback: function() {
                    return delete_storage();
                  }
                },
                quit: {
                  name: '終了',
                  callback: function() {
                    return nanikamanager.close(nanika.ghostpath, 'user');
                  }
                },
                quitAll: {
                  name: '全て終了',
                  callback: function() {
                    return nanikamanager.closeall('user');
                  }
                }
              }
            };
          });
        });
      }
    };
    install = {
      initialize: function(nanika) {
        return nanika.on('named.initialized', function() {
          var named;
          if (nanika.namedid == null) {
            return;
          }
          named = namedmanager.named(nanika.namedid);
          return named.on('filedrop', (function(_this) {
            return function(ev) {
              var file, i, len, ref, results;
              ev.event.stopPropagation();
              ev.event.preventDefault();
              ev.event.originalEvent.dataTransfer.dropEffect = 'copy';
              ref = ev.event.originalEvent.dataTransfer.files;
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                file = ref[i];
                results.push(install_nar(file, nanika.ghostpath, nanika.ghost.descript['sakura.name']).then(function() {
                  update_ghostnames(nanika);
                  update_shellnames(nanika);
                  return update_balloonnames(nanika);
                }));
              }
              return results;
            };
          })(this));
        });
      }
    };
    notice_events = {
      initialize: function(nanika) {
        var name;
        name = nanika.ghost.descript.name;
        nanika.on('named.initialized', function() {
          hideIkagakaLoadingImage();
          return console.log('materialized ' + name);
        });
        return nanika.on('halted', function() {
          return console.log('halted ' + name);
        });
      }
    };
    NanikaPlugin.contextmenu = contextmenu;
    NanikaPlugin.install = install;
    NanikaPlugin.notice_events = notice_events;
    nanikamanager.on('destroyed', function() {
      nanikamanager = null;
      $('#ikagaka_boot').removeAttr('disabled');
      $('#ikagaka_halt').attr('disabled', true);
      window.onbeforeunload = function() {};
      if (typeof require !== "undefined" && require !== null) {
        return window.close();
      }
    });
    console.log('baseware booting');
    window.onbeforeunload = function(event) {
      return event.returnValue = 'ベースウェアを終了していません。\n状態が保存されませんが本当にページを閉じますか？';
    };
    return nanikamanager.initialize().then(function() {
      return Promise.all(nanikamanager.bootall() || []);
    });
  };
  halt_nanikamanager = function() {
    return nanikamanager.closeall('user');
  };
  install_nar = function(file, dirpath, sakuraname, type, cb) {
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
      return storage.install_nar(nar, dirpath, sakuraname);
    })["catch"](function(err) {
      console.error('install failure: ' + (file.name || file));
      console.error(err.stack);
      throw err;
    }).then(function(install_results) {
      var balloon, ghost, i, install_result, len;
      if (install_results == null) {
        console.error('install not accepted: ' + (file.name || file));
        return;
      }
      console.log('install succeed: ' + (file.name || file));
      ghost = null;
      balloon = null;
      for (i = 0, len = install_results.length; i < len; i++) {
        install_result = install_results[i];
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

  window.boot_nanikamanager = boot_nanikamanager;
  window.halt_nanikamanager = halt_nanikamanager;
  window.delete_storage = delete_storage;
  window.install_nar = install_nar;
  window.delete_database = function () {
    window.indexedDB.deleteDatabase("browserfs");
  };

  storage = null;
  cb = function(err, idbfs) {
    var _window, buffer, fs, path;
    _window = {};
    if (typeof require === "undefined" || require === null) {
      BrowserFS.install(_window);
      BrowserFS.initialize(idbfs);
      fs = _window.require('fs');
      path = _window.require('path');
      buffer = _window.require('buffer');
    } else {
      fs = require('fs');
      path = require('path');
      buffer = require('buffer');
    }
    return fs.mkdir(fs_root, function() {
      storage = new NanikaStorage(new NanikaStorage.Backend.FS(fs_root, fs, path, buffer.Buffer));
      return fs.stat(path.dirname(storage.base_profile_path()), function(err, stat) {
        if (stat != null ? stat.isFile() : void 0) {
          window.alert("互換性の無い変更が加わりました。\n動作のためには古いファイルを削除する必要があります。");
          delete_storage();
        }
        return storage.base_profile().then(function(profile) {
          if (profile.ghosts == null) {
            profile.balloonpath = ikagakaConfig.initialBalloonpath;
            profile.ghosts = ikagakaConfig.initialGhosts;
            return storage.base_profile(profile).then(function() {
              return Promise.all(ikagakaConfig.initialNars.map(function (narUrl) {return install_nar(narUrl, '', '', 'url');}));
            });
          }
        }).then(function() {
          $('#ikagaka_boot').click(boot_nanikamanager);
          $('#ikagaka_halt').click(halt_nanikamanager);
          $('#ikagaka_clean').click(delete_storage);
          Promise.
          resolve().
          then(ikagakaConfig.afterPrepare).
          then(ikagakaConfig.autoBoot ? boot_nanikamanager : undefined).
          then(ikagakaConfig.afterAutoBoot);
        });
      });
    });
  };
  if (typeof require !== "undefined" && require !== null) {
    cb();
  } else {
    new BrowserFS.FileSystem.IndexedDB(cb);
  }
  ghostnames = [];
  update_ghostnames = function(nanika) {
    return storage.ghosts().then(function(ghosts) {
      return Promise.all(ghosts.map(function(dst_dirpath) {
        return storage.ghost_name(dst_dirpath).then(function(name) {
          return [name, dst_dirpath];
        });
      })).then(function(_ghostnames) {
        return ghostnames = _ghostnames;
      });
    });
  };
  shellnames = [];
  update_shellnames = function(nanika) {
    return storage.shells(nanika.ghostpath).then(function(shells) {
      return Promise.all(shells.map(function(dst_dirpath) {
        return storage.shell_name(nanika.ghostpath, dst_dirpath).then(function(name) {
          return [name, dst_dirpath];
        });
      })).then(function(_shellnames) {
        return shellnames = _shellnames;
      });
    });
  };
  balloonnames = [];
  return update_balloonnames = function(nanika) {
    return storage.balloons().then(function(balloons) {
      return Promise.all(balloons.map(function(dst_dirpath) {
        return storage.balloon_name(dst_dirpath).then(function(name) {
          return [name, dst_dirpath];
        });
      })).then(function(_balloonnames) {
        return balloonnames = _balloonnames;
      });
    });
  };
});
