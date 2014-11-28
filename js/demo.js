var NarLoader, Promise, Single;

Promise = this.Promise;

if (this.Ikagaka != null) {
  NarLoader = this.Ikagaka.NarLoader || this.NarLoader;
  Single = this.Ikagaka.Single || this.Single;
} else {
  NarLoader = this.NarLoader;
  Single = this.Single;
}

$(function() {
  return $("#nar").change(function(ev) {
    var narloader;
    narloader = new NarLoader();
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
      var balloon_nar, ghost_nar, single;
      ghost_nar = _arg[0], balloon_nar = _arg[1];
      single = new Single();
      return single.load_nar(ghost_nar, balloon_nar, {
        path: "./vendor/js/",
        logging: true
      }).then(function() {
        return single.run('body');
      });
    })["catch"](function(err) {
      console.error(err, err.stack);
      return alert(err);
    });
  });
});
