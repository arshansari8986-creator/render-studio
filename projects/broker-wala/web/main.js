// "Broker Wala" — FULL FILM (35 shots, 1703f @30fps = 56.77 s). Title: "Ghar Kisi Ka, Lakh Uska!"
// 5 locations (A bazaar gali / B chhoti dukaan / C flat-society / D rental street / E rented room)
// + counter set piece (loc B). SPEAKER-VISIBLE RULE: har shot me speaker===who (story.js
// assert); member shots me member on-screen acting karta hai, hero narration voiceover hai
// (mouth null, lip-sync nahi). Lip-sync SIRF hero shots me (envelope.js, gain 1.7).
// Fresh hero: dusty-teal shirt #5a7d7a, brown trousers, skin #a67c52, small moustache,
// thick brows. Signature prop: BRASS KEY BUNCH (5 keys) — hero shots me right hand/chest.
// World V3: LIT materials ONLY (lam() + paint.js textures) + soft shadows + warm + cool light
// in every shot. MeshBasicMaterial ONLY for flash plane / glints / bulb glow / lit windows.
// NO captions, NO music. Numbers as objects: FOR SALE board (C), till cash (B), 10 TO LET
// boards (D), 3 keys + 3 lit windows (C), GALLA board + cash mountain (B q26), receipt (E).
// LAYOUT LOCK: every prop's base touches a surface; hero text/face inside frame with margin.
// Contract: window.ready, window.renderFrame(f).
import * as THREE from 'three';
import * as FX from './fx.js';
import * as T from './toon.js';
import { idle, blinkAt, walk, q, M, clamp } from './motion.js';
import { tex, planks, plaster, stone, dirt, wetConcrete, tiles, tinRoof, marble } from './paint.js';
import { TOTAL, shotAt, camFor, FLASH, heroExprAt, memberExprAt, mouthKind, tillAngle, shutterOpen } from './story.js';
import { buildStreet, buildFlat, buildRental, buildRoom } from './locations.js';

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
const buyerCard = new Card();
const sellerCard = new Card();
const tenantCard = new Card();
const childCard = new Card();
const rivalCard = new Card();
const crowdCards = [];
for (let i = 0; i < 10; i++) crowdCards.push(new Card());
const ALL_CARDS = [heroCard, buyerCard, sellerCard, tenantCard, childCard, rivalCard, ...crowdCards];
// FRESH — HERO (Broker Wala, sirf is video ke liye): dusty-teal shirt #5a7d7a, brown
// trousers (toon card me tunic hi shirt hai), warm skin #a67c52, chhote baal, patli
// moochh, moti bhaavein. Gym ka laal tee + peela towel NAHI.
const HERO = { tunic: '#5a7d7a', shirt: '#f8f3e8', skin: '#a67c52', hair: '#1e1a20', hairStyle: 'thick', hairLine: 0.30, brows: '#1e1a20', moustache: '#2a1c12' };
const BUYER = { tunic: '#8a5a5a', shirt: '#f8f3e8', skin: '#96603a', hair: '#2b211c', hairStyle: 'side' };
const SELLER = { tunic: '#7a7a5a', shirt: '#f8f3e8', skin: '#a67c52', hair: '#f4f1ea', hairStyle: 'thick', moustache: '#f4f1ea' };
const TENANT = { tunic: '#7a5a7a', shirt: '#f8f3e8', skin: '#8a5a3b', hair: '#1e1a20', hairStyle: 'thick', dress: '#7a5a7a' };
const CHILD = { tunic: '#5a7a5a', shirt: '#f8f3e8', skin: '#a67c52', hair: '#1e1a20', hairStyle: 'thick' };
const RIVAL = { tunic: '#a8842a', shirt: '#f8f3e8', skin: '#96603a', hair: '#2b211c', hairStyle: 'side', moustache: '#2a1c12' };
// CROWD — muted natural (tez rang sirf hero par). Seeds 310-319.
const CROWD = [
  { tunic: '#6a6a5a', shirt: '#f8f3e8', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick' },
  { tunic: '#7c5a2e', shirt: '#f8f3e8', skin: '#9a6a42', hair: '#2b211c', hairStyle: 'side' },
  { tunic: '#5a6b8a', shirt: '#f8f3e8', skin: '#8a5a30', hair: '#14100c', hairStyle: 'thick' },
  { tunic: '#8a4a6b', shirt: '#f8f3e8', skin: '#b0703a', hair: '#1e1a20', hairStyle: 'thick', dress: '#8a4a6b' },
  { tunic: '#9a6a3a', shirt: '#f8f3e8', skin: '#a06a3c', hair: '#2b211c', hairStyle: 'side' },
  { tunic: '#3f5a7a', shirt: '#f8f3e8', skin: '#8a5a30', hair: '#14100c', hairStyle: 'thick' },
  { tunic: '#6b4a7a', shirt: '#f8f3e8', skin: '#9a6a42', hair: '#1e1a20', hairStyle: 'thick' },
  { tunic: '#7a3a3a', shirt: '#f8f3e8', skin: '#b0703a', hair: '#2b211c', hairStyle: 'side' },
  { tunic: '#4a5a3a', shirt: '#f8f3e8', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick' },
  { tunic: '#8a7a3a', shirt: '#f8f3e8', skin: '#8a5a30', hair: '#2b211c', hairStyle: 'side' },
];
const WHO_CARD = { buyer: buyerCard, seller: sellerCard, tenant: tenantCard, rival: rivalCard };
const WHO_OUTFIT = { buyer: BUYER, seller: SELLER, tenant: TENANT, rival: RIVAL };
const WHO_SEED = { buyer: 301, seller: 302, tenant: 303, rival: 305 };

// =====================================================================
// ENVS — dawn (gali subah) / day (dukaan din) / bright (flat din) / golden
// (rental shaam) / night (kamra raat) / evening (counter shaam, warm tube)
// =====================================================================
const ENVS = {
  dawn: { bg: 0xe8d3b8, fogC: 0xe6d8c4, fogNear: 10, fogFar: 46, hemi: 0.85, hemiC: 0xffe0b8, hemiG: 0x8a7a6a, sun: 1.3, sunC: 0xffc98a, sunPos: [-5, 8, 7], bounce: 0.4, bounceC: 0x9db8d9, expo: 1.12, win: 0, tube: 0, clockHr: 6 },
  day: { bg: 0xc8dcec, fogC: 0xd0dde6, fogNear: 12, fogFar: 48, hemi: 1.0, hemiC: 0xffe8c8, hemiG: 0x8a7a5a, sun: 1.6, sunC: 0xfff0c8, sunPos: [-9, 6, 5], bounce: 0.35, bounceC: 0x9db8d9, expo: 1.13, win: 3.0, tube: 2.0, clockHr: 10 },
  bright: { bg: 0xd8e8ee, fogC: 0xd8e4e0, fogNear: 10, fogFar: 46, hemi: 1.05, hemiC: 0xffe8c8, hemiG: 0x8a7a5a, sun: 1.7, sunC: 0xfff0c8, sunPos: [-10, 4.5, 6], bounce: 0.4, bounceC: 0x9db8d9, expo: 1.12, win: 5.0, tube: 0, clockHr: 10 },
  golden: { bg: 0xe8b078, fogC: 0xe8c098, fogNear: 8, fogFar: 38, hemi: 1.0, hemiC: 0xffe0b8, hemiG: 0x8a6a4a, sun: 1.5, sunC: 0xff8a3d, sunPos: [-11, 2.6, 4], bounce: 0.35, bounceC: 0xffd9a0, expo: 1.12, win: 1.5, tube: 0, clockHr: 6 },
  night: { bg: 0x2a3348, fogC: 0x2a3348, fogNear: 8, fogFar: 30, hemi: 1.1, hemiC: 0x9ab0d0, hemiG: 0x4a4a58, sun: 0.65, sunC: 0x9ab0d0, sunPos: [6, 8, 4], bounce: 0.4, bounceC: 0x9ab0d0, expo: 1.12, win: 2.0, winC: 0x9ab0d0, tube: 0, clockHr: 10 },
  evening: { bg: 0xe8b078, fogC: 0xe8c098, fogNear: 8, fogFar: 38, hemi: 1.1, hemiC: 0xffe0b8, hemiG: 0x8a6a4a, sun: 1.5, sunC: 0xff8a3d, sunPos: [-11, 2.6, 4], bounce: 0.35, bounceC: 0xffd9a0, expo: 1.12, win: 1.5, tube: 6.0, clockHr: 6 },
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
  winLight.color.set(e.winC || 0xffd9a0);
  tubeLight.intensity = e.tube;
  tubeBulbMat.color.set(e.tube > 2 ? 0xffe9a8 : 0xcfd8dc);
  return e;
};

// =====================================================================
// SET — BROKER KI CHHOTI DUKAAN (x -5..5, back wall z=-6). LAYOUT LOCK: every
// prop's base touches a surface; hero text/face margin ke saath frame ke andar.
// Sage-grey deewaar, lakdi counter + desk, key board, till, cash, wall clock.
// =====================================================================
const shopG = new THREE.Group(); scene.add(shopG);
let lightCone = null;
let clockHour = null, clockMin = null;
let tillLid = null;
const motes = [];
const glintGalla = mkGlint(2.3, 3.2, -5.6, 0.6);
const glintTill = mkGlint(2.6, 1.4, -3.0, 0.5);
const glintKeys = mkGlint(0.6, 2.6, -5.7, 0.4);

const clockTex = textBoard(256, 256, (g, w, h) => {
  g.fillStyle = '#8a9a8a'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#eef2f5'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
  g.strokeStyle = '#4a3220'; g.lineWidth = 12; g.beginPath(); g.arc(128, 128, 114, 0, 7); g.stroke();
  g.fillStyle = '#1e293b'; g.textAlign = 'center'; g.font = 'bold 40px Arial';
  g.fillText('12', 128, 52); g.fillText('6', 128, 224); g.fillText('3', 210, 142); g.fillText('9', 46, 142);
  g.fillStyle = '#8a6a3a'; g.beginPath(); g.arc(128, 128, 8, 0, 7); g.fill();
});
// Vertical walnut slat texture — counter front + wainscot (local canvas texture).
const slatTex = (() => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  for (let x = 0; x < 8; x++) {
    g.fillStyle = x % 2 ? '#6b4a2f' : '#8a6a45'; g.fillRect(x * 32, 0, 32, 128);
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x * 32, 0, 3, 128);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
// GALLA board texture — gold-on-dark "GALLA ₹6,00,000" (proof-read; deep green bg).
const gallaBoardTex = textBoard(640, 360, (g, w, h) => {
  g.fillStyle = '#14532d'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#facc15'; g.lineWidth = 14; g.strokeRect(10, 10, w - 20, h - 20);
  g.textAlign = 'center'; g.fillStyle = '#f8fafc';
  g.font = 'bold 52px Arial'; g.fillText('GALLA', w / 2, 84);
  g.fillStyle = '#facc15'; g.font = 'bold 96px Arial'; g.fillText('₹6,00,000', w / 2, 210);
  g.fillStyle = '#f8fafc'; g.font = 'bold 40px Arial'; g.fillText('BROKER  •  CHHE LAKH', w / 2, 300);
});
// TILL TAG texture — gold-on-dark "₹1,00,000", GALLA board jaisi style (q12 only).
const tillTagTex = textBoard(640, 300, (g, w, h) => {
  g.fillStyle = '#14532d'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#facc15'; g.lineWidth = 12; g.strokeRect(9, 9, w - 18, h - 18);
  g.textAlign = 'center'; g.fillStyle = '#facc15';
  g.font = 'bold 110px Arial'; g.fillText('₹1,00,000', w / 2, 195);
});
// Poster texture — "IMANDARI • MEHNAT • BHAROSA" (dark charcoal bg + brass text).
const posterTex = textBoard(512, 384, (g, w, h) => {
  g.fillStyle = '#2f3437'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d9a514'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
  g.textAlign = 'center';
  g.fillStyle = '#d9a514'; g.font = 'bold 64px Arial'; g.fillText('IMANDARI', w / 2, 120);
  g.fillStyle = '#f8fafc'; g.font = 'bold 64px Arial'; g.fillText('MEHNAT', w / 2, 220);
  g.fillStyle = '#d9a514'; g.font = 'bold 64px Arial'; g.fillText('BHAROSA', w / 2, 320);
});

function brassKey(x, y, z, ry = 0, s = 1) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.035 * s, 0.008 * s, 6, 14), lam({ color: 0xd9a845 }));
  ring.position.set(0, 0.05 * s, 0); g.add(ring);
  const stem = cyl(0.008 * s, 0.008 * s, 0.09 * s, lam({ color: 0xd9a845 }), 6);
  stem.position.set(0, -0.01 * s, 0); g.add(stem);
  const tooth = box(0.03 * s, 0.015 * s, 0.008 * s, lam({ color: 0xd9a845 })); tooth.position.set(0.012 * s, -0.045 * s, 0); g.add(tooth);
  g.position.set(x, y, z); g.rotation.y = ry; return g;
}

