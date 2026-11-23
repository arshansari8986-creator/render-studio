// EP-9 INSURANCE AGENT KA JHOOTH — CINEMATIC MULTI-ANGLE (1888 frames @30fps, 62.9s). BINA CHARACTER (hero nahi).
// SIMULATION: viewer khud AGENT ki kursi par baitha hai — POV desk shots, do policy ka chunav, sapna vs kagaz,
// 10-saala time-lapse, ant me MIRROR TWIST (kursi ghumti hai, agent ki jagah viewer khud).
// Camera: har shot me move (push/track/dive/fly-through/top-down/low/Dutch/macro), koi static frame nahi.
// Screen par text SIRF allowed: 1 CRORE / 7 LAKH / 7,00,000 / 4,000 / 15,000 / 5 LAKH / 3 LAKH / 30 DIN / 26,667 /
// INSURANCE AGENT / COMMISSION / IRDAI + shot-plan wale board texts (COVER BADA? / COMMISSION BADA? / CRORE BANTA! /
// 5 LAKH DIYE / MILE SIRF 3 LAKH / 30 DIN ME WAPAS = PURA PAISA / 26,667 SHIKAYATEIN / TUMHE KAUNSI BECHI THI? /
// AGLI BAAR / SERIES KA SABSE BADA KHULASA / 1 CRORE FUTURE). Calendar/ghadi par koi digit nahi.
// Harness: window.ready, window.renderFrame(f), window.TOTAL — teeno apni alag line par.
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import * as D from './draw.js';

const W = 1080, H = 1920, TOTAL = 1888, FPS = 30;
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
  ctx.save(); ctx.globalAlpha = 0.05; ctx.globalCompositeOperation = 'overlay';
  const ox = (f * 37) % 256, oy = (f * 53) % 256;
  for (let x = -ox; x < W; x += 256) for (let y = -oy; y < H; y += 256) ctx.drawImage(GRAIN, x, y);
  ctx.restore();
}
function lampPool(x, y, r, a = 0.4, col = '255,214,120') {
  const g = ctx.createRadialGradient(x, y, 10, x, y, r);
  g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g; D.circ(ctx, x, y, r); ctx.fill();
}
function darkPool(x, y, r, a = 0.45) {
  const g = ctx.createRadialGradient(x, y, 10, x, y, r);
  g.addColorStop(0, `rgba(8,5,2,${a})`); g.addColorStop(1, 'rgba(8,5,2,0)');
  ctx.fillStyle = g; D.circ(ctx, x, y, r); ctx.fill();
}
function vignette(a = 0.3) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createRadialGradient(540, 920, 420, 540, 920, 1080);
  g.addColorStop(0, 'rgba(8,6,2,0)'); g.addColorStop(1, `rgba(8,6,2,${a})`);
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
  ctx.fillStyle = `rgba(3,5,12,${a})`; ctx.fillRect(0, 0, W, H);
}
function fxStreak(a, f) {
  if (a <= 0.003) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.strokeStyle = `rgba(225,238,255,${a * 0.55})`; ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) {
    const y = hash(i * 7.3) * 1900 + 10, len = 130 + hash(i * 3.1) * 300;
    const x = ((hash(i * 9.7) * 1500 + f * 26 * (0.5 + hash(i * 5.3))) % 1500) - 220;
    ctx.lineWidth = 2 + hash(i * 4.9) * 3.5;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
  }
}

// ---------------- camera / parallax (rot = Dutch tilt) ----------------
let CAM = { cx: 1080, cy: 1250, s: 0.6, rot: 0 }, SHK = { x: 0, y: 0 };
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
function shot(a, b, vig, cam0, cam1, draw, hits = []) { SHOTS.push({ a, b, vig, cam0, cam1, draw, hits }); }

// ---------------- shared pieces ----------------
function vgrad(y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  ctx.fillStyle = g; ctx.fillRect(-800, y0, 3760, y1 - y0);
}
function darkBoard(x, y, w, h, lines, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  lampPool(0, 0, Math.max(w, h) * 0.95, 0.30);
  ctx.fillStyle = '#14100a'; D.rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.fill();
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 7; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,199,44,0.5)'; ctx.lineWidth = 2.5; D.rr(ctx, -w / 2 + 13, -h / 2 + 13, w - 26, h - 26, 9); ctx.stroke();
  lines.forEach((ln, i) => text(ln[0], 0, (i - (lines.length - 1) / 2) * (h * 0.52), fitPx(ln[0], ln[1], w - 64), ln[2]));
  ctx.restore();
}
function redBoard(x, y, w, h, lines, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  lampPool(0, 0, Math.max(w, h) * 1.0, 0.42, '255,70,50');
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, '#4a0d09'); g.addColorStop(0.5, '#6d130c'); g.addColorStop(1, '#380a06');
  ctx.fillStyle = g; D.rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.fill();
  ctx.strokeStyle = '#ff5147'; ctx.lineWidth = 8; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.30)'; ctx.lineWidth = 2.5; D.rr(ctx, -w / 2 + 13, -h / 2 + 13, w - 26, h - 26, 9); ctx.stroke();
  lines.forEach((ln, i) => text(ln[0], 0, (i - (lines.length - 1) / 2) * (h * 0.5), fitPx(ln[0], ln[1], w - 64), ln[2]));
  ctx.restore();
}
function goldBoard(x, y, w, h, lines, sc = 1, glint = -1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  lampPool(0, 0, Math.max(w, h) * 1.05, 0.42);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, '#3a2c07'); g.addColorStop(0.5, '#6d5410'); g.addColorStop(1, '#2e2205');
  ctx.fillStyle = g; D.rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.fill();
  ctx.strokeStyle = '#ffd94d'; ctx.lineWidth = 8; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2.5; D.rr(ctx, -w / 2 + 13, -h / 2 + 13, w - 26, h - 26, 9); ctx.stroke();
  lines.forEach((ln, i) => text(ln[0], 0, (i - (lines.length - 1) / 2) * (h * 0.47), fitPx(ln[0], ln[1], w - 64), ln[2]));
  if (glint >= 0) {
    ctx.save(); D.rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.clip();
    const gx = -w / 2 + glint * (w + 500) - 250;
    const gg = ctx.createLinearGradient(gx, 0, gx + 260, 0);
    gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, 'rgba(255,255,255,0.34)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gg;
    ctx.beginPath(); ctx.moveTo(gx, -h); ctx.lineTo(gx + 260, -h); ctx.lineTo(gx + 60, h); ctx.lineTo(gx - 200, h); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
function choiceBoard(x, y, w, h, lines, col, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  lampPool(0, 0, Math.max(w, h) * 1.0, 0.36, col === '#3ddc74' ? '80,255,150' : '255,80,60');
  ctx.fillStyle = '#100d0a'; D.rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2.5; D.rr(ctx, -w / 2 + 13, -h / 2 + 13, w - 26, h - 26, 9); ctx.stroke();
  lines.forEach((ln, i) => text(ln[0], 0, (i - (lines.length - 1) / 2) * (h * 0.48), fitPx(ln[0], ln[1], w - 56), ln[2] || col));
  ctx.restore();
}
function plate(x, y, w, h, str, px, col = '#ffd94d') {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(16,12,8,0.88)'; D.rr(ctx, -w / 2, -h / 2, w, h, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(201,162,39,0.75)'; ctx.lineWidth = 3.5; ctx.stroke();
  text(str, 0, 2, fitPx(str, px, w - 36), col);
  ctx.restore();
}
function lightCone(x, y0, y1, w0, w1, a = 0.10) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, `rgba(255,224,150,${a})`); g.addColorStop(1, 'rgba(255,224,150,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x - w0 / 2, y0); ctx.lineTo(x + w0 / 2, y0); ctx.lineTo(x + w1 / 2, y1); ctx.lineTo(x - w1 / 2, y1); ctx.closePath(); ctx.fill();
}
function dust(f, cx, cy, spread, n = 16, a = 0.35) {
  ctx.fillStyle = `rgba(255,236,180,${a})`;
  for (let i = 0; i < n; i++) {
    const dx = cx + (hash(i * 3.1) - 0.5) * spread + Math.sin(f * 0.02 + i * 1.7) * 22;
    const dy = cy + ((hash(i * 5.7) * 700 + f * (0.35 + hash(i) * 0.5)) % 700) - 350;
    D.circ(ctx, dx, dy, 2.2 + hash(i * 9) * 2.6); ctx.fill();
  }
}
function stampSolid(x, y, w, h, lines, rot, sc, colA = '#c01710', colB = '#7e0d08') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, colA); g.addColorStop(0.5, colA); g.addColorStop(1, colB);
  ctx.fillStyle = g; D.rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.fill();
  ctx.strokeStyle = '#ff6a5e'; ctx.lineWidth = 10; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.65)'; ctx.lineWidth = 3.5; D.rr(ctx, -w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 8); ctx.stroke();
  lines.forEach((ln, i) => text(ln[0], 0, (i - (lines.length - 1) / 2) * (h * 0.5), fitPx(ln[0], ln[1], w - 56), '#ffffff'));
  ctx.restore();
}
function coinDraw(x, y, r) {
  ctx.fillStyle = '#f2c14e'; D.circ(ctx, x, y, r); ctx.fill();
  ctx.strokeStyle = '#8a5f10'; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = '#8a5f10'; D.circ(ctx, x, y, r * 0.62); ctx.stroke();
  text('₹', x, y + 1, r * 1.05, '#8a5f10');
}
function coinStack(x, baseY, n, r = 34) {
  for (let i = 0; i < n; i++) {
    const cy = baseY - i * 15;
    ctx.fillStyle = i % 2 ? '#d9a52e' : '#f2c14e';
    D.ell(ctx, x, cy, r, r * 0.34); ctx.fill();
    ctx.strokeStyle = '#8a5f10'; ctx.lineWidth = 2.5; ctx.stroke();
  }
  if (n > 0) text('₹', x, baseY - n * 15 - 16, 34, '#ffd94d');
}
function ground(gy, col = '#0d1512', top = '#131c22') {
  ctx.fillStyle = col; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  ctx.fillStyle = top; ctx.fillRect(-800, gy, 3760, 150);
  ctx.fillStyle = 'rgba(200,230,255,0.06)'; ctx.fillRect(-800, gy, 3760, 7);
}

