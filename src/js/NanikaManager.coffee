Promise = @Promise
Nanika = @Nanika
EventEmitter = @EventEmitter2

class NanikaManager extends EventEmitter
	constructor: (@storage, @profile, @namedmanager, @options) ->
		@setMaxListeners(0)
		@nanikas = {}
	existing_ghosts: -> Object.keys(@nanikas)
	is_existing_ghost: (dirpath) -> @nanikas[dirpath]?
	bootall: ->
		if @profile.profile.ghosts?
			for dirpath in @profile.profile.ghosts
				@boot dirpath
	boot: (dirpath) ->
		@materialize dirpath
		.then (nanika) =>
			if nanika.profile.profile.boot_count == 1
				promise = @transact_firstboot nanika, nanika.profile.profile.vanish_count || 0
			else
				promise = @transact_boot nanika, false, null
			promise
			.then (boot_script) =>
				return
	change: (src_dirpath, dst_dirpath, reason='manual') ->
		src_nanika = @nanikas[src_dirpath]
		src_nanika_descript =
			ghost: src_nanika.ghost.descript
			shell: src_nanika.named.shell.descript
		new Promise (resolve, reject) =>
			unless src_nanika? then reject new Error "ghost [#{src_dirpath}] not running"
#			if @nanikas[dst_dirpath]? then reject new Error("ghost [#{dst_dirpath}] already running")
			resolve()
		.then =>
			@storage.ghost_master(dst_dirpath)
		.then (dst_ghost_master) =>
			halt_promise = new Promise (resolve, reject) ->
				src_nanika.on 'halted', -> resolve()
			close_promise = new Promise (resolve, reject) =>
				@no_halt = true
				@transact_changing src_nanika, dst_ghost_master, reason
				.then (changing_script) =>
					unless changing_script?
						delete @no_halt
						return
					src_nanika.halt()
					resolve changing_script
			Promise.all [close_promise, halt_promise]
		.then ([changing_script]) =>
			@materialize dst_dirpath
			.then (dst_nanika) =>
				delete @no_halt
				if dst_nanika.profile.profile.boot_count == 1
					promise = @transact_firstboot dst_nanika, dst_nanika.profile.profile.vanish_count || 0
				else
					promise = @transact_changed src_nanika_descript, dst_nanika, changing_script
				promise
				.then (changed_script) =>
					for other_dirpath, other_nanika of @nanikas
						if src_dirpath != other_dirpath and dst_dirpath != other_dirpath
							@transact_otherchanged other_nanika, src_nanika_descript, dst_nanika, changing_script, changed_script
					return
	call: (src_dirpath, dst_dirpath, reason='manual') ->
		src_nanika = @nanikas[src_dirpath]
		new Promise (resolve, reject) =>
			unless src_nanika? then reject new Error "ghost [#{src_dirpath}] not running"
			if @nanikas[dst_dirpath]? then reject new Error("ghost [#{dst_dirpath}] already running")
			@storage.ghost_master(dst_dirpath)
			.then (dst_ghost_master) =>
				resolve @transact_calling src_nanika, dst_ghost_master, reason
		.then (calling_script) =>
			unless calling_script? then return
			@materialize dst_dirpath
			.then (dst_nanika) =>
				if dst_nanika.profile.profile.boot_count == 1
					promise = @transact_firstboot dst_nanika, dst_nanika.profile.profile.vanish_count || 0
				else
					promise = @transact_called src_nanika, dst_nanika, calling_script
				promise
				.then (called_script) =>
					@transact_callcomplete src_nanika, dst_nanika, called_script
					for other_dirpath, other_nanika of @nanikas
						if src_dirpath != other_dirpath and dst_dirpath != other_dirpath
							@transact_otherbooted other_nanika, dst_nanika, called_script
					return
	close: (dirpath, reason='user') ->
		nanika = @nanikas[dirpath]
		nanika_descript =
			ghost: nanika.ghost.descript
			shell: nanika.named.shell.descript
		new Promise (resolve, reject) =>
			unless nanika? then throw "ghost [#{dirpath}] not running"
			resolve()
		.then =>
			halt_promise = new Promise (resolve, reject) ->
				nanika.on 'halted', -> resolve()
			close_promise = new Promise (resolve, reject) =>
				@transact_close nanika, reason
				.then (close_script) =>
					unless close_script? then return
					nanika.halt()
					resolve close_script
			Promise.all [close_promise, halt_promise]
		.then ([close_script]) =>
			for other_dirpath, other_nanika of @nanikas
				if dirpath != other_dirpath
					@transact_otherclosed other_nanika, nanika_descript, close_script
	closeall: (reason='user') ->
		@haltghosts = Object.keys @nanikas
		promises = []
		for dirpath, nanika of @nanikas
			promise = @transact_closeall nanika, reason
			.then ((nanika) =>
				(script) =>
					if script?
						nanika.halt()
					else
						delete @haltghosts
			)(nanika)
			promises.push promise
		Promise.all promises
	materialize: (dirpath) ->
		new Promise (resolve, reject) =>
			if @nanikas[dirpath]?
				return reject new Error("ghost [#{dirpath}] already running")
			profile = @profile.ghost(dirpath)
			nanika = new Nanika(@, @storage, @namedmanager, dirpath, profile, NanikaPlugin, NanikaEventDefinition, @options)
			nanika.on 'halted', =>
				@halted(dirpath)
			nanika.options.append_path = "./vendor/js/"
			nanika.options.logging = true
			nanika.materialize()
			.then (nanika) =>
				@nanikas[dirpath] = nanika
				@emit 'change.existing.ghosts'
				resolve nanika
	halted: (dirpath) ->
		delete @nanikas[dirpath]
		@emit 'change.existing.ghosts'
		if not @no_halt and not Object.keys(@nanikas).length
			if @haltghosts
				@profile.profile.ghosts = @haltghosts
			else
				@profile.profile.ghosts = [dirpath]
			@destroy()
	destroy: ->
		@emit 'destroy'
		delete @storage
		delete @profile
		delete @namedmanager
		delete @options
		delete @nanikas
		@emit 'destroyed'
		@removeAllListeners()
	communicate: (from, to, script, args, age, surface) ->
		if to == '__SYSTEM_ALL_GHOST__'
			to_match = {}
			for dirpath, nanika of @nanikas
				to_match[nanika.ghost.descript['sakura.name']] = true
		else if /\x01/.test to
			to_match = {}
			for to_single in to.split /\x01/
				to_match[to_single] = true
		else
			to_match = to: true
		for dirpath, nanika of @nanikas
			if to_match[nanika.ghost.descript['sakura.name']]
				nanika.request 'communicate',
					sender: from
					content: script
					args: args
					age: age
					surface: surface
	_request_callback: (resolve) ->
		(args) -> unless args.value?.length then resolve('')
	_request_ssp_callbacks: (resolve) ->
		finish: (args) -> resolve(args.value)
		reject: (args) -> resolve(null)
		break: (args) -> resolve(null)
	transact_firstboot: (nanika, vanish_count) ->
		new Promise (resolve, reject) =>
			nanika.request 'firstboot',
				vanish_count: vanish_count
			, @_request_callback(resolve), @_request_ssp_callbacks(resolve)
		.then (script) =>
			if script?.length
				script
			else
				@transact_boot nanika, false, null
	transact_boot: (nanika, halted, halted_ghost) ->
		new Promise (resolve, reject) =>
			nanika.request 'boot',
				shell_name: nanika.named.shell.descript.name
				halted: false
				halted_ghost: null
			, @_request_callback(resolve), @_request_ssp_callbacks(resolve)
	transact_close: (nanika, reason) ->
		new Promise (resolve, reject) =>
			nanika.request 'close',
				reason: reason
			, @_request_callback(resolve), @_request_ssp_callbacks(resolve)
	transact_closeall: (nanika, reason) ->
		new Promise (resolve, reject) =>
			nanika.request 'closeall',
				reason: reason
			, @_request_callback(resolve), @_request_ssp_callbacks(resolve)
		.then (script) =>
			if script?.length
				script
			else
				@transact_close nanika, reason
	transact_changed: (src_nanika_descript, dst_nanika, changing_script) ->
		new Promise (resolve, reject) =>
			dst_nanika.request 'changed',
				from_sakuraname: src_nanika_descript.ghost['sakura.name']
				from_script: changing_script
				from_name: src_nanika_descript.ghost.name
				shell_name: dst_nanika.named.shell.descript.name
			, @_request_callback(resolve), @_request_ssp_callbacks(resolve)
		.then (script) =>
			if script?.length
				script
			else
				@transact_boot dst_nanika, false, null
	transact_changing: (src_nanika, dst_ghost_master, reason) ->
		new Promise (resolve, reject) =>
			src_nanika.request 'changing',
				to_sakuraname: dst_ghost_master.descript['sakura.name']
				reason: reason
				to_name: dst_ghost_master.descript.name
			, @_request_callback(resolve), @_request_ssp_callbacks(resolve)
		.then (script) =>
			if script?.length
				script
			else
				@transact_close src_nanika, 'user'
	transact_called: (src_nanika, dst_nanika, calling_script) ->
		new Promise (resolve, reject) =>
			dst_nanika.request 'called',
				from_sakuraname: src_nanika.ghost.descript['sakura.name']
				from_script: calling_script
				from_name: src_nanika.ghost.descript.name
				shell_name: dst_nanika.named.shell.descript.name
			, @_request_callback(resolve), @_request_ssp_callbacks(resolve)
		.then (script) =>
			if script?.length
				script
			else
				@transact_boot dst_nanika, false, null
	transact_calling: (src_nanika, dst_ghost_master, reason) ->
		new Promise (resolve, reject) =>
			src_nanika.request 'calling',
				other_sakuraname: dst_ghost_master.descript['sakura.name']
				reason: reason
				other_name: dst_ghost_master.descript.name
			, @_request_callback(resolve), @_request_ssp_callbacks(resolve)
	transact_callcomplete: (src_nanika, dst_nanika, called_script) ->
		new Promise (resolve, reject) =>
			src_nanika.request 'callcomplete',
				other_sakuraname: dst_nanika.ghost.descript['sakura.name']
				other_script: called_script
				other_name: dst_nanika.ghost.descript.name
				other_shell_name: dst_nanika.named.shell.descript.name
			, @_request_callback(resolve), @_request_ssp_callbacks(resolve)
	transact_otherbooted: (other_nanika, nanika, boot_script) ->
		new Promise (resolve, reject) =>
			other_nanika.request 'otherbooted',
				other_sakuraname: nanika.ghost.descript['sakura.name']
				other_script: boot_script
				other_name: nanika.ghost.descript.name
				other_shell_name: nanika.named.shell.descript.name
			, @_request_callback(resolve), @_request_ssp_callbacks(resolve)
	transact_otherchanged: (other_nanika, src_nanika_descript, dst_nanika, changing_script, changed_script) ->
		new Promise (resolve, reject) =>
			other_nanika.request 'otherchanged',
				from_sakuraname: src_nanika_descript.ghost['sakura.name']
				to_sakuraname: dst_nanika.ghost.descript['sakura.name']
				from_script: changing_script
				to_script: changed_script
				from_name: src_nanika_descript.ghost.name
				to_name: dst_nanika.ghost.descript.name
				from_shell_name: src_nanika_descript.shell.name
				to_shell_name: dst_nanika.named.shell.descript.name
			, @_request_callback(resolve), @_request_ssp_callbacks(resolve)
	transact_otherclosed: (other_nanika, nanika_descript, close_script) ->
		new Promise (resolve, reject) =>
			other_nanika.request 'otherclosed',
				other_sakuraname: nanika_descript.ghost['sakura.name']
				other_script: close_script
				other_name: nanika_descript.ghost.name
				other_shell_name: nanika_descript.shell.name
			, @_request_callback(resolve), @_request_ssp_callbacks(resolve)
