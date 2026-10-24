'use strict';
/* =========================================================
   DevPath core: helpers, icons, store, spaced repetition,
   streaks, heatmap data, achievements.
   Storage keys 'devpath_pro_v3' and 'devpath_log' are the same
   as the original dashboard, so existing progress is preserved.
   ========================================================= */

const LS = {
  progress: 'devpath_pro_v3',
  log: 'devpath_log',
  activity: 'devpath_activity',
  settings: 'devpath_settings',
  ach: 'devpath_ach',
  flags: 'devpath_flags',
  timer: 'devpath_timer'
};

const ROADMAP_ORDER = ['Java', 'Spring Boot', 'JUnit5 & Mockito', 'Microservices', 'Event Driven Architecture', 'LLD', 'HLD', 'Git', 'AWS', 'Spring AI'];

const CATEGORY_META = {
  'Java': { icon: '☕', color: '#ef4444', blurb: 'Language fundamentals, JVM, concurrency and modern Java' },
  'Spring Boot': { icon: '🍃', color: '#22c55e', blurb: 'DI, AOP, JPA, security, actuator and more' },
  'JUnit5 & Mockito': { icon: '🧪', color: '#14b8a6', blurb: 'Test lifecycle, parametrized tests and mocking' },
  'Microservices': { icon: '🧩', color: '#6366f1', blurb: 'Resilience patterns, gateways, config and tracing' },
  'Event Driven Architecture': { icon: '⚡', color: '#ec4899', blurb: 'Kafka internals, producers, consumers, transactions' },
  'LLD': { icon: '🏗️', color: '#a855f7', blurb: 'Design patterns and machine-coding interview problems' },
  'HLD': { icon: '🌐', color: '#3b82f6', blurb: 'Distributed systems and system design building blocks' },
  'Git': { icon: '🌿', color: '#f97316', blurb: 'Version control mastery' },
  'AWS': { icon: '☁️', color: '#eab308', blurb: 'Cloud fundamentals' },
  'Spring AI': { icon: '🤖', color: '#06b6d4', blurb: 'LLM integration with Spring' }
};
const catMeta = c => CATEGORY_META[c] || { icon: '📚', color: '#94a3b8', blurb: '' };

const CONF_LABELS = ['', 'Not Started', 'Basic', 'Comfortable', 'Interview Ready', 'Expert'];
const CONF_EMOJI = ['', '🌱', '📘', '🙂', '💼', '🏆'];
/* Spaced repetition: days until next review, by confidence level */
const SRS_DAYS = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
const DAY_MS = 864e5;

/* ---------- tiny helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const startOfWeek = (d = new Date()) => addDays(startOfDay(d), -startOfDay(d).getDay());
const readJSON = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb; } catch { return fb; } };
const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full / blocked */ } };
const plural = (n, w, p = w + 's') => `${n} ${n === 1 ? w : p}`;
const fmtMin = m => m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