// ---------------- INSURANCE WORLD (naye helpers) ----------------
const GY = 2400;
// OFFICE ki deewaar — gehra neela-bhoora mahaul, side me khidki ki roshni ki lakeerein, farsh
function officeBG(gy = GY, o = {}) {
  vgrad(-600, gy + 40, [[0, '#05070d'], [0.5, '#0a101c'], [0.85, '#131009'], [1, '#1c150c']]);
  // peeche ki panel lakeerein
  ctx.strokeStyle = 'rgba(160,180,210,0.07)'; ctx.lineWidth = 5;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-500 + i * 700, -400); ctx.lineTo(-500 + i * 700, gy); ctx.stroke(); }
  // khidki (daayein) — blinds se aati chaandni
  const wx = o.winX || 1830;
  ctx.fillStyle = '#0d1626'; ctx.fillRect(wx - 210, gy - 1560, 420, 1060);
  ctx.strokeStyle = 'rgba(150,190,230,0.4)'; ctx.lineWidth = 6; ctx.strokeRect(wx - 210, gy - 1560, 420, 1060);
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = `rgba(170,210,245,${0.10 + 0.05 * Math.sin(i * 2.1)})`;
    ctx.fillRect(wx - 196, gy - 1520 + i * 148, 392, 66);
  }
  lampPool(wx, gy - 1030, 420, 0.13, '170,210,245');
  ground(gy, '#0c0a08', '#171208');
  // farsh par khidki ki roshni ka dhaba
  ctx.fillStyle = 'rgba(170,210,245,0.05)';
  ctx.beginPath(); ctx.moveTo(wx - 240, gy + 8); ctx.lineTo(wx + 260, gy + 8); ctx.lineTo(wx + 430, gy + 300); ctx.lineTo(wx - 60, gy + 300); ctx.closePath(); ctx.fill();
}
// MEZ (desk) — origin: desk ke beech ka x, topY = upari satah. Front panel neeche farsh tak.
function deskDraw(x, topY, w = 1560, o = {}) {
  ctx.save();
  darkPool(x, topY + 320, w * 0.62, 0.35);
  // front panel
  const pg = ctx.createLinearGradient(0, topY, 0, GY);
  pg.addColorStop(0, '#3a2716'); pg.addColorStop(0.4, '#2a1c10'); pg.addColorStop(1, '#170f07');
  ctx.fillStyle = pg; ctx.fillRect(x - w / 2 + 60, topY + 44, w - 120, GY - topY);
  ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 5; ctx.strokeRect(x - w / 2 + 60, topY + 44, w - 120, GY - topY);
  ctx.strokeStyle = 'rgba(255,205,110,0.13)'; ctx.lineWidth = 3; ctx.strokeRect(x - w / 2 + 110, topY + 120, w - 220, 300);
  // upari satah (halki parsp. chamak)
  const tg = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  tg.addColorStop(0, '#4a3220'); tg.addColorStop(0.5, '#6b4a2c'); tg.addColorStop(1, '#3d2812');
  ctx.fillStyle = tg;
  ctx.beginPath(); ctx.moveTo(x - w / 2, topY + 52); ctx.lineTo(x - w / 2 + 46, topY - 30); ctx.lineTo(x + w / 2 - 46, topY - 30); ctx.lineTo(x + w / 2, topY + 52); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = 'rgba(255,220,150,0.16)'; ctx.fillRect(x - w / 2 + 46, topY - 30, w - 92, 9);
  ctx.restore();
}
// Naam-plate (peetal) — origin beech
function namePlate(x, y, w, h, str, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  lampPool(0, 0, w * 0.7, 0.3);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, '#8a6a1e'); g.addColorStop(0.5, '#d9b64a'); g.addColorStop(1, '#7a5c16');
  ctx.fillStyle = g; D.rr(ctx, -w / 2, -h / 2, w, h, 10); ctx.fill();
  ctx.strokeStyle = '#4a3808'; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#4a3808'; D.circ(ctx, -w / 2 + 26, 0, 7); ctx.fill(); D.circ(ctx, w / 2 - 26, 0, 7); ctx.fill();
  text(str, 0, 3, fitPx(str, h * 0.52, w - 90), '#2e2004');
  ctx.restore();
}
// GHANTI (service bell) — origin neeche ka beech
function bellDraw(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  lampPool(0, -40, 130, 0.35);
  ctx.fillStyle = '#6e5410'; D.ell(ctx, 0, 0, 74, 16); ctx.fill();
  ctx.strokeStyle = '#3d2f06'; ctx.lineWidth = 4; ctx.stroke();
  const g = ctx.createLinearGradient(-60, 0, 60, 0);
  g.addColorStop(0, '#a87f1e'); g.addColorStop(0.5, '#ffe98a'); g.addColorStop(1, '#a87f1e');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-62, -4); ctx.quadraticCurveTo(-58, -72, 0, -76); ctx.quadraticCurveTo(58, -72, 62, -4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#6e5410'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#d9b64a'; D.circ(ctx, 0, -88, 13); ctx.fill(); ctx.strokeStyle = '#6e5410'; ctx.stroke();
  ctx.fillStyle = '#8a6a1e'; ctx.fillRect(-5, -84, 10, 12);
  ctx.restore();
}
// AGENT KI KURSI — origin zameen beech. o.front=1: saamne se (baitha aadmi dikh sakta hai); warna peeche se bada backrest.
function chairDraw(x, gy, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  D.softShadow(ctx, 0, 10, 240, 24, 0.42);
  const leather = o.col || '#131a26', rim = 'rgba(150,190,235,0.4)';
  // pairon wala aadhar (5-star)
  ctx.strokeStyle = '#0a0e14'; ctx.lineWidth = 20; ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + 0.5; ctx.beginPath(); ctx.moveTo(0, -52); ctx.lineTo(Math.cos(a) * 168, -16 + Math.abs(Math.sin(a)) * 8); ctx.stroke(); }
  ctx.fillStyle = '#0a0e14';
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + 0.5; D.circ(ctx, Math.cos(a) * 176, -8 + Math.abs(Math.sin(a)) * 8, 17); ctx.fill(); }
  ctx.fillStyle = '#1b2635'; ctx.fillRect(-26, -150, 52, 108);
  // seat
  ctx.fillStyle = leather; D.rr(ctx, -196, -196, 392, 62, 24); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  // backrest (bada, gol upar)
  const bg2 = ctx.createLinearGradient(-190, 0, 190, 0);
  bg2.addColorStop(0, '#0d1420'); bg2.addColorStop(0.5, '#1d2a3d'); bg2.addColorStop(1, '#0b1119');
  ctx.fillStyle = bg2;
  ctx.beginPath();
  ctx.moveTo(-178, -180); ctx.lineTo(-178, -560); ctx.quadraticCurveTo(-178, -668, 0, -668); ctx.quadraticCurveTo(178, -668, 178, -560); ctx.lineTo(178, -180); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.strokeStyle = rim; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-160, -560); ctx.quadraticCurveTo(-160, -646, -30, -656); ctx.stroke();
  if (!o.front) { // peeche se: silai ki lakeerein + headrest band
    ctx.strokeStyle = 'rgba(150,190,235,0.16)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-120, -640); ctx.lineTo(-120, -210); ctx.moveTo(120, -640); ctx.lineTo(120, -210); ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-178, -520, 356, 26);
  } else { // saamne se: andar ki gadde-daar satah (do halke ubhre takiye)
    ctx.fillStyle = 'rgba(120,170,225,0.07)';
    D.rr(ctx, -152, -632, 140, 402, 30); ctx.fill();
    D.rr(ctx, 12, -632, 140, 402, 30); ctx.fill();
  }
  // armrests
  ctx.fillStyle = '#0d1420';
  D.rr(ctx, -248, -330, 52, 170, 20); ctx.fill(); D.rr(ctx, 196, -330, 52, 170, 20); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.strokeRect(-248, -330, 52, 170); ctx.strokeRect(196, -330, 52, 170);
  ctx.restore();
}
// Aadmi silhouette (khada) — home-loan se reuse
function personSil(x, gy, s, o = {}) {
  const col = o.col || '#0c1016', flip = o.flip || 1;
  ctx.save(); ctx.translate(x, gy); ctx.scale(s * flip, s);
  D.softShadow(ctx, 0, 8, 62, 12, 0.3);
  ctx.fillStyle = col;
  D.circ(ctx, 0, -308 + (o.bow || 0), 37); ctx.fill();
  D.rr(ctx, -40, -272 + (o.bow || 0) * 0.6, 80, 148, 30); ctx.fill();
  D.rr(ctx, -38, -128, 30, 128, 13); ctx.fill();
  D.rr(ctx, 9, -128, 30, 128, 13); ctx.fill();
  ctx.save(); ctx.rotate(o.armA || 0.12); D.rr(ctx, -58, -262, 24, 118, 11); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(46, -258); ctx.rotate(o.armB || -0.12); D.rr(ctx, -11, 0, 24, 118, 11); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(255,214,140,0.35)'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -308 + (o.bow || 0), 38, -0.4, 0.9); ctx.stroke();
  ctx.restore();
}
// DESK KE PAAR BAITHA AADMI (saamne se) — origin: desk ki satah ka y (aadmi uske peeche baitha). o.bow = sir jhuka, o.grey = safed baal
function personSeated(x, deskY, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, deskY); ctx.scale(s, s);
  const col = o.col || '#0b0f16', bow = o.bow || 0;
  ctx.fillStyle = col;
  // dhad (desk ke upar dikhta hissa)
  ctx.beginPath();
  ctx.moveTo(-118, 30); ctx.quadraticCurveTo(-112, -128 - bow * 0.3, -58, -142 - bow * 0.4);
  ctx.lineTo(58, -142 - bow * 0.4); ctx.quadraticCurveTo(112, -128 - bow * 0.3, 118, 30); ctx.closePath(); ctx.fill();
  // kandhe par rim light
  ctx.strokeStyle = 'rgba(255,214,140,0.30)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-104, -60); ctx.quadraticCurveTo(-100, -126, -52, -140 - bow * 0.4); ctx.stroke();
  // sir (bow par neeche + aage)
  const hy = -196 - bow * 0.4 + bow * 0.55;
  D.circ(ctx, bow * 0.18, hy, 52); ctx.fill();
  if (o.grey) { ctx.fillStyle = 'rgba(210,215,220,0.85)'; ctx.beginPath(); ctx.arc(bow * 0.18, hy - 6, 52, Math.PI * 1.05, Math.PI * 1.95); ctx.lineTo(bow * 0.18 + 40, hy - 30); ctx.lineTo(bow * 0.18 - 40, hy - 30); ctx.closePath(); ctx.fill(); }
  ctx.strokeStyle = 'rgba(255,214,140,0.35)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(bow * 0.18, hy, 53, -0.5, 0.8); ctx.stroke();
  // baanhein desk par (aage ki ore)
  ctx.fillStyle = col;
  ctx.save(); ctx.translate(-96, -34); ctx.rotate(0.5 + (o.armL || 0)); D.rr(ctx, -15, 0, 30, 118, 14); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(96, -34); ctx.rotate(-0.5 + (o.armR || 0)); D.rr(ctx, -15, 0, 30, 118, 14); ctx.fill(); ctx.restore();
  ctx.restore();
}
// POV HAATH — origin ungliyon ki jad; kagaz ko dhakelta hua (neeche se upar ki ore)
function handPush(x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  // baju (suit) neeche se
  const sg = ctx.createLinearGradient(-90, 0, 90, 0);
  sg.addColorStop(0, '#10151f'); sg.addColorStop(0.5, '#232f42'); sg.addColorStop(1, '#0d1219');
  ctx.fillStyle = sg; ctx.fillRect(-88, 130, 176, 420);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.strokeRect(-88, 130, 176, 420);
  ctx.fillStyle = '#e8e4da'; ctx.fillRect(-88, 96, 176, 40); // cuff
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 3; ctx.strokeRect(-88, 96, 176, 40);
  // hatheli + ungliyaan (upar ki ore, kagaz ke kinare par)
  ctx.fillStyle = '#c98a54';
  D.rr(ctx, -76, -58, 152, 160, 46); ctx.fill();
  ctx.strokeStyle = '#7a4e26'; ctx.lineWidth = 4.5; ctx.stroke();
  const fin = [[-58, -150, 30], [-20, -168, 32], [20, -166, 32], [58, -146, 29]];
  for (const [fx, fy, fw] of fin) { ctx.fillStyle = '#c98a54'; D.rr(ctx, fx - fw / 2, fy, fw, 108, 15); ctx.fill(); ctx.strokeStyle = '#7a4e26'; ctx.stroke(); }
  ctx.save(); ctx.translate(-88, 6); ctx.rotate(0.7); ctx.fillStyle = '#c98a54'; D.rr(ctx, -15, -64, 30, 84, 14); ctx.fill(); ctx.strokeStyle = '#7a4e26'; ctx.stroke(); ctx.restore();
  ctx.strokeStyle = 'rgba(122,78,38,0.5)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-40, 30); ctx.lineTo(44, 22); ctx.stroke();
  ctx.restore();
}
// DHAAL (shield) — origin beech; andar bada text
function shieldBig(x, y, w, h, lines, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(o.sc || 1, o.sc || 1);
  const colA = o.colA || '#2b5aa8', colB = o.colB || '#122c56', edge = o.edge || '#ffd94d';
  lampPool(0, 0, Math.max(w, h) * 1.05, o.glow !== undefined ? o.glow : 0.4, o.glowCol || '140,190,255');
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, colA); g.addColorStop(0.55, colB); g.addColorStop(1, colB);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2 + 30); ctx.lineTo(w / 2, -h / 2 + 30);
  ctx.quadraticCurveTo(w / 2, h * 0.18, 0, h / 2);
  ctx.quadraticCurveTo(-w / 2, h * 0.18, -w / 2, -h / 2 + 30);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = edge; ctx.lineWidth = 10; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 22, -h / 2 + 48); ctx.lineTo(w / 2 - 22, -h / 2 + 48);
  ctx.quadraticCurveTo(w / 2 - 22, h * 0.16, 0, h / 2 - 26);
  ctx.quadraticCurveTo(-w / 2 + 22, h * 0.16, -w / 2 + 22, -h / 2 + 48);
  ctx.closePath(); ctx.stroke();
  // upar ki chamak
  ctx.fillStyle = 'rgba(255,255,255,0.13)';
  ctx.beginPath(); ctx.moveTo(-w / 2 + 16, -h / 2 + 40); ctx.lineTo(-w * 0.08, -h / 2 + 40); ctx.lineTo(-w * 0.3, h * 0.2); ctx.lineTo(-w / 2 + 16, h * 0.05); ctx.closePath(); ctx.fill();
  lines.forEach((ln, i) => text(ln[0], 0, (i - (lines.length - 1) / 2) * (h * 0.34) - h * 0.04, fitPx(ln[0], ln[1], w - 90), ln[2]));
  ctx.restore();
}
// POLICY KAGAZ — origin beech; rang-band upar, shield nishan, badi line, grey lines
function policyPaper(x, y, w, h, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(o.sc || 1, o.sc || 1);
  darkPool(0, 46, w * 0.85, 0.35);
  ctx.fillStyle = o.tint || '#e9e3d3'; D.rr(ctx, -w / 2, -h / 2, w, h, 9); ctx.fill();
  ctx.strokeStyle = '#8a8272'; ctx.lineWidth = 4.5; ctx.stroke();
  ctx.fillStyle = o.band || '#7a1d12'; ctx.fillRect(-w / 2 + 8, -h / 2 + 8, w - 16, h * 0.13);
  // shield nishan (band ke beech chhota)
  ctx.fillStyle = 'rgba(255,217,77,0.9)';
  ctx.beginPath(); const sy = -h / 2 + 8 + h * 0.065, sr = h * 0.045;
  ctx.moveTo(-sr, sy - sr); ctx.lineTo(sr, sy - sr); ctx.quadraticCurveTo(sr, sy + sr * 0.4, 0, sy + sr * 1.5); ctx.quadraticCurveTo(-sr, sy + sr * 0.4, -sr, sy - sr); ctx.closePath(); ctx.fill();
  if (o.big) text(o.big, 0, -h / 2 + h * 0.30, fitPx(o.big, o.bigPx || 74, w - 70), o.bigCol || '#26303c');
  ctx.fillStyle = 'rgba(40,44,52,0.68)';
  const rows = o.rows || 5;
  for (let i = 0; i < rows; i++) { const lw = (w - 90) * (0.55 + hash(i * 3.7 + w) * 0.4); ctx.fillRect(-w / 2 + 34, -h / 2 + h * 0.44 + i * ((h * 0.5) / rows), lw, 13); }
  if (o.foot) text(o.foot, 0, h / 2 - h * 0.09, fitPx(o.foot, o.footPx || 40, w - 70), o.footCol || '#7a1d12');
  ctx.restore();
}
// Kagaz/document (home-loan se)
function docPaper(x, y, w, h, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(o.sc || 1, o.sc || 1);
  darkPool(0, 40, w * 0.8, 0.35);
  ctx.fillStyle = o.tint || '#e8e2d2'; D.rr(ctx, -w / 2, -h / 2, w, h, 8); ctx.fill();
  ctx.strokeStyle = '#8a8272'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = o.headCol || '#7a1d12'; ctx.fillRect(-w / 2 + 26, -h / 2 + 24, w - 52, 12);
  ctx.fillStyle = 'rgba(40,44,52,0.75)';
  const rows = o.rows || 6, hg = o.headGap || 0;
  for (let i = 0; i < rows; i++) { const lw = (w - 90) * (0.55 + hash(i * 3.7 + w) * 0.4); ctx.fillRect(-w / 2 + 30, -h / 2 + 66 + hg + i * ((h - 130 - hg) / rows), lw, 13); }
  if (o.head) text(o.head, 0, -h / 2 + 92, fitPx(o.head, 44, w - 60), o.headCol || '#7a1d12');
  ctx.restore();
}
// Calendar panna (koi digit nahi — sirf dot-grid)
function calendarPage(x, y, w, h, rot = 0, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  darkPool(0, 50, w * 0.8, 0.3);
  ctx.fillStyle = '#e9e4d4'; D.rr(ctx, -w / 2, -h / 2, w, h, 10); ctx.fill();
  ctx.strokeStyle = '#8a8272'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#b3231b'; ctx.fillRect(-w / 2, -h / 2, w, h * 0.16);
  ctx.fillStyle = '#3a3f47';
  for (let i = 0; i < 6; i++) { D.circ(ctx, -w / 2 + 34 + i * ((w - 68) / 5), -h / 2 + 6, 8); ctx.fill(); }
  ctx.fillStyle = 'rgba(40,44,52,0.55)';
  const cols = 5, rows = 4, gw = (w - 70) / cols, gh = (h * 0.72) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) ctx.fillRect(-w / 2 + 35 + c * gw + 6, -h / 2 + h * 0.22 + r * gh + 8, gw - 16, 10);
  ctx.restore();
}
// Ghadi (koi digit nahi — sirf nishan)
function clockDraw(x, y, r, f, spin = 1) {
  ctx.save(); ctx.translate(x, y);
  lampPool(0, 0, r * 1.5, 0.18);
  ctx.fillStyle = '#10151d'; D.circ(ctx, 0, 0, r); ctx.fill();
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 8; ctx.stroke();
  ctx.fillStyle = '#e9e4d4'; D.circ(ctx, 0, 0, r * 0.86); ctx.fill();
  ctx.fillStyle = '#26303c';
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.save(); ctx.rotate(a); ctx.fillRect(-4, -r * 0.86 + 8, 8, i % 3 === 0 ? 26 : 15); ctx.restore(); }
  const ha = f * 0.11 * spin, ma = f * 0.55 * spin;
  ctx.strokeStyle = '#26303c'; ctx.lineCap = 'round';
  ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ha) * r * 0.5, -Math.cos(ha) * r * 0.5); ctx.stroke();
  ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ma) * r * 0.74, -Math.cos(ma) * r * 0.74); ctx.stroke();
  ctx.fillStyle = '#b3231b'; D.circ(ctx, 0, 0, 13); ctx.fill();
  ctx.restore();
}
// GHAR (sapna/asal) — home-loan se reuse
function houseDraw(x, gy, s, o = {}) {
  const wall = o.wallCol || '#8a6a48', wallD = o.wallD || '#5e4630', roof = o.roofCol || '#7e2f24';
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  D.softShadow(ctx, 0, 14, 400, 28, 0.4);
  ctx.fillStyle = wallD; ctx.fillRect(190, -648, 74, 150);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.strokeRect(190, -648, 74, 150);
  const wg = ctx.createLinearGradient(0, -470, 0, 0);
  wg.addColorStop(0, wall); wg.addColorStop(1, wallD);
  ctx.fillStyle = wg; ctx.fillRect(-330, -470, 660, 470);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.strokeRect(-330, -470, 660, 470);
  ctx.fillStyle = roof;
  ctx.beginPath(); ctx.moveTo(-392, -462); ctx.lineTo(0, -712); ctx.lineTo(392, -462); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-300, -478); ctx.lineTo(0, -678); ctx.lineTo(300, -478); ctx.stroke();
  ctx.fillStyle = '#3d2716'; D.rr(ctx, -62, -252, 124, 252, 8); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#ffd23f'; D.circ(ctx, 34, -126, 9); ctx.fill();
  const win = (wx) => {
    if (o.night) lampPool(wx, -330, 120, 0.4);
    ctx.fillStyle = o.night ? '#ffca7a' : '#bfe6f5'; D.rr(ctx, wx - 62, -392, 124, 124, 8); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    ctx.strokeStyle = 'rgba(38,34,31,0.7)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(wx, -392); ctx.lineTo(wx, -268); ctx.moveTo(wx - 62, -330); ctx.lineTo(wx + 62, -330); ctx.stroke();
  };
  win(-205); win(205);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-330, -26, 660, 26);
  ctx.restore();
}
// SIKKO KI BAARISH — upar se girte sikke (f = global frame)
function coinRain(f, x0, x1, y0, y1, n = 14, r = 30, speed = 1) {
  for (let i = 0; i < n; i++) {
    const p = ((f * 0.016 * speed * (0.7 + hash(i * 3.3) * 0.6) + hash(i * 7.9)) % 1);
    const px = x0 + hash(i * 5.1) * (x1 - x0) + Math.sin(f * 0.05 + i * 2.2) * 26;
    const py = D.lerp(y0, y1, p);
    const sq = Math.abs(Math.sin(p * 9 + i)); // ghumta hua sikka (patla-mota)
    ctx.save(); ctx.globalAlpha = 0.35 + p * 0.65;
    ctx.translate(px, py); ctx.scale(0.35 + 0.65 * sq, 1);
    coinDraw(0, 0, r * (0.7 + p * 0.5));
    ctx.restore();
  }
}
// PHOOL/PATEL baarish (sapna) — naram gulabi-safed pankhudiyaan
function petalRain(f, x0, x1, y0, y1, n = 16) {
  for (let i = 0; i < n; i++) {
    const p = ((f * 0.008 * (0.6 + hash(i * 4.1) * 0.7) + hash(i * 6.3)) % 1);
    const px = x0 + hash(i * 5.7) * (x1 - x0) + Math.sin(f * 0.03 + i * 1.9) * 60;
    const py = D.lerp(y0, y1, p);
    ctx.save(); ctx.translate(px, py); ctx.rotate(f * 0.02 * (i % 2 ? 1 : -1) + i);
    ctx.globalAlpha = 0.25 + p * 0.5;
    ctx.fillStyle = i % 3 ? '#ffd9e2' : '#fff3f6';
    D.ell(ctx, 0, 0, 20, 10); ctx.fill();
    ctx.restore();
  }
}
// DEGREE SCROLL — bandha hua farmaan/scroll, origin beech
function degreeScroll(x, y, w, h, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(o.sc || 1, o.sc || 1);
  lampPool(0, 0, w * 0.8, 0.35);
  darkPool(0, h * 0.4, w * 0.7, 0.3);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, '#f4ecd4'); g.addColorStop(0.5, '#e9dfc2'); g.addColorStop(1, '#d9cba4');
  ctx.fillStyle = g; D.rr(ctx, -w / 2, -h / 2, w, h, 6); ctx.fill();
  ctx.strokeStyle = '#a08c5a'; ctx.lineWidth = 4; ctx.stroke();
  // kinare ke roll
  ctx.fillStyle = '#cbbd92'; ctx.fillRect(-w / 2, -h / 2, 26, h); ctx.fillRect(w / 2 - 26, -h / 2, 26, h);
  ctx.strokeStyle = 'rgba(120,100,60,0.6)'; ctx.lineWidth = 3; ctx.strokeRect(-w / 2, -h / 2, 26, h); ctx.strokeRect(w / 2 - 26, -h / 2, 26, h);
  // andar ki lakeerein + badi lakeer
  ctx.fillStyle = 'rgba(60,54,40,0.65)';
  for (let i = 0; i < 4; i++) ctx.fillRect(-w / 2 + 90, -h / 2 + h * 0.30 + i * h * 0.13, (w - 190) * (0.5 + hash(i * 3.1) * 0.42), 12);
  ctx.fillStyle = '#7a1d12'; ctx.fillRect(-w / 2 + 90, -h / 2 + h * 0.16, w - 180, 10);
  // ribbon + mohar (neeche beech)
  ctx.fillStyle = '#b3231b';
  ctx.beginPath(); ctx.moveTo(-14, h * 0.18); ctx.lineTo(30, h * 0.18); ctx.lineTo(20, h * 0.42); ctx.lineTo(2, h * 0.34); ctx.lineTo(-16, h * 0.42); ctx.closePath(); ctx.fill();
  const mg = ctx.createRadialGradient(-8, -8, 4, 0, 0, 44);
  mg.addColorStop(0, '#ffe98a'); mg.addColorStop(1, '#a87f1e');
  ctx.fillStyle = mg; D.circ(ctx, 0, h * 0.18, 42); ctx.fill();
  ctx.strokeStyle = '#7a5c10'; ctx.lineWidth = 4; ctx.stroke();
  text('₹', 0, h * 0.18 + 2, 40, '#7a5c10');
  ctx.restore();
}
// BADA AAVARDHAK (magnifier) — origin beech; andar jo hai woh bahar draw hota hai, ye sirf frame+sheesha
function magnifier(x, y, r, rot = 0.5) {
  ctx.save(); ctx.translate(x, y);
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
  g.addColorStop(0, 'rgba(220,240,255,0.20)'); g.addColorStop(0.8, 'rgba(190,220,250,0.07)'); g.addColorStop(1, 'rgba(190,220,250,0.16)');
  ctx.fillStyle = g; D.circ(ctx, 0, 0, r); ctx.fill();
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 16; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 4; D.circ(ctx, 0, 0, r - 14); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, r * 0.72, Math.PI * 1.15, Math.PI * 1.45); ctx.stroke();
  // handle
  ctx.save(); ctx.rotate(rot);
  const hg = ctx.createLinearGradient(0, r, 0, r + r * 0.85);
  hg.addColorStop(0, '#6b4a2c'); hg.addColorStop(1, '#3a2716');
  ctx.fillStyle = hg; D.rr(ctx, -26, r - 6, 52, r * 0.85, 22); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.restore();
  ctx.restore();
}
// BHARAT KA NAKSHA — saral lekin pehchanne yogya outline (normalized points, ghadi ki sui ki disha me)
const INDIA_PTS = [[36, 1], [43, 5], [47, 11], [53, 15], [58, 20], [64, 24], [70, 27], [74, 30], [78, 28], [84, 24], [92, 25], [97, 30], [95, 37], [90, 41], [86, 46], [80, 44], [74, 42], [69, 47], [66, 52], [61, 58], [57, 65], [52, 73], [48, 82], [45, 91], [43, 99], [39, 90], [36, 80], [33, 70], [30, 61], [27, 53], [24, 46], [19, 49], [13, 45], [10, 39], [14, 32], [17, 25], [21, 18], [26, 11], [31, 5]];
function indiaMap(cx, cy, w, o = {}) {
  const h = w * 1.08;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(o.sc || 1, o.sc || 1);
  ctx.beginPath();
  INDIA_PTS.forEach(([px, py], i) => { const X = (px / 100 - 0.5) * w, Y = (py / 100 - 0.46) * h; i === 0 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y); });
  ctx.closePath();
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, o.fillA || '#12325e'); g.addColorStop(1, o.fillB || '#0a1c38');
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = o.edge || '#7ec8ff'; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
}
// Map ke andar ke bindu-sthan — point-in-polygon test se sirf nakse ke ANDAR wale bindu
function inIndia(hx, hy) {
  let inside = false;
  for (let i = 0, j = INDIA_PTS.length - 1; i < INDIA_PTS.length; j = i++) {
    const xi = INDIA_PTS[i][0] / 100, yi = INDIA_PTS[i][1] / 100;
    const xj = INDIA_PTS[j][0] / 100, yj = INDIA_PTS[j][1] / 100;
    if (((yi > hy) !== (yj > hy)) && (hx < (xj - xi) * (hy - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}
const INDIA_DOTS = [];
for (let i = 0; i < 60; i++) {
  let pt = null;
  for (let t = 0; t < 60 && !pt; t++) {
    const hx = 0.08 + hash(i * 13.7 + t * 3.3) * 0.88;
    const hy = 0.04 + hash(i * 7.9 + t * 5.1) * 0.92;
    if (inIndia(hx, hy)) pt = [hx, hy];
  }
  INDIA_DOTS.push(pt || [0.45, 0.45]);
}
function indiaDot(i) { return INDIA_DOTS[i % INDIA_DOTS.length]; }
// AAINA (mirror) — origin beech; sunahra frame, andar dhundhli parchaai
function mirrorDraw(x, y, w, h, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(o.sc || 1, o.sc || 1);
  lampPool(0, 0, Math.max(w, h) * 0.8, 0.22, '190,220,255');
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, '#1b2a3d'); g.addColorStop(0.5, '#2c4258'); g.addColorStop(1, '#141f2e');
  ctx.fillStyle = g; D.rr(ctx, -w / 2, -h / 2, w, h, 26); ctx.fill();
  // parchaai: sir + kandhe (dhundhle)
  ctx.save(); D.rr(ctx, -w / 2, -h / 2, w, h, 26); ctx.clip();
  ctx.fillStyle = `rgba(6,10,16,${o.silA !== undefined ? o.silA : 0.55})`;
  D.circ(ctx, 0, -h * 0.08, w * 0.17); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-w * 0.30, h / 2); ctx.quadraticCurveTo(-w * 0.28, h * 0.12, 0, h * 0.10); ctx.quadraticCurveTo(w * 0.28, h * 0.12, w * 0.30, h / 2); ctx.closePath(); ctx.fill();
  // sheeshe ki tedhi chamak
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.beginPath(); ctx.moveTo(-w * 0.42, -h / 2); ctx.lineTo(-w * 0.05, -h / 2); ctx.lineTo(-w * 0.38, h / 2); ctx.lineTo(-w * 0.62, h / 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.beginPath(); ctx.moveTo(w * 0.10, -h / 2); ctx.lineTo(w * 0.30, -h / 2); ctx.lineTo(-w * 0.02, h / 2); ctx.lineTo(-w * 0.16, h / 2); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 14; D.rr(ctx, -w / 2, -h / 2, w, h, 26); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,233,150,0.6)'; ctx.lineWidth = 4; D.rr(ctx, -w / 2 + 18, -h / 2 + 18, w - 36, h - 36, 18); ctx.stroke();
  ctx.fillStyle = '#d9b64a';
  for (const [cx2, cy2] of [[-w / 2 + 4, -h / 2 + 4], [w / 2 - 4, -h / 2 + 4], [-w / 2 + 4, h / 2 - 4], [w / 2 - 4, h / 2 - 4]]) { D.circ(ctx, cx2, cy2, 10); ctx.fill(); }
  ctx.restore();
}
// DARAAR (crack) — board par jagged kaali lakeerein, seed se
function crackDraw(x, y, len, seed = 1, a = 0.85) {
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = a;
  ctx.strokeStyle = 'rgba(5,3,2,0.9)'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  let px = 0, py = 0, ang = 0.7;
  ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(px, py);
  const steps = 7;
  for (let i = 0; i < steps; i++) {
    ang += (hash(seed * 13.7 + i * 3.3) - 0.5) * 1.1;
    px += Math.cos(ang) * (len / steps); py += Math.sin(ang) * (len / steps) + len / steps * 0.34;
    ctx.lineTo(px, py);
  }
  ctx.stroke();
  // shaakha
  ctx.lineWidth = 4; ctx.beginPath();
  let bx = px * 0.5, by = py * 0.5; ctx.moveTo(bx, by);
  for (let i = 0; i < 3; i++) { bx += (hash(seed * 7.9 + i) - 0.2) * len * 0.16; by += len * 0.10; ctx.lineTo(bx, by); }
  ctx.stroke();
  ctx.restore();
}

// ================= SHOTS =================
// ===== L1 (0–99) "Aaj tum insurance agent ho — aur tumhe ek jhooth bolna hai." =====
// 1a SPOTLIGHT KURSI: andhere kamre me khaali agent-kursi, camera peeche se dive
shot(0, 52, 0.36, { cx: 1080, cy: 1580, s: 0.50 }, { cx: 1080, cy: 1420, s: 0.68 }, (f, u) => {
  layer(0.5, () => officeBG(GY, { winX: 1900 }));
  layer(1, () => {
    lampPool(1080, 1500, 950, 0.16);
    lightCone(1080, 120, GY, 260, 1560, 0.13);
    // desk ka kinara (saamne, kursi ke aage)
    ctx.fillStyle = '#241708'; ctx.fillRect(300, 2050, 1560, 60);
    ctx.fillStyle = 'rgba(255,220,150,0.20)'; ctx.fillRect(300, 2050, 1560, 8);
    chairDraw(1080, GY, 1.5, {});
    dust(f, 1080, 1300, 700, 14, 0.30);
  });
});
// 1b MACRO NAAM-PLATE: "INSURANCE AGENT" push-in + ghanti chamak
shot(52, 99, 0.32, { cx: 1080, cy: 1360, s: 0.70 }, { cx: 1080, cy: 1330, s: 0.95 }, (f, u) => {
  const lf = f - 52;
  layer(0.6, () => { ctx.fillStyle = '#0a0d13'; ctx.fillRect(-800, -600, 3760, 4440); });
  layer(1, () => {
    // mez ki satah (macro)
    const tg = ctx.createLinearGradient(0, 500, 0, 2900);
    tg.addColorStop(0, '#3d2812'); tg.addColorStop(0.5, '#5e4020'); tg.addColorStop(1, '#2a1a0a');
    ctx.fillStyle = tg; ctx.fillRect(-800, 400, 3760, 2600);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 4;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-800, 800 + i * 480); ctx.lineTo(2960, 760 + i * 500); ctx.stroke(); }
    lampPool(1080, 1300, 1000, 0.22);
    namePlate(1030, 1420, 940, 158, 'INSURANCE AGENT', 0.6 + 0.4 * sstep(D.clamp(lf / 10, 0, 1)));
    bellDraw(1560, 1150, 1.5);
    if (lf > 26) D.drawSparkle(ctx, 1560, 1062, 30, 0.85);
    if (lf > 34) D.drawSparkle(ctx, 700, 1330, 24, 0.7);
    dust(f, 1080, 1300, 800, 8, 0.14);
  });
});