{
  const S = shopG;
  // FLOOR — light wood planks + sage rug strip.
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), lam({ map: tex(planks(54), 3, 3) }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.02, 0); floor.receiveShadow = true; S.add(floor);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.4), lam({ color: 0x8a7a5a }));
  rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.012, 0.7); rug.receiveShadow = true; S.add(rug);
  // BACK WALL — sage-grey #8a9a8a + walnut WAINSCOT (slats, y 0..1.1). EK HI flat surface.
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 5.0), lam({ color: 0x8a9a8a }));
  backWall.position.set(0, 2.5, -6); backWall.receiveShadow = true; S.add(backWall);
  const wainscot = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 1.1), lam({ map: slatTex }));
  wainscot.position.set(0, 0.55, -5.97); S.add(wainscot);
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 5.0), lam({ color: 0x7a8a7a }));
  leftWall.rotation.y = Math.PI / 2; leftWall.position.set(-5, 2.5, -1.5); S.add(leftWall);
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 5.0), lam({ color: 0x7a8a7a }));
  rightWall.rotation.y = -Math.PI / 2; rightWall.position.set(5, 2.5, -1.5); S.add(rightWall);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(11, 10), lam({ color: 0xb8b0a0 }));
  ceiling.rotation.x = Math.PI / 2; ceiling.position.set(0, 5.0, -1.5); S.add(ceiling);
  // WINDOW (back wall left, -3.2, 2.4) — day sky outside + buildings.
  const skyTexC = (() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 256;
    const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#7fb2d9'); gr.addColorStop(0.6, '#cfe4ef'); gr.addColorStop(1, '#f6e8c8');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const skyOut = new THREE.Mesh(new THREE.PlaneGeometry(14, 7), bas({ map: skyTexC, fog: false }));
  skyOut.position.set(0, 2.5, -13); S.add(skyOut);
  [[-4, 2.0, 0xa08a6a], [0.5, 2.8, 0x7a8a9a], [4, 2.4, 0xb09080]].forEach(([bx, bh, col]) => {
    const b = box(3.2, bh, 0.8, lam({ color: col })); b.position.set(bx, bh / 2, -12.2); S.add(b);
  });
  const winFrameMat = lam({ color: 0x4a3220 });
  [[-3.2, 3.08, 2.1, 0.08], [-3.2, 1.72, 2.1, 0.08], [-4.24, 2.4, 0.08, 1.44], [-2.16, 2.4, 0.08, 1.44]].forEach(([wx, wy, ww, wh]) => {
    const f = box(ww, wh, 0.06, winFrameMat); f.position.set(wx, wy, -5.94); S.add(f);
  });
  [-3.87, -2.53].forEach((bx) => {
    const bar = box(0.05, 1.36, 0.04, winFrameMat); bar.position.set(bx, 2.4, -5.95); S.add(bar);
  });
  const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.36), new THREE.MeshPhongMaterial({ color: 0x9fc8d9, shininess: 140, specular: 0xcfeaff, transparent: true, opacity: 0.35 }));
  winGlass.position.set(-3.2, 2.4, -5.96); S.add(winGlass);
  // LIGHT CONE — window se desk tak (subah, b02 me ON)
  lightCone = new THREE.Mesh(new THREE.ConeGeometry(0.95, 3.4, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  lightCone.position.set(-1.4, 1.6, -3.8); lightCone.rotation.set(0.4, 0, -0.35); lightCone.visible = false; S.add(lightCone);
  // POSTER + WALL CLOCK — back wall
  const poster = boardMesh(0.9, 0.68, posterTex); poster.position.set(-1.2, 2.1, -5.95); S.add(poster);
  const clockFace = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), lam({ map: clockTex }));
  clockFace.position.set(-0.9, 3.2, -5.94); S.add(clockFace);
  const hourGeo = new THREE.BoxGeometry(0.03, 0.15, 0.01); hourGeo.translate(0, 0.065, 0);
  clockHour = new THREE.Mesh(hourGeo, lam({ color: 0x1e293b })); clockHour.position.set(-0.9, 3.2, -5.93); S.add(clockHour);
  const minGeo = new THREE.BoxGeometry(0.02, 0.22, 0.01); minGeo.translate(0, 0.1, 0);
  clockMin = new THREE.Mesh(minGeo, lam({ color: 0x1e293b })); clockMin.position.set(-0.9, 3.2, -5.925); S.add(clockMin);
  // KEY BOARD (latki chaabiyan) — back wall centre (0.6, 2.4), wooden board + 6 brass keys.
  const keyBoard = box(1.0, 1.3, 0.04, lam({ color: 0x5d4127 })); keyBoard.position.set(0.6, 2.4, -5.95); S.add(keyBoard);
  [[0.35, 2.75], [0.6, 2.75], [0.85, 2.75], [0.35, 2.3], [0.6, 2.3], [0.85, 2.3]].forEach(([kx, ky], i) => {
    const hook = box(0.03, 0.03, 0.06, lam({ color: 0x374151 })); hook.position.set(kx, ky + 0.12, -5.92); S.add(hook);
    S.add(brassKey(kx, ky, -5.9, (i % 3 - 1) * 0.3, 1.1));
  });
  // WALL SHELF above counter (y 3.7) — dark metal shelf + 3 bottles + files stack.
  {
    const shelf = box(2.9, 0.05, 0.25, lam({ color: 0x2f3437 })); shelf.position.set(2.6, 3.7, -5.83); S.add(shelf);
    [1.5, 3.7].forEach((bx) => { const br = box(0.05, 0.18, 0.05, lam({ color: 0x111827 })); br.position.set(bx, 3.6, -5.88); S.add(br); });
    [[1.5, 0xf8f3e8], [2.6, 0x111827], [3.7, 0xd9a514]].forEach(([bx, col]) => {
      const b = cyl(0.05, 0.05, 0.28, lam({ color: col }), 10); b.position.set(bx, 3.87, -5.83); S.add(b);
    });
    // files stack on shelf (left end)
    for (let i = 0; i < 3; i++) {
      const f = box(0.3, 0.04, 0.22, lam({ color: i === 2 ? 0x8a6a3a : 0xf8f3e8 }));
      f.position.set(1.9, 3.75 + i * 0.045, -5.83); f.rotation.y = (i - 1) * 0.1; S.add(f);
    }
  }
  // LED PANELS (flat, ceiling par)
  [[-1.5, -3.0], [2.0, -3.0]].forEach(([lx, lz]) => {
    const panel = box(1.2, 0.05, 0.5, tubeBulbMat); panel.position.set(lx, 4.96, lz); S.add(panel);
    const pFrame = box(1.3, 0.04, 0.6, lam({ color: 0x2f3437 })); pFrame.position.set(lx, 4.99, lz); S.add(pFrame);
  });
  // ---- SIGNING DESK (0, -1.8) — deal paper par sign; hero iske peeche khada ---
  // Desk top y 0.75; paper + pen + keys on top; legs farsh par.
  const deskTop = box(1.6, 0.06, 0.8, lam({ map: tex(planks(46), 1, 1) })); deskTop.position.set(0, 0.75, -1.8); S.add(deskTop);
  [[-0.7, -2.15], [0.7, -2.15], [-0.7, -1.45], [0.7, -1.45]].forEach(([lx, lz]) => {
    const leg = box(0.07, 0.72, 0.07, lam({ color: 0x5d4127 })); leg.position.set(lx, 0.36, lz); S.add(leg);
  });
  const deskFront = box(1.6, 0.72, 0.05, lam({ map: slatTex })); deskFront.position.set(0, 0.38, -1.42); S.add(deskFront);
  const paperL = box(0.3, 0.015, 0.4, lam({ color: 0xf8f3e8 })); paperL.position.set(-0.18, 0.79, -1.8); paperL.rotation.y = 0.08; S.add(paperL);
  const paperR = box(0.3, 0.015, 0.4, lam({ color: 0xffffff })); paperR.position.set(0.14, 0.79, -1.8); paperR.rotation.y = -0.08; S.add(paperR);
  const pen = cyl(0.008, 0.008, 0.16, lam({ color: 0x1f2937 }), 6);
  pen.rotation.z = Math.PI / 2; pen.rotation.y = 0.5; pen.position.set(0.05, 0.80, -1.75); S.add(pen);
  // keys lying on desk (hero's bunch, jab haath me nahi)
  S.add(brassKey(-0.55, 0.82, -1.95, 0.4, 1.0));
  S.add(brassKey(-0.45, 0.82, -1.85, -0.3, 1.0));
  // ---- COUNTER / RECEPTION DESK (2.6, -3.4) + TILL ----
  const counter = box(2.0, 0.95, 0.7, lam({ map: slatTex })); counter.position.set(2.6, 0.475, -3.4); S.add(counter);
  const counterTop = box(2.2, 0.06, 0.85, lam({ color: 0x3a3a38 })); counterTop.position.set(2.6, 0.98, -3.4); S.add(counterTop);
  const kickPlate = box(2.0, 0.08, 0.02, lam({ color: 0xb08d3e })); kickPlate.position.set(2.6, 0.04, -3.04); S.add(kickPlate);
  // phone + register book on counter (bases on counter top y 1.01)
  const phoneBody = box(0.16, 0.02, 0.28, lam({ color: 0x111827 })); phoneBody.position.set(1.9, 1.02, -3.2); S.add(phoneBody);
  const regBook = box(0.35, 0.04, 0.25, lam({ color: 0x8a6a3a })); regBook.position.set(3.05, 1.03, -3.6); S.add(regBook);
  const shaker = cyl(0.05, 0.05, 0.18, lam({ color: 0xf8f3e8 }), 10); shaker.position.set(3.2, 1.1, -3.2); S.add(shaker);
  // ---- CEILING FAN (static, deterministic — spin nahi) ----
  {
    const rod = cyl(0.03, 0.03, 0.35, lam({ color: 0x2f3437 }), 8); rod.position.set(0, 4.8, -1.5); S.add(rod);
    const hub = cyl(0.12, 0.12, 0.1, lam({ color: 0x2f3437 }), 12); hub.position.set(0, 4.6, -1.5); S.add(hub);
    for (let i = 0; i < 4; i++) {
      const blade = box(0.9, 0.02, 0.18, lam({ color: 0x5d4127 }));
      const ang = (i * Math.PI) / 2;
      blade.position.set(Math.cos(ang) * 0.55, 4.6, -1.5 + Math.sin(ang) * 0.55);
      blade.rotation.y = -ang; S.add(blade);
    }
  }
  // ---- FOREGROUND PROPS (depth layer 1 — frame corners, below face line) ----
  // Brass keys dish + cash tin on a small side stool (left foreground)
  const stool = cyl(0.28, 0.32, 0.45, lam({ color: 0x5d4127 }), 12); stool.position.set(-1.6, 0.225, 1.2); S.add(stool);
  const dish = cyl(0.16, 0.12, 0.05, lam({ color: 0xd9a845 }), 12); dish.position.set(-1.6, 0.48, 1.2); S.add(dish);
  S.add(brassKey(-1.6, 0.52, 1.2, 0.2, 0.9));
  // dust motes near window (light visible)
  for (let i = 0; i < 8; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, opacity: 0.10, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffe9b0 }));
    sp.position.set(-3 + (i * 0.9) % 4.5, 1.2 + (i % 3) * 0.7, -4.5 + (i % 2) * 1.2);
    sp.userData.bx = sp.position.x; sp.userData.by = sp.position.y; sp.userData.bz = sp.position.z;
    sp.scale.setScalar(0.08 + (i % 3) * 0.03);
    scene.add(sp); motes.push(sp);
  }
}
shopG.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
// ---- LOC A / C / D / E — locations.js se; sirf active location visible ----
const streetG = buildStreet(); scene.add(streetG);
const flatG = buildFlat(); scene.add(flatG);
const rentalG = buildRental(); scene.add(rentalG);
const roomG = buildRoom(); scene.add(roomG);

