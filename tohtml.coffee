exports.displayPartArr = (partArr) ->
  if(!$?)
    console.dir partArr
    console.table partArr
    return
  results = []
  results.push "<tr><th>no.</th><th>PartType</th><th>raw</th><th>index</th><th>PartTypeName</th></tr>"
  for part, i in partArr
    html_ = """<tr>
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
  if(!$?)
    console.dir eleArr
    console.table eleArr
    return
  results = []
  results.push "<tr><th>no.</th><th>ElementType</th><th>raw</th><th>index</th><th>PartTypeName</th></tr>"
  for ele, i in eleArr
    type = ele.type
    raw = html_encode combineEleParts(ele.parts)
    eleIndex = ele.index
    eleName = EleTypeName[ele.type]
    html_ = """<tr>
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

combineEleParts = (partArr) ->
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