/* ---------- icons (stroke, 24x24) ---------- */
const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  sliders: '<path d="M4 6h8M18 6h2M4 12h2M12 12h8M4 18h10M20 18h0"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  play: '<path d="M7 4.5v15l13-7.5z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  note: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  flame: '<path d="M12 3c1 3.5 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .5 1.5 1.5 2 2 2 0-3-1-5 1-8z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.5-4M4 4v4h4M4 13a8 8 0 0 0 14.5 4M20 20v-4h-4"/>',
  home: '<path d="M3 11 12 3l9 8M5 10v10h5v-6h4v6h5V10"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-8M21 20H3"/>',
  command: '<path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z"/>',
  external: '<path d="M14 4h6v6M20 4 10 14M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>'
};
const icon = (n, s = 18, cls = '') => `<svg class="ico ${cls}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

/* ---------- topics ---------- */
const NUM_RE = /^(\d+(?:\s*[-–]\s*\d+)?)\.\s+(.*)$/;
const TOPICS = rawLinks.map((row, idx) => {
  const defs = catDefaults[row[2]] || {};
  const m = NUM_RE.exec(row[1]);
  return {
    id: row[0],
    order: idx,
    title: row[1],
    num: m ? m[1].replace(/\s+/g, '') : '',
    name: m ? m[2] : row[1],
    category: row[2],
    pdfLink: row[3] || '',
    oneNoteLink: row[4] || defs.note || '',
    gitLink: row[5] || defs.git || '',
    difficulty: row[2] === 'HLD' || row[2] === 'LLD' ? 'Advanced' : 'Intermediate',
    duration: '2h'
  };
});
const CATEGORIES = (() => {
  const seen = new Set(TOPICS.map(t => t.category));
  const out = ROADMAP_ORDER.filter(c => seen.has(c));
  seen.forEach(c => { if (!out.includes(c)) out.push(c); });
  return out;
})();

/* ---------- achievements ---------- */
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
  { id: 'owl', icon: '🦉', name: 'Night Owl', desc: 'Study after 10 PM', prog: m => [m.night ? 1 : 0, 1] }
];

/* =========================================================
   Store
   ========================================================= */
class Store {
  constructor() {
    const stored = readJSON(LS.progress, {});
    this.log = new Set(readJSON(LS.log, []));
    this.activity = readJSON(LS.activity, {});
    this.ach = readJSON(LS.ach, {});
    this.flags = readJSON(LS.flags, {});
    this.settings = Object.assign({ theme: 'dark', hue: 239, dailyGoal: 3, focusMin: 25, view: 'grid', name: '', sidebar: true }, readJSON(LS.settings, {}));
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
      /* topics completed in the old dashboard have no timestamp: schedule them from today */
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
      o[t.id] = { completed: t.completed, favorite: t.favorite, confidence: t.confidence, revisionCount: t.revisionCount, notes: t.notes, lastRevised: t.lastRevised, lastTs: t.lastTs, completedAt: t.completedAt, minutes: t.minutes };
    });
    return o;
  }
  save() {
    writeJSON(LS.progress, this.progressMap());
    writeJSON(LS.log, [...this.log]);
    writeJSON(LS.activity, this.activity);
    writeJSON(LS.flags, this.flags);
    writeJSON(LS.ach, this.ach);
  }
  saveSettings() { writeJSON(LS.settings, this.settings); }
  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit(fresh = []) { this.listeners.forEach(fn => fn(fresh)); }
  commit() { this.save(); const fresh = this.unlockNew(); if (fresh.length) writeJSON(LS.ach, this.ach); this.emit(fresh); }

  /* ----- activity ----- */
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
    for (const [k, a] of Object.entries(this.activity)) if ((a.done || 0) + (a.rev || 0) + (a.min || 0) > 0) s.add(k);
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
  toggleFavorite(id) { const t = this.byId.get(id); if (t) { t.favorite = !t.favorite; this.commit(); } }
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

  /* ----- queries ----- */
  neighbors(id) {
    const t = this.byId.get(id);
    const list = this.topics.filter(x => x.category === t.category);
    const i = list.indexOf(t);
    return { prev: list[i - 1] || null, next: list[i + 1] || null, index: i + 1, total: list.length };
  }
  nextUp() {
    for (const c of CATEGORIES) { const t = this.topics.find(x => x.category === c && !x.completed); if (t) return t; }
    return null;
  }
  dueAt(t) { if (!t.completed) return null; return (t.lastTs || t.completedAt || Date.now()) + SRS_DAYS[t.confidence] * DAY_MS; }
  isDue(t) { const d = this.dueAt(t); return d !== null && d <= Date.now(); }
  dueLabel(t) {
    const d = this.dueAt(t); if (d === null) return '';
    const now = Date.now();
    if (d <= now) { const n = Math.floor((now - d) / DAY_MS); return n < 1 ? 'Due today' : `${n}d overdue`; }
    const n = Math.ceil((d - now) / DAY_MS);
    return n === 1 ? 'Due tomorrow' : `Due in ${n}d`;
  }
  dueTopics() { return this.topics.filter(t => this.isDue(t)).sort((a, b) => this.dueAt(a) - this.dueAt(b)); }
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
  confDist() { const d = [0, 0, 0, 0, 0]; this.topics.forEach(t => d[t.confidence - 1]++); return d; }
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
      for (let i = 0; i < 7; i++) { const a = this.activity[dayKey(addDays(ws, i))]; if (a) { row.done += a.done || 0; row.rev += a.rev || 0; row.min += a.min || 0; } }
      out.push(row);
    }
    return out;
  }

  /* ----- achievements ----- */
  metrics() {
    const s = this.stats(), st = this.streak();
    return {
      done: s.done, ready: s.ready, notes: s.notes, minutes: s.minutes, revs: s.revCount,
      best: st.best, current: st.current,
      catDone: CATEGORIES.filter(c => { const x = this.catStats(c); return x.total && x.done === x.total; }).length,
      night: !!this.flags.owl
    };
  }
  achievementState() {
    const m = this.metrics();
    return ACHIEVEMENTS.map(a => { const [cur, goal] = a.prog(m); return { ...a, cur: Math.min(cur, goal), goal, unlocked: !!this.ach[a.id], at: this.ach[a.id] || 0 }; });
  }
  unlockNew(silent = false) {
    const m = this.metrics(), fresh = [];
    for (const a of ACHIEVEMENTS) {
      const [cur, goal] = a.prog(m);
      if (!this.ach[a.id] && cur >= goal) { this.ach[a.id] = Date.now(); fresh.push(a); }
    }
    return silent ? [] : fresh;
  }

  /* ----- data management ----- */
  exportData() {
    return { app: 'devpath', version: 2, exportedAt: new Date().toISOString(), progress: this.progressMap(), log: [...this.log], activity: this.activity, settings: this.settings, achievements: this.ach, flags: this.flags };
  }
  importData(obj) {
    if (!obj || typeof obj !== 'object' || !obj.progress || typeof obj.progress !== 'object') throw new Error('This file is not a DevPath backup.');
    writeJSON(LS.progress, obj.progress);
    writeJSON(LS.log, Array.isArray(obj.log) ? obj.log : []);
    writeJSON(LS.activity, obj.activity || {});
    if (obj.settings) writeJSON(LS.settings, obj.settings);
    writeJSON(LS.ach, obj.achievements || {});
    writeJSON(LS.flags, obj.flags || {});
  }
  resetProgress() {
    [LS.progress, LS.log, LS.activity, LS.ach, LS.flags, LS.timer].forEach(k => { try { localStorage.removeItem(k); } catch { /* ignore */ } });
  }
  notesMarkdown() {
    const withNotes = this.topics.filter(t => t.notes.trim());
    if (!withNotes.length) return '';
    let md = `# DevPath notes\n\n_Exported ${new Date().toLocaleString()}_\n`;
    CATEGORIES.forEach(c => {
      const items = withNotes.filter(t => t.category === c);
      if (!items.length) return;
      md += `\n## ${c}\n`;
      items.forEach(t => { md += `\n### ${t.title}\n\n${t.notes.trim()}\n`; });
    });
    return md;
  }
}

const store = new Store();
