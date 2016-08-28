fs = require 'fs'
tohtml = require './tohtml'

class Part
  constructor: (@type, @raw, @last, @next, @index) ->

class Sequence
  constructor: (@type, @raw, @last, @next, @index) ->

# 试卷元素 （题号，题目，选项，答案，解析，点评，难度）
class Element
  constructor: (@type, @parts, @start, @end, @last, @next, @index) ->
    @parts = [] if ! @parts?

# 试题元素
class Question
  constructor: (@type, @elements, @start, @end, @last, @next, @index) ->
    @elements = [] if ! @elements?
    @qOptions = []
    temObj = {}
    for e in @elements
      temObj[e.type] = e
      if e.type == EleType.qOptionNo && e.next?.type == EleType.qOption
        @qOptions.push {'no': e, 'text': e.next}
    @qNo         = temObj[EleType.qNo        ]
    @qType       = temObj[EleType.qType      ]
    @qText       = temObj[EleType.qText      ]
    @qAnswer     = temObj[EleType.qAnswer    ]
    @qAnalysis   = temObj[EleType.qAnalysis  ]
    @qCommen     = temObj[EleType.qCommen    ]
    @qDifficulty = temObj[EleType.qDifficulty]

PartType = {
  none         : '1000'    # 没有类型
  wrap         : '1010'    # 换行符类型
  space        : '1011'    # 空格符类型
  text         : '1020'    # 普通文本类型
  sqNum        : '1030'    # 数字类型的序号，题号 1. 2. 3. 4. 5. 6. ...
  sqText       : '1040'    # 文字类型的序号， 大题号 一、 二、 三、 四、 ......
  sqOption     : '1050'    # 选项序号， A, B, C, D, E, ...
  spBrackets   : '1051'    # 括号 【， 】

  qOption      : '1060'      # 单选题
  qQuestion    : '1070'      # 问答题
  qAnswer      : '1080'      # 答案
  qAnalysis    : '1090'      # 解析
  qCommen      : '1100'     # 点评
  qDifficulty  : '1110'     # 难度
  }

EleType = {
  none            : '1000'  # 没有类型
  qNo             : '1010'  # 题号
  qType           : '1011'  # 题型
  qText           : '1020'  # 题干
  qOption         : '1030'  # 选项
  qOptionNo       : '1031'  # 选项号
  qAnswer         : '1040'  # 答案
  qAnalysis       : '1050'  # 解析
  qCommen         : '1060'  # 点评
  qDifficulty     : '1070'  # 难度
  }

QuestionType = {
  none            : '1000'  # 没有类型
  single          : '1010'  # 单选题
  question        : '1020'  # 问答题
  }

exports.run = (paperText) ->
  console.log 'run into run function'
  time = Date.now()
  print()
  partArr = []
  rootPart = new Part(PartType.none, paperText, null, null, 0)
  partArr.push rootPart

# 分割Part
  partArr = splitPart partArr

# 合并多余的Part
  partArr = mergePart partArr
  console.table partArr
  tohtml.displayPartArr partArr
# 试卷的基本元素
  eleArr = []
# 查找试卷的基本元素
  eleArr = parsePartArr partArr
  countElementIndex eleArr
  # console.table eleArr
  console.log "=============  over time #{Date.now() - time}"
  tohtml.displayElementArr eleArr

  # 试卷中的题
  questionArr = []
  questionArr = parseQuestionArr eleArr
  countQuestionIndex questionArr
  console.table questionArr
  tohtml.displayQuestionArr questionArr

  # fs.writeFileSync('splitResult.txt', '\n')

  # for part in partArr
  #   # console.dir " #{part.raw}"
  #   fs.appendFileSync('splitResult.txt', part.raw)
  return

print = ->
  console.log 'call print function'

###
    分割Part
