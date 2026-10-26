'use strict';
/* =========================================================
   DevPath 1v1 Peer-to-Peer Battle Engine (WebRTC DataChannel)
   Enhanced with Multi-STUN, Auto-Retry, Heartbeat, and Synced Results
   ========================================================= */

const PEER_CONFIG = {
  debug: 0,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' },
      { urls: 'stun:stun.cloudflare.com:3478' }
    ],
    iceCandidatePoolSize: 10
  }
};

const Battle = {
  peer: null,
  conn: null,
  isHost: false,
  isBot: false,
  room: null,
  tick: null,
  botTimer: null,
  heartbeatTimer: null,
  missedPings: 0,
  outbox: [],
  joinAttempts: 0,
  joinMaxAttempts: 3,

  s: {
    phase: 'idle', // 'idle' | 'lobby' | 'countdown' | 'battle' | 'waiting_opponent' | 'result' | 'forfeited'
    topicId: 'ja1',
    n: 10,
    secs: 20,
    qs: [],
    cur: 0,
    sel: null,
    deadline: 0,
    qStart: 0,
    winner: null,
    forfeitReason: '',
    local: {
      name: 'Player',
      avatar: '⚡',
      ready: false,
      score: 0,
      streak: 0,
      maxStreak: 0,
      answers: [],
      done: false
    },
    remote: {
      name: 'Waiting...',
      avatar: '👤',
      ready: false,
      score: 0,
      streak: 0,
      maxStreak: 0,
      answers: [],
      done: false
    }
  },

  active() {
    return this.s.phase === 'countdown' || this.s.phase === 'battle' || this.s.phase === 'waiting_opponent';
  },

  /* ----- Initialization & Networking ----- */
  init() {
    this.s.local.name = (store && store.settings && store.settings.name ? store.settings.name : 'Engineer_' + Math.floor(100 + Math.random() * 900)).trim();
    this.s.local.avatar = ['⚡', '🚀', '☕', '🍃', '🔥', '💎', '🎯', '🦁'][Math.floor(Math.random() * 8)];
    this.s.local.score = 0;
    this.s.local.streak = 0;
    this.s.local.maxStreak = 0;
    this.s.local.answers = [];
    this.s.local.done = false;
    this.s.remote.score = 0;
    this.s.remote.streak = 0;
    this.s.remote.maxStreak = 0;
    this.s.remote.answers = [];
    this.s.remote.done = false;
    this.s.winner = null;
    this.s.forfeitReason = '';
    this.outbox = [];
    this.missedPings = 0;
  },

  createRoom(topicId = 'ja1') {
    this.init();
    this.isHost = true;
    this.isBot = false;
    this.s.topicId = topicId;
    this.s.phase = 'lobby';
    this.s.local.ready = false;
    this.s.remote = { name: 'Awaiting Challenger...', avatar: '⏳', ready: false, score: 0, streak: 0, maxStreak: 0, answers: [], done: false };
    
    // Generate clean 6-character room code with high entropy
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const roomId = 'devpath-' + code.toLowerCase();
    this.room = roomId;
    this.setupPeer(roomId);
    return roomId;
  },

  parseCode(raw) {
    if (!raw) return '';
    let str = String(raw).trim();
    const urlMatch = /[?&]room=([a-zA-Z0-9_-]+)/.exec(str);
    if (urlMatch && urlMatch[1]) str = urlMatch[1];
    str = str.replace(/^https?:\/\/[^\/]+/i, '').replace(/^[#/]+/, '');
    if (!str.toLowerCase().startsWith('devpath-') && /^[a-zA-Z0-9]{4,12}$/.test(str)) {
      str = 'devpath-' + str;
    }
    return str.toLowerCase();
  },

  shortCode() {
    return (this.room || '').replace(/^devpath-/, '').toUpperCase();
  },

  joinRoom(roomId) {
    const cleanId = this.parseCode(roomId);
    this.init();
    this.isHost = false;
    this.isBot = false;
    this.room = cleanId;
    this.s.phase = 'lobby';
    this.s.local.ready = false;
    this.s.remote = { name: 'Connecting to Host...', avatar: '⏳', ready: false, score: 0, streak: 0, maxStreak: 0, answers: [], done: false };
    this.joinAttempts = 1;
    this.setupPeer(null, cleanId);
  },

  startVsBot(topicId = 'ja1') {
    this.init();
    this.isHost = true;
    this.isBot = true;
    this.room = 'SOLO_VS_BOT';
    this.s.topicId = topicId;
    this.s.phase = 'lobby';
    this.s.local.ready = false;
    this.s.remote = { name: 'DevBot (AI)', avatar: '🤖', ready: true, score: 0, streak: 0, maxStreak: 0, answers: [], done: false };
    this.onChange && this.onChange();
  },

  setupPeer(customId, connectToId = null) {
    if (typeof Peer === 'undefined') {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('PeerJS library not detected.');
      }
      return;
    }

    try {
      this.cleanup();

      // Instantiate Peer with multi-STUN server configuration
      this.peer = customId ? new Peer(customId, PEER_CONFIG) : new Peer(PEER_CONFIG);

      this.peer.on('open', id => {
        if (this.isHost) {
          this.room = id;
        } else if (connectToId) {
          this.room = connectToId;
          this.connectToPeer(connectToId);
        }
        this.onChange && this.onChange();
      });

      this.peer.on('connection', c => {
        this.setupConn(c);
      });

      this.peer.on('error', err => {
        if (typeof console !== 'undefined' && console.error) console.error('PeerJS error:', err);
        
        // Handle peer-unavailable with retry for challenger
        if (err.type === 'peer-unavailable' && !this.isHost && connectToId && this.joinAttempts < this.joinMaxAttempts) {
          this.joinAttempts++;
          toast(`Host room waking up, reconnecting (${this.joinAttempts}/${this.joinMaxAttempts})…`, { title: 'Connecting…', icon: '⏳', ms: 2000 });
          setTimeout(() => {
            if (this.peer && !this.peer.destroyed) {
              this.connectToPeer(connectToId);
            }
          }, 1400);
          return;
        }

        let msg = 'P2P network notice: ' + err.type;
        if (err.type === 'peer-unavailable') {
          msg = 'Room not found. Please double-check the code or verify host has the room open.';
        } else if (err.type === 'unavailable-id') {
          msg = 'Room code was recently used. Generating fresh code…';
          if (this.isHost) setTimeout(() => this.createRoom(this.s.topicId), 400);
          return;
        }
        toast(msg, { title: '1v1 Arena Network', icon: '⚠️', kind: 'bad', ms: 4000 });
        this.onChange && this.onChange();
      });
    } catch (e) {
      if (typeof console !== 'undefined' && console.error) console.error('WebRTC initialization failed:', e);
    }
  },

  connectToPeer(targetId) {
    if (!this.peer || this.peer.destroyed) return;
    try {
      const c = this.peer.connect(targetId, {
        reliable: true,
        serialization: 'json'
      });
      this.setupConn(c);
    } catch (e) {
      console.warn('Peer connect attempt:', e);
    }
  },

  setupConn(c) {
    if (!c) return;
    this.conn = c;

    this.conn.on('open', () => {
      this.missedPings = 0;
      this.startHeartbeat();

      // Flush queued messages
      while (this.outbox.length) {
        const item = this.outbox.shift();
        try { this.conn.send(item); } catch(e){}
      }

      // Initiate handshake
      this.send({
        type: 'HELLO',
        name: this.s.local.name,
        avatar: this.s.local.avatar
      });

      this.onChange && this.onChange();
    });

    this.conn.on('data', data => {
      this.onMessage(data);
    });

    this.conn.on('close', () => {
      this.stopHeartbeat();
      if (this.active()) {
        this.forfeit('remote_disconnected');
      } else {
        toast('Challenger disconnected from room.', { title: 'Peer Left', icon: '🚪' });
        this.s.remote.ready = false;
        this.s.remote.name = 'Challenger disconnected';
        this.onChange && this.onChange();
      }
    });

    this.conn.on('error', err => {
      console.warn('DataChannel error:', err);
    });
  },

  send(msg) {
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(msg);
      } catch (e) {
        this.outbox.push(msg);
      }
    } else {
      this.outbox.push(msg);
    }
  },

  /* ----- Heartbeat & Channel Keepalive ----- */
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.conn && this.conn.open) {
        this.send({ type: 'PING' });
        this.missedPings++;
        if (this.missedPings > 5 && this.active()) {
          this.forfeit('remote_disconnected');
        }
      }
    }, 3500);
  },

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  },

  /* ----- Message Protocol Dispatcher ----- */
  onMessage(msg) {
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case 'PING':
        this.send({ type: 'PONG' });
        break;

      case 'PONG':
        this.missedPings = 0;
        break;

      case 'HELLO':
        this.s.remote.name = msg.name || 'Opponent';
        this.s.remote.avatar = msg.avatar || '👤';
        this.missedPings = 0;
        if (this.isHost) {
          this.send({
            type: 'HELLO_ACK',
            name: this.s.local.name,
            avatar: this.s.local.avatar,
            topicId: this.s.topicId,
            n: this.s.n,
            secs: this.s.secs
          });
          toast(`${this.s.remote.name} connected to your room!`, { title: 'Challenger Joined ⚡', icon: '🤝' });
        }
        break;

      case 'HELLO_ACK':
        this.s.remote.name = msg.name || 'Opponent';
        this.s.remote.avatar = msg.avatar || '👤';
        this.s.topicId = msg.topicId || this.s.topicId;
        this.s.n = msg.n || this.s.n;
        this.s.secs = msg.secs || this.s.secs;
        this.missedPings = 0;
        this.send({
          type: 'HELLO_CONFIRM',
          name: this.s.local.name,
          avatar: this.s.local.avatar
        });
        toast(`Connected to Host: ${this.s.remote.name}!`, { title: 'Room Synced ⚡', icon: '🤝' });
        break;

      case 'HELLO_CONFIRM':
        this.s.remote.name = msg.name || this.s.remote.name;
        this.s.remote.avatar = msg.avatar || this.s.remote.avatar;
        this.missedPings = 0;
        break;

      case 'CONFIG':
        this.s.topicId = msg.topicId;
        this.s.n = msg.n;
        this.s.secs = msg.secs;
        break;

      case 'READY':
        this.s.remote.ready = !!msg.ready;
        if (this.isHost && this.s.local.ready && this.s.remote.ready) {
          this.launchCountdown();
        }
        break;

      case 'START_COUNTDOWN':
        this.s.qs = msg.qs;
        this.s.n = msg.qs.length;
        this.s.secs = msg.secs;
        this.beginCountdown();
        break;

      case 'PROGRESS':
        this.s.remote.score = msg.score;
        this.s.remote.answers[msg.qIndex] = { isCorrect: !!msg.correct, pts: msg.pts || 0, timeUsed: msg.timeUsed || 0 };
        this.s.remote.done = !!msg.done;
        if (this.s.remote.done) {
          this.checkMatchCompletion();
        }
        break;

      case 'FINISH':
        this.s.remote.score = msg.score;
        this.s.remote.done = true;
        this.s.remote.maxStreak = msg.maxStreak || 0;
        if (Array.isArray(msg.answers) && msg.answers.length) {
          this.s.remote.answers = msg.answers;
        }
        this.checkMatchCompletion();
        break;

      case 'FORFEIT':
        this.s.forfeitReason = msg.reason === 'tab_hidden' ? 'Opponent left the browser tab!' : 'Opponent disconnected.';
        this.s.winner = 'local';
        this.s.phase = 'forfeited';
        this.stopTicker();
        toast('Opponent disqualified for tab switching. Victory awarded!', { title: 'Match Forfeited 🏆', icon: '🏆' });
        break;

      case 'REMATCH_REQ':
        toast(this.s.remote.name + ' requested a rematch!', { title: 'Rematch Request ⚡', icon: '⚔️' });
        this.s.remote.ready = true;
        break;
    }
    this.onChange && this.onChange();
  },

  /* ----- Match Flow & Countdown ----- */
  toggleReady() {
    this.s.local.ready = !this.s.local.ready;
    if (this.isBot) {
      if (this.s.local.ready) this.launchCountdown();
    } else {
      this.send({ type: 'READY', ready: this.s.local.ready });
      if (this.isHost && this.s.local.ready && this.s.remote.ready) {
        this.launchCountdown();
      }
    }
    this.onChange && this.onChange();
  },

  launchCountdown() {
    // Host generates the exact identical question set
    const bank = QB.get(this.s.topicId);
    const n = Math.min(this.s.n, bank.length);
    const qs = drawQuestions(this.s.topicId, n).map((qIdx, idx) => {
      const src = bank[qIdx];
      const order = shuffle([0, 1, 2, 3]);
      return {
        idx,
        q: src.q,
        k: src.k,
        opts: order.map(o => src.opts[o]),
        a: order.indexOf(src.a),
        exp: src.exp
      };
    });

    this.s.qs = qs;
    if (!this.isBot) {
      this.send({
        type: 'START_COUNTDOWN',
        qs,
        secs: this.s.secs
      });
    }
    this.beginCountdown();
  },

  beginCountdown() {
    this.s.phase = 'countdown';
    this.s.countdown = 3;

    const iv = setInterval(() => {
      this.s.countdown--;
      if (this.s.countdown <= 0) {
        clearInterval(iv);
        this.startBattle();
      }
      this.onChange && this.onChange();
    }, 1000);
    this.onChange && this.onChange();
  },

  startBattle() {
    this.s.phase = 'battle';
    this.s.cur = 0;
    this.s.local.score = 0;
    this.s.local.streak = 0;
    this.s.local.maxStreak = 0;
    this.s.local.answers = [];
    this.s.local.done = false;
    this.s.remote.score = 0;
    this.s.remote.streak = 0;
    this.s.remote.maxStreak = 0;
    this.s.remote.answers = [];
    this.s.remote.done = false;
    this.beginQ();
    if (this.isBot) this.scheduleBotAnswers();
  },

  beginQ() {
    this.stopTicker();
    const q = this.s.qs[this.s.cur];
    this.s.sel = null;
    this.s.qStart = Date.now();
    const qDuration = (this.s.secs * (q && q.k ? 1.5 : 1)) * 1000;
    this.s.deadline = Date.now() + qDuration;
    
    this.tick = setInterval(() => {
      const rem = Math.max(0, this.s.deadline - Date.now());
      if (rem <= 0) {
        this.submitAnswer(null); // Timeout -> 0 points
      }
      this.onTimer && this.onTimer();
    }, 100);
    this.onChange && this.onChange();
  },

  stopTicker() {
    if (this.tick) {
      clearInterval(this.tick);
      this.tick = null;
    }
  },

  submitAnswer(sel) {
    if (this.s.phase !== 'battle') return;
    this.stopTicker();
    
    const q = this.s.qs[this.s.cur];
    const isCorrect = sel !== null && sel === q.a;
    const timeUsed = Date.now() - this.s.qStart;
    const totalTime = (this.s.deadline - this.s.qStart);
    const timeRemaining = Math.max(0, this.s.deadline - Date.now());

    let pts = 0;
    if (isCorrect) {
      // Points = 1000 Base + Speed Bonus up to 1000 * streak multiplier
      const speedBonus = Math.round(1000 * (timeRemaining / Math.max(1000, totalTime)));
      this.s.local.streak++;
      if (this.s.local.streak > this.s.local.maxStreak) {
        this.s.local.maxStreak = this.s.local.streak;
      }
      const multiplier = Math.min(1.5, 1.0 + (this.s.local.streak - 1) * 0.1);
      pts = Math.round((1000 + speedBonus) * multiplier);
    } else {
      this.s.local.streak = 0;
    }

    this.s.local.score += pts;
    this.s.local.answers[this.s.cur] = { sel, isCorrect, pts, timeUsed };

    const isLast = (this.s.cur + 1 >= this.s.qs.length);

    // Broadcast live progress
    this.send({
      type: 'PROGRESS',
      qIndex: this.s.cur,
      score: this.s.local.score,
      correct: isCorrect,
      pts,
      timeUsed,
      done: isLast
    });

    if (!isLast) {
      this.s.cur++;
      this.beginQ();
    } else {
      this.s.local.done = true;
      // Send final full answers payload
      this.send({
        type: 'FINISH',
        score: this.s.local.score,
        maxStreak: this.s.local.maxStreak,
        answers: this.s.local.answers
      });

      if (this.s.remote.done) {
        this.finishMatch();
      } else {
        // Player enters waiting room with live opponent tracker
        this.s.phase = 'waiting_opponent';
      }
    }
    this.onChange && this.onChange();
  },

  /* ----- AI Bot Simulation ----- */
  scheduleBotAnswers() {
    clearTimeout(this.botTimer);
    let botQ = 0;
    const runNextBotAnswer = () => {
      if (botQ >= this.s.qs.length || !this.active()) return;
      const delay = 3500 + Math.random() * 6000;
      this.botTimer = setTimeout(() => {
        const isCorrect = Math.random() < 0.80; // 80% accuracy
        const speedBonus = Math.round(900 * Math.random());
        const pts = isCorrect ? (1000 + speedBonus) : 0;
        this.s.remote.score += pts;
        this.s.remote.answers[botQ] = { isCorrect, pts, timeUsed: Math.round(delay) };
        botQ++;
        if (botQ >= this.s.qs.length) {
          this.s.remote.done = true;
          this.checkMatchCompletion();
        } else {
          runNextBotAnswer();
        }
        this.onChange && this.onChange();
      }, delay);
    };
    runNextBotAnswer();
  },

  /* ----- Anti-Cheat Tab Monitor ----- */
  onTabHidden() {
    if (this.active()) {
      this.send({ type: 'FORFEIT', reason: 'tab_hidden' });
      this.s.forfeitReason = 'You switched tabs! The duel was forfeited.';
      this.s.winner = 'remote';
      this.s.phase = 'forfeited';
      this.stopTicker();
      clearTimeout(this.botTimer);
      this.onChange && this.onChange();
    }
  },

  forfeit(reason = '') {
    this.stopTicker();
    clearTimeout(this.botTimer);
    this.s.phase = 'forfeited';
    this.s.winner = 'remote';
    this.s.forfeitReason = reason === 'tab_hidden' ? 'Match forfeited due to tab switch.' : 'Match disconnected.';
    this.onChange && this.onChange();
  },

  checkMatchCompletion() {
    if (this.s.local.done && this.s.remote.done) {
      this.finishMatch();
    }
  },

  finishMatch() {
    this.s.phase = 'result';
    this.stopTicker();
    clearTimeout(this.botTimer);

    if (this.s.local.score > this.s.remote.score) this.s.winner = 'local';
    else if (this.s.local.score < this.s.remote.score) this.s.winner = 'remote';
    else this.s.winner = 'tie';

    if (this.s.winner === 'local') {
      if (typeof confetti === 'function') confetti(innerWidth / 2, innerHeight / 3, 160);
      if (typeof beep === 'function') beep();
    }
    this.onChange && this.onChange();
  },

  cleanup() {
    this.stopTicker();
    this.stopHeartbeat();
    clearTimeout(this.botTimer);
    if (this.conn) {
      try { this.conn.close(); } catch(e){}
      this.conn = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch(e){}
      this.peer = null;
    }
  },

  exit() {
    this.cleanup();
    this.s.phase = 'idle';
  }
};
