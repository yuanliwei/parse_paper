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

test()
