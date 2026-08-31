"""
Build enrichment for geographic-features.ts.
For each of 93 GeoFeature entries, insert facts/sections/timeline/images/related/source
fields between imageCredit and geometry.

Strategy: read file, for each entry id, find insertion point, splice in.
"""
import re
import sys
from pathlib import Path

SRC = Path('src/data/geographic-features.ts')
OUT = SRC

# Read content
content = SRC.read_text(encoding='utf-8')

# Helper to produce TS literal string from a Python value
def ts(value):
    """Convert a Python value to a TypeScript literal."""
    if value is None:
        return 'null'
    if isinstance(value, bool):
        return 'true' if value else 'false'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, str):
        # Escape backslashes and single quotes
        escaped = value.replace('\\', '\\\\').replace("'", "\\'")
        return f"'{escaped}'"
    if isinstance(value, list):
        return '[\n      ' + ',\n      '.join(ts(v) for v in value) + '\n    ]'
    if isinstance(value, dict):
        items = []
        for k, v in value.items():
            items.append(f"    {k}: {ts(v)}")
        return '{\n' + ',\n'.join(items) + '\n    }'
    raise ValueError(f'Unknown type: {type(value)}')


def build_enrichment(eid, name, ftype):
    """Generate enrichment dict for a GeoFeature entry. Returns Python dict."""
    # Helper shortcuts
    def F(label, value):
        return {'label': label, 'value': value}
    def P(h, b):
        return {'type': 'paragraph', 'heading': h, 'body': b}
    def C(h, b, v='info'):
        return {'type': 'callout', 'heading': h, 'body': b, 'variant': v}
    def L(h, items):
        return {'type': 'list', 'heading': h, 'items': items}
    def Q(t, c):
        return {'type': 'quote', 'text': t, 'cite': c}
    def T(year, event, era=None):
        out = {'year': year, 'event': event}
        if era:
            out['era'] = era
        return out
    def I(kw, cap, credit='Wikimedia Commons'):
        return {'imageKeyword': kw, 'caption': cap, 'credit': credit}
    def R(rid, title, reason):
        return {'id': rid, 'title': title, 'reason': reason}

    # Per-id enrichment data, returned as Python dict
    return ENRICH_DATA[eid](F, P, C, L, Q, T, I, R, name, ftype)


# ENRICH_DATA: mapping from entry id -> function returning the enrichment dict
# Each function has signature (F, P, C, L, Q, T, I, R, name, ftype) -> dict
# with keys: facts, sections, timeline, images, related, source

# We'll define ENRICH_DATA progressively below
ENRICH_DATA = {}