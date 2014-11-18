### (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 ###

unless MiyoFilters?
	MiyoFilters = {}

MiyoFilters.set_value_filters = type: 'through', filter: (argument, request, id) ->
	@value_filters = argument.set_value_filters
	argument
MiyoFilters.append_value_filters = type: 'through', filter: (argument, request, id) ->
	for name in argument.append_value_filters
		@value_filters.push name
	argument
MiyoFilters.prepend_value_filters = type: 'through', filter: (argument, request, id) ->
	for name in argument.prepend_value_filters
		@value_filters.unshift name
	argument
MiyoFilters.remove_value_filters = type: 'through', filter: (argument, request, id) ->
	for name in argument.remove_value_filters
		index = @value_filters.indexOf name
		if index != -1
			@value_filters.splice index, 1
	argument

if module? and module.exports?
	module.exports = MiyoFilters
