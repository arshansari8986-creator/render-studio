// "Dhaba Wala" — SAMPLE (10.2s, 306 frames @30fps). Mirror kit + Gullak density.
// DO SET: 'highway' (chaudi highway + dhaba building + paar HOTEL) | 'dhaba' (counter/thali area).
// Palette: natural muted — dusty sadak, warm cream deewaar, halke rang ke makaan, natural neela
// aasmaan + garam horizon. Tez saturated rang SIRF hero cheezon par (Bhanu kurta, thaali, ₹100 tag, 12 GUNA board).
// NO captions, NO music. Numbers objects bankar: "12 GUNA" board frame 1 se, "52 CHEEZEIN" menu board, "₹100" tag.
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
scene.add(camera);
const flashPlane = new THREE.Mesh(new THREE.PlaneGeometry(3, 5), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, depthTest: false, fog: false }));
flashPlane.position.set(0, 0, -0.5); flashPlane.renderOrder = 999; camera.add(flashPlane);
const lam = (o) => new THREE.MeshLambertMaterial(o);
const bas = (o) => new THREE.MeshBasicMaterial(o);

// ---------- global lights (subah ki roshni) ----------
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
// dhaba counter ke latakte bulb ki garam roshni (sirf dhaba set me ON)
const bulbLight = new THREE.PointLight(0xffc27a, 0, 7, 1.6);
bulbLight.position.set(0.3, 2.5, -2.4); scene.add(bulbLight);

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
// CHARACTER CARDS (kit painter — paani proven pattern)
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
const bhanuCard = new Card(), rivalCard = new Card(), waiterCard = new Card(), driverCard = new Card();
const ALL_CARDS = [bhanuCard, rivalCard, waiterCard, driverCard];
// FRESH characters — Deepak/Mohan/Ramesh nahi
const BHANU = { tunic: '#c2410c', shirt: '#fef3c7', skin: '#c98a54', hair: '#1e1a20', hairStyle: 'thick', moustache: '#241a14', apron: '#f8fafc' }; // hero: gehra narangi kurta + cream apron + moochh
const RIVAL = { tunic: '#4c1d95', shirt: '#f8fafc', skin: '#d99e63', hair: '#1e1a20', hairStyle: 'thick', glasses: true, moustache: '#241a14' }; // hotel malik: baingani kurta + chashma
const WAITER = { tunic: '#15803d', shirt: '#f8fafc', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick' }; // hari kurta, background
const DRIVER = { tunic: '#0369a1', shirt: '#fef3c7', skin: '#b45309', hair: '#1e1a20', hairStyle: 'thick', cap: '#facc15' }; // truck driver, cab me

// =====================================================================
// ENVS — subah ki roshni (natural, muted; koi single wash NAHI)
// =====================================================================
const ENVS = {
  morning: { bg: 0xd8e8ee, fogC: 0xd8e4e0, fogNear: 10, fogFar: 42, hemi: 1.06, hemiC: 0xdfe8f0, hemiG: 0x8a7a5a, sun: 1.35, sunC: 0xffe9b8, sunPos: [-8, 7, 6], bounce: 0.3, bounceC: 0xe8e0d0, expo: 1.1, sky: 'morning' },
  day: { bg: 0xc8dcec, fogC: 0xd0dde6, fogNear: 12, fogFar: 48, hemi: 1.0, hemiC: 0xdfe8f0, hemiG: 0x8a7a5a, sun: 1.42, sunC: 0xfff6e0, sunPos: [-7, 10, 5], bounce: 0.3, bounceC: 0xe8e0d0, expo: 1.13, sky: 'day' },
};
const applyEnv = (name) => {
  const e = ENVS[name] || ENVS.morning;
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
  morning: new THREE.Mesh(skyGeo, bas({ map: skyTex([[0, '#7fa8c9'], [0.55, '#bcd8e8'], [1, '#f6e8c8']]), fog: false })),
  day: new THREE.Mesh(skyGeo, bas({ map: skyTex([[0, '#6fa3d0'], [0.55, '#a8cde8'], [1, '#f2e6c8']]), fog: false })),
};
for (const k in skyMeshes) { skyMeshes[k].position.set(0, 11, -30); skyMeshes[k].visible = false; scene.add(skyMeshes[k]); }
const cloudMat = new THREE.SpriteMaterial({ map: FX.puffTexture([[0, 'rgba(255,255,255,0.9)'], [1, 'rgba(255,255,255,0)']]), transparent: true, opacity: 0.8, depthWrite: false, fog: false });
const clouds = [];
for (let i = 0; i < 7; i++) {
  const sp = new THREE.Sprite(cloudMat);
  sp.position.set(-22 + i * 7.5, 7.2 + (i % 3) * 1.8, -24);
  sp.scale.set(7 + (i % 3) * 2.5, 2.6 + (i % 2) * 0.8, 1);
  scene.add(sp); clouds.push(sp);
}
// ---------- DISTANT SKYLINE (background depth): hazy buildings peeche, har shot me ----------
const skylineG = new THREE.Group(); scene.add(skylineG);
{
  const skyCols = [0xb8a888, 0xa89a80, 0x9a8f7a, 0xc4b49a, 0x8a7f6e];
  const skySpots = [[-22.5, 7], [-17.5, 9], [-12.5, 6], [-7.5, 8], [-2.5, 10], [2.5, 7], [7.5, 9], [12.5, 6], [17.5, 8], [22.5, 7]];
  skySpots.forEach(([sx, sh], i) => {
    const b = box(5.5, sh, 1.2, lam({ color: skyCols[i % skyCols.length] }));
    b.position.set(sx, sh / 2, -19); skylineG.add(b);
    for (let r = 0; r < Math.floor(sh / 1.6); r++) for (let cix = 0; cix < 3; cix++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.6), bas({ color: 0x6b7a72 }));
      win.position.set(sx - 1.2 + cix * 1.2, 1.2 + r * 1.6, -18.35); skylineG.add(win);
    }
  });
}
function mkTree(x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s);
  const trunk = cyl(0.09, 0.13, 1.6, lam({ color: 0x6d4a2c })); trunk.position.y = 0.8; g.add(trunk);
  const cols = [0x4a6b2f, 0x5a7a35, 0x3d5c2a];
  [[0, 2.2, 0, 0.85], [-0.55, 1.85, 0.1, 0.6], [0.55, 1.9, -0.1, 0.65], [0.1, 2.6, 0, 0.55]].forEach(([px, py, pz, r], i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), lam({ color: cols[i % 3] }));
    m.position.set(px, py, pz); g.add(m);
  });
  return g;
}

