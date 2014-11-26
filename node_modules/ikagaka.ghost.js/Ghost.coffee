

class Ghost
  _ = window["_"]

  Nar = window["Nar"] || window["Ikagaka"]["Nar"] || require("ikagaka.nar.js")

  Worker = window["Worker"]

  constructor: (directory)->
    console.log directory
    if !directory["descript.txt"] then throw new Error("descript.txt not found")
    @directory = directory
    buffer = @directory["descript.txt"].asArrayBuffer()
    descriptTxt = Nar.convert(buffer)
    @descript = Nar.parseDescript(descriptTxt)
    @worker = null

  path: "./"
  logging: false

  load: (callback)->
    if !@directory[@descript["shiori"]] and !@directory["shiori.dll"] then return callback(new Error("shiori not found"))
    console.log @path
    switch Ghost.detectShiori(@directory)
      when "kawari"  then @worker = new Worker(@path + "KawariWorker.js")
      when "kawari7" then @worker = new Worker(@path + "Kawari7Worker.js")
      when "satori"  then @worker = new Worker(@path + "SatoriWorker.js")
      when "yaya"    then @worker = new Worker(@path + "YAYAWorker.js")
      when "aya5"    then @worker = new Worker(@path + "AYA5Worker.js")
      when "miyojs"  then @worker = new Worker(@path + "MiyoJSWorker.js")
      else return callback(new Error("cannot detect shiori type: "+ @descript["shiori"]))
    {directory, buffers} = Ghost.createTransferable(@directory)
    @worker.addEventListener "error", (ev)-> console.error(ev.error)
    @worker.postMessage({event: "load", data: directory}, buffers)
    @worker.onmessage = ({data: {event, error}})->
      if event is "loaded" then callback(error)
    undefined

  request: (request, callback)->
    if @logging then console.log(request)
    @worker.postMessage({event: "request", data: request})
    @worker.onmessage = ({data:{event, error, data: response}})=>
      if @logging then console.log(response)
      if event is "response" then callback(error, response)
    undefined

  unload: (callback)->
    @worker.postMessage({event: "unload"})
    @worker.onmessage = ({data: {event, error}})->
      if event is "unloaded" then callback(error)
    undefined

  @detectShiori = (directory)->
    if !!directory["kawarirc.kis"]    then return "kawari"
    if !!directory["kawari.ini"]      then return "kawari7" # no kis and ini
    if !!directory["satori_conf.txt"] then return "satori"
    if !!directory["yaya.dll"]        then return "yaya"
    if !!directory["aya5.dll"]        then return "aya5"
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

if module?.exports?
  module.exports = Ghost

if window["Ikagaka"]?
  window["Ikagaka"]["Ghost"] = Ghost
