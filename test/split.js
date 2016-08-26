var EleType, Element, Part, PartType, Sequence, countIndex, fs, initSeqArr, mergePart, mergeSeq, mergeSeqBySymbol, mergeSeqBySymbolRegex, parsePartArr, parseQElement, print, seqArr, splitNum, splitSeq, splitSpace, splitStr, splitWrap, tohtml;

fs = require('fs');

tohtml = require('./tohtml');

Part = (function() {
  function Part(type, raw1, last1, next, index1) {
    this.type = type;
    this.raw = raw1;
    this.last = last1;
    this.next = next;
    this.index = index1;
  }

  return Part;

})();

Sequence = (function() {
  function Sequence(type, raw1, last1, next, index1) {
    this.type = type;
    this.raw = raw1;
    this.last = last1;
    this.next = next;
    this.index = index1;
  }

  return Sequence;

})();

Element = (function() {
  function Element(type, parts1, start1, end1, last1, next, index1) {
    this.type = type;
    this.parts = parts1;
    this.start = start1;
    this.end = end1;
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
  none: '1000',
  wrap: '1010',
  space: '1011',
  text: '1020',
  sqNum: '1030',
  sqText: '1040',
  sqOption: '1050',
  spBrackets: '1051',
  qOption: '1060',
  qQuestion: '1070',
  qAnswer: '1080',
  qAnalysis: '1090',
  qCommen: '1100',
  qDifficulty: '1110'
};

EleType = {
  none: '1000',
  qNo: '1010',
  qText: '1020',
  qOption: '1030',
  qOptionNo: '1031',
  qAnswer: '1040',
  qAnalysis: '1050',
  qCommen: '1060',
  qDifficulty: '1070'
};

exports.run = function(paperText) {
  var eleArr, partArr, rootPart;
  console.log('run into run function');
  print();
  partArr = [];
  rootPart = new Part(PartType.none, paperText, null, null, 0);
  partArr.push(rootPart);
  partArr = splitWrap(partArr);
  partArr = splitNum(partArr);
  partArr = splitSeq(partArr);
  partArr = splitSpace(partArr);
  partArr = countIndex(partArr);
  partArr = mergePart(partArr);
  console.table(partArr);
  tohtml.displayPartArr(partArr);
  eleArr = [];
  eleArr = parsePartArr(partArr);
  console.table(eleArr);
  tohtml.displayElementArr(eleArr);
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
  partArr = mergeSeqBySymbol(partArr, '1020,1050,1020,1030', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '1020,1010,1020', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '1051,1080,1051', PartType.qAnswer);
  partArr = mergeSeqBySymbolRegex(partArr, '1051;1011{0,10};1090;1011{0,10};1051', PartType.qAnalysis);
  partArr = mergeSeqBySymbolRegex(partArr, '1051;1011{0,10};1100;1011{0,10};1051', PartType.qCommen);
  partArr = mergeSeqBySymbol(partArr, '1051,1110,1051', PartType.qDifficulty);
  partArr = mergeSeqBySymbol(partArr, '1020,1010,1020,1010,1020', PartType.text);
  partArr = mergeSeqBySymbolRegex(partArr, '1011;1011+', PartType.space);
  partArr = mergeSeqBySymbolRegex(partArr, '1011;1020', PartType.text);
  partArr = mergeSeqBySymbolRegex(partArr, '1020;1011', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '1020,1020', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '1020,1040,1020', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '1020,1030,1020', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '1020,1040,1020', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '1020,1060,1020', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '1020,1080,1020', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '1020,1090,1020', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '1011,1040,1020', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '1011,1050,1020', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '1020,1030,1011', PartType.text);
  partArr = mergeSeqBySymbol(partArr, '1020,1030,1020', PartType.text);
  return partArr;
};


/*
    解析成试题单元 （题号，题干，选项，。。。。。）
 */

parsePartArr = function(partArr) {
  var ele, eleArr, j, k, key, len, len1, pTypeArr, part, temObj, typeStr;
  pTypeArr = [];
  for (j = 0, len = partArr.length; j < len; j++) {
    part = partArr[j];
    pTypeArr.push(part.type);
  }
  typeStr = pTypeArr.join('');
  eleArr = [];
  parseQElement(eleArr, EleType.qOptionNo, '1010,(1050,)1020,1050', typeStr, partArr);
  parseQElement(eleArr, EleType.qOptionNo, '1050,1020,(1050,)1020', typeStr, partArr);
  parseQElement(eleArr, EleType.qOption, '1010,1050,(1020,)1050', typeStr, partArr);
  parseQElement(eleArr, EleType.qOption, '1020,1050,(1020,)1050', typeStr, partArr);
  temObj = {};
  for (k = 0, len1 = eleArr.length; k < len1; k++) {
    ele = eleArr[k];
    key = ele.type + ele.start + ele.end;
    temObj[key] = ele;
  }
  eleArr = [];
  for (key in temObj) {
    eleArr.push(temObj[key]);
  }
  eleArr.sort(function(l, h) {
    return l.start - h.start;
  });
  return eleArr;
};


/*
    解析试题单元
 */

parseQElement = function(eleArr, eleType, symbol, typeStr, partArr) {
  var reg, sym, typeLength;
  sym = symbol.replace(/,/g, '');
  typeLength = PartType.none.length;
  reg = new RegExp(sym, 'g');
  typeStr.replace(reg, (function(_this) {
    return function(match, sub, index) {
      var end, i, j, parts, ref, ref1, start, subIndex, subMatchLength;
      console.log(sub);
      console.dir(reg);
      subMatchLength = sub.length / typeLength;
      subIndex = sym.indexOf("(" + sub);
      start = (index + subIndex) / typeLength;
      end = start + subMatchLength;
      if (start % 1 !== 0 || end % 1 !== 0) {
        console.error("count index error!");
      }
      parts = [];
      for (i = j = ref = start, ref1 = end; ref <= ref1 ? j < ref1 : j > ref1; i = ref <= ref1 ? ++j : --j) {
        parts.push(partArr[i]);
      }
      eleArr.push(new Element(eleType, parts, start, end, null, null, 0));
      return sub;
    };
  })(this));
};


/*
    根据符号模型和partType合并多余序号
 */

mergeSeqBySymbol = function(partArr, symbol, partType) {
  var arr, combineStr, endPos, firstPart, i, index, j, k, lastPos, len, len1, len2, len3, n, o, p, part, pos, posArr, raw, ref, ref1, sbls, symbolStr, temPosArr, typeArr, typeLength, typeStr;
  typeLength = PartType.none.length;
  typeArr = [];
  for (j = 0, len = partArr.length; j < len; j++) {
    part = partArr[j];
    typeArr.push(part.type);
  }
  typeStr = typeArr.join('');
  sbls = symbol.split(',');
  symbolStr = sbls.join('');
  lastPos = 0;
  posArr = [];
  while (true) {
    index = typeStr.indexOf(symbolStr, lastPos);
    if (index === -1) {
      break;
    }
    lastPos = index + 1;
    posArr.push({
      start: index / typeLength,
      end: index / typeLength + sbls.length
    });
  }
  endPos = 0;
  temPosArr = [];
  for (i = k = 0, len1 = posArr.length; k < len1; i = ++k) {
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
  for (n = 0, len2 = posArr.length; n < len2; n++) {
    pos = posArr[n];
    combineStr = [];
    firstPart = partArr[pos.start];
    for (i = o = ref = pos.start, ref1 = pos.end; ref <= ref1 ? o < ref1 : o > ref1; i = ref <= ref1 ? ++o : --o) {
      part = partArr[i];
      raw = part.raw;
      if (part.type === PartType.space) {
        raw = ' ';
      }
      part.type = PartType.none;
      combineStr.push(raw);
    }
    firstPart.raw = combineStr.join('');
    firstPart.type = partType;
  }
  arr = [];
  for (p = 0, len3 = partArr.length; p < len3; p++) {
    part = partArr[p];
    if (part.type !== PartType.none) {
      arr.push(part);
    }
  }
  return arr = countIndex(arr);
};


/*
    根据符号模型和partType合并多余序号 使用正则表达式
 */

mergeSeqBySymbolRegex = function(partArr, symbol, partType) {
  var arr, combineStr, endPos, firstPart, i, index, j, k, lastPos, len, len1, len2, len3, len4, len5, m, matchObj, matchs, n, o, p, part, pos, posArr, q, r, raw, ref, ref1, ref2, ref3, reg, s1, s2, sbl, sbls, symbolStr, t, temPosArr, temSbls, typeArr, typeLength, typeStr;
  typeLength = PartType.none.length;
  typeArr = [];
  for (j = 0, len = partArr.length; j < len; j++) {
    part = partArr[j];
    typeArr.push(part.type);
  }
  typeStr = typeArr.join('');
  sbls = symbol.split(';');
  temSbls = [];
  for (k = 0, len1 = sbls.length; k < len1; k++) {
    sbl = sbls[k];
    if (sbl.length === typeLength) {
      temSbls.push(sbl);
    } else {
      s1 = sbl.substring(0, typeLength);
      s2 = sbl.substring(typeLength);
      temSbls.push("(" + s1 + ")" + s2);
    }
  }
  symbolStr = temSbls.join('');
  reg = new RegExp(symbolStr, 'g');
  matchs = typeStr.match(reg);
  matchObj = {};
  if (matchs != null) {
    for (n = 0, len2 = matchs.length; n < len2; n++) {
      m = matchs[n];
      if (m.length === typeLength) {
        continue;
      }
      matchObj[m] = m;
    }
  }
  posArr = [];
  for (m in matchObj) {
    console.log(m);
    lastPos = 0;
    while (true) {
      index = typeStr.indexOf(m, lastPos);
      if (index === -1) {
        break;
      }
      lastPos = index + 1;
      posArr.push({
        start: index / typeLength,
        end: index / typeLength + m.length / typeLength
      });
    }
  }
  posArr.sort(function(l, h) {
    return l.start - h.start;
  });
  endPos = 0;
  temPosArr = [];
  for (i = o = 0, len3 = posArr.length; o < len3; i = ++o) {
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
  for (p = 0, len4 = posArr.length; p < len4; p++) {
    pos = posArr[p];
    combineStr = [];
    firstPart = partArr[pos.start];
    s1 = [];
    for (i = q = ref = pos.start, ref1 = pos.end; ref <= ref1 ? q < ref1 : q > ref1; i = ref <= ref1 ? ++q : --q) {
      s1.push(partArr[i].type);
    }
    console.log(s1.join(' '));
    for (i = r = ref2 = pos.start, ref3 = pos.end; ref2 <= ref3 ? r < ref3 : r > ref3; i = ref2 <= ref3 ? ++r : --r) {
      part = partArr[i];
      raw = part.raw;
      if (part.type === PartType.space) {
        raw = ' ';
      }
      part.type = PartType.none;
      combineStr.push(raw);
    }
    firstPart.raw = combineStr.join('');
    firstPart.type = partType;
  }
  arr = [];
  for (t = 0, len5 = partArr.length; t < len5; t++) {
    part = partArr[t];
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
  var arr, index, j, k, len, len1, matchs, part, reg, s, ss, ssArr, str;
  arr = [];
  index = 0;
  reg = /\n/g;
  for (j = 0, len = partArr.length; j < len; j++) {
    part = partArr[j];
    if (part.type !== PartType.none) {
      arr.push(part);
      continue;
    }
    str = part.raw.replace(/\r\n/g, '\n');
    matchs = str.match(reg);
    if (matchs == null) {
      if (matchs == null) {
        arr.push(part);
      }
      continue;
    }
    ss = str.replace(/(\n)/g, function(num, sub) {
      return "\n-\n" + sub + "\n-\n";
    });
    ssArr = ss.split('\n-\n');
    for (k = 0, len1 = ssArr.length; k < len1; k++) {
      s = ssArr[k];
      if (s.length === 0) {
        continue;
      }
      reg.lastIndex = 0;
      if (reg.test(s)) {
        arr.push(new Part(PartType.wrap, "<br>", null, null, index++));
      } else {
        arr.push(new Part(PartType.none, s, null, null, index++));
      }
    }
  }
  return arr;
};


/*
    分割空格
 */

splitSpace = function(partArr) {
  var arr, index, j, k, len, len1, matchs, part, reg, s, ss, ssArr, str;
  arr = [];
  index = 0;
  reg = / /g;
  for (j = 0, len = partArr.length; j < len; j++) {
    part = partArr[j];
    if (part.type !== PartType.none) {
      arr.push(part);
      continue;
    }
    str = part.raw;
    matchs = str.match(reg);
    if (matchs == null) {
      if (matchs == null) {
        arr.push(part);
      }
      continue;
    }
    ss = str.replace(/( )/g, function(num, sub) {
      return " - " + sub + " - ";
    });
    ssArr = ss.split(' - ');
    for (k = 0, len1 = ssArr.length; k < len1; k++) {
      s = ssArr[k];
      if (s.length === 0) {
        continue;
      }
      reg.lastIndex = 0;
      if (reg.test(s)) {
        arr.push(new Part(PartType.space, "<space>", null, null, index++));
      } else {
        arr.push(new Part(PartType.none, s, null, null, index++));
      }
    }
  }
  return arr;
};


/*
  分割指定字符串
 */

splitStr = function(partArr, str, partType) {
  var arr, index, j, k, len, len1, part, sItem, spArr;
  arr = [];
  index = 0;
  for (j = 0, len = partArr.length; j < len; j++) {
    part = partArr[j];
    if (part.type !== PartType.none) {
      arr.push(part);
      continue;
    }
    spArr = part.raw.split(str);
    for (k = 0, len1 = spArr.length; k < len1; k++) {
      sItem = spArr[k];
      arr.push(new Part(PartType.none, sItem, null, null, index++));
      arr.push(new Part(partType, str, null, null, index++));
    }
  }
  return arr;
};


/*
    分割数字
 */

splitNum = function(partArr) {
  var arr, index, j, k, len, len1, matchs, part, reg, s, ss, ssArr, str;
  arr = [];
  index = 0;
  reg = /\d+/g;
  for (j = 0, len = partArr.length; j < len; j++) {
    part = partArr[j];
    if (part.type !== PartType.none) {
      arr.push(part);
      continue;
    }
    str = part.raw;
    matchs = str.match(reg);
    if (matchs == null) {
      if (matchs == null) {
        arr.push(part);
      }
      continue;
    }
    ss = str.replace(/(\d+)/g, function(num, sub) {
      return "0-0" + sub + "0-0";
    });
    ssArr = ss.split('0-0');
    for (k = 0, len1 = ssArr.length; k < len1; k++) {
      s = ssArr[k];
      if (s.length === 0) {
        continue;
      }
      reg.lastIndex = 0;
      if (reg.test(s)) {
        arr.push(new Part(PartType.sqNum, s, null, null, index++));
      } else {
        arr.push(new Part(PartType.none, s, null, null, index++));
      }
    }
  }
  return arr;
};


/*
    分割序号、关键字、长度大于一的关键字用正则匹配
 */

splitSeq = function(partArr) {
  var arr, j, k, len, len1, len2, len3, len4, matchs, n, o, p, part, reg, s, seq, seqRegStr, seqraw, seqsArr, ss, ssArr, temArr;
  arr = partArr;
  for (j = 0, len = seqArr.length; j < len; j++) {
    seq = seqArr[j];
    temArr = [];
    seqraw = seq.raw;
    if ((seqraw == null) || seqraw.length === 0) {
      continue;
    }
    if (seqraw.length === 1) {
      for (k = 0, len1 = arr.length; k < len1; k++) {
        part = arr[k];
        if (part.type !== PartType.none) {
          temArr.push(part);
          continue;
        }
        reg = new RegExp(seqraw, 'g');
        matchs = part.raw.match(reg);
        if (matchs == null) {
          temArr.push(part);
          continue;
        }
        ss = part.raw.replace(new RegExp("(" + seqraw + ")", 'g'), function(num, sub) {
          return seqraw + "-" + seqraw + sub + seqraw + "-" + seqraw;
        });
        ssArr = ss.split(seqraw + "-" + seqraw);
        for (n = 0, len2 = ssArr.length; n < len2; n++) {
          s = ssArr[n];
          if (s.length < 1) {
            continue;
          }
          reg.lastIndex = 0;
          if (reg.test(s)) {
            temArr.push(new Part(seq.type, s, null, null, 0));
          } else {
            temArr.push(new Part(PartType.none, s, null, null, 0));
          }
        }
      }
    } else {
      for (o = 0, len3 = arr.length; o < len3; o++) {
        part = arr[o];
        if (part.type !== PartType.none) {
          temArr.push(part);
          continue;
        }
        seqsArr = seqraw.split('');
        seqRegStr = seqsArr.join(' {0,10}');
        reg = new RegExp(seqRegStr, 'g');
        matchs = part.raw.match(reg);
        if (matchs == null) {
          temArr.push(part);
          continue;
        }
        ss = part.raw.replace(new RegExp("(" + seqRegStr + ")", 'g'), function(num, sub) {
          return seqraw + "-" + seqraw + sub + seqraw + "-" + seqraw;
        });
        ssArr = ss.split(seqraw + "-" + seqraw);
        for (p = 0, len4 = ssArr.length; p < len4; p++) {
          s = ssArr[p];
          if (s.length < 1) {
            continue;
          }
          reg.lastIndex = 0;
          if (reg.test(s)) {
            temArr.push(new Part(seq.type, s, null, null, 0));
          } else {
            temArr.push(new Part(PartType.none, s, null, null, 0));
          }
        }
      }
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
  var index, j, k, last, len, len1, len2, n, results, s, seqs, sequence;
  seqArr.push(new Sequence(PartType.qOption, "选择题", null, null, index));
  seqArr.push(new Sequence(PartType.qQuestion, "问答题", null, null, index));
  seqArr.push(new Sequence(PartType.qQuestion, "解答题", null, null, index));
  seqArr.push(new Sequence(PartType.qAnswer, "答案", null, null, index));
  seqArr.push(new Sequence(PartType.qAnswer, "证明", null, null, index));
  seqArr.push(new Sequence(PartType.qAnalysis, "解析", null, null, index));
  seqArr.push(new Sequence(PartType.qAnalysis, "解", null, null, index));
  seqArr.push(new Sequence(PartType.qCommen, "点评", null, null, index));
  seqArr.push(new Sequence(PartType.qCommen, "评论", null, null, index));
  seqArr.push(new Sequence(PartType.qDifficulty, "难度", null, null, index));
  seqs = '一二三四五六七八九十';
  last = null;
  for (index = j = 0, len = seqs.length; j < len; index = ++j) {
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
  for (index = k = 0, len1 = seqs.length; k < len1; index = ++k) {
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
  results = [];
  for (index = n = 0, len2 = seqs.length; n < len2; index = ++n) {
    s = seqs[index];
    console.log("s = " + s);
    sequence = new Sequence(PartType.spBrackets, s, last, null, index);
    seqArr.push(sequence);
    if (last != null) {
      last.next = sequence;
    }
    results.push(last = sequence);
  }
  return results;
};

initSeqArr();
