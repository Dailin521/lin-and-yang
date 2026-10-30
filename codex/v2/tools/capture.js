async (page) => {
 const checks=[];
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const routes=['','together','afterglow','house','arcade'];
 const expected={'':'想和你，','together':'今天，也在一起','afterglow':'日子留下的光','house':'把日子，安放在这里。','arcade':'选一台，开始玩。'};
 for(const width of [390,1440,360,768]) {
  await page.setViewportSize({width,height:width<800?844:1000});
  for(const route of routes) {
   await page.goto('http://127.0.0.1:5174/#/'+route);
   await page.waitForFunction(text=>document.querySelector('h1')?.textContent?.includes(text),expected[route]);
   await page.waitForLoadState('networkidle');
   await page.evaluate(()=>document.fonts.ready);
   await page.evaluate(()=>Promise.all([...document.images].map(img=>img.decode().catch(()=>{}))));
   const info=await page.evaluate(()=>({title:document.title,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),headings:[...document.querySelectorAll('h1')].map(i=>i.textContent)}));
   checks.push({route:route||'selector',...info});
   await page.screenshot({path:`output/playwright/${route||'selector'}-${width}.png`,fullPage:true});
  }
 }
 return {checks,errors};
}
