/**
 * WarsOverview — 全战争全屏浏览页
 * 数据源：events.json 中 category='军事' 的事件
 * 复用模式与 FiguresOverview 相同（区域筛选 + importance 筛选 + 搜索 + 详情弹窗）
 */
import { useEffect, useMemo, useState } from 'react'
import eventsData from '@/data/events.json'
import erasData from '@/data/eras.json'
import { useAIStore } from '@/store/useAIStore'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useAllLearningContexts } from '@/utils/useLearningContext'
import { enhancePersonaPrompt } from '@/utils/useLearningContext'
import type { Era, HistoricalEvent } from '@/types'

const events = eventsData as HistoricalEvent[]
const eras = erasData as Era[]
const wars = events.filter(e => e.category === '军事' || e.category === 'military')

/**
 * "大型/长期战争"专题 — 持续 1 年以上 + 多战区 + 多子事件
 * 这些战争不只是一场战斗，而是多年多国的综合博弈
 * 列表中只列代表性事件（用户点开看详情），专题用 dedicated 区域展示
 */
interface MajorWar {
  /** 内部 id（人类可读） */
  key: string
  /** 专题标题（显示在栏目头部） */
  title: string
  /** 起止年（含正负数） */
  startYear: number
  endYear: number
  /** 简述（100-200 字导语） */
  summary: string
  /** icon */
  icon: string
  /** 包含的具体事件 id */
  eventIds: string[]
  /** 专题总评分（用于排序和颜色） */
  importance: 3 | 2
}

/**
 * "大型/长期战争"专题 — 持续 1 年以上 + 多战区 + 多子事件
 * 节点完全自包含（不依赖 events.json），用户点开看完整时间线
 */
interface MajorWarNode {
  /** 节点标题（如"斯大林格勒战役"） */
  title: string
  /** 节点年份（含正负数） */
  year: number
  /** 地点（中文） */
  location: string
  /** 简短描述（50-150 字） */
  description: string
  /** 重要性 1-3 */
  importance: 1 | 2 | 3
}

interface MajorWar {
  /** 内部 id（人类可读） */
  key: string
  /** 专题标题 */
  title: string
  /** 起止年 */
  startYear: number
  endYear: number
  /** 简述（100-200 字导语） */
  summary: string
  /** icon */
  icon: string
  /** 关键节点列表（按时间排序，10-20 个） */
  nodes: MajorWarNode[]
  /** 专题总评分 */
  importance: 3 | 2
}

