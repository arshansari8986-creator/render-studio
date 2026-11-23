// "IPL — Ek Ball 49 Lakh" — Mirror kit + Gullak grammar, PROFESSIONAL level.
// Real three.js sets (stadium / ghar / purana kamra / nilami hall / office) +
// kit toon cards + scene-ke-andar boards/screens. NO CAPTIONS (user order).
// Har shot 1-2s, har shot alag disha+angle (story.js CAMS), zinda background,
// bhaav-lehja match, safe-frame. Contract: window.ready, window.renderFrame(f).
import * as THREE from 'three';
import * as FX from './fx.js';
import * as T from './toon.js';
import { idle, blinkAt, q, M, clamp, spline } from './motion.js';
import { tex, planks, plaster, stone, weave, grass } from './paint.js';
import { TOTAL, shotAt, camFor } from './story.js';

const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 300);
const lam = (o) => new THREE.MeshLambertMaterial(o);
const bas = (o) => new THREE.MeshBasicMaterial(o);

// ---------- global lights (per-set intensity in applyEnv) ----------
const hemi = new THREE.HemisphereLight(0xffe7c4, 0x5a4632, 0.95); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffd9a0, 1.8);
sun.position.set(-6, 8, 5); scene.add(sun); scene.add(sun.target);

// ---------- helpers ----------
function textBoard(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
const boardMesh = (w, h, texB, basic = false) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic ? bas({ map: texB }) : lam({ map: texB }));
const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
const dynCanvas = (w, h) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return { c, g: c.getContext('2d'), t };
};
const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };

// =====================================================================
// CHARACTER CARD (kit painter)
// =====================================================================
const CARD_CW = 1200, CARD_CH = 2000, CARD_M = 2.25;
const cardGeo = new THREE.PlaneGeometry(CARD_M * 0.6, CARD_M); cardGeo.translate(0, CARD_M / 2 - CARD_M * 0.025, 0);
const blobTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  gr.addColorStop(0, 'rgba(14,9,20,0.5)'); gr.addColorStop(1, 'rgba(14,9,20,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
})();
class Card {
  constructor() {
    this.c = document.createElement('canvas'); this.c.width = CARD_CW; this.c.height = CARD_CH;
    this.g = this.c.getContext('2d');
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mesh = new THREE.Mesh(cardGeo, new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: true }));
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: true }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.renderOrder = 1;
    scene.add(this.mesh); scene.add(this.blob); this.key = '';
  }
  draw(key, fn) {
    if (key === this.key) return; this.key = key;
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CARD_CW, CARD_CH);
    g.setTransform(CARD_CW / 600, 0, 0, CARD_CH / 1000, 0, 0);
    fn(new T.Pen(g)); this.t.needsUpdate = true;
  }
  place(x, y, z, camPos, s = 1) {
    this.mesh.visible = this.blob.visible = true;
    this.mesh.position.set(x, y, z); this.mesh.scale.setScalar(s);
    this.mesh.rotation.set(0, Math.atan2(camPos[0] - x, camPos[2] - z), 0);
    this.blob.position.set(x, Math.max(0.02, y + 0.03), z); this.blob.scale.setScalar(s);
  }
  hide() { this.mesh.visible = this.blob.visible = false; }
}
// ek character ko draw+place karo (idle/blink/key sab andar)
function drawChar(card, seed, outfit, expr, R, L, f, camPos, x, y, z, s = 1.03, step = 0, lift = null) {
  const idl = idle(f, seed), blink = blinkAt(f, seed);
  const liftQ = lift === null ? '' : q(lift, 1);
  const key = `${seed}|${expr}|${R}|${L}|${blink}|${q(idl.bob, 2)}|${Math.round(idl.tilt)}|${q(step, 2)}|${liftQ}`;
  card.draw(key, (p) => T.romanFront(p, outfit, {
    seed, expr, R, L, blink, bob: q(idl.bob, 2), tilt: Math.round(idl.tilt),
    headTilt: Math.round(idle(f, seed + 2).headTilt), wv: f * 0.18, step, lift: lift === null ? 0 : lift,
  }));
  card.place(x, y, z, camPos, s);
}
const ladkaCard = new Card(), dostCard = new Card(), bowlerCard = new Card(), batsmanCard = new Card();
const fielderCard = new Card(), auctCard = new Card(), officerCard = new Card();
const bidderCards = [new Card(), new Card(), new Card(), new Card(), new Card(), new Card()];
const ALL_CARDS = [ladkaCard, dostCard, bowlerCard, batsmanCard, fielderCard, auctCard, officerCard, ...bidderCards];
const LADKA = { tunic: '#2e5da8', shirt: '#f5efe0', skin: '#dfa06b', hair: '#1e1a20' };
const DOST = { tunic: '#d97b29', shirt: '#f2ead8', skin: '#c98a54', hair: '#26222a', stout: true };
const BOWLER = { tunic: '#7a1fa2', shirt: '#f5efe0', skin: '#a06a3c', hair: '#14100f' };
const BATSMAN = { tunic: '#c23b2e', shirt: '#f5efe0', skin: '#dfa06b', hair: '#1e1a20' };
const AUCT = { tunic: '#2b3040', shirt: '#f5efe0', skin: '#ecd0b6', hair: '#3a3230', moustache: '#3a2a1c' };
const OFFICER = { tunic: '#39434c', shirt: '#e8eef4', skin: '#c98a54', hair: '#14100f' };
const BIDDER_OUTFITS = [
  { tunic: '#3f7a4a', shirt: '#f2ead8', skin: '#c98a54', hair: '#1e1a20' },
  { tunic: '#7a2e35', shirt: '#efe6d0', skin: '#a06a3c', hair: '#26222a' },
  { tunic: '#44546a', shirt: '#f5efe0', skin: '#dfa06b', hair: '#3a3230' },
  { tunic: '#8a5d3b', shirt: '#f1e6cf', skin: '#ecd0b6', hair: '#241a14', moustache: '#3a2a1c' },
  { tunic: '#54687e', shirt: '#f5efe0', skin: '#c99067', hair: '#1e1714', stout: true },
  { tunic: '#a3542e', shirt: '#f2ead8', skin: '#f5c9a0', hair: '#5a3b2a' },
];