###
splitPart = (partArr) ->
  # 分割单词、文本
  partArr = splitWord partArr

  # 分割序号、关键字、词
  # 分割关键词
  seqArr = []
  seqArr.push new Sequence(PartType.qOption, "选择题", null, null, 0)
  seqArr.push new Sequence(PartType.qQuestion, "问答题", null, null, 0)
  seqArr.push new Sequence(PartType.qQuestion, "解答题", null, null, 0)
  seqArr.push new Sequence(PartType.qAnswer, "答案", null, null, 0)
  seqArr.push new Sequence(PartType.qAnswer, "证明", null, null, 0)
  seqArr.push new Sequence(PartType.qAnalysis, "解析", null, null, 0)
  seqArr.push new Sequence(PartType.qAnalysis, "解", null, null, 0)
  seqArr.push new Sequence(PartType.qCommen, "点评", null, null, 0)
  seqArr.push new Sequence(PartType.qCommen, "评论", null, null, 0)
  seqArr.push new Sequence(PartType.qDifficulty, "难度", null, null, 0)
  partArr = splitKeyWord seqArr, partArr

  seqArr = []
  seqArr.push new Sequence(PartType.spBrackets, '【', null, null, 0)
  seqArr.push new Sequence(PartType.spBrackets, '】', null, null, 0)
  partArr = splitKeyWord seqArr, partArr

  # 大题号、序号、选项号
  seqArr = []
  seqs = '一二三四五六七八九十'
  for s in seqs
    seqArr.push new Sequence(PartType.sqText, s, null, null, 0)
  seqs = 'ABCDEFGHIJKLMN'
  for s in seqs
    seqArr.push new Sequence(PartType.sqOption, s, null, null, 0)
  partArr = splitSeqChar seqArr, partArr

# 分割换行符
  partArr = splitWrap partArr
# 分割数字
  partArr = splitNum partArr
# 分割空格符
  partArr = splitSpace partArr
# 整理Part序号
  partArr = countIndex partArr

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

  # 图片rId237
  partArr = mergeSeqBySymbol(partArr, '1020,1020,1030', PartType.text)
  # 文本间的换行
  partArr = mergeSeqBySymbolRegex(partArr, '1020;1011{0,10};1010;1011{0,10};1020', PartType.text)

  # 合并关键字
  # 【答案】
  partArr = mergeSeqBySymbolRegex(partArr, '1051;1011{0,10};1080;1011{0,10};1051', PartType.qAnswer)
  # 【解析】
  partArr = mergeSeqBySymbolRegex(partArr, '1051;1011{0,10};1090;1011{0,10};1051', PartType.qAnalysis)
  # 【点评】
  partArr = mergeSeqBySymbolRegex(partArr, '1051;1011{0,10};1100;1011{0,10};1051', PartType.qCommen)
  # 【难度】
  partArr = mergeSeqBySymbolRegex(partArr, '1051;1011{0,10};1110;1011{0,10};1051', PartType.qDifficulty)

  # 合并序号与关键字前面的空格
  # partArr = mergeSpaceBeforeKeyWords partArr

  # 连续的换行
  partArr = mergeSeqBySymbolRegex(partArr, '1010;1010+', PartType.wrap)
  # 连续的文本+换行
  partArr = mergeSeqBySymbol(partArr, '1020,1010,1020,1010,1020', PartType.text)
  # 合并空格
  partArr = mergeSeqBySymbolRegex(partArr, '1011;1011+', PartType.space)
  partArr = mergeSeqBySymbolRegex(partArr, '1011;1020', PartType.text)
  partArr = mergeSeqBySymbolRegex(partArr, '1020;1011', PartType.text)
  # 合并纯文本
  partArr = mergeSeqBySymbol(partArr, '1050,1050', PartType.text)
  partArr = mergeSeqBySymbol(partArr, '1020,1020', PartType.text)

  # 夹在文本中的关键字，是文本？
  partArr = mergeSeqBySymbol(partArr, '1020,1040,1020', PartType.text)
  partArr = mergeSeqBySymbol(partArr, '1020,1060,1020', PartType.text)
  partArr = mergeSeqBySymbol(partArr, '1020,1080,1020', PartType.text)
  partArr = mergeSeqBySymbol(partArr, '1020,1090,1020', PartType.text)

  # 下面的需要根据上文判断
  partArr = mergeSeqBySymbol(partArr, '1011,1040,1020', PartType.text)
  # partArr = mergeSeqBySymbol(partArr, '1011,1050,1020', PartType.text)
  partArr = mergeSeqBySymbol(partArr, '1020,1030,1011', PartType.text)
  partArr = mergeSeqBySymbol(partArr, '1020,1030,1020', PartType.text)

  partArr

