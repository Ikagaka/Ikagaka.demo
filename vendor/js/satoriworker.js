  var SatoriWorkerClient, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  SatoriWorkerClient = (function(superClass) {
    extend(SatoriWorkerClient, superClass);

    function SatoriWorkerClient() {
      return SatoriWorkerClient.__super__.constructor.apply(this, arguments);
    }

    SatoriWorkerClient.url = URL.createObjectURL(new Blob([worker_code], {
      type: "text/javascript"
    }));

    SatoriWorkerClient.prototype.worker = function() {
      return this._worker;
    };

    SatoriWorkerClient.prototype.load = function(dirpath) {
      this._worker = new URLWorkerClient(SatoriWorkerClient.url, false);
      return SatoriWorkerClient.__super__.load.call(this, dirpath);
    };

    return SatoriWorkerClient;

  })(NativeShioriWorkerClient);

  if (((ref = this.ShioriLoader) != null ? ref.shiories : void 0) != null) {
    this.ShioriLoader.shiories.satori = SatoriWorkerClient;
  } else {
    throw "load ShioriLoader first";
  }

}).call(this);