// ===== L2 (99–199) "Niyam simple hai: jitni mehengi policy, utna bada commission." =====
// 2a DESK SIDE-TRACK: sikko ki do dheri (chhoti vs badi)
shot(99, 149, 0.30, { cx: 920, cy: 1440, s: 0.64 }, { cx: 1240, cy: 1440, s: 0.64 }, (f, u) => {
  layer(0.5, () => officeBG(GY));
  layer(1, () => {
    deskDraw(1080, 1420, 1900);
    coinStack(790, 1396, 7, 40);
    coinStack(1370, 1396, 20, 40);
    namePlate(1080, 1470, 560, 92, 'INSURANCE AGENT');
    lampPool(1370, 1150, 420, 0.25);
    dust(f, 1080, 1300, 900, 8, 0.12);
  });
});
// 2b SUNAHRA KAGAZ slide-in, ek hissa alag glow = COMMISSION plate
shot(149, 199, 0.30, { cx: 1080, cy: 1400, s: 0.62 }, { cx: 1080, cy: 1370, s: 0.70 }, (f, u) => {
  const lf = f - 149, px = D.lerp(1780, 1080, sstep(D.clamp(lf / 26, 0, 1)));
  layer(0.5, () => officeBG(GY));
  layer(1, () => {
    deskDraw(1080, 1560, 1700);
    policyPaper(px, 1300, 640, 850, { rot: -0.03, band: '#a87f1e', tint: '#f0e6cc', rows: 6 });
    if (lf > 26) { // chamakta hissa (commission ka tukda)
      const pu = 0.5 + 0.5 * Math.sin(f * 0.22);
      ctx.save(); ctx.translate(px, 1300); ctx.rotate(-0.03);
      ctx.beginPath(); ctx.moveTo(60, -425); ctx.lineTo(320, -425); ctx.lineTo(320, 425); ctx.lineTo(-40, 425); ctx.closePath(); ctx.clip();
      const gg = ctx.createLinearGradient(0, -425, 0, 425);
      gg.addColorStop(0, `rgba(255,215,80,${0.25 + pu * 0.3})`); gg.addColorStop(1, `rgba(255,160,40,${0.12 + pu * 0.2})`);
      ctx.fillStyle = gg; ctx.fillRect(-330, -430, 660, 860);
      ctx.restore();
      lampPool(px + 150, 1300, 380, 0.20 + pu * 0.12);
    }
    if (lf > 32) plate(1080, 800, 620, 112, 'COMMISSION', 56, '#ffd94d');
    dust(f, 1080, 1400, 800, 7, 0.12);
  });
});

