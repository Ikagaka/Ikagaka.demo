
self.importScripts("vender/encoding.min.js")
self.importScripts("vender/kawari7.js")
self.importScripts("vender/kawari7shiori.js")

shiori = new Kawari7Shiori()
Module = shiori.Module
FS = shiori.FS
Module['logReadFiles'] = true

self.onmessage = ({data: {event, data}})->
  switch event
    when "load"
      directory = data
      for filepath in Object.keys(directory)
        dirname = filepath.replace(/[^\/]*$/, '')
        # ディレクトリより先にファイルがzipから読まれた場合、パスのdirがなかったらつくるようにしたが、いきなり深いパスがくるとたぶん無理な手抜き仕様
        try
          FS.stat("/home/web_user/"+dirname)
        catch err
          console.log 'mkdir '+"/home/web_user/"+dirname
          FS.mkdir("/home/web_user/"+dirname.replace(/\/$/, ""))
        unless /\/$/.test(filepath)
          uint8arr = new Uint8Array(directory[filepath])
          console.log "/home/web_user/" + filepath, uint8arr.length
          FS.writeFile("/home/web_user/" + filepath, uint8arr, {encoding: 'binary'})
      FS.chdir('/home/web_user')
      console.log shiori.load("/home/web_user/")
      self.postMessage({"event": "loaded", "error": null})
    when "request"
      request = data
      #console.log request
      response = shiori.request(request)
      #console.log response
      self.postMessage({event: "response", error: null, data: response})
    when "unload"
      console.log shiori.unload()
      self.postMessage({event: "unloaded", error: null})
    else throw new Error(event + " event not support")
