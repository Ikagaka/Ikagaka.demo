class NanikaStorage
	constructor: (@ghosts={}, @balloons={}) ->
	ghost: (dirpath) ->
		unless @ghosts[dirpath]? then throw "ghost not found at [#{dirpath}]"
		@ghosts[dirpath]
	balloon: (dirpath) ->
		unless @balloons[dirpath]? then throw "balloon not found at [#{dirpath}]"
		@balloons[dirpath]
	ghost_master: (dirpath) ->
		@ghost(dirpath).getDirectory('ghost/master')
	shell: (dirpath, shellpath) ->
		@ghost(dirpath).getDirectory('shell/' + shellpath)
	ghost_names: ->
		Object.keys(@ghosts)
		.map (directory) => @ghosts[directory].install.name
		.sort()
	balloon_names: ->
		Object.keys(@balloons)
		.map (directory) => @balloons[directory].install.name
		.sort()
	install_nar: (nar, ghost) ->
		switch nar.install.type
			when 'ghost'
				@install_ghost nar
			when 'balloon'
				@install_balloon nar
			when 'supplement'
				@install_supplement nar, ghost
			when 'shell'
				@install_shell nar, ghost
			when 'package'
				@install_package nar, ghost
			else
				throw 'not supported'
	install_ghost: (nar) ->
		unless nar.install?.directory then throw "install.txt directory entry required"
		if nar.install['balloon.directory']
			balloon_directory = nar.install['balloon.directory']
			balloon_nar = nar.getDirectory(balloon_directory, has_install: true)
			@install_balloon balloon_nar
			nar = nar.removeElements(balloon_directory)
		directory = @merge_directory(@ghosts[nar.install.directory], nar)
		@ghosts[nar.install.directory] = directory
	install_balloon: (nar) ->
		unless nar.install?.directory then throw "install.txt directory entry required"
		directory = @merge_directory(@balloons[nar.install.directory], nar)
		@balloons[nar.install.directory] = directory
	install_supplement: (nar, ghost) ->
		throw 'not supported'
	install_shell: (nar, ghost) ->
		unless nar.install?.directory then throw "install.txt directory entry required"
		nar = nar.wrapDirectory(nar.install.directory)
		throw 'not supported'
	install_package: (nar, ghost) ->
		for child in nar.listChildren()
			directory = nar.getDirectory(child)
			if Object.keys(directory.files).length
				@install_nar directory, ghost
	uninstall_ghost: (directory) ->
		delete @ghosts[directory]
	uninstall_balloon: (directory) ->
		delete @balloons[directory]
	merge_directory: (directory=null, new_directory) ->
		if directory?
			if new_directory.install?.refresh
				if new_directory.install?.refreshundeletemask
					undelete_elements = new_directory.install.refreshundeletemask.split /:/
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
