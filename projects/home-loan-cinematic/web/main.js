// EP-8 HOME LOAN SCAM — CINEMATIC MULTI-ANGLE (1755 frames @30fps, 58.5s). BINA CHARACTER: koi hero nahi.
// Sirf ghar, bank, loan kagaz, sikke, calendar, ghadi, jaal. Camera: har shot me move (push/track/orbit/tilt/dive/fly-through),
// har sentence par kam se kam ek EXTREME angle (low / top-down / macro / andar fly-through), tension shots me Dutch tilt.
// Frame-safety: saare boards/text dono camera extremes par visible-rect ke andar (boards auto-fit via measureText).
// Screen par numbers SIRF allowed list wale: 40,231 / 37,500 / 2,731 / 50 LAKH / 45 LAKH / 5 LAKH / 48 LAKH / 95 LAKH / 1.45 CRORE / 30 SAAL / 10 SAAL / PENALTY ZERO.
// Harness: window.ready, window.renderFrame(f), window.TOTAL.
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import * as D from './draw.js';

const W = 1080, H = 1920, TOTAL = 1755, FPS = 30;
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const DEV_FONT = '"Noto Sans Devanagari"';
const fontReady = (async () => {
  try {
    const face = new FontFace('Noto Sans Devanagari', `url(data:font/ttf;base64,${DEVANAGARI_BOLD_B64})`, { weight: '700' });
    await face.load(); document.fonts.add(face);
    await document.fonts.load(`700 60px ${DEV_FONT}`, 'LOAN ₹5');
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
function choiceBoard(x, y, w, h, str, px, col, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  lampPool(0, 0, Math.max(w, h) * 1.0, 0.34, col === '#3ddc74' ? '80,255,150' : '255,80,60');
  ctx.fillStyle = '#100d0a'; D.rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2.5; D.rr(ctx, -w / 2 + 13, -h / 2 + 13, w - 26, h - 26, 9); ctx.stroke();
  text(str, 0, 2, fitPx(str, px, w - 56), col);
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
function wetReflect(x, y, w, h, a = 0.16) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, `rgba(255,214,130,${a})`); g.addColorStop(1, 'rgba(255,214,130,0)');
  ctx.fillStyle = g;
  D.ell(ctx, x, y + h * 0.32, w / 2, h * 0.36); ctx.fill();
  ctx.fillStyle = `rgba(255,230,170,${a * 0.7})`;
  for (let i = 0; i < 5; i++) { const sx = x - w / 2 + 14 + i * (w - 28) / 4; ctx.fillRect(sx, y + 6, 7, h * (0.35 + hash(i * 7.3 + x) * 0.5)); }
}
function dust(f, cx, cy, spread, n = 16, a = 0.35) {
  ctx.fillStyle = `rgba(255,236,180,${a})`;
  for (let i = 0; i < n; i++) {
    const dx = cx + (hash(i * 3.1) - 0.5) * spread + Math.sin(f * 0.02 + i * 1.7) * 22;
    const dy = cy + ((hash(i * 5.7) * 700 + f * (0.35 + hash(i) * 0.5)) % 700) - 350;
    D.circ(ctx, dx, dy, 2.2 + hash(i * 9) * 2.6); ctx.fill();
  }
}
function stampDraw(x, y, w, h, lines, col, rot, sc) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = 0.94;
  ctx.strokeStyle = col; ctx.lineWidth = 9; D.rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.stroke();
  ctx.lineWidth = 3.5; ctx.setLineDash([16, 10]); D.rr(ctx, -w / 2 + 15, -h / 2 + 15, w - 30, h - 30, 8); ctx.stroke(); ctx.setLineDash([]);
  lines.forEach((ln, i) => text(ln[0], 0, (i - (lines.length - 1) / 2) * (h * 0.5), fitPx(ln[0], ln[1], w - 56), col));
  ctx.restore();
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

// ---------------- skies ----------------
const GY = 2400;
function ground(gy, col = '#0d1512', top = '#131c22') {
  ctx.fillStyle = col; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  ctx.fillStyle = top; ctx.fillRect(-800, gy, 3760, 150);
  ctx.fillStyle = 'rgba(200,230,255,0.06)'; ctx.fillRect(-800, gy, 3760, 7);
}
function nightSky(gy, f = 0) {
  ctx.fillStyle = '#020a12'; ctx.fillRect(-900, -2600, 3960, 2000);
  vgrad(-600, gy + 40, [[0, '#020a12'], [0.45, '#06222f'], [0.78, '#0a3542'], [1, '#155263']]);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 40; i++) { const sx = -600 + hash(i * 1.9) * 3300, sy = -500 + hash(i * 2.7) * 1150; ctx.globalAlpha = 0.2 + hash(i * 3.3) * 0.5; D.circ(ctx, sx, sy, 2 + hash(i) * 2.2); ctx.fill(); }
  ctx.globalAlpha = 1;
  lampPool(1560, gy - 1560, 340, 0.30, '190,230,255');
  ctx.fillStyle = '#dceefc'; D.circ(ctx, 1560, gy - 1560, 58); ctx.fill();
  ctx.fillStyle = 'rgba(160,190,215,0.5)'; D.circ(ctx, 1540, gy - 1580, 13); ctx.fill(); D.circ(ctx, 1582, gy - 1532, 9); ctx.fill();
  ctx.fillStyle = '#04141d';
  ctx.beginPath(); ctx.moveTo(-800, gy);
  for (let x = -800; x <= 2960; x += 290) ctx.lineTo(x, gy - 120 - hash(x * 0.41) * 130);
  ctx.lineTo(2960, gy); ctx.closePath(); ctx.fill();
}
function daySky(gy, f = 0) {
  ctx.fillStyle = '#0b1220'; ctx.fillRect(-900, -2600, 3960, 2000);
  vgrad(-600, gy + 40, [[0, '#0b1220'], [0.5, '#17334a'], [0.8, '#3d5a63'], [1, '#8a6a35']]);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  for (let i = 0; i < 18; i++) { const sx = -600 + hash(i * 2.3) * 3300, sy = -500 + hash(i * 3.1) * 800; ctx.globalAlpha = 0.12 + hash(i * 3.3) * 0.3; D.circ(ctx, sx, sy, 2 + hash(i) * 2); ctx.fill(); }
  ctx.globalAlpha = 1;
  lampPool(1620, gy - 1450, 520, 0.26);
  ctx.fillStyle = '#ffd98f'; D.circ(ctx, 1620, gy - 1450, 66); ctx.fill();
}
function smoke(x, y, f, n = 6, rise = 300, col = '120,124,132') {
  for (let i = 0; i < n; i++) {
    const p = ((f * 0.012 * (0.7 + hash(i * 3) * 0.6) + hash(i * 7.7)) % 1);
    const sx = x + Math.sin(p * 5 + i * 2.4) * 46 + p * 90, sy = y - p * rise;
    ctx.fillStyle = `rgba(${col},${0.30 * (1 - p)})`;
    D.circ(ctx, sx, sy, 16 + p * 52); ctx.fill();
  }
}

// ---------------- HOME LOAN WORLD (naye helpers) ----------------
// GHAR — origin: zameen ka beech (x, gy). Kul chaudi ~760*s, unchai ~700*s. o.night: khidkiyon me garam roshni; o.roofCol/wallCol variants.
function houseDraw(x, gy, s, o = {}) {
  const wall = o.wallCol || '#8a6a48', wallD = o.wallD || '#5e4630', roof = o.roofCol || '#7e2f24';
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  D.softShadow(ctx, 0, 14, 400, 28, 0.4);
  // chimni
  ctx.fillStyle = wallD; ctx.fillRect(190, -648, 74, 150);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.strokeRect(190, -648, 74, 150);
  if (o.smokeF !== undefined) smoke(227, -660, o.smokeF, 4, 190, '150,150,158');
  // deewaar
  const wg = ctx.createLinearGradient(0, -470, 0, 0);
  wg.addColorStop(0, wall); wg.addColorStop(1, wallD);
  ctx.fillStyle = wg; ctx.fillRect(-330, -470, 660, 470);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.strokeRect(-330, -470, 660, 470);
  // chhat (triangle + overhang)
  ctx.fillStyle = roof;
  ctx.beginPath(); ctx.moveTo(-392, -462); ctx.lineTo(0, -712); ctx.lineTo(392, -462); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-300, -478); ctx.lineTo(0, -678); ctx.lineTo(300, -478); ctx.stroke();
  // darwaza (beech)
  ctx.fillStyle = '#3d2716'; D.rr(ctx, -62, -252, 124, 252, 8); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#ffd23f'; D.circ(ctx, 34, -126, 9); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3; ctx.strokeRect(-62, -252, 124, 126);
  // khidkiyaan (do) — raat me garam roshni
  const win = (wx) => {
    if (o.night) lampPool(wx, -330, 120, 0.4);
    ctx.fillStyle = o.night ? '#ffca7a' : '#bfe6f5'; D.rr(ctx, wx - 62, -392, 124, 124, 8); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    ctx.strokeStyle = 'rgba(38,34,31,0.7)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(wx, -392); ctx.lineTo(wx, -268); ctx.moveTo(wx - 62, -330); ctx.lineTo(wx + 62, -330); ctx.stroke();
    if (o.night) { ctx.fillStyle = 'rgba(120,70,20,0.55)'; ctx.fillRect(wx - 20, -392, 12, 124); } // parde ki parchaai
  };
  win(-205); win(205);
  // neeche ki patti / path
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-330, -26, 660, 26);
  ctx.restore();
}
// BANK BUILDING — origin zameen beech. o.w = chaudi (default 1240), pediment + columns + sign band.
function bankBuilding(x, gy, o = {}) {
  const w = o.w || 1240, top = gy - (o.h || 980);
  ctx.save();
  const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  g.addColorStop(0, '#232f3d'); g.addColorStop(0.5, '#33465c'); g.addColorStop(1, '#1b2634');
  ctx.fillStyle = g; ctx.fillRect(x - w / 2, top + 190, w, gy - top - 190);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.strokeRect(x - w / 2, top + 190, w, gy - top - 190);
  // pediment (triangle)
  ctx.fillStyle = '#3d5269';
  ctx.beginPath(); ctx.moveTo(x - w / 2 - 30, top + 200); ctx.lineTo(x, top); ctx.lineTo(x + w / 2 + 30, top + 200); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.stroke();
  lampPool(x, top + 96, 150, 0.35);
  ctx.fillStyle = '#ffd23f'; D.circ(ctx, x, top + 98, 46); ctx.fill();
  ctx.strokeStyle = '#8a5f10'; ctx.lineWidth = 4; ctx.stroke();
  text('₹', x, top + 100, 52, '#8a5f10');
  // sign band
  ctx.fillStyle = '#0d1622'; ctx.fillRect(x - w / 2, top + 200, w, 118);
  ctx.fillStyle = 'rgba(255,205,110,0.3)'; ctx.fillRect(x - w / 2, top + 318, w, 5);
  if (o.sign !== '') { lampPool(x, top + 259, w * 0.4, 0.20); textF(o.sign || 'BANK', x, top + 261, o.signPx || 96, '#eaf6ff', w - 120); }
  // columns
  const cols = 5, cw = w / cols;
  for (let i = 0; i < cols; i++) {
    const cxp = x - w / 2 + cw * (i + 0.5);
    const cg = ctx.createLinearGradient(cxp - 34, 0, cxp + 34, 0);
    cg.addColorStop(0, '#5a6d84'); cg.addColorStop(0.5, '#8fa3ba'); cg.addColorStop(1, '#46586e');
    ctx.fillStyle = cg; ctx.fillRect(cxp - 34, top + 360, 68, gy - top - 430);
    ctx.fillStyle = '#6d8299'; ctx.fillRect(cxp - 48, top + 336, 96, 26); ctx.fillRect(cxp - 48, gy - 96, 96, 26);
  }
  // seedhi (steps)
  ctx.fillStyle = '#2b3949'; ctx.fillRect(x - w / 2 - 40, gy - 62, w + 80, 30);
  ctx.fillStyle = '#222e3c'; ctx.fillRect(x - w / 2 - 70, gy - 32, w + 140, 32);
  // darwaza beech me (columns ke peeche gehra)
  ctx.fillStyle = 'rgba(6,10,16,0.85)'; ctx.fillRect(x - 95, gy - 330, 190, 268);
  ctx.strokeStyle = 'rgba(255,205,110,0.35)'; ctx.lineWidth = 4; ctx.strokeRect(x - 95, gy - 330, 190, 268);
  ctx.restore();
}
// JAAL (netMesh) — origin beech; w,h chaudi/unchai, sag = beech ka jhukaav, a = alpha. Laal glow wale gaanth.
function netMesh(cx, cy, w, h, sag = 90, a = 0.9, col = '255,84,66') {
  ctx.save(); ctx.globalAlpha = a;
  ctx.strokeStyle = `rgba(${col},0.85)`; ctx.lineWidth = 5; ctx.lineCap = 'round';
  const NX = 8, NY = 6;
  for (let i = 0; i <= NX; i++) { // khadi rekhaayein (jhuki hui)
    const x0 = cx - w / 2 + (w / NX) * i;
    ctx.beginPath();
    for (let j = 0; j <= 12; j++) {
      const t = j / 12, yy = cy - h / 2 + h * t;
      const xx = x0 + Math.sin(t * Math.PI) * sag * Math.sin((i / NX) * Math.PI);
      j === 0 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy);
    }
    ctx.stroke();
  }
  for (let j = 0; j <= NY; j++) { // aadi rekhaayein
    const y0 = cy - h / 2 + (h / NY) * j;
    ctx.beginPath();
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, xx = cx - w / 2 + w * t;
      const yy = y0 + Math.sin(t * Math.PI) * sag;
      i === 0 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy);
    }
    ctx.stroke();
  }
  ctx.fillStyle = `rgba(${col},0.95)`;
  for (let i = 0; i <= NX; i += 2) for (let j = 0; j <= NY; j += 2) {
    const xx = cx - w / 2 + (w / NX) * i + Math.sin((j / NY) * Math.PI) * sag * Math.sin((i / NX) * Math.PI);
    const yy = cy - h / 2 + (h / NY) * j + Math.sin((i / NX) * Math.PI) * sag * 0.4;
    D.circ(ctx, xx, yy, 7); ctx.fill();
  }
  ctx.restore();
}
// Calendar ka panna — origin beech; upar laal band + rings, andar grey lines (koi digit nahi)
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
// Ghadi — origin beech (ola se reuse)
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
// Kagaz/document — origin beech (ola se reuse)
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
// SIKKON KA PAHAAD — origin (cx, gy zameen). hgt = unchai, wid = aadhar chaudi, seed se arrangement
function coinMountain(cx, gy, wid, hgt) {
  const rows = 9;
  for (let r = 0; r < rows; r++) {
    const t = r / (rows - 1), rw = wid * (1 - t * 0.82), ry = gy - 14 - r * (hgt / rows);
    const n = Math.max(2, Math.round(rw / 62));
    for (let i = 0; i < n; i++) {
      const px = cx - rw / 2 + (i + 0.5) * (rw / n) + (hash(r * 13.7 + i * 3.1) - 0.5) * 18;
      ctx.fillStyle = (r + i) % 3 ? '#d9a52e' : '#f2c14e';
      D.ell(ctx, px, ry, 34, 13); ctx.fill();
      ctx.strokeStyle = 'rgba(138,95,16,0.8)'; ctx.lineWidth = 2; ctx.stroke();
    }
  }
  // kinare par bikhre sikke
  for (let i = 0; i < 7; i++) {
    const px = cx + (hash(i * 7.9) - 0.5) * wid * 1.25;
    ctx.fillStyle = i % 2 ? '#d9a52e' : '#f2c14e';
    D.ell(ctx, px, gy - 8 - hash(i * 3.3) * 8, 30, 11); ctx.fill();
    ctx.strokeStyle = 'rgba(138,95,16,0.8)'; ctx.lineWidth = 2; ctx.stroke();
  }
  lampPool(cx, gy - hgt * 0.55, wid * 0.62, 0.20);
  text('₹', cx, gy - hgt - 26, 54, '#ffd94d');
}
// LOAN BAR — origin (x, y) = bar ka beech; frac = bhara hua hissa 0..1
function barMeter(x, y, w, h, frac, col = '#c9a227', o = {}) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(10,10,14,0.9)'; D.rr(ctx, -w / 2, -h / 2, w, h, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 5; ctx.stroke();
  const iw = (w - 24) * D.clamp(frac, 0, 1);
  if (iw > 8) {
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, col); g.addColorStop(1, '#141210');
    ctx.fillStyle = g; D.rr(ctx, -w / 2 + 12, -h / 2 + 12, iw, h - 24, 10); ctx.fill();
    lampPool(-w / 2 + 12 + iw, 0, 90, 0.4, col === '#b3231b' ? '255,90,70' : '255,214,120');
  }
  if (o.lab) text(o.lab, 0, 2, fitPx(o.lab, o.labPx || 74, w - 90), '#ffffff');
  ctx.restore();
}
// KALAM (pen) MACRO — origin nib ki nok; rot ghumaav
function penNib(x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  lampPool(0, -60, 260, 0.25);
  // barrel (upar ki taraf lamba)
  const bg = ctx.createLinearGradient(-40, 0, 40, 0);
  bg.addColorStop(0, '#1c2733'); bg.addColorStop(0.5, '#3d5269'); bg.addColorStop(1, '#141e29');
  ctx.fillStyle = bg; D.rr(ctx, -42, -560, 84, 380, 30); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#c9a227'; ctx.fillRect(-42, -196, 84, 26);
  // sunehri nib
  const ng = ctx.createLinearGradient(-46, 0, 46, 0);
  ng.addColorStop(0, '#a87f1e'); ng.addColorStop(0.5, '#ffe98a'); ng.addColorStop(1, '#a87f1e');
  ctx.fillStyle = ng;
  ctx.beginPath(); ctx.moveTo(-46, -170); ctx.lineTo(46, -170); ctx.lineTo(14, -46); ctx.lineTo(0, 0); ctx.lineTo(-14, -46); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#6e5410'; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.fillStyle = '#3a2c07'; D.circ(ctx, 0, -58, 9); ctx.fill();
  ctx.strokeStyle = '#6e5410'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, -58); ctx.lineTo(0, -6); ctx.stroke();
  ctx.restore();
}
// CHAABI MACRO — origin beech
function keyDraw(x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  lampPool(0, 0, 300, 0.4);
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 17; D.circ(ctx, -52, -58, 78); ctx.stroke();
  ctx.fillStyle = '#e9c95c'; D.rr(ctx, 4, -28, 216, 54, 22); ctx.fill(); ctx.strokeStyle = '#8a5f10'; ctx.lineWidth = 4.5; ctx.stroke();
  ctx.fillStyle = '#e9c95c'; ctx.fillRect(168, 24, 36, 50); ctx.fillRect(112, 24, 30, 38);
  ctx.strokeStyle = '#8a5f10'; ctx.lineWidth = 3.5; ctx.strokeRect(168, 24, 36, 50); ctx.strokeRect(112, 24, 30, 38);
  ctx.restore();
}
// Daudta hua CHOR silhouette — origin zameen beech, flip: 1 = daayein bhaagta
function runnerSil(x, gy, s, o = {}) {
  const col = o.col || '#0a0e14', flip = o.flip || 1, ph = o.ph || 0;
  ctx.save(); ctx.translate(x, gy); ctx.scale(s * flip, s);
  D.softShadow(ctx, 0, 8, 90, 13, 0.32);
  ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round';
  const run = Math.sin(ph);
  // taangein (daud)
  ctx.lineWidth = 30;
  ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(-58 - run * 42, -78); ctx.lineTo(-96 - run * 55, -6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(58 + run * 42, -82); ctx.lineTo(30 + run * 30, -4); ctx.stroke();
  // dhad (aage jhuka)
  ctx.lineWidth = 44;
  ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(38, -262); ctx.stroke();
  // sir
  D.circ(ctx, 58, -296, 36); ctx.fill();
  // topi jaisi parchaai
  ctx.fillRect(30, -326, 74, 12);
  // baanhein — ek me sikka
  ctx.lineWidth = 26;
  ctx.beginPath(); ctx.moveTo(34, -246); ctx.lineTo(-36 - run * 26, -182); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(34, -246); ctx.lineTo(96, -196); ctx.stroke();
  if (o.coin) coinDraw(112, -190, 30);
  ctx.restore();
}
// BANK KI MACHINE — origin (x, gy) zameen beech; slot me sikka kheenchti hai. suck = 0..1 (sikka slot ki taraf)
function bankMachine(x, gy, s, f, suck = 0, coinFrom = null) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  D.softShadow(ctx, 0, 12, 240, 22, 0.4);
  const g = ctx.createLinearGradient(-190, 0, 190, 0);
  g.addColorStop(0, '#232f3d'); g.addColorStop(0.5, '#3d5269'); g.addColorStop(1, '#1b2634');
  ctx.fillStyle = g; D.rr(ctx, -190, -430, 380, 430, 18); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  // upar ki screen
  ctx.fillStyle = '#0a1826'; D.rr(ctx, -140, -396, 280, 130, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(126,200,255,0.6)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#7ec8ff'; text('EMI', 0, -330, 74, '#7ec8ff');
  // slot (muh)
  ctx.fillStyle = '#05080c'; D.rr(ctx, -120, -196, 240, 44, 20); ctx.fill();
  ctx.strokeStyle = '#ff5147'; ctx.lineWidth = 5; ctx.stroke();
  lampPool(0, -174, 150, 0.22 + 0.1 * Math.sin(f * 0.4), '255,80,60');
  // daant jaisi grill
  ctx.fillStyle = 'rgba(230,238,248,0.75)';
  for (let i = 0; i < 5; i++) ctx.fillRect(-100 + i * 44, -150, 16, 34);
  // neeche ka darwaza/panel
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 3; ctx.strokeRect(-140, -96, 280, 70);
  ctx.restore();
  // kheenchta hua sikka (machine ke bahar, world coords me)
  if (coinFrom && suck > 0) {
    const sx = D.lerp(coinFrom[0], x, sstep(suck)), sy = D.lerp(coinFrom[1], gy - 174 * s, sstep(suck));
    ctx.save(); ctx.globalAlpha = 1 - suck * 0.25;
    coinDraw(sx, sy, 40 * (1 - suck * 0.3));
    ctx.restore();
  }
}
// Aadmi silhouette (bank counter/line ke liye)
function personSil(x, gy, s, o = {}) {
  const col = o.col || '#0c1016', flip = o.flip || 1;
  ctx.save(); ctx.translate(x, gy); ctx.scale(s * flip, s);
  D.softShadow(ctx, 0, 8, 62, 12, 0.3);
  ctx.fillStyle = col;
  D.circ(ctx, 0, -308, 37); ctx.fill();
  D.rr(ctx, -40, -272, 80, 148, 30); ctx.fill();
  D.rr(ctx, -38, -128, 30, 128, 13); ctx.fill();
  D.rr(ctx, 9, -128, 30, 128, 13); ctx.fill();
  ctx.save(); ctx.rotate(o.armA || 0.12); D.rr(ctx, -58, -262, 24, 118, 11); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(46, -258); ctx.rotate(o.armB || -0.12); D.rr(ctx, -11, 0, 24, 118, 11); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(255,214,140,0.35)'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -308, 38, -0.4, 0.9); ctx.stroke();
  ctx.restore();
}

// ================= SHOTS =================
// ===== S1 (0–103) "Tumhare ghar par roz ek scam ho raha hai — aur tumhe khabar hi nahi!" =====
// 1a LOW-ANGLE WIDE: raat me ghar, chaand, camera slow dive-in
shot(0, 36, 0.30, { cx: 1080, cy: 1620, s: 0.52 }, { cx: 1080, cy: 1470, s: 0.63 }, (f, u) => {
  layer(0.5, () => nightSky(GY, f));
  layer(0.78, () => { // mohalle ke peeche wale ghar
    ctx.fillStyle = '#08131d';
    for (let i = 0; i < 6; i++) { const bx = -620 + i * 580, bh = 430 + hash(i * 3.7) * 300; ctx.fillRect(bx, GY - bh, 400, bh); }
    ctx.fillStyle = 'rgba(255,205,110,0.5)';
    for (let i = 0; i < 9; i++) if (hash(i * 6.1) < 0.55) ctx.fillRect(-520 + i * 430, GY - 330 - hash(i * 3) * 200, 30, 40);
  });
  layer(1, () => {
    ground(GY, '#0a100d', '#101812');
    lampPool(1080, GY - 400, 800, 0.22);
    houseDraw(1080, GY, 1.5, { night: true, smokeF: f });
    lightCone(430, GY - 940, GY, 44, 280, 0.09);
    ctx.fillStyle = '#0d1420'; ctx.fillRect(417, GY - 1010, 24, 1010);
    lampPool(430, GY - 970, 120, 0.5); ctx.fillStyle = '#ffe9a8'; D.circ(ctx, 430, GY - 970, 15); ctx.fill();
    dust(f, 1080, 1800, 900, 9, 0.13);
  });
});
// 1b TOP-DOWN: upar se mohalla, ghar par bada JAAL girta hua (VFX glow)
shot(36, 72, 0.34, { cx: 1080, cy: 1500, s: 0.60, rot: 0.04 }, { cx: 1080, cy: 1330, s: 0.70, rot: -0.03 }, (f, u) => {
  const lf = f - 36, drop = sstep(D.clamp(lf / 26, 0, 1));
  layer(0.65, () => { // upar se dikhti chhatein (top-down mohalla)
    ctx.fillStyle = '#0a121e'; ctx.fillRect(-800, -800, 3760, 4640);
    for (let i = 0; i < 14; i++) {
      const rx = -400 + (i % 5) * 640 + hash(i * 3.3) * 120, ry = 200 + Math.floor(i / 5) * 780 + hash(i * 7.1) * 140;
      if (Math.abs(rx - 1080) < 420 && Math.abs(ry - 1300) < 420) continue;
      ctx.fillStyle = i % 3 ? '#16222f' : '#1c2a3a'; ctx.fillRect(rx, ry, 430, 480);
      ctx.strokeStyle = 'rgba(150,190,225,0.16)'; ctx.lineWidth = 4; ctx.strokeRect(rx, ry, 430, 480);
      ctx.fillStyle = 'rgba(255,205,110,0.35)'; ctx.fillRect(rx + 60, ry + 60, 52, 52);
    }
    // sadak ki lakeerein
    ctx.fillStyle = 'rgba(240,220,160,0.20)';
    for (let i = 0; i < 10; i++) ctx.fillRect(-600 + i * 340, 2130, 170, 13);
  });
  layer(1, () => {
    // hero chhat (beech me, upar se)
    ctx.fillStyle = '#5e2620'; ctx.fillRect(660, 890, 840, 820);
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 8; ctx.strokeRect(660, 890, 840, 820);
    const rg = ctx.createLinearGradient(660, 890, 1500, 1710);
    rg.addColorStop(0, 'rgba(255,150,110,0.25)'); rg.addColorStop(0.5, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = rg; ctx.fillRect(660, 890, 840, 820);
    ctx.strokeStyle = 'rgba(20,12,10,0.65)'; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(1080, 890); ctx.lineTo(1080, 1710); ctx.stroke();
    ctx.fillStyle = '#3d3d44'; ctx.fillRect(1290, 1010, 92, 130); // chimni upar se
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.strokeRect(1290, 1010, 92, 130);
    // girta hua jaal
    const nw = D.lerp(1900, 1180, drop), nh = D.lerp(1500, 980, drop), na = 0.25 + drop * 0.7;
    lampPool(1080, 1300, 900, 0.10 + drop * 0.22, '255,84,66');
    netMesh(1080, 1300 + (1 - drop) * -160, nw, nh, 60 + drop * 90, na);
    if (lf > 24) D.drawSparkle(ctx, 700, 1010, 30, 0.8);
    if (lf > 29) D.drawSparkle(ctx, 1470, 1580, 26, 0.7);
  });
});
// 1c PUSH-IN: khidki ke paas laal board "GHAR PAR SCAM?" (hit 95)
shot(72, 103, 0.34, { cx: 1020, cy: 1440, s: 0.66 }, { cx: 1060, cy: 1390, s: 0.80 }, (f, u) => {
  const lf = f - 72;
  layer(0.5, () => nightSky(GY, f));
  layer(1, () => {
    ground(GY, '#0a100d', '#101812');
    houseDraw(1080, GY, 1.5, { night: true, smokeF: f });
    darkPool(1080, 1500, 1250, 0.25);
    if (lf >= 17) redBoard(1080, 1130, 820, 300, [['GHAR PAR SCAM?', 96, '#ffb59a']], spring((lf - 17) / 6));
    if (lf >= 23) D.drawSparkle(ctx, 690, 990, 30, 0.85);
    dust(f, 1080, 1700, 800, 7, 0.12);
  });
}, [95]);

// ===== S2 (103–206) "Home loan matlab — bank ke paiso se ghar, tees saal tak EMI." =====
// 2a BANK extreme LOW-ANGLE: neeche se upar ki taraf
shot(103, 138, 0.30, { cx: 1080, cy: 1760, s: 0.50 }, { cx: 1080, cy: 1620, s: 0.60 }, (f, u) => {
  layer(0.5, () => daySky(GY, f));
  layer(0.8, () => {
    ctx.fillStyle = '#0d1826';
    for (let i = 0; i < 5; i++) { const bx = -600 + i * 640, bh = 560 + hash(i * 4.3) * 360; ctx.fillRect(bx, GY - bh, 430, bh); }
  });
  layer(1, () => {
    ground(GY, '#0e1410', '#16211a');
    lampPool(1080, GY - 700, 900, 0.20);
    bankBuilding(1080, GY, { w: 1360, h: 1120, sign: 'BANK', signPx: 110 });
    dust(f, 1080, 1800, 1000, 9, 0.13);
  });
});
// 2b FLY-OVER: bank se ghar tak side track, parallax
shot(138, 172, 0.28, { cx: 760, cy: 1520, s: 0.58 }, { cx: 1330, cy: 1520, s: 0.58 }, (f, u) => {
  layer(0.45, () => daySky(GY, f));
  layer(0.7, () => { // beech ki imaaratein tez peeche
    ctx.fillStyle = '#0e1a28';
    for (let i = 0; i < 8; i++) { const bx = -300 + i * 470, bh = 480 + hash(i * 5.1) * 330; ctx.fillRect(bx, GY - bh, 330, bh); }
    ctx.fillStyle = 'rgba(255,205,110,0.4)';
    for (let i = 0; i < 10; i++) if (hash(i * 4.7) < 0.5) ctx.fillRect(-200 + i * 380, GY - 380 - hash(i * 3) * 220, 28, 38);
  });
  layer(1, () => {
    ground(GY, '#0e1410', '#16211a');
    bankBuilding(180, GY, { w: 900, h: 800, sign: 'BANK', signPx: 84 });
    // sikkon ki dhaar bank se ghar ki taraf
    for (let i = 0; i < 9; i++) {
      const p = ((f * 0.02 + i / 9) % 1);
      const px = D.lerp(480, 1560, p), py = GY - 620 + Math.sin(p * 9 + i) * 60 - p * 160;
      ctx.save(); ctx.globalAlpha = 0.35 + p * 0.65; coinDraw(px, py, 30); ctx.restore();
    }
    houseDraw(1740, GY, 1.25, { wallCol: '#97744e' });
    dust(f, 1080, 1800, 1000, 7, 0.10);
  });
});
// 2c MOHAR: kagaz par "HOME LOAN" badi stamp (hit 195)
shot(172, 206, 0.32, { cx: 1080, cy: 1400, s: 0.60 }, { cx: 1080, cy: 1350, s: 0.72 }, (f, u) => {
  const lf = f - 172;
  layer(0.6, () => { ctx.fillStyle = '#0a0d13'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1200, 0.18); });
  layer(1, () => {
    ground(GY, '#0c0f0a', '#131a12');
    docPaper(1080, 1330, 720, 940, { rot: -0.04, rows: 8, head: 'LOAN FILE', headCol: '#26303c' });
    if (lf >= 20) stampSolid(1080, 1300, 800, 330, [['HOME LOAN', 118]], -0.07, spring((lf - 20) / 6), '#1d4e79', '#122f4a');
    if (lf >= 26) D.drawSparkle(ctx, 720, 1080, 28, 0.8);
  });
}, [195]);

// ===== S3 (206–341) "Bank wala bola — 'Apna ghar kab loge sir? Tees saal kar lo, EMI sirf chaalis hazaar.'" =====
// 3a COUNTER SIDE angle: kagaz viewer ki taraf sarakta
shot(206, 251, 0.30, { cx: 1000, cy: 1480, s: 0.58 }, { cx: 1120, cy: 1440, s: 0.64 }, (f, u) => {
  const lf = f - 206;
  layer(0.6, () => { ctx.fillStyle = '#0b1017'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1250, 1300, 0.16, '160,200,255'); });
  layer(1, () => {
    // bank hall: peeche columns ki kataar
    ctx.fillStyle = '#131e2c'; ctx.fillRect(-500, 500, 3160, GY - 500);
    for (let i = 0; i < 5; i++) {
      const cxp = -200 + i * 640;
      const cg = ctx.createLinearGradient(cxp - 30, 0, cxp + 30, 0);
      cg.addColorStop(0, '#33465c'); cg.addColorStop(0.5, '#5a718c'); cg.addColorStop(1, '#26344a');
      ctx.fillStyle = cg; ctx.fillRect(cxp - 30, 560, 60, GY - 560);
    }
    ground(GY, '#0d1210', '#141c18');
    // counter table (side se lambi patti)
    ctx.fillStyle = '#2b1d12'; ctx.fillRect(430, GY - 300, 1300, 46);
    ctx.fillStyle = '#1d130b'; ctx.fillRect(430, GY - 254, 1300, 254);
    ctx.strokeStyle = 'rgba(255,205,110,0.3)'; ctx.lineWidth = 4; ctx.strokeRect(430, GY - 300, 1300, 46);
    // bank wala silhouette counter ke peeche
    personSil(700, GY - 254, 1.05, { col: '#0a0e14', armB: -0.9 });
    // sarakta hua kagaz
    const px = D.lerp(760, 1150, sstep(D.clamp(lf / 30, 0, 1)));
    docPaper(px, GY - 420, 380, 500, { rot: D.lerp(-0.16, 0.05, sstep(D.clamp(lf / 30, 0, 1))), rows: 6, head: 'HOME LOAN', headCol: '#7a1d12' });
    lightCone(1080, 620, GY - 300, 90, 700, 0.07);
    dust(f, 1080, 1500, 900, 8, 0.12);
  });
});
// 3b BOARD POP: pehle "30 SAAL", phir "EMI SIRF 40,231" spring ke saath
shot(251, 296, 0.30, { cx: 1080, cy: 1400, s: 0.58 }, { cx: 1080, cy: 1350, s: 0.68 }, (f, u) => {
  const lf = f - 251;
  layer(0.55, () => { ctx.fillStyle = '#0b1017'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1250, 0.18); });
  layer(1, () => {
    ground(GY, '#0d1210', '#141c18');
    bankBuilding(1080, GY, { w: 1150, h: 860, sign: 'BANK', signPx: 88 });
    darkPool(1080, 1500, 1300, 0.35);
    if (lf >= 3) darkBoard(1080, 1180, 640, 260, [['30 SAAL', 130, '#ffd94d']], spring((lf - 3) / 9));
    if (lf >= 22) goldBoard(1080, 1560, 860, 320, [['EMI SIRF', 62, '#ffe9b0'], ['40,231', 165, '#ffd94d']], spring((lf - 22) / 9), (lf % 40) / 40);
    if (lf >= 30) D.drawSparkle(ctx, 660, 1440, 30, 0.8);
  });
});
// 3c CHAABI MACRO: ghar ki chaabi chamakti ghumti
shot(296, 341, 0.28, { cx: 1080, cy: 1400, s: 0.62 }, { cx: 1080, cy: 1360, s: 0.80 }, (f, u) => {
  const lf = f - 296;
  layer(0.6, () => daySky(GY, f));
  layer(0.85, () => { houseDraw(1080, GY, 1.4, {}); darkPool(1080, 1400, 1450, 0.32); });
  layer(1, () => {
    ground(GY, '#0e1410', '#16211a');
    const kp = spring(lf / 10);
    ctx.save(); ctx.translate(1080, 1300); ctx.scale(kp, kp);
    keyDraw(0, 0, 1.35, -0.32 + 0.12 * Math.sin(f * 0.1));
    ctx.fillStyle = '#14100a'; D.rr(ctx, -215, 120, 230, 100, 16); ctx.fill(); ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 4; ctx.stroke();
    text('NAYA GHAR', -100, 171, 42, '#ffd94d');
    ctx.restore();
    D.drawSparkle(ctx, 880, 1120, 36, 0.85); D.drawSparkle(ctx, 1300, 1460, 28, 0.7);
    for (let i = 0; i < 12; i++) { // confetti
      const cxp = 420 + hash(i * 4.9) * 1320, cyp = ((hash(i * 6.7) * 700 + lf * (6 + hash(i) * 5)) % 1100) + 700;
      ctx.save(); ctx.translate(cxp, cyp); ctx.rotate(lf * 0.15 + i * 2);
      ctx.fillStyle = ['#ffd94d', '#3ddc74', '#ff8a5c'][i % 3]; ctx.fillRect(-10, -5, 20, 10); ctx.restore();
    }
  });
});

