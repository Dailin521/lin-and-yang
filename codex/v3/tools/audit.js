async (page) => {
  const results = [],
    runtime = [];
  page.on("pageerror", (e) => runtime.push(e.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  const paths = [
    "",
    "today",
    "calendar",
    "events/new",
    "events/gallery-date",
    "events/gallery-date/complete",
    "wishes",
    "wishes/new",
    "wishes/sea",
    "memories",
    "memories/albums",
    "memories/archive",
    "albums/coast",
    "memories/new",
    "memories/coast-one",
    "memories/coast-one/edit",
    "letters",
    "letters/new",
    "letters/first-light",
    "play",
    "play/quiz",
    "play/draw",
    "play/tickets",
    "us",
  ];
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of paths) {
      await page.goto("http://127.0.0.1:5177/#/" + path);
      await page.locator("main h1,main h2").first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      let violations = [];
      if (width === 390 || width === 1440) {
        await page.addScriptTag({ path: "node_modules/axe-core/axe.min.js" });
        violations = await page.evaluate(async () => {
          const a = await axe.run({
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
          });
          return a.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.map((n) => ({
              html: n.html,
              target: n.target,
              summary: n.failureSummary,
            })),
          }));
        });
      }
      results.push({ path: path || "home", width, overflow, violations });
    }
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  return {
    pages: results.length,
    results,
    runtime,
    failed: results.filter((x) => x.overflow || x.violations.length),
  };
}
