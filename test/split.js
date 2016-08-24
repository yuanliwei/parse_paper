var EleType, Element, Part, PartType, Sequence, countIndex, fs, initSeqArr, mergePart, mergeSeq, mergeSeqBySymbol, mergeSeqBySymbolRegex, print, seqArr, splitSeq, splitSpace, splitWrap, tohtml;

fs = require('fs');

tohtml = require('./tohtml');

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

Element = (function() {
  function Element(type, parts, last1, next, index1) {
    this.type = type;
    this.parts = parts;
    this.last = last1;
    this.next = next;
    this.index = index1;
    if (this.parts == null) {
      this.parts = [];
    }
  }

  return Element;

})();

PartType = {
  none: 0,
  wrap: 1,
  space: 1.1,
  text: 2,
  sqNum: 3,
  sqText: 4,
  sqOption: 5,
  spBrackets: 5.1,
  qOption: 6,
  qQuestion: 7,
  qAnswer: 8,
  qAnalysis: 9,
  qCommen: 10,
  qDifficulty: 11
};

EleType = {
  none: 0,
  qNo: 1,
  qText: 2,
  qOption: 3,
  qAnswer: 4,
  qAnalysis: 5,
  qCommen: 6,
  qDifficulty: 7
};

exports.run = function(paperText) {
  var eleArr, partArr, rootPart;
  console.log('run into run function');
  print();
  partArr = [];
  rootPart = new Part(PartType.none, paperText, null, null, 0);
  partArr.push(rootPart);
  partArr = splitWrap(partArr);
  partArr = splitSpace(partArr);
  partArr = splitSeq(partArr);
  partArr = countIndex(partArr);
  partArr = mergePart(partArr);
  console.table(partArr);
  tohtml.displayPartArr(partArr);
  eleArr = [];
  console.table(eleArr);
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
  partArr = mergeSeqBySymbol(partArr, '2,5,2,3,3,3,', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '2,5,2,3,2,', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '2,5,2,3,3,', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '2,1.1,2,', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '1.1,2,', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '2,1.1,', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '5.1,8,5.1,', PartType.qAnswer);
  partArr = mergeSeqBySymbol(partArr, '5.1,9,5.1,', PartType.qAnalysis);
  partArr = mergeSeqBySymbolRegex(partArr, '5.1,(1.1,)*9,(1.1,)*5.1,', PartType.qAnalysis);
  partArr = mergeSeqBySymbol(partArr, '5.1,10,5.1,', PartType.qCommen);
  partArr = mergeSeqBySymbol(partArr, '5.1,11,5.1,', PartType.qDifficulty);
  partArr = mergeSeqBySymbol(partArr, '2,2,', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '2,3,2,', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '2,4,2,', PartType.text);
  return partArr;
};


/*
    根据符号模型和partType合并多余序号
 */

mergeSeqBySymbol = function(partArr, symbol, partType) {
  var arr, combineStr, endPos, firstPart, i, index, indexMap, j, k, l, lastPos, len, len1, len2, len3, len4, loopIndex, m, n, o, part, pos, posArr, ref, ref1, symbolLength, temPosArr, temTypeArr, typeArr, typeStr;
  typeArr = [];
  indexMap = {};
  index = 0;
  for (j = 0, len = partArr.length; j < len; j++) {
    part = partArr[j];
    typeArr.push(part.type);
    indexMap[index] = part.index;
    index += part.type.toString().length;
  }
  typeStr = typeArr.join(',');
  posArr = [];
  loopIndex = 0;
  temTypeArr = [];
  symbolLength = symbol.split(',').length - 1;
  if (!symbol.endsWith(',')) {
    throw new Error("symbol : " + symbol + " 格式错误，应以“,”结尾！");
  }
  console.log("symbol length : " + symbolLength);
  for (i = k = 0, len1 = partArr.length; k < len1; i = ++k) {
    part = partArr[i];
    temTypeArr.push(part.type + ",");
    if (temTypeArr.length > symbolLength) {
      temTypeArr.shift();
    }
    if (temTypeArr.join('') === symbol) {
      posArr.push({
        start: i - symbolLength + 1,
        end: i + 1
      });
    }
  }
  endPos = 0;
  temPosArr = [];
  for (i = l = 0, len2 = posArr.length; l < len2; i = ++l) {
    pos = posArr[i];
    if (pos.start < endPos) {
      lastPos = temPosArr.pop();
      lastPos.end = endPos = pos.end;
      temPosArr.push(lastPos);
    } else {
      endPos = pos.end;
      temPosArr.push(pos);
    }
  }
  posArr = temPosArr;
  for (m = 0, len3 = posArr.length; m < len3; m++) {
    pos = posArr[m];
    combineStr = [];
    firstPart = partArr[pos.start];
    for (i = n = ref = pos.start, ref1 = pos.end; ref <= ref1 ? n < ref1 : n > ref1; i = ref <= ref1 ? ++n : --n) {
      part = partArr[i];
      part.type = PartType.none;
      combineStr.push(part.raw);
    }
    firstPart.raw = combineStr.join('');
    firstPart.type = partType;
  }
  arr = [];
  for (o = 0, len4 = partArr.length; o < len4; o++) {
    part = partArr[o];
    if (part.type !== PartType.none) {
      arr.push(part);
    }
  }
  return arr = countIndex(arr);
};


