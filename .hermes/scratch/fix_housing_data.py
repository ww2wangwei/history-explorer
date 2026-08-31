"""
Rewrite housing_data_full.json:
1. Drop tr-hou-dian (typo)
2. Add tr-hou-zigong (Forbidden City)
3. Rewrite 8 entries with wrong titles to match traditions.ts
"""
import json
from pathlib import Path

PATH = Path('.hermes/scratch/housing_data_full.json')
data = json.loads(PATH.read_text(encoding='utf-8'))


def P(h, b): return {'type': 'paragraph', 'heading': h, 'body': b}
def C(h, b, v='info'): return {'type': 'callout', 'heading': h, 'body': b, 'variant': v}
def L(h, items): return {'type': 'list', 'heading': h, 'items': items}
def Q(text, cite=''): return {'type': 'quote', 'text': text, 'cite': cite}


# 1. Remove tr-hou-dian (typo)
if 'tr-hou-dian' in data:
    del data['tr-hou-dian']

# 2. Add tr-hou-zigong (Forbidden City)
data['tr-hou-zigong'] = {
    'facts': [
        {'label': '主题', 'value': '**穿越600年时光的紫禁城**'},
        {'label': '始建', 'value': '**明永乐四年 (AD 1406)**'},
        {'label': '建成', 'value': '**明永乐十八年 (AD 1420)**'},
        {'label': '规模', 'value': '**72 万平方米 / 8700 余间**'},
        {'label': '规制', 'value': '**前朝后寝 / 中轴对称**'},
        {'label': '地位', 'value': '**世界文化遗产 (1987)**'},
    ],
    'sections': [
        P('紫禁城的由来',
          '紫禁城 (故宫) 是明清两朝皇宫。明永乐四年 (AD 1406) 始建，永乐十八年 (AD 1420) 建成；24 年建成。占地 72 万平方米、房屋 8700 余间。明清 24 位皇帝在此居住执政 500 余年。'),
        C('为何称为\"紫禁城\"？',
          '\"紫禁城\"之名源于星象学。原因：紫微星 (北极星) 居天中，皇宫对应\"紫微\" (天子居所)；\"禁\"指禁卫森严；\"城\"指城垣。所以\"紫禁城\"是\"天上紫微垣\"在人间之映射。'),
        P('\"前朝后寝\"如何布局？',
          '故宫布局\"前朝后寝\"：前朝 (南部) — 文武百官上朝理政；三大殿 (太和殿、中和殿、保和殿)；后寝 (北部) — 帝后生活；后三宫 (乾清宫、交泰殿、坤宁宫)。'),
        L('紫禁城六大特点', [
            '**中轴对称** — 全城 7.8 公里中轴线 (永定门 → 钟鼓楼)',
            '**前朝后寝** — 南部\"三大殿\"、北部\"后三宫\"',
            '**红墙黄瓦** — 红 (火、光明)、黄 (土、皇权)',
            '**等级森严** — 屋顶形式、开间数严格按等级',
            '**木构为主** — 纯木结构，榫卯连接，无钉',
            '**园林融合** — 御花园、慈宁宫花园',
        ]),
        P('紫禁城为何成为世界文化遗产？',
          '紫禁城 1987 年列入世界文化遗产。原因：规模 (世界最大宫殿)、历史 (明清 500 年)、艺术 (建筑、雕塑、书画、珍宝)、研究 (建筑史、艺术史、政治史)。故宫是中华文明的最高结晶。'),
        Q('**紫禁城，红墙黄瓦，600 年风雨，依然屹立**。', '中华建筑评论'),
    ],
    'timeline': [
        {'year': 'AD 1406', 'era': '明', 'event': '**明永乐四年** 始建紫禁城'},
        {'year': 'AD 1420', 'era': '明', 'event': '**明永乐十八年** 建成'},
        {'year': 'AD 1421', 'era': '明', 'event': '**明永乐十九年** 朱棣迁都北京'},
        {'year': 'AD 1644', 'era': '清', 'event': '**清军入关** 紫禁城延续'},
        {'year': 'AD 1912', 'era': '清末', 'event': '**末代皇帝溥仪退位**'},
        {'year': 'AD 1925', 'era': '民国', 'event': '**故宫博物院** 成立'},
        {'year': 'AD 1949', 'era': '当代', 'event': '**中华人民共和国** 保护故宫'},
        {'year': 'AD 1987', 'era': '当代', 'event': '**紫禁城** 列入世界文化遗产'},
    ],
    'images': [
        {'imageKeyword': 'forbidden city beijing aerial', 'caption': '紫禁城俯瞰', 'credit': 'photo tradition'},
        {'imageKeyword': 'taihe palace throne hall', 'caption': '太和殿 (前朝核心)', 'credit': 'photo tradition'},
        {'imageKeyword': 'forbidden city corner tower', 'caption': '角楼 (防御)', 'credit': 'photo tradition'},
    ],
    'related': [
        {'id': 'tr-hou-intro', 'title': '中华建筑', 'reason': '宫殿是建筑最高类型'},
        {'id': 'tr-hou-capital', 'title': '都城规划', 'reason': '明清北京都城核心'},
        {'id': 'tr-hou-ritual', 'title': '礼制建筑', 'reason': '前朝礼仪'},
        {'id': 'tr-hou-citydef', 'title': '城池防御', 'reason': '宫城防御'},
        {'id': 'tr-hou-baogu', 'title': '抱鼓石与蹲脊兽', 'reason': '故宫脊兽'},
        {'id': 'tr-hou-zao', 'title': '藻井', 'reason': '故宫藻井'},
    ],
    'source': '明史·舆服志、紫禁城 (单士元)、故宫 (黄仁宇)、中国宫殿建筑 (刘敦桢)',
}

