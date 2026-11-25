// "Golgappa Thela — Seth Ji Ka Raaz" — Mirror kit + Gullak grammar, Zomato v4 WORLD ke upar.
// Real three.js sets (gali+Seth cafe / school / office / park) + kit toon cards.
// GULLAK RULE: jo shabd bola, screen par EXACT wahi cheez usi pal (story.js timings).
// ACTING RULE: koi murda khada nahi — chalna, dhakelna, haath chalana, bhaav badlav har beat.
// COLOUR RULE: koi single wash NAHI — har jagah/samajh ka apna natural rang (ENVS neeche).
// Captions: word-by-word Roman (standard style). Contract: window.ready, window.renderFrame(f).
import * as THREE from 'three';
import * as FX from './fx.js';
import * as T from './toon.js';
import { idle, blinkAt, q, M, clamp } from './motion.js';
import { tex, planks, plaster, stone, weave, grass, dirt } from './paint.js';
import { TOTAL, shotAt, camFor, captionAt, FLASH } from './story.js';

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
const lampLight = new THREE.PointLight(0xffc37a, 0, 20, 1.4);
lampLight.position.set(0.5, 3.2, 0.6); scene.add(lampLight);

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

// =====================================================================
// CHARACTER CARDS (kit painter) — zomato wala proven pattern
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
function drawChar(card, seed, outfit, expr, R, L, f, camPos, x, y, z, s = 1.03, step = 0, lift = null, tilt = 0) {
  const idl = idle(f, seed), blink = blinkAt(f, seed);
  const liftQ = lift === null ? '' : q(lift, 1);
  const key = `${seed}|${expr}|${R}|${L}|${blink}|${q(idl.bob, 2)}|${Math.round(idl.tilt + tilt * 3)}|${q(step, 2)}|${liftQ}`;
  card.draw(key, (p) => T.romanFront(p, outfit, {
    seed, expr, R, L, blink, bob: q(idl.bob, 2), tilt: Math.round(idl.tilt + tilt * 3),
    headTilt: Math.round(idle(f, seed + 2).headTilt + tilt * 6), wv: f * 0.18, step, lift: lift === null ? 0 : lift,
  }));
  card.place(x, y, z, camPos, s);
}
// chalte hue character: jagah badlav + pairon ka step cycle + halka aage jhukav
function drawWalk(card, seed, outfit, expr, f, camPos, x0, z0, x1, z1, u, s = 1.0, R = 'hang', L = 'hang') {
  const e = M.easeInOut(u);
  const x = x0 + (x1 - x0) * e, z = z0 + (z1 - z0) * e;
  drawChar(card, seed, outfit, expr, R, L, f, camPos, x, 0, z, s, (f % 14) / 14, null, 1);
}
const chunnuCard = new Card(), sethCard = new Card(), kirayaCard = new Card(), bijliCard = new Card();
const ladka1Card = new Card(), ladka2Card = new Card();
const kid1Card = new Card(), kid2Card = new Card(), kid3Card = new Card(), kid4Card = new Card();
const off1Card = new Card(), off2Card = new Card(), off3Card = new Card();
const park1Card = new Card(), park2Card = new Card();
const ALL_CARDS = [chunnuCard, sethCard, kirayaCard, bijliCard, ladka1Card, ladka2Card,
  kid1Card, kid2Card, kid3Card, kid4Card, off1Card, off2Card, off3Card, park1Card, park2Card];
// is kahani ke fresh designs (Zomato ke Mohan/Seth se alag)
const CHUNNU = { tunic: '#e8862e', shirt: '#fdf6e3', skin: '#e8b98d', hair: '#1e1a20', hairStyle: 'side', hairLine: 0.22, print: { type: 'check', col: '#a34d12', a: 0.3, step: 13, lw: 1.5 } }; // jawaan thela-wala: narangi kurta
const SETH = { tunic: '#8a5a2b', shirt: '#f7f0dd', skin: '#d99e63', cap: '#f2ead8', trim: '#c8952e', stout: true, moustache: '#3a2415', glasses: true, print: { type: 'polka', col: '#5d3c14', a: 0.4, step: 12, r: 1.8 } }; // cafe malik: bhoora sadri-kurta, topi, chashma
const KIRAYA = { tunic: '#4a4e69', shirt: '#e8e4da', skin: '#c98a54', hair: '#241a14', print: { type: 'stripe', col: '#2c2f45', a: 0.35, step: 11, lw: 2 } };
const BIJLI = { tunic: '#e8b81e', shirt: '#f5efe0', skin: '#a06a3c', cap: '#20409a', hair: '#1e1a20' };
const LADKA1 = { tunic: '#b8b0a0', shirt: '#efe9da', skin: '#c98a54', hair: '#1e1a20' };
const LADKA2 = { tunic: '#7a8a99', shirt: '#e8e4da', skin: '#e0a068', hair: '#241a14', hairStyle: 'thick' };
const KID1 = { tunic: '#c23b2e', shirt: '#fdf6e3', skin: '#e8b98d', hair: '#1e1a20' };
const KID2 = { tunic: '#2e7a35', shirt: '#f2ead8', skin: '#c98a54', hair: '#1e1a20' };
const KID3 = { tunic: '#2456c8', shirt: '#fdf6e3', skin: '#a06a3c', hair: '#14100c' };
const KID4 = { tunic: '#e8c33a', shirt: '#f7f0dd', skin: '#e0a068', hair: '#1e1a20' };
const OFF1 = { tunic: '#31517a', shirt: '#eef2f8', skin: '#c98a54', hair: '#1e1a20', print: { type: 'stripe', col: '#eef2f8', a: 0.3, step: 11, lw: 2 } };
const OFF2 = { tunic: '#e8e4da', shirt: '#31517a', skin: '#e8b98d', hair: '#241a14' };
const OFF3 = { tunic: '#5a3a6e', shirt: '#f2ead8', skin: '#a06a3c', hair: '#1e1a20' };
const PARK1 = { tunic: '#2e7a7a', shirt: '#efe6d0', skin: '#e0a068', hair: '#241a14', hairStyle: 'thick' };
const PARK2 = { tunic: '#c94f72', dress: '#d6336c', shirt: '#f7f0dd', skin: '#f0c09a', hair: '#1e1714' };

// =====================================================================
// ENVS — COLOUR RULE: har jagah/samajh ka apna natural rang, koi yellow wash NAHI
// (Gullak frames se verify: din = saturated neela aasmaan; sunset sirf shaam ko;
//  dukaan/jagah ke asal rang; raat/shaam = gehra baingani-narangi)
// =====================================================================
const ENVS = {
  morning: { bg: 0xbfe0f2, fogC: 0xcfe4f2, fogNear: 16, fogFar: 70, hemi: 1.06, hemiC: 0xeaf4ff, hemiG: 0x8a9a6a, sun: 1.35, sunC: 0xfff1cf, sunPos: [-6, 9, 6], bounce: 0.3, bounceC: 0xd6e6ff, expo: 1.1, sky: 'morning', lamp: 0 },
  day: { bg: 0x8ec9ee, fogC: 0xa9cfe6, fogNear: 14, fogFar: 72, hemi: 1.0, hemiC: 0xcfe4ff, hemiG: 0x8a7a5a, sun: 1.42, sunC: 0xffeec2, sunPos: [-7, 10, 5], bounce: 0.3, bounceC: 0xd6e6ff, expo: 1.13, sky: 'day', lamp: 0 },
  noon: { bg: 0x9fd2f2, fogC: 0xbcd9ee, fogNear: 16, fogFar: 75, hemi: 1.18, hemiC: 0xf6fbff, hemiG: 0x9a9a8a, sun: 1.66, sunC: 0xfffdf4, sunPos: [-2.5, 12, 4.5], bounce: 0.34, bounceC: 0xe2efff, expo: 1.09, sky: 'day', lamp: 0 },
  sunset: { bg: 0xcf6a44, fogC: 0xcf7a4e, fogNear: 14, fogFar: 62, hemi: 0.86, hemiC: 0x9a86c8, hemiG: 0x66703c, sun: 2.6, sunC: 0xff8f3f, sunPos: [-12, 4.2, 8], bounce: 0.8, bounceC: 0xff9a50, expo: 1.16, sky: 'sunset', lamp: 0 },
  eve: { bg: 0x5a3d63, fogC: 0x6a4663, fogNear: 11, fogFar: 52, hemi: 0.72, hemiC: 0xa888c0, hemiG: 0x4a3826, sun: 1.15, sunC: 0xff9a50, sunPos: [-10, 3.2, 6], bounce: 0.12, bounceC: 0xc98a6a, expo: 1.13, sky: 'dusk', lamp: 1 },
  dusk: { bg: 0x46305c, fogC: 0x59395f, fogNear: 11, fogFar: 50, hemi: 0.64, hemiC: 0x9a7ab8, hemiG: 0x42301f, sun: 1.7, sunC: 0xff8438, sunPos: [-11, 3.0, 7], bounce: 0.2, bounceC: 0xff9a50, expo: 1.15, sky: 'dusk', lamp: 1 },
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
  lampLight.intensity = e.lamp ? 26 : 0;
  return e;
};
// canvas redraw cache
const K = {};
const once = (name, key, fn) => { if (K[name] === key) return; K[name] = key; fn(); };

