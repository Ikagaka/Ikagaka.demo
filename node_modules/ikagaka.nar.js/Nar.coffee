
class Nar

  XMLHttpRequest = window["XHRProxy"]
  Encoding = window["Encoding"]
  JSZip = window["JSZip"]
  WMDescript = window["WMDescript"]
  URL = window["URL"]

  constructor: ->
    @directory = null
    @install = null

  loadFromBuffer: (buffer, callback)->
    @directory = Nar.unzip(buffer)
    if !@directory["install.txt"] then return callback(new Error("install.txt not found"))
    setTimeout =>
      @install = Nar.parseDescript(Nar.convert(@directory["install.txt"].asArrayBuffer()))
      callback(null)

  loadFromURL: (src, callback)->
    Nar.wget src, "arraybuffer", (err, buffer)=>
      if !!err then return callback(err)
      @loadFromBuffer(buffer, callback)

  loadFromBlob: (blob, callback)->
    url = URL.createObjectURL(blob)
    @loadFromURL url, (err)->
      URL.revokeObjectURL(url)
      callback(err)

  grep: (regexp)->
    Object.keys(@directory)
      .filter((path)-> regexp.test(path))

  getDirectory: (regexp)->
    @grep(regexp)
      .reduce(((dir, path, zip)=>
        dir[path.replace(regexp, "")] = @directory[path]
        dir;
      ), {})

  @unzip = (buffer)->
    zip = new JSZip()
    zip.load(buffer)
    Object
      .keys(zip.files)
      .reduce(((dic, filePath)->
        path = filePath.split("\\").join("/")
        dic[path] = zip.files[filePath]
        dic
      ), {})


  @convert = (buffer)->
    Encoding.codeToString(Encoding.convert(new Uint8Array(buffer), 'UNICODE', 'AUTO'))

  @wget = (url, type, callback)->
    xhr = new XMLHttpRequest()
    xhr.addEventListener "load", ->
      if 200 <= xhr.status && xhr.status < 300
        if !!xhr.response.error
        then callback(new Error(xhr.response.error.message), null)
        else callback(null, xhr.response)
      else callback(new Error(xhr.status), null)
    xhr.open("GET", url)
    xhr.responseType = type
    xhr.send()
    undefined

  @parseDescript = (text)->
    WMDescript.parse(text)
