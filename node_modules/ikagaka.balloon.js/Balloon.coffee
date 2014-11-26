

class Balloon

  $ = window["jQuery"]
  Nar = window["Nar"]
  SurfaceUtil = window["SurfaceUtil"]
  URL = window["URL"]

  constructor: (directory)->
    if !directory["descript.txt"] then throw new Error("descript.txt not found")
    @directory = directory
    buffer = @directory["descript.txt"].asArrayBuffer()
    @descript = Nar.parseDescript(Nar.convert(buffer))
    @balloons =
      "sakura": []
      "kero": []
      "communicate": []
      "online": []
      "arrow": []
      "sstp": null
      "thumbnail": null

  load: (callback)->
    Balloon.loadBalloonSurfaces @directory, @balloons, (err)=>
      Balloon.loadBalloonDescripts(@directory, @balloons, @descript)
      callback(err)

  attachSurface: (canvas, scopeId, surfaceId)->
    type = if scopeId is 0 then "sakura" else "kero"
    if !!@balloons[type][surfaceId]
    then new BalloonSurface(canvas, scopeId, @balloons[type][surfaceId], @balloons)
    else null


  @loadBalloonDescripts: (directory, balloons, descript)->
    Object.keys(directory)
      .filter((filepath)-> /balloon([sk])(\d+)s\.txt$/.test(filepath))
      .forEach (filepath)->
        buffer = directory[filepath].asArrayBuffer()
        _descript = Nar.parseDescript(Nar.convert(buffer))
        [__, type, n] = /balloon([sk])(\d+)s\.txt$/.exec(filepath)
        switch type
          when "s" then balloons["sakura"][Number(n)].descript = $.extend(true, _descript, descript)
          when "k" then balloons["kero"][Number(n)].descript = $.extend(true, _descript, descript)
    undefined

  @loadBalloonSurfaces: (directory, balloons, callback)->
    promises = Object.keys(directory)
      .filter((filepath)-> /[^\/]+\.png$/.test(filepath))
      .map (filepath)->
        new Promise (resolve, reject)->
          buffer = directory[filepath].asArrayBuffer()
          url = URL.createObjectURL(new Blob([buffer], {type: "image/png"}))
          SurfaceUtil.loadImage url, (err, img)->
            URL.revokeObjectURL(url)
            if !!err then return reject(err)
            if /^balloon([ksc])(\d+)\.png$/.test(filepath)
              [__, type, n] = /^balloon([ksc])(\d+)\.png$/.exec(filepath)
              switch type
                when "s" then balloons["sakura"][Number(n)] = {canvas: SurfaceUtil.transImage(img)}
                when "k" then balloons["kero"][Number(n)] = {canvas: SurfaceUtil.transImage(img)}
                when "c" then balloons["communicate"][Number(n)] = {canvas: SurfaceUtil.transImage(img)}
            else if /^online(\d+)\.png$/.test(filepath)
              [__, n] = /^online(\d+)\.png$/.exec(filepath)
              balloons["online"][Number(n)] = {canvas: SurfaceUtil.transImage(img)}
            else if /^arrow(\d+)\.png$/.test(filepath)
              [__, n] = /^arrow(\d+)\.png$/.exec(filepath)
              balloons["arrow"][Number(n)] = {canvas: SurfaceUtil.transImage(img)}
            else if /^sstp\.png$/.test(filepath)
              balloons["sstp"] = {canvas: SurfaceUtil.transImage(img)}
            else if /^thumbnail\.png$/.test(filepath)
              balloons["thumbnail"] = {canvas: SurfaceUtil.transImage(img)}
            resolve()
    Promise.all(promises)
      .then(-> callback(null, ))
      .catch((err)-> console.error(err, err.stack); callback(err))
    undefined
