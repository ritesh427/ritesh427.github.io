'use strict';
/* =========================================================
   DevPath State Management & Persistence (Store)
   ========================================================= */

const LS = {
  progress: 'devpath_pro_v3',
  log: 'devpath_log',
  activity: 'devpath_activity',
  settings: 'devpath_settings',
  ach: 'devpath_ach',
  flags: 'devpath_flags',
  timer: 'devpath_timer',
  tests: 'devpath_tests'
};

const PASS_MARK = 80;

const ACHIEVEMENTS = [
  { id: 'first', icon: '🌱', name: 'First Step', desc: 'Complete your first topic', prog: m => [m.done, 1] },
  { id: 'ten', icon: '🚀', name: 'Getting Rolling', desc: 'Complete 10 topics', prog: m => [m.done, 10] },
  { id: 'fifty', icon: '🏅', name: 'Half Century', desc: 'Complete 50 topics', prog: m => [m.done, 50] },
  { id: 'hundred', icon: '🏆', name: 'Century Club', desc: 'Complete 100 topics', prog: m => [m.done, 100] },
  { id: 'streak3', icon: '🔥', name: 'On Fire', desc: 'Reach a 3-day streak', prog: m => [m.best, 3] },
  { id: 'streak7', icon: '⚔️', name: 'Week Warrior', desc: 'Reach a 7-day streak', prog: m => [m.best, 7] },
  { id: 'streak30', icon: '🛡️', name: 'Unstoppable', desc: 'Reach a 30-day streak', prog: m => [m.best, 30] },
  { id: 'cat', icon: '🎯', name: 'Category Champion', desc: 'Finish every topic in a category', prog: m => [m.catDone, 1] },
  { id: 'ready10', icon: '💼', name: 'Interview Ready', desc: 'Reach confidence 4+ on 10 topics', prog: m => [m.ready, 10] },
  { id: 'notes5', icon: '📝', name: 'Note Taker', desc: 'Write notes on 5 topics', prog: m => [m.notes, 5] },
  { id: 'focus60', icon: '⏱️', name: 'Deep Focus', desc: 'Log 60 focus minutes', prog: m => [m.minutes, 60] },
  { id: 'focus300', icon: '🧘', name: 'Flow State', desc: 'Log 5 hours of focus time', prog: m => [m.minutes, 300] },
  { id: 'rev25', icon: '🔁', name: 'Repetition Pays', desc: 'Log 25 revisions', prog: m => [m.revs, 25] },
  { id: 'owl', icon: '🦉', name: 'Night Owl', desc: 'Study after 10 PM', prog: m => [m.night ? 1 : 0, 1] },
  { id: 'test_first', icon: '🎯', name: 'Exam Initiate', desc: 'Pass your first knowledge test with 80%+', prog: m => [m.testsPassed, 1] },
  { id: 'test_five', icon: '⚡', name: 'Quiz Master', desc: 'Pass 5 topic tests with 80%+', prog: m => [m.testsPassed, 5] },
  { id: 'test_ten', icon: '🎖️', name: 'Exam Veteran', desc: 'Pass 10 topic tests with 80%+', prog: m => [m.testsPassed, 10] },
  { id: 'test_perfect', icon: '💎', name: 'Flawless 100%', desc: 'Score a perfect 100% on any full test', prog: m => [m.perfectTests, 1] },
  { id: 'daily_first', icon: '☀️', name: 'Daily Contender', desc: 'Complete a Daily Cross-Domain Challenge', prog: m => [m.dailyChallenges, 1] },
  { id: 'speed_demon', icon: '⚡', name: 'Speed Demon', desc: 'Pass an exam in under 60 seconds with 80%+', prog: m => [m.fastTests, 1] }
];


