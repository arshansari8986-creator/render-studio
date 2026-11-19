// EMI Trap — iPhone — house engine (Ghadi web-final / De Beers web5 base).
// Full 5-video strategy: ORIGINAL rig unchanged, BIG hero, rich sets, spline
// camera in every shot, <=2.2s shots, gold boards synced to speech (+-0.5s),
// framing-safe camera clamps. Harness: window.ready, window.renderFrame(f),
// canvas #c. 1080x1920, 30 fps, 1638 frames (voice 54.577s).
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import * as D from './draw.js';
import { ENV } from './envelope.js';

const W = 1080, H = 1920, TOTAL = 1638, FPS = 30;
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const DEV_FONT = '"Noto Sans Devanagari"';
const fontReady = (async () => {
  try {
    const face = new FontFace('Noto Sans Devanagari', `url(data:font/ttf;base64,${DEVANAGARI_BOLD_B64})`, { weight: '700' });
    await face.load(); document.fonts.add(face);
    await document.fonts.load(`700 60px ${DEV_FONT}`, 'EMI JHOOTH SALARY BYAAJ PHONE TUMHARA KAHANI KHATM HAI BAKI CRORE RUPYA');
  } catch (e) { window.fontErr = String(e); }
})();

let FRAME = 0;
const MOUTH_RAW = ENV.map((v) => D.clamp((v - 0.03) * 3.0, 0, 1));
function mouthAt(f) {
  const a = MOUTH_RAW[Math.max(0, f - 1)] || 0, b = MOUTH_RAW[f] || 0, c = MOUTH_RAW[Math.min(TOTAL - 1, f + 1)] || 0;
  return D.clamp(a * 0.25 + b * 0.5 + c * 0.25, 0, 1);
}
function text(str, x, y, px, color, align = 'center') {
  ctx.fillStyle = color; ctx.font = `700 ${px}px ${DEV_FONT}, sans-serif`;
  ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
}
const spring = (t) => D.clamp(D.easeOutBack(D.clamp(t, 0, 1)), 0, 1); // clamped: no overshoot past frame-safe size
const fmtIN = (n) => Math.round(n).toLocaleString('en-IN');
function hash(n) { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }
const sstep = (u) => { u = D.clamp(u, 0, 1); return u * u * u * (u * (u * 6 - 15) + 10); };
function burst(x, y, f0, f, n = 14, col = '#ffd23f', spd = 9) {
  const age = f - f0; if (age < 0 || age > 20) return;
  for (let i = 0; i < n; i++) {
    const a = hash(i * 7.3 + f0) * Math.PI * 2, v = (0.35 + hash(i * 3.1 + f0)) * spd;
    const px = x + Math.cos(a) * v * age, py = y + Math.sin(a) * v * age + 0.35 * age * age;
    ctx.globalAlpha = (1 - age / 20) * 0.9; ctx.fillStyle = col;
    D.circ(ctx, px, py, 5 + hash(i + f0) * 5); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function twinkles(x, y, r, n, f) {
  for (let i = 0; i < n; i++) {
    const px = x + (hash(i * 13.7) - 0.5) * 2 * r, py = y + (hash(i * 7.9) - 0.5) * 2 * r;
    const ph = 0.5 + 0.5 * Math.sin(f * 0.25 + i * 1.7);
    D.drawSparkle(ctx, px, py, (9 + hash(i * 3) * 11) * (0.5 + ph * 0.7), 0.30 + ph * 0.6);
  }
}
let GRAIN = null;
function grain(f) {
  if (!GRAIN) {
    GRAIN = document.createElement('canvas'); GRAIN.width = GRAIN.height = 256;
    const g = GRAIN.getContext('2d'); const im = g.createImageData(256, 256);
    for (let i = 0; i < im.data.length; i += 4) { const v = 110 + (Math.random() * 36 | 0); im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0);
  }
  ctx.save(); ctx.globalAlpha = 0.05; ctx.globalCompositeOperation = 'overlay';
  const ox = (f * 37) % 256, oy = (f * 53) % 256;
  for (let x = -ox; x < W; x += 256) for (let y = -oy; y < H; y += 256) ctx.drawImage(GRAIN, x, y);
  ctx.restore();
}
function lampPool(x, y, r, a = 0.45) {
  const g = ctx.createRadialGradient(x, y, 10, x, y, r);
  g.addColorStop(0, 'rgba(255,214,120,' + a + ')'); g.addColorStop(1, 'rgba(255,214,120,0)');
  ctx.fillStyle = g; D.circ(ctx, x, y, r); ctx.fill();
}

// ---------------- camera / parallax layers ----------------
let CAM = { cx: 1080, cy: 1150, s: 1 }, SHK = { x: 0, y: 0 };
function layer(k, fn) {
  const cxk = 1080 + (CAM.cx - 1080) * k, cyk = 1150 + (CAM.cy - 1150) * k;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(W / 2 + SHK.x, H / 2 + SHK.y);
  ctx.scale(CAM.s, CAM.s);
  ctx.translate(-cxk, -cyk);
  fn();
}
function vignette(a = 0.3) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createRadialGradient(540, 920, 420, 540, 920, 1080);
  g.addColorStop(0, 'rgba(12,6,0,0)'); g.addColorStop(1, `rgba(12,6,0,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// ---------------- gold boards (house grammar, scale clamped for framing) ----------------
function goldBoard(x, y, w, h, sc, glow = 0) {
  if (sc <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  if (glow > 0) {
    ctx.save(); ctx.globalAlpha = glow;
    D.rr(ctx, -w / 2 - 14, -h / 2 - 14, w + 28, h + 28, 22); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 7; ctx.stroke();
    ctx.restore();
  }
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, '#f7c948'); g.addColorStop(1, '#d99a16');
  D.rr(ctx, -w / 2, -h / 2, w, h, 18); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  D.rr(ctx, -w / 2 + 11, -h / 2 + 11, w - 22, h - 22, 12); ctx.fillStyle = '#26221f'; ctx.fill();
  ctx.restore();
}
function boardText(x, y, w, h, sc, lines, glow = 0) {
  goldBoard(x, y, w, h, sc, glow);
  if (sc <= 0.35) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  const n = lines.length, lh = n > 1 ? (h - 40) / n : 0;
  lines.forEach((ln, i) => {
    const yy = n > 1 ? -h / 2 + 20 + lh * (i + 0.5) : 4;
    text(ln[0], 0, yy, ln[1], ln[2] || '#ffd23f');
  });
  ctx.restore();
}

// ---------------- characters (ORIGINAL rig only) ----------------
const HERO = { shirt: '#f2b705', shirtD: '#cf9604', pants: '#6e5136' };
const SHOPK = { shirt: '#2e8a7a', shirtD: '#1f6a5c', pants: '#3a3f45' };
function heroFig(x, y, s, o = {}) {
  const f = FRAME;
  const P = o.preset || HERO;
  D.drawHero(ctx, {
    x, y, s, _t: f,
    shirt: o.shirt || P.shirt, shirtD: o.shirtD || P.shirtD,
    pants: o.pants || P.pants, noTie: true, skin: o.skin || P.skin || '#c98a54', hairC: o.hairC || P.hairC || '#20242c',
    expr: o.expr || 'calm', mouth: o.talk ? mouthAt(f) : null,
    blink: D.blinkAt(f, o.seed || 5), wink: !!o.wink,
    armL: o.armL || 'down', armR: o.armR || 'down', face: o.face || 0,
    sweat: !!o.sweat, headDip: o.headDip || 0, walk: o.walk !== undefined ? o.walk : null,
    prop: o.prop || null, phoneMode: o.phoneMode || 'credit',
  });
}

// ---------------- base set helpers ----------------
function skyRect(top, bot) {
  const g = ctx.createLinearGradient(0, -700, 0, 1250);
  g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(-800, -700, 3760, 2000);
}
function groundBand(y0, top, bot, speck = '#3a2a18') {
  const g = ctx.createLinearGradient(0, y0, 0, 2300);
  g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(-800, y0, 3760, 2300 - y0);
  for (let i = 0; i < 240; i++) {
    ctx.fillStyle = speck; ctx.globalAlpha = 0.05 + hash(i) * 0.13;
    const sx = -700 + hash(i * 3) * 3560, sy = y0 + 20 + hash(i * 7) * (2250 - y0);
    ctx.fillRect(sx, sy, 4 + hash(i * 11) * 9, 3 + hash(i * 13) * 5);
  }
  ctx.globalAlpha = 1;
}
function paperFig(x, y, w, h, head, stamp) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.015);
  ctx.fillStyle = '#f5ecd7'; D.rr(ctx, -w / 2, -h / 2, w, h, 10); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  text(head, 0, -h / 2 + 74, 62, '#c0272d');
  ctx.strokeStyle = 'rgba(38,34,31,0.4)'; ctx.lineWidth = 8;
  const rows = Math.floor((h - 220) / 62);
  for (let i = 0; i < rows; i++) {
    ctx.beginPath(); ctx.moveTo(-w / 2 + 50, -h / 2 + 168 + i * 62); ctx.lineTo(w / 2 - 50 - (i % 2) * 110, -h / 2 + 168 + i * 62); ctx.stroke();
  }
  if (stamp) {
    ctx.save(); ctx.translate(0, 40); ctx.rotate(-0.09);
    ctx.strokeStyle = '#c0272d'; ctx.lineWidth = 9; D.rr(ctx, -stamp.length * 24 - 26, -66, stamp.length * 48 + 52, 132, 14); ctx.stroke();
    text(stamp, 0, 2, 72, '#c0272d');
    ctx.restore();
  }
  ctx.restore();
}
function counterFig(y = 1305, x0 = 330, w = 1500) {
  ctx.fillStyle = '#5d3a20'; ctx.fillRect(x0, y, w, 52);
  ctx.fillStyle = '#6e4525'; ctx.fillRect(x0, y + 52, w, 26);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.strokeRect(x0, y, w, 78);
  // glass shine on the counter front
  ctx.fillStyle = 'rgba(190,230,245,0.13)'; ctx.fillRect(x0 + 30, y + 6, w - 60, 16);
}
// shelf unit packed with mini product boxes (set dressing workhorse)
const PACK_COLS = [['#2e7cd6', '#1f5fa8'], ['#e8b23a', '#c78f1d'], ['#3f9e4d', '#2e7a38'], ['#c9452e', '#a33325'], ['#7a4a86', '#5d3868']];
function shelfUnit(x, y, w, rows, seed = 1) {
  const rh = 118;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#4a3016'; ctx.fillRect(-w / 2 - 16, -rows * rh - 26, w + 32, rows * rh + 26);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.strokeRect(-w / 2 - 16, -rows * rh - 26, w + 32, rows * rh + 26);
  for (let r = 0; r < rows; r++) {
    const yb = -r * rh;
    ctx.fillStyle = '#6e4525'; ctx.fillRect(-w / 2 - 10, yb - 14, w + 20, 14);
    const n = Math.floor(w / 74);
    for (let i = 0; i < n; i++) {
      const c = PACK_COLS[Math.floor(hash(seed + r * 31 + i * 7) * 5) % 5];
      const px = -w / 2 + 8 + i * 74, ph = 78 + hash(seed + r * 17 + i * 3) * 18;
      ctx.fillStyle = c[0]; D.rr(ctx, px, yb - 14 - ph, 62, ph, 5); ctx.fill();
      ctx.strokeStyle = 'rgba(38,34,31,0.55)'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = 'rgba(245,236,215,0.9)'; D.ell(ctx, px + 31, yb - 14 - ph / 2, 17, 12); ctx.fill();
    }
  }
  ctx.restore();
}
function towerFig(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 8, 260, 20, 0.35);
  const g = ctx.createLinearGradient(0, -900, 0, 0);
  g.addColorStop(0, '#232c3d'); g.addColorStop(1, '#39445c');
  ctx.fillStyle = g; ctx.fillRect(-190, -900, 380, 900);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.strokeRect(-190, -900, 380, 900);
  for (let r = 0; r < 11; r++) for (let c = 0; c < 4; c++) {
    ctx.fillStyle = hash(r * 7 + c * 13) > 0.45 ? '#ffd873' : '#151c29';
    ctx.fillRect(-158 + c * 84, -862 + r * 76, 52, 42);
  }
  ctx.restore();
}

// ---------------- rich backgrounds (no bare gradients anywhere) ----------------
function darkPremiumBG() {
  layer(0.3, () => {
    skyRect('#2a1a0e', '#120a05');
    lampPool(500, 520, 460, 0.38); lampPool(1700, 520, 460, 0.38);
    ctx.globalAlpha = 0.30; shelfUnit(300, 1290, 430, 4, 21); shelfUnit(1860, 1290, 430, 4, 34); ctx.globalAlpha = 1;
  });
  layer(0.65, () => { groundBand(1280, '#33200f', '#1a1007'); });
}
function darkPlainBG() {
  layer(0.3, () => {
    skyRect('#241207', '#0d0502');
    lampPool(1080, 700, 820, 0.34);
    ctx.globalAlpha = 0.22; shelfUnit(240, 1300, 380, 4, 51); shelfUnit(1920, 1300, 380, 4, 57); ctx.globalAlpha = 1;
  });
  layer(0.65, () => { groundBand(1290, '#2c1a0c', '#170d05'); });
}
function shopInBG() {
  layer(0.3, () => {
    skyRect('#6e4525', '#4a2c14');
    lampPool(620, 430, 380, 0.5); lampPool(1560, 430, 380, 0.5);
    for (const bx of [620, 1560]) {
      ctx.strokeStyle = '#2e2011'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(bx, 60); ctx.lineTo(bx, 330); ctx.stroke();
      ctx.fillStyle = '#ffd873'; D.circ(ctx, bx, 360, 30); ctx.fill();
      ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    }
  });
  layer(0.65, () => {
    groundBand(1270, '#8a6136', '#5d3d1e');
    shelfUnit(390, 1275, 470, 4, 7); shelfUnit(1770, 1275, 470, 4, 12);
  });
}
function homeBG() {
  layer(0.3, () => {
    skyRect('#8a5a34', '#5d3a20');
    lampPool(1080, 480, 720, 0.35);
    ctx.fillStyle = '#3a2817'; D.rr(ctx, 1420, 420, 420, 480, 10); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    const wg = ctx.createLinearGradient(0, 440, 0, 880);
    wg.addColorStop(0, '#ffd873'); wg.addColorStop(1, '#e88a4a');
    ctx.fillStyle = wg; D.rr(ctx, 1445, 445, 370, 430, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(38,34,31,0.6)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(1630, 445); ctx.lineTo(1630, 875); ctx.moveTo(1445, 660); ctx.lineTo(1815, 660); ctx.stroke();
  });
  layer(0.65, () => {
    groundBand(1250, '#7a5230', '#54381e');
    shelfUnit(420, 1255, 400, 3, 17);
    ctx.fillStyle = '#5d2430'; D.rr(ctx, 1330, 1090, 520, 170, 30); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#7a2f3e'; D.rr(ctx, 1330, 1030, 520, 80, 26); ctx.fill(); ctx.stroke();
  });
}
function officeBG() {
  layer(0.3, () => {
    skyRect('#8a6f4d', '#6b543a');
    lampPool(1080, 500, 700, 0.3);
    ctx.save(); ctx.globalAlpha = 0.85;
    paperFig(480, 700, 300, 380, 'AD', null);
    paperFig(1700, 680, 280, 350, 'SALE', null);
    ctx.restore();
  });
  layer(0.65, () => { groundBand(1250, '#77572f', '#59401f'); });
}
function bankBG() {
  layer(0.3, () => {
    skyRect('#3d4a63', '#232c3d');
    for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,246,220,${0.25 + hash(i * 3) * 0.5})`; D.circ(ctx, -600 + hash(i * 7) * 3300, 60 + hash(i * 11) * 700, 3.4); ctx.fill(); }
    lampPool(1080, 620, 700, 0.30);
    ctx.globalAlpha = 0.9; D.drawBank(ctx, 1080, 1290, 1.9); ctx.globalAlpha = 1;
  });
  layer(0.65, () => { groundBand(1270, '#4a3a30', '#2a2019'); });
}

