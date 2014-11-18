chai = require 'chai'
chai.should()
expect = chai.expect
sinon = require 'sinon'
Miyo = require 'miyojs'
MiyoFilters = require '../autotalks.js'

describe 'caller', ->
	ms = null
	request = null
	id = null
	to_id = null
	random = null
	beforeEach ->
		ms = new Miyo({})
		initialize_entry =
			filters: ['miyo_require_filters', 'property_initialize', 'variables_initialize']
			argument:
				miyo_require_filters: ['property', 'variables']
				property_initialize:
					handlers: ['coffee', 'jse', 'js']
		ms.call_filters initialize_entry, null, '_load'
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		sinon.spy ms, 'call_id'
		request = sinon.stub()
		id = 'OnTest'
		to_id = 'OnTest2'
		random = sinon.stub Math, 'random'
	afterEach ->
		random.restore()
	it 'should work with only id', ->
		entry =
			filters: ['autotalks_caller']
			argument:
				autotalks_caller:
					id: to_id
		random.returns 0
		ms.call_filters entry, request, id, null
		stash = {autotalks_trigger: true}
		ms.call_id.getCall(0).args[2].should.be.deep.equal stash
		ms.call_filters entry, request, id, null
		ms.call_id.getCall(1).args[2].should.be.deep.equal stash
	it 'should work with count', ->
		entry =
			filters: ['autotalks_caller']
			argument:
				autotalks_caller:
					id: to_id
					count: 2
		random.returns 0
		ms.call_filters entry, request, id, null
		ms.call_id.getCall(0).args[2].should.be.deep.equal autotalks_trigger: false
		ms.call_filters entry, request, id, null
		ms.call_id.getCall(1).args[2].should.be.deep.equal autotalks_trigger: false
		ms.call_filters entry, request, id, null
		ms.call_id.getCall(2).args[2].should.be.deep.equal autotalks_trigger: true
		ms.call_filters entry, request, id, null
		ms.call_id.getCall(3).args[2].should.be.deep.equal autotalks_trigger: false
		ms.call_filters entry, request, id, null
		ms.call_id.getCall(4).args[2].should.be.deep.equal autotalks_trigger: false
		ms.call_filters entry, request, id, null
		ms.call_id.getCall(5).args[2].should.be.deep.equal autotalks_trigger: true
	it 'should work with count and fluctuation', ->
		entry =
			filters: ['autotalks_caller']
			argument:
				autotalks_caller:
					id: to_id
					count: 5
					fluctuation: 2
		random.returns 0
		ms.call_filters entry, request, id, null
		ms.call_id.getCall(0).args[2].should.be.deep.equal autotalks_trigger: false
		ms.call_filters entry, request, id, null
		ms.call_id.getCall(1).args[2].should.be.deep.equal autotalks_trigger: false
		ms.call_filters entry, request, id, null
		ms.call_id.getCall(2).args[2].should.be.deep.equal autotalks_trigger: false
		ms.call_filters entry, request, id, null
		ms.call_id.getCall(3).args[2].should.be.deep.equal autotalks_trigger: true
		random.returns 0.7
		ms.call_filters entry, request, id, null
		ms.call_id.getCall(4).args[2].should.be.deep.equal autotalks_trigger: false
		ms.call_filters entry, request, id, null
		ms.call_id.getCall(5).args[2].should.be.deep.equal autotalks_trigger: false
		ms.call_filters entry, request, id, null
		ms.call_id.getCall(6).args[2].should.be.deep.equal autotalks_trigger: false
		ms.call_filters entry, request, id, null
		ms.call_id.getCall(7).args[2].should.be.deep.equal autotalks_trigger: false
		ms.call_filters entry, request, id, null
		ms.call_id.getCall(8).args[2].should.be.deep.equal autotalks_trigger: false
		ms.call_filters entry, request, id, null
		ms.call_id.getCall(9).args[2].should.be.deep.equal autotalks_trigger: false
		ms.call_filters entry, request, id, null
		ms.call_id.getCall(10).args[2].should.be.deep.equal autotalks_trigger: true

