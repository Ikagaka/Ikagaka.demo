
/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 */
var ShioriJK,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ShioriJK = {};

if ((typeof module !== "undefined" && module !== null) && (module.exports != null)) {
  module.exports = ShioriJK;
}

Function.prototype.property = function(properties) {
  var descriptions, property, results1;
  results1 = [];
  for (property in properties) {
    descriptions = properties[property];
    results1.push(Object.defineProperty(this.prototype, property, descriptions));
  }
  return results1;
};

ShioriJK.Message = {};

ShioriJK.Message.Request = (function() {
  function Request(options) {
    if (!((options != null) && options.no_prepare)) {
      this.request_line = new ShioriJK.RequestLine();
      this.headers = new ShioriJK.Headers.Request();
    }
  }

  Request.prototype.request_line = null;

  Request.prototype.headers = null;

  Request.prototype.toString = function() {
    return this.request_line.toString() + '\r\n' + this.headers.toString() + '\r\n';
  };

  return Request;

})();

ShioriJK.Message.Response = (function() {
  function Response(options) {
    if (!((options != null) && options.no_prepare)) {
      this.status_line = new ShioriJK.StatusLine();
      this.headers = new ShioriJK.Headers.Response();
    }
  }

  Response.prototype.status_line = null;

  Response.prototype.headers = null;

  Response.prototype.toString = function() {
    return this.status_line.toString() + '\r\n' + this.headers.toString() + '\r\n';
  };

  return Response;

})();

ShioriJK.RequestLine = (function() {
  function RequestLine() {
    this["arguments"] = {};
  }

  RequestLine.prototype.method = null;

  RequestLine.prototype.protocol = null;

  RequestLine.prototype.version = null;

  RequestLine.property({
    method: {
      get: function() {
        return this["arguments"].method;
      },
      set: function(method) {
        if ((method != null) && (this.version != null)) {
          this.validate_method_version(method, this.version);
        } else if (method != null) {
          switch (method) {
            case 'GET':
            case 'NOTIFY':
            case 'GET Version':
            case 'GET Sentence':
            case 'GET Word':
            case 'GET Status':
            case 'TEACH':
            case 'GET String':
            case 'NOTIFY OwnerGhostName':
            case 'NOTIFY OtherGhostName':
            case 'TRANSLATE Sentence':
              break;
            default:
              throw 'Invalid protocol method : ' + method;
          }
        }
        return this["arguments"].method = method;
      }
    },
    protocol: {
      get: function() {
        return this["arguments"].protocol;
      },
      set: function(protocol) {
        if ((protocol != null) && protocol !== 'SHIORI') {
          throw 'Invalid protocol : ' + protocol;
        }
        return this["arguments"].protocol = protocol;
      }
    },
    version: {
      get: function() {
        return this["arguments"].version;
      },
      set: function(version) {
        if ((this.method != null) && (version != null)) {
          this.validate_method_version(this.method, version);
        } else if (version != null) {
          switch (version) {
            case '2.0':
            case '2.2':
            case '2.3':
            case '2.4':
            case '2.5':
            case '2.6':
            case '3.0':
              break;
            default:
              throw 'Invalid protocol version : ' + version;
          }
        }
        return this["arguments"].version = version;
      }
    }
  });

  RequestLine.prototype.validate_method_version = function(method, version) {
    var is_valid;
    is_valid = false;
    switch (version) {
      case '2.0':
        switch (method) {
          case 'GET Version':
          case 'NOTIFY OwnerGhostName':
          case 'GET Sentence':
          case 'GET Word':
          case 'GET Status':
            is_valid = true;
        }
        break;
      case '2.2':
        switch (method) {
          case 'GET Sentence':
            is_valid = true;
        }
        break;
      case '2.3':
        switch (method) {
          case 'NOTIFY OtherGhostName':
          case 'GET Sentence':
            is_valid = true;
        }
        break;
      case '2.4':
        switch (method) {
          case 'TEACH':
            is_valid = true;
        }
        break;
      case '2.5':
        switch (method) {
          case 'GET String':
            is_valid = true;
        }
        break;
      case '2.6':
        switch (method) {
          case 'GET Sentence':
          case 'GET Status':
          case 'GET String':
          case 'NOTIFY OwnerGhostName':
          case 'NOTIFY OtherGhostName':
          case 'GET Version':
          case 'TRANSLATE Sentence':
            is_valid = true;
        }
        break;
      case '3.0':
        switch (method) {
          case 'GET':
          case 'NOTIFY':
            is_valid = true;
        }
    }
    if (!is_valid) {
      throw 'Invalid protocol method and version : ' + method + ' SHIORI/' + version;
    }
  };

  RequestLine.prototype.toString = function() {
    return this.method + " " + this.protocol + "/" + this.version;
  };

  return RequestLine;

})();

