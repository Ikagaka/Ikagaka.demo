### (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 ###
if require?
	jsyaml = require 'js-yaml'

SurfacesTxt2Yaml = {}

class SurfacesTxt2Yaml.Parser
	constructor : () ->
		
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
			result = null
			if not in_scope
				if result = line.match /^\s*charset,(.+)$/
					if parsed_data.charset?
						throw 'line '+(index + 1)+': charset duplication found'
					parsed_data.charset = result[1]
				else if result = line.match /^\s*(?:(descript)|(surface(?:\.append)?)(!?(?:\d+-)?\d+(?:,\s*(?:surface|!)?(?:\d+-)?\d+)*)|(sakura|kero|char\d+)\.(surface\.alias|cursor|tooltips))\s*({)?\s*$/
					if result[1] == 'descript'
						scope = 'descript'
					else if (result[2] == 'surface') or (result[2] == 'surface.append')
						scope = 'surface'
						scope_id_uniq = {}
						scope_id_delete = {}
						scope_id_str = 'surface'+result[3]
						ranges = result[3].split /,\s*(?:surface)?/
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
							else
								throw 'line '+(index + 1)+':wrong surface range'
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
						throw 'line '+(index + 1)+':scope bracket begun before scope name'
				else if not line.match /^\s*\/\/|^\s*$/ # comment or empty line
					console.warn 'line '+(index + 1)+': invalid line found in scope outside : '+line
			else if result = line.match /^\s*}\s*$/
				unless parsed_data[scope]?
					parsed_data[scope] = {}
				scope_parser = new SurfacesTxt2Yaml.ScopeParser[scope]()
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
			throw 'scope is not closed (missing closing bracket)'
		# reconstruction
		if parsed_data.surface?
			parsed_data.surfaces = parsed_data.surface
			delete parsed_data.surface
			for id, surface of parsed_data.surfaces
				result = null
				if result = id.match /^surface(\d+)$/
					surface.is = result[1]
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

SurfacesTxt2Yaml.ScopeParser = {}

class SurfacesTxt2Yaml.ScopeParser.Base
	constructor : () ->
		
	parse : (lines, index_offset) ->
		@index_offset = index_offset
		data = {}
		for line, index in lines
			@index = index
			result = null
			match = false
			for condition in @conditions
				if result = line.match condition.test
					condition.match.call @, data, result
					match = true
					break
			if not match and not line.match /^\s*\/\/|^\s*$/ # comment or empty line
				@warn 'invalid line found in scope inside : '+line
		delete @index_offset
		delete @index
		data
	warn : (message) ->
		console.warn 'line '+(@index_offset + @index + 1)+': '+message
	throw : (message) ->
		throw 'line '+(@index_offset + @index + 1)+': '+message

class SurfacesTxt2Yaml.ScopeParser.descript
	constructor : () ->
		
	parse : (lines, index_offset) ->
		data = {}
		for line, index in lines
			result = null
			if result = line.match /^\s*(maxwidth|version|collision-sort|animation-sort),(.+)$/
				data[result[1]] = result[2]
			else if not line.match /^\s*\/\/|^\s*$/ # comment or empty line
				console.warn 'line '+(index_offset + index + 1)+': invalid line found in scope inside : '+line
		data

class SurfacesTxt2Yaml.ScopeParser.tooltips
	constructor : () ->
		
	parse : (lines, index_offset) ->
		data = {}
		for line, index in lines
			result = null
			if result = line.match /^\s*([^,]+),(.+)$/
				data[result[1]] = result[2]
			else if not line.match /^\s*\/\/|^\s*$/ # comment or empty line
				console.warn 'line '+(index_offset + index + 1)+': invalid line found in scope inside : '+line
		data

class SurfacesTxt2Yaml.ScopeParser.cursor
	constructor : () ->
		
	parse : (lines, index_offset) ->
		data = {}
		for line, index in lines
			result = null
			if result = line.match /^\s*(mouseup|mousedown)(\d+),([^,]+),(.+)$/
				data[result[1]] = {region_id : result[3], file : result[4]}
			else if not line.match /^\s*\/\/|^\s*$/ # comment or empty line
				console.warn 'line '+(index_offset + index + 1)+': invalid line found in scope inside : '+line
		data

