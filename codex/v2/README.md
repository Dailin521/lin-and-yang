# 两个人的空间 · 四套完整交互原型

```powershell
cd E:\GitHubProject\lin-and-yang\codex\v2
npm install
npm run dev
```

默认入口为 [http://127.0.0.1:5174/](http://127.0.0.1:5174/)，端口占用时以终端实际地址为准。

| 空间 | 入口 | 可以体验 |
|---|---|---|
| 同频 | [打开同频](http://127.0.0.1:5174/#/together) | 心情、便笺、月历、约定、愿望、头像资料 |
| 余温 | [打开余温](http://127.0.0.1:5174/#/afterglow) | 相册、上传回忆、时间档案、写信与切换角色阅读 |
| 小屋 | [打开小屋](http://127.0.0.1:5174/#/house) | 房间探索、布置、照料植物、冰箱留言、昼夜 |
| 心动游乐场 | [打开游乐场](http://127.0.0.1:5174/#/arcade) | 默契问答、交接屏、约会抽签、计划、票根 |

在每套顶部或“我们”页切换本机角色。四套数据互不共享；可以在各自设置中确认重置。全部人物、故事和影像是虚构示例，数据保存在当前浏览器，不联网发送消息。浏览器或端口不同，会使用不同的本机存储；清理网站数据会删除对应内容。

## 构建与验证

```powershell
npm run build
npm run preview
```

浏览器验证脚本位于 `tools/`，通过 Playwright CLI 运行，开发服务需要先启动：

```powershell
npx --yes --package @playwright/cli playwright-cli -s=couple-v2 open http://127.0.0.1:5174 --browser chrome
./tools/run-browser.ps1 -Script tools/verify-flows.js -Report output/playwright/flows.json
./tools/run-browser.ps1 -Script tools/verify-edges.js -Report output/playwright/edges.json
./tools/run-browser.ps1 -Script tools/verify-empty-failures.js -Report output/playwright/empty-failures.json
./tools/run-browser.ps1 -Script tools/capture.js -Report output/playwright/capture-report.json
./tools/run-browser.ps1 -Script tools/audit.js -Report output/playwright/accessibility.json
```

测试针对上述独立浏览器中的虚构示例执行，包含删除和重置操作。脚本按顺序执行，不要让多个测试同时控制同一页面。页面截图和实际验证结果写入 `output/playwright/`。生产包验证使用 `tools/verify-production.js`，需要先运行 `npm run preview`。

本次已通过类型检查与生产构建、80 项核心及补充流程检查、13 项生产包检查。18 个页面在手机和桌面共 36 次 axe 扫描没有发现所选 WCAG A/AA 规则违规；360、390、768、1440px 的 20 张主页面截图没有水平溢出或破图。详见 [实际验证记录](VERIFICATION.md)。

![四套选型入口](output/playwright/selector-1440.png)

## 实现与素材

React + TypeScript + Vite + React Router Hash 路由 + CSS Modules，IndexedDB 用于记录和图片，localStorage 用于编辑草稿。通过事务排队保存，等待初始化后才允许写入。

- [产品范围](PRODUCT.md)
- [四套设计系统](DESIGN.md)
- [生成素材与提示词](ASSETS.md)
- [功能验证结果](output/playwright/flows.json)
- [补充流程验证](output/playwright/edges.json)
- [空状态和保存失败](output/playwright/empty-failures.json)
- [响应式截图与资源检查](output/playwright/capture-report.json)
- [无障碍扫描](output/playwright/accessibility.json)
- [生产包验证](output/playwright/production.json)

原 `codex` 版本被保留，新实现仅在此 `v2` 目录中。
