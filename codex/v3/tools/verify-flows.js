async (page) => {
  page.setDefaultTimeout(9000);
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
    await page.locator("main h1, main h2").first().waitFor();
    await page.waitForTimeout(400);
  };
  const read = () =>
    page.evaluate(
      () =>
        new Promise((resolve, reject) => {
          const r = indexedDB.open("our-universe-v3", 1);
          r.onsuccess = () => {
            const db = r.result;
            const q = db
              .transaction("documents")
              .objectStore("documents")
              .get("universe");
            q.onsuccess = () => {
              resolve(q.result.data);
              db.close();
            };
            q.onerror = () => reject(q.error);
          };
        }),
    );
  const settle = async (predicate) => {
    for (let n = 0; n < 60; n++) {
      const d = await read();
      if (predicate(d)) return d;
      await page.waitForTimeout(50);
    }
    throw Error("State did not settle");
  };
  const role = async (name) => {
    await page.getByRole("button", { name: "切换身份或查看资料" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name, exact: true })
      .click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
  };
  const capture = async (name) => {
    await page.waitForTimeout(450);
    await page.screenshot({
      path: "output/playwright/" + name + ".png",
      fullPage: true,
    });
  };
  await go("");
  const backup = await read();
  const images = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const r = indexedDB.open("our-universe-v3", 1);
        r.onsuccess = () => {
          const db = r.result;
          const q = db.transaction("images").objectStore("images").getAllKeys();
          q.onsuccess = () => {
            resolve(q.result);
            db.close();
          };
        };
      }),
  );
  const drafts = await page.evaluate(() =>
    Object.fromEntries(
      Object.keys(localStorage)
        .filter((k) => k.startsWith("draft:universe:"))
        .map((k) => [k, localStorage.getItem(k)]),
    ),
  );
  async function suite(name, fn) {
    try {
      await page.setViewportSize({ width: 390, height: 844 });
      await fn();
    } catch (e) {
      failures.push({ suite: name, error: String(e) });
      await capture("failure-" + name).catch(() => {});
    }
  }
  try {
    await suite("daily-to-memory", async () => {
      await go("today");
      await page.getByRole("button", { name: "换一个心情" }).click();
      await page.getByRole("button", { name: "好开心", exact: true }).click();
      let d = await settle((d) =>
        Object.values(d.moods).some((m) => m["0"] === "好开心"),
      );
      check("Current role mood saved", !!d);
      await page.getByRole("button", { name: "修改便笺" }).click();
      await page
        .getByRole("textbox", { name: "想分享的事" })
        .fill("今晚一起看星星 QA");
      await page.getByRole("button", { name: "留下这句话" }).click();
      d = await settle((d) =>
        Object.values(d.notes).some((n) => n.body === "今晚一起看星星 QA"),
      );
      check(
        "Shared note signed by current role",
        Object.values(d.notes).some(
          (n) => n.body === "今晚一起看星星 QA" && n.author === 0,
        ),
      );
      await role("小满");
      await page.getByRole("button", { name: "换一个心情" }).click();
      await page.getByRole("button", { name: "平静", exact: true }).click();
      d = await settle((d) =>
        Object.values(d.moods).some((m) => m["1"] === "平静"),
      );
      check(
        "Two roles have independent moods",
        Object.values(d.moods).some(
          (m) => m["0"] === "好开心" && m["1"] === "平静",
        ),
      );
      await role("阿澄");
      await go("wishes/new");
      await page.getByLabel("想一起做的事").fill("一起看流星 QA");
      await page.getByLabel("再说一点").fill("带着热茶，走到海边。");
      await page.getByRole("button", { name: "保存心愿", exact: true }).click();
      d = await settle((d) =>
        d.wishes.some((w) => w.title === "一起看流星 QA"),
      );
      const wish = d.wishes.find((w) => w.title === "一起看流星 QA");
      check("Wish created", !!wish);
      await go("wishes/" + wish.id);
      await page.getByLabel("再说一点").fill("修改后留存的愿望草稿 QA");
      await go("wishes");
      await go("wishes/" + wish.id);
      check(
        "Wish draft retained across navigation",
        (await page.getByLabel("再说一点").inputValue()) ===
          "修改后留存的愿望草稿 QA",
      );
      await page.getByRole("button", { name: "保存心愿", exact: true }).click();
      await settle((d) =>
        d.wishes.find((w) => w.id === wish.id).note.includes("修改后"),
      );
      await go("events/new?wish=" + wish.id);
      check(
        "Calendar receives wish title",
        (await page.getByLabel("约定的名字").inputValue()) === wish.title,
      );
      await page.getByLabel("日期", { exact: true }).fill("2026-11-18");
      await page.getByRole("button", { name: "保存约定", exact: true }).click();
      d = await settle((d) => d.events.some((e) => e.wishId === wish.id));
      const event = d.events.find((e) => e.wishId === wish.id);
      check("Wish linked to date", event.date === "2026-11-18");
      await go("events/" + event.id);
      await page.reload();
      await page.getByLabel("约定的名字").waitFor();
      check(
        "Event deep-link refresh",
        (await page.getByLabel("约定的名字").inputValue()) === wish.title,
      );
      await page.getByLabel("一些小备注").fill("刷新后继续修改 QA");
      await page.getByRole("button", { name: "保存约定", exact: true }).click();
      await settle((d) =>
        d.events.find((e) => e.id === event.id).note.includes("刷新后"),
      );
      await go("events/" + event.id + "/complete");
      await page
        .getByLabel("想留下的那一刻")
        .fill("我们真的看到了，一道流星。QA");
      await page
        .getByLabel("上传照片")
        .setInputFiles("public/assets/coast.png");
      await page.getByRole("button", { name: "移除照片 1" }).waitFor();
      await page.getByRole("button", { name: "把它收进我们的星空" }).click();
      d = await settle((d) => d.events.find((e) => e.id === event.id).done);
      const memory = d.memories.find((m) => m.eventId === event.id);
      const ticket = d.tickets.find((t) => t.eventId === event.id);
      check(
        "Completion atomically completes wish and event",
        d.wishes.find((w) => w.id === wish.id).done &&
          d.events.find((e) => e.id === event.id).done,
      );
      check(
        "Completion creates memory and ticket",
        memory && ticket && ticket.memoryId === memory.id,
      );
      check(
        "Uploaded photo stored as local image",
        memory.photos[0].startsWith("image:") &&
          ticket.photos[0] === memory.photos[0],
      );
      await page
        .getByRole("heading", { name: wish.title, exact: true })
        .waitFor();
      await capture("completed-memory-mobile");
      await go("memories/" + memory.id + "/edit");
      await page.getByLabel("还记得……").fill("后来补上的记忆 QA");
      await page.getByRole("button", { name: "把这一刻收好" }).click();
      d = await settle(
        (d) =>
          d.memories.find((m) => m.id === memory.id).body ===
          "后来补上的记忆 QA",
      );
      check(
        "Ticket preserves completed-day snapshot",
        d.tickets.find((t) => t.id === ticket.id).reflection ===
          "我们真的看到了，一道流星。QA",
      );
      await go("events/" + event.id);
      await page.getByRole("button", { name: "重新开启", exact: true }).click();
      d = await settle((d) => !d.events.find((e) => e.id === event.id).done);
      check(
        "Reopening event reopens its wish without erasing history",
        !d.wishes.find((w) => w.id === wish.id).done &&
          d.memories.some((m) => m.id === memory.id) &&
          d.tickets.some((t) => t.id === ticket.id),
      );
      await page.getByRole("button", { name: "删除这份约定" }).click();
      await page.getByRole("button", { name: "先保留", exact: true }).click();
      check(
        "Delete cancel keeps event",
        !!(await read()).events.find((e) => e.id === event.id),
      );
      await page.getByRole("button", { name: "删除这份约定" }).click();
      await page.getByRole("button", { name: "确认删除", exact: true }).click();
      d = await settle((d) => !d.events.some((e) => e.id === event.id));
      check(
        "Event deletion preserves memory and ticket",
        d.memories.some((m) => m.id === memory.id) &&
          d.tickets.some((t) => t.id === ticket.id),
      );
      await go("wishes/" + wish.id);
      await page.getByRole("button", { name: "删除这颗心愿" }).click();
      await page.getByRole("button", { name: "确认删除", exact: true }).click();
      await settle((d) => !d.wishes.some((w) => w.id === wish.id));
      check("Wish deletion works", true);
    });
    await suite("albums-and-photos", async () => {
      await go("memories/albums");
      await page.getByRole("button", { name: "新相簿" }).click();
      await page.getByLabel("相簿名字").fill("星空测试相簿 QA");
      await page.getByLabel("写在扉页").fill("为一段旅程准备的相簿。");
      await page
        .getByRole("button", { name: "选择封面 2", exact: true })
        .click();
      await page.getByRole("button", { name: "保存相簿", exact: true }).click();
      let d = await settle((d) =>
        d.albums.some((a) => a.title === "星空测试相簿 QA"),
      );
      const album = d.albums.find((a) => a.title === "星空测试相簿 QA");
      check("Album cover chosen", album.cover === "/assets/train.png");
      await go("memories/new?album=" + album.id);
      await page.getByLabel("给这一刻起个名字").fill("第一束光 QA");
      await page
        .getByLabel("上传照片")
        .setInputFiles(["public/assets/train.png", "public/assets/coast.png"]);
      await page.getByRole("button", { name: "移除照片 2" }).waitFor();
      await page.getByRole("button", { name: "照片 2 前移" }).click();
      await page.getByLabel("还记得……").fill("原来那些星星，一直都在。");
      await page.getByRole("button", { name: "把这一刻收好" }).click();
      d = await settle((d) =>
        d.memories.some((m) => m.title === "第一束光 QA"),
      );
      const memory = d.memories.find((m) => m.title === "第一束光 QA");
      check(
        "Multiple uploads and album association",
        memory.photos.length === 2 && memory.albumId === album.id,
      );
      check(
        "Album order includes new memory",
        d.albums.find((a) => a.id === album.id).memoryIds.includes(memory.id),
      );
      await page.getByRole("button", { name: "放大首张照片" }).click();
      check("Photo lightbox opens", await page.getByRole("dialog").isVisible());
      await page.keyboard.press("Escape");
      check(
        "Lightbox Escape restores focus",
        await page
          .getByRole("button", { name: "放大首张照片" })
          .evaluate((e) => e === document.activeElement),
      );
      await go("memories/new?album=" + album.id);
      await page.getByLabel("给这一刻起个名字").fill("第二束光 QA");
      await page.getByRole("button", { name: "把这一刻收好" }).click();
      d = await settle((d) =>
        d.memories.some((m) => m.title === "第二束光 QA"),
      );
      const memory2 = d.memories.find((m) => m.title === "第二束光 QA");
      await go("albums/" + album.id);
      await page
        .getByRole("button", { name: "第二束光 QA 前移", exact: true })
        .click();
      d = await settle(
        (d) =>
          d.albums.find((a) => a.id === album.id).memoryIds[0] === memory2.id,
      );
      check("Album memories reorder", true);
      await go("memories/" + memory2.id + "/edit");
      await page.getByLabel("还记得……").fill("只改文字，顺序不变 QA");
      await page.getByRole("button", { name: "把这一刻收好" }).click();
      d = await settle((d) =>
        d.memories.find((m) => m.id === memory2.id).body.includes("顺序不变"),
      );
      check(
        "Editing memory preserves album order",
        d.albums.find((a) => a.id === album.id).memoryIds[0] === memory2.id,
      );
      await go("albums/" + album.id);
      await page.getByRole("button", { name: "整理相簿" }).click();
      await page
        .getByLabel("上传照片")
        .setInputFiles("public/assets/morning.png");
      await page.getByRole("button", { name: "移除照片 1" }).waitFor();
      await page.getByRole("button", { name: "保存相簿", exact: true }).click();
      d = await settle((d) =>
        d.albums.find((a) => a.id === album.id).cover.startsWith("image:"),
      );
      check("Uploaded album cover saved", true);
      await page.reload();
      await page.getByRole("heading", { name: album.title }).waitFor();
      await capture("album-mobile");
      await page.getByRole("button", { name: "删除相簿", exact: true }).click();
      await page.getByRole("button", { name: "确认删除", exact: true }).click();
      d = await settle((d) => !d.albums.some((a) => a.id === album.id));
      check(
        "Deleting album retains memories unclassified",
        d.memories.find((m) => m.id === memory.id).albumId === null &&
          d.memories.find((m) => m.id === memory2.id).albumId === null,
      );
      await go("memories/" + memory.id);
      await page.getByRole("button", { name: "删除这段回忆" }).click();
      await page.getByRole("button", { name: "确认删除", exact: true }).click();
      await settle((d) => !d.memories.some((m) => m.id === memory.id));
      check("Delete memory works", true);
      await go("memories/" + memory.id);
      check(
        "Deleted direct link shows useful empty state",
        await page
          .getByRole("heading", { name: "这颗星星暂时找不到了。" })
          .isVisible(),
      );
    });
    await suite("letters-and-failure", async () => {
      await go("letters/new");
      await page.getByLabel("这一封信，想叫作").fill("给另一颗星星 QA");
      await page.getByLabel("想说的话").fill("这是一封慢慢写给你的信 QA");
      await go("letters");
      await go("letters/new");
      check(
        "Unsent text draft survives navigation",
        (await page.getByLabel("想说的话").inputValue()) ===
          "这是一封慢慢写给你的信 QA",
      );
      await page.getByRole("button", { name: "存为草稿", exact: true }).click();
      let d = await settle((d) =>
        d.letters.some((l) => l.title === "给另一颗星星 QA"),
      );
      const letter = d.letters.find((l) => l.title === "给另一颗星星 QA");
      check(
        "Letter draft is sender-only",
        letter.status === "draft" && letter.from === 0,
      );
      await go("letters/" + letter.id + "/edit");
      await page.getByRole("button", { name: "放进对方信箱" }).click();
      await page
        .getByRole("button", { name: "寄出这封信", exact: true })
        .click();
      d = await settle(
        (d) => d.letters.find((l) => l.id === letter.id).status === "sent",
      );
      check(
        "Sending snapshots names and original text",
        d.letters.find((l) => l.id === letter.id).names.join(",") ===
          "阿澄,小满",
      );
      await role("小满");
      await go("letters/" + letter.id);
      check(
        "Recipient sees unopened envelope",
        (await page.getByRole("button", { name: "拆开这封信" }).isVisible()) &&
          !(await page
            .getByText("这是一封慢慢写给你的信 QA", { exact: true })
            .isVisible()),
      );
      await page.getByRole("button", { name: "拆开这封信" }).click();
      d = await settle((d) => d.letters.find((l) => l.id === letter.id).read);
      check(
        "Opening marks read and reveals full letter",
        await page
          .getByText("这是一封慢慢写给你的信 QA", { exact: true })
          .isVisible(),
      );
      await capture("letter-opened-mobile");
      await page.getByRole("button", { name: "珍藏这封信" }).click();
      await settle(
        (d) => d.letters.find((l) => l.id === letter.id).status === "archived",
      );
      check("Archive letter works", true);
      await go("letters/" + letter.id + "/edit");
      check(
        "Sent letters cannot be edited",
        await page
          .getByText(
            "只有写信的人可以继续修改自己的草稿。已投递的信件会保留原文。",
          )
          .isVisible(),
      );
      await role("阿澄");
      await go("today");
      await page.getByRole("button", { name: "修改便笺" }).click();
      await page.getByLabel("想分享的事").fill("保存失败仍保留 QA");
      await page.evaluate(() => {
        window.__put = IDBObjectStore.prototype.put;
        IDBObjectStore.prototype.put = function (...args) {
          if (this.name === "documents")
            throw new DOMException("QA", "QuotaExceededError");
          return window.__put.apply(this, args);
        };
      });
      await page.getByRole("button", { name: "留下这句话" }).click();
      await page.getByRole("dialog").getByRole("alert").waitFor();
      check(
        "Storage failure shows in dialog and retains input",
        (await page.getByLabel("想分享的事").inputValue()) ===
          "保存失败仍保留 QA",
      );
      await capture("save-failure-mobile");
      await page.evaluate(() => {
        IDBObjectStore.prototype.put = window.__put;
      });
      await page.getByRole("button", { name: "留下这句话" }).click();
      await settle((d) =>
        Object.values(d.notes).some((n) => n.body === "保存失败仍保留 QA"),
      );
      check("Retry succeeds after storage recovers", true);
    });
    await suite("quiz-draw-tickets", async () => {
      await go("play");
      await role("阿澄");
      await go("play/quiz");
      await page
        .getByRole("button", { name: "开始这一局", exact: true })
        .click();
      let d = await settle((d) => !!d.round);
      const roundId = d.round.id;
      const selected = [];
      for (let i = 0; i < 3; i++) {
        d = await read();
        const q = d.round.questions[i];
        selected.push(q.options[0]);
        await page
          .getByRole("button", {
            name: new RegExp(
              q.options[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            ),
          })
          .click();
        await settle((d) => d.round.first[q.id] === q.options[0]);
        await page
          .getByRole("button", {
            name: i < 2 ? "下一题" : "收好答案，交给对方",
            exact: false,
          })
          .click();
        await settle((d) =>
          i < 2 ? d.round.step === i + 1 : d.round.stage === "handoff",
        );
      }
      check(
        "Handoff hides all answer controls",
        (await page.locator(".answerOption").count()) === 0 &&
          (await page.locator(".answerCompare").count()) === 0,
      );
      await capture("quiz-handoff-mobile");
      await page.reload();
      await page.getByRole("heading", { name: /现在，把屏幕交给/ }).waitFor();
      check(
        "Handoff remains concealed after reload",
        (await page.locator(".answerOption").count()) === 0,
      );
      await page.getByRole("button", { name: "我是 小满，准备好了" }).click();
      await settle((d) => d.round.stage === "second" && d.role === 1);
      for (let i = 0; i < 3; i++) {
        d = await read();
        const q = d.round.questions[i];
        await page
          .getByRole("button", {
            name: new RegExp(
              q.options[i === 2 ? 1 : 0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            ),
          })
          .click();
        await settle((d) => !!d.round.second[q.id]);
        await page
          .getByRole("button", {
            name: i < 2 ? "下一题" : "一起揭晓",
            exact: false,
          })
          .click();
        await settle((d) =>
          i < 2 ? d.round.step === i + 1 : d.round.stage === "reveal",
        );
      }
      d = await read();
      check(
        "Both sets of answers retained, two matches",
        d.round.questions.filter(
          (q) => d.round.first[q.id] === d.round.second[q.id],
        ).length === 2,
      );
      await page.getByRole("button", { name: "收藏这次默契" }).click();
      d = await settle((d) => d.tickets.some((t) => t.sourceId === roundId));
      const ticket = d.tickets.find((t) => t.sourceId === roundId);
      check(
        "Quiz ticket stores full question-answer snapshot",
        ticket.quiz.questions.length === 3 &&
          Object.keys(ticket.quiz.second).length === 3,
      );
      await capture("quiz-reveal-mobile");
      await page.getByRole("button", { name: "再玩一局" }).click();
      await settle((d) => d.round === null);
      await go("play/tickets/" + ticket.id);
      check(
        "Old result independently viewable",
        (await page.locator(".answerCompare").count()) === 3,
      );
      await page.getByRole("button", { name: "删除这张票根" }).click();
      await page.getByRole("button", { name: "确认删除", exact: true }).click();
      await settle((d) => !d.tickets.some((t) => t.id === ticket.id));
      check("Quiz ticket deletion", true);
      await go("play/draw");
      await page.getByLabel("有多少时间").selectOption("halfday");
      await page.getByLabel("两个人的预算").selectOption("under100");
      await page.getByLabel("想待在哪里").selectOption("outdoors");
      await page.getByRole("button", { name: "交给星星吧" }).click();
      d = await settle((d) => d.draw?.idea.location === "outdoors");
      const first = d.draw.idea.id;
      check(
        "Draw respects duration, budget, location",
        d.draw.idea.time === "halfday" &&
          ["free", "under100"].includes(d.draw.idea.budget),
      );
      await page.getByRole("button", { name: "换一个约会灵感" }).click();
      d = await settle((d) => d.draw.idea.id !== first);
      check("Reroll avoids same idea when alternatives exist", true);
      const draw = d.draw;
      await capture("date-draw-mobile");
      await page.getByRole("link", { name: "选一天，真的去做" }).click();
      await page.getByLabel("约定的名字").waitFor();
      check(
        "Draw flows into shared calendar",
        (await page.getByLabel("约定的名字").inputValue()) === draw.idea.title,
      );
      await page.getByRole("button", { name: "保存约定", exact: true }).click();
      d = await settle((d) => d.events.some((e) => e.drawId === draw.id));
      check(
        "Draw saved as linked plan",
        d.events.find((e) => e.drawId === draw.id).idea.id === draw.idea.id,
      );
      await go("play/draw");
      check(
        "Already scheduled draw opens existing plan",
        await page
          .getByRole("link", { name: "看看已经安排的约定" })
          .isVisible(),
      );
      await go("us");
      const names = page.getByLabel("昵称", { exact: true });
      await names.nth(0).fill("星星甲");
      await page.getByRole("button", { name: "保存我们的资料" }).click();
      d = await settle((d) => d.people[0].name === "星星甲");
      check(
        "Profile change propagates without rewriting delivered letter",
        d.letters.find((l) => l.title === "给另一颗星星 QA").names[0] ===
          "阿澄",
      );
      await page.reload();
      await page.getByLabel("昵称", { exact: true }).first().waitFor();
      check(
        "Profile survives refresh",
        (await page
          .getByLabel("昵称", { exact: true })
          .first()
          .inputValue()) === "星星甲",
      );
    });
  } finally {
    await page.goto("http://127.0.0.1:5177/#/");
    await page.evaluate(
      ({ backup, images, drafts }) =>
        new Promise((resolve) => {
          const r = indexedDB.open("our-universe-v3", 1);
          r.onsuccess = () => {
            const db = r.result;
            const tx = db.transaction(["documents", "images"], "readwrite");
            tx.objectStore("documents").put(
              { version: 1, data: backup },
              "universe",
            );
            const keys = tx.objectStore("images").getAllKeys();
            keys.onsuccess = () =>
              keys.result
                .filter((k) => !images.includes(k))
                .forEach((k) => tx.objectStore("images").delete(k));
            tx.oncomplete = () => {
              db.close();
              Object.keys(localStorage)
                .filter((k) => k.startsWith("draft:universe:"))
                .forEach((k) => localStorage.removeItem(k));
              Object.entries(drafts).forEach(([k, v]) =>
                localStorage.setItem(k, v),
              );
              resolve();
            };
          };
        }),
      { backup, images, drafts },
    );
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
