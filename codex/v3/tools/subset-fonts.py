"""Build local subsets for UI copy. Other typed characters use the system CJK fallback."""
from pathlib import Path
import re, shutil
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.merge import Merger

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/fonts'; OUT.mkdir(exist_ok=True)
CACHE=ROOT/'output/font-build'; CACHE.mkdir(exist_ok=True)
chars=set(range(32,127))
for path in (ROOT/'src').rglob('*'):
    if path.suffix in ['.tsx','.ts']:
        chars.update(map(ord,path.read_text(encoding='utf-8')))
chars.update(map(ord,'年月日星期一二三四五六七八九十零〇上午下午正在保存加载中…阿澄小满'))
css=[]
for package,family,weights in [('noto-sans-sc','Noto Sans SC',[400,700]),('noto-serif-sc','Noto Serif SC',[500])]:
    source=ROOT/'node_modules/@fontsource'/package
    shutil.copyfile(source/'LICENSE',OUT/(package+'-LICENSE.txt'))
    for weight in weights:
        sheet=(source/(str(weight)+'.css')).read_text(encoding='utf-8')
        paths=[];covered=set()
        for relative in dict.fromkeys(re.findall(r'url\(\./(files/[^)]+\.woff)\)',sheet)):
            font=TTFont(source/relative)
            needed=set(font.getBestCmap())&chars-covered
            if not needed:font.close();continue
            options=subset.Options();options.drop_tables+=['GSUB','GPOS','GDEF','BASE','DSIG'];options.recalc_timestamp=False
            sub=subset.Subsetter(options=options);sub.populate(unicodes=needed);sub.subset(font);font.flavor=None
            path=CACHE/(package+'-'+str(weight)+'-'+str(len(paths))+'.ttf')
            font.save(path);font.close();paths.append(str(path));covered|=needed
        merged=Merger().merge(paths);merged.flavor='woff'
        filename=f'{package}-{weight}.woff';merged.save(OUT/filename);merged.close()
        css.append(f"@font-face{{font-family:'{family}';font-style:normal;font-display:swap;font-weight:{weight};src:url('/fonts/{filename}') format('woff');}}")
        print(filename,len(covered),'glyphs',(OUT/filename).stat().st_size,'bytes')
(ROOT/'src/fonts.css').write_text('\n'.join(css),encoding='utf-8')
