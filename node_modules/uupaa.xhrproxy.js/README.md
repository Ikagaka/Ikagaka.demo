# XHRProxy.js [![Build Status](https://travis-ci.org/uupaa/XHRProxy.js.png)](http://travis-ci.org/uupaa/XHRProxy.js)

[![npm](https://nodei.co/npm/uupaa.xhrproxy.js.png?downloads=true&stars=true)](https://nodei.co/npm/uupaa.xhrproxy.js/)

XMLHttpRequest Proxy for Browser and WebWorkers.

## Document

- [XHRProxy.js wiki](https://github.com/uupaa/XHRProxy.js/wiki/XHRProxy)
- [WebModule](https://github.com/uupaa/WebModule)
    - [Slide](http://uupaa.github.io/Slide/slide/WebModule/index.html)
    - [Development](https://github.com/uupaa/WebModule/wiki/Development)


## How to use

### Browser

```js
<script src="lib/XHRProxy.js"></script>
<script>
XHRProxy.get("./index.html", function(error, responseText, xhr) {
    console.log(responseText);
});
</script>
```

### WebWorkers

```js
importScripts("lib/XHRProxy.js");

XHRProxy.get("./index.html", function(error, responseText, xhr) {
    console.log(responseText);
});
```

### Node.js

Use [NodeProxy.js](https://github.com/uupaa/NodeProxy.js).

```js
var NodeProxy = require("uupaa.nodeproxy.js");

NodeProxy.get("./index.html", function(error, responseText, xhr) {
    console.log(responseText);
});
```
