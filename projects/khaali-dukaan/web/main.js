// "Khaali Dukaan" — WORLD V3 FULL VIDEO (45.98 s, 1379 frames @30fps, 58 shots v2 re-cut).
// Title: "Dukaan Me Kuch Nahi Bikta, Phir Bhi ₹40,000! 😱" — Hero: Salim.
// World (fresh, sirf is video ke liye): gali + Salim ki KHAALI dukaan (shutter, khaali almari,
// ek mez, register, galla) + bagal wali BHARI kirana dukaan + tempo + parcels (20 → 50 → 100).
// Palette: muted natural — dhool-mitti sadak, halki cream deewaar, shaam narangi aasmaan.
// Tez saturated rang SIRF hero cheezon par (Salim teal kurta, ₹40,000 board gold, parcel tape).
// NO captions, NO music. Numbers objects bankar: parcels gin kar, galla khul kar, boards par.
// MUNH = bhaav ka instrument — NO phoneme lip-sync, envelope.js import NAHI.
// Narration 100% voiceover — narration par munh band + expression badle.
// NO walk cycle — chalna = chhote kadam + halka bob; action = haath+sar+chehra.
// WITHHELD: twist = dono galle (b10) — usse pehle Salim ka galla sirf b03 me halka dikhe.
// Contract: window.ready, window.renderFrame(f).
import * as THREE from 'three';
import * as FX from './fx.js';
import * as T from './toon.js';
import { idle, blinkAt, q, M, clamp } from './motion.js';
import { tex, planks, plaster, stone, dirt, wetConcrete, tiles, tinRoof, marble } from './paint.js';
import { TOTAL, shotAt, camFor, FLASH, BEAT_OF, beatU } from './story.js';

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
// Salim dukaan ke lamp ki garam roshni (shaam me ON — applyEnv me)
const lampLight = new THREE.PointLight(0xffc27a, 0, 8, 1.6);
lampLight.position.set(-2.85, 2.4, -3.6); scene.add(lampLight);
const chandLight = new THREE.PointLight(0xffd98a, 0, 9, 1.5);
chandLight.position.set(0, 3.2, -2.0); scene.add(chandLight);
const officeLight = new THREE.PointLight(0xd6e6ff, 0, 8, 1.5);
officeLight.position.set(0, 2.8, -2.0); scene.add(officeLight);

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

