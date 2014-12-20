// Generated by CoffeeScript 1.8.0

/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 */

(function() {
  var NanikaEventDefinition;

  NanikaEventDefinition = this.NanikaEventDefinition;

  if (NanikaEventDefinition == null) {
    NanikaEventDefinition = {};
  }

  NanikaEventDefinition.any = {
    request: function(nanika, args, optionals) {
      var headers, index, name, value, _i, _len, _ref, _ref1;
      headers = null;
      if (args.headers != null) {
        if (args.headers instanceof Array) {
          headers = {};
          _ref = args.headers;
          for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
            value = _ref[index];
            headers["Reference" + index] = value;
          }
        } else if (args.headers instanceof Object) {
          headers = {};
          _ref1 = args.headers;
          for (name in _ref1) {
            value = _ref1[name];
            if (!isNaN(name)) {
              headers["Reference" + name] = value;
            } else {
              headers[name] = value;
            }
          }
        } else {
          throw new Error("event 'any' invalid headers");
        }
      }
      return {
        method: args.method,
        submethod: args.submethod,
        id: args.id,
        headers: headers
      };
    }
  };

  this.NanikaEventDefinition = NanikaEventDefinition;

}).call(this);
// Generated by CoffeeScript 1.8.0

/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 */

(function() {
  var NanikaEventDefinition;

  NanikaEventDefinition = this.NanikaEventDefinition;

  if (NanikaEventDefinition == null) {
    NanikaEventDefinition = {};
  }

  NanikaEventDefinition.firstboot = {
    request: {
      id: 'OnFirstBoot',
      headers: {
        vanish_count: 0
      }
    }
  };

  NanikaEventDefinition.boot = {
    request: {
      id: 'OnBoot',
      headers: {
        shell_name: 0,
        halted: {
          name: 6,
          value: function(value, nanika, request_args, optionals) {
            if (value) {
              return 'halt';
            } else {
              return '';
            }
          }
        },
        halted_ghost: {
          name: 7,
          value: function(value, nanika, request_args, optionals) {
            if (value != null) {
              return value;
            } else {
              return '';
            }
          }
        }
      }
    }
  };

  NanikaEventDefinition.calling = {
    request: {
      id: 'OnGhostCalling',
      headers: {
        other_sakuraname: 0,
        reason: 1,
        other_name: 2,
        other_path: 3
      }
    }
  };

  NanikaEventDefinition.call_complete = {
    request: {
      id: 'OnGhostCallComplete',
      headers: {
        other_sakuraname: 0,
        other_script: 1,
        other_name: 2,
        other_shell_name: 7
      }
    }
  };

  NanikaEventDefinition.other_booted = {
    request: {
      id: 'OnOtherGhostBooted',
      headers: {
        other_sakuraname: 0,
        other_script: 1,
        other_name: 2,
        other_shell_name: 7
      }
    }
  };

  NanikaEventDefinition.other_changed = {
    request: {
      id: 'OnOtherGhostChanged',
      headers: {
        from_sakuraname: 0,
        to_sakuraname: 1,
        from_script: 2,
        to_script: 3,
        from_name: 4,
        to_name: 5,
        from_shell_name: 14,
        to_shell_name: 15
      }
    }
  };

  NanikaEventDefinition.other_closed = {
    request: {
      id: 'OnOtherGhostClosed',
      headers: {
        other_sakuraname: 0,
        other_script: 1,
        other_name: 2,
        other_shell_name: 7
      }
    }
  };

  this.NanikaEventDefinition = NanikaEventDefinition;

}).call(this);
// Generated by CoffeeScript 1.8.0

/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 */