###
    解析成试题单元 （题号，题干，选项，。。。。。）
###
parsePartArr = (partArr) ->
  pTypeArr = []
  for part in partArr
    pTypeArr.push part.type
  typeStr = pTypeArr.join('')

  eleArr = []
  # 题号
  parseQElement(eleArr, EleType.qNo, '1010,(1030,)1020,1010', typeStr, partArr)
  parseQElement(eleArr, EleType.qNo, '1010,(1030,)1020,1050', typeStr, partArr)
  parseQElement(eleArr, EleType.qNo, '(1030,)1020,1060,1010', typeStr, partArr)
  parseQElement(eleArr, EleType.qNo, '1010,(1040,)1020,1070,1010', typeStr, partArr)
  # 题型
  parseQElement(eleArr, EleType.qType, '1030,1020,(1060,)1010', typeStr, partArr)
  parseQElement(eleArr, EleType.qType, '1010,1040,1020,(1070,)1010', typeStr, partArr)
  # 题干
  parseQElement(eleArr, EleType.qText, '1010,1030,(1020,)1010', typeStr, partArr)
  parseQElement(eleArr, EleType.qText, '1010,1030,(1020,)1050', typeStr, partArr)
  # 选项号
  parseQElement(eleArr, EleType.qOptionNo, '1010,(1050,)1020,1010,1050', typeStr, partArr)
  parseQElement(eleArr, EleType.qOptionNo, '1010,1011,(1050,)1020,1050', typeStr, partArr)
  parseQElement(eleArr, EleType.qOptionNo, '1010,(1050,)1020,1050', typeStr, partArr)
  parseQElement(eleArr, EleType.qOptionNo, '1050,1020,(1050,)1020', typeStr, partArr)
  parseQElement(eleArr, EleType.qOptionNo, '1020,(1050,)1020,1050,1020', typeStr, partArr)
  # 选项
  parseQElement(eleArr, EleType.qOption, '1010,1050,(1020,)1010,1050', typeStr, partArr)
  parseQElement(eleArr, EleType.qOption, '1010,1011,1050,(1020,)1050', typeStr, partArr)
  parseQElement(eleArr, EleType.qOption, '1010,1050,(1020,)1050', typeStr, partArr)
  parseQElement(eleArr, EleType.qOption, '1020,1050,(1020,)1050', typeStr, partArr)
  parseQElement(eleArr, EleType.qOption, '1020,1050,(1020,)1010', typeStr, partArr)
  parseQElement(eleArr, EleType.qOption, '1020,1050,(1020,)1050,1020', typeStr, partArr)
  # 答案
  parseQElement(eleArr, EleType.qAnswer, '1080,(1011,1050,1011,)1010,', typeStr, partArr)
  parseQElement(eleArr, EleType.qAnswer, '1080,(1011,1050,)1010', typeStr, partArr)
  # 解析
  parseQElement(eleArr, EleType.qAnalysis, '1010,1090,(1020,)1010', typeStr, partArr)
  # 点评
  parseQElement(eleArr, EleType.qCommen, '1010,1100,(1020,)1010', typeStr, partArr)
  # 难度
  parseQElement(eleArr, EleType.qDifficulty, '1010,1110,(1020,)1010', typeStr, partArr)

  # 排除重复项
  temObj = {}
  for ele in eleArr
    key = ele.type + ele.start + ele.end
    temObj[key] = ele
  eleArr = []
  for key of temObj
    eleArr.push temObj[key]

  # 排序
  eleArr.sort (l, h) ->
    l.start - h.start

  return eleArr

parseQuestionArr = (eleArr) ->
  eTypeArr = []
  for element in eleArr
    eTypeArr.push element.type
  typeStr = eTypeArr.join('')

  questionArr = []
  # 单选题
  parseQuestion(questionArr, QuestionType.single, '(1010,1020,1031,1030,1031,1030,1031,1030,1031,1030,1040,1050,1060,1070)', typeStr, eleArr)
  # 问答题
  parseQuestion(questionArr, QuestionType.question, '(1010,1020,1050,1060,1070)', typeStr, eleArr)
  # 排除重复项
  temObj = {}
  for ele in questionArr
    key = ele.type + ele.start + ele.end
    temObj[key] = ele
  questionArr = []
  for key of temObj
    questionArr.push temObj[key]

  # 排序
  questionArr.sort (l, h) ->
    l.start - h.start

  return questionArr
