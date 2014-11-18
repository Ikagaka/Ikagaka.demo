# Engine class
# @abstract implement engines as this abstract
class Engine
	# SHIORI(SHIOLINK) load
	# @param dllpath [String] SHIORI DLL's path
	load: (dllpath) ->
	# SHIORI(SHIOLINK) request
	# @param request [ShioriJK.Message.Request] SHIORI Request Message (can treat as string)
	# @return [StringLike|Promise] SHIORI Response (return value or Promise resolved value must be able to treat as string)
	request: (request) ->
	# SHIORI(SHIOLINK) unload
	unload: ->
