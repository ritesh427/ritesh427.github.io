'use strict';
/* =========================================================
   DevPath Views & UI Layout Templates
   ========================================================= */

const ui = {
  route: { page: 'dashboard', cat: null },
  filters: { q: '', cat: 'all', status: 'all', diff: 'all', sort: 'course' },
  view: store.settings.view || 'grid',
  rtab: 'due',
  itab: 'drill',
  expanded: new Set(),
  panelId: null,
  drill: {
    scope: 'all',
    includeAll: false,
    phase: 'idle',
    topic: null,
    prompts: [],
    total: 120,
    left: 120,
    running: false,
    timer: null,
    lastId: null,
    session: { n: 0, nailed: 0, okay: 0, missed: 0 }
  }
};

const Views = {};
const catHref = c => `#/category/${encodeURIComponent(c)}`;
const mmss = s => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

/* ----- component helpers ----- */
const hl = (s, q) => {
  s = String(s);
  const toks = (q || '').toLowerCase().split(/\s+/).filter(Boolean).map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!toks.length) return esc(s);
  return s.split(new RegExp('(' + toks.join('|') + ')', 'gi')).map((p, i) => i % 2 ? `<mark>${esc(p)}</mark>` : esc(p)).join('');
};

const confDots = t => `<span class="cdots" title="${CONF_LABELS[t.confidence]}" aria-label="Confidence: ${CONF_LABELS[t.confidence]}">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= t.confidence ? 'on' : ''}"></i>`).join('')}</span>`;

const resLinks = t => [['pdfLink', 'file', 'PDF'], ['oneNoteLink', 'note', 'OneNote'], ['gitLink', 'code', 'Git']]
  .filter(([k]) => t[k])
  .map(([k, ic, l]) => `<a class="res" href="${esc(t[k])}" target="_blank" rel="noopener noreferrer" title="Open ${l} in new tab">${icon(ic, 14)}<span>${l}</span></a>`).join('');

function ring({ pct, size = 120, stroke = 10, color = 'var(--primary)', label = '', sub = '' }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, h = size / 2;
  const off = c * (1 - clamp(pct, 0, 100) / 100);
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="ring-bg" cx="${h}" cy="${h}" r="${r}" stroke-width="${stroke}"/><circle class="ring-fg" cx="${h}" cy="${h}" r="${r}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" style="--circ:${c};stroke:${color}" transform="rotate(-90 ${h} ${h})"/></svg><div class="ring-label">${label}${sub ? `<small>${sub}</small>` : ''}</div></div>`;
}

const pageHead = ({ eyebrow = '', title, sub = '', actions = '' }) =>
  `<header class="page-head"><div>${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h1>${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ''}</div>${actions ? `<div class="page-actions">${actions}</div>` : ''}</header>`;

const emptyState = (emoji, title, text, action = '') =>
  `<div class="empty"><div class="empty-emoji">${emoji}</div><h3>${title}</h3><p>${text}</p>${action}</div>`;

function testBtn(t) {
  if (!QB.has(t.id)) return '';
  const st = store.testStats(t.id);
  const badge = st.best !== null ? `<b class="${st.passed ? 'pass' : ''}">${st.best}%</b>` : '';
  return `<button class="btn sm test-btn" data-action="quiz-open" data-id="${t.id}" title="Take knowledge exam">${icon('target', 14)} Test ${badge}</button>`;
}

function panelTestHTML(t) {
  if (!QB.has(t.id)) {
    return `<div class="panel-test"><h4>Knowledge Assessment</h4><p class="muted small">Questions for this topic are being compiled.</p></div>`;
  }
  const st = store.testStats(t.id), n = QB.count(t.id);
  return `<div class="panel-test">
    <h4>Knowledge Assessment</h4>
    <div class="pt-row">
      <div class="pt-stats">
        <span>${n} questions</span>
        <span>Best: <b>${st.best === null ? '—' : st.best + '%'}</b></span>
        <span>Attempts: <b>${st.attempts}</b></span>
        ${st.passed ? '<span><b>Passed ✓</b></span>' : ''}
      </div>
      <button class="btn primary" data-action="quiz-open" data-id="${t.id}">
        ${icon('target', 15)} ${st.attempts ? 'Retake Exam' : 'Take Exam'}
      </button>
    </div>
    <small class="muted">Score ${PASS_MARK}%+ in Exam mode to automatically complete this topic.</small>
  </div>`;
}

function card(t, o = {}) {
  const m = catMeta(t.category), due = store.isDue(t);
  return `<article class="tcard${t.completed ? ' is-done' : ''}" data-id="${t.id}" style="--cat:${m.color}">
    <div class="tcard-top">
      <button class="check${t.completed ? ' on' : ''}" data-action="toggle" data-id="${t.id}" aria-pressed="${t.completed}" aria-label="${t.completed ? 'Mark incomplete' : 'Mark complete'}: ${esc(t.title)}">${icon('check', 14)}</button>
      <span class="tag"><i>${m.icon}</i>${esc(t.category)}</span>
      <span class="spacer"></span>
      ${due ? '<span class="pill warn" title="Spaced repetition review due">Due</span>' : ''}
      <button class="star${t.favorite ? ' on' : ''}" data-action="fav" data-id="${t.id}" aria-pressed="${t.favorite}" aria-label="Favorite: ${esc(t.title)}">${icon('star', 16)}</button>
    </div>
    <h3 class="tcard-title" data-action="open" data-id="${t.id}" tabindex="0" role="button">${t.num ? `<span class="num">${esc(t.num)}</span>` : ''}${hl(t.name, o.q)}</h3>
    <div class="tcard-meta">
      <span class="meta-i">${icon('clock', 13)}${esc(t.duration)}</span>
      <span class="diff ${t.difficulty.toLowerCase()}">${t.difficulty}</span>
      ${confDots(t)}
      ${t.notes.trim() ? `<span class="meta-i has-notes" title="Personal study notes">${icon('edit', 13)}</span>` : ''}
    </div>
    <div class="tcard-actions">
      ${resLinks(t)}
      ${testBtn(t)}
      <button class="btn sm push" data-action="open" data-id="${t.id}">Details</button>
    </div>
    ${o.extra || ''}
  </article>`;
}

function row(t, o = {}) {
  const m = catMeta(t.category);
  return `<article class="trow${t.completed ? ' is-done' : ''}" data-id="${t.id}" style="--cat:${m.color}">
    <button class="check${t.completed ? ' on' : ''}" data-action="toggle" data-id="${t.id}" aria-pressed="${t.completed}" aria-label="${t.completed ? 'Mark incomplete' : 'Mark complete'}: ${esc(t.title)}">${icon('check', 14)}</button>
    <div class="trow-main">
      <span class="trow-title" data-action="open" data-id="${t.id}" tabindex="0" role="button">${t.num ? `<span class="num">${esc(t.num)}</span>` : ''}${hl(t.name, o.q)}</span>
      <span class="trow-sub">
        <span class="tag sm"><i>${m.icon}</i>${esc(t.category)}</span>
        <span class="diff ${t.difficulty.toLowerCase()}">${t.difficulty}</span>
        ${confDots(t)}
        ${store.isDue(t) ? '<span class="pill warn">Due</span>' : ''}
      </span>
    </div>
    <div class="trow-res">${resLinks(t)}${testBtn(t)}</div>
    <button class="star${t.favorite ? ' on' : ''}" data-action="fav" data-id="${t.id}" aria-pressed="${t.favorite}" aria-label="Favorite: ${esc(t.title)}">${icon('star', 16)}</button>
    <button class="btn sm" data-action="open" data-id="${t.id}">Details</button>
  </article>`;
}

const gridOf = (list, o = {}) => `<div class="cards">${list.map(t => card(t, o)).join('')}</div>`;