###
    解析试题单元
###
parseQElement = (eleArr, eleType, symbol, typeStr, partArr) ->
  # '1010,(1030,)1020,1010'
  sym = symbol.replace(/,/g, '')
  # 类型字符串的长度 目前固定为4个字符
  typeLength = PartType.none.length

  reg = new RegExp(sym, 'g')

  # index 20
  # sub "1030"
  # match "1010103010201010"
  # console.error "stop superReplace!"
  superReplace typeStr, sym, (match, sub, index) =>
    subMatchLength = sub.length / typeLength
    subIndex = sym.indexOf("(#{sub}")
    start = (index + subIndex) / typeLength
    end = start + subMatchLength
    if start % 1 != 0 || end % 1 != 0
      console.error "count index error!"

    parts = []
    for i in [start...end]
      parts.push partArr[i]

    # Element(@type, @parts, @start, @end, @last, @next, @index)
    eleArr.push new Element(eleType, parts, start, end, null, null, 0)
    sub # 这里随便返回一个值，没用
  return

###
    解析试题
###
parseQuestion = (questionArr, questionType, symbol, typeStr, eleArr) ->
  # '1010,(1030,)1020,1010'
  sym = symbol.replace(/,/g, '')
  # 类型字符串的长度 目前固定为4个字符
  typeLength = EleType.none.length

  reg = new RegExp(sym, 'g')

  superReplace typeStr, sym, (match, sub, index) =>
    subMatchLength = sub.length / typeLength
    subIndex = sym.indexOf("(#{sub}")
    start = (index + subIndex) / typeLength
    end = start + subMatchLength
    if start % 1 != 0 || end % 1 != 0
      console.error "count index error!"

    elements = []
    for i in [start...end]
      elements.push eleArr[i]

    # Question(@type, @elements, @start, @end, @last, @next, @index)
    questionArr.push new Question(questionType, elements, start, end, null, null, 0)
    sub # 这里随便返回一个值，没用
  return

###
    超级替换
###
superReplace = (typeStr, reg, callback) ->
  lastIndex = 0
  regex = new RegExp(reg)
  count = 0
  while(lastIndex < typeStr.length)
    temStr = typeStr.substring(lastIndex)
    ss = temStr.replace regex, (match, sub, index) =>
      callback match, sub, lastIndex + index
      lastIndex += index + 1
    break if temStr == ss || count++ > typeStr.length

###
    根据符号模型和partType合并多余序号
###
mergeSeqBySymbol = (partArr, symbol, partType) ->
  # symbol = '25233' # 图片rId11
  typeLength = PartType.none.length
  typeArr = []
  for part in partArr
    typeArr.push part.type
  typeStr = typeArr.join('')

  # 这里改成先计算位置再合并的方式
  sbls = symbol.split(',')
  symbolStr = sbls.join('')

  # 查找字符串位置
  lastPos = 0
  posArr = []
  while(true)
    index = typeStr.indexOf(symbolStr, lastPos)
    break if index == -1
    lastPos = index + 1
    posArr.push {start : index / typeLength, end : index / typeLength + sbls.length }

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
      raw = part.raw
      raw = ' ' if part.type == PartType.space
      part.type = PartType.none
      combineStr.push raw
    firstPart.raw = combineStr.join('')
    firstPart.type = partType

  arr = []
  for part in partArr
    arr.push(part) if part.type != PartType.none
  arr = countIndex(arr)

###
    根据符号模型和partType合并多余序号 使用正则表达式
