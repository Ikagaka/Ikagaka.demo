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
	MiyoFilters = require '../join.js'
else
	sinon = @sinon
	Miyo = @Miyo
	MiyoFilters = @MiyoFilters

describe 'join', ->
	ms = null
	request = null
	id = null
	stash = null
	beforeEach ->
		ms = new Miyo()
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		sinon.spy ms, 'call_entry'
		request = sinon.stub()
		id = 'OnTest'
		stash = null
	it 'should return undefined with no argument', ->
		entry =
			filters: ['join']
		ms.call_filters entry, request, id, stash
		.should.eventually.undefined
	it 'should return empty string with 0 list', ->
		entry =
			filters: ['join']
			argument:
				join: []
		ms.call_filters entry, request, id, stash
		.should.eventually.equal ''
	it 'should return joined string with non-zero list', ->
		entry =
			filters: ['join']
			argument:
				join: [
					'elem 1'
					'elem 2'
				]
		ms.call_filters entry, request, id, stash
		.then (ret) ->
			ms.call_entry.callCount.should.be.equal 2
			ms.call_entry.firstCall.calledWith('elem 1').should.be.true
			ms.call_entry.secondCall.calledWith('elem 2').should.be.true
			expect(ret).equal 'elem 1elem 2'
