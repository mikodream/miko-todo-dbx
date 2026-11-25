# MIKO.TODO 待办（DBX 插件）

DBX 里的待办工作台：**分组 + 优先级 + 起止时间 + 子任务/里程碑 + 进度条 + 列表/日历双视图 + 重复任务**。
纯前端插件（沙箱 UI + `host.storage`），没有原生 Sidecar，不需要编译产物以外的任何依赖。

- 插件 id：`miko.todo.tasks`　版本：`0.1.1`　作者：`miko`　协议：MIT
- 仓库：https://github.com/mikodream/miko-todo-dbx
- 入口：工作台 `miko.todo.tasks.workbench`、命令「打开待办」（命令面板 + 顶部工具栏）
- 权限：`host.storage`（任务与偏好）、`host.workbench`（改标签标题）

## 功能

| 能力 | 说明 |
| --- | --- |
| 分组管理 | 新建 / 重命名 / 8 色标记 / 上移下移 / 删除（任务自动迁到另一个分组，至少保留一个分组） |
| 智能列表 | 全部、今天、逾期、未来 7 天；分组列表与分组进度条 |
| 优先级 | 无 / 低 / 中 / 高 / 紧急，列表左侧色条 + 胶囊标签，排序时优先 |
| 起止时间 | 开始日期、截止日期，可选全天或带时间（开始/截止时间分开设） |
| 任务卡片 | **单击卡片任意空白处展开/收起**，箭头用 DBX 同款 chevron（`M6 3.75 10.25 8 6 12.25`，展开旋转 90°）；`✎` 或双击打开详情面板 |
| 子任务 | 卡片里直接回车新增；**收起时标题只读**，右侧显示用时与优先级标签，**点标题（或行尾箭头）展开**后才可改标题、开始/完成时间、用时、进度与删除；排序可按「优先级 / 创建时间」切换 |
| 里程碑 | 带日期（可选），勾选参与完成度；带日期的里程碑在日历上以 ◆ 显示 |
| 完成度 | 有检查点按 `已勾选 / 总数` 自动算；没有检查点时用滑杆手动设 0–100% |
| 列表视图 | 按分组分段、可折叠、进度条、逾期标红、搜索过滤；空列表会说明原因并给出出口；侧栏直通底部，总体完成度贴底 |
| 日历视图 | 月历，任务按起止区间铺在每一天，里程碑 ◆，点空白格直接在当天建任务 |
| 重复任务 | 不重复 / 每天 / 每周（可多选星期）/ 每月 / 每年 / 自定义（间隔 × 天/周/月/年）；结束条件：永不 / 某天 / 完成 N 次 |
| 数据 | 导出/导入 JSON、清除已完成任务、每周起始日（周日/周一） |
| 撤销 | 勾选完成后 5 秒内可撤销（含撤回派生出的重复实例） |

## 几个明确的行为约定

- **勾选是对称的**：勾上父任务会把子任务与里程碑全部勾上；取消勾选会把它们全部放开，并把进度归零。
  这样不会出现「没完成却显示 100%」。
- **重复任务完成后派生下一次**：勾选完成时按规则算出下一次日期，复制出一条新任务（子任务/里程碑重置为未完成、
  日期整体平移），当前这条留在原地作为历史记录。结束条件挡住时不再派生。只会由「勾选父任务」触发。
- **进度 100% 即完成**：把滑杆拖到 100% 等同于勾选完成（因此也会触发重复任务派生）。
- 未排期任务只出现在列表和智能列表里，不进日历。
- 关闭详情面板时，标题、备注、子任务、里程碑全空的任务会被丢弃（防止误点出一个空行）。
- **子任务进度计入父任务**：父任务完成度 = 子任务进度（未完成取自身进度、完成算 100）与里程碑勾选的平均值。
  子任务进度拖到 100% 即算完成并自动写入完成时间；取消完成会清掉完成时间。
- **用时**：手填优先；留空则按「开始日期+时间 → 完成时间」自动算，显示成「45 分钟 / 1 小时 30 分」。
- **子任务排序**：优先级（高在前，同级按创建时间）或创建时间（早在前），排序只影响显示，不改存储顺序。
- **勾选完成会隐藏任务**（「显示已完成」关着时）。所以勾完最后一个任务列表会空，此时页面会明确写出
  「这个范围里的任务都完成了」并给「显示已完成 / 新建任务」两个出口，同时右下角弹出「已完成：xxx · 撤销」，
  5 秒内点「撤销」可立刻反悔（重复任务连同派生出的下一次一起撤回）。
- 没有底部状态栏：任务总数与未完成数在左侧栏底部，进度在每个分组标题和每行任务上，避免同一份数字出现两遍。

## 存储

数据分片存在 `host.storage`（`plugin-data/miko.todo.tasks`，升级与卸载都保留）：

| key | 内容 |
| --- | --- |
| `meta` | `{ version, groups: [...], prefs: { view, showDone, weekMonday, scope } }` |
| `tasks.<groupId>` | 该分组的任务数组 |

上限是平台给的硬指标：单值 256 KiB、整库 1 MiB。分组分片让单个分组不容易撞到单值上限；
整库打满时会报「保存失败」，用「数据 → 导出 JSON」备份后清理即可。宿主没有存储能力时会退化成内存模式并给出横幅提示。

## 本地预览与自测（不需要 DBX）

