# 我们的小宇宙 · 梦幻星空 Web

一个手机优先的情侣空间，把日常、心愿、回忆、书信和双人游戏放在同一片星空里。视觉依据根目录 Claude `style-3-starry` 的梦幻星空方向重新实现；本版没有小屋、布置或养植物功能。

## 体验入口

启动开发服务后打开 <http://127.0.0.1:5177/>。

| 位置 | 链接 |
| --- | --- |
| 我们的小宇宙 | <http://127.0.0.1:5177/#/> |
| 日常电台 | <http://127.0.0.1:5177/#/today> |
| 共同日历 | <http://127.0.0.1:5177/#/calendar> |
| 回忆星轨 | <http://127.0.0.1:5177/#/memories> |
| 心愿星球 | <http://127.0.0.1:5177/#/wishes> |
| 时光邮局 | <http://127.0.0.1:5177/#/letters> |
| 双人游乐场 | <http://127.0.0.1:5177/#/play> |
| 资料与重置 | <http://127.0.0.1:5177/#/us> |

页面默认已填充虚构人物「阿澄、小满」和示例故事。右上角头像可切换身份；旁边的暂停按钮可以停下动态效果。系统开启减少动态效果时，会自动使用静态星空。

星空包含呼吸光晕、前后层行星环、轨道光点与彩色长尾流星。点击空白星空或激活入口会散开星尘；手机滑动和表单输入不会触发。详细动效设计见 [DESIGN.md](DESIGN.md)。

## 启动

使用 Node.js 20.19+ 或 22.12+。

```powershell
cd E:\GitHubProject\lin-and-yang\codex\v3
npm install
npm run dev
```

```powershell
npm run build     # TypeScript 类型检查与生产构建
npm run preview   # http://127.0.0.1:4177/
```

Hash 路由可以直接打开详情、刷新、使用浏览器返回。独立构建默认部署于站点根目录；仓库根目录的 `npm run build` 自动使用 `/lin-and-yang/codex/`，同时处理素材、字体和返回版本首页的路径。完整发布命令与两个版本的正式入口见 [DEPLOYMENT.md](../../DEPLOYMENT.md)。

## 推荐走一遍

1. 在「日常」留下心情和一句便笺。
2. 在「心愿」写下一件想做的事，安排到共同日历。
3. 打开这份约定，选择「完成，留下回忆」，写感想、添照片。心愿点亮，回忆与票根一次保存。
4. 在「回忆」新建相簿，调整封面、回忆顺序和照片顺序；时间档案可以连续回看。
5. 写一封信、放进对方信箱，然后切换另一位角色拆信、珍藏。投递后的信保留原文与当时名字。
6. 在「一起玩」轮流回答三道问题，经过交接遮挡，再揭晓和收藏票根。也可以抽一个约会，排进同一个日历。

## 本机数据

- 使用独立 IndexedDB 数据库 `our-universe-v3`，记录与照片分开存储。各功能共享同一份身份、日历和回忆。
- 编辑文字与图片引用保留为 `draft:universe:*` 本机草稿。写入失败会保留输入并显示重试提示。
- 上传图片在浏览器内压缩至最长边 1920px 的 WebP；单张最大 15 MB。GIF 作为静态照片保存。
- 没有账号、远程投递或跨设备同步。清理网站数据会移除记录。不同浏览器、主机名和端口拥有独立存储；开发端口 5177 与预览端口 4177 的内容也不互通。
- 重置需确认，只恢复本版示例。删除相簿会把回忆移到未分类；删除日历约定或原回忆不会改写已经收藏的票根快照。
- 未迁移或修改 `codex/v2` 及更早版本，也未修改根目录 Claude 页面。

## 工程与验证

React、TypeScript、Vite、React Router Hash 路由、IndexedDB、Lucide 图标。样式、动效、数据处理均在本目录；照片和字体本地提供，没有运行时外部图片或字体请求。

`src/Starfield.tsx` 管理星点、流星、指针扰动和点击星尘；页面隐藏时暂停 Canvas。`src/data/model.ts` 定义统一模型；`src/shared/store.ts` 管理串行持久化与图片处理。主要页面在 `src/pages`。

实际检查与截图见 [VERIFICATION.md](VERIFICATION.md)、`output/playwright/`。浏览器验证使用 Playwright CLI，脚本在 `tools/`，在专用 QA 浏览器内运行，保存并恢复原数据。

```powershell
npx --yes --package @playwright/cli playwright-cli -s=universe-v3 open http://127.0.0.1:5177 --browser chrome
.\tools\run-browser.ps1 -Script tools/verify-flows.js -Report output/playwright/flow-results.json
.\tools\run-browser.ps1 -Script tools/verify-edges.js -Report output/playwright/edge-results.json
```

字体子集可使用安装了 `fonttools` 的 Python 运行 `python tools/subset-fonts.py` 更新。未包含在子集中的用户输入字符使用系统中文字体。