// ===== S4 (341–391) "Tumne khushi se sign kar diya." =====
// 4a KALAM MACRO: kagaz par signature line kheenchti
shot(341, 368, 0.30, { cx: 1080, cy: 1420, s: 0.66 }, { cx: 1090, cy: 1380, s: 0.78 }, (f, u) => {
  const lf = f - 341, draw01 = sstep(D.clamp(lf / 20, 0, 1));
  layer(0.6, () => { ctx.fillStyle = '#0d0b09'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1200, 0.2); });
  layer(1, () => {
    ground(GY, '#0d0b09', '#15110d');
    docPaper(1080, 1380, 780, 1010, { rot: -0.03, rows: 8, head: 'LOAN AGREEMENT', headCol: '#26303c' });
    // signature ki lakeer (kheenchti hui)
    const sx0 = 800, sy0 = 1700;
    ctx.strokeStyle = '#1d3a8a'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    const pts = [[0, 0], [60, -52], [120, 26], [180, -64], [250, 8], [310, -40], [380, 18], [450, -16]];
    const total = pts.length - 1, upto = draw01 * total;
    ctx.moveTo(sx0, sy0);
    for (let i = 1; i <= Math.floor(upto); i++) ctx.lineTo(sx0 + pts[i][0], sy0 + pts[i][1]);
    const fr = upto - Math.floor(upto), li = Math.min(Math.floor(upto), total - 1);
    const ex = sx0 + D.lerp(pts[li][0], pts[li + 1][0], fr), ey = sy0 + D.lerp(pts[li][1], pts[li + 1][1], fr);
    if (upto > 0) ctx.lineTo(ex, ey);
    ctx.stroke();
    // kalam nok signature ke ant par
    penNib(ex + 26, ey - 6, 1.15, 0.5 + 0.06 * Math.sin(f * 0.3));
    plate(1080, 760, 520, 104, 'SIGN KAR DIYA', 50, '#ffd94d');
  });
});
// 4b MOHAR THAP: laal nishan kagaz par (hit 380)
shot(368, 391, 0.32, { cx: 1080, cy: 1400, s: 0.66 }, { cx: 1080, cy: 1370, s: 0.74 }, (f, u) => {
  const lf = f - 368;
  layer(0.6, () => { ctx.fillStyle = '#0d0b09'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1200, 0.2, '255,120,90'); });
  layer(1, () => {
    ground(GY, '#0d0b09', '#15110d');
    docPaper(1080, 1380, 780, 1010, { rot: -0.03, rows: 8, head: 'LOAN AGREEMENT', headCol: '#26303c' });
    ctx.strokeStyle = '#1d3a8a'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(800, 1700);
    const pts = [[60, -52], [120, 26], [180, -64], [250, 8], [310, -40], [380, 18], [450, -16]];
    for (const p of pts) ctx.lineTo(800 + p[0], 1700 + p[1]);
    ctx.stroke();
    if (lf >= 10) stampDraw(1290, 1150, 460, 210, [['APPROVED', 64]], '#b3231b', -0.16, spring((lf - 10) / 5));
    // upar se aata mohar handle (thap se pehle)
    if (lf < 10) {
      const hy = D.lerp(500, 1080, sstep(lf / 10));
      ctx.fillStyle = '#4a3220'; D.rr(ctx, 1240, hy - 260, 100, 190, 20); ctx.fill();
      ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = '#8a2f26'; D.rr(ctx, 1180, hy - 80, 220, 90, 12); ctx.fill(); ctx.stroke();
    }
    dust(f, 1080, 1400, 800, 7, 0.12);
  });
}, [380]);

