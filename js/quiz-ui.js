'use strict';
/* =========================================================
   DevPath Quiz UI Renderer & Action Wiring
   ========================================================= */

const qzEl = () => document.getElementById('quiz');


/* ----- setup screen ----- */
function qzSetup(s, t) {
  const m = catMeta(t.category), st = Quiz.stats(t.id), lens = Quiz.lengths(t.id), bank = QB.count(t.id);
  const seg = (key, vals, cur, fmt) => `<div class="seg-group" role="group">${vals.map(v => `<button class="seg-btn${cur === v ? ' on' : ''}" data-action="qz-set" data-key="${key}" data-val="${v}">${fmt(v)}</button>`).join('')}</div>`;
  const need = Math.ceil(s.n * PASS_MARK / 100);

  return `<div class="qz-wrap" style="--cat:${m.color}">
    <div class="qz-top">
      <button class="icon-btn" data-action="qz-quit" aria-label="Close">${icon('x', 20)}</button>
      <span class="eyebrow">Knowledge Test Assessment</span>
    </div>
    <div class="card qz-hero">
      <div class="qz-hero-ico">${m.icon}</div>
      <div class="qz-hero-text">
        <span class="tag"><i>${m.icon}</i>${esc(t.category)}</span>
        <h1>${t.num ? `<span class="num">${esc(t.num)}</span>` : ''}${esc(t.name)}</h1>
        <div class="qz-chips">
          <span>${bank} questions in bank</span>
          ${st.attempts ? `<span>Best Score: ${st.best === null ? '—' : st.best + '%'}</span><span>${plural(st.attempts, 'attempt')}</span>` : '<span>First attempt</span>'}
          ${st.passed ? '<span class="ok">Topic Passed ✓</span>' : ''}
        </div>
      </div>
    </div>
    <div class="card qz-form">
      <div class="field">
        <span>Number of Questions</span>
        ${seg('n', lens, s.n, v => v)}
      </div>
      <div class="field">
        <span>Assessment Mode</span>
        <div class="qz-modes">
          <button class="qz-mode${s.mode === 'exam' ? ' on' : ''}" data-action="qz-set" data-key="mode" data-val="exam" aria-pressed="${s.mode === 'exam'}">
            <b>🎯 Exam Mode</b>
            <small>Score 80%+ to complete this topic. Answers revealed at the end. Leaving the tab twice fails the test.</small>
          </button>
          <button class="qz-mode${s.mode === 'practice' ? ' on' : ''}" data-action="qz-set" data-key="mode" data-val="practice" aria-pressed="${s.mode === 'practice'}">
            <b>📘 Practice Mode</b>
            <small>Untimed, relaxed learning. Instant step-by-step explanations after every question.</small>
          </button>
        </div>
      </div>
      <div class="field">
        <span>Timer per Question</span>
        ${seg('secs', [0, 20, 30, 45, 60], s.secs, v => v ? v + 's' : 'Untimed')}
        <small class="muted">Code execution questions automatically get +50% extra thinking time.</small>
      </div>
    </div>
    <div class="card qz-rules">
      <h3>Assessment Guidelines</h3>
      <ul>
        <li>Score <b>${PASS_MARK}% or higher</b> (${need} of ${s.n}) in Exam mode to automatically mark this topic <b>completed</b> and advance your readiness rating.</li>
        <li>Questions are drawn adaptively: problems you previously missed return more frequently until mastered.</li>
        <li>Your test performance and per-question error history are safely preserved across sessions.</li>
      </ul>
    </div>
    <div class="qz-foot">
      <button class="btn primary lg" data-action="qz-start">${icon('play', 16, 'ico-fill')} Begin Assessment <kbd>Enter</kbd></button>
    </div>
  </div>`;
}

/* ----- question screen ----- */
function qzProgress(s) {
  return `<div class="qz-prog" aria-hidden="true">${s.qs.map((q, k) => {
    let c = k === s.cur ? 'cur' : k < s.cur || (k === s.cur && s.phase === 'fb') ? 'done' : '';
    if (s.mode === 'practice' && s.ans[k] !== undefined) c += s.ans[k] === q.a ? ' ok' : ' bad';
    return `<i class="${c}"></i>`;
  }).join('')}</div>`;
}

