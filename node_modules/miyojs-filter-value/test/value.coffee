chai = require 'chai'
chai.should()
expect = chai.expect
sinon = require 'sinon'
Miyo = require 'miyojs'
MiyoFilters = require '../value.js'

describe 'value', ->
	ms = null
	request = null
	id = null
	stash = null
	beforeEach ->
		ms = new Miyo()
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		sinon.spy ms, 'call_entry'
		request = ->
		id = 'OnTest'
		stash = null
	it 'should return value', ->
		entry =
			filters: ['value']
			argument:
				value: 'dummy'
		return_argument = ms.call_filters entry, request, id, stash
		ms.call_entry.calledWith('dummy').should.be.true
	it 'should throw with no value', ->
		entry =
			filters: ['value']
		(-> ms.call_filters entry, request, id, stash).should.throw /argument\.value undefined/
		entry =
			filters: ['value']
			argument:
				other: 'a'
		(-> ms.call_filters entry, request, id, stash).should.throw /argument\.value undefined/
