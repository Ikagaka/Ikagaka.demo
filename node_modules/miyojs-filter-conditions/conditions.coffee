### (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 ###

unless MiyoFilters?
	MiyoFilters = {}

MiyoFilters.conditions = type: 'data-value', filter: (argument, request, id, stash) ->
	return unless argument?.conditions?
	for condition in argument.conditions
		if (not @has_property condition, 'when') or @property condition, 'when', request, id, stash
			return @call_entry condition.do, request, id, stash
	return

if module? and module.exports?
	module.exports = MiyoFilters
