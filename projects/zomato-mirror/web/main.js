// "Zomato ₹500 Order Ka Hisaab" — Mirror kit + Gullak grammar, IPL se UPAR level.
// Real three.js sets (dhaba andar / gali-dhabe / hisaab desk / phone macro) +
// kit toon cards + scene-ke-andar boards/screens. NO CAPTIONS (user order).
// GULLAK RULE: jo shabd bola, screen par EXACT wahi cheez usi pal (story.js timings).
// Har shot 0.9-1.67s, har shot alag angle+move, zinda background, bhaav-lehja match,
// safe-frame, professional colour grading (ACES + har env apna rang/samay).
// Contract: window.ready, window.renderFrame(f).
import * as THREE from 'three';
import * as FX from './fx.js';
import * as T from './toon.js';
import { idle, blinkAt, q, M, clamp, spline } from './motion.js';
import { tex, planks, plaster, stone, weave, grass, dirt } from './paint.js';
import { TOTAL, shotAt, camFor } from './story.js';

const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;   // professional colour grading
renderer.toneMappingExposure = 1.16;
renderer.shadowMap.enabled = true;                      // LOOK-V2: asli soft shadows (flatness ki sabse badi dawa)
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 300);
const lam = (o) => new THREE.MeshLambertMaterial(o);
const bas = (o) => new THREE.MeshBasicMaterial(o);

// ---------- global lights (per-env intensity applyEnv me) ----------
const hemi = new THREE.HemisphereLight(0xffe7c4, 0x5a4632, 0.95); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffd9a0, 1.8);
sun.position.set(-6, 8, 5); scene.add(sun); scene.add(sun.target);
sun.castShadow = true;                                  // LOOK-V2
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -11; sun.shadow.camera.right = 11;
sun.shadow.camera.top = 11; sun.shadow.camera.bottom = -11;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 45;
sun.shadow.bias = -0.0022; sun.shadow.normalBias = 0.02;

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
// CHARACTER CARD (kit painter) — IPL wala hi proven pattern
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
// dizzy wala khaas draw (sar ghoom: temple pose + ghoomte taare)
function drawDizzy(card, seed, outfit, f, camPos, x, y, z, s = 1.05) {
  const idl = idle(f, seed), blink = blinkAt(f, seed);
  const key = `diz|${seed}|${blink}|${q(idl.bob, 2)}|${f % 30}`;
  card.draw(key, (p) => {
    T.romanFront(p, outfit, {
      seed, expr: 'dazed', R: 'temple', L: 'temple', blink, bob: q(idl.bob, 2),
      tilt: Math.round(Math.sin(f * 0.3) * 6), headTilt: Math.round(Math.sin(f * 0.3) * 10), wv: f * 0.18, step: 0, lift: 0,
    });
    T.fxStars(p, (f % 30) / 30);
  });
  card.place(x, y, z, camPos, s);
}
const mohanCard = new Card(), sethCard = new Card(), riderCard = new Card();
const cust1Card = new Card(), cust2Card = new Card();
const ALL_CARDS = [mohanCard, sethCard, riderCard, cust1Card, cust2Card];
const MOHAN = { tunic: '#c8551e', shirt: '#f5efe0', skin: '#e0a068', hair: '#1e1a20', toga: '#b3231b', togaPrint: true, print: { type: 'check', col: '#7a2f0e', a: 0.34, step: 13, lw: 1.5 }, hairStyle: 'side', hairLine: 0.24, tilak: '#c22f3d' };   // LOOK-V3: kurte par halka check print, gamchha par safed chaukor, side-part baal, ooncha matha + laal tilak
const SETH = { tunic: '#7a2e35', shirt: '#f2ead8', skin: '#c98a54', cap: '#e8dcc0', trim: '#f5d76a', stout: true, moustache: '#2a1a10', print: { type: 'polka', col: '#e8c87a', a: 0.5, step: 12, r: 1.9 }, glasses: true, sideHair: '#6a5a48' }; // LOOK-V3: maroon kurte par sunehre bindu, gol chashma, topi ke kinare safed-hote baal
const RIDER = { tunic: '#20409a', shirt: '#f5efe0', skin: '#a06a3c', cap: '#e23744', print: { type: 'stripe', col: '#eef2f8', a: 0.32, step: 11, lw: 2.0 } };                     // LOOK-V3: neeli shirt par safed dhari
const CUST1 = { tunic: '#7a4a9e', shirt: '#f2ead8', skin: '#c98a54', hair: '#1e1a20', print: { type: 'polka', col: '#d9b8e8', a: 0.45, step: 13, r: 1.8 } };
const CUST2 = { tunic: '#2e7a7a', shirt: '#efe6d0', skin: '#e8b98d', hair: '#241a14', hairStyle: 'thick', print: { type: 'check', col: '#0d3d3d', a: 0.32, step: 12, lw: 1.5 } }; // LOOK-V3: ghane baal + garam skin tone

// =====================================================================
// ENVS — professional colour grading (samay ke saath rang badalta hai)
// =====================================================================
const ENVS = {
  dhabaDay: { bg: 0xffd9a3, fogFar: 34, hemi: 1.0, sun: 1.25, sunC: 0xffd9a0, sunPos: [-6, 8, 5] },
  dhabaEve: { bg: 0x8a5636, fogFar: 30, hemi: 0.6, sun: 0.75, sunC: 0xff9a4d, sunPos: [-5, 6, 5] },
  streetDay: { bg: 0x8ec9e8, fogFar: 60, hemi: 1.0, sun: 1.3, sunC: 0xffe9b0, sunPos: [-7, 10, 5] },
  streetEve: { bg: 0x51486e, fogFar: 55, hemi: 0.62, sun: 0.7, sunC: 0xff9a4d, sunPos: [-8, 5, 4] },
  deskEve: { bg: 0x4a3220, fogFar: 30, hemi: 0.52, sun: 0.65, sunC: 0xffb36b, sunPos: [3, 6, 4] },
  phoneDay: { bg: 0x6b4a35, fogFar: 30, hemi: 0.72, sun: 0.9, sunC: 0xffd9a0, sunPos: [-5, 7, 5] },
  phoneEve: { bg: 0x2e2438, fogFar: 28, hemi: 0.46, sun: 0.5, sunC: 0xbfd4ff, sunPos: [4, 7, 4] },
  sunset: { bg: 0xef8f52, fogFar: 60, hemi: 0.85, sun: 1.6, sunC: 0xffb36b, sunPos: [-12, 6, -8] },
};
const ENV_DEFAULT = { dhaba: 'dhabaDay', street: 'streetDay', desk: 'deskEve', phone: 'phoneDay' };
const applyEnv = (name) => {
  const e = ENVS[name] || ENVS.dhabaDay;
  scene.background = new THREE.Color(e.bg);
  scene.fog = new THREE.Fog(e.bg, 12, e.fogFar);
  hemi.intensity = e.hemi; sun.intensity = e.sun;
  sun.color.set(e.sunC); sun.position.set(...e.sunPos);
};
// canvas redraw cache (har frame dobara draw nahi)
const K = {};
const once = (name, key, fn) => { if (K[name] === key) return; K[name] = key; fn(); };

