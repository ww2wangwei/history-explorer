# === ce-011 印刷术（雕版） ===
ENRICH['ce-011'] = {
    'facts': [
        {'label': '年代', 'value': '约 AD 7 世纪（唐初）'},
        {'label': '地区', 'value': '中国'},
        {'label': '材料', 'value': '梨木、枣木雕版'},
        {'label': '已知最早实物', 'value': '《陀罗尼经咒》（AD 650-670）'},
        {'label': '代表作', 'value': '《金刚经》卷子（AD 868）'},
        {'label': '意义', 'value': '四大发明之一，书籍批量复制之始'},
    ],
    'sections': [
        P('雕版印刷起源', '雕版印刷是在木板上雕刻反向凸字，涂墨后覆纸印制。**已知最早的雕版印刷品是唐初的《陀罗尼经咒》**（约 AD 650-670），现存英国大英图书馆。1900 年敦煌藏经洞发现《金刚经》卷子（AD 868），是现存最早标有明确日期的印刷品。'),
        P('技术原理', '雕版印刷工序：①书写文字于薄纸；②反贴于木板；③雕刻师沿字迹雕刻；④涂墨；⑤覆纸按压转印。一版可印数千张，远快于手抄。'),
        C('书籍普及的起点', '雕版印刷使佛经、历书、诗集等可以**廉价批量复制**，平民也能拥有书本。它直接催生了宋代书籍市场的繁荣。', 'success'),
        L('早期印刷品', ['《陀罗尼经咒》AD 650-670', '《金刚经》卷子 AD 868', '《妙法莲华经》五代', '《开宝藏》（北宋大藏经）']),
        P('与活字的关系', '雕版印刷在中国流行了 400 年后才被毕昇发明活字（AD 1040）。因汉字字数庞大（数万字），活字印刷在中国并未取代雕版，反而在西方（字母文字）发扬光大。'),
        Q('"若要人不知，除非己莫为。"', '汉代俗语，雕版尚未发明'),
    ],
    'timeline': [
        {'year': 'AD 650', 'era': '唐初', 'event': '**雕版印刷** 雏形出现'},
        {'year': 'AD 868', 'era': '唐', 'event': '《**金刚经**》卷子印刷'},
        {'year': 'AD 971', 'era': '北宋', 'event': '《**开宝藏**》雕印'},
        {'year': 'AD 1040', 'era': '北宋', 'event': '**毕昇**发明活字'},
        {'year': 'AD 1450', 'era': '欧洲', 'event': '**古登堡** 借鉴发明金属活字'},
    ],
    'images': [
        {'imageKeyword': 'block printing woodblock ancient china', 'caption': '雕版印刷工艺', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'diamond sutra dunhuang manuscript', 'caption': '敦煌《金刚经》', 'credit': 'British Library'},
        {'imageKeyword': 'chinese woodblock printer at work', 'caption': '传统雕版印刷工人', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'bi sheng movable type portrait', 'caption': '毕昇（活字发明者）', 'credit': '公共领域'},
    ],
    'related': [
        {'id': 'ce-012', 'title': '活字印刷', 'reason': '雕版印刷的升级'},
        {'id': 'ce-019', 'title': '古登堡圣经', 'reason': '活字印刷欧洲推广'},
        {'id': 'p-bi-sheng', 'title': '毕昇', 'reason': '活字印刷发明者'},
        {'id': 'tr-tech-infra', 'title': '中华科技', 'reason': '四大发明之一'},
    ],
    'source': '📚 Carter《The Invention of Printing in China》、钱存训《中国纸和印刷文化史》、敦煌研究院',
}

# === ce-012 活字印刷 ===
ENRICH['ce-012'] = {
    'facts': [
        {'label': '发明者', 'value': '毕昇（北宋宋匠）'},
        {'label': '年代', 'value': '约 AD 1040-1048'},
        {'label': '材料', 'value': '胶泥活字'},
        {'label': '记载', 'value': '沈括《梦溪笔谈》'},
        {'label': '意义', 'value': '世界最早的活字印刷'},
        {'label': '传播', 'value': '经朝鲜→日本→欧洲'},
    ],
    'sections': [
        P('发明背景', '北宋庆历年间（1041-1048），平民出身的工匠**毕昇**用胶泥刻字，每字一印，经火烧硬后用于排版印刷。这一发明比欧洲谷登堡早约 400 年。'),
        P('技术演进', '毕昇原版为胶泥活字，后世发展出：①木活字（王祯 AD 1298）；②铜活字；③铅活字。中国因汉字字数庞大（数万），雕版始终占主流；活字真正普及在西方字母文字世界。'),
        C('革命性', '活字印刷相比雕版：**单个字可重复使用**——大幅降低排版成本，特别适合字母文字。**这是信息革命的第一次重大突破**。', 'success'),
        L('材料演进', ['胶泥活字（毕昇）', '木活字（王祯，元代）', '铜活字（明代）', '铅活字（西方主流）', '激光照排（20 世纪）']),
        P('传播路径', '活字印刷从中国→朝鲜（1234 铸字印书）→日本（1592）→欧洲（谷登堡 1450）。'),
        Q('"庆历中，有布衣毕昇，又为活板。"', '沈括《梦溪笔谈·技艺》'),
    ],
    'timeline': [
        {'year': 'AD 1040', 'era': '北宋', 'event': '**毕昇** 发明胶泥活字'},
        {'year': 'AD 1234', 'era': '朝鲜高丽', 'event': '铸字印《**真观和尚语录**》'},
        {'year': 'AD 1298', 'era': '元', 'event': '**王祯** 改进木活字'},
        {'year': 'AD 1450', 'era': '欧洲', 'event': '**谷登堡** 金属活字'},
        {'year': 'AD 1592', 'era': '日本', 'event': '天正遣欧少年使节带回活字'},
    ],
    'images': [
        {'imageKeyword': 'bi sheng movable type clay', 'caption': '毕昇与胶泥活字', 'credit': '公共领域'},
        {'imageKeyword': 'wooden movable type blocks', 'caption': '传统木活字', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'gutenberg press reprint', 'caption': '谷登堡印刷机（活字应用）', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'korean jikji movable type', 'caption': '高丽《直指》金属活字', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'ce-011', 'title': '雕版印刷', 'reason': '活字印刷的前身'},
        {'id': 'ce-019', 'title': '古登堡圣经', 'reason': '活字印刷欧洲高峰'},
        {'id': 'ce-029', 'title': '古登堡印刷机', 'reason': '活字印刷工业化'},
        {'id': 'p-bi-sheng', 'title': '毕昇', 'reason': '活字发明者'},
    ],
    'source': '📚 沈括《梦溪笔谈》、钱存训《中国纸和印刷文化史》、Carter《The Invention of Printing in China》',
}

# === ce-013 兰亭集序 ===
ENRICH['ce-013'] = {
    'facts': [
        {'label': '作者', 'value': '王羲之'},
        {'label': '年代', 'value': 'AD 353 年（东晋永和九年）'},
        {'label': '场合', 'value': '会稽山阴兰亭修禊'},
        {'label': '体裁', 'value': '行书序文'},
        {'label': '字数', 'value': '324 字（涂改 22 处）'},
        {'label': '誉称', 'value': '"天下第一行书"'},
    ],
    'sections': [
        P('创作背景', '东晋永和九年（353）三月初三，王羲之与谢安、孙绰等 41 位文人雅士在会稽山阴兰亭举行"修禊"（临水祈福）。众人流觞曲水，饮酒赋诗，王羲之乘兴为诗集作序——即《兰亭集序》。'),
        P('书法艺术', '全文 324 字，涂改 22 处，**笔意随情绪起伏**——前段欢愉轻快（"天朗气清，惠风和畅"），中段沉郁（"固知一死生为虚诞，齐彭殇为妄作"），后段悲慨（"临文嗟悼，不能喻之于怀"）。这种**情感与笔墨的同步**是后世书法无法复制的核心。'),
        C('天下第一行书', '《兰亭集序》被后世誉为"**天下第一行书**"。唐代以降，历代帝王将相、书法家争相临摹。**原迹传为唐太宗殉葬**，现传摹本以"神龙本"最为著名。', 'success'),
        L('书法地位', ['"天下第一行书"', '中国书法美学典范', '行书字体定型样本', '后世书法家必习范本']),
        P('历史命运', '原迹传至唐太宗手中，命赵模、韩道政等人摹制副本分赐诸王。太宗驾崩后，**据传原迹陪葬昭陵**——故真迹永埋地下。'),
        Q('"仰观宇宙之大，俯察品类之盛，所以游目骋怀，足以极视听之娱。"', '王羲之《兰亭集序》'),
    ],
    'timeline': [
        {'year': 'AD 353', 'era': '东晋', 'event': '王羲之作《**兰亭集序**》'},
        {'year': 'AD 620', 'era': '唐初', 'event': '欧阳询摹写副本'},
        {'year': 'AD 649', 'era': '唐', 'event': '**唐太宗** 将真迹殉葬昭陵'},
        {'year': 'AD 730', 'era': '唐', 'event': '**神龙本** 摹本流传至今'},
        {'year': 'AD 1747', 'era': '清', 'event': '乾隆将神龙本刻入**三希堂法帖**'},
    ],
    'images': [
        {'imageKeyword': 'lantingxu orchid pavilion preface calligraphy', 'caption': '《兰亭集序》神龙本', 'credit': '故宫博物院'},
        {'imageKeyword': 'orchid pavilion riverside gathering', 'caption': '兰亭曲水流觞', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'wang xizhi calligrapher portrait', 'caption': '王羲之画像', 'credit': '公共领域'},
        {'imageKeyword': 'tang taizong emperor portrait', 'caption': '唐太宗（兰亭收藏者）', 'credit': '公共领域'},
    ],
    'related': [
        {'id': 'p-wang-xizhi', 'title': '王羲之', 'reason': '《兰亭集序》作者'},
        {'id': 'p-wang-xianzhi', 'title': '王献之', 'reason': '王羲之之子'},
        {'id': 'era-jin-east', 'title': '东晋', 'reason': '创作年代'},
        {'id': 'tr-history-art', 'title': '中国书法', 'reason': '行书巅峰'},
    ],
    'source': '📚 王羲之《兰亭集序》、刘涛《中国书法史》、故宫博物院《兰亭八柱帖》',
}


