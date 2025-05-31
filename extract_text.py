import os
import re
from pathlib import Path

SOURCE_DIRS = [Path('client/src/pages'), Path('client/index.html'), Path('xpdel_home.html'), Path('client/public/test-image.html')]

OUTPUT_DIR = Path('website_content')
OUTPUT_DIR.mkdir(exist_ok=True)


def extract_from_html(path: Path) -> list[str]:
    text = path.read_text(encoding='utf-8')
    texts = re.findall(r'>\s*([^<>]+?)\s*<', text)
    strings = re.findall(r'"([^"\n]{3,})"', text)
    combined = texts + strings
    results = []
    for t in combined:
        t = t.strip()
        if not t:
            continue
        if re.search(r'\.(png|jpg|jpeg|webp|svg)$', t):
            continue
        if t.startswith('http'):
            continue
        results.append(t)
    return list(dict.fromkeys(results))


def extract_from_tsx(path: Path) -> list[str]:
    text = path.read_text(encoding='utf-8')
    tag_texts = re.findall(r'>\s*([^<>{}\n][^<>{}]*)\s*<', text)
    string_texts = re.findall(r'"([^"\n]{3,})"', text)
    combined = tag_texts + string_texts
    results = []
    for t in combined:
        t = t.strip()
        if not t:
            continue
        if re.search(r'\.(png|jpg|jpeg|webp|svg)$', t):
            continue
        if t.startswith('http') or t.startswith('/'):
            continue
        if t.startswith('@'):
            continue
        if 'className' in t:
            continue
        if re.match(r'^[A-Za-z0-9_-]+$', t) and t.lower() == t:
            # likely a class name
            continue
        results.append(t)
    return list(dict.fromkeys(results))


def write_markdown(name: str, texts: list[str]):
    if not texts:
        return
    file = OUTPUT_DIR / f"{name}.md"
    with file.open('w', encoding='utf-8') as f:
        for line in texts:
            f.write(line + "\n")


for item in SOURCE_DIRS:
    if item.is_dir():
        for path in item.glob('*.tsx'):
            texts = extract_from_tsx(path)
            write_markdown(path.stem, texts)
    elif item.is_file():
        texts = extract_from_html(item)
        write_markdown(item.stem, texts)

