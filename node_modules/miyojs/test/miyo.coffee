if require?
	chai = require 'chai'
else
	chai = @chai
chai.should()
expect = chai.expect
if require?
	chaiAsPromised = require 'chai-as-promised'
else
	chaiAsPromised = @chaiAsPromised
chai.use chaiAsPromised
if require?
	sinon = require 'sinon'
	ShioriJK = require 'shiorijk'
	Miyo = require '../lib/miyo.js'
else
	sinon = @sinon
	ShioriJK = @ShioriJK
	Miyo = @Miyo

describe 'build_response', ->
	ms = null
	beforeEach ->
		ms = new Miyo()
	it 'should build response', ->
		res = ms.build_response()
		res.should.be.deep.equal new ShioriJK.Message.Response()

describe 'make_value', ->
	ms = null
	beforeEach ->
		ms = new Miyo()
		ms.default_response_headers.Charset = 'UTF-8'
	it 'should make 204 on empty value', ->
		res = ms.make_value('')
		res.status_line.code.should.be.equal 204
		expect(res.headers.get('Value')).be.undefined
		expect(res.headers.get('Charset')).be.equal 'UTF-8'
	it 'should make 204 on null value', ->
		res = ms.make_value(null)
		res.status_line.code.should.be.equal 204
		expect(res.headers.get('Value')).be.undefined
		expect(res.headers.get('Charset')).be.equal 'UTF-8'
	it 'should make 204 on undefined value', ->
		res = ms.make_value()
		res.status_line.code.should.be.equal 204
		expect(res.headers.get('Value')).be.undefined
		expect(res.headers.get('Charset')).be.equal 'UTF-8'
	it 'should make 200 on normal value', ->
		value = '\\h\\s[0]\\e'
		value_res = value.replace /[\r\n]/g, ''
		res = ms.make_value(value)
		res.status_line.code.should.be.equal 200
		expect(res.headers.get('Value')).be.equal value_res
		expect(res.headers.get('Charset')).be.equal 'UTF-8'
	it 'should make 200 and remove line feeds on normal value', ->
		value = '\\h\\s[0]\n\r\\e\r\n'
		value_res = value.replace /[\r\n]/g, ''
		res = ms.make_value(value)
		res.status_line.code.should.be.equal 200
		expect(res.headers.get('Value')).be.equal value_res
		expect(res.headers.get('Charset')).be.equal 'UTF-8'

describe 'make_bad_request', ->
	ms = null
	beforeEach ->
		ms = new Miyo()
		ms.default_response_headers.Charset = 'UTF-8'
	it 'should make 400', ->
		res = ms.make_bad_request()
		res.status_line.code.should.be.equal 400
		expect(res.headers.get('Value')).be.undefined
		expect(res.headers.get('Charset')).be.equal 'UTF-8'

describe 'make_internal_server_error', ->
	ms = null
	beforeEach ->
		ms = new Miyo()
		ms.default_response_headers.Charset = 'UTF-8'
	it 'should make 500', ->
		error = null
		res = ms.make_internal_server_error(error)
		res.status_line.code.should.be.equal 500
		expect(res.headers.get('Value')).be.undefined
		expect(res.headers.get('X-Miyo-Error')).be.undefined
		expect(res.headers.get('Charset')).be.equal 'UTF-8'
	it 'should make 500 with error header', ->
		error = 'this is the error\0'
		error_res = "#{error}".replace(/\r/g, '\\r').replace(/\n/g, '\\n')
		res = ms.make_internal_server_error(error)
		res.status_line.code.should.be.equal 500
		expect(res.headers.get('Value')).be.undefined
		expect(res.headers.get('X-Miyo-Error')).be.equal error_res
		expect(res.headers.get('Charset')).be.equal 'UTF-8'
	it 'should make 500 with error header that has no raw line feeds', ->
		error = 'error\nerror\r\n'
		error_res = "#{error}".replace(/\r/g, '\\r').replace(/\n/g, '\\n')
		res = ms.make_internal_server_error(error)
		res.status_line.code.should.be.equal 500
		expect(res.headers.get('Value')).be.undefined
		expect(res.headers.get('X-Miyo-Error')).be.equal error_res
		expect(res.headers.get('Charset')).be.equal 'UTF-8'

