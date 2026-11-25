/* MIKO.TODO 数据层断言：node dev/store.test.js
 * 只测 store.js（无 DOM 依赖）：日期推进、月末与闰年、重复规则、结束条件、进度、派生。 */
"use strict";

const assert = require("assert");
require("../ui/store.js");
const T = globalThis.MikoTodoStore;

let pass = 0;
const queue = [];
function check(name, fn) { queue.push([name, fn]); }

async function run() {
  for (const [name, fn] of queue) {
    try { await fn(); pass += 1; console.log("PASS " + name); }
    catch (e) { console.log("FAIL " + name + " → " + e.message); process.exitCode = 1; }
  }
  console.log((process.exitCode ? "有失败" : "全部通过") + "：共 " + pass + " 组断言");
}

/* 日期 */
check("addDays 跨月", () => assert.equal(T.addDays("2026-01-31", 1), "2026-02-01"));
check("addMonths 月末夹取", () => assert.equal(T.addMonths("2026-01-31", 1), "2026-02-28"));
check("addMonths 闰年", () => assert.equal(T.addMonths("2024-01-31", 1), "2024-02-29"));
check("addYears 闰日", () => assert.equal(T.addYears("2024-02-29", 1), "2025-02-28"));
check("diffDays", () => assert.equal(T.diffDays("2026-11-25", "2026-12-01"), 6));
check("weekdayOf", () => assert.equal(T.weekdayOf("2026-11-25"), 3));
check("weekStart 周一", () => assert.equal(T.weekStart("2026-11-25", true), "2026-11-23"));
check("weekStart 周日", () => assert.equal(T.weekStart("2026-11-25", false), "2026-11-22"));
check("monthGrid 42 格且周一开头", () => {
  const grid = T.monthGrid(2026, 10, true);
  assert.equal(grid.length, 42);
  assert.equal(grid[0], "2026-10-26");
  assert.equal(grid[41], "2026-12-06");
});
check("monthGrid 周日开头", () => assert.equal(T.monthGrid(2026, 10, false)[0], "2026-11-01"));

/* 重复规则 */
const next = (from, rep) => T.nextRun(from, T.normalizeRepeat(rep));
check("每天", () => assert.equal(next("2026-11-25", { freq: "daily" }), "2026-11-26"));
check("每 3 天", () => assert.equal(next("2026-11-25", { freq: "daily", interval: 3 }), "2026-11-28"));
check("每周固定星期（周三→下周一）", () => assert.equal(next("2026-11-25", { freq: "weekly", weekdays: [1, 3] }), "2026-11-30"));
check("每周固定星期（下周一到下周三）", () => assert.equal(next("2026-11-30", { freq: "weekly", weekdays: [1, 3] }), "2026-12-02"));
check("每 2 周的周一", () => assert.equal(next("2026-11-30", { freq: "custom", unit: "week", interval: 2, weekdays: [1] }), "2026-12-14"));
check("每周无星期 = 七天", () => assert.equal(next("2026-11-25", { freq: "weekly" }), "2026-12-02"));
check("每月", () => assert.equal(next("2026-11-25", { freq: "monthly" }), "2026-12-25"));
check("每月月末夹取", () => assert.equal(next("2026-01-31", { freq: "monthly" }), "2026-02-28"));
check("每年", () => assert.equal(next("2026-11-25", { freq: "yearly" }), "2027-11-25"));
check("每年闰日", () => assert.equal(next("2024-02-29", { freq: "yearly" }), "2025-02-28"));
check("自定义天单位", () => assert.equal(next("2026-11-25", { freq: "custom", unit: "day", interval: 10 }), "2026-12-05"));
check("自定义月单位", () => assert.equal(next("2026-11-25", { freq: "custom", unit: "month", interval: 2 }), "2027-01-25"));

check("结束：日期之前停止", () => assert.equal(T.repeatEnds({ freq: "daily", until: "2026-11-26" }, "2026-11-27"), true));
check("结束：日期之内继续", () => assert.equal(T.repeatEnds({ freq: "daily", until: "2026-11-28" }, "2026-11-27"), false));
check("结束：次数用尽", () => assert.equal(T.repeatEnds({ freq: "daily", count: 3, doneCount: 2 }, "2026-11-27"), true));
check("结束：次数未用尽", () => assert.equal(T.repeatEnds({ freq: "daily", count: 5, doneCount: 2 }, "2026-11-27"), false));

check("normalizeRepeat 过滤非法星期与间隔", () => {
  const rep = T.normalizeRepeat({ freq: "weekly", interval: 0, weekdays: [9, 2, 2, 4] });
  assert.equal(rep.interval, 1);
  assert.deepEqual(rep.weekdays, [2, 4]);
});

