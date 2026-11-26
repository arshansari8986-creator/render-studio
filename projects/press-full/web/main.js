// "Press Wala" — FULL VIDEO v3 FAST-CUT REBUILD (40.53s, 1216 frames @30fps, 52 shots, avg ~0.78 s/shot).
// DO SET: 'gali' (press dukaan wali gali) | 'dukaan' (press dukaan interior — counter/dher/bhaap).
// ENV: morning (subah) | day (din) | evening (shaam — narangi) | sunset (ant — gehra narangi).
// Palette: natural muted — dhool-mitti sadak, halki cream deewaar, halka neela aasmaan + garam horizon.
// Tez saturated rang SIRF hero cheezon par (₹2,00,000 board, ₹2,37,500 board, ₹10 laal tag, ₹350 sunehra tag, suit glow, galla peela).
// NO captions, NO music. Numbers objects bankar: "₹2,00,000" board, "RAJU PRESS" board, "₹10" laal tag,
//   phone screen "₹2,37,500", bada board "₹2,37,500", chhota tag "₹3,500", sunehra tag "₹350",
//   counter "₹2,83,500" (gin kar badhta hai), notebook "PRESS = BHEED · SUIT = GHAR".
// MUNH = bhaav ka instrument, bolne ka nahi — NO phoneme lip-sync. ENV is build me munh ke liye
// use NAHI hota (envelope.js sirf full-build reference ke liye hai). Munh sirf 4 states:
// band (dash) / "O" shock / khula-hansi / seedhi line — beat par khole (line shuru → khula hold
// ~0.5s → pause par band). Narration 100% voiceover — narration par munh band + expression badle.
// NO walk cycle — chalna = chhote kadam + halka bob; action = haath+sar+chehra.
// WITHHELD: notebook shot 3 me sirf jhalak, shot 9/11 me haath us par, poora khulta hai shot 20 par.
// Contract: window.ready, window.renderFrame(f).
import * as THREE from 'three';
import * as FX from './fx.js';
import * as T from './toon.js';
import { idle, blinkAt, q, M, clamp } from './motion.js';
import { tex, planks, plaster, stone, dirt, wetConcrete, tiles, tinRoof } from './paint.js';
import { TOTAL, shotAt, camFor, FLASH, BEAT_OF, beatU } from './story.js';

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
// gali deewaar wala lamp (shaam/sunset me ON — World V2; intensity applyEnv me)
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
// 2D bar (x0,y0)->(x1,y1) plane z par — taar, cycle frame, thela handle ke liye (World V2)
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
    if (props === 'manager') drawManagerProps(p, seed);
    else if (props) drawRajuProps(p, seed);
  });
  card.place(x, y, z, camPos, s);
}
const rajuCard = new Card(), neighCard = new Card(), neigh2Card = new Card(), neigh3Card = new Card(), mgrCard = new Card(), custCard = new Card();
const ALL_CARDS = [rajuCard, neighCard, neigh2Card, neigh3Card, mgrCard, custCard];
// FRESH character — Raju (Dhaba ke Bhanu ko copy NAHI): gehra teal kurta + cream shirt,
// garam skin #c88848 (chehra sabse garam), moochh, peeli pencil + naapne wala tape.
const RAJU = { tunic: '#2e6b62', shirt: '#fef3c7', skin: '#c88848', hair: '#1e1a20', hairStyle: 'thick', moustache: '#241a14', apron: '#e8e0cc' };
const NEIGH = { tunic: '#8a5d3b', shirt: '#f8fafc', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick' }; // background padosi
const NEIGH2 = { tunic: '#5d7a4a', shirt: '#fef3c7', skin: '#9a6a42', hair: '#2b211c', hairStyle: 'thick' }; // mohalla shock, beech wala (paseena)
const NEIGH3 = { tunic: '#c25a7a', shirt: '#fef3c7', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick', dress: '#c25a7a' }; // mohalla shock, teesri (aunty)
const MANAGER = { tunic: '#f8fafc', shirt: '#fef3c7', skin: '#b07840', hair: '#14100c', hairStyle: 'thick', moustache: '#241a14', stout: true }; // badi laundry ka manager — safed kurta, mota, sunehri chain
const CUST = { tunic: '#7a4a6f', shirt: '#f8fafc', skin: '#8a5a34', hair: '#1e1a20', hairStyle: 'thick', moustache: '#241a14' }; // suit lane wala graahak
// ---- Manager ki sunehri chain — card canvas par draw (Raju props jaisa pattern) ----
function drawManagerProps(p, seed) {
  const Hb = T.headBlob(seed, 118, 0), hc = T.headCenter(seed);
  const cx = 300, chin = hc + Hb.b, HH = 2 * Hb.b, bandY = chin + 0.35 * HH;
  // sunehri chain — seene par arc + chhota pendant
  p.stroke([[cx - 88, bandY - 6], [cx - 40, bandY + 26], [cx, bandY + 34], [cx + 40, bandY + 26], [cx + 88, bandY - 6]], 6, '#facc15');
  p.stroke([[cx - 88, bandY - 6], [cx - 40, bandY + 26], [cx, bandY + 34], [cx + 40, bandY + 26], [cx + 88, bandY - 6]], 2, '#a87c26');
  p.dot(cx, bandY + 40, 7, '#f59e0b');
}

// ---- MUNH, beat-level (frame numbers; line shuru → khula hold ~0.5s → pause par band) ----
// Narration 100% voiceover — narration ke beech munh band + expression badle.
// s08 (mohalla shock) aur s18 (manager hansi) me munh expr se aata hai ('shock' = "O",
// 'laugh' = khula-hansi) — mouthFor wahan null deta hai; manager ka loop alag fn me hai.
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
  if (f < 259) return null; // s05: Raju frame me nahi (tag ECU)
  if (f < 318) { // s06: phone dikhata hai — line start, hairan-khush
    if (f < 274) return 'o';
    return null;
  }
  if (f < 382) { // s07: line start + "₹2,37,500" number beat (f338-366)
    if (f < 333) return 'o';
    if (f >= 338 && f < 353) return 'o';
    return null;
  }
  if (f < 449) return null; // s08: mohalla shock — munh expr 'shock' se ("O")
  if (f < 493) { // s09: galla kholta hai — line start
    if (f < 464) return 'o';
    return null;
  }
  if (f < 519) return null; // s10: note ginna — dhyaan, munh band
  if (f < 566) return null; // s11: deflation — udaas, frown expr se
  if (f < 599) { // s12: "₹3,500" number beat (f578-599)
    if (f >= 578 && f < 590) return 'o';
    return null;
  }
  if (f < 650) { // s13: sawal — line start halka khula (expr 'wonder' bhi 'o' deta hai)
    if (f < 614) return 'o';
    return null;
  }
  if (f < 677) return null; // s14: Raju dekhta hai — aankhein badi, munh band
  if (f < 737) { // s15: line start + "₹350" number beat (f705-719)
    if (f < 692) return 'o';
    if (f >= 705 && f < 720) return 'o';
    return null;
  }
  if (f < 791) { // s16: line start + "20" beat (f758-769)
    if (f < 752) return 'o';
    if (f >= 758 && f < 769) return 'o';
    return null;
  }
  if (f < 838) return 'smirk'; // s17: proud — halki smirk, expression
  if (f < 920) return null; // s18: manager hansi — munh loop fn se; Raju shaant, munh band
  if (f < 1022) { // s19: line start + counter beat
    if (f < 935) return 'o';
    if (f >= 950 && f < 965) return 'o';
    return null;
  }
  if (f < 1088) { // s20: notebook — line start, phir shaant wise
    if (f < 1037) return 'o';
    return null;
  }
  if (f < 1150) { // s21: two-shot — line start
    if (f < 1103) return 'o';
    return null;
  }
  // s22: ending — line start, phir sabse badi smile par FREEZE (expr 'relief')
  if (f < 1165) return 'o';
  return null;
}
// Manager ki hansi loop (s18): ~0.5 s cycle — bada gol khula ("O") ↔ hansi ('laugh' expr ka munh).
// Gullak hansi loop jaisa: chhota "o" → band smile → bada gol khula → smile, cycle ~0.4-0.6 s.
function mgrMouth(f) {
  const c = (f - 838) % 15;
  return c < 7 ? 'O' : null;
}

// =====================================================================
// ENVS — subah ki roshni (natural, muted; koi single wash NAHI)
// =====================================================================
const ENVS = {
  // World V2 roshni: NEECHA garam suraj (lambi chhaon) + thanda bounce (har frame garam+thanda).
  morning: { bg: 0xd8e8ee, fogC: 0xd8e4e0, fogNear: 10, fogFar: 46, hemi: 1.05, hemiC: 0xffe8c8, hemiG: 0x8a7a5a, sun: 1.7, sunC: 0xffd9a0, sunPos: [-10, 4.5, 6], bounce: 0.4, bounceC: 0x9db8d9, expo: 1.12, sky: 'morning', lamp: 0, sunDisc: [-16, 7, -27], sunDiscC: 0xfff3c8, sunDiscR: 1.6, winC: 0x9db8c4, litWinC: 0x7a8a80 },
  day: { bg: 0xc8dcec, fogC: 0xd0dde6, fogNear: 12, fogFar: 48, hemi: 1.0, hemiC: 0xffe8c8, hemiG: 0x8a7a5a, sun: 1.6, sunC: 0xfff0c8, sunPos: [-9, 6, 5], bounce: 0.35, bounceC: 0x9db8d9, expo: 1.13, sky: 'day', lamp: 0, sunDisc: [-16, 9, -27], sunDiscC: 0xfff3c8, sunDiscR: 1.4, winC: 0x9db8c4, litWinC: 0x7a8a80 },
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
  const e = ENVS[name] || ENVS.morning;
  scene.background = new THREE.Color(e.bg);
  scene.fog = new THREE.Fog(e.fogC, e.fogNear, e.fogFar);
  hemi.intensity = e.hemi; hemi.color.set(e.hemiC); hemi.groundColor.set(e.hemiG);
  sun.intensity = e.sun; sun.color.set(e.sunC); sun.position.set(...e.sunPos);
  sun.target.position.set(0, 0, 0); sun.target.updateMatrixWorld();
  bounce.intensity = e.bounce; bounce.color.set(e.bounceC);
  renderer.toneMappingExposure = e.expo;
  lampLight.intensity = e.lamp || 0;
  lampBulbMat.color.set((e.lamp || 0) > 0 ? 0xffe9a8 : 0xcfd8dc);
  lampGlow.material.opacity = (e.lamp || 0) > 0 ? 0.55 : 0;
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
// ---------- DISTANT SKYLINE (background depth): hazy buildings peeche, har shot me ----------
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
  // 2nd silhouette row — door, bina khidki, fog+haze me (World V2: depth ki dusri parat)
  const silCols = [0x8a6f7a, 0x7a5f6e, 0x9a7f72, 0x6e5a6a];
  [[-24, 11], [-15, 8.5], [-6, 12], [3, 9], [12, 11.5], [21, 9.5]].forEach(([sx, sh], i) => {
    const b = box(6.5, sh, 1.0, lam({ color: silCols[i % silCols.length] }));
    b.position.set(sx, sh / 2, -27); skylineG.add(b);
  });
}
// L2 beech: makaan row z=-8 — tank + antenna + khidki (shaam/sunset me jalti hain) — World V2
const midG = new THREE.Group(); scene.add(midG);
{
  [[-7.5, 4.0, 0xb8a888], [0.5, 3.6, 0xc4b49a], [7.0, 4.6, 0xa8a49a]].forEach(([mx, mh, mcol]) => {
    const m = box(3.2, mh, 0.5, lam({ color: mcol })); m.position.set(mx, mh / 2, -8); midG.add(m);
    const mw = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.7), litWinMat);
    mw.position.set(mx + 0.7, 2.0, -7.72); midG.add(mw);
    const mw2 = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.7), litWinMat);
    mw2.position.set(mx - 0.7, 1.3, -7.72); midG.add(mw2);
    const par = box(3.3, 0.18, 0.55, lam({ color: 0x8a7a5a })); par.position.set(mx, mh + 0.09, -8); midG.add(par);
  });
  const tank = cyl(0.5, 0.5, 0.9, lam({ color: 0x374151 }), 14); tank.position.set(0.5, 4.05, -8); midG.add(tank);
  const tankTop = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: 0x4b5563 }));
  tankTop.position.set(0.5, 4.5, -8); midG.add(tankTop);
  for (const lx of [-0.1, 1.1]) {
    const leg = cyl(0.04, 0.04, 0.5, lam({ color: 0x4b5563 }), 6); leg.position.set(lx, 3.6, -8); midG.add(leg);
  }
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
// SETS — GALI (press dukaan wali gali) aur DUKAAN (interior — counter/dher/bhaap)
// =====================================================================
const galiG = new THREE.Group(); scene.add(galiG);
let motes = []; // dhoop me tairte dust motes (World V2 — sirf gali set me dikhte hain)
const dukaanG = new THREE.Group(); scene.add(dukaanG);
let lakhBoard = null; // s01 board — s07 me viral board se badalta hai (z-fight se bachne ke liye toggle)
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
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, 3); ground.receiveShadow = true; S.add(ground);
  // ---- ZAMEEN V2: 14 layered patches + geele daag + 20 kankar (World V2) ----
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
  [[-3.9, -2.3, 0.55, 0.4], [1.9, -0.2, 0.45, 0.32]].forEach(([px, pz, rx, rz]) => {
    const p = new THREE.Mesh(new THREE.CircleGeometry(1, 20), new THREE.MeshBasicMaterial({ color: 0x2e3a48, transparent: true, opacity: 0.45, depthWrite: false }));
    p.rotation.x = -Math.PI / 2; p.scale.set(rx, rz, 1); p.position.set(px, 0.012, pz); S.add(p);
  });
  {
    let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    const pebCols = [0x8a7a68, 0x6b5a44, 0x9a8a72, 0x5a4a38];
    for (let i = 0; i < 20; i++) {
      const px = -6 + rnd() * 12, pz = -3.5 + rnd() * 7.5;
      const peb = box(0.06 + rnd() * 0.07, 0.03 + rnd() * 0.02, 0.05 + rnd() * 0.05, lam({ color: pebCols[i % 4] }));
      peb.position.set(px, 0.02, pz); peb.rotation.y = rnd() * 3; S.add(peb);
    }
  }
  // sadak (asphalt) + dashes + dhool kinare
  const road = new THREE.Mesh(new THREE.PlaneGeometry(40, 3.4), lam({ color: 0x4a4640 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, 1.8); S.add(road);
  for (let i = 0; i < 8; i++) {
    const dash = box(1.1, 0.012, 0.14, bas({ color: 0xe2e8f0 }));
    dash.position.set(-14 + i * 4, 0.008, 1.8); S.add(dash);
  }
  [1.15, 2.45].forEach((tz) => { // tyre-track — 2 gehri lakeerein (World V2)
    const tr = new THREE.Mesh(new THREE.PlaneGeometry(40, 0.35), new THREE.MeshBasicMaterial({ color: 0x2e2a26, transparent: true, opacity: 0.55, depthWrite: false }));
    tr.rotation.x = -Math.PI / 2; tr.position.set(0, 0.004, tz); S.add(tr);
  });
  [[0, 0.35, 9, 0.5], [0, 3.25, 9, 0.5]].forEach(([px, pz, pw, pd]) => {
    const dust = new THREE.Mesh(new THREE.PlaneGeometry(pw, pd), new THREE.MeshBasicMaterial({ color: 0xb8a888, transparent: true, opacity: 0.4, depthWrite: false }));
    dust.rotation.x = -Math.PI / 2; dust.position.set(px, 0.006, pz); S.add(dust);
  });
  // press dukaan building — halki cream deewaar, terracotta chhat
  const dwall = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 3.2), lam({ map: wallV2Tex(), color: 0xffffff }));
  dwall.position.set(-1.5, 1.6, -4.3); dwall.receiveShadow = true; S.add(dwall);
  for (const px of [-4.6, 1.6]) {
    const pil = box(0.28, 3.2, 0.28, lam({ color: 0xd8c49a })); pil.position.set(px, 1.6, -4.15); S.add(pil);
  }
  const roof = box(7.0, 0.14, 2.4, lam({ map: tex(tinRoof(53), 2, 1), color: 0x9a3412 })); roof.position.set(-1.5, 3.28, -3.6); S.add(roof);
  const roofEdge = box(7.0, 0.1, 0.08, lam({ color: 0x7c2d12 })); roofEdge.position.set(-1.5, 3.22, -2.42); S.add(roofEdge);
  // chhat par paani ki tanki + gamle — chhat bhi khaali nahi (World V2)
  const roofTank = cyl(0.35, 0.35, 0.6, lam({ color: 0x1f2937 }), 12); roofTank.position.set(-3.6, 3.65, -4.0); S.add(roofTank);
  const roofPot = cyl(0.12, 0.09, 0.22, lam({ color: 0x9a5a34 }), 10); roofPot.position.set(0.9, 3.45, -4.0); S.add(roofPot);
  const roofPlant = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), lam({ color: 0x4a6b2f })); roofPlant.position.set(0.9, 3.62, -4.0); S.add(roofPlant);
  const door = box(1.0, 2.0, 0.1, lam({ color: 0x7c2d12 })); door.position.set(-1.2, 1.0, -4.2); S.add(door);
  [[-1.2, 1.45], [-1.2, 0.65]].forEach(([dx, dy]) => {
    const pan = box(0.7, 0.55, 0.03, lam({ color: 0x5f2110 })); pan.position.set(dx, dy, -4.14); S.add(pan);
  });
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), lam({ color: 0xfacc15 })); knob.position.set(-0.85, 1.0, -4.12); S.add(knob);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), winGlassMat); win.position.set(0.3, 1.9, -4.22); S.add(win);
  const winBar = box(0.06, 1.0, 0.12, lam({ color: 0x2f4a4a })); winBar.position.set(0.3, 1.9, -4.2); S.add(winBar);
  const winBar2 = box(1.0, 0.06, 0.12, lam({ color: 0x2f4a4a })); winBar2.position.set(0.3, 1.9, -4.2); S.add(winBar2);
  // signs + boards (deewaar par)
  const pressSign = boardMesh(2.2, 0.45, pressSignTex, true); pressSign.position.set(-1.5, 2.95, -4.24); S.add(pressSign);
  const lakhBoardMesh = boardMesh(1.8, 1.08, lakhTex, true); lakhBoardMesh.position.set(-2.7, 1.85, -4.22); S.add(lakhBoardMesh); lakhBoard = lakhBoardMesh;
  // kapdon ki kataar — dukaan ke saamne rassi par (Raju ke peeche; BOARD se door — line kabhi board ke upar se na guzre)
  mkClothesLine(S, -1.6, 1.2, 2.3, -3.5, [0xf8fafc, 0x93c5fd, 0xfca5a5, 0x86efac, 0xfde68a]);
  // ---- POSTERS (World V2 — deewaar khaali nahi) ----
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
  // dusri kapdon ki line (left — BOARD se door, x -4.6..-3.7)
  mkClothesLine(S, -4.6, -3.7, 2.45, -3.9, [0xfca5a5, 0x86efac, 0xf8fafc], 0.30, 0.45);
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
  // kirana ke saamne bori + dabba (aur depth)
  const sack2 = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), lam({ color: 0xd6c9a8 }));
  sack2.scale.set(1, 0.8, 0.9); sack2.position.set(3.4, 0.22, -3.9); S.add(sack2);
  const kbox = box(0.4, 0.35, 0.4, lam({ color: 0x8a6844 })); kbox.position.set(5.9, 0.17, -3.9); S.add(kbox);
  // peeche ki kataar (midground) — dukaanon ke peeche, duniya gehri lage
  [[-7.5, 4.0, 0xb8a888], [7.0, 4.6, 0xa8a49a], [0.5, 3.6, 0xc4b49a]].forEach(([mx, mh, mcol]) => {
    const m = box(3.2, mh, 0.5, lam({ color: mcol })); m.position.set(mx, mh / 2, -7); S.add(m);
    const mw = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.7), litWinMat);
    mw.position.set(mx + 0.7, 2.0, -6.72); S.add(mw);
  });
  const t1 = mkTree(-6.2, -3.6, 1.05); S.add(t1); galiTrees.push(t1);
  const t2 = mkTree(6.4, -3.4, 0.9); S.add(t2); galiTrees.push(t2);
  const t3 = mkTree(-5.0, -6.5, 1.3); S.add(t3); galiTrees.push(t3);
  const bush = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), lam({ color: 0x3d5c2a }));
  bush.scale.set(1.3, 0.7, 1); bush.position.set(5.8, 0.3, -3.2); S.add(bush);
  // khambe + taar (sag) — gali ke upar
  const wireMat = lam({ color: 0x2c343c });
  const wirePole1 = cyl(0.04, 0.05, 4.2, lam({ color: 0x39434c })); wirePole1.position.set(-6.5, 2.1, -3.6); S.add(wirePole1);
  const wirePole2 = cyl(0.04, 0.05, 4.2, lam({ color: 0x39434c })); wirePole2.position.set(6.5, 2.1, -3.6); S.add(wirePole2);
  [-6.5, 6.5].forEach((px) => { // khambe ki baahein (cross-arms)
    const arm = box(0.9, 0.05, 0.05, lam({ color: 0x39434c })); arm.position.set(px, 3.9, -3.6); S.add(arm);
  });
  [[3.9, -3.5], [3.55, -3.9], [3.2, -3.2]].forEach(([wy, wz]) => { // 3 taar, sag wale
    S.add(bar2D(-6.5, wy, 0, wy - 0.35, wz, wireMat, 0.015));
    S.add(bar2D(0, wy - 0.35, 6.5, wy, wz, wireMat, 0.015));
  });
  // ---- THELA (haath-gaadi, kapdon ke saath) ----
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
  // ---- CRATES (dabbe, stack) + bori ----
  {
    const c1 = box(0.55, 0.45, 0.55, lam({ color: 0x8a6844 })); c1.position.set(-4.3, 0.22, -2.2); S.add(c1);
    const c1e = box(0.57, 0.06, 0.57, lam({ color: 0x6d5136 })); c1e.position.set(-4.3, 0.45, -2.2); S.add(c1e);
    const c2 = box(0.45, 0.4, 0.45, lam({ color: 0x9a7a52 })); c2.position.set(-4.28, 0.67, -2.2); c2.rotation.y = 0.3; S.add(c2);
    const c3 = box(0.35, 0.3, 0.35, lam({ color: 0x7a5f3e })); c3.position.set(-4.3, 1.02, -2.2); c3.rotation.y = -0.2; S.add(c3);
    const sack = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), lam({ color: 0xc2b280 }));
    sack.scale.set(1, 0.75, 0.9); sack.position.set(-3.6, 0.22, -2.3); S.add(sack);
  }
  // ---- BALTI + mug ----
  {
    const b = cyl(0.16, 0.13, 0.3, lam({ color: 0x64748b }), 14); b.position.set(1.9, 0.15, -0.6); S.add(b);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.015, 8, 16), lam({ color: 0x475569 }));
    rim.rotation.x = Math.PI / 2; rim.position.set(1.9, 0.3, -0.6); S.add(rim);
    const mug = cyl(0.06, 0.05, 0.12, lam({ color: 0xdc2626 }), 10); mug.position.set(2.15, 0.06, -0.35); S.add(mug);
  }
  // ---- CYCLE (deewaar se lagi) ----
  {
    const cy = new THREE.Group(); cy.position.set(1.7, 0, -3.85); cy.rotation.y = -0.35; cy.rotation.z = 0.1; S.add(cy);
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
    const hb = box(0.08, 0.04, 0.4, lam({ color: 0x9ca3af })); hb.position.set(0.58, 0.78, 0); cy.add(hb);
  }
  // ---- NALKA (hand pump) + geela farsh ----
  {
    const base = box(0.3, 0.15, 0.3, lam({ color: 0x6b7280 })); base.position.set(-3.9, 0.07, -2.8); S.add(base);
    const pipe = cyl(0.05, 0.05, 1.1, lam({ color: 0x374151 }), 10); pipe.position.set(-3.9, 0.7, -2.8); S.add(pipe);
    S.add(bar2D(-3.9, 1.15, -3.55, 1.38, -2.8, lam({ color: 0x4b5563 }), 0.03));
    const spout = cyl(0.035, 0.035, 0.28, lam({ color: 0x4b5563 }), 8); spout.rotation.z = Math.PI / 2; spout.position.set(-3.72, 0.95, -2.8); S.add(spout);
    const spoutTip = cyl(0.05, 0.035, 0.12, lam({ color: 0x4b5563 }), 8); spoutTip.position.set(-3.58, 0.9, -2.8); S.add(spoutTip);
  }
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
  // ---- SHELF (khidki ke neeche, deewaar par) — bottle + dibba + folded kapda ----
  {
    const plank = box(0.9, 0.05, 0.25, lam({ color: 0x8a6844 })); plank.position.set(0.3, 1.15, -4.1); S.add(plank);
    const bA = cyl(0.055, 0.055, 0.2, lam({ color: 0x166534 }), 10); bA.position.set(0.05, 1.28, -4.1); S.add(bA);
    const bB = cyl(0.05, 0.05, 0.18, lam({ color: 0x1d4ed8 }), 10); bB.position.set(0.3, 1.27, -4.1); S.add(bB);
    const dib = box(0.16, 0.12, 0.16, lam({ color: 0xb45309 })); dib.position.set(0.55, 1.24, -4.1); S.add(dib);
    const sCloth = box(0.2, 0.07, 0.18, lam({ color: 0xfef3c7 })); sCloth.position.set(0.78, 1.21, -4.1); sCloth.rotation.y = 0.2; S.add(sCloth);
  }
  // dhoop me tairte dust motes (World V2 — roshni dikhti hai)
  for (let i = 0; i < 8; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffe9b0 }));
    sp.position.set(-3 + (i * 0.9) % 4.5, 1.2 + (i % 3) * 0.7, -3 + (i % 2) * 1.2);
    sp.scale.setScalar(0.12 + (i % 3) * 0.05);
    scene.add(sp); motes.push(sp);
  }
}