(function() {
  var NanikaEventDefinition, choiceex_headers;

  NanikaEventDefinition = this.NanikaEventDefinition;

  if (NanikaEventDefinition == null) {
    NanikaEventDefinition = {};
  }

  choiceex_headers = function(nanika, args) {
    var headers, index, value, _i, _len, _ref;
    headers = {
      Reference0: args.label,
      Reference1: args.id
    };
    if (args.args != null) {
      _ref = args.args;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        value = _ref[index];
        headers["Reference" + (index + 2)] = value;
      }
    }
    return headers;
  };

  NanikaEventDefinition.choiceselect = {
    request: {
      id: 'OnChoiceSelect',
      headers: {
        id: 0
      }
    }
  };

  NanikaEventDefinition.choiceselectex = {
    request: {
      id: 'OnChoiceSelectEx',
      headers: choiceex_headers
    }
  };

  NanikaEventDefinition.choicehover = {
    request: {
      id: 'OnChoiceHover',
      headers: choiceex_headers
    }
  };

  NanikaEventDefinition.choiceenter = {
    request: {
      method: 'NOTIFY',
      submethod: null,
      id: 'OnChoiceEnter',
      headers: choiceex_headers
    }
  };

  NanikaEventDefinition.choicetimeout = {
    request: {
      id: 'OnChoiceTimeout',
      headers: {
        script: 0
      }
    }
  };

  NanikaEventDefinition.anchorselect = {
    request: {
      id: 'OnAnchorSelect',
      headers: {
        id: 0
      }
    }
  };

  NanikaEventDefinition.anchorselectex = {
    request: {
      id: 'OnAnchorSelectEx',
      headers: choiceex_headers
    }
  };

  this.NanikaEventDefinition = NanikaEventDefinition;

}).call(this);
// Generated by CoffeeScript 1.8.0

/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 */

(function() {
  var NanikaEventDefinition;

  NanikaEventDefinition = this.NanikaEventDefinition;

  if (NanikaEventDefinition == null) {
    NanikaEventDefinition = {};
  }

  NanikaEventDefinition.close = {
    request: {
      id: 'OnClose',
      headers: {
        reason: 0
      }
    }
  };

  NanikaEventDefinition.closeall = {
    request: {
      id: 'OnCloseAll',
      headers: {
        reason: 0
      }
    }
  };

  NanikaEventDefinition.changing = {
    request: {
      id: 'OnGhostChanging',
      headers: {
        to_sakuraname: 0,
        reason: 1,
        to_name: 2,
        to_path: 3
      }
    }
  };

  this.NanikaEventDefinition = NanikaEventDefinition;

}).call(this);
// Generated by CoffeeScript 1.8.0

/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 */

(function() {
  var NanikaEventDefinition;

  NanikaEventDefinition = this.NanikaEventDefinition;

  if (NanikaEventDefinition == null) {
    NanikaEventDefinition = {};
  }

  NanikaEventDefinition.communicate = {
    request: {
      id: 'OnCommunicate',
      headers: function(nanika, args) {
        var headers, index, value, _i, _len, _ref;
        headers = {
          Reference0: args.sender,
          Reference1: args.content
        };
        if (args.args != null) {
          _ref = args.args;
          for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
            value = _ref[index];
            headers["Reference" + (index + 2)] = value;
          }
        }
        return headers;
      }
    }
  };

  this.NanikaEventDefinition = NanikaEventDefinition;

}).call(this);
// Generated by CoffeeScript 1.8.0

/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 */

(function() {
  var NanikaEventDefinition;

  NanikaEventDefinition = this.NanikaEventDefinition;

  if (NanikaEventDefinition == null) {
    NanikaEventDefinition = {};
  }

  NanikaEventDefinition.username = {
    request: {
      method: 'GET',
      submethod: 'String',
      id: 'username'
    }
  };

  NanikaEventDefinition['sakura.recommendsites'] = {
    request: {
      method: 'GET',
      submethod: 'String',
      id: 'sakura.recommendsites'
    }
  };

  NanikaEventDefinition['sakura.portalsites'] = {
    request: {
      method: 'GET',
      submethod: 'String',
      id: 'sakura.portalsites'
    }
  };

  NanikaEventDefinition['kero.recommendsites'] = {
    request: {
      method: 'GET',
      submethod: 'String',
      id: 'kero.recommendsites'
    }
  };

  this.NanikaEventDefinition = NanikaEventDefinition;

}).call(this);
// Generated by CoffeeScript 1.8.0

/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 */

(function() {
  var NanikaEventDefinition;

  NanikaEventDefinition = this.NanikaEventDefinition;

  if (NanikaEventDefinition == null) {
    NanikaEventDefinition = {};
  }

  NanikaEventDefinition.userinput = {
    request: {
      id: 'OnUserInput',
      headers: {
        id: 0,
        content: 1
      }
    }
  };

  NanikaEventDefinition.userinputcancel = {
    request: {
      id: 'OnUserInputCancel',
      headers: {
        id: 0,
        reason: 1
      }
    }
  };

  NanikaEventDefinition.communicateinputcancel = {
    request: {
      id: 'OnCommunicateInputCancel',
      headers: {
        reason: 1
      }
    }
  };

  this.NanikaEventDefinition = NanikaEventDefinition;

}).call(this);
// Generated by CoffeeScript 1.8.0

