// EP-7 OLA ELECTRIC EXPOSE — CINEMATIC MULTI-ANGLE (1806 frames @30fps, 60.2s). BINA CHARACTER: koi hero nahi.
// Sirf EV scooter, showroom, service centre, kagaz, chart, sikke. Camera: har shot me move (push/track/orbit/tilt/dive),
// har sentence par kam se kam ek EXTREME angle (low / top-down / POV / macro / fly-through), tension shots me Dutch tilt.
// Frame-safety: saare boards/text dono camera extremes par visible-rect ke andar (boards auto-fit via measureText).
// Harness: window.ready, window.renderFrame(f), window.TOTAL.
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import * as D from './draw.js';

const W = 1080, H = 1920, TOTAL = 1806, FPS = 30;
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const DEV_FONT = '"Noto Sans Devanagari"';
const fontReady = (async () => {
  try {
    const face = new FontFace('Noto Sans Devanagari', `url(data:font/ttf;base64,${DEVANAGARI_BOLD_B64})`, { weight: '700' });
    await face.load(); document.fonts.add(face);
    await document.fonts.load(`700 60px ${DEV_FONT}`, 'OLA ₹5');
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
function inr(n) {
  n = Math.floor(n); const s = String(n); if (s.length <= 3) return s;
  const last3 = s.slice(-3); let rest = s.slice(0, -3); const parts = [];
  while (rest.length > 2) { parts.unshift(rest.slice(-2)); rest = rest.slice(0, -2); }
  if (rest) parts.unshift(rest);
  return parts.join(',') + ',' + last3;
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
function goldBoard(x, y, w, h, lines, sc = 1, glint = -1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  lampPool(0, 0, Math.max(w, h) * 1.05, 0.42);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, '#3a2c07'); g.addColorStop(0.5, '#6d5410'); g.addColorStop(1, '#2e2205');
  ctx.fillStyle = g; D.rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.fill();
  ctx.strokeStyle = '#ffd94d'; ctx.lineWidth = 8; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2.5; D.rr(ctx, -w / 2 + 13, -h / 2 + 13, w - 26, h - 26, 9); ctx.stroke();
  lines.forEach((ln, i) => text(ln[0], 0, (i - (lines.length - 1) / 2) * (h * 0.47), fitPx(ln[0], ln[1], w - 64), ln[2]));
  if (glint >= 0) { // nakli chamak: board par behne wala safed sheen
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
// SOLID bhara hua laal stamp (8c WOW beat ke liye): gehra laal fill, safed mota text, koi fade nahi
function stampSolid(x, y, w, h, lines, rot, sc) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, '#c01710'); g.addColorStop(0.5, '#a3130d'); g.addColorStop(1, '#7e0d08');
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
function duskSky(gy, f = 0) {
  ctx.fillStyle = '#0a0e24'; ctx.fillRect(-900, -2600, 3960, 2000);
  vgrad(-600, gy + 40, [[0, '#0a0e24'], [0.42, '#251636'], [0.72, '#6e2f1d'], [1, '#c97a24']]);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 30; i++) { const sx = -600 + hash(i * 1.9) * 3300, sy = -500 + hash(i * 2.7) * 1000; ctx.globalAlpha = 0.2 + hash(i * 3.3) * 0.45; D.circ(ctx, sx, sy, 2 + hash(i) * 2.2); ctx.fill(); }
  ctx.globalAlpha = 1;
  lampPool(560, gy - 240, 560, 0.20);
  ctx.fillStyle = '#f7b955'; D.circ(ctx, 560, gy - 200, 56); ctx.fill();
  ctx.fillStyle = '#1c1226';
  ctx.beginPath(); ctx.moveTo(-800, gy);
  for (let x = -800; x <= 2960; x += 260) ctx.lineTo(x, gy - 170 - hash(x * 0.37) * 160);
  ctx.lineTo(2960, gy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#120b1a';
  ctx.beginPath(); ctx.moveTo(-800, gy);
  for (let x = -800; x <= 2960; x += 330) ctx.lineTo(x, gy - 80 - hash(x * 0.53 + 4) * 100);
  ctx.lineTo(2960, gy); ctx.closePath(); ctx.fill();
}
function daySky(gy, f = 0) { // showroom wala din: gehra upar, garam roshni neeche
  ctx.fillStyle = '#0b1220'; ctx.fillRect(-900, -2600, 3960, 2000);
  vgrad(-600, gy + 40, [[0, '#0b1220'], [0.5, '#17334a'], [0.8, '#3d5a63'], [1, '#8a6a35']]);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  for (let i = 0; i < 18; i++) { const sx = -600 + hash(i * 2.3) * 3300, sy = -500 + hash(i * 3.1) * 800; ctx.globalAlpha = 0.12 + hash(i * 3.3) * 0.3; D.circ(ctx, sx, sy, 2 + hash(i) * 2); ctx.fill(); }
  ctx.globalAlpha = 1;
  lampPool(1620, gy - 1450, 520, 0.26);
  ctx.fillStyle = '#ffd98f'; D.circ(ctx, 1620, gy - 1450, 66); ctx.fill();
}

// ---------------- OLA WORLD ----------------
const GY = 2400;
function ground(gy, col = '#0d1512', top = '#131c22') {
  ctx.fillStyle = col; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  ctx.fillStyle = top; ctx.fillRect(-800, gy, 3760, 150);
  ctx.fillStyle = 'rgba(200,230,255,0.06)'; ctx.fillRect(-800, gy, 3760, 7);
}
// Step-through EV scooter — SIDE profile. Origin: zameen ka beech, naak DAayein (+x). s=scale.
function scooterSide(x, gy, s, o = {}) {
  const col = o.col || '#27b083', colD = o.colD || '#0e6e4e', flip = o.flip || 1;
  ctx.save(); ctx.translate(x, gy); ctx.scale(s * flip, s); ctx.rotate(o.tilt || 0);
  D.softShadow(ctx, 0, 14, 430, 26, 0.38);
  const wheel = (wx) => {
    ctx.fillStyle = '#0a0c10'; D.circ(ctx, wx, -82, 84); ctx.fill();
    ctx.strokeStyle = '#39445c'; ctx.lineWidth = 7; ctx.stroke();
    ctx.fillStyle = '#20262f'; D.circ(ctx, wx, -82, 52); ctx.fill();
    ctx.fillStyle = '#7e8ea3'; D.circ(ctx, wx, -82, 17); ctx.fill();
    ctx.strokeStyle = 'rgba(200,215,235,0.5)'; ctx.lineWidth = 5;
    for (let k = 0; k < 3; k++) { const a = k * 2.1 + (o.spin || 0); ctx.beginPath(); ctx.moveTo(wx, -82); ctx.lineTo(wx + Math.cos(a) * 46, -82 + Math.sin(a) * 46); ctx.stroke(); }
  };
  // peeche ka pahiya + aage ka pahiya
  wheel(-215); wheel(238);
  // floorboard (sabse neeche ki patti)
  ctx.fillStyle = '#131a21'; D.rr(ctx, -95, -150, 250, 42, 16); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  // peeche ki body: pahiye se seat tak uthi hui golai
  const bg = ctx.createLinearGradient(0, -430, 0, -80);
  bg.addColorStop(0, col); bg.addColorStop(1, colD);
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(-330, -95);
  ctx.quadraticCurveTo(-345, -300, -235, -345);
  ctx.quadraticCurveTo(-150, -378, -30, -372);
  ctx.lineTo(60, -368);
  ctx.quadraticCurveTo(95, -300, 70, -190);
  ctx.quadraticCurveTo(58, -120, 20, -108);
  ctx.lineTo(-120, -104);
  ctx.quadraticCurveTo(-260, -100, -330, -95);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  // seat (lambi, kaali)
  ctx.fillStyle = '#12161c';
  ctx.beginPath();
  ctx.moveTo(-268, -352); ctx.quadraticCurveTo(-140, -392, 30, -386); ctx.lineTo(92, -378);
  ctx.quadraticCurveTo(100, -352, 70, -344); ctx.lineTo(-240, -336);
  ctx.quadraticCurveTo(-272, -338, -268, -352); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 3; ctx.stroke();
  // peeche ki tail-light
  lampPool(-322, -268, 60, o.tail === false ? 0 : 0.4, '255,60,40');
  ctx.fillStyle = o.tail === false ? '#5a1610' : '#ff3b30'; D.rr(ctx, -338, -288, 26, 42, 8); ctx.fill();
  // side panel par halki chamak + OLA jaisi patti
  ctx.strokeStyle = 'rgba(255,255,255,0.30)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-250, -320); ctx.quadraticCurveTo(-140, -352, -30, -346); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; D.rr(ctx, -178, -268, 118, 30, 15); ctx.fill();
  text('EV', -119, -252, 26, colD);
  // aage ka apron: floorboard se handle tak uthi gol dhaal
  const ag = ctx.createLinearGradient(0, -560, 0, -100);
  ag.addColorStop(0, col); ag.addColorStop(1, colD);
  ctx.fillStyle = ag;
  ctx.beginPath();
  ctx.moveTo(120, -120);
  ctx.quadraticCurveTo(150, -330, 205, -470);
  ctx.quadraticCurveTo(228, -528, 262, -532);
  ctx.quadraticCurveTo(300, -534, 302, -478);
  ctx.quadraticCurveTo(300, -330, 268, -160);
  ctx.quadraticCurveTo(258, -112, 205, -106);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  // apron ki safed chamak-patti
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(196, -140); ctx.quadraticCurveTo(215, -330, 238, -470); ctx.stroke();
  // headlamp (apron ke upar, gol)
  lampPool(268, -468, 95, o.lamp === false ? 0.05 : 0.5);
  ctx.fillStyle = '#0d1420'; D.circ(ctx, 268, -468, 37); ctx.fill();
  ctx.fillStyle = o.lamp === false ? '#33404f' : '#ffeeb0'; D.circ(ctx, 268, -468, 27); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; D.circ(ctx, 259, -477, 8); ctx.fill();
  // handle + mirror
  ctx.strokeStyle = '#12161c'; ctx.lineWidth = 15; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(268, -520); ctx.lineTo(238, -586); ctx.stroke();
  ctx.lineWidth = 12;
  ctx.beginPath(); ctx.moveTo(238, -586); ctx.lineTo(196, -578); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(238, -586); ctx.lineTo(282, -580); ctx.stroke();
  ctx.fillStyle = '#12161c'; D.ell(ctx, 190, -614, 27, 17); ctx.fill(); ctx.strokeStyle = 'rgba(190,220,255,0.5)'; ctx.lineWidth = 3; ctx.stroke();
  // front mudguard
  ctx.fillStyle = colD;
  ctx.beginPath(); ctx.arc(238, -82, 104, Math.PI * 1.08, Math.PI * 1.92); ctx.lineTo(238 + Math.cos(Math.PI * 1.92) * 76, -82 + Math.sin(Math.PI * 1.92) * 76); ctx.arc(238, -82, 76, Math.PI * 1.92, Math.PI * 1.08, true); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}
// Scooter FRONT (3/4 feel): samne ki dhaal, headlamp beech me, do mirror. Origin zameen beech.
function scooterFront(x, gy, s, o = {}) {
  const col = o.col || '#27b083', colD = o.colD || '#0e6e4e';
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  D.softShadow(ctx, 0, 14, 300, 24, 0.38);
  // aage ka pahiya (neeche, seedha)
  ctx.fillStyle = '#0a0c10'; D.rr(ctx, -34, -190, 68, 190, 30); ctx.fill();
  ctx.strokeStyle = '#39445c'; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#59667d'; D.rr(ctx, -10, -120, 20, 110, 9); ctx.fill();
  // front apron dhaal (gol shield)
  const g = ctx.createLinearGradient(0, -640, 0, -60);
  g.addColorStop(0, col); g.addColorStop(1, colD);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-128, -90);
  ctx.quadraticCurveTo(-150, -380, -104, -540);
  ctx.quadraticCurveTo(-60, -636, 0, -640);
  ctx.quadraticCurveTo(60, -636, 104, -540);
  ctx.quadraticCurveTo(150, -380, 128, -90);
  ctx.quadraticCurveTo(0, -46, -128, -90);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.32)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-72, -140); ctx.quadraticCurveTo(-92, -380, -58, -540); ctx.stroke();
  // headlamp beech me bada
  lampPool(0, -472, 150, o.lamp === false ? 0.05 : 0.55);
  ctx.fillStyle = '#0d1420'; D.circ(ctx, 0, -472, 58); ctx.fill();
  ctx.fillStyle = o.lamp === false ? '#33404f' : '#ffeeb0'; D.circ(ctx, 0, -472, 43); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; D.circ(ctx, -14, -487, 12); ctx.fill();
  // handle bar + do mirrors
  ctx.strokeStyle = '#12161c'; ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-128, -600); ctx.lineTo(128, -600); ctx.stroke();
  ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(-96, -600); ctx.lineTo(-128, -668); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(96, -600); ctx.lineTo(128, -668); ctx.stroke();
  ctx.fillStyle = '#12161c'; D.ell(ctx, -140, -682, 34, 21); ctx.fill(); D.ell(ctx, 140, -682, 34, 21); ctx.fill();
  ctx.strokeStyle = 'rgba(190,220,255,0.5)'; ctx.lineWidth = 3; D.ell(ctx, -140, -682, 34, 21); ctx.stroke(); D.ell(ctx, 140, -682, 34, 21); ctx.stroke();
  // neeche number-plate jaisi patti
  ctx.fillStyle = '#dfe5ea'; D.rr(ctx, -62, -238, 124, 44, 7); ctx.fill();
  text('EV', 0, -215, 30, '#26303c');
  ctx.restore();
}
// Scooter TOP-DOWN (convoy shots): origin beech, naak upar (-y)
function scooterTop(x, y, s, rot = 0, col = '#1d7a5c') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  D.softShadow(ctx, 5, 8, 74, 150, 0.3);
  const g = ctx.createLinearGradient(0, -160, 0, 160);
  g.addColorStop(0, '#2ea87e'); g.addColorStop(0.45, col); g.addColorStop(1, '#0e6e4e');
  ctx.fillStyle = g; D.rr(ctx, -62, -160, 124, 320, 52); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#12161c'; D.rr(ctx, -52, 6, 104, 138, 30); ctx.fill(); // seat (peeche 2/3)
  ctx.fillStyle = 'rgba(255,255,255,0.16)'; D.rr(ctx, -44, -138, 88, 66, 22); ctx.fill(); // floorboard chamak
  ctx.fillStyle = '#ffeeb0'; D.circ(ctx, 0, -148, 11); ctx.fill(); // headlamp
  ctx.fillStyle = '#0a0c10'; ctx.fillRect(-70, -120, 12, 34); ctx.fillRect(58, -120, 12, 34); // mirrors
  ctx.restore();
}
// Truck TOP-DOWN (recall convoy): origin beech, naak upar
function truckTop(x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  D.softShadow(ctx, 7, 10, 120, 235, 0.32);
  ctx.fillStyle = '#31435c'; D.rr(ctx, -105, -248, 210, 130, 26); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke(); // cab
  ctx.fillStyle = '#0a1420'; D.rr(ctx, -84, -228, 168, 48, 12); ctx.fill(); // windshield
  ctx.fillStyle = '#8a97a8'; D.rr(ctx, -112, -104, 224, 352, 14); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke(); // container
  ctx.strokeStyle = 'rgba(20,26,34,0.5)'; ctx.lineWidth = 4;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-112, -30 + i * 78); ctx.lineTo(112, -30 + i * 78); ctx.stroke(); }
  ctx.fillStyle = '#ffe9a8'; D.circ(ctx, -72, -240, 10); ctx.fill(); D.circ(ctx, 72, -240, 10); ctx.fill();
  ctx.restore();
}
// Aadmi ka silhouette (bheed/line ke liye) — origin zameen beech, kul unchai ~350*s
function personSil(x, gy, s, o = {}) {
  const col = o.col || '#0c1016', flip = o.flip || 1;
  ctx.save(); ctx.translate(x, gy); ctx.scale(s * flip, s);
  D.softShadow(ctx, 0, 8, 62, 12, 0.3);
  ctx.fillStyle = col;
  D.circ(ctx, 0, -308, 37); ctx.fill(); // sir
  D.rr(ctx, -40, -272, 80, 148, 30); ctx.fill(); // dhad
  D.rr(ctx, -38, -128, 30, 128, 13); ctx.fill(); // taang L
  D.rr(ctx, 9, -128, 30, 128, 13); ctx.fill(); // taang R
  ctx.save(); ctx.rotate(o.armA || 0.12); D.rr(ctx, -58, -262, 24, 118, 11); ctx.fill(); ctx.restore(); // baanh L
  ctx.save(); ctx.translate(46, -258); ctx.rotate(o.armB || -0.12); D.rr(ctx, -11, 0, 24, 118, 11); ctx.fill(); ctx.restore(); // baanh R
  ctx.strokeStyle = 'rgba(255,214,140,0.35)'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -308, 38, -0.4, 0.9); ctx.stroke();
  ctx.restore();
}
// Showroom facade: sign band + sheeshe ki deewaar + andar ki roshni. cx=center, gy=zameen, w=chaudai
function showroomSet(cx, gy, o = {}) {
  const w = o.w || 1560, top = gy - (o.h || 1010);
  // body
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, '#182635'); g.addColorStop(0.5, '#24374c'); g.addColorStop(1, '#141f2d');
  ctx.fillStyle = g; ctx.fillRect(cx - w / 2, top, w, gy - top);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.strokeRect(cx - w / 2, top, w, gy - top);
  // sign band
  ctx.fillStyle = o.signBg || '#0a141f'; ctx.fillRect(cx - w / 2, top, w, 168);
  ctx.fillStyle = 'rgba(255,205,110,0.25)'; ctx.fillRect(cx - w / 2, top + 168, w, 5);
  if (o.sign) { lampPool(cx, top + 84, w * 0.42, o.lit === 0 ? 0.03 : 0.22); textF(o.sign, cx, top + 86, o.signPx || 104, o.lit === 0 ? '#3d4a58' : (o.signCol || '#eaf6ff'), w - 120); }
  // sheeshe ki deewaar: khidkiyon ki kataar
  const cols = 5, cw = (w - 160) / cols;
  for (let i = 0; i < cols; i++) {
    const wx = cx - w / 2 + 80 + i * cw, wy = top + 218, wh = gy - wy - 60;
    const on = o.lit === undefined ? true : i < o.lit;
    ctx.fillStyle = on ? 'rgba(255,196,100,0.20)' : 'rgba(20,32,44,0.85)';
    ctx.fillRect(wx + 8, wy, cw - 16, wh);
    ctx.strokeStyle = 'rgba(160,200,235,0.30)'; ctx.lineWidth = 4; ctx.strokeRect(wx + 8, wy, cw - 16, wh);
    if (on) { ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.beginPath(); ctx.moveTo(wx + 26, wy + wh); ctx.lineTo(wx + cw * 0.42, wy); ctx.lineTo(wx + cw * 0.62, wy); ctx.lineTo(wx + 46, wy + wh); ctx.closePath(); ctx.fill(); }
  }
  // zameen par parchhai/roshni
  wetReflect(cx, gy + 8, w * 0.8, 190, o.lit === 0 ? 0.03 : 0.12);
}
// Kagaz/document (notice/file) — origin beech
function docPaper(x, y, w, h, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(o.sc || 1, o.sc || 1);
  darkPool(0, 40, w * 0.8, 0.35);
  ctx.fillStyle = '#e8e2d2'; D.rr(ctx, -w / 2, -h / 2, w, h, 8); ctx.fill();
  ctx.strokeStyle = '#8a8272'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = o.headCol || '#7a1d12'; ctx.fillRect(-w / 2 + 26, -h / 2 + 24, w - 52, 12);
  ctx.fillStyle = 'rgba(40,44,52,0.75)';
  const rows = o.rows || 6, hg = o.headGap || 0;
  for (let i = 0; i < rows; i++) { const lw = (w - 90) * (0.55 + hash(i * 3.7 + w) * 0.4); ctx.fillRect(-w / 2 + 30, -h / 2 + 66 + hg + i * ((h - 130 - hg) / rows), lw, 13); }
  if (o.head) text(o.head, 0, -h / 2 + 92, fitPx(o.head, 44, w - 60), o.headCol || '#7a1d12');
  ctx.restore();
}
// Ghadi (clock) — origin beech, r=ghadi ka radius, spin = sui ki speed
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
// Aag ki laptein (battery/fire) — origin aag ki jad, h = unchai, seed se hamesha alag
function flames(x, y, w, h, f, seed = 1) {
  for (let i = 0; i < 7; i++) {
    const fx = x + (hash(i * 3.3 + seed) - 0.5) * w, fh = h * (0.55 + hash(i * 7.1 + seed) * 0.6) * (0.9 + 0.16 * Math.sin(f * 0.55 + i * 2.2));
    const fw = w * (0.20 + hash(i * 5.3 + seed) * 0.14);
    const g = ctx.createLinearGradient(0, y, 0, y - fh);
    g.addColorStop(0, 'rgba(255,120,20,0.92)'); g.addColorStop(0.55, 'rgba(255,64,10,0.75)'); g.addColorStop(1, 'rgba(255,30,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(fx - fw / 2, y);
    ctx.quadraticCurveTo(fx - fw * 0.30, y - fh * 0.55, fx + Math.sin(f * 0.4 + i * 3.1) * 12, y - fh);
    ctx.quadraticCurveTo(fx + fw * 0.30, y - fh * 0.55, fx + fw / 2, y);
    ctx.closePath(); ctx.fill();
  }
  const g2 = ctx.createLinearGradient(0, y, 0, y - h * 0.5);
  g2.addColorStop(0, 'rgba(255,214,90,0.85)'); g2.addColorStop(1, 'rgba(255,160,30,0)');
  ctx.fillStyle = g2; D.ell(ctx, x, y - h * 0.16, w * 0.30, h * 0.20); ctx.fill();
}
function smoke(x, y, f, n = 6, rise = 300, col = '120,124,132') {
  for (let i = 0; i < n; i++) {
    const p = ((f * 0.012 * (0.7 + hash(i * 3) * 0.6) + hash(i * 7.7)) % 1);
    const sx = x + Math.sin(p * 5 + i * 2.4) * 46 + p * 90, sy = y - p * rise;
    ctx.fillStyle = `rgba(${col},${0.30 * (1 - p)})`;
    D.circ(ctx, sx, sy, 16 + p * 52); ctx.fill();
  }
}

// ================= SHOTS =================
// ===== S1 (0–125) "Ek company ke paas aadha bazaar tha... do saal me wo paanchve number par hai!" =====
// 1a LOW-ANGLE: uncha golden tower, camera neeche se upar push
shot(0, 40, 0.30, { cx: 1080, cy: 1780, s: 0.50 }, { cx: 1080, cy: 1620, s: 0.58 }, (f, u) => {
  layer(0.5, () => nightSky(GY, f));
  layer(0.75, () => { // peeche ki imaaratein
    ctx.fillStyle = '#08131d';
    for (let i = 0; i < 6; i++) { const bx = -500 + i * 560, bh = 700 + hash(i * 3.1) * 500; ctx.fillRect(bx, GY - bh, 380, bh); }
  });
  layer(1, () => {
    ground(GY);
    // tower body (beech me uncha)
    const tg = ctx.createLinearGradient(880, 0, 1280, 0);
    tg.addColorStop(0, '#1a2836'); tg.addColorStop(0.5, '#2b4258'); tg.addColorStop(1, '#141f2c');
    ctx.fillStyle = tg; ctx.fillRect(856, 560, 448, GY - 560);
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.strokeRect(856, 560, 448, GY - 560);
    // khidkiyaan ek-ek karke jalti hui
    ctx.fillStyle = 'rgba(255,205,110,0.75)';
    for (let r = 0; r < 9; r++) for (let c = 0; c < 4; c++) {
      if (hash(r * 7 + c * 13) < u * 1.15) ctx.fillRect(896 + c * 100, 1080 + r * 128, 52, 66);
    }
    lampPool(1080, 760, 560, 0.30);
    darkBoard(1080, 762, 820, 410, [['50%', 160, '#ffd94d'], ['BAAZAAR', 66, '#ffe9b0']], 0.9 + 0.1 * u);
    scooterSide(1080, GY, 0.52, {});
    dust(f, 1080, 1900, 900, 8, 0.14);
  });
});
// 1b PUSH-IN: board aur bada, khidkiyaan poori roshan
shot(40, 80, 0.30, { cx: 1080, cy: 1560, s: 0.60 }, { cx: 1080, cy: 1440, s: 0.72 }, (f, u) => {
  const lf = f - 40;
  layer(0.5, () => nightSky(GY, f));
  layer(1, () => {
    ground(GY);
    const tg = ctx.createLinearGradient(880, 0, 1280, 0);
    tg.addColorStop(0, '#1a2836'); tg.addColorStop(0.5, '#2b4258'); tg.addColorStop(1, '#141f2c');
    ctx.fillStyle = tg; ctx.fillRect(856, 560, 448, GY - 560);
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.strokeRect(856, 560, 448, GY - 560);
    ctx.fillStyle = 'rgba(255,205,110,0.8)';
    for (let r = 0; r < 9; r++) for (let c = 0; c < 4; c++) if (hash(r * 7 + c * 13) < 0.95) ctx.fillRect(896 + c * 100, 1080 + r * 128, 52, 66);
    lampPool(1080, 762, 620, 0.36);
    darkBoard(1080, 762, 840, 420, [['50%', 168, '#ffd94d'], ['BAAZAAR', 68, '#ffe9b0']], spring(lf / 12));
    if (lf > 20) D.drawSparkle(ctx, 700, 620, 34, 0.8);
    if (lf > 28) D.drawSparkle(ctx, 1470, 880, 28, 0.7);
    scooterSide(1080, GY, 0.52, {});
  });
});
// 1c CRANE-DOWN: rank ki seedhi — Ola ka nishaan sabse neeche 5th par
shot(80, 125, 0.32, { cx: 1080, cy: 1120, s: 0.60 }, { cx: 1080, cy: 1620, s: 0.58 }, (f, u) => {
  const lf = f - 80;
  layer(0.5, () => nightSky(GY, f));
  layer(1, () => {
    ground(GY);
    // seedhi ki 5 padiyaan (upar sunehri, neeche feeki)
    for (let i = 0; i < 5; i++) {
      const ry = 1010 + i * 235, gold = 1 - i * 0.19;
      ctx.fillStyle = i === 4 ? '#3a1512' : `rgba(201,162,39,${0.16 + gold * 0.2})`;
      D.rr(ctx, 690, ry, 780, 108, 12); ctx.fill();
      ctx.strokeStyle = i === 4 ? '#ff5147' : 'rgba(255,217,77,0.55)'; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = i === 4 ? '#ff5147' : 'rgba(255,233,176,0.5)';
      for (let d = 0; d < 5 - i; d++) D.circ(ctx, 760 + d * 44, ry + 54, 13); ctx.fill();
    }
    // Ola ka mini scooter nishaan upar se neeche sarakta hua
    const my = D.lerp(1064, 2004, sstep(D.clamp(lf / 34, 0, 1))) + (lf > 34 ? Math.sin((lf - 34) * 0.9) * 3 * D.clamp(1 - (lf - 34) / 8, 0, 1) : 0);
    scooterSide(1120, my + 92, 0.30, { tail: false });
    if (lf >= 30) { const p = spring((lf - 30) / 8); ctx.save(); ctx.translate(1080, 2245); ctx.scale(p, p); ctx.translate(-1080, -2245); plate(1080, 2245, 430, 118, 'PAANCHVA NUMBER — 5th', 46, '#ff8a7a'); ctx.restore(); }
    dust(f, 1080, 1600, 800, 8, 0.12);
  });
}, [110]);

// ===== S2 (125–242) "Ye hai Ola Electric — Bharat ki sabse badi electric scooter wali company." =====
// 2a SHOWROOM FRONT low-angle, orbit drift
shot(125, 185, 0.28, { cx: 990, cy: 1580, s: 0.55 }, { cx: 1170, cy: 1500, s: 0.60 }, (f, u) => {
  layer(0.5, () => daySky(GY, f));
  layer(0.8, () => {
    ctx.fillStyle = '#0d1826';
    for (let i = 0; i < 5; i++) { const bx = -600 + i * 620, bh = 520 + hash(i * 4.3) * 380; ctx.fillRect(bx, GY - bh, 420, bh); }
  });
  layer(1, () => {
    ground(GY, '#10160f', '#18251c');
    showroomSet(1080, GY, { sign: 'OLA ELECTRIC', signPx: 112 });
    lightCone(700, GY - 790, GY, 60, 320, 0.07); lightCone(1460, GY - 790, GY, 60, 320, 0.07);
    scooterFront(1080, GY, 1.02, {});
    dust(f, 1080, 1900, 1000, 10, 0.16);
  });
});
// 2b PUSH-IN side 3/4: hero scooter chamakta hua
shot(185, 215, 0.28, { cx: 1080, cy: 1500, s: 0.62 }, { cx: 1105, cy: 1430, s: 0.78 }, (f, u) => {
  const lf = f - 185;
  layer(0.6, () => daySky(GY, f));
  layer(0.85, () => { showroomSet(1080, GY, { sign: 'OLA ELECTRIC', signPx: 112 }); darkPool(1080, 1500, 1500, 0.25); });
  layer(1, () => {
    ground(GY, '#10160f', '#18251c');
    lampPool(1100, GY - 330, 700, 0.30, '140,255,200');
    scooterSide(1100, GY, 1.28, { spin: f * 0.02 });
    if (lf > 8) D.drawSparkle(ctx, 830, GY - 470, 30, 0.8);
    if (lf > 16) D.drawSparkle(ctx, 1420, GY - 240, 26, 0.7);
    wetReflect(1100, GY + 8, 800, 170, 0.13);
  });
});
// 2c MACRO: headlamp ka close-up, lens ki chamak
shot(215, 242, 0.26, { cx: 1080, cy: 1330, s: 0.92 }, { cx: 1080, cy: 1280, s: 1.02 }, (f, u) => {
  layer(0.7, () => { ctx.fillStyle = '#0a1a14'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1250, 1300, 0.25, '140,255,200'); });
  layer(1, () => {
    scooterFront(1080, 2430, 2.7, {});
    lampPool(1080, 1157, 420, 0.35 + 0.1 * Math.sin(f * 0.3));
    ctx.strokeStyle = 'rgba(255,255,255,0.20)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(500, 1080); ctx.lineTo(1660, 1080); ctx.stroke();
    plate(1080, 2085, 560, 104, 'OLA ELECTRIC', 52, '#b8ffd9');
  });
});

