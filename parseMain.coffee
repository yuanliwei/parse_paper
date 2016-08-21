console.log "hello "
fs = require 'fs' 

split = require './split'

paperText = fs.readFileSync('./paper.txt', 'utf-8')

# console.log paperText

split.run(paperText)
