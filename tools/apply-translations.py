#!/usr/bin/env python3
"""Apply Vietnamese reading translations to data/posts/official.json.
Usage: python3 tools/apply-translations.py translations.json [--source ai|author]
translations.json = { "lesson-id": ["paragraph 1 vi", "paragraph 2 vi", ...], ... }"""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'posts', 'official.json')
src = sys.argv[sys.argv.index('--source') + 1] if '--source' in sys.argv else 'ai'
tr = json.load(open(sys.argv[1], encoding='utf-8'))
data = json.load(open(OUT, encoding='utf-8'))
for L in data:
    if L['id'] not in tr:
        continue
    lines = tr[L['id']]
    if len(lines) != len(L['text']):
        sys.exit('%s: %d translations for %d paragraphs' % (L['id'], len(lines), len(L['text'])))
    for x, v in zip(L['text'], lines):
        x['vi'] = v
    L['trSource'] = src
    print('✓', L['id'])
json.dump(data, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