```bash
cd todo
python3 -m http.server 5399
# 打开 http://127.0.0.1:5399/dev/preview.html?theme=dark&view=calendar
# 打开 http://127.0.0.1:5399/dev/selftest.html   → 页面里打印 PASS/FAIL
```

- `dev/preview.html`：伪造最小宿主（storage/theme/locale）后跑真实的 `ui/index.html` 与 `app.js`，带示例数据，用于看样式。
- `dev/selftest.html`：在 iframe 里点真实按钮跑 90 条断言（建任务、卡片展开、子任务新增/排序/进度/用时、勾子任务、重复派生、日历、搜索、分组、重命名/删除、自定义重复、导出）。
- `dev/layout.html`：量布局（是否横向溢出、侧栏/主区宽度、日历格子一致性、详情面板尺寸）。
- `dev/store.test.js`：纯数据层断言（日期推进、月末/闰年、重复规则、进度、派生）。`node dev/store.test.js`
- `dev/run-selftest.sh`：一条命令跑完「起服务 → 无头 Chrome → 断言汇总」，CI 用的就是它（`dev/parse-selftest.py` 负责解析）

`node --headless` 跑自测的命令：

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --user-data-dir=/tmp/dbx-todo-profile --virtual-time-budget=15000 \
  --dump-dom "http://127.0.0.1:5399/dev/selftest.html" | grep -E "FAIL|RESULT"
```

## 打包

```bash
python3 ../.agents/skills/dbx-plugin-dev/scripts/check_manifest.py .   # 0 error
dbx-plugin package .                                                   # → dist/miko.todo.tasks-0.1.0-universal.dbxp
```

包内只含 `assets/` 与 `ui/`（见 `dbx-plugin.toml` 的 `[package] include`），`dev/` 不会被打进去。
## 发版（GitHub Actions）

`.github/workflows/release.yml` 会在**主分支每次推送**时跑一遍测试，并按 `manifest.json` 的 `version` 发版（对应官方文档「提交官方商店的完整流程 · 第一步」）。

| 步骤 | 做什么 |
| --- | --- |
| `prepare` | 数据层断言 + 无头 Chrome 界面断言 → 解析 `manifest.json` / `dbx-plugin.toml` → 判断 `v<version>` 是否已发布 |
| `release` | 建 **draft** Release，自动写 Release Notes（变更、资产说明、安装方式、上架流程）并指向当前提交 |
| `candidates` | 调官方 `t8y2/dbx/.github/workflows/plugin-release-reusable.yml@plugin-cli-v0.1.10`，按平台构建未签名候选包，上传前校验 SHA-256／大小、拒绝已签名包、校验各平台 manifest 身份一致 |
| `verify` | 确认资产齐全（`.dbxp` 数 == `.artifact.json` 数，且含 `release-candidates.json`）后把 draft 正式发布 |

Release 资产：

- `miko.todo.tasks-<version>-<target>.dbxp`：每个平台的**未签名**候选包。纯前端插件只有 `universal`；一旦 `dbx-plugin.toml` 出现 `[backend]`，矩阵自动切成 `linux-x64` / `linux-arm64` / `windows-x64` / `darwin-x64` / `darwin-arm64`；
- 与包同名的 `.artifact.json`：`target` / `url` / `sha256` / `size`，绑定确切字节；
- `release-candidates.json`：汇总清单，`dbx-store` 的同步 Workflow 读它生成候选 PR；
- Release Notes 与源码 Tag `v<version>`。

### 商店元数据 `.dbx-store.json`

`dbx-store` 的同步脚本会按 **源码 Tag** 去取仓库根目录的 `.dbx-store.json`（默认路径，可通过 `automation/plugin-sources.json` 的 `metadataPath` 覆盖）。
它不是运行时 manifest，字段白名单只有：`name`、`description`、`icon`、`tags`、`permissions`、`source`、`homepage`、`license`、`releaseNotes`、`localizations`；`autoUpdate` 不在这里（那是 `dbx-store` 的注册字段，需要向 `t8y2/dbx-store` 提 PR 改 `automation/plugin-sources.json`）。

- **首次上架时 `name` 与 `license` 是必填**：`sync-release-candidate.mjs` 会直接拒绝缺这两项的插件；
- `icon` 写包内相对路径（如 `assets/plugin.svg`），同步时自动转成该 Tag 下的 raw.githubusercontent 地址；
- 文件必须存在于**被打 Tag 的那次提交**里，否则同步读不到。所以新增/修改它时要连带升版本、重新发版。

> `LICENSE`（MIT）与该文件同源：商店展示的协议以 `license` 字段为准。

发新版本：改 `manifest.json` 的 `version` → 提交 → 推 `main`。**版本号没变时工作流会跳过并告警**——已发布的 Release 资产不可覆盖，字节一变就必须升版本重走流程。也可以手动 `workflow_dispatch` 重跑，用于补全失败中断时留下的 draft。


`menus.items[].group` 只接受宿主词表 `navigation` / `primary` / `secondary` / `destructive`（写 `plugins` 会被判为不兼容）。

安装：DBX → 插件中心 → 打开「允许安装未签名开发包」→ 选择 `dist/miko.todo.tasks-0.1.0-universal.dbxp`；
之后从命令面板「打开待办」或顶部工具栏的插件按钮进入。
