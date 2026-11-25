// "Paani Wala" — FULL VIDEO v2 (50.31s, 1509 frames @30fps). Mirror kit + Gullak density.
// PAANCH set: 'depot' (RO plant, left-third) | 'street' (geeli sadak) | 'home' (ghar ka darwaza)
//   | 'gate' (office gate + 4 towers) | 'lobby' (office reception, glass).
// Palette: teal #0f766e + peela #facc15 + safed. Gold #ffd76a / narangi shaam #e08a4e HATAO.
// NO captions, NO music. Numbers objects bankar (max 2 board + tempo-side paint).
// Contract: window.ready, window.renderFrame(f).
import * as THREE from 'three';
import * as FX from './fx.js';
import * as T from './toon.js';
import { idle, blinkAt, q, M, clamp } from './motion.js';
import { tex, planks, plaster, stone, dirt, wetConcrete, tiles, tinRoof } from './paint.js';
import { TOTAL, shotAt, camFor, FLASH } from './story.js';
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
scene.add(camera); // flashPlane camera ka child hai — render ke liye camera scene me hona chahiye
const flashPlane = new THREE.Mesh(new THREE.PlaneGeometry(3, 5), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, depthTest: false, fog: false }));
flashPlane.position.set(0, 0, -0.5); flashPlane.renderOrder = 999; camera.add(flashPlane);
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
// street lamp (raat/shaam shots me ON) — pole gali set me hai
const streetLampLight = new THREE.PointLight(0xffc27a, 0, 9, 1.6);
streetLampLight.position.set(2.25, 2.9, -1.1); scene.add(streetLampLight);
const lampHead = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.16), lam({ color: 0x2c343c })); lampHead.position.set(2.25, 3.02, -1.1); scene.add(lampHead);
const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), lam({ color: 0xffe2a0 })); lampBulb.position.set(2.25, 2.96, -1.1); scene.add(lampBulb);
const lampConeMat = new THREE.MeshBasicMaterial({ color: 0xffc27a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
const lampCone = new THREE.Mesh(new THREE.ConeGeometry(1.15, 2.6, 24, 1, true), lampConeMat);
lampCone.position.set(2.25, 1.72, -1.1); scene.add(lampCone);
const moteMat = () => new THREE.SpriteMaterial({ map: FX.puffTexture([[0, 'rgba(255,230,180,0.9)'], [1, 'rgba(255,230,180,0)']]), transparent: true, opacity: 0, depthWrite: false });
const lampMotes = [];
for (let i = 0; i < 4; i++) { const sp = new THREE.Sprite(moteMat()); sp.scale.setScalar(0.09); scene.add(sp); lampMotes.push(sp); }
function setNightLamp(on, f) {
  streetLampLight.intensity = on ? 4 : 0;
  lampConeMat.opacity = on ? 0.13 : 0;
  lampMotes.forEach((m, i) => {
    m.material.opacity = on ? 0.45 : 0;
    m.position.set(2.25 + Math.sin(f * 0.02 + i * 1.7) * 0.5, 1.0 + ((f * 0.004 + i * 0.23) % 1) * 1.6, -1.1 + Math.cos(f * 0.017 + i * 2.1) * 0.35);
  });
}

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
const CARD_CW = 1200, CARD_CH = 2000, CARD_M = 2.05;
const cardGeo = new THREE.PlaneGeometry(CARD_M * 0.6, CARD_M); cardGeo.translate(0, CARD_M / 2 - CARD_M * 0.025, 0);
const blobTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  gr.addColorStop(0, 'rgba(14,9,20,0.62)'); gr.addColorStop(1, 'rgba(14,9,20,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
})();
class Card {
  constructor() {
    this.c = document.createElement('canvas'); this.c.width = CARD_CW; this.c.height = CARD_CH;
    this.g = this.c.getContext('2d');
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mesh = new THREE.Mesh(cardGeo, new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: true }));
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 0.9), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: true }));
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
const deepakCard = new Card(), auntyCard = new Card(), officeCard = new Card();
const ladkaCard = new Card(), guardCard = new Card(), w1Card = new Card(), w2Card = new Card();
const kidCard = new Card(), workerCard = new Card(), rivalCard = new Card();
const ALL_CARDS = [deepakCard, auntyCard, officeCard, ladkaCard, guardCard, w1Card, w2Card, kidCard, workerCard, rivalCard];
// is kahani ke fresh designs — Deepak naya hero, purane Mohan-Seth/Ramesh nahi
// is kahani ke fresh designs — Deepak: teal tunic + peeli topi + moochh + peela gamchha (toga band)
const DEEPAK = { tunic: '#0e7490', shirt: '#f8fafc', skin: '#b45309', hair: '#1e1a20', hairStyle: 'thick', hairLine: 0.3, cap: '#facc15', moustache: '#241a14', toga: '#facc15', togaPrint: true, print: { type: 'stripe', col: '#0f766e', a: 0.3, step: 11, lw: 2 } }; // hero: teal + peeli topi/moochh/gamchha
const AUNTY = { tunic: '#be185d', dress: '#9d174d', shirt: '#fef3c7', skin: '#e8b98d', hair: '#1e1714', hairStyle: 'thick' }; // gulabi saree
const OFFICE = { tunic: '#134e4a', shirt: '#f8fafc', skin: '#d99e63', hair: '#1e1a20', hairStyle: 'thick', glasses: true }; // gehra teal, chashma
const LADKA = { tunic: '#92400e', shirt: '#fde68a', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick' }; // bhura kurta, delivery ladka
const GUARD = { tunic: '#1e293b', shirt: '#e2e8f0', skin: '#a06a3c', cap: '#facc15' }; // slate uniform, peeli topi
const WALK1 = { tunic: '#0f766e', shirt: '#f8fafc', skin: '#c98a54', hair: '#1e1a20', hairStyle: 'thick' }; // teal kurta
const WALK2 = { tunic: '#0369a1', dress: '#075985', shirt: '#f7f0dd', skin: '#f0c09a', hair: '#1e1714', hairStyle: 'thick' }; // neeli saree
const KID = { tunic: '#ca8a04', shirt: '#fefce8', skin: '#e8b98d', hair: '#1e1a20', hairStyle: 'thick' }; // peela kurta, baccha
const WORKER = { tunic: '#334155', shirt: '#facc15', skin: '#a06a3c', hair: '#241a14', cap: '#facc15' }; // plant worker, grey + peela helmet-topi
const RIVAL = { tunic: '#7c2d12', shirt: '#fef3c7', skin: '#c98a54', hair: '#1e1a20', hairStyle: 'thick', moustache: '#241a14' }; // mocking rival: zang-bhura kurta + moochh (sirf expression se hansta/shock)

// =====================================================================
// ENVS — har samay ka apna natural rang, koi single wash NAHI
// =====================================================================
const ENVS = {
  morning: { bg: 0x9fd8d4, fogC: 0xbfe8e2, fogNear: 16, fogFar: 60, hemi: 1.06, hemiC: 0xeafaf6, hemiG: 0x7a9a8a, sun: 1.35, sunC: 0xfff7cc, sunPos: [-8, 7, 6], bounce: 0.3, bounceC: 0xd6e6ff, expo: 1.1, sky: 'morning' },
  day: { bg: 0x7cc7de, fogC: 0xa9d4e6, fogNear: 14, fogFar: 60, hemi: 1.0, hemiC: 0xcfe4ff, hemiG: 0x8a7a5a, sun: 1.42, sunC: 0xffffff, sunPos: [-7, 10, 5], bounce: 0.3, bounceC: 0xd6e6ff, expo: 1.13, sky: 'day' },
  noon: { bg: 0xbae6fd, fogC: 0xcdebfd, fogNear: 16, fogFar: 64, hemi: 1.18, hemiC: 0xf6fbff, hemiG: 0x9a9a8a, sun: 1.66, sunC: 0xffffff, sunPos: [-2.5, 12, 4.5], bounce: 0.34, bounceC: 0xe2efff, expo: 1.09, sky: 'day' },
  evening: { bg: 0x0f766e, fogC: 0x115e59, fogNear: 14, fogFar: 68, hemi: 0.9, hemiC: 0xccfbf1, hemiG: 0x134e4a, sun: 1.1, sunC: 0xfbbf24, sunPos: [-9, 4, 6], bounce: 0.22, bounceC: 0xfde68a, expo: 1.08, sky: 'evening' },
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
  morning: new THREE.Mesh(skyGeo, bas({ map: skyTex([[0, '#0f766e'], [0.55, '#5eead4'], [1, '#fef9c3']]), fog: false })),
  day: new THREE.Mesh(skyGeo, bas({ map: skyTex([[0, '#0284c7'], [0.55, '#7dd3fc'], [1, '#f0f9ff']]), fog: false })),
  evening: new THREE.Mesh(skyGeo, bas({ map: skyTex([[0, '#134e4a'], [0.55, '#0d9488'], [1, '#fde68a']]), fog: false })),
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
// SET — GALI: PAANI DEPOT (centre) + chai stall (right) + kirana (left)
// =====================================================================

// =====================================================================
// SETS v2 — PAANCH alag duniya (C4): depot left-third + RO plant, geeli street,
// ghar ka darwaza, office gate, lobby. CHAI POINT / KIRANA / fan / centre-counter HATAO.
// =====================================================================
const depotG = new THREE.Group(); scene.add(depotG);
const streetG = new THREE.Group(); scene.add(streetG);
const homeG = new THREE.Group(); scene.add(homeG);
const gateG = new THREE.Group(); scene.add(gateG);
const lobbyG = new THREE.Group(); scene.add(lobbyG);
let depotTrees = [], streetTrees = [];
// ---- dynamic number surfaces (board #1 chalkboard, board #2 wall-sign, glass note, droplet tag) ----
const chalkCanvas = document.createElement('canvas'); chalkCanvas.width = 640; chalkCanvas.height = 900;
{
  const g = chalkCanvas.getContext('2d');
  g.fillStyle = '#0b3b3a'; g.fillRect(0, 0, 640, 900);
  g.strokeStyle = '#f8fafc'; g.lineWidth = 4; g.strokeRect(16, 16, 608, 868);
  g.textAlign = 'left'; g.fillStyle = '#f8fafc';
  g.font = 'bold 64px "Comic Sans MS", "Chalkboard SE", cursive';
  g.fillText('EK JAR KA', 56, 130); g.fillText('HISAAB', 56, 205);
  g.font = 'bold 230px "Comic Sans MS", "Chalkboard SE", cursive';
  g.fillText('₹12', 52, 470);
  g.font = 'bold 58px "Comic Sans MS", "Chalkboard SE", cursive';
  g.fillStyle = '#5eead4'; g.fillText('PAANI  ₹3', 56, 600);
  g.fillStyle = '#f8fafc'; g.fillText('+ KHARCHA  ₹9', 56, 680);
  g.fillStyle = '#99f6e4'; g.font = 'bold 44px "Comic Sans MS", cursive';
  g.fillText('dhulai • diesel • ghisai', 56, 790);
}
const chalkTex = new THREE.CanvasTexture(chalkCanvas); chalkTex.colorSpace = THREE.SRGBColorSpace; chalkTex.anisotropy = 4;
const chalkBoard = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.35), lam({ map: chalkTex }));
chalkBoard.position.set(-3.9, 1.95, -4.15); chalkBoard.rotation.z = -0.06; chalkBoard.visible = false;
depotG.add(chalkBoard);
const wallCanvas = document.createElement('canvas'); wallCanvas.width = 1024; wallCanvas.height = 360;
{
  const g = wallCanvas.getContext('2d');
  g.fillStyle = '#0f766e'; g.fillRect(0, 0, 1024, 360);
  g.textAlign = 'left'; g.fillStyle = '#f8fafc';
  g.font = 'bold 200px "Comic Sans MS", "Chalkboard SE", cursive';
  g.fillText('₹60,000', 48, 200);
  g.fillStyle = '#fde047'; g.font = 'bold 92px "Comic Sans MS", cursive';
  g.fillText('MAHINA', 52, 315);
}
const wallTex = new THREE.CanvasTexture(wallCanvas); wallTex.colorSpace = THREE.SRGBColorSpace; wallTex.anisotropy = 4;
const wallSign = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.92), lam({ map: wallTex }));
wallSign.position.set(-2.2, 2.55, -4.24); wallSign.rotation.z = -0.03; wallSign.visible = false;
depotG.add(wallSign);
const glassCanvas = document.createElement('canvas'); glassCanvas.width = 512; glassCanvas.height = 320;
{
  const g = glassCanvas.getContext('2d'); g.clearRect(0, 0, 512, 320);
  g.textAlign = 'center'; g.fillStyle = '#0f766e';
  g.font = 'bold 170px Arial'; g.fillText('₹30', 256, 190);
  g.fillStyle = '#134e4a'; g.font = 'bold 52px Arial'; g.fillText('OFFICE RATE', 256, 275);
}
const glassTex = new THREE.CanvasTexture(glassCanvas); glassTex.colorSpace = THREE.SRGBColorSpace;
const glassNote = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.72), new THREE.MeshBasicMaterial({ map: glassTex, transparent: true, depthWrite: false }));
glassNote.position.set(1.1, 1.75, -5.55); glassNote.visible = false;
lobbyG.add(glassNote);
const dropCanvas = document.createElement('canvas'); dropCanvas.width = 256; dropCanvas.height = 256;
{
  const g = dropCanvas.getContext('2d');
  g.fillStyle = '#06b6d4'; g.beginPath();
  g.moveTo(128, 12); g.bezierCurveTo(200, 120, 210, 160, 200, 190);
  g.bezierCurveTo(185, 235, 70, 235, 56, 190); g.bezierCurveTo(46, 160, 56, 120, 128, 12); g.fill();
  g.fillStyle = '#ffffff'; g.font = 'bold 64px Arial'; g.textAlign = 'center'; g.fillText('₹3', 128, 190);
}
const dropTex = new THREE.CanvasTexture(dropCanvas); dropTex.colorSpace = THREE.SRGBColorSpace;
const dropletTag = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshBasicMaterial({ map: dropTex, transparent: true, depthWrite: false }));
dropletTag.visible = false; scene.add(dropletTag);
// sikke (hatheli / gate): peele, chhote cylinders
const coinPile = new THREE.Group(); scene.add(coinPile);
{
  const cm = lam({ color: 0xfacc15 });
  for (let i = 0; i < 8; i++) {
    const c = cyl(0.05, 0.05, 0.014, cm, 12);
    c.rotation.x = Math.PI / 2; c.position.set((i % 4) * 0.11 - 0.16, 0, Math.floor(i / 4) * 0.11 - 0.05);
    coinPile.add(c);
  }
  coinPile.visible = false;
}


