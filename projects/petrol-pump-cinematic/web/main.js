// EP-5 PETROL PUMP SCAM — CINEMATIC MULTI-ANGLE (1395 frames @30fps). BINA CHARACTER: koi hero, koi chehra nahi.
// Sirf jagah, machines aur faceless silhouettes. Camera: har sentence-block me 2-3 ALAG angles (top-down / low-angle /
// side-track / fly-inside / macro / POV / crane / aerial-map), har sub-shot move ke saath, 3-layer parallax,
// perspective station, machine-interior set, wet reflections, dust. Text = scene: har shot apni voice line dikhata hai.
// Frame-safety: har board/text dono camera extremes par visible-rect ke andar (boards auto-fit via measureText).
// Harness: window.ready, window.renderFrame(f), window.TOTAL.
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import * as D from './draw.js';

const W = 1080, H = 1920, TOTAL = 1395, FPS = 30;
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const DEV_FONT = '"Noto Sans Devanagari"';
const fontReady = (async () => {
  try {
    const face = new FontFace('Noto Sans Devanagari', `url(data:font/ttf;base64,${DEVANAGARI_BOLD_B64})`, { weight: '700' });
    await face.load(); document.fonts.add(face);
    await document.fonts.load(`700 60px ${DEV_FONT}`, 'PETROL ₹5');
  } catch (e) { window.fontErr = String(e); }
})();

function text(str, x, y, px, color, align = 'center') {
  ctx.fillStyle = color; ctx.font = `700 ${px}px ${DEV_FONT}, sans-serif`;
  ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
}
// measureText se shrink-to-fit: text kabhi board/frame se bahar nahi
function fitPx(str, px, maxW) {
  ctx.font = `700 ${px}px ${DEV_FONT}, sans-serif`;
  const w = ctx.measureText(str).width;
  return w > maxW ? Math.max(18, Math.floor(px * maxW / w)) : px;
}
function textF(str, x, y, px, color, maxW, align = 'center') { text(str, x, y, fitPx(str, px, maxW), color, align); }
function hash(n) { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }
const sstep = (u) => { u = D.clamp(u, 0, 1); return u * u * u * (u * (u * 6 - 15) + 10); };
const spring = (t) => D.clamp(D.easeOutBack(D.clamp(t, 0, 1)), 0, 1);
function inr(n) { // Indian number grouping: 1200000 -> 12,00,000
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

// ---------------- camera / parallax ----------------
let CAM = { cx: 1080, cy: 1250, s: 0.6 }, SHK = { x: 0, y: 0 };
function layer(k, fn) {
  const cxk = 1080 + (CAM.cx - 1080) * k, cyk = 1250 + (CAM.cy - 1250) * k;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(W / 2 + SHK.x, H / 2 + SHK.y);
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
// Gold-on-dark board (bade reveals). lines = [text, px, color]; har line board-width me auto-fit.
function darkBoard(x, y, w, h, lines, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  lampPool(0, 0, Math.max(w, h) * 0.95, 0.30);
  ctx.fillStyle = '#14100a'; D.rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.fill();
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 7; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,199,44,0.5)'; ctx.lineWidth = 2.5; D.rr(ctx, -w / 2 + 13, -h / 2 + 13, w - 26, h - 26, 9); ctx.stroke();
  lines.forEach((ln, i) => text(ln[0], 0, (i - (lines.length - 1) / 2) * (h * 0.52), fitPx(ln[0], ln[1], w - 64), ln[2]));
  ctx.restore();
}
// Chhoti dark tag-plate (labels ke liye)
function plate(x, y, w, h, str, px, col = '#ffd94d') {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(16,12,8,0.88)'; D.rr(ctx, -w / 2, -h / 2, w, h, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(201,162,39,0.75)'; ctx.lineWidth = 3.5; ctx.stroke();
  text(str, 0, 2, fitPx(str, px, w - 36), col);
  ctx.restore();
}
// Volumetric light cone
function lightCone(x, y0, y1, w0, w1, a = 0.10) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, `rgba(255,224,150,${a})`); g.addColorStop(1, 'rgba(255,224,150,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x - w0 / 2, y0); ctx.lineTo(x + w0 / 2, y0); ctx.lineTo(x + w1 / 2, y1); ctx.lineTo(x - w1 / 2, y1); ctx.closePath(); ctx.fill();
}
// Geeli zameen par reflection
function wetReflect(x, y, w, h, a = 0.16) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, `rgba(255,214,130,${a})`); g.addColorStop(1, 'rgba(255,214,130,0)');
  ctx.fillStyle = g;
  D.ell(ctx, x, y + h * 0.32, w / 2, h * 0.36); ctx.fill();
  ctx.fillStyle = `rgba(255,230,170,${a * 0.7})`;
  for (let i = 0; i < 5; i++) { const sx = x - w / 2 + 14 + i * (w - 28) / 4; ctx.fillRect(sx, y + 6, 7, h * (0.35 + hash(i * 7.3 + x) * 0.5)); }
}
// Roshni me tairti dhool
function dust(f, cx, cy, spread, n = 16, a = 0.35) {
  ctx.fillStyle = `rgba(255,236,180,${a})`;
  for (let i = 0; i < n; i++) {
    const dx = cx + (hash(i * 3.1) - 0.5) * spread + Math.sin(f * 0.02 + i * 1.7) * 22;
    const dy = cy + ((hash(i * 5.7) * 700 + f * (0.35 + hash(i) * 0.5)) % 700) - 350;
    D.circ(ctx, dx, dy, 2.2 + hash(i * 9) * 2.6); ctx.fill();
  }
}
// Rubber stamp (ghumaa hua, dashed kinara)
function stampDraw(x, y, w, h, lines, col, rot, sc) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = 0.94;
  ctx.strokeStyle = col; ctx.lineWidth = 9; D.rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.stroke();
  ctx.lineWidth = 3.5; ctx.setLineDash([16, 10]); D.rr(ctx, -w / 2 + 15, -h / 2 + 15, w - 30, h - 30, 8); ctx.stroke(); ctx.setLineDash([]);
  lines.forEach((ln, i) => text(ln[0], 0, (i - (lines.length - 1) / 2) * (h * 0.5), fitPx(ln[0], ln[1], w - 56), col));
  ctx.restore();
}
// ===== Faceless khada silhouette (sir + kandhe + shareer), ek kinare rim-light =====
function silFig(x, y, s, o = {}) {
  const col = o.col || '#0c0a08';
  const rim = o.rim || 'rgba(255,220,160,0.55)';
  const bob = o.bob || 0;
  ctx.save(); ctx.translate(x, y + bob); ctx.scale(s, s);
  ctx.fillStyle = col;
  D.circ(ctx, 0, -152, 24); ctx.fill();
  D.rr(ctx, -37, -130, 74, 132, 20); ctx.fill();
  ctx.strokeStyle = rim; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -152, 24, Math.PI * 1.08, Math.PI * 1.72); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-35, -118); ctx.lineTo(-35, -30); ctx.stroke();
  if (o.arm) { // aage badha hua haath (panel kholna / ishara)
    ctx.strokeStyle = col; ctx.lineWidth = 17;
    ctx.beginPath(); ctx.moveTo(28, -104); ctx.lineTo(96, -64); ctx.stroke();
    ctx.fillStyle = col; D.circ(ctx, 100, -62, 13); ctx.fill();
    ctx.strokeStyle = rim; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(34, -112); ctx.lineTo(96, -74); ctx.stroke();
  }
  if (o.armUp) { // upar ki taraf badha haath (panel ka upari kinara pakadna)
    ctx.strokeStyle = col; ctx.lineWidth = 17;
    ctx.beginPath(); ctx.moveTo(28, -106); ctx.lineTo(100, -148); ctx.stroke();
    ctx.fillStyle = col; D.circ(ctx, 104, -150, 13); ctx.fill();
    ctx.strokeStyle = rim; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(34, -114); ctx.lineTo(100, -156); ctx.stroke();
  }
  ctx.restore();
}
// Police officer = silFig + peaked cap
function silOfficer(x, y, s, o = {}) {
  silFig(x, y, s, o);
  ctx.save(); ctx.translate(x, y + (o.bob || 0)); ctx.scale(s, s);
  ctx.fillStyle = o.col || '#0c0a08';
  D.rr(ctx, -25, -182, 50, 24, 9); ctx.fill();
  ctx.fillRect(-36, -162, 72, 9);
  ctx.strokeStyle = o.rim || 'rgba(255,220,160,0.55)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-34, -160); ctx.lineTo(34, -160); ctx.stroke();
  ctx.restore();
}
// Sikke: ek coin + kataar
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

