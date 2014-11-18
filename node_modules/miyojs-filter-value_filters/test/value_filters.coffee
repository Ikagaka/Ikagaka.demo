chai = require 'chai'
chai.should()
expect = chai.expect
sinon = require 'sinon'
Miyo = require 'miyojs'
MiyoFilters = require '../value_filters.js'

describe 'set_value_filters', ->
	ms = null
	request = null
	id = null
	stash = null
	entry = null
	beforeEach ->
		ms = new Miyo()
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		request = sinon.stub()
		id = 'OnTest'
		stash = null
		entry =
			filters: ['set_value_filters']
			argument:
				set_value_filters: ['talking']
				dummy: 'dummy'
	it 'should return original argument', ->
		return_argument = ms.call_filters entry, null, '_load'
		return_argument.should.be.deep.equal entry.argument
	it 'should work', ->
		ms.value_filters.push 'pre'
		ms.call_filters entry, null, '_load'
		ms.value_filters.should.be.deep.equal entry.argument.set_value_filters

describe 'append_value_filters', ->
	ms = null
	request = null
	id = null
	stash = null
	entry = null
	beforeEach ->
		ms = new Miyo()
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		request = sinon.stub()
		id = 'OnTest'
		stash = null
		entry =
			filters: ['append_value_filters']
			argument:
				dummy: 'dummy'
	it 'should return original argument', ->
		entry.argument.append_value_filters = ['filter1']
		return_argument = ms.call_filters entry, null, '_load'
		return_argument.should.be.deep.equal entry.argument
	it 'should work', ->
		ms.value_filters.push 'pre'
		entry.argument.append_value_filters = ['filter1', 'filter2']
		ms.call_filters entry, null, '_load'
		ms.value_filters.should.be.deep.equal ['pre', 'filter1', 'filter2']

describe 'prepend_value_filters', ->
	ms = null
	request = null
	id = null
	stash = null
	entry = null
	beforeEach ->
		ms = new Miyo()
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		request = sinon.stub()
		id = 'OnTest'
		stash = null
		entry =
			filters: ['prepend_value_filters']
			argument:
				dummy: 'dummy'
	it 'should return original argument', ->
		entry.argument.prepend_value_filters = ['filter1']
		return_argument = ms.call_filters entry, null, '_load'
		return_argument.should.be.deep.equal entry.argument
	it 'should work', ->
		ms.value_filters.push 'pre'
		entry.argument.prepend_value_filters = ['filter1', 'filter2']
		ms.call_filters entry, null, '_load'
		ms.value_filters.should.be.deep.equal ['filter2', 'filter1', 'pre']

describe 'remove_value_filters', ->
	ms = null
	request = null
	id = null
	stash = null
	entry = null
	beforeEach ->
		ms = new Miyo()
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		request = sinon.stub()
		id = 'OnTest'
		stash = null
		entry =
			filters: ['remove_value_filters']
			argument:
				dummy: 'dummy'
	it 'should return original argument', ->
		entry.argument.remove_value_filters = ['filter1']
		return_argument = ms.call_filters entry, null, '_load'
		return_argument.should.be.deep.equal entry.argument
	it 'should work', ->
		ms.value_filters.push 'pre1', 'pre2', 'pre3', 'pre4', 'pre5', 'pre6'
		entry.argument.remove_value_filters = ['pre5', 'pre2']
		ms.call_filters entry, null, '_load'
		ms.value_filters.should.be.deep.equal ['pre1', 'pre3', 'pre4', 'pre6']
