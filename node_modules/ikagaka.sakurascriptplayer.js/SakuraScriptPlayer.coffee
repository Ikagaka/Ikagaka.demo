

class SakuraScriptPlayer
  constructor: (@named)->
    @playing = false
    @breakTid = 0
    @timeCritical = false

  play: (script, callback=->)->
    if @playing and @timeCritical
      setTimeout -> callback(true)
      return
    @break()
    @playing = true
    @timeCritical = false

    quick = false
    wait = 80

    reg =
      "Y0": /^\\0/
      "Y1": /^\\1/
      "Yh": /^\\h/
      "Yu": /^\\u/
      "Yp": /^\\p\[(\d+)\]/
      "Ypn": /^\\p(\d)/
      "Ysn": /^\\s(\d)/
      "Ys": /^\\s\[([^\]]+)\]/
      "Yb": /^\\b\[([^\]]+)\]/
      "Yi": /^\\i\[(\d+)\]/
      "YwN": /^\\w(\d+)/
      "Y_w": /^\\\_w\[(\d+)\]/
      "Y_q": /^\\\_q/
      "Yt": /^\\t/
      "Yx": /^\\x/
      "Yq": /^\\q\[([^\]]+)\]/
      "Y_aB":/^\\_a\[([^\]]+)\]/
      "Y_aE":/^\\_a/
      "YnH": /^\\n\[half\]/
      "Yn": /^\\n/
      "Yc": /^\\c/
      "Ye": /^\\e/
      "YY": /^\\\\/

    do recur = =>
      if script.length is 0
        @playing = false
        @breakTid = setTimeout((=> @break() ), 10000)
        return
      wait = 80
      switch true
        when reg["Y0"].test(script)  then _script = script.replace(reg["Y0"],  ""); @named.scope(0).blimp(0)
        when reg["Y1"].test(script)  then _script = script.replace(reg["Y1"],  ""); @named.scope(1).blimp(0)
        when reg["Yh"].test(script)  then _script = script.replace(reg["Yh"],  ""); @named.scope(0).blimp(0)
        when reg["Yu"].test(script)  then _script = script.replace(reg["Yu"],  ""); @named.scope(1).blimp(0)
        when reg["Yp"].test(script)  then _script = script.replace(reg["Yp"],  ""); @named.scope(Number(reg["Yp"].exec(script)[1]))
        when reg["Ypn"].test(script) then _script = script.replace(reg["Ypn"], ""); @named.scope(Number(reg["Ypn"].exec(script)[1]))
        when reg["Ysn"].test(script) then _script = script.replace(reg["Ysn"], ""); @named.scope().surface(Number(reg["Ysn"].exec(script)[1]))
        when reg["Ys"].test(script)  then _script = script.replace(reg["Ys"],  ""); @named.scope().surface(Number(reg["Ys"].exec(script)[1]))
        when reg["Yb"].test(script)  then _script = script.replace(reg["Yb"],  ""); @named.scope().blimp(Number(reg["Yb"].exec(script)[1]))
        when reg["Yi"].test(script)  then _script = script.replace(reg["Yi"],  ""); @named.scope().surface().playAnimation(Number(reg["Yi"].exec(script)[1]))
        when reg["Y_q"].test(script) then _script = script.replace(reg["Y_q"], ""); quick = !quick
        when reg["YwN"].test(script) then _script = script.replace(reg["YwN"], ""); wait = Number(reg["YwN"].exec(script)[1])*100
        when reg["Y_w"].test(script) then _script = script.replace(reg["Y_w"], ""); wait = Number(reg["Y_w"].exec(script)[1])
        when reg["Yt"].test(script)  then _script = script.replace(reg["Yt"],  ""); @timeCritical = true
        when reg["Yq"].test(script)  then _script = script.replace(reg["Yq"],  ""); [title, id] = reg["Yq"].exec(script)[1].split(",", 2); @named.scope().blimp().choice(title, id)
        when reg["Y_aB"].test(script)then _script = script.replace(reg["Y_aB"],""); id = reg["Y_aB"].exec(script)[1]; @named.scope().blimp().anchorBegin(id)
        when reg["Y_aE"].test(script)then _script = script.replace(reg["Y_aE"],""); @named.scope().blimp().anchorEnd()
        when reg["YnH"].test(script) then _script = script.replace(reg["YnH"], ""); @named.scope().blimp().br()
        when reg["Yn"].test(script)  then _script = script.replace(reg["Yn"],  ""); @named.scope().blimp().br()
        when reg["Yc"].test(script)  then _script = script.replace(reg["Yc"],  ""); @named.scope().blimp().clear()
        when reg["Ye"].test(script)  then _script = "";                             @named.scopes.forEach (scope)-> scope.surface()?.YenE()
        when reg["YY"].test(script)  then _script = script.replace(reg["YY"],  ""); @named.scope().blimp().talk("\\")
        else                              _script = script.slice(1);                @named.scope().blimp().talk(script[0])
      script = _script
      wait = (if quick then 0 else wait)
      @breakTid = setTimeout(recur, wait)
    undefined

  break: ->
    @playing = false
    @timeCritical = false
    clearTimeout(@breakTid)
    @named.scopes.forEach (scope)->
      scope.blimp(-1).clear()
    undefined