// ---------------- PETROL PUMP WORLD ----------------
const GY = 2400;
// Dusk aakash: upar gehra neela, neeche sunehra horizon, pahaadiyaan + sheher ki chamak
function duskSky(gy, f = 0) {
  ctx.fillStyle = '#0a0e24'; ctx.fillRect(-900, -2600, 3960, 2000); // gradient ke upar ka aakash (wide shots me band na dikhe)
  vgrad(-600, gy + 40, [[0, '#0a0e24'], [0.42, '#251636'], [0.72, '#6e2f1d'], [1, '#c97a24']]);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 34; i++) { const sx = -600 + hash(i * 1.9) * 3300, sy = -500 + hash(i * 2.7) * 1050; ctx.globalAlpha = 0.25 + hash(i * 3.3) * 0.5; D.circ(ctx, sx, sy, 2 + hash(i) * 2.2); ctx.fill(); }
  ctx.globalAlpha = 1;
  lampPool(1620, gy - 260, 620, 0.22); // doobta suraj ka glow
  ctx.fillStyle = '#f7b955'; D.circ(ctx, 1620, gy - 210, 62); ctx.fill();
  // door ki pahaadiyaan (do parat)
  ctx.fillStyle = '#1c1226';
  ctx.beginPath(); ctx.moveTo(-800, gy);
  for (let x = -800; x <= 2960; x += 235) ctx.lineTo(x, gy - 210 - hash(x * 0.37) * 190);
  ctx.lineTo(2960, gy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#120b1a';
  ctx.beginPath(); ctx.moveTo(-800, gy);
  for (let x = -800; x <= 2960; x += 310) ctx.lineTo(x, gy - 90 - hash(x * 0.53 + 4) * 110);
  ctx.lineTo(2960, gy); ctx.closePath(); ctx.fill();
  // sheher ki battiyaan pahaadiyon ke neeche
  ctx.fillStyle = 'rgba(255,205,110,0.75)';
  for (let i = 0; i < 22; i++) { const bx = -500 + hash(i * 4.1) * 3100, by = gy - 60 - hash(i * 6.7) * 90; if (hash(i * 9.1) > 0.3) ctx.fillRect(bx, by, 7, 5); }
}
// Highway band: station ke peeche jaati sadak, guzarti headlights ki dhaariyaan
function highwayBand(gy, f) {
  ctx.fillStyle = '#171019'; ctx.fillRect(-800, gy - 130, 3760, 130);
  ctx.strokeStyle = 'rgba(255,220,150,0.25)'; ctx.lineWidth = 4; ctx.setLineDash([46, 40]);
  ctx.beginPath(); ctx.moveTo(-800, gy - 62); ctx.lineTo(2960, gy - 62); ctx.stroke(); ctx.setLineDash([]);
  for (let i = 0; i < 3; i++) {
    const dir = i % 2 ? -1 : 1;
    const hx = dir > 0 ? ((f * (9 + i * 3) + i * 1500) % 4200) - 700 : 3500 - ((f * (8 + i * 2) + i * 1200) % 4200);
    const hy = gy - 96 + (i % 2) * 44;
    lampPool(hx, hy, 90, 0.30);
    ctx.fillStyle = '#ffe9a8'; D.circ(ctx, hx - 14, hy, 6); ctx.fill(); D.circ(ctx, hx + 14, hy, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(255,233,168,0.20)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hx - dir * 30, hy); ctx.lineTo(hx - dir * 190, hy); ctx.stroke();
  }
}
// Pura station: perspective canopy + columns + 2 dispensers + price totem + geela forecourt
function stationSet(cx, gy, f, o = {}) {
  const top = gy - 1180;
  // forecourt floor
  ctx.fillStyle = '#221812'; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  ctx.fillStyle = 'rgba(255,220,150,0.09)'; ctx.fillRect(-800, gy, 3760, 12);
  // floor perspective lines — canopy ki taraf converge
  ctx.strokeStyle = 'rgba(255,205,120,0.11)'; ctx.lineWidth = 5;
  for (const dx of [-1500, -760, 0, 760, 1500]) { ctx.beginPath(); ctx.moveTo(cx + dx * 0.28, gy + 6); ctx.lineTo(cx + dx, 3840); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,205,120,0.07)';
  for (const fy of [gy + 190, gy + 450, gy + 800]) { ctx.beginPath(); ctx.moveTo(-800, fy); ctx.lineTo(2960, fy); ctx.stroke(); }
  // peeche ke columns (chhote, dhundhle)
  ctx.fillStyle = '#241a20';
  ctx.fillRect(cx - 505, top + 190, 30, gy - top - 190); ctx.fillRect(cx + 475, top + 190, 30, gy - top - 190);
  // dispensers
  dispenser(cx - 255, gy, 1.0, f, { litres: 8 + (f % 320) / 26 });
  dispenser(cx + 330, gy, 0.93, f, { litres: 3 + (f % 260) / 30 });
  // saamne ke columns
  for (const sgn of [-1, 1]) {
    const px = cx + sgn * 665;
    const g = ctx.createLinearGradient(px - 26, 0, px + 26, 0);
    g.addColorStop(0, '#171019'); g.addColorStop(0.5, '#3d2c26'); g.addColorStop(1, '#120c10');
    ctx.fillStyle = g; ctx.fillRect(px - 26, top + 150, 52, gy - top - 150);
    ctx.fillStyle = 'rgba(255,205,110,0.35)'; ctx.fillRect(px - 26, top + 150, 5, gy - top - 150);
    ctx.fillStyle = '#7a1620'; ctx.fillRect(px - 30, gy - 420, 60, 54);
  }
  // canopy underside (perspective: peeche sikudti hui)
  ctx.fillStyle = '#2c1e16';
  ctx.beginPath(); ctx.moveTo(cx - 850, top + 52); ctx.lineTo(cx + 850, top + 52); ctx.lineTo(cx + 700, top + 196); ctx.lineTo(cx - 700, top + 196); ctx.closePath(); ctx.fill();
  const ug = ctx.createLinearGradient(0, top + 52, 0, top + 196);
  ug.addColorStop(0, 'rgba(255,190,90,0.20)'); ug.addColorStop(1, 'rgba(255,190,90,0)');
  ctx.fillStyle = ug; ctx.fillRect(cx - 850, top + 52, 1700, 144);
  // underside light strips
  ctx.fillStyle = 'rgba(255,226,160,0.85)';
  for (const lx of [-520, 0, 520]) ctx.fillRect(cx + lx - 130, top + 128, 260, 13);
  lampPool(cx - 520, top + 210, 260, 0.20); lampPool(cx, top + 210, 300, 0.22); lampPool(cx + 520, top + 210, 260, 0.20);
  // roof slab (upar ki satah, halki dikhti hui)
  ctx.fillStyle = '#4a3423';
  ctx.beginPath(); ctx.moveTo(cx - 850, top - 42); ctx.lineTo(cx - 700, top - 168); ctx.lineTo(cx + 700, top - 168); ctx.lineTo(cx + 850, top - 42); ctx.closePath(); ctx.fill();
  // fascia band + naam + bulb kataar
  ctx.fillStyle = '#7a1620'; ctx.fillRect(cx - 850, top - 42, 1700, 94);
  ctx.fillStyle = 'rgba(255,255,255,0.13)'; ctx.fillRect(cx - 850, top - 42, 1700, 16);
  ctx.fillStyle = '#ffd94d';
  const nb = 22;
  for (let i = 0; i <= nb; i++) { const bx = cx - 850 + 22 + (1700 - 44) * i / nb; const fl = 0.55 + 0.45 * Math.sin(f * 0.35 + i * 1.3); ctx.globalAlpha = fl; D.circ(ctx, bx, top - 30, 7); ctx.fill(); D.circ(ctx, bx, top + 40, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
  textF('PETROL  •  DIESEL', cx, top + 6, 62, '#ffe9a8', 900);
  // price totem (daaye kinare)
  if (o.totem !== false) {
    const tx = cx + 560, tw = 268;
    ctx.fillStyle = '#10131a'; ctx.fillRect(tx - 14, gy - 560, 28, 560);
    lampPool(tx, gy - 800, 300, 0.16);
    ctx.fillStyle = '#1d2735'; D.rr(ctx, tx - tw / 2, gy - 1090, tw, 540, 12); ctx.fill(); ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 5; ctx.stroke();
    text('PETROL', tx, gy - 1018, 40, '#ffd94d');
    text('₹106.31', tx, gy - 952, 46, '#f5edd8');
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(tx - tw / 2 + 22, gy - 902, tw - 44, 4);
    text('DIESEL', tx, gy - 842, 40, '#ffd94d');
    text('₹92.47', tx, gy - 776, 46, '#f5edd8');
    text('24 × 7', tx, gy - 668, 36, '#8ef0b3');
  }
  // roshni ki reflections farsh par
  wetReflect(cx - 255, gy + 8, 330, 250, 0.13);
  wetReflect(cx + 330, gy + 8, 300, 230, 0.11);
  wetReflect(cx, gy + 8, 900, 300, 0.07);
}
// LCD meter screen (chamakti hui, scanlines ke saath)
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
// Dispenser machine: tall body + glowing meter + hose + nozzle. origin = ground center.
function dispenser(x, gy, s, f, o = {}) {
  const litres = o.litres != null ? o.litres : 0;
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  D.softShadow(ctx, 0, 10, 185, 20, 0.32);
  // side face (3D depth — daaye taraf gehri parat)
  ctx.fillStyle = '#4c3a26';
  D.poly(ctx, [[130, -690], [188, -640], [188, 0], [130, 0]]); ctx.fill();
  ctx.fillStyle = 'rgba(255,205,110,0.16)'; ctx.fillRect(130, -690, 7, 690);
  // main body
  const bg = ctx.createLinearGradient(-130, 0, 130, 0);
  bg.addColorStop(0, '#5d4a30'); bg.addColorStop(0.45, '#8a6c42'); bg.addColorStop(1, '#54402a');
  ctx.fillStyle = bg; D.rr(ctx, -130, -700, 260, 700, 18); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  // brand band
  ctx.fillStyle = '#c62828'; ctx.fillRect(-130, -700, 260, 84);
  ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(-130, -700, 260, 14);
  text('PETROL', 0, -656, 46, '#ffffff');
  // meter screen
  lcdScreen(0, -500, 196, 158, litres.toFixed(2), 'LITRE', '#39e6c3', 56);
  // rupaye wali chhoti screen
  ctx.fillStyle = '#0a1410'; D.rr(ctx, -92, -398, 184, 74, 8); ctx.fill(); ctx.strokeStyle = '#3f4a44'; ctx.lineWidth = 4; ctx.stroke();
  text('₹' + (litres * 106.31).toFixed(2), 0, -360, 38, '#ffd94d');
  // neeche panel + seams + vents
  ctx.fillStyle = 'rgba(0,0,0,0.16)'; D.rr(ctx, -98, -290, 196, 240, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(20,14,8,0.55)'; ctx.lineWidth = 3.5;
  for (let vy = -252; vy <= -92; vy += 32) { ctx.beginPath(); ctx.moveTo(-78, vy); ctx.lineTo(78, vy); ctx.stroke(); }
  if (o.redGlow) { lampPool(0, -170, 190, 0.4 * o.redGlow, '255,60,40'); }
  // hose (bayein taraf latakti hui curve) + nozzle holster
  ctx.strokeStyle = '#14161a'; ctx.lineWidth = 17; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-130, -560); ctx.bezierCurveTo(-228, -500, -216, -280, -192, -208); ctx.stroke();
  ctx.save(); ctx.translate(-192, -190); ctx.rotate(0.5);
  ctx.fillStyle = '#26221f'; D.rr(ctx, -17, -58, 34, 92, 9); ctx.fill();
  ctx.fillStyle = '#8b93a1'; ctx.fillRect(-7, 30, 14, 44);
  ctx.restore();
  ctx.restore();
}
// Machine ka front panel (P2b/P3a ke liye bada) — center (cx, cy), w 760 h 1500
function panelFront(cx, cy, f, o = {}) {
  ctx.save(); ctx.translate(cx, cy);
  const bg = ctx.createLinearGradient(-380, 0, 380, 0);
  bg.addColorStop(0, '#4c3a26'); bg.addColorStop(0.5, '#7d5f38'); bg.addColorStop(1, '#453322');
  ctx.fillStyle = bg; D.rr(ctx, -380, -750, 760, 1500, 22); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 8; ctx.stroke();
  ctx.fillStyle = '#c62828'; ctx.fillRect(-380, -750, 760, 110);
  text('PETROL', 0, -694, 62, '#ffffff');
  // meter screen upar
  lcdScreen(0, -430, 580, 300, (o.litres != null ? o.litres : 1.0).toFixed(2), 'LITRE', '#39e6c3', 130);
  // beech ki seam — andar se laal roshni ris-ti hui (raaz)
  const pulse = 0.55 + 0.45 * Math.sin(f * 0.14);
  ctx.fillStyle = `rgba(255,64,40,${0.25 + 0.45 * pulse * (o.red || 0)})`; ctx.fillRect(-330, -238, 660, 10);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-330, -252, 660, 5); ctx.fillRect(-330, -228, 660, 5);
  // fly-in target: gehra slot/vent (camera iske andar ghusega)
  ctx.fillStyle = '#07090e'; D.rr(ctx, -215, -80, 430, 300, 14); ctx.fill();
  ctx.strokeStyle = '#8b93a1'; ctx.lineWidth = 6; ctx.stroke();
  const sgr = ctx.createLinearGradient(0, -80, 0, 220);
  sgr.addColorStop(0, 'rgba(0,0,0,0)'); sgr.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = sgr; ctx.fillRect(-215, -80, 430, 300);
  ctx.fillStyle = `rgba(255,64,40,${0.04 + 0.07 * pulse * (o.red || 0)})`; ctx.fillRect(-215, 178, 430, 42);
  ctx.fillStyle = 'rgba(140,170,200,0.20)';
  for (let vy = -44; vy <= 176; vy += 44) ctx.fillRect(-185, vy, 370, 15);
  // neeche vents + bolts
  ctx.strokeStyle = 'rgba(20,14,8,0.55)'; ctx.lineWidth = 5;
  for (let vy = 300; vy <= 560; vy += 52) { ctx.beginPath(); ctx.moveTo(-280, vy); ctx.lineTo(280, vy); ctx.stroke(); }
  ctx.fillStyle = '#2c2115';
  for (const [bx, by] of [[-330, -690], [330, -690], [-330, 690], [330, 690]]) { D.circ(ctx, bx, by, 15); ctx.fill(); ctx.fillStyle = '#57432a'; D.circ(ctx, bx, by, 7); ctx.fill(); ctx.fillStyle = '#2c2115'; }
  if (o.qmark) { // raaz wala chamakta "?"
    const qa = 0.6 + 0.4 * Math.sin(f * 0.11);
    lampPool(0, 480, 210, 0.30 * qa);
    ctx.save(); ctx.globalAlpha = qa; text('?', 0, 478, 190, '#ffc72c'); ctx.restore();
  }
  ctx.restore();
}
// Pipe jisme amber petrol behta hai (animated dashes)
function pipeFlow(x0, y, x1, f, r = 26) {
  ctx.fillStyle = '#2c3444'; D.rr(ctx, x0, y - r, x1 - x0, r * 2, r); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.save(); ctx.beginPath(); D.rr(ctx, x0 + 6, y - r * 0.46, x1 - x0 - 12, r * 0.92, r * 0.46); ctx.clip();
  ctx.fillStyle = '#8a4d12'; ctx.fillRect(x0, y - r * 0.46, x1 - x0, r * 0.92);
  ctx.fillStyle = '#ffb84d';
  const off = (f * 7) % 74;
  for (let x = x0 + 16 - off; x < x1 - 24; x += 74) ctx.fillRect(x, y - r * 0.24, 38, r * 0.48);
  ctx.fillStyle = 'rgba(255,220,150,0.5)'; ctx.fillRect(x0, y - r * 0.46, x1 - x0, 4);
  ctx.restore();
  // flange joints
  ctx.fillStyle = '#3d4759';
  for (const fx of [x0 + 8, x1 - 8]) { ctx.fillRect(fx - 9, y - r - 8, 18, r * 2 + 16); }
}
// Ghumta hua naapi gear
function gear(x, y, r, rot, col = '#7d8798') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = col;
  for (let i = 0; i < 12; i++) {
    ctx.save(); ctx.rotate(i * Math.PI / 6); ctx.fillRect(-r * 0.11, -r * 1.16, r * 0.22, r * 0.34); ctx.restore();
  }
  D.circ(ctx, 0, 0, r * 0.92); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.strokeStyle = 'rgba(20,22,28,0.6)'; ctx.lineWidth = r * 0.13; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r * 0.72, Math.sin(a) * r * 0.72); ctx.stroke(); }
  ctx.fillStyle = '#3a4356'; D.circ(ctx, 0, 0, r * 0.3); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}