// =====================================================================
// SET 1 — STADIUM (raat: gehra neela + floodlight safed + bheed ke rang)
// =====================================================================
const stadiumG = new THREE.Group(); scene.add(stadiumG);
const CROWD_BLOCKS = [];
let stadRedraw = null, counterRedraw = null;
const ballG = new THREE.Group(); scene.add(ballG);
const counterBoard = new THREE.Group(); scene.add(counterBoard);
{
  const S = stadiumG;
  // ---- maidan: ghaas + pitch ----
  const grassF = new THREE.Mesh(new THREE.CircleGeometry(30, 40), lam({ map: tex(grass(6), 10, 10), color: 0x4fae4a }));
  grassF.rotation.x = -Math.PI / 2; grassF.position.set(0, 0, -2); S.add(grassF);
  const outRing = new THREE.Mesh(new THREE.RingGeometry(11.5, 12.6, 40), lam({ color: 0x2e7a35 }));
  outRing.rotation.x = -Math.PI / 2; outRing.position.set(0, 0.012, -0.5); S.add(outRing);
  const pitch = box(3.0, 0.07, 13.5, lam({ color: 0xdcbc7d })); pitch.position.set(0, 0.035, -0.5); S.add(pitch);
  for (const cz of [-4.9, 3.9]) {
    const crease = box(2.6, 0.085, 0.14, lam({ color: 0xf5f2e8 })); crease.position.set(0, 0.045, cz); S.add(crease);
    for (let i = -1; i <= 1; i++) {
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.72, 8), lam({ color: 0xf5d76a }));
      st.position.set(i * 0.22, 0.42, cz + (cz < 0 ? -0.12 : 0.12)); S.add(st);
    }
  }
  const ropeM = lam({ color: 0xf2f2f2 });
  for (let i = 0; i < 26; i++) {
    const a = i / 26 * Math.PI * 2;
    const rp = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), ropeM);
    rp.position.set(Math.cos(a) * 12.05, 0.1, -0.5 + Math.sin(a) * 12.05); rp.scale.y = 0.6; S.add(rp);
  }
  // ---- stands: 4 taraf tiers + bheed (rang-birange blocks, leher animate) ----
  const standM = lam({ color: 0x27364d });
  const crowdCols = [0xff5347, 0xf5d76a, 0x57d977, 0x4da3ff, 0xff8ac2, 0xf2f2f2, 0xff9636, 0x9b7ff2];
  const addCrowdRow = (cx, cy, cz, n, spread, alongX, seedO) => {
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const off = (t - 0.5) * spread;
      const b = box(0.36, 0.42, 0.3, lam({ color: crowdCols[(seedO + i * 3) % crowdCols.length] }));
      b.position.set(alongX ? cx + off : cx, cy, alongX ? cz : cz + off);
      S.add(b); CROWD_BLOCKS.push({ m: b, y: cy, ph: (seedO + i * 1.7) % 6.28 });
    }
  };
  const mkStand = (cx, cz, ry, rows, len) => {
    for (let r = 0; r < rows; r++) {
      const y = 0.8 + r * 0.95, back = r * 1.05;
      const alongX = Math.abs(ry) < 0.1 || Math.abs(Math.abs(ry) - Math.PI) < 0.1;
      const tier = box(alongX ? len : 1.1, 0.9, alongX ? 1.1 : len, standM);
      const bx = alongX ? cx : cx + Math.sign(cx || 1) * back * (ry > 0 ? 1 : -1) * 0 + (ry === 0 ? 0 : 0);
      tier.position.set(alongX ? cx : cx + (cx > 0 ? back : -back), y - 0.45, alongX ? cz + (cz > 0 ? back : -back) : cz);
      S.add(tier);
      addCrowdRow(alongX ? cx : cx + (cx > 0 ? back : -back), y + 0.22, alongX ? cz + (cz > 0 ? back : -back) : cz,
        Math.floor(len / 0.85), len * 0.88, alongX, r * 7 + Math.floor(cx + cz));
    }
  };
  mkStand(0, -19.5, 0, 6, 24);        // north (screen ke peeche, uncha)
  mkStand(0, 15.5, 0, 4, 24);         // south (camera side, neeche)
  mkStand(-16.5, -2, 1, 5, 26);       // west
  mkStand(16.5, -2, 1, 5, 26);        // east
  // ---- badi screen (north stand ke saamne) ----
  const scrFrame = box(8.5, 5.5, 0.25, lam({ color: 0x0d1420 })); scrFrame.position.set(0, 5.9, -15.85); S.add(scrFrame);
  const SD = dynCanvas(1024, 640);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 5.0), bas({ map: SD.t }));
  scr.position.set(0, 5.9, -15.68); S.add(scr);
  stadRedraw = (mode, p = 1, f = 0) => {
    const g = SD.g, w = 1024, h = 640;
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#0a1626'); gr.addColorStop(1, '#060b16');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#f5d76a'; g.lineWidth = 10; g.strokeRect(18, 18, w - 36, h - 36);
    g.textAlign = 'center';
    if (mode === 'hook') {
      g.fillStyle = '#ffffff'; g.font = 'bold 70px Arial';
      g.fillText('EK BALL =', w / 2, 215);
      g.fillStyle = '#f5d76a'; g.font = 'bold 138px Arial';
      g.fillText('₹49,00,000?', w / 2, 380);
      g.fillStyle = '#9fc4e0'; g.font = 'bold 38px Arial';
      g.fillText('— HAR BALL KI KEEMAT —', w / 2, 500);
    } else if (mode === 'counter' || mode === 'final') {
      g.fillStyle = '#9fc4e0'; g.font = 'bold 42px Arial';
      g.fillText('HAR BALL PAR BAN RAHE HAIN', w / 2, 140);
      const val = mode === 'final' ? 4900000 : 4900000 * M.easeOut(p);
      g.fillStyle = '#f5d76a'; g.font = 'bold 132px Arial';
      g.fillText(inr(val), w / 2, 330);
      g.fillStyle = '#1d2c3f'; g.fillRect(112, 420, w - 224, 26);
      g.fillStyle = '#57d977'; g.fillRect(112, 420, (w - 224) * (mode === 'final' ? 1 : p), 26);
      if (mode === 'final') {
        g.fillStyle = '#ffffff'; g.font = 'bold 44px Arial';
        g.fillText('NA CHAUKA, NA CHHAKKA — PHIR BHI!', w / 2, 540);
      }
    } else if (mode === 'match') {
      g.fillStyle = '#ffffff'; g.font = 'bold 58px Arial';
      g.fillText('EK MATCH', w / 2, 190);
      g.fillStyle = '#f5d76a'; g.font = 'bold 136px Arial';
      g.fillText('₹118 CRORE', w / 2, 360);
      g.fillStyle = '#9fc4e0'; g.font = 'bold 38px Arial';
      g.fillText('— DIKHANE KE HAQ —', w / 2, 490);
    } else if (mode === 'over') {
      g.fillStyle = '#ffffff'; g.font = 'bold 58px Arial';
      g.fillText('1 OVER =', w / 2, 165);
      g.fillStyle = '#f5d76a'; g.font = 'bold 124px Arial';
      g.fillText('₹3 CRORE', w / 2, 320);
      const filled = Math.floor(p * 6.001);
      for (let i = 0; i < 6; i++) {
        const cx = w / 2 + (i - 2.5) * 118, cy = 460;
        g.beginPath(); g.arc(cx, cy, 42, 0, 7);
        g.fillStyle = i < filled ? '#f2f2f2' : '#22344c'; g.fill();
        g.strokeStyle = i < filled ? '#d21f14' : '#3c5878'; g.lineWidth = 5; g.stroke();
        if (i < filled) { g.beginPath(); g.arc(cx, cy, 42, -0.5, 0.9); g.strokeStyle = '#d21f14'; g.stroke(); }
      }
      g.fillStyle = '#9fc4e0'; g.font = 'bold 34px Arial';
      g.fillText('6 BALL = 1 OVER', w / 2, 570);
    } else if (mode === 'sawal') {
      g.fillStyle = '#9fc4e0'; g.font = 'bold 46px Arial';
      g.fillText('AGLE HAQ KITNE KE BIKENGE?', w / 2, 105);
      g.fillStyle = '#ffffff'; g.font = 'bold 92px Arial';
      g.fillText('₹70,000', w / 4 + 16, 265);
      g.fillText('CRORE?', w / 4 + 16, 375);
      g.fillStyle = '#f5d76a'; g.font = 'bold 76px Arial';
      g.fillText('YA', w / 2, 330);
      g.fillText('₹1,00,000', w * 3 / 4 - 16, 265);
      g.fillStyle = '#ffffff';
      g.fillText('CRORE?', w * 3 / 4 - 16, 375);
      g.fillStyle = '#57d977'; g.font = 'bold 40px Arial';
      g.fillText('— TUM BATAO —', w / 2, 520);
    } else if (mode === 'tease') {
      g.fillStyle = '#f5d76a'; g.font = 'bold 50px Arial';
      g.fillText('AGLI KAHANI', w / 2, 165);
      g.fillStyle = '#ffffff'; g.font = 'bold 108px Arial';
      g.fillText('ZOMATO KE ₹500', w / 2, 330);
      g.fillText('KA HISAAB', w / 2, 465);
    }
    SD.t.needsUpdate = true;
  };
  stadRedraw('hook', 1, 0);
  // ---- floodlight towers (4) ----
  const lampM = bas({ color: 0xffffff });
  for (const [fx, fz] of [[-12.5, -12], [12.5, -12], [-12.5, 9], [12.5, 9]]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 12.5, 8), lam({ color: 0x39434c }));
    pole.position.set(fx, 6.25, fz); S.add(pole);
    const head = box(2.3, 1.3, 0.18, lam({ color: 0x22262b })); head.position.set(fx, 12.6, fz);
    head.lookAt(0, 10.5, -0.5); S.add(head);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
      const lamp = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.45), lampM);
      lamp.position.set(fx + (c - 1) * 0.72, 12.6 + (r - 0.5) * 0.58, fz);
      lamp.lookAt(0, 9.8, -0.5); S.add(lamp);
    }
    const gl = FX.glint(1.5); gl.position.set(fx, 12.6, fz + (fz < 0 ? 0.5 : -0.5)); S.add(gl);
  }
  // ---- flags (stands ke upar, lehrate hue) ----
  const flagCols = [0xff5347, 0xf5d76a, 0x4da3ff, 0x57d977, 0xff8ac2];
  window.__flags = [];
  for (let i = 0; i < 10; i++) {
    const fx = -11 + i * 2.45;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.6, 6), lam({ color: 0xd8dee2 }));
    pole.position.set(fx, 8.6, -19.2); S.add(pole);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.5), lam({ color: flagCols[i % 5], side: THREE.DoubleSide }));
    fl.position.set(fx + 0.44, 9.15, -19.2); S.add(fl);
    window.__flags.push(fl);
  }
  // ---- BALL + floating counter board ----
  const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), lam({ color: 0xf7f7f7 }));
  ballG.add(ballMesh);
  const seam = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.018, 8, 24), lam({ color: 0xd21f14 }));
  ballG.add(seam);
  const CD = dynCanvas(512, 200);
  const cbFrame = box(1.62, 0.68, 0.05, lam({ color: 0x0d1420 })); counterBoard.add(cbFrame);
  const cbScr = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.58), bas({ map: CD.t }));
  cbScr.position.z = 0.03; counterBoard.add(cbScr);
  counterRedraw = (val, label = 'HAR BALL') => {
    const g = CD.g, w = 512, h = 200;
    g.fillStyle = '#0a1626'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#f5d76a'; g.lineWidth = 7; g.strokeRect(8, 8, w - 16, h - 16);
    g.textAlign = 'center';
    g.fillStyle = '#9fc4e0'; g.font = 'bold 30px Arial'; g.fillText(label, w / 2, 48);
    g.fillStyle = '#f5d76a'; g.font = 'bold 74px Arial'; g.fillText(inr(val), w / 2, 140);
    CD.t.needsUpdate = true;
  };
  counterRedraw(0);
  ballG.visible = false; counterBoard.visible = false;
}
const BALL_PTS = [[0.95, 1.05, -4.4], [0.6, 1.25, -2.6], [0.2, 0.35, -0.6], [0.08, 0.17, 0.7], [0.05, 0.8, 2.3], [0, 0.95, 3.3]];
const ballPath = (u, mirror = 1) => {
  const p = spline(BALL_PTS, M.easeInOut(u));
  return [p[0] * mirror, p[1], p[2]];
};

