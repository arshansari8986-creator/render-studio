// "Press Wala" — SAMPLE (8.62s, 259 frames @30fps). Mirror kit + Gullak density.
// DO SET: 'gali' (press dukaan wali gali) | 'dukaan' (press dukaan interior — counter/dher/bhaap).
// Palette: natural muted — dhool-mitti sadak, halki cream deewaar, halka neela aasmaan + garam horizon.
// Tez saturated rang SIRF hero cheezon par (₹2,00,000 board, ₹10 laal tag, peeli pencil, naapne wala tape).
// NO captions, NO music. Numbers objects bankar: "₹2,00,000" board, "RAJU PRESS" board, "₹10" laal tag.
// MUNH = bhaav ka instrument, bolne ka nahi — NO phoneme lip-sync. ENV is build me munh ke liye
// use NAHI hota (envelope.js sirf full-build reference ke liye hai). Munh sirf 4 states:
// band (dash) / "O" shock / khula-hansi / seedhi line — beat par khole (line shuru → khula hold
// ~0.5s → pause par band). Narration 100% voiceover — narration par munh band + expression badle.
// NO walk cycle — chalna = chhote kadam + halka bob; action = haath+sar+chehra.
// Contract: window.ready, window.renderFrame(f).
import * as THREE from 'three';
import * as FX from './fx.js';
import * as T from './toon.js';
import { idle, blinkAt, q, M, clamp } from './motion.js';
import { tex, planks, plaster, stone, dirt, wetConcrete, tiles, tinRoof } from './paint.js';
import { TOTAL, shotAt, camFor, FLASH } from './story.js';

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
// dukaan counter ke latakte bulb ki garam roshni (sirf dukaan set me ON)
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
// ---- Raju ke signature props — card canvas par draw (camera-facing, hamesha dikhe):
// peeli pencil kaan ke peeche + gale me naapne wala tape (peeli patti, kaale nishan).
function drawRajuProps(p, seed) {
  const Hb = T.headBlob(seed, 118, 0), hc = T.headCenter(seed);
  const cx = 300, earX = cx + Hb.a * 0.95, earY = hc - Hb.b * 0.1;
  // peeli pencil — kaan ke peeche, tirchhi (peela + gulabi eraser + kaali nok)
  p.stroke([[earX - 6, earY + 26], [earX + 16, earY - 52]], 9, '#facc15');
  p.stroke([[earX + 16, earY - 52], [earX + 20, earY - 64]], 9, '#f472b6');
  p.stroke([[earX - 6, earY + 26], [earX - 10, earY + 36]], 7, '#3a2a1c');
  // naapne wala tape — gale ke chaaron ore peeli patti + latakta sira
  const chin = hc + Hb.b, HH = 2 * Hb.b, bandY = chin + 0.22 * HH;
  p.poly([[cx - 96, bandY - 8], [cx + 96, bandY - 8], [cx + 96, bandY + 8], [cx - 96, bandY + 8]], '#fde047', 2);
  for (let x = cx - 88; x <= cx + 88; x += 16) p.stroke([[x, bandY - 8], [x, bandY + 8]], 2, '#1e293b');
  p.poly([[cx + 28, bandY + 8], [cx + 44, bandY + 8], [cx + 44, bandY + 0.62 * HH], [cx + 28, bandY + 0.62 * HH]], '#fde047', 2);
  for (let y = bandY + 24; y < bandY + 0.6 * HH; y += 18) p.stroke([[cx + 28, y], [cx + 44, y]], 2, '#1e293b');
}
// mouth: beat-level string ('o' | 'O' | 'smirk' | 'smile' | null) — ENV se KABHI nahi.
function drawChar(card, seed, outfit, expr, R, L, f, camPos, x, y, z, s = 1.03, step = 0, lift = null, tilt = 0, mouth = null, props = false) {
  const idl = idle(f, seed), blink = blinkAt(f, seed);
  const liftQ = lift === null ? '' : q(lift, 1);
  const key = `${seed}|${expr}|${R}|${L}|${blink}|${q(idl.bob, 2)}|${Math.round(idl.tilt + tilt * 3)}|${q(step, 2)}|${liftQ}|${mouth || ''}`;
  card.draw(key, (p) => {
    T.romanFront(p, outfit, {
      seed, expr, R, L, blink, bob: q(idl.bob, 2), tilt: Math.round(idl.tilt + tilt * 3),
      headTilt: Math.round(idle(f, seed + 2).headTilt + tilt * 6), wv: f * 0.18, step, lift: lift === null ? 0 : lift, mouth,
    });
    if (props) drawRajuProps(p, seed);
  });
  card.place(x, y, z, camPos, s);
}
const rajuCard = new Card(), neighCard = new Card();
const ALL_CARDS = [rajuCard, neighCard];
// FRESH character — Raju (Dhaba ke Bhanu ko copy NAHI): gehra teal kurta + cream shirt,
// garam skin #c88848 (chehra sabse garam), moochh, peeli pencil + naapne wala tape.
const RAJU = { tunic: '#2e6b62', shirt: '#fef3c7', skin: '#c88848', hair: '#1e1a20', hairStyle: 'thick', moustache: '#241a14', apron: '#e8e0cc' };
const NEIGH = { tunic: '#8a5d3b', shirt: '#f8fafc', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick' }; // background padosi

// ---- MUNH, beat-level (frame numbers; line shuru → khula hold ~0.5s → pause par band) ----
function mouthFor(f) {
  if (f < 83) { // s01: line start + "do lakh" number beat
    if (f < 15) return 'o';
    if (f >= 54 && f < 68) return 'o';
    return null;
  }
  if (f < 123) return 'smirk'; // s02: sly smile — expression, bolna nahi
  if (f < 179) { // s03: line start
    if (f < 138) return 'o';
    return null;
  }
  if (f < 223) { // s04: line start, phir kaam karte hue munh band
    if (f < 193) return 'o';
    return null;
  }
  return null; // s05: Raju frame me nahi (tag ECU)
}

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
// SETS — GALI (press dukaan wali gali) aur DUKAAN (interior — counter/dher/bhaap)
// =====================================================================
const galiG = new THREE.Group(); scene.add(galiG);
const dukaanG = new THREE.Group(); scene.add(dukaanG);
let galiTrees = [], dukaanTrees = [];
const swayCloths = []; // latakte kapde — har shot me halke hilte (zinda background)

// ---- shared board textures ----
// "₹2,00,000" board — dukaan deewaar par, frame 1 se (gold-on-dark teal, HERO number)
const lakhTex = textBoard(512, 320, (g, w, h) => {
  g.fillStyle = '#134e4a'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#facc15'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
  g.textAlign = 'center'; g.fillStyle = '#facc15';
  g.font = 'bold 84px Arial'; g.fillText('₹2,00,000', w / 2, 140);
  g.fillStyle = '#f8fafc'; g.font = 'bold 44px Arial'; g.fillText('EK MAHINE MEIN', w / 2, 230);
});
// "RAJU PRESS" sign — dukaan deewaar ke upar (laal + cream)
const pressSignTex = textBoard(1024, 170, (g, w, h) => {
  g.fillStyle = '#7f1d1d'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fef3c7'; g.font = 'bold 92px "Arial Narrow", Arial'; g.textAlign = 'center';
  g.fillText('RAJU PRESS', w / 2, 112);
});
// "KIRANA" sign — gali ke paar wali dukaan par (muted, background)
const kiranaTex = textBoard(768, 200, (g, w, h) => {
  g.fillStyle = '#e2e8f0'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#475569'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16);
  g.textAlign = 'center'; g.fillStyle = '#475569';
  g.font = 'bold 100px Arial'; g.fillText('KIRANA', w / 2, 118);
  g.fillStyle = '#334155'; g.font = 'bold 40px Arial'; g.fillText('STORE • CHAI', w / 2, 172);
});
// kapdon ki kataar — rassi par latakte kapde (gali + dukaan dono me; sway ke liye group)
function mkClothesLine(S, x0, x1, y, z, cols) {
  const g = new THREE.Group(); S.add(g);
  const rope = cyl(0.015, 0.015, x1 - x0, lam({ color: 0x6b5a44 }), 6);
  rope.rotation.z = Math.PI / 2; rope.position.set((x0 + x1) / 2, y, z); g.add(rope);
  const n = cols.length;
  cols.forEach((col, i) => {
    const cx = x0 + (x1 - x0) * (i + 0.5) / n;
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.5), lam({ color: col, side: THREE.DoubleSide }));
    cloth.position.set(cx, y - 0.26, z); g.add(cloth);
    const pin1 = box(0.04, 0.06, 0.02, lam({ color: 0xd97706 })); pin1.position.set(cx - 0.12, y - 0.02, z + 0.01); g.add(pin1);
    const pin2 = box(0.04, 0.06, 0.02, lam({ color: 0xd97706 })); pin2.position.set(cx + 0.12, y - 0.02, z + 0.01); g.add(pin2);
    swayCloths.push(cloth);
  });
  return g;
}