class Store {
  constructor() {
    const stored = readJSON(LS.progress, {});
    this.log = new Set(readJSON(LS.log, []));
    this.activity = readJSON(LS.activity, {});
    this.ach = readJSON(LS.ach, {});
    this.flags = readJSON(LS.flags, {});
    
    const tests = readJSON(LS.tests, null);
    this.tests = tests && Array.isArray(tests.attempts) ? { attempts: tests.attempts, q: tests.q || {} } : { attempts: [], q: {} };
    
    this.settings = Object.assign({
      theme: 'dark',
      hue: 239,
      dailyGoal: 3,
      focusMin: 25,
      view: 'grid',
      name: '',
      sidebar: true,
      quiz: { n: 20, mode: 'exam', secs: 30 }
    }, readJSON(LS.settings, {}));

    this.listeners = new Set();
    let migrated = false;

    this.topics = TOPICS.map(t => {
      const s = stored[t.id] || {};
      const topic = {
        ...t,
        completed: !!s.completed,
        favorite: !!s.favorite,
        confidence: s.confidence || 1,
        revisionCount: s.revisionCount || 0,
        notes: s.notes || '',
        lastRevised: s.lastRevised || null,
        lastTs: s.lastTs || null,
        completedAt: s.completedAt || null,
        minutes: s.minutes || 0
      };
      if (topic.completed && !topic.lastTs) { topic.lastTs = Date.now(); migrated = true; }
      return topic;
    });

    this.byId = new Map(this.topics.map(t => [t.id, t]));
    this.unlockNew(true);
    if (migrated || !Object.keys(this.ach).length) this.save();
  }

  /* ----- persistence / events ----- */
  progressMap() {
    const o = {};
    this.topics.forEach(t => {
      o[t.id] = {
        completed: t.completed,
        favorite: t.favorite,
        confidence: t.confidence,
        revisionCount: t.revisionCount,
        notes: t.notes,
        lastRevised: t.lastRevised,
        lastTs: t.lastTs,
        completedAt: t.completedAt,
        minutes: t.minutes
      };
    });
    return o;
  }

  save() {
    writeJSON(LS.progress, this.progressMap());
    writeJSON(LS.log, [...this.log]);
    writeJSON(LS.activity, this.activity);
    writeJSON(LS.flags, this.flags);
    writeJSON(LS.ach, this.ach);
    writeJSON(LS.tests, this.tests);
  }

  saveSettings() { writeJSON(LS.settings, this.settings); }
  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit(fresh = []) { this.listeners.forEach(fn => fn(fresh)); }
  commit() {
    this.save();
    const fresh = this.unlockNew();
    if (fresh.length) writeJSON(LS.ach, this.ach);
    this.emit(fresh);
  }

  /* ----- activity & streak tracking ----- */
  bump(field, n) {
    const k = dayKey();
    const a = this.activity[k] || (this.activity[k] = { done: 0, rev: 0, min: 0 });
    a[field] = Math.max(0, (a[field] || 0) + n);
    if (n > 0) {
      this.log.add(k);
      const h = new Date().getHours();
      if (h >= 22 || h < 4) this.flags.owl = true;
    } else if (a.done + a.rev + a.min === 0) {
      delete this.activity[k];
      this.log.delete(k);
    }
  }

  scoreOf(key) {
    const a = this.activity[key];
    let s = a ? (a.done || 0) + (a.rev || 0) + Math.floor((a.min || 0) / 20) : 0;
    if (!s && (this.log.has(key) || (a && (a.done + a.rev + a.min) > 0))) s = 1;
    return s;
  }

  activeDays() {
    const s = new Set(this.log);
    for (const [k, a] of Object.entries(this.activity)) {
      if ((a.done || 0) + (a.rev || 0) + (a.min || 0) > 0) s.add(k);
    }
    return s;
  }

  streak() {
    const days = this.activeDays();
    let d = startOfDay();
    const todayDone = days.has(dayKey(d));
    if (!todayDone) d = addDays(d, -1);
    let current = 0;
    while (days.has(dayKey(d))) { current++; d = addDays(d, -1); }
    let best = 0, run = 0, prev = null;
    [...days].sort().forEach(k => {
      const dt = parseKey(k);
      run = prev && Math.round((dt - prev) / DAY_MS) === 1 ? run + 1 : 1;
      best = Math.max(best, run);
      prev = dt;
    });
    return { current, best: Math.max(best, current), todayDone, active: days.size };
  }

  /* ----- mutations ----- */
  toggleComplete(id) {
    const t = this.byId.get(id); if (!t) return null;
    t.completed = !t.completed;
    let catDone = false;
    if (t.completed) {
      t.completedAt = Date.now();
      t.lastTs = t.completedAt;
      this.bump('done', 1);
      catDone = this.topics.filter(x => x.category === t.category).every(x => x.completed);
    } else {
      if (t.completedAt && dayKey(new Date(t.completedAt)) === dayKey()) this.bump('done', -1);
      t.completedAt = null;
    }
    this.commit();
    return { completed: t.completed, catDone };
  }

  toggleFavorite(id) {
    const t = this.byId.get(id);
    if (t) { t.favorite = !t.favorite; this.commit(); }
  }