// =====================================================================
// SET 2 — GHAR (garam peela: sofa, TV, pankha, desk)
// =====================================================================
const homeG = new THREE.Group(); scene.add(homeG);
let tvRedraw = null, hisaabRedraw = null, fanBlades = null;
const billMesh = new THREE.Group(); scene.add(billMesh);
{
  const S = homeG;
  const WALL_Z = -3.2;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), lam({ map: tex(planks(7), 5, 5), color: 0xcfa06a }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 3); S.add(floor);
  const wallM = lam({ map: tex(plaster(11, 40), 4, 1), color: 0xeccd9c });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(26, 8), wallM); back.position.set(0, 4, WALL_Z); S.add(back);
  for (const s of [-1, 1]) {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(20, 8), lam({ map: tex(plaster(13, 38), 3, 1), color: 0xe2cda2 }));
    sw.position.set(s * 6.8, 4, 2.5); sw.rotation.y = -s * Math.PI / 2; S.add(sw);
  }
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.6), lam({ map: tex(weave(21), 2, 2), color: 0x3f6a8a }));
  rug.rotation.x = -Math.PI / 2; rug.position.set(0.1, 0.012, 0.7); S.add(rug);
  // ---- khidki (right): raat ka neela bahar + parda ----
  const winF = box(1.5, 2.0, 0.08, lam({ color: 0x5d3f24 })); winF.position.set(2.5, 2.15, WALL_Z + 0.02); S.add(winF);
  const winSky = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.8), bas({ color: 0x16283f }));
  winSky.position.set(2.5, 2.15, WALL_Z + 0.07); S.add(winSky);
  for (let i = 0; i < 7; i++) {
    const star = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.05), bas({ color: 0xffffff }));
    star.position.set(2.0 + (i * 37 % 10) / 10, 1.5 + (i * 53 % 12) / 10, WALL_Z + 0.08); S.add(star);
  }
  const moon = new THREE.Mesh(new THREE.CircleGeometry(0.14, 16), bas({ color: 0xf5efce }));
  moon.position.set(2.85, 2.75, WALL_Z + 0.08); S.add(moon);
  for (const px of [1.68, 3.32]) {
    const cur = box(0.22, 2.0, 0.05, lam({ color: 0xa33327 })); cur.position.set(px, 2.15, WALL_Z + 0.12); S.add(cur);
  }
  // ---- TV (wall par, dynamic) ----
  const tvFrame = box(2.46, 1.5, 0.09, lam({ color: 0x14181d })); tvFrame.position.set(-0.75, 1.95, WALL_Z + 0.04); S.add(tvFrame);
  const TD = dynCanvas(512, 288);
  const tvScr = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.34), bas({ map: TD.t }));
  tvScr.position.set(-0.75, 1.95, WALL_Z + 0.1); S.add(tvScr);
  tvRedraw = (mode, p = 1, f = 0) => {
    const g = TD.g, w = 512, h = 288;
    if (mode === 'match') {
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#1d5c2a'); gr.addColorStop(1, '#2e7a35');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = '#dcbc7d'; g.fillRect(w / 2 - 26, 30, 52, h - 90);
      const bx = 60 + ((f * 3.1) % 390), by = 130 + Math.sin(f * 0.35) * 34;
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(bx, by, 9, 0, 7); g.fill();
      g.fillStyle = '#0c1420'; g.fillRect(0, h - 44, w, 44);
      g.fillStyle = '#ffffff'; g.font = 'bold 24px Arial'; g.textAlign = 'left';
      g.fillText('IPL — MATCH LIVE', 16, h - 14);
      g.fillStyle = '#d21f14'; g.beginPath(); g.arc(w - 66, 26, 8, 0, 7); g.fill();
      g.fillStyle = '#ffffff'; g.font = 'bold 22px Arial'; g.fillText('LIVE', w - 52, 33);
    } else if (mode === 'ad') {
      const gr = g.createLinearGradient(0, 0, w, h);
      gr.addColorStop(0, '#ff5da2'); gr.addColorStop(1, '#ffb52e');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 8; i++) {
        g.fillStyle = '#ffffff55'; g.beginPath();
        g.arc((i * 83 + 30) % w, (i * 61 + 40) % h, 13 + (i % 3) * 5, 0, 7); g.fill();
      }
      const bob = Math.sin(f * 0.55) * 12, rot = Math.sin(f * 0.55) * 0.09;
      g.save(); g.translate(w / 2, 158 + bob); g.rotate(rot);
      g.fillStyle = '#7a1fa2'; rr(g, -62, -62, 124, 124, 16); g.fill();
      g.fillStyle = '#ffffff'; rr(g, -62, -62, 124, 44, 16); g.fill();
      g.fillStyle = '#7a1fa2'; g.font = 'bold 30px Arial'; g.textAlign = 'center';
      g.fillText('SABUN', 0, -24);
      g.fillStyle = '#ffffff'; g.font = 'bold 25px Arial';
      g.fillText('DHAMAKA!', 0, 32);
      g.restore();
      g.fillStyle = '#3a0a28'; g.font = 'bold 40px Arial'; g.textAlign = 'center';
      g.fillText('DHAMAKA SABUN!', w / 2, 52);
      g.font = 'bold 27px Arial';
      g.fillText('KHARIDO! KHARIDO!', w / 2, h - 16);
    } else if (mode === 'q') {
      g.fillStyle = '#060a14'; g.fillRect(0, 0, w, h);
      g.textAlign = 'center';
      if (p > 0.12) {
        g.fillStyle = '#ffffff'; g.font = 'bold 56px Arial';
        g.fillText('PAISA DETA', w / 2, 118);
      }
      if (p > 0.5) {
        g.fillStyle = '#f5d76a'; g.font = 'bold 68px Arial';
        g.fillText('KAUN HAI?', w / 2, 208);
      }
    } else { // glow
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#1a2c44'); gr.addColorStop(1, '#0a1420');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = '#274b73'; g.fillRect(w / 2 - 20, 40, 40, h - 100);
      g.fillStyle = '#3f6a9a'; g.font = 'bold 26px Arial'; g.textAlign = 'center';
      g.fillText('...', w / 2, h - 22);
    }
    TD.t.needsUpdate = true;
  };
  tvRedraw('match', 1, 0);
  // TV console + remote + chai
  const console_ = box(2.2, 0.09, 0.5, lam({ map: FX.woodTexture(), color: 0x7d5230 }));
  console_.position.set(-0.75, 0.95, WALL_Z + 0.35); S.add(console_);
  const remote = box(0.07, 0.025, 0.2, lam({ color: 0x22262b })); remote.position.set(-1.5, 1.01, WALL_Z + 0.35); remote.rotation.y = 0.4; S.add(remote);
  // ---- sofa ----
  const sofaM = lam({ color: 0x8e3b2e });
  const sBase = box(2.7, 0.52, 1.05, sofaM); sBase.position.set(0.1, 0.3, -1.2); S.add(sBase);
  const sBack = box(2.7, 0.95, 0.28, sofaM); sBack.position.set(0.1, 0.85, -1.72); S.add(sBack);
  for (const sx of [-1.28, 1.48]) { const arm = box(0.28, 0.35, 1.05, sofaM); arm.position.set(sx === -1.28 ? -1.15 : 1.35, 0.68, -1.2); S.add(arm); }
  const cushM = lam({ color: 0xd9a441 });
  for (const cx of [-0.55, 0.75]) { const cu = box(0.55, 0.5, 0.14, cushM); cu.position.set(cx, 0.82, -1.52); cu.rotation.x = -0.15; S.add(cu); }
  // ---- pankha (ceiling fan, ghoomta hua) ----
  const fanG = new THREE.Group(); fanG.position.set(0.1, 3.62, -0.9); S.add(fanG);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.4, 8), lam({ color: 0x39434c }));
  rod.position.y = 0.2; fanG.add(rod);
  fanBlades = new THREE.Group(); fanG.add(fanBlades);
  for (let i = 0; i < 3; i++) {
    const bl = box(1.05, 0.025, 0.24, lam({ color: 0x8a5d3b }));
    const a = i / 3 * Math.PI * 2;
    bl.position.set(Math.cos(a) * 0.62, 0, Math.sin(a) * 0.62); bl.rotation.y = -a; fanBlades.add(bl);
  }
  const fanHub = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), lam({ color: 0x5d3a22 })); fanG.add(fanHub);
  // ---- desk (right) + HISAAB kagaz (dynamic) ----
  const deskG = new THREE.Group(); deskG.position.set(2.35, 0, -0.7); S.add(deskG);
  const dTop = box(1.15, 0.07, 0.85, lam({ map: FX.woodTexture(), color: 0x7d5230 })); dTop.position.y = 0.74; deskG.add(dTop);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = box(0.07, 0.74, 0.07, lam({ color: 0x54371f }));
    leg.position.set(sx * 0.48, 0.37, sz * 0.34); deskG.add(leg);
  }
  const HD = dynCanvas(512, 680);
  const hisaab = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.68), lam({ map: HD.t }));
  hisaab.rotation.x = -Math.PI / 2; hisaab.rotation.z = -0.12; hisaab.position.set(0, 0.782, 0); deskG.add(hisaab);
  hisaabRedraw = (p) => {
    const g = HD.g, w = 512, h = 680;
    g.fillStyle = '#f8f4e8'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#9a917c'; g.lineWidth = 4; g.strokeRect(12, 12, w - 24, h - 24);
    g.fillStyle = '#b8d2ea';
    for (let r = 0; r < 12; r++) g.fillRect(30, 120 + r * 46, w - 60, 2);
    g.fillStyle = '#173f5e'; g.font = 'bold 46px Arial'; g.textAlign = 'center';
    g.fillText('MERA HISAAB', w / 2, 74);
    g.textAlign = 'left'; g.fillStyle = '#22252c'; g.font = 'bold 39px Arial';
    if (p > 0.08) g.fillText('1 MATCH = ₹118 CRORE', 34, 190);
    if (p > 0.42) g.fillText('1 OVER  = ₹3 CRORE', 34, 300);
    if (p > 0.76) {
      g.fillStyle = '#b3231b'; g.font = 'bold 46px Arial';
      g.fillText('1 BALL = ₹49 LAKH!', 34, 420);
    }
    if (p > 0.9) {
      g.fillStyle = '#3a2c1c'; g.font = '28px Arial';
      g.fillText('...aur paisa deta kaun hai?', 34, 520);
    }
    HD.t.needsUpdate = true;
  };
  hisaabRedraw(0);
  const pen = box(0.16, 0.015, 0.015, lam({ color: 0x2e5da8 })); pen.position.set(0.32, 0.79, 0.2); pen.rotation.y = 0.6; deskG.add(pen);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.085, 12), lam({ color: 0xf2ede2 }));
  cup.position.set(-0.38, 0.82, -0.2); deskG.add(cup);
  // ---- IPL poster (wall) ----
  const posterTex = textBoard(512, 300, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#7a1fa2'); gr.addColorStop(1, '#c23b2e');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.font = 'bold 120px Arial'; g.textAlign = 'center';
    g.fillText('IPL', w / 2, 150);
    g.fillStyle = '#f5d76a'; g.font = 'bold 40px Arial';
    g.fillText('CRICKET KA TYOHAAR', w / 2, 235);
  });
  const poster = boardMesh(1.05, 0.62, posterTex); poster.position.set(-2.7, 2.7, WALL_Z + 0.05); S.add(poster);
  // ---- subscription bill (prop, ladka ke haath ke paas rakha jayega) ----
  const BD = dynCanvas(384, 512);
  const billTexDraw = () => {
    const g = BD.g, w = 384, h = 512;
    g.fillStyle = '#f8f4e8'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#9a917c'; g.lineWidth = 4; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#b3231b'; g.fillRect(10, 10, w - 20, 74);
    g.fillStyle = '#ffffff'; g.font = 'bold 34px Arial'; g.textAlign = 'center';
    g.fillText('SUBSCRIPTION BILL', w / 2, 60);
    g.fillStyle = '#22252c'; g.font = '30px Arial';
    g.fillText('IPL PACK — LIVE', w / 2, 140);
    g.fillStyle = '#b3231b'; g.font = 'bold 56px Arial';
    g.fillText('₹499', w / 2, 225);
    g.fillStyle = '#22252c'; g.font = 'bold 30px Arial';
    g.fillText('/ MAHINA', w / 2, 272);
    g.fillStyle = '#b8b2a2';
    for (let r = 0; r < 4; r++) g.fillRect(40, 310 + r * 34, w - 80, 11);
    g.fillStyle = '#3a2c1c'; g.font = 'bold 25px Arial';
    g.fillText('HAR MAHINA — KHUD', w / 2, 458);
    g.fillText('KAT JAATA HAI', w / 2, 494);
    BD.t.needsUpdate = true;
  };
  billTexDraw();
  const billPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.48), lam({ map: BD.t, side: THREE.DoubleSide }));
  billMesh.add(billPlane);
  billMesh.visible = false;
}