// V2 deewaar texture — garam cream + soft patches, baarish ke daag, dararein, neeche grime.
function wallV2Tex() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#e6d6b4'; g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 26; i++) {
    const x = (i * 97) % 512, y = (i * 61) % 256, rx = 22 + (i * 13) % 46, ry = 12 + (i * 7) % 22;
    g.fillStyle = i % 2 ? 'rgba(190,160,115,0.35)' : 'rgba(245,235,205,0.4)';
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill();
  }
  g.fillStyle = 'rgba(15,118,110,0.55)'; g.fillRect(0, 14, 512, 10);
  g.fillStyle = 'rgba(15,118,110,0.3)'; g.fillRect(0, 26, 512, 4);
  for (let i = 0; i < 8; i++) {
    const x = 30 + (i * 67) % 460, w = 4 + (i % 3) * 3, y0 = 20 + (i * 11) % 60, len = 60 + (i * 29) % 120;
    const gr = g.createLinearGradient(0, y0, 0, y0 + len);
    gr.addColorStop(0, 'rgba(110,84,50,0.30)'); gr.addColorStop(1, 'rgba(110,84,50,0)');
    g.fillStyle = gr; g.fillRect(x, y0, w, len);
  }
  g.strokeStyle = 'rgba(90,64,38,0.45)'; g.lineWidth = 1.2;
  [[60, 30, 5], [300, 60, 4], [430, 20, 6], [180, 90, 5]].forEach(([x0, y0, n]) => {
    let x = x0, y = y0; g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < n; k++) { x += (k % 2 ? 7 : -6); y += 12 + (k * 3) % 10; g.lineTo(x, y); }
    g.stroke();
  });
  for (let i = 0; i < 900; i++) {
    g.fillStyle = i % 2 ? 'rgba(120,90,55,0.10)' : 'rgba(255,252,240,0.10)';
    g.fillRect((i * 53) % 512, (i * 97) % 256, 1.5, 1.5);
  }
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
function drawChar(card, seed, outfit, expr, R, L, f, camPos, x, y, z, s = 1.03, step = 0, lift = null, tilt = 0, mouth = null, props = false, sweat = false) {
  const idl = idle(f, seed), blink = blinkAt(f, seed);
  const liftQ = lift === null ? '' : q(lift, 1);
  const tiltBody = Math.round(idl.tilt + tilt * 3);
  const tiltHead = Math.round(idle(f, seed + 2).headTilt + tilt * 6);
  const key = `${seed}|${expr}|${R}|${L}|${blink}|${q(idl.bob, 2)}|${tiltBody}|${q(step, 2)}|${liftQ}|${mouth || ''}|${sweat ? 'sw' : ''}`;
  card.draw(key, (p) => {
    T.romanFront(p, outfit, {
      seed, expr, R, L, blink, bob: q(idl.bob, 2), tilt: tiltBody,
      headTilt: tiltHead, wv: f * 0.18, step, lift: lift === null ? 0 : lift, mouth, sweat,
    });
  });
  card.place(x, y, z, camPos, s);
}
const salimCard = new Card(), sethCard = new Card();
const auntyCard = new Card(), manCard = new Card(), kidCard = new Card();
const ALL_CARDS = [salimCard, sethCard, auntyCard, manCard, kidCard];
// FRESH — SALIM (~30, NO moochh): teal kurta + cream shirt + safed gamchha (toga sash). Skin #a06a3c.
const SALIM = { tunic: '#0f766e', shirt: '#f5e9d0', skin: '#a06a3c', hair: '#1e1a20', hairStyle: 'side', apron: '#0f766e', toga: '#f8fafc', togaPrint: true };
// SETH — kirana dukaan wala (~50, WITHHELD nahi, b09 se): brown kurta + moochh + stout. Skin #8a5a30.
const SETH = { tunic: '#7c4a21', shirt: '#fef3c7', skin: '#8a5a30', hair: '#14100c', hairStyle: 'thick', moustache: '#241a14', stout: true };
// BHEED (shaam parcel lene wale): aunty gulabi, man hara kurta, kid narangi.
const CUST_AUNTY = { tunic: '#c25a7a', shirt: '#fef3c7', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick', dress: '#c25a7a' };
const CUST_MAN = { tunic: '#5d7a4a', shirt: '#fef3c7', skin: '#9a6a42', hair: '#2b211c', hairStyle: 'thick' };
const CUST_KID = { tunic: '#d97706', shirt: '#fef3c7', skin: '#b0703a', hair: '#1e1a20', hairStyle: 'thick' };

// ---- MUNH, beat-level — har line ke shuru me 'o' hold ~0.4s → band. Narration par band. ----
// Line starts (frames): L1 0 | L2 40 | L3 111 | L4 251 | L5 325 | L6 427 | L7 595 | L8 697
// | L9 759 | L10 840 | L11 943 | L12 1003 | L13 1122 | L14 1179 | L15 1241.
const MOUTH_BEATS = [0, 40, 111, 251, 325, 427, 595, 697, 759, 840, 943, 1003, 1122, 1179, 1241];
function mouthFor(f) {
  for (const b of MOUTH_BEATS) if (f >= b && f < b + 12) return 'o';
  return null;
}

// =====================================================================
// ENVS — shaam (gali) / subah / din / raat
// =====================================================================
const ENVS = {
  evening: { bg: 0xe8b078, fogC: 0xe8c098, fogNear: 8, fogFar: 38, hemi: 1.0, hemiC: 0xffe0b8, hemiG: 0x8a6a4a, sun: 1.6, sunC: 0xff8a3d, sunPos: [-11, 2.6, 4], bounce: 0.35, bounceC: 0xffd9a0, expo: 1.12, sky: 'evening', lamp: 4.5, sunDisc: [-16, 4, -27], sunDiscC: 0xffb060, sunDiscR: 2.0, winC: 0xffd9a0, litWinC: 0xffd98a },
  morning: { bg: 0xd8e8ee, fogC: 0xd8e4e0, fogNear: 10, fogFar: 46, hemi: 1.05, hemiC: 0xffe8c8, hemiG: 0x8a7a5a, sun: 1.7, sunC: 0xffd9a0, sunPos: [-10, 4.5, 6], bounce: 0.4, bounceC: 0x9db8d9, expo: 1.12, sky: 'morning', lamp: 0, sunDisc: [-16, 7, -27], sunDiscC: 0xfff3c8, sunDiscR: 1.6, winC: 0x9db8c4, litWinC: 0x7a8a80 },
  day: { bg: 0xc8dcec, fogC: 0xd0dde6, fogNear: 12, fogFar: 48, hemi: 1.0, hemiC: 0xffe8c8, hemiG: 0x8a7a5a, sun: 1.6, sunC: 0xfff0c8, sunPos: [-9, 6, 5], bounce: 0.35, bounceC: 0x9db8d9, expo: 1.13, sky: 'day', lamp: 0, sunDisc: [-16, 9, -27], sunDiscC: 0xfff3c8, sunDiscR: 1.4, winC: 0x9db8c4, litWinC: 0x7a8a80 },
  night: { bg: 0x2a3550, fogC: 0x3a4666, fogNear: 10, fogFar: 44, hemi: 0.7, hemiC: 0x9db8d9, hemiG: 0x3a2f28, sun: 0.5, sunC: 0x9db8d9, sunPos: [-8, 8, 4], bounce: 0.2, bounceC: 0xffd9a0, expo: 1.05, sky: 'night', lamp: 5, sunDisc: [-16, 6, -27], sunDiscC: 0xfff3c8, sunDiscR: 1.2, winC: 0xffd98a, litWinC: 0xffd98a },
};
const winGlassMat = lam({ color: 0x9db8c4, fog: false });
const litWinMat = lam({ color: 0x7a8a80, fog: false });
const lampBulbMat = bas({ color: 0xfff7cc, fog: false });
const lampGlow = mkGlint(-2.85, 2.42, -3.9, 0.6);
const sunDiscMat = bas({ color: 0xfff3c8, fog: false });
const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24), sunDiscMat);
sunDisc.position.set(-16, 7, -27); scene.add(sunDisc);
const sunGlow = mkGlint(-16, 7, -26.5, 6);
const applyEnv = (name) => {
  const e = ENVS[name] || ENVS.evening;
  scene.background = new THREE.Color(e.bg);
  scene.fog = new THREE.Fog(e.fogC, e.fogNear, e.fogFar);
  hemi.intensity = e.hemi; hemi.color.set(e.hemiC); hemi.groundColor.set(e.hemiG);
  sun.intensity = e.sun; sun.color.set(e.sunC); sun.position.set(...e.sunPos);
  sun.target.position.set(0, 0, 0); sun.target.updateMatrixWorld();
  bounce.intensity = e.bounce; bounce.color.set(e.bounceC);
  renderer.toneMappingExposure = e.expo;
  lampLight.intensity = e.lamp || 0;
  lampBulbMat.color.set((e.lamp || 0) > 0 ? 0xffe9a8 : 0xcfd8dc);
  lampGlow.material.opacity = (e.lamp || 0) > 0 ? 0.7 : 0;
  winGlassMat.color.set(e.winC);
  litWinMat.color.set(e.litWinC);
  sunDisc.position.set(...e.sunDisc); sunDiscMat.color.set(e.sunDiscC);
  sunDisc.scale.setScalar(e.sunDiscR / 1.6);
  sunGlow.position.set(e.sunDisc[0], e.sunDisc[1], e.sunDisc[2] + 0.5);
  sunGlow.scale.setScalar(e.sunDiscR * 3);
  sunGlow.material.opacity = 0.5;
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
  evening: new THREE.Mesh(skyGeo, bas({ map: skyTex([[0, '#c96a4a'], [0.55, '#f2a35e'], [1, '#ffe8c0']]), fog: false })),
  night: new THREE.Mesh(skyGeo, bas({ map: skyTex([[0, '#1a2440'], [0.55, '#3a4666'], [1, '#7a5a6a']]), fog: false })),
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
// SADAK KA PUDDLE (halka sheesha — sadak khaali na lage) + foreground bora/crate (wide shots ka neeche hissa)
const puddle = new THREE.Mesh(new THREE.CircleGeometry(1.1, 20), new THREE.MeshPhongMaterial({ color: 0x5a6b7a, shininess: 160, specular: 0xddeeff }));
puddle.rotation.x = -Math.PI / 2; puddle.position.set(2.5, 0.012, 0.5); scene.add(puddle);
{
  const fgSack = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), lam({ color: 0x8a6d3b }));
  fgSack.scale.set(1, 0.7, 1); fgSack.position.set(3.4, 0.24, 2.6); scene.add(fgSack);
  const fgCrate = box(0.5, 0.4, 0.5, lam({ map: tex(planks(47), 1, 1) })); fgCrate.position.set(4.1, 0.2, 2.4); fgCrate.rotation.y = 0.4; scene.add(fgCrate);
  const fgPot = cyl(0.22, 0.16, 0.35, lam({ color: 0xb45309 }), 10); fgPot.position.set(-4.8, 0.17, 1.8); scene.add(fgPot);
  const fgPlant = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), lam({ color: 0x4a6b2f })); fgPlant.position.set(-4.8, 0.5, 1.8); scene.add(fgPlant);
  // FOREGROUND CRATES v2 (defect 1): wide shots ka neeche hissa khaali sadak na lage —
  // do bade crate camera ke kareeb (z 0.9-1.0), neeche ke kone bhare rahein.
}
// ---------- DISTANT SKYLINE (background depth): hazy buildings peeche, har shot me ----------
const skylineG = new THREE.Group(); scene.add(skylineG);
{
  // BACKGROUND FIX (defect 5): buildings ek jaise beige dabbe NAHI — har building alag rang/
  // unchai, chhat par tank + antenna + AC box, khidkiyan alag size/rang (kuch jalti, kuch band).
  const skyCols = [0xb8a888, 0x8a9aaa, 0x9a8f7a, 0x7a9a8a, 0xb08a7a, 0x8a7f6e];
  // BACKGROUND FIX v2 (defect 1): skyline AUR uncha — 10-13 m (pehle 6-10 m) taaki
  // wide shots me upar khaali aasmaan na dikhe; peeche ki silhouette bhi 11-15 m.
  const skySpots = [[-22.5, 10], [-17.5, 12], [-12.5, 9], [-7.5, 11], [-2.5, 13], [2.5, 10], [7.5, 12], [12.5, 9], [17.5, 11], [22.5, 10]];
  skySpots.forEach(([sx, sh], i) => {
    const b = box(5.5, sh, 1.2, lam({ map: tex(plaster(71, 36), 1, 2), color: skyCols[i % skyCols.length] }));
    b.position.set(sx, sh / 2, -19); skylineG.add(b);
    // chhat ka parapet + kabhi-kabhi tank/antenna (roofline toote, dabba na lage)
    const par = box(5.6, 0.22, 1.3, lam({ color: 0x6e6258 })); par.position.set(sx, sh + 0.11, -19); skylineG.add(par);
    if (i % 3 === 0) {
      const rt = cyl(0.45, 0.45, 0.8, lam({ color: 0x5a6a7a }), 12); rt.position.set(sx + 1.4, sh + 0.6, -19); skylineG.add(rt);
    }
    if (i % 4 === 1) {
      const an = cyl(0.02, 0.02, 1.4, lam({ color: 0x3a444c }), 6); an.position.set(sx - 1.6, sh + 0.8, -19); skylineG.add(an);
      const ab = cyl(0.015, 0.015, 0.8, lam({ color: 0x3a444c }), 6); ab.rotation.z = Math.PI / 2; ab.position.set(sx - 1.6, sh + 1.2, -19); skylineG.add(ab);
    }
    if (i % 3 === 2) {
      const ac = box(0.6, 0.4, 0.4, lam({ color: 0x9aa0a6 })); ac.position.set(sx - 1.2, sh + 0.4, -19); skylineG.add(ac);
    }
    for (let r = 0; r < Math.floor(sh / 1.6); r++) for (let cix = 0; cix < 3; cix++) {
      const lit = (r + cix + i) % 3 !== 0; // kuch khidki jalti (garam), kuch band (gehri)
      const win = new THREE.Mesh(new THREE.PlaneGeometry(lit ? 0.5 : 0.42, lit ? 0.6 : 0.52), lam({ color: lit ? 0xffd98a : 0x3a4450 }));
      win.position.set(sx - 1.2 + cix * 1.2, 1.2 + r * 1.6, -18.35); skylineG.add(win);
    }
  });
  const silCols = [0x8a6f7a, 0x7a5f6e, 0x9a7f72, 0x6e5a6a];
  [[-24, 13], [-15, 11], [-6, 15], [3, 12], [12, 14], [21, 12]].forEach(([sx, sh], i) => {
    const b = box(6.5, sh, 1.0, lam({ color: silCols[i % silCols.length] }));
    b.position.set(sx, sh / 2, -27); skylineG.add(b);
  });
}
// L2 beech: makaan row z=-8 — tank + antenna + khidki (shaam/raat me jalti hain)
const midG = new THREE.Group(); scene.add(midG);
{
  // MID HOUSES FIX (defect 5): teeno makaan alag rang — teal / ochre / gulabi-mitti.
  // Khidki par frame + kapde sukhane ki rassi (rangeen kapde) + ek dish — gali zinda lage.
  [[-7.5, 4.0, 0x7a9a8a], [0.5, 3.6, 0xc4a85a], [7.0, 4.6, 0xb08a7a]].forEach(([mx, mh, mcol]) => {
    const m = box(3.2, mh, 0.5, lam({ map: tex(plaster(74, 38), 1, 1), color: mcol })); m.position.set(mx, mh / 2, -8); midG.add(m);
    const par = box(3.3, 0.18, 0.55, lam({ color: 0x8a7a5a })); par.position.set(mx, mh + 0.09, -8); midG.add(par);
    [[0.7, 2.0], [-0.7, 1.3]].forEach(([wx, wy]) => {
      const fr = box(0.72, 0.82, 0.04, lam({ color: 0x4a3428 })); fr.position.set(mx + wx, wy, -7.72); midG.add(fr);
      const mw = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.7), litWinMat);
      mw.position.set(mx + wx, wy, -7.7); midG.add(mw);
    });
  });
  // kapde sukhane ki rassi — beech wale makaan se dayein wale tak (rangeen kapde, halke jhukte)
  const line = bar2D(-1.2, 3.3, 5.4, 3.45, -7.6, lam({ color: 0x2c343c }), 0.012); midG.add(line);
  [[-0.4, 0xf97316], [0.8, 0x38bdf8], [2.0, 0xfacc15], [3.2, 0xec4899], [4.4, 0x22c55e]].forEach(([cx, col]) => {
    const cl = box(0.5, 0.62, 0.02, lam({ color: col })); cl.position.set(cx, 3.0, -7.6); cl.rotation.z = (cx % 2 ? 0.05 : -0.04); midG.add(cl);
  });
  // satellite dish — dayein makaan par
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.1, 0.08, 16), lam({ color: 0xd6d3d1 })); dish.rotation.x = -0.7; dish.position.set(7.0, 4.9, -7.9); midG.add(dish);
  const dishArm = cyl(0.02, 0.02, 0.5, lam({ color: 0x57534e }), 6); dishArm.rotation.x = 0.7; dishArm.position.set(7.0, 4.7, -7.7); midG.add(dishArm);
  // SAHI water tank: halka slate-blue body + safed band + chapta dhakkan + knob + down-pipe (zameen se juda).
  const tank = cyl(0.5, 0.5, 0.9, lam({ color: 0x64748b }), 14); tank.position.set(0.5, 4.05, -8); midG.add(tank);
  const tankBand = cyl(0.51, 0.51, 0.08, lam({ color: 0xf1f5f9 }), 14); tankBand.position.set(0.5, 4.05, -8); midG.add(tankBand);
  const tankLid = cyl(0.52, 0.52, 0.1, lam({ color: 0x475569 }), 14); tankLid.position.set(0.5, 4.55, -8); midG.add(tankLid);
  const tankKnob = cyl(0.06, 0.06, 0.08, lam({ color: 0x334155 }), 8); tankKnob.position.set(0.5, 4.62, -8); midG.add(tankKnob);
  const tankPipe = cyl(0.035, 0.035, 3.6, lam({ color: 0x475569 }), 6); tankPipe.position.set(0.5, 1.8, -7.72); midG.add(tankPipe);
  const ant = cyl(0.02, 0.02, 1.6, lam({ color: 0x39434c }), 6); ant.position.set(-7.5, 4.8, -8); midG.add(ant);
  const antBar = cyl(0.015, 0.015, 0.9, lam({ color: 0x39434c }), 6); antBar.rotation.z = Math.PI / 2; antBar.position.set(-7.5, 5.3, -8); midG.add(antBar);
  const antBar2 = cyl(0.015, 0.015, 0.6, lam({ color: 0x39434c }), 6); antBar2.rotation.z = Math.PI / 2; antBar2.position.set(-7.5, 5.0, -8); midG.add(antBar2);
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
// SETS — GALI: dhool sadak + Salim ki KHAALI dukaan (LEFT) + BHARI kirana (RIGHT)
// Layout: Salim shop centre x=-2.2 (front z=-3.6, back z=-4.3) | Kirana centre x=+2.6.
// LAYOUT LOCK: har prop ki base surface ko chhooye; hero text/face margin ke saath frame me.
// =====================================================================
const galiG = new THREE.Group(); scene.add(galiG);
let motes = [];
let galiTrees = [];
let dogTail = null; // street dog ki poonchh — renderFrame me wag (zinda background)
let lightCone = null; // lamp ka roshni-cone (shaam me ON) — salimShop block me banega

// ---- shared board textures ----
const salimSignTex = textBoard(1024, 200, (g, w, h) => {
  g.fillStyle = '#0f766e'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#facc15'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
  g.textAlign = 'center'; g.fillStyle = '#f8fafc';
  g.font = 'bold 84px Arial'; g.fillText('SALIM', w / 2, 96);
  g.fillStyle = '#fde047'; g.font = 'bold 52px Arial'; g.fillText('PARCEL POINT', w / 2, 168);
});
const kiranaSignTex = textBoard(1024, 200, (g, w, h) => {
  g.fillStyle = '#7c4a21'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#fde047'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
  g.textAlign = 'center'; g.fillStyle = '#fef3c7';
  g.font = 'bold 84px Arial'; g.fillText('KIRANA', w / 2, 96);
  g.fillStyle = '#fde047'; g.font = 'bold 52px Arial'; g.fillText('STORE • SAB KUCH', w / 2, 168);
});
const clockTex = textBoard(256, 256, (g, w, h) => {
  g.fillStyle = '#fef9ec'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
  g.strokeStyle = '#1e293b'; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.stroke();
  g.fillStyle = '#1e293b'; g.textAlign = 'center'; g.font = 'bold 40px Arial';
  g.fillText('12', 128, 52); g.fillText('6', 128, 224); g.fillText('3', 210, 142); g.fillText('9', 46, 142);
});
const shutterTex = (() => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#94a3b8'; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 16) {
    g.fillStyle = '#64748b'; g.fillRect(0, y, 256, 4);
    g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, y + 4, 256, 3);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
// CHECKERBOARD doormat texture (Gullak: checkerboard/perspective farsh) — dono dukaan ke darwaze par
const checkerTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#0f766e' : '#fef3c7'; g.fillRect(x * 32, y * 32, 32, 32); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();

