var NanikaStorage;

NanikaStorage = (function() {
  function NanikaStorage(ghosts, balloons) {
    this.ghosts = ghosts != null ? ghosts : {};
    this.balloons = balloons != null ? balloons : {};
  }

  NanikaStorage.prototype.ghost = function(dirpath) {
    if (this.ghosts[dirpath] == null) {
      throw "ghost not found at [" + dirpath + "]";
    }
    return this.ghosts[dirpath];
  };

  NanikaStorage.prototype.balloon = function(dirpath) {
    if (this.balloons[dirpath] == null) {
      throw "balloon not found at [" + dirpath + "]";
    }
    return this.balloons[dirpath];
  };

  NanikaStorage.prototype.ghost_master = function(dirpath) {
    return this.ghost(dirpath).getDirectory('ghost/master');
  };

  NanikaStorage.prototype.shell = function(dirpath, shellpath) {
    return this.ghost(dirpath).getDirectory('shell/' + shellpath);
  };

  NanikaStorage.prototype.ghost_names = function() {
    return Object.keys(this.ghosts).map((function(_this) {
      return function(directory) {
        return _this.ghosts[directory].install.name;
      };
    })(this)).sort();
  };

  NanikaStorage.prototype.balloon_names = function() {
    return Object.keys(this.balloons).map((function(_this) {
      return function(directory) {
        return _this.balloons[directory].install.name;
      };
    })(this)).sort();
  };

  NanikaStorage.prototype.install_nar = function(nar, ghost) {
    switch (nar.install.type) {
      case 'ghost':
        return this.install_ghost(nar);
      case 'balloon':
        return this.install_balloon(nar);
      case 'supplement':
        return this.install_supplement(nar, ghost);
      case 'shell':
        return this.install_shell(nar, ghost);
      case 'package':
        return this.install_package(nar, ghost);
      default:
        throw 'not supported';
    }
  };

  NanikaStorage.prototype.install_ghost = function(nar) {
    var balloon_directory, balloon_nar, directory, _ref;
    if (!((_ref = nar.install) != null ? _ref.directory : void 0)) {
      throw "install.txt directory entry required";
    }
    if (nar.install['balloon.directory']) {
      balloon_directory = nar.install['balloon.directory'];
      balloon_nar = nar.getDirectory(balloon_directory, {
        has_install: true
      });
      this.install_balloon(balloon_nar);
      nar = nar.removeElements(balloon_directory);
    }
    directory = this.merge_directory(this.ghosts[nar.install.directory], nar);
    return this.ghosts[nar.install.directory] = directory;
  };

  NanikaStorage.prototype.install_balloon = function(nar) {
    var directory, _ref;
    if (!((_ref = nar.install) != null ? _ref.directory : void 0)) {
      throw "install.txt directory entry required";
    }
    directory = this.merge_directory(this.balloons[nar.install.directory], nar);
    return this.balloons[nar.install.directory] = directory;
  };

  NanikaStorage.prototype.install_supplement = function(nar, ghost) {
    throw 'not supported';
  };

  NanikaStorage.prototype.install_shell = function(nar, ghost) {
    var _ref;
    if (!((_ref = nar.install) != null ? _ref.directory : void 0)) {
      throw "install.txt directory entry required";
    }
    nar = nar.wrapDirectory(nar.install.directory);
    throw 'not supported';
  };

  NanikaStorage.prototype.install_package = function(nar, ghost) {
    var child, directory, _i, _len, _ref, _results;
    _ref = nar.listChildren();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      directory = nar.getDirectory(child);
      if (directory.files.length) {
        _results.push(this.install_nar(directory, ghost));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  NanikaStorage.prototype.uninstall_ghost = function(directory) {
    return delete this.ghosts[directory];
  };

  NanikaStorage.prototype.uninstall_balloon = function(directory) {
    return delete this.balloons[directory];
  };

  NanikaStorage.prototype.merge_directory = function(directory, new_directory) {
    var path, undelete_elements, _ref, _ref1;
    if (directory == null) {
      directory = null;
    }
    if (directory != null) {
      if ((_ref = new_directory.install) != null ? _ref.refresh : void 0) {
        if ((_ref1 = new_directory.install) != null ? _ref1.refreshundeletemask : void 0) {
          undelete_elements = new_directory.install.refreshundeletemask.split(/:/);
          directory = directory.getElements(undelete_elements);
        } else {
          directory = null;
        }
      }
    }
    if (directory != null) {
      for (path in new_directory.files) {
        directory.files[path] = new_directory.files[path];
      }
      directory.parse();
    } else {
      directory = new_directory;
    }
    return directory;
  };

  return NanikaStorage;

})();

if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
  module.exports = NanikaStorage;
} else if (this.Ikagaka != null) {
  this.Ikagaka.NanikaStorage = NanikaStorage;
} else {
  this.NanikaStorage = NanikaStorage;
}