// ---------- aasmaan (gradient planes, env se badalte) ----------
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
  sunset: new THREE.Mesh(skyGeo, bas({ map: skyTex([[0, '#2c2a55'], [0.45, '#b84a6e'], [0.75, '#ff8c42'], [1, '#ffd76a']]), fog: false })),
  dusk: new THREE.Mesh(skyGeo, bas({ map: skyTex([[0, '#191738'], [0.42, '#463268'], [0.7, '#a34a68'], [1, '#ff9a5c']]), fog: false })),
};
for (const k in skyMeshes) { skyMeshes[k].position.set(0, 11, -30); skyMeshes[k].visible = false; scene.add(skyMeshes[k]); }
// badaal sprites (din me safed, shaam ko narangi)
const cloudMat = new THREE.SpriteMaterial({ map: FX.puffTexture([[0, 'rgba(255,255,255,0.9)'], [1, 'rgba(255,255,255,0)']]), transparent: true, opacity: 0.55, depthWrite: false });
const clouds = [];
for (let i = 0; i < 7; i++) {
  const sp = new THREE.Sprite(cloudMat);
  sp.position.set(-22 + i * 7.5, 8.5 + (i % 3) * 1.6, -24);
  sp.scale.set(7 + (i % 3) * 2.5, 2.2 + (i % 2), 1);
  scene.add(sp); clouds.push(sp);
}
// ped banane wala helper (teeno set me)
function mkTree(x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s);
  const trunk = cyl(0.09, 0.13, 1.6, lam({ color: 0x6d4a2c })); trunk.position.y = 0.8; g.add(trunk);
  const cols = [0x3e7d32, 0x4c9141, 0x35702c];
  [[0, 2.2, 0, 0.85], [-0.55, 1.85, 0.1, 0.6], [0.55, 1.9, -0.1, 0.65], [0.1, 2.6, 0, 0.55]].forEach(([px, py, pz, r], i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), lam({ color: cols[i % 3] }));
    m.position.set(px, py, pz); g.add(m);
  });
  g.userData.sway = true;
  return g;
}

// =====================================================================
// THELA (teeno jagah jaane wala hero prop) — origin zameen centre, muh +z
// =====================================================================
const thelaG = new THREE.Group(); scene.add(thelaG);
const thelaWheels = [];
let golgappaMeshes = [], thelaCoins = null;
{
  const S = thelaG;
  const wood = lam({ map: FX.woodTexture(), color: 0x9a6a3d });
  // frame + takhta
  const top = box(1.55, 0.07, 0.9, wood); top.position.set(0, 0.92, 0); S.add(top);
  const lowShelf = box(1.4, 0.05, 0.75, wood); lowShelf.position.set(0, 0.42, 0); S.add(lowShelf);
  for (const sx of [-1, 1]) {
    const bar = box(0.06, 0.55, 0.06, lam({ color: 0x54371f }));
    bar.position.set(sx * 0.66, 0.66, 0.36); S.add(bar);
    const bar2 = box(0.06, 0.9, 0.06, lam({ color: 0x54371f }));
    bar2.position.set(sx * 0.66, 0.5, -0.36); S.add(bar2);
  }
  // bade pahiye (ghoomte hue) + chhote pair
  for (const sx of [-1, 1]) {
    const wg = new THREE.Group(); wg.position.set(sx * 0.8, 0.36, 0.05); S.add(wg);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.035, 8, 20), lam({ color: 0x7a4a22 }));
    rim.rotation.y = Math.PI / 2; wg.add(rim);
    for (let i = 0; i < 3; i++) {
      const sp = box(0.03, 0.62, 0.03, lam({ color: 0xa8793f }));
      sp.rotation.x = i * Math.PI / 3; wg.add(sp);
    }
    const hub = cyl(0.06, 0.06, 0.09, lam({ color: 0x54371f })); hub.rotation.z = Math.PI / 2; wg.add(hub);
    thelaWheels.push(wg);
    const leg = cyl(0.03, 0.03, 0.55, lam({ color: 0x54371f })); leg.position.set(sx * 0.6, 0.27, -0.38); S.add(leg);
  }
  // dhakelne wala handle (peeche)
  const handle = cyl(0.025, 0.025, 1.3, lam({ color: 0x54371f })); handle.rotation.z = Math.PI / 2; handle.position.set(0, 0.98, -0.62); S.add(handle);
  for (const sx of [-1, 1]) {
    const hb = cyl(0.02, 0.02, 0.3, lam({ color: 0x54371f }));
    hb.rotation.x = Math.PI / 2.6; hb.position.set(sx * 0.62, 0.95, -0.52); S.add(hb);
  }
  // pateela (bada steel bartan) + dhakkan
  const potPts = [[0.001, 0], [0.2, 0], [0.27, 0.06], [0.3, 0.16], [0.27, 0.26], [0.2, 0.3]].map(([x, y]) => new THREE.Vector2(x, y));
  const pot = new THREE.Mesh(new THREE.LatheGeometry(potPts, 18), lam({ color: 0x8f979e }));
  pot.position.set(-0.44, 0.96, -0.12); S.add(pot);
  const lid = cyl(0.21, 0.23, 0.03, lam({ color: 0x9aa2a9 })); lid.position.set(-0.1, 0.98, 0.28); lid.rotation.z = 0.35; S.add(lid);
  // matka (ghada — paani wala)
  const matka = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 12), lam({ color: 0xa85f32 }));
  matka.scale.set(1, 1.08, 1); matka.position.set(0.52, 1.13, -0.22); S.add(matka);
  const matkaNeck = cyl(0.07, 0.1, 0.09, lam({ color: 0xa85f32 })); matkaNeck.position.set(0.52, 1.36, -0.22); S.add(matkaNeck);
  // imli ki chhoti handi
  const handi = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), lam({ color: 0x6e3b1e }));
  handi.scale.y = 0.85; handi.position.set(0.05, 1.04, -0.28); S.add(handi);
  // golgappa thaali + gole (count variable)
  const thaali = cyl(0.3, 0.22, 0.035, lam({ color: 0xdfe3e6 }), 18); thaali.position.set(0.22, 0.97, 0.18); S.add(thaali);
  const ggGeo = new THREE.SphereGeometry(0.052, 10, 8);
  const ggMat = lam({ color: 0xe8b45a });
  const ggPos = [];
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; ggPos.push([0.22 + Math.cos(a) * 0.17, 1.03, 0.18 + Math.sin(a) * 0.17]); }
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + 0.4; ggPos.push([0.22 + Math.cos(a) * 0.09, 1.11, 0.18 + Math.sin(a) * 0.09]); }
  ggPos.push([0.22, 1.18, 0.18]);
  ggPos.forEach(([px, py, pz]) => {
    const m = new THREE.Mesh(ggGeo, ggMat); m.position.set(px, py, pz); S.add(m); golgappaMeshes.push(m);
  });
  // thela galla dibba (chhota) + sikke (g28 me bhara dikhega)
  const tg = box(0.34, 0.14, 0.26, lam({ color: 0x7a1f14 })); tg.position.set(-0.62, 1.03, 0.25); S.add(tg);
  thelaCoins = new THREE.Group(); thelaCoins.position.set(-0.62, 1.11, 0.25); S.add(thelaCoins);
  for (let i = 0; i < 10; i++) {
    const cn = cyl(0.06, 0.06, 0.016, lam({ color: 0xd9a83c }), 12);
    cn.position.set((i % 3 - 1) * 0.085, Math.floor(i / 3) * 0.018, (i % 2) * 0.06 - 0.03);
    thelaCoins.add(cn);
  }
  const note = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.07), bas({ color: 0x9fc48a }));
  note.position.set(0.02, 0.05, 0.03); note.rotation.x = -0.5; thelaCoins.add(note);
  thelaCoins.visible = false;
  // board: do khambe + board
  for (const sx of [-1, 1]) {
    const pole = cyl(0.022, 0.022, 1.15, lam({ color: 0x54371f }));
    pole.position.set(sx * 0.48, 1.5, -0.4); S.add(pole);
  }
  const tBoard = boardMesh(1.12, 0.42, textBoard(1024, 320, (g, w, h) => {
    g.fillStyle = '#b3231b'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#ffd76a'; g.lineWidth = 10; g.strokeRect(12, 12, w - 24, h - 24);
    g.fillStyle = '#ffffff'; g.font = 'bold 88px Arial'; g.textAlign = 'center';
    g.fillText('CHUNNU', w / 2, 124);
    g.fillStyle = '#ffd76a'; g.font = 'bold 72px Arial';
    g.fillText('GOLGAPPE WALA', w / 2, 248);
  }), true); tBoard.position.set(0, 2.14, -0.4); S.add(tBoard);
  // chhatri (rang-birang: narangi cone + peela kinara)
  const umbPole = cyl(0.02, 0.02, 1.5, lam({ color: 0x54371f })); umbPole.position.set(-0.55, 1.7, -0.35); S.add(umbPole);
  const umb = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.34, 10, 1, true), lam({ color: 0xe86a1e, side: THREE.DoubleSide }));
  umb.position.set(-0.55, 2.5, -0.35); S.add(umb);
  const umbRim = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.022, 6, 24), lam({ color: 0xf7d154 }));
  umbRim.rotation.x = Math.PI / 2; umbRim.position.set(-0.55, 2.34, -0.35); S.add(umbRim);
}
const setGolgappe = (n) => golgappaMeshes.forEach((m, i) => { m.visible = i < n; });

