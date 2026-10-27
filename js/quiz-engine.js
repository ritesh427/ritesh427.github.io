'use strict';
/* =========================================================
   DevPath Quiz & Assessment Engine
   ========================================================= */

const QB = {
  data: {},
  add(id, qs) {
    if (!this.data[id]) this.data[id] = [];
    this.data[id].push(...qs);
  },
  get(id) {
    return this.data[id] || [];
  },
  count(id) {
    return this.get(id).length;
  },
  MIN: 1, // minimum questions to enable testing a topic
  has(id) {
    return this.count(id) >= this.MIN;
  },
  topicsWithBank() {
    return Object.keys(this.data).filter(id => this.has(id)).length;
  },
  total() {
    return Object.values(this.data).reduce((acc, q) => acc + q.length, 0);
  }
};

const shuffle = arr => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* Smart draw: prioritizes questions missed previously */
function drawQuestions(topicId, n, only) {
  const bank = QB.get(topicId), seen = store.tests.q[topicId] || {};
  const pool = (only || bank.map((_, i) => i)).map(i => {
    const s = seen[i];
    // Weight increases significantly if missed previously
    const w = !s ? 3 : Math.max(0.6, 1 + s[1] * 3 - Math.min(s[0] - s[1], 3) * 0.35);
    return { i, w };
  });

  const out = [];
  while (out.length < n && pool.length) {
    let r = Math.random() * pool.reduce((a, p) => a + p.w, 0), k = 0;
    for (; k < pool.length - 1; k++) {
      r -= pool[k].w;
      if (r <= 0) break;
    }
    out.push(pool.splice(k, 1)[0].i);
  }
  return out;
}

