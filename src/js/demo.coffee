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
	$("#nardrop").on 'dragenter', (ev) =>
		ev.stopPropagation()
		ev.preventDefault()
		ev.dataTransfer.dropEffect = 'copy'
		false
	$("#nardrop").on 'dragover', (ev) =>
		ev.stopPropagation()
		ev.preventDefault()
		ev.dataTransfer.dropEffect = 'copy'
		false
	$("#nardrop").on 'drop', (ev) =>
		ev.stopPropagation()
		ev.preventDefault()
		ev.dataTransfer.dropEffect = 'copy'
		for file in ev.dataTransfer.files
			load_nar file
	$("#nar").change (ev) =>
		for file in ev.target.files
			load_nar file
	nanikas = []
	nanikas_update = ->
		nanikas_dom = $('.nanikas').html('')
		for dirpath, nanika of nanikamanager.nanikas
			nanikas_dom.append $('<div />').text(nanika.ghost.descript.name+" を終了する").on 'click', (
				(nanika) ->
					-> nanika.request 'close', reason: 'user'
			)(nanika)
	
	storage = new NanikaStorage()
	profile = new Profile.Baseware()
	profile.profile.balloonpath = 'origin'
	namedmanager = new NamedManager()
	$(namedmanager.element).appendTo("body")
	nanikamanager = new NanikaManager(storage, profile, namedmanager, append_path: './vendor/js/', logging: true)
	nanikamanager.on 'ghost.booted', nanikas_update
	nanikamanager.on 'ghost.halted', -> console.log 'halted'; nanikas_update()
	balloon_nar = './vendor/nar/origin.nar'
	console.log("load nar : "+balloon_nar)
	NarLoader.loadFromURL balloon_nar
	.then (nar) ->
		console.log("nar loaded : "+balloon_nar)
		storage.install_nar(nar)
	load_nar = (file) ->
		console.log("load nar : "+file.name)
		NarLoader.loadFromBlob file
		.then (nar) ->
			console.log("nar loaded : "+file.name)
			try
				install_results = storage.install_nar(nar)
			catch err
				console.error 'install failure'
				console.error err.stack
				return
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
				nanikamanager.boot(ghost.directory, 'boot', halt: null)
		.catch (err) ->
			console.error(err, err.stack)
			alert(err)
#	nar = new Nar()
#	nar.loadFromURL("./vendor/nar/akos.nar", loadHandler.bind(@, nar))
