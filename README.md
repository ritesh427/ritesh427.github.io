# ⚡ DevPath · Developer Learning & Assessment Dashboard

> Master 206 backend engineering topics across Java, Spring Boot, Microservices, Event-Driven Architecture, LLD, HLD, JUnit5, and Cloud with adaptive exams, spaced repetition, and 1v1 multiplayer duels.

---

## 🚀 Overview

DevPath is a **zero-dependency, local-first web application** designed for backend engineers preparing for senior, staff, and architect interviews. It combines spaced repetition flashcard principles with a **proctored exam engine**, an **assessment hub**, and a **peer-to-peer 1v1 live battle arena**.

### 📚 Curriculum (206 Topics)
- **Java Core & Concurrency** (22 topics): Memory model, virtual threads, collections, synchronization, classloaders, streams.
- **Spring Boot & Cloud** (46 topics): Auto-configuration, bean lifecycles, transactions, AOP, security, Actuator, WebFlux.
- **Microservices Architecture** (23 topics): Service discovery, API Gateway, Circuit Breaker (Resilience4j), distributed tracing, saga pattern, outbox pattern.
- **Event-Driven Architecture & Kafka** (18 topics): Partitions, consumer groups, exactly-once semantics, compaction, schema registry.
- **Low-Level Design / LLD** (35 topics): Design patterns (Factory, Strategy, Observer, Decorator), SOLID principles, parking lot, elevator, rate limiter.
- **High-Level Design / HLD** (34 topics): Distributed caching, CDN, sharding, consensus (Raft/Paxos), message queues, URL shortener, Uber backend.
- **JUnit 5 & Mockito** (18 topics): Parameterized tests, test execution lifecycle, argument captors, mock vs spy, verify.
- **Cloud, AWS & Spring AI** (10 topics): Containers, vector embeddings, RAG pipelines, prompt engineering.

---

## 🎯 5 Core Pillars

### 1. Proctored Exam Engine
- **Exam & Practice Modes**: Take real timed exams or untimed practice drills with instant feedback.
- **Adaptive Question Draw**: Automatically prioritizes questions you've previously missed.
- **Auto-Completion at 80%+**: Scoring $\ge 80\%$ automatically marks the topic completed, raises your mastery confidence level, and advances spaced repetition intervals ($1 \to 3 \to 7 \to 14 \to 30$ days).
- **Anti-Cheat Strikes**: Switching browser tabs or blurring the window issues an immediate warning on 1st strike and disqualifies on 2nd strike.
- **Review Missed Questions**: Review in-depth explanations and code-highlighted breakdowns, with a one-click button to *"Retake Only My Misses"*.

### 2. High-Yield Question Bank
- **149 curated technical questions** across 63 topics covering real interview edge cases, JVM memory output predictions, and architectural trade-offs.
- Extensible question registry via `QB.add(topicId, questions)`.

### 3. Assessment Hub (`#/tests`)
- **Global Pass Rate Gauges**: Track your overall test pass percentage, total attempts, and mastered topics.
- **Competency Matrix**: Visual progress bars across each of the 8 technical categories.
- **Weak-Topic Radar**: Automatically detects and surfaces topics where you've accumulated mistakes.
- **Daily Challenge**: Date-seeded 10-question cross-domain test refreshed every 24 hours.
- **Recent Assessment Feed**: View past scores, dates, and grab your verified certificates.

### 4. 1v1 Real-Time Peer-to-Peer Battle Arena (`#/battle`)
- **Peer-to-Peer Multiplayer**: Uses WebRTC DataChannels (via PeerJS) with no central game server needed.
- **Room Sync Code & Direct Input Box**: 
  - Every match generates a clean, short **6-character Room Code** (e.g. `9X7K2B`) with a one-click **Copy Code** button.
  - Challengers can simply type the code into the **"Enter Room Code"** box on their phone or desktop to sync and join immediately, without needing to copy/paste long URLs.
  - Also supports direct invite links (`#/battle?room=devpath-9x7k2b`).
- **Live Opponent HUD**: Real-time progress bars, answer streak indicators, and synchronized timers.
- **Speed Scoring**: Points scale with accuracy and response speed (up to 2,000 points per question + streak multipliers).
- **Tab-Switch Forfeit Penalty**: Switching tabs or leaving the screen immediately forfeits the match to your opponent.
- **Solo vs DevBot (AI)**: Practice duels anytime offline with built-in DevBot simulation.