// ---------- DUKAAN: counter/dher/bhaap (kapdon ka dher + press + latakta bulb) ----------
{
  const S = dukaanG;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 34), lam({ map: tex(dirt(23), 8, 8), color: 0x9c8a70 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, 3); S.add(ground);
  // ---- ZAMEEN V2 (dukaan): 8 patches + 10 kankar ----
  [[-2.0, 0.5, 1.1, 0.6, 0x6b543a, 0.35], [1.5, 1.5, 1.2, 0.7, 0x7a6547, 0.3], [-3.5, -1.5, 1.0, 0.6, 0x5a4630, 0.4],
   [3.5, -2.0, 1.1, 0.6, 0x8a7a5a, 0.3], [0.0, -1.0, 0.9, 0.5, 0x4a3a28, 0.35], [-1.0, 3.0, 1.3, 0.7, 0x9a8a68, 0.25],
   [4.5, 1.0, 1.0, 0.6, 0x6b543a, 0.3], [-5.0, 2.0, 1.1, 0.6, 0x7a6547, 0.3]].forEach(([px, pz, rx, rz, col, op], i) => {
    const p = new THREE.Mesh(new THREE.CircleGeometry(1, 20), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false }));
    p.rotation.x = -Math.PI / 2; p.scale.set(rx, rz, 1); p.position.set(px, 0.005 + i * 0.0004, pz); S.add(p);
  });
  {
    let seed = 777; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    const pebCols = [0x8a7a68, 0x6b5a44, 0x9a8a72, 0x5a4a38];
    for (let i = 0; i < 10; i++) {
      const px = -5 + rnd() * 10, pz = -3 + rnd() * 6;
      const peb = box(0.06 + rnd() * 0.07, 0.03 + rnd() * 0.02, 0.05 + rnd() * 0.05, lam({ color: pebCols[i % 4] }));
      peb.position.set(px, 0.02, pz); peb.rotation.y = rnd() * 3; S.add(peb);
    }
  }
  // peeche ki deewaar — NEECHI (2.8) taaki upar aasmaan + skyline dikhe
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 2.8), lam({ map: tex(plaster(43, 40), 2, 1), color: 0xe8dcc0 }));
  wall.position.set(0, 1.4, -3.8); S.add(wall);
  const bigSign = boardMesh(1.6, 0.28, pressSignTex, true); bigSign.position.set(-1.6, 2.3, -3.72); S.add(bigSign);
  // kapdon ki kataar deewaar par (peeche) — FIX run 2: line x -3.0..-0.6 (board x 0.0..1.2 se door);
  // pehle -0.6..3.4 thi aur kagaz counter board "₹2,83,500" ko dhak raha tha (run #186 QA fail 1).
  mkClothesLine(S, -3.0, -0.6, 2.1, -3.7, [0xf8fafc, 0xfca5a5, 0x86efac, 0xfde68a]);
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
  // ---- SHELF (deewaar par, counter board se door — x 1.85..2.75) + POSTER + BALTI (World V2) ----
  {
    const plank = box(0.9, 0.05, 0.25, lam({ color: 0x8a6844 })); plank.position.set(2.3, 1.3, -3.7); S.add(plank);
    const bA = cyl(0.055, 0.055, 0.2, lam({ color: 0x166534 }), 10); bA.position.set(2.05, 1.43, -3.7); S.add(bA);
    const bB = cyl(0.05, 0.05, 0.18, lam({ color: 0x1d4ed8 }), 10); bB.position.set(2.3, 1.42, -3.7); S.add(bB);
    const dib = box(0.16, 0.12, 0.16, lam({ color: 0xb45309 })); dib.position.set(2.55, 1.39, -3.7); S.add(dib);
    const sCloth = box(0.2, 0.07, 0.18, lam({ color: 0xfef3c7 })); sCloth.position.set(2.72, 1.36, -3.7); sCloth.rotation.y = 0.2; S.add(sCloth);
  }
  const dPosterTex = textBoard(256, 320, (g, w, h) => {
    g.fillStyle = '#fef3c7'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#166534'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16);
    g.textAlign = 'center'; g.fillStyle = '#166534';
    g.font = 'bold 52px Arial'; g.fillText('SUIT', w / 2, 96);
    g.fillStyle = '#1e293b'; g.font = 'bold 76px Arial'; g.fillText('₹350', w / 2, 200);
    g.font = 'bold 30px Arial'; g.fillText('SHAADI WALA', w / 2, 260);
  });
  const dPoster = boardMesh(0.55, 0.68, dPosterTex, true); dPoster.position.set(2.2, 2.0, -3.72); S.add(dPoster);
  const dBalti = cyl(0.16, 0.13, 0.3, lam({ color: 0x64748b }), 14); dBalti.position.set(-2.2, 0.15, -1.2); S.add(dBalti);
  // peeche ki kataar + ped (depth)
  [[-5.5, 4.2, 0xb8a888], [5.0, 3.8, 0xa8a49a]].forEach(([mx, mh, mcol]) => {
    const m = box(3.2, mh, 0.5, lam({ color: mcol })); m.position.set(mx, mh / 2, -8); S.add(m);
    const mw = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.7), litWinMat);
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
const tag10 = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), new THREE.MeshBasicMaterial({ map: tagTex, transparent: true, depthWrite: false }));
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