# 3. Rewrite tr-hou-baogu (抱鼓石与蹲脊兽)
data['tr-hou-baogu'] = {
    'facts': [
        {'label': '主题', 'value': '**抱鼓石与蹲脊兽**'},
        {'label': '起源', 'value': '**汉代**'},
        {'label': '核心', 'value': '**门墩 + 屋脊兽**'},
        {'label': '代表', 'value': '**故宫蹲脊兽**'},
        {'label': '规制', 'value': '**\"五脊六兽\"**'},
        {'label': '意义', 'value': '**等级与装饰**'},
    ],
    'sections': [
        P('抱鼓石 (门墩)',
          '抱鼓石是门前圆鼓形石雕，分\"鼓\"与\"须弥座\"两部分。\"鼓\"象征武官 (圆鼓形)；\"须弥座\"承托。抱鼓石立于大门两侧，作为门框支撑、装饰、等级标志。'),
        C('抱鼓石的等级',
          '抱鼓石等级分明。原因：鼓上雕狮子 → 武官 (一品、二品)；鼓上雕瑞兽 → 文官；素面 (无雕) → 百姓。抱鼓石形制、用材、雕工严格按门第等级。'),
        P('蹲脊兽 (屋脊兽)',
          '蹲脊兽是屋脊上的装饰兽。\"仙人骑鸡\"打头；后随龙、凤、狮子、天马、海马、狻猊、押鱼、獬豸 (十种)。\"五脊六兽\"是最高规制 (太和殿十条蹲脊兽)。'),
        L('抱鼓石与蹲脊兽的功能', [
            '**等级标志** — 体现官阶与门第',
            '**辟邪压胜** — 镇宅护佑',
            '**装饰美化** — 屋脊与门面',
            '**结构加固** — 屋脊节点、门框支撑',
            '**文化符号** — 龙凤代表皇权',
            '**艺术价值** — 雕塑、雕刻艺术',
        ]),
        P('蹲脊兽的数量与等级',
          '蹲脊兽数量体现建筑等级。最高等级 (太和殿)：\"仙人骑鸡\"+ 10 蹲脊兽 (龙、凤、狮子、天马、海马、狻猊、押鱼、獬豸、行什)。二品：5 只；三品：3 只；百姓：1-2 只。'),
        Q('**抱鼓石守门，蹲脊兽镇脊**。', '中华建筑口诀'),
    ],
    'timeline': [
        {'year': 'BC 200', 'era': '西汉', 'event': '**门墩**雏形'},
        {'year': 'BC 100', 'era': '西汉', 'event': '**门阀**雕刻出现'},
        {'year': 'AD 600', 'era': '唐', 'event': '**抱鼓石**定型'},
        {'year': 'AD 1000', 'era': '宋', 'event': '**《营造法式》** 制度化'},
        {'year': 'AD 1400', 'era': '明', 'event': '**故宫**蹲脊兽'},
        {'year': '明清', 'era': '明清', 'event': '**抱鼓石**鼎盛'},
        {'year': 'AD 1900', 'era': '近代', 'event': '**建筑装饰**部分衰落'},
        {'year': '当代', 'era': '当代', 'event': '**传统装饰**复兴'},
    ],
    'images': [
        {'imageKeyword': 'chinese drum stone door pier', 'caption': '抱鼓石 (门墩)', 'credit': 'photo tradition'},
        {'imageKeyword': 'chinese roof ridge beast', 'caption': '蹲脊兽 (屋脊)', 'credit': 'photo tradition'},
        {'imageKeyword': 'imperial roof guardian animal', 'caption': '故宫太和殿蹲脊兽', 'credit': 'photo tradition'},
    ],
    'related': [
        {'id': 'tr-hou-intro', 'title': '中华建筑', 'reason': '抱鼓石是建筑构件'},
        {'id': 'tr-hou-zigong', 'title': '紫禁城', 'reason': '故宫蹲脊兽'},
        {'id': 'tr-hou-yingbi', 'title': '影壁', 'reason': '门内装饰'},
        {'id': 'tr-hou-pailou', 'title': '牌坊', 'reason': '其他装饰构件'},
        {'id': 'tr-hou-pagoda', 'title': '佛塔', 'reason': '塔脊兽'},
        {'id': 'tr-hou-fengshui', 'title': '风水', 'reason': '辟邪文化'},
    ],
    'source': '营造法式、清工部《工程做法则例》、抱鼓石研究 (刘敦桢)、蹲脊兽研究 (楼庆西)',
}

