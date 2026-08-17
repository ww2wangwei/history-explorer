"""
build_ladder_poem_figure.py

从 poems.json / people.json 抽取 entity 生成 LadderLevel，
追加到 src/data/ladders.ts（底部）。
然后 LadderPanel.tsx 引用 POEM_TIERS / FIGURE_TIERS。

每 entity 自动生成 2 道单选（事实题，无需 AI）：
- 诗：天梯每关 = 1 首诗词；题 1 = 作者（4 选 1 干扰），题 2 = 朝代
- 人：天梯每关 = 1 个人物；题 1 = 朝代，题 2 = 身份/职业
"""
import json, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ───────────────────────── Load ─────────────────────────
with open('src/data/poems.json', 'r', encoding='utf-8') as f:
    poems_data = json.load(f)
with open('src/data/people.json', 'r', encoding='utf-8') as f:
    people = json.load(f)

authors = poems_data['authors']     # dict by name
poems = poems_data['poems']        # list of 100

DYN_OPTIONS = ['唐', '宋', '元', '明', '清', '汉', '秦', '魏晋', '隋', '辽', '金', '元']

# ───────────────────────── Helpers ─────────────────────────
def sample(arr, k, exclude):
    """从 arr 抽 k 个不等于 exclude 的元素（保持原顺序）"""
    return [x for x in arr if x != exclude][:k]

def shuffled_options(correct, distractors, correct_index=0):
    """拼正确选项 + 干扰选项，返回打乱后的 options + 正确索引"""
    import random
    random.seed(42)
    opts = [correct] + list(distractors)[:3]
    random.shuffle(opts)
    return opts, opts.index(correct)

# ───────────────────────── Poem tiers ─────────────────────────
def poem_order_key(p):
    a = authors.get(p['author'], {})
    return (a.get('dynasty', 'zzz'), p['author'], p['id'])

poems_sorted = sorted(poems, key=poem_order_key)
all_authors = list(authors.keys())
all_dynasties = sorted({a.get('dynasty', '唐') for a in authors.values()})

POEM_TIERS = []
for i, p in enumerate(poems_sorted):
    a = authors.get(p['author'], {})
    dynasty = a.get('dynasty', p.get('dynasty', '唐'))
    life = a.get('life', '')
    bio = a.get('shortBio', '')

    body = '\n'.join(p.get('lines', []))
    pinyin = '\n'.join(p.get('pinyin', []))

    # 题 1：考作者
    a_dist = sample(all_authors, 3, p['author'])
    opts1, idx1 = shuffled_options(p['author'], a_dist)

    # 题 2：考朝代
    d_dist = sample(all_dynasties, 3, dynasty)
    opts2, idx2 = shuffled_options(dynasty, d_dist)

    study_summary = (
        f'作者：{p["author"]}（{life}）　朝代：{dynasty}\n\n'
        f'【原文】\n{body}\n\n'
        f'【拼音】\n{pinyin}\n\n'
        f'【作者】{bio}\n\n'
        f'【背景】{p.get("background", "")}'
    )[:1800]

    notes = (
        f'{p["title"]}\n{p["author"]} · {dynasty}\n\n'
        f'【原文】\n{body}\n\n'
        f'【作者】{bio}'
    )

    tier = {
        'id': f'poem:{p["id"]}:1',
        'ladder': 'poem',
        'cycle': 1,
        'entityId': p['id'],
        'order': i + 1,
        'unlockXpRequired': 0,
        'study': {
            'title': f'{p["title"]}（{p["author"]}·{dynasty}）',
            'summary': study_summary,
            'cta': '我已读完 →'
        },
        'quiz': [
            {
                'kind': 'single',
                'prompt': f'《{p["title"]}》的作者是？',
                'options': opts1,
                'correctIndex': idx1,
                'explain': bio[:80]
            },
            {
                'kind': 'single',
                'prompt': f'《{p["title"]}》属于下列哪个朝代？',
                'options': opts2,
                'correctIndex': idx2,
                'explain': f'{p["author"]} 是{dynasty}朝诗人。'
            }
        ],
        'notes': {
            'templateTitle': f'《{p["title"]}》笔记',
            'templateBody': notes
        },
        'ask': {
            'npcOptions': [
                {
                    'id': f'author:{p["author"]}',
                    'name': p['author'],
                    'era': dynasty,
                    'tag': bio[:24],
                    'persona': (
                        f'吾{p["author"]}，{a.get("life","")}年，唐/宋诗人。'
                        f'。'
                    )
                }
            ],
            'sampleQuestions': [
                f'《{p["title"]}》表达了什么样的心境？',
                f'你为什么写「{p["lines"][0].rstrip("，。；：")}」这一句？'
            ]
        },
        'reward': {'xp': 10}
    }
    POEM_TIERS.append(tier)

