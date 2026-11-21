// Free Car Ka Asli Bill — kahani-style Short (2089 frames @30fps, 1080x1920). Baal-jaisa scene-by-scene.
// User direction: Baal-jaisa scene-by-scene story feel, aur behtar.
// Opening me NO character, NO board — real-jaisa scene: raat ka dark
// store, riders, packing. Sirf in-world signage (shop par BLINKIT naam).
// Harness: window.ready, window.renderFrame(f), window.TOTAL.
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import * as D from './draw.js';

const W = 1080, H = 1920, TOTAL = 2089, FPS = 30;
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
shot(0, 60, 0.26, { cx: 1080, cy: 1620, s: 1.0 }, { cx: 1050, cy: 1560, s: 1.12 }, (f, u) => {
  f -= 0;
  layer(0.35, () => {
    deskSet(2380, '#3a4a66');
    ctx.fillStyle = '#ffe9b0'; D.rr(ctx, 1420, 240, 460, 560, 14); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = 'rgba(255,233,168,0.20)'; D.poly(ctx, [[1460, 800], [1840, 800], [2050, 2380], [1250, 2380]]); ctx.fill();
    D.drawCalendar(ctx, 450, 700, 1.1, f);
  });
  layer(1, () => {
    heroFig(1060, 2400, 1.6, { expr: 'calm', armR: 'phone', face: 0.25, seed: 5 }, f);
    D.drawPlant(ctx, 620, 2380, 1.3, f);
    lampPool(1080, 1300, 1000, 0.14);
  });
}, []);
// ===== A2 (60-113) — bank app close-up: SALARY AAYI =====
shot(60, 114, 0.3, { cx: 1080, cy: 1250, s: 1.0 }, { cx: 1080, cy: 1250, s: 1.12 }, (f, u) => {
  f -= 60;
  layer(0.4, () => vgrad(-400, 2600, [[0, '#131c30'], [1, '#22345a']]));
  layer(1, () => {
    ctx.save(); ctx.translate(1080, 1250); ctx.rotate(Math.sin(f * 0.05) * 0.012); ctx.translate(-1080, -1250);
    bankApp(1080, 1250, 620, 920, 0, spring(D.clamp(f / 12, 0, 1)));
    ctx.restore();
    if (f > 26) { const p = spring((f - 26) / 10); ctx.save(); ctx.translate(1470, 700); ctx.scale(p, p); D.drawSparkle(ctx, 0, 0, 46, 0.9); ctx.restore(); }
  });
}, []);
// ===== A3 (114-206) — KIST kat gayi, hero shocked =====
shot(114, 207, 0.32, { cx: 1080, cy: 1420, s: 0.98 }, { cx: 1080, cy: 1420, s: 1.06 }, (f, u) => {
  f -= 114;
  layer(0.4, () => vgrad(-400, 2600, [[0, '#1a1426'], [1, '#33233a']]));
  layer(1, () => {
    bankApp(800, 1260, 600, 880, 1, spring(D.clamp(f / 10, 0, 1)));
    heroFig(1470, 2400, 1.5, { expr: f > 22 ? 'shocked' : 'calm', armR: f > 22 ? 'up' : 'phone', sweat: f > 30, seed: 5 }, f);
  });
}, [140]);
// ===== A4 (207-278) — na shopping, na bill... puzzled =====
shot(207, 279, 0.28, { cx: 1080, cy: 1500, s: 1.08 }, { cx: 1080, cy: 1470, s: 1.2 }, (f, u) => {
  f -= 207;
  layer(0.35, () => deskSet(2420, '#3a4a66'));
  layer(1, () => {
    heroFig(1080, 2420, 1.9, { expr: 'puzzled', armL: 'scratch', face: Math.sin(f * 0.04) * 0.4, seed: 5 }, f);
    D.drawQuestion(ctx, 700, 1300, 1.1, f);
    D.drawQuestion(ctx, 1400, 1120, 0.7, f + 30);
  });
}, []);
// ===== B1 (279-323) — Paisa gaya kahan? =====
shot(279, 324, 0.28, { cx: 1080, cy: 1500, s: 0.95 }, { cx: 1080, cy: 1480, s: 1.06 }, (f, u) => {
  f -= 279;
  layer(0.35, () => deskSet(2400, '#37455e'));
  layer(1, () => {
    heroFig(1030, 2400, 1.6, { expr: 'puzzled', armR: 'point', face: 0.3, seed: 5 }, f);
    D.drawQuestion(ctx, 1420, 1280, 1.5, f);
  });
}, []);
// ===== B2 (324-389) — rewind: calendar peeche, flashback =====
shot(324, 390, 0.34, { cx: 1080, cy: 1250, s: 0.95 }, { cx: 1080, cy: 1250, s: 1.05 }, (f, u) => {
  f -= 324;
  layer(0.4, () => vgrad(-400, 2600, [[0, '#141a2c'], [1, '#27354f']]));
  layer(1, () => {
    const num = 21 - Math.floor(D.clamp(f / 55, 0, 1) * 20);
    D.drawFlipCal(ctx, 900, 1180, 2.3, Math.max(1, num));
    ctx.save(); ctx.translate(1420, 1180);
    D.circ(ctx, 0, 0, 130); D.fillStroke(ctx, '#f5edd8', 7);
    const ang = -f * 0.55;
    ctx.strokeStyle = D.OUT; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang) * 78, Math.sin(ang) * 78); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang * 0.4 + 2) * 100, Math.sin(ang * 0.4 + 2) * 100); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = 'rgba(220,232,255,0.30)'; ctx.lineWidth = 5;
    for (let i = 0; i < 4; i++) { const yy = 700 + i * 260, oo = (f * 14 + i * 130) % 700; ctx.beginPath(); ctx.moveTo(300 + oo, yy); ctx.lineTo(430 + oo, yy); ctx.stroke(); }
  });
  warmTint(D.clamp((f - 40) / 25, 0, 1) * 0.13);
}, []);
// ===== C1 (390-452) — office wide, 5 saal se kaam =====
shot(390, 453, 0.24, { cx: 1080, cy: 1500, s: 0.62 }, { cx: 1080, cy: 1480, s: 0.7 }, (f, u) => {
  f -= 390;
  layer(0.4, () => officeWall(2380));
  layer(0.7, () => {
    for (const dx of [480, 1680]) {
      ctx.fillStyle = '#6b4e33'; D.rr(ctx, dx - 190, 2050, 380, 60, 8); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = '#22303f'; D.rr(ctx, dx - 80, 1830, 160, 190, 8); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = '#7fd4ff'; ctx.fillRect(dx - 66, 1846, 132, 120);
    }
  });
  layer(1, () => {
    heroFig(700, 2400, 1.2, { expr: 'calm', face: 0.3, seed: 5 }, f);
    heroFig(1520, 2400, 1.2, { preset: COLL_P, expr: 'calm', face: -0.3, seed: 9 }, f + 40);
    ctx.fillStyle = '#5d4630'; D.rr(ctx, 1470, 1560, 300, 560, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
    text('BOSS', 1620, 1660, 52, '#ffd98a');
    lampPool(1080, 1200, 1300, 0.13);
  });
  warmTint(0.10);
}, []);
// ===== C2 (453-518) — boss ne bulaya =====
shot(453, 519, 0.26, { cx: 1150, cy: 1500, s: 0.95 }, { cx: 1150, cy: 1480, s: 1.05 }, (f, u) => {
  f -= 453;
  layer(0.4, () => officeWall(2400));
  layer(1, () => {
    ctx.fillStyle = '#5d4630'; D.rr(ctx, 1560, 1300, 420, 830, 12); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
    heroFig(1420, 2400, 1.4, { preset: BOSS_P, expr: 'happy', armR: 'up', face: -0.4, seed: 3 }, f);
    heroFig(760, 2400, 1.35, { expr: f > 20 ? 'surprise' : 'calm', face: D.lerp(-0.3, 0.45, D.clamp(f / 30, 0, 1)), seed: 5 }, f);
    lampPool(1150, 1200, 1200, 0.13);
  });
  warmTint(0.10);
}, []);
// ===== C3 (519-578) — cabin: chaabi badhayi =====
shot(519, 579, 0.26, { cx: 1080, cy: 1480, s: 1.0 }, { cx: 1080, cy: 1460, s: 1.12 }, (f, u) => {
  f -= 519;
  layer(0.4, () => {
    vgrad(-400, 2500, [[0, '#54432c'], [1, '#77603c']]);
    ctx.fillStyle = '#4a3b2c'; ctx.fillRect(-800, 2400, 3760, 1440);
    ctx.fillStyle = '#cfe4f2'; D.rr(ctx, 1560, 260, 420, 520, 12); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
  });
  layer(1, () => {
    heroFig(1300, 2400, 1.5, { preset: BOSS_P, expr: 'happy', armR: 'offer', face: -0.35, seed: 3 }, f);
    keyDraw(1300 + 215, 2400 - 345, 1.7, Math.sin(f * 0.06) * 0.15);
    heroFig(800, 2400, 1.45, { expr: f > 14 ? 'surprise' : 'calm', face: 0.4, seed: 5 }, f);
    lampPool(1080, 1150, 1200, 0.16);
  });
  warmTint(0.10);
}, []);
// ===== C4 (579-665) — chaabi close-up + hero khushi =====
shot(579, 666, 0.24, { cx: 1080, cy: 1400, s: 1.0 }, { cx: 1080, cy: 1400, s: 1.08 }, (f, u) => {
  f -= 579;
  layer(0.4, () => vgrad(-400, 2600, [[0, '#2c2118'], [1, '#4a3826']]));
  layer(1, () => {
    if (f < 46) {
      const p = spring(D.clamp(f / 12, 0, 1));
      ctx.save(); ctx.translate(1080, 1180); ctx.scale(p, p); ctx.rotate(Math.sin(f * 0.05) * 0.1);
      keyDraw(0, 0, 3.4, 0);
      ctx.restore();
      if (f > 10) D.drawLabel(ctx, 1080, 1520, 'GIFT!', spring((f - 10) / 10), '#ffd23f', -0.04);
      for (let i = 0; i < 3; i++) { const sp = spring(D.clamp((f - 8 - i * 7) / 10, 0, 1)); ctx.save(); ctx.translate(760 + i * 300, 830 - (i % 2) * 130); ctx.scale(sp, sp); D.drawSparkle(ctx, 0, 0, 40, 0.9); ctx.restore(); }
    } else {
      heroFig(1080, 2420, 1.7, { expr: 'happy', armL: 'up', armR: 'up', seed: 5 }, f);
    }
    lampPool(1080, 1150, 1100, 0.15);
  });
  warmTint(0.10);
}, [591]);
// ===== C5 (666-725) — bahar: nayi car ribbon ke saath =====
shot(666, 726, 0.22, { cx: 1080, cy: 1500, s: 0.78 }, { cx: 1080, cy: 1480, s: 0.88 }, (f, u) => {
  f -= 666;
  layer(0.3, () => {
    vgrad(-400, 2400, [[0, '#7fb2d9'], [0.7, '#cfe8f7'], [1, '#e8f4e0']]);
    ctx.fillStyle = '#5a6b7d'; ctx.fillRect(120, 900, 700, 1500); ctx.fillRect(1400, 800, 640, 1600);
    ctx.fillStyle = '#33506e'; ctx.fillRect(90, 830, 760, 80); ctx.fillRect(1370, 730, 700, 80);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { ctx.fillStyle = 'rgba(255,240,180,0.75)'; ctx.fillRect(190 + i * 105, 1000 + j * 300, 56, 90); }
    ctx.fillStyle = '#7a7f87'; ctx.fillRect(-800, 2380, 3760, 1460);
  });
  layer(1, () => {
    carSide(1230, 2360, 1.45, '#c62828', f * 0.02, { ribbon: true });
    heroFig(620, 2400, 1.3, { expr: 'happy', armR: 'up', face: 0.45, seed: 5 }, f);
  });
  warmTint(0.08);
}, []);
// ===== C6 (726-803) — Papa, car mil gayi! =====
shot(726, 804, 0.24, { cx: 1080, cy: 1480, s: 0.9 }, { cx: 1060, cy: 1460, s: 1.0 }, (f, u) => {
  f -= 726;
  layer(0.3, () => {
    vgrad(-400, 2400, [[0, '#7fb2d9'], [0.7, '#cfe8f7'], [1, '#e8f4e0']]);
    ctx.fillStyle = '#5a6b7d'; ctx.fillRect(1300, 900, 760, 1500);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { ctx.fillStyle = 'rgba(255,240,180,0.7)'; ctx.fillRect(1380 + i * 160, 1020 + j * 300, 80, 120); }
    ctx.fillStyle = '#7a7f87'; ctx.fillRect(-800, 2380, 3760, 1460);
  });
  layer(0.7, () => carSide(1520, 2360, 1.3, '#c62828', 0, { ribbon: true }));
  layer(1, () => {
    heroFig(800, 2400, 1.6, { expr: 'happy', armR: 'phone', face: 0.3, seed: 5 }, f);
    if (f > 16) D.drawLabel(ctx, 1300, 1250, 'PAPA, CAR MIL GAYI!', spring((f - 16) / 12), '#ffd23f', 0.03);
    lampPool(950, 1200, 1000, 0.10);
  });
  warmTint(0.08);
}, []);
// ===== C7 (804-848) — office me mithaas =====
shot(804, 849, 0.24, { cx: 1080, cy: 1500, s: 0.82 }, { cx: 1080, cy: 1490, s: 0.88 }, (f, u) => {
  f -= 804;
  layer(0.4, () => officeWall(2400));
  layer(1, () => {
    heroFig(700, 2400, 1.25, { preset: COLL_P, expr: 'happy', armL: 'up', armR: 'up', face: 0.4, seed: 9 }, f + 20);
    heroFig(1460, 2400, 1.25, { preset: BOSS_P, expr: 'happy', armL: 'up', armR: 'up', face: -0.4, seed: 3 }, f + 50);
    heroFig(1080, 2400, 1.45, { expr: 'happy', armR: 'hold', seed: 5 }, f);
    mithaasBox(1080 + 185, 2400 - 315, 1.15);
    lampPool(1080, 1200, 1200, 0.13);
  });
  warmTint(0.10);
}, []);
// ===== D1 (849-932) — calendar aage, aaj par wapas =====
shot(849, 933, 0.3, { cx: 1080, cy: 1300, s: 0.95 }, { cx: 1080, cy: 1350, s: 1.0 }, (f, u) => {
  f -= 849;
  layer(0.4, () => vgrad(-400, 2600, [[0, '#27354f'], [1, '#3a4a66']]));
  layer(1, () => {
    const num = 1 + Math.floor(D.clamp(f / 55, 0, 1) * 20);
    D.drawFlipCal(ctx, 1080, 1180, 2.3, Math.min(30, num));
    if (f > 58) { ctx.save(); ctx.globalAlpha = D.clamp((f - 58) / 20, 0, 1); heroFig(1080, 2400, 1.4, { expr: 'calm', armR: 'phone', face: 0.2, seed: 5 }, f); ctx.restore(); }
  });
  warmTint(D.clamp(1 - f / 60, 0, 1) * 0.12);
}, []);
// ===== D2 (933-989) — PEHLI KIST reveal =====
shot(933, 990, 0.32, { cx: 1080, cy: 1420, s: 0.98 }, { cx: 1080, cy: 1420, s: 1.06 }, (f, u) => {
  f -= 933;
  layer(0.4, () => vgrad(-400, 2600, [[0, '#1a1426'], [1, '#33233a']]));
  layer(1, () => {
    bankApp(800, 1260, 600, 880, 1, spring(D.clamp(f / 10, 0, 1)));
    if (f > 18) D.drawLabel(ctx, 800, 600, 'PEHLI KIST!', spring((f - 18) / 10), '#ff6b5e', -0.03);
    heroFig(1470, 2400, 1.5, { expr: f > 16 ? 'worried' : 'calm', headDip: 0.3, seed: 5 }, f);
  });
}, [957]);

// ===== E1 (990-1037) — ye koi kahani NAHI hai =====
shot(990, 1038, 0.3, { cx: 1080, cy: 1400, s: 0.95 }, { cx: 1080, cy: 1400, s: 1.05 }, (f, u) => {
  f -= 990;
  layer(0.4, () => vgrad(-400, 2600, [[0, '#20242c'], [1, '#333a45']]));
  layer(1, () => {
    ctx.save(); ctx.translate(1080, 1250); ctx.rotate(-0.03);
    ctx.fillStyle = '#f5edd8'; D.rr(ctx, -430, -480, 860, 960, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 7; ctx.stroke();
    text('ASLI KHABAR', 0, -380, 84, '#8a1f1f');
    ctx.fillStyle = '#4a4234'; ctx.fillRect(-370, -310, 740, 10);
    text('COMPANY KI FREE CAR', 0, -215, 58, '#26221f');
    text('KA ASLI BILL', 0, -140, 58, '#26221f');
    ctx.fillStyle = '#8a8172'; for (let i = 0; i < 5; i++) ctx.fillRect(-370, -40 + i * 62, 740 - (i % 3) * 90, 22);
    ctx.restore();
    if (f > 14) D.drawLabel(ctx, 1080, 2050, 'KAHANI NAHI, HAQEEQAT!', spring((f - 14) / 10), '#ffd23f', -0.02);
  });
}, []);
// ===== E2 (1038-1121) — Chandigarh: 4 saal se car =====
shot(1038, 1122, 0.24, { cx: 1080, cy: 1450, s: 0.7 }, { cx: 1080, cy: 1430, s: 0.78 }, (f, u) => {
  f -= 1038;
  layer(0.3, () => {
    vgrad(-400, 2400, [[0, '#7fb2d9'], [0.75, '#cfe8f7'], [1, '#e8f4e0']]);
    ctx.fillStyle = '#5a6b7d'; ctx.fillRect(430, 500, 1300, 1900);
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { ctx.fillStyle = 'rgba(255,240,180,0.8)'; ctx.fillRect(520 + i * 240, 640 + j * 320, 130, 170); }
    ctx.fillStyle = '#7a7f87'; ctx.fillRect(-800, 2380, 3760, 1460);
  });
  layer(1, () => {
    carSide(1080, 2370, 1.2, '#2e7d46', 0, { ribbon: true });
    if (f > 12) boardSign(1080, 620, 980, 180, [['4 SAAL SE HAR SAAL CAR!', 66, '#8a1f1f']], spring((f - 12) / 12));
  });
}, []);
// ===== E3 (1122-1202) — Jodhpur: chaar-chaar car =====
shot(1122, 1203, 0.24, { cx: 1080, cy: 1500, s: 0.62 }, { cx: 1080, cy: 1480, s: 0.7 }, (f, u) => {
  f -= 1122;
  layer(0.3, () => {
    vgrad(-400, 2400, [[0, '#8fb8d8'], [0.75, '#d8ecf7'], [1, '#f2e8d8']]);
    ctx.fillStyle = '#e8e2d2'; ctx.fillRect(-800, 700, 3760, 900);
    ctx.fillStyle = '#33506e'; ctx.fillRect(-800, 700, 3760, 90);
    text('CAR SHOWROOM — JODHPUR', 1080, 745, 54, '#ffd98a');
    ctx.fillStyle = '#8a8f97'; ctx.fillRect(-800, 2380, 3760, 1460);
  });
  layer(0.65, () => { carSide(560, 1850, 0.8, '#2b3a55', 0, { ribbon: true }); carSide(1600, 1850, 0.8, '#e8b64c', 0, { ribbon: true }); });
  layer(1, () => {
    carSide(640, 2380, 1.1, '#c62828', 0, { ribbon: true });
    carSide(1560, 2380, 1.1, '#3f7d5d', 0, { ribbon: true });
  });
}, []);
// ===== F1 (1203-1298) — sach: sirf 30% company ne diya =====
shot(1203, 1299, 0.28, { cx: 1080, cy: 1450, s: 0.8 }, { cx: 1080, cy: 1430, s: 0.88 }, (f, u) => {
  f -= 1203;
  layer(0.35, () => vgrad(-400, 2600, [[0, '#26221f'], [1, '#40382c']]));
  layer(1, () => {
    carSide(1080, 1900, 1.7, '#7a7f87', 0, {});
    const cut = 1080 - 462 + 924 * 0.30;
    ctx.save(); ctx.beginPath(); ctx.rect(1080 - 462, 1330, cut - (1080 - 462), 640); ctx.clip();
    carSide(1080, 1900, 1.7, '#2e7d46', 0, {});
    ctx.restore();
    ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 7; ctx.setLineDash([18, 12]); ctx.beginPath(); ctx.moveTo(cut, 1330); ctx.lineTo(cut, 1970); ctx.stroke(); ctx.setLineDash([]);
    if (f > 14) D.drawLabel(ctx, 800, 950, 'COMPANY 30%', spring((f - 14) / 10), '#7ed491', -0.03);
    if (f > 30) D.drawLabel(ctx, 1450, 950, 'TUM 70%', spring((f - 30) / 10), '#ff6b5e', 0.03);
  });
}, []);
// ===== F2 (1299-1379) — loan TUMHARE naam par =====
shot(1299, 1380, 0.3, { cx: 1080, cy: 1400, s: 0.85 }, { cx: 1080, cy: 1400, s: 0.94 }, (f, u) => {
  f -= 1299;
  layer(0.35, () => {
    vgrad(-400, 2500, [[0, '#31435f'], [1, '#46586f']]);
    ctx.fillStyle = '#4a3b2c'; ctx.fillRect(-800, 2400, 3760, 1440);
  });
  layer(0.7, () => D.drawBank(ctx, 700, 1300, 1.1));
  layer(1, () => {
    D.drawDebtPaper(ctx, 1330, 1220, 1.65, spring(D.clamp(f / 14, 0, 1)));
    if (f > 22) {
      ctx.save(); ctx.translate(1330, 1180); ctx.rotate(-0.12); ctx.scale(spring((f - 22) / 8), spring((f - 22) / 8));
      ctx.strokeStyle = '#c62828'; ctx.lineWidth = 7; D.rr(ctx, -330, -62, 660, 124, 12); ctx.stroke();
      text('TUMHARE NAAM', 0, 0, 74, '#c62828');
      ctx.restore();
    }
    heroFig(600, 2420, 1.3, { expr: 'worried', face: 0.4, seed: 5 }, f);
  });
}, [1321]);
// ===== F3 (1380-1439) — kist salary se kat-ti hai =====
shot(1380, 1440, 0.3, { cx: 1080, cy: 1400, s: 0.9 }, { cx: 1080, cy: 1400, s: 0.98 }, (f, u) => {
  f -= 1380;
  layer(0.35, () => deskSet(2420, '#3a4a66'));
  layer(1, () => {
    ctx.save(); ctx.translate(980, 1230);
    ctx.fillStyle = '#fdf6e3'; D.rr(ctx, -360, -470, 720, 940, 12); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
    text('SALARY SLIP', 0, -390, 56, '#26221f');
    ctx.fillStyle = '#8a8172'; for (let i = 0; i < 3; i++) ctx.fillRect(-300, -280 + i * 80, 470, 26);
    const cw = D.clamp((f - 12) / 26, 0, 1) * 600;
    ctx.fillStyle = 'rgba(200,40,40,0.13)'; ctx.fillRect(-300, -20, 600, 84);
    text('CAR KIST', -285, 22, 44, '#8a1f1f', 'left');
    text('-₹12,000', 285, 22, 46, '#c62828', 'right');
    ctx.strokeStyle = '#c62828'; ctx.lineWidth = 5; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.moveTo(-300 + cw, -50); ctx.lineTo(-300 + cw, 94); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    heroFig(1500, 2420, 1.15, { expr: 'worried', headDip: 0.25, seed: 5 }, f);
  });
}, []);
// ===== F4 (1440-1538) — hisaab board =====
shot(1440, 1539, 0.3, { cx: 1080, cy: 1400, s: 0.78 }, { cx: 1080, cy: 1400, s: 0.84 }, (f, u) => {
  f -= 1440;
  layer(0.35, () => vgrad(-400, 2600, [[0, '#26221f'], [1, '#40382c']]));
  layer(1, () => {
    ctx.fillStyle = '#f5edd8'; D.rr(ctx, 1080 - 470, 700, 940, 1050, 14); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 7; ctx.stroke();
    text('CAR KI KEEMAT', 1080, 810, 52, '#4a4234');
    text('₹8,00,000', 1080, 920, 96, '#26221f');
    if (f > 16) { text('COMPANY NE DIYE', 1080, 1120, 48, '#4a4234'); text('₹2,50,000', 1080, 1230, 88, '#0c831f'); }
    if (f > 44) { text('TUMHARE LOAN', 1080, 1430, 48, '#4a4234'); text('₹5,50,000', 1080, 1540, 88, '#c62828'); }
    heroFig(1640, 2420, 1.15, { expr: 'puzzled', armR: 'point', face: -0.5, seed: 5 }, f);
  });
}, [1490]);
// ===== F5 (1539-1652) — byaaj ke saath 7 lakh =====
shot(1539, 1653, 0.32, { cx: 1080, cy: 1450, s: 0.85 }, { cx: 1080, cy: 1450, s: 0.92 }, (f, u) => {
  f -= 1539;
  layer(0.35, () => vgrad(-400, 2600, [[0, '#2a1f26'], [1, '#453040']]));
  layer(1, () => {
    const bx = 620, bw = 620, base = 1900;
    const h1 = 520 * spring(D.clamp(f / 20, 0, 1));
    ctx.fillStyle = '#8a5a2b'; ctx.fillRect(bx, base - h1, bw, h1); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.strokeRect(bx, base - h1, bw, h1);
    text('LOAN', bx + bw / 2, base - h1 - 130, 50, '#e8b64c');
    text('₹5,50,000', bx + bw / 2, base - h1 - 55, 58, '#fdf6e3');
    if (f > 34) {
      const h2 = 190 * spring(D.clamp((f - 34) / 22, 0, 1));
      ctx.fillStyle = '#c62828'; ctx.fillRect(bx, base - h1 - h2, bw, h2); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.strokeRect(bx, base - h1 - h2, bw, h2);
      text('+ BYAAJ', bx + bw / 2, base - h1 - h2 - 130, 50, '#ff6b5e');
      text('= ₹7,00,000', bx + bw / 2, base - h1 - h2 - 55, 64, '#ff6b5e');
    }
    ctx.fillStyle = '#4a3b2c'; ctx.fillRect(-800, base, 3760, 60);
    heroFig(1560, 2420, 1.4, { expr: f > 40 ? 'shocked' : 'worried', sweat: f > 40, seed: 5 }, f);
  });
}, [1595]);
// ===== G1 (1653-1721) — LOAN TUMHARE NAAM (close) =====
shot(1653, 1722, 0.32, { cx: 1080, cy: 1350, s: 1.0 }, { cx: 1080, cy: 1350, s: 1.1 }, (f, u) => {
  f -= 1653;
  layer(0.4, () => vgrad(-400, 2600, [[0, '#1c1620'], [1, '#2e2432']]));
  layer(1, () => {
    D.drawDebtPaper(ctx, 1080, 1120, 2.6, spring(D.clamp(f / 12, 0, 1)));
    if (f > 16) {
      ctx.save(); ctx.translate(1080, 1180); ctx.scale(spring((f - 16) / 10), spring((f - 16) / 10));
      ctx.strokeStyle = '#c62828'; ctx.lineWidth = 10; D.circ(ctx, 0, 0, 400); ctx.stroke();
      ctx.restore();
      text('NAAM: TUMHARA', 1080, 1700, 80, '#c62828');
    }
    if (f > 30) heroFig(1080, 2480, 1.1, { expr: 'shocked', seed: 5 }, f);
  });
}, [1669]);
// ===== G2 (1722-1787) — naukri chhodne ka socha... =====
shot(1722, 1788, 0.3, { cx: 1080, cy: 1560, s: 0.9 }, { cx: 1080, cy: 1560, s: 0.97 }, (f, u) => {
  f -= 1722;
  layer(0.4, () => officeWall(2400));
  layer(1, () => {
    ctx.fillStyle = '#5d4630'; D.rr(ctx, 1300, 1250, 340, 900, 12); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
    text('BOSS', 1470, 1360, 54, '#ffd98a');
    heroFig(880, 2400, 1.55, { expr: 'worried', armR: 'hold', face: Math.sin(f * 0.05) * 0.2, seed: 5 }, f);
    const drop = D.clamp((f - 34) / 16, 0, 1);
    ctx.save(); ctx.translate(880 + 200, 2400 - 330 + drop * 270); ctx.rotate(drop * 0.7); ctx.scale(1 - drop * 0.2, 1 - drop * 0.2);
    ctx.fillStyle = '#fdf6e3'; D.rr(ctx, -54, -72, 108, 144, 5); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#8a8172'; for (let i = 0; i < 4; i++) ctx.fillRect(-38, -44 + i * 26, 76 - (i % 2) * 18, 9);
    ctx.restore();
    lampPool(1080, 1200, 1100, 0.12);
  });
}, []);
// ===== G3 (1788-1853) — car tumhari hai, sach hai =====
shot(1788, 1854, 0.26, { cx: 1080, cy: 1480, s: 0.82 }, { cx: 1080, cy: 1470, s: 0.9 }, (f, u) => {
  f -= 1788;
  layer(0.3, () => {
    vgrad(-400, 2400, [[0, '#7fb2d9'], [0.75, '#cfe8f7'], [1, '#e8f4e0']]);
    ctx.fillStyle = '#7a7f87'; ctx.fillRect(-800, 2380, 3760, 1460);
  });
  layer(1, () => {
    carSide(1250, 2370, 1.35, '#c62828', 0, {});
    heroFig(600, 2400, 1.35, { expr: f < 30 ? 'happy' : 'puzzled', armR: f < 30 ? 'up' : 'scratch', face: 0.4, seed: 5 }, f);
  });
}, []);
// ===== G4 (1854-1934) — bandhan: 5 saal ki chain =====
shot(1854, 1935, 0.3, { cx: 1080, cy: 1500, s: 0.8 }, { cx: 1080, cy: 1500, s: 0.86 }, (f, u) => {
  f -= 1854;
  layer(0.3, () => {
    vgrad(-400, 2400, [[0, '#5d7ea6'], [0.75, '#a8c6e0'], [1, '#d8e4ee']]);
    ctx.fillStyle = '#7a7f87'; ctx.fillRect(-800, 2380, 3760, 1460);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 8;
    for (let i = 0; i < 5; i++) { const xx = 200 + i * 480 - (f * 16) % 480; ctx.beginPath(); ctx.moveTo(xx, 2620); ctx.lineTo(xx + 220, 2620); ctx.stroke(); }
  });
  layer(0.55, () => {
    ctx.fillStyle = '#4a5568'; ctx.fillRect(-350 - (f * 3) % 60, 1500, 420, 880);
    text('OFFICE', -140 - (f * 3) % 60, 1600, 46, '#ffd98a');
  });
  layer(1, () => {
    carSide(1180, 2370, 1.4, '#c62828', f * 0.25, { tag: '5 SAAL' });
    ctx.strokeStyle = '#3a3f47'; ctx.lineWidth = 13;
    ctx.beginPath();
    for (let i = 0; i < 7; i++) { const lx = 830 - i * 105, ly = 2290 + Math.sin(i * 1.4 + f * 0.1) * 12; if (i === 0) ctx.moveTo(lx, ly); else ctx.lineTo(lx, ly); }
    ctx.stroke();
  });
}, [1880]);
// ===== H1 (1935-2021) — agli salary, phir kist =====
shot(1935, 2022, 0.28, { cx: 1080, cy: 1500, s: 0.92 }, { cx: 1050, cy: 1480, s: 1.02 }, (f, u) => {
  f -= 1935;
  layer(0.35, () => {
    deskSet(2380, '#3a4a66');
    ctx.fillStyle = '#ffe9b0'; D.rr(ctx, 1420, 240, 460, 560, 14); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 6; ctx.stroke();
    D.drawCalendar(ctx, 330, 420, 1.1, f);
  });
  layer(1, () => {
    heroFig(980, 2400, 1.62, { expr: 'calm', armR: 'phone', face: 0.25, headDip: f > 34 ? 0.12 : 0, seed: 5 }, f);
    if (f > 26) { ctx.save(); ctx.translate(1470, 1080); ctx.scale(spring((f - 26) / 10) * 0.8, spring((f - 26) / 10) * 0.8); ctx.translate(-1080, -1250); bankApp(1080, 1250, 620, 920, 2, 1); ctx.restore(); }
    lampPool(1000, 1300, 1000, 0.13);
  });
}, [1961]);
// ===== H2 (2022-2088) — gift wo hota hai, jiska bill na aaye =====
shot(2022, 2089, 0.42, { cx: 1080, cy: 1450, s: 1.05 }, { cx: 1080, cy: 1430, s: 1.16 }, (f, u) => {
  f -= 2022;
  layer(0.35, () => deskSet(2420, '#37455e'));
  layer(1, () => {
    heroFig(1080, 2420, 1.75, { expr: 'calm', face: Math.sin(f * 0.03) * 0.15, seed: 5 }, f);
    if (f > 18) boardSign(1080, 920, 1020, 200, [['GIFT WOHI...', 62, '#4a4234'], ['JISKA BILL NA AAYE!', 72, '#8a1f1f']], spring((f - 18) / 12));
    lampPool(1080, 1250, 1100, 0.15);
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