# 4. Rewrite tr-hou-guanlu (官路)
data['tr-hou-guanlu'] = {
    'facts': [
        {'label': '主题', 'value': '**官路 — 古人的国道**'},
        {'label': '起源', 'value': '**商周**'},
        {'label': '核心', 'value': '**驰道、驿道、官马大道**'},
        {'label': '代表', 'value': '**秦驰道**'},
        {'label': '宽度', 'value': '**6-10 米 (驰道)**'},
        {'label': '意义', 'value': '**国家交通命脉**'},
    ],
    'sections': [
        P('何谓\"官路\"？',
          '\"官路\"是官方修建与维护的道路网络。商周\"周道如砥\" — 周王室官道；秦\"驰道\" — 以咸阳为中心的全国公路网；汉\"驿道\"；唐\"驿路\" — 与驿站相连；宋\"官道\"；明清\"官马大道\"。'),
        C('\"周道如砥\"是什么意思？',
          '\"周道如砥\"出自《诗经·小雅》。意思：周王室的官道平坦如磨刀石 (砥)。\"如砥\" — 平坦；\"如矢\" — 端直。这是中华最早的\"高速公路\"概念，反映西周道路工程水平。'),
        P('秦\"驰道\"的规模',
          '秦\"驰道\"以咸阳为中心，向四面八方辐射。宽度：道广 50 步 (约 69 米)；中央\"御道\"专供皇帝；两侧植树 (青松)。\"驰道\"是秦代交通命脉，连接全国主要郡县。'),
        L('官路与驿站', [
            '**驿站** — 官路上的\"服务区\"，提供食宿换马',
            '**驿丞** — 驿站负责人，管理邮递、接待',
            '**驿马** — 驿站专用马匹，最高时速 200 里/日',
            '**驿符** — 通行证，凭符使用驿站',
            '**急脚递** — 紧急公文，昼夜兼程',
            '**铺递** — 普通公文，按站递送',
        ]),
        P('明清\"官马大道\"',
          '明清\"官马大道\"是官路集大成者。京杭\"官马大道\"连接北京与各省会；\"御路\"专供皇帝；\"官道\" — 省级；\"大路\" — 县级。官路上每隔 30-50 里设驿站。'),
        Q('**周道如砥，其直如矢**。', '诗经·小雅·大东'),
    ],
    'timeline': [
        {'year': 'BC 1000', 'era': '西周', 'event': '**\"周道\"** 官路雏形'},
        {'year': 'BC 220', 'era': '秦', 'event': '**\"驰道\"** 以咸阳为中心'},
        {'year': 'BC 100', 'era': '西汉', 'event': '**\"驿道\"** 发展'},
        {'year': 'AD 600', 'era': '唐', 'event': '**\"驿路\"** 与驿站结合'},
        {'year': 'AD 1000', 'era': '宋', 'event': '**\"官道\"** 制度化'},
        {'year': 'AD 1400', 'era': '明', 'event': '**\"官马大道\"** 系统化'},
        {'year': 'AD 1700', 'era': '清', 'event': '**官路**最完善'},
        {'year': 'AD 1900', 'era': '近代', 'event': '**铁路**冲击官路'},
    ],
    'images': [
        {'imageKeyword': 'ancient chinese imperial road', 'caption': '古代官路', 'credit': 'photo tradition'},
        {'imageKeyword': 'qin shi huang road map', 'caption': '秦驰道路网', 'credit': 'illustration tradition'},
        {'imageKeyword': 'ming dynasty post road', 'caption': '明代官马大道', 'credit': 'illustration tradition'},
    ],
    'related': [
        {'id': 'tr-hou-intro', 'title': '中华建筑', 'reason': '官路是基础设施'},
        {'id': 'tr-hou-zhidao', 'title': '秦直道', 'reason': '秦代\"高速公路\"'},
        {'id': 'tr-hou-post', 'title': '驿站', 'reason': '官路上的驿站'},
        {'id': 'tr-hou-silk', 'title': '丝绸之路', 'reason': '国际官路'},
        {'id': 'tr-hou-bridge', 'title': '桥梁', 'reason': '官路上的桥梁'},
        {'id': 'tr-hou-capital', 'title': '都城规划', 'reason': '都城与官路'},
    ],
    'source': '诗经·小雅、史记·秦始皇本纪、汉书·百官公卿表、中国古代道路交通史 (辛德勇)',
}

