require = (name) ->
  if("fs" == name)
    return fs
    
fs = ->
fs.readFileSync = ->
  return paperData
fs.writeFileSync = (path, data) ->
  output = document.getElementById('output')
  output.value = data

fs.appendFileSync = (path, data) ->
  output = document.getElementById('output')
  output.append = data

start = ->

paperData = """
数学试题分析报告
1、 选择题
1 ．设扇形圆心角为 公式:rId7 ，面积为 公式:rId9 ，将它围成一个圆锥，则此圆锥的表面积是（ ）
A． 公式:rId11 B． 公式:rId13 C． 公式:rId15 D． 公式:rId17
【答案】 B
【解析】 设扇形的半径为 R ，由题意得
公式:rId19 ，扇形弧长为 公式:rId21 ，故圆锥的底面半径为1，圆锥的表面积是 公式:rId23 ．
【点评】 在天学网校自主招生强手营第一阶段的讲义中，我们讲解了弧度制和角度制的关系与由来，此题求出扇形弧长并由此给出圆锥底面圆的半径即可。
【难度】 较低
2． 将10个人分成3组，每组人数分别为3，3，4，则不同的方法（ ）种．
A． 公式:rId25 B． 公式:rId27 C． 公式:rId29 D． 公式:rId31
【答案】 C
【解析】 首先任取3人有 公式:rId33 种取法，剩下的在7人里面取3人有 公式:rId35 种取法，最后剩下4人，但由于先取的3人和之后取的3人（人数相同）不存在先取和后取的排列，因此总的分法数为 公式:rId37 ．
【点评】 在天学网校强手营第一阶段讲义中，我们讲授映射法解排列组合题目时给大家特别补充提到的一个“分堆分组问题”，这道题目是典型的“分堆”。
【难度】 中等

"""