/* ----- Sidebar ----- */
Views.sidebar = () => {
  const s = store.stats(), { page, cat } = ui.route, due = s.due;
  const g = store.globalTestStats();
  const item = (href, ico, label, key, badge = '') =>
    `<a class="nav-item${page === key ? ' active' : ''}" href="${href}" ${page === key ? 'aria-current="page"' : ''}>${icon(ico, 18)}<span>${label}</span>${badge}</a>`;
  
  return `
    <div class="brand">
      <span class="brand-mark">${icon('bolt', 18)}</span>
      <span class="brand-name">DevPath</span>
    </div>
    <div class="side-progress">
      <div class="sp-row"><span>Mastery Progress</span><b>${s.prog}%</b></div>
      <div class="bar"><i style="width:${s.prog}%"></i></div>
      <small>${s.done} of ${s.total} topics completed</small>
    </div>
    <nav class="nav" aria-label="Pages">
      ${item('#/dashboard', 'home', 'Dashboard', 'dashboard')}
      ${item('#/tests', 'target', 'Tests & Exams', 'tests', `<span class="nav-badge ${g.passedTopicsCount ? 'ok' : ''}">${g.passedTopicsCount}/${QB.topicsWithBank()}</span>`)}
      ${item('#/library', 'grid', 'Curriculum Library', 'library', `<span class="nav-badge">${s.total}</span>`)}
      ${item('#/roadmap', 'map', 'Roadmap', 'roadmap')}
      ${item('#/interview', 'briefcase', 'Interview Drill', 'interview', s.ready ? `<span class="nav-badge ok">${s.ready}</span>` : '')}
      ${item('#/revision', 'refresh', 'Revision Queue', 'revision', due ? `<span class="nav-badge warn">${due}</span>` : '')}
      ${item('#/insights', 'chart', 'Learning Insights', 'insights')}
      <div class="nav-label">Curriculum Domains</div>
      ${CATEGORIES.map(c => {
        const x = store.catStats(c), m = catMeta(c), on = page === 'category' && cat === c;
        return `<a class="nav-item cat${on ? ' active' : ''}" href="${catHref(c)}" style="--cat:${m.color}" ${on ? 'aria-current="page"' : ''}>
          <i class="cat-dot">${m.icon}</i>
          <span>${esc(c)}</span>
          <span class="nav-count${x.done === x.total ? ' full' : ''}">${x.done}/${x.total}</span>
        </a>`;
      }).join('')}
    </nav>
    <div class="side-foot">
      <button class="btn ghost sm" data-action="help">${icon('keyboard', 15)} Shortcuts</button>
      <button class="btn ghost sm" data-action="settings">${icon('sliders', 15)} Settings</button>
    </div>`;
};

/* ----- Dashboard ----- */
const greeting = () => {
  const h = new Date().getHours();
  return h < 5 ? 'Burning the midnight oil' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 22 ? 'Good evening' : 'Late-night session';
};

function etaText(remaining, perDay) {
  if (!remaining) return 'All curriculum topics completed! 🎉';
  const days = Math.ceil(remaining / perDay), d = addDays(new Date(), days);
  return `${plural(remaining, 'topic')} left · ~${days} days at ${perDay}/day (${d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })})`;
}

function heatmapHTML(weeks = 20) {
  const h = store.heat(weeks);
  let months = '';
  for (let c = 0; c < weeks; c++) {
    const d = addDays(h.start, c * 7), pv = addDays(h.start, (c - 1) * 7);
    months += `<span>${c === 0 || d.getMonth() !== pv.getMonth() ? d.toLocaleDateString(undefined, { month: 'short' }) : ''}</span>`;
  }
  const cells = h.cells.map(c => {
    const parts = [];
    if (c.a.done) parts.push(plural(c.a.done, 'topic'));
    if (c.a.rev) parts.push(plural(c.a.rev, 'revision'));
    if (c.a.min) parts.push(`${c.a.min} min focus`);
    const txt = parts.length ? parts.join(', ') : c.score ? 'Studied' : 'No activity';
    return `<i class="hc lv${c.level}${c.future ? ' fut' : ''}" title="${esc(c.date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }))}: ${esc(txt)}"></i>`;
  }).join('');
  const active = h.cells.filter(c => c.score > 0).length;
  return `<div class="heat-wrap">
    <div class="heat-months" style="--weeks:${weeks}">${months}</div>
    <div class="heat" style="--weeks:${weeks}" role="img" aria-label="Activity over the last ${weeks} weeks: ${active} active days">${cells}</div>
  </div>
  <div class="heat-foot">
    <span>${plural(active, 'active day')} in the last ${weeks} weeks</span>
    <span class="heat-legend">Less ${[0, 1, 2, 3, 4].map(l => `<i class="hc lv${l}"></i>`).join('')} More</span>
  </div>`;
}

