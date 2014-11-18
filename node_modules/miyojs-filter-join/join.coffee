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

if @MiyoFilters?
	MiyoFilters = @MiyoFilters
else
	MiyoFilters = {}

MiyoFilters.join = type: 'data-value', filter: (argument, request, id, stash) ->
	return unless argument?.join?
	promise = new Promise (resolve, reject) -> resolve []
	for element in argument.join
		promise = promise.then ((element) =>
			(values) =>
				@call_entry element, request, id, stash
				.then (value) ->
					if value?
						values.push value
					values
		)(element)
	promise.then (values) ->
		values.join ''

if module? and module.exports?
	module.exports = MiyoFilters
else
	@MiyoFilters = MiyoFilters
