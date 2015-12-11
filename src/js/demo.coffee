Promise = @Promise
if @Ikagaka?
	NarLoader = @Ikagaka.NarLoader || @NarLoader
	Nanika = @Ikagaka.Nanika || @Nanika
	NanikaStorage = @Ikagaka.NanikaStorage || @Nanika
else
	NarLoader = @NarLoader
	Nanika = @Nanika
	NanikaStorage = @NanikaStorage

class Console
	constructor: (dom) ->
		@window = $('<div />').addClass('ConsoleWindow')
		@console = $('<div />').addClass('Console')
		@console.appendTo(@window)
		@window.appendTo(dom)
		@window.hide()
		@has_error = false
	finish: ->
		@window.scrollTop(9999999)
		clearTimeout @hidetimer
		unless @has_error
			@hidetimer = setTimeout =>
				@window.hide()
			, 3000
	log: (message) ->
		@window.show()
		text = $('<span />').addClass('log').html (message+"\n").replace(/\r\n|[\r\n]/g, '<br>')
		@console.append(text)
		@finish()
	warn: (message) ->
		@window.show()
		text = $('<span />').addClass('warn').html (message+"\n").replace(/\r\n|[\r\n]/g, '<br>')
		@console.append(text)
		@has_error = true
		@finish()
	error: (message) ->
		@window.show()
		text = $('<span />').addClass('error').html (message+"\n").replace(/\r\n|[\r\n]/g, '<br>')
		@console.append(text)
		@has_error = true
		@finish()