// =====================================================================
// NEW PROPS — s06-s22 (phone, galla, suit, notebook, counter, rack)
// Har prop default HIDDEN; renderFrame me shot ke hisaab se dikhaya jata hai.
// =====================================================================
// ---- "₹2,37,500" VIRAL BOARD (s07) — s01 board jaisi style, alag mesh (toggle se z-fight nahi) ----
const viralTex = textBoard(512, 320, (g, w, h) => {
  g.fillStyle = '#134e4a'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#facc15'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
  g.textAlign = 'center'; g.fillStyle = '#f8fafc';
  g.font = 'bold 36px Arial'; g.fillText('★ VIRAL POST ★', w / 2, 56);
  g.fillStyle = '#facc15'; g.font = 'bold 76px Arial'; g.fillText('₹2,37,500', w / 2, 160);
  g.fillStyle = '#f8fafc'; g.font = 'bold 40px Arial'; g.fillText('EK MAHINE MEIN', w / 2, 240);
});
const viralBoard = boardMesh(1.6, 1.0, viralTex, true);
viralBoard.position.set(-2.7, 1.85, -4.22); viralBoard.visible = false; scene.add(viralBoard);

// ---- PHONE (s06) — haath me phone, post dikhti hai: "FEBRUARY" + Raju photo + "₹2,37,500" ----
const phoneScreenTex = textBoard(512, 960, (g, w, h) => {
  g.fillStyle = '#fef9ec'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#134e4a'; g.fillRect(0, 0, w, 110);
  g.fillStyle = '#f8fafc'; g.font = 'bold 62px Arial'; g.textAlign = 'center'; g.fillText('FEBRUARY', w / 2, 78);
  // photo: Raju jaisa figure (teal kurta, garam chehra, peeli pencil) — simple shapes
  g.fillStyle = '#2e6b62'; g.beginPath(); g.arc(w / 2, 470, 150, 0, 7); g.fill();
  g.fillStyle = '#c88848'; g.beginPath(); g.arc(w / 2, 330, 92, 0, 7); g.fill();
  g.fillStyle = '#1e1a20'; g.beginPath(); g.arc(w / 2, 268, 92, Math.PI, 0); g.fill();
  g.strokeStyle = '#facc15'; g.lineWidth = 12; g.beginPath(); g.moveTo(w / 2 + 78, 300); g.lineTo(w / 2 + 105, 210); g.stroke();
  g.fillStyle = '#1e293b'; g.font = 'bold 44px Arial'; g.fillText('Raju ₹2,37,500', w / 2, 640);
  g.fillText('kamata hai!', w / 2, 700);
  g.fillStyle = '#134e4a'; g.fillRect(24, 740, w - 48, 110);
  g.fillStyle = '#facc15'; g.font = 'bold 72px Arial'; g.fillText('₹2,37,500', w / 2, 822);
});
const phoneCountCanvas = document.createElement('canvas'); phoneCountCanvas.width = 512; phoneCountCanvas.height = 96;
const phoneCountCtx = phoneCountCanvas.getContext('2d');
const phoneCountTex = new THREE.CanvasTexture(phoneCountCanvas); phoneCountTex.colorSpace = THREE.SRGBColorSpace;
let lastPhoneCounts = '';
function drawPhoneCounts(likesK, sharesK) {
  const key = likesK.toFixed(1) + '|' + sharesK.toFixed(1);
  if (key === lastPhoneCounts) return; lastPhoneCounts = key;
  const g = phoneCountCtx;
  g.fillStyle = '#fef9ec'; g.fillRect(0, 0, 512, 96);
  g.textAlign = 'center'; g.font = 'bold 52px Arial';
  g.fillStyle = '#dc2626'; g.fillText('♥ ' + likesK.toFixed(1) + 'K', 140, 66);
  g.fillStyle = '#1d4ed8'; g.fillText('↗ ' + sharesK.toFixed(1) + 'K', 380, 66);
  phoneCountTex.needsUpdate = true;
}
const phoneG = new THREE.Group(); scene.add(phoneG);
{
  const body = box(0.8, 1.5, 0.06, lam({ color: 0x1f2937 })); phoneG.add(body);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 1.42), bas({ map: phoneScreenTex }));
  screen.position.z = 0.035; phoneG.add(screen);
  const countPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.12), bas({ map: phoneCountTex }));
  countPlane.position.set(0, -0.6, 0.04); phoneG.add(countPlane);
  phoneG.position.set(-0.75, 1.85, -1.3); phoneG.rotation.y = -0.15; phoneG.visible = false;
}