// ===== S3 (242–373) "2021 me scooter ek lakh me launch hua, line lag gayi thi." =====
// 3a PRICE BOARD spring-pop + confetti
shot(242, 290, 0.30, { cx: 1080, cy: 1420, s: 0.55 }, { cx: 1080, cy: 1340, s: 0.66 }, (f, u) => {
  const lf = f - 242;
  layer(0.5, () => daySky(GY, f));
  layer(1, () => {
    ground(GY, '#10160f', '#18251c');
    showroomSet(1080, GY, { sign: 'OLA ELECTRIC', signPx: 100, h: 900 });
    darkBoard(1080, 1300, 840, 370, [['₹99,999', 172, '#ffd94d'], ['LAUNCH • 2021', 56, '#ffe9b0']], spring(lf / 11));
    // confetti
    for (let i = 0; i < 26; i++) {
      const cxp = 300 + hash(i * 3.9) * 1560, cyp = ((hash(i * 7.7) * 900 + lf * (5 + hash(i) * 6)) % 1500) + 500;
      ctx.save(); ctx.translate(cxp, cyp); ctx.rotate(lf * 0.12 + i);
      ctx.fillStyle = ['#ffd94d', '#3ddc74', '#ff8a5c', '#7ec8ff'][i % 4];
      ctx.fillRect(-11, -6, 22, 12); ctx.restore();
    }
    scooterSide(620, GY, 0.55, {}); scooterSide(1560, GY, 0.55, { col: '#e8b13c', colD: '#9a7414' });
  });
});
// 3b SIDE TRACKING: kharidne walon ki line
shot(290, 335, 0.30, { cx: 880, cy: 1520, s: 0.58 }, { cx: 1260, cy: 1520, s: 0.58 }, (f, u) => {
  layer(0.5, () => daySky(GY, f));
  layer(0.8, () => showroomSet(430, GY, { sign: '', w: 900, h: 940 }));
  layer(1, () => {
    ground(GY, '#10160f', '#18251c');
    for (let i = 0; i < 7; i++) {
      const px = 760 + i * 205, bob = Math.sin(f * 0.14 + i * 1.4) * 5;
      personSil(px, GY + bob * 0.3, 0.92, { armB: -0.5 - 0.1 * Math.sin(f * 0.2 + i) });
      if (i % 3 === 1) scooterSide(px + 130, GY, 0.42, { col: i % 2 ? '#27b083' : '#7ec8ff', colD: i % 2 ? '#0e6e4e' : '#3a6ea8', tail: false });
    }
    plate(1330, 1150, 620, 108, 'KHARIDNE KI LINE', 52, '#ffd94d');
    dust(f, 1080, 1900, 1000, 8, 0.12);
  });
});
// 3c MACRO: chaabi (key) handover ki chamak
shot(335, 373, 0.28, { cx: 1080, cy: 1420, s: 0.60 }, { cx: 1080, cy: 1360, s: 0.80 }, (f, u) => {
  const lf = f - 335;
  layer(0.6, () => daySky(GY, f));
  layer(0.85, () => { showroomSet(1080, GY, { sign: 'OLA ELECTRIC', signPx: 100, h: 900 }); darkPool(1080, 1400, 1400, 0.3); });
  layer(1, () => {
    ground(GY, '#10160f', '#18251c');
    const kp = spring(lf / 10);
    ctx.save(); ctx.translate(1080, 1330); ctx.scale(kp, kp); ctx.rotate(-0.35 + 0.1 * Math.sin(f * 0.1));
    lampPool(0, 0, 430, 0.4);
    ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 20; D.circ(ctx, -60, -70, 92); ctx.stroke();
    ctx.fillStyle = '#e9c95c'; D.rr(ctx, 6, -34, 250, 62, 26); ctx.fill(); ctx.strokeStyle = '#8a5f10'; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#e9c95c'; ctx.fillRect(196, 26, 42, 58); ctx.fillRect(140, 26, 34, 44);
    ctx.fillStyle = '#14100a'; D.rr(ctx, -218, 60, 210, 96, 16); ctx.fill(); ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 4; ctx.stroke();
    text('NAYI CHAABI', -113, 109, 40, '#ffd94d');
    ctx.restore();
    D.drawSparkle(ctx, 900, 1150, 36, 0.85); D.drawSparkle(ctx, 1280, 1480, 28, 0.7);
    for (let i = 0; i < 14; i++) {
      const cxp = 420 + hash(i * 4.9) * 1320, cyp = ((hash(i * 6.7) * 700 + lf * (6 + hash(i) * 5)) % 1100) + 700;
      ctx.save(); ctx.translate(cxp, cyp); ctx.rotate(lf * 0.15 + i * 2);
      ctx.fillStyle = ['#ffd94d', '#3ddc74', '#ff8a5c'][i % 3]; ctx.fillRect(-10, -5, 20, 10); ctx.restore();
    }
  });
});