// PCB board: traces, chips, pulsing nodes, khaali chip-slot
function pcbDraw(x, y, w, h, f, o = {}) {
  ctx.save(); ctx.translate(x, y);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, '#175c33'); g.addColorStop(1, '#0f4423');
  ctx.fillStyle = g; D.rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.fill(); ctx.strokeStyle = '#0a2e18'; ctx.lineWidth = 6; ctx.stroke();
  // traces (sunehri right-angle lakeerein)
  ctx.strokeStyle = 'rgba(242,193,78,0.65)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const ty = -h / 2 + 52 + i * (h - 104) / 6, bend = (hash(i * 3.7) - 0.5) * w * 0.4;
    ctx.beginPath(); ctx.moveTo(-w / 2 + 26, ty); ctx.lineTo(bend, ty); ctx.lineTo(bend, ty + 34); ctx.lineTo(w / 2 - 30, ty + 34); ctx.stroke();
    ctx.fillStyle = 'rgba(242,193,78,0.8)'; D.circ(ctx, w / 2 - 30, ty + 34, 7); ctx.fill();
  }
  // kaale IC chips
  for (const [ix, iy, iw] of [[-w * 0.22, -h * 0.26, 120], [w * 0.16, -h * 0.3, 96], [-w * 0.26, h * 0.08, 88]]) {
    ctx.fillStyle = '#101216'; D.rr(ctx, ix - iw / 2, iy - 30, iw, 60, 6); ctx.fill(); ctx.strokeStyle = '#3a3f47'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = '#8b93a1'; ctx.lineWidth = 3;
    for (let p = 0; p < 4; p++) { const px = ix - iw / 2 + 14 + p * (iw - 28) / 3; ctx.beginPath(); ctx.moveTo(px, iy - 40); ctx.lineTo(px, iy - 30); ctx.moveTo(px, iy + 30); ctx.lineTo(px, iy + 40); ctx.stroke(); }
  }
  // pulsing node
  const pl = 0.5 + 0.5 * Math.sin(f * 0.3);
  ctx.fillStyle = `rgba(120,255,170,${0.4 + 0.6 * pl})`; D.circ(ctx, w * 0.3, h * 0.16, 9 + pl * 4); ctx.fill();
  // KHAALI CHIP SLOT (dashed amber) — chip yahin lagti hai
  ctx.save();
  if (o.slotGlow) lampPool(0, h * 0.31, 170, 0.35 * o.slotGlow, '255,60,40');
  ctx.strokeStyle = '#ffb84d'; ctx.lineWidth = 5; ctx.setLineDash([15, 10]);
  D.rr(ctx, -82, h * 0.31 - 56, 164, 112, 8); ctx.stroke(); ctx.setLineDash([]);
  text('CHIP SLOT', 0, h * 0.31 + 92, 28, '#ffb84d');
  ctx.restore();
  ctx.restore();
}
// Machine ka ANDAR ka set: cavity + pipes + PCB + gears + taar
function interiorSet(cx, cy, f, o = {}) {
  ctx.save(); ctx.translate(cx, cy);
  // cavity walls
  ctx.fillStyle = '#10131b'; D.rr(ctx, -540, -780, 1080, 1560, 18); ctx.fill();
  ctx.strokeStyle = '#3a4356'; ctx.lineWidth = 9; ctx.stroke();
  const ig = ctx.createLinearGradient(0, -780, 0, 780);
  ig.addColorStop(0, 'rgba(255,190,90,0.10)'); ig.addColorStop(0.5, 'rgba(0,0,0,0)'); ig.addColorStop(1, 'rgba(0,0,0,0.30)');
  ctx.fillStyle = ig; D.rr(ctx, -540, -780, 1080, 1560, 18); ctx.fill();
  ctx.fillStyle = '#39445c';
  for (const [bx, by] of [[-492, -728], [492, -728], [-492, 728], [492, 728]]) { D.circ(ctx, bx, by, 14); ctx.fill(); ctx.fillStyle = '#59667d'; D.circ(ctx, bx, by, 6); ctx.fill(); ctx.fillStyle = '#39445c'; }
  // upar ki pipe (petrol behta hua)
  pipeFlow(-480, -580, 480, f, 30);
  // neeche ki pipe
  pipeFlow(-480, 600, 480, f + 30, 26);
  // side vertical pipe (daaye)
  ctx.fillStyle = '#2c3444'; D.rr(ctx, 428, -580, 52, 1180, 24); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#ffb84d';
  const voff = (f * 6) % 92;
  for (let vy = -540 - voff; vy < 580; vy += 92) ctx.fillRect(446, vy, 16, 44);
  // PCB bayein
  pcbDraw(-225, -40, 440, 560, f, o);
  // gears daaye (naapi wala bada + chhota)
  gear(268, -300, 118, f * 0.045);
  gear(118, -128, 66, -f * 0.08, '#66707f');
  // motor block gear ke neeche
  ctx.fillStyle = '#39445c'; D.rr(ctx, 168, -60, 210, 130, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(184, -44, 178, 16);
  // taar: PCB se motor tak
  ctx.strokeStyle = '#c62828'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-30, 120); ctx.bezierCurveTo(120, 210, 200, 130, 250, 74); ctx.stroke();
  ctx.strokeStyle = '#2456a8';
  ctx.beginPath(); ctx.moveTo(-30, 160); ctx.bezierCurveTo(130, 260, 220, 180, 268, 74); ctx.stroke();
  // valve wheel neeche-daaye
  ctx.save(); ctx.translate(330, 380); ctx.rotate(f * 0.02);
  ctx.strokeStyle = '#a83a32'; ctx.lineWidth = 13;
  D.circ(ctx, 0, 0, 62); ctx.stroke();
  for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(-Math.cos(a) * 62, -Math.sin(a) * 62); ctx.lineTo(Math.cos(a) * 62, Math.sin(a) * 62); ctx.stroke(); }
  ctx.restore();
  // kaam ki roshni upar se
  lampPool(300, -680, 320, 0.16);
  ctx.fillStyle = '#ffe9a8'; D.circ(ctx, 300, -692, 11); ctx.fill();
  if (o.red) lampPool(-225, 160, 330, 0.30 * o.red, '255,60,40');
  ctx.restore();
}
// Macro chip: kaala square, sunehre pins, beech me die, kone me LED
function chipDraw(x, y, w, f, ledOn) {
  ctx.save(); ctx.translate(x, y);
  const h = w * 0.8;
  D.softShadow(ctx, 6, h * 0.58, w * 0.52, 16, 0.35);
  // pins (chaaron taraf sunehre)
  ctx.fillStyle = '#d9a52e';
  const np = 7;
  for (let i = 0; i < np; i++) { const px = -w / 2 + 20 + i * (w - 40) / (np - 1); ctx.fillRect(px - 9, -h / 2 - 16, 18, 18); ctx.fillRect(px - 9, h / 2 - 2, 18, 18); }
  for (let i = 0; i < 5; i++) { const py = -h / 2 + 18 + i * (h - 36) / 4; ctx.fillRect(-w / 2 - 16, py - 9, 18, 18); ctx.fillRect(w / 2 - 2, py - 9, 18, 18); }
  // body
  const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  g.addColorStop(0, '#1d2733'); g.addColorStop(1, '#0c0f14');
  ctx.fillStyle = g; D.rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.fill(); ctx.strokeStyle = '#3a4356'; ctx.lineWidth = 5; ctx.stroke();
  // traces
  ctx.strokeStyle = 'rgba(242,193,78,0.55)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-w * 0.36, -h * 0.28); ctx.lineTo(-w * 0.1, -h * 0.28); ctx.lineTo(-w * 0.1, -h * 0.05); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w * 0.34, h * 0.3); ctx.lineTo(w * 0.08, h * 0.3); ctx.lineTo(w * 0.08, h * 0.08); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-w * 0.36, h * 0.32); ctx.lineTo(-w * 0.36, h * 0.05); ctx.stroke();
  // center die
  ctx.fillStyle = '#131a24'; D.rr(ctx, -w * 0.17, -h * 0.21, w * 0.34, h * 0.42, 8); ctx.fill(); ctx.strokeStyle = '#57432a'; ctx.lineWidth = 3.5; ctx.stroke();
  text('CHIP', 0, 2, w * 0.11, '#ffb84d');
  // LED kone me
  if (ledOn) lampPool(w * 0.36, -h * 0.3, 90, 0.65, '255,60,40');
  ctx.fillStyle = ledOn ? '#ff4444' : '#3a1512'; D.circ(ctx, w * 0.36, -h * 0.3, 13); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
}
// Remote: kaala dabba, laal bada button, IR waves (press par)
function remoteDraw(x, y, s, press, f) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 4, 190, 95, 14, 0.3);
  ctx.fillStyle = '#14161c'; D.rr(ctx, -78, -190, 156, 380, 34); ctx.fill(); ctx.strokeStyle = '#3a3f47'; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(-58, -170, 20, 340);
  // IR emitter upar
  ctx.fillStyle = press ? '#ff5545' : '#5a2320'; D.circ(ctx, 0, -178, 13); ctx.fill();
  if (press) lampPool(0, -185, 90, 0.5, '255,60,40');
  // screen
  ctx.fillStyle = '#0a1410'; D.rr(ctx, -48, -140, 96, 62, 8); ctx.fill();
  text('ON', 0, -108, 30, press ? '#39e6c3' : '#2b5a48');
  // bada laal button (press par dabta hai)
  const bp = press ? 0.86 : 1;
  ctx.fillStyle = '#8e1f1f'; D.circ(ctx, 0, -18, 44 * bp + 6); ctx.fill();
  ctx.fillStyle = '#e53935'; D.circ(ctx, 0, -22, 42 * bp); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; D.circ(ctx, -13, -36, 11 * bp); ctx.fill();
  // chhote buttons
  ctx.fillStyle = '#39445c';
  D.circ(ctx, -34, 62, 17); ctx.fill(); D.circ(ctx, 34, 62, 17); ctx.fill(); D.circ(ctx, 0, 122, 17); ctx.fill();
  ctx.restore();
  // IR waves (press par, remote ke upar se nikalti)
  if (press) {
    ctx.strokeStyle = 'rgba(255,70,50,0.75)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const rr2 = 44 + i * 40 + Math.sin(f * 0.6) * 6;
      ctx.beginPath(); ctx.arc(x, y - 190 * s, rr2, Math.PI * 1.25, Math.PI * 1.75); ctx.stroke();
    }
  }
}
// Silhouette hatheli (upar ki taraf khuli) — macro shots ke liye stylised
function palmSil(x, y, s, flip = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * flip, s);
  const col = '#0b0908';
  ctx.fillStyle = col;
  // ungliyaan (peeche, upar nikli hui)
  const fin = [[-168, -268, 66, 235, -0.10], [-86, -308, 70, 275, -0.03], [2, -318, 70, 285, 0.03], [90, -282, 66, 245, 0.10]];
  for (const [fx, fy, fw, fh, fr] of fin) { ctx.save(); ctx.translate(fx, fy + fh / 2); ctx.rotate(fr); D.rr(ctx, -fw / 2, -fh / 2, fw, fh, fw / 2); ctx.fill(); ctx.restore(); }
  // angootha (side me)
  ctx.save(); ctx.translate(196, -60); ctx.rotate(-0.62); D.rr(ctx, -38, -110, 76, 220, 38); ctx.fill(); ctx.restore();
  // hatheli
  D.ell(ctx, 0, 30, 225, 200); ctx.fill();
  // kalaai neeche
  D.rr(ctx, -95, 150, 190, 340, 70); ctx.fill();
  // rim light — daaye kinare par sunehri lakeer
  ctx.strokeStyle = 'rgba(255,220,160,0.4)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 30, 218, -0.5, 0.75); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(120, -330); ctx.lineTo(128, -120); ctx.stroke();
  ctx.restore();
}
// Car ka side profile (silhouette-ish, rim-lit) — origin ground center
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
  // khidkiyaan
  ctx.fillStyle = '#0a1420';
  ctx.beginPath(); ctx.moveTo(-268, -540); ctx.lineTo(-60, -540); ctx.lineTo(-60, -360); ctx.lineTo(-300, -360); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-30, -540); ctx.lineTo(140, -540); ctx.lineTo(215, -360); ctx.lineTo(-30, -360); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(160,200,235,0.35)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-268, -540); ctx.lineTo(-60, -540); ctx.stroke();
  // upari rim light
  ctx.strokeStyle = 'rgba(255,205,110,0.5)'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-360, -330); ctx.quadraticCurveTo(-300, -560, -220, -566); ctx.lineTo(150, -566); ctx.stroke();
  // darwaze ki lakeer + handle
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-40, -350); ctx.lineTo(-40, -80); ctx.stroke();
  ctx.fillStyle = 'rgba(200,220,240,0.5)'; ctx.fillRect(-120, -320, 52, 10);
  // TANK FLAP (peeche, dayein) — yahin nozzle lagega
  ctx.strokeStyle = '#ffb84d'; ctx.lineWidth = 5;
  D.circ(ctx, 330, -265, 36); ctx.stroke();
  ctx.fillStyle = 'rgba(255,184,77,0.15)'; D.circ(ctx, 330, -265, 36); ctx.fill();
  // pahiye
  for (const wx of [-300, 300]) {
    ctx.fillStyle = '#0a0c10'; D.circ(ctx, wx, -62, 80); ctx.fill(); ctx.strokeStyle = '#39445c'; ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = '#59667d'; D.circ(ctx, wx, -62, 30); ctx.fill();
  }
  // headlight glow (saamne = baayein)
  lampPool(-468, -215, 110, 0.3);
  ctx.fillStyle = '#ffe9a8'; D.ell(ctx, -466, -215, 10, 17); ctx.fill();
  ctx.restore();
}
// Police jeep side profile (silhouette, rim-lit)
function jeepSide(x, gy, s) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  D.softShadow(ctx, 0, 12, 480, 24, 0.38);
  ctx.fillStyle = '#101820';
  ctx.beginPath();
  ctx.moveTo(-480, -70); ctx.lineTo(-480, -300); ctx.lineTo(-330, -308);
  ctx.lineTo(-290, -480); ctx.lineTo(240, -480); ctx.lineTo(290, -308);
  ctx.lineTo(480, -300); ctx.lineTo(480, -70); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  // khidkiyaan
  ctx.fillStyle = '#274b63';
  ctx.fillRect(-268, -452, 200, 128); ctx.fillRect(-48, -452, 190, 128); ctx.fillRect(162, -452, 62, 128);
  ctx.strokeStyle = 'rgba(160,200,235,0.3)'; ctx.lineWidth = 4; ctx.strokeRect(-268, -452, 200, 128);
  // POLICE band + laal-neeli batti
  ctx.fillStyle = '#dfe7ee'; ctx.fillRect(-480, -268, 960, 44);
  text('POLICE', 0, -245, 36, '#1c2733');
  ctx.fillStyle = '#e53935'; D.rr(ctx, -70, -516, 62, 34, 8); ctx.fill();
  ctx.fillStyle = '#2456a8'; D.rr(ctx, 8, -516, 62, 34, 8); ctx.fill();
  // spare pahiya peeche
  ctx.fillStyle = '#0a0c10'; D.circ(ctx, 505, -250, 66); ctx.fill(); ctx.strokeStyle = '#39445c'; ctx.lineWidth = 6; ctx.stroke();
  // pahiye
  for (const wx of [-310, 310]) {
    ctx.fillStyle = '#0a0c10'; D.circ(ctx, wx, -70, 86); ctx.fill(); ctx.strokeStyle = '#39445c'; ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = '#59667d'; D.circ(ctx, wx, -70, 32); ctx.fill();
  }
  // headlight (saamne = baayein) + beam
  lampPool(-478, -225, 150, 0.35);
  ctx.fillStyle = '#ffe9a8'; D.ell(ctx, -476, -225, 11, 19); ctx.fill();
  ctx.fillStyle = 'rgba(255,233,168,0.10)';
  ctx.beginPath(); ctx.moveTo(-480, -245); ctx.lineTo(-900, -160); ctx.lineTo(-900, -60); ctx.lineTo(-480, -195); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// Sarkari mohor: gol sunehra seal, beech me taara
