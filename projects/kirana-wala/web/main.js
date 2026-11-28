// "Kirana Udhaar" — FULL BUILD (49 shots, 1805f @30fps = 60.16 s). Title: "Dukaan Khaali, Khata ₹50,000!"
// 6 locations (D dukaan interior / F dukaan front / Z bazaar / C ghar / S supermarket / G gali).
// SPEAKER-VISIBLE RULE: jo bolega, woh scene me LIVE dikhega — har shot me speaker===who
// (story.js assert); 49/49 hero on-screen. Lip-sync SIRF hero shots me (envelope.js, kirana master).
// Fresh hero RAJU: muted teal kurta #3f6a6f, NARANGI GAMCHHA #e86a1c + togaPrint (signature prop),
// garam skin #96603a, gol chehra, moochh. Rival MANAGER: maroon shirt #7a2e3a, haughty laugh.
// World V3: LIT materials ONLY (lam() + paint.js textures) + soft shadows + warm + cool light
// in every shot. MeshBasicMaterial ONLY for flash plane / glints / bulb glow / light cone — never
// for a visible surface. NO captions, NO music. Numbers as objects: bori dher (₹4 lakh), khata
// line (₹10,000), galla + cash + GALLA board (₹50,000).
// LAYOUT LOCK: every prop's base touches a surface; hero text/face inside frame with margin.
// Contract: window.ready, window.renderFrame(f).
import * as THREE from 'three';
import * as FX from './fx.js';
import * as T from './toon.js';
import { idle, blinkAt, walk, q, M, clamp } from './motion.js';
import { tex, planks, plaster, stone, dirt, tiles, mudTiles, sackCloth } from './paint.js';
import { TOTAL, shotAt, camFor, FLASH, heroExprAt, mouthKind, gallaAngle, gallaFull, gallaEmptyOpen, shutterOpen } from './story.js';
import { buildDukaanFront, buildBazaar, buildHome, buildSupermarket, buildGali } from './locations.js';

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
// Bori (jute sack) — F3 FIX: gol "ball" NAHI — lambi bandhi bori: lamba body
// (scale 0.88 x 1.3), upar cinched gardan (cone) + bandhi gaanth + rassi.
// Base farsh ko chhooti hai (body bottom y≈-0.03*s).
function sack(x, y, z, ry = 0, s = 1) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.3 * s, 12, 10), lam({ map: tex(sackCloth(71), 1, 1) }));
  body.scale.set(0.88, 1.3, 0.88); body.position.y = 0.36 * s; g.add(body);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09 * s, 0.16 * s, 0.16 * s, 10), lam({ map: tex(sackCloth(73), 1, 1) }));
  neck.position.y = 0.72 * s; g.add(neck);
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.07 * s, 8, 6), lam({ color: 0xb09868 }));
  knot.position.y = 0.81 * s; g.add(knot);
  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.11 * s, 0.02 * s, 6, 12), lam({ color: 0x8a6a3a }));
  tie.rotation.x = Math.PI / 2; tie.position.y = 0.66 * s; g.add(tie);
  // ROUND-2: seams HATA — 3D me woh bori se bahar nikal kar "taang/stick" lagte
  // the (f0050/f0525/f0830/f1480 me saaf dikha). Kapda texture hi kaafi hai.
  g.position.set(x, y, z); g.rotation.y = ry;
  return g;
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
function drawChar(card, seed, outfit, expr, R, L, f, camPos, x, y, z, s = 1.03, step = 0, lift = null, tilt = 0, mouth = null, props = false, sweat = false, mix = null, blinkOv = null) {
  const idl = idle(f, seed), blink = blinkOv !== null ? blinkOv : blinkAt(f, seed);
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
const rivalCard = new Card();
const crowdCards = [];
for (let i = 0; i < 13; i++) crowdCards.push(new Card());
const auntyCard = new Card();
const uncleCard = new Card();
const ALL_CARDS = [heroCard, rivalCard, auntyCard, uncleCard, ...crowdCards];
// FRESH — HERO RAJU (sirf is video ke liye): muted teal kurta #3f6a6f, NARANGI GAMCHHA
// #e86a1c (toga sash + togaPrint check — toon.js me Gullak wali pehchan), garam skin
// #96603a, gol chehra, moti bhaavein, halki moochh. Gym ka laal hero SUPERSEDED.
const HERO = { tunic: '#3f6a6f', shirt: '#f8fafc', skin: '#96603a', hair: '#1e1a20', hairStyle: 'thick', hairLine: 0.30, brows: '#1e1a20', moustache: '#2a1c12', toga: '#e86a1c', togaPrint: true };
// RIVAL MANAGER (seed 301): maroon shirt #7a2e3a, haughty laugh -> (full build me shock).
const RIVAL = { tunic: '#7a2e3a', shirt: '#f8fafc', skin: '#8a5a3b', hair: '#14100c', hairStyle: 'thick', moustache: '#2a1c12' };
// RECURRING CUSTOMERS: Graahak-Aunty (seed 302, mauve dress, basket wali) · Graahak-Uncle
// (seed 303, cycle wala, bhoora kurta) · Young man (seed 304, phone wala, slate-blue).
const AUNTY = { tunic: '#8a4a6b', shirt: '#f8fafc', skin: '#a06a3c', hair: '#2b211c', hairStyle: 'thick', dress: '#8a4a6b' };
const UNCLE = { tunic: '#7c5a2e', shirt: '#f8fafc', skin: '#9a6a42', hair: '#e8e2d8', hairStyle: 'thick', moustache: '#e8e2d8' };
const YOUNG = { tunic: '#5a6b8a', shirt: '#f8fafc', skin: '#8a5a30', hair: '#14100c', hairStyle: 'thick' };
// CROWD — muted natural (tez rang sirf hero cheezon par). Seeds 305-313.
const CROWD = [
  { tunic: '#2f6b4f', shirt: '#f8fafc', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick' },
  { tunic: '#9a6a3a', shirt: '#f8fafc', skin: '#9a6a42', hair: '#2b211c', hairStyle: 'side' },
  { tunic: '#3f5a7a', shirt: '#f8fafc', skin: '#8a5a30', hair: '#14100c', hairStyle: 'thick' },
  { tunic: '#6b4a7a', shirt: '#f8fafc', skin: '#9a6a42', hair: '#1e1a20', hairStyle: 'thick' },
  { tunic: '#7a3a3a', shirt: '#f8fafc', skin: '#b0703a', hair: '#2b211c', hairStyle: 'side' },
  { tunic: '#4a5a3a', shirt: '#f8fafc', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick' },
  { tunic: '#8a7a3a', shirt: '#f8fafc', skin: '#8a5a30', hair: '#2b211c', hairStyle: 'side' },
  { tunic: '#5a3a5a', shirt: '#f8fafc', skin: '#9a6a42', hair: '#1e1a20', hairStyle: 'thick', dress: '#5a3a5a' },
  { tunic: '#6b5a4a', shirt: '#f8fafc', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick' },
  { tunic: '#4a6a5a', shirt: '#f8fafc', skin: '#9a6a42', hair: '#2b211c', hairStyle: 'thick' },
  { tunic: '#7a5a6a', shirt: '#f8fafc', skin: '#b0703a', hair: '#1e1a20', hairStyle: 'thick', dress: '#7a5a6a' },
  { tunic: '#5a5a6a', shirt: '#f8fafc', skin: '#8a5a30', hair: '#14100c', hairStyle: 'thick' },
  { tunic: '#8a4a3a', shirt: '#f8fafc', skin: '#a06a3c', hair: '#2b211c', hairStyle: 'side' },
];

// =====================================================================
// ENVS — subah (dawn, garam) / bazaar (dhool) / din (neutral) / shaam (garam) / ghar-shaam / thanda (supermarket)
// =====================================================================
const ENVS = {
  dawn: { bg: 0xe8d3b8, fogC: 0xe6d8c4, fogNear: 10, fogFar: 46, hemi: 0.85, hemiC: 0xffe0b8, hemiG: 0x8a7a6a, sun: 1.1, sunC: 0xffc98a, sunPos: [-10, 4.5, 6], bounce: 0.4, bounceC: 0x9db8d9, expo: 1.12, win: 0, tube: 0, clockHr: 6 },
  morning: { bg: 0xd8e8ee, fogC: 0xd8e4e0, fogNear: 10, fogFar: 46, hemi: 1.05, hemiC: 0xffe8c8, hemiG: 0x8a7a5a, sun: 1.7, sunC: 0xffd9a0, sunPos: [-10, 4.5, 6], bounce: 0.4, bounceC: 0x9db8d9, expo: 1.12, win: 5.0, tube: 0, clockHr: 8 },
  day: { bg: 0xc8dcec, fogC: 0xd0dde6, fogNear: 12, fogFar: 48, hemi: 1.0, hemiC: 0xffe8c8, hemiG: 0x8a7a5a, sun: 1.6, sunC: 0xfff0c8, sunPos: [-9, 6, 5], bounce: 0.35, bounceC: 0x9db8d9, expo: 1.13, win: 3.0, tube: 2.0, clockHr: 12 },
  evening: { bg: 0xe8b078, fogC: 0xe8c098, fogNear: 8, fogFar: 38, hemi: 1.0, hemiC: 0xffe0b8, hemiG: 0x8a6a4a, sun: 1.5, sunC: 0xff8a3d, sunPos: [-11, 2.6, 4], bounce: 0.35, bounceC: 0xffd9a0, expo: 1.12, win: 1.5, tube: 6.0, clockHr: 6 },
  homeEvening: { bg: 0xd8c8b8, fogC: 0xd8c8b8, fogNear: 10, fogFar: 44, hemi: 0.75, hemiC: 0xffe8c8, hemiG: 0x8a7a5a, sun: 1.0, sunC: 0xffd9a0, sunPos: [6, 5, 2], bounce: 0.3, bounceC: 0x9db8d9, expo: 1.08, win: 2.0, tube: 0, clockHr: 6 },
  cool: { bg: 0xd8dee2, fogC: 0xd8dee2, fogNear: 10, fogFar: 44, hemi: 1.05, hemiC: 0xe8f0f8, hemiG: 0x6a6a62, sun: 1.5, sunC: 0xfff0d8, sunPos: [6, 6, 4], bounce: 0.35, bounceC: 0xe8f0f8, expo: 1.12, win: 0, tube: 0, clockHr: 11 },
};
const tubeBulbMat = bas({ color: 0xfff7cc, fog: false });
const applyEnv = (name) => {
  const e = ENVS[name] || ENVS.day;
  scene.background = new THREE.Color(e.bg);
  scene.fog = new THREE.Fog(e.fogC, e.fogNear, e.fogNear + 36);
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
// SET — DUKAAN INTERIOR (x -5..5, back wall z=-6). LAYOUT LOCK: every prop's
// base touches a surface; hero text/face margin ke saath frame ke andar.
// =====================================================================
const dukaanG = new THREE.Group(); scene.add(dukaanG);
let clockHour = null, clockMin = null;
let gallaLid = null;
let khataClosedG = null, khataOpenG = null;
const glintGalla = mkGlint(2.9, 3.2, -5.6, 0.6);
const glintKhata = mkGlint(2.45, 1.3, -3.5, 0.4);

// ---- BOARD TEXTURES (proof-read: "KIRANA STORE", "GALLA ₹50,000", khata "₹10,000") ----
const kiranaBoardTex = textBoard(640, 160, (g, w, h) => {
  g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#6b4a2f'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
  g.fillStyle = '#6b4a2f'; g.font = 'bold 68px Arial'; g.textAlign = 'center';
  g.fillText('KIRANA STORE', w / 2, 104);
});
const gallaBoardTex = textBoard(640, 360, (g, w, h) => {
  g.fillStyle = '#14532d'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#facc15'; g.lineWidth = 14; g.strokeRect(10, 10, w - 20, h - 20);
  g.textAlign = 'center'; g.fillStyle = '#f8fafc';
  g.font = 'bold 52px Arial'; g.fillText('GALLA', w / 2, 84);
  g.fillStyle = '#facc15'; g.font = 'bold 96px Arial'; g.fillText('₹50,000', w / 2, 210);
  g.fillStyle = '#f8fafc'; g.font = 'bold 40px Arial'; g.fillText('KHATA • PACHAAS HAZAAR', w / 2, 300);
});
// Khata khula — pages texture: left names + right "KUL UDHAAR ₹10,000" (readable, ECU ke liye).
const khataPagesTex = textBoard(512, 360, (g, w, h) => {
  g.fillStyle = '#f3ecd8'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#8a7a5c'; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  g.textAlign = 'left'; g.fillStyle = '#3a3226'; g.font = 'bold 26px Arial';
  const left = ['RAMU — ₹500', 'SHYAM — ₹1,200', 'GEETA — ₹800', 'MOHAN — ₹2,000', 'SITA — ₹650'];
  left.forEach((t, i) => g.fillText(t, 24, 70 + i * 52));
  g.strokeStyle = '#9a8a68'; g.lineWidth = 2;
  for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(20, 84 + i * 52); g.lineTo(236, 84 + i * 52); g.stroke(); }
  g.textAlign = 'center';
  g.fillStyle = '#7a2e26'; g.font = 'bold 30px Arial'; g.fillText('KUL UDHAAR', (w * 3) / 4, 70);
  g.fillStyle = '#b03a30'; g.font = 'bold 64px Arial'; g.fillText('₹10,000', (w * 3) / 4, 160);
  g.fillStyle = '#3a3226'; g.font = 'bold 26px Arial'; g.fillText('DAS HAZAAR', (w * 3) / 4, 210);
  g.fillText('LOGON SE LENE HAIN', (w * 3) / 4, 250);
  for (let i = 0; i < 3; i++) { g.strokeStyle = '#9a8a68'; g.beginPath(); g.moveTo(276, 284 + i * 0); g.lineTo(492, 284); g.stroke(); }
});
// Khata cover texture — laal-bhoora cover + sunehri border + "KHATA".
const khataCoverTex = textBoard(256, 360, (g, w, h) => {
  g.fillStyle = '#7a2e26'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d9a514'; g.lineWidth = 8; g.strokeRect(14, 14, w - 28, h - 28);
  g.fillStyle = '#facc15'; g.font = 'bold 64px Arial'; g.textAlign = 'center'; g.fillText('KHATA', w / 2, 190);
  g.fillStyle = '#f8fafc'; g.font = 'bold 28px Arial'; g.fillText('RAJU KIRANA', w / 2, 240);
});
// Calendar texture — NOVEMBER, "1" laal ghare me (pehli tareekh, L17).
const calTex = textBoard(256, 320, (g, w, h) => {
  g.fillStyle = '#f8fafc'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#7a2e26'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = '#7a2e26'; g.fillRect(0, 0, w, 64);
  g.fillStyle = '#f8fafc'; g.font = 'bold 40px Arial'; g.textAlign = 'center'; g.fillText('NOVEMBER', w / 2, 46);
  g.fillStyle = '#1e293b'; g.font = 'bold 26px Arial';
  ['S M T W T F S', '1  2  3  4  5  6', '7  8  9 10 11 12', '13 14 15 16 17 18', '19 20 21 22 23 24'].forEach((row, i) => g.fillText(row, w / 2, 120 + i * 44));
  // "1" — pehli tareekh, laal ghare me: pehli data-row ka pehla akshar, measureText se napa hua.
  const rowW = g.measureText('1  2  3  4  5  6').width;
  const oneX = w / 2 - rowW / 2 + g.measureText('1').width / 2;
  g.strokeStyle = '#dc2626'; g.lineWidth = 5; g.beginPath(); g.arc(oneX, 156, 18, 0, 7); g.stroke();
  g.fillStyle = '#dc2626'; g.font = 'bold 30px Arial'; g.fillText('1', oneX, 166);
});
const clockTex = textBoard(256, 256, (g, w, h) => {
  g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#eef2f5'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
  g.strokeStyle = '#4a3220'; g.lineWidth = 12; g.beginPath(); g.arc(128, 128, 114, 0, 7); g.stroke();
  g.fillStyle = '#1e293b'; g.textAlign = 'center'; g.font = 'bold 40px Arial';
  g.fillText('12', 128, 52); g.fillText('6', 128, 224); g.fillText('3', 210, 142); g.fillText('9', 46, 142);
  g.fillStyle = '#dc2626'; g.beginPath(); g.arc(128, 128, 8, 0, 7); g.fill();
});
// Vertical walnut slat texture — counter front + wainscot.
const slatTex = (() => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  for (let x = 0; x < 8; x++) {
    g.fillStyle = x % 2 ? '#5d4127' : '#6b4a2f'; g.fillRect(x * 32, 0, 32, 128);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x * 32, 0, 3, 128);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();

{
  const S = dukaanG;
  // FLOOR — mitti tiles checkerboard (muted, paint.js mudTiles) + halka speckle.
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), lam({ map: tex(mudTiles(72), 4, 4) }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.02, 0); floor.receiveShadow = true; S.add(floor);
  // BACK WALL — saaf cream-mitti (plaster ke crack-scribble nahi; deewaar saaf dikhe).
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 5.0), lam({ color: 0xd8cbb2 }));
  backWall.position.set(0, 2.5, -6); backWall.receiveShadow = true; S.add(backWall);
  const wainscot = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 1.1), lam({ map: slatTex }));
  wainscot.position.set(0, 0.55, -5.97); S.add(wainscot);
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 5.0), lam({ color: 0xb8a88a }));
  leftWall.rotation.y = Math.PI / 2; leftWall.position.set(-5, 2.5, -1.5); S.add(leftWall);
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 5.0), lam({ color: 0xb8a88a }));
  rightWall.rotation.y = -Math.PI / 2; rightWall.position.set(5, 2.5, -1.5); S.add(rightWall);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(11, 10), bas({ color: 0xd8ccb8 }));
  ceiling.rotation.x = Math.PI / 2; ceiling.position.set(0, 5.0, -1.5); S.add(ceiling);
  // HANGING BULB (0, 3.15, -2.5) — wire ceiling se bulb tak, garam glow.
  const wire = cyl(0.008, 0.008, 1.8, lam({ color: 0x111827 }), 6); wire.position.set(0, 4.1, -2.5); S.add(wire);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), bas({ color: 0xffe9a8, fog: false }));
  bulb.position.set(0, 3.15, -2.5); S.add(bulb);
  // LED PANEL (ceiling, 2.0, -3.0) — din ki roshni ka hissa.
  const panel = box(1.2, 0.05, 0.5, tubeBulbMat); panel.position.set(2.0, 4.96, -3.0); S.add(panel);
  const pFrame = box(1.3, 0.04, 0.6, lam({ color: 0x2f3437 })); pFrame.position.set(2.0, 4.99, -3.0); S.add(pFrame);

  // ---- SHELVES (back wall, x -4.5..1.0) — 3 tiers. BAYEIN unit AADHA KHAALI (hook paradox):
  // left unit (x -4.5..-1.5): bottom shelf par sirf 2-3 dabbe, upar khaali. Right unit bhara.
  const shelfMat = lam({ color: 0x6b4a2f });
  [-4.5, -1.5].forEach((sx) => {
    [0.9, 1.7, 2.5].forEach((sy) => {
      const sh = box(2.9, 0.05, 0.4, shelfMat); sh.position.set(sx + 1.45, sy, -5.8); S.add(sh);
    });
  });
  const dabbaCols = [0x8a5a2e, 0x5a6b3a, 0x7a6a4a, 0xa85b3f, 0x6b7a5a, 0x9a7a3a];
  const putDabba = (x, y, z, col, w = 0.32, h = 0.38) => {
    const d = box(w, h, 0.3, lam({ color: col })); d.position.set(x, y + h / 2, z); S.add(d);
    const label = box(w * 0.7, h * 0.4, 0.01, lam({ color: 0xf8fafc })); label.position.set(x, y + h / 2, z + 0.16); S.add(label);
  };
  // LEFT unit — aadha khaali: sirf bottom shelf par 3 dabbe, baaki khaali (s01 hook).
  putDabba(-4.0, 0.925, -5.8, dabbaCols[0]);
  putDabba(-3.5, 0.925, -5.8, dabbaCols[1]);
  putDabba(-2.2, 0.925, -5.8, dabbaCols[2]);
  // RIGHT unit — bhara: har shelf par dabbe + tel ki bottle.
  for (let k = 0; k < 5; k++) putDabba(-1.3 + k * 0.55, 0.925, -5.8, dabbaCols[k % 6]);
  for (let k = 0; k < 4; k++) putDabba(-1.2 + k * 0.6, 1.725, -5.8, dabbaCols[(k + 2) % 6]);
  for (let k = 0; k < 4; k++) {
    const b = cyl(0.07, 0.07, 0.34, lam({ color: [0xb45309, 0x5a7a3a, 0x8a5a2e, 0x6b7a5a][k] }), 10);
    b.position.set(-1.2 + k * 0.6, 2.7, -5.8); S.add(b);
    const cap = cyl(0.03, 0.03, 0.05, lam({ color: 0x1f2937 }), 8); cap.position.set(-1.2 + k * 0.6, 2.9, -5.8); S.add(cap);
  }
  // Biscuit packets (right shelf, neeche)
  for (let k = 0; k < 3; k++) {
    const p = box(0.3, 0.22, 0.1, lam({ color: [0xc8a03a, 0x8a4a3a, 0x5a7a8a][k] }));
    p.position.set(0.3 + k * 0.35, 1.035, -5.75); p.rotation.y = 0.2; S.add(p);
  }
  // F4/F9 FIX — RIGHT shelf (x 2.85..4.35, y 2.3) + dabbe: DT/DG/DN me upar-dayein
  // khaali beige deewaar bharti hai (pehle right side par calendar ke alawa kuch nahi tha).
  const shelfR = box(1.5, 0.05, 0.4, shelfMat); shelfR.position.set(3.6, 2.3, -5.8); S.add(shelfR);
  putDabba(3.05, 2.325, -5.8, dabbaCols[3]);
  putDabba(3.6, 2.325, -5.8, dabbaCols[4]);
  putDabba(4.15, 2.325, -5.8, dabbaCols[5]);
  // F9 FIX — FOREGROUND dressing (floor khaali na lage): lakdi ka crate + bori,
  // counter ke saamne-neeche (DW/PQ/DG me floor bharte hain, face-line se neeche).
  // ROUND-2: pehle (0.95,-1.1,s 0.9) par bori BAHUT badi lagti thi ("pot" jaisi,
  // f0050/f0525/f0830/f1480) — peeche + chhoti (1.35,-1.9,s 0.8); crate bhi peeche.
  const crate = box(0.6, 0.4, 0.5, lam({ map: tex(planks(63), 1, 1) })); crate.position.set(0.3, 0.2, -1.6); S.add(crate);
  const crateTop = box(0.5, 0.06, 0.4, lam({ color: 0x8a5a2e })); crateTop.position.set(0.3, 0.43, -1.6); S.add(crateTop);
  S.add(sack(1.35, 0, -1.9, 0.4, 0.8));

  // ---- BACK WALL TOP ROW: clock (-2.3,3.4 — F11: pehle -2.7 par DI frame me
  // aadhi kati thi) | KIRANA STORE board (1.0,3.9 — ROUND-3: pehle (0.2,3.5) par
  // calendar "KIR" dhak raha tha aur DG/DT/DN me kata "E"/"STORE" dikhta tha;
  // 1.0,3.9 par deewaar ke upar, sab frame me poora, calendar se upar) |
  // calendar (1.2,3.2 — ROUND-3: wapas 1.2 par; -0.3 par DG/DN se bahar tha) |
  // GALLA board (2.4,2.95) ----
  const clockFace = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), lam({ map: clockTex }));
  clockFace.position.set(-2.3, 3.4, -5.94); S.add(clockFace);
  const hourGeo = new THREE.BoxGeometry(0.03, 0.15, 0.01); hourGeo.translate(0, 0.065, 0);
  clockHour = new THREE.Mesh(hourGeo, lam({ color: 0x1e293b })); clockHour.position.set(-2.3, 3.4, -5.93); S.add(clockHour);
  const minGeo = new THREE.BoxGeometry(0.02, 0.22, 0.01); minGeo.translate(0, 0.1, 0);
  clockMin = new THREE.Mesh(minGeo, lam({ color: 0x1e293b })); clockMin.position.set(-2.3, 3.4, -5.925); S.add(clockMin);
  const storeBoard = boardMesh(1.4, 0.35, kiranaBoardTex); storeBoard.position.set(1.0, 3.9, -5.94); S.add(storeBoard);
  const calFrame = box(0.72, 0.88, 0.03, lam({ color: 0x4a3220 })); calFrame.position.set(1.2, 3.2, -5.96); S.add(calFrame);
  const calBoard = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.78), lam({ map: calTex }));
  calBoard.position.set(1.2, 3.2, -5.93); S.add(calBoard);

  // ---- COUNTER (2.6, -3.4) — walnut slat front + dark stone top + brass kick ----
  const counter = box(2.0, 0.95, 0.7, lam({ map: slatTex })); counter.position.set(2.6, 0.475, -3.4); S.add(counter);
  const counterTop = box(2.2, 0.06, 0.85, lam({ color: 0x3a3a38 })); counterTop.position.set(2.6, 0.98, -3.4); S.add(counterTop);
  const kickPlate = box(2.0, 0.08, 0.02, lam({ color: 0xb08d3e })); kickPlate.position.set(2.6, 0.04, -3.04); S.add(kickPlate);
  // Tel ki bottle + biscuit packet (bottle counter ke bayein kone par, tarazu se saaf;
  // packet bayein shelf ki middle shelf par — counter par galla/khata ki jagah khaali rakho)
  const oilBottle = cyl(0.06, 0.06, 0.26, lam({ color: 0xb45309 }), 10); oilBottle.position.set(1.55, 1.14, -3.15); S.add(oilBottle);
  const pack = box(0.28, 0.2, 0.12, lam({ color: 0xc8a03a })); pack.position.set(-2.0, 1.025, -5.75); S.add(pack);

  // ---- BORI SACKS (bayein deewaar ke paas, peeche) — sab ki base farsh ko chhooti hai ----
  S.add(sack(-4.4, 0, -2.2, 0.2));
  S.add(sack(-4.4, 0, -1.4, -0.3));
  S.add(sack(-4.4, 0.55, -1.8, 0.9, 0.95));
  // ---- FOREGROUND PROPS (depth layer 1 — frame corners, below face line) ----
  const fgBottle = cyl(0.05, 0.05, 0.24, lam({ color: 0x5d8a3a }), 10); fgBottle.position.set(-4.5, 0.12, -2.0); S.add(fgBottle);
}
dukaanG.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