// ---------------- EMI props ----------------
// Giant smartphone: body 300x610 per unit s; drawScreen() runs in local coords
// clipped to the screen (screen spans -132..132 x, -268..268 y).
function phoneFig(x, y, s, scrCol, drawScreen) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 318, 170, 16, 0.35);
  ctx.fillStyle = '#20242c'; D.rr(ctx, -150, -305, 300, 610, 34); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = scrCol; D.rr(ctx, -132, -268, 264, 536, 20); ctx.fill();
  ctx.strokeStyle = 'rgba(38,34,31,0.65)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.save();
  ctx.beginPath(); D.rr(ctx, -132, -268, 264, 536, 20); ctx.clip();
  if (drawScreen) drawScreen();
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.beginPath(); ctx.moveTo(-132, -268); ctx.lineTo(30, -268); ctx.lineTo(-90, 268); ctx.lineTo(-132, 268); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#20242c'; D.rr(ctx, -46, -268, 92, 22, 10); ctx.fill();
  ctx.fillStyle = '#565b63'; D.circ(ctx, 0, 284, 10); ctx.fill();
  ctx.restore();
}
function balanceBar(x, y, w, frac, col) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#1c1712'; D.rr(ctx, -w / 2, -26, w, 52, 14); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  const fw = Math.max(0, (w - 16) * D.clamp(frac, 0, 1));
  if (fw > 4) { ctx.fillStyle = col; D.rr(ctx, -w / 2 + 8, -18, fw, 36, 10); ctx.fill(); }
  ctx.restore();
}
function speechBubble(x, y, w, h, txt, px, sc, tailDir = -1) {
  if (sc <= 0.02) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.moveTo(tailDir * w * 0.18, h / 2 - 4); ctx.lineTo(tailDir * w * 0.34, h / 2 + 52); ctx.lineTo(tailDir * w * 0.02, h / 2 - 4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  D.rr(ctx, -w / 2, -h / 2, w, h, 24); ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  text(txt, 0, 3, px, '#c0272d');
  ctx.restore();
}
function stampBig(x, y, txt, px, sc, rot = -0.07) {
  if (sc <= 0.02) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.font = `700 ${px}px ${DEV_FONT}, sans-serif`;
  const tw = ctx.measureText(txt).width;
  ctx.strokeStyle = '#e33'; ctx.lineWidth = 13; D.rr(ctx, -tw / 2 - 42, -px * 0.78, tw + 84, px * 1.56, 16); ctx.stroke();
  ctx.strokeStyle = 'rgba(238,51,51,0.45)'; ctx.lineWidth = 5; D.rr(ctx, -tw / 2 - 28, -px * 0.64, tw + 56, px * 1.28, 12); ctx.stroke();
  text(txt, 0, px * 0.06, px, '#e33');
  ctx.restore();
}
// EMI bill paper: rows reveal progressively; hl = highlighted row index (-1 none)
const BILL_ROWS = [
  ['PHONE PRICE', '₹1,30,000'],
  ['INTEREST (CHHUPA)', 'EXTRA'],
  ['PROCESSING FEES', 'ALAG SE'],
  ['GST ON INTEREST', '18%'],
];
function billFig(x, y, w, h, reveal, hl) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.012);
  ctx.fillStyle = '#f5ecd7'; D.rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  text('EMI BILL', 0, -h / 2 + 78, 66, '#c0272d');
  ctx.strokeStyle = 'rgba(38,34,31,0.5)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-w / 2 + 46, -h / 2 + 128); ctx.lineTo(w / 2 - 46, -h / 2 + 128); ctx.stroke();
  const rh = 118;
  BILL_ROWS.forEach((r, i) => {
    if (i >= reveal) return;
    const ry = -h / 2 + 168 + i * rh;
    if (i === hl) {
      ctx.fillStyle = `rgba(255,210,63,${0.55 + 0.25 * Math.sin(FRAME * 0.3)})`;
      D.rr(ctx, -w / 2 + 26, ry - 46, w - 52, 92, 10); ctx.fill();
      ctx.strokeStyle = '#c0272d'; ctx.lineWidth = 4; ctx.stroke();
    }
    text(r[0], -w / 2 + 52, ry, 36, '#26221f', 'left');
    text(r[1], w / 2 - 52, ry, 40, i === 0 ? '#26221f' : '#c0272d', 'right');
  });
  ctx.restore();
}
function walletBig(x, y, s, notes) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 92, 210, 18, 0.32);
  for (let i = 0; i < notes; i++) {
    ctx.save(); ctx.translate(-70 + i * 70, -58 - (i % 2) * 14); ctx.rotate(-0.10 + i * 0.10);
    D.drawNote(ctx, 0, 0, 0, 1.35);
    ctx.restore();
  }
  const g = ctx.createLinearGradient(0, -60, 0, 95);
  g.addColorStop(0, '#9a6a3c'); g.addColorStop(1, '#77512a');
  ctx.fillStyle = g; D.rr(ctx, -190, -60, 380, 155, 20); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#6b4423'; D.rr(ctx, 62, -18, 128, 84, 14); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  D.circ(ctx, 96, 24, 13); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.stroke();
  ctx.restore();
}
function creditCardFig(x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const g = ctx.createLinearGradient(-170, -105, 170, 105);
  g.addColorStop(0, '#3a6ea8'); g.addColorStop(1, '#1d3a5f');
  ctx.fillStyle = g; D.rr(ctx, -170, -105, 340, 210, 18); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#ffd23f'; D.rr(ctx, -138, -52, 62, 46, 7); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 3; ctx.stroke();
  text('CREDIT CARD', -138, 34, 30, '#f5ecd7', 'left');
  text('•••• 4242', -138, 76, 30, 'rgba(245,236,215,0.75)', 'left');
  ctx.restore();
}
function posFig(x, y, s, ok) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 130, 120, 14, 0.3);
  ctx.fillStyle = '#2b2f36'; D.rr(ctx, -95, -130, 190, 260, 18); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = ok ? '#dff5d8' : '#3d434c'; D.rr(ctx, -72, -108, 144, 84, 8); ctx.fill(); ctx.stroke();
  if (ok) text('PAID ✓', 0, -66, 34, '#1d7a2f');
  ctx.fillStyle = '#454b54'; ctx.fillRect(-95, 6, 190, 16);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { ctx.fillStyle = '#565d66'; D.rr(ctx, -66 + c * 48, 40 + r * 30, 36, 20, 5); ctx.fill(); }
  ctx.restore();
}
// horizontal strip of month cells scrolling under a fixed window
function calStrip(x, y, off, total = 24) {
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.rect(-470, -120, 940, 240); ctx.clip();
  for (let i = 0; i < total; i++) {
    const cx = -400 + i * 118 - off;
    if (cx < -560 || cx > 560) continue;
    ctx.fillStyle = i % 2 ? '#f5ecd7' : '#e8dcc0'; D.rr(ctx, cx - 52, -86, 104, 172, 10); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#c0272d'; ctx.fillRect(cx - 52, -86, 104, 34);
    text(String(i + 1), cx, 22, 62, '#26221f');
    text('EMI', cx, -68, 24, '#f5ecd7');
  }
  ctx.restore();
  ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 7; D.rr(ctx, x - 478, y - 128, 956, 256, 16); ctx.stroke();
}
// closing EMI calendar: 24 cells, paid crossed red, rest gold, next one pulses
function emiCalendar(x, y, s, paid) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#f5ecd7'; D.rr(ctx, -330, -270, 660, 540, 16); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#c0272d'; D.rr(ctx, -330, -270, 660, 74, 16); ctx.fill();
  ctx.fillStyle = '#f5ecd7'; ctx.fillRect(-330, -232, 660, 36);
  text('EMI CALENDAR', 0, -232, 40, '#ffffff');
  const cw = 96, ch = 76, x0 = -264, y0 = -158;
  for (let i = 0; i < 24; i++) {
    const cx = x0 + (i % 6) * cw + cw / 2 - 8, cy = y0 + Math.floor(i / 6) * ch + ch / 2;
    const done = i < paid, next = i === paid;
    ctx.fillStyle = done ? '#e8d8d8' : (next ? `rgba(255,210,63,${0.65 + 0.3 * Math.sin(FRAME * 0.3)})` : '#fbf6ea');
    D.rr(ctx, cx - 40, cy - 30, 80, 60, 8); ctx.fill();
    ctx.strokeStyle = next ? '#c0272d' : 'rgba(38,34,31,0.5)'; ctx.lineWidth = next ? 5 : 3; ctx.stroke();
    text(String(i + 1), cx, cy + 2, 34, done ? '#9a8f7d' : '#26221f');
    if (done) {
      ctx.strokeStyle = '#e33'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx - 26, cy - 20); ctx.lineTo(cx + 26, cy + 20); ctx.moveTo(cx + 26, cy - 20); ctx.lineTo(cx - 26, cy + 20); ctx.stroke();
    }
  }
  ctx.restore();
}
function chainFig(x1, y1, x2, y2, sag = 60) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + sag;
  const n = 16;
  for (let i = 0; i <= n; i++) {
    const t = i / n, ix = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2;
    const iy = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2;
    const ang = Math.atan2(y2 - y1, x2 - x1) + (i % 2 ? Math.PI / 2 : 0);
    ctx.save(); ctx.translate(ix, iy); ctx.rotate(ang);
    ctx.strokeStyle = '#9aa3ad'; ctx.lineWidth = 7; D.ell(ctx, 0, 0, 21, 12); ctx.stroke();
    ctx.strokeStyle = 'rgba(20,16,12,0.55)'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.restore();
  }
}
function coinPile(x, y, n, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 10, 190, 16, 0.3);
  let placed = 0;
  for (let row = 0; row < 4 && placed < n; row++) {
    const cnt = Math.min(n - placed, 5 - row);
    for (let i = 0; i < cnt; i++) {
      D.drawCoin(ctx, (i - (cnt - 1) / 2) * 62 + (row % 2) * 14, -row * 34, 30, FRAME + placed * 7);
      placed++;
    }
  }
  ctx.restore();
}
function envelopeFig(x, y, s, alpha = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = alpha;
  D.softShadow(ctx, 0, 78, 170, 14, 0.28);
  ctx.fillStyle = '#f5ecd7'; D.rr(ctx, -165, -78, 330, 156, 10); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-165, -78); ctx.lineTo(0, 22); ctx.lineTo(165, -78); ctx.stroke();
  text('SALARY', 0, 48, 34, '#8a6f4d');
  ctx.restore();
}
function iconBadge(x, y, r, label, sc, drawIcon) {
  if (sc <= 0.02) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.fillStyle = '#f5ecd7'; D.circ(ctx, 0, 0, r); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  drawIcon();
  ctx.restore();
  text(label, x, y + r * sc + 44, 40, '#f5ecd7');
}
function deskBand(y = 1310) {
  ctx.fillStyle = '#5d3a20'; ctx.fillRect(240, y, 1680, 54);
  ctx.fillStyle = '#6e4525'; ctx.fillRect(240, y + 54, 1680, 30);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.strokeRect(240, y, 1680, 84);
  ctx.fillStyle = '#4a2c14'; ctx.fillRect(330, y + 84, 40, 190); ctx.fillRect(1790, y + 84, 40, 190);
}