// ===== S5 (391–506) "Ab ek EMI ka postmortem karte hain — andar ka design dekhte hain." =====
// 5a EMI KAGAZ FLY-IN: camera ki taraf bada hota
shot(391, 430, 0.30, { cx: 1080, cy: 1400, s: 0.55 }, { cx: 1080, cy: 1330, s: 0.85 }, (f, u) => {
  const lf = f - 391;
  layer(0.6, () => { ctx.fillStyle = '#070a10'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1300, 0.18, '255,170,120'); });
  layer(1, () => {
    // peeche bank ki halki parchaai
    bankBuilding(1080, GY, { w: 1100, h: 800, sign: '', signPx: 80 });
    darkPool(1080, 1400, 1500, 0.45);
    const sc = D.lerp(0.55, 1.25, sstep(u)), rot = D.lerp(-0.3, -0.04, sstep(u)) + Math.sin(f * 0.08) * 0.02;
    docPaper(1080, 1300, 700, 920, { rot, sc, rows: 9, head: 'EMI CHART', headCol: '#7a1d12' });
    // kagaz ke saath udte chhote kagaz
    for (let i = 0; i < 5; i++) {
      const px = 480 + hash(i * 6.3) * 1200, py = 900 + hash(i * 8.1) * 900 + Math.sin(f * 0.1 + i * 2) * 26;
      docPaper(px, py, 130, 175, { rot: (hash(i * 4.4) - 0.5) * 0.9, rows: 4 });
    }
    if (lf > 24) plate(1080, 700, 640, 108, 'EMI KA POSTMORTEM', 54, '#ffd94d');
  });
});
// 5b FLY-THROUGH: camera kagaz ke ANDAR — kagaz ki duniya, tairte sikke aur ₹
shot(430, 470, 0.30, { cx: 1080, cy: 1300, s: 0.85 }, { cx: 1080, cy: 1300, s: 1.35 }, (f, u) => {
  const lf = f - 430;
  layer(0.5, () => { // kagaz ki duniya: halki cream duniya, devaar par badi lines
    ctx.fillStyle = '#ddd5bf'; ctx.fillRect(-1200, -1200, 4560, 5040);
    const pg = ctx.createRadialGradient(1080, 1300, 200, 1080, 1300, 1900);
    pg.addColorStop(0, 'rgba(255,252,240,0.5)'); pg.addColorStop(1, 'rgba(120,105,80,0.45)');
    ctx.fillStyle = pg; ctx.fillRect(-1200, -1200, 4560, 5040);
    ctx.fillStyle = 'rgba(40,44,52,0.30)';
    for (let i = 0; i < 7; i++) ctx.fillRect(-1000, 120 + i * 460, 4160, 34);
  });
  layer(1, () => {
    // tairte sikke camera ki taraf badhte
    for (let i = 0; i < 10; i++) {
      const p = ((lf * 0.022 * (0.7 + hash(i * 3.3) * 0.6) + hash(i * 9.7)) % 1);
      const px = 1080 + (hash(i * 5.9) - 0.5) * (500 + p * 2100), py = 1300 + (hash(i * 7.3) - 0.5) * (400 + p * 1500);
      ctx.save(); ctx.globalAlpha = 0.25 + p * 0.75; coinDraw(px, py, 22 + p * 74); ctx.restore();
    }
    // bade tairte ₹ nishan
    for (let i = 0; i < 5; i++) {
      const px = 500 + hash(i * 4.1) * 1160, py = 600 + hash(i * 6.9) * 1300 + Math.sin(f * 0.06 + i * 1.8) * 30;
      ctx.save(); ctx.globalAlpha = 0.16; text('₹', px, py, 300, '#7a5a18'); ctx.restore();
    }
    lampPool(1080, 1300, 900, 0.22, '255,240,200');
  });
});
// 5c KAGAZ PHAT-TA hai: do hisso me tear effect
shot(470, 506, 0.34, { cx: 1080, cy: 1330, s: 0.80 }, { cx: 1080, cy: 1310, s: 0.86 }, (f, u) => {
  const lf = f - 470, tear = sstep(D.clamp((lf - 6) / 22, 0, 1));
  layer(0.6, () => { ctx.fillStyle = '#0a0708'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1300, 0.24, '255,90,60'); });
  layer(1, () => {
    const W2 = 740, H2 = 960, cxp = 1080, cyp = 1300;
    const jag = [];
    for (let j = 0; j <= 8; j++) jag.push([(hash(j * 3.17) - 0.5) * 46, -H2 / 2 + (H2 / 8) * j]);
    const half = (side) => { // side: -1 baayein, +1 daayein
      ctx.save();
      ctx.translate(cxp + side * tear * 260, cyp + tear * 60);
      ctx.rotate(side * tear * 0.16);
      ctx.beginPath();
      if (side < 0) {
        ctx.moveTo(-W2 / 2, -H2 / 2);
        for (const p of jag) ctx.lineTo(p[0], p[1]);
        ctx.lineTo(-W2 / 2, H2 / 2); ctx.closePath();
      } else {
        ctx.moveTo(W2 / 2, -H2 / 2);
        for (const p of jag) ctx.lineTo(p[0], p[1]);
        ctx.lineTo(W2 / 2, H2 / 2); ctx.closePath();
      }
      ctx.clip();
      ctx.fillStyle = side < 0 ? '#e8e2d2' : '#e2dac6'; ctx.fillRect(-W2 / 2 - 4, -H2 / 2 - 4, W2 + 8, H2 + 8);
      ctx.strokeStyle = '#8a8272'; ctx.lineWidth = 4; ctx.strokeRect(-W2 / 2, -H2 / 2, W2, H2);
      ctx.fillStyle = '#7a1d12'; ctx.fillRect(-W2 / 2 + 26, -H2 / 2 + 24, W2 - 52, 12);
      ctx.fillStyle = 'rgba(40,44,52,0.75)';
      for (let i = 0; i < 8; i++) { const lw = (W2 - 90) * (0.55 + hash(i * 3.7 + W2) * 0.4); ctx.fillRect(-W2 / 2 + 30, -H2 / 2 + 66 + i * ((H2 - 130) / 8), lw, 13); }
      ctx.restore();
      // phata kinara (safed jagged line)
      ctx.save(); ctx.translate(cxp + side * tear * 260, cyp + tear * 60); ctx.rotate(side * tear * 0.16);
      ctx.strokeStyle = 'rgba(255,250,235,0.9)'; ctx.lineWidth = 5; ctx.lineJoin = 'round';
      ctx.beginPath(); jag.forEach((p, j) => j === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])); ctx.stroke();
      ctx.restore();
    };
    half(-1); half(1);
    // beech ki daraar me laal glow
    if (tear > 0.1) lampPool(cxp, cyp, 260 + tear * 420, 0.30 * tear, '255,70,50');
    // girte kagaz ke tukde
    for (let i = 0; i < 6; i++) {
      const fp = D.clamp((lf - 12 - i * 3) / 18, 0, 1); if (fp <= 0) continue;
      const tx = 900 + i * 70, ty = 1150 + fp * fp * 700;
      ctx.save(); ctx.translate(tx, ty); ctx.rotate(fp * 4 + i * 1.7);
      ctx.fillStyle = '#d8d0ba'; ctx.fillRect(-24, -16, 48, 32);
      ctx.restore();
    }
  });
});

