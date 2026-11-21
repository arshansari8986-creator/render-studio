// PVR Popcorn Scam (EP-4) — CINEMATIC REMAKE (1425 frames @30fps). BINA CHARACTER: koi hero, koi chehra nahi.
// Sirf jagah, cheezein aur bheed (dark silhouettes, rim-lit). Camera: Zack D. Films 3D-type — low/top/macro/dolly/push-in,
// har shot move + angle rotation, 3-layer parallax, volumetric cones, wet reflections, dust.
// Text = scene: har shot apni voice line ko literally dikhata hai. Frame-safety: har board/text dono camera extremes par andar.
// Harness: window.ready, window.renderFrame(f), window.TOTAL.
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import * as D from './draw.js';

const W = 1080, H = 1920, TOTAL = 1425, FPS = 30;
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const DEV_FONT = '"Noto Sans Devanagari"';
const fontReady = (async () => {
  try {
    const face = new FontFace('Noto Sans Devanagari', `url(data:font/ttf;base64,${DEVANAGARI_BOLD_B64})`, { weight: '700' });
    await face.load(); document.fonts.add(face);
    await document.fonts.load(`700 60px ${DEV_FONT}`, 'PVR ₹5');
  } catch (e) { window.fontErr = String(e); }
})();

function text(str, x, y, px, color, align = 'center') {
  ctx.fillStyle = color; ctx.font = `700 ${px}px ${DEV_FONT}, sans-serif`;
  ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
}
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
function lampPool(x, y, r, a = 0.4) {
  const g = ctx.createRadialGradient(x, y, 10, x, y, r);
  g.addColorStop(0, 'rgba(255,214,120,' + a + ')'); g.addColorStop(1, 'rgba(255,214,120,0)');
  ctx.fillStyle = g; D.circ(ctx, x, y, r); ctx.fill();
}
function vignette(a = 0.3) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createRadialGradient(540, 920, 420, 540, 920, 1080);
  g.addColorStop(0, 'rgba(8,6,2,0)'); g.addColorStop(1, `rgba(8,6,2,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
// ---------------- transition FX (screen-space, shot ke head/tail par) ----------------
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
function lampPost(x, gy, s = 1, f = 0) {
  ctx.strokeStyle = '#10131a'; ctx.lineWidth = 10 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, gy - 330 * s); ctx.lineTo(x + 60 * s, gy - 345 * s); ctx.stroke();
  const fl = 0.85 + 0.15 * Math.sin(f * 0.7 + x);
  lampPool(x + 66 * s, gy - 330 * s, 200 * s, 0.30 * fl);
  ctx.fillStyle = '#ffe9a8'; D.circ(ctx, x + 66 * s, gy - 338 * s, 13 * s); ctx.fill();
}
function boardSign(x, y, w, h, lines, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.strokeStyle = '#3a2a16'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(-w / 2 + 40, -h / 2 - 54); ctx.lineTo(0, -h / 2 - 6); ctx.moveTo(w / 2 - 40, -h / 2 - 54); ctx.lineTo(0, -h / 2 - 6); ctx.stroke();
  ctx.fillStyle = '#f5edd8'; D.rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  lines.forEach((ln, i) => text(ln[0], 0, (i - (lines.length - 1) / 2) * (h * 0.52), ln[1], ln[2]));
  ctx.restore();
}
// Gold-on-dark board (bade reveals). lines = [text, px, color]
function darkBoard(x, y, w, h, lines, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  lampPool(0, 0, Math.max(w, h) * 0.95, 0.30);
  ctx.fillStyle = '#14100a'; D.rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.fill();
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 7; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,199,44,0.5)'; ctx.lineWidth = 2.5; D.rr(ctx, -w / 2 + 13, -h / 2 + 13, w - 26, h - 26, 9); ctx.stroke();
  lines.forEach((ln, i) => text(ln[0], 0, (i - (lines.length - 1) / 2) * (h * 0.52), ln[1], ln[2]));
  ctx.restore();
}
// Volumetric light cone (upar se girti roshni ka shaft)
function lightCone(x, y0, y1, w0, w1, a = 0.10) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, `rgba(255,224,150,${a})`); g.addColorStop(1, 'rgba(255,224,150,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x - w0 / 2, y0); ctx.lineTo(x + w0 / 2, y0); ctx.lineTo(x + w1 / 2, y1); ctx.lineTo(x - w1 / 2, y1); ctx.closePath(); ctx.fill();
}
// Geeli zameen par roshni ki reflection (lambi streak + chamak)
function wetReflect(x, y, w, h, a = 0.16) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, `rgba(255,214,130,${a})`); g.addColorStop(1, 'rgba(255,214,130,0)');
  ctx.fillStyle = g;
  D.ell(ctx, x, y + h * 0.32, w / 2, h * 0.36); ctx.fill();
  ctx.fillStyle = `rgba(255,230,170,${a * 0.7})`;
  for (let i = 0; i < 5; i++) { const sx = x - w / 2 + 14 + i * (w - 28) / 4; ctx.fillRect(sx, y + 6, 7, h * (0.35 + hash(i * 7.3 + x) * 0.5)); }
}
// Roshni me tairti dhool (dust motes)
function dust(f, cx, cy, spread, n = 16, a = 0.35) {
  ctx.fillStyle = `rgba(255,236,180,${a})`;
  for (let i = 0; i < n; i++) {
    const dx = cx + (hash(i * 3.1) - 0.5) * spread + Math.sin(f * 0.02 + i * 1.7) * 22;
    const dy = cy + ((hash(i * 5.7) * 700 + f * (0.35 + hash(i) * 0.5)) % 700) - 350;
    D.circ(ctx, dx, dy, 2.2 + hash(i * 9) * 2.6); ctx.fill();
  }
}
// Tub ke upar uthti bhaap (steam wisps)
function steam(x, y, f, s = 1) {
  ctx.strokeStyle = 'rgba(245,240,225,0.4)'; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const ox = (i - 1) * 52 * s, ph = f * 0.045 + i * 2.1;
    ctx.lineWidth = 7 * s;
    ctx.beginPath();
    ctx.moveTo(x + ox, y);
    ctx.bezierCurveTo(x + ox + Math.sin(ph) * 20 * s, y - 55 * s, x + ox - Math.sin(ph) * 20 * s, y - 110 * s, x + ox + Math.sin(ph + 1) * 26 * s, y - 165 * s);
    ctx.stroke();
  }
}

// ---------------- backgrounds ----------------
const GY = 2400;
function nightBg(gy, warm = false) {
  vgrad(-400, gy + 40, warm ? [[0, '#160f1e'], [0.6, '#2b1830'], [1, '#4a2438']] : [[0, '#070b1c'], [0.6, '#101a38'], [1, '#24355e']]);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 42; i++) { const sx = -600 + hash(i * 1.7) * 3300, sy = -300 + hash(i * 2.3) * 1250; D.circ(ctx, sx, sy, 2 + hash(i) * 2.4); ctx.fill(); }
  lampPool(420, 60, 190, 0.16);
  ctx.fillStyle = '#f2ead2'; D.circ(ctx, 420, 60, 54); ctx.fill();
  ctx.fillStyle = warm ? '#2b1830' : '#101a38'; D.circ(ctx, 448, 44, 46); ctx.fill();
  ctx.fillStyle = '#241d18'; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  ctx.fillStyle = 'rgba(255,220,150,0.08)'; ctx.fillRect(-800, gy, 3760, 12);
}
function lobbyBg(gy, bright = true) {
  if (bright) vgrad(-400, gy + 40, [[0, '#4a3418'], [0.55, '#7a5a28'], [1, '#a87f3e']]);
  else vgrad(-400, gy + 40, [[0, '#14100c'], [1, '#2e2416']]);
  ctx.fillStyle = bright ? 'rgba(255,226,160,0.13)' : 'rgba(255,226,160,0.05)';
  for (let i = 0; i < 5; i++) {
    const ax = -300 + i * 660;
    ctx.beginPath(); ctx.moveTo(ax, gy - 700); ctx.lineTo(ax, gy - 1180); ctx.arc(ax + 190, gy - 1180, 190, Math.PI, 0); ctx.lineTo(ax + 380, gy - 700); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = bright ? '#3d2c17' : '#1d1710'; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  ctx.fillStyle = 'rgba(255,230,170,0.12)'; ctx.fillRect(-800, gy, 3760, 12);
}
function hallBg(gy) {
  vgrad(-400, gy + 40, [[0, '#05060e'], [1, '#131828']]);
  ctx.fillStyle = '#0a0c14'; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  // side walls par halki neeli light strips (hall ka mahaul)
  ctx.fillStyle = 'rgba(90,140,220,0.10)';
  ctx.fillRect(-760, 500, 26, 1500); ctx.fillRect(2894, 500, 26, 1500);
}

// ---------------- PVR helpers ----------------
function pvrBuilding(cx, gy, w, f, lit = true) {
  const top = gy - 1240;
  // 3D depth: peeche ki taraf jaati hui angled side deewarein
  ctx.fillStyle = '#1a2233';
  ctx.beginPath(); ctx.moveTo(cx - w / 2, top + 30); ctx.lineTo(cx - w / 2 - 95, top + 115); ctx.lineTo(cx - w / 2 - 95, gy - 40); ctx.lineTo(cx - w / 2, gy); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx + w / 2, top + 30); ctx.lineTo(cx + w / 2 + 95, top + 115); ctx.lineTo(cx + w / 2 + 95, gy - 40); ctx.lineTo(cx + w / 2, gy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,205,110,0.20)';
  ctx.fillRect(cx - w / 2 - 95, top + 115, 7, gy - 40 - top - 115); ctx.fillRect(cx + w / 2 + 88, top + 115, 7, gy - 40 - top - 115);
  ctx.fillStyle = '#232b3d'; D.rr(ctx, cx - w / 2, top, w, 1240, 12); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#2e3850'; ctx.fillRect(cx - w / 2, top, w, 90);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
    const wx = cx - w / 2 + 56 + c * (w - 112) / 6, wy = top + 150 + r * 128;
    const on = lit && hash(r * 7 + c * 3) > 0.35;
    ctx.fillStyle = on ? `rgba(255,217,138,${0.75 + 0.25 * Math.sin(f * 0.11 + c + r * 2)})` : '#39445c';
    ctx.fillRect(wx, wy, (w - 112) / 6 - 26, 88);
    ctx.strokeStyle = 'rgba(10,12,18,0.6)'; ctx.lineWidth = 3; ctx.strokeRect(wx, wy, (w - 112) / 6 - 26, 88);
  }
  const sw = w * 0.52, sh = 190, sx = cx - sw / 2, sy = top - 215;
  lampPool(cx, sy + sh / 2, sw * 0.8, lit ? 0.34 : 0.12);
  ctx.fillStyle = '#5d1620'; D.rr(ctx, sx, sy, sw, sh, 16); ctx.fill(); ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#ffd94d';
  const nb = 14;
  for (let i = 0; i <= nb; i++) { const bx = sx + 18 + (sw - 36) * i / nb; const fl = 0.55 + 0.45 * Math.sin(f * 0.35 + i * 1.3); ctx.globalAlpha = lit ? fl : 0.3; D.circ(ctx, bx, sy + 16, 8); ctx.fill(); D.circ(ctx, bx, sy + sh - 16, 8); ctx.fill(); }
  ctx.globalAlpha = 1;
  text('PVR', cx, sy + sh / 2 + 4, 128, '#ffe9a8');
  for (const sgn of [-1, 1]) {
    const px = cx + sgn * (w / 2 - 128), py = gy - 560;
    ctx.fillStyle = sgn < 0 ? '#31517a' : '#7a5a1f'; D.rr(ctx, px - 82, py - 210, 164, 420, 8); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.20)'; D.circ(ctx, px, py - 90, 44); ctx.fill(); ctx.fillRect(px - 56, py - 20, 112, 26); ctx.fillRect(px - 56, py + 30, 112, 18);
    text(sgn < 0 ? 'FILM' : 'DHAMAKA', px, py + 152, 32, '#f5edd8');
  }
  const ew = w * 0.44, ex = cx - ew / 2;
  ctx.fillStyle = lit ? 'rgba(150,210,240,0.5)' : 'rgba(90,120,150,0.35)'; ctx.fillRect(ex, gy - 430, ew, 430);
  ctx.strokeStyle = '#0e1420'; ctx.lineWidth = 7; ctx.strokeRect(ex, gy - 430, ew, 430);
  ctx.beginPath(); ctx.moveTo(cx, gy - 430); ctx.lineTo(cx, gy); ctx.stroke();
  if (lit) lampPool(cx, gy - 200, 380, 0.22);
  text('TICKETS • POPCORN • DRINKS', cx, gy - 486, 36, '#ffd94d');
}
// Popcorn tub: laal-safed dhariyon wala trapezoid + upar phuule daane.
function tubDraw(x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 118, 74, 13, 0.28);
  ctx.save();
  D.poly(ctx, [[-72, -104], [72, -104], [54, 112], [-54, 112]]); ctx.clip();
  ctx.fillStyle = '#f5edd8'; ctx.fillRect(-74, -106, 148, 220);
  ctx.fillStyle = '#c62828';
  for (let i = -2; i < 3; i++) ctx.fillRect(i * 34 - 9, -106, 18, 220);
  ctx.fillStyle = 'rgba(0,0,0,0.10)'; ctx.fillRect(28, -106, 46, 220);
  ctx.restore();
  D.poly(ctx, [[-72, -104], [72, -104], [54, 112], [-54, 112]]); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.fillStyle = '#f5edd8'; ctx.fillRect(-76, -116, 152, 18);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.strokeRect(-76, -116, 152, 18);
  const puffs = [[-52, -128], [-26, -142], [0, -148], [26, -140], [52, -126], [-38, -118], [38, -116], [0, -128]];
  for (const [px, py] of puffs) {
    ctx.fillStyle = '#fdf6dd'; D.circ(ctx, px, py, 17); ctx.fill();
    ctx.fillStyle = '#f2d98c'; D.circ(ctx, px + 4, py + 4, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(120,90,30,0.35)'; ctx.lineWidth = 2; D.circ(ctx, px, py, 17); ctx.stroke();
  }
  if (o.label) { ctx.fillStyle = '#ffffff'; D.rr(ctx, -75, -34, 150, 52, 8); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 3.5; ctx.stroke(); text(o.label, 0, -7, 24, '#c62828'); }
  ctx.restore();
}
// Rubber stamp: ghumaa hua, dashed kinara (scale spring se aata hai).
function stampDraw(x, y, w, h, lines, col, rot, sc) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = 0.94;
  ctx.strokeStyle = col; ctx.lineWidth = 9; D.rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.stroke();
  ctx.lineWidth = 3.5; ctx.setLineDash([16, 10]); D.rr(ctx, -w / 2 + 15, -h / 2 + 15, w - 30, h - 30, 8); ctx.stroke(); ctx.setLineDash([]);
  lines.forEach((ln, i) => text(ln[0], 0, (i - (lines.length - 1) / 2) * (h * 0.5), ln[1], col));
  ctx.restore();
}

// Badi cinema screen. mode: 'chase' (chalti mini-film), 'frozen', 'interval', 'plain'
function cinemaScreen(x, y, w, h, f, mode) {
  ctx.save(); ctx.translate(x, y);
  lampPool(0, 0, w * 0.62, mode === 'interval' ? 0.30 : 0.16);
  ctx.fillStyle = '#05070c'; D.rr(ctx, -w / 2 - 16, -h / 2 - 16, w + 32, h + 32, 10); ctx.fill(); ctx.strokeStyle = '#3a2a16'; ctx.lineWidth = 8; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip();
  if (mode === 'chase') {
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, '#2c4a72'); g.addColorStop(0.62, '#7a5a8a'); g.addColorStop(0.63, '#1c1c22'); g.addColorStop(1, '#101014');
    ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = '#141c2e';
    const off = (f * 7) % 300;
    for (let bx = -w / 2 - 300 + off; bx < w / 2 + 300; bx += 300) {
      ctx.fillRect(bx, -h * 0.06, 170, h * 0.30);
      ctx.fillStyle = 'rgba(255,217,138,0.8)';
      for (let wy = 0; wy < 3; wy++) for (let wx = 0; wx < 3; wx++) if (hash(bx + wx * 9 + wy * 31) > 0.45) ctx.fillRect(bx + 18 + wx * 52, -h * 0.02 + wy * 44, 24, 28);
      ctx.fillStyle = '#141c2e';
    }
    ctx.fillStyle = '#ffd94d';
    const loff = (f * 22) % 190;
    for (let lx = -w / 2 - 190 + loff; lx < w / 2; lx += 190) ctx.fillRect(lx, h * 0.33, 105, 13);
    const car = (cx, cy, col, sc) => {
      ctx.save(); ctx.translate(cx, cy + Math.sin(f * 0.9 + cx) * 3); ctx.scale(sc, sc);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-150 - i * 16, -58 + i * 26); ctx.lineTo(-104 - i * 16, -58 + i * 26); ctx.stroke(); }
      ctx.fillStyle = col; D.rr(ctx, -105, -52, 210, 56, 16); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = col; D.rr(ctx, -58, -86, 104, 42, 13); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#bfe3f2'; ctx.fillRect(-46, -80, 38, 30); ctx.fillRect(6, -80, 32, 30);
      ctx.fillStyle = '#ffe9a8'; D.circ(ctx, 104, -22, 10); ctx.fill();
      lampPool(150, -22, 90, 0.35);
      ctx.fillStyle = '#14161a'; D.circ(ctx, -58, 6, 21); ctx.fill(); D.circ(ctx, 58, 6, 21); ctx.fill();
      ctx.fillStyle = '#8b93a1'; D.circ(ctx, -58, 6, 9); ctx.fill(); D.circ(ctx, 58, 6, 9); ctx.fill();
      ctx.restore();
    };
    car(-w * 0.16 + Math.sin(f * 0.21) * 16, h * 0.24, '#31517a', 1.0);
    car(-w * 0.36 + Math.sin(f * 0.17 + 2) * 13, h * 0.30, '#9e2b25', 0.82);
    text('FILM CHAL RAHI HAI...', 0, -h / 2 + 52, 40, 'rgba(245,237,216,0.85)');
  } else if (mode === 'frozen') {
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, '#24344e'); g.addColorStop(0.63, '#191922'); g.addColorStop(1, '#0e0e12');
    ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = '#141c2e'; ctx.fillRect(-w / 2 + 60, -h * 0.05, 200, h * 0.3); ctx.fillRect(w / 2 - 320, -h * 0.02, 230, h * 0.28);
    ctx.fillStyle = '#31517a'; D.rr(ctx, -w * 0.18, h * 0.10, 230, 60, 16); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#14161a'; D.circ(ctx, -w * 0.18 + 42, h * 0.10 + 64, 22); ctx.fill(); D.circ(ctx, -w * 0.18 + 188, h * 0.10 + 64, 22); ctx.fill();
    for (let i = 0; i < 130; i++) { ctx.fillStyle = `rgba(255,255,255,${0.05 + hash(i * 3.3) * 0.10})`; ctx.fillRect(-w / 2 + hash(i * 1.3) * w, -h / 2 + hash(i * 2.9) * h, 7, 7); }
    ctx.fillStyle = 'rgba(255,217,77,0.92)';
    ctx.fillRect(-52, -64, 34, 128); ctx.fillRect(18, -64, 34, 128);
    text('FILM RUK GAYI', 0, h / 2 - 52, 42, 'rgba(245,237,216,0.8)');
  } else if (mode === 'interval') {
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, '#8a6a20'); g.addColorStop(1, '#5d4510');
    ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
    text('INTERVAL', 0, -20, 118, '#ffe9a8');
    text('— COUNTER KHUL GAYA —', 0, 84, 44, '#f5edd8');
  } else {
    ctx.fillStyle = '#1a2233'; ctx.fillRect(-w / 2, -h / 2, w, h);
  }
  ctx.restore();
  ctx.restore();
}
// Seat rows (foreground ke bade seat-backs ke liye)
function seatRows(cx, gy, f) {
  for (const [ry, sc, al] of [[gy - 330, 0.9, 0.55], [gy - 170, 1.15, 0.8], [gy + 10, 1.45, 1]]) {
    ctx.save(); ctx.globalAlpha = al;
    for (let i = 0; i < 7; i++) {
      const sx = cx - 780 + i * 260 + (sc > 1.2 ? 60 : 0);
      ctx.fillStyle = '#4a1420'; D.rr(ctx, sx - 88 * sc, ry - 120 * sc, 176 * sc, 150 * sc, 26 * sc); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 4; ctx.stroke();
      if (hash(i * 7 + ry) > 0.45) { ctx.fillStyle = '#0d0b09'; D.circ(ctx, sx, ry - 128 * sc, 30 * sc); ctx.fill(); }
    }
    ctx.restore();
  }
}
// ===== BHEED: khada insaani silhouette (sir + kandhe + shareer), chehra NAHI, ek kinare rim-light =====
function silFig(x, y, s, o = {}) {
  const col = o.col || '#0c0a08';
  const rim = o.rim || 'rgba(255,220,160,0.55)';
  const bob = o.bob || 0;
  ctx.save(); ctx.translate(x, y + bob); ctx.scale(s, s);
  ctx.fillStyle = col;
  D.circ(ctx, 0, -152, 24); ctx.fill();                       // sir
  D.rr(ctx, -37, -130, 74, 132, 20); ctx.fill();              // kandhe/shareer
  // rim light — sir ke upar aur ek kandhe par halki lakeer
  ctx.strokeStyle = rim; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -152, 24, Math.PI * 1.08, Math.PI * 1.72); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-35, -118); ctx.lineTo(-35, -30); ctx.stroke();
  if (o.tub) { // haath me chhota tub silhouette
    ctx.fillStyle = col;
    D.poly(ctx, [[16, -84], [58, -84], [50, -34], [24, -34]]); ctx.fill();
    D.circ(ctx, 26, -88, 9); ctx.fill(); D.circ(ctx, 40, -92, 10); ctx.fill(); D.circ(ctx, 52, -87, 8); ctx.fill();
    ctx.strokeStyle = rim; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(18, -86); ctx.lineTo(56, -86); ctx.stroke();
  }
  if (o.phone) { ctx.fillStyle = 'rgba(165,205,255,0.55)'; ctx.fillRect(20, -96, 15, 24); }
  ctx.restore();
}
// ===== BHEED: hall ki bhari hui seat rows — har seat par sir+kandhe silhouette, rim-lit, kuch ke paas tub =====
// lit: 0..1 screen ki roshni ki taakat (rim + seat chamak)
function crowdRows(cx, gy, f, lit = 1) {
  const rows = [
    [gy - 560, 0.82, 9, 0.62], [gy - 385, 1.02, 8, 0.78], [gy - 185, 1.28, 7, 0.92], [gy + 45, 1.58, 6, 1],
  ];
  for (const [ry, sc, n, al] of rows) {
    ctx.save(); ctx.globalAlpha = al;
    const span = 1720;
    for (let i = 0; i < n; i++) {
      const sx = cx - span / 2 + (span / (n - 1)) * i;
      const bob = Math.sin(f * 0.045 + i * 1.93 + ry * 0.01) * 3.2 * sc;
      // seat back
      ctx.fillStyle = '#431220'; D.rr(ctx, sx - 92 * sc, ry - 118 * sc, 184 * sc, 148 * sc, 26 * sc); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 4; ctx.stroke();
      // sir + kandhe (silhouette)
      const hy = ry - 128 * sc + bob;
      ctx.fillStyle = '#0b0908';
      D.circ(ctx, sx, hy, 31 * sc); ctx.fill();
      D.rr(ctx, sx - 44 * sc, hy + 16 * sc, 88 * sc, 52 * sc, 20 * sc); ctx.fill();
      // rim light — screen ki taraf se sir ke upar chaand-si lakeer
      ctx.strokeStyle = `rgba(175,208,255,${0.5 * lit})`; ctx.lineWidth = 3.4 * sc; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(sx, hy, 31 * sc, Math.PI * 1.12, Math.PI * 1.78); ctx.stroke();
      // kuch ke haath me tub / phone
      const hsh = hash(i * 7.7 + ry);
      if (hsh > 0.62) {
        ctx.fillStyle = '#0b0908';
        const tx = sx + 52 * sc, ty = hy + 58 * sc;
        D.poly(ctx, [[tx - 20 * sc, ty - 26 * sc], [tx + 20 * sc, ty - 26 * sc], [tx + 15 * sc, ty + 22 * sc], [tx - 15 * sc, ty + 22 * sc]]); ctx.fill();
        D.circ(ctx, tx - 8 * sc, ty - 30 * sc, 8 * sc); ctx.fill(); D.circ(ctx, tx + 6 * sc, ty - 33 * sc, 9 * sc); ctx.fill();
        ctx.strokeStyle = `rgba(255,220,160,${0.4 * lit})`; ctx.lineWidth = 2.4 * sc;
        ctx.beginPath(); ctx.moveTo(tx - 18 * sc, ty - 28 * sc); ctx.lineTo(tx + 18 * sc, ty - 28 * sc); ctx.stroke();
      } else if (hsh < 0.16) {
        ctx.fillStyle = `rgba(165,205,255,${0.4 * lit})`; ctx.fillRect(sx - 40 * sc, hy + 40 * sc, 13 * sc, 20 * sc);
      }
    }
    ctx.restore();
  }
}
// Foreground bade sir (neeche ki kataar) — camera ke sabse paas wali bheed
function headsRow(y, f, lit = 1, alpha = 0.96) {
  ctx.save(); ctx.globalAlpha = alpha;
  for (let i = 0; i < 6; i++) {
    const sx = 300 + i * 330 + Math.sin(f * 0.04 + i * 2.4) * 5;
    const r = 62 + hash(i * 3.3) * 14;
    ctx.fillStyle = '#080606';
    D.circ(ctx, sx, y, r); ctx.fill();
    D.rr(ctx, sx - r * 1.25, y + r * 0.5, r * 2.5, r * 1.5, 30); ctx.fill();
    ctx.strokeStyle = `rgba(175,208,255,${0.45 * lit})`; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(sx, y, r, Math.PI * 1.1, Math.PI * 1.8); ctx.stroke();
  }
  ctx.restore();
}
// Counter desk + upar ki shelf par tubs ki kataar
function counterDesk(cx, gy, w) {
  ctx.fillStyle = '#3a2415'; ctx.fillRect(cx - w / 2, gy - 330, w, 330);
  ctx.fillStyle = '#5d3a1e'; ctx.fillRect(cx - w / 2, gy - 330, w, 40);
  ctx.fillStyle = 'rgba(170,220,245,0.30)'; ctx.fillRect(cx - w / 2 + 26, gy - 262, w - 52, 120);
  ctx.strokeStyle = '#14100a'; ctx.lineWidth = 5; ctx.strokeRect(cx - w / 2 + 26, gy - 262, w - 52, 120);
  ctx.fillStyle = '#241708'; ctx.fillRect(cx - w / 2, gy - 142, w, 142);
  text('POPCORN  •  COLD DRINK  •  NACHOS', cx, gy - 372, 40, '#ffd94d');
}
// Print hoti receipt: upar slot, kagaz neeche badhta hai (prog 0..1)
function receiptDraw(x, yTop, w, prog, lines) {
  const fullH = 880, hh = Math.max(30, fullH * prog);
  ctx.fillStyle = '#221d18'; D.rr(ctx, x - w / 2 - 30, yTop - 64, w + 60, 74, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#120e0a'; ctx.fillRect(x - w / 2 + 16, yTop - 26, w - 32, 12);
  ctx.save();
  ctx.beginPath(); ctx.rect(x - w / 2, yTop, w, hh); ctx.clip();
  ctx.fillStyle = '#f7f2e4'; ctx.fillRect(x - w / 2, yTop, w, fullH);
  text('PVR CINEMAS', x, yTop + 58, 44, '#26221f');
  ctx.fillStyle = 'rgba(38,34,31,0.5)'; ctx.fillRect(x - w / 2 + 34, yTop + 96, w - 68, 4);
  lines.forEach((ln, i) => {
    const ly = yTop + 168 + i * 92;
    text(ln[0], x - w / 2 + 36, ly, 34, '#3a352f', 'left');
    text(ln[1], x + w / 2 - 40, ly, 34, '#26221f', 'right');
  });
  ctx.restore();
  if (prog > 0.03) {
    ctx.fillStyle = '#f7f2e4';
    ctx.beginPath(); ctx.moveTo(x - w / 2, yTop + hh);
    for (let i = 0; i < 10; i++) { ctx.lineTo(x - w / 2 + (i + 0.5) * w / 10, yTop + hh + 14); ctx.lineTo(x - w / 2 + (i + 1) * w / 10, yTop + hh); }
    ctx.closePath(); ctx.fill();
  }
}
// Pyaas meter: gol upar wala gauge, neele rang se bharta hai
function meterDraw(x, y, w, h, fill01) {
  ctx.save(); ctx.translate(x, y);
  lampPool(0, -h / 2 - 60, 190, 0.18);
  ctx.fillStyle = '#14100a'; D.rr(ctx, -w / 2 - 56, -h / 2 - 128, w + 112, 108, 12); ctx.fill(); ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 5; ctx.stroke();
  text('PYAAS', 0, -h / 2 - 74, 48, '#ffd94d');
  ctx.fillStyle = '#1b2534'; D.rr(ctx, -w / 2, -h / 2, w, h, w / 2); ctx.fill(); ctx.strokeStyle = '#8b93a1'; ctx.lineWidth = 6; ctx.stroke();
  ctx.save(); ctx.beginPath(); D.rr(ctx, -w / 2 + 8, -h / 2 + 8, w - 16, h - 16, w / 2); ctx.clip();
  const fh = (h - 16) * D.clamp(fill01, 0, 1);
  const g = ctx.createLinearGradient(0, h / 2, 0, -h / 2);
  g.addColorStop(0, '#1d6fb8'); g.addColorStop(1, '#5ec2e8');
  ctx.fillStyle = g; ctx.fillRect(-w / 2, h / 2 - fh, w, fh);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let i = 0; i < 6; i++) { const by = h / 2 - ((fill01 * 900 + i * 130) % Math.max(20, fh)); D.circ(ctx, -w / 4 + hash(i * 3) * w / 2, by, 6 + hash(i) * 5); ctx.fill(); }
  ctx.restore();
  ctx.strokeStyle = 'rgba(245,237,216,0.6)'; ctx.lineWidth = 4;
  for (let i = 1; i < 4; i++) { const ty = -h / 2 + i * h / 4; ctx.beginPath(); ctx.moveTo(w / 2 - 20, ty); ctx.lineTo(w / 2 + 2, ty); ctx.stroke(); }
  ctx.restore();
}
// Cold drink glass: cola + bulbule + straw + condensation
function drinkDraw(x, y, s, f) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 128, 62, 11, 0.28);
  ctx.save(); D.poly(ctx, [[-52, -118], [52, -118], [40, 122], [-40, 122]]); ctx.clip();
  ctx.fillStyle = '#4a1f10'; ctx.fillRect(-54, -120, 108, 244);
  ctx.fillStyle = '#6e3418'; ctx.fillRect(-54, -120, 108, 30);
  ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fillRect(-40, -120, 14, 244);
  ctx.fillStyle = 'rgba(255,220,170,0.75)';
  for (let i = 0; i < 9; i++) { const bx = -36 + hash(i * 2.7) * 72, by = 110 - ((f * (1.6 + hash(i) * 1.6) + i * 47) % 215); D.circ(ctx, bx, by, 3.5 + hash(i * 5) * 4); ctx.fill(); }
  ctx.restore();
  D.poly(ctx, [[-52, -118], [52, -118], [40, 122], [-40, 122]]); ctx.strokeStyle = 'rgba(230,240,248,0.85)'; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
  // condensation boondein glass ke bahar
  ctx.fillStyle = 'rgba(210,235,250,0.65)';
  for (let i = 0; i < 5; i++) { const cxx = -34 + hash(i * 4.1) * 68, cyy = -70 + ((f * 0.7 + i * 53) % 150); D.circ(ctx, cxx, cyy, 3.4); ctx.fill(); }
  ctx.strokeStyle = '#c62828'; ctx.lineWidth = 13; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(16, -112); ctx.lineTo(44, -168); ctx.stroke();
  ctx.restore();
}
// Badi ghadi (clock): haath angle par rukta hai
function clockDraw(x, y, r, handA, f) {
  ctx.save(); ctx.translate(x, y);
  lampPool(0, 0, r * 1.5, 0.14);
  ctx.fillStyle = '#f5edd8'; D.circ(ctx, 0, 0, r); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 9; ctx.stroke();
  ctx.strokeStyle = '#3a352f'; ctx.lineWidth = 6;
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82); ctx.lineTo(Math.cos(a) * r * 0.93, Math.sin(a) * r * 0.93); ctx.stroke(); }
  ctx.strokeStyle = '#26221f'; ctx.lineCap = 'round';
  ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(-Math.PI / 2 + 1.1) * r * 0.52, Math.sin(-Math.PI / 2 + 1.1) * r * 0.52); ctx.stroke();
  ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(handA) * r * 0.74, Math.sin(handA) * r * 0.74); ctx.stroke();
  ctx.strokeStyle = '#c62828'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(handA * 3) * r * 0.85, Math.sin(handA * 3) * r * 0.85); ctx.stroke();
  ctx.fillStyle = '#c62828'; D.circ(ctx, 0, 0, 13); ctx.fill();
  ctx.restore();
}
// ₹100 ka note: hara note, 78% hissa sunehra alag
function noteDraw(x, y, w, h, goldProg) {
  ctx.save(); ctx.translate(x, y);
  D.softShadow(ctx, 0, h / 2 + 18, w * 0.52, 20, 0.3);
  ctx.fillStyle = '#2e7d46'; D.rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.strokeStyle = 'rgba(245,237,216,0.7)'; ctx.lineWidth = 3; D.rr(ctx, -w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 10); ctx.stroke();
  ctx.globalAlpha = 1 - D.clamp(goldProg, 0, 1) * 0.92;
  text('₹100', -w / 2 + 96, -h / 2 + 62, 58, '#f5edd8');
  text('100', 0, 6, 120, 'rgba(245,237,216,0.9)');
  text('EK SAU RUPAYE', 0, h / 2 - 52, 36, 'rgba(245,237,216,0.75)');
  ctx.globalAlpha = 1;
  text('₹100', w / 2 - 96, h / 2 - 62, 58, '#f5edd8');
  if (goldProg > 0) {
    const gw = (w - 8) * 0.78 * D.clamp(goldProg, 0, 1);
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + 4, -h / 2 + 4, gw, h - 8); ctx.clip();
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, '#f2c14e'); g.addColorStop(1, '#d9a52e');
    ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, gw + 8, h);
    text('₹78', -w / 2 + 120, 6, 92, '#5d3a08');
    ctx.restore();
    ctx.strokeStyle = '#fff3c4'; ctx.lineWidth = 5; ctx.setLineDash([14, 10]);
    ctx.beginPath(); ctx.moveTo(-w / 2 + 4 + gw, -h / 2 + 6); ctx.lineTo(-w / 2 + 4 + gw, h / 2 - 6); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.restore();
}
// Petrol pump: unit + screen + pipe + nozzle
function pumpDraw(x, gy, s, f) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  D.softShadow(ctx, 0, 8, 190, 20, 0.32);
  ctx.fillStyle = '#7a8899'; D.rr(ctx, -130, -700, 260, 700, 18); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#c62828'; ctx.fillRect(-130, -700, 260, 84);
  text('PETROL', 0, -656, 46, '#ffffff');
  ctx.fillStyle = '#dff2fa'; D.rr(ctx, -92, -580, 184, 150, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  text('₹106.31', 0, -520, 44, '#14532d');
  text('PER LITRE', 0, -472, 26, '#59616e');
  ctx.fillStyle = '#39445c'; D.rr(ctx, -92, -390, 184, 200, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  D.circ(ctx, 0, -290, 52); ctx.fillStyle = '#59616e'; ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  text('P', 0, -288, 56, '#f5edd8');
  ctx.strokeStyle = '#14161a'; ctx.lineWidth = 17; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(130, -560); ctx.bezierCurveTo(230, -520, 218, -300, 196, -218); ctx.stroke();
  ctx.save(); ctx.translate(196, -200); ctx.rotate(0.5);
  ctx.fillStyle = '#26221f'; D.rr(ctx, -17, -58, 34, 92, 9); ctx.fill();
  ctx.fillStyle = '#8b93a1'; ctx.fillRect(-7, 30, 14, 44);
  ctx.restore();
  ctx.restore();
}
// Sikke ki kataar (coin stack) — munafa wale shots ke liye
function coinStack(x, baseY, n, r = 34) {
  for (let i = 0; i < n; i++) {
    const cy = baseY - i * 15;
    ctx.fillStyle = i % 2 ? '#d9a52e' : '#f2c14e';
    D.ell(ctx, x, cy, r, r * 0.34); ctx.fill();
    ctx.strokeStyle = '#8a5f10'; ctx.lineWidth = 2.5; ctx.stroke();
  }
  if (n > 0) text('₹', x, baseY - n * 15 - 16, 34, '#ffd94d');
}

/* =====================================================================
   TIMING — PVR Popcorn Scam EP-4 CINEMATIC (voice_final, TOTAL 1425 @30fps)
   S1 0 | S2 84 | S3 200 | S4 344 | S5 409 | S6 538 | S7 722 | S8 819
   S9 949 | S10 1202 | S11 1327 | END 1425
   ===================================================================== */

// ===== C1a (0–44) S1 — LOW ANGLE: raat me PVR facade, neon sign, geeli sadak ki chamak, board "SABSE BADA SCAM" =====
shot(0, 44, 0.3, { cx: 1080, cy: 1720, s: 0.80 }, { cx: 1080, cy: 1660, s: 0.95 }, (f, u) => {
  const lf = f - 0;
  layer(0.5, () => nightBg(GY));
  layer(0.85, () => pvrBuilding(1200, GY, 860, f, true));
  layer(1, () => {
    lampPost(660, GY, 1.05, f);
    lightCone(1080, 1970, 2400, 300, 760, 0.07);
    wetReflect(1080, 2405, 620, 300, 0.15);
    wetReflect(726, 2405, 130, 170, 0.10);
    dust(f, 1080, 1900, 700, 12, 0.22);
    if (lf > 10) { const p = spring((lf - 10) / 11); darkBoard(1080, 1300, 660, 170, [['SABSE BADA SCAM', 64, '#ff8a5c']], p); }
  });
}, []);
// ===== C1b (44–84) S1b — MACRO: bada tub, bhaap, girte daane; laal "SCAM" stamp slam (hit 64) =====
shot(44, 84, 0.32, { cx: 1080, cy: 1580, s: 1.15 }, { cx: 1080, cy: 1520, s: 1.35 }, (f, u) => {
  const lf = f - 44;
  layer(0.5, () => lobbyBg(GY, false));
  layer(1, () => {
    lampPool(1080, 1750, 720, 0.22);
    lightCone(1080, 900, 1750, 260, 900, 0.08);
    // table par bikhre daane
    ctx.fillStyle = '#fdf6dd';
    for (const [kx, ky, kr] of [[790, 2130, 15], [880, 2180, 12], [1300, 2145, 14], [1380, 2200, 11], [720, 2210, 10], [1230, 2215, 12]]) { D.circ(ctx, kx, ky, kr); ctx.fill(); ctx.fillStyle = '#f2d98c'; D.circ(ctx, kx + 3, ky + 3, kr * 0.4); ctx.fill(); ctx.fillStyle = '#fdf6dd'; }
    ctx.fillStyle = '#3a2415'; ctx.fillRect(560, 2190, 1040, 26);
    tubDraw(1080, 1850, 2.9, { label: 'POPCORN' });
    steam(1080, 1560, f, 1.5);
    // namak ki chamak puffs par
    D.drawSparkle(ctx, 990, 1445, 20, 0.8); D.drawSparkle(ctx, 1170, 1420, 15, 0.6);
    if (lf >= 18) { const p = spring((lf - 18) / 7); stampDraw(1080, 1720, 660, 250, [['SCAM', 125]], '#e53935', -0.2, p); }
    else text('POPCORN KI KEEMAT?', 1080, 1120, 54, '#ffd94d');
  });
}, [64]);
// ===== C2a (84–140) S2 — HALL FULL HOUSE: screen par chalti mini-film, bheed bhari seat rows, aisle dolly =====
shot(84, 140, 0.3, { cx: 1080, cy: 1580, s: 0.62 }, { cx: 1080, cy: 1520, s: 0.74 }, (f, u) => {
  layer(0.5, () => hallBg(GY));
  layer(0.65, () => {
    // PURA HALL 3D: screen ki taraf sikudti side deewarein (corner-view depth)
    ctx.fillStyle = '#101725';
    ctx.beginPath(); ctx.moveTo(-800, 150); ctx.lineTo(430, 860); ctx.lineTo(430, 1560); ctx.lineTo(-800, 2560); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(2960, 150); ctx.lineTo(1730, 860); ctx.lineTo(1730, 1560); ctx.lineTo(2960, 2560); ctx.closePath(); ctx.fill();
    // deewaron par sunehri strip lights (screen ki taraf jaati)
    ctx.strokeStyle = 'rgba(255,205,110,0.35)'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(-700, 700); ctx.lineTo(430, 1080); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2860, 700); ctx.lineTo(1730, 1080); ctx.stroke();
    // ceiling beams — screen ki taraf converge
    ctx.strokeStyle = 'rgba(255,210,130,0.16)'; ctx.lineWidth = 12;
    for (const bx of [-400, 500, 1400, 2300]) { ctx.beginPath(); ctx.moveTo(bx, 120); ctx.lineTo(1080 + (bx - 1080) * 0.42, 850); ctx.stroke(); }
    // floor perspective grid — neeche chauda, screen ke paas sikudta
    ctx.strokeStyle = 'rgba(130,170,230,0.13)'; ctx.lineWidth = 5;
    for (let i = 0; i <= 6; i++) { const bx = -600 + i * 620; ctx.beginPath(); ctx.moveTo(bx, 2950); ctx.lineTo(1080 + (bx - 1080) * 0.16, 1580); ctx.stroke(); }
    for (const fy of [1950, 2200, 2500, 2850]) { ctx.beginPath(); ctx.moveTo(-700, fy); ctx.lineTo(2860, fy - 240); ctx.stroke(); }
    // EXIT signs — screen ke neeche dono taraf deewaron par
    ctx.fillStyle = '#14532d'; ctx.fillRect(454, 1728, 92, 44); text('EXIT', 500, 1754, 26, '#8ef0b3');
    ctx.fillStyle = '#14532d'; ctx.fillRect(1614, 1728, 92, 44); text('EXIT', 1660, 1754, 26, '#8ef0b3');
  });
  layer(0.8, () => cinemaScreen(1080, 1200, 1300, 680, f, 'chase'));
  layer(1, () => {
    lightCone(1080, 950, 1750, 200, 1500, 0.05);
    crowdRows(1080, GY, f, 1);
  });
}, []);
// ===== C2b (140–200) S2b — SCREEN PUNCH-IN: chase tez, neeche bade sir (foreground bheed), board "PURI FILM = DESIGN" =====
shot(140, 200, 0.32, { cx: 1080, cy: 1500, s: 0.98 }, { cx: 1080, cy: 1440, s: 1.26 }, (f, u) => {
  const lf = f - 140;
  layer(0.5, () => hallBg(GY));
  layer(0.85, () => cinemaScreen(1080, 1300, 1560, 820, f, 'chase'));
  layer(1, () => {
    if (lf > 34) { const p = spring((lf - 34) / 9); darkBoard(1080, 1290, 720, 180, [['PURI FILM = DESIGN', 58, '#ffc72c']], p); }
    crowdRows(1080, GY, f, 0.85);
    headsRow(2330, f, 1, 0.97);
  });
}, []);
// ===== C3a (200–248) S3 — TOP ANGLE duniya: teen videshi cinema, "NO INTERVAL" boards ek-ek pop, shaant bheed andar jaati =====
shot(200, 248, 0.28, { cx: 1080, cy: 1500, s: 0.72 }, { cx: 1080, cy: 1470, s: 0.82 }, (f, u) => {
  const lf = f - 200;
  layer(0.5, () => {
    vgrad(-400, GY + 40, [[0, '#0a2432'], [1, '#175263']]);
    ctx.fillStyle = 'rgba(120,220,190,0.16)';
    for (const [bx, by, br] of [[300, 700, 300], [1050, 560, 380], [1900, 760, 320], [700, 1250, 260], [1600, 1300, 300]]) { D.ell(ctx, bx, by + br * 0.8, br, br * 0.42); ctx.fill(); }
    ctx.fillStyle = '#12262e'; ctx.fillRect(-800, GY, 3760, 3840 - GY);
    // aasmaan me chhote sitare-bindu + cinemao ko jodti hui dashed arcs (global feel)
    ctx.fillStyle = 'rgba(220,245,235,0.5)';
    for (let i = 0; i < 26; i++) { D.circ(ctx, -500 + hash(i * 4.3) * 3100, -200 + hash(i * 6.1) * 900, 2.4 + hash(i) * 2); ctx.fill(); }
    ctx.strokeStyle = 'rgba(140,230,200,0.35)'; ctx.lineWidth = 4; ctx.setLineDash([18, 16]);
    ctx.beginPath(); ctx.arc(1080, 1560, 620, Math.PI * 1.18, Math.PI * 1.52); ctx.stroke();
    ctx.beginPath(); ctx.arc(1080, 1560, 620, Math.PI * 1.48, Math.PI * 1.82); ctx.stroke();
    ctx.setLineDash([]);
  });
  layer(1, () => {
    const cine = (cx, label, delay) => {
      lampPool(cx, 1720, 300, 0.16);
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; D.ell(ctx, cx, 1912, 170, 20); ctx.fill();
      ctx.fillStyle = '#2b3648'; D.rr(ctx, cx - 150, 1560, 300, 330, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = '#5d1620'; ctx.fillRect(cx - 150, 1560, 300, 64);
      text(label, cx, 1594, 38, '#ffe9a8');
      ctx.fillStyle = 'rgba(150,210,240,0.4)'; ctx.fillRect(cx - 100, 1660, 200, 150);
      if (lf > delay) { const p = spring((lf - delay) / 9); boardSign(cx, 1400, 330, 104, [['NO INTERVAL', 42, '#14532d']], p); }
    };
    cine(690, 'AMERICA', 6); cine(1080, 'LONDON', 17); cine(1470, 'JAPAN', 28);
    // shaant silhouettes — film dekhne andar jaate hue (rukte nahi)
    silFig(620, 2240, 1.05, { bob: Math.abs(Math.sin(f * 0.3)) * 6 });
    silFig(880, 2290, 1.2, { tub: true, bob: Math.abs(Math.sin(f * 0.3 + 2)) * 6 });
    silFig(1330, 2260, 1.1, { bob: Math.abs(Math.sin(f * 0.3 + 4)) * 6 });
    silFig(1560, 2300, 1.25, { phone: true, bob: Math.abs(Math.sin(f * 0.3 + 1)) * 6 });
    silFig(760, 2330, 1.3, { bob: Math.abs(Math.sin(f * 0.3 + 3)) * 6 });
    silFig(1470, 2345, 1.35, { tub: true, bob: Math.abs(Math.sin(f * 0.3 + 5)) * 6 });
  });
}, []);
// ===== C3b (248–344) S3b — videshi screen CLOSE: film bina ruke, ghadi tez ghoomti, progress bar bharta =====
shot(248, 344, 0.3, { cx: 1080, cy: 1520, s: 1.0 }, { cx: 1080, cy: 1490, s: 1.16 }, (f, u) => {
  const lf = f - 248;
  layer(0.5, () => hallBg(GY));
  layer(0.85, () => {
    cinemaScreen(1100, 1340, 1360, 700, f, 'chase');
    ctx.fillStyle = '#1b2534'; D.rr(ctx, 640, 1806, 880, 34, 17); ctx.fill(); ctx.strokeStyle = '#8b93a1'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#37d67a'; D.rr(ctx, 648, 1814, 864 * D.clamp(0.15 + lf / 96 * 0.85, 0, 1), 18, 9); ctx.fill();
  });
  layer(1, () => {
    text('FILM RUKTI HI NAHI', 1080, 1150, 48, '#8ef0b3');
    // tez ghoomti ghadi — waqt behta ja raha hai, film nahi rukti
    clockDraw(1400, 2060, 120, -Math.PI / 2 + lf * 0.32, f);
    headsRow(2360, f, 0.8, 0.9);
  });
}, []);
// ===== C4 (344–409) S4 — BHARAT HALL: film FREEZE, ghadi INTERVAL par atki, lights ON, darwaze khulte, bheed khadi =====
shot(344, 409, 0.3, { cx: 1080, cy: 1560, s: 0.78 }, { cx: 1080, cy: 1500, s: 0.92 }, (f, u) => {
  const lf = f - 344;
  layer(0.5, () => hallBg(GY));
  layer(0.8, () => cinemaScreen(1080, 1280, 1250, 640, f, lf < 10 ? 'chase' : 'frozen'));
  layer(1, () => {
    if (lf >= 22) { // lights on — hall me halki roshni failti hai
      const la = D.clamp((lf - 22) / 10, 0, 1) * 0.13;
      ctx.fillStyle = `rgba(255,226,160,${la})`; ctx.fillRect(300, 500, 1560, 1900);
      // khule darwaze — roshni ki dhaar
      ctx.fillStyle = 'rgba(255,220,150,0.75)'; ctx.fillRect(578, 1560, 124, 620); ctx.fillRect(1458, 1560, 124, 620);
      ctx.fillStyle = '#0d0b09'; ctx.fillRect(566, 1548, 12, 644); ctx.fillRect(1582, 1548, 12, 644);
      lightCone(640, 1560, 2300, 90, 260, 0.10); lightCone(1520, 1560, 2300, 90, 260, 0.10);
    }
    // ghadi: haath chalta hai, phir INTERVAL par ATAK jata hai (halka kaanpta hua)
    const handA = -Math.PI / 2 + Math.min(lf, 16) * 0.05 + (lf > 16 ? Math.sin((lf - 16) * 0.9) * 0.012 : 0);
    clockDraw(1450, 1130, 165, handA, f);
    crowdRows(1080, GY, f, lf < 10 ? 1 : 0.55);
    if (lf > 30) { const p = spring((lf - 30) / 10); darkBoard(1080, 2020, 980, 170, [['INTERVAL = DUKAAN KHULNE KA TIME', 46, '#ffd94d']], p); }
  });
}, []);
// ===== C5a (409–472) S5 — LOW ANGLE MACRO: band darwaza + zanjeer + bada taala, board "BAHAR KA KHANA MANA" =====
shot(409, 472, 0.3, { cx: 1080, cy: 1680, s: 0.95 }, { cx: 1080, cy: 1620, s: 1.12 }, (f, u) => {
  const lf = f - 409;
  layer(0.5, () => lobbyBg(GY, false));
  layer(1, () => {
    lightCone(1080, 700, 2100, 200, 800, 0.06);
    ctx.fillStyle = '#4c3421'; D.rr(ctx, 730, 1450, 700, 950, 12); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 8; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1080, 1450); ctx.lineTo(1080, 2400); ctx.stroke();
    ctx.fillStyle = '#2e2013'; ctx.fillRect(730, 1780, 700, 26);
    ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(730, 1620, 700, 9); ctx.fillRect(730, 2090, 700, 9);
    ctx.fillStyle = 'rgba(255,220,160,0.10)'; ctx.fillRect(742, 1450, 10, 950);
    D.circ(ctx, 1030, 1980, 17); ctx.fillStyle = '#c9a227'; ctx.fill();
    D.circ(ctx, 1130, 1980, 17); ctx.fill();
    ctx.strokeStyle = '#8b93a1'; ctx.lineWidth = 11;
    ctx.beginPath(); ctx.moveTo(760, 1900); ctx.lineTo(1400, 2060); ctx.stroke();
    ctx.save(); ctx.translate(1080, 2010); ctx.scale(1.6, 1.6);
    ctx.strokeStyle = '#8a8f99'; ctx.lineWidth = 15; ctx.beginPath(); ctx.arc(0, -30, 40, Math.PI, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#e8b64c'; D.rr(ctx, -66, -32, 132, 108, 14); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    D.circ(ctx, 0, 16, 13); ctx.fillStyle = '#4a3a10'; ctx.fill(); ctx.fillRect(-5, 22, 10, 24);
    ctx.restore();
    dust(f, 1080, 1700, 600, 10, 0.2);
    if (lf > 10) { const p = spring((lf - 10) / 11); darkBoard(1080, 1180, 800, 155, [['BAHAR KA KHANA MANA', 58, '#ff8a5c']], p); }
  });
}, []);
// ===== C5b (472–538) S5b — LIGHTS ON flip: INTERVAL screen, counter chamakta, bheed queue me counter ki taraf =====
shot(472, 538, 0.26, { cx: 1080, cy: 1500, s: 0.68 }, { cx: 1080, cy: 1450, s: 0.78 }, (f, u) => {
  const lf = f - 472;
  const lightsOn = lf >= 8;
  layer(0.5, () => lobbyBg(GY, lightsOn));
  layer(0.8, () => {
    if (lightsOn) cinemaScreen(1080, 1200, 1150, 460, f, 'interval');
    else cinemaScreen(1080, 1200, 1150, 460, f, 'plain');
    counterDesk(1080, GY - 40, 1400);
  });
  layer(1, () => {
    if (lightsOn) {
      lightCone(1080, 1450, 2350, 300, 1300, 0.06);
      // counter ke saamne khadi queue (peeche se silhouettes)
      silFig(880, 2330, 1.35, { tub: true });
      silFig(1090, 2360, 1.5, {});
      silFig(1300, 2330, 1.35, { phone: true });
      // peeche se counter ki taraf badhti bheed
      const walkers = [[740, 0.0], [960, 0.3], [1240, 0.15], [1420, 0.45]];
      for (const [bx, ph] of walkers) {
        const prog = D.clamp((lf - 8) / 50 + ph * 0.25, 0, 1);
        const yy = 2680 - prog * 260, ss = 1.3 - prog * 0.3;
        silFig(bx + Math.sin(f * 0.3 + ph * 9) * 6, yy, ss, { bob: Math.abs(Math.sin(f * 0.32 + ph * 7)) * 8, tub: ph > 0.2 });
      }
    } else {
      silFig(1090, 2360, 1.4, {});
      text('FILM KHATAM...?', 1080, 1900, 46, 'rgba(207,214,222,0.7)');
    }
    if (lf >= 8 && lf < 13) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(255,244,200,0.5)'; ctx.fillRect(0, 0, W, H); }
  });
}, []);
// ===== C6a (538–604) S6 — COUNTER WIDE: menu board "CHHOTA ₹350 / BADA ₹400", counter par tubs, saamne queue ki bheed =====
shot(538, 604, 0.28, { cx: 1080, cy: 1540, s: 0.74 }, { cx: 1080, cy: 1500, s: 0.86 }, (f, u) => {
  const lf = f - 538;
  layer(0.5, () => lobbyBg(GY, true));
  layer(0.85, () => {
    counterDesk(1150, GY, 1500);
    tubDraw(880, 1980, 1.05, {});
    tubDraw(1400, 1960, 1.3, {});
    // counter ke peeche tubon ki kataar (shelf board par rakhi hui)
    ctx.fillStyle = '#3a2a18'; D.rr(ctx, 950, 1888, 500, 20, 6); ctx.fill();
    ctx.fillStyle = 'rgba(255,220,150,0.25)'; ctx.fillRect(950, 1888, 500, 5);
    tubDraw(1050, 1830, 0.55, {}); tubDraw(1230, 1830, 0.55, {});
  });
  layer(1, () => {
    if (lf > 8) { const p = spring((lf - 8) / 11); darkBoard(1080, 1160, 940, 300, [['CHHOTA TUB  ₹350', 62, '#f5edd8'], ['BADA TUB  ₹400', 78, '#ffc72c']], p); }
  });
  layer(1.18, () => { // foreground: queue ke bade silhouette (camera ke paas)
    silFig(560, 2560, 1.9, {});
    silFig(1600, 2560, 1.9, { tub: true });
    silFig(1080, 2640, 2.1, {});
  });
}, []);
// ===== C6b (604–659) S6b — MACRO: do tubs aamne-saamne, BADA tub spring se bada hota hai =====
shot(604, 659, 0.28, { cx: 1090, cy: 1660, s: 1.1 }, { cx: 1090, cy: 1610, s: 1.3 }, (f, u) => {
  const lf = f - 604;
  layer(0.5, () => lobbyBg(GY, true));
  layer(1, () => {
    lightCone(1090, 800, 2000, 300, 1100, 0.07);
    ctx.fillStyle = '#3a2415'; ctx.fillRect(300, 2080, 1560, 320);
    ctx.fillStyle = '#5d3a1e'; ctx.fillRect(300, 2080, 1560, 34);
    tubDraw(840, 1980, 1.5, { label: 'CHHOTA' });
    const bs = 1.95 * (0.45 + 0.55 * spring(D.clamp(lf / 30, 0, 1)));
    tubDraw(1315, 1980, bs, { label: 'BADA' });
    darkBoard(850, 1540, 320, 108, [['₹350', 62, '#f5edd8']], 1);
    if (lf > 12) { const p = spring((lf - 12) / 10); darkBoard(1300, 1450, 350, 118, [['₹400', 70, '#ffc72c']], p); }
    if (lf > 30) {
      D.drawSparkle(ctx, 1470, 1620, 30, 0.9); D.drawSparkle(ctx, 1200, 1560, 22, 0.7);
      text('BADA = SMART?', 1090, 1210, 52, '#ffd94d');
    }
    dust(f, 1090, 1600, 800, 10, 0.2);
  });
}, []);
// ===== C6c (659–722) S6c — SILHOUETTE HAATH bada tub uthata hai; soch bubble "SIRF ₹50 ZYADA!" (hit 700) =====
shot(659, 722, 0.3, { cx: 1080, cy: 1760, s: 1.25 }, { cx: 1080, cy: 1720, s: 1.42 }, (f, u) => {
  const lf = f - 659;
  layer(0.5, () => lobbyBg(GY, true));
  layer(1, () => {
    lightCone(1150, 900, 2100, 260, 800, 0.08);
    // counter satah
    ctx.fillStyle = '#3a2415'; ctx.fillRect(560, 2140, 1040, 260);
    ctx.fillStyle = '#5d3a1e'; ctx.fillRect(560, 2140, 1040, 30);
    // tub: pehle satah par, phir haath uthata hai
    const lift = lf < 40 ? 0 : Math.min(1, (lf - 40) / 16);
    const tubY = 2080 - lift * 130, tubTilt = lift * 0.06;
    ctx.save(); ctx.translate(1150, tubY); ctx.rotate(tubTilt); ctx.translate(-1150, -tubY);
    tubDraw(1150, tubY, 1.7, { label: 'BADA' });
    ctx.restore();
    // silhouette baanh + haath (upar-dayein se aata hai, tub ka kinara pakadta hai)
    const reach = D.clamp(lf / 26, 0, 1);
    const hx = 1420 - reach * 150, hy = 1330 + reach * 480 - lift * 130;
    ctx.strokeStyle = '#0d0b09'; ctx.lineCap = 'round';
    ctx.lineWidth = 92; ctx.beginPath(); ctx.moveTo(1560, 1120); ctx.lineTo(hx + 60, hy - 130); ctx.stroke();
    ctx.lineWidth = 54; ctx.beginPath(); ctx.moveTo(hx + 60, hy - 130); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = '#0d0b09';
    D.circ(ctx, hx, hy, 48); ctx.fill(); // hatheli
    for (let fi = 0; fi < 3; fi++) { // ungliyaan tub ke kinare par (chhoti, rim se chipki)
      ctx.save(); ctx.translate(hx - 56 + fi * 34, hy + 24); ctx.rotate(0.5);
      D.rr(ctx, -12, 0, 24, 42, 10); ctx.fill(); ctx.restore();
    }
    ctx.strokeStyle = 'rgba(255,220,160,0.4)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(1560 - 46, 1120); ctx.lineTo(hx + 22, hy - 140); ctx.stroke();
    // soch bubble
    if (lf > 34) {
      const p = spring((lf - 34) / 9);
      ctx.save(); ctx.translate(950, 1420); ctx.scale(p, p);
      ctx.fillStyle = 'rgba(245,237,216,0.95)';
      D.ell(ctx, 0, 0, 215, 92); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
      D.circ(ctx, 130, 108, 20); ctx.fill(); D.circ(ctx, 158, 136, 12); ctx.fill();
      text('SIRF ₹50 ZYADA!', 0, -8, 47, '#7a4d12');
      ctx.restore();
    }
  });
}, [700]);
// ===== C7a (722–770) S7 — MACRO: namkeen tub, namak ki chamak, shaker se girta namak =====
shot(722, 770, 0.3, { cx: 1080, cy: 1700, s: 1.3 }, { cx: 1080, cy: 1650, s: 1.5 }, (f, u) => {
  const lf = f - 722;
  layer(0.5, () => lobbyBg(GY, true));
  layer(1, () => {
    lampPool(1000, 1750, 650, 0.2);
    lightCone(1000, 850, 1900, 240, 800, 0.08);
    tubDraw(950, 2000, 1.6, { label: 'NAMKEEN' });
    steam(950, 1760, f, 1.1);
    // namak shaker (kaanch jaisa, chhota) — tub ke kinare ki taraf jhuka, namak puffs par gir raha hai
    ctx.save(); ctx.translate(1245, 1560); ctx.rotate(0.72); ctx.scale(0.78, 0.78);
    ctx.fillStyle = 'rgba(190,215,235,0.38)'; D.rr(ctx, -34, -80, 68, 130, 12); ctx.fill();
    ctx.strokeStyle = '#14161c'; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(-29, 2, 58, 42);
    ctx.fillStyle = '#8b93a1'; ctx.fillRect(-36, -104, 72, 28);
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = 0; i < 14; i++) {
      const px = 1085 + hash(i * 3.7) * 85, py = 1500 + ((f * 6 + i * 67) % 240);
      D.circ(ctx, px, py, 3 + hash(i) * 2.5); ctx.fill();
    }
    // puffs par namak ke safed bindu + chamak
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (let i = 0; i < 12; i++) { D.circ(ctx, 860 + hash(i * 5.1) * 190, 1735 + hash(i * 2.9) * 60, 3); ctx.fill(); }
    D.drawSparkle(ctx, 905, 1720, 22, 0.9); D.drawSparkle(ctx, 1010, 1750, 16, 0.7);
    text('NAMKEEN!', 1150, 1350, 54, '#ffd94d');
  });
}, []);
// ===== C7b (770–819) S7b — PYAAS METER bharta hai, phir cold drink spring-in (bubbles + condensation) =====
shot(770, 819, 0.3, { cx: 1080, cy: 1740, s: 1.18 }, { cx: 1080, cy: 1690, s: 1.34 }, (f, u) => {
  const lf = f - 770;
  layer(0.5, () => lobbyBg(GY, true));
  layer(1, () => {
    lightCone(1000, 850, 2000, 260, 900, 0.07);
    lampPool(1030, 1500, 520, 0.16);
    meterDraw(1030, 1500, 110, 480, D.clamp((lf - 4) / 34, 0, 1));
    // neeche namkeen tub ka kinara (chain yaad dilata hai)
    tubDraw(900, 2240, 1.3, { label: 'NAMKEEN' });
    if (lf > 32) {
      const p = spring((lf - 32) / 9);
      ctx.save(); ctx.translate(1400, 2060); ctx.scale(p, p); ctx.translate(-1400, -2060);
      drinkDraw(1400, 2060, 1.4, f);
      ctx.restore();
      text('COLD DRINK BHI!', 1250, 1150, 46, '#5ec2e8');
    }
  });
}, []);
// ===== C8a (819–884) S8 — TOP-DOWN: receipt printer se nikalti hai (bill badhta hua) =====
shot(819, 884, 0.28, { cx: 1080, cy: 1540, s: 1.02 }, { cx: 1080, cy: 1500, s: 1.17 }, (f, u) => {
  const lf = f - 819;
  layer(0.5, () => lobbyBg(GY, false));
  layer(1, () => {
    lampPool(1080, 1650, 780, 0.15);
    lightCone(1080, 700, 1500, 200, 700, 0.06);
    receiptDraw(1080, 1280, 600, D.clamp(lf / 52, 0, 1), [
      ['POPCORN (NAMKEEN)', '₹350'],
      ['COLD DRINK', '₹300'],
      ['TOTAL', '₹650'],
    ]);
    text('BILL AA GAYA...', 1250, 1100, 46, '#ffd94d');
  });
}, []);
// ===== C8b (884–949) S8b — CLOSE PUNCH: receipt par stamps — NAMKEEN 5% hara (hit 900), CARAMEL 18% laal (hit 930); stamps khaali hisse par =====
shot(884, 949, 0.32, { cx: 1040, cy: 1720, s: 1.16 }, { cx: 1060, cy: 1670, s: 1.34 }, (f, u) => {
  const lf = f - 884;
  layer(0.5, () => lobbyBg(GY, false));
  layer(1, () => {
    lampPool(1000, 1700, 700, 0.14);
    ctx.save(); ctx.translate(905, 1330);
    D.softShadow(ctx, 6, 812, 250, 22, 0.32);
    ctx.fillStyle = '#f7f2e4'; ctx.fillRect(-235, 0, 470, 800);
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.strokeRect(-235, 0, 470, 800);
    text('PVR CINEMAS', 0, 52, 40, '#26221f');
    ctx.fillStyle = 'rgba(38,34,31,0.5)'; ctx.fillRect(-200, 88, 400, 4);
    text('NAMKEEN POPCORN', -200, 150, 30, '#3a352f', 'left'); text('₹350', 200, 150, 30, '#26221f', 'right');
    text('CARAMEL POPCORN', -200, 232, 30, '#3a352f', 'left'); text('₹400', 200, 232, 30, '#26221f', 'right');
    text('COLD DRINK', -200, 314, 30, '#3a352f', 'left'); text('₹300', 200, 314, 30, '#26221f', 'right');
    ctx.restore();
    if (lf >= 16) { const p = spring((lf - 16) / 6); stampDraw(915, 1760, 400, 145, [['NAMKEEN TAX 5%', 40]], '#2e9e4f', -0.14, p); }
    if (lf >= 46) { const p = spring((lf - 46) / 6); stampDraw(915, 1960, 430, 155, [['CARAMEL TAX 18%', 40]], '#e53935', 0.11, p); }
    tubDraw(1380, 2060, 0.95, { label: 'CARAMEL' });
  });
}, [900, 930]);
// ===== C9a (949–1010) S9 — EPIC WIDE: raat me roshan PVR, entrance par bheed andar jaati, reflections =====
shot(949, 1010, 0.28, { cx: 1080, cy: 1600, s: 0.6 }, { cx: 1080, cy: 1550, s: 0.74 }, (f, u) => {
  layer(0.5, () => nightBg(GY));
  layer(0.85, () => pvrBuilding(1210, GY, 1000, f, true));
  layer(1, () => {
    wetReflect(1210, 2405, 700, 320, 0.14);
    // forecourt perspective lines — building ki taraf converge (3D depth)
    ctx.strokeStyle = 'rgba(160,190,230,0.16)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(300, 2920); ctx.lineTo(1010, 2420); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1860, 2920); ctx.lineTo(1410, 2420); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(760, 2920); ctx.lineTo(1130, 2420); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1400, 2920); ctx.lineTo(1290, 2420); ctx.stroke();
    lampPost(620, GY, 1.1, f); lampPost(1690, GY, 1.1, f);
    // entrance ki taraf badhti bheed (chhoti silhouettes)
    silFig(950, 2420, 1.15, { bob: Math.abs(Math.sin(f * 0.3)) * 5 });
    silFig(1120, 2440, 1.3, { tub: true, bob: Math.abs(Math.sin(f * 0.3 + 2)) * 5 });
    silFig(1330, 2425, 1.2, { bob: Math.abs(Math.sin(f * 0.3 + 4)) * 5 });
    silFig(1480, 2450, 1.35, { phone: true, bob: Math.abs(Math.sin(f * 0.3 + 1)) * 5 });
    if (f > 975) text('EK SAAL KI KAMAI...', 1080, 1230, 54, '#ffd94d');
  });
}, []);
// ===== C9b (1010–1075) S9b — PUNCH-IN: ticking counter ₹2,088 CRORE, neeche bheed ke sir upar dekhte =====
shot(1010, 1075, 0.32, { cx: 1080, cy: 1540, s: 0.95 }, { cx: 1080, cy: 1500, s: 1.32 }, (f, u) => {
  const lf = f - 1010;
  layer(0.5, () => nightBg(GY));
  layer(1, () => {
    const n = Math.floor(2088 * sstep(D.clamp(lf / 46, 0, 1)));
    const nStr = n >= 1000 ? Math.floor(n / 1000) + ',' + String(n % 1000).padStart(3, '0') : String(n);
    ctx.save(); ctx.translate(1080, 1500);
    lampPool(0, 0, 700, 0.3);
    ctx.fillStyle = '#14100a'; D.rr(ctx, -350, -170, 700, 340, 14); ctx.fill();
    ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 7; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,199,44,0.5)'; ctx.lineWidth = 2.5; D.rr(ctx, -337, -157, 674, 314, 9); ctx.stroke();
    text('SIRF KHANE-PEENE SE', 0, -92, 52, '#ffd94d');
    text('₹' + nStr + ' CRORE', 0, 22, 84, '#ffc72c');
    text('— EK SAAL ME —', 0, 112, 40, '#f5edd8');
    ctx.restore();
    // sunehre kan upar uthte (paisa barsa)
    ctx.fillStyle = 'rgba(255,205,80,0.8)';
    for (let i = 0; i < 10; i++) {
      const px = 700 + hash(i * 6.3) * 760, py = 1750 - ((f * (2 + hash(i) * 2) + i * 130) % 480);
      D.circ(ctx, px, py, 3.5 + hash(i) * 3); ctx.fill();
    }
    lampPool(760, 2030, 240, 0.2); lampPool(1400, 2030, 240, 0.2);
    tubDraw(760, 2080, 1.0, {}); tubDraw(1400, 2080, 1.0, {});
    headsRow(2340, f, 0.5, 0.92);
  });
}, []);
// ===== C9c (1075–1140) S9c — MACRO: ₹100 note, ₹78 sunehra hissa alag hota hua =====
shot(1075, 1140, 0.3, { cx: 1080, cy: 1600, s: 1.05 }, { cx: 1080, cy: 1560, s: 1.22 }, (f, u) => {
  const lf = f - 1075;
  layer(0.5, () => nightBg(GY));
  layer(1, () => {
    lightCone(1080, 800, 1700, 260, 900, 0.06);
    noteDraw(1080, 1450, 840, 390, D.clamp((lf - 14) / 30, 0, 1));
    // neeche satah par sikkon ki kataarein (munafa jama)
    ctx.fillStyle = '#1c1712'; ctx.fillRect(640, 2156, 880, 18);
    coinStack(810, 2152, 4, 30); coinStack(1350, 2152, 3, 30);
    if (lf > 40) {
      text('₹78 MUNAFA!', 790, 1860, 50, '#ffd94d');
      text('₹22 KHARCHA', 1370, 1860, 42, '#cfd6de');
    }
    dust(f, 1080, 1500, 700, 10, 0.2);
  });
}, []);
// ===== C9d (1140–1202) S9d — MUNAFA BAR 78% bharta hai + sikkon ki kataarein badhti hain =====
shot(1140, 1202, 0.3, { cx: 1080, cy: 1700, s: 1.2 }, { cx: 1080, cy: 1660, s: 1.4 }, (f, u) => {
  const lf = f - 1140;
  layer(0.5, () => nightBg(GY));
  layer(1, () => {
    const prog = D.clamp(lf / 42, 0, 1);
    text('MUNAFA ' + Math.floor(78 * prog) + '%', 1080, 1360, 56, '#ffd94d');
    ctx.fillStyle = '#14100a'; D.rr(ctx, 700, 1450, 760, 130, 14); ctx.fill(); ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 6; ctx.stroke();
    ctx.save(); ctx.beginPath(); D.rr(ctx, 708, 1458, 744, 114, 10); ctx.clip();
    const g = ctx.createLinearGradient(700, 0, 1460, 0);
    g.addColorStop(0, '#d9a52e'); g.addColorStop(1, '#f2c14e');
    ctx.fillStyle = g; ctx.fillRect(708, 1458, 744 * 0.78 * prog, 114);
    ctx.restore();
    text('HAR ₹100 PAR', 1080, 1660, 42, '#f5edd8');
    // beech ke khaali hisse me girte hue sunehre sikke (void bhara hua)
    lampPool(1080, 1800, 620, 0.10);
    ctx.fillStyle = 'rgba(242,193,78,0.85)';
    for (let i = 0; i < 7; i++) { const px = 760 + hash(i * 8.2) * 640, py = 1720 + ((f * 7 + i * 173) % 290); D.circ(ctx, px, py, 9 + hash(i) * 5); ctx.fill(); }
    // sikkon ki kataarein — munafa jama hota hua
    coinStack(830, 2020, Math.floor(3 + prog * 5), 36);
    coinStack(1080, 2020, Math.floor(2 + prog * 8), 40);
    coinStack(1330, 2020, Math.floor(3 + prog * 6), 36);
    ctx.fillStyle = '#241d18'; ctx.fillRect(640, 2024, 880, 16);
  });
}, []);
// ===== C10a (1202–1265) S10 — PULL-BACK: screen FREEZE, hall andhera, sirf counter par spotlight, bheed andhere me =====
shot(1202, 1265, 0.36, { cx: 1080, cy: 1500, s: 0.72 }, { cx: 1080, cy: 1530, s: 0.63 }, (f, u) => {
  layer(0.5, () => hallBg(GY));
  layer(0.8, () => cinemaScreen(1000, 1280, 1200, 620, f, 'frozen'));
  layer(1, () => {
    crowdRows(1000, GY, f, 0.14);
    // counter par spotlight cone
    lightCone(1540, 1020, 2080, 130, 560, 0.13);
    lampPool(1540, 2000, 330, 0.3);
    ctx.fillStyle = '#3a2415'; ctx.fillRect(1330, 1960, 420, 240);
    ctx.fillStyle = '#5d3a1e'; ctx.fillRect(1330, 1960, 420, 30);
    tubDraw(1540, 1870, 0.9, {});
    text('COUNTER KHULA HAI', 1540, 1700, 40, '#ffd94d');
  });
}, []);
// ===== C10b (1265–1327) S10b — PUNCHLINE: counter ke saamne queue, board "ASLI PICTURE INTERVAL ME CHALTI HAI" (hit 1272) =====
shot(1265, 1327, 0.3, { cx: 1080, cy: 1680, s: 1.0 }, { cx: 1080, cy: 1620, s: 1.2 }, (f, u) => {
  const lf = f - 1265;
  layer(0.5, () => lobbyBg(GY, true));
  layer(0.85, () => {
    counterDesk(1150, GY, 1400);
    tubDraw(950, 1980, 1.0, {}); tubDraw(1380, 1965, 1.2, {});
  });
  layer(1, () => {
    // counter ki taraf khadi bheed (kinare par, board ko jagah)
    silFig(760, 2430, 1.5, { tub: true });
    silFig(1430, 2430, 1.5, {});
    if (lf > 7) { const p = spring((lf - 7) / 10); darkBoard(1080, 1300, 780, 240, [['ASLI PICTURE', 56, '#ffd94d'], ['INTERVAL ME CHALTI HAI', 43, '#ffc72c']], p); }
  });
}, [1272]);
// ===== C11a (1327–1376) S11 — RAAT: petrol pump, nozzle se girti boond (macro feel), reflection =====
shot(1327, 1376, 0.32, { cx: 1150, cy: 1700, s: 0.95 }, { cx: 1180, cy: 1660, s: 1.12 }, (f, u) => {
  layer(0.5, () => nightBg(GY));
  layer(0.85, () => {
    ctx.fillStyle = '#2b3648'; ctx.fillRect(720, 1180, 920, 46);
    ctx.fillStyle = '#c62828'; ctx.fillRect(720, 1226, 920, 16);
    ctx.fillStyle = '#39445c'; ctx.fillRect(790, 1226, 30, 500); ctx.fillRect(1540, 1226, 30, 500);
    lampPool(1210, 1330, 420, 0.2);
    lightCone(1210, 1242, 2100, 200, 800, 0.08);
    pumpDraw(1210, GY, 1.05, f);
  });
  layer(1, () => {
    wetReflect(1210, 2405, 420, 260, 0.12);
    // nozzle se girti boond (nozzle world ≈ 1416, 2190)
    const cyc = (f % 22) / 22, dy = 2196 + cyc * cyc * 190;
    ctx.fillStyle = 'rgba(240,190,60,0.9)';
    D.ell(ctx, 1416, dy, 9, 13); ctx.fill();
    if (cyc > 0.9) { ctx.strokeStyle = 'rgba(240,190,60,0.6)'; ctx.lineWidth = 3; D.ell(ctx, 1416, 2392, 24 * (cyc - 0.88) * 8, 6); ctx.stroke(); }
  });
}, []);
// ===== C11b (1376–1425) S11b — PULL-BACK finale: board "AGLI BAAR: PETROL PUMP SCAM" =====
shot(1376, 1425, 0.28, { cx: 1080, cy: 1540, s: 0.98 }, { cx: 1080, cy: 1580, s: 0.74 }, (f, u) => {
  const lf = f - 1376;
  layer(0.5, () => nightBg(GY));
  layer(0.8, () => {
    ctx.fillStyle = '#2b3648'; ctx.fillRect(620, 1600, 760, 40);
    ctx.fillStyle = '#c62828'; ctx.fillRect(620, 1640, 760, 14);
    ctx.fillStyle = '#39445c'; ctx.fillRect(655, 1654, 26, 746); ctx.fillRect(1339, 1654, 26, 746);
    pumpDraw(1000, GY, 0.92, f);
  });
  layer(1, () => {
    wetReflect(1000, 2405, 380, 220, 0.10);
    if (lf > 6) { const p = spring((lf - 6) / 11); darkBoard(1080, 1150, 860, 215, [['AGLI BAAR:', 54, '#ffd94d'], ['PETROL PUMP SCAM', 74, '#ff8a5c']], p); }
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(255,170,60,0.06)'; ctx.fillRect(0, 0, W, H);
}, []);

// ---------------- TRANSITIONS (har cut socha hua: match / zoom-through flash / whip streak / lights-out) ----------------
// index = shot order C1a..C11b; h = shot ke pehle ~7 frame (enter), t = aakhri ~7 frame (exit)
const TR = [
  { t: 'flash' },                 // C1a -> marquee flare
  { h: 'flash', t: 'flash' },     // C1b -> entrance glow se hall
  { h: 'flash' },                 // C2a (C2b se match cut — tail plain)
  { t: 'flash' },                 // C2b -> screen se duniya me zoom-through
  { h: 'flash' },                 // C3a (C3b match — tail plain)
  { t: 'flash' },                 // C3b -> freeze flash
  { h: 'flash', t: 'flash' },     // C4 -> INTERVAL lights ON flash
  { h: 'flash', t: 'streak' },    // C5a -> whip pan counter ki taraf
  { h: 'streak' },                // C5b (C6a lobby match — tail plain)
  { t: 'flash' },                 // C6a -> tubs me zoom-through
  { h: 'flash' },                 // C6b (C6c tub match — tail plain)
  { t: 'flash' },                 // C6c -> namak chamak burst
  { h: 'flash' },                 // C7a (C7b meter match — tail plain)
  { t: 'streak' },                // C7b -> drink slide whip
  { h: 'streak' },                // C8a (C8b receipt match — tail plain)
  { t: 'flash' },                 // C8b -> stamp slam se epic wide
  { h: 'flash' },                 // C9a (C9b counter match — tail plain)
  {},                             // C9b (C9c ₹ match — dono plain)
  {},                             // C9c
  { t: 'dark' },                  // C9d -> roshni bujhti hui (S10 andhera beat)
  { h: 'dark' },                  // C10a (C10b spotlight match — tail plain)
  { t: 'streak' },                // C10b -> raat ke pump ki taraf whip
  { h: 'streak' },                // C11a (C11b pump match pull-back — tail plain)
  {},                             // C11b finale
];
SHOTS.forEach((s, i) => { s.tr = TR[i] || {}; });

Promise.all([fontReady, document.fonts.ready]).then(() => { window.ready = true; });

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
window.renderFrame = renderFrame;
window.TOTAL = TOTAL;