$ ->
	if require?
		gui = require('nw.gui')
		win = gui.Window.get()
		win.resizeTo(screen.availWidth, screen.availHeight)
		win.moveTo(0, 0)
	con = new Console("body")
	log = console.log
	warn = console.warn
	error = console.error
	console.log = (args...) =>
		log.apply console, args
		t = args.join('')
		unless /SHIORI\/\d\.\d|^\[object Object\]$/.test t
			con.log t
	console.warn = (args...) =>
		warn.apply console, args
		con.warn args.join ''
	console.error = (args...) =>
		error.apply console, args
		con.error args.join ''

	fs_root = 'ikagaka'
	balloon_nar = './vendor/nar/origin.nar'
	ghost_nar = './vendor/nar/ikaga.nar'
	ghost_nar2 = './vendor/nar/touhoku-zunko_or__.nar'

	delete_storage = ->
		if window.confirm '本当に削除しますか？'
			storage.backend._rmAll(fs_root).then ->
				window.onbeforeunload = ->
				location.reload()

	namedmanager = new cuttlebone.NamedManager()
	$(namedmanager.element).appendTo("body")

	nanikamanager = null
	boot_nanikamanager = ->
		if nanikamanager then return
		nanikamanager = new NanikaManager(storage, namedmanager, append_path: './vendor/js/', logging: true)
		$('#ikagaka_boot').attr('disabled', true)
		$('#ikagaka_halt').removeAttr('disabled')
		contextmenu = initialize: (nanika) ->
			ghostnames = []
			update_ghostnames = ->
				storage.ghosts().then (ghosts) ->
					Promise.all ghosts.map (dst_dirpath) -> storage.ghost_name(dst_dirpath).then (name) -> [name, dst_dirpath]
					.then (_ghostnames)-> ghostnames = _ghostnames
			shellnames = []
			update_shellnames = ->
				storage.shells(nanika.ghostpath).then (shells) ->
					Promise.all shells.map (dst_dirpath) -> storage.shell_name(nanika.ghostpath, dst_dirpath).then (name) -> [name, dst_dirpath]
					.then (_shellnames)-> shellnames = _shellnames
			balloonnames = []
			update_balloonnames = ->
				storage.balloons().then (balloons) ->
					Promise.all balloons.map (dst_dirpath) -> storage.balloon_name(dst_dirpath).then (name) -> [name, dst_dirpath]
					.then (_balloonnames)-> balloonnames = _balloonnames
			nanika.on 'named.initialized', (args)->
				return unless nanika.namedid?
				update_ghostnames() # narインストール後にこれ呼びたい
				update_shellnames() # narインストール後にこれ呼びたい
				update_balloonnames() # narインストール後にこれ呼びたい
				named = namedmanager.named(nanika.namedid)
				named.contextmenu (ev)->
					return unless nanika.namedid?
					{scopeId} = ev
					items:
						changeGhost:
							name: "ゴースト切り替え"
							items: ghostnames.reduce(((o, [name, dst_dirpath])->
								o["changeGhost>"+dst_dirpath] = if nanikamanager.is_existing_ghost(dst_dirpath) && nanika.ghostpath != dst_dirpath
								then name: name+"に変更"
								else name: name+"に変更", callback: ->
									console.log("change Ghost>", name, dst_dirpath)
									nanikamanager.change(nanika.ghostpath, dst_dirpath)
								return o
							), {})
						callGhost:
							name: "他のゴーストを呼ぶ"
							items: ghostnames.reduce(((o, [name, dst_dirpath])->
								o["callGhost>"+dst_dirpath] = if nanikamanager.is_existing_ghost(dst_dirpath)
								then name: name+"を呼ぶ"
								else name: name+"を呼ぶ", callback: ->
									console.log("call Ghost>", name, dst_dirpath)
									nanikamanager.call(nanika.ghostpath, dst_dirpath)
								return o
							), {})
						changeShell:
							name: "シェル"
							items: shellnames.reduce(((o, [name, dst_dirpath])->
								o["changeShell>"+dst_dirpath] = if named.shell.descript.name == name
								then name: name+"に変更"
								else name: name+"に変更", callback: ->
									console.log("change Shell>", name, dst_dirpath)
									scope_surfaces = {}
									Object.keys(named.scopes).forEach (scopeId)->
										scope_surfaces[scopeId] = named.scopes[scopeId].currentSurface.surfaceId
									nanika.change_named(dst_dirpath, nanika.profile.balloonpath).then ->
										Object.keys(scope_surfaces).forEach (scopeId)->
											named.scope(scopeId).surface(scope_surfaces[scopeId])
								return o
							), {})
						changeBalloon:
							name: "バルーン"
							items: balloonnames.reduce(((o, [name, dst_dirpath])->
								o["changeBalloon>"+dst_dirpath] = if named.balloon.descript.name == name
								then name: name+"に変更"
								else name: name+"に変更", callback: ->
									console.log("change Balloon>", name, dst_dirpath)
									scope_surfaces = {}
									Object.keys(named.scopes).forEach (scopeId)->
										scope_surfaces[scopeId] = named.scopes[scopeId].currentSurface.surfaceId
									nanika.change_named(nanika.profile.shellpath, dst_dirpath).then ->
										Object.keys(scope_surfaces).forEach (scopeId)->
											named.scope(scopeId).surface(scope_surfaces[scopeId])
								return o
							), {})
						install: name: "インストール", callback: ->
							$('#install_field').remove()
							install_field = $('<input type="file" />').attr('id', 'install_field').css(display: 'none')
							.change (ev) =>
								for file in ev.target.files
									install_nar file, nanika.ghostpath, nanika.ghost.descript['sakura.name']
								$('#install_field').remove()
							$('body').append install_field
							install_field.click()
						inputScript: name: '開発用 スクリプト入力', callback: -> nanika.ssp.play window.prompt('send')
						clearAll:    name: '全消去', callback: -> delete_storage()
						quit:        name: '終了', callback: -> nanikamanager.close(nanika.ghostpath, 'user')
						quitAll:     name: '全て終了', callback: -> nanikamanager.closeall('user')
		install = initialize: (nanika) ->
			nanika.on 'named.initialized', ->
				unless nanika.namedid?
					return
				named = namedmanager.named(nanika.namedid)
				named.on 'filedrop', (ev) =>
					ev.event.stopPropagation()
					ev.event.preventDefault()
					ev.event.originalEvent.dataTransfer.dropEffect = 'copy'
					for file in ev.event.originalEvent.dataTransfer.files
						install_nar file, nanika.ghostpath, nanika.ghost.descript['sakura.name']
		notice_events = initialize: (nanika) ->
			name = nanika.ghost.descript.name
			nanika.on 'named.initialized', -> console.log 'materialized '+name
			nanika.on 'halted', -> console.log 'halted '+name
		NanikaPlugin.contextmenu = contextmenu
		NanikaPlugin.install = install
		NanikaPlugin.notice_events = notice_events
		nanikamanager.on 'destroyed', ->
			nanikamanager = null
			$('#ikagaka_boot').removeAttr('disabled')
			$('#ikagaka_halt').attr('disabled', true)
			window.onbeforeunload = ->
			if require?
				window.close()
		console.log 'baseware booting'
		window.onbeforeunload = (event) -> event.returnValue = 'ベースウェアを終了していません。\n状態が保存されませんが本当にページを閉じますか？'
		nanikamanager.initialize()
		.then ->
			nanikamanager.bootall()
	halt_nanikamanager = ->
		nanikamanager.closeall('user')

	install_nar = (file, dirpath, sakuraname, type="blob") ->
		console.log("load nar : "+(file.name || file))
		if type == "url"
			promise = NarLoader.loadFromURL file
		else
			promise = NarLoader.loadFromBlob file
		promise
		.then (nar) ->
			console.log("nar loaded : "+(file.name || file))
			storage.install_nar(nar, dirpath, sakuraname)
		.catch (err) ->
			console.error 'install failure: '+(file.name || file)
			console.error err.stack
			throw err
			return
		.then (install_results) ->
			unless install_results?
				console.error 'install not accepted: '+(file.name || file)
				return
			console.log 'install succeed: '+(file.name || file)
			ghost = null
			balloon = null
			for install_result in install_results
				if install_result.type == 'ghost'
					ghost = install_result
				else if install_result.type == 'balloon'
					balloon = install_result
			if ghost?
				if balloon?
					storage.ghost_profile(ghost.directory)
					.then (profile) ->
						profile.balloonpath = balloon.directory
						storage.ghost_profile(ghost.directory, profile)
		.catch (err) ->
			console.error(err, err.stack)
			alert(err)

	storage = null
	cb = (err, idbfs) ->
		_window = {}
		unless require?
			BrowserFS.install(_window)
			BrowserFS.initialize(idbfs)
			fs = _window.require 'fs'
			path = _window.require 'path'
			buffer = _window.require 'buffer'
		else
			fs = require 'fs'
			path = require 'path'
			buffer = require 'buffer'