// ---------- GALI: dhool sadak, road, peeche deewaar, ped, taar ----------
{
  const S = galiG;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 34), lam({ map: tex(dirt(17), 10, 10), color: 0xa89878 }));
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
  {
    let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    const pebCols = [0x8a7a68, 0x6b5a44, 0x9a8a72, 0x5a4a38];
    for (let i = 0; i < 20; i++) {
      const px = -6 + rnd() * 12, pz = -3.5 + rnd() * 7.5;
      const peb = box(0.06 + rnd() * 0.07, 0.03 + rnd() * 0.02, 0.05 + rnd() * 0.05, lam({ color: pebCols[i % 4] }));
      peb.position.set(px, -0.005, pz); peb.rotation.y = rnd() * 3; S.add(peb);
    }
  }
  const road = new THREE.Mesh(new THREE.PlaneGeometry(40, 3.4), lam({ map: tex(wetConcrete(61), 6, 1), color: 0xbfb8a8 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, 1.8); S.add(road);
  for (let i = 0; i < 8; i++) {
    const dash = box(1.1, 0.012, 0.14, lam({ color: 0xe2e8f0 }));
    dash.position.set(-14 + i * 4, 0.008, 1.8); S.add(dash);
  }
  [1.15, 2.45].forEach((tz) => {
    const tr = new THREE.Mesh(new THREE.PlaneGeometry(40, 0.35), new THREE.MeshBasicMaterial({ color: 0x2e2a26, transparent: true, opacity: 0.55, depthWrite: false }));
    tr.rotation.x = -Math.PI / 2; tr.position.set(0, 0.004, tz); S.add(tr);
  });
  // peeche ki deewaar — dono dukaanon ke beech ki patti + kinare (upar aasmaan + skyline dikhe)
  const dwall = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 3.2), lam({ map: wallV2Tex(), color: 0xffffff }));
  dwall.position.set(0.2, 1.6, -4.3); dwall.receiveShadow = true; S.add(dwall);
  // beech ki patti par poster (dono dukaanon ke beech, 0.9 m chaudi jagah)
  const parcelPosterTex = textBoard(256, 320, (g, w, h) => {
    g.fillStyle = '#fef3c7'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#0f766e'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
    g.textAlign = 'center'; g.fillStyle = '#0f766e';
    g.font = 'bold 52px Arial'; g.fillText('PARCEL', w / 2, 96);
    g.fillStyle = '#1e293b'; g.font = 'bold 44px Arial'; g.fillText('LE JAO', w / 2, 170);
    g.fillText('LE AAO', w / 2, 230);
  });
  const parcelPoster = boardMesh(0.55, 0.7, parcelPosterTex); parcelPoster.position.set(0.2, 1.6, -4.24); S.add(parcelPoster);
  // CHECKERBOARD DOORMATS — dono dukaan ke darwaze ke saamne (z -2.9, sadak ki mitti par)
  [-2.2, 2.6].forEach((mx) => {
    const mat = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.6), lam({ map: checkerTex }));
    mat.rotation.x = -Math.PI / 2; mat.position.set(mx, 0.012, -2.9); mat.receiveShadow = true; S.add(mat);
  });
  // ---- SALIM KI DUKAAN (LEFT, centre x=-2.2) ----
  const salimShop = new THREE.Group(); S.add(salimShop);
  {
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.2), lam({ map: wallV2Tex(), color: 0xffffff }));
    backWall.position.set(-2.2, 1.6, -4.28); salimShop.add(backWall);
    [-3.95, -0.45].forEach((wx) => {
      const side = box(0.15, 3.2, 0.9, lam({ color: 0xd8c49a })); side.position.set(wx, 1.6, -3.85); salimShop.add(side);
    });
    const fascia = box(3.6, 0.5, 0.2, lam({ color: 0x0f766e })); fascia.position.set(-2.2, 3.05, -3.6); salimShop.add(fascia);
    const roof = box(3.6, 0.08, 1.3, lam({ map: tex(tinRoof(53), 2, 1), color: 0x9a3412 })); roof.position.set(-2.2, 3.35, -3.9); salimShop.add(roof);
    const floor = box(3.4, 0.06, 0.95, lam({ map: tex(planks(41), 2, 1) })); floor.position.set(-2.2, 0.0, -3.85); salimShop.add(floor);
    const sign = boardMesh(2.6, 0.5, salimSignTex); sign.position.set(-2.2, 3.05, -3.48); salimShop.add(sign);
    // KHAALI ALMARI v2 (MIRROR FIX defect 2): almari ka centre -2.2 -> -2.5 (uprights -3.55/-1.45,
    // shelf 2.2 chaudi) taaki deewaar ka dayein hissa (x -0.85) SHEESHE ke liye poora khaali rahe —
    // na upright, na shelf board sheeshe ke upar se guzre. Khaali-pan abhi bhi wahi hai.
    [-3.55, -1.45].forEach((ux) => {
      const up = box(0.06, 1.6, 0.32, lam({ color: 0x6d4a2c })); up.position.set(ux, 1.3, -4.1); salimShop.add(up);
    });
    [1.0, 1.7].forEach((sy) => {
      const shelf = box(2.2, 0.06, 0.35, lam({ map: tex(planks(42), 2, 1) })); shelf.position.set(-2.5, sy, -4.1); salimShop.add(shelf);
    });
    const shelfTop = box(2.2, 0.06, 0.35, lam({ map: tex(planks(42), 2, 1) })); shelfTop.position.set(-2.5, 2.1, -4.1); salimShop.add(shelfTop);
    // ek khaali dabba (shelf par akela, khaali-pan dikhaye) — sirf ek, bheed nahi
    const loneBox = box(0.22, 0.18, 0.2, lam({ color: 0xb8a888 })); loneBox.position.set(-2.9, 1.12, -4.1); salimShop.add(loneBox);
    // COBWEB (beeta samay = visual metaphor + pehle 11 s ka visual gag): almari ke upar-bayein
    // kone par makdi ka jaala — khaali dukaan me waqt guzra hai, bina ek shabd bole.
    {
      const webMat = lam({ color: 0xe8e8e8 });
      const WC = [-3.55, 2.08, -4.06];
      salimShop.add(bar2D(WC[0], WC[1], WC[0] + 0.28, WC[1] - 0.02, WC[2], webMat, 0.006));
      salimShop.add(bar2D(WC[0], WC[1], WC[0] + 0.02, WC[1] - 0.28, WC[2], webMat, 0.006));
      salimShop.add(bar2D(WC[0], WC[1], WC[0] + 0.2, WC[1] - 0.2, WC[2], webMat, 0.006));
      salimShop.add(bar2D(WC[0] + 0.14, WC[1] - 0.01, WC[0] + 0.13, WC[1] - 0.14, WC[2], webMat, 0.005));
      salimShop.add(bar2D(WC[0] + 0.01, WC[1] - 0.14, WC[0] + 0.13, WC[1] - 0.14, WC[2], webMat, 0.005));
    }
    // MEZ (counter) — lakdi, register + galla upar
    const mez = box(1.6, 0.8, 0.7, lam({ map: tex(planks(43), 1, 1) })); mez.position.set(-2.2, 0.42, -3.85); salimShop.add(mez);
    const mezTop = box(1.9, 0.06, 0.8, lam({ color: 0x8a6844 })); mezTop.position.set(-2.2, 0.85, -3.85); salimShop.add(mezTop);
    // PEETAL KI GHANTI (brass bell) — mez par, Salim ki dukaan ki pehchan (har interior shot me)
    const bellBase = cyl(0.06, 0.07, 0.02, lam({ color: 0x8a6d2b }), 12); bellBase.position.set(-1.6, 0.89, -3.7); salimShop.add(bellBase);
    const bellDome = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: 0xc9a227 })); bellDome.position.set(-1.6, 0.9, -3.7); salimShop.add(bellDome);
    const bellBtn = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 6), lam({ color: 0x78350f })); bellBtn.position.set(-1.6, 0.965, -3.7); salimShop.add(bellBtn);
    // lamp — deewaar par, shaam ON (bracket deewaar se juda) — x -3.0→-2.85 (s04 me kinare par kata tha)
    const bracket = box(0.06, 0.06, 0.25, lam({ color: 0x1f2937 })); bracket.position.set(-2.85, 2.62, -4.05); salimShop.add(bracket);
    const shade = cyl(0.08, 0.22, 0.18, lam({ color: 0x166534 }), 12); shade.position.set(-2.85, 2.52, -3.95); salimShop.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), lampBulbMat); bulb.position.set(-2.85, 2.42, -3.95); salimShop.add(bulb);
    // LIGHT CONE (Gullak: akele character par ek light cone) — lamp se mez tak garam roshni ka
    // shankhu; shaam me ON (renderFrame me env=evening par visible). Additive, halka (opacity 0.10).
    lightCone = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.6, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffc27a, transparent: true, opacity: 0.10, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    lightCone.position.set(-2.85, 1.7, -3.9); lightCone.visible = false; salimShop.add(lightCone);
  }
  // ---- KIRANA DUKAAN (RIGHT, centre x=+2.6) — BHARI HUI ----
  const kiranaShop = new THREE.Group(); S.add(kiranaShop);
  {
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.2), lam({ map: tex(plaster(73, 210), 1, 1), color: 0xcfd8dc }));
    backWall.position.set(2.6, 1.6, -4.28); kiranaShop.add(backWall);
    [0.85, 4.35].forEach((wx) => {
      const side = box(0.15, 3.2, 0.9, lam({ color: 0xc9b896 })); side.position.set(wx, 1.6, -3.85); kiranaShop.add(side);
    });
    const fascia = box(3.6, 0.5, 0.2, lam({ color: 0x7c4a21 })); fascia.position.set(2.6, 3.05, -3.6); kiranaShop.add(fascia);
    const roof = box(3.6, 0.08, 1.3, lam({ map: tex(tinRoof(54), 2, 1), color: 0x57534e })); roof.position.set(2.6, 3.35, -3.9); kiranaShop.add(roof);
    const floor = box(3.4, 0.06, 0.95, lam({ map: tex(planks(44), 2, 1) })); floor.position.set(2.6, 0.0, -3.85); kiranaShop.add(floor);
    const sign = boardMesh(2.4, 0.5, kiranaSignTex); sign.position.set(2.6, 3.05, -3.48); kiranaShop.add(sign);
    // BHARI SHELF — 3 shelf, har ek par saaman (bore, dibbe, dabbe)
    const jarCols = [0xdc2626, 0x16a34a, 0xca8a04, 0x2563eb, 0x7c3aed];
    [0.9, 1.5, 2.1].forEach((sy, r) => {
      const shelf = box(2.8, 0.06, 0.4, lam({ map: tex(planks(45), 2, 1) })); shelf.position.set(2.6, sy, -4.05); kiranaShop.add(shelf);
      for (let i = 0; i < 6; i++) {
        const gx = 1.5 + i * 0.44;
        if ((i + r) % 2 === 0) {
          const jar = cyl(0.09, 0.09, 0.22, lam({ color: jarCols[(i + r) % 5] }), 10);
          jar.position.set(gx, sy + 0.14, -4.05); kiranaShop.add(jar);
        } else {
          const bx = box(0.24, 0.2, 0.22, lam({ color: [0xb45309, 0x92400e, 0x78350f][(i + r) % 3] }));
          bx.position.set(gx, sy + 0.13, -4.05); kiranaShop.add(bx);
        }
      }
    });
    // bore (floor par, shelf ke neeche) + latakte packet (upar rod se)
    [[1.4, 0x8a6844], [2.0, 0xc2b280], [3.8, 0x9a7a4a]].forEach(([sx, col]) => {
      const sack = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), lam({ color: col }));
      sack.scale.set(1, 0.8, 0.9); sack.position.set(sx, 0.24, -4.0); kiranaShop.add(sack);
    });
    const rod = cyl(0.02, 0.02, 2.6, lam({ color: 0x39434c }), 6); rod.rotation.z = Math.PI / 2; rod.position.set(2.6, 2.55, -3.9); kiranaShop.add(rod);
    [1.6, 2.2, 2.8, 3.4].forEach((hx, i) => {
      const pkt = box(0.22, 0.3, 0.04, lam({ color: jarCols[i % 5] }));
      pkt.position.set(hx, 2.38, -3.9); kiranaShop.add(pkt);
    });
    // counter + tarazu (weighing scale)
    const counter = box(1.6, 0.8, 0.7, lam({ map: tex(planks(46), 1, 1) })); counter.position.set(2.6, 0.42, -3.85); kiranaShop.add(counter);
    const counterTop = box(1.9, 0.06, 0.8, lam({ color: 0x8a6844 })); counterTop.position.set(2.6, 0.85, -3.85); kiranaShop.add(counterTop);
    const scaleBase = box(0.3, 0.06, 0.3, lam({ color: 0x1f2937 })); scaleBase.position.set(2.2, 0.91, -3.85); kiranaShop.add(scaleBase);
    const scalePan = cyl(0.14, 0.14, 0.03, lam({ color: 0x9ca3af }), 12); scalePan.position.set(2.2, 0.98, -3.85); kiranaShop.add(scalePan);
    // tarazu ka dial — asli weighing scale (safed dial + sui)
    const dialPost = box(0.03, 0.24, 0.03, lam({ color: 0x1f2937 })); dialPost.position.set(2.16, 1.0, -4.02); kiranaShop.add(dialPost);
    const dial = cyl(0.09, 0.09, 0.02, lam({ color: 0xf8fafc }), 16); dial.rotation.x = Math.PI / 2; dial.position.set(2.16, 1.13, -4.0); kiranaShop.add(dial);
    const needle = box(0.015, 0.07, 0.01, lam({ color: 0x1f2937 })); needle.position.set(2.16, 1.14, -3.985); needle.rotation.z = 0.5; kiranaShop.add(needle);
  }
  // ---- street props: gas, crates, cycle, stool, plant, trees, poles+wires ----
  {
    const gas = cyl(0.22, 0.22, 0.65, lam({ color: 0xdc2626 }), 14); gas.position.set(-4.6, 0.30, -2.6); S.add(gas);
    const gasTop = cyl(0.08, 0.08, 0.1, lam({ color: 0x9ca3af }), 10); gasTop.position.set(-4.6, 0.68, -2.6); S.add(gasTop);
    const c1 = box(0.55, 0.45, 0.55, lam({ map: tex(planks(46), 1, 1) })); c1.position.set(-4.5, 0.20, -2.0); S.add(c1);
    const c1e = box(0.57, 0.06, 0.57, lam({ color: 0x6d5136 })); c1e.position.set(-4.5, 0.43, -2.0); S.add(c1e);
    const sack = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), lam({ color: 0xc2b280 }));
    sack.scale.set(1, 0.75, 0.9); sack.position.set(-3.8, 0.20, -2.4); S.add(sack);
    const cy = new THREE.Group(); cy.position.set(5.2, -0.02, -2.0); cy.rotation.y = -0.35; cy.rotation.z = 0.1; S.add(cy);
    const wheelMat = lam({ color: 0x1f2937 });
    [-0.55, 0.55].forEach((wx) => {
      const wh = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.03, 8, 20), wheelMat);
      wh.position.set(wx, 0.34, 0); cy.add(wh);
      for (let s2 = 0; s2 < 3; s2++) {
        const sp = box(0.02, 0.62, 0.015, lam({ color: 0x9ca3af }));
        sp.position.set(wx, 0.34, 0); sp.rotation.z = s2 * Math.PI / 3; cy.add(sp);
      }
    });
    const fr = lam({ color: 0x166534 });
    cy.add(bar2D(-0.55, 0.34, 0.05, 0.72, 0, fr, 0.025));
    cy.add(bar2D(0.55, 0.34, 0.05, 0.72, 0, fr, 0.025));
    cy.add(bar2D(-0.55, 0.34, 0.55, 0.34, 0, fr, 0.025));
    cy.add(bar2D(0.05, 0.72, 0.55, 0.34, 0, fr, 0.025));
    cy.add(bar2D(0.05, 0.72, -0.15, 0.72, 0, fr, 0.025));
    const seat = box(0.22, 0.04, 0.1, lam({ color: 0x451a03 })); seat.position.set(-0.15, 0.76, 0); cy.add(seat);
    // THELA (sabzi thela, dayein kinare) + KUTTA (kirana ke paas baitha) + SCOOTER (sadak kinare)
    // — wide shots ka foreground/background bhara rahe (defect 5/6), gali zinda lage.
    const thela = new THREE.Group(); thela.position.set(5.6, 0, -1.2); thela.rotation.y = -0.5; S.add(thela);
    const thBed = box(1.5, 0.08, 0.8, lam({ map: tex(planks(47), 1, 1) })); thBed.position.y = 0.55; thela.add(thBed);
    [[-0.6, -0.42], [-0.6, 0.42]].forEach(([wx, wz]) => {
      const thWh = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 8, 18), lam({ color: 0x1f2937 }));
      thWh.position.set(wx, 0.3, wz); thela.add(thWh);
    });
    [[-0.4, 0x16a34a], [0.0, 0xdc2626], [0.4, 0xea580c], [-0.2, 0xca8a04], [0.25, 0x65a30d]].forEach(([vx, col], i) => {
      const veg = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), lam({ color: col }));
      veg.scale.set(1, 0.7, 1); veg.position.set(vx, 0.68, (i % 2 ? 0.15 : -0.12)); thela.add(veg);
    });
    const thHandle = cyl(0.025, 0.025, 0.9, lam({ color: 0x6d4a2c }), 6); thHandle.rotation.z = 1.1; thHandle.position.set(-1.05, 0.45, 0); thela.add(thHandle);
    const dog = new THREE.Group(); dog.position.set(3.9, 0, -2.6); dog.rotation.y = -2.2; S.add(dog);
    const dogBody = box(0.55, 0.25, 0.22, lam({ color: 0x8a5a34 })); dogBody.position.y = 0.16; dog.add(dogBody);
    const dogHead = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), lam({ color: 0x8a5a34 })); dogHead.position.set(0.32, 0.32, 0); dog.add(dogHead);
    const dogEar = box(0.05, 0.1, 0.03, lam({ color: 0x5a3a20 })); dogEar.position.set(0.3, 0.42, 0.08); dog.add(dogEar);
    dogTail = cyl(0.02, 0.01, 0.22, lam({ color: 0x8a5a34 }), 6); dogTail.rotation.z = -0.9; dogTail.position.set(-0.32, 0.28, 0); dog.add(dogTail);
    const scoot = new THREE.Group(); scoot.position.set(4.6, 0, 0.6); scoot.rotation.y = 0.4; S.add(scoot);
    [-0.5, 0.5].forEach((wx) => {
      const sw = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.04, 8, 18), lam({ color: 0x1f2937 }));
      sw.position.set(wx, 0.26, 0); scoot.add(sw);
    });
    const scootBody = box(1.0, 0.22, 0.3, lam({ color: 0x0e7490 })); scootBody.position.set(0, 0.5, 0); scoot.add(scootBody);
    const scootSeat = box(0.45, 0.08, 0.28, lam({ color: 0x1f2937 })); scootSeat.position.set(-0.2, 0.66, 0); scoot.add(scootSeat);
    const scootBar = cyl(0.02, 0.02, 0.4, lam({ color: 0x9ca3af }), 6); scootBar.rotation.x = 0.5; scootBar.position.set(0.5, 0.75, 0); scoot.add(scootBar);
    const stool = cyl(0.28, 0.32, 0.42, lam({ color: 0x6d4a2c }), 12); stool.position.set(-4.4, 0.19, -3.1); S.add(stool);
    const pp = cyl(0.18, 0.14, 0.3, lam({ color: 0x9a5a34 }), 12); pp.position.set(1.3, 0.13, -3.8); S.add(pp);
    [[0, 0.45, 0, 0.16], [-0.1, 0.38, 0.08, 0.12], [0.1, 0.4, -0.06, 0.13]].forEach(([px, py, pz, r]) => {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), lam({ color: 0x4a6b2f }));
      leaf.position.set(1.3 + px, py, -3.8 + pz); S.add(leaf);
    });
  }
  const t1 = mkTree(-6.2, -3.6, 1.05); S.add(t1); galiTrees.push(t1);
  const t2 = mkTree(6.4, -3.4, 0.9); S.add(t2); galiTrees.push(t2);
  const t3 = mkTree(-5.0, -6.5, 1.3); S.add(t3); galiTrees.push(t3);
  const bush = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), lam({ color: 0x3d5c2a }));
  bush.scale.set(1.3, 0.7, 1); bush.position.set(5.8, 0.3, -3.2); S.add(bush);
  const wireMat = lam({ color: 0x2c343c });
  // TAAR FIX (defect 1): taar sign ke UPAR se guzre — sign ka top y=3.3, taar ka sabse neeche
  // point 3.6+ rakha (khamba 4.6 uncha, baanh 4.35). Taar kabhi hero text ke upar se nahi.
  const wirePole1 = cyl(0.04, 0.05, 4.6, lam({ color: 0x39434c })); wirePole1.position.set(-6.5, 2.3, -3.6); S.add(wirePole1);
  const wirePole2 = cyl(0.04, 0.05, 4.6, lam({ color: 0x39434c })); wirePole2.position.set(6.5, 2.3, -3.6); S.add(wirePole2);
  [-6.5, 6.5].forEach((px) => {
    const arm = box(0.9, 0.05, 0.05, lam({ color: 0x39434c })); arm.position.set(px, 4.35, -3.6); S.add(arm);
  });
  [[4.35, -3.4], [4.15, -3.8], [3.95, -3.1]].forEach(([wy, wz]) => {
    S.add(bar2D(-6.5, wy, 0, wy - 0.3, wz, wireMat, 0.015));
    S.add(bar2D(0, wy - 0.3, 6.5, wy, wz, wireMat, 0.015));
  });
  // dhoop me tairte dust motes (roshni dikhti hai)
  for (let i = 0; i < 8; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, opacity: 0.10, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffe9b0 }));
    sp.position.set(-3 + (i * 0.9) % 4.5, 1.2 + (i % 3) * 0.7, -3 + (i % 2) * 1.2);
    sp.scale.setScalar(0.08 + (i % 3) * 0.03);
    scene.add(sp); motes.push(sp);
  }
}