// ===== S4 (373–544) "2022 me ek scooter me aag lagi — 1,441 scooter wapas bulane pade." =====
// 4a RAAT KI GALI: battery se dhuan (Dutch tilt, low angle)
shot(373, 430, 0.34, { cx: 1080, cy: 1520, s: 0.60, rot: 0.045 }, { cx: 1090, cy: 1470, s: 0.67, rot: 0.085 }, (f, u) => {
  layer(0.5, () => nightSky(GY, f));
  layer(0.8, () => {
    ctx.fillStyle = '#0a141d';
    for (let i = 0; i < 5; i++) { const bx = -500 + i * 640, bh = 620 + hash(i * 5.9) * 420; ctx.fillRect(bx, GY - bh, 440, bh); }
    ctx.fillStyle = 'rgba(255,205,110,0.5)';
    for (let i = 0; i < 8; i++) if (hash(i * 8.3) < 0.6) ctx.fillRect(-380 + i * 420, GY - 480 - hash(i * 3) * 260, 34, 44);
  });
  layer(1, () => {
    ground(GY, '#0a0f0c', '#101812');
    lightCone(430, GY - 980, GY, 46, 300, 0.10);
    ctx.fillStyle = '#0d1420'; ctx.fillRect(416, GY - 1060, 26, 1060);
    lampPool(430, GY - 1010, 130, 0.5); ctx.fillStyle = '#ffe9a8'; D.circ(ctx, 430, GY - 1010, 17); ctx.fill();
    scooterSide(1080, GY, 1.06, { lamp: false, tail: false });
    smoke(1120, GY - 170, f, 6, 380);
    darkPool(1080, GY - 100, 700, 0.3);
    plate(1080, 1090, 430, 104, '2022 • RAAT', 50, '#ffb59a');
  });
});
// 4b AAG: laptein bhadakti hui (Dutch tilt zyada)
shot(430, 480, 0.36, { cx: 1090, cy: 1470, s: 0.67, rot: 0.09 }, { cx: 1100, cy: 1440, s: 0.76, rot: 0.12 }, (f, u) => {
  const lf = f - 430, burst = lf < 18 ? 0.45 + sstep(lf / 18) * 0.75 : 1.2;
  layer(0.5, () => nightSky(GY, f));
  layer(1, () => {
    ground(GY, '#0d0a08', '#171008');
    lampPool(1120, GY - 260, 800, 0.34 + 0.10 * Math.sin(f * 0.9), '255,120,40');
    scooterSide(1080, GY, 1.06, { lamp: false, tail: false });
    flames(1120, GY - 118, 300 * burst, 430 * burst, f, 3);
    flames(1010, GY - 110, 170 * burst, 280 * burst, f, 11);
    smoke(1140, GY - 480, f, 8, 560, '70,66,70');
    ctx.fillStyle = `rgba(255,90,20,${0.05 + 0.03 * Math.sin(f * 1.3)})`; ctx.fillRect(-800, GY - 900, 3760, 900);
    wetReflect(1080, GY + 8, 760, 180, 0.10);
  });
}, [448]);
// 4c TOP-DOWN CONVOY: trucks scooters wapas le jate hue + RECALL stamp
shot(480, 544, 0.32, { cx: 1080, cy: 1450, s: 0.60 }, { cx: 1080, cy: 1280, s: 0.60 }, (f, u) => {
  const lf = f - 480;
  layer(0.6, () => { // upar se sadak: gehra asphalt + kinare
    ctx.fillStyle = '#0c1118'; ctx.fillRect(-800, -800, 3760, 4640);
    ctx.fillStyle = '#111927'; ctx.fillRect(430, -800, 1300, 4640);
    ctx.fillStyle = 'rgba(255,217,77,0.5)';
    for (let i = 0; i < 12; i++) { const dy = ((i * 420 + lf * 15) % 5040) - 800; ctx.fillRect(1072, dy, 16, 190); }
    ctx.fillStyle = 'rgba(200,220,240,0.20)'; ctx.fillRect(448, -800, 10, 4640); ctx.fillRect(1702, -800, 10, 4640);
  });
  layer(1, () => {
    for (let i = 0; i < 3; i++) {
      const ty = 2650 - ((lf * 15 + i * 1150) % 3450);
      truckTop(1080, ty, 1.05, 0);
      scooterTop(1080, ty + 95, 0.92, 0.06);
      scooterTop(1080, ty + 300, 0.92, -0.05);
    }
    if (lf >= 25) stampDraw(1080, 1300, 800, 310, [['RECALL', 96, '#ff5147'], ['1,441 SCOOTER WAPAS', 62, '#ff5147']], -0.06, spring((lf - 25) / 7));
    dust(f, 1080, 1500, 900, 6, 0.10);
  });
}, [505]);

