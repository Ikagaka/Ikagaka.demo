

class Shell

  _ = window["_"]
  $ = window["jQuery"]
  SurfacesTxt2Yaml = window["SurfacesTxt2Yaml"]

  Nar         = window["Nar"]         || window["Ikagaka"]?["Nar"]         || require("ikagaka.nar.js")
  Surface     = window["Surface"]     || window["Ikagaka"]?["Surface"]     || require("./Surface.js")
  SurfaceUtil = window["SurfaceUtil"] || window["Ikagaka"]?["SurfaceUtil"] || require("./SurfaceUtil.js")

  Promise = window["Promise"]
  URL = window["URL"]

  constructor: (directory)->
    if !directory["descript.txt"] then throw new Error("descript.txt not found")
    @directory = directory
    @descript = Nar.parseDescript(Nar.convert(@directory["descript.txt"].asArrayBuffer()))
    @surfaces = null

  load: (callback)->
    if !!@directory["surfaces.txt"]
      buffer = @directory["surfaces.txt"].asArrayBuffer()
      surfacesTxt = Nar.convert(buffer)
      surfaces = Shell.parseSurfaces(surfacesTxt)
    else surfaces = {"surfaces": {}}
    mergedSurfaces = Shell.mergeSurfacesAndSurfacesFiles(surfaces, @directory)
    Shell.loadSurfaces mergedSurfaces, (err, loadedSurfaces)=>
      Shell.loadElements loadedSurfaces, @directory, (err, loadedElmSurfaces)=>
        if !!err then return callback(err)
        @surfaces = Shell.createBases(loadedElmSurfaces)
        callback(null)

  attachSurface: (canvas, scopeId, surfaceId, callback=->)->
    type = if scopeId is 0 then "sakura" else "kero"
    if Array.isArray(@surfaces.aliases?[type]?[surfaceId])
    then _surfaceId = SurfaceUtil.choice(@surfaces.aliases[type][surfaceId])
    else _surfaceId = surfaceId
    srfs = @surfaces.surfaces
    hits = Object
      .keys(srfs)
      .filter((name)-> srfs[name].is is _surfaceId)
    if hits.length is 0
    then return null
    new Surface(canvas, scopeId, hits[0], @surfaces, callback)



  @createBases = (surfaces)->
    srfs = surfaces.surfaces
    Object.keys(srfs).forEach (name)->
      cnv = srfs[name].baseSurface
      if !srfs[name].elements
        srfs[name].baseSurface = cnv
      else
        elms = srfs[name].elements
        sortedElms = Object
          .keys(elms)
          .map (key)->
            is: elms[key].is
            x:  elms[key].x
            y: elms[key].y
            canvas: elms[key].canvas
            type: elms[key].type
          .sort((elmA, elmB)-> if elmA.is > elmB.is then 1 else -1)
        baseSurface = sortedElms[0].canvas || srfs[name].baseSurface
        srfutil = new SurfaceUtil(baseSurface)
        srfutil.composeElements(sortedElms)
        srfs[name].baseSurface = baseSurface
    surfaces

  @loadSurfaces = (surfaces, callback)->
    srfs = surfaces.surfaces
    promises = Object.keys(srfs)
      .filter((name)-> !!srfs[name].file)
      .map (name)->
        new Promise (resolve, reject)->
          setTimeout ->
            buffer = srfs[name].file.asArrayBuffer()
            url = URL.createObjectURL(new Blob([buffer], {type: "image/png"}))
            SurfaceUtil.loadImage url, (err, img)->
              URL.revokeObjectURL(url)
              if !!err then return reject(err)
              srfs[name].baseSurface = SurfaceUtil.transImage(img)
              resolve()
    Promise
      .all(promises)
      .then(-> callback(null, surfaces))
      .catch((err)-> console.error(err, err.stack); callback(err, null))
    undefined

  @loadElements = (surfaces, directory, callback)->
    srfs = surfaces.surfaces
    promises = Object.keys(srfs)
      .filter((name)-> !!srfs[name].elements)
      .reduce(((arr, srfName)->
        arr.concat Object.keys(srfs[srfName].elements).map (elmName)->
          elm = srfs[srfName].elements[elmName]
          new Promise (resolve, reject)->
            setTimeout ->
              {type, file, x, y} = elm
              if !directory[file] then file += ".png"
              if !directory[file] then reject(new Error(file.substr(0, file.length-4) + "element file not found"))
              buffer = directory[file].asArrayBuffer()
              url = URL.createObjectURL(new Blob([buffer], {type: "image/png"}))
              SurfaceUtil.loadImage url, (err, img)->
                URL.revokeObjectURL(url)
                if !!err then return reject(err.error)
                elm.canvas = SurfaceUtil.transImage(img)
                resolve()
      ), [])
    Promise
      .all(promises)
      .then(-> callback(null, surfaces))
      .catch((err)-> console.error(err, err.stack); callback(err, null))
    undefined

  @mergeSurfacesAndSurfacesFiles = (surfaces, directory)->
    Object
      .keys(directory)
      .filter((filename)-> /^surface\d+\.png$/i.test(filename))
      .map((filename)-> [Number((/^surface(\d+)\.png$/i.exec(filename) or ["", "-1"])[1]), directory[filename]])
      .reduce(((surfaces, [n, file])->
        name = "surface" + n
        srfs = surfaces.surfaces
        if !srfs[name] then srfs[name] = {is: n}
        srfs[name].file = file
        srfs[name].baseSurface = null
        surfaces
      ), surfaces)

  @parseSurfaces = (text)->
    data = SurfacesTxt2Yaml.txt_to_data(text, {compatible: 'ssp-lazy'});
    console.dir data
    data = $.extend(true, {}, data)
    data.surfaces = Object
      .keys(data.surfaces)
      .reduce(((obj, name)->
        if typeof data.surfaces[name].is isnt "undefined"
        then obj[name] = data.surfaces[name]
        if Array.isArray(data.surfaces[name].base)
          data.surfaces[name].base.forEach (key)->
            $.extend(true, data.surfaces[name], data.surfaces[key])
        obj
      ), {})
    data

if module?.exports?
  module.exports = Shell

if window["Ikagaka"]?
  window["Ikagaka"]["Shell"] = Shell