function achCard(a) {
  const pct = Math.round(a.cur / a.goal * 100);
  return `<div class="ach${a.unlocked ? ' on' : ''}" title="${esc(a.desc)}">
    <span class="ach-ico">${a.icon}</span>
    <div>
      <b>${esc(a.name)}</b>
      <small>${esc(a.desc)}</small>
      ${a.unlocked ? `<em>Unlocked ${new Date(a.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</em>` : `<div class="bar thin"><i style="width:${pct}%"></i></div><em>${a.cur}/${a.goal}</em>`}
    </div>
  </div>`;
}

Views.dashboard = () => {
  const s = store.stats(), st = store.streak(), goal = store.settings.dailyGoal;
  const today = store.activity[dayKey()] || { done: 0, rev: 0, min: 0 };
  const next = store.nextUp(), due = store.dueTopics();
  const name = (store.settings.name || '').trim();
  const goalPct = Math.min(100, Math.round(today.done / goal * 100));

  const msg = today.done >= goal ? 'Daily target hit 🎯 Keep pushing or revise to reinforce!'
    : st.current > 0 && !st.todayDone ? `Keep your ${st.current}-day streak alive with 1 lesson today.`
    : st.todayDone ? 'Great momentum today! Test your recall or take a quiz.'
    : 'Study and complete one topic today to kick off your streak!';

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i - 6);
    return { on: store.scoreOf(dayKey(d)) > 0, today: i === 6, l: d.toLocaleDateString(undefined, { weekday: 'narrow' }) };
  });

  /* Up Next Recommendation */
  let upnext;
  if (next) {
    const m = catMeta(next.category), nb = store.neighbors(next.id), cs = store.catStats(next.category);
    upnext = `<div class="card upnext" style="--cat:${m.color}">
      <div class="card-label">${icon('bolt', 15)} Up Next <span class="dot-sep"></span> <span>${m.icon} ${esc(next.category)}</span></div>
      <h2>${next.num ? `<span class="num">${esc(next.num)}</span>` : ''}${esc(next.name)}</h2>
      <p class="muted">Lesson ${nb.index} of ${nb.total} in ${esc(next.category)} · ${cs.pct}% category complete · ${next.difficulty} · ~${next.duration}</p>
      <div class="row-actions">
        <button class="btn primary" data-action="focus" data-id="${next.id}">${icon('play', 15, 'ico-fill')} Start Focus</button>
        ${resLinks(next)}
        ${testBtn(next)}
        <button class="btn" data-action="toggle" data-id="${next.id}">${icon('check', 15)} Complete</button>
        <button class="btn ghost" data-action="open" data-id="${next.id}">Details</button>
      </div>
    </div>`;
  } else {
    upnext = `<div class="card upnext done">
      <div class="card-label">${icon('target', 15)} All Clear!</div>
      <h2>🎉 Complete Curriculum Mastered!</h2>
      <p class="muted">You have finished every lesson. Keep sharp with mock interviews or challenge a friend.</p>
      <div class="row-actions">
        <button class="btn primary" data-action="nav" data-href="#/interview">Mock Interview Drill</button>
        <button class="btn" data-action="nav" data-href="#/revision">Open Revision</button>
      </div>
    </div>`;
  }

  /* Mastery by Category */
  const mastery = CATEGORIES.map(c => {
    const x = store.catStats(c), m = catMeta(c);
    const r = x.total ? x.ready / x.total * 100 : 0, d = x.total ? (x.done - x.ready) / x.total * 100 : 0;
    return `<a class="mrow" href="${catHref(c)}" style="--cat:${m.color}">
      <span class="mrow-name"><i>${m.icon}</i>${esc(c)}</span>
      <span class="mbar"><i class="seg ready" style="width:${r}%"></i><i class="seg done" style="width:${d}%"></i></span>
      <span class="mrow-val">${x.done}/${x.total}</span>
    </a>`;
  }).join('');

  /* Confidence Distribution */
  const dist = store.confDist(), mx = Math.max(1, ...dist), short = ['New', 'Basic', 'Good', 'Ready', 'Expert'];
  const distHTML = `<div class="dist">${dist.map((n, i) => `<div class="dist-col"><span class="dist-n">${n}</span><div class="dist-bar"><i class="c${i + 1}" style="height:${n / mx * 100}%"></i></div><span class="dist-e">${CONF_EMOJI[i + 1]}</span><small>${short[i]}</small></div>`).join('')}</div>`;

  /* Revision Due */
  const dueHTML = due.length
    ? `<ul class="mini-list">${due.slice(0, 5).map(t => `<li><button class="mini-item" data-action="open" data-id="${t.id}" style="--cat:${catMeta(t.category).color}"><i class="dotc"></i><span class="mi-title">${esc(t.name)}</span><span class="mi-sub">${esc(t.category)}</span><span class="pill warn">${esc(store.dueLabel(t))}</span></button></li>`).join('')}</ul>${due.length > 5 ? `<a class="more" href="#/revision">+${due.length - 5} more due in Revision ${icon('arrow', 14)}</a>` : `<a class="more" href="#/revision">Open Revision ${icon('arrow', 14)}</a>`}`
    : emptyState('✨', 'Revision Queue Clear', 'No spaced repetition reviews due right now. Topics will reappear as their intervals mature.');

  /* Recent / Favorites */
  const ts = t => Math.max(t.completedAt || 0, t.lastTs || 0);
  const recent = store.topics.filter(t => t.favorite || t.completed).sort((a, b) => (b.favorite - a.favorite) || (ts(b) - ts(a))).slice(0, 6);

  /* Achievements */
  const ach = store.achievementState();
  const shown = [...ach.filter(a => a.unlocked).sort((a, b) => b.at - a.at), ...ach.filter(a => !a.unlocked).sort((a, b) => b.cur / b.goal - a.cur / a.goal)].slice(0, 6);
  const unlockedN = ach.filter(a => a.unlocked).length;

  return `
  ${pageHead({
    eyebrow: new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }),
    title: `${greeting()}${name ? `, ${esc(name)}` : ''} <span class="wave">👋</span>`,
    sub: msg,
    actions: `<button class="btn primary" data-action="focus">${icon('play', 15, 'ico-fill')} Focus Session</button><button class="btn" data-action="palette">${icon('command', 15)} Palette <kbd>Ctrl K</kbd></button>`
  })}

  <section class="row-hero">
    ${upnext}
    <div class="card ring-card">
      <div class="card-label">${icon('target', 15)} Overall Mastery</div>
      ${ring({ pct: s.prog, size: 118, stroke: 11, label: `<b data-count="${s.prog}" data-suffix="%">${s.prog}%</b>`, sub: 'complete' })}
      <p class="muted small">${s.done}/${s.total} topics</p>
    </div>
    <div class="card ring-card">
      <div class="card-label">${icon('check', 15)} Daily Target</div>
      ${ring({ pct: goalPct, size: 118, stroke: 11, color: 'var(--success)', label: `<b>${today.done}<span class="slash">/${goal}</span></b>`, sub: 'completed' })}
      <p class="muted small">${plural(today.rev, 'revision')} · ${today.min} min focus</p>
    </div>
    <div class="card streak-card">
      <div class="card-label">${icon('flame', 15)} Active Streak</div>
      <div class="big"><span data-count="${st.current}">${st.current}</span><small>${st.current === 1 ? 'day' : 'days'}</small></div>
      <div class="week-strip">${last7.map(d => `<span class="${d.on ? 'on' : ''}${d.today ? ' today' : ''}"><i></i>${d.l}</span>`).join('')}</div>
      <p class="muted small">All-time Best: ${plural(st.best, 'day')}</p>
    </div>
  </section>

  <section class="stats-grid">
    <button class="stat-card" data-action="nav" data-href="#/library"><span class="stat-ico">${icon('grid', 18)}</span><h3>Curriculum Topics</h3><div class="value" data-count="${s.total}">${s.total}</div><small>${etaText(s.total - s.done, goal)}</small></button>
    <button class="stat-card" data-action="lib" data-status="done"><span class="stat-ico ok">${icon('check', 18)}</span><h3>Completed</h3><div class="value" data-count="${s.done}">${s.done}</div><small>${s.prog}% completed</small></button>
    <button class="stat-card" data-action="nav" data-href="#/interview"><span class="stat-ico acc">${icon('briefcase', 18)}</span><h3>Interview Ready</h3><div class="value" data-count="${s.ready}">${s.ready}</div><small>confidence 4 or 5</small></button>
    <button class="stat-card" data-action="nav" data-href="#/revision"><span class="stat-ico warn">${icon('refresh', 18)}</span><h3>Due for Revision</h3><div class="value" data-count="${s.due}">${s.due}</div><small>${s.revs} needing refresh</small></button>
    <button class="stat-card" data-action="nav" data-href="#/insights"><span class="stat-ico">${icon('clock', 18)}</span><h3>Total Focus Time</h3><div class="value">${fmtMin(s.minutes)}</div><small>in deep focus</small></button>
  </section>

  <section class="grid-2">
    <div class="card">
      <div class="card-head">
        <h3>Category Mastery</h3>
        <div class="legend"><span><i class="lgd ready"></i>Ready (4-5)</span><span><i class="lgd done"></i>Done</span><span><i class="lgd rest"></i>Remaining</span></div>
      </div>
      <div class="mastery">${mastery}</div>
    </div>
    <div class="card">
      <div class="card-head">
        <h3>Revision Schedule</h3>
        ${due.length ? `<span class="pill warn">${due.length} due</span>` : ''}
      </div>
      ${dueHTML}
    </div>
  </section>

  <section class="grid-2">
    <div class="card"><div class="card-head"><h3>Learning Activity Heatmap</h3></div>${heatmapHTML(20)}</div>
    <div class="card"><div class="card-head"><h3>Confidence Distribution</h3><small class="muted">All 206 Topics</small></div>${distHTML}</div>
  </section>

  <section>
    <div class="section-head">
      <h2>Recent &amp; Starred Lessons</h2>
      <a class="more" href="#/library">Explore All ${icon('arrow', 14)}</a>
    </div>
    ${recent.length ? gridOf(recent) : emptyState('🚀', 'No Activity Recorded Yet', 'Star topics with ★ or complete lessons to quickly resume them here.')}
  </section>

  <section>
    <div class="section-head">
      <h2>Achievements &amp; Badges <small class="muted">${unlockedN}/${ach.length}</small></h2>
      <a class="more" href="#/insights">View All ${icon('arrow', 14)}</a>
    </div>
    <div class="ach-grid compact">${shown.map(achCard).join('')}</div>
  </section>`;
};