# === ce-014 敦煌莫高窟 ===
ENRICH['ce-014'] = {
    'facts': [
        {'label': '始建', 'value': '前秦建元二年（AD 366）'},
        {'label': '延续', 'value': '至元代（AD 14 世纪）约 1000 年'},
        {'label': '洞窟数', 'value': '现存 735 个（其中有壁画 492 个）'},
        {'label': '壁画面积', 'value': '约 4.5 万平方米'},
        {'label': '塑像', 'value': '2415 尊'},
        {'label': '世遗', 'value': '1987 年列入世界文化遗产'},
    ],
    'sections': [
        P('开凿背景', '敦煌莫高窟位于河西走廊西端、丝绸之路要冲。前秦建元二年（366），乐僔和尚路经鸣沙山，忽见金光如佛，遂开凿第一窟。此后历经十六国、北魏、隋、唐、五代、宋、西夏、元，**千年不断开凿**。'),
        P('艺术宝库', '莫高窟集建筑、雕塑、壁画三位一体：**壁画面积 4.5 万平方米**（相当于 6 个足球场），题材包括佛教故事、丝路商旅、社会生活、服饰演变。**是研究中世纪欧亚大陆文明的视觉百科全书**。'),
        C('藏经洞的悲剧', '清光绪二十六年（1900），道士王圆箓发现藏经洞（17 窟），内藏**5 万余件**写本、刻本、织绣、绘画。1907-1914 年间，**英国斯坦因、法国伯希和、日本橘瑞超、俄国人奥登堡**等先后骗购走约 4 万件，写本流散英、法、俄、日。', 'warning'),
        L('洞窟分期', ['十六国·北魏（早期，BC 366-580）', '隋代（统一风格，AD 581-618）', '唐代（黄金期，AD 618-907）', '五代·宋（回落，AD 907-1279）', '西夏·元（晚期，AD 1038-1368）']),
        P('国际敦煌学', '敦煌文献催生了**敦煌学**——以敦煌遗书和敦煌艺术为研究对象的国际显学。"国学大师"**陈寅恪**曰："敦煌者，吾国学术之伤心史也。"'),
        Q('"敦者，大也；煌者，盛也。"', '《尚书·禹贡》释敦煌'),
    ],
    'timeline': [
        {'year': 'AD 366', 'era': '前秦', 'event': '乐僔开凿**第一窟**'},
        {'year': 'AD 618', 'era': '唐', 'event': '莫高窟**黄金时代**'},
        {'year': 'AD 781', 'era': '唐', 'event': '**吐蕃**占领敦煌（藏经洞文献期）'},
        {'year': 'AD 1900', 'era': '清', 'event': '王圆箓发现**藏经洞**'},
        {'year': 'AD 1987', 'era': '当代', 'event': '莫高窟列入**世界遗产**'},
    ],
    'images': [
        {'imageKeyword': 'mogao caves dunhuang mural', 'caption': '莫高窟壁画', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'nine rank goddess flying apsaras', 'caption': '飞天壁画（敦煌标志）', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'dunhuang library cave manuscripts', 'caption': '藏经洞文献', 'credit': 'British Library'},
        {'imageKeyword': 'mogaoku buddha statue large', 'caption': '莫高窟大佛', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'tr-art-painting', 'title': '中国壁画', 'reason': '敦煌壁画是巅峰'},
        {'id': 'tr-religion-buddhism', 'title': '佛教传播', 'reason': '敦煌是佛教东传枢纽'},
        {'id': 'era-tang', 'title': '唐朝', 'reason': '敦煌黄金期'},
        {'id': 'tr-region-overview', 'title': '河西走廊', 'reason': '敦煌地理归属'},
    ],
    'source': '📚 敦煌研究院《敦煌石窟全集》、荣新江《敦煌学十八讲》、斯坦因《Serindia》',
}

# === ce-015 科举制度 ===
ENRICH['ce-015'] = {
    'facts': [
        {'label': '正式确立', 'value': '隋大业三年（AD 605）'},
        {'label': '延续', 'value': '至清光绪三十一年（1905）共 1300 年'},
        {'label': '创始皇帝', 'value': '隋炀帝（杨广）'},
        {'label': '考试层次', 'value': '乡试（省）→ 会试（京）→ 殿试（皇帝）'},
        {'label': '影响', 'value': '打破世族垄断 / 中央集权利器'},
        {'label': '废除', 'value': '清末新政，1905 年正式废除'},
    ],
    'sections': [
        P('制度起源', '隋朝建立前，选官主要靠**察举制**（地方推荐）和**九品中正制**（魏晋，按门第评等）。大业三年（605），隋炀帝杨广**设进士科**，标志着科举制度正式建立——以考试选拔人才，取代门第世袭。'),
        P('制度演进', '唐代科举分常科（每年）与制科（皇帝特旨）；宋代王安石变法改革考试内容；明清科举定型为**八股文**（固定格式）。考试分三级：①乡试（省级，三年一次，中举人）；②会试（京城，中贡士）；③殿试（皇帝亲策，赐进士）。'),
        C('历史功过', '科举制打破**世族垄断**，使寒门子弟通过读书改变命运，**促进社会阶层流动**。但明清八股禁锢思想，导致近代中国科技落后。其废除（1905）也是清末新政重要内容。', 'info'),
        L('制度层次', ['**童试**（县、府、院）→秀才', '**乡试**（省）→举人', '**会试**（京）→贡士', '**殿试**（皇帝）→进士（分三甲）']),
        P('历史遗产', '**科举制是中国的"第五大发明"**——西方文官制度（19 世纪英国）明显借鉴科举。法国启蒙思想家伏尔泰、孟德斯鸠都盛赞中国科举。'),
        Q('"上品无寒门，下品无士族。"', '《晋书·刘毅传》论九品中正制流弊'),
    ],
    'timeline': [
        {'year': 'AD 605', 'era': '隋', 'event': '**隋炀帝** 设进士科'},
        {'year': 'AD 742', 'era': '唐', 'event': '**李白**应诏入翰林'},
        {'year': 'AD 1069', 'era': '北宋', 'event': '**王安石** 改革科举'},
        {'year': 'AD 1427', 'era': '明', 'event': '科举定型为**八股文**'},
        {'year': 'AD 1905', 'era': '清末', 'event': '**科举制度** 正式废除'},
    ],
    'images': [
        {'imageKeyword': 'imperial examination china ancient', 'caption': '科举考试图（古代绘画）', 'credit': '公共领域'},
        {'imageKeyword': 'palace examination hall ming', 'caption': '明代贡院', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'eight legged essay examination paper', 'caption': '八股文试卷', 'credit': '公共领域'},
        {'imageKeyword': 'sui yangdi emperor portrait', 'caption': '隋炀帝像', 'credit': '公共领域'},
    ],
    'related': [
        {'id': 'era-sui', 'title': '隋朝', 'reason': '科举创始朝代'},
        {'id': 'era-tang', 'title': '唐朝', 'reason': '科举完善期'},
        {'id': 'tr-history-intro', 'title': '中国制度史', 'reason': '选官制度演进'},
        {'id': 'p-du-fu', 'title': '杜甫', 'reason': '科举未中典型'},
    ],
    'source': '📚 《新唐书·选举志》、刘海峰《科举学导论》、邓嗣禹《中国考试制度史》',
}

# === ce-016 本草纲目 ===
ENRICH['ce-016'] = {
    'facts': [
        {'label': '作者', 'value': '李时珍'},
        {'label': '成书年代', 'value': 'AD 1578 年（嘉靖三十一年）'},
        {'label': '初刊', 'value': 'AD 1596 年（金陵胡承龙刊本）'},
        {'label': '收录药物', 'value': '1892 种（新增 374 种）'},
        {'label': '插图', 'value': '1109 幅'},
        {'label': '字数', 'value': '约 190 万字'},
    ],
    'sections': [
        P('作者背景', '李时珍（1518-1593），湖北蕲春人，三代从医。他发现历代本草谬误甚多，决意重修。**27 年（1552-1578）撰成《本草纲目》**，参考 800 余种文献，亲历山川采药，访求四方。'),
        P('体系创新', '《本草纲目》打破历代《本草》按"上中下三品"分类，**首创"析族区类，振纲分目"**——按水、火、土、金石、草、谷、菜、果、木、服器、虫、鳞、介、禽、兽、人 16 部 60 类，体系严密。'),
        C('东方医药百科', '《本草纲目》是中国古代**最系统、最完整的药物学著作**，集 16 世纪前中国药学之大成。它被译为日、朝、拉丁、英、法、德、俄等多国文字，**影响全球药物学 400 年**。', 'success'),
        L('部类结构', ['水部（天水、地水）', '火部（土火、水火）', '土部（各种土壤）', '金石部（金、玉、石）', '草部（山草、芳草等 11 类）', '木部（乔木、灌木等 6 类）']),
        P('李时珍精神', '为编此书，李时珍**三次考功名不第**（秀才），转而从医；为采药亲自上山，**曾中毒七八次**；为验证"腐草为萤"之说，**夜宿茅亭数月**观察萤火虫——这种实证精神超越时代。'),
        Q('"医者，贵在格物。"', '李时珍引《本草纲目·凡例》'),
    ],
    'timeline': [
        {'year': 'AD 1552', 'era': '明嘉靖', 'event': '李时珍开始编撰'},
        {'year': 'AD 1578', 'era': '明万历', 'event': '《**本草纲目**》完稿'},
        {'year': 'AD 1596', 'era': '明万历', 'event': '**金陵**胡承龙首刻'},
        {'year': 'AD 1656', 'era': '清', 'event': '波兰人**卜弥格**译为拉丁文'},
        {'year': 'AD 1856', 'era': '近代', 'event': '英国人**达利** 译为英文'},
    ],
    'images': [
        {'imageKeyword': 'li shizhen physician portrait ming', 'caption': '李时珍画像', 'credit': '公共领域'},
        {'imageKeyword': 'bencao gangmu compendium book', 'caption': '《本草纲目》书影', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'chinese herbal medicine herbs', 'caption': '传统中草药', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'chinese herbal illustration drawing', 'caption': '本草插图', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'p-li-shizhen', 'title': '李时珍', 'reason': '作者'},
        {'id': 'era-ming', 'title': '明朝', 'reason': '成书年代'},
        {'id': 'tr-tech-med', 'title': '中医药', 'reason': '中医药集大成'},
        {'id': 'tr-history-intro', 'title': '中国科技史', 'reason': '百科全书式著作'},
    ],
    'source': '📚 李时珍《本草纲目》、钱超尘《本草纲目译注》、E. Bretschneider《Botanicon Sinicum》',
}

# === ce-017 蒙娜丽莎 ===
ENRICH['ce-017'] = {
    'facts': [
        {'label': '作者', 'value': '列奥纳多·达·芬奇'},
        {'label': '年代', 'value': '约 AD 1503-1519'},
        {'label': '尺寸', 'value': '77 × 53 cm（小型油画）'},
        {'label': '现藏', 'value': '巴黎卢浮宫'},
        {'label': '模特', 'value': '丽莎·乔宫多（佛罗伦萨丝绸商之妻）'},
        {'label': '影响', 'value': '西方艺术最著名的画作'},
    ],
    'sections': [
        P('创作背景', '约 1503 年，列奥纳多·达·芬奇（Leonardo da Vinci）应佛罗伦萨丝绸商人**弗朗切斯科·乔宫多**之托，为其妻**丽莎·乔宫多**（Lisa Gherardini del Giocondo）绘制肖像。达·芬奇 1506 年中断创作，1517 年法国国王弗朗索瓦一世邀请他赴法，画家把画带到法国。1519 年达·芬奇去世，此画留法国王室。'),
        P('艺术突破', '《蒙娜丽莎》代表文艺复兴艺术的最高成就：①**晕涂法（sfumato）**——以极薄透明油彩层叠形成烟雾般柔和过渡；②**金字塔构图**——人物姿态稳定庄严；③**背景大气透视**——远景山水如梦似幻；④**神秘微笑**——嘴角阴影处理使表情随观者角度变化。'),
        C('蒙娜丽莎效应', '这幅画的**艺术价值**已被超越为**文化符号**：1911 年被盗、1956 年被泼酸、2006 年被杯砸——但每一次"灾难"都使其知名度倍增。如今《蒙娜丽莎》是**全球最著名的画作**，每天约 30000 人在卢浮宫前排队观看。', 'success'),
        L('艺术特点', ['**晕涂法**（sfumato）柔和过渡', '**金字塔构图** 平衡稳定', '**背景虚化** 空气透视', '**解剖学**精确——达·芬奇兼任解剖学家', '**光学应用**——嘴唇阴影营造微笑']),
        P('未解之谜', '画作留下诸多谜团：①模特究竟是谁？②背景山水是哪里？④画作原本大小？⑤是否藏在达·芬奇自画像？这些问题至今没有定论，**给后世无数再创作以空间**。'),
        Q('"艺术乃大自然的镜像。"', '达·芬奇《笔记》'),
    ],
    'timeline': [
        {'year': 'AD 1503', 'era': '文艺复兴', 'event': '达·芬奇开始创作'},
        {'year': 'AD 1517', 'era': '文艺复兴', 'event': '达·芬奇将画带至**法国**'},
        {'year': 'AD 1519', 'era': '文艺复兴', 'event': '达·芬奇去世，画归**法王**'},
        {'year': 'AD 1911', 'era': '近代', 'event': '**卢浮宫**失窃案（两年后追回）'},
        {'year': 'AD 1962', 'era': '当代', 'event': '法国法律定为**国宝**禁止外借'},
    ],
    'images': [
        {'imageKeyword': 'mona lisa painting louvre', 'caption': '《蒙娜丽莎》原作', 'credit': 'Louvre / Wikimedia'},
        {'imageKeyword': 'leonardo da vinci portrait', 'caption': '达·芬奇自画像', 'credit': '公共领域'},
        {'imageKeyword': 'renaissance florence skyline', 'caption': '文艺复兴佛罗伦萨', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'louvre museum pyramid paris', 'caption': '卢浮宫金字塔', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'p-leonardo', 'title': '达·芬奇', 'reason': '作者'},
        {'id': 'era-renaissance', 'title': '文艺复兴', 'reason': '创作背景'},
        {'id': 'tr-history-art', 'title': '西方艺术', 'reason': '文艺复兴巅峰'},
        {'id': 'ce-018', 'title': '西斯廷教堂', 'reason': '同时代艺术高峰'},
    ],
    'source': '📚 Zöllner《Leonardo da Vinci: The Complete Paintings》、Kemp《Leonardo》、卢浮宫档案',
}

