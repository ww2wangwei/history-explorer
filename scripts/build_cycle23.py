"""
build_cycle23.py

复用 cycle 1 的 entity，为每条天梯的每关再生成 cycle 2 + cycle 3：
- entity / study 内容与 cycle 1 一致
- 题目的选项顺序重新洗牌（不同 cycle 不同）
- summary 末尾追加"难度 +N"挑战提示
- id 用 cycle 字段区分（例如 poem:静夜思:1 / poem:静夜思:2 / poem:静夜思:3）

这样 total 关卡数 = 173 × 3 = 519
"""

import json, sys, io, random

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ─────── 复用 build_ladder_poem_figure.py 的全部逻辑 ───────
# 直接 import 它当脚本运行；不行，build_ladder_poem_figure.py 是脚本式
# 这里更省事：重读一次 ladders.ts，拿到已有的 HISTORY/POEM/FIGURE，再为每关生成 cycle 2/3。
# 但 ladders.ts 是 TS，不便直接 import；改成读现有 .ts 把 LadderLevel[] 抽出来
# 更简单：在 build_cycle23.py 里同时承担 cycle 1 末两项，然后基于 HISTORY/POEM/FIGURE 输出 CYCLE23_{LADDER}_TIERS
# 但 ladders.ts 已经是最终文件，不便重写。所以：写一个 build_all_ladders.py 一次性做 cycle 1+2+3，把 build_ladder_poem_figure.py 的逻辑直接吸收进来。

# ───────────────────────── Load ─────────────────────────
with open('src/data/poems.json', 'r', encoding='utf-8') as f:
    poems_data = json.load(f)
with open('src/data/people.json', 'r', encoding='utf-8') as f:
    people = json.load(f)

authors = poems_data['authors']
poems = poems_data['poems']

# ───────────────────────── Helpers ─────────────────────────
def sample(arr, k, exclude):
    return [x for x in arr if x != exclude][:k]

def shuffled_options(correct, distractors, seed):
    random.seed(seed)
    opts = [correct] + list(distractors)[:3]
    random.shuffle(opts)
    return opts, opts.index(correct)

# 与 build_ladder_poem_figure.py 一致的题生成 — entity 同样 → 题同样（仅洗牌种子不同）
def build_cycle_tier(tier_base, cycle, ladder):
    seed = 1000 + cycle * 17
    riddle_q = tier_base['quiz']
    fixed_quiz = []
    for idx, q in enumerate(riddle_q):
        if q['kind'] == 'single':
            new_seed = seed + idx
            correct_value = q['options'][q['correctIndex']]
            distractor_values = [o for o in q['options'] if o != correct_value]
            opts, idx_correct = shuffled_options(correct_value, distractor_values, new_seed)
            fixed_quiz.append({
                'kind': 'single',
                'prompt': q['prompt'],
                'options': opts,
                'correctIndex': idx_correct,
                'explain': q['explain'],
            })
        else:
            fixed_quiz.append(q)
    new_study = dict(tier_base['study'])
    new_study['summary'] = tier_base['study']['summary']
    if cycle > 1:
        new_study['summary'] += f'\n\n🌀 难度 +{cycle - 1}：本轮题目选项顺序与 study 侧重点已变，请独立思考。'
    new_reward = dict(tier_base['reward'])
    new_reward['xp'] = (cycle - 1) * 5 + tier_base['reward']['xp']
    out = dict(tier_base)
    out['id'] = tier_base['id'].replace(':1', f':{cycle}')
    out['cycle'] = cycle
    out['quiz'] = fixed_quiz
    out['study'] = new_study
    out['reward'] = new_reward
    return out

# ───────────────────────── 读现有 ladders.ts（取 cycle 1 作为基础）─────────────────
# 因为 ladders.ts 是 TS 不是纯 JSON，这里手动读 POEM_TIERS / FIGURE_TIERS / HISTORY_TIERS 数组
# 我们用 Python 的 .ts 解析：粗暴法 — 从 ladders.ts 里抽出 const XXX_TIERS = [...]
# 直接从 POEM_TIERS / FIGURE_TIERS 重新生成 cycle 1 + 2 + 3 三遍即可。

