chai = require 'chai'
chai.should()
expect = chai.expect
sinon = require 'sinon'
Miyo = require 'miyojs'
MiyoFilters = require '../talking.js'

describe 'initialize', ->
	ms = null
	initialize_entry = null
	beforeEach ->
		ms = new Miyo({})
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		initialize_entry =
			filters: ['miyo_require_filters', 'variables_initialize', 'talking_initialize']
			argument:
				miyo_require_filters: ['variables']
				talking_initialize: {}
	it 'should initialize', ->
		initialize_entry.argument.talking_initialize.timeout = 30
		return_argument = ms.call_filters initialize_entry, null, '_load'
		return_argument.should.be.deep.equal initialize_entry.argument
		ms.variables_temporary.talking_timeout.should.be.equal initialize_entry.argument.talking_initialize.timeout
		ms.variables_temporary.talking.should.be.false
		ms.dictionary.OnTalkingFilterTalkBegin.should.exist
		ms.dictionary.OnTalkingFilterTalkEnd.should.exist
	it 'should throw with wrong timeout', ->
		initialize_entry.argument.talking_initialize.timeout = -10
		(-> ms.call_filters initialize_entry, null, '_load').should.throw /must be >= 0/

describe 'talking value filter', ->
	ms = null
	request = null
	id = null
	stash = null
	beforeEach ->
		ms = new Miyo({})
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		ms.value_filters = ['talking']
		request = sinon.stub()
		id = 'OnTest'
		stash = null
	it 'should set value', ->
		value = '\\h\\s[0]test\\e'
		return_value = ms.call_value value, request, id, stash
		return_value.should.be.equal '\\![raise,OnTalkingFilterTalkBegin]' + value.replace(/\\e/, '') + '\\![raise,OnTalkingFilterTalkEnd]' + '\\e'

describe 'talking begin', ->
	ms = null
	initialize_entry = null
	entry = null
	request = null
	id = null
	stash = null
	clock = null
	beforeEach ->
		ms = new Miyo({})
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		initialize_entry =
			filters: ['miyo_require_filters', 'variables_initialize', 'talking_initialize']
			argument:
				miyo_require_filters: ['variables']
				talking_initialize: {}
		entry =
			filters: ['talking_begin']
			argument:
				dummy: 'dummy'
		request = sinon.stub()
		id = 'OnTest'
		stash = null
		clock = sinon.useFakeTimers()
	afterEach ->
		clock.restore()
	it 'should return empty', ->
		ms.call_filters initialize_entry, null, '_load'
		return_value = ms.call_filters entry, request, id, stash
		return_value.should.be.equal ''
	it 'should set flag and set timeout on non-zero timeout', ->
		initialize_entry.argument.talking_initialize.timeout = 30
		ms.call_filters initialize_entry, null, '_load'
		ms.call_filters entry, request, id, stash
		ms.variables_temporary.talking.should.be.true
		expect(ms.variables_temporary.talking_timer).exist
		clock.tick(initialize_entry.argument.talking_initialize.timeout * 1000)
		ms.variables_temporary.talking.should.be.false
	it 'should set flag and not set timeout on zero timeout', ->
		initialize_entry.argument.talking_initialize.timeout = 0
		ms.call_filters initialize_entry, null, '_load'
		ms.call_filters entry, request, id, stash
		ms.variables_temporary.talking.should.be.true
		expect(ms.variables_temporary.talking_timer).not.exist
	it 'should clear previous timer', ->
		initialize_entry.argument.talking_initialize.timeout = 30
		ms.call_filters initialize_entry, null, '_load'
		ms.call_filters entry, request, id, stash
		clock.tick(20 * 1000)
		ms.call_filters entry, request, id, stash
		clock.tick(10 * 1000)
		ms.variables_temporary.talking.should.be.true
		clock.tick(20 * 1000)
		ms.variables_temporary.talking.should.be.false

describe 'talking end', ->
	ms = null
	initialize_entry = null
	entry = null
	request = null
	id = null
	stash = null
	clock = null
	beforeEach ->
		ms = new Miyo({})
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		initialize_entry =
			filters: ['miyo_require_filters', 'variables_initialize', 'talking_initialize']
			argument:
				miyo_require_filters: ['variables']
				talking_initialize:
					timeout: 30
		entry =
			filters: ['talking_end']
			argument:
				dummy: 'dummy'
		request = sinon.stub()
		id = 'OnTest'
		stash = null
		clock = sinon.useFakeTimers()
	afterEach ->
		clock.restore()
	it 'should return empty', ->
		ms.call_filters initialize_entry, null, '_load'
		return_value = ms.call_filters entry, request, id, stash
		return_value.should.be.equal ''
	it 'should unset flag and clear timeout', ->
		ms.call_filters initialize_entry, null, '_load'
		b_entry =
			filters: ['talking_begin']
			argument:
				dummy: 'dummy'
		ms.call_filters b_entry, request, id, stash
		ms.call_filters entry, request, id, stash
		ms.variables_temporary.talking.should.be.false
		ms.variables_temporary.talking = true
		clock.tick(40 * 1000)
		ms.variables_temporary.talking.should.be.true