  setConfidence(id, val) {
    const t = this.byId.get(id); if (!t) return;
    t.confidence = clamp(val, 1, 5);
    if (t.completed) t.lastTs = Date.now();
    this.commit();
  }

  logRevision(id) {
    const t = this.byId.get(id); if (!t) return;
    t.revisionCount++; t.lastTs = Date.now(); t.lastRevised = new Date().toLocaleDateString();
    this.bump('rev', 1);
    this.commit();
  }

  rate(id, verdict) {
    const t = this.byId.get(id); if (!t) return null;
    const before = t.confidence;
    t.confidence = clamp(t.confidence + ({ nailed: 1, okay: 0, missed: -1 }[verdict] || 0), 1, 5);
    t.revisionCount++; t.lastTs = Date.now(); t.lastRevised = new Date().toLocaleDateString();
    this.bump('rev', 1);
    this.commit();
    return { before, after: t.confidence };
  }

  setNotes(id, text) {
    const t = this.byId.get(id); if (!t) return;
    t.notes = text;
    this.save();
    const fresh = this.unlockNew();
    if (fresh.length) { writeJSON(LS.ach, this.ach); this.emit(fresh); }
  }

  addMinutes(id, min) {
    if (min <= 0) return;
    const t = id && this.byId.get(id);
    if (t) t.minutes += min;
    this.bump('min', min);
    this.commit();
  }

  /* ----- queries & SRS ----- */
  neighbors(id) {
    const t = this.byId.get(id);
    const list = this.topics.filter(x => x.category === t.category);
    const i = list.indexOf(t);
    return { prev: list[i - 1] || null, next: list[i + 1] || null, index: i + 1, total: list.length };
  }

  nextUp() {
    for (const c of CATEGORIES) {
      const t = this.topics.find(x => x.category === c && !x.completed);
      if (t) return t;
    }
    return null;
  }

  dueAt(t) {
    if (!t.completed) return null;
    return (t.lastTs || t.completedAt || Date.now()) + SRS_DAYS[t.confidence] * DAY_MS;
  }

  isDue(t) {
    const d = this.dueAt(t);
    return d !== null && d <= Date.now();
  }

  dueLabel(t) {
    const d = this.dueAt(t); if (d === null) return '';
    const now = Date.now();
    if (d <= now) {
      const n = Math.floor((now - d) / DAY_MS);
      return n < 1 ? 'Due today' : `${n}d overdue`;
    }
    const n = Math.ceil((d - now) / DAY_MS);
    return n === 1 ? 'Due tomorrow' : `Due in ${n}d`;
  }

  dueTopics() {
    return this.topics.filter(t => this.isDue(t)).sort((a, b) => this.dueAt(a) - this.dueAt(b));
  }

  forecast(days = 7) {
    const out = Array(days).fill(0);
    const today = startOfDay().getTime(), endToday = today + DAY_MS;
    this.topics.forEach(t => {
      const d = this.dueAt(t); if (d === null) return;
      const off = d < endToday ? 0 : Math.floor((d - today) / DAY_MS);
      if (off < days) out[off]++;
    });
    return out;
  }

  catStats(cat) {
    const list = this.topics.filter(t => t.category === cat);
    const total = list.length, done = list.filter(t => t.completed).length;
    const ready = list.filter(t => t.completed && t.confidence >= 4).length;
    const readyAny = list.filter(t => t.confidence >= 4).length;
    const avg = total ? list.reduce((a, t) => a + t.confidence, 0) / total : 0;
    return { total, done, ready, readyAny, pct: total ? Math.round(done / total * 100) : 0, minutes: list.reduce((a, t) => a + t.minutes, 0), avg };
  }

  stats() {
    const T = this.topics, total = T.length;
    const done = T.filter(t => t.completed).length;
    return {
      total, done,
      ready: T.filter(t => t.confidence >= 4).length,
      revs: T.filter(t => t.completed && t.confidence < 4).length,
      due: this.dueTopics().length,
      favs: T.filter(t => t.favorite).length,
      minutes: T.reduce((a, t) => a + t.minutes, 0),
      notes: T.filter(t => t.notes.trim()).length,
      revCount: T.reduce((a, t) => a + t.revisionCount, 0),
      prog: total ? Math.round(done / total * 100) : 0
    };
  }

  confDist() {
    const d = [0, 0, 0, 0, 0];
    this.topics.forEach(t => d[t.confidence - 1]++);
    return d;
  }