// ---------------- shot system ----------------
const SHOTS = [];
function shot(a, b, vig, cam0, cam1, draw, hits = []) { SHOTS.push({ a, b, vig, cam0, cam1, draw, hits }); }
// camera presets (framing-audited: boards <=920 wide at s<=1.10, cy 1120-1135)
const C_BD = [{ cx: 1080, cy: 1135, s: 1.07 }, { cx: 1080, cy: 1120, s: 1.10 }];
const C_CU = [{ cx: 1080, cy: 1215, s: 1.07 }, { cx: 1072, cy: 1200, s: 1.11 }];
const C_MD = [{ cx: 1080, cy: 1175, s: 1.04 }, { cx: 1080, cy: 1160, s: 1.08 }];
const C_WD = [{ cx: 1080, cy: 1150, s: 1.00 }, { cx: 1080, cy: 1142, s: 1.05 }];
const C_BDCU = [{ cx: 1080, cy: 1140, s: 1.07 }, { cx: 1080, cy: 1128, s: 1.10 }];
function redX(x, y, sc) {
  if (sc <= 0.02) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.strokeStyle = '#e33'; ctx.lineWidth = 17; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-62, -62); ctx.lineTo(62, 62); ctx.moveTo(62, -62); ctx.lineTo(-62, 62); ctx.stroke();
  ctx.restore();
}
function boardPop(f, at, x, y, w, h, lines, glowPulse = true) {
  const sc = spring((f - at) / 11);
  if (sc <= 0.01) return;
  const glow = glowPulse ? 0.35 + 0.25 * Math.sin(f * 0.22) : 0.3;
  boardText(x, y, w, h, sc, lines, glow);
  burst(x, y, at + 1, f, 10, '#ffd23f', 8);
}
function creamStrip(x, y, w, h, txt, px, sc) {
  if (sc <= 0.02) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.rotate(-0.012);
  ctx.fillStyle = '#f5ecd7'; D.rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  text(txt, 0, 3, px, '#26221f');
  ctx.restore();
}

