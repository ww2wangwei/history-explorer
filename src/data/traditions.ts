/**
 * traditions.ts — 中国传统条目数据（种子）
 *
 * 12 个子分类（与用户的"全传统"板块一一对应），每类 3-4 条，
 * 共 41 条（按史实）。
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
}

/** 种子数据：每类 3-4 条，共 41 条（按史实） */
export const TRADITIONS: TraditionItem[] = [
  // history (4)
  { id: 'tr-history-1', category: 'history', title: '春秋战国', summary: '周王室衰微，诸侯争霸 500 余年；诸子百家争鸣，奠定中华文明底色。', era: 'BC 770 ~ BC 221', imageKeyword: 'ancient warring states china' },
  { id: 'tr-history-2', category: 'history', title: '秦汉大一统', summary: '首次大一统：书同文、车同轨、行同伦；汉承秦制，独尊儒术。', era: 'BC 221 ~ AD 220' },
  { id: 'tr-history-3', category: 'history', title: '唐宋盛世', summary: '唐代开放包容，宋代文治天下；科举成熟、商业繁荣、文化达顶峰。', era: 'AD 618 ~ AD 1279' },
  { id: 'tr-history-4', category: 'history', title: '明清转型', summary: '明清专制强化、科举僵化、商品经济萌芽、西方叩关——传统社会走向近代。', era: 'AD 1368 ~ AD 1912' },
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