// ===== L3 (199–274) "Saamne ek aadmi baitha hai. Do policy hain." =====
// 3a POV: desk ke paar aadmi baithta hai
shot(199, 237, 0.32, { cx: 1080, cy: 1500, s: 0.62 }, { cx: 1080, cy: 1460, s: 0.70 }, (f, u) => {
  const lf = f - 199, settle = sstep(D.clamp(lf / 16, 0, 1));
  layer(0.5, () => officeBG(GY));
  layer(0.85, () => {
    lampPool(1080, 1380, 640, 0.22);
    chairDraw(1080, GY, 1.35, { front: true });
    ctx.save(); ctx.translate(0, (1 - settle) * -46);
    personSeated(1080, 1560, 1.18, {});
    ctx.restore();
  });
  layer(1, () => {
    deskDraw(1080, 1560, 1560);
    bellDraw(600, 1572, 1.05);
    namePlate(1080, 1622, 520, 84, 'INSURANCE AGENT');
    dust(f, 1080, 1400, 800, 7, 0.11);
  });
});
// 3b TOP-DOWN DESK: do kagaz side-by-side slide-in
shot(237, 274, 0.28, { cx: 1080, cy: 1300, s: 0.60, rot: 0.03 }, { cx: 1080, cy: 1300, s: 0.63, rot: -0.02 }, (f, u) => {
  const lf = f - 237, e = sstep(D.clamp(lf / 22, 0, 1));
  layer(0.7, () => { // mez ki satah pura frame
    const tg = ctx.createLinearGradient(0, 300, 0, 2400);
    tg.addColorStop(0, '#43301a'); tg.addColorStop(0.5, '#5e4020'); tg.addColorStop(1, '#33220f');
    ctx.fillStyle = tg; ctx.fillRect(-800, 200, 3760, 2400);
    ctx.strokeStyle = 'rgba(0,0,0,0.30)'; ctx.lineWidth = 4;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-800, 700 + i * 520); ctx.lineTo(2960, 660 + i * 540); ctx.stroke(); }
    lampPool(1080, 1300, 1300, 0.16);
  });
  layer(1, () => {
    policyPaper(D.lerp(620, 815, e), 1300, 540, 740, { rot: 0.02, band: '#2b5aa8', rows: 5 });
    policyPaper(D.lerp(1540, 1345, e), 1300, 540, 740, { rot: -0.02, band: '#7a1d12', rows: 5 });
    // ghanti upar se (gol)
    ctx.fillStyle = '#d9b64a'; D.circ(ctx, 1640, 830, 52); ctx.fill();
    ctx.strokeStyle = '#7a5c10'; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#8a6a1e'; D.circ(ctx, 1640, 830, 20); ctx.fill();
    namePlate(1080, 2080, 660, 104, 'INSURANCE AGENT');
    dust(f, 1080, 1300, 900, 6, 0.10);
  });
});