describe 'do with no "when"', ->
	ms = null
	request = null
	id = null
	random = null
	beforeEach ->
		ms = new Miyo({})
		initialize_entry =
			filters: ['miyo_require_filters', 'property_initialize', 'variables_initialize']
			argument:
				miyo_require_filters: ['property', 'variables']
				property_initialize:
					handlers: ['coffee', 'jse', 'js']
		ms.call_filters initialize_entry, null, '_load'
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		ms.filters['null'] = type: 'data-value', filter: -> null
		request = sinon.stub()
		id = 'OnTest'
		random = sinon.stub Math, 'random'
	afterEach ->
		random.restore()
	it 'should work with no other properties', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do 1'
					}
					{
						do: 'do 2'
					}
				]
		random.returns 0
		ms.call_filters(entry, request, id, null).should.deep.equal 'do 1'
	it 'should work with bias', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do 1'
					}
					{
						do: 'do 2'
						'bias.jse': '1 + 1'
					}
					{
						do: 'do 3'
						bias: 7
					}
				]
		random.returns 0.3
		ms.call_filters(entry, request, id, null).should.deep.equal 'do 3'
		random.returns 0.09
		ms.call_filters(entry, request, id, null).should.deep.equal 'do 1'
		random.returns 0.1
		ms.call_filters(entry, request, id, null).should.deep.equal 'do 2'
		random.returns 0.29
		ms.call_filters(entry, request, id, null).should.deep.equal 'do 2'
	it 'should work with bias with null', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do 1'
					}
					{
						do:
							filters: ['null']
						bias: 2
					}
					{
						do: 'do 3'
						bias: 7
					}
				]
		random.returns 0.3
		ms.call_filters(entry, request, id, null).should.deep.equal 'do 3'
		random.returns 0.09
		ms.call_filters(entry, request, id, null).should.deep.equal 'do 1'
		random.returns 0.1
		console.log ms.call_filters(entry, request, id, null)
		ms.call_filters(entry, request, id, null).should.deep.equal 'do 1'
		random.returns 0.29
		ms.call_filters(entry, request, id, null).should.deep.equal 'do 3'
	it 'should throw with wrong bias', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do 1'
					}
					{
						do: 'do 2'
						'bias.jse': '"a"'
					}
					{
						do: 'do 3'
						bias: 7
					}
				]
		random.returns 0.3
		(-> ms.call_filters(entry, request, id, null)).should.throw /bias must be numeric/
	it 'should throw with wrong bias 2', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do 1'
					}
					{
						do: 'do 2'
						'bias.jse': 'a'
					}
					{
						do: 'do 3'
						bias: 7
					}
				]
		random.returns 0.3
		(-> ms.call_filters(entry, request, id, null)).should.throw /bias execute error/
	it 'should work with priority', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do 1'
					}
					{
						do: 'do 2'
						priority: 1
						bias: 3
					}
					{
						do: 'do 3'
						priority: 1
						bias: 7
					}
				]
		random.returns 0.3
		ms.call_filters(entry, request, id, null).should.deep.equal 'do 3'
		random.returns 0.0
		ms.call_filters(entry, request, id, null).should.deep.equal 'do 2'
		random.returns 0.29
		ms.call_filters(entry, request, id, null).should.deep.equal 'do 2'
	it 'should work with priority that has null', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do 1'
					}
					{
						do: 'do 2'
						priority: 1
						bias: 3
					}
					{
						do: 'do 3'
						priority: 1
						bias: 7
					}
					{
						do:
							filters: ['null']
						priority: 2
						bias: 7
					}
				]
		random.returns 0.3
		ms.call_filters(entry, request, id, null).should.deep.equal 'do 3'
		random.returns 0.0
		ms.call_filters(entry, request, id, null).should.deep.equal 'do 2'
		random.returns 0.29
		ms.call_filters(entry, request, id, null).should.deep.equal 'do 2'
	it 'should throw with wrong priority', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do 1'
					}
					{
						do: 'do 2'
						'priority.jse': '"a"'
						bias: 3
					}
					{
						do: 'do 3'
						priority: 1
						bias: 7
					}
				]
		random.returns 0.3
		(-> ms.call_filters(entry, request, id, null)).should.throw /numeric/
	it 'should throw with wrong priority 2', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do 1'
					}
					{
						do: 'do 2'
						'priority.jse': 'a'
						bias: 3
					}
					{
						do: 'do 3'
						priority: 1
						bias: 7
					}
				]
		random.returns 0.3
		(-> ms.call_filters(entry, request, id, null)).should.throw /priority execute error/

