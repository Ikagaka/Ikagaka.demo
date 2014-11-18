

class Shell

  _ = window["_"]
  $ = window["Zepto"]
  Nar = window["Nar"]
  Promise = window["Promise"]
  Surface = window["Surface"]
  SurfaceUtil = window["SurfaceUtil"]
  SurfacesTxt2Yaml = window["SurfacesTxt2Yaml"]
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

  attachSurface: (canvas, scopeId, surfaceId)->
    type = if scopeId is 0 then "sakura" else "kero"
    if Array.isArray(@surfaces.aliases?[type]?[surfaceId])
    then _surfaceId = Number(SurfaceUtil.choice(@surfaces.aliases[type][surfaceId]))
    else _surfaceId = surfaceId
    srfs = @surfaces.surfaces
    hits = Object
      .keys(srfs)
      .filter((name)-> Number(srfs[name].is) is _surfaceId)
    if hits.length is 0
    then return null
    new Surface(canvas, scopeId, hits[0], @surfaces)



  @createBases = (surfaces)->
    srfs = surfaces.surfaces
    Object.keys(srfs).forEach (name)->
      srfs[name].is = srfs[name].is
      cnv = srfs[name].baseSurface
      if !srfs[name].elements
        srfs[name].baseSurface = cnv
      else
        sortedElm = Object
          .keys(srfs[name].elements)
          .sort((a, b)-> if a.is > b.is then 1 else -1)
          .map (key)-> srfs[name].elements[key]
        baseSurface = sortedElm[0].canvas || srfs[name].baseSurface
        srfutil = new SurfaceUtil(baseSurface)
        srfutil.composeElements(sortedElm)
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
        if !srfs[name]
          srfs[name] = {is: ""+n}
        srfs[name].file = file
        srfs[name].baseSurface = null
        surfaces
      ), surfaces)

  @parseSurfaces = (text)->
    data = SurfacesTxt2Yaml.txt_to_data(text)
    data.surfaces = Object
      .keys(data.surfaces)
      .reduce(((obj, name)->
        if typeof data.surfaces[name].is is "string"
        then obj[name] = data.surfaces[name]
        if Array.isArray(data.surfaces[name].base)
          data.surfaces[name].base.forEach (key)->
            data.surfaces[name] = $.extend(true, data.surfaces[name], data.surfaces[key])
        obj
      ), {})
    data
