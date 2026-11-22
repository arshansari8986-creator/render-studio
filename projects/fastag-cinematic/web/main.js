// EP-6 FASTag TOLL EXPOSE — CINEMATIC MULTI-ANGLE (1493 frames @30fps). BINA CHARACTER: koi hero, koi chehra nahi.
// Sirf gaadiyaan, toll plaza, phone, ghar, naksha, card, sikke. Camera: har sentence par kam se kam ek EXTREME angle
// (ground-level / aerial top-down / POV / macro / fly-through / coin-level tracking), Dutch tilt tension shots me,
// har shot me push-in/pull-out/orbit-drift/slide — camera kabhi static nahi. Signature shot: S14b coin-level tracking.
// Frame-safety: saare boards/text dono camera extremes par visible-rect ke andar (boards auto-fit via measureText).
// Harness: window.ready, window.renderFrame(f), window.TOTAL.
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import * as D from './draw.js';

const W = 1080, H = 1920, TOTAL = 1493, FPS = 30;
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const DEV_FONT = '"Noto Sans Devanagari"';
const fontReady = (async () => {
  try {
    const face = new FontFace('Noto Sans Devanagari', `url(data:font/ttf;base64,${DEVANAGARI_BOLD_B64})`, { weight: '700' });
    await face.load(); document.fonts.add(face);
    await document.fonts.load(`700 60px ${DEV_FONT}`, 'FASTag ₹5');
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
function inr(n) { // Indian number grouping: 1255000 -> 12,55,000
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
function darkPool(x, y, r, a = 0.45) { // haath ke saaye / andhere ke liye radial kaala pool
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
// ---------------- transition FX (screen-space) ----------------
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
  if (CAM.rot) ctx.rotate(CAM.rot * (0.35 + 0.65 * k)); // peeche ki parat kam tedhi — depth wala tilt
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
// Rang-border wala choice board (finale ke liye)
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
// LCD screen (chamakti hui, scanlines ke saath)
function lcdScreen(x, y, w, h, main, sub, col = '#39e6c3', mainPx = 92) {
  ctx.save(); ctx.translate(x, y);
  lampPool(0, 0, w * 0.72, 0.20, col === '#39e6c3' ? '120,255,205' : '255,214,120');
  ctx.fillStyle = '#0a1410'; D.rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.fill();
  ctx.strokeStyle = '#3f4a44'; ctx.lineWidth = 6; ctx.stroke();
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, 'rgba(120,255,205,0.13)'); g.addColorStop(1, 'rgba(120,255,205,0.03)');
  ctx.fillStyle = g; ctx.fillRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16);
  text(main, 0, sub ? -h * 0.13 : 2, fitPx(main, mainPx, w - 52), col);
  if (sub) text(sub, 0, h * 0.30, fitPx(sub, 36, w - 52), 'rgba(220,245,230,0.8)');
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let ly = -h / 2 + 14; ly < h / 2 - 8; ly += 13) ctx.fillRect(-w / 2 + 10, ly, w - 20, 3);
  ctx.restore();
}
// Sikke
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
// Silhouette hatheli (upar ki taraf khuli) — phone/statement shots ke liye
function palmSil(x, y, s, flip = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * flip, s);
  const col = '#0b0908';
  ctx.fillStyle = col;
  const fin = [[-168, -268, 66, 235, -0.10], [-86, -308, 70, 275, -0.03], [2, -318, 70, 285, 0.03], [90, -282, 66, 245, 0.10]];
  for (const [fx, fy, fw, fh, fr] of fin) { ctx.save(); ctx.translate(fx, fy + fh / 2); ctx.rotate(fr); D.rr(ctx, -fw / 2, -fh / 2, fw, fh, fw / 2); ctx.fill(); ctx.restore(); }
  ctx.save(); ctx.translate(196, -60); ctx.rotate(-0.62); D.rr(ctx, -38, -110, 76, 220, 38); ctx.fill(); ctx.restore();
  D.ell(ctx, 0, 30, 225, 200); ctx.fill();
  D.rr(ctx, -95, 150, 190, 340, 70); ctx.fill();
  ctx.strokeStyle = 'rgba(255,220,160,0.4)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 30, 218, -0.5, 0.75); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(120, -330); ctx.lineTo(128, -120); ctx.stroke();
  ctx.restore();
}
// Car ka side profile (silhouette-ish, rim-lit) — origin ground center. Model project se liya gaya.
function carSide(x, gy, s, f) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  D.softShadow(ctx, 0, 12, 470, 24, 0.35);
  const body = ctx.createLinearGradient(0, -560, 0, 0);
  body.addColorStop(0, '#2c4258'); body.addColorStop(1, '#16222f');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-470, -60); ctx.lineTo(-470, -240);
  ctx.quadraticCurveTo(-460, -310, -360, -330);
  ctx.lineTo(-300, -520); ctx.quadraticCurveTo(-290, -565, -220, -568);
  ctx.lineTo(150, -568); ctx.quadraticCurveTo(230, -565, 260, -510);
  ctx.lineTo(330, -340); ctx.quadraticCurveTo(440, -320, 462, -250);
  ctx.lineTo(470, -60); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#0a1420';
  ctx.beginPath(); ctx.moveTo(-268, -540); ctx.lineTo(-60, -540); ctx.lineTo(-60, -360); ctx.lineTo(-300, -360); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-30, -540); ctx.lineTo(140, -540); ctx.lineTo(215, -360); ctx.lineTo(-30, -360); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(160,200,235,0.35)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-268, -540); ctx.lineTo(-60, -540); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,205,110,0.5)'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-360, -330); ctx.quadraticCurveTo(-300, -560, -220, -566); ctx.lineTo(150, -566); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-40, -350); ctx.lineTo(-40, -80); ctx.stroke();
  ctx.fillStyle = 'rgba(200,220,240,0.5)'; ctx.fillRect(-120, -320, 52, 10);
  for (const wx of [-300, 300]) {
    ctx.fillStyle = '#0a0c10'; D.circ(ctx, wx, -62, 80); ctx.fill(); ctx.strokeStyle = '#39445c'; ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = '#59667d'; D.circ(ctx, wx, -62, 30); ctx.fill();
  }
  lampPool(-468, -215, 110, 0.3);
  ctx.fillStyle = '#ffe9a8'; D.ell(ctx, -466, -215, 10, 17); ctx.fill();
  ctx.restore();
}
// Car ka peeche ka hissa (queue/jam shots) — origin ground center
function carRear(x, gy, s, tint = '#22344a') {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  D.softShadow(ctx, 0, 10, 300, 20, 0.35);
  const g = ctx.createLinearGradient(0, -470, 0, 0);
  g.addColorStop(0, tint); g.addColorStop(1, '#10161f');
  ctx.fillStyle = g; D.rr(ctx, -300, -470, 600, 470, 46); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  // peeche ki khidki
  ctx.fillStyle = '#0a1420'; D.rr(ctx, -215, -430, 430, 150, 26); ctx.fill();
  ctx.strokeStyle = 'rgba(160,200,235,0.30)'; ctx.lineWidth = 4; ctx.stroke();
  // chhat ki rim light
  ctx.strokeStyle = 'rgba(255,205,110,0.4)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-260, -452); ctx.lineTo(260, -452); ctx.stroke();
  // tail lights (laal chamak)
  lampPool(-218, -215, 90, 0.5, '255,50,40'); lampPool(218, -215, 90, 0.5, '255,50,40');
  ctx.fillStyle = '#ff3b30'; D.rr(ctx, -272, -238, 108, 44, 12); ctx.fill(); D.rr(ctx, 164, -238, 108, 44, 12); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; D.rr(ctx, -272, -238, 108, 14, 7); ctx.fill(); D.rr(ctx, 164, -238, 108, 14, 7); ctx.fill();
  // number plate
  ctx.fillStyle = '#dfe5ea'; D.rr(ctx, -95, -150, 190, 62, 8); ctx.fill();
  ctx.fillStyle = '#26303c'; ctx.fillRect(-95, -150, 34, 62);
  text('IND', -78, -118, 24, '#dfe5ea');
  // pahiye ke kinare
  ctx.fillStyle = '#0a0c10'; D.rr(ctx, -292, -78, 62, 78, 12); ctx.fill(); D.rr(ctx, 230, -78, 62, 78, 12); ctx.fill();
  ctx.restore();
}
// Upar se dikhti car (aerial shots) — origin center, naak upar (-y)
function carTop(x, y, s, c1 = '#2c4258', c2 = '#16222f') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 6, 10, 100, 170, 0.3);
  const g = ctx.createLinearGradient(0, -175, 0, 175);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; D.rr(ctx, -88, -175, 176, 350, 42); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  // windshield (aage) + peeche ki khidki
  ctx.fillStyle = '#0a1420'; D.rr(ctx, -70, -118, 140, 52, 14); ctx.fill(); D.rr(ctx, -66, 62, 132, 40, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(160,200,235,0.35)'; ctx.lineWidth = 3; D.rr(ctx, -70, -118, 140, 52, 14); ctx.stroke();
  // chhat
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; D.rr(ctx, -62, -52, 124, 104, 16); ctx.fill();
  // headlights (aage, upar) + tail (neeche)
  ctx.fillStyle = '#ffe9a8'; D.circ(ctx, -56, -168, 10); ctx.fill(); D.circ(ctx, 56, -168, 10); ctx.fill();
  ctx.fillStyle = '#ff3b30'; D.circ(ctx, -56, 168, 8); ctx.fill(); D.circ(ctx, 56, 168, 8); ctx.fill();
  // side mirrors
  ctx.fillStyle = c2; ctx.fillRect(-102, -104, 16, 26); ctx.fillRect(86, -104, 16, 26);
  ctx.restore();
}

