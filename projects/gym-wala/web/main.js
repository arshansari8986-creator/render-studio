// "Gym Wala" — FULL FILM v4 (53 shots, 2025f @30fps = 67.49 s). Title: "Gym Khaali, ₹5 Lakh Kamai!"
// 5 locations (A street / B gym / C member-home / O office / P park) + counter set piece (loc B).
// SPEAKER-VISIBLE RULE (user, 27 Nov ~18:18 IST): jo bolega, woh scene me LIVE dikhega —
// har shot me speaker===who (story.js assert); member beats me member on-screen acting karta
// hai, hero narration voiceover hai (mouth null, lip-sync nahi). Lip-sync SIRF hero shots me.
// Fresh hero v3/v4: red tee #dc2626, yellow towel #facc15, skin #96603a, flat-top hair,
// thick brows, moustache, RED WHISTLE on black lanyard (signature prop — hero shots me).
// World V3: LIT materials ONLY (lam() + paint.js textures) + soft shadows + warm + cool light
// in every shot. MeshBasicMaterial ONLY for flash plane / glints / light-bulb glow — never
// for a visible surface. ENVELOPE LIP-SYNC ON (envelope.js from tight master; hero speak
// on every shot, mouth = smoothed ENV, gain 1.7, <0.035 closed) + expression morph 12f.
// NO captions, NO music. Numbers as objects: fee board (B indoor + A-board street), till +
// GALLA board (counter), cancelled member-cards pile (q30), phone notification/clock (diegetic).
// LAYOUT LOCK: every prop's base touches a surface; hero text/face inside frame with margin.
// Contract: window.ready, window.renderFrame(f).
import * as THREE from 'three';
import * as FX from './fx.js';
import * as T from './toon.js';
import { idle, blinkAt, walk, q, M, clamp } from './motion.js';
import { tex, planks, plaster, stone, dirt, wetConcrete, tiles, tinRoof, marble } from './paint.js';
import { TOTAL, shotAt, camFor, FLASH, heroExprAt, memberExprAt, mouthKind, tillAngle, shutterOpen, monthFor } from './story.js';
import { buildStreet, buildHome, buildOffice, buildPark } from './locations.js';

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
// Member figures (v4): scene root par, kisi location group ke andar NAHI — sirf ek visible
// per frame (who ke hisaab se). Member-Orange (seed 201) / Member-Purple (seed 202).
const memberOrangeCard = new Card();
const memberPurpleCard = new Card();
const ALL_CARDS = [heroCard, memberOrangeCard, memberPurpleCard, ...crowdCards];
// FRESH — HERO v3 (GULLAK FRESHNESS RULE, 27 Nov 2026 — v1 hero SUPERSEDED):
// naya vyakti — bright red tee #dc2626 (navy ki jagah), PEELA towel #facc15 (safed ki jagah),
// skin gehra #96603a, baal short flat-top (hairStyle 'thick' + uncha hairLine 0.30,
// side-part ki lattein nahi), MOTI seedhi bhaavein (brows), halki moochh.
// Laal whistle + kaala lanyard waise hi (signature prop).
const HERO = { tunic: '#dc2626', shirt: '#f8fafc', skin: '#96603a', hair: '#1e1a20', hairStyle: 'thick', hairLine: 0.30, brows: '#1e1a20', moustache: '#2a1c12', toga: '#facc15' };
// RECURRING MEMBERS (v3 plan §1 — wahi chehre ghar/office/park me; hero se clash nahi):
// Member-Orange (seed 201): burnt-orange tee #b45309, skin #8a5a3b, chhote kaale baal.
// Member-Purple (seed 202): muted purple tee #6b5b95, skin #7a4a30, ghugharale kaale baal.
// Colleague (seed 211): grey shirt #6b7280, sirf office background me.
// MOVIE RULE (27 Nov): seeds 101–113 v1 wale KHATM — sab naye 201–213; har outfit naya
// muted (hero laal #dc2626, Orange #b45309, Purple #6b5b95 se clash nahi).
const MEMBER_ORANGE = { tunic: '#b45309', shirt: '#f8fafc', skin: '#8a5a3b', hair: '#1e1a20', hairStyle: 'thick' };
const MEMBER_PURPLE = { tunic: '#6b5b95', shirt: '#f8fafc', skin: '#7a4a30', hair: '#14100c', hairStyle: 'thick' };
const COLLEAGUE = { tunic: '#6b7280', shirt: '#f8fafc', skin: '#9a6a42', hair: '#2b211c', hairStyle: 'thick' };
// CROWD — 13 outfits, muted natural (tez rang sirf hero cheezon par). Seed = vyakti ki
// pehchan (har mode me wahi): C[0]=201 Orange (treadmill), C[3]=202 Purple (bike),
// baaki 203–213 naye. Park walkers 209/210, colleague 211.
const CROWD = [
  // 201 = Member-Orange (treadmill par): MEMBER_ORANGE se identical, viewer pehchane.
  { tunic: '#b45309', shirt: '#f8fafc', skin: '#8a5a3b', hair: '#1e1a20', hairStyle: 'thick' },
  // 203 = deep green
  { tunic: '#2f6b4f', shirt: '#f8fafc', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick' },
  // 204 = brown
  { tunic: '#7c5a2e', shirt: '#f8fafc', skin: '#9a6a42', hair: '#2b211c', hairStyle: 'side' },
  // 202 = Member-Purple (bike par): MEMBER_PURPLE se identical (v2 me C3 ki alag
  // purple #7c3aed thi — ab wahi vyakti).
  { tunic: '#6b5b95', shirt: '#f8fafc', skin: '#7a4a30', hair: '#14100c', hairStyle: 'thick' },
  // 205 = slate blue
  { tunic: '#5a6b8a', shirt: '#f8fafc', skin: '#8a5a30', hair: '#14100c', hairStyle: 'thick' },
  // 206 = mauve
  { tunic: '#8a4a6b', shirt: '#f8fafc', skin: '#b0703a', hair: '#1e1a20', hairStyle: 'thick', dress: '#8a4a6b' },
  // 207 = tan
  { tunic: '#9a6a3a', shirt: '#f8fafc', skin: '#a06a3c', hair: '#2b211c', hairStyle: 'side' },
  // 208 = steel blue
  { tunic: '#3f5a7a', shirt: '#f8fafc', skin: '#8a5a30', hair: '#14100c', hairStyle: 'thick' },
  // 209 = plum (park walker bhi)
  { tunic: '#6b4a7a', shirt: '#f8fafc', skin: '#9a6a42', hair: '#1e1a20', hairStyle: 'thick' },
  // 210 = brick (park walker bhi)
  { tunic: '#7a3a3a', shirt: '#f8fafc', skin: '#b0703a', hair: '#2b211c', hairStyle: 'side' },
  // 211 = olive (office colleague bhi — wahi chehra, grey shirt me)
  { tunic: '#4a5a3a', shirt: '#f8fafc', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick' },
  // 212 = khaki
  { tunic: '#8a7a3a', shirt: '#f8fafc', skin: '#8a5a30', hair: '#2b211c', hairStyle: 'side' },
  // 213 = wine
  { tunic: '#5a3a5a', shirt: '#f8fafc', skin: '#9a6a42', hair: '#1e1a20', hairStyle: 'thick', dress: '#5a3a5a' },
];

// ---- MUNH, envelope lip-sync — hero bolta hai to munh ENV se chalta hai ----
// mouthKind(f) story.js me: smoothed ENV, gain 1.7, 0.035 se neeche = band ('o'/'O'/null).
// Beat-level MOUTH_BEATS HATA diya — full build me envelope.js lip-sync hai.
// Crowd nahi bolta — unka mouth null (expression ka apna munh dikhta hai).

// =====================================================================
// ENVS — morning (dawn) / day / dull (March, cooler) / evening (twist)
// =====================================================================
const ENVS = {
  dawn: { bg: 0xe8d3b8, fogC: 0xe6d8c4, fogNear: 10, fogFar: 46, hemi: 0.85, hemiC: 0xffe0b8, hemiG: 0x8a7a6a, sun: 1.1, sunC: 0xffc98a, sunPos: [-10, 4.5, 6], bounce: 0.4, bounceC: 0x9db8d9, expo: 1.12, win: 0, tube: 0, clockHr: 6 },
  // morningHome: C ghar — subah ~7:00, naram (v2 ka dull-evening mood v4 me BADLA — member
  // subah gym nahi ja raha). hemi 0.75 plan ke hisaab se; window light + halka bulb.
  morningHome: { bg: 0xdce8ec, fogC: 0xd8e4e0, fogNear: 10, fogFar: 46, hemi: 0.75, hemiC: 0xffe8c8, hemiG: 0x8a7a5a, sun: 1.2, sunC: 0xffd9a0, sunPos: [6, 5, 2], bounce: 0.3, bounceC: 0x9db8d9, expo: 1.08, win: 2.0, tube: 0, clockHr: 7 },
  morning: { bg: 0xd8e8ee, fogC: 0xd8e4e0, fogNear: 10, fogFar: 46, hemi: 1.05, hemiC: 0xffe8c8, hemiG: 0x8a7a5a, sun: 1.7, sunC: 0xffd9a0, sunPos: [-10, 4.5, 6], bounce: 0.4, bounceC: 0x9db8d9, expo: 1.12, win: 5.0, tube: 0, clockHr: 6 },
  day: { bg: 0xc8dcec, fogC: 0xd0dde6, fogNear: 12, fogFar: 48, hemi: 1.0, hemiC: 0xffe8c8, hemiG: 0x8a7a5a, sun: 1.6, sunC: 0xfff0c8, sunPos: [-9, 6, 5], bounce: 0.35, bounceC: 0x9db8d9, expo: 1.13, win: 3.0, tube: 2.0, clockHr: 10 },
  evening: { bg: 0xe8b078, fogC: 0xe8c098, fogNear: 8, fogFar: 38, hemi: 1.0, hemiC: 0xffe0b8, hemiG: 0x8a6a4a, sun: 1.5, sunC: 0xff8a3d, sunPos: [-11, 2.6, 4], bounce: 0.35, bounceC: 0xffd9a0, expo: 1.12, win: 1.5, tube: 6.0, clockHr: 6 },
  // office: O — din ~11:00, cool fluorescent + khidki se din roshni (hemi 1.05/sun 1.5 —
  // test rig me hemi 0.9/sun 1.2 par deewaar bahut dark dikhi thi, isliye thoda bright).
  office: { bg: 0xd8dee2, fogC: 0xd8dee2, fogNear: 10, fogFar: 44, hemi: 1.05, hemiC: 0xe8f0f8, hemiG: 0x6a6a62, sun: 1.5, sunC: 0xfff0d8, sunPos: [6, 6, 4], bounce: 0.35, bounceC: 0xe8f0f8, expo: 1.12, win: 0, tube: 0, clockHr: 11 },
  // park: P — subah ~6:00, sunehri (pale gold sky bg, garam low sun).
  park: { bg: 0xf6d9a0, fogC: 0xf6d9a0, fogNear: 12, fogFar: 48, hemi: 0.9, hemiC: 0xffe8c8, hemiG: 0x6a7a5a, sun: 1.4, sunC: 0xffd9a0, sunPos: [-8, 4, 6], bounce: 0.4, bounceC: 0xffe8c8, expo: 1.12, win: 0, tube: 0, clockHr: 6 },
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
  // SMOKE FIX (round 2, f0430): canvas ke transparent kone plane par kaale dikhte the
  // (black square ghadi ke peeche). Ab background deewaar ka ochre #bf8f3e — kone deewaar me ghul jate hain.
  g.fillStyle = '#bf8f3e'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#eef2f5'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
  g.strokeStyle = '#4a3220'; g.lineWidth = 12; g.beginPath(); g.arc(128, 128, 114, 0, 7); g.stroke();
  g.fillStyle = '#1e293b'; g.textAlign = 'center'; g.font = 'bold 40px Arial';
  g.fillText('12', 128, 52); g.fillText('6', 128, 224); g.fillText('3', 210, 142); g.fillText('9', 46, 142);
  g.fillStyle = '#dc2626'; g.beginPath(); g.arc(128, 128, 8, 0, 7); g.fill();
});
// Mat strip texture — RUST + CHARCOAL STRIPES (v1 ki sage/rust checkerboard NAHI —
// checkerboard v1 gym ka tha; stripes nayi design, floor ke rubber se alag dikhe).
const stripeTex = (() => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  for (let y = 0; y < 4; y++) { g.fillStyle = y % 2 ? '#33302e' : '#9c6644'; g.fillRect(0, y * 32, 256, 32); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
// Rubber floor texture — MID GREY-BROWN + halke speckles (27 Nov FIX: purana DARK
// CHARCOAL #33302e wide shots me farsh ko kaala kar deta tha — parent: "gym wale ka
// farsh bahut andhera hai". v1 ki tiles(52) NAHI — tiles(52) Momos me bhi thi; ye
// local canvas texture hai, paint.js se nahi).
const rubberTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#55504a'; g.fillRect(0, 0, 256, 256);
  let s = 7;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < 900; i++) {
    g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.12)';
    g.fillRect(rnd() * 256, rnd() * 256, 2, 2);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
// Vertical walnut slat texture — counter front + wainscot (v1 ki planks(43) NAHI;
// planks() Chhat (41/42/44) + v1 gym (43/45) me thi; ye local canvas texture hai).
const slatTex = (() => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  for (let x = 0; x < 8; x++) {
    g.fillStyle = x % 2 ? '#4a3220' : '#5d4127'; g.fillRect(x * 32, 0, 32, 128);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x * 32, 0, 3, 128);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
// Fee board texture — "NEW YEAR OFFER / FEES ₹1,000 MAHINA" (proof-read, Roman-Hinglish).
// v3 PALETTE: header/footer rust-red #9c6644 (teal #0f766e BANNED — cream+teal combo kahi nahi).
const feeBoardTex = textBoard(512, 640, (g, w, h) => {
  g.fillStyle = '#f8fafc'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#9c6644'; g.fillRect(0, 0, w, 110);
  g.fillStyle = '#f8fafc'; g.font = 'bold 52px Arial'; g.textAlign = 'center'; g.fillText('NEW YEAR OFFER', w / 2, 74);
  g.fillStyle = '#1e293b'; g.font = 'bold 72px Arial'; g.fillText('FEES', w / 2, 220);
  g.fillStyle = '#b45309'; g.font = 'bold 110px Arial'; g.fillText('₹1,000', w / 2, 350);
  g.fillStyle = '#1e293b'; g.font = 'bold 64px Arial'; g.fillText('MAHINA', w / 2, 450);
  g.fillStyle = '#9c6644'; g.font = 'bold 44px Arial'; g.fillText('SAAL BHAR KI FEES', w / 2, 540);
  g.fillText('SASTE DAAM', w / 2, 596);
});
// Galla board texture — gold-on-dark "GALLA ₹5,00,000" (text LOCKED; bg NAYA: deep green
// #14532d — v1/Dhaba/Press wala teal-dark #134e4a NAHI; frame mota sunehra 14px).
const gallaBoardTex = textBoard(640, 360, (g, w, h) => {
  g.fillStyle = '#14532d'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#facc15'; g.lineWidth = 14; g.strokeRect(10, 10, w - 20, h - 20);
  g.textAlign = 'center'; g.fillStyle = '#f8fafc';
  g.font = 'bold 52px Arial'; g.fillText('GALLA', w / 2, 84);
  g.fillStyle = '#facc15'; g.font = 'bold 96px Arial'; g.fillText('₹5,00,000', w / 2, 210);
  g.fillStyle = '#f8fafc'; g.font = 'bold 40px Arial'; g.fillText('GYM • PAANCH LAKH', w / 2, 300);
});
// Poster texture — NAYA text "PASEENA • MEHNAT • JEET" (v1 "SEHAT HI DAULAT HAI" NAHI);
// dark charcoal bg + mustard text (v1 warm-white + rust-red NAHI).
const posterTex = textBoard(512, 384, (g, w, h) => {
  g.fillStyle = '#2f3437'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d9a514'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
  g.textAlign = 'center';
  g.fillStyle = '#d9a514'; g.font = 'bold 72px Arial'; g.fillText('PASEENA', w / 2, 120);
  g.fillStyle = '#f8fafc'; g.font = 'bold 72px Arial'; g.fillText('MEHNAT', w / 2, 220);
  g.fillStyle = '#d9a514'; g.font = 'bold 72px Arial'; g.fillText('JEET', w / 2, 320);
});
function drawMonth(text) {
  const g = monthCtx;
  g.fillStyle = '#f8fafc'; g.fillRect(0, 0, 256, 320);
  g.strokeStyle = '#9c6644'; g.lineWidth = 8; g.strokeRect(6, 6, 244, 308);
  g.fillStyle = '#9c6644'; g.fillRect(0, 0, 256, 64);
  g.fillStyle = '#f8fafc'; g.font = 'bold 40px Arial'; g.textAlign = 'center'; g.fillText(text, 128, 46);
  g.fillStyle = '#1e293b'; g.font = 'bold 26px Arial';
  ['S M T W T F S', '1  2  3  4  5  6', '7  8  9 10 11 12', '13 14 15 16 17 18'].forEach((row, i) => g.fillText(row, 128, 120 + i * 44));
  monthTex.needsUpdate = true;
}

function dumbbell(x, y, z, ry = 0) {
  const g = new THREE.Group();
  const handle = cyl(0.025, 0.025, 0.3, lam({ color: 0xb08d3e }), 8);
  handle.rotation.z = Math.PI / 2; g.add(handle);
  [-0.17, 0.17].forEach((dx) => {
    const end = cyl(0.09, 0.09, 0.06, lam({ color: 0x1f2937 }), 12);
    end.rotation.z = Math.PI / 2; end.position.x = dx; g.add(end);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 6, 16), lam({ color: 0xd9a514 }));
    ring.rotation.y = Math.PI / 2; ring.position.x = dx; g.add(ring);
  });
  g.position.set(x, y, z); g.rotation.y = ry; return g;
}
function treadmill(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const base = box(0.8, 0.12, 1.7, lam({ color: 0x23282c })); base.position.y = 0.06; g.add(base);
  const belt = box(0.6, 0.03, 1.45, lam({ color: 0x111827 })); belt.position.y = 0.13; g.add(belt);
  [-0.37, 0.37].forEach((dx) => {
    const rail = box(0.06, 0.04, 1.5, lam({ color: 0xd9a514 })); rail.position.set(dx, 0.14, 0); g.add(rail);
  });
  [-0.35, 0.35].forEach((dx) => {
    const post = cyl(0.03, 0.03, 1.1, lam({ color: 0x2f3437 }), 8); post.position.set(dx, 0.65, 0.78); g.add(post);
  });
  const console = box(0.7, 0.3, 0.06, lam({ color: 0x2f3437 })); console.position.set(0, 1.18, 0.78); console.rotation.x = -0.35; g.add(console);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.14), lam({ color: 0xd9a514 }));
  screen.position.set(0, 1.19, 0.82); screen.rotation.x = -0.35; g.add(screen);
  [-0.3, 0.3].forEach((dx) => {
    const foot = box(0.12, 0.05, 0.2, lam({ color: 0x111827 })); foot.position.set(dx, 0.025, 0.85); g.add(foot);
  });
  return g;
}
function bike(x, z, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  [-0.45, 0.45].forEach((dx) => {
    const wh = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 8, 18), lam({ color: 0x111827 }));
    wh.position.set(dx, 0.3, 0); g.add(wh);
  });
  const frame = lam({ color: 0x2f3437 });
  g.add(bar2D(-0.45, 0.3, 0.05, 0.7, 0, frame, 0.025));
  g.add(bar2D(0.45, 0.3, 0.05, 0.7, 0, frame, 0.025));
  g.add(bar2D(0.05, 0.7, -0.1, 0.62, 0, frame, 0.025));
  const topTube = bar2D(-0.1, 0.72, 0.15, 0.82, 0, lam({ color: 0xd9a514 }), 0.02);
  g.add(topTube);
  const seat = box(0.22, 0.04, 0.1, lam({ color: 0x111827 })); seat.position.set(-0.1, 0.75, 0); g.add(seat);
  const bars = cyl(0.02, 0.02, 0.4, lam({ color: 0x9ca3af }), 6); bars.rotation.x = Math.PI / 2; bars.position.set(0.15, 0.85, 0); g.add(bars);
  const disp = box(0.12, 0.08, 0.03, lam({ color: 0x1f2937 })); disp.position.set(0.15, 0.92, 0); disp.rotation.x = -0.3; g.add(disp);
  return g;
}