# === ce-018 西斯廷教堂天顶画 ===
ENRICH['ce-018'] = {
    'facts': [
        {'label': '作者', 'value': '米开朗琪罗'},
        {'label': '年代', 'value': 'AD 1508-1512'},
        {'label': '位置', 'value': '梵蒂冈西斯廷礼拜堂'},
        {'label': '面积', 'value': '约 460 平方米'},
        {'label': '人物数', 'value': '343 人（9 个圣经场景）'},
        {'label': '意义', 'value': '文艺复兴盛期艺术巅峰'},
    ],
    'sections': [
        P('创作背景', '1508 年教皇**尤利乌斯二世**委托 33 岁的米开朗琪罗为西斯廷礼拜堂绘制天顶。原计划由他人完成，但米开朗琪罗自告奋勇。**他以 4 年时间（1508-1512），独自仰头作画**，留下终身颈疾。'),
        P('画面结构', '天顶画分三部分：①中央 9 幅《创世纪》场景（上帝造世界、亚当堕落、诺亚方舟）；②周围 12 位先知与女预言家；③四角的旧约故事。**壁画按建筑结构精确对位**，中央是神创造人，最外圈是人类历史。'),
        C('孤身四年', '米开朗琪罗**独自一人**完成全部工作——拒绝助手，亲自调配颜料（湿壁画需当天完成）。他说："我画得精疲力竭，几乎像只猫——但我没有别的选择。"**这种为艺术献身的精神**成为文艺复兴艺术家的典范。', 'success'),
        L('九幅创世纪', ['**神分光暗**', '**神造日月星辰**', '**神分水陆**', '**神造亚当**（最著名）', '**神造夏娃**', '**原罪逐出乐园**', '**诺亚献祭**', '**大洪水**', '**诺亚醉酒**']),
        P('后续工程', '米开朗琪罗晚年又绘制了西斯廷礼拜堂**祭坛壁画《最后的审判》**（AD 1536-1541），面积 220 平方米，巨型裸体引发争议（后由助手遮掩）。'),
        Q('"我用了所有时间，就像经历了一场缓慢的死亡。"', '米开朗琪罗书信'),
    ],
    'timeline': [
        {'year': 'AD 1508', 'era': '文艺复兴', 'event': '教皇**尤利乌斯二世**委托'},
        {'year': 'AD 1511', 'era': '文艺复兴', 'event': '**天顶画** 主体完成'},
        {'year': 'AD 1512', 'era': '文艺复兴', 'event': '**西斯廷天顶画** 全部完工'},
        {'year': 'AD 1536', 'era': '文艺复兴', 'event': '**《最后的审判》** 开始'},
        {'year': 'AD 1541', 'era': '文艺复兴', 'event': '《最后的审判》完工'},
    ],
    'images': [
        {'imageKeyword': 'sistine chapel ceiling michelangelo', 'caption': '西斯廷教堂天顶画', 'credit': 'Vatican Museums'},
        {'imageKeyword': 'creation of adam michelangelo', 'caption': '《创造亚当》', 'credit': 'Vatican / Wikimedia'},
        {'imageKeyword': 'michelangelo sculptor painter portrait', 'caption': '米开朗琪罗画像', 'credit': '公共领域'},
        {'imageKeyword': 'sistine chapel last judgment', 'caption': '《最后的审判》', 'credit': 'Vatican Museums'},
    ],
    'related': [
        {'id': 'p-michelangelo', 'title': '米开朗琪罗', 'reason': '作者'},
        {'id': 'p-julius-ii', 'title': '尤利乌斯二世', 'reason': '委托人'},
        {'id': 'era-renaissance', 'title': '文艺复兴', 'reason': '创作背景'},
        {'id': 'ce-017', 'title': '蒙娜丽莎', 'reason': '同时代艺术高峰'},
    ],
    'source': '📚 Hall《Michelangelo: The Frescoes of the Sistine Chapel》、Mormando《Michelangelo: A Spiritual Journey》',
}

# === ce-019 古登堡圣经 ===
ENRICH['ce-019'] = {
    'facts': [
        {'label': '印刷者', 'value': '约翰内斯·古登堡'},
        {'label': '年代', 'value': 'AD 1455 年（美因茨）'},
        {'label': '印数', 'value': '约 180 部（其中 49 部存世）'},
        {'label': '页数', 'value': '1282 页'},
        {'label': '文字', 'value': '拉丁文'},
        {'label': '意义', 'value': '西方活字印刷的里程碑'},
    ],
    'sections': [
        P('印刷背景', '1440 年代，德国美因茨金匠**约翰内斯·古登堡**（Johannes Gutenberg）借鉴中国活字技术（经丝绸之路传播），发明**金属活字印刷机**。**1455 年印出《圣经》拉丁文译本**，共 180 部，每部 1282 页，分两卷。'),
        P('技术贡献', '古登堡的关键创新：①**金属合金活字**（铅、锡、锑、铜）；②**油性油墨**（亚麻仁油调和）；③**螺旋压印机**（借用葡萄酒压榨机原理）。三件合在一起使西方印刷进入工业化时代。'),
        C('信息爆炸', '《古登堡圣经》开启**印刷革命**：欧洲书籍年产量从手抄时代的数千册跃升到 1500 年的 1000 万册。这直接催化了**文艺复兴、宗教改革、启蒙运动**——**信息自由流动使现代性成为可能**。', 'success'),
        L('历史影响', ['书籍价格暴跌（手抄本 200 古登堡→印刷本 5 古登堡）', '识字率上升', '**马丁·路德**宗教改革（1517）', '**伽利略**科学著作普及', '**启蒙运动**思想传播']),
        P('成本问题', '古登堡为印《圣经》**耗尽家财**，合伙人约翰内斯·富斯特告他侵吞借款，最终败诉。古登堡晚年贫困，1468 年去世时默默无闻。'),
        Q('"印刷术改变了人类的思维方式。"', '麦克卢汉《理解媒介》'),
    ],
    'timeline': [
        {'year': 'AD 1450', 'era': '德意志', 'event': '**古登堡** 完成活字印刷机'},
        {'year': 'AD 1455', 'era': '德意志', 'event': '《**古登堡圣经**》印成'},
        {'year': 'AD 1500', 'era': '欧洲', 'event': '欧洲印书达 **1000 万册**'},
        {'year': 'AD 1517', 'era': '德意志', 'event': '路德《**九十五条论纲**》'},
        {'year': 'AD 2000', 'era': '当代', 'event': '纽约佳士得 **1100 万美元** 拍卖'},
    ],
    'images': [
        {'imageKeyword': 'gutenberg bible printed page', 'caption': '古登堡圣经书页', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'gutenberg printing press replica', 'caption': '古登堡印刷机（复制品）', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'johann gutenberg portrait', 'caption': '古登堡肖像', 'credit': '公共领域'},
        {'imageKeyword': 'mainz cathedral medieval', 'caption': '美因茨大教堂（古登堡城市）', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'ce-012', 'title': '活字印刷', 'reason': '技术源头'},
        {'id': 'ce-029', 'title': '古登堡印刷机', 'reason': '配套发明'},
        {'id': 'p-gutenberg', 'title': '古登堡', 'reason': '发明者'},
        {'id': 'ce-023', 'title': '九十五条论纲', 'reason': '印刷推动宗教改革'},
    ],
    'source': '📚 Eisenstein《The Printing Press as an Agent of Change》、Ingram《The Gutenberg Revolution》',
}

# === ce-020 埃涅阿斯纪 ===
ENRICH['ce-020'] = {
    'facts': [
        {'label': '作者', 'value': '维吉尔（Publius Vergilius Maro）'},
        {'label': '年代', 'value': 'BC 29-19'},
        {'label': '体裁', 'value': '史诗（12 卷）'},
        {'label': '行数', 'value': '9896 行'},
        {'label': '主角', 'value': '埃涅阿斯（特洛伊英雄）'},
        {'label': '影响', 'value': '罗马文学的最高峰 / 西方史诗典范'},
    ],
    'sections': [
        P('创作背景', '维吉尔（BC 70-19），古罗马奥古斯都时期诗人，受**屋大维（奥古斯都）**委托创作《埃涅阿斯纪》，目的是**为屋大维家族追溯神性谱系**——将凯撒家族追溯到特洛伊王子埃涅阿斯。维吉尔至死未能定稿，要求焚毁但屋大维保留。'),
        P('史诗结构', '史诗模仿荷马史诗，分两部分：①前 6 卷模仿《奥德赛》——埃涅阿斯漂泊（特洛伊陷落→地中海漂泊→迦太基女王狄多→意大利）；②后 6 卷模仿《伊利亚特》——意大利战争。**全书 9896 行拉丁六拍诗**。'),
        C('罗马国族史诗', '《埃涅阿斯纪》是**罗马帝国的"国族史诗"**，塑造了罗马人"天命所归"的意识。**关键诗句"罗马人的帝国没有止境"（Tu regere imperio populos）** 成为罗马扩张的精神支柱。', 'success'),
        L('重要主题', ['**Pietas**（虔敬、责任）——主角核心美德', '**Fatum**（命运）——罗马帝国天命', '**Labor**（劳苦）——英雄必历劫', '**Imperium**（帝国）——无止境的统治']),
        P('但丁的导师', '但丁《神曲》中**维吉尔是向导**，带领诗人穿越地狱与炼狱（天堂由贝阿特丽切引导）。**这象征维吉尔是"人智的最高"**——哲学理性所能达到的极限。'),
        Q('"Fuimus fuimus, olim fuimus!"', '《埃涅阿斯纪》拉丁原文片段（拉丁语古典范本）'),
    ],
    'timeline': [
        {'year': 'BC 70', 'era': '罗马共和国', 'event': '维吉尔出生'},
        {'year': 'BC 39', 'era': '罗马共和国', 'event': '发表《**农事诗**》'},
        {'year': 'BC 29', 'era': '罗马帝国前夕', 'event': '开始创作《**埃涅阿斯纪**》'},
        {'year': 'BC 19', 'era': '罗马帝国前夕', 'event': '维吉尔去世，诗未终稿'},
        {'year': 'AD 1308', 'era': '中世纪', 'event': '**但丁**以维吉尔为《神曲》向导'},
    ],
    'images': [
        {'imageKeyword': 'virgil aeneid manuscript medieval', 'caption': '《埃涅阿斯纪》中世纪手抄本', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'aeneas carrying anchises troy', 'caption': '埃涅阿斯背负父亲（名画）', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'virgil poet portrait classical', 'caption': '维吉尔古典肖像', 'credit': '公共领域'},
        {'imageKeyword': 'dante virgil inferno illustration', 'caption': '但丁与维吉尔（地狱篇插图）', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'p-virgil', 'title': '维吉尔', 'reason': '作者'},
        {'id': 'era-rome-empire', 'title': '罗马帝国', 'reason': '国族史诗'},
        {'id': 'ce-021', 'title': '神曲', 'reason': '维吉尔是但丁向导'},
        {'id': 'tr-history-art', 'title': '古典文学', 'reason': '西方史诗典范'},
    ],
    'source': '📚 维吉尔《埃涅阿斯纪》（杨周翰译本）、R. F. Anderson《The Art of the Aeneid》、Hardie《The Last Trojan Hero》',
}


