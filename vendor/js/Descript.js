(function() {
  var __slice = [].slice;

  this.Descript = (function() {
    var regComment, regexec;

    regComment = /(?:(?:^|\s)\/\/.*)|^\s+?$/g;

    function Descript(text) {
      var key, line, lines, val, vals, _i, _len, _ref;
      text = text.replace(/(?:\r\n|\r|\n)/g, "\n");
      regexec(regComment, text, function(_arg) {
        var match, __;
        match = _arg[0], __ = 2 <= _arg.length ? __slice.call(_arg, 1) : [];
        return text = text.replace(match, "");
      });
      lines = text.split("\n");
      lines = lines.filter(function(val) {
        return val.length !== 0;
      });
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        _ref = line.split(","), key = _ref[0], vals = 2 <= _ref.length ? __slice.call(_ref, 1) : [];
        key = key.replace(/^\s+/, "").replace(/\s+$/, "");
        val = vals.join(",").replace(/^\s+/, "").replace(/\s+$/, "");
        if (isFinite(Number(val))) {
          this[key] = Number(val);
        } else {
          this[key] = val;
        }
      }
    }

    regexec = function(reg, str, fn) {
      var ary, matches;
      ary = [];
      while (true) {
        matches = reg.exec(str);
        if (!(matches != null)) {
          break;
        }
        ary.push(fn(matches));
      }
      return ary;
    };

    return Descript;

  })();

}).call(this);
