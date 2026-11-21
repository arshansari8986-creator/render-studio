// Bank Paisa Ghumata Hai — kahani-style Short (1988 frames @30fps). Impossible sawal: sau jama, nau sau karz.
// Note ki journey: bank -> Ramesh -> dukaan -> bank -> Suresh. Hisaab kahani ke andar.
// Harness: window.ready, window.renderFrame(f), window.TOTAL.
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import * as D from './draw.js';

const W = 1080, H = 1920, TOTAL = 1988, FPS = 30;
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const DEV_FONT = '"Noto Sans Devanagari"';
const fontReady = (async () => {
  try {
    const face = new FontFace('Noto Sans Devanagari', `url(data:font/ttf;base64,${DEVANAGARI_BOLD_B64})`, { weight: '700' });
    await face.load(); document.fonts.add(face);
    await document.fonts.load(`700 60px ${DEV_FONT}`, 'BLINKIT ₹5');
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

// ---------------- shared scene pieces ----------------
const YEL = '#f8cb46', GRN = '#0c831f';
function skyline(seed, baseY, col, winCol) {
  for (let i = 0; i < 14; i++) {
    const bx = -200 + i * 190 + hash(i * 3.3 + seed) * 60, bw = 130 + hash(i * 7.1 + seed) * 90;
    const bh = 380 + hash(i * 5.7 + seed) * 620;
    ctx.fillStyle = col; ctx.fillRect(bx, baseY - bh, bw, bh);
    for (let wy = 0; wy < 8; wy++) for (let wx = 0; wx < 3; wx++) {
      if (hash(i * 31 + wy * 7 + wx * 13 + seed) > 0.62) {
        ctx.fillStyle = winCol; ctx.globalAlpha = 0.45 + hash(i + wy + wx) * 0.5;
        ctx.fillRect(bx + 18 + wx * (bw - 36) / 3, baseY - bh + 26 + wy * (bh - 60) / 8, 16, 22);
        ctx.globalAlpha = 1;
      }
    }
  }
}
function lampPost(x, gy, s = 1, f = 0) {
  ctx.strokeStyle = '#10131a'; ctx.lineWidth = 10 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, gy - 330 * s); ctx.lineTo(x + 60 * s, gy - 345 * s); ctx.stroke();
  const fl = 0.85 + 0.15 * Math.sin(f * 0.7 + x);
  lampPool(x + 66 * s, gy - 330 * s, 200 * s, 0.30 * fl);
  ctx.fillStyle = '#ffe9a8'; D.circ(ctx, x + 66 * s, gy - 338 * s, 13 * s); ctx.fill();
}
function scooter(x, y, s, dir, t, opts = {}) {
  // side-view delivery scooter + rider silhouette. Ground at y. dir=+1 faces right.
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
  if (opts.streaks !== false) {
    ctx.strokeStyle = 'rgba(200,220,255,0.32)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) { const sy = -60 - i * 42, o = (t * 7 + i * 60) % 90; ctx.beginPath(); ctx.moveTo(-190 - o, sy); ctx.lineTo(-120 - o, sy); ctx.stroke(); }
  }
  for (const wx of [-105, 105]) {
    D.circ(ctx, wx, -38, 38); D.fillStroke(ctx, '#22262e', 7);
    ctx.strokeStyle = '#8b93a1'; ctx.lineWidth = 5;
    for (let k = 0; k < 3; k++) { const a = t * 0.9 + k * Math.PI / 3 + wx; ctx.beginPath(); ctx.moveTo(wx, -38); ctx.lineTo(wx + Math.cos(a) * 30, -38 + Math.sin(a) * 30); ctx.stroke(); }
    D.circ(ctx, wx, -38, 9); ctx.fillStyle = '#c8cdd6'; ctx.fill();
  }
  D.poly(ctx, [[-95, -44], [-38, -104], [30, -112], [92, -52], [40, -40], [-46, -38]]); D.fillStroke(ctx, '#2e7d46', 6);
  D.rr(ctx, -58, -128, 96, 20, 9); D.fillStroke(ctx, '#191d24', 4);
  D.rr(ctx, 52, -208, 104, 88, 10); D.fillStroke(ctx, opts.boxCol || YEL, 5);
  ctx.save(); ctx.translate(104, -163); ctx.scale(dir, 1); text('B', 0, 0, 52, GRN); ctx.restore();
  ctx.fillStyle = '#14181f';
  D.poly(ctx, [[-30, -118], [6, -196], [34, -192], [26, -118]]); ctx.fill();
  D.limb(ctx, 22, -186, -52, -138, 17, '#14181f');
  D.limb(ctx, -6, -120, -34, -52, 19, '#14181f');
  D.circ(ctx, 16, -222, 27); ctx.fillStyle = YEL; ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = 'rgba(20,24,31,0.9)'; ctx.fillRect(16, -228, 30, 12);
  D.limb(ctx, -30, -112, -66, -140, 9, '#191d24');
  D.circ(ctx, -78, -128, 12); D.fillStroke(ctx, '#ffe9a8', 4);
  const bg = ctx.createLinearGradient(-84, -128, -420, -60);
  bg.addColorStop(0, 'rgba(255,233,168,0.28)'); bg.addColorStop(1, 'rgba(255,233,168,0)');
  ctx.fillStyle = bg; D.poly(ctx, [[-84, -140], [-430, -190], [-430, -10], [-84, -112]]); ctx.fill();
  ctx.restore();
}
function crate(x, y, s, col = '#8a5a2b') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.rr(ctx, -52, -64, 104, 64, 6); D.fillStroke(ctx, col, 5);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-52, -42); ctx.lineTo(52, -42); ctx.moveTo(-52, -21); ctx.lineTo(52, -21); ctx.stroke();
  ctx.restore();
}
function storeFront(f) {
  const gy = 2160;
  ctx.fillStyle = '#131c16'; ctx.fillRect(430, 830, 1300, gy - 830);
  ctx.fillStyle = '#0d130f'; ctx.fillRect(430, 830, 1300, 26);
  ctx.fillStyle = '#0a0f14'; ctx.fillRect(-260, 1060, 560, gy - 1060); ctx.fillRect(1860, 990, 560, gy - 990);
  for (const [bx, by] of [[40, 1250], [120, 1480], [2050, 1200], [2140, 1450]]) {
    ctx.fillStyle = 'rgba(255,217,138,0.75)'; ctx.fillRect(bx, by, 34, 44);
  }
  const pulse = 0.92 + 0.08 * Math.sin(f * 0.12);
  ctx.save(); ctx.globalAlpha = pulse;
  D.rr(ctx, 470, 872, 1220, 138, 16); ctx.fillStyle = YEL; ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  text('BLINKIT', 1080, 944, 104, '#0a3813');
  ctx.restore();
  lampPool(1080, 950, 720, 0.16);
  ctx.fillStyle = '#3a3f47'; ctx.fillRect(700, 1180, 760, 130);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  for (let i = 0; i < 9; i++) ctx.fillRect(700, 1196 + i * 13, 760, 5);
  const ig = ctx.createLinearGradient(0, 1310, 0, gy);
  ig.addColorStop(0, '#ffca7a'); ig.addColorStop(1, '#e08b3a');
  ctx.fillStyle = ig; ctx.fillRect(700, 1310, 760, gy - 1310);
  ctx.fillStyle = 'rgba(90,45,10,0.55)';
  for (let r = 0; r < 3; r++) { ctx.fillRect(730, 1400 + r * 210, 700, 26); for (let i = 0; i < 7; i++) ctx.fillRect(748 + i * 96, 1330 + r * 210, 62, 70); }
  const wx = 1080 + Math.sin(f * 0.045) * 210, flip = Math.cos(f * 0.045) > 0 ? 1 : -1;
  ctx.fillStyle = 'rgba(40,22,8,0.85)';
  D.circ(ctx, wx, 1560, 34); ctx.fill();
  D.poly(ctx, [[wx - 30, 1590], [wx + 30, 1590], [wx + 22, 1760], [wx - 22, 1760]]); ctx.fill();
  crate(wx + flip * 58, 1700, 0.95, '#7a4a20');
  const sg = ctx.createLinearGradient(0, gy - 60, 0, gy + 300);
  sg.addColorStop(0, 'rgba(255,190,100,0.35)'); sg.addColorStop(1, 'rgba(255,190,100,0)');
  ctx.fillStyle = sg; D.poly(ctx, [[700, gy], [1460, gy], [1620, gy + 300], [540, gy + 300]]); ctx.fill();
  crate(560, gy, 1.15); crate(560, gy - 76, 1.15, '#75501f'); crate(648, gy, 1.0, '#75501f');
  return gy;
}
function roadBand(gy, f, speed = 0) {
  ctx.fillStyle = '#1d1a24'; ctx.fillRect(-400, gy, 2960, 560);
  ctx.fillStyle = '#262230'; ctx.fillRect(-400, gy, 2960, 14);
  ctx.fillStyle = 'rgba(240,240,220,0.45)';
  const off = (f * speed) % 260;
  for (let x = -400 - off; x < 2600; x += 260) ctx.fillRect(x, gy + 250, 130, 13);
  // wet-road reflections of the lamps
  ctx.fillStyle = 'rgba(255,214,120,0.06)'; ctx.fillRect(-400, gy + 20, 2960, 90);
}

