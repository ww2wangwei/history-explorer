"""
philosophy_enrich.py — 富化 philosophy 子分类 30 条

philosophy 子分类包含：儒家（孔子、子思、孟子、荀子）、道家（老子、庄子）、
法家（商鞅、韩非子）、墨家（墨子）、名家（公孙龙）、阴阳家、《易经》、
兵家（孙子）、纵横家（鬼谷子）、董仲舒、玄学（魏晋）、王弼、何晏等
"""
import json
from pathlib import Path

# 现有 30 条 philosophy id（按 traditions.ts 顺序）
# 从 .hermes/scratch/all_ids.txt 实际查询
import re
text = Path('src/data/traditions.ts').read_text(encoding='utf-8')
pattern = re.compile(r"id:\s*'(tr-phil-[^']+)',\s*category:\s*'philosophy'")
ids = [m.group(1) for m in pattern.finditer(text)]
print(f'philosophy 条目：{len(ids)}')
for i in ids: print(f'  {i}')