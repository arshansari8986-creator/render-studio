// "WORLD V2 SAMPLE" — Press ke 3 shots, NAYI DUNIYA (FEEL badla — set badalna nahi).
// Purana look (v2_f82_s01end / v2_f1016 / v2_f1210 se): flat deewaar (bade plaster blobs),
//   neeche ~35% khaali zameen, flat grey skyline boxes, ek ghada + 5 kapde = poora shot.
// V2 me kya badla (har point checkable — qa/check.mjs me count hota hai):
//   1. DETAIL 2-3x: har shot me 12+ alag props (thela, crates, balti, cycle, nalka, ghada,
//      tokri, 2 kapde-lines, 2 poster, kirana, plant, stool, tank, antenna, pebbles, patches).
//   2. BACKGROUND 3 layers: paas deewaar/dukaan → beech makaan (tank+antenna+jalti khidki)
//      → door skyline + uske peeche 2nd silhouette row + haze (fog) + suraj + 2 cloud layers.
//   3. ROSHNI GEHRI: hook me NEECHA garam suraj (lambi chhaon) + thanda bounce (har frame
//      garam+thanda); ending me gehra sunset gradient + lamp glow + jalti khidki.
//   4. ZAMEEN TEXTURE: dirt canvas + 14 layered daag/patch + 20 kankar + tyre-track + geele daag.
//   5. Characters WAHI (Raju — teal kurta, peeli pencil, tape); mouth beat-level (NO phoneme
//      lip-sync); NO walk cycle, NO low angle, NO orbit. Cameras full s01/s14/s15/s22 EXACT.
// Contract: window.ready, window.renderFrame(f).
import * as THREE from 'three';
import * as FX from './fx.js';
import * as T from './toon.js';
import { idle, blinkAt, q, M, clamp } from './motion.js';
import { tex, dirt, tinRoof } from './paint.js';
import { TOTAL, shotAt, camFor, FLASH } from './story.js';

const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 300);
scene.add(camera);
const flashPlane = new THREE.Mesh(new THREE.PlaneGeometry(3, 5), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, depthTest: false, fog: false }));
flashPlane.position.set(0, 0, -0.5); flashPlane.renderOrder = 999; camera.add(flashPlane);
const lam = (o) => new THREE.MeshLambertMaterial(o);
const bas = (o) => new THREE.MeshBasicMaterial(o);

