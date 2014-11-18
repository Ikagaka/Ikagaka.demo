chai = require 'chai'
chai.should()
expect = chai.expect
sinon = require 'sinon'
Miyo = require 'miyojs'
MiyoFilters = require '../stash.js'

describe 'stash', ->
	ms = null
	request = null
	id = null
	stash = null
	beforeEach ->
		ms = new Miyo()
		initialize_entry =
			filters: ['miyo_require_filters', 'property_initialize']
			argument:
				miyo_require_filters: ['property']
				property_initialize:
					handlers: ['coffee', 'jse', 'js']
		ms.call_filters initialize_entry, null, '_load'
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		ms.filters.get_stash = type: 'any-value', filter: (argument, request, id, stash) -> stash
		request = sinon.stub()
		id = 'OnTest'
		stash = null
	it 'should set stash', ->
		entry =
			filters: ['stash', 'get_stash']
			argument:
				stash:
					foo: 'foo'
					'2.jse': '1 + 1'
		return_stash = ms.call_filters entry, request, id, stash
		return_stash.should.deep.equal foo: 'foo', '2': 2
	it 'should throw on no argument.stash', ->
		entry =
			filters: ['stash', 'get_stash']
		(-> ms.call_filters entry, request, id, stash).should.throw /argument\.stash/
		entry =
			filters: ['stash', 'get_stash']
			argument:
				stashss: 1
		(-> ms.call_filters entry, request, id, stash).should.throw /argument\.stash/
	it 'should return original argument', ->
		entry =
			filters: ['stash']
			argument:
				stash:
					foo: 'foo'
				dummy: 'dummy'
		return_value = ms.call_filters entry, null, '_load', stash
		return_value.should.deep.equal entry.argument
