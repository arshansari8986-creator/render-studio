// "Gym Wala" — FULL FILM (53 shots, 2025f @30fps = 67.49 s). Title: "Gym Khaali, ₹5 Lakh Kamai!"
// Fresh world: local Indian neighbourhood gym (ONE interior set, 3 angles/moods).
// Fresh hero: unnamed young gym owner, navy-blue tee + white towel sash, RED WHISTLE on a
// black lanyard (signature prop — in ALL shots). Skin #a06a3c, side-part hair, no moustache.
// World V3: LIT materials ONLY (lam() + paint.js textures) + soft shadows + warm + cool light
// in every shot. MeshBasicMaterial ONLY for flash plane / glints / light-bulb glow — never
// for a visible surface. ENVELOPE LIP-SYNC ON (envelope.js from tight master; hero speak
// on every shot, mouth = smoothed ENV, gain 1.7, <0.035 closed) + expression morph 12f.
// NO captions, NO music. Numbers as objects: fee board (L7 + s02/s03), till + GALLA board (s04).
// LAYOUT LOCK: every prop's base touches a surface; hero text/face inside frame with margin.
// Contract: window.ready, window.renderFrame(f).
import * as THREE from 'three';
import * as FX from './fx.js';
import * as T from './toon.js';
import { idle, blinkAt, q, M, clamp } from './motion.js';
import { tex, planks, plaster, stone, dirt, wetConcrete, tiles, tinRoof, marble } from './paint.js';
import { TOTAL, shotAt, camFor, FLASH, heroExprAt, mouthKind } from './story.js';

const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 300);
scene.add(camera);
const flashPlane = new THREE.Mesh(new THREE.PlaneGeometry(3, 5), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, depthTest: false, fog: false }));
flashPlane.position.set(0, 0, -0.5); flashPlane.renderOrder = 999; camera.add(flashPlane);
const lam = (o) => new THREE.MeshLambertMaterial(o);
const bas = (o) => new THREE.MeshBasicMaterial(o);

