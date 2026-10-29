async(page)=>{
 const checks=[],failures=[],runtime=[],failedRequests=[];page.on('pageerror',e=>runtime.push(e.message));page.on('requestfailed',r=>{if(!r.failure()?.errorText.includes('ABORTED'))failedRequests.push({url:r.url(),error:r.failure()?.errorText});});const check=(name,v)=>{checks.push({name,pass:!!v});if(!v)throw Error(name);};
 const read=()=>page.evaluate(()=>new Promise(resolve=>{const r=indexedDB.open('our-universe-v3');r.onsuccess=()=>{const db=r.result,q=db.transaction('documents').objectStore('documents').get('universe');q.onsuccess=()=>{resolve(q.result.data);db.close();};};}));
 let backup;
 try{
  await page.setViewportSize({width:1440,height:1000});
  for(const [path,title] of [['',/我们的\s*小宇宙/],['calendar','把明天，留给彼此'],['wishes','心愿星球'],['memories/coast-one','风停在你的肩上'],['albums/journey','慢一点的旅途'],['letters','时光邮局'],['play/quiz','让两颗星，交换一点心事'],['play/draw','今天，星星想带我们去哪儿'],['us','这个宇宙里的我们']]){
   await page.goto('about:blank');await page.goto('http://127.0.0.1:4177/#/'+path);await page.getByRole('heading',{name:title,exact:typeof title==='string'}).first().waitFor();await page.waitForLoadState('networkidle');check('Production direct route '+(path||'home'),true);
   check('Images load on '+(path||'home'),await page.evaluate(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0)));
  }
  check('Local Noto fonts load',await page.evaluate(async()=>{await document.fonts.ready;return document.fonts.check('400 14px "Noto Sans SC"')&&document.fonts.check('500 20px "Noto Serif SC"');}));backup=await read();
  await page.goto('http://127.0.0.1:4177/#/wishes/new');await page.getByLabel('想一起做的事').fill('生产版约会 QA');await page.getByRole('button',{name:'保存心愿',exact:true}).click();await page.getByRole('heading',{name:'心愿星球',exact:true}).waitFor();let d=await read();const wish=d.wishes.find(w=>w.title==='生产版约会 QA');check('Production creates wish',!!wish);
  await page.goto('http://127.0.0.1:4177/#/events/new?wish='+wish.id);await page.getByRole('button',{name:'保存约定',exact:true}).click();await page.getByRole('heading',{name:'把明天，留给彼此'}).waitFor();d=await read();const event=d.events.find(e=>e.wishId===wish.id);check('Production links calendar and wish',!!event);
  await page.goto('http://127.0.0.1:4177/#/events/'+event.id+'/complete');await page.getByLabel('想留下的那一刻').fill('生产版也收好了这一刻。');await page.getByRole('button',{name:'把它收进我们的星空'}).click();await page.getByRole('heading',{name:'生产版约会 QA',exact:true}).waitFor();await page.reload();await page.getByRole('heading',{name:'生产版约会 QA',exact:true}).waitFor();d=await read();check('Production linked completion survives reload',d.wishes.find(w=>w.id===wish.id).done&&d.tickets.some(t=>t.eventId===event.id)&&d.memories.some(m=>m.eventId===event.id));
 }catch(e){failures.push(String(e));}
 finally{if(backup)await page.evaluate(data=>new Promise(resolve=>{const r=indexedDB.open('our-universe-v3');r.onsuccess=()=>{const db=r.result,tx=db.transaction('documents','readwrite');tx.objectStore('documents').put({version:1,data},'universe');tx.oncomplete=()=>{db.close();resolve();};};}),backup);await page.goto('http://127.0.0.1:5177/#/');await page.reload();await page.locator('main h1').waitFor();await page.waitForTimeout(1200);await page.screenshot({path:'output/playwright/home-desktop-final.png'});}
 return {passed:checks.filter(c=>c.pass).length,total:checks.length,checks,failures,runtime,failedRequests};
}