// ===== S6 (506–599) "Chaalis hazaar me sadhe saintees hazaar seedha byaaj me gaya!" =====
// 6a PHATA hissa LAAL: kagaz ka bada hissa laal rang pakadta
shot(506, 541, 0.34, { cx: 1010, cy: 1330, s: 0.78 }, { cx: 1060, cy: 1310, s: 0.84 }, (f, u) => {
  const lf = f - 506, fill01 = sstep(D.clamp(lf / 24, 0, 1));
  layer(0.6, () => { ctx.fillStyle = '#0c0608'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1000, 1300, 1250, 0.26, '255,80,60'); });
  layer(1, () => {
    // phata kagaz (sthir, do hisse)
    ctx.save(); ctx.translate(830, 1300); ctx.rotate(-0.13);
    ctx.fillStyle = '#e8e2d2'; D.rr(ctx, -330, -470, 660, 940, 8); ctx.fill();
    ctx.strokeStyle = '#8a8272'; ctx.lineWidth = 4; ctx.stroke();
    ctx.save(); D.rr(ctx, -330, -470, 660, 940, 8); ctx.clip();
    ctx.fillStyle = 'rgba(179,35,27,0.88)'; ctx.fillRect(-330, -470, 660, 940 * fill01);
    ctx.fillStyle = 'rgba(40,44,52,0.5)';
    for (let i = 0; i < 8; i++) ctx.fillRect(-300, -380 + i * 105, 500 * (0.5 + hash(i * 3.7) * 0.45), 13);
    ctx.restore(); ctx.restore();
    ctx.save(); ctx.translate(1420, 1330); ctx.rotate(0.15);
    ctx.fillStyle = '#e2dac6'; D.rr(ctx, -170, -470, 340, 940, 8); ctx.fill();
    ctx.strokeStyle = '#8a8272'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = 'rgba(40,44,52,0.6)';
    for (let i = 0; i < 8; i++) ctx.fillRect(-140, -380 + i * 105, 220, 13);
    ctx.restore();
    if (lf > 16) plate(830, 640, 480, 104, 'BADA HISSA', 52, '#ff8a7a');
    dust(f, 1080, 1400, 800, 7, 0.12);
  });
});
// 6b SIKKON KI DHAAR: bank ki taraf behti (side track)
shot(541, 571, 0.32, { cx: 900, cy: 1400, s: 0.62 }, { cx: 1230, cy: 1400, s: 0.62 }, (f, u) => {
  layer(0.55, () => { ctx.fillStyle = '#0a0810'; ctx.fillRect(-800, -600, 3760, 4440); vgrad(-600, GY + 40, [[0, '#0a0810'], [1, '#200d12']]); });
  layer(0.8, () => bankBuilding(1720, GY, { w: 880, h: 820, sign: 'BANK', signPx: 80 }));
  layer(1, () => {
    ground(GY, '#0e0a0a', '#171010');
    // baayein: phata laal kagaz — yahin se dhaar nikalti hai
    ctx.save(); ctx.translate(430, GY - 330); ctx.rotate(-0.18);
    ctx.fillStyle = '#e8e2d2'; D.rr(ctx, -190, -300, 380, 600, 8); ctx.fill();
    ctx.strokeStyle = '#8a8272'; ctx.lineWidth = 4; ctx.stroke();
    ctx.save(); D.rr(ctx, -190, -300, 380, 600, 8); ctx.clip();
    ctx.fillStyle = 'rgba(179,35,27,0.85)'; ctx.fillRect(-190, -300, 380, 470);
    ctx.restore(); ctx.restore();
    lampPool(430, GY - 330, 380, 0.3, '255,80,60');
    // sikkon ki lehar (do katarein bank ki taraf, frame ke beech se)
    for (let r = 0; r < 2; r++) for (let i = 0; i < 11; i++) {
      const p = ((f * 0.028 + i / 11 + r * 0.5) % 1);
      const px = D.lerp(480, 1690, p), py = GY - 560 - r * 170 + Math.sin(p * 12 + r * 3) * 26;
      ctx.save(); ctx.globalAlpha = 0.3 + p * 0.7; coinDraw(px, py, 26 + p * 22); ctx.restore();
    }
    lampPool(1720, GY - 400, 700, 0.22, '255,90,70');
    plate(1000, 1080, 560, 106, 'BYAAJ KI DHAAR', 52, '#ff8a7a');
    dust(f, 900, 1600, 800, 6, 0.10);
  });
});
// 6c LAAL BOARD SLAM: "BYAAJ 37,500" (hit 585)
shot(571, 599, 0.36, { cx: 1080, cy: 1380, s: 0.64 }, { cx: 1080, cy: 1360, s: 0.70 }, (f, u) => {
  const lf = f - 571;
  layer(0.6, () => { ctx.fillStyle = '#0d0508'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1350, 0.38, '255,70,50'); });
  layer(1, () => {
    ground(GY, '#0e0708', '#180b0d');
    lampPool(1080, 1250, 850, 0.34, '255,70,50');
    if (lf >= 8) redBoard(1080, 1250, 900, 400, [['BYAAJ', 84, '#ffb59a'], ['37,500', 185, '#ffffff']], spring((lf - 8) / 6));
    // board ke peeche sikke girte hue
    for (let i = 0; i < 6; i++) {
      const fp = ((lf * 0.04 + hash(i * 5.3)) % 1);
      ctx.save(); ctx.globalAlpha = 0.8 * (1 - fp); coinDraw(560 + hash(i * 7.7) * 1040, 700 + fp * 900, 30); ctx.restore();
    }
  });
}, [585]);

