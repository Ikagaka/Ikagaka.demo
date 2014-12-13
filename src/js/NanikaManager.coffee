Promise = @Promise
Nanika = @Nanika
EventEmitter = @EventEmitter2

class NanikaManager extends EventEmitter
	constructor: (@storage, @profile, @namedmanager, @options) ->
		@nanikas = {}
	boot: (dirpath, event, args) ->
		new Promise (resolve, reject) =>
			if @nanikas[dirpath]?
				reject new Error("ghost [#{dirpath}] already running")
			profile = @profile.ghost(dirpath)
			nanika = new Nanika(@, @storage, @namedmanager, dirpath, profile, @options)
			nanika.on 'halted', =>
				nanika = @nanikas[dirpath]
				delete @nanikas[dirpath]
				@emit 'ghost.halted', dirpath, nanika
			nanika.options.append_path = "./vendor/js/"
			nanika.options.logging = true
			nanika.boot(event, args)
			.then =>
				@nanikas[dirpath] = nanika
				switch event
					when 'boot' then @emit 'ghost.booted', dirpath, nanika
					when 'change' then @emit 'ghost.changed', dirpath, nanika
					when 'call' then @emit 'ghost.called', dirpath, nanika
				resolve()
	call: (old_dirpath, new_dirpath) ->
	change: (old_dirpath, new_dirpath) ->
		change = (dirpath, nanika) =>
			if dirpath == old_dirpath
				@off 'ghost.halted', change
				@boot new_dirpath, 'change', from: nanika
		@on 'ghost.halted', change
		@halt old_dirpath, 'change'
	halt: (dirpath, event, args) ->
		unless @nanikas[dirpath]? then throw "ghost [#{dirpath}] not running"
		@nanikas.send_halt(event, args)
