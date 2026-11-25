// "Paani Wala" — FULL VIDEO (65.81s, 1975 frames @30fps). Mirror kit + Gullak density.
// Do set: 'gali' (mohalla + PAANI DEPOT, subah/din/shaam) aur 'office' (dopahar).
// NO captions, NO music. Text sirf in-scene board par. Contract: window.ready, window.renderFrame(f).
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
const CARD_CW = 1200, CARD_CH = 2000, CARD_M = 2.25;
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
const kidCard = new Card(), chaiCard = new Card();
const ALL_CARDS = [deepakCard, auntyCard, officeCard, ladkaCard, guardCard, w1Card, w2Card, kidCard, chaiCard];
// is kahani ke fresh designs — Deepak naya hero, purane Mohan-Seth/Ramesh nahi
const DEEPAK = { tunic: '#e8862e', shirt: '#fdf6e3', skin: '#c98a54', hair: '#1e1a20', hairStyle: 'side', hairLine: 0.22, print: { type: 'stripe', col: '#b85c14', a: 0.3, step: 11, lw: 2 } }; // hero: narangi t-shirt
const AUNTY = { tunic: '#7b2d8b', dress: '#8e44ad', shirt: '#f7f0dd', skin: '#e8b98d', hair: '#1e1714', hairStyle: 'thick' }; // baingani saree
const OFFICE = { tunic: '#31517a', shirt: '#ffffff', skin: '#d99e63', hair: '#1e1a20', hairStyle: 'side', glasses: true }; // neeli shirt, chashma, tie jaisa trim
const LADKA = { tunic: '#2e7a35', shirt: '#f2ead8', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick' }; // hara kurta, delivery ladka
const GUARD = { tunic: '#5d3c14', shirt: '#f7f0dd', skin: '#a06a3c', cap: '#f2ead8' }; // chaukidar, topi
const WALK1 = { tunic: '#b8b0a0', shirt: '#efe9da', skin: '#c98a54', hair: '#1e1a20' };
const WALK2 = { tunic: '#c94f72', dress: '#d6336c', shirt: '#f7f0dd', skin: '#f0c09a', hair: '#1e1714' };
const KID = { tunic: '#c23b2e', shirt: '#fdf6e3', skin: '#e8b98d', hair: '#1e1a20' };
const CHAIWALA = { tunic: '#e8e4da', shirt: '#31517a', skin: '#a06a3c', hair: '#241a14' };

// =====================================================================
// ENVS — har samay ka apna natural rang, koi single wash NAHI
// =====================================================================
const ENVS = {
  morning: { bg: 0xbfe0f2, fogC: 0xcfe4f2, fogNear: 16, fogFar: 60, hemi: 1.06, hemiC: 0xeaf4ff, hemiG: 0x8a9a6a, sun: 1.35, sunC: 0xfff1cf, sunPos: [-6, 9, 6], bounce: 0.3, bounceC: 0xd6e6ff, expo: 1.1, sky: 'morning' },
  day: { bg: 0x8ec9ee, fogC: 0xa9cfe6, fogNear: 14, fogFar: 60, hemi: 1.0, hemiC: 0xcfe4ff, hemiG: 0x8a7a5a, sun: 1.42, sunC: 0xffeec2, sunPos: [-7, 10, 5], bounce: 0.3, bounceC: 0xd6e6ff, expo: 1.13, sky: 'day' },
  noon: { bg: 0x9fd2f2, fogC: 0xbcd9ee, fogNear: 16, fogFar: 64, hemi: 1.18, hemiC: 0xf6fbff, hemiG: 0x9a9a8a, sun: 1.66, sunC: 0xfffdf4, sunPos: [-2.5, 12, 4.5], bounce: 0.34, bounceC: 0xe2efff, expo: 1.09, sky: 'day' },
  evening: { bg: 0xe08a4e, fogC: 0xe0a266, fogNear: 14, fogFar: 68, hemi: 0.85, hemiC: 0xffd9b0, hemiG: 0x6a5a4a, sun: 1.1, sunC: 0xff9a3c, sunPos: [-9, 4, 6], bounce: 0.22, bounceC: 0xffc890, expo: 1.08, sky: 'evening' },
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
  morning: new THREE.Mesh(skyGeo, bas({ map: skyTex([[0, '#4a8cc8'], [0.55, '#a8d2f0'], [1, '#fdf3d0']]), fog: false })),
  day: new THREE.Mesh(skyGeo, bas({ map: skyTex([[0, '#1f6fd0'], [0.55, '#8ec9ee'], [1, '#ffe9c4']]), fog: false })),
  evening: new THREE.Mesh(skyGeo, bas({ map: skyTex([[0, '#4a3a6e'], [0.55, '#e07840'], [1, '#ffd9a0']]), fog: false })),
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
const galiG = new THREE.Group(); scene.add(galiG);
const officeG = new THREE.Group(); scene.add(officeG);
let fanBlades = null;
let steamSprites = [], galiTrees = [], cycleG = null, cycleWheels = [];
// ---------- dynamic price board (depot) ----------
const priceCanvas = document.createElement('canvas'); priceCanvas.width = 1024; priceCanvas.height = 568;
const priceTex = new THREE.CanvasTexture(priceCanvas); priceTex.colorSpace = THREE.SRGBColorSpace; priceTex.anisotropy = 4;
let priceKey = '';
function setBoard(header, big, sub, mode) {
  const key = header + '|' + big + '|' + sub + '|' + mode;
  if (key === priceKey) return; priceKey = key;
  const g = priceCanvas.getContext('2d'), w = 1024, h = 568;
  g.fillStyle = '#12283e'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#7ec8f0'; g.lineWidth = 14; g.strokeRect(18, 18, w - 36, h - 36);
  g.strokeStyle = 'rgba(126,200,240,0.45)'; g.lineWidth = 4; g.strokeRect(44, 44, w - 88, h - 88);
  g.textAlign = 'center';
  g.fillStyle = '#eaf6ff'; g.font = 'bold 78px Arial';
  g.fillText(header, w / 2, 124);
  g.fillStyle = mode === 'red' ? '#ff6a5e' : mode === 'gold' ? '#ffd76a' : '#7ec8f0'; g.font = 'bold 178px Arial';
  g.fillText(big, w / 2, 336);
  g.fillStyle = '#cfd8e0'; g.font = 'bold 62px Arial';
  g.fillText(sub, w / 2, 472);
  priceTex.needsUpdate = true;
}
setBoard('DEEPAK PAANI SEVA', '₹60,000', 'MAHINA', 'gold');
{
  const S = galiG;
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
  // ---- PAANI DEPOT (centre x=0) — neeli deewaar, upar board ----
  const dwall = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 3.9), lam({ map: tex(plaster(41, 38), 3, 1), color: 0xdceef2 }));
  dwall.position.set(0, 1.95, -4.3); S.add(dwall);
  for (const px of [-2.05, 2.05]) {
    const pil = box(0.28, 3.3, 0.28, lam({ color: 0x1d5fa8 })); pil.position.set(px, 1.65, -3.3); S.add(pil);
  }
  const roof = box(5.2, 0.14, 2.1, lam({ color: 0x2f7fd0 })); roof.position.set(0, 3.36, -3.35); S.add(roof);
  const roofEdge = box(5.2, 0.1, 0.08, lam({ color: 0x7ec8f0 })); roofEdge.position.set(0, 3.3, -2.32); S.add(roofEdge);
  // RATE BOARD — do rodon se latka
  for (const sx of [-1, 1]) {
    const rod = cyl(0.02, 0.02, 0.3, lam({ color: 0x39434c })); rod.position.set(sx * 0.7, 3.42, -2.3); S.add(rod);
  }
  const boardBack = box(1.98, 1.13, 0.06, lam({ color: 0x0d1f33 })); boardBack.position.set(0, 2.72, -2.34); S.add(boardBack);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.05), bas({ map: priceTex }));
  board.position.set(0, 2.72, -2.3); S.add(board);
  // depot sign (board ke neeche)
  const depotSign = boardMesh(2.2, 0.42, textBoard(768, 148, (g, w, h) => {
    g.fillStyle = '#1d5fa8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.font = 'bold 72px Arial'; g.textAlign = 'center';
    g.fillText('PAANI DEPOT', w / 2, 96);
  }), true); depotSign.position.set(0, 1.98, -4.2); S.add(depotSign);
  // counter + upar jar
  const counter = box(2.3, 1.0, 0.72, lam({ map: FX.woodTexture(), color: 0x7a4a22 })); counter.position.set(0, 0.5, -3.0); S.add(counter);
  const cTop = box(2.45, 0.06, 0.85, lam({ color: 0xd9b078 })); cTop.position.set(0, 1.03, -3.0); S.add(cTop);
  const warmPoolTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(255,214,140,0.4)'); gr.addColorStop(0.6, 'rgba(255,190,110,0.15)'); gr.addColorStop(1, 'rgba(255,190,110,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  const counterGlow = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.8), new THREE.MeshBasicMaterial({ map: warmPoolTex, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }));
  counterGlow.rotation.x = -Math.PI / 2; counterGlow.position.set(0, 1.065, -3.0); counterGlow.renderOrder = 2; S.add(counterGlow);
  // ---- PANKHA (depot ki chhat ke neeche, ghumta) ----
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
  const t1 = mkTree(-5.4, -3.2, 1.15); S.add(t1); galiTrees.push(t1);
  const t2 = mkTree(5.8, -3.0, 0.95); S.add(t2); galiTrees.push(t2);
  const pole = cyl(0.045, 0.055, 3.2, lam({ color: 0x39434c })); pole.position.set(2.9, 1.6, -1.1); S.add(pole);
  const armLamp = cyl(0.035, 0.035, 0.8, lam({ color: 0x39434c })); armLamp.rotation.z = Math.PI / 2.3; armLamp.position.set(2.58, 3.15, -1.1); S.add(armLamp);
}

