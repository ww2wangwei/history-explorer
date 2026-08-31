import type { KeyFact, RichSection, TimelineEvent, TraditionImage, RelatedItem } from '@/types'

export interface Thinker {
  id: string
  name: string
  westernName?: string
  region: string
  era: string
  school: string
  title: string
  summary: string

  facts: KeyFact[]
  sections: RichSection[]
  timeline: TimelineEvent[]
  images: TraditionImage[]
  related: RelatedItem[]
  source: string
}

export const THINKERS: Thinker[] = [
  {
    "id": "th-laozi",
    "name": "老子",
    "region": "china",
    "era": "BC 571-471",
    "school": "道家",
    "title": "道家学派创始人，《道德经》作者",
    "summary": "春秋末期思想家，姓李名耳。创立道家学派，主张道法自然、无为而治。",
    "facts": [
      {
        "label": "生卒",
        "value": "**约 BC 571—471**"
      },
      {
        "label": "国籍",
        "value": "**春秋楚国**"
      },
      {
        "label": "代表作",
        "value": "**《道德经》五千言**"
      },
      {
        "label": "核心思想",
        "value": "**道·德·无为·自然**"
      },
      {
        "label": "地位",
        "value": "**道家创始人**"
      },
      {
        "label": "影响",
        "value": "**影响中国哲学 2500 年**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "为什么老子是「中国哲学之父」？",
        "body": "老子是道家创始人，《道德经》五千言奠定中国哲学基础。「道」先于天地万物，是宇宙本源。"
      },
      {
        "type": "callout",
        "heading": "「道」的三层含义",
        "body": "① 本体义 ② 规律义 ③ 修养义",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**人法地，地法天，天法道，道法自然**。",
        "cite": "《道德经》25章"
      }
    ],
    "timeline": [
      {
        "year": "BC 571",
        "era": "春秋",
        "event": "老子生于楚国"
      },
      {
        "year": "BC 491",
        "era": "晚年",
        "event": "西出函谷关写下《道德经》"
      },
      {
        "year": "BC 471",
        "era": "去世",
        "event": "老子去世"
      },
      {
        "year": "AD 1417",
        "era": "明代",
        "event": "《道德经》译成拉丁文传入欧洲"
      },
      {
        "year": "AD 2020s",
        "era": "现代",
        "event": "全球销量仅次于《圣经》"
      }
    ],
    "images": [
      {
        "imageKeyword": "Laozi philosopher portrait",
        "caption": "老子画像",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Daodejing ancient text",
        "caption": "《道德经》古本",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Laozi riding ox statue",
        "caption": "老子骑青牛雕像",
        "credit": "Public Domain Photo"
      }
    ],
    "related": [
      {
        "id": "th-zhuangzi",
        "title": "庄子",
        "reason": "道家继承者"
      },
      {
        "id": "th-socrates",
        "title": "苏格拉底",
        "reason": "同期西方圣哲"
      },
      {
        "id": "th-buddha",
        "title": "释迦牟尼",
        "reason": "同期东方圣哲"
      }
    ],
    "source": "《道德经》（春秋·老子）·《史记·老子韩非列传》（西汉·司马迁）· 葛兆光《中国思想史》· 陈鼓应《老子注译及评介》"
  },
  {
    "id": "th-zhuangzi",
    "name": "庄子",
    "region": "china",
    "era": "BC 369-286",
    "school": "道家",
    "title": "道家集大成者，寓言大师",
    "summary": "战国时期思想家，名周。继承老子道家思想，发展为齐物、逍遥体系。",
    "facts": [
      {
        "label": "生卒",
        "value": "**约 BC 369—286**"
      },
      {
        "label": "国籍",
        "value": "**战国宋国蒙县**"
      },
      {
        "label": "代表作",
        "value": "**《庄子》（又名《南华经》）**"
      },
      {
        "label": "核心思想",
        "value": "**齐物·逍遥·心斋·坐忘**"
      },
      {
        "label": "地位",
        "value": "**道家集大成者**"
      },
      {
        "label": "影响",
        "value": "**中国艺术精神源头**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "为什么庄子的「逍遥」超越老子的「无为」？",
        "body": "老子讲「道法自然」——宇宙法则；庄子讲「逍遥游」——个体如何获得自由。庄子把道家从宇宙论推进到人生哲学。"
      },
      {
        "type": "callout",
        "heading": "「庄周梦蝶」的哲学革命",
        "body": "梦中我是蝴蝶还是庄周？这是对「自我」概念的解构。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**天地与我并生，而万物与我为一**。",
        "cite": "《庄子·齐物论》"
      }
    ],
    "timeline": [
      {
        "year": "BC 369",
        "era": "战国",
        "event": "庄子生于宋国蒙县"
      },
      {
        "year": "BC 340",
        "era": "青年",
        "event": "任宋国漆园小吏"
      },
      {
        "year": "BC 300",
        "era": "成熟",
        "event": "《庄子》内篇 7 篇成书"
      },
      {
        "year": "BC 286",
        "era": "去世",
        "event": "庄子去世"
      },
      {
        "year": "AD 1615",
        "era": "明代",
        "event": "意大利传教士利玛窦将《庄子》介绍到欧洲"
      }
    ],
    "images": [
      {
        "imageKeyword": "Zhuangzi philosopher portrait",
        "caption": "庄子画像",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Zhuangzi butterfly dream",
        "caption": "庄周梦蝶图",
        "credit": "Public Domain Illustration"
      },
      {
        "imageKeyword": "Zhuangzi happy wanderer",
        "caption": "《逍遥游》意境画",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "th-laozi",
        "title": "老子",
        "reason": "道家学派创始人"
      },
      {
        "id": "th-socrates",
        "title": "苏格拉底",
        "reason": "同期西方圣哲"
      },
      {
        "id": "th-buddha",
        "title": "释迦牟尼",
        "reason": "同期东方圣哲"
      }
    ],
    "source": "《庄子》（战国·庄周）·《史记·老子韩非列传》（西汉·司马迁）·《庄子集释》（清·郭庆藩）· 陈鼓应《庄子今注今译》· 刘笑敢《庄子哲学及其演变》"
  },
  {
    "id": "th-confucius",
    "name": "孔子",
    "region": "china",
    "era": "BC 551-479",
    "school": "儒家",
    "title": "儒家学派创始人，万世师表",
    "summary": "春秋末期思想家。主张仁、礼。整理诗书礼易春秋，弟子三千，贤者七十二。",
    "facts": [
      {
        "label": "生卒",
        "value": "**BC 551—479**"
      },
      {
        "label": "国籍",
        "value": "**春秋鲁国**"
      },
      {
        "label": "代表作",
        "value": "**整理诗书礼易春秋**"
      },
      {
        "label": "弟子",
        "value": "**3000 弟子 72 贤人**"
      },
      {
        "label": "核心思想",
        "value": "**仁·礼·中庸·孝·君子**"
      },
      {
        "label": "影响",
        "value": "**中国 2500 年主流意识形态**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "为什么孔子的「仁」是中国伦理的基石？",
        "body": "孔子的「仁」是儒家伦理最高范畴——己欲立而立人，己欲达而达人（忠）+ 己所不欲勿施于人（恕）。"
      },
      {
        "type": "callout",
        "heading": "「仁」与「礼」的关系",
        "body": "克己复礼为仁——克己是内在修养，复礼是外在行为。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**己所不欲，勿施于人**。",
        "cite": "《论语·颜渊》"
      }
    ],
    "timeline": [
      {
        "year": "BC 551",
        "era": "春秋",
        "event": "孔子生于鲁国陬邑"
      },
      {
        "year": "BC 532",
        "era": "青年",
        "event": "任鲁国委吏"
      },
      {
        "year": "BC 501",
        "era": "51岁",
        "event": "中都宰、司空、大司寇"
      },
      {
        "year": "BC 497",
        "era": "55岁",
        "event": "周游列国开始"
      },
      {
        "year": "BC 479",
        "era": "73岁",
        "event": "孔子去世"
      }
    ],
    "images": [
      {
        "imageKeyword": "Confucius portrait painting ancient",
        "caption": "孔子画像（唐·吴道子）",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Confucius temple Qufu",
        "caption": "曲阜孔庙",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Confucius teaching disciples",
        "caption": "孔子讲学图",
        "credit": "Public Domain Illustration"
      }
    ],
    "related": [
      {
        "id": "th-laozi",
        "title": "老子",
        "reason": "同期道家"
      },
      {
        "id": "th-socrates",
        "title": "苏格拉底",
        "reason": "同期西方圣哲"
      },
      {
        "id": "th-mencius",
        "title": "孟子",
        "reason": "儒家继承者"
      }
    ],
    "source": "《论语》（春秋·孔子弟子编）·《史记·孔子世家》（西汉·司马迁）· 杨伯峻《论语译注》· 钱穆《孔子传》"
  },
  {
    "id": "th-socrates",
    "westernName": "Socrates",
    "name": "苏格拉底",
    "region": "greece",
    "era": "BC 470-399",
    "school": "古希腊哲学",
    "title": "古希腊三贤之一，西方哲学之父",
    "summary": "雅典公民，无著作，靠对话教学。被控腐化青年处死。提出「认识你自己」「未经审视的人生不值得过」。",
    "facts": [
      {
        "label": "生卒",
        "value": "**BC 470—399**"
      },
      {
        "label": "国籍",
        "value": "**古希腊雅典**"
      },
      {
        "label": "代表作",
        "value": "**无著作**（弟子柏拉图记录）"
      },
      {
        "label": "核心思想",
        "value": "**认识你自己·产婆术·善即知识**"
      },
      {
        "label": "死因",
        "value": "**被雅典法庭判处死刑（饮鸩自尽）**"
      },
      {
        "label": "影响",
        "value": "**整个西方哲学奠基者**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "为什么苏格拉底「不写书」却影响西方 2400 年？",
        "body": "苏格拉底刻意不写作——他认为文字是死的。他选择口头对话。他的学生柏拉图把对话写成《对话录》传世。"
      },
      {
        "type": "callout",
        "heading": "「认识你自己」的三大含义",
        "body": "① 知识的限制——我知我一无所知；② 自我审视；③ 道德的起点",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**未经审视的人生是不值得过的**。",
        "cite": "柏拉图《苏格拉底的申辩》38a"
      }
    ],
    "timeline": [
      {
        "year": "BC 470",
        "era": "古希腊",
        "event": "苏格拉底生于雅典"
      },
      {
        "year": "BC 450",
        "era": "青年",
        "event": "参军 3 次战役"
      },
      {
        "year": "BC 435",
        "era": "中年",
        "event": "街头哲学开始"
      },
      {
        "year": "BC 399",
        "era": "70岁",
        "event": "受审判死刑"
      },
      {
        "year": "BC 399",
        "era": "70岁",
        "event": "饮鸩自尽"
      }
    ],
    "images": [
      {
        "imageKeyword": "Socrates bust statue",
        "caption": "苏格拉底胸像",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Socrates death hemlock painting",
        "caption": "《苏格拉底之死》（大卫 1787）",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Athens Agora ancient Greek marketplace",
        "caption": "古雅典广场",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "th-plato",
        "title": "柏拉图",
        "reason": "苏格拉底学生"
      },
      {
        "id": "th-aristotle",
        "title": "亚里士多德",
        "reason": "柏拉图学生"
      },
      {
        "id": "th-confucius",
        "title": "孔子",
        "reason": "同期东方圣哲"
      }
    ],
    "source": "《苏格拉底的申辩》《克力同》《斐多》（古希腊·柏拉图）·《回忆苏格拉底》（古希腊·色诺芬）·《苏格拉底传》（罗马·第欧根尼·拉尔修）· 柏拉图《理想国》"
  },
  {
    "id": "th-plato",
    "westernName": "Plato",
    "name": "柏拉图",
    "region": "greece",
    "era": "BC 427-347",
    "school": "古希腊哲学",
    "title": "理念论创立者，西方哲学奠基者",
    "summary": "苏格拉底学生，亚里士多德老师。创立学园38年。提出理念论。",
    "facts": [
      {
        "label": "生卒",
        "value": "**BC 427—347**"
      },
      {
        "label": "国籍",
        "value": "**古希腊雅典贵族**"
      },
      {
        "label": "师承",
        "value": "**苏格拉底**"
      },
      {
        "label": "弟子",
        "value": "**亚里士多德**（最伟大）"
      },
      {
        "label": "代表作",
        "value": "**《理想国》等 36 部对话录**"
      },
      {
        "label": "核心思想",
        "value": "**理念论·洞穴寓言·哲学王**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "「理念论」为何是西方哲学的奠基石？",
        "body": ""
      },
      {
        "type": "callout",
        "heading": "洞穴寓言的哲学革命",
        "body": "囚徒只能看见墙上投影的影子，爬出洞穴才看见太阳——这是整个西方哲学史的缩影。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**哲学始于惊奇**。",
        "cite": "柏拉图《泰阿泰德篇》155d"
      }
    ],
    "timeline": [
      {
        "year": "BC 427",
        "era": "古希腊",
        "event": "柏拉图生于雅典贵族"
      },
      {
        "year": "BC 407",
        "era": "20岁",
        "event": "拜苏格拉底为师"
      },
      {
        "year": "BC 399",
        "era": "28岁",
        "event": "目睹苏格拉底被处死"
      },
      {
        "year": "BC 387",
        "era": "40岁",
        "event": "创办学园"
      },
      {
        "year": "BC 347",
        "era": "80岁",
        "event": "柏拉图去世"
      }
    ],
    "images": [
      {
        "imageKeyword": "Plato bust statue",
        "caption": "柏拉图胸像",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "School of Athens Raphael",
        "caption": "《雅典学院》（拉斐尔）",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Plato Academy Athens mosaic",
        "caption": "柏拉图学园遗址",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "th-socrates",
        "title": "苏格拉底",
        "reason": "柏拉图老师"
      },
      {
        "id": "th-aristotle",
        "title": "亚里士多德",
        "reason": "柏拉图弟子"
      },
      {
        "id": "th-kant",
        "title": "康德",
        "reason": "继承柏拉图理性主义"
      }
    ],
    "source": "《理想国》《会饮篇》《斐多》《巴门尼德篇》（古希腊·柏拉图）· 亚里士多德《形而上学》第一卷· 怀特海《过程与实在》「欧洲哲学传统不过是对柏拉图的一系列脚注」"
  },
  {
    "id": "th-buddha",
    "westernName": "Sakyamuni Buddha",
    "name": "释迦牟尼",
    "region": "india",
    "era": "BC 563-483",
    "school": "佛教",
    "title": "佛教创始人，觉悟者",
    "summary": "古印度迦毗罗卫国王子乔达摩·悉达多。29岁出家，35岁菩提树下悟道。创立佛教。",
    "facts": [
      {
        "label": "生卒",
        "value": "**BC 563—483**"
      },
      {
        "label": "国籍",
        "value": "**古印度迦毗罗卫国**"
      },
      {
        "label": "出身",
        "value": "**释迦族王子**"
      },
      {
        "label": "代表作",
        "value": "**无著作**（弟子结集为三藏）"
      },
      {
        "label": "核心思想",
        "value": "**四圣谛·八正道·缘起·无我·涅槃**"
      },
      {
        "label": "影响",
        "value": "**全球 5 亿佛教徒**"
      }
    ],
    "sections": [
      {
        "type": "paragraph",
        "heading": "为什么王子要出家？",
        "body": "19岁出城看到老人、病人、死尸——意识到所有人都要经历老病死。29岁夜里离开王宫，抛弃妻子开始修行，菩提树下打坐49天证悟。"
      },
      {
        "type": "callout",
        "heading": "「缘起性空」的哲学革命",
        "body": "此有故彼有——一切因缘和合而生——没有独立自性——万法皆空。",
        "variant": "info"
      },
      {
        "type": "quote",
        "text": "**一切众生皆有如来智慧德相，但以妄想执着不能证得**。",
        "cite": "《华严经》"
      }
    ],
    "timeline": [
      {
        "year": "BC 563",
        "era": "古印度",
        "event": "释迦牟尼生于蓝毗尼园"
      },
      {
        "year": "BC 534",
        "era": "29岁",
        "event": "出家"
      },
      {
        "year": "BC 528",
        "era": "35岁",
        "event": "菩提伽耶悟道"
      },
      {
        "year": "BC 528",
        "era": "35岁",
        "event": "鹿野苑初转法轮"
      },
      {
        "year": "BC 483",
        "era": "80岁",
        "event": "拘尸那迦涅槃"
      }
    ],
    "images": [
      {
        "imageKeyword": "Buddha statue meditation Bodh Gaya",
        "caption": "释迦牟尼悟道像",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Buddha Lumbini birthplace Nepal",
        "caption": "佛陀诞生地——蓝毗尼园",
        "credit": "Wikimedia Commons · Public Domain"
      },
      {
        "imageKeyword": "Buddha first sermon deer park Sarnath",
        "caption": "鹿野苑初转法轮",
        "credit": "Wikimedia Commons · Public Domain"
      }
    ],
    "related": [
      {
        "id": "th-laozi",
        "title": "老子",
        "reason": "同期东方圣哲"
      },
      {
        "id": "th-confucius",
        "title": "孔子",
        "reason": "同期东方圣哲"
      },
      {
        "id": "th-socrates",
        "title": "苏格拉底",
        "reason": "同期西方圣哲"
      }
    ],
    "source": "《杂阿含经》《长阿含经》《中阿含经》（南传巴利文三藏）·《金刚经》《心经》《法华经》《华严经》· 玄奘《大唐西域记》· 印顺《印度佛教史》· 季羡林《佛教与中印文化交流》"
  }
]

export const THINKER_REGIONS = [
  { id: 'china', label: '中国', color: '#c89a5b' },
  { id: 'greece', label: '古希腊', color: '#5b9bc8' },
  { id: 'india', label: '古印度', color: '#b85450' },
  { id: 'europe', label: '欧洲', color: '#9b7eb6' },
  { id: 'middle-east', label: '中东', color: '#d4a85b' },
  { id: 'modern', label: '现代', color: '#5bc89a' },
] as const

export type ThinkerRegion = typeof THINKER_REGIONS[number]['id']
