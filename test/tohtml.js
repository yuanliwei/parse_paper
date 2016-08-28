var EleTypeName, PartTypeName, QuestionTypeName, clearDataFromStorage, combineEleParts, combineQuestionElements, eleArr_, html_decode, html_encode, loadDataFromStorage, partArr_, questionArr_, readPaperFromTextarea, updateStats;

partArr_ = null;

eleArr_ = null;

questionArr_ = null;

exports.displayPartArr = function(partArr) {
  var html_, i, j, len, part, results, table;
  partArr_ = partArr;
  if (typeof $ === "undefined" || $ === null) {
    console.dir(partArr);
    console.table(partArr);
    return;
  }
  results = [];
  results.push("<tr><th>no.</th><th>PartType</th><th>raw</th><th>index</th><th>PartTypeName</th></tr>");
  for (i = j = 0, len = partArr.length; j < len; i = ++j) {
    part = partArr[i];
    html_ = "<tr id='part_" + i + "'>\n  <td>" + i + "</td>\n  <td align='center'>" + part.type + "</td>\n  <td><code>\"" + (html_encode(part.raw)) + "\"</code></td>\n  <td>" + part.index + "</td>\n  <td align='center'><small>" + PartTypeName[part.type] + "</small></td>\n</tr>";
    results.push(html_);
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
  var ele, eleIndex, eleName, html_, i, j, len, raw, results, table, type;
  eleArr_ = eleArr;
  if (typeof $ === "undefined" || $ === null) {
    console.dir(eleArr);
    console.table(eleArr);
    return;
  }
  results = [];
  results.push("<tr><th>no.</th><th>ElementType</th><th>raw</th><th>index</th><th>ElementTypeName</th></tr>");
  for (i = j = 0, len = eleArr.length; j < len; i = ++j) {
    ele = eleArr[i];
    type = ele.type;
    raw = html_encode(combineEleParts(ele.parts));
    eleIndex = ele.index;
    eleName = EleTypeName[ele.type];
    html_ = "<tr id='element_" + i + "'>\n   <td>" + i + "</td><td align='center'>" + type + "</td>\n   <td><code>\"" + raw + "\"</code></td>\n   <td>" + eleIndex + "</td>\n   <td align='center'><small>" + eleName + "</small></td>\n</tr>";
    results.push(html_);
  }
  table = document.getElementById('element_table');
  table.innerHTML = results.join('');
  $('tr').each(function(num, tr) {
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
  return $('#element_table tr').each(function(num, tr) {
    return $(tr).click((function(_this) {
      return function(e) {
        var element, first, id, index, k, len1, part, ref, ref1;
        id = (ref = _this.attributes.id) != null ? ref.value : void 0;
        if (id == null) {
          return;
        }
        index = id.substring(id.lastIndexOf('_') + 1);
        element = eleArr_[index];
        first = element.parts[0];
        $(".select").removeClass('select');
        ref1 = element.parts;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          part = ref1[k];
          $("#part_" + part.index).addClass('select');
        }
        return $('html, body').animate({
          scrollTop: $("#part_" + first.index).offset().top - 100
        }, 500);
      };
    })(this));
  });
};

exports.displayQuestionArr = function(questionArr) {
  var html_, i, j, len, question, questionIndex, questionName, raw, results, table, type;
  questionArr_ = questionArr;
  if (typeof $ === "undefined" || $ === null) {
    console.dir(questionArr);
    console.table(questionArr);
    return;
  }
  results = [];
  results.push("<tr><th>no.</th><th>QuestiongType</th><th>raw</th><th>index</th><th>QuestionTypeName</th></tr>");
  for (i = j = 0, len = questionArr.length; j < len; i = ++j) {
    question = questionArr[i];
    type = question.type;
    raw = combineQuestionElements(question);
    questionIndex = question.index;
    questionName = QuestionTypeName[question.type];
    html_ = "<tr id='question_" + i + "'>\n   <td>" + i + "</td><td align='center'>" + type + "</td>\n   <td><code>\"" + raw + "\"</code></td>\n   <td>" + questionIndex + "</td>\n   <td align='center'><small>" + questionName + "</small></td>\n</tr>";
    results.push(html_);
  }
  table = document.getElementById('question_table');
  table.innerHTML = results.join('');
  $('tr').each(function(num, tr) {
    return $(tr).mousemove((function(_this) {
      return function(e) {
        if (e.ctrlKey) {
          $(tr).addClass('select');
        }
        if (e.altKey) {
          return $(tr).removeClass('select');
        }
      };
    })(this));
  });
  return $('#question_table tr').each(function(num, tr) {
    return $(tr).click((function(_this) {
      return function(e) {
        var ele, first, id, index, k, len1, ref, ref1;
        id = (ref = _this.attributes.id) != null ? ref.value : void 0;
        if (id == null) {
          return;
        }
        index = id.substring(id.lastIndexOf('_') + 1);
        question = questionArr_[index];
        first = question.elements[0];
        $(".select").removeClass('select');
        ref1 = question.elements;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          ele = ref1[k];
          $("#element_" + ele.index).addClass('select');
        }
        return $('html, body').animate({
          scrollTop: $("#element_" + first.index).offset().top - 100
        }, 500);
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
  '1011': '题型    ',
  '1020': '题干    ',
  '1030': '选项    ',
  '1031': '选项号  ',
  '1040': '答案    ',
  '1050': '解析    ',
  '1060': '点评    ',
  '1070': '难度    '
};

QuestionTypeName = {
  '1000': '没有类型',
  '1010': '单选题  ',
  '1020': '问答题  '
};

combineQuestionElements = function(question) {
  var j, len, option, ref, ref1, results;
  results = [];
  if (question.qNo != null) {
    results.push("【题号】 " + (combineEleParts(question.qNo.parts)) + " ");
  }
  results.push("【题干】 " + (html_encode(combineEleParts(question.qText.parts))) + "<br>");
  if (question.qOptions.length > 0) {
    ref = question.qOptions;
    for (j = 0, len = ref.length; j < len; j++) {
      option = ref[j];
      results.push("&nbsp;&nbsp;&nbsp;&nbsp;选项 " + (combineEleParts(option.no.parts)) + " " + (html_encode(combineEleParts((ref1 = option.text) != null ? ref1.parts : void 0))) + "<br>");
    }
  }
  if (question.qAnswer != null) {
    results.push("【答案】 " + (html_encode(combineEleParts(question.qAnswer.parts))) + "<br>");
  }
  if (question.qAnalysis != null) {
    results.push("【解析】 " + (html_encode(combineEleParts(question.qAnalysis.parts))) + "<br>");
  }
  if (question.qCommen != null) {
    results.push("【点评】 " + (html_encode(combineEleParts(question.qCommen.parts))) + "<br>");
  }
  if (question.qDifficulty != null) {
    results.push("【难度】 " + (html_encode(combineEleParts(question.qDifficulty.parts))) + "<br>");
  }
  return results.join('');
};

combineEleParts = function(partArr) {
  var j, len, part, results;
  if (partArr == null) {
    return '';
  }
  results = [];
  for (j = 0, len = partArr.length; j < len; j++) {
    part = partArr[j];
    results.push(part.raw);
  }
  return results.join('').replace('<space>', ' ');
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

readPaperFromTextarea = function() {
  var paperText, textarea;
  textarea = $('#text_input')[0];
  paperText = textarea.value;
  localStorage.savePaperData = paperText;
  return split.run(paperText);
};

loadDataFromStorage = function() {
  var paperText, textarea;
  textarea = $('#text_input')[0];
  textarea.value = localStorage.savePaperData;
  paperText = textarea.value;
  return split.run(paperText);
};

clearDataFromStorage = function() {
  var paperText, textarea;
  textarea = $('#text_input')[0];
  textarea.value = localStorage.savePaperData = '';
  paperText = fs.readFileSync();
  return split.run(paperText);
};
