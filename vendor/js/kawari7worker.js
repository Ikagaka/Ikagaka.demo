  var Kawari7WorkerClient, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Kawari7WorkerClient = (function(superClass) {
    extend(Kawari7WorkerClient, superClass);

    function Kawari7WorkerClient() {
      return Kawari7WorkerClient.__super__.constructor.apply(this, arguments);
    }

    Kawari7WorkerClient.url = URL.createObjectURL(new Blob([worker_code], {
      type: "text/javascript"
    }));

    Kawari7WorkerClient.prototype.worker = function() {
      return this._worker;
    };

    Kawari7WorkerClient.prototype.load = function(dirpath) {
      this._worker = new URLWorkerClient(Kawari7WorkerClient.url, false);
      return Kawari7WorkerClient.__super__.load.call(this, dirpath);
    };

    return Kawari7WorkerClient;

  })(NativeShioriWorkerClient);

  if (((ref = this.ShioriLoader) != null ? ref.shiories : void 0) != null) {
    this.ShioriLoader.shiories.kawari7 = Kawari7WorkerClient;
  } else {
    throw "load ShioriLoader first";
  }

}).call(this);
