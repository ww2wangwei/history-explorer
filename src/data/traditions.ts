/**
 * traditions.ts — 中国传统条目数据
 *
 * 13 个子分类（与用户的"全传统"板块一一对应）：
 *  - history 子分类 33 条（3 综合主题 + 30 朝代，按《半小时漫画中国史》目录）
 *  - 其他 12 子分类各 3-4 条（哲学/科技各 4，geography-regional 30 条地域文化，其余 3）
 *  - 总计 98 条种子数据
 *
 * 字段：
 *  - id: kebab-case slug
 *  - category: TraditionCategory（见下）
 *  - title: 中文标题
 *  - summary: 50-100 字中文摘要
 *  - era: 主要朝代/年代范围（可选）
 *  - figure: 关键人物（可选）
 *  - imageKeyword: Bing 检索关键词（可选）
 *  - imageUrl: 公共版权图片 URL（可选，Wikimedia Commons 优先）
 */

/** 12 个传统子分类（与用户的"全传统"板块列表一一对应） */
export const TRADITION_CATEGORIES = [
  'history',    // 中国人的历史
  'family',     // 中国人的家
  'geography-regional', // 地域文化
  'myth',       // 中国人的神话
  'philosophy', // 中国人的哲学
  'script',     // 中国人的文字
  'literature', // 中国人的文学
  'art',        // 中国人的艺术
  'calendar',   // 中国人的历法和节气
  'ritual',     // 中国人的礼仪与制度
  'food',       // 中国人的衣食
  'housing',    // 中国人的住行
  'tech',       // 中国人的科技
] as const
export type TraditionCategory = typeof TRADITION_CATEGORIES[number]

/** 单条传统条目 */
export interface TraditionItem {
  id: string
  category: TraditionCategory
  title: string
  summary: string           // 50-100 字摘要
  era?: string              // 主要朝代，如 "春秋战国" / "唐宋" / "先秦"
  figure?: string           // 关键人物（可选）
  imageKeyword?: string     // Bing 检索关键词（可选）
  imageUrl?: string         // 公共版权图片 URL（可选，Wikimedia Commons 优先）
  fullContent?: string      // 弹窗正文 100-300 字（可选）
}

