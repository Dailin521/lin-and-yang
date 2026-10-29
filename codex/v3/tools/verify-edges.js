async (page) => {
  page.setDefaultTimeout(8000);
  const checks = [],
    failures = [],
    runtime = [];
  page.on("pageerror", (e) => runtime.push(e.message));
  const check = (name, value) => {
    checks.push({ name, pass: !!value });
    if (!value) throw Error(name);
  };
  const go = async (path) => {
    await page.goto("http://127.0.0.1:5177/#/" + path);
    await page.locator("main h1,main h2").first().waitFor();
    await page.waitForTimeout(450);
  };
  const read = () =>
    page.evaluate(
      () =>
        new Promise((resolve) => {
          const r = indexedDB.open("our-universe-v3");
          r.onsuccess = () => {
            const db = r.result,
              q = db
                .transaction("documents")
                .objectStore("documents")
                .get("universe");
            q.onsuccess = () => {
              resolve(q.result.data);
              db.close();
            };
          };
        }),
    );
  const write = (data) =>
    page.evaluate(
      (data) =>
        new Promise((resolve) => {
          const r = indexedDB.open("our-universe-v3");
          r.onsuccess = () => {
            const db = r.result,
              tx = db.transaction("documents", "readwrite");
            tx.objectStore("documents").put({ version: 1, data }, "universe");
            tx.oncomplete = () => {
              db.close();
              resolve();
            };
          };
        }),
      data,
    );
  await go("");
  const backup = await read();
  const stored = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const r = indexedDB.open("our-universe-v3");
        r.onsuccess = async () => {
          const db = r.result;
          const get = (method) =>
            new Promise((res) => {
              const q = db
                .transaction("images")
                .objectStore("images")
                [method]();
              q.onsuccess = () => res(q.result);
            });
          const keys = await get("getAllKeys"),
            blobs = await get("getAll");
          const images = await Promise.all(
            blobs.map(async (b, i) => ({
              key: keys[i],
              type: b.type,
              bytes: Array.from(new Uint8Array(await b.arrayBuffer())),
            })),
          );
          db.close();
          resolve({
            images,
            local: Object.fromEntries(
              Object.keys(localStorage).map((k) => [
                k,
                localStorage.getItem(k),
              ]),
            ),
          });
        };
      }),
  );
  try {
    await page.setViewportSize({ width: 360, height: 800 });
    await go("");
    check(
      "360px hero has no horizontal overflow",
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.getByRole("button", { name: "暂停动态效果" }).click();
    check(
      "Motion can be paused",
      await page.evaluate(
        () => document.documentElement.dataset.motion === "off",
      ),
    );
    const static1 = await page.locator("canvas").evaluate((c) => c.toDataURL());
    await page.waitForTimeout(180);
    const static2 = await page.locator("canvas").evaluate((c) => c.toDataURL());
    check("Paused starfield stops drawing", static1 === static2);
    await page.reload();
    await page.getByRole("button", { name: "开启动起来的星空" }).waitFor();
    check("Motion preference survives refresh", true);
    await page.getByRole("button", { name: "开启动起来的星空" }).click();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page
      .getByRole("button", { name: "已遵循系统减少动态效果" })
      .waitFor();
    check(
      "System reduced motion overrides animation",
      await page.evaluate(
        () =>
          document.documentElement.dataset.motion === "off" &&
          getComputedStyle(document.querySelector(".mainPlanet"))
            .animationName === "none",
      ),
    );
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.getByRole("button", { name: "切换身份或查看资料" }).click();
    await page.getByRole("dialog").waitFor();
    await page.keyboard.press("Tab");
    check(
      "Modal traps keyboard focus",
      await page.evaluate(() => !!document.activeElement.closest("dialog")),
    );
    await page.keyboard.press("Escape");
    check(
      "Modal Escape restores trigger focus",
      await page
        .getByRole("button", { name: "切换身份或查看资料" })
        .evaluate((e) => e === document.activeElement),
    );
    await go("play/draw");
    await page.getByLabel("有多少时间").selectOption("day");
    await page.getByLabel("两个人的预算").selectOption("free");
    await page.getByLabel("想待在哪里").selectOption("indoors");
    await page.getByRole("button", { name: "交给星星吧" }).click();
    await page.getByRole("button", { name: "调整筛选" }).waitFor();
    check(
      "No matching draw has explicit recovery",
      await page
        .getByRole("heading", { name: "这片星空，暂时没有合适的灵感" })
        .isVisible(),
    );
    await page.getByRole("button", { name: "调整筛选" }).click();
    check(
      "Recovery focuses filter",
      await page
        .getByLabel("有多少时间")
        .evaluate((e) => e === document.activeElement),
    );
    await page.screenshot({
      path: "output/playwright/no-match-360.png",
      fullPage: true,
    });
    await go("memories/new");
    await page.getByLabel("给这一刻起个名字").fill("失败后保留的回忆 QA");
    await page
      .getByLabel("上传照片")
      .setInputFiles({
        name: "invalid.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("test"),
      });
    check(
      "Unsupported upload gives helpful error",
      await page
        .getByRole("alert")
        .filter({ hasText: "请选择 JPG" })
        .isVisible(),
    );
    await page
      .getByLabel("上传照片")
      .setInputFiles({
        name: "broken.png",
        mimeType: "image/png",
        buffer: Buffer.from("not-an-image"),
      });
    await page.getByRole("alert").filter({ hasText: "暂时无法读取" }).waitFor();
    check(
      "Corrupt upload preserves title",
      (await page.getByLabel("给这一刻起个名字").inputValue()) ===
        "失败后保留的回忆 QA",
    );
    await page
      .getByLabel("上传照片")
      .setInputFiles({
        name: "large.png",
        mimeType: "image/png",
        buffer: Buffer.alloc(15 * 1024 * 1024 + 1),
      });
    await page.getByRole("alert").filter({ hasText: "15 MB" }).waitFor();
    check("Oversized upload rejected before decoding", true);
    await page.getByLabel("还记得……").fill("没有照片也想保存的一天。");
    await page.evaluate(() => {
      window.__oldPut = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function (...a) {
        if (this.name === "documents")
          throw new DOMException("QA", "QuotaExceededError");
        return window.__oldPut.apply(this, a);
      };
    });
    await page.getByRole("button", { name: "把这一刻收好" }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "还没有保存成功" })
      .waitFor();
    check(
      "Memory save failure retains full form",
      (await page.getByLabel("还记得……").inputValue()) ===
        "没有照片也想保存的一天。",
    );
    await page.evaluate(() => {
      IDBObjectStore.prototype.put = window.__oldPut;
    });
    await go("letters/new");
    await page.getByLabel("想说的话").fill("只写了一半，还没想好名字。");
    await page.getByRole("button", { name: "存为草稿", exact: true }).click();
    await page
      .getByRole("heading", { name: "时光邮局", exact: true })
      .waitFor();
    const partial = (await read()).letters.find(
      (l) => l.body === "只写了一半，还没想好名字。",
    );
    check(
      "Partial letter can be explicitly saved as draft",
      partial?.status === "draft",
    );
    await go("letters/" + partial.id + "/edit");
    await page.getByRole("button", { name: "删除草稿", exact: true }).click();
    await page.getByRole("button", { name: "确认删除", exact: true }).click();
    await page
      .getByRole("heading", { name: "时光邮局", exact: true })
      .waitFor();
    check(
      "Draft delete removes record",
      !(await read()).letters.some((l) => l.id === partial.id),
    );
    const blank = {
      ...backup,
      wishes: [],
      events: [],
      memories: [],
      albums: [],
      letters: [],
      tickets: [],
      round: null,
      draw: null,
    };
    await write(blank);
    await page.reload();
    for (const [path, text] of [
      ["memories", "第一束星光，从这里开始"],
      ["wishes", "下一颗心愿，会是什么？"],
      ["letters", "还没有新的来信"],
      ["play/tickets", "第一张票根，等我们一起获得"],
    ]) {
      await go(path);
      check(
        "Empty state " + path,
        await page
          .getByRole("heading", { name: text, exact: true })
          .isVisible(),
      );
    }
    await go("");
    check(
      "Empty home still gives useful destination",
      (await page
        .getByRole("link", { name: "打开星球里的回忆" })
        .getAttribute("href")) === "#/memories/new",
    );
    await page.evaluate(() =>
      localStorage.setItem("draft:v2:sentinel", "preserve-me"),
    );
    await go("us");
    await page
      .getByRole("button", { name: "重置这片小宇宙", exact: true })
      .click();
    await page.getByRole("button", { name: "先保留", exact: true }).click();
    check(
      "Reset cancellation preserves empty data",
      (await read()).memories.length === 0,
    );
    await page
      .getByRole("button", { name: "重置这片小宇宙", exact: true })
      .click();
    await page
      .getByRole("button", { name: "确认重置本版", exact: true })
      .click();
    await page.getByRole("heading", { name: /我们的\s*小宇宙/ }).waitFor();
    const reset = await read();
    check(
      "Reset restores complete seeded demo",
      reset.memories.length === 3 &&
        reset.wishes.length === 3 &&
        reset.role === 0 &&
        reset.people[0].name === "阿澄",
    );
    check(
      "Reset leaves unrelated old-version draft untouched",
      await page.evaluate(
        () => localStorage.getItem("draft:v2:sentinel") === "preserve-me",
      ),
    );
    check(
      "Reset removes this version drafts",
      await page.evaluate(
        () =>
          !Object.keys(localStorage).some((k) =>
            k.startsWith("draft:universe:"),
          ),
      ),
    );
    await page.reload();
    await page.getByRole("heading", { name: /我们的\s*小宇宙/ }).waitFor();
    check("Reset persists on reload", (await read()).memories.length === 3);
  } catch (e) {
    failures.push(String(e));
    await page
      .screenshot({
        path: "output/playwright/failure-edges.png",
        fullPage: true,
      })
      .catch(() => {});
  } finally {
    await page.goto("http://127.0.0.1:5177/#/");
    await write(backup);
    await page.evaluate(
      (stored) =>
        new Promise((resolve) => {
          const r = indexedDB.open("our-universe-v3");
          r.onsuccess = () => {
            const db = r.result,
              tx = db.transaction("images", "readwrite");
            tx.objectStore("images").clear();
            stored.images.forEach((i) =>
              tx
                .objectStore("images")
                .put(
                  new Blob([new Uint8Array(i.bytes)], { type: i.type }),
                  i.key,
                ),
            );
            tx.oncomplete = () => {
              db.close();
              localStorage.clear();
              Object.entries(stored.local).forEach(([k, v]) =>
                localStorage.setItem(k, v),
              );
              resolve();
            };
          };
        }),
      stored,
    );
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.reload();
  }
  return {
    passed: checks.filter((c) => c.pass).length,
    total: checks.length,
    checks,
    failures,
    runtime,
  };
}
