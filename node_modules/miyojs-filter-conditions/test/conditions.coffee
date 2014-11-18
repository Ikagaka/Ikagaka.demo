chai = require 'chai'
chai.should()
expect = chai.expect
sinon = require 'sinon'
Miyo = require 'miyojs'
MiyoFilters = require '../conditions.js'

describe 'caller', ->
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
		sinon.spy ms, 'call_entry'
		request = sinon.stub()
		id = 'OnTest'
		stash = null
	it 'should return undefined with no conditions', ->
		entry =
			filters: ['conditions']
		ret = ms.call_filters entry, request, id, stash
		expect(ret).is.undefined
		ms.call_entry.callCount.should.be.equal 0
	it 'should work with true', ->
		entry =
			filters: ['conditions']
			argument:
				conditions: [
					{
						when: 1
						do: 'y'
					}
					{
						when: 1
						do: 'n'
					}
				]
		ms.call_filters entry, request, id, stash
		ms.call_entry.lastCall.args[0].should.be.deep.equal 'y'
	it 'should return on no match', ->
		entry =
			filters: ['conditions']
			argument:
				conditions: [
					{
						when: 0
						do: 'n'
					}
				]
		ms.call_filters entry, request, id, stash
		ms.call_entry.callCount.should.be.equal 0
	it 'should always take entry which has no "when"', ->
		entry =
			filters: ['conditions']
			argument:
				conditions: [
					{
						when: 0
						do: 'n'
					}
					{
						do: 'y'
					}
				]
		ms.call_filters entry, request, id, stash
		ms.call_entry.lastCall.args[0].should.be.deep.equal 'y'
	it 'should work with code', ->
		entry =
			filters: ['conditions']
			argument:
				conditions: [
					{
						'when.jse': 'false'
						do: 'n1'
					}
					{
						'when.jse': 'id == "OnTest"'
						do: 'y'
					}
					{
						'when.jse': 'true'
						do: 'n2'
					}
				]
		ms.call_filters entry, request, id, stash
		ms.call_entry.lastCall.args[0].should.be.deep.equal 'y'
	it 'should work with code alternative', ->
		entry =
			filters: ['conditions']
			argument:
				conditions: [
					{
						'when.jse': 'false'
						do: 'n1'
					}
					{
						when: 0
						do: 'n2'
					}
					{
						'when.jse': 'false'
						'when.coffee': 'id == "OnTest"'
						do: 'y'
					}
					{
						'when.jse': 'true'
						do: 'n3'
					}
				]
		ms.call_filters entry, request, id, stash
		ms.call_entry.lastCall.args[0].should.be.deep.equal 'y'