// ---------- global lights — V2: NEECHA garam suraj (lambi chhaon) + thanda bounce ----------
// Har frame me ek garam + ek thanda: suraj garam, bounce neela-thanda (opposite side se).
const hemi = new THREE.HemisphereLight(0xffe8c8, 0x8a7a5a, 1.05); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffd9a0, 1.7);
sun.position.set(-10, 4.5, 6); scene.add(sun); scene.add(sun.target);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -20; sun.shadow.camera.right = 20;
sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -20;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 95;
sun.shadow.bias = -0.0022; sun.shadow.normalBias = 0.02;
const bounce = new THREE.DirectionalLight(0x9db8d9, 0.4); // thanda — garam suraj ka counter
bounce.position.set(6, 6, 12); bounce.castShadow = false;
scene.add(bounce); scene.add(bounce.target);
// dukaan ke bahar wala lamp (shaam/sunset me ON — garam roshni + glow)
const lampLight = new THREE.PointLight(0xffc27a, 0, 8, 1.6);
lampLight.position.set(-0.2, 2.4, -3.9); scene.add(lampLight);

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
// 2D bar (x0,y0)->(x1,y1) plane z par — taar, cycle frame, thela handle ke liye
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
// V2 deewaar texture — NAYA canvas (paint.plaster NAHI): garam cream + soft patches,
// baarish ke lambe daag, 4 hairline dararein, neeche nami/grime, upar halki teal patti.
function wallV2Tex() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#e6d6b4'; g.fillRect(0, 0, 512, 256);
  // bade soft patches (purani marammat)
  for (let i = 0; i < 26; i++) {
    const x = (i * 97) % 512, y = (i * 61) % 256, rx = 22 + (i * 13) % 46, ry = 12 + (i * 7) % 22;
    g.fillStyle = i % 2 ? 'rgba(190,160,115,0.35)' : 'rgba(245,235,205,0.4)';
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill();
  }
  // upar teal patti (faded paint band)
  g.fillStyle = 'rgba(15,118,110,0.55)'; g.fillRect(0, 14, 512, 10);
  g.fillStyle = 'rgba(15,118,110,0.3)'; g.fillRect(0, 26, 512, 4);
  // baarish ke lambe daag — upar se neeche
  for (let i = 0; i < 8; i++) {
    const x = 30 + (i * 67) % 460, w = 4 + (i % 3) * 3, y0 = 20 + (i * 11) % 60, len = 60 + (i * 29) % 120;
    const gr = g.createLinearGradient(0, y0, 0, y0 + len);
    gr.addColorStop(0, 'rgba(110,84,50,0.30)'); gr.addColorStop(1, 'rgba(110,84,50,0)');
    g.fillStyle = gr; g.fillRect(x, y0, w, len);
  }
  // hairline dararein
  g.strokeStyle = 'rgba(90,64,38,0.45)'; g.lineWidth = 1.2;
  [[60, 30, 5], [300, 60, 4], [430, 20, 6], [180, 90, 5]].forEach(([x0, y0, n]) => {
    let x = x0, y = y0; g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < n; k++) { x += (k % 2 ? 7 : -6); y += 12 + (k * 3) % 10; g.lineTo(x, y); }
    g.stroke();
  });
  // ret-speckle
  for (let i = 0; i < 900; i++) {
    g.fillStyle = i % 2 ? 'rgba(120,90,55,0.10)' : 'rgba(255,252,240,0.10)';
    g.fillRect((i * 53) % 512, (i * 97) % 256, 1.5, 1.5);
  }
  // neeche nami + grime (canvas bottom = deewaar ka neeche)
  const gr = g.createLinearGradient(0, 170, 0, 256);
  gr.addColorStop(0, 'rgba(96,70,40,0)'); gr.addColorStop(1, 'rgba(96,70,40,0.5)');
  g.fillStyle = gr; g.fillRect(0, 170, 512, 86);
  for (let i = 0; i < 9; i++) {
    g.fillStyle = `rgba(90,64,36,${0.12 + (i % 4) * 0.04})`;
    g.beginPath(); g.ellipse((i * 61) % 512, 256 - (i * 7) % 24, 10 + (i % 3) * 9, 4 + (i % 2) * 4, 0, 0, 7); g.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

// =====================================================================
// CHARACTER CARDS (Raju WAHI — full build se character plumbing reuse)
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
function drawRajuProps(p, seed) {
  const Hb = T.headBlob(seed, 118, 0), hc = T.headCenter(seed);
  const cx = 300, earX = cx + Hb.a * 0.95, earY = hc - Hb.b * 0.1;
  p.stroke([[earX - 6, earY + 26], [earX + 16, earY - 52]], 9, '#facc15');
  p.stroke([[earX + 16, earY - 52], [earX + 20, earY - 64]], 9, '#f472b6');
  p.stroke([[earX - 6, earY + 26], [earX - 10, earY + 36]], 7, '#3a2a1c');
  const chin = hc + Hb.b, HH = 2 * Hb.b, bandY = chin + 0.22 * HH;
  p.poly([[cx - 96, bandY - 8], [cx + 96, bandY - 8], [cx + 96, bandY + 8], [cx - 96, bandY + 8]], '#fde047', 2);
  for (let x = cx - 88; x <= cx + 88; x += 16) p.stroke([[x, bandY - 8], [x, bandY + 8]], 2, '#1e293b');
  p.poly([[cx + 28, bandY + 8], [cx + 44, bandY + 8], [cx + 44, bandY + 0.62 * HH], [cx + 28, bandY + 0.62 * HH]], '#fde047', 2);
  for (let y = bandY + 24; y < bandY + 0.6 * HH; y += 18) p.stroke([[cx + 28, y], [cx + 44, y]], 2, '#1e293b');
}
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
const rajuCard = new Card(), neighCard = new Card(), custCard = new Card();
const ALL_CARDS = [rajuCard, neighCard, custCard];
// Raju WAHI (full build se): gehra teal kurta + cream shirt, garam skin #c88848 (chehra sabse garam),
// moochh, peeli pencil + naapne wala tape.
const RAJU = { tunic: '#2e6b62', shirt: '#fef3c7', skin: '#c88848', hair: '#1e1a20', hairStyle: 'thick', moustache: '#241a14', apron: '#e8e0cc' };
const NEIGH = { tunic: '#8a5d3b', shirt: '#f8fafc', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick' };
const CUST = { tunic: '#7a4a6f', shirt: '#f8fafc', skin: '#8a5a34', hair: '#1e1a20', hairStyle: 'thick', moustache: '#241a14' };

// ---- MUNH, beat-level — SAMPLE timeline (f 0-221) ----
// w01 (f<83): line start + "do lakh" number beat (f54-68) | w02 (f83-155): line start (f<98)
//   + "₹350" beat (mix 4.58 s → f137-150) | w03 (f156-221): line start (f<171), phir FREEZE smile.
function mouthFor(f) {
  if (f < 83) {
    if (f < 15) return 'o';
    if (f >= 54 && f < 68) return 'o';
    return null;
  }
  if (f < 156) {
    if (f < 98) return 'o';
    if (f >= 137 && f < 150) return 'o';
    return null;
  }
  if (f < 171) return 'o';
  return null;
}

// =====================================================================
// ENVS — V2 roshni: hook = NEECHA garam suraj (lambi chhaon), ending = sunset + lamp
// =====================================================================
const ENVS = {
  sunwarm: { bg: 0xd8e8ee, fogC: 0xd8e4e0, fogNear: 10, fogFar: 46, hemi: 1.05, hemiC: 0xffe8c8, hemiG: 0x8a7a5a, sun: 1.7, sunC: 0xffd9a0, sunPos: [-10, 4.5, 6], bounce: 0.4, bounceC: 0x9db8d9, expo: 1.12, sky: 'sunwarm', lamp: 0, sunDisc: [-16, 7, -27], sunDiscC: 0xfff3c8, sunDiscR: 1.6, winC: 0x9db8c4, litWinC: 0x7a8a80 },
  evening: { bg: 0xe8b078, fogC: 0xe8c098, fogNear: 10, fogFar: 44, hemi: 0.95, hemiC: 0xffe0b8, hemiG: 0x8a6a4a, sun: 1.25, sunC: 0xff9a50, sunPos: [-10, 3, 4], bounce: 0.25, bounceC: 0xffd9a0, expo: 1.08, sky: 'evening', lamp: 3.5, sunDisc: [-16, 4, -27], sunDiscC: 0xffb060, sunDiscR: 2.0, winC: 0xffd9a0, litWinC: 0xffd98a },
  sunset: { bg: 0xd88a5a, fogC: 0xdd9a68, fogNear: 10, fogFar: 48, hemi: 0.9, hemiC: 0xffc890, hemiG: 0x6a4a3a, sun: 1.0, sunC: 0xff7a30, sunPos: [-10, 2, 2], bounce: 0.2, bounceC: 0xffb070, expo: 1.06, sky: 'sunset', lamp: 5, sunDisc: [-16, 2.2, -27], sunDiscC: 0xff8a3c, sunDiscR: 2.6, winC: 0xffb070, litWinC: 0xffd98a },
};
const winGlassMat = bas({ color: 0x9db8c4, fog: false });
const litWinMat = bas({ color: 0x7a8a80, fog: false });
const lampBulbMat = bas({ color: 0xfff7cc, fog: false });
const lampGlow = mkGlint(-0.2, 2.42, -3.95, 1.1);
const sunDiscMat = bas({ color: 0xfff3c8, fog: false });
const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24), sunDiscMat);
sunDisc.position.set(-16, 7, -27); scene.add(sunDisc);
const sunGlow = mkGlint(-16, 7, -26.5, 6);
const applyEnv = (name) => {
  const e = ENVS[name] || ENVS.sunwarm;
  scene.background = new THREE.Color(e.bg);
  scene.fog = new THREE.Fog(e.fogC, e.fogNear, e.fogFar);
  hemi.intensity = e.hemi; hemi.color.set(e.hemiC); hemi.groundColor.set(e.hemiG);
  sun.intensity = e.sun; sun.color.set(e.sunC); sun.position.set(...e.sunPos);
  sun.target.position.set(0, 0, 0); sun.target.updateMatrixWorld();
  bounce.intensity = e.bounce; bounce.color.set(e.bounceC);
  renderer.toneMappingExposure = e.expo;
  lampLight.intensity = e.lamp;
  lampBulbMat.color.set(e.lamp > 0 ? 0xffe9a8 : 0xcfd8dc);
  lampGlow.material.opacity = e.lamp > 0 ? 0.55 : 0;
  winGlassMat.color.set(e.winC);
  litWinMat.color.set(e.litWinC);
  sunDisc.position.set(...e.sunDisc); sunDiscMat.color.set(e.sunDiscC);
  sunDisc.scale.setScalar(e.sunDiscR / 1.6);
  sunGlow.position.set(e.sunDisc[0], e.sunDisc[1], e.sunDisc[2] + 0.5);
  sunGlow.scale.setScalar(e.sunDiscR * 3);
  sunGlow.material.opacity = 0.5;
  return e;
};