// =====================================================================
// SET — OFFICE: building facade + glass door + reception + 4 towers
// =====================================================================
{
  const S = officeG;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(46, 34), lam({ map: tex(dirt(21), 8, 8), color: 0xd8d2c4 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, 3); S.add(ground);
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), lam({ color: 0x9aa2a9 }));
  plaza.rotation.x = -Math.PI / 2; plaza.position.set(0, 0.01, -2.5); S.add(plaza);
  // facade (neela-safed glass building)
  const facade = new THREE.Mesh(new THREE.PlaneGeometry(14, 7), lam({ map: tex(stone(11), 4, 2), color: 0xbcd3e6 }));
  facade.position.set(0, 3.5, -6.5); S.add(facade);
  for (let r = 0; r < 4; r++) for (let cix = 0; cix < 10; cix++) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.0), bas({ color: (r + cix) % 3 === 0 ? 0xffe9a0 : 0x39506b }));
    win.position.set(-5.4 + cix * 1.2, 1.6 + r * 1.5, -6.45); S.add(win);
  }
  // glass door (centre)
  const doorFrame = box(2.2, 2.6, 0.12, lam({ color: 0x2c343c })); doorFrame.position.set(0, 1.3, -6.42); S.add(doorFrame);
  const doorGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.35), new THREE.MeshBasicMaterial({ color: 0x9fd4e8, transparent: true, opacity: 0.55, depthWrite: false }));
  doorGlass.position.set(0, 1.3, -6.35); S.add(doorGlass);
  const doorBar = box(0.06, 2.35, 0.04, lam({ color: 0x2c343c })); doorBar.position.set(0, 1.3, -6.33); S.add(doorBar);
  const officeSign = boardMesh(3.4, 0.62, textBoard(1024, 192, (g, w, h) => {
    g.fillStyle = '#12283e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#7ec8f0'; g.font = 'bold 96px Arial'; g.textAlign = 'center';
    g.fillText('OFFICE • 4 TOWERS', w / 2, 126);
  }), true); officeSign.position.set(0, 3.1, -6.4); S.add(officeSign);
  // reception counter + plant
  const recep = box(2.0, 1.0, 0.7, lam({ color: 0x8a97a3 })); recep.position.set(0, 0.5, -4.6); S.add(recep);
  const recepTop = box(2.15, 0.06, 0.85, lam({ color: 0xe8eef2 })); recepTop.position.set(0, 1.03, -4.6); S.add(recepTop);
  const plantPot = cyl(0.16, 0.12, 0.3, lam({ color: 0xb85c14 })); plantPot.position.set(-1.6, 0.15, -5.2); S.add(plantPot);
  const plantBall = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), lam({ color: 0x3e7d32 })); plantBall.position.set(-1.6, 0.62, -5.2); S.add(plantBall);
  // 4 TOWERS (peeche — twist shot ka "dukaan")
  const towerCols = [0x5a7a9a, 0x6a8aaa, 0x4a6a8a, 0x7a9aba];
  [[-6, 11], [-2, 13], [2, 12], [6, 14]].forEach(([tx, th], i) => {
    const tw = box(2.6, th, 2.0, lam({ color: towerCols[i] })); tw.position.set(tx, th / 2, -10); S.add(tw);
    for (let r = 0; r < Math.floor(th / 1.4); r++) for (let cix = 0; cix < 2; cix++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.8), bas({ color: (r + cix) % 2 === 0 ? 0xffe9a0 : 0x2c4a6a }));
      win.position.set(tx - 0.6 + cix * 1.2, 1.2 + r * 1.4, -8.95); S.add(win);
    }
  });
}