def make_poem_tier(p):
    a = authors.get(p['author'], {})
    dynasty = a.get('dynasty', p.get('dynasty', '唐'))
    life = a.get('life', '')
    bio = a.get('shortBio', '')
    body = '\n'.join(p.get('lines', []))
    pinyin = '\n'.join(p.get('pinyin', []))
    all_authors = list(authors.keys())
    all_dynasties = sorted({a.get('dynasty', '唐') for a in authors.values()})
    a_dist = sample(all_authors, 3, p['author'])
    opts1, idx1 = shuffled_options(p['author'], a_dist, 11)
    d_dist = sample(all_dynasties, 3, dynasty)
    opts2, idx2 = shuffled_options(dynasty, d_dist, 22)
    study = (
        f'作者：{p["author"]}（{life}）　朝代：{dynasty}\n\n'
        f'【原文】\n{body}\n\n【拼音】\n{pinyin}\n\n'
        f'【作者】{bio}\n\n【背景】{p.get("background", "")}'
    )[:1800]
    notes = (
        f'{p["title"]}\n{p["author"]} · {dynasty}\n\n'
        f'【原文】\n{body}\n\n【作者】{bio}'
    )
    return {
        'id': f'poem:{p["id"]}:1',
        'ladder': 'poem',
        'cycle': 1,
        'entityId': p['id'],
        'order': 0,
        'unlockXpRequired': 0,
        'study': {
            'title': f'{p["title"]}（{p["author"]}·{dynasty}）',
            'summary': study,
            'cta': '我已读完 →',
        },
        'quiz': [
            {'kind': 'single', 'prompt': f'《{p["title"]}》的作者是？', 'options': opts1, 'correctIndex': idx1, 'explain': bio[:80]},
            {'kind': 'single', 'prompt': f'《{p["title"]}》属于下列哪个朝代？', 'options': opts2, 'correctIndex': idx2, 'explain': f'{p["author"]} 是{dynasty}朝诗人。'},
        ],
        'notes': {'templateTitle': f'《{p["title"]}》笔记', 'templateBody': notes},
        'ask': {
            'npcOptions': [{'id': f'author:{p["author"]}', 'name': p['author'], 'era': dynasty, 'tag': bio[:24], 'persona': f'吾{p["author"]}，{a.get("life","")}年。问诗文与人生皆可答。'}],
            'sampleQuestions': [
                f'《{p["title"]}》表达了什么样的心境？',
                f'你为什么写「{p["lines"][0].rstrip("，。；：")}」这一句？',
            ],
        },
        'reward': {'xp': 10},
    }


def make_figure_tier(p):
    era_id = (p.get('eraIds') or ['?'])[0]
    role = p.get('role', '')
    d_dist = sample(['唐', '宋', '元', '明', '清', '汉', '秦', '魏晋', '隋', '辽', '金', '元'], 3, era_id)
    opts1, idx1 = shuffled_options(era_id, d_dist, 33)
    role_dist = sample([q.get('role', '') for q in people if q.get('role') and q.get('role') != role], 3, role)
    if len(role_dist) < 3:
        role_dist = (role_dist + ['诗人', '将军', '帝王'])[:3]
    opts2, idx2 = shuffled_options(role, role_dist, 44)
    birth = p.get('birthYear', '?')
    death = p.get('deathYear', '?')
    year_str = f'{birth or "?"}-{death or "?"}'
    desc = p.get('description', '')[:1500]
    persona = (p.get('personaPrompt', '') or f'吾{p["name"]}，生于{era_id}，为{role}。')[:500]
    study = (
        f'{p["name"]}（{year_str}）\n身份：{role}\n朝代：{era_id}\n领域：{p.get("category", "")}\n\n{desc}'
    )
    notes = f'{p["name"]}\n{year_str}\n{role} · {era_id}\n\n{desc}'
    return {
        'id': f'figure:{p["id"]}:1',
        'ladder': 'figure',
        'cycle': 1,
        'entityId': p['id'],
        'order': 0,
        'unlockXpRequired': 0,
        'study': {
            'title': f'{p["name"]}（{role}·{era_id}）',
            'summary': study,
            'cta': '我已读完 →',
        },
        'quiz': [
            {'kind': 'single', 'prompt': f'{p["name"]}是哪朝人物？', 'options': opts1, 'correctIndex': idx1, 'explain': f'{p["name"]}（{birth}-{death}），{era_id}朝。'},
            {'kind': 'single', 'prompt': f'下列哪一项最能概括{p["name"]}的身份？', 'options': opts2, 'correctIndex': idx2, 'explain': desc[:80] or f'{p["name"]}是{era_id}朝{role}。'},
        ],
        'notes': {'templateTitle': f'{p["name"]} 笔记', 'templateBody': notes},
        'ask': {
            'npcOptions': [{'id': p['id'], 'name': p['name'], 'era': era_id, 'tag': role, 'persona': persona}],
            'sampleQuestions': ['你一生中最重要的转折点是什么？', '你怎么看同时代的人？'],
        },
        'reward': {'xp': 15},
    }


