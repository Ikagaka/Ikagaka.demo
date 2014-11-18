### (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 ###

unless MiyoFilters?
	MiyoFilters = {}

MiyoFilters.no_value = type: 'any-value', filter: ->

if module? and module.exports?
	module.exports = MiyoFilters