// ===== S5 (544–587) "Phir shikayaton ki baadh aa gayi." =====
// DARWAZA khula — shikayat-papers ki baarish camera ki taraf
shot(544, 587, 0.34, { cx: 1080, cy: 1420, s: 0.58 }, { cx: 1080, cy: 1360, s: 0.74 }, (f, u) => {
  const lf = f - 544;
  layer(0.6, () => { ctx.fillStyle = '#0a0d13'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1200, 0.16, '255,120,90'); });
  layer(1, () => {
    ground(GY, '#0c0f0a', '#131a12');
    // darwaza: do hisse khulte hue
    const open = sstep(D.clamp(lf / 14, 0, 1));
    ctx.fillStyle = '#1c1410'; ctx.fillRect(1080 - 330 - open * 250, GY - 980, 330, 980); ctx.fillRect(1080 + open * 250, GY - 980, 330, 980);
    ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 6;
    ctx.strokeRect(1080 - 330 - open * 250, GY - 980, 330, 980); ctx.strokeRect(1080 + open * 250, GY - 980, 330, 980);
    ctx.fillStyle = `rgba(255,150,90,${0.20 * open})`; ctx.fillRect(1080 - 320, GY - 970, 640, 970);
    // kagaz camera ki taraf uddte hue (scale badhta hai)
    for (let i = 0; i < 15; i++) {
      const p = ((lf * 0.016 * (0.7 + hash(i * 3.3) * 0.7) + hash(i * 9.1)) % 1);
      const px = 1080 + (hash(i * 5.7) - 0.5) * (300 + p * 1500), py = 1500 + (hash(i * 7.9) - 0.5) * (200 + p * 900) - p * 350;
      docPaper(px, py, 150, 200, { rot: (hash(i * 4.1) - 0.5) * 1.2 + p * 1.6, sc: 0.35 + p * 1.5, rows: 4 });
    }
    if (lf > 20) plate(1080, 1050, 660, 110, 'SHIKAYATON KI BAADH!', 54, '#ff8a7a');
  });
}, [550]);