// ===== S7 (599–671) "Asal loan ghata? Teen hazaar se bhi kam!" =====
// 7a HARA KONA: kagaz ka chhota sa hara hissa close-up
shot(599, 633, 0.32, { cx: 1330, cy: 1420, s: 0.72 }, { cx: 1300, cy: 1390, s: 0.85 }, (f, u) => {
  layer(0.6, () => { ctx.fillStyle = '#0a0c0a'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1330, 1400, 1000, 0.18, '90,255,160'); });
  layer(1, () => {
    // bada kagaz zyada-tar laal, kone me chhota hara hissa
    ctx.save(); ctx.translate(1030, 1330); ctx.rotate(-0.06);
    ctx.fillStyle = '#e8e2d2'; D.rr(ctx, -560, -520, 1120, 1040, 10); ctx.fill();
    ctx.strokeStyle = '#8a8272'; ctx.lineWidth = 5; ctx.stroke();
    ctx.save(); D.rr(ctx, -560, -520, 1120, 1040, 10); ctx.clip();
    ctx.fillStyle = 'rgba(179,35,27,0.85)'; ctx.fillRect(-560, -520, 1120, 880);
    ctx.fillStyle = 'rgba(61,220,116,0.9)'; ctx.fillRect(330, 360, 230, 160); // hara kona (neeche daayein)
    ctx.fillStyle = 'rgba(40,44,52,0.45)';
    for (let i = 0; i < 9; i++) ctx.fillRect(-520, -430 + i * 100, 900 * (0.5 + hash(i * 3.1) * 0.45), 14);
    ctx.restore(); ctx.restore();
    lampPool(1475, 1690, 260, 0.4, '90,255,160');
    plate(1080, 620, 520, 104, 'ASAL HISSA?', 52, '#baffd2');
    dust(f, 1200, 1400, 700, 6, 0.10);
  });
});
// 7b EK AKELA SIKKA: camera uske peeche dive, plate "ASAL SIRF 2,731"
shot(633, 671, 0.32, { cx: 1080, cy: 1450, s: 0.62 }, { cx: 1080, cy: 1360, s: 0.78 }, (f, u) => {
  const lf = f - 633, fall = sstep(D.clamp(lf / 24, 0, 1));
  layer(0.6, () => { ctx.fillStyle = '#070906'; ctx.fillRect(-800, -600, 3760, 4440); vgrad(-600, GY + 40, [[0, '#070906'], [1, '#0e1a10']]); lampPool(1080, 1400, 1100, 0.16, '90,255,160'); });
  layer(0.8, () => { // upar phate kagaz ka kinara (jahan se sikka gira)
    ctx.fillStyle = '#ded6c2'; ctx.beginPath();
    ctx.moveTo(-400, -200); ctx.lineTo(2560, -200); ctx.lineTo(2560, 240);
    for (let jx = 2560; jx >= -400; jx -= 190) ctx.lineTo(jx - 95, 240 + (hash(jx * 0.13) - 0.5) * 90);
    ctx.lineTo(-400, 240); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(179,35,27,0.55)'; ctx.fillRect(-400, -200, 2960, 180);
    ctx.strokeStyle = 'rgba(255,250,235,0.5)'; ctx.lineWidth = 4; ctx.stroke();
  });
  layer(1, () => {
    ground(GY, '#0a0e0a', '#11180f');
    // akela sikka girta hua (halki ghumaav ke saath)
    const cy2 = D.lerp(760, GY - 60, fall * fall), cx2 = 1080 + Math.sin(lf * 0.2) * 22 * (1 - fall);
    // girne ki speed lakeerein
    ctx.strokeStyle = 'rgba(255,230,160,0.35)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(cx2 + i * 66, cy2 - 190); ctx.lineTo(cx2 + i * 66, cy2 - 110); ctx.stroke(); }
    ctx.save(); ctx.translate(cx2, cy2); ctx.rotate(lf * 0.14); coinDraw(0, 0, 80); ctx.restore();
    lampPool(cx2, cy2, 260, 0.38, '255,220,130');
    // zameen par uski chhoti si parchaai + hari chamak
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; D.ell(ctx, 1080, GY + 6, 90 * fall + 20, 14); ctx.fill();
    lampPool(1080, GY - 40, 320, 0.2 * fall, '90,255,160');
    if (lf >= 14) { const p = spring((lf - 14) / 8); ctx.save(); ctx.translate(1080, 1090); ctx.scale(p, p); ctx.translate(-1080, -1090); darkBoard(1080, 1090, 700, 250, [['ASAL SIRF', 62, '#ffe9b0'], ['2,731', 140, '#3ddc74']], 1); ctx.restore(); }
    dust(f, 1080, 1500, 800, 7, 0.10);
  });
});

// ===== S8 (671–771) "Das saal baad tum bank gaye — adtaalees lakh de chuke the." =====
// 8a CALENDAR PANNE TEZ udte, kone me 10 dots = saal gin-ti
shot(671, 706, 0.30, { cx: 1080, cy: 1400, s: 0.60 }, { cx: 1080, cy: 1350, s: 0.68 }, (f, u) => {
  const lf = f - 671, flown = Math.floor(lf / 3.2);
  layer(0.6, () => { ctx.fillStyle = '#0a0c11'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1200, 0.16); });
  layer(1, () => {
    ground(GY, '#0c0f0a', '#131a12');
    // udte hue panne (peeche ki taraf)
    for (let i = 0; i < 6; i++) {
      const p = ((lf * 0.03 * (0.7 + hash(i * 3.9) * 0.6) + hash(i * 8.7)) % 1);
      const px = 1080 + (hash(i * 5.3) - 0.5) * (300 + p * 1300), py = 1350 + (hash(i * 7.7) - 0.5) * (200 + p * 700) - p * 300;
      calendarPage(px, py, 200, 260, (hash(i * 4.2) - 0.5) * 1.1 + p * 1.4, 0.4 + p * 0.9);
    }
    // saamne bada calendar, panna palat-ta
    calendarPage(1080, 1330, 620, 780, Math.sin(f * 0.05) * 0.02, 1);
    const flip01 = (lf % 8) / 8;
    if (flip01 < 0.5) {
      ctx.save(); ctx.translate(1080, 1330); ctx.rotate(-0.02);
      ctx.fillStyle = '#e9e4d4';
      ctx.beginPath(); ctx.moveTo(-310, -390); ctx.lineTo(310, -390); ctx.lineTo(310, -390 + 780 * Math.cos(flip01 * Math.PI)); ctx.lineTo(-310, -390 + 780 * Math.cos(flip01 * Math.PI)); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#8a8272'; ctx.lineWidth = 3; ctx.stroke();
      ctx.restore();
    }
    // saal gin-ti: 10 dots ek-ek jalte
    for (let i = 0; i < 10; i++) {
      const on = i < Math.min(10, flown);
      ctx.fillStyle = on ? '#ffd94d' : 'rgba(255,217,77,0.22)';
      D.circ(ctx, 690 + i * 87, 700, on ? 17 : 13); ctx.fill();
      if (on) lampPool(690 + i * 87, 700, 60, 0.3);
    }
    if (lf >= 26) plate(1080, 1900, 480, 108, '10 SAAL', 60, '#ffd94d');
  });
});
// 8b GHADI tez ghumti — Dutch tilt
shot(706, 738, 0.32, { cx: 1080, cy: 1380, s: 0.62, rot: 0.07 }, { cx: 1080, cy: 1350, s: 0.70, rot: 0.13 }, (f, u) => {
  layer(0.6, () => { ctx.fillStyle = '#0a0c10'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1150, 0.16); });
  layer(1, () => {
    ground(GY, '#0c0f0a', '#131a12');
    clockDraw(1080, 1260, 330, f, 3.2);
    // ghadi ke chaaron ore tez hawa ki lakeerein
    ctx.strokeStyle = 'rgba(255,236,180,0.30)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const a0 = f * 0.22 + i * 0.9;
      ctx.beginPath(); ctx.arc(1080, 1260, 420 + (i % 3) * 40, a0, a0 + 0.5); ctx.stroke();
    }
    dust(f, 1080, 1400, 900, 10, 0.16);
    plate(1080, 1980, 560, 106, 'SAAL BEET GAYE', 52, '#ffd94d');
  });
});
// 8c LOW ANGLE kadam: bank counter ki taraf aage badhta camera
shot(738, 771, 0.30, { cx: 1080, cy: 1560, s: 0.55 }, { cx: 1080, cy: 1460, s: 0.68 }, (f, u) => {
  const lf = f - 738;
  layer(0.6, () => { ctx.fillStyle = '#0b1017'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1200, 1300, 0.16, '160,200,255'); });
  layer(1, () => {
    ctx.fillStyle = '#131e2c'; ctx.fillRect(-500, 460, 3160, GY - 460);
    for (let i = 0; i < 5; i++) {
      const cxp = -200 + i * 640;
      const cg = ctx.createLinearGradient(cxp - 30, 0, cxp + 30, 0);
      cg.addColorStop(0, '#33465c'); cg.addColorStop(0.5, '#5a718c'); cg.addColorStop(1, '#26344a');
      ctx.fillStyle = cg; ctx.fillRect(cxp - 30, 520, 60, GY - 520);
    }
    ground(GY, '#0d1210', '#141c18');
    // counter aage badhta hua (camera aage ja raha hai)
    const cw = D.lerp(1200, 1450, u);
    ctx.fillStyle = '#2b1d12'; ctx.fillRect(1080 - cw / 2, GY - 330, cw, 52);
    ctx.fillStyle = '#1d130b'; ctx.fillRect(1080 - cw / 2, GY - 278, cw, 278);
    ctx.strokeStyle = 'rgba(255,205,110,0.3)'; ctx.lineWidth = 4; ctx.strokeRect(1080 - cw / 2, GY - 330, cw, 52);
    personSil(1080, GY - 278, 1.1, { col: '#0a0e14', armA: 0.3 });
    // zameen par kadmon ke nishan (aage badhte)
    ctx.fillStyle = 'rgba(255,236,180,0.20)';
    for (let i = 0; i < 4; i++) { const fp = D.clamp((lf - i * 6) / 6, 0, 1); if (fp <= 0) continue; D.ell(ctx, 1000 + (i % 2) * 150, GY + 120 + i * 60, 26, 12); ctx.fill(); }
    lightCone(1080, 560, GY - 330, 90, 760, 0.07);
  });
});

