'use strict';
/* =========================================================
   DevPath views: pure functions that return HTML strings.
   Event wiring lives in app.js (data-action delegation).
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
    scope: 'all', includeAll: false, phase: 'idle', topic: null, prompts: [],
    total: 120, left: 120, running: false, timer: null, lastId: null,
    session: { n: 0, nailed: 0, okay: 0, missed: 0 }
  }
};

const Views = {};
const catHref = c => `#/category/${encodeURIComponent(c)}`;
const mmss = s => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

/* ---------- small components ---------- */
const hl = (s, q) => {
  s = String(s);
  const toks = (q || '').toLowerCase().split(/\s+/).filter(Boolean).map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!toks.length) return esc(s);
  return s.split(new RegExp('(' + toks.join('|') + ')', 'gi')).map((p, i) => i % 2 ? `<mark>${esc(p)}</mark>` : esc(p)).join('');
};

const confDots = t => `<span class="cdots" title="${CONF_LABELS[t.confidence]}" aria-label="Confidence: ${CONF_LABELS[t.confidence]}">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= t.confidence ? 'on' : ''}"></i>`).join('')}</span>`;

const resLinks = t => [['pdfLink', 'file', 'PDF'], ['oneNoteLink', 'note', 'OneNote'], ['gitLink', 'code', 'Git']]
  .filter(([k]) => t[k])
  .map(([k, ic, l]) => `<a class="res" href="${esc(t[k])}" target="_blank" rel="noopener noreferrer" title="Open ${l} in a new tab">${icon(ic, 14)}<span>${l}</span></a>`).join('');

function ring({ pct, size = 120, stroke = 10, color = 'var(--primary)', label = '', sub = '' }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, h = size / 2;
  const off = c * (1 - clamp(pct, 0, 100) / 100);
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="ring-bg" cx="${h}" cy="${h}" r="${r}" stroke-width="${stroke}"/><circle class="ring-fg" cx="${h}" cy="${h}" r="${r}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" style="--circ:${c};stroke:${color}" transform="rotate(-90 ${h} ${h})"/></svg><div class="ring-label">${label}${sub ? `<small>${sub}</small>` : ''}</div></div>`;
}

const pageHead = ({ eyebrow = '', title, sub = '', actions = '' }) =>
  `<header class="page-head"><div>${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h1>${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ''}</div>${actions ? `<div class="page-actions">${actions}</div>` : ''}</header>`;

const emptyState = (emoji, title, text, action = '') =>
  `<div class="empty"><div class="empty-emoji">${emoji}</div><h3>${title}</h3><p>${text}</p>${action}</div>`;

function card(t, o = {}) {
  const m = catMeta(t.category), due = store.isDue(t);
  return `<article class="tcard${t.completed ? ' is-done' : ''}" data-id="${t.id}" style="--cat:${m.color}">
    <div class="tcard-top">
      <button class="check${t.completed ? ' on' : ''}" data-action="toggle" data-id="${t.id}" aria-pressed="${t.completed}" aria-label="${t.completed ? 'Mark incomplete' : 'Mark complete'}: ${esc(t.title)}">${icon('check', 14)}</button>
      <span class="tag"><i>${m.icon}</i>${esc(t.category)}</span>
      <span class="spacer"></span>
      ${due ? '<span class="pill warn" title="Spaced-repetition review is due">Due</span>' : ''}
      <button class="star${t.favorite ? ' on' : ''}" data-action="fav" data-id="${t.id}" aria-pressed="${t.favorite}" aria-label="Favorite: ${esc(t.title)}">${icon('star', 16)}</button>
    </div>
    <h3 class="tcard-title" data-action="open" data-id="${t.id}" tabindex="0" role="button">${t.num ? `<span class="num">${esc(t.num)}</span>` : ''}${hl(t.name, o.q)}</h3>
    <div class="tcard-meta"><span class="meta-i">${icon('clock', 13)}${esc(t.duration)}</span><span class="diff ${t.difficulty.toLowerCase()}">${t.difficulty}</span>${confDots(t)}${t.notes.trim() ? `<span class="meta-i has-notes" title="You wrote notes here">${icon('edit', 13)}</span>` : ''}</div>
    <div class="tcard-actions">${resLinks(t)}<button class="btn sm push" data-action="open" data-id="${t.id}">Details</button></div>
    ${o.extra || ''}
  </article>`;
}

function row(t, o = {}) {
  const m = catMeta(t.category);
  return `<article class="trow${t.completed ? ' is-done' : ''}" data-id="${t.id}" style="--cat:${m.color}">
    <button class="check${t.completed ? ' on' : ''}" data-action="toggle" data-id="${t.id}" aria-pressed="${t.completed}" aria-label="${t.completed ? 'Mark incomplete' : 'Mark complete'}: ${esc(t.title)}">${icon('check', 14)}</button>
    <div class="trow-main">
      <span class="trow-title" data-action="open" data-id="${t.id}" tabindex="0" role="button">${t.num ? `<span class="num">${esc(t.num)}</span>` : ''}${hl(t.name, o.q)}</span>
      <span class="trow-sub"><span class="tag sm"><i>${m.icon}</i>${esc(t.category)}</span><span class="diff ${t.difficulty.toLowerCase()}">${t.difficulty}</span>${confDots(t)}${store.isDue(t) ? '<span class="pill warn">Due</span>' : ''}</span>
    </div>
    <div class="trow-res">${resLinks(t)}</div>
    <button class="star${t.favorite ? ' on' : ''}" data-action="fav" data-id="${t.id}" aria-pressed="${t.favorite}" aria-label="Favorite: ${esc(t.title)}">${icon('star', 16)}</button>
    <button class="btn sm" data-action="open" data-id="${t.id}">Details</button>
  </article>`;
}

const gridOf = (list, o = {}) => `<div class="cards">${list.map(t => card(t, o)).join('')}</div>`;

