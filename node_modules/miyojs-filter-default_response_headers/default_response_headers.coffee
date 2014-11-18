### (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 ###

unless MiyoFilters?
	MiyoFilters = {}

MiyoFilters.default_response_headers = type: 'through', filter: (argument, request, id, stash) ->
	for key, value of argument.default_response_headers
		@default_response_headers[key] = value
	argument

if module? and module.exports?
	module.exports = MiyoFilters
