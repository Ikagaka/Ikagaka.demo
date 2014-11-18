### (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 ###
### base code: micro-template.js (https://github.com/cho45/micro-template.js) (c) cho45 http://cho45.github.com/mit-license ###

unless MiyoFilters?
	MiyoFilters = {}

MiyoFilters.stash_template = type: 'value-value', filter: (value, request, id, stash) ->
	value_replace = value = value.toString()
	try
		sub_str =
			'var _ret = "";\n' + 'try{\n' +
			"_ret += '" +
			value_replace
			.replace /#\{/g, '\x11'
			.replace /\}/g, '\x13'
			.replace /\\/g, '\\\\'
			.replace /'/g, "\\'"
			.replace /\n/g, ''
			.replace(/\x11(.+?)\x13/g, (match, code) -> "' + (stash.stash_template['#{code}']) + '") +
			"';\n" + 'return _ret;' +
			"\n}catch(e){\nthrow 'stash_template runtime error:\\n' + e + '\\n' + 'id: ' + id + '\\n' + 'template:\\n--\\n#{value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r/g, "\\r").replace(/\n/g, "\\n")}\\n--\\n';\n}"
		sub = new Function 'request', 'id', 'stash', sub_str
	catch error
		throw 'stash_template compile error:\n' + error + '\n' + 'id: ' + id + '\n' + 'template:\n--\n' + sub_str + '\n--\n'
	sub.call @, request, id, stash

if module? and module.exports?
	module.exports = MiyoFilters
