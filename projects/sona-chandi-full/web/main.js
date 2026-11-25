// "Sona-Chandi Crash" — 17.5s DENSE SAMPLE. Mirror kit + Gullak density.
// Ek hi set: bazaar me sunar ki dukaan. Har shot: camera move + character acting
// + zinda background (steam, pankha, tarazu, cycle, chalte log, ped, badaal).
// NO captions. Text sirf in-scene board par. Contract: window.ready, window.renderFrame(f).
import * as THREE from 'three';
import * as FX from './fx.js';
import * as T from './toon.js';
import { idle, blinkAt, q, M, clamp } from './motion.js';
import { tex, planks, plaster, stone, dirt } from './paint.js';
import { TOTAL, shotAt, camFor } from './story.js';
import { ENV } from './envelope.js';

const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.13;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 300);
const lam = (o) => new THREE.MeshLambertMaterial(o);
const bas = (o) => new THREE.MeshBasicMaterial(o);

// ---------- global lights ----------
const hemi = new THREE.HemisphereLight(0xcfe4ff, 0x8a7a5a, 1.0); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe9b0, 1.4);
sun.position.set(-7, 10, 5); scene.add(sun); scene.add(sun.target);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -20; sun.shadow.camera.right = 20;
sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -20;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 95;
sun.shadow.bias = -0.0022; sun.shadow.normalBias = 0.02;
const bounce = new THREE.DirectionalLight(0xd6e6ff, 0.3);
bounce.position.set(6, 8, 14); bounce.castShadow = false;
scene.add(bounce); scene.add(bounce.target);

// ---------- helpers ----------
function textBoard(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
const boardMesh = (w, h, texB, basic = false) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic ? bas({ map: texB }) : lam({ map: texB }));
const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
const cyl = (rt, rb, h, mat, seg = 12) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
// chamak wala star sprite (board/showcase ki kirnein)
function starTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); g.translate(64, 64);
  const gr = g.createRadialGradient(0, 0, 2, 0, 0, 60);
  gr.addColorStop(0, 'rgba(255,250,220,1)'); gr.addColorStop(0.25, 'rgba(255,230,150,0.55)'); gr.addColorStop(1, 'rgba(255,230,150,0)');
  g.fillStyle = gr; g.beginPath();
  g.moveTo(0, -62); g.quadraticCurveTo(5, -5, 62, 0); g.quadraticCurveTo(5, 5, 0, 62); g.quadraticCurveTo(-5, 5, -62, 0); g.quadraticCurveTo(-5, -5, 0, -62);
  g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const starTex = starTexture();
function mkGlint(x, y, z, s = 0.5) {
  const m = new THREE.SpriteMaterial({ map: starTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const sp = new THREE.Sprite(m); sp.position.set(x, y, z); sp.scale.setScalar(s); scene.add(sp); return sp;
}

// =====================================================================
// CHARACTER CARDS (kit painter — golgappa proven pattern)
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
function drawChar(card, seed, outfit, expr, R, L, f, camPos, x, y, z, s = 1.03, step = 0, lift = null, tilt = 0, speak = 0) {
  const idl = idle(f, seed), blink = blinkAt(f, seed);
  const liftQ = lift === null ? '' : q(lift, 1);
  const mk = speak > 0.55 ? 'O' : speak > 0.18 ? 'o' : null; // lip-sync: ENV se muh khulta/band
  const key = `${seed}|${expr}|${R}|${L}|${blink}|${q(idl.bob, 2)}|${Math.round(idl.tilt + tilt * 3)}|${q(step, 2)}|${liftQ}|${mk || ''}`;
  card.draw(key, (p) => T.romanFront(p, outfit, {
    seed, expr, R, L, blink, bob: q(idl.bob, 2), tilt: Math.round(idl.tilt + tilt * 3),
    headTilt: Math.round(idle(f, seed + 2).headTilt + tilt * 6), wv: f * 0.18, step, lift: lift === null ? 0 : lift, mouth: mk,
  }));
  card.place(x, y, z, camPos, s);
}
function drawWalk(card, seed, outfit, expr, f, camPos, x0, z0, x1, z1, u, s = 1.0, R = 'hang', L = 'hang') {
  const e = M.easeInOut(u);
  const x = x0 + (x1 - x0) * e, z = z0 + (z1 - z0) * e;
  drawChar(card, seed, outfit, expr, R, L, f, camPos, x, 0, z, s, (f % 14) / 14, null, 1);
}
const rameshCard = new Card(), sunarCard = new Card(), dostCard = new Card();
const g1Card = new Card(), g2Card = new Card(), w1Card = new Card(), w2Card = new Card();
const kidCard = new Card(), chaiCard = new Card();
const ALL_CARDS = [rameshCard, sunarCard, dostCard, g1Card, g2Card, w1Card, w2Card, kidCard, chaiCard];
// is kahani ke fresh designs
const RAMESH = { tunic: '#2456c8', shirt: '#fdf6e3', skin: '#c98a54', hair: '#1e1a20', hairStyle: 'side', hairLine: 0.22, print: { type: 'stripe', col: '#173a85', a: 0.3, step: 11, lw: 2 } }; // hero: neela kurta
const SUNAR = { tunic: '#5d3c14', shirt: '#f7f0dd', skin: '#d99e63', cap: '#f2ead8', trim: '#c8952e', stout: true, moustache: '#3a2415', glasses: true, print: { type: 'polka', col: '#3a2410', a: 0.4, step: 12, r: 1.8 } }; // dukaan malik: bhoora, topi, chashma
const DOST = { tunic: '#2e7a35', shirt: '#f2ead8', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick' }; // hara kurta
const GRA1 = { tunic: '#e8862e', shirt: '#fdf6e3', skin: '#e8b98d', hair: '#1e1a20' };
const GRA2 = { tunic: '#7a8a99', shirt: '#e8e4da', skin: '#e0a068', hair: '#241a14' };
const WALK1 = { tunic: '#b8b0a0', shirt: '#efe9da', skin: '#c98a54', hair: '#1e1a20' };
const WALK2 = { tunic: '#c94f72', dress: '#d6336c', shirt: '#f7f0dd', skin: '#f0c09a', hair: '#1e1714' };
const KID = { tunic: '#c23b2e', shirt: '#fdf6e3', skin: '#e8b98d', hair: '#1e1a20' };
const CHAIWALA = { tunic: '#e8e4da', shirt: '#31517a', skin: '#a06a3c', hair: '#241a14' };

// =====================================================================
// ENVS — har samay ka apna natural rang, koi single wash NAHI
// =====================================================================
const ENVS = {
  morning: { bg: 0xbfe0f2, fogC: 0xcfe4f2, fogNear: 16, fogFar: 70, hemi: 1.06, hemiC: 0xeaf4ff, hemiG: 0x8a9a6a, sun: 1.35, sunC: 0xfff1cf, sunPos: [-6, 9, 6], bounce: 0.3, bounceC: 0xd6e6ff, expo: 1.1, sky: 'morning' },
  day: { bg: 0x8ec9ee, fogC: 0xa9cfe6, fogNear: 14, fogFar: 72, hemi: 1.0, hemiC: 0xcfe4ff, hemiG: 0x8a7a5a, sun: 1.42, sunC: 0xffeec2, sunPos: [-7, 10, 5], bounce: 0.3, bounceC: 0xd6e6ff, expo: 1.13, sky: 'day' },
  noon: { bg: 0x9fd2f2, fogC: 0xbcd9ee, fogNear: 16, fogFar: 75, hemi: 1.18, hemiC: 0xf6fbff, hemiG: 0x9a9a8a, sun: 1.66, sunC: 0xfffdf4, sunPos: [-2.5, 12, 4.5], bounce: 0.34, bounceC: 0xe2efff, expo: 1.09, sky: 'day' },
  evening: { bg: 0xe08a4e, fogC: 0xe0a266, fogNear: 14, fogFar: 68, hemi: 0.85, hemiC: 0xffd9b0, hemiG: 0x6a5a4a, sun: 1.1, sunC: 0xff9a3c, sunPos: [-9, 4, 6], bounce: 0.22, bounceC: 0xffc890, expo: 1.08, sky: 'evening' },
  night: { bg: 0x1c2b45, fogC: 0x24344f, fogNear: 12, fogFar: 60, hemi: 0.5, hemiC: 0x8fa8d0, hemiG: 0x2a2a33, sun: 0.55, sunC: 0xffd9a0, sunPos: [3, 6, 2], bounce: 0.15, bounceC: 0x5a6a8a, expo: 1.0, sky: 'night' },
};
const applyEnv = (name) => {
  const e = ENVS[name] || ENVS.day;
  scene.background = new THREE.Color(e.bg);
  scene.fog = new THREE.Fog(e.fogC, e.fogNear, e.fogFar);
  hemi.intensity = e.hemi; hemi.color.set(e.hemiC); hemi.groundColor.set(e.hemiG);
  sun.intensity = e.sun; sun.color.set(e.sunC); sun.position.set(...e.sunPos);
  sun.target.position.set(0, 0, 0); sun.target.updateMatrixWorld();
  bounce.intensity = e.bounce; bounce.color.set(e.bounceC);
  renderer.toneMappingExposure = e.expo;
  return e;
};

// ---------- aasmaan + badaal ----------
function skyTex(stops) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 512;
  const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 512);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr; g.fillRect(0, 0, 64, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const skyGeo = new THREE.PlaneGeometry(110, 30);
const skyMeshes = {
  morning: new THREE.Mesh(skyGeo, bas({ map: skyTex([[0, '#5f9fd8'], [0.55, '#a8d2f0'], [1, '#fdf3d0']]), fog: false })),
  day: new THREE.Mesh(skyGeo, bas({ map: skyTex([[0, '#2f7fe0'], [0.55, '#8ec9ee'], [1, '#ffe9c4']]), fog: false })),
  evening: new THREE.Mesh(skyGeo, bas({ map: skyTex([[0, '#4a3a6e'], [0.55, '#e07840'], [1, '#ffd9a0']]), fog: false })),
  night: new THREE.Mesh(skyGeo, bas({ map: skyTex([[0, '#0a1230'], [0.55, '#1c2b45'], [1, '#3a4a6a']]), fog: false })),
};
for (const k in skyMeshes) { skyMeshes[k].position.set(0, 11, -30); skyMeshes[k].visible = false; scene.add(skyMeshes[k]); }
const cloudMat = new THREE.SpriteMaterial({ map: FX.puffTexture([[0, 'rgba(255,255,255,0.9)'], [1, 'rgba(255,255,255,0)']]), transparent: true, opacity: 0.55, depthWrite: false });
const clouds = [];
for (let i = 0; i < 7; i++) {
  const sp = new THREE.Sprite(cloudMat);
  sp.position.set(-22 + i * 7.5, 8.5 + (i % 3) * 1.6, -24);
  sp.scale.set(7 + (i % 3) * 2.5, 2.2 + (i % 2), 1);
  scene.add(sp); clouds.push(sp);
}
function mkTree(x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s);
  const trunk = cyl(0.09, 0.13, 1.6, lam({ color: 0x6d4a2c })); trunk.position.y = 0.8; g.add(trunk);
  const cols = [0x3e7d32, 0x4c9141, 0x35702c];
  [[0, 2.2, 0, 0.85], [-0.55, 1.85, 0.1, 0.6], [0.55, 1.9, -0.1, 0.65], [0.1, 2.6, 0, 0.55]].forEach(([px, py, pz, r], i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), lam({ color: cols[i % 3] }));
    m.position.set(px, py, pz); g.add(m);
  });
  return g;
}