{
  const S = gymG;
  // FLOOR — dark charcoal rubber (local speckle texture) + rust/charcoal STRIPE mat.
  // v1 ki tiles(52) NAHI (Momos me bhi thi), sage/rust checkerboard NAHI.
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), lam({ map: rubberTex, color: 0xffffff }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.02, 0); floor.receiveShadow = true; S.add(floor);
  const stripeMat = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.3), lam({ map: stripeTex }));
  stripeMat.rotation.x = -Math.PI / 2; stripeMat.position.set(-3.6, 0.012, 0.7); stripeMat.receiveShadow = true; S.add(stripeMat);
  // BACK WALL — warm OCHRE #bf8f3e (v1 sage #a3b18a NAHI; cream plaster #e8dcc0 jo Dhaba/
  // Press/Momos/Chhat me thi, woh bhi NAHI) + dark walnut WAINSCOT (slats, y 0..1.1) —
  // v1 ka slate-grey band NAHI. EK HI flat surface har deewaar (anti-glitch).
  // NOTE: back wall DoubleSide — through-window shot (q04, TW preset) me camera bahar se
  // deewaar ko dekhta hai; andar se kuch nahi badalta (flat lambert, koi texture nahi).
  // NOTE 2 (TW fix, round 2): deewaar khidki ke chaaro taraf 4 segments me hai (beech me
  // khidki ka KHULA opening — khidki ke frame/glass ke peeche koi deewaar nahi, isliye
  // bahar se andar dikhta hai). Segments coplanar hain (z=-6, ek hi material, koi overlap
  // nahi — sirf kinare milte hain, isliye z-fighting nahi); andar se ek hi flat ochre
  // surface dikhti hai (seams khidki ke frame bars ke peeche chhupi hain).
  const backWallMat = lam({ color: 0xbf8f3e, side: THREE.DoubleSide });
  const backWallSegs = [
    [-4.725, 2.5, 1.05, 5.0], [1.525, 2.5, 7.45, 5.0],
    [-3.2, 0.85, 2.0, 1.7], [-3.2, 4.05, 2.0, 1.9],
  ];
  backWallSegs.forEach(([sx, sy, sw, sh]) => {
    const seg = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), backWallMat);
    seg.position.set(sx, sy, -6); seg.receiveShadow = true; S.add(seg);
  });
  const wainscot = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 1.1), lam({ map: slatTex }));
  wainscot.position.set(0, 0.55, -5.97); S.add(wainscot);
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 5.0), lam({ color: 0xa87c33 }));
  leftWall.rotation.y = Math.PI / 2; leftWall.position.set(-5, 2.5, -1.5); S.add(leftWall);
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 5.0), lam({ color: 0xa87c33 }));
  rightWall.rotation.y = -Math.PI / 2; rightWall.position.set(5, 2.5, -1.5); S.add(rightWall);
  // CEILING (y=5.0) — warm grey #b8b0a0 (v1 sage-grey NAHI); LED panels isi se latakte hain
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(11, 10), lam({ color: 0xb8b0a0 }));
  ceiling.rotation.x = Math.PI / 2; ceiling.position.set(0, 5.0, -1.5); S.add(ceiling);
  // OUTSIDE (seen through window glass): dawn sky + hazy buildings = deep background layer.
  // NAYA sky gradient — upar gehra narangi (v1 ka neela upar NAHI), neeche pale gold.
  const skyTexC = (() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 256;
    const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#e8a04c'); gr.addColorStop(0.55, '#f6d8a8'); gr.addColorStop(1, '#ffe8c0');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const skyOut = new THREE.Mesh(new THREE.PlaneGeometry(14, 7), bas({ map: skyTexC, fog: false }));
  // TW fix (round 2): sky + buildings peeche (z -13/-12.2) — TW camera (z -11.5) unke
  // aage hai; pehle z -8.5/-7.6 par camera ke peeche/andar aate the.
  skyOut.position.set(0, 2.5, -13); S.add(skyOut);
  [[-4, 2.0, 0xa08a6a], [0.5, 2.8, 0x7a8a9a], [4, 2.4, 0xb09080]].forEach(([bx, bh, col]) => {
    const b = box(3.2, bh, 0.8, lam({ color: col })); b.position.set(bx, bh / 2, -12.2); S.add(b);
    const tank = cyl(0.35, 0.35, 0.6, lam({ color: 0x8a7a5a }), 12); tank.position.set(bx + 0.8, bh + 0.3, -12.2); S.add(tank);
  });
  // WINDOW (back wall left, x -4.2..-2.2, y 1.7..3.1) — NAYA design: 3 vertical panes
  // (2 vertical bars, koi cross nahi — v1 ka 1V+1H cross NAHI), dark walnut frame.
  // Beech wala pane (x -3.87..-2.53) through-window shot (q04 TW) ke liye khula hai.
  const winFrameMat = lam({ color: 0x4a3220 });
  [[-3.2, 3.08, 2.1, 0.08], [-3.2, 1.72, 2.1, 0.08], [-4.24, 2.4, 0.08, 1.44], [-2.16, 2.4, 0.08, 1.44]].forEach(([wx, wy, ww, wh]) => {
    const f = box(ww, wh, 0.06, winFrameMat); f.position.set(wx, wy, -5.94); S.add(f);
  });
  [-3.87, -2.53].forEach((bx) => {
    const bar = box(0.05, 1.36, 0.04, winFrameMat); bar.position.set(bx, 2.4, -5.95); S.add(bar);
  });
  const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.36), new THREE.MeshPhongMaterial({ color: 0x9fc8d9, shininess: 140, specular: 0xcfeaff, transparent: true, opacity: 0.35 }));
  winGlass.position.set(-3.2, 2.4, -5.96); S.add(winGlass);
  // LIGHT CONE (Gullak: akele character par ek light cone) — window se hero tak, s01 me ON
  lightCone = new THREE.Mesh(new THREE.ConeGeometry(0.95, 3.4, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.10, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  lightCone.position.set(-1.4, 1.6, -3.8); lightCone.rotation.set(0.4, 0, -0.35); lightCone.material.opacity = 0.07; lightCone.visible = false; S.add(lightCone);
  // MIRROR — NAYA: GOL sheesha (v1 ka aayatakar + lakdi frame NAHI), patli brass frame.
  const mirFrame = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.04, 8, 32), lam({ color: 0xb08d3e })); mirFrame.position.set(0.6, 1.8, -5.95); S.add(mirFrame);
  const mirFace = new THREE.Mesh(new THREE.CircleGeometry(0.85, 32), new THREE.MeshPhongMaterial({ color: 0xbfd9e2, shininess: 120, specular: 0xffffff }));
  mirFace.position.set(0.6, 1.8, -5.94); S.add(mirFace);
  const mirGlint = mkGlint(0.6, 2.2, -5.9, 0.35); mirGlint.material.opacity = 0.5;
  // POSTER (naya text "PASEENA • MEHNAT • JEET", dark bg) + WALL CLOCK (naya face) — back wall
  const poster = boardMesh(0.9, 0.68, posterTex); poster.position.set(-1.2, 2.1, -5.95); S.add(poster);
  const clockFace = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), lam({ map: clockTex }));
  clockFace.position.set(-0.9, 3.2, -5.94); S.add(clockFace);
  const hourGeo = new THREE.BoxGeometry(0.03, 0.15, 0.01); hourGeo.translate(0, 0.065, 0);
  clockHour = new THREE.Mesh(hourGeo, lam({ color: 0x1e293b })); clockHour.position.set(-0.9, 3.2, -5.93); S.add(clockHour);
  const minGeo = new THREE.BoxGeometry(0.02, 0.22, 0.01); minGeo.translate(0, 0.1, 0);
  clockMin = new THREE.Mesh(minGeo, lam({ color: 0x1e293b })); clockMin.position.set(-0.9, 3.2, -5.925); S.add(clockMin);
  // MONTH CALENDAR (back wall right) — NAYA: wooden frame (v1 ka bina-frame NAHI); header
  // rust-red (drawMonth me). Text per section (monthFor).
  monthCanvas = document.createElement('canvas'); monthCanvas.width = 256; monthCanvas.height = 320;
  monthCtx = monthCanvas.getContext('2d');
  monthTex = new THREE.CanvasTexture(monthCanvas); monthTex.colorSpace = THREE.SRGBColorSpace;
  const calFrame = box(0.72, 0.88, 0.03, lam({ color: 0x4a3220 })); calFrame.position.set(3.35, 2.95, -5.96); S.add(calFrame);
  monthBoard = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.78), lam({ map: monthTex }));
  // SMOKE FIX (round 2, f0360): board z -5.95 frame box ke FRONT face (-5.945) ke peeche
  // tha — frame use dhak raha tha, calendar khaali dark rectangle dikhta tha. Ab -5.93.
  monthBoard.position.set(3.35, 2.95, -5.93); S.add(monthBoard);
  drawMonth('JANUARY');
  // FIRST-AID BOX (NAYA ADD — pichle kisi video me nahi): safed box + hari cross, deewaar par.
  {
    const faBox = box(0.4, 0.3, 0.08, lam({ color: 0xf8fafc })); faBox.position.set(-2.0, 2.6, -5.95); S.add(faBox);
    const faV = box(0.06, 0.2, 0.02, lam({ color: 0x16a34a })); faV.position.set(-2.0, 2.6, -5.9); S.add(faV);
    const faH = box(0.2, 0.06, 0.02, lam({ color: 0x16a34a })); faH.position.set(-2.0, 2.6, -5.9); S.add(faH);
  }
  // WALL SHELF above counter (y 3.7) — NAYA: dark metal shelf + 3 NAYI bottles (safed shaker,
  // kaali bottle, peeli bottle — v1 ki neeli/hari/narangi NAHI).
  {
    const shelf = box(2.9, 0.05, 0.25, lam({ color: 0x2f3437 })); shelf.position.set(2.6, 3.7, -5.83); S.add(shelf);
    [1.5, 3.7].forEach((bx) => { const br = box(0.05, 0.18, 0.05, lam({ color: 0x111827 })); br.position.set(bx, 3.6, -5.88); S.add(br); });
    [[1.5, 0xf8fafc], [2.6, 0x111827], [3.7, 0xd9a514]].forEach(([bx, col]) => {
      const b = cyl(0.05, 0.05, 0.28, lam({ color: col }), 10); b.position.set(bx, 3.87, -5.83); S.add(b);
    });
  }
  // LED PANELS (NAYA — v1 ki latakti tube lights + rods NAHI): 2 flat panels, ceiling par.
  [[-1.5, -3.0], [2.0, -3.0]].forEach(([lx, lz]) => {
    const panel = box(1.2, 0.05, 0.5, tubeBulbMat); panel.position.set(lx, 4.96, lz); S.add(panel);
    const pFrame = box(1.3, 0.04, 0.6, lam({ color: 0x2f3437 })); pFrame.position.set(lx, 4.99, lz); S.add(pFrame);
  });
  // ---- EQUIPMENT (all bases on the floor) — NAYE designs (positions framing ke liye
  // wahi — v4 smoke se verified): 3 treadmills bayein deewaar par (NAYA helper: charcoal
  // deck + mustard rails + slanted console), 2 bikes beech me (NAYA helper: charcoal
  // frame + mustard top tube + handlebar display). Bench/rack/dbRack/plates ke rang
  // naye — v1 ka red-brown bench, grey posts, grey racks NAHI.
  S.add(treadmill(-4.2, -4.4)); S.add(treadmill(-4.2, -2.6)); S.add(treadmill(-4.2, -0.8));
  S.add(bike(0.9, -1.0, 0.3)); S.add(bike(1.3, -1.4, -0.2));
  // BENCH PRESS (0, -3.5): black vinyl seat + chrome bar + YELLOW plates (v1 red-brown NAHI)
  {
    const bench = box(0.5, 0.15, 1.3, lam({ color: 0x111827 })); bench.position.set(0, 0.45, -3.5); S.add(bench);
    [-0.5, 0.5].forEach((dz) => { const leg = box(0.4, 0.4, 0.08, lam({ color: 0x1f2937 })); leg.position.set(0, 0.2, -3.5 + dz); S.add(leg); });
    [-0.35, 0.35].forEach((dx) => { const up = cyl(0.04, 0.04, 1.5, lam({ color: 0x1f2937 }), 8); up.position.set(dx, 0.75, -4.05); S.add(up); });
    const bar = cyl(0.025, 0.025, 1.8, lam({ color: 0xd1d5db }), 8); bar.rotation.z = Math.PI / 2; bar.position.set(0, 1.35, -4.05); S.add(bar);
    [-0.75, 0.75].forEach((dx) => { const pl = cyl(0.28, 0.28, 0.06, lam({ color: 0xd9a514 }), 16); pl.rotation.z = Math.PI / 2; pl.position.set(dx, 1.35, -4.05); S.add(pl); });
    // mustard towel draped on bench (v1 white NAHI; base = bench top)
    const towel = box(0.4, 0.03, 0.5, lam({ color: 0xd9a514 })); towel.position.set(0, 0.54, -3.2); S.add(towel);
  }
  // SQUAT RACK (-2.8, -4.6): black posts + chrome bar + YELLOW plates (v1 grey NAHI)
  {
    [-0.5, 0.5].forEach((dx) => { const up = cyl(0.04, 0.04, 2.0, lam({ color: 0x111827 }), 8); up.position.set(-2.8 + dx, 1.0, -4.6); S.add(up); });
    const top = box(1.1, 0.06, 0.06, lam({ color: 0x1f2937 })); top.position.set(-2.8, 2.0, -4.6); S.add(top);
    const bar = cyl(0.025, 0.025, 1.6, lam({ color: 0xd1d5db }), 8); bar.rotation.z = Math.PI / 2; bar.position.set(-2.8, 1.7, -4.6); S.add(bar);
    [-0.65, 0.65].forEach((dx) => { const pl = cyl(0.24, 0.24, 0.06, lam({ color: 0xd9a514 }), 16); pl.rotation.z = Math.PI / 2; pl.position.set(-2.8 + dx, 1.7, -4.6); S.add(pl); });
  }
  // DUMBBELL RACK (4.3, -3.2): WALNUT frame (v1 grey NAHI) + 2 tiers + 6 dumbbells (NAYA helper)
  {
    const base = box(0.6, 0.1, 1.8, lam({ color: 0x4a3220 })); base.position.set(4.3, 0.05, -3.2); S.add(base);
    [0.5, 0.95].forEach((ty) => { const shelf = box(0.55, 0.05, 1.7, lam({ color: 0x5d4127 })); shelf.position.set(4.3, ty, -3.2); S.add(shelf); });
    [[4.05, -4.0], [4.55, -4.0], [4.05, -2.4], [4.55, -2.4]].forEach(([ux, uz]) => { const up = box(0.05, 1.0, 0.05, lam({ color: 0x4a3220 })); up.position.set(ux, 0.5, uz); S.add(up); });
    [[-3.85, 0.55], [-3.2, 0.55], [-2.55, 0.55], [-3.85, 1.0], [-3.2, 1.0], [-2.55, 1.0]].forEach(([dz, dy]) => {
      const d = dumbbell(4.3, dy, dz, 0); S.add(d);
    });
  }
  // WEIGHT PLATES STACK (-1.5, -4.9): 5 plates, yellow + black (v1 grey NAHI)
  for (let i = 0; i < 5; i++) {
    const pl = cyl(0.3 - i * 0.02, 0.3 - i * 0.02, 0.06, lam({ color: i % 2 ? 0x111827 : 0xd9a514 }), 16);
    pl.position.set(-1.5, 0.03 + i * 0.06, -4.9); S.add(pl);
  }
  // FOAM ROLLER (dark charcoal — v1 green NAHI)
  const roller = cyl(0.09, 0.09, 0.6, lam({ color: 0x2f3437 }), 10); roller.rotation.z = Math.PI / 2; roller.position.set(-4.5, 0.09, -2.6); S.add(roller);
  // ---- COUNTER / RECEPTION DESK (2.6, -3.4) + TILL — NAYA design: vertical walnut slat
  // front (slatTex) + dark stone top + brass kick plate (v1 planks + walnut top NAHI).
  const counter = box(2.0, 0.95, 0.7, lam({ map: slatTex })); counter.position.set(2.6, 0.475, -3.4); S.add(counter);
  const counterTop = box(2.2, 0.06, 0.85, lam({ color: 0x3a3a38 })); counterTop.position.set(2.6, 0.98, -3.4); S.add(counterTop);
  const kickPlate = box(2.0, 0.08, 0.02, lam({ color: 0xb08d3e })); kickPlate.position.set(2.6, 0.04, -3.04); S.add(kickPlate);
  // white shaker bottle + mustard register book on counter (set dressing, bases on counter top)
  const shaker = cyl(0.05, 0.05, 0.18, lam({ color: 0xf8fafc }), 10); shaker.position.set(1.8, 1.1, -3.3); S.add(shaker);
  const regBook = box(0.35, 0.04, 0.25, lam({ color: 0xb5892e })); regBook.position.set(2.95, 1.03, -3.6); S.add(regBook);
  // ---- FOREGROUND PROPS (depth layer 1 — frame corners, below face line) ----
  S.add(dumbbell(-0.7, 0.09, 1.85, 0.4)); S.add(dumbbell(-0.4, 0.09, 1.6, -0.3));
  const bottle = cyl(0.05, 0.05, 0.22, lam({ color: 0x16a34a }), 10); bottle.position.set(0.2, 0.11, 1.6); S.add(bottle);
  // Foreground dressing — yoga mats MUSTARD + CHARCOAL (v1 sage + orange-red NAHI),
  // YELLOW kettlebells (v1 black NAHI). Sab ki base farsh ko chhooti hai.
  {
    const mat1 = box(1.7, 0.03, 0.6, lam({ color: 0xd9a514 })); mat1.position.set(-2.0, 0.015, 0.9); mat1.rotation.y = 0.15; S.add(mat1);
    const mat2 = box(1.7, 0.03, 0.6, lam({ color: 0x33302e })); mat2.position.set(2.0, 0.015, 1.2); mat2.rotation.y = -0.2; S.add(mat2);
    [[-1.5, 1.9], [1.0, 2.0]].forEach(([kx, kz]) => {
      const kb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), lam({ color: 0xd9a514 }));
      kb.position.set(kx, 0.11, kz); S.add(kb);
      const hd = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.018, 6, 12, Math.PI), lam({ color: 0xd9a514 }));
      hd.position.set(kx, 0.23, kz); S.add(hd);
    });
  }
  // ---- NAYE PROPS (har bar naya add karna — pichle kisi video me nahi) ----
  // (a) CEILING FAN (static, deterministic — spin nahi; koi per-frame state nahi):
  // centre (0, 4.7, -1.5) — ceiling se rod, 4 blades.
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
  // (b) WATER COOLER / DISPENSER (dayein deewaar, 4.7, -1.0): white body + blue bottle.
  {
    const body = box(0.4, 1.1, 0.4, lam({ color: 0xf8fafc })); body.position.set(4.7, 0.55, -1.0); S.add(body);
    const jug = cyl(0.16, 0.16, 0.4, lam({ color: 0x3b82f6 }), 12); jug.position.set(4.7, 1.3, -1.0); S.add(jug);
    const tap = box(0.08, 0.1, 0.06, lam({ color: 0xdc2626 })); tap.position.set(4.7, 0.75, -0.79); S.add(tap);
  }
  // (c) SKIPPING ROPE on a wall hook (back wall right, 4.2, 2.2): hook + looped rope.
  {
    const hook = box(0.04, 0.04, 0.12, lam({ color: 0x2f3437 })); hook.position.set(4.2, 2.35, -5.92); S.add(hook);
    const rope = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.015, 6, 24), lam({ color: 0xd9a514 }));
    rope.position.set(4.2, 2.05, -5.9); S.add(rope);
  }
  // dust motes near window (light visible)
  for (let i = 0; i < 8; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, opacity: 0.10, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffe9b0 }));
    sp.position.set(-3 + (i * 0.9) % 4.5, 1.2 + (i % 3) * 0.7, -4.5 + (i % 2) * 1.2);
    sp.userData.bx = sp.position.x; sp.userData.by = sp.position.y; sp.userData.bz = sp.position.z;
    sp.scale.setScalar(0.08 + (i % 3) * 0.03);
    scene.add(sp); motes.push(sp);
  }
}
gymG.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
// ---- LOC A (street) / C (home) / O (office) / P (park) — locations.js se;
// sirf active location visible (renderFrame me, per frame, shot.loc se) ----
const streetG = buildStreet(); scene.add(streetG);
const homeG = buildHome(); scene.add(homeG);
const officeG = buildOffice(); scene.add(officeG);
const parkG = buildPark(); scene.add(parkG);

