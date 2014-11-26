

class BalloonSurface

  SurfaceUtil = window["SurfaceUtil"]

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
