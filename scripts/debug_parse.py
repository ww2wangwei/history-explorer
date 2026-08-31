"""Debug parse_entry."""
import re
from pathlib import Path
src = Path('src/data/mythologies.ts').read_text(encoding='utf-8')

arr_start = src.find('export const MYTHOLOGIES: Mythology[] = [') + len('export const MYTHOLOGIES: Mythology[] = [') - 1
depth = 1
arr_end = None
for i in range(arr_start + 1, len(src)):
    c = src[i]
    if c == '[':
        depth += 1
    elif c == ']':
        depth -= 1
        if depth == 0:
            arr_end = i + 1
            break
arr_text = src[arr_start:arr_end]

pattern = re.compile(r'^  \{ id:', re.MULTILINE)
positions = [m.start() for m in pattern.finditer(arr_text)]
positions.append(len(arr_text))
e = arr_text[positions[0]:positions[1]]

def parse_string(s, start):
    assert s[start] == "'"
    i = start + 1
    out = []
    while i < len(s):
        c = s[i]
        if c == '\\':
            if i + 1 < len(s):
                nc = s[i+1]
                if nc == "'": out.append("'"); i += 2; continue
                if nc == '"': out.append('"'); i += 2; continue
                if nc == '\\': out.append('\\'); i += 2; continue
                if nc == 'n': out.append('\n'); i += 2; continue
                out.append(nc); i += 2; continue
            break
        if c == "'":
            return ''.join(out), i + 1
        out.append(c); i += 1
    raise ValueError('unterminated')

def parse_entry(s):
    fields = {}
    i = 0
    # skip leading whitespace
    while i < len(s) and s[i] in ' \t\n\r':
        i += 1
    # skip optional opening brace
    if i < len(s) and s[i] == '{':
        i += 1
    while i < len(s):
        while i < len(s) and s[i] in ' \t\n\r,':
            i += 1
        if i >= len(s): break
        # skip closing brace if present
        if s[i] == '}':
            break
        m = re.match(r'(\w+):', s[i:])
        if not m:
            break
        key = m.group(1)
        i += m.end()
        while i < len(s) and s[i] in ' \t\n':
            i += 1
        if i >= len(s): break
        if s[i] == "'":
            v, i = parse_string(s, i)
            fields[key] = v
        elif s[i] == '[':
            depth = 1
            j = i + 1
            arr = []
            while j < len(s) and depth > 0:
                c = s[j]
                if c == '[': depth += 1
                elif c == ']': depth -= 1
                elif depth == 1 and c == "'":
                    v, j = parse_string(s, j)
                    arr.append(v)
                    continue
                j += 1
            fields[key] = arr
            i = j + 1
        else:
            j = i
            while j < len(s) and s[j] not in ',\n':
                j += 1
            v = s[i:j].strip()
            if v: fields[key] = v
            i = j
    return fields

result = parse_entry(e)
print('Parsed fields:', list(result.keys()))
print('id:', result.get('id'))
print('title:', result.get('title'))
print('civilization:', result.get('civilization'))
print('category:', result.get('category'))
print('eraRange:', result.get('eraRange'))
print('summary:', result.get('summary')[:50])
print('characters:', result.get('characters'))
print('imageKeyword:', result.get('imageKeyword'))
