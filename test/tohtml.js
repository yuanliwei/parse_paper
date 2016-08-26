var EleTypeName, PartTypeName, html_decode, html_encode, updateStats;

exports.displayPartArr = function(partArr) {
  var i, j, len, part, results, table;
  if (typeof $ === "undefined" || $ === null) {
    console.dir(partArr);
    console.table(partArr);
    return;
  }
  results = [];
  results.push("<tr><th>no.</th><th>PartType</th><th>raw</th><th>index</th><th>PartTypeName</th></tr>");
  for (i = j = 0, len = partArr.length; j < len; i = ++j) {
    part = partArr[i];
    results.push("<tr><td>" + i + "</td><td align='center'>" + part.type + "</td><td><code>\"" + (html_encode(part.raw)) + "\"</code></td><td>" + part.index + "</td><td align='center'><small>" + PartTypeName[part.type] + "</small></td></tr>");
  }
  table = document.getElementById('part_table');
  table.innerHTML = results.join('');
  return $('tr').each(function(num, tr) {
    return $(tr).mousemove((function(_this) {
      return function(e) {
        if (e.ctrlKey) {
          $(tr).addClass('select');
        }
        if (e.altKey) {
          $(tr).removeClass('select');
        }
        if (e.ctrlKey || e.altKey) {
          return updateStats();
        }
      };
    })(this));
  });
};

exports.displayElementArr = function(eleArr) {
  var i, j, len, part, results, table;
  if (typeof $ === "undefined" || $ === null) {
    console.dir(eleArr);
    console.table(eleArr);
    return;
  }
  results = [];
  results.push("<tr><th>no.</th><th>PartType</th><th>raw</th><th>index</th><th>PartTypeName</th></tr>");
  for (i = j = 0, len = partArr.length; j < len; i = ++j) {
    part = partArr[i];
    results.push("<tr><td>" + i + "</td><td align='center'>" + part.type + "</td><td><code>\"" + (html_encode(part.raw)) + "\"</code></td><td>" + part.index + "</td><td align='center'><small>" + PartTypeName[part.type] + "</small></td></tr>");
  }
  table = document.getElementById('part_table');
  table.innerHTML = results.join('');
  return $('tr').each(function(num, tr) {
    return $(tr).mousemove((function(_this) {
      return function(e) {
        if (e.ctrlKey) {
          $(tr).addClass('select');
        }
        if (e.altKey) {
          $(tr).removeClass('select');
        }
        if (e.ctrlKey || e.altKey) {
          return updateStats();
        }
      };
    })(this));
  });
};

updateStats = function() {
  var lastIndex, results;
  results = [];
  lastIndex = 0;
  $('tr.select').each(function(num, tr) {
    var partIndex, partType, tds;
    tds = $(tr).find('td');
    partType = $(tds[1]).html();
    partIndex = parseInt($(tds[3]).html());
    if (num !== 0 && partIndex - lastIndex !== 1) {
      results.push("<br/>");
    }
    lastIndex = partIndex;
    return results.push(partType + ",");
  });
  return $('#stats').html("" + (results.join('')));
};

PartTypeName = {
  '1000': '没有类型',
  '1010': '换行符',
  '1011': '空格',
  '1020': '普通文本',
  '1030': '小题号',
  '1040': '大题号',
  '1050': '序号',
  '1051': '括号 【， 】',
  '1060': '单选题 ',
  '1070': '问答题',
  '1080': '答案',
  '1090': '解析',
  '1100': '点评',
  '1110': '难度'
};

EleTypeName = {
  '1000': '没有类型',
  '1010': '题号    ',
  '1020': '题干    ',
  '1030': '选项    ',
  '1031': '选项号  ',
  '1040': '答案    ',
  '1050': '解析    ',
  '1060': '点评    ',
  '1070': '难度    '
};

html_encode = function(str) {
  var s;
  s = "";
  if (str.length === 0) {
    return "";
  }
  s = str.replace(/&/g, "&gt;");
  s = s.replace(/</g, "&lt;");
  s = s.replace(/>/g, "&gt;");
  s = s.replace(/ /g, "&nbsp;");
  s = s.replace(/\'/g, "&#39;");
  s = s.replace(/\"/g, "&quot;");
  s = s.replace(/\n/g, "<br>");
  return s;
};

html_decode = function(str) {
  var s;
  s = "";
  if (str.length === 0) {
    return "";
  }
  s = str.replace(/&gt;/g, "&");
  s = s.replace(/&lt;/g, "<");
  s = s.replace(/&gt;/g, ">");
  s = s.replace(/&nbsp;/g, " ");
  s = s.replace(/&#39;/g, "\'");
  s = s.replace(/&quot;/g, "\"");
  s = s.replace(/<br>/g, "\n");
  return s;
};