// =====================================================================
// SAFAR-MAP (top-down route visual, portrait 3.6 x 6.5) — s09 30% / s19 65% / s30 100%
// =====================================================================
const mapGroup = new THREE.Group(); mapGroup.position.set(0, 0.02, -0.6); mapGroup.visible = false; scene.add(mapGroup);
{
  const mapCanvas = document.createElement('canvas'); mapCanvas.width = 512; mapCanvas.height = 920;
  const g = mapCanvas.getContext('2d');
  g.fillStyle = '#e0f2fe'; g.fillRect(0, 0, 512, 920);
  g.fillStyle = '#bbf7d0'; g.fillRect(20, 120, 130, 180); g.fillRect(360, 420, 130, 200);
  g.fillStyle = '#94a3b8'; g.fillRect(210, 40, 92, 840);
  g.fillStyle = '#f8fafc';
  for (let y = 60; y < 880; y += 56) g.fillRect(250, y, 12, 30);
  g.fillStyle = '#94a3b8'; g.fillRect(20, 430, 472, 70);
  g.fillStyle = '#0f766e'; g.fillRect(170, 760, 172, 120);
  g.fillStyle = '#f8fafc'; g.font = 'bold 44px Arial'; g.textAlign = 'center'; g.fillText('DEPOT', 256, 830);
  g.fillStyle = '#facc15';
  [[60, 300], [380, 300], [60, 560]].forEach(([x, y]) => g.fillRect(x, y, 90, 70));
  g.fillStyle = '#134e4a'; g.font = 'bold 30px Arial'; g.fillText('GHAR', 105, 345);
  g.fillStyle = '#134e4a';
  [[180, 60], [250, 60], [180, 140], [250, 140]].forEach(([x, y]) => g.fillRect(x, y, 56, 64));
  g.fillStyle = '#0f766e'; g.font = 'bold 34px Arial'; g.fillText('4 TOWERS', 105, 60);
  const mapTex = new THREE.CanvasTexture(mapCanvas); mapTex.colorSpace = THREE.SRGBColorSpace; mapTex.anisotropy = 4;
  const mapPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 6.5), lam({ map: mapTex }));
  mapPlane.rotation.x = -Math.PI / 2; mapGroup.add(mapPlane);
}
const ROUTE_WPS = [[-0.3, 2.2], [-0.7, 1.0], [-0.1, 0.2], [0.5, -0.8], [0.8, -1.8], [0.9, -2.6]];
const ROUTE_N = 48;
const routeDots = [];
{
  const segs = []; let total = 0;
  for (let i = 0; i < ROUTE_WPS.length - 1; i++) {
    const len = Math.hypot(ROUTE_WPS[i + 1][0] - ROUTE_WPS[i][0], ROUTE_WPS[i + 1][1] - ROUTE_WPS[i][1]);
    segs.push(len); total += len;
  }
  const dotGeo = new THREE.PlaneGeometry(0.14, 0.14);
  const dotMat = bas({ color: 0x0f766e });
  for (let i = 0; i < ROUTE_N; i++) {
    const d = (i / (ROUTE_N - 1)) * total;
    let acc = 0, px = ROUTE_WPS[0][0], pz = ROUTE_WPS[0][1];
    for (let s = 0; s < segs.length; s++) {
      if (d <= acc + segs[s] || s === segs.length - 1) {
        const t = Math.min(1, Math.max(0, (d - acc) / segs[s]));
        px = ROUTE_WPS[s][0] + (ROUTE_WPS[s + 1][0] - ROUTE_WPS[s][0]) * t;
        pz = ROUTE_WPS[s][1] + (ROUTE_WPS[s + 1][1] - ROUTE_WPS[s][1]) * t;
        break;
      }
      acc += segs[s];
    }
    const m = new THREE.Mesh(dotGeo, dotMat);
    m.rotation.x = -Math.PI / 2; m.position.set(px, 0.03, pz); m.visible = false;
    mapGroup.add(m); routeDots.push(m);
  }
}
const headDot = new THREE.Mesh(new THREE.CircleGeometry(0.18, 16), bas({ color: 0xfacc15 }));
headDot.rotation.x = -Math.PI / 2; headDot.position.set(-0.3, 0.04, 2.2); headDot.visible = false; mapGroup.add(headDot);
function routePoint(p) {
  const idx = Math.min(ROUTE_N - 1, Math.floor(p * ROUTE_N));
  const m = routeDots[idx];
  return [m.position.x, m.position.z];
}
function setRoute(p) {
  const n = Math.round(p * ROUTE_N);
  routeDots.forEach((d, i) => { d.visible = i < n; });
  const [hx, hz] = routePoint(p);
  headDot.position.set(hx, 0.04, hz); headDot.visible = true;
}