// =====================================================================
// SET — BAZAAR: sunar ki dukaan (centre) + chai stall (right) + kirana (left)
// =====================================================================
const bazaarG = new THREE.Group(); scene.add(bazaarG);
let fanBlades = null, tarazuBeam = null, tarazuPanL = null, tarazuPanR = null;
let almariDoorL = null, almariDoorR = null;
let steamSprites = [], bazaarTrees = [], cycleG = null, cycleWheels = [];
const priceCanvas = document.createElement('canvas'); priceCanvas.width = 1024; priceCanvas.height = 568;
const priceTex = new THREE.CanvasTexture(priceCanvas); priceTex.colorSpace = THREE.SRGBColorSpace; priceTex.anisotropy = 4;
let priceKey = '';
function setPrice(txt, mode) {
  const key = txt + '|' + mode;
  if (key === priceKey) return; priceKey = key;
  const g = priceCanvas.getContext('2d'), w = 1024, h = 568;
  g.fillStyle = '#1d2733'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#ffd76a'; g.lineWidth = 14; g.strokeRect(18, 18, w - 36, h - 36);
  g.strokeStyle = 'rgba(255,215,106,0.45)'; g.lineWidth = 4; g.strokeRect(44, 44, w - 88, h - 88);
  g.textAlign = 'center';
  g.fillStyle = '#f5f2e8'; g.font = 'bold 84px Arial';
  g.fillText('— CHAANDI —', w / 2, 128);
  g.fillStyle = mode === 'red' ? '#ff6a5e' : '#ffd76a'; g.font = 'bold 196px Arial';
  g.fillText(txt, w / 2, 348);
  g.fillStyle = '#cfd8e0'; g.font = 'bold 66px Arial';
  g.fillText('PER KILO • AAJ KA BHAAV', w / 2, 478);
  priceTex.needsUpdate = true;
}
setPrice('₹4,20,000', 'gold');
{
  const S = bazaarG;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 34), lam({ map: tex(dirt(17), 8, 8), color: 0xe2d2ac }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, 3); S.add(ground);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(40, 3.2), lam({ color: 0x4d545d }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, 1.8); S.add(road);
  for (let i = 0; i < 11; i++) {
    const dash = box(1.1, 0.012, 0.14, bas({ color: 0xf2f2f2 }));
    dash.position.set(-15 + i * 3, 0.008, 1.8); S.add(dash);
  }
  const foot = new THREE.Mesh(new THREE.PlaneGeometry(40, 2.1), lam({ map: tex(planks(8), 9, 1), color: 0xcbb28a }));
  foot.rotation.x = -Math.PI / 2; foot.position.set(0, 0.01, -0.85); S.add(foot);
  // ---- SUNAR DUKAAN (centre x=0) ----
  const dwall = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 3.9), lam({ map: tex(plaster(41, 38), 3, 1), color: 0xf3e6c2 }));
  dwall.position.set(0, 1.95, -4.3); S.add(dwall);
  for (const px of [-2.05, 2.05]) {
    const pil = box(0.28, 3.3, 0.28, lam({ color: 0x8a5a2b })); pil.position.set(px, 1.65, -3.3); S.add(pil);
  }
  const roof = box(5.2, 0.14, 2.1, lam({ color: 0x707a84 })); roof.position.set(0, 3.36, -3.35); S.add(roof);
  const roofEdge = box(5.2, 0.1, 0.08, lam({ color: 0xc8952e })); roofEdge.position.set(0, 3.3, -2.32); S.add(roofEdge);
  // RATE BOARD (dynamic canvas) — do rodon se latka (roof edge ke NEECHE, taaki header na chhupe)
  for (const sx of [-1, 1]) {
    const rod = cyl(0.02, 0.02, 0.3, lam({ color: 0x39434c })); rod.position.set(sx * 0.7, 3.42, -2.3); S.add(rod);
  }
  const boardBack = box(1.98, 1.13, 0.06, lam({ color: 0x141a21 })); boardBack.position.set(0, 2.72, -2.34); S.add(boardBack);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.05), bas({ map: priceTex }));
  board.position.set(0, 2.72, -2.3); S.add(board);
  // counter + upar ki shelf par dibbe
  const counter = box(2.3, 1.0, 0.72, lam({ map: FX.woodTexture(), color: 0x7a4a22 })); counter.position.set(0, 0.5, -3.0); S.add(counter);
  const cTop = box(2.45, 0.06, 0.85, lam({ color: 0xd9b078 })); cTop.position.set(0, 1.03, -3.0); S.add(cTop);
  const silverMat = lam({ color: 0xd8dee2 });
  const silverDark = lam({ color: 0xaab4bb });
  // galla (counter par, left)
  const galla = box(0.4, 0.18, 0.3, lam({ color: 0x2c343c })); galla.position.set(-0.72, 1.15, -3.05); S.add(galla);
  // ---- TARAZU (counter par, right) — beam hilta hai ----
  const tarazu = new THREE.Group(); tarazu.position.set(0.62, 1.06, -3.0); S.add(tarazu);
  const brass = lam({ color: 0xc8952e });
  const tBase = box(0.18, 0.035, 0.18, brass); tBase.position.y = 0.02; tarazu.add(tBase);
  const tPole = cyl(0.016, 0.02, 0.44, brass); tPole.position.y = 0.24; tarazu.add(tPole);
  tarazuBeam = new THREE.Group(); tarazuBeam.position.y = 0.46; tarazu.add(tarazuBeam);
  const beamBar = box(0.66, 0.022, 0.022, brass); tarazuBeam.add(beamBar);
  const mkPan = (sx) => {
    const pg = new THREE.Group(); pg.position.set(sx * 0.3, 0, 0); tarazuBeam.add(pg);
    for (const a of [-0.05, 0.05]) {
      const str = cyl(0.003, 0.003, 0.17, brass); str.position.set(a, -0.085, 0); pg.add(str);
    }
    const pan = cyl(0.095, 0.06, 0.025, brass, 14); pan.position.y = -0.18; pg.add(pan);
    return pg;
  };
  tarazuPanL = mkPan(-1); tarazuPanR = mkPan(1);
  for (let i = 0; i < 3; i++) { // baayein pan me chandi ke tukde
    const ch = box(0.055, 0.03, 0.045, silverMat);
    ch.position.set(-0.03 + i * 0.035, -0.155, (i % 2) * 0.03 - 0.015); ch.rotation.y = i * 0.7; tarazuPanL.add(ch);
  }
  const w8 = box(0.05, 0.05, 0.05, lam({ color: 0x39434c })); w8.position.set(0, -0.15, 0); tarazuPanR.add(w8); // daayein pan me baat (weight)
  // ---- SHOWCASE (left): sheeshe ke andar chandi ke dibbe + bartan ----
  const scase = new THREE.Group(); scase.position.set(-1.75, 0, -3.15); S.add(scase);
  const scFrame = lam({ color: 0x5d3c14 });
  const scBack = box(1.34, 1.5, 0.05, scFrame); scBack.position.set(0, 0.95, -0.26); scase.add(scBack);
  for (const sx of [-1, 1]) { const side = box(0.06, 1.5, 0.55, scFrame); side.position.set(sx * 0.67, 0.95, 0); scase.add(side); }
  const scTop = box(1.4, 0.07, 0.58, scFrame); scTop.position.set(0, 1.73, 0); scase.add(scTop);
  const scBot = box(1.4, 0.2, 0.58, scFrame); scBot.position.set(0, 0.1, 0); scase.add(scBot);
  for (const sy of [0.62, 1.18]) {
    const shelf = box(1.28, 0.035, 0.5, lam({ color: 0xd9b078 })); shelf.position.set(0, sy, 0); scase.add(shelf);
  }
  const dibbaGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.075, 14);
  [[-0.42, 0.7], [-0.14, 0.7], [0.14, 0.7], [0.42, 0.7], [-0.28, 1.26], [0.28, 1.26]].forEach(([dx, dy]) => {
    const d = new THREE.Mesh(dibbaGeo, silverMat); d.position.set(dx, dy, 0.02); scase.add(d);
    const lid = cyl(0.09, 0.09, 0.02, silverDark, 14); lid.position.set(dx, dy + 0.048, 0.02); scase.add(lid);
  });
  const potPts = [[0.001, 0], [0.07, 0], [0.1, 0.04], [0.11, 0.1], [0.08, 0.15]].map(([x, y]) => new THREE.Vector2(x, y));
  [[0, 1.24], [-0.45, 0.16], [0.45, 0.16]].forEach(([dx, dy]) => {
    const pot = new THREE.Mesh(new THREE.LatheGeometry(potPts, 14), silverMat);
    pot.position.set(dx, dy, 0.02); scase.add(pot);
  });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.44), new THREE.MeshBasicMaterial({ color: 0xbfe4f2, transparent: true, opacity: 0.16, depthWrite: false }));
  glass.position.set(0, 0.95, 0.29); scase.add(glass);
  const scSign = boardMesh(1.3, 0.3, textBoard(640, 148, (g, w, h) => {
    g.fillStyle = '#5d3c14'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffd76a'; g.font = 'bold 62px Arial'; g.textAlign = 'center';
    g.fillText('SHUDDH CHAANDI', w / 2, 98);
  }), true); scSign.position.set(0, 1.98, 0.1); scase.add(scSign);
  // ---- PANKHA (dukaan ki chhat ke neeche, ghumta) ----
  const fanG = new THREE.Group(); fanG.position.set(-0.9, 3.28, -3.2); S.add(fanG);
  const fanRod = cyl(0.02, 0.02, 0.26, lam({ color: 0x39434c })); fanRod.position.y = -0.13; fanG.add(fanRod);
  fanBlades = new THREE.Group(); fanBlades.position.y = -0.28; fanG.add(fanBlades);
  for (let i = 0; i < 3; i++) {
    const bl = box(0.85, 0.015, 0.17, lam({ color: 0x8a5d3b }));
    const a = i / 3 * Math.PI * 2;
    bl.position.set(Math.cos(a) * 0.48, 0, Math.sin(a) * 0.48); bl.rotation.y = -a; fanBlades.add(bl);
  }
  // ---- CHAI STALL (right, x=3.6) + bhaap ----
  const chaiWall = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.2), lam({ map: tex(plaster(23, 40), 2, 1), color: 0xd9e6ee }));
  chaiWall.position.set(3.6, 1.6, -4.3); S.add(chaiWall);
  const chaiBoard = boardMesh(2.0, 0.5, textBoard(768, 192, (g, w, h) => {
    g.fillStyle = '#e8862e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3a1c08'; g.font = 'bold 92px Arial'; g.textAlign = 'center';
    g.fillText('CHAI POINT', w / 2, 124);
  }), true); chaiBoard.position.set(3.6, 2.62, -4.2); S.add(chaiBoard);
  const chaiTable = box(1.5, 0.08, 0.7, lam({ map: FX.woodTexture(), color: 0x8a5d33 })); chaiTable.position.set(3.6, 0.88, -3.3); S.add(chaiTable);
  for (const sx of [-1, 1]) { const leg = box(0.07, 0.88, 0.07, lam({ color: 0x54371f })); leg.position.set(3.6 + sx * 0.65, 0.44, -3.3); S.add(leg); }
  const ketli = new THREE.Group(); ketli.position.set(3.42, 0.92, -3.3); S.add(ketli);
  const ketBody = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), lam({ color: 0x8f979e })); ketBody.scale.y = 0.9; ketBody.position.y = 0.1; ketli.add(ketBody);
  const ketSpout = cyl(0.018, 0.03, 0.14, lam({ color: 0x8f979e })); ketSpout.rotation.z = 0.8; ketSpout.position.set(0.12, 0.16, 0); ketli.add(ketSpout);
  const stove = box(0.3, 0.1, 0.3, lam({ color: 0x39434c })); stove.position.set(3.42, 0.95, -3.3); S.add(stove);
  for (let i = 0; i < 6; i++) {
    const m = new THREE.SpriteMaterial({ map: FX.puffTexture([[0, 'rgba(255,255,255,0.85)'], [1, 'rgba(255,255,255,0)']]), transparent: true, opacity: 0, depthWrite: false });
    const sp = new THREE.Sprite(m); sp.position.set(3.42, 1.2, -3.25); scene.add(sp); steamSprites.push(sp);
  }
  // ---- KIRANA shutter (left, x=-3.9) ----
  const shutter = box(2.6, 2.4, 0.15, lam({ map: tex(stone(9), 3, 2), color: 0x8d99a4 })); shutter.position.set(-3.9, 1.2, -4.2); S.add(shutter);
  const kiranaSign = boardMesh(2.3, 0.48, textBoard(768, 160, (g, w, h) => {
    g.fillStyle = '#31517a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.font = 'bold 78px Arial'; g.textAlign = 'center';
    g.fillText('KIRANA STORE', w / 2, 104);
  }), true); kiranaSign.position.set(-3.9, 2.72, -4.1); S.add(kiranaSign);
  // peeche ki buildings (depth)
  const bgCols = [0xbcd3e6, 0xf0dfba, 0xe6c8c8, 0xcfe0c8];
  [[-9, -9.5, 5, 7], [-3.5, -10, 4, 5.5], [4, -10.5, 5, 8], [9.5, -9, 4, 6]].forEach(([bx, bz, bw, bh], i) => {
    const b = box(bw, bh, 0.5, lam({ color: bgCols[i] })); b.position.set(bx, bh / 2, bz); S.add(b);
    for (let r = 0; r < Math.floor(bh / 1.3); r++) for (let cix = 0; cix < Math.floor(bw / 1.1); cix++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.7), bas({ color: 0x39506b }));
      win.position.set(bx - bw / 2 + 0.8 + cix * 1.1, 1 + r * 1.3, bz + 0.27); S.add(win);
    }
  });
  const t1 = mkTree(-5.4, -3.2, 1.15); S.add(t1); bazaarTrees.push(t1);
  const t2 = mkTree(5.8, -3.0, 0.95); S.add(t2); bazaarTrees.push(t2);
  const pole = cyl(0.045, 0.055, 3.2, lam({ color: 0x39434c })); pole.position.set(2.9, 1.6, -1.1); S.add(pole);
  const armLamp = cyl(0.035, 0.035, 0.8, lam({ color: 0x39434c })); armLamp.rotation.z = Math.PI / 2.3; armLamp.position.set(2.58, 3.15, -1.1); S.add(armLamp);
}

