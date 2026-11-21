// McDonald's Expose (EP-2) — kahani-style Short (1380 frames @30fps). Impossible sawal: khud burger beche bina sabse ameer khana company kaise?
// Jawab ghuma-ghuma kar: royalty ka dhokha -> asli number KIRAYA -> 1956 ka palat -> 82 vs 16 hisaab. Hisaab kahani ke andar.
// Harness: window.ready, window.renderFrame(f), window.TOTAL.
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import * as D from './draw.js';
import { ENV } from './envelope.js';

const W = 1080, H = 1920, TOTAL = 1487, FPS = 30;
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

// ---------------- WhatsApp helpers ----------------
function chatPhone(x, y, w, h, mode, pop, rows) {
  pop = pop || 1; rows = rows || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop);
  ctx.fillStyle = '#14181f'; D.rr(ctx, -w / 2, -h / 2, w, h, 40); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#e7dfd0'; D.rr(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 30); ctx.fill();
  ctx.fillStyle = '#075e54'; D.rr(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, 104, 30); ctx.fill();
  ctx.fillStyle = '#075e54'; ctx.fillRect(-w / 2 + 14, -h / 2 + 74, w - 28, 44);
  D.circ(ctx, -w / 2 + 74, -h / 2 + 66, 30); ctx.fillStyle = '#25d366'; ctx.fill(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.stroke();
  text('W', -w / 2 + 74, -h / 2 + 68, 36, '#ffffff');
  text('WhatsApp', -w / 2 + 124, -h / 2 + 68, 46, '#ffffff', 'left');
  const top = -h / 2 + 150;
  if (mode === 0) {
    const bw = w * 0.58;
    ctx.fillStyle = '#ffffff'; D.rr(ctx, -w / 2 + 44, top, bw, 74, 16); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#dcf8c6'; D.rr(ctx, w / 2 - 44 - bw, top + 100, bw, 74, 16); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffffff'; D.rr(ctx, -w / 2 + 44, top + 200, bw * 0.8, 74, 16); ctx.fill();
    ctx.fillStyle = 'rgba(20,24,31,0.25)';
    ctx.fillRect(-w / 2 + 66, top + 26, bw - 90, 12); ctx.fillRect(-w / 2 + 66, top + 48, bw - 140, 12);
    ctx.fillRect(w / 2 - 44 - bw + 22, top + 126, bw - 90, 12); ctx.fillRect(w / 2 - 44 - bw + 22, top + 148, bw - 170, 12);
    ctx.fillRect(-w / 2 + 66, top + 226, bw * 0.8 - 90, 12); ctx.fillRect(-w / 2 + 66, top + 248, bw * 0.8 - 150, 12);
  } else if (mode === 1) {
    const names = [['BANK', '#31517a'], ['AIRLINE', '#8a3324'], ['KHANA', '#c96f2e'], ['KAPDE', '#3f7d5d']];
    for (let i = 0; i < rows && i < 4; i++) {
      const ry = top + 16 + i * 108;
      ctx.fillStyle = '#ffffff'; D.rr(ctx, -w / 2 + 34, ry, w - 68, 92, 14); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 3; ctx.stroke();
      D.circ(ctx, -w / 2 + 92, ry + 46, 30); ctx.fillStyle = names[i][1]; ctx.fill();
      text(names[i][0][0], -w / 2 + 92, ry + 48, 34, '#ffffff');
      text(names[i][0], -w / 2 + 142, ry + 38, 38, '#26303a', 'left');
      ctx.fillStyle = 'rgba(20,24,31,0.30)'; ctx.fillRect(-w / 2 + 142, ry + 62, w * 0.34, 10);
      D.circ(ctx, w / 2 - 76, ry + 46, 17); ctx.fillStyle = '#25d366'; ctx.fill();
      text('1', w / 2 - 76, ry + 47, 22, '#ffffff');
    }
  } else if (mode === 2) {
    text('AD', 0, top + 30, 34, '#8a8172');
    ctx.fillStyle = '#ffffff'; D.rr(ctx, -w / 2 + 44, top + 60, w - 88, 190, 16); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = 'rgba(20,24,31,0.30)'; ctx.fillRect(-w / 2 + 70, top + 92, w - 190, 14); ctx.fillRect(-w / 2 + 70, top + 122, w - 250, 14);
    ctx.fillStyle = '#25d366'; D.rr(ctx, -w / 2 + 70, top + 168, w - 140, 62, 31); ctx.fill();
    text('MESSAGE KARO →', 0, top + 200, 40, '#ffffff');
  }
  ctx.restore();
}
function lockDraw(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#8a8f99'; ctx.lineWidth = 17;
  ctx.beginPath(); ctx.arc(0, -34, 44, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = '#e8b64c'; D.rr(ctx, -72, -36, 144, 118, 14); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  D.circ(ctx, 0, 16, 15); ctx.fillStyle = '#4a3a10'; ctx.fill();
  ctx.fillRect(-6, 22, 12, 26);
  ctx.restore();
}
const CROWD_COLS = [['#f2b705', '#cf9604'], ['#2e7d46', '#226636'], ['#8a3324', '#6e271c'], ['#31517a', '#243d5e'], ['#3f7d5d', '#2f6249'], ['#c96f2e', '#a5571f']];
function crowd(cx, gy, n, spread, f, seed, withPhones) {
  for (let i = 0; i < n; i++) {
    const fx = cx + (n === 1 ? 0 : (i / (n - 1) - 0.5) * spread) + Math.sin(i * 7.3 + seed) * 26;
    const row = i % 3, sc = 0.52 + row * 0.07, fy = gy - (i % 2) * 26;
    const c = CROWD_COLS[(i + seed) % CROWD_COLS.length];
    heroFig(fx, fy, sc, { preset: { shirt: c[0], shirtD: c[1], pants: '#3c3630', skin: ['#c98a54', '#a06a38', '#b57e46'][i % 3], hairC: '#20242c' },
      expr: i % 4 === 0 ? 'happy' : 'calm', seed: i + seed, armR: (withPhones && i % 2 === 0) ? 'phone' : 'down', armL: 'down' }, f + i * 13);
  }
}
function miniShop(x, gy, w, col, sign, signCol) {
  ctx.fillStyle = col; ctx.fillRect(x - w / 2, gy - 430, w, 430);
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x - w / 2, gy - 430, w, 18);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#c62828' : '#f5edd8'; ctx.beginPath(); ctx.moveTo(x - w / 2 + i * w / 6, gy - 430); ctx.lineTo(x - w / 2 + (i + 1) * w / 6, gy - 430); ctx.lineTo(x - w / 2 + (i + 0.82) * w / 6, gy - 356); ctx.lineTo(x - w / 2 + (i + 0.18) * w / 6, gy - 356); ctx.closePath(); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke(); }
  ctx.fillStyle = '#f5edd8'; D.rr(ctx, x - w / 2 + 26, gy - 560, w - 52, 104, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  text(sign, x, gy - 507, 52, signCol || '#7a4d12');
  ctx.fillStyle = 'rgba(255,240,200,0.85)'; ctx.fillRect(x - w / 2 + 40, gy - 300, w - 80, 130);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.strokeRect(x - w / 2 + 40, gy - 300, w - 80, 130);
}
function pinDraw(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = col || '#c62828';
  ctx.beginPath(); ctx.arc(0, -52, 58, Math.PI * 0.75, Math.PI * 2.05); ctx.lineTo(0, 74); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  D.circ(ctx, 0, -52, 27); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.stroke();
  ctx.restore();
}
function billDraw(x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(s, s);
  ctx.fillStyle = '#fdfaf2'; ctx.beginPath();
  ctx.moveTo(-64, -92); ctx.lineTo(64, -92); ctx.lineTo(64, 84);
  for (let i = 0; i < 6; i++) ctx.lineTo(64 - (i + 0.5) * 21.3, 96); ctx.lineTo(-64, 84); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  text('BILL', 0, -58, 30, '#8a1f1f');
  ctx.fillStyle = 'rgba(20,24,31,0.35)';
  for (let i = 0; i < 4; i++) ctx.fillRect(-44, -26 + i * 24, 88 - (i % 2) * 26, 9);
  ctx.restore();
}
function metaHall(gy) {
  vgrad(-400, 2600, [[0, '#2c3e55'], [1, '#48638a']]);
  ctx.fillStyle = '#22314a'; ctx.fillRect(240, 700, 1680, gy - 700);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
    ctx.fillStyle = (r * 7 + c) % 3 === 0 ? 'rgba(255,224,150,0.85)' : 'rgba(170,205,235,0.5)';
    ctx.fillRect(320 + c * 228, 800 + r * 268, 140, 170);
  }
  ctx.fillStyle = '#77572f'; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  boardSign(1080, 520, 600, 155, [['META', 92, '#31517a']]);
}
function homeRoom(gy) {
  vgrad(-400, 2600, [[0, '#6b4a2f'], [1, '#9a744a']]);
  ctx.fillStyle = '#f7d774'; D.rr(ctx, 1330, 420, 480, 560, 12); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#fff3c4'; ctx.fillRect(1352, 442, 436, 516);
  D.circ(ctx, 1560, 560, 58); ctx.fillStyle = '#ffb703'; ctx.fill();
  ctx.fillStyle = '#8a5a2b'; ctx.fillRect(1330, 680, 480, 14); ctx.fillRect(1562, 420, 14, 560);
  lampPool(1560, 700, 620, 0.22);
  ctx.fillStyle = '#54382a'; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  ctx.fillStyle = '#7a4a3a'; ctx.fillRect(120, gy - 190, 700, 190);
  ctx.fillStyle = '#96604a'; ctx.fillRect(120, gy - 190, 700, 34);
}
function bazaarBg(gy) {
  vgrad(-400, 2600, [[0, '#4a3560'], [1, '#8a5a7a']]);
  skyline(4, gy - 300, '#2c2140', '#ffd98a');
  ctx.fillStyle = '#3a2c30'; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  ctx.fillStyle = 'rgba(255,220,150,0.10)'; ctx.fillRect(-800, gy, 3760, 12);
}