describe 'call_not_found', ->
	ms = null
	beforeEach ->
		ms = new Miyo()
		ms.default_response_headers.Charset = 'UTF-8'
	it 'should return 400', ->
		ms.call_not_found()
		.then (res) ->
			res.status_line.code.should.be.equal 400
		.should.eventually.be.fulfilled

describe 'call_value', ->
	ms = null
	request = null
	id = null
	value = null
	stash = null
	beforeEach ->
		ms = new Miyo()
		request = new ShioriJK.Message.Request()
		id = 'OnTest'
		value = '\\h\\s[0]'
		stash = 'stash'
	it 'should pass value to value_filters', ->
		ms.filters.test_value_filter = type: 'value-value', filter: (value, request, id, stash) -> value + '\\e'
		ms.value_filters.push 'test_value_filter'
		ms.call_value(value, request, id, stash).should.eventually.be.equal value + '\\e'
	it 'should pass exact arguments to filters', ->
		ms.filters.test_value_filter = type: 'value-value', filter: (value, request, id, stash) -> request + id + value + stash + '\\e'
		ms.value_filters.push 'test_value_filter'
		ms.call_value(value, request, id, stash).should.eventually.be.equal request + id + value + stash + '\\e'
	it 'should throw on filter not found', ->
		ms.value_filters.push 'test_value_filter'
		ms.call_value(value, request, id, stash).should.rejectedWith /not found/