// ---- GALLA (s09-s12, s19) — lakdi ka box + khulne wala dhakkan + andar note ----
const gallaG = new THREE.Group(); scene.add(gallaG);
let gallaLid = null;
{
  const gbox = box(0.55, 0.28, 0.4, lam({ color: 0x8a6844 })); gbox.position.set(0.3, 1.2, -2.6); gallaG.add(gbox);
  const gtop = box(0.57, 0.03, 0.42, lam({ color: 0xc9a06a })); gtop.position.set(0.3, 1.35, -2.6); gallaG.add(gtop);
  const lidGeo = new THREE.BoxGeometry(0.55, 0.04, 0.4); lidGeo.translate(0, 0, 0.2);
  gallaLid = new THREE.Mesh(lidGeo, lam({ color: 0x6d5136 }));
  gallaLid.position.set(0.3, 1.36, -2.8); gallaG.add(gallaLid);
  // andar 3-4 note (khaali galla beat me bhi sirf ye dikhte hain)
  for (let i = 0; i < 3; i++) {
    const n = box(0.3, 0.015, 0.2, lam({ color: i % 2 ? 0xd9f99d : 0xbbf7d0 }));
    n.position.set(0.3 + (i - 1) * 0.02, 1.36 + i * 0.018, -2.6); n.rotation.y = (i - 1) * 0.12; gallaG.add(n);
  }
  gallaG.visible = false;
}
// ---- GINNE WALA NOTE (s10) — haath se upar-neeche, ek-ek karke ----
const countNote = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.14), lam({ color: 0xd9f99d, side: THREE.DoubleSide }));
countNote.visible = false; scene.add(countNote);
// ---- CHHOTA NOTE-DHER (s12) — sirf 3 note ----
const smallPileG = new THREE.Group(); scene.add(smallPileG);
{
  for (let i = 0; i < 3; i++) {
    const n = box(0.3, 0.02, 0.2, lam({ color: i % 2 ? 0xd9f99d : 0xbbf7d0 }));
    n.position.set(0.15 + (i - 1) * 0.02, 1.08 + i * 0.022, -2.6); n.rotation.y = (i - 1) * 0.15; smallPileG.add(n);
  }
  smallPileG.visible = false;
}
// ---- ₹3,500 CHHOTA TAG (s12) — muted, chhota (deflation: chhota number chhota dikhe) ----
const tag3500Tex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#9ca3af'; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.fill();
  g.strokeStyle = '#6b7280'; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 102, 0, 7); g.stroke();
  g.fillStyle = '#f9fafb'; g.font = 'bold 46px Arial'; g.textAlign = 'center'; g.fillText('₹3,500', 128, 146);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const tag3500 = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.35), new THREE.MeshBasicMaterial({ map: tag3500Tex, transparent: true, depthWrite: false }));
