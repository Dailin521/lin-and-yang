async (page) => {
  const results = [];
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const [path, name] of [
      ["", "home"],
      ["today", "daily"],
      ["memories", "memories"],
      ["wishes", "wishes"],
      ["letters", "letters"],
      ["play", "games"],
      ["play/draw", "draw"],
      ["us", "profile"],
    ]) {
      await page.goto("http://127.0.0.1:5177/#/" + path);
      await page.locator("main h1").first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(550);
      await page.screenshot({
        path: `output/playwright/${name}-${width}.png`,
        fullPage: true,
      });
      results.push({
        path,
        width,
        ...(await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          overflow: [...document.querySelectorAll("body *")]
            .filter((e) => {
              const r = e.getBoundingClientRect();
              return (
                r.right > innerWidth + 1 &&
                r.width > 0 &&
                getComputedStyle(e).position !== "fixed"
              );
            })
            .map((e) => ({
              tag: e.tagName,
              cls: e.className,
              right: Math.round(e.getBoundingClientRect().right),
            }))
            .slice(0, 12),
        }))),
      });
    }
  }
  return { results, errors };
}
