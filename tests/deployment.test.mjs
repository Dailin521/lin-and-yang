import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {resolve} from 'node:path';
import {root,normalizeBase,assertOutput,publishedClaude,missingReferences,localReferences} from '../scripts/site-lib.mjs';
import {publicAsset} from '../codex/v3/src/shared/assetPath.ts';

test('GitHub Pages base always keeps the repository prefix',()=>{
 assert.equal(normalizeBase(),'/lin-and-yang/');assert.equal(normalizeBase('lin-and-yang'),'/lin-and-yang/');assert.equal(normalizeBase('/'),'/');
 for(const invalid of ['../other','/bad?x=1','/bad;echo','https://example.com'])assert.throws(()=>normalizeBase(invalid));
});
test('build cleanup cannot remove an old version or repository root',()=>{
 assert.equal(assertOutput(resolve(root,'dist')),resolve(root,'dist'));
 for(const path of [root,resolve(root,'codex/v2'),resolve(root,'style-3-starry'),resolve(root,'..')])assert.throws(()=>assertOutput(path));
});
test('stored demo image paths work under Pages and localhost',()=>{
 assert.equal(publicAsset('/assets/coast.png','/lin-and-yang/codex/'),'/lin-and-yang/codex/assets/coast.png');
 assert.equal(publicAsset('/assets/coast.png','/'),'/assets/coast.png');
 for(const source of ['image:universe:test','blob:https://example.com/one','https://images.unsplash.com/a.png','data:image/png;base64,test'])assert.equal(publicAsset(source,'/lin-and-yang/codex/'),source);
 assert.equal(publicAsset(undefined,'/lin-and-yang/codex/'),'');
});
test('published Claude version includes all latest planets and a way home',()=>{
 const original=readFileSync(resolve(root,'style-3-starry/universe.html'),'utf8');const published=publishedClaude(original,'universe.html');
 for(const page of ['memories-planet','wishlist','games-planet','mailbox-planet','music-planet','secret-planet'])assert.match(published,new RegExp(`href="${page}.html"`));
 assert.match(published,/class="edition-return" href="\.\.\/"/);
 assert.match(published,/js\/stars.js/);assert.match(published,/js\/main.js/);
 assert.equal(readFileSync(resolve(root,'style-3-starry/universe.html'),'utf8'),original);
});
test('every original Claude local asset and page link resolves',()=>assert.deepEqual(missingReferences(resolve(root,'style-3-starry')),[]));
test('landing page points to all three deployments with relative URLs',()=>{
 const html=readFileSync(resolve(root,'site/index.html'),'utf8');assert.match(html,/href="\.\/codex\/"/);assert.match(html,/href="\.\/claude\/"/);
 assert.ok(!localReferences(html).some(ref=>ref.startsWith('/')));
 assert.match(html,/href="\.\/codex-classic\/"/);
});
