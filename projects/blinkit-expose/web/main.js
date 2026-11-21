// Blinkit Expose — 10s SAMPLE (300 frames @30fps, 1080x1920).
// User direction: Baal-jaisa scene-by-scene story feel, aur behtar.
// Opening me NO character, NO board — real-jaisa scene: raat ka dark
// store, riders, packing. Sirf in-world signage (shop par BLINKIT naam).
// Harness: window.ready, window.renderFrame(f), window.TOTAL.
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import * as D from './draw.js';

const W = 1080, H = 1920, TOTAL = 1572, FPS = 30;
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

// ===== SHOT A (0-143) — raat, dark store, riders nikal rahe hain =====
shot(0, 144, 0.34, { cx: 1080, cy: 1330, s: 0.52 }, { cx: 1000, cy: 1240, s: 0.80 }, (f) => {
  layer(0.3, () => {
    const g = ctx.createLinearGradient(0, -300, 0, 2200);
    g.addColorStop(0, '#0a1224'); g.addColorStop(0.7, '#16233f'); g.addColorStop(1, '#1d2c4c');
    ctx.fillStyle = g; ctx.fillRect(-600, -300, 3360, 2900);
    for (let i = 0; i < 40; i++) {
      const sx = hash(i * 3.7) * 3000 - 400, sy = hash(i * 9.3) * 700 - 200;
      ctx.globalAlpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(f * 0.06 + i * 2.1));
      ctx.fillStyle = '#dfe8ff'; D.circ(ctx, sx, sy, 3.2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    D.circ(ctx, 1760, 260, 62); ctx.fillStyle = '#f4ecd2'; ctx.fill();
    D.circ(ctx, 1738, 244, 55); ctx.fillStyle = '#16233f'; ctx.fill();
    skyline(3, 2160, '#0a0e18', '#ffd98a');
  });
  layer(0.62, () => { lampPost(240, 2160, 1.15, f); lampPost(1980, 2160, 1.15, f + 40); });
  layer(1, () => {
    const gy = storeFront(f);
    roadBand(gy, f, 0);
    scooter(1830, gy + 6, 0.92, -1, 0, { boxCol: '#e8b93a', streaks: false });
    for (const d0 of [8, 52, 96]) {
      const u = (f - d0) / 62; if (u < 0 || u > 1.15) continue;
      const e = u * u * (1.6 - 0.6 * u);
      const x = 1150 - e * 1750, y = gy + 130 + Math.sin(f * 1.4 + d0) * 2.5;
      scooter(x, y, 1.02, -1, f * 1.6 + d0);
    }
    scooter(880, gy + 138, 1.02, -1, f * 0.25, { streaks: false });
    // HERO (tum) — phone par order, nazar store par
    heroFig(470, gy + 130, 1.5, { expr: f < 60 ? 'calm' : 'surprise', armR: 'phone', face: 0.4, seed: 5 }, f);
    // store ke upar nilami-board — hook ka number
    if (f > 16) boardSign(1080, 560, 900, 190, [['₹20,940 CRORE', 92, '#8a1f1f'], ['SIRF 3 MAHINE ME!', 54, '#4a4234']], spring((f - 16) / 10));
  });
}, [144]);

// ===== SHOT B (144-251) — andar packing: bag me saaman, ant me ek sikka =====
function packItem(kind, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (kind === 0) { D.rr(ctx, -34, -52, 68, 104, 10); D.fillStroke(ctx, '#eef3f7', 5); D.rr(ctx, -34, -52, 68, 34, 10); D.fillStroke(ctx, '#3f7fbf', 4); }
  else if (kind === 1) { D.ell(ctx, 0, 0, 62, 38); D.fillStroke(ctx, '#d9a05a', 5); ctx.strokeStyle = 'rgba(120,70,20,0.5)'; ctx.lineWidth = 3; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 26 - 8, -22); ctx.lineTo(i * 26 + 8, 22); ctx.stroke(); } }
  else if (kind === 2) { D.rr(ctx, -44, -58, 88, 116, 12); D.fillStroke(ctx, '#3f9e4d', 5); D.rr(ctx, -44, -58, 88, 30, 12); D.fillStroke(ctx, '#ffd23f', 4); }
  else { D.rr(ctx, -24, -66, 48, 132, 14); D.fillStroke(ctx, '#e07b2a', 5); D.rr(ctx, -13, -88, 26, 26, 6); D.fillStroke(ctx, '#8a4a16', 4); }
  ctx.restore();
}
function handArm(x, y, grip) {
  // forearm reaching in diagonally from upper-left (packer), NOT a character shot
  ctx.save(); ctx.translate(x, y);
  D.limb(ctx, -200, -340, -6, -40, 30, '#c96f3f');
  ctx.fillStyle = '#d97e4a';
  D.ell(ctx, 0, -26, 27, 36); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
  for (let i = 0; i < 4; i++) { const fx = -20 + i * 13; D.limb(ctx, fx, 0, fx + (i - 1.5) * 3, 20 + grip * 7, 10, '#d97e4a'); }
  ctx.restore();
}
shot(144, 252, 0.3, { cx: 1075, cy: 1600, s: 0.92 }, { cx: 1100, cy: 1645, s: 1.04 }, (f) => {
  const lf = f - 144;
  layer(0.5, () => {
    const g = ctx.createLinearGradient(0, 300, 0, 2600);
    g.addColorStop(0, '#241a10'); g.addColorStop(1, '#171008');
    ctx.fillStyle = g; ctx.fillRect(-300, 200, 2760, 2600);
    lampPool(1080, 620, 620, 0.20);
  });
  layer(1, () => {
    for (const sx of [620, 1540]) {
      ctx.fillStyle = '#2c2116'; ctx.fillRect(sx - 170, 640, 340, 1560);
      for (let r = 0; r < 4; r++) {
        ctx.fillStyle = '#171008'; ctx.fillRect(sx - 170, 830 + r * 360, 340, 18);
        for (let i = 0; i < 3; i++) {
          const px = sx - 142 + i * 100, py = 700 + r * 360;
          ctx.fillStyle = ['#b6492f', '#3f7fbf', '#3f9e4d', '#c9a227', '#7a4a9e'][(i + r + (sx > 1000 ? 2 : 0)) % 5];
          D.rr(ctx, px, py, 78, 118, 7); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 3.5; ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(px + 8, py + 10, 62, 16);
        }
      }
    }
    for (const bx of [800, 1360]) {
      ctx.strokeStyle = '#0d0a06'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(bx, 600); ctx.lineTo(bx, 790); ctx.stroke();
      lampPool(bx, 838, 290, 0.30 + 0.05 * Math.sin(f * 0.3 + bx));
      D.circ(ctx, bx, 816, 20); D.fillStroke(ctx, '#ffe9a8', 4);
    }
    // packing table
    ctx.fillStyle = '#5a4026'; ctx.fillRect(430, 2180, 1300, 44);
    ctx.fillStyle = '#3d2b18'; ctx.fillRect(470, 2224, 60, 300); ctx.fillRect(1630, 2224, 60, 300);
    ctx.fillStyle = 'rgba(255,205,120,0.10)'; ctx.fillRect(430, 2180, 1300, 12);
    // WORKER — table ke peeche khada packing wala
    heroFig(1470, 2500, 1.5, { preset: WORKER_P, expr: 'calm', seed: 7 }, f);
    // delivery bag (grows a touch with each item)
    const drops = [10, 36, 62, 86]; // local frames when items land
    const landed = drops.filter((d) => lf >= d + 12).length;
    const bagS = 1 + landed * 0.045, bagX = 1000, bagTop = 2180;
    ctx.save(); ctx.translate(bagX, bagTop); ctx.scale(bagS, bagS);
    D.poly(ctx, [[-120, 0], [-96, -238], [96, -238], [120, 0]]); D.fillStroke(ctx, YEL, 6);
    ctx.strokeStyle = '#0a3813'; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.arc(0, -238, 52, Math.PI, 0); ctx.stroke();
    text('blinkit', 0, -110, 56, '#0a3813');
    ctx.restore();
    // items already inside: little tops peeking
    if (landed >= 1) packItem(0, bagX - 44, bagTop - 250, 0.62);
    if (landed >= 3) packItem(2, bagX + 48, bagTop - 246, 0.58);
    // dropping items with the hand
    const kinds = [0, 1, 2, 3];
    drops.forEach((d0, i) => {
      const u = (lf - d0) / 22; if (u < 0 || u >= 1) return;
      const down = sstep(D.clamp(u * 1.6, 0, 1));
      const iy = D.lerp(1040, bagTop - 260, down);
      const sway = Math.sin(u * 9 + i) * 8 * (1 - u);
      packItem(kinds[i], bagX + sway, iy + 66, 0.92);
      handArm(bagX + sway, iy, D.clamp(1 - u * 2, 0, 1));
      if (u > 0.72 && u < 0.86) { // landing bounce dust
        ctx.fillStyle = 'rgba(255,230,170,0.35)';
        D.ell(ctx, bagX, bagTop - 236, 90 * (u - 0.7) * 4, 12); ctx.fill();
      }
    });
    // the ONE coin — appears after last item, glints (f local 96+)
    if (lf >= 96) {
      const sc = spring((lf - 96) / 10);
      ctx.save(); ctx.translate(1330, 2146); ctx.scale(sc, sc);
      D.drawCoin(ctx, 0, 0, 30, f);
      ctx.restore();
      if (lf >= 100) D.drawSparkle(ctx, 1352, 2124, 16 + 6 * Math.sin(f * 0.4), 0.8);
      lampPool(1330, 2146, 120, 0.25);
    }
    // spare packs waiting on the table
    packItem(1, 706, 2132, 0.8); packItem(3, 798, 2120, 0.8);
    crate(1470, 2180, 0.9, '#75501f');
  });
}, [238]);