# 5. Rewrite tr-hou-tianjin (天井式民居)
data['tr-hou-tianjin'] = {
    'facts': [
        {'label': '主题', 'value': '**天井式民居 — 南方\"聚宝盆\"**'},
        {'label': '起源', 'value': '**汉代**'},
        {'label': '核心', 'value': '**\"四水归堂\"**'},
        {'label': '代表', 'value': '**徽派宏村西递**'},
        {'label': '分布', 'value': '**皖赣闽粤**'},
        {'label': '特色', 'value': '**粉墙黛瓦马头墙**'},
    ],
    'sections': [
        P('何谓\"天井式民居\"？',
          '\"天井式民居\"分布于南方 (皖南、江西、福建、广东)，与北方\"四合院\"对应。\"天井\"指屋面围合的小型露天空间；\"四水归堂\" — 四方之水归入院内，寓意\"财不外流\"。'),
        C('\"四水归堂\"是什么意思？',
          '\"四水归堂\"指四面屋顶雨水汇入院中天井。原因：南方多雨 — 天井可采光、通风、排水；\"财不外流\" — 雨水 (财) 归自家堂屋；徽商文化 — 聚财、聚气。'),
        P('徽派\"粉墙黛瓦马头墙\"',
          '徽派民居\"粉墙黛瓦马头墙\"。粉墙 (白色墙) — 朴素；黛瓦 (黑色瓦) — 稳重；马头墙 (防火墙) — 高出屋面、阶梯状，防止火势蔓延。代表：宏村、西递。'),
        L('天井式民居的类别', [
            '**徽派民居** (皖南) — 宏村、西递',
            '**赣派民居** (江西) — 流坑、婺源',
            '**闽派民居** (福建) — 客家围屋',
            '**粤派民居** (广东) — 镬耳屋',
            '**土楼** (广义) — 客家围楼',
            '**四水归堂** — 共性特点',
        ]),
        P('客家围屋与土楼',
          '客家围屋与土楼属于广义\"天井式\"。福建土楼 (圆形/方形) — 客家人聚族而居；江西围屋 — 方围；广东围龙屋 — 半月形。客家围屋中央为祖堂，天井居中。'),
        Q('**四水归堂，财不外流**。', '徽派民谚'),
    ],
    'timeline': [
        {'year': 'BC 100', 'era': '西汉', 'event': '**天井**雏形'},
        {'year': 'AD 600', 'era': '唐', 'event': '**南方民居**发展'},
        {'year': 'AD 1000', 'era': '宋', 'event': '**徽派** 雏形'},
        {'year': 'AD 1300', 'era': '元', 'event': '**马头墙**出现'},
        {'year': 'AD 1500', 'era': '明', 'event': '**徽派**鼎盛'},
        {'year': 'AD 1700', 'era': '清', 'event': '**客家围屋**完善'},
        {'year': 'AD 2000', 'era': '当代', 'event': '**皖南古村落**世遗'},
        {'year': '当代', 'era': '当代', 'event': '**徽派**列入保护'},
    ],
    'images': [
        {'imageKeyword': 'huizhou style courtyard house', 'caption': '徽派民居 (宏村)', 'credit': 'photo tradition'},
        {'imageKeyword': 'chinese horse head wall', 'caption': '马头墙', 'credit': 'photo tradition'},
        {'imageKeyword': 'hakka round tulou', 'caption': '客家围屋', 'credit': 'photo tradition'},
    ],
    'related': [
        {'id': 'tr-hou-intro', 'title': '中华建筑', 'reason': '民居是建筑重要类型'},
        {'id': 'tr-hou-courtyard', 'title': '合院式', 'reason': '南北民居对比'},
        {'id': 'tr-hou-yaodong', 'title': '窑洞', 'reason': '其他民居'},
        {'id': 'tr-hou-tulou', 'title': '土楼', 'reason': '客家围楼'},
        {'id': 'tr-hou-diao', 'title': '吊脚楼', 'reason': '其他民居'},
        {'id': 'tr-hou-fengshui', 'title': '风水', 'reason': '四水归堂风水'},
    ],
    'source': '徽州古建筑、徽派民居研究 (单德启)、客家围屋 (林嘉书)、皖南古村落 (张仲一)',
}

