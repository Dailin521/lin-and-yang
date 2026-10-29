# 实际验证记录

验证日期：2026-10-29。环境：Windows、Chrome / Chromium、Playwright CLI。开发服务 `127.0.0.1:5177`，生产预览 `127.0.0.1:4177`。

## 梦幻动效更新 · 2026-10-29

本次在与 Pages 路径一致的 `http://127.0.0.1:4180/lin-and-yang/codex/` 生产包上检查，脚本为仓库根目录 `scripts/verify-dream.js`。32 / 32 断言通过，无运行时错误。

- 360 / 390 / 768 / 1440px 无横向溢出，照片加载完整；查看最终桌面、手机、流星、点击反馈与导航星球截图。
- 实际 Canvas 绘制确认流星出现；前景星尘有可见像素，结束后完全清除，叠层不拦截鼠标和触控。
- 键盘激活星球能进入回忆并产生反馈；手机真实触屏事件模拟能点出星尘、切换导航和打开身份弹窗。滑动手势与表单输入不触发粒子。
- 暂停后星空像素保持不变、前景清空、星球循环停止，刷新仍保持暂停；恢复后重新变化。系统减少动态效果优先，保持静态光色。
- 滚动离开首页星球后其循环动画暂停；首页 Axe WCAG A / AA 扫描无违规。
- Chrome 桌面与 390px 触屏模拟的背景绘制均约 30 FPS，95% 帧间隔为 34ms；手机 Canvas 像素比限制在 1.5。这是本机模拟测量，不代表真机硬件测试。
- `npm run check`、`npm test`（6 项）、`npm run build` 通过。Impeccable 机械检测本次改动返回空结果。

本机证据位于仓库根目录 `output/playwright/dream-results.json`、`dream-final-360.png`、`dream-final-390.png`、`dream-final-768.png`、`dream-final-1440.png`、`dream-feedback-final.png` 与 `dream-reduced-motion.png`。只改 Codex 特效及总首页的 Codex 预览图，Claude 与业务数据模型保持原样。

## 结果

| 检查 | 实际结果 | 证据 |
| --- | --- | --- |
| TypeScript 与生产构建 | `npm run build` 成功，包含 `tsc -b` | 当前 `dist/` 与本次终端构建输出 |
| 核心业务流程 | 49 / 49 断言通过，无运行时错误 | `output/playwright/flow-results.json` |
| 边界、失败与重置 | 25 / 25 断言通过 | `output/playwright/edge-results.json` |
| 生产版 | 22 / 22 断言通过，无资源加载失败、无运行时错误 | `output/playwright/production-results.json` |
| 手机触屏模拟 | 5 / 5 断言通过 | `output/playwright/touch-results.json` |
| 布局覆盖 | 24 个路由，360 / 390 / 768 / 1440px，96 个页面视口组合 | `output/playwright/audit-results.json` |
| 最终首页与浏览器返回 | 四种屏宽均无横向溢出；详情 → 编辑 → 浏览器返回正常 | `output/playwright/interaction-audit.json` |
| 最终主要页面截图 | 390px 与 1440px 的 8 个主要页面无横向溢出 | `output/playwright/layout-final.json` |
| 自动无障碍检查 | 390 / 1440px 各 24 页，另加作答、交接、揭晓、身份弹窗四种状态；最终无检测违规 | `audit-results.json`、`interaction-audit.json` |

布局初查发现 768px 首页的旋转装饰轨道越界；调整该尺寸的轨道比例后，四种首页宽度重新检查均通过。初版问答进度条缺少合法 ARIA role，补充 progressbar 与当前值后，重新检查作答、交接、揭晓、身份弹窗均通过。初始报告保留，修复后的结果以 interaction-audit 与 layout-final 为准。

## 走通的流程