ShioriJK.StatusLine = (function() {
  function StatusLine() {
    this["arguments"] = {
      protocol: 'SHIORI'
    };
  }

  StatusLine.prototype.code = null;

  StatusLine.prototype.protocol = null;

  StatusLine.prototype.version = null;

  StatusLine.property({
    code: {
      get: function() {
        return this["arguments"].code;
      },
      set: function(code) {
        if ((code != null) && (this.message[code] == null)) {
          throw 'Invalid response code : ' + code;
        }
        return this["arguments"].code = code;
      }
    },
    protocol: {
      get: function() {
        return this["arguments"].protocol;
      },
      set: function(protocol) {
        if ((protocol != null) && protocol !== 'SHIORI') {
          throw 'Invalid protocol : ' + protocol;
        }
        return this["arguments"].protocol = protocol;
      }
    },
    version: {
      get: function() {
        return this["arguments"].version;
      },
      set: function(version) {
        if (version != null) {
          switch (version) {
            case '2.0':
            case '2.2':
            case '2.3':
            case '2.4':
            case '2.5':
            case '2.6':
            case '3.0':
              break;
            default:
              throw 'Invalid protocol version : ' + version;
          }
        }
        return this["arguments"].version = version;
      }
    }
  });

  StatusLine.prototype.toString = function() {
    return this.protocol + "/" + this.version + " " + this.code + " " + this.message[this.code];
  };

  StatusLine.prototype.message = {
    200: 'OK',
    204: 'No Content',
    310: 'Communicate',
    311: 'Not Enough',
    312: 'Advice',
    400: 'Bad Request',
    418: "I'm a tea pot",
    500: 'Internal Server Error'
  };

  return StatusLine;

})();

ShioriJK.Headers = (function() {
  function Headers() {
    this.header = {};
  }

  Headers.prototype.header = null;

  Headers.prototype.get = function(name) {
    if (this.header[name] != null) {
      return this.header[name];
    }
  };

  Headers.prototype.set = function(name, value) {
    return this.header[name] = value;
  };

  Headers.prototype.get_separated = function(name, separator) {
    if (separator == null) {
      separator = '\x01';
    }
    if (this.header[name] != null) {
      return this.header[name].split(separator);
    }
  };

  Headers.prototype.set_separated = function(name, value, separator) {
    if (separator == null) {
      separator = '\x01';
    }
    return this.header[name] = value.join(separator);
  };

  Headers.prototype.get_separated2 = function(name, separator1, separator2) {
    var element, i, len, ref, results1;
    if (separator1 == null) {
      separator1 = '\x02';
    }
    if (separator2 == null) {
      separator2 = '\x01';
    }
    if (this.header[name] != null) {
      ref = this.header[name].split(separator1);
      results1 = [];
      for (i = 0, len = ref.length; i < len; i++) {
        element = ref[i];
        results1.push(element.split(separator2));
      }
      return results1;
    }
  };

  Headers.prototype.set_separated2 = function(name, value, separator1, separator2) {
    var element;
    if (separator1 == null) {
      separator1 = '\x02';
    }
    if (separator2 == null) {
      separator2 = '\x01';
    }
    return this.header[name] = ((function() {
      var i, len, results1;
      results1 = [];
      for (i = 0, len = value.length; i < len; i++) {
        element = value[i];
        results1.push(element.join(separator2));
      }
      return results1;
    })()).join(separator1);
  };

  Headers.prototype.validate = function() {
    var name, ref, results1, value;
    ref = this.header;
    results1 = [];
    for (name in ref) {
      value = ref[name];
      if (value.match(/\n/)) {
        throw 'Invalid header value - line feed found : [' + name + '] : ' + value;
      } else {
        results1.push(void 0);
      }
    }
    return results1;
  };

  Headers.prototype.toString = function() {
    var name, ref, str, value;
    str = '';
    this.validate();
    ref = this.header;
    for (name in ref) {
      value = ref[name];
      str += name + ": " + value + "\r\n";
    }
    return str;
  };

  return Headers;

})();

ShioriJK.Headers.Request = (function(superClass) {
  extend(Request, superClass);

  function Request() {
    return Request.__super__.constructor.apply(this, arguments);
  }

  return Request;

})(ShioriJK.Headers);

ShioriJK.Headers.Response = (function(superClass) {
  extend(Response, superClass);

  function Response() {
    return Response.__super__.constructor.apply(this, arguments);
  }

  return Response;

})(ShioriJK.Headers);

ShioriJK.Shiori = {};

ShioriJK.Shiori.Header = {};

ShioriJK.Shiori.Request = {};

ShioriJK.Shiori.Request.RequestLine = {};

ShioriJK.Shiori.Request.Header = {};

ShioriJK.Shiori.Response = {};

ShioriJK.Shiori.Response.StatusLine = {};