# 6. Rewrite tr-hou-zhidao (秦直道)
data['tr-hou-zhidao'] = {
    'facts': [
        {'label': '主题', 'value': '**秦直道 — 世界最早的\"高速公路\"**'},
        {'label': '始建', 'value': '**秦始皇三十五年 (BC 212)**'},
        {'label': '监修', 'value': '**蒙恬**'},
        {'label': '起讫', 'value': '**咸阳林光宫 → 九原郡 (包头)**'},
        {'label': '全长', 'value': '**700 余公里 (一说 1800 里)**'},
        {'label': '宽度', 'value': '**30-40 米**'},
    ],
    'sections': [
        P('秦直道的由来',
          '秦直道是秦始皇三十五年 (BC 212) 命蒙恬监修的大型国家工程。南起咸阳林光宫 (今陕西淳化)，北至九原郡 (今内蒙古包头)，全长 700 余公里 (一说 1800 里)，宽 30-40 米。'),
        C('\"堑山堙谷\"是什么意思？',
          '\"堑山堙谷\"是秦直道修筑工艺。\"堑山\"：遇山开山，把山削平；\"堙谷\"：遇谷填土，把谷填平。直道穿越陕甘宁黄土高原与内蒙古草原，地形复杂，工艺要求极高。'),
        P('秦直道为何被称为\"高速公路\"？',
          '秦直道被称为\"世界最早的公路\"。原因：宽度 30-40 米 (双向 6-8 车道)；路面夯实坚硬；\"堑山堙谷\"笔直；军用快速 (骑兵半天可达)；2000 多年前世界罕见。'),
        L('秦三大工程', [
            '**万里长城** — BC 221 蒙恬修筑',
            '**秦直道** — BC 212 蒙恬监修',
            '**阿房宫** — BC 212 始建 (未完成)',
            '**灵渠** — BC 214 史禄开凿 (南方)',
            '**郑国渠** — BC 246 韩国水工所开',
            '**秦驰道** — 全国公路网',
        ]),
        P('秦直道的历史作用',
          '秦直道历史作用重大。原因：军事 — 北击匈奴、运送兵员粮草；政治 — 中央集权、控制边疆；经济 — 促进南北物资交流；文化 — 中原与北方文化交流；交通 — 2000 年南北大通道。'),
        Q('**直道通九原，蒙恬筑万里**。', '史记·蒙恬列传'),
    ],
    'timeline': [
        {'year': 'BC 221', 'era': '秦', 'event': '**蒙恬**北击匈奴'},
        {'year': 'BC 212', 'era': '秦', 'event': '**秦直道**始建'},
        {'year': 'BC 210', 'era': '秦', 'event': '**秦直道**建成'},
        {'year': 'BC 209', 'era': '秦末', 'event': '**秦二世**继续使用'},
        {'year': 'BC 100', 'era': '西汉', 'event': '**汉武帝**利用直道北击匈奴'},
        {'year': 'AD 1000', 'era': '宋', 'event': '**直道**仍有遗迹'},
        {'year': 'AD 1900', 'era': '近代', 'event': '**直道**考古调查'},
        {'year': '当代', 'era': '当代', 'event': '**直道**列入文物保护'},
    ],
    'images': [
        {'imageKeyword': 'qin dynasty straight road', 'caption': '秦直道遗迹', 'credit': 'photo tradition'},
        {'imageKeyword': 'meng tian general qin', 'caption': '蒙恬 (监修者)', 'credit': 'illustration tradition'},
        {'imageKeyword': 'ancient qin road map', 'caption': '秦直道路线图', 'credit': 'illustration tradition'},
    ],
    'related': [
        {'id': 'tr-hou-intro', 'title': '中华建筑', 'reason': '直道是基础设施'},
        {'id': 'tr-hou-guanlu', 'title': '官路', 'reason': '秦驰道'},
        {'id': 'tr-hou-citydef', 'title': '城池防御', 'reason': '长城与直道'},
        {'id': 'tr-hou-post', 'title': '驿站', 'reason': '沿线驿站'},
        {'id': 'tr-hou-silk', 'title': '丝绸之路', 'reason': '国际交通'},
        {'id': 'tr-hou-bridge', 'title': '桥梁', 'reason': '沿线桥梁'},
    ],
    'source': '史记·蒙恬列传、汉书·地理志、秦直道研究 (王子今)、秦直道考古 (陕西省考古研究院)',
}

# 7. Rewrite tr-hou-silk (丝绸之路)
data['tr-hou-silk'] = {
    'facts': [
        {'label': '主题', 'value': '**丝绸之路 — 跨国大探险**'},
        {'label': '起源', 'value': '**西汉张骞 (BC 130)**'},
        {'label': '起点', 'value': '**长安**'},
        {'label': '终点', 'value': '**罗马 (欧洲)**'},
        {'label': '全长', 'value': '**7000 余公里**'},
        {'label': '意义', 'value': '**东西文明交流**'},
    ],
    'sections': [
        P('丝绸之路的由来',
          '丝绸之路是西汉武帝时张骞出使西域 (BC 130) 开通。从长安经河西走廊 (武威、张掖、酒泉、敦煌)、中亚 (撒马尔罕)、西亚 (波斯)，到欧洲 (罗马)。全长 7000 余公里。'),
        C('\"丝绸\"为何得名？',
          '\"丝绸之路\"得名源于 19 世纪德国地理学家李希霍芬 (Ferdinand von Richthofen)。原意：通过这条路，中国的丝绸、瓷器、茶叶、铁器、纸张、四大发明 (造纸、印刷、火药、指南针) 传向西方。'),
        P('丝绸之路的两条路线',
          '丝绸之路分两条路线。\"陆上丝绸之路\" (沙漠之路)：长安 → 河西走廊 → 敦煌 → 中亚 → 西亚 → 欧洲；\"海上丝绸之路\"：东南沿海 → 东南亚 → 印度洋 → 阿拉伯 → 非洲东岸。'),
        L('丝绸之路的文化交流', [
            '**丝绸** — 中国 → 中亚 → 欧洲',
            '**瓷器** — 中国 → 西亚 → 欧洲',
            '**茶叶** — 中国 → 中亚 → 西亚',
            '**造纸术** — 中国 → 中亚 → 阿拉伯 → 欧洲',
            '**佛教** — 印度 → 中亚 → 中国',
            '**葡萄** — 中亚 → 中国',
        ]),
        P('丝绸之路的当代意义',
          '\"一带一路\"是丝绸之路的当代延续。原因：习近平 2013 年提出\"丝绸之路经济带\"和\"21 世纪海上丝绸之路\"；连接亚欧非；促进国际合作；继承古代丝路精神。'),
        Q('**使者相望于道，商旅不绝于途**。', '汉书·西域传'),
    ],
    'timeline': [
        {'year': 'BC 138', 'era': '西汉', 'event': '**张骞**第一次出使西域'},
        {'year': 'BC 126', 'era': '西汉', 'event': '**张骞**归汉'},
        {'year': 'BC 119', 'era': '西汉', 'event': '**张骞**第二次出使'},
        {'year': 'BC 60', 'era': '西汉', 'event': '**西域都护府**设置'},
        {'year': 'AD 100', 'era': '东汉', 'event': '**班超**经营西域'},
        {'year': 'AD 700', 'era': '唐', 'event': '**丝绸之路**鼎盛'},
        {'year': 'AD 1500', 'era': '明', 'event': '**海上丝路**兴起'},
        {'year': 'AD 2013', 'era': '当代', 'event': '**\"一带一路\"**倡议'},
    ],
    'images': [
        {'imageKeyword': 'silk road ancient route map', 'caption': '丝绸之路路线图', 'credit': 'illustration tradition'},
        {'imageKeyword': 'silk road camel caravan', 'caption': '丝路驼队', 'credit': 'illustration tradition'},
        {'imageKeyword': 'dunhuang mogao caves', 'caption': '敦煌 (丝路明珠)', 'credit': 'photo tradition'},
    ],
    'related': [
        {'id': 'tr-hou-intro', 'title': '中华建筑', 'reason': '丝路影响建筑'},
        {'id': 'tr-hou-zhenghe', 'title': '郑和下西洋', 'reason': '海上丝路'},
        {'id': 'tr-hou-guanlu', 'title': '官路', 'reason': '陆上交通'},
        {'id': 'tr-hou-cave', 'title': '石窟', 'reason': '敦煌石窟'},
        {'id': 'tr-hou-zhidao', 'title': '秦直道', 'reason': '古代交通'},
        {'id': 'tr-hou-post', 'title': '驿站', 'reason': '沿途驿站'},
    ],
    'source': '史记·大宛列传、汉书·西域传、丝绸之路 (法国·布尔努瓦)、丝绸之路研究 (余太山)',
}