function mohorSeal(x, y, r, f, glint = 0) {
  ctx.save(); ctx.translate(x, y);
  lampPool(0, 0, r * 1.7, 0.22);
  ctx.fillStyle = '#e8b64c'; D.circ(ctx, 0, 0, r); ctx.fill();
  ctx.strokeStyle = '#8a5f10'; ctx.lineWidth = 6; ctx.stroke();
  ctx.strokeStyle = '#8a5f10'; ctx.lineWidth = 3.5; D.circ(ctx, 0, 0, r * 0.78); ctx.stroke();
  // taara (5-point star path)
  ctx.fillStyle = '#8a5f10';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * 0.24 : r * 0.52;
    const px = Math.cos(a) * rad, py = Math.sin(a) * rad;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath(); ctx.fill();
  // kinare ke chhote bindu
  ctx.fillStyle = '#8a5f10';
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; D.circ(ctx, Math.cos(a) * r * 0.88, Math.sin(a) * r * 0.88, 3.2); ctx.fill(); }
  if (glint > 0) { D.drawSparkle(ctx, r * 0.55, -r * 0.6, 46 * glint, 0.95); D.drawSparkle(ctx, -r * 0.4, -r * 0.2, 26 * glint, 0.7); }
  ctx.restore();
}
// 5-litre naap (measure can): steel body, funnel, handle, gauge strip, mohor. origin = base center.
function measureCan(x, baseY, s, f, o = {}) {
  ctx.save(); ctx.translate(x, baseY); ctx.scale(s, s);
  D.softShadow(ctx, 0, 10, 200, 20, 0.32);
  // handle (daaye taraf)
  ctx.strokeStyle = '#39434f'; ctx.lineWidth = 17; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(148, -470); ctx.bezierCurveTo(238, -420, 238, -240, 182, -150); ctx.stroke();
  ctx.strokeStyle = 'rgba(230,240,248,0.35)'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(152, -462); ctx.bezierCurveTo(224, -414, 226, -262, 184, -168); ctx.stroke();
  // body (trapezoid, steel gradient)
  const g = ctx.createLinearGradient(-190, 0, 190, 0);
  g.addColorStop(0, '#5d6773'); g.addColorStop(0.35, '#aeb9c6'); g.addColorStop(0.62, '#8b96a4'); g.addColorStop(1, '#4c555f');
  ctx.fillStyle = g;
  D.poly(ctx, [[-150, -560], [150, -560], [192, 0], [-192, 0]]); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.20)'; ctx.fillRect(-118, -548, 34, 536);
  // funnel upar
  const g2 = ctx.createLinearGradient(-80, 0, 80, 0);
  g2.addColorStop(0, '#6b7684'); g2.addColorStop(0.5, '#c3cedb'); g2.addColorStop(1, '#59636f');
  ctx.fillStyle = g2;
  D.poly(ctx, [[-150, -560], [-72, -696], [72, -696], [150, -560]]); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.fillStyle = '#232a33'; D.ell(ctx, 0, -696, 74, 15); ctx.fill();
  ctx.strokeStyle = '#aeb9c6'; ctx.lineWidth = 4; D.ell(ctx, 0, -696, 74, 15); ctx.stroke();
  if (o.fillGlow) lampPool(0, -690, 120, 0.35 * o.fillGlow);
  // gauge strip (daaye hisse me) — petrol ka level
  ctx.fillStyle = '#20262e'; D.rr(ctx, 96, -512, 56, 400, 8); ctx.fill(); ctx.strokeStyle = 'rgba(10,12,16,0.7)'; ctx.lineWidth = 3.5; ctx.stroke();
  const fl = D.clamp(o.fill || 0, 0, 1);
  if (fl > 0) { ctx.fillStyle = '#f0a832'; ctx.fillRect(102, -118 - 388 * fl + 6, 44, 388 * fl); }
  ctx.strokeStyle = 'rgba(240,246,250,0.75)'; ctx.lineWidth = 3;
  for (let i = 0; i <= 4; i++) { const my = -118 - i * 97; ctx.beginPath(); ctx.moveTo(96, my); ctx.lineTo(116, my); ctx.stroke(); }
  // '5 LITRE' bada text beech me (gauge strip se takraye nahi — thoda bayein)
  text('5 LITRE', -32, -300, 55, '#26303c');
  text('SARKARI NAAP', -32, -240, 25, 'rgba(38,48,60,0.75)');
  // mohor bayein-neeche
  mohorSeal(-88, -120, 62, f, o.glint || 0);
  ctx.restore();
}
// Top-down naksha set: zameen ka blob, sadkein, pump dots (waves se jalte hue)
const MAP_ELL = [[1080, 1520, 560, 660], [760, 1180, 330, 300], [1420, 1220, 320, 330], [820, 1900, 360, 300], [1360, 1880, 380, 320]];
const MAP_DOTS = (() => {
  const pts = [];
  for (let i = 0; i < 260 && pts.length < 92; i++) {
    const px = 480 + hash(i * 3.13) * 1200, py = 760 + hash(i * 5.71) * 1480;
    if (MAP_ELL.some(([ex, ey, rx, ry]) => ((px - ex) / rx) ** 2 + ((py - ey) / ry) ** 2 < 0.92)) pts.push([px, py]);
  }
  return pts;
})();
function mapSet(f, waveR, o = {}) {
  // zameen (overlapping ellipses = ek blob)
  ctx.fillStyle = '#14202b';
  for (const [ex, ey, rx, ry] of MAP_ELL) { D.ell(ctx, ex, ey, rx, ry); ctx.fill(); }
  ctx.strokeStyle = 'rgba(120,190,220,0.35)'; ctx.lineWidth = 5;
  for (const [ex, ey, rx, ry] of MAP_ELL) { D.ell(ctx, ex, ey, rx, ry); ctx.stroke(); }
  // sadkein (curved)
  ctx.strokeStyle = 'rgba(230,200,130,0.30)'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(560, 2050); ctx.bezierCurveTo(850, 1600, 1000, 1500, 1080, 1520); ctx.bezierCurveTo(1250, 1560, 1450, 1200, 1620, 980); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(620, 1050); ctx.bezierCurveTo(900, 1250, 1000, 1400, 1080, 1520); ctx.bezierCurveTo(1180, 1680, 1300, 1950, 1560, 2080); ctx.stroke();
  ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(230,200,130,0.18)';
  ctx.beginPath(); ctx.moveTo(700, 1750); ctx.bezierCurveTo(950, 1650, 1250, 1700, 1500, 1500); ctx.stroke();
  // origin pump (beech wala, bada)
  lampPool(1080, 1520, 130, 0.5);
  ctx.fillStyle = '#ffd94d'; D.circ(ctx, 1080, 1520, 17); ctx.fill();
  ctx.strokeStyle = '#8a5f10'; ctx.lineWidth = 4; ctx.stroke();
  // lehren (expanding rings)
  for (let k = 0; k < 3; k++) {
    const rr3 = waveR - k * 300;
    if (rr3 > 20) { ctx.strokeStyle = `rgba(255,150,80,${0.5 - k * 0.13})`; ctx.lineWidth = 7; D.circ(ctx, 1080, 1520, rr3); ctx.stroke(); }
  }
  // pump dots — wave ke andar wale jalte hain
  let lit = 0;
  for (const [px, py] of MAP_DOTS) {
    const d = Math.hypot(px - 1080, py - 1520);
    const on = d < waveR;
    if (on) lit++;
    const near = on && Math.abs(d - waveR) < 130;
    ctx.fillStyle = on ? (near ? '#ffe9a8' : '#ffb84d') : 'rgba(150,170,190,0.35)';
    D.circ(ctx, px, py, on ? 10 : 6); ctx.fill();
    if (near) lampPool(px, py, 44, 0.5);
  }
  return lit;
}


/* =====================================================================
   TIMING — EP-5 Petrol Pump Scam (voice_final 46.51s, TOTAL 1395 @30fps)
   S1 0 | S2 151 | S3 248 | S4 356 | S5 459 | S6 544 | S7 670 | S8 791
   S9 884 | S10 973 | S11 1084 | S12 1203 | S13 1278 | END 1395
   Har block me 2-3 sub-shots, har sub-shot ALAG camera angle.
   ===================================================================== */