// =====================================================================
// SET 1 — MOHAN KA DHABA (andar: garam kesariya rang, degh, counter, tables)
// =====================================================================
const dhabaG = new THREE.Group(); scene.add(dhabaG);
let rateRedraw = null, calRedraw = null, miniPhoneRedraw = null, fanBladesD = null;
const plateG = new THREE.Group(); scene.add(plateG);
const phoneProp = new THREE.Group(); scene.add(phoneProp);
const packG = new THREE.Group(); scene.add(packG);
const steamSprites = [];
let laddooMeshes = [];
{
  const S = dhabaG;
  const WALL_Z = -3.2;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), lam({ map: tex(planks(7), 5, 5), color: 0xcfa06a }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 3); S.add(floor);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(26, 8), lam({ map: tex(plaster(11, 40), 4, 1), color: 0xf0d49a }));
  back.position.set(0, 4, WALL_Z); S.add(back);
  for (const s of [-1, 1]) {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(20, 8), lam({ map: tex(plaster(13, 38), 3, 1), color: 0xe6cf9e }));
    sw.position.set(s * 6.8, 4, 2.5); sw.rotation.y = -s * Math.PI / 2; S.add(sw);
  }
  // ---- counter ----
  const counter = box(1.9, 1.02, 0.7, lam({ map: FX.woodTexture(), color: 0x8a5d33 })); counter.position.set(-1.15, 0.51, -1.7); S.add(counter);
  const cTop = box(2.05, 0.06, 0.85, lam({ color: 0xd9b078 })); cTop.position.set(-1.15, 1.05, -1.7); S.add(cTop);
  const counterSign = boardMesh(1.5, 0.34, textBoard(512, 128, (g, w, h) => {
    g.fillStyle = '#7a1f14'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffd76a'; g.font = 'bold 64px Arial'; g.textAlign = 'center';
    g.fillText('MOHAN DHABA', w / 2, 86);
  }), true); counterSign.position.set(-1.15, 0.62, -1.34); S.add(counterSign);
  // ---- degh (badi biryani handi) + kalchhi ----
  const deghPts = [[0.001, 0], [0.26, 0], [0.35, 0.08], [0.385, 0.2], [0.36, 0.31], [0.315, 0.37]].map(([x, y]) => new THREE.Vector2(x, y));
  const deghBody = new THREE.Mesh(new THREE.LatheGeometry(deghPts, 20), lam({ color: 0xa87c3e }));
  deghBody.position.set(-1.8, 1.05, -1.75); S.add(deghBody);
  const deghRim = new THREE.Mesh(new THREE.TorusGeometry(0.315, 0.02, 8, 22), lam({ color: 0xc9a86a }));
  deghRim.rotation.x = Math.PI / 2; deghRim.position.set(-1.8, 1.42, -1.75); S.add(deghRim);
  for (const hs of [-1, 1]) {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.014, 8, 14, Math.PI), lam({ color: 0x8a6844 }));
    handle.position.set(-1.8 + hs * 0.37, 1.3, -1.75); handle.rotation.z = hs * Math.PI / 2; S.add(handle);
  }
  const deghLid = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.29, 0.035, 18), lam({ color: 0xb9c0c7 }));
  deghLid.position.set(-1.32, 1.13, -2.0); deghLid.rotation.set(-0.5, 0, 1.15); S.add(deghLid);
  const lidKnob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), lam({ color: 0x5d3a22 }));
  lidKnob.position.set(-1.26, 1.2, -2.02); S.add(lidKnob);
  const blueFlame = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.018, 8, 20), bas({ color: 0x3a7bd8 }));
  blueFlame.rotation.x = Math.PI / 2; blueFlame.position.set(-1.8, 1.03, -1.75); S.add(blueFlame);
  const deghRice = new THREE.Mesh(new THREE.SphereGeometry(0.29, 16, 10), lam({ color: 0xf2a93b }));
  deghRice.scale.set(1, 0.32, 1); deghRice.position.set(-1.8, 1.40, -1.75); S.add(deghRice);
  const stove = box(0.62, 0.1, 0.62, lam({ color: 0x333333 })); stove.position.set(-1.8, 1.07, -1.75); S.add(stove);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.12, 10), bas({ color: 0xff7a2e }));
  flame.position.set(-1.8, 1.0, -1.75); S.add(flame);
  const kalchhi = new THREE.Group();
  const kh = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.5, 8), lam({ color: 0xd8d8d8 }));
  kh.rotation.z = 0.7; kalchhi.add(kh);
  const kb = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), lam({ color: 0xd8d8d8 })); kb.position.set(-0.16, -0.22, 0); kalchhi.add(kb);
  kalchhi.position.set(-1.72, 1.52, -1.7); S.add(kalchhi); S.userData.kalchhi = kalchhi;
  // bhaap (steam sprites, degh ke upar cycle)
  const puffT = FX.puffTexture([[0, 'rgba(255,250,240,0.85)'], [1, 'rgba(255,250,240,0)']]);
  for (let i = 0; i < 7; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false, opacity: 0.5 }));
    sp.position.set(-1.8, 1.6, -1.75); sp.scale.setScalar(0.3); scene.add(sp); steamSprites.push(sp);
  }
  // ---- biryani plate (hook prop, counter par) ----
  {
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.2, 0.035, 20), lam({ color: 0xdfe3e6 }));
    plateG.add(plate);
    const rice = new THREE.Mesh(new THREE.SphereGeometry(0.23, 16, 10), lam({ color: 0xf2a93b }));
    rice.scale.set(1, 0.38, 1); rice.position.y = 0.045; plateG.add(rice);
    const rice2 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8), lam({ color: 0xe8892a }));
    rice2.scale.set(1, 0.4, 1); rice2.position.set(0.05, 0.09, 0.03); plateG.add(rice2);
    for (let i = 0; i < 3; i++) {
      const mirch = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.09, 8), lam({ color: 0x2e7a35 }));
      mirch.position.set(-0.1 + i * 0.09, 0.1, -0.06 + (i % 2) * 0.08); mirch.rotation.z = 0.7; plateG.add(mirch);
    }
    const anda = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), lam({ color: 0xffffff }));
    anda.scale.y = 0.75; anda.position.set(0.13, 0.07, 0.1); plateG.add(anda);
    // LOOK-V2: chawal ke asli daane + tali pyaaz + nimbu (plate ab blob nahi lagegi)
    const grainGeo = new THREE.BoxGeometry(0.013, 0.007, 0.034);
    const grainCols = [0xffffff, 0xffe9a8, 0xf7c873, 0xf2a93b];
    let gseed = 7; const grand = () => ((gseed = (gseed * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < 30; i++) {
      const gr = new THREE.Mesh(grainGeo, lam({ color: grainCols[i % 4] }));
      const ga = grand() * Math.PI * 2, grr = grand() * 0.16;
      gr.position.set(Math.cos(ga) * grr, 0.115 + grand() * 0.03, Math.sin(ga) * grr);
      gr.rotation.y = grand() * 3; plateG.add(gr);
    }
    for (let i = 0; i < 6; i++) {
      const ob = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.008, 0.012), lam({ color: 0x8a4b22 }));
      const ga = grand() * Math.PI * 2, grr = 0.05 + grand() * 0.12;
      ob.position.set(Math.cos(ga) * grr, 0.125, Math.sin(ga) * grr); ob.rotation.y = grand() * 3; plateG.add(ob);
    }
    const nimbu = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.022, 12, 1, false, 0, Math.PI), lam({ color: 0xf7d154 }));
    nimbu.position.set(-0.16, 0.09, 0.12); nimbu.rotation.set(0.4, 0.8, 1.2); plateG.add(nimbu);
    const pyaaz = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.007, 6, 14), lam({ color: 0xd8a8c8 }));
    pyaaz.rotation.x = Math.PI / 2; pyaaz.position.set(0.17, 0.085, -0.08); plateG.add(pyaaz);
    plateG.position.set(-0.5, 1.07, -1.25); plateG.scale.setScalar(1.25); plateG.visible = false;
  }
  // ---- RATE BOARD (latka hua, dynamic: hook/board beats) ----
  const RB = dynCanvas(1024, 512);
  const rbFrame = box(1.36, 1.1, 0.07, lam({ color: 0x4c2410 })); rbFrame.position.set(-0.2, 2.45, -2.72); S.add(rbFrame);
  const rb = new THREE.Mesh(new THREE.PlaneGeometry(1.26, 1.0), bas({ map: RB.t }));
  rb.position.set(-0.2, 2.45, -2.67); S.add(rb);
  for (const cx of [-0.95, 0.55]) {
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 6), lam({ color: 0x5a4632 }));
    wire.position.set(cx, 3.25, -2.72); S.add(wire);
  }
  rateRedraw = (mode) => {
    const g = RB.g, w = 1024, h = 512;
    g.fillStyle = '#1d1208'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#f5d76a'; g.lineWidth = 12; g.strokeRect(16, 16, w - 32, h - 32);
    g.textAlign = 'center';
    if (mode === 'hook500') {
      g.fillStyle = '#ffffff'; g.font = 'bold 84px Arial';
      g.fillText('EK PLATE BIRYANI', w / 2, 150);
      g.fillStyle = '#f5d76a'; g.font = 'bold 180px Arial';
      g.fillText('₹500', w / 2, 370);
      g.fillStyle = '#9fc4e0'; g.font = 'bold 44px Arial';
      g.fillText('— POORA ORDER —', w / 2, 462);
    } else {
      g.fillStyle = '#ffffff'; g.font = 'bold 80px Arial';
      g.fillText('BAACHE SIRF', w / 2, 145);
      g.fillStyle = '#ff5347'; g.font = 'bold 180px Arial';
      g.fillText('₹185?', w / 2, 375);
      g.fillStyle = '#9fc4e0'; g.font = 'bold 44px Arial';
      g.fillText('₹500 ME SE — KAISE?', w / 2, 462);
    }
    RB.t.needsUpdate = true;
  };
  rateRedraw('hook500');
  // ---- menu board (wall) ----
  const menu = boardMesh(1.5, 1.05, textBoard(640, 448, (g, w, h) => {
    g.fillStyle = '#274035'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#d9b078'; g.lineWidth = 8; g.strokeRect(12, 12, w - 24, h - 24);
    g.fillStyle = '#ffd76a'; g.font = 'bold 62px Arial'; g.textAlign = 'center';
    g.fillText('— MENU —', w / 2, 82);
    g.fillStyle = '#ffffff'; g.font = 'bold 46px Arial'; g.textAlign = 'left';
    g.fillText('BIRYANI', 48, 178); g.textAlign = 'right'; g.fillText('₹500', w - 48, 178);
    g.textAlign = 'left'; g.fillText('DAL CHAWAL', 48, 262); g.textAlign = 'right'; g.fillText('₹150', w - 48, 262);
    g.textAlign = 'left'; g.fillText('LADDOO', 48, 346); g.textAlign = 'right'; g.fillText('₹30', w - 48, 346);
    g.textAlign = 'left'; g.fillText('CHAI', 48, 424); g.textAlign = 'right'; g.fillText('₹20', w - 48, 424);
  }), true); menu.position.set(1.75, 2.3, WALL_Z + 0.06); S.add(menu);
  // ---- calendar (wall, dynamic din) ----
  const CD3 = dynCanvas(384, 512);
  const calFrame = box(0.62, 0.78, 0.05, lam({ color: 0x7a1f14 })); calFrame.position.set(-2.65, 2.2, WALL_Z + 0.03); S.add(calFrame);
  const cal = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.7), bas({ map: CD3.t }));
  cal.position.set(-2.65, 2.2, WALL_Z + 0.07); S.add(cal);
  calRedraw = (day) => {
    const g = CD3.g, w = 384, h = 512;
    g.fillStyle = '#f8f4e8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b3231b'; g.fillRect(0, 0, w, 92);
    g.fillStyle = '#ffffff'; g.font = 'bold 46px Arial'; g.textAlign = 'center';
    g.fillText('PEHLA HAFTA', w / 2, 62);
    g.fillStyle = '#22252c'; g.font = 'bold 60px Arial';
    g.fillText('DIN', w / 2, 190);
    g.fillStyle = '#b3231b'; g.font = 'bold 190px Arial';
    g.fillText(String(day), w / 2, 385);
    g.fillStyle = '#9a917c';
    for (let r = 0; r < 2; r++) for (let c = 0; c < 7; c++) g.fillRect(38 + c * 46, 425 + r * 34, 30, 18);
    CD3.t.needsUpdate = true;
  };
  calRedraw(1);
  // ---- pankha ----
  const fanG = new THREE.Group(); fanG.position.set(0.2, 3.62, -0.9); S.add(fanG);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.4, 8), lam({ color: 0x39434c }));
  rod.position.y = 0.2; fanG.add(rod);
  fanBladesD = new THREE.Group(); fanG.add(fanBladesD);
  for (let i = 0; i < 3; i++) {
    const bl = box(1.05, 0.025, 0.24, lam({ color: 0x8a5d3b }));
    const a = i / 3 * Math.PI * 2;
    bl.position.set(Math.cos(a) * 0.62, 0, Math.sin(a) * 0.62); bl.rotation.y = -a; fanBladesD.add(bl);
  }
  const fanHub = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), lam({ color: 0x5d3a22 })); fanG.add(fanHub);
  // ---- shelf + barniyaan (peeche ki deewaar, rich bg) ----
  const shelf = box(2.2, 0.05, 0.3, lam({ color: 0x7d5230 })); shelf.position.set(-1.3, 2.02, WALL_Z + 0.18); S.add(shelf);
  const jarCols = [0xd97b29, 0x57a773, 0xc23b2e, 0xf5d76a, 0x4da3ff, 0xe8e0cc];
  for (let i = 0; i < 6; i++) {
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.24, 10), lam({ color: jarCols[i] }));
    jar.position.set(-2.2 + i * 0.36, 2.17, WALL_Z + 0.18); S.add(jar);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 10), lam({ color: 0x5d3a22 }));
    lid.position.set(-2.2 + i * 0.36, 2.31, WALL_Z + 0.18); S.add(lid);
  }
  // ---- tables + chai + laddoo plate ----
  const mkTable = (x, z) => {
    const tg = new THREE.Group(); tg.position.set(x, 0, z); S.add(tg);
    const top = box(0.95, 0.05, 0.95, lam({ map: FX.woodTexture(), color: 0x9a6a3d })); top.position.y = 0.74; tg.add(top);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const leg = box(0.06, 0.74, 0.06, lam({ color: 0x54371f }));
      leg.position.set(sx * 0.4, 0.37, sz * 0.4); tg.add(leg);
    }
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.08, 10), lam({ color: 0xf2ede2 }));
    cup.position.set(0.25, 0.81, 0.2); tg.add(cup);
    return tg;
  };
  mkTable(1.35, -0.9); mkTable(1.55, -2.25);
  { // laddoo plate table-1 par
    const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.03, 16), lam({ color: 0xf5f2e8 }));
    pl.position.set(1.02, 0.78, -0.58); S.add(pl);
    for (let i = 0; i < 5; i++) {
      const ld = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), lam({ color: 0xe8862e }));
      const a = i / 5 * Math.PI * 2;
      ld.position.set(1.02 + Math.cos(a) * 0.11, 0.855, -0.58 + Math.sin(a) * 0.11);
      S.add(ld); laddooMeshes.push(ld);
    }
    const tblCoin = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.014, 12), lam({ color: 0xd9a83c }));
    tblCoin.position.set(1.02, 0.775, -0.68); S.add(tblCoin);
    const c0 = new THREE.Mesh(new THREE.SphereGeometry(0.078, 10, 8), lam({ color: 0xe8862e }));
    c0.position.set(1.02, 0.87, -0.58); S.add(c0); laddooMeshes.push(c0);
  }
  // ---- darwaza (right wall par band) ----
  const doorF = box(1.06, 2.2, 0.08, lam({ color: 0x5d3f24 })); doorF.position.set(2.95, 1.1, WALL_Z + 0.02); S.add(doorF);
  const door = box(0.92, 2.05, 0.06, lam({ color: 0x7d5230 })); door.position.set(2.95, 1.08, WALL_Z + 0.07); S.add(door);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), lam({ color: 0xd9b84c })); knob.position.set(2.62, 1.05, WALL_Z + 0.12); S.add(knob);
  // ---- latke bulb (garam roshni) ----
  for (const bx of [-1.6, 0.4, 1.9]) {
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 6), lam({ color: 0x333333 }));
    cord.position.set(bx, 3.85, -1.4); S.add(cord);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), bas({ color: 0xffdf9e }));
    bulb.position.set(bx, 3.45, -1.4); S.add(bulb);
    const gl = FX.glint(0.85); gl.position.set(bx, 3.45, -1.35); S.add(gl);
  }
  // ---- chhota phone prop (counter par) ----
  const PD2 = dynCanvas(256, 460);
  const pBody = box(0.34, 0.62, 0.03, lam({ color: 0x14181d })); phoneProp.add(pBody);
  const pScr = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.56), bas({ map: PD2.t })); pScr.position.z = 0.02; phoneProp.add(pScr);
  miniPhoneRedraw = (mode) => {
    const g = PD2.g, w = 256, h = 460;
    if (mode === 'order') {
      g.fillStyle = '#fff7ee'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#e23744'; g.fillRect(0, 0, w, 74);
      g.fillStyle = '#ffffff'; g.font = 'bold 30px Arial'; g.textAlign = 'center';
      g.fillText('NAYA ORDER!', w / 2, 50);
      g.fillStyle = '#22252c'; g.font = 'bold 34px Arial';
      g.fillText('BIRYANI × 1', w / 2, 170);
      g.fillStyle = '#b3231b'; g.font = 'bold 64px Arial';
      g.fillText('₹500', w / 2, 265);
      g.fillStyle = '#1d7a3a'; rr(g, 28, 330, w - 56, 74, 14); g.fill();
      g.fillStyle = '#ffffff'; g.font = 'bold 32px Arial';
      g.fillText('ACCEPT', w / 2, 378);
    } else {
      g.fillStyle = '#10141c'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#3a4a5e'; g.font = 'bold 26px Arial'; g.textAlign = 'center';
      g.fillText('...', w / 2, 240);
    }
    PD2.t.needsUpdate = true;
  };
  miniPhoneRedraw('blank');
  phoneProp.position.set(-0.68, 1.38, -1.28); phoneProp.visible = false;
  // ---- pack dabba prop (counter par) ----
  {
    const db = box(0.36, 0.3, 0.36, lam({ color: 0xc9a06a })); packG.add(db);
    const tape = box(0.37, 0.06, 0.1, lam({ color: 0xe8e0cc })); tape.position.y = 0.13; packG.add(tape);
    const lbl = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.14), bas({ color: 0xfff7ee }));
    lbl.position.set(0, 0, 0.185); packG.add(lbl);
    packG.position.set(-0.45, 1.23, -1.5); packG.visible = false;
  }
}
const setLaddoo = (n) => laddooMeshes.forEach((m, i) => { m.visible = i < n; });

