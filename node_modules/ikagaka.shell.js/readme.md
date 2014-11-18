# Shell.js

Shell.js can play SERIKO/2.0 animation.

![screenshot](https://raw.githubusercontent.com/Ikagaka/Shell.js/master/screenshot.png )

[demo](https://ikagaka.github.io/node_modules/ikagaka.shell.js/test.html)

## Usage

[wiki](https://github.com/Ikagaka/Shell.js/wiki/Shell.js )


```html
<script src="./node_modules/ikagaka.nar.js/node_modules/encoding-japanese/encoding.js"></script>
<script src="./node_modules/ikagaka.nar.js/vender/jszip.min.js"></script>
<script src="./node_modules/ikagaka.nar.js/vender/XHRProxy.min.js"></script>
<script src="./node_modules/ikagaka.nar.js/vender/WMDescript.js"></script>
<script src="./node_modules/ikagaka.nar.js/Nar.js"></script>
<script src="./node_modules/surfaces_txt2yaml/lib/surfaces_txt2yaml.js"></script>
<script src="./node_modules/underscore/underscore-min.js"></script>
<script src="./node_modules/zepto/zepto.min.js"></script>
<script src="./SurfaceUtil.js"></script>
<script src="./Surface.js"></script>
<script src="./Shell.js"></script>
<canvas id="surface"></canvas>
<script>
var nar = new Nar();
nar.loadFromURL("./node_modules/ikagaka.nar.js/vender/mobilemaster.nar", function (err){
  if(!!err) return console.error(err.stack);

  if(nar.install["type"] === "ghost"){
    var shellDir = nar.getDirectory(/shell\/master\//);
    var shell = new Shell(shellDir);

  }else if(nar.install["type"] === "shell"){
    var shell = new Shell(nar.directory);

  }else{
    throw new Error("non support nar file type");

  }

  shell.load(function(err){
    if(!!err) return console.error(err.stack);

    console.log(shell);

    var surface = shell.attachSurface($("#surface")[0], 0, 7);

    surface.bind(30);
    surface.bind(31);
    surface.bind(32);
    surface.bind(50);

    console.log(surface);
  });
});
</script>
```