describe 'chain with no "when"', ->
	ms = null
	request = null
	id = null
	random = null
	beforeEach ->
		ms = new Miyo({})
		initialize_entry =
			filters: ['miyo_require_filters', 'property_initialize', 'variables_initialize']
			argument:
				miyo_require_filters: ['property', 'variables']
				property_initialize:
					handlers: ['coffee', 'jse', 'js']
		ms.call_filters initialize_entry, null, '_load'
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		sinon.spy ms, 'call_value'
		request = sinon.stub()
		id = 'OnTest'
		random = sinon.stub Math, 'random'
	afterEach ->
		random.restore()
	it 'should work with no other properties', ->
		id2 = 'OnTest2'
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						chain: [ 'chain 1-1', 'chain 1-2' ]
					}
					{
						chain: [ 'chain 2' ]
					}
				]
		random.returns 0
		ms.call_filters(entry, request, id, null).should.deep.equal 'chain 1-1'
		random.returns 0.7
		ms.call_filters(entry, request, id, null).should.deep.equal 'chain 1-2'
		ms.call_filters(entry, request, id, null).should.deep.equal 'chain 2'
		ms.call_filters(entry, request, id, null).should.deep.equal 'chain 2'
		random.returns 0
		ms.call_filters(entry, request, id, null).should.deep.equal 'chain 1-1'
		expect(ms.call_filters(entry, request, id2, null)).is.undefined
		ms.call_filters(entry, request, id, null).should.deep.equal 'chain 1-2'

describe 'do with when.once/when.once_per_boot', ->
	ms = null
	request = null
	id = null
	random = null
	beforeEach ->
		ms = new Miyo({})
		initialize_entry =
			filters: ['miyo_require_filters', 'property_initialize', 'variables_initialize']
			argument:
				miyo_require_filters: ['property', 'variables']
				property_initialize:
					handlers: ['coffee', 'jse', 'js']
		ms.call_filters initialize_entry, null, '_load'
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		request = sinon.stub()
		id = 'OnTest'
		random = sinon.stub Math, 'random'
	afterEach ->
		random.restore()
	it 'should work', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do 1'
						when:
							once: 'onceid'
					}
					{
						do: 'do 2'
						when:
							once: 'onceid'
					}
					{
						do: 'do 3'
						when:
							once: 'onceid2'
					}
					{
						do: 'do 4'
						when:
							once_per_boot: 'onceid'
					}
					{
						do: 'do 5'
						when:
							once_per_boot: 'onceid2'
					}
					{
						do: 'do 6'
					}
				]
		random.returns 0
		ms.call_filters(entry, request, id, null).should.be.equal 'do 1'
		ms.call_filters(entry, request, id, null).should.be.equal 'do 3'
		ms.call_filters(entry, request, id, null).should.be.equal 'do 4'
		ms.call_filters(entry, request, id, null).should.be.equal 'do 5'
		ms.call_filters(entry, request, id, null).should.be.equal 'do 6'
		ms.call_filters(entry, request, id, null).should.be.equal 'do 6'

describe 'do with when.period', ->
	ms = null
	request = null
	id = null
	random = null
	clock = null
	beforeEach ->
		ms = new Miyo({})
		initialize_entry =
			filters: ['miyo_require_filters', 'property_initialize', 'variables_initialize']
			argument:
				miyo_require_filters: ['property', 'variables']
				property_initialize:
					handlers: ['coffee', 'jse', 'js']
		ms.call_filters initialize_entry, null, '_load'
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		request = sinon.stub()
		clock = sinon.useFakeTimers()
		id = 'OnTest'
		random = sinon.stub Math, 'random'
	afterEach ->
		random.restore()
		clock.restore()
	it 'should work with .jse', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do when'
						when:
							'period.jse': '@1970-*-*/1970-*-*@ && (new PartPeriod("*:*:0/*:*:1")).includes(date)'
					}
					{
						do: 'do always'
					}
				]
		random.returns 0
		ms.call_filters(entry, request, id, null).should.be.equal 'do when'
	it 'should work with .js', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do when'
						when:
							'period.js': 'return @1970-*-*/1970-*-*@ && (new PartPeriod("*:*:0/*:*:1")).includes(date)'
					}
					{
						do: 'do always'
					}
				]
		random.returns 0
		ms.call_filters(entry, request, id, null).should.be.equal 'do when'
	it 'should work with .coffee', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do when'
						when:
							'period.coffee': '@1970-*-*/1970-*-*@ && (new PartPeriod("*:*:0/*:*:1")).includes(date)'
					}
					{
						do: 'do always'
					}
				]
		random.returns 0
		ms.call_filters(entry, request, id, null).should.be.equal 'do when'
	it 'should work with .* extra stash', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do when'
						when:
							'period.js': '''return (stash.dummy == 'dummy') && (new PartPeriod('1970-*-*/1970-*-*')).includes(date)'''
					}
					{
						do: 'do always'
					}
				]
		random.returns 0
		ms.call_filters(entry, request, id, dummy: 'dummy').should.be.equal 'do when'
	it 'should throw on wrong .*', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do when'
						when:
							'period.jse': 'return @1970-*-*/1970-*-*@ && @*:*:0/*:*:1@'
					}
					{
						do: 'do always'
					}
				]
		random.returns 0
		(-> ms.call_filters(entry, request, id, null)).should.throw /period execute error/
	it 'should work', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do single'
						when:
							'period.jse': '@*:0:*/*:0:*@'
					}
					{
						do: 'do and'
						when:
							'period.jse': '@1970-*-*/1970-*-*@ && @*:*:0/*:*:1@'
					}
					{
						do: 'do always'
					}
				]
		random.returns 0
		ms.call_filters(entry, request, id, null).should.be.equal 'do single'
		random.returns 0.5
		ms.call_filters(entry, request, id, null).should.be.equal 'do and'
		random.returns 0.9
		ms.call_filters(entry, request, id, null).should.be.equal 'do always'
		clock.tick 2 * 1000
		random.returns 0
		ms.call_filters(entry, request, id, null).should.be.equal 'do single'
		random.returns 0.5
		ms.call_filters(entry, request, id, null).should.be.equal 'do always'
		random.returns 0.9
		ms.call_filters(entry, request, id, null).should.be.equal 'do always'
		clock.tick 58 * 1000
		random.returns 0
		ms.call_filters(entry, request, id, null).should.be.equal 'do and'
		random.returns 0.5
		ms.call_filters(entry, request, id, null).should.be.equal 'do always'
		random.returns 0.9
		ms.call_filters(entry, request, id, null).should.be.equal 'do always'