# === ce-021 神曲 ===
ENRICH['ce-021'] = {
    'facts': [
        {'label': '作者', 'value': '但丁·阿利吉耶里'},
        {'label': '年代', 'value': 'AD 1308-1321'},
        {'label': '语种', 'value': '意大利语（托斯卡纳方言）'},
        {'label': '结构', 'value': '地狱、炼狱、天堂各 33 歌 + 序曲 1，共 100 歌'},
        {'label': '行数', 'value': '14233 行（三韵律）'},
        {'label': '意义', 'value': '意大利文艺复兴先声 / 世界文学巅峰'},
    ],
    'sections': [
        P('创作背景', '但丁（1265-1321），佛罗伦萨诗人、政治家。1302 年因党争被流放，终身未能归乡。流放期间他**以意大利语（而非拉丁语）创作《神曲》**，开创意大利文学语言——被誉为"意大利现代语言之父"。'),
        P('三界结构', '《神曲》虚构但丁在"人生中段"（35 岁）于黑暗森林迷路：①**地狱**（9 圈 33 歌）——按罪轻重惩罚；②**炼狱**（7 层 + 山顶伊甸园）——净化灵魂；③**天堂**（9 天 + 至高天）——与神合一。**全诗 14233 行三韵律诗**（aba bcb cdc ...）。'),
        C('意大利文学的奠基', '但丁选择**意大利方言**而非拉丁语写作，是文艺复兴最早的宣言。他确立了意大利民族语言，并**将神学、哲学、政治讽刺熔于一炉**——被认为预示文艺复兴的"人本主义"。', 'success'),
        L('三界结构', ['**地狱 9 圈**：淫欲→饕餮→贪婪→懒惰→愤怒→异端→暴力→欺诈→背叛', '**炼狱 7 层**：七大罪过逐层净化', '**天堂 9 天**：月球→水星→金星→太阳→火星→木星→土星→恒星天→水晶天', '**至高天**：神的光辉、贝阿特丽切显现']),
        P('政治寓意', '但丁将**佛罗伦萨政敌**（教皇博尼法八世等）置于地狱第八圈（欺诈），**自己的政治理想**（统一的世俗帝国）置于天堂最高层——**他用诗写出政治批判**。'),
        Q('"走过我，进入永恒之邦的人们，请把希望寄托在星辰之外。"', '但丁《神曲·地狱篇》铭文'),
    ],
    'timeline': [
        {'year': 'AD 1265', 'era': '中世纪', 'event': '但丁出生于佛罗伦萨'},
        {'year': 'AD 1302', 'era': '中世纪', 'event': '**但丁** 被流放'},
        {'year': 'AD 1308', 'era': '中世纪', 'event': '开始创作《**神曲**》'},
        {'year': 'AD 1321', 'era': '中世纪', 'event': '**但丁** 去世，《神曲》完稿'},
        {'year': 'AD 1865', 'era': '近代', 'event': '意大利建国，将但丁立为**国父**'},
    ],
    'images': [
        {'imageKeyword': 'dante alighieri portrait profile', 'caption': '但丁肖像', 'credit': '公共领域'},
        {'imageKeyword': 'dante inferno illustration botticelli', 'caption': '《神曲·地狱篇》插图（波提切利）', 'credit': 'Vatican Library'},
        {'imageKeyword': 'florence duomo renaissance skyline', 'caption': '佛罗伦萨大教堂（但丁之城）', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'dante beatrice paradise meeting', 'caption': '但丁与贝阿特丽切（天堂篇）', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'p-dante', 'title': '但丁', 'reason': '作者'},
        {'id': 'ce-020', 'title': '埃涅阿斯纪', 'reason': '维吉尔在神曲中是向导'},
        {'id': 'era-renaissance', 'title': '文艺复兴', 'reason': '意大利文艺复兴先声'},
        {'id': 'tr-history-art', 'title': '欧洲文学', 'reason': '世界文学巅峰'},
    ],
    'source': '📚 但丁《神曲》（王维克/朱维基译本）、Singleton《Dante\'s Commedia》、Kirkpatrick《Dante》',
}

# === ce-022 莎士比亚全集 ===
ENRICH['ce-022'] = {
    'facts': [
        {'label': '作者', 'value': '威廉·莎士比亚'},
        {'label': '年代', 'value': '约 AD 1589-1613（创作期）'},
        {'label': '剧目数', 'value': '37 部戏剧 + 154 首十四行诗'},
        {'label': '剧种', 'value': '悲剧、喜剧、历史剧、悲喜剧'},
        {'label': '语种', 'value': '早期现代英语'},
        {'label': '影响', 'value': '英语文学最高成就 / 世界戏剧之父'},
    ],
    'sections': [
        P('作者生平', '莎士比亚（1564-1616），英国埃文河畔斯特拉特福人，父亲手套商人。他 18 岁娶大 8 岁女子为妻，育三子女。1580 年代赴伦敦，先做剧场杂役、马夫，后成为演员、剧作家、合伙人。他**39 部戏剧、154 首十四行诗**成为英语文学的基石。'),
        P('剧目概览', '莎翁剧目按四大类分：①**喜剧** 17 部（《仲夏夜之梦》《威尼斯商人》《第十二夜》《皆大欢喜》等）；②**悲剧** 11 部（《哈姆雷特》《奥赛罗》《麦克白》《李尔王》《罗密欧与朱丽叶》等）；③**历史剧** 10 部（《亨利五世》《理查三世》《约翰王》等）；④**悲喜剧/传奇剧**（《暴风雨》《冬天的故事》等）。'),
        C('作品的奇迹', '莎士比亚**一生未上大学**，却写出 4 千词汇（同时代英语仅 2 千词汇）。**全球每年上演他的剧作逾 5 万场**，《哈姆雷特》"生存还是毁灭"是**全球最著名的独白**。', 'success'),
        L('四大悲剧', ['**《哈姆雷特》**——生存还是毁灭', '**《奥赛罗》**——嫉妒的毁灭', '**《麦克白》**——权力的腐败', '**《李尔王》**——人性的崩塌']),
        P('第一对开本', '1623 年，莎翁去世 7 年后，他的剧团同事**赫明奇与康德尔**整理出版**《第一对开本》（First Folio）**，收录 36 部剧作——若非此书，**约 18 部莎剧可能失传**（包括《麦克白》《李尔王》《第十二夜》等）。'),
        Q('"To be or not to be, that is the question."', '莎士比亚《哈姆雷特》第三幕第一场'),
    ],
    'timeline': [
        {'year': 'AD 1564', 'era': '都铎', 'event': '莎士比亚出生'},
        {'year': 'AD 1589', 'era': '都铎', 'event': '开始**戏剧创作**（推测）'},
        {'year': 'AD 1601', 'era': '斯图亚特', 'event': '**《哈姆雷特》** 首演'},
        {'year': 'AD 1616', 'era': '斯图亚特', 'event': '**莎士比亚** 去世'},
        {'year': 'AD 1623', 'era': '斯图亚特', 'event': '**《第一对开本》** 出版'},
    ],
    'images': [
        {'imageKeyword': 'shakespeare portrait chandos', 'caption': '莎士比亚钱多斯肖像', 'credit': '公共领域'},
        {'imageKeyword': 'globe theatre london model', 'caption': '环球剧场（重建）', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'shakespeare first folio book', 'caption': '《莎士比亚第一对开本》', 'credit': 'Folger Library'},
        {'imageKeyword': 'hamlet skull scene illustration', 'caption': '《哈姆雷特》"生存还是毁灭"', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'p-shakespeare', 'title': '莎士比亚', 'reason': '作者'},
        {'id': 'era-renaissance', 'title': '文艺复兴', 'reason': '创作背景'},
        {'id': 'tr-history-art', 'title': '欧洲文学', 'reason': '英语文学最高成就'},
        {'id': 'ce-021', 'title': '神曲', 'reason': '同时代欧洲文学'},
    ],
    'source': '📚 《莎士比亚全集》（朱生豪译本）、Greenblatt《Will in the World》、Schoenbaum《Shakespeare\'s Lives》',
}

# === ce-023 九十五条论纲 ===
ENRICH['ce-023'] = {
    'facts': [
        {'label': '作者', 'value': '马丁·路德'},
        {'label': '年代', 'value': 'AD 1517 年 10 月 31 日'},
        {'label': '发表地', 'value': '德国维滕堡'},
        {'label': '原文', 'value': '拉丁文'},
        {'label': '触发事件', 'value': '教廷发售"赎罪券"'},
        {'label': '意义', 'value': '欧洲宗教改革开端'},
    ],
    'sections': [
        P('背景', '16 世纪初，罗马教廷为修建圣彼得大教堂，**大规模发售"赎罪券"**（捐款可减免罪罚）。美因茨大主教**阿尔布莱希特**为偿债与教廷合谋，在德国发售赎罪券。这一敛财行为引发神学家**马丁·路德**愤怒。'),
        P('论纲内容', '1517 年 10 月 31 日，路德按神学论辩传统，将**《九十五条论纲》**钉在维滕堡教堂大门（后被传为传说，但来源是同时代信函）。论纲核心：①赎罪券无圣经依据；②悔改是内心而非金钱行为；③教宗权力不及上帝恩典。'),
        C('改革之火', '原本只是"学术辩论邀请"，却因**印刷术**（1455 年古登堡发明）使论纲 2 周内传遍德国、**2 个月**内传遍欧洲。教廷反击，路德拒不退让，**1521 年沃尔姆斯会议被宣判"异端"**——**欧洲宗教改革由此爆发**。', 'success'),
        L('五大唯独', ['**唯独圣经**（Sola Scriptura）', '**唯独恩典**（Sola Gratia）', '**唯独信心**（Sola Fide）', '**唯独基督**（Solus Christus）', '**唯独荣耀上帝**（Soli Deo Gloria）']),
        P('深远影响', '宗教改革导致欧洲**天主教、新教（路德宗、加尔文宗、英国国教）分裂**。**三十年战争**（1618-1648）使德国人口损失 1/3，**威斯特伐利亚和约**奠定现代民族国家体系。'),
        Q('"Here I stand, I can do no other."', '路德 1521 年沃尔姆斯会议答辩'),
    ],
    'timeline': [
        {'year': 'AD 1517', 'era': '德意志', 'event': '**路德** 发表《九十五条论纲》'},
        {'year': 'AD 1521', 'era': '神圣罗马', 'event': '**沃尔姆斯会议**判路德为异端'},
        {'year': 'AD 1525', 'era': '德意志', 'event': '**农民战争**（路德宗支持者）'},
        {'year': 'AD 1534', 'era': '英格兰', 'event': '亨利八世**脱离罗马教廷**'},
        {'year': 'AD 1648', 'era': '欧洲', 'event': '**威斯特伐利亚和约**'},
    ],
    'images': [
        {'imageKeyword': 'luther 95 theses door wittenberg', 'caption': '路德钉论纲（19 世纪绘画）', 'credit': '公共领域'},
        {'imageKeyword': 'martin luther portrait cranach', 'caption': '马丁·路德肖像（克拉纳赫画）', 'credit': '公共领域'},
        {'imageKeyword': 'worms diet 1521 luther', 'caption': '沃尔姆斯会议（19 世纪绘画）', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'reformation church protestant service', 'caption': '新教礼拜', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'p-luther', 'title': '马丁·路德', 'reason': '作者'},
        {'id': 'ce-019', 'title': '古登堡圣经', 'reason': '印刷术推动改革传播'},
        {'id': 'tr-religion-christianity', 'title': '基督教史', 'reason': '天主教-新教分裂'},
        {'id': 'ce-026', 'title': '人权宣言', 'reason': '个人权利觉醒'},
    ],
    'source': '📚 路德《九十五条论纲》、MacCulloch《The Reformation》、Dixon《The Reformation in Germany》',
}