// ===== P1a (0–53) S1 — TOP-DOWN: upar se tank ka dhakkan khulta hai, nozzle andar, kone me digits 1.00 tak =====
shot(0, 53, 0.3, { cx: 1080, cy: 1500, s: 1.02 }, { cx: 1080, cy: 1480, s: 1.10 }, (f, u) => {
  const lf = f - 0;
  layer(0.5, () => { // asphalt upar se
    ctx.fillStyle = '#1a1512'; ctx.fillRect(-800, -600, 3760, 4440);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < 60; i++) ctx.fillRect(-600 + hash(i * 3.3) * 3300, -400 + hash(i * 5.1) * 3400, 6, 6);
    ctx.strokeStyle = 'rgba(255,199,44,0.5)'; ctx.lineWidth = 10;
    ctx.strokeRect(430, 760, 1300, 1560);
    ctx.strokeStyle = 'rgba(245,237,216,0.28)'; ctx.lineWidth = 6;
    ctx.strokeRect(478, 808, 1204, 1464);
  });
  layer(1, () => {
    // car ki chhat/bonnet upar se (bada gol-kinare wala panel)
    const cg = ctx.createRadialGradient(1080, 1500, 200, 1080, 1500, 900);
    cg.addColorStop(0, '#33506e'); cg.addColorStop(0.7, '#22374e'); cg.addColorStop(1, '#16222f');
    ctx.fillStyle = cg; D.rr(ctx, 630, 985, 900, 1150, 190); ctx.fill();
    ctx.strokeStyle = 'rgba(160,200,235,0.4)'; ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.07)'; D.ell(ctx, 880, 1250, 260, 130); ctx.fill();
    // zameen par padi hose (upar se curve)
    ctx.strokeStyle = '#101216'; ctx.lineWidth = 34; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(1560, 700); ctx.bezierCurveTo(1380, 950, 1300, 1080, 1210, 1240); ctx.stroke();
    // tank ka munh: bahari ring + andhera gala
    ctx.fillStyle = '#0d1117'; D.circ(ctx, 1080, 1500, 178); ctx.fill();
    ctx.strokeStyle = '#59667d'; ctx.lineWidth = 12; ctx.stroke();
    ctx.fillStyle = '#05070a'; D.circ(ctx, 1080, 1500, 138); ctx.fill();
    // bhar raha petrol (amber chamak, level badhta hai)
    const fill = sstep(D.clamp((lf - 24) / 24, 0, 1));
    if (fill > 0) {
      lampPool(1080, 1500, 190, 0.35 * fill);
      ctx.fillStyle = '#c97a24'; D.circ(ctx, 1080, 1500, 46 + 84 * fill); ctx.fill();
      ctx.fillStyle = '#ffb84d'; D.circ(ctx, 1080, 1500, 26 + 52 * fill); ctx.fill();
      ctx.strokeStyle = 'rgba(255,220,150,0.6)'; ctx.lineWidth = 4;
      D.circ(ctx, 1080, 1500, 60 + 70 * fill + Math.sin(f * 0.4) * 5); ctx.stroke();
    }
    // khula hua dhakkan (side me pada, kabze se juda)
    const open = sstep(D.clamp(lf / 14, 0, 1));
    ctx.save(); ctx.translate(1080 - 150 - open * 130, 1500 - 60 - open * 90); ctx.rotate(-0.5 * open);
    ctx.fillStyle = '#2c4258'; D.circ(ctx, 0, 0, 158); ctx.fill();
    ctx.strokeStyle = '#59667d'; ctx.lineWidth = 9; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.10)'; D.circ(ctx, -40, -46, 62); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#39445c'; ctx.lineWidth = 13;
    ctx.beginPath(); ctx.moveTo(940, 1420); ctx.lineTo(800 - open * 110, 1350 - open * 80); ctx.stroke();
    // nozzle upar se andar ghusta hai
    const ins = sstep(D.clamp((lf - 10) / 16, 0, 1));
    const nx = D.lerp(1310, 1115, ins), ny = D.lerp(990, 1335, ins);
    ctx.save(); ctx.translate(nx, ny); ctx.rotate(0.62);
    ctx.fillStyle = '#1d2126'; D.rr(ctx, -40, -215, 80, 320, 30); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#8b93a1'; ctx.fillRect(-11, 92, 22, 138);
    ctx.fillStyle = '#c62828'; ctx.fillRect(-40, -150, 80, 34);
    ctx.restore();
    // kone me meter digits
    const val = D.clamp((lf - 8) / 40, 0, 1);
    lcdScreen(825, 770, 370, 210, val.toFixed(2), 'LITRE', '#39e6c3', 84);
    dust(f, 1080, 1500, 700, 8, 0.15);
  });
}, []);
// ===== P1b (53–106) S1b — SIDE: customer silhouette tank ke paas, hose dispenser se car tak, digits chalte hue =====
shot(53, 106, 0.3, { cx: 1080, cy: 1750, s: 0.76 }, { cx: 1080, cy: 1720, s: 0.84 }, (f, u) => {
  const lf = f - 53;
  layer(0.5, () => duskSky(GY, f));
  layer(0.7, () => highwayBand(GY, f));
  layer(1, () => {
    ctx.fillStyle = '#221812'; ctx.fillRect(-800, GY, 3760, 3840 - GY);
    ctx.fillStyle = 'rgba(255,220,150,0.09)'; ctx.fillRect(-800, GY, 3760, 12);
    ctx.strokeStyle = 'rgba(255,205,120,0.10)'; ctx.lineWidth = 5;
    for (const dx of [-900, 0, 900]) { ctx.beginPath(); ctx.moveTo(1080 + dx * 0.3, GY + 6); ctx.lineTo(1080 + dx, 3300); ctx.stroke(); }
    dispenser(600, GY, 1.02, f, { litres: 0.35 + D.clamp(lf / 50, 0, 1) * 0.65 });
    carSide(1240, GY, 0.92, f);
    // hose: dispenser ke daayein-neeche kinare se tank flap tak (LCD ke neeche se dhili curve — screen saaf rahe)
    ctx.strokeStyle = '#14161a'; ctx.lineWidth = 19; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(716, 2060); ctx.bezierCurveTo(980, 2280, 1200, 1990, 1520, 2130); ctx.stroke();
    ctx.save(); ctx.translate(1544, 2152); ctx.rotate(0.9);
    ctx.fillStyle = '#26221f'; D.rr(ctx, -15, -52, 30, 84, 8); ctx.fill();
    ctx.fillStyle = '#8b93a1'; ctx.fillRect(-6, 26, 12, 40);
    ctx.restore();
    wetReflect(1240, GY + 8, 700, 240, 0.10);
    // customer silhouette — tank ki taraf dekhta hua
    silFig(1420, GY, 1.55, { bob: Math.sin(f * 0.05) * 2 });
    dust(f, 1080, 1800, 800, 10, 0.2);
  });
}, []);
// ===== P1c (106–151) S1c — CLOSE: tank level bar sirf 940 par rukta hai; board "BAAKI KAHAN GAYA?" =====
shot(106, 151, 0.34, { cx: 1080, cy: 1560, s: 1.08 }, { cx: 1080, cy: 1530, s: 1.24 }, (f, u) => {
  const lf = f - 106;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#0b0f1a'], [1, '#1d150c']]));
  layer(1, () => {
    lampPool(1080, 1500, 800, 0.14);
    lcdScreen(1080, 950, 460, 170, '1.00', 'METER • LITRE', '#39e6c3', 84);
    // bada tank-level bar
    const bx = 990, bw = 180, by = 1180, bh = 780;
    ctx.fillStyle = '#141a22'; D.rr(ctx, bx, by, bw, bh, 26); ctx.fill(); ctx.strokeStyle = '#59667d'; ctx.lineWidth = 6; ctx.stroke();
    const fill01 = 0.94 * sstep(D.clamp(lf / 26, 0, 1));
    ctx.save(); ctx.beginPath(); D.rr(ctx, bx + 9, by + 9, bw - 18, bh - 18, 20); ctx.clip();
    const fg = ctx.createLinearGradient(0, by + bh, 0, by);
    fg.addColorStop(0, '#c97a24'); fg.addColorStop(1, '#ffb84d');
    ctx.fillStyle = fg; ctx.fillRect(bx, by + bh - bh * fill01, bw, bh * fill01);
    ctx.fillStyle = 'rgba(255,255,255,0.30)'; ctx.fillRect(bx + 22, by + 26, 20, bh - 52);
    ctx.restore();
    // scale ke nishan (daaye)
    ctx.fillStyle = 'rgba(220,230,240,0.75)';
    for (const [mv, lb] of [[0, '0'], [0.25, '250'], [0.5, '500'], [0.75, '750'], [1, '1000']]) {
      const my = by + bh - bh * mv;
      ctx.fillRect(bx + bw + 12, my - 2, 26, 4);
      text(lb, bx + bw + 52, my, 29, 'rgba(220,230,240,0.8)', 'left');
    }
    text('ml', bx + bw + 52, by - 44, 30, 'rgba(220,230,240,0.6)', 'left');
    // 940 wali laal rekha + label
    const y940 = by + bh - bh * 0.94;
    ctx.strokeStyle = '#e53935'; ctx.lineWidth = 6; ctx.setLineDash([18, 12]);
    ctx.beginPath(); ctx.moveTo(bx - 130, y940); ctx.lineTo(bx + bw + 44, y940); ctx.stroke(); ctx.setLineDash([]);
    if (lf > 24) { lampPool(bx + bw / 2, y940, 200, 0.25, '255,60,40'); text('940 ml', bx - 148, y940, 46, '#ff6b5e', 'right'); }
    text('TANK', bx + bw / 2, by + bh + 52, 36, 'rgba(220,230,240,0.65)');
    if (lf >= 30) { const p = spring((lf - 30) / 9); darkBoard(1080, 2160, 800, 150, [['BAAKI KAHAN GAYA?', 58, '#ff8a5c']], p); }
    dust(f, 1080, 1500, 600, 8, 0.18);
  });
}, []);
// ===== P2a (151–201) S2 — LOW ANGLE: dispenser aakash ki taraf tower, canopy underside upar, slow push-in =====
shot(151, 201, 0.3, { cx: 1080, cy: 1900, s: 0.82 }, { cx: 1080, cy: 1850, s: 0.97 }, (f, u) => {
  const lf = f - 151;
  layer(0.45, () => duskSky(2800, f));
  layer(1, () => {
    // farsh (neeche)
    ctx.fillStyle = '#1d1410'; ctx.fillRect(-800, 2800, 3760, 1040);
    wetReflect(1080, 2812, 720, 210, 0.13);
    // canopy underside — sir ke upar ki chhat
    ctx.fillStyle = '#2c1e16';
    ctx.beginPath(); ctx.moveTo(480, 880); ctx.lineTo(1680, 880); ctx.lineTo(1600, 1075); ctx.lineTo(560, 1075); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,226,160,0.85)';
    ctx.fillRect(760, 985, 200, 12); ctx.fillRect(1200, 985, 200, 12);
    lampPool(860, 1060, 240, 0.20); lampPool(1300, 1060, 240, 0.20);
    lightCone(1080, 1075, 2100, 340, 1000, 0.06);
    // tower dispenser (bada, neeche se)
    ctx.fillStyle = '#453322';
    D.poly(ctx, [[1380, 1250], [1462, 1180], [1462, 2800], [1380, 2800]]); ctx.fill();
    const bg2 = ctx.createLinearGradient(780, 0, 1380, 0);
    bg2.addColorStop(0, '#54402a'); bg2.addColorStop(0.5, '#8a6c42'); bg2.addColorStop(1, '#5d4a30');
    ctx.fillStyle = bg2; D.rr(ctx, 780, 1150, 600, 1650, 22); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 8; ctx.stroke();
    ctx.fillStyle = '#c62828'; ctx.fillRect(780, 1150, 600, 118);
    text('PETROL', 1080, 1212, 66, '#ffffff');
    lcdScreen(1080, 1560, 440, 300, '1.00', 'LITRE', '#39e6c3', 128);
    ctx.fillStyle = '#0a1410'; D.rr(ctx, 855, 1780, 450, 96, 10); ctx.fill(); ctx.strokeStyle = '#3f4a44'; ctx.lineWidth = 5; ctx.stroke();
    text('₹106.31', 1080, 1830, 54, '#ffd94d');
    // panel seams + halki laal jhalak (aane wale raaz ka ishara)
    ctx.strokeStyle = 'rgba(20,14,8,0.55)'; ctx.lineWidth = 5;
    for (let vy = 2050; vy <= 2500; vy += 90) { ctx.beginPath(); ctx.moveTo(850, vy); ctx.lineTo(1310, vy); ctx.stroke(); }
    const pulse = 0.5 + 0.5 * Math.sin(f * 0.13);
    ctx.fillStyle = `rgba(255,64,40,${0.10 + 0.16 * pulse})`; ctx.fillRect(850, 2044, 460, 8);
    lampPool(1080, 1560, 480, 0.13, '120,255,205');
    dust(f, 1080, 1900, 800, 12, 0.22);
  });
}, []);
// ===== P2b (201–248) S2b — PANEL CLOSE: chamakta "?", seam se laal roshni, plate "RAAZ MACHINE KE ANDAR" =====
shot(201, 248, 0.36, { cx: 1080, cy: 1560, s: 1.16 }, { cx: 1080, cy: 1540, s: 1.34 }, (f, u) => {
  const lf = f - 201;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#0d0a12'], [1, '#241407']]));
  layer(1, () => {
    lampPool(1080, 1560, 900, 0.13);
    panelFront(1080, 1560, f, { litres: 1.0, red: 1, qmark: true });
    dust(f, 1080, 1560, 650, 10, 0.2);
    if (lf > 14) {
      const p = spring((lf - 14) / 9);
      ctx.save(); ctx.translate(1080, 2180); ctx.scale(p, p); ctx.translate(-1080, -2180);
      plate(1080, 2180, 660, 108, 'RAAZ MACHINE KE ANDAR', 44);
      ctx.restore();
    }
  });
}, []);
// ===== P3a (248–291) S3 — FLY-IN: camera panel ke slot ke ANDAR ghusta hai (zoom-through) =====
shot(248, 291, 0.38, { cx: 1080, cy: 1580, s: 1.05 }, { cx: 1080, cy: 1650, s: 2.7 }, (f, u) => {
  const lf = f - 248;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#0d0a12'], [1, '#241407']]));
  layer(1, () => {
    panelFront(1080, 1580, f, { litres: 1.0, red: 1 });
    // speed lines — tez ghusne ka ehsaas (u ke aakhir me)
    if (u > 0.5) {
      const sa = (u - 0.5) * 1.6;
      ctx.strokeStyle = `rgba(255,220,150,${sa * 0.5})`; ctx.lineWidth = 6; ctx.lineCap = 'round';
      for (let i = 0; i < 14; i++) {
        const a = i * Math.PI / 7 + 0.2, r0 = 260 + (u - 0.5) * 500, r1 = r0 + 190;
        ctx.beginPath();
        ctx.moveTo(1080 + Math.cos(a) * r0, 1620 + Math.sin(a) * r0);
        ctx.lineTo(1080 + Math.cos(a) * r1, 1620 + Math.sin(a) * r1);
        ctx.stroke();
      }
    }
  });
}, []);
// ===== P3b (291–356) S3b — INTERIOR: PCB, ghumte gears, behta petrol, chip slot khaali =====
shot(291, 356, 0.4, { cx: 1080, cy: 1500, s: 0.94 }, { cx: 1080, cy: 1480, s: 1.04 }, (f, u) => {
  const lf = f - 291;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#04060b'], [1, '#0a0d14']]));
  layer(1, () => {
    interiorSet(1080, 1500, f, { slotGlow: 0.35 + 0.25 * Math.sin(f * 0.2) });
    plate(855, 1852, 370, 88, 'CHHOTA COMPUTER', 36);
    textF('HAR BOOND NAAPTA HAI', 1080, 2150, 44, '#ffd94d', 720);
    dust(f, 1080, 1500, 800, 10, 0.16);
  });
}, []);
// ===== P4a (356–409) S4 — SIDE TRACK L→R: police jeep aati hai, officer utarta hai; board "LUCKNOW, 2017" =====
shot(356, 409, 0.3, { cx: 860, cy: 1620, s: 0.72 }, { cx: 1240, cy: 1600, s: 0.72 }, (f, u) => {
  const lf = f - 356;
  layer(0.5, () => duskSky(GY, f));
  layer(0.7, () => highwayBand(GY, f));
  layer(1, () => {
    stationSet(1080, GY, f, { totem: false });
    const jeepX = D.lerp(620, 960, sstep(D.clamp(lf / 34, 0, 1)));
    jeepSide(jeepX, GY, 0.95);
    // laal-neeli batti ki chamak (f-based)
    const bl = Math.sin(f * 0.55) > 0;
    lampPool(jeepX, GY - 500, 190, bl ? 0.30 : 0.10, bl ? '255,70,50' : '80,140,255');
    if (lf >= 36) {
      const ox = D.lerp(jeepX - 190, jeepX - 60, sstep(D.clamp((lf - 36) / 12, 0, 1)));
      silOfficer(ox, GY, 1.5, { bob: lf < 48 ? Math.abs(Math.sin(f * 0.35)) * 7 : 0, rim: 'rgba(255,220,160,0.9)' });
    }
    if (lf > 6) { const p = spring((lf - 6) / 9); darkBoard(760, 950, 480, 115, [['LUCKNOW, 2017', 50, '#ffd94d']], p); }
    dust(f, 1080, 1900, 700, 8, 0.15);
  });
}, []);
// ===== P4b (409–459) S4b — SIDE CLOSE: officer panel kholta hai, andar se laal roshni bahaar =====
shot(409, 459, 0.36, { cx: 1100, cy: 1620, s: 1.02 }, { cx: 1100, cy: 1590, s: 1.18 }, (f, u) => {
  const lf = f - 409;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#0d0a12'], [1, '#221206']]));
  layer(1, () => {
    lampPool(1150, 1700, 800, 0.12);
    const open = sstep(D.clamp((lf - 8) / 18, 0, 1));
    // machine body (side-front)
    const bg3 = ctx.createLinearGradient(850, 0, 1450, 0);
    bg3.addColorStop(0, '#54402a'); bg3.addColorStop(0.55, '#8a6c42'); bg3.addColorStop(1, '#4c3a26');
    ctx.fillStyle = bg3; D.rr(ctx, 850, 1250, 600, 1150, 18); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 7; ctx.stroke();
    ctx.fillStyle = '#c62828'; ctx.fillRect(850, 1250, 600, 84);
    text('PETROL', 1150, 1294, 48, '#ffffff');
    // machine ke daayein kinare latki hose + nozzle (side detail)
    ctx.strokeStyle = '#101216'; ctx.lineWidth = 17; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(1452, 1560); ctx.bezierCurveTo(1500, 1720, 1445, 1860, 1472, 1990); ctx.stroke();
    ctx.save(); ctx.translate(1472, 2010); ctx.rotate(0.12);
    ctx.fillStyle = '#1d2126'; D.rr(ctx, -17, -58, 34, 116, 10); ctx.fill();
    ctx.fillStyle = '#c62828'; ctx.fillRect(-17, -34, 34, 13);
    ctx.fillStyle = '#8b93a1'; ctx.fillRect(-5, 54, 10, 32);
    ctx.restore();
    // cavity (khulta hua hissa)
    ctx.fillStyle = '#07090e'; D.rr(ctx, 920, 1500, 480, 640, 10); ctx.fill();
    if (open > 0) {
      lampPool(1160, 1820, 420, 0.4 * open, '255,60,40');
      // andar ki jhalak: PCB kinara + gear silhouettes
      ctx.fillStyle = '#0f4423'; ctx.fillRect(960, 1550, 200, 300);
      ctx.strokeStyle = 'rgba(242,193,78,0.5)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(975, 1610); ctx.lineTo(1140, 1610); ctx.lineTo(1140, 1670); ctx.stroke();
      gear(1300, 1670, 74, f * 0.04, '#454f61');
      ctx.fillStyle = `rgba(255,70,45,${0.5 * open})`; D.circ(ctx, 1060, 1950, 12); ctx.fill();
    }
    // darwaza: kabze (bayein) se khulta — chaudaai sikudti hai + chamakti kinari
    const doorW = 480 * (1 - open * 0.80);
    ctx.fillStyle = '#6e5636'; D.rr(ctx, 920, 1500, doorW, 640, 10); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
    ctx.strokeStyle = 'rgba(20,14,8,0.5)'; ctx.lineWidth = 4;
    for (let vy = 1610; vy <= 2030; vy += 84) { ctx.beginPath(); ctx.moveTo(945, vy); ctx.lineTo(920 + doorW - 25, vy); ctx.stroke(); }
    if (open > 0.05) { ctx.fillStyle = `rgba(255,120,80,${0.65 * open})`; ctx.fillRect(920 + doorW - 6, 1500, 6, 640); }
    // officer — haath panel ke neeche wale kinare par (darwaza wahi se khulta hai)
    silOfficer(745, GY, 1.72, { armUp: true, rim: 'rgba(255,220,160,0.85)' });
    if (lf >= 20) {
      const p = spring((lf - 20) / 8);
      ctx.save(); ctx.translate(1150, 1080); ctx.scale(p, p); ctx.translate(-1150, -1080);
      plate(1150, 1080, 430, 100, 'PANEL KHULA!', 46, '#ff8a5c');
      ctx.restore();
    }
    dust(f, 1100, 1700, 600, 8, 0.18);
  });
}, []);
// ===== P5a (459–501) S5 — MACRO: chip hatheli par ubharti hai; hit 475 par LED; board "₹3,000 KI CHIP" =====
shot(459, 501, 0.38, { cx: 1080, cy: 1560, s: 1.12 }, { cx: 1080, cy: 1540, s: 1.28 }, (f, u) => {
  const lf = f - 459;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#0a0810'], [1, '#201104']]));
  layer(1, () => {
    lampPool(1080, 1560, 760, 0.22);
    palmSil(1080, 1750, 1.15);
    if (lf >= 10) {
      const p = spring((lf - 10) / 8);
      ctx.save(); ctx.translate(1080, 1560); ctx.scale(p, p); ctx.translate(-1080, -1560);
      chipDraw(1080, 1560, 400, f, lf >= 16);
      ctx.restore();
      if (lf >= 16) { D.drawSparkle(ctx, 1218, 1446, 30, 0.9); D.drawSparkle(ctx, 950, 1660, 20, 0.6); }
    }
    if (lf > 5) { const p = spring((lf - 5) / 9); darkBoard(1080, 950, 620, 135, [['₹3,000 KI CHIP', 58, '#ffc72c']], p); }
    dust(f, 1080, 1500, 650, 10, 0.25);
  });
}, [475]);
// ===== P5b (501–544) S5b — MACRO 2: dusri taraf remote, button dabta hai (hit 520), chip ki laal batti jalti hai =====
shot(501, 544, 0.38, { cx: 1080, cy: 1560, s: 1.08 }, { cx: 1080, cy: 1545, s: 1.20 }, (f, u) => {
  const lf = f - 501;
  const press = lf >= 19 && lf < 32;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#0a0810'], [1, '#201104']]));
  layer(1, () => {
    lampPool(800, 1520, 480, 0.16); lampPool(1330, 1480, 480, 0.16);
    // bayein: hatheli + chip
    palmSil(800, 1820, 0.8);
    chipDraw(800, 1560, 300, f, lf >= 19);
    // daayein: remote pakdi hui hatheli (ulti taraf se — ungliyaan remote ke peeche se lapeti hui)
    palmSil(1420, 1740, 0.82, -1);
    remoteDraw(1330, 1480, 1.15, press, f);
    // signal: remote se chip tak laal pulses
    if (lf >= 19 && lf < 36) {
      ctx.strokeStyle = 'rgba(255,70,50,0.55)'; ctx.lineWidth = 5; ctx.setLineDash([14, 16]); ctx.lineDashOffset = -f * 6;
      ctx.beginPath(); ctx.moveTo(1300, 1320); ctx.quadraticCurveTo(1080, 1220, 940, 1480); ctx.stroke(); ctx.setLineDash([]);
      const tp = ((lf - 19) % 8) / 8;
      const sx = D.lerp(1300, 940, tp), sy = D.lerp(1320, 1480, tp) - Math.sin(tp * Math.PI) * 90;
      ctx.fillStyle = '#ff5545'; D.circ(ctx, sx, sy, 11); ctx.fill();
      lampPool(sx, sy, 60, 0.5, '255,60,40');
    }
    if (lf >= 19) D.drawSparkle(ctx, 890, 1450, 24, 0.85);
    if (lf > 24) textF('REMOTE WALI!', 1080, 950, 56, '#ff8a5c', 700);
    dust(f, 1080, 1500, 700, 8, 0.2);
  });
}, [520]);
// ===== P6a (544–607) S6 — SPLIT SCREEN: upar meter 1.00 tak, neeche tank sirf 940 tak; beech me chip =====
shot(544, 607, 0.32, { cx: 1080, cy: 1500, s: 0.98 }, { cx: 1080, cy: 1490, s: 1.06 }, (f, u) => {
  const lf = f - 544;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#070a12'], [1, '#160f08']]));
  layer(1, () => {
    // upar: meter panel
    ctx.fillStyle = '#1a2230'; D.rr(ctx, 650, 740, 860, 500, 16); ctx.fill(); ctx.strokeStyle = '#3a4356'; ctx.lineWidth = 6; ctx.stroke();
    plate(1080, 806, 300, 64, 'METER SCREEN', 32, '#8ef0b3');
    const litres = D.clamp(lf / 52, 0, 1);
    lcdScreen(1080, 1035, 700, 300, litres.toFixed(2), 'LITRE', '#39e6c3', 128);
    // beech: chip icon + jodti rekhaayein
    ctx.strokeStyle = 'rgba(255,120,80,0.6)'; ctx.lineWidth = 4; ctx.setLineDash([10, 12]);
    ctx.beginPath(); ctx.moveTo(1080, 1240); ctx.lineTo(1080, 1290); ctx.moveTo(1080, 1370); ctx.lineTo(1080, 1420); ctx.stroke(); ctx.setLineDash([]);
    chipDraw(1080, 1330, 140, f, true);
    // neeche: tank panel
    ctx.fillStyle = '#1a2230'; D.rr(ctx, 650, 1420, 860, 740, 16); ctx.fill(); ctx.strokeStyle = '#3a4356'; ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = '#10161f'; D.rr(ctx, 720, 1500, 720, 560, 22); ctx.fill(); ctx.strokeStyle = '#59667d'; ctx.lineWidth = 5; ctx.stroke();
    const fillH = 0.94 * sstep(D.clamp(lf / 50, 0, 1));
    ctx.save(); ctx.beginPath(); D.rr(ctx, 728, 1508, 704, 544, 18); ctx.clip();
    const fg2 = ctx.createLinearGradient(0, 2052, 0, 1508);
    fg2.addColorStop(0, '#c97a24'); fg2.addColorStop(1, '#ffb84d');
    ctx.fillStyle = fg2; ctx.fillRect(720, 2052 - 544 * fillH, 720, 544 * fillH);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(748, 1520, 22, 520);
    ctx.restore();
    const y940 = 2052 - 544 * 0.94;
    ctx.strokeStyle = '#e53935'; ctx.lineWidth = 5; ctx.setLineDash([16, 11]);
    ctx.beginPath(); ctx.moveTo(720, y940); ctx.lineTo(1440, y940); ctx.stroke(); ctx.setLineDash([]);
    text('940 ml', 1408, y940 - 30, 40, '#ff6b5e', 'right');
    plate(1080, 2112, 300, 64, 'ASLI TANK', 32, '#ffb84d');
    dust(f, 1080, 1500, 700, 8, 0.15);
  });
}, []);
// ===== P6b (607–670) S6b — SPLIT + SIGNAL: chip se laal lehren dono taraf; 640 par FREEZE + "940 ml" stamp =====
shot(607, 670, 0.34, { cx: 1080, cy: 1500, s: 1.06 }, { cx: 1080, cy: 1495, s: 1.12 }, (f, u) => {
  const lf = f - 607;
  const frozen = lf >= 33;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#070a12'], [1, '#160f08']]));
  layer(1, () => {
    ctx.fillStyle = '#1a2230'; D.rr(ctx, 650, 740, 860, 500, 16); ctx.fill(); ctx.strokeStyle = '#3a4356'; ctx.lineWidth = 6; ctx.stroke();
    plate(1080, 806, 300, 64, 'METER SCREEN', 32, '#8ef0b3');
    const jit = frozen ? '1.00' : (hash(f * 1.31) > 0.5 ? '1.00' : '0.99');
    lcdScreen(1080, 1035, 700, 300, jit, 'LITRE', '#39e6c3', 128);
    ctx.fillStyle = '#1a2230'; D.rr(ctx, 650, 1420, 860, 740, 16); ctx.fill(); ctx.strokeStyle = '#3a4356'; ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = '#10161f'; D.rr(ctx, 720, 1500, 720, 560, 22); ctx.fill(); ctx.strokeStyle = '#59667d'; ctx.lineWidth = 5; ctx.stroke();
    const wob = frozen ? 0 : Math.sin(f * 0.8) * 4;
    ctx.save(); ctx.beginPath(); D.rr(ctx, 728, 1508, 704, 544, 18); ctx.clip();
    const fg3 = ctx.createLinearGradient(0, 2052, 0, 1508);
    fg3.addColorStop(0, '#c97a24'); fg3.addColorStop(1, '#ffb84d');
    ctx.fillStyle = fg3; ctx.fillRect(720, 2052 - 544 * 0.94 + wob, 720, 544 * 0.94);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(748, 1520, 22, 520);
    ctx.restore();
    const y940 = 2052 - 544 * 0.94;
    ctx.strokeStyle = '#e53935'; ctx.lineWidth = 5; ctx.setLineDash([16, 11]);
    ctx.beginPath(); ctx.moveTo(720, y940); ctx.lineTo(1440, y940); ctx.stroke(); ctx.setLineDash([]);
    text('940 ml', 1408, y940 - 30, 40, '#ff6b5e', 'right');
    plate(1080, 2112, 300, 64, 'ASLI TANK', 32, '#ffb84d');
    // signal waves chip se (freeze se pehle)
    if (!frozen) {
      for (let k = 0; k < 3; k++) {
        const rr4 = ((f * 3.2 + k * 88) % 264) + 20;
        ctx.strokeStyle = `rgba(255,70,50,${0.55 * (1 - rr4 / 284)})`; ctx.lineWidth = 5;
        D.circ(ctx, 1080, 1330, rr4); ctx.stroke();
      }
    }
    ctx.strokeStyle = 'rgba(255,120,80,0.6)'; ctx.lineWidth = 4; ctx.setLineDash([10, 12]);
    ctx.beginPath(); ctx.moveTo(1080, 1240); ctx.lineTo(1080, 1290); ctx.moveTo(1080, 1370); ctx.lineTo(1080, 1420); ctx.stroke(); ctx.setLineDash([]);
    chipDraw(1080, 1330, 140, f, true);
    // upar tags: screen vs tank
    plate(890, 700, 360, 78, 'SCREEN = 1.00 L', 36, '#39e6c3');
    if (frozen) {
      const p = spring((lf - 33) / 6);
      stampDraw(1130, 1810, 440, 165, [['940 ml', 66]], '#e53935', -0.13, p);
      plate(1080, 2240, 540, 84, 'TANK ME SIRF 940 ml', 40, '#ff6b5e');
    } else {
      plate(1270, 700, 360, 78, 'TANK = ??? ml', 36, '#ff6b5e');
    }
  });
}, [640]);
// ===== P7a (670–729) S7 — SIDE PIPE LEAK: boondein girti hain, hawa me sikko me badalti hain =====
shot(670, 729, 0.34, { cx: 1080, cy: 1520, s: 1.0 }, { cx: 1080, cy: 1500, s: 1.10 }, (f, u) => {
  const lf = f - 670;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#05070c'], [1, '#120c06']]));
  layer(1, () => {
    // deewaar/panel ka mahaul (do pipe + connectors + pressure gauge = machine ke andar ka hissa)
    ctx.fillStyle = '#161b28'; D.rr(ctx, 560, 760, 1040, 1560, 16); ctx.fill();
    ctx.strokeStyle = '#39445c'; ctx.lineWidth = 6; ctx.stroke();
    ctx.strokeStyle = 'rgba(90,110,140,0.25)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(1080, 776); ctx.lineTo(1080, 2304); ctx.stroke();
    pipeFlow(620, 1060, 1540, f + 40, 28);
    ctx.fillStyle = '#39445c'; ctx.fillRect(680, 1060, 26, 290); ctx.fillRect(1454, 1060, 26, 290);
    // pressure gauge (upar wali pipe par, daayein taraf — plate se door)
    ctx.fillStyle = '#20262e'; D.circ(ctx, 1330, 1060, 52); ctx.fill(); ctx.strokeStyle = '#8b93a1'; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#e8eef4'; D.circ(ctx, 1330, 1060, 40); ctx.fill();
    const na = -2.2 + (Math.sin(f * 0.22) * 0.5 + 0.5) * 1.6 + Math.sin(f * 0.9) * 0.08;
    ctx.strokeStyle = '#c62828'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(1330, 1060); ctx.lineTo(1330 + Math.cos(na) * 30, 1060 + Math.sin(na) * 30); ctx.stroke();
    ctx.fillStyle = '#20262e'; D.circ(ctx, 1330, 1060, 7); ctx.fill();
    pipeFlow(620, 1350, 1540, f, 46);
    // leak joint pipe ke neeche
    ctx.fillStyle = '#3d4759'; ctx.fillRect(1036, 1392, 88, 54);
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.strokeRect(1036, 1392, 88, 54);
    lampPool(1080, 1470, 130, 0.3);
    plate(790, 1130, 370, 92, '60 ml GAYAB', 42, '#ff8a5c');
    // girti boondein -> sikke
    for (let k = 0; k < 3; k++) {
      const phase = ((lf * 1.35 + k * 23) % 69) / 69;
      const dy = 1452 + phase * phase * 400;
      const dx = 1080 + Math.sin(phase * 5 + k * 2) * 7;
      if (phase < 0.5) {
        ctx.fillStyle = '#ffb84d'; D.ell(ctx, dx, dy, 11, 15 + phase * 12); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; D.circ(ctx, dx - 3, dy - 5, 3.5); ctx.fill();
      } else if (phase < 0.64) {
        const mp = (phase - 0.5) / 0.14;
        D.drawSparkle(ctx, dx, dy, 30 * mp + 8, 0.9);
        coinDraw(dx, dy, 8 + 20 * mp);
      } else if (dy < 1985) {
        coinDraw(dx, dy, 28);
      }
    }
    // neeche jama sikke
    coinStack(1230, 1995, Math.min(6, 1 + Math.floor(lf / 10)), 30);
    ctx.fillStyle = '#241a10'; ctx.fillRect(1010, 2000, 480, 18);
    textF('HAR LITRE SE...', 800, 2150, 42, '#ffd94d', 560);
    dust(f, 1080, 1500, 700, 8, 0.15);
  });
}, []);
// ===== P7b (729–791) S7b — POCKET: sikke chute se sarak kar jeb me; jeb phulti hai =====
shot(729, 791, 0.34, { cx: 1080, cy: 1560, s: 0.98 }, { cx: 1080, cy: 1540, s: 1.10 }, (f, u) => {
  const lf = f - 729;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#070609'], [1, '#170e05']]));
  layer(1, () => {
    lampPool(1150, 1600, 700, 0.12);
    // chute (dhalaan wali naali) upar-bayein se jeb tak
    ctx.strokeStyle = '#2c3444'; ctx.lineWidth = 58; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(690, 990); ctx.lineTo(1150, 1605); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,184,77,0.35)'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(690, 990); ctx.lineTo(1150, 1605); ctx.stroke();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(662, 968); ctx.lineTo(1122, 1583); ctx.stroke();
    // jeb (badi silhouette trouser-pocket)
    ctx.fillStyle = '#0d0f14'; D.rr(ctx, 1130, 1450, 430, 900, 34); ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,160,0.30)'; ctx.lineWidth = 5; ctx.stroke();
    // jeb ka phula hua hissa (bulge badhta hai — halka, jeb ke andar hi)
    const bulge = sstep(D.clamp(lf / 50, 0, 1));
    ctx.fillStyle = '#151a26'; D.ell(ctx, 1310, 2055, 148 + bulge * 62, 84 + bulge * 52); ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,160,0.22)'; ctx.lineWidth = 4; D.ell(ctx, 1310, 2055, 148 + bulge * 62, 84 + bulge * 52); ctx.stroke();
    // jeb ki silai (dashed)
    ctx.strokeStyle = 'rgba(220,200,160,0.4)'; ctx.lineWidth = 4; ctx.setLineDash([13, 11]);
    D.rr(ctx, 1162, 1490, 366, 500, 26); ctx.stroke(); ctx.setLineDash([]);
    // sarakte sikke
    for (let k = 0; k < 4; k++) {
      const t = ((lf * 1.15 + k * 31) % 124) / 124;
      if (t < 0.78) {
        const ct = t / 0.78;
        coinDraw(D.lerp(690, 1150, ct), D.lerp(990, 1605, ct) - 44, 27);
      } else {
        const dt = (t - 0.78) / 0.22;
        coinDraw(D.lerp(1150, 1245, dt), D.lerp(1560, 1760, dt * dt), 27);
      }
    }
    // jeb ke munh par chamak
    lampPool(1180, 1560, 130, 0.3);
    // bayein-neeche sikkon ki kataar (munafa jama)
    coinStack(800, 2160, Math.min(9, 2 + Math.floor(lf / 7)), 36);
    ctx.fillStyle = '#241a10'; ctx.fillRect(600, 2166, 420, 16);
    if (lf > 16) textF('SEEDHA JEB ME!', 1020, 830, 54, '#ffc72c', 640);
    dust(f, 1080, 1500, 700, 8, 0.15);
  });
}, []);