/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 */

(function() {
  var NanikaEventDefinition;

  NanikaEventDefinition = this.NanikaEventDefinition;

  if (NanikaEventDefinition == null) {
    NanikaEventDefinition = {};
  }

  NanikaEventDefinition.firstboot = {
    request: {
      id: 'OnFirstBoot',
      headers: {
        vanish_count: 0
      }
    }
  };

  NanikaEventDefinition.boot = {
    request: {
      id: 'OnBoot',
      headers: {
        shell_name: 0,
        halted: {
          name: 6,
          value: function(value, nanika, request_args, optionals) {
            if (value) {
              return 'halt';
            } else {
              return '';
            }
          }
        },
        halted_ghost: {
          name: 7,
          value: function(value, nanika, request_args, optionals) {
            if (value != null) {
              return value;
            } else {
              return '';
            }
          }
        }
      }
    }
  };

  NanikaEventDefinition.changed = {
    request: {
      id: 'OnGhostChanged',
      headers: {
        from_sakuraname: 0,
        from_script: 1,
        from_name: 2,
        from_path: 3,
        shell_name: 7
      }
    }
  };

  NanikaEventDefinition.called = {
    request: {
      id: 'OnGhostCalled',
      headers: {
        from_sakuraname: 0,
        from_script: 1,
        from_name: 2,
        from_path: 3,
        shell_name: 7
      }
    }
  };

  this.NanikaEventDefinition = NanikaEventDefinition;

}).call(this);
// Generated by CoffeeScript 1.8.0

/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 */

(function() {
  var NanikaEventDefinition, event, mouseevents, mouseevents_header, _i, _len;

  NanikaEventDefinition = this.NanikaEventDefinition;

  if (NanikaEventDefinition == null) {
    NanikaEventDefinition = {};
  }

  mouseevents = [
    {
      type: 'mousedown',
      id: 'OnMouseDown'
    }, {
      type: 'mousedownex',
      id: 'OnMouseDownEx'
    }, {
      type: 'mouseup',
      id: 'OnMouseUp'
    }, {
      type: 'mouseupex',
      id: 'OnMouseUpEx'
    }, {
      type: 'mouseclick',
      id: 'OnMouseClick'
    }, {
      type: 'mouseclickex',
      id: 'OnMouseClickEx'
    }, {
      type: 'mousedblclick',
      id: 'OnMouseDoubleClick'
    }, {
      type: 'mousedblclickex',
      id: 'OnMouseDoubleClickEx'
    }, {
      type: 'mousedragstart',
      id: 'OnMouseDragStart'
    }, {
      type: 'mousedragend',
      id: 'OnMouseDragEnd'
    }, {
      type: 'mousewheel',
      id: 'OnMouseWheel'
    }, {
      type: 'mousemove',
      id: 'OnMouseMove'
    }, {
      type: 'mousehover',
      id: 'OnMouseHover'
    }, {
      type: 'mouseenterall',
      id: 'OnMouseEnterAll'
    }, {
      type: 'mouseleaveall',
      id: 'OnMouseLeaveAll'
    }, {
      type: 'mouseenter',
      id: 'OnMouseEnter'
    }, {
      type: 'mouseleave',
      id: 'OnMouseLeave'
    }
  ];

  mouseevents_header = {
    offsetX: 0,
    offsetY: 1,
    wheel: 2,
    scope: 3,
    region: 4,
    button: 5,
    type: 6
  };

  for (_i = 0, _len = mouseevents.length; _i < _len; _i++) {
    event = mouseevents[_i];
    NanikaEventDefinition[event.type] = {
      request: {
        id: event.id,
        headers: mouseevents_header
      }
    };
  }

  this.NanikaEventDefinition = NanikaEventDefinition;

}).call(this);
// Generated by CoffeeScript 1.8.0

/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 */