// ---------- GALI: dhool sadak, press dukaan, paar KIRANA, kataar, ped, taar ----------
{
  const S = galiG;
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
  // press dukaan building — halki cream deewaar, terracotta chhat
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
  const pressSign = boardMesh(2.2, 0.45, pressSignTex, true); pressSign.position.set(-1.5, 2.95, -4.24); S.add(pressSign);
  const lakhBoard = boardMesh(1.5, 0.9, lakhTex, true); lakhBoard.position.set(-2.6, 1.9, -4.22); S.add(lakhBoard);
  // kapdon ki kataar — dukaan ke saamne rassi par (Raju ke peeche)
  mkClothesLine(S, -3.6, 1.2, 2.3, -3.5, [0xf8fafc, 0x93c5fd, 0xfca5a5, 0x86efac, 0xfde68a]);
  // aangan: kapdon ki tokri (foreground right) + ghada (foreground left)
  const basket = cyl(0.32, 0.26, 0.45, lam({ color: 0x8a6844 }), 14); basket.position.set(2.4, 0.22, -0.8); S.add(basket);
  const fold1 = box(0.4, 0.09, 0.3, lam({ color: 0xf8fafc })); fold1.position.set(2.4, 0.48, -0.8); fold1.rotation.y = 0.2; S.add(fold1);
  const fold2 = box(0.38, 0.09, 0.28, lam({ color: 0x93c5fd })); fold2.position.set(2.4, 0.56, -0.8); fold2.rotation.y = -0.15; S.add(fold2);
  const pot = cyl(0.22, 0.3, 0.55, lam({ color: 0x9a5a34 }), 14); pot.position.set(-3.4, 0.27, -0.5); S.add(pot);
  const potTop = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), lam({ color: 0x7c4526 })); potTop.position.set(-3.4, 0.55, -0.5); potTop.scale.y = 0.6; S.add(potTop);
  // KIRANA dukaan — gali ke paar, muted (background depth)
  const kir = box(3.4, 3.6, 1.2, lam({ color: 0xcfd8dc })); kir.position.set(4.6, 1.8, -4.6); S.add(kir);
  const kirBase = box(3.6, 0.3, 1.4, lam({ color: 0x94a3b8 })); kirBase.position.set(4.6, 0.15, -4.6); S.add(kirBase);
  for (let r = 0; r < 2; r++) for (let cix = 0; cix < 2; cix++) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.9), bas({ color: r === 1 ? 0xd8c49a : 0x9db8c4 }));
    w.position.set(3.9 + cix * 1.4, 1.4 + r * 1.2, -3.98); S.add(w);
  }
  const kirDoor = box(1.0, 1.9, 0.1, lam({ color: 0x475569 })); kirDoor.position.set(4.6, 0.95, -3.98); S.add(kirDoor);
  const kirSign = boardMesh(1.9, 0.5, kiranaTex, true); kirSign.position.set(4.6, 3.15, -3.95); S.add(kirSign);
  // peeche ki kataar (midground) — dukaanon ke peeche, duniya gehri lage
  [[-7.5, 4.0, 0xb8a888], [7.0, 4.6, 0xa8a49a], [0.5, 3.6, 0xc4b49a]].forEach(([mx, mh, mcol]) => {
    const m = box(3.2, mh, 0.5, lam({ color: mcol })); m.position.set(mx, mh / 2, -7); S.add(m);
    const mw = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.7), bas({ color: 0x6b7a72 }));
    mw.position.set(mx + 0.7, 2.0, -6.72); S.add(mw);
  });
  const t1 = mkTree(-6.2, -3.6, 1.05); S.add(t1); galiTrees.push(t1);
  const t2 = mkTree(6.4, -3.4, 0.9); S.add(t2); galiTrees.push(t2);
  const t3 = mkTree(-5.0, -6.5, 1.3); S.add(t3); galiTrees.push(t3);
  // khambe + taar (sag) — gali ke upar
  const wireMat = lam({ color: 0x2c343c });
  const wirePole1 = cyl(0.04, 0.05, 4.2, lam({ color: 0x39434c })); wirePole1.position.set(-6.5, 2.1, -3.6); S.add(wirePole1);
  const wirePole2 = cyl(0.04, 0.05, 4.2, lam({ color: 0x39434c })); wirePole2.position.set(6.5, 2.1, -3.6); S.add(wirePole2);
  [[3.9, -3.5], [3.55, -3.9]].forEach(([wy, wz]) => {
    const segL = cyl(0.015, 0.015, 6.8, wireMat, 6); segL.rotation.z = Math.PI / 2 + 0.06; segL.position.set(-3.3, wy - 0.12, wz); S.add(segL);
    const segR = cyl(0.015, 0.015, 6.8, wireMat, 6); segR.rotation.z = Math.PI / 2 - 0.06; segR.position.set(3.3, wy - 0.12, wz); S.add(segR);
  });
}

