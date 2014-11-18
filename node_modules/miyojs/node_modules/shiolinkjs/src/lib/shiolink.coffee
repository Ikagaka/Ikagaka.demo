### (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 ###

if require?
	ShioriJK = require 'shiorijk'
	unless Promise?
		try
			Promise = require('es6-promise').Promise
		catch
			Promise = require('bluebird')
else
	if @Promise?
		Promise = @Promise
	else if @ES6Promise?.Promise?
		Promise = @ES6Promise.Promise
	ShioriJK = @ShioriJK

# SHIOLINK protocol interface.
# This parses SHIOLINK protocol and passes data to basic "SHIORI engine" and response to out.
class ShiolinkJS
	# @param engine [Engine] engine
	# @note Engine must implements load(), request(), unload()
	constructor : (@engine) ->
		@request_parser = new ShioriJK.Shiori.Request.Parser()
		@state = 'shiolink'
	# @property [Engine] engine
	engine: null
	# @property [ShioriJK.Shiori.Request.Parser] parser
	request_parser: null
	# @nodoc
	shiolink_load : (directory) ->
		new Promise (resolve, reject) => resolve @engine.load directory
		.then -> return
	# @nodoc
	shiolink_request : (id) ->
		@state = 'request'
		new Promise (resolve, reject) -> resolve "*S:#{id}\r\n"
	# @nodoc
	shiolink_unload : ->
		new Promise (resolve, reject) => resolve @engine.unload()
		.then -> return
	# append SHIOLINK protocol chunk
	# @param chunk [String] SHIOLINK protocol chunk
	# @return [Promise] add_lines()'s result
	add_chunk : (chunk) ->
		lines = chunk.split /\r\n/
		if chunk.match /\r\n$/
			lines.pop()
		@add_lines lines
	# append SHIOLINK protocol chunk lines
	# @param lines [Array<String>] SHIOLINK protocol chunk lines separated by \r\n
	# @return [Promise] Promise of string result that is combination of add_line()'s result. It may be empty string, not undefined / null.
	add_lines : (lines) ->
		promise = new Promise (resolve, reject) -> resolve []
		for line in lines
			promise = promise.then ((line) =>
				(results) =>
					@add_line line
					.then (result) ->
						if result?
							results.push result
						results
			)(line)
		promise.then (results) ->
			results.join ''
	# append SHIOLINK protocol chunk line
	# @param line [String] SHIOLINK protocol chunk line
	# @return [Promise] If request transaction is completed, Promise resolved value is response transaction string, and if not, none (undefined value). If Engine throws error, Promise resolved value will be 500 Internal Server Error string.
	add_line : (line) ->
		switch @state
			when 'shiolink'
				if result = line.match /^\*(L|S|U):(.*)$/
					switch result[1]
						when 'L' then return @shiolink_load result[2]
						when 'S' then return @shiolink_request result[2]
						when 'U' then return @shiolink_unload result[2]
			when 'request'
				parser_result = @request_parser.parse_line line
				if parser_result.state == 'end'
					@state = 'shiolink'
					return new Promise (resolve, reject) =>
						resolve @engine.request parser_result.result
					.then (response) ->
						"#{response}"
					.catch (error) ->
						response = new ShioriJK.Message.Response()
						response.status_line.protocol = 'SHIORI'
						response.status_line.version = '3.0'
						response.status_line.code = 500
						response.headers.set 'X-ShiolinkJS-Error', "#{error}".replace(/\r/g, '\\r').replace(/\n/g, '\\n')
						"#{response}"
		return new Promise (resolve, reject) -> resolve()

if module? and module.exports?
	module.exports = ShiolinkJS
else
	@ShiolinkJS = ShiolinkJS