describe 'do with when.condition', ->
	ms = null
	request = null
	id = null
	random = null
	beforeEach ->
		ms = new Miyo({})
		initialize_entry =
			filters: ['miyo_require_filters', 'property_initialize', 'variables_initialize']
			argument:
				miyo_require_filters: ['property', 'variables']
				property_initialize:
					handlers: ['coffee', 'jse', 'js']
		ms.call_filters initialize_entry, null, '_load'
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		request = sinon.stub()
		id = 'OnTest'
		random = sinon.stub Math, 'random'
	afterEach ->
		random.restore()
	it 'should throw on wrong .*', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do when'
						when:
							'condition.jse': 'a'
					}
					{
						do: 'do always'
					}
				]
		random.returns 0
		(-> ms.call_filters(entry, request, id, null)).should.throw /condition execute error/
	it 'should work', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do false'
						when:
							'condition.jse': 'false'
					}
					{
						do: 'do true'
						when:
							'condition.jse': 'true'
					}
					{
						do: 'do OnTest2'
						when:
							'condition.jse': 'id == "OnTest2"'
					}
				]
		random.returns 0
		ms.call_filters(entry, request, id, null).should.be.equal 'do true'
		random.returns 0.9
		ms.call_filters(entry, request, id, null).should.be.equal 'do true'
		random.returns 0.9
		ms.call_filters(entry, request, 'OnTest2', null).should.be.equal 'do OnTest2'

describe 'autotalk called with trigger', ->
	ms = null
	request = null
	id = null
	random = null
	beforeEach ->
		ms = new Miyo({})
		initialize_entry =
			filters: ['miyo_require_filters', 'property_initialize', 'variables_initialize']
			argument:
				miyo_require_filters: ['property', 'variables']
				property_initialize:
					handlers: ['coffee', 'jse', 'js']
		ms.call_filters initialize_entry, null, '_load'
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		request = sinon.stub()
		id = 'OnTest'
		random = sinon.stub Math, 'random'
	afterEach ->
		random.restore()
	it 'should work on no trigger', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do'
					}
				]
		random.returns 0
		ms.call_filters(entry, request, id, null).should.be.equal 'do'
	it 'should work on true trigger', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do'
					}
				]
		stash =
			autotalks_trigger: true
		random.returns 0
		ms.call_filters(entry, request, id, stash).should.be.equal 'do'
	it 'should not work on false trigger', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do'
					}
				]
		stash =
			autotalks_trigger: false
		random.returns 0
		expect(ms.call_filters(entry, request, id, stash)).be.undefined
	it 'should work with justtime and false trigger', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do 1'
						priority: 1
					}
					{
						do: 'do justtime'
						when:
							justtime: 1
					}
				]
		stash =
			autotalks_trigger: false
		random.returns 0
		ms.call_filters(entry, request, id, stash).should.be.equal 'do justtime'
	it 'should work with justtime and true trigger', ->
		entry =
			filters: ['autotalks']
			argument:
				autotalks: [
					{
						do: 'do 1'
						priority: 1
					}
					{
						do: 'do justtime'
						when:
							justtime: 1
					}
				]
		stash =
			autotalks_trigger: true
		random.returns 0
		ms.call_filters(entry, request, id, stash).should.be.equal 'do 1'
