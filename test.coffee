test = ->
  console.log "print test"
  s = "daasdfgdhjkl"
  s = "000000000"
  num = 8.9

  sl = s.length
  nl = num.toString().length

  console.log "sl:#{sl} nl : #{nl}"
  rs = s.substring(0, sl - nl) + num
  console.log rs
  console.log "result : #{parseFloat(rs)}"

  console.log num.toString()
  console.log s

  splitKeyChar(prefix, char, partArr)

###
    以带有指定前缀的字符分割字符串
###
splitKeyCharWithPrefix = (prefix, keyChar, partArr) ->
  arr = []
  reg = new RegExp("#{prefix}(#{keyChar})")
  for part, i in partArr
    raw = part.raw
    repRaw = raw.replace reg, (mainStr, sub, index) =>
      "#{prefix}#{sub}-#{sub}#{sub}#{sub}-#{sub}"
    spArr = repRaw.split "#{keyChar}-#{keyChar}"

    reg = new RegExp("^#{keyChar}$")
    for sp in spArr
      reg.lastIndex = 0
      if reg.test sp
        # body...

  arr

test()