// ===== S6 (587–744) "Sarkari helpline par ek saal me 10,644 shikayatein — sabse zyada service me deri ki." =====
// 6a PHONE MACRO: bajta hua phone, calls ki baadh
shot(587, 640, 0.30, { cx: 1080, cy: 1400, s: 0.60 }, { cx: 1080, cy: 1340, s: 0.70 }, (f, u) => {
  const lf = f - 587, ring = Math.sin(f * 1.6) * 0.02;
  layer(0.6, () => { ctx.fillStyle = '#070b12'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1150, 0.20, '120,200,255'); });
  layer(1, () => {
    ctx.save(); ctx.translate(1080, 1330); ctx.rotate(ring);
    lampPool(0, 0, 640, 0.3, '120,200,255');
    ctx.fillStyle = '#0d1420'; D.rr(ctx, -265, -480, 530, 960, 46); ctx.fill();
    ctx.strokeStyle = '#3f4a44'; ctx.lineWidth = 7; ctx.stroke();
    const sg = ctx.createLinearGradient(0, -440, 0, 440);
    sg.addColorStop(0, '#12293a'); sg.addColorStop(1, '#0a1826');
    ctx.fillStyle = sg; D.rr(ctx, -232, -408, 464, 816, 30); ctx.fill();
    // bajti hui ghanti ki lehrien
    for (let k = 0; k < 3; k++) { const rp = ((lf * 2.2 + k * 14) % 42) / 42; ctx.strokeStyle = `rgba(126,200,255,${0.7 * (1 - rp)})`; ctx.lineWidth = 6; D.circ(ctx, 0, -120, 60 + rp * 190); ctx.stroke(); }
    // phone icon (handset jaisi aakriti)
    ctx.strokeStyle = '#7ec8ff'; ctx.lineWidth = 26; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, -120, 74, Math.PI * 0.78, Math.PI * 1.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -120, 74, Math.PI * 1.72, Math.PI * 2.28); ctx.stroke();
    ctx.fillStyle = '#7ec8ff'; D.rr(ctx, -92, -168, 44, 84, 16); ctx.fill(); D.rr(ctx, 50, -80, 44, 84, 16); ctx.fill();
    text('HELPLINE', 0, 120, 62, '#bfe2ff');
    text('CALL PAR CALL...', 0, 205, 44, 'rgba(220,240,255,0.75)');
    ctx.restore();
    // aas-paas ubharte call-bubbles
    for (let i = 0; i < 7; i++) {
      const bx = 420 + hash(i * 6.3) * 1320, by = 800 + hash(i * 8.9) * 900, bp = spring(D.clamp((lf - i * 5) / 9, 0, 1));
      if (bp <= 0) continue;
      ctx.save(); ctx.translate(bx, by); ctx.scale(bp, bp);
      ctx.fillStyle = 'rgba(18,41,58,0.92)'; D.circ(ctx, 0, 0, 62); ctx.fill(); ctx.strokeStyle = '#7ec8ff'; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = '#7ec8ff'; text('!', 0, 2, 62, '#7ec8ff');
      ctx.restore();
    }
    plate(1080, 2130, 620, 106, 'SARKARI HELPLINE', 52, '#bfe2ff');
  });
});
// 6b COUNTER: 0 → 10,644 tez count-up
shot(640, 695, 0.30, { cx: 1080, cy: 1420, s: 0.56 }, { cx: 1080, cy: 1360, s: 0.65 }, (f, u) => {
  const lf = f - 640, n = Math.floor(10644 * sstep(D.clamp(lf / 40, 0, 1)));
  layer(0.6, () => { ctx.fillStyle = '#070b12'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1200, 0.20, '120,200,255'); });
  layer(1, () => {
    ground(GY, '#0a0e0c', '#10160f');
    darkBoard(1080, 1300, 880, 400, [[inr(n), 176, '#ffd94d'], ['SHIKAYATEIN • EK SAAL ME', 54, '#ffe9b0']], 1);
    // kinare par rakhe kagazon ke dher
    for (let i = 0; i < 3; i++) docPaper(500 + i * 40, 1980 - i * 26, 300, 400, { rot: (hash(i * 3) - 0.5) * 0.3, rows: 7 });
    for (let i = 0; i < 3; i++) docPaper(1660 - i * 40, 1980 - i * 26, 300, 400, { rot: (hash(i * 5 + 2) - 0.5) * 0.3, rows: 7 });
    if (lf > 42) D.drawSparkle(ctx, 660, 1120, 30, 0.8);
  });
});
// 6c GHADI: tez ghoomti suiyaan — service me deri
shot(695, 744, 0.30, { cx: 1030, cy: 1400, s: 0.60 }, { cx: 1130, cy: 1380, s: 0.67 }, (f, u) => {
  layer(0.6, () => { ctx.fillStyle = '#0a0c10'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1100, 0.16); });
  layer(1, () => {
    ground(GY, '#0c0f0a', '#131a12');
    clockDraw(1080, 1240, 320, f, 2.6);
    // ghadi ke peeche intezaar karta scooter (dhool bhara)
    scooterSide(1080, GY, 0.9, { col: '#5c6a63', colD: '#39423d', lamp: false, tail: false });
    darkPool(1080, GY - 200, 800, 0.22);
    dust(f, 1080, 1500, 900, 14, 0.22);
    plate(1080, 820, 640, 110, 'SERVICE ME DERI', 56, '#ffd94d');
  });
});

// ===== S7 (744–886) "Sarkar ne notice bheja to company boli: 99.1% shikayatein solve ho gayi!" =====
// 7a NOTICE: sarkari kagaz fly-in + mohar
shot(744, 815, 0.32, { cx: 1080, cy: 1400, s: 0.58 }, { cx: 1080, cy: 1340, s: 0.68 }, (f, u) => {
  const lf = f - 744, fly = sstep(D.clamp(lf / 22, 0, 1));
  layer(0.6, () => { ctx.fillStyle = '#0b0e14'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1150, 0.18, '255,150,120'); });
  layer(1, () => {
    ground(GY, '#0d0c0a', '#15120e');
    const dy = D.lerp(300, 1300, fly), dr = D.lerp(-0.5, -0.04, fly);
    docPaper(1080, dy, 700, 920, { rot: dr, rows: 8, head: 'NOTICE', headCol: '#7a1d12' });
    // upar sarkari ashok-stambh jaisa gol nishan
    ctx.fillStyle = '#7a1d12'; D.circ(ctx, 1080, dy - 330, 44); ctx.fill();
    ctx.fillStyle = '#e8e2d2'; D.circ(ctx, 1080, dy - 330, 30); ctx.fill();
    text('§', 1080, dy - 328, 44, '#7a1d12');
    if (lf >= 45) stampDraw(1300, dy + 300, 430, 190, [['NOTICE', 62, '#b3231b']], -0.18, spring((lf - 45) / 7));
    plate(1080, 2050, 620, 106, 'SARKAR KA NOTICE', 52, '#ffb59a');
    dust(f, 1080, 1400, 800, 8, 0.12);
  });
}, [789]);
// 7b COMPANY KA GOLDEN BOARD: "99.1% SOLVE!" nakli chamak ke saath
shot(815, 886, 0.30, { cx: 1080, cy: 1420, s: 0.56 }, { cx: 1080, cy: 1350, s: 0.66 }, (f, u) => {
  const lf = f - 815;
  layer(0.5, () => daySky(GY, f));
  layer(0.8, () => showroomSet(1080, GY, { sign: 'OLA ELECTRIC', signPx: 100, h: 940 }));
  layer(1, () => {
    ground(GY, '#10160f', '#18251c');
    goldBoard(1080, 1290, 920, 430, [['99.1%', 180, '#ffe98a'], ['SHIKAYATEIN SOLVE!', 66, '#fff3c4']], spring(lf / 11), (lf % 44) / 44);
    if (lf > 14) D.drawSparkle(ctx, 640, 1120, 32, 0.85);
    if (lf > 26) D.drawSparkle(ctx, 1520, 1460, 28, 0.75);
    scooterSide(1080, GY, 0.6, {});
  });
});

