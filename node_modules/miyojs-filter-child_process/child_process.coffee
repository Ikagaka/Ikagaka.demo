### (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 ###

if require?
	child_process = require('child_process')

unless MiyoFilters?
	MiyoFilters = {}

MiyoFilters.spawn = type: 'through', filter: (argument, request, id, stash) ->
	command = @property argument.spawn, 'command', request, id, stash
	args = @property argument.spawn, 'args', request, id, stash
	options = @property argument.spawn, 'options', request, id, stash
	child_process.spawn(command, args, options)
	argument

MiyoFilters.exec = type: 'through', filter: (argument, request, id, stash) ->
	command = @property argument.exec, 'command', request, id, stash
	args = @property argument.exec, 'args', request, id, stash
	callback = @property argument.exec, 'callback', request, id, stash
	child_process.exec(command, args, callback)
	argument

MiyoFilters.execFile = type: 'through', filter: (argument, request, id, stash) ->
	file = @property argument.execFile, 'file', request, id, stash
	args = @property argument.execFile, 'args', request, id, stash
	callback = @property argument.execFile, 'callback', request, id, stash
	child_process.execFile(file, args, callback)
	argument

if module? and module.exports?
	module.exports = MiyoFilters
