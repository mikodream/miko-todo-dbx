/* MIKO.TODO 待办 —— 数据层
 * 只做四件事：日期/重复规则（纯字符串运算，不碰时区）、任务模型、进度计算、存储分片。
 * 没有任何 DOM 依赖，可以单独在 node 里跑测试。 */
(function (global) {
  "use strict";

  const VERSION = 1;
  const PRIORITIES = ["none", "low", "medium", "high", "urgent"];
  const PRIORITY_RANK = { none: 0, low: 1, medium: 2, high: 3, urgent: 4 };
  const FREQS = ["none", "daily", "weekly", "monthly", "yearly", "custom"];
  const UNITS = ["day", "week", "month", "year"];
  const COLORS = ["#6366f1", "#0ea5e9", "#14b8a6", "#22c55e", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6"];

  /* ── 日期：一律 "YYYY-MM-DD" 本地字符串 ─────────────── */

  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function isDate(s) { return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s); }
  function isTime(s) { return typeof s === "string" && /^\d{2}:\d{2}$/.test(s); }
  function toDate(s) { const p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fromDate(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
  function today(now) { return fromDate(now ? new Date(now) : new Date()); }
  function weekdayOf(s) { return toDate(s).getDay(); }
  function diffDays(a, b) { return Math.round((toDate(b).getTime() - toDate(a).getTime()) / 86400000); }

  function addDays(s, n) {
    const d = toDate(s);
    d.setDate(d.getDate() + n);
    return fromDate(d);
  }

  function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }

  function addMonths(s, n) {
    const d = toDate(s);
    const total = d.getMonth() + n;
    const y = d.getFullYear() + Math.floor(total / 12);
    const m = ((total % 12) + 12) % 12;
    const day = Math.min(d.getDate(), daysInMonth(y, m));
    return fromDate(new Date(y, m, day));
  }

  function addYears(s, n) { return addMonths(s, n * 12); }

  function weekStart(s, mondayFirst) {
    const wd = weekdayOf(s);
    const offset = mondayFirst ? (wd === 0 ? 6 : wd - 1) : wd;
    return addDays(s, -offset);
  }

  // 6x7 月历格子，返回 42 个日期字符串
  function monthGrid(y, m, mondayFirst) {
    const first = fromDate(new Date(y, m, 1));
    const lead = mondayFirst ? (weekdayOf(first) === 0 ? 6 : weekdayOf(first) - 1) : weekdayOf(first);
    const start = addDays(first, -lead);
    const out = [];
    for (let i = 0; i < 42; i++) out.push(addDays(start, i));
    return out;
  }

  /* ── 重复规则 ─────────────────────────────────────── */

  function defaultUnit(freq) {
    if (freq === "weekly") return "week";
    if (freq === "monthly") return "month";
    if (freq === "yearly") return "year";
    return "day";
  }

  function repeatUnit(rep) {
    if (!rep) return "day";
    return rep.freq === "custom" && UNITS.indexOf(rep.unit) >= 0 ? rep.unit : defaultUnit(rep.freq);
  }

  function normalizeRepeat(rep) {
    if (!rep || FREQS.indexOf(rep.freq) < 0 || rep.freq === "none") return null;
    const weekdays = Array.isArray(rep.weekdays)
      ? rep.weekdays.map((d) => Math.round(Number(d))).filter((d, i, arr) => d >= 0 && d <= 6 && arr.indexOf(d) === i).sort()
      : [];
    return {
      freq: rep.freq,
      unit: UNITS.indexOf(rep.unit) >= 0 ? rep.unit : defaultUnit(rep.freq),
      interval: Math.max(1, Math.min(999, Math.round(Number(rep.interval) || 1))),
      weekdays: repeatUnit({ freq: rep.freq, unit: rep.unit }) === "week" ? weekdays : [],
      until: isDate(rep.until) ? rep.until : null,
      count: Number(rep.count) > 0 ? Math.min(9999, Math.round(Number(rep.count))) : null,
      doneCount: Math.max(0, Math.round(Number(rep.doneCount) || 0))
    };
  }

  function nextWeekday(from, interval, weekdays) {
    const anchorWeek = weekStart(from, false);
    let d = from;
    for (let i = 0; i < 400; i++) {
      d = addDays(d, 1);
      if (weekdays.indexOf(weekdayOf(d)) < 0) continue;
      const weeks = Math.round(diffDays(anchorWeek, weekStart(d, false)) / 7);
      if (weeks % interval === 0) return d;
    }
    return addDays(from, interval * 7);
  }

  // 给一个锚点日期，算出下一次该出现的日期
  function nextRun(from, rep) {
    const r = normalizeRepeat(rep);
    if (!r || !isDate(from)) return null;
    const unit = repeatUnit(r), iv = r.interval;
    if (unit === "week" && r.weekdays.length) return nextWeekday(from, iv, r.weekdays);
    if (unit === "day") return addDays(from, iv);
    if (unit === "week") return addDays(from, iv * 7);
    if (unit === "month") return addMonths(from, iv);
    return addYears(from, iv);
  }

  function repeatEnds(rep, nextAnchor) {
    const r = normalizeRepeat(rep);
    if (!r) return true;
    if (r.until && nextAnchor > r.until) return true;
    if (r.count && r.doneCount + 1 >= r.count) return true;
    return false;
  }

  function taskAnchor(task) {
    return isDate(task.startDate) ? task.startDate : isDate(task.dueDate) ? task.dueDate : null;
  }

  /* ── 任务模型 ─────────────────────────────────────── */

  let idSeq = 0;
  function newId(prefix) {
    idSeq += 1;
    return prefix + Date.now().toString(36) + idSeq.toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function nowIso() { return new Date().toISOString(); }

  // ISO ↔ <input type="datetime-local">（都按本地时间理解）
  function toLocalInput(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) + "T" + pad2(d.getHours()) + ":" + pad2(d.getMinutes());
  }
  function fromLocalInput(value) {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  function emptyTask(groupId, date) {
    const base = isDate(date) ? date : null;
    return {
      id: newId("t"), groupId, title: "", notes: "",
      priority: "none",
      startDate: base, startTime: "09:00",
      dueDate: base, dueTime: "18:00",
      allDay: true,
      done: false, completedAt: null, progress: 0,
      subtasks: [], milestones: [],
      repeat: null, seriesId: null, occurrence: 0,
      createdAt: nowIso(), updatedAt: nowIso()
    };
  }

  // 子任务：可带自己的优先级、进度、开始时间、完成时间与用时（分钟）
  function normalizeSubtask(raw) {
    const s = raw || {};
    const done = !!s.done;
    return {
      id: s.id ? String(s.id) : newId("s"),
      title: typeof s.title === "string" ? s.title : "",
      done,
      priority: PRIORITIES.indexOf(s.priority) >= 0 ? s.priority : "none",
      progress: done ? 100 : Math.max(0, Math.min(100, Math.round(Number(s.progress) || 0))),
      startDate: isDate(s.startDate) ? s.startDate : null,
      startTime: isTime(s.startTime) ? s.startTime : null,
      doneAt: typeof s.doneAt === "string" && s.doneAt ? s.doneAt : null,
      minutes: Number(s.minutes) > 0 ? Math.round(Number(s.minutes)) : null,
      sortIndex: Number.isFinite(Number(s.sortIndex)) ? Number(s.sortIndex) : null,
      createdAt: s.createdAt ? String(s.createdAt) : nowIso()
    };
  }

  function newSubtask(title) {
    return normalizeSubtask({ title: typeof title === "string" ? title : "" });
  }

  function normalizeTask(raw, groupId) {
    const t = Object.assign(emptyTask(groupId, null), raw || {});
    t.groupId = raw && raw.groupId ? String(raw.groupId) : groupId;
    t.priority = PRIORITIES.indexOf(t.priority) >= 0 ? t.priority : "none";
    t.title = typeof t.title === "string" ? t.title : "";
    t.notes = typeof t.notes === "string" ? t.notes : "";
    t.startDate = isDate(t.startDate) ? t.startDate : null;
    t.dueDate = isDate(t.dueDate) ? t.dueDate : null;
    t.startTime = isTime(t.startTime) ? t.startTime : "09:00";
    t.dueTime = isTime(t.dueTime) ? t.dueTime : "18:00";
    t.allDay = t.allDay !== false;
    t.done = !!t.done;
    t.progress = Math.max(0, Math.min(100, Math.round(Number(t.progress) || 0)));
    t.subtasks = (Array.isArray(t.subtasks) ? t.subtasks : []).map(normalizeSubtask);
    t.milestones = (Array.isArray(t.milestones) ? t.milestones : []).map((m) => ({
      id: m && m.id ? String(m.id) : newId("m"),
      title: m && typeof m.title === "string" ? m.title : "",
      date: m && isDate(m.date) ? m.date : null,
      done: !!(m && m.done)
    }));
    t.repeat = normalizeRepeat(t.repeat);
    t.seriesId = t.seriesId ? String(t.seriesId) : null;
    t.occurrence = Math.max(0, Math.round(Number(t.occurrence) || 0));
    return t;
  }

  function checkpointStats(task) {
    const subs = task.subtasks || [], ms = task.milestones || [];
    const total = subs.length + ms.length;
    const done = subs.filter((s) => s.done).length + ms.filter((m) => m.done).length;
    let sum = 0;
    subs.forEach((s) => { sum += s.done ? 100 : Math.max(0, Math.min(100, Math.round(Number(s.progress) || 0))); });
    ms.forEach((m) => { sum += m.done ? 100 : 0; });
    return { total, done, percent: total ? Math.round(sum / total) : 0 };
  }

  // 有检查点就看检查点，没有才用手动进度；done 永远显示 100%
  function progressOf(task) {
    const cp = checkpointStats(task);
    if (task.done) return { percent: 100, done: cp.total, total: cp.total, mode: cp.total ? "checkpoints" : "manual" };
    if (cp.total > 0) return { percent: cp.percent, done: cp.done, total: cp.total, mode: "checkpoints" };
    const p = Math.max(0, Math.min(100, Math.round(Number(task.progress) || 0)));
    return { percent: p, done: 0, total: 0, mode: "manual" };
  }

  // 父任务完成 / 撤销后，把 done 与检查点、进度对齐
  function syncDoneFromChildren(task) {
    const cp = checkpointStats(task);
    if (cp.total === 0) {
      if (task.done) task.progress = 100;
      return;
    }
    const all = cp.done === cp.total;
    task.done = all;
    task.completedAt = all ? task.completedAt || nowIso() : null;
    task.progress = cp.percent;
  }

  function setChildDone(task, kind, childId, value) {
    const list = kind === "milestone" ? task.milestones : task.subtasks;
    const item = list.filter((x) => x.id === childId)[0];
    if (!item) return false;
    item.done = !!value;
    if (kind === "subtask") {
      item.progress = item.done ? 100 : 0;
      item.doneAt = item.done ? item.doneAt || nowIso() : null;
    }
    syncDoneFromChildren(task);
    return true;
  }

  // 拖动子任务进度：100% 即完成；取消完成时清掉完成时间
  function setSubtaskProgress(task, subId, value) {
    const sub = (task.subtasks || []).filter((s) => s.id === subId)[0];
    if (!sub) return false;
    const v = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
    sub.progress = v;
    sub.done = v >= 100;
    sub.doneAt = sub.done ? sub.doneAt || nowIso() : null;
    syncDoneFromChildren(task);
    return true;
  }

  // 用时：手填优先，否则按 开始 → 完成 计算
  function subtaskMinutes(sub) {
    if (sub && Number(sub.minutes) > 0) return Math.round(Number(sub.minutes));
    if (!sub || !sub.doneAt) return null;
    if (!sub.startDate) return null;
    const start = new Date(sub.startDate + "T" + (sub.startTime || "09:00"));
    const end = new Date(sub.doneAt);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    const mins = Math.round((end.getTime() - start.getTime()) / 60000);
    return mins > 0 ? mins : null;
  }

  // 子任务排序：priority = 优先级降序（同级按创建时间），created = 创建时间升序
  function compareSubtasks(mode) {
    return function (a, b) {
      if (mode === "created") return String(a.createdAt || "") < String(b.createdAt || "") ? -1 : 1;
      const pa = PRIORITY_RANK[a.priority] || 0, pb = PRIORITY_RANK[b.priority] || 0;
      if (pa !== pb) return pb - pa;
      return String(a.createdAt || "") < String(b.createdAt || "") ? -1 : 1;
    };
  }

  // 勾选/取消父任务与检查点保持对称：勾上全部勾上，取消全部取消。
  // 这样不会出现「没完成但进度 100%」的自相矛盾状态。
  function setTaskDone(task, value) {
    task.done = !!value;
    task.completedAt = task.done ? nowIso() : null;
    (task.subtasks || []).forEach((s) => { s.done = task.done; });
    (task.milestones || []).forEach((m) => { m.done = task.done; });
    task.progress = task.done ? 100 : 0;
  }

  // 完成一个重复任务时，生成下一次的实例；不满足结束条件才生成
  function spawnNext(task) {
    const rep = normalizeRepeat(task.repeat);
    if (!rep) return null;
    const anchor = taskAnchor(task);
    if (!anchor) return null;
    const nextAnchor = nextRun(anchor, rep);
    if (!nextAnchor) return null;
    if (repeatEnds(rep, nextAnchor)) return null;
    const delta = diffDays(anchor, nextAnchor);
    const clone = normalizeTask({
      groupId: task.groupId,
      title: task.title, notes: task.notes, priority: task.priority,
      startDate: task.startDate ? addDays(task.startDate, delta) : null,
      dueDate: task.dueDate ? addDays(task.dueDate, delta) : null,
      startTime: task.startTime, dueTime: task.dueTime, allDay: task.allDay,
      done: false, completedAt: null, progress: 0,
      subtasks: (task.subtasks || []).map((s) => normalizeSubtask({ title: s.title, priority: s.priority })),
      milestones: (task.milestones || []).map((m) => ({
        title: m.title, done: false, date: m.date ? addDays(m.date, delta) : null
      })),
      repeat: Object.assign({}, rep, { doneCount: rep.doneCount + 1 }),
      seriesId: task.seriesId || task.id,
      occurrence: (task.occurrence || 0) + 1
    }, task.groupId);
    clone.id = newId("t");
    return clone;
  }

  function coversDate(task, date) {
    const s = task.startDate, e = task.dueDate;
    if (s && e) return s <= date && date <= e;
    if (s) return s === date;
    if (e) return e === date;
    return false;
  }

  function compareTasks(a, b) {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const pa = PRIORITY_RANK[a.priority] || 0, pb = PRIORITY_RANK[b.priority] || 0;
    if (pa !== pb) return pb - pa;
    const da = a.dueDate || a.startDate || "9999-12-31";
    const db = b.dueDate || b.startDate || "9999-12-31";
    if (da !== db) return da < db ? -1 : 1;
    return String(a.createdAt || "") < String(b.createdAt || "") ? -1 : 1;
  }

  function statsOf(tasks) {
    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    const sum = tasks.reduce((acc, t) => acc + progressOf(t).percent, 0);
    return { total, done, open: total - done, percent: total ? Math.round(sum / total) : 0 };
  }

  /* ── 存储：meta + 每组一个 key ────────────────────── */

  const Store = {
    kv: null, memory: false, model: null,
    dirtyGroups: new Set(), deadGroups: new Set(),
    metaDirty: false, timer: null, lastError: null, retrying: false,

    init(api) {
      const plugin = api || {};
      const caps = plugin.capabilities || {};
      if (plugin.storage && caps.storage) {
        this.kv = plugin.storage;
      } else {
        this.memory = true;
        const mem = new Map();
        this.kv = {
          get: (k) => Promise.resolve(mem.has(k) ? JSON.parse(mem.get(k)) : null),
          set: (k, v) => { mem.set(k, JSON.stringify(v == null ? null : v)); return Promise.resolve(); },
          delete: (k) => { mem.delete(k); return Promise.resolve(); }
        };
      }
    },

    async get(key) {
      try { return await this.kv.get(key); }
      catch (e) { this.lastError = e; return null; }
    },

    async put(key, value) {
      try { await this.kv.set(key, value); return true; }
      catch (e) { this.lastError = e; return false; }
    },

    metaKey: "meta",
    tasksKey(gid) { return "tasks." + gid; },

    async load(defaults) {
      const meta = (await this.get(this.metaKey)) || {};
      const groupList = Array.isArray(meta.groups) && meta.groups.length ? meta.groups : defaults.groups;
      const groups = groupList.map((g, i) => ({
        id: g && g.id ? String(g.id) : newId("g"),
        name: g && typeof g.name === "string" && g.name ? g.name : "Group " + (i + 1),
        color: g && COLORS.indexOf(g.color) >= 0 ? g.color : COLORS[i % COLORS.length],
        collapsed: !!(g && g.collapsed),
        order: i
      }));
      const prefs = Object.assign({ view: "list", showDone: false, weekMonday: true, subtaskSort: "priority", scope: { kind: "all", gid: null } }, meta.prefs || {});
      const tasks = [];
      for (const g of groups) {
        const raw = await this.get(this.tasksKey(g.id));
        if (!Array.isArray(raw)) continue;
        raw.forEach((t) => tasks.push(normalizeTask(t, g.id)));
      }
      this.model = { groups, tasks, prefs };
      return this.model;
    },

    touchGroup(gid) { if (gid) this.dirtyGroups.add(gid); this.schedule(); },
    touchMeta() { this.metaDirty = true; this.schedule(); },
    markGroupDead(gid) { if (gid) { this.deadGroups.add(gid); this.dirtyGroups.delete(gid); this.schedule(); } },

    schedule() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => { this.flush(); }, 250);
    },

    async flush() {
      clearTimeout(this.timer);
      this.timer = null;
      const model = this.model;
      if (!model) return true;
      let ok = true;
      // 写成功才清 dirty：失败的键留着，等一下重试，不丢改动
      if (this.metaDirty) {
        const wrote = await this.put(this.metaKey, { version: VERSION, groups: model.groups, prefs: model.prefs });
        if (wrote) this.metaDirty = false; else ok = false;
      }
      for (const gid of Array.from(this.dirtyGroups)) {
        const list = model.tasks.filter((t) => t.groupId === gid);
        const wrote = await this.put(this.tasksKey(gid), list);
        if (wrote) this.dirtyGroups.delete(gid); else ok = false;
      }
      for (const gid of Array.from(this.deadGroups)) {
        this.deadGroups.delete(gid);
        try { await this.kv.delete(this.tasksKey(gid)); } catch (e) { this.lastError = e; ok = false; }
      }
      if (ok) this.lastError = null;
      else if (!this.retrying) {
        this.retrying = true;
        setTimeout(() => { this.retrying = false; this.flush(); }, 4000);
      }
      return ok;
    }
  };

  global.MikoTodoStore = {
    VERSION, PRIORITIES, PRIORITY_RANK, FREQS, UNITS, COLORS,
    isDate, isTime, toDate, fromDate, today, addDays, addMonths, addYears, toLocalInput, fromLocalInput,
    weekdayOf, diffDays, weekStart, monthGrid, daysInMonth,
    normalizeRepeat, repeatUnit, nextRun, repeatEnds, taskAnchor,
    newId, emptyTask, normalizeTask, normalizeSubtask, newSubtask,
    checkpointStats, progressOf, syncDoneFromChildren, setChildDone, setSubtaskProgress, setTaskDone,
    subtaskMinutes, compareSubtasks, spawnNext,
    coversDate, compareTasks, statsOf,
    Store
  };
})(typeof window !== "undefined" ? window : globalThis);