// ===== SHOT C (252-299) — low angle: bag box me, rider nikal gaya =====
shot(252, 300, 0.36, { cx: 960, cy: 1760, s: 1.02 }, { cx: 1230, cy: 1720, s: 1.14 }, (f) => {
  const lf = f - 252;
  layer(0.3, () => {
    const g = ctx.createLinearGradient(0, 200, 0, 2400);
    g.addColorStop(0, '#0a1224'); g.addColorStop(1, '#1d2c4c');
    ctx.fillStyle = g; ctx.fillRect(-600, 0, 3360, 2700);
    skyline(7, 2160, '#0a0e18', '#ffd98a');
  });
  layer(0.62, () => { lampPost(300, 2160, 1.3, f); lampPost(1900, 2160, 1.3, f + 30); });
  layer(1, () => {
    const gy = storeFront(f);
    roadBand(gy, f, lf > 26 ? (lf - 26) * 0.55 : 0);
    // main rider: waits, bag goes into his box (lf 4-18), then launches (lf 26+)
    const launch = lf <= 26 ? 0 : Math.pow((lf - 26) / 21, 2) * 1500;
    const rx = 1060 + launch, ry = gy + 150 + (lf > 26 ? Math.sin(f * 1.8) * 2 : Math.sin(f * 0.8) * 1.5);
    // worker arm places the bag into the delivery box
    if (lf >= 4 && lf < 20) {
      const u = sstep((lf - 4) / 14);
      const bx = D.lerp(760, rx + 104, u), by = D.lerp(gy - 190, gy + 150 - 250, Math.sin(u * Math.PI * 0.5));
      ctx.save(); ctx.translate(bx, by); ctx.scale(0.62, 0.62);
      D.poly(ctx, [[-120, 0], [-96, -238], [96, -238], [120, 0]]); D.fillStroke(ctx, YEL, 7);
      text('blinkit', 0, -110, 56, '#0a3813');
      ctx.restore();
      D.limb(ctx, bx - 90, by - 120, 700, gy - 260, 26, '#3a2410');
    }
    scooter(rx, ry, 1.12, 1, lf > 26 ? f * 1.7 : f * 0.2, { streaks: lf > 26 });
    // second rider already gone in the distance (small, right side)
    if (lf < 30) scooter(1980 - lf * 6, gy + 90, 0.6, -1, f * 1.4, { boxCol: '#e8b93a' });
    // HERO — bag mil gaya
    heroFig(560, gy + 170, 1.25, { expr: lf > 20 ? 'happy' : 'calm', armR: lf > 14 ? 'hold' : 'down', seed: 5 }, f);
  });
  // foreground parallax: a dark scooter shape sweeps past close to camera
  layer(1.6, () => {
    const u = (lf - 12) / 20; if (u < 0 || u > 1) return;
    const x = D.lerp(-500, 2900, u * u * (1.4 - 0.4 * u));
    ctx.save(); ctx.globalAlpha = 0.88;
    scooter(x, 2560, 1.9, 1, f * 2.2, { boxCol: '#c9a227', streaks: false });
    ctx.restore();
  });
}, []);

