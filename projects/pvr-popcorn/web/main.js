// PVR Popcorn Scam (EP-4) — kahani-style Short (1425 frames @30fps). Scam angle: puri film tumhe popcorn kharidne ke liye design hai.
// Interval = dukaan khulne ka time; counter jaal (₹350 vs ₹400), pyaas-meter, tax stamps (5% vs 18%), ₹2,088 crore + 78% munafa.
// Punchline: "Asli picture interval me chalti hai!" -> EP-5 petrol pump tease. Engine V2: lip-sync + expression morphs + close-ups.
// Camera: Zack D. Films style — har shot alag angle (low/top/close-up/wide rotation), reveals par punch-in + hit sync, camera kabhi park nahi.
// Harness: window.ready, window.renderFrame(f), window.TOTAL.
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import * as D from './draw.js';
import { ENV } from './envelope.js';

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
// Gold-on-dark board (bade number reveals). lines = [text, px, color]
function darkBoard(x, y, w, h, lines, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  lampPool(0, 0, Math.max(w, h) * 0.95, 0.30);
  ctx.fillStyle = '#14100a'; D.rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.fill();
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 7; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,199,44,0.5)'; ctx.lineWidth = 2.5; D.rr(ctx, -w / 2 + 13, -h / 2 + 13, w - 26, h - 26, 9); ctx.stroke();
  lines.forEach((ln, i) => text(ln[0], 0, (i - (lines.length - 1) / 2) * (h * 0.52), ln[1], ln[2]));
  ctx.restore();
}
function bigQ(x, y, s, col, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(s, s);
  text('?', 0, 0, 120, col || '#ffd94d');
  ctx.restore();
}

// ===== character (Engine V2: mouth + mix forwarding) =====
const HERO_P = { shirt: '#f2b705', shirtD: '#cf9604', pants: '#6e5136', skin: '#c98a54', hairC: '#20242c' };
const STAFF_P = { shirt: '#7a1f2b', shirtD: '#5d1620', pants: '#2e2a26', skin: '#a06a38', hairC: '#14161a' };
function lipMouth(f) {
  const a = ENV[Math.max(0, f - 1)] || 0, b = ENV[f] || 0, c = ENV[Math.min(ENV.length - 1, f + 1)] || 0;
  const v = (a + b * 2 + c) / 4;
  return v < 0.035 ? 0 : Math.min(1, v * 1.7);
}
function heroFig(x, y, sc, o = {}, f = 0) {
  const P = o.preset || HERO_P;
  D.drawHero(ctx, { x, y, s: sc, _t: f,
    shirt: P.shirt, shirtD: P.shirtD, pants: P.pants, noTie: true, skin: P.skin, hairC: P.hairC,
    expr: o.expr || 'calm', blink: D.blinkAt(f, o.seed || 5), wink: !!o.wink,
    mouth: o.mouth != null ? o.mouth : (o.speak ? lipMouth(f) : null), mix: o.mix || null,
    armL: o.armL || 'down', armR: o.armR || 'down', face: o.face || 0,
    sweat: !!o.sweat, headDip: o.headDip || 0, walk: o.walk !== undefined ? o.walk : null,
    prop: o.prop || null, phoneMode: o.phoneMode || 'credit' });
}
function seatedFig(x, y, sc, o = {}, f = 0) {
  const P = o.preset || HERO_P;
  D.drawHeroSitting(ctx, { x, y, s: sc, _t: f,
    shirt: P.shirt, shirtD: P.shirtD, pants: P.pants, skin: P.skin, hairC: P.hairC,
    expr: o.expr || 'calm', blink: D.blinkAt(f, o.seed || 5),
    mouth: o.mouth != null ? o.mouth : (o.speak ? lipMouth(f) : null), mix: o.mix || null,
    armL: o.armL || 'down', armR: o.armR || 'down', face: o.face || 0,
    headDip: o.headDip || 0, slump: o.slump || 0 });
}
// Bheed ka chhota silhouette aadmi (sirf aakriti, chehra nahi)
function miniFig(x, y, s, col, ph = 0) {
  const bob = Math.abs(Math.sin(ph)) * 8 * s;
  ctx.fillStyle = col;
  D.circ(ctx, x, y - 118 * s - bob, 21 * s); ctx.fill();
  D.rr(ctx, x - 26 * s, y - 100 * s - bob, 52 * s, 78 * s, 16 * s); ctx.fill();
  D.rr(ctx, x - 24 * s, y - 26 * s, 20 * s, 28 * s, 6 * s); ctx.fill();
  D.rr(ctx, x + 4 * s, y - 26 * s, 20 * s, 28 * s, 6 * s); ctx.fill();
}

// ---------------- backgrounds ----------------
const GY = 2400;
function nightBg(gy, warm = false) {
  vgrad(-400, gy + 40, warm ? [[0, '#160f1e'], [0.6, '#2b1830'], [1, '#4a2438']] : [[0, '#070b1c'], [0.6, '#101a38'], [1, '#24355e']]);
  // taare
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 42; i++) { const sx = -600 + hash(i * 1.7) * 3300, sy = -300 + hash(i * 2.3) * 1250; D.circ(ctx, sx, sy, 2 + hash(i) * 2.4); ctx.fill(); }
  // chaand
  lampPool(420, 60, 190, 0.16);
  ctx.fillStyle = '#f2ead2'; D.circ(ctx, 420, 60, 54); ctx.fill();
  ctx.fillStyle = warm ? '#2b1830' : '#101a38'; D.circ(ctx, 448, 44, 46); ctx.fill();
  ctx.fillStyle = '#241d18'; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  ctx.fillStyle = 'rgba(255,220,150,0.08)'; ctx.fillRect(-800, gy, 3760, 12);
}
function lobbyBg(gy, bright = true) {
  if (bright) vgrad(-400, gy + 40, [[0, '#4a3418'], [0.55, '#7a5a28'], [1, '#a87f3e']]);
  else vgrad(-400, gy + 40, [[0, '#14100c'], [1, '#2e2416']]);
  // mehrab (arches) — cinema lobby ki shaan
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
}