// ---- GALLA BOARD (back wall above counter) — visible sirf q26 (board='galla') ----
const gallaBoard = boardMesh(1.5, 0.8, gallaBoardTex); gallaBoard.position.set(2.3, 2.95, -5.94); gallaBoard.visible = false; scene.add(gallaBoard);
// ---- TILL TAG (till ke saamne) — visible sirf q12 (board='till1lakh') ----
const tillTag = boardMesh(0.5, 0.24, tillTagTex); tillTag.position.set(2.6, 1.15, -3.17); tillTag.visible = false; scene.add(tillTag);
// Counter ke peeche dark walnut wood panels (sage deewaar se alag pehchan).
// FIX R1 (still-07/11): was a 2.0x2.6 flat brown void filling the frame.
// Narrower panel + two shelves with jars/files so the wall reads as a shop.
const counterPanel = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.2), lam({ color: 0x6b4a2f }));
counterPanel.position.set(2.7, 1.35, -5.965); counterPanel.visible = false; scene.add(counterPanel);
const counterPanelDetail = new THREE.Group(); scene.add(counterPanelDetail);
{
  [0.95, 1.75].forEach((sy) => {
    const sh = box(1.4, 0.05, 0.1, lam({ color: 0x3a2a1a })); sh.position.set(2.7, sy, -5.92); counterPanelDetail.add(sh);
  });
  [[2.3, 0.95, 0xf8f3e8], [2.7, 0.95, 0x8a6a3a], [3.05, 0.95, 0x7a9a6a]].forEach(([jx, sy, col]) => {
    const jar = cyl(0.06, 0.06, 0.22, lam({ color: col }), 10); jar.position.set(jx, sy + 0.14, -5.92); counterPanelDetail.add(jar);
  });
  for (let i = 0; i < 3; i++) {
    const f = box(0.32, 0.04, 0.22, lam({ color: i === 2 ? 0x8a6a3a : 0xf8f3e8 }));
    f.position.set(2.45, 1.8 + i * 0.045, -5.92); f.rotation.y = (i - 1) * 0.12; counterPanelDetail.add(f);
  }
  // FIX R2 (still-06): rate board ("FLAT • KIRAYA / DUKAAN") CT2 frame ke dayein kinare
  // par kata hua tha — hata diya (move karne se dusre counter shots me naye occlusion
  // ka risk tha; panel me shelves/jars/files detail ke liye kaafi hain).
  counterPanelDetail.visible = false;
}