// ---------- DEPOT: RO plant, left-third deewaar, tin chhat, kaala tank ----------
{
  const S = depotG;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 34), lam({ map: tex(wetConcrete(17), 8, 8), color: 0x8fa3b0 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, 3); S.add(ground);
  const tileFloor = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 4.5), lam({ map: tex(tiles(52), 3, 2), color: 0xe0f2fe }));
  tileFloor.rotation.x = -Math.PI / 2; tileFloor.position.set(2.2, 0.0, -2.4); S.add(tileFloor);
  // puddles (geeli zameen)
  [[-1.0, 0.6, 0.9], [2.8, 1.4, 1.2], [-4.2, 2.2, 0.7]].forEach(([px, pz, pr]) => {
    const pd = new THREE.Mesh(new THREE.CircleGeometry(pr, 20), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.32, depthWrite: false }));
    pd.rotation.x = -Math.PI / 2; pd.position.set(px, 0.012, pz); S.add(pd);
  });
  // depot deewaar LEFT-THIRD (x=-2.2), teal
  const dwall = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 3.9), lam({ map: tex(plaster(41, 38), 2, 1), color: 0x0f766e }));
  dwall.position.set(-2.2, 1.95, -4.3); S.add(dwall);
  for (const px of [-4.6, 0.2]) {
    const pil = box(0.28, 3.3, 0.28, lam({ color: 0xf8fafc })); pil.position.set(px, 1.65, -3.3); S.add(pil);
  }
  // tin chhat + kaala paani tank upar
  const roof = box(5.6, 0.12, 2.4, lam({ map: tex(tinRoof(53), 2, 1), color: 0x134e4a })); roof.position.set(-2.2, 3.5, -3.3); S.add(roof);
  const roofEdge = box(5.6, 0.1, 0.08, lam({ color: 0x14b8a6 })); roofEdge.position.set(-2.2, 3.44, -2.12); S.add(roofEdge);
  const tank = cyl(0.55, 0.55, 0.9, lam({ color: 0x1e293b }), 16); tank.position.set(-3.6, 4.0, -3.6); S.add(tank);
  const tankPipe = cyl(0.05, 0.05, 1.1, lam({ color: 0x475569 }), 8); tankPipe.position.set(-3.6, 3.4, -3.6); S.add(tankPipe);
  // deewaar par hand-painted sign (board nahi — seedha deewaar par likha)
  const depotSign = boardMesh(2.6, 0.45, textBoard(768, 132, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#f8fafc'; g.font = 'bold 72px "Comic Sans MS", cursive'; g.textAlign = 'center';
    g.fillText('DEEPAK PAANI SEVA', w / 2, 88);
  }), true); depotSign.position.set(-2.2, 3.12, -4.24); S.add(depotSign);
  // RO PLANT right: neele drums + steel tank + pipes + nal
  [[1.8, -3.4], [2.7, -3.6], [3.6, -3.4]].forEach(([dx, dz]) => {
    const dr = cyl(0.42, 0.42, 1.1, lam({ color: 0x0369a1 }), 16); dr.position.set(dx, 0.55, dz); S.add(dr);
    const lid = cyl(0.44, 0.44, 0.06, lam({ color: 0x075985 }), 16); lid.position.set(dx, 1.13, dz); S.add(lid);
  });
  const steelTank = cyl(0.55, 0.55, 1.7, lam({ color: 0xcbd5e1 }), 16); steelTank.position.set(2.7, 0.85, -4.15); S.add(steelTank);
  const pipeH = cyl(0.05, 0.05, 2.2, lam({ color: 0x94a3b8 }), 8); pipeH.rotation.z = Math.PI / 2; pipeH.position.set(2.7, 1.5, -3.9); S.add(pipeH);
  const pipeV = cyl(0.05, 0.05, 1.0, lam({ color: 0x94a3b8 }), 8); pipeV.position.set(1.7, 1.0, -3.9); S.add(pipeV);
  const tap = cyl(0.04, 0.04, 0.3, lam({ color: 0x475569 }), 8); tap.rotation.z = Math.PI / 2; tap.position.set(1.55, 1.35, -3.5); S.add(tap);
  // peeche ki buildings (depth) — teal/pastel, Sona ke rang nahi
  const bgCols = [0x99f6e4, 0xfde68a, 0xe0f2fe, 0xccfbf1];
  [[-9, -9.5, 5, 7], [-3.5, -10, 4, 5.5], [4, -10.5, 5, 8], [9.5, -9, 4, 6]].forEach(([bx, bz, bw, bh], i) => {
    const b = box(bw, bh, 0.5, lam({ color: bgCols[i] })); b.position.set(bx, bh / 2, bz); S.add(b);
    for (let r = 0; r < Math.floor(bh / 1.3); r++) for (let cix = 0; cix < Math.floor(bw / 1.1); cix++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.7), bas({ color: 0x134e4a }));
      win.position.set(bx - bw / 2 + 0.8 + cix * 1.1, 1 + r * 1.3, bz + 0.27); S.add(win);
    }
  });
  const t1 = mkTree(-5.6, -3.4, 1.1); S.add(t1); depotTrees.push(t1);
  const t2 = mkTree(5.9, -3.2, 0.9); S.add(t2); depotTrees.push(t2);
}

// ---------- STREET: geeli sadak, puddles, ghar facades, lamp ----------
{
  const S = streetG;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 34), lam({ map: tex(wetConcrete(19), 8, 8), color: 0x8fa3b0 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, 3); S.add(ground);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(40, 3.4), lam({ color: 0x334155 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, 1.8); S.add(road);
  for (let i = 0; i < 8; i++) {
    const dash = box(1.1, 0.012, 0.14, bas({ color: 0xe2e8f0 }));
    dash.position.set(-14 + i * 4, 0.008, 1.8); S.add(dash);
  }
  // paani ki patli dhaar + puddles sadak par
  const stream = new THREE.Mesh(new THREE.PlaneGeometry(9, 0.5), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.3, depthWrite: false }));
  stream.rotation.x = -Math.PI / 2; stream.position.set(1.5, 0.012, 0.7); S.add(stream);
  [[-3.5, 2.6, 1.0], [4.5, 1.0, 0.8]].forEach(([px, pz, pr]) => {
    const pd = new THREE.Mesh(new THREE.CircleGeometry(pr, 20), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.32, depthWrite: false }));
    pd.rotation.x = -Math.PI / 2; pd.position.set(px, 0.012, pz); S.add(pd);
  });
  // ghar facades (3 alag rang)
  [[-4.4, 3.0, 0xfde68a, 3.2], [0.4, 2.6, 0xe0f2fe, 3.0], [4.8, 3.2, 0xccfbf1, 3.4]].forEach(([hx, hh, col, hw]) => {
    const f = box(hw, hh, 0.4, lam({ color: col })); f.position.set(hx, hh / 2, -4.2); S.add(f);
    const d = box(0.9, 1.8, 0.1, lam({ color: 0x0f766e })); d.position.set(hx - 0.6, 0.9, -3.95); S.add(d);
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.9), bas({ color: 0xbae6fd })); w.position.set(hx + 0.8, 1.9, -3.95); S.add(w);
  });
  const pole = cyl(0.045, 0.055, 3.2, lam({ color: 0x39434c })); pole.position.set(2.9, 1.6, -1.1); S.add(pole);
  const armLamp = cyl(0.035, 0.035, 0.8, lam({ color: 0x39434c })); armLamp.rotation.z = Math.PI / 2.3; armLamp.position.set(2.58, 3.15, -1.1); S.add(armLamp);
  const bg1 = box(6, 6, 0.5, lam({ color: 0x99f6e4 })); bg1.position.set(-8, 3, -9.5); S.add(bg1);
  const bg2 = box(5, 7.5, 0.5, lam({ color: 0xfde68a })); bg2.position.set(8.5, 3.75, -9); S.add(bg2);
  const t1 = mkTree(-6.2, -3.6, 1.05); S.add(t1); streetTrees.push(t1);
  const t2 = mkTree(6.4, -3.4, 0.9); S.add(t2); streetTrees.push(t2);
}

// ---------- HOME: ghar ka darwaza (peela ghar, teal darwaza) ----------
{
  const S = homeG;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 34), lam({ map: tex(wetConcrete(23), 8, 8), color: 0x94a3b8 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, 3); S.add(ground);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 3.6), lam({ map: tex(plaster(43, 40), 2, 1), color: 0xfde68a }));
  wall.position.set(0, 1.8, -3.8); S.add(wall);
  const door = box(1.1, 2.2, 0.12, lam({ color: 0x0f766e })); door.position.set(-0.8, 1.1, -3.7); S.add(door);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), lam({ color: 0xfacc15 })); knob.position.set(-0.4, 1.1, -3.62); S.add(knob);
  const step1 = box(1.5, 0.14, 0.5, lam({ color: 0x94a3b8 })); step1.position.set(-0.8, 0.07, -3.3); S.add(step1);
  const step2 = box(1.3, 0.14, 0.35, lam({ color: 0x64748b })); step2.position.set(-0.8, 0.2, -3.45); S.add(step2);
  const win = box(1.0, 1.0, 0.1, lam({ color: 0xbae6fd })); win.position.set(1.6, 2.0, -3.72); S.add(win);
  const winBar = box(0.06, 1.0, 0.12, lam({ color: 0x134e4a })); winBar.position.set(1.6, 2.0, -3.7); S.add(winBar);
  const houseNo = boardMesh(0.5, 0.5, textBoard(256, 256, (g, w, h) => {
    g.fillStyle = '#0f766e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f8fafc'; g.font = 'bold 150px Arial'; g.textAlign = 'center'; g.fillText('12', w / 2, 190);
  }), true); houseNo.position.set(-0.8, 2.62, -3.72); S.add(houseNo);
  const mat = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.7), lam({ color: 0x92400e }));
  mat.rotation.x = -Math.PI / 2; mat.position.set(-0.8, 0.015, -2.9); S.add(mat);
  const bucket = cyl(0.22, 0.18, 0.3, lam({ color: 0x0369a1 }), 12); bucket.position.set(0.6, 0.15, -3.0); S.add(bucket);
  const ghada = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), lam({ color: 0xb45309 })); ghada.scale.y = 1.15; ghada.position.set(1.1, 0.3, -3.1); S.add(ghada);
  const pot = cyl(0.16, 0.12, 0.3, lam({ color: 0xb45309 })); pot.position.set(2.5, 0.15, -3.2); S.add(pot);
  const plantBall = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), lam({ color: 0x3e7d32 })); plantBall.position.set(2.5, 0.62, -3.2); S.add(plantBall);
}

