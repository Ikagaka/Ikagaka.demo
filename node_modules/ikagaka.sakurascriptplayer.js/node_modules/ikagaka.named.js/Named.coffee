

class Named

  $ = window["Zepto"]

  constructor: (@shell, @balloon)->
    @$named = $("<div />")
      .addClass("named")
    @$style = $("<style scoped />")
      .html("")
    @$named.append(@$style)
    @element = @$named[0]
    @scopes = []
    @currentScope = null

  scope: (scopeId)->
    if scopeId isnt undefined
      if !@scopes[scopeId]
        @scopes[scopeId] = new Scope(scopeId, @shell, @balloon)
        @scopes[scopeId].$scope.on "click", (ev)=>
          @$named.append(@scopes[scopeId].$scope)
      @currentScope = @scopes[scopeId]
      $(@element).append(@scopes[scopeId].element)
    @currentScope
