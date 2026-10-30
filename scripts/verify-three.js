async(page)=>{
 const base='http://127.0.0.1:4180/lin-and-yang/',checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 const check=(name,pass)=>{checks.push({name,pass});if(!pass)throw Error(name)};
 for(const width of [1440,768,390,360]){await page.setViewportSize({width,height:1000});await page.goto(base);await page.evaluate(()=>document.fonts.ready);check('Three entries '+width,await page.locator('.edition').count()===3);check('No overflow '+width,await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth));await page.screenshot({path:'output/playwright/three-'+width+'.png',fullPage:true});}
 await page.getByRole('link',{name:'进入 Codex 初版：四种独立设计',exact:true}).click();await page.getByRole('heading',{name:/想和你/}).waitFor();check('Classic opens',page.url().includes('codex-classic/'));await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));check('Selector pictures load',await page.evaluate(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0)));
 await page.getByRole('link',{name:/返回版本首页/}).click();check('Classic returns',page.url()===base);
 for(const route of ['together','afterglow','house','arcade']){await page.goto(base+'codex-classic/#/'+route);await page.locator('main').first().waitFor();await page.waitForTimeout(800);check(route+' pictures',await page.evaluate(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0)));check(route+' overflow',await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth));await page.reload();await page.locator('main').first().waitFor();check(route+' refresh',true);}
 for(const path of ['codex/','claude/']){await page.goto(base+path);await page.waitForTimeout(800);check(path+' opens',await page.title()!=='');}
 check('No browser errors',errors.length===0);return {checks,errors,passed:checks.filter(x=>x.pass).length};
}