function qzQuestion(s, t) {
  const q = s.qs[s.cur], m = catMeta(t.category), fb = s.phase === 'fb', ans = s.ans[s.cur], last = s.cur + 1 >= s.n;
  const rem = Quiz.remainingMs(), pct = q.secs ? Math.max(0, rem / (q.secs * 1000) * 100) : 0;
  
  const opts = q.opts.map((o, i) => {
    let c = 'qz-opt';
    if (fb) {
      if (i === q.a) c += ' correct';
      else if (i === ans) c += ' wrong';
      else c += ' dim';
    } else if (s.sel === i) {
      c += ' sel';
    }
    return `<button class="${c}" data-action="qz-pick" data-val="${i}" ${fb ? 'disabled' : ''} aria-pressed="${s.sel === i}">
      <span class="qz-letter">${fb && i === q.a ? icon('check', 15) : LETTERS[i]}</span>
      <span class="qz-otext">${esc(o)}</span>
    </button>`;
  }).join('');

  const verdict = ans === q.a ? ['ok', '✓ Correct!'] : s.timedOut ? ['bad', '⏰ Time Expired'] : ['bad', '✗ Incorrect'];
  const feedback = fb ? `<div class="qz-fb ${verdict[0]}" role="status"><b>${verdict[1]}</b><p>${esc(q.e)}</p></div>` : '';
  
  const footer = fb
    ? `<button class="btn primary lg" data-action="qz-next">${last ? 'See Exam Results' : 'Next Question'} ${icon('arrow', 16)} <kbd>Enter</kbd></button>`
    : s.mode === 'exam'
      ? `<button class="btn primary lg" data-action="qz-confirm" ${s.sel === null ? 'disabled' : ''}>${last ? 'Submit Test' : 'Lock in Answer'} ${icon('arrow', 16)} <kbd>Enter</kbd></button>`
      : `<span class="muted small">Select an answer to see instant explanation.</span>`;

  return `<div class="qz-wrap q${s.mode === 'exam' ? ' exam' : ''}" style="--cat:${m.color}" id="qzMain" tabindex="-1">
    <div class="qz-bar">
      <button class="icon-btn" data-action="qz-quit" aria-label="Quit test">${icon('x', 20)}</button>
      <div class="qz-title">
        <small>${s.mode === 'exam' ? 'Exam Mode' : 'Practice Mode'} · ${esc(t.category)}</small>
        <b>${esc(t.name)}</b>
      </div>
      <div class="qz-count"><b>${s.cur + 1}</b>/${s.n}</div>
      ${q.secs && !fb ? `<div class="qz-time${rem <= 5000 ? ' low' : ''}" id="qzTime">${Math.ceil(rem / 1000)}s</div>` : ''}
    </div>
    ${qzProgress(s)}
    ${q.secs && !fb ? `<div class="qz-timer${pct <= 25 ? ' low' : ''}" id="qzTimer"><i id="qzBar" style="width:${pct}%"></i></div>` : '<div class="qz-timer off"></div>'}
    <div class="qz-card">
      <div class="qz-qnum">Question ${s.cur + 1} of ${s.n}${q.k ? ' · <span class="pill acc sm">Code Output / Analysis</span>' : ''}</div>
      <h2 class="qz-text">${esc(q.q)}</h2>
      ${codeBlock(q.k)}
      <div class="qz-options" role="group" aria-label="Answer options">${opts}</div>
      ${feedback}
    </div>
    <div class="qz-foot">${footer}</div>
  </div>`;
}

/* ----- review & results ----- */
function qzReviewItem(s, q, k) {
  const ans = s.ans[k], ok = ans === q.a;
  return `<article class="qz-rev ${ok ? 'ok' : 'bad'}">
    <header>
      <span class="qz-rev-n">${k + 1}</span>
      <span class="qz-rev-ic">${ok ? icon('check', 15) : icon('x', 15)}</span>
      <h4>${esc(q.q)}</h4>
    </header>
    ${codeBlock(q.k)}
    <ul>
      ${q.opts.map((o, i) => `<li class="${i === q.a ? 'correct' : i === ans ? 'wrong' : ''}">
        <span class="qz-letter sm">${LETTERS[i]}</span>
        <span>${esc(o)}</span>
        ${i === q.a ? '<em>Correct Answer</em>' : i === ans ? '<em>Your Choice</em>' : ''}
      </li>`).join('')}
    </ul>
    ${ans === null || ans === undefined ? '<p class="qz-skip">No answer selected (timeout).</p>' : ''}
    <p class="qz-why"><b>Explanation:</b> ${esc(q.e)}</p>
  </article>`;
}

