async(page)=>{
 const results=[];await page.setViewportSize({width:360,height:844});
 for(const file of ['memories-planet.html','games-planet.html','mailbox-planet.html','music-planet.html']){
  await page.goto('http://127.0.0.1:4180/lin-and-yang/claude/'+file);await page.waitForTimeout(800);
  results.push({file,...await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1&&r.width>0&&getComputedStyle(e).position!=='fixed';}).slice(0,18).map(e=>({tag:e.tagName,cls:e.className,width:Math.round(e.getBoundingClientRect().width),right:Math.round(e.getBoundingClientRect().right)})),images:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)}))});
  await page.screenshot({path:'output/playwright/claude-'+file.replace('.html','')+'-360.png',fullPage:true});
 }return results;
}