# 8. Rewrite tr-hou-diao (吊脚楼)
data['tr-hou-diao'] = {
    'facts': [
        {'label': '主题', 'value': '**吊脚楼 — 干栏式建筑**'},
        {'label': '起源', 'value': '**河姆渡文化 (BC 5000)**'},
        {'label': '核心', 'value': '**下层架空 / 上层住人**'},
        {'label': '分布', 'value': '**湘西鄂西渝黔桂**'},
        {'label': '代表', 'value': '**凤凰吊脚楼 / 苗寨吊脚楼**'},
        {'label': '特色', 'value': '**依山就势、错落有致**'},
    ],
    'sections': [
        P('何谓\"吊脚楼\"？',
          '吊脚楼 (干栏式建筑) 源于河姆渡文化 (BC 5000)。\"吊脚\"指下层架空 (防潮防虫防兽)；\"楼\"指上层住人。分布于湘西、鄂西、渝东南、黔东南、桂北等南方少数民族地区。'),
        C('\"干栏\"建筑的智慧',
          '\"干栏\"是南方少数民族应对湿热环境的智慧。原因：南方多雨潮湿 — 架空防潮；山林多虫兽 — 架空防虫防兽；木材丰富 — 用木桩架空。\"干栏\"建筑已有 7000 年历史。'),
        P('吊脚楼如何\"依山就势\"？',
          '吊脚楼\"依山就势\"建造。原因：底层依山势长短不一；前柱\"吊脚\"、后柱落地；屋顶顺坡起；层层出挑；错落有致。吊脚楼与山地自然融为一体。'),
        L('吊脚楼的主要分布', [
            '**湘西** — 凤凰吊脚楼、土家吊脚楼',
            '**鄂西** — 恩施土家吊脚楼',
            '**渝东南** — 酉阳、秀山吊脚楼',
            '**黔东南** — 苗寨吊脚楼 (西江千户苗寨)',
            '**桂北** — 龙胜吊脚楼',
            '**云南** — 傣族竹楼 (干栏变体)',
        ]),
        P('吊脚楼的文化意义',
          '吊脚楼是南方少数民族智慧的体现。原因：因地制宜 — 适应山地；文化象征 — 民族特色；社群结构 — 聚族而居；建筑技艺 — 干栏木构；保护与传承 — 列入国家级非遗。'),
        Q('**依山就势，错落有致，吊脚楼上有人家**。', '民间俗语'),
    ],
    'timeline': [
        {'year': 'BC 5000', 'era': '新石器', 'event': '**河姆渡**干栏式建筑'},
        {'year': 'BC 2000', 'era': '传说', 'event': '**南方民族**沿用'},
        {'year': 'BC 100', 'era': '西汉', 'event': '**干栏**文献记载'},
        {'year': 'AD 1000', 'era': '宋', 'event': '**吊脚楼** 雏形'},
        {'year': 'AD 1500', 'era': '明', 'event': '**土家吊脚楼** 成型'},
        {'year': 'AD 1700', 'era': '清', 'event': '**吊脚楼**鼎盛'},
        {'year': 'AD 2000', 'era': '当代', 'event': '**吊脚楼**列入非遗'},
        {'year': '当代', 'era': '当代', 'event': '**吊脚楼**保护与传承'},
    ],
    'images': [
        {'imageKeyword': 'miao village stilted house', 'caption': '苗寨吊脚楼 (西江千户苗寨)', 'credit': 'photo tradition'},
        {'imageKeyword': 'fenghuang phoenix ancient town', 'caption': '凤凰吊脚楼', 'credit': 'photo tradition'},
        {'imageKeyword': 'tujia stilted house', 'caption': '土家吊脚楼', 'credit': 'photo tradition'},
    ],
    'related': [
        {'id': 'tr-hou-intro', 'title': '中华建筑', 'reason': '民居是建筑类型'},
        {'id': 'tr-hou-courtyard', 'title': '合院式', 'reason': '民居对比'},
        {'id': 'tr-hou-tianjin', 'title': '天井式', 'reason': '南方民居'},
        {'id': 'tr-hou-tulou', 'title': '土楼', 'reason': '其他民居'},
        {'id': 'tr-hou-yaodong', 'title': '窑洞', 'reason': '民居对比'},
        {'id': 'tr-hou-fengshui', 'title': '风水', 'reason': '山地风水'},
    ],
    'source': '河姆渡考古、干栏建筑研究 (李先逵)、湘西吊脚楼 (何介文)、土家族建筑 (张良皋)',
}