// ---------------- FASTag WORLD ----------------
const GY = 2400;
// Raat ka aakash (teal): gehra upar, horizon par halki teal chamak, chaand + taare
function nightSky(gy, f = 0) {
  ctx.fillStyle = '#020a12'; ctx.fillRect(-900, -2600, 3960, 2000);
  vgrad(-600, gy + 40, [[0, '#020a12'], [0.45, '#06222f'], [0.78, '#0a3542'], [1, '#155263']]);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 40; i++) { const sx = -600 + hash(i * 1.9) * 3300, sy = -500 + hash(i * 2.7) * 1150; ctx.globalAlpha = 0.2 + hash(i * 3.3) * 0.5; D.circ(ctx, sx, sy, 2 + hash(i) * 2.2); ctx.fill(); }
  ctx.globalAlpha = 1;
  // chaand (upar-daayein) + uski chamak
  lampPool(1560, gy - 1560, 340, 0.30, '190,230,255');
  ctx.fillStyle = '#dceefc'; D.circ(ctx, 1560, gy - 1560, 58); ctx.fill();
  ctx.fillStyle = 'rgba(160,190,215,0.5)'; D.circ(ctx, 1540, gy - 1580, 13); ctx.fill(); D.circ(ctx, 1582, gy - 1532, 9); ctx.fill();
  // door ki pahadi/rekha
  ctx.fillStyle = '#04141d';
  ctx.beginPath(); ctx.moveTo(-800, gy);
  for (let x = -800; x <= 2960; x += 290) ctx.lineTo(x, gy - 120 - hash(x * 0.41) * 130);
  ctx.lineTo(2960, gy); ctx.closePath(); ctx.fill();
}
// Dusk aakash (finale ke liye): gehra neela upar, sunehra horizon
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
// Ghar: deewaar, chhat, roshan khidki, darwaza, driveway par khadi car, street lamp
function houseSet(cx, gy, f, o = {}) {
  // zameen / gali
  ctx.fillStyle = '#0d1512'; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  ctx.fillStyle = '#131c22'; ctx.fillRect(-800, gy, 3760, 190); // gali ki patti
  ctx.fillStyle = 'rgba(160,220,255,0.07)'; ctx.fillRect(-800, gy, 3760, 8);
  // driveway (daayein, halki concrete patti)
  ctx.fillStyle = '#1a232c';
  D.poly(ctx, [[cx + 210, gy], [cx + 700, gy], [cx + 880, 3840], [cx + 260, 3840]]); ctx.fill();
  // ghar ki body
  const hg = ctx.createLinearGradient(cx - 340, 0, cx + 340, 0);
  hg.addColorStop(0, '#1b2836'); hg.addColorStop(0.55, '#26374a'); hg.addColorStop(1, '#16222f');
  ctx.fillStyle = hg; D.rr(ctx, cx - 340, gy - 800, 680, 800, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  // chhat (trapezoid) + kinare ki roshni
  ctx.fillStyle = '#0d1420';
  D.poly(ctx, [[cx - 410, gy - 800], [cx - 240, gy - 1010], [cx + 240, gy - 1010], [cx + 410, gy - 800]]); ctx.fill();
  ctx.strokeStyle = 'rgba(190,225,255,0.35)'; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.fillStyle = '#0a1018'; ctx.fillRect(cx - 60, gy - 1090, 120, 90); // chhat par paani ki tanki
  // roshan khidki (baayein) — andar garam roshni
  const wx = cx - 175, wy = gy - 470;
  if (o.lit !== false) lampPool(wx, wy, 300, 0.34);
  ctx.fillStyle = o.lit !== false ? '#ffca7a' : '#0e1a26'; D.rr(ctx, wx - 105, wy - 130, 210, 260, 8); ctx.fill();
  ctx.strokeStyle = '#0a0f16'; ctx.lineWidth = 9; ctx.stroke();
  ctx.strokeStyle = 'rgba(90,50,10,0.65)'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(wx, wy - 130); ctx.lineTo(wx, wy + 130); ctx.moveTo(wx - 105, wy); ctx.lineTo(wx + 105, wy); ctx.stroke();
  if (o.lit !== false) { ctx.fillStyle = 'rgba(255,255,255,0.30)'; ctx.fillRect(wx - 96, wy - 121, 60, 110); }
  // band khidki (daayein)
  ctx.fillStyle = '#0e1a26'; D.rr(ctx, cx + 130, wy - 130, 180, 260, 8); ctx.fill();
  ctx.strokeStyle = '#0a0f16'; ctx.lineWidth = 9; ctx.stroke();
  ctx.strokeStyle = 'rgba(140,180,220,0.18)'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(cx + 220, wy - 130); ctx.lineTo(cx + 220, wy + 130); ctx.stroke();
  // darwaza (beech-neeche)
  ctx.fillStyle = '#0c1220'; D.rr(ctx, cx - 62, gy - 330, 124, 330, 8); ctx.fill(); ctx.strokeStyle = 'rgba(190,225,255,0.25)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#ffd94d'; D.circ(ctx, cx + 34, gy - 165, 7); ctx.fill();
  // driveway par khadi car
  carSide(cx + 300, gy, 0.78, f);
  wetReflect(cx + 300, gy + 10, 560, 170, 0.08);
  // street lamp (baayein)
  const lx = cx - 560;
  ctx.fillStyle = '#0a0f16'; ctx.fillRect(lx - 8, gy - 720, 16, 720);
  ctx.fillRect(lx - 8, gy - 720, 120, 14);
  lampPool(lx + 118, gy - 700, 260, 0.30, '170,220,255');
  ctx.fillStyle = '#dceefc'; D.circ(ctx, lx + 118, gy - 700, 13); ctx.fill();
  lightCone(lx + 118, gy - 690, gy + 60, 60, 420, 0.05);
}
// Phone: body + screen. mode 'sms' | 'stmt' | 'dark'. Origin center.
function phoneDraw(x, y, w, h, f, o = {}) {
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
  D.softShadow(ctx, 10, h * 0.52, w * 0.5, 26, 0.3);
  ctx.fillStyle = '#0b0e13'; D.rr(ctx, -w / 2, -h / 2, w, h, w * 0.09); ctx.fill();
  ctx.strokeStyle = '#39445c'; ctx.lineWidth = 5; ctx.stroke();
  const sg = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  sg.addColorStop(0, '#0d2231'); sg.addColorStop(1, '#081420');
  ctx.fillStyle = sg; D.rr(ctx, -w / 2 + 16, -h / 2 + 16, w - 32, h - 32, w * 0.06); ctx.fill();
  // notch
  ctx.fillStyle = '#05070a'; D.rr(ctx, -w * 0.13, -h / 2 + 24, w * 0.26, 20, 10); ctx.fill();
  if (o.mode === 'sms') {
    // header
    ctx.fillStyle = 'rgba(57,230,195,0.14)'; ctx.fillRect(-w / 2 + 16, -h / 2 + 58, w - 32, 74);
    text('FASTag', 0, -h / 2 + 96, 36, '#39e6c3');
    // message bubble
    const by = -h / 2 + 190;
    if (o.alert) lampPool(0, by + 190, w * 0.72, 0.30 + 0.18 * Math.sin(f * 0.5), '255,60,40');
    ctx.fillStyle = '#12242f'; D.rr(ctx, -w / 2 + 42, by, w - 84, 400, 20); ctx.fill();
    ctx.strokeStyle = 'rgba(255,90,70,0.65)'; ctx.lineWidth = 4; ctx.stroke();
    text('TOLL KATA!', 0, by + 66, fitPx('TOLL KATA!', 56, w - 140), '#ff6b5e');
    text('₹240', 0, by + 168, 96, '#ffd94d');
    text('NH-48 TOLL PLAZA', 0, by + 262, fitPx('NH-48 TOLL PLAZA', 32, w - 140), 'rgba(215,232,242,0.75)');
    text('RAAT 2:14 AM', 0, by + 330, 28, 'rgba(215,232,242,0.45)');
    // neeche do khaali bubbles (chat ka mahaul)
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; D.rr(ctx, -w / 2 + 42, by + 440, w * 0.55, 74, 16); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.04)'; D.rr(ctx, -w / 2 + 42, by + 540, w * 0.42, 74, 16); ctx.fill();
  } else if (o.mode === 'stmt') {
    ctx.fillStyle = 'rgba(57,230,195,0.14)'; ctx.fillRect(-w / 2 + 16, -h / 2 + 58, w - 32, 74);
    text('FASTag STATEMENT', 0, -h / 2 + 96, fitPx('FASTag STATEMENT', 34, w - 80), '#39e6c3');
    const amts = [60, 85, 120, 45, 240, 60, 95, 75];
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + 16, -h / 2 + 150, w - 32, h - 190); ctx.clip();
    for (let i = 0; i < amts.length; i++) {
      const ry = -h / 2 + 215 + i * 118 - (o.scroll || 0);
      if (ry < -h / 2 + 130 || ry > h / 2 - 40) continue;
      const isRed = o.red === i;
      if (isRed) { ctx.fillStyle = `rgba(229,57,53,${0.20 + 0.10 * Math.sin(f * 0.5)})`; D.rr(ctx, -w / 2 + 36, ry - 46, w - 72, 96, 12); ctx.fill(); }
      else { ctx.fillStyle = 'rgba(255,255,255,0.05)'; D.rr(ctx, -w / 2 + 36, ry - 46, w - 72, 96, 12); ctx.fill(); }
      text(isRed ? 'GALAT KATAUTI' : 'TOLL PLAZA', -w / 2 + 62, ry - 12, 30, isRed ? '#ff6b5e' : 'rgba(215,232,242,0.85)', 'left');
      text('₹' + amts[i], w / 2 - 130, ry - 12, 34, isRed ? '#ff6b5e' : '#ffd94d', 'right');
      if (isRed) {
        ctx.strokeStyle = '#ff6b5e'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(w / 2 - 92, ry - 22); ctx.lineTo(w / 2 - 58, ry + 12); ctx.moveTo(w / 2 - 58, ry - 22); ctx.lineTo(w / 2 - 92, ry + 12); ctx.stroke();
      } else if ((o.ticks || 0) > i) {
        ctx.strokeStyle = '#3ddc74'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(w / 2 - 94, ry - 10); ctx.lineTo(w / 2 - 76, ry + 10); ctx.lineTo(w / 2 - 50, ry - 24); ctx.stroke();
      }
      text('0' + (i + 1) + ' NOV • NH-48', -w / 2 + 62, ry + 26, 22, 'rgba(215,232,242,0.4)', 'left');
    }
    ctx.restore();
  } else {
    // dark screen — halki chamak
    ctx.fillStyle = 'rgba(160,210,255,0.05)'; D.rr(ctx, -w / 2 + 16, -h / 2 + 16, w - 32, h - 32, w * 0.06); ctx.fill();
  }
  ctx.restore();
}
// FASTag sticker: safed patti, hari neeche wali strip, RFID arcs. Origin center.
function stickerDraw(x, y, w, f, o = {}) {
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
  const h = w * 0.42;
  D.softShadow(ctx, 6, h * 0.55, w * 0.5, 16, 0.28);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, '#f4f7f9'); g.addColorStop(1, '#cfd8de');
  ctx.fillStyle = g; D.rr(ctx, -w / 2, -h / 2, w, h, 18); ctx.fill(); ctx.strokeStyle = '#5a6a76'; ctx.lineWidth = 4; ctx.stroke();
  // hari strip neeche
  ctx.fillStyle = '#1d9e57'; ctx.fillRect(-w / 2 + 4, h * 0.22, w - 8, h * 0.26);
  text('FASTag', -w * 0.06, -h * 0.16, fitPx('FASTag', w * 0.21, w * 0.62), '#123c2a');
  text('NETC • RFID', -w * 0.06, h * 0.35, w * 0.075, '#ffffff');
  // chip ka chhota square (bayein)
  ctx.fillStyle = '#d9a52e'; D.rr(ctx, -w * 0.44, -h * 0.30, w * 0.13, h * 0.52, 6); ctx.fill();
  ctx.strokeStyle = '#8a5f10'; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
  // RFID lehren (sticker se bahar nikalti hui)
  if (o.rings) {
    for (let k = 0; k < 3; k++) {
      const rr2 = ((f * 3.4 + k * 95) % 285) + 24;
      ctx.strokeStyle = `rgba(57,230,195,${0.6 * (1 - rr2 / 310)})`; ctx.lineWidth = 6;
      D.circ(ctx, x, y, rr2); ctx.stroke();
    }
    const pl = 0.5 + 0.5 * Math.sin(f * 0.4);
    lampPool(x, y, w * 0.5, 0.14 + 0.12 * pl, '120,255,205');
  }
}
// Toll booth: khidki me garam roshni, chhat, chhota sign. Origin ground center.
function boothDraw(x, gy, s) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  D.softShadow(ctx, 0, 10, 130, 16, 0.32);
  const g = ctx.createLinearGradient(-110, 0, 110, 0);
  g.addColorStop(0, '#3a4656'); g.addColorStop(0.5, '#5a6a7c'); g.addColorStop(1, '#333f4e');
  ctx.fillStyle = g; D.rr(ctx, -110, -430, 220, 430, 12); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  // chhat ki patti
  ctx.fillStyle = '#222b38'; ctx.fillRect(-138, -478, 276, 52);
  ctx.fillStyle = 'rgba(255,205,110,0.5)'; ctx.fillRect(-138, -432, 276, 6);
  // khidki (garam roshni, blinds ki lakeerein — andar koi nahi dikhta)
  lampPool(0, -290, 150, 0.30);
  ctx.fillStyle = '#ffca7a'; D.rr(ctx, -78, -372, 156, 150, 8); ctx.fill();
  ctx.strokeStyle = '#0a0f16'; ctx.lineWidth = 6; ctx.stroke();
  ctx.strokeStyle = 'rgba(90,50,10,0.5)'; ctx.lineWidth = 5;
  for (let by = -348; by <= -252; by += 32) { ctx.beginPath(); ctx.moveTo(-78, by); ctx.lineTo(78, by); ctx.stroke(); }
  // neeche ka band hissa + chhota sign
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-110, -190, 220, 190);
  text('TOLL', 0, -96, 44, '#ffd94d');
  ctx.restore();
}
// Barrier: khamba + ghumti hui laal-safed patti. lift 0 = band, 1 = pura khula. Origin ground (khamba base).
function barrierDraw(x, gy, s, lift) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  // khamba (pivot box)
  ctx.fillStyle = '#2c3644'; D.rr(ctx, -46, -330, 92, 330, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#e53935'; ctx.fillRect(-46, -330, 92, 40);
  ctx.fillStyle = lift > 0.9 ? '#3ddc74' : '#ff3b30'; D.circ(ctx, 0, -356, 15); ctx.fill();
  // patti: pivot (0,-285) se daayein, lift par upar ghumti hai
  const ang = -lift * 1.32, L = 430;
  ctx.save(); ctx.translate(0, -285); ctx.rotate(ang);
  ctx.fillStyle = '#e8edf2'; D.rr(ctx, 0, -21, L, 42, 10); ctx.fill();
  ctx.fillStyle = '#e53935';
  for (let sx = 18; sx < L - 30; sx += 86) ctx.fillRect(sx, -21, 44, 42);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; D.rr(ctx, 0, -21, L, 42, 10); ctx.stroke();
  ctx.fillStyle = '#ffd94d'; D.circ(ctx, L - 16, 0, 9); ctx.fill();
  ctx.restore();
  // pivot gol
  ctx.fillStyle = '#59667d'; D.circ(ctx, 0, -285, 24); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}
