'use strict';
/* =========================================================
   DevPath 1v1 Peer-to-Peer Battle Engine (WebRTC DataChannel)
   ========================================================= */

const Battle = {
  peer: null,
  conn: null,
  isHost: false,
  isBot: false,
  room: null,
  tick: null,
  botTimer: null,

  s: {
    phase: 'idle', // 'idle' | 'lobby' | 'countdown' | 'battle' | 'result' | 'forfeited'
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
      answers: [],
      done: false
    },
    remote: {
      name: 'Waiting...',
      avatar: '👤',
      ready: false,
      score: 0,
      streak: 0,
      answers: [],
      done: false
    }
  },

  active() {
    return this.s.phase === 'countdown' || this.s.phase === 'battle';
  },

  /* ----- Initialization & Networking ----- */
  init() {
    this.s.local.name = store.settings.name || 'Engineer_' + Math.floor(100 + Math.random() * 900);
    this.s.local.avatar = ['⚡', '🚀', '☕', '🍃', '🔥', '💎'][Math.floor(Math.random() * 6)];
  },

  createRoom(topicId = 'ja1') {
    this.init();
    this.isHost = true;
    this.isBot = false;
    this.s.topicId = topicId;
    this.s.phase = 'lobby';
    this.s.local.ready = false;
    this.s.remote = { name: 'Awaiting Challenger...', avatar: '⏳', ready: false, score: 0, streak: 0, answers: [], done: false };
    
    const roomId = 'devpath-' + Math.random().toString(36).substring(2, 8);
    this.room = roomId;
    this.setupPeer(roomId);
    return roomId;
  },

  joinRoom(roomId) {
    this.init();
    this.isHost = false;
    this.isBot = false;
    this.room = roomId;
    this.s.phase = 'lobby';
    this.s.local.ready = false;
    this.setupPeer(null, roomId);
  },

  startVsBot(topicId = 'ja1') {
    this.init();
    this.isHost = true;
    this.isBot = true;
    this.room = 'SOLO_VS_BOT';
    this.s.topicId = topicId;
    this.s.phase = 'lobby';
    this.s.local.ready = false;
    this.s.remote = { name: 'DevBot (AI)', avatar: '🤖', ready: true, score: 0, streak: 0, answers: [], done: false };
    this.onChange && this.onChange();
  },

  setupPeer(customId, connectToId = null) {
    if (typeof Peer === 'undefined') {
      console.warn('PeerJS library not detected. Running in peer simulation mode.');
      return;
    }

    try {
      if (this.peer) this.peer.destroy();
      this.peer = customId ? new Peer(customId) : new Peer();

      this.peer.on('open', id => {
        if (!this.isHost) this.room = id;
        if (connectToId) {
          const c = this.peer.connect(connectToId, { reliable: true });
          this.setupConn(c);
        }
        this.onChange && this.onChange();
      });

      this.peer.on('connection', c => {
        this.setupConn(c);
      });

      this.peer.on('error', err => {
        console.error('PeerJS error:', err);
        toast('Connection negotiation error: ' + err.type, { title: 'P2P Network Warning', icon: '⚠️', kind: 'bad' });
      });
    } catch (e) {
      console.error('WebRTC initialization failed:', e);
    }
  },

  setupConn(c) {
    this.conn = c;
    this.conn.on('open', () => {
      this.send({
        type: 'HELLO',
        name: this.s.local.name,
        avatar: this.s.local.avatar
      });
      toast('Challenger connected via WebRTC DataChannel!', { title: 'Peer Connected ⚡', icon: '🤝' });
      this.onChange && this.onChange();
    });

    this.conn.on('data', data => {
      this.onMessage(data);
    });

    this.conn.on('close', () => {
      if (this.active()) {
        this.forfeit('remote_disconnected');
      } else {
        toast('Challenger disconnected from room.', { title: 'Peer Left', icon: '🚪' });
        this.s.remote.ready = false;
        this.s.remote.name = 'Challenger disconnected';
        this.onChange && this.onChange();
      }
    });
  },

  send(msg) {
    if (this.conn && this.conn.open) {
      this.conn.send(msg);
    }
  },

  /* ----- Message Protocol Dispatcher ----- */
  onMessage(msg) {
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case 'HELLO':
        this.s.remote.name = msg.name || 'Opponent';
        this.s.remote.avatar = msg.avatar || '👤';
        if (this.isHost) {
          this.send({
            type: 'HELLO_ACK',
            name: this.s.local.name,
            avatar: this.s.local.avatar,
            topicId: this.s.topicId,
            n: this.s.n,
            secs: this.s.secs
          });
        }
        break;

      case 'HELLO_ACK':
        this.s.remote.name = msg.name || 'Opponent';
        this.s.remote.avatar = msg.avatar || '👤';
        this.s.topicId = msg.topicId || this.s.topicId;
        this.s.n = msg.n || this.s.n;
        this.s.secs = msg.secs || this.s.secs;
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
        this.s.remote.answers[msg.qIndex] = msg.correct;
        this.s.remote.done = !!msg.done;
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
        k: src.k || '',
        opts: order.map(j => src.o[j]),
        a: order.indexOf(src.a),
        e: src.e
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
    this.s.local.score = 0;
    this.s.local.streak = 0;
    this.s.local.answers = [];
    this.s.local.done = false;
    this.s.remote.score = 0;
    this.s.remote.streak = 0;
    this.s.remote.answers = [];
    this.s.remote.done = false;
    this.s.cur = 0;
    this.s.winner = null;

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
      const multiplier = Math.min(1.5, 1.0 + (this.s.local.streak - 1) * 0.1);
      pts = Math.round((1000 + speedBonus) * multiplier);
    } else {
      this.s.local.streak = 0;
    }

    this.s.local.score += pts;
    this.s.local.answers[this.s.cur] = { sel, isCorrect, pts, timeUsed };

    // Broadcast live progress to opponent
    this.send({
      type: 'PROGRESS',
      qIndex: this.s.cur,
      score: this.s.local.score,
      correct: isCorrect,
      done: this.s.cur + 1 >= this.s.qs.length
    });

    if (this.s.cur + 1 < this.s.qs.length) {
      this.s.cur++;
      this.beginQ();
    } else {
      this.s.local.done = true;
      this.checkMatchCompletion();
    }
    this.onChange && this.onChange();
  },

  /* ----- AI Bot Simulation ----- */
  scheduleBotAnswers() {
    clearTimeout(this.botTimer);
    let botQ = 0;
    const runNextBotAnswer = () => {
      if (botQ >= this.s.qs.length || this.s.phase !== 'battle') return;
      // Bot takes between 4 to 12 seconds to answer
      const delay = 4000 + Math.random() * 8000;
      this.botTimer = setTimeout(() => {
        const isCorrect = Math.random() < 0.78; // 78% accuracy
        const speedBonus = Math.round(1000 * Math.random());
        const pts = isCorrect ? (1000 + speedBonus) : 0;
        this.s.remote.score += pts;
        this.s.remote.answers[botQ] = isCorrect;
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
      this.s.phase = 'result';
      this.stopTicker();
      clearTimeout(this.botTimer);
      if (this.s.local.score > this.s.remote.score) this.s.winner = 'local';
      else if (this.s.local.score < this.s.remote.score) this.s.winner = 'remote';
      else this.s.winner = 'tie';
      
      if (this.s.winner === 'local') {
        confetti(innerWidth / 2, innerHeight / 3, 160);
        beep();
      }
      this.onChange && this.onChange();
    }
  },

  exit() {
    this.stopTicker();
    clearTimeout(this.botTimer);
    if (this.conn) {
      try { this.conn.close(); } catch(e){}
      this.conn = null;
    }
    this.s.phase = 'idle';
  }
};