// ===== L1 (0-165) salary aayi, EMI ne kaat liya =====
shot(0, 55, 0.26, C_BD[0], C_BD[1], (f) => {
  officeBG();
  layer(1, () => {
    boardPop(f, 21, 1080, 400, 780, 185, [['SALARY ₹21,000', 80]]);
    deskBand(1310);
    D.drawSmartphone(ctx, 1470, 1150, 2.0, -0.05, f);
    heroFig(830, 1560, 2.3, { talk: true, expr: 'happy', armR: 'catch', seed: 5 });
    twinkles(1470, 1080, 150, 4, f);
  });
});
shot(55, 115, 0.30, { cx: 1080, cy: 1150, s: 1.05 }, { cx: 1080, cy: 1140, s: 1.09 }, (f) => {
  darkPlainBG();
  layer(1, () => {
    const debit = f >= 99;
    if (debit) boardPop(f, 99, 1080, 420, 800, 170, [['EMI CUT ₹11,730', 76, '#ff8a7a']]);
    phoneFig(1080, 1120, 1.5, debit ? '#2a1214' : '#12240f', () => {
      if (!debit) {
        text('SALARY', 0, -170, 44, '#7fd08a');
        text('CREDITED', 0, -118, 44, '#7fd08a');
        text('₹21,000', 0, -30, 62, '#eaffea');
        D.drawCoin(ctx, 0, 60, 34, f);
        text('BALANCE', 0, 150, 30, '#9db9a5');
      } else {
        text('EMI', 0, -170, 46, '#ff8a7a');
        text('DEBITED', 0, -118, 46, '#ff8a7a');
        text('₹11,730', 0, -30, 60, '#ffe1e1');
        text('AUTO-DEBIT', 0, 42, 30, '#c98a8a');
        text('BACHAA: ₹9,270', 0, 150, 32, '#ffd23f');
      }
    });
    const bf = debit ? D.lerp(1, 0.44, D.clamp((f - 99) / 10, 0, 1)) : 1;
    balanceBar(1080, 1620, 560, bf, debit ? '#e0393e' : '#57a047');
    text('BALANCE', 1080, 1692, 34, '#f5ecd7');
  });
});
shot(115, 165, 0.32, C_CU[0], C_CU[1], (f) => {
  darkPlainBG();
  layer(1, () => {
    D.drawLabel(ctx, 1080, 470, 'EMI CUT ₹11,730', spring((f - 118) / 9), '#ff6b5e');
    balanceBar(1080, 580, 520, 0.44, '#e0393e');
    heroFig(1080, 1620, 2.55, { talk: true, expr: 'shocked', sweat: true, armR: 'scratch', seed: 5 });
  });
});
// ===== L2 (165-387) phone shop, no-cost EMI ka jaal =====
shot(165, 222, 0.22, { cx: 1000, cy: 1150, s: 1.02 }, { cx: 1120, cy: 1145, s: 1.06 }, (f, u) => {
  shopInBG();
  layer(1, () => {
    D.drawSignBoard(ctx, 1080, 330, 620, 118, 'PHONE SHOP', '#2e2a4a', '#ffd23f', 56);
    heroFig(1560, 1560, 2.0, { preset: SHOPK, expr: 'happy', armR: 'offer', seed: 23 });
    counterFig(1305, 330, 1500);
    const hx = D.lerp(660, 900, sstep(u));
    heroFig(hx, 1540, 1.95, { talk: true, expr: 'happy', walk: (f * 0.055) % 1, seed: 5 });
  });
});
shot(222, 279, 0.24, C_BD[0], C_BD[1], (f) => {
  shopInBG();
  layer(1, () => {
    boardPop(f, 222, 1080, 400, 860, 185, [['iPHONE ₹1,30,000', 78]]);
    counterFig(1305, 330, 1500);
    ctx.save(); ctx.translate(1080, 1080); ctx.rotate(-0.03);
    const bg = ctx.createLinearGradient(0, -190, 0, 190);
    bg.addColorStop(0, '#e8ecf2'); bg.addColorStop(1, '#b9c2cf');
    ctx.fillStyle = bg; D.rr(ctx, -150, -190, 300, 380, 20); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
    D.drawSmartphone(ctx, 0, 6, 1.15, 0, f);
    text('iPHONE', 0, -138, 44, '#26221f');
    ctx.restore();
    twinkles(1080, 1010, 240, 5, f);
    heroFig(760, 1560, 1.9, { talk: true, expr: 'happy', armR: 'catch', seed: 5 });
    heroFig(1440, 1560, 1.9, { preset: SHOPK, expr: 'smug', armR: 'rub', seed: 23 });
  });
});
shot(279, 336, 0.30, C_CU[0], C_CU[1], (f) => {
  shopInBG();
  layer(1, () => {
    heroFig(1080, 1600, 2.5, { preset: SHOPK, talk: true, expr: 'smug', armR: 'rub', armL: 'fold', seed: 23 });
    speechBubble(800, 620, 560, 150, 'NO-COST EMI!', 62, spring((f - 312) / 10), 1);
  });
});
shot(336, 387, 0.24, C_MD[0], C_MD[1], (f) => {
  shopInBG();
  layer(1, () => {
    counterFig(1305, 330, 1500);
    ctx.save(); ctx.translate(1010, 1245); ctx.rotate(-0.02);
    ctx.fillStyle = '#f5ecd7'; D.rr(ctx, -250, -88, 500, 176, 10); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    text('EMI FORM', 0, -48, 40, '#c0272d');
    ctx.strokeStyle = '#26221f'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-190, 52);
    ctx.lineTo(-190 + 330 * D.clamp((f - 344) / 26, 0, 1), 52 + Math.sin(f * 0.7) * 5); ctx.stroke();
    text('SIGN', 168, 30, 28, 'rgba(38,34,31,0.55)');
    ctx.restore();
    heroFig(700, 1560, 2.05, { talk: true, expr: 'happy', armR: 'hold', seed: 5 });
    heroFig(1470, 1560, 1.95, { preset: SHOPK, expr: 'smug', seed: 23 });
    speechBubble(1300, 800, 520, 140, 'EK RUPYA EXTRA NAHI', 44, spring((f - 356) / 10), -1);
  });
});
// ===== L3 (387-525) JHOOTH — RBI khud keh chuka hai =====
shot(387, 440, 0.34, C_BDCU[0], C_BDCU[1], (f) => {
  darkPlainBG();
  layer(1, () => {
    stampBig(1080, 600, 'JHOOTH.', 118, spring((f - 387) / 7));
    burst(1080, 600, 389, f, 12, '#ff6b5e', 9);
    boardPop(f, 426, 1080, 365, 880, 160, [['0% INTEREST = JHOOTH', 62, '#ff8a7a']]);
    heroFig(1080, 1640, 2.35, { talk: true, expr: 'angry', armR: 'catch', seed: 5 });
  });
}, [387]);
shot(440, 485, 0.26, C_MD[0], C_MD[1], (f) => {
  bankBG();
  layer(1, () => {
    D.drawSignBoard(ctx, 1080, 420, 340, 110, 'RBI', '#1d4e79', '#ffd23f', 62);
    D.drawLabel(ctx, 1080, 620, 'RBI KHUD KEH CHUKA HAI', spring((f - 448) / 10), '#ffd23f');
    heroFig(1080, 1580, 2.1, { talk: true, expr: 'angry', armR: 'point', seed: 5 });
  });
});
shot(485, 525, 0.32, C_CU[0], C_CU[1], (f) => {
  darkPlainBG();
  layer(1, () => {
    D.drawPercent(ctx, 1330, 620, 1.5, -0.08);
    redX(1330, 620, spring((f - 492) / 9));
    heroFig(950, 1620, 2.5, { talk: true, expr: 'angry', armL: 'fold', armR: 'catch', seed: 5 });
  });
});
// ===== L4 (525-681) bill khulta hai =====
shot(525, 577, 0.26, { cx: 1080, cy: 1150, s: 1.05 }, { cx: 1080, cy: 1140, s: 1.09 }, (f, u) => {
  darkPremiumBG();
  layer(1, () => {
    const uh = D.clamp(u * 1.25, 0, 1);
    ctx.save(); ctx.beginPath(); ctx.rect(1080 - 430, 330, 860, 1180 * uh); ctx.clip();
    billFig(1080, 920, 800, 1120, 2, f >= 558 ? 1 : -1);
    ctx.restore();
    if (f >= 558) D.drawLabel(ctx, 1080, 1560, 'INTEREST KEEMAT ME CHHUPA', spring((f - 558) / 9), '#ffd23f');
  });
});
shot(577, 629, 0.26, C_BD[0], C_BD[1], (f) => {
  darkPremiumBG();
  layer(1, () => {
    boardPop(f, 591, 1080, 350, 720, 155, [['PROCESSING FEES', 60]]);
    billFig(1080, 1080, 800, 1120, 3, 2);
  });
});
shot(629, 681, 0.28, C_MD[0], C_MD[1], (f) => {
  darkPremiumBG();
  layer(1, () => {
    boardPop(f, 639, 1080, 380, 640, 160, [['+ 18% GST', 76, '#ff8a7a']]);
    billFig(940, 1130, 640, 980, 4, 3);
    heroFig(1400, 1580, 1.9, { talk: true, expr: 'worried', sweat: true, seed: 5 });
  });
});
// ===== L5 (681-954) hisaab: 1,30,000 -> 1,40,760 =====
shot(681, 736, 0.28, C_BD[0], C_BD[1], (f) => {
  darkPremiumBG();
  layer(1, () => {
    boardPop(f, 696, 1080, 430, 840, 190, [['PHONE ₹1,30,000', 78]]);
    heroFig(760, 1580, 2.1, { talk: true, expr: 'calm', armR: 'catch', seed: 5 });
    D.drawSmartphone(ctx, 1420, 1180, 2.3, 0.04, f);
    twinkles(1420, 1100, 170, 4, f);
  });
});
shot(736, 791, 0.24, C_MD[0], C_MD[1], (f) => {
  darkPremiumBG();
  layer(1, () => {
    const num = Math.min(12, 1 + Math.floor((f - 740) / 4));
    D.drawFlipCal(ctx, 800, 900, 1.7, num);
    D.drawFlipCal(ctx, 1360, 900, 1.7, num);
    D.drawLabel(ctx, 1080, 620, '12 MAHINE', spring((f - 744) / 10), '#ffd23f');
    heroFig(1080, 1600, 2.2, { talk: true, expr: 'calm', armR: 'up', seed: 5 });
  });
});
shot(791, 846, 0.30, { cx: 1080, cy: 1135, s: 1.06 }, { cx: 1080, cy: 1122, s: 1.13 }, (f) => {
  darkPlainBG();
  layer(1, () => {
    const bsc = spring((f - 794) / 12);
    goldBoard(1080, 560, 840, 220, bsc, 0.4);
    if (bsc > 0.4) {
      const u2 = D.clamp((f - 798) / 28, 0, 1), e2 = 1 - Math.pow(1 - u2, 3);
      text('₹' + fmtIN(130000 + (140760 - 130000) * e2), 1080, 540, 96, '#ffd23f');
      if (f >= 836) text('12 MAHINE ME TOTAL BHARA', 1080, 632, 40, '#f5ecd7');
    }
    heroFig(1080, 1620, 2.3, { talk: true, expr: 'shocked', armR: 'catch', seed: 5 });
    twinkles(1080, 480, 380, 5, f);
  });
});
shot(846, 903, 0.30, C_CU[0], C_CU[1], (f) => {
  darkPlainBG();
  layer(1, () => {
    for (let i = 0; i < 7; i++) {
      const age = (f - 846 - i * 7) / 46;
      if (age < 0 || age > 1) continue;
      const cx = 900 + age * 620 + Math.sin(age * 9 + i) * 26, cy = 1080 - age * 560 - Math.sin(age * Math.PI) * 90;
      ctx.globalAlpha = 1 - age * 0.85;
      D.drawCoin(ctx, cx, cy, 30, f + i * 9);
    }
    ctx.globalAlpha = 1;
    D.drawLabel(ctx, 1080, 500, 'HAWA ME GAYA!', spring((f - 862) / 10), '#ff6b5e');
    heroFig(900, 1620, 2.5, { talk: true, expr: 'sad', armR: 'catch', seed: 5 });
  });
});
shot(903, 954, 0.30, C_BD[0], C_BD[1], (f) => {
  darkPremiumBG();
  layer(1, () => {
    boardPop(f, 903, 1080, 450, 800, 190, [['EXTRA ₹10,760', 84, '#ff8a7a']]);
    heroFig(1080, 1620, 2.35, { talk: true, expr: 'sad', headDip: 0.3, seed: 5 });
    coinPile(1420, 1500, 5, 0.9);
  });
});