/* =========================================================
   Sidebar
   ========================================================= */
Views.sidebar = () => {
  const s = store.stats(), { page, cat } = ui.route, due = s.due;
  const item = (href, ico, label, key, badge = '') =>
    `<a class="nav-item${page === key ? ' active' : ''}" href="${href}" ${page === key ? 'aria-current="page"' : ''}>${icon(ico, 18)}<span>${label}</span>${badge}</a>`;
  return `
    <div class="brand"><span class="brand-mark">${icon('bolt', 18)}</span><span class="brand-name">DevPath</span></div>
    <div class="side-progress">
      <div class="sp-row"><span>Overall progress</span><b>${s.prog}%</b></div>
      <div class="bar"><i style="width:${s.prog}%"></i></div>
      <small>${s.done} of ${s.total} topics completed</small>
    </div>
    <nav class="nav" aria-label="Pages">
      ${item('#/dashboard', 'home', 'Dashboard', 'dashboard')}
      ${item('#/library', 'grid', 'Library', 'library', `<span class="nav-badge">${s.total}</span>`)}
      ${item('#/roadmap', 'map', 'Roadmap', 'roadmap')}
      ${item('#/interview', 'briefcase', 'Interview Mode', 'interview', s.ready ? `<span class="nav-badge ok">${s.ready}</span>` : '')}
      ${item('#/revision', 'refresh', 'Revision', 'revision', due ? `<span class="nav-badge warn">${due}</span>` : '')}
      ${item('#/insights', 'chart', 'Insights', 'insights')}
      <div class="nav-label">Learning path</div>
      ${CATEGORIES.map(c => {
        const x = store.catStats(c), m = catMeta(c), on = page === 'category' && cat === c;
        return `<a class="nav-item cat${on ? ' active' : ''}" href="${catHref(c)}" style="--cat:${m.color}" ${on ? 'aria-current="page"' : ''}><i class="cat-dot">${m.icon}</i><span>${esc(c)}</span><span class="nav-count${x.done === x.total ? ' full' : ''}">${x.done}/${x.total}</span></a>`;
      }).join('')}
    </nav>
    <div class="side-foot"><button class="btn ghost sm" data-action="help">${icon('keyboard', 15)} Shortcuts</button><button class="btn ghost sm" data-action="settings">${icon('sliders', 15)} Settings</button></div>`;
};

/* =========================================================
   Dashboard
   ========================================================= */
const greeting = () => {
  const h = new Date().getHours();
  return h < 5 ? 'Burning the midnight oil' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 22 ? 'Good evening' : 'Late-night grind';
};

function etaText(remaining, perDay) {
  if (!remaining) return 'All topics complete';
  const days = Math.ceil(remaining / perDay), d = addDays(new Date(), days);
  return `${plural(remaining, 'topic')} left · ~${days} days at ${perDay}/day (${d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })})`;
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
  return `<div class="heat-wrap"><div class="heat-months" style="--weeks:${weeks}">${months}</div><div class="heat" style="--weeks:${weeks}" role="img" aria-label="Activity over the last ${weeks} weeks: ${active} active days">${cells}</div></div>
    <div class="heat-foot"><span>${plural(active, 'active day')} in the last ${weeks} weeks</span><span class="heat-legend">Less ${[0, 1, 2, 3, 4].map(l => `<i class="hc lv${l}"></i>`).join('')} More</span></div>`;
}

