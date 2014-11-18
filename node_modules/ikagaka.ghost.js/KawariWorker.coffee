
self.importScripts("node_modules/ikagaka.nar.js/node_modules/encoding-japanese/encoding.js")
self.importScripts("node_modules/shiorijk/lib/shiorijk.js")
self.importScripts("vender/kawari.so.min.js")
self.importScripts("vender/kawarishiori.js")

shiori = new KawariShiori()
Module = shiori.Module;
FS = shiori.FS;
Module['logReadFiles'] = true

self.onmessage = ({data: {event, data}})->
  switch event
    when "load"
      directory = data
      for filepath in Object.keys(directory)
        if /\/$/.test(filepath)
        then FS.mkdir("/home/web_user/"+filepath.replace(/\/$/, ""))
        else
          uint8arr = new Uint8Array(directory[filepath])
          console.log "/home/web_user/" + filepath, uint8arr.length
          FS.writeFile("/home/web_user/" + filepath, uint8arr, {encoding: 'binary'})
      FS.chdir('/home/web_user')
      console.log shiori.load("/home/web_user/kawarirc.kis")
      self.postMessage({"event": "loaded", "error": null})
    when "request"
      request = data
      console.log request
      response = shiori.request(request)
      console.log response
      self.postMessage({event: "response", error: null, data: response})
    when "unload"
      console.log shiori.unload()
      self.postMessage({event: "unloaded", error: null})
    else throw new Error(event + " event not support")