// ===== V2: Baal-style character (original rig) =====
const HERO_P = { shirt: '#f2b705', shirtD: '#cf9604', pants: '#6e5136', skin: '#c98a54', hairC: '#20242c' };
const WORKER_P = { shirt: '#2e7d46', shirtD: '#226636', pants: '#33415c', skin: '#a06a38', hairC: '#14161a' };
const SHOP_P = { shirt: '#8a3324', shirtD: '#6e271c', pants: '#3c3630', skin: '#b57e46', hairC: '#1c1712' };
function heroFig(x, y, sc, o = {}, f = 0) {
  const P = o.preset || HERO_P;
  D.drawHero(ctx, { x, y, s: sc, _t: f,
    shirt: P.shirt, shirtD: P.shirtD, pants: P.pants, noTie: true, skin: P.skin, hairC: P.hairC,
    expr: o.expr || 'calm', blink: D.blinkAt(f, o.seed || 5), wink: !!o.wink,
    armL: o.armL || 'down', armR: o.armR || 'down', face: o.face || 0,
    sweat: !!o.sweat, headDip: o.headDip || 0, walk: o.walk !== undefined ? o.walk : null,
    prop: o.prop || null, phoneMode: o.phoneMode || 'credit' });
}
function seatedFig(x, y, sc, o = {}, f = 0) {
  const P = o.preset || HERO_P;
  D.drawHeroSitting(ctx, { x, y, s: sc, _t: f,
    expr: o.expr || 'calm', blink: D.blinkAt(f, o.seed || 8),
    shirt: P.shirt, shirtD: P.shirtD, pants: P.pants, skin: P.skin, hairC: P.hairC,
    slump: o.slump || 0, armMode: o.armMode || 'knees', tear: !!o.tear, face: o.face || 0, headDip: o.headDip || 0 });
}
function boardSign(x, y, w, h, lines, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.strokeStyle = '#3a2a16'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(-w / 2 + 40, -h / 2 - 54); ctx.lineTo(0, -h / 2 - 6); ctx.moveTo(w / 2 - 40, -h / 2 - 54); ctx.lineTo(0, -h / 2 - 6); ctx.stroke();
  ctx.fillStyle = '#f5edd8'; D.rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  lines.forEach((ln, i) => text(ln[0], 0, (i - (lines.length - 1) / 2) * (h * 0.52), ln[1], ln[2]));
  ctx.restore();
}

