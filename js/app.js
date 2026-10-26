'use strict';
/* =========================================================
   DevPath Application Controller & Event Orchestrator
   ========================================================= */

const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const PAGES = ['dashboard', 'tests', 'library', 'roadmap', 'interview', 'revision', 'insights'];
const PAGE_TITLES = {
  dashboard: 'Dashboard',
  tests: 'Tests & Assessments',
  library: 'Curriculum Library',
  roadmap: 'Roadmap',
  interview: 'Interview Mode',
  revision: 'Revision Queue',
  insights: 'Analytics & Insights'
};
const HUES = [[239, 'Indigo'], [262, 'Violet'], [200, 'Cyan'], [160, 'Emerald'], [25, 'Orange'], [340, 'Rose']];

/* Core Element References */
const el = {
  app: $('#app'),
  main: $('#main'),
  side: $('#sidebar'),
  top: $('#topStats'),
  panel: $('#panel'),
  overlay: $('#overlay'),
  modal: $('#modal'),
  palette: $('#palette'),
  toasts: $('#toasts'),
  dock: $('#dock'),
  tabbar: $('#tabbar'),
  search: $('#globalSearch'),
  canvas: $('#confetti')
};

/* ----- Theme Engine ----- */
function applyTheme() {
  const t = store.settings.theme;
  const eff = t === 'auto' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : t;
  document.documentElement.dataset.theme = eff;
  document.documentElement.style.setProperty('--hue', store.settings.hue);

  const h = +store.settings.hue;
  document.documentElement.style.setProperty('--on-primary', (h >= 220 || h < 10) ? '#ffffff' : '#07130f');
  
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = eff === 'light' ? '#f4f6fb' : '#0b0d17';
  
  const b = $('#themeBtn');
  if (b) {
    b.innerHTML = icon(eff === 'light' ? 'moon' : 'sun', 18);
    b.title = eff === 'light' ? 'Switch to Dark Theme (T)' : 'Switch to Light Theme (T)';
  }
}

function setTheme(t) {
  store.settings.theme = t;
  store.saveSettings();
  applyTheme();
}

function toggleTheme() {
  setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
}

matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', () => {
  if (store.settings.theme === 'auto') applyTheme();
});

/* ----- Focus Retention Across Re-Renders ----- */
function focusKey(node) {
  if (!node || !node.dataset || !(node.dataset.action || node.dataset.change)) return null;
  const d = node.dataset;
  return { action: d.action, change: d.change, id: d.id, val: d.val, key: d.key, cat: d.cat };
}

function refocus(k, root = document) {
  if (!k) return;
  const sel = `[data-${k.action ? 'action' : 'change'}="${k.action || k.change}"]`;
  const hit = $$(sel, root).find(e =>
    (k.id === undefined || e.dataset.id === k.id) &&
    (k.val === undefined || e.dataset.val === k.val) &&
    (k.key === undefined || e.dataset.key === k.key) &&
    (k.cat === undefined || e.dataset.cat === k.cat)
  );
  if (hit) hit.focus({ preventScroll: true });
}

/* ----- Toast Notification Stack ----- */
function toast(msg, o = {}) {
  const t = document.createElement('div');
  t.className = 'toast' + (o.kind ? ' ' + o.kind : '');
  t.innerHTML = `<span class="toast-ico">${o.icon || '✓'}</span><div class="toast-msg"><b>${esc(o.title || msg)}</b>${o.title && msg ? `<small>${esc(msg)}</small>` : ''}</div>`;
  if (o.action) {
    const b = document.createElement('button');
    b.className = 'toast-act';
    b.textContent = o.action.label;
    b.addEventListener('click', () => { o.action.fn(); dismiss(); });
    t.appendChild(b);
  }
  const dismiss = () => {
    t.classList.add('out');
    setTimeout(() => t.remove(), 250);
  };
  el.toasts.appendChild(t);
  while (el.toasts.children.length > 4) el.toasts.firstChild.remove();
  setTimeout(dismiss, o.ms || 4200);
}

/* ----- Confetti Particle Physics ----- */
const confettiState = { parts: [], raf: 0 };
function confetti(x, y, n = 70) {
  if (reduceMotion() || !el.canvas) return;
  const c = el.canvas, dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = innerWidth * dpr;
  c.height = innerHeight * dpr;
  c.style.width = innerWidth + 'px';
  c.style.height = innerHeight + 'px';
  const ctx = c.getContext('2d');
  if (!ctx) return;

  const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444', '#a855f7'];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 9;
    confettiState.parts.push({
      x, y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 5,
      g: 0.22 + Math.random() * 0.1,
      r: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.4,
      w: 5 + Math.random() * 6,
      h: 3 + Math.random() * 5,
      col: colors[i % colors.length],
      life: 1
    });
  }

  if (confettiState.raf) return;
  const step = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    confettiState.parts = confettiState.parts.filter(p => p.life > 0 && p.y < innerHeight + 30);
    for (const p of confettiState.parts) {
      p.vy += p.g;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      p.life -= 0.006;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.col;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (confettiState.parts.length) confettiState.raf = requestAnimationFrame(step);
    else { confettiState.raf = 0; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  };
  confettiState.raf = requestAnimationFrame(step);
}
const burstFrom = (rect, n) => rect ? confetti(rect.left + rect.width / 2, rect.top + rect.height / 2, n) : confetti(innerWidth / 2, innerHeight / 3, n);

/* ----- Audio Cues (Native Web Audio API) ----- */
function beep() {
  try {
    const A = window.AudioContext || window.webkitAudioContext;
    if (!A) return;
    const ctx = new A();
    [[660, 0], [880, 0.18], [1100, 0.36]].forEach(([f, t]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f;
      o.type = 'sine';
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.3);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.32);
    });
    setTimeout(() => ctx.close && ctx.close(), 1200);
  } catch { /* audio muted/blocked */ }
}

