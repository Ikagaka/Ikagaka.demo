### (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 ###

unless MiyoFilters?
	MiyoFilters = {}

MiyoFilters.stash = type: 'through', filter: (argument, request, id, stash) ->
	unless argument?.stash?
		throw 'argument.stash must be a hash'
	for name of argument.stash
		name = name.replace /\.[^.]+$/, ''
		stash[name] = @property argument.stash, name, request, id, stash
	argument

if module? and module.exports?
	module.exports = MiyoFilters