// ---------- aasmaan (gradient) + badaal (2 layers) ----------
function skyTex(stops) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 512;
  const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 512);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr; g.fillRect(0, 0, 64, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const skyGeo = new THREE.PlaneGeometry(110, 30);
const skyMeshes = {
  sunwarm: new THREE.Mesh(skyGeo, bas({ map: skyTex([[0, '#6fa3d0'], [0.55, '#bcd8e8'], [1, '#ffe8c0']]), fog: false })),
  evening: new THREE.Mesh(skyGeo, bas({ map: skyTex([[0, '#c96a4a'], [0.55, '#f2a35e'], [1, '#ffe8c0']]), fog: false })),
  sunset: new THREE.Mesh(skyGeo, bas({ map: skyTex([[0, '#7a3a5a'], [0.5, '#e07840'], [1, '#ffd98a']]), fog: false })),
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
const farCloudMat = new THREE.SpriteMaterial({ map: FX.puffTexture([[0, 'rgba(255,235,210,0.7)'], [1, 'rgba(255,235,210,0)']]), transparent: true, opacity: 0.45, depthWrite: false, fog: false });
const farClouds = [];
for (let i = 0; i < 4; i++) {
  const sp = new THREE.Sprite(farCloudMat);
  sp.position.set(-18 + i * 12, 9.5 + (i % 2) * 1.5, -28);
  sp.scale.set(12 + (i % 2) * 4, 3.2, 1);
  scene.add(sp); farClouds.push(sp);
}

// =====================================================================
// BACKGROUND DEPTH — 3 layers (V2, NAYA)
//   L1 paas: dukaan deewaar + kirana + side makaan (z -4..-6)
//   L2 beech: makaan row z=-8 (tank + antenna + jalti khidki) + ped
//   L3 door: skyline z=-19 (khidkiyan) + 2nd silhouette row z=-27 + haze + suraj + badaal
// =====================================================================
function mkTree(x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s);
  const trunk = cyl(0.09, 0.13, 1.6, lam({ color: 0x6d4a2c })); trunk.position.y = 0.8; g.add(trunk);
  const cols = [0x4a6b2f, 0x5a7a35, 0x3d5c2a, 0x6b8a3a, 0x55702e];
  [[0, 2.2, 0, 0.85], [-0.55, 1.85, 0.1, 0.6], [0.55, 1.9, -0.1, 0.65], [0.1, 2.6, 0, 0.55], [-0.2, 2.35, 0.35, 0.5]].forEach(([px, py, pz, r], i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), lam({ color: cols[i % 5] }));
    m.position.set(px, py, pz); g.add(m);
  });
  return g;
}
// L3 far: skyline (khidkiyon ke saath) + uske peeche 2nd silhouette row (haze me dooba)
const skylineG = new THREE.Group(); scene.add(skylineG);
{
  const skyCols = [0xb8a888, 0xa89a80, 0x9a8f7a, 0xc4b49a, 0x8a7f6e];
  const skySpots = [[-22.5, 7], [-17.5, 9], [-12.5, 6], [-7.5, 8], [-2.5, 10], [2.5, 7], [7.5, 9], [12.5, 6], [17.5, 8], [22.5, 7]];
  skySpots.forEach(([sx, sh], i) => {
    const b = box(5.5, sh, 1.2, lam({ color: skyCols[i % skyCols.length] }));
    b.position.set(sx, sh / 2, -19); skylineG.add(b);
    for (let r = 0; r < Math.floor(sh / 1.6); r++) for (let cix = 0; cix < 3; cix++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.6), litWinMat);
      win.position.set(sx - 1.2 + cix * 1.2, 1.2 + r * 1.6, -18.35); skylineG.add(win);
    }
  });
  // 2nd silhouette row — door, bina khidki, fog+haze me (V2: depth ki dusri parat)
  const silCols = [0x8a6f7a, 0x7a5f6e, 0x9a7f72, 0x6e5a6a];
  [[-24, 11], [-15, 8.5], [-6, 12], [3, 9], [12, 11.5], [21, 9.5]].forEach(([sx, sh], i) => {
    const b = box(6.5, sh, 1.0, lam({ color: silCols[i % silCols.length] }));
    b.position.set(sx, sh / 2, -27); skylineG.add(b);
  });
}
// L2 beech: makaan row z=-8 — tank + antenna + khidki (shaam/sunset me jalti hain)
const midG = new THREE.Group(); scene.add(midG);
{
  [[-7.5, 4.0, 0xb8a888], [0.5, 3.6, 0xc4b49a], [7.0, 4.6, 0xa8a49a]].forEach(([mx, mh, mcol]) => {
    const m = box(3.2, mh, 0.5, lam({ color: mcol })); m.position.set(mx, mh / 2, -8); midG.add(m);
    const mw = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.7), litWinMat);
    mw.position.set(mx + 0.7, 2.0, -7.72); midG.add(mw);
    const mw2 = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.7), litWinMat);
    mw2.position.set(mx - 0.7, 1.3, -7.72); midG.add(mw2);
    // chhat ki kinari (parapet) — makaan ki pehchaan
    const par = box(3.3, 0.18, 0.55, lam({ color: 0x8a7a5a })); par.position.set(mx, mh + 0.09, -8); midG.add(par);
  });
  // paani ki tanki — beech wale makaan ki chhat par (V2 prop)
  const tank = cyl(0.5, 0.5, 0.9, lam({ color: 0x374151 }), 14); tank.position.set(0.5, 4.05, -8); midG.add(tank);
  const tankTop = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: 0x4b5563 }));
  tankTop.position.set(0.5, 4.5, -8); midG.add(tankTop);
  for (const lx of [-0.1, 1.1]) {
    const leg = cyl(0.04, 0.04, 0.5, lam({ color: 0x4b5563 }), 6); leg.position.set(lx, 3.6, -8); midG.add(leg);
  }
  // antenna — left wale makaan par (V2 prop)
  const ant = cyl(0.02, 0.02, 1.6, lam({ color: 0x39434c }), 6); ant.position.set(-7.5, 4.8, -8); midG.add(ant);
  const antBar = cyl(0.015, 0.015, 0.9, lam({ color: 0x39434c }), 6); antBar.rotation.z = Math.PI / 2; antBar.position.set(-7.5, 5.3, -8); midG.add(antBar);
  const antBar2 = cyl(0.015, 0.015, 0.6, lam({ color: 0x39434c }), 6); antBar2.rotation.z = Math.PI / 2; antBar2.position.set(-7.5, 5.0, -8); midG.add(antBar2);
}

