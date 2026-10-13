"""
يدمج المشروع المقسّم في ملف واحد: HICIT-single-file.html
مفيد لو عايزة تفتحي النظام بالدبل كليك (من غير Live Server) أو تبعتيه كملف واحد.

التشغيل:   python merge.py
"""
import re, pathlib

root = pathlib.Path(__file__).parent
html = (root / 'index.html').read_text(encoding='utf-8')

# 1) CSS
css = (root / 'css' / 'styles.css').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="css/styles.css">',
                    '<style>\n' + css + '\n</style>')

# 2) إعدادات Tailwind
cfg = (root / 'js' / 'tailwind-config.js').read_text(encoding='utf-8')
html = html.replace('<script src="js/tailwind-config.js"></script>',
                    '<script>\n' + cfg + '\n</script>')

# 3) كل ملفات الـ JS بنفس الترتيب الموجود في index.html
srcs = re.findall(r'<script type="text/babel" src="([^"]+)"></script>', html)
code = '\n\n'.join(f'// ===== {s} =====\n' + (root / s).read_text(encoding='utf-8') for s in srcs)
html = re.sub(r'(?:[ \t]*<script type="text/babel" src="[^"]+"></script>\n?)+',
              lambda m: '<script type="text/babel">\n' + code + '\n</script>\n', html, count=1)

out = root / 'HICIT-single-file.html'
out.write_text(html, encoding='utf-8')
print('تم إنشاء', out.name, f'({len(html)//1024} KB)')
