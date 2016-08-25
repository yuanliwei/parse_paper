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
8  ．  已知实系数二次函数  公式:rId185  与  公式:rId187  满足方程  公式:rId189  和  公式:rId191  只有一对重根，已知  公式:rId193  有两个不同的实根，求证  公式:rId195  没有实根．
【解  析  】若对于  公式:rId197  ，  公式:rId199  ，  公式:rId201  ，
则有  公式:rId203  ，则  公式:rId205  最多有二等实根，
同理若对于  公式:rId197  ，  公式:rId208  ，  公式:rId210  ，也会矛盾，故二次函数  公式:rId212  ，  公式:rId214  具有不同的开口方向．
则若  公式:rId189  ，  公式:rId191  两个方程具有相同的重根，设其为  公式:rId218  ，
则  公式:rId212  ，  公式:rId214  对称轴为  公式:rId222  ，
则  公式:rId224  对称轴为  公式:rId222  ，具有重根  公式:rId218  ，与  公式:rId193  有两个不同的实根矛盾，故  公式:rId189  ，  公式:rId191  两个方程具有不同的重根，设其分别为  公式:rId231  ，则
公式:rId233
公式:rId235  ，
而等号由于  公式:rId237  ，不能同时取得，即  公式:rId239  无解，则  公式:rId241  无解．
【点评  】  二次函数的问题，在天学网校强手营第二阶段的讲义中开辟了两个专门章节讲过，此题用到了二次函数的两根式，是讲义中原题改编。
【难度】较高  。


"""