// ---------------- PVR helpers ----------------
// Multiplex building: upar bada PVR sign (bulb wali), neeche glass entrance + poster panels.
function pvrBuilding(cx, gy, w, f, lit = true) {
  const top = gy - 1240;
  ctx.fillStyle = '#232b3d'; D.rr(ctx, cx - w / 2, top, w, 1240, 12); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#2e3850'; ctx.fillRect(cx - w / 2, top, w, 90);
  // khidkiyon ki kattiyan
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
    const wx = cx - w / 2 + 56 + c * (w - 112) / 6, wy = top + 150 + r * 128;
    const on = lit && hash(r * 7 + c * 3) > 0.35;
    ctx.fillStyle = on ? `rgba(255,217,138,${0.75 + 0.25 * Math.sin(f * 0.11 + c + r * 2)})` : '#39445c';
    ctx.fillRect(wx, wy, (w - 112) / 6 - 26, 88);
    ctx.strokeStyle = 'rgba(10,12,18,0.6)'; ctx.lineWidth = 3; ctx.strokeRect(wx, wy, (w - 112) / 6 - 26, 88);
  }
  // PVR sign board + bulbs
  const sw = w * 0.52, sh = 190, sx = cx - sw / 2, sy = top - 215;
  lampPool(cx, sy + sh / 2, sw * 0.8, lit ? 0.34 : 0.12);
  ctx.fillStyle = '#5d1620'; D.rr(ctx, sx, sy, sw, sh, 16); ctx.fill(); ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#ffd94d';
  const nb = 14;
  for (let i = 0; i <= nb; i++) { const bx = sx + 18 + (sw - 36) * i / nb; const fl = 0.55 + 0.45 * Math.sin(f * 0.35 + i * 1.3); ctx.globalAlpha = lit ? fl : 0.3; D.circ(ctx, bx, sy + 16, 8); ctx.fill(); D.circ(ctx, bx, sy + sh - 16, 8); ctx.fill(); }
  ctx.globalAlpha = 1;
  text('PVR', cx, sy + sh / 2 + 4, 128, '#ffe9a8');
  // poster panels (dono taraf)
  for (const sgn of [-1, 1]) {
    const px = cx + sgn * (w / 2 - 128), py = gy - 560;
    ctx.fillStyle = sgn < 0 ? '#31517a' : '#7a5a1f'; D.rr(ctx, px - 82, py - 210, 164, 420, 8); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.20)'; D.circ(ctx, px, py - 90, 44); ctx.fill(); ctx.fillRect(px - 56, py - 20, 112, 26); ctx.fillRect(px - 56, py + 30, 112, 18);
    text(sgn < 0 ? 'FILM' : 'DHAMAKA', px, py + 152, 32, '#f5edd8');
  }
  // glass entrance
  const ew = w * 0.44, ex = cx - ew / 2;
  ctx.fillStyle = lit ? 'rgba(150,210,240,0.5)' : 'rgba(90,120,150,0.35)'; ctx.fillRect(ex, gy - 430, ew, 430);
  ctx.strokeStyle = '#0e1420'; ctx.lineWidth = 7; ctx.strokeRect(ex, gy - 430, ew, 430);
  ctx.beginPath(); ctx.moveTo(cx, gy - 430); ctx.lineTo(cx, gy); ctx.stroke();
  if (lit) lampPool(cx, gy - 200, 380, 0.22);
  text('TICKETS • POPCORN • DRINKS', cx, gy - 486, 36, '#ffd94d');
}
// Popcorn tub: laal-safed dhariyon wala trapezoid + upar popcorn ke phuule daane.
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
  // popcorn puffs
  const puffs = [[-52, -128], [-26, -142], [0, -148], [26, -140], [52, -126], [-38, -118], [38, -116], [0, -128]];
  for (const [px, py] of puffs) {
    ctx.fillStyle = '#fdf6dd'; D.circ(ctx, px, py, 17); ctx.fill();
    ctx.fillStyle = '#f2d98c'; D.circ(ctx, px + 4, py + 4, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(120,90,30,0.35)'; ctx.lineWidth = 2; D.circ(ctx, px, py, 17); ctx.stroke();
  }
  if (o.label) { ctx.fillStyle = '#ffffff'; D.rr(ctx, -75, -34, 150, 52, 8); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 3.5; ctx.stroke(); text(o.label, 0, -7, 24, '#c62828'); }
  ctx.restore();
}
// Rubber stamp: ghumaa hua, dashed kinara, zor se lagta hai (scale spring se aata hai).
function stampDraw(x, y, w, h, lines, col, rot, sc) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = 0.94;
  ctx.strokeStyle = col; ctx.lineWidth = 9; D.rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.stroke();
  ctx.lineWidth = 3.5; ctx.setLineDash([16, 10]); D.rr(ctx, -w / 2 + 15, -h / 2 + 15, w - 30, h - 30, 8); ctx.stroke(); ctx.setLineDash([]);
  lines.forEach((ln, i) => text(ln[0], 0, (i - (lines.length - 1) / 2) * (h * 0.5), ln[1], col));
  ctx.restore();
}
// Badi cinema screen. mode: 'chase' (chalti mini-film), 'frozen' (ruki frame + ❚❚), 'interval', 'plain'
function cinemaScreen(x, y, w, h, f, mode) {
  ctx.save(); ctx.translate(x, y);
  lampPool(0, 0, w * 0.62, mode === 'interval' ? 0.30 : 0.16);
  ctx.fillStyle = '#05070c'; D.rr(ctx, -w / 2 - 16, -h / 2 - 16, w + 32, h + 32, 10); ctx.fill(); ctx.strokeStyle = '#3a2a16'; ctx.lineWidth = 8; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip();
  if (mode === 'chase') {
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, '#2c4a72'); g.addColorStop(0.62, '#7a5a8a'); g.addColorStop(0.63, '#1c1c22'); g.addColorStop(1, '#101014');
    ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
    // door ki buildings (scroll)
    ctx.fillStyle = '#141c2e';
    const off = (f * 7) % 300;
    for (let bx = -w / 2 - 300 + off; bx < w / 2 + 300; bx += 300) {
      ctx.fillRect(bx, -h * 0.06, 170, h * 0.30);
      ctx.fillStyle = 'rgba(255,217,138,0.8)';
      for (let wy = 0; wy < 3; wy++) for (let wx = 0; wx < 3; wx++) if (hash(bx + wx * 9 + wy * 31) > 0.45) ctx.fillRect(bx + 18 + wx * 52, -h * 0.02 + wy * 44, 24, 28);
      ctx.fillStyle = '#141c2e';
    }
    // sadak ki lakeerein
    ctx.fillStyle = '#ffd94d';
    const loff = (f * 22) % 190;
    for (let lx = -w / 2 - 190 + loff; lx < w / 2; lx += 190) ctx.fillRect(lx, h * 0.33, 105, 13);
    // do cars — peeche wali laal, aage wali neeli; bobbing + speed lines
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
    // static noise (frozen frame)
    for (let i = 0; i < 130; i++) { ctx.fillStyle = `rgba(255,255,255,${0.05 + hash(i * 3.3) * 0.10})`; ctx.fillRect(-w / 2 + hash(i * 1.3) * w, -h / 2 + hash(i * 2.9) * h, 7, 7); }
    // pause nishaan
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
// Seat rows: peeche se dikhti kursiyaan + beech-beech me sir
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
  // kata hua neeche ka kinara
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
// Cold drink glass: cola + bulbule + straw
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
  ctx.strokeStyle = '#c62828'; ctx.lineWidth = 13; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(16, -112); ctx.lineTo(44, -168); ctx.stroke();
  ctx.restore();
}
// Bada ghadi (clock): haath angle par rukta hai
function clockDraw(x, y, r, handA, f) {
  ctx.save(); ctx.translate(x, y);
  lampPool(0, 0, r * 1.5, 0.14);
  ctx.fillStyle = '#f5edd8'; D.circ(ctx, 0, 0, r); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 9; ctx.stroke();
  ctx.strokeStyle = '#3a352f'; ctx.lineWidth = 6;
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82); ctx.lineTo(Math.cos(a) * r * 0.93, Math.sin(a) * r * 0.93); ctx.stroke(); }
  ctx.strokeStyle = '#26221f'; ctx.lineCap = 'round';
  ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(-Math.PI / 2 + 1.1) * r * 0.52, Math.sin(-Math.PI / 2 + 1.1) * r * 0.52); ctx.stroke();
  ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(handA) * r * 0.74, Math.sin(handA) * r * 0.74); ctx.stroke();
  ctx.strokeStyle = '#c62828'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(handA * 3 + f * 0.0) * r * 0.85, Math.sin(handA * 3) * r * 0.85); ctx.stroke();
  ctx.fillStyle = '#c62828'; D.circ(ctx, 0, 0, 13); ctx.fill();
  ctx.restore();
}
// ₹100 ka note: hara note, 78% hissa sunehra alag
function noteDraw(x, y, w, h, goldProg) {
  ctx.save(); ctx.translate(x, y);
  D.softShadow(ctx, 0, h / 2 + 18, w * 0.52, 20, 0.3);
  ctx.fillStyle = '#2e7d46'; D.rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.strokeStyle = 'rgba(245,237,216,0.7)'; ctx.lineWidth = 3; D.rr(ctx, -w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 10); ctx.stroke();
  text('₹100', -w / 2 + 96, -h / 2 + 62, 58, '#f5edd8');
  text('₹100', w / 2 - 96, h / 2 - 62, 58, '#f5edd8');
  text('100', 0, 6, 120, 'rgba(245,237,216,0.9)');
  text('EK SAU RUPAYE', 0, h / 2 - 52, 36, 'rgba(245,237,216,0.75)');
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
  // pipe: right side se latakti hui
  ctx.strokeStyle = '#14161a'; ctx.lineWidth = 17; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(130, -560); ctx.bezierCurveTo(230, -520, 218, -300, 196, -218); ctx.stroke();
  // nozzle
  ctx.save(); ctx.translate(196, -200); ctx.rotate(0.5);
  ctx.fillStyle = '#26221f'; D.rr(ctx, -17, -58, 34, 92, 9); ctx.fill();
  ctx.fillStyle = '#8b93a1'; ctx.fillRect(-7, 30, 14, 44);
  ctx.restore();
  ctx.restore();
}