/* 进度 */
check("检查点进度 25% / 50% / 100%", () => {
  const task = T.normalizeTask({ title: "x", subtasks: [{ title: "a" }, { title: "b" }, { title: "c" }], milestones: [{ title: "m" }] }, "g1");
  assert.equal(T.progressOf(task).percent, 0);
  T.setChildDone(task, "subtask", task.subtasks[0].id, true);
  assert.equal(T.progressOf(task).percent, 25);
  T.setChildDone(task, "subtask", task.subtasks[1].id, true);
  assert.equal(T.progressOf(task).percent, 50);
  T.setChildDone(task, "subtask", task.subtasks[2].id, true);
  T.setChildDone(task, "milestone", task.milestones[0].id, true);
  assert.equal(task.done, true);
  assert.equal(T.progressOf(task).percent, 100);
});

check("取消勾选父子对称", () => {
  const task = T.normalizeTask({ title: "x", subtasks: [{ title: "a" }, { title: "b" }], milestones: [{ title: "m" }] }, "g1");
  T.setTaskDone(task, true);
  assert.equal(task.subtasks.every((s) => s.done), true);
  assert.equal(task.milestones[0].done, true);
  assert.equal(task.progress, 100);
  T.setTaskDone(task, false);
  assert.equal(task.subtasks.some((s) => s.done), false);
  assert.equal(task.milestones[0].done, false);
  assert.equal(task.progress, 0);
  assert.equal(task.done, false);
});

check("手动进度在无检查点时生效", () => {
  const task = T.normalizeTask({ title: "m", progress: 40 }, "g1");
  assert.equal(T.progressOf(task).percent, 40);
  T.setTaskDone(task, true);
  assert.equal(T.progressOf(task).percent, 100);
});

/* 派生 */
check("重复任务派生下一次（日期整体平移、子项重置）", () => {
  const task = T.normalizeTask({
    title: "周会", startDate: "2026-11-23", dueDate: "2026-11-24",
    repeat: { freq: "weekly", weekdays: [1] },
    subtasks: [{ title: "a", done: true }],
    milestones: [{ title: "m", date: "2026-11-24", done: true }]
  }, "g1");
  const nx = T.spawnNext(task);
  assert.equal(nx.startDate, "2026-11-30");
  assert.equal(nx.dueDate, "2026-12-01");
  assert.equal(nx.milestones[0].date, "2026-12-01");
  assert.equal(nx.subtasks[0].done, false);
  assert.equal(nx.milestones[0].done, false);
  assert.equal(nx.repeat.doneCount, 1);
  assert.equal(nx.seriesId, task.id);
  assert.equal(nx.done, false);
  assert.equal(nx.progress, 0);
  assert.notEqual(nx.id, task.id);
});

check("次数上限挡住派生", () => {
  const task = T.normalizeTask({ title: "x", dueDate: "2026-11-25", repeat: { freq: "daily", count: 1 } }, "g");
  assert.equal(T.spawnNext(task), null);
});
check("结束日期挡住派生", () => {
  const task = T.normalizeTask({ title: "x", dueDate: "2026-11-25", repeat: { freq: "daily", until: "2026-11-25" } }, "g");
  assert.equal(T.spawnNext(task), null);
});
check("不重复不派生", () => {
  const task = T.normalizeTask({ title: "x", dueDate: "2026-11-25" }, "g");
  assert.equal(T.spawnNext(task), null);
});

/* 覆盖判定与排序 */
check("coversDate 区间与单日", () => {
  assert.equal(T.coversDate({ startDate: "2026-11-01", dueDate: "2026-11-05" }, "2026-11-03"), true);
  assert.equal(T.coversDate({ startDate: "2026-11-01", dueDate: "2026-11-05" }, "2026-11-06"), false);
  assert.equal(T.coversDate({ dueDate: "2026-11-05" }, "2026-11-05"), true);
  assert.equal(T.coversDate({}, "2026-11-05"), false);
});
check("排序：未完成 > 优先级 > 截止日", () => {
  const list = [
    T.normalizeTask({ title: "done", done: true, priority: "urgent", dueDate: "2026-11-01" }, "g"),
    T.normalizeTask({ title: "low", priority: "low", dueDate: "2026-11-01" }, "g"),
    T.normalizeTask({ title: "urgent", priority: "urgent", dueDate: "2026-11-09" }, "g"),
    T.normalizeTask({ title: "high", priority: "high", dueDate: "2026-11-02" }, "g")
  ].sort(T.compareTasks);
  assert.deepEqual(list.map((t) => t.title), ["urgent", "high", "low", "done"]);
});