(function() {
  var NanikaEventDefinition;

  NanikaEventDefinition = this.NanikaEventDefinition;

  if (NanikaEventDefinition == null) {
    NanikaEventDefinition = {};
  }

  NanikaEventDefinition.ownerghostname = {
    request: {
      method: 'NOTIFY',
      submethod: 'OwnerGhostName',
      id: 'ownerghostname',
      headers: {
        name: 0
      }
    }
  };

  NanikaEventDefinition.otherghostname = {
    request: {
      method: 'NOTIFY',
      submethod: 'OtherGhostName',
      id: 'otherghostname',
      headers: function(nanika, args) {
        var headers, index, name, _i, _len, _ref;
        headers = {};
        _ref = args.names;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          name = _ref[index];
          headers["Reference" + index] = name;
        }
        return headers;
      }
    }
  };

  NanikaEventDefinition.basewareversion = {
    request: {
      method: 'NOTIFY',
      submethod: null,
      id: 'basewareversion',
      headers: {
        version: 0,
        name: 1
      }
    }
  };

  NanikaEventDefinition.notifyosinfo = {
    request: {
      method: 'NOTIFY',
      submethod: null,
      id: 'OnNotifyOSInfo',
      headers: function() {
        throw new Error('not implemented');
      }
    }
  };

  NanikaEventDefinition.notifybrowserinfo = {
    request: {
      method: 'NOTIFY',
      submethod: null,
      id: 'OnNotifyBrowserInfo',
      headers: {
        useragent: 0,
        browser_name: 1,
        browser_version: 2,
        engine_name: 11,
        engine_version: 12,
        os_name: 21,
        os_version: 22,
        device_model: 33,
        device_type: 34,
        device_vendor: 35,
        cpu_arch: 46
      }
    }
  };

  NanikaEventDefinition.notifyfontinfo = {
    request: {
      method: 'NOTIFY',
      submethod: null,
      id: 'OnNotifyFontInfo',
      headers: function(nanika, args) {
        var headers, index, name, _i, _len, _ref;
        headers = {};
        _ref = args.names;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          name = _ref[index];
          headers["Reference" + index] = name;
        }
        return headers;
      }
    }
  };

  NanikaEventDefinition.notifyselfinfo = {
    request: {
      method: 'NOTIFY',
      submethod: null,
      id: 'OnNotifySelfInfo',
      headers: {
        name: 0,
        sakura_name: 1,
        kero_name: 2,
        shell_name: 3,
        shell_path: 4,
        balloon_name: 5,
        balloon_path: 6
      }
    }
  };

  NanikaEventDefinition.notifyballooninfo = {
    request: {
      method: 'NOTIFY',
      submethod: null,
      id: 'OnNotifyBalloonInfo',
      headers: {
        balloon_name: 0,
        balloon_path: 1,
        surfaces: {
          name: 2,
          value: function(elements) {
            var element, index, values, _i, _len;
            values = [];
            if (elements != null) {
              for (index = _i = 0, _len = elements.length; _i < _len; index = ++_i) {
                element = elements[index];
                values.push(element.character_id + ':' + element.surfaces.join(','));
              }
            }
            return values.join(' ');
          }
        }
      }
    }
  };

  NanikaEventDefinition.notifyshellinfo = {
    request: {
      method: 'NOTIFY',
      submethod: null,
      id: 'OnNotifyShellInfo',
      headers: {
        shell_name: 0,
        shell_path: 1,
        surfaces: {
          name: 2,
          value: function(surfaces) {
            if (surfaces != null) {
              return surfaces.join(',');
            }
          }
        }
      }
    }
  };

  NanikaEventDefinition.notifyuserinfo = {
    request: {
      method: 'NOTIFY',
      submethod: null,
      id: 'OnNotifyUserInfo',
      headers: {
        nickname: 0,
        fullname: 1,
        birthday: {
          name: 2,
          value: function(value) {
            return "" + (value.getFullYear()) + "," + (value.getMonth() + 1) + "," + (value.getDate());
          },
          sex: 3
        }
      }
    }
  };

  NanikaEventDefinition.notifydressupinfo = {
    request: {
      method: 'NOTIFY',
      submethod: null,
      id: 'OnNotifyDressupInfo',
      headers: function(nanika, args) {
        var cloth, headers, index, _i, _len, _ref;
        headers = {};
        _ref = args.cloths;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          cloth = _ref[index];
          headers["Reference" + index] = [cloth.id, cloth.category_name, cloth.parts_name, cloth.options, cloth.effective, cloth.thumbnail_path].join('\x01');
        }
        return headers;
      }
    }
  };

  NanikaEventDefinition.ghostpathlist = {
    request: {
      method: 'NOTIFY',
      submethod: null,
      id: 'ghostpathlist',
      headers: function(nanika, args) {
        var headers, index, path, _i, _len, _ref;
        headers = {};
        _ref = args.paths;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          path = _ref[index];
          headers["Reference" + index] = path;
        }
        return headers;
      }
    }
  };

  NanikaEventDefinition.balloonpathlist = {
    request: {
      method: 'NOTIFY',
      submethod: null,
      id: 'balloonpathlist',
      headers: function(nanika, args) {
        var headers, index, path, _i, _len, _ref;
        headers = {};
        _ref = args.paths;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          path = _ref[index];
          headers["Reference" + index] = path;
        }
        return headers;
      }
    }
  };

  NanikaEventDefinition.installedghostname = {
    request: {
      method: 'NOTIFY',
      submethod: null,
      id: 'installedghostname',
      headers: function(nanika, args) {
        var headers, index, name, _i, _len, _ref;
        headers = {};
        _ref = args.names;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          name = _ref[index];
          headers["Reference" + index] = name;
        }
        return headers;
      }
    }
  };

  NanikaEventDefinition.installedballoonname = {
    request: {
      method: 'NOTIFY',
      submethod: null,
      id: 'installedballoonname',
      headers: function(nanika, args) {
        var headers, index, name, _i, _len, _ref;
        headers = {};
        _ref = args.names;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          name = _ref[index];
          headers["Reference" + index] = name;
        }
        return headers;
      }
    }
  };

  NanikaEventDefinition.installedshellname = {
    request: {
      method: 'NOTIFY',
      submethod: null,
      id: 'installedshellname',
      headers: function(nanika, args) {
        var headers, index, name, _i, _len, _ref;
        headers = {};
        _ref = args.names;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          name = _ref[index];
          headers["Reference" + index] = name;
        }
        return headers;
      }
    }
  };

  NanikaEventDefinition.rateofusegraph = {
    request: {
      method: 'NOTIFY',
      submethod: null,
      id: 'rateofusegraph',
      headers: function(nanika, args) {
        var ghost, headers, index, _i, _len, _ref;
        headers = {};
        _ref = args.ghosts;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          ghost = _ref[index];
          headers["Reference" + index] = [ghost.name, ghost.sakuraname, ghost.keroname, ghost.bootcount, ghost.active_minutes, ghost.active_percent, ghost.state].join('\x01');
        }
        return headers;
      }
    }
  };

  NanikaEventDefinition.uniqueid = {
    request: {
      method: 'NOTIFY',
      submethod: null,
      id: 'uniqueid',
      headers: {
        uniqueid: 0
      }
    }
  };

  this.NanikaEventDefinition = NanikaEventDefinition;

}).call(this);
// Generated by CoffeeScript 1.8.0