// ===== L4 (274–376) "Ek me use ek crore ka cover milega — tumhe milenge chaar hazaar." =====
// 4a PEHLA KAGAZ khulta — bada chamakta shield "1 CRORE COVER"
shot(274, 325, 0.30, { cx: 1080, cy: 1380, s: 0.62 }, { cx: 1080, cy: 1330, s: 0.72 }, (f, u) => {
  const lf = f - 274;
  layer(0.5, () => officeBG(GY));
  layer(1, () => {
    deskDraw(1080, 1620, 1700);
    policyPaper(1080, 1300, 680, 880, { band: '#2b5aa8', rows: 6, sc: spring(D.clamp(lf / 9, 0, 1)) });
    shieldBig(1080, 1240, 540, 600, [['1 CRORE', 104, '#ffffff'], ['COVER', 62, '#ffd94d']], { sc: spring(D.clamp((lf - 7) / 9, 0, 1)) });
    if (lf > 20) D.drawSparkle(ctx, 760, 940, 30, 0.85);
    if (lf > 30) D.drawSparkle(ctx, 1420, 1450, 26, 0.7);
    dust(f, 1080, 1300, 800, 8, 0.13);
  });
});
// 4b SHIELD ke upar fly-over, kone me chhota sikka plate "4,000"
shot(325, 376, 0.30, { cx: 1080, cy: 1330, s: 0.80 }, { cx: 1080, cy: 1280, s: 1.05 }, (f, u) => {
  layer(0.5, () => { ctx.fillStyle = '#070b14'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1250, 1300, 0.20, '140,190,255'); });
  layer(1, () => {
    shieldBig(1080, 1300, 660, 720, [['1 CRORE', 122, '#ffffff'], ['COVER', 70, '#ffd94d']], {});
    coinDraw(1400, 800, 42);
    plate(1400, 905, 300, 92, '4,000', 54, '#ffd94d');
    if (u > 0.4) D.drawSparkle(ctx, 830, 1010, 28, 0.8);
    dust(f, 1080, 1200, 700, 7, 0.12);
  });
});

// ===== L5 (376–485) "Dusri me use sirf saat lakh ka cover milega — tumhe milenge pandrah hazaar." =====
// 5a DUSRA KAGAZ — chhota shield "7 LAKH", upar se sikko ki BAARISH
shot(376, 432, 0.32, { cx: 1080, cy: 1400, s: 0.62 }, { cx: 1080, cy: 1360, s: 0.74 }, (f, u) => {
  layer(0.5, () => officeBG(GY));
  layer(1, () => {
    deskDraw(1080, 1620, 1700);
    policyPaper(880, 1330, 600, 800, { band: '#7a1d12', rows: 6 });
    shieldBig(880, 1280, 400, 440, [['7 LAKH', 80, '#e8eef4']], { colA: '#5a6d84', colB: '#2c3a4a', edge: '#c8d4e2', glow: 0.22, glowCol: '200,215,235', sc: spring(D.clamp((f - 376) / 9, 0, 1)) });
  });
  layer(1.15, () => coinRain(f, 480, 1750, 420, 2150, 18, 30, 1));
});
// 5b LOW ANGLE sikke camera ki taraf + board SLAM "15,000" (hit 470)
shot(432, 485, 0.34, { cx: 1080, cy: 1780, s: 0.58 }, { cx: 1080, cy: 1700, s: 0.66 }, (f, u) => {
  const lf = f - 432;
  layer(0.5, () => { vgrad(-600, 2600, [[0, '#04060c'], [0.6, '#0a101c'], [1, '#181008']]); });
  layer(1, () => {
    ground(GY, '#0c0a08', '#171208');
    coinRain(f, 420, 1780, 260, 2350, 20, 34, 1.25);
    // camera ke sabse paas wale bade sikke
    for (let i = 0; i < 4; i++) {
      const p = ((lf * 0.03 + hash(i * 8.7)) % 1);
      coinDraw(620 + hash(i * 4.3) * 900, D.lerp(1500, 2650, p), 26 + p * 66);
    }
    if (lf >= 38) redBoard(1080, 1060, 860, 320, [['15,000', 158, '#ffb59a']], spring((lf - 38) / 6));
    if (lf >= 44) D.drawSparkle(ctx, 660, 900, 30, 0.85);
  });
}, [470]);

// ===== L6 (485–572) "Kaunsi bechoge? ...Tumne bhi wahi chuni, jo har agent chunta hai." =====
// 6a DO KAGAZ beech me, camera tez sway + ghadi tick macro kone me
shot(485, 528, 0.32, { cx: 1050, cy: 1320, s: 0.62, rot: -0.055 }, { cx: 1110, cy: 1320, s: 0.62, rot: 0.055 }, (f, u) => {
  layer(0.7, () => {
    const tg = ctx.createLinearGradient(0, 300, 0, 2400);
    tg.addColorStop(0, '#43301a'); tg.addColorStop(0.5, '#5e4020'); tg.addColorStop(1, '#33220f');
    ctx.fillStyle = tg; ctx.fillRect(-800, 200, 3760, 2400);
    lampPool(1080, 1300, 1250, 0.15);
  });
  layer(1, () => {
    policyPaper(815, 1300, 520, 720, { rot: 0.03, band: '#2b5aa8', rows: 5 });
    policyPaper(1345, 1300, 520, 720, { rot: -0.03, band: '#7a1d12', rows: 5 });
    clockDraw(1510, 800, 104, f, 3.2);
    dust(f, 1080, 1300, 800, 6, 0.10);
  });
});
// 6b POV HAATH 7-lakh kagaz dhakelta — laal glow (hit 560)
shot(528, 572, 0.34, { cx: 1080, cy: 1420, s: 0.64, rot: 0.04 }, { cx: 1080, cy: 1380, s: 0.70, rot: -0.02 }, (f, u) => {
  const lf = f - 528, push = sstep(D.clamp(lf / 30, 0, 1));
  const py = D.lerp(1560, 1230, push);
  layer(0.5, () => officeBG(GY));
  layer(0.85, () => { lampPool(1080, 1000, 560, 0.24); personSeated(1080, 1090, 1.05, {}); });
  layer(1, () => {
    deskDraw(1080, 1620, 1700);
    lampPool(1080, py, 620, 0.10 + push * 0.30, '255,70,50');
    policyPaper(1080, py, 600, 780, { band: '#7a1d12', rows: 6, sc: 1 - push * 0.16 });
    if (lf >= 32) { // laal ghaira phailta hai
      ctx.strokeStyle = `rgba(255,81,71,${0.8 - (lf - 32) * 0.05})`; ctx.lineWidth = 9;
      D.circ(ctx, 1080, py, 340 + (lf - 32) * 36); ctx.stroke();
    }
    handPush(1080, py + 470, 1.25, {});
    dust(f, 1080, 1400, 700, 6, 0.10);
  });
}, [560]);

