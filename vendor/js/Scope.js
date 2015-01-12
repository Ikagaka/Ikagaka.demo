// Generated by CoffeeScript 1.8.0
(function() {
  var $, Scope,
    __slice = [].slice;

  $ = window["Zepto"];

  Scope = (function() {
    function Scope(scopeId, shell, balloon) {
      var clickable_element_style, descript, styles;
      this.scopeId = scopeId;
      this.shell = shell;
      this.balloon = balloon;
      this.$scope = $("<div />").addClass("scope");
      this.$surface = $("<div />").addClass("surface");
      this.$surfaceCanvas = $("<canvas width='10' height='100' />").addClass("surfaceCanvas");
      this.$blimp = $("<div />").addClass("blimp");
      this.$blimpCanvas = $("<canvas width='0' height='0' />").addClass("blimpCanvas");
      this.$blimpText = $("<div />").addClass("blimpText");
      descript = this.balloon.descript;
      styles = {};
      styles["cursor"] = descript["cursor"] || '';
      styles["font.name"] = (descript["font.name"] || "MS Gothic").split(/,/).map(function(name) {
        return '"' + name + '"';
      }).join(',');
      styles["font.height"] = (descript["font.height"] || "12") + "px";
      styles["font.color"] = this._getFontColor(descript["font.color.r"], descript["font.color.g"], descript["font.color.b"]);
      styles["font.shadowcolor"] = this._getFontColor(descript["font.shadowcolor.r"], descript["font.shadowcolor.g"], descript["font.shadowcolor.b"], true);
      styles["font.bold"] = descript["font.bold"];
      styles["font.italic"] = descript["font.italic"];
      styles["font.strike"] = descript["font.strike"];
      styles["font.underline"] = descript["font.underline"];
      this._text_style = styles;
      clickable_element_style = (function(_this) {
        return function(prefix, style_default, descript, can_ignore) {
          styles = {};
          styles["style"] = {
            square: true,
            underline: true,
            'square+underline': true,
            none: true
          }[descript["" + prefix + ".style"]] ? descript["" + prefix + ".style"] : style_default;
          styles["font.color"] = _this._getFontColor(descript["" + prefix + ".font.color.r"], descript["" + prefix + ".font.color.g"], descript["" + prefix + ".font.color.b"], can_ignore);
          styles["pen.color"] = _this._getFontColor(descript["" + prefix + ".pen.color.r"], descript["" + prefix + ".pen.color.g"], descript["" + prefix + ".pen.color.b"], can_ignore);
          styles["brush.color"] = _this._getFontColor(descript["" + prefix + ".brush.color.r"], descript["" + prefix + ".brush.color.g"], descript["" + prefix + ".brush.color.b"], can_ignore);
          return styles;
        };
      })(this);
      this._choice_style = clickable_element_style("cursor", "square", descript);
      this._choice_notselect_style = clickable_element_style("cursor.notselect", void 0, descript, true);
      this._anchor_style = clickable_element_style("anchor", "underline", descript);
      this._anchor_notselect_style = clickable_element_style("anchor.notselect", void 0, descript, true);
      this.$blimpText.css(this._blimpTextCSS(this._text_style));
      this._initializeCurrentStyle();
      this.element = this.$scope[0];
      this.destructors = [];
      this.currentSurface = this.shell.attachSurface(this.$surfaceCanvas[0], this.scopeId, 0);
      this.currentBalloon = this.balloon.attachSurface(this.$blimpCanvas[0], this.scopeId, 0);
      this.isBalloonLeft = true;
      this.insertPoint = this.$blimpText;
      this.$blimp.append(this.$blimpCanvas);
      this.$blimp.append(this.$blimpText);
      this.$surface.append(this.$surfaceCanvas);
      this.$scope.append(this.$surface);
      this.$scope.append(this.$blimp);
      this.$scope.css({
        "bottom": "0px",
        "right": (this.scopeId * 240) + "px"
      });
      this.surface(0);
      this.blimp(0);
      this.surface(-1);
      this.blimp(-1);
    }

    Scope.prototype.surface = function(surfaceId) {
      var prevSrfId, tmp, type;
      type = this.scopeId === 0 ? "sakura" : "kero";
      if (Number(surfaceId) < 0) {
        this.$surface.hide();
        return this.currentSurface;
      }
      if (surfaceId != null) {
        prevSrfId = this.currentSurface.surfaces.surfaces[this.currentSurface.surfaceName].is;
        this.currentSurface.destructor();
        tmp = this.shell.attachSurface(this.$surfaceCanvas[0], this.scopeId, surfaceId);
        if (!tmp) {
          tmp = this.shell.attachSurface(this.$surfaceCanvas[0], this.scopeId, prevSrfId);
        }
        this.currentSurface = tmp;
        this.$scope.width(this.$surfaceCanvas[0].width);
        this.$scope.height(this.$surfaceCanvas[0].height);
        this.$surface.show();
      }
      return this.currentSurface;
    };

    Scope.prototype.blimp = function(balloonId) {
      var b, descript, h, l, location, r, t, tmp, type, w;
      if (Number(balloonId) < 0) {
        this.$blimp.hide();
      } else {
        if (balloonId != null) {
          this.currentBalloon.destructor();
          tmp = this.balloon.attachSurface(this.$blimpCanvas[0], this.scopeId, balloonId);
          this.currentBalloon = tmp;
          this.$blimp.width(this.$blimpCanvas[0].width);
          this.$blimp.height(this.$blimpCanvas[0].height);
          this.$blimp.show();
          descript = this.currentBalloon.descript;
          type = this.scopeId === 0 ? "sakura" : "kero";
          this.$blimp.css({
            "top": Number(this.shell.descript["" + type + ".balloon.offsety"] || 0)
          });
          if (this.isBalloonLeft) {
            this.$blimp.css({
              "left": Number(this.shell.descript["" + type + ".balloon.offsetx"] || 0) + -1 * this.$blimpCanvas[0].width
            });
          } else {
            this.$blimp.css({
              "left": Number(this.shell.descript["" + type + ".balloon.offsetx"] || 0) + this.$surfaceCanvas[0].width
            });
          }
          t = descript["origin.y"] || descript["validrect.top"] || "10";
          r = descript["validrect.right"] || "10";
          b = descript["validrect.bottom"] || "10";
          l = descript["origin.x"] || descript["validrect.left"] || "10";
          w = this.$blimpCanvas[0].width;
          h = this.$blimpCanvas[0].height;
          this.$blimpText.css({
            "top": "" + t + "px",
            "left": "" + l + "px",
            "width": "" + (w - (Number(l) + Number(r))) + "px",
            "height": "" + (h - (Number(t) - Number(b))) + "px"
          });
        }
      }
      location = (function(_this) {
        return function(x, y) {
          var $imp_position_checker, $newimp, $newimp_container, $newimp_container_top, baseoffset, offset, offsetx, offsety, re, toparam, xp, yp;
          re = /^(@)?(-?\d*\.?\d*e?\d*)(em|%)?$/;
          toparam = function(r) {
            var rp, unit, value;
            if (!((r != null) && r.length)) {
              return {
                relative: true,
                value: 0
              };
            }
            rp = r.match(re);
            if (!rp) {
              return;
            }
            if (isNaN(rp[2])) {
              return;
            }
            if (rp[3] === '%') {
              value = rp[2] / 100;
              unit = 'em';
            } else {
              value = Number(rp[2]);
              unit = rp[3] || 'px';
            }
            return {
              relative: !!rp[1],
              value: value + unit
            };
          };
          xp = toparam(x);
          yp = toparam(y);
          if (!((xp != null) && (yp != null))) {
            return;
          }
          if (xp.relative || yp.relative) {
            $imp_position_checker = $('<span>.</span>');
            _this.insertPoint.append($imp_position_checker);
            offset = $imp_position_checker.offset();
            baseoffset = _this.$blimpText.offset();
            offsetx = offset.left - baseoffset.left;
            offsety = offset.top - baseoffset.top + _this.$blimpText.scrollTop();
            $imp_position_checker.remove();
          }
          if (!xp.relative) {
            offsetx = 0;
          }
          if (!yp.relative) {
            offsety = 0;
          }
          $newimp_container_top = $('<div />').css({
            'position': 'absolute',
            'pointer-events': 'none',
            'top': yp.value
          });
          $newimp_container = $('<div />').css({
            'position': 'absolute',
            'pointer-events': 'none',
            'text-indent': offsetx + 'px',
            'top': offsety + 'px',
            'width': _this.$blimpText[0].clientWidth
          });
          $newimp = $('<span />').css({
            'pointer-events': 'auto',
            'margin-left': xp.value
          });
          _this.insertPoint = $newimp.appendTo($newimp_container.appendTo($newimp_container_top.appendTo(_this.$blimpText)));
          return _this.insertPoint.css(_this._blimpTextCSS(_this._current_text_style));
        };
      })(this);
      return {
        anchorBegin: (function(_this) {
          return function() {
            var $a, anchor_css, anchor_notselect_css, args, argv, id, index, text_css, _i, _id, _len;
            id = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
            _this.$blimpText.find(".blink").hide();
            _this.$blimp.show();
            _id = $(document.createElement("div")).text(id).html();
            $a = $("<a />");
            $a.addClass("ikagaka-anchor");
            text_css = _this._blimpTextCSS(_this._current_text_style);
            anchor_css = _this._blimpClickableTextCSS(_this._current_anchor_style);
            anchor_notselect_css = _this._blimpClickableTextCSS(_this._current_anchor_notselect_style, _this._current_anchor_style);
            $a.css(text_css).css(anchor_css.base).css(anchor_notselect_css.base).css(anchor_notselect_css.over);
            $a.mouseover(function() {
              return $a.css(anchor_css.over);
            });
            $a.mouseout(function() {
              return $a.css(text_css).css(anchor_css.base).css(anchor_notselect_css.base).css(anchor_notselect_css.over);
            });
            $a.attr("data-id", _id);
            $a.attr("data-argc", args.length);
            for (index = _i = 0, _len = args.length; _i < _len; index = ++_i) {
              argv = args[index];
              $a.attr("data-argv" + index, argv);
            }
            _this.originalInsertPoint = _this.insertPoint;
            _this.insertPoint = $a.appendTo(_this.insertPoint);
          };
        })(this),
        anchorEnd: (function(_this) {
          return function() {
            _this.insertPoint = _this.originalInsertPoint;
          };
        })(this),
        choice: (function(_this) {
          return function() {
            var $a, args, argv, choice_css, choice_notselect_css, id, index, text, text_css, _i, _id, _len, _text;
            text = arguments[0], id = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
            _this.$blimpText.find(".blink").hide();
            _this.$blimp.show();
            _text = $(document.createElement("div")).text(text).html();
            _id = $(document.createElement("div")).text(id).html();
            $a = $("<a />");
            $a.addClass("ikagaka-choice");
            text_css = _this._blimpTextCSS(_this._current_text_style);
            choice_css = _this._blimpClickableTextCSS(_this._current_choice_style);
            choice_notselect_css = _this._blimpClickableTextCSS(_this._current_choice_notselect_style, _this._current_text_style);
            $a.css(text_css).css(choice_notselect_css.base).css(choice_notselect_css.over);
            $a.mouseover(function() {
              return $a.css(choice_css.base).css(choice_css.over);
            });
            $a.mouseout(function() {
              return $a.css(text_css).css(choice_notselect_css.base).css(choice_notselect_css.over);
            });
            $a.html(_text);
            $a.attr("data-id", _id);
            $a.attr("data-argc", args.length);
            for (index = _i = 0, _len = args.length; _i < _len; index = ++_i) {
              argv = args[index];
              $a.attr("data-argv" + index, argv);
            }
            $a.appendTo(_this.insertPoint);
          };
        })(this),
        choiceBegin: (function(_this) {
          return function() {
            var $a, args, argv, choice_css, choice_notselect_css, id, index, text_css, _i, _id, _len;
            id = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
            _this.$blimpText.find(".blink").hide();
            _this.$blimp.show();
            _id = $(document.createElement("div")).text(id).html();
            $a = $("<a />");
            $a.addClass("ikagaka-choice");
            text_css = _this._blimpTextCSS(_this._current_text_style);
            choice_css = _this._blimpClickableTextCSS(_this._current_choice_style);
            choice_notselect_css = _this._blimpClickableTextCSS(_this._current_choice_notselect_style, _this._current_text_style);
            $a.css(text_css).css(choice_notselect_css.base).css(choice_notselect_css.over);
            $a.mouseover(function() {
              return $a.css(choice_css.base).css(choice_css.over);
            });
            $a.mouseout(function() {
              return $a.css(text_css).css(choice_notselect_css.base).css(choice_notselect_css.over);
            });
            $a.attr("data-id", _id);
            $a.attr("data-argc", args.length);
            for (index = _i = 0, _len = args.length; _i < _len; index = ++_i) {
              argv = args[index];
              $a.attr("data-argv" + index, argv);
            }
            _this.originalInsertPoint = _this.insertPoint;
            _this.insertPoint = $a.appendTo(_this.insertPoint);
          };
        })(this),
        choiceEnd: (function(_this) {
          return function() {
            _this.insertPoint = _this.originalInsertPoint;
          };
        })(this),
        talk: (function(_this) {
          return function(text) {
            var _text;
            _this.$blimpText.find(".blink").hide();
            _text = $(document.createElement("div")).text(text).html();
            if (!!_this.currentSurface) {
              _this.currentSurface.talk();
            }
            _this.$blimp.show();
            _this.insertPoint.append(_text);
            _this.$blimpText[0].scrollTop = 999;
          };
        })(this),
        marker: (function(_this) {
          return function() {
            var _text;
            _this.$blimpText.find(".blink").hide();
            _text = $(document.createElement("div")).text("・").html();
            _this.$blimp.show();
            _this.insertPoint.append(_text);
            _this.$blimpText[0].scrollTop = 999;
          };
        })(this),
        clear: (function(_this) {
          return function() {
            _this.$blimpText.html("");
            _this.insertPoint = _this.$blimpText;
            _this._initializeCurrentStyle();
          };
        })(this),
        br: (function(_this) {
          return function(ratio) {
            if (ratio != null) {
              location('0', '@' + ratio + 'em');
            } else {
              _this.insertPoint.append("<br />");
            }
          };
        })(this),
        showWait: (function(_this) {
          return function() {
            _this.$blimpText.append("<br /><br />").append("<div class='blink'>▼</div>");
            _this.$blimpText[0].scrollTop = 999;
          };
        })(this),
        font: (function(_this) {
          return function() {
            var $newimp, $size_checker, is_text_style, name, size, treat_bool, treat_clickable_styles, value, values;
            name = arguments[0], values = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
            value = values[0];
            treat_bool = function(name, value) {
              if (value === 'default') {
                return _this._current_text_style["font." + name] = _this._text_style["font." + name];
              } else {
                return _this._current_text_style["font." + name] = !((value === 'false') || ((value - 0) === 0));
              }
            };
            treat_clickable_styles = function(treat_name, name, value, values, _current_style, _style) {
              switch (name) {
                case "" + treat_name + "style":
                  if (value === 'default') {
                    return _current_style["style"] = _style["style"];
                  } else {
                    return _current_style["style"] = value;
                  }
                  break;
                case "" + treat_name + "fontcolor":
                  if (value === 'default') {
                    return _current_style["font.color"] = _style["font.color"];
                  } else if ((values[0] != null) && (values[1] != null) && (values[2] != null)) {
                    return _current_style["font.color"] = _this._getFontColor(values[0], values[1], values[2]);
                  } else {
                    return _current_style["font.color"] = value;
                  }
                  break;
                case "" + treat_name + "pencolor":
                  if (value === 'default') {
                    return _current_style["pen.color"] = _style["pen.color"];
                  } else if ((values[0] != null) && (values[1] != null) && (values[2] != null)) {
                    return _current_style["pen.color"] = _this._getpenColor(values[0], values[1], values[2]);
                  } else {
                    return _current_style["pen.color"] = value;
                  }
                  break;
                case "" + treat_name + "color":
                case "" + treat_name + "brushcolor":
                  if (value === 'default') {
                    return _current_style["brush.color"] = _style["brush.color"];
                  } else if ((values[0] != null) && (values[1] != null) && (values[2] != null)) {
                    return _current_style["brush.color"] = _this._getFontColor(values[0], values[1], values[2]);
                  } else {
                    return _current_style["brush.color"] = value;
                  }
              }
            };
            switch (name) {
              case 'name':
                is_text_style = true;
                _this._current_text_style["font.name"] = values.map(function(name) {
                  return '"' + name + '"';
                }).join(',');
                break;
              case 'height':
                is_text_style = true;
                if (value === 'default') {
                  _this._current_text_style["font.height"] = _this._text_style["font.height"];
                } else if (/^[+-]/.test(value)) {
                  $size_checker = $('<span />').text('I').css({
                    position: 'absolute',
                    visibility: 'hidden',
                    'width': '1em',
                    'font-size': '1em',
                    padding: 0,
                    'line-height': '1em'
                  });
                  _this.insertPoint.append($size_checker);
                  size = $size_checker[0].clientHeight;
                  $size_checker.remove();
                  _this._current_text_style["font.height"] = (Number(size) + Number(value)) + 'px';
                } else if (!isNaN(value)) {
                  _this._current_text_style["font.height"] = value + 'px';
                } else {
                  _this._current_text_style["font.height"] = value;
                }
                break;
              case 'color':
                is_text_style = true;
                if (value === 'default') {
                  _this._current_text_style["font.color"] = _this._text_style["font.color"];
                } else if ((values[0] != null) && (values[1] != null) && (values[2] != null)) {
                  _this._current_text_style["font.color"] = _this._getFontColor(values[0], values[1], values[2]);
                } else {
                  _this._current_text_style["font.color"] = value;
                }
                break;
              case 'shadowcolor':
                is_text_style = true;
                if (value === 'default') {
                  _this._current_text_style["font.shadowcolor"] = _this._text_style["font.shadowcolor"];
                } else if (value === 'none') {
                  _this._current_text_style["font.shadowcolor"] = void 0;
                } else if ((values[0] != null) && (values[1] != null) && (values[2] != null)) {
                  _this._current_text_style["font.shadowcolor"] = _this._getFontColor(values[0], values[1], values[2]);
                } else {
                  _this._current_text_style["font.shadowcolor"] = value;
                }
                break;
              case 'bold':
                is_text_style = true;
                treat_bool('bold', value);
                break;
              case 'italic':
                is_text_style = true;
                treat_bool('italic', value);
                break;
              case 'strike':
                is_text_style = true;
                treat_bool('strike', value);
                break;
              case 'underline':
                is_text_style = true;
                treat_bool('underline', value);
                break;
              case 'default':
                is_text_style = true;
                _this._initializeCurrentStyle();
                break;
              case 'cursorstyle':
              case 'cursorfontcolor':
              case 'cursorpencolor':
              case 'cursorcolor':
              case 'cursorbrushcolor':
                treat_clickable_styles('cursor', name, value, values, _this._current_choice_style, _this._choice_style);
                break;
              case 'anchorstyle':
              case 'anchorfontcolor':
              case 'anchorpencolor':
              case 'anchorcolor':
              case 'anchorbrushcolor':
                treat_clickable_styles('anchor', name, value, values, _this._current_anchor_style, _this._anchor_style);
                break;
              case 'cursornotselectstyle':
              case 'cursornotselectfontcolor':
              case 'cursornotselectpencolor':
              case 'cursornotselectcolor':
              case 'cursornotselectbrushcolor':
                treat_clickable_styles('cursornotselect', name, value, values, _this._current_choice_notselect_style, _this._choice_notselect_style);
                break;
              case 'anchornotselectstyle':
              case 'anchornotselectfontcolor':
              case 'anchornotselectpencolor':
              case 'anchornotselectcolor':
              case 'anchornotselectbrushcolor':
                treat_clickable_styles('anchornotselect', name, value, values, _this._current_anchor_notselect_style, _this._anchor_notselect_style);
            }
            if (is_text_style) {
              $newimp = $('<span />');
              _this.insertPoint = $newimp.appendTo(_this.insertPoint);
              return _this.insertPoint.css(_this._blimpTextCSS(_this._current_text_style));
            }
          };
        })(this),
        location: location
      };
    };

    Scope.prototype._blimpTextCSS = function(styles) {
      var css, text_decoration;
      css = {};
      css["cursor"] = styles["cursor"];
      css["font-family"] = styles["font.name"];
      css["font-size"] = styles["font.height"];
      css["color"] = styles["font.color"];
      css["background"] = "none";
      css["outline"] = "none";
      css["border"] = "none";
      css["text-shadow"] = styles["font.shadowcolor"] ? "1px 1px 0 " + styles["font.shadowcolor"] : "none";
      css["font-weight"] = styles["font.bold"] ? "bold" : "normal";
      css["font-style"] = styles["font.italic"] ? "italic" : "normal";
      text_decoration = [];
      if (styles["font.strike"]) {
        text_decoration.push('line-through');
      }
      if (styles["font.underline"]) {
        text_decoration.push('underline');
      }
      css["text-decoration"] = text_decoration.length ? text_decoration.join(' ') : "none";
      css["line-height"] = "1.2em";
      return css;
    };

    Scope.prototype._blimpClickableTextCSS = function(styles, default_styles) {
      var background, border_bottom, color, outline;
      if (default_styles == null) {
        default_styles = {};
      }
      color = styles["font.color"] || default_styles["font.color"];
      outline = styles["pen.color"] ? "solid 1px " + styles["pen.color"] : default_styles["pen.color"] ? "solid 1px " + default_styles["pen.color"] : "solid 1px " + default_styles["font.color"];
      background = styles["brush.color"] || default_styles["brush.color"] || default_styles["font.color"];
      border_bottom = styles["pen.color"] ? "solid 1px " + styles["pen.color"] : default_styles["pen.color"] ? "solid 1px " + default_styles["pen.color"] : "solid 1px " + default_styles["font.color"];
      switch (styles["style"]) {
        case "square":
          return {
            base: {
              color: color
            },
            over: {
              outline: outline,
              background: background,
              "border-bottom": "none"
            }
          };
        case "underline":
          return {
            base: {
              color: color
            },
            over: {
              outline: "none",
              background: "none",
              'border-bottom': border_bottom
            }
          };
        case "square+underline":
          return {
            base: {
              color: color
            },
            over: {
              outline: outline,
              background: background,
              'border-bottom': border_bottom
            }
          };
        case "none":
          return {
            base: {
              color: color
            },
            over: {
              outline: "none",
              background: "none",
              "border-bottom": "none"
            }
          };
        default:
          return {
            base: {},
            over: {}
          };
      }
    };

    Scope.prototype._initializeCurrentStyle = function() {
      var name, value, _ref, _ref1, _ref2, _ref3, _ref4, _results;
      this._current_text_style = {};
      _ref = this._text_style;
      for (name in _ref) {
        value = _ref[name];
        this._current_text_style[name] = value;
      }
      this._current_choice_style = {};
      _ref1 = this._choice_style;
      for (name in _ref1) {
        value = _ref1[name];
        this._current_choice_style[name] = value;
      }
      this._current_choice_notselect_style = {};
      _ref2 = this._choice_notselect_style;
      for (name in _ref2) {
        value = _ref2[name];
        this._current_choice_notselect_style[name] = value;
      }
      this._current_anchor_style = {};
      _ref3 = this._anchor_style;
      for (name in _ref3) {
        value = _ref3[name];
        this._current_anchor_style[name] = value;
      }
      this._current_anchor_notselect_style = {};
      _ref4 = this._anchor_notselect_style;
      _results = [];
      for (name in _ref4) {
        value = _ref4[name];
        _results.push(this._current_anchor_notselect_style[name] = value);
      }
      return _results;
    };

    Scope.prototype._getFontColor = function(r, g, b, can_ignore) {
      var bc, gc, rc;
      rc = r != null ? r.replace(/%$/, '') : void 0;
      gc = g != null ? g.replace(/%$/, '') : void 0;
      bc = b != null ? b.replace(/%$/, '') : void 0;
      if ((isNaN(rc) || rc < 0) && (isNaN(gc) || gc < 0) && (isNaN(bc) || bc < 0)) {
        if (can_ignore) {

        } else {
          return "rgb(0,0,0)";
        }
      } else {
        return "rgb(" + r + "," + g + "," + b + ")";
      }
    };

    return Scope;

  })();

  if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
    module.exports = Scope;
  } else if (this.Ikagaka != null) {
    this.Ikagaka.Scope = Scope;
  } else {
    this.Scope = Scope;
  }

}).call(this);