describe 'call_filters', ->
	ms = null
	test = null
	request = null
	id = null
	stash = null
	beforeEach ->
		ms = new Miyo()
		test = null
		ms.filters.no_type = filter: ->
		ms.filters.wrong_type = type: 'wrong', filter: ->
		ms.filters.no_function = type: 'any-value'
		ms.prop = 0
		ms.filters.this_prop_inc = type: 'through', filter: (argument, request, id, stash) ->
			@prop++
			argument
		ms.filters.value_plus_end = type: 'value-value', filter: (value, request, id, stash) ->
			value + 'end'
		ms.filters.arg_to_value = type: 'data-value', filter: (argument, request, id, stash) ->
			argument.arg_to_value
		ms.filters.arg_to_argument = type: 'data-data', filter: (argument, request, id, stash) ->
			argument.arg_to_argument
		ms.filters.arg_or_value_to_value = type: 'any-value', filter: (argument, request, id, stash) ->
			if 'string' == typeof argument
				argument
			else
				argument.arg_or_value_to_value
		ms.filters.set_stash = type: 'through', filter: (argument, request, id, stash) ->
			for name, value of argument.set_stash
				stash[name] = value
		ms.filters.get_stash = type: 'any-value', filter: (argument, request, id, stash) ->
			stash
		sinon.spy ms.filters.arg_or_value_to_value, 'filter'
		request = new ShioriJK.Message.Request()
		id = 'OnTest'
		stash = 'stash'
	it 'should throw on filter not found', ->
		entry =
			filters: ['test_filter_not_exists']
		ms.call_filters(entry, request, id, stash).should.eventually.rejectedWith /not found/
	it 'should throw on wrong(no) filter type', ->
		entry =
			filters: ['no_type']
		ms.call_filters(entry, request, id, stash).should.eventually.rejectedWith /invalid filter type/
	it 'should throw on wrong filter type', ->
		entry =
			filters: ['wrong_type']
		ms.call_filters(entry, request, id, stash).should.eventually.rejectedWith /invalid filter type/
	it 'should throw on empty filter function', ->
		entry =
			filters: ['no_function']
		ms.call_filters(entry, request, id, stash).should.eventually.rejectedWith /function is undefined/
	it 'should check filters types', ->
		entry =
			filters: ['this_prop_inc', 'arg_to_argument', 'arg_to_value', 'this_prop_inc', 'value_plus_end', 'arg_or_value_to_value', 'this_prop_inc', 'this_prop_inc']
			argument:
				arg_to_argument:
					arg_to_value: 'ret'
		ms.call_filters(entry, request, id, stash).should.eventually.fulfilled
	it 'should check filters type [any-value]', ->
		# data -> any
		entry =
			filters: ['arg_to_argument', 'arg_or_value_to_value']
			argument:
				arg_to_argument:
					arg_or_value_to_value: 'ret'
		ms.call_filters(entry, request, id, stash).should.eventually.fulfilled
	it 'should check filters type [any-value] 2', ->
		# value -> any
		entry =
			filters: ['arg_to_value', 'arg_or_value_to_value']
			argument:
				arg_to_value: 'ret'
		ms.call_filters(entry, request, id, stash).should.eventually.fulfilled
	it 'should check filters type [through]', ->
		# data -> through
		entry =
			filters: ['arg_to_argument', 'this_prop_inc', 'arg_or_value_to_value']
			argument:
				arg_to_argument:
					arg_or_value_to_value: 'ret'
		ms.call_filters(entry, request, id, stash).should.eventually.fulfilled
	it 'should check filters type [through] 2', ->
		# value -> through
		entry =
			filters: ['arg_to_value', 'this_prop_inc', 'arg_or_value_to_value']
			argument:
				arg_to_value: 'ret'
		ms.call_filters(entry, request, id, stash).should.eventually.fulfilled
	it 'should throw with filters type inconsistency', ->
		entry =
			filters: ['this_prop_inc']
		ms.call_filters(entry, request, id, stash).should.eventually.rejectedWith /inconsistent with final/
	it 'should throw with filters type inconsistency 2', ->
		entry =
			filters: ['arg_to_argument']
			argument:
				arg_to_argument: 'dummy'
		ms.call_filters(entry, request, id, stash).should.eventually.rejectedWith /inconsistent with final/
	it 'should throw with filters type inconsistency 3', ->
		entry =
			filters: ['value_plus_end']
		ms.call_filters(entry, request, id, stash).should.eventually.rejectedWith /inconsistent with previous/
	it 'should throw with filters type inconsistency 4', ->
		entry =
			filters: ['arg_to_argument', 'value_plus_end']
			argument:
				arg_to_argument: 'dummy'
		ms.call_filters(entry, request, id, stash).should.eventually.rejectedWith /inconsistent with previous/
	it 'should pass argument and filter-return-value to filters sequentially', ->
		entry =
			filters: ['arg_to_argument', 'arg_to_value']
			argument:
				arg_to_argument:
					arg_to_value: 'ret'
		ms.call_filters(entry, request, id, stash).should.eventually.be.deep.equal 'ret'
	it 'should treat non-array filters property', ->
		entry =
			filters: 'arg_or_value_to_value'
			argument: 'ret'
		ms.call_filters(entry, request, id, stash).should.eventually.be.deep.equal 'ret'
	it 'should pass exact arguments to filters', ->
		entry =
			filters: ['arg_or_value_to_value']
			argument:
				arg_or_value_to_value: 'ret'
		ms.call_filters(entry, request, id, stash)
		.then ->
			ms.filters.arg_or_value_to_value.filter.calledOnce.should.be.true
			ms.filters.arg_or_value_to_value.filter.calledWithExactly(entry.argument, request, id, stash).should.be.true
		.should.eventually.be.fulfilled
	it 'should initialize stash as hash', ->
		stash = null
		entry =
			filters: ['get_stash']
		ms.call_filters(entry, request, id, stash)
		.then (return_stash) ->
			return_stash.should.be.deep.equal {}
		.should.eventually.be.fulfilled
	it 'should pass stash', ->
		stash = null
		entry =
			filters: ['set_stash', 'get_stash']
			argument:
				set_stash:
					foo: 'foo'
		ms.call_filters(entry, request, id, stash)
		.then (return_stash) ->
			return_stash.should.be.deep.equal {foo: 'foo'}
		.should.eventually.be.fulfilled

