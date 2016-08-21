var fs, paperText, split;

console.log("hello ");

// fs = require('fs');
//
// split = require('./split');

paperText = fs.readFileSync('./paper.txt', 'utf-8');

split.run(paperText);