/* =====================================================================
   TIMING — PVR Popcorn Scam EP-4 (script v1 scam, voice_final, TOTAL 1425 @30fps)
   S1 0 | S2 84 | S3 200 | S4 344 | S5 409 | S6 538 | S7 722 | S8 819
   S9 949 | S10 1202 | S11 1327 | END 1425
   Camera: har shot alag angle — low / top / close-up / wide rotation.
   ===================================================================== */

// ===== P1a (0–44) S1 — LOW ANGLE: raat me PVR building tower, hero shocked close, board "SABSE BADA SCAM" =====
shot(0, 44, 0.3, { cx: 1080, cy: 1700, s: 0.82 }, { cx: 1080, cy: 1650, s: 0.94 }, (f, u) => {
  const lf = f - 0;
  layer(0.5, () => nightBg(GY));
  layer(0.85, () => pvrBuilding(1240, GY, 900, f, true));
  layer(1, () => {
    heroFig(790, GY, 1.55, { expr: 'shocked', seed: 5, speak: true, armR: 'up' }, f);
    if (lf > 10) { const p = spring((lf - 10) / 11); darkBoard(1030, 1330, 640, 158, [['SABSE BADA SCAM', 62, '#ff8a5c']], p); }
  });
}, []);
// ===== P1b (44–84) S1b — TOP-DOWN close: bada popcorn tub, upar laal "SCAM" stamp zor se (hit 64) =====
shot(44, 84, 0.32, { cx: 1080, cy: 1560, s: 1.1 }, { cx: 1080, cy: 1510, s: 1.28 }, (f, u) => {
  const lf = f - 44;
  layer(0.5, () => lobbyBg(GY, false));
  layer(1, () => {
    lampPool(1080, 1750, 700, 0.22);
    tubDraw(1080, 1820, 2.7, { label: 'POPCORN' });
    if (lf >= 20) { const p = spring((lf - 20) / 7); stampDraw(1080, 1700, 640, 240, [['SCAM', 120]], '#e53935', -0.2, p); }
    else text('POPCORN KI KEEMAT?', 1080, 1150, 54, '#ffd94d');
  });
}, [64]);
// ===== P2a (84–140) S2 — WIDE HALL: badi screen par CHALTI mini-film (car chase), seat rows, hero baitha hua =====
shot(84, 140, 0.3, { cx: 1080, cy: 1560, s: 0.64 }, { cx: 1080, cy: 1530, s: 0.71 }, (f, u) => {
  layer(0.5, () => hallBg(GY));
  layer(0.8, () => cinemaScreen(1080, 1230, 1280, 660, f, 'chase'));
  layer(1, () => {
    seatedFig(880, 2330, 1.15, { expr: 'happy', seed: 5, speak: true }, f);
    seatRows(1080, GY, f);
  });
}, []);
// ===== P2b (140–200) S2b — PUNCH-IN screen ki taraf: chase tez, ek pal "POPCORN!" flash, hero ki badi hairan aankhein =====
shot(140, 200, 0.32, { cx: 1080, cy: 1500, s: 1.0 }, { cx: 1080, cy: 1450, s: 1.24 }, (f, u) => {
  const lf = f - 140;
  layer(0.5, () => hallBg(GY));
  layer(0.85, () => cinemaScreen(1080, 1300, 1520, 800, f, 'chase'));
  layer(1, () => {
    if (lf > 28 && lf < 48) {
      const a = Math.sin((lf - 28) / 20 * Math.PI);
      ctx.save(); ctx.globalAlpha = a;
      darkBoard(1080, 1300, 760, 190, [['POPCORN!', 96, '#ffc72c']], 1);
      ctx.restore();
    }
    heroFig(1080, 2620, 2.2, { expr: 'surprise', seed: 5, speak: true }, f);
  });
}, []);
// ===== P3a (200–248) S3 — TOP ANGLE duniya: teen deshon ke cinema, "NO INTERVAL" boards ek-ek karke pop =====
shot(200, 248, 0.28, { cx: 1080, cy: 1500, s: 0.72 }, { cx: 1080, cy: 1470, s: 0.81 }, (f, u) => {
  const lf = f - 200;
  layer(0.5, () => {
    vgrad(-400, GY + 40, [[0, '#0a2432'], [1, '#175263']]);
    ctx.fillStyle = 'rgba(120,220,190,0.16)';
    for (const [bx, by, br] of [[300, 700, 300], [1050, 560, 380], [1900, 760, 320], [700, 1250, 260], [1600, 1300, 300]]) { D.ell(ctx, bx, by + br * 0.8, br, br * 0.42); ctx.fill(); }
    ctx.fillStyle = '#12262e'; ctx.fillRect(-800, GY, 3760, 3840 - GY);
  });
  layer(1, () => {
    const cine = (cx, label, delay) => {
      ctx.fillStyle = '#2b3648'; D.rr(ctx, cx - 150, 1560, 300, 330, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = '#5d1620'; ctx.fillRect(cx - 150, 1560, 300, 64);
      text(label, cx, 1594, 38, '#ffe9a8');
      ctx.fillStyle = 'rgba(150,210,240,0.4)'; ctx.fillRect(cx - 100, 1660, 200, 150);
      if (lf > delay) { const p = spring((lf - delay) / 9); boardSign(cx, 1400, 330, 104, [['NO INTERVAL', 42, '#14532d']], p); }
    };
    cine(690, 'AMERICA', 6); cine(1080, 'LONDON', 17); cine(1470, 'JAPAN', 28);
    heroFig(1080, GY, 1.0, { expr: 'puzzled', seed: 5, speak: true, armR: 'scratch' }, f);
  });
}, []);
// ===== P3b (248–296) S3b — dusre desh ki screen CLOSE: film bina ruke chalti, neeche progress bar bharta hua =====
shot(248, 296, 0.3, { cx: 1080, cy: 1520, s: 1.0 }, { cx: 1080, cy: 1490, s: 1.15 }, (f, u) => {
  const lf = f - 248;
  layer(0.5, () => hallBg(GY));
  layer(0.85, () => {
    cinemaScreen(1120, 1360, 1330, 690, f, 'chase');
    // progress bar — bina ruke bharta hai
    ctx.fillStyle = '#1b2534'; D.rr(ctx, 480, 1806, 1280, 34, 17); ctx.fill(); ctx.strokeStyle = '#8b93a1'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#37d67a'; D.rr(ctx, 488, 1814, 1264 * D.clamp(0.35 + lf / 48 * 0.6, 0, 1), 18, 9); ctx.fill();
    text('FILM BINA RUKE CHALTI HAI', 1120, 1920, 44, '#8ef0b3');
  });
  layer(1, () => {
    heroFig(730, GY, 1.2, { expr: 'puzzled', seed: 5, speak: true, face: 1 }, f);
  });
}, []);
// ===== P3c (296–344) S3c — LOW ANGLE Bharat: film RUK gayi, badi ghadi ka haath atak gaya =====
shot(296, 344, 0.3, { cx: 1080, cy: 1620, s: 0.88 }, { cx: 1080, cy: 1580, s: 1.01 }, (f, u) => {
  const lf = f - 296;
  layer(0.5, () => nightBg(GY, true));
  layer(1, () => {
    const p = spring(Math.min(1, lf / 11));
    if (lf > 2) boardSign(790, 1130, 430, 118, [['BHARAT', 56, '#7a4d12']], p);
    // ghadi: haath pehle chalta hai, phir ATAK jata hai (interval!)
    const handA = -Math.PI / 2 + Math.min(lf, 22) * 0.055 + (lf > 22 ? Math.sin((lf - 22) * 0.9) * 0.012 : 0);
    clockDraw(1330, 1470, 295, handA, f);
    if (lf > 24) text('FILM RUK GAYI!', 1330, 1880, 52, '#ff8a5c');
    heroFig(790, GY, 1.35, { expr: 'worried', seed: 5, speak: true, face: 1 }, f);
  });
}, []);
// ===== P4a (344–409) S4 — CLOSE-UP PUNCH-IN: "KYUN?" board (hit 352), morph puzzled->smug, ant me counter ki taraf tez pan ke streaks =====
shot(344, 409, 0.3, { cx: 1030, cy: 1880, s: 1.55 }, { cx: 1180, cy: 1830, s: 1.82 }, (f, u) => {
  const lf = f - 344;
  layer(0.5, () => lobbyBg(GY, false));
  layer(1, () => {
    const mu = lf < 30 ? 0 : Math.min(1, (lf - 30) / 13);
    heroFig(1030, GY, 2.3, { expr: 'puzzled', seed: 5, speak: true, mix: { e2: 'smug', u: mu }, armR: 'up' }, f);
    if (lf > 8) { const p = spring((lf - 8) / 9); darkBoard(1120, 1400, 540, 168, [['KYUN?', 92, '#ffd94d']], p); }
    bigQ(1315, 1660 + Math.sin(f * 0.14) * 11, 0.7, '#ffd94d', Math.sin(f * 0.09) * 0.09);
    if (lf > 50) { // whip-pan streaks — counter ki taraf
      ctx.strokeStyle = 'rgba(255,233,168,0.35)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
      for (let i = 0; i < 6; i++) { const sy = 1150 + i * 210; ctx.beginPath(); ctx.moveTo(600, sy); ctx.lineTo(600 + (lf - 50) * 46, sy); ctx.stroke(); }
      text('COUNTER →', 1330, 1080, 50, '#ffe9a8');
    }
  });
}, [352]);
// ===== P5a (409–472) S5 — LOW ANGLE: hall ka band darwaza + taala, board "BAHAR KA KHANA MANA", hero tiffin liye udaas =====
shot(409, 472, 0.3, { cx: 1080, cy: 1680, s: 0.92 }, { cx: 1080, cy: 1630, s: 1.05 }, (f, u) => {
  const lf = f - 409;
  layer(0.5, () => lobbyBg(GY, false));
  layer(1, () => {
    // band darwaza
    ctx.fillStyle = '#4c3421'; D.rr(ctx, 730, 1450, 700, 950, 12); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 8; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1080, 1450); ctx.lineTo(1080, 2400); ctx.stroke();
    ctx.fillStyle = '#2e2013'; ctx.fillRect(730, 1780, 700, 26);
    D.circ(ctx, 1030, 1980, 17); ctx.fillStyle = '#c9a227'; ctx.fill();
    D.circ(ctx, 1130, 1980, 17); ctx.fill();
    // zanjeer + taala
    ctx.strokeStyle = '#8b93a1'; ctx.lineWidth = 11;
    ctx.beginPath(); ctx.moveTo(760, 1900); ctx.lineTo(1400, 2060); ctx.stroke();
    ctx.save(); ctx.translate(1080, 2010); ctx.scale(1.5, 1.5);
    ctx.strokeStyle = '#8a8f99'; ctx.lineWidth = 15; ctx.beginPath(); ctx.arc(0, -30, 40, Math.PI, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#e8b64c'; D.rr(ctx, -66, -32, 132, 108, 14); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    D.circ(ctx, 0, 16, 13); ctx.fillStyle = '#4a3a10'; ctx.fill(); ctx.fillRect(-5, 22, 10, 24);
    ctx.restore();
    if (lf > 10) { const p = spring((lf - 10) / 11); darkBoard(1080, 1180, 780, 152, [['BAHAR KA KHANA MANA', 56, '#ff8a5c']], p); }
    // hero — ghar ka tiffin haath me, udaas
    heroFig(700, GY, 1.3, { expr: 'sad', seed: 5, speak: true, armR: 'hold', headDip: 0.22 }, f);
    ctx.fillStyle = '#b8523f'; D.rr(ctx, 800, 2085, 108, 74, 12); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#8b93a1'; ctx.fillRect(800, 2072, 108, 18);
    text('GHAR KA TIFFIN', 855, 2215, 34, '#cfd6de');
  });
}, []);
// ===== P5b (472–538) S5b — TOP WIDE: LIGHTS ON flip! INTERVAL screen, bheed counter ki taraf bhaagti, hero bheed ke saath =====
shot(472, 538, 0.26, { cx: 1080, cy: 1500, s: 0.68 }, { cx: 1080, cy: 1450, s: 0.77 }, (f, u) => {
  const lf = f - 472;
  const lightsOn = lf >= 8;
  layer(0.5, () => lobbyBg(GY, lightsOn));
  layer(0.8, () => {
    if (lightsOn) cinemaScreen(1080, 1230, 1150, 470, f, 'interval');
    else cinemaScreen(1080, 1230, 1150, 470, f, 'plain');
    counterDesk(1080, GY - 60, 1350);
  });
  layer(1, () => {
    if (lightsOn) {
      // bheed counter ki taraf (neeche se upar badhti aakritiyan)
      const crowd = [[820, 0.0, '#31517a'], [960, 0.25, '#7a1f2b'], [1230, 0.12, '#2e7d46'], [1360, 0.35, '#5d3a8a'], [760, 0.5, '#8a5a2b']];
      for (const [bx, ph, col] of crowd) {
        const prog = D.clamp((lf - 8) / 46 + ph * 0.3, 0, 1);
        const yy = 2620 - prog * 330, ss = 1.15 - prog * 0.35;
        miniFig(bx + Math.sin(f * 0.3 + ph * 9) * 7, yy, ss, col, f * 0.32 + ph * 7);
      }
      heroFig(1090, GY, 1.35, { expr: 'happy', seed: 5, speak: true, armR: 'up' }, f);
    } else {
      heroFig(1090, GY, 1.1, { expr: 'calm', seed: 5, speak: false }, f);
      text('FILM KHATAM...?', 1080, 1900, 46, 'rgba(207,214,222,0.7)');
    }
    if (lf >= 8 && lf < 13) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(255,244,200,0.5)'; ctx.fillRect(0, 0, W, H); }
  });
}, []);
// ===== P6a (538–604) S6 — WIDE counter: menu board "CHHOTA TUB ₹350 / BADA TUB ₹400", staff, hero saamne =====
shot(538, 604, 0.28, { cx: 1080, cy: 1560, s: 0.72 }, { cx: 1080, cy: 1520, s: 0.83 }, (f, u) => {
  const lf = f - 538;
  layer(0.5, () => lobbyBg(GY, true));
  layer(0.85, () => {
    counterDesk(1150, GY, 1500);
    tubDraw(880, 1980, 1.05, {});
    tubDraw(1400, 1960, 1.3, {});
    heroFig(1470, GY - 330, 1.0, { preset: STAFF_P, expr: 'calm', seed: 9, speak: false }, f);
  });
  layer(1, () => {
    if (lf > 8) { const p = spring((lf - 8) / 11); darkBoard(1080, 1180, 920, 300, [['CHHOTA TUB  ₹350', 62, '#f5edd8'], ['BADA TUB  ₹400', 76, '#ffc72c']], p); }
    heroFig(690, GY, 1.25, { expr: 'calm', seed: 5, speak: true, face: 1, armR: 'catch' }, f);
  });
}, []);
// ===== P6b (604–659) S6b — CLOSE: do tubs aamne-saamne, BADA tub spring-overshoot se bada hota hai =====
shot(604, 659, 0.28, { cx: 1090, cy: 1680, s: 1.12 }, { cx: 1090, cy: 1630, s: 1.31 }, (f, u) => {
  const lf = f - 604;
  layer(0.5, () => lobbyBg(GY, true));
  layer(1, () => {
    ctx.fillStyle = '#3a2415'; ctx.fillRect(300, 2080, 1560, 320);
    ctx.fillStyle = '#5d3a1e'; ctx.fillRect(300, 2080, 1560, 34);
    tubDraw(840, 1980, 1.5, { label: 'CHHOTA' });
    const bs = 1.95 * (0.45 + 0.55 * spring(D.clamp(lf / 30, 0, 1))) * (1 + Math.sin(Math.min(lf, 30) * 0.3) * 0.02);
    tubDraw(1315, 1980, bs, { label: 'BADA' });
    darkBoard(860, 1560, 320, 108, [['₹350', 62, '#f5edd8']], 1);
    if (lf > 12) { const p = spring((lf - 12) / 10); darkBoard(1300, 1500, 360, 118, [['₹400', 70, '#ffc72c']], p); }
    if (lf > 30) {
      D.drawSparkle(ctx, 1470, 1620, 30, 0.9); D.drawSparkle(ctx, 1200, 1560, 22, 0.7);
      text('BADA = SMART?', 1090, 1230, 52, '#ffd94d');
    }
  });
}, []);
// ===== P6c (659–722) S6c — CLOSE: hero bada tub uthata hai, soch bubble "SIRF ₹50 ZYADA!" (hit 700), morph puzzled->happy =====
shot(659, 722, 0.3, { cx: 1080, cy: 1820, s: 1.4 }, { cx: 1080, cy: 1780, s: 1.56 }, (f, u) => {
  const lf = f - 659;
  layer(0.5, () => lobbyBg(GY, true));
  layer(1, () => {
    const mu = lf < 20 ? 0 : Math.min(1, (lf - 20) / 14);
    heroFig(920, GY, 1.95, { expr: 'puzzled', seed: 5, speak: true, mix: { e2: 'happy', u: mu }, armR: 'hold' }, f);
    tubDraw(1300, 2050, 1.65, { label: 'BADA' });
    if (lf > 30) {
      const p = spring((lf - 30) / 10);
      ctx.save(); ctx.translate(1230, 1400); ctx.scale(p, p);
      ctx.fillStyle = 'rgba(245,237,216,0.95)';
      D.ell(ctx, 0, 0, 215, 92); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
      D.circ(ctx, -120, 108, 20); ctx.fill(); D.circ(ctx, -88, 138, 12); ctx.fill();
      text('SIRF ₹50 ZYADA!', 0, -8, 47, '#7a4d12');
      ctx.restore();
    }
  });
}, [700]);

// ===== P7a (722–770) S7 — EXTREME CLOSE: hero namkeen popcorn khata hai, daane munh ki taraf udte hain =====
shot(722, 770, 0.3, { cx: 1080, cy: 1960, s: 1.55 }, { cx: 1080, cy: 1920, s: 1.72 }, (f, u) => {
  layer(0.5, () => lobbyBg(GY, true));
  layer(1, () => {
    tubDraw(855, 2150, 1.05, { label: 'NAMKEEN' });
    heroFig(1120, GY + 80, 2.45, { expr: 'happy', seed: 5, speak: true, armR: 'hold' }, f);
    // udte daane: tub se munh tak
    ctx.fillStyle = '#fdf6dd';
    for (let i = 0; i < 4; i++) {
      const pp = ((f * 0.045 + i * 0.27) % 1);
      const px = 900 + pp * 165, py = 2010 - Math.sin(pp * Math.PI) * 110 - pp * 130;
      D.circ(ctx, px, py, 13); ctx.fill();
      ctx.fillStyle = '#f2d98c'; D.circ(ctx, px + 3, py + 3, 5); ctx.fill(); ctx.fillStyle = '#fdf6dd';
    }
    text('NAMKEEN!', 990, 1500, 50, '#ffd94d');
  });
}, []);
// ===== P7b (770–819) S7b — PYAAS METER bharta hai, phir cold drink glass bubbles ke saath spring-in =====
shot(770, 819, 0.3, { cx: 1080, cy: 1760, s: 1.2 }, { cx: 1080, cy: 1710, s: 1.36 }, (f, u) => {
  const lf = f - 770;
  layer(0.5, () => lobbyBg(GY, true));
  layer(1, () => {
    const mu = lf < 10 ? 0 : Math.min(1, (lf - 10) / 12);
    heroFig(860, GY, 2.05, { expr: 'happy', seed: 5, speak: true, mix: { e2: 'worried', u: mu }, sweat: mu > 0.5, armR: 'catch' }, f);
    meterDraw(1335, 1560, 92, 430, D.clamp((lf - 4) / 34, 0, 1));
    if (lf > 32) {
      const p = spring((lf - 32) / 9);
      ctx.save(); ctx.translate(1470, 2080); ctx.scale(p, p); ctx.translate(-1470, -2080);
      drinkDraw(1470, 2080, 1.35, f);
      ctx.restore();
      text('COLD DRINK BHI!', 1330, 1180, 48, '#5ec2e8');
    }
  });
}, []);
// ===== P8a (819–884) S8 — TOP-DOWN: receipt print hoti hui (bill neeche badhta hai) =====
shot(819, 884, 0.28, { cx: 1080, cy: 1560, s: 1.02 }, { cx: 1080, cy: 1510, s: 1.17 }, (f, u) => {
  const lf = f - 819;
  layer(0.5, () => lobbyBg(GY, false));
  layer(1, () => {
    lampPool(1080, 1650, 760, 0.15);
    receiptDraw(1080, 1300, 580, D.clamp(lf / 52, 0, 1), [
      ['POPCORN (NAMKEEN)', '₹350'],
      ['COLD DRINK', '₹300'],
      ['TOTAL', '₹650'],
    ]);
    heroFig(700, GY, 1.15, { expr: 'calm', seed: 5, speak: true, face: 1 }, f);
    text('BILL AA GAYA...', 1300, 1120, 46, '#ffd94d');
  });
}, []);
// ===== P8b (884–949) S8b — CLOSE PUNCH: receipt par do stamps — NAMKEEN 5% hara (hit 900), CARAMEL 18% laal (hit 930); hero shocked =====
shot(884, 949, 0.32, { cx: 1040, cy: 1740, s: 1.18 }, { cx: 1060, cy: 1690, s: 1.36 }, (f, u) => {
  const lf = f - 884;
  layer(0.5, () => lobbyBg(GY, false));
  layer(1, () => {
    // bhari hui receipt (chhoti, left)
    ctx.save(); ctx.translate(905, 1330);
    ctx.fillStyle = '#f7f2e4'; ctx.fillRect(-235, 0, 470, 800);
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.strokeRect(-235, 0, 470, 800);
    text('PVR CINEMAS', 0, 52, 40, '#26221f');
    ctx.fillStyle = 'rgba(38,34,31,0.5)'; ctx.fillRect(-200, 88, 400, 4);
    text('NAMKEEN POPCORN', -200, 150, 30, '#3a352f', 'left'); text('₹350', 200, 150, 30, '#26221f', 'right');
    text('CARAMEL POPCORN', -200, 232, 30, '#3a352f', 'left'); text('₹400', 200, 232, 30, '#26221f', 'right');
    text('COLD DRINK', -200, 314, 30, '#3a352f', 'left'); text('₹300', 200, 314, 30, '#26221f', 'right');
    ctx.restore();
    if (lf >= 16) { const p = spring((lf - 16) / 6); stampDraw(905, 1760, 430, 150, [['NAMKEEN TAX 5%', 47]], '#2e9e4f', -0.14, p); }
    if (lf >= 46) { const p = spring((lf - 46) / 6); stampDraw(905, 1960, 460, 160, [['CARAMEL TAX 18%', 47]], '#e53935', 0.11, p); }
    const mu = lf < 44 ? 0 : Math.min(1, (lf - 44) / 11);
    heroFig(1330, GY, 1.75, { expr: 'calm', seed: 5, speak: true, mix: { e2: 'shocked', u: mu }, sweat: mu > 0.5 }, f);
  });
}, [900, 930]);
// ===== P9a (949–1010) S9 — WIDE: PVR building raat me roshan, khane-peene ki dukaan chamak rahi =====
shot(949, 1010, 0.28, { cx: 1080, cy: 1580, s: 0.62 }, { cx: 1080, cy: 1540, s: 0.73 }, (f, u) => {
  layer(0.5, () => nightBg(GY));
  layer(0.85, () => pvrBuilding(1230, GY, 1060, f, true));
  layer(1, () => {
    heroFig(760, GY, 1.2, { expr: 'calm', seed: 5, speak: true, face: 1, armR: 'catch' }, f);
    if (f > 975) text('EK SAAL KI KAMAI...', 1080, 1245, 52, '#ffd94d');
  });
}, []);
// ===== P9b (1010–1075) S9b — PUNCH-IN: ticking counter board, number badhta hua ₹2,088 CRORE par rukta hai =====
shot(1010, 1075, 0.32, { cx: 1080, cy: 1560, s: 0.95 }, { cx: 1080, cy: 1520, s: 1.31 }, (f, u) => {
  const lf = f - 1010;
  layer(0.5, () => nightBg(GY));
  layer(1, () => {
    const n = Math.floor(2088 * sstep(D.clamp(lf / 46, 0, 1)));
    const nStr = n >= 1000 ? Math.floor(n / 1000) + ',' + String(n % 1000).padStart(3, '0') : String(n);
    ctx.save(); ctx.translate(1080, 1400);
    lampPool(0, 0, 700, 0.3);
    ctx.fillStyle = '#14100a'; D.rr(ctx, -390, -170, 780, 340, 14); ctx.fill();
    ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 7; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,199,44,0.5)'; ctx.lineWidth = 2.5; D.rr(ctx, -377, -157, 754, 314, 9); ctx.stroke();
    text('SIRF KHANE-PEENE SE', 0, -92, 52, '#ffd94d');
    text('₹' + nStr + ' CRORE', 0, 22, 96, '#ffc72c');
    text('— EK SAAL ME —', 0, 112, 40, '#f5edd8');
    ctx.restore();
    const mu = lf < 34 ? 0 : Math.min(1, (lf - 34) / 12);
    heroFig(1080, GY, 1.35, { expr: 'calm', seed: 5, speak: true, mix: { e2: 'shocked', u: mu }, sweat: mu > 0.5 }, f);
  });
}, []);
// ===== P9c (1075–1140) S9c — CLOSE: ₹100 ka note, ₹78 sunehra hissa alag hota hua =====
shot(1075, 1140, 0.3, { cx: 1080, cy: 1620, s: 1.08 }, { cx: 1080, cy: 1580, s: 1.23 }, (f, u) => {
  const lf = f - 1075;
  layer(0.5, () => nightBg(GY));
  layer(1, () => {
    noteDraw(1080, 1470, 900, 380, D.clamp((lf - 14) / 30, 0, 1));
    if (lf > 40) {
      text('₹78 MUNAFA!', 760, 1830, 54, '#ffd94d');
      text('₹22 KHARCHA', 1400, 1830, 42, '#cfd6de');
    }
    heroFig(730, GY, 1.25, { expr: 'smug', seed: 5, speak: true, face: 1 }, f);
  });
}, []);
// ===== P9d (1140–1202) S9d — CLOSE: munafa bar 78% bharta hai, hero harami hand-rub ke saath smug =====
shot(1140, 1202, 0.3, { cx: 1080, cy: 1800, s: 1.45 }, { cx: 1080, cy: 1760, s: 1.62 }, (f, u) => {
  const lf = f - 1140;
  layer(0.5, () => nightBg(GY));
  layer(1, () => {
    const prog = D.clamp(lf / 42, 0, 1);
    ctx.fillStyle = '#14100a'; D.rr(ctx, 740, 1290, 680, 120, 14); ctx.fill(); ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 6; ctx.stroke();
    ctx.save(); ctx.beginPath(); D.rr(ctx, 748, 1298, 664, 104, 10); ctx.clip();
    const g = ctx.createLinearGradient(740, 0, 1420, 0);
    g.addColorStop(0, '#d9a52e'); g.addColorStop(1, '#f2c14e');
    ctx.fillStyle = g; ctx.fillRect(748, 1298, 664 * 0.78 * prog, 104);
    ctx.restore();
    text('MUNAFA ' + Math.floor(78 * prog) + '%', 1080, 1236, 54, '#ffd94d');
    text('HAR ₹100 PAR', 1080, 1470, 40, '#f5edd8');
    heroFig(1080, GY, 2.15, { expr: 'smug', seed: 5, speak: true, armL: 'rub', armR: 'rub' }, f);
  });
}, []);
// ===== P10a (1202–1265) S10 — PULL-BACK WIDE: screen FREEZE, hall andhera, sirf counter par spotlight =====
shot(1202, 1265, 0.36, { cx: 1080, cy: 1520, s: 0.7 }, { cx: 1080, cy: 1540, s: 0.62 }, (f, u) => {
  layer(0.5, () => hallBg(GY));
  layer(0.8, () => cinemaScreen(1020, 1300, 1180, 600, f, 'frozen'));
  layer(1, () => {
    // counter par spotlight cone
    ctx.save();
    ctx.fillStyle = 'rgba(255,214,120,0.13)';
    ctx.beginPath(); ctx.moveTo(1560, 1080); ctx.lineTo(1330, 2080); ctx.lineTo(1790, 2080); ctx.closePath(); ctx.fill();
    ctx.restore();
    lampPool(1560, 2000, 330, 0.3);
    ctx.fillStyle = '#3a2415'; ctx.fillRect(1330, 1960, 460, 240);
    ctx.fillStyle = '#5d3a1e'; ctx.fillRect(1330, 1960, 460, 30);
    tubDraw(1560, 1870, 0.85, {});
    text('COUNTER KHULA HAI', 1560, 1690, 38, '#ffd94d');
    seatRows(1020, GY, f);
  });
}, []);
// ===== P10b (1265–1327) S10b — LOW ANGLE punchline: hero counter ke saamne, board "ASLI PICTURE INTERVAL ME CHALTI HAI" (hit 1272) =====
shot(1265, 1327, 0.3, { cx: 1080, cy: 1700, s: 1.02 }, { cx: 1080, cy: 1640, s: 1.21 }, (f, u) => {
  const lf = f - 1265;
  layer(0.5, () => lobbyBg(GY, true));
  layer(0.85, () => counterDesk(1150, GY, 1400));
  layer(1, () => {
    const mu = lf < 20 ? 0 : Math.min(1, (lf - 20) / 13);
    heroFig(830, GY, 1.95, { expr: 'calm', seed: 5, speak: true, mix: { e2: 'happy', u: mu }, armR: 'up' }, f);
    if (lf > 7) { const p = spring((lf - 7) / 10); darkBoard(1200, 1250, 690, 240, [['ASLI PICTURE', 58, '#ffd94d'], ['INTERVAL ME CHALTI HAI', 44, '#ffc72c']], p); }
  });
}, [1272]);
// ===== P11a (1327–1376) S11 — WIDE raat: petrol pump silhouette, nozzle se boond girti hai =====
shot(1327, 1376, 0.32, { cx: 1080, cy: 1620, s: 0.72 }, { cx: 1080, cy: 1580, s: 0.83 }, (f, u) => {
  layer(0.5, () => nightBg(GY));
  layer(0.85, () => {
    // canopy
    ctx.fillStyle = '#2b3648'; ctx.fillRect(760, 1180, 900, 46);
    ctx.fillStyle = '#c62828'; ctx.fillRect(760, 1226, 900, 16);
    ctx.fillStyle = '#39445c'; ctx.fillRect(820, 1226, 30, 500); ctx.fillRect(1570, 1226, 30, 500);
    lampPool(1210, 1330, 420, 0.2);
    pumpDraw(1210, GY, 1.05, f);
  });
  layer(1, () => {
    // nozzle se girti boond (har ~22 frame)
    const cyc = (f % 22) / 22, dy = 1710 + cyc * cyc * 330;
    ctx.fillStyle = 'rgba(240,190,60,0.9)';
    D.ell(ctx, 1422, dy, 9, 13); ctx.fill();
    if (cyc > 0.92) { ctx.strokeStyle = 'rgba(240,190,60,0.6)'; ctx.lineWidth = 3; D.ell(ctx, 1422, 2052, 22 * (cyc - 0.9) * 10, 6); ctx.stroke(); }
    heroFig(740, GY, 1.25, { expr: 'worried', seed: 5, speak: true, face: 1 }, f);
  });
}, []);
// ===== P11b (1376–1425) S11b — PULL-BACK finale: board "AGLI BAAR: PETROL PUMP SCAM", hero ishara karta hai =====
shot(1376, 1425, 0.28, { cx: 1080, cy: 1560, s: 0.95 }, { cx: 1080, cy: 1600, s: 0.72 }, (f, u) => {
  const lf = f - 1376;
  layer(0.5, () => nightBg(GY));
  layer(0.8, () => {
    ctx.fillStyle = '#2b3648'; ctx.fillRect(620, 1600, 760, 40);
    ctx.fillStyle = '#c62828'; ctx.fillRect(620, 1640, 760, 14);
    pumpDraw(1000, GY, 0.92, f);
  });
  layer(1, () => {
    heroFig(1330, GY, 1.6, { expr: 'smug', seed: 5, speak: true, armR: 'catch', face: -1 }, f);
    if (lf > 6) { const p = spring((lf - 6) / 11); darkBoard(1080, 1150, 840, 210, [['AGLI BAAR:', 54, '#ffd94d'], ['PETROL PUMP SCAM', 72, '#ff8a5c']], p); }
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(255,170,60,0.06)'; ctx.fillRect(0, 0, W, H);
}, []);

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
  vignette(sh.vig);
  grain(f);
}
window.renderFrame = renderFrame;
window.TOTAL = TOTAL;