// =====================================================================
// SET 3 — PURANA KAMRA 2008 (faded rang: CRT TV, purana sofa, ghadi)
// =====================================================================
const oldG = new THREE.Group(); scene.add(oldG);
let crtRedraw = null, oldBoardRedraw = null;
{
  const S = oldG;
  const WALL_Z = -3.2;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), lam({ map: tex(planks(9), 5, 5), color: 0xa8895e }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 3); S.add(floor);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(24, 8), lam({ map: tex(plaster(15, 42), 4, 1), color: 0xcdbb96 }));
  back.position.set(0, 4, WALL_Z); S.add(back);
  for (const s of [-1, 1]) {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(18, 8), lam({ map: tex(plaster(17, 40), 3, 1), color: 0xc2b08a }));
    sw.position.set(s * 6.2, 4, 2.5); sw.rotation.y = -s * Math.PI / 2; S.add(sw);
  }
  // ---- CRT TV (table par) ----
  const table = box(1.7, 0.08, 1.0, lam({ map: FX.woodTexture(), color: 0x6d4a2c }));
  table.position.set(0, 0.72, -2.2); S.add(table);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = box(0.07, 0.72, 0.07, lam({ color: 0x4c3016 }));
    leg.position.set(sx * 0.75, 0.36, -2.2 + sz * 0.42); S.add(leg);
  }
  const crtBody = box(1.15, 0.92, 0.85, lam({ color: 0x8a8578 })); crtBody.position.set(0, 1.24, -2.25); S.add(crtBody);
  const CD2 = dynCanvas(320, 240);
  const crtScr = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.66), bas({ map: CD2.t }));
  crtScr.position.set(-0.05, 1.26, -1.81); S.add(crtScr);
  crtRedraw = (f) => {
    const g = CD2.g, w = 320, h = 240;
    g.fillStyle = '#274d2a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#dcbc7d'; g.fillRect(w / 2 - 14, 26, 28, h - 66);
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(70 + (f * 2.3) % 180, 110 + Math.sin(f * 0.4) * 22, 5, 0, 7); g.fill();
    g.fillStyle = '#f5d76a'; g.font = 'bold 30px Arial'; g.textAlign = 'right';
    g.fillText('2008', w - 12, 36);
    g.fillStyle = '#0c1420'; g.fillRect(0, h - 30, w, 30);
    g.fillStyle = '#ffffff'; g.font = 'bold 17px Arial'; g.textAlign = 'left';
    g.fillText('IPL — PEHLA SAAL', 10, h - 9);
    // static noise + scanlines
    for (let i = 0; i < 260; i++) {
      g.fillStyle = `rgba(255,255,255,${Math.random() * 0.16})`;
      g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    g.fillStyle = 'rgba(0,0,0,0.13)';
    for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1);
    CD2.t.needsUpdate = true;
  };
  crtRedraw(0);
  for (let i = 0; i < 3; i++) {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 10), lam({ color: 0x3a362c }));
    knob.rotation.x = Math.PI / 2; knob.position.set(0.42, 1.5 - i * 0.2, -1.8); S.add(knob);
  }
  const ant1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.1, 6), lam({ color: 0x5a564a }));
  ant1.position.set(0.3, 2.1, -2.3); ant1.rotation.z = 0.5; S.add(ant1);
  const ant2 = ant1.clone(); ant2.rotation.z = -0.4; ant2.position.x = 0.42; S.add(ant2);
  // ---- purana sofa + radio ----
  const sofaM = lam({ color: 0x6d7a52 });
  const sBase = box(2.3, 0.48, 0.95, sofaM); sBase.position.set(-1.85, 0.28, -0.35); S.add(sBase);
  const sBack = box(2.3, 0.85, 0.24, sofaM); sBack.position.set(-1.85, 0.78, -0.83); S.add(sBack);
  const radio = box(0.62, 0.36, 0.28, lam({ color: 0x7d5230 })); radio.position.set(2.6, 0.95, -2.3); S.add(radio);
  const rTable = box(0.8, 0.75, 0.5, lam({ color: 0x5d3f24 })); rTable.position.set(2.6, 0.38, -2.3); S.add(rTable);
  const dial = new THREE.Mesh(new THREE.CircleGeometry(0.09, 14), lam({ color: 0xf5d76a }));
  dial.position.set(2.45, 0.98, -2.15); S.add(dial);
  // ---- board (wall, right) — dynamic: cr / saal ----
  const bFrame = box(1.66, 1.16, 0.07, lam({ color: 0x4c3016 })); bFrame.position.set(2.2, 2.05, WALL_Z + 0.03); S.add(bFrame);
  const OD = dynCanvas(768, 512);
  const ob = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.0), bas({ map: OD.t }));
  ob.position.set(2.2, 2.05, WALL_Z + 0.08); S.add(ob);
  oldBoardRedraw = (mode) => {
    const g = OD.g, w = 768, h = 512;
    g.fillStyle = '#f3e9d2'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#8a6a42'; g.lineWidth = 8; g.strokeRect(14, 14, w - 28, h - 28);
    g.textAlign = 'center';
    if (mode === 'cr') {
      g.fillStyle = '#4c3a22'; g.font = 'bold 40px Arial';
      g.fillText('IPL DIKHANE KE HAQ', w / 2, 105);
      g.fillStyle = '#8a2f1b'; g.font = 'bold 108px Arial';
      g.fillText('₹8,200', w / 2, 245);
      g.fillText('CRORE', w / 2, 355);
      g.fillStyle = '#4c3a22'; g.font = 'bold 44px Arial';
      g.fillText('— SAAL 2008 —', w / 2, 450);
    } else {
      g.fillStyle = '#4c3a22'; g.font = 'bold 64px Arial';
      g.fillText('POORE', w / 2, 140);
      g.fillStyle = '#8a2f1b'; g.font = 'bold 150px Arial';
      g.fillText('10 SAAL', w / 2, 300);
      g.fillStyle = '#4c3a22'; g.font = 'bold 64px Arial';
      g.fillText('KE LIYE!', w / 2, 425);
    }
    OD.t.needsUpdate = true;
  };
  oldBoardRedraw('cr');
  // ---- ghadi (wall, board ke upar-left) ----
  const clockTex = textBoard(256, 256, (g, w, h) => {
    g.fillStyle = '#f3e9d2'; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.fill();
    g.strokeStyle = '#4c3016'; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 114, 0, 7); g.stroke();
    g.strokeStyle = '#3a2c1c'; g.lineWidth = 10; g.beginPath(); g.moveTo(128, 128); g.lineTo(178, 160); g.stroke();
    g.lineWidth = 7; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 52); g.stroke();
    g.fillStyle = '#8a2f1b'; g.beginPath(); g.arc(128, 128, 9, 0, 7); g.fill();
  });
  const clock = new THREE.Mesh(new THREE.CircleGeometry(0.34, 24), lam({ map: clockTex }));
  clock.position.set(2.2, 3.0, WALL_Z + 0.06); S.add(clock);
  const calTex = textBoard(300, 380, (g, w, h) => {
    g.fillStyle = '#f3e9d2'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#8a2f1b'; g.fillRect(0, 0, w, 70);
    g.fillStyle = '#ffffff'; g.font = 'bold 44px Arial'; g.textAlign = 'center';
    g.fillText('2008', w / 2, 52);
    g.fillStyle = '#b8b2a2';
    for (let r = 0; r < 6; r++) for (let c = 0; c < 5; c++) g.fillRect(28 + c * 52, 100 + r * 44, 36, 20);
  });
  const cal = boardMesh(0.5, 0.64, calTex); cal.position.set(-2.3, 2.1, WALL_Z + 0.05); S.add(cal);
}

