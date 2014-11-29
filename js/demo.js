var Nanika, NarLoader, Promise;

Promise = this.Promise;

if (this.Ikagaka != null) {
  NarLoader = this.Ikagaka.NarLoader || this.NarLoader;
  Nanika = this.Ikagaka.Nanika || this.Nanika;
} else {
  NarLoader = this.NarLoader;
  Nanika = this.Nanika;
}

$(function() {
  return $("#nar").change(function(ev) {
    var narloader;
    narloader = new Nar.Loader();
    return Promise.all([
      new Promise((function(_this) {
        return function(resolve, reject) {
          return narloader.loadFromBlob(ev.target.files[0], function(err, nar) {
            if (err != null) {
              return reject(err);
            } else {
              return resolve(nar);
            }
          });
        };
      })(this)), new Promise((function(_this) {
        return function(resolve, reject) {
          return narloader.loadFromURL('./vendor/nar/origin.nar', function(err, nar) {
            if (err != null) {
              return reject(err);
            } else {
              return resolve(nar);
            }
          });
        };
      })(this))
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
      console.log(balloon);
      nanikamanager = {
        get_balloon: function() {
          return balloon;
        }
      };
      namedmanager = new NamedManager();
      $(namedmanager.element).appendTo("body");
      nanika = new Nanika(nanikamanager, namedmanager, ghost_nar);
      nanika.options.path = "./vendor/js/";
      nanika.options.logging = true;
      return nanika.load();
    });
  });
});
