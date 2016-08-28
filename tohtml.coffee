partArr_ = null
eleArr_ = null
questionArr_ = null
exports.displayPartArr = (partArr) ->
  partArr_ = partArr
  if(!$?)
    console.dir partArr
    console.table partArr
    return
  results = []
  results.push "<tr><th>no.</th><th>PartType</th><th>raw</th><th>index</th><th>PartTypeName</th></tr>"
  for part, i in partArr
    html_ = """<tr id='part_#{i}'>
                <td>#{i}</td>
                <td align='center'>#{part.type}</td>
                <td><code>"#{html_encode part.raw}"</code></td>
                <td>#{part.index}</td>
                <td align='center'><small>#{PartTypeName[part.type]}</small></td>
              </tr>
    """
    results.push html_
  table = document.getElementById('part_table')
  table.innerHTML = results.join('')
  $('tr').each (num, tr) ->
    $(tr).mousemove (e) =>
      $(tr).addClass('select') if e.ctrlKey
      $(tr).removeClass('select') if e.altKey
      updateStats() if e.ctrlKey || e.altKey

exports.displayElementArr = (eleArr) ->
  eleArr_ = eleArr
  if(!$?)
    console.dir eleArr
    console.table eleArr
    return
  results = []
  results.push "<tr><th>no.</th><th>ElementType</th><th>raw</th><th>index</th><th>ElementTypeName</th></tr>"
  for ele, i in eleArr
    type = ele.type
    raw = html_encode combineEleParts(ele.parts)
    eleIndex = ele.index
    eleName = EleTypeName[ele.type]
    html_ = """<tr id='element_#{i}'>
                 <td>#{i}</td><td align='center'>#{type}</td>
                 <td><code>"#{raw}"</code></td>
                 <td>#{eleIndex}</td>
                 <td align='center'><small>#{eleName}</small></td>
              </tr>"""
    results.push html_
  table = document.getElementById('element_table')
  table.innerHTML = results.join('')
  $('tr').each (num, tr) ->
    $(tr).mousemove (e) =>
      $(tr).addClass('select') if e.ctrlKey
      $(tr).removeClass('select') if e.altKey
      updateStats() if e.ctrlKey || e.altKey

  # 添加点击事件
  $('#element_table tr').each (num, tr) ->
    $(tr).click (e) =>
      id = @attributes.id?.value
      return if !id?
      index = id.substring(id.lastIndexOf('_') + 1)

      element = eleArr_[index]
      first = element.parts[0]

      $(".select").removeClass('select')
      for part in element.parts
        $("#part_#{part.index}").addClass('select')

      $('html, body').animate({
          scrollTop: $("#part_#{first.index}").offset().top - 100
          }, 500)

exports.displayQuestionArr = (questionArr) ->
  questionArr_ = questionArr
  if(!$?)
    console.dir questionArr
    console.table questionArr
    return
  results = []
  results.push "<tr><th>no.</th><th>QuestiongType</th><th>raw</th><th>index</th><th>QuestionTypeName</th></tr>"
  for question, i in questionArr
    type = question.type
    raw = combineQuestionElements(question)
    questionIndex = question.index
    questionName = QuestionTypeName[question.type]
    html_ = """<tr id='question_#{i}'>
                 <td>#{i}</td><td align='center'>#{type}</td>
                 <td><code>"#{raw}"</code></td>
                 <td>#{questionIndex}</td>
                 <td align='center'><small>#{questionName}</small></td>
              </tr>"""
    results.push html_
  table = document.getElementById('question_table')
  table.innerHTML = results.join('')
  $('tr').each (num, tr) ->
    $(tr).mousemove (e) =>
      $(tr).addClass('select') if e.ctrlKey
      $(tr).removeClass('select') if e.altKey
      # updateStats() if e.ctrlKey || e.altKey
  $('#question_table tr').each (num, tr) ->
    $(tr).click (e) =>
      # console.error "stop here!"
      id = @attributes.id?.value
      return if !id?
      index = id.substring(id.lastIndexOf('_') + 1)

      question = questionArr_[index]
      first = question.elements[0]

      $(".select").removeClass('select')
      for ele in question.elements
        $("#element_#{ele.index}").addClass('select')

      $('html, body').animate({
          scrollTop: $("#element_#{first.index}").offset().top - 100
          }, 500)


updateStats = ->
  results = []
  lastIndex = 0
  $('tr.select').each (num, tr) ->
    tds = $(tr).find('td')
    partType = $(tds[1]).html()
    partIndex = parseInt $(tds[3]).html()
    results.push "<br/>" if num !=0 && partIndex - lastIndex !=1
    lastIndex = partIndex
    results.push "#{partType},"
  $('#stats').html("#{results.join('')}")

PartTypeName = {
    '1000'  :  '没有类型'
    '1010'  :  '换行符'
    '1011'  :  '空格'
    '1020'  :  '普通文本'
    '1030'  :  '小题号'
    '1040'  :  '大题号'
    '1050'  :  '序号'
    '1051'  :  '括号 【， 】'

    '1060'  :  '单选题 '
    '1070'  :  '问答题'
    '1080'  :  '答案'
    '1090'  :  '解析'
    '1100'  :  '点评'
    '1110'  :  '难度'
  }

EleTypeName = {
  '1000' : '没有类型'
  '1010' : '题号    '
  '1011' : '题型    '
  '1020' : '题干    '
  '1030' : '选项    '
  '1031' : '选项号  '
  '1040' : '答案    '
  '1050' : '解析    '
  '1060' : '点评    '
  '1070' : '难度    '
  }

