/**
 * allTechnology.ts — 全科技数据
 */
import type { KeyFact, RichSection, TimelineEvent, TraditionImage, RelatedItem } from '@/types'

export interface Technology {
  id: string
  name: string
  westernName?: string
  category: string
  era: string
  region: string
  inventor?: string
  summary: string

  facts: KeyFact[]
  sections: RichSection[]
  timeline: TimelineEvent[]
  images: TraditionImage[]
  related: RelatedItem[]
  source: string
}

export const TECHNOLOGIES: Technology[] = [
  {
    "id": "tech-fire",
    "name": "火",
    "westernName": "Controlled Fire",
    "category": "能源",
    "era": "约 BC 1,000,000",
    "region": "非洲",
    "summary": "人类最古老的科技突破。掌握用火让人类开始烹饪食物、驱赶野兽、获得温暖、扩展生存范围。",
    "facts": [
      {
        "label": "首次使用",
        "value": "**约 100-50 万年前**"
      },
      {
        "label": "起源",
        "value": "**非洲**"
      },
      {
        "label": "意义",
        "value": "**人类历史上最重要的科技**"
      },
      {
        "label": "影响",
        "value": "**烹饪、驱赶野兽、温暖**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "火与人类进化",
        "body": "约 100-50 万年前，直立人开始使用天然火，40 万年前学会主动生火。火的使用带来了巨大变化：烹饪食物增加营养摄入，驱赶野兽扩展生存范围，提供温暖适应寒冷，加工工具支持烧陶冶炼。"
      },
      {
        "type": "callout",
        "heading": "烹饪与人类大脑",
        "body": "「烹饪假说」认为：烹饪是人类大脑进化的关键。生食消化效率低，需要巨大的肠道。烹饪大幅提高了食物消化效率，释放能量支持大脑发育。人类大脑体积在 200 万年内翻了三倍。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**谁掌握了火，谁就掌握了一切**。",
        "cite": "《人类简史》"
      },
      {
        "type": "list",
        "heading": "火的影响",
        "items": [
          "烹饪",
          "驱赶野兽",
          "提供温暖",
          "工具加工"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 1,000,000",
        "era": "旧石器",
        "event": "使用天然火"
      },
      {
        "year": "BC 400,000",
        "era": "旧石器",
        "event": "北京猿人控制火"
      },
      {
        "year": "BC 100,000",
        "era": "智人",
        "event": "智人掌握人工生火"
      },
      {
        "year": "BC 10,000",
        "era": "新石器",
        "event": "火用于烧制陶器"
      },
      {
        "year": "BC 5000",
        "era": "新石器",
        "event": "火用于冶炼铜"
      },
      {
        "year": "BC 1200",
        "era": "青铜时代",
        "event": "火用于冶炼青铜"
      }
    ],
    "images": [
      {
        "imageKeyword": "control of fire ancient hominids cave",
        "caption": "早期人类使用火",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "cave fire prehistoric human painting",
        "caption": "穴居人与火",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "fire pit archaeological site",
        "caption": "考古遗址灰烬堆",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "cooking fire evolution human brain",
        "caption": "烹饪与大脑进化",
        "credit": "Public Domain Illustration"
      }
    ],
    "related": [
      {
        "id": "tech-agriculture",
        "title": "农业",
        "reason": "火之后的革命"
      },
      {
        "id": "tech-bronze",
        "title": "青铜",
        "reason": "火冶炼"
      },
      {
        "id": "tech-iron",
        "title": "铁器",
        "reason": "火冶炼"
      },
      {
        "id": "tech-steam-engine",
        "title": "蒸汽机",
        "reason": "火的现代应用"
      }
    ],
    "source": "《人类简史》（赫拉利 2014）·《烹饪使人类进化》（兰厄姆 2009）·《火的记忆》（冈瑟）"
  },
  {
    "id": "tech-agriculture",
    "name": "农业革命",
    "westernName": "Agricultural Revolution",
    "category": "农业",
    "era": "约 BC 10,000",
    "region": "中东/中国/中美洲",
    "summary": "约 1 万年前，人类开始驯化野生动植物，定居下来种植小麦、水稻、玉米等。农业革命使人口爆发、城市产生、文明诞生。",
    "facts": [
      {
        "label": "开始",
        "value": "**约 BC 10,000**"
      },
      {
        "label": "起源中心",
        "value": "**新月沃地/中国/中美洲**（三处独立起源）"
      },
      {
        "label": "最早作物",
        "value": "**小麦/水稻/玉米**"
      },
      {
        "label": "驯化动物",
        "value": "**狗/羊/牛/猪/马**"
      },
      {
        "label": "影响",
        "value": "**定居 → 城市 → 国家 → 文明**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "从狩猎采集到农业定居",
        "body": "在旧石器时代，人类靠狩猎和采集为生。约 BC 10,000 年前，气候变暖。人类开始尝试种植野生谷物——新月沃地的小麦、中国的水稻、墨西哥的玉米。农业革命使人类有了稳定的食物，开始定居，产生了人口聚集地 → 村庄 → 城市 → 国家 → 文明。"
      },
      {
        "type": "callout",
        "heading": "农业的双刃剑",
        "body": "尤瓦尔·赫拉利在《人类简史》中提出：农业革命不是人类的进步，而是「史上最大的骗局」。原本采集者每天工作 3-6 小时。农业革命后，工作时间延长，饮食单一，平均身高下降，疾病增多，阶级产生。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**农业革命让人类以为自己驯化了小麦，其实是小麦驯化了人类**。",
        "cite": "《人类简史》"
      },
      {
        "type": "list",
        "heading": "农业革命的影响",
        "items": [
          "定居——人口聚集",
          "城市——专业分工",
          "国家——统治者产生",
          "文字——记录需要",
          "剩余——贵族与奴隶"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 30,000",
        "era": "旧石器",
        "event": "狗被驯化"
      },
      {
        "year": "BC 11,000",
        "era": "新石器",
        "event": "新月沃地种植小麦"
      },
      {
        "year": "BC 10,000",
        "era": "新石器",
        "event": "中国种植水稻"
      },
      {
        "year": "BC 9,000",
        "era": "新石器",
        "event": "羊牛猪被驯化"
      },
      {
        "year": "BC 8,000",
        "era": "新石器",
        "event": "杰里科最早城市"
      },
      {
        "year": "BC 6,000",
        "era": "新石器",
        "event": "中美洲种植玉米"
      },
      {
        "year": "BC 5,000",
        "era": "新石器",
        "event": "马被驯化"
      },
      {
        "year": "BC 4,000",
        "era": "新石器",
        "event": "灌溉系统"
      },
      {
        "year": "BC 3,500",
        "era": "苏美尔",
        "event": "苏美尔城邦"
      },
      {
        "year": "AD 2020s",
        "era": "现代",
        "event": "农业养活 80 亿人"
      }
    ],
    "images": [
      {
        "imageKeyword": "Fertile Crescent agriculture ancient",
        "caption": "新月沃地——农业起源",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "agricultural revolution Neolithic village",
        "caption": "新石器村庄复原",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "wheat domestication ancient agriculture",
        "caption": "野生小麦驯化",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "agriculture Neolithic grain storage",
        "caption": "新石器谷物储存",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "tech-fire",
        "title": "火",
        "reason": "之前的科技"
      },
      {
        "id": "tech-writing",
        "title": "文字",
        "reason": "农业产生的需求"
      },
      {
        "id": "tech-bronze",
        "title": "青铜",
        "reason": "农业文明的金属"
      }
    ],
    "source": "《人类简史》（赫拉利 2014）·《枪炮、病菌与钢铁》（戴蒙德 1997）"
  },
  {
    "id": "tech-writing",
    "name": "文字",
    "westernName": "Writing",
    "category": "通信",
    "era": "约 BC 3,400",
    "region": "美索不达米亚/埃及/中国/中美洲",
    "summary": "人类最伟大的发明之一。最早的文字是苏美尔人的楔形文字（BC 3400）和埃及象形文字（BC 3200）。文字使知识可以跨越时空传承。",
    "facts": [
      {
        "label": "最早文字",
        "value": "**苏美尔楔形文字（BC 3400）**"
      },
      {
        "label": "中国甲骨文",
        "value": "**BC 1250**"
      },
      {
        "label": "腓尼基字母",
        "value": "**BC 1700**"
      },
      {
        "label": "意义",
        "value": "**人类历史最重要的发明**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "文字的诞生",
        "body": "最早文字出现在美索不达米亚——苏美尔人的楔形文字（BC 3400）。最早是记账符号，记录谷物和牲畜数量。500 年后，符号逐渐演化出语法，成为真正的文字。埃及象形文字（BC 3200）独立诞生。中国甲骨文（BC 1250）诞生于商朝占卜。文字使法律、史诗、历史、科学可以跨越时空传承。"
      },
      {
        "type": "callout",
        "heading": "文字的革命",
        "body": "文字诞生之前：知识只能口耳相传，跨越代际会失真；法律不能用文字颁布；历史只能用口述故事保存。文字诞生之后：法律成文，社会秩序稳定；历史精确记录；知识可以跨越时空；文学、科学、哲学得以发展。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**文字是文明之根，无文字即无文明**。",
        "cite": "历史共识"
      },
      {
        "type": "list",
        "heading": "古代主要文字体系",
        "items": [
          "苏美尔楔形文字（BC 3400）",
          "埃及象形文字（BC 3200）",
          "中国甲骨文（BC 1250）",
          "腓尼基字母（BC 1700）",
          "希腊字母（BC 800）",
          "拉丁字母（BC 700）",
          "玛雅文字（BC 300）"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 3400",
        "era": "苏美尔",
        "event": "楔形文字诞生"
      },
      {
        "year": "BC 3200",
        "era": "古埃及",
        "event": "象形文字诞生"
      },
      {
        "year": "BC 1700",
        "era": "腓尼基",
        "event": "腓尼基字母"
      },
      {
        "year": "BC 1250",
        "era": "商朝",
        "event": "中国甲骨文"
      },
      {
        "year": "BC 800",
        "era": "希腊",
        "event": "希腊字母"
      },
      {
        "year": "BC 700",
        "era": "罗马",
        "event": "拉丁字母"
      },
      {
        "year": "AD 1450",
        "era": "印刷",
        "event": "活字印刷让文字大众化"
      }
    ],
    "images": [
      {
        "imageKeyword": "cuneiform tablet Sumerian Mesopotamia",
        "caption": "苏美尔楔形文字泥板",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Egyptian hieroglyphics ancient",
        "caption": "埃及象形文字",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Chinese oracle bone script",
        "caption": "中国甲骨文",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Phoenician alphabet ancient",
        "caption": "腓尼基字母",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "tech-paper",
        "title": "造纸术",
        "reason": "文字的载体"
      },
      {
        "id": "tech-printing",
        "title": "活字印刷",
        "reason": "文字的复制"
      },
      {
        "id": "tech-internet",
        "title": "互联网",
        "reason": "文字的现代延伸"
      },
      {
        "id": "tech-agriculture",
        "title": "农业",
        "reason": "文字产生的原因"
      }
    ],
    "source": "《文字的故事》（伊斯特林 1983）·《阅读的终结》（卡尔 1940）"
  },
  {
    "id": "tech-paper",
    "name": "造纸术",
    "westernName": "Papermaking",
    "category": "材料",
    "era": "AD 105",
    "region": "中国",
    "inventor": "蔡伦",
    "summary": "中国古代四大发明之一。东汉蔡伦改进造纸术，用树皮、麻头、破布等廉价原料造纸，使纸张大规模生产成为可能。",
    "facts": [
      {
        "label": "发明者",
        "value": "**东汉蔡伦（AD 105）**"
      },
      {
        "label": "起源",
        "value": "**中国**"
      },
      {
        "label": "蔡伦改进",
        "value": "**树皮、麻头、破布**"
      },
      {
        "label": "传入欧洲",
        "value": "**AD 1144**"
      },
      {
        "label": "影响",
        "value": "**信息革命、知识普及**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "从莎草纸到蔡侯纸",
        "body": "在纸发明之前，人类在石头、泥板、蜡板、莎草纸、羊皮纸、竹简、木牍上记录信息。埃及的莎草纸用芦苇芯压制，产量有限。欧洲的羊皮纸用羊皮制成，一本《圣经》需要 170 张羊皮。东汉蔡伦用树皮、麻头、破布等廉价原料改进造纸术，AD 105 年献给皇帝，从此「蔡侯纸」大规模生产。"
      },
      {
        "type": "callout",
        "heading": "蔡伦的发明与扩散",
        "body": "造纸术从中国向西传播：公元 3-4 世纪传到朝鲜、越南；8 世纪传到大马士革；9 世纪传到埃及；11 世纪传到西班牙；14 世纪传到意大利；15 世纪传到德国、英国。751 年怛罗斯之战后，中国造纸工匠被俘，阿拉伯人学会造纸。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**蔡侯纸的发明，让知识不再是贵族的特权**。",
        "cite": "弗朗西斯·培根"
      },
      {
        "type": "list",
        "heading": "造纸术的传播",
        "items": [
          "AD 105—蔡伦改进造纸",
          "AD 8世纪—传到阿拉伯",
          "AD 751—怛罗斯之战后传到阿拉伯",
          "AD 1144—欧洲第一家纸厂（西班牙）",
          "AD 14 世纪—意大利",
          "AD 15 世纪—德国、英国",
          "AD 1690—美国"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 3000",
        "era": "古埃及",
        "event": "埃及使用莎草纸"
      },
      {
        "year": "BC 200",
        "era": "西汉",
        "event": "中国出现早期麻纸"
      },
      {
        "year": "AD 105",
        "era": "东汉",
        "event": "**蔡伦改进造纸术——「蔡侯纸」**"
      },
      {
        "year": "AD 392",
        "era": "东晋",
        "event": "纸取代竹简"
      },
      {
        "year": "AD 751",
        "era": "唐代",
        "event": "怛罗斯之战，阿拉伯人获造纸术"
      },
      {
        "year": "AD 1144",
        "era": "西班牙",
        "event": "欧洲第一家纸厂"
      },
      {
        "year": "AD 1690",
        "era": "美国",
        "event": "第一家美国纸厂"
      }
    ],
    "images": [
      {
        "imageKeyword": "Cai Lun papermaking ancient China",
        "caption": "蔡伦造纸",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Chinese ancient paper workshop",
        "caption": "中国古代造纸工坊",
        "credit": "Public Domain Illustration"
      },
      {
        "imageKeyword": "Egyptian papyrus ancient",
        "caption": "埃及莎草纸",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Paper-making process traditional",
        "caption": "传统造纸工艺",
        "credit": "Public Domain Illustration"
      }
    ],
    "related": [
      {
        "id": "tech-writing",
        "title": "文字",
        "reason": "文字的载体"
      },
      {
        "id": "tech-printing",
        "title": "活字印刷",
        "reason": "纸的批量复制"
      },
      {
        "id": "rel-buddhism",
        "title": "佛教",
        "reason": "佛教传入推动纸的普及"
      },
      {
        "id": "tech-compass",
        "title": "指南针",
        "reason": "中国四大发明"
      },
      {
        "id": "tech-gunpowder",
        "title": "火药",
        "reason": "中国四大发明"
      }
    ],
    "source": "《中国造纸史》（潘吉星 1979）·《纸：改变世界的中国发明》（陈嘉映）·《蔡伦与造纸术》"
  },
  {
    "id": "tech-printing",
    "name": "活字印刷术",
    "westernName": "Movable Type Printing",
    "category": "通信",
    "era": "AD 1040-1450",
    "region": "中国 → 德国",
    "inventor": "毕昇（中国）/ 谷登堡（欧洲）",
    "summary": "中国北宋毕昇发明活字印刷，500 年后德国谷登堡发明金属活字印刷。印刷术使书籍大规模生产，催生了文艺复兴、宗教改革、科学革命。",
    "facts": [
      {
        "label": "中国发明者",
        "value": "**毕昇（北宋，AD 1040）**"
      },
      {
        "label": "欧洲发明者",
        "value": "**格登堡（AD 1450）**"
      },
      {
        "label": "代表作品",
        "value": "**《谷登堡圣经》**"
      },
      {
        "label": "影响",
        "value": "**文艺复兴、宗教改革、科学革命**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "毕昇到谷登堡",
        "body": "北宋庆历年间（AD 1041-1048），平民毕昇发明胶泥活字印刷——用黏土刻字，烧硬后用于印刷，比雕版印刷效率大幅提升。但中国活字印刷发展缓慢：汉字字数多（数万），活字成本高。1450 年前后，德国美因茨的约翰内斯·谷登堡发明金属活字印刷机。1455 年他印制的《42 行圣经》（谷登堡圣经）成为欧洲印刷史的里程碑。到 1500 年，欧洲有 2500 万本书籍流通。"
      },
      {
        "type": "callout",
        "heading": "印刷术的革命性影响",
        "body": "印刷术改变了人类历史：① 文艺复兴——古典文献大量印刷，古希腊文化复兴；② 宗教改革——马丁·路德的 95 条论纲传遍欧洲；③ 科学革命——科学发现和论文得以快速传播；④ 大众教育——书籍普及，识字率提升；⑤ 国家形成——民族语言和民族认同形成。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**印刷术改变了人类的思维方式**。",
        "cite": "爱森斯坦"
      },
      {
        "type": "list",
        "heading": "印刷术的影响",
        "items": [
          "文艺复兴",
          "宗教改革",
          "科学革命",
          "启蒙运动",
          "国家形成",
          "大众教育"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 868",
        "era": "唐代",
        "event": "《金刚经》——最早雕版印刷"
      },
      {
        "year": "AD 1040",
        "era": "北宋",
        "event": "**毕昇发明胶泥活字**"
      },
      {
        "year": "AD 1298",
        "era": "元代",
        "event": "王祯推广木活字"
      },
      {
        "year": "AD 1450",
        "era": "德国",
        "event": "**谷登堡发明金属活字**"
      },
      {
        "year": "AD 1455",
        "era": "德国",
        "event": "谷登堡圣经出版"
      },
      {
        "year": "AD 1500",
        "era": "欧洲",
        "event": "欧洲流通 2500 万册书"
      },
      {
        "year": "AD 1517",
        "era": "宗教改革",
        "event": "马丁·路德 95 条论纲传遍欧洲"
      }
    ],
    "images": [
      {
        "imageKeyword": "Bi Sheng movable type printing Chinese",
        "caption": "毕昇发明活字印刷",
        "credit": "Public Domain Illustration"
      },
      {
        "imageKeyword": "Gutenberg printing press 1450",
        "caption": "谷登堡印刷机",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Gutenberg Bible 42 lines",
        "caption": "谷登堡圣经",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "movable type Chinese characters",
        "caption": "活字印刷汉字",
        "credit": "Public Domain Illustration"
      }
    ],
    "related": [
      {
        "id": "tech-paper",
        "title": "造纸术",
        "reason": "印刷的前提"
      },
      {
        "id": "tech-writing",
        "title": "文字",
        "reason": "印刷的对象"
      },
      {
        "id": "tech-internet",
        "title": "互联网",
        "reason": "现代信息传播"
      }
    ],
    "source": "《作为变革动因的印刷机》（爱森斯坦 1979）·《中国古代四大发明》（潘吉星）"
  },
  {
    "id": "tech-gunpowder",
    "name": "火药",
    "westernName": "Gunpowder",
    "category": "军事",
    "era": "AD 9世纪",
    "region": "中国",
    "summary": "中国古代四大发明之一。最早用于祈福、驱邪的丹药，唐末用于军事。13 世纪经阿拉伯传入欧洲，引发军事革命。",
    "facts": [
      {
        "label": "发明地",
        "value": "**中国**"
      },
      {
        "label": "起源",
        "value": "**道士炼丹**"
      },
      {
        "label": "配方",
        "value": "**硝石 75% + 硫磺 10% + 木炭 15%**"
      },
      {
        "label": "军事应用",
        "value": "**唐末（AD 904）**"
      },
      {
        "label": "传入欧洲",
        "value": "**13-14 世纪**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "炼丹术士的意外发明",
        "body": "火药起源于中国道士的炼丹活动。8-9 世纪，唐代道士在炼丹过程中偶然发现了硝石、硫磺、木炭按一定比例混合时的剧烈燃烧和爆炸反应。他们称之为「火药」（着火之药），最初用于祈福、驱邪的烟火表演。904 年，唐末军阀李罕之围攻河南太原时使用了「飞火」——火药的最早军事应用。13 世纪，火药通过蒙古西征和阿拉伯商人传到欧洲。"
      },
      {
        "type": "callout",
        "heading": "火药的革命性影响",
        "body": "火药传到欧洲后，引发了军事、政治、社会的全面革命：① 骑士阶级衰落——火枪可击穿骑士的铠甲，贵族的军事特权终结；② 步兵崛起——火枪手是普通农民，民主力量增强；③ 民族国家诞生——国王可以用炮火打败封建领主；④ 殖民地扩张——欧洲国家用火器征服美洲、非洲、亚洲。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**火药在欧洲结束了骑士时代，催生了民族国家**。",
        "cite": "麦克尼尔"
      },
      {
        "type": "list",
        "heading": "火药的发展",
        "items": [
          "8-9 世纪—道士炼丹偶然发明",
          "AD 904—唐末最早军事应用",
          "AD 1000—北宋震天雷",
          "AD 1250—传到阿拉伯",
          "AD 1326—欧洲最早文献",
          "AD 1450—手炮普及",
          "AD 1884—诺贝尔无烟火药"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 8世纪",
        "era": "唐代",
        "event": "道士炼丹意外发明"
      },
      {
        "year": "AD 904",
        "era": "唐末",
        "event": "最早军事应用"
      },
      {
        "year": "AD 1000",
        "era": "北宋",
        "event": "《武经总要》记录配方"
      },
      {
        "year": "AD 1232",
        "era": "宋金",
        "event": "金朝震天雷守开封"
      },
      {
        "year": "AD 1250",
        "era": "蒙古",
        "event": "传到阿拉伯"
      },
      {
        "year": "AD 1326",
        "era": "欧洲",
        "event": "最早火药配方"
      },
      {
        "year": "AD 1350",
        "era": "欧洲",
        "event": "火枪普及"
      },
      {
        "year": "AD 1450",
        "era": "欧洲",
        "event": "手炮主要武器"
      },
      {
        "year": "AD 1884",
        "era": "法国",
        "event": "**诺贝尔发明无烟火药**"
      }
    ],
    "images": [
      {
        "imageKeyword": "Chinese ancient gunpowder formula Taoist",
        "caption": "中国古代火药配方",
        "credit": "Public Domain Illustration"
      },
      {
        "imageKeyword": "Song dynasty fire bomb huoguo",
        "caption": "宋代火球",
        "credit": "Public Domain Illustration"
      },
      {
        "imageKeyword": "European cannon 15th century",
        "caption": "15世纪欧洲火炮",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Alfred Nobel dynamite invention",
        "caption": "诺贝尔发明无烟火药",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "tech-compass",
        "title": "指南针",
        "reason": "中国四大发明"
      },
      {
        "id": "tech-paper",
        "title": "造纸术",
        "reason": "中国四大发明"
      },
      {
        "id": "tech-printing",
        "title": "活字印刷",
        "reason": "中国四大发明"
      },
      {
        "id": "tech-steam-engine",
        "title": "蒸汽机",
        "reason": "工业革命"
      }
    ],
    "source": "《火药与帝国》（欧阳泰 1986）·《中国古代四大发明》（潘吉星）"
  },
  {
    "id": "tech-compass",
    "name": "指南针",
    "westernName": "Compass",
    "category": "导航",
    "era": "约 BC 200-AD 1050",
    "region": "中国",
    "summary": "中国四大发明之一。最早的司南（BC 200）是中国汉代发明，11 世纪宋代发明真正的磁针指南针。指南针使远洋航海成为可能。",
    "facts": [
      {
        "label": "起源",
        "value": "**中国汉代**"
      },
      {
        "label": "最早司南",
        "value": "**BC 200**"
      },
      {
        "label": "磁针指南针",
        "value": "**AD 1050**"
      },
      {
        "label": "传往欧洲",
        "value": "**AD 1190**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "从司南到磁针指南针",
        "body": "中国汉代（约 BC 200）已经发现了天然磁石（magnetite）的指极性，发明了「司南」——一种用磁石磨制的勺形指示器，放在光滑的铜盘上，勺柄指南。东汉王充《论衡》记载了这种装置。北宋时期（AD 960-1127），中国发明了真正的磁针指南针。沈括《梦溪笔谈》记载了磁偏角。12 世纪，磁针指南针通过阿拉伯商人传到欧洲。"
      },
      {
        "type": "callout",
        "heading": "指南针与大航海时代",
        "body": "指南针在欧洲引发了大航海时代：1488 年迪亚士绕过好望角，1492 年哥伦布到达美洲，1498 年达·伽马到达印度，1519-1522 年麦哲伦完成环球航行。葡萄牙、西班牙、荷兰、英国相继成为海上强国。如果没有指南针，美洲的发现可能要晚几十年。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**磁针指南针，是人类最伟大的航海发明**。",
        "cite": "麦克尼尔"
      },
      {
        "type": "list",
        "heading": "指南针的发展",
        "items": [
          "BC 200—司南",
          "AD 1050—沈括记录磁偏角",
          "AD 1190—传到阿拉伯",
          "AD 1190—欧洲普及",
          "AD 1492—哥伦布到达美洲",
          "AD 1522—麦哲伦环球航行"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 200",
        "era": "汉代",
        "event": "司南发明"
      },
      {
        "year": "AD 1050",
        "era": "北宋",
        "event": "沈括记录磁针"
      },
      {
        "year": "AD 1090",
        "era": "北宋",
        "event": "航海使用指南针"
      },
      {
        "year": "AD 1190",
        "era": "阿拉伯",
        "event": "指南针传到阿拉伯"
      },
      {
        "year": "AD 1190",
        "era": "欧洲",
        "event": "传到欧洲"
      },
      {
        "year": "AD 1488",
        "era": "葡萄牙",
        "event": "迪亚士绕好望角"
      },
      {
        "year": "AD 1492",
        "era": "西班牙",
        "event": "**哥伦布到达美洲**"
      },
      {
        "year": "AD 1522",
        "era": "西班牙",
        "event": "麦哲伦环球航行"
      }
    ],
    "images": [
      {
        "imageKeyword": "Sinan ancient Chinese compass",
        "caption": "司南（汉代）",
        "credit": "Public Domain Illustration"
      },
      {
        "imageKeyword": "Song dynasty magnetic compass navigation",
        "caption": "宋代磁针指南针",
        "credit": "Public Domain Illustration"
      },
      {
        "imageKeyword": "ancient compass sailors navigation",
        "caption": "古代水手用罗盘",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Columbus compass voyage 1492",
        "caption": "哥伦布用罗盘航海",
        "credit": "Public Domain Illustration"
      }
    ],
    "related": [
      {
        "id": "tech-gunpowder",
        "title": "火药",
        "reason": "中国四大发明"
      },
      {
        "id": "tech-paper",
        "title": "造纸术",
        "reason": "中国四大发明"
      },
      {
        "id": "tech-printing",
        "title": "活字印刷",
        "reason": "中国四大发明"
      },
      {
        "id": "tech-steam-engine",
        "title": "蒸汽机",
        "reason": "蒸汽船导航"
      }
    ],
    "source": "《梦溪笔谈》（沈括 1088）·《中国科学技术史》（李约瑟）"
  },
  {
    "id": "tech-steam-engine",
    "name": "蒸汽机",
    "westernName": "Steam Engine",
    "category": "动力",
    "era": "AD 1712-1769",
    "region": "英国",
    "inventor": "纽科门/瓦特",
    "summary": "工业革命的核心。纽科门制造了第一台商用蒸汽机（1712），瓦特改进蒸汽机使其效率提高 4 倍（1769）。",
    "facts": [
      {
        "label": "首台商用蒸汽机",
        "value": "**纽科门 1712**"
      },
      {
        "label": "瓦特改进",
        "value": "**瓦特 1769（独立冷凝器）**"
      },
      {
        "label": "效率提升",
        "value": "**4 倍**"
      },
      {
        "label": "意义",
        "value": "**第一次工业革命的核心**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "从萨弗里到瓦特",
        "body": "1698 年，英国人托马斯·萨弗里发明了第一台实用的蒸汽水泵。1712 年，铁匠托马斯·纽科门制造了第一台商用蒸汽机。1763 年，詹姆斯·瓦特发现蒸汽在汽缸里反复冷凝浪费了大量热量，加了一个独立冷凝器。1769 年他获得专利。瓦特蒸汽机效率提高到 2-4 倍，可以通过旋转输出动力。"
      },
      {
        "type": "callout",
        "heading": "蒸汽机与工业革命",
        "body": "蒸汽机引发了一系列连锁反应：① 纺织业机械化；② 铁路时代（1814）；③ 轮船时代（1807）；④ 城市化加速；⑤ 现代工厂制度诞生；⑥ 殖民扩张加速。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**蒸汽机是工业革命的引擎**。",
        "cite": "恩格斯"
      },
      {
        "type": "list",
        "heading": "蒸汽机的影响",
        "items": [
          "纺织机械化",
          "铁路（1814）",
          "轮船（1807）",
          "城市化",
          "殖民扩张"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1698",
        "era": "英国",
        "event": "萨弗里蒸汽水泵"
      },
      {
        "year": "AD 1712",
        "era": "英国",
        "event": "**纽科门蒸汽机商用**"
      },
      {
        "year": "AD 1763",
        "era": "英国",
        "event": "瓦特改进"
      },
      {
        "year": "AD 1769",
        "era": "英国",
        "event": "**瓦特独立冷凝器专利**"
      },
      {
        "year": "AD 1807",
        "era": "美国",
        "event": "富尔顿汽船"
      },
      {
        "year": "AD 1814",
        "era": "英国",
        "event": "**斯蒂芬森蒸汽机车**"
      },
      {
        "year": "AD 1825",
        "era": "英国",
        "event": "第一条公共铁路"
      },
      {
        "year": "AD 1869",
        "era": "美国",
        "event": "横跨美国大陆铁路"
      }
    ],
    "images": [
      {
        "imageKeyword": "Newcomen steam engine 1712",
        "caption": "纽科门蒸汽机（1712）",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "James Watt steam engine improvement",
        "caption": "瓦特蒸汽机",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Stephenson Rocket locomotive",
        "caption": "斯蒂芬森蒸汽机车",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Fulton Clermont steamboat",
        "caption": "富尔顿汽船",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "tech-electricity",
        "title": "电力",
        "reason": "第二次工业革命"
      },
      {
        "id": "tech-fire",
        "title": "火",
        "reason": "蒸汽的源头"
      },
      {
        "id": "tech-compass",
        "title": "指南针",
        "reason": "蒸汽船导航"
      },
      {
        "id": "tech-gunpowder",
        "title": "火药",
        "reason": "蒸汽枪械"
      }
    ],
    "source": "《工业革命》（罗伯特·艾伦 2009）·《瓦特蒸汽机》（萧伊 1999）"
  },
  {
    "id": "tech-electricity",
    "name": "电力",
    "westernName": "Electricity",
    "category": "能源",
    "era": "AD 1831-1882",
    "region": "欧美",
    "inventor": "法拉第/爱迪生/特斯拉",
    "summary": "第二次工业革命的核心。法拉第发现电磁感应（1831），爱迪生建立第一个商业发电厂（1882），特斯拉发明交流电系统。",
    "facts": [
      {
        "label": "电磁感应",
        "value": "**法拉第 1831**"
      },
      {
        "label": "第一座发电厂",
        "value": "**爱迪生 1882**"
      },
      {
        "label": "交流电系统",
        "value": "**特斯拉 1888**"
      },
      {
        "label": "意义",
        "value": "**第二次工业革命核心**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "从法拉第到爱迪生",
        "body": "1800 年伏打发明电池。1831 年英国科学家迈克尔·法拉第发现电磁感应——磁铁运动可以产生电流。1879 年爱迪生发明了实用的白炽灯。1882 年他在纽约建立世界第一个商业发电厂。1888 年特斯拉发明交流电（AC）系统和感应电机，可以远距离传输电力。1893 年芝加哥世博会采用交流电，标志交流电胜出。"
      },
      {
        "type": "callout",
        "heading": "电流大战——直流 vs 交流",
        "body": "1880 年代发生著名的「电流大战」：爱迪生支持直流电（DC），特斯拉/西屋支持交流电（AC）。直流电稳定但无法远距离传输。交流电可以用变压器升压远距离传输，再降压使用。最终交流电胜出。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**如果你想知道宇宙的秘密，就从能量、频率、振动来思考**。",
        "cite": "特斯拉"
      },
      {
        "type": "list",
        "heading": "电力的应用",
        "items": [
          "电灯",
          "电报、电话",
          "电动机",
          "电力机车",
          "电脑、互联网"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1800",
        "era": "意大利",
        "event": "伏打发明电池"
      },
      {
        "year": "AD 1831",
        "era": "英国",
        "event": "**法拉第电磁感应**"
      },
      {
        "year": "AD 1879",
        "era": "美国",
        "event": "爱迪生白炽灯"
      },
      {
        "year": "AD 1882",
        "era": "美国",
        "event": "**爱迪生第一座发电厂**"
      },
      {
        "year": "AD 1888",
        "era": "美国",
        "event": "特斯拉交流电"
      },
      {
        "year": "AD 1893",
        "era": "美国",
        "event": "芝加哥世博会交流电"
      },
      {
        "year": "AD 1895",
        "era": "美国",
        "event": "尼亚加拉水电站"
      },
      {
        "year": "AD 1956",
        "era": "全球",
        "event": "核电站商用"
      }
    ],
    "images": [
      {
        "imageKeyword": "Michael Faraday electricity induction",
        "caption": "法拉第电磁感应",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Thomas Edison light bulb",
        "caption": "爱迪生白炽灯",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Nikola Tesla alternating current",
        "caption": "特斯拉交流电",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Niagara Falls power plant Tesla",
        "caption": "尼亚加拉水电站",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "tech-steam-engine",
        "title": "蒸汽机",
        "reason": "第一次工业革命"
      },
      {
        "id": "tech-telegraph",
        "title": "电报",
        "reason": "电力应用"
      },
      {
        "id": "tech-telephone",
        "title": "电话",
        "reason": "电力应用"
      },
      {
        "id": "tech-internet",
        "title": "互联网",
        "reason": "电力基础设施"
      },
      {
        "id": "tech-computer",
        "title": "计算机",
        "reason": "电力驱动"
      }
    ],
    "source": "《电的历史》（大卫·波丹 2003）·《天才发明家》（埃德温·霍华德 1962）·《电流大战》"
  },
  {
    "id": "tech-computer",
    "name": "计算机",
    "westernName": "Computer",
    "category": "计算",
    "era": "AD 1946-1981",
    "region": "欧美",
    "inventor": "图灵/冯·诺伊曼",
    "summary": "改变人类文明最重要的发明之一。1946 年第一台电子计算机 ENIAC 诞生。1971 年英特尔 4004 微处理器诞生，1981 年 IBM PC 让计算机走入家庭。",
    "facts": [
      {
        "label": "理论基础",
        "value": "**图灵（1936）**"
      },
      {
        "label": "第一台电子计算机",
        "value": "**ENIAC 1946**"
      },
      {
        "label": "微处理器",
        "value": "**Intel 4004 1971**"
      },
      {
        "label": "IBM PC",
        "value": "**1981**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "从巴贝奇到图灵",
        "body": "1833 年查尔斯·巴贝奇设计分析机（未完成）。1936 年阿兰·图灵提出「图灵机」——现代计算机的理论基础。1946 年 ENIAC 问世，重 30 吨，每秒 5000 次加法，是第一台真正的电子计算机。1945 年冯·诺伊曼提出「存储程序计算机」架构。1971 年英特尔推出 4004 微处理器。1981 年 IBM PC 发布。"
      },
      {
        "type": "callout",
        "heading": "摩尔定律",
        "body": "1965 年，戈登·摩尔提出「摩尔定律」：集成电路上晶体管数量每 18-24 个月翻一倍。50 年后的今天，微处理器性能提高了 10 亿倍。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**我怀疑是否可以说一台机器能思考**。",
        "cite": "图灵《计算机器与智能》"
      },
      {
        "type": "list",
        "heading": "计算机的发展",
        "items": [
          "1833—巴贝奇分析机",
          "1936—图灵机",
          "1946—ENIAC",
          "1971—Intel 4004",
          "1981—IBM PC",
          "1984—Macintosh",
          "1990s—互联网",
          "2020s—AI 革命"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1833",
        "era": "英国",
        "event": "巴贝奇分析机"
      },
      {
        "year": "AD 1936",
        "era": "英国",
        "event": "**图灵提出图灵机**"
      },
      {
        "year": "AD 1946",
        "era": "美国",
        "event": "**ENIAC 诞生**"
      },
      {
        "year": "AD 1971",
        "era": "美国",
        "event": "Intel 4004 微处理器"
      },
      {
        "year": "AD 1975",
        "era": "美国",
        "event": "Altair 8800"
      },
      {
        "year": "AD 1981",
        "era": "美国",
        "event": "**IBM PC**"
      },
      {
        "year": "AD 1984",
        "era": "美国",
        "event": "Macintosh"
      },
      {
        "year": "AD 1995",
        "era": "美国",
        "event": "Windows 95"
      },
      {
        "year": "AD 2007",
        "era": "美国",
        "event": "iPhone"
      },
      {
        "year": "AD 2022",
        "era": "美国",
        "event": "ChatGPT"
      }
    ],
    "images": [
      {
        "imageKeyword": "ENIAC computer 1946 first computer",
        "caption": "ENIAC（1946）",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Alan Turing computer scientist",
        "caption": "阿兰·图灵",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Intel 4004 first microprocessor",
        "caption": "Intel 4004 微处理器",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "IBM PC 1981 personal computer",
        "caption": "IBM PC 1981",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "tech-internet",
        "title": "互联网",
        "reason": "计算机网络"
      },
      {
        "id": "tech-electricity",
        "title": "电力",
        "reason": "计算机动力"
      },
      {
        "id": "tech-telephone",
        "title": "电话",
        "reason": "通信"
      }
    ],
    "source": "《计算机：一部历史》（佩特·弗莱恩 2000）·《艾伦·图灵传》（安德鲁·霍奇斯 2014）"
  },
  {
    "id": "tech-internet",
    "name": "互联网",
    "westernName": "Internet",
    "category": "通信",
    "era": "AD 1969-1991",
    "region": "美国",
    "inventor": "蒂姆·伯纳斯-李",
    "summary": "改变世界的通信网络。1969 年美国国防部 ARPANET 启动，1991 年蒂姆·伯纳斯-李发明万维网。",
    "facts": [
      {
        "label": "起源",
        "value": "**ARPANET 1969**"
      },
      {
        "label": "TCP/IP",
        "value": "**1974**"
      },
      {
        "label": "万维网",
        "value": "**伯纳斯-李 1989-1991**"
      },
      {
        "label": "全球用户",
        "value": "**50+ 亿（2023）**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "从 ARPANET 到万维网",
        "body": "1969 年，美国国防部高级研究计划局建立 ARPANET，最初连接 4 所大学。设计是为了在核战争下保持通信。1974 年，Vint Cerf 和 Bob Kahn 设计了 TCP/IP 协议。1989 年，英国物理学家蒂姆·伯纳斯-李在 CERN 发明了万维网。1993 年 Mosaic 浏览器发布，让互联网从科学家工具变成大众媒介。"
      },
      {
        "type": "callout",
        "heading": "互联网的影响",
        "body": "互联网彻底改变了人类生活：① 知识民主化（维基百科）；② 社交媒体连接数十亿人；③ 电子商务；④ 娱乐产业（YouTube/TikTok/Netflix）；⑤ 远程工作。但也带来假新闻、隐私泄露、网络成瘾问题。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**互联网是人类有史以来最强大的工具**。",
        "cite": "蒂姆·伯纳斯-李"
      },
      {
        "type": "list",
        "heading": "互联网的影响",
        "items": [
          "知识民主化",
          "社交媒体",
          "电子商务",
          "娱乐产业",
          "远程工作"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1969",
        "era": "美国",
        "event": "**ARPANET 启动**"
      },
      {
        "year": "AD 1974",
        "era": "美国",
        "event": "TCP/IP 协议"
      },
      {
        "year": "AD 1983",
        "era": "全球",
        "event": "互联网正式诞生"
      },
      {
        "year": "AD 1989",
        "era": "欧洲",
        "event": "万维网发明"
      },
      {
        "year": "AD 1991",
        "era": "全球",
        "event": "**万维网公开**"
      },
      {
        "year": "AD 1993",
        "era": "美国",
        "event": "Mosaic 浏览器"
      },
      {
        "year": "AD 1998",
        "era": "美国",
        "event": "Google"
      },
      {
        "year": "AD 2004",
        "era": "美国",
        "event": "Facebook"
      },
      {
        "year": "AD 2007",
        "era": "美国",
        "event": "iPhone"
      },
      {
        "year": "AD 2010",
        "era": "中国",
        "event": "微信"
      },
      {
        "year": "AD 2022",
        "era": "美国",
        "event": "ChatGPT"
      },
      {
        "year": "AD 2023",
        "era": "全球",
        "event": "互联网用户突破 50 亿"
      }
    ],
    "images": [
      {
        "imageKeyword": "ARPANET 1969 original network",
        "caption": "ARPANET（1969）",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Tim Berners-Lee World Wide Web",
        "caption": "蒂姆·伯纳斯-李与万维网",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Mosaic browser 1993",
        "caption": "Mosaic 浏览器（1993）",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "modern internet data center",
        "caption": "现代数据中心",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "tech-computer",
        "title": "计算机",
        "reason": "互联网的基础"
      },
      {
        "id": "tech-telephone",
        "title": "电话",
        "reason": "通信革命"
      },
      {
        "id": "tech-writing",
        "title": "文字",
        "reason": "信息载体"
      },
      {
        "id": "tech-printing",
        "title": "活字印刷",
        "reason": "信息复制"
      }
    ],
    "source": "《互联网简史》（曼纽尔·卡斯特尔斯 2010）·《互联网时代》（BBC 2010）"
  },
  {
    "id": "tech-antibiotics",
    "name": "抗生素",
    "westernName": "Antibiotics",
    "category": "医学",
    "era": "AD 1928-1942",
    "region": "英国",
    "inventor": "弗莱明 / 弗洛里 / 钱恩",
    "summary": "改变人类寿命的关键发明。1928 年弗莱明偶然发现青霉素，1940 年代弗洛里和钱恩提纯并实现量产，使人类平均寿命延长 20 年以上。",
    "facts": [
      {
        "label": "发现者",
        "value": "**亚历山大·弗莱明 1928**"
      },
      {
        "label": "提纯量产",
        "value": "**弗洛里 / 钱恩 1940s**"
      },
      {
        "label": "影响",
        "value": "**人类寿命延长 20+ 年**"
      },
      {
        "label": "拯救人数",
        "value": "**估计超过 10 亿人**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "弗莱明的偶然发现",
        "body": "1928 年 9 月，苏格兰细菌学家亚历山大·弗莱明度假归来，发现培养皿中一个葡萄球菌菌落被杀死了——原来是被一种霉菌（青霉素，Penicillium notatum）污染。他分离出这种霉菌，命名「青霉素」（penicillin），并于 1929 年发表论文。但他没有能力提纯和量产。1939 年二战爆发，澳大利亚药学家霍华德·弗洛里和德国犹太裔生化学家恩斯特·钱恩在牛津继续弗莱明的工作。1941 年成功用青霉素治愈第一例病人。1942 年美国药企默沙东开始大规模量产青霉素。二战期间，青霉素拯救了数十万盟军士兵的生命。"
      },
      {
        "type": "callout",
        "heading": "抗生素的革命性影响",
        "body": "抗生素发明之前：① 肺炎、败血症、伤口感染是绝症；② 结核病是「白色瘟疫」，杀死欧洲 1/4 人口；③ 简单擦伤都可能致命；④ 手术风险极高。抗生素之后：① 平均预期寿命从 47 岁延长到 78 岁；② 手术、外科、化学治疗成为可能；③ 传染病不再是头号死因；④ 但抗生素滥用也产生耐药菌（如 MRSA）。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**当我 1928 年 9 月 28 日早晨醒来时，我绝不会想到这是改变人类历史的一天**。",
        "cite": "弗莱明"
      },
      {
        "type": "list",
        "heading": "抗生素的发展",
        "items": [
          "1928—弗莱明发现青霉素",
          "1929—弗莱明发表论文",
          "1939—弗洛里、钱恩研究",
          "1941—首例临床试验",
          "1942—美国量产",
          "1945—弗莱明、弗洛里、钱恩获诺贝尔奖",
          "1950s—链霉素、四环素等",
          "2020s—耐药菌问题"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1928",
        "era": "英国",
        "event": "**弗莱明发现青霉素**"
      },
      {
        "year": "AD 1929",
        "era": "英国",
        "event": "弗莱明发表论文"
      },
      {
        "year": "AD 1939",
        "era": "英国",
        "event": "弗洛里、钱恩开始研究"
      },
      {
        "year": "AD 1941",
        "era": "英国",
        "event": "首例青霉素临床治疗"
      },
      {
        "year": "AD 1942",
        "era": "美国",
        "event": "默沙东量产青霉素"
      },
      {
        "year": "AD 1945",
        "era": "瑞典",
        "event": "弗莱明等三人获诺贝尔奖"
      },
      {
        "year": "AD 1948",
        "era": "全球",
        "event": "链霉素发现——抗结核"
      },
      {
        "year": "AD 1953",
        "era": "全球",
        "event": "四环素发现"
      },
      {
        "year": "AD 2020s",
        "era": "现代",
        "event": "全球耐药菌危机"
      }
    ],
    "images": [
      {
        "imageKeyword": "Alexander Fleming penicillin 1928",
        "caption": "弗莱明发现青霉素",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "penicillin mold petri dish",
        "caption": "青霉菌培养皿",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "World War II penicillin production",
        "caption": "二战中青霉素量产",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "modern antibiotic research",
        "caption": "现代抗生素研究",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "tech-vaccine",
        "title": "疫苗",
        "reason": "医学突破"
      },
      {
        "id": "tech-fire",
        "title": "火",
        "reason": "古代医学"
      },
      {
        "id": "tech-agriculture",
        "title": "农业",
        "reason": "早期人类疾病"
      }
    ],
    "source": "《弗莱明传》（安德鲁·莫耶 2009）·《抗生素的故事》（麦格雷戈 2018）·《奇迹的年代》"
  },
  {
    "id": "tech-stone-tools",
    "name": "石器",
    "westernName": "Stone Tools",
    "category": "材料",
    "era": "BC 2,500,000",
    "region": "非洲",
    "summary": "人类最古老的工具。250 万年前奥杜瓦伊石器标志着人类起源。新石器时代的磨制石器与农业革命同时。",
    "facts": [
      {
        "label": "最早石器",
        "value": "**BC 2,500,000 奥杜瓦伊**"
      },
      {
        "label": "类型",
        "value": "**打制石器 → 磨制石器**"
      },
      {
        "label": "时代",
        "value": "**旧石器 → 新石器**"
      },
      {
        "label": "意义",
        "value": "**人类起源的标志**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "从猿到人的标志",
        "body": "约 BC 2,500,000 年前，南方古猿/能人开始制造最简单的打制石器——奥杜瓦伊石器。约 BC 1,700,000 年，直立人出现，制造更精细的手斧。约 BC 50,000 年，智人出现。BC 10,000 年进入新石器时代，磨制石器与农业革命同时。"
      },
      {
        "type": "callout",
        "heading": "石器时代的分期",
        "body": "① 旧石器时代（BC 2,500,000—10,000）——打制石器；② 中石器时代（BC 10,000—8,000）——弓箭发明；③ 新石器时代（BC 8,000—3,000）——磨制石器。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**工具使人类成为人类**。",
        "cite": "古人类学共识"
      },
      {
        "type": "list",
        "heading": "石器时代大事",
        "items": [
          "BC 2,500,000—奥杜瓦伊石器",
          "BC 1,700,000—阿舍利手斧",
          "BC 50,000—狩猎采集",
          "BC 10,000—新石器革命"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 2,500,000",
        "era": "旧石器早期",
        "event": "奥杜瓦伊石器"
      },
      {
        "year": "BC 1,700,000",
        "era": "旧石器早期",
        "event": "阿舍利手斧"
      },
      {
        "year": "BC 50,000",
        "era": "旧石器晚期",
        "event": "智人精致石器"
      },
      {
        "year": "BC 10,000",
        "era": "新石器",
        "event": "磨制石器"
      },
      {
        "year": "BC 3,000",
        "era": "铜石并用",
        "event": "金属时代开始"
      }
    ],
    "images": [
      {
        "imageKeyword": "Olduvai stone tools earliest",
        "caption": "奥杜瓦伊石器",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Acheulean hand axe prehistoric",
        "caption": "阿舍利手斧",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Neolithic polished stone tools",
        "caption": "新石器磨制石器",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "tech-fire",
        "title": "火",
        "reason": "石器的伙伴"
      },
      {
        "id": "tech-agriculture",
        "title": "农业",
        "reason": "新石器革命"
      },
      {
        "id": "tech-bronze",
        "title": "青铜",
        "reason": "石器之后"
      }
    ],
    "source": "《人类简史》（赫拉利）·《考古学》（费根）"
  },
  {
    "id": "tech-bronze",
    "name": "青铜",
    "westernName": "Bronze",
    "category": "材料",
    "era": "约 BC 3,300",
    "region": "美索不达米亚",
    "summary": "人类最早大规模使用的金属。青铜是铜与锡的合金，比纯铜更硬，开启了青铜时代（约 BC 3300—1200）。",
    "facts": [
      {
        "label": "发明地",
        "value": "**美索不达米亚**"
      },
      {
        "label": "最早青铜",
        "value": "**BC 3,300**"
      },
      {
        "label": "组成",
        "value": "**铜（88%）+ 锡（12%）**"
      },
      {
        "label": "时代",
        "value": "**BC 3,300—1,200**"
      },
      {
        "label": "用途",
        "value": "**武器/工具/礼器/钱币**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "青铜时代的开端",
        "body": "公元前 3300 年左右，美索不达米亚的苏美尔人发明青铜——铜与锡的合金。青铜比纯铜更硬（硬度约 3 倍），更耐用，迅速取代纯铜。中国夏商周三代（约 BC 2070—256）是青铜时代的鼎盛期——河南安阳殷墟出土的司母戊鼎重 832.84 公斤。"
      },
      {
        "type": "callout",
        "heading": "青铜时代的遗产",
        "body": "青铜在公元前 3300—1200 年塑造了早期文明：① 武器革命；② 农具革命；③ 礼器革命；④ 文字载体（金文）；⑤ 跨地区贸易。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**问鼎中原——鼎的重量象征王权**。",
        "cite": "《左传》"
      },
      {
        "type": "list",
        "heading": "青铜时代的遗产",
        "items": [
          "武器革命",
          "农具革命",
          "礼器革命",
          "文字载体",
          "跨地区贸易"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 3,300",
        "era": "苏美尔",
        "event": "**青铜发明**"
      },
      {
        "year": "BC 2,000",
        "era": "商朝",
        "event": "中国青铜鼎盛期"
      },
      {
        "year": "BC 1,600",
        "era": "商代",
        "event": "**司母戊鼎**"
      },
      {
        "year": "BC 1,200",
        "era": "青铜末期",
        "event": "铁器出现"
      },
      {
        "year": "BC 500",
        "era": "春秋",
        "event": "铁器普及"
      }
    ],
    "images": [
      {
        "imageKeyword": "Bronze Age ancient weapons tools",
        "caption": "青铜时代武器",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Simuwu Ding Shang dynasty bronze",
        "caption": "司母戊鼎",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "ancient bronze artifacts collection",
        "caption": "古代青铜器",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "tech-stone-tools",
        "title": "石器",
        "reason": "金属之前的工具"
      },
      {
        "id": "tech-iron",
        "title": "铁器",
        "reason": "青铜之后"
      },
      {
        "id": "tech-fire",
        "title": "火",
        "reason": "冶炼的来源"
      }
    ],
    "source": "《青铜时代》（柴尔德）·《中国青铜时代》（张光直）"
  },
  {
    "id": "tech-iron",
    "name": "铁器",
    "westernName": "Iron",
    "category": "材料",
    "era": "约 BC 1,200",
    "region": "安纳托利亚",
    "summary": "铁器取代青铜，开启铁器时代。铁矿比铜矿、锡矿更丰富，铁器更便宜、更普及，引发农业和社会革命。",
    "facts": [
      {
        "label": "起源",
        "value": "**安纳托利亚赫梯**"
      },
      {
        "label": "最早铁器",
        "value": "**BC 1,500**"
      },
      {
        "label": "普及",
        "value": "**BC 1,200 海上民族入侵**"
      },
      {
        "label": "时代",
        "value": "**铁器时代（BC 1,200 至今）**"
      },
      {
        "label": "意义",
        "value": "**民主化 + 农业革命**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "铁器时代的开端",
        "body": "公元前 1500 年左右，赫梯人率先冶炼出铁，但秘不外传。公元前 1200 年，海上民族入侵赫梯帝国，铁的冶炼技术传播开。铁比青铜更普遍——铁矿遍布全球；铁器更便宜，使普通农民也能拥有金属工具。这引发了农业革命——铁犁使开垦硬土成为可能。"
      },
      {
        "type": "callout",
        "heading": "铁器时代的意义",
        "body": "铁器取代青铜是民主化革命：① 武器民主化——普通士兵可拥有铁剑；② 农具民主化——铁犁取代木犁；③ 文化革命——荷马史诗反映铁器时代；④ 中国春秋战国——铁器普及推动井田制瓦解。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**铁器时代 = 武器和农具的民主化**。",
        "cite": "《技术与文明》"
      },
      {
        "type": "list",
        "heading": "铁器时代的遗产",
        "items": [
          "武器民主化",
          "农具民主化",
          "森林开垦",
          "井田制瓦解",
          "史诗时代"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 1,500",
        "era": "赫梯",
        "event": "**铁器冶炼**"
      },
      {
        "year": "BC 1,200",
        "era": "海上民族",
        "event": "**铁器技术扩散**"
      },
      {
        "year": "BC 1,000",
        "era": "希腊",
        "event": "铁器普及"
      },
      {
        "year": "BC 800",
        "era": "中国西周",
        "event": "中国开始炼铁"
      },
      {
        "year": "BC 500",
        "era": "春秋战国",
        "event": "中国铁器普及"
      },
      {
        "year": "AD 1900",
        "era": "现代",
        "event": "钢铁时代"
      }
    ],
    "images": [
      {
        "imageKeyword": "Iron Age ancient tools weapons",
        "caption": "铁器时代工具",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Hittite iron smelting ancient",
        "caption": "赫梯炼铁",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Iron plow agriculture ancient",
        "caption": "铁犁",
        "credit": "Public Domain Illustration"
      }
    ],
    "related": [
      {
        "id": "tech-bronze",
        "title": "青铜",
        "reason": "铁器的前身"
      },
      {
        "id": "tech-stone-tools",
        "title": "石器",
        "reason": "金属之前的工具"
      },
      {
        "id": "tech-agriculture",
        "title": "农业",
        "reason": "铁器推动农业"
      }
    ],
    "source": "《技术与文明》（芒福德）·《铁器时代考古》"
  },
  {
    "id": "tech-wheel",
    "name": "轮子",
    "westernName": "Wheel",
    "category": "交通",
    "era": "约 BC 3,500",
    "region": "美索不达米亚",
    "summary": "人类最伟大的基础发明之一。最早是陶轮（BC 3500），后用于车辆（BC 3200）。轮子彻底改变了运输和制造业。",
    "facts": [
      {
        "label": "发明地",
        "value": "**美索不达米亚**"
      },
      {
        "label": "最早陶轮",
        "value": "**BC 3,500**"
      },
      {
        "label": "最早车轮",
        "value": "**BC 3,200**"
      },
      {
        "label": "原理",
        "value": "**圆周运动 → 滚动摩擦**"
      },
      {
        "label": "影响",
        "value": "**运输/工业/计时**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "从陶轮到车轮",
        "body": "轮子的历史始于陶轮。约 BC 3,500 年，美索不达米亚的陶工发明陶轮。约 BC 3,200 年，第一辆有轮子的车辆出现——苏美尔人的战车。轮子使运输效率成倍增长。"
      },
      {
        "type": "callout",
        "heading": "轮子的革命性影响",
        "body": "轮子不仅是交通工具的核心：① 交通——轮式车辆、火车、自行车；② 工业——齿轮、轴承、滑轮；③ 农业——水车、风车、拖拉机；④ 计时——钟表。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**轮子是人类最有效率的运动装置**。",
        "cite": "技术史共识"
      },
      {
        "type": "list",
        "heading": "轮子的应用",
        "items": [
          "交通工具",
          "工业机械",
          "农业机械",
          "计时钟表"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 3,500",
        "era": "美索不达米亚",
        "event": "**陶轮发明**"
      },
      {
        "year": "BC 3,200",
        "era": "苏美尔",
        "event": "**第一辆有轮车**"
      },
      {
        "year": "BC 2,000",
        "era": "中亚",
        "event": "战车普及"
      },
      {
        "year": "AD 1885",
        "era": "德国",
        "event": "汽车发明"
      }
    ],
    "images": [
      {
        "imageKeyword": "wheel invention Mesopotamia",
        "caption": "美索不达米亚陶轮",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Sumerian war chariot ancient",
        "caption": "苏美尔战车",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "tech-bronze",
        "title": "青铜",
        "reason": "青铜时代的车"
      },
      {
        "id": "tech-steam-engine",
        "title": "蒸汽机",
        "reason": "蒸汽时代的车"
      }
    ],
    "source": "《技术与文明》（芒福德）·《轮子》（安东尼 2007）"
  },
  {
    "id": "tech-automobile",
    "name": "汽车",
    "westernName": "Automobile",
    "category": "交通",
    "era": "AD 1886",
    "region": "德国",
    "inventor": "卡尔·本茨",
    "summary": "1886 年德国工程师卡尔·本茨发明第一辆汽油汽车。福特 T 型车让汽车走入千家万户。",
    "facts": [
      {
        "label": "第一辆汽车",
        "value": "**1886 本茨 Patent-Motorwagen**"
      },
      {
        "label": "福特 T 型车",
        "value": "**1908**"
      },
      {
        "label": "全球保有量",
        "value": "**13 亿辆（2022）**"
      },
      {
        "label": "影响",
        "value": "**出行自由、城市化、工业化**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "从奔驰到福特",
        "body": "1886 年德国工程师卡尔·本茨制造了第一辆汽油动力汽车——Benz Patent-Motorwagen。1908 年，亨利·福特推出 T 型车，通过流水线生产大幅降低成本，让普通工人也能买得起汽车。到 1927 年停产时，T 型车共售出 1500 万辆。"
      },
      {
        "type": "callout",
        "heading": "汽车的革命性影响",
        "body": "汽车改变了人类社会：① 出行自由——不再依赖马匹；② 城市化——郊区化；③ 工业化——石油、汽车、公路网；④ 自由主义——个人主义消费文化兴起。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**任何颜色，只要是黑的都行**——福特 T 型车。",
        "cite": "亨利·福特"
      },
      {
        "type": "list",
        "heading": "汽车的影响",
        "items": [
          "出行自由",
          "郊区化",
          "石油工业",
          "公路网",
          "消费文化"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1886",
        "era": "德国",
        "event": "**本茨发明第一辆汽车**"
      },
      {
        "year": "AD 1908",
        "era": "美国",
        "event": "**福特 T 型车**"
      },
      {
        "year": "AD 1913",
        "era": "美国",
        "event": "**福特流水线**"
      },
      {
        "year": "AD 1927",
        "era": "美国",
        "event": "T 型车共 1500 万辆"
      },
      {
        "year": "AD 2022",
        "era": "全球",
        "event": "13 亿辆车"
      }
    ],
    "images": [
      {
        "imageKeyword": "Benz Patent-Motorwagen 1886",
        "caption": "Benz 第一辆汽车（1886）",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Ford Model T assembly line",
        "caption": "福特 T 型车流水线",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "modern electric car Tesla",
        "caption": "电动汽车",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "tech-wheel",
        "title": "轮子",
        "reason": "汽车的基础"
      },
      {
        "id": "tech-steam-engine",
        "title": "蒸汽机",
        "reason": "蒸汽火车"
      },
      {
        "id": "tech-petroleum",
        "title": "石油",
        "reason": "汽车动力"
      }
    ],
    "source": "《车轮上的革命》（弗林克 1988）"
  },
  {
    "id": "tech-airplane",
    "name": "飞机",
    "westernName": "Airplane",
    "category": "交通",
    "era": "AD 1903",
    "region": "美国",
    "inventor": "莱特兄弟",
    "summary": "1903 年莱特兄弟首次实现重于空气的飞机飞行，彻底改变了人类的运输、战争和通信。",
    "facts": [
      {
        "label": "首次飞行",
        "value": "**1903.12.17 莱特兄弟**"
      },
      {
        "label": "飞行时间",
        "value": "**12 秒**"
      },
      {
        "label": "飞行距离",
        "value": "**36.5 米**"
      },
      {
        "label": "全球航空乘客",
        "value": "**40 亿（2019）**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "从莱特兄弟到喷气时代",
        "body": "1903 年 12 月 17 日，奥维尔·莱特驾驶他和哥哥威尔伯制造的「飞行者一号」，进行了人类历史上第一次有动力、可控、持续的载人飞行——飞行 12 秒，距离 36.5 米。1969 年波音 747 出现，标志现代航空业。"
      },
      {
        "type": "callout",
        "heading": "飞机的革命性影响",
        "body": "飞机改变了人类生活：① 全球化加速；② 旅游业兴起；③ 战争革命——空战、战略轰炸；④ 邮件与快递；⑤ 但也带来空难、噪音污染、碳排放。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**飞行不再是关于飞机，而是关于地面**——航空的根本改变。",
        "cite": "海因里希·赫兹"
      },
      {
        "type": "list",
        "heading": "飞机的影响",
        "items": [
          "全球化",
          "旅游业",
          "战争革命",
          "邮件快递"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1903",
        "era": "美国",
        "event": "**莱特兄弟首次飞行**"
      },
      {
        "year": "AD 1919",
        "era": "英国",
        "event": "首次跨大西洋飞行"
      },
      {
        "year": "AD 1935",
        "era": "美国",
        "event": "DC-3 商业航空革命"
      },
      {
        "year": "AD 1947",
        "era": "美国",
        "event": "**叶格突破音障**"
      },
      {
        "year": "AD 1969",
        "era": "美国",
        "event": "波音 747"
      }
    ],
    "images": [
      {
        "imageKeyword": "Wright brothers first flight 1903",
        "caption": "莱特兄弟首次飞行",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Boeing 747 commercial airliner",
        "caption": "波音 747",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "tech-wheel",
        "title": "轮子",
        "reason": "飞机起落架"
      },
      {
        "id": "tech-petroleum",
        "title": "石油",
        "reason": "飞机燃料"
      },
      {
        "id": "tech-automobile",
        "title": "汽车",
        "reason": "地面交通"
      }
    ],
    "source": "《莱特兄弟》（麦卡洛 1979）"
  },
  {
    "id": "tech-rocket",
    "name": "火箭",
    "westernName": "Rocket",
    "category": "交通",
    "era": "AD 1926",
    "region": "美国",
    "inventor": "罗伯特·戈达德",
    "summary": "中国宋代发明最早的火箭（13 世纪），1926 年戈达德发射现代火箭，1957 年苏联卫星开启太空时代。",
    "facts": [
      {
        "label": "现代火箭之父",
        "value": "**罗伯特·戈达德 1926**"
      },
      {
        "label": "V-2 火箭",
        "value": "**1942 德国**"
      },
      {
        "label": "首颗人造卫星",
        "value": "**1957 苏联**"
      },
      {
        "label": "首次载人航天",
        "value": "**1961 加加林**"
      },
      {
        "label": "首次登月",
        "value": "**1969 阿波罗11号**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "从中国火箭到月球",
        "body": "中国宋代（约 AD 1200）是火箭的诞生地。20 世纪初，齐奥尔科夫斯基提出液体燃料火箭理论。1926 年，罗伯特·戈达德发射了世界首枚液体燃料火箭。1957 年，苏联发射斯普特尼克 1 号，开启太空时代。1961 年，加加林首次载人航天。1969 年，阿姆斯特朗登月。"
      },
      {
        "type": "callout",
        "heading": "火箭与太空时代",
        "body": "火箭使人类能够：① 卫星——通信、导航、气象、军事；② 载人航天——ISS；③ 探月；④ 火星探测。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**地球是人类的摇篮，但人类不能永远生活在摇篮里**。",
        "cite": "齐奥尔科夫斯基"
      },
      {
        "type": "list",
        "heading": "火箭的影响",
        "items": [
          "卫星",
          "载人航天",
          "探月",
          "火星探测"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1200",
        "era": "宋代",
        "event": "中国最早火箭"
      },
      {
        "year": "AD 1926",
        "era": "美国",
        "event": "**戈达德首枚液体火箭**"
      },
      {
        "year": "AD 1942",
        "era": "德国",
        "event": "**V-2 火箭**"
      },
      {
        "year": "AD 1957",
        "era": "苏联",
        "event": "**首颗人造卫星**"
      },
      {
        "year": "AD 1961",
        "era": "苏联",
        "event": "**加加林首次载人航天**"
      },
      {
        "year": "AD 1969",
        "era": "美国",
        "event": "**阿波罗11号登月**"
      }
    ],
    "images": [
      {
        "imageKeyword": "Goddard first liquid rocket 1926",
        "caption": "戈达德液体火箭（1926）",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "V2 rocket Nazi Germany",
        "caption": "V-2 火箭",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Apollo 11 moon landing 1969",
        "caption": "阿波罗11号登月",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "tech-gunpowder",
        "title": "火药",
        "reason": "中国火箭的起源"
      },
      {
        "id": "tech-airplane",
        "title": "飞机",
        "reason": "现代航空"
      },
      {
        "id": "tech-petroleum",
        "title": "石油",
        "reason": "现代火箭燃料"
      }
    ],
    "source": "《火箭与导弹》（比辛格）"
  },
  {
    "id": "tech-telegraph",
    "name": "电报",
    "westernName": "Telegraph",
    "category": "通信",
    "era": "AD 1844",
    "region": "美国",
    "inventor": "塞缪尔·莫尔斯",
    "summary": "1837 年莫尔斯发明电报机，1844 年首次发送「What hath God wrought」——人类第一次以接近光速远距离传递信息。",
    "facts": [
      {
        "label": "发明者",
        "value": "**塞缪尔·莫尔斯 1837**"
      },
      {
        "label": "首次实用",
        "value": "**1844 华盛顿到巴尔的摩**"
      },
      {
        "label": "原理",
        "value": "**电磁脉冲 + 莫尔斯电码**"
      },
      {
        "label": "影响",
        "value": "**即时通讯 / 金融市场 / 战争指挥**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "即时通讯的开端",
        "body": "1837 年，塞缪尔·莫尔斯发明电报机，并设计了莫尔斯电码。1844 年 5 月 24 日，他用这条线路从华盛顿国会大厦向巴尔的摩发送了第一条电报。1866 年，第一条跨大西洋海底电缆铺设成功。"
      },
      {
        "type": "callout",
        "heading": "电报的革命性影响",
        "body": "电报改变了人类生活：① 即时通讯——记者可以发回即时新闻；② 金融市场——股票价格实时传递；③ 战争指挥；④ 铁路调度。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**上帝创造了何等奇迹**——第一条电报。",
        "cite": "莫尔斯 1844"
      },
      {
        "type": "list",
        "heading": "电报的影响",
        "items": [
          "即时通讯",
          "金融市场",
          "战争指挥",
          "铁路调度"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1837",
        "era": "美国",
        "event": "**莫尔斯发明电报机**"
      },
      {
        "year": "AD 1844",
        "era": "美国",
        "event": "**第一条实用电报线路**"
      },
      {
        "year": "AD 1866",
        "era": "欧美",
        "event": "**永久跨大西洋电缆**"
      },
      {
        "year": "AD 1876",
        "era": "美国",
        "event": "贝尔发明电话"
      }
    ],
    "images": [
      {
        "imageKeyword": "Morse code telegraph 1844",
        "caption": "莫尔斯电报机",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Morse code alphabet",
        "caption": "莫尔斯电码表",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "transatlantic telegraph cable 1858",
        "caption": "跨大西洋电报电缆",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "tech-electricity",
        "title": "电力",
        "reason": "电报的物理基础"
      },
      {
        "id": "tech-telephone",
        "title": "电话",
        "reason": "电报的后继"
      },
      {
        "id": "tech-internet",
        "title": "互联网",
        "reason": "通信的延伸"
      }
    ],
    "source": "《莫尔斯传》（西尔弗曼）"
  },
  {
    "id": "tech-telephone",
    "name": "电话",
    "westernName": "Telephone",
    "category": "通信",
    "era": "AD 1876",
    "region": "美国",
    "inventor": "亚历山大·贝尔",
    "summary": "1876 年贝尔发明电话——人类第一次远距离实时语音通讯。",
    "facts": [
      {
        "label": "发明者",
        "value": "**亚历山大·贝尔 1876**"
      },
      {
        "label": "首句话",
        "value": "**\"Mr. Watson, come here.\"**"
      },
      {
        "label": "全球用户",
        "value": "**80 亿（峰值）**"
      },
      {
        "label": "智能手机",
        "value": "**2007 iPhone**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "贝尔的电话革命",
        "body": "1876 年 3 月 10 日，亚历山大·贝尔在波士顿用他的电报机发送了世界上第一通电话。1877 年，贝尔成立贝尔电话公司。1900 年代自动交换机的发明使电话普及。1973 年第一部移动电话（摩托罗拉）。2007 年 iPhone 发布。"
      },
      {
        "type": "callout",
        "heading": "电话的革命性影响",
        "body": "电话改变了人类生活：① 即时通讯——远距离实时听到对方；② 商业——远程办公、客服、电话会议；③ 应急服务——110/119/120；④ 智能手机。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**Mr. Watson, come here, I want to see you.**",
        "cite": "贝尔 第一通电话 1876"
      },
      {
        "type": "list",
        "heading": "电话的影响",
        "items": [
          "即时语音",
          "商业革命",
          "家庭联系",
          "应急服务"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1876",
        "era": "美国",
        "event": "**贝尔发明电话**"
      },
      {
        "year": "AD 1877",
        "era": "美国",
        "event": "**贝尔电话公司**"
      },
      {
        "year": "AD 1892",
        "era": "美国",
        "event": "**自动交换机**"
      },
      {
        "year": "AD 1915",
        "era": "美国",
        "event": "**跨美国大陆电话线**"
      },
      {
        "year": "AD 1973",
        "era": "美国",
        "event": "**第一部移动电话**"
      },
      {
        "year": "AD 2007",
        "era": "美国",
        "event": "**iPhone 发布**"
      }
    ],
    "images": [
      {
        "imageKeyword": "Alexander Graham Bell first telephone",
        "caption": "贝尔第一电话",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "early telephone 1900s",
        "caption": "早期电话",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Apple iPhone first generation 2007",
        "caption": "iPhone（2007）",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "tech-telegraph",
        "title": "电报",
        "reason": "电话的前身"
      },
      {
        "id": "tech-electricity",
        "title": "电力",
        "reason": "电话的物理基础"
      },
      {
        "id": "tech-internet",
        "title": "互联网",
        "reason": "现代通讯"
      }
    ],
    "source": "《贝尔传》（波伊尔 2005）"
  },
  {
    "id": "tech-petroleum",
    "name": "石油",
    "westernName": "Petroleum",
    "category": "能源",
    "era": "AD 1859",
    "region": "美国",
    "summary": "1859 年发现第一口现代油井。石油成为工业社会的主要能源——火车、汽车、飞机、塑料。",
    "facts": [
      {
        "label": "第一口现代油井",
        "value": "**1859 美国宾州**"
      },
      {
        "label": "全球石油日产量",
        "value": "**约 1 亿桶（2022）**"
      },
      {
        "label": "石油消费占比",
        "value": "**全球能源 33%**"
      },
      {
        "label": "影响",
        "value": "**现代工业基础 + 战争 + 外交**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "黑色黄金——石油时代",
        "body": "石油是古生物死后埋在地层里，经过几百万年的高温高压形成的碳氢化合物。1859 年美国宾州发现第一口现代油井。1880 年代内燃机发明后，石油成为内燃机的燃料。20 世纪，石油成为现代工业的命脉。"
      },
      {
        "type": "callout",
        "heading": "石油的地缘政治影响",
        "body": "石油是 20 世纪最重要的地缘政治资源：① 一战、二战——石油是战争胜负的关键；② 中东——波斯湾油田成为大国争夺焦点；③ 1973 石油危机；④ 石油美元体系；⑤ 气候变化——燃烧化石燃料是全球变暖主因。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**石油是工业的血液**。",
        "cite": "现代共识"
      },
      {
        "type": "list",
        "heading": "石油的影响",
        "items": [
          "工业燃料",
          "塑料化工",
          "汽车航空",
          "地缘政治",
          "气候变化"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1859",
        "era": "美国",
        "event": "**美国宾州第一口现代油井**"
      },
      {
        "year": "AD 1886",
        "era": "德国",
        "event": "本茨发明汽车"
      },
      {
        "year": "AD 1908",
        "era": "中东",
        "event": "**波斯发现大量石油**"
      },
      {
        "year": "AD 1928",
        "era": "中东",
        "event": "**沙特发现石油**"
      },
      {
        "year": "AD 1960",
        "era": "中东",
        "event": "**OPEC 成立**"
      },
      {
        "year": "AD 1973",
        "era": "全球",
        "event": "**第一次石油危机**"
      }
    ],
    "images": [
      {
        "imageKeyword": "first oil well Pennsylvania 1859",
        "caption": "宾州第一口油井（1859）",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "oil refinery industrial modern",
        "caption": "现代石油炼化厂",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Middle East oil field Persian Gulf",
        "caption": "中东油田",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "tech-automobile",
        "title": "汽车",
        "reason": "石油消耗大户"
      },
      {
        "id": "tech-airplane",
        "title": "飞机",
        "reason": "石油燃料"
      },
      {
        "id": "tech-electricity",
        "title": "电力",
        "reason": "发电燃料"
      }
    ],
    "source": "《石油政治》（耶金 1991）"
  },
  {
    "id": "tech-nuclear",
    "name": "核能",
    "westernName": "Nuclear Power",
    "category": "能源",
    "era": "AD 1942",
    "region": "美国",
    "summary": "1942 年费米实现人类第一次可控核反应堆。1954 年苏联建成世界第一座核电站。核能是 21 世纪主要的低碳能源之一。",
    "facts": [
      {
        "label": "第一反应堆",
        "value": "**芝加哥一号堆 1942**"
      },
      {
        "label": "第一颗原子弹",
        "value": "**1945（广岛/长崎）**"
      },
      {
        "label": "第一座核电站",
        "value": "**1954 苏联**"
      },
      {
        "label": "核电占全球电力",
        "value": "**约 10%**"
      },
      {
        "label": "特点",
        "value": "**极高能量密度 + 低碳**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "从原子弹到核电站",
        "body": "1938 年，奥托·哈恩发现核裂变。1942 年，恩里科·费米在芝加哥大学实现了人类第一次可控核反应。1945 年，曼哈顿计划成功制造原子弹。1954 年，苏联建成世界第一座核电站。到 2020s，全球约 440 座核电站，提供全球 10% 的电力。"
      },
      {
        "type": "callout",
        "heading": "核能的希望与争议",
        "body": "核能争议巨大：① 支持——极高能量密度（1 公斤铀 = 200 万公斤煤）、低碳、稳定；② 反对——放射性废料、核电事故（切尔诺贝利 1986、福岛 2011）、核武器扩散、退役困难。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**现在我们成了死神，世界的毁灭者**。",
        "cite": "奥本海默 1945"
      },
      {
        "type": "list",
        "heading": "核能的影响",
        "items": [
          "武器",
          "发电",
          "医疗",
          "工业",
          "研究"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1938",
        "era": "德国",
        "event": "**核裂变发现**"
      },
      {
        "year": "AD 1942",
        "era": "美国",
        "event": "**芝加哥一号堆**"
      },
      {
        "year": "AD 1945",
        "era": "美国",
        "event": "**原子弹（广岛/长崎）**"
      },
      {
        "year": "AD 1954",
        "era": "苏联",
        "event": "**世界第一座核电站**"
      },
      {
        "year": "AD 1986",
        "era": "苏联",
        "event": "**切尔诺贝利核事故**"
      },
      {
        "year": "AD 2011",
        "era": "日本",
        "event": "**福岛核事故**"
      }
    ],
    "images": [
      {
        "imageKeyword": "Chicago Pile 1 1942 first nuclear reactor",
        "caption": "芝加哥一号堆（1942）",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Hiroshima atomic bomb 1945",
        "caption": "广岛原子弹（1945）",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "nuclear power plant reactor",
        "caption": "现代核电站",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "tech-electricity",
        "title": "电力",
        "reason": "核电是发电"
      },
      {
        "id": "tech-petroleum",
        "title": "石油",
        "reason": "替代能源"
      }
    ],
    "source": "《原子弹秘史》（罗兹 1986）"
  },
  {
    "id": "tech-vaccine",
    "name": "疫苗",
    "westernName": "Vaccine",
    "category": "医学",
    "era": "AD 1796",
    "region": "英国",
    "inventor": "爱德华·詹纳",
    "summary": "1796 年英国医生詹纳发明天花疫苗，开创了免疫学。疫苗拯救的生命数超过任何其他医学发明。",
    "facts": [
      {
        "label": "发明者",
        "value": "**爱德华·詹纳 1796**"
      },
      {
        "label": "第一支疫苗",
        "value": "**天花疫苗**"
      },
      {
        "label": "拯救人数",
        "value": "**估计超过 5 亿人**"
      },
      {
        "label": "影响",
        "value": "**天花灭绝 + 流行病控制**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "詹纳的天花疫苗",
        "body": "18 世纪，天花是欧洲最致命的疾病。英国医生爱德华·詹纳注意到挤奶女工接触牛痘后不会得天花。1796 年 5 月 14 日，他用从牛痘脓包中提取的脓液给 8 岁男孩接种——6 周后再给他接种天花，男孩没有患病。这是人类第一次疫苗接种。"
      },
      {
        "type": "callout",
        "heading": "疫苗的发展",
        "body": "① 1796—詹纳天花疫苗；② 1885—巴斯德狂犬病疫苗；③ 1920s—白喉/百日咳/破伤风；④ 1955—索尔克小儿麻痹症；⑤ 1980—WHO 宣布天花根除；⑥ 2020—新冠 mRNA 疫苗。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**医学可以做的最伟大的事情——预防疾病**。",
        "cite": "医学共识"
      },
      {
        "type": "list",
        "heading": "主要疫苗",
        "items": [
          "天花",
          "麻疹",
          "百日咳",
          "破伤风",
          "小儿麻痹症",
          "狂犬病"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1796",
        "era": "英国",
        "event": "**詹纳发明天花疫苗**"
      },
      {
        "year": "AD 1885",
        "era": "法国",
        "event": "**狂犬病疫苗**"
      },
      {
        "year": "AD 1955",
        "era": "美国",
        "event": "**小儿麻痹症疫苗**"
      },
      {
        "year": "AD 1980",
        "era": "全球",
        "event": "**天花根除**"
      },
      {
        "year": "AD 2020",
        "era": "全球",
        "event": "新冠 mRNA 疫苗"
      }
    ],
    "images": [
      {
        "imageKeyword": "Edward Jenner vaccination 1796",
        "caption": "詹纳发明天花疫苗（1796）",
        "credit": "Public Domain Illustration"
      },
      {
        "imageKeyword": "modern vaccination nurse child",
        "caption": "现代疫苗接种",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "COVID mRNA vaccine Pfizer",
        "caption": "mRNA 新冠疫苗",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "tech-antibiotics",
        "title": "抗生素",
        "reason": "医学突破"
      },
      {
        "id": "tech-fire",
        "title": "火",
        "reason": "古代医学"
      }
    ],
    "source": "《疫苗的故事》（奥菲特 2005）"
  },
  {
    "id": "tech-anesthesia",
    "name": "麻醉",
    "westernName": "Anesthesia",
    "category": "医学",
    "era": "AD 1846",
    "region": "美国",
    "inventor": "威廉·莫顿",
    "summary": "1846 年美国牙医莫顿首次公开演示乙醚麻醉，开启了无痛手术时代。",
    "facts": [
      {
        "label": "首次公开演示",
        "value": "**1846 麻省总医院**"
      },
      {
        "label": "发明者",
        "value": "**威廉·莫顿**"
      },
      {
        "label": "意义",
        "value": "**无痛手术**"
      },
      {
        "label": "影响",
        "value": "**手术革命 + 外科发展**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "无痛手术的开始",
        "body": "1846 年 10 月 16 日，美国牙医威廉·莫顿在波士顿麻省总医院首次公开演示乙醚麻醉——患者失去意识，外科医生成功切除颈部的肿瘤，全程无痛。"
      },
      {
        "type": "callout",
        "heading": "麻醉的革命性影响",
        "body": "麻醉使手术成为可能：① 复杂手术——心脏、器官移植、脑手术；② 无痛分娩；③ 疼痛管理；④ 但也带来麻醉意外、药物依赖风险。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**之前是外科的速度时代，现在是外科的科学时代**。",
        "cite": "外科史共识"
      },
      {
        "type": "list",
        "heading": "麻醉的影响",
        "items": [
          "无痛手术",
          "复杂手术",
          "无痛分娩",
          "疼痛管理"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1846",
        "era": "美国",
        "event": "**莫顿首次公开演示**"
      },
      {
        "year": "AD 1847",
        "era": "英国",
        "event": "辛普森推广氯仿"
      },
      {
        "year": "AD 1884",
        "era": "美国",
        "event": "可卡因局部麻醉"
      },
      {
        "year": "AD 1942",
        "era": "美国",
        "event": "箭毒（肌松剂）"
      }
    ],
    "images": [
      {
        "imageKeyword": "Morton ether anesthesia 1846",
        "caption": "莫顿乙醚麻醉（1846）",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Massachusetts General Hospital Ether Dome",
        "caption": "麻省总医院乙醚穹顶",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "modern anesthesia operation room",
        "caption": "现代手术室",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "tech-vaccine",
        "title": "疫苗",
        "reason": "医学突破"
      },
      {
        "id": "tech-antibiotics",
        "title": "抗生素",
        "reason": "医学突破"
      }
    ],
    "source": "《麻醉史》（兰格 2006）"
  }
]

export const TECH_CATEGORIES = [
  { id: 'energy', label: '能源', color: '#d4a85b' },
  { id: 'agriculture', label: '农业', color: '#5bc89a' },
  { id: 'communication', label: '通信', color: '#5b9bc8' },
  { id: 'material', label: '材料', color: '#c89a5b' },
  { id: 'military', label: '军事', color: '#b85450' },
  { id: 'navigation', label: '导航', color: '#9b7eb6' },
  { id: 'power', label: '动力', color: '#d4856a' },
  { id: 'calculation', label: '计算', color: '#5bc89a' },
  { id: 'medicine', label: '医学', color: '#e879b9' },
] as const

export type TechCategory = typeof TECH_CATEGORIES[number]['id']
