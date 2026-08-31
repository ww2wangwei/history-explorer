/**
 * allReligion.ts — 全宗教数据
 *
 * 详细整理从古至今的重要宗教
 * 覆盖亚伯拉罕一神教、印度本土宗教、中国本土宗教、新兴宗教
 */
import type { KeyFact, RichSection, TimelineEvent, TraditionImage, RelatedItem } from '@/types'

export interface Religion {
  id: string
  name: string
  westernName?: string
  category: string
  era: string
  region: string
  founder?: string
  summary: string

  facts: KeyFact[]
  sections: RichSection[]
  timeline: TimelineEvent[]
  images: TraditionImage[]
  related: RelatedItem[]
  source: string
}

export const RELIGIONS: Religion[] = [
  {
    "id": "rel-christianity",
    "name": "基督教",
    "westernName": "Christianity",
    "category": "亚伯拉罕一神教",
    "era": "AD 30 至今",
    "region": "中东（起源）→ 全球",
    "founder": "耶稣（拿撒勒人）",
    "summary": "全球最大宗教，信徒约 24 亿。源自 1 世纪巴勒斯坦地区的犹太教传道者耶稣。核心教义：三位一体（圣父、圣子、圣灵）、原罪、救赎、复活、信望爱。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 24 亿（2023，全球最大宗教）**"
      },
      {
        "label": "起源",
        "value": "**1 世纪巴勒斯坦**"
      },
      {
        "label": "创始人",
        "value": "**耶稣（BC 4—AD 30）**"
      },
      {
        "label": "核心经典",
        "value": "**《圣经》（旧约 + 新约）**"
      },
      {
        "label": "核心教义",
        "value": "**三位一体 · 原罪 · 救赎 · 复活**"
      },
      {
        "label": "主要分支",
        "value": "**天主教 · 东正教 · 新教**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "从犹太教到世界宗教",
        "body": "基督教起源于 1 世纪巴勒斯坦的犹太教背景。耶稣是拿撒勒的木匠（约瑟之子），约 AD 28-30 年开始传道，宣讲天国福音。约 AD 30 年，他被罗马总督本丢·彼拉多判处钉十字架。死后第三天复活——这是基督教信仰的核心。耶稣的门徒继续传道，AD 49-50 年保罗在大马士革路上悔改（基督教转向罗马世界）。AD 313 年君士坦丁大帝《米兰敕令》使基督教合法化，AD 380 年成为罗马帝国国教。"
      },
      {
        "type": "callout",
        "heading": "三位一体——核心教义",
        "body": "三位一体（Trinity）是基督教最核心的教义：上帝只有一个，但有三个位格——圣父（创造者）、圣子（耶稣基督，道成肉身）、圣灵（神圣临在）。三者同质、同尊、同永恒。这由尼西亚公会议（AD 325）和君士坦丁堡公会议（AD 381）确立。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**爱你的邻人如同自己**。",
        "cite": "《马太福音》22:39"
      },
      {
        "type": "quote",
        "text": "**神爱世人，甚至将他的独生子赐给他们**。",
        "cite": "《约翰福音》3:16"
      },
      {
        "type": "list",
        "heading": "基督教三大分支",
        "items": [
          "天主教——罗马教廷为中心，约 13 亿信徒",
          "东正教——君士坦丁堡为中心，约 2.2 亿信徒",
          "新教——宗教改革后兴起，约 8 亿信徒"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 30",
        "era": "耶稣时代",
        "event": "耶稣钉十字架、复活"
      },
      {
        "year": "AD 49",
        "era": "保罗",
        "event": "保罗大马士革悔改"
      },
      {
        "year": "AD 313",
        "era": "君士坦丁",
        "event": "《米兰敕令》——基督教合法化"
      },
      {
        "year": "AD 325",
        "era": "尼西亚公会议",
        "event": "确立三位一体教义"
      },
      {
        "year": "AD 380",
        "era": "罗马帝国",
        "event": "基督教成为国教"
      },
      {
        "year": "AD 1054",
        "era": "东西分裂",
        "event": "天主教与东正教大分裂"
      },
      {
        "year": "AD 1517",
        "era": "宗教改革",
        "event": "马丁·路德发表 95 条论纲——新教诞生"
      },
      {
        "year": "AD 2023",
        "era": "现代",
        "event": "全球 24 亿信徒"
      }
    ],
    "images": [
      {
        "imageKeyword": "Church Holy Sepulchre Jerusalem",
        "caption": "耶路撒冷圣墓教堂",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Last Supper Leonardo da Vinci",
        "caption": "《最后的晚餐》（达芬奇）",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "St Peter's Basilica Vatican",
        "caption": "圣彼得大教堂",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Crucifixion Christian art",
        "caption": "耶稣受难像",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-judaism",
        "title": "犹太教",
        "reason": "基督教的母宗教"
      },
      {
        "id": "rel-islam",
        "title": "伊斯兰教",
        "reason": "亚伯拉罕三教之一"
      },
      {
        "id": "th-jesus",
        "title": "耶稣",
        "reason": "基督教创始人"
      },
      {
        "id": "rel-buddhism",
        "title": "佛教",
        "reason": "同期东方宗教"
      },
      {
        "id": "th-aquinas",
        "title": "阿奎那",
        "reason": "基督教神哲学"
      }
    ],
    "source": "《圣经》（新旧约全书）·《基督教史》（胡斯都·阿诺德）·《教父哲学全集》"
  },
  {
    "id": "rel-islam",
    "name": "伊斯兰教",
    "westernName": "Islam",
    "category": "亚伯拉罕一神教",
    "era": "AD 610 至今",
    "region": "阿拉伯（起源）→ 全球",
    "founder": "穆罕默德",
    "summary": "世界第二大宗教，信徒约 20 亿。源自 7 世纪阿拉伯半岛先知穆罕默德启示。核心教义：万物非主唯有真主、独一神信仰、五功、伊斯兰（顺从）。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 20 亿（2023，全球第二大宗教）**"
      },
      {
        "label": "起源",
        "value": "**7 世纪阿拉伯**"
      },
      {
        "label": "创始人",
        "value": "**穆罕默德（570—632）**"
      },
      {
        "label": "核心经典",
        "value": "**《古兰经》**"
      },
      {
        "label": "核心教义",
        "value": "**独一真主 · 先知 · 后世**"
      },
      {
        "label": "主要分支",
        "value": "**逊尼派（约 85%）· 什叶派（约 15%）**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "从沙漠部落信仰到世界宗教",
        "body": "伊斯兰教起源于 7 世纪阿拉伯半岛。穆罕默德 40 岁（约 AD 610）在麦加附近的希拉山洞接到天使加百利的第一次启示——这是伊斯兰教的开端。他被驱逐到麦地那（公元 622，希吉拉，伊斯兰历元年）。他既是宗教领袖又是政治军事领袖。公元 630 年和平进入麦加，清除克尔白内的偶像，确立伊斯兰教在阿拉伯半岛的主导地位。他去世后，伊斯兰帝国迅速扩张：100 年内从中东扩展到北非、西班牙、印度北部和中国唐朝。"
      },
      {
        "type": "callout",
        "heading": "五功——伊斯兰教五大支柱",
        "body": "伊斯兰教五大支柱（Five Pillars）：① 念功（清真言：万物非主唯有真主，穆罕默德是主的使者）；② 礼功（每日五次礼拜，朝向麦加）；③ 课功（天课，财产 2.5% 用于慈善）；④ 斋功（斋月日出至日落禁食）；⑤ 朝功（一生至少一次到麦加朝觐）。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**万物非主，唯有真主；穆罕默德是主的使者**。",
        "cite": "清真言"
      },
      {
        "type": "quote",
        "text": "**求知是每个穆斯林的天职**。",
        "cite": "圣训"
      },
      {
        "type": "list",
        "heading": "伊斯兰教主要分支",
        "items": [
          "逊尼派（约 85%）——阿布·伯克尔继承人",
          "什叶派（约 15%）——阿里继承人",
          "苏菲派——神秘主义",
          "瓦哈比派——18 世纪沙特阿拉伯兴起",
          "阿赫迈迪亚派——19 世纪兴起"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 570",
        "era": "阿拉伯",
        "event": "穆罕默德生于麦加"
      },
      {
        "year": "AD 610",
        "era": "阿拉伯",
        "event": "**穆罕默德接到第一次启示**"
      },
      {
        "year": "AD 622",
        "era": "希吉拉",
        "event": "**从麦加迁徙麦地那——伊斯兰历元年**"
      },
      {
        "year": "AD 630",
        "era": "阿拉伯",
        "event": "**和平进入麦加**"
      },
      {
        "year": "AD 632",
        "era": "阿拉伯",
        "event": "穆罕默德去世"
      },
      {
        "year": "AD 632",
        "era": "阿布·伯克尔",
        "event": "第一任哈里发"
      },
      {
        "year": "AD 661",
        "era": "阿里遇刺",
        "event": "什叶派形成"
      },
      {
        "year": "AD 711",
        "era": "倭马亚王朝",
        "event": "阿拉伯人征服西班牙"
      },
      {
        "year": "AD 1453",
        "era": "奥斯曼帝国",
        "event": "攻占君士坦丁堡"
      },
      {
        "year": "AD 1924",
        "era": "土耳其",
        "event": "凯末尔废除哈里发制度"
      },
      {
        "year": "AD 2023",
        "era": "现代",
        "event": "全球 20 亿信徒"
      }
    ],
    "images": [
      {
        "imageKeyword": "Mashhad al-Haram Mecca Kaaba",
        "caption": "麦加禁寺（克尔白）",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Prophet Mosque Medina",
        "caption": "麦地那先知清真寺",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Islamic calligraphy art",
        "caption": "伊斯兰书法艺术",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Hagia Sophia Istanbul",
        "caption": "圣索菲亚大教堂",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-christianity",
        "title": "基督教",
        "reason": "亚伯拉罕三教之一"
      },
      {
        "id": "rel-judaism",
        "title": "犹太教",
        "reason": "亚伯拉罕三教之一"
      },
      {
        "id": "th-muhammad",
        "title": "穆罕默德",
        "reason": "伊斯兰教先知"
      },
      {
        "id": "rel-buddhism",
        "title": "佛教",
        "reason": "世界三大宗教"
      }
    ],
    "source": "《古兰经》·《圣训》·《伊斯兰教史》（侯赛因·海卡尔）·《阿拉伯通史》"
  },
  {
    "id": "rel-hinduism",
    "name": "印度教",
    "westernName": "Hinduism",
    "category": "印度本土宗教",
    "era": "约 BC 1500 至今",
    "region": "印度",
    "summary": "世界最古老的宗教之一，信徒约 12 亿。源自吠陀文明，与婆罗门教、佛教、耆那教有共同根源。核心教义：轮回（samsara）、业报（karma）、解脱（moksha）、梵我一如。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 12 亿**"
      },
      {
        "label": "起源",
        "value": "**约 BC 1500 吠陀文明**"
      },
      {
        "label": "核心经典",
        "value": "**《吠陀》《奥义书》《薄伽梵歌》**"
      },
      {
        "label": "核心教义",
        "value": "**轮回 · 业报 · 解脱 · 梵我一如**"
      },
      {
        "label": "主要神祇",
        "value": "**梵天（创造）· 毗湿奴（维持）· 湿婆（毁灭）**"
      },
      {
        "label": "三大主神",
        "value": "**梵天/毗湿奴/湿婆——三位一体**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "世界上最古老的宗教",
        "body": "印度教源自约公元前 1500 年的吠陀文明。雅利安人进入印度，创造了吠陀经典（Vedas），包括《梨俱吠陀》《娑摩吠陀》《夜柔吠陀》《阿闼婆吠陀》。吠陀宗教后来演化为婆罗门教（Brahmanism），强调种姓制度、吠陀权威、祭祀仪式。公元前 6-5 世纪，佛教、耆那教兴起，反对种姓制度。公元 4-10 世纪，婆罗门教吸收佛教、耆那教元素，重新命名为印度教（Hinduism）。印度教没有单一创始人，是众多信仰和实践的综合。"
      },
      {
        "type": "callout",
        "heading": "轮回与业报——印度教核心",
        "body": "印度教核心教义：① 轮回（samsara）——灵魂在死亡后进入新的生命，可能是人、动物、神等；② 业报（karma）——行为会影响下一世；③ 解脱（moksha）——通过修行摆脱轮回；④ 梵我一如（Atman = Brahman）——个体灵魂（小我）与宇宙灵魂（大我）本质同一。达摩（dharma）是每个人的神圣责任。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**你就是你所相信的**。",
        "cite": "《奥义书》"
      },
      {
        "type": "quote",
        "text": "**完成你的责任，不要计较结果**。",
        "cite": "《薄伽梵歌》"
      },
      {
        "type": "list",
        "heading": "印度教主要分支",
        "items": [
          "毗湿奴派（Vaishnavism）——崇拜毗湿奴",
          "湿婆派（Shaivism）——崇拜湿婆",
          "性力派（Shaktism）——崇拜女神",
          "智慧派（Advaita Vedanta）——商羯罗",
          "虔信派（Bhakti）——情感崇拜"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 1500",
        "era": "吠陀时代",
        "event": "雅利安人进入印度"
      },
      {
        "year": "BC 1200",
        "era": "梨俱吠陀",
        "event": "《梨俱吠陀》成书"
      },
      {
        "year": "BC 800",
        "era": "梵书时代",
        "event": "婆罗门教形成"
      },
      {
        "year": "BC 600",
        "era": "佛陀时代",
        "event": "佛教、耆那教兴起"
      },
      {
        "year": "BC 300",
        "era": "孔雀王朝",
        "event": "阿育王支持佛教"
      },
      {
        "year": "AD 200",
        "era": "奥义书时代",
        "event": "《奥义书》结集"
      },
      {
        "year": "AD 320",
        "era": "笈多王朝",
        "event": "印度教成形"
      },
      {
        "year": "AD 800",
        "era": "商羯罗",
        "event": "商羯罗改革——不二论"
      },
      {
        "year": "AD 1100",
        "era": "虔信运动",
        "event": "罗摩奴阇等改革家"
      },
      {
        "year": "AD 2023",
        "era": "现代",
        "event": "全球 12 亿信徒"
      }
    ],
    "images": [
      {
        "imageKeyword": "Hindu temple Khajuraho India",
        "caption": "克久拉霍印度教神庙",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Brahma Vishnu Shiva Trimurti",
        "caption": "梵天/毗湿奴/湿婆三相神",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Ganges River Varanasi India",
        "caption": "恒河——印度教圣河",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Bhagavad Gita manuscript",
        "caption": "《薄伽梵歌》",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-buddhism",
        "title": "佛教",
        "reason": "印度本土宗教"
      },
      {
        "id": "th-buddha",
        "title": "释迦牟尼",
        "reason": "佛教创始人"
      },
      {
        "id": "th-nagarjuna",
        "title": "龙树",
        "reason": "大乘佛教哲学家"
      },
      {
        "id": "th-gandhi",
        "title": "甘地",
        "reason": "印度教家庭背景"
      }
    ],
    "source": "《吠陀经典》·《奥义书》·《薄伽梵歌》·《印度教》（Klaus Klostermaier 2007）"
  },
  {
    "id": "rel-buddhism",
    "name": "佛教",
    "westernName": "Buddhism",
    "category": "印度本土宗教",
    "era": "BC 6世纪 至今",
    "region": "印度（起源）→ 中国/东亚/东南亚",
    "founder": "乔达摩·悉达多（释迦牟尼）",
    "summary": "世界三大宗教之一，信徒约 5 亿。释迦牟尼在 BC 6 世纪创立。核心教义：四圣谛、八正道、缘起性空、无我、涅槃。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 5 亿**"
      },
      {
        "label": "起源",
        "value": "**BC 6 世纪印度**"
      },
      {
        "label": "创始人",
        "value": "**释迦牟尼（BC 563—483）**"
      },
      {
        "label": "核心经典",
        "value": "**三藏（经律论）**"
      },
      {
        "label": "核心教义",
        "value": "**四圣谛 · 八正道 · 缘起性空 · 涅槃**"
      },
      {
        "label": "主要分支",
        "value": "**上座部（南传）· 大乘（北传）· 金刚乘（密宗）**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "从苦行到觉悟",
        "body": "佛教由乔达摩·悉达多王子在公元前 6 世纪创立。他 19 岁出游四门，见老病死沙门，意识到人都要经历这些痛苦。29 岁夜半逾城出家，先学苦行 6 年无果，后在菩提伽耶树下发愿「不成正觉，不起此座」，49 天后夜睹明星豁然开朗，35 岁成佛。此后 45 年在恒河流域传法，度化无数弟子。80 岁于拘尸那迦双林树间涅槃。佛教强调「依法不依人」，佛陀临终时说：「我所说的法，你们要好好奉行；它就是你们的老师。」"
      },
      {
        "type": "callout",
        "heading": "四圣谛——佛教核心",
        "body": "四圣谛（Four Noble Truths）：① 苦谛——人生是苦（生老病死、求不得、怨憎会、爱别离、五蕴炽盛）；② 集谛——苦的来源是贪嗔痴；③ 灭谛——苦可以止息，达到涅槃；④ 道谛——通过八正道可以灭苦。八正道：正见、正思惟、正语、正业、正命、正精进、正念、正定。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**色即是空，空即是色**。",
        "cite": "《心经》"
      },
      {
        "type": "quote",
        "text": "**一切众生皆有如来智慧德相，但以妄想执着不能证得**。",
        "cite": "《华严经》"
      },
      {
        "type": "list",
        "heading": "佛教三大分支",
        "items": [
          "上座部（Theravada）——南传（斯里兰卡/缅甸/泰国/柬埔寨）",
          "大乘（Mahayana）——北传（中国/日本/韩国/越南）",
          "金刚乘（Vajrayana）——藏传（西藏/蒙古/不丹）"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 563",
        "era": "佛陀",
        "event": "释迦牟尼诞生"
      },
      {
        "year": "BC 534",
        "era": "佛陀",
        "event": "29 岁出家"
      },
      {
        "year": "BC 528",
        "era": "佛陀",
        "event": "35 岁菩提树下成佛"
      },
      {
        "year": "BC 483",
        "era": "佛陀",
        "event": "80 岁涅槃"
      },
      {
        "year": "BC 268",
        "era": "阿育王",
        "event": "阿育王皈依佛教"
      },
      {
        "year": "AD 67",
        "era": "汉代",
        "event": "**佛教经西域传入中国**"
      },
      {
        "year": "AD 600",
        "era": "唐代",
        "event": "玄奘西行取经"
      },
      {
        "year": "AD 805",
        "era": "唐代",
        "event": "**佛教传入日本**"
      },
      {
        "year": "AD 1950s",
        "era": "现代",
        "event": "佛教传入西方"
      },
      {
        "year": "AD 2023",
        "era": "现代",
        "event": "全球 5 亿信徒"
      }
    ],
    "images": [
      {
        "imageKeyword": "Buddha meditation statue Bodh Gaya",
        "caption": "菩提伽耶佛陀像",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Sarnath deer park Buddha",
        "caption": "鹿野苑——初转法轮处",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Borobudur temple Indonesia Buddhist",
        "caption": "婆罗浮屠——印度尼西亚",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Buddha Lumbini birthplace Nepal",
        "caption": "蓝毗尼——佛陀诞生地",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-hinduism",
        "title": "印度教",
        "reason": "印度本土宗教"
      },
      {
        "id": "th-buddha",
        "title": "释迦牟尼",
        "reason": "佛教创始人"
      },
      {
        "id": "th-nagarjuna",
        "title": "龙树",
        "reason": "中观哲学"
      },
      {
        "id": "th-xuanzang",
        "title": "玄奘",
        "reason": "取经高僧"
      },
      {
        "id": "th-daoism",
        "title": "道家",
        "reason": "中国本土思想"
      }
    ],
    "source": "《阿含经》《华严经》《心经》《金刚经》《法华经》·《佛教史》（任继愈）"
  },
  {
    "id": "rel-judaism",
    "name": "犹太教",
    "westernName": "Judaism",
    "category": "亚伯拉罕一神教",
    "era": "约 BC 2000 至今",
    "region": "中东",
    "founder": "亚伯拉罕（传说）",
    "summary": "世界最古老的一神教，亚伯拉罕三教的母宗教。信徒约 1500 万。核心教义：独一真神、契约、托拉律法、选民。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 1500 万**"
      },
      {
        "label": "起源",
        "value": "**约 BC 2000 中东**"
      },
      {
        "label": "创始人",
        "value": "**亚伯拉罕（传说）**"
      },
      {
        "label": "核心经典",
        "value": "**《托拉》（摩西五经）**"
      },
      {
        "label": "核心教义",
        "value": "**独一真神 · 契约 · 律法 · 选民**"
      },
      {
        "label": "影响",
        "value": "**基督教和伊斯兰教的源头**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "最古老的一神教",
        "body": "犹太教起源于约公元前 2000 年的美索不达米亚。亚伯拉罕（传说）被神召唤，迁居迦南（今以色列/巴勒斯坦）。他的孙子雅各（以色列）有 12 个儿子，繁衍成 12 个支派。摩西带领以色列人出埃及（公元前 13 世纪），在西奈山接受神的十诫。公元前 1000 年左右大卫和所罗门建立以色列王国。所罗门死后王国分裂（以色列和犹大），公元前 722 年亚述灭以色列，公元前 586 年巴比伦灭犹大，犹太人开始「流散」（Diaspora）。"
      },
      {
        "type": "callout",
        "heading": "犹太教三大核心概念",
        "body": "① 独一真神（monotheism）——宇宙只有一个神，反对偶像崇拜；② 契约（covenant）——神与犹太人立约，犹太人遵守律法，神保护他们；③ 托拉（Torah）——神通过摩西赐予的律法，是犹太教核心经典，包括《创世记》《出埃及记》《利未记》《民数记》《申命记》。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**以色列啊，你要听：耶和华我们神是独一的主**。",
        "cite": "《申命记》6:4"
      },
      {
        "type": "quote",
        "text": "**爱人如己**。",
        "cite": "《利未记》19:18"
      },
      {
        "type": "list",
        "heading": "犹太教主要分支",
        "items": [
          "正统派（Orthodox）——严格遵守律法",
          "保守派（Conservative）——传统但不极端",
          "改革派（Reform）——现代化",
          "重建派（Reconstructionist）——社会运动"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 2000",
        "era": "族长时期",
        "event": "亚伯拉罕传说"
      },
      {
        "year": "BC 1300",
        "era": "出埃及",
        "event": "**摩西出埃及记**"
      },
      {
        "year": "BC 1000",
        "era": "王国",
        "event": "大卫建立以色列王国"
      },
      {
        "year": "BC 950",
        "era": "王国",
        "event": "所罗门圣殿建成"
      },
      {
        "year": "BC 722",
        "era": "亚述",
        "event": "以色列王国灭亡"
      },
      {
        "year": "BC 586",
        "era": "巴比伦",
        "event": "**耶路撒冷圣殿被毁，开始流散**"
      },
      {
        "year": "BC 515",
        "era": "波斯",
        "event": "第二圣殿建成"
      },
      {
        "year": "AD 70",
        "era": "罗马",
        "event": "**第二圣殿被毁**"
      },
      {
        "year": "AD 1948",
        "era": "现代",
        "event": "**以色列国成立**"
      },
      {
        "year": "AD 2023",
        "era": "现代",
        "event": "全球 1500 万信徒"
      }
    ],
    "images": [
      {
        "imageKeyword": "Western Wall Jerusalem",
        "caption": "哭墙——耶路撒冷",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Torah scroll Jewish",
        "caption": "托拉经卷",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Menorah ancient Jewish symbol",
        "caption": "七烛台（Menorah）",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Star of David symbol",
        "caption": "大卫之星",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-christianity",
        "title": "基督教",
        "reason": "源自犹太教"
      },
      {
        "id": "rel-islam",
        "title": "伊斯兰教",
        "reason": "亚伯拉罕三教"
      },
      {
        "id": "th-jesus",
        "title": "耶稣",
        "reason": "犹太传道者"
      },
      {
        "id": "th-muhammad",
        "title": "穆罕默德",
        "reason": "中东先知"
      }
    ],
    "source": "《托拉》（摩西五经）·《塔木德》·《犹太教史》（马丁·古德曼）"
  },
  {
    "id": "rel-taoism",
    "name": "道教",
    "westernName": "Taoism",
    "category": "中国本土宗教",
    "era": "BC 2世纪 至今",
    "region": "中国",
    "founder": "张道陵（创立道教教团）",
    "summary": "中国本土宗教，源自道家思想和古代巫术。信徒约 1200 万（正式皈依），但文化影响深远。核心：道法自然、清静无为、长生久视。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 1200 万（正式）**"
      },
      {
        "label": "起源",
        "value": "**汉代**"
      },
      {
        "label": "创始人",
        "value": "**张道陵（34—156）**"
      },
      {
        "label": "核心经典",
        "value": "**《道德经》《庄子》《道藏》**"
      },
      {
        "label": "核心教义",
        "value": "**道法自然 · 清静无为 · 长生久视**"
      },
      {
        "label": "影响",
        "value": "**中国哲学、医学、文学、艺术**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "从道家到道教",
        "body": "道教是中国本土宗教，源自先秦道家思想（老子、庄子）和古代巫术。秦汉时期，方士寻求长生不老药，活跃于宫廷。汉代谶纬神学盛行。公元 142 年（汉顺帝），张道陵创立五斗米道（早期道教），自称太上老君授他「正一盟威之道」，奉老子为教主。北魏寇谦之（421）创立新天师道（北天师道）。南宋时期，全真道兴起，主张三教合一。"
      },
      {
        "type": "callout",
        "heading": "道教核心教义",
        "body": "① 道——宇宙的本原和最高法则；② 德——道在万物中的体现；③ 无为——顺应自然，不刻意干预；④ 清静——内心清净；⑤ 长生久视——通过修炼（内丹/外丹/养生）追求长生；⑥ 抱朴——保持质朴本性。道教修炼方法：内丹（气功）、外丹（炼丹术）、房中术（性修炼）、符箓（驱邪）。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**人法地，地法天，天法道，道法自然**。",
        "cite": "《道德经》"
      },
      {
        "type": "quote",
        "text": "**道生一，一生二，二生三，三生万物**。",
        "cite": "《道德经》"
      },
      {
        "type": "list",
        "heading": "道教主要派别",
        "items": [
          "全真道——丘处机（1148—1227）创立，主三教合一",
          "正一道（天师道）——张道陵创立，主符箓斋醮",
          "上清派——上清经派系",
          "灵宝派——灵宝经派系"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 6世纪",
        "era": "春秋",
        "event": "老子诞生"
      },
      {
        "year": "BC 369",
        "era": "战国",
        "event": "庄子诞生"
      },
      {
        "year": "AD 142",
        "era": "东汉",
        "event": "**张道陵创立五斗米道**"
      },
      {
        "year": "AD 184",
        "era": "东汉",
        "event": "张角太平道——黄巾起义"
      },
      {
        "year": "AD 421",
        "era": "北魏",
        "event": "寇谦之创立新天师道"
      },
      {
        "year": "AD 1119",
        "era": "北宋",
        "event": "**《道藏》编修**"
      },
      {
        "year": "AD 1167",
        "era": "金代",
        "event": "王重阳创立全真道"
      },
      {
        "year": "AD 1224",
        "era": "南宋",
        "event": "丘处机见成吉思汗"
      },
      {
        "year": "AD 1900",
        "era": "清代",
        "event": "道教衰弱"
      },
      {
        "year": "AD 2023",
        "era": "现代",
        "event": "中国 1200 万正式信徒"
      }
    ],
    "images": [
      {
        "imageKeyword": "Taoist temple Wudang Mountain China",
        "caption": "武当山道教宫观",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Laozi Taoism founder",
        "caption": "老子——道教主神",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Qingyang Gong Chengdu Taoist temple",
        "caption": "青羊宫——成都道教宫观",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Daozang Chinese Taoist collection",
        "caption": "《道藏》",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "th-laozi",
        "title": "老子",
        "reason": "道家创始人"
      },
      {
        "id": "th-zhuangzi",
        "title": "庄子",
        "reason": "道家集大成"
      },
      {
        "id": "rel-buddhism",
        "title": "佛教",
        "reason": "中国第二大宗教"
      },
      {
        "id": "rel-confucianism",
        "title": "儒教",
        "reason": "中国三大思想"
      }
    ],
    "source": "《道德经》·《庄子》·《道藏》·《中国道教史》（卿希泰）"
  },
  {
    "id": "rel-confucianism",
    "name": "儒教",
    "westernName": "Confucianism",
    "category": "中国本土宗教",
    "era": "BC 551 至今",
    "region": "中国",
    "founder": "孔子",
    "summary": "中国主流思想体系，影响东亚 2500 年。严格来说，儒学是哲学宗教，部分学者认为它不是典型宗教。核心：仁、礼、中庸、孝、君子。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 600 万（正式）**"
      },
      {
        "label": "起源",
        "value": "**BC 551 春秋**"
      },
      {
        "label": "创始人",
        "value": "**孔子**"
      },
      {
        "label": "核心经典",
        "value": "**《四书》《五经》**"
      },
      {
        "label": "核心教义",
        "value": "**仁 · 礼 · 中庸 · 孝 · 君子**"
      },
      {
        "label": "影响",
        "value": "**东亚文明圈 2500 年**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "从思想到宗教",
        "body": "儒学由孔子（BC 551—479）创立。孔子整理《诗》《书》《礼》《易》《春秋》，整理上古文化，创立儒家学派。最初只是哲学流派。公元前 136 年（汉武帝），董仲舒提出「罢黜百家，独尊儒术」，儒学成为国家意识形态。公元 1 世纪，儒学开始宗教化，与「天」「祖先」崇拜结合，孔子被神格化。唐代韩愈提出儒家「道统」论。宋明理学进一步将儒学哲学化（朱熹、王阳明）。明清时期，儒学在中国、台湾、朝鲜、越南、琉球成为主流意识形态。"
      },
      {
        "type": "callout",
        "heading": "儒教核心：仁、礼、中庸",
        "body": "① 仁——儒家伦理核心，「仁者爱人」，「己欲立而立人，己欲达而达人」；② 礼——社会规范，「克己复礼为仁」，通过礼仪维系社会秩序；③ 中庸——儒家方法论，「中不偏，庸不易」，追求恰到好处；④ 孝——儒家伦理基础，「百善孝为先」；⑤ 君子——儒家理想人格，「君子坦荡荡，小人长戚戚」。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**己所不欲，勿施于人**。",
        "cite": "《论语》"
      },
      {
        "type": "quote",
        "text": "**克己复礼为仁**。",
        "cite": "《论语》"
      },
      {
        "type": "list",
        "heading": "儒教经典",
        "items": [
          "《四书》——《大学》《中庸》《论语》《孟子》",
          "《五经》——《诗经》《尚书》《礼记》《易经》《春秋》"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 551",
        "era": "春秋",
        "event": "孔子诞生"
      },
      {
        "year": "BC 479",
        "era": "春秋",
        "event": "孔子去世"
      },
      {
        "year": "BC 372",
        "era": "战国",
        "event": "孟子诞生"
      },
      {
        "year": "BC 136",
        "era": "汉武帝",
        "event": "**独尊儒术**"
      },
      {
        "year": "AD 1050",
        "era": "北宋",
        "event": "朱熹理学集大成"
      },
      {
        "year": "AD 1472",
        "era": "明代",
        "event": "王阳明心学兴起"
      },
      {
        "year": "AD 1905",
        "era": "清代",
        "event": "废除科举——儒学不再为官方意识形态"
      },
      {
        "year": "AD 2023",
        "era": "现代",
        "event": "中国 600 万正式信徒"
      }
    ],
    "images": [
      {
        "imageKeyword": "Confucius Temple Qufu",
        "caption": "曲阜孔庙",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Confucius portrait Ming dynasty",
        "caption": "孔子像",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Five Classics Chinese Confucian",
        "caption": "五经",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Confucius teaching disciples",
        "caption": "孔子讲学",
        "credit": "Public Domain Illustration"
      }
    ],
    "related": [
      {
        "id": "th-confucius",
        "title": "孔子",
        "reason": "儒学创始人"
      },
      {
        "id": "th-mencius",
        "title": "孟子",
        "reason": "儒家亚圣"
      },
      {
        "id": "rel-taoism",
        "title": "道教",
        "reason": "中国本土宗教"
      },
      {
        "id": "rel-buddhism",
        "title": "佛教",
        "reason": "中国传入宗教"
      }
    ],
    "source": "《论语》·《孟子》·《大学》《中庸》·《中国儒学史》（李申）"
  },
  {
    "id": "rel-sikhism",
    "name": "锡克教",
    "westernName": "Sikhism",
    "category": "印度本土宗教",
    "era": "AD 15世纪 至今",
    "region": "印度旁遮普",
    "founder": "古鲁·那纳克",
    "summary": "世界第五大宗教，信徒约 3000 万。15 世纪由古鲁·那纳克创立，反对种姓制度。核心：唯一神、内在之光、平等劳动。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 3000 万（全球第五大宗教）**"
      },
      {
        "label": "起源",
        "value": "**15 世纪印度旁遮普**"
      },
      {
        "label": "创始人",
        "value": "**古鲁·那纳克（1469—1539）**"
      },
      {
        "label": "核心经典",
        "value": "**《古鲁格兰特·萨希卜》**"
      },
      {
        "label": "核心教义",
        "value": "**唯一神 · 平等 · 诚实劳动 · 公益**"
      },
      {
        "label": "标志",
        "value": "**五K（Kesh/Kara/Kanga/Kaccha/Kirpan）**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "反对种姓制度的锡克教",
        "body": "锡克教由古鲁·那纳克（1469—1539）创立。他在 30 岁时经历一次「觉醒」，消失 3 天后宣布「神不是印度教徒，也不是穆斯林」——印度教和伊斯兰教都不能独享真理。锡克教（Sikh 意为「学徒」）强调：① 唯一神（Ik Onkar）；② 人人平等，反对种姓；③ 诚实劳动（halat）；④ 公益（vand chakna）；⑤ 内部之光（Jyot）。后继 9 位古鲁发展了锡克教，第十代古鲁将《古鲁格兰特》定为终末经典。"
      },
      {
        "type": "callout",
        "heading": "锡克教五大标志（5K）",
        "body": "每个受过洗礼的锡克教徒佩戴五件标志性物品（5K）：① Kesh——不剪头发；② Kara——铁手镯（正义）；③ Kanga——木梳（清洁）；④ Kaccha——短裤（贞操）；⑤ Kirpan——短剑（勇气）。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**神是一，印度教和伊斯兰教都不是唯一的真理**。",
        "cite": "古鲁·那纳克"
      },
      {
        "type": "quote",
        "text": "**在内心深处神居住着——用心去发现**。",
        "cite": "古鲁·那纳克"
      },
      {
        "type": "list",
        "heading": "锡克教主要原则",
        "items": [
          "唯一神（Ik Onkar）",
          "人人平等",
          "诚实劳动",
          "分享财富",
          "内心之光"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1469",
        "era": "旁遮普",
        "event": "古鲁·那纳克诞生"
      },
      {
        "year": "AD 1499",
        "era": "旁遮普",
        "event": "古鲁·那纳克觉醒"
      },
      {
        "year": "AD 1539",
        "era": "旁遮普",
        "event": "古鲁·那纳克去世"
      },
      {
        "year": "AD 1604",
        "era": "第五代古鲁",
        "event": "**《古鲁格兰特》结集**"
      },
      {
        "year": "AD 1708",
        "era": "第十代古鲁",
        "event": "**古鲁·哥宾德·辛格建立卡尔萨军团**"
      },
      {
        "year": "AD 1799",
        "era": "锡克帝国",
        "event": "兰季特·辛格建立锡克帝国"
      },
      {
        "year": "AD 1849",
        "era": "英国",
        "event": "锡克帝国并入英国"
      },
      {
        "year": "AD 2023",
        "era": "现代",
        "event": "全球 3000 万信徒"
      }
    ],
    "images": [
      {
        "imageKeyword": "Golden Temple Amritsar Sikh",
        "caption": "金庙——阿姆利则",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Guru Nanak founder Sikh",
        "caption": "古鲁·那纳克",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Khanda Sikh symbol",
        "caption": "锡克教标志 Khanda",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Guru Granth Sahib Sikh holy book",
        "caption": "《古鲁格兰特》",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-hinduism",
        "title": "印度教",
        "reason": "反对种姓制度"
      },
      {
        "id": "rel-islam",
        "title": "伊斯兰教",
        "reason": "反对唯一真理"
      },
      {
        "id": "th-gandhi",
        "title": "甘地",
        "reason": "受锡克教影响"
      },
      {
        "id": "rel-buddhism",
        "title": "佛教",
        "reason": "印度本土宗教"
      }
    ],
    "source": "《古鲁格兰特·萨希卜》·《锡克教史》（哈拉姆·辛格·谢卡尔）"
  },
  {
    "id": "rel-jainism",
    "name": "耆那教",
    "westernName": "Jainism",
    "category": "印度本土宗教",
    "era": "BC 6世纪 至今",
    "region": "印度",
    "founder": "摩诃毗罗（筏驮摩那）",
    "summary": "印度最古老的现存宗教之一，信徒约 400 万。强调非暴力（ahimsa）、不杀生。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 400 万**"
      },
      {
        "label": "起源",
        "value": "**BC 6 世纪印度**"
      },
      {
        "label": "创始人",
        "value": "**摩诃毗罗（BC 599—527）**"
      },
      {
        "label": "核心教义",
        "value": "**非暴力 · 不杀生 · 不妄语 · 不偷盗 · 无所有**"
      },
      {
        "label": "影响",
        "value": "**影响甘地和印度独立运动**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "最严格的非暴力宗教",
        "body": "耆那教由摩诃毗罗（Mahavira，BC 599—527）与佛教创始人乔达摩·悉达多同期创立。耆那（Jain）意为「胜者」，指战胜内心欲望的人。耆那教强调「五戒」（非暴力、不妄语、不偷盗、无所有、不淫欲）。其中非暴力（ahimsa）最严格——不仅不杀生，连微生物都避免伤害——耆那教徒戴口罩避免吸入虫子，素食，过滤水。"
      },
      {
        "type": "callout",
        "heading": "五戒——非暴力是核心",
        "body": "耆那教五戒：① 非暴力（Ahimsa）——不伤害任何生命；② 不妄语（Satya）——说真话；③ 不偷盗（Asteya）——不偷窃；④ 无所有（Aparigraha）——不执著；⑤ 不淫欲（Brahmacharya）——禁欲。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**不要伤害、压迫、奴役、侮辱、折磨任何生物**。",
        "cite": "耆那教五戒"
      },
      {
        "type": "quote",
        "text": "**胜者非胜他人，而是胜自己之欲**。",
        "cite": "耆那教"
      },
      {
        "type": "list",
        "heading": "耆那教主要派别",
        "items": [
          "白衣派（Shvetambara）——穿白衣",
          "天衣派（Digambara）——裸身（无所有）"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 599",
        "era": "印度",
        "event": "摩诃毗罗诞生"
      },
      {
        "year": "BC 557",
        "era": "印度",
        "event": "摩诃毗罗出家"
      },
      {
        "year": "BC 527",
        "era": "印度",
        "event": "摩诃毗罗涅槃"
      },
      {
        "year": "BC 367",
        "era": "印度",
        "event": "耆那教首次分裂——白衣派/天衣派"
      },
      {
        "year": "AD 79",
        "era": "印度",
        "event": "第二次大分裂"
      },
      {
        "year": "AD 500",
        "era": "印度",
        "event": "耆那教在中印度兴盛"
      },
      {
        "year": "AD 1000",
        "era": "印度",
        "event": "耆那教传入南印度"
      },
      {
        "year": "AD 2023",
        "era": "现代",
        "event": "全球 400 万信徒"
      }
    ],
    "images": [
      {
        "imageKeyword": "Jain temple Ranakpur India",
        "caption": "拉那克普尔耆那教神庙",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Mahavira founder Jain",
        "caption": "摩诃毗罗——耆那教创始人",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Jain Ahimsa symbol",
        "caption": "非暴力（Ahimsa）——耆那教核心",
        "credit": "Public Domain Illustration"
      },
      {
        "imageKeyword": "Jain meditation statue",
        "caption": "耆那教冥想像",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "th-buddha",
        "title": "释迦牟尼",
        "reason": "同期创立佛教"
      },
      {
        "id": "rel-hinduism",
        "title": "印度教",
        "reason": "印度本土宗教"
      },
      {
        "id": "th-gandhi",
        "title": "甘地",
        "reason": "受耆那教非暴力影响"
      },
      {
        "id": "rel-sikhism",
        "title": "锡克教",
        "reason": "同期印度教派"
      }
    ],
    "source": "《耆那教经典》·《耆那教史》（赫尔加·冯·罗森塔尔）"
  },
  {
    "id": "rel-bahai",
    "name": "巴哈伊信仰",
    "westernName": "Bahá'í Faith",
    "category": "亚伯拉罕一神教",
    "era": "AD 19世纪 至今",
    "region": "波斯（起源）→ 全球",
    "founder": "巴哈欧拉",
    "summary": "世界最新的一神教，信徒约 500 万。强调「上帝唯一」「宗教同源」「人类一家」。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 500 万**"
      },
      {
        "label": "起源",
        "value": "**19 世纪波斯**"
      },
      {
        "label": "创始人",
        "value": "**巴哈欧拉（1817—1892）**"
      },
      {
        "label": "核心经典",
        "value": "**《亚格达斯经》《伊甘经》**"
      },
      {
        "label": "核心教义",
        "value": "**上帝唯一 · 宗教同源 · 人类一家**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "巴哈伊信仰：所有宗教是同一上帝",
        "body": "巴哈伊信仰由巴哈欧拉（Baha'u'llah，1817—1892）创立。1844 年，巴布（Bab，1819—1850）在波斯宣称新先知到来，预言「将有大显现者」。1853 年巴哈欧拉宣称自己是「上帝之显现者」。他被波斯政府流放，最终死在巴勒斯坦的阿卡。巴哈伊信仰强调：① 上帝是唯一的，所有宗教都来自同一神；② 所有宗教本质相同；③ 人类是一家，不分种族、民族、宗教；④ 男女平等；⑤ 和平与团结。"
      },
      {
        "type": "callout",
        "heading": "巴哈伊三大核心原则",
        "body": "① 上帝唯一（Baha'u'llah = 神的光）；② 宗教同源（犹太教、基督教、伊斯兰教、佛教、印度教都是同一上帝的显现）；③ 人类一家（不分民族、种族、宗教）。巴哈伊没有神职人员，没有牧师，没有固定礼拜仪式。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**地球乃一国，人类皆其民**。",
        "cite": "巴哈欧拉"
      },
      {
        "type": "quote",
        "text": "**宗教真理的根基是唯一的**。",
        "cite": "巴哈欧拉"
      },
      {
        "type": "list",
        "heading": "巴哈伊主要特征",
        "items": [
          "每日祈祷 + 读经",
          "禁酒禁烟",
          "一年 19 天大斋戒",
          "禁止政治参与",
          "男女平等",
          "无神职人员"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1817",
        "era": "波斯",
        "event": "巴哈欧拉诞生"
      },
      {
        "year": "AD 1819",
        "era": "波斯",
        "event": "巴布诞生"
      },
      {
        "year": "AD 1844",
        "era": "波斯",
        "event": "巴布宣告新先知"
      },
      {
        "year": "AD 1850",
        "era": "波斯",
        "event": "巴布被处决"
      },
      {
        "year": "AD 1853",
        "era": "波斯",
        "event": "巴哈欧拉宣告显现"
      },
      {
        "year": "AD 1863",
        "era": "巴格达",
        "event": "巴哈欧拉宣告使命"
      },
      {
        "year": "AD 1892",
        "era": "巴勒斯坦",
        "event": "巴哈欧拉去世"
      },
      {
        "year": "AD 1921",
        "era": "海法",
        "event": "阿卜杜·巴哈确立教义"
      },
      {
        "year": "AD 1963",
        "era": "全球",
        "event": "世界正义院成立"
      },
      {
        "year": "AD 2023",
        "era": "现代",
        "event": "全球 500 万信徒"
      }
    ],
    "images": [
      {
        "imageKeyword": "Bahji Shrine Acre Baha'i",
        "caption": "巴哈欧拉陵墓——阿卡",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Bahai House of Worship Lotus Temple",
        "caption": "莲花寺——新德里",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Bahaullah founder Bahai",
        "caption": "巴哈欧拉——创始人",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Bab shrine Haifa",
        "caption": "巴布陵墓——海法",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-islam",
        "title": "伊斯兰教",
        "reason": "源自什叶派"
      },
      {
        "id": "rel-christianity",
        "title": "基督教",
        "reason": "宗教同源"
      },
      {
        "id": "rel-judaism",
        "title": "犹太教",
        "reason": "宗教同源"
      },
      {
        "id": "rel-buddhism",
        "title": "佛教",
        "reason": "宗教同源"
      }
    ],
    "source": "《亚格达斯经》·《伊甘经》·《巴哈欧拉的呼召》"
  }
]

export const RELIGION_CATEGORIES = [
  { id: 'abrahamic', label: '亚伯拉罕一神教', color: '#5b9bc8' },
  { id: 'indian', label: '印度本土宗教', color: '#b85450' },
  { id: 'chinese', label: '中国本土宗教', color: '#c89a5b' },
  { id: 'east-asian', label: '东亚宗教', color: '#d4a85b' },
  { id: 'emerging', label: '新兴宗教', color: '#9b7eb6' },
] as const

export type ReligionCategory = typeof RELIGION_CATEGORIES[number]['id']
