class this.Descript

  regComment = /(?:(?:^|\s)\/\/.*)|^\s+?$/g

  constructor: (text)->
    text = text.replace(/(?:\r\n|\r|\n)/g, "\n")
    regexec regComment, text, ([match, __...])-> #commentout
      text = text.replace(match, "")
    lines = text.split("\n");
    lines = lines.filter (val)-> val.length isnt 0
    for line in lines
      [key, vals...] = line.split(",")
      key = key.replace(/^\s+/, "").replace(/\s+$/, "")
      val = vals.join(",").replace(/^\s+/, "").replace(/\s+$/, "")
      if isFinite Number val then @[key] = Number val
      else                        @[key] = val

  regexec = (reg, str, fn)->
    ary = []
    while true
      matches = reg.exec str
      if not matches? then break
      ary.push fn matches
    ary