// =====================================================================
// SETS — HIGHWAY (dhaba + paar HOTEL) aur DHABA (counter/thali area)
// =====================================================================
const highwayG = new THREE.Group(); scene.add(highwayG);
const dhabaG = new THREE.Group(); scene.add(dhabaG);
let highwayTrees = [], dhabaTrees = [];

// ---- shared board textures ----
// "12 GUNA" board — dhaba deewaar par, frame 1 se (gold-on-dark)
const gunaTex = textBoard(512, 320, (g, w, h) => {
  g.fillStyle = '#134e4a'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#facc15'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
  g.textAlign = 'center'; g.fillStyle = '#facc15';
  g.font = 'bold 100px Arial'; g.fillText('12 GUNA', w / 2, 150);
  g.fillStyle = '#f8fafc'; g.font = 'bold 64px Arial'; g.fillText('KAMAI', w / 2, 245);
});
// "BHANU DHABA" sign — dhaba deewaar ke upar
const dhabaSignTex = textBoard(1024, 170, (g, w, h) => {
  g.fillStyle = '#7f1d1d'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fef3c7'; g.font = 'bold 92px "Arial Narrow", Arial'; g.textAlign = 'center';
  g.fillText('BHANU DHABA', w / 2, 112);
});
// "HOTEL" sign — sadak ke paar wali building par
const hotelSignTex = textBoard(768, 200, (g, w, h) => {
  g.fillStyle = '#e2e8f0'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#4c1d95'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16);
  g.textAlign = 'center'; g.fillStyle = '#4c1d95';
  g.font = 'bold 110px Arial'; g.fillText('HOTEL', w / 2, 118);
  g.fillStyle = '#334155'; g.font = 'bold 44px Arial'; g.fillText('ROOMS • FOOD', w / 2, 172);
});
// MENU BOARD "52 CHEEZEIN" — bahar freestanding + dhaba deewaar par bada (ek hi texture)
const menuTex = textBoard(512, 640, (g, w, h) => {
  g.fillStyle = '#1e293b'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#f8fafc'; g.lineWidth = 5; g.strokeRect(12, 12, w - 24, h - 24);
  g.textAlign = 'center'; g.fillStyle = '#f8fafc';
  g.font = 'bold 72px Arial'; g.fillText('MENU', w / 2, 92);
  g.fillStyle = '#facc15'; g.font = 'bold 62px Arial'; g.fillText('52 CHEEZEIN', w / 2, 200);
  g.fillStyle = '#e2e8f0'; g.font = 'bold 40px Arial'; g.textAlign = 'left';
  ['Dal Fry', 'Mix Sabzi', 'Paneer Butter', 'Jeera Rice', 'Tandoori Roti', 'Butter Naan', 'Salad • Papad'].forEach((it, i) => {
    g.fillText('•  ' + it, 44, 272 + i * 42);
  });
  g.fillStyle = '#facc15'; g.textAlign = 'center'; g.font = 'bold 54px Arial';
  g.fillText('THAALI  ₹100', w / 2, 585);
});