- 两种身份分别修改心情，修改共享便笺，保存署名。
- 新增、编辑心愿，离开再回来继续草稿，安排到共同日历；修改约定、刷新直接访问详情。
- 完成约会时上传照片、留下感想；一次保存同时完成心愿、更新约定、新建回忆和票根。重新开启约定会重新开启对应心愿，原来的回忆和票根保留。
- 修改回忆不改写票根快照；删除约定保留回忆与票根；删除心愿保留相关记录。
- 创建相簿、选择封面、上传新封面；多张照片上传、调整照片顺序、打开照片预览。调整相簿回忆顺序后，再编辑正文不会改变原顺序。
- 删除相簿后，回忆移到未分类；回忆删除后，旧详情链接展示恢复入口。照片弹窗支持 Escape，并恢复触发按钮焦点。
- 写信时保留未提交文字，保存不完整草稿、删除草稿、投递确认。切换收信身份后先看到未拆封状态，拆信、阅读、珍藏。投递后无法修改原文，改名也不改写已投递名字。
- 两人轮流答三题；交接页不包含答案控件与对比内容，刷新仍保持遮挡；第二人完成后才揭晓。票根保存题目、名字和答案快照，清除当前局后仍可重看或删除票根。
- 抽签遵循时间、预算上限和室内外偏好；有替代活动时重抽避开当前活动；抽签可进入同一个日历，已安排的活动显示原约定入口。
- 一整天 / 不花钱 / 室内的无匹配条件显示调整筛选入口，并正确聚焦筛选控件。
- 修改资料、刷新保持；重置先取消不会丢数据，确认后恢复全部示例，仅清理本版本草稿。
- 模拟 IndexedDB 写入失败：便笺弹窗内和回忆表单都有反馈，输入保留，恢复存储后可重试成功。
- 无效文件类型、损坏 PNG、超过 15 MB 的照片被拒绝，既有文字不丢失。
- 暂停星空后 Canvas 像素保持不变；动态偏好刷新后仍保留；系统减少动态效果优先。

## 触屏、键盘与视觉

使用 `hasTouch: true`、`isMobile: true` 的独立 Chromium 上下文，通过 tap 操作手机导航、新增心愿、保存和身份切换。将可用高度缩到 460px，模拟键盘占用空间，检查聚焦表单时导航隐藏、提交按钮能滚动到并正常点击。

修复了手机输入结束时导航过早重新出现、影响保存点击的问题：表单内任何控件仍有焦点时，底部导航保持隐藏。实际测试不需要强制点击。

人工查看了最终桌面首页、手机首页、日常、回忆、游戏大厅、实际问答题面、交接页和揭晓页截图。检查星空与文字层级、照片裁切、窄屏内容、动态粒子、读写流程和内页风格一致性。模态框使用原生 dialog，键盘焦点停留在模态内，Escape 返回触发位置。

参照 [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) 检查表单、焦点、导航、移动布局和减少动态。Impeccable 手动检测执行一次，结果在 `output/impeccable-detector.json`：保留用户指定梦幻风格的标题渐变；通知区的细侧线用于说明信息，与卡片装饰区分。两项是设计风格提示，不是功能或无障碍失败。

## 主要截图

- 首页最终桌面首屏：`output/playwright/home-desktop-final.png`
- 首页四种屏宽：`home-360.png`、`home-390.png`、`home-768.png`、`home-1440.png`
- 日常、回忆、心愿、书信、游戏大厅、抽签、资料：对应 `daily`、`memories`、`wishes`、`letters`、`games`、`draw`、`profile` 的 `-390.png` 与 `-1440.png`
- 约会转为回忆：`completed-memory-mobile.png`
- 相簿与上传封面：`album-mobile.png`
- 拆开的信：`letter-opened-mobile.png`
- 问答题面 / 交接 / 揭晓：`quiz-question-mobile.png`、`quiz-handoff-mobile.png`、`quiz-reveal-mobile.png`
- 抽签结果 / 无匹配：`date-draw-mobile.png`、`no-match-360.png`
- 保存失败 / 紧凑键盘空间：`save-failure-mobile.png`、`touch-form-compact-height.png`

## 范围说明

这是浏览器本机原型。已验证 Chrome 和 Chromium 模拟设备；没有宣称经过 iOS Safari、Android 真机键盘或跨设备同步测试。没有真实账号、联网通信和服务端。测试脚本在专用 QA 会话中备份并恢复原内容；触屏检查使用独立临时上下文。

只在 `codex/v3` 写入新实现；根目录 Claude 页面、`codex/v2` 和更早版本保持原样。