// plastic kursi helper (cafe + park)
function mkChair(color) {
  const g = new THREE.Group();
  const mat = lam({ color });
  const seat = box(0.44, 0.05, 0.42, mat); seat.position.y = 0.45; g.add(seat);
  const back = box(0.44, 0.5, 0.05, mat); back.position.set(0, 0.72, -0.2); back.rotation.x = 0.1; g.add(back);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = box(0.045, 0.45, 0.045, mat); leg.position.set(sx * 0.18, 0.22, sz * 0.17); g.add(leg);
  }
  return g;
}

// =====================================================================
// SET 1 — GALI (Seth cafe + thela jagah + sadak)
// =====================================================================
const galiG = new THREE.Group(); scene.add(galiG);
let cafeGallaLid = null, acFan = null, galiTrees = [], khaaliNishan = null, cafeFanBlades = null;
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
  // ---- SETH CAFE (centre x=2.6) ----
  const cafe = new THREE.Group(); S.add(cafe);
  const cwall = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.6), lam({ map: tex(plaster(21, 44), 2, 1), color: 0xf3e3bc }));
  cwall.position.set(2.6, 1.8, -4.3); cafe.add(cwall);
  for (const px of [0.55, 4.65]) {
    const pil = box(0.26, 3.1, 0.26, lam({ color: 0xc23b2e })); pil.position.set(px, 1.55, -3.35); cafe.add(pil);
  }
  const roof = box(4.8, 0.15, 2.0, lam({ color: 0x31572c })); roof.position.set(2.6, 3.18, -3.7); cafe.add(roof);
  const sign = boardMesh(2.9, 0.78, textBoard(1024, 244, (g, w, h) => {
    g.fillStyle = '#7a1f14'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#ffd76a'; g.lineWidth = 9; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#ffd76a'; g.font = 'bold 118px Arial'; g.textAlign = 'center';
    g.fillText('SETH CAFE', w / 2, 138);
    g.fillStyle = '#ffffff'; g.font = 'bold 52px Arial';
    g.fillText('— AC • THANDI HAWAA —', w / 2, 208);
  }), true); sign.position.set(2.6, 3.62, -3.62); cafe.add(sign);
  // counter + galla
  const counter = box(1.7, 1.0, 0.65, lam({ map: FX.woodTexture(), color: 0x8a5d33 })); counter.position.set(2.6, 0.5, -3.0); cafe.add(counter);
  const cTop = box(1.85, 0.06, 0.8, lam({ color: 0xd9b078 })); cTop.position.set(2.6, 1.03, -3.0); cafe.add(cTop);
  const gallaBase = box(0.52, 0.2, 0.42, lam({ color: 0x2c343c })); gallaBase.position.set(2.6, 1.16, -2.95); cafe.add(gallaBase);
  const gallaIn = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.36), bas({ color: 0x0c0e11 }));
  gallaIn.rotation.x = -Math.PI / 2; gallaIn.position.set(2.6, 1.24, -2.95); cafe.add(gallaIn);
  cafeGallaLid = box(0.52, 0.035, 0.42, lam({ color: 0x707a84 }));
  cafeGallaLid.geometry.translate(0, 0, -0.21);
  cafeGallaLid.position.set(2.6, 1.27, -2.74); cafe.add(cafeGallaLid);
  // AC unit (deewaar par) + pankha andar ghumta
  const acBody = box(0.78, 0.56, 0.24, lam({ color: 0xe8ecef })); acBody.position.set(1.35, 2.62, -4.16); cafe.add(acBody);
  const acGrill = box(0.66, 0.4, 0.02, lam({ color: 0x9aa2a9 })); acGrill.position.set(1.35, 2.62, -4.03); cafe.add(acGrill);
  acFan = new THREE.Group(); acFan.position.set(1.35, 2.62, -4.01); cafe.add(acFan);
  for (let i = 0; i < 3; i++) {
    const bl = box(0.05, 0.2, 0.01, lam({ color: 0xc3ccd2 }));
    bl.rotation.z = i * Math.PI * 2 / 3; bl.position.set(Math.sin(i * 2.1) * 0.045, Math.cos(i * 2.1) * 0.045, 0); acFan.add(bl);
  }
  // kursiyan (cafe ke bahar, footpath par)
  const chairCols = [0xc23b2e, 0x2456c8, 0x2e7a35];
  [[1.7, -2.15], [2.5, -2.1], [3.3, -2.18]].forEach(([cx, cz], i) => {
    const ch = mkChair(chairCols[i]); ch.position.set(cx, 0, cz); ch.rotation.y = 0.15 * (i - 1); cafe.add(ch);
  });
  // darwaza (cafe ka, right side)
  const doorF = box(1.0, 2.15, 0.07, lam({ color: 0x5d3f24 })); doorF.position.set(4.15, 1.08, -4.26); cafe.add(doorF);
  const door = box(0.86, 2.0, 0.05, lam({ color: 0x7d5230 })); door.position.set(4.15, 1.02, -4.22); cafe.add(door);
  // cafe ke andar ka pankha (chhat par latka, counter ke upar)
  const fanG = new THREE.Group(); fanG.position.set(1.9, 3.05, -3.2); cafe.add(fanG);
  cafeFanBlades = new THREE.Group(); fanG.add(cafeFanBlades);
  for (let i = 0; i < 3; i++) {
    const bl = box(0.95, 0.02, 0.2, lam({ color: 0x8a5d3b }));
    const a = i / 3 * Math.PI * 2;
    bl.position.set(Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55); bl.rotation.y = -a; cafeFanBlades.add(bl);
  }
  // ---- thela jagah ke nishan (gayab shot ke liye: chalk ghaira + ek kagaz) ----
  khaaliNishan = new THREE.Group(); khaaliNishan.position.set(-2.2, 0.02, -2.0); S.add(khaaliNishan);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.85, 0.95, 26), bas({ color: 0xf5f2e8, transparent: true, opacity: 0.75 }));
  ring.rotation.x = -Math.PI / 2; khaaliNishan.add(ring);
  const kagaz = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), bas({ color: 0xf8f4e8, side: THREE.DoubleSide }));
  kagaz.rotation.x = -Math.PI / 2; kagaz.position.set(0.5, 0.01, 0.4); khaaliNishan.add(kagaz); S.userData.kagaz = kagaz;
  khaaliNishan.visible = false;
  // ---- aas-paas ki dukaanen/buildings (bhara background) ----
  const shutter = box(2.6, 2.4, 0.15, lam({ map: tex(stone(9), 3, 2), color: 0x8d99a4 })); shutter.position.set(-5.6, 1.2, -4.2); S.add(shutter);
  const shutterSign = boardMesh(2.4, 0.5, textBoard(768, 160, (g, w, h) => {
    g.fillStyle = '#31517a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.font = 'bold 74px Arial'; g.textAlign = 'center';
    g.fillText('SHARMA STORE', w / 2, 102);
  }), true); shutterSign.position.set(-5.6, 2.75, -4.1); S.add(shutterSign);
  const chaiBoard = boardMesh(2.2, 0.55, textBoard(768, 192, (g, w, h) => {
    g.fillStyle = '#e8862e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3a1c08'; g.font = 'bold 84px Arial'; g.textAlign = 'center';
    g.fillText('CHAI POINT', w / 2, 118);
  }), true); chaiBoard.position.set(6.1, 2.5, -4.15); S.add(chaiBoard);
  const chaiWall = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.2), lam({ map: tex(plaster(23, 40), 2, 1), color: 0xd9e6ee }));
  chaiWall.position.set(6.1, 1.6, -4.3); S.add(chaiWall);
  // peeche ki unchi buildings (depth)
  const bgCols = [0xbcd3e6, 0xf0dfba, 0xe6c8c8, 0xcfe0c8];
  [[-9, -9.5, 5, 7], [-3.5, -10, 4, 5.5], [4, -10.5, 5, 8], [9.5, -9, 4, 6]].forEach(([bx, bz, bw, bh], i) => {
    const b = box(bw, bh, 0.5, lam({ color: bgCols[i] })); b.position.set(bx, bh / 2, bz); S.add(b);
    for (let r = 0; r < Math.floor(bh / 1.3); r++) for (let cix = 0; cix < Math.floor(bw / 1.1); cix++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.7), bas({ color: 0x39506b }));
      win.position.set(bx - bw / 2 + 0.8 + cix * 1.1, 1 + r * 1.3, bz + 0.27); S.add(win);
    }
  });
  // ped + street light
  const t1 = mkTree(-5.4, -3.3, 1.15); S.add(t1); galiTrees.push(t1);
  const t2 = mkTree(6.2, -3.1, 0.95); S.add(t2); galiTrees.push(t2);
  const pole = cyl(0.045, 0.055, 3.2, lam({ color: 0x39434c })); pole.position.set(0.1, 1.6, -1.2); S.add(pole);
  const arm = cyl(0.035, 0.035, 0.8, lam({ color: 0x39434c })); arm.rotation.z = Math.PI / 2.3; arm.position.set(0.42, 3.15, -1.2); S.add(arm);
  const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), bas({ color: 0xffe9a8 }));
  lampBulb.position.set(0.72, 3.3, -1.2); S.add(lampBulb);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: FX.puffTexture([[0, 'rgba(255,210,130,0.85)'], [1, 'rgba(255,210,130,0)']]), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.position.set(0.72, 3.3, -1.15); glow.scale.setScalar(1.6); S.add(glow);
  S.userData.lampGlow = glow;
}