/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 */

(function() {
  var NanikaEventDefinition, bool;

  NanikaEventDefinition = this.NanikaEventDefinition;

  if (NanikaEventDefinition == null) {
    NanikaEventDefinition = {};
  }

  bool = function(value, nanika, request_args, optionals) {
    if (value) {
      return 1;
    } else {
      return 0;
    }
  };

  NanikaEventDefinition.secondchange = {
    request: {
      id: 'OnSecondChange',
      headers: {
        os_uptime: 0,
        mikire: {
          name: 1,
          value: bool
        },
        overlapped: {
          name: 2,
          value: bool
        },
        cantalk: {
          name: 3,
          value: bool
        }
      }
    }
  };

  NanikaEventDefinition.minutechange = {
    request: {
      id: 'OnMinuteChange',
      headers: {
        os_uptime: 0,
        mikire: {
          name: 1,
          value: bool
        },
        overlapped: {
          name: 2,
          value: bool
        },
        cantalk: {
          name: 3,
          value: bool
        }
      }
    }
  };

  this.NanikaEventDefinition = NanikaEventDefinition;

}).call(this);
// Generated by CoffeeScript 1.8.0

/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 */

(function() {
  var NanikaEventDefinition;

  NanikaEventDefinition = this.NanikaEventDefinition;

  if (NanikaEventDefinition == null) {
    NanikaEventDefinition = {};
  }

  NanikaEventDefinition.version = {
    request: {
      submethod: 'Version',
      id: 'version'
    }
  };

  NanikaEventDefinition.name = {
    request: {
      submethod: 'String',
      id: 'name'
    }
  };

  NanikaEventDefinition.craftman = {
    request: {
      submethod: 'String',
      id: 'craftman'
    }
  };

  NanikaEventDefinition.craftmanw = {
    request: {
      submethod: 'String',
      id: 'craftmanw'
    }
  };

  this.NanikaEventDefinition = NanikaEventDefinition;

}).call(this);
