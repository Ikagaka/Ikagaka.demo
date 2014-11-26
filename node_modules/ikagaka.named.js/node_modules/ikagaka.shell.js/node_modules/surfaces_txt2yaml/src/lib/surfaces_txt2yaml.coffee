### (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 ###
if require?
	jsyaml = require 'js-yaml'

SurfacesTxt2Yaml = {}

class SurfacesTxt2Yaml.Parser
	constructor : (options) ->
		@options =
			comment_prefix: ['//']
		@set_options compatible: 'ssp'
		if options?
			@set_options options
	set_options: (options) ->
		if options.compatible == 'materia'
			@options.charset = false
			@options.surface_definition = 'materia'
			@options.check_seriko = 'warn'
			@options.allow_all_seriko = false
			@options.check_surface_scope_duplication = 'warn'
			@options.check_nonstandard_comment = 'warn'
		else if options.compatible == 'ssp'
			@options.charset = true
			@options.surface_definition = 'ssp'
			@options.check_seriko = 'warn'
			@options.allow_all_seriko = false
			@options.check_surface_scope_duplication = 'warn'
			@options.check_nonstandard_comment = 'warn'
		else if options.compatible == 'ssp-lazy'
			@options.charset = true
			@options.surface_definition = 'ssp-lazy'
			@options.check_seriko = 'warn'
			@options.allow_all_seriko = true
			@options.check_surface_scope_duplication = 'warn'
			@options.check_nonstandard_comment = 'warn'
		for name, value of options
			@options[name] = value
		@options.standard_comment_re = new RegExp('^\\s*(?:' + (prefix.replace /\W/, '\\$&' for prefix in @options.comment_prefix).join('|') + ')|^\s*$')
	parse : (txt) ->
		parsed_data = {}
		lines = txt.split /\r?\n/
		scope = null
		scope_id = null
		scope_id_str = null
		in_scope = false
		scope_begin = null
		scope_content = []
		for line, index in lines
			@index = index
			result = null
			if not in_scope
				if @options.charset and result = line.match /^\s*charset,(.+)$/
					if parsed_data.charset?
						@throw 'charset duplication found'
					parsed_data.charset = result[1]
				else if (
					(@options.surface_definition == 'materia' and result = line.match /^(?:(descript)|(surface)(\d+(?:,surface\d+)*)|(sakura|kero\d+)\.(surface\.alias))\s*({)?\s*$/) or
					(@options.surface_definition == 'ssp' and result = line.match /^\s*(?:(descript)|(surface(?:\.append)?)(!?(?:\d+-)?\d+(?:\s*,\s*(?:surface|!)?(?:\d+-)?\d+)*)|(sakura|kero|char\d+)\.(surface\.alias|cursor|tooltips))\s*({)?\s*$/) or
					(@options.surface_definition == 'ssp-lazy' and result = line.match /^\s*(?:(descript)|(surface(?:\.append)?)(.+)|(sakura|kero|char\d+)\.(surface\.alias|cursor|tooltips))\s*({)?\s*$/)
				)
					if result[1] == 'descript'
						scope = 'descript'
					else if (result[2] == 'surface') or (result[2] == 'surface.append')
						scope = 'surface'
						scope_id_uniq = {}
						scope_id_delete = {}
						scope_id_str = 'surface'+result[3]
						ranges = result[3].split /[^0-9!]*,\s*(?:surface(?:\.append)?)?/
						for range in ranges
							range_result = null
							if range_result = range.match /^(\d+)-(\d+)$/
								for id in [range_result[1] .. range_result[2]]
									scope_id_uniq['surface'+id] = true
							else if range.match /^\d+$/
								scope_id_uniq['surface'+range] = true
							else if range_result = range.match /^!(\d+)-(\d+)$/
								for id in [range_result[1] .. range_result[2]]
									scope_id_delete['surface'+id] = true
							else if range_result = range.match /^!(\d+)$/
								scope_id_delete['surface'+range_result[1]] = true
							else if not @options.surface_definition == 'ssp-lazy'
								@throw 'wrong surface range "' + range + '" in : ' + line
						for scope_id_value of scope_id_delete
							delete scope_id_uniq[scope_id_value]
						if result[2] == 'surface.append'
							for scope_id_value of scope_id_uniq
								unless parsed_data[scope][scope_id_value]?
									delete scope_id_uniq[scope_id_value]
						scope_id = Object.keys scope_id_uniq
					else
						scope = result[5]
						scope_id = result[4]
					if result[result.length - 1] == '{'
						in_scope = true
						scope_begin = index + 1
				else if result = line.match /^\s*{\s*$/
					if scope?
						in_scope = true
						scope_begin = index + 1
					else
						@throw 'scope bracket begun before scope name'
				else if @options.check_nonstandard_comment and not line.match @options.standard_comment_re # comment or empty line
					@warnthrow 'invalid line found in scope outside : '+line, @options.check_nonstandard_comment
			else if result = line.match /^\s*}\s*$/
				unless parsed_data[scope]?
					parsed_data[scope] = {}
				scope_parser = new SurfacesTxt2Yaml.ScopeParser[scope](@options, parsed_data.descript?.version)
				data = scope_parser.parse scope_content, scope_begin
				if scope_id?
					if scope_id instanceof Array
						unless parsed_data[scope][scope_id_str]?
							parsed_data[scope][scope_id_str] = {}
						copy data, parsed_data[scope][scope_id_str]
						for scope_id_value in scope_id
							unless parsed_data[scope][scope_id_value]?
								parsed_data[scope][scope_id_value] = {}
							if scope_id.length != 1
								unless parsed_data[scope][scope_id_value].base?
									parsed_data[scope][scope_id_value].base = []
								if -1 == parsed_data[scope][scope_id_value].base.indexOf scope_id_str
									parsed_data[scope][scope_id_value].base.push scope_id_str
					else
						unless parsed_data[scope][scope_id]?
							parsed_data[scope][scope_id] = {}
						copy data, parsed_data[scope][scope_id]
				else
					copy data, parsed_data[scope]
				scope = null
				scope_id = null
				scope_id_str = null
				in_scope = false
				scope_begin = null
				scope_content = []
			else
				scope_content.push line
		if in_scope
			@throw 'scope is not closed (missing closing bracket)'
		delete @index
		# reconstruction
		if parsed_data.surface?
			parsed_data.surfaces = parsed_data.surface
			delete parsed_data.surface
			for id, surface of parsed_data.surfaces
				result = null
				if result = id.match /^surface(\d+)$/
					surface.is = result[1] - 0
		if parsed_data['surface.alias']?
			parsed_data.aliases = parsed_data['surface.alias']
			delete parsed_data['surface.alias']
		if parsed_data.cursor?
			unless parsed_data.regions?
				parsed_data.regions = {}
			for character, settings of parsed_data.cursor
				unless parsed_data.regions[character]?
					parsed_data.regions[character] = {}
				for type, setting of settings
					unless parsed_data.regions[character][setting.region_id]?
						parsed_data.regions[character][setting.region_id] = {}
					unless parsed_data.regions[character][setting.region_id].cursor?
						parsed_data.regions[character][setting.region_id].cursor = {}
					parsed_data.regions[character][setting.region_id].cursor[type] = setting.file
			delete parsed_data.cursor
		if parsed_data.tooltips?
			unless parsed_data.regions?
				parsed_data.regions = {}
			for character, regions of parsed_data.tooltips
				unless parsed_data.regions[character]?
					parsed_data.regions[character] = {}
				for region_id, tooltip of regions
					unless parsed_data.regions[character][region_id]?
						parsed_data.regions[character][region_id] = {}
					parsed_data.regions[character][region_id].tooltip = tooltip
			delete parsed_data.tooltips
		parsed_data
	warn : (message) ->
		mes = '[WARNING] line '+(@index + 1)+': '+message
		console.warn mes
	throw : (message) ->
		mes = '[ERROR] line '+(@index + 1)+': '+message
		if @options.lint
			console.warn mes
		else
			throw mes
	warnthrow: (message, warnthrow) ->
		if warnthrow
			if warnthrow == 'warn'
				@warn message
			else
				@throw message

SurfacesTxt2Yaml.ScopeParser = {}

class SurfacesTxt2Yaml.ScopeParser.Single
	constructor : (options) ->
		@options = {}
		if options?
			@set_options options
	set_options: (options) ->
		for name, value of options
			@options[name] = value
		@options.standard_comment_re = new RegExp('^\\s*(?:' + (prefix.replace /\W/, '\\$&' for prefix in @options.comment_prefix).join('|') + ')|^\s*$')
	parse : (lines, index_offset) ->
		@index_offset = index_offset
		data = {}
		for line, index in lines
			@index = index
			result = null
			if result = line.match @condition.test
				@condition.match.call @, data, result
			else if @options.check_nonstandard_comment and not line.match @options.standard_comment_re # comment or empty line
				@warnthrow 'invalid line found in scope inside : '+line, @options.check_nonstandard_comment
		delete @index_offset
		delete @index
		data
	warn : (message) ->
		mes = '[WARNING] line ' + (@index_offset + @index + 1) + ': ' + message
		console.warn mes
		return
	throw : (message) ->
		mes = '[ERROR] line ' + (@index_offset + @index + 1) + ': ' + message
		if @options.lint
			console.warn mes
		else
			throw mes
		return
	warnthrow: (message, warnthrow) ->
		if warnthrow
			if warnthrow == 'warn'
				@warn message
			else
				@throw message

class SurfacesTxt2Yaml.ScopeParser.Multiple extends SurfacesTxt2Yaml.ScopeParser.Single
	parse : (lines, index_offset) ->
		@index_offset = index_offset
		data = {}
		for line, index in lines
			@index = index
			result = null
			match = false
			for condition in @conditions
				if result = line.match condition.test
					match = condition.match.call @, data, result
					if match then break
			if not match and @options.check_nonstandard_comment and not line.match @options.standard_comment_re # comment or empty line
				@warnthrow 'invalid line found in scope inside : '+line, @options.check_nonstandard_comment
		delete @index_offset
		delete @index
		data

class SurfacesTxt2Yaml.ScopeParser.descript extends SurfacesTxt2Yaml.ScopeParser.Multiple
	conditions : [
		{
			test: /^\s*version,([01])$/
			match: (data, result) ->
				data.version = result[1] - 0
				true
		}
		{
			test: /^\s*maxwidth,(\d+)$/
			match: (data, result) ->
				data.maxwidth = result[1] - 0
				true
		}
		{
			test: /^\s*(collision-sort|animation-sort),(.+)$/
			match: (data, result) ->
				data[result[1]] = result[2]
				true
		}
	]

class SurfacesTxt2Yaml.ScopeParser.tooltips extends SurfacesTxt2Yaml.ScopeParser.Single
	condition:
		test: /^\s*([^,]+),(.+)$/
		match: (data, result) ->
			data[result[1]] = result[2]

class SurfacesTxt2Yaml.ScopeParser.cursor extends SurfacesTxt2Yaml.ScopeParser.Single
	condition:
		test: /^\s*(mouseup|mousedown)(\d+),([^,]+),(.+)$/
		match: (data, result) ->
			data[result[1]] = {region_id : result[3], file : result[4]}

class SurfacesTxt2Yaml.ScopeParser['surface.alias'] extends SurfacesTxt2Yaml.ScopeParser.Single
	condition:
		test: /^\s*([^,]+),\[(.+)\]$/
		match: (data, result) ->
			data[result[1]] = (id - 0 for id in result[2].split /\s*,\s*/)

class SurfacesTxt2Yaml.ScopeParser.surface extends SurfacesTxt2Yaml.ScopeParser.Multiple
	constructor : (options, @seriko_version=0) ->
		@options = {}
		if options?
			@set_options options
	conditions : [
		{
			test : /^\s*element(\d+),([^,]+),([^,]+),([-0-9]+),([-0-9]+)$/
			match : (data, result) ->
				@match_element data, result
		}
		{
			test : /^\s*animation(\d+)\.interval,(.+)$/ # SERIKO/2
			match : (data, result) ->
				if @options.check_seriko and @seriko_version == 0
					@warnthrow 'not SERIKO/1.x definition : ' + result[0], @options.check_seriko
					return unless @options.allow_all_seriko
				@match_animation_interval data, result
		}
		{
			test : /^\s*(\d+)interval,(.+)$/ # SERIKO/1
			match : (data, result) ->
				if @options.check_seriko and @seriko_version == 1
					@warnthrow 'not SERIKO/2.0 definition : ' + result[0], @options.check_seriko
					return unless @options.allow_all_seriko
				@match_animation_interval data, result
		}
		{
			test : /^\s*animation(\d+)\.option,(.+)$/ # SERIKO/2
			match : (data, result) ->
				if @options.check_seriko and @seriko_version == 0
					@warnthrow 'not SERIKO/1.x definition : ' + result[0], @options.check_seriko
					return unless @options.allow_all_seriko
				@match_animation_option data, result
		}
		{
			test : /^\s*(\d+)option,(.+)$/ # SERIKO/1
			match : (data, result) ->
				if @options.check_seriko and @seriko_version == 1
					@warnthrow 'not SERIKO/2.0 definition : ' + result[0], @options.check_seriko
					return unless @options.allow_all_seriko
				@match_animation_option data, result
		}
		{
			test : /^\s*animation(\d+)\.pattern(\d+),([^,]+),(.+)$/ # SERIKO/2
			match : (data, result) ->
				if @options.check_seriko and @seriko_version == 0
					@warnthrow 'not SERIKO/1.x definition : ' + result[0], @options.check_seriko
					return unless @options.allow_all_seriko
				@match_animation_pattern data, result
		}
		{
			test : /^\s*(\d+)pattern(\d+),([^,]+),([^,]+),([^,]+)(?:,(.+))?$/ # SERIKO/1
			match : (data, result) ->
				if @options.check_seriko and @seriko_version == 1
					@warnthrow 'not SERIKO/2.0 definition : ' + result[0], @options.check_seriko
					return unless @options.allow_all_seriko
				@match_animation_pattern_old data, result
		}
		{
			test : /^\s*animation(\d+)\.collision(\d+),([-0-9]+),([-0-9]+),([-0-9]+),([-0-9]+),(.+)$/
			match : (data, result) ->
				_is = (result.splice 1, 1)[0] - 0
				id = 'animation'+_is
				unless data.animations?
					data.animations = {}
				unless data.animations[id]?
					data.animations[id] = {is : _is}
				@match_collision data.animations[id], result
		}
		{
			test : /^\s*animation(\d+)\.collisionex(\d+),([^,]+),(rect|ellipse),([-0-9]+),([-0-9]+),([-0-9]+),([-0-9]+)$/
			match : (data, result) ->
				_is = (result.splice 1, 1)[0] - 0
				id = 'animation'+_is
				unless data.animations?
					data.animations = {}
				unless data.animations[id]?
					data.animations[id] = {is : _is}
				@match_collisionex_4 data.animations[id], result
		}
		{
			test : /^\s*animation(\d+)\.collisionex(\d+),([^,]+),polygon,(.+)$/
			match : (data, result) ->
				_is = (result.splice 1, 1)[0] - 0
				id = 'animation'+_is
				unless data.animations?
					data.animations = {}
				unless data.animations[id]?
					data.animations[id] = {is : _is}
				@match_collisionex_n data.animations[id], result
		}
		{
			test : /^\s*collision(\d+),([-0-9]+),([-0-9]+),([-0-9]+),([-0-9]+),(.+)$/
			match : (data, result) ->
				@match_collision data, result
		}
		{
			test : /^\s*collisionex(\d+),([^,]+),(rect|ellipse),([-0-9]+),([-0-9]+),([-0-9]+),([-0-9]+)$/
			match : (data, result) ->
				@match_collisionex_4 data, result
		}
		{
			test : /^\s*collisionex(\d+),([^,]+),polygon,(.+)$/
			match : (data, result) ->
				@match_collisionex_n data, result
		}
		{
			test : /^\s*point(?:\.(kinoko))?\.(center[xy]),([-0-9]+)$/
			match : (data, result) ->
				[id, type, coordinate] = result[1 .. 3]
				coordinate -= 0
				unless data.points?
					data.points = {}
				if id?
					unless data.points[id]?
						data.points[id] = {}
					data.points[id][type] = coordinate
				else
					data.points[type] = coordinate
				true
		}
		{
			test : /^\s*point\.basepos\.([xy]),([-0-9]+)$/
			match : (data, result) ->
				[type, coordinate] = result[1 .. 2]
				coordinate -= 0
				unless data.points?
					data.points = {}
				unless data.points.basepos?
					data.points.basepos = {}
				data.points.basepos[type] = coordinate
				true
		}
		{
			test : /^\s*(?:(sakura|kero)\.)?balloon\.(offset[xy]),([-0-9]+)$/
			match : (data, result) ->
				[character, type, coordinate] = result[1 .. 3]
				coordinate -= 0
				unless data.balloons?
					data.balloons = {}
				if character?
					unless data.balloons[character]?
						data.balloons[character] = {}
					data.balloons[character][type] = coordinate
				else
					data.balloons[type] = coordinate
				true
		}
	]
	match_element : (data, result) ->
		[_is, type, file, x, y] = result[1 .. 5]
		_is -= 0
		x -= 0
		y -= 0
		id = 'element'+_is
		unless data.elements?
			data.elements = {}
		if data.elements[id]?
			@warnthrow 'element id duplication found : ' + _is, @options.check_surface_scope_duplication
			while data.elements[id]?
				id = 'element' + ++_is
			@warnthrow ' replace to : ' + _is, @options.check_surface_scope_duplication
		data.elements[id] = {is : _is, type : type, file : file, x : x, y : y}
		true
	match_animation_interval : (data, result) ->
		[_is, interval] = result[1 .. 2]
		_is -= 0
		id = 'animation'+_is
		unless data.animations?
			data.animations = {}
		if data.animations[id]?.interval?
			@warnthrow 'animation interval duplication found : ' + _is, @options.check_surface_scope_duplication
			while data.animations[id]?.interval?
				id = 'animation' + ++_is
			@warnthrow ' replace to : ' + _is, @options.check_surface_scope_duplication
		unless data.animations[id]?
			data.animations[id] = {is : _is}
		data.animations[id].interval = interval
		true
	match_animation_option : (data, result) ->
		[_is, option] = result[1 .. 2]
		_is -= 0
		id = 'animation'+_is
		unless data.animations?
			data.animations = {}
		if data.animations[id]?.option?
			@warnthrow 'animation option duplication found : ' + _is, @options.check_surface_scope_duplication
			while data.animations[id]?.option?
				id = 'animation' + ++_is
			@warnthrow ' replace to : ' + _is, @options.check_surface_scope_duplication
		unless data.animations[id]?
			data.animations[id] = {is : _is}
		data.animations[id].option = option
		true
	match_animation_pattern : (data, result) ->
		[_is, p_id, type, args_str] = result[1 .. 4]
		_is -= 0
		p_id -= 0
		id = 'animation'+_is
		unless data.animations?
			data.animations = {}
		unless data.animations[id]?
			data.animations[id] = {is : _is}
		unless data.animations[id].patterns?
			data.animations[id].patterns = []
		if data.animations[id].patterns[p_id]?
			@warnthrow 'animation pattern duplication found : ' + p_id, @options.check_surface_scope_duplication
			while data.animations[id].patterns[p_id]?
				++p_id
			@warnthrow ' replace to : ' + p_id, @options.check_surface_scope_duplication
		data.animations[id].patterns[p_id] = {type : type}
		args = {}
		switch type
			when 'overlay', 'overlayfast', 'reduce', 'replace', 'interpolate', 'asis', 'bind', 'add', 'reduce', 'move'
				[args.surface, args.wait, args.x, args.y] = args_str.split ','
				if args.surface? then args.surface -= 0
				if args.wait? and not isNaN(args.wait) then args.wait -= 0
				if args.x? then args.x -= 0
				if args.y? then args.y -= 0
			when 'base'
				[args.surface, args.wait] = args_str.split ','
				if args.surface? then args.surface -= 0
				if args.wait? and not isNaN(args.wait) then args.wait -= 0
			when 'insert', 'start', 'stop'
				args.animation_id = 'animation'+args_str
			when 'alternativestart', 'alternativestop'
				args.animation_ids = ('animation'+animation_id for animation_id in (args_str.split ','))
		for name, arg of args when arg?
			data.animations[id].patterns[p_id][name] = arg
		true
	match_animation_pattern_old : (data, result) ->
		[_is, p_id, surface, wait, type, args_str] = result[1 .. 6]
		_is -= 0
		p_id -= 0
		surface -= 0
		if wait_result = wait.match /(\d+)-(\d+)/
			wait = (wait_result[1] * 10) + '-' + (wait_result[2] * 10)
		else
			wait *= 10
		id = 'animation'+_is
		unless data.animations?
			data.animations = {}
		unless data.animations[id]?
			data.animations[id] = {is : _is}
		unless data.animations[id].patterns?
			data.animations[id].patterns = []
		if data.animations[id].patterns[p_id]?
			@warnthrow 'animation pattern duplication found : ' + p_id, @options.check_surface_scope_duplication
			while data.animations[id].patterns[p_id]?
				++p_id
			@warnthrow ' replace to : ' + p_id, @options.check_surface_scope_duplication
		data.animations[id].patterns[p_id] = {type : type}
		args = {}
		switch type
			when 'overlay', 'overlayfast', 'reduce', 'replace', 'interpolate', 'asis', 'bind', 'add', 'reduce', 'move'
				[args.surface, args.wait] = [surface, wait]
				if args_str
					[args.x, args.y] = args_str.split ','
					if args.x? then args.x -= 0
					if args.y? then args.y -= 0
			when 'base'
				[args.surface, args.wait] = [surface, wait]
			when 'insert', 'start', 'stop'
				args.animation_id = 'animation'+args_str
			when 'alternativestart', 'alternativestop'
				args.animation_ids = ('animation'+animation_id for animation_id in (args_str.split ','))
		for name, arg of args when arg?
			data.animations[id].patterns[p_id][name] = arg
		true
	match_collision : (data, result) ->
		[_is, left, top, right, bottom, name] = result[1 .. 6]
		_is -= 0
		left -= 0
		top -= 0
		right -= 0
		bottom -= 0
		id = 'collision'+_is
		unless data.regions?
			data.regions = {}
		if data.regions[id]?
			@warnthrow 'collision duplication found : ' + _is, @options.check_surface_scope_duplication
			while data.regions[id]?
				id = 'collision' + ++_is
			@warnthrow ' replace to : ' + _is, @options.check_surface_scope_duplication
		data.regions[id] = {is : _is, type : 'rect', name : name, left : left, top : top, right : right, bottom : bottom}
		true
	match_collisionex_4 : (data, result) ->
		[_is, name, type, left, top, right, bottom] = result[1 .. 7]
		_is -= 0
		left -= 0
		top -= 0
		right -= 0
		bottom -= 0
		id = 'collision'+_is
		unless data.regions?
			data.regions = {}
		if data.regions[id]?
			@warnthrow 'collisionex duplication found : ' + _is, @options.check_surface_scope_duplication
			while data.regions[id]?
				id = 'collision' + ++_is
			@warnthrow ' replace to : ' + _is, @options.check_surface_scope_duplication
		data.regions[id] = {is : _is, type : type, name : name, left : left, top : top, right : right, bottom : bottom}
		true
	match_collisionex_n : (data, result) ->
		[_is, name, coordinates_str] = result[1 .. 3]
		_is -= 0
		id = 'collision'+_is
		unless data.regions?
			data.regions = {}
		if data.regions[id]?
			@warnthrow 'collisionex duplication found : ' + _is, @options.check_surface_scope_duplication
			while data.regions[id]?
				id = 'collision' + ++_is
			@warnthrow ' replace to : ' + _is, @options.check_surface_scope_duplication
		coordinates = []
		coordinate = {}
		for c, index in coordinates_str.split(',')
			if index % 2 == 0
				coordinate.x = c - 0
			else
				coordinate.y = c - 0
				coordinates.push coordinate
				coordinate = {}
		if coordinate.x?
			@throw 'odd number of collisionex coordinates'
		data.regions[id] = {is : _is, type : 'polygon', name : name, coordinates : coordinates}
		true

SurfacesTxt2Yaml.txt_to_data = (txt_str, options) ->
	parser = new SurfacesTxt2Yaml.Parser(options)
	parser.parse txt_str

SurfacesTxt2Yaml.txt_to_yaml = (txt_str, options) ->
	data = SurfacesTxt2Yaml.txt_to_data txt_str, options
	try
		(jsyaml.dump data, indent : 4, flowLevel : 6).replace(/"y"/g, 'y')
	catch e
		throw e

if exports?
	exports.Parser = SurfacesTxt2Yaml.Parser
	exports.txt_to_data = SurfacesTxt2Yaml.txt_to_data
	exports.txt_to_yaml = SurfacesTxt2Yaml.txt_to_yaml
