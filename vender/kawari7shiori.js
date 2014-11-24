/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 */
Kawari7Shiori = function(){
	var kawari = new Kawari7();
	this.Module = kawari.Module;
	this.FS = kawari.FS;

	this.load = function(str){
		var load = this.Module.cwrap('load', 'number', ['number','number']);
		var str_sjis = Encoding.codeToString(Encoding.convert(Encoding.stringToCode(str), 'SJIS', 'UNICODE'));
		var dir = Encoding.stringToCode(str_sjis);
		var dir_buf = new Int8Array(dir);
		var dir_buf_size = dir_buf.length * dir_buf.BYTES_PER_ELEMENT;
		var dir_ptr = this.Module._malloc(dir_buf_size);
		var dir_heap = new Int8Array(this.Module.HEAP8.buffer, dir_ptr, dir_buf_size);
		dir_heap.set(new Int8Array(dir_buf.buffer));
		
		var load_ret = load(dir_ptr, dir_buf_size);
		
		this.dir_heap = dir_heap;
		return load_ret;
	}

	this.request = function(str){
		var request = this.Module.cwrap('request', 'number', ['number','number']);

		var str_sjis = Encoding.codeToString(Encoding.convert(Encoding.stringToCode(str), 'SJIS', 'UNICODE'));
		var req = Encoding.stringToCode(str_sjis);
		var req_buf = new Int8Array(req);
		var req_buf_size = req_buf.length * req_buf.BYTES_PER_ELEMENT;
		var req_ptr = this.Module._malloc(req_buf_size);
		var req_heap = new Int8Array(this.Module.HEAP8.buffer, req_ptr, req_buf_size);
		req_heap.set(new Int8Array(req_buf.buffer));

		var len = new Int32Array([req_buf_size]);
		var len_size = len.length * len.BYTES_PER_ELEMENT;
		var len_ptr = this.Module._malloc(len_size);
		var len_heap = new Int32Array(this.Module.HEAP32.buffer, len_ptr, len_size);
		len_heap.set(new Int32Array(len.buffer));

		var req_ret_ptr = request(req_ptr, len_ptr);
		var req_ret_heap = new Int8Array(this.Module.HEAP8.buffer, req_ret_ptr, len_heap[0]);
		
		var request_ret_sjis = Encoding.codeToString(Encoding.convert(req_ret_heap, 'UTF8', 'SJIS'));
		var request_ret_u = Encoding.codeToString(Encoding.convert(Encoding.stringToCode(request_ret_sjis), 'UNICODE', 'SJIS'));
		
		this.Module._free(len_heap.byteOffset);
		this.Module._free(req_ret_heap.byteOffset);
		
		return request_ret_u;
	}

	this.unload = function(){
		var unload = Module.cwrap('unload', 'number');
		
		//this.Module._free(this.dir_heap.byteOffset);
		return unload();
	}
};
