var ModuleTestXHRProxy = (function(global) {

var CONSOLE_COLOR = {
        RED:    "\u001b[31m",
        YELLOW: "\u001b[33m",
        GREEN:  "\u001b[32m",
        CLEAR:  "\u001b[0m"
    };

var _runOnNode = "process" in global;
var _runOnWorker = "WorkerLocation" in global;
var _runOnBrowser = "document" in global;

var spec = new Spec();
var test = new Test("XHRProxy", {
        disable:    false,
        browser:    true,
        worker:     true,
        node:       true,
        button:     true,
        both:       true,
    });

if (_runOnBrowser) {
    test.add([
        testXHRProxy,
        testXHRProxyResponseTypeArrayBuffer,
        testXHRProxyResponseTypeText,
    ]);

    if (isSupportResponseTypeDocument()) {
        test.add([
            testXHRProxyResponseTypeDocument,
        ]);
    }
    if (isSupportResponseTypeBlob()) {
        test.add([
            testXHRProxyResponseTypeBlob,
            testXHRProxyGetBlob,
        ]);
    }
    if (isSupportResponseTypeJSON()) {
        test.add([
            testXHRProxyResponseTypeJSON,
        ]);
    }
    if (1) {
        test.add([
            testXHRProxyHook,
        ]);
    }

} else if (_runOnNode) {
    test.add([
//        testNodeProxy,
        testNodeProxyEvents,
    ]);
}

return test.run().clone();

function isSupportResponseTypeDocument() {
    if ( spec.isBrowser("Browser") ) {
        if (spec.isOS("Android") ) {
            if (parseFloat(spec.getBrowserVersion()) < 4.4) {
                return false;
            }
        }
    }
    return true;
}

function isSupportResponseTypeBlob() {
    if ( spec.isBrowser("Browser") ) {
        if (spec.isOS("Android") ) {
            if (parseFloat(spec.getBrowserVersion()) < 4.4) {
                return false;
            }
        }
    }
    return true;
}

function isSupportResponseTypeJSON() {
    if ( spec.isBrowser("Safari") ) {
        if (parseInt(spec.getBrowserVersion()) < 8) {
            return false;
        }
    }
    return true;
}

function testXHRProxy(test, pass, miss) {
    var href = _runOnWorker  ? this.href
             : _runOnBrowser ? location.href : "";

    var task = new Task(3, function(err, buffer) {
            if ( !err &&
                 buffer.xhr   === buffer.proxy &&
                 buffer.proxy === buffer.proxy_get ) {
                test.done(pass());
            } else {
                test.done(miss());
            }
        });

    // ----------------------------------------------
    var xhr = new XMLHttpRequest();

    xhr.addEventListener("load", function(event) {
        task.set("xhr", this.responseText);
        task.pass();
    });
    xhr.addEventListener("error", function(error) { task.miss(); });
    xhr.open("GET", href);
    xhr.send();

    // ----------------------------------------------
    var proxy = new XHRProxy();

    proxy.on("load", function(event) {
        task.set("proxy", this.responseText);
        task.pass();
    });
    proxy.on("error", function(error) { task.miss(); });
    proxy.open("GET", href);
    proxy.send();

    // ----------------------------------------------
    XHRProxy.get(href, function(error, responseText, xhr) {
        task.set("proxy_get", responseText);
        task.pass();
    });
}


function testXHRProxyResponseTypeBlob(test, pass, miss) {
    var href = _runOnWorker  ? this.href
             : _runOnBrowser ? location.href : "";

    var task = new Task(2, function(err, buffer) {
            var ok = false;

            //debugger;
            if (!err) {
                if (buffer.xhr instanceof Blob) {
                    if (buffer.proxy instanceof Blob) {
                        ok = true;
                    }
                }
            }

            if (ok) {
                test.done(pass());
            } else {
                test.done(miss());
            }
        });

    // ----------------------------------------------
    var xhr = new XMLHttpRequest();

    xhr.addEventListener("load", function(event) {
        task.set("xhr", this.response);
        task.pass();
    });
    xhr.addEventListener("error", function(error) { task.miss(); });
    xhr.open("GET", href);
    xhr.responseType = "blob";
    xhr.send();

    // ----------------------------------------------
    var proxy = new XHRProxy();

    proxy.on("load", function(event) {
        task.set("proxy", this.response);
        task.pass();
    });
    proxy.on("error", function(error) { task.miss(); });
    proxy.open("GET", href);
    proxy.responseType = "blob";
    proxy.send();
}




function testXHRProxyResponseTypeArrayBuffer(test, pass, miss) {
    var href = _runOnWorker  ? this.href
             : _runOnBrowser ? location.href : "";

    var task = new Task(2, function(err, buffer) {
            var ok = false;

            //debugger;
            if (!err) {
                if (buffer.xhr instanceof ArrayBuffer) {
                    if (buffer.proxy instanceof ArrayBuffer) {
                        ok = true;
                    }
                }
            }

            if (ok) {
                test.done(pass());
            } else {
                test.done(miss());
            }
        });

    // ----------------------------------------------
    var xhr = new XMLHttpRequest();

    xhr.addEventListener("load", function(event) {
        task.set("xhr", this.response);
        task.pass();
    });
    xhr.addEventListener("error", function(error) { task.miss(); });
    xhr.open("GET", href);
    xhr.responseType = "arraybuffer";
    xhr.send();

    // ----------------------------------------------
    var proxy = new XHRProxy();

    proxy.on("load", function(event) {
        task.set("proxy", this.response);
        task.pass();
    });
    proxy.on("error", function(error) { task.miss(); });
    proxy.open("GET", href);
    proxy.responseType = "arraybuffer";
    proxy.send();
}


function testXHRProxyResponseTypeDocument(test, pass, miss) {
    var href = _runOnWorker  ? this.href
             : _runOnBrowser ? location.href : "";

    var task = new Task(2, function(err, buffer) {
            var ok = false;

            //debugger;
            if (!err) {
                if (buffer.xhr instanceof HTMLDocument) {
                    if (buffer.proxy instanceof HTMLDocument) {
                        ok = true;
                    }
                }
            }

            if (ok) {
                test.done(pass());
            } else {
                test.done(miss());
            }
        });

    // ----------------------------------------------
    var xhr = new XMLHttpRequest();

    xhr.addEventListener("load", function(event) {
        task.set("xhr", this.response);
        task.pass();
    });
    xhr.addEventListener("error", function(error) { task.miss(); });
    xhr.open("GET", href);
    xhr.responseType = "document";
    xhr.send();

    // ----------------------------------------------
    var proxy = new XHRProxy();

    proxy.on("load", function(event) {
        task.set("proxy", this.response);
        task.pass();
    });
    proxy.on("error", function(error) { task.miss(); });
    proxy.open("GET", href);
    proxy.responseType = "document";
    proxy.send();
}


function testXHRProxyResponseTypeText(test, pass, miss) {
    var href = _runOnWorker  ? this.href
             : _runOnBrowser ? location.href : "";

    var task = new Task(2, function(err, buffer) {
            var ok = false;

            //debugger;
            if (!err) {
                if (typeof buffer.xhr === "string") {
                    if (typeof buffer.proxy === "string") {
                        ok = true;
                    }
                }
            }

            if (ok) {
                test.done(pass());
            } else {
                test.done(miss());
            }
        });

    // ----------------------------------------------
    var xhr = new XMLHttpRequest();

    xhr.addEventListener("load", function(event) {
        task.set("xhr", this.response);
        task.pass();
    });
    xhr.addEventListener("error", function(error) { task.miss(); });
    xhr.open("GET", href);
    xhr.responseType = "text";
    xhr.send();

    // ----------------------------------------------
    var proxy = new XHRProxy();

    proxy.on("load", function(event) {
        task.set("proxy", this.response);
        task.pass();
    });
    proxy.on("error", function(error) { task.miss(); });
    proxy.open("GET", href);
    proxy.responseType = "text";
    proxy.send();
}


function testXHRProxyResponseTypeJSON(test, pass, miss) {
    var href = "./response.json";

    var task = new Task(2, function(err, buffer) {
            var ok = false;

            //debugger;
            if (!err) {
                if (buffer.xhr instanceof Object) {
                    if (buffer.proxy instanceof Object) {
                        ok = true;
                    }
                }
            }

            if (ok) {
                test.done(pass());
            } else {
                test.done(miss());
            }
        });

    // ----------------------------------------------
    var xhr = new XMLHttpRequest();

    xhr.addEventListener("load", function(event) {
        task.set("xhr", this.response);
        task.pass();
    });
    xhr.addEventListener("error", function(error) { task.miss(); });
    xhr.open("GET", href);
    xhr.responseType = "json";
    xhr.send();

    // ----------------------------------------------
    var proxy = new XHRProxy();

    proxy.on("load", function(event) {
        task.set("proxy", this.response);
        task.pass();
    });
    proxy.on("error", function(error) { task.miss(); });
    proxy.open("GET", href);
    proxy.responseType = "json";
    proxy.send();
}








function testXHRProxyGetBlob(test, pass, miss) {
    var href = _runOnWorker  ? this.href
             : _runOnBrowser ? location.href : "";

    var task = new Task(2, function(err, buffer) {
            var ok = false;

            //debugger;
            if (!err) {
                if (buffer.xhr instanceof Blob) {
                    if (buffer.proxy1 instanceof Blob) {
                        if (buffer.proxy2 instanceof Blob) {
                            ok = true;
                        }
                    }
                }
            }

            if (ok) {
                test.done(pass());
            } else {
                test.done(miss());
            }
        });

    // ----------------------------------------------
    var xhr = new XMLHttpRequest();

    xhr.addEventListener("load", function(event) {
        task.set("xhr", this.response);
        task.pass();
    });
    xhr.addEventListener("error", function(error) { task.miss(); });
    xhr.open("GET", href);
    xhr.responseType = "blob";
    xhr.send();

    // ----------------------------------------------
    XHRProxy.get(href, function(error, response) {
        if (error) {
            task.miss();
        } else {
            task.set("proxy1", response);
            task.set("proxy2", this.response).pass();
        }
    }, { responseType: "blob" });
}








function testNodeProxy(test, pass, miss) {
    var absolute = "http://example.com/";
    var relative = "./test/index.html";
    var localFile = process.cwd() + "/test/index.html";
    var fileScheme = "file://" + process.cwd() + "/test/index.html";

    var task = new Task(4, function(err, buffer) {
            if ( buffer.absolute &&
                 buffer.relative &&
                 buffer.localFile &&
                 buffer.fileScheme ) {

                test.done(pass());
            } else {
                test.done(miss());
            }
        });

    // ----------------------------------------------
    var proxy = new XHRProxy();

    proxy.on("load", function(event) {
        console.log(CONSOLE_COLOR.GREEN + "\n  absolute: " + absolute + "\n" + CONSOLE_COLOR.YELLOW + this.responseText.slice(0, 20) + CONSOLE_COLOR.CLEAR);

        task.set("absolute", this.responseText);
        task.pass();

      //console.log(proxy.getAllResponseHeaders());
    });
    proxy.on("error", function() {
        debugger;
        console.log("Error XHRProxy");
        task.miss();
    });
    proxy.open("GET", absolute);
    proxy.send();

    // ----------------------------------------------
    var proxy2 = new XHRProxy();

    proxy2.on("load", function(event) {
        console.log(CONSOLE_COLOR.GREEN + "\n  relative: " + relative + "\n" + CONSOLE_COLOR.YELLOW + this.responseText.slice(0, 20) + CONSOLE_COLOR.CLEAR);

        task.set("relative", this.responseText);
        task.pass();
    });
    proxy2.on("error", function() {
        debugger;
        console.log("Error XHRProxy2");
        task.miss();
    });
    proxy2.open("GET", relative);
    proxy2.send();


    // ----------------------------------------------
    var proxy3 = new XHRProxy();

    proxy3.on("load", function(event) {
        console.log(CONSOLE_COLOR.GREEN + "\n  localFile: " + localFile + "\n" + CONSOLE_COLOR.YELLOW + this.responseText.slice(0, 20) + CONSOLE_COLOR.CLEAR);

        task.set("localFile", this.responseText);
        task.pass();
    });
    proxy3.on("error", function() {
        debugger;
        console.log("Error XHRProxy3");
        task.miss();
    });
    proxy3.open("GET", localFile);
    proxy3.send();

    // ----------------------------------------------
    var proxy4 = new XHRProxy();

    proxy4.on("load", function(event) {
        console.log(CONSOLE_COLOR.GREEN + "\n  fileScheme: " + fileScheme + "\n" + CONSOLE_COLOR.YELLOW + this.responseText.slice(0, 20) + CONSOLE_COLOR.CLEAR);

        task.set("fileScheme", this.responseText);
        task.pass();
    });
    proxy4.on("error", function() {
        debugger;
        console.log("Error XHRProxy4");
        task.miss();
    });
    proxy4.open("GET", fileScheme);
    proxy4.send();
}

function testNodeProxyEvents(test, pass, miss) {
    var absolute = "http://example.com/";
    var relative = "./test/index.html";
    var localFile = process.cwd() + "/test/index.html";
    var fileScheme = "file://" + process.cwd() + "/test/index.html";

    var task = new Task(1, function(err, buffer) {
            //console.log("buffer: " + buffer.join("\n"));
            test.done(pass());
        });

    // ----------------------------------------------
    var xhr = new XHRProxy({ verbose: true });

    xhr.on("loadstart", function(event) {
        task.push(event.type + "," + xhr.readyState);
    });
    xhr.on("progress", function(event) {
        task.push(event.type + "," + xhr.readyState);
    });
    xhr.on("readystatechange", function(event) {
        task.push(event.type + "," + xhr.readyState);
    });
    xhr.on("load", function(event) {
        task.push(event.type + "," + xhr.readyState);
        task.pass();
    });
    xhr.on("loadend", function(event) {
        task.push(event.type + "," + xhr.readyState);
    });
    xhr.on("error", function(event) {
        task.push(event.type + "," + xhr.readyState);
        task.miss();
    });
    xhr.on("timeout", function(event) {
        task.push(event.type + "," + xhr.readyState);
        task.miss();
    });
    xhr.open("GET", absolute);
    xhr.send();
}



function testXHRProxyHook(test, pass, miss) {
    var url = "http://example.com/";

    var task = new Task(1, function(err, buffer) {
            test.done(pass());
        });

    // ---------------------------------------------
    var xhr = new XHRProxy();

    xhr.on("load", function(event) {
        task.push(event.type + "," + xhr.readyState);
        task.pass();
    });
    xhr.on("error", function(event) {
        task.push(event.type + "," + xhr.readyState);
        task.miss();
    });
    xhr.on("timeout", function(event) {
        task.push(event.type + "," + xhr.readyState);
        task.miss();
    });
    xhr.open("GET", url);
    xhr.send();
}

})((this || 0).self || global);