// =====================================================================
// SET 4 — NILAMI HALL (sunehra: stage, bidders, gavel, board)
// =====================================================================
const auctionG = new THREE.Group(); scene.add(auctionG);
let auctRedraw = null;
const gavelG = new THREE.Group(); scene.add(gavelG);
{
  const S = auctionG;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), lam({ map: tex(weave(23, [150, 30, 40]), 4, 4), color: 0xd4695a }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 3); S.add(floor);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(26, 9), lam({ map: tex(plaster(19, 38), 4, 1), color: 0xe8bc62 }));
  back.position.set(0, 4.5, -4.9); S.add(back);
  for (const s of [-1, 1]) {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(20, 9), lam({ map: tex(plaster(21, 36), 3, 1), color: 0xdfae52 }));
    sw.position.set(s * 7.2, 4.5, 0); sw.rotation.y = -s * Math.PI / 2; S.add(sw);
  }
  for (const px of [-3.6, 3.6]) {
    const pil = box(0.55, 6.4, 0.55, lam({ color: 0xe8c877 })); pil.position.set(px, 3.2, -4.2); S.add(pil);
    const cap = box(0.8, 0.3, 0.8, lam({ color: 0xf5d76a })); cap.position.set(px, 6.3, -4.2); S.add(cap);
  }
  // ---- stage + desk ----
  const stage = box(7.6, 0.36, 2.4, lam({ map: FX.woodTexture(), color: 0x8a5d33 })); stage.position.set(0, 0.18, -3.7); S.add(stage);
  const desk = box(1.5, 0.95, 0.6, lam({ map: FX.woodTexture(), color: 0x54371f })); desk.position.set(0.9, 0.84, -3.45); S.add(desk);
  const deskTop = box(1.7, 0.07, 0.75, lam({ color: 0x7d5230 })); deskTop.position.set(0.9, 1.35, -3.45); S.add(deskTop);
  // ---- board (stage ke upar) — dynamic ----
  const aFrame = box(3.7, 1.6, 0.09, lam({ color: 0x3a2410 })); aFrame.position.set(0, 3.55, -4.78); S.add(aFrame);
  const AD = dynCanvas(1024, 400);
  const ab = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.33), bas({ map: AD.t }));
  ab.position.set(0, 3.55, -4.72); S.add(ab);
  auctRedraw = (mode, p = 1, f = 0) => {
    const g = AD.g, w = 1024, h = 400;
    g.fillStyle = '#2a1608'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#f5d76a'; g.lineWidth = 8; g.strokeRect(12, 12, w - 24, h - 24);
    g.textAlign = 'center';
    g.fillStyle = '#d9b84c'; g.font = 'bold 42px Arial';
    g.fillText('IPL MEDIA RIGHTS — NILAMI 2022', w / 2, 72);
    if (mode === 'bid') {
      const val = 8200 + (48390 - 8200) * M.easeInOut(p);
      g.fillStyle = '#ffffff'; g.font = 'bold 104px Arial';
      g.fillText(inr(val) + ' CRORE', w / 2, 215);
      if (Math.floor(f / 15) % 2 === 0) {
        g.fillStyle = '#ff9636'; g.font = 'bold 38px Arial';
        g.fillText('● BOLI CHAL RAHI HAI...', w / 2, 320);
      }
    } else {
      g.fillStyle = '#f5d76a'; g.font = 'bold 112px Arial';
      g.fillText('₹48,390 CRORE', w / 2, 200);
      g.fillStyle = '#f5d76a'; g.fillRect(172, 258, w - 344, 78);
      g.fillStyle = '#2a1608'; g.font = 'bold 52px Arial';
      g.fillText('SIRF 5 SAAL KE LIYE', w / 2, 315);
    }
    AD.t.needsUpdate = true;
  };
  auctRedraw('bid', 0, 0);
  // ---- jhumar ----
  const jh = new THREE.Group(); jh.position.set(0, 5.6, -0.8); S.add(jh);
  const jm = bas({ color: 0xffe9a8 });
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), jm);
    bulb.position.set(Math.cos(a) * 0.55, Math.sin(a) * 0.2, Math.sin(a) * 0.55); jh.add(bulb);
  }
  const jb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), jm); jh.add(jb);
  const gl2 = FX.glint(1.2); jh.add(gl2);
  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6), lam({ color: 0x8a6a42 }));
  chain.position.set(0, 6.5, -0.8); S.add(chain);
  // ---- gavel (desk par, animate hoga) ----
  {
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.52, 10), lam({ color: 0x8a5d3b }));
    handle.rotation.z = Math.PI / 2.4; handle.position.y = 0.1; gavelG.add(handle);
    const headG = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.24, 10), lam({ color: 0x54371f }));
    headG.rotation.x = Math.PI / 2; headG.position.set(0.2, 0.22, 0); gavelG.add(headG);
    gavelG.position.set(0.9, 1.39, -3.45);
    const block = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.05, 14), lam({ color: 0x54371f }));
    block.position.set(1.25, 1.41, -3.45); S.add(block);
  }
  // bidders ke paddles (haath ke paas chhote boards)
  window.__paddles = [];
  const padTex = textBoard(128, 160, (g, w, h) => {
    g.fillStyle = '#f8f4e8'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#8a2f1b'; g.lineWidth = 7; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#8a2f1b'; g.font = 'bold 62px Arial'; g.textAlign = 'center';
    g.fillText('₹', w / 2, 100);
  });
  for (let i = 0; i < 6; i++) {
    const pd = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.21), lam({ map: padTex, side: THREE.DoubleSide }));
    scene.add(pd); pd.visible = false; window.__paddles.push(pd);
  }
}

