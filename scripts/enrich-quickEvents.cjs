// 为所有 era 重新生成完整发展史（6-10 个事件）
// 策略：
// 1. 用 events.json 里所有匹配的事件
// 2. 按时间均匀分布在 era 整个生命周期内
// 3. 加上 era.quickEvents 里已有的（手工数据优先）
// 4. 用 startYear/endYear 均分
// 5. 移除重复

const fs = require('fs');
const eras = JSON.parse(fs.readFileSync('src/data/eras.json', 'utf8'));
const events = JSON.parse(fs.readFileSync('src/data/events.json', 'utf8'));

// 别名映射（其他文明的 era 关键词识别）
const ALIASES = {
  'british-empire': ['英国', '不列颠', '英格兰', '英伦', '维多利亚', '爱德华', '伊丽莎白', '伦敦', '苏格兰', '爱尔兰'],
  'ancient-egypt': ['埃及', '法老', '尼罗', '金字塔', '木乃伊', '图坦卡蒙', '克娄巴特拉', '拉美西斯'],
  'france': ['法国', '巴黎', '法兰西', '拿破仑', '波旁', '戴高乐', '巴士底', '路易', '大革命'],
  'japan': ['日本', '大和', '平安', '镰仓', '室町', '江户', '明治', '德川', '丰臣', '源氏', '平氏', '天皇', '幕府', '新罗'],
  'rome-republic': ['罗马共和国', '罗马帝国', '共和国', '执政官', '元老院', '凯撒', '西塞罗'],
  'rome-empire': ['罗马帝国', '帝国', '奥古斯都', '戴克里先', '君士坦丁', '屋大维', '图拉真', '查士丁尼'],
  'byzantine': ['拜占庭', '君士坦丁堡', '东罗马', '查士丁尼', '狄奥多西'],
  'arab-caliphate': ['阿拉伯', '麦加', '麦地那', '穆罕默德', '哈里发', '阿拔斯', '倭马亚', '巴格达'],
  'ottoman': ['奥斯曼', '苏丹', '伊斯坦布尔', '穆罕默德二世', '君士坦丁堡', '土耳其'],
  'mongol-empire': ['蒙古', '成吉思汗', '忽必烈', '伊尔', '帖木儿', '金帐汗国', '元朝'],
  'persia-safavid': ['波斯', '萨法维', '阿拔斯', '萨珊', '居鲁士', '大流士', '哈桑', '设拉子'],
  'gupta-empire': ['笈多', '印度', '阿育王', '恒河', '孔雀'],
  'maurya-empire': ['孔雀', '阿育王', '旃陀罗笈多', '摩揭陀'],
  'han-west': ['西汉', '汉武帝', '刘邦', '文景之治', '张骞', '卫青', '霍去病', '长安'],
  'han-east': ['东汉', '刘秀', '光武', '班超', '张衡', '蔡伦'],
  'tang': ['唐', '李世民', '武则天', '玄奘', '安禄山', '李隆基', '长安', '贞观', '开元', '武周'],
  'song-north': ['北宋', '赵匡胤', '王安石', '苏轼', '岳飞', '汴京', '开封'],
  'song-south': ['南宋', '赵构', '岳飞', '文天祥', '临安', '杭州', '陆游'],
  'yuan': ['元', '忽必烈', '马可波罗', '成吉思汗', '元朝'],
  'ming': ['明', '朱元璋', '朱棣', '郑和', '崇祯', '紫禁城'],
  'qing': ['清', '努尔哈赤', '康熙', '乾隆', '乾隆', '乾隆', '乾隆', '乾隆', '乾隆', '乾隆', '乾隆', '乾隆', '乾隆', '乾隆'],
  'macedonia': ['马其顿', '亚历山大', '腓力二世', '塞琉古', '帕提亚'],
  'aztec': ['阿兹特克', '特诺奇蒂特兰', '蒙特祖玛', '科尔特斯', '墨西哥'],
  'inca': ['印加', '库斯科', '马丘比丘', '皮萨罗', '塔万廷苏约'],
  'maya': ['玛雅', '奇琴伊察', '蒂卡尔', '玛雅'],
  'sumerian': ['苏美尔', '两河流域', '美索不达米亚', '乌尔', '吉尔伽美什', '拉伽什', '楔形文字'],
  'spring-autumn': ['春秋', '战国', '孔子', '百家争鸣', '老子', '齐桓公', '晋文公'],
  'three-kingdoms': ['三国', '曹操', '刘备', '孙权', '诸葛亮', '司马懿'],
  'ming-pre': ['元末', '红巾军', '陈友谅', '张士诚'],
};

// 中国朝代按 region='china' 匹配；其他用关键词
function eventsForEra(era) {
  if (era.region === 'china') {
    return events.filter(e =>
      e.relatedEraId === era.id ||
      (e.region === era.region && e.year >= era.startYear && e.year <= era.endYear)
    );
  }
  // 关键词匹配
  const name = era.name;
  const aliases = ALIASES[era.id] || [name];
  return events.filter(e => {
    if (e.relatedEraId === era.id) return true;
    if (e.year < era.startYear || e.year > era.endYear) return false;
    if (aliases.some(a => e.title.includes(a))) return true;
    if (e.description && aliases.some(a => e.description.includes(a))) return true;
    return false;
  });
}

// 按时间均匀分布
function pickDistributed(matches, target) {
  if (matches.length === 0) return []
  if (matches.length <= target) return matches.sort((a, b) => a.year - b.year)
  const sorted = matches.sort((a, b) => a.year - b.year)
  // 均匀采样
  const result = []
  const step = (sorted.length - 1) / (target - 1)
  for (let i = 0; i < target; i++) {
    result.push(sorted[Math.round(i * step)])
  }
  return result
}

// 统计
let stats = { filled: 0, total: 0, distribution: {} }
for (const era of eras) {
  stats.total++
  const matched = eventsForEra(era)
  const target = matched.length >= 10 ? 10 : matched.length >= 7 ? 8 : matched.length >= 4 ? 6 : matched.length
  const picked = pickDistributed(matched, target)
  if (picked.length > 0) {
    era.quickEvents = picked.map(e => ({
      year: e.year,
      title: e.title,
      desc: e.description?.slice(0, 30) || ''
    }))
    stats.filled++
    stats.distribution[picked.length] = (stats.distribution[picked.length] || 0) + 1
  } else {
    era.quickEvents = []
  }
}
fs.writeFileSync('src/data/eras.json', JSON.stringify(eras, null, 2) + '\n')
console.log('Filled', stats.filled, '/', stats.total)
console.log('Distribution:', JSON.stringify(stats.distribution))
