import {mkdirSync,rmSync,cpSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,relative,extname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {root,normalizeBase,assertOutput,filesIn,publishedClaude,missingReferences} from './site-lib.mjs';

const base=normalizeBase(process.env.BASE_PATH), output=assertOutput(resolve(root,'dist'));
if(!process.env.npm_execpath)throw Error('Run this build with npm run build.');
const appBuild=spawnSync(process.execPath,[process.env.npm_execpath,'run','build','--workspace','codex/v3','--','--base',base+'codex/'],{cwd:root,stdio:'inherit'});
if(appBuild.status!==0)process.exit(appBuild.status||1);
const classicBuild=spawnSync(process.execPath,[process.env.npm_execpath,'run','build','--workspace','codex/v2','--','--base',base+'codex-classic/'],{cwd:root,stdio:'inherit'});
if(classicBuild.status!==0)process.exit(classicBuild.status||1);
// Checked above: only this repository's generated dist directory can be replaced.
rmSync(output,{recursive:true,force:true});mkdirSync(output,{recursive:true});
cpSync(resolve(root,'site'),output,{recursive:true});
cpSync(resolve(root,'codex/v3/dist'),resolve(output,'codex'),{recursive:true});
cpSync(resolve(root,'codex/v2/dist'),resolve(output,'codex-classic'),{recursive:true});
const claudeRoot=resolve(root,'style-3-starry');
for(const source of filesIn(claudeRoot).filter(f=>['.html','.css','.js'].includes(extname(f)))){
 const name=relative(claudeRoot,source), destination=resolve(output,'claude',name);mkdirSync(resolve(destination,'..'),{recursive:true});
 if(source.endsWith('.html'))writeFileSync(destination,publishedClaude(readFileSync(source,'utf8'),name));
 else cpSync(source,destination);
}
cpSync(resolve(root,'site/claude-bridge.css'),resolve(output,'claude/edition.css'));
writeFileSync(resolve(output,'.nojekyll'),'');
writeFileSync(resolve(output,'site-manifest.json'),JSON.stringify({base,revision:process.env.GITHUB_SHA||'local',builtAt:new Date().toISOString(),entries:{classic:base+'codex-classic/',codex:base+'codex/',claude:base+'claude/'},claudePages:filesIn(claudeRoot).filter(p=>p.endsWith('.html')).map(p=>relative(claudeRoot,p))},null,2));
const missing=missingReferences(output);if(missing.length)throw Error('Broken local references:\n'+missing.join('\n'));
console.log(`Published bundle: ${output}\nHome: ${base}\nCodex: ${base}codex/\nClaude: ${base}claude/`);