// ===== P8a (791–837) S8 — CRANE DOWN: aakash se neeche utarti camera, pura station dusk me =====
shot(791, 837, 0.28, { cx: 1080, cy: 760, s: 0.50 }, { cx: 1080, cy: 1480, s: 0.66 }, (f, u) => {
  const lf = f - 791;
  layer(0.3, () => { // baadal (crane ke saath behte hue)
    ctx.fillStyle = 'rgba(40,26,54,0.55)';
    for (const [bx, by, br] of [[300, 300, 300], [1050, 180, 380], [1850, 340, 320], [700, 560, 260], [1600, 620, 280]]) {
      D.ell(ctx, bx + Math.sin(f * 0.01 + bx) * 16, by, br, br * 0.34); ctx.fill();
    }
  });
  layer(0.5, () => duskSky(GY, f));
  layer(0.7, () => highwayBand(GY, f));
  layer(1, () => {
    stationSet(1080, GY, f);
    dust(f, 1080, 1700, 900, 10, 0.15);
  });
}, []);
// ===== P8b (837–884) S8b — WIDE + SKY COUNTER: "₹6,00,000 → ₹12,00,000 / MAHINA" tick; hit 860 =====
shot(837, 884, 0.3, { cx: 1080, cy: 1500, s: 0.66 }, { cx: 1080, cy: 1480, s: 0.72 }, (f, u) => {
  const lf = f - 837;
  layer(0.5, () => duskSky(GY, f));
  layer(0.7, () => highwayBand(GY, f));
  layer(1, () => {
    stationSet(1080, GY, f);
    // aakash me bada counter board
    const n = D.lerp(600000, 1200000, sstep(D.clamp(lf / 24, 0, 1)));
    ctx.save(); ctx.translate(1080, 950);
    lampPool(0, 0, 640, 0.30);
    ctx.fillStyle = '#14100a'; D.rr(ctx, -460, -168, 920, 336, 16); ctx.fill();
    ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 7; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,199,44,0.5)'; ctx.lineWidth = 2.5; D.rr(ctx, -447, -155, 894, 310, 10); ctx.stroke();
    text('EK PUMP KI KAMAI', 0, -104, 46, '#f5edd8');
    textF('₹' + inr(n), 0, 8, 104, '#ffc72c', 830);
    text('/ MAHINA', 0, 118, 54, '#ff8a5c');
    ctx.restore();
    if (lf >= 23) {
      D.drawSparkle(ctx, 640, 820, 34, 0.9); D.drawSparkle(ctx, 1520, 830, 30, 0.8); D.drawSparkle(ctx, 1080, 760, 24, 0.7);
      ctx.fillStyle = 'rgba(242,193,78,0.85)';
      for (let i = 0; i < 8; i++) { const px = 700 + hash(i * 6.3) * 760, py = 1180 + ((f * (2 + hash(i) * 2) + i * 130) % 380); D.circ(ctx, px, py, 4 + hash(i) * 4); ctx.fill(); }
    }
    dust(f, 1080, 1700, 900, 8, 0.15);
  });
}, [860]);
// ===== P9a (884–929) S9 — DIVE TO MAP: camera forecourt me ghusta hai, farsh naksha ban jata hai =====
shot(884, 929, 0.36, { cx: 1080, cy: 1500, s: 0.68 }, { cx: 1080, cy: 1900, s: 1.50 }, (f, u) => {
  const lf = f - 884;
  layer(0.5, () => duskSky(GY, f));
  layer(0.7, () => highwayBand(GY, f));
  layer(1, () => {
    stationSet(1080, GY, f);
    const ma = D.clamp((lf - 22) / 18, 0, 1);
    if (ma > 0) {
      ctx.save(); ctx.globalAlpha = ma;
      ctx.fillStyle = '#060a14'; ctx.fillRect(-800, -600, 3760, 4440);
      mapSet(f, 120 + (lf - 22) * 34);
      ctx.restore();
    }
  });
}, []);
// ===== P9b (929–973) S9b — AERIAL MAP: ek pump se lehren, 1,000+ dots jalte hue phailte hain =====
shot(929, 973, 0.34, { cx: 1080, cy: 1520, s: 0.86 }, { cx: 1080, cy: 1500, s: 0.94 }, (f, u) => {
  const lf = f - 929;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#04060d'], [1, '#081020']]));
  layer(1, () => {
    const lit = mapSet(f, 150 + lf * 38);
    const cnt = Math.min(1000, Math.floor(lit / MAP_DOTS.length * 1000));
    const disp = lf >= 28 ? '1,000+ PUMP' : inr(cnt) + ' PUMP';
    darkBoard(1080, 830, 720, 150, [[disp, 64, '#ffc72c']], 1);
    textF('CHIP HAR JAGAH PHAIL GAYI', 1080, 2380, 42, 'rgba(220,235,245,0.75)', 800);
  });
}, []);
// ===== P10a (973–1029) S10 — LOW ANGLE HERO: 5-litre naap, golden backlight; mohor glint hit 1010 =====
shot(973, 1029, 0.32, { cx: 1080, cy: 1720, s: 0.98 }, { cx: 1080, cy: 1690, s: 1.10 }, (f, u) => {
  const lf = f - 973;
  layer(0.45, () => duskSky(2650, f));
  layer(1, () => {
    ctx.fillStyle = '#1d1410'; ctx.fillRect(-800, 2400, 3760, 1440);
    ctx.fillStyle = 'rgba(255,220,150,0.08)'; ctx.fillRect(-800, 2400, 3760, 12);
    lampPool(1080, 1750, 760, 0.26); // backlight halo
    lightCone(760, 640, 1900, 220, 900, 0.08);
    wetReflect(1080, 2412, 580, 250, 0.14);
    const glint = D.clamp(1 - Math.abs(lf - 37) / 8, 0, 1);
    measureCan(1080, 2400, 1.55, f, { glint });
    if (lf > 8) {
      const p = spring((lf - 8) / 9);
      ctx.save(); ctx.translate(1080, 1130); ctx.scale(p, p); ctx.translate(-1080, -1130);
      plate(1080, 1130, 540, 102, '5 LITRE KA NAAP', 48);
      ctx.restore();
    }
    dust(f, 1080, 1700, 700, 12, 0.25);
  });
}, [1010]);
// ===== P10b (1029–1084) S10b — ORBIT SIDE: camera can ke side ghumta hai; board "TUMHARA HATHIYAAR" =====
shot(1029, 1084, 0.32, { cx: 1030, cy: 1700, s: 1.02 }, { cx: 1130, cy: 1680, s: 1.08 }, (f, u) => {
  const lf = f - 1029;
  layer(0.45, () => duskSky(2650, f));
  layer(1, () => {
    ctx.fillStyle = '#1d1410'; ctx.fillRect(-800, 2400, 3760, 1440);
    lampPool(1080, 1750, 720, 0.22);
    wetReflect(1080, 2412, 540, 230, 0.12);
    measureCan(1080, 2400, 1.5, f, { glint: 0.35 + 0.3 * Math.sin(f * 0.15) });
    // orbit ka ehsaas: side spout dheere-dheere dikhta hai (u ke saath chauda)
    const sw = 8 + u * 44;
    ctx.fillStyle = '#59636f';
    D.poly(ctx, [[1080 + 130, 2400 - 800], [1080 + 130 + sw, 2400 - 760], [1080 + 130 + sw, 2400 - 690], [1080 + 128, 2400 - 720]]); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    if (lf > 6) { const p = spring((lf - 6) / 9); darkBoard(1080, 1000, 780, 145, [['TUMHARA HATHIYAAR', 56, '#ffc72c']], p); }
    dust(f, 1080, 1700, 700, 10, 0.22);
  });
}, []);
// ===== P11a (1084–1144) S11 — POV: viewer ke haath naap pakde hain, nozzle se petrol bharta hai =====
shot(1084, 1144, 0.36, { cx: 1080, cy: 1560, s: 0.98 }, { cx: 1080, cy: 1540, s: 1.06 }, (f, u) => {
  const lf = f - 1084;
  layer(0.6, () => {
    stationSet(1080, GY, f);
    ctx.fillStyle = 'rgba(5,4,8,0.38)'; ctx.fillRect(-800, -600, 3760, 4440);
  });
  layer(1, () => {
    // upar se aati hose + nozzle (viewer ki taraf)
    ctx.strokeStyle = '#101216'; ctx.lineWidth = 27; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(1310, 420); ctx.bezierCurveTo(1180, 640, 1090, 800, 1080, 920); ctx.stroke();
    ctx.save(); ctx.translate(1080, 1150);
    ctx.fillStyle = '#1d2126'; D.rr(ctx, -36, -235, 72, 300, 24); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#c62828'; ctx.fillRect(-36, -180, 72, 30);
    ctx.fillStyle = '#8b93a1'; ctx.fillRect(-10, 58, 20, 135);
    ctx.restore();
    // petrol ki dhaar nozzle se naap ke munh tak
    const flow = D.clamp(lf / 8, 0, 1) * D.clamp((56 - lf) / 8, 0, 1);
    if (flow > 0) {
      ctx.save(); ctx.globalAlpha = 0.85 * flow;
      const sg = ctx.createLinearGradient(0, 1340, 0, 1450);
      sg.addColorStop(0, '#ffb84d'); sg.addColorStop(1, '#c97a24');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(1071, 1342);
      ctx.quadraticCurveTo(1075 + Math.sin(f * 0.9) * 3, 1395, 1072, 1448);
      ctx.lineTo(1088, 1448);
      ctx.quadraticCurveTo(1085 + Math.cos(f * 0.9) * 3, 1395, 1089, 1342);
      ctx.closePath(); ctx.fill();
      lampPool(1080, 1452, 90, 0.4 * flow);
      ctx.restore();
    }
    // naap (viewer ke haatho me)
    measureCan(1080, 2350, 1.3, f, { fill: sstep(D.clamp(lf / 46, 0, 1)), fillGlow: 0.5 });
    // POV baahein — neeche ke kono se aati hui (silhouette)
    ctx.strokeStyle = '#0b0908'; ctx.lineCap = 'round';
    ctx.lineWidth = 98; ctx.beginPath(); ctx.moveTo(545, 2680); ctx.lineTo(795, 2090); ctx.stroke();
    ctx.lineWidth = 98; ctx.beginPath(); ctx.moveTo(1615, 2680); ctx.lineTo(1365, 2090); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,220,160,0.35)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(505, 2640); ctx.lineTo(762, 2070); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1655, 2640); ctx.lineTo(1398, 2070); ctx.stroke();
    // haath — naap ke kinare pakde hue
    ctx.fillStyle = '#0b0908';
    D.ell(ctx, 812, 2052, 62, 84); ctx.fill();
    D.ell(ctx, 1348, 2052, 62, 84); ctx.fill();
    for (let fi = 0; fi < 3; fi++) {
      ctx.save(); ctx.translate(838 + fi * 6, 1996 + fi * 26); ctx.rotate(0.55); D.rr(ctx, -13, -44, 26, 88, 13); ctx.fill(); ctx.restore();
      ctx.save(); ctx.translate(1322 - fi * 6, 1996 + fi * 26); ctx.rotate(-0.55); D.rr(ctx, -13, -44, 26, 88, 13); ctx.fill(); ctx.restore();
    }
    dust(f, 1080, 1600, 700, 8, 0.15);
  });
}, []);
// ===== P11b (1144–1203) S11b — METER CLOSE: bada "0.00"; board "MUFT JAANCH = TUMHARA HAQ" =====
shot(1144, 1203, 0.34, { cx: 1080, cy: 1520, s: 1.12 }, { cx: 1080, cy: 1500, s: 1.28 }, (f, u) => {
  const lf = f - 1144;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#0a0d13'], [1, '#181008']]));
  layer(1, () => {
    lampPool(1080, 1380, 700, 0.15, '120,255,205');
    // bezel + badi screen
    ctx.fillStyle = '#232a33'; D.rr(ctx, 690, 880, 780, 1020, 20); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 7; ctx.stroke();
    ctx.fillStyle = '#c62828'; ctx.fillRect(690, 880, 780, 74);
    text('PETROL', 1080, 919, 44, '#ffffff');
    const flick = lf < 7 && hash(f * 1.7) > 0.5 ? '8.88' : '0.00';
    lcdScreen(1080, 1330, 660, 540, flick, 'LITRE • METER ZERO', '#39e6c3', 185);
    // neeche chhoti screen: rupaye bhi zero
    ctx.fillStyle = '#0a1410'; D.rr(ctx, 830, 1690, 500, 110, 10); ctx.fill(); ctx.strokeStyle = '#3f4a44'; ctx.lineWidth = 5; ctx.stroke();
    text('₹0.00', 1080, 1747, 56, '#ffd94d');
    textF('PEHLE ZERO DEKHO!', 1080, 812, 40, '#8ef0b3', 600);
    if (lf > 14) { const p = spring((lf - 14) / 10); darkBoard(1080, 2080, 820, 215, [['MUFT JAANCH', 58, '#ffd94d'], ['= TUMHARA HAQ', 58, '#ffc72c']], p); }
    dust(f, 1080, 1500, 600, 8, 0.15);
  });
}, []);
// ===== P12a (1203–1240) S12 — DARK CLOSE-UP: andhere me sirf meter screen, kone me laal LED; punchline hissa 1 =====
shot(1203, 1240, 0.45, { cx: 1080, cy: 1500, s: 1.05 }, { cx: 1080, cy: 1490, s: 1.14 }, (f, u) => {
  const lf = f - 1203;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#020308'], [1, '#05060a']]));
  layer(1, () => {
    // halki bezel rekha
    ctx.strokeStyle = 'rgba(120,140,160,0.25)'; ctx.lineWidth = 6;
    D.rr(ctx, 720, 1120, 720, 560, 16); ctx.stroke();
    const dip = hash(f * 1.93) > 0.93 ? 0.35 : 0.85;
    ctx.save(); ctx.globalAlpha = dip;
    lcdScreen(1080, 1400, 620, 470, '1.00', 'LITRE', '#39e6c3', 148);
    ctx.restore();
    // kone me chip ki laal batti (dhokha ab bhi andar hai)
    const pl2 = 0.55 + 0.45 * Math.sin(f * 0.35);
    lampPool(1408, 1152, 90, 0.55 * pl2, '255,60,40');
    ctx.fillStyle = '#ff4444'; D.circ(ctx, 1408, 1152, 12); ctx.fill();
    if (lf >= 24) {
      ctx.save(); ctx.globalAlpha = D.clamp((lf - 24) / 8, 0, 1);
      textF('METER JHOOTH NAHI BOLTA...', 1080, 2050, 54, '#f5edd8', 780);
      ctx.restore();
    }
  });
}, []);
// ===== P12b (1240–1278) S12b — PUNCHLINE board slam (hit 1240): "USE BULWAYA JATA HAI!" =====
shot(1240, 1278, 0.42, { cx: 1080, cy: 1500, s: 1.02 }, { cx: 1080, cy: 1490, s: 1.14 }, (f, u) => {
  const lf = f - 1240;
  layer(0.5, () => vgrad(-600, 3840, [[0, '#020308'], [1, '#05060a']]));
  layer(1, () => {
    ctx.save(); ctx.globalAlpha = 0.4;
    lcdScreen(1080, 1150, 520, 380, '1.00', 'LITRE', '#39e6c3', 118);
    ctx.restore();
    const pl3 = 0.55 + 0.45 * Math.sin(f * 0.35);
    lampPool(1330, 990, 80, 0.5 * pl3, '255,60,40');
    ctx.fillStyle = '#ff4444'; D.circ(ctx, 1330, 990, 11); ctx.fill();
    const p = spring(lf / 9);
    darkBoard(1080, 1620, 920, 310, [['METER JHOOTH NAHI BOLTA...', 50, '#f5edd8'], ['USE BULWAYA JATA HAI!', 68, '#ff8a5c']], p);
    if (lf > 16) D.drawSparkle(ctx, 700, 1470, 26, 0.8);
  });
}, [1240]);
// ===== P13a (1278–1337) S13 — FLY-OUT: dispenser close se peeche udd kar pura station =====
shot(1278, 1337, 0.3, { cx: 1250, cy: 1640, s: 1.02 }, { cx: 1080, cy: 1520, s: 0.64 }, (f, u) => {
  const lf = f - 1278;
  layer(0.5, () => duskSky(GY, f));
  layer(0.7, () => highwayBand(GY, f));
  layer(1, () => {
    stationSet(1080, GY, f);
    dust(f, 1080, 1800, 800, 10, 0.18);
  });
}, []);
// ===== P13b (1337–1395) S13b — FINALE WIDE: sawal board + tease "AGLI BAAR: FASTag" =====
shot(1337, 1395, 0.28, { cx: 1080, cy: 1520, s: 0.62 }, { cx: 1080, cy: 1540, s: 0.57 }, (f, u) => {
  const lf = f - 1337;
  layer(0.5, () => duskSky(GY, f));
  layer(0.7, () => highwayBand(GY, f));
  layer(1, () => {
    stationSet(1080, GY, f);
    if (lf > 8) { const p = spring((lf - 8) / 10); darkBoard(1080, 1020, 1000, 260, [['GALTI METER KI THI...', 54, '#f5edd8'], ['YA CHALANE WALE KI?', 62, '#ffc72c']], p); }
    if (lf > 32) { const p = spring((lf - 32) / 9); darkBoard(1080, 2230, 580, 125, [['AGLI BAAR: FASTag', 48, '#ffd94d']], p); }
    dust(f, 1080, 1800, 800, 8, 0.15);
  });
  if (lf > 40) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(255,170,60,0.05)'; ctx.fillRect(0, 0, W, H); }
}, []);

