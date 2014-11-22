

class Surface

  $ = window["jQuery"]
  _ = window["_"]
  Promise = window["Promise"]

  constructor: (@element, @scopeId, @surfaceName, @surfaces, callback=->)->
    srf = @surfaces.surfaces[surfaceName]
    @baseSurface = srf.baseSurface
    @regions = srf.regions || {}
    @animations = srf.animations || {}
    @bufferCanvas = SurfaceUtil.copy(@baseSurface)
    @stopFlags = {}
    @layers = {}
    @destructed = false
    @talkCount = 0
    @talkCounts = {}
    $(@element).on "click",     (ev)=> Surface.processMouseEvent(ev, @scopeId, @regions, "OnMouseClick",       ($ev)=> $(@element).trigger($ev))
    $(@element).on "dblclick",  (ev)=> Surface.processMouseEvent(ev, @scopeId, @regions, "OnMouseDoubleClick", ($ev)=> $(@element).trigger($ev))
    $(@element).on "mousedown", (ev)=> Surface.processMouseEvent(ev, @scopeId, @regions, "OnMouseDown",        ($ev)=> $(@element).trigger($ev))
    $(@element).on "mousemove", (ev)=> Surface.processMouseEvent(ev, @scopeId, @regions, "OnMouseMove",        ($ev)=> $(@element).trigger($ev))
    $(@element).on "mouseup",   (ev)=> Surface.processMouseEvent(ev, @scopeId, @regions, "OnMouseUp",          ($ev)=> $(@element).trigger($ev))
    $(@element).on "touchmove", (ev)=> Surface.processMouseEvent(ev, @scopeId, @regions, "OnMouseMove",        ($ev)=> $(@element).trigger($ev))
    $(@element).on "touchend",  (ev)=> Surface.processMouseEvent(ev, @scopeId, @regions, "OnMouseUp",          ($ev)=> $(@element).trigger($ev))
    $(@element).on "touchstart", do =>
      touchOnce = false
      (ev)=>
        touchOnce = !touchOnce
        if touchOnce
          Surface.processMouseEvent(ev, @scopeId, @regions, "OnMouseDown", ($ev)=> $(@element).trigger($ev))
          setTimeout((-> touchOnce = false), 500)

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
          when "runonce"   then @play(animationId, callback)
          when "never"     then ;
          when "bind"      then ;
          when "yen-e"     then ;
          when "talk"      then @talkCounts[name] = n;
          else
            if /^bind(?:\+(\d+))/.test(interval) then ;
            console.error(@animations[name])
    @render()

  destructor: ->
    SurfaceUtil.clear(@element)
    $(@element).off() # g.c.
    @destructed = true
    @layers = {}
    undefined

  YenE: ->
    Object
      .keys(@animations)
      .filter((name)=>
        @animations[name].interval is "yen-e" and
        @talkCount % @talkCounts[name] is 0)
      .forEach (name)=> @play(Number(@animations[name].is))

  talk: ->
    @talkCount++
    Object.keys(@animations)
      .filter((name)=>
        /^talk/.test(@animations[name].interval) and
        @talkCount % @talkCounts[name] is 0)
      .forEach (name)=> @play(Number(@animations[name].is))


  render: ->
    srfs = @surfaces.surfaces
    patterns = Object
      .keys(@layers)
      .sort((layerNumA, layerNumB)-> if Number(layerNumA) > Number(layerNumB) then 1 else -1)
      .map((key)=> @layers[key])
      .reduce(((arr, pat)=>
        {surface, type, x, y} = pat
        if surface is "-1" then return arr
        hits = Object.keys(srfs)
          .filter((key)-> srfs[key].is is surface)
        if hits.length is 0 then return arr
        arr.concat({
          type: type,
          x: Number(x),
          y: Number(y),
          canvas: srfs[hits[hits.length-1]].baseSurface
        })
      ), [])
    SurfaceUtil.clear(@bufferCanvas)
    util = new SurfaceUtil(@bufferCanvas)
    util.composeElements([{"type": "base", "canvas": @baseSurface}].concat(patterns))
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
    if /^touch/.test(ev.type)
      offsetX = ev.originalEvent.changedTouches[0].pageX - left
      offsetY = ev.originalEvent.changedTouches[0].pageY - top
    else
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
    ctx = canvas.getContext("2d")
    imgdata = ctx.getImageData(0, 0, x+1, y+1)
    data = imgdata.data
    data[data.length-1] isnt 0
