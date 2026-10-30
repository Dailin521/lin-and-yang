# Lin & Yang · 三版本入口

正式站点：[https://dailin521.github.io/lin-and-yang/](https://dailin521.github.io/lin-and-yang/)

| 版本 | 正式入口 | 源码 |
| --- | --- | --- |
| 总首页 | `/lin-and-yang/` | `site/` |
| Codex 初版：四套独立空间 | `/lin-and-yang/codex-classic/` | `codex/v2/` |
| Codex：我们的小宇宙 | `/lin-and-yang/codex/` | `codex/v3/` |
| Claude：梦幻星空方案三 | `/lin-and-yang/claude/` | `style-3-starry/` |

Codex 是整合日常、日历、心愿、回忆、书信与双人游戏的星空 Web，不包含小屋。Claude 发布当前方案三的全部 9 个页面：主页、星球宇宙、心愿、互动、回忆星球、游戏星球、时光邮局、音乐星球与秘密基地。

## 本地运行与验证

在仓库根目录使用 Node.js 24 LTS 和 npm：

```powershell
npm ci
npm run check
npm test
npm run build
npm run preview
```

打开 [http://127.0.0.1:4180/lin-and-yang/](http://127.0.0.1:4180/lin-and-yang/)。预览使用与正式站点一致的子目录路径；`PORT` 环境变量可调整端口。只开发 Codex 时运行 `npm run dev --workspace codex/v3`，地址是 `http://127.0.0.1:5177/`。

## 自动部署

GitHub Pages 使用 **GitHub Actions** 发布。推送 `main` 后，`.github/workflows/deploy-pages.yml` 依次执行依赖安装、检查、测试、构建及 Pages 部署，也支持手动触发。部署仓库为 `Dailin521/lin-and-yang`。

`scripts/build.mjs` 生成仓库根目录的 `dist/`：复制总首页、构建 Codex 至 `dist/codex/`，复制 Claude 至 `dist/claude/`。`BASE_PATH` 默认 `/lin-and-yang/`；Vite、演示图片和字体均使用这个发布前缀。`site-manifest.json` 记录发布版本 SHA、时间与页面清单，便于核对线上版本。

构建只清理生成目录 `dist/`。2026-10-30 起，Codex v2 以「Codex 初版」加入公开站点，保留同频、余温、小屋和心动游乐场；素材支持发布子目录，选择页可返回总首页。现有根首页与其他更早版本留在本机原位置。

## 发布适配与数据

- 两套版本都提供返回总首页的入口，Codex 详情采用 Hash 路由，可直接打开和刷新。
- Claude 原源码保持原样；生成发布副本时补充缺少的邮局、音乐、秘密基地入口及返回首页链接。发布专用样式修复 360px 窄屏横向溢出，并替换一张已失效的音乐封面地址。
- Codex 的示例照片、字体随站点提供。Claude 保留原有 Unsplash 图片服务，浏览时需要网络。
- Codex 内容存储在浏览器 IndexedDB；没有真实账号、跨设备同步或联网投递。正式域名与 localhost 的存储相互独立，部署不会上传本机编辑内容。Claude 保留原有演示交互。

## 实际验证

2026-10-29，Windows + Chrome / Playwright CLI：

- `npm run check`：TypeScript、Claude JavaScript 语法和本地链接检查通过。
- `npm test`：6 项通过，覆盖发布前缀、旧版本保护、演示图片路径、Claude 星球链接和双入口。
- `npm run build`：成功，生成两套完整发布产物；干净目录执行 `npm ci` 成功。
- 发布浏览器验证：42 / 42 断言通过；总首页 360 / 390 / 768 / 1440px 无横向溢出，两个版本跳转和返回、Codex 详情刷新均正常。Claude 9 页在 360px 均无横向溢出或图片加载失败。未捕获运行时错误或 HTTP 失败响应。
- 总首页 360 / 1440px 的 Axe 检查未发现 WCAG A / AA 违规；键盘跳转版本选择、焦点与减少动态效果检查通过。
- Codex 全功能验证见 [codex/v3/VERIFICATION.md](codex/v3/VERIFICATION.md)。本次发布验证只覆盖部署路径和发布适配，没有声称重做 Claude 全部业务功能。

浏览器脚本位于 `scripts/verify-release.js`、`scripts/verify-landing.js`、`scripts/inspect-claude-mobile.js`；本机报告与截图保存在 `output/playwright/`，不随网站发布。可用以下命令复现发布浏览器检查：

```powershell
npx --yes --package @playwright/cli playwright-cli -s=release-pages open http://127.0.0.1:4180/lin-and-yang/ --browser chrome
npx --yes --package @playwright/cli playwright-cli -s=release-pages run-code --filename scripts/verify-release.js --raw
```

截图包括 `landing-360.png`、`landing-390.png`、`landing-768.png`、`landing-desktop-final.png`、`published-codex-360.png`、`claude-preview-fresh.png` 和四张 Claude 星球窄屏截图。