# === ce-024 牛顿自然哲学的数学原理 ===
ENRICH['ce-024'] = {
    'facts': [
        {'label': '作者', 'value': '艾萨克·牛顿'},
        {'label': '成书年代', 'value': 'AD 1687 年'},
        {'label': '原文', 'value': '拉丁文'},
        {'label': '原名', 'value': 'Philosophiae Naturalis Principia Mathematica'},
        {'label': '核心', 'value': '三大运动定律 + 万有引力'},
        {'label': '影响', 'value': '现代科学奠基之作'},
    ],
    'sections': [
        P('成书背景', '1665-1666 年伦敦瘟疫期间，剑桥大学关闭，**牛顿返乡**。他在这段"奇迹之年"奠定了微积分、光学、引力三大发现。20 年后的 1684 年，哈雷、雷恩、胡克讨论行星运动问题无法解决，哈雷求助牛顿。**牛顿很快寄去一篇论文，并开始撰写《原理》**——1687 年正式出版。'),
        P('三大运动定律', '①**惯性定律**：物体保持静止或匀速直线运动，除非受外力；②**加速度定律**：F = ma；③**作用反作用定律**：作用力与反作用力大小相等方向相反。'),
        C('万有引力', '《原理》提出**万有引力定律**：F = G·(m₁m₂/r²)。这一公式**统一了苹果落地和月亮绕地**——从地面物体到天体运动由同一公式描述。**这是人类认知宇宙的伟大时刻**。', 'success'),
        L('三大卷', ['卷 1：物体运动（不受阻力）', '卷 2：物体运动（在阻尼介质中）', '卷 3：宇宙体系（万有引力 + 行星运动）']),
        P('历史地位', '《原理》是**现代科学的奠基之作**。它将数学引入物理，建立了**因果可预测的世界观**。爱因斯坦相对论在 1905-1915 年扩展了牛顿力学（高速/强引力），但牛顿仍是日常世界的完美近似。'),
        Q('"Hypotheses non fingo."', '牛顿《原理》第三卷：不杜撰假说'),
    ],
    'timeline': [
        {'year': 'AD 1666', 'era': '科学革命', 'event': '**牛顿** 家乡"奇迹年"'},
        {'year': 'AD 1684', 'era': '科学革命', 'event': '**哈雷** 拜访牛顿'},
        {'year': 'AD 1687', 'era': '科学革命', 'event': '《**自然哲学的数学原理**》出版'},
        {'year': 'AD 1727', 'era': '科学革命', 'event': '**牛顿** 去世（享年 84 岁）'},
        {'year': 'AD 1905', 'era': '近代', 'event': '**爱因斯坦** 狭义相对论'},
    ],
    'images': [
        {'imageKeyword': 'newton principia title page', 'caption': '《原理》第一版扉页', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'newton isaac portrait', 'caption': '牛顿肖像', 'credit': '公共领域'},
        {'imageKeyword': 'apple tree newton', 'caption': '"苹果树"（牛顿花园）', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'edmond halley comet portrait', 'caption': '哈雷（推动出版《原理》）', 'credit': '公共领域'},
    ],
    'related': [
        {'id': 'p-newton', 'title': '牛顿', 'reason': '作者'},
        {'id': 'p-halley', 'title': '哈雷', 'reason': '推动出版'},
        {'id': 'p-einstein', 'title': '爱因斯坦', 'reason': '扩展牛顿力学'},
        {'id': 'ce-025', 'title': '瓦特蒸汽机', 'reason': '科学革命应用'},
    ],
    'source': '📚 牛顿《自然哲学的数学原理》（王克迪译本）、Westfall《Never at Rest》、Cohen《Isaac Newton\'s Principia》',
}

# === ce-025 瓦特蒸汽机改良 ===
ENRICH['ce-025'] = {
    'facts': [
        {'label': '改良者', 'value': '詹姆斯·瓦特'},
        {'label': '年代', 'value': 'AD 1769 年（专利）'},
        {'label': '原始发明', 'value': '纽科门蒸汽机（1712）'},
        {'label': '核心创新', 'value': '独立冷凝器 + 双向作用 + 行星齿轮'},
        {'label': '意义', 'value': '工业革命核心动力'},
        {'label': '效率提升', 'value': '约 4 倍于纽科门机'},
    ],
    'sections': [
        P('改良背景', '蒸汽机并非瓦特发明——英国铁匠**托马斯·纽科门** 1712 年已造出实用蒸汽机，但效率极低（约 0.5%），只用于矿井抽水。1763 年，**格拉斯哥大学仪器修理工瓦特**受委托修理纽科门机模型，发现其 80% 蒸汽浪费在反复加热/冷却汽缸上。'),
        P('关键创新', '瓦特用了 10 年（1763-1776）逐步完善：①**独立冷凝器**（1769 专利）——蒸汽在汽缸外的冷凝器冷凝；②**双向作用**（1782）——活塞上下都做功；④**行星齿轮**（1781）——将往复运动转为旋转运动，使蒸汽机**驱动任何旋转机械**。'),
        C('工业革命的引擎', '改良后的蒸汽机效率提升 4 倍，**可用于驱动纺纱机、织布机、机床、轮船、火车**。1784 年瓦特机专利到期后迅速普及，**1800 年英国 1/5 工业动力来自蒸汽**。**这是"工业革命"的核心技术**，人类进入化石能源时代。', 'success'),
        L('应用领域', ['**纺织机械**——蒸汽纺纱机、织布机', '**交通**——汽船（富尔顿 1807）、火车（斯蒂芬森 1825）', '**冶金**——蒸汽鼓风机', '**采矿**——蒸汽抽水机', '**制造**——机床、磨坊']),
        P('瓦特单位', '为纪念瓦特，**国际单位制**以"瓦特"（W）命名功率单位——每秒 1 焦耳的能量转换即 1 瓦特。'),
        Q('"蒸汽机把人类从体力劳动中解放出来。"', '恩格斯《英国工人阶级状况》'),
    ],
    'timeline': [
        {'year': 'AD 1712', 'era': '英国', 'event': '**纽科门** 蒸汽机'},
        {'year': 'AD 1763', 'era': '英国', 'event': '**瓦特** 受命修理纽科门机'},
        {'year': 'AD 1769', 'era': '英国', 'event': '瓦特获得**冷凝器专利**'},
        {'year': 'AD 1782', 'era': '英国', 'event': '瓦特**双向作用**专利'},
        {'year': 'AD 1825', 'era': '英国', 'event': '**斯蒂芬森** 蒸汽机车'),
    ],
    'images': [
        {'imageKeyword': 'watt steam engine industrial', 'caption': '瓦特蒸汽机', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'james watt portrait industrial revolution', 'caption': '詹姆斯·瓦特肖像', 'credit': '公共领域'},
        {'imageKeyword': 'newcomen steam engine beam', 'caption': '纽科门蒸汽机', 'credit': '公共领域'},
        {'imageKeyword': 'industrial revolution factory 19th century', 'caption': '19 世纪蒸汽工厂', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'p-watt', 'title': '瓦特', 'reason': '改良者'},
        {'id': 'p-stephenson', 'title': '斯蒂芬森', 'reason': '蒸汽机车发明者'},
        {'id': 'ce-024', 'title': '牛顿原理', 'reason': '奠定热力学基础'},
        {'id': 'tr-history-intro', 'title': '工业革命', 'reason': '工业革命核心'},
    ],
    'source': '📚 卡伦布尔《瓦特蒸汽机》、Mokyr《The Enlightened Economy》、坎贝尔《The Coming of the Steam Age》',
}

# === ce-026 人权宣言 ===
ENRICH['ce-026'] = {
    'facts': [
        {'label': '通过年代', 'value': 'AD 1789 年 8 月 26 日'},
        {'label': '发布机构', 'value': '法国国民议会'},
        {'label': '条款数', 'value': '17 条'},
        {'label': '背景', 'value': '法国大革命'},
        {'label': '核心', 'value': '自由、平等、财产权、主权在民'},
        {'label': '影响', 'value': '现代人权思想奠基文件'},
    ],
    'sections': [
        P('背景', '1789 年 5 月，路易十六召开**三级会议**，第三等级（平民）与特权阶级冲突激化，国民议会宣告成立。7 月 14 日**攻陷巴士底狱**。8 月，国民议会通过**《人权与公民权宣言》**，简称为《人权宣言》。'),
        P('核心内容', '①人生而平等（**第 1 条**）；②主权在民（**第 3 条**）；③自由、财产、安全、反抗压迫是**自然权利**（**第 2 条**）；④法律面前人人平等；⑤言论自由、信仰自由；⑥财产权"神圣不可侵犯"。**它系统阐述了现代公民权利概念**。'),
        C('现代人权之母', '《人权宣言》是**人类历史上第一个系统的现代人权文件**。它直接启发了**美国《权利法案》**（1791）和**联合国《世界人权宣言》**（1948）。**"自由、平等、博爱"** 的口号从此传遍世界。', 'success'),
        L('关键条款', ['**第 1 条**：人生而自由、平等', '**第 2 条**：自然权利——自由、财产、安全、反抗压迫', '**第 3 条**：主权在民', '**第 4 条**：自由即有权做不害他人的事', '**第 6 条**：法律面前人人平等', '**第 17 条**：财产权神圣不可侵犯']),
        P('女性主义批评', '宣言第 1 条"人生而平等"，但**妇女**当时无权投票。1791 年**奥兰普·德古热**发表**《妇女权利宣言》**，尖锐批评："妇女生来就有和男人一样的权利。"——这是女权运动的奠基文本。'),
        Q('"Men are born and remain free and equal in rights."', '《人权宣言》第一句'),
    ],
    'timeline': [
        {'year': 'AD 1789.5', 'era': '法国大革命', 'event': '路易十六召开**三级会议**'},
        {'year': 'AD 1789.7.14', 'era': '法国大革命', 'event': '**攻陷巴士底狱**'},
        {'year': 'AD 1789.8.26', 'era': '法国大革命', 'event': '**《人权宣言》** 通过'},
        {'year': 'AD 1791', 'era': '法国', 'event': '奥兰普·德古热《**妇女权利宣言**》'},
        {'year': 'AD 1948', 'era': '联合国', 'event': '**《世界人权宣言》** 通过'},
    ],
    'images': [
        {'imageKeyword': 'declaration of rights of man 1789', 'caption': '《人权宣言》原本', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'storming bastille 1789 painting', 'caption': '攻陷巴士底狱', 'credit': '公共领域'},
        {'imageKeyword': 'olympe de gouges portrait', 'caption': '奥兰普·德古热', 'credit': '公共领域'},
        {'imageKeyword': 'french national assembly meeting', 'caption': '法国国民议会会议', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'p-lafayette', 'title': '拉法耶特', 'reason': '主要起草人之一'},
        {'id': 'p-jefferson', 'title': '杰斐逊', 'reason': '美国独立宣言也借鉴了它'},
        {'id': 'ce-023', 'title': '九十五条论纲', 'reason': '个人权利觉醒'},
        {'id': 'tr-history-intro', 'title': '启蒙运动', 'reason': '理性主义果实'},
    ],
    'source': '📚 《人权宣言》（法国国民议会）、Hunt《Inventing Human Rights》、肖厚国《〈人权宣言〉译注》',
}