// ===== S8 (886–1042) "Lekin sarkar ki jaanch ne ulta kaha — 99.2% solve hui hi nahi!" =====
// 8a JAANCH: file par magnifier macro
shot(886, 945, 0.32, { cx: 1040, cy: 1400, s: 0.60 }, { cx: 1140, cy: 1350, s: 0.74 }, (f, u) => {
  const lf = f - 886;
  layer(0.6, () => { ctx.fillStyle = '#0a0c11'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1150, 0.16, '255,170,120'); });
  layer(1, () => {
    ground(GY, '#0d0b09', '#14110d');
    docPaper(1080, 1330, 760, 990, { rot: -0.05, rows: 9, head: 'JAANCH REPORT', headCol: '#26303c' });
    // magnifier: lens file par sarakta hua
    const mx = D.lerp(830, 1300, sstep(u)), my = D.lerp(1120, 1470, sstep(u));
    ctx.save();
    lampPool(mx, my, 330, 0.25);
    ctx.fillStyle = 'rgba(190,225,255,0.13)'; D.circ(ctx, mx, my, 205); ctx.fill();
    ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 13; D.circ(ctx, mx, my, 205); ctx.stroke();
    // lens ke andar badi likhawat (nakli bade akshar-bar)
    ctx.fillStyle = 'rgba(30,34,42,0.85)';
    for (let i = 0; i < 3; i++) ctx.fillRect(mx - 130, my - 60 + i * 56, 260 - i * 40, 24);
    ctx.strokeStyle = '#8a5f10'; ctx.lineWidth = 26; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(mx + 140, my + 140); ctx.lineTo(mx + 265, my + 265); ctx.stroke();
    ctx.restore();
    plate(1080, 2080, 620, 106, 'SARKAR KI JAANCH', 52, '#ffd94d');
  });
});
// 8b GOLDEN BOARD me DARAAR: chamak girti hai
shot(945, 1000, 0.34, { cx: 1080, cy: 1400, s: 0.62, rot: 0 }, { cx: 1080, cy: 1360, s: 0.67, rot: 0.03 }, (f, u) => {
  const lf = f - 945, cr = sstep(D.clamp((lf - 8) / 30, 0, 1));
  layer(0.5, () => { ctx.fillStyle = '#0a0a10'; ctx.fillRect(-800, -600, 3760, 4440); vgrad(-600, GY + 40, [[0, '#0a0a10'], [1, '#241016']]); });
  layer(1, () => {
    ground(GY, '#0e0a0a', '#171010');
    goldBoard(1080, 1290, 920, 430, [['99.1%', 180, '#d8c98a'], ['SHIKAYATEIN SOLVE!', 66, '#d8cdb0']], 1, -1);
    // daraarein (jagged lines) board par badhti hui
    ctx.strokeStyle = 'rgba(10,6,2,0.9)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    const cracks = [
      [[700, 1100], [830, 1210], [790, 1300], [920, 1400], [880, 1490]],
      [[1460, 1120], [1360, 1240], [1410, 1350], [1300, 1460]],
      [[1080, 1090], [1050, 1200], [1120, 1310], [1070, 1420]],
    ];
    for (const path of cracks) {
      const seg = Math.floor(cr * (path.length - 1) * 1.4);
      ctx.beginPath(); ctx.moveTo(path[0][0], path[0][1]);
      for (let i = 1; i <= Math.min(seg, path.length - 1); i++) ctx.lineTo(path[i][0], path[i][1]);
      if (seg >= 1) ctx.stroke();
    }
    // girte hue sunehre tukde
    for (let i = 0; i < 6; i++) {
      const fp = D.clamp((lf - 22 - i * 4) / 16, 0, 1); if (fp <= 0) continue;
      const tx = 760 + i * 115, ty = 1520 + fp * fp * 620;
      ctx.save(); ctx.translate(tx, ty); ctx.rotate(fp * 3 + i);
      ctx.fillStyle = '#8a6d1f'; ctx.beginPath(); ctx.moveTo(-26, -18); ctx.lineTo(26, -10); ctx.lineTo(4, 24); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    darkPool(1080, 1290, 900, 0.18 + 0.2 * cr);
  });
});
// 8c LAAL STAMP SLAM: "99.2% SOLVE HUI HI NAHI!" (sabse bada visual)
shot(1000, 1042, 0.36, { cx: 1080, cy: 1380, s: 0.62 }, { cx: 1080, cy: 1360, s: 0.66 }, (f, u) => {
  const lf = f - 1000;
  layer(0.6, () => { ctx.fillStyle = '#0d0508'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1300, 1350, 0.40, '255,70,50'); });
  layer(1, () => {
    ground(GY, '#0e0708', '#180b0d');
    lampPool(1080, 1180, 850, 0.38, '255,70,50');
    // peeche toota golden board (bright, daraaron ke saath)
    ctx.save(); ctx.globalAlpha = 0.8; goldBoard(1080, 1560, 880, 300, [['99.1%', 130, '#e8d488']], 1, -1); ctx.restore();
    ctx.strokeStyle = 'rgba(12,7,2,0.95)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    const crk = [
      [[740, 1440], [840, 1520], [800, 1600], [905, 1690]],
      [[1420, 1450], [1330, 1540], [1380, 1620], [1290, 1695]],
      [[1080, 1425], [1055, 1520], [1115, 1610], [1075, 1695]],
    ];
    for (const p of crk) { ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]); ctx.stroke(); }
    stampSolid(1080, 1180, 940, 400, [['99.2%', 168], ['SOLVE HUI HI NAHI!', 76]], -0.05, spring(lf / 6));
    if (lf > 10) { const p = spring((lf - 10) / 8); ctx.save(); ctx.translate(1080, 1760); ctx.scale(p, p); ctx.translate(-1080, -1760); plate(1080, 1760, 700, 112, 'COMPANY KA DAWAA JHOOTA!', 52, '#ff8a7a'); ctx.restore(); }
  });
}, [1000, 1012]);

// ===== S9 (1042–1121) "Natija? Log TVS aur Bajaj ki taraf chale gaye." =====
// 9a WIDE SIDE TRACK: bheed Ola se nikal kar dusri taraf
shot(1042, 1085, 0.30, { cx: 930, cy: 1520, s: 0.56 }, { cx: 1230, cy: 1520, s: 0.56 }, (f, u) => {
  const lf = f - 1042;
  layer(0.5, () => daySky(GY, f));
  layer(0.8, () => {
    showroomSet(430, GY, { sign: 'OLA', signPx: 84, w: 860, h: 920 });
    // dusri taraf ki saada dukaan (TVS/BAJAJ boards)
    ctx.fillStyle = '#1a2432'; ctx.fillRect(1560, GY - 880, 900, 880);
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.strokeRect(1560, GY - 880, 900, 880);
    ctx.fillStyle = 'rgba(255,196,100,0.16)'; ctx.fillRect(1600, GY - 640, 820, 500);
  });
  layer(1, () => {
    ground(GY, '#10160f', '#18251c');
    plate(1880, GY - 800, 560, 120, 'TVS • BAJAJ', 58, '#bfe2ff');
    for (let i = 0; i < 6; i++) {
      const px = 620 + ((lf * 13 + i * 175) % 1250), bob = Math.abs(Math.sin(f * 0.32 + i * 1.2)) * 10;
      personSil(px, GY - bob, 0.95, {});
    }
    scooterSide(1150, GY, 0.5, { col: '#5c6a63', colD: '#39423d', tail: false });
    dust(f, 1080, 1950, 900, 8, 0.12);
  });
});
// 9b SHOWROOM KI BATTIYAAN band hoti hui
shot(1085, 1121, 0.32, { cx: 1080, cy: 1500, s: 0.58 }, { cx: 1080, cy: 1460, s: 0.65 }, (f, u) => {
  const lf = f - 1085, litN = lf > 26 ? 0 : Math.max(1, 5 - Math.floor(lf / 7));
  layer(0.5, () => nightSky(GY, f));
  layer(1, () => {
    ground(GY, '#0a0f0c', '#101812');
    showroomSet(1080, GY, { sign: 'OLA ELECTRIC', signPx: 104, lit: litN });
    scooterFront(1080, GY, 0.98, { lamp: lf > 26 ? false : true });
    if (lf > 26) darkPool(1080, 1500, 1300, 0.3);
  });
});

// ===== S10 (1121–1204) "Bazaar ka hissa aadhe se girkar chhah pratishat par aa gaya." =====
// 10a BARS: 50 → 20 → 6, upar se chatakti hui
shot(1121, 1165, 0.30, { cx: 1080, cy: 1460, s: 0.58 }, { cx: 1080, cy: 1400, s: 0.62 }, (f, u) => {
  const lf = f - 1121;
  layer(0.6, () => { ctx.fillStyle = '#090c12'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1080, 1400, 1200, 0.16); });
  layer(1, () => {
    ground(GY, '#0b0e0c', '#12160f');
    ctx.strokeStyle = 'rgba(220,235,255,0.4)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(430, 2050); ctx.lineTo(1730, 2050); ctx.stroke();
    const bars = [
      { x: 700, h: 980, lab: '50%', col: '#c9a227', p: sstep(D.clamp(lf / 12, 0, 1)) },
      { x: 1080, h: 392, lab: '20%', col: '#8a6d1f', p: sstep(D.clamp((lf - 10) / 12, 0, 1)) },
      { x: 1460, h: 118, lab: '6%', col: '#b3231b', p: sstep(D.clamp((lf - 20) / 12, 0, 1)) },
    ];
    for (const b of bars) {
      const bh = b.h * b.p; if (bh <= 2) continue;
      const g = ctx.createLinearGradient(0, 2050 - bh, 0, 2050);
      g.addColorStop(0, b.col); g.addColorStop(1, '#141210');
      ctx.fillStyle = g; D.rr(ctx, b.x - 105, 2050 - bh, 210, bh, 8); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 3; ctx.stroke();
      text(b.lab, b.x, 2050 - bh - 58, 64, b.col === '#b3231b' ? '#ff8a7a' : '#ffd94d');
      // chatakte tukde (sirf badi bar se)
      if (b.h > 500) for (let i = 0; i < 5; i++) {
        const fp = ((lf * 0.03 + hash(i * 6.1)) % 1);
        ctx.fillStyle = `rgba(201,162,39,${0.7 * (1 - fp)})`;
        D.circ(ctx, b.x - 90 + hash(i * 3.3) * 180, 2050 - bh + fp * 300, 6 - fp * 3); ctx.fill();
      }
    }
    plate(1080, 830, 700, 108, 'BAZAAR KA HISSA', 54, '#ffd94d');
  });
});
// 10b SIRF 6%: akhiri bar par push-in, mitti girti hui
shot(1165, 1204, 0.32, { cx: 1230, cy: 1420, s: 0.62 }, { cx: 1300, cy: 1380, s: 0.72 }, (f, u) => {
  const lf = f - 1165;
  layer(0.6, () => { ctx.fillStyle = '#090c12'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1300, 1500, 1000, 0.14, '255,90,70'); });
  layer(1, () => {
    ground(GY, '#0b0e0c', '#12160f');
    ctx.strokeStyle = 'rgba(220,235,255,0.4)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(300, 2050); ctx.lineTo(2000, 2050); ctx.stroke();
    // feeki purani unchaiyon ke nishan (ghost)
    ctx.strokeStyle = 'rgba(201,162,39,0.30)'; ctx.lineWidth = 4; ctx.setLineDash([18, 14]);
    D.rr(ctx, 1355, 2050 - 980, 210, 980, 8); ctx.stroke(); ctx.setLineDash([]);
    text('50%', 1460, 1012, 56, 'rgba(255,217,77,0.45)');
    // asal chhoti bar
    ctx.fillStyle = '#b3231b'; D.rr(ctx, 1355, 2050 - 118, 210, 118, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 3; ctx.stroke();
    for (let i = 0; i < 8; i++) { // girti mitti
      const fp = ((lf * 0.05 + hash(i * 4.7)) % 1);
      ctx.fillStyle = `rgba(179,35,27,${0.8 * (1 - fp)})`;
      D.circ(ctx, 1380 + hash(i * 3.9) * 160, 1960 + fp * 90, 5 - fp * 2); ctx.fill();
    }
    if (lf >= 14) { const p = spring((lf - 14) / 8); ctx.save(); ctx.translate(1180, 1180); ctx.scale(p, p); ctx.translate(-1180, -1180); darkBoard(1180, 1180, 620, 230, [['SIRF 6%', 120, '#ff8a7a']], 1); ctx.restore(); }
  });
}, [1185]);

