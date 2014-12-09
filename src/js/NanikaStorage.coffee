class NanikaStorage
	constructor: (@ghosts={}, @balloons={}) ->
	ghost: (dirpath) ->
		unless @ghosts[dirpath]? then throw new Error "ghost not found at [#{dirpath}]"
		@ghosts[dirpath]
	balloon: (dirpath) ->
		unless @balloons[dirpath]? then throw new Error "balloon not found at [#{dirpath}]"
		@balloons[dirpath]
	ghost_master: (dirpath) ->
		ghost = @ghost(dirpath)
		console.log ghost
		unless ghost.hasElement('ghost/master') then throw new Error "ghost/master not found at [#{dirpath}]"
		ghost.getDirectory('ghost/master')
	shell: (dirpath, shellpath) ->
		ghost = @ghost(dirpath)
		unless ghost.hasElement('shell/' + shellpath) then throw new Error "shell/#{shellpath} not found at [#{dirpath}]"
		ghost.getDirectory('shell/' + shellpath)
	ghost_names: ->
		Object.keys(@ghosts)
		.map (directory) => @ghosts[directory].install.name
		.sort()
	balloon_names: ->
		Object.keys(@balloons)
		.map (directory) => @balloons[directory].install.name
		.sort()
	install_nar: (nar, dirpath) ->
		switch nar.install.type
			when 'ghost'
				@install_ghost nar, dirpath
			when 'balloon'
				@install_balloon nar, dirpath
			when 'supplement'
				@install_supplement nar, dirpath
			when 'shell'
				@install_shell nar, dirpath
			when 'package'
				@install_package nar, dirpath
			else
				throw new Error 'not supported'
	install_ghost: (nar, dirpath) ->
		install = nar.install || {}
		unless install.directory then throw new Error "install.txt directory entry required"
		target_directory = install.directory
		{nar, install_results} = @install_children(nar, dirpath)
		@ghosts[target_directory] = @merge_directory(@ghosts[target_directory], nar)
		install_results.push {type: 'ghost', directory: target_directory}
		return install_results
	install_balloon: (nar, dirpath) ->
		install = nar.install || {}
		unless install.directory then throw new Error "install.txt directory entry required"
		target_directory = install.directory
		install_results = []
		@balloons[target_directory] = @merge_directory(@balloons[target_directory], nar)
		install_results.push {type: 'balloon', directory: target_directory}
		return install_results
	install_supplement: (nar, dirpath) ->
		unless dirpath then throw new Error "ghost information required"
		ghost = @ghost(dirpath)
		if install.accept? and install.accept != ghost.install.name then return null
		throw 'not supported'
	install_shell: (nar, dirpath) ->
		install = nar.install || {}
		unless dirpath then throw new Error "ghost information required"
		unless install.directory then throw new Error "install.txt directory entry required"
		target_directory = install.directory
		{nar, install_results} = @install_children(nar, dirpath)
		ghost = @ghost(dirpath)
		if install.accept? and install.accept != ghost.install.name then return null
		shell = ghost.getDirectory('shell/' + target_directory)
		shell = @merge_directory(shell, nar)
		shell = shell.wrapDirectory(target_directory).wrapDirectory('shell')
		@ghosts[dirpath] = @merge_directory(@ghosts[dirpath], shell)
		install_results.push {type: 'shell', directory: target_directory}
		return install_results
	install_package: (nar, dirpath) ->
		install_results = []
		for child in nar.listChildren()
			directory = nar.getDirectory(child)
			if Object.keys(directory.files).length
				child_install_results = @install_nar directory, dirpath
				install_results = install_results.concat child_install_results
		return install_results
	install_children: (nar, dirpath) ->
		install = nar.install || {}
		install_results = []
		for type in ['balloon', 'headline', 'plugin']
			if install[type + '.directory']?
				if install[type + '.source.directory']?
					child_source_directory = install[type + '.source.directory']
				else
					child_source_directory = install[type + '.directory']
				child_nar = nar.getDirectory(child_source_directory)
				unless child_nar.install? then child_nar.install = {}
				child_install = child_nar.install
				child_install.type ?= type
				child_install.directory ?= install[type + '.directory']
				if install[type + '.refresh']? then child_install.refresh ?= install[type + '.refresh']
				if install[type + '.refreshundeletemask']? then child_install.refreshundeletemask ?= install[type + '.refreshundeletemask']
				child_install_results = @install_nar child_nar, dirpath
				install_results = install_results.concat child_install_results
				nar = nar.removeElements(child_source_directory)
		nar: nar, install_results: install_results
	uninstall_ghost: (directory) ->
		delete @ghosts[directory]
	uninstall_balloon: (directory) ->
		delete @balloons[directory]
	merge_directory: (directory=null, new_directory) ->
		install = new_directory.install || {}
		if directory?
			if install.refresh
				if install.refreshundeletemask
					undelete_elements = install.refreshundeletemask.split /:/
					directory = directory.getElements(undelete_elements)
				else
					directory = null
		if directory?
			for path of new_directory.files
				directory.files[path] = new_directory.files[path]
			directory.parse()
		else
			directory = new_directory
		directory

if module?.exports?
	module.exports = NanikaStorage
else if @Ikagaka?
	@Ikagaka.NanikaStorage = NanikaStorage
else
	@NanikaStorage = NanikaStorage
