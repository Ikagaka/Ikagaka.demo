var loadHandler;

$(function() {
  return $("#nar").change(function(ev) {
    var nar;
    nar = new Nar();
    return nar.loadFromBlob(ev.target.files[0], loadHandler.bind(this, nar));
  });
});

loadHandler = function(ghost_nar, err) {
  if (err != null) {
    return console.error(err.stack);
  }
  return Promise.all([
    new Promise(function(resolve, reject) {
      var ghost;
      ghost = new Ghost(ghost_nar.getDirectory(/ghost\/master\//));
      ghost.path = "./vendor/js/";
      ghost.logging = true;
      return ghost.load(function(err) {
        if (err != null) {
          return reject(err);
        } else {
          return resolve(ghost);
        }
      });
    }), new Promise(function(resolve, reject) {
      var shell;
      shell = new Shell(ghost_nar.getDirectory(/shell\/master\//));
      return shell.load(function(err) {
        if (err != null) {
          return reject(err);
        } else {
          return resolve(shell);
        }
      });
    }), new Promise(function(resolve, reject) {
      var balloon_nar;
      balloon_nar = new Nar();
      return balloon_nar.loadFromURL("./vendor/nar/origin.nar", function(err) {
        var balloon;
        if (err != null) {
          reject(err);
        }
        balloon = new Balloon(balloon_nar.directory);
        return balloon.load(function(err) {
          if (err != null) {
            return reject(err);
          } else {
            return resolve(balloon);
          }
        });
      });
    })
  ]).then(function(_arg) {
    var balloon, ghost, method, named, requestSender, responseHandler, shell, ssp, version;
    ghost = _arg[0], shell = _arg[1], balloon = _arg[2];
    named = new Named(shell, balloon);
    ssp = new SakuraScriptPlayer(named);
    version = '2.6';
    method = 'GET Version';
    responseHandler = function(err, response) {
      var parsed, parser, ss;
      if (err != null) {
        return console.error(err.stack);
      }
      console.log(response);
      parser = new ShioriJK.Shiori.Response.Parser();
      parsed = parser.parse(response);
      if (parsed.status_line.code === 200) {
        ss = null;
        if (version === '3.0' && typeof parsed.headers.header.Value === "string") {
          ss = parsed.headers.header.Value;
        } else if (version !== '3.0' && typeof parsed.headers.header.Sentence === "string") {
          ss = parsed.headers.header.Sentence;
        }
        if (ss !== null) {
          console.log(ss);
          ssp.play("\\1\\0" + ss);
        }
      }
      return parsed;
    };
    requestSender = function(headers, callback) {
      var request;
      request = new ShioriJK.Message.Request();
      request.request_line.method = method;
      request.request_line.protocol = "SHIORI";
      request.request_line.version = version;
      request.headers.header["Sender"] = "SSP";
      request.headers.header["Charset"] = "Shift_JIS";
      if (version !== '3.0' && headers["ID"]) {
        headers["Event"] = headers["ID"];
        delete headers["ID"];
      }
      Object.keys(headers).forEach(function(key) {
        return request.headers.header[key] = "" + headers[key];
      });
      console.log("" + request);
      try {
        return ghost.request("" + request, callback ? callback : responseHandler);
      } catch (_error) {
        err = _error;
        return console.error(err, err.stack);
      }
    };
    $(named.element).on("IkagakaSurfaceEvent", function(ev) {
      return requestSender(ev.detail);
    }).appendTo("body");
    return requestSender({}, function(err, response) {
      var parsed;
      parsed = responseHandler(err, response);
      if (parsed.status_line.code === 200 && parsed.status_line.version !== '3.0') {
        method = 'GET Sentence';
      } else {
        version = '3.0';
        method = 'GET';
      }
      requestSender({
        ID: "OnBoot",
        Sender: "SSP",
        Charset: "Shift_JIS",
        Reference0: "0"
      });
      setInterval(function() {
        return requestSender({
          ID: "OnSecondChange",
          Sender: "SSP",
          Charset: "Shift_JIS",
          Reference0: "0",
          Reference1: "0",
          Reference2: "0",
          Reference3: "1"
        });
      }, 1000);
      return setInterval(function() {
        return requestSender({
          ID: "OnMinuteChange",
          Sender: "SSP",
          Charset: "Shift_JIS",
          Reference0: "0",
          Reference1: "0",
          Reference2: "0",
          Reference3: "1"
        });
      }, 60000);
    });
  })["catch"](function(err) {
    console.error(err, err.stack);
    return alert(err);
  });
};
