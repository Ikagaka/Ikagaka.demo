

class Ghost
  _ = window["_"]
  Nar = window["Nar"]
  Worker = window["Worker"]

  constructor: (directory)->
    console.log directory
    if !directory["descript.txt"] then throw new Error("descript.txt not found")
    @directory = directory
    buffer = @directory["descript.txt"].asArrayBuffer()
    descriptTxt = Nar.convert(buffer)
    @descript = Nar.parseDescript(descriptTxt)
    @worker = null

  load: (callback)->
    if !@directory[@descript["shiori"]] and !@directory["shiori.dll"] then return callback(new Error("shiori not found"))
    switch Ghost.detectShiori(@directory)
      when "satori" then return callback(new Error("unsupport shiori"))
      when "yaya"   then return callback(new Error("unsupport shiori"))
      when "kawari" then @worker = new Worker("./KawariWorker.js")
      when "miyojs" then @worker = new Worker("./MiyoJSWorker.js")
      else return callback(new Error("cannot detect shiori type: "+ @descript["shiori"]))
    {directory, buffers} = Ghost.createTransferable(@directory)
    @worker.postMessage({event: "load", data: directory}, buffers)
    @worker.onmessage = ({data: {event, error}})->
      if event is "loaded" then callback(error)
    undefined

  request: (request, callback)->
    @worker.postMessage({event: "request", data: request})
    @worker.onmessage = ({data:{event, error, data: response}})->
      if event is "response" then callback(error, response)
    undefined

  unload: (callback)->
    @worker.postMessage({event: "unload"})
    @worker.onmessage = ({data: {event, error}})->
      if event is "unloaded" then callback(error)
    undefined

  @detectShiori = (directory)->
    if !!directory["kawarirc.kis"]    then return "kawari"
    if !!directory["satori_conf.txt"] then return "satori"
    if !!directory["yaya.dll"]        then return "yaya"
    if !!directory["node.exe"]        then return "miyojs"
    return ""


  @createTransferable: (_directory)->
    Object.keys(_directory)
      .filter((filepath)-> !!filepath)
      .reduce((({directory, buffers}, filepath)->
        buffer = _directory[filepath].asArrayBuffer()
        directory[filepath] = buffer
        buffers.push(buffer)
        {directory, buffers}
      ), {directory: {}, buffers: []})
