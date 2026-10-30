async (page) => {
 page.setDefaultTimeout(10000);
 const checks=[], failures=[], runtime=[];
 page.on('pageerror',e=>runtime.push(e.message));
 const base='http://127.0.0.1:5174/#/';
 const check=(name,value)=>{checks.push({name,pass:!!value});if(!value)throw Error(name);};
 const go=async(route,heading)=>{await page.goto(base+route);if(heading)await page.getByRole('heading',{name:heading,exact:true}).waitFor();await page.waitForLoadState('networkidle');};
 const read=scope=>page.evaluate(scope=>new Promise((resolve,reject)=>{const r=indexedDB.open('two-of-us-v2',1);r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result;const q=db.transaction('documents').objectStore('documents').get(scope);q.onsuccess=()=>{resolve(q.result.data);db.close();};q.onerror=()=>reject(q.error);};}),scope);
 const settle=async(scope,predicate)=>{let data;for(let n=0;n<60;n++){data=await read(scope);if(predicate(data))return data;await page.waitForTimeout(60);}throw Error('Saved state did not settle: '+scope);};
 for(const [route,title] of [['together','今天，也在一起'],['afterglow','日子留下的光'],['house','把日子，安放在这里。'],['arcade','选一台，开始玩。']])await go(route,title);
 const backup=await page.evaluate(()=>new Promise(resolve=>{const r=indexedDB.open('two-of-us-v2',1);r.onsuccess=async()=>{const db=r.result;const get=(store,method)=>new Promise(res=>{const q=db.transaction(store).objectStore(store)[method]();q.onsuccess=()=>res(q.result);});const docs=await get('documents','getAll');const docKeys=await get('documents','getAllKeys');const imageKeys=await get('images','getAllKeys');db.close();resolve({docs,docKeys,imageKeys,drafts:Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith('draft:')).map(k=>[k,localStorage.getItem(k)]))});};}));
 async function suite(name,fn){try{await page.setViewportSize({width:390,height:844});await fn();}catch(e){failures.push({suite:name,error:String(e)});await page.screenshot({path:`output/playwright/failure-${name}.png`,fullPage:true,timeout:30000}).catch(()=>{});}}
 try {
 await suite('together',async()=>{
  await go('together','今天，也在一起');
  await page.getByRole('button',{name:'编辑今天的话'}).click();
  await page.getByRole('textbox',{name:'今天的一句话'}).fill('我们把今天留在这里。QA');
  await page.getByRole('button',{name:'保存这句话'}).click();
  let d=await settle('together',d=>Object.values(d.notes).includes('我们把今天留在这里。QA'));check('Together note persisted',Object.values(d.notes).includes('我们把今天留在这里。QA'));
  await go('together/wishes','想和你一起做的事');
  await page.getByRole('button',{name:'写下愿望',exact:true}).click();
  await page.getByLabel('这件事叫什么').fill('一起看一场星星 QA');
  await page.getByLabel('为什么想一起做').fill('带上热茶和一张毯子');
  await page.getByRole('button',{name:'保存愿望'}).click();
  d=await settle('together',d=>d.wishes.some(w=>w.title==='一起看一场星星 QA'));const wish=d.wishes.find(w=>w.title==='一起看一场星星 QA');check('Together wish create',!!wish);
  await go(`together/calendar/new?wish=${wish.id}`,'留一个一起的时间');
  check('Wish scheduling prefill',await page.getByLabel('约定的名字').inputValue()===wish.title);
  await page.getByLabel('哪一天').fill('2026-11-10');await page.getByRole('button',{name:'保存约定'}).click();
  d=await settle('together',d=>d.events.some(e=>e.wishId===wish.id));const event=d.events.find(e=>e.wishId===wish.id);check('Wish linked to calendar',event.date==='2026-11-10');
  await go(`together/wishes/${wish.id}`);await page.getByRole('dialog').waitFor();await page.getByLabel('这件事叫什么').fill('一起看一场星星 QA 更新');await page.getByRole('button',{name:'稍后再写',exact:true}).click();
  await page.getByRole('button',{name:`标记完成：${wish.title}`}).click();d=await settle('together',d=>d.wishes.find(w=>w.id===wish.id)?.done);
  check('Completing wish completes linked event',d.events.find(e=>e.id===event.id).done);
  await go(`together/wishes/${wish.id}`);await page.getByRole('dialog').waitFor();check('Wish draft retained',await page.getByLabel('这件事叫什么').inputValue()==='一起看一场星星 QA 更新');await page.getByRole('button',{name:'保存愿望'}).click();
  d=await settle('together',d=>d.wishes.find(w=>w.id===wish.id)?.title.endsWith('更新'));check('Stale editing draft does not reopen wish',d.wishes.find(w=>w.id===wish.id).done);
  await go(`together/calendar/event/${event.id}`,'约好的这一天');await page.reload();await page.getByRole('heading',{name:'约好的这一天'}).waitFor();check('Calendar deep-link reload',await page.getByLabel('约定的名字').inputValue()===wish.title);
  await page.getByRole('button',{name:'重新打开约定'}).click();d=await settle('together',d=>!d.events.find(e=>e.id===event.id).done);check('Reopen event reopens wish',!d.wishes.find(w=>w.id===wish.id).done);
  await page.screenshot({path:'output/playwright/together-calendar-flow.png',fullPage:true});
  await go('together','今天，也在一起');await page.getByRole('button',{name:'编辑今天的话'}).click();await page.getByRole('textbox',{name:'今天的一句话'}).fill('保存失败后仍应保留这句 QA');
  await page.evaluate(()=>{window.__originalPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){if(this.name==='documents')throw new DOMException('QA failure','QuotaExceededError');return window.__originalPut.apply(this,args);};});
  await page.getByRole('button',{name:'保存这句话'}).click();await page.getByRole('alert').first().waitFor();check('Save failure retains input',await page.getByRole('textbox',{name:'今天的一句话'}).inputValue()==='保存失败后仍应保留这句 QA');
  await page.evaluate(()=>{IDBObjectStore.prototype.put=window.__originalPut;delete window.__originalPut;});await page.getByRole('button',{name:'保存这句话'}).click();await settle('together',d=>Object.values(d.notes).includes('保存失败后仍应保留这句 QA'));check('Save retry succeeds',true);
 });
 await suite('afterglow',async()=>{
  await go('afterglow','日子留下的光');await page.getByRole('button',{name:'新建相册',exact:true}).click();await page.getByLabel('相册的名字').fill('测试里的一个周末 QA');await page.getByLabel('关于这段时光').fill('一段虚构的浏览器验证记录');await page.getByRole('button',{name:'使用这张封面'}).nth(2).click();await page.getByRole('button',{name:'保存相册'}).click();
  let d=await settle('afterglow',d=>d.albums.some(a=>a.title==='测试里的一个周末 QA'));const album=d.albums.find(a=>a.title==='测试里的一个周末 QA');check('Album create and cover choice',album.cover==='/assets/morning.png');
  await go(`afterglow/memory/new?album=${album.id}`,'留住这一刻');await page.getByLabel('回忆的名字').fill('一起等一场雨停 QA');await page.getByLabel('写下一点细节').fill('这是上传、排序与持久化验证。');await page.locator('input[type=file]').setInputFiles(['public/assets/coast.png','public/assets/morning.png']);
  await page.getByRole('img',{name:'待保存照片 2'}).waitFor();await page.getByRole('button',{name:'将第 2 张照片前移'}).click();await page.getByRole('button',{name:'收好这段回忆'}).click();await page.getByRole('heading',{name:'一起等一场雨停 QA',exact:true}).waitFor();
  d=await read('afterglow');const memory=d.memories.find(m=>m.title==='一起等一场雨停 QA');check('Photo upload stored as blobs',memory.photos.length===2&&memory.photos.every(p=>p.startsWith('image:')));check('Memory album association',memory.albumId===album.id);
  await page.reload();await page.getByRole('heading',{name:memory.title,exact:true}).waitFor();await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));check('Uploaded photos survive refresh',await page.locator('main img').evaluateAll(imgs=>imgs.every(i=>i.naturalWidth>0)));
  await page.screenshot({path:'output/playwright/afterglow-memory-flow.png',fullPage:true});
  await go(`afterglow/album/${album.id}`,album.title);await page.getByRole('button',{name:'删除相册',exact:true}).click();await page.getByRole('button',{name:'删除相册，保留回忆'}).click();d=await settle('afterglow',d=>!d.albums.some(a=>a.id===album.id));check('Deleting album preserves uncategorized memories',d.memories.find(m=>m.id===memory.id)?.albumId===null);
  await go('afterglow/letters/new','把想说的话，慢慢写');await page.getByLabel('信的标题').fill('只写给你的测试来信 QA');await page.getByLabel('信的正文').fill('今天的好天气，想分给你一半。');await page.getByRole('button',{name:'寄给小满',exact:true}).click();await page.getByRole('button',{name:'确认寄出'}).click();
  d=await settle('afterglow',d=>d.letters.some(l=>l.title==='只写给你的测试来信 QA'&&l.status==='sent'));const letter=d.letters.find(l=>l.title==='只写给你的测试来信 QA');check('Letter delivery state',letter.from===0&&letter.to===1);
  await page.getByRole('button',{name:'身份与余温设置'}).click();await page.getByRole('dialog').getByRole('button',{name:/小满/}).click();
  await go(`afterglow/letters/${letter.id}`,letter.title);check('Sent letter immutable',await page.locator('textarea').count()===0);await page.getByRole('button',{name:'我读过了'}).click();await settle('afterglow',d=>d.letters.find(l=>l.id===letter.id).read);await page.getByRole('button',{name:'收藏这封信'}).click();d=await settle('afterglow',d=>d.letters.find(l=>l.id===letter.id).status==='archived');check('Recipient read and archive',d.letters.find(l=>l.id===letter.id).read);
  await page.screenshot({path:'output/playwright/afterglow-letter-flow.png',fullPage:true});
  await go('afterglow/memory/new','留住这一刻');await page.getByLabel('回忆的名字').fill('重置应清空的草稿 QA');await page.getByRole('button',{name:'身份与余温设置'}).click();await page.getByRole('button',{name:'重置余温演示数据'}).click();await page.getByRole('button',{name:'确认重置余温'}).click();await page.getByRole('heading',{name:'日子留下的光',exact:true}).waitFor();check('Reset navigates away from stale editor',page.url().endsWith('#/afterglow'));
  await go('afterglow/memory/new','留住这一刻');check('Reset clears draft editor',await page.getByLabel('回忆的名字').inputValue()==='');d=await read('together');check('Afterglow reset does not reset Together',Object.values(d.notes).includes('保存失败后仍应保留这句 QA'));
 });
 await suite('house',async()=>{
  await go('house','把日子，安放在这里。');await page.getByRole('button',{name:'切换夜晚'}).click();await settle('house',d=>d.night);await page.reload();await page.getByRole('heading',{name:'灯亮着，慢慢回家。'}).waitFor();check('House night state persists',true);await page.getByRole('button',{name:'切换白天'}).click();
  await go('house/notes/new');await page.getByLabel('想说的话').fill('窗台的花开了，记得来看 QA');await page.getByRole('button',{name:'右下角',exact:true}).click();await page.getByRole('button',{name:'贴到冰箱上'}).click();let d=await settle('house',d=>d.notes.some(n=>n.text.endsWith('QA')));const note=d.notes.find(n=>n.text.endsWith('QA'));check('House note create and position',note.position===2&&note.role===0);
  await go(`house/notes/${note.id}`);await page.getByLabel('想说的话').fill('窗台的花开了 QA 更新');await page.getByRole('button',{name:'左上角',exact:true}).click();await page.getByRole('button',{name:'保存这张便笺'}).click();d=await settle('house',d=>d.notes.find(n=>n.id===note.id)?.position===0);check('House note edit and move',d.notes.find(n=>n.id===note.id).text.endsWith('更新'));
  await page.screenshot({path:'output/playwright/house-notes-flow.png',fullPage:true});
  await go('house/plant');await page.getByRole('button',{name:'给它一点水',exact:true}).click();d=await settle('house',d=>d.water.length===3);check('Plant watering recorded once',d.water.length===3);check('Plant daily action disabled',await page.getByRole('button',{name:'阿澄今天已经浇过水'}).isDisabled());
  await page.getByRole('button',{name:'换一个人',exact:true}).click();await page.getByRole('button',{name:'给它一点水',exact:true}).click();d=await settle('house',d=>d.water.length===4);check('Each role can water separately',d.water.slice(-2).map(w=>w.role).join(',')==='0,1');
  await go('house/decorate');await page.getByRole('button',{name:'一盆小雏菊',exact:true}).click();check('Decor preview does not save early',(await read('house')).decor.plant===0);await page.getByRole('button',{name:'就这样布置'}).click();d=await settle('house',d=>d.decor.plant===1);check('Decor saved',d.decor.plant===1);await page.reload();await page.getByRole('heading',{name:'让家有一点新变化'}).waitFor();check('Decor survives reload',await page.getByRole('button',{name:'就这样布置'}).isDisabled());
  await go(`house/notes/${note.id}`);await page.getByRole('button',{name:'取下这张便笺'}).click();await page.getByRole('button',{name:'确认取下'}).click();d=await settle('house',d=>!d.notes.some(n=>n.id===note.id));check('House note delete',!d.notes.some(n=>n.id===note.id));
 });
 await suite('arcade',async()=>{
  await go('arcade/quiz','默契碰碰机');await page.getByRole('button',{name:'由阿澄开始',exact:true}).click();
  for(let i=0;i<3;i++){let d=await read('arcade');await page.getByRole('button',{name:new RegExp(d.round.questions[i].options[0])}).click();await page.getByRole('button',{name:i<2?'下一题':'答好了，交给对方',exact:true}).click();await settle('arcade',d=>i<2?d.round.step===i+1:d.round.stage==='handoff');}
  let d=await read('arcade');check('Quiz handoff has no revealed result',d.round.stage==='handoff'&&await page.getByText('本局心动成绩单',{exact:true}).count()===0);await page.screenshot({path:'output/playwright/arcade-handoff.png',fullPage:true});await page.reload();await page.getByRole('button',{name:'继续这一局',exact:true}).click();await page.getByRole('button',{name:'我是小满，开始作答',exact:true}).click();
  for(let i=0;i<3;i++){d=await read('arcade');await page.getByRole('button',{name:new RegExp(d.round.questions[i].options[i===1?1:0])}).click();await page.getByRole('button',{name:i<2?'下一题':'一起揭晓答案',exact:true}).click();await settle('arcade',d=>i<2?d.round.step===i+1:d.round.stage==='reveal');}
  d=await read('arcade');check('Quiz reveals only after both finish',d.round.stage==='reveal'&&Object.keys(d.round.first).length===3&&Object.keys(d.round.second).length===3);await page.getByRole('button',{name:'收好这张默契票根'}).click();d=await settle('arcade',d=>d.tickets.some(t=>t.sourceId==='quiz:'+d.round.id));const ticket=d.tickets.find(t=>t.sourceId==='quiz:'+d.round.id);check('Quiz result snapshot saved',ticket.quiz.questions.length===3&&ticket.quiz.first[ticket.quiz.questions[0].id]);await page.screenshot({path:'output/playwright/arcade-result.png',fullPage:true});
  await go(`arcade/tickets/${ticket.id}`,'我们的小默契');await page.reload();await page.getByRole('heading',{name:'我们的小默契',exact:true}).waitFor();check('Ticket direct link reload',true);
  await go('arcade/draw','转出今天的约会');await page.getByRole('button',{name:'一整天',exact:true}).click();await page.getByRole('button',{name:'不花钱',exact:true}).click();await page.getByRole('button',{name:'室内',exact:true}).click();await page.getByRole('heading',{name:'这次的条件有点严格。'}).waitFor();check('Draw empty state',true);await page.getByRole('button',{name:'放宽条件，看看更多'}).click();await page.getByRole('button',{name:'抽一个，一起去',exact:true}).click();await page.getByRole('button',{name:'放进我们的待出发'}).click();d=await settle('arcade',d=>d.plans.some(p=>p.sourceId==='draw:'+d.draw.id));const plan=d.plans.find(p=>p.sourceId==='draw:'+d.draw.id);check('Draw saved as plan',!!plan);
  await page.getByRole('link',{name:'安排哪一天',exact:true}).click();await page.getByLabel('安排在哪一天').fill('2026-11-11');await page.getByLabel('记下一点小安排').fill('一起准备点心 QA');await page.getByRole('button',{name:'保存安排',exact:true}).click();await settle('arcade',d=>d.plans.find(p=>p.id===plan.id).note.endsWith('QA'));await page.getByRole('button',{name:'我们去过啦'}).click();await page.getByLabel('这次约会，想记住什么？').fill('原来普通的一天也可以这样开心 QA');await page.getByRole('button',{name:'完成并收好票根'}).click();d=await settle('arcade',d=>d.plans.find(p=>p.id===plan.id).status==='completed');check('Plan completion creates ticket',d.plans.find(p=>p.id===plan.id).historyIds.length===1);const hist=d.tickets.find(t=>t.id===d.plans.find(p=>p.id===plan.id).historyIds[0]);check('Date ticket preserves reflection and arrangement',hist.plan.reflection.endsWith('QA')&&hist.plan.note.endsWith('QA'));
  await go(`arcade/tickets/${hist.id}`);await page.getByRole('button',{name:'删除票根',exact:true}).click();await page.getByRole('button',{name:'确认删除票根'}).click();d=await settle('arcade',d=>!d.tickets.some(t=>t.id===hist.id));check('Ticket delete retains completed plan',d.plans.find(p=>p.id===plan.id).status==='completed');
 });
 } finally {
  await page.evaluate(backup=>new Promise(resolve=>{const r=indexedDB.open('two-of-us-v2',1);r.onsuccess=()=>{const db=r.result;const tx=db.transaction(['documents','images'],'readwrite');backup.docKeys.forEach((key,i)=>tx.objectStore('documents').put(backup.docs[i],key));const keys=tx.objectStore('images').getAllKeys();keys.onsuccess=()=>keys.result.filter(k=>!backup.imageKeys.includes(k)).forEach(k=>tx.objectStore('images').delete(k));tx.oncomplete=()=>{db.close();Object.keys(localStorage).filter(k=>k.startsWith('draft:')).forEach(k=>localStorage.removeItem(k));Object.entries(backup.drafts).forEach(([k,v])=>localStorage.setItem(k,v));resolve(true);};};}),backup);
  await page.goto(base);await page.reload();
 }
 return {checks,failures,runtime,passed:checks.filter(c=>c.pass).length,total:checks.length};
}
