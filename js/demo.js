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
  var balloon_nar, boot_nanikamanager, cb, con, delete_storage, error, fs_root, ghost_nar, ghost_nar2, gui, halt_nanikamanager, install_nar, log, namedmanager, nanikamanager, storage, warn, win;
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
    var contextmenu, hide_contextmenu, install, notice_events, view_contextmenu;
    if (nanikamanager) {
      return;
    }
    nanikamanager = new NanikaManager(storage, namedmanager, {
      append_path: './vendor/js/',
      logging: true
    });
    $('#ikagaka_boot').attr('disabled', true);
    $('#ikagaka_halt').removeAttr('disabled');
    view_contextmenu = function(nanika, mouse, menulist) {
      var body, dom, i, item, len, li_css, li_css_disabled, li_css_hover, menu, named, offset, x, y;
      $('#contextmenu').remove();
      named = namedmanager.named(nanika.namedid);
      dom = named.scopes[mouse.args.scopeId].$scope;
      offset = dom.offset();
      x = window.innerWidth - (offset.left + mouse.args.offsetX);
      y = window.innerHeight - (offset.top + mouse.args.offsetY);
      menu = $('<ul />').attr('id', 'contextmenu').css({
        position: 'fixed',
        bottom: y,
        right: x,
        background: '#fff',
        'z-index': 100,
        margin: '0',
        padding: '0',
        'list-style': 'none',
        border: '1px solid black'
      });
      li_css = {
        color: '#222',
        background: '#fff',
        margin: '0',
        padding: '0.3em',
        cursor: 'pointer'
      };
      li_css_hover = {
        color: '#222',
        background: '#cff',
        margin: '0',
        padding: '0.3em',
        cursor: 'pointer'
      };
      li_css_disabled = {
        color: '#666',
        background: '#eee',
        margin: '0',
        padding: '0.3em'
      };
      for (i = 0, len = menulist.length; i < len; i++) {
        item = menulist[i];
        if (item.cb != null) {
          (function(item) {
            return menu.append($('<li />').text(item.text).css(li_css).mouseover(function() {
              return $(this).css(li_css_hover);
            }).mouseout(function() {
              return $(this).css(li_css);
            }).click(function() {
              hide_contextmenu();
              return item.cb();
            }));
          })(item);
        } else {
          menu.append($('<li />').text(item.text).css(li_css_disabled).mouseover(function() {
            return $(this).css(li_css_disabled);
          }).mouseout(function() {
            return $(this).css(li_css_disabled);
          }));
        }
      }
      body = $('body');
      return body.append(menu);
    };
    hide_contextmenu = function() {
      return $('#contextmenu').remove();
    };
    contextmenu = {
      initialize: function(nanika) {
        var mouse;
        mouse = {};
        nanika.on('request.mouseclick', function(args) {
          return mouse.args = args;
        });
        return nanika.on('response.mouseclick', function(args) {
          var ghostpath, menulist;
          mouse.args.event.preventDefault();
          if ((args.value == null) || !args.value.length) {
            if (mouse.args.button === 1) {
              ghostpath = nanika.ghostpath;
              menulist = [
                {
                  text: 'ゴースト切り替え',
                  cb: function() {
                    return storage.ghosts().then(function(ghosts) {
                      var dst_dirpath, fn, i, len, promises;
                      promises = [];
                      fn = function(dst_dirpath) {
                        return promises.push(storage.ghost_name(dst_dirpath).then(function(name) {
                          if (nanikamanager.is_existing_ghost(dst_dirpath) && ghostpath !== dst_dirpath) {
                            return {
                              text: name + ' に切り替え'
                            };
                          } else {
                            return {
                              text: name + ' に切り替え',
                              cb: function() {
                                return nanikamanager.change(ghostpath, dst_dirpath);
                              }
                            };
                          }
                        }));
                      };
                      for (i = 0, len = ghosts.length; i < len; i++) {
                        dst_dirpath = ghosts[i];
                        fn(dst_dirpath);
                      }
                      return Promise.all(promises).then(function(submenulist) {
                        return view_contextmenu(nanika, mouse, submenulist);
                      });
                    });
                  }
                }, {
                  text: '他のゴーストを呼ぶ',
                  cb: function() {
                    return storage.ghosts().then(function(ghosts) {
                      var dst_dirpath, fn, i, len, promises;
                      promises = [];
                      fn = function(dst_dirpath) {
                        return promises.push(storage.ghost_name(dst_dirpath).then(function(name) {
                          if (nanikamanager.is_existing_ghost(dst_dirpath)) {
                            return {
                              text: name + ' を呼び出し'
                            };
                          } else {
                            return {
                              text: name + ' を呼び出し',
                              cb: function() {
                                return nanikamanager.call(ghostpath, dst_dirpath);
                              }
                            };
                          }
                        }));
                      };
                      for (i = 0, len = ghosts.length; i < len; i++) {
                        dst_dirpath = ghosts[i];
                        fn(dst_dirpath);
                      }
                      return Promise.all(promises).then(function(submenulist) {
                        return view_contextmenu(nanika, mouse, submenulist);
                      });
                    });
                  }
                }, {
                  text: 'シェル',
                  cb: function() {
                    return storage.shells(ghostpath).then(function(shells) {
                      var dst_shellpath, fn, i, len, promises;
                      promises = [];
                      fn = function(dst_shellpath) {
                        return promises.push(storage.shell_name(ghostpath, dst_shellpath).then(function(name) {
                          if (nanika.named.shell.descript.name === name) {
                            return {
                              text: name + ' に変更'
                            };
                          } else {
                            return {
                              text: name + ' に変更',
                              cb: function() {
                                var id, ref, scope, scope_surfaces;
                                scope_surfaces = {};
                                ref = nanika.named.scopes;
                                for (id in ref) {
                                  scope = ref[id];
                                  scope_surfaces[id] = scope.currentSurface.surfaces.surfaces[scope.currentSurface.surfaceName].is;
                                }
                                return nanika.change_named(dst_shellpath, nanika.profile.balloonpath).then(function() {
                                  var results, surface;
                                  results = [];
                                  for (scope in scope_surfaces) {
                                    surface = scope_surfaces[scope];
                                    results.push(nanika.named.scope(scope).surface(surface));
                                  }
                                  return results;
                                });
                              }
                            };
                          }
                        }));
                      };
                      for (i = 0, len = shells.length; i < len; i++) {
                        dst_shellpath = shells[i];
                        fn(dst_shellpath);
                      }
                      return Promise.all(promises).then(function(submenulist) {
                        return view_contextmenu(nanika, mouse, submenulist);
                      });
                    });
                  }
                }, {
                  text: 'バルーン',
                  cb: function() {
                    return storage.balloons().then(function(balloons) {
                      var dst_dirpath, fn, i, len, promises;
                      promises = [];
                      fn = function(dst_dirpath) {
                        return promises.push(storage.balloon_name(dst_dirpath).then(function(name) {
                          if (nanika.named.balloon.descript.name === name) {
                            return {
                              text: name + ' に変更'
                            };
                          } else {
                            return {
                              text: name + ' に変更',
                              cb: function() {
                                var id, ref, scope, scope_surfaces;
                                scope_surfaces = {};
                                ref = nanika.named.scopes;
                                for (id in ref) {
                                  scope = ref[id];
                                  scope_surfaces[id] = scope.currentSurface.surfaces.surfaces[scope.currentSurface.surfaceName].is;
                                }
                                return nanika.change_named(nanika.profile.shellpath, dst_dirpath).then(function() {
                                  var results, surface;
                                  results = [];
                                  for (scope in scope_surfaces) {
                                    surface = scope_surfaces[scope];
                                    results.push(nanika.named.scope(scope).surface(surface));
                                  }
                                  return results;
                                });
                              }
                            };
                          }
                        }));
                      };
                      for (i = 0, len = balloons.length; i < len; i++) {
                        dst_dirpath = balloons[i];
                        fn(dst_dirpath);
                      }
                      return Promise.all(promises).then(function(submenulist) {
                        return view_contextmenu(nanika, mouse, submenulist);
                      });
                    });
                  }
                }, {
                  text: 'インストール',
                  cb: function() {
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
                          install_nar(file, ghostpath, nanika.ghost.descript['sakura.name']);
                        }
                        return $('#install_field').remove();
                      };
                    })(this));
                    $('body').append(install_field);
                    return install_field.click();
                  }
                }, {
                  text: '開発用 スクリプト入力',
                  cb: function() {
                    return nanika.ssp.play(window.prompt('send'));
                  }
                }, {
                  text: '全消去',
                  cb: delete_storage
                }, {
                  text: '終了',
                  cb: function() {
                    return nanikamanager.close(nanika.ghostpath, 'user');
                  }
                }, {
                  text: '全て終了',
                  cb: function() {
                    return nanikamanager.closeall('user');
                  }
                }
              ];
              return view_contextmenu(nanika, mouse, menulist);
            } else {
              return hide_contextmenu();
            }
          } else {
            return hide_contextmenu();
          }
        });
      }
    };
    install = {
      initialize: function(nanika) {
        var main;
        main = function() {
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
                results.push(install_nar(file, nanika.ghostpath, nanika.ghost.descript['sakura.name']));
              }
              return results;
            };
          })(this));
        };
        main();
        return nanika.on('named.initialized', main);
      }
    };
    notice_events = {
      initialize: function(nanika) {
        var name;
        name = nanika.ghost.descript.name;
        nanika.on('named.initialized', function() {
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
      return nanikamanager.bootall();
    });
  };
  halt_nanikamanager = function() {
    return nanikamanager.closeall('user');
  };
  install_nar = function(file, dirpath, sakuraname, type) {
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
            profile.balloonpath = 'origin';
            profile.ghosts = ['ikaga'];
            return storage.base_profile(profile).then(function() {
              install_nar(ghost_nar2, '', '', 'url');
              return Promise.all([install_nar(balloon_nar, '', '', 'url'), install_nar(ghost_nar, '', '', 'url')]);
            });
          }
        }).then(function() {
          $('#ikagaka_boot').click(boot_nanikamanager);
          $('#ikagaka_halt').click(halt_nanikamanager);
          $('#ikagaka_clean').click(delete_storage);
          return boot_nanikamanager();
        });
      });
    });
  };
  if (typeof require !== "undefined" && require !== null) {
    return cb();
  } else {
    return new BrowserFS.FileSystem.IndexedDB(cb);
  }
});