// ---------------- Free Car extra helpers ----------------
function vgrad(y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  ctx.fillStyle = g; ctx.fillRect(-800, y0, 3760, y1 - y0);
}
function warmTint(a) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(255,170,60,${a})`; ctx.fillRect(0, 0, W, H); }
const BOSS_P = { shirt: '#2b3a55', shirtD: '#1d2940', pants: '#22242c', skin: '#b57e46', hairC: '#101216' };
const COLL_P = { shirt: '#3f7d5d', shirtD: '#2f6249', pants: '#3c3630', skin: '#a06a38', hairC: '#1c1712' };
// Bank app phone (bada, center me dikhane ke liye). stage: 0=salary, 1=kist kat gayi, 2=agli kist
function bankApp(x, y, w, h, stage, pop = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop);
  ctx.fillStyle = '#14181f'; D.rr(ctx, -w / 2, -h / 2, w, h, 36); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#fdf6e3'; D.rr(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 26); ctx.fill();
  ctx.fillStyle = '#1d4e79'; D.rr(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, 92, 26); ctx.fill();
  ctx.fillStyle = '#fdf6e3'; ctx.fillRect(-w / 2 + 14, -h / 2 + 66, w - 28, 40);
  text('MY BANK', 0, -h / 2 + 60, 44, '#ffffff');
  text('Balance', 0, -h / 2 + 170, 40, '#6b6252');
  if (stage === 0) {
    text('SALARY AAYI ✓', 0, -h / 2 + 300, 62, '#0c831f');
    text('aaj subah 9:04', 0, -h / 2 + 372, 34, '#8a8172');
  } else {
    ctx.fillStyle = 'rgba(200,40,40,0.10)'; D.rr(ctx, -w / 2 + 40, -h / 2 + 218, w - 80, 128, 14); ctx.fill();
    ctx.strokeStyle = '#c62828'; ctx.lineWidth = 4; D.rr(ctx, -w / 2 + 40, -h / 2 + 218, w - 80, 128, 14); ctx.stroke();
    text(stage === 2 ? 'KIST PHIR KATI' : 'CAR KIST (EMI)', 0, -h / 2 + 262, 40, '#8a1f1f');
    text('-₹12,000', 0, -h / 2 + 322, 64, '#c62828');
    text('SALARY AAYI ✓', 0, -h / 2 + 420, 40, '#0c831f');
  }
  ctx.restore();
}
// Side-view cartoon car. Ground y. opts: ribbon, col, t (wheel spin), tag (mirror tag text)
function carSide(x, y, s, col, t = 0, opts = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  D.softShadow(ctx, 0, 6, 300, 26, 0.30);
  for (const wx of [-168, 168]) {
    D.circ(ctx, wx, -46, 47); D.fillStroke(ctx, '#1c1f26', 6);
    ctx.strokeStyle = '#9aa2af'; ctx.lineWidth = 6;
    for (let k = 0; k < 3; k++) { const a = t + k * Math.PI / 3; ctx.beginPath(); ctx.moveTo(wx, -46); ctx.lineTo(wx + Math.cos(a) * 34, -46 + Math.sin(a) * 34); ctx.stroke(); }
    D.circ(ctx, wx, -46, 11); ctx.fillStyle = '#c8cdd6'; ctx.fill();
  }
  D.poly(ctx, [[-292, -52], [-284, -118], [-150, -132], [-96, -208], [64, -208], [128, -136], [268, -124], [292, -88], [288, -52]]); D.fillStroke(ctx, col, 6);
  D.poly(ctx, [[-84, -142], [-52, -196], [52, -196], [104, -142]]); D.fillStroke(ctx, '#bfe0ee', 5);
  D.poly(ctx, [[-196, -142], [-140, -196], [-66, -196], [-96, -142]]); D.fillStroke(ctx, '#bfe0ee', 5);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-270, -108, 540, 12);
  D.circ(ctx, 268, -102, 13); ctx.fillStyle = '#ffe9a8'; ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#8a1f1f'; ctx.fillRect(-292, -96, 12, 22);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(28, -128); ctx.lineTo(74, -128); ctx.stroke();
  if (opts.ribbon) {
    ctx.fillStyle = '#d81b60';
    D.poly(ctx, [[-40, -128], [-118, -196], [-96, -118]]); ctx.fill();
    D.poly(ctx, [[40, -128], [118, -196], [96, -118]]); ctx.fill();
    D.circ(ctx, 0, -126, 17); D.fillStroke(ctx, '#ad1457', 4);
  }
  if (opts.tag) {
    ctx.save(); ctx.translate(120, -196); ctx.rotate(Math.sin(t * 0.4) * 0.14);
    ctx.strokeStyle = '#6b6252'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, 44); ctx.stroke();
    ctx.fillStyle = '#f5edd8'; D.rr(ctx, -62, 42, 148, 62, 8); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    text(opts.tag, 12, 74, 36, '#8a1f1f');
    ctx.restore();
  }
  ctx.restore();
}
function keyDraw(x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  D.circ(ctx, -26, 0, 20); ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 9; ctx.stroke();
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(46, 0); ctx.moveTo(30, 0); ctx.lineTo(30, 16); ctx.moveTo(44, 0); ctx.lineTo(44, 13); ctx.stroke();
  ctx.restore();
}
function mithaasBox(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#e8b64c'; D.rr(ctx, -70, -26, 140, 66, 8); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#c62828'; ctx.fillRect(-70, -26, 140, 16);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { D.circ(ctx, -38 + i * 38, 2 + j * 22, 10); ctx.fillStyle = '#fdf6e3'; ctx.fill(); ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 2.5; ctx.stroke(); }
  ctx.restore();
}
function deskSet(gy, wallCol = '#31435f') {
  vgrad(-400, 2500, [[0, wallCol], [1, D.shadeC(wallCol, 1.25)]]);
  ctx.fillStyle = '#5d4630'; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(-800, gy, 3760, 10);
}
function officeWall(gy) {
  vgrad(-400, 2500, [[0, '#3d4c63'], [1, '#54678a']]);
  ctx.fillStyle = '#4a3b2c'; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  for (let i = 0; i < 5; i++) {
    const wx = -300 + i * 620;
    ctx.fillStyle = '#cfe4f2'; D.rr(ctx, wx, 300, 380, 460, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#8fb6cc'; ctx.fillRect(wx + 14, 500, 352, 8);
  }
}

// ===== A1 (0-59) — salary wala din, subah ghar par =====

// ---------------- Bank Paisa helpers ----------------
const CASH_P = { shirt: '#31517a', shirtD: '#243d5e', pants: '#2a2d34', skin: '#b57e46', hairC: '#101216' };
const SURESH_P = { shirt: '#3f7d5d', shirtD: '#2f6249', pants: '#3c3630', skin: '#a06a38', hairC: '#1c1712' };
function noteDraw(x, y, s, rot, glow) {
  rot = rot || 0; glow = glow || 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (glow > 0) lampPool(0, 0, 170, 0.4 * glow);
  ctx.fillStyle = '#7fae5a'; D.rr(ctx, -95, -42, 190, 84, 8); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#a8cc82'; D.rr(ctx, -80, -29, 160, 58, 6); ctx.fill();
  D.circ(ctx, 0, 0, 23); ctx.fillStyle = '#eef7dd'; ctx.fill(); ctx.strokeStyle = '#5d8440'; ctx.lineWidth = 3; ctx.stroke();
  text('₹100', 0, 2, 27, '#2f5220');
  ctx.fillStyle = '#5d8440'; ctx.fillRect(-80, -29, 18, 58); ctx.fillRect(62, -29, 18, 58);
  ctx.restore();
}
function bundleDraw(x, y, s, rot) {
  rot = rot || 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#8fb96a' : '#7fae5a'; D.rr(ctx, -100, -56 + i * 26, 200, 24, 5); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke(); }
  ctx.fillStyle = '#c62828'; ctx.fillRect(-16, -58, 32, 108);
  text('₹900', 0, -66, 34, '#8a1f1f');
  ctx.restore();
}
function bankHall(gy) {
  vgrad(-400, 2600, [[0, '#22455e'], [1, '#3a688a']]);
  for (const px of [-420, 240, 900, 1560, 2220]) {
    ctx.fillStyle = '#2c546f'; ctx.fillRect(px, 240, 120, gy - 240);
    ctx.fillStyle = '#35637f'; ctx.fillRect(px, 240, 26, gy - 240);
    ctx.fillStyle = '#d9b45c'; ctx.fillRect(px - 8, 224, 136, 22);
  }
  ctx.fillStyle = '#77572f'; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  ctx.fillStyle = 'rgba(255,230,160,0.10)'; ctx.fillRect(-800, gy, 3760, 12);
  for (let i = 0; i < 7; i++) { ctx.fillStyle = 'rgba(0,0,0,0.10)'; ctx.fillRect(-700 + i * 480, gy + 130, 300, 8); }
  boardSign(1080, 620, 640, 160, [['BANK', 92, '#7a4d12']]);
}
function bankCounter(gy) {
  ctx.fillStyle = 'rgba(190,225,245,0.30)'; D.rr(ctx, 330, gy - 560, 1500, 300, 8); ctx.fill(); ctx.strokeStyle = 'rgba(230,245,255,0.55)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#7a4d2a'; D.rr(ctx, 300, gy - 270, 1560, 270, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#96682f'; ctx.fillRect(300, gy - 270, 1560, 34);
  text('CASH COUNTER', 1080, gy - 330, 40, '#eaf4fb');
}
function dukaanSet(gy) {
  vgrad(-400, 2600, [[0, '#5e4630'], [1, '#8a6a42']]);
  ctx.fillStyle = '#4c3823'; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  ctx.fillStyle = '#6e5136'; ctx.fillRect(240, gy - 780, 1680, 780);
  for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) {
    const jx = 420 + i * 260, jy = gy - 700 + r * 190;
    ctx.fillStyle = ['#c96f2e', '#7fae5a', '#c9a227', '#8a3324', '#31517a', '#a8cc82'][(i + r * 2) % 6];
    D.rr(ctx, jx, jy, 92, 130, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#e8dcc0'; ctx.fillRect(jx + 12, jy + 44, 68, 34);
  }
  for (let i = 0; i < 9; i++) { ctx.fillStyle = i % 2 ? '#c62828' : '#f5edd8'; ctx.beginPath(); ctx.moveTo(200 + i * 210, gy - 860); ctx.lineTo(305 + i * 210, gy - 860); ctx.lineTo(268 + i * 210, gy - 770); ctx.lineTo(238 + i * 210, gy - 770); ctx.closePath(); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke(); }
  boardSign(1080, 470, 700, 150, [['KIRANA STORE', 64, '#7a4d12']]);
}
function shopCounter() {
  ctx.fillStyle = '#5d4023'; D.rr(ctx, 1140, 2080, 600, 320, 8); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#7a5327'; ctx.fillRect(1120, 2052, 640, 34);
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(1140, 2080, 600, 12);
}
function passbook(x, y, s, rot) {
  rot = rot || 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = '#274b8f'; D.rr(ctx, -62, -84, 124, 168, 8); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#f5edd8'; D.rr(ctx, -46, -58, 92, 62, 4); ctx.fill();
  text('PASS', 0, -40, 26, '#274b8f'); text('BOOK', 0, -12, 26, '#274b8f');
  ctx.fillStyle = '#d9c98f'; ctx.fillRect(-46, 24, 92, 10); ctx.fillRect(-46, 46, 92, 10);
  ctx.restore();
}
function coinStack(x, gy, n, tag, tagCol) {
  for (let i = 0; i < n; i++) {
    const cy = gy - 14 - i * 24, wob = (i % 2 ? 5 : -5);
    D.circ(ctx, x + wob, cy, 30); ctx.fillStyle = '#e8b64c'; ctx.fill(); ctx.strokeStyle = '#9a7414'; ctx.lineWidth = 4; ctx.stroke();
    text('₹', x + wob, cy + 2, 30, '#7a4d12');
  }
  if (tag) text(tag, x, gy - n * 24 - 66, 54, tagCol || '#ffe9a8');
}
function pressDraw(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#3a3f4a'; D.rr(ctx, -120, -70, 240, 150, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  D.circ(ctx, -52, -6, 40); ctx.fillStyle = '#8b93a1'; ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  D.circ(ctx, 52, -6, 40); ctx.fillStyle = '#8b93a1'; ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#e8e2d2'; D.rr(ctx, -105, -128, 210, 44, 8); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  D.circ(ctx, -105, -106, 15); ctx.fillStyle = '#c9c2ae'; ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 3; ctx.stroke();
  D.circ(ctx, 105, -106, 15); ctx.fill();
  const off = (t * 60) % 46;
  for (let i = 0; i < 3; i++) { ctx.fillStyle = '#a8cc82'; ctx.fillRect(-40 + off + i * 4, 84 + i * 30, 150, 25); ctx.strokeStyle = '#5d8440'; ctx.lineWidth = 2; ctx.strokeRect(-40 + off + i * 4, 84 + i * 30, 150, 25); }
  text('₹100', 35 + off, 97, 24, '#2f5220');
  ctx.restore();
}
function bubble(x, y, r, fn) {
  ctx.save();
  ctx.fillStyle = 'rgba(245,250,255,0.92)'; D.circ(ctx, x, y, r); ctx.fill(); ctx.strokeStyle = '#9db8cc'; ctx.lineWidth = 5; ctx.stroke();
  D.circ(ctx, x - r * 0.55, y + r * 0.95, r * 0.20); ctx.fillStyle = 'rgba(245,250,255,0.92)'; ctx.fill(); ctx.stroke();
  D.circ(ctx, x - r * 0.75, y + r * 1.22, r * 0.11); ctx.fill();
  ctx.beginPath(); D.circ(ctx, x, y, r - 6); ctx.clip(); fn(); ctx.restore();
}
function bigQ(x, y, s, col, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(s, s);
  text('?', 0, 0, 120, col || '#ffd94d');
  ctx.restore();
}

// ---------------- shots ----------------
const GY = 2400;
// S1 (0-76) L1: hero bank me sau jama karta hai
shot(0, 77, 0.26, { cx: 1080, cy: 1500, s: 0.62 }, { cx: 1080, cy: 1480, s: 0.72 }, (f, u) => {
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    seatedFig(1330, 2330, 1.55, { preset: CASH_P, expr: 'calm', seed: 3 }, f);
    bankCounter(GY);
    heroFig(740, GY, 1.85, { expr: 'calm', armR: 'offer', seed: 5 }, f);
    const t = D.clamp((f - 34) / 22, 0, 1), e = sstep(t);
    if (t < 1) noteDraw(D.lerp(905, 1240, e), D.lerp(1980, 1960, e) - Math.sin(e * Math.PI) * 60, 0.9, Math.sin(f * 0.1) * 0.05, 0.4);
  });
}, [58]);
// S2 (77-121) L2a: cashier kisi aur ko nau sau ka bundle deta hai
shot(77, 122, 0.28, { cx: 1230, cy: 1500, s: 0.85 }, { cx: 1230, cy: 1480, s: 0.97 }, (f, u) => {
  f -= 77;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    seatedFig(1010, 2330, 1.55, { preset: CASH_P, expr: 'calm', seed: 3 }, f);
    bankCounter(GY);
    heroFig(1500, GY, 1.9, { preset: WORKER_P, expr: 'happy', armR: 'catch', seed: 7 }, f);
    const p = spring(D.clamp((f - 8) / 12, 0, 1));
    ctx.save(); ctx.translate(1335, 1930); ctx.scale(p, p); ctx.translate(-1335, -1930);
    bundleDraw(1335, 1930, 1.15, Math.sin(f * 0.08) * 0.04); ctx.restore();
  });
}, [100]);
// S3 (122-166) L2b: hero bundle dekh kar chaunkta hai
shot(122, 167, 0.3, { cx: 900, cy: 1460, s: 0.9 }, { cx: 890, cy: 1450, s: 1.02 }, (f, u) => {
  f -= 122;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    heroFig(880, GY, 1.95, { expr: f > 14 ? 'shocked' : 'calm', armR: f > 14 ? 'up' : 'down', face: 0.7, seed: 5 }, f);
    bundleDraw(1560, 1750, 0.8, 0.06);
    if (f > 14) D.drawQuestion(ctx, 640, 1560, 0.8, f);
  });
}, [140]);
// S4 (167-199) L3a: RUKO — hero close-up
shot(167, 200, 0.32, { cx: 1080, cy: 1470, s: 1.06 }, { cx: 1080, cy: 1455, s: 1.2 }, (f, u) => {
  f -= 167;
  layer(0.4, () => vgrad(-400, 2600, [[0, '#3a2c14'], [1, '#6b5322']]));
  layer(1, () => {
    heroFig(1080, GY, 2.5, { expr: 'shocked', armL: 'up', armR: 'up', seed: 5 }, f);
    text('RUKO!', 1080, 1180, 92, '#ffd94d');
  });
}, [170]);
// S5 (200-247) L3b: nau sau aaye kahan se?
shot(200, 248, 0.28, { cx: 1080, cy: 1450, s: 0.95 }, { cx: 1080, cy: 1440, s: 1.04 }, (f, u) => {
  f -= 200;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    heroFig(1080, GY, 2.0, { expr: 'puzzled', armL: 'scratch', face: Math.sin(f * 0.05) * 0.4, seed: 5 }, f);
    noteDraw(760, 1420, 0.85, -0.08, 0.3);
    bundleDraw(1420, 1400, 0.95, 0.05);
    D.drawQuestion(ctx, 1080, 1150, 1.0, f);
  });
}, []);
// S6 (248-303) L4: uske paas to sirf tumhare sau the
shot(248, 304, 0.28, { cx: 1020, cy: 1480, s: 0.95 }, { cx: 1010, cy: 1470, s: 1.06 }, (f, u) => {
  f -= 248;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    heroFig(1010, GY, 2.05, { expr: 'worried', armR: 'up', seed: 5 }, f);
    noteDraw(1215, 1560, 1.25, 0.1 + Math.sin(f * 0.07) * 0.05, 0.85);
    text('SIRF ₹100', 1215, 1395, 52, '#ffe9a8');
  });
}, []);
// S7 (304-371) L5: kya bank paisa chhaap raha hai? (soch wala bubble)
shot(304, 372, 0.28, { cx: 1080, cy: 1420, s: 0.85 }, { cx: 1080, cy: 1410, s: 0.93 }, (f, u) => {
  f -= 304;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    heroFig(900, GY, 1.95, { expr: 'puzzled', armL: 'scratch', face: -0.5, seed: 5 }, f);
    bubble(1330, 1330, 300, () => { pressDraw(1330, 1300, 1.15, f); });
  });
}, []);
// S8 (372-442) L6: NAHI — haq sirf RBI ko hai
shot(372, 443, 0.3, { cx: 1080, cy: 1440, s: 0.9 }, { cx: 1080, cy: 1430, s: 0.99 }, (f, u) => {
  f -= 372;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    heroFig(880, GY, 2.0, { expr: 'angry', face: Math.sin(f * 0.55) * 0.22, seed: 5 }, f);
    bubble(1300, 1300, 290, () => { pressDraw(1300, 1270, 1.1, f); });
    ctx.strokeStyle = '#e53935'; ctx.lineWidth = 17; ctx.lineCap = 'round';
    const p = D.clamp((f - 6) / 8, 0, 1);
    ctx.beginPath(); ctx.moveTo(1090, 1090); ctx.lineTo(1090 + 420 * p, 1090 + 420 * p); ctx.stroke();
    if (p >= 1) { ctx.beginPath(); ctx.moveTo(1510, 1090); ctx.lineTo(1090, 1510); ctx.stroke(); }
    const sp = spring(D.clamp((f - 38) / 10, 0, 1));
    ctx.save(); ctx.translate(1560, 1980); ctx.scale(sp, sp); ctx.rotate(-0.06);
    ctx.fillStyle = '#f5edd8'; D.rr(ctx, -170, -95, 340, 190, 12); ctx.fill(); ctx.strokeStyle = '#8a1f1f'; ctx.lineWidth = 9; ctx.stroke();
    text('RBI', 0, -18, 88, '#8a1f1f'); text('SIRF RBI', 0, 52, 42, '#8a1f1f');
    ctx.restore();
  });
}, [412]);
// S9 (443-519) L7: to phir ye nau sau ka jaadu hua kaise?
shot(443, 520, 0.28, { cx: 1080, cy: 1460, s: 0.95 }, { cx: 1080, cy: 1445, s: 1.1 }, (f, u) => {
  f -= 443;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    heroFig(1080, GY, 2.1, { expr: 'puzzled', armR: 'up', seed: 5 }, f);
    noteDraw(1270, 1500, 1.3, Math.sin(f * 0.06) * 0.09, 1.0);
    D.drawSparkle(ctx, 950, 1330, 40, 0.8 + 0.2 * Math.sin(f * 0.2));
    D.drawSparkle(ctx, 1420, 1660, 30, 0.7);
    D.drawQuestion(ctx, 820, 1200, 0.85, f);
    D.drawQuestion(ctx, 1400, 1120, 0.6, f + 26);
  });
}, []);
// S10 (520-574) L8a: jawab itna seedha hai
shot(520, 575, 0.26, { cx: 1080, cy: 1480, s: 1.0 }, { cx: 1080, cy: 1470, s: 1.11 }, (f, u) => {
  f -= 520;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    heroFig(1080, GY, 2.15, { expr: 'smug', wink: f > 20 && f < 34, armR: 'point', seed: 5 }, f);
  });
}, []);
// S11 (575-639) L8b: sun kar kahoge — itna aasan tha?
shot(575, 640, 0.26, { cx: 1080, cy: 1480, s: 1.0 }, { cx: 1080, cy: 1470, s: 1.08 }, (f, u) => {
  f -= 575;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    heroFig(1080, GY, 2.15, { expr: f < 30 ? 'happy' : 'surprise', headDip: f < 30 ? Math.abs(Math.sin(f * 0.3)) * 0.12 : 0, armL: 'down', armR: 'down', seed: 5 }, f);
    if (f >= 30) D.drawQuestion(ctx, 1330, 1300, 0.8, f);
  });
}, []);
// S12 (640-705) L9: SUNO — tumne sau bank me rakhe (flashback)
shot(640, 706, 0.26, { cx: 1080, cy: 1500, s: 0.66 }, { cx: 1090, cy: 1485, s: 0.76 }, (f, u) => {
  f -= 640;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    seatedFig(1330, 2330, 1.55, { preset: CASH_P, expr: 'calm', seed: 3 }, f);
    bankCounter(GY);
    heroFig(740, GY, 1.85, { expr: 'calm', armR: 'offer', seed: 5 }, f);
    const t = D.clamp((f - 18) / 26, 0, 1), e = sstep(t);
    noteDraw(D.lerp(905, 1255, e), D.lerp(1980, 2050, e), 0.9, 0, 0.55);
  });
  warmTint(0.10);
}, []);
// S13 (706-789) L10: bank ne wahi sau Ramesh ko karz diye
shot(706, 790, 0.26, { cx: 1150, cy: 1490, s: 0.78 }, { cx: 1150, cy: 1475, s: 0.88 }, (f, u) => {
  f -= 706;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    seatedFig(950, 2330, 1.55, { preset: CASH_P, expr: 'calm', seed: 3 }, f);
    bankCounter(GY);
    heroFig(1420, GY, 1.9, { preset: WORKER_P, expr: 'happy', armR: 'catch', seed: 7 }, f);
    const t = D.clamp((f - 22) / 30, 0, 1), e = sstep(t);
    if (t > 0 && t < 1) noteDraw(D.lerp(1060, 1300, e), D.lerp(1980, 1930, e) - Math.sin(e * Math.PI) * 130, 1.0, Math.sin(e * 6) * 0.15, 1.0);
    if (t >= 1) noteDraw(1300, 1930, 1.0, 0.05, 0.8);
  });
}, [762]);
// S14 (790-844) L11a: Ramesh dukaan aata hai
shot(790, 845, 0.26, { cx: 1080, cy: 1500, s: 0.66 }, { cx: 1100, cy: 1490, s: 0.75 }, (f, u) => {
  f -= 790;
  layer(0.55, () => dukaanSet(GY));
  layer(1, () => {
    heroFig(1440, GY, 1.8, { preset: SHOP_P, expr: 'calm', seed: 9 }, f);
    shopCounter();
    const wx = D.lerp(560, 900, sstep(D.clamp(f / 44, 0, 1)));
    heroFig(wx, GY, 1.85, { preset: WORKER_P, expr: 'happy', walk: f * 0.35, seed: 7 }, f);
    noteDraw(wx + 165, 1985, 0.85, 0.08, 0.7);
  });
}, []);
// S15 (845-904) L11b+L12a: Ramesh saaman leta hai, note dukandar ko
shot(845, 905, 0.26, { cx: 1120, cy: 1490, s: 0.8 }, { cx: 1120, cy: 1480, s: 0.9 }, (f, u) => {
  f -= 845;
  layer(0.55, () => dukaanSet(GY));
  layer(1, () => {
    heroFig(1440, GY, 1.8, { preset: SHOP_P, expr: 'happy', seed: 9 }, f);
    shopCounter();
    heroFig(880, GY, 1.9, { preset: WORKER_P, expr: 'happy', armR: 'offer', seed: 7 }, f);
    const t = D.clamp((f - 10) / 22, 0, 1), e = sstep(t);
    if (t < 1) noteDraw(D.lerp(1045, 1300, e), D.lerp(1980, 1990, e) - Math.sin(e * Math.PI) * 50, 0.9, 0, 0.8);
    if (t >= 1) noteDraw(1300, 1990, 0.9, 0, 0.5);
    if (f > 34) crate(760, 2230, 1.15);
  });
}, [880]);
// S16 (905-977) L12b: dukandar wahi note phir bank me jama karta hai
shot(905, 978, 0.26, { cx: 1000, cy: 1500, s: 0.64 }, { cx: 1120, cy: 1485, s: 0.74 }, (f, u) => {
  f -= 905;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    seatedFig(1400, 2330, 1.55, { preset: CASH_P, expr: 'calm', seed: 3 }, f);
    bankCounter(GY);
    const wx = D.lerp(620, 860, sstep(D.clamp(f / 40, 0, 1)));
    heroFig(wx, GY, 1.85, { preset: SHOP_P, expr: 'calm', walk: f < 42 ? f * 0.35 : null, armR: f >= 42 ? 'offer' : 'down', seed: 9 }, f);
    if (f < 42) noteDraw(wx + 165, 1985, 0.85, 0.06, 0.7);
    if (f >= 42) { const t = D.clamp((f - 44) / 20, 0, 1), e = sstep(t); if (t < 1) noteDraw(D.lerp(1025, 1310, e), D.lerp(1980, 2040, e), 0.9, 0, 0.9); }
  });
}, []);
// S17 (978-1067) L13: bank wahi paisa Suresh ko karz deta hai
shot(978, 1068, 0.26, { cx: 1150, cy: 1490, s: 0.78 }, { cx: 1150, cy: 1475, s: 0.88 }, (f, u) => {
  f -= 978;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    seatedFig(950, 2330, 1.55, { preset: CASH_P, expr: 'calm', seed: 3 }, f);
    bankCounter(GY);
    heroFig(1420, GY, 1.9, { preset: SURESH_P, expr: 'happy', armR: 'catch', seed: 11 }, f);
    const t = D.clamp((f - 24) / 30, 0, 1), e = sstep(t);
    if (t > 0 && t < 1) noteDraw(D.lerp(1060, 1300, e), D.lerp(1980, 1930, e) - Math.sin(e * Math.PI) * 130, 1.0, Math.sin(e * 6) * 0.15, 1.0);
    if (t >= 1) noteDraw(1300, 1930, 1.0, 0.05, 0.8);
  });
}, [1035]);
// S18 (1068-1115) L14: Samjhe? Paisa ek hi hai — sau rupaye
shot(1068, 1116, 0.26, { cx: 1080, cy: 1500, s: 0.8 }, { cx: 1080, cy: 1490, s: 0.89 }, (f, u) => {
  f -= 1068;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    heroFig(700, GY, 1.6, { preset: WORKER_P, expr: 'happy', seed: 7 }, f);
    heroFig(1470, GY, 1.6, { preset: SHOP_P, expr: 'happy', seed: 9 }, f);
    heroFig(1080, GY, 2.1, { expr: 'smug', armR: 'up', seed: 5 }, f);
    noteDraw(1245, 1470, 1.35, Math.sin(f * 0.07) * 0.06, 1.0);
    text('PAISA EK HI HAI!', 1080, 1150, 56, '#ffe9a8');
  });
}, []);
// S19 (1116-1208) L15: ghoom-ghoom kar teen logo ka kaam kar gaya
shot(1116, 1209, 0.26, { cx: 1080, cy: 1470, s: 0.78 }, { cx: 1080, cy: 1460, s: 0.85 }, (f, u) => {
  f -= 1116;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    heroFig(640, GY, 1.65, { preset: WORKER_P, expr: 'happy', armR: f > 8 && f < 30 ? 'up' : 'down', seed: 7 }, f);
    heroFig(1080, GY, 1.65, { preset: SHOP_P, expr: 'happy', armR: f > 34 && f < 56 ? 'up' : 'down', seed: 9 }, f);
    heroFig(1520, GY, 1.65, { preset: SURESH_P, expr: 'happy', armR: f > 60 && f < 84 ? 'up' : 'down', seed: 11 }, f);
    ctx.strokeStyle = 'rgba(255,233,168,0.5)'; ctx.lineWidth = 5; ctx.setLineDash([16, 14]);
    ctx.beginPath(); ctx.ellipse(1080, 1560, 470, 150, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    const a = -Math.PI / 2 + (f / 88) * Math.PI * 2;
    noteDraw(1080 + Math.cos(a) * 470, 1560 + Math.sin(a) * 150, 1.05, Math.sin(a) * 0.3, 1.0);
  });
}, []);
// S20 (1209-1279) L16a: bank paisa banata NAHI hai
shot(1209, 1280, 0.28, { cx: 1080, cy: 1440, s: 0.9 }, { cx: 1080, cy: 1430, s: 0.99 }, (f, u) => {
  f -= 1209;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    heroFig(880, GY, 2.0, { expr: 'angry', face: Math.sin(f * 0.5) * 0.22, seed: 5 }, f);
    bubble(1300, 1300, 280, () => { pressDraw(1300, 1270, 1.05, f); });
    ctx.strokeStyle = '#e53935'; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(1100, 1100); ctx.lineTo(1500, 1500); ctx.moveTo(1500, 1100); ctx.lineTo(1100, 1500); ctx.stroke();
    text('BANATA NAHI!', 880, 1180, 58, '#ffd94d');
  });
}, []);
// S21 (1280-1349) L16b: bank paisa GHUMATA hai
shot(1280, 1350, 0.26, { cx: 1080, cy: 1480, s: 1.0 }, { cx: 1080, cy: 1470, s: 1.1 }, (f, u) => {
  f -= 1280;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    heroFig(1080, GY, 2.15, { expr: 'smug', armR: 'up', seed: 5 }, f);
    const a = f * 0.16;
    ctx.strokeStyle = 'rgba(255,233,168,0.45)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.ellipse(1252, 1470, 105, 105, 0, 0, Math.PI * 2); ctx.stroke();
    noteDraw(1252 + Math.cos(a) * 105, 1470 + Math.sin(a) * 105, 0.95, a * 0.4, 1.0);
    text('GHUMATA HAI!', 1080, 1150, 58, '#ffe9a8');
  });
}, []);
// S22 (1350-1439) L17: beech me bank apna khel khel jata hai
shot(1350, 1440, 0.28, { cx: 1080, cy: 1480, s: 0.84 }, { cx: 1080, cy: 1470, s: 0.92 }, (f, u) => {
  f -= 1350;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    seatedFig(1200, 2330, 1.7, { preset: BOSS_P, expr: 'smug', armMode: 'gesture', seed: 4 }, f);
    bankCounter(GY);
    coinStack(905, 2130, 3, null);
    coinStack(1560, 2130, 4, null);
    heroFig(700, GY, 1.75, { expr: 'puzzled', face: 0.8, seed: 5 }, f);
  });
}, []);
// S23 (1440-1517) L18: tumhe chhah rupaya byaaj milta hai
shot(1440, 1518, 0.28, { cx: 1080, cy: 1500, s: 0.95 }, { cx: 1080, cy: 1490, s: 1.05 }, (f, u) => {
  f -= 1440;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    seatedFig(1330, 2330, 1.55, { preset: CASH_P, expr: 'calm', seed: 3 }, f);
    bankCounter(GY);
    heroFig(740, GY, 1.9, { expr: f > 44 ? 'sad' : 'calm', seed: 5 }, f);
    if (f > 30) coinStack(905, 2130, 2, f > 44 ? '₹6' : null, '#ffd94d');
    passbook(620, 2240, 0.85, -0.1);
  });
}, [1472]);
// S24 (1518-1574) L19a: bank usi paise ko karz par dekar
shot(1518, 1575, 0.26, { cx: 1150, cy: 1490, s: 0.85 }, { cx: 1150, cy: 1480, s: 0.93 }, (f, u) => {
  f -= 1518;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    seatedFig(1050, 2330, 1.6, { preset: BOSS_P, expr: 'smug', armMode: 'gesture', seed: 4 }, f);
    bankCounter(GY);
    const n = 1 + Math.floor(D.clamp((f - 6) / 40, 0, 1) * 5);
    coinStack(1420, 2130, n, null);
  });
}, []);
// S25 (1575-1628) L19b: baarah rupaye kamata hai!
shot(1575, 1629, 0.26, { cx: 1150, cy: 1480, s: 0.9 }, { cx: 1150, cy: 1470, s: 1.0 }, (f, u) => {
  f -= 1575;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    seatedFig(1010, 2330, 1.6, { preset: BOSS_P, expr: 'happy', seed: 4 }, f);
    bankCounter(GY);
    coinStack(1400, 2130, 6, '₹12', '#ffd94d');
    heroFig(620, GY, 1.75, { expr: 'shocked', face: 0.8, seed: 5 }, f);
  });
}, [1585]);
// S26 (1629-1721) L20: aadha munafa — bina apna ek rupaya lagaye
shot(1629, 1722, 0.28, { cx: 1080, cy: 1490, s: 0.88 }, { cx: 1080, cy: 1480, s: 0.96 }, (f, u) => {
  f -= 1629;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    seatedFig(1080, 2330, 1.6, { preset: BOSS_P, expr: 'smug', seed: 4 }, f);
    bankCounter(GY);
    coinStack(760, 2130, 2, '₹6', '#c8cdd6');
    coinStack(1420, 2130, 6, '₹12', '#ffd94d');
    heroFig(1080, GY, 1.8, { expr: 'shocked', armL: 'up', armR: 'up', seed: 5 }, f);
    text('AADHA MUNAFA BANK KA!', 1080, 1230, 54, '#ffd94d');
  });
}, [1690]);
// S27 (1722-1789) L21a: isiliye bank ki building sabse badi hoti hai
shot(1722, 1790, 0.3, { cx: 1080, cy: 1950, s: 0.6 }, { cx: 1080, cy: 1250, s: 0.66 }, (f, u) => {
  f -= 1722;
  layer(0.3, () => { vgrad(-400, 2600, [[0, '#7fb2d9'], [1, '#cfe7f5']]); skyline(4, 2450, '#5b7d99', '#ffe9a8'); });
  layer(1, () => {
    ctx.fillStyle = '#8a6a42'; ctx.fillRect(-800, 2450, 3760, 1390);
    ctx.fillStyle = '#31517a'; D.rr(ctx, 480, 350, 1200, 2100, 14); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 7; ctx.stroke();
    for (let r = 0; r < 9; r++) for (let c = 0; c < 5; c++) { ctx.fillStyle = (r + c) % 3 ? '#bfe0ee' : '#ffe9a8'; ctx.fillRect(560 + c * 220, 640 + r * 190, 130, 110); }
    text('BANK', 1080, 500, 130, '#ffd94d');
    ctx.fillStyle = '#d9b45c'; ctx.fillRect(430, 300, 1300, 26);
    heroFig(1080, 2450, 0.62, { expr: 'surprise', face: -0.3, seed: 5 }, f);
  });
}, []);
// S28 (1790-1836) L21b: aur tumhari passbook sabse chhoti
shot(1790, 1837, 0.3, { cx: 1080, cy: 1500, s: 1.05 }, { cx: 1080, cy: 1490, s: 1.16 }, (f, u) => {
  f -= 1790;
  layer(0.4, () => vgrad(-400, 2600, [[0, '#2c3e55'], [1, '#47617f']]));
  layer(1, () => {
    heroFig(1080, GY, 2.2, { expr: f > 24 ? 'sad' : 'puzzled', headDip: 0.25, armL: 'hold', armR: 'hold', seed: 5 }, f);
    passbook(1080, 2010, 1.05, Math.sin(f * 0.05) * 0.04);
  });
}, []);
// S29 (1837-1910) L22a: ab tum batao — sulaoge?
shot(1837, 1911, 0.28, { cx: 1080, cy: 1490, s: 0.95 }, { cx: 1080, cy: 1480, s: 1.04 }, (f, u) => {
  f -= 1837;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    const bob = Math.sin(f * 0.09) * 14;
    heroFig(1080, GY, 2.1, { expr: 'calm', face: 0, seed: 5 }, f);
    passbook(830, 1900 + bob, 0.95, -0.06);
    noteDraw(1340, 1900 - bob, 1.15, 0.06, 0.7);
    text('AB TUM BATAO', 1080, 1180, 60, '#ffe9a8');
  });
}, []);
// S30 (1911-1988) L22b: ya use khud ghumana sikhoge? (loop ending)
shot(1911, 1988, 0.34, { cx: 1080, cy: 1490, s: 1.0 }, { cx: 1080, cy: 1480, s: 1.12 }, (f, u) => {
  f -= 1911;
  layer(0.55, () => bankHall(GY));
  layer(1, () => {
    heroFig(1080, GY, 2.15, { expr: 'smug', armL: 'up', armR: 'up', seed: 5 }, f);
    const a = f * 0.10;
    noteDraw(1080 + Math.cos(a) * 330, 1560 + Math.sin(a) * 120, 1.1, Math.sin(a) * 0.3, 1.0);
    if (f > 40) D.drawQuestion(ctx, 1080, 1130, 1.05, f);
  });
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
