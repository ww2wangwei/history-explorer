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