/* ----- Library & Category Views ----- */
function filteredTopics() {
  const f = ui.filters;
  let list = store.topics.slice();
  if (f.cat !== 'all') list = list.filter(t => t.category === f.cat);
  if (f.status === 'todo') list = list.filter(t => !t.completed);
  else if (f.status === 'done') list = list.filter(t => t.completed);
  else if (f.status === 'fav') list = list.filter(t => t.favorite);
  else if (f.status === 'due') list = list.filter(t => store.isDue(t));
  else if (f.status === 'ready') list = list.filter(t => t.confidence >= 4);
  if (f.diff !== 'all') list = list.filter(t => t.difficulty === f.diff);
  
  const toks = f.q.toLowerCase().split(/\s+/).filter(Boolean);
  if (toks.length) {
    list = list.filter(t => {
      const hay = `${t.title} ${t.category} ${t.difficulty} ${t.completed ? 'done completed' : 'todo pending'} ${t.favorite ? 'favorite fav' : ''} ${t.notes}`.toLowerCase();
      return toks.every(k => hay.includes(k));
    });
  }

  const sorts = {
    course: (a, b) => a.order - b.order,
    az: (a, b) => a.name.localeCompare(b.name),
    'conf-asc': (a, b) => a.confidence - b.confidence || a.order - b.order,
    'conf-desc': (a, b) => b.confidence - a.confidence || a.order - b.order,
    recent: (a, b) => Math.max(b.lastTs || 0, b.completedAt || 0) - Math.max(a.lastTs || 0, a.completedAt || 0) || a.order - b.order
  };
  return list.sort(sorts[f.sort] || sorts.course);
}

