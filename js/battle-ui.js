'use strict';
/* =========================================================
   DevPath 1v1 Battle Arena UI Renderer & Action Wiring
   ========================================================= */

const btlEl = () => document.getElementById('quiz'); // reuses full-screen modal layer

function btlLobby(s) {
  const t = store.byId.get(s.topicId) || { name: 'Java OOPs', category: 'Java' };
  const m = catMeta(t.category);
  const inviteUrl = window.location.origin + window.location.pathname + '#/battle?room=' + (Battle.room || '');
  const topicOptions = store.topics.filter(tp => QB.has(tp.id)).map(tp => `<option value="${tp.id}"${tp.id === s.topicId ? ' selected' : ''}>${catMeta(tp.category).icon} ${esc(tp.name)}</option>`).join('');
  const code = Battle.shortCode();

  return `<div class="battle-wrap" style="--cat:${m.color}">
    <div class="qz-top">
      <button class="icon-btn" data-action="battle-exit" aria-label="Exit Arena">${icon('x', 20)}</button>
      <span class="eyebrow">1v1 Peer-to-Peer Duel Arena</span>
    </div>
    
    <div class="lobby-card">
      <div class="lobby-head">
        <div class="lobby-ico">⚔️</div>
        <div>
          <h2>Technical Interview 1v1 Duel</h2>
          <p class="muted">Live head-to-head competition with synchronized timers and speed scoring. Leaving the tab forfeits the match.</p>
        </div>
      </div>

      <div class="lobby-players">
        <div class="player-box">
          <div class="player-avatar">${s.local.avatar}</div>
          <span class="player-name">${esc(s.local.name)} (You)</span>
          <span class="player-status ${s.local.ready ? 'ready' : ''}">${s.local.ready ? 'READY ✓' : 'NOT READY'}</span>
        </div>

        <div class="versus-badge">VS</div>

        <div class="player-box">
          <div class="player-avatar opponent">${s.remote.avatar}</div>
          <span class="player-name">${esc(s.remote.name)}</span>
          <span class="player-status ${s.remote.ready ? 'ready' : ''}">${s.remote.ready ? 'READY ✓' : 'WAITING'}</span>
        </div>
      </div>

      ${Battle.isHost && !Battle.isBot ? `<div class="room-sync-panel">
        <div class="room-code-badge">
          <span class="rc-label">ROOM SYNC CODE</span>
          <div class="rc-display">
            <span class="rc-code">${esc(code)}</span>
            <button class="btn sm" data-action="battle-copy-code">${icon('download', 14)} Copy Code</button>
            <button class="btn sm primary" data-action="battle-copy">${icon('link', 14)} Copy Link</button>
          </div>
        </div>
        <div class="invite-box" style="margin-top:6px;">
          <input type="text" readonly value="${esc(inviteUrl)}" id="inviteLinkInput">
        </div>
        <small class="muted">Your friend can enter the 6-character code above or open the direct link on any phone or desktop.</small>

        <div class="join-box" style="margin-top:10px;">
          <span>Joining a friend's room instead?</span>
          <div class="join-row">
            <input type="text" id="lobbyJoinCodeInput" placeholder="Enter friend's code (e.g. 9X7K2B) or link" autocomplete="off" spellcheck="false">
            <button class="btn" data-action="battle-join-from-lobby">Join Room</button>
          </div>
        </div>
      </div>` : ''}

      ${!Battle.isHost && !Battle.isBot ? `<div class="room-connected-banner">
        <div>
          <span style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;opacity:0.8;display:block;">CONNECTED TO ROOM</span>
          <b style="font-size:1.15rem;letter-spacing:0.08em;">${esc(code)}</b>
        </div>
        <button class="btn sm ghost" data-action="battle-switch-room">Leave / Switch Room</button>
      </div>` : ''}

      ${Battle.isHost ? `<div class="set-grid">
        <label class="field">
          <span>Topic / Domain</span>
          <select data-change="battle-topic" ${Battle.active() ? 'disabled' : ''}>${topicOptions}</select>
        </label>
        <div class="field">
          <span>Match Questions</span>
          <div class="seg-group" role="group">
            ${[5, 10, 15].map(cnt => `<button class="seg-btn${s.n === cnt ? ' on' : ''}" data-action="battle-set-n" data-val="${cnt}">${cnt} Qs</button>`).join('')}
          </div>
        </div>
      </div>` : `<p class="muted small">Host is configuring topic: <b>${esc(t.name)}</b> (${s.n} questions, ${s.secs}s per question).</p>`}

      <div class="modal-actions" style="justify-content:center;margin-top:10px;">
        <button class="btn lg ${s.local.ready ? 'success' : 'primary'}" data-action="battle-ready">
          ${s.local.ready ? '✓ Locked In (Waiting for Opponent)' : '⚔️ Click when Ready'}
        </button>
        ${!Battle.isBot ? `<button class="btn lg ghost" data-action="battle-bot-switch">Practice vs DevBot (AI) Instead</button>` : ''}
      </div>
    </div>
  </div>`;
}

