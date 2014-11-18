chai = require 'chai'
chai.should()
expect = chai.expect
sinon = require 'sinon'
Miyo = require 'miyojs'
MiyoFilters = require '../default_response_headers.js'

describe 'default_response_headers', ->
	it 'should set default_response_headers', ->
		ms = new Miyo()
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		entry =
			filters: ['default_response_headers']
			argument:
				default_response_headers:
					Charset: 'UTF-8'
					Sender: 'test_ghost'
				other:
					'other'
		request = sinon.stub()
		id = 'OnTest'
		stash = null
		return_argument = ms.call_filters entry, null, '_load'
		return_argument.should.be.deep.equal entry.argument
		ms.default_response_headers.should.be.deep.equal entry.argument.default_response_headers