// ===== L7 (572–691) "Kagaz par saat lakh saaf likha hai. Woh padh lega to?" =====
// 7a KAGAZ MACRO "7,00,000" line par zoom, ungli rukti hai
shot(572, 632, 0.32, { cx: 1080, cy: 1340, s: 0.95 }, { cx: 1080, cy: 1300, s: 1.15 }, (f, u) => {
  const lf = f - 572, fin = sstep(D.clamp((lf - 20) / 16, 0, 1));
  layer(0.6, () => { ctx.fillStyle = '#0a0d13'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1200, 0.16); });
  layer(1, () => {
    policyPaper(1080, 1330, 920, 1180, { band: '#7a1d12', rows: 7, big: '7,00,000', bigPx: 128, bigCol: '#7a1d12' });
    // ungli upar se aakar "7,00,000" line par rukti (seedha neeche ishara)
    ctx.save(); ctx.translate(1150, D.lerp(470, 909, fin));
    ctx.fillStyle = '#0d1420'; ctx.fillRect(-72, -470, 144, 300);
    ctx.fillStyle = '#e8e4da'; ctx.fillRect(-72, -186, 144, 38);
    ctx.fillStyle = '#c98a54'; D.rr(ctx, -64, -152, 128, 138, 40); ctx.fill();
    ctx.strokeStyle = '#7a4e26'; ctx.lineWidth = 4.5; ctx.stroke();
    ctx.fillStyle = '#c98a54'; D.rr(ctx, -62, -22, 32, 62, 15); ctx.fill(); ctx.stroke();
    D.rr(ctx, 32, -22, 32, 62, 15); ctx.fill(); ctx.stroke();
    D.rr(ctx, -17, -22, 34, 208, 16); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.translate(-64, -60); ctx.rotate(0.6); D.rr(ctx, -14, 0, 28, 74, 13); ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.restore();
    if (lf > 40) D.drawSparkle(ctx, 900, 1010, 24, 0.7);
  });
});
// 7b SIDE ANGLE: aadmi kagaz ki taraf jhukta — haath kagaz kheench leta hai
shot(632, 691, 0.34, { cx: 1120, cy: 1440, s: 0.62 }, { cx: 1040, cy: 1420, s: 0.68 }, (f, u) => {
  const lf = f - 632, pull = sstep(D.clamp((lf - 10) / 34, 0, 1));
  layer(0.5, () => officeBG(GY));
  layer(0.85, () => { lampPool(1440, 1400, 560, 0.22); personSeated(1440, 1560, 1.15, { bow: 30 + pull * 40 }); });
  layer(1, () => {
    deskDraw(1080, 1560, 1700);
    const px = D.lerp(1120, 660, pull);
    policyPaper(px, 1330, 580, 760, { band: '#7a1d12', rows: 6, rot: -0.05 - pull * 0.3 });
    // kheenchta haath (baayein kinare se)
    ctx.save(); ctx.translate(px - 330, 1420); ctx.rotate(-Math.PI / 2 + 0.25);
    ctx.fillStyle = '#0d1420'; ctx.fillRect(-70, 110, 140, 380);
    ctx.fillStyle = '#e8e4da'; ctx.fillRect(-70, 78, 140, 36);
    ctx.fillStyle = '#c98a54'; D.rr(ctx, -62, -50, 124, 132, 38); ctx.fill();
    ctx.strokeStyle = '#7a4e26'; ctx.lineWidth = 4; ctx.stroke();
    ctx.restore();
    dust(f, 1080, 1400, 700, 6, 0.10);
  });
});

// ===== L8 (691–865) "Tum use kagaz nahi sunate... tum use sapna sunate ho!" =====
// 8a SAPNA DUNIYA: sunahra ghar fly-over
shot(691, 749, 0.26, { cx: 820, cy: 1520, s: 0.60 }, { cx: 1340, cy: 1460, s: 0.67 }, (f, u) => {
  layer(0.5, () => {
    vgrad(-600, GY + 40, [[0, '#2a1a05'], [0.45, '#7a4d12'], [0.8, '#c98f2e'], [1, '#e8b84d']]);
    lampPool(1560, 700, 700, 0.5);
    ctx.fillStyle = '#ffe9a8'; D.circ(ctx, 1560, 700, 84); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i < 14; i++) { const sx = -500 + hash(i * 2.9) * 3200, sy = -300 + hash(i * 3.7) * 900; ctx.globalAlpha = 0.3 + hash(i) * 0.4; D.circ(ctx, sx, sy, 3); ctx.fill(); }
    ctx.globalAlpha = 1;
  });
  layer(1, () => {
    ground(GY, '#4a3410', '#5e4517');
    lampPool(1080, GY - 500, 1000, 0.35);
    houseDraw(1080, GY, 1.6, { wallCol: '#a87f3e', wallD: '#7a5a28', roofCol: '#8a4a1d' });
    lampPool(875, GY - 530, 130, 0.5); lampPool(1285, GY - 530, 130, 0.5);
    petalRain(f, 400, 1800, 500, 2300, 12);
  });
});
// 8b DEGREE SCROLL macro + chamakta board "1 CRORE FUTURE"
shot(749, 807, 0.28, { cx: 1080, cy: 1380, s: 0.64 }, { cx: 1080, cy: 1340, s: 0.76 }, (f, u) => {
  const lf = f - 749;
  layer(0.5, () => { vgrad(-600, 2900, [[0, '#241503'], [0.6, '#5e3d0d'], [1, '#8a5f16']]); lampPool(1080, 1200, 1300, 0.3); });
  layer(1, () => {
    degreeScroll(1080, 1420, 720, 920, { sc: spring(D.clamp(lf / 9, 0, 1)), rot: -0.03 });
    if (lf > 12) goldBoard(1080, 800, 920, 290, [['1 CRORE FUTURE', 92, '#ffe98a']], spring((lf - 12) / 7), ((lf - 12) % 44) / 44);
    petalRain(f, 450, 1750, 400, 2300, 10);
    if (lf > 30) D.drawSparkle(ctx, 700, 1150, 28, 0.8);
  });
});
// 8c SAPNA BUBBLE: phoolon ki baarish, bubble ke andar chhota ghar
shot(807, 865, 0.28, { cx: 1080, cy: 1400, s: 0.62 }, { cx: 1080, cy: 1360, s: 0.70 }, (f, u) => {
  const lf = f - 807, wob = 1 + Math.sin(f * 0.25) * (0.02 + u * 0.03);
  layer(0.5, () => { vgrad(-600, 2900, [[0, '#1d1204'], [0.6, '#4a3008'], [1, '#6e4d12']]); lampPool(1080, 1250, 1200, 0.3); });
  layer(1, () => {
    ctx.save(); ctx.translate(1080, 1280); ctx.scale(wob, wob); ctx.translate(-1080, -1280);
    ctx.save();
    D.circ(ctx, 1080, 1280, 400); ctx.clip();
    vgrad(880, 1700, [[0, '#8a5f16'], [1, '#c98f2e']]);
    ctx.fillStyle = '#5e4517'; ctx.fillRect(680, 1560, 800, 140);
    houseDraw(1080, 1570, 0.58, { wallCol: '#a87f3e', wallD: '#7a5a28', roofCol: '#8a4a1d' });
    lampPool(1080, 1200, 420, 0.4);
    ctx.restore();
    // bubble ki deewaar
    const bg3 = ctx.createRadialGradient(950, 1080, 60, 1080, 1280, 400);
    bg3.addColorStop(0, 'rgba(255,255,255,0.02)'); bg3.addColorStop(0.85, 'rgba(255,220,240,0.06)'); bg3.addColorStop(1, 'rgba(255,240,250,0.20)');
    ctx.fillStyle = bg3; D.circ(ctx, 1080, 1280, 400); ctx.fill();
    ctx.strokeStyle = 'rgba(255,245,250,0.65)'; ctx.lineWidth = 5; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 14; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(1080, 1280, 350, Math.PI * 1.1, Math.PI * 1.42); ctx.stroke();
    ctx.restore();
    petalRain(f, 380, 1800, 350, 2350, 18);
  });
});

// ===== L9 (865–998) "Dus saal baad... paanch lakh bhare the, mile sirf teen lakh." =====
// 9a TIME-LAPSE: calendar panne tez + khidki ke bahar mausam badalta
shot(865, 909, 0.32, { cx: 1080, cy: 1400, s: 0.60 }, { cx: 1080, cy: 1360, s: 0.68 }, (f, u) => {
  const lf = f - 865, phase = Math.floor(f / 9) % 3;
  layer(0.5, () => officeBG(GY, { winX: 760 }));
  layer(0.55, () => { // khidki ke andar badalta mausam (officeBG ki khidki ke upar)
    const wx = 760, wy = GY - 1560;
    if (phase === 0) { lampPool(wx, wy + 300, 380, 0.55); ctx.fillStyle = '#ffd98f'; D.circ(ctx, wx + 90, wy + 260, 62); ctx.fill(); }
    else if (phase === 1) { ctx.strokeStyle = 'rgba(170,210,245,0.5)'; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (let i = 0; i < 12; i++) { const rx = wx - 190 + hash(i * 3.3) * 380, ry = wy + 60 + ((f * 22 + hash(i * 7) * 800) % 900); ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 18, ry + 62); ctx.stroke(); } }
    else { lampPool(wx, wy + 500, 420, 0.4, '255,150,80'); ctx.fillStyle = '#ff9a50'; D.circ(ctx, wx - 60, wy + 560, 56); ctx.fill(); }
  });
  layer(1, () => {
    // calendar ka dher (neeche) + udte panne
    calendarPage(1420, 1560, 460, 580, 0.04, 1);
    calendarPage(1420, 1546, 460, 580, -0.03, 1);
    for (let i = 0; i < 5; i++) {
      const p = ((lf * 0.085 + i / 5) % 1);
      const px = D.lerp(1420, 2050, p), py = D.lerp(1500, 500, p);
      ctx.save(); ctx.globalAlpha = 1 - p * 0.85;
      calendarPage(px, py, 460, 580, p * 1.6, 1 - p * 0.25);
      ctx.restore();
    }
    clockDraw(760, 900, 120, f, 6);
    dust(f, 1080, 1400, 800, 6, 0.10);
  });
});
// 9b COUNTER: aadmi (ab jhuka, safed baal) sikke deta — board "5 LAKH DIYE"
shot(909, 953, 0.32, { cx: 1080, cy: 1420, s: 0.62 }, { cx: 1080, cy: 1390, s: 0.68 }, (f, u) => {
  const lf = f - 909;
  layer(0.5, () => officeBG(GY));
  layer(0.85, () => { lampPool(1080, 1400, 600, 0.26); personSeated(1080, 1560, 1.18, { grey: true, bow: 30 }); });
  layer(1, () => {
    deskDraw(1080, 1560, 1600);
    // sikkon ki dhaar aadmi se agent (camera) ki taraf
    for (let i = 0; i < 7; i++) {
      const p = ((lf * 0.045 + i / 7) % 1);
      const px = D.lerp(1010, 560, p), py = D.lerp(1470, 1760, p) + Math.sin(p * 7 + i) * 22;
      ctx.save(); ctx.globalAlpha = 0.4 + p * 0.6; coinDraw(px, py, 27 + p * 10); ctx.restore();
    }
    coinStack(500, 1900, 9, 36);
    if (lf > 8) darkBoard(1080, 900, 820, 260, [['5 LAKH DIYE', 94, '#ffd94d']], spring((lf - 8) / 7));
    dust(f, 1080, 1400, 700, 6, 0.10);
  });
});
// 9c HAATHON me sirf chhote sikke — plate SLAM "MILE SIRF 3 LAKH" (hit 985)
shot(953, 998, 0.38, { cx: 1080, cy: 1420, s: 0.66 }, { cx: 1080, cy: 1390, s: 0.74 }, (f, u) => {
  const lf = f - 953;
  layer(0.5, () => { ctx.fillStyle = '#05070c'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1350, 1100, 0.13, '200,215,235'); });
  layer(1, () => {
    ground(GY, '#0a0908', '#120e0a');
    // do khule haath (neeche se, sikke lene ki mudra)
    ctx.save(); ctx.translate(830, 1620); ctx.rotate(0.35); ctx.scale(1.15, 1.15);
    ctx.fillStyle = '#0d1420'; ctx.fillRect(-70, 110, 140, 380);
    ctx.fillStyle = '#e8e4da'; ctx.fillRect(-70, 78, 140, 36);
    ctx.fillStyle = '#b57a44'; D.rr(ctx, -66, -52, 132, 140, 40); ctx.fill();
    ctx.strokeStyle = '#7a4e26'; ctx.lineWidth = 4; ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.translate(1330, 1620); ctx.rotate(-0.35); ctx.scale(1.15, 1.15);
    ctx.fillStyle = '#0d1420'; ctx.fillRect(-70, 110, 140, 380);
    ctx.fillStyle = '#e8e4da'; ctx.fillRect(-70, 78, 140, 36);
    ctx.fillStyle = '#b57a44'; D.rr(ctx, -66, -52, 132, 140, 40); ctx.fill();
    ctx.strokeStyle = '#7a4e26'; ctx.lineWidth = 4; ctx.stroke();
    ctx.restore();
    // haathon me bache-khuche sikke
    coinDraw(900, 1500, 30); coinDraw(1010, 1530, 26); coinDraw(1180, 1510, 28); coinDraw(1270, 1540, 24);
    darkPool(1080, 1750, 700, 0.3);
    if (lf >= 32) redBoard(1080, 980, 860, 300, [['MILE SIRF 3 LAKH', 92, '#ffb59a']], spring((lf - 32) / 6));
    if (lf >= 38) D.drawSparkle(ctx, 680, 850, 26, 0.75);
  });
}, [985]);

