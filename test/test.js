var splitKeyCharWithPrefix, test;

test = function() {
  var nl, num, rs, s, sl;
  console.log("print test");
  s = "daasdfgdhjkl";
  s = "000000000";
  num = 8.9;
  sl = s.length;
  nl = num.toString().length;
  console.log("sl:" + sl + " nl : " + nl);
  rs = s.substring(0, sl - nl) + num;
  console.log(rs);
  console.log("result : " + (parseFloat(rs)));
  console.log(num.toString());
  console.log(s);
  return splitKeyChar(prefix, char, partArr);
};


/*
    以带有指定前缀的字符分割字符串
 */

splitKeyCharWithPrefix = function(prefix, keyChar, partArr) {
  var arr, i, j, len, part, raw, reg, repRaw, spArr;
  arr = [];
  reg = new RegExp(prefix + "(keyChar)");
  for (i = j = 0, len = partArr.length; j < len; i = ++j) {
    part = partArr[i];
    raw = part.raw;
    repRaw = raw.replace(reg, (function(_this) {
      return function(mainStr, sub, index) {
        return "" + prefix + sub + "-" + sub + sub + sub + "-" + sub;
      };
    })(this));
    spArr = repRaw.split(keyChar + "-" + keyChar);
  }
  return arr;
};

test();
