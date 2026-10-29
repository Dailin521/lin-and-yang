async(page)=>{
 const base='http://127.0.0.1:4180/lin-and-yang/';const checks=[],errors=[],responses=[];
 page.on('pageerror',e=>errors.push({url:page.url(),error:e.message}));page.on('response',r=>{if(r.status()>=400)responses.push({url:r.url(),status:r.status()});});
 const check=(name,pass)=>{checks.push({name,pass:!!pass});if(!pass)throw Error(name);};
 const imageStatus=()=>page.evaluate(()=>[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src));
 const captures=[];const failures=[];
 try{
  for(const width of [1440,768,390,360]){
   await page.setViewportSize({width,height:width>700?1000:844});await page.goto(base);await page.getByRole('heading',{name:'选一片喜欢的星空'}).waitFor();await page.evaluate(()=>document.fonts.ready);
   check('Landing fits '+width,await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth));check('Landing images load '+width,(await imageStatus()).length===0);
   await page.screenshot({path:`output/playwright/landing-${width}.png`,fullPage:true});
  }
  await page.getByRole('link',{name:'进入 Codex 版：我们的小宇宙',exact:true}).click();await page.locator('main h1').waitFor();await page.waitForTimeout(900);check('Codex opens from selector',page.url().includes('/lin-and-yang/codex/'));check('Codex images resolve below project prefix',(await imageStatus()).length===0);await page.screenshot({path:'output/playwright/published-codex-360.png',fullPage:true});
  await page.goto(base+'codex/#/memories/coast-one');await page.getByRole('heading',{name:'风停在你的肩上',exact:true}).waitFor();await page.reload();await page.getByRole('heading',{name:'风停在你的肩上',exact:true}).waitFor();check('Codex detail refresh works below prefix',true);
  await page.getByRole('link',{name:'返回版本首页',exact:true}).click();await page.getByRole('heading',{name:'选一片喜欢的星空'}).waitFor();check('Codex returns to selector',page.url()===base);
  await page.getByRole('link',{name:'进入 Claude 版：梦幻星空方案三',exact:true}).click();await page.locator('.hero-title').waitFor();await page.waitForTimeout(3500);check('Claude opens from selector',page.url().endsWith('/claude/'));
  await page.getByRole('link',{name:/版本首页/}).click();await page.getByRole('heading',{name:'选一片喜欢的星空'}).waitFor();check('Claude returns to selector',true);
  const paths=['index.html','universe.html','wishlist.html','interactive.html','memories-planet.html','games-planet.html','mailbox-planet.html','music-planet.html','secret-planet.html'];
  for(const file of paths){await page.goto(base+'claude/'+file);await page.locator('.nav-menu').waitFor();await page.waitForTimeout(350);check('Claude page loads '+file,await page.title()!=='');const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),images=await imageStatus();check('Claude fits narrow screen '+file,!overflow);check('Claude images load '+file,images.length===0);captures.push({file,overflow,images});}
  await page.goto(base+'claude/universe.html');await page.getByRole('link',{name:'进入时光邮局',exact:true}).click({force:true});await page.waitForURL('**/mailbox-planet.html');check('Latest Claude mailbox is reachable from planet',true);
  await page.setViewportSize({width:1280,height:800});await page.goto(base+'claude/');await page.locator('.hero-title').waitFor();await page.waitForTimeout(4000);await page.screenshot({path:'output/playwright/claude-preview-fresh.png'});
  await page.setViewportSize({width:1440,height:1000});await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'output/playwright/landing-desktop-final.png',fullPage:true});
 }catch(e){failures.push(String(e));await page.screenshot({path:'output/playwright/release-failure.png',fullPage:true}).catch(()=>{});}
 return {checks,passed:checks.filter(c=>c.pass).length,total:checks.length,errors,responses,claude:captures,failures};
}