// ===== S11 (1204–1415) "Share 157 se girkar 33 — upar kharidne walon ke 79% paise doob gaye." =====
const CHART = { x0: 430, y0: 1920, x1: 1730, y1: 760, xc: 1560, yc: 800, x2: 1760, y2: 1900 };
function chartGrid() {
  ctx.strokeStyle = 'rgba(140,180,220,0.13)'; ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(360, 700 + i * 260); ctx.lineTo(1840, 700 + i * 260); ctx.stroke(); }
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(400 + i * 290, 640); ctx.lineTo(400 + i * 290, 2010); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(220,235,255,0.45)'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(360, 2010); ctx.lineTo(1840, 2010); ctx.stroke();
}
function chartPt(t) { // t 0..1 upar wali chadhaav (quadratic bezier)
  const a = CHART, mt = 1 - t;
  return [mt * mt * a.x0 + 2 * mt * t * a.xc * 0.55 + t * t * a.xc, mt * mt * a.y0 + 2 * mt * t * (a.y0 - 500) + t * t * a.yc];
}
// 11a ROCKET: line upar bhaagti, camera saath udta hai
shot(1204, 1270, 0.30, { cx: 1000, cy: 1620, s: 0.58 }, { cx: 1150, cy: 1180, s: 0.64 }, (f, u) => {
  const lf = f - 1204, prog = sstep(D.clamp(lf / 52, 0, 1));
  layer(0.6, () => { ctx.fillStyle = '#070a12'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1200, 1100, 1300, 0.15, '120,255,170'); });
  layer(1, () => {
    chartGrid();
    ctx.strokeStyle = '#3ddc74'; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) { const t = prog * i / 40, [px, py] = chartPt(t); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
    ctx.stroke();
    const [hx, hy] = chartPt(prog);
    lampPool(hx, hy, 190, 0.5, '80,255,150');
    ctx.fillStyle = '#baffd2'; D.circ(ctx, hx, hy, 17); ctx.fill();
    if (lf > 46) { const p = spring((lf - 46) / 8); ctx.save(); ctx.translate(1470, 700); ctx.scale(p, p); ctx.translate(-1470, -700); darkBoard(1470, 700, 470, 200, [['₹157', 118, '#3ddc74']], 1); ctx.restore(); }
    dust(f, 1080, 1400, 900, 8, 0.12);
  });
});
// 11b PEAK par DARAAR: line thartharati, phir tootne ka nishan
shot(1270, 1330, 0.32, { cx: 1180, cy: 1160, s: 0.66, rot: 0 }, { cx: 1200, cy: 1130, s: 0.68, rot: 0.05 }, (f, u) => {
  const lf = f - 1270, shake = lf > 15 ? Math.sin(f * 2.4) * 4 * D.clamp((lf - 15) / 12, 0, 1) : 0;
  layer(0.6, () => { ctx.fillStyle = '#070a12'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1400, 900, 1100, 0.14, '255,120,90'); });
  layer(1, () => {
    chartGrid();
    ctx.save(); ctx.translate(shake, shake * 0.6);
    ctx.strokeStyle = '#3ddc74'; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) { const [px, py] = chartPt(i / 40); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
    ctx.stroke();
    // peak se halki girawat ki shuruaat
    ctx.strokeStyle = '#ff5147';
    ctx.beginPath(); ctx.moveTo(CHART.xc, CHART.yc); ctx.quadraticCurveTo(1660, 860, 1730, 1010); ctx.stroke();
    ctx.restore();
    lampPool(CHART.xc, CHART.yc, 200, 0.4, '255,80,60');
    if (lf >= 15) { // daraar ka zigzag peak par
      ctx.strokeStyle = '#ff5147'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(1500, 690); ctx.lineTo(1548, 790); ctx.lineTo(1510, 860); ctx.lineTo(1570, 950); ctx.stroke();
      D.drawSparkle(ctx, 1560, 800, 34, 0.8);
    }
    darkBoard(1470, 700 - 190, 470, 190, [['₹157', 110, '#3ddc74']], 1);
  });
}, [1285]);
// 11c CRASH DIVE: camera line ke saath neeche girta hai
shot(1330, 1380, 0.34, { cx: 1200, cy: 1150, s: 0.66, rot: 0.05 }, { cx: 1180, cy: 1580, s: 0.60, rot: 0.10 }, (f, u) => {
  const lf = f - 1330, dp = sstep(D.clamp(lf / 34, 0, 1));
  layer(0.6, () => { ctx.fillStyle = '#0a070d'; ctx.fillRect(-800, -600, 3760, 4440); lampPool(1300, 1300, 1200, 0.15, '255,80,60'); });
  layer(1, () => {
    chartGrid();
    ctx.strokeStyle = '#3ddc74'; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) { const [px, py] = chartPt(i / 40); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
    ctx.stroke();
    // girti line (peak se neeche tak, progress ke saath)
    ctx.strokeStyle = '#ff5147';
    ctx.beginPath(); ctx.moveTo(CHART.xc, CHART.yc);
    const ex = D.lerp(CHART.xc, CHART.x2, dp), ey = D.lerp(CHART.yc, CHART.y2, dp * dp);
    ctx.quadraticCurveTo(D.lerp(CHART.xc, CHART.x2, dp * 0.5), D.lerp(CHART.yc, CHART.y2, dp * 0.35), ex, ey);
    ctx.stroke();
    lampPool(ex, ey, 200, 0.55, '255,60,40');
    ctx.fillStyle = '#ffc4ba'; D.circ(ctx, ex, ey, 16); ctx.fill();
    // speed ki lakeerein
    ctx.strokeStyle = 'rgba(255,120,100,0.4)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) { const sx = 500 + hash(i * 6.7) * 1200, sy = ((hash(i * 8.3) * 1400 + lf * 34) % 1500) + 400; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - 26, sy + 190); ctx.stroke(); }
    if (lf >= 34) { const p = spring((lf - 34) / 7); ctx.save(); ctx.translate(1420, 1985); ctx.scale(p, p); ctx.translate(-1420, -1985); darkBoard(1420, 1985, 470, 200, [['₹33', 118, '#ff5147']], 1); ctx.restore(); }
  });
}, [1370]);
// 11d SIKKE PAANI ME DOOBTE hue
shot(1380, 1415, 0.34, { cx: 1080, cy: 1400, s: 0.60 }, { cx: 1080, cy: 1370, s: 0.65 }, (f, u) => {
  const lf = f - 1380;
  layer(0.7, () => { vgrad(-600, 3840, [[0, '#04101f'], [0.5, '#06263f'], [1, '#02101c']]); lampPool(1080, 500, 900, 0.14, '120,200,255'); });
  layer(1, () => {
    // paani ki satah ki lakeer
    ctx.strokeStyle = 'rgba(160,220,255,0.5)'; ctx.lineWidth = 5;
    ctx.beginPath(); for (let x = -200; x <= 2360; x += 60) ctx.lineTo(x, 620 + Math.sin(x * 0.01 + f * 0.15) * 12); ctx.stroke();
    for (let i = 0; i < 6; i++) { // doobte sikke
      const p = D.clamp((lf + i * 5) / 38, 0, 1), cxp = 620 + i * 185, cyp = 700 + p * 1250;
      ctx.save(); ctx.translate(cxp, cyp); ctx.rotate(p * 4 + i); ctx.globalAlpha = 1 - p * 0.55;
      coinDraw(0, 0, 52); ctx.restore();
      for (let b = 0; b < 3; b++) { // bulbule
        const bp = ((lf * 0.03 + hash(i * 7 + b * 3)) % 1);
        ctx.strokeStyle = `rgba(190,230,255,${0.6 * (1 - bp)})`; ctx.lineWidth = 3;
        D.circ(ctx, cxp + (hash(b * 5 + i) - 0.5) * 60, cyp - bp * 260, 7 + bp * 8); ctx.stroke();
      }
    }
    if (lf >= 8) { const p = spring((lf - 8) / 9); ctx.save(); ctx.translate(1080, 1080); ctx.scale(p, p); ctx.translate(-1080, -1080); darkBoard(1080, 1080, 800, 240, [['79% PAISE DOOB GAYE', 84, '#ff8a7a']], 1); ctx.restore(); }
  });
});

// ===== S12 (1415–1519) "Scooter bechna asaan hai dost... use chalaye rakhna hi asli business hai." =====
// 12a SOLD tag chamakta hua
shot(1415, 1465, 0.28, { cx: 1080, cy: 1480, s: 0.60 }, { cx: 1080, cy: 1420, s: 0.70 }, (f, u) => {
  const lf = f - 1415;
  layer(0.5, () => daySky(GY, f));
  layer(0.8, () => showroomSet(1080, GY, { sign: 'OLA ELECTRIC', signPx: 100, h: 940 }));
  layer(1, () => {
    ground(GY, '#10160f', '#18251c');
    lampPool(1080, GY - 320, 720, 0.3, '140,255,200');
    scooterSide(1080, GY, 1.1, { spin: f * 0.02 });
    // handle se latka SOLD tag (hilta hua)
    const tp = spring(lf / 10);
    ctx.save(); ctx.translate(1335, GY - 640); ctx.rotate(Math.sin(f * 0.09) * 0.14); ctx.scale(tp, tp);
    ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 58); ctx.stroke();
    ctx.fillStyle = '#b3231b'; D.rr(ctx, -105, 58, 210, 96, 12); ctx.fill();
    ctx.strokeStyle = '#ffd94d'; ctx.lineWidth = 4; ctx.stroke();
    text('SOLD', 0, 107, 56, '#ffe9b0');
    ctx.restore();
    if (lf > 12) D.drawSparkle(ctx, 800, GY - 520, 30, 0.8);
    if (lf > 22) D.drawSparkle(ctx, 1400, GY - 260, 26, 0.7);
    wetReflect(1080, GY + 8, 820, 170, 0.13);
  });
});
// 12b SUNSET: wahi scooter akela sadak par chalta hua + punch board
shot(1465, 1519, 0.28, { cx: 1080, cy: 1500, s: 0.58 }, { cx: 1080, cy: 1450, s: 0.63 }, (f, u) => {
  const lf = f - 1465;
  layer(0.45, () => duskSky(GY, f));
  layer(0.7, () => { // peeche sarakte ped/ghar (parallax)
    ctx.fillStyle = '#160d18';
    for (let i = 0; i < 7; i++) {
      const bx = ((i * 620 - lf * 7) % 4340 + 4340) % 4340 - 900;
      ctx.fillRect(bx, GY - 300, 300, 300);
      D.circ(ctx, bx + 150, GY - 330, 120); ctx.fill();
    }
  });
  layer(1, () => {
    ground(GY, '#171019', '#211426');
    // sadak ki beech wali lakeer (behti hui)
    ctx.fillStyle = 'rgba(255,217,120,0.5)';
    for (let i = 0; i < 8; i++) { const dx = ((i * 480 - lf * 16) % 3840 + 3840) % 3840 - 800; ctx.fillRect(dx, GY + 190, 210, 16); }
    lampPool(1010, GY - 300, 640, 0.3);
    scooterSide(1010, GY, 1.02, { spin: f * 0.35, lamp: true });
    lightCone(1250, GY - 470, GY + 60, 40, 330, 0.10);
    if (lf >= 8) darkBoard(1080, 1060, 920, 300, [['BECHNA ASAAN HAI', 74, '#ffd94d'], ['CHALAYE RAKHNA ASLI BUSINESS', 54, '#ffe9b0']], spring((lf - 8) / 10));
    dust(f, 1080, 1800, 900, 8, 0.12);
  });
});