# 9. Rewrite tr-hou-fang (古代游轮舫)
data['tr-hou-fang'] = {
    'facts': [
        {'label': '主题', 'value': '**画舫 — 古代游轮**'},
        {'label': '起源', 'value': '**唐宋**'},
        {'label': '核心', 'value': '**装饰华丽 / 园林游船**'},
        {'label': '代表', 'value': '**颐和园\"清晏舫\"**'},
        {'label': '种类', 'value': '**木舫 / 石舫**'},
        {'label': '文化', 'value': '**\"画船听雨\"古典意象**'},
    ],
    'sections': [
        P('何谓\"画舫\"？',
          '\"画舫\"是装饰华丽的游船，唐宋兴起。\"舫\"是不动的画船 — 园林中模拟船形的建筑 (或真的船)。画舫多停泊江南水乡，\"画船听雨\"是古典意象。'),
        C('\"清晏舫\"的来历',
          '颐和园\"清晏舫\"是石舫代表。原因：颐和园昆明湖西岸；建于清乾隆二十年 (AD 1755)；石制仿船形；取\"海晏河清\"之意；皇帝借此体现江山永固；世界园林奇观。'),
        P('\"舫\"的两种形态',
          '\"舫\"分木制与石制两种。木舫：真船 (可移动)，装饰华丽 — 如颐和园\"云绘楼\"画舫；石舫：石制仿船 (不可动)，永久纪念 — 如颐和园\"清晏舫\"、苏州狮子林\"画舫\"。'),
        L('画舫的功能与文化', [
            '**休闲娱乐** — 帝王、文人游船',
            '**饮宴雅集** — 舫上设茶室、琴台',
            '**吟诗作赋** — 船中题诗、作文',
            '**观景赏景** — 沿岸风景',
            '**园林点缀** — 石舫是园林一景',
            '**古典意象** — \"画船听雨\"\"烟波画舫\"',
        ]),
        P('画舫的文学意象',
          '画舫是古典文学中的常见意象。\"画船听雨\" (江南意象)；\"烟波画舫\" (西湖意象)；\"乘舫游湖\" (文人雅集)；\"舫中吟诗\" (李白、苏轼)。画舫象征浪漫与文化。'),
        Q('**画船听雨，诗意江南**。', '古典文学意象'),
    ],
    'timeline': [
        {'year': 'BC 100', 'era': '西汉', 'event': '**\"舫\"** 出现'},
        {'year': 'AD 600', 'era': '唐', 'event': '**画舫** 兴起'},
        {'year': 'AD 1000', 'era': '宋', 'event': '**画舫**兴盛 (汴京、临安)'},
        {'year': 'AD 1400', 'era': '明', 'event': '**石舫**出现'},
        {'year': 'AD 1755', 'era': '清', 'event': '**清晏舫** (颐和园)'},
        {'year': 'AD 1800', 'era': '清', 'event': '**画舫**遍布江南'},
        {'year': 'AD 1900', 'era': '近代', 'event': '**画舫**衰落'},
        {'year': '当代', 'era': '当代', 'event': '**画舫**文化遗产保护'},
    ],
    'images': [
        {'imageKeyword': 'qingyan boat summer palace', 'caption': '颐和园\"清晏舫\"', 'credit': 'photo tradition'},
        {'imageKeyword': 'jiangnan painting boat', 'caption': '江南画舫', 'credit': 'illustration tradition'},
        {'imageKeyword': 'chinese garden stone boat', 'caption': '园林石舫', 'credit': 'photo tradition'},
    ],
    'related': [
        {'id': 'tr-hou-intro', 'title': '中华建筑', 'reason': '画舫是建筑'},
        {'id': 'tr-hou-garden', 'title': '园林', 'reason': '舫在园林中'},
        {'id': 'tr-hou-zhenghe', 'title': '郑和', 'reason': '船舶对比'},
        {'id': 'tr-hou-car', 'title': '出行车', 'reason': '古代出行'},
        {'id': 'tr-hou-tower', 'title': '楼阁', 'reason': '建筑对比'},
        {'id': 'tr-hou-canal', 'title': '运河', 'reason': '水上交通'},
    ],
    'source': '宋史·礼志、清史稿·舆服志、颐和园志、画舫研究 (周维权)、江南园林 (刘敦桢)',
}