tag3500.position.set(0.55, 1.28, -2.35); tag3500.rotation.z = 0.1; tag3500.rotation.x = -0.2; tag3500.visible = false; scene.add(tag3500);
// ---- ₹350 SUNEHRA TAG (s15) — bada, chamakta ----
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

// ---- SUIT (single, hanger par) — s14/s15/s21/s22 me jagah badalta hai ----
// hero=true: ENDING wala suit — halke lapel + badi safed shirt (unlit, sunset me bhi safed) + tie,
// taaki suit kaale dabbe jaisa na lage (run #186 QA fail 2: f1210 me suit sirf kaala rectangle tha).
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
// ENDING hero suit (sirf s22) — halka jacket, lapel/shirt/tie saaf dikhe
const suitEndG = mkSuit(0.55, 0.8, 0x2c4a6b, true); suitEndG.visible = false; scene.add(suitEndG);

// ---- 20 SUIT KA DHER (s16-s17) — folded suits, pyramid: 8+6+4+2 = 20 ----
const pileSuits = [];
{
  const cols = [0x1e3a5f, 0x3f3f46, 0x7f1d1d, 0xe8e0cc, 0x2e6b62, 0x854d0e];
  const layers = [[8, 4, 2, 0.05], [6, 3, 2, 0.14], [4, 2, 2, 0.23], [2, 2, 1, 0.32]];
  let idx = 0;
  layers.forEach(([n, nx, nz, y]) => {
    for (let i = 0; i < n; i++) {
      const m = box(0.45, 0.09, 0.38, lam({ color: cols[idx % cols.length] }));
      m.position.set(0.3 + ((i % nx) - (nx - 1) / 2) * 0.47, y, -2.8 + (Math.floor(i / nx) - (nz - 1) / 2) * 0.4);
      m.rotation.y = ((idx * 37) % 10 - 5) * 0.02;
      m.visible = false; scene.add(m); pileSuits.push(m); idx++;
    }
  });
}
// ---- SUIT KA PAHAAD (s19) — rack par latakte 6 suit + neeche folded dher ----
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
// ---- NOTEBOOK CHHOTI (withheld — jhalak s03, haath us par s09/s11) ----
const notebookSmall = new THREE.Group(); scene.add(notebookSmall);
{
  const cover = box(0.3, 0.05, 0.42, lam({ color: 0x1e40af })); notebookSmall.add(cover);
  const pages = box(0.28, 0.04, 0.4, lam({ color: 0xfef9c3 })); pages.position.y = 0.01; notebookSmall.add(pages);
  notebookSmall.visible = false;
}
// ---- NOTEBOOK PAGE (s20 — withheld reveal) — "PRESS = BHEED · SUIT = GHAR" ----
const notebookPageTex = textBoard(704, 512, (g, w, h) => {
  g.fillStyle = '#fef9c3'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#dc2626'; g.lineWidth = 3; g.strokeRect(14, 14, w - 28, h - 28);
  g.textAlign = 'center'; g.fillStyle = '#1e40af';
  g.font = 'bold 64px Arial'; g.fillText('PRESS = BHEED', w / 2, 170);
  g.font = 'bold 64px Arial'; g.fillText('SUIT = GHAR', w / 2, 350);
  g.strokeStyle = '#1e40af'; g.lineWidth = 5;
  g.beginPath(); g.moveTo(90, 200); g.lineTo(w - 90, 200); g.stroke();
  g.beginPath(); g.moveTo(90, 380); g.lineTo(w - 90, 380); g.stroke();
  g.font = 'italic 40px Arial'; g.fillStyle = '#1e40af'; g.fillText('— Raju', w - 110, 470);
});
const notebookPage = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.8), bas({ map: notebookPageTex }));
notebookPage.position.set(0.3, 1.35, -2.2); notebookPage.visible = false; scene.add(notebookPage);
// ---- COUNTER BOARD (s19) — "₹2,83,500" gin kar badhta hai ----
const counterCanvas = document.createElement('canvas'); counterCanvas.width = 512; counterCanvas.height = 360;
const counterCtx = counterCanvas.getContext('2d');
const counterTex = new THREE.CanvasTexture(counterCanvas); counterTex.colorSpace = THREE.SRGBColorSpace;
let lastCounterVal = -1;
function drawCounter(v) {
  // FIX run 2: 500-step (pehle 5000-step tha — floor(283500/5000)*5000 = 2,80,000 aata tha,
  // final value ₹2,83,500 kabhi display hi nahi hota tha — run #186 QA fail 1).
  const q = Math.floor(v / 500) * 500;
  if (q === lastCounterVal) return; lastCounterVal = q;
  const g = counterCtx;
  g.fillStyle = '#134e4a'; g.fillRect(0, 0, 512, 360);
  g.strokeStyle = '#facc15'; g.lineWidth = 8; g.strokeRect(10, 10, 492, 340);
  g.textAlign = 'center'; g.fillStyle = '#f8fafc';
  g.font = 'bold 40px Arial'; g.fillText('MAHINE KA GALLA', 256, 70);
  g.fillStyle = '#facc15'; g.font = 'bold 84px Arial'; g.fillText('₹' + q.toLocaleString('en-IN'), 256, 190);
  g.fillStyle = '#f8fafc'; g.font = 'bold 36px Arial'; g.fillText('SUIT SE BHARA', 256, 280);
  counterTex.needsUpdate = true;
}
const counterBoard = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.85), bas({ map: counterTex }));
counterBoard.position.set(0.6, 2.0, -3.72); counterBoard.visible = false; scene.add(counterBoard);
// ---- PASEENE KI BOOND (s08 — beech wale mohalle wale ke maathe par) ----
const sweatDrop = new THREE.Mesh(new THREE.CircleGeometry(0.05, 12), bas({ color: 0x9fd4ff }));
sweatDrop.position.set(-0.72, 1.6, -2.1); sweatDrop.visible = false; scene.add(sweatDrop);

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
    sp.visible = (shot.set === 'gali');
    sp.position.y += Math.sin(f * 0.05 + i * 2.1) * 0.0012;
    sp.position.x += Math.cos(f * 0.02 + i) * 0.0009;
  });
  skylineG.visible = true;
  midG.visible = true;
  ALL_CARDS.forEach((c) => c.hide());
  const cp = cam.pos;
  // ---- set visibility ----
  galiG.visible = (shot.set === 'gali');
  dukaanG.visible = (shot.set === 'dukaan');
  bulbLight.intensity = (shot.set === 'dukaan') ? (shot.env === 'evening' ? 3 : 2) : 0;
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
  // ---- naye props default band (har shot me reset — sirf apne shot me dikhe) ----
  if (lakhBoard) lakhBoard.visible = (id !== 's07');
  viralBoard.visible = false;
  phoneG.visible = false;
  gallaG.visible = false; if (gallaLid) gallaLid.rotation.x = 0;
  countNote.visible = false;
  smallPileG.visible = false;
  tag3500.visible = false;
  tag350.visible = false; suitGlowLight.intensity = 0; glintSuit.material.opacity = 0;
  suitG.visible = false;
  suitEndG.visible = false;
  pileSuits.forEach((m) => { m.visible = false; });
  rackG.visible = false;
  notebookSmall.visible = false;
  notebookPage.visible = false;
  counterBoard.visible = false;
  sweatDrop.visible = false;
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

  // ---- beat dispatch (v3: 52 shots, 22 beats) ----
  // u = shot ke andar 0..1; bu = poori beat par 0..1 (beat-spanning actions: counter, lid, pile, phone counts).
  // sub = beat ke andar shot ka index (0-based). Har sub-shot me alag angle (story.js CAMS) + alag action-step.
  const beat = BEAT_OF[id], bu = beatU(f), sub = shot.sub;
  switch (beat) {
    case 'b01': { // HOOK: aerial → push-in → board close; Raju board ke BAGAL me; padosi gali paar karta hai
      drawChar(rajuCard, 61, RAJU, 'smile', 'reach', 'hang', f, cp, -1.0, 0, -1.6, 1.05, 0, 0.35, 0, mouthFor(f), true);
      const nx = 3.5 - 2.0 * bu;
      drawChar(neighCard, 63, NEIGH, 'neutral', 'hang', 'hang', f, cp, nx, 0, -3.2, 0.85, 0.5 + 0.08 * Math.sin(f * 0.15), null, 0, null, false);
      glintBoard.position.set(-2.7, 2.05, -4.0);
      glintBoard.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3);
      break;
    }
    case 'b02': { // Raju CLOSE-UP, sly smile; peeli pencil saaf; chidiya aasmaan se (sub0)
      drawChar(rajuCard, 61, RAJU, 'squint', 'hang', 'hang', f, cp, -1.5, 0, -1.6, 2.1, 0, null, 2, mouthFor(f), true);
      if (sub === 0) {
        bird.visible = true;
        bird.position.set(-4 + 8 * bu, 5.5 + Math.sin(f * 0.1) * 0.2, -12);
        bird.rotation.z = Math.sin(f * 0.2) * 0.2;
      }
      break;
    }
    case 'b03': { // Raju intro MEDIUM — press uthata hai (lift frame-based, v2 jaisa)
      const lift = 0.15 + 0.45 * M.surge(clamp((f - 130) / 30));
      drawChar(rajuCard, 61, RAJU, 'smile', 'reach', 'hang', f, cp, -0.9, 0, -2.0, 1.05, 0, lift, 0, mouthFor(f), true);
      ironG.visible = true;
      ironG.position.set(-0.34, 1.28 + 0.28 * lift, -1.85);
      ironG.rotation.y = 0.3; ironG.rotation.z = -0.08;
      break;
    }
    case 'b04': { // Process CLOSE-UP — dher + bhaap; Raju press chala raha hai (~0.5s cycle)
      const ph = f * 0.42;
      const lift = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(ph));
      drawChar(rajuCard, 61, RAJU, 'neutral', 'reach', 'hang', f, cp, -0.35, 0, -3.0, 1.0, 0, lift, 0, mouthFor(f), true);
      ironG.visible = true;
      ironG.position.set(0.3, 1.58 + 0.10 * (0.5 + 0.5 * Math.sin(ph)), -2.6);
      ironG.rotation.y = 0.1;
      break;
    }
    case 'b05': { // ₹10 TAG ECU — sub0 pop-in, sub1 hold bada
      const pop = sub === 0 ? clamp(u * 4, 0, 1) : 1;
      tag10.visible = true;
      tag10.position.set(0.3, 1.35, -2.3);
      tag10.scale.setScalar(Math.max(0.01, pop));
      tag10.material.opacity = pop;
      tag10.rotation.z = Math.sin(f * 0.05) * 0.05;
      tagString.visible = true;
      tagString.position.set(0.3, 1.68, -2.31);
      tagString.material.opacity = pop;
      break;
    }
    case 'b06': { // PHONE — like/share beat bhar badhte hain (bu)
      drawChar(rajuCard, 61, RAJU, 'smile', 'reach', 'hang', f, cp, -1.5, 0, -1.6, 1.0, 0, 0.3, 0, mouthFor(f), true);
      phoneG.visible = true;
      phoneG.rotation.z = Math.sin(f * 0.05) * 0.03;
      drawPhoneCounts(8.4 + 4.0 * bu, 5.1 + 3.1 * bu);
      glintBoard.position.set(-0.75, 2.2, -1.25);
      glintBoard.material.opacity = 0.25 + 0.25 * Math.sin(f * 0.3);
      break;
    }
    case 'b07': { // ₹2,37,500 BOARD — sub0 wide, sub1 push-in, sub2 Raju eyes (camera); Raju board ko cover na kare
      viralBoard.visible = true;
      drawChar(rajuCard, 61, RAJU, 'wonder', 'hang', 'hang', f, cp, -1.35, 0, -3.6, 0.95, 0, null, 0, mouthFor(f), true);
      glintBoard.position.set(-2.7, 2.1, -4.0);
      glintBoard.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3);
      break;
    }
    case 'b08': { // MOHALLA SHOCK — sub0 3 faces wide, sub1 beech wala "O", sub2 aunty + paseena
      drawChar(neighCard, 63, NEIGH, 'shock', 'hang', 'hang', f, cp, -1.85, 0, -2.2, 1.0, 0, null, 0, null, false);
      drawChar(neigh2Card, 65, NEIGH2, 'shock', 'hang', 'hang', f, cp, -0.9, 0, -2.2, 1.0, 0, null, 0, null, false);
      drawChar(neigh3Card, 69, NEIGH3, 'shock', 'hang', 'hang', f, cp, 0.05, 0, -2.2, 1.0, 0, null, 0, null, false);
      sweatDrop.visible = true;
      sweatDrop.position.set(-0.72, 1.6 - 0.12 * bu, -2.1);
      break;
    }
    case 'b09': { // SHAAM: galla beat bhar khulta hai (lid bu se); notebook chhoti counter par (jhalak)
      drawChar(rajuCard, 61, RAJU, 'neutral', 'reach', 'hang', f, cp, -0.35, 0, -3.0, 1.0, 0, 0.25, 0, mouthFor(f), true);
      gallaG.visible = true;
      if (gallaLid) gallaLid.rotation.x = -1.9 * M.surge(bu);
      notebookSmall.visible = true;
      notebookSmall.position.set(1.3, 1.09, -2.6); notebookSmall.rotation.set(0, 0.2, 0);
      break;
    }
    case 'b10': { // NOTE GINNA CLOSE-UP — ek-ek note upar-neeche
      const lift = 0.3 + 0.15 * Math.sin(f * 0.5);
      drawChar(rajuCard, 61, RAJU, 'neutral', 'reach', 'hang', f, cp, -0.35, 0, -3.0, 1.0, 0, lift, 0, null, true);
      gallaG.visible = true;
      if (gallaLid) gallaLid.rotation.x = -1.9;
      countNote.visible = true;
      countNote.position.set(0.3, 1.45 + 0.08 * Math.abs(Math.sin(f * 0.5)), -2.45);
      countNote.rotation.set(-0.5, 0, Math.sin(f * 0.5) * 0.15);
      break;
    }
    case 'b11': { // DEFLATION — khaali galle me jhaankta hai; sub1 galla close
      drawChar(rajuCard, 61, RAJU, 'stern', 'hang', 'cheek', f, cp, -0.35, 0, -3.0, 1.0, 0, null, 0, null, true);
      gallaG.visible = true;
      if (gallaLid) gallaLid.rotation.x = -1.9;
      notebookSmall.visible = true;
      notebookSmall.position.set(1.3, 1.09, -2.6); notebookSmall.rotation.set(0, 0.2, 0);
      break;
    }
    case 'b12': { // ₹3,500 CHHOTA — sub0 dher+tag, sub1 tag close; Raju ka haath dher par
      drawChar(rajuCard, 61, RAJU, 'stern', 'reach', 'hang', f, cp, -0.35, 0, -3.0, 1.0, 0, 0.15, 0, mouthFor(f), true);
      gallaG.visible = true;
      if (gallaLid) gallaLid.rotation.x = -1.9;
      smallPileG.visible = true;
      tag3500.visible = true;
      tag3500.rotation.z = 0.1 + Math.sin(f * 0.05) * 0.03;
      break;
    }
    case 'b13': { // SAWAL CLOSEUP — sub0 medium, sub1 tighter push-in
      drawChar(rajuCard, 61, RAJU, 'wonder', 'hang', 'hang', f, cp, -0.35, 0, -3.0, 1.5, 0, null, 0, mouthFor(f), true);
      gallaG.visible = true;
      if (gallaLid) gallaLid.rotation.x = -1.9;
      break;
    }
    case 'b14': { // SUIT AATA HAI — graahak darwaze se (chhote kadam + bob); Raju dekhta hai
      drawChar(rajuCard, 61, RAJU, 'wonder', 'hang', 'hang', f, cp, -1.5, 0, -1.6, 1.0, 0, null, 0, null, true);
      const cx = -1.2 + 0.6 * u, cz = -4.0 + 1.4 * u;
      drawChar(custCard, 67, CUST, 'smile', 'reach', 'hang', f, cp, cx, 0, cz, 1.0, (f * 0.12) % 1, 0.3, 0, null, false);
      suitG.visible = true;
      suitG.position.set(cx + 0.25, 1.15, cz + 0.3);
      suitG.rotation.z = Math.sin(f * 0.08) * 0.04;
      suitGlowLight.intensity = 0.5;
      suitGlowLight.position.set(cx + 0.25, 1.3, cz + 0.3);
      break;
    }
    case 'b15': { // SUIT REVEAL GLOW — sub0 suit haath me, sub1 glow+tag, sub2 Raju smile hold; glow bu se badhta hai
      drawChar(custCard, 67, CUST, 'smile', 'reach', 'hang', f, cp, -0.6, 0, -2.6, 1.0, 0, 0.45, 0, null, false);
      drawChar(rajuCard, 61, RAJU, 'smile', 'reach', 'hang', f, cp, 0.05, 0, -2.6, 0.85, 0, 0.4, 0, mouthFor(f), true);
      suitG.visible = true;
      suitG.position.set(-0.6, 1.5 + 0.05 * Math.sin(f * 0.06), -2.2);
      suitG.rotation.z = 0;
      tag350.visible = true;
      tag350.rotation.z = Math.sin(f * 0.05) * 0.05;
      suitGlowLight.intensity = 1.5 + 2.5 * bu;
      suitGlowLight.position.set(-0.6, 1.6, -2.0);
      glintSuit.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3);
      glintSuit.position.set(-0.6, 1.5, -1.95);
      break;
    }
    case 'b16': { // 20 SUIT KA DHER — beat bhar ek-ek suit badhta hai (n bu se)
      drawChar(rajuCard, 61, RAJU, 'smile', 'reach', 'hang', f, cp, -0.9, 0, -3.3, 1.0, 0, 0.3, 0, mouthFor(f), true);
      const n = 1 + Math.floor(bu * 19);
      pileSuits.forEach((m, i) => { m.visible = i < n; });
      break;
    }
    case 'b17': { // RAJU PROUD MEDIUM — poora dher peeche
      drawChar(rajuCard, 61, RAJU, 'smile', 'hang', 'hip', f, cp, -0.6, 0, -2.6, 1.05, 0, null, 0, mouthFor(f), true);
      pileSuits.forEach((m) => { m.visible = true; });
      break;
    }
    case 'b18': { // MANAGER KI HANSI (loop) — sub0 wide, sub1 manager CU, sub2 Raju calm + manager
      drawChar(mgrCard, 71, MANAGER, 'laugh', 'up', 'belly', f, cp, 2.9, 0, -2.6, 1.25, 0, null, Math.sin(f * 0.25) * 2, mgrMouth(f), 'manager');
      drawChar(rajuCard, 61, RAJU, 'neutral', 'hang', 'hang', f, cp, 1.4, 0, -2.4, 0.85, 0, null, 0, null, true);
      break;
    }
    case 'b19': { // COUNTER ₹2,83,500 + SUIT PAHAAD — counter BEAT progress se: bu=0.75 par full, phir HOLD.
      // FIX run 2 bachaya: clamp(bu/0.75) smoothstep + 500-step (v2 me shot-u tha; v3 me 4 shots hain isliye BEAT-u).
      drawChar(rajuCard, 61, RAJU, 'smile', 'reach', 'hang', f, cp, -0.35, 0, -3.0, 1.0, 0, 0.3, 0, mouthFor(f), true);
      counterBoard.visible = true;
      const cp19 = clamp(bu / 0.75, 0, 1);
      drawCounter(283500 * (cp19 * cp19 * (3 - 2 * cp19)));
      if (sub >= 2) rackG.visible = true; // sub2 (HOLD) se pull-back wide: peeche suit pahaad
      gallaG.visible = true;
      if (gallaLid) gallaLid.rotation.x = -1.9;
      break;
    }
    case 'b20': { // NOTEBOOK (withheld reveal) — page hi hero; sub0 line 1, sub1 line 2 pan, sub2 hold
      notebookPage.visible = true;
      break;
    }
    case 'b21': { // TWO-SHOT KHUD-CHECK — sub0 two-shot, sub1 Raju point, sub2 graahak + suit
      drawChar(rajuCard, 61, RAJU, 'smile', 'point', 'hang', f, cp, -1.5, 0, -1.8, 1.0, 0, null, 0, mouthFor(f), true);
      drawChar(custCard, 67, CUST, 'wonder', 'reach', 'hang', f, cp, 0.2, 0, -2.0, 1.0, 0, 0.2, 0, null, false);
      suitG.visible = true;
      suitG.position.set(0.2, 1.15, -1.75);
      suitG.rotation.z = 0;
      break;
    }
    case 'b22': { // ENDING TRAVELLING → push-in → FREEZE. Hero suit Raju ke BAGAL me (x=-0.55), chehra khula.
      drawChar(rajuCard, 61, RAJU, 'relief', 'up', 'hang', f, cp, -1.2, 0, -1.8, 1.05, 0, null, 0, mouthFor(f), true);
      suitEndG.visible = true;
      suitEndG.position.set(-0.55, 1.25 + 0.4 * bu, -1.7);
      suitEndG.rotation.z = Math.sin(f * 0.04) * 0.03;
      break;
    }
  }
  updateProxiesW();
  renderer.render(scene, camera);
};
window.TOTAL = TOTAL;
window.ready = Promise.resolve();
