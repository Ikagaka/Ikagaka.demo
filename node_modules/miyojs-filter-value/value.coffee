### (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 ###

unless MiyoFilters?
	MiyoFilters = {}

MiyoFilters.value = type: 'data-value', filter: (argument, request, id, stash) ->
	unless argument?.value?
		throw 'argument.value undefined'
	@call_entry argument.value, request, id, stash

if module? and module.exports?
	module.exports = MiyoFilters
