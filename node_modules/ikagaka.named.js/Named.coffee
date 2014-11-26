

class Named

  $ = window["jQuery"]

  Scope = window["Scope"] || window["Ikagaka"]?["Scope"] || require("./Scope.js")

  prompt = window["prompt"]

  constructor: (@shell, @balloon)->
    @$named = $("<div />").addClass("named")
    @element = @$named[0]
    @scopes = []
    @scopes[0] = new Scope(0, @shell, @balloon)
    @currentScope = @scopes[0]
    @destructors = []

    do =>
      $target = null
      relLeft = relTop = 0
      onmouseup = (ev)=>
        if !!$target
          if $(ev.target).hasClass("blimpText") || $(ev.target).hasClass("blimpCanvas")
            if $target[0] is $(ev.target).parent()[0]
              $target = null
          else if $(ev.target).hasClass("surfaceCanvas")
            if $target[0] is $(ev.target).parent().parent()[0]
              $target = null
      onmousedown = (ev)=>
        if $(ev.target).hasClass("blimpText") || $(ev.target).hasClass("blimpCanvas")
          if $(ev.target).parent().parent()[0] is @element
            $target = $(ev.target).parent()
            {top, left} = $target.offset()
            offsetY = parseInt($target.css("left"), 10)
            offsetX = parseInt($target.css("top"), 10)
            relLeft = ev.pageX - offsetY
            relTop  = ev.pageY - offsetX
        if $(ev.target).hasClass("surfaceCanvas")
          if $(ev.target).parent().parent().parent()[0] is @element
            _target = $target = $(ev.target).parent().parent()
            {top, left} = $target.offset()
            relLeft = ev.pageX - left
            relTop  = ev.pageY - top
            setTimeout((=>
              @$named.append(_target) ), 100)
      onmousemove = (ev)=>
        if !!$target
          $target.css
            left: ev.pageX - relLeft
            top:  ev.pageY - relTop
      $body = $("body")
      $body.on("mouseup",   onmouseup)
      $body.on("mousedown", onmousedown)
      $body.on("mousemove", onmousemove)
      @destructors.push ->
        $body.off("mouseup",   onmouseup)
        $body.off("mousedown", onmousedown)
        $body.off("mousemove", onmousemove)
    do =>
      onblimpclick = (ev)=>
      @$named.on("click", ".blimp", onblimpclick)
      @destructors.push =>
        @$named.off("click", ".blimp", onblimpclick)
    do =>
      onanchorclick = (ev)=>
        detail =
          "ID": "OnChoiceSelect"
          "Reference0": ev.target.dataset["choiceid"]
        @$named.trigger($.Event("IkagakaSurfaceEvent", {detail}))
      onchoiceclick = (ev)=>
        detail =
          "ID": "OnAnchorSelect"
          "Reference0": ev.target.dataset["anchorid"]
        @$named.trigger($.Event("IkagakaSurfaceEvent", {detail}))
      @$named.on("click", ".ikagaka-choice", onanchorclick)
      @$named.on("click", ".ikagaka-anchor", onchoiceclick)
      @destructors.push =>
        @$named.off("click", ".ikagaka-choice", onanchorclick)
        @$named.off("click", ".ikagaka-anchor", onchoiceclick)


  destructor: ->
    @scopes.forEach (scope)-> $(scope.element).remove()
    @destructors.forEach (destructor)-> destructor()
    @$named.remove()

  scope: (scopeId)->
    if !isFinite(scopeId) then return @currentScope
    if !@scopes[scopeId]
      @scopes[scopeId] = new Scope(scopeId, @shell, @balloon)
    @currentScope = @scopes[scopeId]
    @$named.append(@scopes[scopeId].element)
    @currentScope

  openInputBox: (id, text="")->
    detail =
      "ID": "OnUserInput"
      "Reference1": id
      "Reference1": ""+prompt("UserInput", text)
    @$named.trigger($.Event("IkagakaSurfaceEvent", {detail}))

  openCommunicateBox: (text="")->
    detail =
      "ID": "OnCommunicate"
      "Reference0": "user"
      "Reference1": ""+prompt("Communicate", text)
    @$named.trigger($.Event("IkagakaSurfaceEvent", {detail}))

if module?.exports?
  module.exports = Named

if window["Ikagaka"]?
  window["Ikagaka"]["Named"] = Named