// ---------- HIGHWAY: dusty sadak, dhaba building, HOTEL, tables, ped, taar ----------
{
  const S = highwayG;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 34), lam({ map: tex(dirt(17), 8, 8), color: 0x9c8a70 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, 3); S.add(ground);
  // sadak (asphalt) + dashes + dhool kinare
  const road = new THREE.Mesh(new THREE.PlaneGeometry(40, 3.4), lam({ color: 0x4a4640 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, 1.8); S.add(road);
  for (let i = 0; i < 8; i++) {
    const dash = box(1.1, 0.012, 0.14, bas({ color: 0xe2e8f0 }));
    dash.position.set(-14 + i * 4, 0.008, 1.8); S.add(dash);
  }
  [[0, 0.35, 9, 0.5], [0, 3.25, 9, 0.5]].forEach(([px, pz, pw, pd]) => {
    const dust = new THREE.Mesh(new THREE.PlaneGeometry(pw, pd), new THREE.MeshBasicMaterial({ color: 0xb8a888, transparent: true, opacity: 0.4, depthWrite: false }));
    dust.rotation.x = -Math.PI / 2; dust.position.set(px, 0.006, pz); S.add(dust);
  });
  // dhaba building — warm cream deewaar, terracotta chhat
  const dwall = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 3.2), lam({ map: tex(plaster(41, 38), 2, 1), color: 0xe8dcc0 }));
  dwall.position.set(-1.5, 1.6, -4.3); S.add(dwall);
  for (const px of [-4.6, 1.6]) {
    const pil = box(0.28, 3.2, 0.28, lam({ color: 0xd8c49a })); pil.position.set(px, 1.6, -4.15); S.add(pil);
  }
  const roof = box(7.0, 0.14, 2.4, lam({ map: tex(tinRoof(53), 2, 1), color: 0x9a3412 })); roof.position.set(-1.5, 3.28, -3.6); S.add(roof);
  const roofEdge = box(7.0, 0.1, 0.08, lam({ color: 0x7c2d12 })); roofEdge.position.set(-1.5, 3.22, -2.42); S.add(roofEdge);
  const door = box(1.0, 2.0, 0.1, lam({ color: 0x7c2d12 })); door.position.set(-1.2, 1.0, -4.2); S.add(door);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), lam({ color: 0xfacc15 })); knob.position.set(-0.85, 1.0, -4.12); S.add(knob);
  const win = box(1.0, 1.0, 0.1, lam({ color: 0x9db8c4 })); win.position.set(0.3, 1.9, -4.22); S.add(win);
  const winBar = box(0.06, 1.0, 0.12, lam({ color: 0x2f4a4a })); winBar.position.set(0.3, 1.9, -4.2); S.add(winBar);
  // signs + boards (deewaar par)
  const dhabaSign = boardMesh(2.6, 0.45, dhabaSignTex, true); dhabaSign.position.set(-1.5, 2.95, -4.24); S.add(dhabaSign);
  const gunaBoard = boardMesh(1.3, 0.8, gunaTex, true); gunaBoard.position.set(-2.4, 1.9, -4.22); S.add(gunaBoard);
  // bahar ki tables + kursiyan (ek par thaali)
  function mkTable(x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g);
    const top = cyl(0.55, 0.55, 0.06, lam({ color: 0x8a6844 }), 16); top.position.y = 0.75; g.add(top);
    const leg = cyl(0.05, 0.07, 0.75, lam({ color: 0x5a3b2a }), 8); leg.position.y = 0.37; g.add(leg);
    const base = cyl(0.3, 0.34, 0.05, lam({ color: 0x5a3b2a }), 12); base.position.y = 0.03; g.add(base);
    return g;
  }
  function mkChair(x, z, ry) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; S.add(g);
    const seat = box(0.42, 0.05, 0.42, lam({ color: 0x6d4a2c })); seat.position.y = 0.45; g.add(seat);
    const back = box(0.42, 0.5, 0.05, lam({ color: 0x6d4a2c })); back.position.set(0, 0.72, -0.19); g.add(back);
    return g;
  }
  mkTable(0.6, -2.2); mkChair(0.6, -1.55, Math.PI); mkChair(1.25, -2.2, -Math.PI / 2);
  mkTable(2.2, -2.0); mkChair(2.2, -1.35, Math.PI);
  // HOTEL building — sadak ke paar, halki fancy (pale blue-grey, uncha)
  const hotel = box(3.4, 4.5, 1.2, lam({ color: 0xcfd8dc })); hotel.position.set(4.6, 2.25, -4.6); S.add(hotel);
  const hotelBase = box(3.6, 0.3, 1.4, lam({ color: 0x94a3b8 })); hotelBase.position.set(4.6, 0.15, -4.6); S.add(hotelBase);
  for (let r = 0; r < 3; r++) for (let cix = 0; cix < 2; cix++) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.9), bas({ color: r === 1 ? 0xd8c49a : 0x9db8c4 }));
    w.position.set(3.9 + cix * 1.4, 1.4 + r * 1.2, -3.98); S.add(w);
  }
  const hotelDoor = box(1.0, 1.9, 0.1, lam({ color: 0x4c1d95 })); hotelDoor.position.set(4.6, 0.95, -3.98); S.add(hotelDoor);
  const awning = box(1.6, 0.08, 0.7, lam({ color: 0x4c1d95 })); awning.position.set(4.6, 2.05, -3.7); awning.rotation.x = 0.25; S.add(awning);
  const hotelSign = boardMesh(1.9, 0.5, hotelSignTex, true); hotelSign.position.set(4.6, 4.05, -3.95); S.add(hotelSign);
  // peeche ki kataar (midground) — dhaba/HOTEL ke peeche, duniya gehri lage
  [[-7.5, 4.0, 0xb8a888], [7.0, 4.6, 0xa8a49a], [0.5, 3.6, 0xc4b49a]].forEach(([mx, mh, mcol]) => {
    const m = box(3.2, mh, 0.5, lam({ color: mcol })); m.position.set(mx, mh / 2, -7); S.add(m);
    const mw = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.7), bas({ color: 0x6b7a72 }));
    mw.position.set(mx + 0.7, 2.0, -6.72); S.add(mw);
  });
  const t1 = mkTree(-6.2, -3.6, 1.05); S.add(t1); highwayTrees.push(t1);
  const t2 = mkTree(6.4, -3.4, 0.9); S.add(t2); highwayTrees.push(t2);
  const t3 = mkTree(-5.0, -6.5, 1.3); S.add(t3); highwayTrees.push(t3);
  // khambe + taar (sag) — highway ke upar
  const wireMat = lam({ color: 0x2c343c });
  const wirePole1 = cyl(0.04, 0.05, 4.2, lam({ color: 0x39434c })); wirePole1.position.set(-6.5, 2.1, -3.6); S.add(wirePole1);
  const wirePole2 = cyl(0.04, 0.05, 4.2, lam({ color: 0x39434c })); wirePole2.position.set(6.5, 2.1, -3.6); S.add(wirePole2);
  [[3.9, -3.5], [3.55, -3.9]].forEach(([wy, wz]) => {
    const segL = cyl(0.015, 0.015, 6.8, wireMat, 6); segL.rotation.z = Math.PI / 2 + 0.06; segL.position.set(-3.3, wy - 0.12, wz); S.add(segL);
    const segR = cyl(0.015, 0.015, 6.8, wireMat, 6); segR.rotation.z = Math.PI / 2 - 0.06; segR.position.set(3.3, wy - 0.12, wz); S.add(segR);
  });
}