const MAJOR_WARS: MajorWar[] = [
  {
    key: 'ww1',
    title: '第一次世界大战',
    startYear: 1914,
    endYear: 1918,
    icon: '🟦',
    importance: 3,
    summary: '1914 年萨拉热窝事件引爆，30 多国卷入、1700 万人死亡，摧毁四大帝国（俄/德/奥/奥斯曼），催生凡尔赛体系和共产主义革命。',
    nodes: [
      { title: '萨拉热窝事件', year: 1914, location: '波斯尼亚 萨拉热窝', importance: 3, description: '奥匈帝国王储弗朗茨·斐迪南大公夫妇被塞尔维亚民族主义者普林西普刺杀身亡，成为一战的导火索。' },
      { title: '德国对俄法宣战', year: 1914, location: '欧洲', importance: 3, description: '8 月 1 日德国对俄国宣战，3 日对法国宣战，4 日英国对德宣战。欧洲主要列强全部卷入。' },
      { title: '坦能堡战役', year: 1914, location: '东普鲁士', importance: 2, description: '俄军第二集团军被德军第八集团军包围歼灭，兴登堡和鲁登道夫一战成名。' },
      { title: '马恩河战役', year: 1914, location: '法国 马恩河', importance: 3, description: '英法联军在马恩河挫败德军"施里芬计划"，粉碎德军"速胜"梦想。西线进入堑壕战。' },
      { title: '凡尔登战役', year: 1916, location: '法国 凡尔登', importance: 3, description: '德军向法军凡尔登要塞发动进攻，历时 10 个月，双方伤亡近百万。"凡尔登绞肉机"成为一战的代名词。' },
      { title: '索姆河战役', year: 1916, location: '法国 索姆河', importance: 3, description: '英法联军发动索姆河攻势，伤亡 130 万。第一天英军就伤亡 6 万。英军首次使用坦克。' },
      { title: '日德兰海战', year: 1916, location: '北海', importance: 2, description: '英德两国主力舰队在北海决战，战术上德国略胜，但战略上英国仍保持海上优势。' },
      { title: '俄国二月革命', year: 1917, location: '俄国 彼得格勒', importance: 3, description: '俄国爆发二月革命，沙皇尼古拉二世退位，临时政府成立。' },
      { title: '美国参战', year: 1917, location: '美国', importance: 2, description: '德国"无限制潜艇战"导致多艘美国商船被击沉，4 月美国对德宣战，成为协约国生力军。' },
      { title: '俄国十月革命', year: 1917, location: '俄国 彼得格勒', importance: 3, description: '列宁领导的布尔什维克发动十月革命，建立苏维埃政权。俄国退出战争。' },
      { title: '布鲁西洛夫攻势', year: 1916, location: '东线', importance: 2, description: '俄军布鲁西洛夫将军发动的东线攻势，瓦解了奥匈帝国军队，但俄军自己也损失惨重。' },
      { title: '意大利卡波雷托战役', year: 1917, location: '意大利', importance: 2, description: '意军被奥德联军重创，伤亡 30 万，士气崩溃。但次年意军在维托里奥·维内托战役中获胜。' },
      { title: '德军春季攻势', year: 1918, location: '西线', importance: 2, description: '德军为在西线决战发动 5 次大规模攻势，初期进展显著但兵力耗尽，最终反被协约国反攻。' },
      { title: '贡比涅停战', year: 1918, location: '法国 贡比涅', importance: 3, description: '11 月 11 日德国代表在贡比涅森林的火车车厢里签署停战协定，一战结束。德国投降。' },
      { title: '巴黎和会', year: 1919, location: '法国 巴黎', importance: 3, description: '战胜国在巴黎召开和会，签订《凡尔赛和约》，重新划分欧洲版图、削弱德国、成立国际联盟。' },
    ],
  },
  {
    key: 'ww2',
    title: '第二次世界大战',
    startYear: 1939,
    endYear: 1945,
    icon: '🟥',
    importance: 3,
    summary: '人类历史上最大规模战争，60+ 国家参战、7000 万人死亡，结束于 1945 年 5 月德国投降、9 月日本投降。战后形成雅尔塔体系和美苏冷战。',
    nodes: [
      { title: '七七事变', year: 1937, location: '中国 北平 卢沟桥', importance: 3, description: '日军在卢沟桥发动事变，全民族抗战爆发。' },
      { title: '淞沪会战', year: 1937, location: '中国 上海', importance: 3, description: '中日双方 100 万军队在上海激战三个月，中国军队伤亡 30 余万，粉碎日军"三个月灭亡中国"狂言。' },
      { title: '南京大屠杀', year: 1937, location: '中国 南京', importance: 3, description: '日军攻陷南京后展开长达 6 周的大屠杀，遇难同胞超过 30 万。' },
      { title: '台儿庄战役', year: 1938, location: '中国 山东', importance: 2, description: '李宗仁指挥的台儿庄战役歼敌 1 万余人，是抗战正面战场首次重大胜利。' },
      { title: '武汉会战', year: 1938, location: '中国 武汉', importance: 2, description: '抗战中规模最大、持续时间最长的会战，中国军队伤亡 40 万，消耗日军有生力量。' },
      { title: '德国吞并奥地利', year: 1938, location: '奥地利', importance: 2, description: '纳粹德国兵不血刃吞并奥地利，希特勒的领土扩张迈出第一步。' },
      { title: '慕尼黑协定', year: 1938, location: '德国 慕尼黑', importance: 2, description: '英法德意签订《慕尼黑协定》，将捷克斯洛伐克苏台德地区割让给德国。绥靖政策的顶峰。' },
      { title: '德国吞并捷克', year: 1939, location: '捷克斯洛伐克', importance: 2, description: '纳粹德国违背《慕尼黑协定》，直接吞并整个捷克斯洛伐克。' },
      { title: '苏德互不侵犯条约', year: 1939, location: '苏联 莫斯科', importance: 2, description: '8 月 23 日苏德签订《互不侵犯条约》，秘密瓜分波兰，为德国入侵波兰铺平道路。' },
      { title: '德军闪击波兰', year: 1939, location: '波兰', importance: 3, description: '9 月 1 日德国闪击波兰，9 月 3 日英法对德宣战，第二次世界大战爆发。' },
      { title: '波兰沦陷', year: 1939, location: '波兰', importance: 2, description: '波兰在德苏夹击下 1 个月沦陷。华沙被围 3 周后陷落。' },
      { title: '奇怪的战争', year: 1939, location: '西线', importance: 2, description: '9 月-次年 4 月英法在西线对德宣而未战，出现"静坐战"的奇怪状态。' },
      { title: '苏联入侵芬兰', year: 1939, location: '芬兰', importance: 1, description: '苏军冬季战争入侵芬兰，初期受挫后以惨重伤亡迫使芬兰求和。' },
      { title: '德国入侵北欧', year: 1940, location: '丹麦 挪威', importance: 2, description: '4 月德军入侵丹麦和挪威，控制铁矿运输线。' },
      { title: '敦刻尔克大撤退', year: 1940, location: '法国 敦刻尔克', importance: 3, description: '5-6 月英法联军 33 万人在英吉利海峡敦刻尔克奇迹撤回英国。"发电机行动"保存了反攻力量。' },
      { title: '法国沦陷', year: 1940, location: '法国', importance: 3, description: '6 月德军攻入法国，6 月 22 日法国投降。维希法国成立。' },
      { title: '不列颠空战', year: 1940, location: '英国', importance: 3, description: '7-10 月德国空军大规模轰炸英国，皇家空军凭借雷达和飞行员英勇抗击，希特勒被迫放弃登陆英国。' },
      { title: '三国同盟签订', year: 1940, location: '柏林', importance: 2, description: '德意日正式签订《三国同盟条约》，轴心国正式形成。' },
      { title: '意大利入侵希腊', year: 1940, location: '希腊', importance: 1, description: '墨索里尼趁德军横扫西欧之际入侵希腊，反被希腊军队打败。' },
      { title: '北非战役', year: 1940, location: '北非', importance: 2, description: '意军在北非被英军击败。隆美尔 1941 年率非洲军入北非，长期与英军拉锯。' },
      { title: '德国入侵巴尔干', year: 1941, location: '巴尔干', importance: 2, description: '德军入侵南斯拉夫和希腊，巩固南欧。' },
      { title: '德国入侵苏联', year: 1941, location: '苏联', importance: 3, description: '6 月 22 日德军以 300 万兵力发动"巴巴罗萨"行动入侵苏联。三大轴心国联合作战。' },
      { title: '莫斯科保卫战', year: 1941, location: '苏联 莫斯科', importance: 3, description: '苏军冬季反攻击退德军。希特勒"巴巴罗萨"闪电战首次重大失败。' },
      { title: '珍珠港事件', year: 1941, location: '美国 珍珠港', importance: 3, description: '12 月 7 日日本偷袭珍珠港，太平洋战争爆发。' },
      { title: '斯大林格勒战役', year: 1942, location: '苏联 斯大林格勒', importance: 3, description: '二战转折点。苏军围歼德军第 6 集团军 33 万人。德军元气大伤。' },
      { title: '中途岛海战', year: 1942, location: '太平洋 中途岛', importance: 3, description: '太平洋战争转折点。美海军以少胜多击沉日本 4 艘主力航空母舰。' },
      { title: '阿拉曼战役', year: 1942, location: '北非', importance: 2, description: '英军在阿拉曼击溃隆美尔非洲军团，北非战局开始逆转。' },
      { title: '斯大林格勒战役结束', year: 1943, location: '苏联', importance: 2, description: '2 月保卢斯元帅率德军残部投降。苏联进入战略反攻。' },
      { title: '库尔斯克会战', year: 1943, location: '苏联 库尔斯克', importance: 3, description: '人类历史上最大坦克会战。德军"堡垒"攻势失败，苏军彻底掌握东线主动权。' },
      { title: '中途岛后续', year: 1943, location: '太平洋', importance: 2, description: '瓜达尔卡纳尔岛战役。盟军在太平洋展开反攻，逐岛争夺。' },
      { title: '意大利投降', year: 1943, location: '意大利', importance: 2, description: '7 月盟军登陆西西里，9 月意大利投降，墨索里尼下台。德国占领意大利北部。' },
      { title: '开罗会议', year: 1943, location: '埃及 开罗', importance: 2, description: '中美英三国首脑开罗会议，发表《开罗宣言》要求日本无条件投降。' },
      { title: '德黑兰会议', year: 1943, location: '伊朗 德黑兰', importance: 2, description: '美英苏三国首脑德黑兰会议，确定 1944 年开辟欧洲第二战场。' },
      { title: '诺曼底登陆', year: 1944, location: '法国 诺曼底', importance: 3, description: '6 月 6 日盟军在诺曼底登陆，"D 日"成为二战最大登陆作战，欧洲第二战场开辟。' },
      { title: '塞班岛战役', year: 1944, location: '太平洋 塞班岛', importance: 2, description: '美军攻占塞班岛，B-29 轰炸机可直飞日本本土。' },
      { title: '菲律宾战役', year: 1944, location: '太平洋 菲律宾', importance: 2, description: '麦克阿瑟兑现"我会回来"承诺，盟军夺回菲律宾。' },
      { title: '莱特湾海战', year: 1944, location: '太平洋 莱特湾', importance: 2, description: '人类历史上最大规模海战，日本海军损失殆尽。' },
      { title: '雅尔塔会议', year: 1945, location: '苏联 雅尔塔', importance: 3, description: '美英苏首脑会议，划分战后势力范围，决定成立联合国。' },
      { title: '硫磺岛战役', year: 1945, location: '太平洋 硫磺岛', importance: 2, description: '美军攻占硫磺岛，《父辈的旗帜》战役。3.6 万美军伤亡。' },
      { title: '柏林战役', year: 1945, location: '德国 柏林', importance: 3, description: '苏军攻入柏林，4 月 30 日希特勒自杀。5 月 8 日德国无条件投降。' },
      { title: '冲绳战役', year: 1945, location: '太平洋 冲绳', importance: 2, description: '太平洋战场最大登陆战役，盟军伤亡 8.2 万。日军全军覆没。' },
      { title: '广岛原子弹', year: 1945, location: '日本 广岛', importance: 3, description: '8 月 6 日美国在广岛投下原子弹，人类首次核武实战。' },
      { title: '长崎原子弹', year: 1945, location: '日本 长崎', importance: 2, description: '8 月 9 日美国在长崎投下第二颗原子弹。' },
      { title: '苏联对日宣战', year: 1945, location: '中国东北', importance: 2, description: '8 月 8 日苏联对日宣战，百万苏军入中国东北。' },
      { title: '日本投降', year: 1945, location: '日本', importance: 3, description: '8 月 15 日日本天皇宣布接受波茨坦公告无条件投降。9 月 2 日签署投降书。' },
      { title: '纽伦堡审判', year: 1945, location: '德国 纽伦堡', importance: 2, description: '国际军事法庭审判纳粹主要战犯，开启国际刑事司法先例。' },
      { title: '东京审判', year: 1946, location: '日本 东京', importance: 2, description: '远东国际军事法庭审判日本甲级战犯。' },
    ],
  },
  {
    key: 'china-ww2',
    title: '抗日战争（中国人民抗日战争）',
    startYear: 1937,
    endYear: 1945,
    icon: '🇨🇳',
    importance: 3,
    summary: '1937 年七七事变爆发全民族抗战，至 1945 年日本投降，8 年浴血奋战，1800 万中国人牺牲，中国近代首次取得反侵略战争完全胜利。',
    nodes: [
      { title: '九一八事变', year: 1931, location: '中国 沈阳', importance: 3, description: '日本关东军炸毁南满铁路柳条湖段，反诬中国军队，侵占中国东北。14 年抗战开始。' },
      { title: '一二八事变', year: 1932, location: '中国 上海', importance: 2, description: '日军在上海挑起事端，蔡廷锴率十九路军奋起抵抗。' },
      { title: '长城抗战', year: 1933, location: '中国 长城沿线', importance: 2, description: '中国军队在山海关、古北口、喜峰口等地抵抗日军。' },
      { title: '卢沟桥事变（七七事变）', year: 1937, location: '中国 北平', importance: 3, description: '日军在卢沟桥发动事变，全民族抗战爆发。第二次国共合作开始。' },
      { title: '淞沪会战', year: 1937, location: '中国 上海', importance: 3, description: '中日双方 100 万军队激战三个月，粉碎日军"三个月灭亡中国"狂言。' },
      { title: '南京大屠杀', year: 1937, location: '中国 南京', importance: 3, description: '日军攻陷南京后屠城 6 周，30 万以上同胞遇难。' },
      { title: '徐州会战', year: 1938, location: '中国 徐州', importance: 2, description: '李宗仁指挥徐州会战，含台儿庄战役歼敌 1 万余人。' },
      { title: '武汉会战', year: 1938, location: '中国 武汉', importance: 2, description: '抗战中规模最大、持续时间最长会战，消耗日军主力。' },
      { title: '花园口决堤', year: 1938, location: '中国 河南', importance: 2, description: '国民政府炸开花园口黄河大堤阻挡日军，淹毙日军数千，但也造成 89 万平民遇难。' },
      { title: '广州武汉相继失守', year: 1938, location: '中国', importance: 2, description: '10 月日军攻陷广州、武汉，抗战进入相持阶段。' },
      { title: '百团大战', year: 1940, location: '中国 华北', importance: 3, description: '彭德怀指挥八路军 105 个团对日军发动大规模破袭战，毙伤日军 2 万余。' },
      { title: '长沙会战（三次）', year: 1939, location: '中国 长沙', importance: 2, description: '1939-1942 年三次长沙会战，薛岳将军"天炉战法"三次击退日军进攻。' },
      { title: '枣宜会战', year: 1940, location: '中国 湖北', importance: 2, description: '张自忠将军在枣宜会战中壮烈殉国，是二战盟军中殉国的最高级别将领。' },
      { title: '滇缅公路', year: 1940, location: '中国云南-缅甸', importance: 2, description: '中国抗战唯一的国际补给通道，1937 年底开工，1938 年 8 月通车，9 个月建成的奇迹。' },
      { title: '中国远征军入缅', year: 1942, location: '缅甸', importance: 2, description: '应英美请求，中国派出 10 万远征军入缅作战。戴安澜将军 200 师在同古血战。' },
      { title: '豫湘桂会战', year: 1944, location: '中国 华中华南', importance: 2, description: '日军发动抗战以来最大规模攻势，中国军队损失近 60 万，失地 20 多万平方公里。' },
      { title: '滇缅反攻', year: 1944, location: '缅甸', importance: 2, description: '中国驻印军和远征军反攻缅北滇西，与美军并肩作战，打通中印公路。' },
      { title: '湘西会战', year: 1945, location: '中国 湖南', importance: 2, description: '抗战中国军最后一次大规模会战，取得雪峰山大捷。' },
      { title: '雅尔塔协定涉华', year: 1945, location: '苏联 雅尔塔', importance: 2, description: '美英苏秘密协定以中国部分领土换取苏联对日参战，引发中国强烈不满。' },
      { title: '苏联出兵东北', year: 1945, location: '中国东北', importance: 2, description: '8 月 8 日苏军 150 万入东北，一举消灭日本关东军主力 70 万。' },
      { title: '日本投降与台湾回归', year: 1945, location: '中国', importance: 3, description: '8 月 15 日日本宣布投降，10 月 25 日中国政府正式收复台湾，结束日本 50 年殖民统治。' },
    ],
  },
  {
    key: 'napoleonic',
    title: '拿破仑战争',
    startYear: 1803,
    endYear: 1815,
    icon: '🇫🇷',
    importance: 2,
    summary: '拿破仑·波拿巴主导的欧洲霸权争夺，从 1803 年到 1815 年滑铁卢战役。席卷整个欧洲大陆，最终在俄国的寒冬和莱比锡战役中崩溃。',
    nodes: [
      { title: '拿破仑称帝', year: 1804, location: '法国 巴黎', importance: 3, description: '5 月 18 日拿破仑在巴黎圣母院加冕称帝，建立法兰西第一帝国。' },
      { title: '特拉法尔加海战', year: 1805, location: '西班牙 特拉法尔加', importance: 3, description: '英国海军纳尔逊勋爵在西班牙海岸大败法国西班牙联合舰队。纳尔逊战死。英国奠定海上霸权。' },
      { title: '奥斯特里茨战役', year: 1805, location: '捷克 奥斯特里茨', importance: 3, description: '"三皇会战"。拿破仑率 7.3 万法军击败俄奥联军 8.5 万。拿破仑军事生涯最辉煌的胜利。' },
      { title: '耶拿战役', year: 1806, location: '德国 耶拿', importance: 2, description: '拿破仑一日之内歼灭普鲁士军队主力，普鲁士被迫签订屈辱条约。' },
      { title: '柏林陷落', year: 1806, location: '德国 柏林', importance: 2, description: '法军占领柏林，拿破仑进入普鲁士王宫。普鲁士被迫退出反法同盟。' },
      { title: '半岛战争爆发', year: 1808, location: '西班牙 葡萄牙', importance: 2, description: '拿破仑入侵西班牙引发民众起义，英国出兵支援。长达 6 年的半岛战争消耗法国军力。' },
      { title: '瓦格拉姆战役', year: 1809, location: '奥地利', importance: 2, description: '拿破仑第五次反法同盟战争中击败奥地利。奥皇弗兰茨一世被迫签订《维也纳和约》。' },
      { title: '莫斯科远征', year: 1812, location: '俄国', importance: 3, description: '6 月拿破仑率 60 万大军远征俄国，俄军坚壁清野，冬天严寒击溃法军。' },
      { title: '博罗季诺战役', year: 1812, location: '俄国 莫斯科', importance: 2, description: '莫斯科保卫战前最大规模血战，双方各损失 3 万以上。俄军后撤。' },
      { title: '莫斯科大火', year: 1812, location: '俄国 莫斯科', importance: 2, description: '俄军撤出莫斯科后纵火焚烧全城。法军占领一座废墟，士气崩溃。' },
      { title: '法军溃退', year: 1812, location: '俄国', importance: 3, description: '拿破仑被迫撤军，60 万大军仅约 3 万人逃出俄国。' },
      { title: '莱比锡战役', year: 1813, location: '德国 莱比锡', importance: 3, description: '"民族大会战"。俄奥普瑞联军 36 万大破法军 20 万。拿破仑在德意志的霸权崩溃。' },
      { title: '法军退守莱茵', year: 1813, location: '欧洲', importance: 2, description: '莱比锡后法军被迫退守莱茵河以西。' },
      { title: '反法联军入巴黎', year: 1814, location: '法国 巴黎', importance: 3, description: '3 月俄普奥联军攻入巴黎，拿破仑被迫退位，流放厄尔巴岛。' },
      { title: '拿破仑百日王朝', year: 1815, location: '法国', importance: 3, description: '3 月拿破仑从厄尔巴岛逃回巴黎，重登皇位，史称"百日王朝"。' },
      { title: '滑铁卢战役', year: 1815, location: '比利时 滑铁卢', importance: 3, description: '6 月 18 日拿破仑在滑铁卢被威灵顿率领的英荷联军击败，结束拿破仑时代。' },
      { title: '拿破仑流放圣赫勒拿', year: 1815, location: '圣赫勒拿岛', importance: 2, description: '拿破仑被流放南大西洋圣赫勒拿岛，1821 年 5 月病逝，享年 51 岁。' },
    ],
  },
  {
    key: 'mongol-west',
    title: '蒙古三次西征',
    startYear: 1219,
    endYear: 1260,
    icon: '🏹',
    importance: 2,
    summary: '成吉思汗及其后裔发动的三次大规模西征（1219-1225、1235-1242、1253-1260），建立横跨欧亚的蒙古帝国，深刻改变中亚、东欧、波斯历史走向。',
    nodes: [
      { title: '成吉思汗统一蒙古', year: 1206, location: '蒙古 鄂嫩河', importance: 3, description: '铁木真统一蒙古各部，建立大蒙古国，称成吉思汗。' },
      { title: '第一次西征：花剌子模', year: 1219, location: '中亚', importance: 3, description: '成吉思汗率 20 万大军征讨花剌子模，攻陷撒马尔罕、布哈拉、讹答剌等城市。' },
      { title: '撒马尔罕陷落', year: 1220, location: '中亚 撒马尔罕', importance: 2, description: '中亚最繁华城市撒马尔罕被攻陷，5 万居民被杀，城市被洗劫。' },
      { title: '玉龙杰赤之战', year: 1221, location: '中亚 玉龙杰赤', importance: 2, description: '蒙古军围攻花剌子模新都玉龙杰赤，攻克后屠城。' },
      { title: '追摩诃末算端', year: 1220, location: '中亚', importance: 2, description: '成吉思汗命哲别、速不台追击花剌子模末代国王摩诃末。摩诃末病死于里海小岛。' },
      { title: '印度河之战', year: 1221, location: '南亚 印度河', importance: 2, description: '蒙古军渡印度河追击扎兰丁，扎兰丁溃逃。蒙古军止步于印度边境。' },
      { title: '第一次西征结束', year: 1225, location: '蒙古', importance: 2, description: '成吉思汗班师，第一次西征结束。中亚大部分被纳入蒙古版图。' },
      { title: '哲别速不台扫荡', year: 1223, location: '南俄', importance: 2, description: '哲别、速不台率偏师横扫高加索、南俄草原，在卡尔卡河击败罗斯诸侯联军。' },
      { title: '窝阔台继位', year: 1229, location: '蒙古', importance: 2, description: '成吉思汗三子窝阔台继蒙古大汗位，启动第二次西征。' },
      { title: '第二次西征：欧洲', year: 1235, location: '东欧', importance: 3, description: '拔都率各支系长子西征，攻陷梁赞、莫斯科、基辅。深入波兰、匈牙利。' },
      { title: '基辅罗斯陷落', year: 1240, location: '乌克兰 基辅', importance: 3, description: '蒙古军攻陷基辅，古罗斯诸国基本被毁。基辅罗斯文明遭到毁灭性打击。' },
      { title: '列格尼卡战役', year: 1241, location: '波兰 列格尼卡', importance: 2, description: '蒙古军在波兰列格尼卡击败波兰、日耳曼联军。' },
      { title: '莫希战役', year: 1241, location: '匈牙利', importance: 2, description: '蒙古军在莫希战役击败匈牙利军队，逼近维也纳。' },
      { title: '拔都回师', year: 1242, location: '蒙古', importance: 2, description: '窝阔台驾崩消息传来，拔都率军东归参加忽里勒台大会。第二次西征结束。' },
      { title: '金帐汗国建立', year: 1242, location: '俄罗斯', importance: 2, description: '拔都建立金帐汗国，定都萨莱，统治俄罗斯诸公国 240 年。' },
      { title: '第三次西征启动', year: 1253, location: '蒙古', importance: 2, description: '蒙哥大汗命其弟旭烈兀发动第三次西征，目标中东。' },
      { title: '蒙古攻陷巴格达', year: 1258, location: '中东 巴格达', importance: 3, description: '旭烈兀率军攻陷阿拔斯王朝首都巴格达，末代哈里发被裹地毯踩死。阿拔斯王朝灭亡。' },
      { title: '蒙古攻陷大马士革', year: 1260, location: '叙利亚', importance: 2, description: '蒙古军继续西进，攻陷阿尤布王朝首都大马士革。' },
      { title: '艾因贾鲁战役', year: 1260, location: '巴勒斯坦', importance: 3, description: '马穆鲁克军在艾因贾鲁战役击败蒙古军，阻止了蒙古向西的扩张。' },
      { title: '伊尔汗国建立', year: 1260, location: '伊朗', importance: 2, description: '旭烈兀在波斯建立伊尔汗国，定都大不里士。蒙古帝国分裂为四大汗国。' },
    ],
  },
  {
    key: 'thirty-years',
    title: '三十年战争',
    startYear: 1618,
    endYear: 1648,
    icon: '⚔️',
    importance: 2,
    summary: '神圣罗马帝国内战升级为欧洲混战，1648 年《威斯特伐利亚和约》奠定现代国际关系基础（主权国家、不干涉内政），被称为"现代国际法起源"。',
    nodes: [
      { title: '布拉格掷出窗外事件', year: 1618, location: '捷克 布拉格', importance: 3, description: '波西米亚新教贵族将两名天主教皇家顾问掷出窗外，引发三十年战争导火索。' },
      { title: '白山战役', year: 1620, location: '捷克 白山', importance: 3, description: '天主教联盟在布拉格附近白山击败新教波西米亚军队。波西米亚军 1.8 万战死。' },
      { title: '波西米亚被征服', year: 1621, location: '捷克', importance: 2, description: '神圣罗马皇帝斐迪南二世血腥镇压波西米亚起义，强制推行天主教化。' },
      { title: '丹麦参战', year: 1625, location: '欧洲', importance: 2, description: '丹麦国王克里斯蒂安四世率军入侵神圣罗马帝国。' },
      { title: '华伦斯坦崛起', year: 1625, location: '中欧', importance: 2, description: '神圣罗马帝国雇佣兵统帅华伦斯坦组建军队，为皇帝效力。' },
      { title: '德萨乌战役', year: 1626, location: '匈牙利', importance: 2, description: '德萨乌伯爵击败新教匈牙利军队。' },
      { title: '丹麦失败', year: 1629, location: '欧洲', importance: 2, description: '丹麦战败，被迫签订《吕贝克和约》，退出战争。' },
      { title: '瑞典国王参战', year: 1630, location: '瑞典', importance: 2, description: '"北方雄狮"古斯塔夫二世率瑞典军队登陆德意志，新教一方重整旗鼓。' },
      { title: '布莱登菲尔德战役', year: 1631, location: '德国 布莱登菲尔德', importance: 3, description: '古斯塔夫二世率瑞典-萨克森军击败天主教联军，新教军队首次重大胜利。' },
      { title: '莱希河战役', year: 1632, location: '德国 莱希河', importance: 3, description: '瑞典军再度击败天主教联军，但古斯塔夫二世本人在吕岑战役中阵亡。' },
      { title: '吕岑战役', year: 1632, location: '德国 吕岑', importance: 3, description: '古斯塔夫二世亲率骑兵冲锋阵亡。瑞典军由贝尔哈德将军接替获胜。' },
      { title: '纳德林根战役', year: 1634, location: '德国 纳德林根', importance: 3, description: '皇帝军与西班牙军在纳德林根击败瑞典军。' },
      { title: '法国参战', year: 1635, location: '欧洲', importance: 3, description: '法国放弃传统敌人哈布斯堡同盟立场，公开与西班牙、帝国作战。战争国际化。' },
      { title: '维特施托克战役', year: 1636, location: '德国', importance: 2, description: '瑞典军击败萨克森军队。' },
      { title: '布赖滕费尔德战役', year: 1642, location: '德国', importance: 2, description: '瑞典军在第二次布赖滕费尔德战役击败帝国军。' },
      { title: '林茨战役', year: 1642, location: '德国', importance: 2, description: '瑞典军控制波西米亚。' },
      { title: '布赖滕费尔德第 3 次', year: 1642, location: '德国', importance: 2, description: '瑞典军再次获胜，新教军队在德意志北部取得优势。' },
      { title: '楚斯马斯豪森战役', year: 1646, location: '德国', importance: 2, description: '瑞典军与法国-黑森联军联合作战，击败巴伐利亚军队。' },
      { title: '楚斯马斯豪森战役（续）', year: 1648, location: '欧洲', importance: 2, description: '法国在德意志地区取得进展。' },
      { title: '明斯特和约签订', year: 1648, location: '德国 明斯特', importance: 3, description: '神圣罗马帝国与法国、瑞典、荷兰等签订《威斯特伐利亚和约》。' },
      { title: '三十年战争结束', year: 1648, location: '欧洲', importance: 3, description: '威斯特伐利亚和约签订，神圣罗马帝国实质分裂，欧洲进入主权国家体系。' },
    ],
  },
  {
    key: 'seven-years',
    title: '七年战争',
    startYear: 1756,
    endYear: 1763,
    icon: '🌍',
    importance: 2,
    summary: '欧洲列强在欧陆、北美、加勒比、印度同时开战，被称为"第一次世界大战"。腓特烈大帝奇迹般撑住，1763 年《巴黎和约》让英国获得法属加拿大和印度。',
    nodes: [
      { title: '外交革命', year: 1756, location: '欧洲', importance: 2, description: '1756 年欧洲列强结盟大洗牌。法奥结盟（1756 年 5 月），英普结盟（1756 年 1 月）。' },
      { title: '七年战争爆发', year: 1756, location: '欧洲', importance: 3, description: '8 月 29 日普鲁士入侵萨克森，七年战争正式爆发。' },
      { title: '罗斯巴赫战役', year: 1757, location: '德国 罗斯巴赫', importance: 3, description: '腓特烈大帝率 2.2 万普军击败法奥联军 4.1 万。"普鲁士军事天才"奠定欧洲声誉。' },
      { title: '洛伊滕战役', year: 1757, location: '德国 洛伊滕', importance: 3, description: '腓特烈大帝在洛伊滕完胜奥军，被拿破仑誉为"机动与决心的杰作"。' },
      { title: '大不列颠北美战争', year: 1757, location: '北美', importance: 2, description: '英法北美战争。英军攻陷路易斯堡，奠定北美英语化基础。' },
      { title: '普拉西战役', year: 1757, location: '印度 普拉西', importance: 3, description: '罗伯特·克莱武率英军 800 人击败孟加拉王 5 万大军。奠定英国在印度的统治。' },
      { title: '霍赫基兴战役', year: 1758, location: '德国 霍赫基兴', importance: 2, description: '俄军首次在西里西亚击败普军，威胁柏林。' },
      { title: '明登战役', year: 1759, location: '德国 明登', importance: 2, description: '英汉联军击败法军，英国在欧洲大陆获得首个胜利。' },
      { title: '库勒斯多夫战役', year: 1759, location: '德国 库勒斯多夫', importance: 3, description: '普军尝试进攻俄军但遭惨败，腓特烈大帝"一切都失去了，请国家自救"。' },
      { title: '米诺卡战役', year: 1756, location: '地中海 米诺卡', importance: 1, description: '英法为争夺地中海岛屿开战，英国失守米诺卡。' },
      { title: '利格尼茨战役', year: 1760, location: '德国 利格尼茨', importance: 2, description: '腓特烈大帝在利格尼茨击败劳东元帅。' },
      { title: '托尔高战役', year: 1760, location: '德国 托尔高', importance: 2, description: '普军击败奥军，解除柏林之围。' },
      { title: '柏林被占', year: 1760, location: '德国 柏林', importance: 2, description: '俄奥联军短暂占领柏林（10 月-次年 3 月）。' },
      { title: '施特廷围攻', year: 1761, location: '德国 施特廷', importance: 1, description: '俄军围攻普军重要港口施特廷（斯塞新），次年陷落。' },
      { title: '施特廷陷落', year: 1762, location: '德国 施特廷', importance: 1, description: '俄军攻陷施特廷，普军形势危急。' },
      { title: '彼得三世与俄国的转折', year: 1762, location: '俄国', importance: 3, description: '俄国女皇叶卡捷琳娜二世推翻亲普王彼得三世，俄国退出战争。普鲁士奇迹般获救。' },
      { title: '巴黎和约', year: 1763, location: '法国 巴黎', importance: 3, description: '七年战争结束。法国失去整个新法兰西（加拿大）和印度。英国建立"第一英帝国"。' },
      { title: '胡贝图斯堡和约', year: 1763, location: '德国 胡贝图斯堡', importance: 2, description: '普鲁士与奥地利签订和约，确认普鲁士对西里西亚的所有权。' },
    ],
  },
  {
    key: '100-years',
    title: '英法百年战争',
    startYear: 1337,
    endYear: 1453,
    icon: '🏰',
    importance: 2,
    summary: '欧洲中世纪最长的战争，持续 116 年。贞德 1429 年解放奥尔良扭转战局，1453 年法军收复加莱。英格兰民族意识觉醒，丧失欧洲大陆所有领地。',
    nodes: [
      { title: '百年战争爆发', year: 1337, location: '法国', importance: 3, description: '11 月英王爱德华三世对法宣战。起因是法王王位继承和阿基坦领地问题。' },
      { title: '斯吕伊斯海战', year: 1340, location: '比利时 斯吕伊斯', importance: 2, description: '英军在斯吕伊斯海战中击败法国海军，取得制海权。' },
      { title: '克雷西战役', year: 1346, location: '法国 克雷西', importance: 3, description: '英军长弓兵在克雷西大败法军骑士。长弓让法国骑士无法近身。' },
      { title: '加莱围攻与陷落', year: 1347, location: '法国 加莱', importance: 2, description: '英军围攻加莱 11 个月后陷落，成为英国大陆领地直到 1558 年。' },
      { title: '黑死病', year: 1348, location: '欧洲', importance: 2, description: '黑死病席卷欧洲，战争暂时停火。' },
      { title: '普瓦捷战役', year: 1356, location: '法国 普瓦捷', importance: 3, description: '英军"黑太子"爱德华在普瓦捷击败法军，俘虏法王约翰二世。' },
      { title: '法国大分裂', year: 1358, location: '法国', importance: 2, description: '法王被俘导致国内大分裂。' },
      { title: '布雷蒂尼和约', year: 1360, location: '法国', importance: 2, description: '约翰二世被释放后签订屈辱条约，将大片法国领土割让给英国。' },
      { title: '卡斯蒂永战役（暂停）', year: 1380, location: '法国', importance: 1, description: '卡斯蒂永休战协议生效。' },
      { title: '阿金库尔战役', year: 1415, location: '法国 阿金库尔', importance: 3, description: '英王亨利五世在阿金库尔大败法军。百年战争第二阶段英军占绝对优势。' },
      { title: '特鲁瓦条约', year: 1420, location: '法国 特鲁瓦', importance: 2, description: '法王查理六世被迫承认英王亨利五世为法国王位继承人。法国面临被英国吞并的危机。' },
      { title: '贞德面见王储', year: 1429, location: '法国 希农', importance: 3, description: '17 岁农家女贞德说服王储查理授予她军队指挥权。' },
      { title: '奥尔良之围', year: 1429, location: '法国 奥尔良', importance: 3, description: '英军围攻奥尔良 7 个月。贞德率军解围，扭转战局。' },
      { title: '帕莱战役', year: 1429, location: '法国 帕莱', importance: 2, description: '法军在帕莱战役中击败英军。' },
      { title: '兰斯加冕', year: 1429, location: '法国 兰斯', importance: 3, description: '贞德护送查理七世在兰斯大教堂加冕为法国国王。' },
      { title: '巴黎攻城失败', year: 1429, location: '法国 巴黎', importance: 2, description: '贞德率军进攻巴黎失败，撤退。' },
      { title: '贡比涅之战', year: 1430, location: '法国 贡比涅', importance: 2, description: '贞德在贡比涅被勃艮第派俘获，后转卖给英军。' },
      { title: '贞德受审', year: 1431, location: '法国 鲁昂', importance: 3, description: '英军控制下的宗教法庭以"异端"罪审判贞德。' },
      { title: '贞德火刑', year: 1431, location: '法国 鲁昂', importance: 3, description: '5 月 30 日贞德在鲁昂老集市广场被处以火刑，年仅 19 岁。' },
      { title: '福尔米尼战役', year: 1450, location: '法国 福尔米尼', importance: 2, description: '法军击败英军，收复诺曼底。' },
      { title: '卡斯蒂永战役（终战）', year: 1453, location: '法国 卡斯蒂永', importance: 3, description: '法军取得决定性胜利，英军总司令塔尔博特阵亡。' },
      { title: '波尔多投降', year: 1453, location: '法国 波尔多', importance: 2, description: '英军最后大陆据点波尔多开城投降。' },
      { title: '加莱收复', year: 1458, location: '法国 加莱', importance: 3, description: '法军收复加莱，英格兰丧失所有法国大陆领地。百年战争正式结束。' },
    ],
  },
  {
    key: 'us-civil',
    title: '美国南北战争',
    startYear: 1861,
    endYear: 1865,
    icon: '🇺🇸',
    importance: 3,
    summary: '美国历史上最大规模内战，1863 年葛底斯堡战役为转折，1865 年林肯遇刺同年南方投降。奴隶制废除，联邦权威高于州权。',
    nodes: [
      { title: '堪萨斯内战', year: 1856, location: '美国 堪萨斯', importance: 2, description: '奴隶制和废奴主义者武装冲突的预演。"堪萨斯血案"。' },
      { title: '林肯当选', year: 1860, location: '美国', importance: 3, description: '亚伯拉罕·林肯当选总统，南方 11 州随后宣布独立。' },
      { title: '南方独立', year: 1861, location: '美国', importance: 3, description: '2 月南方 11 州宣布独立，成立"美利坚联盟国"，戴维斯任总统。' },
      { title: '萨姆特堡之战', year: 1861, location: '美国 萨姆特堡', importance: 3, description: '4 月南方炮轰联邦军萨姆特堡，南北战争正式爆发。' },
      { title: '林肯征召志愿军', year: 1861, location: '美国', importance: 2, description: '4 月 15 日林肯宣布南方叛乱，征召 7.5 万志愿军。' },
      { title: '第一次马纳萨斯战役', year: 1861, location: '美国 马纳萨斯', importance: 3, description: '南方军在第一次牛奔河战役击败北方军。林肯意识到这将是一场长期战争。' },
      { title: '麦克莱伦接任', year: 1861, location: '美国', importance: 2, description: '麦克莱伦接任波托马克军团司令。' },
      { title: '特伦顿战役', year: 1862, location: '美国 新泽西', importance: 2, description: '林肯"一寸一寸推进"战略。' },
      { title: '安提塔姆战役', year: 1862, location: '美国 马里兰', importance: 3, description: '北方军阻止南方军入侵马里兰。双方伤亡 2.3 万。林肯 5 天后发表《解放奴隶宣言》。' },
      { title: '解放奴隶宣言', year: 1862, location: '美国', importance: 3, description: '9 月林肯发表《解放奴隶宣言预告》。1863 年 1 月 1 日正式生效。' },
      { title: '葛底斯堡战役', year: 1863, location: '美国 宾夕法尼亚', importance: 3, description: '7 月北方军在葛底斯堡击败南方军，南方军再无力北攻。北方军伤亡 2.3 万。' },
      { title: '葛底斯堡演说', year: 1863, location: '美国', importance: 3, description: '11 月 19 日林肯在葛底斯堡发表著名演说"民有、民治、民享的政府"。' },
      { title: '维克斯堡战役', year: 1863, location: '美国 密西西比', importance: 3, description: '北方军攻陷维克斯堡，控制密西西比河。南方被拦腰切断。' },
      { title: '查塔努加战役', year: 1863, location: '美国 田纳西', importance: 2, description: '北方军攻占查塔努加，控制南方铁路网。' },
      { title: '谢尔曼向海洋进军', year: 1864, location: '美国 南方', importance: 3, description: '谢尔曼将军率北方军从亚特兰大横扫佐治亚州到萨凡纳，60 英里宽的破坏带。' },
      { title: '葛底斯堡战役后僵持', year: 1863, location: '美国', importance: 1, description: '北方军攻占维克斯堡，南方陷入守势。' },
      { title: '里士满陷落', year: 1865, location: '美国 弗吉尼亚', importance: 3, description: '4 月北方军攻占南方首都里士满。' },
      { title: '李将军投降', year: 1865, location: '美国 阿波马托克斯', importance: 3, description: '4 月 9 日南方军总司令罗伯特·李将军于阿波马托克斯法院向格兰特将军投降。' },
      { title: '林肯遇刺', year: 1865, location: '美国 华盛顿', importance: 3, description: '4 月 14 日林肯在福特剧院被南方同情者约翰·布斯刺杀，次日身亡。' },
      { title: '宪法修正案', year: 1865, location: '美国', importance: 3, description: '宪法第十三修正案废除奴隶制。第十四修正案（1868）赋予黑人公民权。第十五修正案（1870）赋予黑人选举权。' },
    ],
  },
  {
    key: 'punic',
    title: '布匿战争（罗马 vs 迦太基）',
    startYear: -264,
    endYear: -146,
    icon: '🛡️',
    importance: 2,
    summary: '罗马与迦太基争夺地中海霸权的三次战争（公元前 264-241、218-201、149-146），以汉尼拔翻越阿尔卑斯山和坎尼会战最为著名，最终罗马彻底摧毁迦太基。',
    nodes: [
      { title: '墨西拿事件', year: -264, location: '西西里 墨西拿', importance: 2, description: '墨西拿雇佣兵起义，迦太基先介入，罗马随后。两国争夺西西里引发第一次布匿战争。' },
      { title: '第一次布匿战争爆发', year: -264, location: '西西里', importance: 3, description: '罗马与迦太基争夺西西里岛的战斗引发第一次布匿战争。' },
      { title: '米雷海战', year: -260, location: '意大利', importance: 2, description: '罗马建造 100 艘五列桨战船，在米雷海战中击败迦太基。罗马海军崛起。' },
      { title: '埃克诺穆斯角海战', year: -256, location: '西西里', importance: 2, description: '罗马舰队击败迦太基舰队，罗马获得地中海制海权。' },
      { title: '雷古卢斯入侵非洲', year: -256, location: '北非', importance: 2, description: '罗马将军雷古卢斯率军入侵迦太基本土，初期获胜。' },
      { title: '雷古卢斯战败', year: -255, location: '北非', importance: 2, description: '迦太基在突尼斯击败雷古卢斯，罗马军覆没，雷古卢斯被俘。' },
      { title: '罗马舰队多次损失', year: -253, location: '地中海', importance: 1, description: '罗马海军遭遇风暴，损失惨重。' },
      { title: '帕诺尔穆斯海战', year: -242, location: '西西里', importance: 2, description: '罗马海军最终击败迦太基舰队。' },
      { title: '第一次布匿战争结束', year: -241, location: '西西里', importance: 3, description: '迦太基被迫签订和约，割让西西里岛和周边岛屿，支付 3200 塔兰特赔款。' },
      { title: '迦太基征服伊比利亚', year: -237, location: '西班牙', importance: 2, description: '迦太基将军哈米尔卡·巴卡征服伊比利亚半岛大部分地区。' },
      { title: '汉尼拔继任统帅', year: -221, location: '西班牙', importance: 3, description: '哈米尔卡之子汉尼拔成为迦太基驻伊比利亚军统帅。' },
      { title: '萨贡托事件', year: -219, location: '西班牙', importance: 2, description: '汉尼拔攻陷罗马盟友萨贡托。罗马宣战。' },
      { title: '第二次布匿战争爆发', year: -218, location: '地中海', importance: 3, description: '罗马向迦太基宣战。第二次布匿战争开始。' },
      { title: '汉尼拔翻越阿尔卑斯山', year: -218, location: '阿尔卑斯山', importance: 3, description: '汉尼拔率 6 万大军（含 37 头战象）翻越阿尔卑斯山攻入意大利本土。' },
      { title: '特雷比亚河战役', year: -218, location: '意大利', importance: 2, description: '汉尼拔在特雷比亚河击败罗马军。' },
      { title: '特拉西梅诺湖战役', year: -217, location: '意大利', importance: 3, description: '汉尼拔在特拉西梅诺湖伏击罗马军，弗拉米尼乌斯阵亡。' },
      { title: '坎尼会战', year: -216, location: '意大利 坎尼', importance: 3, description: '"坎尼式合围"经典战例。汉尼拔 5 万迦太基军歼灭罗马军 8 万。' },
      { title: '罗马费边策略', year: -216, location: '意大利', importance: 2, description: '罗马将军费边采取拖延战术，避免与汉尼拔正面决战。' },
      { title: '西西里再战', year: -215, location: '西西里', importance: 1, description: '罗马军在西西里击败迦太基军。' },
      { title: '大西庇阿反攻非洲', year: -204, location: '北非', importance: 3, description: '罗马将军大西庇阿率军反攻迦太基本土。汉尼拔被召回。' },
      { title: '扎马战役', year: -202, location: '北非 扎马', importance: 3, description: '大西庇阿在扎马击败汉尼拔。汉尼拔战术天才败于罗马国力。' },
      { title: '第二次布匿战争结束', year: -201, location: '北非', importance: 3, description: '迦太基签订屈辱和约：失去所有海外领土，交出海军，赔款 1 万塔兰特。' },
      { title: '迦太基复苏', year: -200, location: '北非', importance: 2, description: '迦太基经济奇迹般复苏，但已无力对抗罗马。' },
      { title: '第三次布匿战争爆发', year: -149, location: '北非', importance: 3, description: '罗马元老院借口迦太基违反条约发动第三次布匿战争。' },
      { title: '迦太基围攻', year: -149, location: '北非', importance: 2, description: '罗马军围攻迦太基 3 年。' },
      { title: '迦太基陷落', year: -146, location: '北非', importance: 3, description: '罗马军攻陷迦太基，屠城后将 5 万幸存者卖为奴隶，城市彻底夷为平地。' },
    ],
  },
  {
    key: 'greco-persian',
    title: '希波战争（希腊 vs 波斯）',
    startYear: -499,
    endYear: -449,
    icon: '🏛️',
    importance: 2,
    summary: '希腊城邦反抗波斯帝国侵略的战争（约公元前 500-449），马拉松、温泉关、萨拉米斯海战为关键战役，希腊文明得以延续，奠定西方文明基础。',
    nodes: [
      { title: '米利都起义', year: -499, location: '小亚细亚 米利都', importance: 2, description: '小亚细亚希腊城邦米利都起义反抗波斯，引发希波战争。' },
      { title: '马拉松战役', year: -490, location: '希腊 马拉松', importance: 3, description: '雅典将军米提阿德斯率 1 万希腊军击败 2.5 万波斯军。希波战争第一次重大胜利。' },
      { title: '马拉松勇士传说', year: -490, location: '希腊', importance: 2, description: '希腊勇士 Pheidippides 从马拉松跑回雅典报捷后倒地身亡（42.195 公里）。' },
      { title: '薛西斯一世即位', year: -486, location: '波斯', importance: 2, description: '薛西斯一世继波斯王位，决心征服希腊为父报仇。' },
      { title: '温泉关战役', year: -480, location: '希腊 温泉关', importance: 3, description: '斯巴达国王列奥尼达率 300 勇士死守温泉关 3 天，掩护希腊撤退。' },
      { title: '温泉关列奥尼达阵亡', year: -480, location: '希腊', importance: 3, description: '列奥尼达遣散联军，率 300 斯巴达人和 700 底比斯人留下死战，全员战死。' },
      { title: '雅典撤退', year: -480, location: '希腊 雅典', importance: 2, description: '雅典人被迫撤至萨拉米斯岛。雅典卫城被波斯军焚毁。' },
      { title: '萨拉米斯海战', year: -480, location: '希腊 萨拉米斯', importance: 3, description: '希腊海军在萨拉米斯海峡以少胜多击败波斯舰队。希波战争关键转折。' },
      { title: '薛西斯撤退', year: -480, location: '亚洲', importance: 3, description: '薛西斯目睹惨败后率主力撤回亚洲。' },
      { title: '普拉提亚战役', year: -479, location: '希腊 普拉提亚', importance: 3, description: '希腊联军在普拉提亚击败波斯陆军。马尔多尼乌斯阵亡。' },
      { title: '米卡利战役', year: -479, location: '小亚细亚 米卡利', importance: 2, description: '希腊海军在米卡利再次击败波斯。' },
      { title: '塞斯托斯围攻', year: -478, location: '小亚细亚', importance: 2, description: '希腊联军攻陷波斯军据点塞斯托斯。' },
      { title: '提洛同盟成立', year: -478, location: '希腊 爱琴海', importance: 2, description: '雅典建立提洛同盟，继续对波斯作战。雅典霸权开始。' },
      { title: '欧律梅敦河战役', year: -466, location: '小亚细亚', importance: 2, description: '雅典在欧律梅敦河战役中击败波斯。' },
      { title: '卡利亚战役', year: -459, location: '小亚细亚', importance: 1, description: '雅典和波斯军在小亚细亚南部继续作战。' },
      { title: '赛普苏斯战役', year: -451, location: '塞浦路斯', importance: 1, description: '雅典在塞浦路斯击败波斯。' },
      { title: '卡里阿斯和约', year: -449, location: '小亚细亚', importance: 3, description: '希波战争正式结束。波斯放弃爱琴海沿岸希腊城邦，承认雅典的霸权。' },
    ],
  },
  {
    key: 'alexander-east',
    title: '亚历山大大帝东征',
    startYear: -336,
    endYear: -323,
    icon: '🦅',
    importance: 2,
    summary: '亚历山大大帝 13 年征战建立横跨欧亚非的帝国，将希腊文化传播到东方，开启"希腊化时代"，深刻塑造中东、中亚文明。',
    nodes: [
      { title: '腓力二世遇刺', year: -336, location: '马其顿', importance: 3, description: '马其顿国王腓力二世遇刺身亡，20 岁的亚历山大继位。' },
      { title: '亚历山大继位', year: -336, location: '马其顿', importance: 3, description: '亚历山大大帝继位马其顿王位，迅速平定希腊城邦。' },
      { title: '科林斯同盟', year: -336, location: '希腊 科林斯', importance: 2, description: '亚历山大在科林斯召开希腊会议，建立马其顿领导的希腊同盟。' },
      { title: '东征开始', year: -334, location: '马其顿-小亚细亚', importance: 3, description: '亚历山大大帝率 3.5 万马其顿方阵军和 5000 骑兵，跨过赫勒斯滂海峡开始东征。' },
      { title: '格拉尼库斯河战役', year: -334, location: '小亚细亚 格拉尼库斯', importance: 3, description: '亚历山大在格拉尼库斯河击败波斯军，开辟通往小亚细亚的道路。' },
      { title: '小亚细亚解放', year: -333, location: '小亚细亚', importance: 2, description: '亚历山大解放小亚细亚希腊城邦。' },
      { title: '伊苏斯战役', year: -333, location: '土耳其 伊苏斯', importance: 3, description: '亚历山大在伊苏斯击败大流士三世亲率的波斯军。波斯王室被俘。' },
      { title: '推罗围攻', year: -332, location: '黎巴嫩 推罗', importance: 3, description: '亚历山大围攻腓尼基城市推罗 7 个月，最终攻陷。' },
      { title: '加沙围攻', year: -332, location: '巴勒斯坦 加沙', importance: 2, description: '亚历山大攻陷加沙。' },
      { title: '埃及征服', year: -332, location: '埃及', importance: 3, description: '亚历山大进入埃及，被拥戴为法老。在尼罗河三角洲建立亚历山大城。' },
      { title: '阿蒙神谕所访问', year: -331, location: '埃及 利比亚沙漠', importance: 2, description: '亚历山大访问锡瓦阿蒙神谕所，被神谕承认为神之子。' },
      { title: '高加米拉战役', year: -331, location: '伊拉克 高加米拉', importance: 3, description: '亚历山大以 4.7 万人击败大流士三世 20 万大军。决定性胜利。' },
      { title: '波斯波利斯焚毁', year: -330, location: '伊朗 波斯波利斯', importance: 3, description: '亚历山大焚毁波斯帝国首都波斯波利斯王宫，象征波斯帝国终结。' },
      { title: '大流士三世遇害', year: -330, location: '中亚', importance: 2, description: '大流士三世被其下属贝苏斯谋杀。亚历山大追击贝苏斯并处决他。' },
      { title: '波斯帝国灭亡', year: -330, location: '中东', importance: 3, description: '亚历山大正式接管波斯帝国领土。' },
      { title: '中亚战役', year: -329, location: '中亚', importance: 2, description: '亚历山大进军中亚，征服粟特、巴克特里亚等地区。' },
      { title: '索格底亚那起义', year: -328, location: '中亚', importance: 2, description: '中亚地区起义反抗。亚历山大亲率军平定。' },
      { title: '东方政策', year: -327, location: '中亚', importance: 2, description: '亚历山大推行"东西方融合"政策，鼓励马其顿人与波斯人通婚。' },
      { title: '印度战役', year: -327, location: '南亚', importance: 3, description: '亚历山大翻越兴都库什山入侵印度，击败波罗斯国王。' },
      { title: '海达斯佩斯河战役', year: -326, location: '印度', importance: 3, description: '亚历山大在海达斯佩斯河击败波罗斯国王，伤亡惨重。' },
      { title: '军队哗变', year: -326, location: '印度', importance: 3, description: '马其顿军拒绝继续东进，亚历山大被迫班师。这是亚历山大事业的转折点。' },
      { title: '印度河回师', year: -325, location: '南亚', importance: 2, description: '亚历山大率军沿印度河南下，舰队在尼阿库斯率领下驶向波斯湾。' },
      { title: '穿越格德罗西亚沙漠', year: -325, location: '伊朗', importance: 2, description: '亚历山大率军穿越格德罗西亚沙漠，大量士兵渴死渴伤。' },
      { title: '回到苏萨', year: -324, location: '伊朗 苏萨', importance: 2, description: '亚历山大率军回到苏萨，与大流士三世遗孀斯塔提拉成婚。' },
      { title: '巴比伦计划', year: -323, location: '伊拉克 巴比伦', importance: 2, description: '亚历山大在巴比伦规划进一步远征——阿拉伯、北非。' },
      { title: '亚历山大病逝', year: -323, location: '伊拉克 巴比伦', importance: 3, description: '6 月 10 日亚历山大大帝在巴比伦病逝，年仅 32 岁。帝国由部将瓜分。' },
    ],
  },
]

