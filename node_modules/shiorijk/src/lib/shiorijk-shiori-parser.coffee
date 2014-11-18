ShioriJK.Shiori = {}
ShioriJK.Shiori.Header = {}
ShioriJK.Shiori.Request = {}
ShioriJK.Shiori.Request.RequestLine = {}
ShioriJK.Shiori.Request.Header = {}
ShioriJK.Shiori.Response = {}
ShioriJK.Shiori.Response.StatusLine = {}
ShioriJK.Shiori.Response.Header = {}

# parser base class
class ShioriJK.Shiori.Parser
	# @return [Boolean]
	is_parsing : ->
		not @section.is 'idle'
	# @return [Boolean]
	is_parsing_end : ->
		not @section.is 'end'
	# get parser result
	# @return result
	get_result : ->
		@result
	# build result container
	# @abstract used by subclasses
	# @return empty result container
	result_builder : ->
	# set section state to first section
	# @throw [String] if before section != 'idle'
	begin_parse : ->
		unless @section.is 'idle'
			throw 'cannot begin parsing because previous transaction is still working'
		@result = @result_builder()
		@section.next()
	# set section state to begining section
	# @throw [String] if before section != 'end'
	end_parse : ->
		unless @section.is 'end'
			@abort_parse()
			throw 'parsing was aborted'
		@section.next()
	# set section state to begining section FORCE!
	# @note recursively abort parsing
	abort_parse : ->
		if @parsers?
			for name, parser of @parsers
				parser.abort_parse() if parser.abort_parse?
		@section.set 'idle'
	# parse a transaction
	# @param transaction [String] complete transaction
	# @return parse_chunk()'s one result
	# @throw [String] if transaction is not complete
	parse : (transaction) ->
		@begin_parse()
		result = @parse_chunk transaction
		if @is_parsing()
			throw 'transaction is not closed'
		if result.results.length != 1
			throw 'multiple transaction'
		result.results[0]
	# parse transaction chunk
	# @param chunk [String] transaction chunk
	# @return [Array] parse_lines()'s results
	parse_chunk : (chunk) ->
		lines = chunk.split /\r\n/
		if chunk.match /\r\n$/
			lines.pop()
		@parse_lines lines
	# parse chunk lines
	# @param lines [Array<String>] transaction chunk separated by \r\n
	# @return [Hash] {results: parse_line()'s result, state: parser state}
	parse_lines : (lines) ->
		results = []
		for line in lines
			result = @parse_line line
			if result.state == 'end'
				results.push result.result
		results : results
		state : result.state
	# parse line
	# @param line [String] transaction line separated by \r\n
	# @return [Hash] {results: result (if state is end), state: parser state}
	parse_line : (line) ->
		if @section.is 'idle'
			@begin_parse()
		@parse_main line
		if @section.is 'end'
			@end_parse()
			result : @get_result()
			state : 'end'
		else
			state : 'continue'
	# parser main routine
	# @abstract implemented by subclasses
	parse_main : (line) ->

# parser section state manager
class ShioriJK.Shiori.Section
	constructor : (@sections) ->
		@index = 0
	is : (section) ->
		@sections[@index] == section
	next : ->
		if @index == @sections.length - 1
			@index = 0
		else
			@index++
	previous : ->
		if @index == 0
			@index = @sections.length - 1
		else
			@index--
	set : (section) ->
		@index = @sections.indexOf section
	get : ->
		@sections[@index]

class ShioriJK.Shiori.Header.Parser extends ShioriJK.Shiori.Parser
	parse_main : (line) ->
		result = @parse_header line
		if result.state == 'end'
			@section.next()
	parse_header : (line) ->
		if line.length
			if result = line.match /^(.+?): (.*)$/
				@result.header[result[1]] = result[2]
			else
				throw 'Invalid header line : ' + line
			state : 'continue'
		else
			state : 'end'

class ShioriJK.Shiori.Header.Section extends ShioriJK.Shiori.Section
	constructor : (@sections = ['idle', 'header', 'end']) ->
		@index = 0

# SHIORI Request parser
class ShioriJK.Shiori.Request.Parser extends ShioriJK.Shiori.Parser
	constructor : () ->
		@parsers = {
			request_line : new ShioriJK.Shiori.Request.RequestLine.Parser()
			headers : new ShioriJK.Shiori.Request.Header.Parser()
		}
		@section = new ShioriJK.Shiori.Request.Section()
	result_builder : ->
		new ShioriJK.Message.Request(no_prepare: true)
	parse_main : (line) ->
		parser = @parsers[@section.get()]
		parser_result = parser.parse_line line
		if parser_result.state == 'end'
			@result[@section.get()] = parser_result.result
			@section.next()

class ShioriJK.Shiori.Request.RequestLine.Parser
	constructor : () ->
	result_builder : ->
		new ShioriJK.RequestLine()
	parse : (transaction) ->
		@parse_chunk transaction
	parse_chunk : (chunk) ->
		@parse_line chunk
	parse_line : (line) ->
		result = line.match /^([A-Za-z0-9 ]+) SHIORI\/([0-9.]+)/
		unless result
			throw 'Invalid request line : ' + line
		@result = @result_builder()
		@result.method = result[1]
		@result.protocol = 'SHIORI'
		@result.version = result[2]
		result : @result
		state : 'end'

class ShioriJK.Shiori.Request.Header.Parser extends ShioriJK.Shiori.Header.Parser
	constructor : () ->
		@section = new ShioriJK.Shiori.Request.Header.Section()
	result_builder : ->
		new ShioriJK.Headers.Request()

class ShioriJK.Shiori.Request.Section extends ShioriJK.Shiori.Section
	constructor : (@sections = ['idle', 'request_line', 'headers', 'end']) ->
		@index = 0

class ShioriJK.Shiori.Request.Header.Section extends ShioriJK.Shiori.Header.Section

# SHIORI Response parser
class ShioriJK.Shiori.Response.Parser extends ShioriJK.Shiori.Parser
	constructor : () ->
		@parsers = {
			status_line : new ShioriJK.Shiori.Response.StatusLine.Parser()
			headers : new ShioriJK.Shiori.Response.Header.Parser()
		}
		@section = new ShioriJK.Shiori.Response.Section()
	result_builder : ->
		new ShioriJK.Message.Response(no_prepare: true)
	parse_main : (line) ->
		parser = @parsers[@section.get()]
		parser_result = parser.parse_line line
		if parser_result.state == 'end'
			@result[@section.get()] = parser_result.result
			@section.next()

class ShioriJK.Shiori.Response.StatusLine.Parser
	constructor : () ->
	result_builder : ->
		new ShioriJK.StatusLine()
	parse : (transaction) ->
		@parse_chunk transaction
	parse_chunk : (chunk) ->
		@parse_line chunk
	parse_line : (line) ->
		result = line.match /^SHIORI\/([0-9.]+) (\d+) (.+)$/
		unless result
			throw 'Invalid status line : ' + line
		@result = @result_builder()
		@result.protocol = 'SHIORI'
		@result.version = result[1]
		@result.code = result[2] - 0
		result : @result
		state : 'end'

class ShioriJK.Shiori.Response.Header.Parser extends ShioriJK.Shiori.Header.Parser
	constructor : () ->
		@section = new ShioriJK.Shiori.Response.Header.Section()
	result_builder : ->
		new ShioriJK.Headers.Response()

class ShioriJK.Shiori.Response.Section extends ShioriJK.Shiori.Section
	constructor : (@sections = ['idle', 'status_line', 'headers', 'end']) ->
		@index = 0

class ShioriJK.Shiori.Response.Header.Section extends ShioriJK.Shiori.Header.Section
