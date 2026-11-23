// EP-9 INSURANCE AGENT — GULLAK FORMULA REMAKE (1888 frames @30fps, 62.9s).
// Simple 2D expressive characters (draw.js Gullak rig, lip-sync ENV se) +
// BHARRE hue rich scenes + saaf composition. Camera: har shot me move, shot <= 66f.
// Harness: window.ready, window.renderFrame(f), window.TOTAL — teeno apni alag line par.
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import * as D from './draw.js';
import { ENV } from './envelope.js';

const W = 1080, H = 1920, TOTAL = 1888, FPS = 30;
const GY = 2560; // floor line (world 2160x3840)
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const DEV_FONT = '"Noto Sans Devanagari"';
const fontReady = (async () => {
  try {
    const face = new FontFace('Noto Sans Devanagari', `url(data:font/ttf;base64,${DEVANAGARI_BOLD_B64})`, { weight: '700' });
    await face.load(); document.fonts.add(face);
    await document.fonts.load(`700 60px ${DEV_FONT}`, 'POLICY ₹5');
  } catch (e) { window.fontErr = String(e); }
})();

function text(str, x, y, px, color, align = 'center') {
  ctx.fillStyle = color; ctx.font = `700 ${px}px ${DEV_FONT}, sans-serif`;
  ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
}
function fitPx(str, px, maxW) {
  ctx.font = `700 ${px}px ${DEV_FONT}, sans-serif`;
  const w = ctx.measureText(str).width;
  return w > maxW ? Math.max(18, Math.floor(px * maxW / w)) : px;
}
function textF(str, x, y, px, color, maxW, align = 'center') { text(str, x, y, fitPx(str, px, maxW), color, align); }
function hash(n) { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }
const sstep = (u) => { u = D.clamp(u, 0, 1); return u * u * u * (u * (u * 6 - 15) + 10); };
const spring = (t) => D.clamp(D.easeOutBack(D.clamp(t, 0, 1)), 0, 1);
let GRAIN = null;
function grain(f) {
  if (!GRAIN) {
    GRAIN = document.createElement('canvas'); GRAIN.width = GRAIN.height = 256;
    const g = GRAIN.getContext('2d'); const im = g.createImageData(256, 256);
    for (let i = 0; i < im.data.length; i += 4) { const v = 110 + (Math.random() * 36 | 0); im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0);
  }
  ctx.save(); ctx.globalAlpha = 0.04; ctx.globalCompositeOperation = 'overlay';
  const ox = (f * 37) % 256, oy = (f * 53) % 256;
  for (let x = -ox; x < W; x += 256) for (let y = -oy; y < H; y += 256) ctx.drawImage(GRAIN, x, y);
  ctx.restore();
}
function lampPool(x, y, r, a = 0.4, col = '255,214,120') {
  const g = ctx.createRadialGradient(x, y, 10, x, y, r);
  g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g; D.circ(ctx, x, y, r); ctx.fill();
}
function vignette(a = 0.2) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createRadialGradient(540, 920, 460, 540, 920, 1120);
  g.addColorStop(0, 'rgba(60,30,4,0)'); g.addColorStop(1, `rgba(60,30,4,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function fxFlash(a) {
  if (a <= 0.003) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createRadialGradient(540, 880, 60, 540, 880, 1180);
  g.addColorStop(0, `rgba(255,246,214,${a})`); g.addColorStop(1, 'rgba(255,246,214,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function fxDark(a) {
  if (a <= 0.003) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = `rgba(10,8,20,${a})`; ctx.fillRect(0, 0, W, H);
}

// ---------------- camera / parallax (rot = Dutch tilt) ----------------
let CAM = { cx: 1080, cy: 1500, s: 0.62, rot: 0 }, SHK = { x: 0, y: 0 };
function layer(k, fn) {
  const cxk = 1080 + (CAM.cx - 1080) * k, cyk = 1250 + (CAM.cy - 1250) * k;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(W / 2 + SHK.x, H / 2 + SHK.y);
  if (CAM.rot) ctx.rotate(CAM.rot * (0.35 + 0.65 * k));
  ctx.scale(CAM.s, CAM.s);
  ctx.translate(-cxk, -cyk);
  fn();
}
const SHOTS = [];
function shot(a, b, vig, cam0, cam1, draw, hits = [], tr = {}) { SHOTS.push({ a, b, vig, cam0, cam1, draw, hits, tr }); }

// ---------------- lip-sync (ENV 1425 entries -> 1888 frames stretch) ----------------
function mouthAt(f) {
  const fi = f * (ENV.length - 1) / (TOTAL - 1);
  const i = Math.floor(fi), fr = fi - i;
  const a = ENV[Math.max(0, i - 1)] || 0, b = ENV[i] || 0, c = ENV[Math.min(ENV.length - 1, i + 1)] || 0;
  const v = (a + b * 2 + c) / 4 * (1 - fr) + ((b + (ENV[Math.min(ENV.length - 1, i + 2)] || 0)) / 2) * fr;
  return D.clamp((v - 0.04) * 1.55, 0, 1);
}
// character helper: blink + lip-sync + _t apne aap
function char(o, f, speak = false) {
  const oo = Object.assign({}, o, { _t: f, blink: D.blinkAt(f, o.seed || 1) });
  if (speak) oo.mouth = mouthAt(f);
  D.drawHero(ctx, oo);
}
const AGENT = { skin: '#f2b183', shirt: '#3f7fd1', shirtD: '#356cb3', pants: '#3c4b6b', hairC: '#2e2a33', seed: 3 };
const CUST = { skin: '#e8a06a', shirt: '#f07f1e', shirtD: '#d96f10', pants: '#efe3c8', hairC: '#3a3230', noTie: true, kurta: true, seed: 7 };
const OLD = { skin: '#eec39b', shirt: '#efe6d4', shirtD: '#ddd0b8', pants: '#8a7a5f', hairC: '#d7dce1', noTie: true, kurta: true, old: true, seed: 11 };
const WIFE = { skin: '#f0aa7e', shirt: '#e75480', shirtD: '#cf3f6d', pants: '#a8325c', hairC: '#241d20', female: true, noTie: true, seed: 5 };
const BETI = { skin: '#f6bd8d', shirt: '#ffd23f', shirtD: '#f0b81e', pants: '#7fb3e8', hairC: '#2e2a33', female: true, hairStyle: 'girl', noTie: true, seed: 9 };

// ---------------- shared pieces ----------------
function vgrad(y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  ctx.fillStyle = g; ctx.fillRect(-900, y0, 3960, y1 - y0);
}
function plate(x, y, w, h, str, px, col = '#ffd94d', bg = '#20242e') {
  ctx.fillStyle = bg; D.rr(ctx, x - w / 2, y - h / 2, w, h, 16); ctx.fill();
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 5; ctx.stroke();
  textF(str, x, y + 2, px, col, w - 36);
}
function goldBoard(x, y, w, h, lines, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  lampPool(0, 0, Math.max(w, h) * 0.95, 0.28);
  ctx.fillStyle = '#171208'; D.rr(ctx, -w / 2, -h / 2, w, h, 18); ctx.fill();
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 8; ctx.stroke();
  lines.forEach((ln, i) => {
    const yy = (i - (lines.length - 1) / 2) * (h / (lines.length + 0.4));
    textF(ln.t, 0, yy, ln.px, ln.c || '#ffd94d', w - 60);
  });
  ctx.restore();
}
function redBoard(x, y, w, h, lines, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.fillStyle = '#5d0f0a'; D.rr(ctx, -w / 2, -h / 2, w, h, 18); ctx.fill();
  ctx.strokeStyle = '#ffb3a0'; ctx.lineWidth = 7; ctx.stroke();
  lines.forEach((ln, i) => {
    const yy = (i - (lines.length - 1) / 2) * (h / (lines.length + 0.4));
    textF(ln.t, 0, yy, ln.px, ln.c || '#ffffff', w - 60);
  });
  ctx.restore();
}
function dust(f, cx, cy, spread, n = 14, a = 0.3) {
  ctx.fillStyle = `rgba(255,240,200,${a})`;
  for (let i = 0; i < n; i++) {
    const px = cx + (hash(i * 3.7) - 0.5) * spread + Math.sin(f * 0.02 + i) * 14;
    const py = cy + ((hash(i * 9.1) * 700 + f * (0.4 + hash(i * 5.3) * 0.5)) % 700) - 350;
    D.circ(ctx, px, py, 3 + hash(i * 7.7) * 3); ctx.fill();
  }
}
function lightCone(x, y0, y1, w0, w1, a = 0.10) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, `rgba(255,236,170,${a})`); g.addColorStop(1, 'rgba(255,236,170,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x - w0 / 2, y0); ctx.lineTo(x + w0 / 2, y0);
  ctx.lineTo(x + w1 / 2, y1); ctx.lineTo(x - w1 / 2, y1); ctx.closePath(); ctx.fill();
}

// ---------------- OFFICE ----------------
function clockDraw(x, y, r, f, spin = 1) {
  D.circ(ctx, x, y, r); ctx.fillStyle = '#fdfdf8'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = r * 0.09; ctx.stroke();
  ctx.strokeStyle = '#c2261b'; ctx.lineWidth = r * 0.05;
  D.circ(ctx, x, y, r * 0.86); ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2, r1 = r * 0.78, r2 = r * 0.88;
    ctx.strokeStyle = D.OUT; ctx.lineWidth = r * 0.045;
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); ctx.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2); ctx.stroke();
  }
  const ha = (f * 0.002 * spin) % (Math.PI * 2) - Math.PI / 2, ma = (f * 0.024 * spin) % (Math.PI * 2) - Math.PI / 2, sa = (f * 0.3 * spin) % (Math.PI * 2) - Math.PI / 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = D.OUT; ctx.lineWidth = r * 0.09;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ha) * r * 0.5, y + Math.sin(ha) * r * 0.5); ctx.stroke();
  ctx.lineWidth = r * 0.065;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ma) * r * 0.74, y + Math.sin(ma) * r * 0.74); ctx.stroke();
  ctx.strokeStyle = '#c2261b'; ctx.lineWidth = r * 0.03;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(sa) * r * 0.8, y + Math.sin(sa) * r * 0.8); ctx.stroke();
  D.circ(ctx, x, y, r * 0.07); ctx.fillStyle = '#c2261b'; ctx.fill();
}
function wallCalendar(x, y, w, h, flip = -1) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#fdfdf8'; D.rr(ctx, -w / 2, -h / 2, w, h, 10); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#c2261b'; D.rr(ctx, -w / 2, -h / 2, w, h * 0.24, 10); ctx.fill();
  ctx.fillRect(-w / 2, -h / 2 + h * 0.12, w, h * 0.12);
  text('2026', 0, -h * 0.38, h * 0.15, '#ffffff');
  ctx.fillStyle = 'rgba(40,40,60,0.55)';
  for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
    D.rr(ctx, -w / 2 + 18 + c * (w - 36) / 7, -h * 0.18 + r * h * 0.145, (w - 36) / 7 - 9, h * 0.1, 3); ctx.fill();
  }
  if (flip >= 0) { // palatta hua panna
    const ph = flip % 1, lift = Math.sin(ph * Math.PI);
    ctx.fillStyle = '#f4f1e4';
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h * 0.26); ctx.lineTo(w / 2, -h * 0.26);
    ctx.lineTo(w / 2 - lift * w * 0.2, -h * 0.26 - lift * h * 0.55);
    ctx.lineTo(-w / 2 + lift * w * 0.2, -h * 0.26 - lift * h * 0.55);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  }
  ctx.restore();
}
function shelfUnit(x, y, w, rows, seed) {
  const cols = ['#e2543e', '#f2b134', '#3f7fd1', '#57a773', '#9b5de5', '#ef6aa5', '#2ec4b6', '#f4842c'];
  for (let r = 0; r < rows; r++) {
    const sy = y + r * 150;
    let bx = x;
    while (bx < x + w - 60) {
      const bw = 54 + hash(seed + bx * 0.13 + r * 7) * 40, bh = 96 + hash(seed + bx * 0.31 + r * 3) * 26;
      ctx.fillStyle = cols[Math.floor(hash(seed + bx * 0.71 + r * 13) * cols.length)];
      D.rr(ctx, bx, sy - bh, bw, bh, 5); ctx.fill();
      ctx.strokeStyle = D.OUT; ctx.lineWidth = 3.5; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(bx + 8, sy - bh + 14, bw - 16, 16);
      bx += bw + 7;
    }
    ctx.fillStyle = '#8a5a24'; D.rr(ctx, x - 14, sy, w + 28, 20, 6); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  }
}
function officeWall(f, o = {}) {
  vgrad(-500, GY + 60, [[0, '#fbe7b6'], [0.55, '#f7d28a'], [1, '#eeb96a']]);
  // wainscot band
  ctx.fillStyle = '#dd9435'; ctx.fillRect(-900, 1980, 3960, GY + 60 - 1980);
  ctx.fillStyle = '#b96f1e'; ctx.fillRect(-900, 1980, 3960, 16);
  ctx.fillStyle = 'rgba(255,255,255,0.13)'; ctx.fillRect(-900, 1996, 3960, 10);
  // khidki (left) + roshni
  ctx.save();
  ctx.fillStyle = '#7a4b21'; D.rr(ctx, 150, 720, 560, 820, 14); ctx.fill();
  const wg = ctx.createLinearGradient(0, 740, 0, 1520);
  wg.addColorStop(0, '#bfe6ff'); wg.addColorStop(1, '#7fb8e8');
  ctx.fillStyle = wg; D.rr(ctx, 172, 742, 516, 776, 8); ctx.fill();
  ctx.fillStyle = '#fff3b0'; D.circ(ctx, 300, 880, 62); ctx.fill();
  ctx.fillStyle = 'rgba(122,75,33,0.9)'; ctx.fillRect(418, 742, 24, 776); ctx.fillRect(172, 1118, 516, 24);
  ctx.restore();
  lightCone(430, 1560, 2560, 480, 1150, 0.10);
  dust(f, 560, 1900, 620, 12, 0.28);
  // signboard — SURAKSHA INSURANCE
  ctx.save(); ctx.translate(1150, 545);
  ctx.fillStyle = 'rgba(90,50,10,0.25)'; D.rr(ctx, -640 + 14, -165 + 16, 1280, 330, 22); ctx.fill();
  ctx.fillStyle = '#1d4e79'; D.rr(ctx, -640, -165, 1280, 330, 22); ctx.fill();
  ctx.strokeStyle = '#f2b134'; ctx.lineWidth = 9; ctx.stroke();
  textF('SURAKSHA', 90, -52, 138, '#ffd94d', 880);
  textF('INSURANCE', 90, 78, 92, '#ffffff', 880);
  ctx.restore();
  // calendar + ghadi (right wall)
  wallCalendar(1835, 700, 300, 370);
  clockDraw(1835, 1180, 118, f, 1);
  // shelves (right)
  shelfUnit(1470, 1620, 560, 2, 4.2);
  // chhota photo frame (left of signboard)
  ctx.fillStyle = '#8a5a24'; D.rr(ctx, 120, 300, 210, 260, 8); ctx.fill();
  ctx.fillStyle = '#fdf3d0'; D.rr(ctx, 136, 316, 178, 228, 5); ctx.fill();
  D.drawHouse(ctx, 225, 458, 0.55);
  text('GHAR', 225, 348, 36, '#7a4b21');
  // floor
  vgrad(GY, 3900, [[0, '#c07f3d'], [1, '#96602a']]);
  ctx.strokeStyle = 'rgba(90,50,15,0.35)'; ctx.lineWidth = 5;
  for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(-900, GY + 90 + i * 165); ctx.lineTo(3060, GY + 90 + i * 165); ctx.stroke(); }
  ctx.fillStyle = 'rgba(70,35,5,0.5)'; ctx.fillRect(-900, GY - 8, 3960, 14);
  D.drawPlant(ctx, 215, GY + 30, 2.0, f);
}
function deskSet(f, o = {}) {
  // desk top + front panel; agent iske peeche, customer saamne
  ctx.fillStyle = 'rgba(80,40,5,0.20)'; D.ell(ctx, 1080, 2660, 830, 60); ctx.fill();
  ctx.fillStyle = '#8a5426'; D.rr(ctx, 300, 2130, 1560, 500, 18); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; D.rr(ctx, 300, 2130, 1560, 500, 18); ctx.stroke();
  ctx.strokeStyle = 'rgba(60,30,5,0.5)'; ctx.lineWidth = 5;
  for (const px of [560, 1080, 1600]) { D.rr(ctx, px - 210, 2200, 420, 360, 12); ctx.stroke(); }
  ctx.fillStyle = '#c07f3d'; D.rr(ctx, 272, 2072, 1616, 62, 14); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; D.rr(ctx, 272, 2072, 1616, 62, 14); ctx.stroke();
  // name plate
  plate(o.plateX || 1080, 2400, 520, 92, 'INSURANCE AGENT', 46, '#ffd94d', '#263238');
  // desk items (top = 2072)
  // ghanti (bell)
  if (o.bell !== false) { ctx.save(); ctx.translate(660, 2062); ctx.scale(1, 1);
  ctx.fillStyle = '#e8b93b'; D.ell(ctx, 0, 0, 52, 34); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4.5; ctx.stroke();
  D.circ(ctx, 0, -34, 13); ctx.fillStyle = '#e8b93b'; ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#b98a1d'; D.rr(ctx, -58, 2, 116, 12, 5); ctx.fill();
  ctx.restore();
  }
  // kagaz ka dher
  for (let i = 0; i < 3; i++) {
    ctx.save(); ctx.translate(1300 + i * 7, 2066 - i * 9); ctx.rotate((i - 1) * 0.05);
    ctx.fillStyle = '#fdfdf8'; D.rr(ctx, -95, -26, 190, 30, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(40,40,60,0.5)'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.restore();
  }
  // pen stand
  if (o.pens !== false) { ctx.fillStyle = '#37474f'; D.rr(ctx, 1478, 2012, 62, 60, 6); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  ctx.strokeStyle = '#c2261b'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(1492, 2014); ctx.lineTo(1484, 1968); ctx.stroke();
  ctx.strokeStyle = '#2e7cd6'; ctx.beginPath(); ctx.moveTo(1508, 2014); ctx.lineTo(1512, 1964); ctx.stroke();
  ctx.strokeStyle = '#2f9e44'; ctx.beginPath(); ctx.moveTo(1524, 2014); ctx.lineTo(1536, 1972); ctx.stroke();
  }
  // desk landline (simple, koi screen text nahi)
  ctx.save(); ctx.translate(430, 2044); ctx.rotate(-0.06);
  ctx.fillStyle = '#37474f'; D.rr(ctx, -52, -16, 104, 30, 8); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#263238'; D.rr(ctx, -58, -30, 116, 18, 9); ctx.fill(); ctx.stroke();
  D.circ(ctx, -40, -21, 7); ctx.fillStyle = '#e8b93b'; ctx.fill();
  D.circ(ctx, 40, -21, 7); ctx.fillStyle = '#e8b93b'; ctx.fill();
  ctx.restore();
}
function policyBoard(x, baseY, w, h, kind, pop = 1) {
  if (pop <= 0.01) return;
  ctx.save(); ctx.translate(x, baseY); ctx.scale(pop, pop);
  ctx.fillStyle = 'rgba(80,40,5,0.25)'; D.ell(ctx, 0, 6, w * 0.52, 20); ctx.fill();
  ctx.fillStyle = '#7a4b21'; ctx.fillRect(-w * 0.32, -26, 26, 30); ctx.fillRect(w * 0.32 - 26, -26, 26, 30);
  const g = ctx.createLinearGradient(0, -h, 0, 0);
  if (kind === 'crore') { g.addColorStop(0, '#4a97e0'); g.addColorStop(1, '#2e6cb5'); }
  else { g.addColorStop(0, '#ffd94d'); g.addColorStop(1, '#f2b134'); }
  ctx.fillStyle = g; D.rr(ctx, -w / 2, -h, w, h, 20); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 8; ctx.stroke();
  const dark = kind !== 'crore';
  textF(kind === 'crore' ? '₹1 CRORE' : '₹7 LAKH', 0, -h * 0.70, h * 0.30, dark ? '#3a2c07' : '#ffffff', w - 50);
  textF('COVER', 0, -h * 0.44, h * 0.15, dark ? 'rgba(58,44,7,0.75)' : 'rgba(255,255,255,0.85)', w - 80);
  // price chip
  const chipW = w * 0.62, chipH = h * 0.20;
  ctx.fillStyle = dark ? '#ffffff' : '#ffd94d'; D.rr(ctx, -chipW / 2, -h * 0.30, chipW, chipH, chipH / 2); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  textF(kind === 'crore' ? '₹4,000' : '₹15,000', 0, -h * 0.30 + chipH / 2, chipH * 0.58, dark ? '#c2261b' : '#5d3a06', chipW - 26);
  ctx.restore();
}
function coinPile(x, baseY, heights, f) {
  heights.forEach((n, ci) => {
    for (let i = 0; i < n; i++) D.drawCoin(ctx, x + ci * 74, baseY - 14 - i * 17, 31, f + ci * 3 + i);
  });
}
function notePile(x, baseY, n, label, labelCol = '#ffd94d') {
  for (let i = 0; i < n; i++) {
    const yy = baseY - i * 34;
    ctx.fillStyle = i % 2 ? '#7fb069' : '#8fbc74'; D.rr(ctx, x - 95, yy - 32, 190, 32, 5); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#e8f3d8'; ctx.fillRect(x - 16, yy - 32, 32, 32);
    ctx.strokeStyle = 'rgba(38,34,31,0.5)'; ctx.lineWidth = 2.5; ctx.strokeRect(x - 16, yy - 32, 32, 32);
  }
  if (label) plate(x, baseY + 66, 300, 76, label, 46, labelCol, '#263238');
}
function bigSheet(x, y, w, h, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  ctx.fillStyle = 'rgba(80,40,5,0.18)'; D.rr(ctx, -w / 2 + 10, -h / 2 + 14, w, h, 10); ctx.fill();
  ctx.fillStyle = '#fdfdf8'; D.rr(ctx, -w / 2, -h / 2, w, h, 10); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  textF(o.title || 'POLICY', 0, -h / 2 + h * 0.09, h * 0.085, '#546e7a', w - 70);
  ctx.strokeStyle = 'rgba(40,40,60,0.30)'; ctx.lineWidth = 4;
  const lines = o.lines || 7;
  for (let i = 0; i < lines; i++) {
    const yy = -h / 2 + h * 0.22 + i * (h * 0.68 / lines);
    if (o.hl === i) continue;
    ctx.beginPath(); ctx.moveTo(-w / 2 + 44, yy); ctx.lineTo(w / 2 - 44 - (i % 3) * 40, yy); ctx.stroke();
  }
  if (o.hl != null) {
    const yy = -h / 2 + h * 0.22 + o.hl * (h * 0.68 / lines);
    ctx.fillStyle = 'rgba(255,217,77,0.55)'; ctx.fillRect(-w / 2 + 30, yy - h * 0.045, w - 60, h * 0.09);
    ctx.strokeStyle = 'rgba(40,40,60,0.55)';
    ctx.beginPath(); ctx.moveTo(-w / 2 + 44, yy); ctx.lineTo(w / 2 - 60, yy); ctx.stroke();
    if (o.circle) {
      const cg = o.circle;
      ctx.strokeStyle = '#e01b12'; ctx.lineWidth = 9;
      D.ell(ctx, 0, yy, (w / 2 - 26) * cg, h * 0.075 * cg + 4); ctx.stroke();
    }
  }
  if (o.big) textF(o.big, 0, h * 0.30, h * 0.11, o.bigCol || '#c2261b', w - 56);
  ctx.restore();
}
function envelopeDraw(x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = '#fdfdf8'; D.rr(ctx, -70, -46, 140, 92, 6); ctx.fill();
  ctx.strokeStyle = '#c2261b'; ctx.lineWidth = 5; ctx.stroke();
  ctx.strokeStyle = 'rgba(40,40,60,0.45)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-70, -46); ctx.lineTo(0, 8); ctx.lineTo(70, -46); ctx.stroke();
  ctx.restore();
}

// ---------------- DREAM HOME ----------------
function dreamHome(f) {
  vgrad(-500, GY + 60, [[0, '#ffe3a1'], [0.6, '#ffd076'], [1, '#f7ae54']]);
  lampPool(1080, 1250, 1250, 0.35);
  // badi khidki + suraj
  ctx.fillStyle = '#8a5a24'; D.rr(ctx, 700, 420, 760, 620, 16); ctx.fill();
  const sg = ctx.createLinearGradient(0, 440, 0, 1020);
  sg.addColorStop(0, '#fff3b0'); sg.addColorStop(1, '#ffb85c');
  ctx.fillStyle = sg; D.rr(ctx, 722, 442, 716, 576, 10); ctx.fill();
  ctx.fillStyle = '#ffdf6b'; D.circ(ctx, 1080, 660, 105); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  D.ell(ctx, 880, 560, 90, 26); ctx.fill(); D.ell(ctx, 1300, 800, 110, 30); ctx.fill();
  ctx.fillStyle = '#8a5a24'; ctx.fillRect(1068, 442, 24, 576); ctx.fillRect(722, 718, 716, 24);
  lightCone(1080, 1060, 2560, 700, 1500, 0.13);
  // photo frame — parivaar
  ctx.fillStyle = '#7a4b21'; D.rr(ctx, 1400, 380, 360, 320, 10); ctx.fill();
  ctx.fillStyle = '#fdf3d0'; D.rr(ctx, 1418, 398, 324, 284, 6); ctx.fill();
  D.drawHouse(ctx, 1580, 590, 0.62);
  text('SAPNO KA GHAR', 1580, 452, 38, '#7a4b21');
  // sofa
  ctx.fillStyle = 'rgba(90,40,20,0.18)'; D.ell(ctx, 1080, 2540, 700, 52); ctx.fill();
  ctx.fillStyle = '#e75480'; D.rr(ctx, 480, 1980, 1200, 330, 60); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; D.rr(ctx, 480, 1980, 1200, 330, 60); ctx.stroke();
  ctx.fillStyle = '#f06a97'; D.rr(ctx, 520, 2240, 1120, 220, 50); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e75480'; D.rr(ctx, 430, 2160, 130, 330, 46); ctx.fill(); ctx.stroke();
  D.rr(ctx, 1600, 2160, 130, 330, 46); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffd23f'; D.rr(ctx, 620, 2060, 150, 150, 26); ctx.fill(); ctx.stroke();
  D.rr(ctx, 1390, 2060, 150, 150, 26); ctx.fill(); ctx.stroke();
  // lamp (right)
  ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 14;
  ctx.beginPath(); ctx.moveTo(1820, 2560); ctx.lineTo(1820, 1900); ctx.stroke();
  ctx.fillStyle = '#ffecb3'; D.poly(ctx, [[1760, 1900], [1880, 1900], [1850, 1760], [1790, 1760]]); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  lampPool(1820, 1860, 330, 0.5);
  // floor + rug
  vgrad(GY, 3900, [[0, '#d98a44'], [1, '#b06a2c']]);
  ctx.fillStyle = 'rgba(160,40,60,0.5)'; D.ell(ctx, 1080, 2920, 760, 110); ctx.fill();
  ctx.strokeStyle = 'rgba(255,220,150,0.5)'; ctx.lineWidth = 6; D.ell(ctx, 1080, 2920, 700, 96); ctx.stroke();
  D.drawPlant(ctx, 250, GY + 30, 2.0, f);
  // chamak (sparkles)
  for (let i = 0; i < 9; i++) {
    const sx = 300 + hash(i * 3.3) * 1560, sy = 500 + hash(i * 7.9) * 1500 + Math.sin(f * 0.03 + i * 2) * 22;
    D.drawSparkle(ctx, sx, sy, 16 + hash(i * 5.1) * 14, 0.45 + 0.4 * Math.sin(f * 0.06 + i * 1.7));
  }
  dust(f, 1080, 1700, 1500, 10, 0.22);
}
// ---------------- MIRROR / DOOR ----------------
function mirrorSet(f, expr, mixU) {
  vgrad(-500, GY + 60, [[0, '#f7dcae'], [1, '#eebd72']]);
  ctx.fillStyle = '#dd9435'; ctx.fillRect(-900, 1980, 3960, GY + 60 - 1980);
  vgrad(GY, 3900, [[0, '#c07f3d'], [1, '#96602a']]);
  shelfUnit(120, 1500, 480, 2, 8.6);
  shelfUnit(1560, 1500, 480, 2, 3.9);
  // sunahra frame
  const mx = 1080, my = 1180, mw = 940, mh = 1420;
  ctx.fillStyle = 'rgba(90,50,10,0.30)'; D.rr(ctx, mx - mw / 2 + 16, my - mh / 2 + 20, mw, mh, 30); ctx.fill();
  const mg = ctx.createLinearGradient(0, my - mh / 2, 0, my + mh / 2);
  mg.addColorStop(0, '#b8c7ce'); mg.addColorStop(0.5, '#dde7ea'); mg.addColorStop(1, '#93a8b1');
  ctx.fillStyle = mg; D.rr(ctx, mx - mw / 2, my - mh / 2, mw, mh, 26); ctx.fill();
  ctx.save();
  D.rr(ctx, mx - mw / 2, my - mh / 2, mw, mh, 26); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.20)';
  ctx.beginPath(); ctx.moveTo(mx - 420, my + mh / 2); ctx.lineTo(mx - 60, my - mh / 2); ctx.lineTo(mx + 130, my - mh / 2); ctx.lineTo(mx - 230, my + mh / 2); ctx.closePath(); ctx.fill();
  // frame ke andar agent (chehra viewer ki taraf)
  char(Object.assign({}, AGENT, {
    x: mx, y: my + 800, s: 2.35, expr, seed: 3,
    mix: mixU != null ? { e2: 'worried', u: mixU } : null,
    armL: 'down', armR: 'point',
  }), f, false);
  ctx.restore();
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 34; D.rr(ctx, mx - mw / 2, my - mh / 2, mw, mh, 26); ctx.stroke();
  ctx.strokeStyle = '#8a6d1f'; ctx.lineWidth = 6; D.rr(ctx, mx - mw / 2 - 22, my - mh / 2 - 22, mw + 44, mh + 44, 34); ctx.stroke();
}
function doorSet(f, u) {
  vgrad(-500, GY + 60, [[0, '#37304d'], [1, '#241f36']]);
  vgrad(GY, 3900, [[0, '#2c2438'], [1, '#191423']]);
  // halki khidki roshni (band kamra)
  ctx.fillStyle = '#454066'; D.rr(ctx, 240, 700, 420, 560, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(200,200,230,0.25)'; ctx.lineWidth = 6; D.rr(ctx, 240, 700, 420, 560, 12); ctx.stroke();
  ctx.fillRect(438, 700, 18, 560); ctx.fillRect(240, 962, 420, 18);
  // darwaza
  const dx = 1080, dy = 1560, dw = 640, dh = 1330;
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; D.ell(ctx, dx, dy + dh / 2 + 40, 430, 46); ctx.fill();
  ctx.fillStyle = '#4a3520'; D.rr(ctx, dx - dw / 2 - 34, dy - dh / 2 - 34, dw + 68, dh + 68, 18); ctx.fill();
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 7; ctx.stroke();
  const dg = ctx.createLinearGradient(0, dy - dh / 2, 0, dy + dh / 2);
  dg.addColorStop(0, '#7a5a30'); dg.addColorStop(1, '#5d4223');
  ctx.fillStyle = dg; D.rr(ctx, dx - dw / 2, dy - dh / 2, dw, dh, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(40,24,6,0.6)'; ctx.lineWidth = 6;
  D.rr(ctx, dx - dw / 2 + 52, dy - dh / 2 + 52, dw - 104, dh * 0.4, 10); ctx.stroke();
  D.rr(ctx, dx - dw / 2 + 52, dy + dh * 0.06, dw - 104, dh * 0.38, 10); ctx.stroke();
  D.circ(ctx, dx + dw / 2 - 84, dy + 40, 27); ctx.fillStyle = '#e8b93b'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  // chamakta "?"
  const pulse = 0.75 + 0.25 * Math.sin(f * 0.09);
  lampPool(dx, dy - 190, 330 * pulse, 0.5);
  ctx.save();
  ctx.shadowColor = 'rgba(255,210,80,0.95)'; ctx.shadowBlur = 46 * pulse;
  text('?', dx, dy - 200, 400, '#ffd94d');
  ctx.restore();
  D.drawPlant(ctx, 1820, GY + 20, 2.4, f);
}
// kagaz ke letters girna (shikayatein)
function letterRain(f, n = 12) {
  for (let i = 0; i < n; i++) {
    const fall = ((hash(i * 4.3) * 2600 + f * (2.2 + hash(i * 6.1) * 2.4)) % 2900);
    const ex = 240 + hash(i * 8.7) * 1680 + Math.sin(f * 0.03 + i * 2.2) * 36;
    envelopeDraw(ex, -300 + fall, 1.15, Math.sin(f * 0.02 + i) * 0.4);
  }
}

// ================= SHOTS =================
const AGT = { x: 1080, y: 2340, s: 2.0 };
const CUS = { x: 1640, y: 2800, s: 1.95 };
function officeStage(f, fn) { layer(0.85, () => officeWall(f)); layer(1, fn); }

// S1 hook — office wide, agent kursi par (viewer = agent)
shot(0, 50, 0.2, { cx: 1080, cy: 1640, s: 0.58 }, { cx: 1080, cy: 1580, s: 0.67 }, (f, u) => {
  officeStage(f, () => {
    char(Object.assign({}, AGENT, AGT, { expr: 'smug', armR: 'point', armL: 'down' }), f, true);
    deskSet(f);
  });
});
// S2 agent CU — bol raha hai, smug -> happy morph
shot(50, 99, 0.18, { cx: 1080, cy: 1700, s: 1.3 }, { cx: 1080, cy: 1680, s: 1.52 }, (f, u) => {
  officeStage(f, () => {
    char(Object.assign({}, AGENT, AGT, {
      expr: 'smug', mix: { e2: 'happy', u: D.clamp((f - 68) / 22, 0, 1) },
      armR: f < 74 ? 'point' : 'rub', armL: 'down',
    }), f, true);
    deskSet(f);
  });
});
// S3 niyam — commission ke sikke desk par badhte hue
shot(99, 150, 0.2, { cx: 1030, cy: 1720, s: 0.92 }, { cx: 1050, cy: 1700, s: 1.0 }, (f, u) => {
  officeStage(f, () => {
    char(Object.assign({}, AGENT, AGT, { expr: 'smug', armR: 'pointSide', armL: 'down' }), f, true);
    deskSet(f);
    coinPile(1330, 2072, [Math.ceil(5 * u) + 1, Math.ceil(8 * u) + 1], f);
  });
});
// S4 desk macro — do dher, labels pop
shot(150, 199, 0.22, { cx: 1170, cy: 1990, s: 1.25 }, { cx: 1180, cy: 1970, s: 1.42 }, (f, u) => {
  layer(1, () => {
    deskSet(f);
    coinPile(960, 2072, [7], f);
    coinPile(1380, 2072, [12], f);
    if (u > 0.2) { ctx.save(); ctx.translate(960, 2260); ctx.scale(spring((f - 160) / 12), spring((f - 160) / 12)); plate(0, 0, 280, 78, '₹4,000', 46); ctx.restore(); }
    if (u > 0.45) { ctx.save(); ctx.translate(1380, 2260); ctx.scale(spring((f - 172) / 12), spring((f - 172) / 12)); plate(0, 0, 320, 78, '₹15,000', 46, '#ff9d8a'); ctx.restore(); }
    if (u > 0.1) { ctx.save(); ctx.translate(1090, 1880); ctx.scale(spring((f - 155) / 12), spring((f - 155) / 12)); plate(0, 0, 520, 102, 'COMMISSION', 52); ctx.restore(); }
  });
});
// S5 customer aata hai
shot(199, 238, 0.2, { cx: 1080, cy: 1620, s: 0.6 }, { cx: 1080, cy: 1600, s: 0.63 }, (f, u) => {
  officeStage(f, () => {
    char(Object.assign({}, AGENT, AGT, { expr: 'calm', face: 0.4, look: 1, armR: 'desk', armL: 'desk' }), f, false);
    deskSet(f);
    const cx = D.lerp(2230, CUS.x, sstep(u));
    char(Object.assign({}, CUST, { x: cx, y: CUS.y, expr: 'puzzled', walk: u < 0.95 ? u * 3.4 : null, face: -0.4, look: -1 }), f, false);
  });
});
// S6 do boards pop
shot(238, 274, 0.2, { cx: 1075, cy: 1700, s: 0.78 }, { cx: 1075, cy: 1680, s: 0.84 }, (f, u) => {
  officeStage(f, () => {
    policyBoard(710, 2072, 500, 620, 'crore', spring((f - 240) / 13));
    policyBoard(1450, 2072, 500, 620, 'lakh', spring((f - 250) / 13));
    char(Object.assign({}, AGENT, AGT, { s: (AGT.s || 1) * 0.82, expr: 'happy', armR: 'pointSide', armL: 'pointSide' }), f, false);
    deskSet(f);
    char(Object.assign({}, CUST, CUS, { expr: 'puzzled', mix: { e2: 'surprise', u: D.clamp((f - 248) / 16, 0, 1) }, face: -0.3, look: -1 }), f, false);
  });
});
// S7 blue board hero — ₹1 CRORE / ₹4,000
shot(274, 326, 0.2, { cx: 1130, cy: 1570, s: 0.88 }, { cx: 1120, cy: 1550, s: 0.95 }, (f, u) => {
  officeStage(f, () => {
    char(Object.assign({}, AGENT, { x: 1500, y: 2340, s: 1.8 }, { expr: 'happy', armL: 'pointSide', armR: 'down', look: -1 }), f, true);
    deskSet(f, { bell: false });
    policyBoard(900, 2072, 600, 740, 'crore', 1);
  });
});
// S8 yellow board hero — ₹7 LAKH / ₹15,000 + sikke
shot(326, 376, 0.2, { cx: 950, cy: 1570, s: 0.88 }, { cx: 940, cy: 1550, s: 0.95 }, (f, u) => {
  officeStage(f, () => {
    char(Object.assign({}, AGENT, { x: 580, y: 2340, s: 1.8 }, { expr: 'smug', armR: 'rub', armL: 'down', look: 1 }), f, false);
    deskSet(f);
    coinPile(760, 2072, [11], f);
    policyBoard(1150, 2072, 600, 740, 'lakh', 1);
  });
});
// S9 "Kaunsi bechoge?" — dono boards, customer uljha
shot(376, 431, 0.2, { cx: 1075, cy: 1720, s: 0.8 }, { cx: 1075, cy: 1700, s: 0.86 }, (f, u) => {
  officeStage(f, () => {
    policyBoard(710, 2072, 500, 620, 'crore', 1);
    policyBoard(1450, 2072, 500, 620, 'lakh', 1);
    char(Object.assign({}, AGENT, AGT, { s: (AGT.s || 1) * 0.82, expr: 'puzzled', armR: 'shrug', armL: 'shrug' }), f, false);
    deskSet(f);
    char(Object.assign({}, CUST, CUS, { expr: 'puzzled', armR: 'scratch', face: -0.3, look: -1 }), f, false);
    ctx.fillStyle = '#ffffff'; D.circ(ctx, 1560, 1390, 80); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
    text('?', 1560, 1396, 110, '#c2261b');
  });
});
// S10 chunav — agent peela board kheenchta hai (hit 438)
shot(431, 485, 0.2, { cx: 1080, cy: 1700, s: 0.9 }, { cx: 1080, cy: 1670, s: 1.02 }, (f, u) => {
  officeStage(f, () => {
    policyBoard(760, 2072, 380, 560, 'crore', 1);
    const bx = D.lerp(1440, 1290, sstep(D.clamp((f - 436) / 16, 0, 1)));
    policyBoard(bx, 2072, 440, 620, 'lakh', 1);
    char(Object.assign({}, AGENT, AGT, { expr: 'smug', armR: 'point', armL: 'down' }), f, true);
    deskSet(f, { bell: false });
    char(Object.assign({}, CUST, CUS, { x: 1500, expr: 'surprise', face: -0.3, look: -1 }), f, false);
    if (f >= 438 && f < 452) for (let i = 0; i < 5; i++)
      D.drawSparkle(ctx, bx - 240 + hash(i * 3.1) * 480, 1560 + hash(i * 7.7) * 380, 20, 1 - (f - 438) / 14);
  });
}, [438]);
// S11 kagaz macro — ₹7,00,000 saaf likha hai
shot(485, 529, 0.22, { cx: 1080, cy: 1960, s: 1.5 }, { cx: 1080, cy: 1940, s: 1.65 }, (f, u) => {
  layer(1, () => {
    deskSet(f);
    bigSheet(1080, 1990, 940, 600, { title: 'POLICY', lines: 6, big: '₹7,00,000', rot: -0.03 });
    const lx = 1230 + Math.sin(u * Math.PI) * 60, ly = 1900;
    ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 12; D.circ(ctx, lx, ly, 125); ctx.stroke();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 14; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(lx + 95, ly + 95); ctx.lineTo(lx + 185, ly + 185); ctx.stroke();
    textF('7,00,000', lx, ly, 62, '#c2261b', 210);
  });
});
// S12 agent kagaz chhupata hai
shot(529, 572, 0.2, { cx: 1080, cy: 1720, s: 0.95 }, { cx: 1080, cy: 1700, s: 1.03 }, (f, u) => {
  officeStage(f, () => {
    char(Object.assign({}, AGENT, AGT, {
      expr: 'worried', mix: { e2: 'smug', u: D.clamp((f - 540) / 20, 0, 1) }, armR: 'desk', armL: 'desk',
    }), f, false);
    deskSet(f);
    const sx = D.lerp(1150, 700, sstep(u));
    if (u < 0.92) bigSheet(sx, 2020, 500, 320, { title: 'POLICY', lines: 4, rot: 0.04 });
    ctx.fillStyle = '#a5672f'; D.rr(ctx, 500, 1940, 430, 260, 10); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = '#8a5426'; ctx.fillRect(500, 2064, 430, 14);
    char(Object.assign({}, CUST, CUS, { x: 1500, expr: 'worried', sweat: true, face: -0.3, look: -1 }), f, false);
  });
});
// S13 SAPNA — dream ghar, parivaar khush
shot(572, 632, 0.14, { cx: 1080, cy: 1620, s: 0.6 }, { cx: 1080, cy: 1590, s: 0.67 }, (f, u) => {
  layer(1, () => {
    dreamHome(f);
    char(Object.assign({}, CUST, { x: 760, y: 2660, s: 1.9, expr: 'happy', armR: 'wave' }), f, false);
    char(Object.assign({}, WIFE, { x: 1420, y: 2660, s: 1.78, expr: 'happy' }), f, false);
    char(Object.assign({}, BETI, { x: 1090, y: 2790, s: 1.12, expr: 'happy', prop: 'book' }), f, false);
  });
}, [], { h: 'flash' });
// S14 dream close — beti + kitaab, "1 CRORE KA FUTURE"
shot(632, 691, 0.14, { cx: 1090, cy: 1800, s: 0.95 }, { cx: 1090, cy: 1770, s: 1.05 }, (f, u) => {
  layer(1, () => {
    dreamHome(f);
    char(Object.assign({}, CUST, { x: 760, y: 2700, s: 1.9, expr: 'happy' }), f, false);
    char(Object.assign({}, WIFE, { x: 1420, y: 2700, s: 1.78, expr: 'happy' }), f, false);
    char(Object.assign({}, BETI, { x: 1090, y: 2830, s: 1.45, expr: 'happy', prop: 'book' }), f, false);
    const pp = spring((f - 640) / 14);
    if (pp > 0.02) { ctx.save(); ctx.translate(1090, 980); ctx.scale(pp, pp); plate(0, 0, 920, 122, '₹1 CRORE KA FUTURE', 62); ctx.restore(); }
  });
});
// S15 sign — customer form par dastakhat
shot(691, 756, 0.2, { cx: 1250, cy: 2050, s: 1.05 }, { cx: 1260, cy: 2030, s: 1.14 }, (f, u) => {
  officeStage(f, () => {
    char(Object.assign({}, AGENT, { x: 990, y: 2340, s: 2.0 }, { expr: 'happy', armR: 'desk', armL: 'desk', look: 1 }), f, false);
    deskSet(f);
    char(Object.assign({}, CUST, { x: 1560, y: 2680, s: 1.8 }, {
      expr: 'calm', mix: { e2: 'happy', u: D.clamp((f - 720) / 25, 0, 1) },
      armR: 'sign', armL: 'hold', prop: 'pen', face: -0.2, look: -1,
    }), f, false);
    bigSheet(1440, 2560, 400, 300, { title: 'POLICY FORM', lines: 5, rot: 0.03 });
  });
});
// S16 sign macro — dastakhat banta hua
shot(756, 820, 0.22, { cx: 1500, cy: 2350, s: 1.7 }, { cx: 1500, cy: 2340, s: 1.85 }, (f, u) => {
  layer(1, () => {
    deskSet(f);
    bigSheet(1500, 2400, 560, 380, { title: 'POLICY FORM', lines: 5 });
    const n = Math.floor(u * 42);
    ctx.strokeStyle = '#263238'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const px = 1380 + i * 6.2, py = 2496 + Math.sin(i * 0.9) * 15 - (i > 30 ? (i - 30) * 2.2 : 0);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    const tx = 1380 + n * 6.2, ty = 2496 + Math.sin(n * 0.9) * 15 - (n > 30 ? (n - 30) * 2.2 : 0);
    ctx.save(); ctx.translate(tx, ty); ctx.rotate(0.5);
    ctx.fillStyle = '#274b8f'; D.rr(ctx, -8, -58, 16, 74, 6); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    D.poly(ctx, [[-8, 16], [8, 16], [0, 34]]); ctx.fillStyle = '#d9d9d9'; ctx.fill(); ctx.stroke();
    ctx.restore();
    D.circ(ctx, tx + 6, ty - 20, 24); ctx.fillStyle = '#f2b183'; ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    if (u > 0.9) {
      const cp = spring((f - 812) / 8);
      ctx.save(); ctx.translate(1650, 2260); ctx.scale(cp, cp);
      ctx.strokeStyle = '#2f9e44'; ctx.lineWidth = 13; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(-8, 26); ctx.lineTo(40, -28); ctx.stroke();
      ctx.restore();
    }
  });
});
// S17 file haath me — customer khush
shot(820, 865, 0.2, { cx: 1080, cy: 1620, s: 0.62 }, { cx: 1080, cy: 1600, s: 0.66 }, (f, u) => {
  officeStage(f, () => {
    char(Object.assign({}, AGENT, AGT, { expr: 'happy', armR: 'give', armL: 'give' }), f, false);
    deskSet(f);
    const fx = D.lerp(1210, 1560, sstep(u));
    ctx.save(); ctx.translate(fx, 2330); ctx.rotate(0.05);
    ctx.fillStyle = '#c98a3d'; D.rr(ctx, -120, -160, 240, 320, 10); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = '#fdfdf8'; D.rr(ctx, -88, -110, 176, 130, 5); ctx.fill(); ctx.stroke();
    text('POLICY', 0, -45, 40, '#546e7a');
    ctx.restore();
    char(Object.assign({}, CUST, CUS, { expr: 'happy', armR: 'hold', armL: 'hold', face: -0.3, look: -1 }), f, false);
  });
});
// S18 time-lapse — calendar panne + ghadi tez
shot(865, 931, 0.2, { cx: 1420, cy: 900, s: 1.05 }, { cx: 1440, cy: 920, s: 1.12 }, (f, u) => {
  layer(1, () => {
    officeWall(f);
    wallCalendar(1180, 980, 400, 480, (f - 865) * 0.14);
    clockDraw(1620, 950, 140, f, 16);
    ctx.fillStyle = `rgba(20,20,60,${0.10 + 0.10 * Math.sin(f * 0.11)})`;
    ctx.fillRect(-900, -500, 3960, 3060);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const yy = 400 + hash(i * 3.3) * 1500, xx = ((hash(i * 9.2) * 2400 + f * 30 * (0.6 + hash(i * 4.4))) % 2600) - 300;
      ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + 190, yy); ctx.stroke();
    }
  });
}, [], { h: 'flash' });
// S19 ghadi macro — "10 SAAL BAAD"
shot(931, 998, 0.22, { cx: 1080, cy: 1050, s: 1.35 }, { cx: 1080, cy: 1030, s: 1.5 }, (f, u) => {
  layer(1, () => {
    vgrad(-500, 2600, [[0, '#8a6a42'], [1, '#5d4223']]);
    const cx = 1080, cy = 980, r = 400, e = sstep(u);
    D.circ(ctx, cx, cy, r); ctx.fillStyle = '#fdfdf8'; ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 30; ctx.stroke();
    ctx.strokeStyle = '#c2261b'; ctx.lineWidth = 14; D.circ(ctx, cx, cy, r * 0.87); ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      ctx.strokeStyle = D.OUT; ctx.lineWidth = 15;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r * 0.76, cy + Math.sin(a) * r * 0.76); ctx.lineTo(cx + Math.cos(a) * r * 0.86, cy + Math.sin(a) * r * 0.86); ctx.stroke();
    }
    const ma = -Math.PI / 2 + e * Math.PI * 10, ha = -Math.PI / 2 + e * Math.PI * 1.4;
    ctx.lineCap = 'round'; ctx.strokeStyle = D.OUT;
    ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ha) * r * 0.48, cy + Math.sin(ha) * r * 0.48); ctx.stroke();
    ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ma) * r * 0.72, cy + Math.sin(ma) * r * 0.72); ctx.stroke();
    D.circ(ctx, cx, cy, 30); ctx.fillStyle = '#c2261b'; ctx.fill();
    const pp = spring((f - 948) / 14);
    if (pp > 0.02) { ctx.save(); ctx.translate(1080, 1560); ctx.scale(pp, pp); plate(0, 0, 760, 118, '10 SAAL BAAD', 64); ctx.restore(); }
  });
});
// S20 buddha customer gusse me — paiso ke dher desk par
shot(998, 1062, 0.22, { cx: 1170, cy: 1860, s: 1.06 }, { cx: 1150, cy: 1870, s: 0.94 }, (f, u) => {
  officeStage(f, () => {
    deskSet(f, { pens: false });
    notePile(750, 2072, 9, null);
    notePile(1020, 2072, 5, null);
    plate(750, 2300, 260, 72, '₹5 LAKH', 44);
    plate(1020, 2300, 260, 72, '₹3 LAKH', 44, '#ff9d8a');
    char(Object.assign({}, OLD, { x: 1530, y: 2760, s: 1.85 }, { expr: 'angry', armL: 'pointSide', armR: 'down', face: -0.3, look: -1 }), f, false);
  });
});
// S21 aamna-saamna — agent shrug, buddha ishara
shot(1062, 1125, 0.2, { cx: 1080, cy: 1800, s: 0.85 }, { cx: 1080, cy: 1780, s: 0.9 }, (f, u) => {
  officeStage(f, () => {
    char(Object.assign({}, AGENT, { x: 880, y: 2340, s: 1.95 }, { expr: 'calm', armR: 'shrug', armL: 'shrug' }), f, false);
    deskSet(f);
    notePile(990, 2072, 7, null);
    notePile(1180, 2072, 4, null);
    plate(1085, 2280, 440, 72, '5 LAKH → 3 LAKH', 40);
    char(Object.assign({}, OLD, { x: 1500, y: 2760, s: 1.9 }, { expr: 'angry', armL: 'pointSide', face: -0.3, look: -1 }), f, false);
  });
});
// S22 agent ka jhootha jawab — CU, bol raha hai
shot(1125, 1187, 0.2, { cx: 1080, cy: 1700, s: 1.3 }, { cx: 1080, cy: 1680, s: 1.46 }, (f, u) => {
  officeStage(f, () => {
    char(Object.assign({}, AGENT, AGT, {
      expr: 'calm', mix: { e2: 'smug', u: D.clamp((f - 1160) / 20, 0, 1) }, armR: 'point', armL: 'down',
    }), f, true);
    deskSet(f);
  });
});
// S23 chhupi line — andhera, kagaz ki chamak
shot(1187, 1233, 0.26, { cx: 1080, cy: 1760, s: 0.92 }, { cx: 1080, cy: 1750, s: 0.97 }, (f, u) => {
  officeStage(f, () => {
    char(Object.assign({}, AGENT, AGT, { expr: 'worried', look: -1, armR: 'hold', armL: 'hold' }), f, false);
    deskSet(f);
    bigSheet(1080, 2380, 460, 300, { title: 'POLICY', lines: 5, rot: 0.05 });
    lampPool(1080, 2380, 300, 0.4);
    ctx.fillStyle = 'rgba(15,12,30,0.30)'; ctx.fillRect(-900, -500, 3960, 4340);
  });
});
// S24 magnifier — chhoti line badi hokar
shot(1233, 1279, 0.22, { cx: 1080, cy: 1980, s: 1.45 }, { cx: 1080, cy: 1970, s: 1.58 }, (f, u) => {
  layer(1, () => {
    deskSet(f);
    bigSheet(1080, 2000, 1000, 640, { title: 'POLICY', lines: 9 });
    const lx = D.lerp(760, 1400, sstep(u)), ly = 2014;
    ctx.save(); D.circ(ctx, lx, ly, 132); ctx.clip();
    ctx.fillStyle = '#fdfdf8'; ctx.fillRect(lx - 140, ly - 140, 280, 280);
    ctx.strokeStyle = 'rgba(40,40,60,0.6)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(lx - 120, ly); ctx.lineTo(lx + 120, ly); ctx.stroke();
    textF('30 DIN KE ANDAR', lx, ly - 42, 44, '#263238', 230);
    ctx.restore();
    ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 12; D.circ(ctx, lx, ly, 132); ctx.stroke();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(lx + 100, ly + 100); ctx.lineTo(lx + 195, ly + 195); ctx.stroke();
  });
});
// S25 contract hero — laal ghera + 30 DIN FREE-LOOK
shot(1279, 1344, 0.2, { cx: 1080, cy: 1800, s: 1.2 }, { cx: 1080, cy: 1780, s: 1.34 }, (f, u) => {
  officeStage(f, () => {
    bigSheet(1080, 1820, 760, 1000, {
      title: 'POLICY', lines: 8, hl: 4, circle: spring((f - 1292) / 16),
      big: '30 DIN FREE-LOOK',
    });
    deskSet(f);
  });
});
// S26 board slam — 30 DIN FREE-LOOK + IRDAI
shot(1344, 1408, 0.2, { cx: 1080, cy: 1630, s: 0.86 }, { cx: 1080, cy: 1600, s: 0.94 }, (f, u) => {
  officeStage(f, () => {
    goldBoard(1080, 1400, 960, 540, [{ t: '30 DIN', px: 190 }, { t: 'FREE-LOOK', px: 118 }], spring((f - 1348) / 12));
    char(Object.assign({}, AGENT, { x: 700, y: 2340, s: 1.75 }, { expr: 'shocked', sweat: true, armR: 'up', armL: 'up' }), f, false);
    deskSet(f, { pens: false });
    const pp = spring((f - 1362) / 12);
    if (pp > 0.02) { ctx.save(); ctx.translate(1080, 1930); ctx.scale(pp, pp); plate(0, 0, 660, 98, 'IRDAI KA NIYAM', 54); ctx.restore(); }
    char(Object.assign({}, OLD, { x: 1470, y: 2720, s: 1.7 }, { expr: 'happy', armR: 'up', face: -0.2, look: -1 }), f, false);
  });
}, [1352]);
// S27 shikayaton ki baarish
shot(1408, 1455, 0.2, { cx: 1080, cy: 1620, s: 0.62 }, { cx: 1080, cy: 1600, s: 0.66 }, (f, u) => {
  officeStage(f, () => {
    char(Object.assign({}, AGENT, AGT, { expr: 'puzzled', armR: 'scratch', armL: 'down' }), f, false);
    deskSet(f);
    envelopeDraw(620, 2030, 1.2, 0.15); envelopeDraw(760, 2050, 1.1, -0.1); envelopeDraw(1420, 2040, 1.15, 0.08);
    char(Object.assign({}, OLD, { x: 1560, y: 2760, s: 1.9 }, { expr: 'sad', armR: 'hold', face: -0.3, look: -1 }), f, false);
    envelopeDraw(1560, 2380, 1.3, 0.1);
    letterRain(f, 10);
  });
});
// S28 bada board — 26,667 SHIKAYATEIN (hit 1462)
shot(1455, 1502, 0.24, { cx: 1080, cy: 1580, s: 0.9 }, { cx: 1080, cy: 1560, s: 1.0 }, (f, u) => {
  layer(1, () => {
    vgrad(-500, 3900, [[0, '#4a1f1a'], [1, '#2a1210']]);
    letterRain(f, 8);
    redBoard(1080, 1450, 1060, 640, [{ t: '26,667', px: 225, c: '#ffd94d' }, { t: 'SHIKAYATEIN', px: 118 }], spring((f - 1458) / 12));
  });
}, [1462]);
// S29 mirror — agent sheeshe me
shot(1502, 1555, 0.2, { cx: 1080, cy: 1420, s: 0.8 }, { cx: 1080, cy: 1400, s: 0.9 }, (f, u) => {
  layer(1, () => {
    mirrorSet(f, 'smug', null);
    plate(1080, 2280, 580, 98, 'YAAD KARO...', 54);
  });
});
// S30 mirror CU — chehra badalta hai (hit: sawal)
shot(1555, 1608, 0.2, { cx: 1080, cy: 1240, s: 1.3 }, { cx: 1080, cy: 1220, s: 1.5 }, (f, u) => {
  layer(1, () => {
    mirrorSet(f, 'smug', D.clamp((f - 1572) / 26, 0, 1));
    const pp = spring((f - 1566) / 12);
    if (pp > 0.02) { ctx.save(); ctx.translate(1080, 1780); ctx.scale(pp, pp); plate(0, 0, 920, 108, 'TUMHE KAUNSI BECHI THI?', 56); ctx.restore(); }
  });
});
// S31 binary sawal 1 — COVER BADA?
shot(1608, 1654, 0.2, { cx: 1070, cy: 1680, s: 0.86 }, { cx: 1070, cy: 1660, s: 0.94 }, (f, u) => {
  officeStage(f, () => {
    char(Object.assign({}, AGENT, AGT, { expr: 'puzzled', armR: 'point', armL: 'down' }), f, false);
    deskSet(f, { bell: false });
    policyBoard(730, 2072, 440, 600, 'crore', 1);
    policyBoard(1420, 2072, 440, 600, 'lakh', 1);
    plate(1080, 1060, 780, 112, 'COVER BADA?', 64);
  });
});
// S32 binary sawal 2 — COMMISSION BADA?
shot(1654, 1699, 0.2, { cx: 1075, cy: 1660, s: 0.97 }, { cx: 1075, cy: 1640, s: 1.0 }, (f, u) => {
  officeStage(f, () => {
    char(Object.assign({}, AGENT, AGT, { expr: 'smug', armR: 'point', armL: 'down' }), f, false);
    deskSet(f, { bell: false });
    policyBoard(760, 2072, 400, 560, 'crore', 1);
    policyBoard(1400, 2072, 400, 560, 'lakh', 1);
    if (f < 1676) plate(1080, 1060, 780, 112, 'COVER BADA?', 64);
    else plate(1080, 1060, 900, 112, 'COMMISSION BADA?', 64, '#ff9d8a', '#5d0f0a');
  });
});
// S33 punchline CU — seedha camera se
shot(1699, 1752, 0.18, { cx: 1080, cy: 1700, s: 1.32 }, { cx: 1080, cy: 1680, s: 1.5 }, (f, u) => {
  officeStage(f, () => {
    char(Object.assign({}, AGENT, { x: 1080, y: 2340, s: 2.05 }, {
      expr: 'smug', mix: { e2: 'calm', u: D.clamp((f - 1725) / 20, 0, 1) },
      armR: f < 1730 ? 'point' : 'down', armL: 'down',
    }), f, true);
    deskSet(f);
  });
});
// S34 akela agent — roshni kam hoti hui
shot(1752, 1806, 0.26, { cx: 1080, cy: 1600, s: 0.72 }, { cx: 1080, cy: 1650, s: 0.6 }, (f, u) => {
  officeStage(f, () => {
    char(Object.assign({}, AGENT, AGT, { expr: 'calm', armR: 'desk', armL: 'desk' }), f, false);
    deskSet(f);
    coinPile(760, 2072, [8], f);
    coinPile(1420, 2072, [10], f);
    ctx.fillStyle = `rgba(12,10,26,${0.10 + 0.22 * u})`; ctx.fillRect(-900, -500, 3960, 4340);
  });
});
// S35 tease — darwaze par "?"
shot(1806, 1850, 0.3, { cx: 1080, cy: 1560, s: 0.72 }, { cx: 1080, cy: 1540, s: 0.84 }, (f, u) => {
  layer(1, () => {
    doorSet(f);
    plate(1080, 2450, 640, 102, 'AGLI BAAR...', 56);
  });
}, [], { h: 'dark' });
// S36 "?" macro — ant
shot(1850, 1888, 0.3, { cx: 1080, cy: 1500, s: 1.25 }, { cx: 1080, cy: 1490, s: 1.45 }, (f, u) => {
  layer(1, () => { doorSet(f); });
}, [], { t: 'dark' });

// ---------------- render harness ----------------
function renderFrame(f) {
  const sh = SHOTS.find((s) => f >= s.a && f < s.b) || SHOTS[SHOTS.length - 1];
  const u = D.clamp((f - sh.a) / Math.max(1, sh.b - sh.a - 1), 0, 1), e = sstep(u);
  CAM = {
    cx: D.lerp(sh.cam0.cx, sh.cam1.cx, e),
    cy: D.lerp(sh.cam0.cy, sh.cam1.cy, e),
    s: D.lerp(sh.cam0.s, sh.cam1.s, e),
    rot: D.lerp(sh.cam0.rot || 0, sh.cam1.rot || 0, e),
  };
  SHK = { x: 0, y: 0 };
  for (const ht of sh.hits) {
    const age = f - ht;
    if (age >= 0 && age < 7) { const amp = (1 - age / 7) * 12; SHK = { x: Math.sin(age * 9.1) * amp, y: Math.cos(age * 11.3) * amp * 0.7 }; }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#f7d28a'; ctx.fillRect(0, 0, W, H);
  sh.draw(f, u);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (const ht of sh.hits) {
    if (f === ht) { ctx.fillStyle = 'rgba(255,244,200,0.26)'; ctx.fillRect(0, 0, W, H); }
  }
  if (sh.tr) {
    const lf2 = f - sh.a, len2 = sh.b - sh.a;
    const hA = D.clamp(1 - lf2 / 7, 0, 1), tA = D.clamp((lf2 - (len2 - 8)) / 7, 0, 1);
    if (sh.tr.h === 'flash') fxFlash(hA * 0.45);
    else if (sh.tr.h === 'dark') fxDark(hA * 0.6);
    if (sh.tr.t === 'dark') fxDark(tA * 0.7);
    else if (sh.tr.t === 'flash') fxFlash(tA * 0.45);
  }
  vignette(sh.vig);
  grain(f);
}
await Promise.all([fontReady, document.fonts.ready]).catch(() => {});
window.renderFrame = renderFrame;
window.TOTAL = TOTAL;
window.ready = true;
