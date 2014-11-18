

class Surface
  $ = window["Zepto"]
  _ = window["_"]
  Promise = window["Promise"]

  constructor: (@element, @scopeId, @surfaceName, @surfaces)->
    srf = @surfaces.surfaces[surfaceName]
    @baseSurface = srf.baseSurface
    @regions = srf.regions || {}
    @animations = srf.animations || {}
    @bufferCanvas = SurfaceUtil.copy(@baseSurface)
    @stopFlags = []
    @layers = []
    @destructed = false
    @talkCount = 0
    $(@element).on "click",     (ev)=> Surface.processMouseEvent(ev, @scopeId, @regions, "OnMouseClick",       ($ev)=> $(@element).trigger($ev))
    $(@element).on "dblclick",  (ev)=> Surface.processMouseEvent(ev, @scopeId, @regions, "OnDoubleMouseClick", ($ev)=> $(@element).trigger($ev))
    $(@element).on "mousemove", (ev)=> Surface.processMouseEvent(ev, @scopeId, @regions, "OnMouseMove",        ($ev)=> $(@element).trigger($ev))
    $(@element).on "mousedown", (ev)=> Surface.processMouseEvent(ev, @scopeId, @regions, "OnMouseDown",        ($ev)=> $(@element).trigger($ev))
    $(@element).on "mouseup",   (ev)=> Surface.processMouseEvent(ev, @scopeId, @regions, "OnMouseUp",          ($ev)=> $(@element).trigger($ev))
    $(@element).on "IkagakaTalkEvent", (ev)=> @talkCount++; Object.keys(@animations).filter((name)=> @animations[name].interval is "talk").forEach (name)=> @play(Number(@animations[name].is))

    Object
      .keys(@animations)
      .forEach (name)=>
        {is:_is, interval, pattern} = @animations[name]
        animationId = Number(_is)
        interval = interval || ""
        tmp = interval.split(",")
        interval = tmp[0]
        n = Number(tmp.slice(1).join(","))
        switch interval
          when "sometimes" then Surface.random   ((callback)=> if !@destructed and !@stopFlags[animationId] then @play(animationId, callback)), 2
          when "rarely"    then Surface.random   ((callback)=> if !@destructed and !@stopFlags[animationId] then @play(animationId, callback)), 4
          when "random"    then Surface.random   ((callback)=> if !@destructed and !@stopFlags[animationId] then @play(animationId, callback)), n
          when "periodic"  then Surface.periodic ((callback)=> if !@destructed and !@stopFlags[animationId] then @play(animationId, callback)), n
          when "always"    then Surface.always    (callback)=> if !@destructed and !@stopFlags[animationId] then @play(animationId, callback)
          when "runonce"   then @play(animationId, ->)
          when "never"     then ;
          when "bind"      then ;
          when "yen-e"
            $(@element).on "IkagakaYenEEvent", (ev)=>
              if !@destructed and !@stopFlags[animationId]
              then @play(animationId)
          when "talk"
            talkCount = 0
            $(@element).on "IkagakaTalkEvent", (ev)=>
              talkCount++
              if !@destructed and !@stopFlags[animationId] and talkCount % n is 0
              then @play(animationId)
          else
            if /^bind(?:\+(\d+))/.test(interval) then ;
            console.error(@animations[name])
    @render()

  destructor: ->
    SurfaceUtil.clear(@element)
    $(@element).off() # g.c.
    @destructed = true
    @layers = []
    undefined

  render: ->
    srfs = @surfaces.surfaces
    elements = @layers.reduce(((arr, layer)=>
      if !layer then return arr
      {surface, type, x, y} = layer
      if surface is "-1" then return arr
      hits = Object
        .keys(srfs)
        .filter((name)-> srfs[name].is is surface)
      if hits.length is 0 then return arr
      arr.concat({type, x, y, canvas: srfs[hits[hits.length-1]].baseSurface})
    ), [])
    SurfaceUtil.clear(@bufferCanvas)
    util = new SurfaceUtil(@bufferCanvas)
    util.composeElements([{"type": "base", "canvas": @baseSurface}].concat(elements))
    SurfaceUtil.clear(@element)
    util2 = new SurfaceUtil(@element)
    util2.init(@bufferCanvas)
    undefined

  play: (animationId, callback=->)->
    hits = Object
      .keys(@animations)
      .filter((name)=> Number(@animations[name].is) is animationId)
    if hits.length is 0 then setTimeout(callback); return undefined
    anim = @animations[hits[hits.length-1]]
    anim.patterns
      .map((pattern)=>
        =>
          new Promise (resolve, reject)=>
            {surface, wait, type} = pattern
            if /^start\,\d+/.test(type)
              animId = Number(type.split(",")[1])
              @play animId, -> resolve()
              return
            if /^stop\,\d+/.test(type)
              animId = Number(type.split(",")[1])
              @stop animId, -> resolve()
              return
            if /^alternativestart\,[\(\[](\d+(?:\[\,\.]\d+)*)[\)\]]/.test(type)
              [__, match] = /^alternativestop\,[\(\[](\d+(?:\[\,\.]\d+)*)[\)\]]/.exec(type)
              arr = match.split(/[\,\.]/)
              if arr.length > 0
                animId = Number(SurfaceUtil.choice(arr))
                @play animId, -> resolve()
                return
            if /^alternativestop\,[\(\[](\d+(?:\[\,\.]\d+)*)[\)\]]/.test(type)
              [__, match] = /^alternativestop\,[\(\[](\d+(?:\[\,\.]\d+)*)[\)\]]/.exec(type)
              arr = match.split(/[\,\.]/)
              if arr.length > 0
                animId = Number(SurfaceUtil.choice(arr))
                @stop(animId)
                resolve()
                return
            @layers[anim.is] = pattern
            @render()
            # ex. 100-200 ms wait
            [__, a, b] = /(\d+)(?:\-(\d+))?/.exec(wait)
            if b? then wait = _.random(Number(a), Number(b))
            setTimeout((=>
              if @destructed # stop pattern animation.
              then reject()
              else resolve()
            ), wait))
      .reduce(((proA, proB)-> proA.then(proB)), Promise.resolve()) # Promise.resolve().then(prom).then(prom)...
      .then(=> setTimeout(callback))
      .catch (err)-> console.error err.stack
    undefined

  stop: (animationId)->
    @stopFlags[animationId] = true
    undefined

  bind: (animationId)->
    hits = Object
      .keys(@animations)
      .filter((name)=> Number(@animations[name].is) is animationId)
    if hits.length is 0 then return undefined
    anim = @animations[hits[hits.length-1]]
    if anim.patterns.length is 0 then return undefined
    interval = anim.interval
    pattern = anim.patterns[anim.patterns.length-1]
    @layers[anim.is] = pattern
    @render()
    if /^bind(?:\+(\d+))/.test(interval)
      animIds = interval.split("+").slice(1)
      animIds.forEach (animId)=> @play(animId, ->)
    undefined

  unbind: (animationId)->
    delete @layers[animationId]
    undefined

  @processMouseEvent = (ev, scopeId, regions, eventName, callback)->
    {left, top} = $(ev.target).offset()
    offsetX = ev.pageX - left
    offsetY = ev.pageY - top
    $(ev.target).css({"cursor": "default"})
    if Surface.isHit(ev.target, offsetX, offsetY)
      ev.preventDefault()
      detail = Surface.createMouseEvent(eventName, scopeId, regions, offsetX, offsetY)
      if !!detail["Reference4"]
      then $(ev.target).css({"cursor": "pointer"})
      else $(ev.target).css({"cursor": "default"})
      callback($.Event('IkagakaSurfaceEvent', { detail, bubbles: true }))
    undefined

  @createMouseEvent = (eventName, scopeId, regions, offsetX, offsetY)->
    event =
      "ID": eventName
      "Reference0": offsetX|0
      "Reference1": offsetY|0
      "Reference2": 0
      "Reference3": scopeId
      "Reference4": ""
      "Reference5": 0
    hits = Object
      .keys(regions)
      .slice().sort((a, b)-> if a.is > b.is then 1 else -1)
      .filter((name)->
        {name, left, top, right, bottom} = regions[name]
        (left < offsetX < right and top < offsetY < bottom) or
        (right < offsetX < left and bottom < offsetY < top))
    if hits.length isnt 0
      event["Reference4"] = regions[hits[hits.length-1]].name
    event

  @random = (callback, n)->
    ms = 1
    ms++ while Math.round(Math.random() * 1000) > 1000/n
    setTimeout((-> callback(-> Surface.random(callback, n))), ms*1000)

  @periodic = (callback, n)->
    setTimeout((-> callback(-> Surface.periodic(callback, n))), n*1000)

  @always = (callback)->
    callback -> Surface.always(callback)

  @isHit = (canvas, x, y)->
    ctx = canvas.getContext "2d"
    imgdata = ctx.getImageData(0, 0, x, y)
    data = imgdata.data
    data[data.length-1] isnt 0
