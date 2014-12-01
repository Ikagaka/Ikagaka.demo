Promise = @Promise
if @Ikagaka?
	NarLoader = @Ikagaka.NarLoader || @NarLoader
	Nanika = @Ikagaka.Nanika || @Nanika
else
	NarLoader = @NarLoader
	Nanika = @Nanika

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
		unless /SHIORI\/\d\.\d/.test t
			con.log t
	console.warn = (args...) =>
		warn.apply console, args
		con.warn args.join ''
	console.error = (args...) =>
		error.apply console, args
		con.error args.join ''
	$("#nar").change (ev) =>
		narloader = new Nar.Loader()
		Promise.all [
			(new Promise (resolve, reject) =>
				con.log("load nar : "+ev.target.files[0].name)
				narloader.loadFromBlob ev.target.files[0], (err, nar) ->
					if err? then reject(err)
					else resolve(nar)
			),
			(new Promise (resolve, reject) =>
				balloon_nar = './vendor/nar/origin.nar'
				con.log("load nar : "+balloon_nar)
				narloader.loadFromURL balloon_nar, (err, nar) ->
					if err? then reject(err)
					else resolve(nar)
			),
		]
		.then ([ghost_nar, balloon_nar]) ->
			new Promise (resolve, reject) ->
				balloon = new Balloon(balloon_nar.directory)
				balloon.load (err) ->
					if err? then reject(err) else resolve([ghost_nar, balloon])
		.catch (err) ->
			console.error(err, err.stack)
			alert(err)
		.then ([ghost_nar, balloon]) ->
			console.log("nar loaded")
			nanikamanager = get_balloon: -> balloon
			namedmanager = new NamedManager()
			$(namedmanager.element).appendTo("body")
			nanika = new Nanika(nanikamanager, namedmanager, ghost_nar)
#			nanika.options.path = "./vendor/js/"
			nanika.options.append_path = "./vendor/js/"
			nanika.options.logging = true
			nanika.load()
#	nar = new Nar()
#	nar.loadFromURL("./vendor/nar/akos.nar", loadHandler.bind(@, nar))
