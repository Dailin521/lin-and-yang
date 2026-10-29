import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {root,filesIn,missingReferences,publishedClaude} from './site-lib.mjs';
const errors=missingReferences(resolve(root,'style-3-starry'));
for(const script of filesIn(resolve(root,'style-3-starry/js')).filter(f=>f.endsWith('.js'))){
 const result=spawnSync(process.execPath,['--check',script],{encoding:'utf8'});
 if(result.status)errors.push(result.stderr);
}
const universe=publishedClaude(readFileSync(resolve(root,'style-3-starry/universe.html'),'utf8'),'universe.html');
for(const page of ['memories-planet','games-planet','mailbox-planet','music-planet','secret-planet']){
 if(!universe.includes(`href="${page}.html"`))errors.push(`Claude planet link missing: ${page}`);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('Claude HTML references, JavaScript syntax, and all six planet destinations checked.');
