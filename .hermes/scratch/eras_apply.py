"""
eras_apply.py — 把 eras_enrich_data.json 的富化数据写回 eras.json

用法：
  python eras_apply.py                  # dry-run (校验)
  python eras_apply.py --apply          # 写入
  python eras_apply.py --apply --eras sumerian  # 只写苏美尔
"""
import json
import sys
from pathlib import Path

ERAS_FILE = Path('src/data/eras.json')
DATA_FILE = Path('.hermes/scratch/eras_enrich_data.json')


def apply(only_era=None, do_write=False):
    data = json.load(open(DATA_FILE, encoding='utf-8'))
    eras = json.load(open(ERAS_FILE, encoding='utf-8'))

    total_enriched = 0
    for era in eras:
        eid = era['id']
        if only_era and eid != only_era:
            continue
        if eid not in data:
            continue

        events_data = data[eid]
        for qe in era.get('quickEvents', []):
            qe_key = f"{qe['year']}-{qe['title']}"
            if qe_key in events_data:
                enrich = events_data[qe_key]
                qe['facts'] = enrich.get('facts', qe.get('facts'))
                qe['sections'] = enrich.get('sections', qe.get('sections'))
                qe['timeline'] = enrich.get('timeline', qe.get('timeline'))
                qe['images'] = enrich.get('images', qe.get('images'))
                qe['related'] = enrich.get('related', qe.get('related'))
                qe['source'] = enrich.get('source', qe.get('source'))
                total_enriched += 1

    print(f'富化事件: {total_enriched} 条')

    if do_write:
        json.dump(eras, open(ERAS_FILE, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
        print(f'已写入 {ERAS_FILE}')

    return total_enriched


if __name__ == '__main__':
    do_apply = '--apply' in sys.argv
    only_era = None
    if '--eras' in sys.argv:
        idx = sys.argv.index('--eras')
        only_era = sys.argv[idx + 1]
    apply(only_era, do_apply)