if require?
	chai = require 'chai'
else
	chai = @chai
chai.should()
if require?
	chaiAsPromised = require 'chai-as-promised'
else
	chaiAsPromised = @chaiAsPromised
chai.use chaiAsPromised
if require?
	sinon = require 'sinon'
	ShiolinkJS = require '../lib/shiolink.js'
	ShioriJK = require 'shiorijk'
else
	sinon = @sinon
	ShiolinkJS = @ShiolinkJS
	ShioriJK = @ShioriJK

class FakeShioriEngine
	load : (dir) ->
	unload : ->
	request : (request) ->
		response = null
		if request.request_line.version == '3.0'
			switch request.headers.get('ID')
				when 'version'
					response = new ShioriJK.Message.Response()
					response.status_line.version = '3.0'
					response.status_line.code = 200
					response.headers.set 'Charset', 'UTF-8'
					response.headers.set 'Value', '0.1'
				else
					response = new ShioriJK.Message.Response()
					response.status_line.version = '3.0'
					response.status_line.code = 400
					response.headers.set 'Charset', 'UTF-8'
		else
			response = new ShioriJK.Message.Response()
			response.status_line.version = '3.0'
			response.status_line.code = 400
			response.headers.set 'Charset', 'UTF-8'
		response

describe 'shiolinkjs', ->
	ns = null
	engine = null
	spy_load = null
	spy_unload = null
	spy_request = null
	beforeEach ->
#		spy_request = sinon.spy(FakeShioriEngine::, 'request')
		engine = new FakeShioriEngine()
		spy_load = sinon.spy(engine, 'load')
		spy_unload = sinon.spy(engine, 'unload')
		spy_request = sinon.spy(engine, 'request')
		ns = new ShiolinkJS engine
	it 'can parse shiolink load/unload', ->
		ns.add_chunk ('''
			*L:C:\\ukagaka
			*U:
		'''.replace /\r?\n/g, '\r\n')
		.then ->
			spy_load.callCount.should.be.equal 1
			spy_unload.callCount.should.be.equal 1
			spy_load.calledWith('C:\\ukagaka').should.be.true
	it 'can parse shiolink', ->
		ns.add_chunk ('''
			*L:C:\\ukagaka
			*S:qawsedrftgyhujikolp
			GET Version SHIORI/2.6
			Charset: UTF-8
			Sender: SSP
			
			*S:1234
			GET SHIORI/3.0
			ID: version
			Charset: UTF-8
			Sender: SSP
			
			*U:
		'''.replace /\r?\n/g, '\r\n')
		.then (result) ->
			result.should.be.deep.equal '''
			*S:qawsedrftgyhujikolp
			SHIORI/3.0 400 Bad Request
			Charset: UTF-8
			
			*S:1234
			SHIORI/3.0 200 OK
			Charset: UTF-8
			Value: 0.1
			
			
			'''.replace /\r?\n/g, '\r\n'
			spy_load.callCount.should.be.equal 1
			spy_unload.callCount.should.be.equal 1
			spy_load.calledWith('C:\\ukagaka').should.be.true
			spy_request.callCount.should.be.equal 2
			requests = [spy_request.getCall(0), spy_request.getCall(1)]
			request = new ShioriJK.Message.Request()
			request.request_line.protocol = 'SHIORI'
			request.request_line.version = '2.6'
			request.request_line.method = 'GET Version'
			request.headers.set 'Charset', 'UTF-8'
			request.headers.set 'Sender', 'SSP'
			requests[0].args.should.be.deep.equal [request]
			request = new ShioriJK.Message.Request()
			request.request_line.protocol = 'SHIORI'
			request.request_line.version = '3.0'
			request.request_line.method = 'GET'
			request.headers.set 'ID', 'version'
			request.headers.set 'Charset', 'UTF-8'
			request.headers.set 'Sender', 'SSP'
			requests[1].args.should.be.deep.equal [request]
		.should.eventually.be.fulfilled