// =====================================================================
// PROPS — gaddi (note), dibba (lid ke saath), note kagaz, thaali, cycle
// =====================================================================
const gaddiG = new THREE.Group(); scene.add(gaddiG);
{
  const noteMat = lam({ color: 0x7fae6e });
  for (let i = 0; i < 5; i++) { const n = box(0.17, 0.012, 0.095, noteMat); n.position.y = i * 0.013; n.rotation.y = (i - 2) * 0.05; gaddiG.add(n); }
  const band = box(0.05, 0.075, 0.1, lam({ color: 0xf2ead8 })); band.position.y = 0.026; gaddiG.add(band);
  gaddiG.visible = false;
}
const dibbaG = new THREE.Group(); scene.add(dibbaG);
const dibbaLidPivot = new THREE.Group();
{
  const silverMat = lam({ color: 0xc3ccd2 });
  const base = box(0.34, 0.2, 0.26, silverMat); base.position.y = 0.1; dibbaG.add(base);
  const rim = box(0.37, 0.03, 0.29, lam({ color: 0x9aa4ac })); rim.position.y = 0.2; dibbaG.add(rim);
  dibbaLidPivot.position.set(0, 0.215, -0.145); dibbaG.add(dibbaLidPivot);
  const lid = box(0.37, 0.035, 0.29, lam({ color: 0xd8dee2 })); lid.position.set(0, 0.017, 0.145); dibbaLidPivot.add(lid);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), lam({ color: 0xc8952e })); knob.position.set(0, 0.05, 0.145); dibbaLidPivot.add(knob);
  dibbaG.visible = false;
}
const noteProp = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.008, 0.09), lam({ color: 0x7fae6e }));
noteProp.visible = false; scene.add(noteProp);
const thaaliG = new THREE.Group(); scene.add(thaaliG);
{
  const plate = cyl(0.27, 0.2, 0.03, lam({ color: 0xd8dee2 }), 18); thaaliG.add(plate);
  const potPts = [[0.001, 0], [0.06, 0], [0.085, 0.035], [0.09, 0.085], [0.065, 0.12]].map(([x, y]) => new THREE.Vector2(x, y));
  [[-0.12, 0.015], [0.1, 0.015], [0, 0.015]].forEach(([dx, dy], i) => {
    const pot = new THREE.Mesh(new THREE.LatheGeometry(potPts, 12), lam({ color: 0xc3ccd2 }));
    pot.position.set(dx, dy, (i - 1) * 0.07); thaaliG.add(pot);
  });
  thaaliG.visible = false;
}
// cycle (background me guzarti) — do pahiye + frame; rider kid card alag se
{
  cycleG = new THREE.Group(); scene.add(cycleG);
  const frameMat = lam({ color: 0xc23b2e });
  for (const sx of [-1, 1]) {
    const wg = new THREE.Group(); wg.position.set(sx * 0.42, 0.34, 0); cycleG.add(wg);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.025, 8, 20), lam({ color: 0x2c343c }));
    wg.add(rim);
    for (let i = 0; i < 3; i++) { const sp = box(0.02, 0.6, 0.02, lam({ color: 0x9aa2a9 })); sp.rotation.z = i * Math.PI / 3; wg.add(sp); }
    cycleWheels.push(wg);
  }
  const bar1 = cyl(0.02, 0.02, 0.62, frameMat); bar1.rotation.z = 1.1; bar1.position.set(-0.12, 0.55, 0); cycleG.add(bar1);
  const bar2 = cyl(0.02, 0.02, 0.6, frameMat); bar2.rotation.z = -1.15; bar2.position.set(0.14, 0.56, 0); cycleG.add(bar2);
  const seat = box(0.2, 0.04, 0.12, lam({ color: 0x54371f })); seat.position.set(-0.18, 0.82, 0); cycleG.add(seat);
  const handle = cyl(0.018, 0.018, 0.4, lam({ color: 0x39434c })); handle.rotation.x = Math.PI / 2; handle.position.set(0.4, 0.86, 0); cycleG.add(handle);
  cycleG.visible = false;
}
// ---- ALMARI (ghar kona, -3.3,-3.95): dibba andar/bahar; darwaze khulte-band hote ----
const almariG = new THREE.Group(); almariG.position.set(-3.3, 0, -3.95); scene.add(almariG);
{
  const awood = lam({ color: 0x6b4423 });
  const aDark = lam({ color: 0x241608 });
  const aBody = box(1.2, 2.1, 0.5, awood); aBody.position.y = 1.05; almariG.add(aBody);
  const aInner = box(1.04, 1.94, 0.06, aDark); aInner.position.set(0, 1.05, 0.22); almariG.add(aInner);
  const aShelf = box(1.04, 0.04, 0.42, awood); aShelf.position.set(0, 1.02, 0.02); almariG.add(aShelf);
  almariDoorL = new THREE.Group(); almariDoorL.position.set(-0.58, 1.05, 0.26); almariG.add(almariDoorL);
  const aDL = box(0.56, 2.0, 0.04, awood); aDL.position.x = 0.28; almariDoorL.add(aDL);
  const aKnobL = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), lam({ color: 0xc8952e })); aKnobL.position.set(0.5, 0, 0.05); almariDoorL.add(aKnobL);
  almariDoorR = new THREE.Group(); almariDoorR.position.set(0.58, 1.05, 0.26); almariG.add(almariDoorR);
  const aDR = box(0.56, 2.0, 0.04, awood); aDR.position.x = -0.28; almariDoorR.add(aDR);
  const aKnobR = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), lam({ color: 0xc8952e })); aKnobR.position.set(-0.5, 0, 0.05); almariDoorR.add(aKnobR);
  almariG.visible = false;
}
// ---- CALCULATOR (counter par, sunar ke saamne) ----
const calcG = new THREE.Group(); scene.add(calcG);
{
  const cBody = box(0.24, 0.03, 0.34, lam({ color: 0x2c343c })); calcG.add(cBody);
  const cDisp = box(0.2, 0.012, 0.07, bas({ color: 0x9fd4a8 })); cDisp.position.set(0, 0.02, -0.11); calcG.add(cDisp);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const k = box(0.05, 0.012, 0.05, lam({ color: 0xd8dee2 })); k.position.set(-0.07 + c * 0.07, 0.02, 0.02 + r * 0.07); calcG.add(k);
  }
  calcG.visible = false;
}
// glints: board ke kone + showcase (chamak)
const glintBoard1 = mkGlint(-0.82, 3.12, -2.12, 0.55), glintBoard2 = mkGlint(0.85, 2.38, -2.12, 0.45);
const glintShow = mkGlint(-1.75, 1.35, -2.8, 0.5);
const boardGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: FX.puffTexture([[0, 'rgba(255,215,120,0.8)'], [1, 'rgba(255,215,120,0)']]), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
boardGlow.position.set(0, 2.72, -2.05); boardGlow.scale.set(3.4, 2.0, 1); scene.add(boardGlow);
// dhakka ka dust puff
const dustSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: FX.puffTexture([[0, 'rgba(232,220,196,0.9)'], [1, 'rgba(232,220,196,0)']]), transparent: true, opacity: 0, depthWrite: false }));
dustSprite.position.set(-1.6, 0.3, -1.2); dustSprite.scale.setScalar(0.8); scene.add(dustSprite);