// ---------- DUKAAN: counter/dher/bhaap (kapdon ka dher + press + latakta bulb) ----------
{
  const S = dukaanG;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 34), lam({ map: tex(dirt(23), 8, 8), color: 0x9c8a70 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, 3); S.add(ground);
  // peeche ki deewaar — NEECHI (2.8) taaki upar aasmaan + skyline dikhe
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 2.8), lam({ map: tex(plaster(43, 40), 2, 1), color: 0xe8dcc0 }));
  wall.position.set(0, 1.4, -3.8); S.add(wall);
  const bigSign = boardMesh(1.6, 0.28, pressSignTex, true); bigSign.position.set(-1.6, 2.3, -3.72); S.add(bigSign);
  // kapdon ki kataar deewaar par (peeche)
  mkClothesLine(S, -0.6, 3.4, 2.1, -3.7, [0xf8fafc, 0xfca5a5, 0x86efac, 0xfde68a]);
  // counter (lakdi) + upar kapdon ka dher
  const counter = box(2.8, 1.0, 0.8, lam({ color: 0x8a6844 })); counter.position.set(0.3, 0.5, -2.6); S.add(counter);
  const counterTop = box(3.0, 0.06, 0.9, lam({ color: 0xc9a06a })); counterTop.position.set(0.3, 1.03, -2.6); S.add(counterTop);
  // counter front band — teal patti + naam (s04/s05 me dikhe)
  const bandStripe = box(2.82, 0.14, 0.02, lam({ color: 0x0f766e })); bandStripe.position.set(0.3, 0.62, -2.19); S.add(bandStripe);
  const bandTex = textBoard(1024, 128, (g, w, h) => {
    g.fillStyle = '#134e4a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fde047'; g.font = 'bold 60px "Arial Narrow", Arial'; g.textAlign = 'center';
    g.fillText('RAJU PRESS', w / 2, 88);
  });
  const bandSign = boardMesh(1.2, 0.24, bandTex, true); bandSign.position.set(0.5, 0.68, -2.175); S.add(bandSign);
  // latakta bulb — cord + shade + bulb
  const cord = cyl(0.015, 0.015, 1.2, lam({ color: 0x1e293b }), 6); cord.position.set(0.3, 4.4, -2.8); S.add(cord);
  const shade = cyl(0.22, 0.3, 0.22, lam({ color: 0xfacc15 }), 12); shade.position.set(0.3, 4.1, -2.8); S.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), lam({ color: 0xfff7cc })); bulb.position.set(0.3, 3.95, -2.8); S.add(bulb);
  // side stool + kapdon ka stack
  const stool = cyl(0.3, 0.34, 0.45, lam({ color: 0x6d4a2c }), 12); stool.position.set(2.4, 0.22, -2.0); S.add(stool);
  const st1 = box(0.42, 0.09, 0.32, lam({ color: 0xfca5a5 })); st1.position.set(2.4, 0.5, -2.0); st1.rotation.y = 0.1; S.add(st1);
  const st2 = box(0.4, 0.09, 0.3, lam({ color: 0x86efac })); st2.position.set(2.4, 0.58, -2.0); st2.rotation.y = -0.2; S.add(st2);
  // peeche ki kataar + ped (depth)
  [[-5.5, 4.2, 0xb8a888], [5.0, 3.8, 0xa8a49a]].forEach(([mx, mh, mcol]) => {
    const m = box(3.2, mh, 0.5, lam({ color: mcol })); m.position.set(mx, mh / 2, -8); S.add(m);
    const mw = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.7), bas({ color: 0x6b7a72 }));
    mw.position.set(mx + 0.7, 2.0, -7.72); S.add(mw);
  });
  const ht = mkTree(-4.5, -3.0, 1.4); S.add(ht); dukaanTrees.push(ht);
  const ht2 = mkTree(4.8, -3.2, 1.1); S.add(ht2); dukaanTrees.push(ht2);
}

