// Baal = Black Gold — FULL video (54.5s, 1635 frames @30fps, 1080x1920).
// Story cut: hook -> BLACK GOLD -> gaon -> hazaaron -> Tirupati nilami ->
// 97 tonne -> daan -> wig factory -> ₹190 crore -> beech ka paisa ->
// asli khel -> sona vs kachra -> ending loop. Every shot a different
// camera angle, camera always moving, layered parallax. ORIGINAL rig
// unchanged. Harness: window.ready, window.renderFrame(f).
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import * as D from './draw.js';
import { ENV } from './envelope.js';

const W = 1080, H = 1920, TOTAL = 1635, FPS = 30;
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const DEV_FONT = '"Noto Sans Devanagari"';
const fontReady = (async () => {
  try {
    const face = new FontFace('Noto Sans Devanagari', `url(data:font/ttf;base64,${DEVANAGARI_BOLD_B64})`, { weight: '700' });
    await face.load(); document.fonts.add(face);
    await document.fonts.load(`700 60px ${DEV_FONT}`, '₹84,000 KILO BLACK GOLD 60 BARTAN BAAL ₹5,000 ₹84,314 97 TONNE 119.5 CRORE ₹190 BEECH KA PAISA KAHAAN GAYA ASLI KHEL BARTAN LIYE THE YA PAISE SONA LOCKER ME KACHRE EXPORT SAAL KI');
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
const spring = (t) => D.clamp(D.easeOutBack(D.clamp(t, 0, 1)), 0, 1);
function hash(n) { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }
const sstep = (u) => { u = D.clamp(u, 0, 1); return u * u * u * (u * (u * 6 - 15) + 10); };
const inr = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
function fgStrip(off, maxH, seed = 0) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.save(); ctx.globalAlpha = 0.94; ctx.strokeStyle = '#1c0f05'; ctx.fillStyle = '#1c0f05'; ctx.lineCap = 'round';
  const m = 64, start = -(((off % m) + m) % m) - m;
  for (let bx = start; bx < W + m; bx += m) {
    const h = maxH * (0.45 + hash(bx * 0.37 + seed) * 0.55);
    ctx.lineWidth = 5;
    for (let b = -1; b <= 1; b++) {
      ctx.beginPath(); ctx.moveTo(bx + b * 7, H + 4);
      ctx.quadraticCurveTo(bx + b * 10, H - h * 0.6, bx + b * 16, H - h); ctx.stroke();
    }
    if (hash(bx * 0.91 + seed) > 0.72) ctx.fillRect(bx + 22, H - h * 0.85, 13, h * 0.85);
  }
  ctx.restore();
}

// ---------------- gold boards (house grammar) ----------------
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
function boardPop(f, at, x, y, w, h, lines, glowPulse = true) {
  const sc = spring((f - at) / 11);
  if (sc <= 0.01) return;
  const glow = glowPulse ? 0.35 + 0.25 * Math.sin(f * 0.22) : 0.3;
  boardText(x, y, w, h, sc, lines, glow);
  burst(x, y, at + 1, f, 10, '#ffd23f', 8);
}
function dullBoard(x, y, w, h, sc, lines) {
  if (sc <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.fillStyle = '#4a423a'; D.rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(-w / 2 + 10, -h / 2 + 8, w - 20, 16);
  const n = lines.length, lh = n > 1 ? (h - 24) / n : 0;
  lines.forEach((ln, i) => {
    const yy = n > 1 ? -h / 2 + 12 + lh * (i + 0.5) : 3;
    text(ln[0], 0, yy, ln[1], ln[2] || '#d8cfc0');
  });
  ctx.restore();
}

// ---------------- characters (ORIGINAL rig only) ----------------
const HERO = { shirt: '#f2b705', shirtD: '#cf9604', pants: '#6e5136' };
const PHERI = { shirt: '#b8a888', shirtD: '#9a8a68', pants: '#5a4632', skin: '#b57e46', hairC: '#2c2620' };
const TRADER = { shirt: '#7a4a8c', shirtD: '#5f3869', pants: '#3a3444', skin: '#a06a38' };
const WORKER = { shirt: '#4a7a96', shirtD: '#386278', pants: '#4a4038', skin: '#a06a38', hairC: '#241a12' };
const WORKER2 = { shirt: '#c96f3f', shirtD: '#a8562f', pants: '#3e4a3a', skin: '#8a5a30' };
const WHITEC = { shirt: '#e8e4da', shirtD: '#c9c2b0', pants: '#5a5148', skin: '#b57e46', hairC: '#2c2620' };
const MM2P = { shirt: '#8a3324', shirtD: '#6e271c', pants: '#3c3630', skin: '#b57e46', hairC: '#1c1712' };
const MM3P = { shirt: '#33526e', shirtD: '#274256', pants: '#2e3440', skin: '#8a5a30', hairC: '#101216' };
const GREENC = { shirt: '#3f9e4d', shirtD: '#2e7a38', pants: '#44403a', skin: '#c98a54' };
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
function landlordFig(x, y, s, o = {}) {
  const f = FRAME;
  D.drawLandlord(ctx, {
    x, y, s, _t: f,
    expr: o.expr || 'stern', blink: D.blinkAt(f, o.seed || 6),
    armL: o.armL || 'down', armR: o.armR || 'down', face: o.face || 0,
    shout: o.shout || 0, walk: o.walk !== undefined ? o.walk : null,
  });
}
function seatedFig(x, y, s, o = {}) {
  const f = FRAME;
  D.drawHeroSitting(ctx, {
    x, y, s, _t: f,
    expr: o.expr || 'calm', blink: D.blinkAt(f, o.seed || 8),
    shirt: o.shirt, shirtD: o.shirtD, pants: o.pants, skin: o.skin, hairC: o.hairC,
    slump: o.slump || 0, armMode: o.armMode || 'knees', tear: !!o.tear, face: o.face || 0,
  });
}
function maaFig(x, y, s, o = {}) {
  const f = FRAME;
  D.drawMaa(ctx, {
    x, y, s, _t: f,
    expr: o.expr || 'calm', blink: D.blinkAt(f, o.seed || 9),
    armL: o.armL || 'down', armR: o.armR || 'down', face: o.face || 0,
  });
}
function odhniLocal(s, col) {
  ctx.strokeStyle = col; ctx.lineWidth = 13 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -322 * s, 43 * s, Math.PI * 1.03, Math.PI * 1.97); ctx.stroke();
  ctx.fillStyle = col;
  D.poly(ctx, [[-40 * s, -298 * s], [-58 * s, -118 * s], [-29 * s, -110 * s], [-19 * s, -284 * s]]); ctx.fill();
  ctx.strokeStyle = '#e8b23a'; ctx.lineWidth = 2.5 * s;
  ctx.beginPath(); ctx.moveTo(-56 * s, -122 * s); ctx.lineTo(-30 * s, -114 * s); ctx.stroke();
}
function walkingMaa(x, y, s, ph, o = {}) {
  const bob = Math.abs(Math.sin(ph * Math.PI * 2)) * 6 * s;
  const sway = Math.sin(ph * Math.PI * 2) * 0.028;
  ctx.save(); ctx.translate(x, y - bob); ctx.rotate(sway);
  const fo = Math.sin(ph * Math.PI * 2) * 20 * s;
  ctx.fillStyle = '#3a2a1a';
  D.ell(ctx, fo, 5, 15 * s, 5.5 * s); ctx.fill();
  D.ell(ctx, -fo, 5, 15 * s, 5.5 * s); ctx.fill();
  maaFig(0, 0, s, o);
  if (o.odhni) odhniLocal(s, o.odhni);
  ctx.restore();
  return bob;
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
function gaonBG() {
  layer(0.3, () => {
    skyRect('#e8b06a', '#c97e46');
    lampPool(1080, 430, 760, 0.42);
    D.drawHouse(ctx, 1450, 1300, 2.0);
    ctx.fillStyle = '#6e4525'; ctx.fillRect(408, 900, 44, 400);
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.strokeRect(408, 900, 44, 400);
    ctx.fillStyle = '#4a6e2f';
    D.circ(ctx, 430, 830, 150); ctx.fill();
    D.circ(ctx, 330, 900, 105); ctx.fill();
    D.circ(ctx, 540, 890, 110); ctx.fill();
    ctx.strokeStyle = 'rgba(38,34,31,0.5)'; ctx.lineWidth = 4;
    D.circ(ctx, 430, 830, 150); ctx.stroke(); D.circ(ctx, 330, 900, 105); ctx.stroke(); D.circ(ctx, 540, 890, 110); ctx.stroke();
  });
  layer(0.65, () => { groundBand(1280, '#9a6a38', '#6e4520', '#54340f'); });
}

// ---------------- village set pieces ----------------
function treeFig(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#6e4525'; ctx.fillRect(-16, -190, 32, 190);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.strokeRect(-16, -190, 32, 190);
  ctx.fillStyle = '#4a6e2f';
  D.circ(ctx, 0, -240, 105); ctx.fill();
  D.circ(ctx, -72, -185, 74); ctx.fill();
  D.circ(ctx, 74, -180, 78); ctx.fill();
  ctx.strokeStyle = 'rgba(38,34,31,0.5)'; ctx.lineWidth = 3.5;
  D.circ(ctx, 0, -240, 105); ctx.stroke(); D.circ(ctx, -72, -185, 74); ctx.stroke(); D.circ(ctx, 74, -180, 78); ctx.stroke();
  ctx.restore();
}
function farHouse(x, y, w, h, col) {
  ctx.fillStyle = col;
  ctx.fillRect(x - w / 2, y - h, w, h);
  D.poly(ctx, [[x - w / 2 - 14, y - h], [x, y - h - w * 0.34], [x + w / 2 + 14, y - h]]); ctx.fill();
}
function cloudFig(x, y, s, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#fff4e0';
  D.ell(ctx, x, y, 90 * s, 26 * s); ctx.fill();
  D.ell(ctx, x - 55 * s, y + 6 * s, 55 * s, 19 * s); ctx.fill();
  D.ell(ctx, x + 58 * s, y + 7 * s, 60 * s, 20 * s); ctx.fill();
  ctx.restore();
}
function birdFig(x, y, s, flap) {
  ctx.strokeStyle = 'rgba(60,35,15,0.8)'; ctx.lineWidth = 3.2 * s; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 17 * s, y);
  ctx.quadraticCurveTo(x - 8 * s, y - (7 + flap) * s, x, y);
  ctx.quadraticCurveTo(x + 8 * s, y - (7 + flap) * s, x + 17 * s, y);
  ctx.stroke();
}
function handpumpFig(x, y, f) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#7a7f84'; D.rr(ctx, -72, -14, 144, 14, 4); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 3.5; ctx.stroke();
  ctx.fillStyle = '#5d6468'; ctx.fillRect(-9, -148, 18, 148);
  ctx.strokeRect(-9, -148, 18, 148);
  ctx.fillRect(4, -140, 38, 13);
  ctx.fillRect(31, -140, 11, 22);
  ctx.strokeStyle = '#8a3324'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-6, -146); ctx.lineTo(-88, -182); ctx.stroke();
  D.circ(ctx, -92, -184, 8); ctx.fillStyle = '#26221f'; ctx.fill();
  ctx.fillStyle = '#aeb6bb';
  D.poly(ctx, [[22, -52], [52, -52], [46, -12], [28, -12]]); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 3; ctx.stroke();
  const dy = (f % 26) / 26;
  ctx.fillStyle = 'rgba(190,225,245,' + (0.85 * (1 - dy)) + ')';
  D.circ(ctx, 36, -112 + dy * 52, 4); ctx.fill();
  ctx.restore();
}
function pathBand(y0, y1, col = '#c49a5e') {
  ctx.fillStyle = col;
  D.poly(ctx, [[-800, y0 + 34], [-400, y0], [200, y0 + 24], [900, y0 + 4], [1600, y0 + 28], [2400, y0 + 8], [2960, y0 + 34], [2960, y1], [-800, y1]]);
  ctx.fill();
  ctx.fillStyle = 'rgba(90,58,25,0.20)';
  ctx.fillRect(-800, y0 + (y1 - y0) * 0.34, 3760, 13);
  ctx.fillRect(-800, y0 + (y1 - y0) * 0.68, 3760, 13);
  for (let i = 0; i < 130; i++) {
    ctx.fillStyle = '#8a6132'; ctx.globalAlpha = 0.10 + hash(i * 3.3) * 0.16;
    const sx = -760 + hash(i * 7.7) * 3680, sy = y0 + 16 + hash(i * 5.1) * (y1 - y0 - 26);
    ctx.fillRect(sx, sy, 5 + hash(i * 11.3) * 10, 3 + hash(i * 13.7) * 5);
  }
  ctx.globalAlpha = 1;
}
function grassTuft(x, y, s, seed) {
  ctx.strokeStyle = '#3f6123'; ctx.lineCap = 'round'; ctx.lineWidth = 4 * s;
  for (let b = -2; b <= 2; b++) {
    const h = (26 + hash(seed + b * 3.1) * 22) * s;
    ctx.beginPath(); ctx.moveTo(x + b * 7 * s, y);
    ctx.quadraticCurveTo(x + b * 9 * s, y - h * 0.6, x + b * 13 * s, y - h); ctx.stroke();
  }
}

