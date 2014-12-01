var Console, Nanika, NarLoader, Promise,
  __slice = [].slice;

Promise = this.Promise;

if (this.Ikagaka != null) {
  NarLoader = this.Ikagaka.NarLoader || this.NarLoader;
  Nanika = this.Ikagaka.Nanika || this.Nanika;
} else {
  NarLoader = this.NarLoader;
  Nanika = this.Nanika;
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
  var con, error, log, warn;
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
      if (!/SHIORI\/\d\.\d/.test(t)) {
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
  return $("#nar").change((function(_this) {
    return function(ev) {
      var narloader;
      narloader = new Nar.Loader();
      return Promise.all([
        new Promise(function(resolve, reject) {
          con.log("load nar : " + ev.target.files[0].name);
          return narloader.loadFromBlob(ev.target.files[0], function(err, nar) {
            if (err != null) {
              return reject(err);
            } else {
              return resolve(nar);
            }
          });
        }), new Promise(function(resolve, reject) {
          var balloon_nar;
          balloon_nar = './vendor/nar/origin.nar';
          con.log("load nar : " + balloon_nar);
          return narloader.loadFromURL(balloon_nar, function(err, nar) {
            if (err != null) {
              return reject(err);
            } else {
              return resolve(nar);
            }
          });
        })
      ]).then(function(_arg) {
        var balloon_nar, ghost_nar;
        ghost_nar = _arg[0], balloon_nar = _arg[1];
        return new Promise(function(resolve, reject) {
          var balloon;
          balloon = new Balloon(balloon_nar.directory);
          return balloon.load(function(err) {
            if (err != null) {
              return reject(err);
            } else {
              return resolve([ghost_nar, balloon]);
            }
          });
        });
      })["catch"](function(err) {
        console.error(err, err.stack);
        return alert(err);
      }).then(function(_arg) {
        var balloon, ghost_nar, namedmanager, nanika, nanikamanager;
        ghost_nar = _arg[0], balloon = _arg[1];
        console.log("nar loaded");
        nanikamanager = {
          get_balloon: function() {
            return balloon;
          }
        };
        namedmanager = new NamedManager();
        $(namedmanager.element).appendTo("body");
        nanika = new Nanika(nanikamanager, namedmanager, ghost_nar);
        nanika.options.append_path = "./vendor/js/";
        nanika.options.logging = true;
        return nanika.load();
      });
    };
  })(this));
});
