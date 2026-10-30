async (page) => {
 const base='http://127.0.0.1:4174/',checks=[],errors=[],badResponses=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)badResponses.push({url:r.url(),status:r.status()});});page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(base))external.push(r.url());});
 await page.setViewportSize({width:390,height:844});
 for(const route of ['','together','together/calendar/event/dinner','afterglow','afterglow/album/coast','afterglow/memory/sea-two','house','house/notes/milk','arcade','arcade/plans/first-plan']){
  await page.goto('about:blank');await page.goto(base+'#/'+route);await page.locator('main h1').first().waitFor();await page.waitForLoadState('networkidle');await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));
  const state=await page.evaluate(()=>({title:document.title,headings:[...document.querySelectorAll('main h1')].map(e=>e.textContent),broken:[...document.images].filter(i=>!i.naturalWidth).length,overflow:document.documentElement.scrollWidth>innerWidth}));checks.push({route:route||'selector',...state,pass:!state.broken&&!state.overflow});
 }
 await page.goto(base+'#/afterglow/album/coast');await page.getByRole('heading',{name:'去有海的地方',exact:true}).waitFor();await page.getByRole('link',{name:/风停在你的肩上/}).first().click();await page.getByRole('heading',{name:'风停在你的肩上',exact:true}).waitFor();await page.goBack();await page.getByRole('heading',{name:'去有海的地方',exact:true}).waitFor();checks.push({name:'Browser back returns to album',pass:page.url().endsWith('/album/coast')});
 await page.reload();await page.getByRole('heading',{name:'去有海的地方',exact:true}).waitFor();checks.push({name:'Production deep route refresh',pass:true});checks.push({name:'Assets have no external requests',pass:external.length===0});
 return {checks,passed:checks.filter(c=>c.pass).length,total:checks.length,failures:checks.filter(c=>!c.pass),errors,badResponses,external};
}