// ---------- WORLD V3 — SHADOWS ----------
galiG.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
midG.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

// =====================================================================
// PROPS — shutter, tempo, parcels, count boards, phone, gallas, register, counter, clock
// =====================================================================
// ---- ROLLING SHUTTER (Salim shop) — top-anchored, scale.y = 1 band, 0.08 khula ----
const shutterG = new THREE.Group(); shutterG.position.set(-2.2, 2.8, -3.38); scene.add(shutterG);
const shutterGeo = new THREE.PlaneGeometry(3.2, 2.8); shutterGeo.translate(0, -1.4, 0);
const shutterSlats = new THREE.Mesh(shutterGeo, lam({ map: shutterTex }));
shutterG.add(shutterSlats);
const shutterRoll = cyl(0.09, 0.09, 3.2, lam({ color: 0x64748b }), 12);
shutterRoll.rotation.z = Math.PI / 2; shutterRoll.position.set(-2.2, 2.95, -3.38); // up — PARCEL POINT text roll ke peeche na dhake (f0362) scene.add(shutterRoll);

// ---- TEMPO (asli mini-truck) — s14 me aata, phir parked ----
// TEMPO REBUILD (defect 2): pehle dabba-pe-pahiye tha — side window nahi, driver nahi,
// headlight sirf saamne. Ab: hood + dheeli windshield + side glass + DRIVER + number plate
// + bade mirror + mud flap. Side se bhi asli tempo lage.
const tempoG = new THREE.Group(); scene.add(tempoG);
const tempoWheels = [];
{
  const bed = box(2.6, 0.12, 1.1, lam({ color: 0x4b5563 })); bed.position.set(0, 0.55, 0); tempoG.add(bed);
  // CAB — neeche darwaza (solid) + upar khidki band (glass) + chhat
  const cabLow = box(0.75, 0.62, 1.05, lam({ color: 0xea580c })); cabLow.position.set(1.05, 0.86, 0); tempoG.add(cabLow); // narangi cab
  const cabRoof = box(0.78, 0.07, 1.08, lam({ color: 0xea580c })); cabRoof.position.set(1.05, 1.58, 0); tempoG.add(cabRoof);
  [[0.7, -0.5], [0.7, 0.5], [1.4, -0.5], [1.4, 0.5]].forEach(([px, pz]) => {
    const pil = box(0.06, 0.42, 0.06, lam({ color: 0xea580c })); pil.position.set(px, 1.37, pz); tempoG.add(pil);
  });
  // dheeli windshield (aage jhuki) + glint
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.5, 0.98), new THREE.MeshPhongMaterial({ color: 0x8fb8d9, shininess: 160, specular: 0xcfeaff, transparent: true, opacity: 0.85 }));
  windshield.rotation.z = -0.3; windshield.position.set(1.42, 1.36, 0); tempoG.add(windshield);
  const wsGlintMat = new THREE.SpriteMaterial({ map: starTex, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }); const wsGlint = new THREE.Sprite(wsGlintMat); wsGlint.position.set(1.46, 1.45, 0.25); wsGlint.scale.setScalar(0.18); tempoG.add(wsGlint); // glint 0.3 -> 0.18 (bada safed dhabba nahi)
  // side windows (halke sheeshe — andar driver dikhe)
  const sideGlassMat = new THREE.MeshPhongMaterial({ color: 0x8fb8d9, shininess: 140, specular: 0xcfeaff, transparent: true, opacity: 0.5 });
  [1, -1].forEach((s) => {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.34), sideGlassMat);
    sw.position.set(1.05, 1.36, s * 0.53); if (s < 0) sw.rotation.y = Math.PI; tempoG.add(sw);
    // darwaze ki seam + handle + side indicator
    const seam = box(0.02, 0.5, 0.015, lam({ color: 0x9a3412 })); seam.position.set(0.78, 0.9, s * 0.53); tempoG.add(seam);
    const handle = box(0.1, 0.03, 0.02, lam({ color: 0x1f2937 })); handle.position.set(1.18, 1.06, s * 0.54); tempoG.add(handle);
    const indi = box(0.03, 0.06, 0.05, lam({ color: 0xf59e0b })); indi.position.set(1.42, 1.02, s * 0.54); tempoG.add(indi);
  });
  // DRIVER — sir + kandhe + steering (side window se dikhe)
  const drvHead = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), lam({ color: 0xa06a3c })); drvHead.position.set(1.02, 1.34, 0.3); tempoG.add(drvHead);
  const drvCap = box(0.16, 0.05, 0.16, lam({ color: 0x1e3a5f })); drvCap.position.set(1.02, 1.42, 0.3); tempoG.add(drvCap);
  const drvTorso = box(0.24, 0.3, 0.3, lam({ color: 0x3b6ea5 })); drvTorso.position.set(1.02, 1.05, 0.3); tempoG.add(drvTorso);
  const drvWheel = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.015, 8, 18), lam({ color: 0x1f2937 })); drvWheel.rotation.y = Math.PI / 2; drvWheel.position.set(1.28, 1.2, 0.3); tempoG.add(drvWheel);
  // HOOD (bonnet) + headlight + grille + bumper + NUMBER PLATE
  const hood = box(0.5, 0.4, 1.0, lam({ color: 0xea580c })); hood.position.set(1.62, 0.78, 0); tempoG.add(hood);
  [-0.32, 0.32].forEach((hz) => {
    const hl = cyl(0.075, 0.075, 0.04, bas({ color: 0xfff7cc }), 12); hl.rotation.z = Math.PI / 2; hl.position.set(1.88, 0.82, hz); tempoG.add(hl);
  });
  const grille = box(0.04, 0.22, 0.45, lam({ color: 0x1f2937 })); grille.position.set(1.88, 0.8, 0); tempoG.add(grille);
  const bumper = box(0.1, 0.15, 1.05, lam({ color: 0x4b5563 })); bumper.position.set(1.9, 0.42, 0); tempoG.add(bumper);
  const plateTex = textBoard(256, 64, (g, w, h) => {
    g.fillStyle = '#f8fafc'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#111827'; g.font = 'bold 40px Arial'; g.textAlign = 'center'; g.fillText('DL 01 • 4521', w / 2, 46);
  });
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.1), lam({ map: plateTex }));
  plate.rotation.y = Math.PI / 2; plate.position.set(1.96, 0.42, 0); tempoG.add(plate);
  // bade side mirror (sheesha chamke) + roof marker lights + mud flap
  [-1, 1].forEach((s) => {
    const arm = box(0.03, 0.03, 0.14, lam({ color: 0x1f2937 })); arm.position.set(1.3, 1.45, s * 0.58); tempoG.add(arm);
    const mir = box(0.04, 0.18, 0.1, new THREE.MeshPhongMaterial({ color: 0xd6dee6, shininess: 120, specular: 0xffffff })); mir.position.set(1.3, 1.45, s * 0.66); tempoG.add(mir);
    const flap = box(0.02, 0.25, 0.3, lam({ color: 0x1f2937 })); flap.position.set(1.18, 0.22, s * 0.56); tempoG.add(flap);
    const flapR = box(0.02, 0.25, 0.3, lam({ color: 0x1f2937 })); flapR.position.set(-1.18, 0.22, s * 0.56); tempoG.add(flapR);
    const marker = box(0.05, 0.04, 0.08, lam({ color: 0xf59e0b })); marker.position.set(1.38, 1.64, s * 0.3); tempoG.add(marker);
  });
  const stripe = box(1.9, 0.18, 1.12, lam({ color: 0x0f766e })); stripe.position.set(-0.35, 1.15, 0); tempoG.add(stripe);
  const bodyBox = box(1.7, 0.9, 1.05, lam({ color: 0xe8e0cc })); bodyBox.position.set(-0.45, 1.05, 0); tempoG.add(bodyBox);
  const bodySignTex = textBoard(512, 128, (g, w, h) => {
    g.fillStyle = '#0f766e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f8fafc'; g.font = 'bold 64px Arial'; g.textAlign = 'center'; g.fillText('PARCEL', w / 2, 86);
  });
  const bodySign = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.22), lam({ map: bodySignTex }));
  bodySign.position.set(-0.45, 1.38, 0.57); tempoG.add(bodySign);
  // FENDERS v2 (tempo = REAL mini-truck, toy-box nahi): har pahiye par mudguard arch +
  // cab ke neeche side step + peeche vertical exhaust pipe.
  [[-0.85, -0.56], [-0.85, 0.56], [0.85, -0.56], [0.85, 0.56]].forEach(([wx, wz]) => {
    const fender = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.05, 8, 14, Math.PI), lam({ color: 0x374151 }));
    fender.position.set(wx, 0.32, wz); tempoG.add(fender);
  });
  [1, -1].forEach((s) => {
    const step = box(0.3, 0.05, 0.25, lam({ color: 0x374151 })); step.position.set(1.05, 0.28, s * 0.56); tempoG.add(step);
  });
  const exhaust = cyl(0.03, 0.03, 0.7, lam({ color: 0x374151 }), 8); exhaust.position.set(0.55, 1.0, -0.5); tempoG.add(exhaust);
  [[-0.85, -0.56], [-0.85, 0.56], [0.85, -0.56], [0.85, 0.56]].forEach(([wx, wz]) => {
    const wh = cyl(0.32, 0.32, 0.1, lam({ color: 0x1f2937 }), 16); wh.rotation.x = Math.PI / 2; wh.position.set(wx, 0.32, wz); tempoG.add(wh);
    const rim = cyl(0.2, 0.2, 0.11, lam({ color: 0xd1d5db }), 16); rim.rotation.x = Math.PI / 2; rim.position.set(wx, 0.32, wz); tempoG.add(rim); // steel rim
    const hub = cyl(0.1, 0.1, 0.12, lam({ color: 0x9ca3af }), 10); hub.rotation.x = Math.PI / 2; hub.position.set(wx, 0.32, wz); tempoG.add(hub);
    tempoWheels.push(wh);
  });
  // load: CARDBOARD parcel — asli delivery parcel (tape + label), lakdi nahi
  const crateMats = [lam({ color: 0xb98a5a }), lam({ color: 0xa87a4e }), lam({ color: 0xc99a62 })]; // cardboard tones vary — real parcels
  const tapeMat = lam({ color: 0xc8a165 });
  [[-1.0, 0.75, 0], [-0.55, 0.75, 0], [-0.8, 1.12, 0], [-1.0, 0.75, 0.35], [-0.55, 0.75, -0.35]].forEach(([cx, cy, cz], ci) => {
    const cr = box(0.42, 0.36, 0.42, crateMats[ci % 3]); cr.position.set(cx, cy, cz); tempoG.add(cr);
    const tp = box(0.44, 0.05, 0.1, tapeMat); tp.position.set(cx, cy + 0.16, cz); tempoG.add(tp);
    const lb = box(0.2, 0.12, 0.01, lam({ color: 0xf8fafc })); lb.position.set(cx, cy, cz + 0.215); tempoG.add(lb); // shipping label
  });
  tempoG.position.set(0.3, 0, -0.9);
  tempoG.visible = false;
}