// ---------- global lights ----------
const hemi = new THREE.HemisphereLight(0xcfe4ff, 0x8a7a5a, 1.0); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe9b0, 1.4);
sun.position.set(-7, 10, 5); scene.add(sun); scene.add(sun.target);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
sun.shadow.camera.left = -20; sun.shadow.camera.right = 20;
sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -20;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 95;
sun.shadow.bias = -0.0022; sun.shadow.normalBias = 0.02;
const bounce = new THREE.DirectionalLight(0xd6e6ff, 0.3);
bounce.position.set(6, 8, 14); bounce.castShadow = false;
scene.add(bounce); scene.add(bounce.target);
// Window morning light (warm, from back-left window) + counter tube light (warm, evening)
const winLight = new THREE.PointLight(0xffd9a0, 0, 12, 1.5);
winLight.position.set(-3.2, 2.6, -5.0); scene.add(winLight);
const tubeLight = new THREE.PointLight(0xffc27a, 0, 10, 1.5);
tubeLight.position.set(2.6, 3.3, -3.4); scene.add(tubeLight);

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
function bar2D(x0, y0, x1, y1, z, mat, r = 0.02) {
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
  const m = cyl(r, r, len, mat, 6);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, z);
  m.rotation.z = -Math.atan2(dx, dy);
  return m;
}
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
// CHARACTER CARDS
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
function drawChar(card, seed, outfit, expr, R, L, f, camPos, x, y, z, s = 1.03, step = 0, lift = null, tilt = 0, mouth = null, props = false, sweat = false, mix = null) {
  const idl = idle(f, seed), blink = blinkAt(f, seed);
  const liftQ = lift === null ? '' : q(lift, 1);
  const tiltBody = Math.round(idl.tilt + tilt * 3);
  const tiltHead = Math.round(idle(f, seed + 2).headTilt + tilt * 6);
  const mixQ = mix ? `${mix.e2}:${q(mix.u, 1)}` : '';
  const key = `${seed}|${expr}|${R}|${L}|${blink}|${q(idl.bob, 2)}|${tiltBody}|${q(step, 2)}|${liftQ}|${mouth || ''}|${sweat ? 'sw' : ''}|${mixQ}`;
  card.draw(key, (p) => {
    T.romanFront(p, outfit, {
      seed, expr, R, L, blink, bob: q(idl.bob, 2), tilt: tiltBody,
      headTilt: tiltHead, wv: f * 0.18, step, lift: lift === null ? 0 : lift, mouth, sweat, mix,
    });
  });
  card.place(x, y, z, camPos, s);
}
const heroCard = new Card();
const crowdCards = [];
for (let i = 0; i < 13; i++) crowdCards.push(new Card());
const ALL_CARDS = [heroCard, ...crowdCards];
// FRESH — HERO (~26, unnamed gym owner, NO moustache): navy-blue tee + white towel sash
// (toga = shoulder towel, plain), side-part hair. Skin #a06a3c.
const HERO = { tunic: '#1d4ed8', shirt: '#f8fafc', skin: '#a06a3c', hair: '#1e1a20', hairStyle: 'side', toga: '#f8fafc' };
// CROWD (fresh, muted natural — tez rang sirf hero cheezon par): 13 outfits, varied skin/hair.
const CROWD = [
  { tunic: '#b45309', shirt: '#fef3c7', skin: '#a06a3c', hair: '#1e1a20', hairStyle: 'thick' },
  { tunic: '#5d7a4a', shirt: '#fef3c7', skin: '#9a6a42', hair: '#2b211c', hairStyle: 'thick' },
  { tunic: '#c25a7a', shirt: '#fef3c7', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick', dress: '#c25a7a' },
  { tunic: '#7c3aed', shirt: '#fef3c7', skin: '#b0703a', hair: '#1e1a20', hairStyle: 'side' },
  { tunic: '#0f766e', shirt: '#f8fafc', skin: '#8a5a30', hair: '#14100c', hairStyle: 'thick' },
  { tunic: '#92400e', shirt: '#fef3c7', skin: '#9a6a42', hair: '#2b211c', hairStyle: 'side' },
  { tunic: '#be185d', shirt: '#fef3c7', skin: '#a06a3c', hair: '#1e1a20', hairStyle: 'thick', dress: '#be185d' },
  { tunic: '#365314', shirt: '#fef3c7', skin: '#b0703a', hair: '#14100c', hairStyle: 'thick' },
  { tunic: '#9f1239', shirt: '#fef3c7', skin: '#8a5a30', hair: '#2b211c', hairStyle: 'side' },
  { tunic: '#155e75', shirt: '#f8fafc', skin: '#a06a3c', hair: '#1e1a20', hairStyle: 'thick' },
  { tunic: '#713f12', shirt: '#fef3c7', skin: '#9a6a42', hair: '#14100c', hairStyle: 'thick' },
  { tunic: '#4d7c0f', shirt: '#fef3c7', skin: '#b0703a', hair: '#2b211c', hairStyle: 'side' },
  { tunic: '#831843', shirt: '#fef3c7', skin: '#a06a3c', hair: '#1e1a20', hairStyle: 'thick', dress: '#831843' },
];

// ---- MUNH, envelope lip-sync — hero bolta hai to munh ENV se chalta hai ----
// mouthKind(f) story.js me: smoothed ENV, gain 1.7, 0.035 se neeche = band ('o'/'O'/null).
// Beat-level MOUTH_BEATS HATA diya — full build me envelope.js lip-sync hai.
// Crowd nahi bolta — unka mouth null (expression ka apna munh dikhta hai).

// =====================================================================
// ENVS — morning (dawn) / day / dull (March, cooler) / evening (twist)
// =====================================================================
const ENVS = {
  morning: { bg: 0xd8e8ee, fogC: 0xd8e4e0, fogNear: 10, fogFar: 46, hemi: 1.05, hemiC: 0xffe8c8, hemiG: 0x8a7a5a, sun: 1.7, sunC: 0xffd9a0, sunPos: [-10, 4.5, 6], bounce: 0.4, bounceC: 0x9db8d9, expo: 1.12, win: 5.0, tube: 0, clockHr: 6 },
  day: { bg: 0xc8dcec, fogC: 0xd0dde6, fogNear: 12, fogFar: 48, hemi: 1.0, hemiC: 0xffe8c8, hemiG: 0x8a7a5a, sun: 1.6, sunC: 0xfff0c8, sunPos: [-9, 6, 5], bounce: 0.35, bounceC: 0x9db8d9, expo: 1.13, win: 3.0, tube: 2.0, clockHr: 10 },
  dull: { bg: 0xb8c4cc, fogC: 0xbcc6cc, fogNear: 10, fogFar: 44, hemi: 0.75, hemiC: 0xb8c8d9, hemiG: 0x6a6a62, sun: 0.9, sunC: 0xcfd8e8, sunPos: [-9, 6, 5], bounce: 0.25, bounceC: 0x9db8d9, expo: 1.02, win: 1.2, tube: 1.0, clockHr: 11 },
  evening: { bg: 0xe8b078, fogC: 0xe8c098, fogNear: 8, fogFar: 38, hemi: 1.0, hemiC: 0xffe0b8, hemiG: 0x8a6a4a, sun: 1.5, sunC: 0xff8a3d, sunPos: [-11, 2.6, 4], bounce: 0.35, bounceC: 0xffd9a0, expo: 1.12, win: 1.5, tube: 6.0, clockHr: 6 },
};
const tubeBulbMat = bas({ color: 0xfff7cc, fog: false });
const applyEnv = (name) => {
  const e = ENVS[name] || ENVS.day;
  scene.background = new THREE.Color(e.bg);
  scene.fog = new THREE.Fog(e.fogC, e.fogNear, e.fogFar);
  hemi.intensity = e.hemi; hemi.color.set(e.hemiC); hemi.groundColor.set(e.hemiG);
  sun.intensity = e.sun; sun.color.set(e.sunC); sun.position.set(...e.sunPos);
  sun.target.position.set(0, 0, 0); sun.target.updateMatrixWorld();
  bounce.intensity = e.bounce; bounce.color.set(e.bounceC);
  renderer.toneMappingExposure = e.expo;
  winLight.intensity = e.win;
  tubeLight.intensity = e.tube;
  tubeBulbMat.color.set(e.tube > 2 ? 0xffe9a8 : 0xcfd8dc);
  return e;
};

// =====================================================================
// SET — ONE GYM INTERIOR (x -5..5, back wall z=-6). LAYOUT LOCK: every prop's
// base touches a surface; hero text/face margin ke saath frame ke andar.
// =====================================================================
const gymG = new THREE.Group(); scene.add(gymG);
let lightCone = null;
let clockHour = null, clockMin = null;
let tillLid = null;
let monthCanvas = null, monthCtx = null, monthTex = null;
let monthBoard = null; // WE wides me calendar chhupane ke liye (smoke QA round 2)
const motes = [];
const glintFee = mkGlint(-3.6, 2.0, -0.8, 0.5);
const glintGalla = mkGlint(2.3, 3.2, -5.6, 0.6);
const glintTill = mkGlint(2.6, 1.4, -3.0, 0.5);

const clockTex = textBoard(256, 256, (g, w, h) => {
  g.fillStyle = '#fef9ec'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
  g.strokeStyle = '#1e293b'; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.stroke();
  g.fillStyle = '#1e293b'; g.textAlign = 'center'; g.font = 'bold 40px Arial';
  g.fillText('12', 128, 52); g.fillText('6', 128, 224); g.fillText('3', 210, 142); g.fillText('9', 46, 142);
});
const checkerTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#0f766e' : '#fef3c7'; g.fillRect(x * 32, y * 32, 32, 32); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
// Fee board texture — "NEW YEAR OFFER / FEES ₹1,000 MAHINA" (proof-read, Roman-Hinglish).
const feeBoardTex = textBoard(512, 640, (g, w, h) => {
  g.fillStyle = '#f8fafc'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#0f766e'; g.fillRect(0, 0, w, 110);
  g.fillStyle = '#f8fafc'; g.font = 'bold 52px Arial'; g.textAlign = 'center'; g.fillText('NEW YEAR OFFER', w / 2, 74);
  g.fillStyle = '#1e293b'; g.font = 'bold 72px Arial'; g.fillText('FEES', w / 2, 220);
  g.fillStyle = '#b45309'; g.font = 'bold 110px Arial'; g.fillText('₹1,000', w / 2, 350);
  g.fillStyle = '#1e293b'; g.font = 'bold 64px Arial'; g.fillText('MAHINA', w / 2, 450);
  g.fillStyle = '#0f766e'; g.font = 'bold 44px Arial'; g.fillText('SAAL BHAR KI FEES', w / 2, 540);
  g.fillText('SASTE DAAM', w / 2, 596);
});
// Galla board texture — gold-on-dark "GALLA ₹5,00,000".
const gallaBoardTex = textBoard(640, 360, (g, w, h) => {
  g.fillStyle = '#134e4a'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#facc15'; g.lineWidth = 10; g.strokeRect(10, 10, w - 20, h - 20);
  g.textAlign = 'center'; g.fillStyle = '#f8fafc';
  g.font = 'bold 52px Arial'; g.fillText('GALLA', w / 2, 84);
  g.fillStyle = '#facc15'; g.font = 'bold 96px Arial'; g.fillText('₹5,00,000', w / 2, 210);
  g.fillStyle = '#f8fafc'; g.font = 'bold 40px Arial'; g.fillText('GYM • PAANCH LAKH', w / 2, 300);
});
const posterTex = textBoard(512, 384, (g, w, h) => {
  g.fillStyle = '#fef3c7'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#0f766e'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
  g.textAlign = 'center'; g.fillStyle = '#0f766e';
  g.font = 'bold 64px Arial'; g.fillText('SEHAT HI', w / 2, 140);
  g.fillStyle = '#b45309'; g.font = 'bold 72px Arial'; g.fillText('DAULAT HAI', w / 2, 240);
  g.fillStyle = '#1e293b'; g.font = 'bold 40px Arial'; g.fillText('ROZ AAO • FIT RAHO', w / 2, 330);
});
function drawMonth(text) {
  const g = monthCtx;
  g.fillStyle = '#f8fafc'; g.fillRect(0, 0, 256, 320);
  g.strokeStyle = '#1d4ed8'; g.lineWidth = 8; g.strokeRect(6, 6, 244, 308);
  g.fillStyle = '#1d4ed8'; g.fillRect(0, 0, 256, 64);
  g.fillStyle = '#f8fafc'; g.font = 'bold 40px Arial'; g.textAlign = 'center'; g.fillText(text, 128, 46);
  g.fillStyle = '#1e293b'; g.font = 'bold 26px Arial';
  ['S M T W T F S', '1  2  3  4  5  6', '7  8  9 10 11 12', '13 14 15 16 17 18'].forEach((row, i) => g.fillText(row, 128, 120 + i * 44));
  monthTex.needsUpdate = true;
}

function dumbbell(x, y, z, ry = 0) {
  const g = new THREE.Group();
  const handle = cyl(0.025, 0.025, 0.3, lam({ color: 0x9ca3af }), 8);
  handle.rotation.z = Math.PI / 2; g.add(handle);
  [-0.17, 0.17].forEach((dx) => {
    const end = cyl(0.09, 0.09, 0.06, lam({ color: 0x1f2937 }), 12);
    end.rotation.z = Math.PI / 2; end.position.x = dx; g.add(end);
  });
  g.position.set(x, y, z); g.rotation.y = ry; return g;
}
function treadmill(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const base = box(0.8, 0.12, 1.7, lam({ color: 0x374151 })); base.position.y = 0.06; g.add(base);
  const belt = box(0.6, 0.03, 1.45, lam({ color: 0x111827 })); belt.position.y = 0.13; g.add(belt);
  [-0.35, 0.35].forEach((dx) => {
    const post = cyl(0.03, 0.03, 1.1, lam({ color: 0x4b5563 }), 8); post.position.set(dx, 0.65, 0.78); g.add(post);
    const rail = box(0.04, 0.04, 1.5, lam({ color: 0x4b5563 })); rail.position.set(dx, 0.55, 0); g.add(rail);
  });
  const console = box(0.7, 0.25, 0.08, lam({ color: 0x1f2937 })); console.position.set(0, 1.18, 0.78); console.rotation.x = -0.25; g.add(console);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.14), lam({ color: 0x0f766e }));
  screen.position.set(0, 1.19, 0.83); screen.rotation.x = -0.25; g.add(screen);
  return g;
}
function bike(x, z, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  [-0.45, 0.45].forEach((dx) => {
    const wh = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 8, 18), lam({ color: 0x1f2937 }));
    wh.position.set(dx, 0.3, 0); g.add(wh);
  });
  const frame = lam({ color: 0xb45309 });
  g.add(bar2D(-0.45, 0.3, 0.05, 0.7, 0, frame, 0.025));
  g.add(bar2D(0.45, 0.3, 0.05, 0.7, 0, frame, 0.025));
  g.add(bar2D(0.05, 0.7, -0.1, 0.62, 0, frame, 0.025));
  const seat = box(0.22, 0.04, 0.1, lam({ color: 0x451a03 })); seat.position.set(-0.1, 0.75, 0); g.add(seat);
  const bars = cyl(0.02, 0.02, 0.4, lam({ color: 0x9ca3af }), 6); bars.rotation.x = Math.PI / 2; bars.position.set(0.15, 0.85, 0); g.add(bars);
  return g;
}