// ===== S9 (771–858) "Bank wala bola — 'Sir, abhi paintalis lakh baki hai!'" =====
// 9a COUNTER SCREEN chamakti: "48 LAKH DE CHUKE"
shot(771, 800, 0.30, { cx: 1080, cy: 1420, s: 0.60 }, { cx: 1080, cy: 1370, s: 0.68 }, (f, u) => {
  const lf = f - 771;
  layer(0.6, () => { ctx.fillStyle = '#0b1017'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1250, 1250, 0.18, '160,200,255'); });
  layer(1, () => {
    ground(GY, '#0d1210', '#141c18');
    // counter screen (monitor)
    lampPool(1080, 1180, 700, 0.25, '120,200,255');
    ctx.fillStyle = '#0d1420'; D.rr(ctx, 640, 830, 880, 560, 18); ctx.fill();
    ctx.strokeStyle = '#3f4a44'; ctx.lineWidth = 7; ctx.stroke();
    const sg = ctx.createLinearGradient(0, 860, 0, 1360);
    sg.addColorStop(0, '#12293a'); sg.addColorStop(1, '#0a1826');
    ctx.fillStyle = sg; D.rr(ctx, 668, 858, 824, 504, 12); ctx.fill();
    text('DE CHUKE', 1080, 990, 56, 'rgba(190,226,255,0.8)');
    text('48 LAKH', 1080, 1140, 150, '#7ec8ff');
    ctx.fillStyle = '#0d1420'; ctx.fillRect(1052, 1390, 56, 90);
    ctx.fillStyle = '#1a2634'; D.rr(ctx, 940, 1476, 280, 26, 8); ctx.fill();
    // counter aur bank wala
    ctx.fillStyle = '#2b1d12'; ctx.fillRect(430, GY - 300, 1300, 46);
    ctx.fillStyle = '#1d130b'; ctx.fillRect(430, GY - 254, 1300, 254);
    personSil(700, GY - 254, 1.05, { col: '#0a0e14', armB: -0.4 });
    if (lf > 14) D.drawSparkle(ctx, 760, 950, 26, 0.7);
  });
});
// 9b BOARD SLAM: "45 LAKH BAKI!" sabse bada hit + shake (hits 800, 815)
shot(800, 830, 0.36, { cx: 1080, cy: 1380, s: 0.64 }, { cx: 1080, cy: 1350, s: 0.70 }, (f, u) => {
  const lf = f - 800;
  layer(0.6, () => { ctx.fillStyle = '#0d0508'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1280, 1400, 0.36, '255,70,50'); });
  layer(1, () => {
    ground(GY, '#0e0708', '#180b0d');
    lampPool(1080, 1240, 900, 0.36, '255,70,50');
    redBoard(1080, 1240, 920, 470, [['45 LAKH', 168, '#ffffff'], ['BAKI HAI!', 84, '#ffb59a']], spring(lf / 6));
    // board ke neeche ghar ka chhota sa model
    houseDraw(1080, GY, 0.62, { night: true });
    darkPool(1080, GY - 100, 700, 0.3);
    if (lf >= 15) { const p = spring((lf - 15) / 7); ctx.save(); ctx.translate(1080, 1730); ctx.scale(p, p); ctx.translate(-1080, -1730); plate(1080, 1730, 560, 108, 'DAS SAAL BAAD BHI!', 50, '#ff8a7a'); ctx.restore(); }
  });
}, [800, 815]);
// 9c GHAR KA MODEL sikudta: board ke saamne chhota hota jata
shot(830, 858, 0.34, { cx: 1080, cy: 1400, s: 0.66 }, { cx: 1080, cy: 1370, s: 0.72 }, (f, u) => {
  const lf = f - 830;
  layer(0.6, () => { ctx.fillStyle = '#0a070a'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1200, 0.22, '255,90,70'); });
  layer(1, () => {
    ground(GY, '#0d0a0a', '#151010');
    // upar latka bada laal board (aadha dikhta, dabaav)
    redBoard(1080, 800, 900, 300, [['45 LAKH BAKI!', 92, '#ffb59a']], 1);
    // sikudta ghar
    const hs = D.lerp(1.05, 0.55, sstep(u));
    houseDraw(1080, GY, hs, { night: true });
    // dabaav ki lakeerein (upar se neeche)
    ctx.strokeStyle = 'rgba(255,90,70,0.4)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const ax = 760 + i * 160, ay = 1010 + ((lf * 9 + i * 30) % 160);
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, ay + 60); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax - 12, ay + 44); ctx.lineTo(ax, ay + 62); ctx.lineTo(ax + 12, ay + 44); ctx.stroke();
    }
    dust(f, 1080, 1600, 800, 7, 0.12);
  });
});

// ===== S10 (858–949) "Matlab das saal me loan ghata... sirf paanch lakh!" =====
// 10a LOAN BAR WIDE: "50 LAKH" bhara hua
shot(858, 890, 0.30, { cx: 1080, cy: 1420, s: 0.58 }, { cx: 1080, cy: 1380, s: 0.63 }, (f, u) => {
  layer(0.6, () => { ctx.fillStyle = '#090c12'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1350, 1250, 0.16); });
  layer(1, () => {
    ground(GY, '#0b0e0c', '#12160f');
    plate(1080, 900, 640, 112, 'TUMHARA LOAN', 56, '#ffd94d');
    barMeter(1080, 1330, 940, 210, sstep(D.clamp((f - 858) / 20, 0, 1)), '#c9a227', { lab: '50 LAKH', labPx: 96 });
    // bar ke neeche ghar aur bank dono taraf
    houseDraw(620, GY, 0.95, { night: true });
    bankBuilding(1620, GY, { w: 620, h: 620, sign: '', signPx: 60 });
    dust(f, 1080, 1600, 900, 7, 0.10);
  });
});
// 10b BAR ka sirf kinara ghata — baaki waisa hi, slow push
shot(890, 920, 0.32, { cx: 1120, cy: 1400, s: 0.63 }, { cx: 1150, cy: 1380, s: 0.72 }, (f, u) => {
  const lf = f - 890, shrink = sstep(D.clamp(lf / 22, 0, 1));
  layer(0.6, () => { ctx.fillStyle = '#090c12'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1150, 1350, 1150, 0.15, '255,120,90'); });
  layer(1, () => {
    ground(GY, '#0b0e0c', '#12160f');
    // ghost: purani poori lambai ka nishan
    ctx.strokeStyle = 'rgba(255,217,77,0.35)'; ctx.lineWidth = 4; ctx.setLineDash([16, 13]);
    D.rr(ctx, 610, 1225, 940, 210, 16); ctx.stroke(); ctx.setLineDash([]);
    text('50 LAKH', 1080, 1120, 54, 'rgba(255,217,77,0.5)');
    barMeter(1080, 1330, 940, 210, 1 - 0.10 * shrink, '#c9a227', {});
    houseDraw(620, GY, 0.8, { night: true });
    bankBuilding(1640, GY, { w: 560, h: 560, sign: '', signPx: 54 });
    // ghata hua kinara: laal chamak ke saath gayab hota tukda
    if (shrink < 1) {
      const tw = 94 * (1 - shrink);
      if (tw > 6) { ctx.fillStyle = 'rgba(179,35,27,0.85)'; D.rr(ctx, 1550 - 12 - tw + 12, 1249, tw, 162, 10); ctx.fill(); }
    }
    lampPool(1540, 1330, 200, 0.3 * (1 - shrink), '255,90,70');
    plate(1080, 1620, 520, 104, 'GHATA KITNA?', 52, '#ffd94d');
  });
});
// 10c PLATE "SIRF 5 LAKH GHATA" + sikke dhuaan bankar udte
shot(920, 949, 0.34, { cx: 1080, cy: 1380, s: 0.66 }, { cx: 1080, cy: 1350, s: 0.72 }, (f, u) => {
  const lf = f - 920;
  layer(0.6, () => { ctx.fillStyle = '#0a0808'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1200, 0.2, '255,100,80'); });
  layer(1, () => {
    ground(GY, '#0b0e0c', '#12160f');
    barMeter(1080, 1420, 940, 190, 0.90, '#c9a227', {});
    // sikke dhuaan bankar udte
    for (let i = 0; i < 6; i++) {
      const p = D.clamp((lf - i * 3) / 22, 0, 1); if (p <= 0) continue;
      const px = 700 + i * 150, py = 1250 - p * 480;
      if (p < 0.4) { ctx.save(); ctx.globalAlpha = 1 - p * 2.2; coinDraw(px, py, 34); ctx.restore(); }
      ctx.fillStyle = `rgba(130,128,135,${0.34 * (1 - p * 0.6)})`;
      D.circ(ctx, px + Math.sin(p * 6 + i) * 30, py - 30, 16 + p * 56); ctx.fill();
    }
    if (lf >= 8) { const p = spring((lf - 8) / 8); ctx.save(); ctx.translate(1080, 1010); ctx.scale(p, p); ctx.translate(-1080, -1010); darkBoard(1080, 1010, 760, 260, [['SIRF 5 LAKH GHATA', 88, '#ff8a7a']], 1); ctx.restore(); }
  });
});

// ===== S11 (949–1096) "Aur tees saal pura kiya to byaaj pachaanve lakh — pachaas ka ghar, dedh crore me!" =====
// 11a SIKKON KA PAHAAD: gir-gir kar badhta, low angle
shot(949, 995, 0.30, { cx: 1080, cy: 1560, s: 0.55 }, { cx: 1080, cy: 1460, s: 0.63 }, (f, u) => {
  const lf = f - 949, grow = sstep(D.clamp(lf / 34, 0, 1));
  layer(0.5, () => nightSky(GY, f));
  layer(1, () => {
    ground(GY, '#0c0f0a', '#131a12');
    // girte sikke (pahaad par barish)
    for (let i = 0; i < 8; i++) {
      const fp = ((lf * 0.045 + hash(i * 6.3)) % 1);
      const px = 1080 + (hash(i * 8.9) - 0.5) * 700, py = D.lerp(500, GY - 200 - grow * 500 * hash(i * 3.7), fp);
      ctx.save(); ctx.globalAlpha = 0.9; coinDraw(px, py, 30); ctx.restore();
    }
    coinMountain(1080, GY, 620 + grow * 480, 240 + grow * 560);
    dust(f, 1080, 1700, 900, 8, 0.12);
  });
});
// 11b PAHAAD ke saamne GHAR chhota hota jata
shot(995, 1035, 0.32, { cx: 1080, cy: 1480, s: 0.60 }, { cx: 1080, cy: 1430, s: 0.66 }, (f, u) => {
  layer(0.5, () => nightSky(GY, f));
  layer(1, () => {
    ground(GY, '#0c0f0a', '#131a12');
    coinMountain(1420, GY, 900, 800);
    const hs = D.lerp(0.95, 0.5, sstep(u));
    houseDraw(640, GY, hs, { night: true });
    darkPool(640, GY - 120, 480, 0.25);
    lampPool(1420, GY - 700, 700, 0.18);
    dust(f, 900, 1700, 800, 7, 0.10);
  });
});
// 11c DO BOARD back-to-back: "BYAAJ 95 LAKH" (hit 1040) phir "KUL 1.45 CRORE" push-in
shot(1035, 1096, 0.34, { cx: 1080, cy: 1400, s: 0.62 }, { cx: 1080, cy: 1360, s: 0.74 }, (f, u) => {
  const lf = f - 1035;
  layer(0.55, () => { ctx.fillStyle = '#0a0810'; ctx.fillRect(-800, -600, 3760, 4440); vgrad(-600, GY + 40, [[0, '#0a0810'], [1, '#1d0f16']]); lampPool(1080, 1300, 1300, 0.18, '255,120,90'); });
  layer(1, () => {
    ground(GY, '#0c0a0c', '#131013');
    coinMountain(1080, GY, 980, 420);
    darkPool(1080, GY - 100, 900, 0.3);
    if (lf < 26) {
      redBoard(1080, 1180, 860, 330, [['BYAAJ', 76, '#ffb59a'], ['95 LAKH', 168, '#ffffff']], spring(lf / 7));
    } else {
      goldBoard(1080, 1180, 900, 350, [['KUL ADAAYEGI', 64, '#ffe9b0'], ['1.45 CRORE', 150, '#ffd94d']], spring((lf - 26) / 8), (lf % 44) / 44);
    }
    if (lf >= 26) D.drawSparkle(ctx, 640, 1030, 30, 0.8);
  });
}, [1040]);

