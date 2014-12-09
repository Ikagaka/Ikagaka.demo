var NanikaStorage;

NanikaStorage = (function() {
  function NanikaStorage(ghosts, balloons) {
    this.ghosts = ghosts != null ? ghosts : {};
    this.balloons = balloons != null ? balloons : {};
  }

  NanikaStorage.prototype.ghost = function(dirpath) {
    if (this.ghosts[dirpath] == null) {
      throw new Error("ghost not found at [" + dirpath + "]");
    }
    return this.ghosts[dirpath];
  };

  NanikaStorage.prototype.balloon = function(dirpath) {
    if (this.balloons[dirpath] == null) {
      throw new Error("balloon not found at [" + dirpath + "]");
    }
    return this.balloons[dirpath];
  };

  NanikaStorage.prototype.ghost_master = function(dirpath) {
    var ghost;
    ghost = this.ghost(dirpath);
    console.log(ghost);
    if (!ghost.hasElement('ghost/master')) {
      throw new Error("ghost/master not found at [" + dirpath + "]");
    }
    return ghost.getDirectory('ghost/master');
  };

  NanikaStorage.prototype.shell = function(dirpath, shellpath) {
    var ghost;
    ghost = this.ghost(dirpath);
    if (!ghost.hasElement('shell/' + shellpath)) {
      throw new Error("shell/" + shellpath + " not found at [" + dirpath + "]");
    }
    return ghost.getDirectory('shell/' + shellpath);
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

  NanikaStorage.prototype.install_nar = function(nar, dirpath) {
    switch (nar.install.type) {
      case 'ghost':
        return this.install_ghost(nar, dirpath);
      case 'balloon':
        return this.install_balloon(nar, dirpath);
      case 'supplement':
        return this.install_supplement(nar, dirpath);
      case 'shell':
        return this.install_shell(nar, dirpath);
      case 'package':
        return this.install_package(nar, dirpath);
      default:
        throw new Error('not supported');
    }
  };

  NanikaStorage.prototype.install_ghost = function(nar, dirpath) {
    var install, install_results, target_directory, _ref;
    install = nar.install || {};
    if (!install.directory) {
      throw new Error("install.txt directory entry required");
    }
    target_directory = install.directory;
    _ref = this.install_children(nar, dirpath), nar = _ref.nar, install_results = _ref.install_results;
    this.ghosts[target_directory] = this.merge_directory(this.ghosts[target_directory], nar);
    install_results.push({
      type: 'ghost',
      directory: target_directory
    });
    return install_results;
  };

  NanikaStorage.prototype.install_balloon = function(nar, dirpath) {
    var install, install_results, target_directory;
    install = nar.install || {};
    if (!install.directory) {
      throw new Error("install.txt directory entry required");
    }
    target_directory = install.directory;
    install_results = [];
    this.balloons[target_directory] = this.merge_directory(this.balloons[target_directory], nar);
    install_results.push({
      type: 'balloon',
      directory: target_directory
    });
    return install_results;
  };

  NanikaStorage.prototype.install_supplement = function(nar, dirpath) {
    var ghost;
    if (!dirpath) {
      throw new Error("ghost information required");
    }
    ghost = this.ghost(dirpath);
    if ((install.accept != null) && install.accept !== ghost.install.name) {
      return null;
    }
    throw 'not supported';
  };

  NanikaStorage.prototype.install_shell = function(nar, dirpath) {
    var ghost, install, install_results, shell, target_directory, _ref;
    install = nar.install || {};
    if (!dirpath) {
      throw new Error("ghost information required");
    }
    if (!install.directory) {
      throw new Error("install.txt directory entry required");
    }
    target_directory = install.directory;
    _ref = this.install_children(nar, dirpath), nar = _ref.nar, install_results = _ref.install_results;
    ghost = this.ghost(dirpath);
    if ((install.accept != null) && install.accept !== ghost.install.name) {
      return null;
    }
    shell = ghost.getDirectory('shell/' + target_directory);
    shell = this.merge_directory(shell, nar);
    shell = shell.wrapDirectory(target_directory).wrapDirectory('shell');
    this.ghosts[dirpath] = this.merge_directory(this.ghosts[dirpath], shell);
    install_results.push({
      type: 'shell',
      directory: target_directory
    });
    return install_results;
  };

  NanikaStorage.prototype.install_package = function(nar, dirpath) {
    var child, child_install_results, directory, install_results, _i, _len, _ref;
    install_results = [];
    _ref = nar.listChildren();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      directory = nar.getDirectory(child);
      if (Object.keys(directory.files).length) {
        child_install_results = this.install_nar(directory, dirpath);
        install_results = install_results.concat(child_install_results);
      }
    }
    return install_results;
  };

  NanikaStorage.prototype.install_children = function(nar, dirpath) {
    var child_install, child_install_results, child_nar, child_source_directory, install, install_results, type, _i, _len, _ref;
    install = nar.install || {};
    install_results = [];
    _ref = ['balloon', 'headline', 'plugin'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      type = _ref[_i];
      if (install[type + '.directory'] != null) {
        if (install[type + '.source.directory'] != null) {
          child_source_directory = install[type + '.source.directory'];
        } else {
          child_source_directory = install[type + '.directory'];
        }
        child_nar = nar.getDirectory(child_source_directory);
        if (child_nar.install == null) {
          child_nar.install = {};
        }
        child_install = child_nar.install;
        if (child_install.type == null) {
          child_install.type = type;
        }
        if (child_install.directory == null) {
          child_install.directory = install[type + '.directory'];
        }
        if (install[type + '.refresh'] != null) {
          if (child_install.refresh == null) {
            child_install.refresh = install[type + '.refresh'];
          }
        }
        if (install[type + '.refreshundeletemask'] != null) {
          if (child_install.refreshundeletemask == null) {
            child_install.refreshundeletemask = install[type + '.refreshundeletemask'];
          }
        }
        child_install_results = this.install_nar(child_nar, dirpath);
        install_results = install_results.concat(child_install_results);
        nar = nar.removeElements(child_source_directory);
      }
    }
    return {
      nar: nar,
      install_results: install_results
    };
  };

  NanikaStorage.prototype.uninstall_ghost = function(directory) {
    return delete this.ghosts[directory];
  };

  NanikaStorage.prototype.uninstall_balloon = function(directory) {
    return delete this.balloons[directory];
  };

  NanikaStorage.prototype.merge_directory = function(directory, new_directory) {
    var install, path, undelete_elements;
    if (directory == null) {
      directory = null;
    }
    install = new_directory.install || {};
    if (directory != null) {
      if (install.refresh) {
        if (install.refreshundeletemask) {
          undelete_elements = install.refreshundeletemask.split(/:/);
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
