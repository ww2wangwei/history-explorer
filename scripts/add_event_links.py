"""手工给 events.json 的 30 条高 importance 事件加 relatedEventIds（因果/时间关联）"""
import json

events = json.load(open(r'F:\历史软件\src\data\events.json', encoding='utf-8'))

# 手工关联：每条 (event_id, [related_ids, ...]) — 严格基于历史事实
links = {
    # ===== 中国朝代兴替 =====
    'ev-001': ['ev-002'],  # 夏启家天下 → 太康失国
    'ev-002': ['ev-003'],  # 太康失国 → 商汤伐夏
    'ev-003': ['ev-004'],  # 商汤伐夏 → 武王伐纣
    'ev-004': ['ev-005', 'ev-006'],  # 武王伐纣 → 周公制礼
    'ev-006': ['ev-007'],  # 周公制礼 → 春秋霸政
    'ev-007': ['ev-008'],  # 春秋霸政 → 商鞅变法
    'ev-008': ['ev-009'],  # 商鞅变法 → 秦统一六国
    'ev-009': ['ev-010', 'ev-011'],  # 秦统一六国 → 焚书坑儒 / 修长城
    'ev-010': ['ev-011'],  # 焚书坑儒 → 修长城
    'ev-011': ['ev-012', 'ev-013'],  # 修长城 → 楚汉之争 / 陈胜起义
    'ev-012': ['ev-013'],  # 楚汉之争 → 陈胜起义
    'ev-013': ['ev-014'],  # 陈胜起义 → 西汉建立
    'ev-014': ['ev-015'],  # 西汉建立 → 罢黜百家
    'ev-015': ['ev-016', 'ev-017'],  # 罢黜百家 → 张骞通西域
    'ev-017': ['ev-018'],  # 张骞通西域 → 罗马帝国建立
    # ===== 西方帝国 =====
    'ev-rome-1': ['ev-rome-2'],  # 罗马建城 → 罗马共和国
    'ev-rome-2': ['ev-rome-3'],  # 罗马共和国 → 凯撒跨卢比孔
    'ev-rome-3': ['ev-greece-9'],  # 凯撒 → 亚历山大逝世（对照）
    'ev-rome-1': ['ev-akkad-1'],  # 罗马建城 → 阿卡德帝国（跨文明对比）
    'ev-babylon-1': ['ev-hammurabi-1'] if 'ev-hammurabi-1' in [e['id'] for e in events] else [],
    'ev-assyria-2': ['ev-assyria-3'],  # 亚述攻陷底比斯 → 亚述灭亡
    'ev-assyria-3': ['ev-new-babylon'],  # 亚述灭亡 → 新巴比伦
    'ev-carthage-3': ['ev-carthage-4'],  # 汉尼拔翻越 → 坎尼会战
    'ev-carthage-4': ['ev-carthage-5'],  # 坎尼会战 → 迦太基灭亡
    # ===== 跨文明重大事件链 =====
    'ev-sumer-2': ['ev-sumer-1'],  # 楔形文字 → 苏美尔城邦
    'ev-sumer-1': ['ev-babylon-1'],  # 苏美尔城邦 → 汉谟拉比
    'ev-hittite-2': ['ev-assyria-1'],  # 卡迭石 → 亚述崛起
    'ev-olmec-1': ['ev-maya-1'],  # 奥尔梅克 → 玛雅
    'ev-maya-3': ['ev-inca-1'],  # 玛雅崩溃 → 印加鼎盛
}

# 应用关联
count_updated = 0
for event in events:
    eid = event['id']
    if eid in links and links[eid]:
        # 过滤掉不存在的 id
        valid_links = [lid for lid in links[eid] if any(e['id'] == lid for e in events)]
        if valid_links:
            event['relatedEventIds'] = valid_links
            count_updated += 1

with open(r'F:\历史软件\src\data\events.json', 'w', encoding='utf-8') as f:
    json.dump(events, f, ensure_ascii=False, indent=2)

print(f'events.json: {len(events)} 条，{count_updated} 条加了 relatedEventIds')