function qzResult(s, t) {
  const r = s.result, m = catMeta(t.category);
  const state = r.dq ? 'dq' : r.kind === 'retry' ? 'retry' : r.passed ? 'pass' : 'fail';
  const need = Math.ceil(r.n * PASS_MARK / 100), more = Math.max(0, need - r.correct);
  const color = state === 'pass' ? 'var(--success)' : state === 'retry' ? 'var(--primary)' : 'var(--danger)';
  
  const head = {
    pass: 'Passed! Topic Mastered 🎉',
    fail: 'Threshold Not Met',
    dq: 'Assessment Disqualified',
    retry: 'Targeted Review Completed'
  }[state];

  const sub = state === 'pass'
    ? (r.completedNow ? 'Congratulations! This topic has been marked Complete in your roadmap.' : 'Solid score! Your confidence rating has been updated.')
    : state === 'dq' ? 'Tab switches exceeded the proctor threshold. The test was terminated.'
    : state === 'retry' ? 'Great practice session! Retakes help cement memory before the official exam.'
    : `You need ${PASS_MARK}% to pass. You were only ${plural(more, 'correct answer')} away!`;

  const wrongN = s.qs.filter((q, k) => s.ans[k] !== q.a).length;
  const f = s.reviewFilter;
  const items = s.qs.map((q, k) => ({ q, k })).filter(({ q, k }) => f === 'all' || (f === 'wrong' ? s.ans[k] !== q.a : s.ans[k] === q.a));
  const confLine = state === 'pass' && r.confTo !== r.confFrom ? `<span>Readiness Confidence: ${r.confFrom} → ${r.confTo}</span>` : '';

  return `<div class="qz-wrap result ${state}" style="--cat:${m.color}">
    <div class="qz-top">
      <button class="icon-btn" data-action="qz-close" aria-label="Close results">${icon('x', 20)}</button>
      <span class="eyebrow">Assessment Results · ${esc(t.name)}</span>
    </div>
    <div class="card qz-score">
      ${ring({ pct: r.pct, size: 150, stroke: 13, color, label: `<b>${r.pct}%</b>`, sub: `${r.correct} / ${r.n}` })}
      <div class="qz-score-text">
        <h1>${head}</h1>
        <p class="muted">${sub}</p>
        <div class="qz-chips">
          <span>⏱ ${fmtMin(Math.max(1, Math.round(r.secs / 60)))} total time</span>
          <span>~${Math.round(r.secs / r.n)}s / question</span>
          <span>${r.mode === 'exam' ? 'Exam Mode' : 'Practice Mode'}</span>
          ${r.strikes ? `<span class="bad">${plural(r.strikes, 'tab leave penalty')}</span>` : ''}
          ${confLine}
        </div>
      </div>
    </div>
    <div class="qz-actions">
      <button class="btn primary" data-action="qz-retake">${icon('refresh', 15)} Retake Full Test</button>
      ${wrongN ? `<button class="btn" data-action="qz-retry-missed">${icon('target', 15)} Retry ${wrongN} Missed Questions</button>` : ''}
      <button class="btn" data-action="qz-share-card">${icon('download', 15)} Download Certificate Badge</button>
      <button class="btn" data-action="qz-close">Return to Dashboard</button>
    </div>
    ${state !== 'pass' && resLinks(t) ? `<div class="card qz-study"><b>Recommended Prep Materials:</b><div class="row-actions">${resLinks(t)}</div></div>` : ''}
    <div class="section-head">
      <h2>Detailed Question Breakdown</h2>
      <div class="seg-group" role="group">
        ${[['all', 'All (' + r.n + ')'], ['wrong', 'Missed (' + wrongN + ')'], ['ok', 'Correct (' + (r.n - wrongN) + ')']].map(([v, l]) => `<button class="seg-btn${f === v ? ' on' : ''}" data-action="qz-filter" data-val="${v}">${l}</button>`).join('')}
      </div>
    </div>
    <div class="qz-revlist">
      ${items.length ? items.map(({ q, k }) => qzReviewItem(s, q, k)).join('') : '<div class="empty"><div class="empty-emoji">🙌</div><h3>No questions match this filter</h3></div>'}
    </div>
  </div>`;
}