class SurfacesTxt2Yaml.ScopeParser['surface.alias']
	constructor : () ->
		
	parse : (lines, index_offset) ->
		data = {}
		for line, index in lines
			result = null
			if result = line.match /^\s*([^,]+),\[(.+)\]$/
				data[result[1]] = result[2].split /\s*,\s*/
			else if not line.match /^\s*\/\/|^\s*$/ # comment or empty line
				console.warn 'line '+(index_offset + index + 1)+': invalid line found in scope inside : '+line
		data

class SurfacesTxt2Yaml.ScopeParser.surface extends SurfacesTxt2Yaml.ScopeParser.Base
	conditions : [
		{
			test : /^\s*element(\d+),([^,]+),([^,]+),([-0-9]+),([-0-9]+)$/
			match : (data, result) ->
				@match_element data, result
		}
		{
			test : /^\s*animation(\d+)\.interval,(.+)$/
			match : (data, result) ->
				@match_animation_interval data, result
		}
		{
			test : /^\s*(\d+)interval,(.+)$/
			match : (data, result) ->
				@match_animation_interval data, result
		}
		{
			test : /^\s*animation(\d+)\.option,(.+)$/
			match : (data, result) ->
				@match_animation_option data, result
		}
		{
			test : /^\s*(\d+)option,(.+)$/
			match : (data, result) ->
				@match_animation_option data, result
		}
		{
			test : /^\s*animation(\d+)\.pattern(\d+),([^,]+),(.+)$/
			match : (data, result) ->
				@match_animation_pattern data, result
		}
		{
			test : /^\s*(\d+)pattern(\d+),([^,]+),([^,]+),([^,]+)(?:,(.+))?$/
			match : (data, result) ->
				@match_animation_pattern_old data, result
		}
		{
			test : /^\s*animation(\d+)\.collision(\d+),([-0-9]+),([-0-9]+),([-0-9]+),([-0-9]+),(.+)$/
			match : (data, result) ->
				_is = (result.splice 1, 1)[0]
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
				_is = (result.splice 1, 1)[0]
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
				_is = (result.splice 1, 1)[0]
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
				unless data.points?
					data.points = {}
				if id?
					unless data.points[id]?
						data.points[id] = {}
					data.points[id][type] = coordinate
				else
					data.points[type] = coordinate
		}
		{
			test : /^\s*point\.basepos\.([xy]),([-0-9]+)$/
			match : (data, result) ->
				[type, coordinate] = result[1 .. 2]
				unless data.points?
					data.points = {}
				unless data.points.basepos?
					data.points.basepos = {}
				data.points.basepos[type] = coordinate
		}
		{
			test : /^\s*(?:(sakura|kero)\.)?balloon\.(offset[xy]),([-0-9]+)$/
			match : (data, result) ->
				[character, type, coordinate] = result[1 .. 3]
				unless data.balloons?
					data.balloons = {}
				if character?
					unless data.balloons[character]?
						data.balloons[character] = {}
					data.balloons[character][type] = coordinate
				else
					data.balloons[type] = coordinate
		}
	]
	match_element : (data, result) ->
		[_is, type, file, x, y] = result[1 .. 5]
		id = 'element'+_is
		unless data.elements?
			data.elements = {}
		if data.elements[id]?
			@throw 'element id duplication found'
		data.elements[id] = {is : _is, type : type, file : file, x : x, y : y}
	match_animation_interval : (data, result) ->
		[_is, interval] = result[1 .. 2]
		id = 'animation'+_is
		unless data.animations?
			data.animations = {}
		unless data.animations[id]?
			data.animations[id] = {is : _is}
		if data.animations[id].interval?
			@throw 'animation interval duplication found'
		data.animations[id].interval = interval
	match_animation_option : (data, result) ->
		[_is, option] = result[1 .. 2]
		id = 'animation'+_is
		unless data.animations?
			data.animations = {}
		unless data.animations[id]?
			data.animations[id] = {is : _is}
		if data.animations[id].option?
			@throw 'animation option duplication found'
		data.animations[id].option = option
	match_animation_pattern : (data, result) ->
		[_is, p_id, type, args_str] = result[1 .. 4]
		id = 'animation'+_is
		unless data.animations?
			data.animations = {}
		unless data.animations[id]?
			data.animations[id] = {is : _is}
		unless data.animations[id].patterns?
			data.animations[id].patterns = []
		if data.animations[id].patterns[p_id]?
			@throw 'animation pattern duplication found'
		data.animations[id].patterns[p_id] = {type : type}
		args = {}
		switch type
			when 'overlay', 'overlayfast', 'reduce', 'replace', 'interpolate', 'asis', 'bind', 'add', 'reduce', 'move'
				[args.surface, args.wait, args.x, args.y] = args_str.split ','
			when 'base'
				[args.surface, args.wait] = args_str.split ','
			when 'insert', 'start', 'stop'
				args.animation_id = 'animation'+args_str
			when 'alternativestart', 'alternativestop'
				args.animation_ids = ('animation'+animation_id for animation_id in (args_str.split ','))
		for name, arg of args when arg?
			data.animations[id].patterns[p_id][name] = arg
	match_animation_pattern_old : (data, result) ->
		[_is, p_id, surface, wait, type, args_str] = result[1 .. 6]
		id = 'animation'+_is
		unless data.animations?
			data.animations = {}
		unless data.animations[id]?
			data.animations[id] = {is : _is}
		unless data.animations[id].patterns?
			data.animations[id].patterns = []
		if data.animations[id].patterns[p_id]?
			@throw 'animation pattern duplication found'
		data.animations[id].patterns[p_id] = {type : type}
		args = {}
		switch type
			when 'overlay', 'overlayfast', 'reduce', 'replace', 'interpolate', 'asis', 'bind', 'add', 'reduce', 'move'
				[args.surface, args.wait] = [surface, wait * 10]
				[args.x, args.y] = args_str.split ','
			when 'base'
				[args.surface, args.wait] = [surface, wait * 10]
			when 'insert', 'start', 'stop'
				args.animation_id = 'animation'+args_str
			when 'alternativestart', 'alternativestop'
				args.animation_ids = ('animation'+animation_id for animation_id in (args_str.split ','))
		for name, arg of args when arg?
			data.animations[id].patterns[p_id][name] = arg
	match_collision : (data, result) ->
		[_is, left, top, right, bottom, name] = result[1 .. 6]
		id = 'collision'+_is
		unless data.regions?
			data.regions = {}
		if data.regions[id]?
			@throw 'collision duplication found'
		data.regions[id] = {is : _is, type : 'rect', name : name, left : left, top : top, right : right, bottom : bottom}
	match_collisionex_4 : (data, result) ->
		[_is, name, type, left, top, right, bottom] = result[1 .. 7]
		id = 'collision'+_is
		unless data.regions?
			data.regions = {}
		if data.regions[id]?
			@throw 'collisionex duplication found'
		data.regions[id] = {is : _is, type : type, name : name, left : left, top : top, right : right, bottom : bottom}
	match_collisionex_n : (data, result) ->
		[_is, name, coordinates_str] = result[1 .. 3]
		id = 'collision'+_is
		unless data.regions?
			data.regions = {}
		if data.regions[id]?
			@throw 'collisionex duplication found'
		coordinates = []
		coordinate = {}
		for c, index in coordinates_str.split(',')
			if index % 2 == 0
				coordinate.x = c
			else
				coordinate.y = c
				coordinates.push coordinate
				coordinate = {}
		if coordinate.x?
			@throw 'odd number of collisionex coordinates'
		data.regions[id] = {is : _is, type : 'polygon', name : name, coordinates : coordinates}

SurfacesTxt2Yaml.txt_to_data = (txt_str) ->
	parser = new SurfacesTxt2Yaml.Parser()
	parser.parse txt_str

SurfacesTxt2Yaml.txt_to_yaml = (txt_str) ->
	data = SurfacesTxt2Yaml.txt_to_data txt_str
	try
		(jsyaml.dump data, indent : 4, flowLevel : 6).replace(/"([0-9-]+)"/g, '$1').replace(/"y"/g, 'y')
	catch e
		throw e

if exports?
	exports.Parser = SurfacesTxt2Yaml.Parser
	exports.txt_to_data = SurfacesTxt2Yaml.txt_to_data
	exports.txt_to_yaml = SurfacesTxt2Yaml.txt_to_yaml