describe 'call_list', ->
	ms = null
	request = null
	id = null
	stash = null
	random_stub = null
	call_entry_spy = null
	beforeEach ->
		ms = new Miyo()
		random_stub = sinon.stub Math, 'random'
		call_entry_spy = sinon.spy ms, 'call_entry'
		request = new ShioriJK.Message.Request()
		id = 'OnTest'
		stash = 'stash'
	afterEach ->
		random_stub.restore()
	it 'should call call_entry on simple entry', ->
		random_stub.returns 0
		entry = [
			'\\h\\s[0]\\e'
			'\\h\\s[1]\\e'
		]
		ms.call_list(entry, request, id, stash)
		.then (res) ->
			res.should.be.equal entry[0]
			call_entry_spy.callCount.should.be.equal 1
			call_entry_spy.firstCall.calledWithExactly(entry[0], request, id, stash).should.be.true
		.should.eventually.be.fulfilled
	it 'should call call_entry recursively on nested entry', ->
		random_stub.returns 0
		entry = [
			[
				'\\h\\s[0]\\e'
				'\\h\\s[1]\\e'
			]
			'\\h\\s[2]\\e'
			'\\h\\s[3]\\e'
		]
		ms.call_list(entry, request, id, stash)
		.then (res) ->
			res.should.be.equal entry[0][0]
			call_entry_spy.callCount.should.be.equal 2
			call_entry_spy.firstCall.calledWithExactly(entry[0], request, id, stash).should.be.true
			call_entry_spy.lastCall.calledWithExactly(entry[0][0], request, id, stash).should.be.true
		.should.eventually.be.fulfilled

describe 'call_entry', ->
	ms = null
	request = null
	id = null
	stash = null
	beforeEach ->
		ms = new Miyo()
		request = new ShioriJK.Message.Request()
		id = 'OnTest'
		stash = 'stash'
	it 'should pass value entry to call_value', ->
		entry = '\\h\\s[0]\\e'
		s = sinon.spy ms, 'call_value'
		ms.call_entry(entry, request, id, stash)
		.then ->
			s.calledOnce.should.be.true
			s.firstCall.calledWithExactly(entry, request, id, stash).should.be.true
		.should.eventually.be.fulfilled
	it 'should pass filter entry to call_filters', ->
		ms.filters.test_filter = type: 'data-value', filter: (argument, request, id, stash) -> argument
		entry =
			filters: ['test_filter']
			argument:
				test_filter: 'test'
		s = sinon.spy ms, 'call_filters'
		ms.call_entry(entry, request, id, stash)
		.then ->
			s.calledOnce.should.be.true
			s.firstCall.calledWithExactly(entry, request, id, stash).should.be.true
		.should.eventually.be.fulfilled
	it 'should pass list entry to call_list', ->
		random_stub = sinon.stub Math, 'random'
		random_stub.returns 0.9
		entry = [
			[
				'\\h\\s[0]\\e'
				'\\h\\s[1]\\e'
			]
			'\\h\\s[2]\\e'
			'\\h\\s[3]\\e'
		]
		s = sinon.spy ms, 'call_list'
		ms.call_entry(entry, request, id, stash)
		.then ->
			s.calledOnce.should.be.true
			s.firstCall.calledWithExactly(entry, request, id, stash).should.be.true
			random_stub.restore()
		.should.eventually.be.fulfilled
	it 'should pass invalid entry to call_not_found', ->
		entry = `undefined`
		s = sinon.spy ms, 'call_not_found'
		ms.call_entry(entry, request, id, stash)
		.then ->
			s.calledOnce.should.be.true
			s.firstCall.calledWithExactly(entry, request, id, stash).should.be.true
		.should.eventually.be.fulfilled

describe 'call_id', ->
	ms = null
	stash = null
	call_entry_spy = null
	dictionary =
		_load: 'load'
		OnTest: '\\h\\s[0]\\e'
	beforeEach ->
		ms = new Miyo(dictionary)
		call_entry_spy = sinon.spy ms, 'call_entry'
	it 'should not call_id on undefined entry with null request (load, unload)', ->
		id = '_unload'
		request = null
		ms.call_id(id, request, stash)
		.then (res) ->
			call_entry_spy.callCount.should.be.equal 0
			expect(res).be.undefined
		.should.eventually.be.fulfilled
	it 'should call_id on defined entry with null request (load, unload)', ->
		id = '_load'
		request = null
		ms.call_id(id, request, stash)
		.then ->
			call_entry_spy.calledOnce.should.be.true
			call_entry_spy.firstCall.calledWithExactly(dictionary._load, request, id, stash).should.be.true
		.should.eventually.be.fulfilled
	it 'should call_id on undefined entry with normal request (request)', ->
		id = 'onTestTest'
		request = new ShioriJK.Message.Request()
		ms.call_id(id, request, stash)
		.then ->
			call_entry_spy.calledOnce.should.be.true
			call_entry_spy.firstCall.calledWithExactly(`undefined`, request, id, stash).should.be.true
		.should.eventually.be.fulfilled
	it 'should call_id on defined entry with normal request (request)', ->
		id = 'OnTest'
		request = new ShioriJK.Message.Request()
		ms.call_id(id, request, stash)
		.then ->
			call_entry_spy.calledOnce.should.be.true
			call_entry_spy.firstCall.calledWithExactly(dictionary.OnTest, request, id, stash).should.be.true
		.should.eventually.be.fulfilled