// ---- TILL (on counter) + CASH (3 levels: ₹1 lakh / ₹2 lakh / ₹6 lakh mountain) ----
const tillG = new THREE.Group(); scene.add(tillG);
const cashInside = new THREE.Group(); scene.add(cashInside);
const cashSmall = new THREE.Group(); scene.add(cashSmall);
const cashMed = new THREE.Group(); scene.add(cashMed);
const cashMountain = new THREE.Group(); scene.add(cashMountain);
const cashSpill = new THREE.Group(); scene.add(cashSpill);
{
  const tbox = box(0.55, 0.28, 0.4, lam({ color: 0x2f3437 })); tbox.position.set(2.6, 1.15, -3.4); tillG.add(tbox);
  const lock = box(0.08, 0.06, 0.02, lam({ color: 0xb08d3e })); lock.position.set(2.6, 1.16, -3.19); tillG.add(lock);
  const lidGeo = new THREE.BoxGeometry(0.55, 0.04, 0.4); lidGeo.translate(0, 0, 0.2);
  tillLid = new THREE.Mesh(lidGeo, lam({ color: 0x6b7280 }));
  tillLid.position.set(2.6, 1.3, -3.6); tillG.add(tillLid);
  const lidEdge = box(0.55, 0.045, 0.05, lam({ color: 0xb08d3e })); lidEdge.position.set(0, 0, 0.38); tillLid.add(lidEdge);
  const lidRidge = box(0.55, 0.02, 0.06, lam({ color: 0x9ca3af })); lidRidge.position.set(0, 0.028, 0.2); tillLid.add(lidRidge);
  for (let i = 0; i < 5; i++) {
    const n = box(0.3, 0.28, 0.012, lam({ color: i % 2 ? 0x3f9e4d : 0x6fbf73 }));
    n.position.set(2.6 + (i - 2) * 0.05, 1.28, -3.4 + (i - 2) * 0.02); n.rotation.z = (i - 2) * 0.12; cashInside.add(n);
  }
  // ₹1 lakh — 1 stack (8 notes) + band, counter par till ke bagal me
  for (let i = 0; i < 8; i++) {
    const n = box(0.34, 0.016, 0.18, lam({ color: i % 2 ? 0x3f9e4d : 0x6fbf73 }));
    n.position.set(3.1 + (i % 3 - 1) * 0.05, 1.03 + i * 0.016, -3.3 + (Math.floor(i / 3) - 1) * 0.06);
    n.rotation.y = (i % 4 - 1.5) * 0.35; cashSmall.add(n);
  }
  const bandW = box(0.08, 0.03, 0.19, lam({ color: 0xf8f3e8 })); bandW.position.set(3.1, 1.17, -3.3); cashSmall.add(bandW);
  // ₹2 lakh — 2 stacks
  for (let s = 0; s < 2; s++) {
    for (let i = 0; i < 8; i++) {
      const n = box(0.34, 0.016, 0.18, lam({ color: i % 2 ? 0x3f9e4d : 0x6fbf73 }));
      n.position.set(3.0 + s * 0.45 + (i % 3 - 1) * 0.04, 1.03 + i * 0.016, -3.3 + (Math.floor(i / 3) - 1) * 0.05);
      n.rotation.y = (i % 4 - 1.5) * 0.3; cashMed.add(n);
    }
    const band = box(0.08, 0.03, 0.19, lam({ color: 0xf8f3e8 })); band.position.set(3.0 + s * 0.45, 1.17, -3.3); cashMed.add(band);
  }
  // ₹6 lakh — cash ka PAHAAD (FIX R1, still-11): was 3 flat slabs ~0.22 tall.
  // Now 3 stacks x24 notes (~0.4) + 2 top stacks x10 -> top ~1.6, hero ke
  // kandhe tak, counter par bikhra hua — pahaad unmissable.
  for (let s = 0; s < 3; s++) {
    for (let i = 0; i < 24; i++) {
      const n = box(0.34, 0.016, 0.18, lam({ color: i % 2 ? 0x3f9e4d : 0x6fbf73 }));
      n.position.set(2.35 + s * 0.45 + (i % 3 - 1) * 0.05, 1.03 + i * 0.016, -3.25 + (Math.floor(i / 3) - 2) * 0.06);
      n.rotation.y = (i % 4 - 1.5) * 0.35; cashMountain.add(n);
    }
    const band = box(0.08, 0.05, 0.19, lam({ color: 0xf8f3e8 })); band.position.set(2.35 + s * 0.45, 1.42, -3.25); cashMountain.add(band);
  }
  for (let s = 0; s < 2; s++) {
    for (let i = 0; i < 10; i++) {
      const n = box(0.32, 0.016, 0.17, lam({ color: i % 2 ? 0x3f9e4d : 0x6fbf73 }));
      n.position.set(2.55 + s * 0.45 + (i % 3 - 1) * 0.04, 1.44 + i * 0.016, -3.3 + (Math.floor(i / 3) - 1) * 0.05);
      n.rotation.y = (i % 4 - 1.5) * 0.4; cashMountain.add(n);
    }
    const band = box(0.08, 0.04, 0.18, lam({ color: 0xf8f3e8 })); band.position.set(2.55 + s * 0.45, 1.6, -3.3); cashMountain.add(band);
  }
  for (let i = 0; i < 10; i++) {
    const n = box(0.3, 0.012, 0.15, lam({ color: i % 2 ? 0x3f9e4d : 0x6fbf73 }));
    n.position.set(2.2 + (i % 5) * 0.22, 1.02 + Math.floor(i / 5) * 0.014, -3.0 + (i % 2) * 0.15);
    n.rotation.y = (i - 5) * 0.35; cashMountain.add(n);
  }
  // SPILL — loose notes on counter top
  for (let i = 0; i < 4; i++) {
    const n = box(0.3, 0.012, 0.15, lam({ color: i % 2 ? 0x3f9e4d : 0x6fbf73 }));
    n.position.set(2.1 + (i % 2) * 0.25, 1.02 + (i > 1 ? 0.012 : 0), -3.15 + (Math.floor(i / 2) - 0.5) * 0.18);
    n.rotation.y = (i - 1.5) * 0.5; cashSpill.add(n);
  }
  cashInside.visible = false; cashSmall.visible = false; cashMed.visible = false;
  cashMountain.visible = false; cashSpill.visible = false;
}