// =====================================================================
// SET 5 — COMPANY OFFICE (gehra neela andhera: flow screen, desk)
// =====================================================================
const officeG2 = new THREE.Group(); scene.add(officeG2);
let flowRedraw = null;
{
  const S = officeG2;
  const WALL_Z = -3.2;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), lam({ color: 0x1c2733 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 3); S.add(floor);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(24, 8), lam({ map: tex(plaster(25, 220), 4, 1), color: 0x2c3e50 }));
  back.position.set(0, 4, WALL_Z); S.add(back);
  for (const s of [-1, 1]) {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(18, 8), lam({ color: 0x24344a }));
    sw.position.set(s * 6.2, 4, 2.5); sw.rotation.y = -s * Math.PI / 2; S.add(sw);
  }
  // ---- flow screen (portrait board) ----
  const fFrame = box(2.14, 2.44, 0.09, lam({ color: 0x0a0f16 })); fFrame.position.set(0, 2.2, WALL_Z + 0.03); S.add(fFrame);
  const FD = dynCanvas(640, 740);
  const fs = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.2), bas({ map: FD.t }));
  fs.position.set(0, 2.2, WALL_Z + 0.09); S.add(fs);
  flowRedraw = (p) => {
    const g = FD.g, w = 640, h = 740;
    g.fillStyle = '#0a1622'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#2e5da8'; g.lineWidth = 6; g.strokeRect(12, 12, w - 24, h - 24);
    g.textAlign = 'center';
    g.fillStyle = '#9fc4e0'; g.font = 'bold 40px Arial';
    g.fillText('HAQ KA PAISA', w / 2, 66);
    // company box (upar)
    g.fillStyle = '#173f5e'; rr(g, 70, 96, w - 140, 128, 14); g.fill();
    g.fillStyle = '#ffffff'; g.font = 'bold 52px Arial';
    g.fillText('TV / PHONE', w / 2, 152);
    g.fillText('COMPANY', w / 2, 208);
    // arrow + beh-te dots
    g.strokeStyle = '#f5d76a'; g.lineWidth = 11;
    g.beginPath(); g.moveTo(w / 2, 236); g.lineTo(w / 2, 428); g.stroke();
    g.fillStyle = '#f5d76a';
    g.beginPath(); g.moveTo(w / 2 - 24, 424); g.lineTo(w / 2 + 24, 424); g.lineTo(w / 2, 462); g.fill();
    for (let i = 0; i < 3; i++) {
      const dp = ((p * 1.3 - i * 0.33) % 1 + 1) % 1;
      g.fillStyle = '#57d977'; g.beginPath();
      g.arc(w / 2, 250 + dp * 165, 15, 0, 7); g.fill();
      g.fillStyle = '#0a1622'; g.font = 'bold 22px Arial';
      g.fillText('₹', w / 2, 258 + dp * 165);
    }
    // BCCI box (neeche)
    g.fillStyle = '#14532d'; rr(g, 70, 474, w - 140, 118, 14); g.fill();
    g.fillStyle = '#ffffff'; g.font = 'bold 62px Arial';
    g.fillText('BCCI', w / 2, 552);
    // counter
    const val = 48390 * clamp(p * 1.12);
    g.fillStyle = '#f5d76a'; g.font = 'bold 58px Arial';
    g.fillText(inr(val) + ' CRORE', w / 2, 676);
    FD.t.needsUpdate = true;
  };
  flowRedraw(0);
  // ---- desk + paisa stacks ----
  const desk = box(2.3, 0.08, 1.0, lam({ color: 0x2c3844 })); desk.position.set(0.2, 0.76, -1.3); S.add(desk);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = box(0.08, 0.76, 0.08, lam({ color: 0x141c24 }));
    leg.position.set(0.2 + sx * 1.02, 0.38, -1.3 + sz * 0.4); S.add(leg);
  }
  const noteM = lam({ color: 0x3f7a4a });
  for (let i = 0; i < 4; i++) {
    const st = box(0.52, 0.09, 0.26, noteM);
    st.position.set(-0.5 + (i % 2) * 0.62, 0.85 + Math.floor(i / 2) * 0.1, -1.35); st.rotation.y = (i % 2) * 0.2; S.add(st);
  }
  const lampArm = box(0.05, 0.6, 0.05, lam({ color: 0x39434c })); lampArm.position.set(1.25, 1.1, -1.6); lampArm.rotation.z = -0.4; S.add(lampArm);
  const lampHead = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.22, 12), lam({ color: 0xf5d76a }));
  lampHead.position.set(1.05, 1.42, -1.6); lampHead.rotation.z = 0.7; S.add(lampHead);
}

