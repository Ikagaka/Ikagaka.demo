chai = require 'chai'
chai.should()
expect = chai.expect
Miyo = require 'miyojs'
MiyoFilters = require '../no_value.js'

describe 'value', ->
	it 'should not return value', ->
		ms = new Miyo()
		for name, filter of MiyoFilters
			ms.filters[name] = filter
		entry =
			filters: ['no_value']
			argument: 'dummy'
		return_argument = ms.call_filters entry, {}, 'OnTest', null
		expect(return_argument).is.undefined
