module.exports = (grunt) ->
	grunt.initConfig
		banner: "/* (C) 2014 Narazaka : Licensed under The MIT License - http://narazaka.net/license/MIT?#{(new Date()).getFullYear()} */\n"
		dir:
			src: 'src'
			dist: '.'
			build: 'build'
			doc: 'doc'
			type:
				html: '.'
				jade: '.'
				js: 'js'
				coffee: 'js'
				css: 'css'
				stylus: 'css'
				image: 'img'
				styleguide: 'styleguide'
				vendor: 'vendor'
				bin: 'bin'
		# init
		bower:
			install:
				options:
					targetDir: '<%= dir.src %>/<%= dir.type.vendor %>'
					layout: (type, component) ->
						if type == 'css'
							'css'
						else if type == 'js' or type == '__untyped__'
							'js'
						else
							type
					install: true
					verbose: false
					cleanTargetDir: false
					cleanBowerDir: false
		# devel
		csslint:
			options:
				csslintrc: '.csslintrc'
			lint:
				src: ['<%= dir.dist %>/<%= dir.type.css %>/**/*.css']
		coffeelint:
			lint: '<%= dir.src %>/<%= dir.type.coffee %>/**/*.coffee'
		simplemocha:
			options:
				globals: ['should']
				timeout: 3000
				ignoreLeaks: false
				grep: '*-test'
				ui: 'bdd'
				reporter: 'spec'
			test:
				expand: true
				cwd: '<%= dir.test %>/<%= dir.type.coffee %>'
				src: '**/*.coffee'
		# dist
		jade:
			options:
				pretty: true
			dist:
				expand: true
				cwd: '<%= dir.src %>/<%= dir.type.jade %>/'
				src: '**/*.jade'
				dest: '<%= dir.dist %>/<%= dir.type.html %>/'
				ext: '.html'
		stylus:
			options:
				compress: false
			dist:
				expand: true
				cwd: '<%= dir.src %>/<%= dir.type.stylus %>'
				src: '**/*.styl'
				dest: '<%= dir.dist %>/<%= dir.type.css %>'
				ext: '.css'
		coffee:
			options:
				bare: yes
			dist:
				expand: true
				cwd: '<%= dir.src %>/<%= dir.type.coffee %>'
				src: '**/*.coffee'
				dest: '<%= dir.dist %>/<%= dir.type.js %>'
				ext: '.js'
		autoprefixer:
			options:
				browsers: ['last 2 version']
			dist:
				expand: true
				cwd: '<%= dir.dist %>/<%= dir.type.css %>'
				src: '**/*.css'
				dest: '<%= dir.dist %>/<%= dir.type.css %>/'
				ext: '.css'
		# build
		htmlmin:
			build:
				options:
					removeComments: true
					removeCommentsFromCDATA: true,
					removeCDATASectionsFromCDATA: true,
					collapseWhitespace: true,
					removeRedundantAttributes: true,
					removeOptionalTags: true
				expand: true,
				cwd: '<%= dir.dist %>/<%= dir.type.html %>'
				src: '**/*.html'
				dest: '<%= dir.build %>/<%= dir.type.html %>'
				ext: '.html'
		cmq: # combine-media-queries
			options:
				log: false
			build:
				files:
					'<%= dir.build %>/<%= dir.type.css %>': '<%= dir.dist %>/<%= dir.type.css %>/**/*.css'
		cssmin:
			build:
				expand: true
				cwd: '<%= dir.dist %>/<%= dir.type.css %>'
				src: '**/*.css'
				dest: '<%= dir.build %>/<%= dir.type.css %>'
				ext: '.css'
		uglify:
			build:
				options:
					banner: '<%= banner %>'
