async(page)=>{
 const base='http://127.0.0.1:4180/lin-and-yang/codex/';
 const browser=page.context().browser(),context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const instrument=()=>{
  window.__skyQA={frames:[],meteors:0};
  const clear=CanvasRenderingContext2D.prototype.clearRect,stroke=CanvasRenderingContext2D.prototype.stroke;
  CanvasRenderingContext2D.prototype.clearRect=function(...args){if(this.canvas.classList.contains('starfield')){window.__skyQA.frames.push(performance.now());if(window.__skyQA.frames.length>400)window.__skyQA.frames.shift();}return clear.apply(this,args);};
  CanvasRenderingContext2D.prototype.stroke=function(...args){if(this.canvas.classList.contains('starfield')&&this.lineWidth===6)window.__skyQA.meteors++;return stroke.apply(this,args);};
 };await context.addInitScript(instrument);
 const tab=await context.newPage(),checks=[],errors=[],failures=[],metrics=[];tab.on('pageerror',e=>errors.push(e.message));
 const check=(name,pass)=>{checks.push({name,pass:!!pass});if(!pass)throw Error(name);};
 const pixels=async(target=tab)=>target.locator('.cosmicFeedback').evaluate(c=>{const bytes=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<bytes.length;i+=4)if(bytes[i]>8)n++;return n;});
 const snapshot=()=>tab.locator('.starfield').evaluate(c=>c.toDataURL());
 try{
  for(const width of [360,390,768,1440]){
   await tab.setViewportSize({width,height:width>700?1000:844});await tab.goto(base);await tab.locator('.mainPlanet').waitFor();await tab.evaluate(()=>document.fonts.ready);await tab.waitForTimeout(1300);
   check('No overflow '+width,await tab.evaluate(()=>document.documentElement.scrollWidth===innerWidth));
   check('Photos loaded '+width,await tab.evaluate(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0)));
   await tab.screenshot({path:`output/playwright/dream-final-${width}.png`,fullPage:width<1000});
  }
  await tab.waitForTimeout(500);check('Meteors actually rendered',await tab.evaluate(()=>window.__skyQA.meteors>0));
  check('Feedback layer passes input through',await tab.locator('.cosmicFeedback').evaluate(c=>getComputedStyle(c).pointerEvents==='none'&&Number(getComputedStyle(c).zIndex)>100));
  await tab.evaluate(()=>{window.__skyQA.frames=[]});await tab.waitForTimeout(3000);
  metrics.push(await tab.evaluate(()=>{const f=window.__skyQA.frames,d=f.slice(1).map((n,i)=>n-f[i]).sort((a,b)=>a-b);return {viewport:innerWidth,canvasFPS:Math.round((f.length-1)*1000/(f.at(-1)-f[0])),p95IntervalMs:Math.round(d[Math.floor(d.length*.95)]),draws:f.length};}));
  check('Canvas cadence stays bounded',metrics[0].canvasFPS>=20&&metrics[0].canvasFPS<=34);
  const title=await tab.locator('.hero h1').boundingBox();await tab.mouse.click(title.x+title.width*.57,title.y+title.height*.5);await tab.waitForTimeout(130);
  check('Click emits visible foreground stardust',await pixels()>150);await tab.screenshot({path:'output/playwright/dream-feedback-final.png'});
  await tab.waitForTimeout(1500);check('Stardust fully cleans itself up',await pixels()===0);
  await tab.locator('.mainPlanet').focus();await tab.keyboard.press('Enter');await tab.waitForURL('**/#/memories/*');
  check('Planet keyboard activation opens memory',await tab.getByRole('heading',{name:'风停在你的肩上',exact:true}).isVisible());check('Keyboard activation also emits stardust',await pixels()>0);
  await tab.getByRole('button',{name:'暂停动态效果',exact:true}).click();await tab.waitForTimeout(100);const stopped=await snapshot();await tab.waitForTimeout(600);
  check('Pause freezes sky pixels',stopped===await snapshot());check('Pause clears feedback',await pixels()===0);
  await tab.goto(base);await tab.locator('.mainPlanet').waitFor();check('Pause persists across page reload',await tab.evaluate(()=>document.documentElement.dataset.motion==='off'));
  check('Planet and orbit loops stop when paused',await tab.evaluate(()=>['.mainPlanet','.planetAtmosphere','.ringOne i','.destinationGlow'].every(s=>getComputedStyle(document.querySelector(s)).animationName==='none')));
  await tab.getByRole('button',{name:'开启动起来的星空',exact:true}).click();await tab.waitForTimeout(100);const resumed=await snapshot();await tab.waitForTimeout(150);
  check('Resume animates sky again',resumed!==await snapshot());
  await tab.locator('.homeBottom').scrollIntoViewIfNeeded();await tab.waitForTimeout(250);
  check('Offscreen hero animations are paused',await tab.locator('.mainPlanet').evaluate(e=>getComputedStyle(e).animationPlayState==='paused'));
  await tab.emulateMedia({reducedMotion:'reduce'});await tab.goto(base);await tab.locator('.mainPlanet').waitFor();await tab.waitForTimeout(100);
  check('System reduced motion takes precedence',await tab.getByRole('button',{name:'已遵循系统减少动态效果'}).isDisabled());
  const reduced=await snapshot();await tab.waitForTimeout(400);check('Reduced motion draws a static sky',reduced===await snapshot());
  const rt=await tab.locator('.hero h1').boundingBox();await tab.mouse.click(rt.x+30,rt.y+30);check('Reduced motion has no particle bursts',await pixels()===0);
  await tab.screenshot({path:'output/playwright/dream-reduced-motion.png'});await tab.emulateMedia({reducedMotion:'no-preference'});
  await tab.goto(base+'#/wishes/new');await tab.getByLabel('想一起做的事').waitFor();await tab.getByLabel('想一起做的事').click();await tab.getByLabel('想一起做的事').fill('星空效果检查');
  check('Typing never emits particles',await pixels()===0);
  await tab.goto(base);await tab.locator('.mainPlanet').waitFor();try{await tab.addScriptTag({path:'node_modules/axe-core/axe.min.js'});}catch{await tab.addScriptTag({path:'codex/v3/node_modules/axe-core/axe.min.js'});}
  const violations=await tab.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));});
  check('Home accessibility scan passes',violations.length===0);
  const phoneContext=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});await phoneContext.addInitScript(instrument);const phone=await phoneContext.newPage();
  try{
   await phone.goto(base);await phone.locator('.mainPlanet').waitFor();await phone.locator('.hero h1').tap();await phone.waitForTimeout(130);
   check('Real touch tap emits visible stardust',await pixels(phone)>150);check('Phone pixel ratio is capped',await phone.locator('.cosmicFeedback').evaluate(c=>c.width/innerWidth<=1.5));
   await phone.waitForTimeout(1500);await phone.evaluate(()=>{window.__skyQA.frames=[]});await phone.waitForTimeout(2500);
   metrics.push(await phone.evaluate(()=>{const f=window.__skyQA.frames,d=f.slice(1).map((n,i)=>n-f[i]).sort((a,b)=>a-b);return {viewport:innerWidth,canvasFPS:Math.round((f.length-1)*1000/(f.at(-1)-f[0])),p95IntervalMs:Math.round(d[Math.floor(d.length*.95)]),draws:f.length};}));check('Touch emulation keeps bounded cadence',metrics[1].canvasFPS>=20&&metrics[1].canvasFPS<=34);
   const cdp=await phoneContext.newCDPSession(phone);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:310,y:570}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:310,y:400}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await phone.waitForTimeout(150);
   check('Touch scrolling does not burst',await pixels(phone)===0);
   await phone.getByRole('navigation',{name:'手机导航'}).getByRole('link',{name:'心愿',exact:true}).tap();await phone.getByRole('heading',{name:'心愿星球',exact:true}).waitFor();check('Foreground effects do not block touch navigation',true);
   await phone.getByRole('button',{name:'切换身份或查看资料'}).tap();await phone.getByRole('dialog').waitFor();check('Dialog remains above decorative layers',await phone.getByRole('dialog').isVisible());
  }finally{await phoneContext.close();}
 }catch(e){failures.push(String(e));await tab.screenshot({path:'output/playwright/dream-verification-failure.png',fullPage:true}).catch(()=>{});}
 finally{await context.close();}
 return {checks,passed:checks.filter(c=>c.pass).length,total:checks.length,metrics,errors,failures};
}
