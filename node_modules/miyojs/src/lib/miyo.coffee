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
	if @MiyoFilters?
		MiyoFilters = @MiyoFilters

class Miyo
	constructor : (@dictionary) ->
		@filters =
			miyo_require_filters : type: 'through', filter: (argument) ->
				if require?
					path = require 'path'
					for file in argument.miyo_require_filters
						if file.match /^\.*\//
							filters = require path.join process.cwd(), file
						else
							filters = require 'miyojs-filter-' + file
						for name, filter of filters
							@filters[name] = filter
				else if MiyoFilters?
					for name of MiyoFilters
						@filters[name] = MiyoFilters[name]
				else
					throw 'miyo_require_filters: filter source not found.'
				argument
		@default_response_headers = {}
		@value_filters = []
	load : (directory) ->
		new Promise (resolve, reject) =>
			@shiori_dll_directory = directory
			resolve @call_id '_load', null
		.then -> return
	unload : ->
		new Promise (resolve, reject) =>
			resolve @call_id '_unload', null
		.then ->
			if process?
				process.exit()
			return
	request : (request) ->
		if request.request_line.version == '3.0'
			new Promise (resolve, reject) =>
				resolve @call_id request.headers.get('ID'), request
			.then (response) =>
				unless response instanceof ShioriJK.Message.Response
					response = @make_value response, request
				"#{response}" # catch response error in miyo
			.catch (error) =>
				@make_internal_server_error error, request
		else
			new Promise (resolve, reject) =>
				resolve @make_bad_request request
	call_id : (id, request, stash) ->
		entry = @dictionary[id]
		if request == null # not request
			if entry?
				@call_entry entry, request, id, stash
			else
				new Promise (resolve, reject) -> resolve()
		else
			@call_entry entry, request, id, stash
	call_entry : (entry, request, id, stash) ->
		if entry?
			if entry instanceof Array
				@call_list entry, request, id, stash
			else if entry instanceof Object
				@call_filters entry, request, id, stash
			else
				@call_value entry, request, id, stash
		else
			@call_not_found entry, request, id, stash
	call_value : (entry, request, id, stash) ->
		value = entry
		filter_names = @value_filters
		@_process_filters 'value', 'value', @value_filters, value, request, id, stash
	call_list : (entry, request, id, stash) ->
		@call_entry entry[Math.floor (Math.random() * entry.length)], request, id, stash
	call_filters : (entry, request, id, stash) ->
		argument = entry.argument
		if entry.filters instanceof Array
			filter_names = entry.filters
		else
			filter_names = [entry.filters]
		@_process_filters 'data', 'value', filter_names, argument, request, id, stash
	_process_filters: (input_type, output_type, filter_names, argument, request, id, stash) ->
		stash = {} unless stash?
		type = input_type
		promise = new Promise (resolve, reject) -> resolve argument
		for filter_name in filter_names
			promise = promise.then ((filter_name) =>
				(argument) =>
					filter = @filters[filter_name]
					unless filter?
						throw "filter [#{filter_name}] not found"
					unless filter.filter?
						throw "filter [#{filter_name}] function is undefined"
					filter_types = Miyo.filter_types[filter.type]
					unless filter_types
						throw "filter [#{filter_name}] has invalid filter type '#{filter.type}'"
					{input, output} = filter_types
					if input == type or input == 'through' or input == 'any'
						unless output == 'through'
							type = output
					else
						throw "filter [#{filter_name}] input type '#{input}' is inconsistent with previous output type '#{type}'"
					argument = filter.filter.call @, argument, request, id, stash
					argument
				)(filter_name)
		promise = promise.then (argument) ->
			unless !request? or type == output_type
				throw "filters final output type '#{type}' is inconsistent with final output type 'value'"
			argument
		promise
	call_not_found : (entry, request, id, stash) ->
		new Promise (resolve, reject) =>
			resolve @make_bad_request request
	build_response : ->
		new ShioriJK.Message.Response()
	make_value : (value, request) ->
		if value?
			value = "#{value}"
		response = @build_response()
		response.status_line.protocol = 'SHIORI'
		response.status_line.version = '3.0'
		response.status_line.code = if value?.length then 200 else 204
		for name, content of @default_response_headers
			response.headers.set name, content
		response.headers.set 'Value', value.replace /[\r\n]/g, '' if value?.length
		response
	make_bad_request : (request) ->
		response = @build_response()
		response.status_line.protocol = 'SHIORI'
		response.status_line.version = '3.0'
		response.status_line.code = 400
		for name, content of @default_response_headers
			response.headers.set name, content
		response
	make_internal_server_error : (error, request) ->
		response = @build_response()
		response.status_line.protocol = 'SHIORI'
		response.status_line.version = '3.0'
		response.status_line.code = 500
		for name, content of @default_response_headers
			response.headers.set name, content
		response.headers.set 'X-Miyo-Error', "#{error}".replace(/\r/g, '\\r').replace(/\n/g, '\\n') if error
		response

Miyo.filter_types =
	'through': {input: 'through', output: 'through'}
	'data-data': {input: 'data', output: 'data'}
	'data-value': {input: 'data', output: 'value'}
	'value-value': {input: 'value', output: 'value'}
	'any-value': {input: 'any', output: 'value'}

if module? and module.exports?
	module.exports = Miyo
else
	@Miyo = Miyo