### 5. High-DPI Shareable Certificate, Anti-Cheat Hardening & Mobile Optimization
- **Canvas Certificate Generator**: Generates a high-resolution 800×460 PNG certificate badge with your name, topic, score circle, date, and unique certificate ID.
- **Keyboard Hardening**: Restricts DevTools (`F12`, `Ctrl+Shift+I`, `Cmd+Option+I`), viewing source (`Ctrl+U`), printing, and text copying during active proctored tests.
- **100% iPhone & Phone Optimized**: 
  - Supports iOS notch, Dynamic Island, and Home Indicator bar via `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.
  - Guaranteed `16px` input sizing to prevent iOS Safari auto-zoom bugs.
  - Apple HIG minimum 44px tap targets for buttons, options, and tab bars.
  - Responsive question breakdown tables with horizontal touch scrolling.
- **PWA Ready**: Includes `manifest.json`, mobile viewport optimization, and offline caching support.
- **Full Data Backup**: One-click JSON export and import for all notes, progress, test scores, and streaks.

---

## 💻 How to Run Locally

### Option A: Zero Server (Double Click)
Open `devpath-standalone.html` directly in Chrome, Firefox, Safari, or Edge. Everything (CSS, JavaScript, Question Bank, Canvas engine) is bundled in one self-contained file.

### Option B: Local HTTP Server
Run a lightweight HTTP server using Python:

```bash
# Navigate to the project directory
cd /Users/ritesh/.gemini/antigravity/scratch/devpath

# Start a local static web server
python3 -m http.server 8000
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

---

## 🌐 2-Minute GitHub Pages Deployment Guide

Because DevPath is client-side and uses WebRTC for peer-to-peer multiplayer, it requires zero backend configuration to deploy on GitHub Pages:

### Step 1: Initialize Git and Commit
```bash
cd /Users/ritesh/.gemini/antigravity/scratch/devpath
git init
git add .
git commit -m "feat: complete DevPath assessment hub, proctored test engine & 1v1 battle arena"
```

### Step 2: Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new) and create a repository named `devpath` (public).
2. Link your local repository:
```bash
git remote add origin https://github.com/<YOUR-USERNAME>/devpath.git
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. In your GitHub repository, click **Settings** (top tab).
2. In the left navigation, click **Pages**.
3. Under **Build and deployment > Branch**:
   - Select **Branch**: `main`
   - Select **Folder**: `/ (root)`
4. Click **Save**.

Within 60 seconds, your site will be live at:
```
https://<YOUR-USERNAME>.github.io/devpath/
```

Both learners can open this URL, click **1v1 Battle Duel**, share the invite link, and duel peer-to-peer with zero setup!

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl` / `⌘` + `K` | Open Command Palette (search topics, views, actions) |
| `/` | Focus global search bar |
| `?` | Open keyboard shortcuts help modal |
| `1` / `2` / `3` / `4` or `A` / `B` / `C` / `D` | Select answer option during active exam |
| `Enter` | Confirm selected answer or advance question |
| `Escape` | Pause / quit exam prompt or close overlays |
| `g` then `t` | Go to Tests & Assessment Command Hub |
| `g` then `d` | Go to Dashboard |
| `g` then `l` | Go to Library |
| `g` then `m` | Go to Roadmap |
| `g` then `i` | Go to Mock Interview Drill |
| `t` | Toggle Dark / Light theme |
| `f` | Start / pause Focus Pomodoro timer |

---

## 📁 File Structure

```text
devpath/
├── index.html                   # Modular entry point
├── devpath-standalone.html      # 100% self-contained single-file bundle
├── manifest.json                # PWA manifest
├── bundle.py                    # Standalone bundler script
├── README.md                    # Deployment and architecture guide
├── assets/
│   └── icon.svg                 # SVG Application logo
├── css/
│   ├── style.css                # Base theme tokens, layout, typography
│   ├── quiz.css                 # Test screens, timers, feedback cards
│   └── battle.css               # 1v1 Arena split HUD, countdown, victory podium
└── js/
    ├── core.js                  # Utilities, DOM helpers, syntax highlighter
    ├── data.js                  # 206 topics registry & external resource links
    ├── store.js                 # Reactive store, SRS intervals, test metrics
    ├── quiz-engine.js           # Test state machine & anti-cheat tab monitor
    ├── quiz-ui.js               # Exam screens, answer flow, review screen
    ├── share-card.js            # HTML5 Canvas certificate badge generator
    ├── battle-engine.js         # PeerJS WebRTC P2P duel & DevBot AI engine
    ├── battle-ui.js             # 1v1 lobby, countdown overlay, match HUD
    ├── views.js                 # App views & Tests Command Hub
    ├── app.js                   # Routing, shortcuts, keyboard trap
    └── bank/                    # Topic question banks
        ├── bank_java.js
        ├── bank_spring.js
        ├── bank_microservices.js
        ├── bank_eda.js
        ├── bank_lld.js
        ├── bank_hld.js
        └── bank_junit.js
```

---

## 🛡️ Anti-Cheat Specifications
- **Tab Inactivity Detection**: Tracks `visibilitychange` and window `blur` events with a 1.5-second cooldown guard.
- **Copy & Context Menu Lock**: Prevents right-click menus, text dragging, and clipboard cutting during active exams.
- **DevTools Key Lock**: Prohibits `F12`, `Ctrl+Shift+I`, `Cmd+Option+I`, and view-source commands while taking a test.
- **Disqualification Rules**:
  - In Topic Exams: 1st violation shows a full-screen warning; 2nd violation terminates and disqualifies the attempt.
  - In 1v1 Duels: Leaving the active browser tab triggers an instant forfeit and awards victory to the opponent.