// ===== L10 (998–1187) "Policy band karna hi galti thi sir, chalne dete to crore banta!" =====
// 10a AGENT saamne haath hila kar samjhata — peeche chamakta board "CRORE BANTA!" par DARAAR
shot(998, 1093, 0.32, { cx: 1080, cy: 1420, s: 0.55 }, { cx: 1080, cy: 1380, s: 0.65 }, (f, u) => {
  const lf = f - 998, crackA = sstep(D.clamp((lf - 42) / 32, 0, 1));
  layer(0.5, () => officeBG(GY));
  layer(0.8, () => {
    goldBoard(1080, 880, 960, 330, [['CRORE BANTA!', 104, '#ffe98a']], spring(D.clamp(lf / 8, 0, 1)), ((lf) % 50) / 50);
    if (crackA > 0) { crackDraw(760, 760, 300, 3, crackA * 0.9); crackDraw(1330, 820, 240, 7, crackA * 0.8); }
  });
  layer(1, () => {
    deskDraw(1080, 1900, 1700);
    personSil(1080, GY, 1.9, { armA: 0.5 + Math.sin(f * 0.30) * 0.45, armB: -0.5 - Math.sin(f * 0.30 + 1.2) * 0.45 });
    dust(f, 1080, 1500, 800, 7, 0.11);
  });
});
// 10b DEFEAT ANGLE: upar se neeche — aadmi sir jhukata, roshni bujhti
shot(1093, 1187, 0.40, { cx: 1080, cy: 1260, s: 0.58 }, { cx: 1080, cy: 1300, s: 0.66 }, (f, u) => {
  layer(0.5, () => officeBG(GY));
  layer(1, () => {
    lampPool(1080, 1330, 760, (1 - u) * 0.34 * (0.72 + 0.28 * Math.sin(f * 1.25)));
    chairDraw(1080, GY, 1.45, { front: true });
    personSeated(1080, 1680, 1.35, { grey: true, bow: 40 + u * 85 });
    deskDraw(1080, 1680, 1560);
    policyPaper(1450, 1760, 420, 520, { band: '#7a1d12', rows: 4, rot: 0.07, sc: 0.9 });
    // bujhti roshni ka andhera
    ctx.fillStyle = `rgba(2,3,8,${u * 0.40})`; ctx.fillRect(-800, -600, 3760, 4440);
  });
});

// ===== L11 (1187–1279) "Ek line hai, jo tumne use kabhi padhne hi nahi di." =====
// 11a ANDHERA: kagaz ki EK line door se chamakti, slow dive
shot(1187, 1233, 0.42, { cx: 1080, cy: 1400, s: 0.50 }, { cx: 1080, cy: 1360, s: 0.72 }, (f, u) => {
  const lf = f - 1187, pulse = 0.6 + 0.4 * Math.sin(f * 0.18);
  layer(0.6, () => { ctx.fillStyle = '#02030a'; ctx.fillRect(-800, -600, 3760, 4440); });
  layer(1, () => {
    docPaper(1080, 1360, 620, 820, { tint: '#8f887a', rows: 7, rot: -0.03 });
    lampPool(1080, 1330, 340, 0.25 + pulse * 0.3);
    ctx.fillStyle = `rgba(255,214,90,${0.75 + pulse * 0.25})`;
    ctx.fillRect(830, 1318, 500, 24);
    ctx.strokeStyle = 'rgba(255,233,150,0.8)'; ctx.lineWidth = 3; ctx.strokeRect(830, 1318, 500, 24);
    dust(f, 1080, 1360, 500, 6, 0.16);
  });
});
// 11b MAGNIFIER: line par bada sheesha — "30 DIN" ubharte akshar
shot(1233, 1279, 0.36, { cx: 1080, cy: 1330, s: 0.78 }, { cx: 1080, cy: 1310, s: 0.90 }, (f, u) => {
  const lf = f - 1233;
  layer(0.6, () => { ctx.fillStyle = '#04060c'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1100, 0.18); });
  layer(1, () => {
    policyPaper(1080, 1330, 920, 1180, { band: '#7a1d12', rows: 8, tint: '#ddd5bf' });
    ctx.fillStyle = 'rgba(255,214,90,0.5)'; ctx.fillRect(700, 1270, 760, 110);
    ctx.save(); ctx.translate(1080, 1325); const ts = spring(D.clamp((lf - 6) / 12, 0, 1)); ctx.scale(ts, ts);
    text('30 DIN', 0, 0, 168, '#7a1d12');
    ctx.restore();
    magnifier(1080, 1300, 350, 0.55);
    if (lf > 26) D.drawSparkle(ctx, 830, 1030, 28, 0.8);
  });
});

// ===== L12 (1279–1408) "30 din ke andar wapas karke lagbhag pura paisa — IRDAI ka niyam." =====
// 12a KAGAZ WAPAS fly + sikke ULTI disha me aadmi ke paas
shot(1279, 1330, 0.30, { cx: 1080, cy: 1330, s: 0.60 }, { cx: 1080, cy: 1300, s: 0.64 }, (f, u) => {
  const lf = f - 1279, back = sstep(D.clamp(lf / 36, 0, 1));
  layer(0.7, () => {
    const tg = ctx.createLinearGradient(0, 300, 0, 2400);
    tg.addColorStop(0, '#43301a'); tg.addColorStop(0.5, '#5e4020'); tg.addColorStop(1, '#33220f');
    ctx.fillStyle = tg; ctx.fillRect(-800, 200, 3760, 2400);
    lampPool(1080, 1200, 1200, 0.16, '120,255,170');
  });
  layer(1, () => {
    // aadmi ki taraf (upar) badhta sikko ka dher
    coinStack(1080, 940, Math.floor(3 + back * 13), 38);
    // ulti disha me behte sikke
    for (let i = 0; i < 8; i++) {
      const p = ((lf * 0.05 + i / 8) % 1);
      const px = 1080 + Math.sin(p * 6 + i * 1.7) * 190, py = D.lerp(1560, 990, p);
      ctx.save(); ctx.globalAlpha = 0.35 + p * 0.65; coinDraw(px, py, 28); ctx.restore();
    }
    policyPaper(1080, D.lerp(1500, 1180, back), 580, 760, { band: '#1d6e46', rows: 6, rot: D.lerp(0.06, -0.02, back) });
    dust(f, 1080, 1300, 800, 6, 0.10);
  });
});
// 12b HARA BOARD SLAM (hit 1330) + IRDAI mohar
shot(1330, 1408, 0.30, { cx: 1080, cy: 1400, s: 0.62 }, { cx: 1080, cy: 1370, s: 0.70 }, (f, u) => {
  const lf = f - 1330;
  layer(0.5, () => officeBG(GY));
  layer(1, () => {
    deskDraw(1080, 1620, 1700);
    policyPaper(1020, 1560, 620, 720, { band: '#1d6e46', rows: 6, rot: -0.03 });
    choiceBoard(1080, 1010, 1000, 400, [['30 DIN ME WAPAS', 94, '#baffd2'], ['= PURA PAISA', 94, '#ffffff']], '#3ddc74', spring(D.clamp(lf / 6, 0, 1)));
    if (lf >= 34) stampSolid(1300, 1640, 450, 200, [['IRDAI', 88]], -0.12, spring((lf - 34) / 6), '#128a4c', '#0a5c30');
    if (lf >= 42) D.drawSparkle(ctx, 640, 850, 30, 0.85);
    if (lf >= 52) D.drawSparkle(ctx, 1500, 1250, 26, 0.7);
    dust(f, 1080, 1400, 800, 7, 0.11);
  });
}, [1330]);

