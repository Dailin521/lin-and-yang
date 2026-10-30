async (page) => {
 const reports=[];
 const go=async route=>{await page.goto('http://127.0.0.1:5174/#/'+route);await page.waitForLoadState('networkidle');};
 const read=scope=>page.evaluate(scope=>new Promise(resolve=>{const r=indexedDB.open('two-of-us-v2',1);r.onsuccess=()=>{const db=r.result,q=db.transaction('documents').objectStore('documents').get(scope);q.onsuccess=()=>{resolve(q.result);db.close();};};}),scope);
 const wait=async fn=>{for(let i=0;i<80;i++){const d=(await read('arcade')).data;if(fn(d))return d;await page.waitForTimeout(50);}throw Error('Round did not settle');};
 await go('arcade/quiz');await page.setViewportSize({width:390,height:844});
 const arc=await read('arcade'),house=await read('house');
 const capture=async(name,audit=false)=>{await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'output/playwright/'+name+'.png',fullPage:true});if(audit){await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});const violations=await page.evaluate(async()=>{const r=await axe.run({runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));});reports.push({name,violations});}};
 try {
  await page.getByRole('button',{name:'由阿澄开始',exact:true}).click();let d=await wait(d=>!!d.round);await capture('arcade-question-focused',true);
  for(let i=0;i<3;i++){d=(await read('arcade')).data;await page.getByRole('button',{name:new RegExp(d.round.questions[i].options[0])}).click();await page.getByRole('button',{name:i<2?'下一题':'答好了，交给对方',exact:true}).click();await wait(d=>i<2?d.round.step===i+1:d.round.stage==='handoff');}
  await capture('arcade-handoff',true);await page.getByRole('button',{name:'我是小满，开始作答',exact:true}).click();
  for(let i=0;i<3;i++){d=(await read('arcade')).data;await page.getByRole('button',{name:new RegExp(d.round.questions[i].options[i===1?1:0])}).click();await page.getByRole('button',{name:i<2?'下一题':'一起揭晓答案',exact:true}).click();await wait(d=>i<2?d.round.step===i+1:d.round.stage==='reveal');}
  await capture('arcade-result',true);
  await go('house');await page.getByRole('button',{name:'切换夜晚'}).click();await page.getByRole('heading',{name:'灯亮着，慢慢回家。'}).waitFor();await page.waitForTimeout(450);await capture('house-night');await page.getByRole('button',{name:'切换白天'}).click();await page.getByRole('heading',{name:'把日子，安放在这里。'}).waitFor();await go('house/notes');await page.getByRole('heading',{name:'冰箱上的小留言'}).waitFor();await page.waitForTimeout(650);await capture('house-notes-flow');
 } finally {
  await page.evaluate(({arc,house})=>new Promise(resolve=>{const r=indexedDB.open('two-of-us-v2',1);r.onsuccess=()=>{const db=r.result,tx=db.transaction('documents','readwrite');tx.objectStore('documents').put(arc,'arcade');tx.objectStore('documents').put(house,'house');tx.oncomplete=()=>{db.close();resolve(true);};};}),{arc,house});await go('');
 }
 return reports;
}
