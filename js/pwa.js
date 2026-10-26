'use strict';
/* =========================================================
   DevPath PWA Installation & Live Update Detection Engine
   ========================================================= */

const PWA = {
  currentVersion: '1.0.1',
  deferredPrompt: null,
  waitingWorker: null,

  isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           (document.referrer && document.referrer.includes('android-app://'));
  },

  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  },

  init() {
    this.setupInstallPrompt();
    this.setupServiceWorker();
    this.pollVersion();
  },

  /* ----- Installation Prompt & Notifications ----- */
  setupInstallPrompt() {
    // Desktop & Android Chrome / Edge / Opera
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallNotification(false);
      this.updateSidebarBtn(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.hideInstallCard();
      this.updateSidebarBtn(false);
      if (typeof toast === 'function') {
        toast('DevPath is now installed on your device!', { title: 'App Installed 📱', icon: '📱' });
      }
    });

    // On iOS Safari, if not standalone and not recently dismissed, offer install helper
    if (this.isIOS() && !this.isStandalone()) {
      setTimeout(() => {
        const dismissed = localStorage.getItem('devpath_install_dismissed');
        if (!dismissed || Date.now() - (+dismissed) > 86400000 * 3) {
          this.showInstallNotification(true);
        }
      }, 3500);
    }
  },

  showInstallNotification(isIOS = false) {
    if (this.isStandalone()) return;
    const existing = document.getElementById('pwaInstallCard');
    if (existing) return;

    const card = document.createElement('div');
    card.id = 'pwaInstallCard';
    card.className = 'pwa-card install';
    card.setAttribute('role', 'alert');
    card.innerHTML = `
      <div class="pwa-card-ico">📲</div>
      <div class="pwa-card-body">
        <b>Install DevPath App</b>
        <p>${isIOS ? 'Add DevPath to your iPhone Home Screen for full-screen exams & offline practice.' : 'Install DevPath for instant desktop/phone access, offline practice & proctored 1v1 duels.'}</p>
        <div class="pwa-card-actions">
          <button class="btn sm primary" id="pwaInstallActionBtn">${isIOS ? '📲 How to Install' : '⚡ Install App'}</button>
          <button class="btn sm ghost" id="pwaDismissInstallBtn">Later</button>
        </div>
      </div>
      <button class="icon-btn sm" id="pwaCloseInstallBtn" aria-label="Dismiss">${typeof icon === 'function' ? icon('x', 14) : '✕'}</button>
    `;
    document.body.appendChild(card);

    const onInstall = () => {
      if (isIOS) {
        this.openIOSGuideModal();
      } else if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then(choice => {
          if (choice && choice.outcome === 'accepted') {
            this.hideInstallCard();
          }
          this.deferredPrompt = null;
        });
      } else {
        if (typeof toast === 'function') {
          toast('To install, open your browser menu (⋮ or Share) and select "Add to Home Screen" or "Install App".', { title: 'Install DevPath', icon: '📲', ms: 5000 });
        }
        this.hideInstallCard();
      }
    };

    const onDismiss = () => {
      localStorage.setItem('devpath_install_dismissed', String(Date.now()));
      this.hideInstallCard();
    };

    document.getElementById('pwaInstallActionBtn')?.addEventListener('click', onInstall);
    document.getElementById('pwaDismissInstallBtn')?.addEventListener('click', onDismiss);
    document.getElementById('pwaCloseInstallBtn')?.addEventListener('click', onDismiss);
  },

  hideInstallCard() {
    const card = document.getElementById('pwaInstallCard');
    if (card) card.remove();
  },

  openIOSGuideModal() {
    if (typeof openModal !== 'function') return;
    openModal(`
      <button class="icon-btn modal-close" data-action="close-modal" aria-label="Close">${typeof icon === 'function' ? icon('x', 20) : '✕'}</button>
      <div style="text-align:center;padding:10px 0;">
        <div style="font-size:3rem;margin-bottom:8px;">📲</div>
        <h2 style="margin:0 0 8px;">Install on iPhone &amp; iPad</h2>
        <p class="muted small" style="margin-bottom:20px;">Follow these 3 quick steps to run DevPath in full-screen native app mode:</p>
        <div style="display:grid;gap:14px;text-align:left;background:var(--surface-2);padding:18px;border-radius:16px;border:1px solid var(--border);">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:32px;height:32px;border-radius:50%;background:var(--primary);color:#fff;display:grid;place-items:center;font-weight:800;flex:none;">1</div>
            <div>Tap the <b>Share button</b> ( <span style="font-size:1.15rem;">⎋</span> or <span>📤</span> ) in the bottom Safari toolbar.</div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:32px;height:32px;border-radius:50%;background:var(--primary);color:#fff;display:grid;place-items:center;font-weight:800;flex:none;">2</div>
            <div>Scroll down in the share sheet and tap <b>'Add to Home Screen'</b> ( ➕ ).</div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:32px;height:32px;border-radius:50%;background:var(--primary);color:#fff;display:grid;place-items:center;font-weight:800;flex:none;">3</div>
            <div>Tap <b>Add</b> in the top right corner. Enjoy instant offline access!</div>
          </div>
        </div>
        <div class="modal-actions" style="margin-top:20px;justify-content:center;">
          <button class="btn primary" data-action="close-modal">Got it, Thanks!</button>
        </div>
      </div>
    `, 'sm');
  },

  updateSidebarBtn(visible) {
    const btn = document.getElementById('sideInstallBtn');
    if (btn) {
      btn.hidden = !visible || this.isStandalone();
    }
  },

  /* ----- Service Worker & Live Update Card ----- */
  setupServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    // Reload when the waiting worker takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then(reg => {
        // If an updated worker is already waiting from previous session
        if (reg.waiting) {
          this.showUpdateNotification(reg.waiting);
          return;
        }

        // Detect newly installed worker
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification(newWorker);
            }
          });
        });

        // Check for updates when user returns to the tab
        window.addEventListener('focus', () => {
          reg.update().catch(() => {});
        });

        // Periodic update check every 15 minutes
        setInterval(() => {
          reg.update().catch(() => {});
        }, 900000);
      }).catch(err => {
        console.warn('DevPath SW registration:', err);
      });
    });
  },

  showUpdateNotification(worker = null) {
    if (worker) this.waitingWorker = worker;
    const existing = document.getElementById('pwaUpdateCard');
    if (existing) return;

    const card = document.createElement('div');
    card.id = 'pwaUpdateCard';
    card.className = 'pwa-card update';
    card.setAttribute('role', 'alert');
    card.innerHTML = `
      <div class="pwa-card-ico">🚀</div>
      <div class="pwa-card-body">
        <b>New DevPath Update Available!</b>
        <p>A fresh version of DevPath is ready with new features and question updates. Please update your app.</p>
        <div class="pwa-card-actions">
          <button class="btn sm primary" id="pwaUpdateNowBtn">⚡ Update Now</button>
          <button class="btn sm ghost" id="pwaDismissUpdateBtn">Later</button>
        </div>
      </div>
      <button class="icon-btn sm" id="pwaCloseUpdateBtn" aria-label="Dismiss">${typeof icon === 'function' ? icon('x', 14) : '✕'}</button>
    `;
    document.body.appendChild(card);

    document.getElementById('pwaUpdateNowBtn')?.addEventListener('click', () => {
      this.applyUpdate();
    });

    const dismiss = () => {
      card.remove();
    };

    document.getElementById('pwaDismissUpdateBtn')?.addEventListener('click', dismiss);
    document.getElementById('pwaCloseUpdateBtn')?.addEventListener('click', dismiss);
  },

  applyUpdate() {
    if (typeof toast === 'function') {
      toast('Updating DevPath to the latest version…', { title: 'Updating App ⚡', icon: '⚡' });
    }
    if (this.waitingWorker) {
      this.waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    // Flush caches and reload
    if (window.caches) {
      caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => {
        setTimeout(() => window.location.reload(true), 300);
      });
    } else {
      setTimeout(() => window.location.reload(true), 300);
    }
  },

  /* Check version.json periodically */
  pollVersion() {
    const check = () => {
      fetch('./version.json?_t=' + Date.now(), { cache: 'no-store' })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && data.version && data.version !== this.currentVersion) {
            this.showUpdateNotification(this.waitingWorker);
          }
        })
        .catch(() => {});
    };

    setTimeout(check, 5000);
    window.addEventListener('focus', check);
  }
};

window.addEventListener('DOMContentLoaded', () => {
  PWA.init();
});