Views.dashboard = () => {
  const s = store.stats(), st = store.streak(), goal = store.settings.dailyGoal;
  const today = store.activity[dayKey()] || { done: 0, rev: 0, min: 0 };
  const next = store.nextUp(), due = store.dueTopics();
  const name = (store.settings.name || '').trim();
  const goalPct = Math.min(100, Math.round(today.done / goal * 100));
  const msg = today.done >= goal ? 'Daily goal smashed 🎯 Anything extra is a bonus.'
    : st.current > 0 && !st.todayDone ? `Keep your ${st.current}-day streak alive: one topic does it.`
    : st.todayDone ? 'Nice work today. Revise something to lock it in.'
    : 'Complete one topic today to start a streak.';
  const last7 = Array.from({ length: 7 }, (_, i) => { const d = addDays(new Date(), i - 6); return { on: store.scoreOf(dayKey(d)) > 0, today: i === 6, l: d.toLocaleDateString(undefined, { weekday: 'narrow' }) }; });

  /* up next */
  let upnext;
  if (next) {
    const m = catMeta(next.category), nb = store.neighbors(next.id), cs = store.catStats(next.category);
    upnext = `<div class="card upnext" style="--cat:${m.color}">
      <div class="card-label">${icon('bolt', 15)} Up next <span class="dot-sep"></span> <span>${m.icon} ${esc(next.category)}</span></div>
      <h2>${next.num ? `<span class="num">${esc(next.num)}</span>` : ''}${esc(next.name)}</h2>
      <p class="muted">Lesson ${nb.index} of ${nb.total} in ${esc(next.category)} · ${cs.pct}% of the category done · ${next.difficulty} · ~${next.duration}</p>
      <div class="row-actions">
        <button class="btn primary" data-action="focus" data-id="${next.id}">${icon('play', 15, 'ico-fill')} Start focus</button>
        ${resLinks(next)}
        <button class="btn" data-action="toggle" data-id="${next.id}">${icon('check', 15)} Mark complete</button>
        <button class="btn ghost" data-action="open" data-id="${next.id}">Details</button>
      </div></div>`;
  } else {
    upnext = `<div class="card upnext done"><div class="card-label">${icon('target', 15)} All clear</div><h2>🎉 You've completed every topic</h2><p class="muted">Keep your knowledge sharp: run a mock interview or clear your revision queue.</p><div class="row-actions"><button class="btn primary" data-action="nav" data-href="#/interview">Start mock interview</button><button class="btn" data-action="nav" data-href="#/revision">Open revision</button></div></div>`;
  }

  /* mastery */
  const mastery = CATEGORIES.map(c => {
    const x = store.catStats(c), m = catMeta(c);
    const r = x.total ? x.ready / x.total * 100 : 0, d = x.total ? (x.done - x.ready) / x.total * 100 : 0;
    return `<a class="mrow" href="${catHref(c)}" style="--cat:${m.color}"><span class="mrow-name"><i>${m.icon}</i>${esc(c)}</span><span class="mbar"><i class="seg ready" style="width:${r}%"></i><i class="seg done" style="width:${d}%"></i></span><span class="mrow-val">${x.done}/${x.total}</span></a>`;
  }).join('');

  /* confidence distribution */
  const dist = store.confDist(), mx = Math.max(1, ...dist), short = ['New', 'Basic', 'Good', 'Ready', 'Expert'];
  const distHTML = `<div class="dist">${dist.map((n, i) => `<div class="dist-col"><span class="dist-n">${n}</span><div class="dist-bar"><i class="c${i + 1}" style="height:${n / mx * 100}%"></i></div><span class="dist-e">${CONF_EMOJI[i + 1]}</span><small>${short[i]}</small></div>`).join('')}</div>`;

  /* revision due */
  const dueHTML = due.length
    ? `<ul class="mini-list">${due.slice(0, 5).map(t => `<li><button class="mini-item" data-action="open" data-id="${t.id}" style="--cat:${catMeta(t.category).color}"><i class="dotc"></i><span class="mi-title">${esc(t.name)}</span><span class="mi-sub">${esc(t.category)}</span><span class="pill warn">${esc(store.dueLabel(t))}</span></button></li>`).join('')}</ul>${due.length > 5 ? `<a class="more" href="#/revision">+${due.length - 5} more in Revision ${icon('arrow', 14)}</a>` : `<a class="more" href="#/revision">Open Revision ${icon('arrow', 14)}</a>`}`
    : emptyState('✨', 'Nothing due', 'Your spaced-repetition queue is clear. Topics reappear here when a review is due.');

  /* jump back in */
  const ts = t => Math.max(t.completedAt || 0, t.lastTs || 0);
  const recent = store.topics.filter(t => t.favorite || t.completed).sort((a, b) => (b.favorite - a.favorite) || (ts(b) - ts(a))).slice(0, 6);

  /* achievements */
  const ach = store.achievementState();
  const shown = [...ach.filter(a => a.unlocked).sort((a, b) => b.at - a.at), ...ach.filter(a => !a.unlocked).sort((a, b) => b.cur / b.goal - a.cur / a.goal)].slice(0, 6);
  const unlockedN = ach.filter(a => a.unlocked).length;

  return `
  ${pageHead({
    eyebrow: new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }),
    title: `${greeting()}${name ? `, ${esc(name)}` : ''} <span class="wave">👋</span>`,
    sub: msg,
    actions: `<button class="btn primary" data-action="focus">${icon('play', 15, 'ico-fill')} Focus session</button><button class="btn" data-action="palette">${icon('command', 15)} Quick find <kbd>Ctrl K</kbd></button>`
  })}

  <section class="row-hero">
    ${upnext}
    <div class="card ring-card">
      <div class="card-label">${icon('target', 15)} Overall</div>
      ${ring({ pct: s.prog, size: 118, stroke: 11, label: `<b data-count="${s.prog}" data-suffix="%">${s.prog}%</b>`, sub: 'complete' })}
      <p class="muted small">${s.done}/${s.total} topics</p>
    </div>
    <div class="card ring-card">
      <div class="card-label">${icon('check', 15)} Today's goal</div>
      ${ring({ pct: goalPct, size: 118, stroke: 11, color: 'var(--success)', label: `<b>${today.done}<span class="slash">/${goal}</span></b>`, sub: 'topics' })}
      <p class="muted small">${plural(today.rev, 'revision')} · ${today.min} min focus</p>
    </div>
    <div class="card streak-card">
      <div class="card-label">${icon('flame', 15)} Streak</div>
      <div class="big"><span data-count="${st.current}">${st.current}</span><small>${st.current === 1 ? 'day' : 'days'}</small></div>
      <div class="week-strip">${last7.map(d => `<span class="${d.on ? 'on' : ''}${d.today ? ' today' : ''}"><i></i>${d.l}</span>`).join('')}</div>
      <p class="muted small">Best: ${plural(st.best, 'day')}</p>
    </div>
  </section>

  <section class="stats-grid">
    <button class="stat-card" data-action="nav" data-href="#/library"><span class="stat-ico">${icon('grid', 18)}</span><h3>Total topics</h3><div class="value" data-count="${s.total}">${s.total}</div><small>${etaText(s.total - s.done, goal)}</small></button>
    <button class="stat-card" data-action="lib" data-status="done"><span class="stat-ico ok">${icon('check', 18)}</span><h3>Completed</h3><div class="value" data-count="${s.done}">${s.done}</div><small>${s.prog}% of the path</small></button>
    <button class="stat-card" data-action="nav" data-href="#/interview"><span class="stat-ico acc">${icon('briefcase', 18)}</span><h3>Interview ready</h3><div class="value" data-count="${s.ready}">${s.ready}</div><small>confidence 4 or 5</small></button>
    <button class="stat-card" data-action="nav" data-href="#/revision"><span class="stat-ico warn">${icon('refresh', 18)}</span><h3>Due for revision</h3><div class="value" data-count="${s.due}">${s.due}</div><small>${s.revs} below confidence 4</small></button>
    <button class="stat-card" data-action="nav" data-href="#/insights"><span class="stat-ico">${icon('clock', 18)}</span><h3>Focus time</h3><div class="value">${fmtMin(s.minutes)}</div><small>logged in focus sessions</small></button>
  </section>

  <section class="grid-2">
    <div class="card">
      <div class="card-head"><h3>Category mastery</h3><div class="legend"><span><i class="lgd ready"></i>Interview-ready</span><span><i class="lgd done"></i>Completed</span><span><i class="lgd rest"></i>Remaining</span></div></div>
      <div class="mastery">${mastery}</div>
    </div>
    <div class="card">
      <div class="card-head"><h3>Revision queue</h3>${due.length ? `<span class="pill warn">${due.length} due</span>` : ''}</div>
      ${dueHTML}
    </div>
  </section>

  <section class="grid-2">
    <div class="card"><div class="card-head"><h3>Learning activity</h3></div>${heatmapHTML(20)}</div>
    <div class="card"><div class="card-head"><h3>Confidence spread</h3><small class="muted">all ${s.total} topics</small></div>${distHTML}</div>
  </section>

  <section>
    <div class="section-head"><h2>Jump back in</h2><a class="more" href="#/library">Open library ${icon('arrow', 14)}</a></div>
    ${recent.length ? gridOf(recent) : emptyState('🚀', 'Nothing here yet', 'Favourite a topic with the ★ or mark one complete and it will show up here for quick access.', `<button class="btn primary" data-action="nav" data-href="#/library">Browse the library</button>`)}
  </section>

  <section>
    <div class="section-head"><h2>Achievements <small class="muted">${unlockedN}/${ach.length}</small></h2><a class="more" href="#/insights">See all ${icon('arrow', 14)}</a></div>
    <div class="ach-grid compact">${shown.map(achCard).join('')}</div>
  </section>`;
};

