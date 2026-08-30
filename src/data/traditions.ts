/**
 * traditions.ts — 中国传统条目数据
 *
 * 12 个子分类（与用户的"全传统"板块一一对应）：
 *  - history 子分类 33 条（3 综合主题 + 30 朝代，按《半小时漫画中国史》目录）
 *  - 其他 11 子分类各 3-4 条（哲学/科技各 4，其余 3）
 *  - 总计 68 条种子数据
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
]
