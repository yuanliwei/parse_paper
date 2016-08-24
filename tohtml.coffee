exports.displayPartArr = (partArr) ->
  if(!$?)
    console.dir partArr
    console.table partArr
    return
  results = []
  results.push "<tr><th>no.</th><th>PartType</th><th>raw</th><th>index</th></tr>"
  for part, i in partArr
    results.push "<tr><td>#{i}</td><td align='center'>#{part.type}</td><td><code>\"#{html_encode part.raw}\"</code></td><td>#{part.index}</td></tr>"
  table = document.getElementById('part_table')
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
