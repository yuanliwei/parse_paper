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
  none         : 0      # 没有类型
  wrap         : 1      # 换行符类型
  text         : 2      # 普通文本类型
  sqNum        : 3      # 数字类型的序号，题号 1. 2. 3. 4. 5. 6. ...
  sqText       : 4      # 文字类型的序号， 大题号 一、 二、 三、 四、 ......
  sqOption     : 5      # 选项序号， A, B, C, D, E, ...
  spBrackets   : 5.1    # 括号 【， 】

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
# 合并多余的Part
  partArr = mergePart partArr
  # console.dir partArr
  console.table partArr

  # fs.writeFileSync('splitResult.txt', '\n')

  # for part in partArr
  #   # console.dir " #{part.raw}"
  #   fs.appendFileSync('splitResult.txt', part.raw)
  return

print = ->
  console.log 'call print function'

###
    合并多余的Part
###
mergePart = (partArr) ->
  arr = []
  # 合并序号
  partArr = mergeSeq partArr
  arr = partArr
  arr

###
    合并序号
###
mergeSeq = (partArr) ->
  # 图片rId1
  partArr = mergeSeqBySymbol(partArr, '2,5,2,3,2,', PartType.text)
  # 图片rId11
  partArr = mergeSeqBySymbol(partArr, '2,5,2,3,3,', PartType.text)
  # 【答案】
  partArr = mergeSeqBySymbol(partArr, '5.1,8,5.1,', PartType.qAnswer)
  # 【解析】
  partArr = mergeSeqBySymbol(partArr, '5.1,9,5.1,', PartType.qAnalysis)
  # 【点评】
  partArr = mergeSeqBySymbol(partArr, '5.1,10,5.1,', PartType.qCommen)
  # 【难度】
  partArr = mergeSeqBySymbol(partArr, '5.1,11,5.1,', PartType.qDifficulty)
  # 合并纯文本
  partArr = mergeSeqBySymbol(partArr, '2,2,', PartType.text)
  # 合并夹在文本中间的数字  "将","1","0个人分"
  partArr = mergeSeqBySymbol(partArr, '2,3,2,', PartType.text)
  # 合并夹在文本之间的中文数字 "招生强手营第","一","阶段的讲义中，
  partArr = mergeSeqBySymbol(partArr, '2,4,2,', PartType.text)
  partArr


###
    根据符号模型和partType合并多余序号
###
mergeSeqBySymbol = (partArr, symbol, partType) ->
  # symbol = '25233' # 图片rId11
  typeArr = []
  indexMap = {}
  index = 0
  for part in partArr
    typeArr.push part.type
    indexMap[index] = part.index
    index += part.type.toString().length
  typeStr = typeArr.join(',')

# 这里改成先计算位置再合并的方式
  posArr = []
  loopIndex = 0
  temTypeArr = []
  symbolLength = symbol.split(',').length - 1
  throw new Error("symbol : #{symbol} 格式错误，应以“,”结尾！") if !symbol.endsWith(',')
  console.log "symbol length : #{symbolLength}"
  for part, i in partArr
    temTypeArr.push "#{part.type},"
    temTypeArr.shift() if temTypeArr.length > symbolLength
    if temTypeArr.join('') == symbol
      # start <= pos < end
      posArr.push {start : i - symbolLength + 1, end : i + 1 }

  # 检查posArr是否有重叠
  endPos = 0
  temPosArr = []
  for pos, i in posArr
    if pos.start < endPos
      lastPos = temPosArr.pop()
      lastPos.end = endPos = pos.end
      temPosArr.push lastPos
    else
      endPos = pos.end
      temPosArr.push pos
  posArr = temPosArr

  # 合并同一类型的Part
  for pos in posArr
    combineStr = []
    firstPart = partArr[pos.start]
    for i in [pos.start...pos.end]
      part = partArr[i]
      part.type = PartType.none
      combineStr.push part.raw
    firstPart.raw = combineStr.join('')
    firstPart.type = partType

  arr = []
  for part in partArr
    arr.push(part) if part.type != PartType.none
  arr = countIndex(arr)

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
    part.type = PartType.text if part.type == PartType.none
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
  seqs = '【】'
  last = null
  for s, index in seqs
    console.log "s = #{s}"
    sequence = new Sequence(PartType.spBrackets, s, last, null, index)
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
