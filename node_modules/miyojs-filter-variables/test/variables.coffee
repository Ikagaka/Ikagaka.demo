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
	Miyo = require 'miyojs'
	MiyoFilters = require '../variables.js'
else
	sinon = @sinon
	Miyo = @Miyo
	MiyoFilters = @MiyoFilters
if require?
	fs = require 'fs'
else
	fs = @fs

describe 'variables_initialize', ->
	ms = null
	request = null
	entry = null
	beforeEach ->
		ms = new Miyo()
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		request = sinon.stub()
		entry =
			filters: ['variables_initialize']
			argument:
				value: 'dummy'
	it 'should return original argument', ->
		ms.call_filters entry, null, '_load'
		.should.eventually.be.deep.equal entry.argument
	it 'should define variables and methods', ->
		ms.call_filters entry, null, '_load'
		.then ->
			ms.variables.should.be.instanceof Object
			ms.variables_temporary.should.be.instanceof Object
			ms.variables_save.should.be.instanceof Function
			ms.variables_load.should.be.instanceof Function

describe 'variables_load', ->
	ms = null
	request = null
	readFile = null
	error = `undefined`
	data = `undefined`
	promise = null
	beforeEach ->
		error = `undefined`
		data = `undefined`
		ms = new Miyo()
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		entry =
			filters: ['miyo_require_filters', 'property_initialize', 'variables_initialize']
			argument:
				miyo_require_filters: ['property']
				property_initialize:
					handlers: ['coffee', 'jse', 'js']
		promise = ms.call_filters entry, null, '_load'
		request = sinon.stub()
		readFile = sinon.stub fs, 'readFile', (args...) ->
			callback = args[args.length - 1]
			if callback instanceof Function
				callback(error, data)
	afterEach ->
		readFile.restore()
	it 'should read', ->
		variables = {
			var: 23
			nest:
				a: 1
				b: 1
		}
		data = JSON.stringify variables
		promise
		.then ->
			ms.variables_load('test/variables.json')
		.then ->
			ms.variables.should.be.deep.equal variables
	it 'should called from filter', ->
		variables = {
			var: 23
			nest:
				a: 1
				b: 1
		}
		data = JSON.stringify variables
		entry =
			filters: ['variables_load']
			argument:
				variables_load:
					file: 'test/variables.json'
		promise
		.then ->
			ms.call_filters entry, null, '_load'
		.then ->
			ms.variables.should.be.deep.equal variables
	it 'should reject on fs error', ->
		error = 'error test'
		promise
		.then ->
			ms.variables_load('test/variables.json')
		.should.eventually.rejectedWith 'error test'
	it 'filter should call error callback on fs error', ->
		error = 'error test'
		entry =
			filters: ['variables_load']
			argument:
				variables_load:
					file: 'test/variables.json'
					'error.jse': 'stash.error'
		promise
		.then ->
			ms.call_filters entry, null, '_load'
		.then (argument) ->
			argument.should.deep.equal error
	it 'filter should return argument if no error callback on fs error', ->
		error = 'error test'
		entry =
			filters: ['variables_load']
			argument:
				variables_load:
					file: 'test/variables.json'
		promise
		.then ->
			ms.call_filters entry, null, '_load'
		.then (argument) ->
			argument.should.deep.equal entry.argument
	it 'should reject with filter no argument', ->
		entry =
			filters: ['variables_load']
		promise
		.then ->
			ms.call_filters entry, null, '_load'
		.should.eventually.rejectedWith /argument.variables_load.file undefined/

describe 'variables_save', ->
	ms = null
	request = null
	writeFile = null
	error = `undefined`
	promise = null
	beforeEach ->
		ms = new Miyo()
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		entry =
			filters: ['miyo_require_filters', 'property_initialize', 'variables_initialize']
			argument:
				miyo_require_filters: ['property']
				property_initialize:
					handlers: ['coffee', 'jse', 'js']
		promise = ms.call_filters entry, null, '_load'
		request = sinon.stub()
		writeFile = sinon.stub fs, 'writeFile', (args...) ->
			callback = args[args.length - 1]
			if callback instanceof Function
				callback(error)
	afterEach ->
		writeFile.restore()
	it 'should write', ->
		promise
		.then ->
			ms.variables = {
				var: 23
				nest:
					a: 1
					b: 1
			}
			ms.variables_save('test/variables.json')
		.then ->
			writeFile.calledOnce.should.be.true
			writeFile.firstCall.calledWith 'test/variables.json', JSON.stringify ms.variables, 'utf8'
	it 'should called from filter', ->
		promise
		.then ->
			ms.variables = {
				var: 23
				nest:
					a: 1
					b: 1
			}
			entry =
				filters: ['variables_save']
				argument:
					variables_save:
						file: 'test/variables.json'
			ms.call_filters entry, null, '_unload'
		.then ->
			writeFile.calledOnce.should.be.true
			writeFile.firstCall.calledWith 'test/variables.json', JSON.stringify ms.variables, 'utf8'
	it 'should reject on fs error', ->
		error = 'error test'
		promise
		.then ->
			ms.variables = var: 23
			ms.variables_save('test/variables.json')
		.should.eventually.rejectedWith 'error test'
	it 'filter should call error callback on fs error', ->
		error = 'error test'
		entry =
			filters: ['variables_save']
			argument:
				variables_save:
					file: 'test/variables.json'
					'error.jse': 'stash.error'
		promise
		.then ->
			ms.variables = var: 23
			ms.call_filters entry, null, '_unload'
		.then (argument) ->
			argument.should.deep.equal error
	it 'filter should return argument if no error callback on fs error', ->
		error = 'error test'
		entry =
			filters: ['variables_save']
			argument:
				variables_save:
					file: 'test/variables.json'
		promise
		.then ->
			ms.variables = var: 23
			ms.call_filters entry, null, '_unload'
		.then (argument) ->
			argument.should.deep.equal entry.argument
	it 'should reject with filter no argument', ->
		promise
		.then ->
			entry =
				filters: ['variables_save']
			ms.call_filters entry, null, '_unload'
		.should.eventually.rejectedWith /argument.variables_save.file undefined/
