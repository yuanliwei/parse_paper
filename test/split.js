var Part, PartType, Sequence, countIndex, fs, initSeqArr, mergePart, mergeSeq, mergeSeqBySymbol, print, seqArr, splitSeq, splitWrap;

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
  partArr = mergePart(partArr);
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
    合并多余的Part
 */

mergePart = function(partArr) {
  var arr;
  arr = [];
  partArr = mergeSeq(partArr);
  arr = partArr;
  return arr;
};


/*
    合并序号
 */

mergeSeq = function(partArr) {
  partArr = mergeSeqBySymbol(partArr, '25232', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '25233', PartType.text);
  return partArr;
};


/*
    根据符号模型和partType合并多余序号
 */

mergeSeqBySymbol = function(partArr, symbol, partType) {
  var arr, combineStr, end, firstPart, i, index, indexMap, j, k, l, len, len1, loopIndex, nextStart, part, realIndex, ref, start, typeArr, typeStr;
  typeArr = [];
  indexMap = {};
  index = 0;
  for (j = 0, len = partArr.length; j < len; j++) {
    part = partArr[j];
    typeArr.push(part.type);
    indexMap[index] = part.index;
    index += part.type.toString().length;
  }
  typeStr = typeArr.join('');
  loopIndex = 0;
  while (true) {
    console.log("start-----------------------------------");
    start = typeStr.indexOf(symbol, loopIndex);
    if (start === -1) {
      break;
    }
    loopIndex = start + 1;
    end = start + symbol.length;
    console.log("start : " + start + " end : " + end + " loopIndex : " + loopIndex + " ");
    while (true) {
      nextStart = typeStr.indexOf(symbol, loopIndex);
      console.log("next start : " + nextStart);
      if (nextStart !== -1 && start + symbol.length > nextStart) {
        loopIndex = nextStart + 1;
        end = nextStart + symbol.length;
        console.log("next start : " + nextStart + " end : " + end + " loopIndex : " + loopIndex);
      } else {
        break;
      }
    }
    realIndex = indexMap[start];
    combineStr = [];
    firstPart = partArr[realIndex];
    for (i = k = 0, ref = end - start; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      part = partArr[realIndex + i];
      combineStr.push(part.raw);
      part.type = PartType.none;
    }
    firstPart.type = partType;
    firstPart.raw = combineStr.join('');
  }
  arr = [];
  for (l = 0, len1 = partArr.length; l < len1; l++) {
    part = partArr[l];
    if (part.type !== PartType.none) {
      arr.push(part);
    }
  }
  arr = countIndex(arr);
  return arr;
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
    if (part.type === PartType.none) {
      part.type = PartType.text;
    }
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