// ---------- GATE: office gate + guard booth + 4 towers (alag rang) ----------
{
  const S = gateG;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(46, 34), lam({ map: tex(wetConcrete(29), 8, 8), color: 0x64748b }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, 3); S.add(ground);
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), lam({ color: 0x1e293b }));
  plaza.rotation.x = -Math.PI / 2; plaza.position.set(0, 0.01, -2.5); S.add(plaza);
  for (let i = 0; i < 4; i++) {
    const ln = box(0.08, 0.012, 5.5, bas({ color: 0xf8fafc }));
    ln.position.set(-4.5 + i * 3, 0.015, -2.5); S.add(ln);
  }
  for (const px of [-1.6, 1.6]) {
    const pil = box(0.5, 3.2, 0.5, lam({ color: 0xf8fafc })); pil.position.set(px, 1.6, -4.0); S.add(pil);
    const capT = box(0.58, 0.18, 0.58, lam({ color: 0x0f766e })); capT.position.set(px, 3.28, -4.0); S.add(capT);
  }
  for (let i = 0; i < 6; i++) {
    const bar = cyl(0.035, 0.035, 2.2, lam({ color: 0x1e293b }), 8);
    bar.position.set(-1.25 + i * 0.5, 1.1, -4.0); S.add(bar);
  }
  const gateRail = box(3.0, 0.08, 0.06, lam({ color: 0x1e293b })); gateRail.position.set(0, 2.2, -4.0); S.add(gateRail);
  const booth = box(1.2, 2.4, 1.2, lam({ color: 0x0f766e })); booth.position.set(2.8, 1.2, -4.6); S.add(booth);
  const boothWin = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.7), bas({ color: 0xfde68a })); boothWin.position.set(2.8, 1.7, -3.98); S.add(boothWin);
  // facade (halka teal glass building)
  const facade = new THREE.Mesh(new THREE.PlaneGeometry(14, 7), lam({ map: tex(stone(11), 4, 2), color: 0xe0f2fe }));
  facade.position.set(0, 3.5, -6.5); S.add(facade);
  for (let r = 0; r < 4; r++) for (let cix = 0; cix < 10; cix++) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.0), bas({ color: (r + cix) % 3 === 0 ? 0xfde68a : 0xbae6fd }));
    win.position.set(-5.4 + cix * 1.2, 1.6 + r * 1.5, -6.45); S.add(win);
  }
  const gateSign = boardMesh(3.0, 0.5, textBoard(1024, 170, (g, w, h) => {
    g.fillStyle = '#0f766e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f8fafc'; g.font = 'bold 88px "Arial Narrow", Arial'; g.textAlign = 'center';
    g.fillText('4 TOWERS • OFFICE', w / 2, 112);
  }), true); gateSign.position.set(0, 3.6, -6.4); S.add(gateSign);
  // 4 TOWERS — ek teal glass, ek safed, ek peela accent, ek halka teal
  const towerCols = [0x0f766e, 0xf8fafc, 0xfacc15, 0x14b8a6];
  [[-6, 11], [-2, 13], [2, 12], [6, 14]].forEach(([tx, th], i) => {
    const tw = box(2.6, th, 2.0, lam({ color: towerCols[i] })); tw.position.set(tx, th / 2, -10); S.add(tw);
    for (let r = 0; r < Math.floor(th / 1.4); r++) for (let cix = 0; cix < 2; cix++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.8), bas({ color: (r + cix) % 2 === 0 ? 0xfde68a : 0x134e4a }));
      win.position.set(tx - 0.6 + cix * 1.2, 1.2 + r * 1.4, -8.95); S.add(win);
    }
  });
}

// ---------- LOBBY: reception, glass deewaar, lift ----------
{
  const S = lobbyG;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), lam({ map: tex(tiles(57), 4, 4), color: 0xe0f2fe }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, 0); S.add(ground);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(12, 5), lam({ map: tex(plaster(47, 45), 2, 1), color: 0xf8fafc }));
  wall.position.set(0, 2.5, -6.0); S.add(wall);
  // glass deewaar (peeche)
  const glassWall = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 3.0), new THREE.MeshBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.4, depthWrite: false }));
  glassWall.position.set(-1.8, 1.9, -5.9); S.add(glassWall);
  const glassFrame = box(5.7, 0.1, 0.06, lam({ color: 0x134e4a })); glassFrame.position.set(-1.8, 3.45, -5.9); S.add(glassFrame);
  // reception desk (teal, gol nahi — L-shape jaisa chauda)
  const recep = box(2.6, 1.0, 0.8, lam({ color: 0x0f766e })); recep.position.set(0, 0.5, -4.2); S.add(recep);
  const recepTop = box(2.8, 0.06, 1.0, lam({ color: 0xf8fafc })); recepTop.position.set(0, 1.03, -4.2); S.add(recepTop);
  const recepSide = box(0.9, 1.0, 0.7, lam({ color: 0x14b8a6 })); recepSide.position.set(1.7, 0.5, -4.0); S.add(recepSide);
  // latakte lamp
  for (const lx of [-1.2, 1.2]) {
    const cord = cyl(0.015, 0.015, 0.9, lam({ color: 0x1e293b }), 6); cord.position.set(lx, 3.6, -4.4); S.add(cord);
    const shade = cyl(0.22, 0.3, 0.22, lam({ color: 0xfacc15 }), 12); shade.position.set(lx, 3.1, -4.4); S.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), lam({ color: 0xfff7cc })); bulb.position.set(lx, 2.95, -4.4); S.add(bulb);
  }
  // lift doors
  const lift = box(1.4, 2.6, 0.15, lam({ color: 0xcbd5e1 })); lift.position.set(3.2, 1.3, -5.9); S.add(lift);
  const liftSlit = box(0.05, 2.6, 0.02, lam({ color: 0x475569 })); liftSlit.position.set(3.2, 1.3, -5.81); S.add(liftSlit);
  const plantPot = cyl(0.16, 0.12, 0.3, lam({ color: 0xb45309 })); plantPot.position.set(-2.6, 0.15, -5.2); S.add(plantPot);
  const plantBall = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), lam({ color: 0x3e7d32 })); plantBall.position.set(-2.6, 0.62, -5.2); S.add(plantBall);
  // deewaar art — teal square, safed boond
  const art = boardMesh(0.9, 0.9, textBoard(256, 256, (g, w, h) => {
    g.fillStyle = '#0f766e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#5eead4'; g.beginPath(); g.arc(128, 128, 70, 0, 7); g.fill();
    g.fillStyle = '#f8fafc'; g.font = 'bold 90px Arial'; g.textAlign = 'center'; g.fillText('₹', 128, 160);
  }), true); art.position.set(-3.6, 2.4, -5.9); S.add(art);
}

// =====================================================================
// PROPS — jar, jarstack, tempo, note, diesel can, toota jar, paani ki boond
// =====================================================================
function mkJar(s = 1) {
  const g = new THREE.Group(); g.scale.setScalar(s);
  const bodyMat = lam({ color: 0x06b6d4, transparent: true, opacity: 0.94 });
  const body = cyl(0.14, 0.15, 0.42, bodyMat, 16); body.position.y = 0.21; g.add(body);
  const water = cyl(0.12, 0.13, 0.34, lam({ color: 0xa5f3fc }), 16); water.position.y = 0.19; g.add(water);
  const neck = cyl(0.06, 0.09, 0.08, bodyMat, 12); neck.position.y = 0.46; g.add(neck);
  const cap = cyl(0.07, 0.07, 0.05, lam({ color: 0x0e7490 }), 12); cap.position.y = 0.52; g.add(cap);
  const label = boardMesh(0.2, 0.1, textBoard(256, 128, (gg, w, h) => {
    gg.fillStyle = '#ffffff'; gg.fillRect(0, 0, w, h);
    gg.fillStyle = '#0e7490'; gg.font = 'bold 64px Arial'; gg.textAlign = 'center';
    gg.fillText('20 L', w / 2, 86);
  }), true); label.position.set(0, 0.22, 0.145); g.add(label);
  return g;
}
const heroJar = mkJar(1.0); scene.add(heroJar); heroJar.visible = false;
const jarSpin = mkJar(1.15); scene.add(jarSpin); jarSpin.visible = false;
function mkJarStack(x, z, parent) {
  const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
  const spots = [[-0.32, 0], [0, 0], [0.32, 0], [-0.16, 0.46], [0.16, 0.46], [0, 0.92]];
  spots.forEach(([dx, dy], i) => {
    const j = mkJar(0.9); j.position.set(dx, dy, (i % 2) * 0.06 - 0.03); j.rotation.y = i * 0.8; g.add(j);
  });
  return g;
}
const stackDepot = mkJarStack(1.35, -3.0, depotG);
const stackGate = mkJarStack(0.9, -4.8, gateG);

// ---------- JAR COUNT STACK (visual counting: 50 / 150) ----------
const countStack = new THREE.Group(); countStack.visible = false; scene.add(countStack);
const countJars = [];
{
  const rows = [5, 4, 3, 2, 1];
  rows.forEach((n, r) => {
    for (let i = 0; i < n; i++) {
      const j = mkJar(0.62);
      j.position.set((i - (n - 1) / 2) * 0.29, r * 0.32, 0);
      countStack.add(j); countJars.push(j);
    }
  });
}
const countCanvas = document.createElement('canvas'); countCanvas.width = 512; countCanvas.height = 256;
const countTex = new THREE.CanvasTexture(countCanvas); countTex.colorSpace = THREE.SRGBColorSpace;
const countLabel = boardMesh(1.3, 0.65, countTex, true);
countLabel.position.set(0, 1.55, 0); countStack.add(countLabel);
let countKey = '';
function setStackCount(n, label, x, z) {
  countStack.visible = true;
  countStack.position.set(x, 0, z);
  countJars.forEach((j, i) => { j.visible = i < n; });
  let rem = n, rowsUsed = 0;
  for (const rn of [5, 4, 3, 2, 1]) { if (rem <= 0) break; rowsUsed++; rem -= rn; }
  countLabel.position.y = (rowsUsed - 1) * 0.32 + 1.0;
  if (label !== countKey) {
    countKey = label;
    const g = countCanvas.getContext('2d');
    g.fillStyle = '#0f766e'; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = '#f8fafc'; g.lineWidth = 4; g.strokeRect(10, 10, 492, 236);
    g.fillStyle = '#f8fafc'; g.textAlign = 'center';
    g.font = label.length > 10 ? 'bold 58px Arial' : 'bold 84px Arial';
    g.fillText(label, 256, 150);
    countTex.needsUpdate = true;
  }
}