// ---------------- TRANSITIONS (har cut socha hua: angle-cut / zoom-through flash / whip streak / fade-dark / glint) ----------------
// index = shot order P1a..P13b; h = pehle ~7 frame (enter), t = aakhri ~7 frame (exit)
const TR = [
  {},                             // P1a top-down (P1b side — hard angle cut)
  {},                             // P1b (P1c close — hard cut)
  { h: 'flash' },                 // P1c freeze flash-in
  {},                             // P2a low angle (hard cut)
  {},                             // P2b panel match
  { t: 'flash' },                 // P3a fly-in -> zoom-through flash
  { h: 'flash' },                 // P3b interior
  { h: 'streak' },                // P4a whip pan (side track)
  {},                             // P4b panel match
  { h: 'flash' },                 // P5a light-match macro
  {},                             // P5b remote match
  { h: 'flash' },                 // P6a light-flash match (plan)
  {},                             // P6b split match
  { h: 'flash' },                 // P7a drop-follow flash
  {},                             // P7b coin match
  {},                             // P8a crane (camera move hi transition)
  {},                             // P8b wide match
  { t: 'dark' },                  // P9a dive -> andhera
  { h: 'dark' },                  // P9b map andhere se ubharta hai
  { h: 'flash' },                 // P10a glint match
  {},                             // P10b orbit match
  {},                             // P11a POV hard cut
  { t: 'dark' },                  // P11b -> fade-to-dark (plan)
  { h: 'dark' },                  // P12a dark close
  {},                             // P12b punchline (hit flash kaafi)
  {},                             // P13a fly-out
  {},                             // P13b finale
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
