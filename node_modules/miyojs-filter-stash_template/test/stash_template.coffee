chai = require 'chai'
chai.should()
expect = chai.expect
sinon = require 'sinon'
Miyo = require 'miyojs'
MiyoFilters = require '../stash_template.js'

describe 'template filter', ->
	ms = null
	request = null
	id = null
	stash = null
	beforeEach ->
		ms = new Miyo()
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		ms.filters.value = type: 'data-value', filter: (argument, request, id, stash) -> argument.value
		request = sinon.stub()
		id = 'OnTest'
		stash = null
	it 'should process template', ->
		entry =
			filters: ['value', 'stash_template']
			argument:
				value: '1#{two}3#{four}5'
		stash =
			stash_template:
				two: 2
				four: 4
		return_value = ms.call_filters entry, request, id, stash
		return_value.should.be.equal '12345'
