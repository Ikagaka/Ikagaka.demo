Function::property = (properties) ->
	for property, descriptions of properties
		Object.defineProperty @prototype, property, descriptions

ShioriJK.Message = {}

# SHIORI Request Message Container
class ShioriJK.Message.Request
	# initialize inner containers
	# @param options [Hash]
	# @option options [Boolean] no_prepare do not prepare RequestLine and Headers by the constructor
	constructor : (options) ->
		unless options? and options.no_prepare
			@request_line = new ShioriJK.RequestLine()
			@headers = new ShioriJK.Headers.Request()
	# @property [ShioriJK.RequestLine] RequestLine Container
	request_line: null
	# @property [ShioriJK.Headers.Request] Headers Container
	headers: null
	# Message to string
	# @return [String] message string
	toString : ->
		@request_line.toString() + '\r\n' + @headers.toString() + '\r\n'

# SHIORI Response Message Container
class ShioriJK.Message.Response
	# initialize inner containers
	# @param options [Hash]
	# @option options [Boolean] no_prepare do not prepare StatusLine and Headers by the constructor
	constructor : (options) ->
		unless options? and options.no_prepare
			@status_line = new ShioriJK.StatusLine()
			@headers = new ShioriJK.Headers.Response()
	# @property [ShioriJK.RequestLine] StatusLine Container
	status_line: null
	# @property [ShioriJK.Headers.Request] Headers Container
	headers: null
	# Message to string
	# @return [String] message string
	toString : ->
		@status_line.toString() + '\r\n' + @headers.toString() + '\r\n'

# SHIORI Request Message's RequestLine Container
class ShioriJK.RequestLine
	constructor : ->
		@arguments = {}
	# @property [String] request method
	method: null
	# @property [String] protocol
	protocol: null
	# @property [String] version
	version: null
	@property
		method :
			get : -> @arguments.method
			set : (method) ->
				if method? and @version?
					@validate_method_version method, @version
				else if method?
					switch method
						when 'GET', 'NOTIFY', 'GET Version', 'GET Sentence', 'GET Word', 'GET Status', 'TEACH', 'GET String', 'NOTIFY OwnerGhostName', 'TRANSLATE Sentence'
						else
							throw 'Invalid protocol method : ' + method
				@arguments.method = method
		protocol :
			get : -> @arguments.protocol
			set : (protocol) ->
				if protocol? and protocol != 'SHIORI'
					throw 'Invalid protocol : ' + protocol
				@arguments.protocol = protocol
		version :
			get : -> @arguments.version
			set : (version) ->
				if @method? and version?
					@validate_method_version @method, version
				else if version?
					switch version
						when '2.0', '2.2', '2.3', '2.4', '2.5', '2.6', '3.0'
						else
							throw 'Invalid protocol version : ' + version
				@arguments.version = version
	# validate
	# @param method [String] method name == 'SHIORI'
	# @param version [Number] version
	# @throw [String] if invalid
	validate_method_version : (method, version) ->
		is_valid = false
		switch version
			when '2.0'
				switch method
					when 'GET Version', 'NOTIFY', 'GET Sentence', 'GET Word', 'GET Status'
						is_valid = true
			when '2.2'
				switch method
					when 'GET Sentence'
						is_valid = true
			when '2.3'
				switch method
					when 'NOTIFY', 'GET Sentence'
						is_valid = true
			when '2.4'
				switch method
					when 'TEACH'
						is_valid = true
			when '2.5'
				switch method
					when 'GET String'
						is_valid = true
			when '2.6' # spec is unknown
				switch method
					when 'GET Sentence', 'GET Status', 'GET String', 'NOTIFY OwnerGhostName', 'GET Version', 'TRANSLATE Sentence'
						is_valid = true
			when '3.0'
				switch method
					when 'GET', 'NOTIFY'
						is_valid = true
		unless is_valid
			throw 'Invalid protocol method and version : ' + method + ' SHIORI/' + version
	# Message to string
	# @return [String] message string
	toString : ->
		"#{@method} #{@protocol}/#{@version}"

# SHIORI Response Message's StatusLine Container
class ShioriJK.StatusLine
	constructor : ->
		@arguments = {protocol: 'SHIORI'}
	# @property [String] status code
	code: null
	# @property [String] protocol
	protocol: null
	# @property [String] version
	version: null
	@property
		code :
			get : -> @arguments.code
			set : (code) ->
				if code? and not @message[code]?
					throw 'Invalid response code : ' + code
				@arguments.code = code
		protocol :
			get : -> @arguments.protocol
			set : (protocol) ->
				if protocol? and protocol != 'SHIORI'
					throw 'Invalid protocol : ' + protocol
				@arguments.protocol = protocol
		version :
			get : -> @arguments.version
			set : (version) ->
				if version?
					switch version
						when '2.0', '2.2', '2.3', '2.4', '2.5', '2.6', '3.0'
						else
							throw 'Invalid protocol version : ' + version
				@arguments.version = version
	# Message to string
	# @return [String] message string
	toString : ->
		"#{@protocol}/#{@version} #{@code} #{@message[@code]}"
	# @property [Hash<Number, String>] status messages for status codes
	message:
		200 : 'OK'
		204 : 'No Content'
		310 : 'Communicate'
		311 : 'Not Enough'
		312 : 'Advice'
		400 : 'Bad Request'
		418 : "I'm a tea pot"
		500 : 'Internal Server Error'

# SHIORI Message Headers Container
class ShioriJK.Headers
	constructor : ->
		@header = {}
	# @property [Hash<String, String>] headers
	header: null
	# get header
	# @param name [String] header name
	# @return [String] header value
	get : (name) ->
		if @header[name]?
			@header[name]
	# set header
	# @param name [String] header name
	# @param value [String] header value
	# @return [String] header value
	set : (name, value) ->
		@header[name] = value
	# get header separated by \x01 or some as an array
	# @param name [String] header name
	# @param separator [String] separator characters
	# @return [Array<String>] header values
	get_separated : (name, separator = '\x01') ->
		if @header[name]?
			@header[name].split separator
	# set header separated by \x01 or some as an array
	# @param name [String] header name
	# @param value [Array<String>] header values
	# @param separator [String] separator characters
	# @return [String] header value
	set_separated : (name, value, separator = '\x01') ->
		@header[name] = value.join separator
	# get header separated by \x02 and \x01 or some as an array
	# @param name [String] header name
	# @param separator1 [String] first level separator characters
	# @param separator2 [String] second level separator characters
	# @return [Array<Array<String>>] header values
	get_separated2 : (name, separator1 = '\x02', separator2 = '\x01') ->
		if @header[name]?
			((element.split separator2) for element in @header[name].split separator1)
	# set header separated by \x02 and \x01 or some as an array
	# @param name [String] header name
	# @param value [Array<Array<String>>] header values
	# @param separator1 [String] first level separator characters
	# @param separator2 [String] second level separator characters
	# @return [String] header value
	set_separated2 : (name, value, separator1 = '\x02', separator2 = '\x01') ->
		@header[name] = (element.join separator2 for element in value).join separator1
	# check that headers are line feed free
	# @throw [String] if not
	validate : ->
		for name, value of @header
			if value.match /\n/
				throw 'Invalid header value - line feed found : [' + name + '] : ' + value
	# Message to string
	# @return [String] message string
	toString : ->
		str = ''
		@validate()
		for name, value of @header
			str += "#{name}: #{value}\r\n"
		str

# SHIORI Request Message Headers Container
class ShioriJK.Headers.Request extends ShioriJK.Headers

# SHIORI Response Message Headers Container
class ShioriJK.Headers.Response extends ShioriJK.Headers