#		storage = new NanikaStorage(new NanikaStorage.Backend.InMemory())
		fs.mkdir fs_root, ->
			storage = new NanikaStorage(new NanikaStorage.Backend.FS(fs_root, fs, path, buffer.Buffer))
			fs.stat path.dirname(storage.base_profile_path()), (err, stat) ->
				if stat?.isFile()
					window.alert("互換性の無い変更が加わりました。\n動作のためには古いファイルを削除する必要があります。")
					delete_storage()
				storage.base_profile()
				.then (profile) ->
					unless profile.ghosts?
						profile.balloonpath = 'origin'
						profile.ghosts = ['ikaga']
						storage.base_profile(profile)
						.then ->
							install_nar(ghost_nar2, '', '', 'url')
							Promise.all [install_nar(balloon_nar, '', '', 'url'), install_nar(ghost_nar, '', '', 'url')]
#					else
						# always update default ghost
#						install_nar(ghost_nar, '', '', 'url')
				.then ->
					$('#ikagaka_boot').click boot_nanikamanager
					$('#ikagaka_halt').click halt_nanikamanager
					$('#ikagaka_clean').click delete_storage
					boot_nanikamanager()
	if require?
		cb()
	else
		new BrowserFS.FileSystem.IndexedDB cb
#	mfs = new BrowserFS.FileSystem.InMemory()
#	cb(null, mfs)
