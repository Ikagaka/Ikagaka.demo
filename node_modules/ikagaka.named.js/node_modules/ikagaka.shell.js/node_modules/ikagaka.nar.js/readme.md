# Nar.js

## Usage

[wiki](https://github.com/Ikagaka/Nar.js/wiki/Nar.js)

```html
<script src="./vender/encoding.js"></script>
<script src="./vender/jszip.min.js"></script>
<script src="./vender/XHRProxy.min.js"></script>
<script src="./vender/WMDescript.js"></script>
<script src="./Nar.js"></script>
<script>
var nar = new Nar();
nar.loadFromURL("./vender/mobilemaster.nar", function(err){
  if(!!err) return console.error(err.stack);

  console.log(nar);

});
</script>
```