// ===== L6 (954-1173) wallet khaali, card, dusra loan =====
shot(954, 1010, 0.28, C_BD[0], C_BD[1], (f) => {
  homeBG();
  layer(1, () => {
    boardPop(f, 987, 1080, 400, 760, 180, [['BACHE ₹9,270', 80]]);
    heroFig(1080, 1620, 2.3, { talk: true, expr: 'worried', seed: 5 });
    walletBig(1080, 1180, 1.7, 3);
  });
});
shot(1010, 1070, 0.26, C_MD[0], C_MD[1], (f) => {
  homeBG();
  layer(1, () => {
    const notes = f < 1035 ? 3 : (f < 1050 ? 2 : (f < 1062 ? 1 : 0));
    walletBig(1080, 1330, 1.5, notes);
    iconBadge(700, 800, 92, 'KIRAYA', spring((f - 1035) / 9), () => { D.drawHouse(ctx, 0, 62, 0.30); });
    iconBadge(1080, 700, 92, 'KHANA', spring((f - 1050) / 9), () => {
      ctx.fillStyle = '#c9ccd1'; D.ell(ctx, 0, 6, 52, 20); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = '#e8e2d4'; D.ell(ctx, 0, -12, 40, 22); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#8a8f96'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(0, -46); ctx.stroke();
    });
    iconBadge(1460, 800, 92, 'PETROL', spring((f - 1062) / 9), () => {
      ctx.fillStyle = '#c9452e'; D.rr(ctx, -30, -44, 60, 84, 8); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = '#bfe6f5'; D.rr(ctx, -20, -34, 40, 28, 4); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(30, -20); ctx.quadraticCurveTo(52, -6, 44, 26); ctx.stroke();
    });
    // a note flies from the wallet to whichever icon just appeared
    const flyT = [[1035, 700, 800], [1050, 1080, 700], [1062, 1460, 800]];
    for (const [at, tx, ty] of flyT) {
      const age = (f - at) / 13;
      if (age < 0 || age > 1) continue;
      const nx = D.lerp(1080, tx, age), ny = D.lerp(1240, ty, age) - Math.sin(age * Math.PI) * 70;
      ctx.globalAlpha = 1 - age * 0.6;
      D.drawNote(ctx, nx, ny, age * 0.7, 1.15);
    }
    ctx.globalAlpha = 1;
    heroFig(1080, 1640, 2.0, { talk: true, expr: 'worried', sweat: true, seed: 5 });
  });
});
shot(1070, 1116, 0.32, C_CU[0], C_CU[1], (f) => {
  homeBG();
  layer(1, () => {
    D.drawWallet(ctx, 1330, 1010, 1.9, Math.sin(f * 0.05) * 0.05);
    D.drawLabel(ctx, 1080, 520, 'KHATM!', spring((f - 1082) / 9), '#ff6b5e');
    heroFig(950, 1620, 2.5, { talk: true, expr: 'worried', sweat: true, armR: 'hold', seed: 5 });
  });
});
shot(1116, 1145, 0.26, C_MD[0], C_MD[1], (f, u) => {
  shopInBG();
  layer(1, () => {
    posFig(1330, 1150, 1.6, f >= 1136);
    const cxp = D.lerp(760, 1245, D.clamp((f - 1118) / 15, 0, 1));
    creditCardFig(cxp, 1030, 1.25, 0.06);
    if (f >= 1136) D.drawLabel(ctx, 1330, 830, 'CREDIT CARD!', spring((f - 1136) / 7), '#ffd23f');
    heroFig(700, 1580, 2.1, { talk: true, expr: 'worried', armR: 'offer', seed: 5 });
  });
});
shot(1145, 1173, 0.30, C_MD[0], C_MD[1], (f) => {
  darkPlainBG();
  layer(1, () => {
    paperFig(880, 1010, 540, 520, 'LOAN', null);
    stampBig(880, 1080, 'APPROVED', 54, spring((f - 1167) / 6), -0.09);
    heroFig(1420, 1600, 2.2, { talk: true, expr: 'sad', headDip: 0.55, seed: 5 });
  });
});
// ===== L7 (1173-1254) laga khel khatm? =====
shot(1173, 1214, 0.34, C_BDCU[0], C_BDCU[1], (f) => {
  darkPlainBG();
  layer(1, () => {
    boardPop(f, 1176, 1080, 460, 840, 190, [['KAHANI KHATM?', 80, '#f5ecd7']]);
    heroFig(1080, 1620, 2.4, { talk: true, expr: f < 1198 ? 'puzzled' : 'smug', armR: f < 1198 ? 'scratch' : 'catch', seed: 5 });
  });
});
shot(1214, 1254, 0.30, C_CU[0], C_CU[1], (f) => {
  darkPlainBG();
  layer(1, () => {
    D.drawLabel(ctx, 1080, 540, 'ASLI BILL ABHI BAKI HAI!', spring((f - 1222) / 10), '#ffd23f');
    heroFig(1080, 1600, 2.55, { talk: true, expr: 'smug', armR: 'up', seed: 5 });
    burst(1080, 700, 1224, f, 10, '#ffd23f', 8);
  });
});
// ===== L8 (1254-1446) 24 mahine — byaaj hi ek salary =====
shot(1254, 1308, 0.26, C_MD[0], C_MD[1], (f, u) => {
  darkPremiumBG();
  layer(1, () => {
    D.drawLabel(ctx, 1080, 560, 'EMI — 24 MAHINE', spring((f - 1260) / 10), '#ffd23f');
    calStrip(1080, 950, sstep(u) * 1050);
    heroFig(1080, 1600, 2.15, { talk: true, expr: 'worried', walk: (f * 0.05) % 1, seed: 5 });
  });
});
shot(1308, 1362, 0.32, { cx: 1080, cy: 1135, s: 1.07 }, { cx: 1080, cy: 1122, s: 1.14 }, (f) => {
  darkPlainBG();
  layer(1, () => {
    boardPop(f, 1332, 1080, 520, 820, 210, [['BYAAJ ₹21,300', 88, '#ff8a7a']]);
    heroFig(1080, 1630, 2.3, { talk: true, expr: 'shocked', sweat: true, seed: 5 });
    twinkles(1080, 440, 360, 5, f);
  });
}, [1332]);
shot(1362, 1410, 0.28, C_BD[0], C_BD[1], (f) => {
  darkPremiumBG();
  layer(1, () => {
    boardPop(f, 1383, 1080, 430, 900, 200, [['1 MAHINE KI SALARY', 56], ['= BYAAJ ₹21,300', 64, '#ff8a7a']]);
    envelopeFig(830, 1180, 1.3);
    ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(1020, 1180); ctx.lineTo(1150, 1180); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1150, 1180); ctx.lineTo(1112, 1152); ctx.moveTo(1150, 1180); ctx.lineTo(1112, 1208); ctx.stroke();
    coinPile(1360, 1260, 9, 1.1);
    text('BYAAJ', 1360, 1360, 40, '#ff8a7a');
    heroFig(1080, 1640, 1.95, { talk: true, expr: 'sad', seed: 5 });
  });
});
shot(1410, 1446, 0.30, C_MD[0], C_MD[1], (f, u) => {
  darkPlainBG();
  layer(1, () => {
    const dis = D.clamp((f - 1414) / 26, 0, 1);
    envelopeFig(860, 1120, 1.5, 1 - dis);
    for (let i = 0; i < 8; i++) {
      const age = D.clamp(dis * 1.3 - hash(i * 7) * 0.3, 0, 1);
      if (age <= 0 || age >= 1) continue;
      const cx = D.lerp(860, 1330, age) + Math.sin(age * 7 + i) * 22, cy = D.lerp(1060, 1180, age) - Math.sin(age * Math.PI) * 120;
      ctx.globalAlpha = 1 - Math.abs(age - 0.5);
      D.drawCoin(ctx, cx, cy, 26, f + i * 11);
    }
    ctx.globalAlpha = 1;
    coinPile(1360, 1290, 9 + Math.round(dis * 5), 1.15);
    text('BYAAJ', 1360, 1395, 42, '#ff8a7a');
    D.drawLabel(ctx, 1080, 560, 'POORI SALARY = SIRF BYAAJ', spring((f - 1418) / 10), '#ff6b5e');
    heroFig(700, 1600, 2.1, { talk: true, expr: 'sad', headDip: 0.3, seed: 5 });
  });
});
// ===== L9 (1446-1527) phone tumhara, tum phone ke =====
shot(1446, 1487, 0.30, C_MD[0], C_MD[1], (f) => {
  darkPlainBG();
  layer(1, () => {
    boardPop(f, 1452, 1080, 350, 880, 195, [['PHONE TUMHARA...', 54], ['TUM PHONE KE HO', 64, '#ff8a7a']]);
    phoneFig(1380, 1150, 1.2, '#2a1214', () => {
      text('EMI', 0, -120, 56, '#ff8a7a');
      text('DUE', 0, -58, 56, '#ff8a7a');
      D.drawPadlock(ctx, 0, 60, 1.6);
      text('24 MAHINE', 0, 190, 32, '#c98a8a');
    });
    chainFig(850, 1180, 1230, 1080, 90);
    heroFig(740, 1580, 2.25, { talk: true, expr: 'sad', armR: 'catch', headDip: 0.25, seed: 5 });
  });
});
shot(1487, 1527, 0.32, C_CU[0], C_CU[1], (f) => {
  darkPlainBG();
  layer(1, () => {
    ctx.save(); ctx.globalAlpha = 0.85;
    phoneFig(1380, 1050, 1.15, '#2a1214', () => { text('EMI', 0, -60, 52, '#ff8a7a'); });
    ctx.restore();
    chainFig(640, 1520, 1300, 1240, 110);
    D.drawLabel(ctx, 900, 560, 'AGLE 2 SAAL!', spring((f - 1494) / 10), '#ff6b5e');
    heroFig(830, 1600, 2.5, { talk: true, expr: 'sad', headDip: 0.35, armR: 'catch', seed: 5 });
  });
});
// ===== L10 (1527-1638) sach batao =====
shot(1527, 1582, 0.26, C_BD[0], C_BD[1], (f) => {
  homeBG();
  layer(1, () => {
    boardPop(f, 1536, 1080, 420, 880, 180, [['TUMHARI EMI CHAL RAHI HAI?', 56]]);
    heroFig(900, 1580, 2.3, { talk: true, expr: 'happy', armR: 'hold', seed: 5 });
    D.drawSmartphone(ctx, 1245, 1175, 2.0, 0.05, f);
    D.drawQuestion(ctx, 1470, 760, 1.2, f);
  });
});
shot(1582, 1638, 0.28, C_MD[0], C_MD[1], (f) => {
  darkPremiumBG();
  layer(1, () => {
    boardPop(f, 1587, 1080, 360, 840, 180, [['KITNE MAHINE BAKI?', 64]]);
    emiCalendar(1180, 1010, 1.0, 9);
    text('9 BHAR DIYE...', 1180, 1360, 38, '#9db9a5');
    text('15 ABHI BAKI!', 1180, 1420, 42, '#ffd23f');
    heroFig(700, 1580, 2.1, { talk: true, expr: 'happy', armR: 'point', seed: 5 });
  });
});

