'use strict';
/* =========================================================
   DevPath Shareable Social Card & Certificate Canvas Generator
   ========================================================= */

function generateShareCard(att, topic) {
  const canvas = document.createElement('canvas');
  const dpr = 2; // High-DPI export
  canvas.width = 800 * dpr;
  canvas.height = 460 * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(dpr, dpr);

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 800, 460);
  bg.addColorStop(0, '#0b0d17');
  bg.addColorStop(0.5, '#101426');
  bg.addColorStop(1, '#0b0d17');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 800, 460);

  // Ambient glows
  const glow1 = ctx.createRadialGradient(700, 40, 10, 700, 40, 320);
  glow1.addColorStop(0, 'rgba(99, 102, 241, 0.22)');
  glow1.addColorStop(1, 'transparent');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, 800, 460);

  const glow2 = ctx.createRadialGradient(80, 400, 10, 80, 400, 260);
  glow2.addColorStop(0, 'rgba(236, 72, 153, 0.16)');
  glow2.addColorStop(1, 'transparent');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, 800, 460);

  // Card border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(20, 20, 760, 420);

  // Brand header
  ctx.fillStyle = '#6366f1';
  ctx.fillRect(48, 48, 36, 36);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Inter, system-ui, sans-serif';
  ctx.fillText('⚡', 56, 74);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 22px Inter, system-ui, sans-serif';
  ctx.fillText('DevPath', 96, 73);

  ctx.fillStyle = '#8e98b0';
  ctx.font = '600 13px Inter, system-ui, sans-serif';
  ctx.fillText('VERIFIED TECHNICAL ASSESSMENT CERTIFICATE', 220, 72);

  // Horizontal divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.moveTo(48, 106);
  ctx.lineTo(752, 106);
  ctx.stroke();

  // Learner name
  const learnerName = (typeof store !== 'undefined' && store && store.settings && store.settings.name ? store.settings.name : 'Backend Engineer').trim();
  ctx.fillStyle = '#8e98b0';
  ctx.font = '600 13px Inter, system-ui, sans-serif';
  ctx.fillText('AWARDED TO', 48, 145);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 28px Inter, system-ui, sans-serif';
  ctx.fillText(learnerName, 48, 180);

  // Assessment details
  ctx.fillStyle = '#8e98b0';
  ctx.font = '600 13px Inter, system-ui, sans-serif';
  ctx.fillText('ASSESSMENT TOPIC', 48, 230);

  ctx.fillStyle = '#eef1f8';
  ctx.font = '700 22px Inter, system-ui, sans-serif';
  const topicTitle = topic ? topic.name : (att.topicId === 'daily' ? 'Daily Cross-Domain Challenge' : 'Technical Exam');
  ctx.fillText(topicTitle.length > 36 ? topicTitle.slice(0, 34) + '…' : topicTitle, 48, 260);

  // Category Tag
  const catName = topic ? topic.category : 'Distributed Systems';
  ctx.fillStyle = 'rgba(99, 102, 241, 0.16)';
  ctx.fillRect(48, 280, 180, 28);
  ctx.fillStyle = '#a5b4fc';
  ctx.font = '700 12px Inter, system-ui, sans-serif';
  ctx.fillText('DOMAIN: ' + catName.toUpperCase(), 58, 298);

  // Verification metadata
  const dateStr = new Date(att.ts || Date.now()).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  ctx.fillStyle = '#8e98b0';
  ctx.font = '500 13px Inter, system-ui, sans-serif';
  ctx.fillText(`Completed on: ${dateStr} · Proctored Exam Mode`, 48, 380);

  const certId = 'CERT-' + Math.abs(Math.sin((att.ts || Date.now()) + (att.pct || 80)) * 1000000).toFixed(0).padStart(7, '0');
  ctx.font = '600 12px ui-monospace, Menlo, monospace';
  ctx.fillText(`ID: ${certId}`, 48, 402);

  // Score Badge Circle (Right side)
  const cx = 630, cy = 250, r = 85;
  const passed = att.passed;
  const scorePct = att.pct || 0;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.stroke();

  // Progress arc
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * (scorePct / 100)));
  ctx.strokeStyle = passed ? '#34d399' : '#f87171';
  ctx.lineCap = 'round';
  ctx.stroke();

  // Score text inside ring
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 48px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${scorePct}%`, cx, cy + 12);

  ctx.fillStyle = passed ? '#34d399' : '#f87171';
  ctx.font = '800 14px Inter, system-ui, sans-serif';
  ctx.fillText(passed ? 'PASSED ✓' : 'COMPLETED', cx, cy + 38);

  ctx.fillStyle = '#8e98b0';
  ctx.font = '600 12px Inter, system-ui, sans-serif';
  ctx.fillText(`${att.correct || 0} / ${att.n || 0} Correct`, cx, cy + 56);
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/png');
}

function downloadShareCard(att, topic) {
  const dataUrl = generateShareCard(att, topic);
  if (!dataUrl) return;
  const safeTitle = (topic ? topic.name : 'devpath-test').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  downloadDataUrl(dataUrl, `devpath-${safeTitle}-${dayKey()}.png`);
  toast('Your assessment certificate badge has been saved!', { title: 'Certificate Downloaded 🎓', icon: '🎓' });
}

function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
