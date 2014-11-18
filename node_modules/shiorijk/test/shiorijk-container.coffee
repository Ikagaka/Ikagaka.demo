chai = require 'chai'
chai.should()
ShioriJK = require '../lib/shiorijk.js'

describe 'request line', ->
	mrl = null
	beforeEach ->
		mrl = new ShioriJK.RequestLine()
	it 'should throw on wrong input', ->
		(-> mrl.method = 'GETTTTT').should.throw /Invalid/
		(-> mrl.protocol = 'SAORI').should.throw /Invalid/
		(-> mrl.version = '2.9').should.throw /Invalid/
		(-> mrl.protocol = 'SHIORI').should.not.throw /Invalid/
		(-> mrl.version = '3.0').should.not.throw /Invalid/
		(-> mrl.method = 'GET Version').should.throw /Invalid/
		(-> mrl.method = 'GET').should.not.throw /Invalid/
		(-> mrl.version = '2.9').should.throw /Invalid/
		mrl.method.should.be.equal 'GET'
		mrl.protocol.should.be.equal 'SHIORI'
		mrl.version.should.be.equal '3.0'
	it 'should make request line string', ->
		mrl.method = 'GET Version'
		mrl.protocol = 'SHIORI'
		mrl.version = '2.0'
		"#{mrl}".should.to.be.equal 'GET Version SHIORI/2.0'
		mrl.method = null
		mrl.version = '3.0'
		mrl.method = 'GET'
		"#{mrl}".should.to.be.equal 'GET SHIORI/3.0'

describe 'status line', ->
	msl = null
	beforeEach ->
		msl = new ShioriJK.StatusLine()
	it 'should throw on wrong input', ->
		(-> msl.code = 501).should.throw /Invalid/
		(-> msl.protocol = 'SAORI').should.throw /Invalid/
		(-> msl.version = '2.9').should.throw /Invalid/
		(-> msl.code = 500).should.not.throw /Invalid/
		(-> msl.protocol = 'SHIORI').should.not.throw /Invalid/
		(-> msl.version = '3.0').should.not.throw /Invalid/
		msl.code.should.be.equal 500
		msl.protocol.should.be.equal 'SHIORI'
		msl.version.should.be.equal '3.0'
	it 'should make status line string', ->
		msl.code = 500
		msl.protocol = 'SHIORI'
		msl.version = '2.0'
		"#{msl}".should.to.be.equal 'SHIORI/2.0 500 Internal Server Error'
		msl.code = 200
		msl.version = '3.0'
		msl.method = 'GET'
		"#{msl}".should.to.be.equal 'SHIORI/3.0 200 OK'

describe 'headers', ->
	mh = null
	beforeEach ->
		mh = new ShioriJK.Headers.Request()
	it 'should accessable', ->
		mh.set 'ID', 'OnBoot'
		(mh.get 'ID').should.be.equal 'OnBoot'
		(mh.header.ID).should.be.equal 'OnBoot'
		mh.header.Reference6 = 'halt'
		(mh.get 'Reference6').should.be.equal 'halt'
		(mh.header.Reference6).should.be.equal 'halt'
	it 'should handle \\x01', ->
		mh.set 'ID', 'otherghostname'
		mh.set_separated 'Reference0', ['Sakura', '0', '10']
		(mh.get_separated 'Reference0').should.to.deep.equal ['Sakura', '0', '10']
		(mh.get 'Reference0').should.be.equal 'Sakura\x010\x0110'
	it 'should handle \\x02 and \\x01', ->
		sites = [['home', 'http://narazaka.net/', 'narazaka.net.png', 'this is my home'], ['usada', 'http://usada.sakura.vg/', 'usada.png', 'materia']]
		mh.set_separated2 'Value', sites
		(mh.get_separated2 'Value').should.to.deep.equal sites
		(mh.get_separated 'Value', '\x02').should.to.deep.equal ['home\x01http://narazaka.net/\x01narazaka.net.png\x01this is my home', 'usada\x01http://usada.sakura.vg/\x01usada.png\x01materia']
		(mh.get 'Value').should.be.equal 'home\x01http://narazaka.net/\x01narazaka.net.png\x01this is my home\x02usada\x01http://usada.sakura.vg/\x01usada.png\x01materia'
	it 'should make headers string', ->
		mh.header.ID = 'OnBoot'
		mh.header.Reference0 = 'master'
		mh.header.Reference6 = 'halt'
		mh.header.Reference7 = 'さくら'
		"#{mh}".should.to.be.equal '''
			ID: OnBoot
			Reference0: master
			Reference6: halt
			Reference7: さくら
			
		'''.replace /\r?\n/g, '\r\n'
	it 'should throw when toString() if header contains line feed', ->
		mh.header.ID = 'OnTest'
		mh.header.Reference0 = 'foo\nbar'
		(-> "#{mh}").should.throw /line feed/

describe 'request message', ->
	m = null
	mh = null
	mrl = null
	beforeEach ->
		m = new ShioriJK.Message.Request(no_prepare: true)
		mrl = new ShioriJK.RequestLine()
		mh = new ShioriJK.Headers.Request()
		m.request_line = mrl
		m.headers = mh
	it 'should make message string', ->
		mrl.method = 'GET'
		mrl.protocol = 'SHIORI'
		mrl.version = '3.0'
		mh.header.ID = 'OnBoot'
		mh.header.Reference0 = 'master'
		mh.header.Reference6 = 'halt'
		mh.header.Reference7 = 'さくら'
		"#{m}".should.to.be.equal '''
			GET SHIORI/3.0
			ID: OnBoot
			Reference0: master
			Reference6: halt
			Reference7: さくら
			
			
		'''.replace /\r?\n/g, '\r\n'

describe 'response message', ->
	m = null
	mh = null
	msl = null
	beforeEach ->
		m = new ShioriJK.Message.Response()
		msl = m.status_line
		mh = m.headers
		m.status_line = msl
		m.headers = mh
	it 'should make message string', ->
		msl.code = 200
		msl.protocol = 'SHIORI'
		msl.version = '3.0'
		mh.header.Value = '''
			\\h\\s2 うわ。404。 ファイルがないって。\\n \\n ‥‥見捨てられた？\\n \\n \\e
		'''
		"#{m}".should.to.be.equal '''
			SHIORI/3.0 200 OK
			Value: \\h\\s2 うわ。404。 ファイルがないって。\\n \\n ‥‥見捨てられた？\\n \\n \\e
			
			
		'''.replace /\r?\n/g, '\r\n'