// =====================================================================
// SET 2 — GALI / DHABE KE BAAHAR (subah ki gali, do dhabe, sadak, pump)
// =====================================================================
const streetG = new THREE.Group(); scene.add(streetG);
const bikeG = new THREE.Group(); scene.add(bikeG);
const bike2G = new THREE.Group(); scene.add(bike2G);
const noteG = new THREE.Group(); scene.add(noteG);
{
  const S = streetG;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(34, 30), lam({ map: tex(dirt(17), 7, 7), color: 0xe8dcbe }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, 3); S.add(ground);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(34, 4.6), lam({ color: 0x3c4148 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0.0, 1.6); S.add(road);
  for (let i = 0; i < 9; i++) {
    const dash = box(1.1, 0.012, 0.14, bas({ color: 0xf2f2f2 }));
    dash.position.set(-12 + i * 3, 0.008, 1.6); S.add(dash);
  }
  const foot = new THREE.Mesh(new THREE.PlaneGeometry(34, 2.2), lam({ map: tex(planks(8), 8, 1), color: 0xcbb28a }));
  foot.rotation.x = -Math.PI / 2; foot.position.set(0, 0.01, -1.6); S.add(foot);
  // ---- dhaba front banane wala helper ----
  const mkDhaba = (cx, signBg, signFg, sign, sub, wallC) => {
    const g = new THREE.Group(); S.add(g);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 3.4), lam({ map: tex(plaster(31, 42), 2, 1), color: wallC }));
    wall.position.set(cx, 1.7, -4.3); g.add(wall);
    for (const px of [cx - 1.95, cx + 1.95]) {
      const pil = box(0.28, 3.0, 0.28, lam({ color: 0xa8895e })); pil.position.set(px, 1.5, -3.3); g.add(pil);
    }
    const roof = box(4.5, 0.16, 1.9, lam({ color: 0x8a4a2a })); roof.position.set(cx, 3.06, -3.6); g.add(roof);
    const signM = boardMesh(3.3, 0.78, textBoard(1024, 244, (gg, w, h) => {
      gg.fillStyle = signBg; gg.fillRect(0, 0, w, h);
      gg.strokeStyle = signFg; gg.lineWidth = 8; gg.strokeRect(10, 10, w - 20, h - 20);
      gg.fillStyle = signFg; gg.font = 'bold 104px Arial'; gg.textAlign = 'center';
      gg.fillText(sign, w / 2, 118);
      gg.font = 'bold 44px Arial'; gg.fillText(sub, w / 2, 198);
    }), true); signM.position.set(cx, 3.5, -3.42); g.add(signM);
    const cnt = box(2.7, 1.05, 0.55, lam({ map: FX.woodTexture(), color: 0x8a5d33 })); cnt.position.set(cx, 0.53, -3.05); g.add(cnt);
    const inGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.6), bas({ color: 0xcf8a42 }));
    inGlow.position.set(cx, 1.62, -4.24); g.add(inGlow);
    const inShelf = box(2.6, 0.07, 0.24, lam({ color: 0x6d4a2c })); inShelf.position.set(cx, 2.2, -4.14); g.add(inShelf);
    for (let ji = 0; ji < 3; ji++) { const jar2 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.27, 10), lam({ color: [0xd97b29, 0x57a773, 0xc23b2e][ji] })); jar2.position.set(cx - 0.8 + ji * 0.8, 2.37, -4.14); g.add(jar2); }
    const inDegh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.36, 14), lam({ color: 0x8a6844 })); inDegh.position.set(cx - 1.05, 0.95, -4.05); g.add(inDegh);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), bas({ color: 0xffdf9e }));
    bulb.position.set(cx, 2.6, -3.5); g.add(bulb);
    return g;
  };
  mkDhaba(-2.3, '#a32318', '#ffd76a', 'MOHAN DHABA', 'BIRYANI SPECIAL', 0xe8cda0);
  mkDhaba(2.3, '#1d5c3a', '#ffffff', 'SETH DHABA', 'SAB KUCH MILTA HAI', 0xd8e0cc);
  // ---- ped (beech me) ----
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 1.7, 8), lam({ color: 0x6d4a2c }));
  trunk.position.set(0, 0.85, -3.95); S.add(trunk);
  for (const [ox, oy, oz, r] of [[0, 2.2, -3.95, 0.85], [-0.6, 1.9, -3.9, 0.6], [0.6, 1.95, -4.0, 0.65]]) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), lam({ color: 0x3f8a3a }));
    leaf.position.set(ox, oy, oz); S.add(leaf);
  }
  // ---- peeche ki buildings (halke rang, fog ke saath) ----
  for (const [bx, bw, bh, bc] of [[-7.5, 3.4, 5.5, 0x9fb6c9], [-0.5, 4.2, 7, 0xb6c4cf], [6.5, 3.6, 6, 0xc9b6a0], [11, 3, 4.5, 0xa8bcc9]]) {
    const bld = box(bw, bh, 2.4, lam({ color: bc })); bld.position.set(bx, bh / 2, -10.5); S.add(bld);
  }
  // ---- petrol pump (right) ----
  const pump = new THREE.Group(); pump.position.set(4.9, 0, -0.7); S.add(pump);
  const pBody = box(0.55, 1.35, 0.45, lam({ color: 0xf2f2f2 })); pBody.position.y = 0.68; pump.add(pBody);
  const pStripe = box(0.57, 0.22, 0.47, lam({ color: 0xc23b2e })); pStripe.position.y = 1.12; pump.add(pStripe);
  const pScr = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.3), bas({ color: 0x1d2c3f })); pScr.position.set(0, 0.78, 0.24); pump.add(pScr);
  const pSign = boardMesh(1.0, 0.32, textBoard(512, 160, (g, w, h) => {
    g.fillStyle = '#c23b2e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.font = 'bold 84px Arial'; g.textAlign = 'center';
    g.fillText('PETROL', w / 2, 108);
  }), true); pSign.position.set(0, 1.75, 0); pump.add(pSign);
  const pPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8), lam({ color: 0x39434c })); pPole.position.y = 1.5; pump.add(pPole);
  const nozzle = box(0.09, 0.22, 0.09, lam({ color: 0x22262b })); nozzle.position.set(-0.38, 0.85, 0.1); pump.add(nozzle);
  // ---- ghar ka band darwaza (left, taala ke saath) ----
  const hw = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.8), lam({ map: tex(plaster(33, 36), 1, 1), color: 0xd8c8a8 }));
  hw.position.set(-4.9, 1.4, -2.3); S.add(hw);
  const hDoor = box(1.05, 2.15, 0.07, lam({ color: 0x6d4a2c })); hDoor.position.set(-4.9, 1.08, -2.24); S.add(hDoor);
  const lockB = box(0.16, 0.2, 0.06, lam({ color: 0xd9b84c })); lockB.position.set(-4.52, 1.02, -2.18); S.add(lockB);
  const lockA = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 8, 14), lam({ color: 0xb89a3a })); lockA.position.set(-4.52, 1.16, -2.18); S.add(lockA);
  // ---- street lamp ----
  const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 3.4, 8), lam({ color: 0x39434c }));
  lampPole.position.set(-5.6, 1.7, 0.2); S.add(lampPole);
  const lampHead = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), bas({ color: 0xfff2c8 }));
  lampHead.position.set(-5.6, 3.45, 0.2); S.add(lampHead);
  // ---- RIDER ki bike (+ delivery bag) ----
  {
    const wheelM = lam({ color: 0x1c1c22 });
    for (const wx of [-0.58, 0.58]) {
      const wh = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.055, 10, 20), wheelM);
      wh.position.set(wx, 0.34, 0); bikeG.add(wh);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.09, 10), lam({ color: 0x9aa2ac }));
      hub.rotation.x = Math.PI / 2; hub.position.set(wx, 0.34, 0); bikeG.add(hub);
    }
    const body = box(0.95, 0.24, 0.2, lam({ color: 0x2456a8 })); body.position.set(0, 0.62, 0); body.rotation.z = 0.06; bikeG.add(body);
    const seat = box(0.5, 0.09, 0.2, lam({ color: 0x22262b })); seat.position.set(-0.28, 0.78, 0); bikeG.add(seat);
    const tank = box(0.34, 0.18, 0.19, lam({ color: 0x2e6ad0 })); tank.position.set(0.22, 0.74, 0); bikeG.add(tank);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.44, 8), lam({ color: 0x39434c }));
    handle.rotation.x = Math.PI / 2; handle.position.set(0.52, 0.95, 0); bikeG.add(handle);
    const fork = box(0.06, 0.6, 0.06, lam({ color: 0x9aa2ac })); fork.position.set(0.55, 0.6, 0); fork.rotation.z = -0.25; bikeG.add(fork);
    const bag = box(0.5, 0.5, 0.42, lam({ color: 0xd23c2a })); bag.position.set(-0.72, 1.0, 0); bikeG.add(bag);
    const bagStripe = box(0.52, 0.1, 0.44, bas({ color: 0xffffff })); bagStripe.position.set(-0.72, 1.06, 0); bikeG.add(bagStripe);
    bikeG.visible = false;
  }
  // ---- peeche guzarti scooter (zinda background) ----
  {
    const wheelM = lam({ color: 0x1c1c22 });
    for (const wx of [-0.42, 0.42]) {
      const wh = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.045, 8, 16), wheelM);
      wh.position.set(wx, 0.25, 0); bike2G.add(wh);
    }
    const bd = box(0.75, 0.3, 0.18, lam({ color: 0x2e7a7a })); bd.position.set(0, 0.5, 0); bike2G.add(bd);
    const sh = box(0.3, 0.35, 0.17, lam({ color: 0x2e7a7a })); sh.position.set(0.42, 0.62, 0); bike2G.add(sh);
    bike2G.visible = false;
  }
  // ---- ₹50 note prop ----
  {
    const nt = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.09), bas({
      map: textBoard(256, 128, (g, w, h) => {
        g.fillStyle = '#b8a8d8'; g.fillRect(0, 0, w, h);
        g.strokeStyle = '#6a5a9a'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12);
        g.fillStyle = '#3a2c5e'; g.font = 'bold 62px Arial'; g.textAlign = 'center';
        g.fillText('₹50', w / 2, 84);
      }), side: THREE.DoubleSide,
    }));
    noteG.add(nt); noteG.visible = false;
  }
}

