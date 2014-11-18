### (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 ###

unless Promise?
	if require?
		try
			Promise = require('es6-promise').Promise
		catch
			Promise = require('bluebird')
	else
		if @Promise?
			Promise = @Promise
		else if @ES6Promise?.Promise?
			Promise = @ES6Promise.Promise
if require?
	fs = require 'fs'
	path = require 'path'
else
	fs = @fs
	path = @path
if process?
	cwd = process.cwd
else
	cwd = @process?.cwd

if @MiyoFilters?
	MiyoFilters = @MiyoFilters
else
	MiyoFilters = {}

MiyoFilters.variables_initialize = type: 'through', filter: (argument, request, id, stash) ->
	@variables = {}
	@variables_temporary = {}
	@variables_load = (file) =>
		if fs? and path? and cwd?
			new Promise (resolve, reject) =>
				file_path = path.join cwd(), file
				fs.readFile file_path, 'utf8', (error, json_str) =>
					if error
						return reject error
					try
						@variables = JSON.parse json_str
					catch error
						return reject error
					return resolve()
		else
			new Promise (resolve, reject) -> resolve()
	@variables_save = (file) =>
		if fs? and path? and cwd?
			new Promise (resolve, reject) =>
				file_path = path.join cwd(), file
				json_str = JSON.stringify @variables
				fs.writeFile file_path, json_str, 'utf8', (error) ->
					if error
						return reject error
					return resolve()
		else
			new Promise (resolve, reject) -> resolve()
	argument

MiyoFilters.variables_load = type: 'through', filter: (argument, request, id, stash) ->
	unless argument?.variables_load?.file?
		throw 'argument.variables_load.file undefined'
	@variables_load argument.variables_load.file
	.then ->
		argument
	.catch (error) =>
		if @has_property argument.variables_load, 'error'
			@property argument.variables_load, 'error', request, id, error: error, argument: argument
		else
			argument

MiyoFilters.variables_save = type: 'through', filter: (argument, request, id, stash) ->
	unless argument?.variables_save?.file?
		throw 'argument.variables_save.file undefined'
	@variables_save argument.variables_save.file
	.then ->
		argument
	.catch (error) =>
		if @has_property argument.variables_save, 'error'
			@property argument.variables_save, 'error', request, id, error: error, argument: argument
		else
			argument

MiyoFilters.variables_set = type: 'through', filter: (argument, request, id, stash) ->
	unless argument?.variables_set?
		throw 'argument.variables_set undefined'
	for name of argument.variables_set
		pname = name.replace /\.[^.]+$/
		@variables[name] = @property argument.variables_set, pname, request, id, stash
	argument

MiyoFilters.variables_delete = type: 'through', filter: (argument, request, id, stash) ->
	unless argument?.variables_delete?
		throw 'argument.variables_delete undefined'
	for name in argument.variables_delete
		delete @variables[name]
	argument

MiyoFilters.variables_temporary_set = type: 'through', filter: (argument, request, id, stash) ->
	unless argument?.variables_temporary_set?
		throw 'argument.variables_temporary_set undefined'
	for name, value of argument.variables_temporary_set
		pname = name.replace /\.[^.]+$/
		@variables_temporary[name] = @property argument.variables_temporary_set, pname, request, id, stash
	argument

MiyoFilters.variables_temporary_delete = type: 'through', filter: (argument, request, id, stash) ->
	unless argument?.variables_temporary_delete?
		throw 'argument.variables_temporary_delete undefined'
	for name in argument.variables_temporary_delete
		delete @variables_temporary[name]
	argument

if module?.exports?
	module.exports = MiyoFilters
else
	@MiyoFilters = MiyoFilters
