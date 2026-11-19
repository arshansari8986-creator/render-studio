// Ghadi Founder Story — PREMIUM rebuild in the house engine (De Beers web5 base).
// Full 5-video strategy: original rig, BIG hero, rich sets, spline camera in every
// shot, <=2.2s shots, gold boards synced to speech, framing-safe camera clamps.
// Harness: window.ready, window.renderFrame(f), canvas #c. 1080x1920, 30 fps, 2660 frames.
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import * as D from './draw.js';
import { ENV } from './envelope.js';

const W = 1080, H = 1920, TOTAL = 2660, FPS = 30;
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const DEV_FONT = '"Noto Sans Devanagari"';
const fontReady = (async () => {
  try {
    const face = new FontFace('Noto Sans Devanagari', `url(data:font/ttf;base64,${DEVANAGARI_BOLD_B64})`, { weight: '700' });
    await face.load(); document.fonts.add(face);
    await document.fonts.load(`700 60px ${DEV_FONT}`, 'GHADI CRORE RAJYA MARGIN WHEEL KANPUR SABUN BHAROSA');
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
const spring = (t) => D.clamp(D.easeOutBack(D.clamp(t, 0, 1)), 0, 1); // clamped: no overshoot past frame-safe size
const fmtIN = (n) => Math.round(n).toLocaleString('en-IN');
function hash(n) { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }
const sstep = (u) => { u = D.clamp(u, 0, 1); return u * u * u * (u * (u * 6 - 15) + 10); };
function withSquash(x, y, sq, fn) { ctx.save(); ctx.translate(x, y); ctx.scale(1 + 0.10 * sq, 1 - 0.12 * sq); ctx.translate(-x, -y); fn(); ctx.restore(); }
function landSq(f, at) { const u = (f - at) / 11; if (u < 0 || u > 1) return 0; return Math.sin(u * Math.PI * 2.2) * (1 - u); }
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

// ---------------- gold boards (house grammar, scale clamped for framing) ----------------
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

// ---------------- characters (ORIGINAL rig only) ----------------
const HERO = { shirt: '#f2b705', shirtD: '#cf9604', pants: '#6e5136' };
const FATHER = { shirt: '#e8dcc0', shirtD: '#c9b384', pants: '#f0ead8', hairC: '#c9ccd1', skin: '#bd7f4e' };
const SHOPK = { shirt: '#2e8a7a', shirtD: '#1f6a5c', pants: '#3a3f45' };
const RIVAL = { shirt: '#7a2436', shirtD: '#5d1a29' };
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
function fatherFig(x, y, s, o = {}) {
  heroFig(x, y, s, { ...o, preset: FATHER, seed: o.seed || 11 });
}
function judgeFig(x, y, s, o = {}) {
  const f = FRAME;
  D.drawLandlord(ctx, {
    x, y, s, _t: f, expr: o.expr || 'angry',
    blink: D.blinkAt(f, o.seed || 13),
    armL: o.armL || 'down', armR: o.armR || 'down', face: o.face || 0,
    walk: o.walk !== undefined ? o.walk : null, shout: o.shout || 0,
  });
}
function maaFig(x, y, s, o = {}) {
  const f = FRAME;
  D.drawMaa(ctx, {
    x, y, s, _t: f, expr: o.expr || 'calm',
    blink: D.blinkAt(f, o.seed || 9),
    armL: o.armL || 'down', armR: o.armR || 'down', face: o.face || 0,
  });
}
function sittingFig(x, y, s, o = {}) {
  const f = FRAME;
  D.drawHeroSitting(ctx, {
    x, y, s, _t: f, shirt: HERO.shirt, shirtD: HERO.shirtD, pants: HERO.pants,
    expr: o.expr || 'happy', blink: D.blinkAt(f, 5),
    slump: o.slump || 0, headDip: o.headDip || 0,
  });
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
function sunMoon(night) {
  if (night) {
    ctx.fillStyle = '#f4ecd2'; D.circ(ctx, 1470, 60, 62); ctx.fill();
    ctx.fillStyle = '#131f38'; D.circ(ctx, 1442, 42, 54); ctx.fill();
  } else {
    const g = ctx.createRadialGradient(1490, 90, 10, 1490, 90, 340);
    g.addColorStop(0, 'rgba(255,214,110,0.95)'); g.addColorStop(0.25, 'rgba(255,190,80,0.5)'); g.addColorStop(1, 'rgba(255,190,80,0)');
    ctx.fillStyle = g; D.circ(ctx, 1490, 90, 340); ctx.fill();
    ctx.fillStyle = '#ffd873'; D.circ(ctx, 1490, 90, 74); ctx.fill();
  }
}
function factoryFig(x, y, s, f, smokeOn = true) {
  D.softShadow(ctx, x, y + 10, 470 * s, 26 * s, 0.3);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#6b4a38';
  ctx.beginPath(); ctx.moveTo(340, -340); ctx.lineTo(448, -276); ctx.lineTo(448, 0); ctx.lineTo(340, 0); ctx.closePath();
  ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  const wg = ctx.createLinearGradient(0, -340, 0, 0);
  wg.addColorStop(0, '#9a7050'); wg.addColorStop(1, '#77543a');
  ctx.fillStyle = wg; ctx.fillRect(-340, -340, 680, 340);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.strokeRect(-340, -340, 680, 340);
  ctx.strokeStyle = 'rgba(38,30,22,0.35)'; ctx.lineWidth = 3;
  for (let ry = -310; ry < -12; ry += 43) {
    ctx.beginPath(); ctx.moveTo(-340, ry); ctx.lineTo(340, ry); ctx.stroke();
    for (let bx = -340 + ((ry / 43) % 2) * 42; bx < 340; bx += 86) { ctx.beginPath(); ctx.moveTo(bx, ry); ctx.lineTo(bx, ry + 43); ctx.stroke(); }
  }
  ctx.fillStyle = '#5d4020'; D.rr(ctx, 200, -486, 78, 152, 6); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#4a4238'; D.rr(ctx, -318, -96, 200, 96, 6); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  for (let i = 0; i < 4; i++) { ctx.fillStyle = '#ffd873'; D.rr(ctx, -292 + i * 122, -276, 64, 64, 5); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke(); }
  if (smokeOn) for (let i = 0; i < 5; i++) {
    const ph = (f * 0.012 + i * 0.23) % 1, sx = 239 + ph * 70, sy = -500 - ph * 200, sr = 22 + ph * 60;
    ctx.fillStyle = `rgba(216,208,196,${0.5 * (1 - ph)})`; D.circ(ctx, sx, sy, sr); ctx.fill();
  }
  ctx.restore();
}
function paperFig(x, y, w, h, head, stamp) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.015);
  ctx.fillStyle = '#f5ecd7'; D.rr(ctx, -w / 2, -h / 2, w, h, 10); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  text(head, 0, -h / 2 + 74, 62, '#c0272d');
  ctx.strokeStyle = 'rgba(38,34,31,0.4)'; ctx.lineWidth = 8;
  const rows = Math.floor((h - 220) / 62);
  for (let i = 0; i < rows; i++) {
    ctx.beginPath(); ctx.moveTo(-w / 2 + 50, -h / 2 + 168 + i * 62); ctx.lineTo(w / 2 - 50 - (i % 2) * 110, -h / 2 + 168 + i * 62); ctx.stroke();
  }
  if (stamp) {
    ctx.save(); ctx.translate(0, 40); ctx.rotate(-0.09);
    ctx.strokeStyle = '#c0272d'; ctx.lineWidth = 9; D.rr(ctx, -stamp.length * 24 - 26, -66, stamp.length * 48 + 52, 132, 14); ctx.stroke();
    text(stamp, 0, 2, 72, '#c0272d');
    ctx.restore();
  }
  ctx.restore();
}
function gavelFig(x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = '#8a6136'; D.rr(ctx, -14 * s, -112 * s, 28 * s, 132 * s, 10 * s); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4 * s; ctx.stroke();
  ctx.fillStyle = '#6e4c26'; D.rr(ctx, -54 * s, -152 * s, 108 * s, 44 * s, 10 * s); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function counterFig(y = 1305, x0 = 330, w = 1500) {
  ctx.fillStyle = '#5d3a20'; ctx.fillRect(x0, y, w, 52);
  ctx.fillStyle = '#6e4525'; ctx.fillRect(x0, y + 52, w, 26);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.strokeRect(x0, y, w, 78);
}

// ---------------- Ghadi props ----------------
function packetFig(x, y, s, label = 'GHADI', col = '#2e7cd6', colD = '#1f5fa8') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 6, 80, 11, 0.28);
  const g = ctx.createLinearGradient(0, -200, 0, 0);
  g.addColorStop(0, col); g.addColorStop(1, colD);
  ctx.fillStyle = g; D.rr(ctx, -72, -198, 144, 198, 10); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(-72, -198, 144, 20);
  ctx.strokeStyle = 'rgba(38,34,31,0.5)'; ctx.lineWidth = 3; ctx.strokeRect(-72, -198, 144, 20);
  ctx.fillStyle = '#f5ecd7'; D.ell(ctx, 0, -108, 56, 44); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  text(label, 0, -106, label.length >= 5 ? 30 : 36, '#26221f');
  ctx.fillStyle = 'rgba(255,255,255,0.30)';
  const shx = -60 + ((FRAME * 2.2) % 130);
  ctx.fillRect(shx, -190, 13, 182);
  ctx.restore();
}
function soapBarFig(x, y, s, col = '#e8b23a') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = col; D.rr(ctx, -52, -26, 104, 52, 16); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4.5; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; D.rr(ctx, -40, -20, 80, 12, 6); ctx.fill();
  text('SABUN', 0, 2, 22, 'rgba(38,34,31,0.65)');
  ctx.restore();
}
function wheelFig(x, y, r, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = '#2456a6'; D.circ(ctx, 0, 0, r); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = r * 0.07; ctx.stroke();
  ctx.fillStyle = '#dcebfb'; D.circ(ctx, 0, 0, r * 0.62); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#2456a6'; ctx.lineWidth = r * 0.10;
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6); ctx.stroke();
  }
  ctx.fillStyle = '#2456a6'; D.circ(ctx, 0, 0, r * 0.20); ctx.fill();
  ctx.restore();
  text('WHEEL', x, y + r + 38, Math.max(30, r * 0.30), '#9db9dd');
}
function bicycleFig(x, y, s, f) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const rot = f * 0.22;
  for (const wx of [-92, 92]) {
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 7; D.circ(ctx, wx, -56, 56); ctx.stroke();
    ctx.strokeStyle = '#8a8f96'; ctx.lineWidth = 3.5;
    for (let i = 0; i < 4; i++) {
      const a = rot + i * Math.PI / 4;
      ctx.beginPath(); ctx.moveTo(wx - Math.cos(a) * 50, -56 - Math.sin(a) * 50); ctx.lineTo(wx + Math.cos(a) * 50, -56 + Math.sin(a) * 50); ctx.stroke();
    }
    ctx.fillStyle = D.OUT; D.circ(ctx, wx, -56, 8); ctx.fill();
  }
  ctx.strokeStyle = '#3a6ea8'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-92, -56); ctx.lineTo(-26, -128); ctx.lineTo(66, -124); ctx.lineTo(92, -56); ctx.moveTo(-26, -128); ctx.lineTo(14, -56); ctx.lineTo(92, -56); ctx.moveTo(14, -56); ctx.lineTo(-92, -56); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(66, -124); ctx.lineTo(60, -146); ctx.stroke();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(44, -148); ctx.lineTo(78, -148); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-38, -132); ctx.lineTo(-12, -132); ctx.stroke();
  ctx.fillStyle = '#6e5136'; ctx.fillRect(52, -168, 92, 10);
  ctx.restore();
  packetFig(x + 98 * s, y - 168 * s, 0.52 * s, 'GHADI', '#e8b23a', '#c78f1d');
  packetFig(x + 98 * s, y - 236 * s, 0.52 * s, 'GHADI', '#e8b23a', '#c78f1d');
}
function godamFig(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 8, 300, 22, 0.3);
  ctx.fillStyle = '#8a7a5c'; ctx.fillRect(-300, -260, 600, 260);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.strokeRect(-300, -260, 600, 260);
  ctx.fillStyle = '#6e5136';
  ctx.beginPath(); ctx.moveTo(-330, -260); ctx.lineTo(0, -360); ctx.lineTo(330, -260); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#4a4238'; D.rr(ctx, -80, -190, 160, 190, 6); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(245,236,215,0.5)'; ctx.lineWidth = 4;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-80, -150 + i * 40); ctx.lineTo(80, -150 + i * 40); ctx.stroke(); }
  ctx.restore();
}
function trainFig(x, y, s, f) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let i = 0; i < 2; i++) {
    const wx = -560 + i * 300;
    ctx.fillStyle = '#7a4a2e'; D.rr(ctx, wx, -170, 280, 150, 10); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#f5ecd7'; D.rr(ctx, wx + 30, -148, 220, 74, 6); ctx.fill(); ctx.stroke();
    text('GHADI', wx + 140, -110, 44, '#c0272d');
  }
  ctx.fillStyle = '#2e5d8a'; D.rr(ctx, 40, -185, 300, 165, 12); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#2e5d8a'; ctx.fillRect(250, -265, 90, 84); ctx.strokeRect(250, -265, 90, 84);
  ctx.fillStyle = '#bfe6f5'; D.rr(ctx, 262, -252, 62, 52, 5); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffd23f'; D.circ(ctx, 70, -52, 15); ctx.fill(); ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const wx = -520 + i * 150;
    ctx.fillStyle = D.OUT; D.circ(ctx, wx, -8, 27); ctx.fill();
    ctx.fillStyle = '#9a8f7d'; D.circ(ctx, wx, -8, 12); ctx.fill();
  }
  for (let i = 0; i < 4; i++) {
    const ph = (f * 0.03 + i * 0.27) % 1, sx = 300 + ph * 90, sy = -285 - ph * 170, sr = 16 + ph * 46;
    ctx.fillStyle = `rgba(230,225,215,${0.55 * (1 - ph)})`; D.circ(ctx, sx, sy, sr); ctx.fill();
  }
  ctx.restore();
}
function towerFig(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 8, 260, 20, 0.35);
  const g = ctx.createLinearGradient(0, -900, 0, 0);
  g.addColorStop(0, '#232c3d'); g.addColorStop(1, '#39445c');
  ctx.fillStyle = g; ctx.fillRect(-190, -900, 380, 900);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.strokeRect(-190, -900, 380, 900);
  for (let r = 0; r < 11; r++) for (let c = 0; c < 4; c++) {
    ctx.fillStyle = hash(r * 7 + c * 13) > 0.45 ? '#ffd873' : '#151c29';
    ctx.fillRect(-158 + c * 84, -862 + r * 76, 52, 42);
  }
  ctx.restore();
}
function chairFig(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 10, 190, 18, 0.3);
  ctx.fillStyle = '#5d2430'; D.rr(ctx, -130, -430, 260, 300, 40); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#7a2f3e'; D.rr(ctx, -102, -402, 204, 244, 30); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#5d2430'; D.rr(ctx, -170, -190, 340, 90, 26); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#4a1c26'; D.rr(ctx, -185, -215, 52, 130, 20); ctx.fill(); ctx.stroke();
  D.rr(ctx, 133, -215, 52, 130, 20); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffd23f'; D.circ(ctx, 0, -330, 17); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function graphUp(x, y, w, h, u) {
  ctx.strokeStyle = '#e8e2d4'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
  const pts = [[0, 0.92], [0.25, 0.80], [0.45, 0.55], [0.65, 0.46], [0.85, 0.20], [1, 0.08]];
  ctx.strokeStyle = '#7dff8a'; ctx.lineWidth = 9; ctx.lineJoin = 'round'; ctx.beginPath();
  const n = Math.min(pts.length, Math.max(2, Math.ceil(u * (pts.length - 1)) + 1));
  for (let i = 0; i < n; i++) { const px = x + pts[i][0] * w, py = y - h + pts[i][1] * h; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
  ctx.stroke();
  if (u > 0.92) { const ex = x + w, ey = y - h + 0.08 * h; ctx.fillStyle = '#7dff8a'; ctx.beginPath(); ctx.moveTo(ex + 8, ey - 4); ctx.lineTo(ex - 26, ey + 18); ctx.lineTo(ex - 4, ey - 26); ctx.closePath(); ctx.fill(); }
}
// shelf unit packed with mini packets (set dressing workhorse)
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
function stackFig(x, y, cols, rows, s = 1, seed = 3) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let r = 0; r < rows; r++) for (let i = 0; i < cols; i++) {
    const c = PACK_COLS[Math.floor(hash(seed + r * 13 + i * 7) * 5) % 5];
    const px = (i - (cols - 1) / 2) * 128, py = -r * 104;
    ctx.fillStyle = c[0]; D.rr(ctx, px - 58, py - 96, 116, 96, 7); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#f5ecd7'; D.ell(ctx, px, py - 48, 34, 26); ctx.fill();
  }
  ctx.restore();
}
function crowdRow(x, y, n, spread, f, seed = 2, alpha = 0.5) {
  for (let i = 0; i < n; i++) {
    const px = x + (i - (n - 1) / 2) * spread, bob = Math.sin(f * 0.11 + i * 1.3 + seed) * 5;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#1c1410';
    D.circ(ctx, px, y - 118 + bob, 30); ctx.fill();
    D.rr(ctx, px - 38, y - 92 + bob, 76, 96, 30); ctx.fill();
    ctx.globalAlpha = 1;
  }
}
function cartFig(x, y, s, f) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#6e5136'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-120, -64); ctx.lineTo(120, -64); ctx.stroke();
  for (const wx of [-84, 84]) {
    ctx.fillStyle = D.OUT; D.circ(ctx, wx, -26, 27); ctx.fill();
    ctx.fillStyle = '#9a8f7d'; D.circ(ctx, wx, -26, 12); ctx.fill();
  }
  ctx.strokeStyle = '#6e5136'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(112, -64); ctx.lineTo(168, -96); ctx.stroke();
  ctx.restore();
  packetFig(x, y - 64 * s, 1.05 * s);
}