// =====================================================================
// SET 3 — HISAAB DESK (shaam, lamp ki garam roshni, bada kagaz)
// =====================================================================
const deskG = new THREE.Group(); scene.add(deskG);
let kagazRedraw = null, receiptRedraw = null, miniBoardRedraw = null;
const stampG = new THREE.Group(); scene.add(stampG);
const cutPiece = new THREE.Group(); scene.add(cutPiece);
const coinG = new THREE.Group(); scene.add(coinG);
const receiptPlaneHolder = { mesh: null };
let dabbaTop = null;
{
  const S = deskG;
  const WALL_Z = -3.2;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), lam({ map: tex(planks(9), 5, 5), color: 0x8a6844 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 3); S.add(floor);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(24, 8), lam({ map: tex(plaster(23, 32), 4, 1), color: 0x9a7a52 }));
  back.position.set(0, 4, WALL_Z); S.add(back);
  for (const s of [-1, 1]) {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(18, 8), lam({ map: tex(plaster(27, 30), 3, 1), color: 0x8a6c46 }));
    sw.position.set(s * 6.2, 4, 2.5); sw.rotation.y = -s * Math.PI / 2; S.add(sw);
  }
  // ---- table ----
  const tTop = box(2.4, 0.08, 1.9, lam({ map: FX.woodTexture(), color: 0x6d4a2c })); tTop.position.set(0, 0.74, -0.3); S.add(tTop);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = box(0.08, 0.74, 0.08, lam({ color: 0x4c3016 }));
    leg.position.set(sx * 1.05, 0.37, -0.3 + sz * 0.8); S.add(leg);
  }
  // ---- HISAAB kagaz (dynamic, step-wise) ----
  const KG = dynCanvas(640, 832);
  const kagaz = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.35), lam({ map: KG.t }));
  kagaz.rotation.x = -Math.PI / 2; kagaz.rotation.z = 0.02; kagaz.position.set(0, 0.79, -0.3); S.add(kagaz);
  kagazRedraw = (step) => {
    const g = KG.g, w = 640, h = 832;
    g.fillStyle = '#f8f4e8'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#9a917c'; g.lineWidth = 5; g.strokeRect(14, 14, w - 28, h - 28);
    g.fillStyle = '#b8d2ea';
    for (let r = 0; r < 15; r++) g.fillRect(34, 150 + r * 44, w - 68, 2);
    g.textAlign = 'center';
    g.fillStyle = '#7a1f14'; g.font = 'bold 44px Arial';
    g.fillText('MOHAN DHABA — HISAAB', w / 2, 66);
    g.fillStyle = '#22252c'; g.font = 'bold 40px Arial'; g.textAlign = 'left';
    g.fillText('ORDER: BIRYANI', 40, 138);
    g.textAlign = 'right'; g.fillText('₹500', w - 40, 138);
    g.font = 'bold 37px Arial';
    const line = (y, label, amt) => {
      g.fillStyle = '#22252c'; g.textAlign = 'left'; g.fillText(label, 40, y);
      g.fillStyle = '#b3231b'; g.textAlign = 'right'; g.fillText('− ' + amt, w - 40, y);
    };
    if (step >= 1) line(206, 'COMMISSION', '₹110');
    if (step >= 2) {
      line(274, 'TAX (us par bhi!)', '₹20');
      // gol stamp ki chhap
      g.save(); g.translate(480, 300); g.rotate(-0.28);
      g.strokeStyle = 'rgba(179,35,27,0.85)'; g.lineWidth = 6;
      g.beginPath(); g.arc(0, 0, 62, 0, 7); g.stroke();
      g.fillStyle = 'rgba(179,35,27,0.85)'; g.font = 'bold 40px Arial'; g.textAlign = 'center';
      g.fillText('TAX', 0, 14); g.restore();
    }
    if (step >= 3) line(342, 'DABBA / PACKING', '₹25');
    if (step >= 4) line(410, 'PAYMENT CHARGE', '₹10');
    if (step >= 5) {
      g.fillStyle = '#1d7a3a'; g.font = 'bold 54px Arial'; g.textAlign = 'left';
      g.fillText('MILE:', 40, 500);
      g.textAlign = 'right'; g.fillText('₹335', w - 40, 500);
      g.strokeStyle = '#1d7a3a'; g.lineWidth = 4; g.beginPath(); g.moveTo(36, 522); g.lineTo(w - 36, 522); g.stroke();
    }
    if (step >= 6) { g.font = 'bold 37px Arial'; line(578, 'KHANA BANANE', '₹150'); }
    if (step >= 7) {
      g.fillStyle = '#7a5a10'; rr(g, 30, 616, w - 60, 96, 12); g.fill();
      g.fillStyle = '#ffd76a'; g.font = 'bold 56px Arial'; g.textAlign = 'center';
      g.fillText('BAACHE: ₹185', w / 2, 682);
    }
    if (step >= 8) {
      // kharche ke 4 icons: KIRAYA (ghar) + BIJLI (bulb)
      g.fillStyle = '#22252c'; g.font = 'bold 27px Arial'; g.textAlign = 'center';
      const icon = (cx, kind, label) => {
        g.strokeStyle = '#37414e'; g.lineWidth = 5; g.fillStyle = '#37414e';
        if (kind === 'ghar') { g.beginPath(); g.moveTo(cx - 26, 762); g.lineTo(cx, 736); g.lineTo(cx + 26, 762); g.stroke(); g.strokeRect(cx - 19, 762, 38, 30); }
        if (kind === 'bulb') { g.beginPath(); g.arc(cx, 758, 17, 0, 7); g.stroke(); g.beginPath(); g.moveTo(cx - 7, 784); g.lineTo(cx + 7, 784); g.stroke(); }
        if (kind === 'aadmi') { g.beginPath(); g.arc(cx, 748, 11, 0, 7); g.fill(); g.fillRect(cx - 4, 760, 8, 30); }
        if (kind === 'gas') { g.strokeRect(cx - 14, 740, 28, 50); g.beginPath(); g.ellipse(cx, 740, 14, 6, 0, 0, 7); g.stroke(); }
        g.fillText(label, cx, 822 - 6);
      };
      icon(110, 'ghar', 'KIRAYA'); icon(250, 'bulb', 'BIJLI');
      if (step >= 9) { icon(400, 'aadmi', 'STAFF'); icon(540, 'gas', 'GAS'); }
    }
    KG.t.needsUpdate = true;
  };
  kagazRedraw(0);
  const pen = box(0.17, 0.016, 0.016, lam({ color: 0x2e5da8 })); pen.position.set(0.38, 0.8, 0.18); pen.rotation.y = 0.7; S.add(pen);
  // kata hua kagaz tukda (z20 me girta hai)
  {
    const cp = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.28), lam({
      map: textBoard(512, 288, (g, w, h) => {
        g.fillStyle = '#f8f4e8'; g.fillRect(0, 0, w, h);
        g.fillStyle = '#b3231b'; g.font = 'bold 74px Arial'; g.textAlign = 'center';
        g.fillText('− ₹110', w / 2, 128);
        g.fillStyle = '#22252c'; g.font = 'bold 44px Arial';
        g.fillText('COMMISSION', w / 2, 208);
      }), side: THREE.DoubleSide,
    }));
    cutPiece.add(cp); cutPiece.visible = false;
  }
  // ---- STAMP prop ----
  {
    const base = box(0.24, 0.05, 0.18, lam({ color: 0x8a2f1b })); stampG.add(base);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.14, 10), lam({ color: 0x5d3a22 }));
    neck.position.y = 0.09; stampG.add(neck);
    const knob2 = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), lam({ color: 0x7d2a18 }));
    knob2.position.y = 0.19; stampG.add(knob2);
    stampG.position.set(0.62, 0.81, 0.25); stampG.visible = false;
  }
  // ---- dabba stack ----
  const dabbaM = lam({ color: 0xc9a06a });
  const mkDabba = (y) => {
    const d = box(0.4, 0.34, 0.4, dabbaM); d.position.set(-0.95, y, -0.55); S.add(d);
    const tp = box(0.42, 0.04, 0.42, lam({ color: 0xb8935a })); tp.position.set(-0.95, y + 0.19, -0.55); S.add(tp);
    return d;
  };
  mkDabba(0.95); mkDabba(1.31); dabbaTop = mkDabba(1.67);
  const dabLbl = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.15), bas({
    map: textBoard(256, 144, (g, w, h) => {
      g.fillStyle = '#fff7ee'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#7a4a10'; g.font = 'bold 56px Arial'; g.textAlign = 'center';
      g.fillText('DABBA', w / 2, 92);
    }),
  }));
  dabLbl.position.set(-0.95, 0.95, -0.34); S.add(dabLbl);
  // ---- receipt (latakti hui) ----
  const RC = dynCanvas(320, 480);
  const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.3, 12), lam({ color: 0xe8e4da }));
  roll.rotation.z = Math.PI / 2; roll.position.set(0.95, 0.86, 0.58); S.add(roll);
  const rPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.46), lam({ map: RC.t, side: THREE.DoubleSide }));
  rPlane.rotation.x = -0.15;
  rPlane.position.set(0.95, 0.55, 0.68); S.add(rPlane); receiptPlaneHolder.mesh = rPlane;
  receiptRedraw = () => {
    const g = RC.g, w = 320, h = 480;
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#22252c'; g.font = 'bold 30px Arial'; g.textAlign = 'center';
    g.fillText('PAYMENT', w / 2, 60);
    g.fillText('RECEIPT', w / 2, 100);
    g.fillStyle = '#9a917c'; g.fillRect(30, 130, w - 60, 3); g.fillRect(30, 300, w - 60, 3);
    g.fillStyle = '#22252c'; g.font = '27px Arial';
    g.fillText('ONLINE PAYMENT', w / 2, 190);
    g.fillText('CHARGE', w / 2, 232);
    g.fillStyle = '#b3231b'; g.font = 'bold 72px Arial';
    g.fillText('− ₹10', w / 2, 380);
    RC.t.needsUpdate = true;
  };
  receiptRedraw();
  // ---- sikke (coin piles) ----
  const coinM = lam({ color: 0xd9b84c });
  const coinGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.014, 14);
  window.__coins = [];
  for (let p = 0; p < 3; p++) {
    for (let i = 0; i < 4 + p; i++) {
      const cn = new THREE.Mesh(coinGeo, coinM);
      cn.position.set(-0.22 + p * 0.24, 0.79 + i * 0.015, 0.48);
      coinG.add(cn); window.__coins.push(cn);
    }
  }
  for (let i = 0; i < 6; i++) {
    const cn = new THREE.Mesh(coinGeo, coinM);
    cn.position.set(-0.35 + i * 0.13, 0.79, 0.68); coinG.add(cn); window.__coins.push(cn);
  }
  coinG.visible = false;
  // ---- desk par khada mini board (₹335 / ₹185) ----
  const MB = dynCanvas(512, 320);
  const mbStand = box(0.06, 0.3, 0.06, lam({ color: 0x4c3016 })); mbStand.position.set(0.38, 0.93, 0.45); S.add(mbStand);
  const mb = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.35), bas({ map: MB.t }));
  mb.position.set(-0.98, 1.08, 0.72); mb.rotation.x = -0.18; mb.rotation.y = 0.5; S.add(mb);
  miniBoardRedraw = (mode) => {
    const g = MB.g, w = 512, h = 320;
    g.fillStyle = '#1d1208'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#f5d76a'; g.lineWidth = 9; g.strokeRect(12, 12, w - 24, h - 24);
    g.textAlign = 'center';
    if (mode === 'mile335') {
      g.fillStyle = '#9fc4e0'; g.font = 'bold 52px Arial'; g.fillText('MILE SIRF', w / 2, 105);
      g.fillStyle = '#57d977'; g.font = 'bold 130px Arial'; g.fillText('₹335', w / 2, 245);
    } else {
      g.fillStyle = '#9fc4e0'; g.font = 'bold 52px Arial'; g.fillText('BAACHE', w / 2, 105);
      g.fillStyle = '#f5d76a'; g.font = 'bold 130px Arial'; g.fillText('₹185', w / 2, 245);
    }
    MB.t.needsUpdate = true;
  };
  miniBoardRedraw('mile335');
  // ---- desk lamp ----
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.04, 12), lam({ color: 0x39434c }));
  lampBase.position.set(1.35, 0.8, -1.15); S.add(lampBase);
  const lampArm = box(0.045, 0.62, 0.045, lam({ color: 0x39434c })); lampArm.position.set(1.28, 1.1, -1.15); lampArm.rotation.z = 0.35; S.add(lampArm);
  const lampHead = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.2, 12), lam({ color: 0xd9b84c }));
  lampHead.position.set(1.08, 1.42, -1.15); lampHead.rotation.z = 0.9; S.add(lampHead);
  const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), bas({ color: 0xffe9a8 }));
  lampBulb.position.set(1.02, 1.36, -1.15); S.add(lampBulb);
  // ---- peeche shelf par dabbe ----
  const shelf2 = box(2.0, 0.05, 0.3, lam({ color: 0x5d3f24 })); shelf2.position.set(-0.9, 2.1, WALL_Z + 0.18); S.add(shelf2);
  for (let i = 0; i < 4; i++) {
    const bx2 = box(0.34, 0.3, 0.26, lam({ color: [0xc9a06a, 0xa8895e, 0x8a9a5b, 0xb08968][i] }));
    bx2.position.set(-1.7 + i * 0.5, 2.28, WALL_Z + 0.18); S.add(bx2);
  }
  // ---- ghadi ----
  const clockTex2 = textBoard(256, 256, (g, w, h) => {
    g.fillStyle = '#f3e9d2'; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.fill();
    g.strokeStyle = '#4c3016'; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 114, 0, 7); g.stroke();
    g.strokeStyle = '#3a2c1c'; g.lineWidth = 10; g.beginPath(); g.moveTo(128, 128); g.lineTo(90, 170); g.stroke();
    g.lineWidth = 7; g.beginPath(); g.moveTo(128, 128); g.lineTo(170, 90); g.stroke();
    g.fillStyle = '#8a2f1b'; g.beginPath(); g.arc(128, 128, 9, 0, 7); g.fill();
  });
  const clock2 = new THREE.Mesh(new THREE.CircleGeometry(0.3, 24), lam({ map: clockTex2 }));
  clock2.position.set(2.3, 2.6, WALL_Z + 0.06); S.add(clock2);
}