/* ----- Router & Rendering ----- */
let lastRouteKey = '';
function parseHash() {
  let h = '';
  try { h = decodeURIComponent(location.hash.replace(/^#\/?/, '')); } catch { h = ''; }
  const [p, ...rest] = h.split('/'), arg = rest.join('/');
  if (p === 'category' && CATEGORIES.includes(arg)) return { page: 'category', cat: arg };
  return { page: PAGES.includes(p) ? p : 'dashboard', cat: null };
}

function animateCounts() {
  if (reduceMotion()) return;
  $$('[data-count]').forEach(n => {
    const end = +n.dataset.count, suf = n.dataset.suffix || '';
    if (!end) return;
    const t0 = performance.now();
    const step = t => {
      const p = Math.min(1, (t - t0) / 700);
      n.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    n.textContent = '0' + suf;
    requestAnimationFrame(step);
  });
}

function syncRoute() {
  const prev = ui.route, next = parseHash(), f = ui.filters;
  if (next.page === 'category') {
    if (prev.page !== 'category' || prev.cat !== next.cat) {
      f.q = ''; f.status = 'all'; f.diff = 'all';
      if (el.search) el.search.value = '';
    }
    f.cat = next.cat;
  } else if (prev.page === 'category') {
    f.cat = 'all';
  }
  if (prev.page === 'interview' && next.page !== 'interview') stopDrillTimer();
  ui.route = next;
  return `${next.page}:${next.cat || ''}`;
}

function render(opts = {}) {
  const routeKey = opts.route ? syncRoute() : `${ui.route.page}:${ui.route.cat || ''}`;
  const newRoute = opts.route && routeKey !== lastRouteKey;
  lastRouteKey = routeKey;

  const active = document.activeElement;
  const fk = (active && (el.main.contains(active) || el.side.contains(active))) ? focusKey(active) : null;
  const y = window.scrollY;
  const view = ui.route.page === 'category' ? 'library' : ui.route.page;

  try {
    el.main.innerHTML = Views[view](ui.route);
  } catch (err) {
    console.error(err);
    el.main.innerHTML = `<div class="card"><h2>Error rendering view</h2><p class="muted">${esc(err.message)}</p><button class="btn primary" data-action="nav" data-href="#/dashboard">Return to Dashboard</button></div>`;
  }

  el.side.innerHTML = Views.sidebar();
  renderTop();
  renderTabbar();
  document.title = `${ui.route.page === 'category' ? ui.route.cat : PAGE_TITLES[ui.route.page]} · DevPath`;

  if (newRoute) {
    el.main.classList.remove('enter');
    void el.main.offsetWidth;
    el.main.classList.add('enter');
    window.scrollTo(0, 0);
    animateCounts();
    closeSidebar();
    if (ui.route.page === 'category' || ui.route.page === 'library') {
      if (el.search) el.search.value = ui.filters.q;
    }
  } else {
    window.scrollTo(0, y);
  }

  refocus(fk, el.app);
  if (timer.s) updateDockTitle();
}

function renderTop() {
  const st = store.streak(), due = store.stats().due;
  el.top.innerHTML = `
    <button class="chip streak${st.todayDone ? ' lit' : ''}" data-action="nav" data-href="#/insights" title="${st.todayDone ? 'You studied today!' : 'Study today to maintain streak'}">
      ${icon('flame', 15)}<b>${st.current}</b>
    </button>
    ${due ? `<button class="chip due" data-action="nav" data-href="#/revision" title="${due} reviews due">${icon('refresh', 15)}<b>${due}</b><span class="hide-sm"> due</span></button>` : ''}
  `;
}

function renderTabbar() {
  const p = ui.route.page, due = store.stats().due;
  const t = (href, ic, label, key, badge) => `<a href="${href}" class="tb${p === key ? ' on' : ''}">${icon(ic, 20)}<span>${label}</span>${badge ? `<i class="tb-badge">${badge}</i>` : ''}</a>`;
  el.tabbar.innerHTML = t('#/dashboard', 'home', 'Home', 'dashboard') +
    t('#/tests', 'target', 'Tests', 'tests') +
    t('#/library', 'grid', 'Library', 'library') +
    t('#/roadmap', 'map', 'Roadmap', 'roadmap') +
    t('#/interview', 'briefcase', 'Drill', 'interview');
}

store.on(fresh => {
  render();
  if (ui.panelId && !(document.activeElement && document.activeElement.id === 'panelNotes')) {
    refreshPanel();
  }
  fresh.forEach((a, i) => {
    setTimeout(() => {
      toast(a.desc, { title: `Badge Unlocked: ${a.name}`, icon: a.icon, kind: 'ach', ms: 5200 });
      if (i === 0) confetti(innerWidth / 2, innerHeight / 3, 110);
    }, 350 + i * 450);
  });
});

/* ----- Layer Management: Overlays, Panels, Modals ----- */
const layerState = { panelOpener: null, modalOpener: null, paletteOpener: null };

function setOverlay() {
  const on = !!(ui.panelId || document.body.classList.contains('side-open') || !el.modal.hidden || !el.palette.hidden);
  el.overlay.classList.toggle('show', on);
  document.body.classList.toggle('no-scroll', on);
}

function openSidebar() { document.body.classList.add('side-open'); setOverlay(); }
function closeSidebar() { document.body.classList.remove('side-open'); setOverlay(); }

function openPanel(id) {
  const t = store.byId.get(id); if (!t) return;
  if (!ui.panelId) layerState.panelOpener = document.activeElement;
  ui.panelId = id;
  refreshPanel();
  document.body.classList.add('panel-open');
  el.panel.classList.add('open');
  el.panel.setAttribute('aria-hidden', 'false');
  el.panel.removeAttribute('inert');
  setOverlay();
  const body = $('.panel-body', el.panel);
  if (body) body.scrollTop = 0;
  setTimeout(() => {
    const c = $('.panel-head .icon-btn', el.panel);
    c && c.focus({ preventScroll: true });
  }, 30);
}

function refreshPanel() {
  const t = store.byId.get(ui.panelId); if (!t) return;
  const active = document.activeElement, fk = el.panel.contains(active) ? focusKey(active) : null;
  const scroll = $('.panel-body', el.panel)?.scrollTop || 0;
  el.panel.innerHTML = panelHTML(t);
  const body = $('.panel-body', el.panel);
  if (body) body.scrollTop = scroll;
  refocus(fk, el.panel);
}

function closePanel() {
  if (!ui.panelId) return;
  ui.panelId = null;
  document.body.classList.remove('panel-open');
  el.panel.classList.remove('open');
  el.panel.setAttribute('aria-hidden', 'true');
  el.panel.setAttribute('inert', '');
  setOverlay();
  const o = layerState.panelOpener;
  layerState.panelOpener = null;
  if (o && document.contains(o)) o.focus({ preventScroll: true });
}

function openModal(html, cls = '') {
  if (el.modal.hidden) layerState.modalOpener = document.activeElement;
  el.modal.hidden = false;
  el.modal.innerHTML = `<div class="modal ${cls}" role="dialog" aria-modal="true">${html}</div>`;
  setOverlay();
  const first = $('[autofocus], input, select, button.primary, .modal-close', el.modal);
  setTimeout(() => first && first.focus({ preventScroll: true }), 20);
}

function closeModal() {
  if (el.modal.hidden) return;
  el.modal.hidden = true;
  el.modal.innerHTML = '';
  setOverlay();
  const o = layerState.modalOpener;
  layerState.modalOpener = null;
  if (o && document.contains(o)) o.focus({ preventScroll: true });
}

function confirmDialog({ title, text, confirm = 'Confirm', danger = false }, onYes) {
  openModal(`<h2>${esc(title)}</h2><p class="muted">${esc(text)}</p><div class="modal-actions"><button class="btn" data-action="close-modal">Cancel</button><button class="btn ${danger ? 'danger' : 'primary'}" data-action="confirm-yes">${esc(confirm)}</button></div>`, 'sm');
  confirmDialog.fn = onYes;
}

function closeTopLayer() {
  if (!el.palette.hidden) return closePalette(), true;
  if (!el.modal.hidden) return closeModal(), true;
  if (ui.panelId) return closePanel(), true;
  if (document.body.classList.contains('side-open')) return closeSidebar(), true;
  return false;
}

/* ----- Command Palette (Ctrl/Cmd + K) ----- */
const pal = { items: [], sel: 0 };

function paletteItems(q) {
  const toks = q.toLowerCase().split(/\s+/).filter(Boolean);
  const all = [];
  const pageDefs = [
    ['dashboard', 'home', 'Go to Dashboard', 'g d'],
    ['tests', 'target', 'Go to Tests & Exams', 'g t'],
    ['library', 'grid', 'Go to Curriculum Library', 'g l'],
    ['roadmap', 'map', 'Go to Roadmap', 'g m'],
    ['interview', 'briefcase', 'Go to Interview Mode', 'g i'],
    ['revision', 'refresh', 'Go to Revision Queue', 'g r'],
    ['insights', 'chart', 'Go to Insights & Analytics', 'g n']
  ];
  pageDefs.forEach(([k, ic, label, hint]) => all.push({ group: 'Pages', icon: ic, label, hint, kw: k, run: () => { location.hash = '#/' + k; } }));
  CATEGORIES.forEach(c => all.push({ group: 'Domains', emoji: catMeta(c).icon, label: `Open ${c}`, hint: `${store.catStats(c).done}/${store.catStats(c).total}`, kw: c, run: () => { location.hash = catHref(c); } }));
  [
    { icon: 'play', label: 'Start a Focus Session', hint: 'F', kw: 'focus timer pomodoro study', run: () => startFocus() },
    { icon: 'bolt', label: 'Launch Mock Interview Drill', kw: 'interview mock drill practice', run: () => { ui.itab = 'drill'; location.hash = '#/interview'; render(); } },
    { icon: 'refresh', label: 'Review Due Spaced Revisions', kw: 'revision due review spaced', run: () => { ui.rtab = 'due'; location.hash = '#/revision'; render(); } },
    { icon: 'moon', label: 'Toggle Light / Dark Theme', hint: 'T', kw: 'theme dark light mode', run: toggleTheme },
    { icon: 'sliders', label: 'Open Settings', kw: 'settings preferences goal accent name', run: openSettings },
    { icon: 'keyboard', label: 'Keyboard Shortcuts Help', hint: '?', kw: 'help shortcuts keys', run: openHelp },
    { icon: 'download', label: 'Export JSON Backup', kw: 'export backup download save', run: exportBackup },
    { icon: 'download', label: 'Export Study Notes (Markdown)', kw: 'export notes markdown', run: exportNotes }
  ].forEach(a => all.push({ group: 'Actions', ...a }));

  if (!toks.length) return all.filter(i => i.group !== 'Domains').slice(0, 14);

  const score = (hay, label) => {
    if (!toks.every(k => hay.includes(k))) return -1;
    const l = label.toLowerCase();
    return toks.reduce((s, k) => s + (l.startsWith(k) ? 5 : l.includes(' ' + k) ? 3 : l.includes(k) ? 2 : 1), 0);
  };

  const out = [];
  all.forEach(i => {
    const s = score(`${i.label} ${i.kw || ''}`.toLowerCase(), i.label);
    if (s >= 0) out.push({ ...i, s: s + 0.5 });
  });

  const topics = [];
  store.topics.forEach(t => {
    const s = score(`${t.title} ${t.category} ${t.completed ? 'done' : 'todo'} ${t.favorite ? 'favorite' : ''}`.toLowerCase(), t.name);
    if (s >= 0) {
      topics.push({
        group: 'Topics',
        emoji: catMeta(t.category).icon,
        label: t.name,
        sub: t.category + (t.num ? ' · ' + t.num : ''),
        done: t.completed,
        id: t.id,
        s,
        run: () => openPanel(t.id)
      });
    }
  });

  topics.sort((a, b) => b.s - a.s || store.byId.get(a.id).order - store.byId.get(b.id).order);
  const rest = topics.length - 12;
  return [
    ...out.sort((a, b) => b.s - a.s).slice(0, 6),
    ...topics.slice(0, 12),
    ...(rest > 0 ? [{ group: 'Topics', icon: 'arrow', label: `See all ${topics.length} matches in library`, run: () => { ui.filters.q = q; ui.filters.cat = 'all'; location.hash = '#/library'; if (el.search) el.search.value = q; render({ route: true }); } }] : [])
  ];
}

function renderPalette() {
  const q = $('#palInput').value;
  pal.items = paletteItems(q);
  pal.sel = Math.min(pal.sel, Math.max(0, pal.items.length - 1));
  let last = '', html = '';
  pal.items.forEach((it, i) => {
    if (it.group !== last) { html += `<li class="pal-group" role="presentation">${it.group}</li>`; last = it.group; }
    html += `<li id="pal-${i}" class="pal-item${i === pal.sel ? ' sel' : ''}" role="option" aria-selected="${i === pal.sel}" data-idx="${i}">
      <span class="pal-ico">${it.emoji || icon(it.icon || 'arrow', 16)}</span>
      <span class="pal-label">${hl(it.label, q)}</span>
      ${it.sub ? `<small>${esc(it.sub)}</small>` : ''}
      ${it.done ? '<span class="pill ok sm">done</span>' : ''}
      ${it.hint ? `<kbd>${esc(it.hint)}</kbd>` : ''}
    </li>`;
  });
  $('#palList').innerHTML = html || '<li class="pal-empty">No results found for that search.</li>';
  $('#palInput').setAttribute('aria-activedescendant', pal.items.length ? `pal-${pal.sel}` : '');
  const s = $('.pal-item.sel', el.palette);
  if (s) s.scrollIntoView({ block: 'nearest' });
}

function openPalette() {
  if (!el.palette.hidden) return;
  layerState.paletteOpener = document.activeElement;
  closeSidebar();
  el.palette.hidden = false;
  el.palette.innerHTML = `<div class="palette" role="dialog" aria-modal="true" aria-label="Command palette">
    <div class="pal-search">${icon('search', 18)}<input id="palInput" type="text" placeholder="Search 206 topics, navigate views, run commands…" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="palList"><kbd>Esc</kbd></div>
    <ul id="palList" role="listbox"></ul>
    <div class="pal-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>Enter</kbd> execute</span><span><kbd>Esc</kbd> dismiss</span></div>
  </div>`;
  pal.sel = 0;
  setOverlay();
  renderPalette();
  $('#palInput').focus();
}

function closePalette() {
  if (el.palette.hidden) return;
  el.palette.hidden = true;
  el.palette.innerHTML = '';
  setOverlay();
  const o = layerState.paletteOpener;
  layerState.paletteOpener = null;
  if (o && document.contains(o)) o.focus({ preventScroll: true });
}

function runPaletteItem(i) {
  const it = pal.items[i]; if (!it) return;
  layerState.paletteOpener = null;
  closePalette();
  setTimeout(() => it.run(), 10);
}

/* ----- Focus Timer Dock Engine ----- */
const timer = { s: readJSON(LS.timer, null), iv: null };
const timerPersist = () => timer.s ? writeJSON(LS.timer, timer.s) : (() => { try { localStorage.removeItem(LS.timer); } catch { /* ignore */ } })();
const timerRemaining = () => {
  const s = timer.s; if (!s) return 0;
  return s.endsAt ? Math.max(0, Math.ceil((s.endsAt - Date.now()) / 1000)) : s.remaining;
};

function renderDock() {
  const s = timer.s;
  el.dock.hidden = !s;
  document.body.classList.toggle('has-dock', !!s);
  if (!s) {
    document.title = document.title.replace(/^\d\d:\d\d · /, '');
    return;
  }
  const running = !!s.endsAt, rem = timerRemaining(), pct = Math.round((1 - rem / s.total) * 100);
  const t = s.id ? store.byId.get(s.id) : null;
  el.dock.innerHTML = `<div class="dock-bar" style="width:${pct}%"></div>
    <div class="dock-main">
      <div class="dock-info">
        <small>${running ? 'Focus Session Active' : 'Session Paused'}</small>
        <b>${esc(t ? t.name : 'Open Deep Focus')}</b>
      </div>
      <div class="dock-time" id="dockTime" role="timer" aria-live="off">${mmss(rem)}</div>
      <div class="dock-btns">
        <button class="icon-btn" data-action="timer-add" title="+5 min" aria-label="Add 5 minutes">${icon('plus', 18)}</button>
        <button class="icon-btn big" data-action="timer-toggle" aria-label="${running ? 'Pause' : 'Resume'}">${icon(running ? 'pause' : 'play', 20, running ? '' : 'ico-fill')}</button>
        <button class="icon-btn" data-action="timer-stop" title="End Session" aria-label="End session">${icon('stop', 18, 'ico-fill')}</button>
      </div>
    </div>`;
  updateDockTitle();
}

function updateDockTitle() {
  const s = timer.s; if (!s) return;
  const base = (ui.route.page === 'category' ? ui.route.cat : PAGE_TITLES[ui.route.page]) + ' · DevPath';
  document.title = `${mmss(timerRemaining())} · ${base}`;
}

function timerTick() {
  const s = timer.s; if (!s) return;
  if (s.endsAt && timerRemaining() <= 0) return timerDone();
  const t = $('#dockTime'); if (t) t.textContent = mmss(timerRemaining());
  const b = $('.dock-bar', el.dock); if (b) b.style.width = Math.round((1 - timerRemaining() / s.total) * 100) + '%';
  updateDockTitle();
}

function timerLoop() {
  clearInterval(timer.iv);
  timer.iv = timer.s && timer.s.endsAt ? setInterval(timerTick, 500) : null;
}

function startFocus(id, minutes) {
  if (timer.s) {
    toast('Please complete or stop the current session first.', { icon: '⏱️', title: 'Session In Progress' });
    return;
  }
  if (id === undefined) return openFocusModal();
  const min = minutes || store.settings.focusMin;
  timer.s = { id: id || null, total: min * 60, endsAt: Date.now() + min * 60000, remaining: min * 60 };
  timerPersist();
  renderDock();
  timerLoop();
  toast(`${min} minutes on the clock. Deep work starts now.`, { icon: '🎯', title: id ? `Focus: ${store.byId.get(id).name}` : 'Focus Session Started' });
}

function openFocusModal() {
  const next = store.nextUp();
  const opts = CATEGORIES.map(c => `<optgroup label="${esc(c)}">${store.topics.filter(t => t.category === c).map(t => `<option value="${t.id}"${next && next.id === t.id ? ' selected' : ''}>${t.completed ? '✓ ' : ''}${esc(t.title)}</option>`).join('')}</optgroup>`).join('');
  openModal(`<button class="icon-btn modal-close" data-action="close-modal" aria-label="Close">${icon('x', 20)}</button>
    <h2>Initiate Focus Session</h2>
    <p class="muted">Focus minutes contribute to your active streak and learning activity graphs.</p>
    <label class="field"><span>Target Lesson</span><select id="focusTopic"><option value="">Open Focus (No Specific Topic)</option>${opts}</select></label>
    <div class="field"><span>Duration</span><div class="seg-group" id="focusLen" role="group">${[15, 25, 45, 60, 90].map(m => `<button class="seg-btn${store.settings.focusMin === m ? ' on' : ''}" data-action="pick-len" data-val="${m}">${m}m</button>`).join('')}</div></div>
    <div class="modal-actions"><button class="btn" data-action="close-modal">Cancel</button><button class="btn primary" data-action="focus-go">${icon('play', 15, 'ico-fill')} Begin Focus</button></div>`, 'sm');
}

function timerStopNow() {
  const s = timer.s; if (!s) return;
  const min = Math.floor((s.total - timerRemaining()) / 60);
  timer.s = null;
  timerPersist();
  renderDock();
  timerLoop();
  if (min >= 1) {
    store.addMinutes(s.id, min);
    toast('', { title: `Logged ${min} min of Deep Focus`, icon: '⏱️' });
  } else {
    toast('Sessions under 1 minute are not recorded.', { title: 'Session Ended', icon: '⏱️' });
  }
}

function timerDone() {
  const s = timer.s; if (!s) return;
  const min = Math.round(s.total / 60);
  timer.s = null;
  timerPersist();
  renderDock();
  timerLoop();
  store.addMinutes(s.id, min);
  beep();
  confetti(innerWidth / 2, innerHeight / 2, 90);
  const t = s.id && store.byId.get(s.id);
  toast(t && !t.completed ? 'Mark this lesson complete if finished!' : 'Great focus! Take a 5-minute break.', {
    title: `Focus Complete: ${min} Minutes Logged`,
    icon: '🎉',
    ms: 7000,
    action: t && !t.completed ? { label: 'Mark Complete', fn: () => doToggle(s.id) } : null
  });
}

/* ----- Action Handlers & Mutations ----- */
function doToggle(id, rect) {
  const res = store.toggleComplete(id); if (!res) return;
  const t = store.byId.get(id);
  if (res.completed) {
    burstFrom(rect, res.catDone ? 120 : 28);
    const msg = res.catDone ? `You completed the entire ${t.category} domain!` : `Scheduled for first SRS review in ${SRS_DAYS[t.confidence]} day(s).`;
    toast(msg, {
      title: res.catDone ? `${t.category} Mastered! 🏆` : `Completed: ${t.name}`,
      icon: res.catDone ? '🏆' : '✅',
      action: { label: 'Undo', fn: () => store.toggleComplete(id) }
    });
  }
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(store.exportData(), null, 2)], { type: 'application/json' });
  download(blob, `devpath-backup-${dayKey()}.json`);
  toast('Backup generated. Transfer to any device to restore complete state.', { title: 'Backup Saved', icon: '💾' });
}

function exportNotes() {
  const md = store.notesMarkdown();
  if (!md) return toast('Write notes in any topic detail panel to export.', { title: 'No Notes Found', icon: '📝' });
  download(new Blob([md], { type: 'text/markdown' }), `devpath-notes-${dayKey()}.md`);
  toast('', { title: 'Study Notes Exported (Markdown)', icon: '📝' });
}

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function openSettings() {
  const s = store.settings;
  openModal(`<button class="icon-btn modal-close" data-action="close-modal" aria-label="Close">${icon('x', 20)}</button>
    <h2>Settings &amp; Personalization</h2>
    <div class="set-grid">
      <label class="field"><span>Learner Name</span><input type="text" id="setName" data-change="set-name" value="${esc(s.name)}" placeholder="Your greeting name" maxlength="30"></label>
      <label class="field"><span>Daily Topic Goal</span><input type="number" id="setGoal" data-change="set-goal" min="1" max="20" value="${s.dailyGoal}"></label>
      <div class="field"><span>Default Focus Length</span><div class="seg-group" role="group">${[15, 25, 45, 60, 90].map(m => `<button class="seg-btn${s.focusMin === m ? ' on' : ''}" data-action="set-focus" data-val="${m}">${m}m</button>`).join('')}</div></div>
      <div class="field"><span>Theme Mode</span><div class="seg-group" role="group">${[['dark', 'Dark'], ['light', 'Light'], ['auto', 'Auto']].map(([v, l]) => `<button class="seg-btn${s.theme === v ? ' on' : ''}" data-action="set-theme" data-val="${v}">${l}</button>`).join('')}</div></div>
      <div class="field wide"><span>Accent Hue</span><div class="swatches">${HUES.map(([h, n]) => `<button class="swatch${+s.hue === h ? ' on' : ''}" style="--h:${h}" data-action="set-hue" data-val="${h}" title="${n}" aria-label="${n}" aria-pressed="${+s.hue === h}"></button>`).join('')}</div></div>
    </div>
    <h3 class="modal-sub">Data Management</h3>
    <p class="muted small">All data is preserved locally in this browser. Export backups regularly to sync across machines.</p>
    <div class="row-actions">
      <button class="btn" data-action="export-backup">${icon('download', 15)} Export Backup</button>
      <button class="btn" data-action="import-backup">${icon('upload', 15)} Import Backup</button>
      <button class="btn" data-action="export-notes">${icon('note', 15)} Export Notes</button>
      <button class="btn danger-o" data-action="reset-all">${icon('trash', 15)} Reset Progress</button>
    </div>
    <input type="file" id="importFile" data-change="import-file" accept="application/json,.json" hidden>`);
}

function openHelp() {
  const rows = [
    ['Ctrl / ⌘ + K', 'Command palette & search'],
    ['/', 'Focus search input'],
    ['g then d / l / m / i / r / n', 'Jump to Dashboard / Library / Roadmap / Interview / Revision / Insights'],
    ['f', 'Quick-launch focus session'],
    ['t', 'Toggle light/dark theme'],
    ['← →', 'Previous / Next topic in details drawer'],
    ['Esc', 'Close any panel, modal, or palette'],
    ['Space · N · 1 2 3', 'Interview drill controls (pause, skip, evaluate)'],
    ['?', 'Display keyboard shortcut help']
  ];
  openModal(`<button class="icon-btn modal-close" data-action="close-modal" aria-label="Close">${icon('x', 20)}</button>
    <h2>Keyboard Shortcuts</h2>
    <table class="keys"><tbody>${rows.map(([k, d]) => `<tr><td>${k.split(' ').map(x => ['then', 'or', '/', '+'].includes(x) ? ` ${x} ` : `<kbd>${esc(x)}</kbd>`).join('')}</td><td>${esc(d)}</td></tr>`).join('')}</tbody></table>`, 'sm');
}

/* ----- Interview Drill Ticker ----- */
function drillTick() {
  const d = ui.drill;
  d.left = Math.max(0, d.left - 1);
  const c = $('#drillClock');
  if (c) c.textContent = mmss(d.left);
  const fg = $('.drill-clock .ring-fg');
  if (fg) {
    const circ = parseFloat(fg.getAttribute('stroke-dasharray'));
    fg.style.strokeDashoffset = circ * (1 - d.left / d.total);
  }
  if (d.left === 0) {
    stopDrillTimer();
    beep();
    d.phase = 'rate';
    toast('Time is up! Rate your articulation and technical depth.', { title: 'Drill Countdown Expired', icon: '⏰' });
    render();
  }
}

function drillToggle() {
  const d = ui.drill;
  if (d.running) {
    stopDrillTimer();
  } else {
    d.running = true;
    d.timer = setInterval(drillTick, 1000);
  }
  render();
}

/* =========================================================
   Event Delegation Table
   ========================================================= */
const A = {
  nav: (t, n) => { location.hash = n.dataset.href; },
  lib: (t, n) => { ui.filters.status = n.dataset.status; ui.filters.cat = 'all'; ui.filters.q = ''; location.hash = '#/library'; render({ route: true }); },
  toggle: (t, n) => doToggle(n.dataset.id, n.getBoundingClientRect()),
  fav: (t, n) => { store.toggleFavorite(n.dataset.id); },
  open: (t, n) => openPanel(n.dataset.id),
  'close-panel': () => closePanel(),
  'close-modal': () => closeModal(),
  'confirm-yes': () => { const f = confirmDialog.fn; closeModal(); f && f(); },
  filter: (t, n) => { ui.filters[n.dataset.key] = n.dataset.val; render(); },
  'reset-filters': () => {
    Object.assign(ui.filters, { q: '', status: 'all', diff: 'all', cat: ui.route.page === 'category' ? ui.route.cat : 'all' });
    if (el.search) el.search.value = '';
    render();
  },
  view: (t, n) => { ui.view = n.dataset.val; store.settings.view = ui.view; store.saveSettings(); render(); },
  expand: (t, n) => {
    const c = n.dataset.cat, isOpen = n.getAttribute('aria-expanded') === 'true';
    if (isOpen) { ui.expanded.delete(c); ui.expanded.add('!' + c); }
    else { ui.expanded.add(c); ui.expanded.delete('!' + c); }
    render();
  },
  tab: (t, n) => {
    if (n.dataset.group === 'itab' && n.dataset.val !== 'drill') stopDrillTimer();
    ui[n.dataset.group] = n.dataset.val;
    render();
  },
  rate: (t, n) => {
    const r = store.rate(n.dataset.id, n.dataset.val), tp = store.byId.get(n.dataset.id);
    if (r) toast(`${r.before === r.after ? 'Confidence retained at' : `Confidence: ${r.before} → `}${r.after}. Next review in ${SRS_DAYS[r.after]} day(s).`, { title: tp.name, icon: n.dataset.val === 'nailed' ? '💪' : n.dataset.val === 'okay' ? '🙂' : '😕' });
  },
  'set-conf': (t, n) => store.setConfidence(n.dataset.id, +n.dataset.val),
  'log-rev': (t, n) => { store.logRevision(n.dataset.id); toast('Spaced repetition calendar updated.', { title: 'Revision Logged', icon: '🔁' }); },
  focus: (t, n) => startFocus(n.dataset.id || (n.dataset.id === '' ? '' : undefined)),
  'pick-len': (t, n) => { $$('#focusLen .seg-btn').forEach(b => b.classList.toggle('on', b === n)); },
  'focus-go': () => {
    const id = $('#focusTopic').value, len = +($('#focusLen .on')?.dataset.val || store.settings.focusMin);
    closeModal();
    startFocus(id, len);
  },
  'timer-toggle': () => {
    const s = timer.s; if (!s) return;
    if (s.endsAt) { s.remaining = timerRemaining(); s.endsAt = null; }
    else s.endsAt = Date.now() + s.remaining * 1000;
    timerPersist(); renderDock(); timerLoop();
  },
  'timer-add': () => {
    const s = timer.s; if (!s) return;
    s.total += 300;
    if (s.endsAt) s.endsAt += 300000;
    else s.remaining += 300;
    timerPersist(); renderDock();
  },
  'timer-stop': () => timerStopNow(),
  palette: () => openPalette(),
  help: () => openHelp(),
  settings: () => { closeSidebar(); openSettings(); },
  theme: () => toggleTheme(),
  menu: () => (document.body.classList.contains('side-open') ? closeSidebar() : openSidebar()),
  collapse: () => {
    document.body.classList.toggle('side-collapsed');
    store.settings.sidebar = !document.body.classList.contains('side-collapsed');
    store.saveSettings();
  },
  'set-focus': (t, n) => {
    store.settings.focusMin = +n.dataset.val;
    store.saveSettings();
    $$('[data-action="set-focus"]').forEach(b => b.classList.toggle('on', b === n));
  },
  'set-theme': (t, n) => {
    setTheme(n.dataset.val);
    $$('[data-action="set-theme"]').forEach(b => b.classList.toggle('on', b === n));
  },
  'set-hue': (t, n) => {
    store.settings.hue = +n.dataset.val;
    store.saveSettings();
    applyTheme();
    $$('.swatch').forEach(b => {
      const on = b === n;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on);
    });
  },
  'export-backup': exportBackup,
  'export-notes': exportNotes,
  'import-backup': () => $('#importFile').click(),
  'reset-all': () => confirmDialog({
    title: 'Reset All Progress?',
    text: 'This permanently clears completions, confidence scores, notes, streaks, focus logs, and test attempts on this device.',
    confirm: 'Yes, Reset Everything',
    danger: true
  }, () => {
    store.resetProgress();
    location.reload();
  }),
  /* Test hub actions */
  'daily-challenge': () => {
    closePanel();
    if (Quiz.startDailyChallenge()) renderQuiz();
    else toast('Daily challenge questions could not be compiled.', { title: 'Bank Empty', icon: '☀️' });
  },
  'weak-practice': (t, n) => {
    closePanel();
    const cat = (n && n.dataset && n.dataset.cat) || 'all';
    if (Quiz.startWeakPractice(cat)) renderQuiz();
    else toast('No missed questions recorded yet! Take topic exams to discover your weak areas.', { title: 'All Clear 🎯', icon: '🎯' });
  },
  /* Mock drill actions */
  'drill-start': () => { ui.drill.session = { n: 0, nailed: 0, okay: 0, missed: 0 }; drillNext(); render(); },
  'drill-toggle': () => drillToggle(),
  'drill-reveal': () => { stopDrillTimer(); ui.drill.phase = 'rate'; render(); },
  'drill-skip': () => { drillNext(); render(); },
  'drill-time': (t, n) => {
    const d = ui.drill;
    d.total = +n.dataset.val;
    if (!d.running) d.left = d.total;
    render();
  },
  'drill-rate': (t, n) => {
    const d = ui.drill, tp = d.topic; if (!tp) return;
    const v = n.dataset.val;
    d.session.n++;
    d.session[v]++;
    const id = tp.id;
    drillNext();
    const r = store.rate(id, v);
    if (v === 'nailed') burstFrom(n.getBoundingClientRect(), 24);
    if (r) toast(`${r.before === r.after ? 'Confidence stays at' : `Confidence: ${r.before} → `}${r.after}`, {
      title: v === 'nailed' ? 'Mastered!' : v === 'okay' ? 'Logged' : 'Scheduled for quick review',
      icon: v === 'nailed' ? '💪' : v === 'okay' ? '🙂' : '😕',
      ms: 2600
    });
  }
};

/* Merge quiz and battle action handlers */
Object.assign(A, QuizActions, BattleActions);

document.addEventListener('click', e => {
  const n = e.target.closest('[data-action]');
  if (n && A[n.dataset.action]) {
    if (n.tagName === 'A') e.preventDefault();
    A[n.dataset.action](e.target, n, e);
    return;
  }
  const pi = e.target.closest('.pal-item');
  if (pi) return runPaletteItem(+pi.dataset.idx);
  if (e.target === el.palette) return closePalette();
  if (e.target === el.modal) return closeModal();
  if (e.target === el.overlay) return closeTopLayer();
  if (document.body.classList.contains('side-open') && !e.target.closest('.sidebar') && !e.target.closest('[data-action="menu"]')) closeSidebar();
  if (e.target.closest('.sidebar a')) closeSidebar();
});

document.addEventListener('change', e => {
  const n = e.target.closest('[data-change]'); if (!n) return;
  const k = n.dataset.change;
  if (k === 'filter') { ui.filters[n.dataset.key] = n.value; render(); }
  else if (k === 'drill-scope') { stopDrillTimer(); ui.drill.scope = n.value; ui.drill.phase = 'idle'; render(); }
  else if (k === 'drill-all') { stopDrillTimer(); ui.drill.includeAll = n.checked; ui.drill.phase = 'idle'; render(); }
  else if (k === 'set-name') { store.settings.name = n.value.trim(); store.saveSettings(); render(); }
  else if (k === 'set-goal') { store.settings.dailyGoal = clamp(Math.round(+n.value) || 3, 1, 20); n.value = store.settings.dailyGoal; store.saveSettings(); render(); }
  else if (k === 'import-file') {
    const f = n.files && n.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        store.importData(JSON.parse(r.result));
        closeModal();
        toast('Reloading with restored data…', { title: 'Backup Restored', icon: '📥' });
        setTimeout(() => location.reload(), 700);
      } catch (err) {
        toast(err.message || 'File read error.', { title: 'Import Failed', icon: '⚠️', kind: 'bad' });
      }
    };
    r.readAsText(f);
  }
});