describe 'load', ->
	ms = null
	call_id_spy = null
	beforeEach ->
		ms = new Miyo({})
		call_id_spy = sinon.spy ms, 'call_id'
	it 'should call_id("_load", null) and store shiori_dll_directory', ->
		directory = '/'
		ms.load(directory)
		.then ->
			call_id_spy.calledOnce.should.be.true
			call_id_spy.firstCall.calledWithExactly('_load', null).should.be.true
			ms.shiori_dll_directory.should.be.equal directory
		.should.eventually.be.fulfilled

describe 'unload', ->
	ms = null
	exit_stub = null
	call_id_spy = null
	beforeEach ->
		ms = new Miyo({})
		if process?
			exit_stub = sinon.stub process, 'exit'
		call_id_spy = sinon.spy ms, 'call_id'
	afterEach ->
		if process?
			exit_stub.restore()
	it 'should call_id("_unload", null) and process.exit()', ->
		ms.unload()
		.then ->
			call_id_spy.calledOnce.should.be.true
			call_id_spy.firstCall.calledWithExactly('_unload', null).should.be.true
			if process?
				exit_stub.calledOnce.should.be.true
		.should.eventually.be.fulfilled

describe 'request', ->
	ms = null
	call_id_stub = null
	request_2 = null
	request_3 = null
	response = null
	beforeEach ->
		ms = new Miyo()
		request_3 = new ShioriJK.Message.Request()
		request_3.request_line.method = 'GET'
		request_3.request_line.protocol = 'SHIORI'
		request_3.request_line.version = '3.0'
		request_3.headers.set('Charset', 'UTF-8')
		request_3.headers.set('Sender', 'SSP')
		request_2 = new ShioriJK.Message.Request()
		request_2.request_line.method = 'GET Version'
		request_2.request_line.protocol = 'SHIORI'
		request_2.request_line.version = '2.6'
		request_2.headers.set('Charset', 'UTF-8')
		request_2.headers.set('Sender', 'SSP')
		response = new ShioriJK.Message.Response()
		response.status_line.code = 200
		response.status_line.protocol = 'SHIORI'
		response.status_line.version = '3.0'
		response.headers.set('Charset', 'UTF-8')
		response.headers.set('Sender', 'SSP')
		response.headers.set('Value', 'test response')
		call_id_stub = sinon.stub ms, 'call_id'
		call_id_stub.returns()
		call_id_stub.withArgs('OnTest').returns('test')
		call_id_stub.withArgs('OnTestResponse').returns(response)
		call_id_stub.withArgs('OnTestThrow').throws('test throw')
	it 'should make bad request on SHIORI/2.x', ->
		ms.request(request_2)
		.then (res) ->
			"#{res}".should.be.equal ms.make_bad_request().toString()
		.should.eventually.be.fulfilled
	it 'should make response on entry that returns value', ->
		request_3.headers.set('ID', 'OnTest')
		ms.request(request_3)
		.then (res) ->
			"#{res}".should.be.equal ms.make_value('test').toString()
		.should.eventually.be.fulfilled
	it 'should return response on entry that returns response object', ->
		request_3.headers.set('ID', 'OnTestResponse')
		ms.request(request_3)
		.then (res) ->
			"#{res}".should.be.equal response.toString()
		.should.eventually.be.fulfilled
	it 'should make internal server error on entry that throws', ->
		request_3.headers.set('ID', 'OnTestThrow')
		ms.request(request_3)
		.then (res) ->
			try
				call_id_stub('OnTestThrow')
			catch error
			"#{res}".should.be.equal ms.make_internal_server_error(error).toString()
		.should.eventually.be.fulfilled