// ---------- DHABA: counter/thali area (menu board bada, latakte bulb, bhaap) ----------
{
  const S = dhabaG;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 34), lam({ map: tex(dirt(23), 8, 8), color: 0x9c8a70 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, 3); S.add(ground);
  // peeche ki deewaar — NEECHI (2.8) taaki upar aasmaan + skyline dikhe
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 2.8), lam({ map: tex(plaster(43, 40), 2, 1), color: 0xe8dcc0 }));
  wall.position.set(0, 1.4, -3.8); S.add(wall);
  const bigMenu = boardMesh(1.6, 1.8, menuTex, true); bigMenu.position.set(1.25, 1.8, -3.72); S.add(bigMenu);
  const smallSign = boardMesh(1.6, 0.28, dhabaSignTex, true); smallSign.position.set(-2.2, 2.3, -3.72); S.add(smallSign);
  // counter (lakdi) + upar thaali stack
  const counter = box(2.8, 1.0, 0.8, lam({ color: 0x8a6844 })); counter.position.set(0.3, 0.5, -2.6); S.add(counter);
  const counterTop = box(3.0, 0.06, 0.9, lam({ color: 0xc9a06a })); counterTop.position.set(0.3, 1.03, -2.6); S.add(counterTop);
  // counter front band — khaali brown na lage: teal patti + naam (s05 ECU + s03 me dikhe)
  const bandStripe = box(2.82, 0.14, 0.02, lam({ color: 0x0f766e })); bandStripe.position.set(0.3, 0.62, -2.19); S.add(bandStripe);
  const bandTex = textBoard(1024, 128, (g, w, h) => {
    g.fillStyle = '#134e4a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fde047'; g.font = 'bold 60px "Arial Narrow", Arial'; g.textAlign = 'center';
    g.fillText('BHANU DHABA', w / 2, 88);
  });
  const bandSign = boardMesh(1.2, 0.24, bandTex, true); bandSign.position.set(0.5, 0.68, -2.175); S.add(bandSign);
  // latakte bulb (2) — cord + shade + bulb
  for (const lx of [-0.6, 1.2]) {
    const cord = cyl(0.015, 0.015, 1.2, lam({ color: 0x1e293b }), 6); cord.position.set(lx, 4.4, -2.8); S.add(cord);
    const shade = cyl(0.22, 0.3, 0.22, lam({ color: 0xfacc15 }), 12); shade.position.set(lx, 4.1, -2.8); S.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), lam({ color: 0xfff7cc })); bulb.position.set(lx, 3.95, -2.8); S.add(bulb);
  }
  // side table + kursi
  const top = cyl(0.55, 0.55, 0.06, lam({ color: 0x8a6844 }), 16); top.position.set(2.4, 0.75, -2.0); S.add(top);
  const leg = cyl(0.05, 0.07, 0.75, lam({ color: 0x5a3b2a }), 8); leg.position.set(2.4, 0.37, -2.0); S.add(leg);
  // peeche ki kataar + ped (depth)
  [[-5.5, 4.2, 0xb8a888], [5.0, 3.8, 0xa8a49a]].forEach(([mx, mh, mcol]) => {
    const m = box(3.2, mh, 0.5, lam({ color: mcol })); m.position.set(mx, mh / 2, -8); S.add(m);
    const mw = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.7), bas({ color: 0x6b7a72 }));
    mw.position.set(mx + 0.7, 2.0, -7.72); S.add(mw);
  });
  const ht = mkTree(-4.5, -3.0, 1.4); S.add(ht); dhabaTrees.push(ht);
  const ht2 = mkTree(4.8, -3.2, 1.1); S.add(ht2); dhabaTrees.push(ht2);
}