/* Keyboard activation for role="button" elements */
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-action]')) {
    e.preventDefault();
    e.target.click();
  }
});

/* Notes Autosave (Debounced 450ms) */
let notesTimer = 0;
document.addEventListener('input', e => {
  if (e.target.id === 'panelNotes') {
    const id = e.target.dataset.id, val = e.target.value, st = $('#notesState');
    if (st) st.textContent = 'saving…';
    clearTimeout(notesTimer);
    notesTimer = setTimeout(() => {
      store.setNotes(id, val);
      const s2 = $('#notesState');
      if (s2) s2.textContent = 'saved ✓';
    }, 450);
  } else if (e.target.id === 'palInput') {
    pal.sel = 0;
    renderPalette();
  }
});

/* Global Search Input */
let searchTimer = 0;
if (el.search) {
  el.search.addEventListener('input', () => {
    ui.filters.q = el.search.value;
    if (ui.route.page !== 'library' && ui.route.page !== 'category') {
      if (ui.route.page !== 'library') ui.filters.cat = 'all';
      location.hash = '#/library';
      return;
    }
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => render(), 120);
  });

  el.search.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (el.search.value) { el.search.value = ''; ui.filters.q = ''; render(); }
      else el.search.blur();
    }
  });
}

/* Shortcuts & Keybind Trap */
let gPending = 0;
const GOTO = { d: 'dashboard', t: 'tests', l: 'library', m: 'roadmap', i: 'interview', r: 'revision', n: 'insights' };
const isTyping = t => t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);