function achCard(a) {
  const pct = Math.round(a.cur / a.goal * 100);
  return `<div class="ach${a.unlocked ? ' on' : ''}" title="${esc(a.desc)}"><span class="ach-ico">${a.icon}</span><div><b>${esc(a.name)}</b><small>${esc(a.desc)}</small>${a.unlocked ? `<em>Unlocked ${new Date(a.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</em>` : `<div class="bar thin"><i style="width:${pct}%"></i></div><em>${a.cur}/${a.goal}</em>`}</div></div>`;
}

/* =========================================================
   Library / Category
   ========================================================= */
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
      <div class="cat-hero-text"><p class="eyebrow">Category</p><h1>${esc(cat)}</h1><p class="sub">${esc(m.blurb)}</p>
        <div class="cat-hero-meta"><span>${x.done}/${x.total} done</span><span>${x.readyAny} interview-ready</span><span>${fmtMin(x.minutes)} focused</span><span>avg confidence ${x.avg.toFixed(1)}/5</span></div></div>
      <div class="cat-hero-side">${ring({ pct: x.pct, size: 92, stroke: 9, color: 'var(--cat)', label: `<b>${x.pct}%</b>` })}
        ${nxt ? `<button class="btn primary" data-action="focus" data-id="${nxt.id}">${icon('play', 15, 'ico-fill')} Continue</button>` : '<span class="pill ok">Category complete 🎉</span>'}</div></div>`;
  } else {
    head = pageHead({ eyebrow: 'Library', title: 'All topics', sub: `${store.topics.length} topics across ${CATEGORIES.length} categories. Search lives in the top bar (press <kbd>/</kbd>).` });
  }
  const chips = isCat ? '' : `<div class="chips" role="group" aria-label="Category filter"><button class="chip-btn${f.cat === 'all' ? ' on' : ''}" data-action="filter" data-key="cat" data-val="all">All</button>${CATEGORIES.map(c => `<button class="chip-btn${f.cat === c ? ' on' : ''}" style="--cat:${catMeta(c).color}" data-action="filter" data-key="cat" data-val="${esc(c)}">${catMeta(c).icon} ${esc(c)}</button>`).join('')}</div>`;
  const statuses = [['all', 'All'], ['todo', 'To do'], ['done', 'Done'], ['fav', '★ Favorites'], ['due', 'Due'], ['ready', 'Interview ready']];
  const sel = (key, opts) => `<select data-change="filter" data-key="${key}" aria-label="${key}">${opts.map(([v, l]) => `<option value="${v}"${f[key] === v ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
  const toolbar = `<div class="toolbar card">${chips}<div class="toolbar-row">
    <div class="seg-group" role="group" aria-label="Status">${statuses.map(([v, l]) => `<button class="seg-btn${f.status === v ? ' on' : ''}" data-action="filter" data-key="status" data-val="${v}">${l}</button>`).join('')}</div>
    <div class="toolbar-right">${sel('diff', [['all', 'Any difficulty'], ['Intermediate', 'Intermediate'], ['Advanced', 'Advanced']])}${sel('sort', [['course', 'Course order'], ['az', 'A → Z'], ['conf-asc', 'Confidence ↑'], ['conf-desc', 'Confidence ↓'], ['recent', 'Recently studied']])}
    <div class="seg-group icon-only" role="group" aria-label="Layout"><button class="seg-btn${ui.view === 'grid' ? ' on' : ''}" data-action="view" data-val="grid" aria-label="Grid view" title="Grid view">${icon('grid', 16)}</button><button class="seg-btn${ui.view === 'list' ? ' on' : ''}" data-action="view" data-val="list" aria-label="List view" title="List view">${icon('list', 16)}</button></div></div></div></div>`;
  const filtersOn = f.q || f.status !== 'all' || f.diff !== 'all' || (!isCat && f.cat !== 'all');
  const summary = `<div class="result-line"><span>Showing <b>${list.length}</b> of ${total}${f.q ? ` for “${esc(f.q)}”` : ''}</span>${filtersOn ? '<button class="btn ghost sm" data-action="reset-filters">Clear filters</button>' : ''}</div>`;
  const body = !list.length
    ? emptyState('🔎', 'No topics match', 'Try a different search term or clear the filters.', '<button class="btn primary" data-action="reset-filters">Clear filters</button>')
    : ui.view === 'list' ? `<div class="rows">${list.map(t => row(t, { q: f.q })).join('')}</div>` : gridOf(list, { q: f.q });
  return `${head}${toolbar}${summary}${body}`;
};

/* =========================================================
   Roadmap
   ========================================================= */
Views.roadmap = () => {
  const s = store.stats(), goal = store.settings.dailyGoal;
  const stats = CATEGORIES.map(c => ({ c, ...store.catStats(c) }));
  const curIdx = stats.findIndex(x => x.done < x.total);
  const hoursLeft = (s.total - s.done) * 2;
  const items = stats.map((x, i) => {
    const m = catMeta(x.c);
    const state = x.done === x.total ? 'complete' : i === curIdx ? 'current' : x.done > 0 ? 'started' : 'todo';
    const label = { complete: 'Completed', current: 'You are here', started: 'In progress', todo: 'Not started' }[state];
    const open = ui.expanded.has(x.c) || (state === 'current' && !ui.expanded.has('!' + x.c));
    const list = store.topics.filter(t => t.category === x.c);
    return `<li class="tl-item ${state}" style="--cat:${m.color}">
      <div class="tl-marker">${state === 'complete' ? icon('check', 18) : i + 1}</div>
      <div class="card tl-card">
        <div class="tl-head"><span class="tl-ico">${m.icon}</span><div class="tl-title"><h3>${esc(x.c)}</h3><p>${esc(m.blurb)}</p></div><span class="pill ${state === 'complete' ? 'ok' : state === 'current' ? 'acc' : ''}">${label}</span></div>
        <div class="tl-prog"><div class="bar"><i style="width:${x.pct}%"></i></div><span>${x.done}/${x.total} · ${x.pct}%</span></div>
        <div class="tl-actions"><a class="btn sm primary" href="${catHref(x.c)}">Open ${icon('arrow', 14)}</a><button class="btn sm" data-action="expand" data-cat="${esc(x.c)}" aria-expanded="${open}">${open ? 'Hide' : 'Quick'} checklist ${icon('chevron', 14, open ? 'flip' : '')}</button></div>
        ${open ? `<ul class="tl-list">${list.map(t => `<li class="${t.completed ? 'done' : ''}"><button class="check sm${t.completed ? ' on' : ''}" data-action="toggle" data-id="${t.id}" aria-pressed="${t.completed}" aria-label="Toggle ${esc(t.title)}">${icon('check', 12)}</button><span data-action="open" data-id="${t.id}" tabindex="0" role="button">${t.num ? `<b>${esc(t.num)}</b> ` : ''}${esc(t.name)}</span></li>`).join('')}</ul>` : ''}
      </div></li>`;
  }).join('');
  return `${pageHead({
    eyebrow: 'Roadmap',
    title: 'Your mastery path',
    sub: curIdx === -1 ? 'Every stop on the path is complete. Impressive.' : `Step ${curIdx + 1} of ${stats.length}: <b>${esc(stats[curIdx].c)}</b> · about ${hoursLeft}h of material left · ${etaText(s.total - s.done, goal)}`
  })}
  <ol class="timeline">${items}</ol>`;
};

/* =========================================================
   Revision
   ========================================================= */
Views.revision = () => {
  const due = store.dueTopics();
  const weak = store.topics.filter(t => t.completed && t.confidence < 4).sort((a, b) => a.confidence - b.confidence || store.dueAt(a) - store.dueAt(b));
  const all = store.topics.filter(t => t.completed).sort((a, b) => store.dueAt(a) - store.dueAt(b));
  const tabs = [['due', 'Due now', due], ['weak', 'Needs work', weak], ['all', 'Scheduled', all]];
  const list = (tabs.find(t => t[0] === ui.rtab) || tabs[0])[2];
  const fc = store.forecast(7), mx = Math.max(1, ...fc);
  const dayLbl = i => i === 0 ? 'Today' : i === 1 ? 'Tmrw' : addDays(new Date(), i).toLocaleDateString(undefined, { weekday: 'short' });
  const extra = t => `<div class="rev-foot"><span class="pill ${store.isDue(t) ? 'warn' : ''}">${esc(store.dueLabel(t))}</span><span class="rate-label">How well do you recall it?</span><div class="rate-mini"><button data-action="rate" data-id="${t.id}" data-v="missed" title="Shaky: confidence −1">😕</button><button data-action="rate" data-id="${t.id}" data-v="okay" title="Okay: keep confidence">🙂</button><button data-action="rate" data-id="${t.id}" data-v="nailed" title="Solid: confidence +1">💪</button></div></div>`;
  return `${pageHead({ eyebrow: 'Spaced repetition', title: 'Revision tracker', sub: 'Completed topics resurface on a schedule based on your confidence (1 day at level 1 up to 30 days at level 5). Rate honestly after each review.' })}
  <section class="card forecast"><div class="card-head"><h3>Next 7 days</h3><small class="muted">reviews coming due</small></div>
    <div class="fc">${fc.map((n, i) => `<div class="fc-col${i === 0 && n ? ' hot' : ''}"><span class="fc-n">${n}</span><div class="fc-bar"><i style="height:${n / mx * 100}%"></i></div><small>${dayLbl(i)}</small></div>`).join('')}</div></section>
  <div class="tabs" role="tablist">${tabs.map(([k, l, a]) => `<button role="tab" aria-selected="${ui.rtab === k}" class="tab${ui.rtab === k ? ' on' : ''}" data-action="tab" data-group="rtab" data-val="${k}">${l}<span class="tab-n">${a.length}</span></button>`).join('')}</div>
  ${list.length ? gridOf(list, { extra }) : emptyState(ui.rtab === 'due' ? '🎉' : '📭', ui.rtab === 'due' ? 'You are all caught up' : 'Nothing here yet', ui.rtab === 'due' ? 'No reviews are due right now. Check the forecast above to see what is coming.' : 'Mark topics complete and they will be scheduled for review automatically.')}`;
};

/* =========================================================
   Interview mode (mock drill + readiness)
   ========================================================= */
const DRILL_GENERIC = [
  'Explain it in 60 seconds as if to a hiring manager.',
  'What problem does it solve, and what are the trade-offs?',
  'Give a concrete real-project example of using it.',
  'What can go wrong in production, and how would you debug it?',
  'How does it differ from the closest alternative?',
  'Walk through what happens internally, step by step.',
  'How would an interviewer test your depth on this topic?'
];
const DRILL_BY_CAT = {
  'Java': ['Which JVM or memory aspects are involved?', 'Write a tiny code snippet from memory.', 'What changed across Java versions here?'],
  'Spring Boot': ['Which beans, proxies or auto-configuration are involved under the hood?', 'How would you configure and test this?', 'What are the common pitfalls and how do you avoid them?'],
  'JUnit5 & Mockito': ['Sketch a test from memory: arrange, act, assert.', 'What would you mock here, and what would you leave real?'],
  'Microservices': ['Which failure mode does this guard against?', 'Which settings or thresholds would you tune, and why?', 'How would you observe it in production?'],
  'Event Driven Architecture': ['What delivery guarantees apply (at-most, at-least, exactly once)?', 'How do ordering, partitions and retries interact here?', 'How would you handle duplicates and failures?'],
  'LLD': ['Name the classes, interfaces and relationships.', 'Which design patterns apply, and why?', 'How would you extend it without modifying existing code?'],
  'HLD': ['State your assumptions and estimate the scale.', 'Where are the bottlenecks and single points of failure?', 'Which datastore and consistency trade-offs would you choose?'],
  'Git': ['Which commands would you run, and what do they change under the hood?', 'How would you recover from a mistake here?'],
  'AWS': ['Which services would you pick, and what are the cost and security trade-offs?'],
  'Spring AI': ['How would you structure the integration and handle latency and failures?']
};

function drillPool() {
  const d = ui.drill;
  return store.topics.filter(t => (d.scope === 'all' || t.category === d.scope) && (d.includeAll || t.completed));
}
function pickPrompts(cat) {
  const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
  const specific = shuffle(DRILL_BY_CAT[cat] || []).slice(0, 1);
  return [...specific, ...shuffle(DRILL_GENERIC).slice(0, 3 - specific.length)];
}
function drillNext() {
  const d = ui.drill;
  stopDrillTimer();
  let pool = drillPool();
  if (!pool.length) { d.topic = null; d.phase = 'empty'; return; }
  if (pool.length > 1) pool = pool.filter(t => t.id !== d.lastId);
  const w = pool.map(t => Math.max(0.5, 6 - t.confidence + (store.isDue(t) ? 3 : 0)));
  let r = Math.random() * w.reduce((a, b) => a + b, 0), pick = pool[pool.length - 1];
  for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) { pick = pool[i]; break; } }
  d.topic = pick; d.lastId = pick.id; d.prompts = pickPrompts(pick.category);
  d.left = d.total; d.running = false; d.phase = 'ask';
}
function stopDrillTimer() {
  const d = ui.drill;
  if (d.timer) { clearInterval(d.timer); d.timer = null; }
  d.running = false;
}

function drillHTML() {
  const d = ui.drill, ses = d.session, t = d.topic;
  const scopeOpts = ['all', ...CATEGORIES].map(c => `<option value="${esc(c)}"${d.scope === c ? ' selected' : ''}>${c === 'all' ? 'All categories' : esc(c)}</option>`).join('');
  const controls = `<div class="drill-controls">
    <label class="selbox"><span>Scope</span><select data-change="drill-scope">${scopeOpts}</select></label>
    <label class="switch"><input type="checkbox" data-change="drill-all"${d.includeAll ? ' checked' : ''}><span class="knob"></span><span>Include topics I haven't completed</span></label>
    <div class="seg-group" role="group" aria-label="Answer time">${[60, 120, 180, 300].map(s => `<button class="seg-btn${d.total === s ? ' on' : ''}" data-action="drill-time" data-val="${s}">${s / 60} min</button>`).join('')}</div></div>`;
  const stats = `<div class="drill-stats"><span><b>${ses.n}</b> answered</span><span class="ok"><b>${ses.nailed}</b> nailed</span><span><b>${ses.okay}</b> okay</span><span class="bad"><b>${ses.missed}</b> missed</span></div>`;
  let stage;
  if (d.phase === 'ask' && t) {
    const m = catMeta(t.category);
    stage = `<div class="drill-stage" style="--cat:${m.color}">
      <div class="drill-main">
        <div class="drill-tags"><span class="tag"><i>${m.icon}</i>${esc(t.category)}</span><span class="pill">${CONF_EMOJI[t.confidence]} ${CONF_LABELS[t.confidence]}</span>${store.isDue(t) ? '<span class="pill warn">Review due</span>' : ''}</div>
        <h2 class="drill-title">${t.num ? `<span class="num">${esc(t.num)}</span>` : ''}${esc(t.name)}</h2>
        <p class="muted">Answer out loud as if you were in the interview:</p>
        <ol class="prompts">${d.prompts.map(p => `<li>${esc(p)}</li>`).join('')}</ol>
        <div class="drill-actions">
          <button class="btn primary lg" data-action="drill-toggle" id="drillToggle">${d.running ? 'Pause' : d.left < d.total ? 'Resume timer' : 'Start timer'} <kbd>Space</kbd></button>
          <button class="btn lg" data-action="drill-reveal">I'm done: check &amp; rate</button>
          <button class="btn ghost" data-action="drill-skip">Skip ${icon('arrow', 14)} <kbd>N</kbd></button>
        </div></div>
      <div class="drill-clock">${ring({ pct: d.left / d.total * 100, size: 150, stroke: 11, color: 'var(--cat)', label: `<span id="drillClock" class="clock">${mmss(d.left)}</span>`, sub: 'answer time' })}</div></div>`;
  } else if (d.phase === 'rate' && t) {
    const m = catMeta(t.category);
    stage = `<div class="drill-stage rate" style="--cat:${m.color}"><div class="drill-main">
      <div class="drill-tags"><span class="tag"><i>${m.icon}</i>${esc(t.category)}</span></div>
      <h2 class="drill-title">${t.num ? `<span class="num">${esc(t.num)}</span>` : ''}${esc(t.name)}</h2>
      <p class="muted">Check your material if you need to, then rate your answer honestly. This reschedules the next review.</p>
      <div class="res-big">${resLinks(t) || '<span class="muted small">No linked resources for this topic.</span>'}</div>
      <div class="rate-btns">
        <button class="rate bad" data-action="drill-rate" data-v="missed"><b>😕 Missed it</b><small>Confidence −1 · review sooner <kbd>1</kbd></small></button>
        <button class="rate mid" data-action="drill-rate" data-v="okay"><b>🙂 Okay</b><small>Keep confidence <kbd>2</kbd></small></button>
        <button class="rate good" data-action="drill-rate" data-v="nailed"><b>💪 Nailed it</b><small>Confidence +1 · review later <kbd>3</kbd></small></button>
      </div></div></div>`;
  } else if (d.phase === 'empty') {
    stage = emptyState('🧩', 'No topics in this pool', 'Complete some topics first, or turn on “Include topics I haven\'t completed”, or pick another scope.');
  } else {
    stage = `<div class="drill-intro"><div class="empty-emoji">🎤</div><h2>Mock interview drill</h2><p>You get a random topic and a few interviewer-style prompts, a timer, then rate how it went. Weak and overdue topics are picked more often, and your rating updates your confidence and revision schedule.</p>
      <p class="muted small">${plural(drillPool().length, 'topic')} in the pool${!drillPool().length ? '. Complete some topics or include uncompleted ones.' : ''}</p>
      <button class="btn primary lg" data-action="drill-start"${!drillPool().length ? ' disabled' : ''}>${icon('play', 15, 'ico-fill')} Start drill</button></div>`;
  }
  return `<div class="card drill">${controls}${stats}${stage}</div>`;
}

Views.interview = () => {
  const s = store.stats();
  const tabs = [['drill', 'Mock drill'], ['ready', 'Readiness']];
  let body;
  if (ui.itab === 'drill') body = drillHTML();
  else {
    const readyList = store.topics.filter(t => t.confidence >= 4);
    const cats = CATEGORIES.map(c => {
      const x = store.catStats(c), m = catMeta(c);
      const weak = store.topics.filter(t => t.category === c && t.completed && t.confidence <= 2).slice(0, 3);
      const pct = x.total ? Math.round(x.readyAny / x.total * 100) : 0;
      return `<div class="card rd" style="--cat:${m.color}"><div class="rd-head"><span class="tl-ico">${m.icon}</span><h3>${esc(c)}</h3><b>${pct}%</b></div><div class="bar"><i style="width:${pct}%"></i></div><p class="muted small">${x.readyAny}/${x.total} interview-ready · avg confidence ${x.avg.toFixed(1)}/5</p>${weak.length ? `<div class="rd-weak"><small>Shaky:</small>${weak.map(t => `<button class="chip-btn sm" data-action="open" data-id="${t.id}">${esc(t.name.length > 26 ? t.name.slice(0, 25) + '…' : t.name)}</button>`).join('')}</div>` : ''}</div>`;
    }).join('');
    body = `<div class="rd-grid">${cats}</div>
      <div class="section-head"><h2>Interview-ready topics <small class="muted">${readyList.length}</small></h2></div>
      <p class="muted">Topics rated confidence 4 (Interview Ready) or 5 (Expert).</p>
      ${readyList.length ? gridOf(readyList) : emptyState('💼', 'No interview-ready topics yet', 'Open a topic, set its confidence to 4 or 5, or earn it through mock drills.')}`;
  }
  return `${pageHead({ eyebrow: 'Interview mode', title: 'Get interview ready', sub: `${s.ready} of ${s.total} topics at confidence 4+. Drill the weak spots, then track readiness by category.` })}
  <div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" aria-selected="${ui.itab === k}" class="tab${ui.itab === k ? ' on' : ''}" data-action="tab" data-group="itab" data-val="${k}">${l}</button>`).join('')}</div>${body}`;
};

/* =========================================================
   Insights
   ========================================================= */
Views.insights = () => {
  const s = store.stats(), st = store.streak();
  const wk = store.weekly(12), mx = Math.max(1, ...wk.map(w => w.done + w.rev));
  const avg = (store.topics.reduce((a, t) => a + t.confidence, 0) / store.topics.length).toFixed(1);
  const bars = wk.map(w => `<div class="wk-col" title="Week of ${esc(w.start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }))}: ${w.done} completed, ${w.rev} revisions, ${w.min} min"><div class="wk-stack"><i class="rev" style="height:${w.rev / mx * 100}%"></i><i class="done" style="height:${w.done / mx * 100}%"></i></div><small>${w.start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</small></div>`).join('');
  const catTime = CATEGORIES.map(c => ({ c, m: store.catStats(c).minutes })).filter(x => x.m > 0).sort((a, b) => b.m - a.m);
  const tmx = Math.max(1, ...catTime.map(x => x.m));
  const ach = store.achievementState().sort((a, b) => (b.unlocked - a.unlocked) || (b.at - a.at) || (b.cur / b.goal - a.cur / a.goal));
  return `${pageHead({ eyebrow: 'Insights', title: 'How you are learning', sub: `${plural(st.active, 'active day')} so far · ${st.current}-day current streak · best ${st.best}.` })}
  <section class="stats-grid">
    <div class="stat-card static"><span class="stat-ico">${icon('check', 18)}</span><h3>Topics completed</h3><div class="value">${s.done}</div><small>of ${s.total}</small></div>
    <div class="stat-card static"><span class="stat-ico acc">${icon('refresh', 18)}</span><h3>Revisions logged</h3><div class="value">${s.revCount}</div><small>across all topics</small></div>
    <div class="stat-card static"><span class="stat-ico">${icon('clock', 18)}</span><h3>Focus time</h3><div class="value">${fmtMin(s.minutes)}</div><small>in focus sessions</small></div>
    <div class="stat-card static"><span class="stat-ico ok">${icon('target', 18)}</span><h3>Avg confidence</h3><div class="value">${avg}<span class="slash">/5</span></div><small>over every topic</small></div>
    <div class="stat-card static"><span class="stat-ico warn">${icon('edit', 18)}</span><h3>Topics with notes</h3><div class="value">${s.notes}</div><small>${s.favs} favourites</small></div>
  </section>
  <section class="grid-2">
    <div class="card"><div class="card-head"><h3>Weekly activity</h3><div class="legend"><span><i class="lgd done"></i>Completed</span><span><i class="lgd rev"></i>Revisions</span></div></div><div class="wk">${bars}</div></div>
    <div class="card"><div class="card-head"><h3>Focus time by category</h3></div>${catTime.length ? `<div class="mastery">${catTime.map(x => `<div class="mrow static" style="--cat:${catMeta(x.c).color}"><span class="mrow-name"><i>${catMeta(x.c).icon}</i>${esc(x.c)}</span><span class="mbar"><i class="seg done" style="width:${x.m / tmx * 100}%"></i></span><span class="mrow-val">${fmtMin(x.m)}</span></div>`).join('')}</div>` : emptyState('⏱️', 'No focus time yet', 'Start a focus session from the dashboard or any topic to track study time.', `<button class="btn primary" data-action="focus">${icon('play', 15, 'ico-fill')} Start focus session</button>`)}</div>
  </section>
  <section class="card"><div class="card-head"><h3>Learning activity</h3></div>${heatmapHTML(26)}</section>
  <section><div class="section-head"><h2>Achievements <small class="muted">${ach.filter(a => a.unlocked).length}/${ach.length}</small></h2></div><div class="ach-grid">${ach.map(achCard).join('')}</div></section>`;
};

/* =========================================================
   Detail panel
   ========================================================= */
function panelHTML(t) {
  const m = catMeta(t.category), nb = store.neighbors(t.id), due = store.dueAt(t);
  const links = [['pdfLink', 'file', 'PDF notes'], ['oneNoteLink', 'note', 'OneNote'], ['gitLink', 'code', 'Code']]
    .filter(([k]) => t[k]).map(([k, ic, l]) => `<a class="res big" href="${esc(t[k])}" target="_blank" rel="noopener noreferrer">${icon(ic, 18)}<span>${l}</span>${icon('external', 14)}</a>`).join('');
  return `<div class="panel-head" style="--cat:${m.color}">
      <div><span class="tag"><i>${m.icon}</i>${esc(t.category)}</span><span class="muted small"> · lesson ${nb.index} of ${nb.total}</span>
      <h2 id="panelTitle">${t.num ? `<span class="num">${esc(t.num)}</span>` : ''}${esc(t.name)}</h2></div>
      <button class="icon-btn" data-action="close-panel" aria-label="Close details">${icon('x', 20)}</button></div>
    <div class="panel-body">
      ${links ? `<div class="panel-links">${links}</div>` : '<p class="muted small">No linked resources for this topic yet. Add them in <code>js/data.js</code>.</p>'}
      <div class="panel-status">
        <button class="btn ${t.completed ? 'success' : 'primary'}" data-action="toggle" data-id="${t.id}">${icon('check', 15)} ${t.completed ? 'Completed' : 'Mark complete'}</button>
        <button class="btn${t.favorite ? ' fav-on' : ''}" data-action="fav" data-id="${t.id}" aria-pressed="${t.favorite}">${icon('star', 15)} ${t.favorite ? 'Favorited' : 'Favorite'}</button>
        <button class="btn" data-action="focus" data-id="${t.id}">${icon('play', 15, 'ico-fill')} Focus</button>
      </div>
      <div class="panel-stats">
        <div><small>Revisions</small><b>${t.revisionCount}</b></div>
        <div><small>Last revised</small><b>${t.lastTs ? new Date(t.lastTs).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : (t.lastRevised || 'Never')}</b></div>
        <div><small>Next review</small><b>${due === null ? '—' : due <= Date.now() ? 'Due now' : new Date(due).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</b></div>
        <div><small>Focus time</small><b>${fmtMin(t.minutes)}</b></div>
      </div>
      <h4>Confidence</h4>
      <div class="conf-scale" role="radiogroup" aria-label="Confidence level">${[1, 2, 3, 4, 5].map(v => `<button role="radio" aria-checked="${t.confidence === v}" class="conf-btn${t.confidence === v ? ' on' : ''}" data-action="set-conf" data-id="${t.id}" data-val="${v}"><span>${CONF_EMOJI[v]}</span>${CONF_LABELS[v]}</button>`).join('')}</div>
      <div class="panel-row"><button class="btn sm" data-action="log-rev" data-id="${t.id}">${icon('refresh', 14)} Log a revision</button><small class="muted">Reschedules your next review.</small></div>
      <h4>Personal notes <small class="muted" id="notesState">autosaves</small></h4>
      <textarea id="panelNotes" data-id="${t.id}" placeholder="Key takeaways, code snippets, revision points…" spellcheck="true">${esc(t.notes)}</textarea>
    </div>
    <div class="panel-foot">
      <button class="btn" data-action="open" data-id="${nb.prev ? nb.prev.id : ''}"${nb.prev ? '' : ' disabled'}>${icon('arrowLeft', 15)} Previous</button>
      <button class="btn" data-action="open" data-id="${nb.next ? nb.next.id : ''}"${nb.next ? '' : ' disabled'}>Next ${icon('arrow', 15)}</button>
    </div>`;
}
