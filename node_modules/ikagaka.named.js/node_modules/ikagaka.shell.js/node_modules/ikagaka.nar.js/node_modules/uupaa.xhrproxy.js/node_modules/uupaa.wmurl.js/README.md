# WMURL.js [![Build Status](https://travis-ci.org/uupaa/WMURL.js.png)](http://travis-ci.org/uupaa/WMURL.js)

[![npm](https://nodei.co/npm/uupaa.wmurl.js.png?downloads=true&stars=true)](https://nodei.co/npm/uupaa.wmurl.js/)

URL parse and build.

## Document

- [WMURL.js wiki](https://github.com/uupaa/WMURL.js/wiki/WMURL)
- [WebModule](https://github.com/uupaa/WebModule)
    - [Slide](http://uupaa.github.io/Slide/slide/WebModule/index.html)
    - [Development](https://github.com/uupaa/WebModule/wiki/Development)

## How to use

### Browser

```js
<script src="lib/WMURL.js"></script>
<script>
console.log( WMURL.parse(location.href) );
</script>
```

### WebWorkers

```js
importScripts("lib/WMURL.js");

console.log( WMURL.parse(location.href) );
```

### Node.js

```js
var WMURL = require("lib/WMURL.js");

console.log( WMURL.parse("http://example.com") );
```