Views.library = ({ cat }) => {
  const f = ui.filters, list = filteredTopics(), isCat = !!cat, total = isCat ? store.catStats(cat).total : store.topics.length;
  let head;
  if (isCat) {
    const m = catMeta(cat), x = store.catStats(cat), nxt = store.topics.find(t => t.category === cat && !t.completed);
    head = `<div class="card cat-hero" style="--cat:${m.color}">
      <div class="cat-hero-ico">${m.icon}</div>
      <div class="cat-hero-text">
        <p class="eyebrow">Curriculum Domain</p>
        <h1>${esc(cat)}</h1>
        <p class="sub">${esc(m.blurb)}</p>
        <div class="cat-hero-meta">
          <span>${x.done}/${x.total} Completed</span>
          <span>${x.readyAny} Interview-Ready</span>
          <span>${fmtMin(x.minutes)} Focused</span>
          <span>Avg Confidence: ${x.avg.toFixed(1)}/5</span>
        </div>
      </div>
      <div class="cat-hero-side">
        ${ring({ pct: x.pct, size: 92, stroke: 9, color: 'var(--cat)', label: `<b>${x.pct}%</b>` })}
        ${nxt ? `<button class="btn primary" data-action="focus" data-id="${nxt.id}">${icon('play', 15, 'ico-fill')} Continue</button>` : '<span class="pill ok">Domain Complete 🎉</span>'}
      </div>
    </div>`;
  } else {
    head = pageHead({
      eyebrow: 'Curriculum Library',
      title: 'Full 206 Topics',
      sub: `${store.topics.length} backend & distributed systems topics across ${CATEGORIES.length} categories.`
    });
  }

  const chips = isCat ? '' : `<div class="chips" role="group" aria-label="Category filter">
    <button class="chip-btn${f.cat === 'all' ? ' on' : ''}" data-action="filter" data-key="cat" data-val="all">All</button>
    ${CATEGORIES.map(c => `<button class="chip-btn${f.cat === c ? ' on' : ''}" style="--cat:${catMeta(c).color}" data-action="filter" data-key="cat" data-val="${esc(c)}">${catMeta(c).icon} ${esc(c)}</button>`).join('')}
  </div>`;

  const statuses = [['all', 'All'], ['todo', 'To Do'], ['done', 'Done'], ['fav', '★ Starred'], ['due', 'Due'], ['ready', 'Ready (4-5)']];
  const sel = (key, opts) => `<select data-change="filter" data-key="${key}" aria-label="${key}">${opts.map(([v, l]) => `<option value="${v}"${f[key] === v ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
  
  const toolbar = `<div class="toolbar card">${chips}<div class="toolbar-row">
    <div class="seg-group" role="group" aria-label="Status">${statuses.map(([v, l]) => `<button class="seg-btn${f.status === v ? ' on' : ''}" data-action="filter" data-key="status" data-val="${v}">${l}</button>`).join('')}</div>
    <div class="toolbar-right">
      ${sel('diff', [['all', 'Any Difficulty'], ['Intermediate', 'Intermediate'], ['Advanced', 'Advanced']])}
      ${sel('sort', [['course', 'Course Order'], ['az', 'Alphabetical'], ['conf-asc', 'Confidence (Low→High)'], ['conf-desc', 'Confidence (High→Low)'], ['recent', 'Recently Studied']])}
      <div class="seg-group icon-only" role="group" aria-label="Layout">
        <button class="seg-btn${ui.view === 'grid' ? ' on' : ''}" data-action="view" data-val="grid" aria-label="Grid view">${icon('grid', 16)}</button>
        <button class="seg-btn${ui.view === 'list' ? ' on' : ''}" data-action="view" data-val="list" aria-label="List view">${icon('list', 16)}</button>
      </div>
    </div>
  </div></div>`;

  const filtersOn = f.q || f.status !== 'all' || f.diff !== 'all' || (!isCat && f.cat !== 'all');
  const summary = `<div class="result-line">
    <span>Showing <b>${list.length}</b> of ${total} topics${f.q ? ` matching “${esc(f.q)}”` : ''}</span>
    ${filtersOn ? '<button class="btn ghost sm" data-action="reset-filters">Reset Filters</button>' : ''}
  </div>`;

  const body = !list.length
    ? emptyState('🔎', 'No Matching Topics', 'Try searching for another keyword or clearing active filters.', '<button class="btn primary" data-action="reset-filters">Clear Filters</button>')
    : ui.view === 'list' ? `<div class="rows">${list.map(t => row(t, { q: f.q })).join('')}</div>` : gridOf(list, { q: f.q });

  return `${head}${toolbar}${summary}${body}`;
};

/* ----- Roadmap ----- */
Views.roadmap = () => {
  const s = store.stats(), goal = store.settings.dailyGoal;
  const stats = CATEGORIES.map(c => ({ c, ...store.catStats(c) }));
  const curIdx = stats.findIndex(x => x.done < x.total);
  const hoursLeft = (s.total - s.done) * 2;

  const items = stats.map((x, i) => {
    const m = catMeta(x.c);
    const state = x.done === x.total ? 'complete' : i === curIdx ? 'current' : x.done > 0 ? 'started' : 'todo';
    const label = { complete: 'Completed', current: 'Current Phase', started: 'In Progress', todo: 'Upcoming' }[state];
    const open = ui.expanded.has(x.c) || (state === 'current' && !ui.expanded.has('!' + x.c));
    const list = store.topics.filter(t => t.category === x.c);

    return `<li class="tl-item ${state}" style="--cat:${m.color}">
      <div class="tl-marker">${state === 'complete' ? icon('check', 18) : i + 1}</div>
      <div class="card tl-card">
        <div class="tl-head">
          <span class="tl-ico">${m.icon}</span>
          <div class="tl-title">
            <h3>${esc(x.c)}</h3>
            <p>${esc(m.blurb)}</p>
          </div>
          <span class="pill ${state === 'complete' ? 'ok' : state === 'current' ? 'acc' : ''}">${label}</span>
        </div>
        <div class="tl-prog">
          <div class="bar"><i style="width:${x.pct}%"></i></div>
          <span>${x.done}/${x.total} (${x.pct}%)</span>
        </div>
        <div class="tl-actions">
          <a class="btn sm primary" href="${catHref(x.c)}">Explore Domain ${icon('arrow', 14)}</a>
          <button class="btn sm" data-action="expand" data-cat="${esc(x.c)}" aria-expanded="${open}">
            ${open ? 'Collapse' : 'Expand'} Checklist ${icon('chevron', 14, open ? 'flip' : '')}
          </button>
        </div>
        ${open ? `<ul class="tl-list">${list.map(t => `<li class="${t.completed ? 'done' : ''}">
          <button class="check sm${t.completed ? ' on' : ''}" data-action="toggle" data-id="${t.id}" aria-pressed="${t.completed}" aria-label="Toggle ${esc(t.title)}">${icon('check', 12)}</button>
          <span data-action="open" data-id="${t.id}" tabindex="0" role="button">${t.num ? `<b>${esc(t.num)}</b> ` : ''}${esc(t.name)}</span>
          ${testBtn(t)}
        </li>`).join('')}</ul>` : ''}
      </div>
    </li>`;
  }).join('');

  return `${pageHead({
    eyebrow: 'Full Engineering Roadmap',
    title: 'Progressive Mastery Curriculum',
    sub: curIdx === -1 ? 'Full roadmap complete!' : `Phase ${curIdx + 1} of ${stats.length}: <b>${esc(stats[curIdx].c)}</b> · ~${hoursLeft}h of material remaining · ${etaText(s.total - s.done, goal)}`
  })}
  <ol class="timeline">${items}</ol>`;
};

/* ----- Revision ----- */
Views.revision = () => {
  const due = store.dueTopics();
  const weak = store.topics.filter(t => t.completed && t.confidence < 4).sort((a, b) => a.confidence - b.confidence || store.dueAt(a) - store.dueAt(b));
  const all = store.topics.filter(t => t.completed).sort((a, b) => store.dueAt(a) - store.dueAt(b));
  const tabs = [['due', 'Due Now', due], ['weak', 'Needs Work (<4)', weak], ['all', 'All Scheduled', all]];
  const list = (tabs.find(t => t[0] === ui.rtab) || tabs[0])[2];
  const fc = store.forecast(7), mx = Math.max(1, ...fc);
  const dayLbl = i => i === 0 ? 'Today' : i === 1 ? 'Tmrw' : addDays(new Date(), i).toLocaleDateString(undefined, { weekday: 'short' });
  
  const extra = t => `<div class="rev-foot">
    <span class="pill ${store.isDue(t) ? 'warn' : ''}">${esc(store.dueLabel(t))}</span>
    <span class="rate-label">Rate recall:</span>
    <div class="rate-mini">
      <button data-action="rate" data-id="${t.id}" data-v="missed" title="Forgot: confidence −1">😕</button>
      <button data-action="rate" data-id="${t.id}" data-v="okay" title="Okay: retain interval">🙂</button>
      <button data-action="rate" data-id="${t.id}" data-v="nailed" title="Mastered: confidence +1">💪</button>
    </div>
  </div>`;

  return `${pageHead({
    eyebrow: 'Spaced Repetition Engine',
    title: 'Memory Consolidation &amp; Revisions',
    sub: 'Topics resurface on scientifically calibrated intervals: Level 1 (1d) to Level 5 (30d). Honest ratings keep your recall sharp.'
  })}
  <section class="card forecast">
    <div class="card-head"><h3>Next 7-Day Due Forecast</h3><small class="muted">Upcoming reviews</small></div>
    <div class="fc">${fc.map((n, i) => `<div class="fc-col${i === 0 && n ? ' hot' : ''}"><span class="fc-n">${n}</span><div class="fc-bar"><i style="height:${n / mx * 100}%"></i></div><small>${dayLbl(i)}</small></div>`).join('')}</div>
  </section>
  <div class="tabs" role="tablist">
    ${tabs.map(([k, l, a]) => `<button role="tab" aria-selected="${ui.rtab === k}" class="tab${ui.rtab === k ? ' on' : ''}" data-action="tab" data-group="rtab" data-val="${k}">${l}<span class="tab-n">${a.length}</span></button>`).join('')}
  </div>
  ${list.length ? gridOf(list, { extra }) : emptyState('🎉', 'Queue Clear', 'No items currently in this view. Keep up the consistent cadence!')}`;
};

/* ----- Interview Mode ----- */
const DRILL_GENERIC = [
  'Explain this concept in 60 seconds as if answering a Principal Engineer.',
  'What key engineering problem does this solve, and what are its critical trade-offs?',
  'Walk through a production scenario where this failed or caused a bottleneck.',
  'How does this pattern scale, and what are the concurrency or consistency pitfalls?',
  'What would you observe in telemetry (metrics/logs/traces) when this malfunctions?'
];

const DRILL_BY_CAT = {
  'Java': ['How does the JVM handle this in heap/stack memory?', 'What are the volatile, lock, or CAS synchronization mechanics?'],
  'Spring Boot': ['How does Spring manage the proxying or lifecycle under the hood?', 'What happens during failure injection or transaction rollback?'],
  'JUnit5 & Mockito': ['Sketch the Arrange-Act-Assert structure and explain what to verify vs stub.', 'How do you test timeouts, retries, and asynchronous boundaries?'],
  'Microservices': ['How does this prevent cascading failures across service boundaries?', 'What metric or threshold controls circuit opening or rate shedding?'],
  'Event Driven Architecture': ['Explain partition distribution, rebalancing, and idempotency keys.', 'How do you achieve exactly-once semantics end-to-end?'],
  'LLD': ['Which Design Patterns apply, and how do you adhere to Open-Closed Principle?', 'Draft the core interfaces and domain models from scratch.'],
  'HLD': ['Estimate the throughput, storage, and caching requirements (QPS & Latency).', 'Identify the single points of failure and failover mechanisms.']
};

function drillPool() {
  const d = ui.drill;
  return store.topics.filter(t => (d.scope === 'all' || t.category === d.scope) && (d.includeAll || t.completed));
}

function pickPrompts(cat) {
  const shuffleList = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
  const specific = shuffleList(DRILL_BY_CAT[cat] || []).slice(0, 1);
  return [...specific, ...shuffleList(DRILL_GENERIC).slice(0, 3 - specific.length)];
}

function drillNext() {
  const d = ui.drill;
  stopDrillTimer();
  let pool = drillPool();
  if (!pool.length) { d.topic = null; d.phase = 'empty'; return; }
  if (pool.length > 1) pool = pool.filter(t => t.id !== d.lastId);
  const w = pool.map(t => Math.max(0.5, 6 - t.confidence + (store.isDue(t) ? 3 : 0)));
  let r = Math.random() * w.reduce((a, b) => a + b, 0), pick = pool[pool.length - 1];
  for (let i = 0; i < pool.length; i++) {
    r -= w[i];
    if (r <= 0) { pick = pool[i]; break; }
  }
  d.topic = pick;
  d.lastId = pick.id;
  d.prompts = pickPrompts(pick.category);
  d.left = d.total;
  d.running = false;
  d.phase = 'ask';
}

function stopDrillTimer() {
  const d = ui.drill;
  if (d.timer) { clearInterval(d.timer); d.timer = null; }
  d.running = false;
}

function drillHTML() {
  const d = ui.drill, ses = d.session, t = d.topic;
  const scopeOpts = ['all', ...CATEGORIES].map(c => `<option value="${esc(c)}"${d.scope === c ? ' selected' : ''}>${c === 'all' ? 'All Domains' : esc(c)}</option>`).join('');
  const controls = `<div class="drill-controls">
    <label class="selbox"><span>Scope</span><select data-change="drill-scope">${scopeOpts}</select></label>
    <label class="switch"><input type="checkbox" data-change="drill-all"${d.includeAll ? ' checked' : ''}><span class="knob"></span><span>Include uncompleted topics</span></label>
    <div class="seg-group" role="group" aria-label="Drill timer">${[60, 120, 180, 300].map(s => `<button class="seg-btn${d.total === s ? ' on' : ''}" data-action="drill-time" data-val="${s}">${s / 60} min</button>`).join('')}</div>
  </div>`;

  const stats = `<div class="drill-stats">
    <span><b>${ses.n}</b> answered</span>
    <span class="ok"><b>${ses.nailed}</b> mastered</span>
    <span><b>${ses.okay}</b> acceptable</span>
    <span class="bad"><b>${ses.missed}</b> struggled</span>
  </div>`;

  let stage;
  if (d.phase === 'ask' && t) {
    const m = catMeta(t.category);
    stage = `<div class="drill-stage" style="--cat:${m.color}">
      <div class="drill-main">
        <div class="drill-tags">
          <span class="tag"><i>${m.icon}</i>${esc(t.category)}</span>
          <span class="pill">${CONF_EMOJI[t.confidence]} ${CONF_LABELS[t.confidence]}</span>
          ${store.isDue(t) ? '<span class="pill warn">Review Due</span>' : ''}
        </div>
        <h2 class="drill-title">${t.num ? `<span class="num">${esc(t.num)}</span>` : ''}${esc(t.name)}</h2>
        <p class="muted">Articulate your answer out loud as if in a live senior engineering interview:</p>
        <ol class="prompts">${d.prompts.map(p => `<li>${esc(p)}</li>`).join('')}</ol>
        <div class="drill-actions">
          <button class="btn primary lg" data-action="drill-toggle" id="drillToggle">${d.running ? 'Pause' : d.left < d.total ? 'Resume Timer' : 'Start Countdown'} <kbd>Space</kbd></button>
          <button class="btn lg" data-action="drill-reveal">Finish &amp; Self-Evaluate</button>
          <button class="btn ghost" data-action="drill-skip">Skip ${icon('arrow', 14)} <kbd>N</kbd></button>
        </div>
      </div>
      <div class="drill-clock">${ring({ pct: d.left / d.total * 100, size: 150, stroke: 11, color: 'var(--cat)', label: `<span id="drillClock" class="clock">${mmss(d.left)}</span>`, sub: 'remaining' })}</div>
    </div>`;
  } else if (d.phase === 'rate' && t) {
    const m = catMeta(t.category);
    stage = `<div class="drill-stage rate" style="--cat:${m.color}">
      <div class="drill-main">
        <div class="drill-tags"><span class="tag"><i>${m.icon}</i>${esc(t.category)}</span></div>
        <h2 class="drill-title">${t.num ? `<span class="num">${esc(t.num)}</span>` : ''}${esc(t.name)}</h2>
        <p class="muted">Evaluate your clarity, depth, and precision. This automatically reschedules your revision timeline:</p>
        <div class="res-big">${resLinks(t) || '<span class="muted small">No external notes attached.</span>'}</div>
        <div class="rate-btns">
          <button class="rate bad" data-action="drill-rate" data-v="missed"><b>😕 Struggled</b><small>Confidence −1 · Review tomorrow <kbd>1</kbd></small></button>
          <button class="rate mid" data-action="drill-rate" data-v="okay"><b>🙂 Decent</b><small>Retain interval <kbd>2</kbd></small></button>
          <button class="rate good" data-action="drill-rate" data-v="nailed"><b>💪 Nailed It</b><small>Confidence +1 · Advance interval <kbd>3</kbd></small></button>
        </div>
      </div>
    </div>`;
  } else if (d.phase === 'empty') {
    stage = emptyState('🧩', 'Drill Pool Empty', 'Mark lessons completed or enable "Include uncompleted topics" to populate your drill pool.');
  } else {
    stage = `<div class="drill-intro">
      <div class="empty-emoji">🎤</div>
      <h2>Senior Engineering Mock Interview Drill</h2>
      <p>Simulates real-world technical interviews with randomized topics, deep architectural prompts, audio countdown cues, and active recall evaluation.</p>
      <p class="muted small">${plural(drillPool().length, 'topic')} available in current pool.</p>
      <button class="btn primary lg" data-action="drill-start"${!drillPool().length ? ' disabled' : ''}>${icon('play', 15, 'ico-fill')} Begin Mock Drill</button>
    </div>`;
  }
  return `<div class="card drill">${controls}${stats}${stage}</div>`;
}

Views.interview = () => {
  const s = store.stats();
  const tabs = [['drill', 'Mock Interview Drills'], ['ready', 'Readiness Matrix']];
  let body;
  if (ui.itab === 'drill') body = drillHTML();
  else {
    const readyList = store.topics.filter(t => t.confidence >= 4);
    const cats = CATEGORIES.map(c => {
      const x = store.catStats(c), m = catMeta(c);
      const weak = store.topics.filter(t => t.category === c && t.completed && t.confidence <= 2).slice(0, 3);
      const pct = x.total ? Math.round(x.readyAny / x.total * 100) : 0;
      return `<div class="card rd" style="--cat:${m.color}">
        <div class="rd-head"><span class="tl-ico">${m.icon}</span><h3>${esc(c)}</h3><b>${pct}%</b></div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <p class="muted small">${x.readyAny}/${x.total} Interview-Ready · Avg Confidence: ${x.avg.toFixed(1)}/5</p>
        ${weak.length ? `<div class="rd-weak"><small>Needs Work:</small>${weak.map(t => `<button class="chip-btn sm" data-action="open" data-id="${t.id}">${esc(t.name.length > 24 ? t.name.slice(0, 23) + '…' : t.name)}</button>`).join('')}</div>` : ''}
      </div>`;
    }).join('');
    
    body = `<div class="rd-grid">${cats}</div>
      <div class="section-head"><h2>Interview-Ready Topics (${readyList.length})</h2></div>
      ${readyList.length ? gridOf(readyList) : emptyState('💼', 'No Interview-Ready Topics Yet', 'Promote topics to Confidence 4 (Interview Ready) or 5 (Expert) by passing tests or completing drills.')}`;
  }

  return `${pageHead({
    eyebrow: 'Interview Preparation',
    title: 'Drill &amp; Readiness Command',
    sub: `${s.ready} of ${s.total} topics rated at Level 4+ confidence.`
  })}
  <div class="tabs" role="tablist">
    ${tabs.map(([k, l]) => `<button role="tab" aria-selected="${ui.itab === k}" class="tab${ui.itab === k ? ' on' : ''}" data-action="tab" data-group="itab" data-val="${k}">${l}</button>`).join('')}
  </div>
  ${body}`;
};

/* ----- Insights ----- */
Views.insights = () => {
  const s = store.stats(), st = store.streak();
  const wk = store.weekly(12), mx = Math.max(1, ...wk.map(w => w.done + w.rev));
  const avg = (store.topics.reduce((a, t) => a + t.confidence, 0) / store.topics.length).toFixed(1);
  const bars = wk.map(w => `<div class="wk-col" title="Week of ${esc(w.start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }))}: ${w.done} done, ${w.rev} revs, ${w.min}m"><div class="wk-stack"><i class="rev" style="height:${w.rev / mx * 100}%"></i><i class="done" style="height:${w.done / mx * 100}%"></i></div><small>${w.start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</small></div>`).join('');
  const catTime = CATEGORIES.map(c => ({ c, m: store.catStats(c).minutes })).filter(x => x.m > 0).sort((a, b) => b.m - a.m);
  const tmx = Math.max(1, ...catTime.map(x => x.m));
  const ach = store.achievementState().sort((a, b) => (b.unlocked - a.unlocked) || (b.at - a.at) || (b.cur / b.goal - a.cur / a.goal));

  return `${pageHead({
    eyebrow: 'Analytics &amp; Progress',
    title: 'Study Velocity &amp; Analytics',
    sub: `${plural(st.active, 'active study day')} logged · Current streak: ${st.current} days · All-time best: ${st.best} days.`
  })}
  <section class="stats-grid">
    <div class="stat-card static"><span class="stat-ico">${icon('check', 18)}</span><h3>Topics Completed</h3><div class="value">${s.done}</div><small>of ${s.total} lessons</small></div>
    <div class="stat-card static"><span class="stat-ico acc">${icon('refresh', 18)}</span><h3>Revisions Performed</h3><div class="value">${s.revCount}</div><small>spaced repetition cycles</small></div>
    <div class="stat-card static"><span class="stat-ico">${icon('clock', 18)}</span><h3>Deep Focus Time</h3><div class="value">${fmtMin(s.minutes)}</div><small>tracked in focus mode</small></div>
    <div class="stat-card static"><span class="stat-ico ok">${icon('target', 18)}</span><h3>Mean Confidence</h3><div class="value">${avg}<span class="slash">/5</span></div><small>across all 206 topics</small></div>
    <div class="stat-card static"><span class="stat-ico warn">${icon('edit', 18)}</span><h3>Personal Notes</h3><div class="value">${s.notes}</div><small>${s.favs} starred lessons</small></div>
  </section>
  <section class="grid-2">
    <div class="card">
      <div class="card-head"><h3>Weekly Study Velocity</h3><div class="legend"><span><i class="lgd done"></i>Completed</span><span><i class="lgd rev"></i>Revisions</span></div></div>
      <div class="wk">${bars}</div>
    </div>
    <div class="card">
      <div class="card-head"><h3>Focus Time Allocation</h3></div>
      ${catTime.length ? `<div class="mastery">${catTime.map(x => `<div class="mrow static" style="--cat:${catMeta(x.c).color}"><span class="mrow-name"><i>${catMeta(x.c).icon}</i>${esc(x.c)}</span><span class="mbar"><i class="seg done" style="width:${x.m / tmx * 100}%"></i></span><span class="mrow-val">${fmtMin(x.m)}</span></div>`).join('')}</div>` : emptyState('⏱️', 'No Focus Time Logged', 'Use the Focus Session timer to log deep study periods.')}
    </div>
  </section>
  <section class="card"><div class="card-head"><h3>26-Week Activity Map</h3></div>${heatmapHTML(26)}</section>
  <section><div class="section-head"><h2>Achievements &amp; Milestones <small class="muted">${ach.filter(a => a.unlocked).length}/${ach.length}</small></h2></div><div class="ach-grid">${ach.map(achCard).join('')}</div></section>`;
};

/* ----- Detail Drawer Panel ----- */
function panelHTML(t) {
  const m = catMeta(t.category), nb = store.neighbors(t.id), due = store.dueAt(t);
  const links = [['pdfLink', 'file', 'PDF Notes'], ['oneNoteLink', 'note', 'OneNote Notebook'], ['gitLink', 'code', 'Git Repository']]
    .filter(([k]) => t[k]).map(([k, ic, l]) => `<a class="res big" href="${esc(t[k])}" target="_blank" rel="noopener noreferrer">${icon(ic, 18)}<span>${l}</span>${icon('external', 14)}</a>`).join('');

  return `<div class="panel-head" style="--cat:${m.color}">
      <div>
        <span class="tag"><i>${m.icon}</i>${esc(t.category)}</span>
        <span class="muted small"> · Lesson ${nb.index} of ${nb.total}</span>
        <h2 id="panelTitle">${t.num ? `<span class="num">${esc(t.num)}</span>` : ''}${esc(t.name)}</h2>
      </div>
      <button class="icon-btn" data-action="close-panel" aria-label="Close details">${icon('x', 20)}</button>
    </div>
    <div class="panel-body">
      ${links ? `<div class="panel-links">${links}</div>` : '<p class="muted small">No direct links configured for this topic.</p>'}
      <div class="panel-status">
        <button class="btn ${t.completed ? 'success' : 'primary'}" data-action="toggle" data-id="${t.id}">${icon('check', 15)} ${t.completed ? 'Marked Complete' : 'Mark as Complete'}</button>
        <button class="btn${t.favorite ? ' fav-on' : ''}" data-action="fav" data-id="${t.id}" aria-pressed="${t.favorite}">${icon('star', 15)} ${t.favorite ? 'Starred' : 'Favorite'}</button>
        <button class="btn" data-action="focus" data-id="${t.id}">${icon('play', 15, 'ico-fill')} Focus Timer</button>
      </div>
      ${panelTestHTML(t)}
      <div class="panel-stats">
        <div><small>Revisions</small><b>${t.revisionCount}</b></div>
        <div><small>Last Revised</small><b>${t.lastTs ? new Date(t.lastTs).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : (t.lastRevised || 'Never')}</b></div>
        <div><small>Next Due</small><b>${due === null ? '—' : due <= Date.now() ? 'Due Now' : new Date(due).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</b></div>
        <div><small>Focus Time</small><b>${fmtMin(t.minutes)}</b></div>
      </div>
      <h4>Confidence Level</h4>
      <div class="conf-scale" role="radiogroup" aria-label="Confidence level">${[1, 2, 3, 4, 5].map(v => `<button role="radio" aria-checked="${t.confidence === v}" class="conf-btn${t.confidence === v ? ' on' : ''}" data-action="set-conf" data-id="${t.id}" data-val="${v}"><span>${CONF_EMOJI[v]}</span>${CONF_LABELS[v]}</button>`).join('')}</div>
      <div class="panel-row">
        <button class="btn sm" data-action="log-rev" data-id="${t.id}">${icon('refresh', 14)} Log Revision</button>
        <small class="muted">Recalibrates spaced repetition interval.</small>
      </div>
      <h4>Personal Study Notes <small class="muted" id="notesState">autosaves</small></h4>
      <textarea id="panelNotes" data-id="${t.id}" placeholder="Jot down key takeaways, code templates, or interview gotchas…" spellcheck="true">${esc(t.notes)}</textarea>
    </div>
    <div class="panel-foot">
      <button class="btn" data-action="open" data-id="${nb.prev ? nb.prev.id : ''}"${nb.prev ? '' : ' disabled'}>${icon('arrowLeft', 15)} Previous</button>
      <button class="btn" data-action="open" data-id="${nb.next ? nb.next.id : ''}"${nb.next ? '' : ' disabled'}>Next ${icon('arrow', 15)}</button>
    </div>`;
}


/* =========================================================
   Tests Hub & Analytics View (Views.tests)
   ========================================================= */
Views.tests = () => {
  const g = store.globalTestStats();
  const daily = store.dailyChallengeStatus();
  const weak = store.weakTopicsList();
  const attempts = store.tests.attempts.slice().reverse();
  const topicsWithBank = QB.topicsWithBank();

  // Category matrix
  const matrix = CATEGORIES.map(c => {
    const list = store.topics.filter(t => t.category === c && QB.has(t.id));
    if (!list.length) return '';
    const m = catMeta(c);
    const passedInCat = list.filter(t => store.testStats(t.id).passed).length;
    const catPct = list.length ? Math.round((passedInCat / list.length) * 100) : 0;
    
    const pills = list.map(t => {
      const st = store.testStats(t.id);
      const isPassed = st.passed;
      const best = st.best;
      return `<button class="chip-btn ${isPassed ? 'on' : ''}" data-action="quiz-open" data-id="${t.id}" title="Take ${esc(t.name)} test">
        <span>${esc(t.name.length > 22 ? t.name.slice(0, 21) + '…' : t.name)}</span>
        ${best !== null ? `<b class="${isPassed ? 'ok' : ''}">${best}%</b>` : `<span class="muted small">${QB.count(t.id)}q</span>`}
      </button>`;
    }).join('');

    return `<div class="card rd" style="--cat:${m.color}">
      <div class="rd-head">
        <span class="tl-ico">${m.icon}</span>
        <h3>${esc(c)}</h3>
        <b>${passedInCat}/${list.length} (${catPct}%)</b>
      </div>
      <div class="bar"><i style="width:${catPct}%"></i></div>
      <div class="rd-weak" style="margin-top:10px;">${pills}</div>
    </div>`;
  }).filter(Boolean).join('');

  // Daily Challenge card
  const dailyCard = `<div class="card upnext" style="--cat:#f59e0b">
    <div class="card-label">☀️ Daily Challenge <span class="dot-sep"></span> <span>Cross-Domain Drill</span></div>
    <h2>Today's 10-Question Challenge</h2>
    <p class="muted">
      ${daily.completedToday
        ? `You completed today's challenge! Best Score: <b>${daily.bestScore}%</b> · Current Daily Test Streak: <b>${daily.streak} day(s)</b>.`
        : `A calibrated 10-question drill drawn across Java, Spring Boot, Microservices, Kafka, LLD, and HLD. Refreshes daily at midnight.`}
    </p>
    <div class="row-actions" style="margin-top:14px;">
      <button class="btn primary" data-action="daily-challenge">
        ${icon('target', 15)} ${daily.completedToday ? 'Retake Daily Drill' : 'Start Daily Challenge'}
      </button>
      ${weak.length ? `<button class="btn" data-action="weak-practice">${icon('refresh', 15)} Practice ${weak.length} Weak Topics</button>` : ''}
    </div>
  </div>`;

  // Weak Topics radar
  const weakSection = weak.length ? `<section>
    <div class="section-head">
      <h2>Weak-Topic Focus Radar <small class="muted">${weak.length} topics needing review</small></h2>
      <button class="btn sm" data-action="weak-practice">${icon('target', 14)} Drill All Missed Questions</button>
    </div>
    <div class="cards">
      ${weak.slice(0, 6).map(w => {
        const t = w.topic;
        const m = catMeta(t.category);
        return `<article class="tcard" style="--cat:${m.color}">
          <div class="tcard-top">
            <span class="tag"><i>${m.icon}</i>${esc(t.category)}</span>
            <span class="pill warn">${w.missedCount} mistake(s)</span>
          </div>
          <h3 class="tcard-title" data-action="open" data-id="${t.id}">${esc(t.name)}</h3>
          <p class="muted small">Best Exam Score: <b>${w.best === null ? 'Untested' : w.best + '%'}</b> (${w.attempts} attempts)</p>
          <div class="tcard-actions">
            <button class="btn sm primary" data-action="quiz-open" data-id="${t.id}">${icon('target', 14)} Retake Exam</button>
            <button class="btn sm ghost" data-action="open" data-id="${t.id}">View Notes</button>
          </div>
        </article>`;
      }).join('')}
    </div>
  </section>` : '';

  // Attempts History Feed
  const historyFeed = attempts.length ? `<section class="card">
    <div class="card-head">
      <h3>Recent Assessment History</h3>
      <span class="muted small">${attempts.length} attempts recorded</span>
    </div>
    <div class="rows">
      ${attempts.slice(0, 10).map((a, idx) => {
        const t = store.byId.get(a.topicId) || { name: a.topicId === 'daily' ? 'Daily Cross-Domain Challenge' : 'Custom Practice Drill', category: 'General' };
        const m = catMeta(t.category);
        const dateStr = new Date(a.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const origIdx = store.tests.attempts.length - 1 - idx;
        return `<div class="trow" style="--cat:${m.color}">
          <div class="trow-main">
            <span class="trow-title">${esc(t.name)}</span>
            <span class="trow-sub">
              <span class="tag sm"><i>${m.icon}</i>${esc(t.category)}</span>
              <span class="pill ${a.passed ? 'ok' : 'warn'} sm">${a.passed ? 'PASSED' : 'NOT PASSED'} (${a.pct}%)</span>
              <span class="muted small">${dateStr} · ${a.n} questions · ⏱ ${Math.round((a.secs || 0))}s</span>
            </span>
          </div>
          <div class="row-actions">
            ${a.passed ? `<button class="btn sm" data-action="download-cert" data-idx="${origIdx}" title="Download Certificate Badge">${icon('download', 14)} Badge</button>` : ''}
            <button class="btn sm ghost" data-action="quiz-open" data-id="${a.topicId}">${icon('refresh', 14)} Retake</button>
          </div>
        </div>`;
      }).join('')}
    </div>
  </section>` : emptyState('🧪', 'No Assessment History Yet', 'Take your first topic exam to track score history and unlock badges.');

  // 1v1 Battle Arena card
  const battleCard = `<div class="card upnext" style="--cat:#ec4899">
    <div class="card-label">⚔️ 1v1 Live Arena <span class="dot-sep"></span> <span>Peer-to-Peer Duel</span></div>
    <h2>Challenge an Engineer in Real Time</h2>
    <p class="muted">
      Synchronized timers, speed-based scoring, and live opponent HUD. Leaving the browser tab forfeits the match.
    </p>
    <div class="row-actions" style="margin-top:14px;">
      <button class="btn primary" data-action="battle-open">
        ${icon('swords', 15)} Invite via Link (P2P)
      </button>
      <button class="btn" data-action="battle-bot">
        🤖 Duel vs DevBot (AI)
      </button>
    </div>
  </div>`;

  return `
  ${pageHead({
    eyebrow: 'Assessment Command Hub',
    title: 'Knowledge Tests &amp; Exams',
    sub: `${g.passedTopicsCount} of ${topicsWithBank} testable topics completed with 80%+ score. ${g.totalAttempts} total attempts recorded.`,
    actions: `<button class="btn primary" data-action="battle-open">${icon('swords', 15)} 1v1 Battle Duel</button><button class="btn" data-action="daily-challenge">${icon('target', 15)} Daily Challenge</button>`
  })}

  <section class="grid-2">
    ${dailyCard}
    ${battleCard}
  </section>

  <section class="row-hero" style="grid-template-columns: repeat(3, 1fr);">
    <div class="card ring-card">
      <div class="card-label">${icon('target', 15)} Exam Pass Rate</div>
      ${ring({ pct: g.passRate, size: 118, stroke: 11, color: 'var(--success)', label: `<b>${g.passRate}%</b>`, sub: `${g.passedExams}/${g.fullExams}` })}
      <p class="muted small">Pass Threshold: 80%+</p>
    </div>
    <div class="card ring-card">
      <div class="card-label">${icon('check', 15)} Mastered Topics</div>
      ${ring({ pct: Math.round((g.passedTopicsCount / Math.max(1, topicsWithBank)) * 100), size: 118, stroke: 11, label: `<b>${g.passedTopicsCount}</b>`, sub: `of ${topicsWithBank}` })}
      <p class="muted small">with verified exam pass</p>
    </div>
    <div class="card streak-card">
      <div class="card-label">${icon('flame', 15)} Daily Test Streak</div>
      <div class="big"><span>${daily.streak}</span><small>${daily.streak === 1 ? 'day' : 'days'}</small></div>
      <p class="muted small" style="margin-top:12px;">Mean Exam Score: <b>${g.avgScore}%</b></p>
    </div>
  </section>

  <section class="stats-grid">
    <div class="stat-card static"><span class="stat-ico">${icon('target', 18)}</span><h3>Total Attempts</h3><div class="value">${g.totalAttempts}</div><small>exams and drills taken</small></div>
    <div class="stat-card static"><span class="stat-ico ok">${icon('check', 18)}</span><h3>Passed Exams</h3><div class="value">${g.passedExams}</div><small>scoring 80% or higher</small></div>
    <div class="stat-card static"><span class="stat-ico acc">${icon('star', 18)}</span><h3>Flawless 100%</h3><div class="value">${g.perfectCount}</div><small>perfect exam scores</small></div>
    <div class="stat-card static"><span class="stat-ico warn">${icon('clock', 18)}</span><h3>Time in Exams</h3><div class="value">${fmtMin(Math.round(g.totalTimeSecs / 60))}</div><small>spent in active testing</small></div>
  </section>

  <div class="section-head">
    <h2>Domain Assessment Matrix</h2>
    <small class="muted">${topicsWithBank} topics ready for exam</small>
  </div>
  <div class="rd-grid">${matrix}</div>

  ${weakSection}

  ${historyFeed}
  `;
};