// =====================================================================
// ENVS — professional colour grading (har scene apna rang)
// =====================================================================
const ENVS = {
  stadium: { bg: 0x0e1e3d, fogFar: 95, hemi: 0.55, sun: 0.8, sunC: 0xbfd4ff, sunPos: [10, 16, -6] },
  stadiumSunset: { bg: 0xef8f52, fogFar: 95, hemi: 0.85, sun: 1.6, sunC: 0xffb36b, sunPos: [-14, 7, -10] },
  home: { bg: 0xf2cf9a, fogFar: 34, hemi: 0.95, sun: 1.0, sunC: 0xffd9a0, sunPos: [-6, 8, 5] },
  homeDark: { bg: 0x131c2e, fogFar: 30, hemi: 0.3, sun: 0.35, sunC: 0x8fb4e8, sunPos: [4, 7, 4] },
  old: { bg: 0xd9cdae, fogFar: 34, hemi: 0.8, sun: 0.85, sunC: 0xf5e3b8, sunPos: [-6, 8, 5] },
  auction: { bg: 0xf3cf87, fogFar: 42, hemi: 1.05, sun: 1.25, sunC: 0xffd9a0, sunPos: [-6, 9, 4] },
  officeD: { bg: 0x101b29, fogFar: 32, hemi: 0.42, sun: 0.5, sunC: 0xbfd4ff, sunPos: [5, 8, 4] },
};
const SETVIS = { stadium: stadiumG, home: homeG, old: oldG, auction: auctionG, office: officeG2 };
const applyEnv = (name) => {
  const e = ENVS[name] || ENVS.home;
  scene.background = new THREE.Color(e.bg);
  scene.fog = new THREE.Fog(e.bg, 14, e.fogFar);
  hemi.intensity = e.hemi; sun.intensity = e.sun;
  sun.color.set(e.sunC); sun.position.set(...e.sunPos);
};
// canvas redraw cache (har frame dobara draw nahi)
const K = {};
const once = (name, key, fn) => { if (K[name] === key) return; K[name] = key; fn(); };
let CB_VAL = -1;
const setCounter = (val, label) => {
  const v = Math.round(val);
  if (v === CB_VAL && label === K.cbLabel) return;
  CB_VAL = v; K.cbLabel = label; counterRedraw(v, label);
};
const BID_POS = [[-2.2, -0.6], [-0.75, -0.6], [0.7, -0.6], [2.15, -0.6], [-1.45, 0.75], [0.45, 0.75]];
const bidderPose = (i, f, cp, s = 1.0, expr = 'grin') => {
  const [bx, bz] = BID_POS[i];
  const lift = 0.55 + 0.45 * Math.sin(f * 0.14 + i * 1.3);
  drawChar(bidderCards[i], 82 + i, BIDDER_OUTFITS[i], expr, 'reach', 'hang', f + i * 37, cp, bx, 0, bz, s, 0, lift);
  const pd = window.__paddles[i];
  pd.visible = false;
};