// ===== S12 (1096–1219) "Ye scam chhupa nahi hai dost... kagaz par chhota-chhota likha hai, padhta koi nahi." =====
// 12a KAGAZ MACRO: chhoti-chhoti grey lines
shot(1096, 1137, 0.30, { cx: 1080, cy: 1330, s: 0.78 }, { cx: 1100, cy: 1300, s: 0.92 }, (f, u) => {
  layer(0.55, () => { ctx.fillStyle = '#ddd5bf'; ctx.fillRect(-1200, -1200, 4560, 5040); });
  layer(1, () => {
    // vishaal kagaz: lines hi lines
    ctx.fillStyle = '#e8e2d2'; ctx.fillRect(-400, -200, 2960, 3400);
    ctx.fillStyle = '#7a1d12'; ctx.fillRect(-400, -60, 2960, 26);
    ctx.fillStyle = 'rgba(40,44,52,0.7)';
    for (let i = 0; i < 16; i++) {
      const lw = 2100 * (0.45 + hash(i * 3.13) * 0.5);
      ctx.fillRect(420, 120 + i * 148, lw, 20);
    }
    // sabse chhoti lines (neeche, jahan scam chhupa hai)
    ctx.fillStyle = 'rgba(40,44,52,0.5)';
    for (let i = 0; i < 10; i++) ctx.fillRect(420, 2560 + i * 62, 1700 * (0.4 + hash(i * 7.7) * 0.55), 9);
    lampPool(1080, 2700, 700, 0.14, '255,120,90');
    plate(1080, 760, 620, 106, 'CHHOTA-CHHOTA LIKHA', 50, '#ffd94d');
  });
});
// 12b MAGNIFIER ghumta: lines badi hoti lekin dhundhli
shot(1137, 1180, 0.32, { cx: 1100, cy: 1300, s: 0.85 }, { cx: 1060, cy: 1330, s: 0.92 }, (f, u) => {
  layer(0.55, () => { ctx.fillStyle = '#ddd5bf'; ctx.fillRect(-1200, -1200, 4560, 5040); });
  layer(1, () => {
    ctx.fillStyle = '#e8e2d2'; ctx.fillRect(-400, -200, 2960, 3400);
    ctx.fillStyle = 'rgba(40,44,52,0.55)';
    for (let i = 0; i < 22; i++) ctx.fillRect(420, 120 + i * 130, 1900 * (0.4 + hash(i * 5.3) * 0.55), 13);
    // magnifier sarakta hua
    const mx = D.lerp(820, 1330, sstep(u)), my = D.lerp(1150, 1560, sstep(u));
    lampPool(mx, my, 360, 0.22, '255,240,200');
    ctx.fillStyle = 'rgba(190,225,255,0.13)'; D.circ(ctx, mx, my, 215); ctx.fill();
    ctx.strokeStyle = '#8a6d1f'; ctx.lineWidth = 14; D.circ(ctx, mx, my, 215); ctx.stroke();
    // lens ke andar dhundhli badi lines
    ctx.fillStyle = 'rgba(30,34,42,0.5)';
    for (let i = 0; i < 3; i++) ctx.fillRect(mx - 140, my - 66 + i * 62, 280 - i * 36, 26);
    ctx.strokeStyle = '#5e4630'; ctx.lineWidth = 28; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(mx + 148, my + 148); ctx.lineTo(mx + 280, my + 280); ctx.stroke();
    dust(f, 1080, 1400, 800, 6, 0.10);
  });
});
// 12c PLATE "PADHTA KOI NAHI" + kagaz andhere me doobta
shot(1180, 1219, 0.36, { cx: 1080, cy: 1330, s: 0.80 }, { cx: 1080, cy: 1360, s: 0.68 }, (f, u) => {
  const lf = f - 1180;
  layer(0.6, () => { ctx.fillStyle = '#07080c'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1000, 0.12, '255,150,120'); });
  layer(1, () => {
    ground(GY, '#090a0c', '#101216');
    const sink = sstep(D.clamp(lf / 26, 0, 1));
    ctx.save(); ctx.globalAlpha = 1 - sink * 0.45;
    docPaper(1080, 1330 + sink * 130, 700, 920, { rot: -0.05 + sink * 0.05, rows: 9, head: 'LOAN AGREEMENT', headCol: '#26303c' });
    ctx.restore();
    darkPool(1080, 1500, 1200, 0.25 + sink * 0.4);
    if (lf >= 10) { const p = spring((lf - 10) / 8); ctx.save(); ctx.translate(1080, 760); ctx.scale(p, p); ctx.translate(-1080, -760); darkBoard(1080, 760, 680, 240, [['PADHTA KOI NAHI', 84, '#ffd94d']], 1); ctx.restore(); }
  });
});

// ===== S13 (1219–1417) "Bachna hai to amortization schedule maango — aur floating loan par extra bharna shuru karo, penalty zero hai, RBI ka niyam hai." =====
// 13a SCHEDULE UNROLL: lamba kagaz seedhi ki tarah neeche khulta (top-down feel)
shot(1219, 1268, 0.30, { cx: 1080, cy: 1250, s: 0.60 }, { cx: 1080, cy: 1420, s: 0.60 }, (f, u) => {
  const lf = f - 1219, un = sstep(D.clamp(lf / 36, 0, 1));
  layer(0.6, () => { ctx.fillStyle = '#0a0f0c'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1400, 1300, 0.15, '120,255,170'); });
  layer(1, () => {
    // upar roll (ghuma hua hissa)
    ctx.fillStyle = '#cfc7ae'; D.ell(ctx, 1080, 640, 330, 74); ctx.fill();
    ctx.strokeStyle = '#8a8272'; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#e8e2d2'; D.ell(ctx, 1080, 640, 290, 56); ctx.fill();
    // khulta hua kagaz (lambai badhti)
    const ph = 300 + un * 1450;
    ctx.fillStyle = '#e8e2d2'; ctx.fillRect(750, 640, 660, ph);
    ctx.strokeStyle = '#8a8272'; ctx.lineWidth = 5; ctx.strokeRect(750, 640, 660, ph);
    ctx.fillStyle = '#1d6e46'; ctx.fillRect(750, 640, 660, 14);
    text('SCHEDULE', 1080, 700, 52, '#1d6e46');
    // andar EMI lines ek-ek khulti
    ctx.fillStyle = 'rgba(40,44,52,0.7)';
    const rows = Math.floor(un * 12);
    for (let i = 0; i < rows; i++) {
      ctx.fillRect(790, 790 + i * 118, 580 * (0.5 + hash(i * 3.9) * 0.45), 15);
      ctx.fillStyle = i % 2 ? 'rgba(40,44,52,0.7)' : 'rgba(179,35,27,0.55)';
    }
    ctx.fillStyle = 'rgba(40,44,52,0.7)';
    // neeche ki taraf teer
    if (un > 0.7) { ctx.fillStyle = '#3ddc74'; ctx.beginPath(); ctx.moveTo(1080, 640 + ph + 26); ctx.lineTo(1040, 640 + ph - 22); ctx.lineTo(1120, 640 + ph - 22); ctx.closePath(); ctx.fill(); }
    dust(f, 1080, 1400, 800, 7, 0.10);
  });
});
// 13b HARE TICK nishan lines par lagte
shot(1268, 1312, 0.30, { cx: 1080, cy: 1420, s: 0.62 }, { cx: 1080, cy: 1400, s: 0.68 }, (f, u) => {
  const lf = f - 1268;
  layer(0.6, () => { ctx.fillStyle = '#0a0f0c'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1400, 1250, 0.16, '120,255,170'); });
  layer(1, () => {
    ground(GY, '#0b0f0b', '#12180f');
    // schedule kagaz (khula hua, bada)
    ctx.fillStyle = '#e8e2d2'; D.rr(ctx, 700, 760, 760, 1250, 10); ctx.fill();
    ctx.strokeStyle = '#8a8272'; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#1d6e46'; ctx.fillRect(700, 760, 760, 16);
    text('SCHEDULE', 1080, 830, 56, '#1d6e46');
    for (let i = 0; i < 8; i++) {
      const ry = 950 + i * 128;
      ctx.fillStyle = 'rgba(40,44,52,0.7)'; ctx.fillRect(745, ry, 500 * (0.5 + hash(i * 3.9) * 0.45), 15);
      const ton = sstep(D.clamp((lf - 4 - i * 4) / 6, 0, 1));
      if (ton > 0) { // hara tick
        ctx.strokeStyle = '#1fae5f'; ctx.lineWidth = 13; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.save(); ctx.translate(1330, ry + 8); ctx.scale(ton, ton);
        ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(-8, 26); ctx.lineTo(40, -30); ctx.stroke();
        ctx.restore();
      }
    }
    dust(f, 1080, 1400, 800, 6, 0.10);
  });
});
// 13c STAMP: "PENALTY ZERO • RBI NIYAM" (hit 1330)
shot(1312, 1362, 0.32, { cx: 1080, cy: 1400, s: 0.64 }, { cx: 1080, cy: 1370, s: 0.70 }, (f, u) => {
  const lf = f - 1312;
  layer(0.6, () => { ctx.fillStyle = '#081008'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1350, 0.3, '90,255,160'); });
  layer(1, () => {
    ground(GY, '#0a0e0a', '#10160e');
    docPaper(1080, 1400, 720, 940, { rot: -0.04, rows: 8, head: 'SCHEDULE', headCol: '#1d6e46' });
    if (lf >= 16) stampSolid(1080, 1330, 880, 360, [['PENALTY ZERO', 104], ['RBI KA NIYAM', 62]], -0.06, spring((lf - 16) / 6), '#128a4c', '#0a5c30');
    if (lf >= 24) D.drawSparkle(ctx, 660, 1120, 30, 0.85);
    if (lf >= 30) plate(1080, 2080, 640, 106, 'EXTRA BHARNA MUFT', 52, '#baffd2');
  });
}, [1330]);
// 13d EXTRA SIKKE bar me girte, bar TEZ ghat-ta
shot(1362, 1417, 0.30, { cx: 1080, cy: 1400, s: 0.62 }, { cx: 1080, cy: 1370, s: 0.68 }, (f, u) => {
  const lf = f - 1362, shrink = sstep(D.clamp(lf / 38, 0, 1));
  layer(0.6, () => { ctx.fillStyle = '#081008'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1350, 1250, 0.2, '120,255,170'); });
  layer(1, () => {
    ground(GY, '#0a0e0a', '#10160e');
    // girte extra sikke (upar se bar ki taraf)
    for (let i = 0; i < 7; i++) {
      const fp = ((lf * 0.05 + hash(i * 6.1)) % 1);
      const px = 700 + hash(i * 8.3) * 760, py = D.lerp(620, 1180, fp);
      ctx.save(); ctx.globalAlpha = 0.95; coinDraw(px, py, 32); ctx.restore();
    }
    barMeter(1080, 1330, 940, 200, 0.90 - 0.55 * shrink, '#3ddc74', { lab: shrink > 0.85 ? 'JAAL CHHOTA!' : '', labPx: 72 });
    // tezi se ghatne ki chamak
    lampPool(610 + 916 * (0.90 - 0.55 * shrink), 1330, 200, 0.35, '90,255,160');
    houseDraw(1080, GY, 0.85, { night: true });
    dust(f, 1080, 1500, 800, 7, 0.10);
  });
});

