

class BalloonSurface

  SurfaceUtil = window["SurfaceUtil"] || window["Ikagaka"]["SurfaceUtil"] #|| require("ikagaka.surfaceutil.js")

  constructor: (@element, @scopeId, balloonConf, @balloons)->
    @descript = balloonConf.descript
    @baseCanvas = balloonConf.canvas
    @render()

  destructor: ->
    $(@element).off() # g.c.
    undefined

  render: ->
    type = if @scopeId is 0 then "sakura" else "kero"
    util = new SurfaceUtil(@element)
    util.init(@baseCanvas)
    undefined

if module?.exports?
  module.exports = BalloonSurface

if window["Ikagaka"]?
  window["Ikagaka"]["BalloonSurface"] = BalloonSurface