const Quiz = {
  s: null,
  tick: null,
  MAX_STRIKES: 2, // 1st tab leave: warning; 2nd: test terminated
  active() { return !!this.s; },

  /* ----- setup ----- */
  openSetup(topicId) {
    const bank = QB.get(topicId);
    if (bank.length < QB.MIN) return false;
    const pref = store.settings.quiz || { n: 20, mode: 'exam', secs: 30 };
    const lens = this.lengths(topicId);
    this.s = {
      phase: 'setup',
      topicId,
      kind: 'full',
      n: lens.includes(pref.n) ? pref.n : lens[lens.length - 1],
      mode: pref.mode === 'practice' ? 'practice' : 'exam',
      secs: [0, 20, 30, 45, 60].includes(pref.secs) ? pref.secs : 30
    };
    return true;
  },

  lengths(topicId) {
    const c = QB.count(topicId);
    const candidateLengths = [5, 10, 15, 20, 30, 40];
    const out = candidateLengths.filter(n => n <= c);
    if (!out.length) out.push(c);
    return out;
  },

  setOpt(key, val) {
    const s = this.s;
    if (!s || s.phase !== 'setup') return;
    s[key] = key === 'mode' ? val : +val;
    store.settings.quiz = { n: s.n, mode: s.mode, secs: s.secs };
    store.saveSettings();
  },

  /* ----- execution ----- */
  start(opts = {}) {
    const s = this.s; if (!s) return;
    const only = opts.only || null;
    const n = only ? only.length : Math.min(s.n, (s.customQs ? s.customQs.length : QB.count(s.topicId)));
    if (only) { s.kind = 'retry'; s.mode = 'practice'; s.secs = 0; }
    
    if (s.customQs && s.customQs.length) {
      s.qs = s.customQs.slice(0, n).map((src, idx) => {
        const order = shuffle([0, 1, 2, 3]);
        return {
          topicId: src.topicId,
          i: src.idx !== undefined ? src.idx : idx,
          q: src.q,
          k: src.k || '',
          opts: order.map(j => (src.o || src.opts)[j]),
          a: order.indexOf(src.a),
          e: src.e || src.exp || '',
          secs: s.secs ? Math.round(s.secs * (src.k ? 1.5 : 1)) : 0
        };
      });
    } else {
      const bank = QB.get(s.topicId);
      s.qs = drawQuestions(s.topicId, n, only).map(i => {
        const src = bank[i], order = shuffle([0, 1, 2, 3]);
        return {
          topicId: s.topicId,
          i,
          q: src.q,
          k: src.k || '',
          opts: order.map(j => (src.o || src.opts)[j]),
          a: order.indexOf(src.a),
          e: src.e || src.exp || '',
          secs: s.secs ? Math.round(s.secs * (src.k ? 1.5 : 1)) : 0
        };
      });
    }

    s.n = s.qs.length;
    s.cur = 0;
    s.ans = [];
    s.times = [];
    s.strikes = 0;
    s.warn = false;
    s.dq = false;
    s.startedAt = Date.now();
    s.result = null;
    s.reviewFilter = 'all';
    this.beginQ();
  },

  beginQ() {
    const s = this.s, q = s.qs[s.cur];
    s.phase = 'q';
    s.sel = null;
    s.timedOut = false;
    s.qStart = Date.now();
    s.deadline = q.secs ? s.qStart + q.secs * 1000 : 0;
    this.startTicker();
  },

  startTicker() {
    this.stopTicker();
    if (!this.s || !this.s.deadline) return;
    this.tick = setInterval(() => this.onTick(), 100);
  },

  stopTicker() {
    if (this.tick) { clearInterval(this.tick); this.tick = null; }
  },

  remainingMs() {
    const s = this.s;
    return s && s.deadline ? Math.max(0, s.deadline - Date.now()) : Infinity;
  },

  onTick() {
    const s = this.s;
    if (!s || s.phase !== 'q' || !s.deadline) return this.stopTicker();
    if (this.remainingMs() <= 0) {
      this.stopTicker();
      this.submit(s.mode === 'exam' ? s.sel : null, true);
      this.onChange && this.onChange();
    } else {
      this.onTimer && this.onTimer();
    }
  },

  /* ----- answering flow ----- */
  pick(i) {
    const s = this.s; if (!s || s.phase !== 'q') return;
    if (s.mode === 'practice') this.submit(i, false);
    else s.sel = i;
  },

  submit(sel, timedOut) {
    const s = this.s; if (!s || s.phase !== 'q') return;
    const q = s.qs[s.cur];
    s.ans[s.cur] = (sel === undefined || sel === null) ? null : sel;
    s.times[s.cur] = Math.min(Date.now() - s.qStart, q.secs ? q.secs * 1000 : 1e9);
    this.stopTicker();
    if (s.mode === 'practice') {
      s.phase = 'fb';
      s.timedOut = !!timedOut;
    } else {
      this.advance();
    }
  },

  confirm() {
    const s = this.s;
    if (!s || s.phase !== 'q' || s.mode !== 'exam') return;
    this.submit(s.sel, false);
  },

  advance() {
    const s = this.s; if (!s) return;
    if (s.cur + 1 >= s.n) return this.finish(false);
    s.cur++;
    this.beginQ();
  },

  /* ----- tab switch & anti-cheat ----- */
  onHidden() {
    const s = this.s;
    if (!s || s.mode !== 'exam' || (s.phase !== 'q' && s.phase !== 'fb')) return false;
    const now = Date.now();
    if (s._lastHidden && now - s._lastHidden < 1500) return false;
    s._lastHidden = now;
    s.strikes++;
    if (s.strikes >= this.MAX_STRIKES) {
      this.finish(true);
      return true;
    }
    s.warn = true;
    return true;
  },

  /* ----- finish & scoring ----- */
  finish(dq) {
    const s = this.s; if (!s) return;
    this.stopTicker();
    
    let correct = 0;
    const r = [];
    s.qs.forEach((q, k) => {
      const answered = s.ans[k] !== undefined && s.ans[k] !== null;
      const ok = answered && s.ans[k] === q.a;
      if (ok) correct++;
      if (answered || !dq) r.push([q.i, ok ? 1 : 0]);
    });

    const pct = s.n ? Math.round(correct / s.n * 100) : 0;
    const passed = !dq && s.kind === 'full' && pct >= PASS_MARK;
    const secs = Math.round((Date.now() - s.startedAt) / 1000);
    const att = {
      topicId: s.topicId,
      ts: Date.now(),
      n: s.n,
      correct,
      pct,
      passed,
      secs,
      mode: s.mode,
      kind: s.kind,
      dq: !!dq,
      strikes: s.strikes,
      r
    };

    const eff = store.recordTest(att);
    s.dq = !!dq;
    s.phase = 'result';
    s.result = {
      ...att,
      ...eff,
      wrong: s.qs.map((q, k) => (s.ans[k] === q.a ? -1 : q.i)).filter(x => x >= 0)
    };
  },

  quit() {
    this.stopTicker();
    this.s = null;
  },

  startDailyChallenge() {
    const all = [];
    for (const [topicId, qs] of Object.entries(QB.data)) {
      qs.forEach((q, idx) => all.push({ topicId, idx, ...q }));
    }
    if (!all.length) return false;
    
    // Deterministic date seed for consistent daily questions
    const today = dayKey();
    let seed = today.split('-').reduce((acc, part) => acc * 31 + (+part || 0), 17);
    const pseudoRand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    
    const shuffled = all.slice().sort(() => pseudoRand() - 0.5);
    const selected = shuffled.slice(0, Math.min(10, shuffled.length));

    this.s = {
      phase: 'setup',
      topicId: 'daily',
      kind: 'daily',
      n: selected.length,
      mode: 'exam',
      secs: 30,
      customQs: selected
    };
    return true;
  },

  startWeakPractice(filterCat) {
    const missed = [];
    for (const [topicId, qMap] of Object.entries(store.tests.q)) {
      const t = store.byId.get(topicId);
      if (filterCat && filterCat !== 'all' && t && t.category !== filterCat) continue;
      const bank = QB.get(topicId);
      for (const [qIdxStr, stats] of Object.entries(qMap)) {
        if (stats[1] > 0 && bank[+qIdxStr]) {
          missed.push({ topicId, idx: +qIdxStr, ...bank[+qIdxStr] });
        }
      }
    }
    if (!missed.length) return false;
    const selected = shuffle(missed).slice(0, Math.min(20, missed.length));
    this.s = {
      phase: 'setup',
      topicId: 'weak_practice',
      kind: 'weak_practice',
      n: selected.length,
      mode: 'practice',
      secs: 0,
      customQs: selected
    };
    return true;
  },

  stats(topicId) {
    return store.testStats(topicId);
  },

  retryMissed() {
    const s = this.s; if (!s || !s.result) return;
    const only = [...new Set(s.result.wrong)];
    if (!only.length) return;
    const topicId = s.topicId;
    this.s = {
      phase: 'setup',
      topicId,
      kind: 'retry',
      n: only.length,
      mode: 'practice',
      secs: 0
    };
    this.start({ only });
  }
};
