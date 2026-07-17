/**
 * 扩充 events.json：补齐中国缺失朝代 + 新增朝代的重要事件
 *
 * 中国新增朝代：春秋战国 / 三国 / 两晋 / 南北朝 / 隋 / 五代
 * 新增世界：古埃及 / 波斯 / 马其顿 / 法国 / 日本 / 莫卧儿 / 阿兹特克 / 美国
 *
 * 运行：node scripts/expand-events.cjs
 */
const fs = require('fs')
const path = require('path')

const eventsPath = path.join(__dirname, '..', 'src', 'data', 'events.json')
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'))

// 找最大 id 数字
let maxId = 0
for (const e of events) {
  const m = e.id.match(/^ev-(\d+)$/)
  if (m) maxId = Math.max(maxId, parseInt(m[1], 10))
}
let nextId = maxId + 1
const newId = () => `ev-${String(nextId++).padStart(3, '0')}`

// 待新增的事件（id 自动生成）
const newEvents = [
  // ========== 春秋战国（重大事件） ==========
  { year: -685, title: '齐桓公称霸', category: '政治', region: 'china', coordinates: [117.20, 36.65], description: '齐桓公任用管仲改革，"九合诸侯，一匡天下"，成为春秋首霸，确立"尊王攘夷"旗号。', importance: 2 },
  { year: -632, title: '城濮之战', category: '军事', region: 'china', coordinates: [116.13, 35.79], description: '晋楚争霸的决战。晋文公重耳率军大败楚军于城濮（今山东鄄城），确立晋文公的霸主地位。', importance: 2 },
  { year: -551, title: '孔子诞生', category: '思想', region: 'china', coordinates: [116.99, 35.59], description: '孔子（公元前 551 年—前 479 年）生于鲁国曲阜，儒家学派创始人，提出"仁""礼"思想，整理《诗》《书》《礼》《易》《春秋》。', importance: 3 },
  { year: -536, title: '老子出关', category: '思想', region: 'china', coordinates: [108.95, 34.27], description: '老子（李耳，约公元前 571 年—前 471 年）骑青牛西出函谷关，应尹喜之请写下《道德经》五千言，道家学派创始人。', importance: 2 },
  { year: -453, title: '墨子著书', category: '思想', region: 'china', coordinates: [114.40, 35.10], description: '墨子（约公元前 476 年—前 390 年）创立墨家学派，主张"兼爱""非攻"，与儒家并称"显学"。', importance: 1 },
  { year: -369, title: '商鞅变法', category: '政治', region: 'china', coordinates: [108.95, 34.27], description: '秦孝公任用商鞅两次变法，废井田、开阡陌、奖励耕战、推行县制，秦国由此崛起，最终统一六国。', importance: 3 },
  { year: -342, title: '孟子周游', category: '思想', region: 'china', coordinates: [116.99, 35.59], description: '孟子（约公元前 372 年—前 289 年）继承孔子学说，提出"性善论""仁政""民贵君轻"，游说列国未得行其道。', importance: 2 },
  { year: -316, title: '庄子逍遥', category: '思想', region: 'china', coordinates: [116.99, 35.59], description: '庄子（约公元前 369 年—前 286 年）继承老子思想，主张"齐物""逍遥""齐物论"，文章瑰丽诡谲。', importance: 2 },
  { year: -260, title: '长平之战', category: '军事', region: 'china', coordinates: [113.05, 35.95], description: '秦将王翦大败赵军于长平（今山西高平），坑杀赵卒四十万，赵国元气大伤，六国再无力抗秦。', importance: 3 },
  { year: -230, title: '韩非入秦', category: '思想', region: 'china', coordinates: [108.95, 34.27], description: '韩非（约公元前 280 年—前 233 年）入秦献法家思想，被李斯陷害死于狱中。其《韩非子》集法家之大成。', importance: 1 },
  { year: -227, title: '荆轲刺秦', category: '军事', region: 'china', coordinates: [116.40, 39.90], description: '燕太子丹派荆轲刺秦王嬴政于易水边，图穷匕见，未中。荆轲被杀，秦加速攻燕。', importance: 2 },

  // ========== 三国 ==========
  { year: 208, title: '赤壁之战', category: '军事', region: 'china', coordinates: [113.65, 29.72], description: '孙权刘备联军在赤壁（今湖北赤壁）以火攻大破曹操 20 万大军，奠定三国鼎立基础。', importance: 3 },
  { year: 221, title: '刘备称帝', category: '政治', region: 'china', coordinates: [104.07, 30.67], description: '刘备于成都称帝，建立蜀汉。诸葛亮为丞相。', importance: 2 },
  { year: 222, title: '夷陵之战', category: '军事', region: 'china', coordinates: [110.91, 30.82], description: '刘备伐吴，在夷陵被陆逊火攻击败，蜀汉元气大伤。', importance: 2 },
  { year: 227, title: '诸葛亮北伐', category: '军事', region: 'china', coordinates: [108.95, 34.27], description: '诸葛亮上《出师表》开始北伐曹魏，先后五次出祁山，终未成功，病逝五丈原。', importance: 3 },
  { year: 263, title: '蜀汉灭亡', category: '政治', region: 'china', coordinates: [104.07, 30.67], description: '魏将邓艾、钟会伐蜀，刘禅出降，蜀汉亡。', importance: 2 },
  { year: 280, title: '西晋统一', category: '政治', region: 'china', coordinates: [118.78, 32.04], description: '晋将王濬率水军灭东吴，三国归晋。', importance: 2 },

  // ========== 两晋南北朝 ==========
  { year: 311, title: '永嘉之乱', category: '政治', region: 'china', coordinates: [112.43, 34.62], description: '匈奴刘聪军攻陷洛阳，掳晋怀帝，杀王公士民三万余人，西晋名存实亡。', importance: 2 },
  { year: 383, title: '淝水之战', category: '军事', region: 'china', coordinates: [116.99, 31.86], description: '东晋谢安指挥谢玄等北府兵八万，击退前秦苻坚 80 万大军，保住江南半壁。', importance: 3 },
  { year: 494, title: '北魏孝文帝改革', category: '政治', region: 'china', coordinates: [112.43, 34.62], description: '北魏孝文帝拓跋宏迁都洛阳，全面推行汉化：改汉姓、穿汉服、说汉话、与汉族通婚，促进民族大融合。', importance: 2 },
  { year: 547, title: '侯景之乱', category: '政治', region: 'china', coordinates: [118.78, 32.04], description: '东魏降将侯景反梁，攻陷建康（南京），梁武帝饿死台城，南朝遭受重创。', importance: 1 },

  // ========== 隋朝 ==========
  { year: 589, title: '隋灭陈统一', category: '政治', region: 'china', coordinates: [108.95, 34.27], description: '隋军渡江灭陈，结束了自西晋末年以来近 280 年的分裂割据局面。', importance: 3 },
  { year: 605, title: '开通大运河', category: '经济', region: 'china', coordinates: [116.40, 39.90], description: '隋炀帝征发百万民工开凿大运河，北抵涿郡南达余杭，全长 2700 余公里，沟通海河、黄河、淮河、长江、钱塘江五大水系。', importance: 3 },
  { year: 607, title: '始建科举', category: '政治', region: 'china', coordinates: [108.95, 34.27], description: '隋炀帝设进士科，标志着科举制度正式建立，影响中国 1300 多年的人才选拔。', importance: 2 },
  { year: 618, title: '李渊建唐', category: '政治', region: 'china', coordinates: [108.95, 34.27], description: '李渊在长安称帝，建立唐朝。同年宇文化及杀隋炀帝，隋朝灭亡。', importance: 2 },

  // ========== 五代十国 ==========
  { year: 907, title: '朱温灭唐', category: '政治', region: 'china', coordinates: [112.43, 34.62], description: '朱温废唐哀帝，建立后梁，唐朝灭亡。五代十国分裂开始。', importance: 2 },
  { year: 960, title: '陈桥兵变', category: '政治', region: 'china', coordinates: [114.30, 34.79], description: '赵匡胤在陈桥驿被黄袍加身，建立北宋，五代结束。', importance: 2 },

  // ========== 法国 ==========
  { year: 843, title: '凡尔登条约', category: '政治', region: 'other', coordinates: [2.13, 49.20], description: '查理曼帝国三分，奠定近代法、德、意雏形。秃头查理领西部法兰克。', importance: 2 },
  { year: 1066, title: '诺曼征服', category: '军事', region: 'other', coordinates: [0.49, 50.91], description: '诺曼底公爵威廉征服英格兰，加冕英王。', importance: 2 },
  { year: 1337, title: '英法百年战争', category: '军事', region: 'other', coordinates: [2.35, 48.86], description: '英法战争爆发，持续 116 年，是欧洲中世纪最长的战争。', importance: 2 },
  { year: 1429, title: '贞德解放奥尔良', category: '军事', region: 'other', coordinates: [1.90, 47.90], description: '17 岁法国少女贞德率军解放被英军围困的奥尔良，扭转百年战争战局。后被英军俘获处以火刑，1920 年封圣。', importance: 3 },
  { year: 1453, title: '百年战争结束', category: '军事', region: 'other', coordinates: [2.35, 48.86], description: '法军取得卡斯蒂永战役胜利，收复加莱，英法百年战争结束。', importance: 1 },
  { year: 1789, title: '法国大革命', category: '政治', region: 'other', coordinates: [2.35, 48.86], description: '1789 年 7 月 14 日攻陷巴士底狱，发表《人权宣言》，欧洲旧制度崩溃。', importance: 3 },
  { year: 1793, title: '路易十六被处死', category: '政治', region: 'other', coordinates: [2.35, 48.86], description: '法王路易十六被送上断头台，欧洲君主震惊。法国进入雅各宾派专政时期。', importance: 2 },
  { year: 1799, title: '雾月政变', category: '政治', region: 'other', coordinates: [2.35, 48.86], description: '拿破仑·波拿巴发动政变，建立执政府，自任第一执政。', importance: 2 },
  { year: 1804, title: '拿破仑称帝', category: '政治', region: 'other', coordinates: [2.35, 48.86], description: '拿破仑加冕称帝，建立法兰西第一帝国。', importance: 3 },
  { year: 1812, title: '拿破仑远征俄国', category: '军事', region: 'other', coordinates: [37.62, 55.75], description: '拿破仑率 60 万大军远征俄国，俄军坚壁清野，冬天严寒击溃法军。', importance: 2 },
  { year: 1815, title: '滑铁卢战役', category: '军事', region: 'other', coordinates: [4.40, 50.68], description: '拿破仑在滑铁卢被威灵顿率领的英荷联军击败，终结拿破仑时代。', importance: 3 },

  // ========== 日本 ==========
  { year: 710, title: '迁都平城京', category: '政治', region: 'other', coordinates: [135.78, 34.69], description: '元明天皇迁都平城京（奈良），仿中国长安建城，开启奈良时代。', importance: 2 },
  { year: 794, title: '迁都平安京', category: '政治', region: 'other', coordinates: [135.77, 35.01], description: '桓武天皇迁都平安京（京都），开启平安时代。', importance: 2 },
  { year: 1192, title: '镰仓幕府建立', category: '政治', region: 'other', coordinates: [139.55, 35.32], description: '源赖朝击败平氏，获任征夷大将军，建立镰仓幕府，日本进入武家政治。', importance: 3 },
  { year: 1336, title: '建武新政策', category: '政治', region: 'other', coordinates: [135.77, 35.01], description: '后醍醐天皇推翻镰仓幕府，实行建武新政，两年后失败，开启室町时代。', importance: 1 },
  { year: 1467, title: '应仁之乱', category: '军事', region: 'other', coordinates: [135.77, 35.01], description: '应仁之乱爆发，日本进入战国时代（1467—1615），诸侯混战百年。', importance: 2 },
  { year: 1603, title: '江户幕府建立', category: '政治', region: 'other', coordinates: [139.69, 35.69], description: '德川家康在江户建立幕府，确立"幕藩体制"，日本进入江户时代。', importance: 3 },
  { year: 1853, title: '黑船来航', category: '外交', region: 'other', coordinates: [139.69, 35.69], description: '美国海军准将佩里率四艘黑色铁甲舰（"黑船"）驶入江户湾，强迫日本开国通商。', importance: 2 },

  // ========== 莫卧儿 ==========
  { year: 1526, title: '第一次帕尼帕特战役', category: '军事', region: 'other', coordinates: [76.77, 29.39], description: '巴布尔率军击败德里苏丹军队，建立莫卧儿帝国。', importance: 2 },
  { year: 1556, title: '阿克巴继位', category: '政治', region: 'other', coordinates: [77.23, 28.61], description: '13 岁的阿克巴继位，统一印度大部，推行宗教宽容政策，缔造莫卧儿黄金时代。', importance: 2 },
  { year: 1632, title: '泰姬陵开工', category: '文化', region: 'other', coordinates: [78.04, 27.18], description: '沙贾汗为爱妃泰姬·玛哈尔建造泰姬陵，世界新七大奇迹之一。', importance: 3 },
  { year: 1707, title: '奥朗则布去世', category: '政治', region: 'other', coordinates: [77.23, 28.61], description: '奥朗则布去世后莫卧儿帝国陷入分裂，各地总督独立。', importance: 1 },
  { year: 1857, title: '印度民族大起义', category: '军事', region: 'other', coordinates: [77.23, 28.61], description: '印度土兵大起义，反抗英国东印度公司。起义失败后莫卧儿末代皇帝被流放，英国直接统治印度。', importance: 2 },

  // ========== 波斯 ==========
  { year: -550, title: '居鲁士建立波斯', category: '政治', region: 'other', coordinates: [48.0, 29.5], description: '居鲁士大帝推翻米底，建立阿契美尼德王朝。', importance: 2 },
  { year: -490, title: '马拉松战役', category: '军事', region: 'other', coordinates: [23.97, 38.16], description: '希波战争关键战役。雅典 1 万人击败波斯 5 万大军，希罗多德记述"马拉松"成为长跑起源。', importance: 3 },
  { year: -480, title: '温泉关战役', category: '军事', region: 'other', coordinates: [22.50, 38.78], description: '斯巴达国王列奥尼达率 300 勇士死守温泉关，掩护希腊撤退。', importance: 3 },
  { year: -480, title: '萨拉米斯海战', category: '军事', region: 'other', coordinates: [23.57, 37.96], description: '希腊海军以少胜多击败波斯舰队，彻底扭转希波战争。', importance: 3 },
  { year: -330, title: '高加米拉战役', category: '军事', region: 'other', coordinates: [43.25, 36.37], description: '亚历山大大帝以 4.7 万人击败波斯大流士三世的 20 万大军，灭亡阿契美尼德王朝。', importance: 3 },
  { year: 224, title: '萨珊波斯建立', category: '政治', region: 'other', coordinates: [48.0, 29.5], description: '阿尔达希尔一世推翻帕提亚，建立萨珊波斯帝国，定都泰西封。', importance: 2 },
  { year: 628, title: '卡瓦德改革', category: '政治', region: 'other', coordinates: [48.0, 29.5], description: '萨珊波斯皇帝卡瓦德进行重要改革。', importance: 1 },
  { year: 651, title: '萨珊波斯灭亡', category: '政治', region: 'other', coordinates: [35.78, 35.30], description: '阿拉伯军队在卡迪西亚战役击败萨珊，末代皇帝伊嗣埃三世被杀，萨珊波斯灭亡。', importance: 2 },

  // ========== 古埃及（精选） ==========
  { year: -2580, title: '胡夫金字塔', category: '文化', region: 'other', coordinates: [31.13, 29.98], description: '胡夫（Khufu）建造大金字塔，塔高 146.5 米，是古代世界七大奇迹中最古老也是唯一幸存的。', importance: 3 },
  { year: -1353, title: '图坦卡蒙登基', category: '政治', region: 'other', coordinates: [32.55, 25.69], description: '古埃及第十八王朝法老图坦卡蒙 9 岁登基，其陵墓 1922 年被霍华德·卡特发现，出土黄金面具震惊世界。', importance: 2 },
  { year: -1274, title: '卡迭石战役', category: '军事', region: 'other', coordinates: [36.51, 34.55], description: '埃及法老拉美西斯二世与赫梯帝国争夺叙利亚霸权，会战于卡迭石，双方都宣称胜利，签订人类历史上第一个和平条约。', importance: 1 },
  { year: -332, title: '亚历山大征服埃及', category: '政治', region: 'other', coordinates: [31.23, 30.04], description: '亚历山大大帝征服埃及，在尼罗河口建亚历山大里亚城，作为希腊化世界首都。', importance: 2 },
  { year: -30, title: '克娄巴特拉之死', category: '政治', region: 'other', coordinates: [29.92, 31.20], description: '克娄巴特拉七世自杀，托勒密王朝覆灭，埃及并入罗马帝国。', importance: 2 },

  // ========== 马其顿（精选） ==========
  { year: -338, title: '喀罗尼亚战役', category: '军事', region: 'other', coordinates: [22.43, 38.66], description: '马其顿国王腓力二世击败希腊联军，称霸希腊。', importance: 2 },
  { year: -334, title: '亚历山大东征', category: '军事', region: 'other', coordinates: [22.40, 40.79], description: '亚历山大大帝率 3.5 万马其顿方阵军东征，先后征服小亚细亚、埃及、波斯、美索不达米亚，攻入印度，建立横跨亚非欧的帝国。', importance: 3 },
  { year: -323, title: '亚历山大病逝巴比伦', category: '政治', region: 'other', coordinates: [44.42, 32.54], description: '亚历山大大帝 33 岁病逝于巴比伦，帝国分裂为继业者王国。', importance: 2 },

  // ========== 美国 ==========
  { year: 1776, title: '美国独立宣言', category: '政治', region: 'britain', coordinates: [-75.15, 39.95], description: '大陆会议通过《独立宣言》，宣告美国 13 州脱离英国独立。杰斐逊起草："人人生而平等"。', importance: 3 },
  { year: 1783, title: '美国独立战争结束', category: '军事', region: 'britain', coordinates: [-75.13, 38.63], description: '《巴黎条约》签订，英国承认美国独立。', importance: 2 },
  { year: 1789, title: '华盛顿就职', category: '政治', region: 'britain', coordinates: [-77.04, 38.91], description: '乔治·华盛顿就任美国首任总统，开启美国宪政。', importance: 2 },
  { year: 1803, title: '路易斯安那购地', category: '政治', region: 'britain', coordinates: [-77.04, 38.91], description: '杰斐逊总统以 1500 万美元从拿破仑法国购得路易斯安那，美国领土翻倍。', importance: 2 },
  { year: 1861, title: '美国南北战争爆发', category: '军事', region: 'britain', coordinates: [-77.04, 38.91], description: '南方 11 州宣布独立，美国内战爆发。', importance: 3 },
  { year: 1863, title: '葛底斯堡战役', category: '军事', region: 'britain', coordinates: [-77.24, 39.81], description: '北方取得关键胜利，扭转南北战争战局。林肯 4 个月后发表《葛底斯堡演说》。', importance: 3 },
  { year: 1865, title: '南北战争结束', category: '军事', region: 'britain', coordinates: [-77.04, 38.91], description: '南方将军李于阿波马托克斯投降，奴隶制废除，美国完成统一。', importance: 3 },

  // ========== 蒙古帝国（精选，已有 5 条）补充关键事件 ==========
  { year: 1227, title: '成吉思汗病逝', category: '政治', region: 'mongol', coordinates: [106.92, 47.92], description: '成吉思汗在六盘山南麓清水县（今属甘肃）病逝，临终留下灭金、联宋战略。', importance: 3 },
  { year: 1258, title: '巴格达陷落', category: '军事', region: 'mongol', coordinates: [44.36, 33.31], description: '蒙古旭烈兀攻陷阿拔斯王朝首都巴格达，末代哈里发被裹地毯踩死，伊斯兰世界震动。', importance: 2 },
  { year: 1279, title: '崖山海战', category: '军事', region: 'china', coordinates: [113.15, 21.85], description: '元军在崖山海战击败南宋残余，陆秀夫背幼帝跳海，南宋灭亡。', importance: 3 },

  // ========== 阿兹特克 ==========
  { year: 1325, title: '特诺奇蒂特兰建立', category: '政治', region: 'other', coordinates: [-99.13, 19.43], description: '阿兹特克人在特斯科科湖建特诺奇蒂特兰城（今墨西哥城），后成阿兹特克帝国首都。', importance: 2 },
  { year: 1521, title: '特诺奇蒂特兰陷落', category: '军事', region: 'other', coordinates: [-99.13, 19.43], description: '西班牙征服者科尔特斯率军联合当地部落，攻陷特诺奇蒂特兰，末代皇帝蒙特祖玛二世被杀，阿兹特克帝国灭亡。', importance: 2 },
]

// 过滤已存在（同 id 或同 title+year）
const existingKeys = new Set(events.map(e => `${e.year}-${e.title}`))
const toAdd = []
for (const e of newEvents) {
  const key = `${e.year}-${e.title}`
  if (!existingKeys.has(key)) {
    toAdd.push({ id: newId(), ...e })
  }
}

const merged = [...events, ...toAdd]
fs.writeFileSync(eventsPath, JSON.stringify(merged, null, 2) + '\n', 'utf8')

console.log(`原有 ${events.length} 事件，新增 ${toAdd.length} 事件，共 ${merged.length} 事件`)