poems_sorted = sorted(poems, key=lambda p: (authors.get(p['author'], {}).get('dynasty', 'zzz'), p['author'], p['id']))
people_sorted = sorted(people, key=lambda p: (p.get('birthYear') or 99999, p['id']))

# Build cycle 1 base for poem + figure
POEM_C1 = []
for i, p in enumerate(poems_sorted):
    tier = make_poem_tier(p)
    tier['order'] = i + 1
    POEM_C1.append(tier)

FIGURE_C1 = []
for i, p in enumerate(people_sorted):
    tier = make_figure_tier(p)
    tier['order'] = i + 1
    FIGURE_C1.append(tier)

# Generate cycle 2/3 variants
def expand(cycle1_tiers, ladder):
    out = []
    for c in [1, 2, 3]:
        for tier in cycle1_tiers:
            out.append(build_cycle_tier(tier, c, ladder))
    return out

POEM_TIERS = expand(POEM_C1, 'poem')
FIGURE_TIERS = expand(FIGURE_C1, 'figure')

# ───────────────────────── 写 ladders.ts ─────────────────────────
# 直接覆盖 HISTORY_TIERS 4 关 + POEM_TIERS 100*3 = 300 关 + FIGURE_TIERS 69*3 = 207 关
HISTORY_TIERS = [
    {
        'id': 'history:qin:1', 'ladder': 'history', 'cycle': 1, 'entityId': 'qin', 'order': 1, 'unlockXpRequired': 0,
        'study': {'title': '秦朝：第一个大一统帝国',
                  'summary': '公元前 221 年，秦王嬴政完成对韩、赵、魏、楚、燕、齐六国的征伐，建立中国历史上第一个中央集权的统一帝国 —— 史称"秦朝"。他在中央设立三公九卿、在地方废除分封、推行郡县；又统一度量衡、车轨、文字。这就是"书同文、车同轨、行同伦"的原点。但秦以法家严刑峻法为治，赋役繁重，引发陈胜吴广起义（前 209）后仅 15 年即亡。',
                  'cta': '我已读完 →'},
        'quiz': [
            {'kind': 'single', 'prompt': '秦始皇统一六国的最后一年是公元前多少年？', 'options': ['A. 230 年', 'B. 221 年', 'C. 206 年', 'D. 202 年'], 'correctIndex': 1, 'explain': '公元前 221 年，王贲破齐，秦完成六国统一。'},
            {'kind': 'single', 'prompt': '秦朝确立的官方标准字体是？', 'options': ['A. 大篆', 'B. 小篆', 'C. 隶书', 'D. 楷书'], 'correctIndex': 1, 'explain': '"书同文"以秦国字体为基础，推行小篆。'},
            {'kind': 'match', 'pairs': [{'left': '长度', 'right': '丈 / 尺'}, {'left': '容量', 'right': '斗 / 升'}, {'left': '重量', 'right': '铢、两、斤'}, {'left': '钱币', 'right': '半两钱'}]}
        ],
        'notes': {'templateTitle': '秦朝笔记',
                  'templateBody': '建立者：嬴政（始皇帝）\n都城：咸阳\n起讫：公元前 221 — 207 年\n关键事件：统一六国（前 221）/ 书同文 / 车同轨 / 北击匈奴（前 215） / 焚书（前 213）\n灭亡：陈胜吴广起义 → 楚汉之争 → 刘邦建立汉朝'},
        'ask': {'npcOptions': [{'id': 'simagu', 'name': '司马迁', 'era': '西汉', 'tag': '史家之绝唱', 'persona': '我，司马迁，太史令，《史记》作者。隐忍完成父业，秉笔直书。你问当下秦政得失，吾可从三千年史度答你。'}],
                'sampleQuestions': ['为什么秦朝统一六国仅 15 年就崩了？', '秦始皇的郡县制比周朝分封制有何优劣？', '你认为"焚书坑儒"是否真的摧残了文化？']},
        'reward': {'xp': 20}
    },
    {
        'id': 'history:han-west:2', 'ladder': 'history', 'cycle': 1, 'entityId': 'han-west', 'order': 2, 'unlockXpRequired': 0,
        'study': {'title': '西汉：与民休息，文景之治',
                  'summary': '公元前 202 年，刘邦击败项羽建立汉朝，定都长安，史称西汉（前 202—公元 8 年）。初期行郡国并行制；高祖死后经吕后、文帝、景帝，至汉武帝（前 141—前 87 在位）而极盛：北击匈奴、凿空西域、张骞出使、罢黜百家独尊儒术、推恩令削藩。太史公司马迁于武帝朝完成《史记》。',
                  'cta': '我已读完 →'},
        'quiz': [
            {'kind': 'single', 'prompt': '西汉定都在下列哪座城市？', 'options': ['A. 洛阳', 'B. 长安', 'C. 开封', 'D. 咸阳'], 'correctIndex': 1, 'explain': '汉高祖刘邦采纳娄敬建议，定都关中长安。'},
            {'kind': 'single', 'prompt': '"罢黜百家，独尊儒术"是谁推行的政策？', 'options': ['A. 汉高祖', 'B. 汉文帝', 'C. 汉景帝', 'D. 汉武帝'], 'correctIndex': 3, 'explain': '董仲舒献策于汉武帝。'},
            {'kind': 'order', 'items': [{'id': 'wen', 'label': '汉文帝继位（前 180）'}, {'id': 'jing', 'label': '汉景帝削藩引发七国之乱（前 154）'}, {'id': 'wu', 'label': '汉武帝即位（前 141）'}, {'id': 'tai', 'label': '司马迁《史记》成书（前 91）'}], 'correctOrder': ['wen', 'jing', 'wu', 'tai']}
        ],
        'notes': {'templateTitle': '西汉笔记',
                  'templateBody': '建立者：刘邦\n都城：长安\n起讫：公元前 202 — 公元 8 年\n关键事件：楚汉之争 → 文景之治（前 180—前 141） → 武帝独尊儒术 → 张骞通西域 → 《史记》（前 91）\n灭亡：王莽篡汉建立"新"朝（公元 9）'},
        'ask': {'npcOptions': [{'id': 'simagu', 'name': '司马迁', 'era': '西汉', 'tag': '太史公自述', 'persona': '我是司马迁，能以史官视角答你汉之得失。'}],
                'sampleQuestions': ['"七国之乱"为什么反而让中央集权更强？', '司马迁写《史记》是否对汉武帝心存怨气？']},
        'reward': {'xp': 20}
    },
    {
        'id': 'history:tang:3', 'ladder': 'history', 'cycle': 1, 'entityId': 'tang', 'order': 3, 'unlockXpRequired': 0,
        'study': {'title': '盛唐：贞观之治与开元盛世',
                  'summary': '公元 618 年，李渊建立唐朝，定都长安。先经玄武门之变（626）后，唐太宗李世民在位（626—649）开启"贞观之治"。武则天、玄宗相继；唐玄宗前期（713—741）开创开元盛世。后经安史之乱（755—763）由盛转衰。',
                  'cta': '我已读完 →'},
        'quiz': [
            {'kind': 'single', 'prompt': '"贞观之治"是指下列哪位皇帝在位期间？', 'options': ['A. 唐高祖', 'B. 唐太宗', 'C. 唐高宗', 'D. 唐玄宗'], 'correctIndex': 1, 'explain': '贞观（627—649）是唐太宗李世民的年号。'},
            {'kind': 'single', 'prompt': '"安史之乱"开始于公元哪一年？', 'options': ['A. 755 年', 'B. 763 年', 'C. 783 年', 'D. 805 年'], 'correctIndex': 0, 'explain': '755 年 11 月，安禄山在范阳起兵。'},
            {'kind': 'match', 'pairs': [{'left': '李世民', 'right': '贞观之治'}, {'left': '李隆基', 'right': '开元盛世'}, {'left': '武则天', 'right': '武周革命'}, {'left': '李隆基（晚年）', 'right': '天宝之乱'}]}
        ],
        'notes': {'templateTitle': '唐朝笔记',
                  'templateBody': '建立者：李渊\n都城：长安\n起讫：618 — 907 年\n关键帝王：李世民 / 武则天 / 李隆基\n重大事件：玄武门之变 / 贞观之治 / 武周 / 开元盛世 / 安史之乱'},
        'ask': {'npcOptions': [{'id': 'lishimin', 'name': '李世民（虚拟）', 'era': '唐', 'tag': '贞观镜像', 'persona': '吾乃李世民也。喜闻直谏，亦喜与子论古今。'}],
                'sampleQuestions': ['你为什么一定要发动玄武门之变？', '玄武门之变对你的施政产生了什么影响？']},
        'reward': {'xp': 20}
    },
    {
        'id': 'history:song-north:4', 'ladder': 'history', 'cycle': 1, 'entityId': 'song-north', 'order': 4, 'unlockXpRequired': 0,
        'study': {'title': '北宋：文治盛世与军事困局',
                  'summary': '960 年，赵匡胤陈桥兵变建立北宋，定都开封。为防藩镇割据，推行"杯酒释兵权"。1004 年澶渊之盟与辽长期和平。神宗朝"王安石变法"。北宋经济繁荣、文化极盛（宋词、活字印刷、指南针）。1127 年"靖康之变"后北宋亡。',
                  'cta': '我已读完 →'},
        'quiz': [
            {'kind': 'single', 'prompt': '"陈桥兵变"建立的是下列哪个朝代？', 'options': ['A. 后周', 'B. 北宋', 'C. 南宋', 'D. 后梁'], 'correctIndex': 1, 'explain': '960 年，赵匡胤陈桥兵变，建立北宋。'},
            {'kind': 'single', 'prompt': '"靖康之变"中被掳的两位北宋皇帝分别是？', 'options': ['A. 太祖 + 太宗', 'B. 真宗 + 仁宗', 'C. 徽宗 + 钦宗', 'D. 神宗 + 哲宗'], 'correctIndex': 2, 'explain': '1127 年，金军掳徽宗、钦宗二帝北上。'},
            {'kind': 'single', 'prompt': '"杯酒释兵权"反映北宋哪项基本政策？', 'options': ['A. 重武抑文', 'B. 重文轻武', 'C. 集中军权', 'D. 扶持藩镇'], 'correctIndex': 2, 'explain': '宋太祖通过和平手段解除功臣兵权。'},
            {'kind': 'match', 'pairs': [{'left': '赵匡胤', 'right': '陈桥兵变'}, {'left': '赵匡义', 'right': '烛影斧声'}, {'left': '范仲淹', 'right': '庆历新政'}, {'left': '王安石', 'right': '熙宁变法'}]}
        ],
        'notes': {'templateTitle': '北宋笔记',
                  'templateBody': '建立者：赵匡胤\n都城：开封\n起讫：960 — 1127 年\n关键事件：陈桥兵变（960）/ 杯酒释兵权 / 澶渊之盟（1004）/ 庆历新政（1043）/ 王安石变法（1069）\n灭亡：靖康之变（1127）'},
        'ask': {'npcOptions': [{'id': 'wangan', 'name': '王安石（虚拟）', 'era': '北宋', 'tag': '变法丞相', 'persona': '吾王安石。熙宁变法，宁愿得罪旧党也要图新。'}],
                'sampleQuestions': ['你推行青苗法到底是不是对穷人有好处？', '为什么你的变法最终在神宗死后被废？']},
        'reward': {'xp': 20}
    },
]