# === ce-027 希腊字母表 ===
ENRICH['ce-027'] = {
    'facts': [
        {'label': '形成年代', 'value': '约 BC 800-700'},
        {'label': '地区', 'value': '希腊'},
        {'label': '字母数', 'value': '24 个'},
        {'label': '源头', 'value': '腓尼基字母'},
        {'label': '贡献', 'value': '首次出现元音字母'},
        {'label': '影响', 'value': '拉丁字母、斯拉夫字母的源头'},
    ],
    'sections': [
        P('字母起源', '腓尼基人（地中海东岸的航海民族）发明了**22 个辅音字母**（无元音），用于商业记账。约 BC 800-700 年，希腊人借用了这套字母，并**首创元音字母**（A、E、I、O、U）——**这是人类文字史的重大突破**。'),
        P('字母特点', '希腊字母**24 个**：包括 7 个元音和 17 个辅音。它按**发音部位**系统排列（唇音、舌音、齿音、喉音），**结构清晰、便于学习**。希腊字母还有**大小写两套**（大写多用于铭文，小写多用于抄本）。'),
        C('字母之母', '希腊字母是**拉丁字母的源头**——罗马借希腊字母创造拉丁字母，再演化出西方所有字母。**斯拉夫字母**（西里尔）也由希腊字母改造。**今天全球 30+ 种字母都源于希腊字母**。', 'success'),
        L('元音创造', ['**Α α**（a）— 来自腓尼基 aleph（牛）', '**Ε ε**（e）— 来自 heh（窗）', '**Ι ι**（i）— 来自 yod（手）', '**Ο ο**（o）— 来自 ayin（眼）', '**Υ υ**（u）— 来自 vav（钩）']),
        P('学术语言', '希腊字母至今仍是**数学、物理、天文等学科的通用符号**：π（圆周率）、Ω（电阻）、Φ（磁通）、Σ（求和）、Δ（变化量）。**这显示了希腊字母在西方知识体系中的核心地位**。'),
        Q('"ABC..."...希腊字母 Άλφα Βήτα Γάμμα...', '希腊字母诵读顺序（西方"ABC"的源头）'),
    ],
    'timeline': [
        {'year': 'BC 1050', 'era': '腓尼基', 'event': '**腓尼基字母** 形成'},
        {'year': 'BC 800', 'era': '希腊', 'event': '希腊借用**辅音字母**'},
        {'year': 'BC 730', 'era': '希腊', 'event': '添加**元音字母**'},
        {'year': 'BC 700', 'era': '希腊', 'event': '**希腊字母表** 成熟'},
        {'year': 'BC 600', 'era': '意大利', 'event': '**拉丁字母** 借自希腊'},
    ],
    'images': [
        {'imageKeyword': 'greek alphabet ancient inscription', 'caption': '希腊字母铭文', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'phoenician alphabet tablet', 'caption': '腓尼基字母表', 'credit': '公共领域'},
        {'imageKeyword': 'greek alphabet letters chart', 'caption': '希腊字母对照表', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'classical greek marble inscription', 'caption': '古典希腊铭文', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'era-ancient-greece', 'title': '古希腊', 'reason': '字母创造者'},
        {'id': 'tr-script-natural', 'title': '字母文字', 'reason': '元音字母创新'},
        {'id': 'ce-001', 'title': '甲骨文', 'reason': '对比东西方文字起源'},
        {'id': 'ce-034', 'title': '汉字统一', 'reason': '对比中文发展路径'},
    ],
    'source': '📚 Powell《Greek Alphabet》、Jeffery《The Local Scripts of Archaic Greece》、赫尔德《希腊字母史》',
}

# === ce-028 汉谟拉比法典石刻 ===
ENRICH['ce-028'] = {
    'facts': [
        {'label': '年代', 'value': '约 BC 1750 年'},
        {'label': '载体', 'value': '黑色玄武岩石柱'},
        {'label': '高度', 'value': '2.25 米'},
        {'label': '发现', 'value': 'AD 1901 年（法国考古队）'},
        {'label': '发现地', 'value': '伊朗苏萨（Susa）'},
        {'label': '现藏', 'value': '巴黎卢浮宫'},
    ],
    'sections': [
        P('石柱描述', '汉谟拉比法典石柱由**整块黑色玄武岩**雕成，高 2.25 米，圆周 1.65 米。柱顶浮雕为**太阳神沙马什**将权杖授予国王汉谟拉比的场景，象征"君权神授"。柱身刻有阿卡德语楔形文字，**约 8000 个字符**——前言、正文 282 条、结语。'),
        P('流散历史', '石柱原本立在**西巴尔（Sippar）**太阳神庙。BC 1595 年赫梯入侵巴比伦，石柱被掠。**BC 1158 年埃兰国王**攻陷巴比伦，将石柱作为战利品运至苏撒。**苏撒被毁后石柱被埋地下**。1901 年法国考古队**雅克·德·摩根**发现并运回巴黎。'),
        C('出土意义', '石柱出土是**20 世纪最重要的考古发现之一**。它使**亚述学**成为现代学科，**楔形文字**被系统破译（19 世纪中叶）。此前美索不达米亚文明主要靠圣经传说认知——**石柱实证了《圣经》之外的真实历史**。', 'success'),
        L('石柱层次', ['顶部浮雕：沙马什授法', '前言：汉谟拉比自我颂扬', '正文 282 条：法律条文', '结语：汉谟拉比告诫后王']),
        P('收藏争议', '石柱自 1901 年起一直在**卢浮宫**，伊拉克政府多次要求归还未果——这是**文物归还运动**的典型案例。'),
        Q('"使正义照耀大地，消灭邪恶之徒。"', '汉谟拉比法典前言'),
    ],
    'timeline': [
        {'year': 'BC 1750', 'era': '古巴比伦', 'event': '石柱刻成立于**西巴尔**'},
        {'year': 'BC 1595', 'era': '赫梯入侵', 'event': '巴比伦陷落'},
        {'year': 'BC 1158', 'era': '埃兰', 'event': '石柱被掠至**苏萨**'},
        {'year': 'AD 1901', 'era': '近代', 'event': '**法国考古队** 发现'},
        {'year': 'AD 1903', 'era': '近代', 'event': '石柱入藏**卢浮宫**'},
    ],
    'images': [
        {'imageKeyword': 'hammurabi stele full height louvre', 'caption': '汉谟拉比法典石柱（卢浮宫）', 'credit': 'Louvre'},
        {'imageKeyword': 'shamash hammurabi relief top', 'caption': '沙马什授法浮雕', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'susa ancient ruins persia', 'caption': '苏萨遗址', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'cuneiform tablet close up', 'caption': '楔形文字细节', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'ce-002', 'title': '汉谟拉比法典', 'reason': '同一法典不同描述'},
        {'id': 'era-old-babylonian', 'title': '古巴比伦', 'reason': '法典所属王朝'},
        {'id': 'era-mesopotamia', 'title': '美索不达米亚', 'reason': '两河文明'},
        {'id': 'ce-005', 'title': '罗马十二铜表法', 'reason': '比较早期成文法'},
    ],
    'source': '📚 Harper《The Code of Hammurabi》、Roth《Law Collections from Mesopotamia》、Lloyd《The Archaeology of Mesopotamia》',
}

# === ce-029 古登堡印刷机 ===
ENRICH['ce-029'] = {
    'facts': [
        {'label': '发明者', 'value': '约翰内斯·古登堡'},
        {'label': '年代', 'value': '约 AD 1440-1450'},
        {'label': '地点', 'value': '德国美因茨'},
        {'label': '核心技术', 'value': '金属活字 + 螺旋压印机 + 油性墨'},
        {'label': '首批产品', 'value': '《古登堡圣经》（AD 1455）'},
        {'label': '意义', 'value': '现代印刷工业的开端'},
    ],
    'sections': [
        P('发明背景', '15 世纪欧洲抄书效率极低（每本《圣经》需 170 张羊皮纸，抄写 1 年）。**1450 年前后**，德国美因茨金匠**约翰内斯·古登堡**（约 1398-1468）结合三项已知技术发明**金属活字印刷机**：①金属合金活字（铸字）；②**螺旋压印机**（借用葡萄酒压榨机原理）；③**油性油墨**（亚麻仁油调和）。'),
        P('技术细节', '古登堡的金属活字由**铅、锡、锑合金**铸造（每字一印），活字固定在木板上，涂油墨，覆纸，转动螺旋压印。每个零件都经过精密切算，使**每小时可印 250 张**——是手抄的 50 倍。'),
        C('传播之快', '古登堡机发明后，**15 世纪末欧洲已有 250 多家印刷所**，出版了 **2000 万册**书籍。**1492 年哥伦布航行所携地图、《九十五条论纲》（1517）、《天体运行论》（1543）** 都通过印刷传播。**这是信息革命的开端**。', 'success'),
        L('三项创新', ['**金属合金活字**（铅+锡+锑+铜）', '**螺旋压印机**（葡萄酒压榨机原理）', '**油性油墨**（亚麻仁油）', '**可调整字模**（matrix）']),
        P('经济后果', '印刷机使**书籍价格暴跌 80%**：手抄本 200 古登堡→印刷本 5 古登堡。**识字率上升**，中世纪大学教材广泛流传，**推动了文艺复兴、宗教改革、启蒙运动**——**从根本上改变了人类社会**。'),
        Q('"印刷术是文艺复兴最重要的工具。"', '伊丽莎白·爱森斯坦《作为变革动因的印刷机》'),
    ],
    'timeline': [
        {'year': 'AD 1440', 'era': '德意志', 'event': '**古登堡** 开始实验'},
        {'year': 'AD 1450', 'era': '德意志', 'event': '印刷机技术成熟'},
        {'year': 'AD 1455', 'era': '德意志', 'event': '《**古登堡圣经**》印成'},
        {'year': 'AD 1500', 'era': '欧洲', 'event': '欧洲印书达 **1000 万册**'},
        {'year': 'AD 1810', 'era': '英国', 'event': '**蒸汽印刷机** 出现'},
    ],
    'images': [
        {'imageKeyword': 'gutenberg press replica mechanical', 'caption': '古登堡印刷机复制品', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'metal movable type blocks letters', 'caption': '金属活字', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'old printing shop medieval', 'caption': '中世纪印刷工坊', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'oil based printing ink historical', 'caption': '古代油性印刷墨', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'ce-019', 'title': '古登堡圣经', 'reason': '印刷机首批产品'},
        {'id': 'ce-012', 'title': '活字印刷', 'reason': '中国活字先驱'},
        {'id': 'p-gutenberg', 'title': '古登堡', 'reason': '发明者'},
        {'id': 'ce-023', 'title': '九十五条论纲', 'reason': '印刷推动改革'},
    ],
    'source': '📚 Eisenstein《The Printing Press as an Agent of Change》、Ingram《The Gutenberg Revolution》、Pettegree《The Book in the Renaissance》',
}

