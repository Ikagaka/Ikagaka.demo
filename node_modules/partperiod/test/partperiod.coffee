chai = require 'chai'
chai.should()
PartTime = require 'parttime'
PartPeriod = require '../partperiod.js'

tzoffset = (new Date()).getTimezoneOffset()
tzs = (if tzoffset < 0 then '+' else '-') + ('00' + (Math.floor -tzoffset / 60)).slice(-2) + ':' + ('00' + (tzoffset % 60)).slice(-2)

describe 'parser', ->
	periods = [
		{begin: '1970-01-01T0:0:0.0', end: '1971-01-01T0:0:0.0'}
		{begin: '*-*-*', end: '*-*-*'}
		{begin: '*-*-*', end: '2014-*-*'}
		{begin: '*-12-10', end: '*-*-*'}
		{begin: '*-01-01', end: '*-01-04'}
		{begin: '00:30', end: '00:45'}
		{begin: '*-*-10T15:30:*', end: '*-*-10T17:45'}
		{begin: '*-*-10T15:30:12.009', end: '*-*-10T17:45:12.009'}
	]
	it 'should parse on correct datetime', ->
		for period in periods
			console.warn period
			console.warn period.begin + '/' + period.end
			PartPeriod.parse(period.begin + '/' + period.end).should.be.deep.equal {begin: new PartTime(period.begin), end: new PartTime(period.end)}
	it 'should throw on wrong input', ->
		(-> PartPeriod.parse('')).should.throw /Invalid/
		(-> PartPeriod.parse('00:08.06')).should.throw /Invalid/
		(-> PartPeriod.parse('1990-*-*/1989-*-*')).should.throw /later/

describe 'constructor', ->
	it 'should work with no arguments', ->
		(-> p = new PartPeriod()).should.not.throw()
	it 'should work with an argument', ->
		pe = new PartPeriod()
		pe.begin = new PartTime '*-01-01'
		pe.end = new PartTime '*-01-04'
		pa = new PartPeriod('*-01-01/*-01-04')
		(pa).should.be.deep.equal pe

describe 'includes()', ->
	it 'should work', ->
		p = new PartPeriod '*-01-01/*-01-03'
		p.includes(new Date("1969-12-09:23:00#{tzs}")).should.be.false
		p.includes(new Date("1969-01-03T00:00:00#{tzs}")).should.be.true
		p.includes(new Date("1970-01-01T02:00:00#{tzs}")).should.be.true
	it 'should work with infinity', ->
		p = new PartPeriod '*-12-01/*-*-*'
		p.includes(new Date("1969-12-09:23:00#{tzs}")).should.be.true
		p.includes(new Date("1969-01-03T00:00:00#{tzs}")).should.be.false
		p.includes(new Date("1970-01-01T02:00:00#{tzs}")).should.be.false
	it 'should work with infinity', ->
		p = new PartPeriod '*-*-*/*-6-1'
		p.includes(new Date("1969-12-09:23:00#{tzs}")).should.be.false
		p.includes(new Date("1969-06-01T00:00:00#{tzs}")).should.be.true
		p.includes(new Date("1970-01-01T02:00:00#{tzs}")).should.be.true

describe 'toString', ->
	it 'should work', ->
		(new PartPeriod('*-01-01/*-01-03')).toString().should.be.equal '*-01-01T*:*:*.*/*-01-03T*:*:*.*'
