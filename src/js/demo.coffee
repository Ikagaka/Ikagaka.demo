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

	namedmanager = new NamedManager()
	$(namedmanager.element).appendTo("body")

	nanikamanager = null
	boot_nanikamanager = ->
		if nanikamanager then return
		nanikamanager = new NanikaManager(storage, namedmanager, append_path: './vendor/js/', logging: true)
		$('#ikagaka_boot').attr('disabled', true)
		$('#ikagaka_halt').removeAttr('disabled')
		view_contextmenu = (nanika, mouse, menulist) ->
			$('#contextmenu').remove()
			named = namedmanager.named nanika.namedid
			dom = named.scopes[mouse.args.scope].$scope
			offset = dom.offset()
			x = window.innerWidth - (offset.left + mouse.args.offsetX)
			y = window.innerHeight - (offset.top + mouse.args.offsetY)
			menu = $('<ul />').attr('id', 'contextmenu')
			.css(position: 'fixed', bottom: y, right: x, background: '#fff', 'z-index': 100, margin: '0', padding: '0', 'list-style': 'none', border: '1px solid black')
			li_css = color: '#222', background: '#fff', margin: '0', padding: '0.3em', cursor: 'pointer'
			li_css_disabled = color: '#666', background: '#eee', margin: '0', padding: '0.3em'
			for item in menulist
				if item.cb?
					((item) ->
						menu.append $('<li />').text(item.text).css(li_css).click ->
							hide_contextmenu()
							item.cb()
					)(item)
				else
					menu.append $('<li />').text(item.text).css(li_css_disabled)
			body = $('body')
			body.append(menu)
		hide_contextmenu = -> $('#contextmenu').remove()
		contextmenu = initialize: (nanika) ->
			mouse = {}
			nanika.on 'request.mouseclick', (args) ->
				mouse.args = args
			nanika.on 'response.mouseclick', (args) ->
				if not args.value? or not args.value.length
					if mouse.args.button == 1
						ghostpath = nanika.ghostpath
						menulist = [
							{text: 'ゴースト切り替え', cb: ->
								storage.ghosts()
								.then (ghosts) ->
									promises = []
									for dst_dirpath in ghosts
										((dst_dirpath) ->
											promises.push storage.ghost_name(dst_dirpath).then (name) ->
												if nanikamanager.is_existing_ghost(dst_dirpath) && ghostpath != dst_dirpath
													text: name + ' に切り替え'
												else
													text: name + ' に切り替え', cb: -> nanikamanager.change(ghostpath, dst_dirpath)
										)(dst_dirpath)
									Promise.all promises
									.then (submenulist) ->
										view_contextmenu nanika, mouse, submenulist
							}
							{text: '他のゴーストを呼ぶ', cb: ->
								storage.ghosts()
								.then (ghosts) ->
									promises = []
									for dst_dirpath in ghosts
										((dst_dirpath) ->
											promises.push storage.ghost_name(dst_dirpath).then (name) ->
												if nanikamanager.is_existing_ghost(dst_dirpath)
													text: name + ' を呼び出し'
												else
													text: name + ' を呼び出し', cb: -> nanikamanager.call(ghostpath, dst_dirpath)
										)(dst_dirpath)
									Promise.all promises
									.then (submenulist) ->
										view_contextmenu nanika, mouse, submenulist
							}
							{text: 'シェル', cb: ->
								storage.shells(ghostpath)
								.then (shells) ->
									promises = []
									for dst_shellpath in shells
										((dst_shellpath) ->
											promises.push storage.shell_name(ghostpath, dst_shellpath).then (name) ->
												if nanika.named.shell.descript.name == name
													text: name + ' に変更'
												else
													text: name + ' に変更', cb: ->
														scope_surfaces = {}
														for id, scope of nanika.named.scopes
															scope_surfaces[id] = scope.currentSurface.surfaces.surfaces[scope.currentSurface.surfaceName].is
														nanika.change_named(dst_shellpath, nanika.profile.balloonpath)
														.then ->
															for scope, surface of scope_surfaces
																nanika.named.scope(scope).surface(surface)
										)(dst_shellpath)
									Promise.all promises
									.then (submenulist) ->
										view_contextmenu nanika, mouse, submenulist
							}
							{text: 'バルーン', cb: ->
								storage.balloons()
								.then (balloons) ->
									promises = []
									for dst_dirpath in balloons
										((dst_dirpath) ->
											promises.push storage.balloon_name(dst_dirpath).then (name) ->
												if nanika.named.balloon.descript.name == name
													text: name + ' に変更'
												else
													text: name + ' に変更', cb: ->
														scope_surfaces = {}
														for id, scope of nanika.named.scopes
															scope_surfaces[id] = scope.currentSurface.surfaces.surfaces[scope.currentSurface.surfaceName].is
														nanika.change_named(nanika.profile.shellpath, dst_dirpath)
														.then ->
															for scope, surface of scope_surfaces
																nanika.named.scope(scope).surface(surface)
										)(dst_dirpath)
									Promise.all promises
									.then (submenulist) ->
										view_contextmenu nanika, mouse, submenulist
							}
							{text: 'インストール', cb: ->
								$('#install_field').remove()
								install_field = $('<input type="file" />').attr('id', 'install_field').css(display: 'none')
								.change (ev) =>
									for file in ev.target.files
										install_nar file, ghostpath, nanika.ghost.descript['sakura.name']
									$('#install_field').remove()
								$('body').append install_field
								install_field.click()
							}
							{text: '全消去', cb: delete_storage}
							{text: '終了', cb: -> nanikamanager.close(nanika.ghostpath, 'user')}
							{text: '全て終了', cb: -> nanikamanager.closeall('user')}
						]
						view_contextmenu nanika, mouse, menulist
					else
						hide_contextmenu()
				else
					hide_contextmenu()
		install = initialize: (nanika) ->
			main = ->
				unless nanika.namedid?
					return
				$named = namedmanager.named(nanika.namedid).$named
				$named.attr('draggable', 'true')
				.on 'dragenter', (ev) =>
					ev.stopPropagation()
					ev.preventDefault()
					ev.dataTransfer.dropEffect = 'copy'
					false
				.on 'dragover', (ev) =>
					ev.stopPropagation()
					ev.preventDefault()
					ev.dataTransfer.dropEffect = 'copy'
					false
				.on 'drop', (ev) =>
					ev.stopPropagation()
					ev.preventDefault()
					ev.dataTransfer.dropEffect = 'copy'
					for file in ev.dataTransfer.files
						install_nar file, nanika.ghostpath, nanika.ghost.descript['sakura.name']
			main()
			nanika.on 'named.initialized', main
		notice_events = initialize: (nanika) ->
			name = nanika.ghost.descript.name
			console.log 'materialized '+name
			nanika.on 'halted', -> console.log 'halted '+name
		nanikamanager.on 'change.existing.ghosts', ->
			for dirpath, nanika of nanikamanager.nanikas
				unless nanika.plugins.contextmenu?
					nanika.add_plugin('contextmenu', contextmenu)
				unless nanika.plugins.install?
					nanika.add_plugin('install', install)
				unless nanika.plugins.notice_events?
					nanika.add_plugin('notice_events', notice_events)
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
		storage = new NanikaStorage(new NanikaStorage.Backend.FS(fs_root, fs, path, buffer.Buffer))
		storage.base_profile()
		.then (profile) ->
			unless profile.ghosts?
				profile.balloonpath = 'origin'
				profile.ghosts = ['ikaga']
				storage.base_profile(profile)
				.then ->
					install_nar(ghost_nar2, '', '', 'url')
					Promise.all [install_nar(balloon_nar, '', '', 'url'), install_nar(ghost_nar, '', '', 'url')]
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