// ---------------- McDonald's helpers ----------------
const MCD_RED = '#da291c', MCD_RED_D = '#a81c10', MCD_GOLD = '#ffc72c';
// Golden arches "M" sign. (x, y) = sign ka center; s = scale; glow 0..1
function arches(x, y, s, glow = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (glow > 0) lampPool(0, -6, 210, 0.38 * glow);
  ctx.strokeStyle = MCD_GOLD; ctx.lineWidth = 27; ctx.lineCap = 'round';
  for (const lx of [-88, 0, 88]) { ctx.beginPath(); ctx.moveTo(lx, 68); ctx.lineTo(lx, 22); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(-44, 22, 44, Math.PI, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(44, 22, 44, Math.PI, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(122,77,18,0.55)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(-44, 22, 55, Math.PI * 1.15, Math.PI * 1.5); ctx.stroke();
  ctx.beginPath(); ctx.arc(44, 22, 55, Math.PI * 1.5, Math.PI * 1.85); ctx.stroke();
  ctx.restore();
}
// McDonald's storefront. Building (cx, gy) ground par, width w. old=true -> 1956 wala faded look.
function mcdStore(cx, gy, w, old = false, glow = 0) {
  const wall = old ? '#b3a284' : '#f3e6cf', band = old ? '#8a4a3a' : MCD_RED, bandD = old ? '#74402f' : MCD_RED_D;
  const glass = old ? 'rgba(150,140,120,0.85)' : 'rgba(178,224,242,0.92)';
  ctx.fillStyle = wall; D.rr(ctx, cx - w / 2, gy - 690, w, 690, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = band; D.rr(ctx, cx - w / 2 - 22, gy - 782, w + 44, 96, 12); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = bandD; ctx.fillRect(cx - w / 2 - 22, gy - 700, w + 44, 14);
  text("McDonald's", cx, gy - 734, Math.min(62, w * 0.062), '#ffffff');
  // glass front + door + counter strip andar
  ctx.fillStyle = glass; D.rr(ctx, cx - w / 2 + 46, gy - 620, w - 92, 400, 8); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(cx - w / 2 + 70, gy - 600, 60, 360); ctx.fillRect(cx + 40, gy - 600, 34, 360);
  ctx.strokeStyle = 'rgba(38,34,31,0.5)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(cx, gy - 620); ctx.lineTo(cx, gy - 220); ctx.stroke();
  ctx.fillStyle = old ? '#6e5a41' : '#8a5a2b'; ctx.fillRect(cx - w / 2 + 46, gy - 300, w - 92, 80);
  ctx.fillStyle = 'rgba(255,220,150,0.5)'; ctx.fillRect(cx - w / 2 + 46, gy - 300, w - 92, 12);
  ctx.fillStyle = old ? '#7a6a50' : '#5d4630'; ctx.fillRect(cx - w / 2, gy - 220, w, 220);
  arches(cx, gy - 920, Math.min(1.25, w / 900), glow);
  if (old) { ctx.fillStyle = 'rgba(90,74,52,0.20)'; ctx.fillRect(cx - w / 2 - 30, gy - 800, w + 60, 800); }
}
// Chhoti McD dukaan (wide row shots ke liye). Ground (x, gy), scale s.
function miniMcd(x, gy, s, old = false) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  ctx.fillStyle = old ? '#b3a284' : '#f3e6cf'; D.rr(ctx, -165, -300, 330, 300, 8); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = old ? '#8a4a3a' : MCD_RED; D.rr(ctx, -178, -352, 356, 56, 9); ctx.fill(); ctx.stroke();
  ctx.fillStyle = old ? 'rgba(150,140,120,0.85)' : 'rgba(178,224,242,0.92)'; ctx.fillRect(-130, -270, 260, 170);
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.strokeRect(-130, -270, 260, 170);
  ctx.fillStyle = old ? '#7a6a50' : '#5d4630'; ctx.fillRect(-165, -100, 330, 100);
  arches(0, -448, 0.52, 0);
  ctx.restore();
}
// Burger prop (draw.js me food prop nahi hai). (x, y) = center, s = scale.
function burgerDraw(x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  D.softShadow(ctx, 0, 34, 62, 10, 0.22);
  ctx.fillStyle = '#e8a34c'; D.rr(ctx, -54, 8, 108, 22, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4.5; ctx.stroke(); // bottom bun
  ctx.fillStyle = '#6e4525'; D.rr(ctx, -58, -8, 116, 19, 9); ctx.fill(); ctx.stroke(); // patty
  ctx.fillStyle = '#f39c2c'; D.poly(ctx, [[-56, -12], [56, -12], [30, 4], [0, -6], [-30, 4]]); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 3.5; ctx.stroke(); // cheese
  ctx.fillStyle = '#57a047'; // lettuce (lehriya)
  ctx.beginPath(); ctx.moveTo(-58, -16);
  for (let i = 0; i < 6; i++) ctx.quadraticCurveTo(-58 + i * 19 + 9, -26 + (i % 2 ? 8 : -4), -58 + (i + 1) * 19, -16);
  ctx.lineTo(58, -8); ctx.lineTo(-58, -8); ctx.closePath(); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 3.5; ctx.stroke();
  ctx.fillStyle = '#f0b45c'; // top bun dome
  ctx.beginPath(); ctx.arc(0, -14, 56, Math.PI, Math.PI * 2); ctx.closePath(); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4.5; ctx.stroke();
  ctx.fillStyle = '#fdf3d0'; // til (sesame)
  for (const [sx, sy] of [[-30, -48], [-8, -60], [16, -52], [32, -38], [-20, -34], [4, -40]]) { ctx.save(); ctx.translate(sx, sy); ctx.rotate(sx * 0.04); D.ell(ctx, 0, 0, 5.5, 3.2); ctx.fill(); ctx.restore(); }
  ctx.restore();
}
// Gold-on-dark board (bade number reveals ke liye). boardSign jaisa hi format: lines = [text, px, color]
function darkBoard(x, y, w, h, lines, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  lampPool(0, 0, Math.max(w, h) * 0.95, 0.30);
  ctx.fillStyle = '#14100a'; D.rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.fill();
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 7; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,199,44,0.5)'; ctx.lineWidth = 2.5; D.rr(ctx, -w / 2 + 13, -h / 2 + 13, w - 26, h - 26, 9); ctx.stroke();
  lines.forEach((ln, i) => text(ln[0], 0, (i - (lines.length - 1) / 2) * (h * 0.52), ln[1], ln[2]));
  ctx.restore();
}
// Zameen ka plot: upar ki satah + kinare ke khunte + dashed boundary. (cx, gy) ground, w = width.
function plotDraw(cx, gy, w) {
  ctx.fillStyle = '#8a6a3d'; D.poly(ctx, [[cx - w / 2, gy], [cx - w / 2 + 46, gy - 52], [cx + w / 2 - 46, gy - 52], [cx + w / 2, gy]]); ctx.fill();
  ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#6e5136'; ctx.fillRect(cx - w / 2, gy, w, 30);
  ctx.strokeStyle = 'rgba(245,237,216,0.85)'; ctx.lineWidth = 4; ctx.setLineDash([22, 16]);
  ctx.beginPath(); ctx.moveTo(cx - w / 2 + 24, gy - 14); ctx.lineTo(cx + w / 2 - 24, gy - 14); ctx.stroke(); ctx.setLineDash([]);
  for (const px of [cx - w / 2 + 16, cx + w / 2 - 16]) { ctx.fillStyle = '#5d4630'; ctx.fillRect(px - 7, gy - 96, 14, 96); ctx.strokeStyle = D.OUT; ctx.lineWidth = 3; ctx.strokeRect(px - 7, gy - 96, 14, 96); }
}
// Baarish ki lakeerein (band dukaan wale shot ke liye)
function rainFx(f, x0, x1, y0, y1) {
  ctx.strokeStyle = 'rgba(178,210,240,0.5)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 30; i++) {
    const rx = x0 + hash(i * 3.71) * (x1 - x0), ry = y0 + ((f * 27 + i * 197) % Math.max(60, y1 - y0));
    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 13, ry + 46); ctx.stroke();
  }
}
// Street background. tone: 'eve' (neela-aasmaan + golden lamp) | 'old' (1956 faded) | 'dark' (reveal)
function streetBg(gy, tone = 'eve') {
  if (tone === 'old') vgrad(-400, gy + 40, [[0, '#6f6455'], [1, '#978a74']]);
  else if (tone === 'dark') vgrad(-400, gy + 40, [[0, '#0a0c12'], [1, '#1a2030']]);
  else vgrad(-400, gy + 40, [[0, '#223c5e'], [1, '#4a729e']]);
  if (tone !== 'dark') skyline(7, gy - 260, tone === 'old' ? '#5d5344' : '#1d2c44', tone === 'old' ? '#d8c9a0' : '#ffd98a');
  ctx.fillStyle = tone === 'old' ? '#5d5348' : '#33302e'; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  ctx.fillStyle = 'rgba(255,220,150,0.10)'; ctx.fillRect(-800, gy, 3760, 12);
  if (tone === 'eve') { lampPost(330, gy, 1.05, 0); lampPost(1830, gy, 1.05, 0); }
}
// Hisaab wala dark board-room background
function hisaabBg(gy) {
  vgrad(-400, gy + 40, [[0, '#18211c'], [1, '#2e4038']]);
  ctx.strokeStyle = 'rgba(245,237,216,0.07)'; ctx.lineWidth = 3;
  for (let x = -600; x < 2800; x += 240) { ctx.beginPath(); ctx.moveTo(x, 200); ctx.lineTo(x, gy); ctx.stroke(); }
  ctx.fillStyle = '#241f1a'; ctx.fillRect(-800, gy, 3760, 3840 - gy);
  ctx.fillStyle = 'rgba(255,220,150,0.08)'; ctx.fillRect(-800, gy, 3760, 12);
}

/* =====================================================================
   TIMING TABLE — McDonald's Expose EP-2 (script v2, 151 words, TOTAL 1380 @30fps)
   Voice ke exact timings aane par SIRF ye frame boundaries patch karne hain;
   draw code chhune ki zaroorat nahi. Har shot <= 66 frames (2.2 s).
   ---------------------------------------------------------------------
   S1  (10w)   0–91    "Tum McDonald's ki dukaan kholne jao — wo mana kar denge?"
   S2  ( 4w)  91–128   "Nahi, khushi se denge."
   S3  (16w) 128–274   "Kyunki 45,000 dukaanon me se 95% ... tum jaise logo ki hain."
   S4  (17w) 274–429   "Phir sawal ye hai: khud burger beche bina ... kaise bani?"
   S5  ( 6w) 429–484   "Sab kahenge — naam ka paisa, royalty."
   S6  ( 7w) 484–548   "Haan, royalty se aate hain ₹50,000 crore."
   S7  ( 6w) 548–603   "Lekin ye asli number nahi hai."
   S8  ( 8w) 603–676   "Asli number hai kiraya — ₹88,000 crore, har saal."
   S9  ( 4w) 676–713   "Royalty se bhi zyada!"
   S10 ( 9w) 713–795   "Khel 1956 me badla, jab company doob rahi thi."
   S11 ( 7w) 795–859   "Ek aadmi bola — burger chhodo, zameen kharido."
   S12 (20w) 859–1042  "Us din se niyam hai: zameen McDonald's ki ... bikri ho ya na ho."
   S13 ( 9w)1042–1124  "Aur ye raha wo hisaab jo koi nahi batata:"
   S14 (10w)1124–1215  "khud dukaan chalaye to ₹100 me sirf ₹16 bachte hain."
   S15 ( 3w)1215–1243  "Tumhari dukaan se? ₹82."
   S16 ( 5w)1243–1288  "Isiliye wo burger nahi bechte dost."
   S17 (10w)1288–1380  "Burger to sirf bahana hai — taaki kiraayedaar, kiraya de sake."
   SHOTS: 1a 0–50 | 1b 50–91 | 2 91–128 | 3a 128–183 | 3b 183–238 | 3c 238–274
          5a 274–330 | 5b 330–385 | 5c 385–429 | 6a 429–484 | 6b 484–548
          7 548–603 | 8a 603–668 | 8b 668–713 | 9a 713–758 | 9b 758–795
          10 795–859 | 11a 859–925 | 11b 925–985 | 12 985–1042
          13a 1042–1095 | 13b 1095–1158 | 13c 1158–1215 | 13d 1215–1243
          14a 1243–1288 | 14b 1288–1345 | 14c 1345–1380
   ===================================================================== */

// ===== M1a (0–50) S1 — dukaan kholne gaya: chamakta storefront, hero khush =====
shot(0, 49, 0.26, { cx: 1080, cy: 1580, s: 0.66 }, { cx: 1080, cy: 1520, s: 0.75 }, (f, u) => {
  layer(0.5, () => streetBg(GY));
  layer(0.8, () => mcdStore(1160, GY, 1180, false, 0.7));
  layer(1, () => {
    heroFig(735, GY, 1.2, { expr: 'happy', seed: 5, speak: true, face: 1, armR: 'up' }, f);
    if (f > 14) { const p = spring((f - 14) / 11); boardSign(1420, 1120, 540, 132, [['DUKAAN KHULI!', 56, '#8a1f1f']], p); }
  });
}, [14]);
// ===== M1b (50–91) S1b — "wo mana kar denge?" hero puzzled, sawal ka nishan =====
shot(49, 89, 0.28, { cx: 1120, cy: 1700, s: 1.02 }, { cx: 1120, cy: 1660, s: 1.14 }, (f, u) => {
  layer(0.5, () => streetBg(GY));
  layer(0.8, () => mcdStore(1330, GY, 1050, false, 0.4));
  layer(1, () => {
    heroFig(790, GY, 1.75, { expr: 'puzzled', seed: 5, speak: true, armR: 'scratch' }, f);
    bigQ(1300, 1560 + Math.sin(f * 0.16) * 14, 1.15, '#ffd94d', Math.sin(f * 0.1) * 0.08);
  });
}, []);
// ===== M2 (91–128) S2 — close-up: "Nahi, khushi se denge" =====
shot(89, 134, 0.26, { cx: 1080, cy: 1920, s: 1.42 }, { cx: 1080, cy: 1880, s: 1.58 }, (f, u) => {
  layer(0.5, () => { streetBg(GY); mcdStore(1250, GY, 1150, false, 0.5); });
  layer(1, () => {
    heroFig(1080, GY, 2.35, { expr: 'happy', seed: 5, speak: true, armR: 'up' }, f);
  });
}, []);
// ===== M3a (128–183) S3 — dukaanon ki lambi line, board 45,000 =====
shot(134, 191, 0.28, { cx: 1080, cy: 1520, s: 0.56 }, { cx: 1080, cy: 1490, s: 0.64 }, (f, u) => {
  layer(0.5, () => streetBg(GY));
  layer(1, () => {
    for (let i = 0; i < 7; i++) miniMcd(-60 + i * 385, GY, 0.98, i === 5);
    if (f > 146) { const p = spring((f - 146) / 11); boardSign(1080, 1020, 660, 142, [['45,000 DUKAAN', 66, '#7a4d12']], p); }
  });
}, [146]);
// ===== M3b (183–238) S3b — dukaanon ke saamne chalta hero (track shot) =====
shot(191, 248, 0.28, { cx: 920, cy: 1620, s: 0.85 }, { cx: 1240, cy: 1600, s: 0.9 }, (f, u) => {
  layer(0.5, () => streetBg(GY));
  layer(0.85, () => { miniMcd(420, GY, 1.5); miniMcd(1080, GY, 1.5); miniMcd(1740, GY, 1.5); });
  layer(1, () => {
    heroFig(1010, GY, 1.3, { expr: 'calm', seed: 5, speak: true, walk: (f * 0.028) % 1 }, f);
  });
}, []);
// ===== M3c (238–274) S3c/S4-beat — board pop "95% UNKI NAHI HAIN" + shocked morph =====
shot(248, 285, 0.3, { cx: 1080, cy: 1680, s: 1.0 }, { cx: 1080, cy: 1640, s: 1.15 }, (f, u) => {
  const lf = f - 248;
  layer(0.5, () => streetBg(GY));
  layer(0.85, () => mcdStore(1300, GY, 1000, false, 0.3));
  layer(1, () => {
    const mu = lf < 8 ? 0 : Math.min(1, (lf - 8) / 13);
    heroFig(820, GY, 1.95, { expr: 'calm', seed: 5, speak: mu < 0.6, mix: { e2: 'shocked', u: mu }, sweat: mu > 0.5 }, f);
    if (lf > 6) { const p = spring((lf - 6) / 11); boardSign(1330, 1230, 600, 176, [['95% UNKI', 62, '#8a1f1f'], ['NAHI HAIN!', 62, '#8a1f1f']], p); }
  });
}, [254]);
// ===== M5a (274–330) S4 — close-up sawal: "Phir sawal ye hai..." =====
shot(285, 344, 0.28, { cx: 1080, cy: 1920, s: 1.42 }, { cx: 1080, cy: 1880, s: 1.56 }, (f, u) => {
  layer(0.5, () => { streetBg(GY); });
  layer(1, () => {
    heroFig(1080, GY, 2.4, { expr: 'puzzled', seed: 5, speak: true, armR: 'scratch' }, f);
    bigQ(1420, 1470 + Math.sin(f * 0.14) * 12, 0.85, '#ffd94d', Math.sin(f * 0.09) * 0.09);
  });
}, []);
// ===== M5b (330–385) S4b — haath me burger: "khud burger beche bina..." =====
shot(344, 401, 0.28, { cx: 1080, cy: 1700, s: 1.05 }, { cx: 1080, cy: 1660, s: 1.16 }, (f, u) => {
  layer(0.5, () => streetBg(GY));
  layer(0.85, () => mcdStore(1300, GY, 1000, false, 0.35));
  layer(1, () => {
    heroFig(900, GY, 1.95, { expr: 'puzzled', seed: 5, speak: true, armL: 'hold', armR: 'hold' }, f);
    burgerDraw(905, GY - 355 + Math.sin(f * 0.12) * 7, 1.55, Math.sin(f * 0.07) * 0.05);
  });
}, []);
// ===== M5c (385–429) S4c — "sabse ameer khana company kaise bani?" sikke + hairani =====
shot(401, 447, 0.3, { cx: 1080, cy: 1660, s: 1.0 }, { cx: 1080, cy: 1620, s: 1.12 }, (f, u) => {
  const lf = f - 401;
  layer(0.5, () => streetBg(GY));
  layer(1, () => {
    const mu = lf < 18 ? 0 : Math.min(1, (lf - 18) / 12);
    heroFig(800, GY, 1.85, { expr: 'puzzled', seed: 5, speak: true, mix: { e2: 'surprise', u: mu } }, f);
    coinStack(1300, GY, 6); coinStack(1470, GY, 4);
    if (lf > 8) text('SABSE AMEER?', 1380, GY - 320, 54, '#ffe9a8');
    bigQ(1560, 1500 + Math.sin(f * 0.15) * 12, 0.95, '#ffd94d', Math.sin(f * 0.1) * 0.08);
  });
}, []);
// ===== M6a (429–484) S5 — log kehte hain: "ROYALTY!" =====
shot(447, 511, 0.28, { cx: 1080, cy: 1600, s: 0.9 }, { cx: 1080, cy: 1570, s: 0.98 }, (f, u) => {
  layer(0.5, () => bazaarBg(GY));
  layer(1, () => {
    crowd(1080, GY, 6, 980, f, 3, false);
    heroFig(1080, GY + 30, 1.4, { expr: 'calm', seed: 5, armR: 'up' }, f);
    const lf = f - 447;
    if (lf > 10) { const p = spring((lf - 10) / 11); boardSign(1080, 1060, 580, 132, [['"ROYALTY!"', 58, '#31517a']], p); }
  });
}, []);
// ===== M6b (484–548) S6 — board: ROYALTY ₹50,000 CRORE =====
shot(511, 580, 0.3, { cx: 1080, cy: 1600, s: 0.95 }, { cx: 1080, cy: 1560, s: 1.06 }, (f, u) => {
  const lf = f - 511;
  layer(0.5, () => hisaabBg(GY));
  layer(1, () => {
    coinStack(735, GY, 4); coinStack(1445, GY, 4);
    heroFig(1080, GY, 1.65, { expr: 'calm', seed: 5, speak: true, prop: 'notes' }, f);
    if (lf > 12) { const p = spring((lf - 12) / 11); boardSign(1080, 1120, 800, 178, [['ROYALTY', 56, '#31517a'], ['₹50,000 CRORE', 68, '#8a1f1f']], p); }
  });
}, [524]);
// ===== M7 (548–603) S7 — haath rok kar: "Lekin ye asli number nahi hai" (serious morph) =====
shot(580, 620, 0.3, { cx: 1080, cy: 1780, s: 1.24 }, { cx: 1080, cy: 1740, s: 1.4 }, (f, u) => {
  const lf = f - 580;
  layer(0.5, () => streetBg(GY));
  layer(1, () => {
    const mu = lf < 6 ? 0 : Math.min(1, (lf - 6) / 13);
    heroFig(1010, GY, 2.15, { expr: 'calm', seed: 5, speak: true, armR: 'up', mix: { e2: 'worried', u: mu } }, f);
  });
}, []);
// ===== M8a (603–668) S8 — BADA REVEAL: KIRAYA ₹88,000 CRORE (gold-on-dark, push-in + hit) =====
shot(620, 707, 0.34, { cx: 1080, cy: 1560, s: 0.92 }, { cx: 1080, cy: 1460, s: 1.32 }, (f, u) => {
  const lf = f - 620;
  layer(0.5, () => streetBg(GY, 'dark'));
  layer(1, () => {
    const mu = lf < 15 ? 0 : Math.min(1, (lf - 15) / 12);
    heroFig(1080, GY, 1.75, { expr: 'calm', seed: 5, speak: lf < 16, mix: { e2: 'shocked', u: mu }, sweat: mu > 0.4 }, f);
    if (lf > 15) { const p = spring((lf - 15) / 12); darkBoard(1080, 1140, 920, 264, [['KIRAYA', 74, '#ffd94d'], ['₹88,000 CRORE', 98, '#ffc72c']], p); }
  });
}, [640]);
// ===== M8b (668–713) S9 — "Royalty se bhi zyada!" chhota royalty vs bada kiraya =====
shot(707, 780, 0.3, { cx: 1080, cy: 1620, s: 0.95 }, { cx: 1080, cy: 1590, s: 1.05 }, (f, u) => {
  const lf = f - 707;
  layer(0.5, () => streetBg(GY, 'dark'));
  layer(1, () => {
    const mu = lf < 16 ? 0 : Math.min(1, (lf - 16) / 13);
    boardSign(760, 1300, 470, 128, [['ROYALTY ₹50,000', 46, '#5a6a7a']], 0.92);
    darkBoard(1400, 1210, 580, 180, [['KIRAYA ₹88,000', 58, '#ffc72c']], 1);
    heroFig(1080, GY, 1.55, { expr: 'shocked', seed: 5, speak: true, mix: { e2: 'smug', u: mu } }, f);
  });
}, []);
// ===== M9a (713–758) S10 — FLASHBACK 1956: purani dukaan, faded mahaul =====
shot(780, 831, 0.32, { cx: 1080, cy: 1580, s: 0.7 }, { cx: 1080, cy: 1540, s: 0.8 }, (f, u) => {
  const lf = f - 780;
  layer(0.5, () => streetBg(GY, 'old'));
  layer(0.85, () => mcdStore(1180, GY, 980, true, 0));
  layer(1, () => {
    heroFig(720, GY, 1.15, { expr: 'sad', seed: 5, headDip: 0.4 }, f);
    if (lf > 8) { const p = spring((lf - 8) / 11); boardSign(1150, 1060, 430, 138, [['1956', 76, '#6b5136']], p); }
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(196,150,80,0.15)'; ctx.fillRect(0, 0, W, H);
}, []);
// ===== M9b (758–795) S10b — "company doob rahi thi": udaas hero + girta graph =====
shot(831, 873, 0.32, { cx: 1080, cy: 1700, s: 1.05 }, { cx: 1080, cy: 1670, s: 1.15 }, (f, u) => {
  const lf = f - 831;
  layer(0.5, () => streetBg(GY, 'old'));
  layer(0.85, () => mcdStore(1330, GY, 900, true, 0));
  layer(1, () => {
    heroFig(830, GY, 1.9, { expr: 'sad', seed: 5, headDip: 0.55, speak: true }, f);
    ctx.strokeStyle = '#8a3324'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(1230, 1560); ctx.lineTo(1360, 1660); ctx.lineTo(1440, 1620); ctx.lineTo(1560, 1790); ctx.stroke();
    ctx.fillStyle = '#8a3324'; D.poly(ctx, [[1560, 1790], [1492, 1768], [1538, 1718]]); ctx.fill();
    if (lf > 6) { const p = spring((lf - 6) / 11); boardSign(1330, 1180, 620, 140, [['COMPANY DOOB RAHI THI', 47, '#8a1f1f']], p); }
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(196,150,80,0.15)'; ctx.fillRect(0, 0, W, H);
}, []);
// ===== M10 (795–859) S11 — Sonneborn: "Burger chhodo, zameen kharido" + plot par board =====
shot(873, 947, 0.3, { cx: 1080, cy: 1640, s: 0.95 }, { cx: 1080, cy: 1600, s: 1.08 }, (f, u) => {
  const lf = f - 873;
  layer(0.5, () => streetBg(GY, 'old'));
  layer(1, () => {
    plotDraw(1330, GY, 640);
    heroFig(800, GY, 2.0, { preset: BOSS_P, expr: 'smug', seed: 9, speak: true, armR: 'up' }, f);
    burgerDraw(665, GY - 26, 0.95, 0.12);
    ctx.strokeStyle = '#c62828'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(610, GY - 92); ctx.lineTo(722, GY + 22); ctx.moveTo(722, GY - 92); ctx.lineTo(610, GY + 22); ctx.stroke();
    if (lf > 31) { const p = spring((lf - 31) / 11); boardSign(1330, GY - 430, 440, 112, [["McDONALD'S", 46, '#8a1f1f']], p); }
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(196,150,80,0.10)'; ctx.fillRect(0, 0, W, H);
}, [909]);
// ===== M11a (859–925) S12a — niyam: neeche zameen McD ki, upar dukaan tumhari (build-up) =====
shot(947, 1017, 0.28, { cx: 1080, cy: 1560, s: 0.78 }, { cx: 1080, cy: 1520, s: 0.88 }, (f, u) => {
  layer(0.5, () => streetBg(GY));
  layer(1, () => {
    plotDraw(1150, GY, 1020);
    ctx.save(); ctx.beginPath(); ctx.rect(560, GY - 800 * spring(u * 1.15), 1180, 820); ctx.clip();
    mcdStore(1150, GY, 1020, false, 0.4); ctx.restore();
    boardSign(735, 1120, 520, 122, [['ZAMEEN McD KI', 50, '#7a4d12']], spring(Math.max(0, (f - 954) / 11)));
    if (f > 980) { const p = spring((f - 980) / 11); boardSign(1470, 1120, 520, 122, [['DUKAAN TUMHARI', 50, '#0c831f']], p); }
    heroFig(700, GY, 1.3, { expr: 'calm', seed: 5, speak: true, armR: 'catch' }, f);
  });
}, []);
// ===== M11b (925–985) S12b — "kharcha tumhara": dukaanwala counter par pareshan =====
shot(1017, 1081, 0.3, { cx: 1080, cy: 1640, s: 0.95 }, { cx: 1080, cy: 1610, s: 1.05 }, (f, u) => {
  layer(0.5, () => dukaanSet(GY));
  layer(1, () => {
    shopCounter();
    heroFig(1410, GY - 60, 1.5, { preset: SHOP_P, expr: 'worried', seed: 11, sweat: true, armL: 'hold', armR: 'hold' }, f);
    billDraw(1300, GY - 560, 1.05, -0.1); billDraw(1470, GY - 500, 0.9, 0.14);
    coinStack(1520, GY, 2);
    heroFig(740, GY, 1.55, { expr: 'calm', seed: 5, speak: true, armR: 'catch' }, f);
  });
}, []);
// ===== M12 (985–1042) S12c — baarish + band dukaan, phir bhi kiraya note girta hai =====
shot(1081, 1141, 0.32, { cx: 1080, cy: 1560, s: 0.8 }, { cx: 1080, cy: 1520, s: 0.9 }, (f, u) => {
  const lf = f - 1081;
  layer(0.5, () => streetBg(GY));
  layer(0.85, () => {
    mcdStore(1080, GY, 1050, false, 0.15);
    // band shutter (glass ke upar)
    ctx.fillStyle = '#4a4f58'; ctx.fillRect(642, GY - 612, 876, 392);
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    for (let i = 0; i < 10; i++) ctx.fillRect(642, GY - 612 + i * 40, 876, 7);
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.strokeRect(642, GY - 612, 876, 392);
    text('BAND', 1080, GY - 416, 74, '#d8dde6');
    // counter strip jahan note girta hai
    ctx.fillStyle = '#7a4d2a'; D.rr(ctx, 830, GY - 268, 500, 42, 8); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
  });
  layer(1, () => {
    rainFx(f, 500, 1700, 500, GY - 300);
    const fall = D.clamp((lf - 20) / 15, 0, 1), ny = GY - 760 + fall * 440 + Math.sin(f * 0.3) * (1 - fall) * 6;
    if (lf > 18) noteDraw(1080, ny, 1.35, Math.sin(f * 0.2) * 0.16 * (1 - fall), fall >= 1 ? 0.7 : 0.2);
    if (lf > 27) { const p = spring((lf - 27) / 11); boardSign(1080, 1040, 860, 176, [['KIRAYA PAKKA', 64, '#8a1f1f'], ['BIKRI HO YA NA HO', 54, '#7a4d12']], p); }
  });
}, [1109]);
// ===== M13a (1042–1095) S13 — close-up: "Aur ye raha wo hisaab jo koi nahi batata" =====
shot(1141, 1203, 0.28, { cx: 1080, cy: 1920, s: 1.42 }, { cx: 1080, cy: 1880, s: 1.58 }, (f, u) => {
  layer(0.5, () => hisaabBg(GY));
  layer(1, () => {
    heroFig(1080, GY, 2.35, { expr: 'smug', seed: 5, speak: true, armL: 'rub', armR: 'rub' }, f);
  });
}, []);
// ===== M13b (1095–1158) S14 — hisaab board LEFT: KHUD KI DUKAAN ₹100 → ₹16 (dull) =====
shot(1203, 1279, 0.3, { cx: 1020, cy: 1620, s: 0.92 }, { cx: 1020, cy: 1590, s: 1.0 }, (f, u) => {
  layer(0.5, () => hisaabBg(GY));
  layer(1, () => {
    ctx.fillStyle = '#2a2f36'; D.rr(ctx, 880, 1080, 470, 600, 14); ctx.fill(); ctx.strokeStyle = '#596270'; ctx.lineWidth = 6; ctx.stroke();
    text('KHUD KI DUKAAN', 1115, 1160, 46, '#d8d2c2');
    text('₹100', 1115, 1300, 88, '#e8e2d2');
    text('↓', 1115, 1415, 72, '#8a8f99');
    text('₹16', 1115, 1545, 88, '#c96f2e');
    text('SIRF BACHA', 1115, 1635, 40, '#8a8f99');
    heroFig(690, GY, 1.4, { expr: 'calm', seed: 5, speak: true, armR: 'catch' }, f);
  });
}, []);
// ===== M13c (1158–1215) S15a — hisaab board RIGHT: TUMHARI DUKAAN ₹100 → ₹82 (bada, gold, pop+hit) =====
shot(1279, 1329, 0.3, { cx: 1140, cy: 1600, s: 0.95 }, { cx: 1140, cy: 1560, s: 1.06 }, (f, u) => {
  const lf = f - 1279;
  layer(0.5, () => hisaabBg(GY));
  layer(1, () => {
    ctx.fillStyle = '#22262d'; D.rr(ctx, 690, 1180, 300, 420, 12); ctx.fill(); ctx.strokeStyle = '#4a5058'; ctx.lineWidth = 5; ctx.stroke();
    text('KHUD KI', 840, 1245, 40, '#9aa0a8'); text('₹16', 840, 1360, 62, '#a5571f');
    const p = lf < 10 ? 0.001 : spring((lf - 10) / 12);
    ctx.save(); ctx.translate(1330, 1400); ctx.scale(p, p);
    lampPool(0, 0, 560, 0.3);
    ctx.fillStyle = '#1c1503'; D.rr(ctx, -290, -330, 580, 660, 16); ctx.fill(); ctx.strokeStyle = MCD_GOLD; ctx.lineWidth = 9; ctx.stroke();
    text('TUMHARI DUKAAN', 0, -235, 54, '#ffd94d');
    text('₹100', 0, -95, 100, '#f5edd8');
    text('↓', 0, 30, 80, '#ffc72c');
    text('₹82', 0, 180, 138, '#ffc72c');
    ctx.restore();
    const mu = lf < 12 ? 0 : Math.min(1, (lf - 12) / 12);
    heroFig(830, GY, 1.5, { expr: 'calm', seed: 5, speak: true, mix: { e2: 'shocked', u: mu }, sweat: mu > 0.5 }, f);
  });
}, [1298]);
// ===== M13d (1215–1243) S15b — dono hisaab saath: hero dono taraf ishara =====
shot(1329, 1365, 0.3, { cx: 1080, cy: 1620, s: 0.9 }, { cx: 1080, cy: 1600, s: 0.96 }, (f, u) => {
  layer(0.5, () => hisaabBg(GY));
  layer(1, () => {
    ctx.fillStyle = '#22262d'; D.rr(ctx, 580, 1170, 330, 440, 12); ctx.fill(); ctx.strokeStyle = '#4a5058'; ctx.lineWidth = 5; ctx.stroke();
    text('KHUD KI', 745, 1240, 42, '#9aa0a8'); text('₹100 → ₹16', 745, 1360, 54, '#c96f2e');
    ctx.fillStyle = '#1c1503'; D.rr(ctx, 1130, 1110, 430, 560, 14); ctx.fill(); ctx.strokeStyle = MCD_GOLD; ctx.lineWidth = 7; ctx.stroke();
    text('TUMHARI', 1345, 1195, 48, '#ffd94d'); text('₹100 → ₹82', 1345, 1330, 62, '#ffc72c');
    heroFig(1080, GY, 1.6, { expr: 'smug', seed: 5, speak: true, armL: 'catch', armR: 'catch' }, f);
  });
}, []);
// ===== M14a (1243–1288) S16 — "Isiliye wo burger nahi bechte dost" — burger par X =====
shot(1365, 1408, 0.28, { cx: 1080, cy: 1740, s: 1.18 }, { cx: 1080, cy: 1700, s: 1.3 }, (f, u) => {
  const lf = f - 1365;
  layer(0.5, () => streetBg(GY));
  layer(1, () => {
    heroFig(920, GY, 2.05, { expr: 'calm', seed: 5, speak: true, armR: 'up' }, f);
    burgerDraw(1420, 1620 + Math.sin(f * 0.1) * 8, 1.7, 0);
    if (lf > 14) {
      const p = spring((lf - 14) / 9);
      ctx.save(); ctx.translate(1420, 1620); ctx.scale(p, p);
      ctx.strokeStyle = '#c62828'; ctx.lineWidth = 13; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-105, -105); ctx.lineTo(105, 105); ctx.moveTo(105, -105); ctx.lineTo(-105, 105); ctx.stroke();
      ctx.restore();
    }
  });
}, []);
// ===== M14b (1288–1345) S17 — PUNCHLINE close-up: "Burger to sirf bahana hai..." (smug → calm morph) =====
shot(1408, 1458, 0.28, { cx: 1080, cy: 1920, s: 1.44 }, { cx: 1080, cy: 1870, s: 1.62 }, (f, u) => {
  const lf = f - 1408;
  layer(0.5, () => { streetBg(GY); mcdStore(1250, GY, 1150, false, 0.55); });
  layer(1, () => {
    const mu = lf < 28 ? 0 : Math.min(1, (lf - 28) / 14);
    heroFig(1080, GY, 2.42, { expr: 'smug', seed: 5, speak: true, prop: 'notes', mix: { e2: 'calm', u: mu } }, f);
  });
}, []);
// ===== M14c (1345–1380) S17b — ant: storefront wide, arches glow, hero saamne =====
shot(1458, 1487, 0.26, { cx: 1080, cy: 1560, s: 0.66 }, { cx: 1080, cy: 1520, s: 0.74 }, (f, u) => {
  layer(0.5, () => streetBg(GY));
  layer(0.85, () => mcdStore(1120, GY, 1200, false, 0.75 + 0.25 * Math.sin(f * 0.16)));
  layer(1, () => {
    heroFig(1080, GY, 1.35, { expr: 'happy', seed: 5, armR: 'up' }, f);
    noteDraw(1420, 1560 + Math.sin(f * 0.13) * 16, 1.15, Math.sin(f * 0.09) * 0.14, 0.5);
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
