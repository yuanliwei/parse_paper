var Part, PartType, Sequence, countIndex, fs, initSeqArr, print, seqArr, splitSeq, splitWrap;

fs = require('fs');

Part = (function() {
  function Part(type, raw, last1, next, index1) {
    this.type = type;
    this.raw = raw;
    this.last = last1;
    this.next = next;
    this.index = index1;
  }

  return Part;

})();

Sequence = (function() {
  function Sequence(type, raw, last1, next, index1) {
    this.type = type;
    this.raw = raw;
    this.last = last1;
    this.next = next;
    this.index = index1;
  }

  Sequence.prototype.split = function(part, arr) {
    var i, item, j, len, strs;
    if (part.raw.indexOf(this.raw) < 0) {
      arr.push(part);
      return;
    }
    strs = part.raw.split(this.raw);
    for (i = j = 0, len = strs.length; j < len; i = ++j) {
      item = strs[i];
      if (item.length > 0) {
        arr.push(new Part(PartType.none, item, null, null, 0));
      }
      if (i !== strs.length - 1) {
        arr.push(new Part(this.type, this.raw, null, null, 0));
      }
    }
    return arr;
  };

  return Sequence;

})();

PartType = {
  none: 0,
  wrap: 1,
  text: 2,
  sqNum: 3,
  sqText: 4,
  sqOption: 5,
  qOption: 6,
  qQuestion: 7,
  qAnswer: 8,
  qAnalysis: 9,
  qCommen: 10,
  qDifficulty: 11
};

exports.run = function(paperText) {
  var j, len, part, partArr, rootPart;
  console.log('run into run function');
  print();
  partArr = [];
  rootPart = new Part(PartType.none, paperText, null, null, 0);
  partArr.push(rootPart);
  partArr = splitWrap(partArr);
  partArr = splitSeq(partArr);
  partArr = countIndex(partArr);
  fs.writeFileSync('splitResult.txt', '\n');
  for (j = 0, len = partArr.length; j < len; j++) {
    part = partArr[j];
    fs.appendFileSync('splitResult.txt', part.raw);
  }
};

print = function() {
  return console.log('call print function');
};


/*
    分割换行
 */

splitWrap = function(partArr) {
  var arr, index, j, k, len, len1, part, sItem, spArr;
  arr = [];
  index = 0;
  for (j = 0, len = partArr.length; j < len; j++) {
    part = partArr[j];
    if (part.type !== PartType.none) {
      arr.push(part);
      continue;
    }
    spArr = part.raw.replace(/\r\n/g, '\n').split('\n');
    for (k = 0, len1 = spArr.length; k < len1; k++) {
      sItem = spArr[k];
      arr.push(new Part(PartType.none, sItem, null, null, index++));
      arr.push(new Part(PartType.wrap, "<br>", null, null, index++));
    }
  }
  return arr;
};


/*
    分割序号、关键字
 */

splitSeq = function(partArr) {
  var arr, j, k, len, len1, part, seq, temArr;
  arr = partArr;
  for (j = 0, len = seqArr.length; j < len; j++) {
    seq = seqArr[j];
    temArr = [];
    for (k = 0, len1 = arr.length; k < len1; k++) {
      part = arr[k];
      if (part.type !== PartType.none) {
        temArr.push(part);
        continue;
      }
      seq.split(part, temArr);
    }
    arr = temArr;
  }
  return arr;
};


/*
    计算Part索引
 */

countIndex = function(partArr) {
  var i, j, last, len, part;
  last = null;
  for (i = j = 0, len = partArr.length; j < len; i = ++j) {
    part = partArr[i];
    part.index = i;
    if (last != null) {
      last.next = part;
    }
    part.last = last;
    last = part;
  }
  return partArr;
};

seqArr = [];

initSeqArr = function() {
  var index, j, k, l, last, len, len1, len2, s, seqs, sequence;
  seqs = '123456789';
  last = null;
  for (index = j = 0, len = seqs.length; j < len; index = ++j) {
    s = seqs[index];
    console.log("s = " + s);
    sequence = new Sequence(PartType.sqNum, s, last, null, index);
    seqArr.push(sequence);
    if (last != null) {
      last.next = sequence;
    }
    last = sequence;
  }
  seqs = '一二三四五六七八九十';
  last = null;
  for (index = k = 0, len1 = seqs.length; k < len1; index = ++k) {
    s = seqs[index];
    console.log("s = " + s);
    sequence = new Sequence(PartType.sqText, s, last, null, index);
    seqArr.push(sequence);
    if (last != null) {
      last.next = sequence;
    }
    last = sequence;
  }
  seqs = 'ABCDEFGHI';
  last = null;
  for (index = l = 0, len2 = seqs.length; l < len2; index = ++l) {
    s = seqs[index];
    console.log("s = " + s);
    sequence = new Sequence(PartType.sqOption, s, last, null, index);
    seqArr.push(sequence);
    if (last != null) {
      last.next = sequence;
    }
    last = sequence;
  }
  seqArr.push(new Sequence(PartType.qOption, "选择题", null, null, index));
  seqArr.push(new Sequence(PartType.qQuestion, "问答题", null, null, index));
  seqArr.push(new Sequence(PartType.qAnswer, "答案", null, null, index));
  seqArr.push(new Sequence(PartType.qAnalysis, "解析", null, null, index));
  seqArr.push(new Sequence(PartType.qCommen, "点评", null, null, index));
  return seqArr.push(new Sequence(PartType.qDifficulty, "难度", null, null, index));
};

initSeqArr();