// =====================================================================
// PROPS — thaali, truck (container truck — tempo copy NAHI), ₹100 tag, bhaap, dhool
// =====================================================================
function mkThali(s = 1) {
  const g = new THREE.Group(); g.scale.setScalar(s);
  const plate = cyl(0.42, 0.36, 0.04, lam({ color: 0xd7dde3 }), 20); plate.position.y = 0.02; g.add(plate);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.025, 8, 24), lam({ color: 0xb8c0c8 }));
  rim.rotation.x = Math.PI / 2; rim.position.y = 0.04; g.add(rim);
  const bowls = [
    [0.16, 0.1, 0xc2410c], [-0.16, 0.08, 0x15803d], [0.0, -0.16, 0xeab308],
  ];
  bowls.forEach(([bx, bz, col]) => {
    const b = cyl(0.11, 0.09, 0.09, lam({ color: col }), 12); b.position.set(bx, 0.08, bz); g.add(b);
  });
  const rice = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), lam({ color: 0xf8fafc }));
  rice.scale.y = 0.45; rice.position.set(-0.05, 0.06, -0.02); g.add(rice);
  const roti = cyl(0.16, 0.16, 0.015, lam({ color: 0xf5e6c8 }), 14); roti.position.set(0.2, 0.06, -0.2); roti.rotation.z = 0.12; g.add(roti);
  return g;
}
const heroThali = mkThali(1.0); scene.add(heroThali); heroThali.visible = false;
const tableThali = mkThali(0.9); tableThali.position.set(0.6, 0.8, -2.2); highwayG.add(tableThali);
const counterThali = mkThali(1.0); counterThali.position.set(0.3, 1.06, -2.6); dhabaG.add(counterThali);
const stackThali1 = mkThali(0.9); stackThali1.position.set(-1.3, 1.06, -2.6); dhabaG.add(stackThali1);
const stackThali2 = mkThali(0.9); stackThali2.position.set(-1.3, 1.14, -2.6); dhabaG.add(stackThali2);