# ───────────────────────── Figure tiers ─────────────────────────
people_sorted = sorted(people, key=lambda p: (p.get('birthYear') or 99999, p['id']))

all_roles = [p.get('role', '') for p in people_sorted if p.get('role')]

FIGURE_TIERS = []
for i, p in enumerate(people_sorted):
    era_id = (p.get('eraIds') or ['?'])[0]
    role = p.get('role', '')

    # 题 1：朝代
    d_dist = sample(DYN_OPTIONS, 3, era_id)
    opts1, idx1 = shuffled_options(era_id, d_dist)

    # 题 2：身份/职业
    role_dist = sample(all_roles, 3, role)
    if len(role_dist) < 3:
        role_dist = (role_dist + ['诗人', '将军', '帝王'])[:3]
    opts2, idx2 = shuffled_options(role, role_dist)

    birth = p.get('birthYear', '?')
    death = p.get('deathYear', '?')
    if isinstance(birth, str) and birth and death:
        year_str = f'{birth}-{death}'
    else:
        year_str = f'{birth or "?"}-{death or "?"}'

    desc = p.get('description', '')[:1500]
    persona = (p.get('personaPrompt', '') or f'吾{p["name"]}，生于{era_id}，为{role}。')[:500]

    study_summary = (
        f'{p["name"]}（{year_str}）\n'
        f'身份：{role}\n'
        f'朝代：{era_id}\n'
        f'领域：{p.get("category", "")}\n\n'
        f'{desc}'
    )

    notes = (
        f'{p["name"]}\n{year_str}\n{role} · {era_id}\n\n'
        f'{desc}'
    )

    tier = {
        'id': f'figure:{p["id"]}:1',
        'ladder': 'figure',
        'cycle': 1,
        'entityId': p['id'],
        'order': i + 1,
        'unlockXpRequired': 0,
        'study': {
            'title': f'{p["name"]}（{role}·{era_id}）',
            'summary': study_summary,
            'cta': '我已读完 →'
        },
        'quiz': [
            {
                'kind': 'single',
                'prompt': f'{p["name"]}是哪朝人物？',
                'options': opts1,
                'correctIndex': idx1,
                'explain': f'{p["name"]}（{birth}-{death}），{era_id}朝。'
            },
            {
                'kind': 'single',
                'prompt': f'下列哪一项最能概括{p["name"]}的身份？',
                'options': opts2,
                'correctIndex': idx2,
                'explain': desc[:80] if desc else f'{p["name"]}是{era_id}朝{role}。'
            }
        ],
        'notes': {
            'templateTitle': f'{p["name"]} 笔记',
            'templateBody': notes
        },
        'ask': {
            'npcOptions': [
                {
                    'id': p['id'],
                    'name': p['name'],
                    'era': era_id,
                    'tag': role,
                    'persona': persona
                }
            ],
            'sampleQuestions': [
                f'你一生中最重要的转折点是什么？',
                f'你怎么看同时代的人？'
            ]
        },
        'reward': {'xp': 15}
    }
    FIGURE_TIERS.append(tier)

# ───────────────────────── Append to ladders.ts ─────────────────────────
with open('src/data/ladders.ts', 'r', encoding='utf-8') as f:
    head = f.read()

# Trim trailing HISTORY_TIERS + guard
trim_marker = '/** 工具：按 ladder 过滤 */'
if trim_marker in head:
    head = head.split(trim_marker)[0].rstrip() + '\n'

def to_ts_block(arr, name):
    body = json.dumps(arr, ensure_ascii=False, separators=(',', ':'))
    return f"\nexport const {name}: LadderLevel[] = {body}\n"

final = head + to_ts_block(POEM_TIERS, 'POEM_TIERS') + to_ts_block(FIGURE_TIERS, 'FIGURE_TIERS') + "\n/** 工具：按 ladder 过滤 */\nexport const TIERS_BY_LADDER = (ladder: 'history' | 'poem' | 'figure') =>\n  [...HISTORY_TIERS, ...POEM_TIERS, ...FIGURE_TIERS].filter(t => t.ladder === ladder)\n"

with open('src/data/ladders.ts', 'w', encoding='utf-8') as f:
    f.write(final)

print(f'poem tiers: {len(POEM_TIERS)}')
print(f'figure tiers: {len(FIGURE_TIERS)}')
print(f'written to src/data/ladders.ts')
print(f'total file size: {len(final.encode("utf-8"))} bytes')
