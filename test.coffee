test = ->
  console.log "print test"
  s = "daasdfgdhjkl"
  index = s.indexOf('A')
  console.log s
  console.log "index : #{index}"
  ss = s.split('A')
  console.dir ss
  arr = []
  for item, i in ss
    # if not item? and i is 1
    console.dir item?
    arr.push item if item.length > 0
    arr.push "-A-" if i != ss.length - 1
  console.dir arr

test()
