Promise = @Promise
if @Ikagaka?
	NarLoader = @Ikagaka.NarLoader || @NarLoader
	Nanika = @Ikagaka.Nanika || @Nanika
else
	NarLoader = @NarLoader
	Nanika = @Nanika

$ ->
	$("#nar").change (ev) ->
		narloader = new Nar.Loader()
		Promise.all [
			(new Promise (resolve, reject) =>
				narloader.loadFromBlob ev.target.files[0], (err, nar) ->
					if err? then reject(err)
					else resolve(nar)
			),
			(new Promise (resolve, reject) =>
				narloader.loadFromURL './vendor/nar/origin.nar', (err, nar) ->
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
			console.log balloon
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
