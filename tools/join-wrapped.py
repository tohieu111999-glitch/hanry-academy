#!/usr/bin/env python3
"""Join lines that were only wrapped by the PDF page width (prose), keep real line breaks (tables, menus, letters)."""
import json, re, sys

END = re.compile(r'[。！？!?」』：:）)…—–]$')
START_KEEP = re.compile(r'^[【（(●・\-–—※■□]|^\d+[.、]|^[^\s，。]{1,8}[：:]')


def join(text, width=22):
    out = []
    for line in text.split('\n'):
        if out and len(out[-1]) >= width and not END.search(out[-1]) and not START_KEEP.match(line):
            out[-1] += line.lstrip()
        else:
            out.append(line)
    return '\n'.join(out)


if __name__ == '__main__':
    p = sys.argv[1]
    data = json.load(open(p, encoding='utf-8'))
    n = 0
    for E in data:
        for s in E['sections']:
            if s.get('passage'):
                new = join(s['passage'])
                n += new != s['passage']; s['passage'] = new
    json.dump(data, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('joined', n, 'passages')
