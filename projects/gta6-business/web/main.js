// GTA 6 Business — FULL FILM (frames 0-1784, 59.50s) — house engine (EMI/Ghadi base).
// ORIGINAL rig unchanged. Everything hand-coded: neon night-city, game shop,
// studio, office, vault, printing press. No external assets, no copied artwork.
// 1080x1920, 30 fps. Boards timed to the locked final voice (59.50 s).
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import * as D from './draw.js';
import { ENV } from './envelope.js';

const W = 1080, H = 1920, TOTAL = 1785, FPS = 30;
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const DEV_FONT = '"Noto Sans Devanagari"';
const fontReady = (async () => {
  try {
    const face = new FontFace('Noto Sans Devanagari', `url(data:font/ttf;base64,${DEVANAGARI_BOLD_B64})`, { weight: '700' });
    await face.load(); document.fonts.add(face);
    await document.fonts.load(`700 60px ${DEV_FONT}`, 'CRORE GAME DIN COPIES PEHLE ZONE GTA BOOKED LAGAT SAAL FOOTAGE LEAK CHHUTTI SAMAJHDARI LOOT MACHINE DEVELOPERS BENGALURU ISRO ₹=×+…?!');
  } catch (e) { window.fontErr = String(e); }
})();

let FRAME = 0;
const MOUTH_RAW = ENV.map((v) => D.clamp((v - 0.03) * 3.0, 0, 1));
function mouthAt(f) {
  const a = MOUTH_RAW[Math.max(0, f - 1)] || 0, b = MOUTH_RAW[f] || 0, c = MOUTH_RAW[Math.min(MOUTH_RAW.length - 1, f + 1)] || 0;
  return D.clamp(a * 0.25 + b * 0.5 + c * 0.25, 0, 1);
}
function text(str, x, y, px, color, align = 'center') {
  ctx.fillStyle = color; ctx.font = `700 ${px}px ${DEV_FONT}, sans-serif`;
  ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
}
function glowText(str, x, y, px, color, glow, blur = 26, align = 'center') {
  ctx.save();
  ctx.shadowColor = glow; ctx.shadowBlur = blur;
  text(str, x, y, px, color, align);
  ctx.shadowBlur = blur * 0.55; text(str, x, y, px, color, align);
  ctx.restore();
}
const spring = (t) => D.clamp(D.easeOutBack(D.clamp(t, 0, 1)), 0, 1);
const fmtIN = (n) => Math.round(n).toLocaleString('en-IN');
function hash(n) { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }
const sstep = (u) => { u = D.clamp(u, 0, 1); return u * u * u * (u * (u * 6 - 15) + 10); };
const easeOC = (t) => 1 - Math.pow(1 - D.clamp(t, 0, 1), 3);
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
  g.addColorStop(0, 'rgba(10,2,18,0)'); g.addColorStop(1, `rgba(10,2,18,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// ---------------- neon board (house grammar) ----------------
const PINK = '#FF2E88', CYAN = '#00E5FF', GOLD = '#ffd23f';
function neonBoard(x, y, w, h, sc, edge = PINK, pulse = 0) {
  if (sc <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.save();
  ctx.shadowColor = edge; ctx.shadowBlur = 34 + pulse * 16;
  D.rr(ctx, -w / 2, -h / 2, w, h, 20); ctx.fillStyle = '#150722'; ctx.fill();
  ctx.strokeStyle = edge; ctx.lineWidth = 6; ctx.stroke();
  ctx.restore();
  D.rr(ctx, -w / 2 + 13, -h / 2 + 13, w - 26, h - 26, 13);
  ctx.strokeStyle = 'rgba(0,229,255,0.55)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; D.rr(ctx, -w / 2 + 8, -h / 2 + 8, w - 16, h * 0.36, 14); ctx.fill();
  ctx.restore();
}
function neonBoardText(x, y, w, h, sc, lines, edge = PINK) {
  neonBoard(x, y, w, h, sc, edge, 0.5 + 0.5 * Math.sin(FRAME * 0.22));
  if (sc <= 0.35) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  const n = lines.length, lh = n > 1 ? (h - 44) / n : 0;
  lines.forEach((ln, i) => {
    const yy = n > 1 ? -h / 2 + 22 + lh * (i + 0.5) : 4;
    glowText(ln[0], 0, yy, ln[1], ln[2] || '#ffffff', ln[3] || edge, 24);
  });
  ctx.restore();
}
function boardPopNeon(f, at, x, y, w, h, lines, edge = PINK) {
  const sc = spring((f - at) / 10);
  if (sc <= 0.01) return;
  neonBoardText(x, y, w, h, sc, lines, edge);
  burst(x - w / 2, y - h / 2, at + 9, f, 8, edge, 8);
  burst(x + w / 2, y + h / 2, at + 9, f, 8, CYAN, 8);
}
// rotated rubber-stamp (dates, verdicts)
function stampFig(x, y, rot, lines, sc, color = '#e0393e') {
  if (sc <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.globalAlpha = 0.94;
  const w = 600, h = lines.length > 1 ? 190 : 120;
  ctx.strokeStyle = color; ctx.lineWidth = 7; D.rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.stroke();
  ctx.lineWidth = 2.5; D.rr(ctx, -w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 9); ctx.stroke();
  lines.forEach((ln, i) => {
    const yy = lines.length > 1 ? (i - (lines.length - 1) / 2) * 72 : 2;
    text(ln, 0, yy, 52, color);
  });
  ctx.restore();
}

// ---------------- characters (ORIGINAL rig only) ----------------
const HERO = { shirt: '#f2b705', shirtD: '#cf9604', pants: '#6e5136' };
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
const CROWD = [
  { shirt: '#2e7cd6', shirtD: '#1f5fa8', pants: '#33393f', skin: '#a06a38' },
  { shirt: '#3f9e4d', shirtD: '#2e7a38', pants: '#4a3a28', skin: '#8a5a30' },
  { shirt: '#c9452e', shirtD: '#a33325', pants: '#2e3a59', skin: '#d99e63' },
  { shirt: '#7a4a86', shirtD: '#5d3868', pants: '#3a3f45', skin: '#b57a44' },
  { shirt: '#e8b23a', shirtD: '#c78f1d', pants: '#54432c', skin: '#9c6a36' },
  { shirt: '#2ea8a0', shirtD: '#1f7a74', pants: '#3a3a3a', skin: '#b57a44' },
];

// ---------------- neon city set pieces ----------------
function skyGrad(top, mid, bot) {
  const g = ctx.createLinearGradient(0, -700, 0, 1560);
  g.addColorStop(0, top); g.addColorStop(0.55, mid); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(-900, -700, 3960, 2260);
}
function stars(n, yMax, seed) {
  for (let i = 0; i < n; i++) {
    const sx = -800 + hash(seed + i * 7.3) * 3760, sy = -560 + hash(seed + i * 3.9) * (yMax + 560);
    const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(FRAME * 0.09 + i * 1.93));
    ctx.fillStyle = `rgba(235,240,255,${0.55 * tw})`;
    D.circ(ctx, sx, sy, 2.2 + hash(seed + i) * 2.4); ctx.fill();
  }
}
function skyline(baseY, hMin, hMax, bw, colBody, winCol, drift, seed, signs) {
  const span = bw * 18;
  const off = ((drift % span) + span) % span;
  for (let i = -1; i < 18; i++) {
    const bx = -880 + i * bw - off + (hash(seed + i * 3.1) - 0.5) * 26;
    const bw2 = bw * (0.78 + hash(seed + i * 5.7) * 0.4);
    const bh = hMin + hash(seed + i * 9.3) * (hMax - hMin);
    ctx.fillStyle = colBody;
    ctx.fillRect(bx, baseY - bh, bw2, bh);
    const cols = Math.max(2, Math.floor(bw2 / 34)), rows = Math.max(3, Math.floor(bh / 52));
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const hsh = hash(seed + i * 131 + r * 17 + c * 7);
      if (hsh < 0.42) continue;
      ctx.fillStyle = hsh > 0.86 ? 'rgba(0,229,255,0.85)' : winCol;
      ctx.globalAlpha = 0.5 + hash(seed + i * 57 + r * 3 + c) * 0.5;
      ctx.fillRect(bx + 9 + c * 34, baseY - bh + 14 + r * 52, 17, 24);
    }
    ctx.globalAlpha = 1;
    if (hash(seed + i * 23) > 0.55) {
      const bl = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(FRAME * 0.16 + i * 2.2));
      ctx.fillStyle = `rgba(255,46,136,${bl})`;
      D.circ(ctx, bx + bw2 / 2, baseY - bh - 8, 5.5); ctx.fill();
    }
    if (signs && hash(seed + i * 41) > 0.62) {
      const sc2 = hash(seed + i * 43) > 0.5 ? PINK : CYAN;
      ctx.save(); ctx.shadowColor = sc2; ctx.shadowBlur = 18;
      ctx.fillStyle = sc2; ctx.globalAlpha = 0.85;
      ctx.fillRect(bx + bw2 - 20, baseY - bh + 30, 8, 120 + hash(seed + i * 47) * 130);
      ctx.restore(); ctx.globalAlpha = 1;
    }
  }
}
function palm(x, y, s, lean = 0.16, col = '#150826') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = col; ctx.lineCap = 'round';
  ctx.lineWidth = 17;
  ctx.beginPath(); ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(lean * 130, -190, lean * 300, -330); ctx.stroke();
  const tx = lean * 300, ty = -330;
  ctx.lineWidth = 11;
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.08 + i * 0.145);
    const ex = tx + Math.cos(a) * 128, ey = ty - Math.sin(a) * 62 + 66;
    ctx.beginPath(); ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx + Math.cos(a) * 74, ty - Math.sin(a) * 84 - 8, ex, ey); ctx.stroke();
  }
  ctx.fillStyle = col;
  D.circ(ctx, tx - 13, ty + 12, 13); ctx.fill();
  D.circ(ctx, tx + 14, ty + 15, 11); ctx.fill();
  ctx.restore();
}
function wetRoad(y0) {
  const g = ctx.createLinearGradient(0, y0, 0, 2350);
  g.addColorStop(0, '#2a1140'); g.addColorStop(0.25, '#1c0b30'); g.addColorStop(1, '#0d0518');
  ctx.fillStyle = g; ctx.fillRect(-900, y0, 3960, 2350 - y0);
  const streaks = [[420, PINK], [760, CYAN], [1090, PINK], [1420, '#ffd23f'], [1760, CYAN], [2050, PINK]];
  for (const [sx, col] of streaks) {
    const shimmer = 0.75 + 0.25 * Math.sin(FRAME * 0.21 + sx);
    ctx.save(); ctx.globalAlpha = 0.20 * shimmer;
    const rg = ctx.createRadialGradient(sx, y0 + 60, 8, sx, y0 + 60, 330);
    rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.save(); ctx.translate(sx, y0 + 60); ctx.scale(0.42, 1); ctx.translate(-sx, -(y0 + 60));
    D.circ(ctx, sx, y0 + 60, 330); ctx.fill();
    ctx.restore(); ctx.restore();
  }
  ctx.fillStyle = 'rgba(190,200,255,0.07)';
  for (let i = 0; i < 7; i++) ctx.fillRect(-900, y0 + 46 + i * 62, 3960, 3);
}
function moneyRain(n, yTop, yBot, seed) {
  for (let i = 0; i < n; i++) {
    const range = yBot - yTop;
    const yy = yBot - ((FRAME * (0.9 + hash(seed + i * 3) * 0.9) + hash(seed + i * 7.7) * range) % range);
    const xx = 240 + hash(seed + i * 11.3) * 1680 + Math.sin(FRAME * 0.05 + i * 2.1) * 26;
    const fade = D.clamp((yy - yTop) / 130, 0, 1) * D.clamp((yBot - yy) / 130, 0, 1);
    ctx.save(); ctx.globalAlpha = 0.5 * fade;
    D.drawNote(ctx, xx, yy, Math.sin(FRAME * 0.07 + i * 1.7) * 0.5, 0.95);
    ctx.restore();
  }
}
// notes falling in a localised column (pouring into a machine / slot)
function moneyPour(x, yTop, yBot, n, seed, spread = 80) {
  const range = yBot - yTop;
  for (let i = 0; i < n; i++) {
    const yy = yTop + ((FRAME * (2.2 + hash(seed + i * 3) * 1.4) + hash(seed + i * 7.7) * range) % range);
    const xx = x + (hash(seed + i * 11.3) - 0.5) * 2 * spread + Math.sin(FRAME * 0.09 + i * 2.1) * 14;
    const fade = D.clamp((yy - yTop) / 90, 0, 1) * D.clamp((yBot - yy) / 90, 0, 1);
    ctx.save(); ctx.globalAlpha = 0.85 * fade;
    D.drawNote(ctx, xx, yy, Math.sin(FRAME * 0.11 + i * 1.7) * 0.45, 1.0);
    ctx.restore();
  }
}
function noteStack(x, yBase, hgt, seed) {
  for (let i = 0; i < hgt; i++) {
    D.drawNote(ctx, x + (hash(seed + i * 3.3) - 0.5) * 16, yBase - i * 14, (hash(seed + i * 7.1) - 0.5) * 0.22, 1.15);
  }
}
// generic game box — own design: striped sunset + palm glyph + plain title text
function gameBoxFig(x, y, w, h, rot = 0, title = 'GTA 6') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  D.softShadow(ctx, 0, h / 2 + 14, w * 0.52, 13, 0.3);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, '#2b1052'); g.addColorStop(0.52, PINK); g.addColorStop(0.78, '#ff9a3d'); g.addColorStop(1, '#ffd23f');
  D.rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.save(); ctx.beginPath(); D.rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.clip();
  ctx.fillStyle = 'rgba(21,8,38,0.9)';
  D.circ(ctx, 0, h * 0.10, w * 0.20); ctx.fill();
  ctx.fillStyle = '#150826';
  ctx.fillRect(-w / 2, h * 0.30, w, h * 0.70);
  ctx.save(); ctx.translate(-w * 0.22, h * 0.31); ctx.scale(w / 300, w / 300); palm(0, 0, 0.62, 0.14, '#0d0518'); ctx.restore();
  ctx.save(); ctx.translate(w * 0.24, h * 0.31); ctx.scale(w / 340, w / 340); palm(0, 0, 0.5, -0.14, '#0d0518'); ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(-w / 2, -h / 2, w, h * 0.2);
  ctx.restore();
  ctx.fillStyle = 'rgba(13,5,24,0.88)'; D.rr(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, h * 0.24, 8); ctx.fill();
  text(title, 0, -h / 2 + 14 + h * 0.12 + 2, h * 0.155, '#ffffff');
  ctx.restore();
}

// ---------------- backgrounds ----------------
function neonCityBG(dim = false) {
  layer(0.3, () => {
    if (dim) skyGrad('#0e0324', '#2a0a44', '#4a1447'); else skyGrad('#1b0640', '#4b1160', '#8a2066');
    stars(dim ? 30 : 46, 620, 3);
    const sg = ctx.createRadialGradient(1080, 1470, 40, 1080, 1470, 780);
    sg.addColorStop(0, dim ? 'rgba(255,120,80,0.28)' : 'rgba(255,120,80,0.5)');
    sg.addColorStop(0.5, 'rgba(255,46,136,0.20)'); sg.addColorStop(1, 'rgba(255,46,136,0)');
    ctx.fillStyle = sg; D.circ(ctx, 1080, 1470, 780); ctx.fill();
    skyline(1490, 380, 760, 215, dim ? '#1c0a30' : '#2a0f45', 'rgba(255,190,120,0.9)', FRAME * 0.22, 11, false);
  });
  layer(0.6, () => {
    skyline(1505, 560, 1080, 235, dim ? '#140626' : '#1d0833', 'rgba(255,205,140,0.95)', FRAME * 0.5, 29, true);
    palm(150, 1560, 1.25, 0.13, dim ? '#140626' : '#1d0833'); palm(2060, 1575, 1.1, -0.15, dim ? '#140626' : '#1d0833');
  });
  layer(0.85, () => {
    wetRoad(1505);
    palm(268, 1905, 1.9, 0.15, '#12051f'); palm(1905, 1925, 1.7, -0.16, '#12051f');
  });
}
function shopBG() {
  layer(0.3, () => {
    const g = ctx.createLinearGradient(0, -700, 0, 1300);
    g.addColorStop(0, '#4a2c14'); g.addColorStop(1, '#33200f');
    ctx.fillStyle = g; ctx.fillRect(-900, -700, 3960, 2000);
    for (const bx of [560, 1080, 1600]) {
      const pool = ctx.createRadialGradient(bx, 470, 20, bx, 470, 430);
      pool.addColorStop(0, 'rgba(255,214,120,0.42)'); pool.addColorStop(1, 'rgba(255,214,120,0)');
      ctx.fillStyle = pool; D.circ(ctx, bx, 470, 430); ctx.fill();
      ctx.strokeStyle = '#241708'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(bx, -80); ctx.lineTo(bx, 330); ctx.stroke();
      ctx.fillStyle = '#ffd873'; D.circ(ctx, bx, 366, 32); ctx.fill();
      ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    }
    ctx.fillStyle = 'rgba(0,229,255,0.10)'; D.rr(ctx, 330, 620, 300, 400, 12); ctx.fill();
    ctx.fillStyle = 'rgba(255,46,136,0.10)'; D.rr(ctx, 1530, 620, 300, 400, 12); ctx.fill();
  });
  layer(0.65, () => {
    const g = ctx.createLinearGradient(0, 1290, 0, 2300);
    g.addColorStop(0, '#6e4525'); g.addColorStop(1, '#40260f');
    ctx.fillStyle = g; ctx.fillRect(-900, 1290, 3960, 1010);
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = '#2e1c0c'; ctx.globalAlpha = 0.05 + hash(i * 3) * 0.12;
      ctx.fillRect(-800 + hash(i) * 3760, 1310 + hash(i * 7) * 920, 5 + hash(i * 11) * 9, 3 + hash(i * 13) * 5);
    }
    ctx.globalAlpha = 1;
  });
}
function gameShelf(x, y, w, rows, seed) {
  const rh = 128;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#3a2410'; ctx.fillRect(-w / 2 - 16, -rows * rh - 24, w + 32, rows * rh + 24);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.strokeRect(-w / 2 - 16, -rows * rh - 24, w + 32, rows * rh + 24);
  const cols = [['#2e7cd6', '#1f5fa8'], ['#e8b23a', '#c78f1d'], ['#3f9e4d', '#2e7a38'], ['#c9452e', '#a33325'], ['#7a4a86', '#5d3868'], ['#FF2E88', '#c2185b']];
  for (let r = 0; r < rows; r++) {
    const yb = -r * rh;
    ctx.fillStyle = '#5d3a20'; ctx.fillRect(-w / 2 - 10, yb - 13, w + 20, 13);
    const n = Math.floor(w / 66);
    for (let i = 0; i < n; i++) {
      const c = cols[Math.floor(hash(seed + r * 31 + i * 7) * 6) % 6];
      const px = -w / 2 + 7 + i * 66, ph = 84 + hash(seed + r * 17 + i * 3) * 16;
      const grd = ctx.createLinearGradient(0, yb - 13 - ph, 0, yb - 13);
      grd.addColorStop(0, c[0]); grd.addColorStop(1, c[1]);
      ctx.fillStyle = grd; D.rr(ctx, px, yb - 13 - ph, 54, ph, 4); ctx.fill();
      ctx.strokeStyle = 'rgba(38,34,31,0.55)'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = 'rgba(245,236,215,0.92)'; D.ell(ctx, px + 27, yb - 13 - ph / 2, 14, 17); ctx.fill();
    }
  }
  ctx.restore();
}
function shopSign() {
  ctx.save(); ctx.translate(1080, 318);
  ctx.save(); ctx.shadowColor = CYAN; ctx.shadowBlur = 30;
  D.rr(ctx, -330, -78, 660, 156, 20); ctx.fillStyle = '#0d1b26'; ctx.fill();
  ctx.strokeStyle = CYAN; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
  glowText('GAME ZONE', 0, 4, 92, '#eaffff', CYAN, 26);
  ctx.restore();
}
function counterFig(y = 1335) {
  ctx.fillStyle = '#5d3a20'; ctx.fillRect(240, y, 1680, 52);
  ctx.fillStyle = '#6e4525'; ctx.fillRect(240, y + 52, 1680, 26);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.strokeRect(240, y, 1680, 78);
  ctx.fillStyle = 'rgba(190,230,245,0.13)'; ctx.fillRect(270, y + 6, 1620, 16);
}
// game-studio: dark slate room, giant screen with a wireframe world being built
function studioBG() {
  layer(0.3, () => {
    const g = ctx.createLinearGradient(0, -700, 0, 1400);
    g.addColorStop(0, '#0d1526'); g.addColorStop(1, '#131c30');
    ctx.fillStyle = g; ctx.fillRect(-900, -700, 3960, 2100);
    // the big dev screen
    ctx.save();
    ctx.shadowColor = CYAN; ctx.shadowBlur = 26;
    D.rr(ctx, 300, 240, 1560, 900, 18); ctx.fillStyle = '#081120'; ctx.fill();
    ctx.strokeStyle = 'rgba(0,229,255,0.75)'; ctx.lineWidth = 5; ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.beginPath(); D.rr(ctx, 300, 240, 1560, 900, 18); ctx.clip();
    // wireframe horizon grid
    ctx.strokeStyle = 'rgba(0,229,255,0.35)'; ctx.lineWidth = 2.5;
    for (let i = 0; i <= 10; i++) { ctx.beginPath(); ctx.moveTo(300 + i * 156, 800); ctx.lineTo(1080 + (i - 5) * 330, 1140); ctx.stroke(); }
    for (let i = 0; i < 6; i++) { const yy = 800 + i * i * 12 + i * 26; ctx.beginPath(); ctx.moveTo(300, yy); ctx.lineTo(1860, yy); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(300, 800); ctx.lineTo(1860, 800); ctx.stroke();
    // wireframe towers + palm being "built"
    ctx.strokeStyle = 'rgba(255,46,136,0.8)'; ctx.lineWidth = 3.5;
    for (const [bx, bw2, bh] of [[520, 150, 300], [760, 120, 210], [1330, 170, 340], [1560, 130, 240]]) {
      ctx.strokeRect(bx, 800 - bh, bw2, bh);
      ctx.beginPath(); ctx.moveTo(bx, 800 - bh); ctx.lineTo(bx + 26, 800 - bh - 26); ctx.lineTo(bx + bw2 + 26, 800 - bh - 26); ctx.lineTo(bx + bw2, 800 - bh); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + bw2, 800 - bh); ctx.lineTo(bx + bw2 + 26, 800 - bh - 26); ctx.lineTo(bx + bw2 + 26, 800 - 26); ctx.stroke();
    }
    ctx.save(); ctx.translate(1120, 800); ctx.scale(1.15, 1.15);
    ctx.strokeStyle = 'rgba(0,229,255,0.85)';
    palm(0, 0, 1, 0.16, 'rgba(0,229,255,0.0)'); // silhouette pass (fill) skipped visually by alpha col
    ctx.restore();
    // wireframe palm strokes
    ctx.strokeStyle = 'rgba(0,229,255,0.85)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(1120, 800); ctx.quadraticCurveTo(1148, 660, 1204, 560); ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI * (0.1 + i * 0.15);
      ctx.beginPath(); ctx.moveTo(1204, 560);
      ctx.quadraticCurveTo(1204 + Math.cos(a) * 70, 560 - Math.sin(a) * 80, 1204 + Math.cos(a) * 124, 560 - Math.sin(a) * 56 + 58); ctx.stroke();
    }
    // build-progress bar + percent
    D.rr(ctx, 380, 1020, 700, 34, 8); ctx.strokeStyle = 'rgba(0,229,255,0.7)'; ctx.lineWidth = 3; ctx.stroke();
    const pw = 700 * (0.55 + 0.4 * (0.5 + 0.5 * Math.sin(FRAME * 0.05)));
    ctx.fillStyle = 'rgba(255,46,136,0.85)'; D.rr(ctx, 386, 1026, Math.max(10, pw - 12), 22, 6); ctx.fill();
    ctx.fillStyle = 'rgba(174,247,255,0.9)'; ctx.font = '700 34px "Noto Sans Devanagari", sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('BUILDING WORLD… ' + Math.round(55 + 40 * (0.5 + 0.5 * Math.sin(FRAME * 0.05))) + '%', 1140, 1038);
    ctx.restore();
    // cool work lamps
    for (const bx of [600, 1080, 1560]) {
      const pool = ctx.createRadialGradient(bx, 210, 16, bx, 210, 300);
      pool.addColorStop(0, 'rgba(190,230,255,0.30)'); pool.addColorStop(1, 'rgba(190,230,255,0)');
      ctx.fillStyle = pool; D.circ(ctx, bx, 210, 300); ctx.fill();
      ctx.fillStyle = '#dfeeff'; D.circ(ctx, bx, 196, 20); ctx.fill();
      ctx.strokeStyle = D.OUT; ctx.lineWidth = 3.5; ctx.stroke();
    }
  });
  layer(0.65, () => {
    const g = ctx.createLinearGradient(0, 1330, 0, 2300);
    g.addColorStop(0, '#1b2740'); g.addColorStop(1, '#0a0f1c');
    ctx.fillStyle = g; ctx.fillRect(-900, 1330, 3960, 970);
    ctx.fillStyle = 'rgba(0,229,255,0.06)';
    for (let i = 0; i < 7; i++) ctx.fillRect(-900, 1400 + i * 74, 3960, 3);
  });
}
// office: desks, dark monitors, door with light spill
function deskUnit(x, y, s, on = false) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // chair (behind desk)
  ctx.fillStyle = '#23262e'; D.rr(ctx, -52, -118, 104, 118, 14); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#2e323c'; D.rr(ctx, -58, -16, 116, 26, 8); ctx.fill(); ctx.stroke();
  // desk
  ctx.fillStyle = '#4a4038'; ctx.fillRect(-150, 26, 300, 20);
  ctx.fillStyle = '#3a332c'; ctx.fillRect(-138, 46, 18, 74); ctx.fillRect(120, 46, 18, 74);
  // monitor
  D.rr(ctx, -72, -108, 144, 104, 8); ctx.fillStyle = '#101318'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4.5; ctx.stroke();
  if (on) {
    ctx.fillStyle = 'rgba(0,229,255,0.20)'; D.rr(ctx, -64, -100, 128, 88, 5); ctx.fill();
    ctx.fillStyle = 'rgba(174,247,255,0.5)';
    for (let i = 0; i < 3; i++) ctx.fillRect(-52, -84 + i * 24, 60 + hash(x + i) * 40, 8);
  }
  ctx.fillStyle = '#23262e'; ctx.fillRect(-8, -4, 16, 30);
  ctx.restore();
}
function officeBG(doorGlow = 0.5) {
  layer(0.3, () => {
    const g = ctx.createLinearGradient(0, -700, 0, 1400);
    g.addColorStop(0, '#252a38'); g.addColorStop(1, '#161a23');
    ctx.fillStyle = g; ctx.fillRect(-900, -700, 3960, 2100);
    // window blinds with night light strips (left)
    ctx.fillStyle = '#0d1420'; ctx.fillRect(600, 260, 400, 640);
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.strokeRect(600, 260, 400, 640);
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = `rgba(0,229,255,${0.10 + 0.05 * Math.sin(FRAME * 0.1 + i)})`;
      ctx.fillRect(616, 292 + i * 66, 368, 26);
    }
    // wall clock
    D.circ(ctx, 1080, 430, 74); ctx.fillStyle = '#e8e4da'; ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
    ctx.strokeStyle = '#26221f'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(1080, 430); ctx.lineTo(1080, 382); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1080, 430); ctx.lineTo(1122, 448); ctx.stroke();
    // door (right) with warm light spill
    const dg = ctx.createLinearGradient(1150, 0, 1620, 0);
    dg.addColorStop(0, 'rgba(255,190,90,0)'); dg.addColorStop(1, `rgba(255,190,90,${0.35 * doorGlow})`);
    ctx.fillStyle = dg; ctx.fillRect(1150, 300, 470, 1050);
    ctx.fillStyle = '#120d08'; ctx.fillRect(1340, 300, 230, 1050);
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.strokeRect(1340, 300, 230, 1050);
    ctx.fillStyle = `rgba(255,214,120,${0.25 + 0.55 * doorGlow})`; ctx.fillRect(1354, 316, 202, 1018);
    D.circ(ctx, 1400, 830, 11); ctx.fillStyle = '#ffd873'; ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 3.5; ctx.stroke();
  });
  layer(0.65, () => {
    const g = ctx.createLinearGradient(0, 1330, 0, 2300);
    g.addColorStop(0, '#1d212b'); g.addColorStop(1, '#0c0e13');
    ctx.fillStyle = g; ctx.fillRect(-900, 1330, 3960, 970);
    ctx.fillStyle = 'rgba(190,200,255,0.05)';
    for (let i = 0; i < 6; i++) ctx.fillRect(-900, 1420 + i * 88, 3960, 3);
  });
}
// vault: dark chamber, gold glow, coin + note piles
function vaultBG() {
  layer(0.3, () => {
    const g = ctx.createLinearGradient(0, -700, 0, 1500);
    g.addColorStop(0, '#171006'); g.addColorStop(1, '#241806');
    ctx.fillStyle = g; ctx.fillRect(-900, -700, 3960, 2200);
    const rg = ctx.createRadialGradient(1080, 980, 60, 1080, 980, 900);
    rg.addColorStop(0, 'rgba(255,190,60,0.40)'); rg.addColorStop(0.6, 'rgba(255,150,40,0.13)'); rg.addColorStop(1, 'rgba(255,150,40,0)');
    ctx.fillStyle = rg; D.circ(ctx, 1080, 980, 900); ctx.fill();
    // arch
    ctx.strokeStyle = 'rgba(255,200,90,0.20)'; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(1080, 1080, 700, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(380, 1080); ctx.lineTo(380, 1500); ctx.moveTo(1780, 1080); ctx.lineTo(1780, 1500); ctx.stroke();
  });
  layer(0.65, () => {
    const g = ctx.createLinearGradient(0, 1400, 0, 2300);
    g.addColorStop(0, '#2e1e08'); g.addColorStop(1, '#120b02');
    ctx.fillStyle = g; ctx.fillRect(-900, 1400, 3960, 900);
    // coin piles (stacked gold discs)
    for (const [px, base, n] of [[650, 1560, 9], [770, 1560, 6], [1390, 1560, 8], [1500, 1560, 5]]) {
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = i % 2 ? '#e8b23a' : '#d99e1f';
        D.ell(ctx, px + (hash(px + i) - 0.5) * 14, base - i * 17, 62, 15); ctx.fill();
        ctx.strokeStyle = 'rgba(90,60,0,0.5)'; ctx.lineWidth = 2.5; ctx.stroke();
      }
    }
    // note bundles
    for (const [px, py] of [[620, 1500], [1560, 1480], [1080, 1568]]) noteStack(px, py + 60, 5, px);
  });
}
// printing-press room: industrial wall, pipes, hanging bulb
function pressRoomBG() {
  layer(0.3, () => {
    const g = ctx.createLinearGradient(0, -700, 0, 1400);
    g.addColorStop(0, '#12242e'); g.addColorStop(1, '#0a161c');
    ctx.fillStyle = g; ctx.fillRect(-900, -700, 3960, 2100);
    ctx.strokeStyle = 'rgba(140,180,200,0.28)'; ctx.lineWidth = 16; ctx.lineCap = 'round';
    for (const py of [240, 330]) {
      ctx.beginPath(); ctx.moveTo(-700, py); ctx.lineTo(2860, py); ctx.stroke();
      for (const jx of [300, 1080, 1860]) { ctx.strokeStyle = 'rgba(140,180,200,0.4)'; ctx.beginPath(); ctx.moveTo(jx, py - 16); ctx.lineTo(jx, py + 16); ctx.stroke(); ctx.strokeStyle = 'rgba(140,180,200,0.28)'; }
    }
    const pool = ctx.createRadialGradient(1080, 560, 20, 1080, 560, 520);
    pool.addColorStop(0, 'rgba(255,214,120,0.35)'); pool.addColorStop(1, 'rgba(255,214,120,0)');
    ctx.fillStyle = pool; D.circ(ctx, 1080, 560, 520); ctx.fill();
    ctx.strokeStyle = '#0a0f12'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(1080, -80); ctx.lineTo(1080, 470); ctx.stroke();
    ctx.fillStyle = '#ffd873'; D.circ(ctx, 1080, 506, 36); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  });
  layer(0.65, () => {
    const g = ctx.createLinearGradient(0, 1360, 0, 2300);
    g.addColorStop(0, '#16242c'); g.addColorStop(1, '#060d11');
    ctx.fillStyle = g; ctx.fillRect(-900, 1360, 3960, 940);
    ctx.fillStyle = 'rgba(160,220,255,0.05)';
    for (let i = 0; i < 6; i++) ctx.fillRect(-900, 1440 + i * 80, 3960, 3);
  });
}

// ---------------- foreground set pieces ----------------
// big phone with live pre-booking counter
function bookingPhone(x, y, s, count01) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 356, 190, 20, 0.3);
  D.rr(ctx, -195, -345, 390, 690, 38); ctx.fillStyle = '#14161c'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 7; ctx.stroke();
  const g = ctx.createLinearGradient(0, -320, 0, 320);
  g.addColorStop(0, '#0d2136'); g.addColorStop(1, '#081426');
  D.rr(ctx, -172, -322, 344, 644, 26); ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.beginPath(); D.rr(ctx, -172, -322, 344, 644, 26); ctx.clip();
  text('PRE-BOOKING', 0, -272, 36, '#aef7ff');
  ctx.fillStyle = 'rgba(0,229,255,0.5)'; ctx.fillRect(-172, -238, 344, 3);
  const val = (1.5 * easeOC(count01)).toFixed(1);
  glowText(val, 0, -148, 96, '#ffffff', CYAN, 22);
  text('CRORE COPIES', 0, -84, 34, '#ffe9a8');
  text('BOOKED', 0, -44, 30, '#aef7ff');
  // booking rows filling up
  for (let i = 0; i < 4; i++) {
    const ry = 26 + i * 62, done = count01 > (i + 0.6) / 4;
    D.rr(ctx, -140, ry - 22, 280, 44, 10);
    ctx.fillStyle = done ? 'rgba(63,158,77,0.35)' : 'rgba(255,255,255,0.07)'; ctx.fill();
    ctx.strokeStyle = 'rgba(174,247,255,0.35)'; ctx.lineWidth = 2.5; ctx.stroke();
    if (done) {
      D.circ(ctx, -112, ry, 13); ctx.fillStyle = '#3f9e4d'; ctx.fill();
      ctx.strokeStyle = '#eaffea'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-119, ry); ctx.lineTo(-114, ry + 6); ctx.lineTo(-104, ry - 7); ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; D.rr(ctx, -122, ry - 5, 20, 10, 4); ctx.fill();
    }
    ctx.fillStyle = done ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.30)';
    D.rr(ctx, -84, ry - 6, 120 + hash(i * 7) * 60, 12, 5); ctx.fill();
  }
  const pulse = count01 >= 1 ? 1 + 0.04 * Math.sin(FRAME * 0.3) : 1;
  ctx.save(); ctx.scale(pulse, pulse);
  D.rr(ctx, -110, 268, 220, 44, 12); ctx.fillStyle = count01 >= 1 ? '#3f9e4d' : '#2a4a5e'; ctx.fill();
  text('BOOK NOW', 0, 291, 27, '#ffffff');
  ctx.restore();
  ctx.restore();
  ctx.restore();
}
// dev machine the money pours into (studio)
function devMachine(x, yBase, f) {
  ctx.save(); ctx.translate(x, yBase);
  D.softShadow(ctx, 0, 12, 300, 22, 0.3);
  const g = ctx.createLinearGradient(0, -430, 0, 0);
  g.addColorStop(0, '#46586e'); g.addColorStop(1, '#232f42');
  D.rr(ctx, -290, -430, 580, 430, 22); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 7; ctx.stroke();
  // intake slot on top
  ctx.fillStyle = '#0a0f18'; D.rr(ctx, -170, -452, 340, 34, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(0,229,255,0.6)'; ctx.lineWidth = 3; ctx.stroke();
  // glowing core window
  const flick = 0.75 + 0.25 * Math.sin(f * 0.4);
  ctx.save(); ctx.shadowColor = PINK; ctx.shadowBlur = 30 * flick;
  D.rr(ctx, -190, -360, 380, 210, 14); ctx.fillStyle = `rgba(255,46,136,${0.30 + 0.2 * flick})`; ctx.fill();
  ctx.restore();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; D.rr(ctx, -190, -360, 380, 210, 14); ctx.stroke();
  // little world being built inside the core
  ctx.strokeStyle = 'rgba(174,247,255,0.9)'; ctx.lineWidth = 4;
  ctx.strokeRect(-120, -300, 90, 110); ctx.strokeRect(30, -330, 110, 140);
  ctx.beginPath(); ctx.moveTo(-60, -190); ctx.lineTo(-60, -120); ctx.stroke();
  // dials + lights row
  for (let i = 0; i < 4; i++) {
    const on = Math.sin(f * 0.2 + i * 1.6) > -0.2;
    D.circ(ctx, -180 + i * 118, -88, 17); ctx.fillStyle = on ? (i % 2 ? '#3f9e4d' : '#ffd23f') : '#39424f'; ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 3.5; ctx.stroke();
  }
  text('GAME MACHINE', 0, -30, 34, '#aef7ff');
  ctx.restore();
}
// money printing press: notes stream out in a line
function pressMachine(x, yBase, f, speed = 1, sc = 1) {
  ctx.save(); ctx.translate(x, yBase); ctx.scale(sc, sc);
  D.softShadow(ctx, 0, 14, 330, 24, 0.32);
  const g = ctx.createLinearGradient(0, -470, 0, 0);
  g.addColorStop(0, '#54626e'); g.addColorStop(1, '#2c3842');
  D.rr(ctx, -320, -470, 640, 470, 24); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 7; ctx.stroke();
  // paper roll on top
  ctx.fillStyle = '#e8e4da'; D.ell(ctx, -120, -492, 130, 42); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#c9c2b2'; D.ell(ctx, -120, -492, 52, 17); ctx.fill(); ctx.stroke();
  // spinning gears
  for (const [gx, gr] of [[-190, 62], [150, 78]]) {
    ctx.save(); ctx.translate(gx, -330); ctx.rotate(f * 0.06 * speed * (gr > 70 ? -1 : 1));
    ctx.fillStyle = '#78858f';
    for (let i = 0; i < 6; i++) { ctx.save(); ctx.rotate(i * Math.PI / 3); ctx.fillRect(-13, -gr - 12, 26, 26); ctx.restore(); }
    D.circ(ctx, 0, 0, gr); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 4.5; ctx.stroke();
    D.circ(ctx, 0, 0, 20); ctx.fillStyle = '#2c3842'; ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  // output slot + belt
  ctx.fillStyle = '#0d1418'; D.rr(ctx, 210, -240, 130, 40, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(255,210,63,0.7)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#1c262e'; ctx.fillRect(300, -168, 330, 22);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.strokeRect(300, -168, 330, 22);
  // the line of fresh notes
  const n = 5, span = 330;
  for (let i = 0; i < n; i++) {
    const u = ((f * 2.6 * speed + i * (span / n)) % span) / span;
    const nx = 300 + u * span, ny = -196 - Math.sin(u * Math.PI) * 16;
    ctx.save(); ctx.globalAlpha = D.clamp(u * 6, 0, 1) * D.clamp((1 - u) * 5 + 0.25, 0, 1);
    D.drawNote(ctx, nx, ny, Math.sin(f * 0.1 + i) * 0.14, 1.25);
    ctx.restore();
  }
  text('NOTE PRESS', 0, -52, 36, '#ffe9a8');
  ctx.restore();
}
// coded rocket (silhouette-ish, own design)
function rocketFig(x, yBase, f, launch01) {
  const rise = 640 * easeOC(launch01);
  const y = yBase - rise;
  ctx.save(); ctx.translate(x, y);
  // smoke puffs at the pad
  if (launch01 > 0.02) {
    for (let i = 0; i < 7; i++) {
      const age = ((f * 1.4 + i * 26) % 90) / 90;
      ctx.fillStyle = `rgba(200,200,215,${0.35 * (1 - age)})`;
      D.circ(ctx, (hash(i * 7) - 0.5) * 190 * (0.4 + age), 26 + age * 60, 20 + age * 46); ctx.fill();
    }
  }
  // flame
  if (launch01 > 0.02) {
    const fl = 90 + Math.sin(f * 1.7) * 26 + launch01 * 90;
    const fg = ctx.createLinearGradient(0, 150, 0, 150 + fl + 90);
    fg.addColorStop(0, '#fff3b0'); fg.addColorStop(0.4, '#ff9a3d'); fg.addColorStop(1, 'rgba(255,46,60,0)');
    ctx.fillStyle = fg;
    ctx.beginPath(); ctx.moveTo(-30, 148); ctx.lineTo(0, 150 + fl + 90); ctx.lineTo(30, 148); ctx.closePath(); ctx.fill();
  }
  // fins
  ctx.fillStyle = PINK;
  ctx.beginPath(); ctx.moveTo(-44, 60); ctx.lineTo(-96, 152); ctx.lineTo(-44, 152); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(44, 60); ctx.lineTo(96, 152); ctx.lineTo(44, 152); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4.5;
  ctx.beginPath(); ctx.moveTo(-44, 60); ctx.lineTo(-96, 152); ctx.lineTo(-44, 152); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(44, 60); ctx.lineTo(96, 152); ctx.lineTo(44, 152); ctx.stroke();
  // body
  const bg2 = ctx.createLinearGradient(-46, 0, 46, 0);
  bg2.addColorStop(0, '#cfd6de'); bg2.addColorStop(0.5, '#f4f6f8'); bg2.addColorStop(1, '#aeb8c2');
  ctx.beginPath();
  ctx.moveTo(-46, 152); ctx.lineTo(-46, -60);
  ctx.quadraticCurveTo(-46, -168, 0, -216);
  ctx.quadraticCurveTo(46, -168, 46, -60); ctx.lineTo(46, 152); ctx.closePath();
  ctx.fillStyle = bg2; ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = PINK; ctx.fillRect(-46, 96, 92, 22);
  D.circ(ctx, 0, -52, 27); ctx.fillStyle = '#7fd4f2'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4.5; ctx.stroke();
  D.circ(ctx, -8, -60, 8); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill();
  ctx.restore();
  // launch pad
  ctx.save(); ctx.translate(x, yBase);
  ctx.fillStyle = '#1a1426'; ctx.fillRect(-170, 20, 340, 26);
  ctx.fillRect(-150, 46, 26, 90); ctx.fillRect(124, 46, 26, 90);
  ctx.restore();
}
// old film camera + big cross (for the "no film earned this" beat)
function filmCameraFig(x, y, s, f) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 190, 190, 18, 0.3);
  // tripod
  ctx.strokeStyle = '#20242c'; ctx.lineWidth = 15; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-14, 60); ctx.lineTo(-110, 196); ctx.moveTo(14, 60); ctx.lineTo(110, 196); ctx.moveTo(0, 60); ctx.lineTo(0, 200); ctx.stroke();
  // reels
  for (const rx of [-58, 62]) {
    ctx.save(); ctx.translate(rx, -128); ctx.rotate(f * 0.03 * (rx < 0 ? 1 : -1));
    D.circ(ctx, 0, 0, 56); ctx.fillStyle = '#39424f'; ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#14161c';
    for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; D.circ(ctx, Math.cos(a) * 28, Math.sin(a) * 28, 13); ctx.fill(); }
    ctx.restore();
  }
  // body + lens
  const g = ctx.createLinearGradient(0, -90, 0, 70);
  g.addColorStop(0, '#4a5563'); g.addColorStop(1, '#262e38');
  D.rr(ctx, -120, -88, 240, 158, 16); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#14161c';
  ctx.beginPath(); ctx.moveTo(120, -52); ctx.lineTo(196, -26); ctx.lineTo(196, 30); ctx.lineTo(120, 52); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = 'rgba(0,229,255,0.35)'; D.rr(ctx, -96, -64, 84, 54, 8); ctx.fill();
  text('CINEMA', 0, 34, 34, '#ffe9a8');
  ctx.restore();
}
function redCross(x, y, r, sc) {
  if (sc <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.strokeStyle = '#e0393e'; ctx.lineCap = 'round';
  ctx.lineWidth = 17;
  D.circ(ctx, 0, 0, r); ctx.stroke();
  ctx.lineWidth = 21;
  ctx.beginPath(); ctx.moveTo(-r * 0.62, -r * 0.62); ctx.lineTo(r * 0.62, r * 0.62); ctx.stroke();
  ctx.restore();
}
// 7-day week calendar filling with notes
function weekCal(x, y, fill01, f) {
  const cw = 120, chh = 168, gap = 11, totalW = 7 * cw + 6 * gap;
  ctx.save(); ctx.translate(x - totalW / 2, y);
  D.softShadow(ctx, totalW / 2, chh + 26, totalW * 0.52, 16, 0.28);
  for (let i = 0; i < 7; i++) {
    const cx0 = i * (cw + gap);
    const filled = fill01 >= (i + 0.55) / 7;
    const pop = filled ? spring((fill01 * 7 - i - 0.55) * 2.2) : 0;
    ctx.save(); ctx.translate(cx0 + cw / 2, chh / 2); ctx.scale(0.7 + 0.3 * Math.max(pop, 0.7), 0.7 + 0.3 * Math.max(pop, 0.7));
    D.rr(ctx, -cw / 2, -chh / 2, cw, chh, 12);
    ctx.fillStyle = filled ? '#2a1a05' : '#150d24'; ctx.fill();
    ctx.strokeStyle = filled ? GOLD : 'rgba(174,247,255,0.4)'; ctx.lineWidth = filled ? 5 : 3; ctx.stroke();
    D.rr(ctx, -cw / 2, -chh / 2, cw, 44, 12); ctx.fillStyle = filled ? '#e0393e' : '#3a2a4a'; ctx.fill();
    text('DIN ' + (i + 1), 0, -chh / 2 + 23, 25, '#ffffff');
    if (filled) {
      ctx.save(); ctx.rotate(Math.sin(f * 0.1 + i) * 0.1);
      D.drawNote(ctx, 0, 22, 0, 1.35);
      ctx.restore();
      if (pop > 0.6) twinkles(0, 10, 44, 2, f + i * 9);
    } else {
      text('·', 0, 26, 54, 'rgba(255,255,255,0.25)');
    }
    ctx.restore();
  }
  ctx.restore();
}
// glitchy leaked-footage monitor
function glitchScreen(x, y, w, h, f) {
  ctx.save(); ctx.translate(x, y);
  D.softShadow(ctx, 0, h / 2 + 30, w * 0.5, 16, 0.32);
  D.rr(ctx, -w / 2 - 16, -h / 2 - 16, w + 32, h + 32, 16); ctx.fillStyle = '#14161c'; ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.save(); ctx.beginPath(); D.rr(ctx, -w / 2, -h / 2, w, h, 8); ctx.clip();
  ctx.fillStyle = '#0a1410'; ctx.fillRect(-w / 2, -h / 2, w, h);
  // the "leaked" scene: dark street + box silhouette, torn by glitch bands
  const tear = Math.sin(f * 0.9) > 0.86 ? (hash(Math.floor(f / 3)) - 0.5) * 34 : 0;
  ctx.save(); ctx.translate(tear, 0);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, '#2b1052'); g.addColorStop(0.6, '#7a1c50'); g.addColorStop(1, '#150826');
  ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = '#0d0518';
  for (let i = 0; i < 6; i++) ctx.fillRect(-w / 2 + i * (w / 5.2), h * 0.08, w / 9, h * 0.44);
  ctx.save(); ctx.translate(0, h * 0.02); ctx.scale(0.9, 0.9); palm(0, h * 0.42, 1.1, 0.15, '#0d0518'); ctx.restore();
  ctx.restore();
  // static + tear bands
  for (let i = 0; i < 34; i++) {
    const by = -h / 2 + hash(i * 13.7 + Math.floor(f / 2) * 7) * h;
    ctx.fillStyle = `rgba(255,255,255,${0.05 + hash(i * 3 + f) * 0.13})`;
    ctx.fillRect(-w / 2, by, w, 3 + hash(i * 7) * 9);
  }
  if (Math.sin(f * 0.9) > 0.86) {
    ctx.fillStyle = 'rgba(0,229,255,0.20)'; ctx.fillRect(-w / 2, -h * 0.18, w, 26);
    ctx.fillStyle = 'rgba(255,46,136,0.20)'; ctx.fillRect(-w / 2, h * 0.22, w, 18);
  }
  // play triangle
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath(); ctx.moveTo(-26, -34); ctx.lineTo(40, 0); ctx.lineTo(-26, 34); ctx.closePath(); ctx.fill();
  D.circ(ctx, 0, 0, 58); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 5; ctx.stroke();
  // scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  for (let yy = -h / 2; yy < h / 2; yy += 7) ctx.fillRect(-w / 2, yy, w, 2.5);
  ctx.restore();
  D.circ(ctx, -w / 2 + 30, -h / 2 + 30, 9); ctx.fillStyle = (Math.sin(f * 0.35) > 0 ? '#ff5a5a' : 'rgba(255,90,90,0.35)'); ctx.fill();
  text('REC', -w / 2 + 78, -h / 2 + 31, 28, '#ff5a5a', 'left');
  ctx.restore();
}

// ---------------- shot system ----------------
const SHOTS = [];
function shot(a, b, vig, cam0, cam1, draw, hits = []) { SHOTS.push({ a, b, vig, cam0, cam1, draw, hits }); }
const BOARD_L1 = [['₹20,000 CRORE', 106, '#ffffff', PINK], ['1 GAME • 1 DIN', 56, '#aef7ff', CYAN]];
const BOARD_L3 = [['ASLI KHEL PEHLE HI', 62], ['HO GAYA THA', 62, '#aef7ff', CYAN]];
const BOARD_L7 = [['AMERICA ME CHHUTTI', 64], ['SIRF GAME KE LIYE!', 54, '#ffe9a8', GOLD]];
const BOARD_LEAK = [['FOOTAGE LEAK!', 74]];
const BOARD_L10 = [['GTA 5', 54, '#ffe9a8', GOLD], ['₹90,000 CRORE', 100, '#ffffff', GOLD]];
const BOARD_L11 = [['₹46,000 CRORE', 102, '#ffffff', GOLD], ['SIRF 7 DIN ME?', 56, '#ffe9a8', GOLD]];
const BOARD_L13 = [['1,600 HINDUSTANI', 64], ['DEVELOPERS • BENGALURU', 50, '#aef7ff', CYAN]];

// ===== L1 (0-98) hook: neon city, ₹20,000 CRORE slam at f55 =====
shot(0, 55, 0.30, { cx: 1080, cy: 1150, s: 1.02 }, { cx: 1080, cy: 1146, s: 1.05 }, (f) => {
  neonCityBG();
  layer(0.92, () => { moneyRain(6, 260, 1480, 5); });
  layer(1, () => {
    heroFig(1080, 1745, 2.95, { talk: true, expr: 'shocked', sweat: true, armR: 'up', armL: 'catch', seed: 5 });
    boardPopNeon(f, 45, 1080, 420, 900, 225, BOARD_L1, PINK);
    twinkles(700, 760, 300, 4, f);
  });
});
shot(55, 105, 0.30, { cx: 1080, cy: 1146, s: 1.05 }, { cx: 1080, cy: 1142, s: 1.08 }, (f) => {
  neonCityBG();
  layer(0.92, () => { moneyRain(12, 240, 1480, 5); });
  layer(1, () => {
    heroFig(1080, 1745, 3.0, { talk: true, expr: 'shocked', sweat: true, armR: 'up', armL: 'catch', seed: 5 });
    neonBoardText(1080, 420, 900, 225, 1, BOARD_L1, PINK);
    burst(1080 - 450, 420 - 112, 55, f, 10, PINK, 9);
    burst(1080 + 450, 420 + 112, 55, f, 10, CYAN, 9);
    twinkles(700, 720, 330, 5, f);
    twinkles(1470, 780, 300, 4, f);
  });
}, [55]);

// ===== L2 (105-211) game shop: copies counter lands f207 =====
shot(105, 160, 0.27, { cx: 1050, cy: 1150, s: 1.03 }, { cx: 1085, cy: 1146, s: 1.06 }, (f) => {
  shopBG();
  layer(0.65, () => { gameShelf(430, 1300, 430, 4, 7); gameShelf(1730, 1300, 430, 4, 12); });
  layer(1, () => {
    shopSign();
    neonBoard(1080, 618, 840, 195, spring((f - 115) / 10), CYAN, 0.5 + 0.5 * Math.sin(f * 0.22));
    if (f >= 130) {
      glowText((2.4 * easeOC((f - 130) / 77)).toFixed(1) + ' CRORE COPIES', 1080, 588, 78, '#ffffff', CYAN, 22);
      if (f >= 150) glowText('PEHLE HI DIN', 1080, 676, 44, '#ffe9a8', GOLD, 18);
    }
    counterFig(1335);
    const qx = [726, 966, 1206, 1446];
    qx.forEach((x, i) => {
      heroFig(x, 1760 - (i % 2) * 26, 1.52, { preset: CROWD[i], expr: i === 0 ? 'happy' : (i % 2 ? 'happy' : 'calm'), armR: i === 0 ? 'catch' : 'down', seed: 11 + i * 7, talk: i === 1 });
    });
    for (let i = 0; i < 3; i++) {
      const cyc = ((f - 105) / 30 + i / 3) % 1;
      gameBoxFig(D.lerp(1560, 800, cyc), 1080 - Math.sin(cyc * Math.PI) * 300 + cyc * 190, 92, 118, (cyc - 0.5) * 0.7, 'GTA 6');
    }
    gameBoxFig(1330, 1268, 96, 122, 0.06, 'GTA 6');
    gameBoxFig(1236, 1274, 88, 112, -0.08, 'GTA 6');
    gameBoxFig(1424, 1276, 84, 106, 0.12, 'GTA 6');
  });
});
shot(160, 212, 0.27, { cx: 1085, cy: 1146, s: 1.06 }, { cx: 1110, cy: 1144, s: 1.08 }, (f) => {
  shopBG();
  layer(0.65, () => { gameShelf(430, 1300, 430, 4, 7); gameShelf(1730, 1300, 430, 4, 12); });
  layer(1, () => {
    shopSign();
    neonBoard(1080, 618, 840, 195, 1, CYAN, 0.5 + 0.5 * Math.sin(f * 0.22));
    glowText((2.4 * easeOC((f - 130) / 77)).toFixed(1) + ' CRORE COPIES', 1080, 588, 78, '#ffffff', CYAN, 22);
    glowText('PEHLE HI DIN', 1080, 676, 44, '#ffe9a8', GOLD, 18);
    burst(1080 - 420, 618 - 97, 207, f, 9, GOLD, 8);
    burst(1080 + 420, 618 + 97, 207, f, 9, CYAN, 8);
    counterFig(1335);
    const qx = [726, 966, 1206, 1446];
    qx.forEach((x, i) => {
      heroFig(x, 1760 - (i % 2) * 26, 1.52, { preset: CROWD[i], expr: 'happy', armR: i === 0 ? 'catch' : 'down', seed: 11 + i * 7, talk: i === 2 });
    });
    for (let i = 0; i < 3; i++) {
      const cyc = ((f - 105) / 26 + i / 3) % 1;
      gameBoxFig(D.lerp(1560, 800, cyc), 1080 - Math.sin(cyc * Math.PI) * 300 + cyc * 190, 92, 118, (cyc - 0.5) * 0.7, 'GTA 6');
    }
    gameBoxFig(1330, 1268, 96, 122, 0.06, 'GTA 6');
    gameBoxFig(1236, 1274, 88, 112, -0.08, 'GTA 6');
    gameBoxFig(1424, 1276, 84, 106, 0.12, 'GTA 6');
  });
});

// ===== L3 (218-277) close-up: secret =====
shot(212, 245, 0.34, { cx: 1080, cy: 1215, s: 1.04 }, { cx: 1080, cy: 1213, s: 1.07 }, (f) => {
  neonCityBG();
  layer(1, () => {
    heroFig(1080, 1830, 3.05, { talk: true, expr: 'smug', armL: 'hold', armR: 'catch', seed: 5 });
    boardPopNeon(f, 222, 1080, 450, 880, 205, BOARD_L3, CYAN);
    twinkles(660, 900, 220, 3, f);
  });
});
shot(245, 283, 0.34, { cx: 1080, cy: 1213, s: 1.07 }, { cx: 1076, cy: 1212, s: 1.08 }, (f) => {
  neonCityBG();
  layer(1, () => {
    const nod = Math.max(0, Math.sin((f - 252) / 16 * Math.PI)) * 0.5;
    heroFig(1080, 1830, 3.05, { talk: true, expr: 'smug', armL: 'hold', armR: 'catch', seed: 5, headDip: nod, wink: f > 262 });
    neonBoardText(1080, 450, 880, 205, 1, BOARD_L3, CYAN);
  });
});

// ===== L4 (283-447) advance booking: phone counter + money stacking =====
shot(283, 340, 0.30, { cx: 1060, cy: 1150, s: 1.03 }, { cx: 1080, cy: 1146, s: 1.06 }, (f) => {
  neonCityBG(true);
  layer(1, () => {
    bookingPhone(860, 1080, 1.4, D.clamp((f - 315) / 75, 0, 1));
    heroFig(1400, 1770, 2.5, { talk: false, expr: 'happy', armR: 'phone', armL: 'catch', seed: 9 });
    twinkles(1330, 620, 200, 3, f);
  });
});
shot(340, 399, 0.27, { cx: 1080, cy: 1150, s: 1.04 }, { cx: 1080, cy: 1146, s: 1.07 }, (f) => {
  shopBG();
  layer(1, () => {
    neonBoardText(1080, 470, 820, 185, spring((f - 345) / 10), [
      [(1.5 * easeOC((f - 350) / 40)).toFixed(1) + ' CRORE COPIES', 70, '#ffffff', PINK],
      ['BOOKED!', 46, '#ffe9a8', GOLD],
    ], PINK);
    counterFig(1335);
    const grow = D.clamp((f - 340) / 50, 0, 1);
    noteStack(820, 1332, Math.round(3 + 8 * grow), 21);
    noteStack(960, 1332, Math.round(2 + 10 * grow), 33);
    noteStack(1100, 1332, Math.round(4 + 7 * grow), 47);
    heroFig(1400, 1770, 2.4, { talk: true, expr: 'happy', armR: 'catch', prop: 'notes', seed: 9 });
    twinkles(1400, 640, 190, 3, f);
  });
});
shot(399, 454, 0.30, { cx: 1080, cy: 1150, s: 1.04 }, { cx: 1080, cy: 1144, s: 1.08 }, (f) => {
  neonCityBG();
  layer(0.92, () => { moneyRain(14, 240, 1480, 9); });
  layer(1, () => {
    heroFig(1080, 1755, 3.0, { talk: true, expr: 'happy', armL: 'up', armR: 'up', seed: 5 });
    neonBoardText(1080, 430, 900, 230, spring((f - 390) / 9), [
      ['₹13,000 CRORE', 100, '#ffffff', PINK],
      ['BINA KHELE!', 64, '#ffe9a8', GOLD],
    ], PINK);
    burst(1080 - 450, 430 - 115, 399, f, 11, PINK, 9);
    burst(1080 + 450, 430 + 115, 399, f, 11, GOLD, 9);
    twinkles(680, 760, 300, 4, f);
  });
}, [399]);

// ===== L5 (454-588) studio: money pours into the making =====
shot(454, 520, 0.30, { cx: 1080, cy: 1150, s: 1.03 }, { cx: 1080, cy: 1146, s: 1.06 }, (f) => {
  studioBG();
  layer(1, () => {
    devMachine(860, 1560, f);
    moneyPour(860, 470, 1085, 7, 61, 90);
    heroFig(1400, 1770, 2.5, { talk: true, expr: 'puzzled', armR: 'catch', armL: 'down', seed: 9 });
    boardPopNeon(f, 498, 1080, 430, 880, 205, [
      ['LAGAT', 46, '#ffe9a8', GOLD],
      ['₹10,000 CRORE+', 86, '#ffffff', PINK],
    ], PINK);
  });
});
shot(520, 560, 0.30, { cx: 1060, cy: 1160, s: 1.05 }, { cx: 1080, cy: 1154, s: 1.08 }, (f) => {
  studioBG();
  layer(1, () => {
    devMachine(850, 1650, f);
    moneyPour(850, 560, 1175, 8, 71, 90);
    heroFig(1410, 1780, 2.3, { talk: false, expr: 'worried', sweat: true, armL: 'down', armR: 'down', seed: 9 });
    stampFig(960, 860, -0.12, ['DUNIYA KA SABSE', 'MEHNGA GAME'], spring((f - 537) / 9));
  });
}, [546]);
shot(560, 596, 0.30, { cx: 1080, cy: 1150, s: 1.03 }, { cx: 1080, cy: 1146, s: 1.06 }, (f) => {
  studioBG();
  layer(1, () => {
    devMachine(850, 1660, f);
    moneyPour(850, 620, 1185, 5, 83, 70);
    heroFig(1380, 1790, 2.7, { talk: true, expr: 'shocked', sweat: true, armR: 'catch', seed: 5 });
    stampFig(900, 840, -0.12, ['DUNIYA KA SABSE', 'MEHNGA GAME'], 1);
    neonBoardText(1080, 430, 880, 205, 1, [
      ['LAGAT', 46, '#ffe9a8', GOLD],
      ['₹10,000 CRORE+', 86, '#ffffff', PINK],
    ], PINK);
  });
});

// ===== L6 (596-750) girna: calendar, pushed dates, leak, falling fans =====
shot(596, 660, 0.36, { cx: 1080, cy: 1150, s: 1.03 }, { cx: 1070, cy: 1146, s: 1.06 }, (f) => {
  neonCityBG(true);
  layer(1, () => {
    const num = Math.min(13, 1 + Math.floor((f - 596) / 4.2));
    D.drawFlipCal(ctx, 790, 1180, 1.75, num);
    text('SAAL', 790, 1330, 44, '#aef7ff');
    heroFig(1420, 1770, 2.35, { talk: true, expr: 'sad', headDip: 0.55, seed: 9 });
    boardPopNeon(f, 612, 1150, 430, 720, 190, [
      ['13 SAAL', 92, '#ffffff', CYAN],
      ['KA INTEZAAR', 46, '#aef7ff', CYAN],
    ], CYAN);
  });
});
shot(660, 712, 0.36, { cx: 1090, cy: 1150, s: 1.04 }, { cx: 1080, cy: 1146, s: 1.07 }, (f) => {
  neonCityBG(true);
  layer(1, () => {
    D.drawCalendar(ctx, 830, 1300, 1.28, f);
    stampFig(1230, 680, 0.10, ['DATE 2 BAAR', 'AAGE BADHI'], spring((f - 660) / 8));
    heroFig(1410, 1790, 2.25, { talk: true, expr: 'sad', headDip: 0.5, seed: 9 });
    if (f >= 705) {
      ctx.save(); ctx.globalAlpha = D.clamp((f - 705) / 7, 0, 1);
      glitchScreen(1060, 1300, 420, 310, f);
      ctx.restore();
    }
    boardPopNeon(f, 705, 1080, 430, 760, 180, BOARD_LEAK, PINK);
  });
});
shot(712, 757, 0.38, { cx: 1080, cy: 1150, s: 1.04 }, { cx: 1080, cy: 1146, s: 1.07 }, (f, u) => {
  neonCityBG(true);
  layer(1, () => {
    glitchScreen(1080, 920, 740, 540, f);
    neonBoardText(1080, 430, 760, 180, 1, BOARD_LEAK, PINK);
    const dip = 0.3 + 0.5 * u;
    heroFig(720, 1800, 1.85, { preset: CROWD[1], expr: 'sad', headDip: dip, seed: 21 });
    heroFig(1430, 1800, 1.85, { preset: CROWD[3], expr: 'sad', headDip: dip, seed: 33 });
    heroFig(1080, 1860, 2.35, { talk: true, expr: 'sad', headDip: dip * 0.8, seed: 5 });
  });
});

// ===== L7 (757-858) office empties out =====
shot(757, 800, 0.30, { cx: 1060, cy: 1150, s: 1.03 }, { cx: 1090, cy: 1146, s: 1.06 }, (f) => {
  officeBG(0.5);
  layer(0.65, () => {
    deskUnit(740, 1470, 1.15, false);
    deskUnit(1080, 1500, 1.15, Math.sin(f * 0.4) > 0.3);
    deskUnit(1415, 1470, 1.15, false);
  });
  layer(1, () => {
    heroFig(680 + (f - 757) * 2.2, 1790, 1.9, { preset: CROWD[4], expr: 'happy', walk: f * 0.045, seed: 41 });
    heroFig(760 + (f - 757) * 1.6, 1760, 2.4, { talk: true, expr: 'happy', walk: f * 0.045, seed: 5 });
    heroFig(1230 + (f - 757) * 2.0, 1790, 2.0, { preset: CROWD[0], expr: 'happy', walk: f * 0.045, seed: 53 });
    boardPopNeon(f, 798, 1080, 440, 900, 205, BOARD_L7, CYAN);
  });
});
shot(800, 865, 0.30, { cx: 1030, cy: 1150, s: 1.04 }, { cx: 1130, cy: 1146, s: 1.07 }, (f) => {
  officeBG(0.95);
  layer(0.65, () => {
    deskUnit(740, 1470, 1.15, false);
    deskUnit(1150, 1500, 1.15, false);
  });
  layer(1, () => {
    neonBoardText(1080, 440, 900, 205, 1, BOARD_L7, CYAN);
    const hx = 830 + (f - 800) * 2.6;
    heroFig(hx, 1780, 2.5, { talk: true, expr: 'happy', walk: f * 0.16, seed: 5 });
    gameBoxFig(hx + 168, 1170 + Math.abs(Math.sin(f * 0.16 * Math.PI)) * -14, 168, 216, 0.05, 'GTA 6');
    heroFig(1450, 1790, 1.8, { preset: CROWD[2], expr: 'happy', walk: f * 0.16, seed: 67 });
    // speed lines behind the runner
    ctx.strokeStyle = 'rgba(174,247,255,0.35)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const ly = 1050 + i * 130, lx = hx - 260 - ((f * 14 + i * 90) % 190);
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 110, ly); ctx.stroke();
    }
  });
});

// ===== L8 (865-1046) India: price tag, wallet, queue =====
shot(865, 920, 0.30, { cx: 1080, cy: 1228, s: 1.04 }, { cx: 1076, cy: 1218, s: 1.08 }, (f) => {
  shopBG();
  layer(1, () => {
    heroFig(1080, 1790, 3.15, { talk: true, expr: 'shocked', sweat: true, armL: 'hold', armR: 'hold', seed: 5 });
    const bob = Math.sin((f - 865) * 0.16) * 9;
    gameBoxFig(1080, 1330 + bob, 330, 424, Math.sin((f - 865) * 0.1) * 0.03, 'GTA 6');
    twinkles(760, 1150, 190, 4, f);
    boardPopNeon(f, 882, 1080, 438, 640, 180, [['₹5,999', 104, '#ffffff', PINK]], PINK);
  });
});
shot(920, 978, 0.32, { cx: 1080, cy: 1150, s: 1.04 }, { cx: 1080, cy: 1146, s: 1.07 }, (f) => {
  shopBG();
  layer(1, () => {
    // big empty wallet, coins dropping out of it
    D.drawWallet(ctx, 820, 1010, 2.6, Math.sin(f * 0.08) * 0.05);
    for (let i = 0; i < 3; i++) {
      const cy2 = 1130 + ((f * 2.2 + i * 90) % 190);
      ctx.save(); ctx.globalAlpha = 1 - ((f * 2.2 + i * 90) % 190) / 190;
      D.drawCoin(ctx, 780 + i * 44, cy2, 17, f);
      ctx.restore();
    }
    heroFig(1360, 1780, 2.45, { talk: true, expr: 'worried', sweat: true, prop: 'wallet', armL: 'hold', armR: 'hold', seed: 5 });
    boardPopNeon(f, 936, 1080, 440, 880, 190, [['AADHI MAHINE KI KAMAI?', 56, '#ffffff', PINK]], PINK);
  });
});
shot(978, 1015, 0.27, { cx: 1040, cy: 1150, s: 1.04 }, { cx: 1100, cy: 1146, s: 1.07 }, (f) => {
  shopBG();
  layer(0.65, () => { gameShelf(430, 1300, 430, 4, 7); gameShelf(1730, 1300, 430, 4, 12); });
  layer(1, () => {
    shopSign();
    counterFig(1335);
    const qx = [900, 1080, 1260, 1440];
    qx.forEach((x, i) => {
      heroFig(x, 1770 - (i % 2) * 22, 1.5, { preset: CROWD[i % CROWD.length], expr: 'happy', armR: i === 1 ? 'catch' : 'down', seed: 71 + i * 7, talk: i === 3 });
    });
    heroFig(745, 1820, 2.15, { talk: true, expr: 'happy', armR: 'up', seed: 5 });
    for (let i = 0; i < 2; i++) {
      const cyc = ((f - 978) / 24 + i / 2) % 1;
      gameBoxFig(D.lerp(1500, 980, cyc), 1060 - Math.sin(cyc * Math.PI) * 280 + cyc * 180, 88, 112, (cyc - 0.5) * 0.7, 'GTA 6');
    }
  });
});
shot(1015, 1053, 0.27, { cx: 1100, cy: 1146, s: 1.07 }, { cx: 1080, cy: 1144, s: 1.09 }, (f) => {
  shopBG();
  layer(0.65, () => { gameShelf(430, 1300, 430, 4, 7); gameShelf(1730, 1300, 430, 4, 12); });
  layer(1, () => {
    shopSign();
    counterFig(1335);
    gameBoxFig(1330, 1268, 96, 122, 0.06, 'GTA 6');
    gameBoxFig(1236, 1274, 88, 112, -0.08, 'GTA 6');
    gameBoxFig(1424, 1276, 84, 106, 0.12, 'GTA 6');
    gameBoxFig(1290, 1150, 88, 112, 0.03, 'GTA 6');
    const qx = [700, 880, 1060, 1240, 1420];
    qx.forEach((x, i) => {
      heroFig(x, 1775 - (i % 2) * 22, 1.55, { preset: CROWD[(i + 2) % CROWD.length], expr: 'happy', armR: i === 0 ? 'catch' : 'down', seed: 97 + i * 7, talk: i === 2 });
    });
    twinkles(1080, 700, 420, 4, f);
  });
});

// ===== L9 (1053-1088) dark beat: re-hook =====
shot(1053, 1095, 0.55, { cx: 1080, cy: 1150, s: 1.03 }, { cx: 1080, cy: 1146, s: 1.06 }, (f) => {
  layer(0.3, () => {
    const g = ctx.createLinearGradient(0, -700, 0, 1600);
    g.addColorStop(0, '#07030e'); g.addColorStop(1, '#0d0618');
    ctx.fillStyle = g; ctx.fillRect(-900, -700, 3960, 2300);
    stars(18, 400, 7);
  });
  layer(1, () => {
    // single spotlight cone
    const sg = ctx.createLinearGradient(0, 120, 0, 1560);
    sg.addColorStop(0, 'rgba(255,240,200,0.30)'); sg.addColorStop(1, 'rgba(255,240,200,0.02)');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.moveTo(1008, 120); ctx.lineTo(1152, 120); ctx.lineTo(1420, 1560); ctx.lineTo(740, 1560); ctx.closePath(); ctx.fill();
    D.ell(ctx, 1080, 1560, 330, 44); ctx.fillStyle = 'rgba(255,240,200,0.13)'; ctx.fill();
    // dust motes drifting in the beam
    for (let i = 0; i < 10; i++) {
      const mx = 1080 + (hash(i * 7.7) - 0.5) * 420 + Math.sin(f * 0.05 + i) * 16;
      const my = 300 + ((f * (0.5 + hash(i * 3) * 0.6) + hash(i * 11) * 1100) % 1100);
      ctx.fillStyle = 'rgba(255,244,210,0.4)'; D.circ(ctx, mx, my, 3 + hash(i) * 2.5); ctx.fill();
    }
    heroFig(1080, 1745, 2.6, { talk: true, expr: 'puzzled', armL: 'down', armR: 'up', seed: 5 });
    boardPopNeon(f, 1056, 1080, 470, 860, 210, [
      ['ASLI NUMBER ABHI', 62, '#ffffff', PINK],
      ['BAKI HAI…', 62, '#ffe9a8', GOLD],
    ], PINK);
  });
});

// ===== L10 (1095-1240) legacy vault: GTA 5 treasure =====
shot(1095, 1146, 0.30, { cx: 1080, cy: 1150, s: 1.03 }, { cx: 1080, cy: 1146, s: 1.07 }, (f) => {
  vaultBG();
  layer(1, () => {
    // pedestal with the old king's box
    ctx.fillStyle = '#3a2a12'; D.rr(ctx, 900, 1330, 360, 60, 10); ctx.fill();
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#2a1e0c'; ctx.fillRect(960, 1390, 240, 150);
    const bob = Math.sin(f * 0.1) * 6;
    ctx.save(); ctx.shadowColor = GOLD; ctx.shadowBlur = 34;
    gameBoxFig(1080, 1140 + bob, 250, 320, 0, 'GTA 5');
    ctx.restore();
    twinkles(1080, 1080, 260, 5, f);
    heroFig(720 + (f - 1095) * 1.1, 1780, 2.6, { talk: true, expr: 'shocked', sweat: true, armR: 'catch', seed: 5 });
  });
});
shot(1146, 1191, 0.30, { cx: 1080, cy: 1150, s: 1.04 }, { cx: 1080, cy: 1146, s: 1.06 }, (f) => {
  vaultBG();
  layer(0.92, () => { moneyRain(10, 300, 1400, 13); });
  layer(1, () => {
    heroFig(1080, 1790, 3.0, { talk: true, expr: 'shocked', sweat: true, armL: 'catch', armR: 'catch', seed: 5 });
    neonBoardText(1080, 440, 920, 240, spring((f - 1137) / 9), BOARD_L10, GOLD);
    burst(1080 - 460, 440 - 120, 1146, f, 11, GOLD, 9);
    burst(1080 + 460, 440 + 120, 1146, f, 11, PINK, 9);
    twinkles(700, 820, 260, 4, f);
  });
}, [1146]);
shot(1191, 1247, 0.34, { cx: 1080, cy: 1150, s: 1.03 }, { cx: 1080, cy: 1146, s: 1.06 }, (f) => {
  layer(0.3, () => {
    const g = ctx.createLinearGradient(0, -700, 0, 1500);
    g.addColorStop(0, '#0b0d16'); g.addColorStop(1, '#161a28');
    ctx.fillStyle = g; ctx.fillRect(-900, -700, 3960, 2200);
    // faint cinema seats silhouettes at the bottom
    ctx.fillStyle = '#05070c';
    for (let i = 0; i < 6; i++) { D.rr(ctx, 240 + i * 280, 1560, 210, 190, 26); ctx.fill(); }
    const pool = ctx.createRadialGradient(620, 1000, 30, 620, 1000, 560);
    pool.addColorStop(0, 'rgba(190,210,255,0.20)'); pool.addColorStop(1, 'rgba(190,210,255,0)');
    ctx.fillStyle = pool; D.circ(ctx, 620, 1000, 560); ctx.fill();
  });
  layer(1, () => {
    filmCameraFig(810, 1060, 1.15, f);
    redCross(810, 1030, 215, spring((f - 1200) / 10));
    heroFig(1395, 1780, 2.5, { talk: true, expr: 'smug', seed: 5, face: Math.sin(f * 0.07) > 0 ? 0 : -1 });
    twinkles(1500, 620, 180, 3, f);
  });
});

// ===== L11 (1247-1372) seven days, then the biggest board =====
shot(1247, 1300, 0.30, { cx: 1080, cy: 1150, s: 1.03 }, { cx: 1080, cy: 1146, s: 1.06 }, (f) => {
  neonCityBG();
  layer(1, () => {
    weekCal(1080, 900, D.clamp((f - 1255) / 38, 0, 1), f);
    noteStack(760, 1420, Math.round(2 + 6 * D.clamp((f - 1255) / 38, 0, 1)), 55);
    noteStack(1420, 1420, Math.round(1 + 7 * D.clamp((f - 1255) / 38, 0, 1)), 67);
    heroFig(1080, 1800, 2.5, { talk: true, expr: 'happy', armR: 'up', seed: 5 });
  });
});
shot(1300, 1332, 0.30, { cx: 1080, cy: 1146, s: 1.06 }, { cx: 1080, cy: 1144, s: 1.09 }, (f) => {
  neonCityBG();
  layer(0.92, () => { moneyRain(7, 260, 1400, 17); });
  layer(1, () => {
    weekCal(1080, 900, 1, f);
    heroFig(1080, 1800, 2.7, { talk: true, expr: 'shocked', sweat: true, armL: 'catch', armR: 'catch', seed: 5 });
    twinkles(700, 700, 320, 4, f);
    twinkles(1480, 720, 280, 4, f);
  });
});
shot(1332, 1380, 0.30, { cx: 1080, cy: 1150, s: 1.03 }, { cx: 1080, cy: 1146, s: 1.06 }, (f) => {
  neonCityBG();
  layer(0.92, () => { moneyRain(18, 220, 1480, 19); });
  layer(1, () => {
    heroFig(1080, 1765, 3.1, { talk: true, expr: 'shocked', sweat: true, armL: 'up', armR: 'up', seed: 5 });
    neonBoardText(1080, 450, 920, 245, spring((f - 1323) / 9), BOARD_L11, GOLD);
    burst(1080 - 460, 450 - 122, 1332, f, 12, GOLD, 10);
    burst(1080 + 460, 450 + 122, 1332, f, 12, PINK, 10);
    burst(1080, 450, 1340, f, 14, CYAN, 11);
    twinkles(660, 800, 320, 5, f);
    twinkles(1500, 820, 300, 5, f);
  });
}, [1332, 1340]);

// ===== L12 (1380-1480) one game vs ISRO =====
shot(1380, 1440, 0.30, { cx: 1080, cy: 1150, s: 1.03 }, { cx: 1080, cy: 1146, s: 1.06 }, (f) => {
  layer(0.3, () => {
    // LEFT: dawn launch sky
    const g = ctx.createLinearGradient(0, -700, 0, 1500);
    g.addColorStop(0, '#1c2a52'); g.addColorStop(0.55, '#7a3a6e'); g.addColorStop(1, '#e8763d');
    ctx.fillStyle = g; ctx.fillRect(-900, -700, 1980, 2200);
    stars(16, 300, 23);
    ctx.fillStyle = '#120a24';
    ctx.beginPath(); ctx.moveTo(-900, 1500); ctx.lineTo(1080, 1500); ctx.lineTo(1080, 1640); ctx.lineTo(-900, 1560); ctx.closePath(); ctx.fill();
    // RIGHT: neon night
    const g2 = ctx.createLinearGradient(0, -700, 0, 1500);
    g2.addColorStop(0, '#1b0640'); g2.addColorStop(0.55, '#4b1160'); g2.addColorStop(1, '#8a2066');
    ctx.fillStyle = g2; ctx.fillRect(1080, -700, 1980, 2200);
    skyline(1505, 480, 900, 235, '#1d0833', 'rgba(255,205,140,0.95)', FRAME * 0.4, 43, true);
  });
  layer(0.85, () => {
    // glowing divider
    const dg = ctx.createLinearGradient(1068, 0, 1092, 0);
    dg.addColorStop(0, 'rgba(0,229,255,0)'); dg.addColorStop(0.5, 'rgba(0,229,255,0.55)'); dg.addColorStop(1, 'rgba(255,46,136,0)');
    ctx.fillStyle = dg; ctx.fillRect(1068, -400, 24, 2300);
    wetRoad(1505);
  });
  layer(1, () => {
    rocketFig(760, 1420, f, D.clamp((f - 1395) / 40, 0, 1));
    // game box on a neon pedestal (right)
    ctx.fillStyle = '#2a0f45'; D.rr(ctx, 1270, 1330, 300, 60, 10); ctx.fill();
    ctx.strokeStyle = CYAN; ctx.lineWidth = 4; ctx.stroke();
    ctx.save(); ctx.shadowColor = PINK; ctx.shadowBlur = 30;
    gameBoxFig(1420, 1165 + Math.sin(f * 0.1) * 6, 250, 320, 0, 'GTA 6');
    ctx.restore();
    heroFig(1080, 1830, 2.0, { talk: true, expr: 'puzzled', seed: 5 });
    boardPopNeon(f, 1404, 1080, 430, 880, 190, [['1 GAME = ISRO × 3+', 66, '#ffffff', CYAN]], CYAN);
  });
});
shot(1440, 1487, 0.34, { cx: 1080, cy: 1215, s: 1.05 }, { cx: 1080, cy: 1213, s: 1.08 }, (f) => {
  neonCityBG();
  layer(1, () => {
    const quiet = f >= 1460;
    heroFig(1080, 1830, 3.05, {
      talk: !quiet, expr: 'shocked', seed: 5,
      face: quiet ? Math.round(Math.sin((f - 1460) * 0.09)) : 0,
      headDip: quiet ? 0.18 : 0,
    });
    ctx.save(); ctx.globalAlpha = 0.92;
    neonBoardText(1080, 450, 880, 190, 0.94, [['1 GAME = ISRO × 3+', 66, '#ffffff', CYAN]], CYAN);
    ctx.restore();
    twinkles(680, 950, 220, 3, f);
  });
});

// ===== L13 (1487-1586) Bengaluru developers =====
shot(1487, 1540, 0.30, { cx: 1080, cy: 1150, s: 1.03 }, { cx: 1080, cy: 1146, s: 1.06 }, (f) => {
  neonCityBG();
  layer(0.75, () => {
    // dense tech-park towers with office windows + antennas
    for (const [bx, bw2, bh] of [[430, 210, 900], [760, 180, 760], [1240, 200, 980], [1560, 190, 820]]) {
      ctx.fillStyle = '#170a2e'; ctx.fillRect(bx, 1505 - bh, bw2, bh);
      for (let r = 0; r < Math.floor(bh / 46); r++) for (let c = 0; c < Math.floor(bw2 / 40); c++) {
        const hsh = hash(bx + r * 31 + c * 7);
        if (hsh < 0.35) continue;
        ctx.fillStyle = hsh > 0.8 ? 'rgba(0,229,255,0.9)' : 'rgba(255,214,140,0.9)';
        ctx.globalAlpha = 0.45 + hash(bx + r * 3 + c) * 0.55;
        ctx.fillRect(bx + 10 + c * 40, 1505 - bh + 14 + r * 46, 20, 26);
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#170a2e'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(bx + bw2 / 2, 1505 - bh); ctx.lineTo(bx + bw2 / 2, 1505 - bh - 64); ctx.stroke();
      const bl = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(FRAME * 0.18 + bx));
      ctx.fillStyle = `rgba(255,46,136,${bl})`; D.circ(ctx, bx + bw2 / 2, 1505 - bh - 72, 6); ctx.fill();
    }
  });
  layer(1, () => {
    heroFig(1080, 1775, 2.9, { talk: true, expr: 'happy', armR: 'up', armL: 'down', seed: 5 });
    boardPopNeon(f, 1536, 1080, 440, 880, 205, BOARD_L13, CYAN);
  });
});
shot(1540, 1594, 0.30, { cx: 1080, cy: 1146, s: 1.06 }, { cx: 1080, cy: 1144, s: 1.08 }, (f) => {
  neonCityBG();
  layer(1, () => {
    heroFig(1080, 1785, 3.0, { talk: true, expr: 'smug', armL: 'fold', armR: 'fold', seed: 5 });
    neonBoardText(1080, 440, 880, 205, 1, BOARD_L13, CYAN);
    twinkles(640, 760, 280, 4, f);
    twinkles(1520, 780, 260, 4, f);
  });
});

// ===== L14 (1594-1673) money-printing machine =====
shot(1594, 1632, 0.30, { cx: 1080, cy: 1150, s: 1.03 }, { cx: 1080, cy: 1146, s: 1.06 }, (f) => {
  pressRoomBG();
  layer(1, () => {
    pressMachine(920, 1520, f, 1, 0.9);
    heroFig(1400, 1850, 2.3, { talk: true, expr: 'smug', armL: 'rub', armR: 'rub', seed: 5 });
  });
});
shot(1632, 1679, 0.30, { cx: 1080, cy: 1146, s: 1.06 }, { cx: 1080, cy: 1144, s: 1.08 }, (f) => {
  pressRoomBG();
  layer(0.92, () => { moneyRain(6, 300, 1300, 29); });
  layer(1, () => {
    pressMachine(920, 1520, f, 1.7, 0.9);
    heroFig(1400, 1850, 2.3, { talk: true, expr: 'smug', armL: 'rub', armR: 'rub', seed: 5 });
    boardPopNeon(f, 1632, 1080, 440, 920, 190, [['PAISA CHHAAPNE KI MACHINE', 52, '#ffffff', PINK]], PINK);
  });
});

// ===== L15 (1679-1785) the question: box in one hand, wallet in the other =====
shot(1679, 1740, 0.32, { cx: 1080, cy: 1220, s: 1.04 }, { cx: 1080, cy: 1218, s: 1.07 }, (f) => {
  neonCityBG();
  layer(1, () => {
    heroFig(1080, 1880, 3.1, { talk: true, expr: 'puzzled', armL: 'hold', armR: 'hold', seed: 5 });
    gameBoxFig(822, 1245 + Math.sin(f * 0.1) * 7, 208, 268, -0.06, 'GTA 6');
    D.drawWallet(ctx, 1352, 1245 + Math.sin(f * 0.1 + 2) * 7, 2.1, 0.05);
    boardPopNeon(f, 1692, 1080, 480, 860, 215, [
      ['₹5,999', 88, '#ffffff', PINK],
      ['SAMAJHDARI YA LOOT?', 54, '#ffe9a8', GOLD],
    ], PINK);
    twinkles(620, 900, 200, 3, f);
  });
});
shot(1740, 1785, 0.32, { cx: 1080, cy: 1218, s: 1.07 }, { cx: 1080, cy: 1215, s: 1.10 }, (f) => {
  neonCityBG();
  layer(1, () => {
    heroFig(1080, 1880, 3.1, { talk: f < 1770, expr: 'puzzled', armL: 'hold', armR: 'hold', seed: 5 });
    gameBoxFig(822, 1245 + Math.sin(f * 0.1) * 7, 208, 268, -0.06, 'GTA 6');
    D.drawWallet(ctx, 1352, 1245 + Math.sin(f * 0.1 + 2) * 7, 2.1, 0.05);
    neonBoardText(1080, 480, 860, 215, 1, [
      ['₹5,999', 88, '#ffffff', PINK],
      ['SAMAJHDARI YA LOOT?', 54, '#ffe9a8', GOLD],
    ], PINK);
    D.drawQuestion(ctx, 1470, 760, 1.25, f);
    twinkles(620, 900, 200, 3, f);
    twinkles(1560, 980, 180, 3, f);
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
  ctx.fillStyle = '#150722'; ctx.fillRect(0, 0, W, H);
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
