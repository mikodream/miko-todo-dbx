# MIKO.TODO 待办 —— 实现契约

插件 id `miko.todo.tasks`，版本 `0.1.0`。本文件是数据层（`ui/store.js`）与界面层（`ui/app.js`）之间、
以及本插件与 DBX 宿主之间的约定。任何一方要偏离，先改本文件再改代码。

## 0. 平台事实（不要推翻）

- UI 跑在 `sandbox="allow-scripts"` 的 iframe：**没有** `localStorage`、`navigator.clipboard`、`alert/confirm/prompt`、父页面 DOM、Node.js。
- 跨边界只有 `window.dbxPlugin`：`ready` / `capabilities` / `storage` / `locale` / `theme` / `copy` / `setTitle` / `onContext` / `onEvent`。
- 权限只声明两个：`host.storage`（KV）、`host.workbench`（改标签标题）。调任何新 API 前先读 `capabilities.*`，缺失就关掉入口，不靠试调用。
- 不做构建步骤：`ui/index.html` + `ui/style.css` + `ui/store.js` + `ui/app.js` 就是产物，无 npm、无打包、无 CDN、无外部字体。
- 颜色只用 `--color-*` / `--radius-*` / `--font-*` token（配 `--td-*` 兜底），动态尺寸只用 CSSOM，不写 `style` 属性、不注 `innerHTML`。
- 时间只用本地日期字符串 `YYYY-MM-DD`（外加可选的 `HH:mm`），**不落时间戳、不碰时区**，避免跨时区抖动。

## 1. 任务模型

```js
{
  id: "t…",                  // 本地唯一，前缀 t；子任务 s；里程碑 m；分组 g
  groupId: "g…",
  title: "", notes: "",
  priority: "none" | "low" | "medium" | "high" | "urgent",
  startDate: "YYYY-MM-DD" | null,
  startTime: "HH:mm",        // 仅 allDay=false 时有意义
  dueDate: "YYYY-MM-DD" | null,
  dueTime: "HH:mm",
  allDay: true,
  done: false, completedAt: ISO | null, progress: 0..100,
  subtasks: [{
    id, title, done,
    priority: "none" | "low" | "medium" | "high" | "urgent",
    progress: 0..100,             // 100 即 done
    startDate: "YYYY-MM-DD" | null,
    startTime: "HH:mm" | null,
    doneAt: ISO | null,           // 勾选完成时自动写，可手改
    minutes: number | null,       // 手填用时；null 表示按起止自动算
    createdAt: ISO
  }],
  milestones:[ { id, title, date: "YYYY-MM-DD" | null, done } ],
  repeat: null | { freq, unit, interval, weekdays, until, count, doneCount },
  seriesId: null | "t…",      // 同一重复系列共享，第一次派生时落为源任务 id
  occurrence: 0,              // 第几次出现，从 0 起
  createdAt: ISO, updatedAt: ISO
}
```

- 未完成任务的排序键：`done` → `priority 降序` → `dueDate 升序（无则 9999-12-31）` → `createdAt 升序`。
- `coversDate(task, d)`：起止都有则闭区间；只有一个则当天命中；都没有则不进日历。
- 分组顺序即 `groups` 数组顺序，`order` 字段只是留痕。

## 2. 进度与勾选（不可自相矛盾）

| 情况 | 进度 |
| --- | --- |
| `done === true` | 恒为 100% |
| 有检查点（子任务 + 里程碑） | 加权平均：子任务取自身 `progress`（完成即 100），里程碑取勾选 0/100，再对条数求平均；`done` 由「是否全勾」反向推导 |
| 没有检查点 | 取 `progress` 字段（手动滑杆） |

- `setTaskDone(task, v)`：`v=true` 时把所有子任务与里程碑勾上；`v=false` 时全部放开，`progress` 归零。**对称**，禁止出现未完成却 100%。
- `setChildDone(...)`：改单个检查点后调 `syncDoneFromChildren`，全勾则父任务自动完成，不全则父任务自动放开；
  子任务勾选即 `progress=100` 并写 `doneAt`，取消则归零并清 `doneAt`。
- `setSubtaskProgress(task, subId, v)`：`v>=100` 视为完成、写 `doneAt`；`<100` 视为未完成、清 `doneAt`。
- `subtaskMinutes(sub)`：`minutes` 手填优先，否则 `doneAt - (startDate+startTime)`，不足 1 分钟或缺少端点返回 `null`。
- 滑杆拖到 100 等价于勾选完成（会走同一套完成逻辑，因此重复任务同样派生下一次）。

## 3. 重复规则

`freq`：`none` / `daily` / `weekly` / `monthly` / `yearly` / `custom`。
`unit` 只对 `custom` 有意义（`day` / `week` / `month` / `year`），其余由 `freq` 决定：daily→day、weekly→week、monthly→month、yearly→year。
`weekdays` 仅在单位为 `week` 时生效，取 `0=周日 … 6=周六`，去重升序。

`nextRun(anchor, rep)`：

| 单位 | 规则 |
| --- | --- |
| day | `anchor + interval` 天 |
| week（有 weekdays） | 逐日向后找，命中星期集合、且与锚点所在周相差周数能被 interval 整除的第一天 |
| week（无 weekdays） | `anchor + 7 × interval` 天 |
| month | 加 interval 个月，日超出月长时夹到月末 |
| year | 加 interval 年（等价 12×interval 月），2/29 → 2/28 |

`repeatEnds(rep, nextAnchor)`：`until` 存在且 `nextAnchor > until` → 结束；`count` 存在且 `doneCount + 1 >= count` → 结束。