function vgrad(y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}
// ===== FULL VIDEO — helpers =====
function stampText(str, x, y, px, col, rot, scale) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(scale, scale);
  ctx.globalAlpha = D.clamp(scale * 1.4, 0, 1);
  text(str, 0, 0, px, col);
  ctx.lineWidth = 5; ctx.strokeStyle = col;
  const wdt = ctx.measureText(str).width + px * 0.9;
  D.rr(ctx, -wdt / 2, -px * 0.78, wdt, px * 1.56, 10); ctx.stroke();
  ctx.restore();
}
function coinAt(x, y, r, glowA) {
  if (glowA > 0) lampPool(x, y, r * 3.4, glowA);
  D.circ(ctx, x, y, r); D.fillStroke(ctx, '#e8b91e', 4);
  D.circ(ctx, x, y, r * 0.72); ctx.strokeStyle = '#a87f0a'; ctx.lineWidth = 3; ctx.stroke();
  text('₹', x, y + r * 0.06, r * 1.05, '#8a6508');
}
function miniStore(x, gy, w, open, seed) {
  const h = w * 1.18, top = gy - h;
  ctx.fillStyle = '#241c12'; ctx.fillRect(x - w / 2, top, w, h);
  ctx.fillStyle = YEL; ctx.fillRect(x - w / 2, top, w, h * 0.16);
  text('blinkit', x, top + h * 0.08, w * 0.11, GRN);
  const iy = top + h * 0.22, ih = h * 0.78;
  const grd = ctx.createLinearGradient(0, iy, 0, gy);
  grd.addColorStop(0, '#ffca7a'); grd.addColorStop(1, '#e08b3a');
  ctx.fillStyle = grd; ctx.fillRect(x - w * 0.42, iy, w * 0.84, ih);
  ctx.fillStyle = 'rgba(120,66,20,0.55)';
  for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++)
    ctx.fillRect(x - w * 0.36 + i * w * 0.19, iy + ih * (0.14 + r * 0.28), w * 0.13, ih * 0.17);
  const sh = ih * (1 - open);
  if (sh > 2) {
    ctx.fillStyle = '#3a3f46'; ctx.fillRect(x - w * 0.44, iy, w * 0.88, sh);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    for (let ly = 0; ly < sh; ly += 13) ctx.fillRect(x - w * 0.44, iy + ly, w * 0.88, 4);
  }
  if (open > 0.15) lampPool(x, gy - ih * 0.3, w * 0.75, 0.16 * open);
}
function phoneBody(cx, cy, w, h) {
  ctx.fillStyle = '#0a0a0c'; D.rr(ctx, cx - w / 2, cy - h / 2, w, h, w * 0.09); ctx.fill();
  ctx.strokeStyle = '#3c3f45'; ctx.lineWidth = 5; ctx.stroke();
  const sx = cx - w / 2 + w * 0.045, sy = cy - h / 2 + h * 0.035, sw = w * 0.91, sh = h * 0.93;
  ctx.fillStyle = '#101318'; ctx.fillRect(sx, sy, sw, sh);
  D.circ(ctx, cx, cy - h / 2 + h * 0.045, w * 0.016); ctx.fillStyle = '#2c313a'; ctx.fill();
  return { sx, sy, sw, sh };
}
function tableScene(topCol = '#241708', botCol = '#120b04') {
  const g = ctx.createLinearGradient(0, 500, 0, 3000);
  g.addColorStop(0, topCol); g.addColorStop(1, botCol);
  ctx.fillStyle = g; ctx.fillRect(-800, 0, 3760, 3100);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-800, 2280, 3760, 820);
  ctx.fillStyle = '#3a2712'; ctx.fillRect(-800, 2240, 3760, 46);
}

// ===== SHOT D (300-470) — RECEIPT: ₹525 total, kharcha kat, bacha ₹5 =====
shot(300, 470, 0.32, { cx: 1080, cy: 1560, s: 0.62 }, { cx: 1080, cy: 1620, s: 0.72 }, (f) => {
  f -= 300;
  layer(1, () => {
    tableScene();
    lampPool(1080, 1250, 950, 0.20);
    // receipt paper
    const px = 660, pw = 840, py = 760;
    const unroll = sstep(D.clamp(f / 26, 0, 1));
    const ph = 1420 * unroll;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 34; ctx.shadowOffsetY = 14;
    ctx.fillStyle = '#f3ecd9'; ctx.fillRect(px, py, pw, ph);
    ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip();
    text('BLINKIT — ORDER BILL', 1080, py + 78, 44, '#4a4234');
    ctx.fillStyle = '#c9bfa8'; ctx.fillRect(px + 50, py + 122, pw - 100, 4);
    const items = [['Doodh x2', '₹60'], ['Bread', '₹45'], ['Sabzi basket', '₹180'], ['Chips + Cold drink', '₹90'], ['Baaki saaman', '₹150']];
    items.forEach((it, i) => {
      const ry = py + 218 + i * 96, pop = spring(D.clamp((f - 6 - i * 5) / 9, 0, 1));
      if (pop <= 0) return;
      ctx.globalAlpha = pop;
      text(it[0], px + 56, ry, 41, '#5a5142', 'left');
      text(it[1], px + pw - 56, ry, 41, '#5a5142', 'right');
      ctx.globalAlpha = 1;
    });
    ctx.fillStyle = '#c9bfa8'; ctx.fillRect(px + 50, py + 712, pw - 100, 4);
    if (f > 20) {
      text('TOTAL', px + 56, py + 782, 48, '#33302a', 'left');
      text('₹525', px + pw - 56, py + 782, 54, '#33302a', 'right');
    }
    // kharcha stamps + coins draining right
    const costs = [['DELIVERY KHARCHA', 46], ['GODOWN KHARCHA', 73], ['PACKING KHARCHA', 100]];
    costs.forEach((c, i) => {
      const sf = c[1], ky = py + 920 + i * 118;
      if (f < sf) return;
      stampText(c[0], 950, ky, 42, '#b3311f', -0.05, spring(D.clamp((f - sf) / 7, 0, 1)));
      const drain = sstep(D.clamp((f - sf - 12) / 22, 0, 1));
      for (let k = 0; k < 3; k++) {
        const cxx = 1330 + drain * (330 + k * 40), cyy = ky + (k - 1) * 26 + drain * 30;
        ctx.globalAlpha = 1 - drain * 0.9;
        coinAt(cxx, cyy, 25, 0);
      }
      ctx.globalAlpha = 1;
    });
    // bacha — ek sikka
    if (f > 148) {
      const bs = spring(D.clamp((f - 148) / 10, 0, 1));
      ctx.save(); ctx.translate(1080, py + 1285); ctx.scale(bs, bs);
      coinAt(0, 0, 56, 0.4);
      ctx.restore();
      if (f > 156) text('BACHA: ₹5 SE BHI KAM', 1080, py + 1400, 40, '#7a6a4a');
    }
    ctx.restore();
    // torn edge
    ctx.fillStyle = '#f3ecd9';
    for (let i = 0; i < 14; i++) { const tx = px + i * (pw / 13); ctx.beginPath(); ctx.moveTo(tx, py + ph); ctx.lineTo(tx + pw / 26, py + ph + 16); ctx.lineTo(tx + pw / 13, py + ph); ctx.fill(); }
  });
}, [322]);