// =====================================================================
// renderFrame
// =====================================================================
window.renderFrame = (f) => {
  const shot = shotAt(f), u = shot.u, set = shot.set;
  const cam = camFor(shot, u);
  camera.position.set(...cam.pos); camera.lookAt(...cam.look);
  camera.fov = cam.fov; camera.updateProjectionMatrix();
  if (cam.roll) camera.rotateZ(cam.roll * Math.PI / 180);
  applyEnv(shot.env || set);
  for (const k in SETVIS) SETVIS[k].visible = (k === set);
  ALL_CARDS.forEach((c) => c.hide());
  ballG.visible = false; counterBoard.visible = false; billMesh.visible = false; gavelG.visible = false;
  counterBoard.scale.setScalar(1);
  window.__paddles.forEach((p) => { p.visible = false; });
  // ---- ZINDA BACKGROUND ----
  if (set === 'stadium') {
    const amp = (shot.id === 's09' || shot.id === 's33') ? 0.13 : 0.07;
    for (const cb of CROWD_BLOCKS) cb.m.position.y = cb.y + Math.max(0, Math.sin(f * 0.22 + cb.ph)) * amp;
    window.__flags.forEach((fl, i) => { fl.rotation.y = Math.sin(f * 0.3 + i * 0.9) * 0.45; });
  }
  if (set === 'home') fanBlades.rotation.y = f * 0.55;
  const cp = cam.pos;
  const faceCam = (obj, x, z) => { obj.rotation.y = Math.atan2(cp[0] - x, cp[2] - z); };

  switch (shot.id) {
    // ---------- L1-3: STADIUM ----------
    case 's01': once('scr', 'hook', () => stadRedraw('hook', 1, f)); break;
    case 's02':
      once('scr', 'hook', () => stadRedraw('hook', 1, f));
      drawChar(bowlerCard, 73, BOWLER, 'grin', 'up', 'hang', f, cp, 1.6, 0, -4.6, 1.0);
      drawChar(batsmanCard, 74, BATSMAN, 'neutral', 'hang', 'hang', f, cp, -0.9, 0, 3.6, 1.0);
      break;
    case 's03':
      once('scr', 'hook', () => stadRedraw('hook', 1, f));
      drawChar(bowlerCard, 73, BOWLER, 'grin', 'wave', 'hang', f, cp, 1.6, 0, -4.6, 1.0);
      drawChar(batsmanCard, 74, BATSMAN, 'smile', 'hang', 'hang', f, cp, -0.9, 0, 3.6, 1.0);
      break;
    case 's05': {
      const run = M.easeInOut(Math.min(1, u * 1.2));
      const bx = 3.1 - 1.5 * run;
      const rel = u > 0.6;
      drawChar(bowlerCard, 73, BOWLER, 'stern', rel ? 'reach' : 'hang', 'hang', f, cp, bx, 0, -4.55, 1.02, rel ? 0 : (f % 14) / 14, rel ? 1 : null);
      drawChar(batsmanCard, 74, BATSMAN, 'nervous', 'hang', 'hang', f, cp, -0.9, 0, 3.6, 1.0);
      if (rel) {
        const bp = spline([[0.95, 1.05, -4.4], [0.85, 1.18, -3.8], [0.75, 1.1, -3.15]], (u - 0.6) / 0.4);
        ballG.visible = true; ballG.position.set(...bp); ballG.rotation.y = f * 0.5;
      }
      break;
    }
    case 's06': {
      const bp = ballPath(u);
      ballG.visible = true; ballG.position.set(...bp); ballG.rotation.set(f * 0.4, f * 0.6, 0);
      counterBoard.visible = true;
      counterBoard.scale.setScalar(0.6);
      counterBoard.position.set(bp[0] - 0.25, bp[1] + 0.6, bp[2]);
      faceCam(counterBoard, bp[0], bp[2]);
      setCounter(4900000 * M.easeOut(Math.floor(u * 16) / 16) * 0.43, 'HAR BALL');
      drawChar(batsmanCard, 74, BATSMAN, 'nervous', 'hang', 'hang', f, cp, -0.9, 0, 3.6, 1.0);
      break;
    }
    case 's07': {
      const bz = -3.6 + 6.5 * M.easeInOut(u), bx = 0.4 + 1.1 * u;
      ballG.visible = true; ballG.position.set(bx, 0.17, bz); ballG.rotation.x = f * 0.8;
      break;
    }
    case 's08': once('scr', 'counter|' + q(0.55 + 0.45 * u, 2), () => stadRedraw('counter', 0.55 + 0.45 * u, f)); break;
    case 's09': once('scr', 'final', () => stadRedraw('final', 1, f)); break;
    // ---------- L4-5: GHAR ----------
    case 's04':
      once('tv', 'match', () => tvRedraw('match', 1, f));
      drawChar(ladkaCard, 71, LADKA, 'grin', 'point', 'hang', f, cp, -0.6, 0, -0.45, 1.03);
      drawChar(dostCard, 72, DOST, 'smile', 'hang', 'belly', f, cp, 0.85, 0, -0.45, 1.03);
      break;
    case 's10':
      once('tv', 'match', () => tvRedraw('match', 1, f));
      drawChar(ladkaCard, 71, LADKA, u < 0.55 ? 'shock' : 'nervous', 'hang', 'hang', f, cp, -0.38, 0, -0.45, 1.04);
      drawChar(dostCard, 72, DOST, 'laugh', 'belly', 'belly', f, cp, 0.42, 0, -0.5, 1.01);
      break;
    case 's11':
      once('his', q(u, 2), () => hisaabRedraw(u));
      break;
    // ---------- L6: 2008 ----------
    case 's12':
      crtRedraw(f);
      once('ob', 'cr', () => oldBoardRedraw('cr'));
      break;
    case 's13': crtRedraw(f); break;
    case 's14': once('ob', 'cr', () => oldBoardRedraw('cr')); break;
    case 's15': once('ob', 'saal', () => oldBoardRedraw('saal')); break;
    // ---------- L7: NILAMI ----------
    case 's16':
      once('auc', 'bid|' + q(u * 0.5, 2) + '|' + (Math.floor(f / 15) % 2), () => auctRedraw('bid', u * 0.5, f));
      drawChar(auctCard, 81, AUCT, 'stern', 'up', 'hang', f, cp, 0.9, 0.36, -3.5, 1.03);
      for (let i = 0; i < 6; i++) bidderPose(i, f, cp, 1.0);
      break;
    case 's17':
      once('auc', 'bid|' + q(0.5 + u * 0.2, 2) + '|' + (Math.floor(f / 15) % 2), () => auctRedraw('bid', 0.5 + u * 0.2, f));
      for (let i = 0; i < 3; i++) bidderPose(i, f, cp, 1.12);
      drawChar(auctCard, 81, AUCT, 'stern', 'up', 'hang', f, cp, 0.9, 0.36, -3.5, 1.0);
      break;
    case 's18':
      once('auc', 'bid|' + q(0.7 + u * 0.25, 2) + '|' + (Math.floor(f / 15) % 2), () => auctRedraw('bid', 0.7 + u * 0.25, f));
      drawChar(auctCard, 81, AUCT, 'stern', 'up', 'hang', f, cp, 0.9, 0.36, -3.5, 1.05);
      gavelG.visible = true;
      gavelG.rotation.z = -0.1 - 0.55 * Math.pow(Math.max(0, Math.sin(u * 6.6)), 3);
      break;
    case 's19':
      once('auc', 'final', () => auctRedraw('final', 1, f));
      drawChar(auctCard, 81, AUCT, 'grin', 'up', 'hang', f, cp, 0.9, 0.36, -3.5, 0.95);
      drawChar(bidderCards[0], 82, BIDDER_OUTFITS[0], 'shock', 'hang', 'hang', f, cp, -1.6, 0, 0.1, 0.95);
      drawChar(bidderCards[3], 85, BIDDER_OUTFITS[3], 'shock', 'hang', 'hang', f + 40, cp, 1.9, 0, 0.1, 0.95);
      break;
    // ---------- L8: SEEDHI ----------
    case 's20': once('scr', 'match', () => stadRedraw('match', 1, f)); break;
    case 's21': once('scr', 'over|' + q(u, 2), () => stadRedraw('over', u, f)); break;
    case 's22':
      ballG.visible = true; ballG.position.set(0, 0.5, 3.4); ballG.rotation.y = f * 0.45; ballG.rotation.x = 0.4;
      counterBoard.visible = true; counterBoard.scale.setScalar(0.62); counterBoard.position.set(0, 1.35, 3.4);
      faceCam(counterBoard, 0, 3.4);
      setCounter(4900000, 'EK BALL');
      break;
    case 's23':
      once('his', q(0.35 + 0.65 * u, 2), () => hisaabRedraw(0.35 + 0.65 * u));
      break;
    case 's24':
      once('tv', 'match', () => tvRedraw('match', 1, f));
      drawChar(dostCard, 72, DOST, 'nervous', 'hang', 'cheek', f, cp, 0.85, 0, -0.45, 1.05);
      drawChar(ladkaCard, 71, LADKA, 'smile_closed', 'belly', 'hang', f, cp, -0.6, 0, -0.45, 1.03);
      break;
    // ---------- L9: SUSPENSE ----------
    case 's25':
      once('tv', 'glow', () => tvRedraw('glow', 1, f));
      drawChar(ladkaCard, 71, LADKA, 'neutral', 'hang', 'hang', f, cp, -0.6, 0, -0.45, 1.03);
      drawChar(dostCard, 72, DOST, 'neutral', 'hang', 'hang', f, cp, 0.85, 0, -0.45, 1.03);
      break;
    case 's26':
      drawChar(ladkaCard, 71, LADKA, 'stern', 'hang', 'hang', f, cp, -0.6, 0, -0.45, 1.08);
      break;
    case 's27': once('tv', 'q|' + q(u, 2), () => tvRedraw('q', u, f)); break;
    // ---------- L10: REVEAL ----------
    case 's28':
      once('flow', q(u, 2), () => flowRedraw(u));
      drawChar(officerCard, 91, OFFICER, 'stern', 'point', 'hang', f, cp, 1.15, 0, -2.3, 1.03);
      break;
    case 's29':
      once('flow', '1', () => flowRedraw(1));
      drawChar(officerCard, 91, OFFICER, 'neutral', 'hang', 'hang', f, cp, 1.15, 0, -2.3, 0.95);
      break;
    // ---------- L11: VASOOL TUMSE ----------
    case 's30':
      billMesh.visible = true;
      billMesh.position.set(0.15, 1.02, 0.32);
      billMesh.rotation.set(-0.22, Math.atan2(cp[0] - 0.15, cp[2] - 0.32), 0);
      break;
    case 's31':
      tvRedraw('ad', 1, f);
      drawChar(dostCard, 72, DOST, 'laugh', 'belly', 'belly', f, cp, 0.85, 0, -0.45, 1.03);
      break;
    case 's32':
      billMesh.visible = true;
      billMesh.position.set(0.02, 1.1, -0.05);
      billMesh.rotation.set(-0.15, Math.atan2(cp[0] - 0.02, cp[2] + 0.05), 0);
      drawChar(ladkaCard, 71, LADKA, 'grin', 'reach', 'hang', f, cp, -0.6, 0, -0.45, 1.03, 0, 0.5);
      drawChar(dostCard, 72, DOST, 'shock', 'hang', 'hang', f, cp, 0.85, 0, -0.45, 1.03);
      break;
    // ---------- L12: PUNCHLINE ----------
    case 's33': {
      const bp = ballPath(u, -1);
      ballG.visible = true; ballG.position.set(...bp); ballG.rotation.set(f * 0.4, f * 0.6, 0);
      counterBoard.visible = true;
      counterBoard.scale.setScalar(0.75);
      counterBoard.position.set(bp[0] + 0.55, bp[1] + 0.6, bp[2]);
      faceCam(counterBoard, bp[0], bp[2]);
      setCounter(4900000, 'PHIR EK BALL');
      drawChar(bowlerCard, 73, BOWLER, 'grin', 'hang', 'hang', f, cp, 1.6, 0, -4.6, 1.0);
      drawChar(batsmanCard, 74, BATSMAN, 'shock', 'hang', 'hang', f, cp, -0.9, 0, 3.6, 1.0);
      break;
    }
    case 's34':
      drawChar(ladkaCard, 71, LADKA, 'smile_closed', 'belly', 'belly', f, cp, -0.6, 0, -0.45, 1.05);
      drawChar(dostCard, 72, DOST, 'dazed', 'hang', 'hang', f, cp, 0.85, 0, -0.45, 1.03);
      break;
    // ---------- L13: SAWAL + TEASE ----------
    case 's35': once('scr', 'sawal', () => stadRedraw('sawal', 1, f)); break;
    case 's36':
      drawChar(ladkaCard, 71, LADKA, 'smile', 'point', 'hang', f, cp, -0.6, 0, -0.45, 1.05);
      drawChar(dostCard, 72, DOST, 'neutral', 'hang', 'hang', f, cp, 0.85, 0, -0.45, 1.03);
      break;
    case 's37': once('scr', 'tease', () => stadRedraw('tease', 1, f)); break;
  }
  renderer.render(scene, camera);
};
window.TOTAL = TOTAL;
window.ready = Promise.resolve();
