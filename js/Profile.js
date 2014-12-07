var Profile;

Profile = {};

Profile.Shell = (function() {
  function Shell(profile) {
    this.profile = profile != null ? profile : {};
  }

  Shell.prototype.valueOf = function() {
    return {
      profile: this.profile
    };
  };

  return Shell;

})();

Profile.Ghost = (function() {
  function Ghost(profile, shells) {
    this.profile = profile != null ? profile : {};
    this.shells = shells != null ? shells : {};
  }

  Ghost.prototype.shell = function(dirpath) {
    if (this.shells[dirpath] != null) {
      return this.shells[dirpath];
    } else {
      return this.shells[dirpath] = new Profile.Shell();
    }
  };

  Ghost.prototype.valueOf = function() {
    return {
      profile: this.profile,
      shells: this.shells
    };
  };

  return Ghost;

})();

Profile.Baseware = (function() {
  function Baseware(profile, ghosts) {
    this.profile = profile != null ? profile : {};
    this.ghosts = ghosts != null ? ghosts : {};
  }

  Baseware.prototype.ghost = function(dirpath) {
    if (this.ghosts[dirpath] != null) {
      return this.ghosts[dirpath];
    } else {
      return this.ghosts[dirpath] = new Profile.Ghost();
    }
  };

  Baseware.prototype.valueOf = function() {
    return {
      profile: this.profile,
      ghosts: this.ghosts
    };
  };

  return Baseware;

})();

if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
  module.exports = Profile;
} else if (this.Ikagaka != null) {
  this.Ikagaka.Profile = Profile;
} else {
  this.Profile = Profile;
}