// ===== SHOT E (470-578) — UPAR SE SHEHER: 40 crore order ki bheed =====
shot(470, 578, 0.3, { cx: 1080, cy: 1700, s: 1.28 }, { cx: 1080, cy: 1700, s: 0.86 }, (f) => {
  f -= 470;
  layer(1, () => {
    ctx.fillStyle = '#0a0f1e'; ctx.fillRect(-900, -300, 3960, 4200);
    // blocks
    for (let bx = -720; bx < 2880; bx += 360) for (let by = -40; by < 3560; by += 360) {
      ctx.fillStyle = hash(bx * 0.7 + by) > 0.5 ? '#131b30' : '#101728';
      D.rr(ctx, bx + 26, by + 26, 308, 308, 14); ctx.fill();
      for (let wn = 0; wn < 5; wn++) {
        if (hash(bx + by * 3 + wn * 17) > 0.45) {
          ctx.fillStyle = 'rgba(255,205,110,' + (0.25 + hash(wn + bx) * 0.5) + ')';
          ctx.fillRect(bx + 50 + hash(wn * 7 + by) * 220, by + 50 + hash(wn * 11 + bx) * 220, 17, 13);
        }
      }
    }
    // streets glow lines
    ctx.strokeStyle = 'rgba(90,110,160,0.35)'; ctx.lineWidth = 7;
    for (let bx = -720; bx <= 2880; bx += 360) { ctx.beginPath(); ctx.moveTo(bx, -300); ctx.lineTo(bx, 3900); ctx.stroke(); }
    for (let by = -40; by <= 3560; by += 360) { ctx.beginPath(); ctx.moveTo(-900, by); ctx.lineTo(3060, by); ctx.stroke(); }
    // dark stores — yellow squares
    const stores = [];
    for (let i = 0; i < 12; i++) {
      const sx = -360 + (i % 4) * 800 + hash(i * 3) * 260, sy = 320 + Math.floor(i / 4) * 1080 + hash(i * 7) * 300;
      stores.push([sx, sy]);
      ctx.fillStyle = YEL; D.rr(ctx, sx - 34, sy - 34, 68, 68, 9); ctx.fill();
      lampPool(sx, sy, 130, 0.35);
    }
    // riders streaming on grid streets
    for (let i = 0; i < 90; i++) {
      const horiz = i % 2 === 0, lane = Math.floor(hash(i * 13.7) * 10);
      const street = -720 + lane * 360 + (hash(i * 3.1) > 0.5 ? 178 : -178) * 0 + (i % 3) * 8;
      const speed = 5 + hash(i * 7.7) * 6, span = 3400;
      const p = ((f * speed + i * 431) % span) - 900;
      const rx = horiz ? p : street, ry = horiz ? street : p;
      ctx.strokeStyle = 'rgba(255,190,80,0.30)'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(rx - (horiz ? 66 : 0), ry - (horiz ? 0 : 66)); ctx.lineTo(rx, ry); ctx.stroke();
      D.circ(ctx, rx, ry, 11); ctx.fillStyle = '#ffd873'; ctx.fill();
      lampPool(rx, ry, 44, 0.5);
    }
    // order pings
    for (let i = 0; i < 6; i++) {
      const st = stores[i % stores.length], ph = ((f + i * 19) % 54) / 54;
      ctx.strokeStyle = 'rgba(248,203,70,' + (0.75 * (1 - ph)) + ')'; ctx.lineWidth = 6;
      D.circ(ctx, st[0], st[1], 40 + ph * 190); ctx.stroke();
    }
  });
}, []);

// ===== SHOT F (578-702) — GALI TRACKING: har gali me godown =====
shot(578, 702, 0.3, { cx: 760, cy: 1560, s: 0.72 }, { cx: 2560, cy: 1560, s: 0.72 }, (f) => {
  f -= 578;
  layer(0.45, () => {
    const g = vgrad(200, 2900, [[0, '#0a1122'], [1, '#060a16']]);
    ctx.fillStyle = g; ctx.fillRect(-400, 0, 4200, 3000);
    skyline(5.5, 2140, '#0d1524', '#ffd9a0');
  });
  layer(1, () => {
    ctx.fillStyle = '#14100c'; ctx.fillRect(-400, 2140, 4200, 180);
    ctx.fillStyle = '#1d1813'; ctx.fillRect(-400, 2320, 4200, 560);
    ctx.fillStyle = 'rgba(230,230,230,0.20)';
    for (let dx = -400; dx < 3800; dx += 210) ctx.fillRect(dx, 2560, 120, 15);
    for (let i = 0; i < 5; i++) {
      const sx = 620 + i * 800;
      const open = sstep(D.clamp((CAM.cx - (sx - 620)) / 500, 0, 1));
      // building above shop
      ctx.fillStyle = '#1a2233'; ctx.fillRect(sx - 330, 620, 660, 1000);
      for (let wy = 0; wy < 3; wy++) for (let wx = 0; wx < 3; wx++) {
        ctx.fillStyle = hash(i * 40 + wy * 9 + wx * 3) > 0.45 ? 'rgba(255,205,120,0.75)' : 'rgba(70,85,110,0.5)';
        ctx.fillRect(sx - 260 + wx * 190, 720 + wy * 280, 92, 120);
      }
      miniStore(sx, 2160, 560, open, i);
      lampPool(sx - 420, 1560, 210, 0.3);
      D.circ(ctx, sx - 420, 1520, 17); D.fillStroke(ctx, '#ffe9a8', 4);
      ctx.fillStyle = '#0c0e12'; ctx.fillRect(sx - 428, 1540, 16, 620);
    }
    // ek rider nikalta hai dusri dukaan se
    const dep = sstep(D.clamp((f - 52) / 26, 0, 1));
    if (f > 46) {
      const rx = 1420 - dep * 1250, bob = Math.sin(f * 0.55) * 5 * (0.4 + dep);
      scooter(rx, 2160 + bob, 0.92, -1, f * (0.3 + dep * 1.3), { streaks: dep > 0.08 });
    }
    // HERO — gali me chalta, har mod par ek aur godown
    heroFig(CAM.cx + 300, 2400, 1.15, { expr: 'puzzled', armR: 'phone', walk: (f * 0.06) % 1, face: 0.3, seed: 5 }, f + 578);
  });
}, []);