// Pura toll plaza (side view): canopy gantry + sign + 3 booth + 3 barrier + lane lights. lifts = [l0,l1,l2]
function tollSet(cx, gy, f, o = {}) {
  const lifts = o.lifts || [0, 0, 0];
  // sadak
  ctx.fillStyle = '#1a212d'; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  ctx.fillStyle = 'rgba(150,205,255,0.09)'; ctx.fillRect(-800, gy, 3760, 10);
  ctx.strokeStyle = 'rgba(255,220,150,0.10)'; ctx.lineWidth = 5;
  for (const fy of [gy + 200, gy + 470, gy + 820]) { ctx.beginPath(); ctx.moveTo(-800, fy); ctx.lineTo(2960, fy); ctx.stroke(); }
  // lane ke nishan (booths ke saamne)
  ctx.strokeStyle = 'rgba(240,246,250,0.28)'; ctx.lineWidth = 7; ctx.setLineDash([54, 44]);
  for (const lx of [cx - 480, cx - 160, cx + 160, cx + 480]) { ctx.beginPath(); ctx.moveTo(lx, gy + 14); ctx.lineTo(lx, gy + 620); ctx.stroke(); }
  ctx.setLineDash([]);
  // peeche ke khambhe (dhundhle)
  ctx.fillStyle = '#131a26';
  ctx.fillRect(cx - 640, gy - 1010, 34, 1010); ctx.fillRect(cx + 606, gy - 1010, 34, 1010);
  // booths + barriers (3 lanes)
  const laneX = [cx - 320, cx, cx + 320];
  laneX.forEach((lx, i) => {
    boothDraw(lx - 118, gy, 0.94);
    barrierDraw(lx + 96, gy, 0.94, lifts[i]);
  });
  // saamne ke khambhe
  for (const sgn of [-1, 1]) {
    const px = cx + sgn * 655;
    const g = ctx.createLinearGradient(px - 26, 0, px + 26, 0);
    g.addColorStop(0, '#141a26'); g.addColorStop(0.5, '#37445a'); g.addColorStop(1, '#0f141d');
    ctx.fillStyle = g; ctx.fillRect(px - 26, gy - 1080, 52, 1080);
    ctx.fillStyle = 'rgba(255,205,110,0.35)'; ctx.fillRect(px - 26, gy - 1080, 5, 1080);
    ctx.fillStyle = '#7a1620'; ctx.fillRect(px - 30, gy - 430, 60, 54);
  }
  // canopy slab + underside lights
  const top = gy - 1230;
  ctx.fillStyle = '#232d3d';
  ctx.beginPath(); ctx.moveTo(cx - 850, top + 52); ctx.lineTo(cx + 850, top + 52); ctx.lineTo(cx + 700, top + 190); ctx.lineTo(cx - 700, top + 190); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,226,160,0.85)';
  for (const lx2 of [-520, 0, 520]) ctx.fillRect(cx + lx2 - 130, top + 122, 260, 13);
  lampPool(cx - 520, top + 205, 260, 0.18); lampPool(cx, top + 205, 300, 0.20); lampPool(cx + 520, top + 205, 260, 0.18);
  // fascia band + naam + bulb kataar
  ctx.fillStyle = '#14532d'; ctx.fillRect(cx - 850, top - 44, 1700, 96);
  ctx.fillStyle = 'rgba(255,255,255,0.13)'; ctx.fillRect(cx - 850, top - 44, 1700, 16);
  ctx.fillStyle = '#ffd94d';
  const nb = 22;
  for (let i = 0; i <= nb; i++) { const bx = cx - 850 + 22 + (1700 - 44) * i / nb; const fl = 0.55 + 0.45 * Math.sin(f * 0.35 + i * 1.3); ctx.globalAlpha = fl; D.circ(ctx, bx, top - 32, 7); ctx.fill(); D.circ(ctx, bx, top + 38, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
  textF('TOLL PLAZA', cx - 190, top + 4, 60, '#ffe9a8', 760);
  // FASTag lane sign (hari patti, daayein)
  ctx.fillStyle = '#0e3d24'; D.rr(ctx, cx + 150, top - 26, 330, 62, 8); ctx.fill(); ctx.strokeStyle = '#3ddc74'; ctx.lineWidth = 3.5; ctx.stroke();
  text('FASTag →', cx + 315, top + 6, 38, '#8ef0b3');
  // lane lights (upar, har lane ke upar): hari = khula, laal = band
  laneX.forEach((lx, i) => {
    const open = lifts[i] > 0.5;
    lampPool(lx, top + 250, 90, 0.35, open ? '80,255,150' : '255,60,40');
    ctx.fillStyle = open ? '#3ddc74' : '#ff3b30'; D.circ(ctx, lx, top + 250, 14); ctx.fill();
  });
  wetReflect(cx, gy + 8, 1000, 280, 0.06);
}
// Sarkari niyam ki kitab ka panna (macro): header, bada niyam, strike progress. Origin center.
function rulePage(x, y, w, h, f, o = {}) {
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
  D.softShadow(ctx, 12, h * 0.54, w * 0.52, 24, 0.35);
  const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  g.addColorStop(0, '#d9c69c'); g.addColorStop(0.6, '#c8ad74'); g.addColorStop(1, '#a98850');
  ctx.fillStyle = g; D.rr(ctx, -w / 2, -h / 2, w, h, 10); ctx.fill();
  ctx.strokeStyle = '#6d5326'; ctx.lineWidth = 5; ctx.stroke();
  // kinare ka purana daag
  ctx.fillStyle = 'rgba(109,83,38,0.18)'; D.ell(ctx, w * 0.32, -h * 0.3, w * 0.22, h * 0.14); ctx.fill();
  // laal margin rekha + neele ruled lines
  ctx.strokeStyle = 'rgba(198,40,40,0.45)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-w / 2 + 64, -h / 2 + 20); ctx.lineTo(-w / 2 + 64, h / 2 - 20); ctx.stroke();
  ctx.strokeStyle = 'rgba(40,70,140,0.22)'; ctx.lineWidth = 2.5;
  for (let ly = -h / 2 + 210; ly < h / 2 - 60; ly += 64) { ctx.beginPath(); ctx.moveTo(-w / 2 + 30, ly); ctx.lineTo(w / 2 - 30, ly); ctx.stroke(); }
  // header
  text('SARKARI NIYAM', 0, -h / 2 + 84, fitPx('SARKARI NIYAM', 52, w - 140), '#5a4020');
  text('SAAL 2021 • TOLL NIYAMAVALI', 0, -h / 2 + 140, fitPx('SAAL 2021 • TOLL NIYAMAVALI', 30, w - 140), 'rgba(90,64,32,0.7)');
  ctx.fillStyle = '#5a4020'; ctx.fillRect(-w / 2 + 60, -h / 2 + 168, w - 120, 4);
  // chhoti likhawat (text lines)
  text('Toll plaza par line 100 metre se', 0, -h * 0.16, fitPx('Toll plaza par line 100 metre se', 36, w - 130), 'rgba(60,44,20,0.85)');
  text('lambi ho jaaye to us lane ki', 0, -h * 0.16 + 56, fitPx('lambi ho jaaye to us lane ki', 36, w - 130), 'rgba(60,44,20,0.85)');
  text('saari gaadiyaan —', 0, -h * 0.16 + 112, fitPx('saari gaadiyaan —', 36, w - 130), 'rgba(60,44,20,0.85)');
  // BADA NIYAM (strike ispar padta hai)
  const fade = 1 - 0.55 * (o.strike || 0);
  ctx.save(); ctx.globalAlpha = fade;
  text('100 METRE LINE', 0, h * 0.10, fitPx('100 METRE LINE', 66, w - 110), '#7a1620');
  text('= BINA TOLL PASS', 0, h * 0.10 + 84, fitPx('= BINA TOLL PASS', 60, w - 110), '#7a1620');
  ctx.restore();
  if (o.strike > 0) {
    ctx.strokeStyle = '#c62828'; ctx.lineWidth = 11; ctx.lineCap = 'round';
    const sw = (w - 130) * o.strike;
    ctx.beginPath(); ctx.moveTo(-(w - 130) / 2, h * 0.10 - 6); ctx.lineTo(-(w - 130) / 2 + sw, h * 0.10 - 16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-(w - 130) / 2, h * 0.10 + 84 - 6); ctx.lineTo(-(w - 130) / 2 + sw, h * 0.10 + 84 - 16); ctx.stroke();
  }
  // neeche mohor jaisi gol nishani
  ctx.strokeStyle = 'rgba(122,22,32,0.55)'; ctx.lineWidth = 4; D.circ(ctx, w * 0.28, h * 0.36, 52); ctx.stroke();
  text('2021', w * 0.28, h * 0.36, 30, 'rgba(122,22,32,0.6)');
  ctx.restore();
}
// Sunehra Annual Pass card (3D-ish flip: sx = scaleX). Origin center.
function passCard(x, y, w, sx, f) {
  ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(0.10, sx), 1);
  const h = w * 0.62;
  lampPool(0, 0, w * 0.85, 0.30);
  D.softShadow(ctx, 10, h * 0.56, w * 0.5, 22, 0.3);
  const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  g.addColorStop(0, '#f6d67c'); g.addColorStop(0.45, '#e8b64c'); g.addColorStop(1, '#b9822e');
  ctx.fillStyle = g; D.rr(ctx, -w / 2, -h / 2, w, h, 22); ctx.fill(); ctx.strokeStyle = '#8a5f10'; ctx.lineWidth = 6; ctx.stroke();
  // upar ki kaali patti
  ctx.fillStyle = '#1c2733'; ctx.fillRect(-w / 2 + 6, -h / 2 + 6, w - 12, h * 0.24);
  text('FASTag', -w / 2 + 34, -h / 2 + h * 0.13, 40, '#ffd94d', 'left');
  text('NHAI', w / 2 - 34, -h / 2 + h * 0.13, 32, 'rgba(240,246,250,0.8)', 'right');
  // chip
  ctx.fillStyle = '#8a5f10'; D.rr(ctx, -w / 2 + 44, -h * 0.08, 92, 70, 8); ctx.fill();
  ctx.strokeStyle = '#5f4108'; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-w / 2 + 44, -h * 0.08 + 35); ctx.lineTo(-w / 2 + 136, -h * 0.08 + 35); ctx.stroke();
  // bada text
  text('ANNUAL PASS', 30, h * 0.10, fitPx('ANNUAL PASS', 64, w - 210), '#4a3208');
  text('200 TOLL • EK SAAL', 30, h * 0.10 + 62, 30, 'rgba(74,50,8,0.75)');
  // chamak ki leher (card par beh ti hui)
  const sweep = ((f * 9) % (w * 1.9)) - w * 0.95;
  ctx.save(); ctx.beginPath(); D.rr(ctx, -w / 2, -h / 2, w, h, 22); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.20)';
  D.poly(ctx, [[sweep - 40, -h / 2], [sweep + 60, -h / 2], [sweep - 20, h / 2], [sweep - 120, h / 2]]); ctx.fill();
  ctx.restore();
  ctx.restore();
}
// Bharat ka naksha — EK simplified India outline (rough polygon) + toll dots uske andar hi
const INDIA_POLY = [[950, 630], [1080, 625], [1200, 660], [1300, 730], [1360, 830], [1440, 900], [1620, 960], [1610, 1080], [1470, 1120], [1430, 1230], [1380, 1420], [1300, 1680], [1210, 1980], [1090, 2540], [1010, 2050], [950, 1750], [900, 1520], [830, 1380], [640, 1300], [565, 1150], [640, 980], [740, 800], [850, 680]];
function inIndia(px, py) { // ray-casting point-in-polygon
  let inside = false;
  for (let i = 0, j = INDIA_POLY.length - 1; i < INDIA_POLY.length; j = i++) {
    const xi = INDIA_POLY[i][0], yi = INDIA_POLY[i][1], xj = INDIA_POLY[j][0], yj = INDIA_POLY[j][1];
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const TOLL_DOTS = (() => {
  const pts = [];
  for (let i = 0; i < 900 && pts.length < 110; i++) {
    // candidate ko centroid ki taraf 4% kheench kar test — dots outline ke andar hi rahein
    const px = 1080 + (560 + hash(i * 3.13) * 1040 - 1080) * 0.96, py = 1520 + (620 + hash(i * 5.71) * 1900 - 1520) * 0.96;
    if (inIndia(px, py)) pts.push([px, py]);
  }
  return pts;
})();
function indiaMap(f, waveR) {
  ctx.fillStyle = '#132433';
  ctx.beginPath();
  INDIA_POLY.forEach(([px, py], i) => { if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); });
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(120,190,220,0.35)'; ctx.lineWidth = 5; ctx.stroke();
  // highway rekhaayein
  ctx.strokeStyle = 'rgba(230,200,130,0.28)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(880, 800); ctx.bezierCurveTo(1000, 1200, 1040, 1500, 1075, 1900); ctx.bezierCurveTo(1090, 2100, 1100, 2260, 1100, 2400); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(870, 1270); ctx.bezierCurveTo(980, 1200, 1200, 1190, 1360, 1140); ctx.stroke();
  ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(230,200,130,0.16)';
  ctx.beginPath(); ctx.moveTo(960, 1620); ctx.bezierCurveTo(1030, 1540, 1150, 1560, 1250, 1470); ctx.stroke();
  // origin (Delhi taraf, upar-beech)
  lampPool(1080, 1180, 120, 0.5);
  ctx.fillStyle = '#ffd94d'; D.circ(ctx, 1080, 1180, 16); ctx.fill();
  ctx.strokeStyle = '#8a5f10'; ctx.lineWidth = 4; ctx.stroke();
  for (let k = 0; k < 3; k++) {
    const rr3 = waveR - k * 280;
    if (rr3 > 20) { ctx.strokeStyle = `rgba(255,180,90,${0.5 - k * 0.13})`; ctx.lineWidth = 7; D.circ(ctx, 1080, 1180, rr3); ctx.stroke(); }
  }
  let lit = 0;
  for (const [px, py] of TOLL_DOTS) {
    const d = Math.hypot(px - 1080, py - 1180);
    const on = d < waveR;
    if (on) lit++;
    const near = on && Math.abs(d - waveR) < 120;
    ctx.fillStyle = on ? (near ? '#ffe9a8' : '#ffb84d') : 'rgba(150,170,190,0.35)';
    D.circ(ctx, px, py, on ? 10 : 6); ctx.fill();
    if (near) lampPool(px, py, 42, 0.5);
  }
  return lit;
}
// Awaara ghadi (tez ghumti hui) — origin center
function clockDraw(x, y, r, f) {
  ctx.save(); ctx.translate(x, y);
  lampPool(0, 0, r * 1.8, 0.25);
  ctx.fillStyle = '#f2ead6'; D.circ(ctx, 0, 0, r); ctx.fill();
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 10; ctx.stroke();
  ctx.strokeStyle = '#8a5f10'; ctx.lineWidth = 3.5; D.circ(ctx, 0, 0, r * 0.86); ctx.stroke();
  ctx.fillStyle = '#4a3a14';
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; D.circ(ctx, Math.cos(a) * r * 0.74, Math.sin(a) * r * 0.74, i % 3 ? 4 : 7); ctx.fill(); }
  const hand = (a, len, wdt, col) => { ctx.strokeStyle = col; ctx.lineWidth = wdt; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len); ctx.stroke(); };
  hand(-Math.PI / 2 + f * 0.045, r * 0.45, 13, '#26303c'); // ghanta (tez)
  hand(-Math.PI / 2 + f * 0.22, r * 0.66, 9, '#26303c');  // minute (aur tez)
  hand(-Math.PI / 2 + f * 0.9, r * 0.78, 5, '#e53935');   // second (sabse tez)
  ctx.fillStyle = '#26303c'; D.circ(ctx, 0, 0, 11); ctx.fill();
  ctx.restore();
}
// Bada aaina (magnifier): sunehra ghaira + handle
function magnifier(x, y, r, rot = 0.7) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(170,225,255,0.10)'; D.circ(ctx, 0, 0, r); ctx.fill();
  ctx.strokeStyle = '#e8b64c'; ctx.lineWidth = 13; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 4; D.circ(ctx, 0, 0, r - 12); ctx.stroke();
  ctx.save(); ctx.rotate(rot);
  ctx.fillStyle = '#8a5f10'; D.rr(ctx, -13, r - 6, 26, r * 0.85, 12); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
  // kaanch ki chamak
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, r * 0.62, Math.PI * 1.15, Math.PI * 1.5); ctx.stroke();
  ctx.restore();
}
// Suraksha kawach (shield) — statement = hathiyaar ke liye
function shieldDraw(x, y, s, f) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  lampPool(0, 0, 150, 0.3, '120,255,205');
  ctx.beginPath();
  ctx.moveTo(0, -95);
  ctx.quadraticCurveTo(52, -78, 74, -72);
  ctx.quadraticCurveTo(74, 6, 40, 52);
  ctx.quadraticCurveTo(18, 82, 0, 96);
  ctx.quadraticCurveTo(-18, 82, -40, 52);
  ctx.quadraticCurveTo(-74, 6, -74, -72);
  ctx.quadraticCurveTo(-52, -78, 0, -95);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, -95, 0, 96);
  g.addColorStop(0, '#14532d'); g.addColorStop(1, '#0b3520');
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = '#3ddc74'; ctx.lineWidth = 6; ctx.stroke();
  ctx.strokeStyle = '#eafff2'; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-34, 2); ctx.lineTo(-10, 30); ctx.lineTo(38, -26); ctx.stroke();
  ctx.restore();
}


