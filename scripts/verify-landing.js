async(page)=>{
 const results=[];
 for(const width of [360,1440]){
  await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:4180/lin-and-yang/');await page.evaluate(()=>document.fonts.ready);
  try{await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});}catch{await page.addScriptTag({path:'codex/v3/node_modules/axe-core/axe.min.js'});}
  results.push({width,violations:await page.evaluate(async()=>{const result=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}));})});
 }
 await page.goto('http://127.0.0.1:4180/lin-and-yang/');await page.keyboard.press('Tab');results.push({check:'Skip link is first keyboard stop',pass:await page.locator('.skip-link').evaluate(e=>e===document.activeElement)});
 await page.keyboard.press('Enter');await page.keyboard.press('Tab');results.push({check:'Skip link moves to version choices',pass:await page.locator('.edition.codex').evaluate(e=>e===document.activeElement)});
 await page.emulateMedia({reducedMotion:'reduce'});results.push({check:'Reduced motion has no transitions',pass:await page.locator('.edition').first().evaluate(e=>getComputedStyle(e).transitionDuration==='0s')});
 await page.emulateMedia({reducedMotion:'no-preference'});return results;
}