// ===== SHOT G (702-863) — 2,751 godown, phir phone ke andar dukaan =====
shot(702, 792, 0.3, { cx: 1080, cy: 1560, s: 0.66 }, { cx: 1080, cy: 1500, s: 0.74 }, (f) => {
  f -= 702;
  layer(1, () => {
    const g = vgrad(300, 3000, [[0, '#0a1120'], [1, '#05080f']]);
    ctx.fillStyle = g; ctx.fillRect(-700, 0, 3560, 3100);
    ctx.fillStyle = '#171310'; ctx.fillRect(-700, 2180, 3560, 900);
    if (f > 10) boardSign(1080, 760, 860, 160, [['2,751 GODOWN!', 88, '#8a1f1f']], spring((f - 10) / 10));
    const rows = [[1420, 260, 7], [1760, 350, 6], [2180, 470, 5]];
    rows.forEach((row, ri) => {
      const [gy, w, n] = row;
      for (let i = 0; i < n; i++) {
        const sx = 1080 + (i - (n - 1) / 2) * (w + 130);
        const open = sstep(D.clamp((f - (i * 4 + ri * 9)) / 16, 0, 1));
        miniStore(sx, gy, w, open, i + ri * 10);
      }
    });
  });
}, []);
shot(792, 863, 0.36, { cx: 1080, cy: 1660, s: 0.66 }, { cx: 1080, cy: 1660, s: 0.74 }, (f) => {
  f -= 792;
  layer(1, () => {
    tableScene('#1c130a', '#0d0803');
    lampPool(1080, 1560, 1000, 0.22);
    const scr = phoneBody(1080, 1620, 700, 1420);
    ctx.save(); ctx.beginPath(); ctx.rect(scr.sx, scr.sy, scr.sw, scr.sh); ctx.clip();
    const lit = sstep(D.clamp((f - 4) / 12, 0, 1));
    ctx.fillStyle = '#141a10'; ctx.fillRect(scr.sx, scr.sy, scr.sw, scr.sh);
    ctx.globalAlpha = lit;
    ctx.fillStyle = YEL; ctx.fillRect(scr.sx, scr.sy, scr.sw, 150);
    text('blinkit', scr.sx + scr.sw / 2, scr.sy + 76, 74, GRN);
    ctx.fillStyle = '#1d2417'; ctx.fillRect(scr.sx, scr.sy + 150, scr.sw, scr.sh - 150);
    // phone ke andar ki dukaan — shutter khulta hai
    const open = sstep(D.clamp((f - 18) / 22, 0, 1));
    ctx.save(); ctx.translate(scr.sx + scr.sw / 2, scr.sy + 660); ctx.scale(0.62, 0.62);
    miniStore(0, 260, 620, open, 3);
    ctx.restore();
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = ['#b6492f', '#3f7fbf', '#3f9e4d', '#c9a227'][i];
      D.rr(ctx, scr.sx + 46 + i * (scr.sw - 92) / 4 + 6, scr.sy + 1010, (scr.sw - 92) / 4 - 26, 130, 12); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    if (f > 36) {
      const rp = ((f - 36) % 26) / 26;
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.55 * (1 - rp)) + ')'; ctx.lineWidth = 6;
      D.circ(ctx, 1080, 1620 + 330, 40 + rp * 150); ctx.stroke();
    }
    lampPool(1080, 1620, 800, 0.16 + 0.1 * sstep(D.clamp((f - 4) / 12, 0, 1)));
    // HERO — phone ki taraf ishara: dukaan phone ke andar!
    heroFig(430, 2380, 1.25, { expr: f > 18 ? 'surprise' : 'calm', armR: 'point', face: 0.5, seed: 5 }, f + 792);
  });
}, []);

// ===== SHOT H (863-975) — HISAAB: 40 crore order, jar me 5 sikke =====
shot(863, 975, 0.32, { cx: 1080, cy: 1600, s: 0.64 }, { cx: 1080, cy: 1640, s: 0.72 }, (f) => {
  f -= 863;
  layer(1, () => {
    tableScene();
    lampPool(760, 1400, 1000, 0.18);
    // order bags ki pahad jaisi kataar (left)
    for (let r = 0; r < 5; r++) for (let i = 0; i < 7 - (r % 2); i++) {
      const bx = 400 + i * 128 + (r % 2) * 60 + Math.sin(i * 7 + r * 3) * 8, by = 2080 - r * 128;
      const pop = spring(D.clamp((f - (i * 2 + r * 5)) / 10, 0, 1));
      if (pop <= 0) continue;
      ctx.save(); ctx.translate(bx, by); ctx.scale(pop, pop);
      ctx.fillStyle = YEL; D.poly(ctx, [[-52, 0], [-42, -104], [42, -104], [52, 0]]); ctx.fill();
      ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
      ctx.strokeStyle = GRN; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, -104, 24, Math.PI, 0); ctx.stroke();
      ctx.restore();
    }
    text('40 CRORE ORDER', 640, 880, 52, '#e8dcc0');
    // khaali jar (right) — sikke girte hain, jar bharta hi nahi
    const jx = 1620, jt = 1240, jb = 2120;
    ctx.fillStyle = 'rgba(200,225,255,0.10)'; D.rr(ctx, jx - 170, jt, 340, jb - jt, 26); ctx.fill();
    ctx.strokeStyle = 'rgba(220,235,255,0.5)'; ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = 'rgba(200,225,255,0.16)'; ctx.fillRect(jx - 100, jt - 34, 200, 36);
    for (let k = 0; k < 5; k++) {
      const df = 16 + k * 19;
      if (f < df) continue;
      const drop = sstep(D.clamp((f - df) / 13, 0, 1));
      const cy = D.lerp(900, jb - 42 - (k > 2 ? 34 : 0), drop * drop);
      const cx = jx + (k % 3 - 1) * 62 + Math.sin(k * 5) * 14;
      coinAt(cx, Math.min(cy, jb - 42 - (k > 2 ? 34 : 0)), 34, drop >= 1 ? 0.12 : 0);
      if (drop >= 1 && f - df - 13 < 7) { ctx.strokeStyle = 'rgba(255,220,120,0.6)'; ctx.lineWidth = 4; D.circ(ctx, cx, jb - 46, 44 + (f - df - 13) * 9); ctx.stroke(); }
    }
    heroFig(1080, 2260, 1.05, { expr: f > 60 ? 'puzzled' : 'calm', face: Math.sin(f * 0.03) * 0.5, seed: 5 }, f + 863);
    text('HAR ORDER: ₹5 SE KAM', 1540, 2330, 38, '#e8dcc0');
  });
}, []);