/* =====================================================================
   TIMING — EP-6 FASTag (voice_final 49.78s, TOTAL 1493 @30fps)
   S1 0 | S2 101 | S3 184 | S4 269 | S5 357 | S6 476 | S7 584 | S8 648
   S9 773 | S10 869 | S11 951 | S12 1079 | S13 1187 | S14 1301 | S15 1398 | END 1493
   Har sentence: 1-3 sub-shots, har sub-shot ALAG extreme angle + camera move.
   ===================================================================== */

// ===== F1a (0–45) S1a — RAAT WIDE: andheri gali, ghar, driveway par khadi car, ek khidki roshan; slow push-in =====
shot(0, 45, 0.3, { cx: 1080, cy: 1500, s: 0.55 }, { cx: 1080, cy: 1560, s: 0.68 }, (f, u) => {
  layer(0.4, () => nightSky(GY, f));
  layer(1, () => {
    houseSet(1080, GY, f);
    // gali par behti halki dhool/chamak
    dust(f, 1080, 2100, 900, 8, 0.12);
  });
}, []);
// ===== F1b (45–80) S1b — PUSH-THROUGH: camera khidki ke andar ghusta hai, table par rakha phone jagta hai =====
shot(45, 80, 0.34, { cx: 960, cy: 1850, s: 0.95 }, { cx: 940, cy: 1930, s: 1.62 }, (f, u) => {
  const lf = f - 45;
  layer(0.6, () => vgrad(-600, 3840, [[0, '#0a1a24'], [1, '#12242e']]));
  layer(1, () => {
    // kamre ki deewaar + ek photo frame + board
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; D.rr(ctx, 1180, 1420, 260, 200, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(200,220,235,0.2)'; ctx.lineWidth = 4; ctx.stroke();
    // table (neeche ki satah)
    const tg = ctx.createLinearGradient(0, 2180, 0, 3840);
    tg.addColorStop(0, '#2c1e12'); tg.addColorStop(1, '#170f08');
    ctx.fillStyle = tg; ctx.fillRect(-800, 2180, 3760, 1660);
    ctx.fillStyle = 'rgba(255,205,110,0.12)'; ctx.fillRect(-800, 2180, 3760, 8);
    // phone table par — lf 16 par screen jagti hai
    const lit = lf >= 16;
    if (lit) lampPool(950, 2300, 340, 0.34 + 0.1 * Math.sin(f * 0.5), '255,90,70');
    phoneDraw(950, 2300, 300, 560, f, { rot: -0.18, mode: lit ? 'sms' : 'dark', alert: lit });
    // khidki ka frame — camera iske beech se ghusta hai (bars kinare se bahar nikal jaate hain)
    ctx.fillStyle = '#060a10';
    ctx.fillRect(425, 450, 90, 2700); ctx.fillRect(1385, 450, 90, 2700);
    ctx.fillRect(425, 450, 1050, 90); ctx.fillRect(425, 3060, 1050, 90);
    ctx.fillRect(905, 450, 90, 2700); // beech ki salai
    ctx.strokeStyle = 'rgba(190,225,255,0.22)'; ctx.lineWidth = 4;
    ctx.strokeRect(425, 450, 1050, 2700);
    dust(f, 950, 2000, 500, 6, 0.15);
  });
}, []);
// ===== F1c (80–101) S1c — PHONE MACRO: SMS "TOLL KATA!" laal chamak ke saath; hit 85 =====
shot(80, 101, 0.36, { cx: 1080, cy: 1500, s: 1.3 }, { cx: 1080, cy: 1500, s: 1.5 }, (f, u) => {
  const lf = f - 80;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#04101c'], [1, '#0a1a14']]));
  layer(1, () => {
    lampPool(1080, 1400, 800, 0.16, '255,80,60');
    phoneDraw(1080, 1400, 560, 1130, f, { mode: 'sms', alert: true });
    if (lf >= 5) D.drawSparkle(ctx, 830, 1010, 26, 0.8);
    if (lf > 6) { const p = spring((lf - 6) / 7); ctx.save(); ctx.translate(1080, 2065); ctx.scale(p, p); ctx.translate(-1080, -2065); plate(1080, 2065, 560, 100, 'GAADI GHAR PAR THI!', 44, '#ff6b5e'); ctx.restore(); }
    dust(f, 1080, 1400, 500, 6, 0.15);
  });
}, [85]);
// ===== F2a (101–142) S2a — WINDSHIELD MACRO: FASTag sticker sheeshe par chipakta hai; orbit drift; hit 118 =====
shot(101, 142, 0.3, { cx: 1080, cy: 1480, s: 1.05, rot: 0 }, { cx: 1055, cy: 1455, s: 1.2, rot: 0.03 }, (f, u) => {
  const lf = f - 101;
  layer(0.45, () => vgrad(-600, 3840, [[0, '#0a2e3f'], [0.55, '#155263'], [1, '#8a5a20']]));
  layer(1, () => {
    // sheeshe ki chamak (tedhi safed pattiyaan)
    ctx.fillStyle = 'rgba(255,255,255,0.055)';
    D.poly(ctx, [[300, -400], [760, -400], [200, 2400], [-360, 2400]]); ctx.fill();
    D.poly(ctx, [[1500, -400], [1760, -400], [1200, 2400], [940, 2400]]); ctx.fill();
    // door toll gantry ka dhundhla aks (sheeshe me reflection)
    ctx.save(); ctx.globalAlpha = 0.16;
    ctx.fillStyle = '#dceefc'; ctx.fillRect(1180, 760, 560, 34); ctx.fillRect(1210, 760, 26, 190); ctx.fillRect(1688, 760, 26, 190);
    ctx.restore();
    // rear-view mirror (upar beech me silhouette)
    ctx.fillStyle = '#0a0f16'; D.rr(ctx, 880, 620, 400, 130, 26); ctx.fill();
    ctx.strokeStyle = 'rgba(200,225,255,0.3)'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillRect(1064, 560, 32, 66);
    // dashboard (neeche)
    ctx.fillStyle = '#0d1420';
    ctx.beginPath(); ctx.moveTo(-800, 3840); ctx.lineTo(-800, 2620); ctx.quadraticCurveTo(1080, 2380, 2960, 2620); ctx.lineTo(2960, 3840); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(160,200,235,0.18)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-800, 2620); ctx.quadraticCurveTo(1080, 2380, 2960, 2620); ctx.stroke();
    // sticker chipakta hai (spring scale-in)
    const sc = spring((lf - 8) / 9);
    if (sc > 0.02) {
      ctx.save(); ctx.translate(1080, 1420); ctx.scale(sc, sc); ctx.translate(-1080, -1420);
      stickerDraw(1080, 1420, 640, f, {});
      ctx.restore();
    }
    if (lf >= 17) { D.drawSparkle(ctx, 800, 1300, 30, 0.9); D.drawSparkle(ctx, 1365, 1330, 24, 0.7); }
    if (lf > 24) { const p = spring((lf - 24) / 8); ctx.save(); ctx.translate(1080, 2080); ctx.scale(p, p); ctx.translate(-1080, -2080); plate(1080, 2080, 640, 100, 'SHEESHE PAR CHIPKA STICKER', 42); ctx.restore(); }
    dust(f, 1080, 1500, 700, 8, 0.15);
  });
}, [118]);
// ===== F2b (142–184) S2b — RFID LEHREN: sticker se signal ki gol lehren, sheeshe par scan-beam =====
shot(142, 184, 0.3, { cx: 1055, cy: 1455, s: 1.2, rot: 0.03 }, { cx: 1105, cy: 1435, s: 1.34, rot: 0 }, (f, u) => {
  const lf = f - 142;
  layer(0.45, () => vgrad(-600, 3840, [[0, '#0a2e3f'], [0.55, '#155263'], [1, '#8a5a20']]));
  layer(1, () => {
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    D.poly(ctx, [[300, -400], [760, -400], [200, 2400], [-360, 2400]]); ctx.fill();
    // scan beam (bayein se daayein behti roshni ki patti)
    const bx = 420 + ((lf * 16) % 1320);
    const bg2 = ctx.createLinearGradient(bx - 130, 0, bx + 130, 0);
    bg2.addColorStop(0, 'rgba(120,255,205,0)'); bg2.addColorStop(0.5, 'rgba(120,255,205,0.13)'); bg2.addColorStop(1, 'rgba(120,255,205,0)');
    ctx.fillStyle = bg2; ctx.fillRect(bx - 130, 500, 260, 2100);
    // gantry reflection — lehar pahunchne par chamakta hai
    ctx.save(); ctx.globalAlpha = 0.16 + 0.14 * (0.5 + 0.5 * Math.sin(f * 0.4));
    ctx.fillStyle = '#dceefc'; ctx.fillRect(1180, 760, 560, 34); ctx.fillRect(1210, 760, 26, 190); ctx.fillRect(1688, 760, 26, 190);
    ctx.restore();
    ctx.fillStyle = '#0d1420';
    ctx.beginPath(); ctx.moveTo(-800, 3840); ctx.lineTo(-800, 2620); ctx.quadraticCurveTo(1080, 2380, 2960, 2620); ctx.lineTo(2960, 3840); ctx.closePath(); ctx.fill();
    stickerDraw(1080, 1420, 640, f, { rings: true });
    if (lf > 10) plate(1080, 2080, 460, 92, 'RFID SIGNAL', 40, '#39e6c3');
    dust(f, 1080, 1500, 700, 8, 0.15);
  });
}, []);
// ===== F3a (184–228) S3a — DRIVER POV: highway par toll ki taraf tez push-in, dashboard + steering neeche =====
shot(184, 228, 0.28, { cx: 1080, cy: 1500, s: 0.62 }, { cx: 1080, cy: 1520, s: 0.98 }, (f, u) => {
  layer(0.45, () => vgrad(-600, 2200, [[0, '#0b2a44'], [0.55, '#1d5a74'], [1, '#c98a3a']]));
  layer(1, () => {
    lampPool(1620, 1330, 420, 0.22); // subah ka suraj daayein
    // sadak ke aas-paas ki zameen (horizon ke neeche)
    ctx.fillStyle = '#141a20'; ctx.fillRect(-800, 1560, 3760, 2280);
    // sadak (perspective: horizon 1560, neeche chaudi)
    ctx.fillStyle = '#1c232e';
    D.poly(ctx, [[300, 3840], [1860, 3840], [1235, 1560], [925, 1560]]); ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,150,0.5)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(925, 1560); ctx.lineTo(300, 3840); ctx.moveTo(1235, 1560); ctx.lineTo(1860, 3840); ctx.stroke();
    // beech ke dashes (viewer ki taraf aate hue)
    ctx.fillStyle = 'rgba(245,240,220,0.75)';
    for (let i = 0; i < 6; i++) {
      const dy = 1560 + ((i * 400 + f * 24) % 820);
      const t = (dy - 1560) / 820;
      ctx.fillRect(1080 - 5 - t * 9, dy, 10 + t * 18, 26 + t * 60);
    }
    // side rails
    ctx.strokeStyle = 'rgba(180,200,220,0.35)'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(880, 1560); ctx.lineTo(120, 2600); ctx.moveTo(1280, 1560); ctx.lineTo(2040, 2600); ctx.stroke();
    // door ka toll gantry (camera ke saath badhta hai)
    ctx.fillStyle = '#131c2a'; ctx.fillRect(838, 1292, 484, 42); ctx.fillRect(862, 1334, 24, 226); ctx.fillRect(1274, 1334, 24, 226);
    ctx.fillStyle = '#0e3d24'; D.rr(ctx, 948, 1230, 264, 56, 8); ctx.fill(); ctx.strokeStyle = '#3ddc74'; ctx.lineWidth = 3; ctx.stroke();
    text('TOLL', 1080, 1259, 36, '#8ef0b3');
    const gl = 0.5 + 0.5 * Math.sin(f * 0.3);
    lampPool(1080, 1400, 60 + gl * 30, 0.4, '80,255,150');
    ctx.fillStyle = '#3ddc74'; D.circ(ctx, 1080, 1400, 11); ctx.fill();
    // sheeshe par chhota FASTag sticker (POV detail, upar beech)
    ctx.save(); ctx.globalAlpha = 0.92; stickerDraw(1080, 1050, 210, f, {}); ctx.restore();
    // dashboard + steering (neeche silhouette)
    ctx.fillStyle = '#070b12';
    ctx.beginPath(); ctx.moveTo(-800, 3840); ctx.lineTo(-800, 2560); ctx.quadraticCurveTo(1080, 2330, 2960, 2560); ctx.lineTo(2960, 3840); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(160,200,235,0.22)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-800, 2560); ctx.quadraticCurveTo(1080, 2330, 2960, 2560); ctx.stroke();
    ctx.strokeStyle = '#070b12'; ctx.lineWidth = 46;
    D.circ(ctx, 735, 2720, 185); ctx.stroke();
    ctx.strokeStyle = 'rgba(160,200,235,0.20)'; ctx.lineWidth = 5;
    D.circ(ctx, 735, 2720, 208); ctx.stroke();
    // speed streaks kinare par
    ctx.strokeStyle = 'rgba(225,240,255,0.20)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const sy = 700 + hash(i * 8.1) * 1500, sx = (i % 2 ? 1730 : 430) + Math.sin(i * 7) * 60;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + (i % 2 ? 150 : -150), sy + 26); ctx.stroke();
    }
  });
}, []);
// ===== F3b (228–269) S3b — SIDE TRACKING: car bina ruke nikalti hai, barrier uthta hai, sikke booth ki taraf; hit 232 =====
shot(228, 269, 0.28, { cx: 900, cy: 1650, s: 0.7 }, { cx: 1270, cy: 1650, s: 0.72 }, (f, u) => {
  const lf = f - 228;
  layer(0.45, () => vgrad(-600, 2600, [[0, '#0b2a44'], [0.55, '#1d5a74'], [1, '#c98a3a']]));
  layer(0.7, () => { // door ki hariyali/pahaad patti
    ctx.fillStyle = '#0d2018';
    ctx.beginPath(); ctx.moveTo(-800, GY);
    for (let x = -800; x <= 2960; x += 240) ctx.lineTo(x, GY - 130 - hash(x * 0.61) * 120);
    ctx.lineTo(2960, GY); ctx.closePath(); ctx.fill();
  });
  layer(1, () => {
    const liftC = sstep((lf - 8) / 14);
    tollSet(1080, GY, f, { lifts: [0, liftC, 0] });
    // hari batti ki chamak (hit ke aas-paas)
    if (lf >= 4 && lf < 14) lampPool(1080, 1420, 300, 0.5 * (1 - (lf - 4) / 10), '80,255,150');
    // car bina ruke guzarti hai
    const carX = D.lerp(430, 1760, sstep(lf / 46));
    carSide(carX, GY, 0.85, f);
    // sikke: car se booth ki khidki tak (guzarne ke pal)
    if (lf > 18 && lf < 42) {
      for (let k = 0; k < 4; k++) {
        const p = ((lf - 18 + k * 3) % 13) / 13;
        const sx = D.lerp(carX - 60, 962, p), sy = D.lerp(GY - 580, GY - 290, p) - Math.sin(p * Math.PI) * 130;
        coinDraw(sx, sy, 24);
        lampPool(sx, sy, 52, 0.35);
      }
    }
    if (lf > 26) { const p = spring((lf - 26) / 8); ctx.save(); ctx.translate(1080, 980); ctx.scale(p, p); ctx.translate(-1080, -980); plate(1080, 980, 660, 104, 'BINA RUKE — PAISA KATA', 44, '#8ef0b3'); ctx.restore(); }
    dust(f, 1080, 1900, 800, 8, 0.12);
  });
}, [232]);
// ===== F4a (269–310) S4a — DUTCH TILT: door ka gantry ghar ko scan karta hai, laal lehren aakash me =====
shot(269, 310, 0.36, { cx: 1080, cy: 1500, s: 0.6, rot: 0.07 }, { cx: 1080, cy: 1530, s: 0.72, rot: 0.105 }, (f, u) => {
  layer(0.4, () => nightSky(GY, f));
  layer(1, () => {
    houseSet(1000, GY, f);
    // door ka toll gantry (silhouette, daayein horizon par)
    ctx.fillStyle = '#050b12';
    ctx.fillRect(1560, GY - 640, 420, 40); ctx.fillRect(1590, GY - 640, 30, 640); ctx.fillRect(1920, GY - 640, 30, 640);
    ctx.fillRect(1560, GY - 300, 420, 300);
    const bl = 0.5 + 0.5 * Math.sin(f * 0.45);
    lampPool(1770, GY - 668, 120, 0.35 + 0.3 * bl, '255,60,40');
    ctx.fillStyle = '#ff3b30'; D.circ(ctx, 1770, GY - 668, 13); ctx.fill();
    // scan lehren: gantry se ghar ki taraf phailti gol arcs
    for (let k = 0; k < 3; k++) {
      const rr2 = ((f * 7 + k * 380) % 1140) + 60;
      ctx.strokeStyle = `rgba(255,80,60,${0.5 * (1 - rr2 / 1200)})`; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(1770, GY - 640, rr2, Math.PI * 0.92, Math.PI * 1.42); ctx.stroke();
      if (rr2 > 760) lampPool(825, GY - 470, 200, 0.10, '255,60,40'); // lehar khidki tak pahunchi
    }
    // ghoomti scan beam (halki teh)
    const ba = Math.PI * (1.02 + 0.16 * Math.sin(f * 0.03));
    ctx.fillStyle = 'rgba(255,80,60,0.05)';
    ctx.beginPath(); ctx.moveTo(1770, GY - 640);
    ctx.lineTo(1770 + Math.cos(ba - 0.05) * 1250, GY - 640 + Math.sin(ba - 0.05) * 1250);
    ctx.lineTo(1770 + Math.cos(ba + 0.05) * 1250, GY - 640 + Math.sin(ba + 0.05) * 1250);
    ctx.closePath(); ctx.fill();
    dust(f, 1080, 2000, 900, 8, 0.12);
  });
}, []);
// ===== F4b (310–357) S4b — DUTCH TILT: bhoot-sikke khidki se nikal kar door ke gantry tak udte hain =====
shot(310, 357, 0.38, { cx: 1080, cy: 1520, s: 0.72, rot: 0.105 }, { cx: 1090, cy: 1560, s: 0.94, rot: 0.05 }, (f, u) => {
  const lf = f - 310;
  layer(0.4, () => nightSky(GY, f));
  layer(1, () => {
    houseSet(1000, GY, f);
    ctx.fillStyle = '#050b12';
    ctx.fillRect(1560, GY - 640, 420, 40); ctx.fillRect(1590, GY - 640, 30, 640); ctx.fillRect(1920, GY - 640, 30, 640);
    ctx.fillRect(1560, GY - 300, 420, 300);
    const bl = 0.5 + 0.5 * Math.sin(f * 0.45);
    lampPool(1770, GY - 668, 130, 0.4 + 0.3 * bl, '255,60,40');
    ctx.fillStyle = '#ff3b30'; D.circ(ctx, 1770, GY - 668, 13); ctx.fill();
    // khidki ki roshni ka flicker (jaise andar kuch gadbad ho)
    if (hash(Math.floor(f / 3) * 1.7) > 0.82) darkPool(825, GY - 470, 190, 0.4);
    // bhoot-sikke: khidki (825,1930) se gantry (1740,1780) tak bezier par kataar
    const bez = (p) => {
      const q = 1 - p;
      return [q * q * 825 + 2 * q * p * 1300 + p * p * 1740, q * q * 1930 + 2 * q * p * 1280 + p * p * 1780];
    };
    for (let k = 0; k < 7; k++) {
      const p = ((lf * 0.9 + k * 9) % 63) / 63;
      const [cxp, cyp] = bez(p);
      for (let tr = 2; tr >= 0; tr--) {
        const pp = Math.max(0, p - tr * 0.035);
        const [tx, ty] = bez(pp);
        ctx.save(); ctx.globalAlpha = tr === 0 ? 0.85 : 0.22 - tr * 0.07;
        if (tr === 0) lampPool(tx, ty, 56, 0.3, '140,220,255');
        coinDraw(tx, ty, 27 - tr * 5);
        ctx.restore();
      }
    }
    if (lf > 14) { const p = spring((lf - 14) / 9); darkBoard(1080, 1000, 700, 150, [['BINA TOLL GAYE BHI!', 56, '#ff6b5e']], p); }
    dust(f, 1080, 2000, 800, 8, 0.12);
  });
}, []);
// ===== F5a (357–415) S5a — TOP-DOWN DESK: refund files ek-ek karke girti hain =====
shot(357, 415, 0.3, { cx: 1080, cy: 1500, s: 1.0 }, { cx: 1080, cy: 1500, s: 0.86 }, (f, u) => {
  const lf = f - 357;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#17100a'], [1, '#100a06']]));
  layer(1, () => {
    // desk ki satah
    const dg = ctx.createLinearGradient(430, 560, 1730, 2440);
    dg.addColorStop(0, '#2e2013'); dg.addColorStop(1, '#1d130a');
    ctx.fillStyle = dg; D.rr(ctx, 430, 560, 1300, 1880, 26); ctx.fill();
    ctx.strokeStyle = '#4a3520'; ctx.lineWidth = 6; ctx.stroke();
    lampPool(620, 760, 480, 0.20); // desk lamp ki roshni upar-bayein
    // coffee cup (upar-daayein) + pen + calculator
    ctx.fillStyle = '#e8e2d4'; D.circ(ctx, 1470, 810, 74); ctx.fill();
    ctx.fillStyle = '#4a2c14'; D.circ(ctx, 1470, 810, 56); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; D.circ(ctx, 1452, 792, 16); ctx.fill();
    ctx.save(); ctx.translate(1520, 1180); ctx.rotate(0.5); ctx.fillStyle = '#2456a8'; D.rr(ctx, -14, -120, 28, 240, 12); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#141a22'; D.rr(ctx, 1330, 1980, 220, 300, 12); ctx.fill();
    ctx.fillStyle = '#39e6c3'; ctx.fillRect(1352, 2004, 176, 62);
    // pehle se rakhe kagaz (neeche-bayein)
    ctx.save(); ctx.translate(660, 2080); ctx.rotate(-0.06);
    ctx.fillStyle = '#ddd3ba'; D.rr(ctx, -150, -200, 300, 400, 6); ctx.fill();
    ctx.fillStyle = 'rgba(60,50,30,0.5)';
    for (let ly = -140; ly < 160; ly += 42) ctx.fillRect(-118, ly, 236, 9);
    ctx.restore();
    // girti hui files (ek-ek karke)
    const targets = [[770, 1010, -0.05], [1190, 950, 0.04], [830, 1470, 0.03], [1260, 1420, -0.04], [1040, 1180, 0.0]];
    targets.forEach(([tx, ty, rt], i) => {
      const start = 4 + i * 10;
      if (lf < start) return;
      const p = spring((lf - start) / 10);
      const fy = D.lerp(ty - 1500, ty, p);
      // saaya (zameen par, file ke aane se pehle badhta hai)
      ctx.fillStyle = `rgba(0,0,0,${0.32 * p})`; D.ell(ctx, tx, ty + 16, 215 * p + 30, 40 * p + 8); ctx.fill();
      ctx.save(); ctx.translate(tx, fy); ctx.rotate(rt);
      ctx.fillStyle = i % 2 ? '#8a5a2a' : '#75501f'; D.rr(ctx, -200, -270, 400, 540, 12); ctx.fill();
      ctx.strokeStyle = '#4a3208'; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = i % 2 ? '#9c6a33' : '#86602a'; ctx.fillRect(-200, -270, 150, 44); // tab
      ctx.fillStyle = '#e8e2d4'; D.rr(ctx, -130, -120, 260, 110, 8); ctx.fill();
      text(i === 4 ? 'REFUND' : 'SHIKAYAT', 0, -66, 34, i === 4 ? '#c62828' : '#5a4a30');
      ctx.fillStyle = 'rgba(60,44,20,0.45)';
      for (let ly = 40; ly < 200; ly += 44) ctx.fillRect(-150, ly, 300, 9);
      ctx.restore();
      if (i === 4 && lf > start + 11) stampDraw(tx + 60, ty + 120, 250, 105, [['REFUND', 40]], '#e53935', -0.16, spring((lf - start - 11) / 6));
    });
    dust(f, 1080, 1500, 800, 8, 0.10);
  });
}, []);
// ===== F5b (415–476) S5b — BADA COUNTER: 12,55,000 tak ginti + REFUND mohor slam; hit 452 =====
shot(415, 476, 0.34, { cx: 1080, cy: 1500, s: 0.95 }, { cx: 1080, cy: 1500, s: 1.14 }, (f, u) => {
  const lf = f - 415;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#120c07'], [1, '#0a0705']]));
  layer(1, () => {
    const n = D.lerp(0, 1255000, sstep(lf / 34));
    darkBoard(1080, 1380, 920, 400, [
      ['GALAT KATAUTI — REFUND', 46, '#f5edd8'],
      [inr(n), 118, '#ffc72c'],
      ['CASES • SAAL 2024', 40, '#ff8a5c'],
    ], 1);
    // neeche sikkon ke dher (refund ka paisa)
    coinStack(740, 1980, 4, 32); coinStack(1430, 1980, 3, 32);
    ctx.fillStyle = '#241a10'; ctx.fillRect(560, 1986, 240, 14); ctx.fillRect(1250, 1986, 240, 14);
    // mohor slam (hit ke saath)
    if (lf >= 37) {
      const p = spring((lf - 37) / 6);
      stampDraw(1300, 1735, 430, 170, [['REFUND', 62]], '#e53935', -0.14, p);
      D.drawSparkle(ctx, 1120, 1210, 30, 0.85); D.drawSparkle(ctx, 1470, 1400, 24, 0.7);
    }
    dust(f, 1080, 1500, 700, 8, 0.12);
  });
}, [452]);
// ===== F6a (476–530) S6a — HAATH ME PHONE: statement scroll hota hai, hari tick lagti jaati hai =====
shot(476, 530, 0.32, { cx: 1080, cy: 1520, s: 1.02 }, { cx: 1080, cy: 1500, s: 1.18 }, (f, u) => {
  const lf = f - 476;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#07131c'], [1, '#0a1a14']]));
  layer(1, () => {
    lampPool(1080, 1420, 700, 0.14, '120,255,205');
    palmSil(1080, 2160, 1.3);
    phoneDraw(1080, 1420, 570, 1170, f, { mode: 'stmt', scroll: lf * 2.2, ticks: Math.floor(lf / 9), red: -1 });
    if (lf > 36) { const p = spring((lf - 36) / 8); ctx.save(); ctx.translate(1080, 2235); ctx.scale(p, p); ctx.translate(-1080, -2235); plate(1080, 2235, 640, 96, 'STATEMENT CHECK KARO', 44, '#8ef0b3'); ctx.restore(); }
    dust(f, 1080, 1500, 600, 8, 0.12);
  });
}, []);
// ===== F6b (530–584) S6b — LAAL ENTRY + MAGNIFIER ZOOM + kawach board; hit 545 =====
shot(530, 584, 0.34, { cx: 1080, cy: 1500, s: 1.18 }, { cx: 1080, cy: 1470, s: 1.4 }, (f, u) => {
  const lf = f - 530;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#07131c'], [1, '#0a1a14']]));
  layer(1, () => {
    palmSil(1080, 2160, 1.3);
    phoneDraw(1080, 1420, 570, 1170, f, { mode: 'stmt', scroll: 118, ticks: 4, red: lf >= 6 ? 4 : -1 });
    // laal entry ki chamak (hit ke aas-paas)
    if (lf >= 15 && lf < 26) lampPool(1150, 1404, 300, 0.4 * (1 - (lf - 15) / 11), '255,60,40');
    // magnifier laal entry par utarta hai
    if (lf > 10) {
      const p = sstep((lf - 10) / 14);
      const mx = D.lerp(880, 1150, p), my = D.lerp(1120, 1404, p);
      magnifier(mx, my, 120 + 40 * p, 0.7);
    }
    // kawach + board
    if (lf > 32) {
      const p = spring((lf - 32) / 9);
      shieldDraw(745, 2055, 0.8 * p, f);
      darkBoard(1185, 2055, 600, 170, [['STATEMENT CHECK', 46, '#ffd94d'], ['= HATHIYAAR', 46, '#8ef0b3']], p);
    }
    dust(f, 1080, 1500, 600, 8, 0.12);
  });
}, [545]);
// ===== F7a (584–615) S7a — AERIAL TOP-DOWN: toll plaza upar se, lanes me gaadiyon ki kataar =====
shot(584, 615, 0.3, { cx: 1080, cy: 1500, s: 0.95 }, { cx: 1080, cy: 1450, s: 0.78 }, (f, u) => {
  layer(0.5, () => vgrad(-600, 3840, [[0, '#0c141c'], [1, '#0a1016']]));
  layer(1, () => {
    // sadak (upar-neeche jaati hui)
    ctx.fillStyle = '#1d2632'; ctx.fillRect(660, -600, 840, 4440);
    ctx.fillStyle = 'rgba(255,220,150,0.10)'; ctx.fillRect(660, -600, 10, 4440); ctx.fillRect(1490, -600, 10, 4440);
    ctx.strokeStyle = 'rgba(240,246,250,0.35)'; ctx.lineWidth = 6; ctx.setLineDash([46, 40]);
    for (const lx of [940, 1220]) { ctx.beginPath(); ctx.moveTo(lx, -600); ctx.lineTo(lx, 3840); ctx.stroke(); }
    ctx.setLineDash([]);
    // gantry rekha (upar)
    ctx.fillStyle = '#39445c'; ctx.fillRect(640, 1180, 880, 30);
    plate(1080, 1120, 340, 72, 'TOLL PLAZA', 34);
    // booth band + barrier pattiyaan
    for (const lx of [800, 1080, 1360]) {
      ctx.fillStyle = '#4a586a'; D.rr(ctx, lx - 95, 1420, 190, 220, 10); ctx.fill();
      ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = '#e8edf2'; ctx.fillRect(lx - 130, 1392, 260, 20);
      ctx.fillStyle = '#e53935';
      for (let sx = lx - 130; sx < lx + 110; sx += 52) ctx.fillRect(sx, 1392, 26, 20);
    }
    // kataar ki gaadiyaan (booth ke neeche) — halki hilti hui (garmi ki lehar)
    const cols = [['#2c4258', '#16222f'], ['#5a2e2e', '#2a1414'], ['#2e4a34', '#14241a'], ['#4a3a5e', '#241a30']];
    [800, 1080, 1360].forEach((lx, li) => {
      for (let ri = 0; ri < 4; ri++) {
        const cy2 = 1900 + ri * 420;
        const jx = Math.sin(f * 0.25 + li * 3 + ri * 1.7) * 5;
        const [c1, c2] = cols[(li + ri) % 4];
        carTop(lx + jx, cy2, 0.92, c1, c2);
      }
    });
    // upar nikal chuki gaadiyaan (tez upar jaati hui)
    for (let i = 0; i < 3; i++) {
      const yy = 1000 - ((f * 9 + i * 300) % 1500);
      carTop(800 + i * 280, yy, 0.92, '#2c4258', '#16222f');
    }
    // garmi ki lehar (halki tedhi rekhaayein)
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 8;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      const hx = 720 + i * 120;
      ctx.moveTo(hx, 1750);
      ctx.bezierCurveTo(hx + 16, 2050, hx - 16, 2350, hx + 8, 2650);
      ctx.stroke();
    }
    dust(f, 1080, 1500, 700, 6, 0.08);
  });
}, []);
// ===== F7b (615–648) S7b — CRANE PULL-UP: camera upar uthta hai, kataar ki asli lambai dikhti hai =====
shot(615, 648, 0.3, { cx: 1080, cy: 1450, s: 0.78 }, { cx: 1080, cy: 1520, s: 0.48 }, (f, u) => {
  const lf = f - 615;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#0c141c'], [1, '#0a1016']]));
  layer(1, () => {
    lampPool(560, 640, 520, 0.16); // suraj ki glare upar-bayein
    ctx.fillStyle = '#1d2632'; ctx.fillRect(660, -600, 840, 4440);
    ctx.fillStyle = 'rgba(255,220,150,0.10)'; ctx.fillRect(660, -600, 10, 4440); ctx.fillRect(1490, -600, 10, 4440);
    ctx.strokeStyle = 'rgba(240,246,250,0.35)'; ctx.lineWidth = 6; ctx.setLineDash([46, 40]);
    for (const lx of [940, 1220]) { ctx.beginPath(); ctx.moveTo(lx, -600); ctx.lineTo(lx, 3840); ctx.stroke(); }
    ctx.setLineDash([]);
    ctx.fillStyle = '#39445c'; ctx.fillRect(640, 1180, 880, 30);
    for (const lx of [800, 1080, 1360]) {
      ctx.fillStyle = '#4a586a'; D.rr(ctx, lx - 95, 1420, 190, 220, 10); ctx.fill();
      ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = '#e8edf2'; ctx.fillRect(lx - 130, 1392, 260, 20);
      ctx.fillStyle = '#e53935';
      for (let sx = lx - 130; sx < lx + 110; sx += 52) ctx.fillRect(sx, 1392, 26, 20);
    }
    const cols = [['#2c4258', '#16222f'], ['#5a2e2e', '#2a1414'], ['#2e4a34', '#14241a'], ['#4a3a5e', '#241a30']];
    [800, 1080, 1360].forEach((lx, li) => {
      for (let ri = 0; ri < 6; ri++) {
        const cy2 = 1900 + ri * 290;
        const jx = Math.sin(f * 0.25 + li * 3 + ri * 1.7) * 4;
        const [c1, c2] = cols[(li + ri) % 4];
        carTop(lx + jx, cy2, 0.68, c1, c2);
      }
    });
    // side ki khaali zameen par dhool ke baadal
    ctx.fillStyle = 'rgba(190,150,90,0.06)';
    for (let i = 0; i < 5; i++) { D.ell(ctx, 300 + hash(i * 7.7) * 150, 1200 + i * 480, 130, 60); ctx.fill(); D.ell(ctx, 1750 + hash(i * 3.9) * 150, 1000 + i * 520, 130, 60); ctx.fill(); }
    if (lf > 10) { const p = spring((lf - 10) / 9); darkBoard(1080, 820, 640, 150, [['LAMBI LINE?', 58, '#ffd94d']], p); }
  });
}, []);
// ===== F8a (648–710) S8a — SEPIA FLASHBACK, GROUND LEVEL: kataar ke saath PEELI line khud banti jaati hai =====
shot(648, 710, 0.34, { cx: 1080, cy: 1900, s: 0.85 }, { cx: 1080, cy: 1850, s: 1.0 }, (f, u) => {
  const lf = f - 648;
  layer(0.45, () => vgrad(-600, 2400, [[0, '#3a2410'], [0.6, '#8a5a24'], [1, '#d9a24e']]));
  layer(1, () => {
    // sadak (neeche ka hissa)
    ctx.fillStyle = '#2a1c10'; ctx.fillRect(-800, 2080, 3760, 1760);
    ctx.fillStyle = 'rgba(255,210,130,0.10)'; ctx.fillRect(-800, 2080, 3760, 10);
    ctx.strokeStyle = 'rgba(255,210,130,0.08)'; ctx.lineWidth = 5;
    for (const dx of [-800, 0, 800]) { ctx.beginPath(); ctx.moveTo(1080 + dx * 0.3, 2090); ctx.lineTo(1080 + dx, 3600); ctx.stroke(); }
    // PEELI LINE — kataar ke saath-saath zameen par khud banti hui (gaadiyon se PEHLE draw, taaki kataar jahan khadi hai wahan line uske peeche rahe)
    const p = sstep(lf / 42);
    const x0 = 600, y0 = 3600, x1 = 960, y1 = 2090;
    // halki guide (poori lambai, dhundli)
    ctx.strokeStyle = 'rgba(255,205,40,0.14)'; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    // bani hui line (tapering: paas me chaudi, door patli) — tukdo me
    const SEG = 26;
    for (let i = 0; i < SEG; i++) {
      const t0 = i / SEG, t1 = (i + 1) / SEG;
      if (t0 > p) break;
      ctx.strokeStyle = '#ffcf28'; ctx.lineWidth = D.lerp(64, 12, t0); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(D.lerp(x0, x1, t0), D.lerp(y0, y1, t0)); ctx.lineTo(D.lerp(x0, x1, Math.min(t1, p)), D.lerp(y0, y1, Math.min(t1, p))); ctx.stroke();
    }
    // paint ka sar (chamakta hua) + chhita
    if (p > 0.02 && p < 0.99) {
      const hx = D.lerp(x0, x1, p), hy = D.lerp(y0, y1, p);
      lampPool(hx, hy, 120, 0.5);
      ctx.fillStyle = '#ffe97a'; D.circ(ctx, hx, hy, 15); ctx.fill();
      D.drawSparkle(ctx, hx + 30, hy - 24, 22, 0.85);
    }
    // naap ke nishan (line ke saath chhote safed cross)
    ctx.strokeStyle = 'rgba(245,240,220,0.8)'; ctx.lineWidth = 5;
    for (const tt of [0.3, 0.55, 0.8]) {
      if (p < tt) continue;
      const mx = D.lerp(x0, x1, tt), my = D.lerp(y0, y1, tt);
      ctx.beginPath(); ctx.moveTo(mx - 26, my); ctx.lineTo(mx + 26, my); ctx.stroke();
    }
    // kataar — EK hi lane me door tak sikudti hui (sabse door wali pehle draw, taaki paas wali use dhake)
    carRear(1060, 2085, 0.42, '#332619');
    carRear(1085, 2180, 0.54, '#37291a');
    carRear(1130, 2330, 0.70, '#3d2c1e');
    carRear(1210, 2560, 0.92, '#4a3423');
    if (lf > 36) { const p2 = spring((lf - 36) / 8); ctx.save(); ctx.translate(810, 1520); ctx.scale(p2, p2); ctx.translate(-810, -1520); plate(810, 1520, 400, 100, '100 METRE', 48, '#ffd94d'); ctx.restore(); }
    // sepia wash
    ctx.fillStyle = 'rgba(190,130,50,0.10)'; ctx.fillRect(-800, -600, 3760, 4440);
    dust(f, 1080, 2000, 800, 12, 0.22);
  });
}, []);
// ===== F8b (710–773) S8b — SEPIA: barrier khulta hai, saari gaadiyaan BINA TOLL nikal jaati hain; hit 716 =====
shot(710, 773, 0.3, { cx: 1080, cy: 1700, s: 0.72 }, { cx: 1080, cy: 1680, s: 0.82 }, (f, u) => {
  const lf = f - 710;
  layer(0.45, () => vgrad(-600, 2600, [[0, '#4a2c10'], [0.55, '#a06a28'], [1, '#e0aa4e']]));
  layer(1, () => {
    const l = sstep((lf - 2) / 9);
    tollSet(1080, GY, f, { lifts: [l, l, l] });
    // khulne ki sunehri chamak
    if (lf >= 8 && lf < 26) { lampPool(860, GY - 700, 420, 0.35 * (1 - (lf - 8) / 18)); lampPool(1180, GY - 700, 420, 0.35 * (1 - (lf - 8) / 18)); }
    // teen gaadiyaan ek-ek karke nikalti hain (door se paas ki taraf depth)
    const cars = [
      { s: 0.55, gy: GY - 30, d: 6 },
      { s: 0.7, gy: GY + 12, d: 13 },
      { s: 0.85, gy: GY + 46, d: 20 },
    ];
    for (const c of cars) {
      const cp = sstep((lf - c.d) / 44);
      if (cp <= 0) continue;
      const cxp = D.lerp(280, 1960, cp);
      carSide(cxp, c.gy, c.s, f);
      if (cp > 0.1 && cp < 0.95) { D.drawSparkle(ctx, cxp - 300 * c.s, c.gy - 300 * c.s, 20, 0.6); }
    }
    if (lf > 18) { const p = spring((lf - 18) / 9); darkBoard(1080, 980, 700, 150, [['BINA TOLL PASS!', 58, '#ffc72c']], p); }
    ctx.fillStyle = 'rgba(190,130,50,0.06)'; ctx.fillRect(-800, -600, 3760, 4440);
    dust(f, 1080, 1900, 800, 10, 0.2);
  });
}, [716]);