function btlCountdown(s) {
  return `<div class="countdown-overlay">
    <div class="countdown-number">${s.countdown || 3}</div>
    <h2 style="color:#fff;margin-top:16px;">DUEL STARTING!</h2>
    <p class="muted">Eyes on the screen · Do not switch tabs!</p>
  </div>`;
}

function btlArena(s) {
  const q = s.qs[s.cur];
  const t = store.byId.get(s.topicId) || { name: 'Technical Duel', category: 'General' };
  const m = catMeta(t.category);
  const rem = Math.max(0, Math.ceil((s.deadline - Date.now()) / 1000));
  const localProg = Math.round(((s.cur) / s.qs.length) * 100);
  const remoteAnswered = s.remote.answers.filter(x => x !== undefined).length;
  const remoteProg = Math.round((remoteAnswered / s.qs.length) * 100);

  const opts = q.opts.map((o, i) => {
    let c = 'qz-opt';
    if (s.sel === i) c += ' sel';
    return `<button class="${c}" data-action="battle-pick" data-val="${i}" ${s.sel !== null ? 'disabled' : ''}>
      <span class="qz-letter">${LETTERS[i]}</span>
      <span class="qz-otext">${esc(o)}</span>
    </button>`;
  }).join('');

  return `<div class="battle-wrap" style="--cat:${m.color}">
    <!-- Live Arena HUD -->
    <div class="battle-hud">
      <div class="hud-player">
        <span class="player-avatar" style="width:42px;height:42px;font-size:1.3rem;">${s.local.avatar}</span>
        <div class="hud-info">
          <b>${esc(s.local.name)}</b>
          <div class="hud-score">${s.local.score.toLocaleString()} <small style="font-size:0.75rem;color:var(--muted)">pts</small></div>
          <div class="hud-prog-bar"><i style="width:${localProg}%"></i></div>
        </div>
      </div>

      <div class="hud-center">
        <div class="battle-timer ${rem <= 5 ? 'danger' : ''}" id="btlTimer">${rem}s</div>
        <small class="muted">Q ${s.cur + 1}/${s.qs.length}</small>
      </div>

      <div class="hud-player right">
        <span class="player-avatar opponent" style="width:42px;height:42px;font-size:1.3rem;">${s.remote.avatar}</span>
        <div class="hud-info">
          <b>${esc(s.remote.name)}</b>
          <div class="hud-score">${s.remote.score.toLocaleString()} <small style="font-size:0.75rem;color:var(--muted)">pts</small></div>
          <div class="hud-prog-bar"><i style="width:${remoteProg}%"></i></div>
        </div>
      </div>
    </div>

    <!-- Active Question Card -->
    <div class="card qz-card">
      <div class="qz-qnum">Speed Scoring: +1,000 to +2,000 pts per correct answer</div>
      <h2 class="qz-text">${esc(q.q)}</h2>
      ${codeBlock(q.k)}
      <div class="qz-options">${opts}</div>
      ${s.sel !== null ? `<div class="qz-fb ok"><small>Answer recorded! Waiting for clock or opponent…</small></div>` : ''}
    </div>

    <div class="qz-foot" style="min-height:48px;">
      <span class="muted small">⚠️ Note: Switching or minimizing this tab immediately forfeits the match.</span>
    </div>
  </div>`;
}

