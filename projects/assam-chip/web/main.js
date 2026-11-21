// Assam Chip Plant (EP-3) — kahani-style Short (1486 frames @30fps). Impossible sawal: band factory par sarkar ₹14,000 crore kyun?
// Jawab ghuma-ghuma kar: taala lagi kagaz factory -> chip BANTI nahi, pack/jaanch hoti hai -> entry ticket punchline -> kagaz callback.
// NEW: transformation scene, moving conveyor, taala-unlock callback. Engine V2: lip-sync + expression morphs + close-ups.
// Harness: window.ready, window.renderFrame(f), window.TOTAL.
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import * as D from './draw.js';
import { ENV } from './envelope.js';

const W = 1080, H = 1920, TOTAL = 1486, FPS = 30;
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const DEV_FONT = '"Noto Sans Devanagari"';
const fontReady = (async () => {
  try {
    const face = new FontFace('Noto Sans Devanagari', `url(data:font/ttf;base64,${DEVANAGARI_BOLD_B64})`, { weight: '700' });
    await face.load(); document.fonts.add(face);
    await document.fonts.load(`700 60px ${DEV_FONT}`, 'ASSAM ₹5');
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
const LAD1_P = { shirt: '#2e7d46', shirtD: '#226636', pants: '#33415c', skin: '#a06a38', hairC: '#14161a' };
const LAD2_P = { shirt: '#31517a', shirtD: '#243d5e', pants: '#3c3630', skin: '#b57e46', hairC: '#1c1712' };
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

// ---------------- backgrounds ----------------
const GY = 2400;
function factoryBg(gy, tone = 'dusk') {
  if (tone === 'dark') vgrad(-400, gy + 40, [[0, '#0a0c12'], [1, '#1a2030']]);
  else if (tone === 'grey') vgrad(-400, gy + 40, [[0, '#565a61'], [1, '#8f9296']]);
  else if (tone === 'gold') vgrad(-400, gy + 40, [[0, '#6e4526'], [1, '#c08a48']]);
  else vgrad(-400, gy + 40, [[0, '#2c3e5c'], [1, '#5f83ab']]);
  if (tone !== 'dark') {
    // door ki pahadiyaan / ped-line (Assam mahaul)
    ctx.fillStyle = tone === 'gold' ? 'rgba(60,36,16,0.55)' : 'rgba(18,32,44,0.6)';
    for (const [hx, hy, hr] of [[-300, gy - 120, 520], [500, gy - 90, 640], [1400, gy - 110, 580], [2250, gy - 80, 560]]) { D.ell(ctx, hx, hy + hr * 0.82, hr, hr * 0.42); ctx.fill(); }
  }
  ctx.fillStyle = tone === 'gold' ? '#4a3826' : '#33302e'; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  ctx.fillStyle = 'rgba(255,220,150,0.10)'; ctx.fillRect(-800, gy, 3760, 12);
  if (tone === 'dusk' || tone === 'gold') { lampPost(300, gy, 1.0, 0); lampPost(1860, gy, 1.0, 0); }
}
function interiorBg(gy) {
  vgrad(-400, gy + 40, [[0, '#10201c'], [1, '#27473d']]);
  ctx.fillStyle = 'rgba(190,240,220,0.10)';
  for (let i = 0; i < 6; i++) ctx.fillRect(-400 + i * 560, 260, 54, gy - 500);
  ctx.fillStyle = '#191d1a'; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  ctx.fillStyle = 'rgba(255,220,150,0.07)'; ctx.fillRect(-800, gy, 3760, 12);
}
function stationBg(gy) {
  vgrad(-400, gy + 40, [[0, '#2e4266'], [1, '#7793b5']]);
  ctx.fillStyle = 'rgba(18,32,44,0.55)';
  for (const [hx, hy, hr] of [[-200, gy - 60, 560], [900, gy - 40, 700], [2100, gy - 60, 560]]) { D.ell(ctx, hx, hy + hr * 0.82, hr, hr * 0.4); ctx.fill(); }
  ctx.fillStyle = '#4c4438'; ctx.fillRect(-800, gy - 190, 3760, 190); // platform
  ctx.fillStyle = '#5d5344'; ctx.fillRect(-800, gy - 190, 3760, 16);
  ctx.fillStyle = '#24211c'; ctx.fillRect(-800, gy, 3760, 3840 - gy); // patriyon wali zameen
  ctx.strokeStyle = '#8b93a1'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(-800, gy + 90); ctx.lineTo(2960, gy + 90); ctx.moveTo(-800, gy + 190); ctx.lineTo(2960, gy + 190); ctx.stroke();
  lampPost(420, gy - 190, 1.0, 0); lampPost(1740, gy - 190, 1.0, 0);
}

// ---------------- Assam helpers ----------------
// Factory building. lit=false: band kagaz factory (faded, tooti khidkiyan, jaale). lit=true: chamakti chip factory.
// Gate hamesha neeche center me; chain sirf band haalat me.
function factoryBuild(cx, gy, w, lit, f) {
  const body = lit ? '#d7e0ea' : '#8d8578', band = lit ? '#1d5f8a' : '#5d564a';
  // chimney (left) — band haalat me dhuaan nahi
  ctx.fillStyle = lit ? '#9fb2c4' : '#7a7264'; ctx.fillRect(cx - w * 0.36, gy - 1010, 92, 330);
  ctx.fillStyle = lit ? '#c96f2e' : '#5d564a'; ctx.fillRect(cx - w * 0.36 - 8, gy - 1010, 108, 30);
  if (lit) { ctx.fillStyle = 'rgba(240,246,250,0.5)'; for (let i = 0; i < 3; i++) { D.ell(ctx, cx - w * 0.36 + 46 + Math.sin(f * 0.05 + i) * 8, gy - 1060 - i * 44, 30 + i * 9, 17 + i * 5); ctx.fill(); } }
  // main body
  ctx.fillStyle = body; D.rr(ctx, cx - w / 2, gy - 700, w, 700, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = band; ctx.fillRect(cx - w / 2, gy - 700, w, 54);
  if (lit) {
    lampPool(cx, gy - 830, 620, 0.30 + 0.05 * Math.sin(f * 0.1));
    boardSign(cx, gy - 838, 600, 124, [['CHIP FACTORY', 58, '#0c4a6e']]);
  } else {
    ctx.save(); ctx.globalAlpha = 0.55; text('KAGAZ FACTORY', cx, gy - 610, 52, '#4c463c'); ctx.restore();
  }
  // khidkiyan 4 x 2
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
    const wx = cx - w / 2 + 90 + c * (w - 180) / 3 - 52, wy = gy - 560 + r * 170;
    if (lit) {
      const fl = 0.8 + 0.2 * Math.sin(f * 0.13 + c * 2 + r * 3);
      ctx.fillStyle = `rgba(255,217,138,${fl})`; ctx.fillRect(wx, wy, 104, 118);
    } else {
      ctx.fillStyle = '#3c3a36'; ctx.fillRect(wx, wy, 104, 118);
      ctx.strokeStyle = 'rgba(220,220,210,0.5)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(wx + 12, wy + 14); ctx.lineTo(wx + 60, wy + 66); ctx.lineTo(wx + 34, wy + 104); ctx.stroke();
    }
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.strokeRect(wx, wy, 104, 118);
  }
  // gate: do barred panel
  const gw = w * 0.46, gh = 300, gx = cx - gw / 2, gyTop = gy - gh;
  ctx.fillStyle = lit ? '#37505f' : '#4c463e'; ctx.fillRect(gx, gyTop, gw, gh);
  ctx.strokeStyle = lit ? '#9fc6dd' : '#2e2a24'; ctx.lineWidth = 7;
  for (let i = 0; i <= 8; i++) { const bx = gx + i * gw / 8; ctx.beginPath(); ctx.moveTo(bx, gyTop); ctx.lineTo(bx, gy); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(gx, gyTop + 40); ctx.lineTo(gx + gw, gyTop + 40); ctx.moveTo(gx, gy - 40); ctx.lineTo(gx + gw, gy - 40); ctx.stroke();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.strokeRect(gx, gyTop, gw, gh);
  if (!lit) {
    // jaale (cobwebs) upar ke kono me
    ctx.strokeStyle = 'rgba(235,235,225,0.5)'; ctx.lineWidth = 2.5;
    for (const sgn of [-1, 1]) {
      const ox = cx + sgn * gw / 2, oy = gyTop;
      for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(ox, oy, i * 34, sgn > 0 ? Math.PI * 0.5 : 0, sgn > 0 ? Math.PI : Math.PI * 0.5); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox - sgn * 100, oy + 100); ctx.moveTo(ox, oy); ctx.lineTo(ox - sgn * 100, oy + 30); ctx.moveTo(ox, oy); ctx.lineTo(ox - sgn * 30, oy + 100); ctx.stroke();
    }
  }
}
// Bada taala. open 0..1 (shackle khulta hai), rot = girne ka jhukaav.
function taalaDraw(x, y, s, open = 0, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.strokeStyle = '#8a8f99'; ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.save(); ctx.translate(-42, -34); ctx.rotate(-open * 0.85);
  ctx.beginPath(); ctx.arc(42, 0, 42, Math.PI, Math.PI * 2); ctx.stroke(); ctx.restore();
  ctx.fillStyle = '#e8b64c'; D.rr(ctx, -72, -36, 144, 120, 15); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-72, -36, 144, 16);
  D.circ(ctx, 0, 18, 15); ctx.fillStyle = '#4a3a10'; ctx.fill();
  ctx.fillRect(-6, 24, 12, 28);
  ctx.restore();
}
// Computer chip. glow 0..1 (chamak), dead=true (bujhi/tuti), check=true (hari sahi-nishan)
function chipDraw(x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  if (o.glow) lampPool(0, 0, 150, 0.42 * o.glow * (0.85 + 0.15 * Math.sin((o.f || 0) * 0.2)));
  ctx.strokeStyle = o.dead ? '#5d564a' : '#c9a227'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const p = -33 + i * 22;
    ctx.beginPath(); ctx.moveTo(p, -64); ctx.lineTo(p, -46); ctx.moveTo(p, 46); ctx.lineTo(p, 64); ctx.moveTo(-64, p); ctx.lineTo(-46, p); ctx.moveTo(46, p); ctx.lineTo(64, p); ctx.stroke();
  }
  ctx.fillStyle = o.dead ? '#4a4a44' : '#14532d'; D.rr(ctx, -48, -48, 96, 96, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = o.dead ? '#5d5d55' : '#1f7a44'; D.rr(ctx, -28, -28, 56, 56, 7); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = o.dead ? 'rgba(0,0,0,0.35)' : 'rgba(140,240,180,0.65)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-28, 0); ctx.lineTo(-12, 0); ctx.moveTo(12, 0); ctx.lineTo(28, 0); ctx.moveTo(0, -28); ctx.lineTo(0, -12); ctx.moveTo(0, 12); ctx.lineTo(0, 28); ctx.stroke();
  if (o.dead) { ctx.strokeStyle = 'rgba(20,18,14,0.8)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-40, -30); ctx.lineTo(-8, 2); ctx.lineTo(-20, 26); ctx.lineTo(14, 44); ctx.stroke(); }
  if (o.check) {
    ctx.strokeStyle = '#37d67a'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-18, 2); ctx.lineTo(-5, 16); ctx.lineTo(22, -14); ctx.stroke();
  }
  ctx.restore();
}
// Chalti conveyor belt: chips left se aati hain, beech me station (PACK / JAANCH).
function conveyor(x, y, w, f, mode) {
  ctx.fillStyle = '#3a4149';
  for (const lx of [x - w / 2 + 40, x + w / 2 - 40]) ctx.fillRect(lx - 14, y + 20, 28, 130);
  ctx.fillStyle = '#22262e'; D.rr(ctx, x - w / 2, y - 28, w, 56, 28); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#454c57'; ctx.fillRect(x - w / 2 + 12, y - 28, w - 24, 12);
  // rollers (ghoomte hue)
  ctx.fillStyle = '#8b93a1';
  const roff = (f * 5) % 92;
  for (let rx = x - w / 2 + 30 - roff; rx < x + w / 2; rx += 92) { D.circ(ctx, rx, y + 34, 9); ctx.fill(); }
  // chips belt par
  const sp = 176, off = (f * 5) % sp, sx = x + 90;
  for (let cxp = x - w / 2 - 90 + off; cxp < x + w / 2 + 100; cxp += sp) {
    const passed = cxp > sx + 60;
    chipDraw(cxp, y - 62, 0.82, { glow: mode === 1 && passed ? 0.9 : 0.3, check: mode === 1 && passed, f });
  }
  // station: do khambhe + upar dabba; JAANCH me dabba neeche-upar hota hai (stamp)
  const bob = mode === 1 ? Math.max(0, Math.sin(f * 0.32)) * 26 : 0;
  ctx.fillStyle = '#5d6672'; ctx.fillRect(sx - 78, y - 300, 22, 240); ctx.fillRect(sx + 56, y - 300, 22, 240);
  ctx.fillStyle = mode === 1 ? '#2b6cb0' : '#b7791f'; D.rr(ctx, sx - 104, y - 356 + bob, 208, 74, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  text(mode === 1 ? 'JAANCH' : 'PACK', sx, y - 318 + bob, 42, '#ffffff');
  if (mode === 1) { ctx.fillStyle = '#37d67a'; D.rr(ctx, sx - 30, y - 282 + bob, 60, 26, 6); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 3; ctx.stroke(); }
}
// Duniya ka naksha: kuch desh sunehri, Bharat grey (bahar).
function worldMap(cx, cy, w, f) {
  const h = w * 0.52;
  ctx.save(); ctx.translate(cx, cy);
  lampPool(0, 0, w * 0.62, 0.10);
  ctx.fillStyle = '#10151f'; D.rr(ctx, -w / 2, -h / 2, w, h, 18); ctx.fill(); ctx.strokeStyle = '#3a4a63'; ctx.lineWidth = 5; ctx.stroke();
  const blob = (dx, dy, r, gold, bharat) => {
    const px = dx * w, py = dy * h;
    if (gold) lampPool(px, py, r * 2.1, 0.30 + 0.08 * Math.sin(f * 0.12 + dx * 9));
    ctx.fillStyle = gold ? '#c9a227' : '#59616e';
    for (const [ox, oy, orr] of [[0, 0, 1], [-0.55, 0.22, 0.62], [0.55, 0.18, 0.66], [0.1, -0.5, 0.55]]) { D.circ(ctx, px + ox * r, py + oy * r, r * orr); ctx.fill(); }
    if (bharat) {
      ctx.strokeStyle = 'rgba(245,237,216,0.85)'; ctx.lineWidth = 3.5; ctx.setLineDash([13, 10]);
      D.circ(ctx, px, py, r * 1.28); ctx.stroke(); ctx.setLineDash([]);
      text('BHARAT', px, py + r * 1.62, 34, '#cfd6de');
    }
  };
  blob(-0.36, -0.20, w * 0.075, true, false);
  blob(-0.27, 0.20, w * 0.05, false, false);
  blob(-0.06, -0.26, w * 0.045, true, false);
  blob(-0.01, 0.10, w * 0.058, false, false);
  blob(0.20, -0.18, w * 0.08, false, false);
  blob(0.155, 0.13, w * 0.037, false, true);   // Bharat — grey, bahar
  blob(0.37, -0.22, w * 0.05, true, false);
  blob(0.35, 0.26, w * 0.042, true, false);
  ctx.restore();
}
// Sunehra entry ticket.
function ticketDraw(x, y, w, h, p) {
  ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
  lampPool(0, 0, w * 0.72, 0.35);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, '#f2c14e'); g.addColorStop(1, '#d9a52e');
  ctx.fillStyle = g; D.rr(ctx, -w / 2, -h / 2, w, h, 18); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.strokeStyle = 'rgba(90,58,8,0.65)'; ctx.lineWidth = 4; ctx.setLineDash([14, 12]);
  ctx.beginPath(); ctx.moveTo(w / 2 - 120, -h / 2 + 12); ctx.lineTo(w / 2 - 120, h / 2 - 12); ctx.stroke(); ctx.setLineDash([]);
  D.circ(ctx, w / 2 - 120, -h / 2, 20); ctx.fillStyle = '#14100a'; ctx.fill();
  D.circ(ctx, w / 2 - 120, h / 2, 20); ctx.fill();
  text('CHIP KE KHEL', -60, -h * 0.20, 56, '#7a4d12');
  text('ENTRY TICKET', -60, h * 0.16, 76, '#5d3a08');
  text('★', w / 2 - 60, 0, 64, '#7a4d12');
  ctx.restore();
}
// Kagaz ki sheet: uspar chip ki kahani print hoti hui (prog 0..1).
function paperDraw(x, y, w, h, prog, f) {
  ctx.save(); ctx.translate(x, y);
  D.softShadow(ctx, 6, h / 2 + 16, w * 0.52, 22, 0.3);
  ctx.fillStyle = '#f5edd8'; D.rr(ctx, -w / 2, -h / 2, w, h, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.save();
  ctx.beginPath(); ctx.rect(-w / 2 + 8, -h / 2 + 8, w - 16, Math.max(2, (h - 16) * prog)); ctx.clip();
  text('KAL TAK: KAGAZ BANTA THA', 0, -h / 2 + 78, 40, '#8a8172');
  chipDraw(0, -h * 0.10, 1.7, { glow: 0.8, f });
  text('AB: BHARAT KI CHIP', 0, h * 0.20, 54, '#14532d');
  text('KI KAHANI CHHAPEGI', 0, h * 0.20 + 66, 54, '#14532d');
  ctx.fillStyle = 'rgba(20,24,31,0.30)';
  ctx.fillRect(-w * 0.32, h * 0.36, w * 0.64, 12); ctx.fillRect(-w * 0.26, h * 0.36 + 34, w * 0.52, 12);
  ctx.restore();
  if (prog < 1) { // print-head ki laal lakeer
    const py = -h / 2 + 8 + (h - 16) * prog;
    ctx.fillStyle = '#c62828'; ctx.fillRect(-w / 2 - 14, py - 5, w + 28, 10);
  }
  ctx.restore();
}
function bagDraw(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = col; D.rr(ctx, -46, -78, 92, 84, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -78, 26, Math.PI, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-46, -52, 92, 12);
  ctx.restore();
}

/* =====================================================================
   TIMING — Assam Chip Plant EP-3 (script v3, voice_final_v2, TOTAL 1486 @30fps)
   S1 0 | S2 102 | S3 273 | S4 399 | S5 503 | S6 537 (twist shabd 571) | S7 630
   S8 789 | S9 948 | S10 1087 | S11 1220 | S12 1360 | END 1486
   ===================================================================== */

// ===== A1a (0–52) S1 — wide: band factory gate, taala, hero saamne khada =====
shot(0, 52, 0.28, { cx: 1080, cy: 1560, s: 0.64 }, { cx: 1080, cy: 1520, s: 0.73 }, (f, u) => {
  layer(0.5, () => factoryBg(GY, 'dusk'));
  layer(0.85, () => factoryBuild(1180, GY, 1180, false, f));
  layer(1, () => {
    taalaDraw(1180, GY - 130, 1.05, 0);
    heroFig(790, GY, 1.15, { expr: 'puzzled', seed: 5, speak: true, face: 1, armR: 'point' }, f);
  });
}, []);
// ===== A1b (52–102) S1b — close-up sawal + board pop "BAND FACTORY ₹14,000 CRORE?" =====
shot(52, 102, 0.3, { cx: 1080, cy: 1880, s: 1.3 }, { cx: 1080, cy: 1840, s: 1.44 }, (f, u) => {
  const lf = f - 52;
  layer(0.5, () => factoryBg(GY, 'dark'));
  layer(1, () => {
    heroFig(1080, GY, 2.2, { expr: 'puzzled', seed: 5, speak: true, armR: 'scratch' }, f);
    if (lf > 14) { const p = spring((lf - 14) / 11); darkBoard(1080, 1330, 760, 216, [['BAND FACTORY', 58, '#ffd94d'], ['₹14,000 CRORE?', 82, '#ffc72c']], p); }
    bigQ(1390, 1560 + Math.sin(f * 0.15) * 12, 0.8, '#ffd94d', Math.sin(f * 0.1) * 0.08);
  });
}, [68]);
// ===== A2a (102–168) S2 — factory side angle, "JAGIROAD, ASSAM" board, chimney band =====
shot(102, 168, 0.28, { cx: 1020, cy: 1540, s: 0.58 }, { cx: 1100, cy: 1510, s: 0.66 }, (f, u) => {
  layer(0.5, () => factoryBg(GY, 'grey'));
  layer(0.85, () => factoryBuild(1250, GY, 1250, false, f));
  layer(1, () => {
    const p = spring(Math.min(1, Math.max(0, (f - 116) / 11)));
    if (f > 116) boardSign(720, 1080, 500, 126, [['JAGIROAD, ASSAM', 46, '#4c463c']], p);
    heroFig(760, GY, 0.95, { expr: 'calm', seed: 5, speak: true, walk: (f * 0.022) % 1 }, f);
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(120,110,95,0.13)'; ctx.fillRect(0, 0, W, H);
}, []);
// ===== A2b (168–222) S2b — TAALA extreme close-up, hero ka haath taale par =====
shot(168, 222, 0.32, { cx: 1080, cy: 1720, s: 1.08 }, { cx: 1080, cy: 1690, s: 1.2 }, (f, u) => {
  layer(0.6, () => {
    factoryBg(GY, 'grey');
    ctx.fillStyle = '#4c463e'; ctx.fillRect(300, 900, 1560, 1500);
    ctx.strokeStyle = '#2e2a24'; ctx.lineWidth = 10;
    for (let i = 0; i <= 9; i++) { const bx = 300 + i * 1560 / 9; ctx.beginPath(); ctx.moveTo(bx, 900); ctx.lineTo(bx, 2400); ctx.stroke(); }
  });
  layer(1, () => {
    taalaDraw(950, 1620 + Math.sin(f * 0.06) * 5, 2.7, 0);
    heroFig(1380, GY + 40, 1.7, { expr: 'sad', seed: 5, speak: true, armR: 'hold', headDip: 0.25 }, f);
    ctx.fillStyle = 'rgba(240,238,228,0.35)';
    for (let i = 0; i < 7; i++) { const dx = 620 + hash(i * 3.1) * 800, dy = 1050 + ((f * 1.3 + i * 260) % 800); D.circ(ctx, dx, dy, 3.5); ctx.fill(); }
  });
}, []);
// ===== A3a (222–273) S3 — hero phone haath me, phone ke andar chamakti chip =====
shot(222, 273, 0.28, { cx: 1080, cy: 1800, s: 1.24 }, { cx: 1080, cy: 1770, s: 1.36 }, (f, u) => {
  const lf = f - 222;
  layer(0.5, () => factoryBg(GY, 'dusk'));
  layer(1, () => {
    heroFig(880, GY, 2.1, { expr: 'happy', seed: 5, speak: true, armR: 'phone' }, f);
    if (lf > 6) {
      const p = spring((lf - 6) / 11);
      ctx.save(); ctx.translate(1320, 1560); ctx.scale(p, p);
      ctx.fillStyle = '#14181f'; D.rr(ctx, -150, -290, 300, 580, 34); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
      ctx.fillStyle = '#0d1f16'; D.rr(ctx, -132, -268, 264, 536, 24); ctx.fill();
      chipDraw(0, -30, 1.55, { glow: 1, f });
      text('CHIP', 0, 190, 52, '#8ef0b3');
      ctx.restore();
    }
  });
}, []);
// ===== A3b (273–336) S3b — TRANSFORMATION: band factory -> chamakti CHIP FACTORY =====
shot(273, 336, 0.28, { cx: 1080, cy: 1540, s: 0.62 }, { cx: 1080, cy: 1500, s: 0.78 }, (f, u) => {
  const lf = f - 273;
  const p = D.clamp((lf - 10) / 32, 0, 1), pe = sstep(p);
  layer(0.5, () => factoryBg(GY, 'dusk'));
  layer(0.85, () => {
    if (pe < 1) { ctx.save(); ctx.globalAlpha = 1 - pe; factoryBuild(1180, GY, 1180, false, f); ctx.restore(); }
    if (pe > 0) { ctx.save(); ctx.globalAlpha = pe; factoryBuild(1180, GY, 1180, true, f); ctx.restore(); }
  });
  layer(1, () => {
    if (pe < 0.55) taalaDraw(1180, GY - 130, 1.05, 0);
    const mu = lf < 30 ? 0 : Math.min(1, (lf - 30) / 12);
    heroFig(770, GY, 1.2, { expr: 'calm', seed: 5, speak: true, mix: { e2: 'surprise', u: mu }, face: 1 }, f);
  });
}, [317]);
// ===== A4a (336–399) S4 — dark reveal board: "KUL KHARCHA ₹27,000 CRORE" =====
shot(336, 399, 0.34, { cx: 1080, cy: 1540, s: 0.92 }, { cx: 1080, cy: 1490, s: 1.1 }, (f, u) => {
  const lf = f - 336;
  layer(0.5, () => factoryBg(GY, 'dark'));
  layer(1, () => {
    const mu = lf < 12 ? 0 : Math.min(1, (lf - 12) / 12);
    heroFig(1080, GY, 1.75, { expr: 'calm', seed: 5, speak: lf < 13, mix: { e2: 'shocked', u: mu }, sweat: mu > 0.4 }, f);
    if (lf > 10) { const p = spring((lf - 10) / 12); darkBoard(1080, 1150, 880, 256, [['KUL KHARCHA', 68, '#ffd94d'], ['₹27,000 CRORE', 94, '#ffc72c']], p); }
  });
}, [348]);
// ===== A4b (399–452) S4b — board dusra hissa: "AADHA PAISA SARKAR KA" + hero side me =====
shot(399, 452, 0.3, { cx: 1080, cy: 1620, s: 1.0 }, { cx: 1080, cy: 1590, s: 1.06 }, (f, u) => {
  const lf = f - 399;
  layer(0.5, () => factoryBg(GY, 'dark'));
  layer(1, () => {
    heroFig(790, GY, 1.9, { expr: 'calm', seed: 5, speak: true, armR: 'point' }, f);
    if (lf > 4) { const p = spring((lf - 4) / 11); darkBoard(1290, 1200, 580, 216, [['AADHA PAISA', 54, '#ffd94d'], ['SARKAR KA', 66, '#ffc72c']], p); }
  });
}, []);
// ===== A5 (452–503) S5 — close-up: "Pagalpan lagta hai na?" smug morph + head tilt =====
shot(452, 503, 0.28, { cx: 1080, cy: 1900, s: 1.44 }, { cx: 1080, cy: 1860, s: 1.58 }, (f, u) => {
  const lf = f - 452;
  layer(0.5, () => factoryBg(GY, 'dusk'));
  layer(1, () => {
    const mu = lf < 8 ? 0 : Math.min(1, (lf - 8) / 13);
    heroFig(1080, GY, 2.3, { expr: 'calm', seed: 5, speak: true, mix: { e2: 'smug', u: mu }, headDip: 0.12 + 0.06 * Math.sin(f * 0.1) }, f);
    bigQ(1360, 1500 + Math.sin(f * 0.14) * 11, 0.75, '#ffd94d', Math.sin(f * 0.09) * 0.09);
  });
}, []);
// ===== A6a (503–537) S6 — twist setup: close-up gambheer =====
shot(503, 537, 0.3, { cx: 1080, cy: 1880, s: 1.34 }, { cx: 1080, cy: 1850, s: 1.48 }, (f, u) => {
  layer(0.5, () => factoryBg(GY, 'dark'));
  layer(1, () => {
    heroFig(1080, GY, 2.25, { expr: 'worried', seed: 5, speak: true, armR: 'up' }, f);
  });
}, []);
// ===== A6b-1 (537–571) S6 — tension build: camera andar, hero gambheer->tense =====
shot(537, 571, 0.32, { cx: 1080, cy: 1860, s: 1.3 }, { cx: 1080, cy: 1830, s: 1.46 }, (f, u) => {
  const lf = f - 537;
  layer(0.5, () => factoryBg(GY, 'dark'));
  layer(1, () => {
    const mu = lf < 16 ? 0 : Math.min(1, (lf - 16) / 13);
    heroFig(1020, GY, 2.2, { expr: 'worried', seed: 5, speak: true, mix: { e2: 'surprise', u: mu }, sweat: mu > 0.5 }, f);
    chipDraw(1360, 1560 + Math.sin(f * 0.1) * 10, 1.15, { glow: 0.4, f });
  });
}, []);
// ===== A6b-2 (571–630) S6 TWIST — chip par laal X + "CHIP YAHAN BANTI NAHI!" + shocked morph + hit =====
shot(571, 630, 0.34, { cx: 1080, cy: 1640, s: 1.04 }, { cx: 1080, cy: 1600, s: 1.24 }, (f, u) => {
  const lf = f - 571;
  layer(0.5, () => factoryBg(GY, 'dark'));
  layer(1, () => {
    const mu = lf < 2 ? 0 : Math.min(1, (lf - 2) / 12);
    heroFig(800, GY, 2.0, { expr: 'calm', seed: 5, speak: mu < 0.4, mix: { e2: 'shocked', u: mu }, sweat: mu > 0.4 }, f);
    if (lf > 2) {
      const p = spring((lf - 2) / 10);
      ctx.save(); ctx.translate(1380, 1560); ctx.scale(p, p);
      chipDraw(0, 0, 1.9, { glow: 0.25, f });
      ctx.strokeStyle = '#e53935'; ctx.lineWidth = 17; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-78, -78); ctx.lineTo(78, 78); ctx.moveTo(78, -78); ctx.lineTo(-78, 78); ctx.stroke();
      ctx.restore();
    }
    if (lf > 10) { const p = spring((lf - 10) / 11); darkBoard(1120, 1100, 780, 216, [['CHIP YAHAN', 60, '#ffd94d'], ['BANTI NAHI!', 84, '#ff8a5c']], p); }
  });
}, [577]);
// ===== A7a (630–695) S7 — conveyor: chips bahar se aati, PACK station =====
shot(630, 695, 0.28, { cx: 1080, cy: 1640, s: 0.86 }, { cx: 1080, cy: 1610, s: 0.95 }, (f, u) => {
  layer(0.5, () => interiorBg(GY));
  layer(1, () => {
    conveyor(1030, 1830, 1560, f, 0);
    heroFig(1500, GY, 1.05, { expr: 'calm', seed: 5, speak: true, face: -1 }, f);
    text('CHIP BAHAR SE AATI HAI →', 900, 1180, 46, '#cfe8d8');
  });
}, []);
// ===== A7b (695–755) S7b — JAANCH stamp + board "ROZ ~5 CRORE CHIP" =====
shot(695, 755, 0.28, { cx: 1080, cy: 1660, s: 1.04 }, { cx: 1080, cy: 1630, s: 1.14 }, (f, u) => {
  const lf = f - 695;
  layer(0.5, () => interiorBg(GY));
  layer(1, () => {
    conveyor(1080, 1900, 1500, f, 1);
    if (lf > 20) { const p = spring((lf - 20) / 11); darkBoard(1080, 1120, 720, 158, [['ROZ ~5 CRORE CHIP', 58, '#ffc72c']], p); }
  });
}, [717]);
// ===== A8a (755–789) S8 — do chip aamne-saamne: bina pack = bekaar vs pack = chamakti =====
shot(755, 789, 0.28, { cx: 1080, cy: 1620, s: 0.98 }, { cx: 1080, cy: 1590, s: 1.07 }, (f, u) => {
  layer(0.5, () => interiorBg(GY));
  layer(1, () => {
    conveyor(1030, 1830, 1560, f, 0);
    heroFig(1500, GY, 1.05, { expr: 'calm', seed: 5, speak: true, face: -1 }, f);
    text('CHIP BAHAR SE AATI HAI →', 900, 1180, 46, '#cfe8d8');
  });
}, []);
// ===== A7b (695–755) S7b — JAANCH stamp + board "ROZ ~5 CRORE CHIP" =====
shot(789, 855, 0.3, { cx: 1080, cy: 1620, s: 1.0 }, { cx: 1080, cy: 1590, s: 1.09 }, (f, u) => {
  layer(0.5, () => factoryBg(GY, 'dark'));
  layer(1, () => {
    chipDraw(790, 1520, 2.0, { dead: true, rot: -0.1 });
    text('BINA PACK', 790, 1760, 46, '#9a9484');
    text('BEKAAR', 790, 1830, 52, '#c96f5a');
    chipDraw(1390, 1520, 2.0, { glow: 1, check: true, f });
    text('PACK + JAANCH', 1390, 1760, 46, '#ffe9a8');
    text('CHAMAKTI', 1390, 1830, 52, '#37d67a');
    text('VS', 1090, 1520, 60, '#ffd94d');
  });
}, []);
// ===== A8b (789–855) S8b — hero gambheer close-up; bujhi chip haath se girti hai =====
shot(855, 905, 0.3, { cx: 1080, cy: 1880, s: 1.38 }, { cx: 1080, cy: 1850, s: 1.52 }, (f, u) => {
  const lf = f - 855;
  layer(0.5, () => factoryBg(GY, 'dark'));
  layer(1, () => {
    heroFig(980, GY, 2.2, { expr: 'worried', seed: 5, speak: true, armR: 'hold' }, f);
    if (lf > 26) {
      const fp = D.clamp((lf - 26) / 24, 0, 1);
      const fy = 1330 + fp * fp * 830, bounce = fp >= 1 ? Math.abs(Math.sin((lf - 50) * 0.5)) * Math.max(0, 14 - (lf - 50)) : 0;
      chipDraw(1340, fy - bounce, 1.05, { dead: true, rot: fp * 1.9 });
    }
  });
}, []);
// ===== A9a (855–905) S9 — world map: kuch desh gold, Bharat grey; hero bahar khada =====
shot(905, 948, 0.3, { cx: 1080, cy: 1880, s: 1.38 }, { cx: 1080, cy: 1850, s: 1.52 }, (f, u) => {
  const lf = f - 855;
  layer(0.5, () => factoryBg(GY, 'dark'));
  layer(1, () => {
    heroFig(980, GY, 2.2, { expr: 'worried', seed: 5, speak: true, armR: 'hold' }, f);
    if (lf > 26) {
      const fp = D.clamp((lf - 26) / 24, 0, 1);
      const fy = 1330 + fp * fp * 830, bounce = fp >= 1 ? Math.abs(Math.sin((lf - 50) * 0.5)) * Math.max(0, 14 - (lf - 50)) : 0;
      chipDraw(1340, fy - bounce, 1.05, { dead: true, rot: fp * 1.9 });
    }
  });
}, []);
// ===== A9a (855–905) S9 — world map: kuch desh gold, Bharat grey; hero bahar khada =====
shot(948, 1020, 0.3, { cx: 1080, cy: 1600, s: 0.8 }, { cx: 1080, cy: 1570, s: 0.9 }, (f, u) => {
  layer(0.5, () => factoryBg(GY, 'dark'));
  layer(1, () => {
    worldMap(1120, 1420, 1080, f);
    heroFig(720, GY, 1.2, { expr: 'sad', seed: 5, speak: true, face: 1, headDip: 0.3 }, f);
  });
}, []);
// ===== A9b (905–948) S9b — close-up: udaas -> ummeed morph =====
shot(1020, 1087, 0.28, { cx: 1080, cy: 1900, s: 1.42 }, { cx: 1080, cy: 1870, s: 1.55 }, (f, u) => {
  const lf = f - 1020;
  layer(0.5, () => factoryBg(GY, 'dusk'));
  layer(1, () => {
    const mu = lf < 13 ? 0 : Math.min(1, (lf - 13) / 14);
    heroFig(1080, GY, 2.3, { expr: 'sad', seed: 5, speak: true, headDip: 0.4 * (1 - mu), mix: { e2: 'happy', u: mu } }, f);
  });
}, []);
// ===== A10a (948–1020) S10 — station: 2 ladke bag liye train ki taraf chalte hue =====
shot(1087, 1155, 0.28, { cx: 1000, cy: 1620, s: 0.84 }, { cx: 1160, cy: 1600, s: 0.9 }, (f, u) => {
  const lf = f - 1087;
  layer(0.5, () => stationBg(GY));
  layer(0.85, () => {
    // train silhouette (right)
    ctx.fillStyle = '#26303c'; D.rr(ctx, 1560, GY - 560, 900, 380, 14); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = 'rgba(255,217,138,0.85)';
    for (let i = 0; i < 5; i++) ctx.fillRect(1600 + i * 160, GY - 500, 104, 92);
    ctx.fillStyle = '#171c22'; ctx.fillRect(1560, GY - 180, 900, 26);
  });
  layer(1, () => {
    heroFig(730, GY, 1.25, { expr: 'calm', seed: 5, speak: true, face: 1 }, f);
    const wx = 1080 + lf * 2.2;
    heroFig(wx, GY, 1.05, { preset: LAD1_P, expr: 'sad', seed: 11, walk: (f * 0.03) % 1, headDip: 0.3 }, f);
    bagDraw(wx + 95, GY - 60, 0.95, '#8a5a2b');
    heroFig(wx + 300, GY, 1.05, { preset: LAD2_P, expr: 'sad', seed: 17, walk: (f * 0.03 + 0.5) % 1, headDip: 0.3 }, f);
    bagDraw(wx + 395, GY - 60, 0.95, '#31517a');
  });
}, []);
// ===== A10b (1020–1087) S10b — ladke ruk kar peeche mudte hain; door factory ki roshni =====
shot(1155, 1220, 0.28, { cx: 1080, cy: 1600, s: 0.8 }, { cx: 1080, cy: 1570, s: 0.89 }, (f, u) => {
  const lf = f - 1155;
  layer(0.5, () => stationBg(GY));
  layer(0.8, () => {
    ctx.save(); ctx.globalAlpha = 0.92; factoryBuild(430, GY - 190, 620, true, f); ctx.restore();
  });
  layer(1, () => {
    const mu = lf < 12 ? 0 : Math.min(1, (lf - 12) / 14);
    heroFig(1230, GY, 1.1, { preset: LAD1_P, expr: 'sad', seed: 11, face: -1, mix: { e2: 'happy', u: mu } }, f);
    bagDraw(1330, GY - 60, 0.95, '#8a5a2b');
    heroFig(1520, GY, 1.1, { preset: LAD2_P, expr: 'sad', seed: 17, face: -1, mix: { e2: 'happy', u: mu } }, f);
    bagDraw(1620, GY - 60, 0.95, '#31517a');
    if (lf > 20) text('AB NAHI JAANA PADEGA!', 1300, 1330, 50, '#ffe9a8');
  });
}, []);
// ===== A11a (1087–1155) S11 — gate close-up: TAALA KHULTA HAI, girta hai (callback) + hit =====
shot(1220, 1280, 0.32, { cx: 1080, cy: 1700, s: 1.1 }, { cx: 1080, cy: 1670, s: 1.22 }, (f, u) => {
  const lf = f - 1220;
  layer(0.6, () => {
    factoryBg(GY, 'gold');
    ctx.fillStyle = '#37505f'; ctx.fillRect(330, 850, 1500, 1550);
    ctx.strokeStyle = '#9fc6dd'; ctx.lineWidth = 10;
    for (let i = 0; i <= 9; i++) { const bx = 330 + i * 1500 / 9; ctx.beginPath(); ctx.moveTo(bx, 850); ctx.lineTo(bx, 2400); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(330, 900); ctx.lineTo(1830, 900); ctx.stroke();
  });
  layer(1, () => {
    const open = D.clamp((lf - 24) / 10, 0, 1);
    const fp = D.clamp((lf - 36) / 9, 0, 1);
    const ty = 1560 + fp * fp * 560, rot = fp * 0.85;
    taalaDraw(1080, ty, 3.0, open, rot);
    if (fp >= 1) { // girne par dhool ke gubbare
      ctx.fillStyle = 'rgba(230,220,200,0.4)';
      for (let i = 0; i < 5; i++) { const a = i * 1.26 + 0.4, rr2 = 60 + (lf - 45) * 3; D.circ(ctx, 1080 + Math.cos(a) * rr2, 2190 + Math.sin(a) * 16, 15 + (lf - 45)); ctx.fill(); }
    }
    if (lf > 50) text('TAALA KHUL GAYA!', 1080, 1130, 56, '#ffe9a8');
  });
}, [1266]);
// ===== A11b (1155–1220) S11b — gate par bada ENTRY TICKET + hero garv se =====
shot(1280, 1360, 0.3, { cx: 1080, cy: 1580, s: 0.94 }, { cx: 1080, cy: 1540, s: 1.1 }, (f, u) => {
  const lf = f - 1280;
  layer(0.5, () => factoryBg(GY, 'gold'));
  layer(0.85, () => factoryBuild(1180, GY, 1180, true, f));
  layer(1, () => {
    if (lf > 8) { const p = spring((lf - 8) / 12); ticketDraw(1200, 1330, 700, 280, p); }
    const mu = lf < 6 ? 0 : Math.min(1, (lf - 6) / 13);
    heroFig(770, GY, 2.0, { expr: 'calm', seed: 5, speak: true, armR: 'up', mix: { e2: 'happy', u: mu } }, f);
  });
}, [1290]);
// ===== A12a (1220–1280) S12 — kagaz sheet close-up: chip ki kahani print hoti hui =====
shot(1360, 1425, 0.28, { cx: 1080, cy: 1560, s: 1.04 }, { cx: 1080, cy: 1530, s: 1.13 }, (f, u) => {
  const lf = f - 1360;
  layer(0.5, () => factoryBg(GY, 'dark'));
  layer(1, () => {
    lampPool(1080, 1500, 800, 0.16);
    paperDraw(1080, 1520, 880, 1180, D.clamp(lf / 52, 0, 1), f);
  });
}, []);
// ===== A12b (1280–1360) S12b — final wide: chamakti factory shaam ko, hero muskurata =====
shot(1425, 1486, 0.26, { cx: 1080, cy: 1560, s: 0.7 }, { cx: 1080, cy: 1520, s: 0.8 }, (f, u) => {
  layer(0.5, () => factoryBg(GY, 'gold'));
  layer(0.85, () => factoryBuild(1180, GY, 1200, true, f));
  layer(1, () => {
    heroFig(800, GY, 1.3, { expr: 'happy', seed: 5, speak: true, face: 1, armR: 'up' }, f);
    lampPool(1180, 1500, 700, 0.14 + 0.03 * Math.sin(f * 0.08));
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(255,170,60,0.07)'; ctx.fillRect(0, 0, W, H);
}, []);
// ===== A12c (1360–1425) S12c — hero close-up: muskurahat ke saath aakhri baat =====
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
