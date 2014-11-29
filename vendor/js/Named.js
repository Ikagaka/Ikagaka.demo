// Generated by CoffeeScript 1.7.1
(function() {
  var $, Named, Scope, prompt, _ref;

  $ = window["Zepto"];

  Scope = window["Scope"] || ((_ref = window["Ikagaka"]) != null ? _ref["Scope"] : void 0) || require("./Scope.js");

  prompt = window["prompt"];

  Named = (function() {
    function Named(shell, balloon) {
      this.shell = shell;
      this.balloon = balloon;
      this.$named = $("<div />").addClass("named");
      this.element = this.$named[0];
      this.scopes = [];
      this.scopes[0] = this.scope(0);
      this.currentScope = this.scopes[0];
      this.destructors = [];
      (function(_this) {
        return (function() {
          var $body, $target, onmousedown, onmousemove, onmouseup, relLeft, relTop;
          $target = null;
          relLeft = relTop = 0;
          onmouseup = function(ev) {
            var _ref1, _ref2;
            if (!!$target) {
              if ($(ev.target).hasClass("blimpText") || $(ev.target).hasClass("blimpCanvas")) {
                if ($target[0] === ((_ref1 = $(ev.target).parent()) != null ? _ref1[0] : void 0)) {
                  return $target = null;
                }
              } else if ($(ev.target).hasClass("surfaceCanvas")) {
                if ($target[0] === ((_ref2 = $(ev.target).parent().parent()) != null ? _ref2[0] : void 0)) {
                  return $target = null;
                }
              }
            }
          };
          onmousedown = function(ev) {
            var $scope, left, offsetX, offsetY, top, _ref1, _ref2, _ref3, _ref4;
            if ($(ev.target).hasClass("blimpText") || $(ev.target).hasClass("blimpCanvas")) {
              if (((_ref1 = $(ev.target).parent().parent().parent()) != null ? _ref1[0] : void 0) === _this.element) {
                $target = $(ev.target).parent();
                $scope = $target.parent();
                _ref2 = $target.offset(), top = _ref2.top, left = _ref2.left;
                offsetY = parseInt($target.css("left"), 10);
                offsetX = parseInt($target.css("top"), 10);
                relLeft = ev.pageX - offsetY;
                relTop = ev.pageY - offsetX;
                return setTimeout((function() {
                  return _this.$named.append($scope);
                }), 100);
              }
            } else if ($(ev.target).hasClass("surfaceCanvas")) {
              if (((_ref3 = $(ev.target).parent().parent().parent()) != null ? _ref3[0] : void 0) === _this.element) {
                $scope = $target = $(ev.target).parent().parent();
                _ref4 = $target.offset(), top = _ref4.top, left = _ref4.left;
                relLeft = ev.pageX - left;
                relTop = ev.pageY - top;
                return setTimeout((function() {
                  return _this.$named.append($scope);
                }), 100);
              }
            }
          };
          onmousemove = function(ev) {
            if (!!$target) {
              return $target.css({
                left: ev.pageX - relLeft,
                top: ev.pageY - relTop
              });
            }
          };
          $body = $("body");
          $body.on("mouseup", onmouseup);
          $body.on("mousedown", onmousedown);
          $body.on("mousemove", onmousemove);
          return _this.destructors.push(function() {
            $body.off("mouseup", onmouseup);
            $body.off("mousedown", onmousedown);
            return $body.off("mousemove", onmousemove);
          });
        });
      })(this)();
      (function(_this) {
        return (function() {
          var onblimpdblclick;
          onblimpdblclick = function(ev) {
            var detail;
            detail = {
              "ID": "OnBalloonDoubleClick"
            };
            return _this.$named.trigger($.Event("IkagakaSurfaceEvent", {
              detail: detail
            }));
          };
          _this.$named.on("dblclick", ".blimp", onblimpdblclick);
          return _this.destructors.push(function() {
            return this.$named.off("dblclick", ".blimp", onblimpdblclick);
          });
        });
      })(this)();
      (function(_this) {
        return (function() {
          var onanchorclick, onchoiceclick;
          onanchorclick = function(ev) {
            var detail;
            detail = {
              "ID": "OnChoiceSelect",
              "Reference0": ev.target.dataset["choiceid"]
            };
            return _this.$named.trigger($.Event("IkagakaSurfaceEvent", {
              detail: detail
            }));
          };
          onchoiceclick = function(ev) {
            var detail;
            detail = {
              "ID": "OnAnchorSelect",
              "Reference0": ev.target.dataset["anchorid"]
            };
            return _this.$named.trigger($.Event("IkagakaSurfaceEvent", {
              detail: detail
            }));
          };
          _this.$named.on("click", ".ikagaka-choice", onanchorclick);
          _this.$named.on("click", ".ikagaka-anchor", onchoiceclick);
          return _this.destructors.push(function() {
            _this.$named.off("click", ".ikagaka-choice", onanchorclick);
            return _this.$named.off("click", ".ikagaka-anchor", onchoiceclick);
          });
        });
      })(this)();
    }

    Named.prototype.destructor = function() {
      this.scopes.forEach(function(scope) {
        return $(scope.element).remove();
      });
      this.destructors.forEach(function(destructor) {
        return destructor();
      });
      this.$named.remove();
    };

    Named.prototype.scope = function(scopeId) {
      if (!isFinite(scopeId)) {
        return this.currentScope;
      }
      if (!this.scopes[scopeId]) {
        this.scopes[scopeId] = new Scope(scopeId, this.shell, this.balloon);
      }
      this.currentScope = this.scopes[scopeId];
      this.$named.append(this.scopes[scopeId].element);
      return this.currentScope;
    };

    Named.prototype.openInputBox = function(id, text) {
      var detail;
      if (text == null) {
        text = "";
      }
      detail = {
        "ID": "OnUserInput",
        "Reference0": id,
        "Reference1": prompt("UserInput", text) || ""
      };
      this.$named.trigger($.Event("IkagakaSurfaceEvent", {
        detail: detail
      }));
    };

    Named.prototype.openCommunicateBox = function(text) {
      var detail;
      if (text == null) {
        text = "";
      }
      detail = {
        "ID": "OnCommunicate",
        "Reference0": "user",
        "Reference1": prompt("Communicate", text) || ""
      };
      this.$named.trigger($.Event("IkagakaSurfaceEvent", {
        detail: detail
      }));
    };

    return Named;

  })();

  if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
    module.exports = Named;
  } else if (this.Ikagaka != null) {
    this.Ikagaka.Named = Named;
  } else {
    this.Named = Named;
  }

}).call(this);
