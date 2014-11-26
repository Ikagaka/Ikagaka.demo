### (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 ###
clone = (src) ->
	if not src? or typeof src isnt 'object'
		return src
	ret = new src.constructor()
	for key of src
		ret[key] = clone src[key]
	ret

copy = (source, destination) ->
	if (source instanceof Object) and (not (source instanceof Array))
		for key of source
			if destination[key]? and destination[key] instanceof Object
				copy source[key], destination[key]
			else
				destination[key] = clone source[key]
	else
		destination = clone source

if exports?
	exports.clone = clone
	exports.copy = copy