// ---- ₹100 TAG (s05 me pop) ----
const tagCanvas = document.createElement('canvas'); tagCanvas.width = 256; tagCanvas.height = 256;
{
  const g = tagCanvas.getContext('2d');
  g.fillStyle = '#facc15'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
  g.strokeStyle = '#7f1d1d'; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 104, 0, 7); g.stroke();
  g.fillStyle = '#7f1d1d'; g.font = 'bold 92px Arial'; g.textAlign = 'center'; g.fillText('₹100', 128, 158);
}
const tagTex = new THREE.CanvasTexture(tagCanvas); tagTex.colorSpace = THREE.SRGBColorSpace;
const tag100 = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.32), new THREE.MeshBasicMaterial({ map: tagTex, transparent: true, depthWrite: false }));
tag100.visible = false; scene.add(tag100);

// ---- BHAAP (thaali se) + DHOOL (truck ke peeche) ----
const steamMat = () => new THREE.SpriteMaterial({ map: FX.puffTexture([[0, 'rgba(255,255,255,0.85)'], [1, 'rgba(255,255,255,0)']]), transparent: true, opacity: 0, depthWrite: false });
const steamSprites = [];
for (let i = 0; i < 3; i++) { const sp = new THREE.Sprite(steamMat()); sp.scale.setScalar(0.3); scene.add(sp); steamSprites.push(sp); }
const dustMat = () => new THREE.SpriteMaterial({ map: FX.puffTexture([[0, 'rgba(184,168,136,0.7)'], [1, 'rgba(184,168,136,0)']]), transparent: true, opacity: 0, depthWrite: false });
const dustSprites = [];
for (let i = 0; i < 4; i++) { const sp = new THREE.Sprite(dustMat()); sp.scale.setScalar(0.8); scene.add(sp); dustSprites.push(sp); }
// thaali chamak
const glintThali = mkGlint(0, 1.2, -2.4, 0.5);

