/* MIKO.TODO 待办 —— 工作台应用
 * 沙箱里没有 localStorage / 原生弹窗 / 网络，跨边界只走 window.dbxPlugin；
 *  DOM 一律 createElement + textContent，动态宽度走 CSSOM（不写 style 属性）。 */
(function () {
  "use strict";

  const T = window.MikoTodoStore;
  const BUILD = "0.1.0";   // 与 manifest.json 的 version 同步，方便确认装的是哪一版

  /* ── 文案 ─────────────────────────────────────────── */
  const I18N = {
    zh: {
      searchPlaceholder: "搜索任务、备注、子任务…", viewList: "列表", viewCalendar: "日历",
      showDone: "显示已完成", hideDone: "隐藏已完成", dataBtn: "数据", newTask: "新建任务",
      brandStats: "今天 {today} · 逾期 {overdue}",
      smartLists: "智能列表", smartAll: "全部", smartToday: "今天", smartOverdue: "逾期", smartWeek: "未来 7 天",
      groupsTitle: "分组", addGroup: "新建分组", groupInbox: "收集箱", groupWork: "工作", groupLife: "生活",
      overall: "总体完成度",
      priNone: "无优先级", priLow: "低", priMedium: "中", priHigh: "高", priUrgent: "紧急",
      noDate: "未排期", due: "截止", starts: "开始",
      freqNone: "不重复", freqDaily: "每天", freqWeekly: "每周", freqMonthly: "每月", freqYearly: "每年", freqCustom: "自定义",
      everyDay: "每天", everyNDays: "每 {n} 天", everyWeek: "每周", everyNWeeks: "每 {n} 周",
      everyMonth: "每月", everyNMonths: "每 {n} 个月", everyYear: "每年", everyNYears: "每 {n} 年",
      unitDay: "天", unitWeek: "周", unitMonth: "月", unitYear: "年",
      wd: ["日", "一", "二", "三", "四", "五", "六"],
      untilDate: "至 {date}", timesCount: "共 {n} 次",
      endLabel: "结束", endNever: "永不", endUntil: "在某天", endCount: "完成次数",
      nextRunHint: "下次：{date}", repeatLabel: "重复", intervalLabel: "间隔", weekdayLabel: "星期",
      repeatNeedsDate: "先设置开始或截止日期，重复才会生效",
      repeatDoneHint: "勾选完成后自动生成下一次，当前这次保留为历史记录",
      sheetTitlePh: "任务标题", groupLabel: "分组", priorityLabel: "优先级", timeLabel: "起止时间",
      startLabel: "开始", dueLabel: "截止", allDay: "全天", timeStart: "开始时间", timeDue: "截止时间",
      progressTitle: "完成度", progressManual: "拖动设置进度", progressCp: "{done} / {total} 项检查点已完成",
      subtasks: "子任务", milestones: "里程碑", addSubtask: "添加子任务", addMilestone: "添加里程碑",
      subtaskPh: "子任务名称", milestonePh: "里程碑名称",
      notes: "备注", notesPh: "补充说明…",
      delete: "删除", duplicate: "复制任务", close: "关闭", edit: "编辑",
      menuRename: "重命名", menuColor: "颜色", menuMoveUp: "上移", menuMoveDown: "下移", menuDelete: "删除分组",
      groupNewTitle: "新建分组", groupRenameTitle: "重命名分组", groupNameLabel: "分组名称",
      groupDeleteTitle: "删除分组", groupDeleteBody: "删掉“{name}”，里面的 {n} 个任务会移到“{target}”。",
      lastGroup: "至少要保留一个分组",
      confirm: "确定", cancel: "取消", copy: "复制",
      dataTitle: "数据与设置", dataExport: "导出 JSON", dataImport: "导入 JSON",
      dataImportPh: "粘贴之前导出的 JSON…", dataImportBtn: "导入并替换", dataClearDone: "清除已完成任务",
      dataWeekStart: "每周起始日", weekSun: "周日", weekMon: "周一",
      dataCopied: "已复制到剪贴板", dataCopyFail: "复制失败，请手动全选复制",
      importBad: "JSON 格式不对，需要包含 groups 与 tasks 数组",
      importDone: "导入完成：{tasks} 个任务 / {groups} 个分组",
      importWarn: "导入会替换现在的全部分组与任务。",
      clearDoneConfirm: "清除已完成任务？", clearDoneBody: "共 {n} 个已完成任务会被删除。",
      cleared: "已清除 {n} 个任务", exportEmpty: "当前没有任务",
      tasksCount: "共 {total} 个任务", openCount: "未完成 {n}",
      emptyAllDoneTitle: "这个范围里的任务都完成了",
      emptyAllDoneBody: "已完成 {n} 个，默认不显示已完成任务。",
      emptyScopeTitle: "这个范围还没有任务",
      emptyScopeBody: "换个范围，或者直接新建一个。",
      emptySearchTitle: "没有匹配「{q}」的任务",
      emptySearchBody: "换个关键词，或者清除搜索。",
      clearSearch: "清除搜索", viewAll: "查看全部", undo: "撤销", completedToast: "已完成：{title}",
      sortLabel: "排序", sortPriority: "优先级", sortCreated: "创建时间",
      subStart: "开始", subDoneAt: "完成", subMinutes: "用时", subMinsAuto: "自动",
      minutesUnit: "{n} 分钟", hoursMinutes: "{h} 小时 {m} 分", hoursUnit: "{h} 小时",
      detailBtn: "详情", subAdd: "添加", subTimeHint: "子任务：优先级越高越靠前；进度拖到 100% 即完成",
      subExpand: "展开子任务", subDuration: "用时",
      scopeAll: "全部任务", scopeToday: "今天", scopeOverdue: "逾期", scopeWeek: "未来 7 天", scopeGroup: "分组：{name}",
      emptyTitle: "这里还没有任务", emptyBody: "点「新建任务」开始，或者直接点日历里的某一天。",
      calToday: "今天", calMeta: "可见 {n} 个任务", calMore: "+{n}",
      memoryBanner: "没有拿到 DBX 存储能力，改动只存在内存里；先在「数据」里导出 JSON 备份。",
      hostBanner: "当前不在 DBX 宿主里，数据不会持久化。",
      nextTaskToast: "已生成下一次：{date}",
      milestoneHint: "带日期的里程碑会以 ◆ 显示在日历上",
      storageError: "保存失败：{msg}",
      overdueShort: "逾期", todayShort: "今天",
      sheetTitleEmpty: "未命名任务", msNone: "还没有里程碑", subNone: "还没有子任务",
      bodyHint: "打开详情可以加子任务、里程碑和备注"
    },
    en: {
      searchPlaceholder: "Search tasks, notes, subtasks…", viewList: "List", viewCalendar: "Calendar",
      showDone: "Show done", hideDone: "Hide done", dataBtn: "Data", newTask: "New task",
      brandStats: "{today} today · {overdue} overdue",
      smartLists: "Smart lists", smartAll: "All", smartToday: "Today", smartOverdue: "Overdue", smartWeek: "Next 7 days",
      groupsTitle: "Groups", addGroup: "New group", groupInbox: "Inbox", groupWork: "Work", groupLife: "Life",
      overall: "Overall progress",
      priNone: "No priority", priLow: "Low", priMedium: "Medium", priHigh: "High", priUrgent: "Urgent",
      noDate: "Unscheduled", due: "Due", starts: "Starts",
      freqNone: "Does not repeat", freqDaily: "Daily", freqWeekly: "Weekly", freqMonthly: "Monthly", freqYearly: "Yearly", freqCustom: "Custom",
      everyDay: "Daily", everyNDays: "Every {n} days", everyWeek: "Weekly", everyNWeeks: "Every {n} weeks",
      everyMonth: "Monthly", everyNMonths: "Every {n} months", everyYear: "Yearly", everyNYears: "Every {n} years",
      unitDay: "day(s)", unitWeek: "week(s)", unitMonth: "month(s)", unitYear: "year(s)",
      wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      untilDate: "until {date}", timesCount: "{n} times",
      endLabel: "Ends", endNever: "Never", endUntil: "On date", endCount: "After count",
      nextRunHint: "Next: {date}", repeatLabel: "Repeat", intervalLabel: "Every", weekdayLabel: "Weekdays",
      repeatNeedsDate: "Set a start or due date for the repeat rule to apply",
      repeatDoneHint: "Checking it done creates the next occurrence and keeps this one as history",
      sheetTitlePh: "Task title", groupLabel: "Group", priorityLabel: "Priority", timeLabel: "Dates",
      startLabel: "Start", dueLabel: "Due", allDay: "All day", timeStart: "Start time", timeDue: "Due time",
      progressTitle: "Progress", progressManual: "Drag to set progress", progressCp: "{done} / {total} checkpoints done",
      subtasks: "Subtasks", milestones: "Milestones", addSubtask: "Add subtask", addMilestone: "Add milestone",
      subtaskPh: "Subtask name", milestonePh: "Milestone name",
      notes: "Notes", notesPh: "Anything else…",
      delete: "Delete", duplicate: "Duplicate", close: "Close", edit: "Edit",
      menuRename: "Rename", menuColor: "Color", menuMoveUp: "Move up", menuMoveDown: "Move down", menuDelete: "Delete group",
      groupNewTitle: "New group", groupRenameTitle: "Rename group", groupNameLabel: "Group name",
      groupDeleteTitle: "Delete group", groupDeleteBody: "Delete “{name}”? Its {n} task(s) move to “{target}”.",
      lastGroup: "Keep at least one group",
      confirm: "OK", cancel: "Cancel", copy: "Copy",
      dataTitle: "Data & settings", dataExport: "Export JSON", dataImport: "Import JSON",
      dataImportPh: "Paste a previously exported JSON…", dataImportBtn: "Import and replace", dataClearDone: "Clear done tasks",
      dataWeekStart: "Week starts on", weekSun: "Sunday", weekMon: "Monday",
      dataCopied: "Copied to clipboard", dataCopyFail: "Copy failed, select the text manually",
      importBad: "Invalid JSON: needs groups and tasks arrays",
      importDone: "Imported {tasks} task(s) / {groups} group(s)",
      importWarn: "Importing replaces all current groups and tasks.",
      clearDoneConfirm: "Clear completed tasks?", clearDoneBody: "{n} completed task(s) will be deleted.",
      cleared: "Cleared {n} task(s)", exportEmpty: "No tasks yet",
      tasksCount: "{total} task(s)", openCount: "{n} open",
      emptyAllDoneTitle: "Everything here is done",
      emptyAllDoneBody: "{n} completed task(s) are hidden by default.",
      emptyScopeTitle: "Nothing in this range",
      emptyScopeBody: "Try another range, or create a task.",
      emptySearchTitle: "No task matches “{q}”",
      emptySearchBody: "Try another keyword, or clear the search.",
      clearSearch: "Clear search", viewAll: "View all", undo: "Undo", completedToast: "Done: {title}",
      sortLabel: "Sort", sortPriority: "Priority", sortCreated: "Created",
      subStart: "Start", subDoneAt: "Done", subMinutes: "Took", subMinsAuto: "auto",
      minutesUnit: "{n} min", hoursMinutes: "{h} h {m} min", hoursUnit: "{h} h",
      detailBtn: "Details", subAdd: "Add", subTimeHint: "Subtasks: higher priority first; dragging to 100% completes it",
      subExpand: "Toggle subtask details", subDuration: "Duration",
      scopeAll: "All tasks", scopeToday: "Today", scopeOverdue: "Overdue", scopeWeek: "Next 7 days", scopeGroup: "Group: {name}",
      emptyTitle: "Nothing here yet", emptyBody: "Hit “New task”, or click any day in the calendar.",
      calToday: "Today", calMeta: "{n} visible task(s)", calMore: "+{n}",
      memoryBanner: "DBX storage is unavailable, changes live in memory only; export JSON to keep them.",
      hostBanner: "Not running inside DBX; data will not persist.",
      nextTaskToast: "Next occurrence: {date}",
      milestoneHint: "Milestones with a date show up as ◆ in the calendar",
      storageError: "Save failed: {msg}",
      overdueShort: "overdue", todayShort: "today",
      sheetTitleEmpty: "Untitled task", msNone: "No milestones yet", subNone: "No subtasks yet",
      bodyHint: "Open the details to add subtasks, milestones and notes"
    }
  };

  let LOCALE = "zh";
  const lang = () => I18N[LOCALE] || I18N.zh;
  function t(key, vars) {
    const table = lang();
    let s = table[key] == null ? String(key) : table[key];
    if (typeof s !== "string") return s;
    if (vars) for (const k in vars) s = s.split("{" + k + "}").join(String(vars[k]));
    return s;
  }

  /* ── 状态 ─────────────────────────────────────────── */
  const S = {
    locale: "zh", booted: false, model: null,
    view: "list", scope: { kind: "all", gid: null }, q: "", showDone: false,
    expanded: new Set(), cal: { y: 0, m: 0 },
    sheet: null, menuOpen: false, renderQueued: false, toastCount: 0, dialogResolve: null, fitPending: true,
    expandedSubs: new Set()
  };

  const $ = (id) => document.getElementById(id);
  const model = () => S.model;
  const tasks = () => (S.model ? S.model.tasks : []);
  const groups = () => (S.model ? S.model.groups : []);

  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props) for (const k in props) {
      const v = props[k];
      if (v == null || v === false) continue;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k === "dataset") Object.assign(node.dataset, v);
      else if (k === "style" && typeof v === "object") for (const p in v) node.style.setProperty(p, v[p]);
      else if (k.indexOf("on") === 0 && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === "value") node.value = v;
      else node.setAttribute(k, v === true ? "" : String(v));
    }
    if (children) for (const c of [].concat(children)) {
      if (c == null || c === false) continue;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return node;
  }

  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); }

  /* ── 日期与文案格式化 ─────────────────────────────── */
  function fmtDate(d) {
    if (!T.isDate(d)) return "";
    const date = T.toDate(d);
    const sameYear = date.getFullYear() === new Date().getFullYear();
    const loc = LOCALE === "zh" ? "zh-CN" : "en-US";
    try {
      return date.toLocaleDateString(loc, sameYear ? { month: "short", day: "numeric" } : { year: "numeric", month: "short", day: "numeric" });
    } catch (e) { return d; }
  }

  function taskDateText(task) {
    const s = task.startDate, e = task.dueDate;
    const st = !task.allDay && T.isTime(task.startTime) ? " " + task.startTime : "";
    const et = !task.allDay && T.isTime(task.dueTime) ? " " + task.dueTime : "";
    if (s && e && s === e) return fmtDate(s) + st + (st || et ? (et ? " – " + et : "") : "");
    if (s && e) return fmtDate(s) + st + " → " + fmtDate(e) + et;
    if (e) return t("due") + " " + fmtDate(e) + et;
    if (s) return t("starts") + " " + fmtDate(s) + st;
    return t("noDate");
  }

  function repeatSummary(rep) {
    if (!rep) return t("freqNone");
    const unit = T.repeatUnit(rep), n = rep.interval;
    let out;
    if (unit === "day") out = n === 1 ? t("everyDay") : t("everyNDays", { n });
    else if (unit === "week") out = n === 1 ? t("everyWeek") : t("everyNWeeks", { n });
    else if (unit === "month") out = n === 1 ? t("everyMonth") : t("everyNMonths", { n });
    else out = n === 1 ? t("everyYear") : t("everyNYears", { n });
    if (unit === "week" && rep.weekdays && rep.weekdays.length) {
      out += " · " + rep.weekdays.map((d) => lang().wd[d]).join(LOCALE === "zh" ? "、" : ", ");
    }
    if (rep.until) out += " · " + t("untilDate", { date: fmtDate(rep.until) });
    if (rep.count) out += " · " + t("timesCount", { n: rep.count });
    return out;
  }

  function priorityLabel(p) {
    const map = { none: "priNone", low: "priLow", medium: "priMedium", high: "priHigh", urgent: "priUrgent" };
    return t(map[p] || "priNone");
  }

  /* ── 数据操作 ─────────────────────────────────────── */
  function findTask(id) { return tasks().filter((x) => x.id === id)[0] || null; }
  function groupById(id) { return groups().filter((g) => g.id === id)[0] || null; }

  function touch(task) {
    task.updatedAt = new Date().toISOString();
    T.Store.touchGroup(task.groupId);
  }

  function savePrefs() {
    if (!S.model) return;
    S.model.prefs.view = S.view;
    S.model.prefs.showDone = S.showDone;
    S.model.prefs.scope = S.scope;
    T.Store.touchMeta();
  }

  function removeTask(task) {
    const i = tasks().indexOf(task);
    if (i < 0) return;
    tasks().splice(i, 1);
    T.Store.touchGroup(task.groupId);
    S.expanded.delete(task.id);
  }

  function inlineGroups() {
    return { groups: [
      { id: T.newId("g"), name: t("groupInbox"), color: T.COLORS[0] },
      { id: T.newId("g"), name: t("groupWork"), color: T.COLORS[3] },
      { id: T.newId("g"), name: t("groupLife"), color: T.COLORS[4] }
    ] };
  }

  // 合并同一帧内的多次改动；用 timeout 而不是 rAF，无帧环境下（headless / 后台标签）也能落地
  // 外壳高度兜底：宿主若用全局样式覆盖 position/height，或 html/body 高度链断掉，
  // 这里用内联 !important 把外壳钉到视口大小，保证侧栏直通底部、内容区吃满剩余高度。
  function fitShell() {
    if (!S.fitPending) return;
    const shell = $("shell");
    if (!shell) return;
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    if (!vh || !vw) return;
    const rect = shell.getBoundingClientRect();
    // 宽高都要「差不多等于视口」才算贴合：宿主窗口缩小时同样要重新钉，否则会留下过大的旧尺寸
    const fits = Math.abs(rect.height - vh) <= 2 && Math.abs(rect.width - vw) <= 2;
    if (fits) { S.fitPending = false; return; }
    const st = shell.style;
    st.setProperty("position", "fixed", "important");
    st.setProperty("top", "0", "important");
    st.setProperty("right", "0", "important");
    st.setProperty("bottom", "0", "important");
    st.setProperty("left", "0", "important");
    st.setProperty("margin", "0", "important");
    st.setProperty("width", vw + "px", "important");
    st.setProperty("height", vh + "px", "important");
    S.fitPending = false;
    fillInner();
  }

  // 外壳之内的第二层兜底：如果宿主把 display/grid 行搞坏了，工作区就只会按内容高度铺开，
  // 侧栏分割线停在半空。这里先量一次；对不上就整体切成绝对定位，把每一层的高度钉死。
  function fillInner() {
    const shell = $("shell");
    if (!shell || shell.hidden) return;
    const ws = shell.querySelector(".workspace");
    if (!ws) return;
    const bar = shell.querySelector(".topbar");
    const banner = $("banner");
    const shellH = shell.getBoundingClientRect().height;
    const topH = Math.round((bar ? bar.getBoundingClientRect().height : 0)
      + (banner && !banner.hidden ? banner.getBoundingClientRect().height : 0));
    const needH = Math.max(240, Math.round(shellH - topH));

    const wsRect = ws.getBoundingClientRect();
    const ok = Math.abs(wsRect.height - needH) <= 2 && wsRect.width >= shell.getBoundingClientRect().width - 2;
    if (ok) {
      if (shell.dataset.absfill === "1") {
        shell.dataset.absfill = "0";
        shell.querySelectorAll("[data-absfill]").forEach((n) => {
          n.removeAttribute("data-absfill");
          ["position", "top", "right", "bottom", "left", "width", "height", "display"].forEach((k) => n.style.removeProperty(k));
        });
      }
      return;
    }

    shell.dataset.absfill = "1";
    const pin = (node, props) => {
      if (!node) return;
      node.setAttribute("data-absfill", "1");
      for (const k in props) node.style.setProperty(k, props[k], "important");
    };

    pin(ws, { position: "absolute", top: topH + "px", left: "0", right: "0", bottom: "0", height: "auto", display: "block" });
    const side = ws.querySelector(".pane-side");
    const main = ws.querySelector(".pane-main");
    const SIDE_W = 232;
    pin(side, { position: "absolute", top: "0", left: "0", bottom: "0", width: SIDE_W + "px", height: "auto", display: "block" });
    pin(main, { position: "absolute", top: "0", left: SIDE_W + "px", right: "0", bottom: "0", width: "auto", height: "auto", display: "block" });

    const foot = side && side.querySelector(".side-foot");
    const scroll = side && side.querySelector(".side-scroll");
    const footH = foot ? Math.round(foot.getBoundingClientRect().height) : 0;
    if (foot && scroll) {
      pin(foot, { position: "absolute", left: "0", right: "0", bottom: "0" });
      pin(scroll, { position: "absolute", top: "0", left: "0", right: "0", bottom: footH + "px", height: "auto" });
    }
    const listView = main && main.querySelector("#list-view");
    const calView = main && main.querySelector("#calendar-view");
    pin(listView, { position: "absolute", top: "0", left: "0", right: "0", bottom: "0", height: "auto" });
    pin(calView, { position: "absolute", top: "0", left: "0", right: "0", bottom: "0", height: "auto" });
  }

  function scheduleRender() {
    if (S.renderQueued) return;
    S.renderQueued = true;
    setTimeout(() => { S.renderQueued = false; render(); }, 16);
  }

  /* ── 过滤 ─────────────────────────────────────────── */
  function rangeOverlaps(task, from, to) {
    const s = task.startDate || task.dueDate, e = task.dueDate || task.startDate;
    if (!s && !e) return false;
    return !(e < from || s > to);
  }

  function scopeTasks() {
    const all = tasks(), today = T.today();
    switch (S.scope.kind) {
      case "today": return all.filter((x) => T.coversDate(x, today));
      case "overdue": return all.filter((x) => x.dueDate && x.dueDate < today && !x.done);
      case "week": return all.filter((x) => rangeOverlaps(x, today, T.addDays(today, 6)));
      case "group": return all.filter((x) => x.groupId === S.scope.gid);
      default: return all.slice();
    }
  }

  function matchesQuery(task, q) {
    if (task.title.toLowerCase().indexOf(q) >= 0) return true;
    if ((task.notes || "").toLowerCase().indexOf(q) >= 0) return true;
    if ((task.subtasks || []).some((s) => s.title.toLowerCase().indexOf(q) >= 0)) return true;
    if ((task.milestones || []).some((m) => m.title.toLowerCase().indexOf(q) >= 0)) return true;
    return false;
  }

  function visibleTasks() {
    const q = S.q.trim().toLowerCase();
    return scopeTasks().filter((task) => {
      if (!S.showDone && task.done) return false;
      return q ? matchesQuery(task, q) : true;
    });
  }

  function smartCounts() {
    const all = tasks(), today = T.today();
    return {
      all: all.filter((x) => !x.done).length,
      today: all.filter((x) => !x.done && T.coversDate(x, today)).length,
      overdue: all.filter((x) => !x.done && x.dueDate && x.dueDate < today).length,
      week: all.filter((x) => !x.done && rangeOverlaps(x, today, T.addDays(today, 6))).length
    };
  }

  /* ── 渲染：侧栏 ───────────────────────────────────── */
  function bar(percent, big) {
    const outer = el("div", { class: "bar" + (big ? " bar-lg" : "") + (percent >= 100 ? " done" : "") });
    const fill = el("i");
    fill.style.width = Math.max(0, Math.min(100, percent)) + "%";
    outer.appendChild(fill);
    return outer;
  }

  function renderSidebar() {
    const smart = $("smart");
    clear(smart);
    const counts = smartCounts();
    const defs = [
      { kind: "all", icon: "◎", label: t("smartAll"), count: counts.all },
      { kind: "today", icon: "☀", label: t("smartToday"), count: counts.today },
      { kind: "overdue", icon: "!", label: t("smartOverdue"), count: counts.overdue },
      { kind: "week", icon: "⌁", label: t("smartWeek"), count: counts.week }
    ];
    defs.forEach((d) => {
      const pressed = S.scope.kind === d.kind;
      const btn = el("button", { class: "smart-item", type: "button", dataset: { kind: d.kind } }, [
        el("span", { class: "ico", text: d.icon }),
        el("span", { class: "label", text: d.label }),
        el("span", { class: "count", text: String(d.count) })
      ]);
      btn.setAttribute("aria-pressed", pressed ? "true" : "false");
      smart.appendChild(btn);
    });

    const box = $("groups");
    clear(box);
    groups().forEach((g) => {
      const list = tasks().filter((x) => x.groupId === g.id);
      const stats = T.statsOf(list);
      const pressed = S.scope.kind === "group" && S.scope.gid === g.id;
      const item = el("div", { class: "group-item", dataset: { gid: g.id, active: pressed ? "true" : "false" } });
      const main = el("button", { class: "group-main", type: "button", dataset: { act: "scope-group", gid: g.id } }, [
        el("span", { class: "dot", style: { background: g.color } }),
        el("span", { class: "g-body" }, [
          el("span", { class: "g-name", text: g.name }),
          bar(stats.percent)
        ]),
        el("span", { class: "g-count", text: stats.open + "/" + stats.total })
      ]);
      const more = el("button", { class: "g-more", type: "button", "aria-label": g.name, dataset: { act: "group-menu", gid: g.id } });
      more.textContent = "⋯";
      item.appendChild(main);
      item.appendChild(more);
      box.appendChild(item);
    });

    const allStats = T.statsOf(tasks());
    $("overall-pct").textContent = allStats.percent + "%";
    $("overall-bar").style.width = Math.min(100, allStats.percent) + "%";
    $("overall-meta").textContent = t("tasksCount", { total: allStats.total }) + " · " + t("openCount", { n: allStats.open }) + " · v" + BUILD;
  }

  /* ── 渲染：顶栏 / 状态栏 ──────────────────────────── */
  function renderTopbar() {
    const counts = smartCounts();
    $("brand-stats").textContent = t("brandStats", { today: counts.today, overdue: counts.overdue });
    Array.prototype.forEach.call(document.querySelectorAll(".seg-btn"), (b) => {
      const v = b.dataset.view;
      b.textContent = v === "list" ? t("viewList") : t("viewCalendar");
      b.setAttribute("aria-pressed", S.view === v ? "true" : "false");
    });
    const showDoneBtn = $("btn-show-done");
    showDoneBtn.textContent = S.showDone ? t("hideDone") : t("showDone");
    showDoneBtn.setAttribute("aria-pressed", S.showDone ? "true" : "false");
    $("btn-data").textContent = t("dataBtn");
    $("btn-new").textContent = t("newTask");
    $("search").setAttribute("placeholder", t("searchPlaceholder"));
    $("btn-add-group").setAttribute("title", t("addGroup"));
    $("cal-today").textContent = t("calToday");
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n]"), (n) => {
      n.textContent = t(n.getAttribute("data-i18n"));
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n-title]"), (n) => {
      n.setAttribute("title", t(n.getAttribute("data-i18n-title")));
    });
  }

  /* ── 渲染：列表 ───────────────────────────────────── */
  // DBX 同款展开箭头：16×16，stroke 1.5，展开时整体旋转 90°
  function chevron(open) {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "chevron" + (open ? " open" : ""));
    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", "M6 3.75 10.25 8 6 12.25");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.5");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.appendChild(path);
    return svg;
  }

  function chip(text, cls) { return el("span", { class: "chip " + (cls || ""), text }); }

  function progressBlock(task, compact) {
    const pr = T.progressOf(task);
    const wrap = el("div", { class: compact ? "task-progress" : "progress-card" });
    if (compact) {
      wrap.appendChild(bar(pr.percent));
      wrap.appendChild(el("span", { class: "pct", text: pr.percent + "%" }));
      return wrap;
    }
    wrap.appendChild(el("div", { class: "pc-head" }, [
      el("span", { text: t("progressTitle") }),
      el("span", { class: "pc-pct", text: pr.percent + "%" })
    ]));
    wrap.appendChild(bar(pr.percent, true));
    return wrap;
  }

  function taskMeta(task) {
    const meta = el("div", { class: "task-meta" });
    const dateText = taskDateText(task);
    const today = T.today();
    let cls = "";
    if (!task.done && task.dueDate && task.dueDate < today) cls = "overdue";
    else if (!task.done && T.coversDate(task, today)) cls = "today";
    meta.appendChild(el("span", { class: cls, text: dateText }));
    const cp = T.checkpointStats(task);
    if (task.subtasks.length) meta.appendChild(el("span", { text: t("subtasks") + " " + task.subtasks.filter((s) => s.done).length + "/" + task.subtasks.length }));
    if (task.milestones.length) meta.appendChild(el("span", { text: t("milestones") + " " + task.milestones.filter((m) => m.done).length + "/" + task.milestones.length }));
    if (task.repeat) meta.appendChild(el("span", { text: repeatSummary(task.repeat) }));
    if (!cp.total && !task.repeat && task.progress > 0) meta.appendChild(el("span", { text: pr(task.progress) }));
    return meta;
  }

  function pr(n) { return n + "%"; }

  function taskRow(task) {
    const expanded = S.expanded.has(task.id);
    const row = el("div", {
      class: "task",
      dataset: { tid: task.id, pri: task.priority, done: task.done ? "true" : "false", expanded: expanded ? "true" : "false" }
    });
    const check = el("button", { class: "check", type: "button", dataset: { act: "toggle", tid: task.id } });
    check.setAttribute("aria-checked", task.done ? "true" : "false");
    check.setAttribute("aria-label", task.title.trim() || t("sheetTitleEmpty"));
    check.textContent = "✓";

    const titleRow = el("div", { class: "task-title-row" });
    titleRow.appendChild(el("span", { class: "task-title" + (task.title.trim() ? "" : " empty"), text: task.title.trim() || t("sheetTitleEmpty") }));
    if (task.priority !== "none") titleRow.appendChild(chip(priorityLabel(task.priority), "pri-" + task.priority));
    if (task.repeat) titleRow.appendChild(chip("↻", "repeat"));

    const main = el("div", { class: "task-main" }, [titleRow, taskMeta(task)]);

    const side = el("div", { class: "task-side" });
    const prInfo = T.progressOf(task);
    if (prInfo.total > 0 || prInfo.percent > 0) side.appendChild(progressBlock(task, true));
    const editBtn = el("button", { class: "icon-btn", type: "button", text: "✎", dataset: { act: "edit", tid: task.id } });
    editBtn.setAttribute("title", t("detailBtn"));
    const expandBtn = el("button", { class: "icon-btn expand", type: "button", dataset: { act: "expand", tid: task.id } });
    expandBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
    expandBtn.setAttribute("aria-label", expanded ? t("close") : t("detailBtn"));
    expandBtn.appendChild(chevron(expanded));
    side.appendChild(editBtn);
    side.appendChild(expandBtn);

    const line = el("div", { class: "task-line" }, [check, main, side]);
    row.appendChild(line);
    if (expanded) row.appendChild(taskBody(task));
    return row;
  }

  function durationText(sub) {
    const mins = T.subtaskMinutes(sub);
    if (mins == null) return "";
    if (mins < 60) return t("minutesUnit", { n: mins });
    const h = Math.floor(mins / 60), m = mins % 60;
    return m ? t("hoursMinutes", { h, m }) : t("hoursUnit", { n: h });
  }

  function sortedSubtasks(task) {
    const mode = (S.model && S.model.prefs.subtaskSort) || "priority";
    return (task.subtasks || []).slice().sort(T.compareSubtasks(mode));
  }

  function subtaskSortSelect() {
    const sel = el("select", { class: "select sort-select", "aria-label": t("sortLabel") });
    [["priority", "sortPriority"], ["created", "sortCreated"]].forEach(([v, k]) => {
      const opt = el("option", { value: v, text: t("sortLabel") + "：" + t(k) });
      if (((S.model.prefs.subtaskSort) || "priority") === v) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener("change", () => {
      S.model.prefs.subtaskSort = sel.value;
      T.Store.touchMeta();
      scheduleRender();
    });
    return sel;
  }

  function toggleExpanded(tid) {
    if (!tid) return;
    if (S.expanded.has(tid)) {
      S.expanded.delete(tid);
      const card = document.querySelector('.task[data-tid="' + tid + '"]');
      const body = card && card.querySelector(".task-body");
      if (body) body.remove();
      if (card) {
        card.dataset.expanded = "false";
        const btn = card.querySelector("[data-act='expand']");
        if (btn) {
          btn.setAttribute("aria-expanded", "false");
          const svg = btn.querySelector(".chevron");
          if (svg) svg.classList.remove("open");
        }
      }
      return;
    }
    S.expanded.add(tid);
    const task = findTask(tid);
    const card = document.querySelector('.task[data-tid="' + tid + '"]');
    if (!task || !card) return;
    card.appendChild(taskBody(task));
    card.dataset.expanded = "true";
    const btn = card.querySelector("[data-act='expand']");
    if (btn) {
      btn.setAttribute("aria-expanded", "true");
      const svg = btn.querySelector(".chevron");
      if (svg) svg.classList.add("open");
    }
  }

  function refreshTaskProgress(task) {
    const card = document.querySelector('.task[data-tid="' + task.id + '"]');
    if (!card) return;
    const pr = T.progressOf(task);
    const fill = card.querySelector(".task-progress .bar > i");
    const pct = card.querySelector(".task-progress .pct");
    if (fill) fill.style.width = pr.percent + "%";
    if (pct) pct.textContent = pr.percent + "%";
  }

  // 只重建这一张卡片，避免整列表重排与滚动跳动
  function refreshCard(task) {
    const card = document.querySelector('.task[data-tid="' + task.id + '"]');
    if (!card) return false;
    card.replaceWith(taskRow(task));
    return true;
  }

  function toggleSubExpand(task, cid) {
    if (S.expandedSubs.has(cid)) S.expandedSubs.delete(cid); else S.expandedSubs.add(cid);
    refreshSubtaskViews(task);
  }

  function refreshSubtaskViews(task) {
    refreshCard(task);
    if (S.sheet && S.sheet.task === task) renderEntries(task);
  }

  // 子任务一行：勾选 + 标题 + 优先级；第二行：开始/完成/用时/进度
  // 子任务行：收起时只有「勾选 + 标题 + 用时 + 优先级 + 箭头」，点箭头才铺开详细字段
  function subtaskRow(sub, task) {
    const open = S.expandedSubs.has(sub.id);
    const row = el("div", {
      class: "sub-row",
      dataset: { cid: sub.id, done: sub.done ? "true" : "false", open: open ? "true" : "false" }
    });
    const check = el("button", { class: "mini-check", type: "button", dataset: { act: "sub-check", tid: task.id, cid: sub.id } });
    check.setAttribute("aria-checked", sub.done ? "true" : "false");
    check.setAttribute("aria-label", sub.title || t("subtaskPh"));
    check.textContent = "✓";

    let title;
    if (open) {
      title = el("input", { class: "input-flat sub-title", type: "text", value: sub.title, placeholder: t("subtaskPh") });
      title.addEventListener("input", () => { sub.title = title.value; touch(task); });   // 不重绘，保住焦点
      title.addEventListener("change", () => { refreshSubtaskViews(task); });
    } else {
      // 收起时标题不可编辑，点它 = 展开
      title = el("span", {
        class: "sub-title-text" + (sub.done ? " done" : ""),
        text: sub.title || t("subtaskPh"),
        dataset: { act: "sub-expand", tid: task.id, cid: sub.id }
      });
      title.setAttribute("role", "button");
      title.setAttribute("tabindex", "0");
      title.setAttribute("title", t("subExpand"));
      title.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSubExpand(task, sub.id); }
      });
    }

    const right = el("div", { class: "sub-right" });
    const dur = durationText(sub);
    right.appendChild(el("span", {
      class: "sub-dur" + (dur ? "" : " muted"),
      text: dur || "—",
      title: t("subDuration")
    }));
    if (sub.priority !== "none") right.appendChild(chip(priorityLabel(sub.priority), "pri-" + sub.priority));
    const exp = el("button", { class: "icon-btn sub-expand", type: "button", dataset: { act: "sub-expand", tid: task.id, cid: sub.id } });
    exp.setAttribute("aria-expanded", open ? "true" : "false");
    exp.setAttribute("aria-label", t("subExpand"));
    exp.appendChild(chevron(open));
    right.appendChild(exp);

    row.appendChild(el("div", { class: "sub-top" }, [check, title, right]));

    if (!open) return row;

    const detail = el("div", { class: "sub-meta" });
    const pri = el("select", { class: "select sub-pri", "aria-label": t("priorityLabel") });
    T.PRIORITIES.forEach((p) => {
      const opt = el("option", { value: p, text: priorityLabel(p) });
      if (p === sub.priority) opt.selected = true;
      pri.appendChild(opt);
    });
    pri.addEventListener("change", () => { sub.priority = pri.value; touch(task); refreshSubtaskViews(task); });

    const sd = el("input", { class: "input-flat", type: "date", value: sub.startDate || "" });
    sd.addEventListener("change", () => { sub.startDate = T.isDate(sd.value) ? sd.value : null; touch(task); refreshSubtaskViews(task); });
    const st = el("input", { class: "input-flat", type: "time", value: sub.startTime || "" });
    st.addEventListener("change", () => { sub.startTime = T.isTime(st.value) ? st.value : null; touch(task); refreshSubtaskViews(task); });
    const doneAt = el("input", { class: "input-flat sub-dt", type: "datetime-local", value: T.toLocalInput(sub.doneAt) });
    doneAt.addEventListener("change", () => { sub.doneAt = T.fromLocalInput(doneAt.value); touch(task); refreshSubtaskViews(task); });
    const mins = el("input", { class: "input-flat sub-mins", type: "number", min: "0", step: "5", placeholder: t("subMinsAuto") });
    if (sub.minutes != null) mins.value = String(sub.minutes);
    mins.addEventListener("change", () => {
      const v = Math.round(Number(mins.value));
      sub.minutes = v > 0 ? v : null;
      touch(task); refreshSubtaskViews(task);
    });

    const range = el("input", { class: "slider sub-range", type: "range", min: "0", max: "100", step: "5", value: String(sub.progress) });
    const pct = el("span", { class: "sub-pct", text: sub.progress + "%" });
    range.addEventListener("input", () => {
      T.setSubtaskProgress(task, sub.id, range.value);
      touch(task);
      pct.textContent = sub.progress + "%";
      refreshTaskProgress(task);
    });
    range.addEventListener("change", () => { refreshSubtaskViews(task); });

    const del = el("button", { class: "del", type: "button", text: "✕", dataset: { act: "sub-del", tid: task.id, cid: sub.id } });
    del.setAttribute("aria-label", t("delete"));

    detail.appendChild(pri);
    detail.appendChild(el("span", { class: "sub-label", text: t("subStart") }));
    detail.appendChild(sd);
    detail.appendChild(st);
    detail.appendChild(el("span", { class: "sub-label", text: t("subDoneAt") }));
    detail.appendChild(doneAt);
    detail.appendChild(el("span", { class: "sub-label", text: t("subMinutes") }));
    detail.appendChild(mins);
    detail.appendChild(el("span", { class: "sub-spacer" }));
    detail.appendChild(range);
    detail.appendChild(pct);
    detail.appendChild(del);
    row.appendChild(detail);
    return row;
  }

  function subtaskComposer(task) {
    const input = el("input", { class: "input sub-add-input", type: "text", placeholder: t("addSubtask") });
    const btn = el("button", { class: "btn btn-small", type: "button", text: "＋" + t("subAdd") });
    const add = () => {
      const value = input.value.trim();
      if (!value) { input.focus(); return; }
      task.subtasks.push(T.newSubtask(value));
      touch(task);
      input.value = "";
      refreshSubtaskViews(task);
      const again = document.querySelector('.task[data-tid="' + task.id + '"] .sub-add-input') || input;
      if (again && again.focus) again.focus();
    };
    btn.addEventListener("click", add);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); add(); }
      if (e.key === "Escape") { e.stopPropagation(); }
    });
    return el("div", { class: "sub-add" }, [input, btn]);
  }

  function taskBody(task) {
    const body = el("div", { class: "task-body" });
    const doneSubs = task.subtasks.filter((s) => s.done).length;
    body.appendChild(el("div", { class: "sub-head" }, [
      el("span", { class: "mini-head", text: t("subtasks") + " " + doneSubs + "/" + task.subtasks.length }),
      subtaskSortSelect()
    ]));

    if (!task.subtasks.length) {
      body.appendChild(el("div", { class: "hint", text: t("subNone") }));
    } else {
      const list = el("div", { class: "sub-list" });
      sortedSubtasks(task).forEach((sub) => list.appendChild(subtaskRow(sub, task)));
      body.appendChild(list);
      body.appendChild(el("div", { class: "hint", text: t("subTimeHint") }));
    }
    body.appendChild(subtaskComposer(task));

    if (task.milestones.length) {
      body.appendChild(el("div", { class: "sub-head" }, [
        el("span", { class: "mini-head", text: t("milestones") + " " + task.milestones.filter((m) => m.done).length + "/" + task.milestones.length })
      ]));
      const mlist = el("div", { class: "mini-list" });
      task.milestones.forEach((m) => {
        const row = el("div", { class: "mini-row" });
        const check = el("button", { class: "mini-check ms", type: "button", dataset: { act: "child-toggle", tid: task.id, kind: "milestone", cid: m.id } });
        check.setAttribute("aria-checked", m.done ? "true" : "false");
        check.textContent = "✓";
        row.appendChild(check);
        row.appendChild(el("span", { class: "mini-text" + (m.done ? " done" : ""), text: "◆ " + (m.title || t("milestonePh")) }));
        if (m.date) row.appendChild(el("span", { class: "mini-date", text: fmtDate(m.date) }));
        mlist.appendChild(row);
      });
      body.appendChild(mlist);
    }

    if (task.notes.trim()) body.appendChild(el("div", { class: "task-notes", text: task.notes }));

    const detail = el("button", { class: "btn btn-small", type: "button", text: t("detailBtn"), dataset: { act: "edit", tid: task.id } });
    body.appendChild(el("div", { class: "task-body-actions" }, [detail]));
    return body;
  }

  function groupBlock(g, items) {
    const block = el("div", { class: "group-block", dataset: { gid: g.id } });
    const stats = T.statsOf(tasks().filter((x) => x.groupId === g.id));
    const head = el("div", { class: "group-head", dataset: { gid: g.id } });
    const caret = el("button", { class: "caret", type: "button", dataset: { act: "collapse-group", gid: g.id } });
    caret.setAttribute("aria-expanded", g.collapsed ? "false" : "true");
    caret.appendChild(chevron(!g.collapsed));
    head.appendChild(caret);
    head.appendChild(el("span", { class: "dot", style: { background: g.color } }));
    head.appendChild(el("span", { class: "g-title", text: g.name }));
    head.appendChild(el("span", { class: "g-meta", text: stats.open + "/" + stats.total }));
    const prog = el("div", { class: "g-progress" }, [bar(stats.percent), el("span", { class: "g-pct", text: stats.percent + "%" })]);
    head.appendChild(prog);
    const add = el("button", { class: "icon-btn g-add", type: "button", dataset: { act: "new-in-group", gid: g.id } });
    add.textContent = "＋";
    head.appendChild(add);
    block.appendChild(head);

    if (!g.collapsed) {
      if (!items.length) {
        block.appendChild(el("div", { class: "hint", text: t("emptyTitle") }));
      } else {
        items.sort(T.compareTasks).forEach((task) => block.appendChild(taskRow(task)));
      }
    }
    return block;
  }

  function emptyCard(title, body, actions) {
    const wrap = el("div", { class: "empty" });
    wrap.appendChild(el("div", { class: "empty-title", text: title }));
    wrap.appendChild(el("div", { text: body }));
    if (actions && actions.length) {
      const row = el("div", { class: "empty-actions" });
      actions.forEach((a) => {
        const btn = el("button", { class: "btn btn-small" + (a.primary ? " btn-primary" : ""), type: "button", text: a.label });
        btn.addEventListener("click", a.run);
        row.appendChild(btn);
      });
      wrap.appendChild(row);
    }
    return wrap;
  }

  // 列表空了要说清是哪一种空，避免「勾完最后一个任务后一片空白」
  function emptyState() {
    const rawQuery = S.q.trim();
    const q = rawQuery.toLowerCase();     // 与 visibleTasks 同一口径，大小写不能两套判定
    const scoped = scopeTasks();
    // 搜索也要参与判定：搜到的任务全被勾完了，说「都完成了」而不是「没有匹配」
    const matched = q ? scoped.filter((x) => matchesQuery(x, q)) : scoped;
    const doneCount = matched.filter((x) => x.done).length;
    if (!tasks().length) {
      return emptyCard(t("emptyTitle"), t("emptyBody"), [{ label: t("newTask"), primary: true, run: () => createTask() }]);
    }
    if (!S.showDone && doneCount) {
      return emptyCard(t("emptyAllDoneTitle"), t("emptyAllDoneBody", { n: doneCount }), [
        { label: t("showDone"), primary: true, run: () => { S.showDone = true; savePrefs(); scheduleRender(); } },
        { label: t("newTask"), run: () => createTask() }
      ]);
    }
    if (q) {
      return emptyCard(t("emptySearchTitle", { q: rawQuery }), t("emptySearchBody"), [
        { label: t("clearSearch"), primary: true, run: () => { S.q = ""; $("search").value = ""; scheduleRender(); } },
        { label: t("newTask"), run: () => createTask() }
      ]);
    }
    if (!scoped.length) {
      return emptyCard(t("emptyScopeTitle"), t("emptyScopeBody"), [
        { label: t("viewAll"), primary: true, run: () => { S.scope = { kind: "all", gid: null }; savePrefs(); scheduleRender(); } },
        { label: t("newTask"), run: () => createTask() }
      ]);
    }
    return emptyCard(t("emptyTitle"), t("emptyBody"), [{ label: t("newTask"), primary: true, run: () => createTask() }]);
  }

  function renderList() {
    const node = $("list-view");
    clear(node);
    const list = visibleTasks();
    if (!list.length) { node.appendChild(emptyState()); return; }
    groups().forEach((g) => {
      const items = list.filter((x) => x.groupId === g.id);
      if (!items.length) return;
      node.appendChild(groupBlock(g, items));
    });
  }

  /* ── 渲染：日历 ───────────────────────────────────── */
  function monthLabel(y, m) {
    const loc = LOCALE === "zh" ? "zh-CN" : "en-US";
    try { return new Date(y, m, 1).toLocaleDateString(loc, { year: "numeric", month: "long" }); }
    catch (e) { return y + "-" + (m + 1); }
  }

  function renderCalendar() {
    const y = S.cal.y, m = S.cal.m;
    const monday = !!S.model.prefs.weekMonday;
    $("cal-title").textContent = monthLabel(y, m);

    const head = $("cal-weekdays");
    clear(head);
    const wdNames = lang().wd;
    const order = monday ? [1, 2, 3, 4, 5, 6, 0] : [0, 1, 2, 3, 4, 5, 6];
    order.forEach((i) => head.appendChild(el("span", { text: wdNames[i] })));

    const grid = $("cal-grid");
    clear(grid);
    const cells = T.monthGrid(y, m, monday);
    const list = visibleTasks();
    const today = T.today();
    const byDay = new Map();
    list.forEach((task) => {
      let placed = false;
      for (let i = 0; i < 42; i++) {
        const d = cells[i];
        if (T.coversDate(task, d)) {
          if (!byDay.has(d)) byDay.set(d, []);
          byDay.get(d).push({ kind: "task", task });
          placed = true;
        }
      }
      if (!placed && !task.startDate && !task.dueDate) {
        // 未排期任务不进日历
      }
      (task.milestones || []).forEach((ms) => {
        if (ms.date && cells.indexOf(ms.date) >= 0) {
          if (!byDay.has(ms.date)) byDay.set(ms.date, []);
          byDay.get(ms.date).push({ kind: "milestone", task, ms });
        }
      });
    });

    cells.forEach((d, idx) => {
      const date = T.toDate(d);
      const out = idx < 7 && date.getMonth() !== m ? true : idx >= 35 && date.getMonth() !== m ? true : date.getMonth() !== m;
      const weekend = date.getDay() === 0 || date.getDay() === 6;
      const cell = el("div", {
        class: "cal-cell", dataset: { date: d, out: out ? "true" : "false", weekend: weekend ? "true" : "false", today: d === today ? "true" : "false" }
      });
      cell.appendChild(el("div", { class: "cal-num", text: String(date.getDate()) }));
      const items = byDay.get(d) || [];
      const box = el("div", { class: "cal-items" });
      const max = 3;
      items.slice(0, max).forEach((it) => {
        if (it.kind === "milestone") {
          const b = el("button", { class: "cal-chip ms", type: "button", dataset: { tid: it.task.id, act: "open" } }, [
            el("span", { class: "sp", text: "◆" }),
            el("span", { class: "t", text: it.ms.title || t("milestonePh") })
          ]);
          b.setAttribute("title", it.ms.title || "");
          box.appendChild(b);
          return;
        }
        const task = it.task;
        const b = el("button", { class: "cal-chip", type: "button", dataset: { tid: task.id, act: "open", pri: task.priority, done: task.done ? "true" : "false" } }, [
          el("span", { class: "t", text: task.title.trim() || t("sheetTitleEmpty") }),
          task.repeat ? el("span", { class: "sp", text: "↻" }) : null
        ]);
        b.setAttribute("title", task.title || "");
        box.appendChild(b);
      });
      if (items.length > max) box.appendChild(el("div", { class: "cal-more", text: t("calMore", { n: items.length - max }) }));
      cell.appendChild(box);
      grid.appendChild(cell);
    });

    $("cal-meta").textContent = t("calMeta", { n: list.length });
  }

  /* ── 主渲染 ───────────────────────────────────────── */
  function render() {
    if (!S.model) return;
    $("list-view").hidden = S.view !== "list";
    $("calendar-view").hidden = S.view !== "calendar";
    renderTopbar();
    renderSidebar();
    if (S.view === "list") renderList(); else renderCalendar();
    updateTitle();
    fitShell();
  }

  function updateTitle() {
    const api = window.dbxPlugin;
    if (!api || !api.capabilities || !api.capabilities.workbenchTitle || typeof api.setTitle !== "function") return;
    const open = tasks().filter((x) => !x.done).length;
    try { api.setTitle(open ? open + " · " + t("scopeAll") : null); } catch (e) { /* 标题只是装饰 */ }
  }

  /* ── toast ────────────────────────────────────────── */
  function toast(text, kind, action) {
    const box = $("toasts");
    const node = el("div", { class: "toast" + (kind ? " " + kind : "") });
    node.appendChild(el("span", { text }));
    const kill = () => {
      if (node.parentNode) node.parentNode.removeChild(node);
      S.toastCount = Math.max(0, S.toastCount - 1);
    };
    if (action) {
      const btn = el("button", { class: "toast-action", type: "button", text: action.label });
      btn.addEventListener("click", () => { kill(); action.run(); });
      node.appendChild(btn);
    }
    box.appendChild(node);
    S.toastCount += 1;
    setTimeout(kill, kind === "error" ? 4200 : action ? 5200 : 2200);
  }

  // 写盘失败：只用 toast 报一次，不再有底部状态栏这类冗余面板
  function reportSaveError() {
    const err = T.Store.lastError;
    toast(t("storageError", { msg: (err && (err.message || String(err))) || "quota" }), "error");
  }

  /* ── 任务创建 / 勾选 ──────────────────────────────── */
  function defaultGroupId(explicit) {
    if (explicit) return explicit;
    if (S.scope.kind === "group" && groupById(S.scope.gid)) return S.scope.gid;
    const open = groups().filter((g) => tasks().some((x) => x.groupId === g.id && !x.done))[0];
    return open ? open.id : groups()[0].id;
  }

  function createTask(explicitGroupId, date) {
    if (!groups().length) return null;
    const gid = defaultGroupId(explicitGroupId);
    const task = T.emptyTask(gid, date);
    tasks().push(task);
    T.Store.touchGroup(gid);
    scheduleRender();
    openSheet(task, true);
    return task;
  }

  function toggleTask(task, force) {
    const next = typeof force === "boolean" ? force : !task.done;
    const wasDone = task.done;
    T.setTaskDone(task, next);
    let spawned = null;
    if (next) {
      spawned = T.spawnNext(task);
      if (spawned) {
        tasks().push(spawned);
        T.Store.touchGroup(spawned.groupId);
      }
    }
    touch(task);
    scheduleRender();
    if (S.sheet && S.sheet.task === task) syncSheet();
    if (!next || wasDone) return;

    let text = t("completedToast", { title: task.title.trim() || t("sheetTitleEmpty") });
    if (spawned) {
      const d = spawned.startDate || spawned.dueDate;
      text += " · " + t("nextRunHint", { date: d ? fmtDate(d) : "" });
    }
    toast(text, "ok", {
      label: t("undo"),
      run: () => {
        T.setTaskDone(task, false);
        if (spawned && tasks().indexOf(spawned) >= 0) removeTask(spawned);
        touch(task);
        scheduleRender();
        if (S.sheet && S.sheet.task === task) syncSheet();
      }
    });
  }

  function toggleChild(task, kind, cid) {
    const list = kind === "milestone" ? task.milestones : task.subtasks;
    const item = list.filter((x) => x.id === cid)[0];
    if (!item) return;
    T.setChildDone(task, kind, cid, !item.done);
    touch(task);
    scheduleRender();
    if (S.sheet && S.sheet.task === task) { syncSheet(); renderEntries(task); }
  }

  /* ── 右键式菜单 ──────────────────────────────────── */
  function closeMenu() {
    const root = $("menu-root");
    root.hidden = true;
    clear(root);
    S.menuOpen = false;
  }

  function showMenu(x, y, items) {
    closeMenu();
    const root = $("menu-root");
    const menu = el("div", { class: "menu" });
    items.forEach((it) => {
      if (it.sep) { menu.appendChild(el("div", { class: "menu-sep" })); return; }
      if (it.swatches) {
        const row = el("div", { class: "menu-swatches" });
        it.swatches.forEach((c) => {
          const b = el("button", { class: "swatch", type: "button", dataset: { color: c } });
          b.style.background = c;
          b.setAttribute("aria-pressed", it.active === c ? "true" : "false");
          b.addEventListener("click", (e) => { e.stopPropagation(); closeMenu(); it.action(c); });
          row.appendChild(b);
        });
        menu.appendChild(row);
        return;
      }
      const b = el("button", { class: "menu-item" + (it.danger ? " danger" : ""), type: "button", text: it.label });
      if (it.disabled) b.setAttribute("disabled", "");
      b.addEventListener("click", (e) => { e.stopPropagation(); closeMenu(); it.action(); });
      menu.appendChild(b);
    });
    root.hidden = false;
    root.appendChild(menu);
    const rect = menu.getBoundingClientRect();
    menu.style.left = Math.max(6, Math.min(x, window.innerWidth - rect.width - 8)) + "px";
    menu.style.top = Math.max(6, Math.min(y, window.innerHeight - rect.height - 8)) + "px";
    S.menuOpen = true;
    setTimeout(() => {
      const off = () => { closeMenu(); root.removeEventListener("click", off); };
      root.addEventListener("click", off);
    }, 0);
  }

  /* ── 对话框 ──────────────────────────────────────── */
  function closeDialog() {
    const root = $("dialog-root");
    root.hidden = true;
    clear(root);
    // 关对话框（含 Esc / 点遮罩）时把挂起的 Promise 结掉，避免 await 永远悬着
    if (S.dialogResolve) { const fn = S.dialogResolve; S.dialogResolve = null; fn(null); }
  }

  function openDialog(card) {
    const root = $("dialog-root");
    clear(root);
    root.appendChild(card);
    root.hidden = false;
    const focusable = card.querySelector("input, textarea, select, button");
    if (focusable) setTimeout(() => focusable.focus(), 30);
  }

  function askConfirm(opts) {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        S.dialogResolve = null;
        closeDialog();
        resolve(value);
      };
      S.dialogResolve = finish;
      const card = el("div", { class: "dialog" });
      card.appendChild(el("h2", { text: opts.title }));
      if (opts.body) card.appendChild(el("p", { text: opts.body }));
      const actions = el("div", { class: "dlg-actions" });
      const cancel = el("button", { class: "btn", type: "button", text: opts.cancel || t("cancel") });
      const ok = el("button", { class: "btn " + (opts.danger ? "btn-danger" : "btn-primary"), type: "button", text: opts.ok || t("confirm") });
      cancel.addEventListener("click", () => finish(false));
      ok.addEventListener("click", () => finish(true));
      actions.appendChild(cancel);
      actions.appendChild(ok);
      card.appendChild(actions);
      openDialog(card);
    });
  }

  function askText(opts) {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        S.dialogResolve = null;
        closeDialog();
        resolve(value);
      };
      S.dialogResolve = finish;
      const card = el("div", { class: "dialog" });
      card.appendChild(el("h2", { text: opts.title }));
      const body = el("div", { class: "dlg-body" });
      body.appendChild(el("span", { class: "field-label", text: opts.label || "" }));
      const input = el("input", { class: "input", type: "text", value: opts.value || "", placeholder: opts.placeholder || "" });
      body.appendChild(input);
      if (opts.hint) body.appendChild(el("div", { class: "hint", text: opts.hint }));
      card.appendChild(body);
      const actions = el("div", { class: "dlg-actions" });
      const cancel = el("button", { class: "btn", type: "button", text: t("cancel") });
      const ok = el("button", { class: "btn btn-primary", type: "button", text: t("confirm") });
      const submit = () => finish(input.value.trim() || null);
      cancel.addEventListener("click", () => finish(null));
      ok.addEventListener("click", submit);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); submit(); }
      });
      actions.appendChild(cancel);
      actions.appendChild(ok);
      card.appendChild(actions);
      openDialog(card);
    });
  }

  /* ── 分组管理 ────────────────────────────────────── */
  async function addGroup() {
    const name = await askText({ title: t("groupNewTitle"), label: t("groupNameLabel"), placeholder: t("groupNewTitle") });
    if (!name) return;
    const used = groups().map((g) => g.color);
    const color = T.COLORS.filter((c) => used.indexOf(c) < 0)[0] || T.COLORS[groups().length % T.COLORS.length];
    groups().push({ id: T.newId("g"), name, color, collapsed: false, order: groups().length });
    T.Store.touchMeta();
    scheduleRender();
  }

  async function renameGroup(g) {
    const name = await askText({ title: t("groupRenameTitle"), label: t("groupNameLabel"), value: g.name });
    if (!name) return;
    g.name = name;
    T.Store.touchMeta();
    scheduleRender();
  }

  function moveGroup(g, delta) {
    const list = groups();
    const i = list.indexOf(g);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= list.length) return;
    list.splice(i, 1);
    list.splice(j, 0, g);
    list.forEach((x, k) => { x.order = k; });
    T.Store.touchMeta();
    scheduleRender();
  }

  async function deleteGroup(g) {
    const others = groups().filter((x) => x.id !== g.id);
    if (!others.length) { toast(t("lastGroup"), "error"); return; }
    const target = others[0];
    const n = tasks().filter((x) => x.groupId === g.id).length;
    const ok = await askConfirm({
      title: t("groupDeleteTitle"),
      body: t("groupDeleteBody", { name: g.name, n, target: target.name }),
      ok: t("delete"), danger: true
    });
    if (!ok) return;
    tasks().filter((x) => x.groupId === g.id).forEach((x) => { x.groupId = target.id; T.Store.touchGroup(target.id); });
    const idx = groups().indexOf(g);
    groups().splice(idx, 1);
    groups().forEach((x, k) => { x.order = k; });
    T.Store.markGroupDead(g.id);
    T.Store.touchMeta();
    if (S.scope.kind === "group" && S.scope.gid === g.id) S.scope = { kind: "all", gid: null };
    savePrefs();
    scheduleRender();
  }

  function openGroupMenu(g, x, y) {
    const list = groups();
    const i = list.indexOf(g);
    showMenu(x, y, [
      { label: t("menuRename"), action: () => renameGroup(g) },
      { sep: true },
      { swatches: T.COLORS, active: g.color, action: (c) => { g.color = c; T.Store.touchMeta(); scheduleRender(); } },
      { sep: true },
      { label: t("menuMoveUp"), disabled: i === 0, action: () => moveGroup(g, -1) },
      { label: t("menuMoveDown"), disabled: i === list.length - 1, action: () => moveGroup(g, 1) },
      { sep: true },
      { label: t("menuDelete"), danger: true, action: () => deleteGroup(g) }
    ]);
  }

  /* ── 任务详情面板 ────────────────────────────────── */
  function field(label, children) {
    return el("div", { class: "field" }, [el("span", { class: "field-label", text: label })].concat(children));
  }

  function openSheet(task, focusTitle) {
    const root = $("modal-root");
    clear(root);
    root.hidden = false;
    const refs = {};
    S.sheet = { task, refs };

    const sheet = el("div", { class: "sheet" });
    const head = el("div", { class: "sheet-head" });
    const title = el("input", { class: "sheet-title", type: "text", value: task.title, placeholder: t("sheetTitlePh") });
    title.addEventListener("input", () => {
      task.title = title.value;
      touch(task);
      scheduleRender();
      renderEntries(task);
    });
    title.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); title.blur(); }
    });
    refs.title = title;
    const closeBtn = el("button", { class: "icon-btn", type: "button", text: "✕" });
    closeBtn.setAttribute("title", t("close"));
    closeBtn.addEventListener("click", closeSheet);
    head.appendChild(title);
    head.appendChild(closeBtn);
    sheet.appendChild(head);

    const body = el("div", { class: "sheet-body scroll" });

    // 分组 + 优先级
    const groupSel = el("select", { class: "select grow" });
    groups().forEach((g) => {
      const opt = el("option", { value: g.id, text: g.name });
      if (g.id === task.groupId) opt.selected = true;
      groupSel.appendChild(opt);
    });
    groupSel.addEventListener("change", () => {
      const oldGid = task.groupId;
      task.groupId = groupSel.value;
      T.Store.touchGroup(oldGid);
      touch(task);
      scheduleRender();
    });
    const priSel = el("select", { class: "select grow" });
    T.PRIORITIES.forEach((p) => {
      const opt = el("option", { value: p, text: priorityLabel(p) });
      if (p === task.priority) opt.selected = true;
      priSel.appendChild(opt);
    });
    priSel.addEventListener("change", () => { task.priority = priSel.value; touch(task); scheduleRender(); });
    body.appendChild(el("div", { class: "row" }, [
      field(t("groupLabel"), [groupSel]),
      field(t("priorityLabel"), [priSel])
    ]));

    // 起止时间
    const startDate = el("input", { class: "input", type: "date", value: task.startDate || "" });
    const dueDate = el("input", { class: "input", type: "date", value: task.dueDate || "" });
    const startTime = el("input", { class: "input", type: "time", value: task.startTime || "09:00" });
    const dueTime = el("input", { class: "input", type: "time", value: task.dueTime || "18:00" });
    const allDay = el("input", { type: "checkbox" });
    allDay.checked = task.allDay;
    const allDayLabel = el("label", { class: "check-inline" }, [allDay, el("span", { text: t("allDay") })]);
    const startTimeWrap = el("div", { class: "row", }, [startTime]);
    const dueTimeWrap = el("div", { class: "row" }, [dueTime]);
    startTimeWrap.hidden = task.allDay;
    dueTimeWrap.hidden = task.allDay;

    startDate.addEventListener("change", () => {
      task.startDate = T.isDate(startDate.value) ? startDate.value : null;
      touch(task); scheduleRender(); syncRepeat();
    });
    dueDate.addEventListener("change", () => {
      task.dueDate = T.isDate(dueDate.value) ? dueDate.value : null;
      touch(task); scheduleRender(); syncRepeat();
    });
    startTime.addEventListener("change", () => { task.startTime = startTime.value || "09:00"; touch(task); scheduleRender(); });
    dueTime.addEventListener("change", () => { task.dueTime = dueTime.value || "18:00"; touch(task); scheduleRender(); });
    allDay.addEventListener("change", () => {
      task.allDay = allDay.checked;
      startTimeWrap.hidden = task.allDay;
      dueTimeWrap.hidden = task.allDay;
      touch(task); scheduleRender();
    });

    body.appendChild(field(t("timeLabel"), [
      el("div", { class: "row" }, [
        el("span", { class: "field-label", text: t("startLabel") }), startDate, startTimeWrap,
        allDayLabel
      ]),
      el("div", { class: "row" }, [
        el("span", { class: "field-label", text: t("dueLabel") }), dueDate, dueTimeWrap
      ])
    ]));

    // 重复
    const freqSel = el("select", { class: "select" });
    [["none", "freqNone"], ["daily", "freqDaily"], ["weekly", "freqWeekly"], ["monthly", "freqMonthly"], ["yearly", "freqYearly"], ["custom", "freqCustom"]]
      .forEach(([v, k]) => {
        const opt = el("option", { value: v, text: t(k) });
        if ((task.repeat ? task.repeat.freq : "none") === v) opt.selected = true;
        freqSel.appendChild(opt);
      });
    const intervalInput = el("input", { class: "input", type: "number", min: "1", max: "999" });
    intervalInput.style.width = "68px";
    intervalInput.value = String(task.repeat ? task.repeat.interval : 1);
    const unitSel = el("select", { class: "select" });
    [["day", "unitDay"], ["week", "unitWeek"], ["month", "unitMonth"], ["year", "unitYear"]].forEach(([v, k]) => {
      const opt = el("option", { value: v, text: t(k) });
      if (task.repeat && T.repeatUnit(task.repeat) === v) opt.selected = true;
      unitSel.appendChild(opt);
    });
    const intervalRow = el("div", { class: "row" }, [
      el("span", { class: "field-label", text: t("intervalLabel") }),
      intervalInput, unitSel
    ]);
    const wdRow = el("div", { class: "wd-picker" });
    const endSelect = el("select", { class: "select" });
    [["never", "endNever"], ["until", "endUntil"], ["count", "endCount"]].forEach(([v, k]) => {
      const opt = el("option", { value: v, text: t(k) });
      endSelect.appendChild(opt);
    });
    const endDate = el("input", { class: "input", type: "date" });
    const endCount = el("input", { class: "input", type: "number", min: "1", max: "999" });
    endCount.style.width = "76px";
    const endRow = el("div", { class: "row" }, [
      el("span", { class: "field-label", text: t("endLabel") }), endSelect, endDate, endCount
    ]);
    const repeatHint = el("div", { class: "hint" });
    const repeatWrap = el("div", { class: "field" }, [
      el("span", { class: "field-label", text: t("repeatLabel") }),
      el("div", { class: "row" }, [freqSel]),
      intervalRow, wdRow, endRow, repeatHint
    ]);
    body.appendChild(repeatWrap);

    refs.repeat = { freqSel, intervalInput, unitSel, intervalRow, wdRow, endSelect, endDate, endCount, endRow, repeatHint };

    const ensureRepeat = () => {
      if (!task.repeat) task.repeat = T.normalizeRepeat({ freq: "daily", interval: 1, doneCount: 0 });
      return task.repeat;
    };

    freqSel.addEventListener("change", () => {
      if (freqSel.value === "none") {
        task.repeat = null;
      } else {
        const prev = task.repeat || {};
        task.repeat = T.normalizeRepeat({
          freq: freqSel.value,
          unit: freqSel.value === "custom" ? (T.UNITS.indexOf(prev.unit) >= 0 ? prev.unit : "day") : undefined,
          interval: prev.interval || 1,
          weekdays: prev.weekdays || [],
          until: prev.until || null,
          count: prev.count || null,
          doneCount: prev.doneCount || 0
        });
        intervalInput.value = String(task.repeat.interval);
        unitSel.value = T.repeatUnit(task.repeat);
        endDate.value = task.repeat.until || "";
        endCount.value = task.repeat.count ? String(task.repeat.count) : "3";
        endSelect.value = task.repeat.until ? "until" : task.repeat.count ? "count" : "never";
      }
      touch(task); syncRepeat(); scheduleRender();
    });

    intervalInput.addEventListener("change", () => {
      const rep = ensureRepeat();
      rep.interval = Math.max(1, Math.min(999, Math.round(Number(intervalInput.value) || 1)));
      intervalInput.value = String(rep.interval);
      task.repeat = T.normalizeRepeat(rep);
      touch(task); syncRepeat(); scheduleRender();
    });

    unitSel.addEventListener("change", () => {
      const rep = ensureRepeat();
      rep.freq = "custom";
      rep.unit = unitSel.value;
      freqSel.value = "custom";
      task.repeat = T.normalizeRepeat(rep);
      touch(task); syncRepeat(); scheduleRender();
    });

    endSelect.addEventListener("change", () => {
      const rep = ensureRepeat();
      if (endSelect.value === "never") { rep.until = null; rep.count = null; }
      if (endSelect.value === "until" && !rep.until) rep.until = task.dueDate || task.startDate || T.today();
      if (endSelect.value === "count" && !rep.count) rep.count = Math.max(2, rep.doneCount + 2);
      task.repeat = T.normalizeRepeat(rep);
      endDate.value = rep.until || "";
      endCount.value = rep.count ? String(rep.count) : "3";
      touch(task); syncRepeat(); scheduleRender();
    });

    endDate.addEventListener("change", () => {
      const rep = ensureRepeat();
      rep.until = T.isDate(endDate.value) ? endDate.value : null;
      rep.count = rep.until ? null : rep.count;
      task.repeat = T.normalizeRepeat(rep);
      touch(task); syncRepeat(); scheduleRender();
    });

    endCount.addEventListener("change", () => {
      const rep = ensureRepeat();
      rep.count = Math.max(1, Math.min(999, Math.round(Number(endCount.value) || 1)));
      rep.until = null;
      endCount.value = String(rep.count);
      task.repeat = T.normalizeRepeat(rep);
      touch(task); syncRepeat(); scheduleRender();
    });

    // 完成度
    const progressCard = el("div", { class: "progress-card" });
    const pcHead = el("div", { class: "pc-head" });
    const pcPct = el("span", { class: "pc-pct" });
    const pcText = el("span");
    pcHead.appendChild(pcText);
    pcHead.appendChild(pcPct);
    const pcBar = bar(0, true);
    const slider = el("input", { class: "slider", type: "range", min: "0", max: "100", step: "5" });
    const sliderHint = el("div", { class: "hint", text: t("progressManual") });
    slider.addEventListener("input", () => {
      const v = Math.max(0, Math.min(100, Math.round(Number(slider.value) || 0)));
      if (v >= 100 && !task.done) {
        task.progress = 100;
        toggleTask(task, true);
        syncSheet();
        return;
      }
      task.progress = v;
      task.done = false;
      task.completedAt = null;
      touch(task);
      syncSheet();
      scheduleRender();
    });
    progressCard.appendChild(pcHead);
    progressCard.appendChild(pcBar);
    progressCard.appendChild(slider);
    progressCard.appendChild(sliderHint);
    body.appendChild(progressCard);

    // 子任务 / 里程碑
    const subList = el("div", { class: "sub-list" });
    const msList = el("div", { class: "mini-list" });
    const msAdd = el("input", { class: "input", type: "text", placeholder: t("milestonePh") });
    const msAddBtn = el("button", { class: "btn btn-small", type: "button", text: t("addMilestone") });

    function addMilestone(title) {
      if (!title.trim()) return;
      task.milestones.push({ id: T.newId("m"), title: title.trim(), date: null, done: false });
      touch(task);
      renderEntries(task);
      syncSheet();
      scheduleRender();
    }
    msAddBtn.addEventListener("click", () => { addMilestone(msAdd.value); msAdd.value = ""; msAdd.focus(); });
    msAdd.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); msAddBtn.click(); } });

    refs.subList = subList;
    refs.msList = msList;
    refs.subEmpty = el("div", { class: "hint", text: t("subNone") });
    refs.msEmpty = el("div", { class: "hint", text: t("msNone") });

    body.appendChild(field(t("subtasks"), [
      el("div", { class: "sub-head" }, [el("span", { class: "hint", text: t("subTimeHint") }), subtaskSortSelect()]),
      subList, refs.subEmpty, subtaskComposer(task)
    ]));
    body.appendChild(field(t("milestones"), [msList, refs.msEmpty, el("div", { class: "list-add" }, [msAdd, msAddBtn]), el("div", { class: "hint", text: t("milestoneHint") })]));

    // 备注
    const notes = el("textarea", { class: "textarea", placeholder: t("notesPh") });
    notes.value = task.notes || "";
    notes.addEventListener("input", () => { task.notes = notes.value; touch(task); scheduleRender(); });
    body.appendChild(field(t("notes"), [notes]));

    sheet.appendChild(body);

    const foot = el("div", { class: "sheet-foot" });
    const delBtn = el("button", { class: "btn btn-danger", type: "button", text: t("delete") });
    delBtn.addEventListener("click", () => {
      removeTask(task);
      S.sheet = null;
      root.hidden = true;
      clear(root);
      scheduleRender();
    });
    const dupBtn = el("button", { class: "btn", type: "button", text: t("duplicate") });
    dupBtn.addEventListener("click", () => {
      const copy = T.normalizeTask(JSON.parse(JSON.stringify(task)), task.groupId);
      copy.id = T.newId("t");
      copy.done = false;
      copy.completedAt = null;
      copy.subtasks.forEach((s) => { s.done = false; s.id = T.newId("s"); });
      copy.milestones.forEach((m) => { m.done = false; m.id = T.newId("m"); });
      copy.progress = 0;
      copy.seriesId = task.seriesId;
      tasks().push(copy);
      T.Store.touchGroup(copy.groupId);
      closeSheet();
      openSheet(copy, true);
      scheduleRender();
    });
    const spacer = el("div", { class: "spacer" });
    const doneBtn = el("button", { class: "btn btn-primary", type: "button", text: t("close") });
    doneBtn.addEventListener("click", closeSheet);
    foot.appendChild(delBtn);
    foot.appendChild(dupBtn);
    foot.appendChild(spacer);
    foot.appendChild(doneBtn);
    sheet.appendChild(foot);

    root.appendChild(sheet);
    syncRepeat();
    syncSheet();
    renderEntries(task);

    if (focusTitle) setTimeout(() => title.focus(), 30);
  }

  function renderEntries(task) {
    const sh = S.sheet;
    if (!sh || sh.task !== task) return;
    const { subList, msList, subEmpty, msEmpty } = sh.refs;
    clear(subList);
    clear(msList);
    sortedSubtasks(task).forEach((sub) => subList.appendChild(subtaskRow(sub, task)));
    task.milestones.forEach((m) => msList.appendChild(sheetRow("milestone", m, task)));
    subEmpty.hidden = task.subtasks.length > 0;
    msEmpty.hidden = task.milestones.length > 0;
  }

  // 详情面板里的一行检查点：可编辑标题、可删；里程碑多一个日期
  function sheetRow(kind, item, task) {
    const isMs = kind === "milestone";
    const row = el("div", { class: "entry-row", dataset: { kind, cid: item.id } });
    const check = el("button", { class: "mini-check" + (isMs ? " ms" : ""), type: "button", dataset: { act: "sheet-child", tid: task.id, kind, cid: item.id } });
    check.setAttribute("aria-checked", item.done ? "true" : "false");
    check.textContent = "✓";
    row.appendChild(check);

    const title = el("input", { class: "input-flat", type: "text", value: item.title, placeholder: isMs ? t("milestonePh") : t("subtaskPh") });
    title.addEventListener("input", () => { item.title = title.value; touch(task); scheduleRender(); });
    row.appendChild(title);

    if (isMs) {
      const date = el("input", { class: "date-flat", type: "date", value: item.date || "" });
      date.addEventListener("change", () => {
        item.date = T.isDate(date.value) ? date.value : null;
        touch(task); scheduleRender();
      });
      row.appendChild(date);
    }

    const del = el("button", { class: "del", type: "button", text: "✕" });
    del.addEventListener("click", () => {
      const list = isMs ? task.milestones : task.subtasks;
      const i = list.indexOf(item);
      if (i >= 0) list.splice(i, 1);
      T.syncDoneFromChildren(task);
      touch(task); renderEntries(task); syncSheet(); scheduleRender();
    });
    row.appendChild(del);
    return row;
  }

  function syncSheet() {
    const sh = S.sheet;
    if (!sh) return;
    const task = sh.task;
    const pr = T.progressOf(task);
    const root = $("modal-root");
    if (!root) return;
    const pct = root.querySelector(".pc-pct");
    const pcText = root.querySelector(".pc-head span");
    const fill = root.querySelector(".progress-card .bar > i");
    const slider = root.querySelector(".progress-card .slider");
    const sliderHint = root.querySelector(".progress-card .hint");
    const cp = T.checkpointStats(task);
    if (pct) pct.textContent = pr.percent + "%";
    if (pcText) pcText.textContent = cp.total ? t("progressCp", { done: cp.done, total: cp.total }) : t("progressTitle");
    if (fill) fill.style.width = pr.percent + "%";
    if (slider) {
      slider.hidden = cp.total > 0;
      slider.value = String(pr.percent);
    }
    if (sliderHint) sliderHint.hidden = cp.total > 0;
    const titleInput = sh.refs.title;
    if (titleInput && document.activeElement !== titleInput) titleInput.value = task.title;
  }

  function syncRepeat() {
    const sh = S.sheet;
    if (!sh || !sh.refs.repeat) return;
    const task = sh.task, r = sh.refs.repeat;
    const rep = task.repeat;
    const active = !!rep;
    r.intervalRow.hidden = !active;
    r.wdRow.hidden = !(active && T.repeatUnit(rep) === "week");
    r.endRow.hidden = !active;
    r.repeatHint.className = "hint";
    if (!active) {
      r.repeatHint.textContent = "";
      // 星期按钮清空
      clear(r.wdRow);
      return;
    }
    r.intervalInput.value = String(rep.interval);
    r.unitSel.value = T.repeatUnit(rep);
    r.unitSel.disabled = rep.freq !== "custom";
    r.endSelect.value = rep.until ? "until" : rep.count ? "count" : "never";
    r.endDate.hidden = r.endSelect.value !== "until";
    r.endCount.hidden = r.endSelect.value !== "count";
    r.endDate.value = rep.until || "";
    r.endCount.value = rep.count ? String(rep.count) : "";

    clear(r.wdRow);
    if (T.repeatUnit(rep) === "week") {
      const wd = lang().wd;
      for (let i = 0; i < 7; i++) {
        const b = el("button", { class: "wd-btn", type: "button", text: wd[i] });
        b.setAttribute("aria-pressed", rep.weekdays.indexOf(i) >= 0 ? "true" : "false");
        b.addEventListener("click", () => {
          const cur = rep.weekdays.slice();
          const at = cur.indexOf(i);
          if (at >= 0) cur.splice(at, 1); else cur.push(i);
          rep.weekdays = cur.sort();
          task.repeat = T.normalizeRepeat(rep);
          touch(task); syncRepeat(); scheduleRender();
        });
        r.wdRow.appendChild(b);
      }
    }

    const anchor = T.taskAnchor(task);
    if (!anchor) {
      r.repeatHint.textContent = t("repeatNeedsDate");
      r.repeatHint.className = "hint warn";
    } else {
      const next = T.nextRun(anchor, rep);
      const ends = next ? T.repeatEnds(rep, next) : true;
      r.repeatHint.textContent = next && !ends ? t("nextRunHint", { date: fmtDate(next) }) : t("repeatDoneHint");
    }
  }

  function closeSheet() {
    const sh = S.sheet;
    if (!sh) return;
    const task = sh.task;
    const blank = !task.title.trim() && !task.notes.trim() && !task.subtasks.length && !task.milestones.length;
    if (blank && tasks().indexOf(task) >= 0) removeTask(task);
    S.sheet = null;
    const root = $("modal-root");
    root.hidden = true;
    clear(root);
    scheduleRender();
  }

  /* ── 数据对话框 ──────────────────────────────────── */
  function openDataDialog() {
    const card = el("div", { class: "dialog" });
    card.appendChild(el("h2", { text: t("dataTitle") }));

    const body = el("div", { class: "dlg-body" });

    const shell = $("shell");
    const shellRect = shell ? shell.getBoundingClientRect() : { width: 0, height: 0 };
    const shellPos = shell ? window.getComputedStyle(shell).position : "?";
    const inIframe = (function () { try { return window.top !== window.self; } catch (e) { return true; } })();
    const diag = el("div", { class: "hint diag" });
    diag.textContent = [
      "v" + BUILD,
      "innerHeight " + window.innerHeight,
      "docClientHeight " + document.documentElement.clientHeight,
      "shell " + Math.round(shellRect.width) + "×" + Math.round(shellRect.height),
      "display " + (shell ? window.getComputedStyle(shell).display : "?"),
      "rows " + (shell ? window.getComputedStyle(shell).gridTemplateRows : "?"),
      "ws " + Math.round((shell.querySelector(".workspace") || { getBoundingClientRect: () => ({ height: 0 }) }).getBoundingClientRect().height),
      "side " + Math.round((shell.querySelector(".pane-side") || { getBoundingClientRect: () => ({ height: 0 }) }).getBoundingClientRect().height),
      "absfill " + (shell.dataset.absfill || "0"),
      "position " + shellPos,
      inIframe ? "iframe" : "top",
      "surface " + ((window.dbxPlugin && window.dbxPlugin.context && window.dbxPlugin.context.surface) || "?")
    ].join(" · ");
    body.appendChild(diag);

    const weekSel = el("select", { class: "select" });
    [["true", "weekMon"], ["false", "weekSun"]].forEach(([v, k]) => {
      const opt = el("option", { value: v, text: t(k) });
      if (String(!!S.model.prefs.weekMonday) === v) opt.selected = true;
      weekSel.appendChild(opt);
    });
    weekSel.addEventListener("change", () => {
      S.model.prefs.weekMonday = weekSel.value === "true";
      T.Store.touchMeta();
      scheduleRender();
    });
    body.appendChild(field(t("dataWeekStart"), [weekSel]));

    const exportArea = el("textarea", { class: "textarea" });
    exportArea.readOnly = true;
    exportArea.value = exportJson();
    body.appendChild(field(t("dataExport"), [exportArea]));

    const copyBtn = el("button", { class: "btn btn-small", type: "button", text: t("copy") });
    copyBtn.addEventListener("click", async () => {
      const ok = await copyText(exportArea.value);
      toast(ok ? t("dataCopied") : t("dataCopyFail"), ok ? "ok" : "error");
      if (!ok) exportArea.select();
    });
    body.appendChild(el("div", { class: "row" }, [copyBtn]));

    const importArea = el("textarea", { class: "textarea", placeholder: t("dataImportPh") });
    body.appendChild(field(t("dataImport"), [importArea]));
    const importBtn = el("button", { class: "btn btn-small", type: "button", text: t("dataImportBtn") });
    importBtn.addEventListener("click", () => importData(importArea.value));
    body.appendChild(el("div", { class: "row" }, [importBtn]));

    const clearBtn = el("button", { class: "btn btn-small btn-danger", type: "button", text: t("dataClearDone") });
    clearBtn.addEventListener("click", async () => {
      const done = tasks().filter((x) => x.done);
      if (!done.length) { toast(t("exportEmpty")); return; }
      const ok = await askConfirm({ title: t("clearDoneConfirm"), body: t("clearDoneBody", { n: done.length }), ok: t("delete"), danger: true });
      if (!ok) return;
      const byGroup = new Map();
      done.forEach((x) => {
        if (!byGroup.has(x.groupId)) byGroup.set(x.groupId, []);
        byGroup.get(x.groupId).push(x);
      });
      done.forEach(removeTask);
      byGroup.forEach((_v, gid) => T.Store.touchGroup(gid));
      toast(t("cleared", { n: done.length }), "ok");
      scheduleRender();
    });
    body.appendChild(el("div", { class: "row" }, [clearBtn]));

    card.appendChild(body);
    const actions = el("div", { class: "dlg-actions" });
    const closeBtn = el("button", { class: "btn", type: "button", text: t("close") });
    closeBtn.addEventListener("click", closeDialog);
    actions.appendChild(closeBtn);
    card.appendChild(actions);
    openDialog(card);
  }

  function exportJson() {
    return JSON.stringify({
      app: "miko.todo", version: T.VERSION, exportedAt: new Date().toISOString(),
      groups: groups(), tasks: tasks()
    }, null, 2);
  }

  async function copyText(text) {
    const api = window.dbxPlugin;
    try {
      if (api && typeof api.copy === "function") { await api.copy(text); return true; }
      if (api && api.clipboard && typeof api.clipboard.writeText === "function") { await api.clipboard.writeText(text); return true; }
    } catch (e) { /* 降级为手动选择 */ }
    return false;
  }

  async function importData(text) {
    let parsed = null;
    try { parsed = JSON.parse(text); } catch (e) { toast(t("importBad"), "error"); return; }
    if (!parsed || !Array.isArray(parsed.groups) || !Array.isArray(parsed.tasks)) { toast(t("importBad"), "error"); return; }
    const ok = await askConfirm({ title: t("dataImport"), body: t("importWarn"), ok: t("confirm") });
    if (!ok) return;

    const oldIds = groups().map((g) => g.id);
    const next = parsed.groups.map((g, i) => ({
      id: g && g.id ? String(g.id) : T.newId("g"),
      name: g && typeof g.name === "string" && g.name ? g.name : "Group " + (i + 1),
      color: g && T.COLORS.indexOf(g.color) >= 0 ? g.color : T.COLORS[i % T.COLORS.length],
      collapsed: false,
      order: i
    }));
    if (!next.length) next.push({ id: T.newId("g"), name: t("groupInbox"), color: T.COLORS[0], collapsed: false, order: 0 });
    const idSet = new Set(next.map((g) => g.id));
    const fallback = next[0].id;
    const newTasks = parsed.tasks.map((raw) => {
      const gid = raw && raw.groupId && idSet.has(String(raw.groupId)) ? String(raw.groupId) : fallback;
      return T.normalizeTask(raw, gid);
    });

    S.model.groups = next;
    S.model.tasks = newTasks;
    next.forEach((g) => T.Store.touchGroup(g.id));
    oldIds.forEach((gid) => { if (!idSet.has(gid)) T.Store.markGroupDead(gid); });
    T.Store.touchMeta();
    const saved = await T.Store.flush();
    if (!saved) reportSaveError();
    S.scope = { kind: "all", gid: null };
    S.expanded.clear();
    savePrefs();
    closeDialog();
    render();
    toast(t("importDone", { tasks: newTasks.length, groups: next.length }), "ok");
  }

  /* ── 事件绑定 ────────────────────────────────────── */
  function bindEvents() {
    $("btn-new").addEventListener("click", () => createTask());
    $("btn-add-group").addEventListener("click", addGroup);
    $("btn-data").addEventListener("click", openDataDialog);
    $("btn-show-done").addEventListener("click", () => {
      S.showDone = !S.showDone;
      savePrefs();
      scheduleRender();
    });
    $("search").addEventListener("input", (e) => {
      S.q = e.target.value;
      scheduleRender();
    });
    Array.prototype.forEach.call(document.querySelectorAll(".seg-btn"), (b) => {
      b.addEventListener("click", () => {
        S.view = b.dataset.view;
        savePrefs();
        scheduleRender();
      });
    });

    $("cal-prev").addEventListener("click", () => {
      const d = new Date(S.cal.y, S.cal.m - 1, 1);
      S.cal = { y: d.getFullYear(), m: d.getMonth() };
      scheduleRender();
    });
    $("cal-next").addEventListener("click", () => {
      const d = new Date(S.cal.y, S.cal.m + 1, 1);
      S.cal = { y: d.getFullYear(), m: d.getMonth() };
      scheduleRender();
    });
    $("cal-today").addEventListener("click", () => {
      const now = new Date();
      S.cal = { y: now.getFullYear(), m: now.getMonth() };
      scheduleRender();
    });

    $("smart").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-kind]");
      if (!btn) return;
      const kind = btn.dataset.kind;
      S.scope = kind === "all" ? { kind: "all", gid: null } : { kind, gid: null };
      savePrefs();
      scheduleRender();
    });

    $("groups").addEventListener("click", (e) => {
      const menuBtn = e.target.closest("[data-act='group-menu']");
      if (menuBtn) {
        const g = groupById(menuBtn.dataset.gid);
        if (!g) return;
        const rect = menuBtn.getBoundingClientRect();
        openGroupMenu(g, rect.left, rect.bottom + 4);
        return;
      }
      const main = e.target.closest("[data-act='scope-group']");
      if (!main) return;
      const gid = main.dataset.gid;
      const same = S.scope.kind === "group" && S.scope.gid === gid;
      S.scope = same ? { kind: "all", gid: null } : { kind: "group", gid };
      savePrefs();
      scheduleRender();
    });

    $("list-view").addEventListener("click", (e) => {
      const act = e.target.closest("[data-act]");
      if (act) {
        const kind = act.dataset.act;
        if (kind === "toggle") {
          const task = findTask(act.dataset.tid);
          if (task) toggleTask(task);
          return;
        }
        if (kind === "expand") { toggleExpanded(act.dataset.tid); return; }
        if (kind === "edit" || kind === "open") {
          const task = findTask(act.dataset.tid);
          if (task) openSheet(task, false);
          return;
        }
        if (kind === "child-toggle") {
          const task = findTask(act.dataset.tid);
          if (task) toggleChild(task, act.dataset.kind, act.dataset.cid);
          return;
        }
        if (kind === "sub-check") {
          const task = findTask(act.dataset.tid);
          if (!task) return;
          const sub = task.subtasks.filter((x) => x.id === act.dataset.cid)[0];
          if (!sub) return;
          T.setChildDone(task, "subtask", sub.id, !sub.done);
          touch(task);
          refreshSubtaskViews(task);
          return;
        }
        if (kind === "sub-expand") {
          const task = findTask(act.dataset.tid);
          if (task) toggleSubExpand(task, act.dataset.cid);
          return;
        }
        if (kind === "sub-del") {
          const task = findTask(act.dataset.tid);
          if (!task) return;
          const i = task.subtasks.findIndex((x) => x.id === act.dataset.cid);
          if (i < 0) return;
          task.subtasks.splice(i, 1);
          T.syncDoneFromChildren(task);
          touch(task);
          refreshSubtaskViews(task);
          return;
        }
        if (kind === "collapse-group") {
          const g = groupById(act.dataset.gid);
          if (!g) return;
          g.collapsed = !g.collapsed;
          T.Store.touchMeta();
          scheduleRender();
          return;
        }
        if (kind === "new-in-group") { createTask(act.dataset.gid); return; }
        return;
      }
      // 子任务收起态：点标题/空白处展开（标题、箭头自己带 data-act，另加兜底）
      const closedSub = e.target.closest('.sub-row[data-open="false"]');
      if (closedSub && !e.target.closest("input, textarea, select, button, label, .sub-right")) {
        const task = findTask(closedSub.closest(".task") ? closedSub.closest(".task").dataset.tid : "");
        if (task) { toggleSubExpand(task, closedSub.dataset.cid); return; }
      }
      // 空白处：卡片单击展开/收起，分组标题单击折叠
      if (e.target.closest("input, textarea, select, button, label, .task-body")) return;
      const card = e.target.closest(".task");
      if (card) { toggleExpanded(card.dataset.tid); return; }
      const head = e.target.closest(".group-head[data-gid]");
      if (head) {
        const g = groupById(head.dataset.gid);
        if (!g) return;
        g.collapsed = !g.collapsed;
        T.Store.touchMeta();
        scheduleRender();
      }
    });

    $("calendar-view").addEventListener("click", (e) => {
      const chip = e.target.closest(".cal-chip[data-tid]");
      if (chip) {
        const task = findTask(chip.dataset.tid);
        if (task) openSheet(task, false);
        return;
      }
      const cell = e.target.closest(".cal-cell[data-date]");
      if (cell) createTask(null, cell.dataset.date);
    });

    $("list-view").addEventListener("dblclick", (e) => {
      if (e.target.closest("input, textarea, select, button, label, .task-body")) return;
      const card = e.target.closest(".task");
      if (!card) return;
      const task = findTask(card.dataset.tid);
      if (task) openSheet(task, false);
    });

    $("modal-root").addEventListener("click", (e) => {
      if (e.target.id === "modal-root") { closeSheet(); return; }
      const childAct = e.target.closest("[data-act='sheet-child']");
      if (childAct) {
        const task = findTask(childAct.dataset.tid);
        if (task) toggleChild(task, childAct.dataset.kind, childAct.dataset.cid);
        return;
      }
      const subAct = e.target.closest("[data-act='sub-expand']");
      if (subAct) {
        const task = findTask(subAct.dataset.tid);
        if (task) toggleSubExpand(task, subAct.dataset.cid);
      }
    });
    $("dialog-root").addEventListener("click", (e) => {
      if (e.target.id === "dialog-root") closeDialog();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (S.menuOpen) { closeMenu(); return; }
      if (!$("dialog-root").hidden) { closeDialog(); return; }
      if (S.sheet) { closeSheet(); return; }
    });

    window.addEventListener("resize", () => { S.fitPending = true; fitShell(); fillInner(); });
    // 宿主有时在 load 之后才调整 iframe 尺寸，多拟合几次；有 ResizeObserver 就顺手挂上
    [120, 500, 1500].forEach((ms) => setTimeout(() => { S.fitPending = true; fitShell(); }, ms));
    if (typeof ResizeObserver === "function") {
      try {
        new ResizeObserver(() => { S.fitPending = true; fitShell(); }).observe(document.documentElement);
      } catch (e) { /* 旧内核没有就算了 */ }
    }
    window.addEventListener("dbx-plugin-env", (ev) => {
      S.fitPending = true;
      const d = (ev && ev.detail) || {};
      if (d.theme) applyTheme(d.theme);
      if (d.locale) applyLocale(d.locale);
    });
    window.addEventListener("pagehide", () => { T.Store.flush(); });
    window.addEventListener("beforeunload", () => { T.Store.flush(); });
  }

  /* ── 主题 / 语言 ─────────────────────────────────── */
  function applyTheme(theme) {
    const root = document.documentElement;
    const appearance = theme && theme.appearance;
    const prefersDark = !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.dataset.dbxTheme = appearance === "dark" || (appearance === "system" && prefersDark) ? "dark" : "light";
    if (theme && theme.tokens) for (const k in theme.tokens) {
      const v = theme.tokens[k];
      if (typeof v === "string" && v) root.style.setProperty(k, v);
    }
    if (theme && theme.editor && theme.editor.fontFamily) root.style.setProperty("--font-mono", theme.editor.fontFamily);
  }

  function applyLocale(next) {
    LOCALE = String(next || "").toLowerCase().indexOf("zh") === 0 ? "zh" : "en";
    S.locale = LOCALE;
    document.documentElement.lang = LOCALE;
    if (!S.model) return;
    render();
    if (S.sheet) { const task = S.sheet.task; S.sheet = null; openSheet(task, false); }
  }

  /* ── 启动 ────────────────────────────────────────── */
  async function boot() {
    bindEvents();
    document.title = "MIKO.TODO v" + BUILD;
    const api = window.dbxPlugin || null;
    // ?locale=zh|en 只给本地预览和自测用（宿主加载入口时没有查询串），保证断言与截图可复现
    let forcedLocale = "";
    try { forcedLocale = new URLSearchParams(location.search).get("locale") || ""; } catch (e) { /* ignore */ }
    if (api) {
      try { await api.ready; } catch (e) { /* ready 失败也尽量把界面渲染出来 */ }
      applyTheme(api.theme || null);
      applyLocale(forcedLocale || api.locale || navigator.language || "zh");
    } else {
      applyTheme(null);
      applyLocale(forcedLocale || navigator.language || "zh");
    }
    if (!api) {
      // 没有宿主（本地预览）：仍然跑起来，只是不落盘
      $("banner").hidden = false;
      $("banner-text").textContent = t("hostBanner");
    }

    T.Store.init(api);
    const data = await T.Store.load(inlineGroups());
    S.model = data;
    T.Store.touchMeta();

    if (T.Store.memory && api) {
      $("banner").hidden = false;
      $("banner-text").textContent = t("memoryBanner");
    }

    S.view = data.prefs.view === "calendar" ? "calendar" : "list";
    S.showDone = !!data.prefs.showDone;
    const scope = data.prefs.scope || {};
    if (scope.kind === "group" && groupById(scope.gid)) S.scope = { kind: "group", gid: scope.gid };
    else if (["today", "overdue", "week"].indexOf(scope.kind) >= 0) S.scope = { kind: scope.kind, gid: null };
    else S.scope = { kind: "all", gid: null };

    const now = new Date();
    S.cal = { y: now.getFullYear(), m: now.getMonth() };

    $("boot").hidden = true;
    $("shell").hidden = false;
    fitShell();
    render();
    fillInner();

    T.Store.schedule();
    await T.Store.flush();
    if (T.Store.lastError) reportSaveError();

    if (api && typeof api.onContext === "function") {
      try { api.onContext(() => { /* 单实例工作台，无需按连接切换 */ }); } catch (e) { /* ignore */ }
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
