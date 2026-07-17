/**
 * 扩充 events.json v2：新增朝代的重要事件
 *
 * - 欧洲：神圣罗马 / 普鲁士 / 意大利 / 西班牙 / 荷兰 / 威尼斯
 * - 非洲：加纳 / 马里 / 桑海 / 埃塞俄比亚
 * - 东南亚：高棉 / 蒲甘 / 室利佛逝 / 满者伯夷
 * - 美洲：印加
 * - 印度：笈多 / 孔雀 / 德里
 *
 * 运行：node scripts/expand-events-v2.cjs
 */
const fs = require('fs')
const path = require('path')

const eventsPath = path.join(__dirname, '..', 'src', 'data', 'events.json')
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'))

let maxId = 0
for (const e of events) {
  const m = e.id.match(/^ev-(\d+)$/)
  if (m) maxId = Math.max(maxId, parseInt(m[1], 10))
}
let nextId = maxId + 1
const newId = () => `ev-${String(nextId++).padStart(3, '0')}`

const newEvents = [
  // ========== 神圣罗马帝国 ==========
  { year: 962, title: '奥托一世加冕', category: '政治', region: 'other', coordinates: [11.36, 48.20], description: '奥托一世（936—973）由教皇约翰十二世加冕为"神圣罗马帝国"皇帝，建立中世纪欧洲核心政治体。', importance: 2 },
  { year: 1077, title: '卡诺莎之辱', category: '政治', region: 'other', coordinates: [10.10, 45.04], description: '神圣罗马皇帝亨利四世在卡诺莎城堡外赤脚站立三天向教皇格里高利七世求饶，教会权力达到顶峰。', importance: 2 },
  { year: 1356, title: '金玺诏书', category: '政治', region: 'other', coordinates: [11.10, 49.45], description: '查理四世颁布《金玺诏书》，确立七大选帝侯选举皇帝制度，皇帝实权进一步削弱。', importance: 1 },
  { year: 1517, title: '马丁·路德宗教改革', category: '思想', region: 'other', coordinates: [12.10, 51.34], description: '马丁·路德在维滕堡教堂门口张贴《九十五条论纲》，反对赎罪券，宗教改革爆发，神圣罗马帝国分裂为天主教和新教。', importance: 3 },
  { year: 1618, title: '三十年战争', category: '军事', region: 'other', coordinates: [14.42, 50.07], description: '波西米亚"布拉格掷出窗外事件"引发神圣罗马内战，波及欧洲主要国家。1648 年《威斯特伐利亚和约》签订，现代国际关系奠基。', importance: 2 },
  { year: 1806, title: '神圣罗马帝国解散', category: '政治', region: 'other', coordinates: [13.40, 52.52], description: '拿破仑在奥斯特里茨战役后勒令神圣罗马皇帝弗朗茨二世退位，存在 844 年的帝国终结。', importance: 2 },

  // ========== 普鲁士 / 德意志统一 ==========
  { year: 1740, title: '腓特烈大帝即位', category: '政治', region: 'other', coordinates: [13.40, 52.52], description: '腓特烈二世（腓特烈大帝）即位，普鲁士进入黄金时代。', importance: 2 },
  { year: 1756, title: '七年战争', category: '军事', region: 'other', coordinates: [13.40, 52.52], description: '普鲁士与英国、奥地利对抗法、俄、奥、撒丁联军，史称"第一次世界大战"。腓特烈大帝依靠军事天才险胜。', importance: 2 },
  { year: 1862, title: '俾斯麦任首相', category: '政治', region: 'other', coordinates: [13.40, 52.52], description: '奥托·冯·俾斯麦任普鲁士首相，推行"铁血政策"，开启德意志统一进程。', importance: 2 },
  { year: 1864, title: '普丹战争', category: '军事', region: 'other', coordinates: [10.20, 56.16], description: '普鲁士、奥地利联军击败丹麦，夺取石勒苏益格-荷尔斯泰因。', importance: 1 },
  { year: 1866, title: '普奥战争', category: '军事', region: 'other', coordinates: [9.18, 48.78], description: '普鲁士在萨多瓦战役击败奥地利，解散德意志邦联，建立北德意志邦联。', importance: 2 },
  { year: 1870, title: '普法战争', category: '军事', region: 'other', coordinates: [2.35, 48.86], description: '拿破仑三世对普鲁士宣战，色当会战中普军大败法军，拿破仑三世被俘。', importance: 2 },
  { year: 1871, title: '德意志帝国成立', category: '政治', region: 'other', coordinates: [13.40, 52.52], description: '威廉一世在凡尔赛宫加冕为德意志皇帝，俾斯麦任宰相，德国统一。', importance: 3 },
  { year: 1914, title: '一战爆发', category: '军事', region: 'other', coordinates: [13.40, 52.52], description: '萨拉热窝事件后，德国、奥匈帝国对塞尔维亚、俄国、法国、英国宣战，第一次世界大战爆发。', importance: 3 },
  { year: 1918, title: '德国十一月革命', category: '政治', region: 'other', coordinates: [13.40, 52.52], description: '德国战败，水兵起义引发革命，皇帝威廉二世退位，霍亨索伦王朝终结，魏玛共和国成立。', importance: 2 },

  // ========== 意大利 ==========
  { year: 1860, title: '千人远征军', category: '军事', region: 'rome', coordinates: [14.27, 40.85], description: '加里波第率 1000 志愿者远征两西西里王国，解放西西里、那不勒斯，归并撒丁王国。', importance: 2 },
  { year: 1861, title: '意大利王国成立', category: '政治', region: 'rome', coordinates: [12.50, 41.90], description: '撒丁王国改称意大利王国，维克多·伊曼纽尔二世为国王，首都都灵（后迁罗马）。', importance: 2 },
  { year: 1870, title: '意大利统一', category: '政治', region: 'rome', coordinates: [12.50, 41.90], description: '普法战争时意大利军攻入罗马，教皇庇护九世退入梵蒂冈，意大利统一。', importance: 2 },
  { year: 1922, title: '墨索里尼法西斯', category: '政治', region: 'rome', coordinates: [12.50, 41.90], description: '墨索里尼发动"向罗马进军"，任意大利首相，建立世界第一个法西斯政权。', importance: 2 },
  { year: 1940, title: '意大利参加二战', category: '军事', region: 'rome', coordinates: [12.50, 41.90], description: '墨索里尼追随希特勒，对英法宣战，入侵希腊、埃及。', importance: 1 },
  { year: 1946, title: '意大利共和国成立', category: '政治', region: 'rome', coordinates: [12.50, 41.90], description: '公民投票废除君主制，建立意大利共和国，废除君主制。', importance: 2 },

  // ========== 西班牙 ==========
  { year: 1492, title: '格拉纳达陷落', category: '政治', region: 'other', coordinates: [-3.61, 37.18], description: '卡斯蒂利亚收复格拉纳达，结束 781 年摩尔人在伊比利亚的统治。', importance: 2 },
  { year: 1492, title: '哥伦布发现美洲', category: '外交', region: 'other', coordinates: [-3.71, 40.42], description: '哥伦布在卡斯蒂利亚王后伊莎贝拉资助下到达巴哈马，揭开大航海时代序幕。', importance: 3 },
  { year: 1519, title: '征服墨西哥', category: '军事', region: 'other', coordinates: [-99.13, 19.43], description: '埃尔南·科尔特斯率 600 人征服阿兹特克帝国，开启西班牙美洲殖民。', importance: 2 },
  { year: 1532, title: '征服印加', category: '军事', region: 'other', coordinates: [-13.52, -71.97], description: '皮萨罗率 168 人俘获印加国王阿塔瓦尔帕，1533 年处死，印加帝国灭亡。', importance: 2 },
  { year: 1556, title: '腓力二世继位', category: '政治', region: 'other', coordinates: [-3.71, 40.42], description: '腓力二世继位，西班牙帝国达到鼎盛，统治美洲、菲律宾、荷兰、葡萄牙、米兰、那不勒斯。', importance: 2 },
  { year: 1588, title: '无敌舰队覆灭', category: '军事', region: 'other', coordinates: [50.16, -1.27], description: '西班牙无敌舰队征英遭遇风暴和英国海军击败，西班牙海上霸权开始衰落。', importance: 2 },
  { year: 1898, title: '美西战争', category: '军事', region: 'other', coordinates: [-3.71, 40.42], description: '美国击败西班牙，夺取古巴、波多黎各、菲律宾，西班牙殖民帝国崩溃。', importance: 2 },
  { year: 1936, title: '西班牙内战', category: '军事', region: 'other', coordinates: [-3.71, 40.42], description: '佛朗哥军事政变引发内战，希特勒、墨索里尼干涉；国际纵队志愿支持共和派。', importance: 2 },

  // ========== 荷兰 / 威尼斯 ==========
  { year: 1602, title: '东印度公司成立', category: '经济', region: 'other', coordinates: [4.90, 52.37], description: '荷兰东印度公司（VOC）成立，发行世界首支股票，建立阿姆斯特丹证券交易所。', importance: 2 },
  { year: 1602, title: '阿姆斯特丹证交所', category: '经济', region: 'other', coordinates: [4.90, 52.37], description: '世界第一个证券交易所成立，奠定现代金融体系基础。', importance: 2 },
  { year: 1667, title: '英荷战争', category: '军事', region: 'other', coordinates: [4.90, 52.37], description: '英荷战争持续 200 多年，荷兰最终衰落，让位于英国海上霸权。', importance: 1 },
  { year: 1204, title: '第四次十字军攻陷君士坦丁堡', category: '军事', region: 'other', coordinates: [28.98, 41.01], description: '威尼斯商人资助第四次十字军东征，转而攻陷拜占庭首都君士坦丁堡，威尼斯分得大量希腊艺术品。', importance: 2 },
  { year: 1453, title: '君士坦丁堡陷落', category: '政治', region: 'other', coordinates: [28.98, 41.01], description: '奥斯曼苏丹穆罕默德二世攻陷君士坦丁堡，东罗马帝国灭亡，威尼斯丧失地中海贸易霸权。', importance: 2 },

  // ========== 非洲 ==========
  { year: 350, title: '加纳帝国建立', category: '政治', region: 'other', coordinates: [-3.97, 5.34], description: '西非索宁克人建立加纳帝国，垄断跨撒哈拉贸易。', importance: 1 },
  { year: 1067, title: '巴克里访加纳', category: '文化', region: 'other', coordinates: [-3.97, 5.34], description: '阿拉伯旅行家巴克里游历加纳，著《北非与中非见闻录》，记述加纳富强与国王财富。', importance: 1 },
  { year: 1235, title: '松迪亚塔凯塔', category: '政治', region: 'other', coordinates: [-8.00, 12.65], description: '松迪亚塔·凯塔率曼丁果部落联盟在基里纳战役击败索索人，建立马里帝国。', importance: 2 },
  { year: 1324, title: '曼萨·穆萨朝圣', category: '外交', region: 'other', coordinates: [31.24, 30.04], description: '马里帝国国王曼萨·穆萨经开罗赴麦加朝圣，赠送大量黄金，金价暴跌 12%，马里名扬欧洲和伊斯兰世界。', importance: 2 },
  { year: 1464, title: '桑海帝国兴起', category: '政治', region: 'other', coordinates: [-0.04, 16.04], description: '桑尼·阿里建立桑海帝国，攻占廷巴克图，成为西非新霸主。', importance: 1 },
  { year: 1493, title: '阿斯基亚大帝', category: '政治', region: 'other', coordinates: [-0.04, 16.04], description: '阿斯基亚·穆罕默德·图雷夺取桑海王位，扩展帝国至顶峰，建立 500 万人帝国。', importance: 2 },
  { year: 1591, title: '桑海帝国灭亡', category: '政治', region: 'other', coordinates: [30.0, 19.0], description: '摩洛哥萨迪王朝远征军跨撒哈拉攻入廷巴克图，桑海帝国灭亡。', importance: 2 },
  { year: 1896, title: '阿杜瓦战役', category: '军事', region: 'other', coordinates: [37.71, 11.18], description: '埃塞俄比亚皇帝孟尼利克二世率军在阿杜瓦击败意大利侵略军，保卫独立。', importance: 2 },
  { year: 4, title: '埃塞俄比亚接受基督教', category: '文化', region: 'other', coordinates: [38.74, 9.03], description: '阿克苏姆王国国王埃扎纳皈依基督教，埃塞俄比亚成为世界第二个基督教国家（仅次于亚美尼亚）。', importance: 2 },

  // ========== 东南亚 ==========
  { year: 800, title: '室利佛逝崛起', category: '政治', region: 'other', coordinates: [104.76, -2.99], description: '室利佛逝在苏门答腊东南崛起，控制马六甲海峡，垄断东西方海上贸易。', importance: 1 },
  { year: 802, title: '阇耶跋摩二世统一高棉', category: '政治', region: 'other', coordinates: [104.30, 13.41], description: '阇耶跋摩二世统一高棉，定都吴哥，开创高棉帝国。', importance: 2 },
  { year: 849, title: '蒲甘王朝建立', category: '政治', region: 'other', coordinates: [94.86, 21.17], description: '披因比亚建立蒲甘王朝，开启缅甸统一帝国。', importance: 1 },
  { year: 1113, title: '吴哥窟开工', category: '文化', region: 'other', coordinates: [103.86, 13.41], description: '苏利耶跋摩二世在吴哥建造印度教毗湿奴神庙——吴哥窟，世界最大宗教建筑，世界新七大奇迹之一。', importance: 3 },
  { year: 1287, title: '元朝攻陷蒲甘', category: '军事', region: 'other', coordinates: [94.86, 21.17], description: '元朝忽必烈远征军攻陷蒲甘，缅甸蒲甘王朝衰落（缅甸史上"蒲甘之陷"）。', importance: 2 },
  { year: 1293, title: '满者伯夷建立', category: '政治', region: 'other', coordinates: [112.74, -7.25], description: '莱纳尔击退元朝远征军，建立满者伯夷王国，开启爪哇帝国。', importance: 2 },
  { year: 1350, title: '满者伯夷鼎盛', category: '政治', region: 'other', coordinates: [112.74, -7.25], description: '哈奄武禄在位时满者伯夷达到鼎盛，征服马来半岛、婆罗洲、巴厘、苏门答腊、菲律宾。', importance: 1 },

  // ========== 美洲 ==========
  { year: 1438, title: '印加帝国建立', category: '政治', region: 'other', coordinates: [-13.52, -71.97], description: '帕查库提建立印加帝国，建造库斯科为首都，建造马丘比丘。', importance: 2 },
  { year: 1450, title: '马丘比丘建成', category: '文化', region: 'other', coordinates: [-13.16, -72.55], description: '印加皇帝帕查库提建造马丘比丘——"失落的印加城市"，世界新七大奇迹之一。', importance: 3 },
  { year: 1492, title: '哥伦布到达美洲', category: '外交', region: 'other', coordinates: [-77.36, 12.06], description: '哥伦布率 3 艘帆船到达巴哈马群岛圣萨尔瓦多岛，开启"地理大发现"和殖民时代。', importance: 3 },
  { year: 1520, title: '麦哲伦环球航行', category: '外交', region: 'other', coordinates: [-78.85, -2.18], description: '麦哲伦率船队首次环球航行，证实地球是圆的。', importance: 3 },
  { year: 1521, title: '阿兹特克灭亡', category: '政治', region: 'other', coordinates: [-99.13, 19.43], description: '科尔特斯率西班牙征服者联合阿兹特克仇敌特拉斯卡拉人攻陷特诺奇蒂特兰，末代皇帝蒙特祖玛二世被俘，阿兹特克帝国灭亡。', importance: 2 },
  { year: 1533, title: '印加帝国灭亡', category: '政治', region: 'other', coordinates: [-13.52, -71.97], description: '皮萨罗率 168 名西班牙人俘获印加国王阿塔瓦尔帕，1533 年处死，印加帝国灭亡。', importance: 2 },

  // ========== 印度 ==========
  { year: -268, title: '阿育王即位', category: '政治', region: 'other', coordinates: [25.42, 81.85], description: '阿育王继位，通过血战羯陵伽统一印度大部分领土，孔雀王朝达到鼎盛。', importance: 2 },
  { year: -250, title: '阿育王皈依佛教', category: '思想', region: 'other', coordinates: [25.42, 81.85], description: '阿育王在血战羯陵伽后皈依佛教，放弃战争征服，推行"法"（正法），发布法敕石刻。', importance: 2 },
  { year: 320, title: '笈多王朝建立', category: '政治', region: 'other', coordinates: [25.42, 81.85], description: '旃陀罗笈多一世建立笈多王朝，统一北印度，奠定印度古典时代黄金期。', importance: 1 },
  { year: 405, title: '法显西行', category: '文化', region: 'other', coordinates: [25.42, 81.85], description: '中国东晋高僧法显西行求法，旅居印度 10 年，著《佛国记》，记录笈多王朝盛世。', importance: 1 },
  { year: 630, title: '玄奘西行', category: '文化', region: 'other', coordinates: [25.42, 81.85], description: '中国唐朝高僧玄奘赴天竺求法，在那烂陀寺从戒贤学法 5 年，著《大唐西域记》。', importance: 2 },
  { year: 712, title: '玄奘归唐', category: '文化', region: 'china', coordinates: [108.95, 34.27], description: '玄奘归唐，携佛经 657 部，主持译经 19 年，与弟子窥基创立唯识宗。', importance: 1 },
  { year: 1206, title: '德里苏丹国建立', category: '政治', region: 'other', coordinates: [77.23, 28.61], description: '古尔王朝将军库特布丁·艾伊拜克建立德里苏丹国，伊斯兰教在印度北部扎根。', importance: 1 },
  { year: 1526, title: '莫卧儿建国', category: '政治', region: 'other', coordinates: [76.77, 29.39], description: '巴布尔在第一次帕尼帕特战役击败德里苏丹伊卜拉欣·洛迪，建立莫卧儿帝国。', importance: 2 },

  // ========== 近现代（19-20 世纪） ==========
  { year: 1848, title: '欧洲革命', category: '政治', region: 'other', coordinates: [2.35, 48.86], description: '法国二月革命推翻路易·菲利普，1848 年革命浪潮席卷欧洲（意大利、奥地利、匈牙利、德国）。', importance: 2 },
  { year: 1861, title: '美国南北战争', category: '军事', region: 'britain', coordinates: [-77.04, 38.91], description: '南方 11 州宣布独立，美国内战爆发，北方工业对南方奴隶制。', importance: 3 },
  { year: 1865, title: '美国废奴', category: '政治', region: 'britain', coordinates: [-77.04, 38.91], description: '南北战争结束，美国宪法第十三修正案废除奴隶制。', importance: 3 },
  { year: 1914, title: '一战爆发', category: '军事', region: 'other', coordinates: [13.40, 52.52], description: '萨拉热窝事件后，第一次世界大战爆发，欧洲列强混战。', importance: 3 },
  { year: 1917, title: '俄国十月革命', category: '政治', region: 'other', coordinates: [37.62, 55.75], description: '列宁领导的布尔什维克在俄国十月革命中夺取政权，建立世界上第一个社会主义国家。', importance: 3 },
  { year: 1929, title: '大萧条', category: '经济', region: 'other', coordinates: [-74.00, 40.71], description: '纽约股市崩盘，引发全球大萧条，资本主义世界经济危机。', importance: 2 },
  { year: 1933, title: '罗斯福新政', category: '政治', region: 'britain', coordinates: [-77.04, 38.91], description: '富兰克林·罗斯福就任美国第 32 任总统，推行"新政"应对大萧条，确立现代国家干预经济模式。', importance: 2 },
  { year: 1939, title: '二战爆发', category: '军事', region: 'other', coordinates: [52.40, 16.91], description: '德国闪击波兰，英法对德宣战，第二次世界大战爆发。', importance: 3 },
  { year: 1941, title: '珍珠港事件', category: '军事', region: 'britain', coordinates: [-157.95, 21.35], description: '日本偷袭珍珠港，太平洋战争爆发，二战全面升级。', importance: 3 },
  { year: 1945, title: '二战结束', category: '军事', region: 'other', coordinates: [34.30, -2.95], description: '德国（5 月）、日本（8 月）相继投降，二战结束。', importance: 3 },
  { year: 1947, title: '印度独立', category: '政治', region: 'other', coordinates: [77.23, 28.61], description: '印度独立，巴基斯坦同步分治，南亚次大陆结束英国殖民。', importance: 2 },
  { year: 1949, title: '新中国成立', category: '政治', region: 'china', coordinates: [116.40, 39.90], description: '中华人民共和国成立，结束半殖民地半封建社会。', importance: 3 },
  { year: 1969, title: '登月', category: '科技', region: 'britain', coordinates: [-80.65, 28.57], description: '美国阿波罗 11 号登月，阿姆斯特朗成为第一个登上月球的人类。', importance: 2 },
  { year: 1991, title: '苏联解体', category: '政治', region: 'other', coordinates: [37.62, 55.75], description: '苏联解体，冷战结束，两极格局变成一超多强。', importance: 3 },

  // ========== 中世纪欧洲（补充） ==========
  { year: 1095, title: '克勒芒演说', category: '思想', region: 'other', coordinates: [3.10, 45.78], description: '教皇乌尔班二世在克勒芒演说，号召第一次十字军东征，夺回圣地耶路撒冷。', importance: 2 },
  { year: 1099, title: '十字军攻陷耶路撒冷', category: '军事', region: 'other', coordinates: [35.21, 31.78], description: '第一次十字军攻陷耶路撒冷，建立耶路撒冷王国和十字军国家。', importance: 2 },
  { year: 1291, title: '十字军东征结束', category: '政治', region: 'other', coordinates: [35.21, 31.78], description: '阿卡城陷落，十字军在东方的最后据点消失，200 年东征历史结束。', importance: 2 },
  { year: 1337, title: '百年战争开始', category: '军事', region: 'other', coordinates: [2.35, 48.86], description: '英王爱德华三世宣称法国王位继承权，百年战争爆发。', importance: 2 },
  { year: 1347, title: '黑死病爆发', category: '政治', region: 'other', coordinates: [12.34, 45.43], description: '黑死病（鼠疫）从克里米亚经威尼斯传入欧洲，3 年内杀死欧洲 1/3 人口（约 2500 万），动摇封建制度。', importance: 2 },
  { year: 1453, title: '君士坦丁堡陷落', category: '政治', region: 'other', coordinates: [28.98, 41.01], description: '奥斯曼苏丹穆罕默德二世攻陷君士坦丁堡，东罗马帝国灭亡，中世纪结束，近代开端。', importance: 3 },
  { year: 1492, title: '收复失地运动完成', category: '政治', region: 'other', coordinates: [-3.61, 37.18], description: '卡斯蒂利亚收复格拉纳达，结束 781 年摩尔人在伊比利亚的统治。', importance: 2 },
  { year: 1517, title: '九十五条论纲', category: '思想', region: 'other', coordinates: [12.10, 51.34], description: '马丁·路德发表《九十五条论纲》，反对赎罪券，宗教改革爆发。', importance: 3 },
  { year: 1648, title: '威斯特伐利亚和约', category: '政治', region: 'other', coordinates: [8.02, 52.01], description: '三十年战争结束，签订《威斯特伐利亚和约》，建立现代国家主权平等原则，被视为现代国际关系起点。', importance: 3 },
  { year: 1687, title: '牛顿《自然哲学的数学原理》', category: '科技', region: 'other', coordinates: [0.13, 52.20], description: '牛顿发表《自然哲学的数学原理》，建立经典力学体系，标志近代科学革命。', importance: 3 },
  { year: 1769, title: '瓦特蒸汽机', category: '科技', region: 'other', coordinates: [-2.59, 51.45], description: '詹姆斯·瓦特改良蒸汽机，工业革命开始。', importance: 2 },
  { year: 1859, title: '达尔文《物种起源》', category: '科技', region: 'other', coordinates: [0.13, 52.20], description: '达尔文发表《物种起源》，提出自然选择理论，生物进化论奠基。', importance: 2 },

  // ========== 中国补充：明朝中后期、清朝中后期 ==========
  { year: 1566, title: '戚继光抗倭', category: '军事', region: 'china', coordinates: [121.55, 29.88], description: '戚继光在浙江训练"戚家军"，抗倭寇成效显著。', importance: 2 },
  { year: 1644, title: '甲申之变', category: '政治', region: 'china', coordinates: [116.40, 39.90], description: '李自成攻入北京，崇祯帝自缢于煤山，明朝灭亡。吴三桂引清军入关。', importance: 3 },
  { year: 1689, title: '尼布楚条约', category: '外交', region: 'china', coordinates: [116.40, 39.90], description: '中俄签订《尼布楚条约》，从法律上肯定黑龙江和乌苏里江流域包括库页岛在内的广大地区属于中国。', importance: 2 },
  { year: 1839, title: '虎门销烟', category: '政治', region: 'china', coordinates: [113.65, 22.95], description: '林则徐在广东虎门海滩公开销毁鸦片 237 万斤，鸦片战争导火索。', importance: 2 },
  { year: 1840, title: '鸦片战争', category: '军事', region: 'china', coordinates: [113.65, 22.95], description: '英国发动鸦片战争，1842 年《南京条约》签订，割香港岛、赔款 2100 万银元，五口通商，沦为半殖民地半封建社会。', importance: 3 },
  { year: 1851, title: '太平天国', category: '政治', region: 'china', coordinates: [108.95, 23.16], description: '洪秀全在广西金田起义，建号太平天国，定都天京（南京）。', importance: 2 },
  { year: 1860, title: '英法联军火烧圆明园', category: '军事', region: 'china', coordinates: [116.31, 39.99], description: '英法联军攻入北京，洗劫并焚毁圆明园，中国文物损失惨重。', importance: 2 },
  { year: 1894, title: '甲午战争', category: '军事', region: 'china', coordinates: [123.43, 41.81], description: '日本发动甲午战争，北洋水师全军覆没，1895 年《马关条约》签订，割台湾、辽东半岛，赔款 2 亿两白银。', importance: 2 },
  { year: 1898, title: '戊戌变法', category: '政治', region: 'china', coordinates: [116.40, 39.90], description: '康有为、梁启超推动戊戌变法，103 天后被慈禧太后镇压，谭嗣同等"六君子"就义。', importance: 2 },
  { year: 1900, title: '八国联军侵华', category: '军事', region: 'china', coordinates: [116.40, 39.90], description: '英、法、德、俄、美、日、意、奥八国联军侵华，1901 年《辛丑条约》签订，赔款 4.5 亿两白银。', importance: 2 },
  { year: 1911, title: '辛亥革命', category: '政治', region: 'china', coordinates: [114.30, 30.59], description: '武昌起义爆发，各省响应，1912 年中华民国成立，清帝退位，结束 2000 多年帝制。', importance: 3 },
  { year: 1919, title: '五四运动', category: '政治', region: 'china', coordinates: [116.40, 39.90], description: '巴黎和会外交失败引发五四运动，工人阶级走上历史舞台，马克思主义在中国传播。', importance: 2 },
  { year: 1937, title: '七七事变', category: '军事', region: 'china', coordinates: [116.31, 39.99], description: '日军在卢沟桥发动事变，全民族抗战爆发。', importance: 3 },
  { year: 1945, title: '抗日战争胜利', category: '军事', region: 'china', coordinates: [116.40, 39.90], description: '日本宣布无条件投降，抗日战争胜利，第二次世界大战结束。', importance: 3 },
  { year: 1949, title: '中华人民共和国成立', category: '政治', region: 'china', coordinates: [116.40, 39.90], description: '毛泽东在北京天安门宣告中华人民共和国成立，中国进入新民主主义社会。', importance: 3 },
  { year: 1978, title: '改革开放', category: '政治', region: 'china', coordinates: [116.40, 39.90], description: '中共十一届三中全会召开，邓小平主导改革开放，中国经济起飞。', importance: 3 },
]

// 过滤已存在
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