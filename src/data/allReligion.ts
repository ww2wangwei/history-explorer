/**
 * allReligion.ts — 全宗教数据
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
  },
  {
    "id": "rel-zoroastrianism",
    "name": "琐罗亚斯德教",
    "westernName": "Zoroastrianism",
    "category": "古波斯宗教",
    "era": "约 BC 1500 至今",
    "region": "波斯",
    "founder": "琐罗亚斯德（传说）",
    "summary": "最古老的一神教之一，影响了犹太教、基督教和伊斯兰教。核心：善神阿胡拉·马兹达 vs 恶神安格拉·曼纽，光明战胜黑暗。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 10-20 万（全球，主要是帕西人）**"
      },
      {
        "label": "起源",
        "value": "**约 BC 1500 波斯**"
      },
      {
        "label": "创始人",
        "value": "**琐罗亚斯德**"
      },
      {
        "label": "核心经典",
        "value": "**《阿维斯塔》**"
      },
      {
        "label": "核心教义",
        "value": "**善恶二元论 · 光明战胜黑暗**"
      },
      {
        "label": "影响",
        "value": "**影响犹太教/基督教/伊斯兰教**"
      },
      {
        "label": "其他名称",
        "value": "**拜火教（中国俗称）/ 琐罗亚斯德教 / 祆教（中文古称）**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "波斯帝国的国教",
        "body": "琐罗亚斯德教由先知琐罗亚斯德（Zoroaster，约 BC 1500—1000）在波斯创立。教义核心是善神阿胡拉·马兹达（Ahura Mazda，智慧之主）vs 恶神安格拉·曼纽（Angra Mainyu）——光明与黑暗的二元论。人类在善恶之战中要站在光明一边。BC 6 世纪，阿契美尼德帝国（大流士一世）将琐罗亚斯德教定为国教。3-7 世纪萨珊波斯时期，琐罗亚斯德教仍是主流。公元 8 世纪后，阿拉伯人征服波斯，琐罗亚斯德教被伊斯兰教取代。"
      },
      {
        "type": "callout",
        "heading": "琐罗亚斯德教的影响",
        "body": "琐罗亚斯德教对后世宗教影响巨大：① 善恶二元论——影响了基督教的天使/恶魔、伊斯兰教的吉哈德概念；② 天启观念——神向先知（琐罗亚斯德）启示真理；③ 末日审判——世界末日时善战胜恶，死者复活；④ 影响波斯的文学艺术——菲尔多西《列王纪》；⑤ 帕西人在印度保存了琐罗亚斯德教。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**善思、善言、善行**——琐罗亚斯德教三大原则。",
        "cite": "《阿维斯塔》"
      },
      {
        "type": "quote",
        "text": "**最终，光明将战胜黑暗**。",
        "cite": "琐罗亚斯德教"
      },
      {
        "type": "list",
        "heading": "琐罗亚斯德教核心教义",
        "items": [
          "善神阿胡拉·马兹达",
          "恶神安格拉·曼纽",
          "善思/善言/善行",
          "末日审判",
          "天界/地狱"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 1500",
        "era": "波斯",
        "event": "琐罗亚斯德传说"
      },
      {
        "year": "BC 6 世纪",
        "era": "阿契美尼德",
        "event": "**琐罗亚斯德教成为国教**"
      },
      {
        "year": "BC 330",
        "era": "亚历山大大帝",
        "event": "波斯帝国灭亡"
      },
      {
        "year": "AD 224",
        "era": "萨珊波斯",
        "event": "琐罗亚斯德教复兴"
      },
      {
        "year": "AD 651",
        "era": "阿拉伯征服",
        "event": "伊斯兰教取代琐罗亚斯德教"
      },
      {
        "year": "AD 8 世纪",
        "era": "帕西人",
        "event": "帕西人迁往印度保存信仰"
      }
    ],
    "images": [
      {
        "imageKeyword": "Persepolis ancient Persia Achaemenid",
        "caption": "波斯波利斯",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Faravahar Zoroastrian symbol",
        "caption": "法拉瓦尔（琐罗亚斯德符号）",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Zoroastrian fire temple Iran",
        "caption": "琐罗亚斯德圣火庙",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-islam",
        "title": "伊斯兰教",
        "reason": "取代琐罗亚斯德教"
      },
      {
        "id": "rel-judaism",
        "title": "犹太教",
        "reason": "受琐罗亚斯德教影响"
      },
      {
        "id": "rel-christianity",
        "title": "基督教",
        "reason": "受琐罗亚斯德教影响"
      },
      {
        "id": "rel-islam",
        "title": "伊斯兰教",
        "reason": "取代了波斯琐罗亚斯德教"
      }
    ],
    "source": "《阿维斯塔》·《帕西人》（帕尔坦·达尔拉 2005）"
  },
  {
    "id": "rel-shinto",
    "name": "神道教",
    "westernName": "Shinto",
    "category": "东亚宗教",
    "era": "约 BC 500 至今",
    "region": "日本",
    "summary": "日本本土宗教，已有 2000 多年历史。核心：万物有灵（800 万神）、自然崇拜、祖先崇拜。神道与佛教共同构成日本精神双翼。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 1 亿（日本人多自称）**"
      },
      {
        "label": "起源",
        "value": "**约 BC 500 日本**"
      },
      {
        "label": "创始人",
        "value": "**无（自然产生的本土宗教）**"
      },
      {
        "label": "核心经典",
        "value": "**《古事记》《日本书纪》**"
      },
      {
        "label": "核心教义",
        "value": "**万物有灵 · 自然崇拜 · 祖先崇拜**"
      },
      {
        "label": "影响",
        "value": "**日本文化、动漫、礼仪**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "神道——日本之道",
        "body": "神道教（神道 = 神之道）起源于日本古代绳文时代，与稻作文化一起诞生。公元前 6 世纪起逐渐体系化。核心是万物有灵——山河草木皆有神灵（800 万神）。天照大神（太阳女神）是皇室的祖先。神道没有创始人，没有经典，没有教义系统，是自然产生的本土宗教。明治维新（1868）后，神道成为日本国家神道，战后被废除。"
      },
      {
        "type": "callout",
        "heading": "神道核心信仰",
        "body": "① 800 万神（八百万神）——山、川、树、雷、风都有神；② 天照大神——太阳女神、皇室祖先；③ 自然崇拜——富士山、御岳；④ 祖先崇拜——敬奉去世的亲人；⑤ 鸟居与神社——神道圣地的标志；⑥ 神道与佛教融合——日本多数人同时信神道和佛教（神佛习合）。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**敬畏自然，因为自然有神**——神道核心。",
        "cite": "神道格言"
      },
      {
        "type": "list",
        "heading": "神道要素",
        "items": [
          "800 万神",
          "天照大神",
          "鸟居",
          "神社",
          "自然崇拜",
          "祖先崇拜"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 500",
        "era": "绳文/弥生",
        "event": "神道雏形"
      },
      {
        "year": "AD 6 世纪",
        "era": "佛教传入",
        "event": "神佛习合开始"
      },
      {
        "year": "AD 710",
        "era": "奈良",
        "event": "伊势神宫建立"
      },
      {
        "year": "AD 1868",
        "era": "明治维新",
        "event": "**国家神道建立**"
      },
      {
        "year": "AD 1945",
        "era": "战后",
        "event": "国家神道废除"
      },
      {
        "year": "AD 2023",
        "era": "现代",
        "event": "神道仍是日本主流宗教之一"
      }
    ],
    "images": [
      {
        "imageKeyword": "Torii gate Itsukushima Shrine Japan",
        "caption": "严岛神社大鸟居",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Mount Fuji Japan sacred",
        "caption": "富士山——神道圣山",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Ise Jingu shrine Japan",
        "caption": "伊势神宫——天照大神",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Shinto purification washing",
        "caption": "神道祓禊",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-buddhism",
        "title": "佛教",
        "reason": "神佛习合"
      },
      {
        "id": "rel-hinduism",
        "title": "印度教",
        "reason": "亚洲宗教"
      },
      {
        "id": "th-xuanzang",
        "title": "玄奘",
        "reason": "唐代高僧"
      }
    ],
    "source": "《古事记》·《日本书纪》·《神道史》（山泰幸）"
  },
  {
    "id": "rel-theosophy",
    "name": "神智学",
    "westernName": "Theosophy",
    "category": "新兴宗教",
    "era": "AD 1875",
    "region": "美国 / 印度",
    "founder": "海伦娜·布拉瓦茨基",
    "summary": "1875 年由海伦娜·布拉瓦茨基创立的新兴宗教运动，综合东西方神秘主义，影响了新纪元运动和某些佛教、瑜伽传统。",
    "facts": [
      {
        "label": "起源",
        "value": "**AD 1875 美国纽约**"
      },
      {
        "label": "创始人",
        "value": "**海伦娜·布拉瓦茨基（1831—1891）**"
      },
      {
        "label": "核心理念",
        "value": "**普世宗教 · 古代智慧 · 通神论**"
      },
      {
        "label": "影响",
        "value": "**新纪元运动 / 瑜伽西传 / 印度教复兴**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "神智学：古代智慧的复兴",
        "body": "1875 年 11 月 17 日，俄国贵族海伦娜·布拉瓦茨基（Helena Blavatsky）和亨利·奥尔科特在纽约创立神智学会（Theosophical Society）。神智学融合了佛教、印度教、基督教、卡巴拉神秘主义、希腊密教思想，认为：① 所有宗教都有同一个真理；② 存在一个古代的智慧传统（Ancient Wisdom）；③ 通神（theosophia = god-wisdom）是人类可以达到的最高境界。"
      },
      {
        "type": "callout",
        "heading": "神智学的影响",
        "body": "神智学对后世影响巨大：① 印度教复兴——通过神智会，印度教、佛教的经典传入西方；② 瑜伽西传——克里希那穆提等瑜伽大师赴美；③ 新纪元运动——20 世纪 60 年代新纪元运动直接受神智学影响；④ 独立印度——神智会的 Annie Besant 支持印度独立；⑤ 通灵会、神智社、Anthroposophy（人智学，Rudolf Steiner 创立）等。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**所有宗教都是同一真理的不同表达**——神智学核心信念。",
        "cite": "海伦娜·布拉瓦茨基"
      },
      {
        "type": "list",
        "heading": "神智学的影响",
        "items": [
          "印度教复兴",
          "瑜伽西传",
          "新纪元运动",
          "神智会",
          "通灵会"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1831",
        "era": "俄国",
        "event": "海伦娜·布拉瓦茨基诞生"
      },
      {
        "year": "AD 1875",
        "era": "纽约",
        "event": "**神智学会成立**"
      },
      {
        "year": "AD 1882",
        "era": "印度",
        "event": "神智会总部迁至印度阿迪亚尔"
      },
      {
        "year": "AD 1907",
        "era": "印度",
        "event": "安妮·贝赞特任神智会主席"
      },
      {
        "year": "AD 1907",
        "era": "印度",
        "event": "克里希那穆提被挖掘"
      },
      {
        "year": "AD 1947",
        "era": "印度",
        "event": "印度独立——神智会支持"
      },
      {
        "year": "AD 2023",
        "era": "全球",
        "event": "神智学会仍有全球分会"
      }
    ],
    "images": [
      {
        "imageKeyword": "Blavatsky Theosophical Society",
        "caption": "布拉瓦茨基与神智学会",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Theosophical Society Adyar India",
        "caption": "神智学会阿迪亚尔总部",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Krishnamurti Theosophy",
        "caption": "克里希那穆提",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-hinduism",
        "title": "印度教",
        "reason": "影响复兴"
      },
      {
        "id": "rel-buddhism",
        "title": "佛教",
        "reason": "影响西传"
      },
      {
        "id": "th-blavatsky",
        "title": "海伦娜",
        "reason": "创始人"
      }
    ],
    "source": "《揭开启示》（布拉瓦茨基 1888）·《神智学史》（安东尼娅·布里福德）"
  },
  {
    "id": "rel-manichaeism",
    "name": "摩尼教",
    "westernName": "Manichaeism",
    "category": "古代宗教",
    "era": "AD 3-15世纪",
    "region": "波斯（起源）→ 亚欧非",
    "founder": "摩尼",
    "summary": "3 世纪由摩尼在波斯创立的二元宗教，综合基督教、琐罗亚斯德教、佛教思想。曾在亚欧非广泛传播，13 世纪后式微。",
    "facts": [
      {
        "label": "起源",
        "value": "**AD 3 世纪波斯**"
      },
      {
        "label": "创始人",
        "value": "**摩尼（216—277）**"
      },
      {
        "label": "核心经典",
        "value": "**《沙卜拉干》**"
      },
      {
        "label": "核心教义",
        "value": "**善恶二元论 · 光明与黑暗**"
      },
      {
        "label": "历史",
        "value": "**曾传遍亚欧非**"
      },
      {
        "label": "衰落",
        "value": "**13-14 世纪被伊斯兰教取代**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "摩尼的光明与黑暗之战",
        "body": "摩尼教由摩尼（Mani，216—277）于 3 世纪在波斯创立。摩尼教是综合性的宗教：① 采纳琐罗亚斯德教的善恶二元论（光明之神 vs 黑暗之神）；② 采纳基督教的耶稣、末世论；③ 采纳佛教的禁欲、轮回。核心是宇宙的善恶之战——光明与黑暗之子的解放。摩尼教曾传遍波斯、罗马帝国、中国唐朝（回鹘）。13 世纪后被伊斯兰教取代。"
      },
      {
        "type": "callout",
        "heading": "摩尼教的世界影响",
        "body": "摩尼教虽然衰落，但其影响深远：① 影响了基督教的诺斯底派；② 影响了中亚的景教、回鹘摩尼教；③ 在中国唐朝，回鹘汗国信仰摩尼教（明教），《倚天屠龙记》提及的明教就是摩尼教；④ 影响了一些中世纪异端；⑤ 启发了一些神秘主义传统。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**光明之子被囚禁在物质中——人类的使命是解放光明**。",
        "cite": "摩尼教"
      },
      {
        "type": "list",
        "heading": "摩尼教的核心",
        "items": [
          "善恶二元论",
          "光明之神 vs 黑暗之神",
          "世界三大宗教的融合",
          "禁欲主义",
          "末日审判"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 216",
        "era": "波斯",
        "event": "摩尼诞生"
      },
      {
        "year": "AD 240",
        "era": "波斯",
        "event": "**摩尼创立摩尼教**"
      },
      {
        "year": "AD 277",
        "era": "波斯",
        "event": "**摩尼被萨珊国王处死**"
      },
      {
        "year": "AD 5 世纪",
        "era": "中亚",
        "event": "摩尼教传播到中亚"
      },
      {
        "year": "AD 8 世纪",
        "era": "唐朝",
        "event": "**摩尼教传入中国（明教）**"
      },
      {
        "year": "AD 840",
        "era": "回鹘",
        "event": "回鹘汗国信仰摩尼教"
      },
      {
        "year": "AD 13-14 世纪",
        "era": "蒙古",
        "event": "摩尼教衰落"
      }
    ],
    "images": [
      {
        "imageKeyword": "Mani prophet founder",
        "caption": "摩尼——摩尼教创始人",
        "credit": "Public Domain Illustration"
      },
      {
        "imageKeyword": "Manichaean art illumination",
        "caption": "摩尼教细密画",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Uighur Manichaean scripture",
        "caption": "回鹘摩尼教文献",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-zoroastrianism",
        "title": "琐罗亚斯德教",
        "reason": "受其影响"
      },
      {
        "id": "rel-christianity",
        "title": "基督教",
        "reason": "受其影响"
      },
      {
        "id": "rel-buddhism",
        "title": "佛教",
        "reason": "受其影响"
      }
    ],
    "source": "《摩尼教》（克里斯托弗·特雷弗·林赛 2007）"
  },
  {
    "id": "rel-norse",
    "name": "北欧神话 / 异教",
    "westernName": "Norse Heathenry",
    "category": "古代宗教",
    "era": "约 BC 2000-AD 1100（古典）/ 1970s 复兴",
    "region": "北欧 / 冰岛",
    "summary": "北欧维京人、日耳曼人原始宗教。崇拜奥丁、托尔、雷神等神族。世界树 Yggdrasil 连接九界，末日预言 Ragnarök。",
    "facts": [
      {
        "label": "信徒（古典）",
        "value": "**整个北欧/日耳曼民族**"
      },
      {
        "label": "信徒（现代复兴）",
        "value": "**约 1-3 万**"
      },
      {
        "label": "起源",
        "value": "**约 BC 2000 日耳曼**"
      },
      {
        "label": "核心经典",
        "value": "**《埃达》《萨迦》**"
      },
      {
        "label": "核心教义",
        "value": "**命运 · 荣耀 · 末日 Ragnarök**"
      },
      {
        "label": "复兴",
        "value": "**1970s 冰岛、新世纪异教运动**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "维京人的诸神黄昏",
        "body": "北欧神话是在北欧（挪威、瑞典、丹麦、冰岛）和日耳曼地区流传的异教信仰，公元前 2000 年到公元 1100 年（维京时代结束）。核心是诸神族——阿萨神族（主神奥丁 Thor、Frigg、Balder 等）和华纳神族（Freyr、Freyja、Njord）。世界树 Yggdrasil 连接 9 个世界（Asgard、Midgard、Hel、Jotunheim 等）。最戏剧性的是诸神黄昏（Ragnarök）——诸神与巨人最终之战，世界毁灭，重生。公元 8-11 世纪北欧基督教化，异教受迫害。"
      },
      {
        "type": "callout",
        "heading": "北欧神话的影响",
        "body": "北欧神话对现代文化影响巨大：① 星期三（Wednesday）= Woden's day = 奥丁之日；② 星期五（Friday）= Freyja's day = 爱神之日；③ 托尔（雷神）→ Marvel 雷神；④ 洛基（诡计之神）→ 反派神；⑤ 维京人传奇 → 《指环王》托尔金。1970s 起，新异教运动（Ásatrú）在冰岛和全球复兴。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**诸神黄昏之后，世界将重生**。",
        "cite": "北欧神话"
      },
      {
        "type": "list",
        "heading": "北欧神族",
        "items": [
          "阿萨神族（奥丁、托尔、洛基）",
          "华纳神族（弗雷、芙蕾雅）",
          "巨人族（耶梦加得、米德加尔德）",
          "世界树 Yggdrasil",
          "诸神黄昏 Ragnarök"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 2000",
        "era": "日耳曼",
        "event": "日耳曼异教起源"
      },
      {
        "year": "AD 793",
        "era": "维京时代",
        "event": "维京人袭击林迪斯法恩"
      },
      {
        "year": "AD 986",
        "era": "冰岛",
        "event": "冰岛议会接受基督教"
      },
      {
        "year": "AD 1000",
        "era": "冰岛",
        "event": "冰岛正式基督教化"
      },
      {
        "year": "AD 1100",
        "era": "北欧",
        "event": "维京时代结束"
      },
      {
        "year": "AD 1972",
        "era": "冰岛",
        "event": "**Ásatrúarfélagið 成立（北欧异教复兴）**"
      },
      {
        "year": "AD 2023",
        "era": "全球",
        "event": "全球 1-3 万信徒"
      }
    ],
    "images": [
      {
        "imageKeyword": "Odin Norse god Allfather",
        "caption": "奥丁——阿萨神族之主",
        "credit": "Public Domain Illustration"
      },
      {
        "imageKeyword": "Thor hammer Mjolnir Norse",
        "caption": "托尔与雷神之锤",
        "credit": "Public Domain Illustration"
      },
      {
        "imageKeyword": "Yggdrasil Norse mythology world tree",
        "caption": "世界树 Yggdrasil",
        "credit": "Public Domain Illustration"
      },
      {
        "imageKeyword": "Viking ship Norse art",
        "caption": "维京船",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-judaism",
        "title": "犹太教",
        "reason": "基督教对比"
      },
      {
        "id": "rel-christianity",
        "title": "基督教",
        "reason": "取代北欧异教"
      },
      {
        "id": "rel-islam",
        "title": "伊斯兰教",
        "reason": "一神教对比"
      }
    ],
    "source": "《埃达》（诗体埃达、散文埃达）·《萨迦》（冰岛）·《北欧神话》（茅盾）"
  },
  {
    "id": "rel-rome",
    "name": "罗马多神教",
    "westernName": "Roman Polytheism",
    "category": "古代宗教",
    "era": "约 BC 753-AD 476",
    "region": "罗马",
    "summary": "古罗马国家宗教，崇拜朱庇特（天神）、朱诺（天后）、密涅瓦（智慧）等。公元 392 年被基督教罗马皇帝狄奥多西一世禁止。",
    "facts": [
      {
        "label": "时期",
        "value": "**BC 753-AD 476（罗马城邦→帝国）**"
      },
      {
        "label": "核心神祇",
        "value": "**朱庇特/朱诺/密涅瓦/玛尔斯/维纳斯**"
      },
      {
        "label": "核心经典",
        "value": "**无固定经典，依赖口传传统**"
      },
      {
        "label": "核心教义",
        "value": "**Pax Romana · 宗教与国家合一**"
      },
      {
        "label": "衰落",
        "value": "**AD 392 被狄奥多西一世禁止**"
      },
      {
        "label": "影响",
        "value": "**现代法律的源头 + 拉丁语**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "罗马众神的兴衰",
        "body": "罗马多神教起源于罗马城邦（传说 BC 753 年由罗慕路斯建立）。它有繁杂的神祇体系：① 12 主神（Dii Consentes）——朱庇特（Jupiter，天神）、朱诺（天后）、密涅瓦（智慧）、玛尔斯（战争）、维纳斯（爱）、阿波罗（光明）、狄安娜（月亮）、墨丘利（商业）、伏尔甘（火）、谷神刻瑞斯、海神尼普顿、维斯塔（灶火）；② 数百位次要神祇——每个家庭、行业都有保护神；③ 重视祭祀和占卜。共和国和帝国时期，多神教是国教，与国家权力紧密相连。"
      },
      {
        "type": "callout",
        "heading": "罗马多神教的衰落",
        "body": "罗马多神教衰落过程：① BC 6-2 世纪——希腊文化传入，罗马人接纳希腊神祇；② AD 30-300——基督教在罗马帝国传播；③ AD 313——《米兰敕令》——君士坦丁使基督教合法；④ AD 380——《狄奥多西敕令》——基督教成为国教；⑤ AD 392——狄奥多西一世禁止异教祭祀，多神教结束。200 年内，多神教从国教到非法。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**Pax Romana（罗马和平）——多神教时代的最高成就**。",
        "cite": "罗马史"
      },
      {
        "type": "list",
        "heading": "罗马多神教要素",
        "items": [
          "12 主神",
          "祭祀与占卜",
          "占卜官（Augurs）",
          "宗教与国家合一",
          "家庭神（家神、祖先）"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 753",
        "era": "罗马传说",
        "event": "罗马城建立"
      },
      {
        "year": "BC 509",
        "era": "罗马共和国",
        "event": "共和国建立"
      },
      {
        "year": "BC 27",
        "era": "罗马帝国",
        "event": "奥古斯都建立帝制"
      },
      {
        "year": "AD 117",
        "era": "罗马帝国",
        "event": "图拉真帝国巅峰"
      },
      {
        "year": "AD 313",
        "era": "君士坦丁",
        "event": "**《米兰敕令》——基督教合法**"
      },
      {
        "year": "AD 380",
        "era": "狄奥多西",
        "event": "**基督教成为国教**"
      },
      {
        "year": "AD 392",
        "era": "狄奥多西",
        "event": "**禁止异教祭祀**"
      },
      {
        "year": "AD 476",
        "era": "西罗马帝国",
        "event": "西罗马帝国灭亡"
      }
    ],
    "images": [
      {
        "imageKeyword": "Pantheon Rome ancient temple",
        "caption": "万神殿——罗马",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Jupiter Roman god statue",
        "caption": "朱庇特雕像",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Roman Forum ancient",
        "caption": "罗马广场",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-christianity",
        "title": "基督教",
        "reason": "取代罗马多神教"
      },
      {
        "id": "rel-norse",
        "title": "北欧神话",
        "reason": "古代欧洲宗教"
      },
      {
        "id": "th-augustine",
        "title": "奥古斯丁",
        "reason": "基督教神学家"
      }
    ],
    "source": "《罗马宗教史》（玛丽·比尔）·《罗马帝国衰亡史》（吉本）"
  },
  {
    "id": "rel-kejawen",
    "name": "爪哇文化 / 印度尼西亚传统信仰",
    "westernName": "Javanism / Indonesian Folk Religion",
    "category": "东亚宗教",
    "era": "约 BC 500 至今",
    "region": "印度尼西亚",
    "summary": "印度尼西亚本土宗教——爪哇文化综合印度教、佛教、伊斯兰教与本土精灵崇拜。目前约 10% 印尼人仍主要信奉。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 2500 万**"
      },
      {
        "label": "起源",
        "value": "**约 BC 500 印度尼西亚**"
      },
      {
        "label": "核心理念",
        "value": "**和谐 · 神秘主义 · 与自然合一**"
      },
      {
        "label": "影响",
        "value": "**印尼传统艺术与文化**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "爪哇文化的和谐观",
        "body": "印度尼西亚是一个多宗教国家（约 87% 伊斯兰教、10% 基督教、3% 印度教、1% 佛教），但有约 2500 万印尼人仍主要信奉本土传统——爪哇文化（Javanism）和巽他传统（Sundanese）。爪哇文化综合了：① 印度教（湿婆、毗湿奴崇拜）；② 佛教（密宗）；③ 本土精灵崇拜；④ 后受伊斯兰教神秘主义（Sufism）影响。核心是「和谐」（rukun）——与自然、社会、上帝保持平衡。"
      },
      {
        "type": "callout",
        "heading": "爪哇文化的特点",
        "body": "爪哇文化特点：① 与自然和谐——山、河、树都有神；② 神秘主义——内观、自省；③ 艺术与文化——皮影戏、蜡染、舞蹈；④ 爪哇历法（28 天周）；⑤ 与伊斯兰教融合——许多印尼穆斯林同时也举行本土仪式。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**和谐是爪哇最高的价值观**——Rukun。",
        "cite": "爪哇格言"
      },
      {
        "type": "list",
        "heading": "爪哇文化的要素",
        "items": [
          "与自然和谐",
          "神秘主义",
          "印度教/佛教/伊斯兰融合",
          "皮影戏",
          "蜡染艺术"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 500",
        "era": "印尼",
        "event": "印尼原始信仰"
      },
      {
        "year": "BC 4 世纪",
        "era": "印尼",
        "event": "**印度文化传入**"
      },
      {
        "year": "AD 7 世纪",
        "era": "印尼",
        "event": "印度教国家兴盛"
      },
      {
        "year": "AD 8 世纪",
        "era": "印尼",
        "event": "**佛教婆罗浮屠建成**"
      },
      {
        "year": "AD 13-15 世纪",
        "era": "印尼",
        "event": "伊斯兰教传入"
      },
      {
        "year": "AD 16-17 世纪",
        "era": "印尼",
        "event": "荷兰殖民"
      },
      {
        "year": "AD 1945",
        "era": "印尼",
        "event": "印尼独立"
      }
    ],
    "images": [
      {
        "imageKeyword": "Borobudur temple Java Buddhist",
        "caption": "婆罗浮屠——佛教",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Prambanan temple Hindu Java",
        "caption": "普兰巴南——印度教",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Wayang Kulit Javanese shadow puppet",
        "caption": "爪哇皮影戏",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-hinduism",
        "title": "印度教",
        "reason": "印尼印度教国家"
      },
      {
        "id": "rel-buddhism",
        "title": "佛教",
        "reason": "印尼佛教文化"
      },
      {
        "id": "rel-islam",
        "title": "伊斯兰教",
        "reason": "印尼主要宗教"
      }
    ],
    "source": "《爪哇文化》（罗伯特·厄尔）·《印尼传统宗教》（罗比·博库伊）"
  },
  {
    "id": "rel-soka",
    "name": "创价学会",
    "westernName": "Soka Gakkai International",
    "category": "东亚宗教",
    "era": "AD 1930",
    "region": "日本",
    "founder": "牧口常三郎 / 户田城圣",
    "summary": "1930 年日本创立的佛教新兴运动，强调「人间革命」（个人转变）。全球信徒约 1100 万。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 1100 万**"
      },
      {
        "label": "起源",
        "value": "**AD 1930 日本**"
      },
      {
        "label": "创始人",
        "value": "**牧口常三郎 / 户田城圣**"
      },
      {
        "label": "经典",
        "value": "**日莲大圣人御书集**"
      },
      {
        "label": "教义",
        "value": "**人间革命 · 南无妙法莲华经**"
      },
      {
        "label": "影响",
        "value": "**池田大作对话文化 · 世界和平运动**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "创价学会——人间革命",
        "body": "创价学会（Soka Gakkai = 「创造价值」学会）由日本教育家牧口常三郎和户田城圣于 1930 年创立。它是日莲正宗佛教的一个分支，强调：① 唱念「南无妙法莲华经」可以获得内在的幸福；② 「人间革命」（个人转变）是社会变革的前提；③ 通过对话和交流促进和平。第三任会长池田大作（1928—2023）与多国领导人对话（与汤因比对话等），推动世界和平。全球约 1100 万信徒。"
      },
      {
        "type": "callout",
        "heading": "创价学会的特点",
        "body": "创价学会特点：① 强调个人转变（人间革命）；② 唱念题目（Nam-myoho-renge-kyo）；③ 积极参与社会（环保、教育、文化）；④ 池田对话——与汤因比、罗素等对话；⑤ SGI（创价学会国际）有 192 个国家/地区的分会；⑥ 创办创价大学、东京富士美术馆。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**人间的变革——是一切变革的起点**。",
        "cite": "池田大作"
      },
      {
        "type": "list",
        "heading": "创价学会核心",
        "items": [
          "人间革命",
          "唱念题目",
          "和平对话",
          "创价教育",
          "全球网络"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1930",
        "era": "日本",
        "event": "**创价学会成立**"
      },
      {
        "year": "AD 1943",
        "era": "二战",
        "event": "牧口、户田因反战入狱"
      },
      {
        "year": "AD 1945",
        "era": "战后",
        "event": "户田重建创价学会"
      },
      {
        "year": "AD 1960",
        "era": "日本",
        "event": "池田大作任会长"
      },
      {
        "year": "AD 1975",
        "era": "全球",
        "event": "**SGI 国际成立**"
      },
      {
        "year": "AD 1995",
        "era": "日本",
        "event": "**池田与汤因比对话出版**"
      },
      {
        "year": "AD 2023",
        "era": "全球",
        "event": "全球 1100 万信徒"
      }
    ],
    "images": [
      {
        "imageKeyword": "Soka Gakkai headquarters Tokyo",
        "caption": "创价学会东京总部",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Ikeda Daisaku Soka Gakkai",
        "caption": "池田大作",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Soka University Japan",
        "caption": "创价大学",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-buddhism",
        "title": "佛教",
        "reason": "日莲系佛教分支"
      },
      {
        "id": "th-toynbee",
        "title": "汤因比",
        "reason": "池田对话"
      },
      {
        "id": "rel-shinto",
        "title": "神道教",
        "reason": "日本本土宗教"
      }
    ],
    "source": "《创价学会》（池田大作）·《对话的文明》（池田/汤因比）"
  },
  {
    "id": "rel-fsm",
    "name": "飞天意面神教",
    "westernName": "Church of the Flying Spaghetti Monster",
    "category": "戏谑宗教",
    "era": "AD 2005",
    "region": "美国",
    "founder": "博比·亨德森",
    "summary": "2005 年由博比·亨德森创立的戏谑宗教，用来讽刺美国智能设计论教学争议。它有自己的「圣典」（《The Gospel of the Flying Spaghetti Monster》）和「节日」（海盗节）。",
    "facts": [
      {
        "label": "信徒",
        "value": "**不确定（戏谑宗教）**"
      },
      {
        "label": "起源",
        "value": "**AD 2005 美国**"
      },
      {
        "label": "创始人",
        "value": "**博比·亨德森**"
      },
      {
        "label": "核心经典",
        "value": "**《Flying Spaghetti Monster 的福音》**"
      },
      {
        "label": "核心教义",
        "value": "**戏谑反对智能设计论 · 政教分离**"
      },
      {
        "label": "影响",
        "value": "**全球反宗教干涉运动**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "为什么我们需要飞天意面神",
        "body": "2005 年，美国俄勒冈大学物理学家博比·亨德森写了一封公开信，抗议美国堪萨斯州教育委员会允许在公立学校教授智能设计论。他在信中声称：世界是由「飞天意面神」（Flying Spaghetti Monster）创造的——这个神在喝酒后创造了世界。所有进化证据都是「故意放置的」以测试我们的信仰。信徒应在星期五穿海盗装（海盗是最早的传教士）。这封信成为 21 世纪初反宗教干涉运动的标志。"
      },
      {
        "type": "callout",
        "heading": "飞天意面神教的真正意义",
        "body": "飞天意面神教是戏谑宗教，但有严肃内核：① 反对宗教干涉教育——支持政教分离；② 反对「以科学之名行宗教之实」——智能设计论是伪装成科学的宗教；③ 推广理性思维；④ 反映世俗化趋势；⑤ 在荷兰、欧洲多个国家正式注册为合法宗教。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**你完全可以在没有依据的情况下相信任何事，包括飞天意面神**——前提是别把它强加给公立学校的孩子。",
        "cite": "博比·亨德森 2005"
      },
      {
        "type": "list",
        "heading": "飞天意面神教要素",
        "items": [
          "戏谑宗教",
          "海盗装",
          "星期五（海盗节）",
          "反对智能设计论",
          "政教分离"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 2005",
        "era": "美国",
        "event": "**飞天意面神教创立**"
      },
      {
        "year": "AD 2006",
        "era": "全球",
        "event": "《Flying Spaghetti Monster 的福音》出版"
      },
      {
        "year": "AD 2014",
        "era": "美国",
        "event": "多个国家正式注册为合法宗教"
      },
      {
        "year": "AD 2023",
        "era": "全球",
        "event": "全球数十万信徒（松散）"
      }
    ],
    "images": [
      {
        "imageKeyword": "Flying Spaghetti Monster",
        "caption": "飞天意面神",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Pirate Pastafarian",
        "caption": "海盗面纱信徒",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-christianity",
        "title": "基督教",
        "reason": "美国主要宗教"
      },
      {
        "id": "th-hume",
        "title": "休谟",
        "reason": "理性批判"
      }
    ],
    "source": "《Flying Spaghetti Monster 的福音》（博比·亨德森 2006）"
  },
  {
    "id": "rel-shamanism",
    "name": "萨满教",
    "westernName": "Shamanism",
    "category": "古代宗教",
    "era": "约 BC 30,000 至今",
    "region": "西伯利亚 / 北亚 / 美洲 / 全球",
    "summary": "人类最古老的宗教形态，萨满通过神灵附体、灵魂出窍等方式与神灵世界沟通。至今仍在西伯利亚、北美、亚马逊地区活跃。",
    "facts": [
      {
        "label": "信徒",
        "value": "**保留萨满传统的族群散布全球**"
      },
      {
        "label": "起源",
        "value": "**约 BC 30,000（史前时代）**"
      },
      {
        "label": "核心经典",
        "value": "**无（口传传统）**"
      },
      {
        "label": "核心人物",
        "value": "**萨满（Shaman）——通神者**"
      },
      {
        "label": "核心实践",
        "value": "**灵魂出窍 · 神灵附体 · 治疗**"
      },
      {
        "label": "意义",
        "value": "**人类最早的宗教形态**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "萨满教——人类最早的宗教",
        "body": "萨满教是所有宗教的最早形态，至少 3 万年前就存在。萨满（shaman，源自通古斯语）是能与神灵世界沟通的特殊人物——通过击鼓、念咒、舞蹈、食用致幻植物进入恍惚状态，让神灵附体或灵魂出窍。萨满在原始社会是核心人物：治疗疾病、占卜未来、控制天气、引导灵魂。"
      },
      {
        "type": "callout",
        "heading": "萨满教的特点",
        "body": "萨满教特点：① 万物有灵——山、河、树、动物都有灵魂；② 萨满通神——通过恍惚状态与神灵沟通；③ 萨满不是神——而是连接人神的媒介；④ 治疗——精神疾病、身体疾病；⑤ 死亡仪式——引导灵魂到灵界；⑥ 占卜——预知未来。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**萨满是通往另一个世界的桥梁**。",
        "cite": "萨满教经典"
      },
      {
        "type": "list",
        "heading": "萨满教要素",
        "items": [
          "万物有灵",
          "萨满通神",
          "恍惚状态",
          "治疗",
          "占卜",
          "死亡仪式"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 30,000",
        "era": "史前",
        "event": "**萨满教起源**"
      },
      {
        "year": "BC 5,000",
        "era": "新石器",
        "event": "萨满洞穴壁画（法国肖维）"
      },
      {
        "year": "BC 3,000",
        "era": "铜器时代",
        "event": "萨满青铜塑像（西伯利亚）"
      },
      {
        "year": "AD 700",
        "era": "通古斯",
        "event": "萨满教发展"
      },
      {
        "year": "AD 13-18 世纪",
        "era": "美洲/西伯利亚",
        "event": "殖民者屠杀萨满"
      },
      {
        "year": "AD 2020s",
        "era": "全球",
        "event": "萨满教复兴（新纪元）"
      }
    ],
    "images": [
      {
        "imageKeyword": "Shaman healing ritual",
        "caption": "萨满治疗仪式",
        "credit": "Public Domain Illustration"
      },
      {
        "imageKeyword": "Siberian shaman costume",
        "caption": "西伯利亚萨满服装",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Chauvet cave shaman drawing",
        "caption": "肖维洞穴萨满画",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-tengri",
        "title": "腾格里",
        "reason": "北亚宗教"
      },
      {
        "id": "rel-hinduism",
        "title": "印度教",
        "reason": "万物有灵"
      },
      {
        "id": "rel-buddhism",
        "title": "佛教",
        "reason": "古代印度宗教"
      }
    ],
    "source": "《萨满教》（米哈伊尔·霍洛帕尔）"
  },
  {
    "id": "rel-catholicism",
    "name": "天主教",
    "westernName": "Catholicism",
    "category": "亚伯拉罕一神教",
    "era": "AD 30 至今",
    "region": "全球（罗马为中心）",
    "founder": "耶稣 / 使徒伯多禄（首位教宗）",
    "summary": "基督教的三大分支中最大的一支，全球信徒约 13 亿。罗马教廷为中央权威，继承使徒传统。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 13 亿**"
      },
      {
        "label": "中心",
        "value": "**梵蒂冈（罗马教廷）**"
      },
      {
        "label": "核心教义",
        "value": "**三位一体 · 七圣事 · 圣母 · 炼狱**"
      },
      {
        "label": "特色",
        "value": "**教宗无谬误（ex cathedra）**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "基督教最古老的分支",
        "body": "天主教是基督教最早的形式，由耶稣的十二使徒之一伯多禄（彼得）创立。罗马教会宣称其主教是彼得的继承人——即教宗。1054 年东西教会大分裂，天主教和东正教正式决裂。1517 年宗教改革后，新教脱离。"
      },
      {
        "type": "callout",
        "heading": "天主教核心特征",
        "body": "天主教区别于新教的核心：① 教宗权威；② 圣传——教会传统与《圣经》同等权威；③ 七圣事；④ 圣母崇拜；⑤ 圣徒崇拜；⑥ 炼狱。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**圣父、圣子、圣灵——三位一体**。",
        "cite": "天主教信经"
      },
      {
        "type": "list",
        "heading": "天主教七圣事",
        "items": [
          "洗礼",
          "坚振",
          "圣体（弥撒）",
          "告解",
          "终傅",
          "神品",
          "婚配"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 30",
        "era": "耶稣",
        "event": "耶稣受难、复活"
      },
      {
        "year": "AD 313",
        "era": "君士坦丁",
        "event": "**《米兰敕令》——基督教合法**"
      },
      {
        "year": "AD 1054",
        "era": "东西分裂",
        "event": "**天主教与东正教大分裂**"
      },
      {
        "year": "AD 1517",
        "era": "宗教改革",
        "event": "**马丁·路德 95 条论纲——新教脱离**"
      },
      {
        "year": "AD 1870",
        "era": "梵蒂冈",
        "event": "教宗无误钦定"
      },
      {
        "year": "AD 1962",
        "era": "梵二会议",
        "event": "现代天主教改革"
      },
      {
        "year": "AD 2023",
        "era": "现代",
        "event": "全球 13 亿信徒"
      }
    ],
    "images": [
      {
        "imageKeyword": "St Peter Basilica Vatican Rome",
        "caption": "圣彼得大教堂——梵蒂冈",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Pope Francis Vatican",
        "caption": "教宗方济各",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Sistine Chapel Michelangelo ceiling",
        "caption": "西斯廷教堂天顶画",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-christianity",
        "title": "基督教（总）",
        "reason": "包含天主教"
      },
      {
        "id": "rel-orthodoxy",
        "title": "东正教",
        "reason": "基督东部分支"
      },
      {
        "id": "th-jesus",
        "title": "耶稣",
        "reason": "基督教创始人"
      },
      {
        "id": "th-aquinas",
        "title": "阿奎那",
        "reason": "天主教哲学"
      }
    ],
    "source": "《天主教教理》（天主教教廷）·《天主教史》（达尔格连）"
  },
  {
    "id": "rel-orthodoxy",
    "name": "东正教",
    "westernName": "Orthodox Christianity",
    "category": "亚伯拉罕一神教",
    "era": "AD 33 至今",
    "region": "东欧 / 俄罗斯 / 巴尔干",
    "founder": "使徒安德烈",
    "summary": "基督教第二大分支，全球约 2.2 亿信徒。1054 年与天主教正式分裂，保留早期教会传统。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 2.2 亿**"
      },
      {
        "label": "中心",
        "value": "**君士坦丁堡（今伊斯坦布尔）**"
      },
      {
        "label": "核心教义",
        "value": "**七次大公会议 · 神化（theosis）**"
      },
      {
        "label": "影响",
        "value": "**俄罗斯国教 · 东欧文明**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "基督教最古老的传统",
        "body": "东正教承袭使徒传统，中心是君士坦丁堡牧首。1453 年奥斯曼帝国攻陷君士坦丁堡后，东正教中心转移到莫斯科——莫斯科成为「第三罗马」。"
      },
      {
        "type": "callout",
        "heading": "东正教核心特征",
        "body": "东正教：① 七次大公会议——教义基础；② 神化（theosis）；③ 圣像崇拜；④ 拜占庭礼仪；⑤ 独立自主教会；⑥ 修道主义。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**神化是救赎——通过恩典与苦修与神合一**。",
        "cite": "东正教神学"
      },
      {
        "type": "list",
        "heading": "东正教主要教会",
        "items": [
          "君士坦丁堡（伊斯坦布尔）",
          "亚历山大",
          "安提阿",
          "耶路撒冷",
          "莫斯科（俄罗斯）",
          "希腊、塞尔维亚"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 33",
        "era": "耶路撒冷",
        "event": "五旬节——东正教起源"
      },
      {
        "year": "AD 330",
        "era": "君士坦丁",
        "event": "君士坦丁堡建立"
      },
      {
        "year": "AD 787",
        "era": "第七次大公会议",
        "event": "确立圣像崇拜"
      },
      {
        "year": "AD 1054",
        "era": "东西分裂",
        "event": "**天主教与东正教大分裂**"
      },
      {
        "year": "AD 1453",
        "era": "奥斯曼帝国",
        "event": "**君士坦丁堡陷落**"
      },
      {
        "year": "AD 1458",
        "era": "俄罗斯",
        "event": "莫斯科自号「第三罗马」"
      },
      {
        "year": "AD 1917",
        "era": "十月革命",
        "event": "俄罗斯东正教受迫害"
      },
      {
        "year": "AD 1991",
        "era": "苏联",
        "event": "东正教复兴"
      }
    ],
    "images": [
      {
        "imageKeyword": "Hagia Sophia Istanbul Orthodox cathedral",
        "caption": "圣索菲亚大教堂",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Russian Orthodox Church golden domes",
        "caption": "俄罗斯东正教教堂",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Byzantine icon Orthodox",
        "caption": "拜占庭圣像画",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-christianity",
        "title": "基督教",
        "reason": "包含东正教"
      },
      {
        "id": "rel-catholicism",
        "title": "天主教",
        "reason": "东西分裂"
      },
      {
        "id": "th-augustine",
        "title": "奥古斯丁",
        "reason": "教父哲学"
      }
    ],
    "source": "《东正教简史》（梅斯基森）·《拜占庭帝国》（吉本）"
  },
  {
    "id": "rel-protestantism",
    "name": "新教",
    "westernName": "Protestantism",
    "category": "亚伯拉罕一神教",
    "era": "AD 1517 至今",
    "region": "北欧 / 美国 / 全球",
    "founder": "马丁·路德 / 加尔文 / 亨利八世",
    "summary": "1517 年宗教改革后从天主教分出来的基督教分支，全球约 8 亿信徒。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 8 亿**"
      },
      {
        "label": "起源",
        "value": "**AD 1517 维滕堡**"
      },
      {
        "label": "创始人",
        "value": "**马丁·路德**"
      },
      {
        "label": "核心理念",
        "value": "**唯独圣经 · 因信称义 · 唯独恩典**"
      },
      {
        "label": "影响",
        "value": "**现代民主 + 资本主义**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "宗教改革",
        "body": "1517 年 10 月 31 日，马丁·路德发表《九十五条论纲》，反对天主教会售卖赎罪券。这引发宗教改革运动，新教从天主教分离。"
      },
      {
        "type": "callout",
        "heading": "新教五唯独",
        "body": "新教「五唯独」：① 唯独圣经；② 唯独恩典；③ 唯独信心；④ 唯独基督；⑤ 一切荣耀归于神。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**这是我的立场，我别无选择**——马丁·路德。",
        "cite": "沃尔姆斯帝国议会 1521"
      },
      {
        "type": "list",
        "heading": "新教主要宗派",
        "items": [
          "路德宗（4 亿）",
          "加尔文宗（8 千万）",
          "圣公会（8 千万）",
          "浸信会（5 千万）",
          "卫理公会（8 千万）",
          "五旬节派（3 亿）",
          "福音派（6 亿）"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1517",
        "era": "维滕堡",
        "event": "**马丁·路德发表 95 条论纲**"
      },
      {
        "year": "AD 1534",
        "era": "英格兰",
        "event": "亨利八世建立圣公会"
      },
      {
        "year": "AD 1536",
        "era": "日内瓦",
        "event": "加尔文《基督教要义》出版"
      },
      {
        "year": "AD 1618-1648",
        "era": "三十年战争",
        "event": "宗教战争"
      },
      {
        "year": "AD 1906",
        "era": "美国",
        "event": "五旬节派兴起"
      },
      {
        "year": "AD 2023",
        "era": "现代",
        "event": "全球 8 亿信徒"
      }
    ],
    "images": [
      {
        "imageKeyword": "Martin Luther 95 Theses Wittenberg",
        "caption": "马丁·路德",
        "credit": "Public Domain Illustration"
      },
      {
        "imageKeyword": "Westminster Abbey Anglican London",
        "caption": "威斯敏斯特教堂",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Calvin Geneva Reformed church",
        "caption": "加尔文派日内瓦",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-christianity",
        "title": "基督教",
        "reason": "新教是分支"
      },
      {
        "id": "rel-catholicism",
        "title": "天主教",
        "reason": "宗教改革分离"
      },
      {
        "id": "rel-orthodoxy",
        "title": "东正教",
        "reason": "另一分支"
      },
      {
        "id": "th-calvin",
        "title": "加尔文",
        "reason": "新教神学家"
      }
    ],
    "source": "《宗教改革史》（杜兰特）·《基督教简史》（帕尔默）"
  },
  {
    "id": "rel-vodun",
    "name": "伏都教 / 沃达比教",
    "westernName": "Vodun / Voodoo",
    "category": "非洲传统宗教",
    "era": "约 BC 10,000 至今",
    "region": "西非（贝宁/多哥/尼日利亚）→ 海地/路易斯安那",
    "summary": "源自西非约鲁巴/丰族传统宗教，全球约 6000 万信徒。海地伏都教是最著名的分支，是海地国教。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 6000 万**"
      },
      {
        "label": "起源",
        "value": "**约 BC 10,000 西非**"
      },
      {
        "label": "核心人物",
        "value": "**巫毒祭司 + 西马农（Loa）**"
      },
      {
        "label": "核心教义",
        "value": "**祖先崇拜 · 万物有灵 · 神祇附体**"
      },
      {
        "label": "特色",
        "value": "**巫毒娃娃（误解）**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "西非的万灵信仰",
        "body": "伏都教（Vodun，字面意思是「精灵」）是西非（贝宁、多哥、加纳）的传统宗教。公元 16-19 世纪奴隶贸易把伏都教带到美洲，形成海地伏都教。海地 1804 年独立后，伏都教成为海地国教。"
      },
      {
        "type": "callout",
        "heading": "伏都教核心教义",
        "body": "伏都教核心：① 一位至高神（Mawu-Lisa）；② 数以千计的精灵 Loa；③ 祖先崇拜；④ 灵魂附体；⑤ 萨泰里阿仪式。误解：巫毒娃娃原本是用来传递信息，并非操控。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**Loa 是连接神界与人的桥梁**。",
        "cite": "伏都教"
      },
      {
        "type": "list",
        "heading": "伏都教主要 Loa",
        "items": [
          "Damballa——彩虹蛇",
          "Shango——风暴与火神",
          "Erzulie——爱与美之神",
          "Legba——通向灵界的门神",
          "Baron Samedi——死亡之神",
          "Ogoun——战争与铁神"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 10,000",
        "era": "西非",
        "event": "伏都教起源"
      },
      {
        "year": "AD 1500",
        "era": "西非",
        "event": "贝宁王国鼎盛——伏都教文化"
      },
      {
        "year": "AD 1502-1804",
        "era": "大西洋",
        "event": "奴隶贸易——伏都教传入美洲"
      },
      {
        "year": "AD 1737",
        "era": "海地",
        "event": "巫毒之夜——伏都教反叛"
      },
      {
        "year": "AD 1791-1804",
        "era": "海地革命",
        "event": "伏都教祭祀鼓动奴隶革命"
      },
      {
        "year": "AD 1804",
        "era": "海地",
        "event": "海地独立——伏都教成为国教"
      },
      {
        "year": "AD 1884",
        "era": "海地",
        "event": "法国承认海地独立"
      },
      {
        "year": "AD 2023",
        "era": "现代",
        "event": "全球 6000 万信徒"
      }
    ],
    "images": [
      {
        "imageKeyword": "Vodun ceremony West Africa",
        "caption": "西非伏都教仪式",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Haiti Voodoo ceremony dance",
        "caption": "海地伏都教舞蹈",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "veve Vodou Loa symbol",
        "caption": "伏都教符号",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-yoruba",
        "title": "约鲁巴教",
        "reason": "伏都教源头"
      },
      {
        "id": "rel-christianity",
        "title": "天主教",
        "reason": "伏都教受天主教影响"
      },
      {
        "id": "rel-shamanism",
        "title": "萨满教",
        "reason": "通神实践"
      }
    ],
    "source": "《海地伏都教》（梅特罗）·《伏都教历史》（汤姆森）"
  },
  {
    "id": "rel-yoruba",
    "name": "约鲁巴教",
    "westernName": "Yoruba Religion",
    "category": "非洲传统宗教",
    "era": "约 BC 3000 至今",
    "region": "西非（尼日利亚/贝宁/多哥）",
    "summary": "西非约鲁巴族的传统宗教，约 1 亿信徒。核心：至高神 Olorun + 数以百计的 Orisa 神祇。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 1 亿**"
      },
      {
        "label": "起源",
        "value": "**约 BC 3000 西非**"
      },
      {
        "label": "核心经典",
        "value": "**口头传统（Ifá 系统）**"
      },
      {
        "label": "核心教义",
        "value": "**至高神 Olorun + Orisa 神祇**"
      },
      {
        "label": "影响",
        "value": "**伏都教源头 + 巴西 Candomblé**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "西非最大的传统宗教之一",
        "body": "约鲁巴教是西非约鲁巴族的传统宗教，约公元前 3000 年在今尼日利亚一带形成。约鲁巴族是尼日利亚最大族群之一（5000 万人）。"
      },
      {
        "type": "callout",
        "heading": "约鲁巴教的影响",
        "body": "约鲁巴教对世界的影响：① 伏都教源头——伏都教中大部分 Loa 来自约鲁巴 Orisa；② 影响巴西 Candomblé 和古巴 Santería；③ Ifá 占卜系统 2008 年被联合国教科文组织列为非物质文化遗产。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**Olorun 是至高，Orisa 是他的使者**——约鲁巴教。",
        "cite": "约鲁巴教传统"
      },
      {
        "type": "list",
        "heading": "约鲁巴教主要 Orisa",
        "items": [
          "Obatala——创造之神",
          "Shango——雷神与火神",
          "Yemoja——海母神",
          "Ogun——铁与战争神",
          "Esu——混乱之神",
          "Oshun——爱与甜水神"
        ]
      }
    ],
    "timeline": [
      {
        "year": "BC 3000",
        "era": "西非",
        "event": "约鲁巴教起源"
      },
      {
        "year": "AD 11 世纪",
        "era": "约鲁巴",
        "event": "Ifá 占卜系统成熟"
      },
      {
        "year": "AD 14-19 世纪",
        "era": "约鲁巴帝国",
        "event": "奥约帝国鼎盛"
      },
      {
        "year": "AD 16-19 世纪",
        "era": "奴隶贸易",
        "event": "约鲁巴宗教传入美洲"
      },
      {
        "year": "AD 1835",
        "era": "巴西",
        "event": "Candomblé 兴起"
      },
      {
        "year": "AD 2023",
        "era": "现代",
        "event": "全球约 1 亿信徒"
      }
    ],
    "images": [
      {
        "imageKeyword": "Yoruba Orisha shrine",
        "caption": "约鲁巴 Orisa 神龛",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Shango Yoruba thunder god",
        "caption": "Shango 雷神",
        "credit": "Wikimedia Commons · Private Domain"
      },
      {
        "imageKeyword": "Ifa divination board Nigeria",
        "caption": "Ifá 占卜板",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-vodun",
        "title": "伏都教",
        "reason": "约鲁巴教的源头"
      },
      {
        "id": "rel-christianity",
        "title": "天主教",
        "reason": "受其影响"
      },
      {
        "id": "rel-islam",
        "title": "伊斯兰教",
        "reason": "受其影响"
      }
    ],
    "source": "《约鲁巴宗教》（约翰逊）·《Ifá 占卜》（赖特）"
  },
  {
    "id": "rel-sufism",
    "name": "苏菲派",
    "westernName": "Sufism",
    "category": "伊斯兰神秘主义",
    "era": "AD 7世纪 至今",
    "region": "中东/北非/中亚/南亚",
    "summary": "伊斯兰教的神秘主义分支，强调与真主的神秘合一。全球数亿信徒，对伊斯兰文化和艺术有深远影响。",
    "facts": [
      {
        "label": "信徒",
        "value": "**数亿**"
      },
      {
        "label": "起源",
        "value": "**AD 7世纪阿拉伯**"
      },
      {
        "label": "核心理念",
        "value": "**神秘合一 + 爱 + 旋转舞**"
      },
      {
        "label": "代表",
        "value": "**鲁米 / 阿塔尔**"
      },
      {
        "label": "影响",
        "value": "**诗歌 + 音乐 + 舞蹈**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "伊斯兰教的神秘之心",
        "body": "苏菲派（Sufism）是伊斯兰教的神秘主义分支，7 世纪兴起于阿拉伯。「Sufi」可能源自「羊毛」（suf），因为早期苏菲派穿粗羊毛衣服苦修。苏菲派通过 dhikr（记念真主）、禁欲、冥想达到「法纳」（fana，消融在真主中）。著名苏菲大师：鲁米（13 世纪）、阿塔尔、哈拉智。"
      },
      {
        "type": "callout",
        "heading": "苏菲派的实践",
        "body": "苏菲派主要实践：① dhikr——反复念诵真主之名；② 萨玛（Sama）——音乐、诗歌、舞蹈仪式（最著名的梅夫拉维教团旋转舞）；③ 导师制度；④ 修道院。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**你中有我，我中有你**——苏菲诗人鲁米。",
        "cite": "鲁米《玛斯纳维》"
      },
      {
        "type": "list",
        "heading": "苏菲教团",
        "items": [
          "梅夫拉维教团（Mevlevi）—— 鲁米创立",
          "卡迪里教团（Qadiriyya）——非洲",
          "纳格什班迪教团（Naqshbandi）——中亚",
          "契斯提教团（Chishti）——南亚"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 7世纪",
        "era": "阿拉伯",
        "event": "苏菲派起源"
      },
      {
        "year": "AD 922",
        "era": "巴格达",
        "event": "哈拉智被处死——苏菲派殉道者"
      },
      {
        "year": "AD 1207",
        "era": "波斯",
        "event": "鲁米诞生"
      },
      {
        "year": "AD 1258",
        "era": "蒙古",
        "event": "巴格达陷落——苏菲派扩展"
      },
      {
        "year": "AD 1273",
        "era": "土耳其",
        "event": "鲁米逝世——梅夫拉维教团"
      },
      {
        "year": "AD 2023",
        "era": "现代",
        "event": "全球数亿信徒"
      }
    ],
    "images": [
      {
        "imageKeyword": "Whirling Dervishes Mevlevi Sufi",
        "caption": "梅夫拉维旋转舞",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Rumi Persian poet Sufi",
        "caption": "鲁米——苏菲诗人",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Sufi dhikr ceremony",
        "caption": "苏菲 dhikr 仪式",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-islam",
        "title": "伊斯兰教",
        "reason": "苏菲是伊斯兰分支"
      },
      {
        "id": "th-rumi",
        "title": "鲁米",
        "reason": "苏菲大师"
      },
      {
        "id": "th-averroes",
        "title": "阿威罗伊",
        "reason": "伊斯兰哲学家"
      }
    ],
    "source": "《鲁米诗集》·《苏菲之道》（侯赛因）"
  },
  {
    "id": "rel-caodai",
    "name": "高台教",
    "westernName": "Cao Đài",
    "category": "东亚新兴宗教",
    "era": "AD 1926",
    "region": "越南",
    "founder": "吴文昭 / 黎文忠",
    "summary": "1926 年越南新兴宗教，综合佛教、道教、儒教、基督教和本土信仰。全球信徒约 500 万。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 500 万**"
      },
      {
        "label": "起源",
        "value": "**AD 1926 越南西宁**"
      },
      {
        "label": "创始人",
        "value": "**吴文昭 / 黎文忠**"
      },
      {
        "label": "核心教义",
        "value": "**三教合一 · 普世宗教**"
      },
      {
        "label": "特色",
        "value": "**绣有「眼」的圣殿**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "越南的「第三种选择」",
        "body": "高台教（Cao Đài = 「大道至高」）由越南西宁省政府公务员吴文昭、黎文忠等于 1926 年在通灵仪式上创立。他们声称与全知之神联系，获得启示。综合了佛教、道教、儒教、基督教、伊斯兰教以及伏都教元素。"
      },
      {
        "type": "callout",
        "heading": "高台教的特点",
        "body": "高台教：① 普世主义——所有宗教都是同一真理的不同方面；② 三教合一；③ 拜「眼」——圣殿中悬挂着神圣之眼；④ 圣徒包含多元——释迦牟尼、孔子、老子、耶稣、穆罕默德、维克多·雨果、孙中山都是高台教圣人。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**大道至高，无所不在，无所不能**——高台教核心。",
        "cite": "高台教"
      },
      {
        "type": "list",
        "heading": "高台教圣徒",
        "items": [
          "释迦牟尼",
          "孔子",
          "老子",
          "耶稣基督",
          "穆罕默德",
          "维克多·雨果",
          "孙中山",
          "李白",
          "关羽"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1919",
        "era": "越南",
        "event": "吴文昭获得通灵体验"
      },
      {
        "year": "AD 1926",
        "era": "越南西宁",
        "event": "高台教正式成立"
      },
      {
        "year": "AD 1930",
        "era": "越南",
        "event": "西宁圣殿落成"
      },
      {
        "year": "AD 1957",
        "era": "越南",
        "event": "高台教鼎盛"
      },
      {
        "year": "AD 1975",
        "era": "越南统一",
        "event": "高台教受限制"
      },
      {
        "year": "AD 1980s",
        "era": "越南",
        "event": "高台教复兴"
      },
      {
        "year": "AD 2023",
        "era": "现代",
        "event": "全球约 500 万信徒"
      }
    ],
    "images": [
      {
        "imageKeyword": "Caodai Holy See Tay Ninh Vietnam",
        "caption": "高台教西宁圣殿",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Caodai divine eye symbol",
        "caption": "高台教神圣之眼",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Caodai ceremony Vietnam",
        "caption": "高台教仪式",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-buddhism",
        "title": "佛教",
        "reason": "高台三教之一"
      },
      {
        "id": "rel-taoism",
        "title": "道教",
        "reason": "高台三教之一"
      },
      {
        "id": "rel-catholicism",
        "title": "天主教",
        "reason": "影响高台"
      }
    ],
    "source": "《高台教》（唐纳利）·《越南宗教史》"
  },
  {
    "id": "rel-mormon",
    "name": "摩门教 / 后期圣徒",
    "westernName": "Mormonism / LDS",
    "category": "新兴宗教",
    "era": "AD 1830",
    "region": "美国",
    "founder": "约瑟·斯密",
    "summary": "1830 年由约瑟·斯密创立于美国的新兴宗教，全球信徒约 1700 万。",
    "facts": [
      {
        "label": "信徒",
        "value": "**约 1700 万**"
      },
      {
        "label": "起源",
        "value": "**AD 1830 美国纽约**"
      },
      {
        "label": "创始人",
        "value": "**约瑟·斯密**"
      },
      {
        "label": "核心经典",
        "value": "**《圣经》+ 《摩尔门经》**"
      },
      {
        "label": "特色",
        "value": "**圣殿婚礼 · 不喝酒不喝茶咖啡**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "美国本土新兴宗教",
        "body": "摩门教（正式名称「耶稣基督后期圣徒教会」）由约瑟·斯密（Joseph Smith，1805—1844）于 1830 年在美国纽约创立。斯密声称得到天使摩罗尼的启示，发现了金叶子，上面刻有古代美洲居民的记录，被翻译为《摩尔门经》。"
      },
      {
        "type": "callout",
        "heading": "摩门教核心教义",
        "body": "摩门教核心：① 《摩尔门经》——与《圣经》并列的圣典；② 圣殿——通过圣殿仪式（包括代替死者洗礼、圣殿婚礼）获得救恩；③ 永恒家庭——婚姻在死后仍延续；④ 普世救恩；⑤ 健康律法（智慧语）——不饮酒、不抽烟、不喝茶和咖啡。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**我们相信所有被救赎的人……都将永远与家人在一起**。",
        "cite": "摩门教《家庭宣言》"
      },
      {
        "type": "list",
        "heading": "摩门教重要概念",
        "items": [
          "《摩尔门经》",
          "圣殿仪式",
          "永恒家庭",
          "活的先知",
          "智慧语",
          "十一奉献"
        ]
      }
    ],
    "timeline": [
      {
        "year": "AD 1805",
        "era": "美国",
        "event": "约瑟·斯密诞生"
      },
      {
        "year": "AD 1820",
        "era": "美国",
        "event": "第一次异象——神的显现"
      },
      {
        "year": "AD 1827",
        "era": "美国",
        "event": "金叶子出土"
      },
      {
        "year": "AD 1830",
        "era": "纽约",
        "event": "摩门教正式成立"
      },
      {
        "year": "AD 1844",
        "era": "美国",
        "event": "约瑟·斯密遇害"
      },
      {
        "year": "AD 1846-1847",
        "era": "美国",
        "event": "杨百翰率众西迁——盐湖城"
      },
      {
        "year": "AD 1847",
        "era": "美国",
        "event": "抵达犹他州——摩门教新总部"
      },
      {
        "year": "AD 1890",
        "era": "美国",
        "event": "废除一夫多妻"
      },
      {
        "year": "AD 2023",
        "era": "现代",
        "event": "全球 1700 万信徒"
      }
    ],
    "images": [
      {
        "imageKeyword": "Salt Lake Temple Mormon Utah",
        "caption": "盐湖城圣殿（摩门教）",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Joseph Smith Mormon founder",
        "caption": "约瑟·斯密",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Book of Mormon Golden Plates",
        "caption": "《摩尔门经》",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "rel-christianity",
        "title": "基督教",
        "reason": "摩门教源头"
      },
      {
        "id": "rel-catholicism",
        "title": "天主教",
        "reason": "对摩门教的反对"
      },
      {
        "id": "rel-protestantism",
        "title": "新教",
        "reason": "对摩门教的反对"
      }
    ],
    "source": "《摩尔门经》（约瑟·斯密译）·《摩门教史》（布赫里格）"
  }
]

export const RELIGION_CATEGORIES = [
  { id: 'abrahamic', label: '亚伯拉罕一神教', color: '#5b9bc8' },
  { id: 'indian', label: '印度本土宗教', color: '#b85450' },
  { id: 'chinese', label: '中国本土宗教', color: '#c89a5b' },
  { id: 'east-asian', label: '东亚宗教', color: '#d4a85b' },
  { id: 'emerging', label: '新兴宗教', color: '#9b7eb6' },
  { id: 'ancient', label: '古代宗教', color: '#b88e54' },
  { id: 'african', label: '非洲传统', color: '#c8985a' },
  { id: 'other', label: '其他', color: '#5bc89a' },
] as const

export type ReligionCategory = typeof RELIGION_CATEGORIES[number]['id']
