async(page)=>{
 const base='http://127.0.0.1:5177/';const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.evaluate(()=>{localStorage.setItem('universe-motion','on')});await page.reload();await page.locator('.mainPlanet').waitFor();
 const layout=[];
 for(const width of [1440,768,390,360]){
  await page.setViewportSize({width,height:width>700?1000:920});await page.goto(base);await page.locator('.mainPlanet').waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);
  layout.push({width,scrollWidth:await page.evaluate(()=>document.documentElement.scrollWidth),brokenImages:await page.evaluate(()=>[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src))});
  await page.screenshot({path:`output/playwright/dream-${width}.png`,fullPage:true});
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(base);await page.locator('.mainPlanet').waitFor();await page.waitForTimeout(1800);await page.screenshot({path:'output/playwright/dream-meteor.png'});
 const hero=await page.locator('.hero h1').boundingBox();await page.mouse.click(hero.x+hero.width*.55,hero.y+hero.height*.5);await page.waitForTimeout(180);await page.screenshot({path:'output/playwright/dream-click.png'});
 await page.locator('.planetSection').scrollIntoViewIfNeeded();await page.waitForTimeout(300);await page.screenshot({path:'output/playwright/dream-planets.png'});
 return {layout,errors};
}