// ---- TEMPO (delivery gaadi) — peela #facc15 + teal stripe; side paint dynamic ----
// tempo side paint (canvas): s02 "₹60,000 MAHINA", s17 "50 GHAR = ₹400", default "DEEPAK PAANI SEVA"
const tempoSideCanvas = document.createElement('canvas'); tempoSideCanvas.width = 768; tempoSideCanvas.height = 160;
const tempoSideTex = new THREE.CanvasTexture(tempoSideCanvas); tempoSideTex.colorSpace = THREE.SRGBColorSpace; tempoSideTex.anisotropy = 4;
let tempoSideKey = '';
function setTempoSide(txt) {
  if (txt === tempoSideKey) return; tempoSideKey = txt;
  const g = tempoSideCanvas.getContext('2d');
  g.fillStyle = '#facc15'; g.fillRect(0, 0, 768, 160);
  g.fillStyle = '#0f766e'; g.font = 'bold 62px "Arial Narrow", Arial'; g.textAlign = 'center';
  g.fillText(txt, 384, 102);
  tempoSideTex.needsUpdate = true;
}
setTempoSide('DEEPAK PAANI SEVA');
const tempoG = new THREE.Group(); scene.add(tempoG);
let tempoWheels = [];
{
  const bed = box(2.6, 0.12, 1.5, lam({ color: 0xfacc15 })); bed.position.set(0, 0.55, 0); tempoG.add(bed);
  const stripe = box(2.62, 0.14, 0.06, lam({ color: 0x0f766e })); stripe.position.set(0, 0.55, 0.76); tempoG.add(stripe);
  const stripe2 = box(2.62, 0.14, 0.06, lam({ color: 0x0f766e })); stripe2.position.set(0, 0.55, -0.76); tempoG.add(stripe2);
  const cab = box(0.9, 0.85, 1.4, lam({ color: 0xfacc15 })); cab.position.set(1.55, 0.95, 0); tempoG.add(cab);
  const cabStripe = box(0.92, 0.12, 1.42, lam({ color: 0x0f766e })); cabStripe.position.set(1.55, 0.75, 0); tempoG.add(cabStripe);
  const shield = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.5), new THREE.MeshBasicMaterial({ color: 0x9fd4e8, transparent: true, opacity: 0.75, depthWrite: false }));
  shield.position.set(2.01, 1.1, 0); shield.rotation.y = Math.PI / 2; tempoG.add(shield);
  const sideBoard = boardMesh(1.9, 0.4, tempoSideTex, true); sideBoard.position.set(-0.2, 0.85, 0.76); tempoG.add(sideBoard);
  const wheelMat = lam({ color: 0x1c222a });
  [[1.5, 0.78], [1.5, -0.78], [-1.0, 0.78], [-1.0, -0.78]].forEach(([wx, wz]) => {
    const wh = new THREE.Group(); wh.position.set(wx, 0.32, wz); tempoG.add(wh);
    const tyre = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.09, 8, 18), wheelMat);
    tyre.rotation.y = Math.PI / 2; wh.add(tyre);
    const hub = cyl(0.12, 0.12, 0.06, lam({ color: 0x9aa2a9 }), 10); hub.rotation.x = Math.PI / 2; wh.add(hub);
    tempoWheels.push(wh);
  });
  for (let i = 0; i < 6; i++) {
    const j = mkJar(0.85);
    j.position.set(-1.0 + (i % 3) * 0.55, 0.61, (i < 3 ? 0.35 : -0.35));
    tempoG.add(j);
  }
  tempoG.visible = false;
}
// TARP — s28 me tempo dhaka (reveal leak band): tempo ka child, bed ke upar
const tarpGroup = new THREE.Group(); tarpGroup.visible = false; tempoG.add(tarpGroup);
{
  const t = box(2.5, 0.3, 1.5, lam({ color: 0x0f766e })); t.position.set(-0.2, 1.05, 0); tarpGroup.add(t);
  const r = box(2.52, 0.05, 0.08, lam({ color: 0xfacc15 })); r.position.set(-0.2, 1.21, 0); tarpGroup.add(r);
}
const headlightMat = new THREE.SpriteMaterial({ map: FX.puffTexture([[0, 'rgba(255,244,200,0.95)'], [1, 'rgba(255,244,200,0)']]), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const headGlowL = new THREE.Sprite(headlightMat); headGlowL.scale.setScalar(0.7); scene.add(headGlowL);
const headGlowR = new THREE.Sprite(headlightMat.clone()); headGlowR.scale.setScalar(0.7); scene.add(headGlowR);
// ---- NOTE (₹20/₹30) ----
const noteProp = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.008, 0.09), lam({ color: 0x15803d }));
noteProp.visible = false; scene.add(noteProp);
const noteStack = new THREE.Group(); scene.add(noteStack);
{
  const noteMat = lam({ color: 0x15803d });
  for (let i = 0; i < 5; i++) { const n = box(0.17, 0.012, 0.095, noteMat); n.position.y = i * 0.013; n.rotation.y = (i - 2) * 0.05; noteStack.add(n); }
  const band = box(0.05, 0.075, 0.1, lam({ color: 0xf2ead8 })); band.position.y = 0.026; noteStack.add(band);
  noteStack.visible = false;
}
// ---- DIESEL CAN (laal jerrycan) ----
const dieselG = new THREE.Group(); scene.add(dieselG);
{
  const can = box(0.24, 0.32, 0.13, lam({ color: 0x475569 })); can.position.y = 0.16; dieselG.add(can);
  const canCap = cyl(0.035, 0.035, 0.05, lam({ color: 0xfacc15 }), 8); canCap.position.set(-0.08, 0.34, 0); dieselG.add(canCap);
  const spout = cyl(0.02, 0.03, 0.16, lam({ color: 0x39434c })); spout.rotation.z = 0.7; spout.position.set(0.14, 0.34, 0); dieselG.add(spout);
  const handle = box(0.14, 0.03, 0.03, lam({ color: 0x39434c })); handle.position.set(0, 0.34, 0); dieselG.add(handle);
  dieselG.visible = false;
}
// ---- TOOTA JAR (side me gira + paani ka talab) ----
const brokenJarG = new THREE.Group(); scene.add(brokenJarG);
{
  const bj = mkJar(0.9); bj.rotation.z = Math.PI / 2 - 0.12; bj.position.set(0, 0.14, 0); brokenJarG.add(bj);
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(0.42, 20), new THREE.MeshBasicMaterial({ color: 0x7ec8f0, transparent: true, opacity: 0.55, depthWrite: false }));
  puddle.rotation.x = -Math.PI / 2; puddle.position.y = 0.015; brokenJarG.add(puddle);
  brokenJarG.visible = false;
}
// ---- PAANI KI BOOND (girti + splash) ----
const dropSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: FX.puffTexture([[0, 'rgba(126,200,240,1)'], [1, 'rgba(126,200,240,0)']]), transparent: true, opacity: 0, depthWrite: false }));
dropSprite.scale.set(0.16, 0.3, 1); scene.add(dropSprite);
const splashRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.02, 8, 24), bas({ color: 0x7ec8f0, transparent: true, opacity: 0 }));
splashRing.rotation.x = -Math.PI / 2; scene.add(splashRing);
// glint: sirf jar chamak (board glint/glow hatao — C2)
const glintJar = mkGlint(0, 1.2, -1.9, 0.5);
// DIESEL BILL (s37): receipt kagaz — diesel can repeat nahi
const receiptCanvas = document.createElement('canvas'); receiptCanvas.width = 256; receiptCanvas.height = 384;
{
  const g = receiptCanvas.getContext('2d');
  g.fillStyle = '#fef9c3'; g.fillRect(0, 0, 256, 384);
  g.fillStyle = '#134e4a'; g.textAlign = 'center';
  g.font = 'bold 40px Arial'; g.fillText('DIESEL BILL', 128, 60);
  g.strokeStyle = '#134e4a'; g.lineWidth = 3; g.beginPath(); g.moveTo(24, 80); g.lineTo(232, 80); g.stroke();
  g.font = 'bold 64px Arial'; g.fillText('₹120', 128, 170);
  g.font = 'bold 32px Arial'; g.fillText('10 LITRE', 128, 220);
  g.fillStyle = '#b91c1c'; g.font = 'bold 52px Arial'; g.fillText('PAID', 128, 300);
  g.strokeStyle = '#b91c1c'; g.lineWidth = 4; g.strokeRect(52, 256, 152, 66);
}
const receiptTex = new THREE.CanvasTexture(receiptCanvas); receiptTex.colorSpace = THREE.SRGBColorSpace;
const receiptMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.75), lam({ map: receiptTex }));
receiptMesh.visible = false; scene.add(receiptMesh);
// ₹9 TAG (s14b): ghise jar par chipka number
const tag9Canvas = document.createElement('canvas'); tag9Canvas.width = 256; tag9Canvas.height = 256;
{
  const g = tag9Canvas.getContext('2d');
  g.fillStyle = '#0f766e'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
  g.fillStyle = '#f8fafc'; g.font = 'bold 120px Arial'; g.textAlign = 'center'; g.fillText('₹9', 128, 168);
}
const tag9Tex = new THREE.CanvasTexture(tag9Canvas); tag9Tex.colorSpace = THREE.SRGBColorSpace;
const tag9 = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshBasicMaterial({ map: tag9Tex, transparent: true, depthWrite: false }));
tag9.visible = false; scene.add(tag9);

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
function driveTempo(x, z, rotY, f) {
  tempoG.visible = true;
  tempoG.position.set(x, 0, z);
  tempoG.rotation.y = rotY;
  tempoWheels.forEach((w) => { w.rotation.x = f * 0.3; });
}
window.renderFrame = (f) => {
  const shot = shotAt(f), u = shot.u, id = shot.id;
  const isMap = (id === 's09' || id === 's19' || id === 's30');
  const cam = camFor(shot, u);
  camera.position.set(...cam.pos); camera.lookAt(...cam.look);
  camera.fov = cam.fov; camera.updateProjectionMatrix();
  if (cam.roll) camera.rotateZ(cam.roll * Math.PI / 180);
  // handheld shake — sirf tempo-driving shot s20 me ±0.03 (s29 tempo rukti hai)
  if (id === 's20') {
    camera.position.x += Math.sin(f * 1.3) * 0.03;
    camera.position.y += Math.cos(f * 1.7) * 0.03;
  }
  const env = applyEnv(shot.env);
  for (const k in skyMeshes) skyMeshes[k].visible = (k === env.sky);
  clouds.forEach((sp, i) => {
    sp.visible = !isMap;
    sp.position.x = -22 + i * 7.5 + Math.sin(f * 0.004 + i) * 0.6;
  });
  ALL_CARDS.forEach((c) => c.hide());
  const cp = cam.pos;
  // ---- set visibility ----
  depotG.visible = (shot.set === 'depot');
  streetG.visible = (shot.set === 'street' && !isMap);
  homeG.visible = (shot.set === 'home');
  gateG.visible = (shot.set === 'gate' && !isMap);
  lobbyG.visible = (shot.set === 'lobby');
  mapGroup.visible = isMap;
  lampHead.visible = !isMap; lampBulb.visible = !isMap;
  // ---- numbers as objects: tempo side paint + board toggles (max 2 boards) ----
  let tempoSide = 'DEEPAK PAANI SEVA';
  if (id === 's01') tempoSide = '₹60,000 MAHINA';
  if (id === 's17') tempoSide = '50 GHAR = ₹400';
  if (id === 's34') tempoSide = '150 JAR = ₹2,700';
  setTempoSide(tempoSide);
  chalkBoard.visible = (id === 's15');
  wallSign.visible = (id === 's40');
  glassNote.visible = (id === 's23');
  // SAFAR-MAP route progress: s09 30% / s19 65% / s30 100%
  if (id === 's09') setRoute(0.3);
  else if (id === 's19') setRoute(0.65);
  else if (id === 's30') setRoute(1.0);
  // ---- hamesha zinda background: ped hilte, depot me nal tapakta (cases me) ----
  depotTrees.forEach((t, i) => { t.rotation.z = Math.sin(f * 0.03 + i * 1.7) * 0.018; });
  streetTrees.forEach((t, i) => { t.rotation.z = Math.sin(f * 0.03 + i * 2.3) * 0.018; });
  // glints / glow / props default band
  glintJar.material.opacity = 0;
  setNightLamp(false, f);
  heroJar.visible = false; jarSpin.visible = false;
  heroJar.rotation.set(0, 0, 0); heroJar.scale.setScalar(1);
  tempoG.visible = false; noteProp.visible = false; noteStack.visible = false;
  dieselG.visible = false; brokenJarG.visible = false;
  dropSprite.material.opacity = 0; splashRing.material.opacity = 0;
  dropletTag.visible = false; coinPile.visible = false; coinPile.scale.setScalar(1);
  countStack.visible = false; stackGate.visible = (id !== 's31');
  tarpGroup.visible = false; receiptMesh.visible = false; tag9.visible = false;
  const fl = FLASH[id];
  flashPlane.material.opacity = fl ? Math.max(0, 1 - Math.abs(f - fl.at) / (fl.dur / 2)) : 0;
  headGlowL.material.opacity = 0; headGlowR.material.opacity = 0;
  // tempo: sirf jis shot me chahiye wahi driveTempo() bulata hai (default chhupa)



  switch (id) {
    case 's01': { // ANCHOR (2.53s): low-angle tempo tracking → Deepak closeup, tempo side "₹60,000 MAHINA"
      driveTempo(-5.5 + 5.0 * M.easeInOut(u), 1.2, 0, f);
      drawChar(deepakCard, 41, DEEPAK, 'grin', 'reach', 'hang', f, cp, -2.2, 0, 0.4, 1.05, 0, 0.5, 0, ENV[f]);
      heroJar.visible = true;
      heroJar.position.set(-2.6, 0.85, 0.3);
      drawWalk(w1Card, 46, WALK1, 'neutral', f, cp, 3.5, -1.5, 0.5, -1.2, clamp(u * 0.9), 0.9);
      break;
    }
    case 's03': { // Jar ECU nal ke neeche, droplet label ₹3
      heroJar.visible = true;
      heroJar.position.set(0.1, 1.06, -2.6);
      dropletTag.visible = true;
      dropletTag.position.set(0.32, 1.18, -2.45);
      const du = clamp(u / 0.7);
      dropSprite.material.opacity = u < 0.7 ? 0.9 : 0;
      dropSprite.position.set(0.1, 2.0 - du * 0.65, -2.45);
      if (u > 0.65) {
        const su = (u - 0.65) / 0.35;
        splashRing.material.opacity = (1 - su) * 0.7;
        splashRing.scale.setScalar(0.5 + su * 1.6);
        splashRing.position.set(0.1, 1.32, -2.45);
      }
      glintJar.position.set(0.1, 1.35, -2.4); glintJar.material.opacity = 0.4 + 0.3 * Math.sin(f * 0.3);
      drawWalk(workerCard, 49, WORKER, 'neutral', f, cp, 3.2, -2.6, 1.8, -3.0, clamp(u * 0.9), 0.95);
      break;
    }
    case 's04': { // MICRO 0.27s: Deepak smile, peeche tempo
      driveTempo(-3.5, 0.8, 0.3, f);
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'hang', 'hang', f, cp, -0.9, 0, -1.0, 1.08, 0, null, 0, ENV[f]);
      drawChar(ladkaCard, 44, LADKA, 'smile', 'hang', 'hang', f, cp, 0.6, 0, -2.4, 0.95);
      break;
    }
    case 's05': { // "Iska naam Deepak hai" — depot gate par haath hilata (SPEAK)
      drawChar(deepakCard, 41, DEEPAK, 'grin', 'up', 'hang', f, cp, -2.2, 0, -2.4, 1.1, 0, 0.8, 0, ENV[f]);
      drawChar(workerCard, 49, WORKER, 'smile', 'hang', 'hang', f, cp, 2.4, 0, -3.0, 0.95);
      drawWalk(w2Card, 47, WALK2, 'neutral', f, cp, 1.0, -1.0, -0.5, -1.4, clamp(u * 0.9), 0.9);
      break;
    }
    case 's06': { // Jar ghumta "20 LITRE", worker jar bharta
      jarSpin.visible = true;
      jarSpin.position.set(0.2, 1.06, -2.5);
      jarSpin.rotation.y = f * 0.06;
      glintJar.position.set(0.2, 1.35, -2.3); glintJar.material.opacity = 0.5 + 0.3 * Math.sin(f * 0.35);
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'hang', 'hang', f, cp, -0.9, 0, -1.6, 0.98);
      drawChar(workerCard, 49, WORKER, 'smile', 'reach', 'hang', f, cp, 1.6, 0, -2.8, 0.95);
      break;
    }
    case 's07': { // OVER-THE-SHOULDER: Deepak darwaze par jar deta, RIVAL hansta
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'reach', 'hang', f, cp, -1.5, 0, -2.7, 1.02, 0, 0.5, 0);
      drawChar(w1Card, 46, WALK1, 'smile', 'hang', 'hang', f, cp, -0.35, 0, -3.15, 0.97);
      drawChar(rivalCard, 48, RIVAL, 'laugh', 'hang', 'hang', f, cp, -1.9, 0, -3.3, 1.0, 0, null, 1);
      heroJar.visible = true;
      heroJar.position.set(-0.9, 0.85, -2.9);
      break;
    }
    case 's08': { // Bhor: tempo headlight ON, Deepak start karta — 'Subah chaar baje' isi shot me
      driveTempo(-4.6, 1.2, 0, f);
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'up', 'hang', f, cp, -2.6, 0, -0.6, 1.04, 0, 0.85, 0);
      headGlowL.material.opacity = 0.55; headGlowR.material.opacity = 0.55;
      headGlowL.position.set(-2.6, 0.72, 0.42); headGlowR.position.set(-2.6, 0.72, 1.98);
      setNightLamp(true, f);
      drawWalk(w2Card, 47, WALK2, 'neutral', f, cp, 3.0, -1.0, 1.0, -1.4, clamp(u * 0.9), 0.9);
      break;
    }
    case 's09': { // SAFAR-MAP #1 (top-down): route line 30%, tempo depot se nikla
      const [hx, hz] = routePoint(0.3);
      driveTempo(hx, -0.6 + hz, Math.PI / 2, f);
      break;
    }
    case 's10': { // Darwazon ki kataar par jar + 50-jar stack + "50 GHAR" tally, RIVAL hansta
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'reach', 'hang', f, cp, -1.5, 0, -2.6, 1.0, 0, 0.5, 0);
      drawChar(rivalCard, 48, RIVAL, 'laugh', 'hang', 'hang', f, cp, 0.0, 0, -3.2, 1.0, 0, null, 1);
      heroJar.visible = true;
      heroJar.position.set(-1.0, 0.85, -2.8);
      setStackCount(10, '50 GHAR', -0.1, -3.0);
      drawWalk(w2Card, 47, WALK2, 'neutral', f, cp, 2.5, 1.4, -2.0, 1.2, clamp(u * 0.9), 0.9);
      break;
    }
    case 's11': { // ₹20 note haath me, darwaze par exchange closeup (benchmark shot)
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'reach', 'hang', f, cp, -0.9, 0, -2.7, 1.02, 0, 0.5, 0);
      drawChar(w1Card, 46, WALK1, 'smile', 'reach', 'hang', f, cp, -0.3, 0, -3.1, 0.98);
      const ue = clamp((u - 0.1) / 0.4);
      noteProp.visible = true;
      noteProp.position.set(-0.4 - 0.3 * ue, 1.05, -2.5);
      noteProp.rotation.set(-Math.PI / 2, 0, 0);
      heroJar.visible = true;
      heroJar.position.set(-0.9, 0.85, -2.8);
      drawWalk(w2Card, 47, WALK2, 'neutral', f, cp, 2.5, 1.2, -1.5, 1.0, clamp(u * 0.9), 0.9);
      break;
    }
    case 's12': { // RO plant: jar dhul kar bharna, paani ki dhaar
      drawChar(workerCard, 49, WORKER, 'neutral', 'belly', 'belly', f, cp, 2.2, 0, -3.0, 1.0);
      heroJar.visible = true;
      heroJar.position.set(1.5, 1.0, -3.3);
      dropSprite.material.opacity = 0.9;
      dropSprite.position.set(1.55, 1.9 - clamp(u / 0.6) * 0.6, -3.3);
      drawWalk(ladkaCard, 44, LADKA, 'neutral', f, cp, -1.5, -1.0, 0.5, -1.4, clamp(u * 0.9), 0.95);
      break;
    }
    case 's13': { // Diesel can tempo par
      driveTempo(-4.5, 1.0, 0.2, f);
      dieselG.visible = true;
      dieselG.position.set(-1.7, 0, -1.2);
      drawChar(deepakCard, 41, DEEPAK, 'neutral', 'belly', 'belly', f, cp, -1.3, 0, -1.6, 1.0);
      drawWalk(w1Card, 46, WALK1, 'neutral', f, cp, 3.0, 0.8, 0.0, 0.6, clamp(u * 0.9), 0.9);
      break;
    }
    case 's14a': { // Dhulai + ghisa jar, toota jar side me
      brokenJarG.visible = true;
      brokenJarG.position.set(1.7, 0, -2.8);
      drawChar(ladkaCard, 44, LADKA, 'neutral', 'belly', 'belly', f, cp, 1.3, 0, -2.5, 1.0);
      heroJar.visible = true;
      heroJar.position.set(1.2, 0.85, -2.5);
      heroJar.rotation.z = Math.sin(f * 0.1) * 0.06;
      drawChar(deepakCard, 41, DEEPAK, 'neutral', 'hang', 'hang', f, cp, 0.5, 0, -2.3, 1.0);
      break;
    }
    case 's14b': { // MICRO 0.17s ₹9-JHATKA: ghisa jar ECU + "₹9" chipka
      tag9.visible = true;
      tag9.position.set(1.5, 1.0, -2.55);
      heroJar.visible = true;
      heroJar.position.set(1.5, 0.85, -2.7);
      heroJar.rotation.z = 0.12;
      drawChar(ladkaCard, 44, LADKA, 'pained', 'belly', 'belly', f, cp, 0.9, 0, -2.4, 1.0);
      break;
    }
    case 's15': { // BOARD #1: vertical chalkboard "₹12" RO plant par
      drawChar(deepakCard, 41, DEEPAK, 'neutral', 'hang', 'hang', f, cp, -2.9, 0, -2.2, 0.95);
      drawWalk(ladkaCard, 44, LADKA, 'neutral', f, cp, 0.0, -1.0, -1.5, -1.4, clamp(u * 0.9), 0.95);
      break;
    }
    case 's16a': { // Hatheli wide: Deepak ₹8 sikke ginta, pained
      drawChar(deepakCard, 41, DEEPAK, 'pained', 'belly', 'belly', f, cp, -0.6, 0, -2.0, 1.12, 0, null, 1, ENV[f]);
      coinPile.visible = true;
      coinPile.position.set(-0.35, 1.05, -2.6);
      drawChar(workerCard, 49, WORKER, 'neutral', 'hang', 'hang', f, cp, 1.8, 0, -2.6, 0.95);
      drawWalk(w1Card, 46, WALK1, 'neutral', f, cp, 2.5, -1.0, 0.5, -1.4, clamp(u * 0.9), 0.9);
      break;
    }
    case 's16b': { // MICRO 0.40s ₹8-ECU: sikke frame bhar
      drawChar(deepakCard, 41, DEEPAK, 'pained', 'belly', 'belly', f, cp, -0.4, 0, -2.5, 1.15, 0, null, 1, ENV[f]);
      coinPile.visible = true;
      coinPile.position.set(-0.4, 1.0, -2.5);
      coinPile.scale.setScalar(1.6);
      break;
    }
    case 's17': { // Tempo side tally "50 GHAR = ₹400"
      driveTempo(-4.5 + 5.0 * M.easeInOut(u), 1.2, 0, f);
      drawChar(deepakCard, 41, DEEPAK, 'pained', 'hang', 'hang', f, cp, -0.3, 0, -1.6, 0.95);
      drawChar(ladkaCard, 44, LADKA, 'neutral', 'hang', 'hang', f, cp, 0.6, 0, -2.2, 0.95);
      drawWalk(w1Card, 46, WALK1, 'neutral', f, cp, 3.0, 0.8, 0.0, 0.6, clamp(u * 0.9), 0.9);
      break;
    }
    case 's18a': { // Deepak doubtful closeup, sar tilt
      const expr = u < 0.5 ? 'pained' : 'neutral';
      drawChar(deepakCard, 41, DEEPAK, expr, 'hang', 'hang', f, cp, -0.6, 0, -1.8, 1.12, 0, null, -2, ENV[f]);
      drawWalk(w1Card, 46, WALK1, 'neutral', f, cp, 2.5, -1.0, 0.0, -1.4, clamp(u * 0.9), 0.9);
      break;
    }
    case 's18b': { // MICRO 0.63s SAWAL-CAMERA: Deepak seedha camera ki taraf, RIVAL hansta
      drawChar(deepakCard, 41, DEEPAK, 'neutral', 'hang', 'hang', f, cp, -0.6, 0, -1.8, 1.12, 0, null, -2, ENV[f]);
      drawChar(rivalCard, 48, RIVAL, 'laugh', 'hang', 'hang', f, cp, 0.6, 0, -2.3, 1.0, 0, null, 1);
      drawWalk(w1Card, 46, WALK1, 'neutral', f, cp, 2.5, -1.0, 0.0, -1.4, clamp(u * 0.9), 0.9);
      break;
    }
    case 's19': { // SAFAR-MAP #2 (top-down): DOPAHAR SHIFT, route line 65%
      const [hx, hz] = routePoint(0.65);
      driveTempo(hx, -0.6 + hz, Math.PI / 2, f);
      break;
    }
    case 's20': { // Tempo office ki taraf, tracking + shake
      driveTempo(-5.5 + 7.0 * M.easeInOut(u), 1.4, 0.3, f);
      drawWalk(w1Card, 46, WALK1, 'neutral', f, cp, -3, 0.6, 3, 0.8, clamp(u * 0.9), 0.9);
      drawWalk(w2Card, 47, WALK2, 'neutral', f, cp, 4.0, -1.0, 1.0, -1.2, clamp(u * 0.9), 0.9);
      break;
    }
    case 's21': { // Jar match-cut spin plant par — "Wahi jar, wahi paani"
      jarSpin.visible = true;
      jarSpin.position.set(0, 1.06, -2.5);
      jarSpin.rotation.y = f * 0.12;
      glintJar.position.set(0, 1.35, -2.3); glintJar.material.opacity = 0.6 + 0.3 * Math.sin(f * 0.4);
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'hang', 'hang', f, cp, -0.9, 0, -1.6, 0.98);
      drawChar(workerCard, 49, WORKER, 'smile', 'reach', 'hang', f, cp, 1.6, 0, -2.8, 0.95);
      break;
    }
    case 's22': { // OFFICE REVEAL (whoosh 22.56s): gate + towers wide
      drawWalk(deepakCard, 41, DEEPAK, 'smile', f, cp, 1.5, -2.0, 0.2, -4.0, u, 1.02, 'hang', 'hang');
      drawChar(guardCard, 45, GUARD, 'neutral', 'hang', 'hang', f, cp, 1.9, 0, -5.0, 0.95);
      drawChar(officeCard, 43, OFFICE, 'smile', 'hang', 'hang', f, cp, -0.8, 0, -4.2, 0.95);
      break;
    }
    case 's23': { // OVER-THE-SHOULDER: reception glass par ₹30, office wala deta (SPEAK)
      drawChar(deepakCard, 41, DEEPAK, 'grin', 'hang', 'hang', f, cp, -0.4, 0, -4.2, 1.0);
      drawChar(officeCard, 43, OFFICE, 'smile', 'reach', 'hang', f, cp, 0.2, 0, -4.8, 1.0, 0, 0.5, 0, ENV[f]);
      const ue = clamp((u - 0.1) / 0.4);
      noteProp.visible = true;
      noteProp.position.set(-0.1 - 0.3 * ue, 1.12, -4.0);
      noteProp.rotation.x = 0;
      noteProp.rotation.y = Math.sin(f * 0.2) * 0.15;
      heroJar.visible = true;
      heroJar.position.set(-0.2, 0.85, -4.0);
      break;
    }
    case 's24': { // Office wala bhav-tol mana karta, thumbs up
      drawChar(officeCard, 43, OFFICE, 'grin', 'up', 'hang', f, cp, 0.2, 0, -4.8, 1.02, 0, 0.85, 0);
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'hang', 'hang', f, cp, -0.5, 0, -2.6, 1.0);
      drawWalk(w2Card, 47, WALK2, 'neutral', f, cp, 2.5, -2.6, 0.5, -3.0, clamp(u * 0.9), 0.9);
      break;
    }
    case 's25': { // Deepak seedha camera se, warm (SPEAK)
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'hang', 'hang', f, cp, -0.5, 0, -2.2, 1.12, 0, null, 0, ENV[f]);
      drawChar(officeCard, 43, OFFICE, 'neutral', 'hang', 'hang', f, cp, 0.7, 0, -4.6, 0.95);
      drawWalk(w1Card, 46, WALK1, 'neutral', f, cp, -2.5, -2.6, 1.5, -3.0, clamp(u * 0.9), 0.9);
      break;
    }
    case 's26': { // REACTION CUTAWAY: office wala sunta hua (neutral→smile_closed) + desk par jar ECU
      const expr = u < 0.5 ? 'neutral' : 'smile_closed';
      drawChar(officeCard, 43, OFFICE, expr, 'hang', 'hang', f, cp, 0.2, 0, -4.6, 1.05, 0, null, 0, ENV[f]);
      heroJar.visible = true;
      heroJar.position.set(0.35, 1.06, -4.0);
      drawWalk(w1Card, 46, WALK1, 'neutral', f, cp, -1.0, -2.5, 1.0, -2.8, clamp(u * 0.9), 0.9);
      break;
    }
    case 's27': { // OVER-SHOULDER dono chehre: Deepak + peeche office wala (SPEAK)
      drawChar(deepakCard, 41, DEEPAK, 'smile_closed', 'hang', 'hang', f, cp, 0.9, 0, -1.8, 1.05, 0, null, -1, ENV[f]);
      drawChar(officeCard, 43, OFFICE, 'smile', 'hang', 'hang', f, cp, 0.2, 0, -4.8, 1.0);
      drawWalk(w2Card, 47, WALK2, 'neutral', f, cp, 2.5, -2.6, 0.5, -3.0, clamp(u * 0.9), 0.9);
      break;
    }
    case 's28': { // TARP: tempo dhaka — 200 jar NA dikhe (reveal leak band)
      driveTempo(-5.0, 1.2, 0, f);
      tarpGroup.visible = true;
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'hang', 'hang', f, cp, -3.4, 0, -0.8, 1.0);
      drawChar(ladkaCard, 44, LADKA, 'smile', 'hang', 'hang', f, cp, -2.6, 0, -1.0, 0.95);
      drawWalk(w1Card, 46, WALK1, 'neutral', f, cp, 0.5, 1.4, -4.0, 1.2, clamp(u * 0.9), 0.9);
      break;
    }
    case 's29': { // Tempo gali ke mod par RUKTI (mod chhupa, suspense) — pahiye bhi ruke
      driveTempo(-3.6, 0.6, 0.3, f);
      tempoWheels.forEach((w) => { w.rotation.x = 0; });
      drawChar(deepakCard, 41, DEEPAK, 'neutral', 'hang', 'hang', f, cp, -2.6, 0, -1.8, 1.0);
      drawWalk(w2Card, 47, WALK2, 'neutral', f, cp, -3, 0.6, 2, 0.8, clamp(u * 0.9), 0.9);
      break;
    }
    case 's30': { // SAFAR-MAP #3 (top-down): route line 100%, tempo office pahuncha — WITHHELD REVEAL
      const [hx, hz] = routePoint(1.0);
      driveTempo(hx, -0.6 + hz, Math.PI / 2, f);
      break;
    }
    case 's31': { // TOP-DOWN jar pyramid gate par (150 JAR), guard salute
      setStackCount(15, '150 JAR', 0.3, -1.6);
      drawChar(guardCard, 45, GUARD, 'smile', 'up', 'hang', f, cp, 1.2, 0, -2.4, 1.0, 0, 0.8, 0);
      drawChar(deepakCard, 41, DEEPAK, 'grin', 'hang', 'hang', f, cp, -0.6, 0, -2.2, 1.0);
      drawChar(officeCard, 43, OFFICE, 'smile', 'hang', 'hang', f, cp, 0.3, 0, -2.6, 0.95);
      break;
    }
    case 's32': { // Aunty bhav-tol, funny (SPEAK — uski line)
      drawChar(auntyCard, 42, AUNTY, 'stern', 'reach', 'hang', f, cp, -0.35, 0, -3.1, 1.05, 0, 0.6, 0, ENV[f]);
      drawChar(deepakCard, 41, DEEPAK, 'smile_closed', 'hang', 'hang', f, cp, -1.5, 0, -2.6, 1.0);
      heroJar.visible = true;
      heroJar.position.set(-0.9, 0.85, -2.8);
      drawWalk(kidCard, 38, KID, 'grin', f, cp, -0.5, -2.0, -2.0, -2.0, clamp(u * 0.9), 0.72);
      break;
    }
    case 's33': { // WARM HOLD 1.97s: office wala 'shukriya' (SPEAK)
      drawChar(deepakCard, 41, DEEPAK, 'grin', 'hang', 'hang', f, cp, -0.7, 0, -1.8, 1.0);
      drawChar(officeCard, 43, OFFICE, 'smile', 'reach', 'hang', f, cp, 0.2, 0, -4.8, 1.02, 0, 0.5, 0, ENV[f]);
      drawWalk(w1Card, 46, WALK1, 'neutral', f, cp, -2.5, -2.6, 1.5, -3.0, clamp(u * 0.9), 0.9);
      break;
    }
    case 's34': { // TALLY-UPDATE: tempo side paint "150 JAR = ₹2,700", Deepak ishara karta
      driveTempo(-2.2, 0.8, 0.1, f);
      drawChar(deepakCard, 41, DEEPAK, 'grin', 'up', 'hang', f, cp, -1.2, 0, 0.2, 1.02, 0, 0.85, 0);
      drawChar(ladkaCard, 44, LADKA, 'smile', 'hang', 'hang', f, cp, 0.0, 0, -1.6, 0.95);
      drawWalk(w1Card, 46, WALK1, 'neutral', f, cp, 3.0, 1.2, 0.0, 1.0, clamp(u * 0.9), 0.9);
      break;
    }
    case 's35': { // ₹18: gate par jar-stack + sikke (dusk)
      coinPile.visible = true;
      coinPile.position.set(0.9, 0.55, -4.6);
      drawChar(deepakCard, 41, DEEPAK, 'grin', 'hang', 'hang', f, cp, 0.2, 0, -3.6, 1.0);
      drawChar(guardCard, 45, GUARD, 'smile', 'hang', 'hang', f, cp, 1.9, 0, -4.6, 0.95);
      drawWalk(officeCard, 43, OFFICE, 'smile', f, cp, -2.0, -3.0, 0.5, -4.2, clamp(u * 0.9), 0.95, 'hang', 'hang');
      break;
    }
    case 's36': { // ₹3,100: gine hue note jar-stack counter par (dusk, bulb ON)
      setNightLamp(true, f);
      noteStack.visible = true;
      noteStack.position.set(1.1, 1.15, -2.85);
      drawChar(deepakCard, 41, DEEPAK, 'grin', 'belly', 'belly', f, cp, 0.3, 0, -2.2, 1.05, 0, null, 0, ENV[f]);
      drawChar(ladkaCard, 44, LADKA, 'smile', 'hang', 'hang', f, cp, 1.9, 0, -2.6, 0.95);
      drawChar(workerCard, 49, WORKER, 'smile', 'hang', 'hang', f, cp, -1.2, 0, -2.4, 0.95);
      break;
    }
    case 's37': { // DIESEL BILL kagaz + ladka diesel bharte hue
      driveTempo(-4.5, 1.0, 0.2, f);
      receiptMesh.visible = true;
      receiptMesh.position.set(-0.75, 1.05, -1.45);
      receiptMesh.rotation.set(-0.15, -0.4, 0.05);
      drawChar(deepakCard, 41, DEEPAK, 'pained', 'hang', 'hang', f, cp, -0.5, 0, -1.7, 1.0);
      drawChar(ladkaCard, 44, LADKA, 'neutral', 'belly', 'belly', f, cp, -1.0, 0, -1.6, 1.0);
      drawWalk(w1Card, 46, WALK1, 'neutral', f, cp, -3, 0.6, 2, 0.8, clamp(u * 0.9), 0.9);
      break;
    }
    case 's38': { // Ladka + toota jar + tankhwah ke note (shaam)
      brokenJarG.visible = true;
      brokenJarG.position.set(1.7, 0, -2.8);
      drawChar(ladkaCard, 44, LADKA, 'pained', 'belly', 'belly', f, cp, 0.9, 0, -2.4, 1.0);
      drawChar(deepakCard, 41, DEEPAK, 'neutral', 'hang', 'hang', f, cp, -0.2, 0, -2.0, 1.0);
      noteProp.visible = true;
      noteProp.position.set(0.55, 1.1, -2.3);
      noteProp.rotation.x = 0;
      noteProp.rotation.y = Math.sin(f * 0.2) * 0.15;
      drawWalk(w1Card, 46, WALK1, 'neutral', f, cp, -2.5, -1.0, 0.5, -1.4, clamp(u * 0.9), 0.9);
      break;
    }
    case 's39': { // ₹2,000: kharcha nikaal kar bache note (dusk, bulb ON)
      setNightLamp(true, f);
      noteStack.visible = true;
      noteStack.position.set(0.3, 1.07, -2.7);
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'hang', 'hang', f, cp, 0, 0, -2.2, 1.05);
      drawChar(ladkaCard, 44, LADKA, 'smile', 'hang', 'hang', f, cp, 1.2, 0, -2.4, 0.95);
      drawChar(workerCard, 49, WORKER, 'smile', 'hang', 'hang', f, cp, -1.2, 0, -2.4, 0.95);
      break;
    }
    case 's40': { // BOARD #2 FLASH 0.80s: depot deewaar painted sign "₹60,000" + jar pyramid, dusk (SPEAK)
      setNightLamp(true, f);
      drawChar(deepakCard, 41, DEEPAK, 'grin', 'up', 'hang', f, cp, -1.4, 0, -2.4, 1.0, 0, 0.9, 0, ENV[f]);
      drawChar(ladkaCard, 44, LADKA, 'smile', 'hang', 'hang', f, cp, 0.4, 0, -2.6, 0.95);
      drawChar(workerCard, 49, WORKER, 'smile', 'hang', 'hang', f, cp, 1.8, 0, -2.8, 0.95);
      break;
    }
    case 's41': { // Deepak jar ginta, rukta (SPEAK)
      drawChar(deepakCard, 41, DEEPAK, 'smile_closed', 'belly', 'belly', f, cp, -0.6, 0, -2.0, 1.1, 0, null, 0, ENV[f]);
      heroJar.visible = true;
      heroJar.position.set(-0.3, 0.85, -1.7);
      drawChar(ladkaCard, 44, LADKA, 'smile', 'hang', 'hang', f, cp, 0.6, 0, -2.4, 0.95);
      break;
    }
    case 's42a': { // MICRO 0.17s WHITE-FLASH jhatka — wahi frame (FLASH s42a, peak 1409f)
      drawChar(deepakCard, 41, DEEPAK, 'neutral', 'hang', 'hang', f, cp, -0.4, 0, -2.6, 1.0, 0, null, -2);
      drawChar(guardCard, 45, GUARD, 'neutral', 'hang', 'hang', f, cp, 1.9, 0, -4.6, 0.95);
      drawChar(rivalCard, 48, RIVAL, 'shock', 'hang', 'hang', f, cp, 1.6, 0, -3.0, 1.0);
      break;
    }
    case 's42b': { // TWIST: Dutch tilt + FREEZE (pehle 8f) + ZOOM FOV 52→36, RIVAL shock
      const ff = f - shot.a < 8 ? shot.a : f;
      drawChar(deepakCard, 41, DEEPAK, 'neutral', 'hang', 'hang', ff, cp, -0.4, 0, -2.6, 1.0, 0, null, -2);
      drawChar(guardCard, 45, GUARD, 'neutral', 'hang', 'hang', ff, cp, 1.9, 0, -4.6, 0.95);
      drawChar(rivalCard, 48, RIVAL, 'shock', 'hang', 'hang', ff, cp, 1.6, 0, -3.0, 1.0);
      break;
    }
    case 's43': { // Jar closeup, paani ki boond (shaam)
      heroJar.visible = true;
      heroJar.position.set(-0.1, 1.06, -2.5);
      const du = clamp(u / 0.7);
      dropSprite.material.opacity = u < 0.7 ? 0.9 : 0;
      dropSprite.position.set(-0.1, 2.0 - du * 0.65, -2.35);
      if (u > 0.65) {
        const su = (u - 0.65) / 0.35;
        splashRing.material.opacity = (1 - su) * 0.7;
        splashRing.scale.setScalar(0.5 + su * 1.6);
        splashRing.position.set(-0.1, 1.32, -2.35);
      }
      glintJar.position.set(-0.1, 1.35, -2.3); glintJar.material.opacity = 0.4 + 0.3 * Math.sin(f * 0.3);
      drawChar(workerCard, 49, WORKER, 'neutral', 'hang', 'hang', f, cp, 1.6, 0, -2.6, 0.95);
      drawChar(deepakCard, 41, DEEPAK, 'smile_closed', 'hang', 'hang', f, cp, -1.2, 0, -2.0, 0.98);
      break;
    }
    case 's44': { // LOOP: STATIC freeze-hold wide, tempo jaati
      driveTempo(-2.5 + 4.0 * M.easeInOut(u), 1.4, 0.2, f);
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'up', 'hang', f, cp, -0.5, 0, -2.6, 1.02, 0, 0.8, 0);
      drawChar(ladkaCard, 44, LADKA, 'smile', 'hang', 'hang', f, cp, 0.6, 0, -2.2, 0.95);
      drawWalk(w2Card, 47, WALK2, 'neutral', f, cp, -6, 1.2, -1.5, 1.2, clamp(u * 0.9), 0.88);
      drawWalk(w1Card, 46, WALK1, 'neutral', f, cp, -5, 1.5, 5, 1.1, clamp(u * 0.9), 0.95);
      break;
    }
  }
  updateProxiesW();
  renderer.render(scene, camera);
};
window.TOTAL = TOTAL;
window.ready = Promise.resolve();