// ---- GALLA BOARD (back wall above counter) — visible sirf s15 (board='galla') ----
// ROUND-3: (1.9,2.95)->(2.4,2.95) — calendar wapas (1.2,3.2) par hai, isliye
// GALLA board dayein sarka taaki calendar uska "GA" na dhake; right shelf
// (3.6) se door (board dayein kinara 3.08 < shelf 3.1).
const gallaBoard = boardMesh(1.35, 0.72, gallaBoardTex); gallaBoard.position.set(2.4, 2.95, -5.94); gallaBoard.visible = false; scene.add(gallaBoard);
// ---- LOC F/Z/C/S/G — locations.js se; sirf active location visible (renderFrame me) ----
const frontG = buildDukaanFront(); scene.add(frontG);
const bazaarG = buildBazaar(); scene.add(bazaarG);
const homeG = buildHome(); scene.add(homeG);
const superG = buildSupermarket(); scene.add(superG);
const galiG = buildGali(); scene.add(galiG);

// ---- TARAZU (peetal, counter par 1.7,-3.4 — hero ke chehre se bayein, kabhi face-line par nahi) ----
const tarazuG = new THREE.Group(); tarazuG.position.x = -0.2; scene.add(tarazuG);
{
  const base = cyl(0.16, 0.2, 0.04, lam({ color: 0x8a6a3a }), 12); base.position.set(1.9, 1.03, -3.4); tarazuG.add(base);
  const pole = cyl(0.025, 0.025, 0.42, lam({ color: 0xd9a845 }), 8); pole.position.set(1.9, 1.25, -3.4); tarazuG.add(pole);
  const beam = box(0.62, 0.03, 0.03, lam({ color: 0xd9a845 })); beam.position.set(1.9, 1.46, -3.4); tarazuG.add(beam);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), lam({ color: 0x8a6a3a })); knob.position.set(1.9, 1.5, -3.4); tarazuG.add(knob);
  [-0.28, 0.28].forEach((dx) => {
    const pan = cyl(0.14, 0.1, 0.04, lam({ color: 0xb08d3e }), 12); pan.position.set(1.9 + dx, 1.28, -3.4); tarazuG.add(pan);
    [-0.06, 0.06].forEach((ox) => {
      const wire = cyl(0.006, 0.006, 0.16, lam({ color: 0x2f3437 }), 4);
      wire.position.set(1.9 + dx + ox, 1.37, -3.4); tarazuG.add(wire);
    });
  });
  // Bayein palde par aata ki potli (kapda), dayein par peetal ke baat (weights)
  const pouch = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), lam({ color: 0xe8dcc0 }));
  pouch.position.set(1.62, 1.35, -3.4); pouch.scale.y = 0.75; tarazuG.add(pouch);
  const pouchTie = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 6, 10), lam({ color: 0x8a6a3a }));
  pouchTie.rotation.x = Math.PI / 2; pouchTie.position.set(1.62, 1.42, -3.4); tarazuG.add(pouchTie);
  [0, 1].forEach((i) => {
    const w = cyl(0.045 - i * 0.012, 0.045 - i * 0.012, 0.05, lam({ color: 0xd9a845 }), 10);
    w.position.set(2.14 + (i - 0.5) * 0.1, 1.33, -3.4); tarazuG.add(w);
  });
}
// ---- GALLA (dhatu till, counter par 3.15,-3.4 — hero ke dayein, chehre ke saamne nahi) + CASH ----
const gallaG = new THREE.Group(); scene.add(gallaG);
const cashHeap = new THREE.Group(); scene.add(cashHeap);
const cashInside = new THREE.Group(); scene.add(cashInside);
const cashSpill = new THREE.Group(); scene.add(cashSpill);
{
  const tbox = box(0.55, 0.28, 0.4, lam({ color: 0x2f3437 })); tbox.position.set(3.15, 1.15, -3.4); gallaG.add(tbox);
  const lock = box(0.08, 0.06, 0.02, lam({ color: 0xb08d3e })); lock.position.set(3.15, 1.16, -3.19); gallaG.add(lock);
  const lidGeo = new THREE.BoxGeometry(0.55, 0.04, 0.4); lidGeo.translate(0, 0, 0.2);
  gallaLid = new THREE.Mesh(lidGeo, lam({ color: 0x111827 }));
  gallaLid.position.set(3.15, 1.3, -3.6); gallaG.add(gallaLid);
  // cash INSIDE galla — standing green notes, visible SIRF jab galla BHARA ho (f>=1459)
  for (let i = 0; i < 5; i++) {
    const n = box(0.3, 0.28, 0.012, lam({ color: i % 2 ? 0x3f9e4d : 0x6fbf73 }));
    n.position.set(3.15 + (i - 2) * 0.05, 1.28, -3.4 + (i - 2) * 0.02); n.rotation.z = (i - 2) * 0.12; cashInside.add(n);
  }
  // cash HEAP on counter beside galla — F11 FIX: bada + uncha (16 notes, 0.40x0.22)
  // taaki s15 me dher counter par saaf dikhe (pehle 10 chhote note dab se gaye the).
  for (let i = 0; i < 16; i++) {
    const n = box(0.4, 0.016, 0.22, lam({ color: i % 2 ? 0x3f9e4d : 0x6fbf73 }));
    n.position.set(3.45 + (i % 3 - 1) * 0.05, 1.03 + i * 0.016, -3.15 + (Math.floor(i / 3) - 2) * 0.06);
    n.rotation.y = (i % 4 - 1.5) * 0.35; cashHeap.add(n);
  }
  const bandW = box(0.09, 0.03, 0.23, lam({ color: 0xf8fafc })); bandW.position.set(3.45, 1.16, -3.15); cashHeap.add(bandW);
  // SPILL — loose notes on counter top (bhara hone par)
  for (let i = 0; i < 6; i++) {
    const n = box(0.34, 0.012, 0.17, lam({ color: i % 2 ? 0x3f9e4d : 0x6fbf73 }));
    n.position.set(1.95 + (i % 3) * 0.3, 1.02 + (i > 2 ? 0.012 : 0), -3.1 + (Math.floor(i / 3) - 0.5) * 0.2);
    n.rotation.y = (i - 2.5) * 0.45; cashSpill.add(n);
  }
  cashInside.visible = false; cashHeap.visible = false; cashSpill.visible = false;
}
// ---- KHATA on counter — closed cover + open pages (visibility shot se) ----
{
  khataClosedG = new THREE.Group();
  const cover = box(0.36, 0.04, 0.26, lam({ color: 0x7a2e26 })); khataClosedG.add(cover);
  const coverTop = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.24), lam({ map: khataCoverTex }));
  coverTop.rotation.x = -Math.PI / 2; coverTop.position.y = 0.021; khataClosedG.add(coverTop);
  khataClosedG.position.set(2.45, 1.03, -3.62); khataClosedG.scale.setScalar(1.15); khataClosedG.rotation.y = -0.15; scene.add(khataClosedG);
  khataOpenG = new THREE.Group();
  const under = box(0.52, 0.02, 0.36, lam({ color: 0x7a2e26 })); khataOpenG.add(under);
  const pages = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.34), lam({ map: khataPagesTex }));
  pages.rotation.x = -Math.PI / 2; pages.position.y = 0.012; khataOpenG.add(pages);
  khataOpenG.position.set(2.45, 1.02, -3.62); khataOpenG.rotation.y = -0.15; scene.add(khataOpenG);
  khataOpenG.visible = false;
}
// ---- GHAR CHAI STEAM (s08 live element) — cup ke upar halki bhaap, pure function of f ----
const steam = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xfff3da }));
steam.position.set(2.0, 1.0, -3.5); steam.scale.setScalar(0.15); scene.add(steam);

