
self.importScripts("node_modules/ikagaka.nar.js/node_modules/encoding-japanese/encoding.js")
self.importScripts("node_modules/shiorijk/lib/shiorijk.js")
self.importScripts("vender/coffee-script.js")
self.importScripts("node_modules/parttime/parttime.js")
self.importScripts("node_modules/partperiod/partperiod.js")
self.importScripts("node_modules/miyojs-filter-conditions/conditions.js")
self.importScripts("node_modules/miyojs-filter-default_response_headers/default_response_headers.js")
self.importScripts("node_modules/miyojs-filter-join/join.js")
self.importScripts("node_modules/miyojs-filter-no_value/no_value.js")
self.importScripts("node_modules/miyojs-filter-property/property.js")
self.importScripts("node_modules/miyojs-filter-value/value.js")
self.importScripts("node_modules/miyojs-filter-value_filters/value_filters.js")
self.importScripts("node_modules/miyojs-filter-variables/variables.js")
self.importScripts("node_modules/miyojs-filter-autotalks/autotalks.js")
self.importScripts("node_modules/miyojs-filter-talking/talking.js")
self.importScripts("node_modules/miyojs-filter-stash/stash.js")
self.importScripts("node_modules/miyojs-filter-entry_template/entry_template.js")
self.importScripts("node_modules/miyojs-filter-stash_template/stash_template.js")
self.importScripts("node_modules/miyojs-filter-child_process/child_process.js")
self.importScripts("node_modules/miyojs/node_modules/js-yaml/dist/js-yaml.min.js")
self.importScripts("node_modules/miyojs/lib/miyo.js")

shiori = null

self.onmessage = ({data: {event, data}})->
  switch event
    when "load"
      directory = data
      dictionary = Object
        .keys(directory)
        .filter((filepath)-> /^dictionaries\/[^/]+$/.test(filepath))
        .reduce(((dictionary, filepath)->
          uint8Arr = new Uint8Array(directory[filepath])
          tabIndentedYaml = Encoding.codeToString(Encoding.convert(uint8Arr, 'UNICODE', 'AUTO'))
          yaml = tabIndentedYaml.replace(/\t/g, ' ')
          dic = jsyaml.safeLoad (yaml)
          Miyo.DictionaryLoader.merge_dictionary(dic, dictionary)
          dictionary
        ), {})
      shiori = new Miyo(dictionary)
      console.log(Object.keys(dictionary).join(' '))
      shiori.load('')
      .then ->
        self.postMessage({"event": "loaded",   "error": null})
      .catch (error) ->
        console.warn(error)
    when "request"
      requestTxt = data
      paser = new ShioriJK.Shiori.Request.Parser()
      request = paser.parse(requestTxt)
      console.log(request)
      shiori.request(request)
      .then (response) ->
        self.postMessage({event: "response", error: null, data: '' + response})
      .catch (error) ->
        console.warn(error)
    when "unload"
      shiori.unload()
      .then ->
        self.postMessage({event: "unloaded", error: null})
      .catch (error) ->
        console.warn(error)
    else throw new Error(event + " event not support")
