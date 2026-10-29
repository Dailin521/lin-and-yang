import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {resolve, relative, dirname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export function normalizeBase(value='/lin-and-yang/') {
  const base='/' + value.replace(/^\/+|\/+$/g,'') + '/';
  const normalized=base==='//'?'/':base;
  if(!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(normalized)) throw Error('BASE_PATH must be a simple absolute directory path.');
  return normalized;
}
export function assertOutput(target) {
  if(resolve(target)!==resolve(root,'dist') || resolve(target)===root) throw Error('Refusing to replace a directory other than this repository’s dist.');
  return resolve(target);
}
export function filesIn(directory){return readdirSync(directory,{withFileTypes:true}).flatMap(item=>item.isDirectory()?filesIn(resolve(directory,item.name)):[resolve(directory,item.name)]);}
export function publishedClaude(html,filename){
  let output=html.replace('</head>','    <link rel="stylesheet" href="edition.css">\n</head>');
  // The original playlist cover returns HTTP 404; keep the repair in the published copy.
  output=output.replaceAll('photo-1511379938547-c1f69b13d835','photo-1516280440614-37939bbacd81');
  output=output.replace('<ul class="nav-menu">','<ul class="nav-menu">\n                <li><a class="edition-return" href="../">版本首页</a></li>');
  if(filename==='universe.html'){
    for(const [title,href] of [['时光邮局','mailbox-planet.html'],['音乐星球','music-planet.html'],['秘密基地','secret-planet.html']]){
      if(!output.includes(`href="${href}"`)){
        const pattern=new RegExp(`(<h3 class="planet-title">${title}</h3>[\\s\\S]*?<div class="planet-stats">[\\s\\S]*?</div>)(\\s*</div>)`);
        output=output.replace(pattern,`$1\n                    <a href="${href}" class="planet-link" aria-label="进入${title}"></a>$2`);
      }
    }
    const names={'memories-planet.html':'回忆星球','wishlist.html':'心愿星球','games-planet.html':'游戏星球'};
    output=output.replace(/<a href="([^"]+)" class="planet-link"><\/a>/g,(_,href)=>`<a href="${href}" class="planet-link" aria-label="进入${names[href]||'星球'}"></a>`);
  }
  return output;
}
export function localReferences(html){return [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m=>m[1]).filter(ref=>!ref.startsWith('#')&&!/^(?:https?:|data:|blob:|mailto:|tel:|javascript:)/i.test(ref));}
export function missingReferences(directory){
 const missing=[];
 for(const file of filesIn(directory).filter(f=>f.endsWith('.html'))){
  for(const ref of localReferences(readFileSync(file,'utf8'))){
   if(ref.startsWith('/'))continue;
   const path=resolve(dirname(file),ref.split(/[?#]/)[0]);
   if(!existsSync(path))missing.push(`${relative(directory,file)}: ${ref}`);
  }
 }
 return missing;
}
