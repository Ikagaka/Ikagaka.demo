

class Scope

  $ = window["Zepto"]

  constructor: (@scopeId, @shell, @balloon)->
    @$scope = $("<div />")
      .addClass("scope")
      .css({
        "bottom": "0px",
        "right": (@scopeId*240)+"px"
      })
    @$style = $("<style scoped />")
      .html("""
        .scope {
          display: inline-block;
          position: absolute;
          /*-webkit-user-select: none;*/
          /*-webkit-tap-highlight-color: transparent;*/
        }
        .surfaceCanvas {
          display: inline-block;
        }
      """)
    @$surfaceCanvas = $("<canvas />")
      .addClass("surfaceCanvas")
    @$surface = $("<div />")
      .addClass("surface")
      .append(@$surfaceCanvas)
      .hide()
    @$blimpCanvas =  $("<canvas width='0' height='0' />")
      .addClass("blimpCanvas")
    @$blimpStyle = $("<style scoped />")
      .html("""
        .blimp {
          display: inline-block;
          position: absolute;
          top: 0px;
          left: 0px;
        }
        .blimpCanvas {
          display: inline-block;
          position: absolute;
          top: 0px;
          left: 0px;
        }
        .blimpText {
          display: inline-block;
          position: absolute;
          top: 0px;
          left: 0px;
          overflow-y: scroll;
          white-space: pre;
          white-space: pre-wrap;
          white-space: pre-line;
          word-wrap: break-word;
          /*pointer-events: none;*/
        }
      """)
    @$blimpText = $("<div />")
      .addClass("blimpText")
    @$blimp = $("<div />")
      .addClass("blimp")
      .append(@$blimpStyle)
      .append(@$blimpCanvas)
      .append(@$blimpText)
      .hide()
    @$scope
      .append(@$surface)
      .append(@$blimp)
      .append(@$style)
    @element = @$scope[0]
    @currentSurface = null
    @currentBalloon = null
    @leftFlag = true
    @$blimp.on "click", (ev)=>
      @leftFlag = !@leftFlag
      if @leftFlag
      then @blimp(0)
      else @blimp(1)


  surface: (surfaceId, callback=->)->
    type = if @scopeId is 0 then "sakura" else "kero"
    if surfaceId?
      if surfaceId is -1
      then @$surface.hide()
      else @$surface.show()
      if !!@currentSurface
      then @currentSurface.destructor()
      @currentSurface = @shell.attachSurface(@$surfaceCanvas[0], @scopeId, surfaceId)
    @currentSurface

  blimp: (balloonId, callback=->)->
    type = if @scopeId is 0 then "sakura" else "kero"
    if balloonId?
      if balloonId is -1
      then @$blimp.hide()
      else @$blimp.show()
      if !!@currentBalloon
      then @currentBalloon.destructor()
      @currentBalloon = @balloon.attachSurface(@$blimpCanvas[0], @scopeId, balloonId)
      if !!@currentBalloon
        descript = @currentBalloon.descript
        @$blimp.css({
          "width": @$blimpCanvas.width(),
          "height": @$blimpCanvas.height()
        })
        if @leftFlag
          @$blimp.css({
            "top":  Number(@shell.descript["#{type}.balloon.offsety"] or 0),
            "left": Number(@shell.descript["#{type}.balloon.offsetx"] or 0) + -1 * @$blimpCanvas.width()
          })
        else
          @$blimp.css({
            "top":  Number(@shell.descript["#{type}.balloon.offsety"] or 0),
            "left": Number(@shell.descript["#{type}.balloon.offsetx"] or 0) + @$surfaceCanvas.width()
          })
        t = descript["origin.y"] or descript["validrect.top"] or "10"
        r = descript["validrect.right"] or "10"
        b = descript["validrect.bottom"] or "10"
        l = descript["origin.x"] or descript["validrect.left"] or "10"
        w = @$blimpCanvas.width()
        h = @$blimpCanvas.height()
        @$blimpText.css({
          "top": "#{t}px",
          "left": "#{l}px",
          "width": "#{w-(Number(l)+Number(r))}px",
          "height": "#{h-(Number(t)-Number(b))}px"
        })
    talk: (txt)=>
      @$blimp.show()
      @$blimpText.html(@$blimpText.html() + txt)
      @$blimpText[0].scrollTop = 999
      undefined
    clear: (txt)=>
      @$blimpText.html("")
      undefined
    br: =>
      @$blimpText.html(@$blimpText.html() + "<br />")
      undefined