# 10. Rewrite tr-hou-zao (藻井)
data['tr-hou-zao'] = {
    'facts': [
        {'label': '主题', 'value': '**藻井 — 古代建筑的\"穹顶装饰\"**'},
        {'label': '起源', 'value': '**汉代**'},
        {'label': '核心', 'value': '**天花板上的\"天圆地方\"**'},
        {'label': '形制', 'value': '**方形、圆形、八角形、覆斗形**'},
        {'label': '代表', 'value': '**故宫太和殿 / 隆兴寺摩尼殿**'},
        {'label': '意义', 'value': '**\"建筑仰望艺术\"**'},
    ],
    'sections': [
        P('何谓\"藻井\"？',
          '\"藻井\"是古代建筑天花板的穹顶装饰，多用于宫殿、寺庙、祠堂。\"藻\"指水草 (压火)；\"井\"指方井 (居中)。藻井是中华独有的\"建筑仰望艺术\"。'),
        C('为何称\"藻\"？',
          '\"藻井\"称\"藻\"源于五行学说。原因：宫殿、寺庙多木构，易遭火灾；\"藻\"为水草，水克火 — 故名\"藻井\"。藻井实际有\"以水压火\"之意，祈求建筑免于火灾。'),
        P('藻井的形制与装饰',
          '藻井形制多样：方形、圆形、八角形、覆斗形。装饰：斗栱层叠 (一层层向上收拢)；彩画 (青绿色调)；雕刻 (龙凤、莲花)。藻井中央\"明镜\" — 寓意\"天圆地方\"。'),
        L('藻井的形制分类', [
            '**方形藻井** — 唐宋常见',
            '**圆形藻井** — 明清常见',
            '**八角形藻井** — 宋元常见',
            '**覆斗形藻井** — 唐代成熟',
            '**斗四藻井** — 宋辽金',
            '**斗八藻井** — 元明清',
        ]),
        P('藻井为何被誉为\"仰望艺术\"？',
          '藻井被誉为\"建筑仰望艺术\"。原因：构图 — 由下向上逐层收拢；色彩 — 绚丽多彩；雕刻 — 立体层次；寓意 — \"天圆地方\"、星宿、神仙、龙凤；中华独有 — 世界罕见。'),
        Q('**藻井明镜，天圆地方**。', '营造法式'),
    ],
    'timeline': [
        {'year': 'BC 100', 'era': '西汉', 'event': '**藻井**雏形'},
        {'year': 'AD 500', 'era': '南北朝', 'event': '**藻井** 发展'},
        {'year': 'AD 700', 'era': '唐', 'event': '**覆斗藻井** 成熟'},
        {'year': 'AD 1000', 'era': '宋', 'event': '**《营造法式》** 制度化'},
        {'year': 'AD 1100', 'era': '辽金', 'event': '**藻井** 多样化'},
        {'year': 'AD 1400', 'era': '明', 'event': '**故宫** 藻井鼎盛'},
        {'year': 'AD 1700', 'era': '清', 'event': '**藻井** 工巧化'},
        {'year': '当代', 'era': '当代', 'event': '**藻井**列入保护'},
    ],
    'images': [
        {'imageKeyword': 'chinese ceiling caisson zaojing', 'caption': '藻井', 'credit': 'photo tradition'},
        {'imageKeyword': 'taihe palace caisson ceiling', 'caption': '太和殿藻井', 'credit': 'photo tradition'},
        {'imageKeyword': 'longxing temple caisson', 'caption': '隆兴寺摩尼殿藻井', 'credit': 'photo tradition'},
    ],
    'related': [
        {'id': 'tr-hou-intro', 'title': '中华建筑', 'reason': '藻井是建筑装饰'},
        {'id': 'tr-hou-zigong', 'title': '紫禁城', 'reason': '故宫藻井'},
        {'id': 'tr-hou-temple', 'title': '寺庙', 'reason': '寺庙藻井'},
        {'id': 'tr-hou-pagoda', 'title': '佛塔', 'reason': '塔内藻井'},
        {'id': 'tr-hou-pailou', 'title': '牌坊', 'reason': '建筑装饰'},
        {'id': 'tr-hou-baogu', 'title': '抱鼓石', 'reason': '其他装饰'},
    ],
    'source': '营造法式、清工部《工程做法则例》、藻井研究 (傅熹年)、建筑装饰 (楼庆西)',
}

PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Final entries: {len(data)}')
print(f'Keys: {sorted(data.keys())}')