// =====================================================================
// GALI SET — V2 (NAYA code: deewaar texture, zameen patches, props 2-3x)
// =====================================================================
const galiG = new THREE.Group(); scene.add(galiG);
const swayCloths = [];
const galiTrees = [];
let lakhBoard = null;
function mkClothesLine(S, x0, x1, y, z, cols, cw = 0.34, ch = 0.5) {
  const g = new THREE.Group(); S.add(g);
  const rope = cyl(0.015, 0.015, x1 - x0, lam({ color: 0x6b5a44 }), 6);
  rope.rotation.z = Math.PI / 2; rope.position.set((x0 + x1) / 2, y, z); g.add(rope);
  const n = cols.length;
  cols.forEach((col, i) => {
    const cx = x0 + (x1 - x0) * (i + 0.5) / n;
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(cw, ch), lam({ color: col, side: THREE.DoubleSide }));
    cloth.position.set(cx, y - ch / 2 - 0.01, z); g.add(cloth);
    const pin1 = box(0.04, 0.06, 0.02, lam({ color: 0xd97706 })); pin1.position.set(cx - 0.12, y - 0.02, z + 0.01); g.add(pin1);
    const pin2 = box(0.04, 0.06, 0.02, lam({ color: 0xd97706 })); pin2.position.set(cx + 0.12, y - 0.02, z + 0.01); g.add(pin2);
    swayCloths.push(cloth);
  });
  return g;
}
{
  const S = galiG;
  // ---- ZAMEEN V2: dirt canvas + 14 layered patches + 20 kankar + tyre-track + geele daag ----
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 34), lam({ map: tex(dirt(17), 8, 8), color: 0x9c8a70 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, 3); ground.receiveShadow = true; S.add(ground);
  const PATCHES = [
    [-2.5, 0.5, 1.2, 0.7, 0x6b543a, 0.35], [1.0, 2.0, 1.5, 0.8, 0x7a6547, 0.3], [-4.0, -1.0, 1.0, 0.6, 0x5a4630, 0.4],
    [3.0, -2.0, 1.3, 0.7, 0x8a7a5a, 0.3], [0.2, -0.5, 0.9, 0.5, 0x4a3a28, 0.35], [-1.0, 3.0, 1.6, 0.9, 0x9a8a68, 0.25],
    [4.5, 0.5, 1.1, 0.6, 0x6b543a, 0.3], [-5.5, 1.5, 1.2, 0.7, 0x7a6547, 0.3], [2.0, 3.5, 1.4, 0.8, 0x5a4630, 0.3],
    [-0.5, -2.5, 1.0, 0.6, 0x8a7a5a, 0.35], [5.5, -1.5, 1.0, 0.6, 0x6b543a, 0.3], [-3.0, 2.5, 1.3, 0.7, 0x4a3a28, 0.3],
    [1.5, -3.0, 0.9, 0.5, 0x9a8a68, 0.25], [-6.0, -2.5, 1.1, 0.6, 0x7a6547, 0.3],
  ];
  PATCHES.forEach(([px, pz, rx, rz, col, op], i) => {
    const p = new THREE.Mesh(new THREE.CircleGeometry(1, 20), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false }));
    p.rotation.x = -Math.PI / 2; p.scale.set(rx, rz, 1); p.position.set(px, 0.005 + i * 0.0004, pz); S.add(p);
  });
  // geele daag (nalka + balti ke paas) — dark, halki chamak
  [[-3.9, -2.3, 0.55, 0.4], [1.9, -0.2, 0.45, 0.32]].forEach(([px, pz, rx, rz]) => {
    const p = new THREE.Mesh(new THREE.CircleGeometry(1, 20), new THREE.MeshBasicMaterial({ color: 0x2e3a48, transparent: true, opacity: 0.45, depthWrite: false }));
    p.rotation.x = -Math.PI / 2; p.scale.set(rx, rz, 1); p.position.set(px, 0.012, pz); S.add(p);
  });
  // kankar — 20, deterministic (seeded LCG)
  let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const pebCols = [0x8a7a68, 0x6b5a44, 0x9a8a72, 0x5a4a38];
  for (let i = 0; i < 20; i++) {
    const px = -6 + rnd() * 12, pz = -3.5 + rnd() * 7.5;
    const peb = box(0.06 + rnd() * 0.07, 0.03 + rnd() * 0.02, 0.05 + rnd() * 0.05, lam({ color: pebCols[i % 4] }));
    peb.position.set(px, 0.02, pz); peb.rotation.y = rnd() * 3; S.add(peb);
  }
  // sadak + dashes + tyre-track (2 gehri lakeerein — gaadiyan guzarti hain)
  const road = new THREE.Mesh(new THREE.PlaneGeometry(40, 3.4), lam({ color: 0x4a4640 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, 1.8); S.add(road);
  [1.15, 2.45].forEach((tz) => {
    const tr = new THREE.Mesh(new THREE.PlaneGeometry(40, 0.35), new THREE.MeshBasicMaterial({ color: 0x2e2a26, transparent: true, opacity: 0.55, depthWrite: false }));
    tr.rotation.x = -Math.PI / 2; tr.position.set(0, 0.004, tz); S.add(tr);
  });
  for (let i = 0; i < 8; i++) {
    const dash = box(1.1, 0.012, 0.14, bas({ color: 0xe2e8f0 }));
    dash.position.set(-14 + i * 4, 0.008, 1.8); S.add(dash);
  }
  [[0, 0.35, 9, 0.5], [0, 3.25, 9, 0.5]].forEach(([px, pz, pw, pd]) => {
    const dust = new THREE.Mesh(new THREE.PlaneGeometry(pw, pd), new THREE.MeshBasicMaterial({ color: 0xb8a888, transparent: true, opacity: 0.4, depthWrite: false }));
    dust.rotation.x = -Math.PI / 2; dust.position.set(px, 0.006, pz); S.add(dust);
  });
  // ---- DUKAAN BUILDING (V2 deewaar texture — daag/darar/grime/teal patti) ----
  const dwall = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 3.2), lam({ map: wallV2Tex(), color: 0xffffff }));
  dwall.position.set(-1.5, 1.6, -4.3); dwall.receiveShadow = true; S.add(dwall);
  for (const px of [-4.6, 1.6]) {
    const pil = box(0.28, 3.2, 0.28, lam({ color: 0xd8c49a })); pil.position.set(px, 1.6, -4.15); S.add(pil);
  }
  const roof = box(7.0, 0.14, 2.4, lam({ map: tex(tinRoof(53), 2, 1), color: 0x9a3412 })); roof.position.set(-1.5, 3.28, -3.6); S.add(roof);
  const roofEdge = box(7.0, 0.1, 0.08, lam({ color: 0x7c2d12 })); roofEdge.position.set(-1.5, 3.22, -2.42); S.add(roofEdge);
  // chhat par paani ki tanki (chhoti) + gamle — chhat bhi khaali nahi
  const roofTank = cyl(0.35, 0.35, 0.6, lam({ color: 0x1f2937 }), 12); roofTank.position.set(-3.6, 3.65, -4.0); S.add(roofTank);
  const roofPot = cyl(0.12, 0.09, 0.22, lam({ color: 0x9a5a34 }), 10); roofPot.position.set(0.9, 3.45, -4.0); S.add(roofPot);
  const roofPlant = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), lam({ color: 0x4a6b2f })); roofPlant.position.set(0.9, 3.62, -4.0); S.add(roofPlant);
  // darwaza — panel wala (2 inset) + knob
  const door = box(1.0, 2.0, 0.1, lam({ color: 0x7c2d12 })); door.position.set(-1.2, 1.0, -4.2); S.add(door);
  [[-1.2, 1.45], [-1.2, 0.65]].forEach(([dx, dy]) => {
    const pan = box(0.7, 0.55, 0.03, lam({ color: 0x5f2110 })); pan.position.set(dx, dy, -4.14); S.add(pan);
  });
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), lam({ color: 0xfacc15 })); knob.position.set(-0.85, 1.0, -4.12); S.add(knob);
  // khidki — garam glass (env se rang badalta hai) + cross bar
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), winGlassMat); win.position.set(0.3, 1.9, -4.22); S.add(win);
  const winBar = box(0.06, 1.0, 0.12, lam({ color: 0x2f4a4a })); winBar.position.set(0.3, 1.9, -4.2); S.add(winBar);
  const winBar2 = box(1.0, 0.06, 0.12, lam({ color: 0x2f4a4a })); winBar2.position.set(0.3, 1.9, -4.2); S.add(winBar2);
  // ---- boards / signs (compare ke liye positions full jaisi) ----
  const lakhTex = textBoard(512, 320, (g, w, h) => {
    g.fillStyle = '#134e4a'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#facc15'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
    g.textAlign = 'center'; g.fillStyle = '#facc15';
    g.font = 'bold 84px Arial'; g.fillText('₹2,00,000', w / 2, 140);
    g.fillStyle = '#f8fafc'; g.font = 'bold 44px Arial'; g.fillText('EK MAHINE MEIN', w / 2, 230);
  });
  const pressSignTex = textBoard(1024, 170, (g, w, h) => {
    g.fillStyle = '#7f1d1d'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fef3c7'; g.font = 'bold 92px "Arial Narrow", Arial'; g.textAlign = 'center';
    g.fillText('RAJU PRESS', w / 2, 112);
  });
  const pressSign = boardMesh(2.2, 0.45, pressSignTex, true); pressSign.position.set(-1.5, 2.95, -4.24); S.add(pressSign);
  const lakhBoardMesh = boardMesh(1.8, 1.08, lakhTex, true); lakhBoardMesh.position.set(-2.7, 1.85, -4.22); S.add(lakhBoardMesh); lakhBoard = lakhBoardMesh;
  // ---- POSTERS (V2 — deewaar khaali nahi) ----
  const chaiTex = textBoard(256, 320, (g, w, h) => {
    g.fillStyle = '#fef3c7'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#dc2626'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
    g.textAlign = 'center'; g.fillStyle = '#dc2626';
    g.font = 'bold 72px Arial'; g.fillText('CHAI', w / 2, 100);
    g.fillStyle = '#1e293b'; g.font = 'bold 88px Arial'; g.fillText('₹5', w / 2, 210);
    g.fillStyle = '#92400e'; g.fillRect(w / 2 - 40, 240, 80, 44);
    g.fillStyle = '#f8fafc'; g.fillRect(w / 2 - 40, 240, 80, 10);
  });
  const chaiPoster = boardMesh(0.55, 0.7, chaiTex, true); chaiPoster.position.set(0.9, 1.6, -4.24); S.add(chaiPoster);
  const p10Tex = textBoard(256, 320, (g, w, h) => {
    g.fillStyle = '#134e4a'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#facc15'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16);
    g.textAlign = 'center'; g.fillStyle = '#fde047';
    g.font = 'bold 56px Arial'; g.fillText('PRESS', w / 2, 96);
    g.fillStyle = '#f8fafc'; g.font = 'bold 80px Arial'; g.fillText('₹10', w / 2, 200);
    g.font = 'bold 30px Arial'; g.fillText('HAR KAPDA', w / 2, 260);
  });
  const p10Poster = boardMesh(0.6, 0.75, p10Tex, true); p10Poster.position.set(-4.0, 1.5, -4.24); S.add(p10Poster);
  // ---- kapdon ki kataar x2 (V2: dusri line left — BOARD se door, x -4.6..-3.7) ----
  mkClothesLine(S, -1.6, 1.2, 2.3, -3.5, [0xf8fafc, 0x93c5fd, 0xfca5a5, 0x86efac, 0xfde68a]);
  mkClothesLine(S, -4.6, -3.7, 2.45, -3.9, [0xfca5a5, 0x86efac, 0xf8fafc], 0.30, 0.45);
  // ---- THELA (haath-gaadi, kapdon ke saath) — V2 prop ----
  const thela = new THREE.Group(); thela.position.set(2.7, 0, -1.0); thela.rotation.y = 0.5; S.add(thela);
  {
    const bed = box(1.4, 0.1, 0.8, lam({ color: 0x8a6844 })); bed.position.y = 0.55; thela.add(bed);
    [-0.38, 0.38].forEach((rz) => {
      const rail = box(1.4, 0.12, 0.04, lam({ color: 0x6d5136 })); rail.position.set(0, 0.64, rz); thela.add(rail);
    });
    [-0.42, 0.42].forEach((rz) => {
      const wh = cyl(0.32, 0.32, 0.06, lam({ color: 0x1f2937 }), 16); wh.rotation.x = Math.PI / 2; wh.position.set(0, 0.32, rz); thela.add(wh);
      const hub = cyl(0.08, 0.08, 0.08, lam({ color: 0x9ca3af }), 10); hub.rotation.x = Math.PI / 2; hub.position.set(0, 0.32, rz); thela.add(hub);
    });
    thela.add(bar2D(-0.7, 0.55, -1.25, 0.12, 0.3, lam({ color: 0x6d5136 }), 0.03));
    thela.add(bar2D(-0.7, 0.55, -1.25, 0.12, -0.3, lam({ color: 0x6d5136 }), 0.03));
    const f1 = box(0.5, 0.09, 0.4, lam({ color: 0xf8fafc })); f1.position.set(0.2, 0.65, 0); f1.rotation.y = 0.15; thela.add(f1);
    const f2 = box(0.46, 0.09, 0.38, lam({ color: 0x93c5fd })); f2.position.set(0.2, 0.73, 0); f2.rotation.y = -0.1; thela.add(f2);
    const f3 = box(0.4, 0.09, 0.34, lam({ color: 0xfca5a5 })); f3.position.set(-0.3, 0.65, 0.1); f3.rotation.y = 0.3; thela.add(f3);
  }
  // ---- CRATES (dabbe, stack) — V2 prop ----
  {
    const c1 = box(0.55, 0.45, 0.55, lam({ color: 0x8a6844 })); c1.position.set(-4.3, 0.22, -2.2); S.add(c1);
    const c1e = box(0.57, 0.06, 0.57, lam({ color: 0x6d5136 })); c1e.position.set(-4.3, 0.45, -2.2); S.add(c1e);
    const c2 = box(0.45, 0.4, 0.45, lam({ color: 0x9a7a52 })); c2.position.set(-4.28, 0.67, -2.2); c2.rotation.y = 0.3; S.add(c2);
    const c3 = box(0.35, 0.3, 0.35, lam({ color: 0x7a5f3e })); c3.position.set(-4.3, 1.02, -2.2); c3.rotation.y = -0.2; S.add(c3);
    const sack = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), lam({ color: 0xc2b280 }));
    sack.scale.set(1, 0.75, 0.9); sack.position.set(-3.6, 0.22, -2.3); S.add(sack);
  }
  // ---- BALTI + mug — V2 prop ----
  {
    const b = cyl(0.16, 0.13, 0.3, lam({ color: 0x64748b }), 14); b.position.set(1.9, 0.15, -0.6); S.add(b);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.015, 8, 16), lam({ color: 0x475569 }));
    rim.rotation.x = Math.PI / 2; rim.position.set(1.9, 0.3, -0.6); S.add(rim);
    const mug = cyl(0.06, 0.05, 0.12, lam({ color: 0xdc2626 }), 10); mug.position.set(2.15, 0.06, -0.35); S.add(mug);
  }
  // ---- CYCLE (deewaar se lagi) — V2 prop ----
  {
    const cy = new THREE.Group(); cy.position.set(1.7, 0, -3.85); cy.rotation.y = -0.35; cy.rotation.z = 0.1; S.add(cy);
    const wheelMat = lam({ color: 0x1f2937 });
    [-0.55, 0.55].forEach((wx) => {
      const wh = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.03, 8, 20), wheelMat);
      wh.position.set(wx, 0.34, 0); cy.add(wh);
      for (let s = 0; s < 3; s++) {
        const sp = box(0.02, 0.62, 0.015, lam({ color: 0x9ca3af }));
        sp.position.set(wx, 0.34, 0); sp.rotation.z = s * Math.PI / 3; cy.add(sp);
      }
    });
    const fr = lam({ color: 0x166534 });
    cy.add(bar2D(-0.55, 0.34, 0.05, 0.72, 0, fr, 0.025));
    cy.add(bar2D(0.55, 0.34, 0.05, 0.72, 0, fr, 0.025));
    cy.add(bar2D(-0.55, 0.34, 0.55, 0.34, 0, fr, 0.025));
    cy.add(bar2D(0.05, 0.72, 0.55, 0.34, 0, fr, 0.025));
    cy.add(bar2D(0.05, 0.72, -0.15, 0.72, 0, fr, 0.025));
    const seat = box(0.22, 0.04, 0.1, lam({ color: 0x451a03 })); seat.position.set(-0.15, 0.76, 0); cy.add(seat);
    const hb = box(0.08, 0.04, 0.4, lam({ color: 0x9ca3af })); hb.position.set(0.58, 0.78, 0); cy.add(hb);
  }
  // ---- NALKA (hand pump) + geela farsh — V2 prop ----
  {
    const base = box(0.3, 0.15, 0.3, lam({ color: 0x6b7280 })); base.position.set(-3.9, 0.07, -2.8); S.add(base);
    const pipe = cyl(0.05, 0.05, 1.1, lam({ color: 0x374151 }), 10); pipe.position.set(-3.9, 0.7, -2.8); S.add(pipe);
    S.add(bar2D(-3.9, 1.15, -3.55, 1.38, -2.8, lam({ color: 0x4b5563 }), 0.03));
    const spout = cyl(0.035, 0.035, 0.28, lam({ color: 0x4b5563 }), 8); spout.rotation.z = Math.PI / 2; spout.position.set(-3.72, 0.95, -2.8); S.add(spout);
    const spoutTip = cyl(0.05, 0.035, 0.12, lam({ color: 0x4b5563 }), 8); spoutTip.position.set(-3.58, 0.9, -2.8); S.add(spoutTip);
  }
  // ---- ghada + tokri (purane, V2 me bhi — foreground) ----
  const basket = cyl(0.32, 0.26, 0.45, lam({ color: 0x8a6844 }), 14); basket.position.set(2.4, 0.22, -0.8); S.add(basket);
  const fold1 = box(0.4, 0.09, 0.3, lam({ color: 0xf8fafc })); fold1.position.set(2.4, 0.48, -0.8); fold1.rotation.y = 0.2; S.add(fold1);
  const fold2 = box(0.38, 0.09, 0.28, lam({ color: 0x93c5fd })); fold2.position.set(2.4, 0.56, -0.8); fold2.rotation.y = -0.15; S.add(fold2);
  const pot = cyl(0.22, 0.3, 0.55, lam({ color: 0x9a5a34 }), 14); pot.position.set(-3.4, 0.27, -0.5); S.add(pot);
  const potTop = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), lam({ color: 0x7c4526 })); potTop.position.set(-3.4, 0.55, -0.5); potTop.scale.y = 0.6; S.add(potTop);
  // ---- gamle wala paudha + stool + folded stack (dukaan ke paas) ----
  {
    const pp = cyl(0.18, 0.14, 0.3, lam({ color: 0x9a5a34 }), 12); pp.position.set(1.3, 0.15, -3.8); S.add(pp);
    [[0, 0.45, 0, 0.16], [-0.1, 0.38, 0.08, 0.12], [0.1, 0.4, -0.06, 0.13]].forEach(([px, py, pz, r]) => {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), lam({ color: 0x4a6b2f }));
      leaf.position.set(1.3 + px, py, -3.8 + pz); S.add(leaf);
    });
    const stool = cyl(0.28, 0.32, 0.42, lam({ color: 0x6d4a2c }), 12); stool.position.set(0.9, 0.21, -3.55); S.add(stool);
    const sf1 = box(0.4, 0.08, 0.3, lam({ color: 0xfca5a5 })); sf1.position.set(0.9, 0.46, -3.55); sf1.rotation.y = 0.1; S.add(sf1);
    const sf2 = box(0.38, 0.08, 0.28, lam({ color: 0x86efac })); sf2.position.set(0.9, 0.53, -3.55); sf2.rotation.y = -0.15; S.add(sf2);
  }
  // ---- LAMP (deewaar par, darwaze ke paas) — shaam/sunset me jalta hai ----
  {
    const bracket = box(0.06, 0.06, 0.25, lam({ color: 0x1f2937 })); bracket.position.set(-0.2, 2.62, -4.05); S.add(bracket);
    const shade = cyl(0.08, 0.22, 0.18, lam({ color: 0x166534 }), 12); shade.position.set(-0.2, 2.52, -3.95); S.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), lampBulbMat); bulb.position.set(-0.2, 2.42, -3.95); S.add(bulb);
  }
  // ---- SHELF (khidki ke neeche, deewaar par) — bottle + dibba + folded kapda (V2 prop) ----
  // w02 close-up ke background me bhi detail ho — khaali deewaar nahi.
  {
    const plank = box(0.9, 0.05, 0.25, lam({ color: 0x8a6844 })); plank.position.set(0.3, 1.15, -4.1); S.add(plank);
    const bA = cyl(0.055, 0.055, 0.2, lam({ color: 0x166534 }), 10); bA.position.set(0.05, 1.28, -4.1); S.add(bA);
    const bB = cyl(0.05, 0.05, 0.18, lam({ color: 0x1d4ed8 }), 10); bB.position.set(0.3, 1.27, -4.1); S.add(bB);
    const dib = box(0.16, 0.12, 0.16, lam({ color: 0xb45309 })); dib.position.set(0.55, 1.24, -4.1); S.add(dib);
    const sCloth = box(0.2, 0.07, 0.18, lam({ color: 0xfef3c7 })); sCloth.position.set(0.78, 1.21, -4.1); sCloth.rotation.y = 0.2; S.add(sCloth);
  }
  // ---- KIRANA dukaan (gali ke paar, muted background) ----
  const kir = box(3.4, 3.6, 1.2, lam({ color: 0xcfd8dc })); kir.position.set(4.6, 1.8, -4.6); S.add(kir);
  const kirBase = box(3.6, 0.3, 1.4, lam({ color: 0x94a3b8 })); kirBase.position.set(4.6, 0.15, -4.6); S.add(kirBase);
  for (let r = 0; r < 2; r++) for (let cix = 0; cix < 2; cix++) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.9), bas({ color: r === 1 ? 0xd8c49a : 0x9db8c4 }));
    w.position.set(3.9 + cix * 1.4, 1.4 + r * 1.2, -3.98); S.add(w);
  }
  const kirDoor = box(1.0, 1.9, 0.1, lam({ color: 0x475569 })); kirDoor.position.set(4.6, 0.95, -3.98); S.add(kirDoor);
  const kiranaTex = textBoard(768, 200, (g, w, h) => {
    g.fillStyle = '#e2e8f0'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#475569'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16);
    g.textAlign = 'center'; g.fillStyle = '#475569';
    g.font = 'bold 100px Arial'; g.fillText('KIRANA', w / 2, 118);
    g.fillStyle = '#334155'; g.font = 'bold 40px Arial'; g.fillText('STORE • CHAI', w / 2, 172);
  });
  const kirSign = boardMesh(1.9, 0.5, kiranaTex, true); kirSign.position.set(4.6, 3.15, -3.95); S.add(kirSign);
  // kirana ke saamne bori + dabba (aur depth)
  const sack2 = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), lam({ color: 0xd6c9a8 }));
  sack2.scale.set(1, 0.8, 0.9); sack2.position.set(3.4, 0.22, -3.9); S.add(sack2);
  const kbox = box(0.4, 0.35, 0.4, lam({ color: 0x8a6844 })); kbox.position.set(5.9, 0.17, -3.9); S.add(kbox);
  // ---- ped + jhaadi ----
  const t1 = mkTree(-6.2, -3.6, 1.05); S.add(t1); galiTrees.push(t1);
  const t2 = mkTree(6.4, -3.4, 0.9); S.add(t2); galiTrees.push(t2);
  const t3 = mkTree(-5.0, -6.5, 1.3); S.add(t3); galiTrees.push(t3);
  const bush = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), lam({ color: 0x3d5c2a }));
  bush.scale.set(1.3, 0.7, 1); bush.position.set(5.8, 0.3, -3.2); S.add(bush);
  // ---- khambe + taar (3 wires, sag wale segments) ----
  const wireMat = lam({ color: 0x2c343c });
  const wirePole1 = cyl(0.04, 0.05, 4.2, lam({ color: 0x39434c })); wirePole1.position.set(-6.5, 2.1, -3.6); S.add(wirePole1);
  const wirePole2 = cyl(0.04, 0.05, 4.2, lam({ color: 0x39434c })); wirePole2.position.set(6.5, 2.1, -3.6); S.add(wirePole2);
  // cross-arms (khambe ki baahein)
  [-6.5, 6.5].forEach((px) => {
    const arm = box(0.9, 0.05, 0.05, lam({ color: 0x39434c })); arm.position.set(px, 3.9, -3.6); S.add(arm);
  });
  [[3.9, -3.5], [3.55, -3.9], [3.2, -3.2]].forEach(([wy, wz]) => {
    S.add(bar2D(-6.5, wy, 0, wy - 0.35, wz, wireMat, 0.015));
    S.add(bar2D(0, wy - 0.35, 6.5, wy, wz, wireMat, 0.015));
  });
  // dhoop me tairte dust motes (V2 — roshni dikhti hai)
  var motes = [];
  for (let i = 0; i < 8; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffe9b0 }));
    sp.position.set(-3 + (i * 0.9) % 4.5, 1.2 + (i % 3) * 0.7, -3 + (i % 2) * 1.2);
    sp.scale.setScalar(0.12 + (i % 3) * 0.05);
    scene.add(sp); motes.push(sp);
  }
}

