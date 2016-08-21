fs = require 'fs'

class Part
  constructor: (@type, @raw, @last, @next, @index) ->

class Sequence
  constructor: (@type, @raw, @last, @next, @index) ->

  split: (part, arr) ->
    if part.raw.indexOf(@raw) < 0
      arr.push part
      return

    strs = part.raw.split(@raw)
    for item, i in strs
      arr.push new Part(PartType.none, item, null, null, 0) if item.length > 0
      arr.push new Part(@type, @raw, null, null, 0) if i != strs.length - 1
    arr




PartType = {
  none: 0  # 没有类型
  wrap: 1  # 换行符类型
  text: 2  # 普通文本类型
  sqNum : 3     # 数字类型的序号，题号 1. 2. 3. 4. 5. 6. ...
  sqText : 4    # 文字类型的序号， 大题号 一、 二、 三、 四、 ......
  sqOption : 5  # 选项序号， A, B, C, D, E, ...
  qOption      : 6      # 单选题
  qQuestion    : 7      # 问答题
  qAnswer      : 8      # 答案
  qAnalysis    : 9      # 解析
  qCommen      : 10     # 点评
  qDifficulty  : 11     # 难度
}

exports.run = (paperText) ->
  console.log 'run into run function'
  print()

  partArr = []

  rootPart = new Part(PartType.none, paperText, null, null, 0)
  partArr.push rootPart

# 分割换行符
  partArr = splitWrap partArr
# 分割题号
  partArr = splitSeq partArr
# 分割选项
  # partArr = splitOption partArr
# 整理Part序号
  partArr = countIndex partArr

  # console.dir partArr

  fs.writeFileSync('splitResult.txt', '\n')

  for part in partArr
    # console.dir " #{part.raw}"
    fs.appendFileSync('splitResult.txt', part.raw)
  return

print = ->
  console.log 'call print function'

###
    分割换行
###
splitWrap = (partArr) ->
  arr = []
  index = 0
  for part in partArr
    if part.type != PartType.none
      arr.push part
      continue
    spArr = part.raw.replace(/\r\n/g,'\n').split('\n')
    for sItem in spArr
      arr.push new Part(PartType.none, sItem, null, null, index++ )
      arr.push new Part(PartType.wrap, "<br>", null, null, index++ )
  arr

###
    分割序号、关键字
###
splitSeq = (partArr) ->
  arr = partArr
  for seq in seqArr
    temArr = []
    for part in arr
      if part.type != PartType.none
        temArr.push part
        continue
      seq.split(part, temArr)
    arr = temArr
  arr

###
    计算Part索引
###
countIndex = (partArr) ->
  last = null
  for part, i in partArr
    part.index = i
    last.next = part if last?
    part.last = last
    last = part
  partArr

# 序号
seqArr = []
# 初始化序号
initSeqArr = ->
  seqs = '123456789'
  last = null
  for s, index in seqs
    console.log "s = #{s}"
    sequence = new Sequence(PartType.sqNum, s, last, null, index)
    seqArr.push sequence
    last.next = sequence if last?
    last = sequence
  seqs = '一二三四五六七八九十'
  last = null
  for s, index in seqs
    console.log "s = #{s}"
    sequence = new Sequence(PartType.sqText, s, last, null, index)
    seqArr.push sequence
    last.next = sequence if last?
    last = sequence
  seqs = 'ABCDEFGHI'
  last = null
  for s, index in seqs
    console.log "s = #{s}"
    sequence = new Sequence(PartType.sqOption, s, last, null, index)
    seqArr.push sequence
    last.next = sequence if last?
    last = sequence

  seqArr.push new Sequence(PartType.qOption, "选择题", null, null, index)
  seqArr.push new Sequence(PartType.qQuestion, "问答题", null, null, index)
  seqArr.push new Sequence(PartType.qAnswer, "答案", null, null, index)
  seqArr.push new Sequence(PartType.qAnalysis, "解析", null, null, index)
  seqArr.push new Sequence(PartType.qCommen, "点评", null, null, index)
  seqArr.push new Sequence(PartType.qDifficulty, "难度", null, null, index)


initSeqArr()
# console.dir seqArr
