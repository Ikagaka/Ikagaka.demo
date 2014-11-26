all:
	coffee -o ../bin -c bin/surfaces_txt2yaml.coffee
	cat lib/util.coffee lib/surfaces_txt2yaml.coffee | coffee -cb --stdio > ../lib/surfaces_txt2yaml.js 
	node -e "fs=require('fs');c='#!/usr/bin/env node\n'+fs.readFileSync('../bin/surfaces_txt2yaml.js');fs.writeFileSync('../bin/surfaces_txt2yaml.js', c)"
