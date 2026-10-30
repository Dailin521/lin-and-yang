async (page) => {
  // Only run in the dedicated couple-v2 QA browser session; clears demo fixtures.
  await page.goto('about:blank');
  await page.goto('http://127.0.0.1:5174/');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => new Promise((resolve,reject) => {
    const removal=indexedDB.deleteDatabase('two-of-us-v2');
    removal.onblocked=()=>reject(new Error('Another QA tab holds the database open. Close that tab first.'));
    removal.onerror=()=>reject(removal.error);
    removal.onsuccess=()=>{const r=indexedDB.open('two-of-us-v2',1);r.onupgradeneeded=()=>{r.result.createObjectStore('documents');r.result.createObjectStore('images');};r.onsuccess=()=>{r.result.close();Object.keys(localStorage).filter(k=>k.startsWith('draft:')).forEach(k=>localStorage.removeItem(k));resolve(true);};r.onerror=()=>reject(r.error);};
  }));
  await page.reload();
  return {dedicatedQaFixturesReset:true};
}
