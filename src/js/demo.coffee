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
	
	
	storage = new NanikaStorage(new NanikaStorage.Backend.InMemory())
	balloon_nar = './vendor/nar/origin.nar'
	ghost_nar = './vendor/nar/ikaga.nar'
	ghost_nar2 = './vendor/nar/touhoku-zunko_or__.nar'

	profile = new Profile.Baseware()
	profile.profile.balloonpath = 'origin'
	profile.profile.ghosts = ['ikaga']
	namedmanager = new NamedManager()
	$(namedmanager.element).appendTo("body")

	nanikamanager = null
	boot_nanikamanager = ->
		if nanikamanager then return
		nanikamanager = new NanikaManager(storage, profile, namedmanager, append_path: './vendor/js/', logging: true)
		$('#ikagaka_boot').attr('disabled', true)
		$('#ikagaka_halt').removeAttr('disabled')
		nanikamanager.on 'change.existing.ghosts', ->
			nanikas_dom = $('.ghosts').html('')
			for dirpath, nanika of nanikamanager.nanikas
				container = $('<li />')
				container_label = $('<p />')
				container_menu = $('<p />')
				container_dropdown = $('<p />')
				label = $('<span />').text(nanika.ghost.descript.name).addClass('name')
				install_file = $('<input type="file" />')
				.change ((dirpath) ->
					(ev) =>
						for file in ev.target.files
							install_nar file, dirpath
				)(dirpath)
				install = $('<label draggable="true">narをドロップしてインストール</label>').addClass('install')
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
				.on 'drop', ((dirpath) ->
					(ev) =>
						ev.stopPropagation()
						ev.preventDefault()
						ev.dataTransfer.dropEffect = 'copy'
						for file in ev.dataTransfer.files
							install_nar file, dirpath
				)(dirpath)
				install.append install_file
				change = $('<button />').text('交代').addClass('change')
				.on 'click', ((dirpath, container_dropdown) ->
					->
						if container_dropdown.hasClass('change')
							container_dropdown.removeClass('change call')
							container_dropdown.html('')
						else
							container_dropdown.removeClass('change call')
							container_dropdown.addClass('change')
							container_dropdown.html('')
							list = $('<ul />').addClass('list')
							storage.ghosts()
							.then (ghosts) ->
								for dst_dirpath in ghosts
									((dst_dirpath) ->
										storage.ghost_name(dst_dirpath).then (name) ->
											elem = $('<li />').addClass('ok').text(name + ' に交代')
											.on 'click', -> nanikamanager.change(dirpath, dst_dirpath)
											list.append(elem)
									)(dst_dirpath)
								container_dropdown.append(list)
				)(dirpath, container_dropdown)
				call = $('<button />').text('呼出').addClass('call')
				.on 'click', ((dirpath, container_dropdown) ->
					->
						if container_dropdown.hasClass('call')
							container_dropdown.removeClass('change call')
							container_dropdown.html('')
						else
							container_dropdown.removeClass('change call')
							container_dropdown.addClass('call')
							container_dropdown.html('')
							list = $('<ul />').addClass('list')
							storage.ghosts()
							.then (ghosts) ->
								for dst_dirpath in ghosts
									((dst_dirpath) ->
										storage.ghost_name(dst_dirpath).then (name) ->
											if nanikamanager.is_existing_ghost(dst_dirpath)
												elem = $('<li />').addClass('ng').text(name + ' を呼出')
											else
												elem = $('<li />').addClass('ok').text(name + ' を呼出')
												.on 'click', -> nanikamanager.call(dirpath, dst_dirpath)
											list.append(elem)
									)(dst_dirpath)
								container_dropdown.append(list)
				)(dirpath, container_dropdown)
				close = $('<button />').text('終了').addClass('close')
				.on 'click', ((dirpath) ->
					-> nanikamanager.close(dirpath, 'user')
				)(dirpath)
				container_label
				.append label
				container_menu
				.append change
				.append call
				.append close
				.append install
				container
				.append container_label
				.append container_menu
				.append container_dropdown
				nanikas_dom.append container
		nanikamanager.on 'destroyed', ->
			nanikamanager = null
			$('#ikagaka_boot').removeAttr('disabled')
			$('#ikagaka_halt').attr('disabled', true)
		nanikamanager.bootall()
	halt_nanikamanager = ->
		nanikamanager.closeall('user')

	install_nar = (file, dirpath, type="blob") ->
		console.log("load nar : "+(file.name || file))
		if type == "url"
			promise = NarLoader.loadFromURL file
		else
			promise = NarLoader.loadFromBlob file
		promise
		.then (nar) ->
			console.log("nar loaded : "+(file.name || file))
			storage.install_nar(nar, dirpath)
		.catch (err) ->
			console.error 'install failure'
			console.error err.stack
			return
		.then (install_results) ->
			unless install_results?
				console.error 'install not accepted'
				return
			ghost = null
			balloon = null
			for install_result in install_results
				if install_result.type == 'ghost'
					ghost = install_result
				else if install_result.type == 'balloon'
					balloon = install_result
			if ghost?
				if balloon?
					profile.ghost(ghost.directory).profile.balloonpath = balloon.directory
		.catch (err) ->
			console.error(err, err.stack)
			alert(err)
	
	console.log("load nar : "+balloon_nar)
	Promise.all [install_nar(balloon_nar, '', 'url'), install_nar(ghost_nar, '', 'url')]
	.then ->
		$('#ikagaka_boot').click boot_nanikamanager
		$('#ikagaka_halt').click halt_nanikamanager
		$('#ikagaka_boot').click()
		install_nar(ghost_nar2, '', 'url')