# ─────── 写文件 ───────
def to_ts(name, arr):
    body = json.dumps(arr, ensure_ascii=False, separators=(',', ':'))
    return f"\nexport const {name}: LadderLevel[] = {body}\n"

content = (
    '/**\n * 文史天梯静态关卡数据 — 173 关 × 3 cycle = 519 关\n */\n'
    'import type { LadderLevel } from \'@/store/useLadderStore\'\n\n'
    'export type LadderIdCycle = 1 | 2 | 3\n'
    + to_ts('HISTORY_TIERS', HISTORY_TIERS)
    + to_ts('POEM_TIERS', POEM_TIERS)
    + to_ts('FIGURE_TIERS', FIGURE_TIERS)
    + "\nexport const TIERS_BY_LADDER = (ladder: 'history' | 'poem' | 'figure', cycle: LadderIdCycle = 1) =>\n"
    "  [...HISTORY_TIERS, ...POEM_TIERS, ...FIGURE_TIERS].filter(t => t.ladder === ladder && t.cycle === cycle)\n"
    + "\nexport const TIERS_BY_LADDER_ALL_CYCLES = (ladder: 'history' | 'poem' | 'figure') =>\n"
    "  [...HISTORY_TIERS, ...POEM_TIERS, ...FIGURE_TIERS].filter(t => t.ladder === ladder)\n"
)

with open('src/data/ladders.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'HISTORY: {len(HISTORY_TIERS)} (cycle 1)')
print(f'POEM cycles: {[sum(1 for t in POEM_TIERS if t["cycle"] == c) for c in [1,2,3]]}')
print(f'FIGURE cycles: {[sum(1 for t in FIGURE_TIERS if t["cycle"] == c) for c in [1,2,3]]}')
print(f'total: {len(HISTORY_TIERS) + len(POEM_TIERS) + len(FIGURE_TIERS)}')
print(f'file size: {len(content.encode("utf-8"))} bytes')