{
  const S = gymG;
  // FLOOR — dark rubber mats (tiles texture) + checkerboard mat strip (Gullak floor cue)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), lam({ map: tex(tiles(52), 8, 8), color: 0x6b7280 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.02, 0); floor.receiveShadow = true; S.add(floor);
  const checkerMat = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.3), lam({ map: checkerTex }));
  checkerMat.rotation.x = -Math.PI / 2; checkerMat.position.set(-3.6, 0.012, 0.7); checkerMat.receiveShadow = true; S.add(checkerMat);
  // BACK WALL (cream plaster + teal band) + SIDE WALLS
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 5.0), lam({ map: tex(plaster(71, 36), 5, 2), color: 0xe6d6b4 }));
  backWall.position.set(0, 2.5, -6); backWall.receiveShadow = true; S.add(backWall);
  const band = box(10.5, 0.5, 0.06, lam({ color: 0x0f766e })); band.position.set(0, 0.95, -5.97); S.add(band);
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 5.0), lam({ map: tex(plaster(72, 36), 4, 2), color: 0xd8c49a }));
  leftWall.rotation.y = Math.PI / 2; leftWall.position.set(-5, 2.5, -1.5); S.add(leftWall);
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 5.0), lam({ map: tex(plaster(73, 36), 4, 2), color: 0xd8c49a }));
  rightWall.rotation.y = -Math.PI / 2; rightWall.position.set(5, 2.5, -1.5); S.add(rightWall);
  // CEILING (y=5.0) — upar khaali aasmaan kabhi na dikhe; tube lights isi se latakti hain
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(11, 10), lam({ map: tex(plaster(74, 36), 3, 2), color: 0xcfc4a8 }));
  ceiling.rotation.x = Math.PI / 2; ceiling.position.set(0, 5.0, -1.5); S.add(ceiling);
  // OUTSIDE (seen through window glass): dawn sky + hazy buildings = deep background layer
  const skyTexC = (() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 256;
    const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#7fa8c9'); gr.addColorStop(0.55, '#f6d8a8'); gr.addColorStop(1, '#ffe8c0');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const skyOut = new THREE.Mesh(new THREE.PlaneGeometry(14, 7), bas({ map: skyTexC, fog: false }));
  skyOut.position.set(0, 2.5, -8.5); S.add(skyOut);
  [[-4, 2.2, 0x9a8f7a], [0.5, 3.0, 0x8a9aaa], [4, 2.6, 0xb08a7a]].forEach(([bx, bh, col]) => {
    const b = box(3.2, bh, 0.8, lam({ color: col })); b.position.set(bx, bh / 2, -7.6); S.add(b);
    const tank = cyl(0.4, 0.4, 0.7, lam({ color: 0x64748b }), 12); tank.position.set(bx + 0.8, bh + 0.35, -7.6); S.add(tank);
  });
  // WINDOW (back wall left, x -4.2..-2.2, y 1.7..3.1): frame + cross bars + glass
  const winFrameMat = lam({ color: 0x4a3428 });
  [[-3.2, 3.08, 2.1, 0.08], [-3.2, 1.72, 2.1, 0.08], [-4.24, 2.4, 0.08, 1.44], [-2.16, 2.4, 0.08, 1.44]].forEach(([wx, wy, ww, wh]) => {
    const f = box(ww, wh, 0.06, winFrameMat); f.position.set(wx, wy, -5.96); S.add(f);
  });
  const winBarV = box(0.05, 1.36, 0.04, winFrameMat); winBarV.position.set(-3.2, 2.4, -5.96); S.add(winBarV);
  const winBarH = box(2.0, 0.05, 0.04, winFrameMat); winBarH.position.set(-3.2, 2.4, -5.96); S.add(winBarH);
  const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.36), new THREE.MeshPhongMaterial({ color: 0x9fc8d9, shininess: 140, specular: 0xcfeaff, transparent: true, opacity: 0.35 }));
  winGlass.position.set(-3.2, 2.4, -5.98); S.add(winGlass);
  // LIGHT CONE (Gullak: akele character par ek light cone) — window se hero tak, s01 me ON
  lightCone = new THREE.Mesh(new THREE.ConeGeometry(0.95, 3.4, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.10, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  lightCone.position.set(-1.4, 1.6, -3.8); lightCone.rotation.set(0.4, 0, -0.35); lightCone.material.opacity = 0.07; lightCone.visible = false; S.add(lightCone);
  // MIRROR (back wall, x -0.2..1.4, y 0.9..2.7) — big wall mirror, frame + reflective face
  const mirFrame = box(1.7, 1.9, 0.04, lam({ color: 0x5b3a1e })); mirFrame.position.set(0.6, 1.8, -5.97); S.add(mirFrame);
  const mirFace = new THREE.Mesh(new THREE.PlaneGeometry(1.56, 1.76), new THREE.MeshPhongMaterial({ color: 0xbfd9e2, shininess: 120, specular: 0xffffff }));
  mirFace.position.set(0.6, 1.8, -5.94); S.add(mirFace);
  const mirGlint = mkGlint(0.6, 2.2, -5.9, 0.35); mirGlint.material.opacity = 0.5;
  // POSTER + WALL CLOCK (back wall)
  const poster = boardMesh(0.9, 0.68, posterTex); poster.position.set(-1.2, 2.1, -5.95); S.add(poster);
  const clockFace = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), lam({ map: clockTex }));
  clockFace.position.set(-0.9, 3.2, -5.94); S.add(clockFace);
  const hourGeo = new THREE.BoxGeometry(0.03, 0.15, 0.01); hourGeo.translate(0, 0.065, 0);
  clockHour = new THREE.Mesh(hourGeo, lam({ color: 0x1e293b })); clockHour.position.set(-0.9, 3.2, -5.93); S.add(clockHour);
  const minGeo = new THREE.BoxGeometry(0.02, 0.22, 0.01); minGeo.translate(0, 0.1, 0);
  clockMin = new THREE.Mesh(minGeo, lam({ color: 0x1e293b })); clockMin.position.set(-0.9, 3.2, -5.925); S.add(clockMin);
  // MONTH CALENDAR (back wall right, above dumbbell rack) — text per section
  monthCanvas = document.createElement('canvas'); monthCanvas.width = 256; monthCanvas.height = 320;
  monthCtx = monthCanvas.getContext('2d');
  monthTex = new THREE.CanvasTexture(monthCanvas); monthTex.colorSpace = THREE.SRGBColorSpace;
  monthBoard = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.78), lam({ map: monthTex }));
  // FIX 27 Nov (s04 top khaali): calendar y 2.1->2.95 — GALLA board ke barabar, upar band bharta hai.
  monthBoard.position.set(3.35, 2.95, -5.95); S.add(monthBoard);
  drawMonth('JANUARY');
  // WALL SHELF above counter (y 3.7) + supplement bottles — s04 ke upar wale khaali
  // band ko bharta hai; shelf deewaar par, bottles shelf par (koi floating nahi).
  {
    const shelf = box(2.9, 0.05, 0.25, lam({ color: 0x8a6844 })); shelf.position.set(2.6, 3.7, -5.85); S.add(shelf);
    [1.5, 3.7].forEach((bx) => { const br = box(0.05, 0.18, 0.05, lam({ color: 0x374151 })); br.position.set(bx, 3.6, -5.9); S.add(br); });
    [[1.5, 0x0ea5e9], [2.6, 0x16a34a], [3.7, 0xf97316]].forEach(([bx, col]) => {
      const b = cyl(0.05, 0.05, 0.28, lam({ color: col }), 10); b.position.set(bx, 3.87, -5.85); S.add(b);
    });
  }
  // TUBE LIGHTS (hanging, rods touch y=3.6 = wall top)
  [[-1.5, -3.0], [2.0, -3.0]].forEach(([lx, lz]) => {
    const rod = cyl(0.02, 0.02, 0.7, lam({ color: 0x39434c }), 6); rod.position.set(lx, 4.65, lz); S.add(rod);
    const tube = box(1.2, 0.06, 0.08, tubeBulbMat); tube.position.set(lx, 4.28, lz); S.add(tube);
    const shade = box(1.3, 0.04, 0.14, lam({ color: 0x374151 })); shade.position.set(lx, 4.33, lz); S.add(shade);
  });
  // ---- EQUIPMENT (all bases on the floor) ----
  S.add(treadmill(-4.2, -4.4)); S.add(treadmill(-4.2, -2.6)); S.add(treadmill(-4.2, -0.8));
  // v9: bikes (0.9,-1.0)/(1.7,-1.0) — fix2 me (1.1/1.9,-0.6) par bike wheel
  // s03 ke dayein kinare par bada kata dikhta tha; aur bayein/peeche — wheel frame ke
  // andar, s04 me abhi bhi camera ke peeche/bahar (handlebar frame me nahi).
  S.add(bike(0.9, -1.0, 0.3)); S.add(bike(1.3, -1.4, -0.2));
  // BENCH PRESS (0, -3.5): bench + legs + rack + barbell + plates
  {
    const bench = box(0.5, 0.15, 1.3, lam({ color: 0x7c2d12 })); bench.position.set(0, 0.45, -3.5); S.add(bench);
    [-0.5, 0.5].forEach((dz) => { const leg = box(0.4, 0.4, 0.08, lam({ color: 0x1f2937 })); leg.position.set(0, 0.2, -3.5 + dz); S.add(leg); });
    [-0.35, 0.35].forEach((dx) => { const up = cyl(0.04, 0.04, 1.5, lam({ color: 0x374151 }), 8); up.position.set(dx, 0.75, -4.05); S.add(up); });
    const bar = cyl(0.025, 0.025, 1.8, lam({ color: 0x9ca3af }), 8); bar.rotation.z = Math.PI / 2; bar.position.set(0, 1.35, -4.05); S.add(bar);
    [-0.75, 0.75].forEach((dx) => { const pl = cyl(0.28, 0.28, 0.06, lam({ color: 0x1f2937 }), 16); pl.rotation.z = Math.PI / 2; pl.position.set(dx, 1.35, -4.05); S.add(pl); });
    // white towel draped on bench (base = bench top)
    const towel = box(0.4, 0.03, 0.5, lam({ color: 0xf8fafc })); towel.position.set(0, 0.54, -3.2); S.add(towel);
  }
  // SQUAT RACK (-2.8, -4.6): hero ke chehre ke peeche barbell na aaye — bayein kinare par
  {
    [-0.5, 0.5].forEach((dx) => { const up = cyl(0.04, 0.04, 2.0, lam({ color: 0x374151 }), 8); up.position.set(-2.8 + dx, 1.0, -4.6); S.add(up); });
    const top = box(1.1, 0.06, 0.06, lam({ color: 0x374151 })); top.position.set(-2.8, 2.0, -4.6); S.add(top);
    const bar = cyl(0.025, 0.025, 1.6, lam({ color: 0x9ca3af }), 8); bar.rotation.z = Math.PI / 2; bar.position.set(-2.8, 1.7, -4.6); S.add(bar);
    [-0.65, 0.65].forEach((dx) => { const pl = cyl(0.24, 0.24, 0.06, lam({ color: 0x1f2937 }), 16); pl.rotation.z = Math.PI / 2; pl.position.set(-2.8 + dx, 1.7, -4.6); S.add(pl); });
  }
  // DUMBBELL RACK (4.3, -3.2): frame + 2 tiers + 6 dumbbells
  {
    const base = box(0.6, 0.1, 1.8, lam({ color: 0x374151 })); base.position.set(4.3, 0.05, -3.2); S.add(base);
    [0.5, 0.95].forEach((ty) => { const shelf = box(0.55, 0.05, 1.7, lam({ color: 0x4b5563 })); shelf.position.set(4.3, ty, -3.2); S.add(shelf); });
    [[4.05, -4.0], [4.55, -4.0], [4.05, -2.4], [4.55, -2.4]].forEach(([ux, uz]) => { const up = box(0.05, 1.0, 0.05, lam({ color: 0x374151 })); up.position.set(ux, 0.5, uz); S.add(up); });
    [[-3.85, 0.55], [-3.2, 0.55], [-2.55, 0.55], [-3.85, 1.0], [-3.2, 1.0], [-2.55, 1.0]].forEach(([dz, dy]) => {
      const d = dumbbell(4.3, dy, dz, 0); S.add(d);
    });
  }
  // WEIGHT PLATES STACK (-1.5, -4.9): 5 plates flat on floor, back wall ke paas —
  // s01 me dayein kinare se kata dikhta tha, isiliye bayein taraf le jaya gaya.
  for (let i = 0; i < 5; i++) {
    const pl = cyl(0.3 - i * 0.02, 0.3 - i * 0.02, 0.06, lam({ color: i % 2 ? 0x1f2937 : 0x374151 }), 16);
    pl.position.set(-1.5, 0.03 + i * 0.06, -4.9); S.add(pl);
  }
  // ---- COUNTER / RECEPTION DESK (2.6, -3.4) + TILL ----
  const counter = box(2.0, 0.95, 0.7, lam({ map: tex(planks(43), 1, 1) })); counter.position.set(2.6, 0.475, -3.4); S.add(counter);
  const counterTop = box(2.2, 0.06, 0.85, lam({ color: 0x8a6844 })); counterTop.position.set(2.6, 0.98, -3.4); S.add(counterTop);
  // shaker bottle + register book on counter (set dressing, bases on counter top)
  const shaker = cyl(0.05, 0.05, 0.18, lam({ color: 0x0f766e }), 10); shaker.position.set(1.8, 1.1, -3.3); S.add(shaker);
  const regBook = box(0.35, 0.04, 0.25, lam({ color: 0x7c2d12 })); regBook.position.set(2.95, 1.03, -3.6); S.add(regBook);
  // ---- FOREGROUND PROPS (depth layer 1 — frame corners, below face line) ----
  // FIX2: dumbbells fix1 me dayein kinare se kate the — ab andar (x -0.7/-0.4).
  S.add(dumbbell(-0.7, 0.09, 1.85, 0.4)); S.add(dumbbell(-0.4, 0.09, 1.6, -0.3));
  const bottle = cyl(0.05, 0.05, 0.22, lam({ color: 0x0ea5e9 }), 10); bottle.position.set(0.2, 0.11, 1.6); S.add(bottle);
  // FIX 27 Nov (wide shots me 35-40% khaali farsh): foreground dressing — yoga mats,
  // rolled mat, kettlebells. Sab ki base farsh ko chhooti hai; chehre/board se door, neeche.
  // FIX3: rolled mat HATA diya — fix2 me bottom-right corner me vishal purple pipe
  // lag raha tha (camera ke bahut kareeb, kata hua). Kettlebells chhote (r 0.13) +
  // dayein wala andar (x 1.5->1.0) — fix2 me kinare se kata tha.
  {
    const mat1 = box(1.7, 0.03, 0.6, lam({ color: 0x0f766e })); mat1.position.set(-2.0, 0.015, 0.9); mat1.rotation.y = 0.15; S.add(mat1);
    const mat2 = box(1.7, 0.03, 0.6, lam({ color: 0xc2410c })); mat2.position.set(2.0, 0.015, 1.2); mat2.rotation.y = -0.2; S.add(mat2);
    [[-1.5, 1.9], [1.0, 2.0]].forEach(([kx, kz]) => {
      const kb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), lam({ color: 0x1f2937 }));
      kb.position.set(kx, 0.11, kz); S.add(kb);
      const hd = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.018, 6, 12, Math.PI), lam({ color: 0x1f2937 }));
      hd.position.set(kx, 0.23, kz); S.add(hd);
    });
  }
  // dust motes near window (light visible)
  for (let i = 0; i < 8; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, opacity: 0.10, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffe9b0 }));
    sp.position.set(-3 + (i * 0.9) % 4.5, 1.2 + (i % 3) * 0.7, -4.5 + (i % 2) * 1.2);
    sp.scale.setScalar(0.08 + (i % 3) * 0.03);
    scene.add(sp); motes.push(sp);
  }
}
gymG.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