// ---------------- baal props (all code-drawn) ----------------
function hairBundle(x, y, s, f, swayAmp = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.ell(ctx, 0, 2, 35, 55); ctx.fillStyle = '#1d1712'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 3.5; ctx.stroke();
  ctx.lineCap = 'round';
  for (let i = -7; i <= 7; i++) {
    const sway = Math.sin(f * 0.12 + i * 0.7) * 4.5 * swayAmp;
    ctx.strokeStyle = i % 3 === 0 ? '#453322' : '#120d09';
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(i * 2.2, -46);
    ctx.quadraticCurveTo(i * 5.4 + sway, 0, i * 6.2 + sway * 1.5, 52 - Math.abs(i) * 1.6);
    ctx.stroke();
  }
  ctx.fillStyle = '#c0272d'; D.rr(ctx, -17, -58, 34, 15, 5); ctx.fill();
  ctx.strokeStyle = '#e8b23a'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.restore();
}
function hairFall(f, n = 16) {
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const fall = (hash(i * 7.1) * 2300 + f * (1.1 + hash(i * 3.3) * 1.6)) % 2350;
    const x = 610 + hash(i * 3.7) * 980 + Math.sin(f * 0.05 + i * 1.3) * 22;
    const y = fall - 220, len = 26 + hash(i * 5.9) * 20;
    ctx.strokeStyle = i % 4 === 0 ? 'rgba(84,60,34,0.75)' : 'rgba(16,11,8,0.8)';
    ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 7, y + len * 0.5, x + 1, y + len); ctx.stroke();
  }
  ctx.restore();
}
function bicycleFig(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 6, 200, 13, 0.3);
  const wheel = (cx) => {
    ctx.strokeStyle = '#26262b'; ctx.lineWidth = 7; D.circ(ctx, cx, -40, 39); ctx.stroke();
    ctx.strokeStyle = 'rgba(220,220,225,0.75)'; ctx.lineWidth = 2.4;
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3;
      ctx.beginPath(); ctx.moveTo(cx, -40); ctx.lineTo(cx + Math.cos(a) * 35, -40 + Math.sin(a) * 35); ctx.stroke();
    }
    D.circ(ctx, cx, -40, 7); ctx.fillStyle = '#8a8f96'; ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 2.5; ctx.stroke();
  };
  wheel(-98); wheel(98);
  ctx.strokeStyle = '#8a3324'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-98, -40); ctx.lineTo(-24, -108); ctx.lineTo(64, -102); ctx.lineTo(98, -40);
  ctx.moveTo(-98, -40); ctx.lineTo(-2, -44); ctx.lineTo(-24, -108);
  ctx.moveTo(-2, -44); ctx.lineTo(64, -102);
  ctx.stroke();
  ctx.fillStyle = '#26221f'; D.rr(ctx, -44, -118, 42, 11, 5); ctx.fill();
  ctx.strokeStyle = '#26221f'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(64, -102); ctx.lineTo(78, -122); ctx.moveTo(62, -122); ctx.lineTo(94, -118); ctx.stroke();
  ctx.fillStyle = '#4a423a'; ctx.fillRect(58, -86, 76, 8);
  ctx.fillStyle = '#9a7c4f'; D.ell(ctx, 96, -106, 40, 24); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 3.5; ctx.stroke();
  ctx.strokeStyle = '#6e5636'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(72, -118); ctx.quadraticCurveTo(96, -102, 120, -118); ctx.stroke();
  ctx.restore();
}
function steelPot(x, y, s, sc) {
  if (sc <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * sc, s * sc);
  D.softShadow(ctx, 0, 46, 62, 9, 0.3);
  const g = ctx.createLinearGradient(-52, 0, 52, 0);
  g.addColorStop(0, '#8f979e'); g.addColorStop(0.35, '#e8edef'); g.addColorStop(0.62, '#aeb6bb'); g.addColorStop(1, '#767e84');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-38, -34); ctx.quadraticCurveTo(-56, 6, -40, 34);
  ctx.quadraticCurveTo(0, 50, 40, 34); ctx.quadraticCurveTo(56, 6, 38, -34);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4.5; ctx.stroke();
  D.ell(ctx, 0, -34, 38, 9); ctx.fillStyle = '#c9d1d5'; ctx.fill(); ctx.stroke();
  D.ell(ctx, 0, -34, 27, 5.5); ctx.fillStyle = '#5d6468'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(-30, -22, 9, 48);
  ctx.restore();
}
function steelPlate(x, y, s, sc) {
  if (sc <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * sc, s * sc);
  D.softShadow(ctx, 0, 16, 78, 8, 0.3);
  const g = ctx.createLinearGradient(0, -16, 0, 16);
  g.addColorStop(0, '#dfe6e9'); g.addColorStop(1, '#8f979e');
  D.ell(ctx, 0, 0, 80, 17); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4.5; ctx.stroke();
  D.ell(ctx, 0, -2, 56, 11); ctx.fillStyle = '#aeb6bb'; ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath(); ctx.ellipse(-26, -6, 26, 4.5, -0.25, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function steelLota(x, y, s, sc) {
  if (sc <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * sc, s * sc);
  D.softShadow(ctx, 0, 42, 44, 8, 0.3);
  const g = ctx.createLinearGradient(-36, 0, 36, 0);
  g.addColorStop(0, '#8f979e'); g.addColorStop(0.4, '#eef2f3'); g.addColorStop(1, '#767e84');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-13, -30); ctx.quadraticCurveTo(-40, -6, -34, 18);
  ctx.quadraticCurveTo(-28, 42, 0, 42); ctx.quadraticCurveTo(28, 42, 34, 18);
  ctx.quadraticCurveTo(40, -6, 13, -30);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4.5; ctx.stroke();
  D.ell(ctx, 0, -30, 14, 5); ctx.fillStyle = '#5d6468'; ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(-20, -14, 7, 36);
  ctx.restore();
}

// ---------------- NEW set pieces (godown / temple / factory / home) ----------------
// jute sack with a tuft of hair at the knot; feet/base at (x, y)
function sackFig(x, y, s, col = '#9a7c4f') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 4, 62, 9, 0.3);
  D.ell(ctx, 0, -44, 58, 48); ctx.fillStyle = col; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  ctx.strokeStyle = 'rgba(90,64,32,0.55)'; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(-52, -30); ctx.quadraticCurveTo(0, -14, 52, -30); ctx.stroke();
  ctx.fillStyle = D.shadeC(col, 0.8); D.rr(ctx, -13, -104, 26, 17, 6); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = '#1d1712'; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.moveTo(i * 5, -100);
    ctx.quadraticCurveTo(i * 9, -118, i * 12, -130 + Math.abs(i) * 4); ctx.stroke();
  }
  ctx.restore();
}
function sackPile(x, baseY, rows, seed = 1, s = 1) {
  const cols = ['#9a7c4f', '#8a6c40', '#a8895a'];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < 3; c++) {
      sackFig(x + (c - 1) * 116 * s + (r % 2) * 18 * s, baseY - r * 84 * s, s, cols[Math.floor(hash(seed + r * 7 + c * 3) * 3) % 3]);
    }
  }
}
// temple gopuram: 5 shrinking tiers, kalasha finials; base at (x, baseY)
function gopuram(x, baseY, s) {
  ctx.save(); ctx.translate(x, baseY); ctx.scale(s, s);
  const W0 = 900;
  for (let i = 0; i < 5; i++) {
    const tw = W0 - i * 135, ty = -i * 150;
    D.poly(ctx, [[-tw / 2, ty], [tw / 2, ty], [tw / 2 - 28, ty - 150], [-tw / 2 + 28, ty - 150]]);
    ctx.fillStyle = i % 2 ? '#ecd9ae' : '#f2e3c2'; ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    if (i === 0) { // red vertical stripes on the base tier (temple style)
      ctx.fillStyle = 'rgba(192,69,62,0.75)';
      for (let sx = -tw / 2 + 40; sx < tw / 2 - 20; sx += 92) ctx.fillRect(sx, ty - 146, 26, 142);
    }
    const n = Math.floor(tw / 74);
    ctx.fillStyle = 'rgba(90,58,25,0.65)';
    for (let k = 0; k < n; k++) {
      const ax = -tw / 2 + 40 + k * 74;
      ctx.beginPath(); ctx.arc(ax, ty - 66, 13, Math.PI, 0); ctx.fill();
      ctx.fillRect(ax - 13, ty - 66, 26, 26);
    }
  }
  const topW = W0 - 4 * 135;
  D.rr(ctx, -topW / 2 - 34, -822, topW + 68, 74, 22); ctx.fillStyle = '#c0453e'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  for (const kx of [-130, 0, 130]) {
    D.circ(ctx, kx, -838, 17); ctx.fillStyle = '#e8b23a'; ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = '#e8b23a'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(kx, -852); ctx.lineTo(kx, -884); ctx.stroke();
    D.circ(ctx, kx, -890, 5); ctx.fillStyle = '#ffd23f'; ctx.fill();
  }
  ctx.restore();
}
function flagFig(x, y, h, f, col = '#e8722a') {
  ctx.strokeStyle = '#5d4632'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h); ctx.stroke();
  const w1 = Math.sin(f * 0.3 + x * 0.05) * 9, w2 = Math.sin(f * 0.3 + x * 0.05 + 0.9) * 13;
  ctx.fillStyle = col;
  D.poly(ctx, [[x, y - h], [x + 86, y - h + 15 + w1], [x, y - h + 42 + w2]]); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 3; ctx.stroke();
}
// basket of collected hair; fillN bundles visible; base at (x, y)
function basketFig(x, y, s, fillN, f) {
  for (let i = 0; i < fillN; i++) {
    hairBundle(x + (i - (fillN - 1) / 2) * 54 * s, y - 84 * s, 0.62 * s, f, 0.5);
  }
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 3, 62, 8, 0.3);
  D.poly(ctx, [[-58, -66], [58, -66], [43, 0], [-43, 0]]); ctx.fillStyle = '#b58548'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  ctx.strokeStyle = 'rgba(110,72,32,0.6)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-52, -44); ctx.lineTo(52, -44); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-48, -24); ctx.lineTo(48, -24); ctx.stroke();
  D.rr(ctx, -63, -74, 126, 15, 7); ctx.fillStyle = '#8a6132'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 3.5; ctx.stroke();
  ctx.restore();
}
// platform weighing scale with a big dial; dial centre at (x, y), needle ang (rad, 0 = up)
function dialScale(x, y, s, ang) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // pan (drawn first, behind column base)
  const pg = ctx.createLinearGradient(-235, 0, 235, 0);
  pg.addColorStop(0, '#8f979e'); pg.addColorStop(0.4, '#e8edef'); pg.addColorStop(1, '#767e84');
  D.ell(ctx, 0, 345, 235, 38); ctx.fillStyle = pg; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4.5; ctx.stroke();
  ctx.fillStyle = '#5d6468'; ctx.fillRect(-15, 190, 30, 160);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 3.5; ctx.strokeRect(-15, 190, 30, 160);
  D.rr(ctx, -175, 384, 350, 32, 8); ctx.fillStyle = '#4a423a'; ctx.fill(); ctx.stroke();
  // dial
  D.circ(ctx, 0, 0, 192); ctx.fillStyle = '#f5ecd7'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  D.circ(ctx, 0, 0, 162); ctx.strokeStyle = '#c9b98c'; ctx.lineWidth = 3; ctx.stroke();
  for (let k = 0; k <= 24; k++) {
    const a = -2.0 + k * (4.0 / 24);
    const r1 = k % 4 === 0 ? 128 : 142, r2 = 156;
    ctx.strokeStyle = '#4a3a22'; ctx.lineWidth = k % 4 === 0 ? 4.5 : 2.5;
    ctx.beginPath();
    ctx.moveTo(Math.sin(a) * r1, -Math.cos(a) * r1);
    ctx.lineTo(Math.sin(a) * r2, -Math.cos(a) * r2);
    ctx.stroke();
  }
  text('KG', 0, 74, 40, '#8a6d3b');
  // needle
  ctx.save(); ctx.rotate(ang);
  D.poly(ctx, [[-11, 26], [0, -148], [11, 26]]); ctx.fillStyle = '#c0272d'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
  D.circ(ctx, 0, 0, 17); ctx.fillStyle = '#26221f'; ctx.fill();
  ctx.restore();
}
// cargo truck, side view; ground contact at (x, y). Open back at the LEFT.
function truckFig(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 4, 380, 16, 0.3);
  // cargo box
  D.rr(ctx, -370, -362, 520, 282, 8); ctx.fillStyle = '#c96f3f'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#e8b23a'; ctx.fillRect(-370, -300, 520, 20);
  ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fillRect(-370, -200, 520, 12);
  // open back: dark hold with bundles inside
  ctx.fillStyle = '#241a10'; ctx.fillRect(-368, -344, 118, 246);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.strokeRect(-368, -344, 118, 246);
  hairBundle(-322, -170, 0.85, FRAME, 0.4);
  hairBundle(-282, -245, 0.7, FRAME, 0.4);
  // cab
  D.poly(ctx, [[150, -80], [150, -300], [268, -300], [352, -196], [352, -80]]); ctx.fillStyle = '#2e7cd6'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
  D.rr(ctx, 262, -288, 82, 76, 8); ctx.fillStyle = '#bfe6f5'; ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#2568b5'; ctx.fillRect(150, -140, 202, 14);
  D.circ(ctx, 330, -120, 9); ctx.fillStyle = '#ffd23f'; ctx.fill();
  // wheels
  for (const wx of [-268, 248]) {
    D.circ(ctx, wx, -54, 54); ctx.fillStyle = '#26262b'; ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    D.circ(ctx, wx, -54, 20); ctx.fillStyle = '#8a8f96'; ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}