  heat(weeks = 20) {
    const start = addDays(startOfWeek(), -(weeks - 1) * 7), today = startOfDay();
    const cells = [];
    for (let i = 0; i < weeks * 7; i++) {
      const d = addDays(start, i), key = dayKey(d);
      const a = this.activity[key] || { done: 0, rev: 0, min: 0 };
      const score = this.scoreOf(key);
      cells.push({ key, date: d, score, a, future: d > today, level: score === 0 ? 0 : score === 1 ? 1 : score <= 3 ? 2 : score <= 5 ? 3 : 4 });
    }
    return { cells, weeks, start };
  }

  weekly(n = 12) {
    const out = [];
    for (let w = n - 1; w >= 0; w--) {
      const ws = addDays(startOfWeek(), -w * 7);
      const row = { start: ws, done: 0, rev: 0, min: 0 };
      for (let i = 0; i < 7; i++) {
        const a = this.activity[dayKey(addDays(ws, i))];
        if (a) { row.done += a.done || 0; row.rev += a.rev || 0; row.min += a.min || 0; }
      }
      out.push(row);
    }
    return out;
  }

  /* ----- tests tracking & auto-completion ----- */
  markActive() {
    const k = dayKey();
    this.log.add(k);
    if (!this.activity[k]) this.activity[k] = { done: 0, rev: 0, min: 0 };
  }

  recordTest(att) {
    this.tests.attempts.push(att);
    if (this.tests.attempts.length > 600) this.tests.attempts.splice(0, this.tests.attempts.length - 600);
    
    const m = this.tests.q[att.topicId] || (this.tests.q[att.topicId] = {});
    (att.r || []).forEach(([i, ok]) => {
      const s = m[i] || (m[i] = [0, 0]);
      s[0]++;
      if (!ok) s[1]++;
    });

    const t = this.byId.get(att.topicId);
    let completedNow = false, confFrom = t ? t.confidence : 1;
    this.markActive();

    // Passing with 80%+ marks topic complete and upgrades confidence level!
    if (t && att.passed && att.kind === 'full') {
      if (!t.completed) {
        t.completed = true;
        t.completedAt = Date.now();
        this.bump('done', 1);
        completedNow = true;
      }
      t.lastTs = Date.now();
      t.confidence = Math.max(t.confidence, att.pct >= 95 ? 5 : att.pct >= 90 ? 4 : 3);
      t.revisionCount++;
      t.lastRevised = new Date().toLocaleDateString();
      this.bump('rev', 1);
    }
    this.commit();
    return { completedNow, confFrom, confTo: t ? t.confidence : 1 };
  }

  testStats(topicId) {
    const all = this.tests.attempts.filter(a => a.topicId === topicId);
    const full = all.filter(a => a.kind === 'full' && !a.dq);
    const best = full.length ? Math.max(...full.map(a => a.pct)) : null;
    return {
      attempts: all.length,
      best,
      last: all.length ? all[all.length - 1] : null,
      passed: full.some(a => a.passed),
      avg: full.length ? Math.round(full.reduce((s, a) => s + a.pct, 0) / full.length) : null
    };
  }

  globalTestStats() {
    const all = this.tests.attempts;
    const full = all.filter(a => a.kind === 'full' && !a.dq);
    const passed = full.filter(a => a.passed);
    const perfect = full.filter(a => a.pct === 100);
    const passedTopics = new Set(passed.map(a => a.topicId));
    const avgScore = full.length ? Math.round(full.reduce((s, a) => s + a.pct, 0) / full.length) : 0;
    const passRate = full.length ? Math.round((passed.length / full.length) * 100) : 0;
    const totalTimeSecs = all.reduce((s, a) => s + (a.secs || 0), 0);

    return {
      totalAttempts: all.length,
      fullExams: full.length,
      passedExams: passed.length,
      passedTopicsCount: passedTopics.size,
      perfectCount: perfect.length,
      avgScore,
      passRate,
      totalTimeSecs
    };
  }

  weakTopicsList() {
    const weak = [];
    for (const t of this.topics) {
      if (!QB.has(t.id)) continue;
      const st = this.testStats(t.id);
      const qStats = this.tests.q[t.id] || {};
      const missedCount = Object.values(qStats).reduce((acc, s) => acc + (s[1] || 0), 0);
      
      // Topic is considered weak if tested with score < 80% or has repeated mistakes
      if ((st.attempts > 0 && !st.passed) || missedCount > 0) {
        weak.push({
          topic: t,
          best: st.best,
          attempts: st.attempts,
          missedCount
        });
      }
    }
    return weak.sort((a, b) => (b.missedCount - a.missedCount) || ((a.best || 0) - (b.best || 0)));
  }