// ---------- character shadow proxies ----------
const proxyMatW = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
const proxiesW = ALL_CARDS.map(() => {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.22, 1.5, 10), proxyMatW); body.position.y = 0.75; body.castShadow = true; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), proxyMatW); head.position.y = 1.82; head.castShadow = true; g.add(head);
  g.visible = false; scene.add(g); return g;
});
const updateProxiesW = () => {
  ALL_CARDS.forEach((c, i) => {
    const p = proxiesW[i];
    if (c.mesh.visible) {
      p.visible = true;
      p.position.set(c.mesh.position.x, 0, c.mesh.position.z);
      p.scale.setScalar(c.mesh.scale.x || 1);
    } else p.visible = false;
  });
};

// =====================================================================
// RENDER — har shot: camera move + acting + zinda background
// =====================================================================
function runCycle(f, cp, x, z, dir) {
  cycleG.visible = true;
  cycleG.position.set(x, 0, z);
  cycleWheels.forEach((w) => { w.rotation.z = -dir * f * 0.35; });
  drawChar(kidCard, 38, KID, 'grin', 'hang', 'hang', f, cp, x - 0.08, 0.3 + Math.abs(Math.sin(f * 0.5)) * 0.02, z, 0.72, (f % 10) / 10, null, 0);
}
window.renderFrame = (f) => {
  const shot = shotAt(f), u = shot.u, id = shot.id;
  const cam = camFor(shot, u);
  camera.position.set(...cam.pos); camera.lookAt(...cam.look);
  camera.fov = cam.fov; camera.updateProjectionMatrix();
  if (cam.roll) camera.rotateZ(cam.roll * Math.PI / 180);
  // s03/s29 ka jhatka (tez pull-back ke pehle pal) + s12 handheld
  if (id === 's03' || id === 's29') {
    const sh = Math.max(0, 1 - u / 0.45);
    camera.position.x += Math.sin(f * 2.3) * 0.035 * sh;
    camera.position.y += Math.cos(f * 2.9) * 0.028 * sh;
  }
  if (id === 's12') {
    camera.position.x += Math.sin(f * 0.9) * 0.02;
    camera.position.y += Math.cos(f * 1.13) * 0.016;
  }
  const env = applyEnv(shot.env);
  for (const k in skyMeshes) skyMeshes[k].visible = (k === env.sky);
  clouds.forEach((sp, i) => {
    sp.visible = true;
    sp.position.x = -22 + i * 7.5 + Math.sin(f * 0.004 + i) * 0.6;
  });
  ALL_CARDS.forEach((c) => c.hide());
  const cp = cam.pos;
  // ---- board price (shot ke hisaab se) ----
  let price = '₹4,20,000', pmode = 'gold';
  if (id === 's03' || id === 's04') { price = '₹1,60,000'; pmode = 'red'; }
  if (id === 's06') { price = u < 0.25 ? '₹3,85,000' : u < 0.5 ? '₹3,95,000' : u < 0.75 ? '₹4,05,000' : '₹4,20,000'; }
  // board girna (week by week, shot ke andar bhi tick): 4.2L -> 3.4L -> 2.6L -> 2L -> 1.6L (red)
  if (id === 's26') { price = u < 0.5 ? '₹3,45,000' : '₹3,40,000'; pmode = 'red'; }
  if (id === 's27') { price = u < 0.5 ? '₹2,65,000' : '₹2,60,000'; pmode = 'red'; }
  if (id === 's28') { price = u < 0.5 ? '₹2,10,000' : '₹2,00,000'; pmode = 'red'; }
  if (['s29', 's30', 's31', 's32', 's33', 's34', 's35', 's36', 's37', 's38'].includes(id)) { price = '₹1,60,000'; pmode = 'red'; }
  // sunar ka quote: board flip ₹3,80,000 (s39-s40); phir board ka asli number wapas
  if (id === 's39' || id === 's40') { price = '₹3,80,000'; pmode = 'gold'; }
  if (['s41', 's42', 's43', 's44', 's45', 's46', 's47'].includes(id)) { price = '₹1,60,000'; pmode = 'red'; }
  setPrice(price, pmode);
  // ---- hamesha zinda background ----
  fanBlades.rotation.y = f * 0.45;
  bazaarTrees.forEach((t, i) => { t.rotation.z = Math.sin(f * 0.03 + i * 1.7) * 0.018; });
  steamSprites.forEach((sp, i) => {
    const ph = (f * 0.011 + i / 6) % 1;
    sp.position.set(3.42 + Math.sin(f * 0.05 + i * 1.3) * 0.05 + ph * 0.22, 1.22 + ph * 0.9, -3.25);
    sp.scale.setScalar(0.22 + ph * 0.6);
    sp.material.opacity = 0.32 * (1 - ph) * Math.min(1, ph / 0.15);
  });
  // tarazu: aam halki harkat; s09 me khaas taulne ki acting
  let beamTilt = Math.sin(f * 0.15) * 0.03;
  if (id === 's09') beamTilt = 0.13 * Math.sin(u * 10) * (1 - u * 0.45) + Math.sin(f * 0.3) * 0.02;
  tarazuBeam.rotation.z = beamTilt;
  tarazuPanL.rotation.z = -beamTilt * 0.75; tarazuPanR.rotation.z = -beamTilt * 0.75;
  // glints default band
  glintBoard1.material.opacity = 0; glintBoard2.material.opacity = 0; glintShow.material.opacity = 0;
  boardGlow.material.opacity = 0;
  dustSprite.material.opacity = 0;
  cycleG.visible = false;
  gaddiG.visible = false; dibbaG.visible = false; noteProp.visible = false; thaaliG.visible = false;
  almariG.visible = false; calcG.visible = false;
  dibbaLidPivot.rotation.x = 0; dibbaG.rotation.set(0, 0, 0);

  switch (id) {
    case 's01': { // BOARD ECU: chamak flicker
      glintBoard1.material.opacity = Math.sin(f * 0.85) > 0.5 ? 0.95 : 0.2;
      glintBoard2.material.opacity = Math.sin(f * 0.85 + 2.2) > 0.5 ? 0.85 : 0.15;
      glintBoard1.material.rotation = f * 0.02; glintBoard2.material.rotation = -f * 0.017;
      boardGlow.material.opacity = 0.1 + 0.07 * Math.sin(f * 0.85);
      break;
    }
    case 's02': { // Ramesh gaddi nikaalta (garv) + peeche sunar + guzarta aadmi
      const lift = clamp((u - 0.15) / 0.3);
      drawChar(rameshCard, 31, RAMESH, 'grin', 'reach', 'hang', f, cp, -0.9, 0, -1.6, 1.06, 0, lift, 0);
      drawChar(sunarCard, 32, SUNAR, 'neutral', 'hang', 'hang', f, cp, 0.3, 0, -3.65, 0.92);
      drawWalk(w1Card, 36, WALK1, 'neutral', f, cp, 3.4, 0.9, 1.1, 0.9, u, 0.9);
      if (u > 0.12) {
        gaddiG.visible = true;
        const e = M.easeOut(lift);
        gaddiG.position.set(-0.62 + 0.2 * e, 0.6 + 0.58 * e, -1.32);
        gaddiG.rotation.z = Math.sin(f * 0.1) * 0.05;
      }
      break;
    }
    case 's03': // pull-back: Ramesh SHOCK, board ₹1,60,000 flash
      drawChar(rameshCard, 31, RAMESH, 'shock', 'up', 'up', f, cp, -0.9, 0, -1.6, 1.1);
      drawChar(sunarCard, 32, SUNAR, 'nervous', 'hang', 'hang', f, cp, 0.3, 0, -3.65, 0.92);
      break;
    case 's04': // udaas closeup: halka dibba, lid khula
      drawChar(rameshCard, 31, RAMESH, 'pained', 'belly', 'belly', f, cp, -0.9, 0, -1.6, 1.12, 0, null, 2);
      dibbaG.visible = true;
      dibbaG.position.set(-0.88, 0.8, -1.24);
      dibbaG.rotation.z = 0.06;
      dibbaLidPivot.rotation.x = -0.55;
      break;
    case 's05': { // NAYA DIN wide: dukaan bheed-bhaad, cycle, chai
      drawChar(sunarCard, 32, SUNAR, 'smile', 'reach', 'hang', f, cp, 0.3, 0, -3.65, 0.95);
      drawChar(g1Card, 34, GRA1, 'neutral', 'hang', 'hang', f, cp, -0.8, 0, -2.3, 0.95);
      drawChar(g2Card, 35, GRA2, 'smile', 'hang', 'hang', f, cp, 1.1, 0, -2.4, 0.93);
      drawChar(chaiCard, 39, CHAIWALA, 'smile', 'reach', 'hang', f, cp, 3.6, 0, -3.75, 0.9);
      drawWalk(w2Card, 37, WALK2, 'neutral', f, cp, -6, 1.2, -1.5, 1.2, clamp(u * 0.9), 0.88);
      drawWalk(w1Card, 36, WALK1, 'neutral', f, cp, -5, 1.5, 5, 1.1, clamp(u * 0.9), 0.95); // QA FIX: neeche foreground me guzarta aadmi
      runCycle(f, cp, -8.5 + 17 * u, 2.25, 1);
      break;
    }
    case 's06': // board number tick-up (price story.js/renderFrame upar set)
      drawChar(sunarCard, 32, SUNAR, 'smile', 'reach', 'reach', f, cp, 0.3, 0, -3.65, 0.95);
      glintBoard1.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.4);
      break;
    case 's07': // bheed dukaan ki taraf (depth lanes) + cycle beech se
      drawWalk(g1Card, 34, GRA1, 'grin', f, cp, -0.9, 1.6, -1.2, -1.9, u, 0.98, 'reach', 'hang');
      drawWalk(w1Card, 36, WALK1, 'neutral', f, cp, 0.75, 1.9, 0.6, -1.6, clamp(u * 0.95), 0.92);
      drawWalk(g2Card, 35, GRA2, 'smile', f, cp, 1.7, 0.4, 1.3, -2.0, clamp(u * 1.05), 0.96);
      drawWalk(w2Card, 37, WALK2, 'smile', f, cp, -1.8, 0.2, -1.5, -1.7, clamp(u * 0.9), 0.9);
      runCycle(f, cp, 8.5 - 17 * u, 2.35, -1);
      break;
    case 's08': // board closeup: chamak + kirnein
      glintBoard1.material.opacity = 0.65 + 0.35 * Math.sin(f * 0.35);
      glintBoard2.material.opacity = 0.65 + 0.35 * Math.sin(f * 0.35 + 2.0);
      glintBoard1.material.rotation = f * 0.015; glintBoard2.material.rotation = -f * 0.012;
      boardGlow.material.opacity = 0.3 + 0.14 * Math.sin(f * 0.22);
      break;
    case 's09': // sunar tarazu taul raha + naya graahak aata
      drawChar(sunarCard, 32, SUNAR, 'smile', 'reach', 'reach', f, cp, 0.3, 0, -3.65, 1.0);
      drawChar(g1Card, 34, GRA1, 'neutral', 'hang', 'hang', f, cp, -0.55, 0, -2.35, 0.97);
      drawWalk(g2Card, 35, GRA2, 'smile', f, cp, 2.4, -1.3, 1.15, -1.9, clamp(u * 0.9), 0.94);
      break;
    case 's10': { // exchange closeup: note aage, dibba peeche se aage
      drawChar(g1Card, 34, GRA1, 'smile', 'reach', 'hang', f, cp, -0.5, 0, -2.3, 1.02, 0, 0.5, 0);
      drawChar(sunarCard, 32, SUNAR, 'smile', 'reach', 'hang', f, cp, 0.3, 0, -3.65, 0.98);
      const ue = clamp((u - 0.1) / 0.4);
      if (u < 0.62) {
        noteProp.visible = true;
        noteProp.position.set(-0.42 + 0.47 * ue, 1.14 - 0.05 * ue, -2.45 - 0.47 * ue);
        noteProp.rotation.y = Math.sin(f * 0.2) * 0.15;
      }
      dibbaG.visible = true;
      const ud = clamp((u - 0.45) / 0.4);
      dibbaG.position.set(0.45 - 0.6 * ud, 1.06, -2.95);
      break;
    }
    case 's11': // graahak2 thaali me bartan (showcase ke saamne)
      drawChar(g2Card, 35, GRA2, 'grin', 'reach', 'reach', f, cp, -1.15, 0, -2.3, 1.0, 0, 0.4, 0);
      if (u > 0.2) {
        thaaliG.visible = true;
        thaaliG.position.set(-1.05, 0.72 + 0.13 * M.easeOut(clamp((u - 0.2) / 0.4)), -2.28);
        thaaliG.rotation.y = Math.sin(f * 0.08) * 0.1;
      }
      glintShow.material.opacity = 0.45 + 0.35 * Math.sin(f * 0.45);
      break;
    case 's12': { // RAMESH DHAKKA comedy
      const e = M.easeInOut(u);
      let rx = -2.7 + 1.55 * e, rz = -1.15 - 0.35 * e;
      const ui = (u - 0.52) / 0.16;
      let tilt = 0;
      if (ui >= 0 && ui <= 1) { const j = Math.sin(ui * Math.PI); rx -= j * 0.16; tilt = j * 5; }
      const expr = u < 0.5 ? 'smile' : u < 0.72 ? 'dazed' : 'relief';
      const step = (u < 0.5 || u > 0.72) ? (f % 14) / 14 : 0.3;
      drawChar(rameshCard, 31, RAMESH, expr, 'hang', 'hang', f, cp, rx, Math.abs(Math.sin(f * 0.5)) * 0.03, rz, 1.04, step, null, tilt);
      drawChar(g1Card, 34, GRA1, u >= 0.52 ? 'shock' : 'neutral', 'hang', 'hang', f, cp, -0.72 + (ui >= 0 && ui <= 1 ? Math.sin(ui * Math.PI) * 0.1 : 0), 0, -1.8, 0.98);
      drawChar(g2Card, 35, GRA2, u >= 0.62 ? 'laugh' : 'smile', 'hang', 'hang', f, cp, -2.0, 0, -2.35, 0.96);
      if (u > 0.52 && u < 0.82) {
        const du = (u - 0.52) / 0.3;
        dustSprite.material.opacity = Math.sin(du * Math.PI) * 0.5;
        dustSprite.position.set(rx + 0.1, 0.28, rz + 0.25);
        dustSprite.scale.setScalar(0.6 + du * 0.7);
      }
      break;
    }
    case 's13': // Ramesh counter par GARV big closeup + gaddi
      drawChar(rameshCard, 31, RAMESH, 'grin', 'reach', 'hip', f, cp, -0.55, 0, -2.2, 1.14, 0, 0.85, 0);
      drawChar(sunarCard, 32, SUNAR, 'smile', 'hang', 'hang', f, cp, 0.35, 0, -3.65, 0.95);
      gaddiG.visible = true;
      gaddiG.position.set(-0.22, 1.16 + Math.sin(f * 0.12) * 0.012, -2.0);
      gaddiG.rotation.z = Math.sin(f * 0.09) * 0.04;
      break;
    case 's14': { // sunar dibba BAND (dhak) karke badhata
      drawChar(sunarCard, 32, SUNAR, 'smile_closed', 'reach', 'reach', f, cp, 0.3, 0, -3.65, 1.0);
      dibbaG.visible = true;
      const uc = clamp((u - 0.35) / 0.23);
      dibbaLidPivot.rotation.x = -1.85 * (1 - M.easeIn(uc));
      dibbaG.position.set(0.28 - (u > 0.62 ? (u - 0.62) * 0.26 : 0), 1.06, -2.95);
      break;
    }
    case 's15': { // Ramesh dibba seene se lagaye nikalta; peeche khareedari jaari
      const e = M.easeInOut(u);
      const rx = -0.55 - 1.3 * e, rz = -2.25 + 1.5 * e;
      drawChar(rameshCard, 31, RAMESH, 'smile_closed', 'belly', 'belly', f, cp, rx, Math.abs(Math.sin(f * 0.5)) * 0.03, rz, 1.02, (f % 14) / 14, null, 1);
      dibbaG.visible = true;
      dibbaG.position.set(rx + 0.05, 0.88, rz + 0.34);
      drawChar(g1Card, 34, GRA1, 'smile', 'reach', 'hang', f, cp, -0.35, 0, -2.35, 0.97, 0, 0.5, 0);
      drawChar(g2Card, 35, GRA2, 'smile', 'hang', 'hang', f, cp, 0.78, 0, -2.4, 0.95);
      drawChar(sunarCard, 32, SUNAR, 'smile', 'reach', 'hang', f, cp, 0.3, 0, -3.65, 0.95);
      drawChar(chaiCard, 39, CHAIWALA, 'smile', 'reach', 'hang', f, cp, 3.6, 0, -3.75, 0.9);
      break;
    }
    case 's16': { // DOST haath pakad leta — cliffhanger
      const dx = -1.35 + 0.33 * M.easeOut(clamp(u / 0.35));
      const expr = u < 0.35 ? 'smile_closed' : 'shock';
      let tilt = 0;
      const ui = (u - 0.35) / 0.25;
      if (ui >= 0 && ui <= 1) tilt = Math.sin(ui * Math.PI) * 4;
      drawChar(rameshCard, 31, RAMESH, expr, 'belly', 'belly', f, cp, -0.35, 0, -1.55, 1.08, 0, null, tilt);
      dibbaG.visible = true;
      dibbaG.position.set(-0.3, 0.88, -1.2);
      drawChar(dostCard, 33, DOST, 'stern', 'reach', 'hang', f, cp, dx, 0, -1.62, 1.05, 0, 0.9, 0, ENV[f]); // lip-sync: dost bolta hai
      break;
    }
    case 's17': { // Ramesh HAS pada — bada laugh
      drawChar(rameshCard, 31, RAMESH, 'laugh', 'belly', 'belly', f, cp, -0.35, 0, -1.55, 1.1, 0, null, Math.sin(u * 9) * 1.5);
      dibbaG.visible = true;
      dibbaG.position.set(-0.3, 0.88, -1.2);
      drawChar(dostCard, 33, DOST, 'stern', 'hang', 'hang', f, cp, -1.02, 0, -1.62, 1.05, 0, null, Math.sin(u * Math.PI * 2) * 2);
      break;
    }
    case 's18': { // Ramesh akad: 'Tu rehne de! Chaandi 5 lakh jayegi' (SPEAK)
      drawChar(rameshCard, 31, RAMESH, 'grin', 'up', 'hip', f, cp, -0.35, 0, -1.55, 1.12, 0, 0.9, 0, ENV[f]);
      dibbaG.visible = true;
      dibbaG.position.set(-0.3, 0.88, -1.2);
      drawChar(dostCard, 33, DOST, 'stern', 'hang', 'hang', f, cp, -1.02, 0, -1.62, 1.05);
      glintBoard1.material.opacity = 0.4 + 0.3 * Math.sin(f * 0.4);
      break;
    }
    case 's19': { // Dost sar hilata, Ramesh dibba leke mudta
      const e = M.easeInOut(u);
      const rx = -0.35 - 0.5 * e;
      drawChar(rameshCard, 31, RAMESH, 'smile_closed', 'belly', 'belly', f, cp, rx, Math.abs(Math.sin(f * 0.5)) * 0.03, -1.55, 1.06, (f % 14) / 14, null, 1);
      dibbaG.visible = true;
      dibbaG.position.set(rx + 0.05, 0.88, -1.2);
      drawChar(dostCard, 33, DOST, 'stern', 'hang', 'hang', f, cp, -1.02, 0, -1.62, 1.05, 0, null, Math.sin(u * Math.PI * 2) * 2.5);
      break;
    }
    case 's20': { // Dibba haathon me, ghar ki taraf chalta (evening)
      const e = M.easeInOut(u);
      const rx = -0.2 - 1.3 * e, rz = -1.0 - 1.2 * e;
      drawWalk(rameshCard, 31, RAMESH, 'smile_closed', f, cp, -0.2, -1.0, -1.5, -2.2, u, 1.02, 'belly', 'belly');
      dibbaG.visible = true;
      dibbaG.position.set(rx + 0.05, 0.88, rz + 0.34);
      break;
    }
    case 's21': { // ALMARI: dibba andar slide, darwaze BAND
      almariG.visible = true;
      const o = 1.6 * (1 - M.easeInOut(clamp((u - 0.35) / 0.5))); // darwaze khule -> band
      almariDoorL.rotation.y = -o; almariDoorR.rotation.y = o;
      dibbaG.visible = true;
      const dz = -3.6 - 0.33 * M.easeInOut(clamp(u / 0.4));
      dibbaG.position.set(-3.3, 1.04, dz);
      break;
    }
    case 's22': { // Sapna: aankhein upar, halki smile (ghar kona)
      drawChar(rameshCard, 31, RAMESH, 'smile_closed', 'hang', 'hang', f, cp, -2.6, 0, -3.2, 1.1, 0, null, -1);
      glintShow.position.set(-2.6, 1.6, -2.9);
      glintShow.material.opacity = 0.25 + 0.2 * Math.sin(f * 0.15);
      break;
    }
    case 's23': { // Dibba chamak + Ramesh khush (dream glow)
      drawChar(rameshCard, 31, RAMESH, 'grin', 'belly', 'belly', f, cp, -2.6, 0, -3.2, 1.08);
      dibbaG.visible = true;
      dibbaG.position.set(-2.55, 1.05, -2.85);
      glintShow.position.set(-2.55, 1.25, -2.7);
      glintShow.material.opacity = 0.5 + 0.4 * Math.sin(f * 0.3);
      break;
    }
    case 's24': { // Roshni badli: smile dheere mit ti
      const expr = u < 0.45 ? 'smile_closed' : u < 0.75 ? 'neutral' : 'pained';
      drawChar(rameshCard, 31, RAMESH, expr, 'hang', 'hang', f, cp, -0.4, 0, -1.6, 1.06);
      drawWalk(w1Card, 36, WALK1, 'neutral', f, cp, -3, 1.4, 3, 1.0, clamp(u * 0.9), 0.9);
      break;
    }
    case 's25': { // Board wide, Ramesh upar dekhta, chinta
      drawChar(rameshCard, 31, RAMESH, 'nervous', 'hang', 'hang', f, cp, -0.5, 0, -1.8, 1.02, 0, null, -1);
      drawChar(sunarCard, 32, SUNAR, 'neutral', 'hang', 'hang', f, cp, 0.3, 0, -3.65, 0.92);
      glintBoard1.material.opacity = 0.2 + 0.15 * Math.sin(f * 0.3);
      break;
    }
    case 's26': { // Board TICK-DOWN ₹3,40,000 (red)
      drawChar(sunarCard, 32, SUNAR, 'neutral', 'hang', 'hang', f, cp, 0.3, 0, -3.65, 0.95);
      drawChar(rameshCard, 31, RAMESH, 'pained', 'hang', 'hang', f, cp, -0.7, 0, -1.9, 1.0);
      glintBoard1.material.opacity = 0.5 + 0.4 * Math.sin(f * 0.5);
      break;
    }
    case 's27': { // Board ₹2,60,000, bheed patli
      drawChar(sunarCard, 32, SUNAR, 'neutral', 'hang', 'hang', f, cp, 0.3, 0, -3.65, 0.95);
      drawChar(rameshCard, 31, RAMESH, 'pained', 'hang', 'hang', f, cp, -0.7, 0, -1.9, 1.0);
      drawWalk(g1Card, 34, GRA1, 'neutral', f, cp, -2.2, -0.6, 2.2, 0.8, clamp(u * 0.9), 0.95, 'hang', 'hang'); // frame se guzarta (bheed patli ho rahi)
      glintBoard1.material.opacity = 0.4 + 0.3 * Math.sin(f * 0.45);
      break;
    }
    case 's28': { // Subah phir: board ₹2,00,000
      drawChar(sunarCard, 32, SUNAR, 'neutral', 'hang', 'hang', f, cp, 0.3, 0, -3.65, 0.95);
      drawChar(rameshCard, 31, RAMESH, 'pained', 'hang', 'hang', f, cp, -0.5, 0, -1.8, 1.0);
      break;
    }
    case 's29': { // Board ₹1,60,000 RED FLASH + Ramesh SHOCK (s03 echo)
      drawChar(rameshCard, 31, RAMESH, 'shock', 'up', 'up', f, cp, -0.9, 0, -1.6, 1.1);
      drawChar(sunarCard, 32, SUNAR, 'nervous', 'hang', 'hang', f, cp, 0.3, 0, -3.65, 0.92);
      glintBoard1.material.opacity = Math.sin(f * 0.85) > 0.5 ? 0.95 : 0.2;
      glintBoard2.material.opacity = Math.sin(f * 0.85 + 2.2) > 0.5 ? 0.85 : 0.15;
      boardGlow.material.opacity = 0.3 + 0.2 * Math.sin(f * 0.5);
      break;
    }
    case 's30': { // Jamna hua beat: Ramesh frozen, khaamosh sadak
      drawChar(rameshCard, 31, RAMESH, 'pained', 'hang', 'hang', f, cp, -0.9, 0, -1.6, 1.08);
      break;
    }
    case 's31': { // Ramesh roz guzarta — sar jhuka walk
      drawWalk(rameshCard, 31, RAMESH, 'pained', f, cp, 1.2, -1.2, -1.6, -1.9, u, 1.02, 'hang', 'hang');
      break;
    }
    case 's32': { // Ruk kar board dekhta, tilt-up
      const expr = u < 0.5 ? 'pained' : 'neutral';
      drawChar(rameshCard, 31, RAMESH, expr, 'hang', 'hang', f, cp, -0.9, 0, -1.8, 1.04, 0, null, -2);
      glintBoard1.material.opacity = 0.15 + 0.1 * Math.sin(f * 0.25);
      break;
    }
    case 's33': { // Peeth dikha kar chup nikal jata
      drawWalk(rameshCard, 31, RAMESH, 'pained', f, cp, -0.9, -1.6, -2.4, 0.6, u, 1.02, 'hang', 'hang');
      break;
    }
    case 's34': { // RAAT: almari khulti, dibba uthaya
      almariG.visible = true;
      const o = 1.6 * M.easeInOut(clamp(u / 0.5)); // darwaze band -> khule
      almariDoorL.rotation.y = -o; almariDoorR.rotation.y = o;
      dibbaG.visible = true;
      dibbaG.position.set(-3.3, 1.04, -3.93 + 0.33 * M.easeInOut(clamp((u - 0.3) / 0.5)));
      break;
    }
    case 's35': { // KHALI DUKAAN wide: koi bheed nahi, sunar akela
      drawChar(sunarCard, 32, SUNAR, 'neutral', 'hang', 'hang', f, cp, 0.3, 0, -3.65, 0.95);
      drawWalk(rameshCard, 31, RAMESH, 'pained', f, cp, -2.5, 1.0, -0.9, -1.6, clamp(u * 0.8), 1.02, 'hang', 'hang');
      break;
    }
    case 's36': { // Tarazu closeup: dibba pan par, beam jhoolta
      drawChar(sunarCard, 32, SUNAR, 'smile', 'reach', 'reach', f, cp, 0.3, 0, -3.65, 1.0);
      dibbaG.visible = true;
      dibbaG.position.set(0.32, 1.34, -3.0);
      tarazuBeam.rotation.z = 0.1 * Math.sin(u * 9) * (1 - u * 0.4);
      tarazuPanL.rotation.z = -tarazuBeam.rotation.z * 0.75; tarazuPanR.rotation.z = -tarazuBeam.rotation.z * 0.75;
      glintShow.position.set(0.32, 1.5, -2.8);
      glintShow.material.opacity = 0.4 + 0.3 * Math.sin(f * 0.3);
      break;
    }
    case 's37': { // CALCULATOR closeup: ungli keys par
      drawChar(sunarCard, 32, SUNAR, 'neutral', 'reach', 'hang', f, cp, 0.3, 0, -3.65, 1.0);
      calcG.visible = true;
      calcG.position.set(0.95, 1.07, -2.95);
      calcG.rotation.y = -0.15 + Math.sin(f * 0.3) * 0.02;
      break;
    }
    case 's38': { // Sunar shaant chehra closeup
      drawChar(sunarCard, 32, SUNAR, 'smile_closed', 'hang', 'hang', f, cp, 0.3, 0, -3.65, 1.05);
      break;
    }
    case 's39': { // Board FLIP ₹3,80,000 + sunar bolta (SPEAK)
      drawChar(sunarCard, 32, SUNAR, 'neutral', 'reach', 'hang', f, cp, 0.3, 0, -3.65, 1.0, 0, null, 0, ENV[f]);
      drawChar(rameshCard, 31, RAMESH, 'shock', 'hang', 'hang', f, cp, -0.55, 0, -2.0, 1.05);
      dibbaG.visible = true;
      dibbaG.position.set(-0.1, 1.06, -2.95);
      boardGlow.material.opacity = 0.35 + 0.1 * Math.sin(f * 0.25);
      glintBoard1.material.opacity = 0.6 + 0.3 * Math.sin(f * 0.4);
      break;
    }
    case 's40': { // Dibba closeup: chandi waisi ki waisi chamakti
      drawChar(rameshCard, 31, RAMESH, 'pained', 'belly', 'belly', f, cp, -0.85, 0, -1.6, 1.12, 0, null, 2);
      dibbaG.visible = true;
      dibbaG.position.set(-0.82, 0.95, -1.25);
      glintShow.position.set(-0.82, 1.1, -1.1);
      glintShow.material.opacity = 0.5 + 0.4 * Math.sin(f * 0.35);
      break;
    }
    case 's41': { // Board closeup BUJHA hua, slow push — no glint, no glow
      break;
    }
    case 's42': { // Realisation: chehra dheere badalta (pained -> neutral -> calm)
      const expr = u < 0.35 ? 'pained' : u < 0.7 ? 'neutral' : 'smile_closed';
      drawChar(rameshCard, 31, RAMESH, expr, 'hang', 'hang', f, cp, -0.6, 0, -1.9, 1.12, 0, null, 0);
      break;
    }
    case 's43': { // Ramesh board -> dibba dekhta
      drawChar(rameshCard, 31, RAMESH, 'neutral', 'belly', 'belly', f, cp, -0.5, 0, -2.0, 1.06);
      dibbaG.visible = true;
      dibbaG.position.set(-0.45, 0.9, -1.65);
      break;
    }
    case 's44': { // Hold: khaali sadak, lamp, Ramesh akele khada
      drawChar(rameshCard, 31, RAMESH, 'neutral', 'hang', 'hang', f, cp, -0.4, 0, -1.2, 1.0);
      break;
    }
    case 's45': { // THESIS two-shot: board (badla) vs dibba (waisa)
      drawChar(rameshCard, 31, RAMESH, 'neutral', 'belly', 'belly', f, cp, -0.4, 0, -2.0, 1.08);
      dibbaG.visible = true;
      dibbaG.position.set(-0.35, 1.15, -1.7);
      glintShow.position.set(-0.35, 1.3, -1.5);
      glintShow.material.opacity = 0.5 + 0.3 * Math.sin(f * 0.3);
      break;
    }
    case 's46': { // Loop walk shuru (s31 rhyme)
      drawWalk(rameshCard, 31, RAMESH, 'neutral', f, cp, 1.2, -1.2, -1.6, -1.9, u, 1.02, 'hang', 'hang');
      drawWalk(w1Card, 36, WALK1, 'neutral', f, cp, 2.5, 0.6, -2.0, 1.4, clamp(u * 0.9), 0.9);
      break;
    }
    case 's47': { // LOOP wide (s05 rhyme): wahi dukaan, wahi sadak, mid-step ant
      drawChar(sunarCard, 32, SUNAR, 'smile', 'reach', 'hang', f, cp, 0.3, 0, -3.65, 0.95);
      drawChar(g1Card, 34, GRA1, 'neutral', 'hang', 'hang', f, cp, -0.8, 0, -2.3, 0.95);
      drawChar(g2Card, 35, GRA2, 'smile', 'hang', 'hang', f, cp, 1.1, 0, -2.4, 0.93);
      drawChar(chaiCard, 39, CHAIWALA, 'smile', 'reach', 'hang', f, cp, 3.6, 0, -3.75, 0.9);
      drawWalk(w2Card, 37, WALK2, 'neutral', f, cp, -6, 1.2, -1.5, 1.2, clamp(u * 0.9), 0.88);
      drawWalk(w1Card, 36, WALK1, 'neutral', f, cp, -5, 1.5, 5, 1.1, clamp(u * 0.9), 0.95);
      runCycle(f, cp, -8.5 + 17 * u, 2.25, 1);
      break;
    }
  }
  updateProxiesW();
  renderer.render(scene, camera);
};
window.TOTAL = TOTAL;
window.ready = Promise.resolve();