// =====================================================================
// PROPS — jar, jarstack, tempo, note, diesel can, toota jar, paani ki boond
// =====================================================================
function mkJar(s = 1) {
  const g = new THREE.Group(); g.scale.setScalar(s);
  const bodyMat = lam({ color: 0x2f7fd0, transparent: true, opacity: 0.94 });
  const body = cyl(0.14, 0.15, 0.42, bodyMat, 16); body.position.y = 0.21; g.add(body);
  const water = cyl(0.12, 0.13, 0.34, lam({ color: 0x7ec8f0 }), 16); water.position.y = 0.19; g.add(water);
  const neck = cyl(0.06, 0.09, 0.08, bodyMat, 12); neck.position.y = 0.46; g.add(neck);
  const cap = cyl(0.07, 0.07, 0.05, lam({ color: 0x1d5fa8 }), 12); cap.position.y = 0.52; g.add(cap);
  const label = boardMesh(0.2, 0.1, textBoard(256, 128, (gg, w, h) => {
    gg.fillStyle = '#ffffff'; gg.fillRect(0, 0, w, h);
    gg.fillStyle = '#1d5fa8'; gg.font = 'bold 64px Arial'; gg.textAlign = 'center';
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
const stackDepot = mkJarStack(1.35, -3.0, galiG);
const stackOffice = mkJarStack(0.9, -5.2, officeG);
// ---- TEMPO (delivery gaadi) — lambaai X axis, saamne +x ----
const tempoG = new THREE.Group(); scene.add(tempoG);
let tempoWheels = [];
{
  const bed = box(2.6, 0.12, 1.5, lam({ color: 0xe8862e })); bed.position.set(0, 0.55, 0); tempoG.add(bed);
  const cab = box(0.9, 0.85, 1.4, lam({ color: 0xe8862e })); cab.position.set(1.55, 0.95, 0); tempoG.add(cab);
  const shield = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.5), new THREE.MeshBasicMaterial({ color: 0x9fd4e8, transparent: true, opacity: 0.75, depthWrite: false }));
  shield.position.set(2.01, 1.1, 0); shield.rotation.y = Math.PI / 2; tempoG.add(shield);
  const sideBoard = boardMesh(1.9, 0.4, textBoard(768, 160, (g, w, h) => {
    g.fillStyle = '#12283e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffd76a'; g.font = 'bold 64px Arial'; g.textAlign = 'center';
    g.fillText('DEEPAK PAANI SEVA', w / 2, 102);
  }), true); sideBoard.position.set(-0.2, 0.42, 0.76); tempoG.add(sideBoard);
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
const headlightMat = new THREE.SpriteMaterial({ map: FX.puffTexture([[0, 'rgba(255,244,200,0.95)'], [1, 'rgba(255,244,200,0)']]), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const headGlowL = new THREE.Sprite(headlightMat); headGlowL.scale.setScalar(0.7); scene.add(headGlowL);
const headGlowR = new THREE.Sprite(headlightMat.clone()); headGlowR.scale.setScalar(0.7); scene.add(headGlowR);
// ---- NOTE (₹20/₹30) ----
const noteProp = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.008, 0.09), lam({ color: 0x7fae6e }));
noteProp.visible = false; scene.add(noteProp);
const noteStack = new THREE.Group(); scene.add(noteStack);
{
  const noteMat = lam({ color: 0x7fae6e });
  for (let i = 0; i < 5; i++) { const n = box(0.17, 0.012, 0.095, noteMat); n.position.y = i * 0.013; n.rotation.y = (i - 2) * 0.05; noteStack.add(n); }
  const band = box(0.05, 0.075, 0.1, lam({ color: 0xf2ead8 })); band.position.y = 0.026; noteStack.add(band);
  noteStack.visible = false;
}
// ---- DIESEL CAN (laal jerrycan) ----
const dieselG = new THREE.Group(); scene.add(dieselG);
{
  const can = box(0.24, 0.32, 0.13, lam({ color: 0xc23b2e })); can.position.y = 0.16; dieselG.add(can);
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
// glints: board ke kone + jar chamak
const glintBoard1 = mkGlint(-0.82, 3.12, -2.12, 0.55), glintBoard2 = mkGlint(0.85, 2.38, -2.12, 0.45);
const glintJar = mkGlint(0, 1.2, -1.9, 0.5);
const boardGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: FX.puffTexture([[0, 'rgba(126,200,240,0.8)'], [1, 'rgba(126,200,240,0)']]), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
boardGlow.position.set(0, 2.72, -2.05); boardGlow.scale.set(3.4, 2.0, 1); scene.add(boardGlow);
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
function driveTempo(x, z, rotY, f) {
  tempoG.visible = true;
  tempoG.position.set(x, 0, z);
  tempoG.rotation.y = rotY;
  tempoWheels.forEach((w) => { w.rotation.x = f * 0.3; });
}
window.renderFrame = (f) => {
  const shot = shotAt(f), u = shot.u, id = shot.id;
  const cam = camFor(shot, u);
  camera.position.set(...cam.pos); camera.lookAt(...cam.look);
  camera.fov = cam.fov; camera.updateProjectionMatrix();
  if (cam.roll) camera.rotateZ(cam.roll * Math.PI / 180);
  const env = applyEnv(shot.env);
  for (const k in skyMeshes) skyMeshes[k].visible = (k === env.sky);
  clouds.forEach((sp, i) => {
    sp.visible = true;
    sp.position.x = -22 + i * 7.5 + Math.sin(f * 0.004 + i) * 0.6;
  });
  ALL_CARDS.forEach((c) => c.hide());
  const cp = cam.pos;
  // ---- set visibility ----
  galiG.visible = (shot.set === 'gali');
  officeG.visible = (shot.set === 'office');
  // ---- board text (shot ke hisaab se; gali me hi) ----
  let board = ['DEEPAK PAANI SEVA', '₹60,000', 'MAHINA', 'gold'];
  if (id === 's12') board = ['EK JAR', '₹3', 'PAANI', 'blue'];
  if (id === 's15') board = ['EK JAR KA HISAAB', 'KUL ₹12', 'PAANI + DHULAI + GHISAI', 'blue'];
  if (id === 's17') board = ['50 GHAR', '₹400', 'ROZ', 'gold'];
  if (id === 's35') board = ['OFFICE HISAAB', '150 × ₹18', 'DEDH SAU JAR', 'gold'];
  if (id === 's36') board = ['KUL', '₹3,100', 'ROZ', 'gold'];
  if (id === 's39') board = ['BACHT', '₹2,000', 'ROZ', 'gold'];
  if (id === 's40') board = ['MAHINA', '₹60,000', 'PAANI SE', 'gold'];
  setBoard(board[0], board[1], board[2], board[3]);
  // ---- hamesha zinda background ----
  fanBlades.rotation.y = f * 0.45;
  galiTrees.forEach((t, i) => { t.rotation.z = Math.sin(f * 0.03 + i * 1.7) * 0.018; });
  steamSprites.forEach((sp, i) => {
    const ph = (f * 0.011 + i / 6) % 1;
    sp.position.set(3.42 + Math.sin(f * 0.05 + i * 1.3) * 0.05 + ph * 0.22, 1.22 + ph * 0.9, -3.25);
    sp.scale.setScalar(0.22 + ph * 0.6);
    sp.material.opacity = 0.32 * (1 - ph) * Math.min(1, ph / 0.15);
  });
  // glints / glow / props default band
  glintBoard1.material.opacity = 0; glintBoard2.material.opacity = 0; glintJar.material.opacity = 0;
  setNightLamp(false, f);
  boardGlow.material.opacity = 0;
  cycleG.visible = false;
  heroJar.visible = false; jarSpin.visible = false;
  heroJar.rotation.set(0, 0, 0); heroJar.scale.setScalar(1);
  tempoG.visible = false; noteProp.visible = false; noteStack.visible = false;
  dieselG.visible = false; brokenJarG.visible = false;
  dropSprite.material.opacity = 0; splashRing.material.opacity = 0;
  headGlowL.material.opacity = 0; headGlowR.material.opacity = 0;
  // tempo hamesha gali me parked (driving shots me animate hota hai) — park (-5.6,-2.8): far left-back corner
  if (shot.set === 'gali') driveTempo(-5.6, -2.8, 0.5, f);

  switch (id) {
    case 's01': { // BOARD ECU: chamak flicker
      glintBoard1.material.opacity = Math.sin(f * 0.85) > 0.5 ? 0.95 : 0.2;
      glintBoard2.material.opacity = Math.sin(f * 0.85 + 2.2) > 0.5 ? 0.85 : 0.15;
      glintBoard1.material.rotation = f * 0.02; glintBoard2.material.rotation = -f * 0.017;
      boardGlow.material.opacity = 0.1 + 0.07 * Math.sin(f * 0.85);
      break;
    }
    case 's02': { // Deepak BIG closeup grin, jar haath me (SPEAK)
      drawChar(deepakCard, 41, DEEPAK, 'grin', 'up', 'hang', f, cp, -0.55, 0, -1.6, 1.14, 0, 0.85, 0, ENV[f]);
      heroJar.visible = true;
      heroJar.position.set(-0.35, 0.8, -1.5);
      heroJar.rotation.z = 0.08; heroJar.scale.setScalar(0.8);
      glintJar.position.set(-0.35, 1.05, -1.35); glintJar.material.opacity = 0.5 + 0.3 * Math.sin(f * 0.4);
      break;
    }
    case 's03': { // Jar ECU + girti boond
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
      break;
    }
    case 's04': { // Deepak smile, peeche tempo
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'hang', 'hang', f, cp, -0.7, 0, -1.4, 1.08, 0, null, 0, ENV[f]);
      drawChar(ladkaCard, 44, LADKA, 'smile', 'hang', 'hang', f, cp, 0.6, 0, -2.4, 0.95);
      break;
    }
    case 's05': { // "Iska naam Deepak hai" — haath hilata (SPEAK)
      drawChar(deepakCard, 41, DEEPAK, 'grin', 'up', 'hang', f, cp, -1.0, 0, -1.6, 1.1, 0, 0.8, 0, ENV[f]);
      drawChar(w1Card, 46, WALK1, 'smile', 'hang', 'hang', f, cp, 0.4, 0, -2.3, 0.94);
      break;
    }
    case 's06': { // Jar ghumta, "20 LITRE" mark
      jarSpin.visible = true;
      jarSpin.position.set(0, 1.06, -2.5);
      jarSpin.rotation.y = f * 0.06;
      glintJar.position.set(0, 1.35, -2.3); glintJar.material.opacity = 0.5 + 0.3 * Math.sin(f * 0.35);
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'hang', 'hang', f, cp, -0.9, 0, -1.6, 0.98);
      break;
    }
    case 's07': { // Ghar ke darwaze: Deepak jar deta, 2 residents
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'reach', 'hang', f, cp, -2.2, 0, -2.0, 1.02, 0, 0.5, 0);
      drawChar(w1Card, 46, WALK1, 'smile', 'hang', 'hang', f, cp, -2.9, 0, -2.6, 0.97);
      drawChar(w2Card, 47, WALK2, 'smile', 'hang', 'hang', f, cp, -3.15, 0, -2.5, 0.94);
      heroJar.visible = true;
      heroJar.position.set(-2.55, 0.85, -2.3);
      break;
    }
    case 's08': { // Bhor: tempo headlight ON, Deepak start karta
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'up', 'hang', f, cp, -2.0, 0, -2.0, 1.04, 0, 0.85, 0);
      headGlowL.material.opacity = 0.55; headGlowR.material.opacity = 0.55;
      headGlowL.position.set(-3.8, 0.72, -3.2); headGlowR.position.set(-3.8, 0.72, -4.2);
      drawChar(chaiCard, 49, CHAIWALA, 'smile', 'reach', 'hang', f, cp, 3.6, 0, -3.75, 0.9);
      break;
    }
    case 's09': { // Tempo chalti, side tracking
      driveTempo(-5.6 + 8.1 * M.easeInOut(u), -2.8 + 5.0 * M.easeInOut(u), 0.5 - 0.4 * M.easeInOut(u), f);
      runCycle(f, cp, 6.5 - 12 * u, 2.6, -1);
      drawWalk(w1Card, 46, WALK1, 'neutral', f, cp, -4, 0.6, 1.0, 0.8, clamp(u * 0.9), 0.9);
      break;
    }
    case 's10': { // Darwazon par jar, tally — Deepak + ladka jar rakhte
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'reach', 'hang', f, cp, -0.9, 0, -2.2, 1.0, 0, 0.5, 0);
      drawChar(ladkaCard, 44, LADKA, 'smile', 'hang', 'hang', f, cp, 0.5, 0, -2.4, 0.95);
      heroJar.visible = true;
      heroJar.position.set(-0.5, 0.85, -2.0);
      drawWalk(w2Card, 47, WALK2, 'neutral', f, cp, 2.5, 1.4, -2.0, 1.2, clamp(u * 0.9), 0.9);
      runCycle(f, cp, -7 + 13 * u, 2.4, 1);
      break;
    }
    case 's11': { // ₹20 note + jar exchange closeup
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'reach', 'hang', f, cp, -0.5, 0, -2.3, 1.02, 0, 0.5, 0);
      drawChar(w1Card, 46, WALK1, 'smile', 'reach', 'hang', f, cp, 0.3, 0, -2.5, 0.98);
      const ue = clamp((u - 0.1) / 0.4);
      noteProp.visible = true;
      noteProp.position.set(0.15 - 0.5 * ue, 1.12, -2.4);
      noteProp.rotation.y = Math.sin(f * 0.2) * 0.15;
      heroJar.visible = true;
      heroJar.position.set(-0.28, 0.85, -2.1);
      break;
    }
    case 's12': { // Paani ki boond board "₹3 PAANI"
      dropSprite.material.opacity = 0.9;
      dropSprite.position.set(0, 2.3 - clamp(u / 0.6) * 0.7, -2.1);
      glintBoard1.material.opacity = 0.4 + 0.3 * Math.sin(f * 0.4);
      boardGlow.material.opacity = 0.25 + 0.1 * Math.sin(f * 0.25);
      break;
    }
    case 's13': { // Diesel can + tempo
      dieselG.visible = true;
      dieselG.position.set(-1.5, 0, -1.8);
      drawChar(deepakCard, 41, DEEPAK, 'neutral', 'belly', 'belly', f, cp, -1.0, 0, -1.6, 1.0);
      break;
    }
    case 's14': { // Dhulai + ghisa jar — ladka jar pochta, toota jar side me
      brokenJarG.visible = true;
      brokenJarG.position.set(1.45, 0, -2.7);
      drawChar(ladkaCard, 44, LADKA, 'neutral', 'belly', 'belly', f, cp, 0.8, 0, -2.4, 1.0);
      heroJar.visible = true;
      heroJar.position.set(0.85, 0.85, -2.25);
      heroJar.rotation.z = Math.sin(f * 0.1) * 0.06;
      break;
    }
    case 's15': { // Board "KUL ₹12"
      glintBoard1.material.opacity = 0.5 + 0.3 * Math.sin(f * 0.45);
      boardGlow.material.opacity = 0.2 + 0.1 * Math.sin(f * 0.3);
      drawChar(deepakCard, 41, DEEPAK, 'neutral', 'hang', 'hang', f, cp, -0.3, 0, -1.9, 0.92);
      break;
    }
    case 's16': { // Deepak ₹8 ginta, deflation (SPEAK)
      drawChar(deepakCard, 41, DEEPAK, 'pained', 'belly', 'belly', f, cp, -0.6, 0, -1.9, 1.12, 0, null, 1, ENV[f]);
      noteStack.visible = true;
      noteStack.position.set(-0.35, 1.07, -2.9);
      break;
    }
    case 's17': { // Tally board "50 GHAR = ₹400"
      glintBoard1.material.opacity = 0.4 + 0.3 * Math.sin(f * 0.4);
      drawChar(deepakCard, 41, DEEPAK, 'pained', 'hang', 'hang', f, cp, -0.3, 0, -1.9, 0.92);
      drawChar(ladkaCard, 44, LADKA, 'neutral', 'hang', 'hang', f, cp, 0.5, 0, -2.4, 0.95);
      break;
    }
    case 's18': { // "itne se kya hoga?" — doubtful, morph pained->neutral (SPEAK)
      const expr = u < 0.5 ? 'pained' : 'neutral';
      drawChar(deepakCard, 41, DEEPAK, expr, 'hang', 'hang', f, cp, -0.55, 0, -1.6, 1.12, 0, null, -2, ENV[f]);
      break;
    }
    case 's19': { // Roshni badli dopahar, conspiratorial closeup
      const expr = u < 0.4 ? 'neutral' : 'grin';
      drawChar(deepakCard, 41, DEEPAK, expr, 'hang', 'hang', f, cp, -0.5, 0, -1.8, 1.08, 0, null, 0, ENV[f]);
      break;
    }
    case 's20': { // Tempo mudti dopahar ki taraf
      driveTempo(-5.6 + 6.4 * M.easeInOut(u), -2.8 + 5.0 * M.easeInOut(u), 0.5 + 0.4 * M.easeInOut(u), f);
      drawWalk(w1Card, 46, WALK1, 'neutral', f, cp, -3, 0.6, 3, 0.8, clamp(u * 0.9), 0.9);
      break;
    }
    case 's21': { // Jar match-cut spin — "Wahi jar, wahi paani"
      jarSpin.visible = true;
      jarSpin.position.set(0, 1.06, -2.5);
      jarSpin.rotation.y = f * 0.12;
      glintJar.position.set(0, 1.35, -2.3); glintJar.material.opacity = 0.6 + 0.3 * Math.sin(f * 0.4);
      break;
    }
    case 's22': { // Office building wide reveal — Deepak darwaze ki taraf
      drawWalk(deepakCard, 41, DEEPAK, 'smile', f, cp, 1.5, -2.0, 0.2, -4.0, u, 1.02, 'hang', 'hang');
      drawChar(guardCard, 45, GUARD, 'neutral', 'hang', 'hang', f, cp, 1.9, 0, -5.4, 0.95);
      drawChar(officeCard, 43, OFFICE, 'smile', 'hang', 'hang', f, cp, -0.8, 0, -4.4, 0.95);
      break;
    }
    case 's23': { // Office wala ₹30 deta (SPEAK — uski line)
      drawChar(officeCard, 43, OFFICE, 'smile', 'reach', 'hang', f, cp, 0.2, 0, -4.4, 1.0, 0, 0.5, 0, ENV[f]);
      drawChar(deepakCard, 41, DEEPAK, 'grin', 'hang', 'hang', f, cp, -0.6, 0, -3.8, 1.0);
      const ue = clamp((u - 0.1) / 0.4);
      noteProp.visible = true;
      noteProp.position.set(0.05 - 0.5 * ue, 1.12, -4.1);
      noteProp.rotation.y = Math.sin(f * 0.2) * 0.15;
      heroJar.visible = true;
      heroJar.position.set(-0.35, 0.85, -3.6);
      break;
    }
    case 's24': { // Office wala bhav-tol mana karta, thumbs up
      drawChar(officeCard, 43, OFFICE, 'grin', 'up', 'hang', f, cp, 0.2, 0, -4.4, 1.02, 0, 0.85, 0);
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'hang', 'hang', f, cp, -0.6, 0, -3.8, 1.0);
      break;
    }
    case 's25': { // Deepak seedha camera se, warm (SPEAK)
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'hang', 'hang', f, cp, -0.5, 0, -2.0, 1.12, 0, null, 0, ENV[f]);
      break;
    }
    case 's26': { // Ungli se ishara (SPEAK)
      drawChar(deepakCard, 41, DEEPAK, 'grin', 'up', 'hang', f, cp, -0.55, 0, -2.0, 1.1, 0, 0.9, 0, ENV[f]);
      break;
    }
    case 's27': { // Deepak curious closeup (SPEAK)
      drawChar(deepakCard, 41, DEEPAK, 'smile_closed', 'hang', 'hang', f, cp, -0.5, 0, -1.8, 1.12, 0, null, -1, ENV[f]);
      break;
    }
    case 's28': { // Tempo jar se bhari wide
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'hang', 'hang', f, cp, -3.4, 0, -2.2, 1.0);
      drawChar(ladkaCard, 44, LADKA, 'smile', 'hang', 'hang', f, cp, -2.6, 0, -2.4, 0.95);
      drawWalk(w1Card, 46, WALK1, 'neutral', f, cp, 0.5, 1.4, -4.0, 1.2, clamp(u * 0.9), 0.9);
      break;
    }
    case 's29': { // Tempo gharon se mudti (office ki taraf)
      driveTempo(-5.6 + 7.1 * M.easeInOut(u), -2.8 + 4.3 * M.easeInOut(u), 0.5, f);
      drawWalk(w2Card, 47, WALK2, 'neutral', f, cp, -3, 0.6, 2, 0.8, clamp(u * 0.9), 0.9);
      break;
    }
    case 's30': { // 4 office blocks, jar behte (WITHHELD REVEAL)
      drawChar(deepakCard, 41, DEEPAK, 'grin', 'up', 'hang', f, cp, -0.5, 0, -2.0, 1.05, 0, 0.85, 0);
      drawWalk(officeCard, 43, OFFICE, 'smile', f, cp, 2.0, -3.0, 0.5, -4.2, clamp(u * 0.9), 0.95, 'hang', 'hang');
      drawWalk(ladkaCard, 44, LADKA, 'smile', f, cp, -2.0, -3.0, -0.5, -4.4, clamp(u * 0.9), 0.95, 'hang', 'hang');
      break;
    }
    case 's31': { // Office gate jar pyramid, guard salute
      drawChar(guardCard, 45, GUARD, 'smile', 'up', 'hang', f, cp, 1.4, 0, -5.6, 1.0, 0, 0.8, 0);
      drawChar(deepakCard, 41, DEEPAK, 'grin', 'hang', 'hang', f, cp, -0.4, 0, -4.6, 1.0);
      drawChar(officeCard, 43, OFFICE, 'smile', 'hang', 'hang', f, cp, 0.2, 0, -4.4, 0.95);
      break;
    }
    case 's32': { // Aunty bhav-tol, funny (SPEAK — uski line)
      drawChar(auntyCard, 42, AUNTY, 'stern', 'reach', 'hang', f, cp, -2.9, 0, -2.6, 1.05, 0, 0.6, 0, ENV[f]);
      drawChar(deepakCard, 41, DEEPAK, 'smile_closed', 'hang', 'hang', f, cp, -2.45, 0, -2.3, 1.0);
      heroJar.visible = true;
      heroJar.position.set(-2.55, 0.85, -2.3);
      break;
    }
    case 's33': { // Office wala 'shukriya' warm (SPEAK)
      drawChar(officeCard, 43, OFFICE, 'smile', 'reach', 'hang', f, cp, 0.2, 0, -4.4, 1.02, 0, 0.5, 0, ENV[f]);
      drawChar(deepakCard, 41, DEEPAK, 'grin', 'hang', 'hang', f, cp, -0.6, 0, -3.8, 1.0);
      break;
    }
    case 's34': { // Deepak smile_closed, sochta — contrast hold
      drawChar(deepakCard, 41, DEEPAK, 'smile_closed', 'hang', 'hang', f, cp, -0.5, 0, -2.2, 1.08, 0, null, -1);
      drawChar(officeCard, 43, OFFICE, 'neutral', 'hang', 'hang', f, cp, 0.6, 0, -4.4, 0.95);
      break;
    }
    case 's35': { // Board "150 × ₹18"
      glintBoard1.material.opacity = 0.5 + 0.3 * Math.sin(f * 0.45);
      boardGlow.material.opacity = 0.25 + 0.1 * Math.sin(f * 0.3);
      drawChar(deepakCard, 41, DEEPAK, 'grin', 'hang', 'hang', f, cp, -0.3, 0, -1.9, 0.92);
      break;
    }
    case 's36': { // Board "₹3,100 ROZ" drumbeat
      glintBoard1.material.opacity = 0.65 + 0.35 * Math.sin(f * 0.5);
      glintBoard2.material.opacity = 0.65 + 0.35 * Math.sin(f * 0.5 + 2.0);
      boardGlow.material.opacity = 0.3 + 0.14 * Math.sin(f * 0.3);
      drawChar(deepakCard, 41, DEEPAK, 'grin', 'up', 'hang', f, cp, -0.3, 0, -1.9, 0.92, 0, 0.85, 0);
      break;
    }
    case 's37': { // Diesel can closeup (shaam)
      dieselG.visible = true;
      dieselG.position.set(-1.5, 0, -1.8);
      drawChar(ladkaCard, 44, LADKA, 'neutral', 'belly', 'belly', f, cp, -1.0, 0, -1.6, 1.0);
      break;
    }
    case 's38': { // Ladka + toota jar (shaam)
      brokenJarG.visible = true;
      brokenJarG.position.set(1.45, 0, -2.7);
      drawChar(ladkaCard, 44, LADKA, 'pained', 'belly', 'belly', f, cp, 0.8, 0, -2.4, 1.0);
      drawChar(deepakCard, 41, DEEPAK, 'neutral', 'hang', 'hang', f, cp, -0.2, 0, -2.0, 1.0);
      break;
    }
    case 's39': { // Board "₹2,000 ROZ"
      glintBoard1.material.opacity = 0.5 + 0.3 * Math.sin(f * 0.45);
      boardGlow.material.opacity = 0.25 + 0.1 * Math.sin(f * 0.3);
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'hang', 'hang', f, cp, -0.3, 0, -1.9, 0.92);
      break;
    }
    case 's40': { // Board "₹60,000 MAHINA" BIG gold glints (climax)
      glintBoard1.material.opacity = Math.sin(f * 0.85) > 0.5 ? 0.95 : 0.2;
      glintBoard2.material.opacity = Math.sin(f * 0.85 + 2.2) > 0.5 ? 0.85 : 0.15;
      glintBoard1.material.rotation = f * 0.02; glintBoard2.material.rotation = -f * 0.017;
      boardGlow.material.opacity = 0.3 + 0.14 * Math.sin(f * 0.22);
      drawChar(deepakCard, 41, DEEPAK, 'grin', 'up', 'hang', f, cp, -0.3, 0, -1.9, 0.92, 0, 0.9, 0, ENV[f]);
      break;
    }
    case 's41': { // Deepak jar ginta, rukta (SPEAK)
      drawChar(deepakCard, 41, DEEPAK, 'smile_closed', 'belly', 'belly', f, cp, -0.6, 0, -1.9, 1.1, 0, null, 0, ENV[f]);
      heroJar.visible = true;
      heroJar.position.set(-0.3, 0.85, -1.6);
      break;
    }
    case 's42': { // TWIST: slow push 4 office buildings — Deepak chhota, upar dekhta
      drawChar(deepakCard, 41, DEEPAK, 'neutral', 'hang', 'hang', f, cp, -0.4, 0, -2.0, 1.0, 0, null, -2);
      setNightLamp(true, f);
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
      break;
    }
    case 's44': { // LOOP wide: subah gali, tempo jaati, bheed (s07 rhyme)
      drawChar(deepakCard, 41, DEEPAK, 'smile', 'up', 'hang', f, cp, -0.5, 0, -3.2, 1.02, 0, 0.8, 0);
      drawChar(ladkaCard, 44, LADKA, 'smile', 'hang', 'hang', f, cp, 0.6, 0, -2.4, 0.95);
      drawChar(chaiCard, 49, CHAIWALA, 'smile', 'reach', 'hang', f, cp, 3.6, 0, -3.75, 0.9);
      drawWalk(w2Card, 47, WALK2, 'neutral', f, cp, -6, 1.2, -1.5, 1.2, clamp(u * 0.9), 0.88);
      drawWalk(w1Card, 46, WALK1, 'neutral', f, cp, -5, 1.5, 5, 1.1, clamp(u * 0.9), 0.95);
      driveTempo(-5.6 + 7.2 * M.easeInOut(u), -2.8 + 4.6 * M.easeInOut(u), 0.5 - 0.1 * M.easeInOut(u), f);
      runCycle(f, cp, -8.5 + 17 * u, 1.2, 1);
      break;
    }
  }
  updateProxiesW();
  renderer.render(scene, camera);
};
window.TOTAL = TOTAL;
window.ready = Promise.resolve();
