// WhatsApp Free Kyun Hai — kahani-style Short (2082 frames @30fps). Impossible sawal: free cheez par dedh lakh crore kyun?
// Jawab ghuma-ghuma kar: data myth -> bheed ki keemat -> business bill. Hisaab kahani ke andar.
// Harness: window.ready, window.renderFrame(f), window.TOTAL.
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import * as D from './draw.js';

const W = 1080, H = 1920, TOTAL = 2082, FPS = 30;
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
// N1 (0-97) L1: subah, hero phone par — WhatsApp free hai
shot(0, 97, 0.26, { cx: 1080, cy: 1500, s: 0.66 }, { cx: 1080, cy: 1480, s: 0.78 }, (f, u) => {
  layer(0.55, () => homeRoom(GY));
  layer(1, () => {
    boardSign(1080, 560, 640, 150, [['WHATSAPP', 80, '#075e54']]);
    heroFig(1080, GY, 2.0, { expr: 'happy', armR: 'phone', seed: 5 }, f);
  });
}, []);
// N2 (97-232) L2: 2014 flashback — Meta building
shot(97, 232, 0.3, { cx: 1080, cy: 1500, s: 0.58 }, { cx: 1080, cy: 1480, s: 0.68 }, (f, u) => {
  f -= 97;
  layer(0.55, () => metaHall(GY));
  layer(1, () => {
    heroFig(560, GY, 1.7, { expr: 'calm', seed: 5 }, f);
    if (f > 16) { const p = spring((f - 16) / 16); ctx.save(); ctx.translate(1330, 1250); ctx.scale(p, p);
      boardSign(0, 0, 500, 160, [['2014', 96, '#7a4d12']]); ctx.restore(); }
  });
  warmTint(0.13);
}, []);
// N3 (232-311) L4: dedh lakh crore ka dher
shot(232, 311, 0.3, { cx: 1080, cy: 1500, s: 0.62 }, { cx: 1080, cy: 1480, s: 0.74 }, (f, u) => {
  f -= 232;
  layer(0.55, () => metaHall(GY));
  layer(1, () => {
    coinStack(740, GY, 7); coinStack(1010, GY, 6); coinStack(1300, GY, 5);
    heroFig(1690, GY, 1.85, { expr: 'shocked', seed: 5 }, f);
    if (f > 10) { const p = spring((f - 10) / 13); ctx.save(); ctx.translate(1080, 1080); ctx.scale(p, p);
      boardSign(0, 0, 760, 150, [['19 ARAB DOLLAR', 72, '#8a1f1f']]); ctx.restore(); }
    if (f > 40) { const p = spring((f - 40) / 13); ctx.save(); ctx.translate(1080, 1300); ctx.scale(p, p);
      boardSign(0, 0, 820, 140, [['₹1.6 LAKH CRORE+', 66, '#7a4d12']]); ctx.restore(); }
  });
  warmTint(0.10);
}, [245]);
// N4 (311-439) L5: sawal — ek paisa nahi kamati, phir kyun?
shot(311, 439, 0.32, { cx: 1080, cy: 1420, s: 1.0 }, { cx: 1080, cy: 1400, s: 1.14 }, (f, u) => {
  f -= 311;
  layer(0.55, () => metaHall(GY));
  layer(1, () => {
    heroFig(1080, GY, 2.35, { expr: 'puzzled', armL: 'scratch', seed: 5 }, f);
    bigQ(1560, 1330, 1.15 + 0.1 * Math.sin(f * 0.08), '#ffd94d', Math.sin(f * 0.05) * 0.14);
    if (f > 26) text('EK PAISA NAHI KAMATI... PHIR KYUN?', 1080, 1050, 56, '#ffe9a8');
  });
}, []);
// N5 (439-475) L6: pagal tha kya Facebook?
shot(439, 475, 0.3, { cx: 1080, cy: 1480, s: 0.8 }, { cx: 1080, cy: 1470, s: 0.9 }, (f, u) => {
  f -= 439;
  layer(0.5, () => metaHall(GY));
  layer(1, () => {
    heroFig(900, GY, 2.0, { expr: 'puzzled', armR: 'scratch', seed: 5 }, f);
    ctx.save(); ctx.translate(1470, 1560); ctx.rotate(-0.09 + Math.sin(f * 0.1) * 0.02);
    ctx.fillStyle = '#f5edd8'; D.rr(ctx, -190, -70, 380, 140, 12); ctx.fill(); ctx.strokeStyle = '#c62828'; ctx.lineWidth = 7; ctx.stroke();
    text('PAGAL?', 0, 4, 84, '#c62828'); ctx.restore();
  });
}, []);
// N6 (475-555) L7: log kehte hain — data bechta hoga
shot(475, 555, 0.3, { cx: 1080, cy: 1480, s: 0.78 }, { cx: 1080, cy: 1470, s: 0.88 }, (f, u) => {
  f -= 475;
  layer(0.55, () => bazaarBg(GY));
  layer(1, () => {
    heroFig(880, GY, 1.95, { expr: 'worried', seed: 5 }, f);
    heroFig(1330, GY, 1.9, { preset: WORKER_P, expr: 'speak', face: -1, armR: 'point', seed: 9 }, f);
    if (f > 16) bubble(1560, 1290, 205, () => { text('DATA', 1560, 1240, 62, '#8a1f1f'); text('BIKTA HOGA!', 1560, 1330, 48, '#8a1f1f'); });
  });
}, []);
// N7 (555-630) L8+L9a: JHOOTH! chat padh hi nahi sakta
shot(555, 630, 0.32, { cx: 1080, cy: 1440, s: 0.95 }, { cx: 1080, cy: 1420, s: 1.1 }, (f, u) => {
  f -= 555;
  layer(0.55, () => bazaarBg(GY));
  layer(1, () => {
    heroFig(1080, GY, 2.3, { expr: 'angry', armR: 'point', seed: 5 }, f);
    if (f > 4) { const p = spring((f - 4) / 11); ctx.save(); ctx.translate(1080, 1000); ctx.scale(p, p);
      ctx.fillStyle = '#c62828'; D.rr(ctx, -330, -85, 660, 170, 18); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 7; ctx.stroke();
      text('JHOOTH!', 0, 6, 118, '#ffffff'); ctx.restore(); }
  });
}, [558]);
// N8 (630-740) L9b: chat par taala, chaabi tumhare paas
shot(630, 740, 0.3, { cx: 1080, cy: 1460, s: 0.85 }, { cx: 1080, cy: 1440, s: 0.97 }, (f, u) => {
  f -= 630;
  layer(0.55, () => homeRoom(GY));
  layer(1, () => {
    chatPhone(820, 1560, 520, 840, 0, 0.95);
    lockDraw(880, 1500, 1.5 + 0.06 * Math.sin(f * 0.09));
    heroFig(1560, GY, 1.95, { expr: 'smug', armR: 'point', seed: 5 }, f);
    if (f > 30) text('CHAABI SIRF TUMHARE PAAS!', 1000, 1150, 54, '#ffe9a8');
  });
}, [700]);
// N9 (740-796) L10: data nahi bika — phir paisa gaya kahan?
shot(740, 796, 0.32, { cx: 1080, cy: 1440, s: 0.95 }, { cx: 1080, cy: 1420, s: 1.08 }, (f, u) => {
  f -= 740;
  layer(0.55, () => homeRoom(GY));
  layer(1, () => {
    heroFig(1080, GY, 2.2, { expr: 'puzzled', armL: 'scratch', seed: 5 }, f);
    const cy = 1560 - f * 9, ca = D.clamp(1 - f / 48, 0, 1);
    ctx.save(); ctx.globalAlpha = ca; D.circ(ctx, 1470, cy, 42); ctx.fillStyle = '#e8b64c'; ctx.fill(); ctx.strokeStyle = '#9a7414'; ctx.lineWidth = 5; ctx.stroke();
    text('₹', 1470, cy + 2, 42, '#7a4d12'); ctx.restore();
    if (f > 14) text('PHIR PAISA GAYA KAHAN?', 1080, 1030, 62, '#ffe9a8');
  });
}, []);
// N10 (796-842) L11: jawab ghuma hua hai (re-hook)
shot(796, 842, 0.3, { cx: 1080, cy: 1440, s: 1.0 }, { cx: 1080, cy: 1420, s: 1.16 }, (f, u) => {
  f -= 796;
  layer(0.55, () => bazaarBg(GY));
  layer(1, () => {
    heroFig(1080, GY, 2.3, { expr: 'smug', armR: 'point', seed: 5 }, f);
    if (f > 8) text('JAWAB GHUMA HUA HAI...', 1080, 1020, 60, '#ffe9a8');
  });
}, []);
// N11 (842-918) L12a: badi dukaan — saaman full, graahak nahi
shot(842, 918, 0.28, { cx: 1080, cy: 1500, s: 0.62 }, { cx: 1080, cy: 1480, s: 0.72 }, (f, u) => {
  f -= 842;
  layer(0.55, () => dukaanSet(GY));
  layer(1, () => {
    heroFig(1440, GY, 1.8, { preset: SHOP_P, expr: 'sad', seed: 8 }, f);
    shopCounter();
    text('SAAMAN FULL... GRAAHAK?', 1080, 1150, 58, '#ffe9a8');
  });
}, []);
// N12 (918-977) L12b: chhoti dukaan — saamne lambi line
shot(918, 977, 0.28, { cx: 1080, cy: 1500, s: 0.62 }, { cx: 1080, cy: 1480, s: 0.72 }, (f, u) => {
  f -= 918;
  layer(0.55, () => bazaarBg(GY));
  layer(1, () => {
    miniShop(720, GY, 620, '#7a4a20', 'CHHOTI DUKAAN');
    heroFig(720, GY, 1.15, { preset: SHOP_P, expr: 'happy', seed: 8 }, f);
    ctx.fillStyle = '#5d4028'; ctx.fillRect(720 - 200, GY - 250, 400, 250);
    ctx.fillStyle = '#77572f'; ctx.fillRect(720 - 215, GY - 262, 430, 26);
    crowd(1620, GY, 6, 560, f, 3, false);
    if (f > 16) text('BHEED = KEEMAT!', 1330, 1150, 64, '#ffe9a8');
  });
}, []);
// N13 (977-1082) L13: app nahi kharida — bheed kharidi
shot(977, 1082, 0.3, { cx: 1080, cy: 1500, s: 0.6 }, { cx: 1080, cy: 1480, s: 0.7 }, (f, u) => {
  f -= 977;
  layer(0.55, () => metaHall(GY));
  layer(1, () => {
    heroFig(700, GY, 1.95, { expr: 'speak', armR: 'point', seed: 5 }, f);
    if (f > 14) text('APP NAHI... BHEED KHARIDI!', 1230, 1180, 60, '#ffe9a8');
  });
}, []);
// N14 (1082-1127) L14: us time 45 crore
shot(1082, 1127, 0.28, { cx: 1080, cy: 1520, s: 0.58 }, { cx: 1080, cy: 1500, s: 0.66 }, (f, u) => {
  f -= 1082;
  layer(0.55, () => bazaarBg(GY));
  layer(1, () => {
    crowd(1080, GY, 8, 1400, f, 7, false);
    if (f > 6) { const p = spring((f - 6) / 12); ctx.save(); ctx.translate(1080, 1130); ctx.scale(p, p);
      boardSign(0, 0, 560, 150, [['45 CRORE', 84, '#31517a']]); ctx.restore(); }
  });
  warmTint(0.10);
}, []);
// N15 (1127-1191) L15: aaj 300 crore se zyada
shot(1127, 1191, 0.28, { cx: 1080, cy: 1520, s: 0.56 }, { cx: 1080, cy: 1500, s: 0.66 }, (f, u) => {
  f -= 1127;
  layer(0.55, () => bazaarBg(GY));
  layer(1, () => {
    crowd(1080, GY, 18, 1800, f, 11, false);
    if (f > 6) { const p = spring((f - 6) / 12); ctx.save(); ctx.translate(1080, 1100); ctx.scale(p, p);
      boardSign(0, 0, 700, 165, [['300 CRORE+', 92, '#8a1f1f']]); ctx.restore(); }
  });
}, [1135]);
// N16 (1191-1257) L16: 50 crore se zyada sirf India me
shot(1191, 1257, 0.28, { cx: 1080, cy: 1520, s: 0.58 }, { cx: 1080, cy: 1500, s: 0.68 }, (f, u) => {
  f -= 1191;
  layer(0.55, () => bazaarBg(GY));
  layer(1, () => {
    crowd(1080, GY, 14, 1650, f, 13, false);
    if (f > 8) { const p = spring((f - 8) / 12); ctx.save(); ctx.translate(1080, 1100); ctx.scale(p, p);
      boardSign(0, 0, 780, 160, [['INDIA: 50 CRORE+', 76, '#c96f2e']]); ctx.restore(); }
  });
}, []);
// N17 (1257-1332) L17: har aadmi, din me sau baar, ek hi jagah
shot(1257, 1332, 0.28, { cx: 1080, cy: 1520, s: 0.58 }, { cx: 1080, cy: 1500, s: 0.68 }, (f, u) => {
  f -= 1257;
  layer(0.55, () => bazaarBg(GY));
  layer(1, () => {
    crowd(1080, GY, 14, 1650, f, 17, true);
    if (f > 16) text('HAR AADMI... EK HI JAGAH!', 1080, 1100, 62, '#ffe9a8');
  });
}, []);
// N18 (1332-1399) L18a: ab usi bheed ko paisa banaya ja raha hai
shot(1332, 1399, 0.3, { cx: 1080, cy: 1480, s: 0.78 }, { cx: 1080, cy: 1460, s: 0.9 }, (f, u) => {
  f -= 1332;
  layer(0.55, () => metaHall(GY));
  layer(1, () => {
    heroFig(680, GY, 1.95, { expr: 'smug', armR: 'point', seed: 5 }, f);
    chatPhone(1470, 1620, 470, 760, 0, 0.95);
    coinStack(1470, GY, 1 + Math.min(4, Math.floor(f / 14)));
    if (f > 10) text('AB PAISA BAN RAHA HAI!', 1080, 1060, 60, '#ffe9a8');
  });
}, []);
// N19 (1399-1541) L18b+c: har business WhatsApp par — chat list badhti hui
shot(1399, 1541, 0.3, { cx: 1080, cy: 1460, s: 0.82 }, { cx: 1080, cy: 1440, s: 0.94 }, (f, u) => {
  f -= 1399;
  layer(0.55, () => homeRoom(GY));
  layer(1, () => {
    heroFig(700, GY, 1.85, { expr: 'happy', seed: 5 }, f);
    chatPhone(1400, 1560, 540, 900, 1, 0.97, 1 + Math.min(3, Math.floor(f / 30)));
  });
}, []);
// N20 (1541-1607) L18d: business Meta ko paise deta hai
shot(1541, 1607, 0.3, { cx: 1080, cy: 1500, s: 0.6 }, { cx: 1080, cy: 1480, s: 0.7 }, (f, u) => {
  f -= 1541;
  layer(0.55, () => metaHall(GY));
  layer(1, () => {
    heroFig(560, GY, 1.8, { preset: BOSS_P, expr: 'calm', armR: 'offer', seed: 3 }, f);
    heroFig(880, GY, 1.8, { preset: WORKER_P, expr: 'calm', armR: 'offer', seed: 9 }, f);
    heroFig(1200, GY, 1.8, { preset: SHOP_P, expr: 'calm', armR: 'offer', seed: 8 }, f);
    coinStack(1620, GY, 2 + Math.min(5, Math.floor(f / 11)), 'META KO');
  });
}, [1560]);
// N21 (1607-1747) L19: message karo wale vigyapan — hazaaron crore
shot(1607, 1747, 0.3, { cx: 1080, cy: 1460, s: 0.85 }, { cx: 1080, cy: 1440, s: 0.97 }, (f, u) => {
  f -= 1607;
  layer(0.55, () => homeRoom(GY));
  layer(1, () => {
    chatPhone(1080, 1560, 560, 920, 2, 0.97);
    if (f > 60) { const p = spring((f - 60) / 13); ctx.save(); ctx.translate(1080, 900); ctx.scale(p, p);
      boardSign(0, 0, 880, 140, [['HAZAARON CRORE / SAAL', 54, '#0c831f']]); ctx.restore(); }
  });
}, [1700]);
// N22 (1747-1838) L20a: free isliye nahi ki keemat nahi hai
shot(1747, 1838, 0.3, { cx: 1080, cy: 1440, s: 1.0 }, { cx: 1080, cy: 1420, s: 1.12 }, (f, u) => {
  f -= 1747;
  layer(0.55, () => homeRoom(GY));
  layer(1, () => {
    heroFig(1080, GY, 2.25, { expr: 'calm', seed: 5 }, f);
    if (f > 12) text('KEEMAT TO HAI...', 1080, 1040, 60, '#ffe9a8');
  });
}, []);
// N23 (1838-1958) L20b+c: bill tumhe nahi — tum tak pahuchne walo ko
shot(1838, 1958, 0.3, { cx: 1080, cy: 1480, s: 0.72 }, { cx: 1080, cy: 1460, s: 0.84 }, (f, u) => {
  f -= 1838;
  layer(0.55, () => homeRoom(GY));
  layer(1, () => {
    heroFig(620, GY, 1.95, { expr: 'smug', armR: 'offer', seed: 5 }, f);
    heroFig(1560, GY, 1.85, { preset: BOSS_P, expr: 'calm', seed: 3 }, f);
    const bx = 800 + Math.min(1, f / 70) * 620, by = 1750 - Math.sin(Math.min(1, f / 70) * Math.PI) * 260;
    billDraw(bx, by, 1.1, Math.sin(f * 0.06) * 0.15);
    if (f > 40) text('BILL PAHUCHNE WALO KO!', 1080, 1080, 56, '#ffe9a8');
  });
}, []);
// N24 (1958-2082) L21: punchline — SABSE MEHNGA PATA (callback)
shot(1958, 2082, 0.32, { cx: 1080, cy: 1480, s: 0.78 }, { cx: 1080, cy: 1460, s: 0.9 }, (f, u) => {
  f -= 1958;
  layer(0.55, () => homeRoom(GY));
  layer(1, () => {
    heroFig(800, GY, 2.05, { expr: 'smug', armR: 'phone', seed: 5 }, f);
    const drop = f < 26 ? spring(f / 26) : 1;
    pinDraw(1470, 1180 + (1 - drop) * -420, Math.max(0.01, 1.35 * drop), '#c62828');
    if (f > 30) { const p = spring((f - 30) / 13); ctx.save(); ctx.translate(1250, 1560); ctx.scale(p, p);
      boardSign(0, 0, 800, 150, [['SABSE MEHNGA PATA!', 56, '#8a1f1f']]); ctx.restore(); }
  });
}, [1985]);

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