// =====================================================================
// PROPS — kapdon ka dher, press loha, ₹10 laal tag, bhaap, chidiya
// =====================================================================
// kapdon ka dher — counter par, mute rangon ke folded kapde (5 tah, halki tedhi)
const pileG = new THREE.Group(); scene.add(pileG);
{
  const cols = [0xf8fafc, 0x93c5fd, 0xfca5a5, 0x86efac, 0xfde68a];
  cols.forEach((col, i) => {
    const c = box(0.52 - (i % 2) * 0.05, 0.09, 0.4, lam({ color: col }));
    c.position.set(0.3 + (i % 2 ? 0.03 : -0.02), 1.1 + i * 0.09, -2.6);
    c.rotation.y = (i % 2 ? 0.12 : -0.1) * (i + 1) * 0.4;
    pileG.add(c);
  });
  // dher ke upar ek khula kapda (press hone wala)
  const open = box(0.6, 0.02, 0.45, lam({ color: 0xfef3c7 }));
  open.position.set(0.3, 1.56, -2.6); open.rotation.y = 0.08; pileG.add(open);
}
// press loha — metal base + body + handle (3D prop; haath/counter par rakha jata hai)
const ironG = new THREE.Group(); scene.add(ironG);
{
  const base = box(0.34, 0.05, 0.2, lam({ color: 0x374151 })); base.position.y = 0.025; ironG.add(base);
  const nose = box(0.1, 0.04, 0.2, lam({ color: 0x4b5563 })); nose.position.set(0.2, 0.02, 0); ironG.add(nose);
  const body = box(0.26, 0.09, 0.16, lam({ color: 0x6b7280 })); body.position.set(-0.02, 0.09, 0); ironG.add(body);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 8, 16, Math.PI), lam({ color: 0x1f2937 }));
  handle.position.set(-0.02, 0.13, 0); handle.rotation.y = Math.PI / 2; ironG.add(handle);
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 10), lam({ color: 0xdc2626 })); dial.position.set(-0.08, 0.14, 0); ironG.add(dial);
  ironG.visible = false;
}
// ---- ₹10 LAAL TAG (s05 me pop) — kapde par bandha, bada ----
const tagCanvas = document.createElement('canvas'); tagCanvas.width = 256; tagCanvas.height = 256;
{
  const g = tagCanvas.getContext('2d');
  g.fillStyle = '#dc2626'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
  g.strokeStyle = '#7f1d1d'; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 104, 0, 7); g.stroke();
  g.fillStyle = '#fef3c7'; g.font = 'bold 88px Arial'; g.textAlign = 'center'; g.fillText('₹10', 128, 158);
  g.fillStyle = '#fef3c7'; g.beginPath(); g.arc(128, 34, 10, 0, 7); g.fill(); // tag ka chhed
}
const tagTex = new THREE.CanvasTexture(tagCanvas); tagTex.colorSpace = THREE.SRGBColorSpace;
const tag10 = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: tagTex, transparent: true, depthWrite: false }));
tag10.visible = false; scene.add(tag10);
// tag ki dor (kapde se bandha) — s05 me tag ke saath
const tagString = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.3), bas({ color: 0x7f1d1d }));
tagString.visible = false; scene.add(tagString);