#					sourceMap: (path) ->
#						path + '.map'
				expand : true
				cwd: '<%= dir.dist %>/<%= dir.type.js %>'
				src: '**/*.js'
				dest: '<%= dir.build %>/<%= dir.type.js %>'
				ext: '.js'
			build_vendor:
				expand : true
				cwd: '<%= dir.dist %>/<%= dir.type.vendor %>'
				src: '**/*.js'
				dest: '<%= dir.build %>/<%= dir.type.vendor %>'
		# copy
		copy:
			bin:
				expand: true
				dot: true
				cwd: '<%= dir.src %>/<%= dir.type.bin %>'
				src: '**'
				dest: '<%= dir.dist %>/<%= dir.type.bin %>'
			image:
				expand: true
				dot: true
				cwd: '<%= dir.src %>/<%= dir.type.image %>'
				src: '**/*.{jpeg,jpg,gif,png,svg,webp}'
				dest: '<%= dir.dist %>/<%= dir.type.image %>'
			vendor:
				expand: true
				dot: true
				cwd: '<%= dir.src %>/<%= dir.type.vendor %>'
				src: '**'
				dest: '<%= dir.dist %>/<%= dir.type.vendor %>'
			build:
				expand: true
				dot: false
				cwd: '<%= dir.dist %>/'
				src: '**'
				dest: '<%= dir.build %>/'
		# clean
		clean:
			dist:
				src: [
					'<%= dir.dist %>/<%= dir.type.html %>/**/*.html'
					'<%= dir.dist %>/<%= dir.type.css %>/**/*.css'
					'<%= dir.dist %>/<%= dir.type.js %>/**/*.js'
					'<%= dir.build %>'
				]
			build:
				src: [
					'<%= dir.build %>'
				]
			doc:
				src: '<%= dir.doc %>'
			image:
				src: '<%= dir.dist %>/<%= dir.type.image %>/**'
		# watch
		watch:
			options:
				livereload: 3010
			jade:
				files: '<%= dir.src %>/<%= dir.type.jade %>/**/*.jade'
				tasks: 'jade:dist'
			stylus:
				files: '<%= dir.src %>/<%= dir.type.stylus %>/**/*.styl'
				tasks: ['stylus:dist', 'autoprefixer:dist']
#				tasks: ['stylus:dist', 'autoprefixer:dist', 'styleguide:dist']
			coffee:
				files: '<%= dir.src %>/<%= dir.type.coffee %>/**/*.coffee'
				tasks: 'coffee:dist'
			image:
				files: '<%= dir.src %>/<%= dir.type.image %>/**/*.{jpeg,jpg,gif,png,svg,webp}'
				tasks: ['clean:image', 'copy:image']
			vendor:
				files: '<%= dir.src %>/<%= dir.type.vendor %>'
				tasks: ['copy:vendor']
		connect:
			options:
				host: 'localhost'
				port: 3000
				livereload: 3010
			front:
				options:
					open: false
					base: '<%= dir.dist %>'
	grunt.registerTask 'default', [
#		'clean'
		'jade:dist'
		'stylus:dist'
		'coffee:dist'
		'autoprefixer'
		'copy:image'
		'copy:bin'
		'copy:vendor'
	]
#	grunt.registerTask 'build', [
#		'default'
#		'copy:build'
#		'htmlmin:build'
#		'cmq:build'
#		'cssmin:build'
#		'uglify:build'
#		'uglify:build_vendor'
#	]
	grunt.registerTask 'dev', [
		'default'
		'configureProxies'
		'connect:front'
		'watch'
	]
	grunt.registerTask 'chk', [
		'default'
#		'csscss:check'
		'csslint:lint'
		'coffeelint:lint'
		'simplemocha:test'
	]
	grunt.registerTask 'srv', [
		'configureProxies'
		'connect:front'
		'watch'
	]
	require('jit-grunt') grunt,
		bower: 'grunt-bower-task'
		simplemocha: 'grunt-simple-mocha'
		configureProxies: 'grunt-connect-proxy'
		cmq: 'grunt-combine-media-queries'
