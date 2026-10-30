# 实际验证记录

验证日期：2026-10-29，Windows / Chrome。只使用虚构示例与独立的 Playwright `couple-v2` 浏览器会话。

## 构建与设备

| 项目 | 实际结果 | 证据 |
|---|---|---|
| TypeScript 严格检查、Vite 生产构建 | 通过，按空间拆分加载 | [构建日志](output/build.log) |
| 核心流程 | 41/41，通过 | [记录](output/playwright/flows.json) |
| 补充交互与键盘 | 29/29，通过 | [记录](output/playwright/edges.json) |
| 四套空状态及保存失败反馈 | 10/10，通过；通过有效空数据和存储写入异常注入检查 | [记录](output/playwright/empty-failures.json) |
| 生产包直接访问、刷新、返回 | 13/13，通过；无运行时异常、失败资源或外部资源请求 | [记录](output/playwright/production.json) |
| 响应式主页面 | 选型页及四套首页 × 360/390/768/1440px，共 20 次；无横向溢出、破图或运行时异常 | [记录](output/playwright/capture-report.json) |
| axe WCAG 2 A/AA、2.1 AA 所选规则 | 18 个页面 × 390/1440px，共 36 次；报告违规 0，横向溢出 0 | [记录](output/playwright/accessibility.json) |
| 游戏过程的额外 axe 检查 | 手机作答、交接、揭晓 3 个状态；报告违规 0 | [记录](output/playwright/game-states.json) |

## 实际走过的流程

- **同频**：两位角色的心情、编辑便笺、愿望创建和修改、安排到日历、完成与重新开启的联动、旧草稿不会覆盖完成状态、日历编辑与删除、上传头像、修改昵称与纪念日期。注入存储写入异常后，输入保留，恢复写入后可重试。
- **余温**：创建相册、选择与上传封面、上传两张照片、调整照片和回忆顺序、编辑回忆、删除回忆、删除相册后保留未分类回忆。写草稿、刷新继续、投递、切换收件人、阅读及归档；已投递信件没有编辑入口。
- **小屋**：留言新增、编辑、移动预设位置、取下；两位角色分别浇水，每人当天只能记录一次；装饰预览、刷新继续预览、应用、恢复默认；昼夜保存与刷新。打开物件后返回原观察区域。
- **游乐场**：两人各回答三题，交接页不显示答案；第二位完成后才揭晓；中途切换身份会遮住选择。保存结果快照，深链接刷新重看；无匹配筛选的恢复入口、抽签保存计划、填写安排、完成感想和票根、删除票根后保留完成记录。
- **共同检查**：四套独立重置、草稿清理、刷新和直接进入详情、Esc 关闭对话框与恢复触发按钮焦点、360 × 400px 可视区域下滚动到保存按钮、手机输入字号至少 16px、减少动态效果偏好。

四套视觉分别使用日常时间流、跨页影像、场景物件和双人游戏。已人工查看主要手机与桌面截图，确认内页延续各自的布局与素材语言。

## 截图

| 空间 | 手机 | 桌面 | 关键操作 |
|---|---|---|---|
| 同频 | [390px](output/playwright/together-390.png) | [1440px](output/playwright/together-1440.png) | [日历详情](output/playwright/together-calendar-flow.png) |
| 余温 | [390px](output/playwright/afterglow-390.png) | [1440px](output/playwright/afterglow-1440.png) | [上传后的回忆](output/playwright/afterglow-memory-flow.png)、[书信流程](output/playwright/afterglow-letter-flow.png) |
| 小屋 | [390px](output/playwright/house-390.png) | [1440px](output/playwright/house-1440.png) | [冰箱留言](output/playwright/house-notes-flow.png)、[夜晚灯光](output/playwright/house-night.png) |
| 游乐场 | [390px](output/playwright/arcade-390.png) | [1440px](output/playwright/arcade-1440.png) | [专注作答](output/playwright/arcade-question-focused.png)、[交接](output/playwright/arcade-handoff.png)、[结果](output/playwright/arcade-result.png) |

360px 与 768px 对应截图也位于同一目录。关键流程截图中的 `QA` 文案是测试输入，不会写入交付时的预填示例。

## 检查范围与设计复核

浏览器验证为 Chrome 模拟视口；短可视区域用于检查键盘弹出后的布局可达性，没有宣称在真实 iOS Safari 或 Android 软键盘上完成实机测试。axe 结果是所选规则的自动检查，不替代屏幕阅读器实测。

执行了一次 Impeccable 静态审美检测，见 [原始报告](output/impeccable-detect.json)。两处内容块单边粗线已收细；游戏机柜的内凹阴影、几何花瓶和 Space Grotesk 数字保留，分别服务游乐设备造型、场景装饰及数字排版。四套主要中文字体为本地 Noto Sans SC、Noto Serif SC、霞鹜文楷。
