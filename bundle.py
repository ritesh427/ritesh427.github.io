import os
import re

base_dir = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(base_dir, 'index.html'), 'r', encoding='utf-8') as f:
    html = f.read()

def replace_css(match):
    href = match.group(1)
    if href.startswith('http'):
        return match.group(0)
    css_path = os.path.join(base_dir, href)
    if os.path.exists(css_path):
        with open(css_path, 'r', encoding='utf-8') as cf:
            return '<style>\n/* --- ' + href + ' --- */\n' + cf.read() + '\n</style>'
    return match.group(0)

html = re.sub(r'<link\s+rel=["\']stylesheet["\']\s+href=["\']([^"\']+)["\']\s*>', replace_css, html)

def replace_js(match):
    src = match.group(1)
    if src.startswith('http'):
        return match.group(0)
    js_path = os.path.join(base_dir, src)
    if os.path.exists(js_path):
        with open(js_path, 'r', encoding='utf-8') as jf:
            return '<script>\n/* --- ' + src + ' --- */\n' + jf.read() + '\n</script>'
    return match.group(0)

html = re.sub(r'<script\s+src=["\']([^"\']+)["\']\s*></script>', replace_js, html)

standalone_path = os.path.join(base_dir, 'devpath-standalone.html')
with open(standalone_path, 'w', encoding='utf-8') as sf:
    sf.write(html)

print(f"Generated {standalone_path} ({len(html)} bytes)")
