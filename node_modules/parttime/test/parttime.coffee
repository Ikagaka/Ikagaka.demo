chai = require 'chai'
chai.should()
PartTime = require '../parttime.js'

tzoffset = (new Date()).getTimezoneOffset()
tzs = (if tzoffset < 0 then '+' else '-') + ('00' + (Math.floor -tzoffset / 60)).slice(-2) + ':' + ('00' + (tzoffset % 60)).slice(-2)

describe 'parser', ->
	it 'should parse on correct date', ->
		PartTime.parse('1970-01-01').should.be.deep.equal {year: 1970, month: 1, date: 1}
		PartTime.parse('1970-1-1').should.be.deep.equal {year: 1970, month: 1, date: 1}
		PartTime.parse('1970-2-30').should.be.deep.equal {year: 1970, month: 2, date: 30}
		PartTime.parse('1970-2-*').should.be.deep.equal {year: 1970, month: 2}
		PartTime.parse('1970-*-*').should.be.deep.equal {year: 1970}
		PartTime.parse('*-2-10').should.be.deep.equal {month: 2, date: 10}
		PartTime.parse('2-10').should.be.deep.equal {month: 2, date: 10}
		PartTime.parse('*-*-31').should.be.deep.equal {date: 31}
		PartTime.parse('*-2-*').should.be.deep.equal {month: 2}
		PartTime.parse('*-*-*').should.be.deep.equal {}
	it 'should parse on correct time', ->
		PartTime.parse('00:00:00.000').should.be.deep.equal {hour: 0, minute: 0, second: 0, millisecond: 0}
		PartTime.parse('T00:00:00.000').should.be.deep.equal {hour: 0, minute: 0, second: 0, millisecond: 0}
		PartTime.parse('0:0:0.0').should.be.deep.equal {hour: 0, minute: 0, second: 0, millisecond: 0}
		PartTime.parse('10:02:0.999').should.be.deep.equal {hour: 10, minute: 2, second: 0, millisecond: 999}
		PartTime.parse('10:02').should.be.deep.equal {hour: 10, minute: 2}
		PartTime.parse('10:02:45').should.be.deep.equal {hour: 10, minute: 2, second: 45}
		PartTime.parse('00:00:00.*').should.be.deep.equal {hour: 0, minute: 0, second: 0}
		PartTime.parse('00:00:*.*').should.be.deep.equal {hour: 0, minute: 0}
		PartTime.parse('00:00:*').should.be.deep.equal {hour: 0, minute: 0}
		PartTime.parse('00:00').should.be.deep.equal {hour: 0, minute: 0}
		PartTime.parse('0:*').should.be.deep.equal {hour: 0}
		PartTime.parse('*:00:00.*').should.be.deep.equal {minute: 0, second: 0}
		PartTime.parse('*:*:00.*').should.be.deep.equal {second: 0}
		PartTime.parse('*:*:00').should.be.deep.equal {second: 0}
		PartTime.parse('*:*:*.45').should.be.deep.equal {millisecond: 45}
		PartTime.parse('*:*:*.*').should.be.deep.equal {}
		PartTime.parse('*:*:*').should.be.deep.equal {}
		PartTime.parse('*:*').should.be.deep.equal {}
	it 'should parse on correct datetime', ->
		PartTime.parse('1970-01-01T0:0:0.0').should.be.deep.equal {year: 1970, month: 1, date: 1, hour: 0, minute: 0, second: 0, millisecond: 0}
		PartTime.parse('*-*-01T06:30').should.be.deep.equal { date: 1, hour: 6, minute: 30}
	it 'should throw on wrong input', ->
		(-> PartTime.parse('1970-*-10')).should.throw /two part/
		(-> PartTime.parse('*-*-10T5:*:6')).should.throw /two part/
		(-> PartTime.parse('00:08.06')).should.throw /Invalid/
		(-> PartTime.parse('t00:08')).should.throw /Invalid/
		(-> PartTime.parse('42')).should.throw /Invalid/
		(-> PartTime.parse('12:*:45.*')).should.throw /two part/

describe 'constructor', ->
	it 'should work with no arguments', ->
		(-> p = new PartTime()).should.not.throw()
	it 'should work with an argument', ->
		pe = new PartTime()
		pe.date = 1
		pe.hour = 6
		pe.minute = 30
		pa = new PartTime('*-*-01T06:30')
		(pa).should.be.deep.equal pe

describe 'compare', ->
	it 'date should work', ->
		p = new PartTime '1970-01-01'
		p.compare(new Date('1970-01-01')).should.be.equal 0
		p.compare(new Date('1970-01-02')).should.be.below 0
		p.compare(new Date('1970-01-01T06:00:00')).should.be.equal 0
	it 'date should work', ->
		p = new PartTime '*-01-01'
		p.compare(new Date('1970-01-01')).should.be.equal 0
		p.compare(new Date('1970-01-02')).should.be.below 0
		p.compare(new Date('1970-01-01T06:00:00')).should.be.equal 0
	it 'date should work', ->
		p = new PartTime '*-02-*'
		p.compare(new Date('1970-02-01')).should.be.equal 0
		p.compare(new Date('1969-12-31')).should.be.below 0
		p.compare(new Date('1970-01-01')).should.be.above 0
	it 'time should work', ->
		p = new PartTime '02:09'
		p.compare(new Date("1969-12-31T00:00:00#{tzs}")).should.be.above 0
		p.compare(new Date("1970-01-01T06:00:00#{tzs}")).should.be.below 0
		p.compare(new Date("1970-01-01T00:59:00#{tzs}")).should.be.above 0
		p.compare(new Date("1970-01-01T02:09:01#{tzs}")).should.be.equal 0
	it 'datetime should work', ->
		p = new PartTime '*-*-10T02:*'
		p.compare(new Date("1969-12-09:23:00#{tzs}")).should.be.above 0
		p.compare(new Date("1969-12-10T00:00:00#{tzs}")).should.be.above 0
		p.compare(new Date("1970-01-10T02:00:00#{tzs}")).should.be.equal 0
		p.compare(new Date("1970-01-10T00:59:00#{tzs}")).should.be.above 0
		p.compare(new Date("1970-01-10T03:09:01#{tzs}")).should.be.below 0
	it 'none should work', ->
		p = new PartTime '*-*-*'
		p.compare(new Date('1970-02-01')).should.be.equal 0
		p.compare(new Date('1969-12-31')).should.be.equal 0
		p.compare(new Date('1970-01-01')).should.be.equal 0
		p.compare(new Date('1970-01-01T06:00:00')).should.be.equal 0

describe 'toString', ->
	it 'should work', ->
		(new PartTime('10:02:0.999')).toString().should.be.equal '*-*-*T10:02:00.999'
		(new PartTime('*-*-01T06:30')).toString().should.be.equal '*-*-01T06:30:*.*'