// ---- FEE BOARD (A-board, entrance left) — visible s02/s03 only (set in renderFrame) ----
const feeBoardG = new THREE.Group(); scene.add(feeBoardG);
{
  const front = boardMesh(1.1, 1.4, feeBoardTex); front.position.set(0, 0.75, 0.02); feeBoardG.add(front);
  const back = boardMesh(1.1, 1.4, feeBoardTex); back.position.set(0, 0.75, -0.02); back.rotation.y = Math.PI; feeBoardG.add(back);
  // NO frame box — v4 me frame ka upari kinara board ke "NEW YEAR OFFER" header ko dhak raha tha.
  // A-board legs touch floor: front plane leans on back plane — both bases on floor
  front.rotation.x = -0.12; back.rotation.x = 0.12;
  // v5: board z -0.5 par (1.1x1.4, scale 1.0) — foreground me bada board hero ko dhak raha
  // tha; ab board bayein, hero uske dayein khada hoke iski taraf ishara karta hai.
  feeBoardG.position.set(-2.1, 0, -0.5); feeBoardG.rotation.y = 0.35;
}
// ---- GALLA BOARD (back wall above counter) — visible s04 only ----
// FIX 27 Nov (s04 top 25% khaali deewaar): board y 2.35->2.95, calendar ke barabar.
const gallaBoard = boardMesh(1.5, 0.8, gallaBoardTex); gallaBoard.position.set(2.3, 2.95, -5.94); gallaBoard.visible = false; scene.add(gallaBoard);
// ---- TILL (on counter) + CASH ----
const tillG = new THREE.Group(); scene.add(tillG);
const cashHeap = new THREE.Group(); scene.add(cashHeap);
const cashInside = new THREE.Group(); scene.add(cashInside);
const cashSpill = new THREE.Group(); scene.add(cashSpill);
{
  const tbox = box(0.55, 0.28, 0.4, lam({ map: tex(planks(45), 1, 1) })); tbox.position.set(2.6, 1.15, -3.4); tillG.add(tbox);
  const lock = box(0.08, 0.06, 0.02, lam({ color: 0x9ca3af })); lock.position.set(2.6, 1.16, -3.19); tillG.add(lock);
  const lidGeo = new THREE.BoxGeometry(0.55, 0.04, 0.4); lidGeo.translate(0, 0, 0.2);
  tillLid = new THREE.Mesh(lidGeo, lam({ map: tex(planks(43), 1, 1) }));
  tillLid.position.set(2.6, 1.3, -3.6); tillG.add(tillLid);
  // cash INSIDE till — standing green notes, visible when lid opens
  for (let i = 0; i < 5; i++) {
    const n = box(0.3, 0.28, 0.012, lam({ color: i % 2 ? 0x3f9e4d : 0x6fbf73 }));
    n.position.set(2.6 + (i - 2) * 0.05, 1.28, -3.4 + (i - 2) * 0.02); n.rotation.z = (i - 2) * 0.12; cashInside.add(n);
  }
  // cash HEAP on counter beside till — stacked green bundles with white band
  for (let i = 0; i < 8; i++) {
    const n = box(0.34, 0.016, 0.18, lam({ color: i % 2 ? 0x3f9e4d : 0x6fbf73 }));
    n.position.set(3.1 + (i % 3 - 1) * 0.05, 1.03 + i * 0.016, -3.3 + (Math.floor(i / 3) - 1) * 0.06);
    n.rotation.y = (i % 4 - 1.5) * 0.35; cashHeap.add(n);
  }
  const bandW = box(0.08, 0.03, 0.19, lam({ color: 0xf8fafc })); bandW.position.set(3.1, 1.17, -3.3); cashHeap.add(bandW);
  // SPILL — loose notes on counter top
  for (let i = 0; i < 4; i++) {
    const n = box(0.3, 0.012, 0.15, lam({ color: i % 2 ? 0x3f9e4d : 0x6fbf73 }));
    n.position.set(2.1 + (i % 2) * 0.25, 1.02 + (i > 1 ? 0.012 : 0), -3.15 + (Math.floor(i / 2) - 0.5) * 0.18);
    n.rotation.y = (i - 1.5) * 0.5; cashSpill.add(n);
  }
  cashInside.visible = false; cashHeap.visible = false; cashSpill.visible = false;
}
// ---- SIGNATURE PROP: RED WHISTLE on black lanyard (hero's chest, ALL 4 stills) ----
const whistleG = new THREE.Group(); scene.add(whistleG);
{
  const body = box(0.09, 0.05, 0.03, lam({ color: 0xdc2626 })); whistleG.add(body);
  const mouth = cyl(0.014, 0.014, 0.05, lam({ color: 0x991b1b }), 8);
  mouth.rotation.x = Math.PI / 2; mouth.position.set(0.06, 0, 0.01); whistleG.add(mouth);
  const lany = lam({ color: 0x111827 });
  whistleG.add(bar2D(-0.03, 0.02, -0.07, 0.20, 0, lany, 0.008));
  whistleG.add(bar2D(0.03, 0.02, 0.07, 0.20, 0, lany, 0.008));
  whistleG.visible = false;
}
function placeWhistle(heroX, heroZ, camPos) {
  // Whistle hangs on hero's chest, just in front of the card (card yaws to camera).
  const dx = camPos[0] - heroX, dz = camPos[2] - heroZ;
  const len = Math.hypot(dx, dz) || 1;
  whistleG.position.set(heroX + (dx / len) * 0.16, 0.88, heroZ + (dz / len) * 0.16);
  whistleG.rotation.y = Math.atan2(dx, dz);
  whistleG.visible = true;
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
// RENDER — 53 shots: camera + acting + set state per SHOT (story.js table)
// =====================================================================
// Crowd modes (fix7-verified positions — chehre frame ke andar, koi kata nahi):
// 'jan' = 13 log (3 treadmill + 2 bike + 2 bench + 1 squat + 2 rack + 3 queue),
// 'mar' = sirf 4 log, 'arrive' = sirf 3 queue (naye log aate hain), 'none' = akela hero.
function drawCrowd(mode, f, cp) {
  if (mode === 'none') return;
  const C = crowdCards, O = CROWD;
  // 'janE' = jan MINUS C1/C2 (paas wale 2 treadmill member — shaam ke wide (WE) me bayein
  // kinare unka chehra kata tha; W2R2 me woh waise hi frame se bahar hain).
  if (mode === 'jan' || mode === 'janE') {
    drawChar(C[0], 101, O[0], 'smile', 'reach', 'hang', f, cp, -3.95, 0, -3.5, 0.95, 0, 0.2, 0, null, false);
    if (mode === 'jan') {
      drawChar(C[1], 102, O[1], 'smile', 'reach', 'hang', f, cp, -3.95, 0, -1.7, 0.95, 0, 0.2, 0, null, false);
      drawChar(C[2], 103, O[2], 'smile', 'reach', 'hang', f, cp, -3.95, 0, 0.1, 0.95, 0, 0.2, 0, null, false);
    }
    drawChar(C[3], 104, O[3], 'smile', 'reach', 'hang', f, cp, 0.9, 0, -1.0, 0.95, 0, 0.2, 0, null, false);
    drawChar(C[4], 105, O[4], 'smile', 'reach', 'hang', f, cp, 1.3, 0, -1.4, 0.95, 0, 0.2, 0, null, false);
    drawChar(C[5], 106, O[5], 'grin', 'reach', 'hang', f, cp, 0.9, 0, -3.2, 1.0, 0, 0.3, 0, null, false);
    drawChar(C[6], 107, O[6], 'smile', 'up', 'hang', f, cp, -0.5, 0, -2.8, 1.0, 0, null, 0, null, false);
    drawChar(C[7], 108, O[7], 'smile', 'reach', 'hang', f, cp, -1.5, 0, -3.9, 1.0, 0, 0.25, 0, null, false);
    drawChar(C[8], 109, O[8], 'smile', 'reach', 'hang', f, cp, 1.8, 0, -3.6, 1.0, 0, 0.2, 0, null, false);
    drawChar(C[9], 110, O[9], 'smile', 'reach', 'hang', f, cp, 1.6, 0, -3.0, 1.0, 0, 0.2, 0, null, false);
    drawChar(C[10], 111, O[10], 'smile', 'hang', 'hang', f, cp, -0.5, 0, -0.4, 0.95, 0, null, 0, null, false);
    drawChar(C[11], 112, O[11], 'smile', 'hang', 'hang', f, cp, 0.15, 0, 0.3, 0.9, 0, null, 0, null, false);
    drawChar(C[12], 113, O[12], 'smile', 'hang', 'hang', f, cp, 0.75, 0, 0.6, 0.85, 0, null, 0, null, false);
  } else if (mode === 'mar') {
    drawChar(C[0], 101, O[0], 'neutral', 'reach', 'hang', f, cp, -3.95, 0, -3.5, 0.95, 0, 0.2, 0, null, false);
    drawChar(C[5], 106, O[5], 'neutral', 'reach', 'hang', f, cp, 0.9, 0, -3.2, 1.0, 0, 0.3, 0, null, false);
    drawChar(C[8], 109, O[8], 'neutral', 'reach', 'hang', f, cp, 1.8, 0, -2.8, 1.0, 0, 0.2, 0, null, false);
    drawChar(C[3], 104, O[3], 'neutral', 'reach', 'hang', f, cp, 0.9, 0, -1.0, 0.95, 0, 0.2, 0, null, false);
  } else if (mode === 'arrive') {
    drawChar(C[10], 111, O[10], 'smile', 'hang', 'hang', f, cp, -0.5, 0, -0.4, 0.95, 0, null, 0, null, false);
    drawChar(C[11], 112, O[11], 'smile', 'hang', 'hang', f, cp, 0.15, 0, 0.3, 0.9, 0, null, 0, null, false);
    drawChar(C[12], 113, O[12], 'smile', 'hang', 'hang', f, cp, 0.75, 0, 0.6, 0.85, 0, null, 0, null, false);
  }
}
const ENV_OF_BEAT = { b01: 'morning', b02: 'day', b03: 'dull', b04: 'evening' };
let lastMonth = '';
window.renderFrame = (f) => {
  const shot = shotAt(f), u = shot.u, id = shot.id;
  const cam = camFor(shot, u);
  camera.position.set(...cam.pos); camera.lookAt(...cam.look);
  camera.fov = cam.fov; camera.updateProjectionMatrix();
  if (cam.roll) camera.rotateZ(cam.roll * Math.PI / 180);
  const env = applyEnv(ENV_OF_BEAT[shot.beat]);
  motes.forEach((sp, i) => {
    sp.position.y += Math.sin(f * 0.05 + i * 2.1) * 0.0012;
    sp.position.x += Math.cos(f * 0.02 + i) * 0.0009;
  });
  ALL_CARDS.forEach((c) => c.hide());
  whistleG.visible = false;
  const cp = cam.pos;
  gymG.visible = true;
  // ---- props default band (har frame reset — sirf apne section me dikhe) ----
  glintFee.material.opacity = 0; glintGalla.material.opacity = 0; glintTill.material.opacity = 0;
  if (lightCone) lightCone.visible = false;
  feeBoardG.visible = false;
  gallaBoard.visible = false;
  if (tillLid) tillLid.rotation.x = 0;
  cashInside.visible = false; cashHeap.visible = false; cashSpill.visible = false;
  const fl = FLASH[id];
  flashPlane.material.opacity = fl ? Math.max(0, 1 - Math.abs(f - fl.at) / (fl.dur / 2)) : 0;
  // ghadi ki suiyaan — env ke hisaab se (subah 6, din 10, dull 11, shaam 6)
  if (clockHour && clockMin) {
    clockHour.rotation.z = -(env.clockHr / 12) * Math.PI * 2;
    clockMin.rotation.z = 0;
  }
  // month board — beat ke hisaab se (b01/b02 JANUARY, b03/b04 MARCH — twist March ke baad)
  const month = (shot.beat === 'b01' || shot.beat === 'b02') ? 'JANUARY' : 'MARCH';
  if (month !== lastMonth) { drawMonth(month); lastMonth = month; }
  // SMOKE QA ROUND 2: WE wide (fov 74) me calendar ka kinara dayein jhaankta tha (kata hua
  // sliver). WE shots me calendar chhupao — mahina T/TC/GB (counter) shots me saaf dikhta
  // hai; cut par pop nahi dikhta (angle badal jata hai).
  if (monthBoard) monthBoard.visible = (shot.camName !== 'WE');

  // ---- per-shot set state (board visibility + till + glints) ----
  // Fee board: b02/b03 me hamesha; b01 me sirf L7/L8 shots (board shot ke saath, ≤0.5 s sync).
  // GALLA board: b04 me hamesha (till reveal + har twist shot).
  const showFee = shot.board === 'fee' || shot.beat === 'b02' || shot.beat === 'b03';
  const showGalla = shot.board === 'galla' || shot.beat === 'b04';
  if (showFee) { feeBoardG.visible = true; glintFee.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3); }
  if (showGalla) {
    gallaBoard.visible = true;
    glintGalla.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3);
    glintTill.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3);
  }
  // Light cone: subah (b01) me hero par — khaali gym, intezaar.
  if (lightCone) lightCone.visible = (shot.beat === 'b01');
  // Till: b04 me khulta (f841 band -> f881 khula, 69° — chehra dhake nahi), cash dikhta hai.
  if (shot.beat === 'b04') {
    const lp = clamp((f - 841) / 40, 0, 1);
    if (tillLid) tillLid.rotation.x = -1.2 * M.surge(lp);
    cashInside.visible = true; cashHeap.visible = true; cashSpill.visible = true;
  }
  // ---- hero (expression timeline + envelope lip-sync) + crowd, shot table ke hisaab se ----
  drawCrowd(shot.crowd, f, cp);
  const { expr, mix } = heroExprAt(f);
  drawChar(heroCard, 91, HERO, expr, shot.R, shot.L, f, cp, shot.hx, 0, shot.hz, shot.hs, 0, null, shot.tilt, mouthKind(f), false, false, mix);
  placeWhistle(shot.hx, shot.hz, cp);
  updateProxiesW();
  renderer.render(scene, camera);
};
window.TOTAL = TOTAL;
window.ready = Promise.resolve();
