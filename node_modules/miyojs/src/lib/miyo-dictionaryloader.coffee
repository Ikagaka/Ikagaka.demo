if require?
	fs = require 'fs'
	path = require 'path'
	jsyaml = require 'js-yaml'

Miyo.DictionaryLoader =
	load_recursive : (directory) ->
		dictionary = null
		elements = fs.readdirSync directory
		for element in elements
			element_path = path.join directory, element
			dictionary_part = null
			if fs.statSync(element_path).isDirectory()
				dictionary_part = @load_recursive element_path
			else if path.extname(element_path) == '.yaml'
				dictionary_part = @load element_path
			if dictionary_part?
				unless dictionary?
					dictionary = {}
				try
					@merge_dictionary dictionary_part, dictionary
				catch error
					throw "processing directories in [#{element_path}]\n#{error}"
		dictionary
	load : (file) ->
		yaml_str = fs.readFileSync(file, 'utf8').replace /\t/g, ' '
		jsyaml.safeLoad yaml_str
	merge_dictionary : (source, destination) ->
		for id, s_entry of source
			if destination[id]?
				d_entry = destination[id]
				s_is_array = s_entry instanceof Array
				d_is_array = d_entry instanceof Array
				if s_is_array and d_is_array
					destination[id] = d_entry.concat s_entry
				else if not s_is_array and not d_is_array
					for key, value of s_entry
						if d_entry[key]?
							throw "Dictionary Load Error: entry [#{id}] has duplicated key [#{key}]"
						else
							d_entry[key] = s_entry[key]
				else
					throw "Dictionary Load Error: entry [#{id}] is duplicated and has unmatch contents"
			else
				destination[id] = source[id]
		return