// =====================================================================
// SET 2 — SCHOOL (subah: saaf ujli roshni, gate, ghanti, jhanda)
// =====================================================================
const schoolG = new THREE.Group(); scene.add(schoolG);
let bellG = null, gateL = null, gateR = null, schoolTrees = [], flagMesh = null;
{
  const S = schoolG;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 34), lam({ map: tex(dirt(19), 8, 8), color: 0xdccfae }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, 3); S.add(ground);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 9), lam({ map: tex(stone(5), 2, 5), color: 0xcfc4a8 }));
  path.rotation.x = -Math.PI / 2; path.position.set(0, 0.005, -0.5); S.add(path);
  const bwall = new THREE.Mesh(new THREE.PlaneGeometry(10, 4.6), lam({ map: tex(plaster(27, 46), 3, 1), color: 0xf6efdb }));
  bwall.position.set(0, 2.3, -4.4); S.add(bwall);
  for (let i = 0; i < 5; i++) {
    const win = box(1.0, 1.2, 0.06, lam({ color: 0x51748f })); win.position.set(-3.6 + i * 1.8, 2.9, -4.35); S.add(win);
    const win2 = box(1.0, 1.0, 0.06, lam({ color: 0x6d90ad })); win2.position.set(-3.6 + i * 1.8, 1.15, -4.35); S.add(win2);
  }
  const sBoard = boardMesh(4.4, 0.85, textBoard(1024, 200, (g, w, h) => {
    g.fillStyle = '#2456c8'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#ffffff'; g.lineWidth = 7; g.strokeRect(9, 9, w - 18, h - 18);
    g.fillStyle = '#ffffff'; g.font = 'bold 92px Arial'; g.textAlign = 'center';
    g.fillText('VIDYALAYA — SCHOOL', w / 2, 128);
  }), true); sBoard.position.set(0, 5.05, -4.32); S.add(sBoard);
  // gate: do khambe + khulne wale darwaze
  for (const sx of [-1, 1]) {
    const pil = box(0.34, 2.7, 0.34, lam({ color: 0xc23b2e })); pil.position.set(sx * 1.25, 1.35, -3.9); S.add(pil);
    const cap = box(0.46, 0.14, 0.46, lam({ color: 0xf7f0dd })); cap.position.set(sx * 1.25, 2.77, -3.9); S.add(cap);
  }
  const gateBar = box(2.9, 0.16, 0.12, lam({ color: 0x39434c })); gateBar.position.set(0, 2.55, -3.9); S.add(gateBar);
  const mkGate = (side) => {
    const grp = new THREE.Group(); grp.position.set(side * 1.08, 0, -3.9); S.add(grp);
    const door = box(1.05, 1.7, 0.05, lam({ color: 0x51748f })); door.position.set(-side * 0.53, 0.95, 0); grp.add(door);
    for (let i = 0; i < 3; i++) {
      const bar = box(1.0, 0.07, 0.06, lam({ color: 0x39434c })); bar.position.set(-side * 0.53, 0.4 + i * 0.55, 0.01); grp.add(bar);
    }
    return grp;
  };
  gateL = mkGate(-1); gateR = mkGate(1);
  // ghanti (school ki badi ghanti, khambe par)
  const bellPole = cyl(0.035, 0.045, 2.3, lam({ color: 0x54371f })); bellPole.position.set(-1.75, 1.15, -3.7); S.add(bellPole);
  bellG = new THREE.Group(); bellG.position.set(-1.75, 2.28, -3.7); S.add(bellG);
  const bellTop = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: 0xd9a83c }));
  bellG.add(bellTop);
  const bellSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.19, 0.12, 12, 1, true), lam({ color: 0xd9a83c, side: THREE.DoubleSide }));
  bellSkirt.position.y = -0.05; bellG.add(bellSkirt);
  const bellBall = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), lam({ color: 0x8a6844 }));
  bellBall.position.y = -0.13; bellG.add(bellBall);
  // jhanda (school par lehrata)
  const flagPole = cyl(0.025, 0.03, 2.2, lam({ color: 0x9aa2a9 })); flagPole.position.set(3.4, 5.6, -4.3); S.add(flagPole);
  flagMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.55), bas({ color: 0xe86a1e, side: THREE.DoubleSide }));
  flagMesh.position.set(3.85, 6.45, -4.3); S.add(flagMesh);
  // boundary + ped
  for (const sx of [-1, 1]) {
    const bw = box(3.4, 1.0, 0.12, lam({ map: tex(stone(7), 3, 1), color: 0xd8cdb2 }));
    bw.position.set(sx * 3.1, 0.5, -3.9); S.add(bw);
  }
  const t1 = mkTree(-4.4, -3.0, 1.1); S.add(t1); schoolTrees.push(t1);
  const t2 = mkTree(4.6, -2.8, 0.9); S.add(t2); schoolTrees.push(t2);
}

