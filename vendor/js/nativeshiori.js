/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 */

if(typeof require !== "undefined" && require !== null){
	Encoding = require('encoding-japanese');
}

NativeShiori = function(shiori, storage){
	this.Module = shiori.Module;
	this.FS = shiori.FS;
	this.storage = storage;
	this._load = this.Module.cwrap('load', 'number', ['number','number']);
	this._request = this.Module.cwrap('request', 'number', ['number','number']);
	this._unload = this.Module.cwrap('unload', 'number');
};

NativeShiori.prototype.load = function(dirpath){
	if(this.storage){
		this._load_FS(dirpath);
	}
	
	var dirpath_raw = Encoding.convert(Encoding.stringToCode(dirpath), 'UTF8', 'UNICODE');
	var dir = this._alloc_string(dirpath_raw);
	
	return this._load(dir.ptr, dir.size);
};

NativeShiori.prototype.request = function(request){
	var request_raw = Encoding.convert(Encoding.stringToCode(request), this.detect_shiori_charset(request), 'UNICODE');
	var req = this._alloc_string(request_raw);
	var len = this._alloc_long(req.size);
	
	var res_ptr = this._request(req.ptr, len.ptr);
	
	var res_heap = this._view_string(res_ptr, len.heap[0]);
	var response_raw = Encoding.convert(res_heap, 'UTF8', 'SJIS');
	var response = Encoding.codeToString(Encoding.convert(response_raw, 'UNICODE', this.detect_shiori_charset(Encoding.codeToString(response_raw))));
	
	this.Module._free(len.ptr);
	this.Module._free(res_ptr);
	
	return response;
};

NativeShiori.prototype.unload = function(){
	return this._unload();
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

NativeShiori.prototype._load_FS = function(base_directory){
	var filepath;
	for(filepath in this.storage){
		var dirname = this._dirname(filepath);
		var dir = this._catfile(base_directory, dirname);
		try{
			this.FS.stat(dir);
		}catch(e){
			this._mkpath(dir);
		}
		if(! /\/$/.test(filepath)){
			var content = new Uint8Array(this.storage[filepath]);
			var file = this._catfile(base_directory, filepath);
			this.FS.writeFile(file, content, {encoding: 'binary'});
		}
	}
};

NativeShiori.prototype._catfile = function(){
	var path = ''
	var i = 0;
	for(i = 0; i < arguments.length; ++i){
		var token = arguments[i];
		path += token.replace(/^\/?/, '/').replace(/\/?$/, '');
	}
	return path;
};

NativeShiori.prototype._dirname = function(path){
	return path.replace(/\/?[^\/]*$/, '');
};

NativeShiori.prototype._mkpath = function(path){
	var FS = this.FS;
	var mkdir;
	mkdir = function(hierarchy){
		var path = hierarchy.join('/').replace(/\/$/, "");
		try{
			FS.stat(path);
		}catch(e){
			mkdir(hierarchy.slice(0, hierarchy.length - 2));
			FS.mkdir(path);
		}
	};
	var hierarchy = path.split(/\//);
	mkdir(hierarchy);
	return true;
};

if((typeof module !== "undefined" && module !== null) && (module.exports != null)) module.exports = NativeShiori;