ShioriJK.Shiori.Response.Header = {};

ShioriJK.Shiori.Parser = (function() {
  function Parser() {}

  Parser.prototype.is_parsing = function() {
    return !this.section.is('idle');
  };

  Parser.prototype.is_parsing_end = function() {
    return !this.section.is('end');
  };

  Parser.prototype.get_result = function() {
    return this.result;
  };

  Parser.prototype.result_builder = function() {};

  Parser.prototype.begin_parse = function() {
    if (!this.section.is('idle')) {
      throw 'cannot begin parsing because previous transaction is still working';
    }
    this.result = this.result_builder();
    return this.section.next();
  };

  Parser.prototype.end_parse = function() {
    if (!this.section.is('end')) {
      this.abort_parse();
      throw 'parsing was aborted';
    }
    return this.section.next();
  };

  Parser.prototype.abort_parse = function() {
    var name, parser, ref;
    if (this.parsers != null) {
      ref = this.parsers;
      for (name in ref) {
        parser = ref[name];
        if (parser.abort_parse != null) {
          parser.abort_parse();
        }
      }
    }
    return this.section.set('idle');
  };

  Parser.prototype.parse = function(transaction) {
    var result;
    this.begin_parse();
    result = this.parse_chunk(transaction);
    if (this.is_parsing()) {
      throw 'transaction is not closed';
    }
    if (result.results.length !== 1) {
      throw 'multiple transaction';
    }
    return result.results[0];
  };

  Parser.prototype.parse_chunk = function(chunk) {
    var lines;
    lines = chunk.split(/\r\n/);
    if (chunk.match(/\r\n$/)) {
      lines.pop();
    }
    return this.parse_lines(lines);
  };

  Parser.prototype.parse_lines = function(lines) {
    var i, len, line, result, results;
    results = [];
    for (i = 0, len = lines.length; i < len; i++) {
      line = lines[i];
      result = this.parse_line(line);
      if (result.state === 'end') {
        results.push(result.result);
      }
    }
    return {
      results: results,
      state: result.state
    };
  };

  Parser.prototype.parse_line = function(line) {
    if (this.section.is('idle')) {
      this.begin_parse();
    }
    this.parse_main(line);
    if (this.section.is('end')) {
      this.end_parse();
      return {
        result: this.get_result(),
        state: 'end'
      };
    } else {
      return {
        state: 'continue'
      };
    }
  };

  Parser.prototype.parse_main = function(line) {};

  return Parser;

})();

ShioriJK.Shiori.Section = (function() {
  function Section(sections) {
    this.sections = sections;
    this.index = 0;
  }

  Section.prototype.is = function(section) {
    return this.sections[this.index] === section;
  };

  Section.prototype.next = function() {
    if (this.index === this.sections.length - 1) {
      return this.index = 0;
    } else {
      return this.index++;
    }
  };

  Section.prototype.previous = function() {
    if (this.index === 0) {
      return this.index = this.sections.length - 1;
    } else {
      return this.index--;
    }
  };

  Section.prototype.set = function(section) {
    return this.index = this.sections.indexOf(section);
  };

  Section.prototype.get = function() {
    return this.sections[this.index];
  };

  return Section;

})();

ShioriJK.Shiori.Header.Parser = (function(superClass) {
  extend(Parser, superClass);

  function Parser() {
    return Parser.__super__.constructor.apply(this, arguments);
  }

  Parser.prototype.parse_main = function(line) {
    var result;
    result = this.parse_header(line);
    if (result.state === 'end') {
      return this.section.next();
    }
  };

  Parser.prototype.parse_header = function(line) {
    var result;
    if (line.length) {
      if (result = line.match(/^(.+?): (.*)$/)) {
        this.result.header[result[1]] = result[2];
      } else {
        throw 'Invalid header line : ' + line;
      }
      return {
        state: 'continue'
      };
    } else {
      return {
        state: 'end'
      };
    }
  };

  return Parser;

})(ShioriJK.Shiori.Parser);

ShioriJK.Shiori.Header.Section = (function(superClass) {
  extend(Section, superClass);

  function Section(sections) {
    this.sections = sections != null ? sections : ['idle', 'header', 'end'];
    this.index = 0;
  }

  return Section;

})(ShioriJK.Shiori.Section);

ShioriJK.Shiori.Request.Parser = (function(superClass) {
  extend(Parser, superClass);

  function Parser() {
    this.parsers = {
      request_line: new ShioriJK.Shiori.Request.RequestLine.Parser(),
      headers: new ShioriJK.Shiori.Request.Header.Parser()
    };
    this.section = new ShioriJK.Shiori.Request.Section();
  }

  Parser.prototype.result_builder = function() {
    return new ShioriJK.Message.Request({
      no_prepare: true
    });
  };

  Parser.prototype.parse_main = function(line) {
    var parser, parser_result;
    parser = this.parsers[this.section.get()];
    parser_result = parser.parse_line(line);
    if (parser_result.state === 'end') {
      this.result[this.section.get()] = parser_result.result;
      return this.section.next();
    }
  };

  return Parser;

})(ShioriJK.Shiori.Parser);

