### (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 ###

if require?
	CoffeeScript = require 'coffee-script'
	_require = require
else
	CoffeeScript = @CoffeeScript
	_require = @require

if @MiyoFilters?
	MiyoFilters = @MiyoFilters
else
	MiyoFilters = {}

MiyoFilters.property_initialize = type: 'through', filter: (argument, request, id, stash) ->
	handlers = argument.property_initialize.handlers
	property_getter = (property_base, property_with_handler_name, pre_hook, handler_name, request, id, stash) ->
		property = property_base[property_with_handler_name]
		if pre_hook?
			pre_hook_handler = if handler_name of pre_hook then pre_hook[handler_name] else pre_hook
			if pre_hook_handler instanceof Function
				try
					return pre_hook_handler.call @, property, request, id, stash
				catch error
					throw "property pre_hook execute error: [#{property_with_handler_name}]\n#{error}"
			else
				return property
		else
			return property
	@property = (property_base, property_name, request, id, stash, pre_hook) ->
		compiled_property_name = '__' + property_name
		unless compiled_property_name of property_base
			for handler_name in handlers
				property_with_handler_name = property_name + '.' + handler_name
				if property_with_handler_name of property_base
					property = property_getter.call @, property_base, property_with_handler_name, pre_hook, handler_name, request, id, stash
					handler = @filters.property_handler[handler_name]
					try
						[compiled_property, compiled_handler_name] = handler.call @, property, request, id, stash
					catch error
						throw "property compile error: [#{property_with_handler_name}]\n#{error}"
					@set_compiled_property property_base, compiled_property_name, compiled_property, compiled_handler_name
					break
			unless compiled_property_name of property_base
				if property_name of property_base
					property = property_getter.call @, property_base, property_name, pre_hook, 'plain', request, id, stash
					@set_compiled_property property_base, compiled_property_name, property, 'plain_compiled'
		@compiled_property property_base, compiled_property_name, request, id, stash
	@has_property = (property_base, property_name) ->
		compiled_property_name = '__' + property_name
		if compiled_property_name of property_base
			return true
		else
			for handler_name in handlers
				property_with_handler_name = property_name + '.' + handler_name
				if property_with_handler_name of property_base
					return true
			if property_name of property_base
				return true
		return false
	@set_compiled_property = (property_base, compiled_property_name, compiled_property, compiled_handler_name) ->
		property_base[compiled_property_name] = property: compiled_property, handler: compiled_handler_name
	@compiled_property = (property_base, compiled_property_name, request, id, stash) ->
		return unless compiled_property_name of property_base
		compiled_property_container = property_base[compiled_property_name]
		compiled_property = compiled_property_container.property
		compiled_handler_name = compiled_property_container.handler
		compiled_handler = @filters.property_handler[compiled_handler_name]
		try
			compiled_handler.call @, compiled_property, request, id, stash
		catch error
			throw "property execute error: [#{compiled_property_name}] with handler [#{compiled_handler_name}]\n#{error}"
	argument

MiyoFilters.property_handler = {}
MiyoFilters.property_handler.plain_compiled = (compiled_property, request, id, stash) -> compiled_property
MiyoFilters.property_handler.js = (property, request, id, stash) ->
	compiled_property = new Function 'request', 'id', 'stash', 'require', property
	[compiled_property, 'js_compiled']
MiyoFilters.property_handler.jse = (property, request, id, stash) ->
	compiled_property = new Function 'request', 'id', 'stash', 'require', 'return ' + property
	[compiled_property, 'js_compiled']
MiyoFilters.property_handler.js_compiled = (compiled_property, request, id, stash) ->
	compiled_property.call @, request, id, stash, _require
MiyoFilters.property_handler.js.stash = {}
MiyoFilters.property_handler.coffee = (property, request, id, stash) ->
	compiled_property = eval CoffeeScript.compile "(request, id, stash, require) -> (#{property})", bare: true
	[compiled_property, 'js_compiled']

if module?.exports?
	module.exports = MiyoFilters
else
	@MiyoFilters = MiyoFilters