// ---- SIGNATURE PROP: BRASS KEY BUNCH (5 keys on a ring) — hero's chest/hand ----
const keysG = new THREE.Group(); scene.add(keysG);
{
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.01, 6, 16), lam({ color: 0xd9a845 }));
  keysG.add(ring);
  for (let i = 0; i < 5; i++) {
    const k = brassKey(0, 0, 0, 0, 0.9);
    k.position.set(-0.06 + i * 0.03, -0.09 - (i % 2) * 0.02, 0.01);
    k.rotation.z = (i - 2) * 0.25;
    keysG.add(k);
  }
  keysG.visible = false;
}
function placeKeys(heroX, heroZ, camPos, belt = false) {
  const dx = camPos[0] - heroX, dz = camPos[2] - heroZ;
  const len = Math.hypot(dx, dz) || 1;
  // Right hand side: image-right offset + camera-dir offset (haath ke paas, chehre se neeche)
  const cdx = dx / len, cdz = dz / len;
  const rx = cdz, rz = -cdx;
  if (belt) { keysG.position.set(heroX + rx * 0.14 + cdx * 0.06, 0.88, heroZ + rz * 0.14 + cdz * 0.06); }
  else keysG.position.set(heroX + rx * 0.28 + cdx * 0.10, 0.98, heroZ + rz * 0.28 + cdz * 0.10);
  keysG.rotation.y = Math.atan2(dx, dz);
  keysG.visible = true;
}