// ---------------- rich backgrounds (no bare gradients anywhere) ----------------
function stallFig(x, y, s, seed = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#5d3a20'; ctx.fillRect(-190, -150, 380, 150);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.strokeRect(-190, -150, 380, 150);
  for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) {
    const c = PACK_COLS[Math.floor(hash(seed + i * 7 + j * 13) * 5) % 5];
    ctx.fillStyle = c[0]; D.rr(ctx, -168 + i * 72, -138 + j * 62, 54, 48, 5); ctx.fill();
    ctx.strokeStyle = 'rgba(38,34,31,0.5)'; ctx.lineWidth = 2.5; ctx.stroke();
  }
  ctx.fillStyle = '#c9452e';
  ctx.beginPath(); ctx.moveTo(-215, -150); ctx.lineTo(0, -228); ctx.lineTo(215, -150); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#f5ecd7';
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-215 + i * 72, -150); ctx.lineTo(-179 + i * 72, -150); ctx.lineTo(-197 + i * 72, -112); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function scalesFig(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(0, 30); ctx.moveTo(-95, -128); ctx.lineTo(95, -128); ctx.stroke();
  for (const sd of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(sd * 95, -128); ctx.lineTo(sd * 65, -62); ctx.moveTo(sd * 95, -128); ctx.lineTo(sd * 125, -62); ctx.stroke();
    ctx.beginPath(); ctx.arc(sd * 95, -48, 34, Math.PI, 0); ctx.stroke();
  }
  ctx.fillStyle = '#c9a227'; D.circ(ctx, 0, -152, 11); ctx.fill();
  ctx.fillRect(-42, 30, 84, 12);
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
function mansionBG() {
  layer(0.3, () => {
    skyRect('#7a4a6e', '#e8a05c'); sunMoon(false);
    factoryFig(430, 1150, 0.95, FRAME, true);
  });
  layer(0.65, () => {
    groundBand(1260, '#8a6a44', '#5d4526');
    ctx.fillStyle = '#3d2c1c';
    D.rr(ctx, 1330, 700, 560, 560, 12); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = '#7a2f2e';
    ctx.beginPath(); ctx.moveTo(1290, 700); ctx.lineTo(1610, 560); ctx.lineTo(1930, 700); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      ctx.fillStyle = '#ffd873'; D.rr(ctx, 1390 + i * 160, 780 + j * 190, 88, 110, 6); ctx.fill();
      ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    }
    ctx.fillStyle = '#5d4020'; D.rr(ctx, 1520, 1010, 180, 250, 8); ctx.fill(); ctx.stroke();
  });
}
function bazaarBG(f) {
  layer(0.3, () => {
    skyRect('#8fc7e8', '#f2d492'); sunMoon(false);
    ctx.fillStyle = 'rgba(120,70,40,0.5)';
    for (let i = 0; i < 6; i++) { const hx = -350 + i * 580, hh = 240 + hash(i * 3) * 120; ctx.fillRect(hx, 1230 - hh, 340, hh); }
  });
  layer(0.65, () => {
    groundBand(1240, '#a8845c', '#7a5c38');
    stallFig(430, 1245, 0.95, 5); stallFig(1500, 1245, 0.95, 9);
    crowdRow(1080, 1245, 7, 300, f, 4, 0.35);
  });
}
function shopInBG() {
  layer(0.3, () => {
    skyRect('#6e4525', '#4a2c14');
    lampPool(620, 430, 380, 0.5); lampPool(1560, 430, 380, 0.5);
    for (const bx of [620, 1560]) {
      ctx.strokeStyle = '#2e2011'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(bx, 60); ctx.lineTo(bx, 330); ctx.stroke();
      ctx.fillStyle = '#ffd873'; D.circ(ctx, bx, 360, 30); ctx.fill();
      ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    }
  });
  layer(0.65, () => {
    groundBand(1270, '#8a6136', '#5d3d1e');
    shelfUnit(390, 1275, 470, 4, 7); shelfUnit(1770, 1275, 470, 4, 12);
  });
}
function godownBG() {
  layer(0.3, () => {
    skyRect('#3a2a16', '#1f150a');
    lampPool(1080, 460, 760, 0.42);
    ctx.globalAlpha = 0.5; shelfUnit(1080, 1300, 620, 5, 41); ctx.globalAlpha = 1;
  });
  layer(0.65, () => {
    groundBand(1280, '#4a3016', '#2a1a0a');
    shelfUnit(330, 1290, 400, 5, 3); shelfUnit(1830, 1290, 400, 5, 8);
  });
}
function stationBG() {
  layer(0.3, () => {
    skyRect('#5d4a7a', '#e88a5c'); sunMoon(false);
    ctx.fillStyle = 'rgba(40,26,44,0.6)';
    for (let i = 0; i < 5; i++) { const hx = -200 + i * 640; ctx.fillRect(hx, 1010, 380, 240); }
  });
  layer(0.65, () => {
    ctx.fillStyle = '#6e5a48'; ctx.fillRect(-800, 1250, 3760, 150);
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.strokeRect(-800, 1250, 3760, 150);
    groundBand(1400, '#54432e', '#332619');
    ctx.strokeStyle = '#9a8f7d'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(-800, 1470); ctx.lineTo(2960, 1470); ctx.moveTo(-800, 1560); ctx.lineTo(2960, 1560); ctx.stroke();
    ctx.strokeStyle = '#4a3826'; ctx.lineWidth = 10;
    for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.moveTo(-700 + i * 240, 1440); ctx.lineTo(-700 + i * 240, 1590); ctx.stroke(); }
  });
}
function raceBG(f) {
  layer(0.3, () => {
    skyRect('#8fc7e8', '#f2d492'); sunMoon(false);
    ctx.strokeStyle = 'rgba(38,34,31,0.6)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-600, 480); ctx.quadraticCurveTo(1080, 700, 2760, 480); ctx.stroke();
    for (let i = 0; i < 15; i++) {
      const t = i / 14, px = -600 + t * 3360, py = 480 + Math.sin(t * Math.PI) * 165;
      ctx.fillStyle = ['#c9452e', '#f2b705', '#3f9e4d', '#2e7cd6'][i % 4];
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 44, py + 8); ctx.lineTo(px + 8, py + 52); ctx.closePath(); ctx.fill();
    }
  });
  layer(0.65, () => {
    groundBand(1230, '#b08a5c', '#86643c');
    crowdRow(1080, 1235, 11, 235, f, 6, 0.42);
    ctx.strokeStyle = 'rgba(245,236,215,0.55)'; ctx.lineWidth = 6; ctx.setLineDash([46, 34]);
    ctx.beginPath(); ctx.moveTo(-800, 1560); ctx.lineTo(2960, 1560); ctx.stroke(); ctx.setLineDash([]);
  });
}
function courtBG() {
  layer(0.3, () => {
    skyRect('#4a3a28', '#2a1e10');
    ctx.fillStyle = 'rgba(230,210,170,0.16)';
    for (let i = 0; i < 5; i++) ctx.fillRect(150 + i * 430, 260, 96, 1010);
    ctx.strokeStyle = 'rgba(20,12,4,0.5)'; ctx.lineWidth = 4;
    for (let i = 0; i < 5; i++) ctx.strokeRect(150 + i * 430, 260, 96, 1010);
    scalesFig(1080, 560, 1.15);
  });
  layer(0.65, () => { groundBand(1260, '#5d4630', '#382818'); });
}
function homeBG() {
  layer(0.3, () => {
    skyRect('#8a5a34', '#5d3a20');
    lampPool(1080, 480, 720, 0.35);
    ctx.fillStyle = '#3a2817'; D.rr(ctx, 1420, 420, 420, 480, 10); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    const wg = ctx.createLinearGradient(0, 440, 0, 880);
    wg.addColorStop(0, '#ffd873'); wg.addColorStop(1, '#e88a4a');
    ctx.fillStyle = wg; D.rr(ctx, 1445, 445, 370, 430, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(38,34,31,0.6)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(1630, 445); ctx.lineTo(1630, 875); ctx.moveTo(1445, 660); ctx.lineTo(1815, 660); ctx.stroke();
  });
  layer(0.65, () => {
    groundBand(1250, '#7a5230', '#54381e');
    shelfUnit(420, 1255, 400, 3, 17);
    ctx.fillStyle = '#5d2430'; D.rr(ctx, 1330, 1090, 520, 170, 30); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#7a2f3e'; D.rr(ctx, 1330, 1030, 520, 80, 26); ctx.fill(); ctx.stroke();
  });
}
function officeBG() {
  layer(0.3, () => {
    skyRect('#8a6f4d', '#6b543a');
    lampPool(1080, 500, 700, 0.3);
    ctx.save(); ctx.globalAlpha = 0.85;
    paperFig(480, 700, 300, 380, 'AD', null);
    paperFig(1700, 680, 280, 350, 'SALE', null);
    ctx.restore();
  });
  layer(0.65, () => { groundBand(1250, '#77572f', '#59401f'); });
}
function towerBG() {
  layer(0.3, () => {
    skyRect('#2e3a55', '#584a6e');
    for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,246,220,${0.25 + hash(i * 3) * 0.5})`; D.circ(ctx, -600 + hash(i * 7) * 3300, 60 + hash(i * 11) * 700, 3.4); ctx.fill(); }
    towerFig(1500, 1260, 1.25);
  });
  layer(0.65, () => {
    groundBand(1250, '#4a3a30', '#2a2019');
    for (const lx of [420, 1080]) {
      ctx.fillStyle = '#241c14'; ctx.fillRect(lx - 8, 830, 16, 420);
      lampPool(lx, 810, 190, 0.55);
      ctx.fillStyle = '#ffd873'; D.circ(ctx, lx, 800, 17); ctx.fill();
    }
  });
}
function streetBG() {
  layer(0.3, () => {
    skyRect('#f2b25c', '#e88a4a'); sunMoon(false);
    ctx.fillStyle = 'rgba(90,50,30,0.55)';
    for (let i = 0; i < 6; i++) { const hx = -300 + i * 560, hh = 260 + hash(i * 3) * 130; ctx.fillRect(hx, 1240 - hh, 330, hh); }
    D.drawHouse(ctx, 1760, 1245, 1.5);
  });
  layer(0.65, () => { groundBand(1240, '#9a6b40', '#6e4a28'); });
}

// ---------------- shot system ----------------
const SHOTS = [];
function shot(a, b, vig, cam0, cam1, draw, hits = []) { SHOTS.push({ a, b, vig, cam0, cam1, draw, hits }); }
// camera presets (framing-audited: boards <=920 wide at s<=1.10, cy 1120-1135)
const C_BD = [{ cx: 1080, cy: 1135, s: 1.07 }, { cx: 1080, cy: 1120, s: 1.10 }];
const C_CU = [{ cx: 1080, cy: 1215, s: 1.07 }, { cx: 1072, cy: 1200, s: 1.11 }];
const C_MD = [{ cx: 1080, cy: 1175, s: 1.04 }, { cx: 1080, cy: 1160, s: 1.08 }];
const C_WD = [{ cx: 1080, cy: 1150, s: 1.00 }, { cx: 1080, cy: 1142, s: 1.05 }];
const C_LO = [{ cx: 1080, cy: 1255, s: 1.03 }, { cx: 1080, cy: 1240, s: 1.08 }];
const C_BDCU = [{ cx: 1080, cy: 1140, s: 1.07 }, { cx: 1080, cy: 1128, s: 1.10 }];
function redX(x, y, sc) {
  if (sc <= 0.02) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.strokeStyle = '#e33'; ctx.lineWidth = 17; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-62, -62); ctx.lineTo(62, 62); ctx.moveTo(62, -62); ctx.lineTo(-62, 62); ctx.stroke();
  ctx.restore();
}
function boardPop(f, at, x, y, w, h, lines, glowPulse = true) {
  const sc = spring((f - at) / 11);
  if (sc <= 0.01) return;
  const glow = glowPulse ? 0.35 + 0.25 * Math.sin(f * 0.22) : 0.3;
  boardText(x, y, w, h, sc, lines, glow);
  burst(x, y, at + 1, f, 10, '#ffd23f', 8);
}
function creamStrip(x, y, w, h, txt, px, sc) {
  if (sc <= 0.02) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.rotate(-0.012);
  ctx.fillStyle = '#f5ecd7'; D.rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  text(txt, 0, 3, px, '#26221f');
  ctx.restore();
}

// ===== L1 (0-210) hook: sabun bech ke 15,800 crore =====
shot(0, 58, 0.34, C_BD[0], C_BD[1], (f) => {
  darkPremiumBG();
  layer(1, () => {
    boardPop(f, 10, 1080, 470, 900, 205, [['₹15,800 CRORE', 92], ['UP KA SABSE AMEER AADMI', 42, '#f5ecd7']]);
    heroFig(1080, 1620, 2.5, { talk: true, expr: f < 26 ? 'puzzled' : 'calm', armR: 'catch', seed: 5 });
    twinkles(1080, 470, 420, 5, f);
  });
});
shot(58, 116, 0.26, C_MD[0], C_MD[1], (f) => {
  mansionBG();
  layer(1, () => {
    stackFig(1230, 1565, 2, 3, 0.95, 5);
    heroFig(830, 1540, 2.0, { talk: true, expr: 'calm', armR: 'up', seed: 5 });
    twinkles(1610, 850, 200, 4, f);
  });
});
shot(116, 168, 0.32, C_MD[0], C_MD[1], (f) => {
  darkPremiumBG();
  layer(1, () => {
    ctx.save(); ctx.globalAlpha = 0.5;
    heroFig(700, 1500, 1.8, { preset: RIVAL, expr: 'smug', seed: 21 });
    heroFig(1460, 1500, 1.8, { preset: SHOPK, expr: 'smug', seed: 23 });
    ctx.restore();
    redX(700, 990, spring((f - 126) / 9));
    redX(1460, 990, spring((f - 140) / 9));
    heroFig(1080, 1620, 2.4, { talk: true, expr: 'smug', armR: 'catch', seed: 5 });
  });
});
shot(168, 210, 0.24, C_MD[0], C_MD[1], (f) => {
  shopInBG();
  layer(1, () => {
    lampPool(1300, 1120, 300, 0.5);
    heroFig(880, 1540, 2.05, { talk: true, expr: 'happy', armR: 'hold', seed: 5 });
    const sc = spring((f - 174) / 10);
    ctx.save(); ctx.translate(1300, 1130); ctx.scale(sc, sc); ctx.translate(-1300, -1130);
    soapBarFig(1300, 1130, 2.1);
    ctx.restore();
    soapBarFig(1420, 1470, 1.1); soapBarFig(1420, 1405, 1.1); soapBarFig(1420, 1340, 1.1);
    twinkles(1300, 1080, 130, 4, f);
  });
});
// ===== L2 (210-314) cycle par sabun =====
shot(210, 262, 0.22, { cx: 1000, cy: 1150, s: 1.02 }, { cx: 1120, cy: 1145, s: 1.06 }, (f, u) => {
  bazaarBG(f);
  layer(1, () => {
    const hx = D.lerp(740, 880, sstep(u));
    bicycleFig(hx + 360, 1470, 1.5, f);
    heroFig(hx, 1470, 1.7, { talk: true, expr: 'calm', walk: (f * 0.05) % 1, seed: 5 });
  });
});
shot(262, 314, 0.24, { cx: 1080, cy: 1160, s: 1.02 }, { cx: 1080, cy: 1152, s: 1.05 }, (f) => {
  streetBG();
  layer(1, () => {
    ctx.fillStyle = '#7a5c38'; D.rr(ctx, 1180, 830, 460, 680, 10); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = '#4a3016'; D.rr(ctx, 1300, 950, 220, 560, 8); ctx.fill(); ctx.stroke();
    bicycleFig(745, 1505, 1.08, 0);
    maaFig(1410, 1505, 1.85, { expr: 'happy', armR: 'offer', seed: 9 });
    heroFig(900, 1500, 1.8, { talk: true, expr: 'happy', armR: 'hold', seed: 5 });
    soapBarFig(1085, 1175, 1.4); soapBarFig(1085, 1245, 1.4);
  });
});
// ===== L3 (314-525) Muralidhar vs duniya ki sabse badi company =====
shot(314, 372, 0.32, C_CU[0], C_CU[1], (f) => {
  darkPremiumBG();
  layer(1, () => { heroFig(1080, 1600, 2.55, { talk: true, expr: 'calm', armR: 'catch', seed: 5 }); });
});
shot(372, 428, 0.24, C_MD[0], C_MD[1], (f) => {
  streetBG();
  layer(1, () => {
    bicycleFig(1410, 1545, 1.02, 0);
    heroFig(860, 1540, 2.05, { talk: true, expr: 'calm', armR: 'catch', seed: 5 });
    D.drawLabel(ctx, 1330, 760, 'MURALIDHAR', spring((f - 380) / 10));
    D.drawLabel(ctx, 1330, 880, 'GYANCHANDANI', spring((f - 400) / 10), '#f5ecd7');
  });
});
shot(428, 478, 0.26, C_WD[0], C_WD[1], (f) => {
  towerBG();
  layer(1, () => {
    heroFig(740, 1480, 1.9, { talk: true, expr: f < 458 ? 'puzzled' : 'smug', armR: 'up', face: 1, seed: 5 });
    twinkles(1760, 500, 260, 5, f);
  });
});
shot(478, 525, 0.30, { cx: 1080, cy: 1195, s: 1.06 }, { cx: 1076, cy: 1185, s: 1.10 }, (f) => {
  towerBG();
  layer(1, () => {
    ctx.save(); ctx.globalAlpha = 0.75; towerFig(1450, 1560, 0.65); ctx.restore();
    heroFig(980, 1560, 2.2, { talk: true, expr: 'smug', armR: 'catch', armL: 'fold', seed: 5 });
  });
});
// ===== L4 (525-705) papa ki dukaan, 1987 launch =====
shot(525, 582, 0.24, C_MD[0], C_MD[1], (f) => {
  shopInBG();
  layer(1, () => {
    fatherFig(1260, 1560, 2.0, { expr: 'calm', armR: 'hold', seed: 11 });
    counterFig(1250, 330, 1500);
    heroFig(700, 1540, 1.95, { talk: true, expr: 'calm', armR: 'catch', seed: 5 });
    soapBarFig(1010, 1215, 1.0); soapBarFig(1130, 1215, 1.0); soapBarFig(1250, 1215, 1.0); soapBarFig(1370, 1215, 1.0);
  });
});
shot(582, 640, 0.26, { cx: 960, cy: 1140, s: 1.08 }, { cx: 980, cy: 1130, s: 1.12 }, (f) => {
  shopInBG();
  layer(1, () => {
    shelfUnit(1080, 1315, 660, 3, 23);
    lampPool(1080, 1120, 260, 0.5);
    heroFig(640, 1570, 2.25, { talk: true, expr: 'calm', armR: 'catch', seed: 5 });
    fatherFig(1340, 1570, 2.25, { expr: 'happy', armL: 'catch', seed: 11 });
    soapBarFig(1080, 1150, 1.5);
  });
});
shot(640, 705, 0.26, C_BD[0], C_BD[1], (f) => {
  shopInBG();
  layer(1, () => {
    boardPop(f, 656, 1080, 470, 700, 170, [['GHADI LAUNCH!', 70]]);
    fatherFig(720, 1540, 1.85, { expr: 'happy', armR: 'up', armL: 'up', seed: 11 });
    heroFig(950, 1540, 2.1, { talk: true, expr: 'happy', armR: 'up', seed: 5 });
    packetFig(1260, 1120, 1.05);
    D.drawSignBoard(ctx, 1390, 640, 330, 100, '1987', '#2e2a4a', '#ffd23f', 54);
    burst(1260, 1010, 650, f, 12, '#ffd23f', 8);
    twinkles(1260, 1030, 220, 5, f);
  });
});
// ===== L5 (705-933) Nirma se MEHENGA =====
shot(705, 762, 0.24, C_MD[0], C_MD[1], (f) => {
  shopInBG();
  layer(1, () => {
    ctx.fillStyle = '#6e4525'; ctx.fillRect(560, 1330, 1060, 26);
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.strokeRect(560, 1330, 1060, 26);
    heroFig(430, 1500, 1.7, { talk: true, expr: 'calm', seed: 5 });
    packetFig(830, 1330, 1.85, 'NIRMA', '#f2ead8', '#d9c9a8');
    packetFig(1360, 1330, 1.85, 'GHADI');
    D.drawLabel(ctx, 830, 1445, 'SASTA', spring((f - 712) / 9), '#7dff8a');
    D.drawLabel(ctx, 1360, 1445, 'MEHENGA', spring((f - 730) / 9), '#ff6b5e');
  });
});
shot(762, 820, 0.32, C_CU[0], C_CU[1], (f) => {
  darkPremiumBG();
  layer(1, () => {
    heroFig(1080, 1600, 2.55, { talk: true, expr: 'smug', armR: 'rub', seed: 5 });
    D.drawLabel(ctx, 1080, 545, 'ULTA FAISLA!', spring((f - 772) / 10), '#ffd23f');
  });
});
shot(820, 878, 0.24, C_MD[0], C_MD[1], (f) => {
  bazaarBG(f);
  layer(1, () => {
    heroFig(680, 1520, 1.85, { preset: RIVAL, expr: 'happy', armR: 'catch', seed: 21 });
    heroFig(1480, 1520, 1.85, { preset: SHOPK, expr: 'happy', armL: 'catch', seed: 23 });
    heroFig(1080, 1540, 2.0, { talk: true, expr: 'worried', sweat: true, headDip: 0.35, seed: 5 });
    if (f > 832) text('HA HA!', 680, 830, 46, '#f5ecd7');
    if (f > 848) text('HA HA!', 1480, 830, 46, '#f5ecd7');
  });
});
shot(878, 933, 0.30, C_CU[0], C_CU[1], (f) => {
  bazaarBG(f);
  layer(1, () => {
    heroFig(1080, 1600, 2.5, { talk: true, expr: f < 906 ? 'puzzled' : 'smug', armR: f < 906 ? 'scratch' : 'catch', seed: 5 });
    D.drawLabel(ctx, 1080, 540, '"PAGAL HO GAYA HAI!"', spring((f - 886) / 10), '#ff6b5e');
  });
});
// ===== L6 (933-1077) tagline =====
shot(933, 988, 0.24, C_MD[0], C_MD[1], (f) => {
  shopInBG();
  layer(1, () => {
    heroFig(860, 1540, 2.05, { talk: true, expr: 'calm', armR: 'hold', seed: 5 });
    packetFig(1160, 1170, 1.1);
    maaFig(1450, 1520, 1.95, { expr: 'calm', armR: 'offer', seed: 9 });
  });
});
shot(988, 1038, 0.30, { cx: 1080, cy: 1145, s: 1.02 }, { cx: 1080, cy: 1136, s: 1.06 }, (f) => {
  darkPremiumBG();
  layer(1, () => {
    lampPool(1080, 1180, 480, 0.5);
    heroFig(700, 1570, 1.65, { talk: true, expr: 'calm', seed: 5 });
    packetFig(1130, 1290, 2.5);
    creamStrip(1130, 1010, 780, 108, 'PEHLE ISTIMAAL KAREIN', 52, spring((f - 996) / 10));
    twinkles(1130, 1150, 320, 5, f);
  });
});
shot(1038, 1077, 0.24, C_MD[0], C_MD[1], (f) => {
  homeBG();
  layer(1, () => {
    creamStrip(1080, 555, 740, 105, 'PHIR VISHWAS KAREIN', 50, spring((f - 1046) / 10));
    maaFig(980, 1520, 2.15, { expr: 'happy', armR: 'offer', seed: 9 });
    packetFig(1250, 1200, 0.95);
    heroFig(1420, 1540, 1.75, { talk: true, expr: 'happy', seed: 5 });
  });
});
// ===== L7 (1077-1314) margin 6% -> 9% =====
shot(1077, 1136, 0.24, C_MD[0], C_MD[1], (f) => {
  shopInBG();
  layer(1, () => {
    heroFig(1080, 1570, 2.15, { preset: SHOPK, expr: 'worried', sweat: true, seed: 23 });
    counterFig(1255, 330, 1500);
    packetFig(880, 1255, 0.78, 'ANY', '#8a8f96', '#6e7278');
    packetFig(1300, 1255, 0.78, 'ANY', '#8a8f96', '#6e7278');
    D.drawPercent(ctx, 700, 800, 1.15, -0.08);
    text('6%', 700, 660, 92, '#ff6b5e');
  });
});
shot(1136, 1200, 0.26, C_MD[0], C_MD[1], (f) => {
  godownBG();
  layer(1, () => {
    stackFig(700, 1420, 2, 2, 1.0, 8);
    stackFig(1380, 1420, 3, 3, 1.0, 12);
    text('6%', 700, 830, 108, '#ff6b5e');
    if (f > 1168) { text('9%', 1380, 760, 118, '#7dff8a'); burst(1380, 800, 1170, f, 12, '#7dff8a', 8); }
    heroFig(1080, 1560, 2.0, { talk: true, expr: 'smug', armR: 'catch', seed: 5 });
  });
});
shot(1200, 1258, 0.26, C_BD[0], C_BD[1], (f) => {
  shopInBG();
  layer(1, () => {
    boardPop(f, 1210, 1080, 490, 900, 195, [['MARGIN 6% → 9%', 78]]);
    heroFig(725, 1540, 1.8, { talk: true, expr: 'smug', seed: 5 });
    heroFig(1180, 1570, 2.0, { preset: SHOPK, expr: 'happy', armR: 'rub', seed: 23 });
    counterFig(1255, 330, 1500);
  });
});
shot(1258, 1314, 0.22, C_MD[0], C_MD[1], (f) => {
  shopInBG();
  layer(1, () => {
    heroFig(880, 1570, 2.0, { preset: SHOPK, expr: 'happy', armR: 'hold', seed: 23 });
    counterFig(1255, 330, 1500);
    packetFig(1190, 1248, 0.72);
    maaFig(1460, 1520, 1.95, { expr: 'happy', armR: 'offer', seed: 9 });
    packetFig(770, 1255, 0.68, 'ANY', '#8a8f96', '#6e7278');
    heroFig(700, 1540, 1.65, { talk: true, expr: 'calm', seed: 5 });
  });
});
// ===== L8 (1314-1507) depots + train =====
shot(1314, 1372, 0.24, { cx: 1020, cy: 1150, s: 1.01 }, { cx: 1100, cy: 1145, s: 1.05 }, (f, u) => {
  godownBG();
  layer(1, () => {
    stackFig(420, 1570, 2, 4, 1.05, 15); stackFig(1780, 1570, 2, 4, 1.05, 19);
    const hx = D.lerp(880, 1130, sstep(u));
    ctx.fillStyle = '#8a6136'; D.rr(ctx, hx + 90, 1290, 190, 140, 8); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    packetFig(hx + 185, 1290, 0.62);
    heroFig(hx, 1480, 1.75, { talk: true, expr: 'calm', walk: (f * 0.055) % 1, seed: 5 });
  });
});
shot(1372, 1432, 0.22, { cx: 1080, cy: 1150, s: 1.03 }, { cx: 1080, cy: 1145, s: 1.06 }, (f, u) => {
  stationBG();
  layer(0.65, () => { trainFig(D.lerp(1560, 1120, sstep(u)), 1330, 1.15, f); });
  layer(1, () => {
    heroFig(675, 1560, 1.9, { talk: true, expr: 'happy', armR: 'up', seed: 5 });
  });
});
const INDIA_PTS = [[1240, 640], [1330, 660], [1420, 700], [1300, 740], [1200, 720], [1130, 780], [1210, 820], [1310, 830], [1400, 800], [1470, 860], [1380, 900], [1280, 900], [1180, 880], [1120, 940], [1200, 980], [1300, 990], [1390, 960], [1270, 1050], [1330, 1100], [1240, 1120], [1440, 1020], [1500, 950], [1080, 840], [1150, 660]];
shot(1432, 1472, 0.30, C_BD[0], C_BD[1], (f) => {
  darkPremiumBG();
  layer(1, () => {
    heroFig(720, 1580, 1.7, { talk: true, expr: 'calm', armR: 'catch', seed: 5 });
    INDIA_PTS.forEach((p, i) => {
      const on = f >= 1438 + i * 0.55;
      ctx.fillStyle = on ? '#ffd23f' : 'rgba(245,236,215,0.25)';
      D.circ(ctx, p[0], p[1], on ? 14 : 9); ctx.fill();
      if (on) { ctx.strokeStyle = 'rgba(255,210,63,0.4)'; ctx.lineWidth = 3; ctx.stroke(); }
    });
    boardPop(f, 1458, 1080, 460, 760, 180, [['19 RAJYA', 98]]);
  });
});
shot(1472, 1507, 0.22, C_WD[0], C_WD[1], (f) => {
  streetBG();
  layer(1, () => {
    godamFig(520, 1430, 0.8); godamFig(1080, 1450, 0.9); godamFig(1640, 1430, 0.8);
    D.drawLabel(ctx, 1080, 800, 'HAR 200–300 KM PAR DEPOT', spring((f - 1480) / 9), '#ffd23f');
    heroFig(1080, 1570, 1.75, { talk: true, expr: 'calm', seed: 5 });
  });
});
// ===== L9 (1507-1668) Wheel takkar =====
shot(1507, 1562, 0.32, C_BDCU[0], C_BDCU[1], (f) => {
  darkPremiumBG();
  layer(1, () => {
    boardPop(f, 1522, 1080, 480, 840, 190, [['KAHANI KHATM?', 78, '#f5ecd7']]);
    heroFig(1080, 1600, 2.4, { talk: true, expr: 'puzzled', armR: 'scratch', seed: 5 });
  });
});
shot(1562, 1616, 0.24, C_WD[0], C_WD[1], (f, u) => {
  raceBG(f);
  layer(1, () => {
    const wx = D.lerp(1780, 1290, sstep(u));
    D.softShadow(ctx, wx, 1470, 560, 30, 0.35);
    wheelFig(wx, 1170, 290, -f * 0.02);
    const bf = 1562 + Math.floor((f - 1562) / 16) * 16;
    burst(wx - 240, 1440, bf, f, 7, '#c9a86a', 7);
    heroFig(710, 1520, 1.85, { talk: true, expr: 'shocked', sweat: true, seed: 5 });
    D.drawLabel(ctx, 1020, 545, 'ASLI TAKKAR!', spring((f - 1574) / 9), '#ff6b5e');
  });
});
shot(1616, 1668, 0.28, { cx: 1080, cy: 1160, s: 1.05 }, { cx: 1080, cy: 1150, s: 1.09 }, (f) => {
  raceBG(f);
  layer(1, () => {
    wheelFig(1330, 1130, 235, f * 0.008);
    packetFig(1010, 1505, 1.0);
    heroFig(680, 1520, 1.95, { talk: true, expr: 'smug', armL: 'fold', armR: 'catch', seed: 5 });
    ctx.strokeStyle = `rgba(255,210,63,${0.4 + 0.3 * Math.sin(f * 0.4)})`; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(920, 1010); ctx.lineTo(990, 1070); ctx.lineTo(945, 1120); ctx.lineTo(1030, 1180); ctx.stroke();
  });
});
// ===== L10 (1668-1848) 2012 overtake =====
shot(1668, 1730, 0.28, C_BD[0], C_BD[1], (f) => {
  raceBG(f);
  layer(1, () => {
    boardPop(f, 1678, 1080, 490, 860, 195, [['2012 • No. 1', 88]]);
    const pass = f >= 1718;
    const cxp = !pass ? D.lerp(920, 1420, D.ease(D.clamp((f - 1668) / 50, 0, 1))) : 1420 + (f - 1718) * 1.4;
    const wxp = !pass ? D.lerp(1180, 1340, D.clamp((f - 1668) / 50, 0, 1)) : D.lerp(1340, 1240, D.clamp((f - 1718) / 12, 0, 1));
    wheelFig(wxp, 1300, 165, f * 0.05);
    cartFig(cxp, 1470, 1.15, f);
    heroFig(cxp - 330, 1490, 1.7, { talk: true, expr: 'smug', walk: (f * 0.09) % 1, armR: 'catch', seed: 5 });
    burst(1340, 1440, 1718, f, 16, '#c9a86a', 10);
  });
}, [1718]);
shot(1730, 1792, 0.22, C_MD[0], C_MD[1], (f) => {
  raceBG(f);
  layer(1, () => {
    wheelFig(1450, 1360, 130, 0.4);
    D.drawLabel(ctx, 1420, 1090, 'THAK GAYA!', spring((f - 1744) / 9), '#9db9dd');
    heroFig(980, 1520, 2.0, { talk: true, expr: 'happy', armR: 'up', armL: 'up', seed: 5 });
    packetFig(980, 690, 1.1);
    burst(980, 900, 1736, f, 12, '#ffd23f', 8);
    burst(700, 1000, 1762, f, 10, '#7dff8a', 8);
    twinkles(980, 620, 240, 5, f);
  });
});
shot(1792, 1848, 0.24, C_MD[0], C_MD[1], (f) => {
  streetBG();
  layer(1, () => {
    ctx.fillStyle = '#8a6136'; ctx.fillRect(830, 1330, 500, 50); ctx.fillRect(890, 1380, 380, 50); ctx.fillRect(950, 1430, 260, 50);
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.strokeRect(830, 1330, 500, 50);
    D.drawSignBoard(ctx, 1080, 545, 560, 128, 'KANPUR', '#2e2a4a', '#ffd23f', 68);
    fatherFig(700, 1560, 1.75, { expr: 'happy', armR: 'up', seed: 11 });
    maaFig(1460, 1550, 1.75, { expr: 'happy', armL: 'up', seed: 9 });
    heroFig(1080, 1330, 1.95, { talk: true, expr: 'happy', armR: 'hold', seed: 5 });
    packetFig(1260, 1120, 1.0);
    twinkles(1080, 880, 260, 5, f);
  });
});
// ===== L11 (1848-2123) 5,756 crore + sabse ameer =====
shot(1848, 1908, 0.26, C_MD[0], C_MD[1], (f) => {
  darkPremiumBG();
  layer(1, () => {
    graphUp(1020, 1420, 500, 560, D.clamp((f - 1858) / 40, 0, 1));
    const sc = spring((f - 1854) / 10);
    ctx.save(); ctx.translate(1250, 620); ctx.scale(sc, sc); ctx.translate(-1250, -620);
    D.drawSignBoard(ctx, 1250, 620, 430, 112, 'SAAL 2019', '#2e2a4a', '#ffd23f', 58);
    ctx.restore();
    heroFig(790, 1580, 1.95, { talk: true, expr: 'calm', armR: 'catch', seed: 5 });
    twinkles(1470, 900, 160, 4, f);
  });
});
shot(1908, 1966, 0.28, C_BD[0], C_BD[1], (f) => {
  darkPremiumBG();
  layer(1, () => {
    const bsc = spring((f - 1912) / 12);
    goldBoard(1080, 490, 940, 215, bsc, 0.4);
    if (bsc > 0.4) {
      const u2 = D.clamp((f - 1916) / 26, 0, 1), e2 = 1 - Math.pow(1 - u2, 3);
      text('₹' + fmtIN(5756 * e2) + ' CRORE', 1080, 466, 92, '#ffd23f');
      if (f >= 1946) text('SAAL 2019 • SIRF GHADI KI BIKRI', 1080, 552, 42, '#f5ecd7');
    }
    heroFig(800, 1620, 2.0, { talk: true, expr: 'happy', armR: 'catch', seed: 5 });
    lampPool(1420, 1180, 300, 0.45);
    packetFig(1420, 1310, 1.45);
    twinkles(1420, 1180, 260, 5, f);
  });
});
shot(1966, 2012, 0.22, C_MD[0], C_MD[1], (f, u) => {
  mansionBG();
  layer(1, () => {
    const dx = D.lerp(0, 46, sstep(u));
    fatherFig(740 + dx, 1540, 1.9, { expr: 'happy', walk: (f * 0.05) % 1, seed: 11 });
    heroFig(1080 + dx, 1560, 2.0, { talk: true, expr: 'happy', walk: (f * 0.05) % 1, seed: 5 });
    maaFig(1420 + dx, 1530, 1.85, { expr: 'happy', walk: (f * 0.05) % 1, seed: 9 });
  });
});
shot(2012, 2070, 0.26, C_BD[0], C_BD[1], (f) => {
  mansionBG();
  layer(1, () => {
    boardPop(f, 2018, 1080, 490, 900, 200, [['₹15,800 CRORE', 92]]);
    fatherFig(680, 1540, 1.95, { expr: 'happy', seed: 11 });
    heroFig(1080, 1560, 2.05, { talk: true, expr: 'happy', armR: 'up', seed: 5 });
    maaFig(1480, 1530, 1.9, { expr: 'happy', seed: 9 });
  });
});
shot(2070, 2123, 0.30, C_CU[0], C_CU[1], (f) => {
  mansionBG();
  layer(1, () => {
    heroFig(1080, 1600, 2.5, { talk: true, expr: 'happy', armR: 'catch', seed: 5 });
    D.drawLabel(ctx, 1080, 520, 'UP KA SABSE AMEER PARIVAAR', spring((f - 2078) / 10), '#ffd23f');
  });
});
// ===== L12 (2123-2328) 2025 court =====
shot(2123, 2180, 0.28, C_BD[0], C_BD[1], (f) => {
  courtBG();
  layer(1, () => {
    judgeFig(1080, 1440, 2.1, { expr: 'angry', seed: 13 });
    counterFig(1160, 260, 1640);
    gavelFig(1360, 1120, 1.05, -0.4 + Math.sin(f * 0.05) * 0.05);
    boardPop(f, 2132, 1080, 460, 700, 175, [['SAAL 2025', 86]]);
    heroFig(740, 1560, 1.85, { talk: true, expr: 'worried', seed: 5 });
  });
});
shot(2180, 2242, 0.26, C_MD[0], C_MD[1], (f) => {
  officeBG();
  layer(1, () => {
    paperFig(1050, 950, 780, 600, 'AD', null);
    packetFig(1050, 1010, 1.25, 'FOAM', '#57b7e8', '#2e6b8a');
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = 0; i < 7; i++) { D.circ(ctx, 900 + hash(i * 7) * 300, 830 + hash(i * 11) * 260, 13 + hash(i * 3) * 16); ctx.fill(); }
    const xs = spring((f - 2196) / 9);
    if (xs > 0.02) {
      ctx.save(); ctx.translate(1050, 950); ctx.scale(xs, xs);
      ctx.strokeStyle = '#e33'; ctx.lineWidth = 22; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-330, -250); ctx.lineTo(330, 250); ctx.moveTo(330, -250); ctx.lineTo(-330, 250); ctx.stroke();
      ctx.restore();
    }
    if (f >= 2224) paperFig(1050, 1500, 620, 290, 'COURT ORDER', 'BAND KARO');
    heroFig(1450, 1560, 1.8, { talk: true, expr: 'shocked', seed: 5 });
  });
});
shot(2242, 2292, 0.30, { cx: 1080, cy: 1180, s: 1.06 }, { cx: 1080, cy: 1170, s: 1.09 }, (f) => {
  courtBG();
  layer(1, () => {
    judgeFig(920, 1520, 2.3, { expr: 'angry', seed: 13 });
    counterFig(1340, 330, 1500);
    const rot = f < 2262 ? -0.55 + Math.sin(f * 0.06) * 0.04 : -0.55 + Math.min(1, (f - 2262) / 4) * 0.62;
    gavelFig(1250, 1150, 1.5, rot);
    burst(1250, 1310, 2263, f, 12, '#ffd23f', 8);
    heroFig(730, 1560, 1.8, { talk: true, expr: 'worried', sweat: true, seed: 5 });
  });
}, [2262]);
shot(2292, 2328, 0.26, C_MD[0], C_MD[1], (f) => {
  raceBG(f);
  layer(1, () => {
    wheelFig(740, 1290, 125, f * 0.01);
    packetFig(1360, 1330, 1.0);
    heroFig(1080, 1560, 1.9, { talk: true, expr: 'smug', armL: 'fold', armR: 'catch', seed: 5 });
    ctx.strokeStyle = `rgba(255,210,63,${0.4 + 0.3 * Math.sin(f * 0.4)})`; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(880, 1150); ctx.lineTo(950, 1210); ctx.lineTo(905, 1255); ctx.lineTo(990, 1310); ctx.stroke();
  });
});
// ===== L13 (2328-2511) seekh =====
shot(2328, 2386, 0.32, C_CU[0], C_CU[1], (f) => {
  darkPremiumBG();
  layer(1, () => { heroFig(1080, 1600, 2.55, { talk: true, expr: f < 2360 ? 'calm' : 'happy', armR: 'catch', seed: 5 }); });
});
shot(2386, 2446, 0.28, C_BD[0], C_BD[1], (f) => {
  darkPremiumBG();
  layer(1, () => {
    boardPop(f, 2402, 1080, 490, 880, 185, [['BHAROSA JEETTA HAI', 72]]);
    ctx.save(); ctx.globalAlpha = 0.75;
    packetFig(700, 1380, 1.05, 'SASTA', '#8a8f96', '#6e7278');
    ctx.restore();
    lampPool(1400, 1250, 320, 0.5);
    packetFig(1400, 1380, 1.35);
    twinkles(1400, 1240, 240, 5, f);
    heroFig(1080, 1620, 1.95, { talk: true, expr: 'happy', armR: 'catch', seed: 5 });
  });
});
shot(2446, 2511, 0.24, { cx: 1080, cy: 1170, s: 1.04 }, { cx: 1080, cy: 1158, s: 1.08 }, (f) => {
  homeBG();
  layer(1, () => {
    bicycleFig(740, 1585, 1.0, 0);
    stackFig(1460, 1585, 2, 3, 0.9, 33);
    chairFig(1080, 1585, 1.2);
    sittingFig(1080, 1565, 2.2, { expr: 'happy' });
    twinkles(1080, 900, 300, 4, f);
  });
});
// ===== L14 (2511-2660) closing question =====
shot(2511, 2568, 0.24, C_MD[0], C_MD[1], (f) => {
  homeBG();
  layer(1, () => {
    heroFig(900, 1540, 2.05, { talk: true, expr: 'happy', armR: 'hold', seed: 5 });
    packetFig(1180, 1180, 0.95);
    maaFig(1470, 1520, 1.95, { expr: 'calm', seed: 9 });
  });
});
shot(2568, 2618, 0.30, C_CU[0], C_CU[1], (f) => {
  darkPremiumBG();
  layer(1, () => {
    heroFig(1020, 1600, 2.55, { talk: true, expr: 'happy', armR: 'catch', seed: 5 });
    D.drawQuestion(ctx, 1470, 740, 1.25, f);
  });
});
shot(2618, 2660, 0.24, { cx: 1080, cy: 1160, s: 1.03 }, { cx: 1080, cy: 1152, s: 1.05 }, (f) => {
  homeBG();
  layer(1, () => {
    heroFig(1080, 1560, 2.0, { talk: true, expr: 'happy', armR: 'up', armL: 'up', seed: 5 });
    boardPop(f, 2624, 800, 1150, 400, 155, [['GHADI', 66, '#7dff8a']], false);
    boardPop(f, 2638, 1360, 1150, 400, 155, [['DUSHMAN?', 56, '#ff6b5e']], false);
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