/* ----- anti-cheat warnings ----- */
const qzWarn = () => `<div class="qz-dialog" role="alertdialog" aria-modal="true" aria-labelledby="qzWarnT"><div class="modal sm"><h2 id="qzWarnT">⚠️ Tab Switch Warning</h2><p class="muted">Exam Mode is proctored. Navigating away or leaving this tab again will immediately terminate the test without scoring. Your timer continued running.</p><div class="modal-actions"><button class="btn primary" data-action="qz-warn-ok" autofocus>Resume Assessment</button></div></div></div>`;
const qzQuitDlg = () => `<div class="qz-dialog" role="alertdialog" aria-modal="true" aria-labelledby="qzQuitT"><div class="modal sm"><h2 id="qzQuitT">Quit Test?</h2><p class="muted">Are you sure you want to exit? Your answers and current progress will not be saved.</p><div class="modal-actions"><button class="btn" data-action="qz-quit-yes">Quit</button><button class="btn primary" data-action="qz-quit-no" autofocus>Continue Test</button></div></div></div>`;

let qzLastKey = '';
function renderQuiz() {
  const el = qzEl(), s = Quiz.s;
  if (!s) {
    el.hidden = true;
    el.innerHTML = '';
    document.body.classList.remove('quiz-open');
    document.body.classList.remove('no-scroll');
    qzLastKey = '';
    return;
  }
  const t = store.byId.get(s.topicId) || {
    id: s.topicId,
    name: s.topicId === 'daily' ? 'Daily Cross-Domain Challenge' : 'Weak-Topic Targeted Practice',
    category: s.topicId === 'daily' ? 'Java' : 'Spring Boot',
    num: s.topicId === 'daily' ? 'DAILY' : 'DRILL'
  };
  const fk = el.contains(document.activeElement) ? focusKey(document.activeElement) : null;
  const key = `${s.phase === 'fb' ? 'q' : s.phase}:${s.cur}:${s.phase === 'result' ? 'r' : ''}`;
  const keep = el.scrollTop, newScreen = key !== qzLastKey;
  qzLastKey = key;

  el.hidden = false;
  document.body.classList.add('quiz-open');
  document.body.classList.add('no-scroll');

  const html = s.phase === 'setup' ? qzSetup(s, t) : s.phase === 'result' ? qzResult(s, t) : qzQuestion(s, t);
  el.innerHTML = html + (s.warn ? qzWarn() : '') + (s.confirmQuit ? qzQuitDlg() : '');
  el.scrollTop = newScreen ? 0 : keep;

  if (s.phase === 'result' && !s.celebrated) {
    s.celebrated = true;
    if (s.result.passed) confetti(innerWidth / 2, innerHeight / 3, 140);
  }

  const dlg = $('.qz-dialog [autofocus]', el);
  if (dlg) dlg.focus({ preventScroll: true });
  else if (newScreen) {
    const m = $('#qzMain', el) || $('.qz-wrap', el);
    m && m.setAttribute('tabindex', '-1');
    m && m.focus({ preventScroll: true });
  } else {
    refocus(fk, el);
  }
}

Quiz.onChange = renderQuiz;
Quiz.onTimer = () => {
  const s = Quiz.s; if (!s || s.phase !== 'q') return;
  const q = s.qs[s.cur], rem = Quiz.remainingMs(), pct = Math.max(0, rem / (q.secs * 1000) * 100);
  const bar = document.getElementById('qzBar'), time = document.getElementById('qzTime'), wrap = document.getElementById('qzTimer');
  if (bar) bar.style.width = pct + '%';
  if (time) {
    time.textContent = Math.ceil(rem / 1000) + 's';
    time.classList.toggle('low', rem <= 5000);
  }
  if (wrap) wrap.classList.toggle('low', pct <= 25);
};