// ---- BAND MEMBER CARDS ka dher (q30, L17 — "aadhe se zyada log aana band" ka physical
// roop): counter par 11 cards ka pile + ek aadha gira hua (counter ke aage kinare par) ----
const cardsPile = new THREE.Group(); scene.add(cardsPile);
{
  for (let i = 0; i < 11; i++) {
    const card = box(0.2, 0.006, 0.13, lam({ color: 0xf8fafc }));
    card.position.set(2.05 + (i % 3 - 1) * 0.02, 1.015 + i * 0.007, -3.55 + (Math.floor(i / 3) - 1) * 0.03);
    card.rotation.y = (i % 5 - 2) * 0.25; cardsPile.add(card);
    const stripe = box(0.2, 0.007, 0.025, lam({ color: 0x16a34a }));
    stripe.position.copy(card.position); stripe.position.y += 0.001; stripe.rotation.y = card.rotation.y; cardsPile.add(stripe);
  }
  const fallen = box(0.2, 0.006, 0.13, lam({ color: 0xf8fafc }));
  fallen.position.set(2.05, 0.92, -3.02); fallen.rotation.x = 0.6; fallen.rotation.y = 0.3; cardsPile.add(fallen);
  cardsPile.visible = false;
}

// ---- HELD PROPS (toward-lens shots — prop camera ki taraf, speaker ka chehra peeche) ----
// q02 note | q11/q37 member card | q12/q13/q24/q35 cash | q18/q22 phone (GYM screen) |
// q31 phone (₹1,000 DEBITED notification) | q48 phone (6:00 clock). Sab diegetic props hain,
// caption nahi. Prop on-screen character se camera ki taraf 0.55m, y 1.32 (chehre se neeche).
const memberCardTex = textBoard(256, 160, (g, w, h) => {
  g.fillStyle = '#f8fafc'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#16a34a'; g.fillRect(0, 0, w, 34);
  g.fillStyle = '#1e293b'; g.textAlign = 'left'; g.font = 'bold 34px Arial'; g.fillText('GYM', 14, 76);
  g.fillStyle = '#64748b'; g.fillRect(14, 96, 120, 10); g.fillRect(14, 118, 90, 10);
  g.strokeStyle = '#94a3b8'; g.lineWidth = 4; g.strokeRect(168, 52, 72, 88);
});
const phoneNotifTex = textBoard(256, 448, (g, w, h) => {
  g.fillStyle = '#111827'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#f8fafc'; g.textAlign = 'center'; g.font = 'bold 40px Arial'; g.fillText('11:00', w / 2, 60);
  g.fillStyle = '#dc2626'; g.beginPath(); g.arc(w / 2, 150, 46, 0, 7); g.fill();
  g.fillStyle = '#f8fafc'; g.font = 'bold 52px Arial'; g.fillText('₹1,000', w / 2, 250);
  g.font = 'bold 36px Arial'; g.fillText('DEBITED', w / 2, 300);
  g.fillStyle = '#9ca3af'; g.font = '28px Arial'; g.fillText('GYM FEES', w / 2, 350);
  // SMOKE FIX (v4 round 1, f1160): '1 MARCH • AUTO-DEBIT' ek line me 256px texture me
  // kat raha tha (phone bada dikhe to bhi dayein kinara kata). Ab do lines me.
  g.fillText('1 MARCH', w / 2, 382);
  g.fillText('AUTO-DEBIT', w / 2, 412);
});
const phoneClockTex = textBoard(256, 448, (g, w, h) => {
  g.fillStyle = '#111827'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#f8fafc'; g.textAlign = 'center'; g.font = 'bold 96px Arial'; g.fillText('6:00', w / 2, 220);
  g.fillStyle = '#9ca3af'; g.font = '32px Arial'; g.fillText('SUBAH', w / 2, 280);
});
const phoneGymTex = textBoard(256, 448, (g, w, h) => {
  g.fillStyle = '#111827'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#facc15'; g.textAlign = 'center'; g.font = 'bold 64px Arial'; g.fillText('GYM', w / 2, 200);
  g.fillStyle = '#f8fafc'; g.font = 'bold 44px Arial'; g.fillText('7:00 AM', w / 2, 270);
  g.fillStyle = '#9ca3af'; g.font = '28px Arial'; g.fillText('Aaj subah 6 baje', w / 2, 330);
});
const heldPropG = new THREE.Group(); scene.add(heldPropG);
const heldNote = new THREE.Group();
{
  const n = box(0.3, 0.16, 0.012, lam({ color: 0x3f9e4d })); heldNote.add(n);
  const bandW = box(0.06, 0.16, 0.014, lam({ color: 0xf8fafc })); heldNote.add(bandW);
  heldPropG.add(heldNote);
}
const heldCard = new THREE.Group();
{
  const c = boardMesh(0.24, 0.15, memberCardTex); heldCard.add(c);
  const back = box(0.24, 0.15, 0.008, lam({ color: 0xf8fafc })); back.position.z = -0.006; heldCard.add(back);
  heldPropG.add(heldCard);
}
const heldCash = new THREE.Group();
{
  const b = box(0.34, 0.05, 0.18, lam({ color: 0x3f9e4d })); heldCash.add(b);
  const bandW = box(0.08, 0.052, 0.185, lam({ color: 0xf8fafc })); heldCash.add(bandW);
  heldPropG.add(heldCash);
}
const heldPhone = new THREE.Group();
const heldPhoneScreens = {};
{
  const body = box(0.16, 0.28, 0.02, lam({ color: 0x1f2937 })); heldPhone.add(body);
  heldPhoneScreens.notif = boardMesh(0.14, 0.26, phoneNotifTex); heldPhoneScreens.notif.position.z = 0.011; heldPhone.add(heldPhoneScreens.notif);
  heldPhoneScreens.clock = boardMesh(0.14, 0.26, phoneClockTex); heldPhoneScreens.clock.position.z = 0.011; heldPhone.add(heldPhoneScreens.clock);
  heldPhoneScreens.gym = boardMesh(0.14, 0.26, phoneGymTex); heldPhoneScreens.gym.position.z = 0.011; heldPhone.add(heldPhoneScreens.gym);
  heldPropG.add(heldPhone);
}
heldPropG.visible = false;
// shot.id -> held prop ('note'|'card'|'cash'|'phoneNotif'|'phoneClock'|'phoneGym')
const HELD_PROP_OF_SHOT = {
  q02: 'note', q11: 'card', q12: 'cash', q13: 'cash', q18: 'phoneGym', q22: 'phoneGym',
  q24: 'cash', q30: 'card', q31: 'phoneNotif', q35: 'cash', q37: 'card', q48: 'phoneClock',
};
function showHeldProp(shot, cp) {
  const kind = HELD_PROP_OF_SHOT[shot.id];
  if (!kind) { heldPropG.visible = false; return; }
  // SMOKE FIX (v4 round 1, f0430/f1160): purana placement (camera ki taraf 0.55m, y 1.32)
  // prop ko chehre/munh ke bilkul upar le aata tha. Ab prop UTHAYE HUE haath ke aakhir me:
  // image-right × 0.42 + camera-dir × 0.45, y 1.25 — chehre se saaf, haath se juda dikhe.
  // (camDir = character -> camera; imageRight = (camDir.z, -camDir.x) — card ka +x side
  // image ke dayein taraf aata hai, wahi taraf 'reach' wala haath dikhta hai.)
  const dx = cp[0] - shot.cx, dz = cp[2] - shot.cz;
  const len = Math.hypot(dx, dz) || 1;
  const cdx = dx / len, cdz = dz / len;
  const rx = cdz, rz = -cdx;
  heldPropG.position.set(shot.cx + rx * 0.42 + cdx * 0.45, 1.25, shot.cz + rz * 0.42 + cdz * 0.45);
  heldPropG.rotation.set(0, Math.atan2(cp[0] - heldPropG.position.x, cp[2] - heldPropG.position.z), 0);
  heldNote.visible = (kind === 'note');
  heldCard.visible = (kind === 'card');
  heldCash.visible = (kind === 'cash');
  heldPhone.visible = kind.startsWith('phone');
  heldPhoneScreens.notif.visible = (kind === 'phoneNotif');
  heldPhoneScreens.clock.visible = (kind === 'phoneClock');
  heldPhoneScreens.gym.visible = (kind === 'phoneGym');
  heldPropG.visible = true;
}