// ===== S14 (1417–1560) "Chor ek baar lut-ta hai dost... bank tees saal tak, har mahine, tumhari marzi se lut-ta hai." =====
// 14a ANDHERI GALI: chor silhouette EK sikka utha kar bhagta (side track)
shot(1417, 1465, 0.32, { cx: 920, cy: 1500, s: 0.58 }, { cx: 1240, cy: 1500, s: 0.58 }, (f, u) => {
  const lf = f - 1417;
  layer(0.5, () => nightSky(GY, f));
  layer(0.8, () => {
    ctx.fillStyle = '#08131d';
    for (let i = 0; i < 6; i++) { const bx = -500 + i * 600, bh = 540 + hash(i * 4.9) * 340; ctx.fillRect(bx, GY - bh, 410, bh); }
    ctx.fillStyle = 'rgba(255,205,110,0.4)';
    for (let i = 0; i < 7; i++) if (hash(i * 5.7) < 0.5) ctx.fillRect(-380 + i * 460, GY - 400 - hash(i * 3) * 180, 28, 38);
  });
  layer(1, () => {
    ground(GY, '#090e0b', '#0f1712');
    lightCone(1500, GY - 960, GY, 44, 290, 0.10);
    ctx.fillStyle = '#0d1420'; ctx.fillRect(1487, GY - 1030, 24, 1030);
    lampPool(1500, GY - 990, 120, 0.5); ctx.fillStyle = '#ffe9a8'; D.circ(ctx, 1500, GY - 990, 15); ctx.fill();
    // chor daudta hua (camera uske saath track)
    const rx = 700 + lf * 13;
    runnerSil(rx, GY, 1.25, { ph: f * 0.55, coin: true });
    // peeche chhuta hua ghar
    houseDraw(430, GY, 0.9, { night: true });
    dust(f, 1080, 1800, 900, 7, 0.10);
  });
});
// 14b BANK MACHINE MACRO: calendar grid par har mahine sikka kheenchta (3 clank)
shot(1465, 1515, 0.34, { cx: 1080, cy: 1420, s: 0.62, rot: 0.03 }, { cx: 1080, cy: 1390, s: 0.70, rot: 0.06 }, (f, u) => {
  const lf = f - 1465;
  layer(0.55, () => { ctx.fillStyle = '#0a0a10'; ctx.fillRect(-800, -600, 3760, 4440); vgrad(-600, GY + 40, [[0, '#0a0a10'], [1, '#180d12']]); lampPool(1080, 1350, 1250, 0.16, '255,100,80'); });
  layer(0.8, () => { // peeche calendar grid (mahine)
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      const gx = 480 + c * 300, gy2 = 760 + r * 300;
      ctx.fillStyle = 'rgba(233,228,212,0.10)'; D.rr(ctx, gx, gy2, 250, 250, 10); ctx.fill();
      ctx.strokeStyle = 'rgba(233,228,212,0.25)'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#b3231b'; ctx.fillRect(gx, gy2, 250, 38);
    }
  });
  layer(1, () => {
    ground(GY, '#0d0a0c', '#141013');
    // 3 clank cycles: sikka slot me kheenchta
    const cyc = (lf % 16) / 16, suck = sstep(D.clamp((cyc - 0.35) / 0.5, 0, 1));
    bankMachine(1080, GY, 1.35, f, suck, [1080 - 480 + cyc * 60, GY - 700]);
    // baayein sikkon ka dher (khaali hota)
    coinStack(500, GY, Math.max(1, 7 - Math.floor(lf / 16) * 2), 40);
    if (lf > 30) plate(1080, 800, 640, 106, 'HAR MAHINE... HAR SAAL', 50, '#ff8a7a');
    dust(f, 1080, 1500, 800, 6, 0.10);
  });
});
// 14c SPLIT: baaye chor chhota, daaye bank bada hota jata
shot(1515, 1560, 0.34, { cx: 1080, cy: 1440, s: 0.60 }, { cx: 1080, cy: 1410, s: 0.66 }, (f, u) => {
  const lf = f - 1515;
  layer(0.55, () => { ctx.fillStyle = '#08090f'; ctx.fillRect(-800, -600, 3760, 4440); vgrad(-600, GY + 40, [[0, '#08090f'], [1, '#140d14']]); });
  layer(1, () => {
    ground(GY, '#0b0d0b', '#12140f');
    // beech ki vibhajan lakeer
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 4; ctx.setLineDash([22, 16]);
    ctx.beginPath(); ctx.moveTo(1080, 620); ctx.lineTo(1080, GY); ctx.stroke(); ctx.setLineDash([]);
    // baaye: chor chhota hota
    const cs = D.lerp(1.0, 0.62, sstep(u));
    runnerSil(700, GY, cs, { ph: f * 0.5, coin: true });
    plate(700, 900, 420, 100, 'CHOR: EK BAAR', 46, '#bfe2ff');
    // daaye: bank bada hota
    const bs = D.lerp(0.85, 1.2, sstep(u));
    ctx.save(); ctx.translate(1560, GY); ctx.scale(bs, bs); ctx.translate(-1560, -GY);
    bankBuilding(1560, GY, { w: 760, h: 700, sign: 'BANK', signPx: 72 });
    ctx.restore();
    plate(1560, 900, 460, 100, 'BANK: 30 SAAL', 46, '#ff8a7a');
    dust(f, 1080, 1600, 900, 6, 0.08);
  });
});

// ===== S15 (1560–1662) "Ab tum batao — EMI bharte rahoge, ya schedule nikaal kar dekhoge?" =====
// 15a LAAL BOARD SLAM: "EMI BHARTE RAHOGE?" (hit 1590)
shot(1560, 1610, 0.34, { cx: 1020, cy: 1480, s: 0.60 }, { cx: 1080, cy: 1460, s: 0.63 }, (f, u) => {
  const lf = f - 1560;
  layer(0.6, () => { ctx.fillStyle = '#08090f'; ctx.fillRect(-800, -600, 3760, 4440); vgrad(-600, GY + 40, [[0, '#08090f'], [1, '#1c0f14']]); lampPool(1080, 1400, 1200, 0.14); });
  layer(1, () => {
    ground(GY, '#0c0a0c', '#141013');
    houseDraw(1080, GY, 1.05, { night: true });
    plate(1080, 1030, 620, 112, 'AB TUM BATAO', 56, '#ffd94d');
    if (lf >= 24) choiceBoard(800, 1500, 500, 200, 'EMI BHARTE RAHOGE?', 50, '#ff5147', spring((lf - 24) / 7));
    dust(f, 1080, 1600, 900, 7, 0.10);
  });
}, [1590]);
// 15b HARA BOARD SLAM: "SCHEDULE DEKHOGE?" (hit 1625) + ghar beech me, camera sway
shot(1610, 1662, 0.32, { cx: 1080, cy: 1460, s: 0.63 }, { cx: 1140, cy: 1460, s: 0.63 }, (f, u) => {
  const lf = f - 1610, pulse = 0.5 + 0.5 * Math.sin(f * 0.22);
  layer(0.6, () => { ctx.fillStyle = '#08090f'; ctx.fillRect(-800, -600, 3760, 4440); vgrad(-600, GY + 40, [[0, '#08090f'], [1, '#0d1a12']]); lampPool(1080, 1400, 1200, 0.14); });
  layer(1, () => {
    ground(GY, '#0c0a0c', '#141013');
    houseDraw(1080, GY, 1.05, { night: true });
    plate(1080, 1030, 620, 112, 'AB TUM BATAO', 56, '#ffd94d');
    choiceBoard(800, 1500, 500, 200, 'EMI BHARTE RAHOGE?', 50, '#ff5147', 1);
    if (lf >= 9) choiceBoard(1360, 1500, 500, 200, 'SCHEDULE DEKHOGE?', 50, '#3ddc74', spring((lf - 9) / 7));
    lampPool(800, 1500, 340, 0.10 + 0.08 * pulse, '255,80,60');
    lampPool(1360, 1500, 340, 0.10 + 0.08 * (1 - pulse), '80,255,150');
  });
}, [1625]);

// ===== S16 (1662–1755) "Agli baar — insurance agent ka sabse bada jhooth khulega." =====
// 16a ANDHERA KAMRA: ek kagaz par "INSURANCE" chamakta
shot(1662, 1705, 0.36, { cx: 1080, cy: 1420, s: 0.58 }, { cx: 1080, cy: 1380, s: 0.68 }, (f, u) => {
  const lf = f - 1662;
  layer(0.55, () => { ctx.fillStyle = '#04060a'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1000, 0.12, '150,190,255'); });
  layer(1, () => {
    ground(GY, '#07080c', '#0d0f14');
    // mez par rakha kagaz, upar se ek roshni
    lightCone(1080, 420, 1500, 60, 620, 0.09);
    const glow = 0.6 + 0.4 * Math.sin(f * 0.14);
    lampPool(1080, 1330, 560, 0.20 + 0.12 * glow, '150,190,255');
    docPaper(1080, 1360, 640, 830, { rot: -0.05, rows: 7, head: 'POLICY', headCol: '#26303c' });
    ctx.save(); ctx.translate(1080, 1330); ctx.rotate(-0.05);
    text('INSURANCE', 0, 40, fitPx('INSURANCE', 84, 520), `rgba(255,217,77,${0.55 + 0.45 * glow})`);
    ctx.restore();
    // aas-paas andhere me rakhe aur kagaz
    docPaper(560, 1560, 260, 350, { rot: 0.3, rows: 5 });
    docPaper(1620, 1520, 260, 350, { rot: -0.24, rows: 5 });
    darkPool(1080, 1500, 1350, 0.3);
    dust(f, 1080, 1300, 700, 9, 0.14);
  });
});
// 16b END CARD: "AGLI BAAR" + "INSURANCE AGENT KA JHOOTH"
shot(1705, 1755, 0.32, { cx: 1080, cy: 1440, s: 0.58 }, { cx: 1080, cy: 1400, s: 0.64 }, (f, u) => {
  const lf = f - 1705;
  layer(0.55, () => { ctx.fillStyle = '#04060a'; ctx.fillRect(-800, -600, 3760, 4440); vgrad(-600, GY + 40, [[0, '#04060a'], [1, '#100d1d']]); lampPool(1080, 1250, 1250, 0.14, '150,190,255'); });
  layer(1, () => {
    ground(GY, '#07080c', '#0d0f14');
    houseDraw(700, GY, 0.95, { night: true });
    darkPool(700, GY - 200, 500, 0.3);
    docPaper(1560, 1650, 380, 500, { rot: 0.10, rows: 6, head: 'POLICY', headCol: '#26303c' });
    coinStack(1500, GY, 4, 36);
    if (lf >= 5) { const p = spring((lf - 5) / 9); ctx.save(); ctx.translate(1080, 900); ctx.scale(p, p); ctx.translate(-1080, -900); plate(1080, 900, 480, 112, 'AGLI BAAR', 58, '#ffd94d'); ctx.restore(); }
    if (lf >= 15) darkBoard(1080, 1210, 900, 260, [['INSURANCE AGENT KA', 70, '#ffe9b0'], ['SABSE BADA JHOOTH', 82, '#ffd94d']], spring((lf - 15) / 10));
    dust(f, 1080, 1400, 900, 8, 0.10);
  });
});

// ---------------- TRANSITIONS ----------------
const TR = [
  {},                             // 1a ghar low-angle
  { h: 'dark' },                  // 1b top-down jaal andhera
  {},                             // 1c board match
  { h: 'flash' },                 // 2a bank chamak
  {},                             // 2b fly-over
  {},                             // 2c mohar match
  { h: 'dark' },                  // 3a counter andhera
  {},                             // 3b board match
  { h: 'flash' },                 // 3c chaabi chamak
  { h: 'dark' },                  // 4a sign andhera
  {},                             // 4b mohar match
  { h: 'flash' },                 // 5a kagaz fly-in chamak
  { h: 'streak' },                // 5b fly-through speed
  { h: 'flash' },                 // 5c tear chamak
  { h: 'dark' },                  // 6a laal andhera
  {},                             // 6b dhaar match
  { h: 'flash' },                 // 6c slam-in
  { h: 'dark' },                  // 7a hara andhera
  {},                             // 7b sikka match
  { h: 'streak' },                // 8a calendar speed
  {},                             // 8b ghadi match
  {},                             // 8c kadam match
  { h: 'flash' },                 // 9a screen chamak
  { h: 'flash' },                 // 9b slam-in
  {},                             // 9c sikudta match
  { h: 'dark' },                  // 10a bar andhera
  {},                             // 10b kinara match
  {},                             // 10c dhuaan match
  { h: 'flash' },                 // 11a pahaad chamak
  {},                             // 11b ghar chhota match
  {},                             // 11c board match
  { h: 'dark' },                  // 12a macro andhera
  {},                             // 12b magnifier match
  { t: 'dark' },                  // 12c doobta hua
  { h: 'flash' },                 // 13a schedule chamak
  {},                             // 13b tick match
  {},                             // 13c stamp match
  {},                             // 13d bar match
  { h: 'dark' },                  // 14a gali andhera
  {},                             // 14b machine match
  {},                             // 14c split match
  { h: 'flash' },                 // 15a sawal chamak
  {},                             // 15b match
  { h: 'dark' },                  // 16a andhera kamra
  { h: 'dark', t: 'dark' },       // 16b end card band
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