// ===== F9a (773–820) S9a — NIYAM KITAAB MACRO, DUTCH TILT: panna saaf padha jaata hai, saaya yak-ba-yak aata hai =====
shot(773, 820, 0.38, { cx: 1080, cy: 1500, s: 1.15, rot: -0.06 }, { cx: 1080, cy: 1500, s: 1.3, rot: -0.085 }, (f, u) => {
  const lf = f - 773;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#0a0806'], [1, '#141007']]));
  layer(1, () => {
    lampPool(680, 880, 560, 0.16); // upar-bayein se aati bujhti roshni
    rulePage(1080, 1500, 780, 1150, f, { strike: 0 });
    // aata hua haath ka saaya (shot ke aakhir me)
    if (lf > 32) {
      const p = sstep((lf - 32) / 15);
      darkPool(D.lerp(260, 640, p), 1180, 430, 0.38 * p);
    }
    dust(f, 1080, 1500, 650, 14, 0.28);
  });
}, []);
// ===== F9b (820–869) S9b — DUTCH TILT: saaya panna chaap leta hai, niyam par laal lakeer, niyam feeka =====
shot(820, 869, 0.4, { cx: 1080, cy: 1500, s: 1.3, rot: -0.085 }, { cx: 1080, cy: 1520, s: 1.42, rot: -0.05 }, (f, u) => {
  const lf = f - 820;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#070503'], [1, '#100a05']]));
  layer(1, () => {
    const strike = sstep((lf - 8) / 18);
    rulePage(1080, 1500, 780, 1150, f, { strike });
    // guzarta hua bada saaya
    const sp = sstep(lf / 28);
    darkPool(D.lerp(420, 1560, sp), 1420, 500, 0.34);
    // panna dhire-dhire andhera hota hai
    darkPool(1080, 1500, 800, 0.22 * strike);
    if (lf > 28) { const p = spring((lf - 28) / 8); ctx.save(); ctx.translate(1080, 2135); ctx.scale(p, p); ctx.translate(-1080, -2135); plate(1080, 2135, 560, 100, '2024: NIYAM KHATAM', 44, '#ff6b5e'); ctx.restore(); }
    dust(f, 1080, 1500, 650, 12, 0.22);
  });
}, []);
// ===== F10a (869–910) S10a — GROUND LEVEL SLIDE: camera sadak par leta hua, feeki-darar wali peeli line ke saath sarakta hai =====
shot(869, 910, 0.34, { cx: 1080, cy: 2050, s: 0.9 }, { cx: 1080, cy: 1980, s: 1.04 }, (f, u) => {
  layer(0.45, () => vgrad(-600, 2400, [[0, '#24343e'], [1, '#3d4a42']]));
  layer(1, () => {
    // sadak ki satah (poora neeche ka hissa)
    ctx.fillStyle = '#20262c'; ctx.fillRect(-800, 1900, 3760, 1940);
    ctx.fillStyle = 'rgba(200,220,235,0.06)'; ctx.fillRect(-800, 1900, 3760, 9);
    // aage badhne ka ehsaas: behti hui halki pattiyaan
    ctx.fillStyle = 'rgba(255,255,255,0.045)';
    for (let i = 0; i < 8; i++) { const by = 1960 + ((i * 210 + f * 8) % 1500); ctx.fillRect(-800, by, 3760, 9); }
    // upar se guzarti gaadiyon ke dhundhle saaye (kinare par)
    for (let k = 0; k < 2; k++) {
      const gx = ((f * 13 + k * 1700) % 3400) - 700;
      ctx.save(); ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#0a0e14'; D.rr(ctx, gx, 1060, 720, 170, 60); ctx.fill();
      D.circ(ctx, gx + 130, 1252, 62); ctx.fill(); D.circ(ctx, gx + 590, 1252, 62); ctx.fill();
      ctx.restore();
    }
    // FEEKI PEELI LINE — tukdo me, dararo ke saath, door tak jaati hui
    for (let i = 0; i < 12; i++) {
      if (hash(i * 3.3) > 0.78) continue; // gayab tukda (darar)
      const t0 = i / 12, t1 = (i + 0.72) / 12;
      ctx.strokeStyle = `rgba(232,190,60,${0.34 - t0 * 0.16})`;
      ctx.lineWidth = D.lerp(56, 11, t0); ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(D.lerp(745, 1015, t0), D.lerp(3420, 1960, t0));
      ctx.lineTo(D.lerp(745, 1015, t1), D.lerp(3420, 1960, t1));
      ctx.stroke();
      // darar ki kaali lakeer
      if (i % 3 === 1) {
        ctx.strokeStyle = 'rgba(10,10,10,0.5)'; ctx.lineWidth = 4;
        const mx = D.lerp(745, 1015, t0 + 0.03), my = D.lerp(3420, 1960, t0 + 0.03);
        ctx.beginPath(); ctx.moveTo(mx - 22, my - 14); ctx.lineTo(mx + 20, my + 16); ctx.stroke();
      }
    }
    // aage jaam: tail lights ki laal chamak + gaadiyon ke peeche
    lampPool(1080, 1980, 420, 0.20, '255,50,40');
    carRear(955, 2075, 0.52, '#26303c'); carRear(1245, 2095, 0.58, '#2c3644');
    dust(f, 1080, 2400, 800, 8, 0.10);
  });
}, []);
// ===== F10b (910–951) S10b — SLIDE JAAM TAK: line pahiye ke neeche jaakar gayab; board "LINE HAI... HAQ NAHI" =====
shot(910, 951, 0.34, { cx: 1080, cy: 1980, s: 1.04 }, { cx: 1080, cy: 1800, s: 0.9 }, (f, u) => {
  const lf = f - 910;
  layer(0.45, () => vgrad(-600, 2600, [[0, '#24343e'], [1, '#3d4a42']]));
  layer(1, () => {
    tollSet(1080, GY, f, { lifts: [0, 0, 0] });
    // kataar (jaam) booths ke saamne
    carRear(800, GY, 0.72); carRear(1080, GY, 0.78); carRear(1360, GY, 0.72);
    // peeli line camera se beech wali gaadi ke pahiye tak — aage jaakar feeki gayab
    for (let i = 0; i < 10; i++) {
      const t0 = i / 10, t1 = (i + 0.7) / 10;
      ctx.strokeStyle = `rgba(232,190,60,${0.5 * (1 - t0 * 0.92)})`;
      ctx.lineWidth = D.lerp(58, 16, t0); ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(D.lerp(700, 985, t0), D.lerp(3380, 2430, t0));
      ctx.lineTo(D.lerp(700, 985, t1), D.lerp(3380, 2430, t1));
      ctx.stroke();
    }
    // line yahan feeki hokar khatam — neeche sirf halka road patch/parchhaai
    ctx.fillStyle = 'rgba(0,0,0,0.30)'; D.ell(ctx, 995, 2448, 95, 15); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.03)'; D.ell(ctx, 995, 2442, 60, 8); ctx.fill();
    if (lf > 12) { const p = spring((lf - 12) / 9); darkBoard(1080, 1050, 720, 150, [['LINE HAI... HAQ NAHI', 54, '#ffd94d']], p); }
    dust(f, 1080, 2000, 800, 8, 0.10);
  });
}, []);
// ===== F11a (951–1010) S11a — BHARAT NAKSHA: toll dots lehar se jalte hain, sikke uthte hain =====
shot(951, 1010, 0.32, { cx: 1080, cy: 1500, s: 0.62 }, { cx: 1080, cy: 1500, s: 0.74 }, (f, u) => {
  const lf = f - 951;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#04070d'], [1, '#081426']]));
  layer(1, () => {
    const waveR = 120 + lf * 26;
    indiaMap(f, waveR);
    // jalte dots se uthte sikke
    for (let k = 0; k < 9; k++) {
      const [dx, dy] = TOLL_DOTS[(k * 11) % TOLL_DOTS.length];
      if (Math.hypot(dx - 1080, dy - 1180) > waveR) continue;
      const ph = ((lf * 1.2 + k * 13) % 50) / 50;
      ctx.save(); ctx.globalAlpha = 1 - ph;
      coinDraw(dx, dy - ph * 230, 16);
      ctx.restore();
    }
    if (lf > 34) plate(1080, 2640, 520, 92, 'DESH BHAR KE TOLL', 40, '#ffb84d');
    dust(f, 1080, 1500, 700, 6, 0.08);
  });
}, []);
// ===== F11b (1010–1079) S11b — COUNTER AVALANCHE: girte numbers ke beech ₹70,000 CRORE slam; hit 1050 =====
shot(1010, 1079, 0.36, { cx: 1080, cy: 1500, s: 1.0 }, { cx: 1080, cy: 1500, s: 1.26 }, (f, u) => {
  const lf = f - 1010;
  layer(0.5, () => {
    vgrad(-600, 3840, [[0, '#04070d'], [1, '#0a1424']]);
    ctx.save(); ctx.globalAlpha = 0.22; indiaMap(f, 9999); ctx.restore();
  });
  layer(1, () => {
    // girte hue dhundhle numbers (avalanche)
    const ghosts = ['₹500', '₹1,200', '₹75', '₹340', '₹2,000', '₹60', '₹999', '₹150', '₹420', '₹88', '₹5,000'];
    ghosts.forEach((gs, i) => {
      const gx = 600 + hash(i * 3.7) * 960, gy2 = 420 + ((f * (6 + hash(i * 1.3) * 5) + i * 340) % 2150);
      ctx.save(); ctx.globalAlpha = 0.10 + hash(i * 7.1) * 0.10;
      text(gs, gx, gy2, 42 + hash(i * 2.9) * 30, '#ffd94d');
      ctx.restore();
    });
    // badi ginti — slam se pehle halki jitter, baad me pakki
    const base = D.lerp(0, 70000, sstep(lf / 38));
    const n = lf < 40 ? base * (0.97 + 0.06 * hash(f * 1.31)) : 70000;
    darkBoard(1080, 1420, 820, 430, [
      ['EK SAAL KA TOLL', 44, '#f5edd8'],
      ['₹' + inr(n) + ' CRORE', 100, '#ffc72c'],
      ['DESH BHAR SE KATA', 40, '#ff8a5c'],
    ], 1);
    // slam ke baad: chamak + kinare se sikkon ki baarish
    if (lf >= 40) {
      D.drawSparkle(ctx, 700, 1230, 34, 0.9); D.drawSparkle(ctx, 1470, 1250, 30, 0.8); D.drawSparkle(ctx, 1080, 1150, 26, 0.7);
      for (let k = 0; k < 6; k++) {
        const cxp = k % 2 ? 1470 : 690;
        const cyp = 620 + ((f * 11 + k * 260) % 1750);
        ctx.save(); ctx.globalAlpha = 0.85; coinDraw(cxp + Math.sin(f * 0.2 + k) * 14, cyp, 23); ctx.restore();
      }
    }
    dust(f, 1080, 1500, 700, 8, 0.12);
  });
}, [1050]);
// ===== F12a (1079–1130) S12a — SPLIT SCREEN: bayein barrier UP car nikalti hai, daayein barrier DOWN phir bhi sikke udte hain =====
shot(1079, 1130, 0.3, { cx: 1080, cy: 1500, s: 0.9 }, { cx: 1080, cy: 1500, s: 0.99 }, (f, u) => {
  const lf = f - 1079;
  layer(0.5, () => {
    ctx.fillStyle = '#0a1c22'; ctx.fillRect(-800, -600, 1880, 4440);
    ctx.fillStyle = '#1e100d'; ctx.fillRect(1080, -600, 1880, 4440);
  });
  layer(1, () => {
    // zameen dono taraf (action band upar uthaya gaya — frame ka beech bhara rahe)
    ctx.fillStyle = '#141a22'; ctx.fillRect(-800, 2080, 3760, 1760);
    ctx.fillStyle = 'rgba(200,220,235,0.10)'; ctx.fillRect(-800, 2080, 3760, 8);
    // BAAYEIN: barrier up, car poori LEFT half ke andar nikalti hai, sikke upar
    boothDraw(700, 2080, 0.71);
    barrierDraw(838, 2080, 0.71, 1);
    const carX = D.lerp(650, 800, sstep(lf / 48));
    carSide(carX, 2080, 0.58, f);
    for (let k = 0; k < 3; k++) {
      const p = ((lf + k * 9) % 27) / 27;
      const sx = D.lerp(carX, 900, p), sy = D.lerp(1770, 1120, p) - Math.sin(p * Math.PI) * 60;
      ctx.save(); ctx.globalAlpha = 1 - p * 0.4; coinDraw(sx, sy, 22); ctx.restore();
    }
    plate(830, 950, 390, 86, 'BARRIER UP', 38, '#8ef0b3');
    // DAAYEIN: barrier down, kataar — phir bhi sikke barrier ke UPAR se paar (gaadiyaan poori RIGHT half ke andar)
    boothDraw(1450, 2080, 0.71);
    carRear(1390, 2080, 0.55); carRear(1335, 2108, 0.45);
    barrierDraw(1280, 2080, 0.71, 0);
    for (let k = 0; k < 3; k++) {
      const p = ((lf + k * 9) % 27) / 27;
      const q = 1 - p;
      const sx = q * q * 1400 + 2 * q * p * 1280 + p * p * 1130;
      const sy = q * q * 1790 + 2 * q * p * 1400 + p * p * 1200;
      ctx.save(); ctx.globalAlpha = 1 - p * 0.4; coinDraw(sx, sy, 22); ctx.restore();
      lampPool(sx, sy, 44, 0.25, '255,60,40');
    }
    plate(1335, 950, 410, 86, 'BARRIER DOWN', 38, '#ff6b5e');
    // beech ki sunehri lakeer (divider)
    ctx.fillStyle = 'rgba(255,217,77,0.55)'; ctx.fillRect(1076, -600, 8, 4440);
    lampPool(1080, 1500, 280, 0.10);
    dust(f, 1080, 1500, 700, 6, 0.10);
  });
}, []);
// ===== F12b (1130–1187) S12b — SPLIT + TEZ GHADI beech me, board "ROZ ₹192 CRORE"; hit 1150 =====
shot(1130, 1187, 0.32, { cx: 1080, cy: 1500, s: 0.99 }, { cx: 1080, cy: 1500, s: 1.1 }, (f, u) => {
  const lf = f - 1130;
  layer(0.5, () => {
    ctx.fillStyle = '#0a1c22'; ctx.fillRect(-800, -600, 1880, 4440);
    ctx.fillStyle = '#1e100d'; ctx.fillRect(1080, -600, 1880, 4440);
  });
  layer(1, () => {
    ctx.fillStyle = '#141a22'; ctx.fillRect(-800, 2080, 3760, 1760);
    ctx.fillStyle = 'rgba(200,220,235,0.10)'; ctx.fillRect(-800, 2080, 3760, 8);
    boothDraw(700, 2080, 0.71);
    barrierDraw(838, 2080, 0.71, 1);
    const carX = 650 + ((lf * 10) % 150);
    carSide(carX, 2080, 0.58, f);
    boothDraw(1450, 2080, 0.71);
    carRear(1390, 2080, 0.55); carRear(1335, 2108, 0.45);
    barrierDraw(1280, 2080, 0.71, 0);
    // dono taraf sikke lagatar
    for (let k = 0; k < 3; k++) {
      const p = ((lf + k * 9) % 27) / 27;
      ctx.save(); ctx.globalAlpha = 1 - p * 0.4;
      coinDraw(D.lerp(carX, 900, p), D.lerp(1770, 1120, p) - Math.sin(p * Math.PI) * 60, 22);
      const q = 1 - p;
      coinDraw(q * q * 1400 + 2 * q * p * 1280 + p * p * 1130, q * q * 1790 + 2 * q * p * 1400 + p * p * 1200, 22);
      ctx.restore();
    }
    plate(830, 950, 390, 86, 'BARRIER UP', 38, '#8ef0b3');
    plate(1335, 950, 410, 86, 'BARRIER DOWN', 38, '#ff6b5e');
    ctx.fillStyle = 'rgba(255,217,77,0.55)'; ctx.fillRect(1076, -600, 8, 4440);
    // tez ghadi — beech me, divider ke upar
    clockDraw(1080, 1480, 150, f);
    if (lf >= 20 && lf < 30) { D.drawSparkle(ctx, 950, 1360, 30, 0.9); D.drawSparkle(ctx, 1215, 1380, 26, 0.8); }
    if (lf > 26) { const p = spring((lf - 26) / 9); darkBoard(1080, 2265, 720, 150, [['ROZ ₹192 CRORE', 56, '#ffc72c']], p); }
    dust(f, 1080, 1500, 700, 6, 0.10);
  });
}, [1150]);
// ===== F13a (1187–1245) S13a — HERO PRODUCT: sunehra ANNUAL PASS card andhere me ghum kar aata hai =====
shot(1187, 1245, 0.3, { cx: 1080, cy: 1500, s: 0.95, rot: 0 }, { cx: 1095, cy: 1490, s: 1.06, rot: 0.02 }, (f, u) => {
  const lf = f - 1187;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#0d0a06'], [1, '#1c1206']]));
  layer(1, () => {
    lampPool(1080, 1460, 900, 0.22);
    // zameen par halki parchaai/reflection
    wetReflect(1080, 1740, 640, 230, 0.12);
    // card ghum kar saamne aata hai (edge-on se pura)
    const sx = 0.12 + 0.88 * sstep(lf / 26);
    ctx.save(); ctx.translate(1080, 1460); ctx.rotate(Math.sin(lf * 0.05) * 0.025); ctx.translate(-1080, -1460);
    passCard(1080, 1460, 720, sx, f);
    ctx.restore();
    // aas-paas tairti chamak
    for (let i = 0; i < 7; i++) {
      const px = 640 + hash(i * 6.1) * 880, py = 1000 + ((hash(i * 3.3) * 900 + f * (1 + hash(i) * 1.5)) % 950);
      ctx.fillStyle = `rgba(255,217,77,${0.25 + hash(i * 9.4) * 0.4})`; D.circ(ctx, px, py, 3.5 + hash(i) * 3.5); ctx.fill();
    }
    if (lf > 34) D.drawSparkle(ctx, 760, 1240, 26, 0.8);
    dust(f, 1080, 1500, 700, 8, 0.15);
  });
}, []);
// ===== F13b (1245–1301) S13b — PASS pakka: "₹3,000 SAALANA PASS" board + "200 TOLL • 1 SAAL" plate; hit 1245 glint =====
shot(1245, 1301, 0.3, { cx: 1095, cy: 1490, s: 1.06, rot: 0.02 }, { cx: 1080, cy: 1490, s: 1.14, rot: 0 }, (f, u) => {
  const lf = f - 1245;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#0d0a06'], [1, '#1c1206']]));
  layer(1, () => {
    lampPool(1080, 1460, 900, 0.22);
    wetReflect(1080, 1740, 640, 230, 0.12);
    passCard(1080, 1460, 720, 1, f);
    // hit par card ke kone ki tez chamak
    if (lf < 9) { const ga = 1 - lf / 9; D.drawSparkle(ctx, 1375, 1625, 44 * ga + 8, 0.95); lampPool(1375, 1625, 200, 0.4 * ga); }
    D.drawSparkle(ctx, 745, 1660, 22, 0.6 + 0.3 * Math.sin(f * 0.3));
    if (lf > 3) { const p = spring((lf - 3) / 9); darkBoard(1080, 925, 700, 150, [['₹3,000 SAALANA PASS', 54, '#ffc72c']], p); }
    if (lf > 16) { const p = spring((lf - 16) / 8); ctx.save(); ctx.translate(1080, 2085); ctx.scale(p, p); ctx.translate(-1080, -2085); plate(1080, 2085, 560, 100, '200 TOLL • 1 SAAL', 44, '#8ef0b3'); ctx.restore(); }
    dust(f, 1080, 1500, 700, 8, 0.15);
  });
}, [1245]);
// ===== F14a (1301–1348) S14a — BARRIER MACRO: patti uth-ti hai, timer "2.0s" par rukta hai =====
shot(1301, 1348, 0.34, { cx: 1080, cy: 1600, s: 1.1 }, { cx: 1080, cy: 1550, s: 1.24 }, (f, u) => {
  const lf = f - 1301;
  layer(0.5, () => {
    vgrad(-600, 3840, [[0, '#0a1420'], [1, '#0d1a14']]);
    // dhundhli bokeh battiyaan (peeche ka plaza)
    for (let i = 0; i < 7; i++) lampPool(500 + hash(i * 4.7) * 1200, 800 + hash(i * 8.3) * 900, 90 + hash(i) * 90, 0.10);
  });
  layer(1, () => {
    // zameen
    ctx.fillStyle = '#141a22'; ctx.fillRect(-800, 2350, 3760, 1490);
    ctx.fillStyle = 'rgba(200,220,235,0.08)'; ctx.fillRect(-800, 2350, 3760, 8);
    wetReflect(1080, 2360, 800, 220, 0.08);
    // bada barrier (macro): khamba bayein, patti poori chaudaai me
    const lift = sstep(lf / 40);
    barrierDraw(850, 2350, 1.9, lift);
    // timer screen (upar-daayein)
    const t = Math.min(2, (lf / 40) * 2);
    lcdScreen(1330, 985, 350, 200, t.toFixed(1) + 's', 'BARRIER TIME', '#39e6c3', 84);
    if (lf >= 40) { lampPool(1330, 985, 260, 0.25, '80,255,150'); textF('2 SECOND ME KHULA!', 1080, 2260, 44, '#8ef0b3', 700); }
    dust(f, 1080, 1600, 700, 10, 0.18);
  });
}, []);
// ===== F14b (1348–1398) S14b — SIGNATURE SHOT: COIN-LEVEL TRACKING — camera sikke ke saath barrier ke neeche sarakta hai =====
shot(1348, 1398, 0.42, { cx: 900, cy: 2150, s: 1.0 }, { cx: 1310, cy: 2150, s: 1.03 }, (f, u) => {
  const lf = f - 1348;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#02040a'], [1, '#05070c']]));
  layer(1, () => {
    // peeche ki kaali deewaar
    ctx.fillStyle = '#04060b'; ctx.fillRect(-800, 300, 3760, 1760);
    // BARRIER ki patti — coin-level se: poori chaudaai me laal-safed band, zameen se thoda upar
    ctx.fillStyle = '#dfe5ea'; ctx.fillRect(-800, 1870, 3760, 118);
    ctx.fillStyle = '#e53935';
    for (let sx = -800; sx < 2960; sx += 300) ctx.fillRect(sx, 1870, 150, 118);
    ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-800, 1870); ctx.lineTo(2960, 1870); ctx.moveTo(-800, 1988); ctx.lineTo(2960, 1988); ctx.stroke();
    // patti ke neeche se ris-ti roshni (woh patli si jagah jahan se sikke nikalte hain)
    const lg = ctx.createLinearGradient(0, 1988, 0, 2080);
    lg.addColorStop(0, 'rgba(255,205,110,0.20)'); lg.addColorStop(1, 'rgba(255,205,110,0)');
    ctx.fillStyle = lg; ctx.fillRect(-800, 1988, 3760, 92);
    // sensor ki laal aankh (bayein khambhe par) + uski patli beam
    const pl = 0.55 + 0.45 * Math.sin(f * 0.5);
    lampPool(712, 1930, 90, 0.5 * pl, '255,60,40');
    ctx.fillStyle = '#ff3b30'; D.circ(ctx, 712, 1930, 13); ctx.fill();
    ctx.fillStyle = `rgba(255,60,40,${0.10 + 0.06 * pl})`; ctx.fillRect(712, 2052, 1500, 5);
    // zameen (geeli, chamakti hui)
    ctx.fillStyle = '#0a0e14'; ctx.fillRect(-800, 2060, 3760, 1780);
    ctx.fillStyle = 'rgba(255,205,110,0.07)';
    for (let i = 0; i < 6; i++) { const sy = 2160 + i * 105 + Math.sin(i * 7.3) * 14; ctx.fillRect(400 + hash(i * 5.1) * 500, sy, 700 + hash(i * 3.7) * 800, 7); }
    lampPool(1080, 2260, 620, 0.10); // barrier ke neeche ki sunehri chamak
    // SIKKE — ek kataar me barrier ke neeche se sarakte hue; camera unke saath chalta hai
    const baseX = D.lerp(640, 1560, sstep(lf / 46));
    for (let i = 5; i >= 0; i--) {
      const cxp = baseX - i * 96, cyp = 2335 + Math.sin(f * 0.3 + i * 1.3) * 3;
      const r = i === 0 ? 47 : 38;
      // saaya
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; D.ell(ctx, cxp, 2392, r * 1.05, 11); ctx.fill();
      // hero sikke ke peeche motion-trail (bhoot pratiyaan)
      if (i === 0) {
        for (let tr = 3; tr >= 1; tr--) {
          ctx.save(); ctx.globalAlpha = 0.10 + (3 - tr) * 0.05;
          coinDraw(cxp - tr * 34, cyp, r - tr * 3);
          ctx.restore();
        }
      }
      coinDraw(cxp, cyp, r);
      lampPool(cxp, cyp, r * 1.7, 0.14);
    }
    // sensor beam paar karne par chamak (hit ke aas-paas)
    if (lf >= 9 && lf < 18) { D.drawSparkle(ctx, 730, 2240, 30, 0.9); lampPool(730, 2240, 150, 0.35, '255,60,40'); }
    if (lf > 32) { const p = spring((lf - 32) / 8); darkBoard(1180, 1330, 760, 150, [['KATAUTI BINA KHULE BHI', 52, '#ff8a5c']], p); }
    dust(f, 1080, 2300, 700, 6, 0.10);
  });
}, [1358]);
// ===== F15 (1398–1493) S15 — AERIAL FLY-OUT DUSK: plaza door hota hai, do choice boards slam, tease strip =====
shot(1398, 1493, 0.26, { cx: 1080, cy: 1500, s: 0.85 }, { cx: 1080, cy: 1420, s: 0.5 }, (f, u) => {
  const lf = f - 1398;
  layer(0.45, () => duskSky(GY, f));
  layer(0.7, () => { // door ki sadak par behti battiyaan
    ctx.fillStyle = '#171019'; ctx.fillRect(-800, GY - 120, 3760, 120);
    for (let i = 0; i < 3; i++) {
      const hx = ((f * (8 + i * 3) + i * 1400) % 4200) - 700;
      lampPool(hx, GY - 60, 80, 0.3);
      ctx.fillStyle = '#ffe9a8'; D.circ(ctx, hx - 13, GY - 60, 6); ctx.fill(); D.circ(ctx, hx + 13, GY - 60, 6); ctx.fill();
    }
  });
  layer(1, () => {
    tollSet(1080, GY, f, { lifts: [1, 1, 1] });
    // chhoti gaadiyaan guzarti hui
    const cx1 = D.lerp(300, 1900, ((lf * 1.1) % 70) / 70);
    carSide(cx1, GY, 0.5, f);
    const cx2 = D.lerp(1900, 300, ((lf * 0.9 + 30) % 70) / 70);
    carSide(cx2, GY, 0.5, f); // carSide ki naak bayein hai — daayein se bayein jaati gaadi ke liye sahi direction
    // choice boards (hits par slam)
    if (lf >= 22) choiceBoard(845, 1500, 430, 170, 'CHECK KAROGE?', 52, '#3ddc74', spring((lf - 22) / 8));
    if (lf >= 52) choiceBoard(1315, 1500, 430, 170, 'KATNE DOGE?', 52, '#ff5147', spring((lf - 52) / 8));
    if (lf > 68) { const p = spring((lf - 68) / 9); ctx.save(); ctx.translate(1080, 2285); ctx.scale(p, p); ctx.translate(-1080, -2285); plate(1080, 2285, 580, 96, 'AGLI BAAR: OLA KA KHEL', 42, '#ffd94d'); ctx.restore(); }
    dust(f, 1080, 1800, 900, 8, 0.12);
  });
  if (lf > 82) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(255,170,60,0.05)'; ctx.fillRect(0, 0, W, H); }
}, [1420, 1450]);