// ---------------- render harness ----------------
function renderFrame(f) {
  FRAME = f;
  const sh = SHOTS.find((s) => f >= s.a && f < s.b) || SHOTS[SHOTS.length - 1];
  const u = D.clamp((f - sh.a) / Math.max(1, sh.b - sh.a - 1), 0, 1), e = sstep(u);
  CAM = {
    cx: D.lerp(sh.cam0.cx, sh.cam1.cx, e),
    cy: D.lerp(sh.cam0.cy, sh.cam1.cy, e),
    s: D.lerp(sh.cam0.s, sh.cam1.s, e),
  };
  SHK = { x: 0, y: 0 };
  for (const ht of sh.hits) {
    const age = f - ht;
    if (age >= 0 && age < 7) { const amp = (1 - age / 7) * 13; SHK = { x: Math.sin(age * 9.1) * amp, y: Math.cos(age * 11.3) * amp * 0.7 }; }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#14100c'; ctx.fillRect(0, 0, W, H);
  sh.draw(f, u);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (const ht of sh.hits) {
    if (f === ht) { ctx.fillStyle = 'rgba(255,244,200,0.30)'; ctx.fillRect(0, 0, W, H); }
  }
  vignette(sh.vig);
  grain(f);
}
window.renderFrame = renderFrame;
window.TOTAL = TOTAL;
Promise.all([fontReady, document.fonts.ready]).then(() => { window.ready = true; });
