Promise = @Promise
if @Ikagaka?
	NarLoader = @Ikagaka.NarLoader || @NarLoader
	Single = @Ikagaka.Single || @Single
else
	NarLoader = @NarLoader
	Single = @Single
$ ->
  $("#nar").change (ev) ->
    narloader = new NarLoader()
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
      single = new Single()
      single.load_nar(ghost_nar, balloon_nar, {path: "./vendor/js/", logging: true})
      .then ->
        single.run('body')
    .catch (err) ->
      console.error(err, err.stack)
      alert(err)
#  nar = new Nar()
#  nar.loadFromURL("./vendor/nar/akos.nar", loadHandler.bind(@, nar))
