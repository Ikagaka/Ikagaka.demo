### (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 ###
### base code: micro-template.js (https://github.com/cho45/micro-template.js) (c) cho45 http://cho45.github.com/mit-license ###

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

MiyoFilters.entry_template = type: 'value-value', filter: (value, request, id, stash) ->
	value_replace = value = value.toString()
	try
		sub_str =
			"""
			var _this = this;
			var promise = new Promise(function(resolve, reject){
				return resolve('');
			});
			promise = promise.then(function(values){
				return values + '""" +
			value_replace
			.replace /\$\{/g, '\x11'
			.replace /\}/g, '\x13'
			.replace /\\/g, '\\\\'
			.replace /'/g, "\\'"
			.replace /\n/g, ''
			.replace(/\x11(.+?)\x13/g, (match, code) ->
				"""'
				});
				promise = promise.then(function(values){
					return _this.call_id('#{code}', request, stash).then(function(value){
						return values + value;
					});
				});
				promise = promise.then(function(values){
					return values + '"""
			) +
			"""'
			});
			promise = promise.catch(function(e){
				throw 'entry_template runtime error:\\n' + e + '\\n' + 'id: ' + id + '\\n' + 'template:\\n--\\n#{value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r/g, "\\r").replace(/\n/g, "\\n")}\\n--\\n';
			});
			return promise;
			"""
		sub = new Function 'request', 'id', 'stash', 'Promise', sub_str
	catch error
		throw 'entry_template compile error:\n' + error + '\n' + 'id: ' + id + '\n' + 'template:\n--\n' + sub_str + '\n--\n'
	sub.call @, request, id, stash, Promise

if module?.exports?
	module.exports = MiyoFilters
else
	@MiyoFilters = MiyoFilters