// =====================================================================
// PROPS — suit (hero variant: halka jacket, safed shirt unlit, tie), ₹350 tag, rack
// =====================================================================
function mkSuit(w, h, color, hero = false) {
  const g = new THREE.Group();
  const jacket = box(w, h, 0.08, lam({ color })); g.add(jacket);
  const lapCol = hero ? 0x9db8d9 : 0x2c4a6b;
  const lapL = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.3), lam({ color: lapCol, side: THREE.DoubleSide }));
  lapL.position.set(-0.09, h * 0.22, 0.045); lapL.rotation.z = 0.35; g.add(lapL);
  const lapR = lapL.clone(); lapR.position.x = 0.09; lapR.rotation.z = -0.35; g.add(lapR);
  const shirtW = hero ? 0.2 : 0.14, shirtH = hero ? 0.3 : 0.2;
  const shirt = new THREE.Mesh(new THREE.PlaneGeometry(shirtW, shirtH), hero ? bas({ color: 0xffffff, side: THREE.DoubleSide }) : lam({ color: 0xf8fafc, side: THREE.DoubleSide }));
  shirt.position.set(0, h * 0.28, 0.045); g.add(shirt);
  if (hero) {
    const tie = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.16), bas({ color: 0x7f1d1d, side: THREE.DoubleSide }));
    tie.position.set(0, h * 0.1, 0.05); g.add(tie);
  }
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 8, 16, Math.PI), lam({ color: 0x9ca3af }));
  hook.position.set(0, h / 2 + 0.05, 0); g.add(hook);
  const bar = box(w * 0.9, 0.025, 0.03, lam({ color: 0x6b7280 })); bar.position.set(0, h / 2 - 0.01, 0); g.add(bar);
  return g;
}
const suitG = mkSuit(0.55, 0.75, 0x1e3a5f); suitG.visible = false; scene.add(suitG);
const suitEndG = mkSuit(0.55, 0.8, 0x2c4a6b, true); suitEndG.visible = false; scene.add(suitEndG);
const tag350Tex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#facc15'; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.fill();
  g.strokeStyle = '#a16207'; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 102, 0, 7); g.stroke();
  g.fillStyle = '#451a03'; g.font = 'bold 78px Arial'; g.textAlign = 'center'; g.fillText('₹350', 128, 156);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const tag350 = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshBasicMaterial({ map: tag350Tex, transparent: true, depthWrite: false }));
