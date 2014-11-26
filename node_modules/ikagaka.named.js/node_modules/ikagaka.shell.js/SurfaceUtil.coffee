

class SurfaceUtil

  constructor: (@cnv)->
    @ctx = @cnv.getContext("2d")

  composeElements: (elements)->
    if elements.length is 0 then return
    {canvas, type, x, y} = elements[0]
    offsetX = offsetY = 0
    switch type
      when "base"        then @base(       canvas, offsetX,     offsetY)
      when "overlay"     then @overlayfast(canvas, offsetX + x, offsetY + y)
      when "overlayfast" then @overlayfast(canvas, offsetX + x, offsetY + y)
      when "replace"     then @replace(    canvas, offsetX + x, offsetY + y)
      when "add"         then @overlayfast(canvas, offsetX + x, offsetY + y)
      when "bind"        then @overlayfast(canvas, offsetX + x, offsetY + y)
      when "interpolate" then @interpolate(canvas, offsetX + x, offsetY + y)
      when "move"
        offsetX = x
        offsetY = y
        copyed = SurfaceUtil.copy(@cnv)
        @base(copyed, offsetX, offsetY)
      else console.error(elements[0])
    @composeElements(elements.slice(1))
    undefined

  base: (part, x, y)->
    SurfaceUtil.clear(@cnv)
    @overlayfast(part, x, y)
    undefined

  overlayfast: (part, x, y)->
    @ctx.globalCompositeOperation = "source-over"
    @ctx.drawImage(part, x, y)
    undefined

  interpolate: (part, x, y)->
    @ctx.globalCompositeOperation = "destination-over"
    @ctx.drawImage(part, x, y)
    undefined

  replace: (part, x, y)->
    @ctx.clearRect(x, y, part.width, part.height)
    @overlayfast(part, x, y)

    undefined

  init: (cnv)->
    @cnv.width = cnv.width
    @cnv.height = cnv.height
    @overlayfast(cnv, 0, 0)
    undefined

  @choice = (ary)-> ary[Math.round(Math.random()*(ary.length-1))]

  @clear = (cnv)->
    cnv.width = cnv.width
    undefined

  @copy = (cnv)->
    copy = document.createElement("canvas")
    ctx = copy.getContext("2d")
    copy.width  = cnv.width
    copy.height = cnv.height
    ctx.drawImage(cnv, 0, 0)
    copy

  @transImage = (img)->
    cnv = SurfaceUtil.copy(img)
    ctx = cnv.getContext("2d")
    imgdata = ctx.getImageData(0, 0, img.width, img.height)
    data = imgdata.data
    [r, g, b, a] = data
    i = 0
    if a isnt 0
      while i < data.length
        if r is data[i] and
           g is data[i+1] and
           b is data[i+2]
          data[i+3] = 0
        i += 4
    ctx.putImageData(imgdata, 0, 0)
    cnv

  @loadImage = (url, callback)->
    img = new Image
    img.src = url
    img.addEventListener "load", -> callback(null, img)
    img.addEventListener "error", (ev)-> console.error(ev); callback(ev.error, null)
    undefined

if module?.exports?
  module.exports = SurfaceUtil

if window["Ikagaka"]?
  window["Ikagaka"]["SurfaceUtil"] = SurfaceUtil