// ===== SHOT I (975-1068) — LAMBA BILL: munafa ki chhoti si line =====
shot(975, 1068, 0.32, { cx: 1080, cy: 1500, s: 0.7 }, { cx: 1080, cy: 1500, s: 0.7 }, (f) => {
  f -= 975;
  layer(1, () => {
    tableScene();
    lampPool(1080, 1400, 1000, 0.2);
    const px = 620, pw = 920;
    const pan = sstep(D.clamp(f / 80, 0, 1)) * 1180;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 34; ctx.shadowOffsetY = 14;
    ctx.fillStyle = '#f3ecd9'; ctx.fillRect(px, 420 - pan, pw, 2760);
    ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(px, 300, pw, 2200); ctx.clip();
    ctx.translate(0, -pan);
    text('BLINKIT — 3 MAHINE KI BIKRI', 1080, 520, 46, '#4a4234');
    for (let i = 0; i < 16; i++) {
      const ry = 640 + i * 92;
      ctx.fillStyle = i % 2 ? '#ddd2ba' : '#e4dbc6'; ctx.fillRect(px + 54, ry - 26, pw - 108, 52);
      text('Order #' + (84000 + i * 137), px + 76, ry, 36, '#8a7f68', 'left');
      text('₹' + (400 + (i * 53) % 300), px + pw - 76, ry, 36, '#8a7f68', 'right');
    }
    ctx.fillStyle = '#c9bfa8'; ctx.fillRect(px + 50, 2180, pw - 100, 5);
    text('KUL BIKRI: ₹20,940 CRORE', 1080, 2270, 50, '#33302a');
    if (f > 52) stampText('MUNAFA SIRF ₹184 CRORE', 1080, 2420, 54, '#b3311f', -0.04, spring(D.clamp((f - 52) / 8, 0, 1)));
    ctx.restore();
    // HERO — lamba bill dekh ke hairaan
    heroFig(430, 2380, 1.15, { expr: f > 52 ? 'shocked' : 'worried', armR: 'up', seed: 5 }, f + 975);
  });
}, [1027]);

// ===== SHOT J (1068-1203) — TARAZU: bikri ka pahad vs ek sikka =====
shot(1068, 1203, 0.3, { cx: 1080, cy: 1420, s: 0.6 }, { cx: 1080, cy: 1560, s: 0.68 }, (f) => {
  f -= 1068;
  layer(0.5, () => {
    const g = vgrad(200, 3000, [[0, '#131a29'], [1, '#090d16']]);
    ctx.fillStyle = g; ctx.fillRect(-700, 0, 3560, 3100);
    for (let i = 0; i < 7; i++) { ctx.fillStyle = 'rgba(50,64,90,0.35)'; ctx.fillRect(-500 + i * 420, 500 + (i % 3) * 260, 300, 1900); }
  });
  layer(1, () => {
    ctx.fillStyle = '#171310'; ctx.fillRect(-700, 2260, 3560, 840);
    const tilt = 0.16 + Math.sin(f * 0.02) * 0.008 - sstep(D.clamp((f - 96) / 20, 0, 1)) * 0.03;
    const cx = 1080, topY = 780;
    // stand
    ctx.fillStyle = '#4a3a22'; ctx.fillRect(cx - 26, topY, 52, 1420);
    D.poly(ctx, [[cx - 200, 2200], [cx + 200, 2200], [cx + 60, 2060], [cx - 60, 2060]]); ctx.fillStyle = '#3a2d1a'; ctx.fill();
    ctx.save(); ctx.translate(cx, topY); ctx.rotate(tilt);
    // beam
    ctx.fillStyle = '#6b5326'; ctx.fillRect(-620, -20, 1240, 40);
    D.circ(ctx, 0, 0, 34); D.fillStroke(ctx, '#8a6a30', 5);
    // left pan — saaman ka pahad
    ctx.strokeStyle = '#8a6a30'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(-560, 16); ctx.lineTo(-560, 300); ctx.moveTo(-560, 16); ctx.lineTo(-450, 300); ctx.moveTo(-560, 16); ctx.lineTo(-670, 300); ctx.stroke();
    D.ell(ctx, -560, 330, 215, 42); ctx.fillStyle = '#54401e'; ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    for (let r = 0; r < 4; r++) for (let i = 0; i < 4 - r; i++) {
      const bx = -560 + (i - (3 - r) / 2) * 112 + hash(i * 3 + r) * 14, by = 300 - r * 96;
      ctx.fillStyle = ['#8a5a24', YEL, '#3f7fbf', '#8a5a24'][(i + r) % 4];
      D.rr(ctx, bx - 50, by - 88, 100, 88, 8); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    }
    // right pan — ek sikka
    ctx.strokeStyle = '#8a6a30'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(560, 16); ctx.lineTo(560, 300); ctx.moveTo(560, 16); ctx.lineTo(450, 300); ctx.moveTo(560, 16); ctx.lineTo(670, 300); ctx.stroke();
    D.ell(ctx, 560, 330, 215, 42); ctx.fillStyle = '#54401e'; ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    coinAt(560, 292, 44, f > 96 ? 0.4 : 0.15);
    ctx.restore();
    // tags
    ctx.save(); ctx.translate(520, 1180); ctx.rotate(-0.06 + Math.sin(f * 0.03) * 0.02);
    ctx.fillStyle = '#d8c9a3'; D.rr(ctx, -215, -52, 430, 104, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    text('BIKRI ₹20,940 CR', 0, 0, 44, '#4a4234'); ctx.restore();
    ctx.save(); ctx.translate(1640, 1030); ctx.rotate(0.06 + Math.sin(f * 0.03 + 2) * 0.02);
    ctx.fillStyle = '#d8c9a3'; D.rr(ctx, -190, -52, 380, 104, 10); ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 4; ctx.stroke();
    text('MUNAFA <1%', 0, 0, 44, '#b3311f'); ctx.restore();
    // HERO — tarazu ke saamne khada
    heroFig(1080, 2380, 1.1, { expr: f > 96 ? 'shocked' : 'worried', face: -0.3, seed: 5 }, f + 1068);
  });
}, []);

// ===== SHOT K (1203-1327) — TWIST: aadat — phone, ghadi, baar-baar tap =====
shot(1203, 1327, 0.42, { cx: 1080, cy: 1620, s: 0.68 }, { cx: 1080, cy: 1620, s: 0.78 }, (f) => {
  f -= 1203;
  layer(1, () => {
    tableScene('#150e06', '#080402');
    // spotlight cone
    const grd = ctx.createLinearGradient(0, 300, 0, 2400);
    grd.addColorStop(0, 'rgba(255,220,140,0.20)'); grd.addColorStop(1, 'rgba(255,220,140,0)');
    ctx.fillStyle = grd; D.poly(ctx, [[880, 280], [1280, 280], [1620, 2350], [540, 2350]]); ctx.fill();
    const scr = phoneBody(1080, 1700, 660, 1330);
    ctx.save(); ctx.beginPath(); ctx.rect(scr.sx, scr.sy, scr.sw, scr.sh); ctx.clip();
    ctx.fillStyle = '#171d12'; ctx.fillRect(scr.sx, scr.sy, scr.sw, scr.sh);
    ctx.fillStyle = YEL; ctx.fillRect(scr.sx, scr.sy, scr.sw, 138);
    text('blinkit', scr.sx + scr.sw / 2, scr.sy + 70, 68, GRN);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = ['#b6492f', '#3f7fbf', '#3f9e4d', '#c9a227'][i];
      D.rr(ctx, scr.sx + 40 + (i % 2) * (scr.sw / 2 - 20), scr.sy + 190 + Math.floor(i / 2) * 190, scr.sw / 2 - 66, 158, 12); ctx.fill();
    }
    // order-again button — press animation on taps
    const taps = [22, 58, 94];
    let press = 0; for (const tp of taps) { const u = (f - tp) / 7; if (u > 0 && u < 1) press = Math.max(press, Math.sin(u * Math.PI)); }
    const by = scr.sy + 620;
    ctx.fillStyle = press > 0.3 ? '#0a6d18' : GRN;
    D.rr(ctx, scr.sx + 60, by + press * 7, scr.sw - 120, 128, 20); ctx.fill();
    text('PHIR SE ORDER KARO', scr.sx + scr.sw / 2, by + 64 + press * 7, 47, '#ffffff');
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    text('Pichla order: 10 min me aaya tha', scr.sx + scr.sw / 2, by + 208, 36, '#cfe0c0');
    ctx.restore();
    // HERO — andhere me baitha, phone ki aadat
    seatedFig(570, 2200, 1.22, { expr: f > 94 ? 'worried' : 'calm', slump: 0.4, seed: 5 }, f + 1203);
    // ghadi — har tap par 10 minute aage
    const clk = { x: 1080, y: 560, r: 120 };
    D.circ(ctx, clk.x, clk.y, clk.r); D.fillStroke(ctx, '#e8e2d2', 7);
    let mins = 600; for (const tp of taps) if (f > tp + 6) mins += 10;
    const spin = sstep(D.clamp((f - 90) / 26, 0, 1)) * Math.PI * 4;
    const ma = (mins / 60) * Math.PI * 2 - Math.PI / 2 + spin, ha = ((mins / 60) % 12) / 12 * Math.PI * 2 - Math.PI / 2 + spin / 12;
    ctx.strokeStyle = '#2c2c34'; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(clk.x, clk.y); ctx.lineTo(clk.x + Math.cos(ma) * 84, clk.y + Math.sin(ma) * 84); ctx.stroke();
    ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(clk.x, clk.y); ctx.lineTo(clk.x + Math.cos(ha) * 56, clk.y + Math.sin(ha) * 56); ctx.stroke();
    // tap karne wala haath (side se)
    for (const tp of taps) {
      const u = (f - tp + 7) / 14;
      if (u < 0 || u > 1) continue;
      const reach = Math.sin(D.clamp(u, 0, 1) * Math.PI);
      const hx = 660 + reach * 380, hy = 1640 + reach * 150;
      if (u > 0.42 && u < 0.62) {
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 5;
        D.circ(ctx, 1080, by + 64, 30 + (u - 0.42) * 260); ctx.stroke();
      }
    }
    if (f > 100) lampPool(1080, 1700, 760, 0.14 + 0.1 * Math.sin(f * 0.2));
  });
}, [1225, 1261, 1297]);