// ===== S13 (1519–1628) "Scooter lene se pehle service centre ki line dekh lena — wahi asli review hai." =====
// 13a SERVICE CENTRE: kharab scooters ki lambi line, camera track
shot(1519, 1575, 0.30, { cx: 880, cy: 1520, s: 0.58 }, { cx: 1220, cy: 1520, s: 0.58 }, (f, u) => {
  layer(0.5, () => daySky(GY, f));
  layer(0.8, () => {
    ctx.fillStyle = '#232d26'; ctx.fillRect(-400, GY - 900, 1500, 900);
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.strokeRect(-400, GY - 900, 1500, 900);
    ctx.fillStyle = 'rgba(20,30,26,0.9)'; ctx.fillRect(-340, GY - 700, 1380, 480);
  });
  layer(1, () => {
    ground(GY, '#11140f', '#1a201a');
    plate(640, GY - 800, 700, 116, 'SERVICE CENTRE', 56, '#ffd94d');
    const defs = [
      { x: 620, s: 0.52, tilt: 0.05, col: '#5c6a63', colD: '#39423d' },
      { x: 1010, s: 0.55, tilt: -0.04, col: '#6a6255', colD: '#453f35' },
      { x: 1420, s: 0.52, tilt: 0.10, col: '#5c6a63', colD: '#39423d' },
      { x: 1830, s: 0.55, tilt: 0, col: '#71624a', colD: '#4a3f2c' },
    ];
    defs.forEach((d, i) => { scooterSide(d.x, GY, d.s, { tilt: d.tilt, col: d.col, colD: d.colD, lamp: false, tail: false }); });
    smoke(1010, GY - 200, f, 4, 260);
    // ek gira hua scooter
    scooterSide(2230, GY + 40, 0.5, { tilt: 1.25, col: '#5c6a63', colD: '#39423d', lamp: false, tail: false });
    dust(f, 1080, 1700, 1100, 12, 0.18);
  });
});
// 13b LINE KE AAKHIR TAK track + "YEHI ASLI REVIEW HAI"
shot(1575, 1628, 0.30, { cx: 1220, cy: 1520, s: 0.58 }, { cx: 1330, cy: 1490, s: 0.65 }, (f, u) => {
  const lf = f - 1575;
  layer(0.5, () => daySky(GY, f));
  layer(1, () => {
    ground(GY, '#11140f', '#1a201a');
    const defs = [
      { x: 500, s: 0.52, tilt: -0.06 }, { x: 900, s: 0.55, tilt: 0.04 },
      { x: 1310, s: 0.52, tilt: 0 }, { x: 1720, s: 0.55, tilt: -0.09 },
      { x: 2130, s: 0.52, tilt: 0.06 },
    ];
    defs.forEach((d) => scooterSide(d.x, GY, d.s, { tilt: d.tilt, col: '#5c6a63', colD: '#39423d', lamp: false, tail: false }));
    personSil(700, GY, 0.95, { armA: 0.5 }); // intezaar me khada malik, haath kamar par
    personSil(1560, GY, 0.95, { armB: 0.4 });
    smoke(1720, GY - 190, f, 4, 240);
    dust(f, 1200, 1700, 1100, 12, 0.18);
    if (lf >= 16) { const p = spring((lf - 16) / 9); ctx.save(); ctx.translate(1080, 1130); ctx.scale(p, p); ctx.translate(-1080, -1130); plate(1080, 1130, 720, 116, 'YEHI ASLI REVIEW HAI', 56, '#ffd94d'); ctx.restore(); }
  });
});

// ===== S14 (1628–1732) "Ab tum batao — galti scooter me thi, ya service me?" =====
// 14a pehla choice board slam: SCOOTER ME?
shot(1628, 1680, 0.32, { cx: 1020, cy: 1500, s: 0.60 }, { cx: 1080, cy: 1480, s: 0.62 }, (f, u) => {
  const lf = f - 1628;
  layer(0.6, () => { ctx.fillStyle = '#08090f'; ctx.fillRect(-800, -600, 3760, 4440); vgrad(-600, GY + 40, [[0, '#08090f'], [1, '#1c0f14']]); lampPool(1080, 1400, 1200, 0.14); });
  layer(1, () => {
    ground(GY, '#0c0a0c', '#141013');
    scooterSide(1080, GY, 0.85, { col: '#1e916e', colD: '#0b5f43', lamp: false, tail: false });
    plate(1080, 1060, 600, 112, 'GALTI KISME THI?', 56, '#ffd94d');
    if (lf >= 32) choiceBoard(820, 1520, 470, 190, 'SCOOTER ME?', 52, '#ff5147', spring((lf - 32) / 7));
    dust(f, 1080, 1600, 900, 8, 0.12);
  });
}, [1660]);
// 14b dusra choice board slam: SERVICE ME? — camera sway
shot(1680, 1732, 0.32, { cx: 1080, cy: 1480, s: 0.62 }, { cx: 1140, cy: 1480, s: 0.62 }, (f, u) => {
  const lf = f - 1680, pulse = 0.5 + 0.5 * Math.sin(f * 0.22);
  layer(0.6, () => { ctx.fillStyle = '#08090f'; ctx.fillRect(-800, -600, 3760, 4440); vgrad(-600, GY + 40, [[0, '#08090f'], [1, '#0d1a12']]); lampPool(1080, 1400, 1200, 0.14); });
  layer(1, () => {
    ground(GY, '#0c0a0c', '#141013');
    scooterSide(1080, GY, 0.85, { col: '#1e916e', colD: '#0b5f43', lamp: false, tail: false });
    plate(1080, 1060, 600, 112, 'GALTI KISME THI?', 56, '#ffd94d');
    choiceBoard(820, 1520, 470, 190, 'SCOOTER ME?', 52, '#ff5147', 1);
    if (lf >= 10) choiceBoard(1340, 1520, 470, 190, 'SERVICE ME?', 52, '#3ddc74', spring((lf - 10) / 7));
    lampPool(820, 1520, 340, 0.10 + 0.08 * pulse, '255,80,60');
    lampPool(1340, 1520, 340, 0.10 + 0.08 * (1 - pulse), '80,255,150');
  });
}, [1690]);

// ===== S15 (1732–1806) "Agli baar: tumhara home loan tumhe asal me kitna mehenga padta hai." =====
// DARK END CARD: ghar + loan kagaz + tease board
shot(1732, 1806, 0.30, { cx: 1080, cy: 1460, s: 0.56 }, { cx: 1080, cy: 1420, s: 0.61 }, (f, u) => {
  const lf = f - 1732;
  layer(0.55, () => { ctx.fillStyle = '#05070d'; ctx.fillRect(-800, -600, 3760, 4440); vgrad(-600, GY + 40, [[0, '#05070d'], [1, '#141021']]); lampPool(1080, 1250, 1250, 0.13); });
  layer(1, () => {
    ground(GY, '#090a10', '#101019');
    // ghar ka silhouette (baayein) — roshan khidki
    D.drawHouse(ctx, 760, GY, 1.15);
    darkPool(760, GY - 260, 430, 0.35);
    lampPool(760, GY - 330, 260, 0.22);
    // loan ka kagaz (daayein, tedha)
    docPaper(1520, 1680, 400, 520, { rot: 0.10, rows: 6, head: 'LOAN', headCol: '#7a1d12', headGap: 56 });
    coinStack(1470, GY, 4, 36);
    if (lf >= 6) { const p = spring((lf - 6) / 9); ctx.save(); ctx.translate(1080, 930); ctx.scale(p, p); ctx.translate(-1080, -930); plate(1080, 930, 480, 112, 'AGLI BAAR', 58, '#ffd94d'); ctx.restore(); }
    if (lf >= 16) darkBoard(1080, 1230, 880, 250, [['HOME LOAN KA', 72, '#ffe9b0'], ['ASLI HISAAB', 84, '#ffd94d']], spring((lf - 16) / 10));
    dust(f, 1080, 1500, 900, 8, 0.10);
  });
});

// ---------------- TRANSITIONS ----------------
// index = shot order 1a..15; h = pehle ~7 frame (enter), t = aakhri ~7 frame (exit)
const TR = [
  {},                             // 1a tower low-angle
  {},                             // 1b push-in continue
  { h: 'dark' },                  // 1c seedhi par andhera
  { h: 'flash' },                 // 2a showroom chamak
  {},                             // 2b push continue
  {},                             // 2c macro match
  { h: 'flash' },                 // 3a price pop
  {},                             // 3b line track
  {},                             // 3c chaabi match
  { h: 'dark' },                  // 4a raat ka andhera
  {},                             // 4b aag continue
  { h: 'flash' },                 // 4c top-down chamak
  { h: 'dark' },                  // 5 darwaza andhera
  { h: 'streak' },                // 6a calls ki speed
  {},                             // 6b counter match
  {},                             // 6c ghadi match
  { h: 'flash' },                 // 7a notice chamak
  {},                             // 7b golden match
  { h: 'dark' },                  // 8a jaanch andhera
  {},                             // 8b daraar continue
  { h: 'flash' },                 // 8c stamp slam-in
  { h: 'flash' },                 // 9a din ki chamak
  { t: 'dark' },                  // 9b battiyaan bujhti
  { h: 'dark' },                  // 10a bars andhera
  {},                             // 10b match
  { h: 'flash' },                 // 11a rocket chamak
  {},                             // 11b peak match
  { t: 'streak' },                // 11c dive speed
  { h: 'dark' },                  // 11d paani ka andhera
  { h: 'flash' },                 // 12a SOLD chamak
  {},                             // 12b sunset match
  { h: 'dark' },                  // 13a service andhera
  {},                             // 13b match
  { h: 'flash' },                 // 14a sawal chamak
  {},                             // 14b match
  { h: 'dark', t: 'dark' },       // 15 end card band
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