interface Props {
  isActive: boolean
  onClose: () => void
  /** 跳到主地图：父组件关闭本视图 + 切到地图 */
  onViewOnMap?: () => void
}

type RegionFilter = 'all' | 'china' | 'world'

export default function WarsOverview({ isActive, onClose, onViewOnMap }: Props) {
  const [region, setRegion] = useState<RegionFilter>('all')
  const [importance, setImportance] = useState<0 | 1 | 2 | 3>(0)
  const [query, setQuery] = useState('')
  const [selectedWar, setSelectedWar] = useState<HistoricalEvent | null>(null)
  const [selectedMajorWar, setSelectedMajorWar] = useState<MajorWar | null>(null)

  // AI 对话准备
  const setContext = useAIStore(s => s.setContext)
  const setPersonaPrompt = useAIStore(s => s.setPersonaPrompt)
  const newThread = useAIStore(s => s.newThread)
  const openPanel = useAIStore(s => s.openPanel)
  const allContexts = useAllLearningContexts()
  // 跳到地图：设置年份 + 聚焦到战争地点
  const setYear = useHistoryStore(s => s.setYear)
  const setMapFocus = useHistoryStore(s => s.setMapFocus)

  /** 处理"在地图看位置"：年份 + 坐标定位 + 通知父组件切到地图 */
  const handleViewOnMap = (war: HistoricalEvent) => {
    if (war.coordinates) {
      setYear(war.year)
      setMapFocus({
        center: war.coordinates,
        zoom: 4,
        label: war.title,
      })
    } else {
      // 没坐标的战争：只切年份
      setYear(war.year)
    }
    setSelectedWar(null)
    onViewOnMap?.()
  }

  // ESC 关闭
  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedWar) setSelectedWar(null)
        else if (selectedMajorWar) setSelectedMajorWar(null)
        else onClose()
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [isActive, selectedWar, selectedMajorWar, onClose])

  if (!isActive) return null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return wars.filter(w => {
      if (region === 'china' && w.region !== 'china') return false
      if (region === 'world' && w.region === 'china') return false
      if (importance > 0 && w.importance !== importance) return false
      if (q && !(w.title.toLowerCase().includes(q) || (w.description ?? '').toLowerCase().includes(q))) return false
      return true
    }).sort((a, b) => a.year - b.year)
  }, [region, importance, query])

  const handleChat = (war: HistoricalEvent) => {
    // 上下文：所属朝代（让 AI 知道背景时期）
    setContext(war.relatedEraId ?? null, war.id, null)
    // 拼上学习上下文（让 AI 知道用户学过什么）
    const contextString = allContexts[war.relatedEraId ?? '']?.contextString ?? ''
    // persona prompt 注入战争的 4 段内容（如有）+ 守则
    const warDetails = [
      war.warBackground && `【背景】\n${war.warBackground}`,
      war.description && `【经过】\n${war.description}`,
      war.warResult && `【结果】\n${war.warResult}`,
      war.warImpact && `【影响】\n${war.warImpact}`,
    ].filter(Boolean).join('\n\n')
    const basePersona = `你是历史军事专家。请基于以下这场战争的背景资料回答用户问题，保持客观中立，引述史料，遇到存疑处说明学界争议。\n\n【战争】${war.title}（${war.year < 0 ? `BC ${-war.year}` : war.year}）\n${war.country ? `地点：${war.country}\n` : ''}${warDetails}`
    const persona = enhancePersonaPrompt(basePersona + contextString, '历史军事专家')
    setPersonaPrompt(persona)
    newThread(`关于 ${war.title}`)
    openPanel()
    setSelectedWar(null)
  }

  return (
    <div className="w-full h-full bg-ink-900 overflow-y-auto">
      {/* 头部 */}
      <div className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur border-b border-red-700/40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-serif text-red-300">⚔️ 全战争</h2>
              <p className="text-xs text-ink-500 mt-1">
                {filtered.length} / {wars.length} 场战争 · 从公元前 1046 武王伐纣到 20 世纪
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-ink-500 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-ink-700"
              title="返回 Dashboard (ESC)"
            >
              ×
            </button>
          </div>
          {/* 筛选条 */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded bg-ink-700/60 border border-ink-600 overflow-hidden text-xs">
              {(['all', 'china', 'world'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`px-3 py-1.5 transition-colors ${
                    region === r
                      ? 'bg-red-700/40 text-red-300'
                      : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'
                  }`}
                >
                  {r === 'all' ? '全部' : r === 'china' ? '🇨🇳 中国' : '🌍 世界'}
                </button>
              ))}
            </div>
            <div className="flex rounded bg-ink-700/60 border border-ink-600 overflow-hidden text-xs">
              {([0, 1, 2, 3] as const).map(i => (
                <button
                  key={i}
                  onClick={() => setImportance(i)}
                  className={`px-2.5 py-1.5 transition-colors ${
                    importance === i
                      ? 'bg-red-700/40 text-red-300'
                      : 'text-ink-400 hover:text-parchment-50 hover:bg-ink-600'
                  }`}
                  title={i === 0 ? '全部' : `重要性 ${i}（${i === 3 ? '关键' : i === 2 ? '重要' : '一般'}）`}
                >
                  {i === 0 ? '全部' : `${'⭐'.repeat(i)}`}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索战争名/描述..."
              className="flex-1 min-w-[200px] text-xs px-3 py-1.5 bg-ink-700/60 border border-ink-600 rounded text-parchment-50 placeholder-ink-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
      </div>

      {/* 🔥 大型/长期战争专题 — 单独的醒目栏目 */}
      {MAJOR_WARS.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="mb-3 flex items-baseline gap-2">
            <h3 className="text-base font-serif text-red-300">🔥 大型战争专题</h3>
            <span className="text-xs text-ink-500">持续多年、多国卷入的综合博弈</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {MAJOR_WARS.map(mw => {
              const startYearLabel = mw.startYear < 0 ? `BC ${-mw.startYear}` : `${mw.startYear}`
              const endYearLabel = mw.endYear < 0 ? `BC ${-mw.endYear}` : `${mw.endYear}`
              return (
                <div
                  key={mw.key}
                  className="p-4 rounded-lg border border-red-700/40 bg-gradient-to-br from-red-950/30 to-ink-800/80 hover:border-red-500/80 transition-colors"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-2xl flex-shrink-0">{mw.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-serif text-red-200 truncate">{mw.title}</div>
                      <div className="text-[10px] text-ink-400 tabular-nums">
                        {startYearLabel} ~ {endYearLabel} · {mw.nodes.length} 个关键节点
                      </div>
                    </div>
                    {mw.importance === 3 && (
                      <span className="text-[10px] text-amber-400">⭐ 关键</span>
                    )}
                  </div>
                  <div className="text-[11px] text-parchment-100 leading-relaxed mb-2 line-clamp-3">
                    {mw.summary}
                  </div>
                  {/* 显示前 3 个关键节点标题 */}
                  <div className="text-[10px] text-ink-500 mb-2">
                    关键节点预览：
                    {mw.nodes.slice(0, 3).map((n, i) => (
                      <span key={i} className="ml-1 text-ink-400">
                        {n.title}{i < Math.min(2, mw.nodes.length - 1) ? '、' : ''}
                      </span>
                    ))}
                    {mw.nodes.length > 3 && <span className="text-ink-600"> 等</span>}
                  </div>
                  {/* 进入专题详情按钮 */}
                  <button
                    onClick={() => setSelectedMajorWar(mw)}
                    className="w-full px-3 py-1.5 rounded bg-red-800/50 hover:bg-red-700/70 border border-red-600/60 text-red-100 text-xs transition-colors"
                  >
                    📖 进入专题详情 →
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 列表 */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {filtered.length === 0 ? (
          <div className="text-center text-ink-500 py-12">未找到匹配的战争</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filtered.map(war => {
              const yearLabel = war.year < 0 ? `BC ${-war.year}` : `${war.year}`
              const relatedEra = war.relatedEraId ? eras.find(e => e.id === war.relatedEraId) : null
              return (
                <button
                  key={war.id}
                  onClick={() => setSelectedWar(war)}
                  className="text-left p-3 rounded border border-ink-600 bg-ink-800/60 hover:border-red-500/60 hover:bg-ink-700/60 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-red-400 tabular-nums font-serif">{yearLabel}</span>
                    {war.importance === 3 && <span className="text-amber-400 text-xs">⭐ 关键</span>}
                    {war.importance === 2 && <span className="text-amber-400/60 text-xs">⭐ 重要</span>}
                    {war.region === 'china'
                      ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/30 text-amber-300 border border-amber-700/40">中国</span>
                      : <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-700/40">世界</span>
                    }
                    <span className="text-sm font-serif text-parchment-50 truncate">{war.title}</span>
                  </div>
                  <div className="text-[11px] text-ink-400 line-clamp-2">{war.description}</div>
                  {relatedEra && (
                    <div className="text-[10px] text-ink-500 mt-1">
                      朝代：<span style={{ color: relatedEra.color }}>{relatedEra.name}</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      {selectedWar && (
        <WarDetailDialog
          war={selectedWar}
          onClose={() => setSelectedWar(null)}
          onChat={() => handleChat(selectedWar)}
          onViewOnMap={() => handleViewOnMap(selectedWar)}
        />
      )}

      {/* 🔥 大型战争专题详情弹窗 */}
      {selectedMajorWar && (
        <MajorWarDetailDialog
          mw={selectedMajorWar}
          onClose={() => setSelectedMajorWar(null)}
          onChat={(node) => {
            // 把 node 包装成 ad-hoc HistoricalEvent 给 handleChat
            const adHocWar: HistoricalEvent = {
              id: `major-${selectedMajorWar.key}-${node.year}-${node.title.slice(0, 4)}`,
              year: node.year,
              title: node.title,
              category: '军事',
              region: node.location.includes('中国') || node.location.includes('北京') || node.location.includes('上海') || node.location.includes('汉') || node.location.includes('秦') ? 'china' : 'other',
              description: node.description,
              importance: node.importance,
            }
            setSelectedMajorWar(null)
            handleChat(adHocWar)
          }}
        />
      )}
    </div>
  )
}

function WarDetailDialog({ war, onClose, onChat, onViewOnMap }: {
  war: HistoricalEvent
  onClose: () => void
  onChat: () => void
  onViewOnMap: () => void
}) {
  const yearLabel = war.year < 0 ? `BC ${-war.year}` : `${war.year}`
  const relatedEra = war.relatedEraId ? eras.find(e => e.id === war.relatedEraId) : null

  // 根据 importance 决定内容丰富度
  const isKey = war.importance === 3
  const isMajor = war.importance === 2

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-red-700/40 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur border-b border-red-700/30 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-ink-500 mb-1 flex items-center gap-2">
              <span>⚔️ 战争</span>
              <span className="tabular-nums">{yearLabel}</span>
              {isKey && <span className="text-amber-400">⭐ 关键</span>}
              {isMajor && <span className="text-amber-400/60">⭐ 重要</span>}
            </div>
            <h3 className="text-xl font-serif text-red-300">{war.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-ink-500 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-ink-700"
          >
            ×
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* 朝代 / 时期 */}
          {relatedEra && (
            <div>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1.5">🏛️ 所属朝代</div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-xs px-2 py-0.5 rounded border"
                  style={{ background: relatedEra.color + '20', color: relatedEra.color, borderColor: relatedEra.color + '40' }}
                >
                  {relatedEra.name}
                </span>
                <span className="text-[10px] text-ink-500 tabular-nums">
                  {relatedEra.startYear < 0 ? `BC ${-relatedEra.startYear}` : relatedEra.startYear} ~ {relatedEra.endYear < 0 ? `BC ${-relatedEra.endYear}` : relatedEra.endYear}
                </span>
              </div>
            </div>
          )}

          {/* 地理位置 */}
          {war.country && (
            <div>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1.5">📍 地点</div>
              <div className="text-sm text-parchment-50">{war.country}</div>
              {war.coordinates && (
                <div className="text-[10px] text-ink-500 tabular-nums mt-0.5">
                  {war.coordinates[0].toFixed(2)}°E, {war.coordinates[1].toFixed(2)}°N
                </div>
              )}
            </div>
          )}

          {/* 背景 — 战前形势 */}
          {war.warBackground && (
            <div>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1.5">📜 战争背景</div>
              <div className="text-sm text-parchment-100 leading-relaxed whitespace-pre-line">
                {war.warBackground}
              </div>
            </div>
          )}

          {/* 经过 — 主描述（必显示） */}
          <div>
            <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1.5">⚔️ 战争经过</div>
            <div className="text-sm text-parchment-100 leading-relaxed whitespace-pre-line">
              {war.description ?? '（暂无描述）'}
            </div>
          </div>

          {/* 结果 — 胜负/签约 */}
          {war.warResult && (
            <div>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1.5">🏁 战争结果</div>
              <div className="text-sm text-parchment-100 leading-relaxed whitespace-pre-line">
                {war.warResult}
              </div>
            </div>
          )}

          {/* 影响 — 后世格局变化（如果有） */}
          {war.warImpact && (
            <div className="p-3 rounded bg-amber-900/15 border border-amber-700/40">
              <div className="text-[10px] text-amber-400 uppercase tracking-wider mb-1.5">🎯 历史影响</div>
              <div className="text-sm text-parchment-100 leading-relaxed">
                {war.warImpact}
              </div>
            </div>
          )}

          {/* 关联事件（同一战争的后续/前奏） */}
          {war.relatedEventIds && war.relatedEventIds.length > 0 && (
            <div>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1.5">🔗 关联事件</div>
              <div className="flex flex-wrap gap-1.5">
                {war.relatedEventIds.map(eid => {
                  const related = events.find(e => e.id === eid)
                  if (!related) return null
                  return (
                    <span
                      key={eid}
                      className="text-xs px-2 py-0.5 rounded bg-ink-700/60 text-ink-300 border border-ink-600"
                      title={`${related.year < 0 ? `BC ${-related.year}` : related.year} · ${related.title}`}
                    >
                      {related.title}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* 重要度提示（无 warImpact 时 fallback） */}
          {isKey && !war.warImpact && (
            <div className="p-3 rounded bg-amber-900/20 border border-amber-700/40">
              <div className="text-[10px] text-amber-400 uppercase tracking-wider mb-1">🎯 历史意义</div>
              <div className="text-xs text-parchment-100 leading-relaxed">
                这场战争被史学界视为<strong className="text-amber-300">改写历史进程</strong>的关键事件。
                {relatedEra && <>它直接影响了<strong style={{ color: relatedEra.color }}>{relatedEra.name}</strong>的走向。 </>}
                建议从其所属朝代/时期的"朝代时间线"路径了解更完整的上下文。
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-3 border-t border-ink-700">
            {war.coordinates && (
              <button
                onClick={onViewOnMap}
                className="flex-1 px-4 py-2.5 rounded bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-600/50 text-emerald-200 text-sm transition-colors"
              >
                🗺️ 在地图看位置
              </button>
            )}
            <button
              onClick={onChat}
              className="flex-1 px-4 py-2.5 rounded bg-red-900/40 hover:bg-red-800/60 border border-red-600/50 text-red-200 text-sm transition-colors"
            >
              💬 询问这场战争
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-ink-300 text-sm transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * MajorWarDetailDialog — 大型战争专题详情
 * 显示专题导语 + 子事件时间线列表（每条可点开弹窗）
 */
function MajorWarDetailDialog({ mw, onClose, onChat }: {
  mw: MajorWar
  onClose: () => void
  onChat: (node: MajorWarNode) => void
}) {
  const startYearLabel = mw.startYear < 0 ? `BC ${-mw.startYear}` : `${mw.startYear}`
  const endYearLabel = mw.endYear < 0 ? `BC ${-mw.endYear}` : `${mw.endYear}`

  return (
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center bg-ink-900/85 backdrop-blur p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin bg-ink-800 rounded-lg border border-red-700/40 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-red-950/80 to-ink-800/95 backdrop-blur border-b border-red-700/40 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-ink-400 mb-1 flex items-center gap-2">
              <span>🔥 大型战争专题</span>
              {mw.importance === 3 && <span className="text-amber-400">⭐ 关键</span>}
            </div>
            <h3 className="text-2xl font-serif text-red-200 flex items-center gap-2">
              <span className="text-3xl">{mw.icon}</span>
              {mw.title}
            </h3>
            <div className="text-xs text-ink-400 tabular-nums mt-1">
              {startYearLabel} ~ {endYearLabel} · {mw.nodes.length} 个关键节点
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-500 hover:text-parchment-50 text-xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-ink-700"
            title="关闭 (ESC)"
          >
            ×
          </button>
        </div>

        {/* 导语 */}
        <div className="p-6 pb-3">
          <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-2">📜 战争总览</div>
          <div className="text-sm text-parchment-100 leading-relaxed">{mw.summary}</div>
        </div>

        {/* 节点时间线 */}
        <div className="px-6 pb-6">
          <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-3">⚔️ 关键节点事件（{mw.nodes.length}）</div>
          {mw.nodes.length === 0 ? (
            <div className="text-xs text-ink-500 italic">（暂无节点）</div>
          ) : (
            <div className="relative pl-5">
              {/* 时间线竖线 */}
              <div className="absolute left-1.5 top-1 bottom-1 w-px bg-red-700/40" />
              <div className="space-y-3">
                {mw.nodes.map((node, i) => {
                  const yearLabel = node.year < 0 ? `BC ${-node.year}` : `${node.year}`
                  return (
                    <div key={i} className="relative">
                      {/* 时间线圆点 */}
                      <div
                        className="absolute -left-3.5 top-1 w-2.5 h-2.5 rounded-full ring-2 ring-ink-800"
                        style={{ background: node.importance === 3 ? '#b85450' : '#8a6a55' }}
                      />
                      <div className="p-3 rounded border border-ink-600 bg-ink-700/30">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs text-red-300 tabular-nums font-serif">{yearLabel}</span>
                          {node.importance === 3 && <span className="text-amber-400 text-[10px]">⭐ 关键</span>}
                          {node.location && (
                            <span className="text-[10px] text-ink-500">📍 {node.location}</span>
                          )}
                        </div>
                        <div className="text-sm font-serif text-parchment-50 mb-1.5">{node.title}</div>
                        <div className="text-[11px] text-ink-300 leading-relaxed">
                          {node.description}
                        </div>
                        <button
                          onClick={() => onChat(node)}
                          className="mt-2 text-[10px] px-2 py-0.5 rounded bg-red-900/30 hover:bg-red-800/60 border border-red-700/40 hover:border-red-500/60 text-red-200 transition-colors"
                        >
                          💬 询问此节点
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="sticky bottom-0 z-10 bg-ink-800/95 backdrop-blur border-t border-ink-600 px-6 py-3 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 rounded bg-ink-700/60 hover:bg-ink-600 border border-ink-600 text-ink-300 text-xs transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
