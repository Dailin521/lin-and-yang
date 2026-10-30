async (page) => {
 const result=[];
 const paths=['','together','together/calendar','together/wishes','together/us','afterglow','afterglow/album/coast','afterglow/memory/new','afterglow/letters','house','house/plant','house/notes/new','house/decorate','arcade','arcade/quiz','arcade/draw','arcade/plans','arcade/tickets'];
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});
  for(const path of paths){
   await page.goto('about:blank');
   await page.goto('http://127.0.0.1:5174/#/'+path);
   await page.locator('main h1').first().waitFor();
   if(path.startsWith('house/'))await page.locator('aside h2').first().waitFor();
   await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);
   await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
   const audit=await page.evaluate(async()=>{const a=await axe.run({runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return {overflow:document.documentElement.scrollWidth>innerWidth,violations:a.violations.map(v=>({id:v.id,impact:v.impact,count:v.nodes.length,nodes:v.nodes.map(n=>({html:n.html,target:n.target,summary:n.failureSummary}))}))};});
   result.push({path:path||'selector',width,...audit});
  }
 }
 return result;
}