// ---- PARCEL PILES (street, Salim shop ke saamne) — 20 crates, neeche se upar badhte ----
const parcelCrates = [];
{
  const crateMats = [lam({ color: 0xb98a5a }), lam({ color: 0xa87a4e }), lam({ color: 0xc99a62 })]; // cardboard parcel — tones vary
  const tapeMat = lam({ color: 0xc8a165 });
  const spots = [];
  [-1.5, -1.06, -0.62, -0.18].forEach((x) => [-2.4, -1.9].forEach((z) => spots.push([x, 0.18, z])));
  [-1.4, -0.96, -0.52].forEach((x) => [-2.35, -1.95].forEach((z) => spots.push([x, 0.54, z])));
  [-1.3, -0.7].forEach((x) => [-2.3, -1.95].forEach((z) => spots.push([x, 0.9, z])));
  [-1.0].forEach((x) => [-2.3, -1.95].forEach((z) => spots.push([x, 1.26, z])));
  spots.forEach(([x, y, z], i) => {
    const g = new THREE.Group();
    const cr = box(0.42, 0.36, 0.42, crateMats[i % 3]); g.add(cr);
    const tp = box(0.44, 0.05, 0.1, tapeMat); tp.position.y = 0.16; g.add(tp);
    const lb = box(0.2, 0.12, 0.01, lam({ color: 0xf8fafc })); lb.position.set(0, -0.02, 0.215); g.add(lb); // shipping label
    g.position.set(x, y, z); g.rotation.y = (i % 3) * 0.08 - 0.08;
    g.visible = false; scene.add(g); parcelCrates.push(g);
  });
}
// ---- PARCEL MOUNTAIN (b08 s19b SCALE SHIFT) — 2.2 m uncha parcel ka pahaad; chhota Salim
// uske paas khada = "chhota aadmi + bada number" scale shift. Sirf s19b me dikhe. ----
const parcelMountain = new THREE.Group(); scene.add(parcelMountain);
{
  const crateMats = [lam({ color: 0xb98a5a }), lam({ color: 0xa87a4e }), lam({ color: 0xc99a62 })];
  const tapeMat = lam({ color: 0xc8a165 });
  let mi = 0;
  const layers = [
    { y: 0.18, xs: [-1.42, -1.0, -0.58], zs: [-2.57, -2.15, -1.73] },
    { y: 0.54, xs: [-1.21, -0.79], zs: [-2.36, -1.94] },
    { y: 0.90, xs: [-1.21, -0.79], zs: [-2.36, -1.94] },
    { y: 1.26, xs: [-1.0], zs: [-2.15] },
    { y: 1.62, xs: [-1.0], zs: [-2.15] },
    { y: 1.98, xs: [-1.0], zs: [-2.15] },
  ];
  layers.forEach(({ y, xs, zs }, li) => {
    xs.forEach((x) => zs.forEach((z) => {
      const g = new THREE.Group();
      const cr = box(0.42, 0.36, 0.42, crateMats[mi++ % 3]); g.add(cr);
      const tp = box(0.44, 0.05, 0.1, tapeMat); tp.position.y = 0.16; g.add(tp);
      const lb = box(0.2, 0.12, 0.01, lam({ color: 0xf8fafc })); lb.position.set(0, -0.02, 0.215); g.add(lb);
      g.position.set(x, y, z); g.rotation.y = (li % 2 ? 0.06 : -0.05);
      parcelMountain.add(g);
    }));
  });
  parcelMountain.visible = false;
}
// ---- EK PARCEL (aunty ke haath me, joke beat) ----
const parcelSingleG = new THREE.Group(); scene.add(parcelSingleG);
{
  const cr = box(0.42, 0.36, 0.42, lam({ color: 0xb98a5a })); parcelSingleG.add(cr); // cardboard
  const tp = box(0.44, 0.05, 0.1, lam({ color: 0xc8a165 })); tp.position.y = 0.16; parcelSingleG.add(tp);
  const lb = box(0.2, 0.12, 0.01, lam({ color: 0xf8fafc })); lb.position.set(0, -0.02, 0.215); parcelSingleG.add(lb); // shipping label
  parcelSingleG.visible = false;
}
// ---- COUNT BOARDS HATAYE GAYE (live-action rule, 2026-11-27) — 20/50/100 board par NAHI;
// tempo se utarte parcel + badhta dher (20), phone + dher (50), bheed parcel le jati hui (100).
// Board sirf: dukaan ka naam + hero number ₹40,000. ----