// =====================================================================
// SET 4 — PHONE MACRO (bada phone, order/bill screens)
// =====================================================================
const phoneG = new THREE.Group(); scene.add(phoneG);
let phoneRedraw = null;
{
  const S = phoneG;
  const WALL_Z = -3.2;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), lam({ color: 0x4c3826 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 3); S.add(floor);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(24, 9), lam({ map: tex(plaster(37, 28), 4, 1), color: 0x7a5c40 }));
  back.position.set(0, 4.5, WALL_Z); S.add(back);
  for (const s of [-1, 1]) {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(18, 9), lam({ map: tex(plaster(39, 26), 3, 1), color: 0x6d5136 }));
    sw.position.set(s * 6.2, 4.5, 2.5); sw.rotation.y = -s * Math.PI / 2; S.add(sw);
  }
  const table = box(3.2, 0.09, 1.5, lam({ map: FX.woodTexture(), color: 0x6d4a2c })); table.position.set(0, 0.72, -0.8); S.add(table);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = box(0.09, 0.72, 0.09, lam({ color: 0x4c3016 }));
    leg.position.set(sx * 1.4, 0.36, -0.8 + sz * 0.6); S.add(leg);
  }
  // ---- bada phone ----
  const pBody = box(1.66, 3.0, 0.09, lam({ color: 0x14181d })); pBody.position.set(0, 1.78, -1.35); S.add(pBody);
  const stand = box(0.5, 0.5, 0.3, lam({ color: 0x2c3844 })); stand.position.set(0, 0.5, -1.45); S.add(stand);
  const PH = dynCanvas(512, 940);
  const pScr = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.8), bas({ map: PH.t }));
  pScr.position.set(0, 1.78, -1.29); S.add(pScr);
  const drawPlate = (g, cx, cy, r) => {
    g.fillStyle = '#e8e4da'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
    g.fillStyle = '#f2a93b'; g.beginPath(); g.arc(cx, cy, r * 0.78, 0, 7); g.fill();
    g.fillStyle = '#e8892a'; g.beginPath(); g.arc(cx + r * 0.2, cy - r * 0.15, r * 0.4, 0, 7); g.fill();
    g.fillStyle = '#2e7a35'; g.fillRect(cx - r * 0.5, cy - r * 0.1, r * 0.16, r * 0.07); g.fillRect(cx + r * 0.3, cy + r * 0.25, r * 0.16, r * 0.07);
  };
  phoneRedraw = (mode) => {
    const g = PH.g, w = 512, h = 940;
    g.textAlign = 'center';
    if (mode === 'order' || mode === 'order2') {
      g.fillStyle = '#fff7ee'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#e23744'; g.fillRect(0, 0, w, 130);
      g.fillStyle = '#ffffff'; g.font = 'bold 54px Arial';
      g.fillText(mode === 'order' ? 'NAYA ORDER!' : 'PHIR NAYA ORDER!', w / 2, 84);
      drawPlate(g, w / 2, 330, 120);
      g.fillStyle = '#22252c'; g.font = 'bold 58px Arial';
      g.fillText('BIRYANI × 1', w / 2, 560);
      g.fillStyle = '#b3231b'; g.font = 'bold 110px Arial';
      g.fillText('₹500', w / 2, 690);
      g.fillStyle = '#1d7a3a'; rr(g, 56, 760, w - 112, 100, 18); g.fill();
      g.fillStyle = '#ffffff'; g.font = 'bold 52px Arial';
      g.fillText('ACCEPT KARO', w / 2, 828);
    } else if (mode === 'paisa') {
      g.fillStyle = '#eef7ee'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#1d7a3a'; g.fillRect(0, 0, w, 130);
      g.fillStyle = '#ffffff'; g.font = 'bold 52px Arial';
      g.fillText('PAISA AAYA ✓', w / 2, 84);
      g.fillStyle = '#8a8a8a'; g.font = 'bold 64px Arial';
      g.fillText('₹500', w / 2, 300);
      g.strokeStyle = '#b3231b'; g.lineWidth = 9;
      g.beginPath(); g.moveTo(130, 278); g.lineTo(382, 278); g.stroke();
      g.fillStyle = '#8a8a8a'; g.font = 'bold 34px Arial';
      g.fillText('ORDER KA POORA?', w / 2, 360);
      g.fillStyle = '#1d7a3a'; g.font = 'bold 150px Arial';
      g.fillText('₹335', w / 2, 540);
      g.fillStyle = '#22252c'; g.font = 'bold 38px Arial';
      g.fillText('SIRF ITNA MILA', w / 2, 620);
      g.fillStyle = '#d8d2c2'; rr(g, 56, 700, w - 112, 130, 14); g.fill();
      g.fillStyle = '#5a564a'; g.font = 'bold 34px Arial';
      g.fillText('BAKI KAHAAN GAYA?', w / 2, 778);
    } else if (mode === 'app') {
      g.fillStyle = '#14243e'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#ffffff'; g.font = 'bold 50px Arial';
      g.fillText('SAARE GRAAHAK', w / 2, 96);
      const cols = ['#f2a93b', '#57d977', '#4da3ff', '#ff8ac2', '#f5d76a', '#9b7ff2', '#ff9636', '#7ae0d4', '#e8e0cc'];
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
        const cx = 96 + c * 160, cy = 250 + r * 175, col = cols[r * 3 + c];
        g.fillStyle = col; g.beginPath(); g.arc(cx, cy, 58, 0, 7); g.fill();
        g.fillStyle = '#2c1e14'; g.beginPath(); g.arc(cx - 20, cy - 8, 7, 0, 7); g.fill();
        g.beginPath(); g.arc(cx + 20, cy - 8, 7, 0, 7); g.fill();
        g.strokeStyle = '#2c1e14'; g.lineWidth = 6;
        g.beginPath(); g.arc(cx, cy + 14, 22, 0.3, Math.PI - 0.3); g.stroke();
        g.fillStyle = col; rr(g, cx - 34, cy + 52, 68, 52, 16); g.fill();
      }
      g.fillStyle = '#f5d76a'; g.font = 'bold 62px Arial';
      g.fillText('APP PAR HAIN', w / 2, 856);
    } else { // bill / billfee
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#22252c'; g.font = 'bold 50px Arial';
      g.fillText('TUMHARA BILL', w / 2, 92);
      g.fillStyle = '#9a917c'; g.fillRect(36, 126, w - 72, 4);
      g.font = 'bold 42px Arial'; g.fillStyle = '#22252c';
      const row = (y, l, a) => { g.textAlign = 'left'; g.fillText(l, 44, y); g.textAlign = 'right'; g.fillText(a, w - 44, y); g.textAlign = 'center'; };
      row(230, 'BIRYANI', '₹500');
      row(320, 'DELIVERY', '₹40');
      row(410, 'PACKING', '₹30');
      if (mode === 'billfee') {
        g.fillStyle = '#ffe27a'; g.fillRect(20, 452, w - 40, 108);
        g.fillStyle = '#b3231b'; g.font = 'bold 46px Arial';
        g.textAlign = 'left'; g.fillText('PLATFORM FEE', 44, 522);
        g.textAlign = 'right'; g.fillText('₹15', w - 44, 522); g.textAlign = 'center';
      } else {
        g.font = 'bold 42px Arial'; g.fillStyle = '#22252c';
        row(500, 'PLATFORM FEE', '₹15');
      }
      g.fillStyle = '#9a917c'; g.fillRect(36, 600, w - 72, 4);
      g.fillStyle = '#22252c'; g.font = 'bold 54px Arial';
      row(690, 'TOTAL', '₹585');
      g.fillStyle = '#8a8a8a'; g.font = 'bold 32px Arial';
      g.fillText('YE FEE HAR ORDER PAR', w / 2, 800);
      g.fillText("CHUPKE SE KAT'TI HAI", w / 2, 848);
    }
    PH.t.needsUpdate = true;
  };
  phoneRedraw('order');
  // ---- side props ----
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.15, 12), lam({ color: 0xf2ede2 }));
  cup.position.set(1.15, 0.84, -0.85); S.add(cup);
  const db = box(0.42, 0.34, 0.42, lam({ color: 0xc9a06a })); db.position.set(-1.2, 0.94, -0.9); S.add(db);
  const coinM2 = lam({ color: 0xd9b84c });
  for (let i = 0; i < 3; i++) {
    const cn = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.014, 14), coinM2);
    cn.position.set(-0.95 + i * 0.14, 0.775, -0.45); S.add(cn);
  }
}

