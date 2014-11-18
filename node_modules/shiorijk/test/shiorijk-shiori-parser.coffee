chai = require 'chai'
chai.should()
ShioriJK = require '../lib/shiorijk.js'

describe 'ShioriJK.Shiori.Request.RequestLine.Parser', ->
	p = null
	mrl = null
	beforeEach ->
		p = new ShioriJK.Shiori.Request.RequestLine.Parser()
		mrl = new ShioriJK.RequestLine()
	it 'should throw on wrong input', ->
		(-> p.parse_line '').should.throw /Invalid/
		(-> p.parse_line 'GET Version SHIORI/3.0').should.throw /Invalid/
	it 'should parse request line', ->
		mrl.method = 'GET'
		mrl.protocol = 'SHIORI'
		mrl.version = '3.0'
		p.parse_line mrl.toString()
		.should.to.be.deep.equal
			result: mrl
			state: 'end'
	it 'should parse old request line', ->
		mrl.method = 'GET Version'
		mrl.protocol = 'SHIORI'
		mrl.version = '2.0'
		p.parse_line mrl.toString()
		.should.to.be.deep.equal
			result: mrl
			state: 'end'

describe 'ShioriJK.Shiori.Request.Header.Parser', ->
	p = null
	mh = null
	beforeEach ->
		p = new ShioriJK.Shiori.Request.Header.Parser()
		mh = new ShioriJK.Headers.Request()
	it 'should throw on wrong input', ->
		(-> p.parse_line '').should.not.throw /Invalid/
		(-> p.parse_line 'GET SHIORI/3.0').should.throw /Invalid/
		(-> p.parse_line 'Value:value').should.throw /Invalid/
	it 'should parse headers', ->
		mh.header.ID = 'OnBoot'
		mh.header.Reference0 = 'master'
		mh.header.Reference6 = 'halt'
		mh.header.Reference7 = 'さくら'
		p.parse_chunk "#{mh}\r\n"
		.should.to.be.deep.equal
			results: [mh]
			state: 'end'
		p.parse "#{mh}\r\n"
		.should.to.be.deep.equal mh

describe 'ShioriJK.Shiori.Request.Parser', ->
	p = null
	m = null
	mrl = null
	mh = null
	beforeEach ->
		p = new ShioriJK.Shiori.Request.Parser()
		m = new ShioriJK.Message.Request()
		mrl = new ShioriJK.RequestLine()
		mh = new ShioriJK.Headers.Request()
		m.request_line = mrl
		m.headers = mh
	it 'should throw on wrong input', ->
		(-> p.parse_line '').should.throw /Invalid/
		(-> p.begin_parse()).should.throw /cannot/
		(-> p.end_parse()).should.throw /abort/
		(-> p.begin_parse()).should.not.throw()
		(-> p.end_parse()).should.throw /abort/
		(-> p.parse_line 'aaa').should.throw /Invalid/
	it 'should parse headers', ->
		mrl.method = 'GET'
		mrl.protocol = 'SHIORI'
		mrl.version = '3.0'
		mh.header.ID = 'OnBoot'
		mh.header.Reference0 = 'master'
		mh.header.Reference6 = 'halt'
		mh.header.Reference7 = 'さくら'
		p.parse_chunk "#{m}"
		.should.be.deep.equal
			results: [m]
			state: 'end'
		p.parse "#{m}"
		.should.be.deep.equal m
	it 'should parse headers 2', ->
		mrl.method = 'GET Sentence'
		mrl.protocol = 'SHIORI'
		mrl.version = '2.0'
		p.parse "#{m}"
		.should.be.deep.equal m

describe 'ShioriJK.Shiori.Response.StatusLine.Parser', ->
	p = null
	msl = null
	beforeEach ->
		p = new ShioriJK.Shiori.Response.StatusLine.Parser()
		msl = new ShioriJK.StatusLine()
	it 'should throw on wrong input', ->
		(-> p.parse_line '').should.throw /Invalid/
		(-> p.parse_line 'SHIORI/3.0 512 is 2^9').should.throw /Invalid/
	it 'should parse request line', ->
		msl.protocol = 'SHIORI'
		msl.version = '3.0'
		msl.code = 200
		p.parse_line msl.toString()
		.should.to.be.deep.equal
			result: msl
			state: 'end'
	it 'should parse old request line', ->
		msl.protocol = 'SHIORI'
		msl.version = '2.0'
		msl.code = 204
		p.parse_line msl.toString()
		.should.to.be.deep.equal
			result: msl
			state: 'end'

describe 'ShioriJK.Shiori.Response.Parser', ->
	p = null
	m = null
	msl = null
	mh = null
	beforeEach ->
		p = new ShioriJK.Shiori.Response.Parser()
		m = new ShioriJK.Message.Response()
		msl = new ShioriJK.StatusLine()
		mh = new ShioriJK.Headers.Response()
		m.status_line = msl
		m.headers = mh
	it 'should throw on wrong input', ->
		(-> p.parse_line '').should.throw /Invalid/
		(-> p.begin_parse()).should.throw /cannot/
		(-> p.end_parse()).should.throw /abort/
		(-> p.begin_parse()).should.not.throw()
		(-> p.end_parse()).should.throw /abort/
		(-> p.parse_line 'aaa').should.throw /Invalid/
	it 'should parse headers', ->
		msl.protocol = 'SHIORI'
		msl.version = '3.0'
		msl.code = 200
		mh.header.Value = '\\h\\s[0]なんとか。\\e'
		mh.header.Reference0 = 'さくら'
		p.parse_chunk "#{m}"
		.should.be.deep.equal
			results: [m]
			state: 'end'
		p.parse "#{m}"
		.should.be.deep.equal m