function trapTab(e, root) {
  const f = $$('a[href], button:not([disabled]), input:not([disabled]):not([hidden]), select, textarea, [tabindex]:not([tabindex="-1"])', root).filter(x => x.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  else if (!root.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
}

document.addEventListener('keydown', e => {
  /* Anti-cheat keyboard hardening during active proctored tests & battle duels */
  const isExamActive = Quiz.s && Quiz.s.mode === 'exam' && (Quiz.s.phase === 'q' || Quiz.s.phase === 'fb');
  const isBattleActive = typeof Battle !== 'undefined' && Battle.active && Battle.active();

  if (isExamActive || isBattleActive) {
    const k = e.key.toLowerCase();
    const hasMod = e.ctrlKey || e.metaKey;
    const isDevTools = e.key === 'F12' || (hasMod && (e.shiftKey || e.altKey) && ['i', 'j', 'c'].includes(k));
    const isRestrictedKey = hasMod && ['c', 'u', 'p', 's', 'x', 'a', 'k'].includes(k);

    if (isDevTools || isRestrictedKey) {
      e.preventDefault();
      e.stopPropagation();
      toast('Proctored exam active: inspect, copy, and shortcut keys are locked.', {
        title: 'Anti-Cheat Protection 🛡️',
        icon: '🛡️',
        kind: 'bad',
        ms: 2200
      });
      return;
    }
  }

  if (Quiz.active() && el.modal.hidden && el.palette.hidden) {
    if (e.key === 'Tab') return trapTab(e, document.getElementById('quiz'));
    QuizKeys(e);
    return;
  }

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    el.palette.hidden ? openPalette() : closePalette();
    return;
  }

  if (e.key === 'Escape') {
    if (closeTopLayer()) e.preventDefault();
    return;
  }

  if (e.key === 'Tab') {
    if (!el.palette.hidden) return trapTab(e, el.palette);
    if (!el.modal.hidden) return trapTab(e, el.modal);
    if (ui.panelId) return trapTab(e, el.panel);
  }

  if (!el.palette.hidden) {
    if (e.key === 'ArrowDown') { e.preventDefault(); pal.sel = (pal.sel + 1) % Math.max(1, pal.items.length); renderPalette(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); pal.sel = (pal.sel - 1 + pal.items.length) % Math.max(1, pal.items.length); renderPalette(); }
    else if (e.key === 'Enter') { e.preventDefault(); runPaletteItem(pal.sel); }
    return;
  }

  if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target) || !el.modal.hidden) return;

  const k = e.key;
  if (ui.panelId && (k === 'ArrowRight' || k === 'ArrowLeft')) {
    const nb = store.neighbors(ui.panelId), t = k === 'ArrowRight' ? nb.next : nb.prev;
    if (t) { e.preventDefault(); openPanel(t.id); }
    return;
  }

  if (ui.route.page === 'interview' && ui.itab === 'drill' && !ui.panelId) {
    const d = ui.drill;
    if (d.phase === 'ask') {
      if (k === ' ') { e.preventDefault(); return drillToggle(); }
      if (k.toLowerCase() === 'n') return A['drill-skip']();
      if (k === 'Enter') return A['drill-reveal']();
    } else if (d.phase === 'rate' && '123'.includes(k) && k.length === 1) {
      const btn = $(`.rate-btns .rate:nth-child(${k})`);
      if (btn) { e.preventDefault(); return btn.click(); }
    }
  }

  if (gPending && Date.now() - gPending < 1200) {
    gPending = 0;
    const p = GOTO[k.toLowerCase()];
    if (p) { e.preventDefault(); closePanel(); location.hash = '#/' + p; }
    return;
  }

  if (k === '/') { e.preventDefault(); el.search.focus(); el.search.select(); }
  else if (k === '?') { e.preventDefault(); openHelp(); }
  else if (k.toLowerCase() === 'g') gPending = Date.now();
  else if (k.toLowerCase() === 't') toggleTheme();
  else if (k.toLowerCase() === 'f') startFocus();
});