// =====================================================================
// LOOK-V2 — Gullak-density upgrade (sirf LOOK: dressing, rang, roshni)
// Camera / story / timing bilkul nahi badla. Naap: Gullak frame = 25-40
// dikhne wali cheezein, gradient aasmaan, pattern wale kapde, har kone me prop.
// =====================================================================
const skyDayM = { mesh: null }, skySunM = { mesh: null };
let dhabaLight = null, deskLight = null;
const wireBetween = (a, b, r, mat) => {
  const d = new THREE.Vector3().subVectors(b, a), len = d.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 5), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  return m;
};
const garland = (grp, cx, cy, w, h, z) => {
  const cols = [0xff8c1a, 0xffc21a, 0xff8c1a, 0xffc21a, 0x3f8a3a];
  const put = (x, y, i) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.037, 8, 6), lam({ color: cols[i % 5] }));
    s.position.set(x, y, z); grp.add(s);
  };
  let i = 0;
  const nT = Math.floor(w / 0.115);
  for (let k = 0; k <= nT; k++) put(cx - w / 2 + (k / nT) * w, cy + h / 2, i++);
  const nS = Math.floor(h / 0.115);
  for (let k = 1; k <= nS; k++) { put(cx - w / 2, cy + h / 2 - (k / nS) * h, i++); put(cx + w / 2, cy + h / 2 - (k / nS) * h, i++); }
};
const posterBiryani = () => textBoard(512, 704, (g, w, h) => {
  g.fillStyle = '#e8892a'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#7a1f14'; g.lineWidth = 14; g.strokeRect(14, 14, w - 28, h - 28);
  g.fillStyle = '#fff3d6'; g.beginPath(); g.arc(w / 2, 300, 150, 0, 7); g.fill();
  g.fillStyle = '#f2a93b'; g.beginPath(); g.arc(w / 2, 300, 112, 0, 7); g.fill();
  g.fillStyle = '#e8892a'; g.beginPath(); g.arc(w / 2 + 30, 275, 55, 0, 7); g.fill();
  g.fillStyle = '#2e7a35'; g.fillRect(w / 2 - 90, 262, 34, 12); g.fillRect(w / 2 + 60, 330, 34, 12);
  g.fillStyle = '#7a1f14'; g.font = 'bold 92px Arial'; g.textAlign = 'center';
  g.fillText('BIRYANI', w / 2, 560);
  g.font = 'bold 52px Arial'; g.fillText('SPECIAL', w / 2, 636);
});
const posterChai = () => textBoard(512, 704, (g, w, h) => {
  g.fillStyle = '#14524a'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#ffd76a'; g.lineWidth = 14; g.strokeRect(14, 14, w - 28, h - 28);
  g.fillStyle = '#f2ede2'; rr(g, w / 2 - 80, 190, 160, 120, 16); g.fill();
  g.strokeStyle = '#f2ede2'; g.lineWidth = 14;
  g.beginPath(); g.arc(w / 2 + 108, 250, 34, -1.2, 1.2); g.stroke();
  g.fillStyle = '#c97b2e'; rr(g, w / 2 - 68, 202, 136, 52, 10); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 9;
  for (const dx of [-34, 0, 34]) { g.beginPath(); g.moveTo(w / 2 + dx, 148); g.bezierCurveTo(w / 2 + dx - 12, 116, w / 2 + dx + 12, 96, w / 2 + dx, 62); g.stroke(); }
  g.fillStyle = '#ffd76a'; g.font = 'bold 96px Arial'; g.textAlign = 'center';
  g.fillText('CHAI', w / 2, 500);
  g.fillStyle = '#ffffff'; g.font = 'bold 84px Arial';
  g.fillText('₹20', w / 2, 616);
});
{ // ---------- DHABA V2 dressing ----------
  const S = dhabaG, WZ = -3.2;
  const wains = new THREE.Mesh(new THREE.PlaneGeometry(26, 1.12), lam({ map: tex(plaster(51, 42), 6, 1), color: 0x2e7a68 }));
  wains.position.set(0, 0.56, WZ + 0.015); S.add(wains);
  const wTrim = box(26, 0.07, 0.03, lam({ color: 0x7a1f14 })); wTrim.position.set(0, 1.15, WZ + 0.02); S.add(wTrim);
  const stripe = new THREE.Mesh(new THREE.PlaneGeometry(26, 0.17), lam({ color: 0xb3231b }));
  stripe.position.set(0, 3.22, WZ + 0.015); S.add(stripe);
  const p1 = boardMesh(0.64, 0.88, posterBiryani(), true); p1.position.set(0.78, 2.32, WZ + 0.05); p1.rotation.z = 0.025; S.add(p1);
  const p2 = boardMesh(0.64, 0.88, posterChai(), true); p2.position.set(1.95, 2.3, WZ + 0.05); p2.rotation.z = -0.03; S.add(p2);
  const fr = box(0.56, 0.42, 0.04, lam({ color: 0x5d3a22 })); fr.position.set(1.36, 2.98, WZ + 0.03); S.add(fr);
  const photo = boardMesh(0.48, 0.34, textBoard(256, 192, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7ec3ee'); gr.addColorStop(0.62, '#cfe8b8'); gr.addColorStop(0.63, '#5d9a4a'); gr.addColorStop(1, '#3f7a35');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff6d8'; g.beginPath(); g.arc(52, 44, 20, 0, 7); g.fill();
    g.fillStyle = '#4a7a3a'; g.beginPath(); g.arc(190, 108, 44, 0, 7); g.fill(); g.beginPath(); g.arc(150, 118, 30, 0, 7); g.fill();
  }), true); photo.position.set(1.36, 2.98, WZ + 0.06); S.add(photo);
  garland(S, -0.2, 2.45, 1.5, 1.22, -2.58);
  garland(S, 1.75, 2.3, 1.62, 1.16, WZ + 0.12);
  // bulb string (chhat ke saamne jhulti hui)
  const wireM = lam({ color: 0x2c2620 });
  const bA = new THREE.Vector3(-3.4, 4.05, -0.4), bB = new THREE.Vector3(3.4, 4.05, -0.4);
  let prev = null;
  for (let i = 0; i <= 16; i++) {
    const t = i / 16, pt = new THREE.Vector3().lerpVectors(bA, bB, t); pt.y -= Math.sin(t * Math.PI) * 0.5;
    if (prev) S.add(wireBetween(prev, pt, 0.008, wireM));
    if (i % 2 === 0 && i > 0 && i < 16) {
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 8), bas({ color: 0xffdf9e }));
      bulb.position.set(pt.x, pt.y - 0.07, pt.z); S.add(bulb);
    }
    prev = pt;
  }
  // dusri shelf + steel dabbe + thaali stack
  const shelf2 = box(2.2, 0.05, 0.3, lam({ color: 0x7d5230 })); shelf2.position.set(-1.3, 2.62, WZ + 0.18); S.add(shelf2);
  for (let i = 0; i < 4; i++) {
    const dab = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.21, 12), lam({ color: 0xb9c0c7 }));
    dab.position.set(-2.15 + i * 0.42, 2.75, WZ + 0.18); S.add(dab);
    const dl = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.025, 12), lam({ color: 0x9aa2ac }));
    dl.position.set(-2.15 + i * 0.42, 2.87, WZ + 0.18); S.add(dl);
  }
  for (let i = 0; i < 5; i++) {
    const th = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.014, 14), lam({ color: 0xd4d9de }));
    th.position.set(-0.28, 2.66 + i * 0.016, WZ + 0.18); S.add(th);
  }
  const jarX = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.24, 10), lam({ color: 0x8a4b9e }));
  jarX.position.set(0.12, 2.74, WZ + 0.18); S.add(jarX);
  // shelf ke neeche latke bartan (kalchhi / karchhul / chhanni)
  for (const [ux, kind] of [[-1.95, 'ladle'], [-1.55, 'pan'], [-1.15, 'ladle']]) {
    const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 5), lam({ color: 0x39434c }));
    hook.position.set(ux, 1.94, WZ + 0.24); S.add(hook);
    if (kind === 'ladle') {
      const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.3, 6), lam({ color: 0xb9c0c7 }));
      hd.position.set(ux, 1.74, WZ + 0.24); S.add(hd);
      const cup2 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: 0xd4d9de }));
      cup2.rotation.x = Math.PI; cup2.position.set(ux, 1.6, WZ + 0.24); S.add(cup2);
    } else {
      const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.085, 0.03, 14), lam({ color: 0x3c4148 }));
      pan.position.set(ux, 1.68, WZ + 0.24); S.add(pan);
      const ph2 = box(0.03, 0.2, 0.015, lam({ color: 0x3c4148 })); ph2.position.set(ux, 1.86, WZ + 0.24); S.add(ph2);
    }
  }
  // counter par glass display case (samosa + laddoo) + steel thaaliyaan + jag
  const tray = box(0.58, 0.03, 0.42, lam({ color: 0xd4d9de })); tray.position.set(-0.44, 1.1, -1.58); S.add(tray);
  for (let i = 0; i < 4; i++) {
    const sam = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.11, 4), lam({ color: 0xd88f3a }));
    sam.position.set(-0.6 + (i % 2) * 0.16, 1.17, -1.66 + Math.floor(i / 2) * 0.15); sam.rotation.y = 0.6; S.add(sam);
  }
  for (let i = 0; i < 3; i++) {
    const ld = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), lam({ color: 0xe8862e }));
    ld.position.set(-0.3 + i * 0.1, 1.16, -1.5); S.add(ld);
  }
  const caseM = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.34, 0.46), FX.glassMat(0xcfe8f2, 0.22));
  caseM.position.set(-0.44, 1.29, -1.58); caseM.castShadow = false; S.add(caseM);
  { // LOOK-V3: display case ka steel frame (kone + chaukhat) + sheeshe par reflection strip
    const fm = lam({ color: 0x9aa2ac });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const post = box(0.028, 0.36, 0.028, fm); post.position.set(-0.44 + sx * 0.305, 1.29, -1.58 + sz * 0.225); S.add(post);
    }
    for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      const rail = box(0.64, 0.028, 0.028, fm); rail.position.set(-0.44, 1.29 + sy * 0.165, -1.58 + sz * 0.225); S.add(rail);
    }
    for (const sy of [-1, 1]) for (const sx of [-1, 1]) {
      const rail2 = box(0.028, 0.028, 0.47, fm); rail2.position.set(-0.44 + sx * 0.305, 1.29 + sy * 0.165, -1.58); S.add(rail2);
    }
    const refl = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.075), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.30, depthWrite: false }));
    refl.position.set(-0.47, 1.37, -1.345); refl.rotation.z = -0.42; S.add(refl);
    const refl2 = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.04), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, depthWrite: false }));
    refl2.position.set(-0.38, 1.24, -1.345); refl2.rotation.z = -0.42; S.add(refl2);
  }
  for (let i = 0; i < 6; i++) {
    const th = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.085, 0.016, 14), lam({ color: 0xd4d9de }));
    th.position.set(-2.02, 1.09 + i * 0.018, -1.45); S.add(th);
  }
  const jug = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.15, 10), lam({ color: 0xc9ced4 }));
  jug.position.set(-0.02, 1.16, -1.88); S.add(jug);
  // degh ke paas masala katoriyaan + kata pyaaz board
  const spiceCols = [0xc22f3d, 0xf2a93b, 0x3f8a3a];
  [[-1.42, -1.48], [-1.27, -1.64], [-1.5, -1.33]].forEach(([sx, sz], i) => {
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.045, 0.045, 12), lam({ color: 0xd4d9de }));
    bowl.position.set(sx, 1.1, sz); S.add(bowl);
    const heap = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 6), lam({ color: spiceCols[i] }));
    heap.scale.y = 0.45; heap.position.set(sx, 1.12, sz); S.add(heap);
  });
  const cBoard = box(0.34, 0.02, 0.24, lam({ color: 0xd9b078 })); cBoard.position.set(-1.28, 1.09, -1.98); S.add(cBoard);
  let cs2 = 13; const crand = () => ((cs2 = (cs2 * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 9; i++) {
    const bit = box(0.03, 0.014, 0.02, lam({ color: i % 3 ? 0xf2ede2 : 0xd8a8c8 }));
    bit.position.set(-1.28 + (crand() - 0.5) * 0.26, 1.11, -1.98 + (crand() - 0.5) * 0.16);
    bit.rotation.y = crand() * 3; S.add(bit);
  }
  // rang-birangi plastic kursiyaan + table-2 par thaali/katori/jag
  const mkChair = (x, z, ry, col) => {
    const cg = new THREE.Group(); cg.position.set(x, 0, z); cg.rotation.y = ry; S.add(cg);
    const seat = box(0.44, 0.05, 0.42, lam({ color: col })); seat.position.y = 0.46; cg.add(seat);
    const bk = box(0.44, 0.52, 0.05, lam({ color: col })); bk.position.set(0, 0.78, -0.19); cg.add(bk);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const lg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.46, 6), lam({ color: col }));
      lg.position.set(sx * 0.19, 0.23, sz * 0.18); cg.add(lg);
    }
  };
  mkChair(0.82, -0.48, -0.55, 0xc23b2e); mkChair(1.98, -1.2, 2.6, 0x2456a8); mkChair(1.02, -2.62, 0.45, 0x2e7a7a);
  const thali = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.018, 16), lam({ color: 0xd4d9de }));
  thali.position.set(1.45, 0.775, -2.2); S.add(thali);
  for (const [kx, kz] of [[1.36, -2.14], [1.56, -2.3]]) {
    const kat = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.035, 0.045, 10), lam({ color: 0xd4d9de }));
    kat.position.set(kx, 0.8, kz); S.add(kat);
  }
  const jug2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.065, 0.15, 10), lam({ color: 0xc9ced4 }));
  jug2.position.set(1.72, 0.84, -2.42); S.add(jug2);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.4), lam({ map: tex(weave(23), 1, 1) }));
  rug.rotation.x = -Math.PI / 2; rug.position.set(0.5, 0.012, -0.45); S.add(rug);
  dhabaLight = new THREE.PointLight(0xffb36b, 30, 11, 1.8);
  dhabaLight.position.set(0.2, 3.2, -1.0); scene.add(dhabaLight);
}
{ // ---------- STREET V2 dressing ----------
  const S = streetG;
  const skyC = (stops, cloudCol, sunXY) => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 512);
    stops.forEach(([o, col]) => gr.addColorStop(o, col));
    g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
    if (sunXY) {
      const rg = g.createRadialGradient(sunXY[0], sunXY[1], 8, sunXY[0], sunXY[1], 150);
      rg.addColorStop(0, 'rgba(255,246,200,0.95)'); rg.addColorStop(0.25, 'rgba(255,220,150,0.55)'); rg.addColorStop(1, 'rgba(255,220,150,0)');
      g.fillStyle = rg; g.fillRect(0, 0, 1024, 512);
      g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(sunXY[0], sunXY[1], 30, 0, 7); g.fill();
    }
    let sd = 31; const sr = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < 15; i++) {
      const cx = sr() * 1024, cy = 30 + sr() * 190, s = 0.6 + sr() * 1.1;
      g.fillStyle = cloudCol;
      for (const [ox, oy, r] of [[0, 0, 46], [-38, 8, 32], [38, 8, 34], [-16, -12, 28], [20, -10, 26]]) {
        g.beginPath(); g.ellipse(cx + ox * s, cy + oy * s, r * s, r * 0.52 * s, 0, 0, 7); g.fill();
      }
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const skyGeo = new THREE.PlaneGeometry(95, 36);
  skyDayM.mesh = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ map: skyC([[0, '#2f7fe0'], [0.55, '#8ec9ee'], [1, '#ffe9c4']], 'rgba(255,255,255,0.92)', [800, 90]), fog: false }));
  skyDayM.mesh.position.set(0, 10.5, -26); scene.add(skyDayM.mesh);
  skySunM.mesh = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ map: skyC([[0, '#2c2a55'], [0.45, '#b84a6e'], [0.75, '#ff8c42'], [1, '#ffd76a']], 'rgba(255,190,150,0.75)', [512, 330]), fog: false }));
  skySunM.mesh.position.set(0, 10.5, -26); scene.add(skySunM.mesh);
  // buildings par khidkiyon ki jaali (kuch jalti hui)
  const winTex = (tint) => textBoard(256, 384, (g, w, h) => {
    g.fillStyle = tint; g.fillRect(0, 0, w, h);
    let sd = 7; const sr = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let rI = 0; rI < 6; rI++) for (let cI = 0; cI < 4; cI++) {
      g.fillStyle = sr() < 0.3 ? '#ffd76a' : '#2c3e50';
      g.fillRect(18 + cI * 58, 20 + rI * 60, 38, 42);
      g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(18 + cI * 58, 20 + rI * 60, 38, 10);
    }
  });
  [[-7.5, 3.4, 5.5, '#8aa8c0'], [-0.5, 4.2, 7, '#aebfca'], [6.5, 3.6, 6, '#c2ab90'], [11, 3, 4.5, '#9db4c2']].forEach(([bx, bw, bh, tint]) => {
    const wp = new THREE.Mesh(new THREE.PlaneGeometry(bw * 0.84, bh * 0.82), lam({ map: winTex(tint) }));
    wp.position.set(bx, bh / 2, -9.28); S.add(wp);
  });
  // dono dhabon par dhari-daar awning (chhajja)
  const stripeTex = (c1, c2) => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d');
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? c1 : c2; g.fillRect(i * 32, 0, 32, 256); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 1); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  [[-2.3, '#c23b2e', '#f8f4e8', 3.7, 1.75], [1.95, '#1d7a3a', '#f8f4e8', 2.3, 1.0]].forEach(([cx, c1, c2, awW, poleOff]) => {
    // LOOK-V3: Seth ki awning sankri (2.3) + left-shift (1.95) taaki z05 me right kinara frame ke andar margin ke saath aaye
    const aw = new THREE.Mesh(new THREE.PlaneGeometry(awW, 1.15), lam({ map: stripeTex(c1, c2), side: THREE.DoubleSide }));
    aw.position.set(cx, 2.92, -2.78); aw.rotation.x = -0.48; S.add(aw);
    for (const px of [cx - poleOff, cx + poleOff]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 6), lam({ color: 0x6d4a2c }));
      pole.position.set(px, 1.3, -2.35); S.add(pole);
    }
  });
  // sadak ke upar jhandi-torans (do doriyaan)
  const flagCols = [0xc23b2e, 0xf2a93b, 0x2e7a7a, 0x2456a8, 0xe8892a, 0xd45a9e];
  const flagShape = new THREE.Shape(); flagShape.moveTo(-0.085, 0); flagShape.lineTo(0.085, 0); flagShape.lineTo(0, -0.21); flagShape.closePath();
  const flagGeo = new THREE.ShapeGeometry(flagShape);
  const pennants = (a, b, sag) => {
    let prev = null;
    for (let i = 0; i <= 22; i++) {
      const t = i / 22, pt = new THREE.Vector3().lerpVectors(a, b, t); pt.y -= Math.sin(t * Math.PI) * sag;
      if (prev) S.add(wireBetween(prev, pt, 0.008, lam({ color: 0x2c2620 })));
      if (i > 0 && i < 22 && i % 2 === 0) {
        const fl = new THREE.Mesh(flagGeo, bas({ color: flagCols[(i / 2) % 6], side: THREE.DoubleSide }));
        fl.position.copy(pt); fl.rotation.z = (b.x > a.x ? -1 : 1) * Math.atan2(b.y - a.y, Math.abs(b.x - a.x)) * 0.4;
        S.add(fl);
      }
      prev = pt;
    }
  };
  pennants(new THREE.Vector3(-6.2, 3.9, -1.2), new THREE.Vector3(0, 3.45, -3.1), 0.35);
  pennants(new THREE.Vector3(0, 3.45, -3.1), new THREE.Vector3(6.2, 3.9, -1.2), 0.35);
  // phal wala thela (left side)
  const th = new THREE.Group(); th.position.set(-4.7, 0, -0.85); th.rotation.y = 0.22; S.add(th);
  const bed = box(1.5, 0.07, 0.8, lam({ map: FX.woodTexture(), color: 0x9a6a3d })); bed.position.y = 0.95; th.add(bed);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const lg = box(0.05, 0.95, 0.05, lam({ color: 0x54371f })); lg.position.set(sx * 0.65, 0.48, sz * 0.32); th.add(lg);
  }
  for (const sx of [-1, 1]) {
    const wh = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.04, 8, 16), lam({ color: 0x2c2620 }));
    wh.position.set(sx * 0.55, 0.27, 0.42); th.add(wh);
  }
  let fs2 = 41; const fr2 = () => ((fs2 = (fs2 * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 11; i++) {
    const or = new THREE.Mesh(new THREE.SphereGeometry(0.072, 10, 8), lam({ color: 0xf28c1e }));
    or.position.set(-0.55 + (i % 6) * 0.15 + fr2() * 0.03, 1.03 + Math.floor(i / 6) * 0.11, -0.2 + fr2() * 0.1); th.add(or);
  }
  for (let i = 0; i < 6; i++) {
    const am = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), lam({ color: 0x7ab648 }));
    am.position.set(0.25 + (i % 3) * 0.16, 1.03 + Math.floor(i / 3) * 0.11, 0.12); th.add(am);
  }
  const can = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.05), lam({ map: stripeTex('#e8892a', '#f8f4e8'), side: THREE.DoubleSide }));
  can.position.set(0, 2.02, 0); can.rotation.x = -0.22; th.add(can);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const cp2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.05, 5), lam({ color: 0x54371f }));
    cp2.position.set(sx * 0.8, 1.5, sz * 0.48); th.add(cp2);
  }
  // poster wala khambha (right side)
  const ppole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.3, 8), lam({ color: 0x707880 }));
  ppole.position.set(3.9, 1.65, -0.5); S.add(ppole);
  const post1 = boardMesh(0.58, 0.82, textBoard(256, 384, (g, w, h) => {
    g.fillStyle = '#f2a93b'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b3231b'; g.fillRect(0, 0, w, 92);
    g.fillStyle = '#ffffff'; g.font = 'bold 44px Arial'; g.textAlign = 'center'; g.fillText('DHAMAKA', w / 2, 62);
    g.fillStyle = '#7a4a21'; g.beginPath(); g.arc(w / 2, 200, 62, 0, 7); g.fill();
    g.fillStyle = '#f2c894'; g.beginPath(); g.arc(w / 2, 192, 44, 0, 7); g.fill();
    g.fillStyle = '#22252c'; g.fillRect(28, 292, w - 56, 16); g.fillRect(48, 322, w - 96, 16); g.fillRect(68, 352, w - 136, 16);
  }), true); post1.position.set(3.9, 1.95, -0.41); post1.rotation.y = -0.15; S.add(post1);
  const post2 = boardMesh(0.5, 0.6, textBoard(256, 320, (g, w, h) => {
    g.fillStyle = '#2456a8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.font = 'bold 40px Arial'; g.textAlign = 'center';
    g.fillText('COACHING', w / 2, 90); g.fillText('₹999', w / 2, 170);
    g.fillStyle = '#ffd76a'; g.fillRect(30, 210, w - 60, 60);
    g.fillStyle = '#22252c'; g.font = 'bold 34px Arial'; g.fillText('ADMISSION', w / 2, 252);
  }), true); post2.position.set(3.86, 1.05, -0.4); post2.rotation.y = 0.12; S.add(post2);
  // dusra ped + jhaadiyaan + gamle + crate stack
  const trunk2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 1.9, 8), lam({ color: 0x6d4a2c }));
  trunk2.position.set(5.9, 0.95, -4.0); S.add(trunk2);
  for (const [ox, oy, r] of [[5.9, 2.5, 0.95], [5.2, 2.15, 0.65], [6.6, 2.2, 0.7]]) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), lam({ color: 0x357a35 }));
    leaf.position.set(ox, oy, -4.0); S.add(leaf);
  }
  for (const bx of [-5.5, -4.3, 4.5, 5.7]) {
    const bush = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), lam({ color: 0x3f8a3a }));
    bush.scale.y = 0.7; bush.position.set(bx, 0.3, -3.35); S.add(bush);
  }
  for (const px of [-4.5, 4.5]) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.09, 0.24, 10), lam({ color: 0xb05a2e }));
    pot.position.set(px, 0.12, -2.9); S.add(pot);
    const pl2 = new THREE.Mesh(new THREE.SphereGeometry(0.21, 10, 8), lam({ color: 0x4a9a44 }));
    pl2.position.set(px, 0.42, -2.9); S.add(pl2);
  }
  [[-4.35, 0.23, 0xc9a06a], [-4.35, 0.68, 0x8a9a5b], [-3.85, 0.23, 0xa85a3a]].forEach(([cx2, cy2, cc]) => {
    const cr = box(0.46, 0.44, 0.46, lam({ color: cc })); cr.position.set(cx2, cy2, -2.55); S.add(cr);
  });
  // footpath par pathar tiles + sadak par dhabbe-daar asphalt
  const foot2 = new THREE.Mesh(new THREE.PlaneGeometry(34, 2.2), lam({ map: tex(stone(61, 32, 16, 58), 10, 1), color: 0xd8c8a8 }));
  foot2.rotation.x = -Math.PI / 2; foot2.position.set(0, 0.016, -1.6); S.add(foot2);
  const road2 = new THREE.Mesh(new THREE.PlaneGeometry(34, 4.6), lam({
    map: tex((() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#43484f'; g.fillRect(0, 0, 256, 256); let sd = 3; const sr = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296); for (let i = 0; i < 900; i++) { g.fillStyle = sr() < 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.14)'; g.fillRect(sr() * 256, sr() * 256, 2, 2); } return c; })(), 8, 1),
  }));
  road2.rotation.x = -Math.PI / 2; road2.position.set(0, 0.006, 1.6); S.add(road2);
  // LOOK-V3: camera ke saamne wali zameen par girre patte, kankar-pathar, tehniyaan
  // (z48 ke ant me neeche ka khaali bhura hissa bharne ke liye)
  let gs = 97; const grand = () => ((gs = (gs * 1664525 + 1013904223) >>> 0) / 4294967296);
  const leafCols = [0xb8641e, 0xc98a2e, 0x8a9a3a, 0xa84a2a, 0xd9a03c];
  const leafGeo = new THREE.PlaneGeometry(0.21, 0.14);
  for (let i = 0; i < 60; i++) {
    const lf = new THREE.Mesh(leafGeo, lam({ color: leafCols[i % leafCols.length], side: THREE.DoubleSide }));
    lf.rotation.set(-Math.PI / 2, 0, grand() * 6.28);
    lf.position.set(-10.5 + grand() * 21, 0.012 + (i % 5) * 0.0012, 4.3 + grand() * 9.2);
    S.add(lf);
  }
  const stoneGeo = new THREE.SphereGeometry(0.055, 8, 6);
  for (let i = 0; i < 18; i++) {
    const st = new THREE.Mesh(stoneGeo, lam({ color: [0x9a8d7a, 0x7d7264, 0xb0a08a][i % 3] }));
    st.scale.set(1 + grand() * 0.9, 0.38, 0.8 + grand() * 0.5);
    st.rotation.y = grand() * 3;
    st.position.set(-11 + grand() * 22, 0.018, 4.2 + grand() * 9.6);
    S.add(st);
  }
  for (let i = 0; i < 7; i++) {
    const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.4 + grand() * 0.35, 5), lam({ color: 0x6d4a2c }));
    tw.rotation.set(Math.PI / 2, 0, grand() * 3);
    tw.position.set(-9 + grand() * 18, 0.02, 4.6 + grand() * 8.4);
    S.add(tw);
  }
}
{ // ---------- DESK V2 dressing ----------
  const S = deskG, WZ = -3.2;
  const poolT = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d');
    const rg = g.createRadialGradient(128, 128, 8, 128, 128, 126);
    rg.addColorStop(0, 'rgba(255,214,150,0.55)'); rg.addColorStop(1, 'rgba(255,214,150,0)');
    g.fillStyle = rg; g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c); return t;
  })();
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1.05, 24), new THREE.MeshBasicMaterial({ map: poolT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  pool.rotation.x = -Math.PI / 2; pool.position.set(0.8, 0.786, -0.8); S.add(pool);
  deskLight = new THREE.PointLight(0xffc98a, 16, 8, 1.8);
  deskLight.position.set(1.0, 1.5, -1.05); scene.add(deskLight);
  const chai = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.036, 0.115, 12), FX.glassMat(0xd88f3a, 0.45));
  chai.position.set(-0.74, 0.845, -0.98); chai.castShadow = false; S.add(chai);
  const chaiTop = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.012, 12), lam({ color: 0xa85a1e }));
  chaiTop.position.set(-0.74, 0.9, -0.98); S.add(chaiTop);
  const calc = box(0.17, 0.022, 0.23, lam({ color: 0x22262b })); calc.position.set(0.8, 0.795, -0.12); calc.rotation.y = -0.3; S.add(calc);
  const calcScr = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.05), bas({ color: 0xb8d2ea }));
  calcScr.rotation.x = -Math.PI / 2; calcScr.rotation.z = 0.3; calcScr.position.set(0.79, 0.808, -0.19); S.add(calcScr);
  for (const sxx of [-1, 1]) {
    const lens = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.006, 6, 16), lam({ color: 0x2c2620 }));
    lens.rotation.x = Math.PI / 2; lens.position.set(-0.72 + sxx * 0.052, 0.79, 0.38); S.add(lens);
  }
  const note500 = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.16), lam({
    map: textBoard(512, 224, (g, w, h) => {
      g.fillStyle = '#a8c8a2'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#4a7a44'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16);
      g.fillStyle = '#2c5e2a'; g.font = 'bold 92px Arial'; g.textAlign = 'center';
      g.fillText('₹500', w / 2, 148);
    }), side: THREE.DoubleSide,
  }));
  note500.rotation.x = -Math.PI / 2; note500.rotation.z = 0.42; note500.position.set(0.44, 0.783, -1.0); S.add(note500);
  const rough = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.3), lam({
    map: textBoard(512, 640, (g, w, h) => {
      g.fillStyle = '#efe8d2'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#b8ac8e'; g.lineWidth = 3;
      for (let rI = 0; rI < 12; rI++) { g.beginPath(); g.moveTo(26, 70 + rI * 46); g.lineTo(w - 26, 70 + rI * 46); g.stroke(); }
      g.fillStyle = '#8a8272'; g.font = 'bold 34px Arial'; g.textAlign = 'left';
      g.fillText('ROUGH', 30, 48);
    }),
  }));
  rough.rotation.x = -Math.PI / 2; rough.rotation.z = 0.13; rough.position.set(-0.14, 0.779, -0.24); S.add(rough);
  const pad = box(0.17, 0.022, 0.12, lam({ color: 0x8a2f1b })); pad.position.set(0.33, 0.795, 0.44); pad.rotation.y = 0.25; S.add(pad);
  const coinGeo2 = new THREE.CylinderGeometry(0.05, 0.05, 0.014, 14), coinM2 = lam({ color: 0xd9b84c });
  [[0.34, 0.6], [0.47, 0.52], [-0.5, 0.62], [0.58, 0.66]].forEach(([cx2, cz2]) => {
    const cn = new THREE.Mesh(coinGeo2, coinM2); cn.position.set(cx2, 0.79, cz2); S.add(cn);
  });
  const p3 = boardMesh(0.64, 0.88, posterChai(), true); p3.position.set(1.72, 2.42, WZ + 0.05); p3.rotation.z = 0.02; S.add(p3);
  const cord2 = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.85, 5), lam({ color: 0x2c2620 }));
  cord2.position.set(0.85, 3.6, -2.5); S.add(cord2);
  const bulb2 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), bas({ color: 0xffdf9e }));
  bulb2.position.set(0.85, 3.12, -2.5); S.add(bulb2);
  for (let i = 0; i < 2; i++) {
    const jr = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.24, 10), lam({ color: [0xc23b2e, 0x57a773][i] }));
    jr.position.set(-0.05 + i * 0.42, 2.28, WZ + 0.18); S.add(jr);
  }
}
// ---------- shadows ON (cards ke blob ke saath asli parchaai bhi) ----------
[dhabaG, streetG, deskG, phoneG, plateG, packG, stampG, cutPiece, coinG, bikeG, bike2G, noteG, phoneProp].forEach((gr) => {
  gr.traverse((o) => {
    if (o.isMesh) {
      const basic = o.material && (o.material.isMeshBasicMaterial || o.material.transparent);
      o.castShadow = !basic; o.receiveShadow = true;
    }
  });
});
function lookV2Frame(set, shot) {
  const isSunset = shot.env === 'sunset';
  if (skyDayM.mesh) skyDayM.mesh.visible = set === 'street' && !isSunset;
  if (skySunM.mesh) skySunM.mesh.visible = set === 'street' && isSunset;
  if (dhabaLight) dhabaLight.visible = set === 'dhaba';
  if (deskLight) deskLight.visible = set === 'desk';
}
const SETVIS = { dhaba: dhabaG, street: streetG, desk: deskG, phone: phoneG };
window.renderFrame = (f) => {
  const shot = shotAt(f), u = shot.u, set = shot.set;
  const cam = camFor(shot, u);
  camera.position.set(...cam.pos); camera.lookAt(...cam.look);
  camera.fov = cam.fov; camera.updateProjectionMatrix();
  if (cam.roll) camera.rotateZ(cam.roll * Math.PI / 180);
  applyEnv(shot.env || ENV_DEFAULT[set]);
  lookV2Frame(set, shot);
  for (const k in SETVIS) SETVIS[k].visible = (k === set);
  ALL_CARDS.forEach((c) => c.hide());
  plateG.visible = false; phoneProp.visible = false; packG.visible = false;
  bikeG.visible = false; bike2G.visible = false; noteG.visible = false;
  stampG.visible = false; cutPiece.visible = false; coinG.visible = false;
  dabbaTop.rotation.set(0, 0, 0); dabbaTop.position.x = -0.95;
  if (receiptPlaneHolder.mesh) { receiptPlaneHolder.mesh.scale.y = 1; receiptPlaneHolder.mesh.position.y = 0.55; }
  const cp = cam.pos;
  const faceCam = (obj, x, z) => { obj.rotation.y = Math.atan2(cp[0] - x, cp[2] - z); };
  // ---- ZINDA BACKGROUND ----
  steamSprites.forEach((sp, i) => {
    sp.visible = (set === 'dhaba');
    if (set === 'dhaba') {
      const ph = (f * 0.014 + i / 7) % 1;
      sp.position.set(-1.8 + Math.sin(f * 0.05 + i * 2.1) * 0.1 * ph, 1.52 + ph * 0.85, -1.75);
      sp.scale.setScalar(0.25 + ph * 0.6);
      sp.material.opacity = 0.4 * (1 - ph) * Math.min(1, ph * 5);
    }
  });
  if (set === 'dhaba') {
    fanBladesD.rotation.y = f * 0.55;
    dhabaG.userData.kalchhi.rotation.z = 0.15 + Math.sin(f * 0.18) * 0.16;
  }
  if (set === 'street' && (shot.id === 'z05' || shot.id === 'z39' || shot.id === 'z48')) {
    bike2G.visible = true;
    const bx = -16 + ((f * 0.05) % 30);
    bike2G.position.set(bx, 0, 2.7);
    drawChar(cust2Card, 64, CUST2, 'neutral', 'hang', 'hang', f, cp, bx + 0.1, 0.32, 2.7, 0.88);
  }

  switch (shot.id) {
    // ---------- HOOK ----------
    case 'z01':
      once('rate', 'hook500', () => rateRedraw('hook500'));
      plateG.visible = true;
      drawChar(mohanCard, 61, MOHAN, 'smile', 'hang', 'hang', f, cp, -1.15, 0, -2.35, 1.0);
      break;
    case 'z02':
      once('rate', 'bache185', () => rateRedraw('bache185'));
      break;
    case 'z03':
      once('rate', 'bache185', () => rateRedraw('bache185'));
      drawChar(mohanCard, 61, MOHAN, 'shock', 'hang', 'hang', f, cp, -1.15, 0, -2.35, 1.14);
      break;
    case 'z04':
      once('rate', 'bache185', () => rateRedraw('bache185'));
      drawChar(mohanCard, 61, MOHAN, 'nervous', 'cheek', 'hang', f, cp, -1.15, 0, -2.35, 1.08);
      break;
    // ---------- DHABA KHULA / SETH KI SALAH ----------
    case 'z05':
      drawChar(mohanCard, 61, MOHAN, 'smile', 'wave', 'hang', f, cp, -2.3, 0, -2.55, 1.0);
      drawChar(sethCard, 62, SETH, 'neutral', 'hang', 'hang', f, cp, 2.3, 0, -2.55, 0.95);
      break;
    case 'z06':
      drawChar(sethCard, 62, SETH, 'grin', 'point', 'hang', f, cp, 2.3, 0, -2.55, 1.06);
      drawChar(mohanCard, 61, MOHAN, 'neutral', 'hang', 'hang', f, cp, -2.3, 0, -2.55, 0.92);
      break;
    case 'z07':
      drawChar(sethCard, 62, SETH, 'laugh', 'up', 'belly', f, cp, 2.3, 0, -2.55, 1.13);
      noteG.visible = true; noteG.position.set(2.92, 1.32, -2.25); faceCam(noteG, 2.92, -2.25);
      break;
    // ---------- PEHLA ORDER / KHUSHI ----------
    case 'z08': once('ph', 'order', () => phoneRedraw('order')); break;
    case 'z09':
      phoneProp.visible = true;
      once('mini', 'order', () => miniPhoneRedraw('order'));
      phoneProp.rotation.set(-0.15, Math.atan2(cp[0] + 0.68, cp[2] + 1.28), 0);
      drawChar(mohanCard, 61, MOHAN, 'grin', 'reach', 'hang', f, cp, -1.15, 0, -2.35, 1.06);
      break;
    case 'z10':
      setLaddoo(u < 0.5 ? 6 : 5);
      drawChar(mohanCard, 61, MOHAN, 'smile', 'reach', 'hang', f, cp, 0.0, 0, -0.8, 1.04);
      drawChar(cust1Card, 63, CUST1, 'smile', 'reach', 'hang', f, cp, 0.95, 0, -0.2, 1.02);
      break;
    case 'z11':
      setLaddoo(5);
      drawChar(cust1Card, 63, CUST1, 'smile_closed', 'belly', 'belly', f, cp, 0.95, 0, -0.2, 1.06);
      drawChar(mohanCard, 61, MOHAN, 'laugh', 'hang', 'hang', f, cp, -0.3, 0, -1.2, 0.94);
      break;
    case 'z12':
      drawChar(mohanCard, 61, MOHAN, 'smile', 'up', 'hang', f, cp, -1.85, 0, -2.5, 1.0);
      break;
    case 'z13':
      packG.visible = true;
      drawChar(mohanCard, 61, MOHAN, 'neutral', 'reach', 'hang', f, cp, -1.7, 0, -2.3, 1.02);
      break;
    // ---------- RIDER ----------
    case 'z14':
      bikeG.visible = true; bikeG.position.set(0.9, 0, 1.0); bikeG.rotation.y = -0.35;
      drawChar(riderCard, 65, RIDER, 'grin', 'reach', 'hang', f, cp, 1.5, 0, 0.5, 1.02);
      noteG.visible = true; noteG.position.set(1.3, 1.06, 0.68); faceCam(noteG, 1.3, 0.68);
      drawChar(mohanCard, 61, MOHAN, 'smile', 'hang', 'hang', f, cp, -2.3, 0, -2.55, 0.9);
      break;
    case 'z15':
      bikeG.visible = true; bikeG.position.set(4.3, 0, 0.15); bikeG.rotation.y = 0.15;
      drawChar(riderCard, 65, RIDER, 'neutral', 'hang', 'hang', f, cp, 4.15, 0, 0.6, 1.02);
      break;
    // ---------- SAAT DIN / PAISA AAYA ----------
    case 'z16': {
      const day = 1 + Math.floor(u * 6.99);
      once('cal', 'd' + day, () => calRedraw(day));
      break;
    }
    case 'z17':
      once('ph', 'paisa', () => phoneRedraw('paisa'));
      drawChar(mohanCard, 61, MOHAN, 'nervous', 'cheek', 'hang', f, cp, -1.35, 0, -1.0, 0.98);
      break;
    // ---------- HISAAB (desk, shaam) ----------
    case 'z18': once('kag', 's0', () => kagazRedraw(0)); break;
    case 'z19': once('kag', 's0', () => kagazRedraw(0)); break;
    case 'z20':
      once('kag', 's1', () => kagazRedraw(1));
      if (u > 0.12) {
        cutPiece.visible = true;
        const e = M.easeInOut(clamp((u - 0.12) / 0.88));
        cutPiece.position.set(0.3 + e * 0.5, 0.84 - e * e * 0.42, -0.3 + e * 0.5);
        cutPiece.rotation.set(-Math.PI / 2 + e * 0.9, 0, e * 1.2);
      }
      break;
    case 'z21': {
      once('kag', u < 0.45 ? 's1' : 's2', () => kagazRedraw(u < 0.45 ? 1 : 2));
      stampG.visible = true;
      const dy = u < 0.4 ? (0.4 - u) * 1.15 : u < 0.58 ? 0 : (u - 0.58) * 1.0;
      stampG.position.set(0.26, 0.83 + dy, -0.49);
      break;
    }
    case 'z22':
      drawChar(mohanCard, 61, MOHAN, 'shock', 'hang', 'hang', f, cp, -1.15, 0, -2.35, 1.18);
      break;
    case 'z23':
      drawDizzy(mohanCard, 61, MOHAN, f, cp, -1.15, 0, -2.35, 1.12);
      break;
    case 'z24': once('kag', 's2', () => kagazRedraw(2)); break;
    case 'z25':
      once('kag', 's3', () => kagazRedraw(3));
      dabbaTop.rotation.z = -0.38 * u; dabbaTop.position.x = -0.95 + 0.12 * u;
      break;
    case 'z26':
      once('kag', 's4', () => kagazRedraw(4));
      if (receiptPlaneHolder.mesh) {
        receiptPlaneHolder.mesh.scale.y = 0.35 + 0.65 * M.easeOut(u);
        if (receiptRedraw) receiptRedraw();
        receiptPlaneHolder.mesh.position.y = 0.55 - 0.04 * u;
      }
      break;
    case 'z27': {
      once('kag', 's5', () => kagazRedraw(5));
      once('mb', 'mile335', () => miniBoardRedraw('mile335'));
      coinG.visible = true;
      const coins = window.__coins;
      coins.forEach((cn, i) => {
        if (!cn.userData.home) cn.userData.home = cn.position.clone();
        if (i >= 15) {
          const p = clamp(u * 1.5 - (i - 15) * 0.09);
          const e = M.easeOut(p);
          cn.position.set(cn.userData.home.x + (1 - e) * 0.55, cn.userData.home.y, cn.userData.home.z + (1 - e) * 0.3);
        }
      });
      break;
    }
    case 'z28':
      drawChar(mohanCard, 61, MOHAN, 'pained', 'hang', 'hang', f, cp, -1.85, 0, -2.5, 1.08);
      break;
    case 'z29': once('kag', 's6', () => kagazRedraw(6)); break;
    case 'z30':
      once('kag', 's7', () => kagazRedraw(7));
      once('mb', 'bache185', () => miniBoardRedraw('bache185'));
      coinG.visible = true;
      break;
    case 'z31': once('kag', 's8', () => kagazRedraw(8)); break;
    case 'z32': once('kag', 's9', () => kagazRedraw(9)); break;
    // ---------- LADDOO CALLBACK / SETH PAYOFF ----------
    case 'z33': setLaddoo(0); break;
    case 'z34':
      setLaddoo(0);
      drawChar(mohanCard, 61, MOHAN, 'pained', 'hang', 'belly', f, cp, -1.15, 0, -2.35, 1.06);
      break;
    case 'z35':
      drawChar(sethCard, 62, SETH, 'pained', 'hang', 'hang', f, cp, 2.3, 0, -2.55, 1.09);
      break;
    case 'z36': {
      const e = M.easeInOut(u);
      const sx = 2.3 + (-0.7 - 2.3) * e, sz = -2.55 + (-1.3 + 2.55) * e;
      drawChar(sethCard, 62, SETH, 'pained', 'hang', 'hang', f, cp, sx, 0, sz, 1.03, (f % 16) / 16);
      drawChar(mohanCard, 61, MOHAN, 'neutral', 'hang', 'hang', f, cp, -2.3, 0, -2.55, 0.96);
      break;
    }
    case 'z37':
      drawChar(sethCard, 62, SETH, 'pained', 'belly', 'belly', f, cp, -0.55, 0, -1.15, 1.07);
      break;
    // ---------- JHATKA / KAL PHIR ----------
    case 'z38':
      drawChar(mohanCard, 61, MOHAN, 'stern', 'hang', 'hang', f, cp, -1.15, 0, -2.35, 1.13);
      break;
    case 'z39':
      drawChar(mohanCard, 61, MOHAN, 'smile', 'wave', 'hang', f, cp, -2.3, 0, -2.55, 1.0);
      drawChar(sethCard, 62, SETH, 'neutral', 'hang', 'hang', f, cp, 2.3, 0, -2.55, 0.95);
      break;
    case 'z40': once('ph', 'order2', () => phoneRedraw('order2')); break;
    case 'z41':
      packG.visible = true;
      drawChar(mohanCard, 61, MOHAN, 'pained', 'reach', 'hang', f, cp, -1.15, 0, -2.35, 1.05);
      break;
    // ---------- GRAAHAK APP PAR / BILL ----------
    case 'z42': break; // band darwaza hi hero hai
    case 'z43': once('ph', 'app', () => phoneRedraw('app')); break;
    case 'z44': once('ph', 'bill', () => phoneRedraw('bill')); break;
    case 'z45': once('ph', 'billfee', () => phoneRedraw('billfee')); break;
    case 'z46':
      drawChar(mohanCard, 61, MOHAN, 'stern', 'point', 'hang', f, cp, -1.15, 0, -2.35, 1.09);
      break;
    case 'z47':
      drawChar(mohanCard, 61, MOHAN, 'smile_closed', 'hang', 'hang', f, cp, -1.15, 0, -2.35, 1.07);
      break;
    case 'z48':
      drawChar(mohanCard, 61, MOHAN, 'smile_closed', 'hang', 'hang', f, cp, -2.3, 0, -2.55, 0.96);
      drawChar(sethCard, 62, SETH, 'neutral', 'hang', 'hang', f, cp, 2.3, 0, -2.55, 0.96);
      break;
  }
  renderer.render(scene, camera);
};
window.TOTAL = TOTAL;
window.ready = Promise.resolve();