// ===== L13–14 (1408–1608) "26,000 se zyada log IRDAI ke paas shikayat le gaye." =====
// 13a INDIA MAP par laal bindu phailte
shot(1408, 1502, 0.34, { cx: 1080, cy: 1360, s: 0.62 }, { cx: 1080, cy: 1330, s: 0.70 }, (f, u) => {
  layer(0.5, () => { vgrad(-600, 2900, [[0, '#02040c'], [0.55, '#071630'], [1, '#0a1c38']]); });
  layer(1, () => {
    indiaMap(1080, 1340, 1000, {});
    const reveal = Math.floor(sstep(D.clamp(u * 1.15, 0, 1)) * 46);
    for (let i = 0; i < reveal; i++) {
      const [hx, hy] = indiaDot(i);
      const dx = 1080 + (hx - 0.5) * 1000, dy = 1340 + (hy - 0.46) * 1080;
      const pop = spring(D.clamp((u * 46 - i) / 5, 0, 1));
      lampPool(dx, dy, 44, 0.35, '255,80,60');
      ctx.fillStyle = '#ff5147'; D.circ(ctx, dx, dy, 6 + pop * 5); ctx.fill();
      ctx.fillStyle = '#ffd9d4'; D.circ(ctx, dx, dy, 3); ctx.fill();
    }
    dust(f, 1080, 1300, 900, 8, 0.12);
  });
});
// 13b MAP zoom-out + board "26,667 SHIKAYATEIN" + kagazon ki baarish
shot(1502, 1608, 0.32, { cx: 1080, cy: 1380, s: 0.66 }, { cx: 1080, cy: 1400, s: 0.58 }, (f, u) => {
  const lf = f - 1502, msc = D.lerp(1, 0.60, sstep(D.clamp(lf / 40, 0, 1)));
  layer(0.5, () => { vgrad(-600, 2900, [[0, '#02040c'], [0.55, '#071630'], [1, '#0a1c38']]); });
  layer(1, () => {
    indiaMap(1080, 1180, 1000, { sc: msc });
    for (let i = 0; i < 22; i++) {
      const [hx, hy] = indiaDot(i);
      const dx = 1080 + (hx - 0.5) * 1000 * msc, dy = 1180 + (hy - 0.46) * 1080 * msc;
      ctx.fillStyle = '#ff5147'; D.circ(ctx, dx, dy, 6); ctx.fill();
    }
    // girte chhote kagaz
    for (let i = 0; i < 9; i++) {
      const p = ((lf * 0.02 + hash(i * 6.7)) % 1);
      const px = 480 + hash(i * 4.9) * 1240, py = D.lerp(350, 2250, p);
      ctx.save(); ctx.translate(px, py); ctx.rotate(p * 5 + i * 1.3); ctx.globalAlpha = 0.5 + p * 0.4;
      ctx.fillStyle = '#e9e3d3'; ctx.fillRect(-34, -46, 68, 92);
      ctx.fillStyle = 'rgba(122,29,18,0.8)'; ctx.fillRect(-34, -46, 68, 14);
      ctx.restore();
    }
    if (lf > 8) darkBoard(1080, 1830, 920, 340, [['26,667', 138, '#ffd94d'], ['SHIKAYATEIN', 78, '#ffb59a']], spring((lf - 8) / 7));
    dust(f, 1080, 1300, 900, 7, 0.11);
  });
});

// ===== L15 (1608–1699) MIRROR TWIST "Yaad karo... tumhare agent ne tumhe kaunsi policy bechi thi?" =====
// 15a KURSI GHUMTI hai — is baar baitha hai VIEWER khud (camera ki taraf)
shot(1608, 1654, 0.36, { cx: 1080, cy: 1480, s: 0.56 }, { cx: 1080, cy: 1420, s: 0.66 }, (f, u) => {
  layer(0.5, () => officeBG(GY, { winX: 1900 }));
  layer(1, () => {
    lampPool(1080, 1500, 950, 0.15);
    lightCone(1080, 120, GY, 260, 1560, 0.11);
    ctx.fillStyle = '#241708'; ctx.fillRect(300, 2050, 1560, 60);
    ctx.fillStyle = 'rgba(255,220,150,0.20)'; ctx.fillRect(300, 2050, 1560, 8);
    if (u < 0.5) { // peeche se ghumti kursi (patli hoti hui)
      const sx = D.lerp(1, 0.14, sstep(u * 2));
      ctx.save(); ctx.translate(1080, 1700); ctx.scale(sx, 1); ctx.translate(-1080, -1700);
      chairDraw(1080, GY, 1.5, {});
      ctx.restore();
    } else { // saamne se — kursi par baitha silhouette = viewer
      const sx = D.lerp(0.14, 1, sstep((u - 0.5) * 2));
      ctx.save(); ctx.translate(1080, 1700); ctx.scale(sx, 1); ctx.translate(-1080, -1700);
      chairDraw(1080, GY, 1.5, { front: true });
      ctx.save(); ctx.globalAlpha = D.clamp((u - 0.5) * 2.4, 0, 1);
      personSeated(1080, 2130, 1.30, {});
      ctx.restore();
      ctx.restore();
    }
    // peeche desk par wahi do kagaz
    policyPaper(700, 1150, 300, 400, { band: '#2b5aa8', rows: 3, sc: 0.9 });
    policyPaper(1470, 1150, 300, 400, { band: '#7a1d12', rows: 3, sc: 0.9 });
    dust(f, 1080, 1400, 700, 10, 0.2);
  });
});
// 15b AAINA ki taraf dive — plate "TUMHE KAUNSI BECHI THI?"
shot(1654, 1699, 0.34, { cx: 1080, cy: 1340, s: 0.68 }, { cx: 1080, cy: 1310, s: 0.92 }, (f, u) => {
  const lf = f - 1654;
  layer(0.5, () => { ctx.fillStyle = '#04060c'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1250, 1200, 0.14, '190,220,255'); });
  layer(1, () => {
    mirrorDraw(1080, 1280, 800, 1080, { sc: spring(D.clamp(lf / 9, 0, 1)), silA: 0.35 + u * 0.35 });
    if (lf > 16) plate(1080, 1980, 860, 124, 'TUMHE KAUNSI BECHI THI?', 54, '#ffd94d');
    dust(f, 1080, 1300, 700, 8, 0.14);
  });
});

// ===== L16 (1699–1806) "Tumhari policy me cover bada hai, ya agent ka commission?" =====
// 16a HARA board SLAM "COVER BADA?" (hit 1730)
shot(1699, 1753, 0.34, { cx: 1080, cy: 1400, s: 0.62 }, { cx: 1080, cy: 1370, s: 0.68 }, (f, u) => {
  const lf = f - 1699;
  layer(0.5, () => { ctx.fillStyle = '#05070c'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1150, 0.13); });
  layer(1, () => {
    ground(GY, '#0a0908', '#120e0a');
    policyPaper(1080, 1560, 540, 700, { band: '#2b5aa8', rows: 5, rot: 0.03 });
    if (lf >= 31) choiceBoard(880, 1010, 780, 290, [['COVER BADA?', 98, '#baffd2']], '#3ddc74', spring((lf - 31) / 6));
    if (lf >= 38) D.drawSparkle(ctx, 620, 880, 28, 0.8);
    dust(f, 1080, 1400, 700, 6, 0.11);
  });
}, [1730]);
// 16b LAAL board SLAM "COMMISSION BADA?" (hit 1770) — dono board, camera sway
shot(1753, 1806, 0.34, { cx: 1080, cy: 1400, s: 0.66, rot: -0.03 }, { cx: 1080, cy: 1400, s: 0.66, rot: 0.03 }, (f, u) => {
  const lf = f - 1753;
  layer(0.5, () => { ctx.fillStyle = '#05070c'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1150, 0.13); });
  layer(1, () => {
    ground(GY, '#0a0908', '#120e0a');
    policyPaper(1080, 1420, 520, 680, { band: '#7a1d12', rows: 5, rot: Math.sin(f * 0.05) * 0.05 });
    choiceBoard(850, 950, 760, 280, [['COVER BADA?', 94, '#baffd2']], '#3ddc74', 1);
    if (lf >= 17) choiceBoard(1310, 1620, 840, 300, [['COMMISSION BADA?', 86, '#ffd9d4']], '#ff5147', spring((lf - 17) / 6));
    if (lf >= 24) D.drawSparkle(ctx, 1560, 1470, 28, 0.8);
    dust(f, 1080, 1400, 700, 6, 0.11);
  });
}, [1770]);

// ===== L17 (1806–1888) "Agli baar: is series ka aakhri, aur sabse bada khulasa." =====
// 17a ANDHERA, chamakta kagaz + end card
shot(1806, 1888, 0.38, { cx: 1080, cy: 1400, s: 0.60 }, { cx: 1080, cy: 1370, s: 0.74 }, (f, u) => {
  const lf = f - 1806, pulse = 0.6 + 0.4 * Math.sin(f * 0.15);
  layer(0.5, () => { ctx.fillStyle = '#02030a'; ctx.fillRect(-800, -600, 3760, 4440); });
  layer(1, () => {
    lampPool(1080, 1060, 620, 0.16 + pulse * 0.14);
    docPaper(1080, 1060, 520, 660, { tint: '#cfc7ae', rows: 6, rot: -0.04 });
    ctx.fillStyle = `rgba(255,214,90,${0.5 + pulse * 0.4})`; ctx.fillRect(880, 1000, 400, 20);
    if (lf >= 24) plate(1080, 620, 500, 112, 'AGLI BAAR', 58, '#ffd94d');
    if (lf >= 42) darkBoard(1080, 1620, 960, 350, [['SERIES KA SABSE BADA', 78, '#ffd94d'], ['KHULASA', 122, '#ffffff']], spring((lf - 42) / 8));
    if (lf >= 56) D.drawSparkle(ctx, 660, 1480, 28, 0.8);
    if (lf >= 66) D.drawSparkle(ctx, 1500, 1720, 26, 0.7);
    dust(f, 1080, 1300, 700, 9, 0.16);
  });
});

// ---------------- TRANSITIONS ----------------
const TR = [
  {},                             // 1a kursi spotlight
  {},                             // 1b naam-plate macro
  {},                             // 2a sikko ki dheri
  {},                             // 2b sunahra kagaz
  {},                             // 3a POV aadmi baithta
  {},                             // 3b top-down do kagaz
  { h: 'flash' },                 // 4a shield khulta
  {},                             // 4b shield fly-over
  {},                             // 5a dusri policy + baarish
  {},                             // 5b low angle slam
  {},                             // 6a sway + ghadi
  {},                             // 6b haath dhakelta
  {},                             // 7a kagaz macro
  {},                             // 7b kagaz kheenchna
  { h: 'flash' },                 // 8a sapna duniya entry
  {},                             // 8b degree scroll
  { t: 'dark' },                  // 8c bubble band hota
  { h: 'dark' },                  // 9a time-lapse asal duniya
  {},                             // 9b counter sikke
  {},                             // 9c mile sirf 3 lakh
  {},                             // 10a agent samjhata
  { t: 'dark' },                  // 10b roshni bujhti
  { h: 'dark' },                  // 11a andhera + line
  {},                             // 11b magnifier 30 DIN
  { h: 'flash' },                 // 12a kagaz wapas
  {},                             // 12b hara board + IRDAI
  {},                             // 13a india map bindu
  {},                             // 13b 26,667 board
  { h: 'streak' },                // 15a kursi ghumti
  {},                             // 15b aaina dive
  { h: 'flash' },                 // 16a cover bada slam
  {},                             // 16b commission bada slam
  { h: 'dark', t: 'dark' },       // 17a end card
];
SHOTS.forEach((s, i) => { s.tr = TR[i] || {}; });

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
  ctx.fillStyle = '#0d1526'; ctx.fillRect(0, 0, W, H);
  sh.draw(f, u);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (const ht of sh.hits) {
    if (f === ht) { ctx.fillStyle = 'rgba(255,244,200,0.26)'; ctx.fillRect(0, 0, W, H); }
  }
  if (sh.tr) {
    const lf2 = f - sh.a, len2 = sh.b - sh.a;
    const hA = D.clamp(1 - lf2 / 7, 0, 1), tA = D.clamp((lf2 - (len2 - 8)) / 7, 0, 1);
    const applyTr = (type, a) => {
      if (!type || a <= 0) return;
      if (type === 'flash') fxFlash(a * 0.5);
      else if (type === 'dark') fxDark(a * 0.72);
      else if (type === 'streak') fxStreak(a, f);
    };
    applyTr(sh.tr.h, hA); applyTr(sh.tr.t, tA);
  }
  vignette(sh.vig);
  grain(f);
}
await Promise.all([fontReady, document.fonts.ready]).catch(() => {});
window.renderFrame = renderFrame;
window.TOTAL = TOTAL;
window.ready = true;