window.addEventListener('hashchange', () => { closePanel(); render({ route: true }); });
document.addEventListener('visibilitychange', () => { if (!document.hidden && timer.s) timerTick(); });

/* ----- Boot Lifecycle ----- */
function boot() {
  applyTheme();
  if (matchMedia('(hover: none)').matches) {
    if (el.search) el.search.placeholder = 'Search topics…';
    document.body.classList.add('touch');
  }
  if (store.settings.sidebar === false) document.body.classList.add('side-collapsed');
  el.panel.setAttribute('inert', '');

  if (!location.hash) history.replaceState(null, '', '#/dashboard');
  render({ route: true });

  if (timer.s) {
    const s = timer.s;
    if (s.endsAt && s.endsAt <= Date.now()) { renderDock(); timerDone(); }
    else { renderDock(); timerLoop(); }
  }

  if (!store.flags.welcomed) {
    store.flags.welcomed = true;
    store.save();
    setTimeout(() => toast('Press Ctrl + K anytime to search topics, or ? for shortcuts.', { title: 'Welcome to DevPath ⚡', icon: '⚡', ms: 7000 }), 700);
  }

  // Detect 1v1 battle invite link
  const hash = location.hash;
  if (hash.includes('battle') && hash.includes('room=')) {
    const m = /[?&]room=([^&]+)/.exec(hash);
    if (m && m[1]) {
      setTimeout(() => {
        Battle.joinRoom(m[1]);
        renderBattle();
      }, 300);
    }
  }
}

window.devpath = { store, ui, render, Quiz, QB, Battle };
boot();
