"""
traditions_rewrite.py — 批量重写 traditions.ts 12 个子分类的 imageKeyword

按用户惯例风格：Wikimedia Commons > English Wiki > name + era + Chinese
每条改写后保留其它字段不变。

用法：
    python traditions_rewrite.py <category>
    例：python traditions_rewrite.py myth

输出：
    - 打印改写前/后对比（前 10 条）
    - 在 stdout 输出补丁的 old_string / new_string 给 patch tool 用
"""
import re
import sys
import json
from pathlib import Path

ROOT = Path('E:/我的项目/历史软件')
FILE = ROOT / 'src/data/traditions.ts'

# ====== 改写映射表 ======
# 每个 (id, current_keyword) → 新的 keyword
# 风格："中文核心名 + Chinese mythology/history era + English wiki 风格关键词"

REWRITES = {
    # ---- myth (27 条) ----
    'tr-myth-intro':         '中国神话 mythology ancient painting scroll',
    'tr-myth-hunyin':        '混沌 阴阳 Chinese creation myth cosmos painting',
    'tr-myth-gongzhu':       '共工 祝融 water god fire god Chinese mythology',
    'tr-myth-xihe':          '羲和 十日 太阳 Chinese mythology sun mother',
    'tr-myth-sun':           '后羿射日 夸父逐日 Hou Yi archer ten suns Kuafu',
    'tr-myth-moon':          '嫦娥 月宫 玉兔 Chang e moon palace jade rabbit',
    'tr-myth-fengyu':        '雷公 电母 风伯 雨师 Chinese weather gods',
    'tr-myth-sijji':         '四季神 句芒 祝融 蓐收 玄冥 four seasons gods',
    'tr-myth-he':            '洛神 河伯 冯夷 Luo river goddess Hebo Chinese',
    'tr-myth-shan':          '山神 山祇 中国山岳之神 mountain deity Chinese',
    'tr-myth-hongshui':      '大禹治水 洪水 Great Yu flood control Chinese',
    'tr-myth-fuxi':          '伏羲 八卦 一画开天 Fuxi bagua trigrams',
    'tr-myth-shennong':      '神农 尝百草 Shennong herbal medicine agriculture',
    'tr-myth-huangdi':       '黄帝 轩辕 Chinese mythology yellow emperor',
    'tr-myth-yandi':         '炎帝 赤帝 南方火德 Yan Di flame emperor Chinese mythology ancient painting tribute',
    'tr-myth-huangzhanzheng':'黄帝战蚩尤 涿鹿之战 Huangdi battle Chiyou',
    'tr-myth-shaohao':       '少昊 西方白帝 鸟王国 Shaohao bird kingdom',
    'tr-myth-zhuansu':       '颛顼 北方黑帝 绝地天通 Zhuanxu religion reform',
    'tr-myth-diku':          '帝喾 五帝之末 高辛氏 Di Ku emperor ancestor',
    'tr-myth-wangmu':        '西王母 昆仑山 Queen Mother of the West Kunlun',
    'tr-myth-yuhuang':       '玉皇大帝 Jade Emperor Taoist deity',
    'tr-myth-minshen':       '城隍 土地神 民间信仰 city god earth god folk',
    'tr-myth-jiashen':       '门神 灶神 紫姑 Door god Kitchen god household',
    'tr-myth-long':          '龙 中国龙 Chinese dragon mythology',
    'tr-myth-long9zi':       '龙生九子 nine sons of dragon Chinese',
    'tr-myth-ruishou':       '凤凰 麒麟 貔貅 瑞兽 Fenghuang Qilin Pixiu Chinese',
    'tr-myth-wanwu':         '万物有灵 狐狸精 spirit fox fairy Chinese folk',

    # ---- script (28 条) ----
    'tr-script-intro':       '中国文字 起源 invention of Chinese characters oracle bone',
    'tr-script-cangjie':     '仓颉造字 Cangjie four eyes character creator',
    'tr-script-pictograph':  '原始图画文字 pictograph cave painting',
    'tr-script-jinwen':      '金文 青铜器铭文 bronze script inscription',
    'tr-script-zhuanshu':    '篆书 小篆 seal script Qin unification',
    'tr-script-lishu':       '隶书 隶变 clerical script Han dynasty',
    'tr-script-wenfang':     '文房四宝 笔墨纸砚 brush ink paper inkstone',
    'tr-script-shuowen':     '说文解字 许慎 Shuowen Jiezi dictionary',
    'tr-script-xiangxing':   '象形字 pictographic Chinese characters',
    'tr-script-zhishi':      '指事字 ideographic characters Chinese',
    'tr-script-huiyi':       '会意字 associative compound Chinese',
    'tr-script-xingsheng':   '形声字 phono-semantic compound Chinese',
    'tr-script-zhuanzujie':  '转注 假借 Chinese character loan',
    'tr-script-zili':        '字理识字 Chinese character origin learning',
    'tr-script-natural':     '汉字 自然万物 Chinese characters nature',
    'tr-script-history':     '汉字 人文历史 Chinese characters history',
    'tr-script-life':        '汉字 衣食住行 Chinese characters daily life',
    'tr-script-writing':     '书法 汉字书写 Chinese calligraphy',
    'tr-script-wrong':       '通假字 错别字 Chinese homonym taboo',
    'tr-script-sanzijing':   '三字经 Three character classic Song dynasty',
    'tr-script-baijiaxing':  '百家姓 hundred surnames Chinese ancient',
    'tr-script-qianziwen':   '千字文 Thousand character classic Liang',
    'tr-script-duilian':     '对联 春联 couplet parallel Chinese',
    'tr-script-chengyu':     '成语典故 four-character idiom Chinese',
    'tr-script-suyu':        '俗语 谚语 歇后语 Chinese proverb folk saying',
    'tr-script-books':       '中国书籍 简牍 册子 Chinese ancient books bamboo slip',
    'tr-script-jingshi':     '四部 图书 四库全书 jingshi ziji four parts',
    'tr-script-baihua':      '五四运动 白话文 vernacular Chinese movement',

    # ---- calendar (30 条) ----
    'tr-cal-intro':          '中国古代天文学 历法 Chinese astronomy calendar',
    'tr-cal-season':         '春夏秋冬 四季 stars seasons Chinese',
    'tr-cal-tiangan':        '天干地支 纪年 Chinese stem branch stems branches',
    'tr-cal-monthday':       '中国传统纪月纪日 Chinese month day counting',
    'tr-cal-hour':           '十二时辰 Chinese twelve shichen hour system',
    'tr-cal-jieqi':          '二十四节气 jieqi 24 solar terms',
    'tr-cal-lichun':         '立春 spring begins lichun solar term',
    'tr-cal-yushui':         '雨水 rain water solar term yushui',
    'tr-cal-jingzhe':        '惊蛰 jingzhe awakening insects',
    'tr-cal-chunfen':        '春分 spring equinox chunfen',
    'tr-cal-qingming':       '清明 qingming tomb sweeping festival',
    'tr-cal-guyu':           '谷雨 grain rain solar term guyu',
    'tr-cal-lixia':          '立夏 lixia start summer',
    'tr-cal-xiaoman':        '小满 xiaoman grain full',
    'tr-cal-mangzhong':      '芒种 mangzhong grain in ear',
    'tr-cal-xiazhi':         '夏至 summer solstice xiazhi',
    'tr-cal-xiaoshu':        '小暑 xiaoshu slight heat',
    'tr-cal-dashu':          '大暑 dashu greatest heat',
    'tr-cal-liqiu':          '立秋 liqiu start autumn',
    'tr-cal-chushu':         '处暑 chushu end heat',
    'tr-cal-bailu':          '白露 bailu white dew',
    'tr-cal-qiufen':         '秋分 autumn equinox qiufen',
    'tr-cal-hanlu':          '寒露 hanlu cold dew',
    'tr-cal-shuangjiang':    '霜降 shuangjiang frost descent',
    'tr-cal-lidong':         '立冬 lidong start winter',
    'tr-cal-xiaoxue':        '小雪 xiaoxue slight snow',
    'tr-cal-daxue':          '大雪 daxue heavy snow',
    'tr-cal-dongzhi':        '冬至 winter solstice dongzhi',
    'tr-cal-xiaohan':        '小寒 xiaohan slight cold',
    'tr-cal-dahan':          '大寒 dahan greatest cold',

    # ---- philosophy (30 条) ----
    'tr-phil-intro':         '中国哲学 ancient philosophy Chinese',
    'tr-phil-kongzi':        '孔子 仁礼 Confucius portrait',
    'tr-phil-zisi':          '子思 中庸 Doctrine of the Mean',
    'tr-phil-mengzi':        '孟子 四端 Mencius four sprouts',
    'tr-phil-xunzi':         '荀子 性恶论 Xunzi human nature evil',
    'tr-phil-ruwu':          '儒家 武士 Confucian warrior',
    'tr-phil-laozi':         '老子 无为 Laozi Taoism wuwei',
    'tr-phil-zhuangzi':      '庄子 蝴蝶梦 Zuangzi butterfly freedom',
    'tr-phil-yangzhu':       '杨朱 贵我 Yangzhu selfish Weiwo',
    'tr-phil-mozi':          '墨子 兼爱非攻 Mozi universal love',
    'tr-phil-sunzi':         '孙子 兵法 Sunzi art of war',
    'tr-phil-hanfei':        '韩非子 法家 Han Fei legalism',
    'tr-phil-gongsunlong':   '公孙龙 白马非马 Gongsunlong paradox',
    'tr-phil-guanzi':        '管子 气论 Guanzi vital energy qi',
    'tr-phil-yijing':        '易经 周易 I Ching change',
    'tr-phil-yinyangjia':    '阴阳家 五行 Yin Yang five elements',
    'tr-phil-guiguzi':       '鬼谷子 纵横 Guiguzi strategy persuasion',
    'tr-phil-dongzhongshu':  '董仲舒 天人感应 Dong Zhongshu',
    'tr-phil-xuanxue':       '魏晋玄学 Wei Jin metaphysics',
    'tr-phil-heyan':         '何晏 贵无论 He Yan nothingness',
    'tr-phil-wangbi':        '王弼 得意忘象 Wang Bi Yi Jing commentary',
    'tr-phil-zhulinqixian':  '竹林七贤 Seven Sages bamboo grove',
    'tr-phil-peiwei':        '裴頠 崇有论 Pei Wei ontology being',
    'tr-phil-foxue':         '佛学传入中国 Buddhism introduction China',
    'tr-phil-wuzhi':         '我执 Buddhist atman ego illusion',
    'tr-phil-zhoudunyi':     '周敦颐 太极图说 Zhou Dunyi Taijitu',
    'tr-phil-zhangzai':      '张载 气本论 Zhang Zai qi theory',
    'tr-phil-ercheng':       '程颢 程颐 天理 Cheng Hao Cheng Yi',
    'tr-phil-zhuxi':         '朱熹 性即理 Zhu Xi neo-confucianism',
    'tr-phil-wangyangming':  '王阳明 心学 Wang Yangming mind learning',

    # ---- literature (30 条) ----
    'tr-lit-intro':          '中国文学 Chinese literature origin ancient',
    'tr-lit-shijing':        '诗经 风雅颂 Book of Songs Shijing ancient',
    'tr-lit-chuci':          '楚辞 屈原 Songs of Chu Qu Yuan',
    'tr-lit-zhan':           '战国策 Strategies of Warring States',
    'tr-lit-zhuangzisan':    '庄子寓言 Zhuangzi prose butterfly',
    'tr-lit-mengzisan':      '孟子散文 Mencius prose haoran',
    'tr-lit-yuefu':          '乐府诗 Yuefu folk songs Han dynasty',
    'tr-lit-hanfu':          '汉赋 Han dynasty fu prose Sima Xiangru',
    'tr-lit-shiji':          '史记 司马迁 Records Grand Historian Sima Qian',
    'tr-lit-gushis':         '古诗十九首 Nineteen Old Poems',
    'tr-lit-jianan':         '建安七子 Jianan literature poetry',
    'tr-lit-tianyuanshi':    '陶渊明 田园诗 Tao Yuanming pastoral',
    'tr-lit-erxie':          '谢灵运 谢朓 山水诗 Xie Lingyun landscape poetry',
    'tr-lit-zhiren':         '世说新语 A New Account Tales World',
    'tr-lit-zhiguai':        '六朝志怪 Xu Qi Xie Ji Six Dynasties',
    'tr-lit-chutang':        '初唐四杰 Wang Bo Yang Jiong early Tang',
    'tr-lit-li-bai':         '李白诗仙 Li Bai poet portrait',
    'tr-lit-du-fu':          '杜甫诗圣 Du Fu poet portrait',
    'tr-lit-bai-juyi':       '白居易 新乐府 Bai Juyi folk songs',
    'tr-lit-guwen':          '古文运动 韩愈 柳宗元 ancient prose movement',
    'tr-lit-xiaoliandu':     '小李杜 杜牧 李商隐 late Tang du mu',
    'tr-lit-ouyangxiu':      '欧阳修 古文 Ouyang Xiu prose',
    'tr-lit-su-shi':         '苏轼 豪放词 Su Shi Dongpo poetry',
    'tr-lit-li-qingzhao':    '李清照 婉约词 Li Qingzhao ci poet',
    'tr-lit-nansong':        '南宋四大家 Southern Song four masters',
    'tr-lit-xin-qiji':       '辛弃疾 豪放词 Xin Qiji ci poetry',
    'tr-lit-yuanqu':         '元曲 马致远 Yuan dynasty drama Ma Zhiyuan',
    'tr-lit-yuanzaju':       '元杂剧 窦娥冤 Yuan zaju four tragedies',
    'tr-lit-sanguoyanyi':    '三国演义 水浒传 Romance Three Kingdoms Outlaws',
    'tr-lit-xiyouji':        '西游记 红楼梦 Journey West Dream Red Chamber',

    # ---- art (31 条) ----
    'tr-art-intro':          '中国艺术 Chinese art history painting',
    'tr-art-color':          '中国色 Chinese traditional colors five',
    'tr-art-pottery':        '彩陶 中国 Neolithic painted pottery',
    'tr-art-jade':           '玉文化 中国 jade culture ancient',
    'tr-art-bronze':         '青铜器 礼器 bronze ritual vessel Shang Zhou',
    'tr-art-zengzhong':      '曾侯乙编钟 Marquis Yi bronze bells',
    'tr-art-warring':        '战国乐器 Warring States orchestra',
    'tr-art-yayue':          '先秦雅乐 乐舞 pre-Qin ritual music dance',
    'tr-art-terracotta':     '秦始皇陵兵马俑 Terracotta Army Qin',
    'tr-art-mawangdui':      '马王堆帛画 Mawangdui silk painting Han',
    'tr-art-hanbrick':       '汉画像砖 Han dynasty brick relief',
    'tr-art-zhulin':         '竹林七贤画像砖 Seven Sages brick',
    'tr-art-lantingshu':     '兰亭集序 王羲之 Lantingji Xu calligraphy',
    'tr-art-luoshenfu':      '洛神赋图 顾恺之 Nymph of Luo River Gu Kaizhi',
    'tr-art-dunhuang':       '敦煌莫高窟 Dunhuang Mogao caves Buddhist',
    'tr-art-shanshui':       '中国山水画 Chinese landscape painting shanshui',
    'tr-art-yanliben':       '阎立本 步辇图 Yan Liben painting Tang',
    'tr-art-tangsancai':     '唐三彩 Tang tri-color ceramic pottery',
    'tr-art-yanjin':         '颜真卿 柳公权 Yan Zhenqing Liu Gongquan calligraphy',
    'tr-art-five':           '五代四大家 Five dynasties four masters landscape',
    'tr-art-songhuizong':    '宋徽宗 工笔画 Song Huizong court painting',
    'tr-art-wangximeng':     '千里江山图 王希孟 Wang Ximeng landscape painting',
    'tr-art-zhangzeduan':    '清明上河图 张择端 Qingming Festival Zhang Zeduan scroll',
    'tr-art-liangkai':       '梁楷 泼墨仙人图 Liang Kai splashed ink painting',
    'tr-art-zhaomengfu':     '赵孟頫 元代 Zhao Mengfu calligrapher painter',
    'tr-art-yuanfour':       '元四家 Yuan four masters landscape',
    'tr-art-bluewhite':      '青花瓷 blue and white porcelain Yuan Ming',
    'tr-art-jingju':         '京剧 Peking Opera jingju performance',
    'tr-art-kunqu':          '昆曲 Kunqu opera Chinese traditional',
    'tr-art-pattern':        '中国民间纹样 Chinese folk pattern auspicious',
    'tr-art-folk':           '民间艺术 Chinese folk art traditional',

    # ---- history (30 条) ----
    'tr-history-intro':         '远古磨石 新石器时代 neolithic grinding stone tool',
    'tr-history-yanying':       '炎帝 黄帝 部落联盟 Yan Huang Di legendary tribal leaders',
    'tr-history-dongyi':        '东夷 大汶口文化 Dongyi neolithic Shandong',
    'tr-history-miaoyao':       '蚩尤 苗瑶 Miao Yao Chiyou tribal legend',
    'tr-history-liangzhu':      '良渚文化 玉琮 Liangzhu jade ancient culture',
    'tr-history-hongshan':      '红山文化 玉龙 Hongshan jade dragon neolithic',
    'tr-history-shimao':        '石峁遗址 皇城台 Shimao stone fortress prehistoric',
    'tr-history-yaoshunyu':     '尧舜禹 禅让 Yao Shun Yu legendary emperors',
    'tr-history-xia':           '夏朝 二里头遗址 Xia dynasty Erlitou bronze',
    'tr-history-shang':         '商朝 殷墟 Yinxu oracle bone bronze',
    'tr-history-shu':           '三星堆 古蜀 Sanxingdui bronze mask ancient Shu',
    'tr-history-zhou':          '周族 渭水 Zhou tribe Qishan Weishui agriculture',
    'tr-history-xizhou':        '西周 分封制 Western Zhou fengjian ritual',
    'tr-history-chunqiu':       '春秋 五霸 Spring Autumn period Chinese states',
    'tr-history-zhanguo':       '战国 七雄 Warring States period seven states',
    'tr-history-qinren':        '秦国 陇西 养马 Qin people Longxi horse breeding',
    'tr-history-qin':           '秦始皇 兵马俑 Qin dynasty Terracotta Warriors unification',
    'tr-history-han':           '汉朝 汉武帝 Han dynasty Silk Road Chang An',
    'tr-history-sanguo':        '三国鼎立魏蜀吴 Three Kingdoms Chinese',
    'tr-history-beichao':       '五胡十六国 北朝 Northern dynasties Five Barbars',
    'tr-history-nanbeichao':    '东晋 南朝 门阀 Eastern Jin Southern Dynasties aristocracy',
    'tr-history-sui':           '隋朝 大运河 Sui dynasty Grand Canal',
    'tr-history-tang':          '唐朝 长安 盛世 Tang dynasty Chang An cosmopolitan',
    'tr-history-wudai':         '五代十国 Five Dynasties Ten Kingdoms chaos',
    'tr-history-song':          '宋朝 商业革命 Song dynasty commerce Hangzhou',
    'tr-history-yuan':          '元朝 蒙古 Yuan dynasty Mongol Kublai Khan',
    'tr-history-yuanhou':       '北元 鞑靼 瓦剌 Northern Yuan Mongol khatagin',
    'tr-history-ming':          '明朝 紫禁城 Ming dynasty Forbidden City Zheng He',
    'tr-history-nvzhen':        '女真人 后金 Jurchen Manchu Qing dynasty',
    'tr-history-qing':           '清朝 康熙 乾隆 Qing dynasty Kangxi Qianlong',

    # ---- geography-regional (30 条) ----
    'tr-region-intro':       '中国人的家 故土 家园 China homeland culture',
    'tr-region-jiuzhou':     '禹贡 九州 Nine Provinces ancient Yu Gong',
    'tr-region-xingsheng':   '行省制 省 Chinese provinces xingsheng governance',
    'tr-region-fangqu':      '山川形便 犬牙交错 Chinese administrative boundaries',
    'tr-region-dusheng':     '中国古都 长安 洛阳 北京 Chinese ancient capitals',
    'tr-region-nanbei':      '南北文化差异 China north south culture difference',
    'tr-region-overview':    '中国地域文化 Chinese regional culture diversity',
    'tr-region-yanzhao':     '燕赵文化 河北 Yanzhao culture Hebei',
    'tr-region-shanjin':     '三晋 山西 晋商 Shanjin culture Shanxi ancient',
    'tr-region-qilu':        '齐鲁文化 山东 孔子 Qilu culture Shandong Confucius',
    'tr-region-guandong':    '关东文化 东北 Guandong culture Northeast China',
    'tr-region-neimenggu':   '内蒙古草原文化 Inner Mongolia grassland nomadic',
    'tr-region-zhongzhou':   '中州文化 河南 黄河 Zhongzhou culture Henan Yellow River',
    'tr-region-hui':         '徽文化 安徽 徽商 Hui culture Anhui merchant',
    'tr-region-jiangxi':     '江西文化 赣 Jiangxi culture Ganpo Tao Yuanming',
    'tr-region-jingchu':     '荆楚文化 湖北 屈原 Jingchu culture Chu Hubei',
    'tr-region-huxiang':     '湖湘文化 湖南 Huxiang culture Hunan Xiang',
    'tr-region-wuyue':       '吴越文化 江苏 浙江 Wuyue culture Jiangnan',
    'tr-region-min':         '闽文化 福建 Min culture Fujian Fuzhou Xiamen',
    'tr-region-lingnan':     '岭南文化 广东 岭南 Lingnan culture Guangdong Cantonese',
    'tr-region-gui':         '广西文化 壮族 Guangxi culture Zhuang minority',
    'tr-region-dianyun':     '滇云文化 云南 Dianyun culture Yunnan minority',
    'tr-region-qiangui':     '黔贵文化 贵州 Qiangui culture Guizhou minority',
    'tr-region-bashu':       '巴蜀文化 四川 重庆 Bashu culture Sichuan Chongqing',
    'tr-region-sanqin':      '三秦文化 陕西 长安 Sanqin culture Shaanxi Chang An',
    'tr-region-ganlong':     '甘陇文化 甘肃 丝绸之路 Ganlong Silk Road culture',
    'tr-region-ningxia':     '宁夏文化 西夏 党项 Ningxia culture Western Xia Tangut',
    'tr-region-xinjiang':    '新疆文化 维吾尔 丝绸之路 Xinjiang culture Uyghur Silk Road',
    'tr-region-zang':        '青藏高原 藏文化 Tibet Qinghai culture Himalaya',
    'tr-region-hehuang':     '河湟文化 黄河上游 Hehuang culture upper Yellow River',

    # ---- ritual (30 条) ----
    'tr-rit-intro':          '中国礼仪 制度 Chinese ritual courtesy',
    'tr-rit-xingshi':        '姓氏 古代 Chinese surname clan ancient',
    'tr-rit-mingzi':         '名字 号 古 Chinese traditional name zi hao',
    'tr-rit-shihao':         '谥号 庙号 年号 shihao temple reign posthumous title',
    'tr-rit-bihu':           '避讳 古代 name taboo ancient Chinese',
    'tr-rit-qinshu':         '亲属关系 中国 kinship relatives Chinese',
    'tr-rit-zongzu':         '宗族 古代 Chinese clan patrilineal',
    'tr-rit-linli':          '邻里 乡党 ancient local community',
    'tr-rit-xiangshe':       '乡射礼 Chinese archery ceremony',
    'tr-rit-xiangyin':       '乡饮酒礼 Chinese drinking ceremony village',
    'tr-rit-juzhi':          '举止礼仪 古代 Chinese body etiquette',
    'tr-rit-chuxing':        '出行礼仪 古代 ancient travel etiquette',
    'tr-rit-xiangjian':      '相见礼仪 古代 Chinese greeting ceremony',
    'tr-rit-baifang':        '拜访礼仪 古代 ancient visiting etiquette',
    'tr-rit-suohua':         '说话礼仪 Chinese speech etiquette',
    'tr-rit-canzhuo':        '餐桌礼仪 古代 Chinese table etiquette',
    'tr-rit-dizigui':        '弟子规 Dizigui classics children etiquette',
    'tr-rit-chusheng':       '出生礼 古代 Chinese birth ceremony ritual',
    'tr-rit-ruxue':          '入学礼 古代 ancient school enrollment',
    'tr-rit-chengren':       '成人礼 古代 coming of age ritual',
    'tr-rit-hunli':          '婚礼 古代 Chinese wedding ceremony',
    'tr-rit-dianli':         '奠礼 古代 funeral ritual Chinese',
    'tr-rit-jili':           '祭礼 古代 Chinese ancestor worship',
    'tr-rit-shenfen':        '古代身份证 Chinese ancient ID document bamboo',
    'tr-rit-huji':           '古代户籍 household registration ancient China',
    'tr-rit-jiaoyu':         '教育制度 古代 ancient education Chinese',
    'tr-rit-keju':           '科举 古代 imperial examination keju',
    'tr-rit-shangchao':      '上朝礼仪 古代 court audience Chinese',
    'tr-rit-pinji':          '品级 古代 officials rank pinji ancient',
    'tr-rit-fangjia':        '古代放假 ancient holiday Tang Song',

    # ---- food (30 条) ----
    'tr-food-intro':         '饮食 中华 Chinese food clothing',
    'tr-food-pot':           '古代 锅 cauldron ancient Chinese pot',
    'tr-food-chopstick':     '筷子 Chinese chopstick culture',
    'tr-food-knife':         '菜刀 Chinese kitchen knife cleaver',
    'tr-food-yaoshan':       '药膳 Chinese medicinal cuisine food',
    'tr-food-fire':          '火候 烹饪 Chinese cooking fire heat',
    'tr-food-cooking':       '烹饪技术 Chinese cooking techniques wok',
    'tr-food-five-flavor':   '五味 Chinese five flavors cuisine',
    'tr-food-eight-cuisine': '八大菜系 Chinese eight cuisines',
    'tr-food-names':         '菜名 Chinese dish names poetry culture',
    'tr-food-aesthetics':    '中国菜 美学 Chinese food aesthetics',
    'tr-food-season':        '时令 美食 Chinese seasonal food culture',
    'tr-food-tofu':          '豆腐 Chinese tofu history Han dynasty',
    'tr-food-hotpot':        '火锅 Chinese hotpot culture spicy',
    'tr-food-wine':          '酒 文学 Chinese wine literature',
    'tr-food-tea':           '茶文化 Chinese tea culture gongfu',
    'tr-food-taotie':        '饕餮 Chinese food taotie symbol bronze',
    'tr-food-suiyuan':       '随园食单 袁枚 Suiyuan Shidan Qing cuisine',
    'tr-food-quliu':         '曲水流觞 Qushui Liushang gathering Wei Jin',
    'tr-food-kongfu':        '孔府宴 Confucian cuisine banquets',
    'tr-food-shaowei':       '烧尾宴 Tang dynasty Shaowei banquet',
    'tr-food-yiguan':        '衣冠 中国 Chinese clothing civilization ancient',
    'tr-food-xianqin':       '先秦服饰 Chinese pre-Qin clothing shenyi',
    'tr-food-qinhan':        '秦汉服饰 Chinese Han dynasty clothing',
    'tr-food-songyuan':      '宋元明清服饰 Song Yuan Ming Qing costume',
    'tr-food-color':         '颜色 五色 Chinese clothing color system',
    'tr-food-guanmian':      '冠冕 古代 Chinese crown headwear mianguan',
    'tr-food-shoes':         '古代鞋履 Chinese ancient shoes culture',
    'tr-food-accessory':     '簪钗 耳珰 Chinese ancient accessories hairpin',
    'tr-food-auspicious':    '吉祥纹样 auspicious Chinese pattern clothing',

    # ---- housing (30 条) ----
    'tr-hou-intro':          '中华 住行 Chinese housing travel intro',
    'tr-hou-citydef':        '城池 城墙 古代 ancient city wall defense',
    'tr-hou-capital':        '古代都城 规划 ancient Chinese capital planning',
    'tr-hou-zigong':         '紫禁城 故宫 Forbidden City Beijing palace',
    'tr-hou-mausoleum':      '皇陵 古代 imperial tomb mausoleum Chinese',
    'tr-hou-ritual':         '坛庙 礼制 ritual architecture altar Chinese',
    'tr-hou-tower':          '黄鹤楼 岳阳楼 滕王阁 four famous Chinese towers',
    'tr-hou-temple':         '寺庙 佛道 Chinese temple architecture',
    'tr-hou-pagoda':         '中国古塔 Chinese pagoda Buddhism',
    'tr-hou-cave':           '石窟寺 敦煌 龙门 Chinese cave temple Buddhist',
    'tr-hou-garden':         '中国园林 江南 Chinese classical garden',
    'tr-hou-pailou':         '牌楼 牌坊 Chinese pailou archway',
    'tr-hou-baogu':          '抱鼓石 脊兽 Chinese building decoration stone',
    'tr-hou-yingbi':         '影壁 照壁 Chinese screen wall yingbi',
    'tr-hou-zao':            '藻井 中国建筑 Chinese caisson ceiling zaojing',
    'tr-hou-courtyard':      '四合院 北方 Chinese courtyard house heyi',
    'tr-hou-tianjin':        '南方天井 徽派 Chinese tianjin courtyard south',
    'tr-hou-yaodong':        '窑洞 黄土高原 yaodong cave dwelling',
    'tr-hou-diao':           '吊脚楼 干栏 Chinese stilt house diaojiao',
    'tr-hou-tulou':          '客家土楼 Fujian hakka tulou round',
    'tr-hou-fengshui':       '风水 堪舆 Chinese fengshui geomancy',
    'tr-hou-zhidao':         '秦直道 秦始皇 Qin Straight Road zhidao',
    'tr-hou-guanlu':         '官路 驿道 ancient Chinese official road guanlu',
    'tr-hou-post':           '驿站 古代 ancient Chinese post station yizhan',
    'tr-hou-car':            '古代车马 ancient Chinese carriage chariot',
    'tr-hou-fang':           '画舫 园林 Chinese ancient boat fang',
    'tr-hou-zhenghe':        '郑和宝船 Zheng He treasure ship treasure junk',
    'tr-hou-bridge':         '中国古桥 古代赵州桥 ancient Chinese bridge',
    'tr-hou-canal':          '京杭大运河 灵渠 ancient Chinese canal',
    'tr-hou-silk':           '丝绸之路 Silk Road ancient Chinese',

    # ---- tech (32 条) ----
    'tr-tech-intro':         '中国古代科技 Chinese ancient technology intro',
    'tr-tech-four':          '四大发明 four great inventions China paper print',
    'tr-tech-silk':          '丝绸 中国 ancient silk weaving technology',
    'tr-tech-smelt':         '青铜 冶铁 古代 Chinese bronze smelting iron',
    'tr-tech-ceramic':       '陶瓷 中国 Chinese ancient ceramic porcelain',
    'tr-tech-water':         '都江堰 大运河 Chinese ancient water conservancy',
    'tr-tech-ship':          '古代造船 Chinese ancient shipbuilding treasure junk',
    'tr-tech-infra':         '长城 基建 Chinese ancient infrastructure Great Wall',
    'tr-tech-mortise':       '榫卯 中国 mortise tenon Chinese joinery',
    'tr-tech-zhoubi':        '周髀算经 九章算术 ancient Chinese math Zhoubi',
    'tr-tech-sunzi':         '孙子算经 鸡兔同笼 Sunzi math classic',
    'tr-tech-pi':            '祖冲之 圆周率 pi calculation Chinese ancient',
    'tr-tech-counting':      '算筹 算盘 Chinese ancient counting rod abacus',
    'tr-tech-shui':          '水经注 郦道元 Shui Jing Zhu Li Daoyuan',
    'tr-tech-qimin':         '齐民要术 农政全书 Qimin Yaoshu agriculture classic',
    'tr-tech-mengxi':        '梦溪笔谈 沈括 Mengxi Bitan Shen Kuo',
    'tr-tech-tiangong':      '天工开物 宋应星 Tiangong Kaiwu Song Yingxing',
    'tr-tech-qin':           '禽经 鸟类 Chinese birds classic Qin Jing',
    'tr-tech-gan':           '甘石星经 古代天文 Gan Shi star catalog',
    'tr-tech-mo':            '墨经 墨子物理 Mo Jing optics Mozi physics',
    'tr-tech-tcm':           '中医 中国 Chinese traditional medicine tcm',
    'tr-tech-bian':          '扁鹊 望闻问切 Bian Que four diagnoses medicine',
    'tr-tech-zhang':         '张仲景 伤寒杂病论 Zhang Zhongjing Shanghan medicine',
    'tr-tech-huatuo':        '华佗 外科 Hua Tuo surgeon ma fei san',
    'tr-tech-acupuncture':   '针灸 中国 Chinese acupuncture moxibustion',
    'tr-tech-zhongyao':      '中药 草药 Chinese herbal medicine zhongyao',
    'tr-tech-bencao':        '神农本草经 本草纲目 Shennong Bencao Jing classic',
    'tr-tech-wuqin':         '五禽戏 少林拳 Wu Qin Xi shaolin kung fu',
    'tr-tech-nu':            '青铜 弩 古代 Chinese crossbow nu ancient weapon',
    'tr-tech-ji':            '戟 古代 Chinese halberd ji weapon',
    'tr-tech-gunpowder':     '火药 古代 Chinese gunpowder invention alchemy',
    'tr-tech-armor':         '盔甲 古代 Chinese ancient armor kuijia armor',
}