// ===== SHOT L (1327-1440) — KIRANA: graahak gayab =====
shot(1327, 1440, 0.34, { cx: 1080, cy: 1580, s: 0.66 }, { cx: 1120, cy: 1580, s: 0.7 }, (f) => {
  f -= 1327;
  layer(0.5, () => {
    const g = vgrad(200, 3000, [[0, '#1a1626'], [1, '#0c0a12']]);
    ctx.fillStyle = g; ctx.fillRect(-700, 0, 3560, 3100);
  });
  layer(1, () => {
    ctx.fillStyle = '#16120e'; ctx.fillRect(-700, 2160, 3560, 940);
    // dukaan
    ctx.fillStyle = '#2e2620'; ctx.fillRect(560, 900, 1040, 1260);
    const grd = ctx.createLinearGradient(0, 1100, 0, 2160);
    grd.addColorStop(0, 'rgba(255,196,100,0.5)'); grd.addColorStop(1, 'rgba(255,196,100,0.12)');
    ctx.fillStyle = grd; ctx.fillRect(620, 1120, 920, 1040);
    // awning
    D.poly(ctx, [[520, 920], [1640, 920], [1560, 1080], [600, 1080]]); ctx.fillStyle = '#7a3b2e'; ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#8c4636' : '#6d3428'; ctx.fillRect(560 + i * 172, 928, 86, 130); }
    text('KIRANA STORE', 1080, 830, 52, '#cbb98f');
    // sabzi crates
    const veg = ['#d94f30', '#3f9e4d', '#e8b91e', '#7a4a9e', '#d94f30', '#3f9e4d'];
    for (let c = 0; c < 3; c++) {
      const cx = 720 + c * 330, cy = 2010;
      crate(cx, cy + 130, 1.05, '#6b4a22');
      for (let i = 0; i < 5; i++) { D.circ(ctx, cx - 90 + i * 46 + hash(c * 9 + i) * 14, cy + 58 - (i % 2) * 22, 27); ctx.fillStyle = veg[(c * 2 + i) % 6]; ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 3; ctx.stroke(); }
    }
    // andar ki shelves — saaman bhara, graahak nahi
    for (let r = 0; r < 3; r++) {
      ctx.fillStyle = 'rgba(40,26,14,0.55)'; ctx.fillRect(660, 1330 + r * 210, 840, 16);
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = ['rgba(185,73,47,0.5)', 'rgba(63,127,191,0.5)', 'rgba(63,158,77,0.5)', 'rgba(201,162,39,0.5)'][(i + r) % 4];
        ctx.fillRect(690 + i * 132, 1246 + r * 210, 84, 84);
      }
    }
    // dukaan-daar — baitha intezaar kar raha hai
    seatedFig(830, 2010, 1.0, { preset: SHOP_P, expr: 'sad', slump: 0.5, seed: 9 }, f + 1327);
    lampPool(1080, 1250, 700, 0.14 + (hash(Math.floor(f / 47)) > 0.92 ? -0.07 : 0));
    // raahgir — phone dekh ke guzar gaya
    const wu = D.clamp((f - 26) / 74, 0, 1);
    if (wu > 0 && wu < 1) {
      const wx = D.lerp(1960, 240, wu);
      heroFig(wx, 2300, 1.02, { expr: 'calm', armR: 'phone', walk: (f * 0.06) % 1, face: -0.4, seed: 5 }, f + 1327);
      lampPool(wx + 60, 2010, 80, 0.3);
    }
  });
}, []);

