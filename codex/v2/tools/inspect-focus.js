async (page) => {
 await page.goto('http://127.0.0.1:5174/#/together');await page.waitForLoadState('networkidle');
 const trigger=page.getByRole('button',{name:/小满的心情/});await trigger.waitFor();await trigger.focus();
 const active=()=>page.evaluate(()=>({tag:document.activeElement?.tagName,label:document.activeElement?.getAttribute('aria-label'),html:document.activeElement?.outerHTML.slice(0,300)}));
 const before=await active();await page.keyboard.press('Enter');await page.getByRole('dialog').waitFor();const opened=await active();await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});const closed=await active();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));const settled=await active();
 return {before,opened,closed,settled};
}