// ---- BHAAP (dher se) ----
const steamMat = () => new THREE.SpriteMaterial({ map: FX.puffTexture([[0, 'rgba(255,255,255,0.85)'], [1, 'rgba(255,255,255,0)']]), transparent: true, opacity: 0, depthWrite: false });
const steamSprites = [];
for (let i = 0; i < 3; i++) { const sp = new THREE.Sprite(steamMat()); sp.scale.setScalar(0.3); scene.add(sp); steamSprites.push(sp); }
// ---- CHIDIYA (s02 me aasmaan se guzarti — background movement) ----
const bird = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.07), bas({ color: 0x1f2937, side: THREE.DoubleSide }));
bird.visible = false; scene.add(bird);
// board chamak
const glintBoard = mkGlint(-2.6, 2.1, -4.0, 0.5);

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
  galiG.visible = (shot.set === 'gali');
  dukaanG.visible = (shot.set === 'dukaan');
  bulbLight.intensity = (shot.set === 'dukaan') ? 2 : 0;
  // ---- hamesha zinda background: ped + kapde hilte ----
  galiTrees.forEach((t, i) => { t.rotation.z = Math.sin(f * 0.03 + i * 1.7) * 0.018; });
  dukaanTrees.forEach((t, i) => { t.rotation.z = Math.sin(f * 0.03 + i * 2.3) * 0.018; });
  swayCloths.forEach((c, i) => { c.rotation.x = Math.sin(f * 0.05 + i * 1.3) * 0.08; });
  // ---- props default band ----
  glintBoard.material.opacity = 0;
  ironG.visible = false;
  pileG.visible = (shot.set === 'dukaan');
  tag10.visible = false; tagString.visible = false;
  steamSprites.forEach((sp) => { sp.material.opacity = 0; });
  bird.visible = false;
  const fl = FLASH[id];
  flashPlane.material.opacity = fl ? Math.max(0, 1 - Math.abs(f - fl.at) / (fl.dur / 2)) : 0;
  // bhaap — sirf dukaan set me, dher se upar (loop)
  if (shot.set === 'dukaan') {
    steamSprites.forEach((sp, i) => {
      const p = ((f * 0.008 + i * 0.33) % 1);
      sp.material.opacity = (1 - p) * 0.45;
      sp.position.set(0.3 + Math.sin(f * 0.05 + i * 2) * 0.08, 1.6 + p * 0.7, -2.6);
      sp.scale.setScalar(0.25 + p * 0.35);
    });
  }

  switch (id) {
    case 's01': { // HOOK (2.76s): aerial wide → tez push-in dukaan par; board bada; Raju bahar khada
      drawChar(rajuCard, 61, RAJU, 'smile', 'reach', 'hang', f, cp, -1.5, 0, -1.6, 1.05, 0, 0.35, 0, mouthFor(f), true);
      // padosi chhote kadmon se gali paar karta hai (background movement; daudna nahi)
      const nx = 3.5 - 2.0 * u;
      drawChar(neighCard, 63, NEIGH, 'neutral', 'hang', 'hang', f, cp, nx, 0, -3.2, 0.85, 0.5 + 0.08 * Math.sin(f * 0.15), null, 0, null, false);
      glintBoard.position.set(-2.6, 2.1, -4.0);
      glintBoard.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3);
      break;
    }
    case 's02': { // Raju CLOSE-UP, sly smile (squint + smirk), sar halka tilt; peeli pencil saaf dikhe
      drawChar(rajuCard, 61, RAJU, 'squint', 'hang', 'hang', f, cp, -1.5, 0, -1.6, 2.1, 0, null, 2, mouthFor(f), true);
      // chidiya aasmaan se guzarti hai + kapde hilte (peeche)
      bird.visible = true;
      bird.position.set(-4 + 8 * u, 5.5 + Math.sin(f * 0.1) * 0.2, -12);
      bird.rotation.z = Math.sin(f * 0.2) * 0.2;
      break;
    }
    case 's03': { // Raju intro MEDIUM — board + kataar peeche; press uthata hai (lift + loha haath me)
      const lift = 0.15 + 0.45 * M.surge(clamp((f - 130) / 30));
      drawChar(rajuCard, 61, RAJU, 'smile', 'reach', 'hang', f, cp, -0.9, 0, -2.0, 1.05, 0, lift, 0, mouthFor(f), true);
      // loha Raju ke dahine haath ke paas (card-right, lift ke saath upar)
      ironG.visible = true;
      ironG.position.set(-0.34, 1.28 + 0.28 * lift, -1.85);
      ironG.rotation.y = 0.3; ironG.rotation.z = -0.08;
      break;
    }
    case 's04': { // Process CLOSE-UP — dher + bhaap; Raju press chala raha hai (haath upar-neeche, ~0.5s cycle)
      const ph = f * 0.42;
      const lift = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(ph));
      drawChar(rajuCard, 61, RAJU, 'neutral', 'reach', 'hang', f, cp, -0.35, 0, -3.0, 1.0, 0, lift, 0, mouthFor(f), true);
      // loha dher par upar-neeche — haath ke saath sync
      ironG.visible = true;
      ironG.position.set(0.3, 1.58 + 0.10 * (0.5 + 0.5 * Math.sin(ph)), -2.6);
      ironG.rotation.y = 0.1;
      break;
    }
    case 's05': { // ₹10 TAG EXTREME CLOSE-UP — laal tag bada, peeche bhaap halki
      const pop = clamp(u * 4, 0, 1);
      tag10.visible = true;
      tag10.position.set(0.3, 1.35, -2.5);
      tag10.scale.setScalar(Math.max(0.01, pop));
      tag10.material.opacity = pop;
      tag10.rotation.z = Math.sin(f * 0.05) * 0.05;
      tagString.visible = true;
      tagString.position.set(0.3, 1.68, -2.51);
      tagString.material.opacity = pop;
      break;
    }
  }
  updateProxiesW();
  renderer.render(scene, camera);
};
window.TOTAL = TOTAL;
window.ready = Promise.resolve();