# === ce-030 印度教形成 ===
ENRICH['ce-030'] = {
    'facts': [
        {'label': '形成年代', 'value': '约 BC 1500-500'},
        {'label': '地区', 'value': '印度次大陆'},
        {'label': '核心经典', 'value': '《吠陀》《奥义书》《薄伽梵歌》'},
        {'label': '核心教义', 'value': '梵我一如、轮回解脱'},
        {'label': '主要神祇', 'value': '梵天、毗湿奴、湿婆'},
        {'label': '信徒', 'value': '约 12 亿（全球第三大宗教）'},
    ],
    'sections': [
        P('起源', '印度教（Hinduism）并非某个创始人建立的宗教，而是**印度次大陆原住民宗教传统的延续与演变**。约 BC 1500 年雅利安人进入印度，带来《吠陀》经典；与本土达罗毗荼人信仰融合，逐步演变为印度教。'),
        P('经典体系', '印度教经典分四部分：①**《吠陀本集》**（Vedas）—— 颂神诗集；②**《梵书》**（Brahmanas）——祭祀仪式；③**《森林书》**（Aranyakas）；④**《奥义书》**（Upanishads）——哲学核心；⑤**《薄伽梵歌》**——史诗《摩诃婆罗多》核心。'),
        C('印度文明的核心', '印度教不只是宗教，更是**印度文明的底层操作系统**：种姓制度、瑜伽、苦行、节庆（如排灯节 Diwali）、婚姻习俗都源于此。**它不像其他宗教有明确创始人**，所以有人称之为"**印度教生活方式**"。', 'success'),
        L('三大主神', ['**梵天**（Brahma）——创造之神', '**毗湿奴**（Vishnu）——保护之神', '**湿婆**（Shiva）——毁灭与重生']),
        P('佛教的母体', '佛教、耆那教都源于印度教传统（公元前 6 世纪"沙门思潮"）。**佛教兴起后，印度教吸收佛教元素（如菩萨、舍利塔）继续发展**。'),
        Q('"Tat tvam asi."（你是那。）', '《奥义书》——梵我一如'),
    ],
    'timeline': [
        {'year': 'BC 1500', 'era': '吠陀期', 'event': '**雅利安人**入印，吠陀形成'},
        {'year': 'BC 900', 'era': '梵书期', 'event': '祭祀仪式制度化'},
        {'year': 'BC 600', 'era': '奥义书期', 'event': '《**奥义书**》哲学反思'},
        {'year': 'BC 400', 'era': '史诗期', 'event': '《**薄伽梵歌**》编入《摩诃婆罗多》'},
        {'year': 'AD 800', 'era': '中世纪', 'event': '**商羯罗** 改革印度教'},
    ],
    'images': [
        {'imageKeyword': 'hindu temple ornate sculpture', 'caption': '印度教神庙雕刻', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'shiva nataraja bronze statue', 'caption': '湿婆舞蹈之王（铜像）', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'ganges river varanasi ghats', 'caption': '恒河瓦拉纳西', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'om symbol sanskrit hindu', 'caption': '"唵"（Om）——印度教象征', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'ce-031', 'title': '佛教创立', 'reason': '源于印度教'},
        {'id': 'tr-religion-hinduism', 'title': '印度教传统', 'reason': '印度教历史'},
        {'id': 'era-ancient-india', 'title': '古印度', 'reason': '文明所在'},
        {'id': 'tr-myth-shiva', 'title': '湿婆神话', 'reason': '三大主神'},
    ],
    'source': '📚 Flood《An Introduction to Hinduism》、Doniger《The Hindus: An Alternative History》、Radhakrishnan《Indian Philosophy》',
}


# === ce-031 佛教创立 ===
ENRICH['ce-031'] = {
    'facts': [
        {'label': '创始人', 'value': '乔达摩·悉达多（释迦牟尼）'},
        {'label': '年代', 'value': '约 BC 528 年（35 岁觉悟）'},
        {'label': '地区', 'value': '古印度·迦毗罗卫（今尼泊尔蓝毗尼）'},
        {'label': '核心教义', 'value': '四圣谛、八正道、十二因缘'},
        {'label': '主要经典', 'value': '三藏（经、律、论）'},
        {'label': '信徒', 'value': '约 5 亿（全球第四大宗教）'},
    ],
    'sections': [
        P('创立背景', '乔达摩·悉达多（约 BC 563-483），**释迦族**王子，迦毗罗卫国（今尼泊尔境内）王子。他 29 岁出家修道，35 岁在**菩提伽耶**一棵菩提树下证悟（"佛陀"），从此开始**45 年传教**，80 岁涅槃。'),
        P('核心教义', '①**四圣谛**（苦、集、灭、道）；②**八正道**（正见、正思维、正语、正业、正命、正精进、正念、正定）；③**十二因缘**（无明→行→识→名色→六入→触→受→爱→取→有→生→老死）；④**缘起性空**；⑤**三法印**（诸行无常、诸法无我、涅槃寂静）。'),
        C('从王子到觉者', '佛陀放弃王子身份（"金盆洗手"）的举动，**开辟了世界宗教史的先例**——东方世界从此有了"**主动放弃世俗权力**"的觉悟传统。这一传统深刻影响了印度、中国、韩国、日本的禅修文化。', 'success'),
        L('传教核心', ['**第一次说法**：鹿野苑（**初转法轮**）', '**主要听众**：国王、商人、农民、妓女、贱民', '**核心弟子**：舍利弗、目犍连、阿难', '**僧团**：比丘、比丘尼二众', '**国王皈依**：摩揭陀国王阿阇世']),
        P('汉传与藏传', '佛教沿两条路线传播：①**北传**（汉传、藏传）—— 强调成佛度众生（大乘）；②**南传**（上座部）—— 强调个人解脱（原始佛教）。**佛教传入中国（汉代）**，与中国本土文化深度融合，形成禅宗、净土宗等八大宗派。'),
        Q('"凡所有相，皆是虚妄。"', '《金刚经》核心偈'),
    ],
    'timeline': [
        {'year': 'BC 563', 'era': '古印度', 'event': '**乔达摩·悉达多** 出生（蓝毗尼）'},
        {'year': 'BC 534', 'era': '古印度', 'event': '**出家** 求道'},
        {'year': 'BC 528', 'era': '古印度', 'event': '**菩提伽耶** 证悟成佛'},
        {'year': 'BC 483', 'era': '古印度', 'event': '佛陀**涅槃**'},
        {'year': 'AD 67', 'era': '汉代', 'event': '**佛教** 正式传入中国'},
    ],
    'images': [
        {'imageKeyword': 'buddha statue meditating banyan tree', 'caption': '佛陀菩提伽耶像', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'bodh gaya temple pilgrimage', 'caption': '菩提伽耶（佛陀证悟地）', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'buddha first sermon deer park', 'caption': '鹿野苑初转法轮', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'buddhist monk saffron robe meditation', 'caption': '佛教僧侣修行', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'ce-030', 'title': '印度教形成', 'reason': '佛教源于印度教传统'},
        {'id': 'ce-014', 'title': '敦煌莫高窟', 'reason': '佛教艺术宝库'},
        {'id': 'tr-religion-buddhism', 'title': '佛教传统', 'reason': '佛教在中国的发展'},
        {'id': 'p-buddha', 'title': '释迦牟尼', 'reason': '创始人'},
    ],
    'source': '📚 释迦牟尼原始教义、Robinson《What Buddhists Believe》、Rahula《What the Buddha Taught》',
}

# === ce-032 基督教创立 ===
ENRICH['ce-032'] = {
    'facts': [
        {'label': '创立年代', 'value': '约 AD 30 年'},
        {'label': '地区', 'value': '犹太行省（罗马帝国）'},
        {'label': '创始人', 'value': '耶稣基督'},
        {'label': '核心教义', 'value': '三位一体、救赎、复活'},
        {'label': '主要经典', 'value': '《圣经》（旧约+新约）'},
        {'label': '信徒', 'value': '约 24 亿（全球第一大宗教）'},
    ],
    'sections': [
        P('创立背景', '**耶稣基督**（约 BC 4-AD 30），巴勒斯坦地区犹太人。他 30 岁开始传道，宣讲"**天国近了，你们应当悔改**"。他宣称自己是**弥赛亚（救世主）**、神的儿子。因挑战犹太教祭司权威和罗马统治，被钉十字架。**第三日复活**——这是基督教的核心信仰。'),
        P('发展历程', '耶稣死后，**门徒**（特别是保罗、彼得）将他的教训传遍地中海世界。**公元 313 年君士坦丁**颁布**米兰敕令**，基督教获得合法地位；**公元 392 年狄奥多西**定基督教为罗马国教。'),
        C('世界最大宗教', '基督教是**全球第一大宗教**（24 亿信徒，约占世界人口 1/3）。它直接塑造了**西方文明**的核心：法律、道德、艺术、哲学、语言。它也是**传教士最成功的全球宗教**——传遍全球每个角落。', 'success'),
        L('主要教派', ['**罗马天主教**（11 亿）—— 教皇制、圣事', '**东正教**（2 亿）—— 君士坦丁堡传统', '**新教**（8 亿）—— 16 世纪宗教改革产物', '**福音派**（快速增长）', '**圣公会**（英国国教延续）']),
        P('与犹太教关系', '基督教脱胎于**犹太教**——耶稣和早期门徒都是犹太人。新约是用**希腊文**写成（不是希伯来文），面向非犹太信徒。基督教既继承犹太教经典（旧约），又增添新约——形成"**新旧约圣经**"。'),
        Q('"God so loved the world that he gave his one and only Son."', '《约翰福音》3:16'),
    ],
    'timeline': [
        {'year': 'AD 30', 'era': '罗马帝国', 'event': '**耶稣** 被钉十字架、复活'},
        {'year': 'AD 313', 'era': '罗马帝国', 'event': '**米兰敕令**，基督教合法化'},
        {'year': 'AD 392', 'era': '罗马帝国', 'event': '**狄奥多西** 定基督教为国教'},
        {'year': 'AD 1054', 'era': '中世纪', 'event': '**东西教会大分裂**'},
        {'year': 'AD 1517', 'era': '近代', 'event': '**宗教改革**（路德、加尔文）'},
    ],
    'images': [
        {'imageKeyword': 'jesus crucifixion religious painting', 'caption': '耶稣受难（古典绘画）', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'jerusalem old city church holy sepulchre', 'caption': '耶路撒冷圣墓教堂', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'last supper leonardo', 'caption': '达·芬奇《最后的晚餐》', 'credit': '公共领域'},
        {'imageKeyword': 'vatican st peters basilica rome', 'caption': '圣彼得大教堂', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'ce-033', 'title': '可兰经成书', 'reason': '三大亚伯拉罕宗教之一'},
        {'id': 'ce-023', 'title': '九十五条论纲', 'reason': '宗教改革'},
        {'id': 'ce-018', 'title': '西斯廷教堂', 'reason': '基督教艺术'},
        {'id': 'tr-religion-christianity', 'title': '基督教史', 'reason': '完整基督教历史'},
    ],
    'source': '📚 《新约圣经》、Gonzalez《The Story of Christianity》、Brown《An Introduction to the New Testament》',
}