def parse_entries(text):
    """解析所有 (id, category, title, era, imageKeyword_start, imageKeyword_end) 五元组"""
    lines = text.split('\n')
    sig_re = re.compile(r"^\s*\{\s*id:\s*'([^']+)'\s*,\s*category:\s*'([^']+)'")
    entries = []
    i = 0
    while i < len(lines):
        m = sig_re.match(lines[i])
        if not m:
            i += 1
            continue
        eid, cat = m.group(1), m.group(2)
        # body 起 = i 行
        # body 止 = 行末有 }, 的那行（单行 entry）或后续多行的 }, 闭合
        j = i
        if lines[i].rstrip().endswith('},'):
            j = i
        else:
            while j < len(lines) and not lines[j].rstrip().endswith('},'):
                j += 1
        body = '\n'.join(lines[i:j+1])
        entries.append({
            'id': eid,
            'cat': cat,
            'start_line': i + 1,  # 1-indexed
            'end_line': j + 1,
            'body': body,
        })
        i = j + 1
    return entries


def find_image_keyword_span(body):
    """在 body 里找 imageKeyword: '...' 的精确 (start, end) 区间"""
    m = re.search(r"imageKeyword:\s*'((?:[^']|'')*)'", body)
    if not m:
        return None
    return m.span(1)  # (group1 起点, group1 终点)