// ===== SHOT M (1440-1572) — KEEMAT + AAKHRI SAWAAL =====
shot(1440, 1485, 0.36, { cx: 1080, cy: 1600, s: 0.72 }, { cx: 1080, cy: 1600, s: 0.78 }, (f) => {
  f -= 1440;
  layer(1, () => {
    tableScene('#170f07', '#090502');
    lampPool(1080, 1560, 950, 0.2);
    const scr = phoneBody(1080, 1620, 680, 1360);
    ctx.save(); ctx.beginPath(); ctx.rect(scr.sx, scr.sy, scr.sw, scr.sh); ctx.clip();
    ctx.fillStyle = '#f4f1e6'; ctx.fillRect(scr.sx, scr.sy, scr.sw, scr.sh);
    ctx.fillStyle = YEL; ctx.fillRect(scr.sx, scr.sy, scr.sw, 132);
    text('blinkit', scr.sx + scr.sw / 2, scr.sy + 68, 64, GRN);
    const rows = [['Doodh 500ml', '₹60', '₹66', 10], ['Bread', '₹45', '₹52', 24], ['Atta 5kg', '₹240', '₹265', 38]];
    rows.forEach((r, i) => {
      const ry = scr.sy + 300 + i * 240, up = f > r[3];
      ctx.fillStyle = '#ffffff'; D.rr(ctx, scr.sx + 36, ry - 84, scr.sw - 72, 168, 14); ctx.fill();
      ctx.strokeStyle = '#ddd6c2'; ctx.lineWidth = 3; ctx.stroke();
      text(r[0], scr.sx + 62, ry - 30, 42, '#4a4234', 'left');
      if (up) {
        text(r[1], scr.sx + 62, ry + 44, 38, '#a39a86', 'left');
        ctx.strokeStyle = '#a39a86'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(scr.sx + 62, ry + 44); ctx.lineTo(scr.sx + 150, ry + 44); ctx.stroke();
        text(r[2], scr.sx + 176, ry + 44, 46, '#b3311f', 'left');
        D.poly(ctx, [[scr.sw + scr.sx - 96, ry + 58], [scr.sw + scr.sx - 66, ry + 18], [scr.sw + scr.sx - 36, ry + 58]]); ctx.fillStyle = '#b3311f'; ctx.fill();
      } else text(r[1], scr.sx + 62, ry + 44, 42, '#4a4234', 'left');
    });
    ctx.restore();
  });
}, [1452, 1466, 1480]);
shot(1485, 1572, 0.22, { cx: 1080, cy: 1620, s: 0.6 }, { cx: 1080, cy: 1580, s: 0.7 }, (f) => {
  f -= 1485;
  layer(0.4, () => {
    const g = vgrad(100, 3000, [[0, '#f7b733'], [0.45, '#e2703a'], [1, '#5a2d20']]);
    ctx.fillStyle = g; ctx.fillRect(-700, -900, 3560, 4000);
    lampPool(1620, 620, 620, 0.55);
    D.circ(ctx, 1620, 620, 110); ctx.fillStyle = '#ffe9a8'; ctx.fill();
  });
  layer(1, () => {
    ctx.fillStyle = '#2a1a10'; ctx.fillRect(-700, 2180, 3560, 920);
    // sabzi ki dukaan — subah
    ctx.fillStyle = '#6b4a2c'; ctx.fillRect(480, 1060, 1200, 1120);
    for (let r = 0; r < 2; r++) {
      ctx.fillStyle = 'rgba(43,26,12,0.6)'; ctx.fillRect(540, 1560 + r * 240, 1080, 18);
      for (let i = 0; i < 8; i++) { D.circ(ctx, 600 + i * 138 + hash(r * 9 + i) * 20, 1518 + r * 240, 30); ctx.fillStyle = ['#d94f30', '#3f9e4d', '#e8b91e', '#8bc34a', '#d94f30', '#ff8f3d', '#3f9e4d', '#e8b91e'][(i + r * 3) % 8]; ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 3; ctx.stroke(); }
    }
    D.poly(ctx, [[420, 1080], [1740, 1080], [1640, 920], [520, 920]]); ctx.fillStyle = '#a03d2a'; ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 5; ctx.stroke();
    text('SABZI MANDI', 1080, 830, 56, '#ffe9c9');
    const veg = ['#d94f30', '#3f9e4d', '#e8b91e', '#8bc34a', '#d94f30', '#ff8f3d', '#3f9e4d', '#e8b91e'];
    for (let c = 0; c < 4; c++) {
      const cx = 640 + c * 300, cy = 1990;
      crate(cx, cy + 120, 1.3, '#75501f');
      for (let i = 0; i < 6; i++) { D.circ(ctx, cx - 100 + i * 42 + hash(c * 7 + i) * 12, cy + 44 - (i % 3) * 20, 26); ctx.fillStyle = veg[(c + i) % 8]; ctx.fill(); ctx.strokeStyle = D.OUT; ctx.lineWidth = 3; ctx.stroke(); }
      for (let i = 0; i < 3; i++) { D.ell(ctx, cx - 60 + i * 56, cy - 6, 30, 15); ctx.fillStyle = '#3f9e4d'; ctx.fill(); }
    }
    // HERO — mandi me: haath sabzi ki taraf badha... phir phone yaad aaya
    const hu2 = D.clamp((f - 34) / 30, 0, 1), reach2 = Math.sin(D.clamp(hu2, 0, 1) * Math.PI * 0.5);
    const back2 = sstep(D.clamp((f - 74) / 16, 0, 1));
    heroFig(1080, 2260, 1.3, { expr: back2 > 0.5 ? 'puzzled' : 'calm', armR: back2 > 0.5 ? 'phone' : (reach2 > 0.6 ? 'offer' : 'down'), face: 0.2, seed: 5 }, f + 1485);
    lampPool(1080, 1500, 1100, 0.16);
  });
}, []);

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
Promise.all([fontReady, document.fonts.ready]).then(() => { window.ready = true; });