QuestionTypeName = {
  '1000' : '没有类型'
  '1010' : '单选题  '
  '1020' : '问答题  '
  }

combineQuestionElements = (question) ->
  results = []

  results.push "【题号】 #{combineEleParts question.qNo.parts} " if question.qNo?
  results.push "【题干】 #{html_encode combineEleParts(question.qText.parts)}<br>"
  if question.qOptions.length > 0
    for option in question.qOptions
      results.push "&nbsp;&nbsp;&nbsp;&nbsp;选项 #{combineEleParts option.no.parts} #{html_encode combineEleParts option.text?.parts}<br>"
  results.push "【答案】 #{html_encode combineEleParts(question.qAnswer.parts)}<br>" if question.qAnswer?
  results.push "【解析】 #{html_encode combineEleParts(question.qAnalysis.parts)}<br>" if question.qAnalysis?
  results.push "【点评】 #{html_encode combineEleParts(question.qCommen.parts)}<br>" if question.qCommen?
  results.push "【难度】 #{html_encode combineEleParts(question.qDifficulty.parts)}<br>" if question.qDifficulty?
  results.join('')

combineEleParts = (partArr) ->
  return '' if !partArr?
  results = []
  for part in partArr
    results.push part.raw
  results.join('').replace('<space>',' ')

html_encode = (str) ->
  s = "";
  return "" if(str.length == 0)
  s = str.replace(/&/g, "&gt;");
  s = s.replace(/</g, "&lt;");
  s = s.replace(/>/g, "&gt;");
  s = s.replace(/ /g, "&nbsp;");
  s = s.replace(/\'/g, "&#39;");
  s = s.replace(/\"/g, "&quot;");
  s = s.replace(/\n/g, "<br>");
  return s;

html_decode = (str) ->
  s = "";
  return "" if(str.length == 0)
  s = str.replace(/&gt;/g, "&");
  s = s.replace(/&lt;/g, "<");
  s = s.replace(/&gt;/g, ">");
  s = s.replace(/&nbsp;/g, " ");
  s = s.replace(/&#39;/g, "\'");
  s = s.replace(/&quot;/g, "\"");
  s = s.replace(/<br>/g, "\n");
  return s;

readPaperFromTextarea = ->
  textarea = $('#text_input')[0]
  paperText = textarea.value
  localStorage.savePaperData = paperText
  split.run(paperText)

loadDataFromStorage = ->
  textarea = $('#text_input')[0]
  textarea.value = localStorage.savePaperData
  paperText = textarea.value
  split.run(paperText)

clearDataFromStorage = ->
  textarea = $('#text_input')[0]
  textarea.value = localStorage.savePaperData = ''
  paperText = fs.readFileSync()
  split.run(paperText)

mergeSelectItem = ->
  trs = $('.select')
  console.dir trs
  return if trs?.length < 2
  ids = []
  for tr in trs
    id = tr.attributes.id.value
    continue if !id.startsWith('part') # 目前只支持Part分割
    index = parseInt id.substring(id.lastIndexOf('_') + 1)
    ids.push index
  return if ids?.length < 2
  last = 0
  for id, i in ids
    if i == 0
      last = id
    else
      if last + 1 != id
        alert('合并项需要连续！')
        return
      last = id
  parts = partArr_
  first = null
  combineStr = []
  for id, i in ids
    raw = parts[id].raw
    raw = ' ' if parts[id].type == PartType.space
    parts[id].type = PartType.none if i!= 0
    combineStr.push raw
  parts[ids[0]].raw = combineStr.join('')
  parts[ids[0]].type = PartType.text

  partArr = parts
  arr = []
  for part in partArr
    arr.push(part) if part.type != PartType.none
  arr = countIndex(arr)

  # 重新运行合并完后的代码
  partArr = arr
  console.table partArr
  tohtml.displayPartArr partArr
  # 试卷的基本元素
  eleArr = []
  # 查找试卷的基本元素
  eleArr = parsePartArr partArr
  countElementIndex eleArr
  # console.table eleArr
  tohtml.displayElementArr eleArr

  # 试卷中的题
  questionArr = []
  questionArr = parseQuestionArr eleArr
  countQuestionIndex questionArr
  console.table questionArr
  tohtml.displayQuestionArr questionArr


splitSelectItem = ->
  trs = $('.select')
  console.dir trs
  return if trs?.length < 1
  if trs.length > 1
    alert('只能选择一项分割！')
    return
  id = trs[0].attributes.id.value
  return if !id.startsWith('part') # 目前只支持Part分割
  index = parseInt id.substring(id.lastIndexOf('_') + 1)

  parts = partArr_
  part = parts[index]
  part.type = PartType.none
  part.raw = part.raw.replace(/<br>/g, '\n')
  partArr = []
  partArr.push part
  partArr = splitPart partArr

  temArr = []
  for part, i in parts
    if( i == index)
      for p in partArr
        temArr.push p
    else
      temArr.push part
  partArr = temArr

  partArr = countIndex(partArr)

  # 重新运行分割完后的代码
  console.table partArr
  tohtml.displayPartArr partArr
# 试卷的基本元素
  eleArr = []
# 查找试卷的基本元素
  eleArr = parsePartArr partArr
  countElementIndex eleArr
  # console.table eleArr
  tohtml.displayElementArr eleArr

  # 试卷中的题
  questionArr = []
  questionArr = parseQuestionArr eleArr
  countQuestionIndex questionArr
  console.table questionArr
  tohtml.displayQuestionArr questionArr