// =====================================================================
// SET 3 — OFFICE (dopahar: tez safed roshni, unchi building, plaza)
// =====================================================================
const officeG = new THREE.Group(); scene.add(officeG);
let officeTrees = [];
{
  const S = officeG;
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(40, 34), lam({ map: tex(stone(13), 9, 9), color: 0xd9d9d4 }));
  plaza.rotation.x = -Math.PI / 2; plaza.position.set(0, -0.02, 3); S.add(plaza);
  const bwall = new THREE.Mesh(new THREE.PlaneGeometry(12, 8.2), lam({ map: tex(plaster(31, 48), 3, 2), color: 0xe9edf2 }));
  bwall.position.set(0, 4.1, -4.6); S.add(bwall);
  for (let r = 0; r < 4; r++) for (let cix = 0; cix < 6; cix++) {
    const jal = (r * 6 + cix) % 7 === 3;
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.05), bas({ color: jal ? 0xffe9a8 : 0x51748f }));
    win.position.set(-4.6 + cix * 1.85, 1.9 + r * 1.55, -4.56); S.add(win);
  }
  const oBoard = boardMesh(4.6, 0.8, textBoard(1024, 180, (g, w, h) => {
    g.fillStyle = '#22303e'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#9fd0ee'; g.lineWidth = 7; g.strokeRect(9, 9, w - 18, h - 18);
    g.fillStyle = '#ffffff'; g.font = 'bold 96px Arial'; g.textAlign = 'center';
    g.fillText('OFFICE', w / 2, 122);
  }), true); oBoard.position.set(0, 8.55, -4.55); S.add(oBoard);
  const door = box(1.5, 2.4, 0.1, lam({ color: 0x39434c })); door.position.set(0.9, 1.2, -4.55); S.add(door);
  const canopy = box(2.6, 0.1, 1.1, lam({ color: 0x51748f })); canopy.position.set(0.9, 2.6, -4.1); S.add(canopy);
  const canteen = boardMesh(1.9, 0.5, textBoard(640, 168, (g, w, h) => {
    g.fillStyle = '#2e7a35'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.font = 'bold 78px Arial'; g.textAlign = 'center';
    g.fillText('CANTEEN', w / 2, 108);
  }), true); canteen.position.set(-4.6, 2.2, -4.2); S.add(canteen);
  const cw = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), lam({ map: tex(plaster(33, 42), 1, 1), color: 0xdfe8ee }));
  cw.position.set(-4.6, 1.3, -4.35); S.add(cw);
  const t1 = mkTree(4.8, -3.0, 1.05); S.add(t1); officeTrees.push(t1);
  const t2 = mkTree(-5.6, -2.6, 0.85); S.add(t2); officeTrees.push(t2);
}

// =====================================================================
// SET 4 — PARK (shaam: hara + sunset, gate, ped, bench, phool)
// =====================================================================
const parkG = new THREE.Group(); scene.add(parkG);
let parkTrees = [];
{
  const S = parkG;
  const ghaas = new THREE.Mesh(new THREE.PlaneGeometry(40, 34), lam({ map: tex(grass(23), 9, 9), color: 0x77a24e }));
  ghaas.rotation.x = -Math.PI / 2; ghaas.position.set(0, -0.02, 3); S.add(ghaas);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 10), lam({ map: tex(dirt(29), 2, 6), color: 0xcbb28a }));
  path.rotation.x = -Math.PI / 2; path.position.set(0.4, 0.005, -0.6); S.add(path);
  for (const sx of [-1, 1]) {
    const pil = box(0.32, 2.5, 0.32, lam({ color: 0x2e7a35 })); pil.position.set(sx * 1.45, 1.25, -4.0); S.add(pil);
  }
  const pBoard = boardMesh(3.2, 0.62, textBoard(1024, 200, (g, w, h) => {
    g.fillStyle = '#2e7a35'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#ffd76a'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#ffffff'; g.font = 'bold 104px Arial'; g.textAlign = 'center';
    g.fillText('PARK', w / 2, 138);
  }), true); pBoard.position.set(0, 2.85, -4.0); S.add(pBoard);
  // bench do
  for (const bx of [-2.7, 3.4]) {
    const bench = new THREE.Group(); bench.position.set(bx, 0, -1.3); S.add(bench);
    const seat = box(1.5, 0.06, 0.42, lam({ map: FX.woodTexture(), color: 0x8a5d33 })); seat.position.y = 0.45; bench.add(seat);
    const back = box(1.5, 0.4, 0.05, lam({ map: FX.woodTexture(), color: 0x8a5d33 })); back.position.set(0, 0.75, -0.2); bench.add(back);
    for (const sx of [-1, 1]) {
      const leg = box(0.06, 0.45, 0.4, lam({ color: 0x39434c })); leg.position.set(sx * 0.65, 0.22, 0); bench.add(leg);
    }
  }
  // phool jhaadiyaan (rang-birang gole)
  const flCols = [0xe84a7a, 0xf7d154, 0xe86a1e, 0xf2f2f2, 0xc23b2e];
  let fseed = 3; const frand = () => ((fseed = (fseed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 26; i++) {
    const bush = new THREE.Mesh(new THREE.SphereGeometry(0.16 + frand() * 0.14, 8, 8), lam({ color: 0x3e7d32 }));
    const bx = -6 + frand() * 12, bz = -3.6 + frand() * 1.2;
    bush.position.set(bx, 0.16, bz); bush.scale.y = 0.75; S.add(bush);
    for (let k = 0; k < 3; k++) {
      const fl = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), bas({ color: flCols[(i + k) % 5] }));
      fl.position.set(bx + (frand() - 0.5) * 0.3, 0.3 + frand() * 0.12, bz + (frand() - 0.5) * 0.2); S.add(fl);
    }
  }
  const t1 = mkTree(-3.6, -3.1, 1.25); S.add(t1); parkTrees.push(t1);
  const t2 = mkTree(4.1, -2.7, 1.05); S.add(t2); parkTrees.push(t2);
  const t3 = mkTree(-1.6, -3.6, 0.9); S.add(t3); parkTrees.push(t3);
  const t4 = mkTree(6.0, -3.4, 1.15); S.add(t4); parkTrees.push(t4);
}

// bijli bill prop (g31)
const billG = new THREE.Group(); scene.add(billG);
{
  const bill = boardMesh(0.36, 0.46, textBoard(360, 460, (g, w, h) => {
    g.fillStyle = '#fdfcf6'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#39434c'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = '#b3231b'; g.font = 'bold 44px Arial'; g.textAlign = 'center';
    g.fillText('BIJLI BILL', w / 2, 70);
    g.fillStyle = '#22252c'; g.font = 'bold 40px Arial'; g.textAlign = 'left';
    g.fillText('SETH CAFE', 30, 150);
    g.fillText('AC x 2', 30, 215);
    g.fillText('PANKHA', 30, 280);
    g.fillStyle = '#b3231b'; g.font = 'bold 62px Arial'; g.textAlign = 'center';
    g.fillText('₹2,450', w / 2, 395);
  }), true);
  billG.add(bill); billG.visible = false;
}