tag350.position.set(-0.6, 1.28, -2.02); tag350.visible = false; scene.add(tag350);
const suitGlowLight = new THREE.PointLight(0xffc861, 0, 6, 1.5);
suitGlowLight.position.set(-0.6, 1.6, -2.0); scene.add(suitGlowLight);
const glintSuit = mkGlint(-0.6, 1.5, -1.95, 0.6);
const glintBoard = mkGlint(-2.6, 2.1, -4.0, 0.5);
// suit rack — dukaan ke saamne (w02/w03 me depth ke liye)
const rackG = new THREE.Group(); scene.add(rackG);
{
  rackG.position.set(-0.9, 0, -3.4);
  for (const px of [-0.9, 0.9]) {
    const pole = cyl(0.04, 0.04, 1.8, lam({ color: 0x6b7280 }), 8); pole.position.set(px, 0.9, 0); rackG.add(pole);
  }
  const bar = cyl(0.03, 0.03, 1.8, lam({ color: 0x9ca3af }), 8); bar.rotation.z = Math.PI / 2; bar.position.set(0, 1.7, 0); rackG.add(bar);
  const cols = [0x1e3a5f, 0x3f3f46, 0x7f1d1d, 0x2e6b62, 0x854d0e, 0x1e3a5f];
  for (let i = 0; i < 6; i++) {
    const s = mkSuit(0.28, 0.8, cols[i]);
    s.position.set(-0.75 + i * 0.3, 1.25, 0); rackG.add(s);
  }
  for (let i = 0; i < 4; i++) {
    const m = box(0.45, 0.09, 0.38, lam({ color: cols[i % cols.length] }));
    m.position.set(-0.3 + (i % 2) * 0.5, 0.05 + Math.floor(i / 2) * 0.1, 0.1); m.rotation.y = (i - 1.5) * 0.08; rackG.add(m);
  }
  rackG.visible = false;
}
// ---- CHIDIYA (w01 me aasmaan se guzarti) ----
const bird = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.07), bas({ color: 0x1f2937, side: THREE.DoubleSide }));
bird.visible = false; scene.add(bird);

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
// RENDER
// =====================================================================
window.renderFrame = (f) => {
  const shot = shotAt(f), u = shot.u, id = shot.id;
  const cam = camFor(shot, u);
  camera.position.set(...cam.pos); camera.lookAt(...cam.look);
  camera.fov = cam.fov; camera.updateProjectionMatrix();
  if (cam.roll) camera.rotateZ(cam.roll * Math.PI / 180);
  const env = applyEnv(shot.env);
  for (const k in skyMeshes) skyMeshes[k].visible = (k === env.sky);
  clouds.forEach((sp, i) => { sp.position.x = -22 + i * 7.5 + Math.sin(f * 0.004 + i) * 0.6; });
  farClouds.forEach((sp, i) => { sp.position.x = -18 + i * 12 + Math.sin(f * 0.002 + i * 2) * 0.8; });
  skylineG.visible = true;
  ALL_CARDS.forEach((c) => c.hide());
  const cp = cam.pos;
  galiG.visible = true;
  // ---- hamesha zinda background: ped + kapde + motes ----
  galiTrees.forEach((t, i) => { t.rotation.z = Math.sin(f * 0.03 + i * 1.7) * 0.018; });
  swayCloths.forEach((c, i) => { c.rotation.x = Math.sin(f * 0.05 + i * 1.3) * 0.08; });
  motes.forEach((sp, i) => {
    sp.position.y += Math.sin(f * 0.05 + i * 2.1) * 0.0012;
    sp.position.x += Math.cos(f * 0.02 + i) * 0.0009;
  });
  // ---- props default band ----
  glintBoard.material.opacity = 0;
  bird.visible = false;
  tag350.visible = false; suitGlowLight.intensity = 0; glintSuit.material.opacity = 0;
  suitG.visible = false;
  suitEndG.visible = false;
  rackG.visible = false; // sirf w02 reveal (u>=0.35) + w03 me — walk-in me graahak rack se takrata
  const fl = FLASH[id];
  flashPlane.material.opacity = fl ? Math.max(0, 1 - Math.abs(f - fl.at) / (fl.dur / 2)) : 0;

  switch (id) {
    case 'w01': { // HOOK: aerial → push-in; board bada; Raju board ke BAGAL me
      drawChar(rajuCard, 61, RAJU, 'smile', 'reach', 'hang', f, cp, -1.0, 0, -1.6, 1.05, 0, 0.35, 0, mouthFor(f), true);
      const nx = 3.5 - 2.0 * u;
      drawChar(neighCard, 63, NEIGH, 'neutral', 'hang', 'hang', f, cp, nx, 0, -3.2, 0.85, 0.5 + 0.08 * Math.sin(f * 0.15), null, 0, null, false);
      glintBoard.position.set(-2.7, 2.05, -4.0);
      glintBoard.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3);
      bird.visible = true;
      bird.position.set(-4 + 8 * u, 5.5 + Math.sin(f * 0.1) * 0.2, -12);
      bird.rotation.z = Math.sin(f * 0.2) * 0.2;
      break;
    }
    case 'w02': { // SUIT REVEAL: u<0.35 walk-in (s14 grammar), u≥0.35 glow + ₹350 tag (s15 grammar)
      if (u < 0.35) {
        const lu = u / 0.35;
        const cx = -1.2 + 0.6 * lu, cz = -4.0 + 1.4 * lu;
        drawChar(rajuCard, 61, RAJU, 'wonder', 'hang', 'hang', f, cp, -1.5, 0, -1.6, 1.0, 0, null, 0, mouthFor(f), true);
        drawChar(custCard, 67, CUST, 'smile', 'reach', 'hang', f, cp, cx, 0, cz, 1.0, (f * 0.12) % 1, 0.3, 0, null, false);
        suitG.visible = true;
        suitG.position.set(cx + 0.25, 1.15, cz + 0.3);
        suitG.rotation.z = Math.sin(f * 0.08) * 0.04;
        suitGlowLight.intensity = 0.5;
        suitGlowLight.position.set(cx + 0.25, 1.3, cz + 0.3);
      } else {
        const ru = (u - 0.35) / 0.65;
        rackG.visible = true; // reveal me peeche suit rack = depth (graahak ab -2.6 par, rack -3.4 peeche)
        drawChar(custCard, 67, CUST, 'smile', 'reach', 'hang', f, cp, -0.6, 0, -2.6, 1.0, 0, 0.45, 0, null, false);
        drawChar(rajuCard, 61, RAJU, 'smile', 'reach', 'hang', f, cp, 0.05, 0, -2.6, 0.85, 0, 0.4, 0, mouthFor(f), true);
        suitG.visible = true;
        suitG.position.set(-0.6, 1.5 + 0.05 * Math.sin(f * 0.06), -2.2);
        suitG.rotation.z = 0;
        tag350.visible = true;
        tag350.rotation.z = Math.sin(f * 0.05) * 0.05;
        suitGlowLight.intensity = 1.5 + 2.5 * ru;
        suitGlowLight.position.set(-0.6, 1.6, -2.0);
        glintSuit.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3);
        glintSuit.position.set(-0.6, 1.5, -1.95);
      }
      break;
    }
    case 'w03': { // ENDING: travelling → push-in; Raju suit uthata hai → FREEZE sabse badi smile. Loop, koi CTA nahi.
      rackG.visible = true; // ending wide me peeche rack = depth
      drawChar(rajuCard, 61, RAJU, 'relief', 'up', 'hang', f, cp, -1.2, 0, -1.8, 1.05, 0, null, 0, mouthFor(f), true);
      suitEndG.visible = true;
      suitEndG.position.set(-0.55, 1.25 + 0.4 * u, -1.7);
      suitEndG.rotation.z = Math.sin(f * 0.04) * 0.03;
      break;
    }
  }
  updateProxiesW();
  renderer.render(scene, camera);
};
window.TOTAL = TOTAL;
window.ready = Promise.resolve();