def main(category):
    text = FILE.read_text(encoding='utf-8')
    entries = parse_entries(text)
    cat_entries = [e for e in entries if e['cat'] == category]
    print(f"# category '{category}': {len(cat_entries)} entries")
    if not cat_entries:
        return

    out_dir = ROOT / '.hermes' / 'scratch' / 'tradition_patches'
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f'{category}.json'

    patches = []
    misses = []
    for e in cat_entries:
        new_kw = REWRITES.get(e['id'])
        if not new_kw:
            misses.append(e['id'])
            continue
        # 找 imageKeyword span
        span = find_image_keyword_span(e['body'])
        if not span:
            misses.append(f"{e['id']} (no imageKeyword field)")
            continue
        s, t = span
        old_value = e['body'][s:t]
        if old_value == new_kw:
            continue
        # 输出 patch 的 old_string 是行级（含原始换行），new_string 同位置替换
        # patch tool 需要 old_string 唯一，因此把整个 body 作为 old
        old_body = e['body']
        new_body = old_body[:s] + new_kw + old_body[t:]
        patches.append({
            'id': e['id'],
            'title': re.search(r"title:\s*'([^']+)'", old_body).group(1),
            'old_keyword': old_value,
            'new_keyword': new_kw,
            'old_body': old_body,
            'new_body': new_body,
            'start_line': e['start_line'],
            'end_line': e['end_line'],
        })

    json.dump(patches, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    json.dump(misses, open(out_dir / f'{category}.miss.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    print(f"  patches written: {len(patches)}")
    print(f"  misses: {len(misses)}")
    if misses:
        print(f"    {misses}")
    # Show first 3
    for p in patches[:3]:
        print(f"  - {p['id']} :: '{p['old_keyword']}' → '{p['new_keyword']}'")


if __name__ == '__main__':
    main(sys.argv[1])