###
mergeSeqBySymbolRegex = (partArr, symbol, partType) ->
  # symbol = '1051;1011{0,10};1090;1011{0,10};1051'

  # 类型字符串的长度 目前固定为4个字符
  typeLength = PartType.none.length

  typeArr = []
  for part in partArr
    typeArr.push part.type
  typeStr = typeArr.join('')

  # 这里改成先计算位置再合并的方式
  sbls = symbol.split(';')
  temSbls = []
  for sbl in sbls
    if sbl.length == typeLength
      temSbls.push sbl
    else
      s1 = sbl.substring(0, typeLength)
      s2 = sbl.substring(typeLength)
      temSbls.push "(#{s1})#{s2}"
  symbolStr = temSbls.join('')

  reg = new RegExp(symbolStr, 'g') # /1051(1011){0,10}1090(1011){0,10}1051/g
  matchs = typeStr.match(reg)      # ["1051109010111051", "1051109010111051", "1051109010111051"]

  matchObj = {}                    # 合并重复项
  if matchs?                       # 判断null
    for m in matchs
      continue if m.length == typeLength      # 对于单独一个PartType不做替换
      matchObj[m] = m

  # 查找匹配项的位置
  posArr = []
  for m of matchObj
    # 查找字符串位置
    lastPos = 0
    while(true)
      index = typeStr.indexOf(m, lastPos)
      break if index == -1
      lastPos = index + typeLength
      posArr.push { start : index / typeLength, end : index / typeLength + m.length / typeLength }

  # 排序
  posArr.sort (l, h) ->
    l.start - h.start

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
    s1 = []
    for i in [pos.start...pos.end]
      s1.push partArr[i].type
    # console.log s1.join(' ')
    for i in [pos.start...pos.end]
      part = partArr[i]
      raw = part.raw
      raw = ' ' if part.type == PartType.space
      part.type = PartType.none
      combineStr.push raw
    firstPart.raw = combineStr.join('')
    firstPart.type = partType

  # 移除已经标记没用的Part
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
  reg = /\n/g
  for part in partArr
    if part.type != PartType.none
      arr.push part
      continue
    str = part.raw.replace(/\r\n/g,'\n')
    matchs = str.match reg
    if !matchs?
      arr.push part if!matchs?
      continue
    ss = str.replace /(\n)/g, (num, sub) ->
      return "\n-\n#{sub}\n-\n"
    ssArr = ss.split('\n-\n')
    for s in ssArr
      continue if s.length == 0
      reg.lastIndex = 0
      if reg.test(s)
        arr.push new Part(PartType.wrap, "<br>", null, null, index++ )
      else
        arr.push new Part(PartType.none, s, null, null, index++ )
  # throw new Error('stop here!')
  arr

###
    分割空格
###
splitSpace = (partArr) ->
  arr = []
  index = 0
  reg = / /g
  for part in partArr
    if part.type != PartType.none
      arr.push part
      continue
    str = part.raw
    matchs = str.match reg
    if !matchs?
      arr.push part if!matchs?
      continue
    ss = str.replace /( )/g, (num, sub) ->
      return " - #{sub} - "
    ssArr = ss.split(' - ')
    for s in ssArr
      continue if s.length == 0
      reg.lastIndex = 0
      if reg.test(s)
        arr.push new Part(PartType.space, "<space>", null, null, index++ )
      else
        arr.push new Part(PartType.none, s, null, null, index++ )
  # throw new Error('stop here!')
  arr

###
  分割指定字符串
###
splitStr = (partArr, str, partType) ->
  arr = []
  index = 0
  for part in partArr
    if part.type != PartType.none
      arr.push part
      continue
    spArr = part.raw.split(str)
    for sItem in spArr
      arr.push new Part(PartType.none, sItem, null, null, index++ )
      arr.push new Part(partType, str, null, null, index++ )
  arr
###
    分割数字
###
splitNum = (partArr) ->
  arr = []
  index = 0
  reg = /\d+/g
  for part in partArr
    if part.type != PartType.none
      arr.push part
      continue
    str = part.raw
    matchs = str.match reg
    if !matchs?
      arr.push part if!matchs?
      continue
    ss = str.replace /(\d+)/g, (num, sub) ->
      return "0-0#{sub}0-0"
    ssArr = ss.split('0-0')
    for s in ssArr
      continue if s.length == 0
      reg.lastIndex = 0
      if reg.test(s)
        arr.push new Part(PartType.sqNum, s, null, null, index++ )
      else
        arr.push new Part(PartType.none, s, null, null, index++ )
  # throw new Error('stop here!')
  arr