# === ce-033 可兰经成书 ===
ENRICH['ce-033'] = {
    'facts': [
        {'label': '通过对象', 'value': '先知穆罕默德'},
        {'label': '年代', 'value': '约 AD 610-632'},
        {'label': '定本年代', 'value': 'AD 650 年（奥斯曼哈里发时期）'},
        {'label': '语种', 'value': '阿拉伯语'},
        {'label': '章节数', 'value': '114 章（苏拉）'},
        {'label': '信徒', 'value': '约 19 亿（全球第二大宗教）'},
    ],
    'sections': [
        P('降示背景', '穆罕默德（约 AD 570-632），麦加古莱什部落哈希姆家族出身。他 40 岁（约 AD 610）在**希拉山洞**独修时，**天使吉卜利勒（加百列）**首次降示《古兰经》。此后 22 年，零星启示断断续续降下，**第三任哈里发奥斯曼**将其编纂为标准文本。'),
        P('核心教义', '①**信安拉**（唯一神，99 个美名）；②**信天使**（吉卜利勒、米卡伊勒等）；③**信经典**（《古兰经》外还有《讨拉特》《引支勒》《宰逋尔》原版）；④**信先知**（阿丹、易卜拉欣、穆萨、尔萨、穆罕默德）；⑤**信末日**（复生日与审判）；⑥**信前定**（taqdir）。'),
        C('阿拉伯语的统一', '《古兰经》被穆斯林视为**安拉原话的复制**——是**人类语言的完美版本**。这促使穆斯林**排斥《古兰经》翻译**（翻译本被视为"注释"），从而**保存了阿拉伯语的统一性**：从摩洛哥到伊拉克，所有阿拉伯国家读同一版本《古兰经》。', 'success'),
        L('核心主题', ['**认主独一**（Tawhid）', '**末日审判**（Yawm al-Qiyamah）', '**先知故事**（阿丹、易卜拉欣、穆萨、尔萨）', '**伦理法律**（礼拜、斋戒、天课、朝觐）', '**善恶报应**（天堂与火狱）']),
        P('亚伯拉罕传统', '伊斯兰教属**亚伯拉罕一神教传统**，与犹太教、基督教同源。**穆斯林称犹太教徒和基督徒为"有经者"（Ahl al-Kitab）**——共同敬拜同一神。'),
        Q('"Inna lillahi wa inna ilayhi raji\'un."', '《古兰经》2:156——"我们确属安拉，我们将归于他"'),
    ],
    'timeline': [
        {'year': 'AD 570', 'era': '阿拉伯', 'event': '**穆罕默德** 出生（麦加）'},
        {'year': 'AD 610', 'era': '阿拉伯', 'event': '**希拉山洞**首次降示'},
        {'year': 'AD 622', 'era': '阿拉伯', 'event': '**希吉拉**迁至麦地那'},
        {'year': 'AD 632', 'era': '阿拉伯', 'event': '**穆罕默德** 去世'},
        {'year': 'AD 650', 'era': '阿拉伯', 'event': '**奥斯曼哈里发** 确立定本'},
    ],
    'images': [
        {'imageKeyword': 'quran ancient manuscript arabic', 'caption': '《古兰经》古抄本', 'credit': '公共领域'},
        {'imageKeyword': 'mecca kaaba mosque', 'caption': '麦加克尔白', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'prophet mohammad historical calligraphy', 'caption': '穆罕默德书法艺术', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'mosque dome arabesque architecture', 'caption': '清真寺建筑', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'ce-032', 'title': '基督教创立', 'reason': '亚伯拉罕传统'},
        {'id': 'tr-religion-islam', 'title': '伊斯兰教', 'reason': '伊斯兰教传统'},
        {'id': 'ce-030', 'title': '印度教形成', 'reason': '全球主要宗教对比'},
        {'id': 'p-mohammed', 'title': '穆罕默德', 'reason': '先知'},
    ],
    'source': '📚 《古兰经》（马坚译本）、Esposito《Islam: The Straight Path》、Watt《Muhammad: Prophet and Statesman》',
}

# === ce-034 汉字统一 ===
ENRICH['ce-034'] = {
    'facts': [
        {'label': '年代', 'value': 'BC 221 年（秦统一六国）'},
        {'label': '推行者', 'value': '秦始皇、李斯'},
        {'label': '基础', 'value': '秦国大篆'},
        {'label': '规范', 'value': '小篆（"书同文"）'},
        {'label': '其他统一', 'value': '度量衡（"车同轨"）、货币、车轨'},
        {'label': '意义', 'value': '汉字传承 2200 年的基础'},
    ],
    'sections': [
        P('统一背景', '春秋战国时期，各国**语言异声、文字异形**——同一字在各国写法不同。秦统一六国后（前 230-221），**丞相李斯**主持整理文字，废除六国异体字，**以秦国大篆为基础创制"小篆"**——这就是"书同文"。'),
        P('配套制度', '秦始皇同步推行：①**车同轨**——统一车轮距（轨距 6 尺）；②**度量衡**——统一斗、斤、尺；③**货币**——以秦"半两"钱统一六国货币；④**律令**——以秦律统一六国。这些都是**中央集权的物质基础**。'),
        C('文化认同的根本', '汉字统一使中国 2200 年来**语言可隔代通**——2000 年前的汉朝人文章今天能读懂。**这是中华文明延续性的根本保证**——欧洲各国语言虽都源于拉丁语，但因文字标准化失败，**没有一种文字覆盖全欧洲**。', 'success'),
        L('统一行动', ['**书同文**（汉字统一为小篆）', '**车同轨**（统一轨距 6 尺）', '**统一度量衡**（斗、斤、尺）', '**统一货币**（半两钱）', '**修驰道**（全国交通网）', '**筑长城**（统一边防）']),
        P('书同文工程', '李斯作《**仓颉篇**》、赵高作《**爰历篇**》、胡毋敬作《**博学篇**》，共 3300 字作为标准教材，颁行全国。秦代后期"**隶书**"逐渐取代小篆，简化笔画。**隶书至汉代成熟**，成为此后 2000 年汉字的基础字体。'),
        Q('"书同文，车同轨，行同伦。"', '《礼记·中庸》——秦统一后的制度总结'),
    ],
    'timeline': [
        {'year': 'BC 230', 'era': '秦', 'event': '**秦** 开始统一战争'},
        {'year': 'BC 221', 'era': '秦', 'event': '**秦** 统一六国'},
        {'year': 'BC 221', 'era': '秦', 'event': '李斯推行**书同文**'},
        {'year': 'BC 213', 'era': '秦', 'event': '**焚书坑儒**'},
        {'year': 'BC 200', 'era': '汉', 'event': '**隶书** 取代小篆成为主流'},
    ],
    'images': [
        {'imageKeyword': 'qin shihuang terracotta warrior', 'caption': '秦始皇兵马俑', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'small seal script characters qin', 'caption': '秦小篆字体', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'li si qin calligrapher', 'caption': '李斯（书同文主持者）', 'credit': '公共领域'},
        {'imageKeyword': 'chinese bamboo slip writing', 'caption': '秦汉简牍书写', 'credit': 'Wikimedia Commons'},
    ],
    'related': [
        {'id': 'ce-001', 'title': '甲骨文诞生', 'reason': '汉字源头'},
        {'id': 'p-qin-shi-huang', 'title': '秦始皇', 'reason': '推行统一'},
        {'id': 'p-li-si', 'title': '李斯', 'reason': '书同文主持'},
        {'id': 'era-qin', 'title': '秦朝', 'reason': '统一年代'},
    ],
    'source': '📚 许慎《说文解字》、王力《古代汉语》、William Boltz《The Origin and Development of Chinese Writing》',
}

# === ce-035 古罗马十二铜表法 ===
ENRICH['ce-035'] = {
    'facts': [
        {'label': '年代', 'value': 'BC 451-450'},
        {'label': '地区', 'value': '罗马共和国'},
        {'label': '条文数', 'value': '约 450 条（12 表）'},
        {'label': '起草', 'value': '十人立法委员会'},
        {'label': '目的', 'value': '限制贵族司法特权'},
        {'label': '意义', 'value': '罗马法基础 / 大陆法系源头'},
    ],
    'sections': [
        P('立法背景', '罗马共和国早期**实行习惯法**，法律由贵族祭司阶层（Pontifex）把持。**法律未成文**，贵族可以随意解释，对平民不公。**BC 494 年平民撤离运动**后，平民争得保民官；BC 462 年提议成文法；**BC 451 年十人立法委员会赴希腊考察**，最后形成 12 表法。'),
        P('法律内容', '原文刻于 12 块青铜牌（故名"十二表"），内容分：①**诉讼程序**（传唤、审理、执行）；②**家庭法**（家长权、婚姻、继承）；③**财产法**（所有权、占有、债）；④**侵权法**；⑤**刑法**；⑥**公法与宗教法**。条文**简短具体**（如"断自由人骨者罚 300 阿斯"）。'),
        C('公私契约之母', '《十二铜表法》是**平民对贵族长期斗争的胜利**——它将法律从秘密变为公开文本，**限制贵族随意解释法律**。西塞罗称之为**"一切公私契约之母"**。**它是罗马法的源头**，经中世纪注释法学派传承，**成为现代大陆法系（法德日）的根源**。', 'success'),
        L('十二表', ['**第一表**：传唤与审判', '**第二表**：审理', '**第三表**：执行', '**第四表**：家长权', '**第五表**：继承与监护', '**第六表**：所有权与占有', '**第七表**：地役权与相邻关系', '**第八表**：侵权法', '**第九表**：刑法', '**第十表**：宗教法', '**第十一表**：补充法（一）', '**第十二表**：补充法（二）']),
        P('文本命运', '**原 12 表铜牌在 BC 390 年高卢人入侵罗马时被毁**。但内容通过**法学家的引用**（西塞罗、盖尤斯《法学阶梯》）**部分保存**。后世编纂的"十二表"多为后世复原。'),
        Q('"Summa ius summa iniuria."', '古罗马格言："最严的法就是最大的不公"——批评严格执法'),
    ],
    'timeline': [
        {'year': 'BC 494', 'era': '罗马共和国', 'event': '平民**第一次撤离**运动'},
        {'year': 'BC 462', 'era': '罗马共和国', 'event': '保民官**提出成文法**要求'},
        {'year': 'BC 451', 'era': '罗马共和国', 'event': '**十人立法委员会** 赴希腊考察'},
        {'year': 'BC 450', 'era': '罗马共和国', 'event': '**十二铜表法** 颁布'},
        {'year': 'BC 390', 'era': '罗马共和国', 'event': '原铜表**毁于高卢入侵**'},
    ],
    'images': [
        {'imageKeyword': 'roman forum ruins columns', 'caption': '罗马广场遗址', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'twelve tables illustration engraving', 'caption': '十二铜表法版画', 'credit': '公共领域'},
        {'imageKeyword': 'roman bronze tablet inscription', 'caption': '罗马青铜铭牌', 'credit': 'Wikimedia Commons'},
        {'imageKeyword': 'roman consul senate roman republic', 'caption': '罗马共和国元老院', 'credit': '公共领域'},
    ],
    'related': [
        {'id': 'ce-005', 'title': '罗马十二铜表法', 'reason': '同一法典不同描述'},
        {'id': 'era-rome-republic', 'title': '罗马共和国', 'reason': '法典所属政体'},
        {'id': 'ce-002', 'title': '汉谟拉比法典', 'reason': '更早的成文法典'},
        {'id': 'tr-history-law', 'title': '古代法律', 'reason': '大陆法系源头'},
    ],
    'source': '📚 西塞罗《De Legibus》、Berger《Encyclopedic Dictionary of Roman Law》、Crawford《Roman Statutes》',
}

