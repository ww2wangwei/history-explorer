/**
 * myth-characters.ts — 神话角色数据
 *
 * 7 大文明的关键角色（~80 个），供角色网络图谱使用
 * 关系字段（parent/spouse/children/siblings/enemies）只填对方 id，由 myth-relationships.ts 自动展开为双向边
 */
export interface MythCharacter {
  id: string
  name: string
  civilization: 'china' | 'greece' | 'norse' | 'india' | 'egypt' | 'japan' | 'maya'
  role: string
  domain?: string
  appearsIn: string[]  // mythology id 列表
  imageKeyword?: string
}

export const MYTH_CHARACTERS: MythCharacter[] = [
  // ===== 中国 =====
  { id: 'pangu', name: '盘古', civilization: 'china', role: '创世神', domain: '开辟', appearsIn: ['pangu'], imageKeyword: 'pangu chinese myth axe' },
  { id: 'nvwa', name: '女娲', civilization: 'china', role: '造物神', domain: '造化、修补', appearsIn: ['nvwa-repair', 'nvwa-create', 'gonggong'], imageKeyword: 'nvwa chinese goddess' },
  { id: 'huangdi', name: '黄帝', civilization: 'china', role: '人文初祖', domain: '战争、医药', appearsIn: ['xuanyuan-war'], imageKeyword: 'yellow emperor china' },
  { id: 'chiyou', name: '蚩尤', civilization: 'china', role: '战神', domain: '战争', appearsIn: ['xuanyuan-war'], imageKeyword: 'chiyou war god china' },
  { id: 'houyi', name: '后羿', civilization: 'china', role: '英雄', domain: '射箭', appearsIn: ['houyi-shoot', 'jingwei-sister'], imageKeyword: 'houyi archer china' },
  { id: 'change', name: '嫦娥', civilization: 'china', role: '月神', domain: '月亮', appearsIn: ['houyi-shoot', 'jingwei-sister'], imageKeyword: 'change moon goddess' },
  { id: 'kuafu', name: '夸父', civilization: 'china', role: '巨人', domain: '追逐', appearsIn: ['kuafu-chase'], imageKeyword: 'kuafu giant chase sun' },
  { id: 'jingwei', name: '精卫', civilization: 'china', role: '复仇精灵', domain: '填海', appearsIn: ['jingwei-fill'], imageKeyword: 'jingwei bird fill ocean' },
  { id: 'gonggong', name: '共工', civilization: 'china', role: '水神', domain: '洪水', appearsIn: ['nvwa-repair', 'gonggong'], imageKeyword: 'gonggong water god' },
  { id: 'zhuanxu', name: '颛顼', civilization: 'china', role: '帝', domain: '天帝', appearsIn: ['gonggong'], imageKeyword: 'zhuanxu emperor' },
  { id: 'yu', name: '禹', civilization: 'china', role: '治水英雄', domain: '水利', appearsIn: ['yugao-mend'], imageKeyword: 'yu great flood control' },
  { id: 'gun', name: '鲧', civilization: 'china', role: '治水英雄', domain: '水利', appearsIn: ['yugao-mend'], imageKeyword: 'gun flood china' },
  { id: 'niulang', name: '牛郎', civilization: 'china', role: '凡人', domain: '爱情', appearsIn: ['cowherd-weaver'], imageKeyword: 'niulang cowherd' },
  { id: 'zhinv', name: '织女', civilization: 'china', role: '天女', domain: '织锦', appearsIn: ['cowherd-weaver'], imageKeyword: 'zhinu weaver girl' },
  { id: 'nezha', name: '哪吒', civilization: 'china', role: '少年神', domain: '战斗', appearsIn: ['nezha'], imageKeyword: 'nezha lotus china' },
  { id: 'lijing', name: '李靖', civilization: 'china', role: '将军', domain: '军事', appearsIn: ['nezha'], imageKeyword: 'lijing china father' },
  { id: 'taibai', name: '太乙真人', civilization: 'china', role: '仙人', domain: '道术', appearsIn: ['nezha'], imageKeyword: 'taibai immortal' },
  { id: 'baigezhu', name: '白蛇（白素贞）', civilization: 'china', role: '蛇仙', domain: '爱情', appearsIn: ['bai-snake'], imageKeyword: 'white snake lady' },
  { id: 'fahai', name: '法海', civilization: 'china', role: '禅师', domain: '佛法', appearsIn: ['bai-snake'], imageKeyword: 'fahai monk white snake' },
  { id: 'wukong', name: '孙悟空', civilization: 'china', role: '齐天大圣', domain: '战斗、变化', appearsIn: ['monkey-king'], imageKeyword: 'wukong monkey king' },
  { id: 'daji', name: '妲己', civilization: 'china', role: '九尾狐妖', domain: '蛊惑', appearsIn: ['daji'], imageKeyword: 'daji fox demon' },

  // ===== 希腊 =====
  { id: 'gaia', name: '盖亚', civilization: 'greece', role: '大地母神', domain: '大地', appearsIn: ['chaos-cosmogony'], imageKeyword: 'gaia greek mother earth' },
  { id: 'ouranos', name: '乌拉诺斯', civilization: 'greece', role: '天空之神', domain: '天空', appearsIn: ['chaos-cosmogony'], imageKeyword: 'ouranos greek sky' },
  { id: 'krónos', name: '克罗诺斯', civilization: 'greece', role: '提坦之王', domain: '时间', appearsIn: ['chaos-cosmogony', 'zeus-overthrow'], imageKeyword: 'kronos greek titan' },
  { id: 'rheia', name: '瑞亚', civilization: 'greece', role: '提坦女神', domain: '母性', appearsIn: ['chaos-cosmogony', 'zeus-overthrow'], imageKeyword: 'rhea greek mother' },
  { id: 'zeus', name: '宙斯', civilization: 'greece', role: '众神之王', domain: '天空、雷电', appearsIn: ['zeus-overthrow', 'prometheus-fire', 'pandoras-jar', 'persephone', 'apollo'], imageKeyword: 'zeus greek god thunder' },
  { id: 'hera', name: '赫拉', civilization: 'greece', role: '天后', domain: '婚姻', appearsIn: ['zeus-overthrow'], imageKeyword: 'hera greek queen' },
  { id: 'poseidon', name: '波塞冬', civilization: 'greece', role: '海神', domain: '海洋、地震', appearsIn: ['zeus-overthrow'], imageKeyword: 'poseidon greek sea' },
  { id: 'hades', name: '哈迪斯', civilization: 'greece', role: '冥王', domain: '冥界', appearsIn: ['zeus-overthrow', 'persephone', 'orpheus-euridice'], imageKeyword: 'hades greek underworld' },
  { id: 'demeter', name: '得墨忒耳', civilization: 'greece', role: '农业女神', domain: '丰收', appearsIn: ['zeus-overthrow', 'persephone'], imageKeyword: 'demeter greek harvest' },
  { id: 'prometheus', name: '普罗米修斯', civilization: 'greece', role: '提坦神', domain: '火、预知', appearsIn: ['prometheus-fire', 'pandoras-jar'], imageKeyword: 'prometheus greek fire' },
  { id: 'epimetheus', name: '厄庇米修斯', civilization: 'greece', role: '提坦神', domain: '后悔', appearsIn: ['pandoras-jar'], imageKeyword: 'epimetheus greek' },
  { id: 'pandora', name: '潘多拉', civilization: 'greece', role: '凡女', domain: '灾祸', appearsIn: ['pandoras-jar'], imageKeyword: 'pandora greek box' },
  { id: 'persephone', name: '珀耳塞福涅', civilization: 'greece', role: '冥后', domain: '四季', appearsIn: ['persephone'], imageKeyword: 'persephone greek' },
  { id: 'athena', name: '雅典娜', civilization: 'greece', role: '智慧女神', domain: '智慧、工艺', appearsIn: ['athena-arachne', 'artemis-apollo'], imageKeyword: 'athena greek wisdom' },
  { id: 'arachne', name: '阿拉克妮', civilization: 'greece', role: '凡女', domain: '织布', appearsIn: ['athena-arachne'], imageKeyword: 'arachne spider greek' },
  { id: 'orpheus', name: '俄耳甫斯', civilization: 'greece', role: '歌手', domain: '音乐', appearsIn: ['orpheus-euridice'], imageKeyword: 'orpheus greek music' },
  { id: 'eurydice', name: '欧律狄刻', civilization: 'greece', role: '凡人', domain: '爱情', appearsIn: ['orpheus-euridice'], imageKeyword: 'eurydice greek' },
  { id: 'odysseus', name: '奥德修斯', civilization: 'greece', role: '英雄', domain: '机智', appearsIn: ['odysseus-trojan'], imageKeyword: 'odysseus greek' },
  { id: 'theseus', name: '忒修斯', civilization: 'greece', role: '英雄', domain: '迷宫', appearsIn: ['theseus-minotaur'], imageKeyword: 'theseus greek' },
  { id: 'minotauros', name: '米诺陶洛斯', civilization: 'greece', role: '怪物', domain: '迷宫', appearsIn: ['theseus-minotaur'], imageKeyword: 'minotaur greek' },
  { id: 'heracles', name: '赫拉克勒斯', civilization: 'greece', role: '英雄', domain: '力量', appearsIn: ['heracles-12labors', 'prometheus-fire'], imageKeyword: 'heracles greek' },
  { id: 'oedipus', name: '俄狄浦斯', civilization: 'greece', role: '王', domain: '命运', appearsIn: ['oedipus'], imageKeyword: 'oedipus greek' },
  { id: 'daidalos', name: '代达罗斯', civilization: 'greece', role: '工匠', domain: '飞行', appearsIn: ['icarus-flight'], imageKeyword: 'daedalus greek craftsman' },
  { id: 'ikaros', name: '伊卡洛斯', civilization: 'greece', role: '少年', domain: '飞行', appearsIn: ['icarus-flight'], imageKeyword: 'icarus greek' },
  { id: 'achilles', name: '阿喀琉斯', civilization: 'greece', role: '英雄', domain: '战斗', appearsIn: ['achilles-heel'], imageKeyword: 'achilles greek warrior' },
  { id: 'perseus', name: '珀尔修斯', civilization: 'greece', role: '英雄', domain: '斩妖', appearsIn: ['medusa-perseus'], imageKeyword: 'perseus greek hero' },
  { id: 'medusa', name: '美杜莎', civilization: 'greece', role: '戈尔贡女妖', domain: '石化', appearsIn: ['medusa-perseus'], imageKeyword: 'medusa greek gorgon' },
  { id: 'apollo', name: '阿波罗', civilization: 'greece', role: '光明神', domain: '太阳、音乐', appearsIn: ['artemis-apollo', 'achilles-heel'], imageKeyword: 'apollo greek sun' },
  { id: 'artemis', name: '阿尔忒弥斯', civilization: 'greece', role: '月亮神', domain: '狩猎、月亮', appearsIn: ['artemis-apollo'], imageKeyword: 'artemis greek moon' },

  // ===== 北欧 =====
  { id: 'ymir', name: '伊米尔', civilization: 'norse', role: '远古巨人', domain: '起源', appearsIn: ['norse-creation'], imageKeyword: 'ymir norse giant' },
  { id: 'odin', name: '奥丁', civilization: 'norse', role: '众神之王', domain: '战争、智慧、死亡', appearsIn: ['norse-creation', 'odin-wisdom', 'world-tree', 'thor-hammer', 'loki-tricks', 'valhalla', 'midgard-serpent', 'ragnarok', 'fenrir-wolf'], imageKeyword: 'odin norse one eye' },
  { id: 'thor', name: '托尔', civilization: 'norse', role: '雷神', domain: '雷霆、力量', appearsIn: ['thor-hammer', 'midgard-serpent', 'ragnarok'], imageKeyword: 'thor norse hammer' },
  { id: 'loki', name: '洛基', civilization: 'norse', role: '诡计之神', domain: '欺诈', appearsIn: ['loki-tricks', 'baldr-death', 'midgard-serpent', 'fenrir-wolf'], imageKeyword: 'loki norse trickster' },
  { id: 'baldr', name: '巴德尔', civilization: 'norse', role: '光明之神', domain: '光明', appearsIn: ['loki-tricks', 'baldr-death'], imageKeyword: 'baldr norse light' },
  { id: 'freyja', name: '芙蕾雅', civilization: 'norse', role: '爱神', domain: '爱、丰饶', appearsIn: ['freyja-necklace'], imageKeyword: 'freyja norse necklace' },
  { id: 'fenrir', name: '芬里尔', civilization: 'norse', role: '巨狼', domain: '吞噬', appearsIn: ['fenrir-wolf', 'ragnarok'], imageKeyword: 'fenrir norse wolf' },
  { id: 'jormungandr', name: '耶梦加得', civilization: 'norse', role: '尘世巨蟒', domain: '世界之环', appearsIn: ['midgard-serpent', 'ragnarok'], imageKeyword: 'jormungandr serpent' },
  { id: 'surtr', name: '苏尔特', civilization: 'norse', role: '火巨人', domain: '末日之火', appearsIn: ['ragnarok'], imageKeyword: 'surtr norse fire giant' },
  { id: 'tyr', name: '提尔', civilization: 'norse', role: '战神', domain: '战争、正义', appearsIn: ['fenrir-wolf'], imageKeyword: 'tyr norse warrior' },
  { id: 'norn-urd', name: '乌尔德（命运三女神之一）', civilization: 'norse', role: '命运女神', domain: '过去', appearsIn: ['norns-fate'], imageKeyword: 'norns norse fate' },

  // ===== 印度 =====
  { id: 'brahma', name: '梵天', civilization: 'india', role: '创世神', domain: '创造', appearsIn: ['hindu-creation', 'samudra-manthan'], imageKeyword: 'brahma hindu four face' },
  { id: 'vishnu', name: '毗湿奴', civilization: 'india', role: '维护神', domain: '维护', appearsIn: ['samudra-manthan', 'ram-sita', 'krishna-cowherd', 'mahabharata'], imageKeyword: 'vishnu hindu' },
  { id: 'shiva', name: '湿婆', civilization: 'india', role: '毁灭神', domain: '毁灭、冥想', appearsIn: ['samudra-manthan', 'shiva-third-eye', 'ganesha-elephant', 'parvati-shakti', 'ganga-river'], imageKeyword: 'shiva hindu trident' },
  { id: 'parvati', name: '帕尔瓦蒂', civilization: 'india', role: '雪山神女', domain: '母性', appearsIn: ['shiva-third-eye', 'ganesha-elephant', 'parvati-shakti', 'durga-mahishasura'], imageKeyword: 'parvati hindu' },
  { id: 'ganesha', name: '伽内什', civilization: 'india', role: '象头神', domain: '障碍排除', appearsIn: ['ganesha-elephant'], imageKeyword: 'ganesha elephant hindu' },
  { id: 'rama', name: '罗摩', civilization: 'india', role: '王子、神化身', domain: '正法', appearsIn: ['ram-sita'], imageKeyword: 'rama hindu bow' },
  { id: 'sita', name: '悉多', civilization: 'india', role: '公主', domain: '忠贞', appearsIn: ['ram-sita'], imageKeyword: 'sita hindu wife' },
  { id: 'hanuman', name: '哈奴曼', civilization: 'india', role: '神猴', domain: '力量、忠诚', appearsIn: ['ram-sita'], imageKeyword: 'hanuman monkey hindu' },
  { id: 'krishna', name: '克里希那', civilization: 'india', role: '神化身', domain: '爱、智慧', appearsIn: ['krishna-cowherd', 'mahabharata'], imageKeyword: 'krishna hindu blue' },
  { id: 'durga', name: '难近母', civilization: 'india', role: '女战神', domain: '护', appearsIn: ['durga-mahishasura'], imageKeyword: 'durga hindu warrior' },
  { id: 'agni', name: '阿耆尼', civilization: 'india', role: '火神', domain: '火、祭祀', appearsIn: ['agni-fire'], imageKeyword: 'agni hindu fire' },
  { id: 'varuna', name: '伐楼拿', civilization: 'india', role: '水神', domain: '水、秩序', appearsIn: ['varuna-rain'], imageKeyword: 'varuna hindu water' },
  { id: 'ganga', name: '恒河女神', civilization: 'india', role: '河流神', domain: '净化', appearsIn: ['ganga-river'], imageKeyword: 'ganga river hindu' },

  // ===== 埃及 =====
  { id: 'atum', name: '阿图姆', civilization: 'egypt', role: '创世神', domain: '起源', appearsIn: ['egypt-creation'], imageKeyword: 'atum egypt creation' },
  { id: 'ra', name: '拉', civilization: 'egypt', role: '太阳神', domain: '太阳', appearsIn: ['egypt-creation', 'ra-sun', 'khepri-scarab'], imageKeyword: 'ra egypt sun disk' },
  { id: 'osiris', name: '奥西里斯', civilization: 'egypt', role: '冥王', domain: '冥界、农业', appearsIn: ['osiris-isis', 'anubis-mummy', 'maat-truth'], imageKeyword: 'osiris egypt green' },
  { id: 'isis', name: '伊西斯', civilization: 'egypt', role: '魔法女神', domain: '魔法、母性', appearsIn: ['egypt-creation', 'osiris-isis', 'ra-sun'], imageKeyword: 'isis egypt throne' },
  { id: 'set', name: '赛特', civilization: 'egypt', role: '沙漠之神', domain: '混乱', appearsIn: ['osiris-isis', 'set-desert', 'horus-eye', 'anubis-mummy'], imageKeyword: 'set egypt desert' },
  { id: 'horus', name: '荷鲁斯', civilization: 'egypt', role: '鹰神', domain: '王权、保护', appearsIn: ['osiris-isis', 'horus-eye', 'thoth-writing'], imageKeyword: 'horus egypt falcon' },
  { id: 'anubis', name: '阿努比斯', civilization: 'egypt', role: '亡者守护', domain: '死亡、审判', appearsIn: ['anubis-mummy', 'maat-truth'], imageKeyword: 'anubis egypt jackal' },
  { id: 'thoth', name: '托特', civilization: 'egypt', role: '智慧之神', domain: '文字、医药', appearsIn: ['horus-eye', 'thoth-writing'], imageKeyword: 'thoth egypt ibis' },
  { id: 'maat', name: '玛阿特', civilization: 'egypt', role: '真理女神', domain: '秩序、真理', appearsIn: ['maat-truth'], imageKeyword: 'maat egypt feather' },
  { id: 'bastet', name: '巴斯特', civilization: 'egypt', role: '猫神', domain: '家庭、保护', appearsIn: ['bastet-cat'], imageKeyword: 'bastet egypt cat' },

  // ===== 日本 =====
  { id: 'izanagi', name: '伊邪那岐', civilization: 'japan', role: '父神', domain: '创造、太阳父', appearsIn: ['japan-creation', 'amaterasu-cave', 'hiruko-leech'], imageKeyword: 'izanagi japan spear' },
  { id: 'izanami', name: '伊邪那美', civilization: 'japan', role: '母神', domain: '创造、死亡', appearsIn: ['japan-creation'], imageKeyword: 'izanami japan' },
  { id: 'amaterasu', name: '天照大神', civilization: 'japan', role: '太阳女神', domain: '太阳', appearsIn: ['amaterasu-cave'], imageKeyword: 'amaterasu sun goddess japan' },
  { id: 'susanoo', name: '须佐之男', civilization: 'japan', role: '风暴神', domain: '风暴、海', appearsIn: ['amaterasu-cave', 'susanowo-yamata'], imageKeyword: 'susanoo storm japan' },
  { id: 'kushinadahime', name: '奇稻田姬', civilization: 'japan', role: '公主', domain: '稻米', appearsIn: ['susanowo-yamata'], imageKeyword: 'kushinadahime japan rice' },
  { id: 'ukemochi', name: '宇迦之御魂神', civilization: 'japan', role: '稻荷神', domain: '稻米、商业', appearsIn: ['taiko-uma'], imageKeyword: 'ukemochi inari japan' },
  { id: 'kaguya', name: '辉夜姬', civilization: 'japan', role: '月宫公主', domain: '月亮、不死', appearsIn: ['kaguya-moon'], imageKeyword: 'kaguya princess japan moon' },
  { id: 'momotaro', name: '桃太郎', civilization: 'japan', role: '英雄', domain: '战斗', appearsIn: ['momotaro-demon'], imageKeyword: 'momotaro peach japan' },
  { id: 'hiruko', name: '蛭子', civilization: 'japan', role: '三子', domain: '渔业、商业', appearsIn: ['hiruko-leech'], imageKeyword: 'hiruko leech japan' },
  { id: 'yamato-takeru', name: '日本武尊', civilization: 'japan', role: '英雄皇子', domain: '征伐', appearsIn: ['raiko-imperial'], imageKeyword: 'yamato takeru japan prince' },

  // ===== 玛雅 =====
  { id: 'hun-hunahpu', name: '胡纳普', civilization: 'maya', role: '玉米英雄', domain: '玉米、太阳', appearsIn: ['maya-hero-twins', 'maya-corn'], imageKeyword: 'hunahpu maya corn' },
  { id: 'ixbalanque', name: '伊什巴尔坎', civilization: 'maya', role: '玉米英雄', domain: '玉米、月亮', appearsIn: ['maya-hero-twins'], imageKeyword: 'ixbalanque maya moon' },
  { id: 'xmuqane', name: '希穆坎', civilization: 'maya', role: '祖母神', domain: '冥界、母亲', appearsIn: ['maya-hero-twins'], imageKeyword: 'xmuqane maya grandmother' },
  { id: 'itzamna', name: '伊察姆纳', civilization: 'maya', role: '主神', domain: '文字、历法、医药', appearsIn: ['maya-itzamna'], imageKeyword: 'itzamna maya old god' },
  { id: 'nochel', name: '诺尔格', civilization: 'maya', role: '金星神', domain: '金星、战争', appearsIn: ['maya-dresden'], imageKeyword: 'nohoch ek maya venus' },
  { id: 'hun-ixim', name: '胡·伊希姆', civilization: 'maya', role: '玉米神', domain: '玉米', appearsIn: ['maya-corn'], imageKeyword: 'hun ixim maya corn god' },
  { id: 'xibalba-lord', name: '希巴尔帕主', civilization: 'maya', role: '冥界主', domain: '冥界、死亡', appearsIn: ['maya-hero-twins'], imageKeyword: 'xibalba maya lord death' },
]