/* 存储分片：用内存 kv 跑一遍 load/save 往返 */
check("Store 往返：分片写入与读取", async () => {
  const mem = new Map();
  const kv = {
    get: (k) => Promise.resolve(mem.has(k) ? JSON.parse(mem.get(k)) : null),
    set: (k, v) => { mem.set(k, JSON.stringify(v)); return Promise.resolve(); },
    delete: (k) => { mem.delete(k); return Promise.resolve(); }
  };
  T.Store.kv = kv;
  T.Store.memory = false;
  T.Store.model = null;
  const defaults = { groups: [{ id: "gA", name: "A", color: "#6366f1" }, { id: "gB", name: "B", color: "#22c55e" }] };
  const first = await T.Store.load(defaults);
  assert.equal(first.groups.length, 2);
  first.tasks.push(T.normalizeTask({ title: "写测试", groupId: "gA", dueDate: "2026-12-01" }, "gA"));
  T.Store.touchGroup("gA");
  T.Store.touchMeta();
  await T.Store.flush();
  assert.ok(mem.has("meta"));
  assert.ok(mem.has("tasks.gA"));
  const second = await T.Store.load(defaults);
  assert.equal(second.tasks.length, 1);
  assert.equal(second.tasks[0].title, "写测试");
  assert.equal(second.groups.length, 2);
});

/* 子任务：优先级 / 进度 / 开始完成时间 / 用时 / 排序 */
check("子任务默认字段", () => {
  const sub = T.normalizeSubtask({ title: "a" });
  assert.equal(sub.priority, "none");
  assert.equal(sub.progress, 0);
  assert.equal(sub.done, false);
  assert.equal(sub.doneAt, null);
  assert.equal(sub.minutes, null);
  assert.ok(sub.createdAt);
});

check("子任务进度参与父任务完成度（加权平均）", () => {
  const task = T.normalizeTask({ title: "t", subtasks: [{ title: "a" }, { title: "b" }] }, "g");
  const [a] = task.subtasks;
  T.setSubtaskProgress(task, a.id, 50);
  assert.equal(T.progressOf(task).percent, 25);
  assert.equal(task.done, false);
  T.setSubtaskProgress(task, a.id, 100);
  assert.equal(a.done, true);
  assert.equal(T.progressOf(task).percent, 50);
  T.setSubtaskProgress(task, task.subtasks[1].id, 100);
  assert.equal(task.done, true);
  assert.equal(T.progressOf(task).percent, 100);
});

check("子任务完成时间：勾选时补，取消时清", () => {
  const task = T.normalizeTask({ title: "t", subtasks: [{ title: "a" }] }, "g");
  const sub = task.subtasks[0];
  T.setChildDone(task, "subtask", sub.id, true);
  assert.equal(sub.progress, 100);
  assert.ok(sub.doneAt);
  T.setChildDone(task, "subtask", sub.id, false);
  assert.equal(sub.progress, 0);
  assert.equal(sub.doneAt, null);
});

check("用时：手填优先", () => {
  const sub = T.normalizeSubtask({ title: "a", startDate: "2026-11-25", startTime: "09:00", doneAt: "2026-11-25T12:00:00.000Z", minutes: 30 });
  assert.equal(T.subtaskMinutes(sub), 30);
});

check("用时：按 开始→完成 自动算", () => {
  const start = new Date("2026-11-25T09:00");
  const end = new Date("2026-11-25T10:30");
  const sub = T.normalizeSubtask({ title: "a", startDate: "2026-11-25", startTime: "09:00", doneAt: end.toISOString() });
  assert.equal(T.subtaskMinutes(sub), Math.round((end - start) / 60000));
});

check("用时：缺开始或缺完成时为空", () => {
  assert.equal(T.subtaskMinutes(T.normalizeSubtask({ title: "a" })), null);
  assert.equal(T.subtaskMinutes(T.normalizeSubtask({ title: "a", startDate: "2026-11-25" })), null);
});

check("子任务排序：优先级降序、同级按创建时间", () => {
  const mk = (title, priority, createdAt) => T.normalizeSubtask({ title, priority, createdAt });
  const list = [mk("c", "low", "2026-11-01"), mk("a", "urgent", "2026-11-03"), mk("b", "urgent", "2026-11-02")];
  assert.deepEqual(list.slice().sort(T.compareSubtasks("priority")).map((x) => x.title), ["b", "a", "c"]);
  assert.deepEqual(list.slice().sort(T.compareSubtasks("created")).map((x) => x.title), ["c", "b", "a"]);
});

check("派生重复任务时子任务重置但保留优先级", () => {
  const task = T.normalizeTask({
    title: "周会", dueDate: "2026-11-25", repeat: { freq: "daily" },
    subtasks: [{ title: "a", priority: "high", done: true, progress: 100, minutes: 20 }]
  }, "g");
  const nx = T.spawnNext(task);
  assert.equal(nx.subtasks[0].title, "a");
  assert.equal(nx.subtasks[0].priority, "high");
  assert.equal(nx.subtasks[0].done, false);
  assert.equal(nx.subtasks[0].progress, 0);
  assert.equal(nx.subtasks[0].minutes, null);
});

check("datetime-local 与 ISO 互转", () => {
  const iso = T.fromLocalInput("2026-11-25T11:30");
  assert.equal(typeof iso, "string");
  assert.equal(T.toLocalInput(iso), "2026-11-25T11:30");
  assert.equal(T.toLocalInput(null), "");
  assert.equal(T.fromLocalInput(""), null);
});

run();