// ---- FEE BOARD (A-board, entrance left) — visible s02/s03 only (set in renderFrame) ----
const feeBoardG = new THREE.Group(); scene.add(feeBoardG);
{
  const front = boardMesh(1.1, 1.4, feeBoardTex); front.position.set(0, 0.75, 0.02); feeBoardG.add(front);
  const back = boardMesh(1.1, 1.4, feeBoardTex); back.position.set(0, 0.75, -0.02); back.rotation.y = Math.PI; feeBoardG.add(back);
  // NO frame box — v4 me frame ka upari kinara board ke "NEW YEAR OFFER" header ko dhak raha tha.
  // A-board legs touch floor: front plane leans on back plane — both bases on floor
  front.rotation.x = -0.12; back.rotation.x = 0.12;
  // NAYA A-frame stand (v1 ka bina-stand NAHI): crossbar + feet, dark walnut — header ko
  // dhake bina, board ko A-frame jaisa khada karta hai.
  const cross = box(1.0, 0.05, 0.05, lam({ color: 0x4a3220 })); cross.position.set(0, 1.15, 0); feeBoardG.add(cross); // STILLS FIX (27 Nov, f0435 round 3): y 1.28 header (1.21-1.37) ko dhakta tha; y 1.05 "FEES" (0.86-1.08) ko dhakta tha — ab y 1.15, dono ke beech khaali gap (1.08-1.21) me
  [-0.5, 0.5].forEach((fx) => {
    const foot = box(0.08, 0.05, 0.5, lam({ color: 0x4a3220 })); foot.position.set(fx, 0.025, 0); feeBoardG.add(foot);
  });
  // v5: board z -0.5 par (1.1x1.4, scale 1.0) — foreground me bada board hero ko dhak raha
  // tha; ab board bayein, hero uske dayein khada hoke iski taraf ishara karta hai.
  feeBoardG.position.set(-2.1, 0, -0.5); feeBoardG.rotation.y = 0.35;
}
// ---- GALLA BOARD (back wall above counter) — visible s04 only ----
// FIX 27 Nov (s04 top 25% khaali deewaar): board y 2.35->2.95, calendar ke barabar.
const gallaBoard = boardMesh(1.5, 0.8, gallaBoardTex); gallaBoard.position.set(2.3, 2.95, -5.94); gallaBoard.visible = false; scene.add(gallaBoard);
// D — counter ke peeche dark walnut wood panels #5d4127 (gym ki sage deewaar se alag pehchan).
// z=-5.965: GALLA board (-5.94) se 0.025 peeche, calendar (-5.95) se 0.015 peeche — coplanar nahi.
const counterPanel = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.4), lam({ color: 0x5d4127 }));
counterPanel.position.set(2.7, 1.7, -5.965); counterPanel.visible = false; scene.add(counterPanel);
// ---- TILL (on counter) + CASH ----
const tillG = new THREE.Group(); scene.add(tillG);
const cashHeap = new THREE.Group(); scene.add(cashHeap);
const cashInside = new THREE.Group(); scene.add(cashInside);
const cashSpill = new THREE.Group(); scene.add(cashSpill);
{
  // TILL — NAYA: dark metal body + brass lock + BLACK lid (v1 wood/planks NAHI).
  const tbox = box(0.55, 0.28, 0.4, lam({ color: 0x2f3437 })); tbox.position.set(2.6, 1.15, -3.4); tillG.add(tbox);
  const lock = box(0.08, 0.06, 0.02, lam({ color: 0xb08d3e })); lock.position.set(2.6, 1.16, -3.19); tillG.add(lock);
  const lidGeo = new THREE.BoxGeometry(0.55, 0.04, 0.4); lidGeo.translate(0, 0, 0.2);
  tillLid = new THREE.Mesh(lidGeo, lam({ color: 0x111827 }));
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
// Crowd modes (v4, story.js SHOTS.crowd hi source of truth):
// 'none' | 'arrive' (B: 3 queue gym; A: 3 walkers street, q43 me 6 walkers)
// | 'jan' (13) | 'mar' (4) | 'janE' (11) | 'purple' (A: Member-Purple hero ke paas,
// q11/q37) | 'colleague' (O: seed 211 colleague apni desk par, q31-q32)
// | 'walkers' (P: 2 distant walkers, q39/q51). Crowd kabhi nahi bolta (mouth null).
// Street/park walkers static mid-stride poses — koi walk cycle nahi, deterministic.
function drawCrowd(mode, f, cp, loc, shot) {
  if (mode === 'none') return;
  const C = crowdCards, O = CROWD;
  if (loc === 'A') {
    if (mode === 'arrive') {
      if (shot.id === 'q43') {
        // q43: sadak par lambi queue/bheed — 6 walkers (-4.5..-1.5, z 0.3..1.2).
        // Seeds 201–206 (C[0]=201 Orange, C[3]=202 Purple — wahi vyakti, baaki naye).
        drawChar(C[0], 201, O[0], 'smile', 'hang', 'hang', f, cp, -4.5, 0, 0.3, 0.95, 0.25, null, 0, null, false);
        drawChar(C[1], 203, O[1], 'smile', 'hang', 'hang', f, cp, -3.8, 0, 0.8, 0.95, 0.6, null, 0, null, false);
        drawChar(C[2], 204, O[2], 'smile', 'hang', 'hang', f, cp, -3.0, 0, 0.5, 0.95, 0.1, null, 0, null, false);
        drawChar(C[3], 202, O[3], 'smile', 'hang', 'hang', f, cp, -2.4, 0, 1.0, 0.95, 0.4, null, 0, null, false);
        drawChar(C[4], 205, O[4], 'smile', 'hang', 'hang', f, cp, -1.9, 0, 0.4, 0.95, 0.55, null, 0, null, false);
        drawChar(C[5], 206, O[5], 'smile', 'hang', 'hang', f, cp, -1.5, 0, 0.9, 0.95, 0.2, null, 0, null, false);
      } else {
        drawChar(C[0], 201, O[0], 'smile', 'hang', 'hang', f, cp, -3.5, 0, 0.3, 0.95, 0.25, null, 0, null, false);
        drawChar(C[1], 203, O[1], 'smile', 'hang', 'hang', f, cp, -2.8, 0, 0.8, 0.95, 0.6, null, 0, null, false);
        drawChar(C[2], 204, O[2], 'smile', 'hang', 'hang', f, cp, -4.2, 0, -0.2, 0.95, 0.1, null, 0, null, false);
      }
    } else if (mode === 'purple') {
      // Member-Purple hero ke paas (q11: cash deke card leta hai; q37: card leta hai)
      const pp = shot.id === 'q37' ? [-0.2, 0.5] : [-1.7, 0.2];
      const pe = shot.id === 'q37' ? 'grin' : 'smile';
      drawChar(memberPurpleCard, 202, MEMBER_PURPLE, pe, 'reach', 'hang', f, cp, pp[0], 0, pp[1], 1.0, 0, null, 0, null, false);
    }
    return;
  }
  if (loc === 'O') {
    if (mode === 'colleague') {
      // Colleague (seed 211, grey shirt) apni desk par (-2.6,-2.7); q31 me sir uthake
      // dekhta hai (neutral), q32 me member receipt dikhata hai (smile).
      drawChar(C[2], 211, COLLEAGUE, shot.id === 'q32' ? 'smile' : 'neutral', 'hang', 'hang', f, cp, -2.6, 0, -2.7, 1.0, 0, null, 0, null, false);
    }
    return;
  }
  if (loc === 'P') {
    if (mode === 'walkers') {
      // 2 distant walkers (seeds 209/210), peeche: q39 me door wala haath hilata hai,
      // q51 me paas wala muskurata hai.
      drawChar(C[3], 209, O[3], 'smile', shot.id === 'q39' ? 'wave' : 'hang', 'hang', f, cp, -4.5, 0, 1.0, 0.95, 0.25, null, 0, null, false);
      drawChar(C[4], 210, O[4], 'smile', 'hang', 'hang', f, cp, 4.0, 0, 0.8, 0.95, 0.6, null, 0, null, false);
    }
    return;
  }
  if (loc !== 'B') return; // C me crowd kabhi nahi (member ghar me AKELA hai)
  // 'janE' = jan MINUS C1/C2 (paas wale 2 treadmill member — shaam ke wide (WE) me bayein
  // kinare unka chehra kata tha; W2R2 me woh waise hi frame se bahar hain).
  if (mode === 'jan' || mode === 'janE') {
    // Seeds: C[0]=201 Orange (treadmill), C[3]=202 Purple (bike), baaki 203–213 naye.
    drawChar(C[0], 201, O[0], 'smile', 'reach', 'hang', f, cp, -3.95, 0, -3.5, 0.95, 0, 0.2, 0, null, false);
    if (mode === 'jan') {
      drawChar(C[1], 203, O[1], 'smile', 'reach', 'hang', f, cp, -3.95, 0, -1.7, 0.95, 0, 0.2, 0, null, false);
      drawChar(C[2], 204, O[2], 'smile', 'reach', 'hang', f, cp, -3.95, 0, 0.1, 0.95, 0, 0.2, 0, null, false);
    }
    drawChar(C[3], 202, O[3], 'smile', 'reach', 'hang', f, cp, 0.9, 0, -1.0, 0.95, 0, 0.2, 0, null, false);
    drawChar(C[4], 205, O[4], 'smile', 'reach', 'hang', f, cp, 1.3, 0, -1.4, 0.95, 0, 0.2, 0, null, false);
    drawChar(C[5], 206, O[5], 'grin', 'reach', 'hang', f, cp, 0.9, 0, -3.2, 1.0, 0, 0.3, 0, null, false);
    drawChar(C[6], 207, O[6], 'smile', 'up', 'hang', f, cp, -0.5, 0, -2.8, 1.0, 0, null, 0, null, false);
    drawChar(C[7], 208, O[7], 'smile', 'reach', 'hang', f, cp, -1.5, 0, -3.9, 1.0, 0, 0.25, 0, null, false);
    drawChar(C[8], 209, O[8], 'smile', 'reach', 'hang', f, cp, 1.8, 0, -3.6, 1.0, 0, 0.2, 0, null, false);
    drawChar(C[9], 210, O[9], 'smile', 'reach', 'hang', f, cp, 1.6, 0, -3.0, 1.0, 0, 0.2, 0, null, false);
    drawChar(C[10], 211, O[10], 'smile', 'hang', 'hang', f, cp, -0.5, 0, -0.4, 0.95, 0, null, 0, null, false);
    drawChar(C[11], 212, O[11], 'smile', 'hang', 'hang', f, cp, 0.15, 0, 0.3, 0.9, 0, null, 0, null, false);
    drawChar(C[12], 213, O[12], 'smile', 'hang', 'hang', f, cp, 0.75, 0, 0.6, 0.85, 0, null, 0, null, false);
  } else if (mode === 'mar') {
    drawChar(C[0], 201, O[0], 'neutral', 'reach', 'hang', f, cp, -3.95, 0, -3.5, 0.95, 0, 0.2, 0, null, false);
    drawChar(C[5], 206, O[5], 'neutral', 'reach', 'hang', f, cp, 0.9, 0, -3.2, 1.0, 0, 0.3, 0, null, false);
    drawChar(C[8], 209, O[8], 'neutral', 'reach', 'hang', f, cp, 1.8, 0, -2.8, 1.0, 0, 0.2, 0, null, false);
    drawChar(C[3], 202, O[3], 'neutral', 'reach', 'hang', f, cp, 0.9, 0, -1.0, 0.95, 0, 0.2, 0, null, false);
  } else if (mode === 'arrive') {
    drawChar(C[10], 211, O[10], 'smile', 'hang', 'hang', f, cp, -0.5, 0, -0.4, 0.95, 0, null, 0, null, false);
    drawChar(C[11], 212, O[11], 'smile', 'hang', 'hang', f, cp, 0.15, 0, 0.3, 0.9, 0, null, 0, null, false);
    drawChar(C[12], 213, O[12], 'smile', 'hang', 'hang', f, cp, 0.75, 0, 0.6, 0.85, 0, null, 0, null, false);
  }
}
// Light rig location se badalta hai (beat se nahi): A = dawn, B = day, C = subah
// (morningHome), O = office din, P = park subah sunehri. Counter rig (warm evening) sirf
// tab jab loc B ke andar counter cam (T/TC/GB/HC) ho. Roshni ka switch shot boundary par
// hard cut ke saath hota hai (koi fade nahi).
const ENV_OF_LOC = { A: 'dawn', B: 'day', C: 'morningHome', O: 'office', P: 'park' };
const COUNTER_CAMS = ['T', 'TC', 'GB', 'HC', 'TD'];
let lastMonth = '';
let lastHomeMonth = '';
window.renderFrame = (f) => {
  const shot = shotAt(f), u = shot.u, id = shot.id;
  const cam = camFor(shot, u);
  camera.position.set(...cam.pos); camera.lookAt(...cam.look);
  camera.fov = cam.fov; camera.updateProjectionMatrix();
  if (cam.roll) camera.rotateZ(cam.roll * Math.PI / 180);
  const loc = shot.loc;
  const envName = (loc === 'B' && COUNTER_CAMS.includes(shot.camName)) ? 'evening' : ENV_OF_LOC[loc];
  const env = applyEnv(envName);
  // ANTI-GLITCH: motes ABSOLUTE position (frame ka pure function) — pehle incremental
  // += tha: position render history/order par nirbhar karti thi (chunk-seam drift).
  motes.forEach((sp, i) => {
    sp.position.set(sp.userData.bx + Math.cos(f * 0.02 + i) * 0.03, sp.userData.by + Math.sin(f * 0.05 + i * 2.1) * 0.04, sp.userData.bz);
  });
  ALL_CARDS.forEach((c) => c.hide());
  whistleG.visible = false;
  const cp = cam.pos;
  // ---- location switching: sirf active location ka group visible (per frame, shot.loc se) ----
  streetG.visible = (loc === 'A');
  gymG.visible = (loc === 'B');
  homeG.visible = (loc === 'C');
  officeG.visible = (loc === 'O');
  parkG.visible = (loc === 'P');
  const gymVisible = gymG.visible;
  motes.forEach((sp) => { sp.visible = gymVisible; });
  // Home bulb: sirf ghar me jalta hai (intensity location ka pure function)
  if (homeG.userData.bulbLight) homeG.userData.bulbLight.intensity = (loc === 'C') ? 0.8 : 0;
  // SMOKE FIX (v4 round 1): ek hi phone do jagah nahi — q31 me member phone UTHA ke
  // notification dikhata hai, to office desk wala phone chhupa do; q18/q22 me member
  // bedside phone uthata hai, to bedside wala chhupa do. Har frame reset (koi state nahi).
  if (officeG.userData.phone) officeG.userData.phone.visible = (id !== 'q31');
  if (homeG.userData.bsPhone) homeG.userData.bsPhone.visible = (id !== 'q18' && id !== 'q22');
  // Shutter (street): shutterOpen(f) ka pure function
  if (streetG.userData.applyShutter) streetG.userData.applyShutter(shutterOpen(f));
  // ---- props default band (har frame reset — sirf apne section me dikhe) ----
  glintFee.material.opacity = 0; glintGalla.material.opacity = 0; glintTill.material.opacity = 0;
  if (lightCone) lightCone.visible = false;
  feeBoardG.visible = false;
  gallaBoard.visible = false;
  counterPanel.visible = false;
  cardsPile.visible = false;
  tillG.visible = gymVisible;
  if (tillLid) tillLid.rotation.x = 0;
  cashInside.visible = false; cashHeap.visible = false; cashSpill.visible = false;
  const fl = FLASH[id];
  flashPlane.material.opacity = fl ? Math.max(0, 1 - Math.abs(f - fl.at) / (fl.dur / 2)) : 0;
  // ghadi ki suiyaan — env ke hisaab se (subah 6, din 10, shaam 6, office 11, ghar 7)
  if (clockHour && clockMin) {
    clockHour.rotation.z = -(env.clockHr / 12) * Math.PI * 2;
    clockMin.rotation.z = 0;
  }
  // month — monthFor(shot) se: gym B b04 JANUARY / b09+ MARCH; counter hamesha MARCH;
  // home C q17-q18 FEBRUARY / q19+ MARCH (texture swap, geometry nahi).
  const month = monthFor(shot);
  if (gymVisible && month && month !== lastMonth) { drawMonth(month); lastMonth = month; }
  if (loc === 'C' && homeG.userData.setMonth && month && month !== lastHomeMonth) { homeG.userData.setMonth(month); lastHomeMonth = month; }
  // SMOKE QA ROUND 2: WE wide (fov 74) me calendar ka kinara dayein jhaankta tha (kata hua
  // sliver). WE shots me calendar chhupao — mahina T/TC/GB (counter) shots me saaf dikhta
  // hai; cut par pop nahi dikhta (angle badal jata hai).
  if (monthBoard) monthBoard.visible = gymVisible && (shot.camName !== 'WE');

  // ---- per-shot set state (board visibility + till + glints) ----
  // Boards: EXPLICIT board field hi source of truth (v1 beat-default inference hata diya).
  // Fee board (indoor) sirf B me; GALLA board B me jahan board='galla'.
  // ANTI-GLITCH: glint opacity CONSTANT 0.45 (pehle 0.3+0.3*sin(f*0.3) har frame pulse
  // karta tha — ~21f period ka pulsing glint flicker jaisa dikhta tha).
  const showFee = gymVisible && loc === 'B' && shot.board === 'fee';
  const showGalla = gymVisible && shot.board === 'galla';
  if (showFee) {
    feeBoardG.visible = true;
    // q40 (T cam): hero counter par naya offer board lagata hai — fee board ko counter ke
    // aage khada karo (plan me iski position nahi di — coder decision, report me darj hai).
    // Baaki shots me board apni jagah (-2.1,-0.5) par.
    if (id === 'q40') { feeBoardG.position.set(2.6, 0, -2.9); feeBoardG.rotation.y = 0.15; }
    else { feeBoardG.position.set(-2.1, 0, -0.5); feeBoardG.rotation.y = 0.35; }
    glintFee.material.opacity = 0.45;
  }
  if (showGalla) {
    gallaBoard.visible = true;
    glintGalla.material.opacity = 0.45;
    glintTill.material.opacity = 0.45;
  }
  // Counter panel (dark walnut) sirf counter cams par (T/TC/GB/HC), loc B ke andar.
  if (loc === 'B' && COUNTER_CAMS.includes(shot.camName)) counterPanel.visible = true;
  // Light cone: subah (b02) me hero par — khaali gym, intezaar.
  if (lightCone) lightCone.visible = (loc === 'B' && shot.beat === 'b02');
  // Till: tillAngle(f) — f841->881 khulta (69°), 1510-1576 phir band, 1576->1600 dobara khulta.
  // Cash heap/bundles sirf till khula hone par dikhte hain.
  const tAngle = tillAngle(f);
  if (tillLid) tillLid.rotation.x = -tAngle;
  if (gymVisible && tAngle > 0.05) { cashInside.visible = true; cashHeap.visible = true; cashSpill.visible = true; }
  // Cancelled member-cards dher: sirf q30 (L17, 53%).
  if (id === 'q30') cardsPile.visible = true;
  // ---- crowd (shot.crowd) + on-screen character (shot.who) ----
  drawCrowd(shot.crowd, f, cp, loc, shot);
  if (shot.who === 'hero') {
    const { expr, mix } = heroExprAt(f);
    drawChar(heroCard, 91, HERO, expr, shot.R, shot.L, f, cp, shot.cx, 0, shot.cz, shot.cs, 0, null, shot.tilt, mouthKind(f), false, false, mix);
    placeWhistle(shot.cx, shot.cz, cp);
  } else {
    // Member beats: member on-screen acting karta hai, hero narration voiceover hai —
    // mouth hamesha null (lip-sync nahi), expression memberExprAt(f) se.
    const { expr, mix } = memberExprAt(f);
    const card = shot.who === 'orange' ? memberOrangeCard : memberPurpleCard;
    const outfit = shot.who === 'orange' ? MEMBER_ORANGE : MEMBER_PURPLE;
    const seed = shot.who === 'orange' ? 201 : 202;
    // PARK WALK (q39/q51, 27 Nov — parent: "park wale me character khada hai, chal
    // nahi raha"): member park me CHALTA hai — walk cycle (step phase + path par
    // travel, x -0.7 se +0.77). Baaki member shots me step=0 (khada). Walk f ka pure
    // function hai (koi state nahi) — stills + full build dono me chalega.
    let step = 0, wx = shot.cx;
    if ((id === 'q39' || id === 'q51') && loc === 'P') {
      const w = walk(f, shot.a, 1.1, 0.8);
      step = w.phase; wx = shot.cx - 0.7 + w.dist;
    }
    drawChar(card, seed, outfit, expr, shot.R, shot.L, f, cp, wx, 0, shot.cz, shot.cs, step, null, shot.tilt, null, false, false, mix);
  }
  // ---- held props (toward-lens): note/card/cash/phone, speaker ka chehra peeche ----
  showHeldProp(shot, cp);
  updateProxiesW();
  renderer.render(scene, camera);
};
window.TOTAL = TOTAL;
window.ready = Promise.resolve();