function btlPodium(s) {
  const isWinner = s.winner === 'local';
  const isTie = s.winner === 'tie';
  const localCorrect = s.local.answers.filter(a => a && a.isCorrect).length;
  const remoteCorrect = s.remote.answers.filter(Boolean).length;

  return `<div class="battle-wrap">
    <div class="qz-top">
      <button class="icon-btn" data-action="battle-exit" aria-label="Exit Arena">${icon('x', 20)}</button>
      <span class="eyebrow">Match Conclusion</span>
    </div>

    <div class="podium-card">
      <div class="podium-crown">${isWinner ? '👑' : isTie ? '🤝' : '🥈'}</div>
      <h1 class="podium-winner-name">
        ${isWinner ? `${esc(s.local.name)} Wins! 🏆` : isTie ? 'Honorary Tie!' : `${esc(s.remote.name)} Takes the Match!`}
      </h1>
      <p class="muted">
        ${s.forfeitReason ? esc(s.forfeitReason) : 'Both engineers fought hard across technical interview questions.'}
      </p>

      <div class="duel-stats-grid">
        <div class="duel-stat-box ${isWinner ? 'winner' : ''}">
          <span class="muted small">${esc(s.local.name)} (You)</span>
          <b style="font-size:1.8rem;color:var(--primary-text);">${s.local.score.toLocaleString()} pts</b>
          <span>Accuracy: <b>${Math.round((localCorrect / Math.max(1, s.qs.length)) * 100)}%</b> (${localCorrect}/${s.qs.length})</span>
        </div>

        <div class="duel-stat-box ${!isWinner && !isTie ? 'winner' : ''}">
          <span class="muted small">${esc(s.remote.name)}</span>
          <b style="font-size:1.8rem;color:#f472b6;">${s.remote.score.toLocaleString()} pts</b>
          <span>Accuracy: <b>${Math.round((remoteCorrect / Math.max(1, s.qs.length)) * 100)}%</b> (${remoteCorrect}/${s.qs.length})</span>
        </div>
      </div>

      <div class="modal-actions" style="justify-content:center;">
        <button class="btn primary lg" data-action="battle-rematch">⚔️ Play Rematch</button>
        <button class="btn lg" data-action="battle-exit">Return to Dashboard</button>
      </div>

      <!-- Question breakdown -->
      <div class="section-head" style="margin-top:20px;text-align:left;">
        <h3>Question Breakdown</h3>
      </div>
      <div style="overflow-x:auto;width:100%;-webkit-overflow-scrolling:touch;">
        <table class="duel-breakdown-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Question</th>
              <th>Your Outcome</th>
              <th>Opponent</th>
            </tr>
          </thead>
          <tbody>
            ${s.qs.map((q, idx) => {
              const locAns = s.local.answers[idx];
              const locOk = locAns && locAns.isCorrect;
              const remOk = s.remote.answers[idx];
              return `<tr>
                <td><b>${idx + 1}</b></td>
                <td>${esc(q.q.length > 50 ? q.q.slice(0, 48) + '…' : q.q)}</td>
                <td><span class="pill ${locOk ? 'ok' : 'warn'} sm">${locOk ? '✓ Correct (' + locAns.pts + ')' : '✗ Missed'}</span></td>
                <td><span class="pill ${remOk ? 'ok' : 'warn'} sm">${remOk ? '✓ Correct' : '✗ Missed'}</span></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function renderBattle() {
  const el = btlEl(), s = Battle.s;
  if (s.phase === 'idle') {
    el.hidden = true;
    el.innerHTML = '';
    document.body.classList.remove('quiz-open');
    document.body.classList.remove('no-scroll');
    return;
  }

  el.hidden = false;
  document.body.classList.add('quiz-open');
  document.body.classList.add('no-scroll');

  let html = '';
  if (s.phase === 'lobby') html = btlLobby(s);
  else if (s.phase === 'countdown') html = btlCountdown(s);
  else if (s.phase === 'battle') html = btlArena(s);
  else if (s.phase === 'result' || s.phase === 'forfeited') html = btlPodium(s);

  el.innerHTML = html;
}

Battle.onChange = renderBattle;
Battle.onTimer = () => {
  const t = document.getElementById('btlTimer');
  if (t && Battle.s && Battle.s.phase === 'battle') {
    const rem = Math.max(0, Math.ceil((Battle.s.deadline - Date.now()) / 1000));
    t.textContent = rem + 's';
    t.classList.toggle('danger', rem <= 5);
  }
};

function openJoinBattleModal() {
  if (typeof openModal !== 'function') return;
  openModal(`
    <button class="icon-btn modal-close" data-action="close-modal" aria-label="Close">${icon('x', 20)}</button>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
      <div class="lobby-ico" style="width:44px;height:44px;font-size:1.3rem;">⚔️</div>
      <div>
        <h2 style="margin:0;">Join 1v1 Battle Arena</h2>
        <p class="muted small" style="margin:0;">Enter room code or paste challenger's invite link</p>
      </div>
    </div>
    <div class="field" style="margin:16px 0;">
      <span>Room Sync Code or Invite Link</span>
      <input type="text" id="joinModalCodeInput" placeholder="e.g. 9X7K2B or paste link" autocomplete="off" spellcheck="false" autofocus>
      <small class="muted">Enter the 6-character room code shared by the host to connect.</small>
    </div>
    <div class="modal-actions">
      <button class="btn" data-action="close-modal">Cancel</button>
      <button class="btn primary" data-action="battle-join-submit">${icon('swords', 15)} Connect to Arena</button>
    </div>
  `, 'sm');
}

/* ----- Action Handlers for Battle ----- */
const BattleActions = {
  'battle-open': (t, n) => {
    closePanel();
    const topicId = (n && n.dataset && n.dataset.id) || 'ja1';
    Battle.createRoom(topicId);
    renderBattle();
  },
  'battle-join-modal': () => {
    closePanel();
    openJoinBattleModal();
  },
  'battle-join-submit': () => {
    const input = document.getElementById('joinModalCodeInput');
    const raw = input ? input.value : '';
    const clean = Battle.parseCode(raw);
    if (!clean) {
      return toast('Please enter a valid 6-character room code or invite link.', { title: 'Invalid Code', icon: '⚠️', kind: 'bad' });
    }
    closeModal();
    toast(`Connecting to room ${clean.replace('devpath-', '').toUpperCase()}...`, { title: 'Syncing Room ⚡', icon: '⚡' });
    Battle.joinRoom(clean);
    renderBattle();
  },
  'battle-join-from-lobby': () => {
    const input = document.getElementById('lobbyJoinCodeInput');
    const raw = input ? input.value : '';
    const clean = Battle.parseCode(raw);
    if (!clean) {
      return toast('Please enter a valid 6-character room code or invite link.', { title: 'Invalid Code', icon: '⚠️', kind: 'bad' });
    }
    toast(`Connecting to room ${clean.replace('devpath-', '').toUpperCase()}...`, { title: 'Syncing Room ⚡', icon: '⚡' });
    Battle.joinRoom(clean);
    renderBattle();
  },
  'battle-switch-room': () => {
    Battle.exit();
    Battle.createRoom('ja1');
    renderBattle();
  },
  'battle-bot': (t, n) => {
    closePanel();
    const topicId = (n && n.dataset && n.dataset.id) || 'ja1';
    Battle.startVsBot(topicId);
    renderBattle();
  },
  'battle-bot-switch': () => {
    Battle.startVsBot(Battle.s.topicId);
    renderBattle();
  },
  'battle-ready': () => {
    Battle.toggleReady();
    renderBattle();
  },
  'battle-set-n': (t, n) => {
    Battle.s.n = +n.dataset.val;
    if (!Battle.isBot) Battle.send({ type: 'CONFIG', topicId: Battle.s.topicId, n: Battle.s.n, secs: Battle.s.secs });
    renderBattle();
  },
  'battle-pick': (t, n) => {
    Battle.submitAnswer(+n.dataset.val);
    renderBattle();
  },
  'battle-copy-code': () => {
    const code = Battle.shortCode();
    if (code) {
      navigator.clipboard?.writeText(code);
      toast(`Room Code ${code} copied to clipboard!`, { title: 'Room Code Copied 📋', icon: '📋' });
    }
  },
  'battle-copy': () => {
    const input = document.getElementById('inviteLinkInput');
    if (input) {
      input.select();
      navigator.clipboard?.writeText(input.value);
      toast('Share this link with your challenger to connect!', { title: 'Invite Link Copied 📋', icon: '📋' });
    }
  },
  'battle-rematch': () => {
    Battle.s.phase = 'lobby';
    Battle.s.local.ready = false;
    Battle.s.remote.ready = false;
    if (!Battle.isBot) Battle.send({ type: 'REMATCH_REQ' });
    renderBattle();
  },
  'battle-exit': () => {
    Battle.exit();
    renderBattle();
  }
};

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (e.target && e.target.id === 'lobbyJoinCodeInput') {
      e.preventDefault();
      BattleActions['battle-join-from-lobby']();
    } else if (e.target && e.target.id === 'joinModalCodeInput') {
      e.preventDefault();
      BattleActions['battle-join-submit']();
    }
  }
});

document.addEventListener('change', e => {
  if (e.target.dataset.change === 'battle-topic') {
    Battle.s.topicId = e.target.value;
    if (!Battle.isBot) Battle.send({ type: 'CONFIG', topicId: Battle.s.topicId, n: Battle.s.n, secs: Battle.s.secs });
    renderBattle();
  }
});

/* Tab visibility forfeit check */
document.addEventListener('visibilitychange', () => {
  if (document.hidden && Battle.active()) {
    Battle.onTabHidden();
  }
});
