# Ghost.js

## usage

[wiki](https://github.com/Ikagaka/Ghost.js/wiki/Ghost.js )

```html
<script src="./node_modules/ikagaka.nar.js/node_modules/encoding-japanese/encoding.js"></script>
<script src="./node_modules/ikagaka.nar.js/vender/jszip.min.js"></script>
<script src="./node_modules/ikagaka.nar.js/vender/XHRProxy.min.js"></script>
<script src="./node_modules/ikagaka.nar.js/vender/WMDescript.js"></script>
<script src="./node_modules/ikagaka.nar.js/Nar.js"></script>
<script src="./node_modules/ikagaka.shell.js/vender/zepto.min.js"></script>
<script src="./node_modules/ikagaka.shell.js/SurfaceUtil.js"></script>
<script src="./node_modules/underscore/underscore-min.js"></script>
<script src="./Ghost.js"></script>
<script>
var nar = new Nar();
nar.loadFromURL("./vender/TempleteKarin.nar", function (err){
  if(!!err) return console.error(err.stack);

  if(nar.install.type === "ghost"){
    var ghostDir = nar.getDirectory(/ghost\/master\//);
    var ghost = new Ghost(ghostDir);
  }else{
    throw new Error("wrong nar file")
  }

  Error.stackTraceLimit = Infinity;

  ghost.load(function(err){
    if(!!err) return console.error(err.stack);

    console.log(ghost);

    ghost.request([
      "GET SHIORI/3.0",
      "ID: OnBoot",
      "Sender: embryo",
      "Charset: Shift_JIS",
      "Reference0: 0",
      "\r\n"].join("\r\n"), function(err, response){
      if(!!err) return console.error(err.stack);

      console.log(response);
    });

  });
});
</script>

```