###
    分割单词
###
splitWord = (partArr) ->
  arr = []
  index = 0
  reg = /[A-Z|a-z][A-Z|a-z]+/g
  for part in partArr
    if part.type != PartType.none
      arr.push part
      continue
    str = part.raw
    matchs = str.match reg
    if !matchs?
      arr.push part if!matchs?
      continue
    ss = str.replace /([A-Z|a-z][A-Z|a-z]+)/g, (num, sub) ->
      return "A-A#{sub}A-A"
    ssArr = ss.split('A-A')
    for s in ssArr
      continue if s.length == 0
      reg.lastIndex = 0
      if reg.test(s)
        arr.push new Part(PartType.text, s, null, null, index++ )
      else
        arr.push new Part(PartType.none, s, null, null, index++ )
  # throw new Error('stop here!')
  arr

###
    分割序号、关键字、长度大于一的关键字用正则匹配
###
splitKeyWord = (seqArr, partArr) ->
  arr = partArr
  for seq in seqArr
    temArr = []
    seqraw = seq.raw
    continue if !seqraw? || seqraw.length == 0

    for part in arr
      if part.type != PartType.none
        temArr.push part
        continue

      seqRegStr = ''
      if seqraw.length == 1
        seqRegStr = seqraw
      else  # 对于长度大于一的关键字 之间可以有 0 - 10 个空格 关键字之间的空格会被去掉
        seqsArr = seqraw.split('')
        seqRegStr = seqsArr.join(' {0,10}')

      reg = new RegExp(seqRegStr, 'g')
      matchs = part.raw.match reg
      if !matchs?
        temArr.push part
        continue
      ss = part.raw.replace new RegExp("(#{seqRegStr})", 'g'), (mainStr, sub) ->
        return "#{seqraw}-#{seqraw}#{sub}#{seqraw}-#{seqraw}"
      ssArr = ss.split("#{seqraw}-#{seqraw}")
      for s in ssArr
        continue if s.length < 1
        reg.lastIndex = 0
        if reg.test(s)
          temArr.push new Part(seq.type, s, null, null, 0 )
        else
          temArr.push new Part(PartType.none, s, null, null, 0 )
    arr = temArr
  arr
###
    分割序号、关键字、长度大于一的关键字用正则匹配
###
splitSeqChar = (seqArr, partArr) ->
  arr = partArr
  for seq in seqArr
    temArr = []
    seqraw = seq.raw
    continue if !seqraw? || seqraw.length == 0
    temArr = splitKeyCharWithPrefix("\n| ", seqraw, arr, seq.type)
    arr = temArr
  arr

###
    以带有指定前缀的字符分割字符串
###
splitKeyCharWithPrefix = (prefix, keyChar, partArr, partType) ->
  arr = []
  for part, i in partArr
    raw = part.raw

    if part.type != PartType.none
      arr.push part
      continue

    reg = new RegExp("[#{prefix}](#{keyChar})", 'g')
    matchs = raw.match reg
    if !matchs?
      arr.push part
      continue

    repRaw = raw.replace reg, (mainStr, sub, index) =>
      "#{mainStr.substring(0,1)}#{keyChar}-#{keyChar}#{sub}#{keyChar}-#{keyChar}"
    spArr = repRaw.split "#{keyChar}-#{keyChar}"

    reg = new RegExp("^#{keyChar}$")
    for s in spArr
      continue if s.length < 1
      reg.lastIndex = 0
      if reg.test s
        arr.push new Part(partType, s, null, null, 0 )
      else
        arr.push new Part(PartType.none, s, null, null, 0 )
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

###
    计算Element索引
###
countElementIndex = (eleArr) ->
  last = null
  for ele, i in eleArr
    ele.index = i
    last.next = ele if last?
    ele.last = last
    last = ele
  eleArr
###
    计算Question索引
###
countQuestionIndex = (questionArr) ->
  last = null
  for question, i in questionArr
    question.index = i
    last.next = question if last?
    question.last = last
    last = question
  questionArr
