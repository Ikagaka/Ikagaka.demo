/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 */

if(typeof require !== "undefined" && require !== null){
	Encoding = require('encoding-japanese');
}

NativeShiori = function(shiori, debug){
	this.Module = shiori.Module;
	this.FS = shiori.FS;
	this.debug = debug;
	this._load = this.Module.cwrap('load', 'number', ['number','number']);
	this._request = this.Module.cwrap('request', 'number', ['number','number']);
	this._unload = this.Module.cwrap('unload', 'number');
};

NativeShiori.prototype.load = function(dirpath){
	if(this.debug) console.log('nativeshiori.load()', dirpath);
	var dirpath_raw = Encoding.convert(Encoding.stringToCode(dirpath), 'UTF8', 'UNICODE');
	var dir = this._alloc_string(dirpath_raw);
	
	return this._load(dir.ptr, dir.size);
};

NativeShiori.prototype.request = function(request){
	if(this.debug) console.log('nativeshiori.request()\n', request);
	var request_raw = Encoding.convert(Encoding.stringToCode(request), this.detect_shiori_charset(request), 'UNICODE');
	var req = this._alloc_string(request_raw);
	var len = this._alloc_long(req.size);
	
	var res_ptr = this._request(req.ptr, len.ptr);
	
	var res_heap = this._view_string(res_ptr, len.heap[0]);
	var response_raw = Encoding.convert(res_heap, 'UTF8', 'SJIS');
	var response = Encoding.codeToString(Encoding.convert(response_raw, 'UNICODE', this.detect_shiori_charset(Encoding.codeToString(response_raw))));
	
	this.Module._free(len.ptr);
	this.Module._free(res_ptr);
	
	if(this.debug) console.log('nativeshiori.request() returns\n', response);
	return response;
};

NativeShiori.prototype.unload = function(){
	if(this.debug) console.log('nativeshiori.unload()');
	return this._unload();
};

NativeShiori.prototype.push = function(dirpath, storage){
	if(this.debug) console.log('nativeshiori.push()', dirpath, storage);
	this._push_FS(dirpath, storage);
};

NativeShiori.prototype.pull = function(dirpath){
	if(this.debug) console.log('nativeshiori.pull()', dirpath);
	return this._pull_FS(dirpath);
};

NativeShiori.prototype.detect_shiori_charset = function(str){
	var charset = 'AUTO';
	var result;
	if(result = str.match(/\r\nCharset: (.+)\r\n/i)){
		switch(result[1]){
			case 'UTF-8': charset = 'UTF8'; break;
			case 'Shift_JIS': charset = 'SJIS'; break;
		}
	}
	return charset;
};

NativeShiori.prototype._alloc_string = function(str_array){
	var buf = new Int8Array(str_array);
	var size = buf.length * buf.BYTES_PER_ELEMENT;
	var ptr = this.Module._malloc(size);
	var heap = new Int8Array(this.Module.HEAP8.buffer, ptr, size);
	heap.set(buf);
	return {ptr: ptr, size: size, heap: heap};
};

NativeShiori.prototype._view_string = function(ptr, size){
	return new Int8Array(this.Module.HEAP8.buffer, ptr, size);
};

NativeShiori.prototype._alloc_long = function(n){
	var buf = new Int32Array([n]);
	var size = buf.length * buf.BYTES_PER_ELEMENT;
	var ptr = this.Module._malloc(size);
	var heap = new Int32Array(this.Module.HEAP32.buffer, ptr, size);
	heap.set(buf);
	return {ptr: ptr, size: size, heap: heap};
};

NativeShiori.prototype._push_FS = function(base_directory, storage){
	if(this.debug) console.log('nativeshiori._push_FS()', base_directory, storage);
	var filepath;
	for(filepath in storage){
		var dirname = this._dirname(filepath);
		var dir = this._catfile(base_directory, dirname);
		try{
			this.FS.stat(dir);
		}catch(e){
			this._mkpath(dir);
		}
		if(! /\/$/.test(filepath)){
			var content = new Uint8Array(storage[filepath]);
			var file = this._catfile(base_directory, filepath);
			if(this.debug) console.log('nativeshiori._push_FS() writeFile:', file);
			this.FS.writeFile(file, content, {encoding: 'binary'});
		}
	}
};

NativeShiori.prototype._pull_FS = function(base_directory){
	if(this.debug) console.log('nativeshiori._pull_FS()', base_directory);
	var storage = {};
	var elements = this._readdirAll(base_directory);
	var filepath;
	var i = 0;
	for(i = 0; i < elements.length; ++i){
		var filepath = elements[i];
		var file = this._catfile(base_directory, filepath);
		if(this.debug) console.log('nativeshiori._pull_FS() readFile/unlink:', file);
		var content = this.FS.readFile(file, {encoding: 'binary'});
		this.FS.unlink(file);
		storage[filepath] = content.buffer;
	}
	return storage;
};

NativeShiori.prototype._canonical = function(path){
	return path.replace(/\\/, '/').replace(/\/\/+/, '/');
}
NativeShiori.prototype._catfile = function(){
	var path = ''
	var i = 0;
	for(i = 0; i < arguments.length; ++i){
		var token = arguments[i];
		path += token.replace(/^\/?/, '/').replace(/\/?$/, '');
	}
	return NativeShiori.prototype._canonical(path).replace(/\/?$/, '');
};

NativeShiori.prototype._catfile_rel = function(){
	return NativeShiori.prototype._catfile.apply(this, arguments).replace(/^\//, '');
}

NativeShiori.prototype._dirname = function(path){
	return NativeShiori.prototype._canonical(path).replace(/\/?[^\/]*\/?$/, '');
};

NativeShiori.prototype._mkpath = function(path){
	if(this.debug) console.log('nativeshiori._mkpath()', path);
	var FS = this.FS;
	var _dirname = this._dirname;
	var debug = this.debug;
	var mkdir;
	mkdir = function(path){
		if(!path) path = '/';
		try{
			FS.stat(path);
		}catch(e){
			mkdir(_dirname(path));
			if(debug) console.log('nativeshiori._mkpath() mkdir:', path);
			FS.mkdir(path);
		}
	};
	mkdir(this._canonical(path));
	return true;
};

NativeShiori.prototype._readdirAll = function(path){ // not contain directory
	if(this.debug) console.log('nativeshiori._readdirAll()', path);
	var FS = this.FS;
	var _catfile = this._catfile;
	var _catfile_rel = this._catfile_rel;
	var debug = this.debug;
	var readdir;
	readdir = function(basepath, path){
		var abspath = _catfile(basepath, path);
		if(debug) console.log('nativeshiori._readdirAll() readdir:', abspath);
		var children = FS.readdir(abspath);
		var elements = [];
		var i = 0;
		for(i = 0; i < children.length; ++i){
			var child = children[i];
			if(child == '.' || child == '..') continue;
			var childpath = _catfile_rel(path, child);
			var childabspath = _catfile(basepath, childpath);
			var stat = FS.stat(childabspath);
			if(FS.isDir(stat.mode)){
				elements = elements.concat(readdir(basepath, childpath));
			}else{
				elements.push(childpath);
			}
		}
		return elements;
	};
	elements = readdir(this._canonical(path), '');
	return elements;
};

if((typeof module !== "undefined" && module !== null) && (module.exports != null)) module.exports = NativeShiori;