// ---- TRUCK (container truck — apna design: laal cab + cream container, tempo nahi) ----
const truckG = new THREE.Group(); scene.add(truckG);
let truckWheels = [];
{
  // container (cream + laal stripe)
  const cont = box(2.9, 1.9, 1.9, lam({ color: 0xe8ddc8 })); cont.position.set(-0.3, 1.35, 0); truckG.add(cont);
  const stripe = box(2.92, 0.18, 1.92, lam({ color: 0x991b1b })); stripe.position.set(-0.3, 1.0, 0); truckG.add(stripe);
  const contRoof = box(2.94, 0.08, 1.94, lam({ color: 0xd8c49a })); contRoof.position.set(-0.3, 2.34, 0); truckG.add(contRoof);
  // cab — panels (khidki khuli jagah, driver dikhe)
  const cabRed = lam({ color: 0x991b1b });
  const cabFloor = box(1.0, 0.15, 1.5, cabRed); cabFloor.position.set(1.7, 0.45, 0); truckG.add(cabFloor);
  const cabRear = box(0.08, 1.15, 1.5, cabRed); cabRear.position.set(1.22, 0.98, 0); truckG.add(cabRear);
  const cabFrontLow = box(0.08, 0.6, 1.5, cabRed); cabFrontLow.position.set(2.18, 0.75, 0); truckG.add(cabFrontLow);
  const cabRoof = box(1.05, 0.1, 1.55, cabRed); cabRoof.position.set(1.7, 1.58, 0); truckG.add(cabRoof);
  [[0.76], [-0.76]].forEach(([pz]) => {
    const sideLow = box(1.0, 0.6, 0.08, cabRed); sideLow.position.set(1.7, 0.75, pz); truckG.add(sideLow);
    const pillar = box(0.08, 0.55, 0.08, cabRed); pillar.position.set(2.16, 1.3, pz); truckG.add(pillar);
    const pillar2 = box(0.08, 0.55, 0.08, cabRed); pillar2.position.set(1.24, 1.3, pz); truckG.add(pillar2);
  });
  // windshield + side windows (transparent)
  const glassMat = new THREE.MeshBasicMaterial({ color: 0x9db8c4, transparent: true, opacity: 0.45, depthWrite: false });
  const shield = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.55), glassMat);
  shield.position.set(2.23, 1.3, 0); shield.rotation.y = Math.PI / 2; truckG.add(shield);
  [[0.77], [-0.77]].forEach(([pz]) => {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.55), glassMat);
    w.position.set(1.7, 1.3, pz); truckG.add(w);
  });
  // headlights + bumper
  const bumper = box(0.12, 0.25, 1.5, lam({ color: 0x39434c })); bumper.position.set(2.26, 0.35, 0); truckG.add(bumper);
  [[0.5], [-0.5]].forEach(([pz]) => {
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), lam({ color: 0xfff7cc })); hl.position.set(2.24, 0.62, pz); truckG.add(hl);
  });
  // wheels (6) — torus + hub
  const wheelMat = lam({ color: 0x1c222a });
  [[1.7, 0.95], [1.7, -0.95], [-1.2, 0.95], [-1.2, -0.95], [-0.4, 0.95], [-0.4, -0.95]].forEach(([wx, wz]) => {
    const wh = new THREE.Group(); wh.position.set(wx, 0.32, wz); truckG.add(wh);
    const tyre = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.09, 8, 18), wheelMat);
    tyre.rotation.y = Math.PI / 2; wh.add(tyre);
    const hub = cyl(0.12, 0.12, 0.06, lam({ color: 0x9aa2a9 }), 10); hub.rotation.x = Math.PI / 2; wh.add(hub);
    truckWheels.push(wh);
  });
  truckG.visible = false;
}
const headGlowMat = new THREE.SpriteMaterial({ map: FX.puffTexture([[0, 'rgba(255,244,200,0.95)'], [1, 'rgba(255,244,200,0)']]), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const headGlowL = new THREE.Sprite(headGlowMat); headGlowL.scale.setScalar(0.7); scene.add(headGlowL);
const headGlowR = new THREE.Sprite(headGlowMat.clone()); headGlowR.scale.setScalar(0.7); scene.add(headGlowR);

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
function driveTruck(x, z, f) {
  truckG.visible = true;
  truckG.position.set(x, 0, z);
  truckG.rotation.y = 0;
  truckWheels.forEach((w) => { w.rotation.x = f * 0.3; });
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
    sp.position.x = -22 + i * 7.5 + Math.sin(f * 0.004 + i) * 0.6;
  });
  skylineG.visible = true;
  ALL_CARDS.forEach((c) => c.hide());
  const cp = cam.pos;
  // ---- set visibility ----
  highwayG.visible = (shot.set === 'highway');
  dhabaG.visible = (shot.set === 'dhaba');
  bulbLight.intensity = (shot.set === 'dhaba') ? 2 : 0;
  // ---- hamesha zinda background: ped hilte ----
  highwayTrees.forEach((t, i) => { t.rotation.z = Math.sin(f * 0.03 + i * 1.7) * 0.018; });
  dhabaTrees.forEach((t, i) => { t.rotation.z = Math.sin(f * 0.03 + i * 2.3) * 0.018; });
  // ---- props default band ----
  glintThali.material.opacity = 0;
  heroThali.visible = false;
  truckG.visible = false;
  tag100.visible = false;
  steamSprites.forEach((sp) => { sp.material.opacity = 0; });
  dustSprites.forEach((sp) => { sp.material.opacity = 0; });
  const fl = FLASH[id];
  flashPlane.material.opacity = fl ? Math.max(0, 1 - Math.abs(f - fl.at) / (fl.dur / 2)) : 0;
  headGlowL.material.opacity = 0; headGlowR.material.opacity = 0;
  // bhaap — sirf dhaba set me, counter thaali se upar (loop)
  if (shot.set === 'dhaba') {
    steamSprites.forEach((sp, i) => {
      const p = ((f * 0.008 + i * 0.33) % 1);
      sp.material.opacity = (1 - p) * 0.45;
      sp.position.set(0.3 + Math.sin(f * 0.05 + i * 2) * 0.08, 1.15 + p * 0.7, -2.6);
      sp.scale.setScalar(0.25 + p * 0.35);
    });
  }

  switch (id) {
    case 's01': { // ANCHOR (2.53s): low-angle tracking → dhaba push-in; truck guzarta, Bhanu khada, "12 GUNA" frame 1 se
      const tx = -9.0 + 12.0 * M.easeInOut(u);
      driveTruck(tx, 1.2, f);
      drawChar(driverCard, 54, DRIVER, 'neutral', 'hang', 'hang', f, cp, tx + 1.7, 0, 1.2, 0.72);
      drawChar(bhanuCard, 51, BHANU, 'grin', 'reach', 'hang', f, cp, -1.5, 0, -1.6, 1.05, 0, 0.5, 0, ENV[f]);
      heroThali.visible = true;
      heroThali.position.set(-0.85, 1.15, -1.3);
      heroThali.rotation.z = 0.1;
      dustSprites.forEach((sp, i) => {
        sp.material.opacity = 0.35;
        sp.position.set(tx - 1.8 - i * 0.4, 0.3 + (i % 2) * 0.2, 1.2 + (i % 2 ? 0.5 : -0.5));
      });
      drawWalk(waiterCard, 53, WAITER, 'neutral', f, cp, 3.5, -1.5, 0.5, -1.2, clamp(u * 0.9), 0.9);
      break;
    }
    case 's02': { // Bhanu CLOSE-UP (s 2.1), grin, lip-sync ON, haath me thaali, garv
      drawChar(bhanuCard, 51, BHANU, 'grin', 'reach', 'hang', f, cp, -1.5, 0, -1.6, 2.1, 0, 0.5, 0, ENV[f]);
      heroThali.visible = true;
      heroThali.position.set(-0.75, 2.0, -1.25);
      heroThali.rotation.z = 0.1;
      glintThali.position.set(-0.75, 2.2, -1.1); glintThali.material.opacity = 0.4 + 0.3 * Math.sin(f * 0.3);
      drawWalk(waiterCard, 53, WAITER, 'neutral', f, cp, 2.5, -1.0, -0.5, -1.4, clamp(u * 0.9), 0.9);
      break;
    }
    case 's03': { // Bhanu + MENU BOARD "52 CHEEZEIN", board ki taraf ishaara
      drawChar(bhanuCard, 51, BHANU, 'grin', 'point', 'hang', f, cp, -0.35, 0, -1.9, 1.05, 0, null, 0, ENV[f]);
      break;
    }
    case 's04': { // Highway ESTABLISH wide — truck guzarta, dhool, BHANU DHABA sign
      const tx = -9.0 + 11.0 * M.easeInOut(u);
      driveTruck(tx, 1.2, f);
      drawChar(driverCard, 54, DRIVER, 'neutral', 'hang', 'hang', f, cp, tx + 1.7, 0, 1.2, 0.72);
      drawChar(bhanuCard, 51, BHANU, 'smile', 'up', 'hang', f, cp, -1.5, 0, -1.6, 1.05, 0, 0.85, 0);
      dustSprites.forEach((sp, i) => {
        sp.material.opacity = 0.4;
        sp.position.set(tx - 1.8 - i * 0.4, 0.3 + (i % 2) * 0.2, 1.2 + (i % 2 ? 0.5 : -0.5));
      });
      drawWalk(waiterCard, 53, WAITER, 'neutral', f, cp, 3.0, -1.0, 0.5, -1.4, clamp(u * 0.9), 0.9);
      break;
    }
    case 's05': { // THAALI ECU — bhaap uthti thaali counter par, "₹100" tag pop
      drawChar(bhanuCard, 51, BHANU, 'smile', 'reach', 'hang', f, cp, -1.3, 0, -2.4, 1.0, 0, 0.5, 0);
      const pop = clamp(u * 4, 0, 1);
      tag100.visible = true;
      tag100.position.set(0.45, 1.62, -2.55);
      tag100.scale.setScalar(Math.max(0.01, pop));
      tag100.material.opacity = pop;
      break;
    }
    case 's06': { // RIVAL hotel-wala — sadak ke paar HOTEL, rival smug (truck HATAO: camera ke saamne se guzar kar frame block kar raha tha)
      drawChar(rivalCard, 52, RIVAL, 'grin', 'hip', 'hang', f, cp, 3.2, 0, -2.8, 1.0, 0, null, 1);
      drawWalk(waiterCard, 53, WAITER, 'neutral', f, cp, -3.0, -1.0, -0.5, -1.4, clamp(u * 0.9), 0.9);
      break;
    }
    case 's07': { // Rival LAUGH close-up (s 2.0), laugh expression, sar peeche
      drawChar(rivalCard, 52, RIVAL, 'laugh', 'hang', 'hang', f, cp, 3.2, 0, -2.8, 2.0, 0, null, -2, ENV[f]);
      break;
    }
  }
  updateProxiesW();
  renderer.render(scene, camera);
};
window.TOTAL = TOTAL;
window.ready = Promise.resolve();