`spawnNext(task)`：
1. 锚点 = `startDate || dueDate`，都没有则不派生；
2. 算 `nextAnchor`，被结束条件挡住则不派生；
3. `delta = diffDays(anchor, nextAnchor)`，`startDate` / `dueDate` / 里程碑日期整体加 `delta`；
4. 子任务与里程碑复制但 `done=false`，`progress=0`，`done=false`，`repeat.doneCount+1`，`seriesId = task.seriesId || task.id`，`occurrence+1`；
5. **只由「勾选父任务」触发**，改子任务不触发（避免一次点击派生多次）。

## 4. 存储分片

| key | 值 | 写入时机 |
| --- | --- | --- |
| `meta` | `{ version: 1, groups: [{ id, name, color, collapsed, order }], prefs: { view, showDone, weekMonday, scope } }` | 分组/偏好变化 |
| `tasks.<groupId>` | 该分组的任务数组 | 该组任务有任何改动 |

- 单一写入口 `Store.flush()`：250 ms 去抖；只写 dirty 的分组键；分组删除后 `markGroupDead` 删键。
- 平台上限：单值 256 KiB、整库 1 MiB。写入失败记 `Store.lastError`，界面在状态栏展示「保存失败」，写盘成功后自动清掉。
- 宿主的 `capabilities.storage` 缺失时退化成内存 Map，并显示横幅提示「改动不会持久化」。
- `Store.load(defaults)` 每次都做一次归一化（`normalizeTask` / 分组字段校正），所以手改/导入的脏数据不会把界面带崩。

## 5. 界面结构

```
#shell
├─ .topbar        品牌 + 搜索 + 列表/日历切换 + 显示已完成 + 数据 + 新建
├─ .workspace
│  ├─ .pane-side  智能列表（全部/今天/逾期/未来 7 天）+ 分组（进度条 + 计数 + ⋯ 菜单）+ 总体进度
│  └─ .pane-main  #list-view（分组分段） / #calendar-view（月历）
└─ （无状态栏：总数/未完成在侧栏底部，进度在分组头与任务行上）
#modal-root  右侧详情面板（.sheet）：标题、分组、优先级、起止、重复、完成度、子任务、里程碑、备注
#dialog-root 确认框 / 输入框 / 数据与设置
#menu-root   分组 ⋯ 菜单
#toasts
```

- 外壳 `.shell` 三层兜底：`position: fixed` + **显式 `top/right/bottom/left`**（不用 `inset` 简写）+ `min-height: 100vh/100dvh`；
  另有 `fitShell()` 在 boot/resize/env 时用**内联 `!important`** 把外壳钉成视口大小（压过宿主同名全局样式）。三者任一可用即可占满。
  侧栏 `.pane-side` 与 `.workspace` 均 `height: 100%`，所以「总体完成度」永远贴底。
- 同一 time 内多次改动合并成一次 `render()`（16 ms timeout，不用 rAF，后台标签与 headless 也能落地）。
- 卡片交互：单击卡片空白/标题 → 展开或收起；`✎` 或双击 → 打开详情；点击 `input/select/button/label/.task-body` 不触发收起。
- 展开箭头统一用 DBX 同款 chevron：`<svg viewBox="0 0 16 16"><path d="M6 3.75 10.25 8 6 12.25" …/></svg>`，
  收起指向右、展开加 `.open` 旋转 90°；任务卡、分组标题、子任务行三处复用 `chevron(open)`。
- 子任务两级：收起态 `.sub-top` 只有「勾选 + 纯文本标题（`.sub-title-text`，**不可编辑**，点击=展开）+ 用时 + 优先级标签 + 箭头」；
  展开态（`S.expandedSubs` 记录，按子任务 id）标题才变成 `input.sub-title`，并渲染 `.sub-meta`：优先级下拉、开始日期时间、完成时间、用时输入、进度滑杆、删除。
- 子任务行内编辑只在**标题输入与进度拖动**时做局部更新（避免丢焦点），其余改动重建单张卡片（`refreshCard`），不重排整列表。
- 详情面板是**实时保存**的：每次输入直接改模型并写盘，没有「保存」按钮；关闭时全空任务会被丢弃。
- 列表为空时 `emptyState()` 必须分清四种空：一条任务都没有 / 搜索无匹配 / 当前范围没有任务 /
  匹配到的都被勾完了（后者给「显示已完成」出口）。判定搜索时 `q` 必须与小写化后的 `visibleTasks` 同口径。
- 勾选完成后弹一条带「撤销」的 toast（5.2 s）：撤销会把任务放回未完成，并删掉刚派生出的重复实例。
- `?locale=zh|en` 查询参数只影响本地预览与自测（宿主加载入口时不带查询串），用于让断言与截图可复现。
- 所有可见文案走 `I18N`（zh/en），`manifest.localizations` 只负责插件名与贡献点文案。
- 未知事件/缺失能力一律降级：没 `storage` 用内存、没 `workbenchTitle` 不改标题、没有宿主则显示横幅并以内存模式预览。

## 6. 自测

| 文件 | 覆盖 |
| --- | --- |
| `dev/store.test.js` | 46 组数据层断言：日期推进、月末/闰年、六种重复、结束条件、进度、对称勾选、派生、排序、存储往返 |
| `dev/selftest.html` | 90 条界面断言：建任务、子任务勾选、重复派生、日历、搜索、分组、分组重命名/删除、自定义重复、导出回读、空状态与撤销、卡片展开、子任务收起/展开、排序/进度/用时、无状态栏，并断言零运行时报错 |
| `dev/layout.html` | 布局度量：外壳占满视口（含 `breakheight=1` 打断高度链）、无横向溢出、侧栏 232px、日历 42 格等宽、展开卡片与详情面板不溢出 |
| `dev/preview.html` | 伪造宿主 + 示例数据，用于明暗两套主题的肉眼验收 |