// push trolley loaded with bundles; ground contact at (x, y)
function trolleyFig(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 4, 190, 11, 0.3);
  ctx.strokeStyle = '#4a423a'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-180, -62); ctx.lineTo(-238, -142); ctx.moveTo(-180, -62); ctx.lineTo(-228, -148); ctx.stroke();
  ctx.strokeStyle = '#26221f'; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(-244, -146); ctx.lineTo(-222, -150); ctx.stroke();
  ctx.fillStyle = '#6e5636'; ctx.fillRect(-150, -66, 24, 48); ctx.fillRect(126, -66, 24, 48);
  for (const wx of [-138, 138]) { D.circ(ctx, wx, -18, 19); ctx.fillStyle = '#26262b'; ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 3.5; ctx.stroke(); }
  D.rr(ctx, -185, -84, 370, 20, 7); ctx.fillStyle = '#8a6a42'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  hairBundle(-102, -118, 0.95, FRAME, 0.5);
  hairBundle(12, -124, 1.02, FRAME, 0.5);
  hairBundle(122, -114, 0.9, FRAME, 0.5);
  ctx.restore();
}
// mannequin head wearing a wig, on a short post; base of post at (x, y)
function wigHead(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#8a8f96'; ctx.fillRect(-7, -62, 14, 62);
  D.circ(ctx, 0, -100, 37); ctx.fillStyle = col; ctx.fill();
  ctx.fillRect(-37, -100, 15, 82); ctx.fillRect(22, -100, 15, 82);
  D.ell(ctx, -29, -16, 8, 6); ctx.fill(); D.ell(ctx, 29, -16, 8, 6); ctx.fill();
  D.circ(ctx, 0, -97, 28); ctx.fillStyle = '#d9b98c'; ctx.fill();
  ctx.strokeStyle = 'rgba(38,34,31,0.45)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -104, 31, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = 9; ctx.strokeStyle = col; ctx.stroke();
  ctx.restore();
}
// tall display stand with a finished wig; base at (x, y)
function wigStand(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 3, 92, 10, 0.3);
  D.ell(ctx, 0, 0, 88, 13); ctx.fillStyle = '#4a423a'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 3.5; ctx.stroke();
  ctx.fillStyle = '#6e5636'; ctx.fillRect(-8, -248, 16, 248);
  D.circ(ctx, 0, -292, 49); ctx.fillStyle = col; ctx.fill();
  ctx.fillRect(-49, -292, 19, 158); ctx.fillRect(30, -292, 19, 158);
  D.ell(ctx, -39, -132, 10, 7); ctx.fill(); D.ell(ctx, 39, -132, 10, 7); ctx.fill();
  D.circ(ctx, 0, -284, 34); ctx.fillStyle = '#d9b98c'; ctx.fill();
  ctx.strokeStyle = 'rgba(38,34,31,0.4)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -292, 38, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = 11; ctx.strokeStyle = col; ctx.stroke();
  ctx.restore();
}
function cartonFig(x, y, w, h) {
  ctx.save(); ctx.translate(x, y);
  D.softShadow(ctx, 0, 4, w * 0.52, 10, 0.28);
  D.rr(ctx, -w / 2, -h, w, h, 6); ctx.fillStyle = '#cfa96e'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4.5; ctx.stroke();
  ctx.strokeStyle = 'rgba(110,72,32,0.65)'; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(0, -h); ctx.lineTo(0, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-w / 2, -h + 4); ctx.lineTo(w / 2, -h + 4); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.20)'; ctx.fillRect(-w / 2 + 8, -h + 14, w - 16, 20);
  ctx.restore();
}
function dustbinFig(x, y, s, lidTilt = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 4, 58, 8, 0.3);
  D.poly(ctx, [[-54, -120], [54, -120], [42, 0], [-42, 0]]); ctx.fillStyle = '#46685a'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4.5; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.strokeStyle = 'rgba(20,30,24,0.5)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-50, -78); ctx.lineTo(50, -78); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-46, -40); ctx.lineTo(46, -40); ctx.stroke();
  D.ell(ctx, 0, -120, 57, 12); ctx.fillStyle = '#385446'; ctx.fill(); ctx.stroke();
  ctx.save(); ctx.translate(0, -128); ctx.rotate(lidTilt);
  D.ell(ctx, 0, 0, 59, 13); ctx.fillStyle = '#527a68'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -4, 16, Math.PI, 0); ctx.strokeStyle = '#385446'; ctx.lineWidth = 5; ctx.stroke();
  ctx.restore();
  ctx.restore();
}
function doorFig(x, baseY, w, h) {
  ctx.save(); ctx.translate(x, baseY);
  ctx.fillStyle = '#7a4a21'; D.rr(ctx, -w / 2 - 13, -h - 13, w + 26, h + 13, 9); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4.5; ctx.stroke();
  const g = ctx.createLinearGradient(0, -h, 0, 0);
  g.addColorStop(0, '#a06a34'); g.addColorStop(1, '#8a5a2a');
  D.rr(ctx, -w / 2, -h, w, h, 6); ctx.fillStyle = g; ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(70,42,16,0.7)'; ctx.lineWidth = 4;
  D.rr(ctx, -w / 2 + 22, -h + 26, w - 44, h * 0.38, 5); ctx.stroke();
  D.rr(ctx, -w / 2 + 22, -h * 0.48, w - 44, h * 0.34, 5); ctx.stroke();
  D.circ(ctx, w / 2 - 28, -h / 2, 9); ctx.fillStyle = '#e8b23a'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#8a8f96'; D.rr(ctx, -w / 2 - 32, -15, w + 64, 15, 4); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// ---------------- shot system ----------------
const SHOTS = [];
function shot(a, b, vig, cam0, cam1, draw, hits = []) { SHOTS.push({ a, b, vig, cam0, cam1, draw, hits }); }
const C_A1 = [{ cx: 1080, cy: 1135, s: 1.07 }, { cx: 1080, cy: 1120, s: 1.10 }];
const C_A2 = [{ cx: 1080, cy: 1060, s: 1.10 }, { cx: 1080, cy: 990, s: 1.16 }];
const C_B = [{ cx: 1080, cy: 1150, s: 1.02 }, { cx: 1080, cy: 1140, s: 1.07 }];
const C_C1 = [{ cx: 975, cy: 1075, s: 0.66 }, { cx: 1205, cy: 1065, s: 0.71 }];
const C_C2 = [{ cx: 690, cy: 1150, s: 1.00 }, { cx: 960, cy: 1145, s: 1.04 }];
const C_D1 = [{ cx: 1035, cy: 1105, s: 1.22 }, { cx: 1028, cy: 1095, s: 1.31 }];
const C_D2 = [{ cx: 1075, cy: 1225, s: 1.04 }, { cx: 1090, cy: 1200, s: 1.09 }];

const BOARD_LINES = [['₹84,000', 100], ['/ KILO', 54, '#f5ecd7']];

// ===== A1 (0-72) hook: hero holds up the hair bundle, ₹84,000 board slams in =====
shot(0, 73, 0.26, C_A1[0], C_A1[1], (f) => {
  darkPremiumBG();
  layer(1, () => {
    boardPop(f, 24, 1080, 400, 820, 210, BOARD_LINES);
    heroFig(900, 1600, 2.6, { expr: 'shocked', armR: 'catch', armL: 'down', seed: 5 });
    const hx = 900 + 62 * 2.6, hy = (1600 - 298 * 2.6) - 16 * 2.6 + Math.sin(f * 0.55 + 1) * 9 * 2.6;
    hairBundle(hx, hy - 26, 1.55, f);
    hairFall(f, 16);
    twinkles(1080, 400, 330, 4, f);
  });
}, [24]);

// ===== A2 (73-148) push-in: hero gestures up, board pulses, bridge into title =====
shot(73, 149, 0.28, C_A2[0], C_A2[1], (f) => {
  darkPremiumBG();
  layer(1, () => {
    const bridge = f >= 141 ? 1 + (f - 141) / 7 * 0.05 : 1;
    const pulse = (1 + 0.02 * Math.sin(f * 0.30)) * bridge;
    if (f >= 141) lampPool(1080, 400, 560, 0.10 + (f - 141) / 7 * 0.22);
    boardText(1080, 400, 820, 210, pulse, BOARD_LINES, 0.4 + 0.25 * Math.sin(f * 0.22));
    heroFig(860, 1620, 2.5, { expr: 'smug', armR: 'up', armL: 'down', seed: 5 });
    hairFall(f, 12);
    twinkles(1080, 400, 320, 5, f);
  });
});

// ===== B (149-200) title slam: BLACK GOLD =====
shot(149, 201, 0.32, C_B[0], C_B[1], (f, u) => {
  darkPlainBG();
  layer(1, () => {
    if (f === 149) burst(1080, 900, 149, f, 18, '#ffd23f', 11);
    const pop = spring((f - 149) / 9);
    ctx.save(); ctx.translate(1080, 900); ctx.scale(pop, pop);
    const g = ctx.createLinearGradient(0, -95, 0, 95);
    g.addColorStop(0, '#ffe98a'); g.addColorStop(0.5, '#f7c948'); g.addColorStop(1, '#c07f10');
    ctx.fillStyle = g; ctx.font = `700 148px ${DEV_FONT}, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('BLACK GOLD', 0, 0);
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 3; ctx.strokeText('BLACK GOLD', 0, 0);
    ctx.save();
    ctx.beginPath(); ctx.rect(-480, -110, 960, 220); ctx.clip();
    const sx = -560 + u * 1180;
    const sg = ctx.createLinearGradient(sx, 0, sx + 190, 0);
    sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,240,0.5)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg;
    ctx.save(); ctx.translate(sx + 95, 0); ctx.rotate(0.32); ctx.fillRect(-95, -190, 190, 380); ctx.restore();
    ctx.restore();
    ctx.restore();
    ctx.strokeStyle = 'rgba(247,201,72,0.8)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(700, 1010); ctx.lineTo(1460, 1010); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(700, 790); ctx.lineTo(1460, 790); ctx.stroke();
    twinkles(1080, 900, 430, 7, f);
  });
}, [149]);

// ===== C1 (201-252) GAON ESTABLISHING WIDE: the whole village, slow PAN =====
shot(201, 253, 0.16, C_C1[0], C_C1[1], (f) => {
  layer(0.3, () => {
    skyRect('#f2c078', '#df9a58');
    lampPool(1560, 320, 620, 0.5);
    D.circ(ctx, 1560, 320, 92); ctx.fillStyle = '#ffd98a'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,190,90,0.65)'; ctx.lineWidth = 6; ctx.stroke();
    cloudFig(420 + f * 0.35, 240, 1.1, 0.5);
    cloudFig(1150 + f * 0.22, 150, 0.8, 0.4);
    cloudFig(2050 + f * 0.3, 300, 1.3, 0.45);
    const flap = Math.sin(f * 0.35) * 4;
    birdFig(500 + f * 1.15, 330 + Math.sin(f * 0.07) * 14, 1.1, flap);
    birdFig(620 + f * 1.15, 285 + Math.sin(f * 0.07 + 2) * 12, 0.85, -flap);
    birdFig(760 + f * 1.15, 360 + Math.sin(f * 0.07 + 4) * 10, 0.7, flap);
    ctx.globalAlpha = 0.5;
    farHouse(300, 1300, 300, 190, '#b57a44');
    farHouse(760, 1300, 380, 240, '#c08a4e');
    farHouse(1260, 1300, 320, 200, '#b57a44');
    farHouse(1740, 1300, 400, 250, '#c08a4e');
    ctx.globalAlpha = 1;
  });
  layer(0.65, () => {
    groundBand(1295, '#a5713a', '#77491f', '#5d3a12');
    D.drawHouse(ctx, 330, 1312, 1.2);
    D.drawHouse(ctx, 800, 1320, 1.5);
    D.drawHouse(ctx, 1330, 1310, 1.12);
    D.drawHouse(ctx, 1830, 1318, 1.42);
    treeFig(580, 1305, 1.05);
    treeFig(1120, 1310, 0.88);
    treeFig(1620, 1305, 1.18);
    treeFig(2050, 1312, 0.92);
    handpumpFig(1010, 1316, f);
  });
  layer(1, () => {
    pathBand(1460, 1720);
    maaFig(560, 1452, 0.52, { expr: 'calm', seed: 3 });
    heroFig(1665, 1458, 0.55, { preset: PHERI, expr: 'calm', seed: 4 });
    grassTuft(420, 1690, 1.1, 7); grassTuft(980, 1735, 1.3, 21); grassTuft(1560, 1680, 1.0, 33); grassTuft(2080, 1725, 1.2, 47);
    ctx.strokeStyle = 'rgba(196,154,94,0.65)'; ctx.lineCap = 'round'; ctx.lineWidth = 95;
    ctx.beginPath(); ctx.moveTo(760, 1690); ctx.quadraticCurveTo(900, 2050, 1180, 2380); ctx.stroke();
    ctx.strokeStyle = 'rgba(90,58,25,0.25)'; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(735, 1690); ctx.quadraticCurveTo(875, 2050, 1155, 2380); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(790, 1690); ctx.quadraticCurveTo(930, 2050, 1210, 2380); ctx.stroke();
    grassTuft(520, 1900, 1.5, 61); grassTuft(1330, 1980, 1.7, 67); grassTuft(1780, 1880, 1.4, 71);
    grassTuft(300, 2120, 1.8, 79); grassTuft(1620, 2200, 1.9, 83); grassTuft(2150, 2050, 1.6, 89);
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = 'rgba(120,90,55,0.8)';
      D.ell(ctx, 260 + hash(i * 17.3) * 2100, 1820 + hash(i * 23.7) * 420, 12 + hash(i * 7.9) * 16, 7 + hash(i * 5.3) * 7); ctx.fill();
    }
  });
  fgStrip((CAM.cx - 975) * 1.5, 46, 5);
});

// ===== C2 (253-304) SIDE TRACKING: two women walk the path, pheriwala enters =====
shot(253, 305, 0.20, C_C2[0], C_C2[1], (f, u) => {
  layer(0.3, () => {
    skyRect('#f0ba72', '#dd9450');
    lampPool(1500, 360, 640, 0.42);
    cloudFig(500 + f * 0.3, 260, 1.0, 0.45);
    cloudFig(1500 + f * 0.2, 170, 0.75, 0.38);
    ctx.globalAlpha = 0.45;
    farHouse(350, 1300, 340, 210, '#b57a44');
    farHouse(1050, 1300, 400, 250, '#c08a4e');
    farHouse(1800, 1300, 330, 200, '#b57a44');
    ctx.globalAlpha = 1;
  });
  layer(0.65, () => {
    groundBand(1295, '#a5713a', '#77491f', '#5d3a12');
    D.drawHouse(ctx, 350, 1314, 1.3);
    D.drawHouse(ctx, 800, 1320, 1.48);
    D.drawHouse(ctx, 1250, 1312, 1.15);
    D.drawHouse(ctx, 1700, 1318, 1.4);
    treeFig(575, 1308, 1.0);
    treeFig(1025, 1312, 0.85);
    treeFig(1475, 1308, 1.1);
  });
  layer(1, () => {
    pathBand(1485, 1700);
    if (f >= 282) {
      const eu = D.ease(D.clamp((f - 282) / 20, 0, 1));
      const px = D.lerp(1700, 1360, eu);
      const walking = f < 300;
      const wph = ((f - 282) * 0.05) % 1;
      const bbob = walking ? Math.abs(Math.sin(wph * Math.PI * 2)) * 4 : 0;
      bicycleFig(px - 155, 1598 - bbob, 1.85);
      heroFig(px, 1568, 2.0, { preset: PHERI, expr: 'calm', armL: 'hold', armR: 'down', seed: 7, face: -0.5, walk: walking ? wph : null });
    }
    const ph1 = ((f - 253) * 0.052) % 1, ph2 = ((f - 253) * 0.052 + 0.45) % 1;
    const w1x = D.lerp(620, 900, u), w2x = D.lerp(775, 1065, u);
    const bob2 = walkingMaa(w2x, 1572, 1.38, ph2, { expr: 'calm', armR: 'hold', armL: 'down', seed: 12, odhni: '#2e5f8a' });
    hairBundle(w2x + 14 * 1.38, 1572 - 198 * 1.38 - bob2 * 0.5, 0.85, f, 0.6);
    const bob1 = walkingMaa(w1x, 1565, 1.5, ph1, { expr: 'speak', armR: 'offer', armL: 'down', seed: 9 });
    hairBundle(w1x + 14 * 1.5, 1565 - 198 * 1.5 - bob1 * 0.5, 0.92, f, 0.6);
    ctx.fillStyle = 'rgba(190,150,95,0.35)';
    const dp = (ph1 * 2) % 1;
    D.ell(ctx, w1x - 34, 1572, 26 * (0.5 + dp * 0.8), 7); ctx.fill();
    D.ell(ctx, w2x - 30, 1579, 22 * (0.5 + dp * 0.7), 6); ctx.fill();
  });
  fgStrip((CAM.cx - 690) * 1.8, 54, 11);
});

// ===== D1 (305-340) CLOSE-UP: hands exchange bundle for bartan, ₹60 board =====
shot(305, 341, 0.24, C_D1[0], C_D1[1], (f, u) => {
  gaonBG();
  layer(1, () => {
    maaFig(785, 1575, 2.0, { expr: 'speak', armR: 'offer', armL: 'down', seed: 9 });
    heroFig(1260, 1565, 2.05, { preset: PHERI, expr: 'calm', armL: 'hold', armR: 'down', seed: 7, face: -0.4 });
    const au = D.ease(D.clamp((u - 0.15) / 0.6, 0, 1));
    const bx = D.lerp(817, 1228, au), by = 1182 - Math.sin(au * Math.PI) * 46;
    hairBundle(bx, by, 1.5, f, 0.5);
    steelPot(880, 1548, 1.25, spring((f - 312) / 10));
    steelPlate(1045, 1572, 1.2, spring((f - 322) / 10));
    if (f >= 312 && f < 324) burst(880, 1515, 312, f, 8, '#eef2f3', 6);
    if (f >= 322 && f < 334) burst(1045, 1550, 322, f, 8, '#eef2f3', 6);
    const dsc = spring((f - 316) / 11);
    dullBoard(1080, 472, 380, 118, dsc, [['₹60', 66], ['KE BARTAN', 30, '#b8ab98']]);
  });
});

// ===== D2 (341-369) LOW ANGLE: he walks away with a sack of hair, women watch =====
shot(341, 370, 0.27, C_D2[0], C_D2[1], (f, u) => {
  gaonBG();
  layer(1, () => {
    ctx.save(); ctx.globalAlpha = 0.15;
    boardText(1080, 470, 800, 190, 1, BOARD_LINES, 0);
    ctx.restore();
    ctx.fillStyle = '#4a2c12';
    D.poly(ctx, [[-800, 1705], [400, 1670], [1600, 1690], [2960, 1660], [2960, 2300], [-800, 2300]]); ctx.fill();
    maaFig(760, 1545, 1.55, { expr: 'sad', armR: 'down', armL: 'down', seed: 9 });
    ctx.save(); ctx.translate(905, 1555);
    maaFig(0, 0, 1.45, { expr: 'calm', armR: 'fold', armL: 'down', seed: 12 });
    odhniLocal(1.45, '#2e5f8a');
    ctx.restore();
    const px = D.lerp(940, 1330, u);
    const wph = (f * 0.048) % 1;
    const bbob = Math.abs(Math.sin(wph * Math.PI * 2)) * 4;
    const bx = px - 40, by = 1598 - bbob;
    ctx.save(); ctx.translate(bx, by); ctx.scale(-1, 1); ctx.translate(-bx, -by);
    bicycleFig(bx, by, 1.85);
    ctx.restore();
    const scx = bx - 96 * 1.85, scy = by - 106 * 1.85;
    ctx.save(); ctx.translate(scx, scy);
    D.ell(ctx, 0, 0, 102, 76); ctx.fillStyle = '#8a6a3e'; ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    ctx.strokeStyle = '#6e5636'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-96, -18); ctx.quadraticCurveTo(0, 6, 96, -18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-60, -62); ctx.quadraticCurveTo(0, -30, 60, -62); ctx.stroke();
    ctx.restore();
    hairBundle(scx - 42, scy - 74, 0.78, f, 0.5);
    hairBundle(scx + 46, scy - 68, 0.7, f, 0.5);
    heroFig(px, 1562, 2.0, { preset: PHERI, expr: 'calm', armL: 'hold', armR: 'down', seed: 7, face: 0.4, walk: wph });
    twinkles(1080, 470, 380, 3, f);
  });
  fgStrip((CAM.cx - 1075) * 0.8, 118, 23);
});

// ===== H1 (370-425) WEIGHING SCALE close-up: bundle lands, needle swings, ₹5,000 =====
shot(370, 426, 0.26, { cx: 1080, cy: 1075, s: 1.24 }, { cx: 1080, cy: 1060, s: 1.34 }, (f) => {
  darkPlainBG();
  layer(1, () => {
    lampPool(1120, 330, 400, 0.30);
    D.drawBulb(ctx, 1120, 250, 0.95, f);
    sackFig(790, 1560, 1.1);
    heroFig(830, 1330, 1.5, { preset: TRADER, expr: 'smug', armR: 'hold', armL: 'down', seed: 11 });
    // needle: damped swing after the bundle lands at f384
    let ang = -1.85;
    if (f >= 384) { const dt = f - 384; ang = 0.55 - 2.4 * Math.exp(-dt / 10) * Math.cos(dt * 0.5); }
    dialScale(1120, 880, 1.0, ang);
    // the bundle: drops onto the pan f374-384, squash-settles, then rests
    let by = 1095, bs = 1.7;
    if (f < 384) { const p = D.clamp((f - 374) / 10, 0, 1); by = D.lerp(520, 1095, p * p); }
    else if (f < 394) { bs = 1.7 * (1 - 0.13 * Math.sin((f - 384) / 10 * Math.PI)); }
    hairBundle(1120, by, bs, f, 0.4);
    if (f >= 384 && f < 398) burst(1120, 1200, 384, f, 9, '#e8edef', 6);
    boardPop(f, 404, 1150, 450, 520, 150, [['₹5,000', 84]]);
  });
});

// ===== H2 (426-480) GODOWN: sacks stacked high, worker carries a sack, low track =====
shot(426, 481, 0.30, { cx: 880, cy: 1250, s: 0.95 }, { cx: 1180, cy: 1240, s: 1.0 }, (f, u) => {
  layer(0.3, () => {
    skyRect('#241a10', '#150d06');
    for (const sx of [420, 1080, 1740]) {
      ctx.fillStyle = '#1d130a'; ctx.fillRect(sx - 195, 330, 390, 1010);
      ctx.strokeStyle = 'rgba(160,120,70,0.25)'; ctx.lineWidth = 3;
      for (let ly = 376; ly < 1330; ly += 46) { ctx.beginPath(); ctx.moveTo(sx - 195, ly); ctx.lineTo(sx + 195, ly); ctx.stroke(); }
      ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.strokeRect(sx - 195, 330, 390, 1010);
    }
    lampPool(600, 420, 330, 0.34); lampPool(1560, 420, 330, 0.34);
    D.drawBulb(ctx, 600, 385, 1.0, f); D.drawBulb(ctx, 1560, 385, 1.0, f);
  });
  layer(0.65, () => {
    groundBand(1300, '#3a2812', '#201405', '#120a04');
    sackPile(420, 1580, 3, 3); sackPile(1760, 1580, 3, 9);
  });
  layer(1, () => {
    sackPile(620, 1660, 2, 5); sackPile(1500, 1660, 2, 13);
    const wx = D.lerp(700, 1250, u), wph = (f * 0.055) % 1;
    heroFig(wx, 1580, 2.0, { preset: WORKER, expr: 'calm', armR: 'catch', armL: 'down', seed: 14, walk: wph });
    sackFig(wx + 148, 975, 1.05);
    ctx.fillStyle = 'rgba(190,150,95,0.30)';
    const dp = (wph * 2) % 1;
    D.ell(ctx, wx - 36, 1586, 26 * (0.5 + dp * 0.8), 7); ctx.fill();
  });
});

// ===== H3 (481-530) TRUCK LOADING at dusk: bundles tossed into the hold =====
shot(481, 531, 0.22, { cx: 1080, cy: 1180, s: 0.85 }, { cx: 1080, cy: 1160, s: 0.92 }, (f) => {
  layer(0.3, () => {
    skyRect('#8a5570', '#d98a4e');
    lampPool(560, 690, 430, 0.5);
    D.circ(ctx, 560, 690, 68); ctx.fillStyle = '#ffca7a'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,190,90,0.6)'; ctx.lineWidth = 5; ctx.stroke();
    cloudFig(1300 + f * 0.2, 300, 1.1, 0.35);
    ctx.globalAlpha = 0.35;
    farHouse(300, 1330, 320, 200, '#7a4a3a');
    farHouse(1880, 1330, 360, 220, '#7a4a3a');
    ctx.globalAlpha = 1;
  });
  layer(0.65, () => { groundBand(1330, '#8a5a30', '#5d3a16', '#4a2c10'); });
  layer(1, () => {
    truckFig(1080, 1470, 1.55);
    if (f >= 503) hairBundle(590, 1090, 0.8, f, 0.4);
    heroFig(680, 1570, 1.35, { preset: WORKER2, expr: 'calm', armL: 'up', armR: 'up', seed: 16 });
    // bundles arcing from his hands into the open hold, two staggered loops
    for (let k = 0; k < 2; k++) {
      const p = ((f - 481 + k * 16) % 32) / 32;
      const ax = D.lerp(700, 600, p), ay = D.lerp(1030, 1206, p) - Math.sin(p * Math.PI) * 130;
      hairBundle(ax, ay, 0.92, f, 0.5);
    }
    grassTuft(420, 1660, 1.2, 41); grassTuft(1750, 1680, 1.3, 43);
  });
  fgStrip((CAM.cx - 1080) * 1.2 + f * 1.2, 34, 31);
});

// ===== T1 (531-618) TIRUPATI: gopuram wide, crowd of devotees, slow push-in =====
shot(531, 619, 0.16, { cx: 1080, cy: 1090, s: 0.62 }, { cx: 1080, cy: 1075, s: 0.78 }, (f) => {
  layer(0.3, () => {
    skyRect('#f6cf8a', '#e8a558');
    lampPool(420, 300, 520, 0.5);
    D.circ(ctx, 420, 300, 66); ctx.fillStyle = '#ffd98a'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,190,90,0.6)'; ctx.lineWidth = 5; ctx.stroke();
    cloudFig(900 + f * 0.25, 210, 1.0, 0.45);
    cloudFig(1700 + f * 0.18, 330, 0.8, 0.38);
    const flap = Math.sin(f * 0.35) * 4;
    birdFig(700 + f * 0.9, 380, 1.0, flap);
    birdFig(830 + f * 0.9, 340, 0.8, -flap);
  });
  layer(0.65, () => {
    groundBand(1330, '#caa26a', '#9a743e', '#7a5a28');
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i % 2 ? '#d9b98c' : '#c7a26a';
      ctx.fillRect(300, 1336 + i * 38, 1560, 38);
      ctx.fillStyle = 'rgba(120,86,40,0.5)'; ctx.fillRect(300, 1336 + i * 38, 1560, 6);
    }
  });
  layer(1, () => {
    gopuram(1080, 1340, 1.0);
    flagFig(560, 1425, 330, f);
    flagFig(1600, 1425, 330, f, '#c0272d');
    for (let i = 0; i < 12; i++) {
      const cx = 520 + i * 95 + (hash(i * 3.1) - 0.5) * 30;
      const cy = 1440 + (i % 3) * 58, cs = 0.62 + hash(i * 7.7) * 0.22;
      if (i % 2) maaFig(cx, cy, cs, { expr: 'calm', seed: 20 + i });
      else heroFig(cx, cy, cs, { preset: i % 4 === 1 ? PHERI : GREENC, expr: 'calm', seed: 20 + i });
      if (i % 3 === 0) hairBundle(cx + 16, cy - 185 * cs, 0.55, f, 0.5);
    }
  });
  fgStrip((CAM.cx - 1080) * 1.5, 30, 37);
}, [531]);

// ===== T2 (619-705) NILAMI: auctioneer, bidder hands rise, count-up to ₹84,314 =====
shot(619, 706, 0.28, { cx: 1080, cy: 1120, s: 1.0 }, { cx: 1080, cy: 1100, s: 1.08 }, (f) => {
  layer(0.3, () => {
    skyRect('#2e1c0e', '#170d05');
    for (const px of [330, 1730]) {
      ctx.fillStyle = '#3a2412'; ctx.fillRect(px, 300, 100, 1040);
      ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.strokeRect(px, 300, 100, 1040);
    }
    lampPool(700, 330, 310, 0.30); lampPool(1460, 330, 310, 0.30);
    D.drawBulb(ctx, 700, 305, 0.9, f); D.drawBulb(ctx, 1460, 305, 0.9, f);
  });
  layer(0.65, () => { groundBand(1300, '#3d2812', '#211305', '#120a04'); });
  layer(1, () => {
    // auction board with live count-up (slams in at f620, settles at f668)
    const pop = spring((f - 620) / 11);
    const val = f < 620 ? 40000 : Math.round(D.lerp(40000, 84314, D.ease(D.clamp((f - 620) / 48, 0, 1))));
    boardText(1140, 430, 800, 240, pop, [['₹' + inr(val), 96], ['/ KILO', 48, '#f5ecd7']], f >= 668 ? 0.4 + 0.25 * Math.sin(f * 0.22) : 0.25);
    burst(1140, 430, 620, f, 12, '#ffd23f', 8);
    burst(1140, 430, 668, f, 14, '#ffd23f', 9);
    // platform + auctioneer (landlord rig) with gavel
    ctx.fillStyle = '#6e4525'; D.rr(ctx, 640, 1400, 380, 46, 6); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    landlordFig(830, 1402, 2.1, { expr: 'angry', armR: 'point', armL: 'down', seed: 6, shout: f < 668 ? 0.45 + 0.4 * Math.sin(f * 0.55) : 0.15 });
    ctx.save(); ctx.translate(1102 + Math.sin(f * 0.7) * 10, f >= 668 && f < 674 ? 802 : 772); ctx.rotate(f >= 668 && f < 674 ? 0.5 : -0.3);
    ctx.fillStyle = '#8a5a2a'; ctx.fillRect(-4, -6, 54, 11);
    D.rr(ctx, 40, -15, 23, 30, 5); ctx.fillStyle = '#6e4525'; ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
    if (f >= 668 && f < 682) burst(1108, 800, 668, f, 8, '#e8b23a', 6);
    // bidders: arms shoot up one by one, paddles in hand
    const paddle = (px, py, num, at) => {
      if (f < at) return;
      ctx.save(); ctx.translate(px, py); ctx.rotate(Math.sin(f * 0.2 + px) * 0.05);
      ctx.fillStyle = '#5d4632'; ctx.fillRect(-4, 8, 8, 32);
      D.rr(ctx, -27, -54, 54, 66, 6); ctx.fillStyle = '#f5ecd7'; ctx.fill();
      ctx.strokeStyle = D.OUT; ctx.lineWidth = 3.5; ctx.stroke();
      text(num, 0, -20, 34, '#26221f');
      ctx.restore();
      burst(px, py - 30, at, f, 7, '#ffd23f', 6);
    };
    heroFig(740, 1630, 1.9, { preset: GREENC, expr: f >= 636 ? 'shocked' : 'calm', armR: f >= 636 ? 'up' : 'down', armL: 'down', seed: 21 });
    paddle(862, 838, '7', 636);
    heroFig(1080, 1675, 2.0, { preset: TRADER, expr: f >= 650 ? 'shocked' : 'calm', armL: f >= 650 ? 'up' : 'down', armR: 'down', seed: 22 });
    paddle(952, 844, '3', 650);
    heroFig(1400, 1630, 1.9, { preset: MM2P, expr: f >= 662 ? 'shocked' : 'calm', armR: f >= 662 ? 'up' : 'down', armL: 'down', seed: 23 });
    paddle(1522, 838, '9', 662);
  });
}, [620]);

// ===== W1 (706-775) 97 TONNE: a mountain of hair, crane camera descending =====
shot(706, 776, 0.30, { cx: 1080, cy: 800, s: 0.78 }, { cx: 1080, cy: 1060, s: 0.92 }, (f) => {
  layer(0.3, () => {
    skyRect('#2a2016', '#171008');
    for (const wx of [480, 1080, 1680]) {
      ctx.fillStyle = 'rgba(255,220,150,0.07)';
      D.poly(ctx, [[wx - 90, 150], [wx + 90, 150], [wx + 200, 920], [wx - 20, 920]]); ctx.fill();
      D.rr(ctx, wx - 90, 118, 180, 128, 6); ctx.fillStyle = 'rgba(255,230,170,0.20)'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,230,170,0.35)'; ctx.lineWidth = 3; ctx.stroke();
    }
  });
  layer(0.65, () => { groundBand(1330, '#38260f', '#1d1206', '#0f0803'); });
  layer(1, () => {
    sackFig(590, 1590, 1.15); sackFig(1570, 1590, 1.15);
    for (let i = 0; i < 9; i++) hairBundle(640 + i * 110, 1565, 1.5, f, 0.35);
    for (let i = 0; i < 7; i++) hairBundle(720 + i * 108, 1445, 1.4, f, 0.35);
    for (let i = 0; i < 6; i++) hairBundle(810 + i * 108, 1335, 1.3, f, 0.35);
    for (let i = 0; i < 4; i++) hairBundle(915 + i * 110, 1240, 1.2, f, 0.35);
    hairBundle(1080, 1150, 1.15, f, 0.4);
    heroFig(1080, 1135, 1.15, { preset: WORKER, expr: 'calm', armR: 'hold', armL: 'down', seed: 25 });
    hairBundle(1096, 942, 0.8, f, 0.4);
    boardPop(f, 730, 1080, 400, 900, 230, [['97 TONNE', 88], ['= ₹119.5 CRORE', 74]]);
  });
}, [706]);

// ===== W2 (776-846) WAREHOUSE floor: workers push trolleys past the mountain =====
shot(776, 847, 0.30, { cx: 860, cy: 1230, s: 0.98 }, { cx: 1200, cy: 1220, s: 1.02 }, (f, u) => {
  layer(0.3, () => {
    skyRect('#241a10', '#150d06');
    lampPool(600, 420, 330, 0.32); lampPool(1560, 420, 330, 0.32);
    D.drawBulb(ctx, 600, 385, 1.0, f); D.drawBulb(ctx, 1560, 385, 1.0, f);
  });
  layer(0.5, () => {
    ctx.fillStyle = '#1f1407';
    D.poly(ctx, [[700, 1500], [1000, 950], [1250, 815], [1500, 950], [1800, 1500]]); ctx.fill();
    ctx.globalAlpha = 0.5; ctx.fillStyle = '#120a04';
    for (let i = 0; i < 8; i++) { D.circ(ctx, 830 + i * 105, 1080 - Math.sin(i / 7 * Math.PI) * 190, 52); ctx.fill(); }
    ctx.globalAlpha = 1;
  });
  layer(0.65, () => { groundBand(1300, '#33220f', '#1c1106', '#0f0803'); });
  layer(1, () => {
    sackPile(600, 1620, 2, 7);
    trolleyFig(1380, 1505, 1.1);
    heroFig(1230, 1495, 1.7, { preset: WORKER2, expr: 'calm', armL: 'hold', armR: 'down', seed: 26 });
    const wx = D.lerp(760, 1180, u);
    heroFig(wx, 1560, 1.9, { preset: WORKER, expr: 'calm', armL: 'hold', armR: 'hold', seed: 27, walk: (f * 0.055) % 1 });
    trolleyFig(wx + 250, 1585, 1.3);
  });
});

// ===== DA1 (847-905) DAAN: temple steps, rows of seated devotees, barbers at work =====
shot(847, 906, 0.18, { cx: 900, cy: 1120, s: 0.85 }, { cx: 1180, cy: 1110, s: 0.9 }, (f) => {
  layer(0.3, () => {
    skyRect('#f6cf8a', '#eda95e');
    lampPool(430, 300, 490, 0.5);
    D.circ(ctx, 430, 300, 64); ctx.fillStyle = '#ffd98a'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,190,90,0.6)'; ctx.lineWidth = 5; ctx.stroke();
    cloudFig(1100 + f * 0.2, 200, 0.9, 0.4);
    ctx.globalAlpha = 0.5; gopuram(1780, 1300, 0.42); ctx.globalAlpha = 1;
  });
  layer(0.65, () => {
    groundBand(1290, '#caa26a', '#9a743e', '#7a5a28');
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 ? '#d9b98c' : '#cda96e';
      ctx.fillRect(240, 1310 + i * 92, 1680, 92);
      ctx.fillStyle = 'rgba(120,86,40,0.5)'; ctx.fillRect(240, 1310 + i * 92, 1680, 7);
    }
  });
  layer(1, () => {
    heroFig(655, 1345, 1.25, { preset: WHITEC, expr: 'calm', armR: 'hold', armL: 'down', seed: 37 });
    heroFig(1455, 1440, 1.25, { preset: WHITEC, expr: 'calm', armR: 'hold', armL: 'down', seed: 38, face: -0.4 });
    seatedFig(760, 1410, 0.95, { shirt: '#c96f3f', shirtD: '#a8562f', seed: 31 });
    seatedFig(1150, 1410, 0.9, { shirt: '#3f9e4d', shirtD: '#2e7a38', seed: 32 });
    seatedFig(950, 1505, 1.0, { shirt: '#2e7cd6', shirtD: '#2568b5', seed: 33 });
    seatedFig(1350, 1505, 0.95, { shirt: '#7a4a8c', shirtD: '#5d3868', seed: 34 });
    seatedFig(720, 1600, 1.05, { shirt: '#b8a888', shirtD: '#9a8a68', seed: 35 });
    seatedFig(1240, 1600, 1.0, { shirt: '#8a3324', shirtD: '#6e271c', seed: 36 });
    basketFig(860, 1432, 0.8, 1, f);
    basketFig(1300, 1527, 0.85, 2, f);
    maaFig(1500, 1565, 1.5, { expr: 'calm', armR: 'hold', armL: 'down', seed: 39 });
    basketFig(1415, 1592, 1.1, 2, f);
  });
  fgStrip((CAM.cx - 900) * 1.6, 26, 39);
});

// ===== DA2 (906-961) BARBER close: fresh-cut bundle into the basket =====
shot(906, 962, 0.22, { cx: 1030, cy: 1100, s: 1.2 }, { cx: 1050, cy: 1085, s: 1.3 }, (f) => {
  layer(0.3, () => {
    skyRect('#f2c078', '#e09a52');
    lampPool(1050, 520, 720, 0.5);
  });
  layer(0.65, () => {
    groundBand(1420, '#caa26a', '#9a743e', '#7a5a28');
    ctx.fillStyle = 'rgba(120,86,40,0.55)'; ctx.fillRect(300, 1412, 1560, 10);
  });
  layer(1, () => {
    // rig note: drawHeroSitting's torso poly is unscaled, so at s=1.7 the head
    // floats ~112px above the torso — patch the missing upper-torso band first
    ctx.save(); ctx.translate(1200, 1444);
    D.poly(ctx, [[-43, -124], [43, -124], [37, -214], [-37, -214]]);
    ctx.fillStyle = '#c96f3f'; ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.restore();
    seatedFig(1200, 1580, 1.7, { shirt: '#c96f3f', shirtD: '#a8562f', expr: 'calm', seed: 41, armMode: 'knees' });
    heroFig(880, 1520, 2.0, { preset: WHITEC, expr: 'calm', armR: 'hold', armL: 'down', seed: 42 });
    hairBundle(908, 1162, 1.15, f, 0.5);
    ctx.save(); ctx.translate(765, 1130); ctx.rotate(0.3);
    D.rr(ctx, -6, -28, 12, 36, 4); ctx.fillStyle = '#c9d1d5'; ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 3; ctx.stroke();
    D.rr(ctx, -5, 8, 10, 19, 4); ctx.fillStyle = '#5d4632'; ctx.fill(); ctx.stroke();
    ctx.restore();
    const fillN = 1 + (f > 924 ? 1 : 0) + (f > 942 ? 1 : 0);
    basketFig(1380, 1600, 1.25, fillN, f);
  });
});

// ===== F1 (962-1008) WIG FACTORY: conveyor of wig heads, tracking along the line =====
shot(962, 1009, 0.30, { cx: 850, cy: 1150, s: 1.0 }, { cx: 1150, cy: 1140, s: 1.05 }, (f) => {
  layer(0.3, () => {
    skyRect('#3d434c', '#24282e');
    for (const wx of [480, 1080, 1680]) {
      D.rr(ctx, wx - 110, 240, 220, 300, 6); ctx.fillStyle = 'rgba(200,225,245,0.13)'; ctx.fill();
      ctx.strokeStyle = 'rgba(200,225,245,0.25)'; ctx.lineWidth = 3; ctx.stroke();
      lampPool(wx, 340, 270, 0.26);
    }
  });
  layer(0.65, () => { groundBand(1340, '#4a4640', '#2c2a26', '#1c1a17'); });
  layer(1, () => {
    heroFig(650, 1305, 1.8, { preset: WORKER2, expr: 'calm', armR: 'hold', armL: 'down', seed: 44 });
    heroFig(1150, 1305, 1.8, { preset: TRADER, expr: 'calm', armL: 'hold', armR: 'down', seed: 45 });
    heroFig(1390, 1305, 1.8, { preset: WHITEC, expr: 'calm', armR: 'hold', armL: 'down', seed: 46 });
    // machine body + belt + legs + control panel
    ctx.fillStyle = '#2a2d31';
    ctx.fillRect(300, 1320, 26, 130); ctx.fillRect(1067, 1320, 26, 130); ctx.fillRect(1834, 1320, 26, 130);
    D.rr(ctx, 140, 1190, 1880, 130, 10); ctx.fillStyle = '#33373d'; ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    D.rr(ctx, 140, 1170, 1880, 26, 8); ctx.fillStyle = '#22252a'; ctx.fill(); ctx.stroke();
    for (let rx = 160; rx < 2000; rx += 62) { ctx.fillStyle = 'rgba(255,210,63,0.4)'; ctx.fillRect(rx, 1242, 30, 10); }
    D.rr(ctx, 905, 1252, 140, 56, 6); ctx.fillStyle = '#22252a'; ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 3; ctx.stroke();
    D.circ(ctx, 938, 1280, 9); ctx.fillStyle = '#57e389'; ctx.fill();
    D.circ(ctx, 978, 1280, 9); ctx.fillStyle = '#e0393e'; ctx.fill();
    D.circ(ctx, 1018, 1280, 9); ctx.fillStyle = '#ffd23f'; ctx.fill();
    // wig heads riding the belt
    const cols = ['#1d1712', '#5a3a1a', '#c9a227', '#3a2410'];
    for (let k = 0; k < 7; k++) {
      const hx = 260 + ((k * 300 + (f - 962) * 3.2) % 1860);
      wigHead(hx, 1173, 1.6, cols[k % 4]);
    }
  });
});

// ===== F2 (1009-1055) finished wigs on stands + EXPORT carton stamp =====
shot(1009, 1056, 0.30, { cx: 1080, cy: 1120, s: 1.05 }, { cx: 1080, cy: 1100, s: 1.12 }, (f) => {
  layer(0.3, () => {
    skyRect('#33383f', '#202329');
    lampPool(740, 420, 380, 0.22); lampPool(1420, 420, 380, 0.22);
  });
  layer(0.65, () => { groundBand(1340, '#45423c', '#2a2825', '#1a1815'); });
  layer(1, () => {
    wigStand(740, 1560, 2.0, '#1d1712');
    wigStand(1420, 1560, 2.0, '#7a4a21');
    heroFig(1080, 1570, 2.0, { preset: WORKER, expr: 'calm', armL: 'hold', armR: 'hold', seed: 47 });
    cartonFig(1080, 1600, 330, 215);
    if (f >= 1028) {
      ctx.save(); ctx.translate(1080, 1505); ctx.rotate(-0.08); ctx.scale(spring((f - 1028) / 8), spring((f - 1028) / 8));
      text('EXPORT', 0, 0, 62, '#c0272d');
      ctx.restore();
      burst(1080, 1505, 1028, f, 8, '#c0272d', 6);
    }
    twinkles(740, 1250, 120, 3, f);
    twinkles(1420, 1250, 120, 3, f);
  });
});

// ===== G1 (1056-1105) ₹190 CRORE: board room, the big count-up =====
shot(1056, 1106, 0.30, { cx: 1080, cy: 1100, s: 1.0 }, { cx: 1080, cy: 1080, s: 1.06 }, (f, u) => {
  darkPremiumBG();
  layer(1, () => {
    D.drawNote(ctx, 640, 905, 0.2 + Math.sin(f * 0.1) * 0.05, 1.1);
    D.drawNote(ctx, 1520, 955, -0.15 + Math.sin(f * 0.09 + 2) * 0.05, 1.1);
    for (const px of [690, 1470]) {
      for (let i = 0; i < 5; i++) {
        if (i < 1 + Math.floor(u * 4.99)) D.drawCoin(ctx, px + (i % 2) * 38 - 19, 1568 - i * 23, 31, f + i * 13);
      }
    }
    const pop = spring((f - 1056) / 11);
    const n = f < 1062 ? 0 : Math.round(190 * D.ease(D.clamp((f - 1062) / 36, 0, 1)));
    boardText(1080, 640, 840, 300, pop, [['₹' + n + ' CRORE', 112], ['SAAL KI BAAL-KAMAI', 38, '#f5ecd7']], 0.4 + 0.25 * Math.sin(f * 0.22));
    burst(1080, 640, 1056, f, 12, '#ffd23f', 8);
    twinkles(1080, 640, 430, 6, f);
  });
}, [1056]);

// ===== G2 (1106-1154) push-in on the ₹190 CRORE board, coins drifting down =====
shot(1106, 1155, 0.30, { cx: 1080, cy: 1020, s: 1.18 }, { cx: 1080, cy: 980, s: 1.34 }, (f) => {
  darkPremiumBG();
  layer(1, () => {
    boardText(1080, 640, 840, 300, 0.9, [['₹190 CRORE', 112], ['SAAL KI BAAL-KAMAI', 38, '#f5ecd7']], 0.45 + 0.25 * Math.sin(f * 0.22));
    for (let i = 0; i < 6; i++) {
      const cyy = 240 + ((hash(i * 7.3) * 1300 + (f - 1106) * (1.6 + hash(i * 3) * 1.2)) % 1350);
      ctx.globalAlpha = 0.9;
      D.drawCoin(ctx, 520 + hash(i * 13.1) * 1120, cyy, 23, f + i * 17);
    }
    ctx.globalAlpha = 1;
    for (const px of [760, 1400]) {
      for (let i = 0; i < 4; i++) D.drawCoin(ctx, px + (i % 2) * 36 - 18, 1620 - i * 22, 29, f + i * 11);
    }
    twinkles(1080, 640, 380, 5, f);
  });
});

// ===== CH1 (1155-1225) BEECH KA PAISA 1: woman (₹60) -> middleman #1 pockets a note =====
shot(1155, 1226, 0.28, { cx: 820, cy: 1130, s: 0.95 }, { cx: 1130, cy: 1120, s: 0.98 }, (f) => {
  darkPlainBG();
  layer(1, () => {
    maaFig(600, 1560, 1.9, { expr: 'speak', armR: 'offer', armL: 'down', seed: 9 });
    dullBoard(650, 1160, 320, 130, spring((f - 1155) / 11), [['₹60', 58], ['KE BARTAN', 27, '#b8ab98']]);
    landlordFig(1080, 1565, 1.9, { expr: 'stern', armL: 'cross', armR: 'cross', seed: 51 });
    if (f < 1172) hairBundle(628, 1252, 1.25, f, 0.5);
    else if (f < 1194) {
      const p = D.ease((f - 1172) / 22);
      hairBundle(D.lerp(628, 1010, p), D.lerp(1252, 1262, p) - Math.sin(p * Math.PI) * 42, 1.25, f, 0.5);
    } else hairBundle(1010, 1262, 1.25, f, 0.5);
    if (f >= 1200 && f < 1218) {
      const p = (f - 1200) / 18;
      ctx.save(); ctx.globalAlpha = 1 - p * 0.7;
      D.drawNote(ctx, D.lerp(1010, 1078, p), D.lerp(1185, 1152, p), 0.15, 0.85 - p * 0.5);
      ctx.restore();
    }
    burst(1080, 1150, 1210, f, 8, '#ffd23f', 6);
  });
}, [1155]);

// ===== CH2 (1226-1299) BEECH KA PAISA 2: middlemen pass it on, question board =====
shot(1226, 1300, 0.28, { cx: 1180, cy: 1120, s: 0.98 }, { cx: 1415, cy: 1110, s: 1.02 }, (f) => {
  darkPlainBG();
  layer(1, () => {
    landlordFig(1030, 1565, 1.9, { expr: 'stern', armL: 'cross', armR: 'cross', seed: 51 });
    heroFig(1440, 1560, 1.9, { preset: MM2P, expr: 'smug', armL: 'hold', armR: 'down', seed: 52 });
    heroFig(1750, 1560, 1.9, { preset: MM3P, expr: 'smug', armR: 'rub', armL: 'down', seed: 53 });
    if (f < 1228) hairBundle(980, 1262, 1.25, f, 0.5);
    else if (f < 1250) {
      const p = D.ease((f - 1228) / 22);
      hairBundle(D.lerp(980, 1412, p), D.lerp(1262, 1258, p) - Math.sin(p * Math.PI) * 42, 1.25, f, 0.5);
    } else if (f < 1270) hairBundle(1412, 1258, 1.25, f, 0.5);
    else if (f < 1292) {
      const p = D.ease((f - 1270) / 22);
      hairBundle(D.lerp(1412, 1718, p), D.lerp(1258, 1258, p) - Math.sin(p * Math.PI) * 42, 1.25, f, 0.5);
    } else hairBundle(1718, 1258, 1.25, f, 0.5);
    if (f >= 1254 && f < 1268) {
      const p = (f - 1254) / 14;
      ctx.save(); ctx.globalAlpha = 1 - p * 0.7;
      D.drawNote(ctx, D.lerp(1412, 1438, p), D.lerp(1190, 1155, p), -0.12, 0.85 - p * 0.5);
      ctx.restore();
    }
    burst(1750, 1150, 1294, f, 8, '#ffd23f', 6);
    boardPop(f, 1266, 1390, 640, 880, 230, [['BEECH KA PAISA', 70], ['KAHAAN GAYA?', 78]]);
    boardPop(f, 1288, 1660, 420, 520, 175, [['₹84,000', 78], ['/ KILO', 42, '#f5ecd7']]);
  });
});

// ===== AK (1300-1361) ASLI KHEL: narrator close-up, sly and confident =====
shot(1300, 1362, 0.30, { cx: 1080, cy: 1120, s: 1.05 }, { cx: 1080, cy: 1100, s: 1.12 }, (f) => {
  darkPlainBG();
  layer(1, () => {
    lampPool(1080, 900, 620, 0.25);
    boardPop(f, 1306, 1080, 400, 470, 135, [['ASLI KHEL', 74]]);
    heroFig(1080, 1660, 2.9, { expr: 'smug', wink: true, talk: true, armR: 'rub', armL: 'down', seed: 5 });
    twinkles(1080, 400, 260, 3, f);
  });
}, [1300]);

// ===== S1 (1362-1435) SONA: the locker opens, jewellery glows =====
shot(1362, 1436, 0.18, { cx: 980, cy: 1130, s: 0.92 }, { cx: 1060, cy: 1115, s: 1.0 }, (f) => {
  layer(0.3, () => {
    skyRect('#e8d9b8', '#d9bd8a');
    D.rr(ctx, 1300, 380, 260, 330, 8); ctx.fillStyle = '#fff3cf'; ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1430, 380); ctx.lineTo(1430, 710); ctx.moveTo(1300, 545); ctx.lineTo(1560, 545); ctx.stroke();
    lampPool(1430, 540, 300, 0.4);
    D.drawPlant(ctx, 560, 1420, 1.3, f);
  });
  layer(0.65, () => { groundBand(1420, '#b08c58', '#7a5a30', '#5d421e'); });
  layer(1, () => {
    const openU = D.ease(D.clamp((f - 1372) / 22, 0, 1));
    ctx.save(); ctx.translate(850, 1500);
    const sg = ctx.createLinearGradient(-195, 0, 195, 0);
    sg.addColorStop(0, '#8f979e'); sg.addColorStop(0.45, '#c9d1d5'); sg.addColorStop(1, '#767e84');
    D.rr(ctx, -195, -590, 390, 590, 10); ctx.fillStyle = sg; ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    if (openU > 0.02) {
      D.rr(ctx, -168, -562, 336, 534, 6); ctx.fillStyle = '#2c2118'; ctx.fill();
      lampPool(0, -300, 250, 0.55 * openU);
      ctx.fillStyle = 'rgba(201,209,213,0.5)'; ctx.fillRect(-168, -300, 336, 7);
      D.drawNecklace(ctx, -85, -428, 0.95, f);
      D.drawBangles(ctx, 92, -418, 0.9);
      D.drawCoin(ctx, -95, -205, 24, f); D.drawCoin(ctx, -52, -205, 24, f + 9); D.drawCoin(ctx, -74, -230, 24, f + 4);
      D.drawJewelBox(ctx, 0, -118, 1.2, openU, f);
    }
    ctx.save(); ctx.translate(-195, 0); ctx.rotate(-0.68 * openU);
    const dg = ctx.createLinearGradient(0, 0, 390, 0);
    dg.addColorStop(0, '#aeb6bb'); dg.addColorStop(1, '#8f979e');
    D.rr(ctx, 0, -590, 390, 590, 10); ctx.fillStyle = dg; ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    ctx.strokeStyle = 'rgba(70,76,82,0.6)'; ctx.lineWidth = 4;
    D.rr(ctx, 26, -562, 338, 240, 6); ctx.stroke();
    D.rr(ctx, 26, -290, 338, 240, 6); ctx.stroke();
    D.circ(ctx, 350, -295, 12); ctx.fillStyle = '#e8b23a'; ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
    ctx.restore();
    if (openU > 0.5) twinkles(850, 1180, 210, 5, f);
    maaFig(1250, 1520, 1.9, { expr: 'calm', armR: 'hold', armL: 'down', seed: 9 });
    D.drawJewelBox(ctx, 1272, 1212, 0.75, 0.8, f);
  });
}, [1362]);

// ===== S2 (1436-1508) KACHRA: she tosses the hair bundle into the dustbin =====
shot(1436, 1509, 0.20, { cx: 1120, cy: 1140, s: 0.95 }, { cx: 1080, cy: 1120, s: 1.02 }, (f) => {
  layer(0.3, () => {
    skyRect('#f0ba72', '#dd9450');
    ctx.fillStyle = '#e6cf9f'; ctx.fillRect(1150, 300, 960, 1200);
    ctx.fillStyle = '#c0453e';
    D.poly(ctx, [[1120, 310], [1560, 170], [2140, 310]]); ctx.fill();
    cloudFig(500 + f * 0.2, 230, 0.95, 0.4);
  });
  layer(0.65, () => { groundBand(1400, '#a5713a', '#77491f', '#5d3a12'); });
  layer(1, () => {
    doorFig(1490, 1560, 190, 430);
    if (f >= 1480) hairBundle(1150, 1492, 0.9, f, 0.3);
    const lidTilt = f >= 1480 && f < 1494 ? Math.sin((f - 1480) / 14 * Math.PI * 3) * (1 - (f - 1480) / 14) * 0.5 : 0;
    dustbinFig(1150, 1570, 1.3, lidTilt);
    if (f < 1462) {
      const wx = D.lerp(1560, 1310, D.ease(D.clamp((f - 1436) / 26, 0, 1)));
      const ph = ((f - 1436) * 0.055) % 1;
      const bob = walkingMaa(wx, 1565, 1.5, ph, { expr: 'calm', armR: 'offer', armL: 'down', seed: 9 });
      if (f < 1464) hairBundle(wx + 22, 1325 - bob * 0.5, 0.95, f, 0.6);
    } else {
      maaFig(1310, 1565, 1.5, { expr: 'sad', armR: 'down', armL: 'down', seed: 9 });
    }
    if (f >= 1464 && f < 1480) {
      const p = (f - 1464) / 16;
      hairBundle(D.lerp(1332, 1150, p), D.lerp(1325, 1478, p) - Math.sin(p * Math.PI) * 120, 0.95, f, 0.5);
    }
    boardPop(f, 1484, 1080, 430, 940, 230, [['SONA LOCKER ME…', 60], ['BLACK GOLD KACHRE ME', 60]]);
  });
});

// ===== E1 (1509-1614) ENDING: pheriwala at the door asks the viewer =====
shot(1509, 1615, 0.20, { cx: 1080, cy: 1130, s: 0.95 }, { cx: 1080, cy: 1110, s: 1.03 }, (f) => {
  layer(0.3, () => {
    skyRect('#f0ba72', '#dd9450');
    ctx.fillStyle = '#e6cf9f'; ctx.fillRect(560, 260, 1040, 1240);
    ctx.fillStyle = '#c0453e';
    D.poly(ctx, [[530, 270], [1080, 120], [1630, 270]]); ctx.fill();
    cloudFig(400 + f * 0.15, 240, 0.9, 0.4);
  });
  layer(0.65, () => { groundBand(1400, '#a5713a', '#77491f', '#5d3a12'); });
  layer(1, () => {
    doorFig(1080, 1585, 300, 660);
    bicycleFig(1380, 1595, 1.55);
    heroFig(1080, 1585, 2.2, { preset: PHERI, expr: 'calm', talk: true, armL: 'hold', armR: 'down', seed: 7 });
    steelPot(1049, 1218, 1.05, 1);
    steelPlate(1235, 1572, 0.95, 1);
    boardPop(f, 1545, 1080, 420, 880, 230, [['BARTAN LIYE THE…', 60], ['YA PAISE?', 86]]);
    if (f >= 1558) {
      burst(690, 720, 1558, f, 8, '#ffffff', 6);
      D.drawQuestion(ctx, 690, 720, 0.85, f);
    }
    grassTuft(620, 1650, 1.2, 53); grassTuft(1560, 1660, 1.3, 57);
  });
}, [1509]);

// ===== E2 (1615-1634) LOOP ECHO: the bundle close-up, hook glow behind =====
shot(1615, 1635, 0.34, { cx: 1080, cy: 1000, s: 1.08 }, { cx: 1080, cy: 990, s: 1.16 }, (f) => {
  darkPlainBG();
  layer(1, () => {
    ctx.save(); ctx.globalAlpha = 0.16;
    boardText(1080, 430, 820, 210, 1, BOARD_LINES, 0);
    ctx.restore();
    lampPool(1080, 1000, 500, 0.32 + 0.1 * Math.sin(f * 0.2));
    hairBundle(1080, 1000, 3.2, f, 0.8);
    twinkles(1080, 1000, 310, 6, f);
    hairFall(f, 8);
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