/* ----- action handlers ----- */
const QuizActions = {
  'quiz-open': (t, n) => {
    closePanel();
    if (!Quiz.openSetup(n.dataset.id)) {
      return toast('Question bank for this topic is currently being generated.', { title: 'Test Coming Soon', icon: '🧪' });
    }
    renderQuiz();
  },
  'qz-set': (t, n) => { Quiz.setOpt(n.dataset.key, n.dataset.val); renderQuiz(); },
  'qz-start': () => { Quiz.start(); renderQuiz(); },
  'qz-pick': (t, n) => { Quiz.pick(+n.dataset.val); renderQuiz(); },
  'qz-confirm': () => { Quiz.confirm(); renderQuiz(); },
  'qz-next': () => { Quiz.advance(); renderQuiz(); },
  'qz-quit': () => {
    const s = Quiz.s; if (!s) return;
    if (s.phase === 'setup' || s.phase === 'result') { Quiz.quit(); renderQuiz(); }
    else { s.confirmQuit = true; renderQuiz(); }
  },
  'qz-quit-no': () => { if (Quiz.s) { Quiz.s.confirmQuit = false; renderQuiz(); } },
  'qz-quit-yes': () => { Quiz.quit(); renderQuiz(); },
  'qz-close': () => { Quiz.quit(); renderQuiz(); },
  'qz-warn-ok': () => { if (Quiz.s) { Quiz.s.warn = false; renderQuiz(); } },
  'qz-retake': () => {
    const id = Quiz.s.topicId;
    Quiz.quit();
    if (Quiz.openSetup(id)) Quiz.start();
    renderQuiz();
  },
  'qz-retry-missed': () => { Quiz.retryMissed(); renderQuiz(); },
  'qz-filter': (t, n) => { Quiz.s.reviewFilter = n.dataset.val; renderQuiz(); },
  'qz-share-card': () => {
    if (!Quiz.s || !Quiz.s.result) return;
    const topic = store.byId.get(Quiz.s.topicId);
    if (typeof downloadShareCard === 'function') {
      downloadShareCard(Quiz.s.result, topic);
    }
  },
  'download-cert': (t, n) => {
    const idx = +n.dataset.idx;
    const att = store.tests.attempts[idx];
    if (!att) return;
    const topic = store.byId.get(att.topicId);
    if (typeof downloadShareCard === 'function') {
      downloadShareCard(att, topic);
    }
  }
};

/* Keyboard handling during active test */
function QuizKeys(e) {
  const s = Quiz.s; if (!s) return false;
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  const k = e.key, go = fn => { e.preventDefault(); fn(); return true; };
  if (s.warn) return (k === 'Enter' || k === 'Escape') ? go(QuizActions['qz-warn-ok']) : false;
  if (s.confirmQuit) return k === 'Escape' ? go(QuizActions['qz-quit-no']) : false;
  if (k === 'Escape') return go(QuizActions['qz-quit']);
  if (s.phase === 'setup') return k === 'Enter' && !e.target.closest('[data-action]') ? go(QuizActions['qz-start']) : false;
  if (s.phase === 'q') {
    const i = k.length === 1 ? ('1234'.indexOf(k) >= 0 ? +k - 1 : 'abcd'.indexOf(k.toLowerCase())) : -1;
    if (i >= 0 && i < 4) return go(() => QuizActions['qz-pick'](null, { dataset: { val: i } }));
    if (k === 'Enter') {
      const f = document.activeElement;
      if (s.sel === null && f && f.classList && f.classList.contains('qz-opt')) {
        return go(() => QuizActions['qz-pick'](null, { dataset: { val: f.dataset.val } }));
      }
      return go(QuizActions['qz-confirm']);
    }
  }
  if (s.phase === 'fb' && (k === 'Enter' || k === 'ArrowRight')) return go(QuizActions['qz-next']);
  return false;
}

document.addEventListener('visibilitychange', () => {
  const s = Quiz.s; if (!s) return;
  if (document.hidden) { Quiz.onHidden(); }
  else { if (s.phase === 'q') Quiz.onTick(); renderQuiz(); }
});

window.addEventListener('blur', () => {
  const s = Quiz.s; if (!s) return;
  if (s.mode === 'exam' && (s.phase === 'q' || s.phase === 'fb')) {
    Quiz.onHidden();
    renderQuiz();
  }
});

['contextmenu', 'copy', 'cut', 'selectstart', 'dragstart'].forEach(ev => {
  document.addEventListener(ev, e => {
    if (Quiz.s && Quiz.s.mode === 'exam' && Quiz.s.phase !== 'result' && Quiz.s.phase !== 'setup') {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      e.preventDefault();
    }
  });
});