// ---- HELD PROPS (toward-lens shots — prop camera ki taraf, speaker ka chehra peeche) ----
// q01 khataClosed (hook — khata dikhata) | q11 slip (udhaar slip) | q19 khataOpen (ghar me padhta)
// | q24/q25 khataOpen (niyam) | q28/q29 khataOpen (gali me likhta) | q31/q33 khataClosed (supermarket)
// | q38/q39 khataOpen (tankhwaah) | q45 khataOpen (L21 khate me kitna hai).
const slipTex = textBoard(160, 240, (g, w, h) => {
  g.fillStyle = '#f8fafc'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#7a2e26'; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = '#7a2e26'; g.textAlign = 'center'; g.font = 'bold 30px Arial'; g.fillText('UDHAAR', w / 2, 50);
  g.fillStyle = '#1e293b'; g.font = 'bold 40px Arial'; g.fillText('₹500', w / 2, 120);
  g.font = '26px Arial'; g.fillText('RAMU', w / 2, 170);
  g.fillText('BAAD ME', w / 2, 205);
});
const heldPropG = new THREE.Group(); scene.add(heldPropG);
const heldKhataClosed = new THREE.Group();
{
  const c = box(0.3, 0.04, 0.22, lam({ color: 0x7a2e26 })); heldKhataClosed.add(c);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.2), lam({ map: khataCoverTex }));
  top.rotation.x = -Math.PI / 2; top.position.y = 0.021; heldKhataClosed.add(top);
  heldPropG.add(heldKhataClosed);
}
const heldKhataOpen = new THREE.Group();
{
  const under = box(0.36, 0.02, 0.26, lam({ color: 0x7a2e26 })); heldKhataOpen.add(under);
  const pages = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.24), lam({ map: khataPagesTex }));
  pages.rotation.x = -Math.PI / 2; pages.position.y = 0.012; heldKhataOpen.add(pages);
  heldPropG.add(heldKhataOpen);
}
const heldSlip = new THREE.Group();
{
  const s = boardMesh(0.14, 0.2, slipTex); heldSlip.add(s);
  const back = box(0.14, 0.2, 0.008, lam({ color: 0xf8fafc })); back.position.z = -0.006; heldSlip.add(back);
  heldPropG.add(heldSlip);
}
const heldCash = new THREE.Group();
{
  // Cash ki gaddi — KHADI (upright stack, camera ki taraf face), flat slab nahi.
  const b = box(0.3, 0.16, 0.05, lam({ color: 0x3f9e4d })); heldCash.add(b);
  const b2 = box(0.28, 0.14, 0.052, lam({ color: 0x6fbf73 })); b2.position.z = 0.002; heldCash.add(b2);
  const bandW = box(0.31, 0.035, 0.056, lam({ color: 0xf8fafc })); heldCash.add(bandW);
  heldPropG.add(heldCash);
}
heldPropG.visible = false;
// ---- F3: CARRY SACK (q09) — hero ke kandhe par bori (bori uthata). Hero (-0.5,-2.0)
// ke dayein kandhe ke paas, upar uthe haath ke paas; sirf q09 me visible.
// ---- F7: UNCLE CASH (b13) — uncle ke haath me cash ki gaddi, hero ki taraf badhi
// hui; hero ke haath aur uncle ke haath ke beech. Sirf b13 me visible.
const carrySackG = sack(0, 0, 0, 0.3, 0.75);
carrySackG.position.set(-0.15, 1.15, -2.15); carrySackG.visible = false; scene.add(carrySackG);
const uncleCashG = new THREE.Group();
{
  const b = box(0.3, 0.16, 0.05, lam({ color: 0x3f9e4d })); uncleCashG.add(b);
  const b2 = box(0.28, 0.14, 0.052, lam({ color: 0x6fbf73 })); b2.position.z = 0.002; uncleCashG.add(b2);
  const band = box(0.31, 0.035, 0.056, lam({ color: 0xf8fafc })); uncleCashG.add(band);
  uncleCashG.position.set(0.0, 1.25, -1.05);
  uncleCashG.visible = false; scene.add(uncleCashG);
}
const HELD_PROP_OF_SHOT = {
  q01: 'khataClosed', q11: 'slip', q19: 'khataOpen', q20: 'khataOpen', q24: 'khataOpen', q25: 'khataOpen',
  q28: 'khataOpen', q29: 'khataOpen', q31: 'khataClosed', q33: 'khataClosed',
  q38: 'khataOpen', q39: 'khataOpen', q45: 'khataOpen',
  // F7 FIX: q36/q37 me hero cash NAHI deta; UNCLE deta hai (uncleCashG neeche).
};
// Held prop ka scale per shot — khata readable hona chahiye (q01 hook, q24/q25 niyam,
// q38/q39 tankhwaah, q45 khata-close: bada khata; baaki default 1.0).
// Frontal PQ me khata (0.81) chest par fit hota hai (chehre se neeche, galla se door);
// bada khata = "₹10,000" zyada readable.
const HELD_SCALE = { q01: 1.6, q20: 1.5, q24: 1.5, q25: 1.5, q38: 1.5, q39: 1.5, q45: 1.5 };
// Held prop ka image-right offset per shot — ROUND-2: default 0.42 se khata
// frame se bahar (q01 "KHA…" kata) ya galla ke peeche (q24 "₹10,000" dhaka) ja
// raha tha. q01: 0.15 (andar), q24/q25: 0.25 (galla se door), q28/q29: 0.15 (DQ frame
// me), q38/q39: 0.15 (frontal PQ — prop ka forward-offset seedha camera ki taraf
// (+z) jaata hai, isliye rxOff 0.15 par khata chest par aata hai (chehre se neeche,
// galla se door); side-PQ wale -0.2/-0.05 khatm. q45: 0.25 (DL5 close me khata
// centre me, galla se door).
const HELD_RX = { q01: 0.15, q20: 0.25, q24: 0.25, q25: 0.25, q28: 0.15, q29: 0.15, q38: 0.15, q39: 0.15, q45: 0.25 };
// Held prop ki height per shot — q38/q39: default 1.28 (frontal PQ me
// chest-level default hi sahi hai; 1.6/1.45/1.35 side-PQ ke workaround the).
const HELD_Y = {};
function showHeldProp(shot, cp) {
  const kind = HELD_PROP_OF_SHOT[shot.id];
  if (!kind) { heldPropG.visible = false; return; }
  heldPropG.scale.setScalar(HELD_SCALE[shot.id] || 1);
  // Prop UTHAYE HUE haath ke aakhir me: image-right × HELD_RX + camera-dir × 0.7,
  // y HELD_Y (default 1.28) — chehre se saaf, haath se juda dikhe (Gym v4 fix).
  // Camera-dir zyada taaki counter ke props (galla) held prop ko dhak na sakein.
  const dx = cp[0] - shot.cx, dz = cp[2] - shot.cz;
  const len = Math.hypot(dx, dz) || 1;
  const cdx = dx / len, cdz = dz / len;
  const rx = cdz, rz = -cdx;
  const rxOff = HELD_RX[shot.id] ?? 0.42;
  // Slip (udhaar parchi) galla se unchi rakho taaki poora "UDHAAR ₹500 / RAMU" padha jaye.
  const propY = HELD_Y[shot.id] ?? (kind === 'slip' ? 1.5 : 1.28);
  heldPropG.position.set(shot.cx + rx * rxOff + cdx * 0.7, propY, shot.cz + rz * rxOff + cdz * 0.7);
  heldPropG.rotation.set(0, Math.atan2(cp[0] - heldPropG.position.x, cp[2] - heldPropG.position.z), 0);
  // Khata flat padha hota hai — CHILD group ko camera ki taraf tilt karo. SIGN DHYAAN:
  // rotation.x POSITIVE (+0.55) pages ka normal camera ki taraf jhukata hai; negative
  // ulta jhukata hai (round 3 me galat sign se takhti dikha — fix).
  heldKhataOpen.rotation.x = kind === 'khataOpen' ? 0.55 : 0;
  heldKhataClosed.rotation.x = kind === 'khataClosed' ? 0.35 : 0;
  heldKhataClosed.visible = (kind === 'khataClosed');
  heldKhataOpen.visible = (kind === 'khataOpen');
  heldSlip.visible = (kind === 'slip');
  heldCash.visible = (kind === 'cash');
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
// RENDER — 49 shots: camera + acting + set state per SHOT (story.js table)
// =====================================================================
// Crowd modes (story.js SHOTS.crowd hi source of truth):
// 'none' | 'aunty' (D: Graahak-Aunty — camName ke hisaab se jagah) | 'child' (D q15: baccha
// galla dekhta) | 'return' (D b10: wahi aunty wapas, cash dene) | 'queue' (D b14: 4 graahak
// line me — naya fan-out layout; G b11: gali me line) | 'bazaar' (Z: mandi bheed 5) | 'shoppers' (S: 2
// shoppers) | 'uncle' (G b13: Graahak-Uncle cash deta) | 'walkers' (F: gali walkers + baccha).
// Crowd kabhi nahi bolta (mouth null).
function drawCrowd(mode, f, cp, loc, shot) {
  if (mode === 'none') return;
  const C = crowdCards, O = CROWD;
  if (loc === 'F') {
    if (mode === 'walkers') {
      // F2 FIX — walkers alag-alag, poore frame me, koi aadha-kata ya overlap nahi.
      // ROUND-2: C0 (-1.9->-1.7, sign ke kinare se andar), baccha C2 z -2.2->-1.2 —
      // pehle facade ke interior plane (z -2.10) ke PEECHE tha, dikhta hi nahi tha.
      drawChar(C[0], 305, O[0], 'smile', 'hang', 'hang', f, cp, -1.7, 0, -1.8, 0.95, 0.25, null, 0, null, false);
      drawChar(C[1], 306, O[1], 'smile', 'hang', 'hang', f, cp, 0.7, 0, -1.0, 0.95, 0.6, null, 0, null, false);
      drawChar(C[2], 307, O[2], 'smile', 'wave', 'hang', f, cp, -0.2, 0, -1.2, 0.8, 0.1, null, 0, null, false);
    }
    return;
  }
  if (loc === 'Z') {
    if (mode === 'bazaar') {
      // Mandi bheed — ROUND-3: C1 (0.4,-3.4) tarp pole ke PEECHE tha (chehra
      // dhaka) -> (1.0,-3.6) pole se dayein, saaf. C2 (0.3,-4.6) dher ke peeche
      // sirf taangein dikhti thi -> frame se bahar. C4 (-2.0,-3.8) bayein boriyon
      // ke peeche chhupa tha -> bahar. ROUND-4: C3 (-0.9,-4.0) dher ke peeche
      // sirf taangein + sir dikhta tha -> (0.0,-3.0) dher ke saamne, poora saaf.
      // Bache 3 + hero = mandi bhari lagti hai.
      drawChar(C[0], 305, O[0], 'smile', 'reach', 'hang', f, cp, -1.7, 0, -3.2, 0.95, 0, 0.2, 0, null, false);
      drawChar(C[1], 306, O[1], 'smile', 'hang', 'hang', f, cp, 1.0, 0, -3.6, 0.95, 0.3, null, 0, null, false);
      drawChar(C[2], 307, O[2], 'smile', 'reach', 'hang', f, cp, -4.5, 0, -4.6, 0.95, 0.1, null, 0, null, false);
      drawChar(C[3], 308, O[3], 'smile', 'hang', 'hang', f, cp, 0.0, 0, -3.0, 0.95, 0.5, null, 0, null, false);
      drawChar(C[4], 309, O[4], 'smile', 'hang', 'hang', f, cp, -4.5, 0, -3.8, 0.9, 0.4, null, 0, null, false);
    }
    return;
  }
  if (loc === 'S') {
    if (mode === 'shoppers') {
      // F11 FIX — bayein shopper shelf post ke PEECHE chhup raha tha (-1.3,-3.6),
      // dayein shopper (2.6,-3.0) frame se bahar tha. ROUND-2: C0 (-1.15,-2.9)
      // aisle me, poora frame me, chehra saaf; C1 frame se poori bahar (-3.4,-2.6)
      // — aadha-kata se behtar hai ek saaf shopper + rival + hero.
      drawChar(C[0], 305, O[0], 'smile', 'reach', 'hang', f, cp, -1.15, 0, -2.9, 0.95, 0, 0.2, 0, null, false);
      drawChar(C[1], 306, O[1], 'neutral', 'hang', 'hang', f, cp, -3.4, 0, -2.6, 0.95, 0, null, 0, null, false);
    }
    return;
  }
  if (loc === 'G') {
    if (mode === 'queue') {
      // F5 FIX — ASLI diagonal queue. ROUND-2: pehli diagonal (-1.5,-1.6)->
      // (-2.7,-3.4) view-axis ke SAATH thi — sab hero ke peeche chhup gaye.
      // Ab queue AADI-TIRCHHI hai (-2.2,-1.6)->(-1.0,-2.5), hero (0.2,-0.4) se
      // bagal me — har chehra saaf, koi hero ke peeche nahi, koi rassi ke peeche nahi.
      drawChar(C[0], 305, O[0], 'smile', 'hang', 'hang', f, cp, -2.2, 0, -1.6, 0.95, 0.25, null, 0, null, false);
      drawChar(C[1], 306, O[1], 'smile', 'hang', 'hang', f, cp, -1.8, 0, -1.9, 0.95, 0.6, null, 0, null, false);
      drawChar(C[2], 307, O[2], 'smile', 'hang', 'hang', f, cp, -1.4, 0, -2.2, 0.95, 0.1, null, 0, null, false);
      drawChar(C[3], 308, O[3], 'smile', 'hang', 'hang', f, cp, -1.0, 0, -2.5, 0.95, 0.4, null, 0, null, false);
    } else if (mode === 'uncle') {
      // F7 FIX — Graahak-Uncle hero ko cash deta: L='reach' (hero ki taraf wala
      // haath); R hang. Cash gaddi uncleCashG (dono haathon ke beech) — hero sirf leta hai.
      // ROUND-2: uncle (0.8->0.5,-1.2) — hero (-0.5,-0.9) ke paas, dono kinare se andar.
      drawChar(uncleCard, 303, UNCLE, 'smile', 'hang', 'reach', f, cp, 0.5, 0, -1.2, 1.0, 0, null, 0, null, false);
      drawChar(C[2], 307, O[2], 'smile', 'wave', 'hang', f, cp, 2.6, 0, -2.4, 0.8, 0.1, null, 0, null, false);
    }
    return;
  }
  if (loc !== 'D') return;
  if (mode === 'aunty') {
    // FULL BUILD — jagah camName se: CLOSE cams (tarazu/khata/galla close-up) me
    // aunty frame se poori bahar (0.5,-1.8,'hang' — s06 jaisa, warna uski baanh
    // kinare kati dikhti hai); WIDE hook/loop cams (DW/DL) me counter ke saamne
    // poori frame me (0.5,-1.8,'reach' — s01/s15 jaisa); baaki MEDIUM/WIDE me
    // default (1.5,-2.2,'reach' — counter front, hero ko dhakti nahi).
    // R1 FIX: DI/DSH (shelf shots, camera bayein) me aunty (-0.8,-2.6) shelves ke
    // paas (stills s02 jaisa — default (1.5,-2.2) DI se frame se bahar tha);
    // DI2 (camera dayein) me (0.5,-2.6) — hero ko dhakti nahi, kinare se andar.
    const SHELF_CAMS = { DI: [-0.8, -2.6, 'hang'], DSH: [-0.8, -2.6, 'hang'], DI2: [0.5, -2.6, 'hang'] };
    const CLOSE_CAMS = ['DT', 'DT2', 'DT3', 'DHC', 'DC2', 'KC', 'KC2', 'KC3', 'KC4', 'DG3', 'DL2', 'DL4', 'DL5', 'DL8', 'PQ4', 'PQ5', 'DN4', 'SW3'];
    const pos = SHELF_CAMS[shot.camName] ? SHELF_CAMS[shot.camName]
      : (shot.camName === 'DW' || shot.camName === 'DL') ? [0.5, -1.8, 'reach']
      : CLOSE_CAMS.includes(shot.camName) ? [0.5, -1.8, 'hang']
      : [1.5, -2.2, 'reach'];
    drawChar(auntyCard, 302, AUNTY, 'smile', pos[2], 'hang', f, cp, pos[0], 0, pos[1], 1.0, 0, null, 0, null, false);
  } else if (mode === 'child') {
    // F10 FIX — baccha neutral (tense beat "dukaan band hogi" — smile clash karta
    // tha), haath neeche ('hang'), galla ki taraf dekhta. ROUND-2: (2.4,-0.8) par
    // DG frame se bahar tha (sirf neela kinara dikhta tha) — (1.5,-1.6) poora andar.
    // FULL BUILD: sirf q15 (DG2 wide) me — close shots (q16-q18) me 'none'.
    drawChar(C[2], 309, O[2], 'neutral', 'hang', 'hang', f, cp, 1.5, 0, -1.6, 0.8, 0.1, null, 0, null, false);
  } else if (mode === 'return') {
    // F6 FIX — Wahi aunty WAPAS aayi, cash dene: peeche (z -3.0), chhoti (scale
    // 0.9), hero ke bayein — pehle (1.0,-2.0) par camera ke paas badi thi aur hero
    // ko dhak rahi thi. 'reach' = counter/hero ki taraf haath (chukane ka action).
    drawChar(auntyCard, 302, AUNTY, 'smile', 'reach', 'hang', f, cp, 1.3, 0, -3.0, 0.9, 0, null, 0, null, false);
  } else if (mode === 'queue') {
    // TANKHWAAH (b14) — FULL BUILD FIX (still-14 residual): 4 graahak counter ki
    // taraf, aage se peeche bayein ko FAN-OUT (2.0,-2.0)->(0.8,-3.5) — har chehra
    // alag jagah, koi kisi ke peeche nahi jhaankta (pehla layout: C3 (1.3,-3.3)
    // C2 ke peeche chhupa tha, 4th face peeking). PQ2/PQ3/PQ4/PQ5 sab me saaf.
    drawChar(C[0], 305, O[0], 'smile', 'hang', 'hang', f, cp, 2.0, 0, -2.0, 0.95, 0.25, null, 0, null, false);
    drawChar(C[1], 306, O[1], 'smile', 'hang', 'hang', f, cp, 1.6, 0, -2.5, 0.95, 0.6, null, 0, null, false);
    drawChar(C[2], 307, O[2], 'smile', 'hang', 'hang', f, cp, 1.2, 0, -3.0, 0.95, 0.1, null, 0, null, false);
    drawChar(C[3], 308, O[3], 'smile', 'hang', 'hang', f, cp, 0.8, 0, -3.5, 0.95, 0.4, null, 0, null, false);
  }
}
// Light rig beat se badalta hai (roshni = mood): b01/b03/b15 subah garam (dawn), b04 bazaar
// dhool-subah (morning), b05-b07/b09/b10 dopahar (day), b08 ghar shaam naram (homeEvening),
// b11/b13 gali shaam garam (evening), b12 supermarket thanda (cool), b14 tankhwaah subah (morning).
const ENV_OF_BEAT = {
  b01: 'dawn', b02: 'day', b03: 'dawn', b04: 'morning', b05: 'day', b06: 'day', b07: 'day',
  b08: 'homeEvening', b09: 'day', b10: 'day', b11: 'evening', b12: 'cool', b13: 'evening',
  b14: 'morning', b15: 'dawn',
};
const KHATA_OPEN_SHOTS = ['q11', 'q12', 'q21', 'q22', 'q23', 'q24', 'q25', 'q26', 'q27', 'q38', 'q39', 'q40', 'q41'];
window.renderFrame = (f) => {
  const shot = shotAt(f), u = shot.u, id = shot.id;
  const cam = camFor(shot, u);
  camera.position.set(...cam.pos); camera.lookAt(...cam.look);
  camera.fov = cam.fov; camera.updateProjectionMatrix();
  if (cam.roll) camera.rotateZ(cam.roll * Math.PI / 180);
  const loc = shot.loc;
  const env = applyEnv(ENV_OF_BEAT[shot.beat] || 'day');
  ALL_CARDS.forEach((c) => c.hide());
  const cp = cam.pos;
  // ---- location switching: sirf active location ka group visible (per frame, shot.loc se) ----
  dukaanG.visible = (loc === 'D');
  frontG.visible = (loc === 'F');
  bazaarG.visible = (loc === 'Z');
  homeG.visible = (loc === 'C');
  superG.visible = (loc === 'S');
  galiG.visible = (loc === 'G');
  const dukaanVisible = dukaanG.visible;
  // Home bulb + light cone: sirf ghar me (b08 light cone ON — akele hero par).
  if (homeG.userData.bulbLight) homeG.userData.bulbLight.intensity = (loc === 'C') ? 0.8 : 0;
  if (homeG.userData.lightCone) homeG.userData.lightCone.visible = (shot.beat === 'b08');
  // Chai steam: sirf ghar me, pure function of f (bhaap upar uthti, opacity saans leti).
  steam.visible = (loc === 'C');
  if (loc === 'C') {
    const ph = (f % 60) / 60;
    steam.position.set(2.0, 0.95 + ph * 0.25, -3.5);
    steam.material.opacity = 0.25 * (1 - ph);
    steam.scale.setScalar(0.12 + ph * 0.12);
  }
  // Shutter (dukaan front): shutterOpen(f) ka pure function.
  if (frontG.userData.applyShutter) frontG.userData.applyShutter(shutterOpen(f));
  // ---- props default band (har frame reset — sirf apne section me dikhe) ----
  glintGalla.material.opacity = 0; glintKhata.material.opacity = 0;
  gallaBoard.visible = false;
  gallaG.visible = dukaanVisible;
  tarazuG.visible = dukaanVisible;
  khataClosedG.visible = dukaanVisible;
  khataOpenG.visible = false;
  if (gallaLid) gallaLid.rotation.x = 0;
  cashInside.visible = false; cashHeap.visible = false; cashSpill.visible = false;
  const fl = FLASH[id];
  flashPlane.material.opacity = fl ? Math.max(0, 1 - Math.abs(f - fl.at) / (fl.dur / 2)) : 0;
  // ghadi ki suiyaan — env ke hisaab se.
  if (clockHour && clockMin) {
    clockHour.rotation.z = -(env.clockHr / 12) * Math.PI * 2;
    clockMin.rotation.z = 0;
  }
  // ---- per-shot set state ----
  // GALLA board sirf b15 (board='galla').
  if (dukaanVisible && shot.board === 'galla') {
    gallaBoard.visible = true;
    glintGalla.material.opacity = 0.45;
  }
  // Khata: open sirf b05/b09/b10/b14 shots (likhta/padhta/kaat-ta); baaki closed.
  if (dukaanVisible) {
    const open = KHATA_OPEN_SHOTS.includes(id);
    khataOpenG.visible = open;
    khataClosedG.visible = !open;
    if (open) glintKhata.material.opacity = 0.35;
  }
  // Galla: gallaAngle(f) — f493-627 khaali-khula, f1459+ bhara-khula.
  const gAngle = gallaAngle(f);
  if (gallaLid) gallaLid.rotation.x = -gAngle;
  // cashInside SIRF jab galla BHARA ho — khaali-khula galla me hare note dikhna galti hai.
  if (dukaanVisible && gallaFull(f)) cashInside.visible = true;
  if (dukaanVisible && gallaFull(f)) { cashHeap.visible = true; cashSpill.visible = true; }
  // ---- crowd (shot.crowd) + rival (b12) + on-screen hero ----
  drawCrowd(shot.crowd, f, cp, loc, shot);
  if (shot.beat === 'b12') {
    // Rival MANAGER supermarket me hansta (laugh) — aisle me khula, shelf ke peeche chhupa nahi.
    // R2: q32 (SW3 close) me rival hero ke bagal me (0.2,-2.4) — warna hero frame se bahar.
    const rvX = shot.id === 'q32' ? 0.2 : -0.6, rvZ = shot.id === 'q32' ? -2.4 : -2.6;
    drawChar(rivalCard, 301, RIVAL, 'laugh', 'up', 'hang', f, cp, rvX, 0, rvZ, 1.05, 0, null, 0, null, false, false, null);
  }
  if (shot.who === 'hero') {
    // F4 FIX (q13 tarazu — shaant kaam): expression override — 'smile' + lip-sync 'O'
    // + blink frame mil kar "chillata/gaata" chehra banate the. q13 me: neutral
    // (aankhein khuli dot, munh band dash), blink force-off, munh override null
    // (lip-sync 'O' nahi). Baaki shots me normal envelope lip-sync.
    const exprOv = id === 'q13' ? { expr: 'neutral', mix: null } : heroExprAt(f);
    const mouthOv = id === 'q13' ? null : mouthKind(f);
    const blinkOv = id === 'q13' ? 0 : null;
    drawChar(heroCard, 91, HERO, exprOv.expr, shot.R, shot.L, f, cp, shot.cx, 0, shot.cz, shot.cs, 0, null, shot.tilt, mouthOv, false, false, exprOv.mix, blinkOv);
  }
  // ---- held props (toward-lens): khata/slip/cash, speaker ka chehra peeche ----
  showHeldProp(shot, cp);
  // F3 (q09 kandhe par bori) + F7 (b13 uncle ke haath me cash) — sirf apne shot me.
  carrySackG.visible = (id === 'q09');
  uncleCashG.visible = (shot.beat === 'b13');
  updateProxiesW();
  renderer.render(scene, camera);
};
window.TOTAL = TOTAL;
window.ready = Promise.resolve();