// ---- PHONE (b07) — screen par "50 PARCEL" bada ----
const phoneScreenTex = textBoard(512, 960, (g, w, h) => {
  // PHONE SCREEN round-2: pehle 5 line ka poster tha (card lagta tha) — ab sirf 3 cheezein:
  // header + bada "50 PARCEL" + ACCEPT. Phone chhota (scale 0.3), screen saaf.
  g.fillStyle = '#fef9ec'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#0f766e'; g.fillRect(0, 0, w, 110);
  g.fillStyle = '#f8fafc'; g.font = 'bold 58px Arial'; g.textAlign = 'center'; g.fillText('PARCEL POINT', w / 2, 76);
  g.fillStyle = '#c2410c'; g.font = 'bold 120px Arial'; g.fillText('50', w / 2, 380);
  g.fillStyle = '#c2410c'; g.font = 'bold 88px Arial'; g.fillText('PARCEL', w / 2, 500);
  g.fillStyle = '#16a34a'; g.fillRect(24, 600, w - 48, 130);
  g.fillStyle = '#f8fafc'; g.font = 'bold 64px Arial'; g.fillText('✓ ACCEPT', w / 2, 690);
});
const phoneG = new THREE.Group(); scene.add(phoneG);
{
  const body = box(0.8, 1.5, 0.06, lam({ color: 0x1f2937 })); phoneG.add(body);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 1.42), lam({ map: phoneScreenTex }));
  screen.position.z = 0.035; phoneG.add(screen);
  phoneG.position.set(-1.6, 1.7, -1.6); phoneG.rotation.y = -0.15; phoneG.visible = false;
}

// ---- GALLA — Salim (mez par) + Seth (kirana counter par) ----
const salimGallaG = new THREE.Group(); scene.add(salimGallaG);
let salimLid = null;
{
  const gbox = box(0.55, 0.28, 0.4, lam({ map: tex(planks(43), 1, 1) })); gbox.position.set(-2.05, 0.99, -3.85); salimGallaG.add(gbox);
  const salimLock = box(0.08, 0.06, 0.02, lam({ color: 0x9ca3af })); salimLock.position.set(-2.05, 1.0, -3.64); salimGallaG.add(salimLock); // dhatu ka taala
  const lidGeo = new THREE.BoxGeometry(0.55, 0.04, 0.4); lidGeo.translate(0, 0, 0.2);
  salimLid = new THREE.Mesh(lidGeo, lam({ map: tex(planks(45), 1, 1) }));
  salimLid.position.set(-2.05, 1.14, -4.05); salimGallaG.add(salimLid);
  for (let i = 0; i < 3; i++) {
    const n = box(0.3, 0.015, 0.2, lam({ color: i % 2 ? 0xd9f99d : 0xbbf7d0 }));
    n.position.set(-2.05 + (i - 1) * 0.02, 1.10 + i * 0.012, -3.85); n.rotation.y = (i - 1) * 0.12; salimGallaG.add(n);
  }
}
const notesHeapSalim = new THREE.Group(); scene.add(notesHeapSalim);
{
  // NOTE-DHER FIX (defect 9): pehle 6 patle pale note the — paper lagte the, dikhte nahi.
  // Ab 10 moti HARI gaddi (band ke saath) + galle ke andar khade note + mez par bikhre note.
  for (let i = 0; i < 10; i++) {
    const n = box(0.34, 0.016, 0.18, lam({ color: i % 2 ? 0x3f9e4d : 0x6fbf73 }));
    n.position.set(-1.45 + (i % 3 - 1) * 0.09, 0.89 + i * 0.016, -3.7 + (Math.floor(i / 3) - 1) * 0.09);
    n.rotation.y = (i % 4 - 1.5) * 0.35; notesHeapSalim.add(n);
  }
  const band = box(0.08, 0.03, 0.19, lam({ color: 0xf8fafc })); band.position.set(-1.45, 1.055, -3.7); notesHeapSalim.add(band);
  notesHeapSalim.visible = false;
}
// galle ke andar khade note — dhakkan khula ho to rim se upar dikhe
const notesInsideSalim = new THREE.Group(); scene.add(notesInsideSalim);
{
  for (let i = 0; i < 5; i++) {
    const n = box(0.3, 0.28, 0.012, lam({ color: i % 2 ? 0x3f9e4d : 0x6fbf73 }));
    n.position.set(-2.05 + (i - 2) * 0.05, 1.12, -3.85 + (i - 2) * 0.02); n.rotation.z = (i - 2) * 0.12; notesInsideSalim.add(n);
  }
  notesInsideSalim.visible = false;
}
// mez par bikhre note — galla bhara hua lage
const notesSpill = new THREE.Group(); scene.add(notesSpill);
{
  for (let i = 0; i < 4; i++) {
    const n = box(0.3, 0.012, 0.15, lam({ color: i % 2 ? 0x3f9e4d : 0x6fbf73 }));
    n.position.set(-2.35 + (i % 2) * 0.28, 0.89 + (i > 1 ? 0.012 : 0), -3.55 + (Math.floor(i / 2) - 0.5) * 0.2);
    n.rotation.y = (i - 1.5) * 0.5; notesSpill.add(n);
  }
  notesSpill.visible = false;
}
// HAATH KE PROPS — pen (register likhna) + kapda (mez saaf) — haath kabhi khaali nahi
const penMesh = box(0.02, 0.02, 0.14, lam({ color: 0x1e3a8a })); penMesh.position.set(-2.55, 0.93, -3.7); penMesh.visible = false; scene.add(penMesh);
const wipeCloth = box(0.18, 0.02, 0.12, lam({ color: 0xfef3c7 })); wipeCloth.position.set(-1.95, 0.9, -3.6); wipeCloth.visible = false; scene.add(wipeCloth);
const sethGallaG = new THREE.Group(); scene.add(sethGallaG);
let sethLid = null;
const sethCoins = [];
{
  const gbox = box(0.55, 0.28, 0.4, lam({ map: tex(planks(44), 1, 1) })); gbox.position.set(2.9, 0.99, -3.85); sethGallaG.add(gbox);
  const sethLock = box(0.08, 0.06, 0.02, lam({ color: 0x9ca3af })); sethLock.position.set(2.9, 1.0, -3.64); sethGallaG.add(sethLock); // dhatu ka taala
  const lidGeo = new THREE.BoxGeometry(0.55, 0.04, 0.4); lidGeo.translate(0, 0, 0.2);
  sethLid = new THREE.Mesh(lidGeo, lam({ map: tex(planks(46), 1, 1) }));
  sethLid.position.set(2.9, 1.14, -4.05); sethGallaG.add(sethLid);
  for (let i = 0; i < 3; i++) {
    const c = cyl(0.07, 0.07, 0.025, lam({ color: 0xfacc15 }), 10);
    c.position.set(2.83 + i * 0.09, 1.15, -3.85); sethGallaG.add(c); sethCoins.push(c); // upar — galla ke kinare se dikhe (f1007/f1036)
  }
}
// ---- REGISTER (mez par khuli kitab) — hamesha dikhe (set ka hissa) ----
const registerG = new THREE.Group(); scene.add(registerG);
{
  const pageTex = textBoard(512, 320, (g, w, h) => {
    g.fillStyle = '#fef9ec'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#92400e'; g.lineWidth = 6; g.strokeRect(8, 8, w - 20, h - 20);
    g.textAlign = 'center'; g.fillStyle = '#92400e';
    g.font = 'bold 44px Arial'; g.fillText('PARCEL REGISTER', w / 2, 64);
    g.strokeStyle = '#94a3b8'; g.lineWidth = 3;
    for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(40, 110 + i * 36); g.lineTo(w - 40, 110 + i * 36); g.stroke(); }
    g.fillStyle = '#16a34a'; g.font = 'bold 36px Arial'; g.fillText('✓  ✓  ✓', w / 2, 290);
  });
  const pgL = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.2), lam({ map: pageTex }));
  pgL.rotation.x = -Math.PI / 2 + 0.18; pgL.rotation.y = 0.12; pgL.position.set(-2.94, 0.9, -3.85); registerG.add(pgL);
  const pgR = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.2), lam({ map: pageTex }));
  pgR.rotation.x = -Math.PI / 2 - 0.18; pgR.rotation.y = -0.12; pgR.position.set(-2.66, 0.9, -3.85); registerG.add(pgR);
  const cover = box(0.62, 0.02, 0.42, lam({ color: 0x7c2d12 })); cover.position.set(-2.80, 0.885, -3.85); registerG.add(cover);
}
// ---- COUNTER BOARD (b11) — "MAHINE KA GALLA ₹40,000" gin kar badhta hai + HOLD ----
const counterCanvas = document.createElement('canvas'); counterCanvas.width = 512; counterCanvas.height = 360;
const counterCtx = counterCanvas.getContext('2d');
const counterTex = new THREE.CanvasTexture(counterCanvas); counterTex.colorSpace = THREE.SRGBColorSpace;
let lastCounterVal = -1;
function drawCounter(v) {
  const qv = Math.floor(v / 500) * 500;
  if (qv === lastCounterVal) return; lastCounterVal = qv;
  const g = counterCtx;
  g.fillStyle = '#134e4a'; g.fillRect(0, 0, 512, 360);
  g.strokeStyle = '#facc15'; g.lineWidth = 8; g.strokeRect(10, 10, 492, 340);
  g.textAlign = 'center'; g.fillStyle = '#f8fafc';
  g.font = 'bold 40px Arial'; g.fillText('MAHINE KA GALLA', 256, 70);
  g.fillStyle = '#facc15'; g.font = 'bold 84px Arial'; g.fillText('₹' + qv.toLocaleString('en-IN'), 256, 190);
  g.fillStyle = '#f8fafc'; g.font = 'bold 36px Arial'; g.fillText('PARCEL • SALIM', 256, 280);
  counterTex.needsUpdate = true;
}
const counterBoard = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.85), lam({ map: counterTex }));
counterBoard.position.set(-2.3, 2.2, -3.3); counterBoard.visible = false; scene.add(counterBoard); // neeche — roll se upar ka text na kate
// ---- ₹40,000 TAG (b01 s02) — sunehra gol tag, pop ----
const tag40Tex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#facc15'; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.fill();
  g.strokeStyle = '#a16207'; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 102, 0, 7); g.stroke();
  g.fillStyle = '#451a03'; g.textAlign = 'center';
  g.font = 'bold 52px Arial'; g.fillText('₹40,000', 128, 118);
  g.font = 'bold 36px Arial'; g.fillText('MAHINA', 128, 168);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const tag40 = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.55), new THREE.MeshLambertMaterial({ map: tag40Tex, transparent: true, depthWrite: false }));