/*
    根据符号模型和partType合并多余序号 忽略空白字符
    5.1,(1.1,)*9,(1.1,)*5.1,

    todo 使用定长字符串
    5.1,9,1.1,1.1,5.1,
    5.1,1.1,1.1,9,1.1,1.1,5.1,
    5.1,1.1,1.1,9,1.1,5.1,
    5.1,1.1,9,1.1,5.1,
    5.1,9,1.1,5.1,
    5.1,9,5.1,
 */

mergeSeqBySymbolRegex = function(partArr, symbol, partType) {
  var arr, combineStr, endPos, firstPart, i, index, indexMap, j, k, l, lastPos, len, len1, len2, len3, len4, loopIndex, m, n, o, part, pos, posArr, ref, ref1, regex, symbolLength, temPosArr, temTypeArr, typeArr, typeStr;
  typeArr = [];
  indexMap = {};
  index = 0;
  for (j = 0, len = partArr.length; j < len; j++) {
    part = partArr[j];
    typeArr.push(part.type);
    indexMap[index] = part.index;
    index += part.type.toString().length;
  }
  typeStr = typeArr.join(',');
  posArr = [];
  loopIndex = 0;
  temTypeArr = [];
  symbolLength = symbol.split(',').length - 1;
  if (!symbol.endsWith(',')) {
    throw new Error("symbol : " + symbol + " 格式错误，应以“,”结尾！");
  }
  console.log("symbol length : " + symbolLength);
  regex = new RegExp(symbol);
  for (i = k = 0, len1 = partArr.length; k < len1; i = ++k) {
    part = partArr[i];
    temTypeArr.push(part.type + ",");
    if (temTypeArr.length > symbolLength) {
      temTypeArr.shift();
    }
    if (regex.test(temTypeArr.join(''))) {
      posArr.push({
        start: i - symbolLength + 1,
        end: i + 1
      });
    }
  }
  endPos = 0;
  temPosArr = [];
  for (i = l = 0, len2 = posArr.length; l < len2; i = ++l) {
    pos = posArr[i];
    if (pos.start < endPos) {
      lastPos = temPosArr.pop();
      lastPos.end = endPos = pos.end;
      temPosArr.push(lastPos);
    } else {
      endPos = pos.end;
      temPosArr.push(pos);
    }
  }
  posArr = temPosArr;
  for (m = 0, len3 = posArr.length; m < len3; m++) {
    pos = posArr[m];
    combineStr = [];
    firstPart = partArr[pos.start];
    for (i = n = ref = pos.start, ref1 = pos.end; ref <= ref1 ? n < ref1 : n > ref1; i = ref <= ref1 ? ++n : --n) {
      part = partArr[i];
      part.type = PartType.none;
      combineStr.push(part.raw);
    }
    firstPart.raw = combineStr.join('');
    firstPart.type = partType;
  }
  arr = [];
  for (o = 0, len4 = partArr.length; o < len4; o++) {
    part = partArr[o];
    if (part.type !== PartType.none) {
      arr.push(part);
    }
  }
  return arr = countIndex(arr);
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
    分割空格
 */

splitSpace = function(partArr) {
  var arr, index, j, k, len, len1, part, sItem, spArr;
  arr = [];
  index = 0;
  for (j = 0, len = partArr.length; j < len; j++) {
    part = partArr[j];
    if (part.type !== PartType.none) {
      arr.push(part);
      continue;
    }
    spArr = part.raw.replace(/\r\n/g, '\n').split(' ');
    for (k = 0, len1 = spArr.length; k < len1; k++) {
      sItem = spArr[k];
      arr.push(new Part(PartType.none, sItem, null, null, index++));
      arr.push(new Part(PartType.space, "<space>", null, null, index++));
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
  var index, j, k, l, last, len, len1, len2, len3, m, s, seqs, sequence;
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
  seqs = '【】';
  last = null;
  for (index = m = 0, len3 = seqs.length; m < len3; index = ++m) {
    s = seqs[index];
    console.log("s = " + s);
    sequence = new Sequence(PartType.spBrackets, s, last, null, index);
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