// ---------------- TRANSITIONS (match-move soch kar: push-in agle angle me ghusta hai, whip par streak, raat me dark) ----------------
// index = shot order F1a..F15; h = pehle ~7 frame (enter), t = aakhri ~7 frame (exit)
const TR = [
  {},                             // F1a raat wide (push-in shuru)
  { t: 'flash' },                 // F1b khidki se andar -> phone ki chamak par flash
  { h: 'flash' },                 // F1c phone macro (screen flash-in)
  { h: 'flash' },                 // F2a sheeshe par roshni-match
  {},                             // F2b signal match
  { h: 'streak' },                // F3a POV speed streak-in
  {},                             // F3b tracking (motion continue)
  { h: 'dark' },                  // F4a raat ka andhera (Dutch tilt)
  {},                             // F4b ghost match
  { h: 'flash' },                 // F5a desk lamp flash
  {},                             // F5b counter match
  {},                             // F6a phone match
  {},                             // F6b zoom continue
  { h: 'flash' },                 // F7a aerial light-match
  {},                             // F7b crane continue
  { h: 'flash' },                 // F8a flashback ki chamak (sepia)
  {},                             // F8b sepia match
  { h: 'dark' },                  // F9a kitaab par andhera
  {},                             // F9b strike match
  {},                             // F10a ground slide
  {},                             // F10b slide continue
  { h: 'flash' },                 // F11a naksha light-match
  {},                             // F11b zoom continue (avalanche)
  { h: 'flash' },                 // F12a split slam-in
  {},                             // F12b split match
  { h: 'flash' },                 // F13a card glint-match
  {},                             // F13b card match
  { t: 'dark' },                  // F14a -> battiyaan bujhti hain
  { h: 'dark' },                  // F14b andhere se coin-level ubharta hai
  { h: 'flash' },                 // F15 dusk fly-out flash-in
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