// ---- HELD PROPS (toward-lens shots) ----
// q02 keys | q10/q12/q15/q16/q17 cash | q24/q25 3 keys | q28 receipt | q29 receipt+cash | q31 phone
const receiptTex = textBoard(256, 320, (g, w, h) => {
  g.fillStyle = '#f8f3e8'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#5d4127'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = '#5d4127'; g.font = 'bold 34px Arial'; g.textAlign = 'center';
  g.fillText('KIRAYA', w / 2, 60);
  g.fillStyle = '#8a6a3a'; g.font = 'bold 52px Arial'; g.fillText('₹10,000', w / 2, 140);
  g.fillStyle = '#5d4127'; g.font = '28px Arial'; g.fillText('MAHINA  •  PAID', w / 2, 190);
});
const phoneAskTex = textBoard(384, 448, (g, w, h) => {
  g.fillStyle = '#111827'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#f8f3e8'; g.textAlign = 'center'; g.font = 'bold 58px Arial'; g.fillText('POOCHHO', w / 2, 170);
  g.fillStyle = '#d9a845'; g.font = 'bold 44px Arial'; g.fillText('APNE BROKER', w / 2, 240);
  g.fillText('SE', w / 2, 300);
});
const heldPropG = new THREE.Group(); scene.add(heldPropG);
const heldKeys = new THREE.Group();
{
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 6, 16), lam({ color: 0xd9a845 }));
  heldKeys.add(ring);
  for (let i = 0; i < 5; i++) {
    const k = brassKey(0, 0, 0, 0, 1.2);
    k.position.set(-0.08 + i * 0.04, -0.12 - (i % 2) * 0.03, 0.01);
    k.rotation.z = (i - 2) * 0.25;
    heldKeys.add(k);
  }
  heldPropG.add(heldKeys);
}
const heldKeys3 = new THREE.Group();
{
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 16), lam({ color: 0xd9a845 }));
  heldKeys3.add(ring);
  for (let i = 0; i < 3; i++) {
    const k = brassKey(0, 0, 0, 0, 1.2);
    k.position.set(-0.05 + i * 0.05, -0.11, 0.01);
    k.rotation.z = (i - 1) * 0.3;
    heldKeys3.add(k);
  }
  heldPropG.add(heldKeys3);
}
const heldCash = new THREE.Group();
{
  const b = box(0.34, 0.05, 0.18, lam({ color: 0x3f9e4d })); heldCash.add(b);
  const bandW = box(0.08, 0.052, 0.185, lam({ color: 0xf8f3e8 })); heldCash.add(bandW);
  heldPropG.add(heldCash);
}
// FIX R1 (still-08): second bundle for the LEFT hand — both-sides cash.
const heldCashL = new THREE.Group();
{
  const b = box(0.34, 0.05, 0.18, lam({ color: 0x3f9e4d })); heldCashL.add(b);
  const bandW = box(0.08, 0.052, 0.185, lam({ color: 0xf8f3e8 })); heldCashL.add(bandW);
  heldPropG.add(heldCashL);
}
const heldReceipt = new THREE.Group();
{
  const r = boardMesh(0.24, 0.3, receiptTex); heldReceipt.add(r);
  const back = box(0.24, 0.3, 0.008, lam({ color: 0xf8f3e8 })); back.position.z = -0.006; heldReceipt.add(back);
  heldPropG.add(heldReceipt);
}
const heldPhone = new THREE.Group();
{
  const body = box(0.26, 0.32, 0.02, lam({ color: 0x1f2937 })); heldPhone.add(body);
  const scr = boardMesh(0.24, 0.28, phoneAskTex); scr.position.z = 0.011; heldPhone.add(scr);
  heldPropG.add(heldPhone);
}
heldPropG.visible = false;
const HELD_PROP_OF_SHOT = {
  q02: 'keys', q10: 'cash', q12: 'cash', q15: 'cash', q16: 'cash', q17: 'cash',
  q24: 'keys3', q25: 'keys3', q28: 'receipt', q29: 'receiptCash', q31: 'phone', q32: 'phone',
};
function showHeldProp(shot, cp) {
  const kind = HELD_PROP_OF_SHOT[shot.id];
  if (!kind) { heldPropG.visible = false; return; }
  const dx = cp[0] - shot.cx, dz = cp[2] - shot.cz;
  const len = Math.hypot(dx, dz) || 1;
  const cdx = dx / len, cdz = dz / len;
  const rx = cdz, rz = -cdx;
  // FIX QA-full (f0075): held keys AT the reach hand (rx 0.55*cs, y 1.30*cs),
  // not mid-torso — the old spot (0.35, y 1.18) floated in the air beside the hip.
  // FIX QA-full (f0714): q15/q16 cash handX 0.60 -> 0.48*cs — the bundles'
  // outer ends touched the buyer/seller cheeks at 0.60.
  const handY = 1.29 * shot.cs + 0.02, handX = (shot.id === 'q15' || shot.id === 'q16') ? 0.48 * shot.cs : 0.60 * shot.cs;
  if (kind === 'receiptCash') {
    heldPropG.position.set(shot.cx + cdx * 0.15, handY, shot.cz + cdz * 0.15);
    heldPropG.rotation.set(0, Math.atan2(cp[0] - heldPropG.position.x, cp[2] - heldPropG.position.z), 0);
    heldReceipt.visible = true; heldCash.visible = true;
    heldReceipt.position.set(-handX, 0, 0); heldCash.position.set(handX, 0, 0);
    heldKeys.visible = false; heldKeys3.visible = false; heldPhone.visible = false; heldCashL.visible = false;
    heldPropG.visible = true;
    return;
  }
  heldReceipt.position.set(0, 0, 0); heldCash.position.set(0, 0, 0); heldCashL.position.set(-2 * handX, 0, 0);
  if (kind === 'keys') {
    heldPropG.position.set(shot.cx + rx * 0.55 * shot.cs + cdx * 0.15, 1.30 * shot.cs, shot.cz + rz * 0.55 * shot.cs + cdz * 0.15);
  } else {
    // FIX R1/R2 (S3): prop AT the reach hand (rx 0.60*cs, y 1.29*cs), not mid-torso.
    heldPropG.position.set(shot.cx + rx * handX + cdx * 0.15, handY, shot.cz + rz * handX + cdz * 0.15);
  }
  heldPropG.rotation.set(0, Math.atan2(cp[0] - heldPropG.position.x, cp[2] - heldPropG.position.z), 0);
  heldKeys.visible = (kind === 'keys');
  heldKeys3.visible = (kind === 'keys3');
  heldCash.visible = (kind === 'cash');
  heldCashL.visible = (kind === 'cash' && (shot.id === 'q15' || shot.id === 'q16'));
  heldReceipt.visible = (kind === 'receipt');
  heldPhone.visible = (kind === 'phone');
  heldPhone.scale.setScalar((kind === 'phone' && shot.id === 'q32') ? 1.8 : (kind === 'phone' && shot.id === 'q31') ? 1.3 : 1);
  heldPropG.visible = true;
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
// RENDER — 35 shots: camera + acting + set state per SHOT (story.js table)
// =====================================================================
// Crowd modes (story.js SHOTS.crowd hi source of truth):
// 'none' | 'walkers' (A: 3 walkers) | 'walkers6' (A: 6) | 'passersby' (A: 2)
// | 'rival' (A: mustard rival peeche) | 'deal' (B: buyer+seller desk par)
// | 'buyer' (C: buyer hero ke paas) | 'heroBehind' (C: hero buyer ke peeche, chhota)
// | 'family' (C: 3 flat-viewing family, society) | 'tenants' (D: 4 tenants darwaze par)
// | 'tenant' (D: tenant woman + child). Crowd kabhi nahi bolta (mouth null).
function drawCrowd(mode, f, cp, loc, shot) {
  if (mode === 'none') return;
  const C = crowdCards, O = CROWD;
  const { expr: me } = memberExprAt(f);
  if (loc === 'A') {
    if (mode === 'walkers' || mode === 'walkers6') {
      const spots = mode === 'walkers6'
        ? [[-2.05, -1.5, 0.25], [-1.5, -0.9, 0.6], [-0.6, -1.6, 0.1], [0.15, -1.6, 0.4], [0.55, -0.95, 0.55], [-0.2, -0.7, 0.2]]
        : [[-2.05, -1.5, 0.25], [0.15, -1.6, 0.6], [0.55, -0.95, 0.1]];
      spots.forEach(([wx, wz, st], i) => {
        drawChar(C[i], 310 + i, O[i], 'smile', 'hang', 'hang', f, cp, wx, 0, wz, 0.95, st, null, 0, null, false);
      });
    } else if (mode === 'passersby') {
      drawChar(C[0], 310, O[0], 'smile', 'hang', 'hang', f, cp, -2.0, 0, -1.4, 0.95, 0.25, null, 0, null, false);
      drawChar(C[1], 311, O[1], 'smile', 'hang', 'hang', f, cp, 0.3, 0, -1.5, 0.95, 0.6, null, 0, null, false);
    } else if (mode === 'rival') {
      // Padosi dukaan wala (mustard) — q05 me hansta (grin), q11 me shock (memberExprAt).
      drawChar(rivalCard, 305, RIVAL, me, 'wave', 'hang', f, cp, -2.0, 0, -1.4, 1.0, 0, null, 0, null, false);
      drawChar(C[0], 310, O[0], 'smile', 'hang', 'hang', f, cp, 0.9, 0, -1.6, 0.95, 0.4, null, 0, null, false);
    }
    return;
  }
  if (loc === 'B') {
    if (mode === 'deal') {
      // Buyer bayein, seller dayein — desk ke peeche, hero beech me (sign/handshake).
      // FIX R2 (still-08, q15 only): +/-1.1 so the cash bundles in the hero's
      // hands clear the buyer/seller faces (at +/-0.9 the bundles covered them).
      const bx = (shot && shot.id === 'q15') ? 1.1 : 0.9;
      drawChar(buyerCard, 301, BUYER, me, 'reach', 'hang', f, cp, -bx, 0, -2.6, 1.0, 0, null, 0, null, false);
      drawChar(sellerCard, 302, SELLER, me, 'reach', 'hang', f, cp, bx, 0, -2.6, 1.0, 0, null, 0, null, false);
    }
    return;
  }
  if (loc === 'C') {
    if (mode === 'buyer') {
      drawChar(buyerCard, 301, BUYER, me, 'reach', 'hang', f, cp, 0.8, 0, -3.0, 1.0, 0, null, 0, null, false);
    } else if (mode === 'heroBehind') {
      // Hero buyer ke peeche, chhota — muskurata (mouth null: narration voiceover).
      drawChar(heroCard, 91, HERO, 'smile', 'hang', 'hang', f, cp, -0.6, 0, -2.6, 0.9, 0, null, 0, null, false);
    } else if (mode === 'family') {
      // Flat-viewing family (3) — society ke saamne, upar dekhte hue.
      drawChar(C[0], 310, O[0], 'smile', 'up', 'hang', f, cp, 9.0, 0, -2.2, 0.95, 0, null, 0, null, false);
      drawChar(C[1], 311, O[1], 'smile', 'up', 'hang', f, cp, 10.8, 0, -2.5, 0.95, 0, null, 0, null, false);
      drawChar(C[2], 312, O[2], 'smile', 'point', 'hang', f, cp, 11.3, 0, -2.0, 0.9, 0, null, 0, null, false);
    }
    return;
  }
  if (loc === 'D') {
    if (mode === 'tenants') {
      // 4 tenants apne darwaze par (houses x -4.0, -0.8, 2.4, 5.6).
      drawChar(C[0], 310, O[0], 'smile', 'hang', 'hang', f, cp, -4.2, 0, -1.5, 0.95, 0, null, 0, null, false);
      drawChar(C[1], 311, O[1], 'smile', 'wave', 'hang', f, cp, -0.8, 0, -1.5, 0.95, 0, null, 0, null, false);
      drawChar(C[2], 312, O[2], 'smile', 'hang', 'hang', f, cp, 1.8, 0, -1.5, 0.95, 0, null, 0, null, false);
      drawChar(C[3], 313, O[3], 'smile', 'hang', 'hang', f, cp, 4.2, 0, -1.5, 0.95, 0, null, 0, null, false);
    } else if (mode === 'tenant') {
      // Tenant woman (plum saree) + child — hero ko chaabi milti hai, tenant khush.
      drawChar(tenantCard, 303, TENANT, 'grin', 'reach', 'hang', f, cp, 0.9, 0, 0.0, 1.0, 0, null, 0, null, false);
      drawChar(childCard, 304, CHILD, 'smile', 'hang', 'hang', f, cp, 1.35, 0, 0.45, 0.62, 0, null, 0, null, false);
    } else if (mode === 'walkers') {
      drawChar(C[0], 310, O[0], 'smile', 'hang', 'hang', f, cp, -3.5, 0, 0.8, 0.95, 0.25, null, 0, null, false);
      drawChar(C[1], 311, O[1], 'smile', 'hang', 'hang', f, cp, 3.2, 0, 0.6, 0.95, 0.6, null, 0, null, false);
    }
    return;
  }
  // loc E me crowd kabhi nahi (hero kamre me AKELA hai — light cone wala still).
}
// Light rig location se badalta hai: A = dawn, B = day, C = bright, D = golden, E = night.
// Counter rig (warm evening) sirf tab jab loc B ke andar counter cam ho.
const ENV_OF_LOC = { A: 'dawn', B: 'day', C: 'bright', D: 'golden', E: 'night' };
const COUNTER_CAMS = ['CT', 'CT2', 'CT3', 'CT4', 'CT5'];
window.renderFrame = (f) => {
  const shot = shotAt(f), u = shot.u, id = shot.id;
  const cam = camFor(shot, u);
  camera.position.set(...cam.pos); camera.lookAt(...cam.look);
  camera.fov = cam.fov; camera.updateProjectionMatrix();
  if (cam.roll) camera.rotateZ(cam.roll * Math.PI / 180);
  const loc = shot.loc;
  const envName = (loc === 'B' && COUNTER_CAMS.includes(shot.camName)) ? 'evening' : ENV_OF_LOC[loc];
  const env = applyEnv(envName);
  // ANTI-GLITCH: motes ABSOLUTE position (frame ka pure function).
  motes.forEach((sp, i) => {
    sp.position.set(sp.userData.bx + Math.cos(f * 0.02 + i) * 0.03, sp.userData.by + Math.sin(f * 0.05 + i * 2.1) * 0.04, sp.userData.bz);
  });
  ALL_CARDS.forEach((c) => c.hide());
  keysG.visible = false;
  const cp = cam.pos;
  // ---- location switching: sirf active location ka group visible ----
  streetG.visible = (loc === 'A');
  shopG.visible = (loc === 'B');
  flatG.visible = (loc === 'C');
  rentalG.visible = (loc === 'D');
  roomG.visible = (loc === 'E');
  const shopVisible = shopG.visible;
  motes.forEach((sp) => { sp.visible = shopVisible; });
  // Room bulb: sirf kamre me jalta hai.
  if (roomG.userData.bulbLight) roomG.userData.bulbLight.intensity = (loc === 'E') ? 2.6 : 0;
  // Shutter (street): shutterOpen(f) ka pure function
  if (streetG.userData.applyShutter) streetG.userData.applyShutter(shutterOpen(f));
  // ---- props default band (har frame reset) ----
  glintGalla.material.opacity = 0; glintTill.material.opacity = 0; glintKeys.material.opacity = 0;
  if (lightCone) lightCone.visible = false;
  gallaBoard.visible = false;
  tillTag.visible = false;
  counterPanel.visible = false;
  tillG.visible = shopVisible;
  if (tillLid) tillLid.rotation.x = 0;
  cashInside.visible = false; cashSmall.visible = false; cashMed.visible = false;
  cashMountain.visible = false; cashSpill.visible = false;
  const fl = FLASH[id];
  flashPlane.material.opacity = fl ? Math.max(0, 1 - Math.abs(f - fl.at) / (fl.dur / 2)) : 0;
  // ghadi ki suiyaan — env ke hisaab se
  if (clockHour && clockMin) {
    clockHour.rotation.z = -(env.clockHr / 12) * Math.PI * 2;
    clockMin.rotation.z = 0;
  }
  // ---- per-shot set state ----
  const showGalla = shopVisible && shot.board === 'galla';
  if (showGalla) {
    gallaBoard.visible = true;
    glintGalla.material.opacity = 0.45;
    glintTill.material.opacity = 0.45;
  }
  // FIX R2 (still-06): ₹1,00,000 tag — sirf q12 me, till ke saamne.
  if (shopVisible && shot.board === 'till1lakh') tillTag.visible = true;
  if (loc === 'B' && COUNTER_CAMS.includes(shot.camName)) { counterPanel.visible = true; counterPanelDetail.visible = true; }
  else counterPanelDetail.visible = false;
  // Light cone: b02 me hero par (dukaan, subah — intezaar).
  if (lightCone) lightCone.visible = (loc === 'B' && shot.beat === 'b02');
  // Key board glint: dukaan ke wide/medium shots me.
  if (shopVisible && ['DB', 'DC', 'DI', 'DB2', 'DB3', 'DB4', 'DB6'].includes(shot.camName)) glintKeys.material.opacity = 0.4;
  // Till: tillAngle(f) — 479->510 khulta (69°), 1267->1300 band.
  const tAngle = tillAngle(f);
  if (tillLid) tillLid.rotation.x = -tAngle;
  if (shopVisible && tAngle > 0.05) {
    // FIX R1 (still-07, q13): HALF-EMPTY till — only 2 notes on the right side,
    // left side empty; no counter stack/spill, so the "aadha" reads.
    if (id === 'q13') {
      cashInside.visible = true;
      cashInside.children.forEach((n, i) => { n.visible = i >= 3; });
      cashSpill.visible = false; cashSmall.visible = false;
    } else {
      cashInside.children.forEach((n) => { n.visible = true; });
      cashInside.visible = true; cashSpill.visible = true;
      // Cash level frame se: ₹1 lakh (479-799) | ₹2 lakh (799-881) | ₹6 lakh mountain (1207-1267)
      if (f >= 1207 && f < 1267) cashMountain.visible = true;
      else if (f >= 799 && f < 881) cashMed.visible = true;
      else if (f >= 479 && f < 799) cashSmall.visible = true;
    }
  }
  // ---- crowd (shot.crowd) + on-screen character (shot.who) ----
  drawCrowd(shot.crowd, f, cp, loc, shot);
  if (shot.who === 'hero') {
    let { expr, mix } = heroExprAt(f);
    let mouth = mouthKind(f);
    // FIX R1 (still-12, f1297 ONLY): calm/wry irony line — closed mouth, no
    // sweat, no open-mouth shock. Single-frame override; the rest of q27
    // keeps lip-sync.
    if (id === 'q27' && f === 1297) { expr = 'smile_closed'; mouth = null; mix = null; }
    // q19/q21 rental street: hero CHALTA hai (mid-stride, walk cycle) — khada nahi.
    let step = 0, wx = shot.cx;
    if ((id === 'q19' || id === 'q21') && loc === 'D') {
      const w = walk(f, shot.a, 1.1, 0.8);
      // FIX R1 (still-09): at f981 the walk phase left both feet down — shift
      // the phase so one leg is clearly lifted (mid-stride) at the still frame.
      step = (w.phase + (id === 'q21' ? 0.15 : 0)) % 1; wx = shot.cx - 0.5 + w.dist * 0.4;
    }
    drawChar(heroCard, 91, HERO, expr, shot.R, shot.L, f, cp, wx, 0, shot.cz, shot.cs, step, null, shot.tilt, mouth, false, false, mix);
    // Signature keys: NOT in counter shots (counter hides them — only a ring peeks out)
    // and NOT when a held-keys prop is already showing (duplicate bunch).
    const heldKind = HELD_PROP_OF_SHOT[id];
    // FIX R2 (still-03): q05 me keys belt par — 'up' pose me held-keys ka default
    // hand dot haath se alag padta tha (hawa me tairti chaabiyan). q29 jaisi belt mode.
    if (!COUNTER_CAMS.includes(shot.camName) && heldKind !== 'keys' && heldKind !== 'keys3') placeKeys(wx, shot.cz, cp, true); // FIX QA-full: keys ALWAYS belt-attached — old free spot (rx 0.28, y 0.98) floated beside the hip (f0075/f0182/f0663/f0714/f1297/f1526).
  } else {
    // Member beats: member on-screen acting karta hai, hero narration voiceover hai —
    // mouth hamesha null (lip-sync nahi), expression memberExprAt(f) se.
    const { expr, mix } = memberExprAt(f);
    const card = WHO_CARD[shot.who];
    const outfit = WHO_OUTFIT[shot.who];
    const seed = WHO_SEED[shot.who];
    drawChar(card, seed, outfit, expr, shot.R, shot.L, f, cp, shot.cx, 0, shot.cz, shot.cs, 0, null, shot.tilt, null, false, false, mix);
  }
  // ---- held props (toward-lens): keys/cash/receipt/phone, speaker ka chehra peeche ----
  showHeldProp(shot, cp);
  updateProxiesW();
  renderer.render(scene, camera);
};
window.TOTAL = TOTAL;
window.ready = Promise.resolve();