/** 种子数据：每类 3-4 条，共 41 条（按史实） */
export const TRADITIONS: TraditionItem[] = [
  // history (4)
  { id: 'tr-history-2', category: 'history', title: '秦汉大一统', summary: '首次大一统：书同文、车同轨、行同伦；汉承秦制，独尊儒术。', era: 'BC 221 ~ AD 220' },
  { id: 'tr-history-3', category: 'history', title: '唐宋盛世', summary: '唐代开放包容，宋代文治天下；科举成熟、商业繁荣、文化达顶峰。', era: 'AD 618 ~ AD 1279' },
  { id: 'tr-history-4', category: 'history', title: '明清转型', summary: '明清专制强化、科举僵化、商品经济萌芽、西方叩关——传统社会走向近代。', era: 'AD 1368 ~ AD 1912' },
  { id: 'tr-history-intro', category: 'history', title: '引子', summary: '8000 多年前的"擀面杖" — 远古人类最早的研磨工具，文明从一块磨石开始。', era: '8000 BC 前', imageKeyword: 'ancient grinding stone tool neolithic china', fullContent: '在新石器时代早期，生活在黄河流域的先民已经学会用石头研磨谷物。这根看似普通的"擀面杖"，实则是人类从采集走向定居、从狩猎迈向农耕的关键工具。它意味着人类开始改造自然、储存食物，也为后来陶器与农业的诞生埋下伏笔。这是最朴素的文明起点。' },
  { id: 'tr-history-yanying', category: 'history', title: '炎黄子孙', summary: '为什么我们都是炎黄子孙？传说中两个部落联盟奠定了华夏族群基础。', era: '约 BC 5000', figure: '炎帝 / 黄帝', imageKeyword: 'yan di huang di tribal legends china', fullContent: '传说炎帝（神农氏）尝百草、发明农业，黄帝轩辕氏造车舟、创文字。两个部落联盟在黄河中上游崛起，经过阪泉之战、涿鹿之战后融合为一。蚩尤部落战败后部分融入华夏。九黎、三苗、羌、狄等族群也在这一时期与华夏互动。"炎黄子孙"自此成为中华民族的集体记忆。' },
  { id: 'tr-history-dongyi', category: 'history', title: '东夷人', summary: '6500 多年前的"山东人" — 东部沿海的史前文化先民，与海岱文明密切相关。', era: '约 BC 4500', imageKeyword: 'dongyi tribal culture shandong neolithic', fullContent: '东夷是华夏东部沿海及黄河下游地区众多部落的统称，以山东大汶口文化、龙山文化为代表。他们制作精美的黑陶和蛋壳陶，掌握了玉器加工技术。传说中太昊、少昊、舜、皋陶、伯益等都出自东夷。东夷与华夏经过长期战争与融合，最终成为中华文明的多元源头之一。' },
  { id: 'tr-history-miaoyao', category: 'history', title: '苗瑶人', summary: '5000 多年前的"两湖人" — 长江中游的史前族群，后部分南迁为苗瑶等民族。', era: '约 BC 3000', figure: '蚩尤', imageKeyword: 'miaoyao tribal yangtze river hunan', fullContent: '苗瑶先民活动于长江中游，以湖南、湖北为中心。涿鹿之战中蚩尤战败后，部分族人南迁至湘西、黔东南，形成后来的苗族；另一支沿东南方向迁徙，演变为瑶族、畲族等。他们在历史上多次起义反抗中原王朝，文化中保留了强烈的迁徙记忆与图腾崇拜。' },
  { id: 'tr-history-liangzhu', category: 'history', title: '良渚人', summary: '5000 多年前的"江南人" — 长江下游玉器文明，神徽与水利工程震惊世界。', era: '约 BC 3300-2300', imageKeyword: 'liangzhu jade culture ancient china', fullContent: '良渚文化是东亚最早的国家形态之一，以浙江余杭良渚遗址命名。其玉琮上的神人兽面纹是中国最早的"国家 logo"。良渚人修建了大型水利工程——由 11 条水坝组成的防洪系统，是中国最早的大型公共工程。神权与王权合一，玉器是身份等级的标志。' },
  { id: 'tr-history-hongshan', category: 'history', title: '红山人', summary: '5000 多年前的红山"老住户" — 西辽河流域玉龙女神庙，开启北方文明。', era: '约 BC 4700', imageKeyword: 'hongshan jade dragon neolithic culture', fullContent: '红山文化以辽西红山命名，出土了著名的玉龙、C 形龙和泥塑女神头像。其玉器制作精美，是中国龙文化的源头之一。红山人已经出现神权崇拜、祖先祭祀，玉龙可能是沟通天地神灵的礼器。玉猪龙、勾云形玉佩等器物，显示出北方文明与中原的平行发展。' },
  { id: 'tr-history-shimao', category: 'history', title: '石峁古城', summary: '4000 多年前的"石头王国" — 陕西神木发现的史前最大城址，皇权雏形。', era: '约 BC 2300-1800', imageKeyword: 'shimao stone fortress prehistoric china', fullContent: '石峁遗址位于陕西神木，是东亚乃至世界史前最大城址，面积约 425 万平方米。皇城台、宫城、内城、外城层层嵌套，防御体系严密。出土石雕人面像、鳄鱼骨板、口簧等，显示与中原龙山文化和北方草原文化的互动。石峁可能是中国第一个"国家"的雏形。' },
  { id: 'tr-history-yaoshunyu', category: 'history', title: '尧舜禹', summary: '传说中的上古帝王 — 禅让制与世袭制的交替，部落联盟向国家过渡。', era: '约 BC 2300', figure: '尧 / 舜 / 禹', imageKeyword: 'yao shun yu ancient chinese emperors', fullContent: '尧舜禹时代是禅让制的高峰：尧让位于舜，舜让位于禹。但禹传子启，世袭制取代禅让，中国第一个王朝"夏"由此诞生。鲧禹治水是这一时期的标志性事件——大禹"三过家门而不入"，疏导而非堵塞的治水理念，奠定了中原农业文明的基础。虞舜时期的"象刑"和"明刑弼教"是早期法治萌芽。' },
  { id: 'tr-history-xia', category: 'history', title: '夏朝', summary: '拥有"黑科技"的"内向"王朝 — 中国第一个王朝，二里头遗址揭示青铜文明。', era: 'BC 2070-1600', figure: '大禹 / 启', imageKeyword: 'xia dynasty erlitou bronze china', fullContent: '夏朝是中国史书记载的第一个王朝，大禹治水后传位于启，世袭制取代禅让制。二里头遗址可能是夏代都城，其绿松石龙形器、青铜爵等揭示了夏代的青铜文明。夏代已有历法（《夏小正》）、水利工程和早期国家机器。"内向"在于夏人较少对外扩张，主要治理中原水患与部落。' },
  { id: 'tr-history-shang', category: 'history', title: '商朝', summary: '打打杀杀的王朝 — 商汤伐桀、盘庚迁殷、妇好征羌，甲骨文与青铜器鼎盛。', era: 'BC 1600-1046', figure: '商汤 / 盘庚 / 妇好', imageKeyword: 'shang dynasty yinxu oracle bone bronze', fullContent: '商朝以殷商为代表，盘庚迁殷后稳定 270 余年。商代最大成就是甲骨文 — 刻在龟甲兽骨上的占卜记录，是中国已知最早的成熟文字。青铜器制作达到当时世界顶峰，司母戊鼎重 832 公斤。妇好是中国最早的女将军，率军征羌、土方、夷方。商纣王因暴政亡国，《封神榜》以此为蓝本。' },
  { id: 'tr-history-shu', category: 'history', title: '神秘的古蜀人', summary: '一群沉迷于和老祖宗沟通的人 — 三星堆、金沙遗址，出土青铜神树与面具。', era: '约 BC 1700-1200', imageKeyword: 'sanxingdui bronze mask ancient shu', fullContent: '古蜀文明以三星堆和金沙遗址为代表，与中原商周同期但独立发展。三星堆出土的青铜神树（高 3.96 米）、纵目面具、青铜立人像，工艺令人叹为观止。古蜀人祭祀太阳神、崇拜祖先，黄金面具、太阳神鸟金箔显示其独特信仰。这一文明突然消失，可能与洪水或战争有关。' },
  { id: 'tr-history-zhou', category: 'history', title: '周人', summary: '一群来自大西北的种田能手 — 周族崛起于渭水流域，农牧混合经济。', era: '约 BC 1100', figure: '古公亶父 / 季历', imageKeyword: 'zhou tribe qishan weishui china agriculture', fullContent: '周族起源于渭水流域的黄土高原，擅长农业。古公亶父（周太王）受薰育戎狄压迫，迁至岐山下的周原，建城邑、设官吏、改革习俗，奠定了周人崛起的根基。季历时期周人开始与商王朝合作征伐西戎。文王姬昌继位后，礼贤下士、积蓄力量，为武王伐纣做准备。' },
  { id: 'tr-history-xizhou', category: 'history', title: '西周', summary: '开始讲"礼"的时代 — 分封制、宗法制、礼乐文明奠定中华秩序。', era: 'BC 1046-771', figure: '周武王 / 周公', imageKeyword: 'western zhou dynasty bronze ritual vessel', fullContent: '公元前 1046 年，武王伐纣，牧野之战后建立西周。周公旦制礼作乐，建立了完整的宗法分封制：天子-诸侯-卿大夫-士层层分封，嫡长子继承为核心。周礼影响后世三千年，虽经战乱摧毁，核心精神始终延续。共和元年（BC 841）是中国确切纪年的开始。' },
  { id: 'tr-history-chunqiu', category: 'history', title: '春秋', summary: '"礼仪第一，争霸第二"的时代 — 周王室衰微，诸侯会盟争霸。', era: 'BC 770-476', figure: '孔子 / 老子', imageKeyword: 'spring autumn period chinese states ritual', fullContent: '公元前 770 年周平王东迁洛邑，东周开始。诸侯不再朝觐周王，形成齐桓公、晋文公、楚庄王等"春秋五霸"轮流坐庄的局面。诸侯通过会盟（如葵丘之盟）维持表面秩序，实则战争频仍。孔子修订《春秋》，老子著《道德经》，"礼乐崩坏"反而催生百家争鸣。' },
  { id: 'tr-history-zhanguo', category: 'history', title: '战国', summary: '"不是你死，就是我亡"的时代 — 七雄并立，变法图强。', era: 'BC 475-221', figure: '商鞅 / 苏秦', imageKeyword: 'warring states period qin shuihu', fullContent: '战国时期只剩齐、楚、燕、韩、赵、魏、秦七雄和少数小国。各国内部掀起变法浪潮：魏文侯用李悝、商鞅在秦变法最为彻底。秦以法家立国，军功爵制激发战力；齐设稷下学宫招揽百家；赵武灵王胡服骑射；魏、楚也各有改革。"合纵连横"的外交博弈与残酷战争交织，公元前 221 年秦灭六国终结乱世。' },
  { id: 'tr-history-qinren', category: 'history', title: '秦人', summary: '"一统天下"的竟然是一群养马人 — 秦族崛起于陇西，牧马立国。', era: '约 BC 900-221', figure: '非子 / 秦襄公', imageKeyword: 'qin people horse breeding longxi', fullContent: '秦人起源于今甘肃东南的陇西地区，始祖非子以养马有功被周孝王封于秦邑，成为周的附庸。秦襄公因护送周平王东迁有功，被封为诸侯。秦人长期被视为"西陲"戎狄，但他们通过与戎狄的军事对抗，锻炼出坚韧的战斗力。秦穆公任用百里奚，称霸西戎，为后世秦始皇统一六国奠定基础。' },
  { id: 'tr-history-qin', category: 'history', title: '秦朝', summary: '秦始皇的"大机器" — 书同文、车同轨、行同伦、法家治国。', era: 'BC 221-206', figure: '秦始皇 / 李斯', imageKeyword: 'qin dynasty terracotta warriors', fullContent: '公元前 221 年，秦王嬴政完成统一大业，建立中国第一个中央集权的多民族国家。秦始皇推行一系列影响深远的制度：书同文（小篆）、车同轨、统一度量衡、北击匈奴、修万里长城、南征百越、修灵渠、统一货币。中央设三公九卿，地方推行郡县制。法家思想治国的"大机器"高效但严苛，秦二世而亡仅 15 年，但奠定了中国两千年帝制的基本框架。' },
  { id: 'tr-history-han', category: 'history', title: '汉朝', summary: '"长寿"的汉王朝 — 文景之治、汉武盛世、独尊儒术。', era: 'BC 202-AD 220', figure: '刘邦 / 汉武帝', imageKeyword: 'han dynasty silk road changan', fullContent: '汉朝分西汉（前 202-9）与东汉（25-220），共 400 余年，是中国第一个"长寿"的大一统王朝。文景之治以黄老无为先，开创盛世；汉武帝"罢黜百家，独尊儒术"，北击匈奴凿空西域，张骞通使开辟丝绸之路，卫青霍去病封狼居胥。汉朝确立的儒家正统、外戚宦官制度、察举制等深刻影响后世。' },
  { id: 'tr-history-sanguo', category: 'history', title: '三国时期', summary: '不稳定的"三足鼎立" — 魏蜀吴三分天下，英雄与谋略的时代。', era: 'AD 220-280', figure: '曹操 / 诸葛亮', imageKeyword: 'three kingdoms period chinese', fullContent: '东汉末年黄巾起义、董卓乱政后，形成魏、蜀、吴三国鼎立局面。220 年曹丕代汉建魏，221 年刘备称帝建蜀，229 年孙权称帝建吴。三国仅 60 年，但英雄辈出：曹操的雄才、诸葛亮的智谋、周瑜的儒雅、关羽的忠义。这一时期佛教开始传入中国，文学上"建安七子"引领风骚。' },
  { id: 'tr-history-beichao', category: 'history', title: '五胡十六国与北朝', summary: '少数民族入主中原 — 匈奴、鲜卑、羯、氐、羌建立北方政权。', era: 'AD 304-589', imageKeyword: 'northern dynasties five barbars china', fullContent: '西晋末年八王之乱后，匈奴刘渊、羯族石勒、氐族苻健、羌族姚苌、鲜卑拓跋氏等"五胡"建立十余国，北方进入大分裂。前秦苻坚一度统一北方，但淝水之战败于东晋后瓦解。北魏孝文帝推行汉化改革——迁都洛阳、改汉姓、穿汉服、说汉话、与汉族通婚，推动民族大融合。这一时期佛教大盛，云冈、龙门石窟开凿。' },
  { id: 'tr-history-nanbeichao', category: 'history', title: '东晋与南朝', summary: '流水的皇帝，铁打的世家 — 门阀士族与皇权共治南方。', era: 'AD 317-589', imageKeyword: 'eastern jin southern dynasties china aristocracy', fullContent: '317 年司马睿南渡建康（今南京），建立东晋。晋宋齐梁陈五朝更迭，共 272 年，史称"南朝"。这一时期门阀士族（王、谢、袁、萧等）掌控政治与社会资源，"上品无寒门，下品无士族"。宋武帝刘裕代晋开启南朝，但皇权始终受制于世家大族。梁武帝萧衍崇佛，却因侯景之乱饿死台城——世家门阀的固化是南朝始终"流水的皇帝"的根因。' },
  { id: 'tr-history-sui', category: 'history', title: '隋朝', summary: '"来也匆匆，去也匆匆"的朝代 — 短暂但结束分裂，开皇之治。', era: 'AD 581-618', figure: '隋文帝 / 隋炀帝', imageKeyword: 'sui dynasty grand canal yangdi', fullContent: '隋朝仅 38 年，但影响深远。隋文帝杨坚结束南北朝分裂，开皇之治下府库充盈、刑政宽简，确立三省六部制、科举制雏形。隋炀帝杨广开通大运河、营建东都洛阳、三征高句丽，劳民伤财导致天下大乱。但大运河贯通南北，沟通了经济命脉，惠及唐宋。隋朝是中华文明从分裂走向统一的转折期。' },
  { id: 'tr-history-tang', category: 'history', title: '唐朝', summary: '自信、从容的朝代 — 贞观之治、开元盛世，开放包容的国际时代。', era: 'AD 618-907', figure: '唐太宗 / 武则天', imageKeyword: 'tang dynasty changan capital cosmopolitan', fullContent: '唐朝是中国历史上最自信、最国际化的时代。贞观之治（唐太宗）、开元盛世（唐玄宗）创造空前繁荣，长安城人口过百万，是当时世界最大的国际都市。科举制成熟，诗赋取士让寒门子弟有了上升通道。武则天是中国唯一的女皇帝，诗仙李白、诗圣杜甫记录盛世气象。安史之乱后唐朝由盛转衰，藩镇割据埋下五代十国的种子。' },
  { id: 'tr-history-wudai', category: 'history', title: '五代十国', summary: '千万不要穿越的朝代 — 短短 53 年五代更迭、十国分立。', era: 'AD 907-979', imageKeyword: 'five dynasties ten kingdoms chaos china', fullContent: '唐朝灭亡后，中国再次陷入大分裂。北方依次出现后梁、后唐、后晋、后汉、后周五个短命王朝，平均每个朝代不到 11 年；南方则有前蜀、后蜀、吴、南唐、吴越、闽、楚、南汉、南平、北汉等十国并存。这一时期武夫当国，节度使凭武力夺取政权，"天子"如走马灯。但乱世也孕育了统一，后周世宗柴荣改革为赵匡胤建立北宋奠定了基础。' },
  { id: 'tr-history-song', category: 'history', title: '宋朝', summary: '文科第一名，打仗不太行 — 商业繁荣、文化巅峰、武力疲弱。', era: 'AD 960-1279', figure: '赵匡胤 / 苏轼', imageKeyword: 'song dynasty hangzhou commerce invention', fullContent: '宋朝分为北宋（960-1127）与南宋（1127-1279），共 319 年。陈桥兵变赵匡胤黄袍加身，"杯酒释兵权"解决藩镇割据。宋朝"重文轻武"，科举扩招、士大夫政治达到顶峰。商业革命催生世界最早的纸币"交子"，活字印刷、指南针、火药在宋代广泛应用。苏轼、李清照、辛弃疾代表的宋词达到文学巅峰。但"靖康之耻"暴露军事疲弱，最终亡于蒙古铁骑。' },
  { id: 'tr-history-yuan', category: 'history', title: '元', summary: '草原战斗民族的天下 — 蒙古铁骑横扫欧亚，疆域空前。', era: 'AD 1271-1368', figure: '成吉思汗 / 忽必烈', imageKeyword: 'yuan dynasty mongol empire kublai khan', fullContent: '1206 年铁木真统一蒙古诸部，称成吉思汗。蒙古帝国在三代人手里扩张到欧亚大陆：灭西夏、灭金、灭大理、灭南宋。1271 年忽必烈定国号"大元"，1279 年崖山之战彻底灭宋。元朝是中国历史上第一个由少数民族建立的大一统王朝，行省制度影响深远。马可·波罗笔下的元大都（北京）是世界级都市。但民族压迫政策激化矛盾，不足百年亡于明初。' },
  { id: 'tr-history-yuanhou', category: 'history', title: '元之后的蒙古人', summary: '哪儿来的，回哪儿去了吗？ — 北元与鞑靼、瓦剌的分化。', era: 'AD 1368-17世纪', imageKeyword: 'northern yuan mongol khatagin tatars', fullContent: '1368 年明军攻陷大都，元顺帝北逃应昌，北元政权继续存在近 30 年，后分裂为鞑靼（东部蒙古）和瓦剌（西部蒙古）。瓦剌在 1449 年土木堡之变中俘虏明英宗，1500 年达延汗短暂统一蒙古。明嘉靖年间俺答汗与明朝达成"隆庆和议"，恢复边境贸易。清代科尔沁、准噶尔等蒙古部落或归附或被征服，最终纳入清朝版图。蒙古人在草原上以"盟旗制"延续，直至近现代。' },
  { id: 'tr-history-ming', category: 'history', title: '明朝', summary: '古怪皇帝一箩筐 — 朱元璋废丞相、郑和下西洋、崇祯自缢。', era: 'AD 1368-1644', figure: '朱元璋 / 张居正', imageKeyword: 'ming dynasty forbidden city zheng he', fullContent: '1368 年朱元璋建立明朝，废除丞相、设内阁，锦衣卫监控百官，洪武朝杀功臣十余万。朱棣靖难之役后迁都北京，派郑和七下西洋（1405-1433），最远抵达非洲东岸。明朝中后期皇帝多怠政（万历 28 年不上朝）、宦官专权（魏忠贤、刘瑾），东林党争消耗国力。张居正改革"一条鞭法"短暂续命，但万历三大征耗尽国库。1644 年李自成攻入北京，崇祯帝自缢煤山，明朝亡。' },
  { id: 'tr-history-nvzhen', category: 'history', title: '女真人入主中原', summary: '女真人从哪儿来？ — 建州女真崛起，建立后金→清。', era: 'AD 1616-1644', figure: '努尔哈赤', imageKeyword: 'jurchen manchu qing dynasty nuzhen', fullContent: '女真是满族的前身，起源于东北长白山地区，先后臣服于辽、金、明。明朝设建州卫管辖女真各部。1583 年努尔哈赤以"十三副遗甲"起兵，统一女真各部，1616 年建立后金，1636 年皇太极改国号为大清。女真（满洲）推行八旗制度，创满文，降服漠南蒙古。林丹汗败亡后，皇太极得以全力攻明。' },
  { id: 'tr-history-qing', category: 'history', title: '清朝', summary: '全面"打补丁"的王朝 — 康乾盛世后鸦片战争、戊戌变法、辛亥革命。', era: 'AD 1644-1912', figure: '康熙 / 雍正 / 乾隆', imageKeyword: 'qing dynasty forbidden city kangxi qianlong', fullContent: '1644 年清军入关，经康雍乾三朝达到"康乾盛世" — 疆域空前（1300 万平方公里）、人口破 4 亿、收复台湾、册封达赖班禅。但盛世之下危机四伏：文字狱钳制思想、八旗子弟腐化、闭关锁国。1840 年鸦片战争打开国门，此后太平天国、甲午战争、戊戌变法、辛亥革命接连不断。1912 年溥仪退位，中国两千多年帝制终结。清朝是中华帝国向近代民族国家转型的关键过渡期。' },
  // family (3)
  { id: 'tr-family-1', category: 'family', title: '宗法制度', summary: '嫡长子继承、大宗小宗、家谱世系——以血缘为骨架的政治伦理。', era: '西周 ~ 清' },
  { id: 'tr-family-2', category: 'family', title: '宗祠与族田', summary: '聚族而居，祠堂祭祀，族田助学——宗族自治的物质基础。', era: '宋 ~ 清' },
  { id: 'tr-family-3', category: 'family', title: '婚丧礼俗', summary: '六礼（纳采、问名、纳吉、纳征、请期、亲迎）与丧服五等——人生礼仪的礼仪传统。', era: '先秦 ~ 当代' },
  // myth (3)
  { id: 'tr-myth-1', category: 'myth', title: '盘古开天', summary: '天地混沌如鸡子，盘古生其中；一日九变，神于天，圣于地。', era: '上古神话' },
  { id: 'tr-myth-2', category: 'myth', title: '女娲造人', summary: '女娲黄土造人、炼石补天——母系社会的女神崇拜与灾难叙事。', era: '上古神话' },
  { id: 'tr-myth-3', category: 'myth', title: '三皇五帝', summary: '伏羲画卦、神农尝百草、黄帝战蚩尤——文明初祖的传说谱系。', era: '上古神话' },
  // philosophy (4)
  { id: 'tr-philosophy-1', category: 'philosophy', title: '儒家', summary: '孔子、孟子、荀子：仁义礼智，修齐治平——两千年来主流意识形态。', era: '春秋 ~ 当代' },
  { id: 'tr-philosophy-2', category: 'philosophy', title: '道家', summary: '老子、庄子：道法自然、无为而治——中华精神的另一极。', era: '春秋战国' },
  { id: 'tr-philosophy-3', category: 'philosophy', title: '佛家', summary: '汉代传入，与儒道合流形成三教合一；禅宗、宋明理学皆受其影响。', era: '汉 ~ 当代' },
  { id: 'tr-philosophy-4', category: 'philosophy', title: '诸子百家', summary: '墨、法、名、阴阳、纵横……春秋战国的思想盛宴。', era: '春秋战国' },
  // script (3)
  { id: 'tr-script-1', category: 'script', title: '甲骨文', summary: '商代契刻于龟甲兽骨——中国最早的成熟文字，也是汉字的源头。', era: '商' },
  { id: 'tr-script-2', category: 'script', title: '篆隶楷行草', summary: '从篆书到草书，汉字五体的演变折射书写工具与审美变迁。', era: '秦 ~ 当代' },
  { id: 'tr-script-3', category: 'script', title: '汉字简化', summary: '20 世纪推广简化字——千年汉字传统与现代普及的张力。', era: '近现代' },
  // literature (3)
  { id: 'tr-literature-1', category: 'literature', title: '诗经楚辞', summary: '中国文学的两大源头：黄河的现实主义与长江的浪漫主义。', era: '先秦' },
  { id: 'tr-literature-2', category: 'literature', title: '唐诗宋词', summary: '一个把诗写到极致、把词写到骨子里的时代。', era: '唐 ~ 宋' },
  { id: 'tr-literature-3', category: 'literature', title: '四大名著', summary: '《三国》《水浒》《西游》《红楼》——章回小说的巅峰。', era: '明 ~ 清' },
  // art (3)
  { id: 'tr-art-1', category: 'art', title: '山水画', summary: '从展子虞到王希孟——中国人如何用毛笔"看"山水。', era: '魏晋 ~ 当代' },
  { id: 'tr-art-2', category: 'art', title: '青花瓷', summary: '白地蓝花，从元代走向世界——陶瓷工艺的极致。', era: '元 ~ 清' },
  { id: 'tr-art-3', category: 'art', title: '园林', summary: '移步换景，咫尺山林——中国独特的空间美学。', era: '明 ~ 清' },
  // calendar (3)
  { id: 'tr-calendar-1', category: 'calendar', title: '农历（夏历）', summary: '阴阳合历：月相定月、太阳定年——指导农耕数千年。', era: '夏 ~ 当代' },
  { id: 'tr-calendar-2', category: 'calendar', title: '二十四节气', summary: '立春、惊蛰、清明……太阳在黄道上的 24 个刻度，已列入人类非遗。', era: '先秦 ~ 当代' },
  { id: 'tr-calendar-3', category: 'calendar', title: '干支纪年', summary: '天干地支 60 年一轮——纪年、纪月、纪日、纪时皆用之。', era: '殷商 ~ 当代' },
  // ritual (3)
  { id: 'tr-ritual-1', category: 'ritual', title: '科举制度', summary: '从隋唐到清末 1300 年——"朝为田舍郎，暮登天子堂"的社会流动机制。', era: '隋 ~ 清' },
  { id: 'tr-ritual-2', category: 'ritual', title: '五礼制度', summary: '吉、凶、军、宾、嘉——覆盖政治、社会、人生所有仪节。', era: '先秦 ~ 清' },
  { id: 'tr-ritual-3', category: 'ritual', title: '礼与法', summary: '"礼者禁于将然之前，法者禁于已然之后"——德治与法治的双轨。', era: '先秦 ~ 当代' },
  // food (3)
  { id: 'tr-food-1', category: 'food', title: '八大菜系', summary: '鲁川粤苏闽浙湘徽——四方水土养出四方滋味。', era: '清 ~ 当代' },
  { id: 'tr-food-2', category: 'food', title: '丝绸与棉麻', summary: '从桑蚕到棉花——中国人 5000 年的纤维革命。', era: '新石器 ~ 当代' },
  { id: 'tr-food-3', category: 'food', title: '茶', summary: '从神农尝百草到陆羽《茶经》——一片树叶如何成为国饮。', era: '唐 ~ 当代' },
  // housing (3)
  { id: 'tr-housing-1', category: 'housing', title: '四合院', summary: '北方的合院式住宅：方正对称、伦理秩序、长幼有序。', era: '元 ~ 当代' },
  { id: 'tr-housing-2', category: 'housing', title: '江南水乡', summary: '粉墙黛瓦、小桥流水——水网地带的人居智慧。', era: '明 ~ 当代' },
  { id: 'tr-housing-3', category: 'housing', title: '交通工具', summary: '舟车、轿马、独轮车、漕运——传统中国的出行图谱。', era: '先秦 ~ 清' },
  // tech (4)
  { id: 'tr-tech-1', category: 'tech', title: '四大发明', summary: '造纸、印刷、火药、指南针——重塑世界历史的四项技术。', era: '汉 ~ 宋' },
  { id: 'tr-tech-2', category: 'tech', title: '天文历法', summary: '从甲骨卜辞到郭守敬《授时历》——世界上连续最久的天文观测。', era: '商 ~ 元' },
  { id: 'tr-tech-3', category: 'tech', title: '中医中药', summary: '《黄帝内经》《伤寒论》、针灸、本草——以另一种方式理解人体。', era: '先秦 ~ 当代' },
  { id: 'tr-tech-4', category: 'tech', title: '水利与农业', summary: '都江堰、坎儿井、桑基鱼塘——水利工程塑造农业文明。', era: '先秦 ~ 当代' },

  // geography-regional (30 — 第1页行政区划+北方 11 + 第2页各地域 19)
  { id: 'tr-region-intro', category: 'geography-regional', title: '引子', summary: '中国人的家 — 地理、血缘、文化三重意义上的“家“，是安身立命之所。', era: '亘古至今', imageKeyword: 'chinese homeland culture family', fullContent: '中国人谈“家“，往往包含三层含义：地理上的故土、血缘上的宗族、文化上的籍贯。既有安土重迁的农耕情结，也有“举头望明月，低头思故乡“的游子情怀；既讲“修齐治平“的家国天下，也讲“父母在，不远游“的伦理本位。从一片土地到一个姓氏再到一种方言，“家“塑造了我们理解世界的方式。' },
  { id: 'tr-region-jiuzhou', category: 'geography-regional', title: '天下九州', summary: '古老的华夏九州还在吗？源自《禹贡》的地理区划，影响后世三千年。', era: 'BC 2000 ~ 今', imageKeyword: 'jiuzhou nine provinces ancient china', fullContent: '“九州“最早见于《禹贡》，将天下划分为冀、兖、青、徐、扬、荆、豫、梁、雍九州，对应大禹治水后的地理认知。这一划分虽不严格对应行政区划，却奠定了中国人“天下“的原型：冀州为华夏之中心，扬州为东南之尾，雍州据西北之险。九州概念影响三千年，李白“九州生气恃风雷“、陆游“但悲不见九州同“皆引此意象。' },
  { id: 'tr-region-xingsheng', category: 'geography-regional', title: '从氏族部落到行省', summary: '“省“是怎么来的？从部落联盟到州郡，再到行省制——地方治理的演化。', era: '先秦 ~ 当代', imageKeyword: 'xing sheng provinces chinese governance', fullContent: '中国地方治理经历漫长演化：远古部落联盟以血缘为纽带，夏商周封建以宗法分封；秦废封建设郡县；汉沿用郡国并行；隋唐设州县、道；宋设路；元朝创立“行中书省“，即“行省“，今日省制由此奠基。明清沿用并细化为府州县，省界犬牙交错以防割据。今日中国 23 省之格局，是三千年演化的结果。' },
  { id: 'tr-region-fangqu', category: 'geography-regional', title: '山川形便和犬牙交错', summary: '中国古代行政区域划界两大原则——前者顺自然地形，后者防割据。', era: '秦 ~ 清', imageKeyword: 'chinese administrative boundaries history', fullContent: '“山川形便“以山脉、河流等自然地形为界，便于治理也符合经济文化圈；“犬牙交错“则故意打破自然边界，把不同地形区域划入同一行政区，防止地方凭借天险割据。汉武帝拆分“关中“、宋太宗让“秦凤“与“永兴“穿插、明代让湖广跨洞庭湖分南北——都是“犬牙交错“的经典案例。今日省界多承明清之制，正是这两条原则博弈的结果。' },
  { id: 'tr-region-dusheng', category: 'geography-regional', title: '历史上的都城', summary: '古人建都要“看风水“——从长安、洛阳到北京、南京，城市与权力中心。', era: 'BC 1046 ~ 1912', imageKeyword: 'chinese ancient capital changan luoyang beijing', fullContent: '中国古都讲究“龙脉“、“形胜“：长安据关中四塞，“山河襟带“；洛阳居天下之中，“宅中图大“；开封控汴河漕运之利；南京龙蟠虎踞；北京背靠燕山、南望中原。八大古都(西安、洛阳、北京、南京、开封、杭州、安阳、郑州)各有风水逻辑。从周到清，都城迁移反映经济重心由西向东、由北向南的转移轨迹。' },
  { id: 'tr-region-nanbei', category: 'geography-regional', title: '中国文化的“南北之争”', summary: '中国的南方北方到底指哪儿？秦岭-淮河线、南船北马、南米北面。', era: 'BC ~ 当代', imageKeyword: 'north south china culture difference', fullContent: '“秦岭-淮河“是中国最重要的南北分界线：此线以北属温带，旱地种麦、骑马出行、性格豪迈；此线以南属亚热带，水田种稻、行舟代步、性格细腻。“南船北马“、“南米北面“、“南甜北咸“、“南柔北刚“——这些差异源于地理气候。但中国南北之争并非绝对：江淮之间是过渡带，北方亦多细腻之人。今日方言、饮食、文学风格的差异，仍清晰可辨。' },
  { id: 'tr-region-overview', category: 'geography-regional', title: '地域文化', summary: '百里不同风，千里不同俗——中国地理与文化的多样性。', era: '亘古至今', imageKeyword: 'chinese regional culture diversity', fullContent: '“地域文化“指因地理环境、历史沿革、民族分布不同而形成的区域文化。中国地域文化类型丰富：以燕赵、齐鲁、三晋为代表的北方文化；以荆楚、巴蜀、吴越为代表的中部文化；以岭南、闽台为代表的南方文化；以及关东、关中、西域、雪域等边缘文化。各地域文化既有中华共性，又保留鲜明个性——饮食、方言、民俗、艺术、建筑皆可印证。' },
  { id: 'tr-region-yanzhao', category: 'geography-regional', title: '燕赵文化', summary: '燕赵之地自古多豪杰——河北、京津的慷慨悲歌与侠义精神。', era: '先秦 ~ 当代', imageKeyword: 'yanzhao culture hebei beijing', fullContent: '“燕赵“指今河北、北京、天津及山西东北部。战国时燕赵为北方军事强国，“燕赵多慷慨悲歌之士“(韩愈)。荆轲刺秦“风萧萧兮易水寒“、赵云长坂坡单骑救主，皆此地风骨。京畿文化大气规整——紫禁城、天坛、颐和园；河北古朴豪放——赵州桥、承德避暑山庄、直隶总督署；天津则以漕运、租界、洋务文化见长。' },
  { id: 'tr-region-shanjin', category: 'geography-regional', title: '三晋文化', summary: '中国古建文化集大成者——山西的晋商大院、彩塑壁画、云冈石窟。', era: '唐 ~ 当代', imageKeyword: 'shanjin culture shanxi ancient architecture', fullContent: '“三晋“指今山西，源自韩、赵、魏三家分晋。山西是中国古建博物馆：唐代建筑全国现存四座全在山西(南禅寺、佛光寺等)；云冈石窟凿于北魏；晋祠、应县木塔、平遥古城为世界文化遗产。晋商崛起于明清，乔家大院、王家大院、常家庄园见证“汇通天下“的辉煌。山西梆子(晋剧)、面食(刀削面、莜面栲栳栳)亦独具特色。' },
  { id: 'tr-region-qilu', category: 'geography-regional', title: '齐鲁文化', summary: '千年教育、思想、文化归齐鲁——孔孟之乡，儒家发源地。', era: 'BC 1046 ~ 当代', imageKeyword: 'qilu culture confucius shandong', fullContent: '“齐鲁“指今山东。周公封于鲁、齐太公封于齐，鲁崇礼、齐尚功。儒家创始人孔子(鲁)、孟子(邹)皆出此地，曲阜“三孔“(孔庙、孔府、孔林)是朝圣中心。泰山为五岳之首，封禅之地；崂山为道教名山。鲁菜为中国八大菜系之首，济南菜、胶东菜、孔府菜各有千秋。山东人豪爽好客、崇文重教，古代出过无数状元宰相。' },
  { id: 'tr-region-guandong', category: 'geography-regional', title: '关东文化', summary: '虽冷但热闹的大东北——白山黑水，满、汉、朝鲜族多元融合。', era: '唐 ~ 当代', imageKeyword: 'guandong culture northeast china', fullContent: '“关东“指山海关以东的东北三省(辽、吉、黑)及内蒙古东部。“白山黑水“孕育了肃慎、扶余、勿吉、靺鞨、女真等古代民族。女真人建金、后金(清)两度入主中原。闯关东是近代东北开发的关键，儒商、农耕文化与渔猎、游牧文化交融。今日东北话、二人转、东北菜(锅包肉、杀猪菜)、工业遗产与俄式建筑并存，朝鲜族、满族文化独具特色。' },
  { id: 'tr-region-neimenggu', category: 'geography-regional', title: '内蒙古草原文化', summary: '天苍苍，野茫茫，风吹草低见牛羊——游牧文明与草原精神。', era: '秦 ~ 当代', imageKeyword: 'inner mongolia grassland culture nomadic', fullContent: '内蒙古高原东起大兴安岭、西至额济纳，是游牧文明的摇篮。匈奴、鲜卑、突厥、蒙古等民族先后在此崛起。蒙古包、勒勒车、长调、呼麦、马头琴是草原文化的标志；那达慕大会承载摔跤、赛马、射箭传统。草原文化与中原农耕文化既冲突又交融——和亲、互市、战争贯穿史册。今日内蒙古仍以“风吹草低见牛羊“的壮美风光与豪迈民风著称。' },
  { id: 'tr-region-zhongzhou', category: 'geography-regional', title: '中州文化', summary: '若问古今兴废事，请看中州大地——河南中原，华夏文明腹地。', era: 'BC 2000 ~ 当代', imageKeyword: 'zhongzhou culture henan yellow river', fullContent: '“中州“指今河南，因居天下之中而得名。河南是华夏文明的腹地：裴李岗、仰韶、龙山、二里头、殷墟—安阳(商)、洛阳(十三朝古都)、开封(七朝古都)、郑州(商城)皆在河南。河洛文明是中华文明的源头，洛阳龙门石窟、嵩山少林寺、开封清明上河图、白马寺、龙门书院享誉中外。豫剧、少林功夫、汴绣、洛阳牡丹是地域文化名片。' },
  { id: 'tr-region-hui', category: 'geography-regional', title: '徽文化', summary: '十户之村不废诵读——徽商、徽派建筑、徽州朴学的皖南文化。', era: '宋 ~ 当代', imageKeyword: 'hui culture anhui merchant architecture', fullContent: '“徽文化“指皖南古徽州(今黄山市、绩溪、婺源)文化。徽商崛起于明清，与晋商齐名，“无徽不成镇“——扬州、苏州、汉口皆赖徽商繁荣。徽派建筑以白墙黛瓦、马头墙、天井为特色，西递、宏村是世界文化遗产。“徽州朴学“(乾嘉考据学派)严谨求实；新安画派、徽剧(京剧前身之一)、歙砚、徽墨皆为文化瑰宝。“十户之村不废诵读“是徽州崇文传统的写照。' },
  { id: 'tr-region-jiangxi', category: 'geography-regional', title: '江西文化', summary: '物华天宝，人杰地灵——赣鄱大地，陶渊明、王安石故里。', era: '唐 ~ 当代', imageKeyword: 'jiangxi culture ganpo tao yuanming', fullContent: '江西因赣江纵贯、鄱阳湖为最大淡水湖而简称“赣“或“赣鄱“。唐宋时期江西文化鼎盛：王勃《滕王阁序》“物华天宝，人杰地灵“千古传诵；陶渊明(九江)、王安石(抚州)、欧阳修(吉安)、文天祥(吉安)、黄庭坚(修水)皆出此地。白鹿洞书院为宋代四大书院之首；景德镇自宋元即为“瓷都“，青花、玲珑、粉彩、颜色釉冠绝天下。赣剧、采茶戏亦有特色。' },
  { id: 'tr-region-jingchu', category: 'geography-regional', title: '荆楚文化', summary: '路漫漫其修远兮，吾将上下而求索——湖北楚地，屈原精神。', era: '先秦 ~ 当代', imageKeyword: 'jingchu culture hubei chu qu yuan', fullContent: '“荆楚“指今湖北及湖南北部。楚人“筚路蓝缕，以启山林“，从祝融部落发展为春秋五霸、战国七雄之一。屈原《离骚》、《天问》、《九歌》开创楚辞，与《诗经》并称文学双壁；编钟(随州曾侯乙编钟)、漆器、丝织、楚绣是工艺代表。湖北九省通衢，武汉为辛亥革命首义之地；武当山道教圣地，黄鹤楼千古名楼。' },
  { id: 'tr-region-huxiang', category: 'geography-regional', title: '湖湘文化', summary: '潇湘美景都是诗——湖南湘楚，近代革命策源地。', era: '唐 ~ 当代', imageKeyword: 'huxiang culture hunan xiang', fullContent: '“湖湘“指今湖南。屈原《九歌》多咏潇湘。湖湘文化经世致用、心忧天下：周敦颐、王夫之、魏源、曾国藩、左宗棠、谭嗣同、黄兴、毛泽东、蔡锷皆出此地。岳麓书院“惟楚有材，于斯为盛“千年文脉。湖南人“敢为天下先“——太平天国、维新变法、辛亥革命、秋收起义皆与湘人相关。湘菜(剁椒鱼头、毛氏红烧肉)、花鼓戏、湘绣、浏阳花炮是地域标志。' },
  { id: 'tr-region-wuyue', category: 'geography-regional', title: '吴越文化', summary: '江南好，风景旧曾谙——江浙沪，吴侬软语与精致文雅。', era: '先秦 ~ 当代', imageKeyword: 'wuyue culture jiangsu zhejiang jiangnan', fullContent: '“吴越“指今江苏南部、浙江、上海及皖东南。“江南“是吴越文化的核心：苏州园林、杭州西湖、无锡太湖、绍兴兰亭皆人文渊薮。吴语(苏州话、上海话、绍兴话)以软糯著称；昆曲、评弹、苏绣、越剧、龙泉青瓷、湖笔、宣纸、湖州丝绸冠绝天下。江浙历代状元、院士人数冠全国，文人墨客辈出。江南文化精致、文雅、崇文、重商。' },
  { id: 'tr-region-min', category: 'geography-regional', title: '闽文化', summary: '山地文明和海洋文明的交汇——福建莆仙、闽南、客家、妈祖。', era: '唐 ~ 当代', imageKeyword: 'min culture fujian fuzhou xiamen', fullContent: '“闽“指福建，多山面海，“八山一水一分田“。闽文化分为闽东(福州)、闽南(厦门、泉州)、莆仙、闽北、闽西客家、畲族等亚文化。泉州为宋元“东方第一大港“，马可·波罗笔下的“光明之城“，海上丝绸之路起点。闽南话(河洛话)被称为“古汉语活化石“。妈祖信仰从莆田湄洲传至全球华人与东南亚；土楼(永定、南靖)是客家文化瑰宝。闽菜以海鲜、汤品著称。' },
  { id: 'tr-region-lingnan', category: 'geography-regional', title: '岭南文化', summary: '逛花市，喝早茶，不辞长作岭南人——广东、广西的海洋商业文化。', era: '秦 ~ 当代', imageKeyword: 'lingnan culture guangdong canton', fullContent: '“岭南“指五岭以南的广东、广西、海南、香港、澳门。岭南文化以海洋、商业、开放为特色：粤语保留古音；广府、客家、潮汕、雷州四大民系多元并存。早茶文化、煲汤、生猛海鲜、粤菜(八大菜系之一)闻名天下。广绣、潮绣、端砚、广东音乐、粤剧、岭南画派(高剑父)文化独特。广州十三行见证清代外贸繁荣；深圳、珠海引领改革开放。' },
  { id: 'tr-region-gui', category: 'geography-regional', title: '桂文化', summary: '去广西看多彩的少数民族风情——壮、侗、苗、瑶等众多少数民族。', era: '唐 ~ 当代', imageKeyword: 'guangxi culture minority zhuang', fullContent: '“桂“指广西，简称“桂“，因桂林而闻名。广西是中国少数民族最多的省区之一：壮族占 32%，侗、苗、瑶、彝、京、仫佬、毛南、回等 11 个世居民族。桂林山水甲天下，漓江、阳朔、兴安灵渠、龙脊梯田是自然人文奇观。壮族“三月三“歌节、铜鼓楼(侗族)、风雨桥、壮锦、绣球是地域标志。桂北与桂南文化差异显著，桂林文化更接近湘楚，东南部靠近粤文化。' },
  { id: 'tr-region-dianyun', category: 'geography-regional', title: '滇云文化', summary: '靠山吃山，靠水吃水——云南 25 个世居民族的多元文化。', era: '先秦 ~ 当代', imageKeyword: 'yunnan dianyun culture minority', fullContent: '“滇云“指云南，是中国民族最多的省份——25 个世居民族、16 个跨境民族。滇池周边是古滇国故地，晋宁石寨山青铜器见证古滇文明。东巴文(纳西族)被誉为“活着的象形文字“。大理国(白族)与南诏国绵延千年；丽江古城为世界文化遗产；西双版纳傣族泼水节、彝族火把节、白族三道茶、哈尼梯田(红河)展现多彩风情。云南是“人类学博物馆“，也是茶马古道、南方丝绸之路要冲。' },
  { id: 'tr-region-qiangui', category: 'geography-regional', title: '黔贵文化', summary: '“惟尔贵州，远在要荒“——贵州的山地民族与夜郎文化。', era: '先秦 ~ 当代', imageKeyword: 'guizhou qiangui culture minority', fullContent: '“黔“或“贵“指贵州，古为“夜郎国“。“夜郎自大“虽为贬义，却反映云贵高原少数民族的独立个性。贵州地形破碎，山地占 92%，孕育独特山地文化：苗族(西江千户苗寨)、侗族(鼓楼、风雨桥)、布依族、彝族、土家族、仡佬族多元共生。黄果树瀑布、荔波喀斯特、赤水丹霞、梵净山是世界级自然遗产；茅台酒、都匀毛尖享誉天下；侗族大歌为人类非物质文化遗产。' },
  { id: 'tr-region-bashu', category: 'geography-regional', title: '巴蜀文化', summary: '“蜀道之难，难于上青天“——川渝的天府之国与巴蜀文明。', era: '先秦 ~ 当代', imageKeyword: 'bashu culture sichuan chongqing', fullContent: '“巴蜀“指四川、重庆。三星堆、金沙遗址显示巴蜀文明独立于中原。李白“蜀道之难，难于上青天“道尽此地险阻。都江堰水利工程使成都平原“水旱从人，不知饥馑“，故有“天府之国“美名。川菜(川渝为中国“美食之都“)、川剧变脸、川酒(五粮液、泸州老窖)、蜀绣享誉天下。大熊猫是文化符号。武侯祠、杜甫草堂、三苏祠承载文脉；重庆火锅、码头文化独成一派。' },
  { id: 'tr-region-sanqin', category: 'geography-regional', title: '三秦文化', summary: '“城阙辅三秦，风烟望五津“——陕西关中，长安所在的帝王州。', era: 'BC 1046 ~ 当代', imageKeyword: 'sanqin culture shaanxi changan', fullContent: '“三秦“指今陕西关中、陕北，项羽分封“三秦王“沿用之。关中是周、秦、汉、唐等十三朝建都之地，长安(今西安)是当时世界最大都市。秦始皇陵、兵马俑、汉武帝茂陵、唐太宗昭陵、武则天乾陵世界闻名。西岳华山险峻，壶口瀑布雄浑，延安是中国革命圣地。秦腔、陕北秧歌、信天游、皮影、安塞腰鼓是地域标志；羊肉泡馍、肉夹馍、岐山臊子面是关中味道。' },
  { id: 'tr-region-ganlong', category: 'geography-regional', title: '甘陇文化', summary: '“黄河远上白云间，一片孤城万仞山“——甘肃陇右丝路与黄河文明。', era: '汉 ~ 当代', imageKeyword: 'ganlong culture gansu silk road', fullContent: '“甘陇“指甘肃。甘肃是黄河文明、丝路文化、长城文化交汇之地。河西走廊是丝绸之路咽喉：武威、张掖、酒泉、敦煌四郡贯穿东西；敦煌莫高窟、麦积山石窟、嘉峪关城楼世界闻名。伏羲(天水)、女娲(秦安)、周祖(庆阳)、秦皇(礼县)皆出陇上。陇东窑洞、陇南山水、河西走廊大漠戈壁、祁连雪山、陇中黄土高原多彩并存。兰州牛肉面享誉全球；花儿(民歌)、陇剧、太平鼓具地方特色。' },
  { id: 'tr-region-ningxia', category: 'geography-regional', title: '宁夏文化', summary: '历史上的西夏——贺兰山下党项羌建立的 190 年王朝。', era: 'AD 1038-1227', imageKeyword: 'ningxia culture western xia tangut', fullContent: '宁夏以“贺兰山下果园成，塞北江南旧有名“著称。1038 年党项羌李元昊建立西夏，定都兴庆府(银川)，立国 190 年，与宋、辽、金鼎立。西夏创制西夏文，仿汉字而结构独特，是中国唯一被发现的“死文字“。1227 年蒙古灭西夏。贺兰山岩画记录远古游牧生活；西夏王陵是中国现存规模最大、地面遗迹最完整的帝王陵园之一。回族约占宁夏 1/3，伊斯兰文化与黄河灌溉农业(宁夏平原)交融。' },
  { id: 'tr-region-xinjiang', category: 'geography-regional', title: '新疆文化', summary: '最美的风景在新疆——三山两盆，47 个民族，丝路咽喉。', era: '汉 ~ 当代', imageKeyword: 'xinjiang culture uyghur silk road', fullContent: '新疆“三山夹两盆“——阿尔泰山、天山、昆仑山，准噶尔盆地、塔里木盆地。公元前 2 世纪起即为丝绸之路要冲，龟兹、于阗、楼兰、高昌等绿洲城邦见证东西文明交融。维吾尔、哈萨克、柯尔克孜、塔吉克、蒙古、锡伯、汉等 47 个民族共居。喀什噶尔老城、艾提尕尔清真寺、克孜尔石窟、柏孜克里克千佛洞、交河故城、楼兰遗址是丝路遗珍。维吾尔族十二木卡姆、《玛纳斯》、《江格尔》三大史诗传世。' },
  { id: 'tr-region-zang', category: 'geography-regional', title: '青藏高原藏文化', summary: '生活在雪域高原上的民族——藏传佛教、雪山牧场、独特生态。', era: '唐 ~ 当代', imageKeyword: 'tibet qinghai culture himalaya', fullContent: '青藏高原是世界屋脊，平均海拔 4000 米以上。藏文化以藏传佛教(格鲁派、宁玛派、噶举派、萨迦派)为核心，布达拉宫、大昭寺、扎什伦布寺、塔尔寺是信仰中心。吐蕃王朝(7-9 世纪)曾雄踞高原，与唐争衡；藏文创制于松赞干布时期，文成公主入藏和亲传为佳话。青稞、牦牛、酥油茶、糌粑、转经筒、玛尼堆、唐卡、藏戏是文化标志。藏族人民坚毅、虔敬、与自然和谐共处的精神代代相传。' },
  { id: 'tr-region-hehuang', category: 'geography-regional', title: '河湟文化', summary: '回到黄河上游——甘青交界，多民族交汇过渡带。', era: '汉 ~ 当代', imageKeyword: 'hehuang culture yellow river upper', fullContent: '“河湟“指黄河上游与湟水流域，即今青海东部、甘肃西部、宁夏西部的交汇地带。这一区域是黄土高原、青藏高原、内蒙古高原的过渡带，汉、藏、回、土、撒拉、蒙古多民族杂居。河湟文化兼具中原农耕、藏传佛教、伊斯兰文化元素：塔尔寺(藏传佛教格鲁派六大寺院之一)、西宁东关清真大寺、瞿昙寺、柳湾彩陶遗址、马家窑文化遗址皆在此。汉、藏、回、撒拉、土族共同塑造了河湟多元一体的文化格局。' },
]