export const RELATIONSHIPS: {
  source: string
  target: string
  type: 'parent' | 'spouse' | 'sibling' | 'ally' | 'enemy' | 'created' | 'mentor'
  label?: string
}[] = [
  // ===== 中国 关系 =====
  { source: 'nvwa', target: 'pangu', type: 'created', label: '女后由捏黄土造人' },
  { source: 'chiyou', target: 'huangdi', type: 'enemy', label: '涿鹿之战' },
  { source: 'houyi', target: 'change', type: 'spouse' },
  { source: 'gonggong', target: 'zhuanxu', type: 'enemy', label: '争帝位触不周山' },
  { source: 'gun', target: 'yu', type: 'parent', label: '父子' },
  { source: 'niulang', target: 'zhinv', type: 'spouse', label: '牛郎织女' },
  { source: 'nezha', target: 'lijing', type: 'parent', label: '父子' },
  { source: 'nezha', target: 'taibai', type: 'mentor', label: '师徒' },
  { source: 'baigezhu', target: 'fahai', type: 'enemy', label: '水漫金山' },

  // ===== 希腊 关系 =====
  { source: 'gaia', target: 'ouranos', type: 'spouse', label: '天地结合' },
  { source: 'ouranos', target: 'krónos', type: 'parent', label: '父子' },
  { source: 'gaia', target: 'krónos', type: 'parent', label: '母子' },
  { source: 'krónos', target: 'rheia', type: 'spouse' },
  { source: 'krónos', target: 'zeus', type: 'parent', label: '父子（宙斯被吐出）' },
  { source: 'krónos', target: 'hera', type: 'parent' },
  { source: 'krónos', target: 'hades', type: 'parent' },
  { source: 'krónos', target: 'poseidon', type: 'parent' },
  { source: 'krónos', target: 'demeter', type: 'parent' },
  { source: 'rheia', target: 'zeus', type: 'parent' },
  { source: 'rheia', target: 'hera', type: 'parent' },
  { source: 'zeus', target: 'hera', type: 'spouse' },
  { source: 'zeus', target: 'hades', type: 'sibling' },
  { source: 'zeus', target: 'poseidon', type: 'sibling' },
  { source: 'zeus', target: 'demeter', type: 'sibling' },
  { source: 'hera', target: 'athena', type: 'parent', label: '宙斯头颅中生' },
  { source: 'zeus', target: 'prometheus', type: 'ally', label: '提坦之战后' },
  { source: 'zeus', target: 'pandora', type: 'created', label: '以罚普罗米修斯' },
  { source: 'prometheus', target: 'epimetheus', type: 'sibling' },
  { source: 'epimetheus', target: 'pandora', type: 'spouse' },
  { source: 'hades', target: 'persephone', type: 'spouse', label: '冥府夫妻' },
  { source: 'demeter', target: 'persephone', type: 'parent', label: '母女' },
  { source: 'athena', target: 'arachne', type: 'enemy', label: '织布比赛' },
  { source: 'orpheus', target: 'eurydice', type: 'spouse', label: '夫妻' },
  { source: 'theseus', target: 'minotauros', type: 'enemy', label: '迷宫斩妖' },
  { source: 'heracles', target: 'prometheus', type: 'ally', label: '解救高加索' },
  { source: 'apollo', target: 'achilles', type: 'enemy', label: '指引阿波罗射脚跟' },
  { source: 'apollo', target: 'artemis', type: 'sibling', label: '孪生兄妹' },
  { source: 'apollo', target: 'daidalos', type: 'mentor' },
  { source: 'daidalos', target: 'ikaros', type: 'parent', label: '父子' },
  { source: 'apollo', target: 'perseus', type: 'mentor' },
  { source: 'perseus', target: 'medusa', type: 'enemy', label: '斩杀戈尔贡' },

  // ===== 北欧 关系 =====
  { source: 'ymir', target: 'odin', type: 'created', label: '神用其躯造世界' },
  { source: 'odin', target: 'thor', type: 'parent', label: '父子' },
  { source: 'thor', target: 'loki', type: 'sibling', label: '结义兄弟' },
  { source: 'loki', target: 'baldr', type: 'enemy', label: '设计致死' },
  { source: 'odin', target: 'loki', type: 'ally', label: '结义兄弟' },
  { source: 'loki', target: 'fenrir', type: 'parent', label: '父子' },
  { source: 'loki', target: 'jormungandr', type: 'parent', label: '父子' },
  { source: 'odin', target: 'fenrir', type: 'enemy', label: '诸神黄昏之战' },
  { source: 'thor', target: 'jormungandr', type: 'enemy', label: '诸神黄昏之战' },
  { source: 'odin', target: 'jormungandr', type: 'enemy' },
  { source: 'thor', target: 'surtr', type: 'enemy', label: '诸神黄昏之战' },
  { source: 'tyr', target: 'fenrir', type: 'enemy', label: '缚狼失右手' },

  // ===== 印度 关系 =====
  { source: 'brahma', target: 'vishnu', type: 'created' },
  { source: 'brahma', target: 'shiva', type: 'created' },
  { source: 'vishnu', target: 'shiva', type: 'ally', label: '三大主神' },
  { source: 'shiva', target: 'parvati', type: 'spouse', label: '湿公夫妻' },
  { source: 'shiva', target: 'ganesha', type: 'parent', label: '父子' },
  { source: 'parvati', target: 'ganesha', type: 'parent', label: '母子' },
  { source: 'vishnu', target: 'rama', type: 'created', label: '第七化身' },
  { source: 'rama', target: 'sita', type: 'spouse' },
  { source: 'hanuman', target: 'rama', type: 'ally', label: '神猴忠仆' },
  { source: 'vishnu', target: 'krishna', type: 'created', label: '第八化身' },
  { source: 'parvati', target: 'durga', type: 'created', label: '愤怒化身' },
  { source: 'durga', target: 'agni', type: 'ally' },
  { source: 'agni', target: 'varuna', type: 'sibling', label: '吠陀双神' },

  // ===== 埃及 关系 =====
  { source: 'atum', target: 'ra', type: 'created' },
  { source: 'ra', target: 'isis', type: 'parent', label: '父女' },
  { source: 'isis', target: 'osiris', type: 'spouse', label: '夫妻' },
  { source: 'osiris', target: 'set', type: 'sibling', label: '兄弟阋墙' },
  { source: 'set', target: 'osiris', type: 'enemy', label: '谋杀' },
  { source: 'isis', target: 'horus', type: 'parent', label: '母子' },
  { source: 'osiris', target: 'horus', type: 'parent', label: '父子' },
  { source: 'set', target: 'horus', type: 'enemy', label: '王位争夺战' },
  { source: 'anubis', target: 'osiris', type: 'ally', label: '守墓神' },
  { source: 'anubis', target: 'set', type: 'sibling' },
  { source: 'thoth', target: 'horus', type: 'ally', label: '复眼之恩' },
  { source: 'maat', target: 'ra', type: 'parent', label: '拉神之女' },

  // ===== 日本 关系 =====
  { source: 'izanagi', target: 'izanami', type: 'spouse', label: '夫妻神' },
  { source: 'izanagi', target: 'amaterasu', type: 'parent', label: '父女' },
  { source: 'izanagi', target: 'susanoo', type: 'parent', label: '父子' },
  { source: 'amaterasu', target: 'susanoo', type: 'sibling', label: '姐弟' },
  { source: 'susanoo', target: 'amaterasu', type: 'enemy', label: '天岩屋事件' },
  { source: 'susanoo', target: 'kushinadahime', type: 'spouse' },
  { source: 'amaterasu', target: 'hiruko', type: 'sibling' },

  // ===== 玛雅 关系 =====
  { source: 'hun-hunahpu', target: 'ixbalanque', type: 'sibling', label: '孪生兄弟' },
  { source: 'xmuqane', target: 'hun-hunahpu', type: 'parent', label: '母子' },
  { source: 'xmuqane', target: 'ixbalanque', type: 'parent', label: '母子' },
  { source: 'xibalba-lord', target: 'hun-hunahpu', type: 'enemy', label: '冥界试炼' },
  { source: 'xibalba-lord', target: 'ixbalanque', type: 'enemy' },
  { source: 'hun-hunahpu', target: 'hun-ixim', type: 'created', label: '玉米化身' },
]