tag40.position.set(-1.4, 2.3, -2.2); tag40.visible = false; scene.add(tag40);
const tag40String = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.3), lam({ color: 0x7f1d1d }));
tag40String.position.set(-1.4, 2.62, -2.21); tag40String.visible = false; scene.add(tag40String);
// ---- WALL CLOCK (Salim shop, back wall) — hands beat par set hote hain ----
const clockG = new THREE.Group(); scene.add(clockG);
let clockHour = null, clockMin = null;
{
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), lam({ map: clockTex }));
  clockG.add(face);
  const hourGeo = new THREE.BoxGeometry(0.03, 0.15, 0.01); hourGeo.translate(0, 0.065, 0);
  clockHour = new THREE.Mesh(hourGeo, lam({ color: 0x1e293b })); clockHour.position.z = 0.01; clockG.add(clockHour);
  const minGeo = new THREE.BoxGeometry(0.02, 0.22, 0.01); minGeo.translate(0, 0.1, 0);
  clockMin = new THREE.Mesh(minGeo, lam({ color: 0x1e293b })); clockMin.position.z = 0.015; clockG.add(clockMin);
  clockG.position.set(-1.5, 2.45, -4.22);
// ---- DEEWAAR SHEESHA (mirror) — Salim shop back wall, reference ka mirror look ----
// MIRROR FIX v2 (defect 2): x -1.35 -> -0.85 — almari shift ke baad deewaar ka dayein hissa
// poora khaali hai; sheesha ab kisi upright/shelf ke peeche NAHI, poora saaf dikhega.
const mirrorFrame = box(0.56, 0.76, 0.03, lam({ color: 0x5b3a1e })); mirrorFrame.position.set(-0.85, 1.6, -4.24); scene.add(mirrorFrame);
const mirrorFace = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.68), new THREE.MeshPhongMaterial({ color: 0xbfd9e2, shininess: 120, specular: 0xffffff })); mirrorFace.position.set(-0.85, 1.6, -4.22); scene.add(mirrorFace);
const mirrorGlint = mkGlint(-0.85, 1.78, -4.2, 0.35); mirrorGlint.material.opacity = 0.5;
}
// ---- CHIDIYA (b05 joke — background movement) ----
const bird = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.07), bas({ color: 0x1f2937, side: THREE.DoubleSide }));
bird.visible = false; scene.add(bird);
// board chamak
const glintSign = mkGlint(-2.2, 3.3, -3.3, 0.5);
const glintGalla = mkGlint(-2.05, 1.3, -3.3, 0.5);
const glintBoard = mkGlint(-2.0, 2.5, -3.2, 0.5);

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
  farClouds.forEach((sp, i) => { sp.position.x = -18 + i * 12 + Math.sin(f * 0.002 + i * 2) * 0.8; });
  motes.forEach((sp, i) => {
    sp.position.y += Math.sin(f * 0.05 + i * 2.1) * 0.0012;
    sp.position.x += Math.cos(f * 0.02 + i) * 0.0009;
  });
  skylineG.visible = true;
  midG.visible = true;
  ALL_CARDS.forEach((c) => c.hide());
  const cp = cam.pos;
  galiG.visible = true;
  lampLight.intensity = (env.lamp || 0);
  chandLight.intensity = 0;
  officeLight.intensity = 0;
  galiTrees.forEach((t, i) => { t.rotation.z = Math.sin(f * 0.03 + i * 1.7) * 0.018; });
  // ---- props default band (har shot me reset — sirf apne shot me dikhe) ----
  glintSign.material.opacity = 0; glintGalla.material.opacity = 0; glintBoard.material.opacity = 0;
  shutterSlats.scale.y = 0.08; // default: dukaan khuli
  tempoG.visible = false;
  parcelCrates.forEach((m) => { m.visible = false; });
  parcelMountain.visible = false;
  if (lightCone) lightCone.visible = (shot.env === 'evening'); // lamp cone sirf shaam me
  if (dogTail) dogTail.rotation.z = -0.9 + Math.sin(f * 0.15) * 0.25; // kutte ki poonchh hilti rahe
  parcelSingleG.visible = false;
  phoneG.visible = false; phoneG.scale.setScalar(1); phoneG.rotation.set(0, -0.15, 0);
  if (salimLid) salimLid.rotation.x = 0;
  if (sethLid) sethLid.rotation.x = 0;
  sethCoins.forEach((m) => { m.visible = true; });
  notesHeapSalim.visible = false;
  // CONTINUITY FIX v2 (v1 bug): notesInside/notesSpill kabhi reset nahi hote the — b03 ke baad
  // band galle ke upar se note jhaankte rehte the. Ab har frame band, sirf apne beat me khulte.
  notesInsideSalim.visible = false;
  notesSpill.visible = false;
  counterBoard.visible = false;
  tag40.visible = false; tag40String.visible = false;
  bird.visible = false;
  const fl = FLASH[id];
  flashPlane.material.opacity = fl ? Math.max(0, 1 - Math.abs(f - fl.at) / (fl.dur / 2)) : 0;
  // ghadi ki suiyaan — subah 7, dopahar 12, shaam 5
  if (clockHour && clockMin) {
    const hr = (shot.env === 'morning') ? 7 : (shot.env === 'evening' ? 5 : 12);
    clockHour.rotation.z = -(hr / 12) * Math.PI * 2;
    clockMin.rotation.z = 0;
  }

  // ---- beat dispatch (58 shots, 13 beats) — v2 re-cut ----
  // Animation continuity: walk / tag-pop / shutter / tempo / bird / lids BEAT-based
  // (frame f se), NOT shot-u based — taaki sub-shot cut par pose teleport na ho.
  const beat = BEAT_OF[id], bu = beatU(f), sub = shot.sub;
  switch (beat) {
    case 'b01': { // HOOK — s01a/s01b walk-in, s02a/s02b tag, s03a/s03b shutter opens
      const wx = -4.0 + 2.0 * clamp(f / 40, 0, 1); // walk beat-based: f0 -4.0 -> f40 -2.0
      if (sub === 0 || sub === 1) {
        shutterSlats.scale.y = 1; // band shutter
        drawChar(salimCard, 81, SALIM, 'dazed', 'hang', 'hang', f, cp, wx, 0, -1.2, 1.0, (f * 0.12) % 1, null, 0, mouthFor(f), false); // bore hua dukaanwala — kuch nahi bikta
      } else if (sub === 2 || sub === 3) {
        shutterSlats.scale.y = 1;
        const pop = clamp(((f - 40) / 35) * 4, 0, 1);
        tag40.visible = true; tag40String.visible = true;
        tag40.scale.setScalar(Math.max(0.01, pop)); tag40.material.opacity = pop;
        drawChar(salimCard, 81, SALIM, 'wonder', 'hang', 'hang', f, cp, -2.2, 0, -2.0, 1.2, 0, null, 0, mouthFor(f), false);
        glintSign.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3);
      } else {
        const sp = clamp((f - 75) / 36, 0, 1);
        shutterSlats.scale.y = 1 - Math.min(sp * 4, 1) * 0.92; // FAST open — fully open by f84
        drawChar(salimCard, 81, SALIM, 'smile', 'up', 'hang', f, cp, -2.2, 0, -2.2, 1.0, 0, null, 0, mouthFor(f), false);
      }
      break;
    }
    case 'b02': { // SUBAH KHAALI — s04a wide (+cobweb), s04b MIRROR hero, s05a/s05b register, s06a/s06b mez saaf (+bell)
      if (sub === 0 || sub === 1) {
        drawChar(salimCard, 81, SALIM, 'smile', 'reach', 'hang', f, cp, -2.2, 0, -3.0, 1.0, 0, 0.3, 0, mouthFor(f), false);
      } else if (sub === 2 || sub === 3) {
        // register me naam likhta — baaya haath register ki taraf, pen mez par
        drawChar(salimCard, 81, SALIM, 'smile', 'hang', 'reach', f, cp, -2.4, 0, -3.0, 1.0, 0, 0.3, 0, mouthFor(f), false);
        penMesh.visible = true;
      } else {
        // mez saaf karta — kapda haath me, mez par ragda (s06b me ulta phase)
        drawChar(salimCard, 81, SALIM, 'smile', 'reach', 'hang', f, cp, -2.2, 0, -3.0, 1.0, 0, null, 2, mouthFor(f), false);
        wipeCloth.visible = true;
        wipeCloth.position.x = -1.95 + Math.sin(f * 0.25 + (sub === 5 ? 2 : 0)) * 0.12;
      }
      break;
    }
    case 'b03': { // SHAAM GALLA — s07a/s07b shutter closing (+light cone), s08a/s08b galla (withheld #1)
      if (sub === 0 || sub === 1) {
        const sp = clamp((f - 251) / 39, 0, 1);
        shutterSlats.scale.y = 0.08 + sp * 0.92; // shutter neeche
        drawChar(salimCard, 81, SALIM, 'neutral', 'hang', 'hang', f, cp, -2.2, 0, -2.2, 1.0, 0, null, 0, mouthFor(f), false);
      } else {
        shutterSlats.scale.y = 0.35; // shutter aadha band — gap se Salim + galla dikhe
        // FACE FIX (defect 4): Salim dayein + aage (-2.65, -3.55) — chehra galle ke peeche
        // nahi, poora dikhe; dhakkan aadha khula (-1.2) taaki note andar se dikhe.
        drawChar(salimCard, 81, SALIM, 'smile', 'reach', 'hang', f, cp, -2.65, 0, -3.55, 0.95, 0, 0.3, 0, mouthFor(f), false);
        const lb = clamp((f - 290) / 35, 0, 1);
        if (salimLid) salimLid.rotation.x = -1.2 * M.surge(lb);
        notesInsideSalim.visible = true;
        notesHeapSalim.visible = true;
        notesSpill.visible = true;
        glintGalla.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3);
      }
      break;
    }
    case 'b04': { // SALIM INTRO — s09a/s09b medium, s10a/s10b point (+ MIRROR hero s10b)
      if (sub === 0 || sub === 1) {
        drawChar(salimCard, 81, SALIM, 'smile', 'hang', 'hang', f, cp, -2.2, 0, -2.2, 1.05, 0, null, 0, mouthFor(f), false);
      } else {
        drawChar(salimCard, 81, SALIM, 'smile', 'point', 'hang', f, cp, -2.2, 0, -2.6, 1.0, 0, null, 0, mouthFor(f), false);
      }
      break;
    }
    case 'b05': { // JOKE — s11a/s11b two-shot, s12a/s12b grin CU + bird, s13a/s13b aunty laughs
      if (sub === 0 || sub === 1) {
        drawChar(salimCard, 81, SALIM, 'neutral', 'hang', 'hang', f, cp, -2.2, 0, -2.4, 1.0, 0, null, 0, mouthFor(f), false);
        drawChar(auntyCard, 85, CUST_AUNTY, 'wonder', 'point', 'hang', f, cp, -0.9, 0, -1.8, 0.95, 0, null, 0, null, false);
      } else if (sub === 2 || sub === 3) {
        drawChar(salimCard, 81, SALIM, 'grin', 'hang', 'hang', f, cp, -2.2, 0, -2.2, 1.2, 0, null, 0, mouthFor(f), false);
        bird.visible = true;
        bird.position.set(-5 + 5.5 * clamp((f - 480) / 60, 0, 1), 4.5 + Math.sin(f * 0.1) * 0.2, -8); // frame ke andar se ude
        bird.rotation.z = Math.sin(f * 0.2) * 0.2;
      } else {
        drawChar(salimCard, 81, SALIM, 'laugh', 'hang', 'hang', f, cp, -2.2, 0, -2.4, 1.0, 0, null, 0, null, false);
        drawChar(auntyCard, 85, CUST_AUNTY, 'laugh', 'reach', 'hang', f, cp, -0.7, 0, -1.8, 0.95, 0, 0.3, 0, null, false);
        parcelSingleG.visible = true;
        parcelSingleG.position.set(-0.7, 0.85, -1.7); // pet par — chehra saaf (f0554/f0581)
      }
      break;
    }
    case 'b06': { // TEMPO 20 — s14a/s14b tempo drives in, s15a/s15b unload (pile 1->12)
      const tp = clamp((f - 595) / 45, 0, 1); // tempo drive beat-based
      if (sub === 0 || sub === 1) {
        tempoG.visible = true;
        tempoG.position.set(-8 + 8.3 * M.easeOut(tp), 0, -0.9);
        tempoG.rotation.z = Math.sin(f * 0.3) * 0.008; // gaadi chalti hui halki hile
        drawChar(salimCard, 81, SALIM, 'wonder', 'hang', 'hang', f, cp, -1.5, 0, -1.8, 1.0, 0, null, 0, mouthFor(f), false);
      } else {
        tempoG.visible = true;
        tempoG.position.set(0.3, 0, -0.9);
        tempoG.rotation.z = 0;
        const n = 1 + Math.floor(bu * 11);
        parcelCrates.forEach((m, i) => { m.visible = i < n; });
        drawChar(salimCard, 81, SALIM, 'smile', 'reach', 'hang', f, cp, -1.7, 0, -1.6, 1.0, 0, 0.3, 0, mouthFor(f), false);
        drawChar(manCard, 87, CUST_MAN, 'smile', 'reach', 'hang', f, cp, -2.3, 0, -1.6, 1.0, 0, 0.35, 0, null, false);
        parcelSingleG.visible = true; parcelSingleG.position.set(-2.0, 1.0, -1.5); // aadmi parcel haath me pakde
      }
      break;
    }
    case 'b07': { // PHONE 50 — s16a rings, s16b picks up, s17a ECU, s17b phone + pile 14
      // PHONE scale 0.3, Salim ke haath ke paas.
      phoneG.visible = true;
      phoneG.scale.setScalar(0.3);
      if (sub === 0) {
        phoneG.position.set(-1.9, 1.35, -2.05);
        phoneG.rotation.set(0, -0.15, Math.sin(f * 0.6) * 0.08);
        drawChar(salimCard, 81, SALIM, 'wonder', 'reach', 'hang', f, cp, -2.2, 0, -2.2, 1.0, 0, 0.3, 0, mouthFor(f), false);
        parcelCrates.forEach((m, i) => { m.visible = i < 12; });
      } else if (sub === 1) {
        phoneG.position.set(-1.85, 1.4, -2.0);
        phoneG.rotation.set(0, -0.15, 0);
        drawChar(salimCard, 81, SALIM, 'wonder', 'reach', 'hang', f, cp, -2.2, 0, -2.2, 1.0, 0, 0.3, 0, mouthFor(f), false);
        parcelCrates.forEach((m, i) => { m.visible = i < 12; });
      } else {
        phoneG.position.set(-1.85, 1.4, -2.0);
        phoneG.rotation.set(0, -0.15, 0);
        drawChar(salimCard, 81, SALIM, 'wonder', 'reach', 'hang', f, cp, -2.2, 0, -2.2, 1.0, 0, 0.3, 0, mouthFor(f), false);
        parcelCrates.forEach((m, i) => { m.visible = i < 14; });
      }
      break;
    }
    case 'b08': { // CROWD 100 — s18a/s18b walk-in, s19a settled crowd, s19b SCALE-SHIFT mountain
      tempoG.visible = true;
      tempoG.position.set(2.8, 0, -0.5); // tempo side me — bheed dikhe, tempo block na kare
      if (sub === 0 || sub === 1) {
        // WALK-IN beat-based (f759-800): log chalte hue aate hain — khade hoke nahi
        const wp = clamp((f - 759) / 41, 0, 1), wk = (f * 0.12) % 1;
        const ax = 0.6 - 0.8 * wp, mx = -0.3 - 0.6 * wp, kx = -2.8 + 0.4 * wp;
        parcelCrates.forEach((m, i) => { m.visible = i < 16; });
        drawChar(salimCard, 81, SALIM, 'smile', 'reach', 'hang', f, cp, -2.0, 0, -1.6, 1.0, 0, 0.3, 0, mouthFor(f), false);
        drawChar(auntyCard, 85, CUST_AUNTY, 'smile', 'reach', 'hang', f, cp, ax, 0, -1.3, 0.95, 0, 0.3, wk, null, false);
        drawChar(manCard, 87, CUST_MAN, 'smile', 'reach', 'hang', f, cp, mx, 0, -1.2, 1.0, 0, 0.35, wk, null, false);
        parcelSingleG.visible = true; parcelSingleG.position.set(mx, 0.85, -1.1); // aadmi parcel le ja raha hai — uske saath chale
        drawChar(kidCard, 89, CUST_KID, 'smile', 'hang', 'hang', f, cp, kx, 0, -1.1, 0.7, 0, null, wk, null, false);
      } else if (sub === 2) {
        parcelCrates.forEach((m, i) => { m.visible = i < 20; });
        drawChar(salimCard, 81, SALIM, 'laugh', 'up', 'hang', f, cp, -2.0, 0, -1.6, 1.0, 0, null, 0, null, false);
        drawChar(auntyCard, 85, CUST_AUNTY, 'smile', 'reach', 'hang', f, cp, -0.3, 0, -1.5, 0.95, 0, 0.3, 0, null, false);
        parcelSingleG.visible = true; parcelSingleG.position.set(-0.3, 0.85, -1.4); // aunty parcel le ja rahi hai — pet par, chehra saaf
        drawChar(manCard, 87, CUST_MAN, 'smile', 'reach', 'hang', f, cp, -0.9, 0, -1.2, 1.0, 0, 0.35, 0, null, false);
        drawChar(kidCard, 89, CUST_KID, 'smile', 'hang', 'hang', f, cp, -2.4, 0, -1.1, 0.7, 0, null, 0, null, false);
      } else { // sub 3 = s19b SCALE SHIFT — mountain replaces the normal pile
        parcelMountain.visible = true;
        drawChar(salimCard, 81, SALIM, 'wonder', 'up', 'hang', f, cp, -1.0, 0, -1.2, 0.8, 0, null, 0, mouthFor(f), false);
      }
      break;
    }
    case 'b09': { // DO DUKAAN — s20a/s20b two-shop wide, s21a/s21b Seth counts (lid PARTWAY — withheld)
      if (sub === 0 || sub === 1) {
        tempoG.visible = false; // tempo nahi — dono dukaan saaf dikhe
        drawChar(salimCard, 81, SALIM, 'neutral', 'hang', 'hang', f, cp, -2.2, 0, -2.4, 1.0, 0, null, 0, mouthFor(f), false);
        drawChar(sethCard, 83, SETH, 'smile', 'hip', 'hang', f, cp, 2.6, 0, -2.4, 1.0, 0, null, 0, null, false);
      } else {
        drawChar(sethCard, 83, SETH, 'smile', 'reach', 'hang', f, cp, 2.6, 0, -3.0, 1.0, 0, 0.3, 0, null, false);
        const lb9 = clamp((f - 890) / 45, 0, 1);
        if (sethLid) sethLid.rotation.x = -0.9 * M.surge(lb9); // PARTWAY only — poora sach abhi nahi
      }
      break;
    }
    case 'b10': { // TWIST — s22a/s22b both gallas open, s23a/s23b Seth pained+sweat+slump, s24a/s24b/s24c Salim grin
      if (sub === 0 || sub === 1) {
        tempoG.visible = false; // tempo nahi — dono galle + dono dukaan saaf dikhe
        // TWIST: Salim + Seth BADE (scale 1.15) aur beech ki taraf (-2.45 / 2.05),
        // taaki wide camera me dono chehre + dono galle saaf dikhe, kinare na katein.
        drawChar(salimCard, 81, SALIM, 'wonder', 'reach', 'hang', f, cp, -2.45, 0, -3.0, 1.15, 0, 0.3, 0, mouthFor(f), false);
        drawChar(sethCard, 83, SETH, 'wonder', 'reach', 'hang', f, cp, 2.05, 0, -3.0, 1.15, 0, 0.3, 0, null, false);
        const lb = clamp((f - 943) / 50, 0, 1);
        if (salimLid) salimLid.rotation.x = -1.9 * M.surge(lb);
        if (sethLid) sethLid.rotation.x = -1.9 * M.surge(lb);
        notesInsideSalim.visible = true;
        notesHeapSalim.visible = true;
        notesSpill.visible = true;
      } else if (sub === 2 || sub === 3) {
        // SETH PAKDA GAYA: pained + PASEENA (sweat=true) + SLUMP (tilt=-1) — rival bhaav-graph ka ant
        drawChar(sethCard, 83, SETH, 'pained', 'hang', 'hang', f, cp, 2.6, 0, -3.0, 1.1, 0, null, -1, null, false, true);
        if (sethLid) sethLid.rotation.x = -1.9;
        sethCoins.forEach((m, i) => { m.visible = i < 3; });
      } else {
        drawChar(salimCard, 81, SALIM, 'grin', 'reach', 'hang', f, cp, -2.7, 0, -3.0, 1.1, 0, 0.35, 0, mouthFor(f), false);
        if (salimLid) salimLid.rotation.x = -1.9;
        notesHeapSalim.visible = true;
        notesInsideSalim.visible = true;
        notesSpill.visible = true;
        glintGalla.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3);
      }
      break;
    }
    case 'b11': { // GALLA ₹40,000 — s25a board gin kar badhe, s26a HOLD wide (counter beat-based)
      drawChar(salimCard, 81, SALIM, 'smile', 'reach', 'hang', f, cp, -2.2, 0, -2.6, 1.0, 0, 0.3, 0, mouthFor(f), false);
      if (salimLid) salimLid.rotation.x = -1.9;
      counterBoard.visible = true;
      const cp11 = clamp(bu / 0.75, 0, 1);
      drawCounter(40000 * (cp11 * cp11 * (3 - 2 * cp11)));
      glintBoard.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3);
      if (sub === 1) { notesHeapSalim.visible = true; notesInsideSalim.visible = true; notesSpill.visible = true; }
      break;
    }
    case 'b12': { // SUBAH PHIR — s27a shutter FAST opens, s27b open (clock fully visible)
      const sp = clamp((f - 1179) / 53, 0, 1);
      shutterSlats.scale.y = 1 - Math.min(sp * 4, 1) * 0.92; // fully open by f1192 — ghadi kabhi aadhi dhaki nahi
      drawChar(salimCard, 81, SALIM, 'smile', 'up', 'hang', f, cp, -2.2, 0, -2.2, 1.0, 0, null, 0, mouthFor(f), false);
      break;
    }
    case 'b13': { // LOOP — s28a/s28b Salim+dher, s29a loop medium, s29b aerial pull-back, s29c push-in FREEZE
      tempoG.visible = (sub !== 2); // s29a (sub 2) me tempo right edge par kata dikhta tha (f1313) — hide karo; s29b aerial me poora dikhta hai
      tempoG.position.set(1.85, 0, -1.0); // right — s28a me box kata hua na dikhe (f1256); s29b aerial me tempo andar rahe
      parcelCrates.forEach((m, i) => { m.visible = i < 20; });
      if (sub === 4) {
        drawChar(salimCard, 81, SALIM, 'relief', 'up', 'hang', f, cp, -2.3, 0, -1.4, 1.05, 0, null, 0, null, false);
        glintSign.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3);
      } else {
        drawChar(salimCard, 81, SALIM, 'smile', 'reach', 'hang', f, cp, -2.3, 0, -1.4, 1.0, 0, 0.3, 0, mouthFor(f), false);
        drawChar(manCard, 87, CUST_MAN, 'smile', 'reach', 'hang', f, cp, -1.7, 0, -1.2, 1.0, 0, 0.35, 0, null, false);
      }
      break;
    }
  }
  updateProxiesW();
  renderer.render(scene, camera);
};
window.TOTAL = TOTAL;
window.ready = Promise.resolve();
