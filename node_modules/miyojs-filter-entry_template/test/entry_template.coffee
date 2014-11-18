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
	MiyoFilters = require '../entry_template.js'
else
	sinon = @sinon
	Miyo = @Miyo
	MiyoFilters = @MiyoFilters

describe 'template filter', ->
	ms = null
	request = null
	id = null
	stash = null
	beforeEach ->
		dictionary =
			two: 2
			four: '${deep_four}'
			deep_four: 4
		ms = new Miyo(dictionary)
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		ms.filters.value = type: 'data-value', filter: (argument, request, id, stash) -> argument.value
		request = sinon.stub()
		id = 'OnTest'
		stash = null
	it 'should process template', ->
		ms.value_filters.push 'entry_template'
		entry =
			filters: ['value', 'entry_template']
			argument:
				value: '1${two}3${four}5'
		ms.call_filters entry, request, id, stash
		.should.eventually.be.equal '12345'