ShioriJK.Shiori.Request.RequestLine.Parser = (function() {
  function Parser() {}

  Parser.prototype.result_builder = function() {
    return new ShioriJK.RequestLine();
  };

  Parser.prototype.parse = function(transaction) {
    return this.parse_chunk(transaction);
  };

  Parser.prototype.parse_chunk = function(chunk) {
    return this.parse_line(chunk);
  };

  Parser.prototype.parse_line = function(line) {
    var result;
    result = line.match(/^([A-Za-z0-9 ]+) SHIORI\/([0-9.]+)/);
    if (!result) {
      throw 'Invalid request line : ' + line;
    }
    this.result = this.result_builder();
    this.result.method = result[1];
    this.result.protocol = 'SHIORI';
    this.result.version = result[2];
    return {
      result: this.result,
      state: 'end'
    };
  };

  return Parser;

})();

ShioriJK.Shiori.Request.Header.Parser = (function(superClass) {
  extend(Parser, superClass);

  function Parser() {
    this.section = new ShioriJK.Shiori.Request.Header.Section();
  }

  Parser.prototype.result_builder = function() {
    return new ShioriJK.Headers.Request();
  };

  return Parser;

})(ShioriJK.Shiori.Header.Parser);

ShioriJK.Shiori.Request.Section = (function(superClass) {
  extend(Section, superClass);

  function Section(sections) {
    this.sections = sections != null ? sections : ['idle', 'request_line', 'headers', 'end'];
    this.index = 0;
  }

  return Section;

})(ShioriJK.Shiori.Section);

ShioriJK.Shiori.Request.Header.Section = (function(superClass) {
  extend(Section, superClass);

  function Section() {
    return Section.__super__.constructor.apply(this, arguments);
  }

  return Section;

})(ShioriJK.Shiori.Header.Section);

ShioriJK.Shiori.Response.Parser = (function(superClass) {
  extend(Parser, superClass);

  function Parser() {
    this.parsers = {
      status_line: new ShioriJK.Shiori.Response.StatusLine.Parser(),
      headers: new ShioriJK.Shiori.Response.Header.Parser()
    };
    this.section = new ShioriJK.Shiori.Response.Section();
  }

  Parser.prototype.result_builder = function() {
    return new ShioriJK.Message.Response({
      no_prepare: true
    });
  };

  Parser.prototype.parse_main = function(line) {
    var parser, parser_result;
    parser = this.parsers[this.section.get()];
    parser_result = parser.parse_line(line);
    if (parser_result.state === 'end') {
      this.result[this.section.get()] = parser_result.result;
      return this.section.next();
    }
  };

  return Parser;

})(ShioriJK.Shiori.Parser);

ShioriJK.Shiori.Response.StatusLine.Parser = (function() {
  function Parser() {}

  Parser.prototype.result_builder = function() {
    return new ShioriJK.StatusLine();
  };

  Parser.prototype.parse = function(transaction) {
    return this.parse_chunk(transaction);
  };

  Parser.prototype.parse_chunk = function(chunk) {
    return this.parse_line(chunk);
  };

  Parser.prototype.parse_line = function(line) {
    var result;
    result = line.match(/^SHIORI\/([0-9.]+) (\d+) (.+)$/);
    if (!result) {
      throw 'Invalid status line : ' + line;
    }
    this.result = this.result_builder();
    this.result.protocol = 'SHIORI';
    this.result.version = result[1];
    this.result.code = result[2] - 0;
    return {
      result: this.result,
      state: 'end'
    };
  };

  return Parser;

})();

ShioriJK.Shiori.Response.Header.Parser = (function(superClass) {
  extend(Parser, superClass);

  function Parser() {
    this.section = new ShioriJK.Shiori.Response.Header.Section();
  }

  Parser.prototype.result_builder = function() {
    return new ShioriJK.Headers.Response();
  };

  return Parser;

})(ShioriJK.Shiori.Header.Parser);

ShioriJK.Shiori.Response.Section = (function(superClass) {
  extend(Section, superClass);

  function Section(sections) {
    this.sections = sections != null ? sections : ['idle', 'status_line', 'headers', 'end'];
    this.index = 0;
  }

  return Section;

})(ShioriJK.Shiori.Section);

ShioriJK.Shiori.Response.Header.Section = (function(superClass) {
  extend(Section, superClass);

  function Section() {
    return Section.__super__.constructor.apply(this, arguments);
  }

  return Section;

})(ShioriJK.Shiori.Header.Section);

//# sourceMappingURL=shiorijk.js.map