// ---------- captions (word-by-word Roman, insurance-mirror pattern) ----------
const capCanvas = document.createElement('canvas'); capCanvas.width = 1024; capCanvas.height = 256;
const capTex = new THREE.CanvasTexture(capCanvas); capTex.colorSpace = THREE.SRGBColorSpace;
const capPlane = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), new THREE.MeshBasicMaterial({ map: capTex, transparent: true, depthTest: false, fog: false }));
capPlane.renderOrder = 20; scene.add(capPlane);
capPlane.visible = false; // NO-CAPTION BUILD (2026-11-25): caption layer band — user ne captions hatane ko kaha
let capKey = '';
function drawCaption(word) {
  if (word === capKey) return; capKey = word;
  const g = capCanvas.getContext('2d');
  g.clearRect(0, 0, 1024, 256);
  if (word) {
    g.font = 'bold 138px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    let fs = 138;
    while (g.measureText(word).width > 950 && fs > 60) { fs -= 8; g.font = `bold ${fs}px Arial`; }
    g.lineWidth = 26; g.strokeStyle = '#14100c'; g.lineJoin = 'round';
    g.strokeText(word, 512, 132); g.fillStyle = '#ffffff'; g.fillText(word, 512, 132);
  }
  capTex.needsUpdate = true;
}
// ---------- white flash (sirf raaz par) ----------
const flashPlane = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false, fog: false }));
flashPlane.renderOrder = 30; scene.add(flashPlane);

// ---------- character shadow proxies (cards billboard hain) ----------
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

const SETVIS = { gali: galiG, school: schoolG, office: officeG, park: parkG };
const THELA_POS = { gali: [-2.2, -2.0], school: [1.95, -1.55], office: [-2.35, -1.85], park: [1.85, -2.0] };
const THELA_HIDE = { g19: 1, g20: 1, g21: 1, g29: 1, g30: 1, g31: 1, g32: 1, g33: 1, g34: 1 };

