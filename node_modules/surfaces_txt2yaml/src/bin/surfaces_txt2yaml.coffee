### (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?2014 ###
fs = require 'fs'
SurfacesTxt2Yaml = require 'surfaces_txt2yaml'

toyaml = (file, file_out) ->
	txt_str = fs.readFileSync file, 'utf8'
	yaml = SurfacesTxt2Yaml.txt_to_yaml txt_str
	fs.writeFileSync file_out, yaml, 'utf8'

if process.argv.length != 4
	console.log 'Usage : surface_txt2yaml surfaces.txt surfaces.yaml'
else
	toyaml process.argv[2], process.argv[3]