  dailyChallengeStatus() {
    const today = dayKey();
    const todayAttempts = this.tests.attempts.filter(a => a.topicId === 'daily' && dayKey(new Date(a.ts)) === today);
    const passedToday = todayAttempts.some(a => a.passed);
    const completedToday = todayAttempts.length > 0;
    const bestScore = todayAttempts.length ? Math.max(...todayAttempts.map(a => a.pct)) : null;

    // Compute consecutive daily challenge streak
    const dailyDays = new Set(
      this.tests.attempts
        .filter(a => a.topicId === 'daily' && a.passed)
        .map(a => dayKey(new Date(a.ts)))
    );
    let d = startOfDay();
    if (!dailyDays.has(dayKey(d))) d = addDays(d, -1);
    let streak = 0;
    while (dailyDays.has(dayKey(d))) {
      streak++;
      d = addDays(d, -1);
    }

    return {
      completedToday,
      passedToday,
      bestScore,
      streak
    };
  }

  /* ----- achievements ----- */
  metrics() {
    const s = this.stats(), st = this.streak();
    const passedTests = this.tests.attempts.filter(a => a.passed && a.kind === 'full');
    const perfectTests = this.tests.attempts.filter(a => a.pct === 100 && a.kind === 'full');
    const fastTests = this.tests.attempts.filter(a => a.passed && a.kind === 'full' && (a.secs || 999) <= 60);
    const dailyChallenges = this.tests.attempts.filter(a => a.topicId === 'daily' && a.passed);

    return {
      done: s.done, ready: s.ready, notes: s.notes, minutes: s.minutes, revs: s.revCount,
      best: st.best, current: st.current,
      catDone: CATEGORIES.filter(c => { const x = this.catStats(c); return x.total && x.done === x.total; }).length,
      night: !!this.flags.owl,
      testsPassed: passedTests.length,
      perfectTests: perfectTests.length,
      fastTests: fastTests.length,
      dailyChallenges: dailyChallenges.length
    };
  }

  achievementState() {
    const m = this.metrics();
    return ACHIEVEMENTS.map(a => {
      const [cur, goal] = a.prog(m);
      return { ...a, cur: Math.min(cur, goal), goal, unlocked: !!this.ach[a.id], at: this.ach[a.id] || 0 };
    });
  }

  unlockNew(silent = false) {
    const m = this.metrics(), fresh = [];
    for (const a of ACHIEVEMENTS) {
      const [cur, goal] = a.prog(m);
      if (!this.ach[a.id] && cur >= goal) { this.ach[a.id] = Date.now(); fresh.push(a); }
    }
    return silent ? [] : fresh;
  }

  /* ----- data backup & notes export ----- */
  exportData() {
    return {
      app: 'devpath',
      version: 3,
      exportedAt: new Date().toISOString(),
      progress: this.progressMap(),
      log: [...this.log],
      activity: this.activity,
      settings: this.settings,
      achievements: this.ach,
      flags: this.flags,
      tests: this.tests
    };
  }

  importData(obj) {
    if (!obj || typeof obj !== 'object' || !obj.progress || typeof obj.progress !== 'object') {
      throw new Error('This file is not a valid DevPath backup.');
    }
    writeJSON(LS.progress, obj.progress);
    writeJSON(LS.log, Array.isArray(obj.log) ? obj.log : []);
    writeJSON(LS.activity, obj.activity || {});
    if (obj.settings) writeJSON(LS.settings, obj.settings);
    writeJSON(LS.ach, obj.achievements || {});
    writeJSON(LS.flags, obj.flags || {});
    writeJSON(LS.tests, obj.tests || { attempts: [], q: {} });
  }

  resetProgress() {
    [LS.progress, LS.log, LS.activity, LS.ach, LS.flags, LS.timer, LS.tests].forEach(k => {
      try { localStorage.removeItem(k); } catch { /* ignore */ }
    });
  }

  notesMarkdown() {
    const withNotes = this.topics.filter(t => t.notes.trim());
    if (!withNotes.length) return '';
    let md = `# DevPath Study Notes\n\n_Exported on ${new Date().toLocaleString()}_\n`;
    CATEGORIES.forEach(c => {
      const items = withNotes.filter(t => t.category === c);
      if (!items.length) return;
      md += `\n## ${c}\n`;
      items.forEach(t => {
        md += `\n### ${t.title}\n\n${t.notes.trim()}\n`;
      });
    });
    return md;
  }
}

const store = new Store();