window.renderFrame = (f) => {
  const shot = shotAt(f), u = shot.u, set = shot.set, id = shot.id;
  const cam = camFor(shot, u);
  camera.position.set(...cam.pos); camera.lookAt(...cam.look);
  camera.fov = cam.fov; camera.updateProjectionMatrix();
  if (cam.roll) camera.rotateZ(cam.roll * Math.PI / 180);
  const env = applyEnv(shot.env);
  for (const k in skyMeshes) skyMeshes[k].visible = (k === env.sky);
  const daySky = env.sky === 'day' || env.sky === 'morning';
  clouds.forEach((sp, i) => {
    sp.visible = daySky || env.sky === 'sunset';
    sp.position.x = -22 + i * 7.5 + Math.sin(f * 0.004 + i) * 0.6;
  });
  cloudMat.color.set(env.sky === 'sunset' ? 0xe89a70 : 0xffffff);
  cloudMat.opacity = daySky ? 0.55 : 0.4;
  for (const k in SETVIS) SETVIS[k].visible = (k === set);
  ALL_CARDS.forEach((c) => c.hide());
  billG.visible = false;
  const cp = cam.pos;
  // ---- thela placement + harkat ----
  let thelaVisible = !THELA_HIDE[id];
  let tx = THELA_POS[set][0], tz = THELA_POS[set][1], moving = 0;
  if (id === 'g37') { const e = M.easeInOut(u); tx = -2.9 + 3.4 * e; tz = -1.45; moving = 1; }
  if (id === 'g38') { const e = M.easeInOut(u); tx = -0.6 + 2.2 * e; tz = -1.35; moving = 1; }
  if (id === 'g42') { const e = M.easeInOut(u); tx = -0.7 - 1.5 * e; tz = -1.95; moving = 1; }
  thelaG.visible = thelaVisible;
  thelaG.position.set(tx, moving ? Math.abs(Math.sin(f * 0.55)) * 0.022 : 0, tz);
  thelaG.rotation.z = moving ? Math.sin(f * 0.55) * 0.008 : 0;
  if (moving) thelaWheels.forEach((w) => { w.rotation.x = -f * 0.14; });
  khaaliNishan.visible = (id === 'g20');
  if (id === 'g20' && galiG.userData.kagaz) {
    const kg = galiG.userData.kagaz;
    kg.position.set(0.5 + Math.sin(f * 0.045) * 0.22, 0.02 + Math.abs(Math.sin(f * 0.06)) * 0.14, 0.4 + Math.cos(f * 0.03) * 0.1);
    kg.rotation.set(-Math.PI / 2 + Math.sin(f * 0.09) * 0.5, 0, f * 0.02);
  }
  // golgappe ginati (shot ke hisaab se)
  let gg = 14;
  if (id === 'g02') gg = Math.max(0, Math.round(3 * (1 - u)));
  else if (id === 'g18') gg = Math.round(14 - 4 * u);
  else if (id === 'g24') gg = Math.round(12 - 4 * u);
  else if (id === 'g26') gg = Math.round(10 - 6 * u);
  else if (id === 'g27') gg = u < 0.55 ? 1 : 0;
  else if (['g28', 'g35', 'g36', 'g37', 'g38', 'g42', 'g43', 'g44', 'g45'].includes(id)) gg = 0;
  setGolgappe(gg);
  thelaCoins.visible = (id === 'g28');
  // cafe props animation
  cafeGallaLid.rotation.x = (id === 'g04') ? -2.05 * M.easeOut(clamp(u * 2.2)) : 0;
  acFan.rotation.z = f * 0.55;
  cafeFanBlades.rotation.y = f * 0.5;
  if (galiG.userData.lampGlow) galiG.userData.lampGlow.material.opacity = env.lamp ? 0.7 : 0;
  // pedon ki halki harkat (zinda background)
  [...galiTrees, ...schoolTrees, ...officeTrees, ...parkTrees].forEach((t, i) => { t.rotation.z = Math.sin(f * 0.03 + i * 1.7) * 0.018; });
  if (bellG) bellG.rotation.z = (id === 'g16') ? Math.sin(f * 1.35) * 0.42 * (u < 0.7 ? 1 : 0.35) : 0;
  if (gateL) { const open = (id === 'g17') ? M.easeOut(u) : (id === 'g18' ? 1 : 0); gateL.rotation.y = -1.15 * open; gateR.rotation.y = 1.15 * open; }
  if (flagMesh) flagMesh.rotation.y = Math.sin(f * 0.12) * 0.35;

  switch (id) {
    // ---------- HOOK (gali, gehri shaam) ----------
    case 'g01':
      drawChar(chunnuCard, 61, CHUNNU, 'smile_closed', 'reach', 'hang', f, cp, -2.2, 0, -2.8, 1.0);
      drawChar(sethCard, 62, SETH, 'neutral', 'hang', 'hang', f, cp, 2.6, 0, -3.55, 0.9);
      break;
    case 'g02':
      drawChar(chunnuCard, 61, CHUNNU, 'smile', 'reach', 'hang', f, cp, -2.2, 0, -2.8, 1.04);
      drawChar(park1Card, 71, PARK1, 'smile', 'reach', 'hang', f, cp, -1.72, 0, -0.92, 0.98);
      break;
    case 'g03':
      drawChar(sethCard, 62, SETH, 'neutral', 'hang', 'hang', f, cp, 2.6, 0, -3.55, 1.0);
      drawChar(ladka1Card, 66, LADKA1, 'neutral', 'hang', 'hang', f, cp, 3.7, 0, -3.35, 0.92);
      break;
    case 'g04':
      drawChar(sethCard, 62, SETH, 'nervous', 'hang', 'hang', f, cp, 2.6, 0, -3.55, 1.02);
      break;
    case 'g05':
      drawChar(sethCard, 62, SETH, 'pained', 'hang', 'hang', f, cp, 2.85, 0, -3.45, 0.92, 0, null, 1);
      drawChar(ladka2Card, 67, LADKA2, 'neutral', 'reach', 'hang', f, cp, 3.45, 0, -2.75, 0.9);
      break;
    // ---------- PARICHAY (gali, din) ----------
    case 'g06':
      drawChar(chunnuCard, 61, CHUNNU, 'smile', 'reach', 'reach', f, cp, -2.2, 0, -2.8, 1.05);
      break;
    case 'g07':
      drawChar(chunnuCard, 61, CHUNNU, 'grin', 'thumb', 'hang', f, cp, -2.2, 0, -2.8, 1.08);
      break;
    case 'g08':
      drawChar(sethCard, 62, SETH, 'neutral', 'hang', 'hang', f, cp, 2.6, 0, -2.55, 1.0);
      drawChar(chunnuCard, 61, CHUNNU, 'smile', 'wave', 'hang', f, cp, -2.2, 0, -2.75, 0.95);
      drawWalk(off1Card, 73, OFF1, 'neutral', f, cp, -6.5, 1.3, -3.2, 1.3, u, 0.92);
      break;
    case 'g09': break; // AC macro hi hero hai
    case 'g10':
      drawChar(sethCard, 62, SETH, 'neutral', 'hang', 'hang', f, cp, 2.2, 0, -3.25, 1.0);
      drawChar(ladka1Card, 66, LADKA1, 'neutral', 'hang', 'hang', f, cp, 3.35, 0, -2.6, 0.95);
      break;
    case 'g11':
      drawChar(sethCard, 62, SETH, 'grin', 'hip', 'hip', f, cp, 2.6, 0, -2.9, 0.85);
      break;
    // ---------- TAANA ----------
    case 'g12':
      drawChar(sethCard, 62, SETH, 'grin', 'belly', 'hang', f, cp, 2.6, 0, -2.9, 1.07);
      break;
    case 'g13':
      drawChar(sethCard, 62, SETH, 'laugh', 'point', 'hang', f, cp, 2.6, 0, -2.9, 1.05);
      drawChar(chunnuCard, 61, CHUNNU, 'neutral', 'hang', 'hang', f, cp, -2.2, 0, -2.75, 0.9);
      break;
    case 'g14':
      drawChar(sethCard, 62, SETH, 'laugh', 'belly', 'belly', f, cp, 2.6, 0, -2.9, 1.16);
      break;
    case 'g15':
      drawChar(sethCard, 62, SETH, 'laugh', 'point', 'up', f, cp, 2.6, 0, -2.85, 1.02);
      drawChar(chunnuCard, 61, CHUNNU, 'neutral', 'hang', 'hang', f, cp, -2.2, 0, -2.75, 0.92);
      break;
    // ---------- SCHOOL (subah) ----------
    case 'g16':
      drawChar(kid1Card, 81, KID1, 'smile', 'hang', 'hang', f, cp, -0.55, 0, -3.35, 0.8);
      drawChar(kid2Card, 82, KID2, 'smile', 'hang', 'hang', f, cp, 0.1, 0, -3.4, 0.8);
      drawChar(kid3Card, 83, KID3, 'grin', 'up', 'hang', f, cp, 0.7, Math.abs(Math.sin(f * 0.3)) * 0.1, -3.3, 0.8);
      drawChar(chunnuCard, 61, CHUNNU, 'smile', 'hang', 'hang', f, cp, 1.95, 0, -2.3, 0.98);
      break;
    case 'g17':
      drawWalk(kid1Card, 81, KID1, 'grin', f, cp, -0.3, -3.3, 1.35, -2.0, u, 0.8);
      drawWalk(kid2Card, 82, KID2, 'laugh', f, cp, -0.8, -3.35, 1.6, -1.85, clamp(u * 1.15), 0.8);
      drawWalk(kid3Card, 83, KID3, 'smile', f, cp, 0.4, -3.5, 1.05, -2.4, clamp(u * 0.8), 0.8);
      drawChar(chunnuCard, 61, CHUNNU, 'grin', 'reach', 'hang', f, cp, 1.95, 0, -2.3, 1.0);
      break;
    case 'g18': {
      const b1 = Math.abs(Math.sin(f * 0.32)) * 0.13, b2 = Math.abs(Math.sin(f * 0.32 + 2)) * 0.13;
      drawChar(kid1Card, 81, KID1, 'grin', 'reach', 'hang', f, cp, 1.3, b1, -0.8, 0.82);
      drawChar(kid2Card, 82, KID2, 'laugh', 'reach', 'reach', f, cp, 2.55, b2, -0.85, 0.82);
      drawChar(kid3Card, 83, KID3, 'grin', 'reach', 'reach', f, cp, 1.95, 0, -0.58, 0.84);
      drawChar(kid4Card, 84, KID4, 'smile', 'up', 'up', f, cp, 2.8, Math.abs(Math.sin(f * 0.26 + 1)) * 0.16, -1.3, 0.8);
      drawChar(chunnuCard, 61, CHUNNU, 'smile', 'reach', 'reach', f, cp, 1.95, 0, -2.3, 1.02);
      break;
    }
    // ---------- GAYAB (gali, tez dopahar) ----------
    case 'g19':
      drawWalk(sethCard, 62, SETH, 'neutral', f, cp, 2.6, -3.3, 2.45, -2.65, u, 1.03);
      break;
    case 'g20':
      drawWalk(off2Card, 74, OFF2, 'neutral', f, cp, 4.5, -0.5, 1.6, -0.5, u, 0.9);
      break;
    case 'g21':
      drawChar(sethCard, 62, SETH, 'shock', 'up', 'up', f, cp, 2.6, 0, -2.9, 1.18);
      break;
    // ---------- OFFICE (dopahar) ----------
    case 'g22':
      drawChar(chunnuCard, 61, CHUNNU, 'neutral', 'hang', 'hang', f, cp, -2.35, 0, -2.6, 0.92);
      drawWalk(off1Card, 73, OFF1, 'neutral', f, cp, 0.9, -4.0, 0.4, -2.7, u, 0.9);
      drawWalk(off2Card, 74, OFF2, 'neutral', f, cp, 1.6, -4.0, 1.2, -3.0, clamp(u * 0.85), 0.9);
      break;
    case 'g23':
      drawChar(chunnuCard, 61, CHUNNU, 'smile', 'reach', 'hang', f, cp, -2.35, 0, -2.6, 1.0);
      drawWalk(off1Card, 73, OFF1, 'smile', f, cp, -0.8, -2.7, -1.65, -2.25, u, 0.97);
      drawChar(off2Card, 74, OFF2, 'neutral', 'hang', 'hang', f, cp, -0.5, 0, -2.9, 0.94);
      break;
    case 'g24': {
      const adv = u * 0.3;
      drawChar(off1Card, 73, OFF1, 'smile', 'reach', 'hang', f, cp, -1.45 + adv, 0, -1.95, 0.99, (f % 14) / 14);
      drawChar(off2Card, 74, OFF2, 'neutral', 'hang', 'hang', f, cp, -0.65 + adv, 0, -2.02, 0.97, (f % 14) / 14);
      drawChar(off3Card, 75, OFF3, 'neutral', 'hang', 'hang', f, cp, 0.15 + adv, 0, -2.08, 0.97);
      drawChar(park1Card, 71, PARK1, 'neutral', 'hang', 'hang', f, cp, 0.95 + adv, 0, -2.14, 0.95);
      drawChar(chunnuCard, 61, CHUNNU, 'smile', 'reach', 'reach', f, cp, -2.35, 0, -2.6, 1.0);
      break;
    }
    // ---------- PARK (sunset) ----------
    case 'g25':
      drawWalk(park1Card, 71, PARK1, 'smile', f, cp, -1.7, -1.5, -0.6, -1.35, u, 0.95);
      drawChar(park2Card, 72, PARK2, 'smile', 'hang', 'hang', f, cp, 2.45, 0, -1.55, 0.95);
      drawChar(chunnuCard, 61, CHUNNU, 'smile', 'wave', 'hang', f, cp, 1.85, 0, -2.75, 0.97);
      break;
    case 'g26':
      drawChar(park1Card, 71, PARK1, 'smile', 'reach', 'hang', f, cp, 1.15, 0, -1.15, 0.99);
      drawChar(park2Card, 72, PARK2, 'smile', 'hang', 'hang', f, cp, 2.55, 0, -1.2, 0.97);
      drawChar(off3Card, 75, OFF3, 'grin', 'reach', 'hang', f, cp, 1.85, 0, -0.9, 0.98);
      drawChar(chunnuCard, 61, CHUNNU, 'smile', 'reach', 'reach', f, cp, 1.85, 0, -2.75, 1.01);
      break;
    case 'g27':
      drawChar(chunnuCard, 61, CHUNNU, 'smile', 'reach', 'hang', f, cp, 1.85, 0, -2.75, 1.03);
      drawChar(kid4Card, 84, KID4, 'grin', 'reach', 'hang', f, cp, 1.3, 0, -1.15, 0.85);
      break;
    case 'g28':
      drawChar(chunnuCard, 61, CHUNNU, 'smile_closed', 'hang', 'hang', f, cp, 1.85, 0, -2.75, 0.96);
      break;
    // ---------- SETH KE KHARCHE (gali, shaam) ----------
    case 'g29':
      drawChar(sethCard, 62, SETH, 'pained', 'hang', 'hang', f, cp, 3.95, 0, -3.55, 1.03, 0, null, 2);
      drawChar(ladka1Card, 66, LADKA1, 'neutral', 'hang', 'hang', f, cp, 2.2, 0, -3.5, 0.9);
      break;
    case 'g30':
      drawChar(kirayaCard, 68, KIRAYA, 'stern', 'point', 'hang', f, cp, 3.5, 0, -2.85, 1.05);
      drawChar(sethCard, 62, SETH, 'nervous', 'hang', 'hang', f, cp, 4.35, 0, -3.5, 0.99, 0, null, 1);
      break;
    case 'g31':
      billG.visible = true; billG.position.set(2.8, 1.28, -2.35);
      billG.rotation.y = Math.atan2(cp[0] - 2.8, cp[2] + 2.35);
      drawChar(bijliCard, 69, BIJLI, 'neutral', 'reach', 'hang', f, cp, 2.95, 0, -2.55, 1.02);
      break;
    case 'g32':
      drawChar(ladka1Card, 66, LADKA1, 'neutral', 'cheek', 'hang', f, cp, 2.05, 0, -2.62, 0.8);
      drawChar(ladka2Card, 67, LADKA2, 'pained', 'cheek', 'hang', f, cp, 3.0, 0, -2.66, 0.8, 0, null, 1);
      break;
    case 'g33':
      drawChar(sethCard, 62, SETH, 'pained', 'hang', 'hang', f, cp, 2.6, 0, -2.7, 1.0, 0, null, 2);
      break;
    // ---------- RAAZ ----------
    case 'g34':
      if (u < 0.5) drawChar(sethCard, 62, SETH, 'nervous', 'cheek', 'hang', f, cp, 2.6, 0, -2.9, 1.1);
      else drawChar(sethCard, 62, SETH, 'grin', 'point', 'hang', f, cp, 2.6, 0, -2.9, 1.1);
      break;
    case 'g35':
      drawChar(chunnuCard, 61, CHUNNU, 'neutral', 'reach', 'reach', f, cp, -2.2, 0, -2.8, 1.02);
      break;
    case 'g36':
      drawChar(chunnuCard, 61, CHUNNU, 'smile_closed', 'hang', 'hang', f, cp, -2.2, 0, -2.8, 1.06);
      break;
    case 'g37': { // ⭐ TOP angle: bheed aage, Chunnu thela dhakelta peeche
      drawWalk(off1Card, 73, OFF1, 'smile', f, cp, -1.5, -0.9, 1.1, -0.9, u, 0.95);
      drawWalk(kid1Card, 81, KID1, 'grin', f, cp, -1.9, -1.7, 0.7, -1.7, clamp(u * 1.05), 0.82);
      drawWalk(park1Card, 71, PARK1, 'neutral', f, cp, -1.2, -2.3, 1.4, -2.3, clamp(u * 0.95), 0.95);
      drawWalk(off2Card, 74, OFF2, 'neutral', f, cp, -2.3, -0.4, 0.3, -0.4, clamp(u * 0.9), 0.93);
      drawChar(chunnuCard, 61, CHUNNU, 'smile', 'reach', 'reach', f, cp, tx - 0.15, 0, tz - 0.88, 1.0, (f % 14) / 14, null, 1);
      break;
    }
    case 'g38': // side track: bheed jaati, thela saath
      drawWalk(off1Card, 73, OFF1, 'smile', f, cp, 0.3, -1.1, 2.4, -1.1, u, 0.96);
      drawWalk(kid2Card, 82, KID2, 'grin', f, cp, 0.0, -1.9, 2.1, -1.9, clamp(u * 1.05), 0.82);
      drawWalk(park2Card, 72, PARK2, 'smile', f, cp, 0.7, -0.5, 2.8, -0.5, clamp(u * 0.92), 0.94);
      drawChar(chunnuCard, 61, CHUNNU, 'smile', 'reach', 'reach', f, cp, tx - 0.85, 0, tz - 0.3, 1.0, (f % 14) / 14, null, 1);
      break;
    // ---------- ANT (loop) ----------
    case 'g39':
      drawChar(sethCard, 62, SETH, 'smile_closed', 'hang', 'hang', f, cp, 2.6, 0, -2.9, 1.08);
      break;
    case 'g40':
      drawChar(sethCard, 62, SETH, 'smile', 'hang', 'hang', f, cp, 2.6, 0, -2.88, 1.05);
      break;
    case 'g41':
      drawChar(sethCard, 62, SETH, 'smile_closed', 'cheek', 'hang', f, cp, 2.6, 0, -2.9, 1.07);
      break;
    case 'g42': // thela wapas jagah ki taraf chalta
      drawChar(chunnuCard, 61, CHUNNU, 'smile', 'reach', 'reach', f, cp, tx - 0.15, 0, tz - 0.88, 1.0, (f % 14) / 14, null, 1);
      break;
    case 'g43':
      drawChar(chunnuCard, 61, CHUNNU, 'smile', 'reach', 'hang', f, cp, -2.2, 0, -2.8, 1.02);
      drawWalk(park1Card, 71, PARK1, 'smile', f, cp, -0.5, -1.3, -1.45, -1.2, u, 0.97);
      drawChar(kid3Card, 83, KID3, 'grin', 'reach', 'hang', f, cp, -2.7, 0, -1.15, 0.84);
      break;
    case 'g44':
      drawChar(chunnuCard, 61, CHUNNU, 'smile_closed', 'reach', 'hang', f, cp, -2.2, 0, -2.8, 1.0);
      drawChar(sethCard, 62, SETH, 'neutral', 'hang', 'hang', f, cp, 2.6, 0, -3.55, 0.9);
      break;
    case 'g45':
      drawChar(chunnuCard, 61, CHUNNU, 'smile_closed', 'reach', 'hang', f, cp, -2.2, 0, -2.8, 1.05);
      break;
  }
  updateProxiesW();
  // ---- caption: NO-CAPTION BUILD me band (drawCaption call hataya gaya) ----
  const _v = new THREE.Vector3(...cam.look).sub(camera.position).normalize();
  capPlane.position.copy(camera.position).addScaledVector(_v, 16);
  capPlane.position.y -= 4.35;
  capPlane.lookAt(camera.position);
  const visW = 2 * 16 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * (W / H);
  const cs = (visW * 0.96) / 8; capPlane.scale.set(cs, cs, 1);
  // ---- white flash (sirf raaz g37 ke pehle frames) ----
  let flashO = 0;
  for (const fs0 in FLASH) { const s0 = +fs0, len = FLASH[fs0]; if (f >= s0 && f < s0 + len) flashO = 1 - (f - s0) / len; }
  flashPlane.material.opacity = flashO;
  flashPlane.visible = flashO > 0;
  if (flashPlane.visible) {
    flashPlane.position.copy(camera.position).addScaledVector(_v, 6);
    flashPlane.lookAt(camera.position);
  }
  renderer.render(scene, camera);
};
window.TOTAL = TOTAL;
window.ready = Promise.resolve();
