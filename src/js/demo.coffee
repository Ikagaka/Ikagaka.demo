$ ->
  $("#nar").change (ev) ->
    nar = new Nar()
    nar.loadFromBlob(ev.target.files[0], loadHandler.bind(@, nar))
  nar = new Nar()
  nar.loadFromURL("./vendor/nar/akos.nar", loadHandler.bind(@, nar))
loadHandler = (ghost_nar, err) ->
  return console.error(err.stack) if err?
  Promise.all [
    (new Promise (resolve, reject) ->
      ghost = new Ghost(ghost_nar.getDirectory(/ghost\/master\//))
      ghost.path = "./vendor/js/"
      ghost.logging = true
      ghost.load (err) ->
        if err? then reject(err) else resolve(ghost)
    ),
    (new Promise (resolve, reject) ->
      shell = new Shell(ghost_nar.getDirectory(/shell\/master\//))
      shell.load (err) ->
        if err? then reject(err) else resolve(shell)
    ),
    (new Promise (resolve, reject) ->
      balloon_nar = new Nar()
      balloon_nar.loadFromURL "./vendor/nar/origin.nar", (err) ->
        if err? then reject(err)
        balloon = new Balloon(balloon_nar.directory)
        balloon.load (err) ->
          if err? then reject(err) else resolve(balloon)
    )
  ]
  .then(([ghost, shell, balloon]) ->
    named = new Named(shell, balloon)
    ssp = new SakuraScriptPlayer(named)
    version = '2.6'
    method = 'GET Version'
    
    responseHandler = (err, response) ->
      if err? then return console.error(err.stack)
      console.log(response)
      parser = new ShioriJK.Shiori.Response.Parser()
      parsed = parser.parse(response)
      if(parsed.status_line.code == 200)
        ss = null
        if version == '3.0' && typeof parsed.headers.header.Value == "string"
          ss = parsed.headers.header.Value
        else if version != '3.0' && typeof parsed.headers.header.Sentence == "string"
          ss = parsed.headers.header.Sentence
        if ss != null
          console.log(ss)
          ssp.play("\\1\\0"+ss)
      return parsed
    
    requestSender = (headers, callback) ->
      request = new ShioriJK.Message.Request()
      request.request_line.method = method
      request.request_line.protocol = "SHIORI"
      request.request_line.version = version
      request.headers.header["Sender"] = "SSP"
      request.headers.header["Charset"] = "Shift_JIS"
      if version != '3.0' && headers["ID"]
        headers["Event"] = headers["ID"]
        delete headers["ID"]
      Object.keys(headers).forEach (key) -> request.headers.header[key] = ""+headers[key]
      console.log(""+request)
      ghost.request(""+request, if callback then callback else responseHandler)
    
    $(named.element)
    .on("IkagakaSurfaceEvent", (ev) -> requestSender(ev.detail))
    .appendTo("body")
    
    requestSender({}, (err, response) ->
      parsed = responseHandler(err, response)
      if parsed.status_line.code == 200 && parsed.status_line.version != '3.0'
        method = 'GET Sentence'
      else
        version = '3.0'
        method = 'GET'
      requestSender({
        ID: "OnBoot",
        Sender: "SSP",
        Charset: "Shift_JIS",
        Reference0: "0"
      })
      setInterval(->
        requestSender({
          ID: "OnSecondChange",
          Sender: "SSP",
          Charset: "Shift_JIS",
          Reference0: "0",
          Reference1: "0",
          Reference2: "0",
          Reference3: "1"
        })
      , 1000)
      setInterval(->
        requestSender({
          ID: "OnMinuteChange",
          Sender: "SSP",
          Charset: "Shift_JIS",
          Reference0: "0",
          Reference1: "0",
          Reference2: "0",
          Reference3: "1"
        })
      , 60000)
    )
  ).catch (err) ->
    console.error(err, err.stack)
