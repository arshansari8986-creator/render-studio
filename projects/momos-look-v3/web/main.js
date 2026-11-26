// "Momos Wala" — WORLD V3 LOOK SAMPLE (3 shots, 165f). Same shots/cameras/positions as FULL v4.
// WORLD V3 (26 Nov 2026): hero boards + counter + clock + phone LIT (Lambert, not Basic);
// wood/plaster/road get procedural textures; thela/props/trees cast real shadows (4096 map);
// warmer + lower evening sun, tighter fog (depth). Characters (toon cards) UNCHANGED.
// "Momos Wala" — FULL VIDEO v2 REAL (49.19 s, 1476 frames @30fps, 61 shots, avg ~0.81 s/shot).
// RE-ANCHORED 26 Nov 2026: Momos_Voice_Final.wav ke real word-timings se (5 shots added: s06b/s25b/s29b/s30b/s34b).
// DO SET: 'gali' (momos thela wali gali, shaam) | 'office' (din) | 'hotel' (5-star, raat).
// ENV: evening (b01-b06, b08-b10) | morning (b07 subah 7 baje) | day (b08 office) | night (b11-b14 hotel).
// Palette: muted natural — dhool-mitti sadak, halki cream deewaar, shaam narangi aasmaan.
// Tez saturated rang SIRF hero cheezon par (Sonu apron terracotta, chutney dabbe laal/hari, galla gold "₹90,000", menu board, chef safed coat, bhaap safed).
// NO captions, NO music. Numbers objects bankar: menu "VEG ₹50", tag "₹30 BACHAT", phone "60 PLATE",
//   galla counter "₹90,000" (gin kar badhta hai + HOLD), hotel board "SONU'S MOMOS".
// MUNH = bhaav ka instrument, bolne ka nahi — NO phoneme lip-sync, envelope.js import NAHI.
// Munh sirf 4 states: band (dash) / "O" shock / khula-hansi / seedhi line — beat par khole (line shuru → khula hold ~0.5s → pause par band).
// Narration 100% voiceover — narration par munh band + expression badle.
// NO walk cycle — chalna = chhote kadam + halka bob; action = haath+sar+chehra.
// WITHHELD: chef b11 se pehle KABHI visible nahi (phone/peon only); reveal s42 me peeche se turn.
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
sun.shadow.mapSize.set(4096, 4096); // WORLD V3: crisper long evening shadows
sun.shadow.camera.left = -20; sun.shadow.camera.right = 20;
sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -20;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 95;
sun.shadow.bias = -0.0022; sun.shadow.normalBias = 0.02;
const bounce = new THREE.DirectionalLight(0xd6e6ff, 0.3);
bounce.position.set(6, 8, 14); bounce.castShadow = false;
scene.add(bounce); scene.add(bounce.target);
// thela lamp ki garam roshni (shaam me ON — applyEnv me)
const lampLight = new THREE.PointLight(0xffc27a, 0, 8, 1.6);
lampLight.position.set(-0.2, 2.4, -3.9); scene.add(lampLight);
// hotel jhoomar ki garam roshni (sirf hotel set me ON)
const chandLight = new THREE.PointLight(0xffd98a, 0, 9, 1.5);
chandLight.position.set(0, 3.2, -2.0); scene.add(chandLight);
// office thandi roshni (sirf office set me ON)
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

// V2 deewaar texture — garam cream + soft patches, baarish ke daag, dararein, neeche grime, upar halki teal patti.
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
// ---- Sonu ke signature props — card canvas par draw: chhota side tuft (baal) + kandhe ka gamchha kinara ----
// (Gamchha ka diagonal sash outfit ke toga se aata hai; yahan sirf tuft + towel ka latakta sira.)
// FIX 26 Nov (s41 seekh): tuft sar ke tilt (headRot — wahi rotation jo romanFront sar ko deta hai) ke saath ghume — static tuft bow karne par sir se alag dikhta tha.
function drawSonuProps(p, seed, headRot = null) {
  const Hb = T.headBlob(seed, 118, 0), hc = T.headCenter(seed);
  const cx = 300, chin = hc + Hb.b;
  // side tuft — maathe ke upar chhoti khadi lat (kaale baal); sar ke saath rotate kare
  p.rot = headRot;
  p.stroke([[cx + 18, hc - Hb.b * 0.95], [cx + 34, hc - Hb.b * 1.28]], 10, '#1e1a20');
  p.stroke([[cx + 30, hc - Hb.b * 0.95], [cx + 52, hc - Hb.b * 1.18]], 8, '#1e1a20');
  p.rot = null;
  // gamchha ka latakta sira — BODY se juda hai (chin ke neeche), sar ke tilt se NAHI ghumta
  const HH = 2 * Hb.b, bandY = chin + 0.22 * HH;
  p.poly([[cx - 96, bandY - 6], [cx - 72, bandY - 6], [cx - 72, bandY + 0.55 * HH], [cx - 96, bandY + 0.55 * HH]], '#f8fafc', 2);
  p.stroke([[cx - 90, bandY + 0.1 * HH], [cx - 78, bandY + 0.1 * HH]], 2, '#c2410c');
  p.stroke([[cx - 90, bandY + 0.3 * HH], [cx - 78, bandY + 0.3 * HH]], 2, '#c2410c');
}
// ---- Chef ka toque (uncha safed topi) + moonchh ke upar safed coat collar ----
// Card canvas par sar ke upar draw — reveal shot me pehchan (toque + coat).
// FIX 26 Nov (s41 seekh): toque sar ke tilt (headRot — wahi rotation jo romanFront sar ko deta hai, chin-pivot + body-tilt shift)
// ke saath ghume. Static toque bow karne par sir se alag hawa me tairta dikhta tha (sample v2 f353/f360).
function drawChefProps(p, seed, headRot = null) {
  const Hb = T.headBlob(seed, 118, 0), hc = T.headCenter(seed);
  const cx = 300, top = hc - Hb.b;
  p.rot = headRot;
  // toque — uncha, pleated (safed + halki chhaon wali vertical dhariyan)
  p.poly([[cx - 62, top + 6], [cx + 62, top + 6], [cx + 58, top - 62], [cx - 58, top - 62]], '#f8fafc', 3);
  p.ell(cx, top - 62, 58, 26, '#ffffff', 3);
  for (const dx of [-36, -12, 12, 36]) p.stroke([[cx + dx, top - 58], [cx + dx, top - 2]], 3, '#d6dde3');
  // toque ki band (neeche patti)
  p.poly([[cx - 64, top + 6], [cx + 64, top + 6], [cx + 64, top + 22], [cx - 64, top + 22]], '#e8e0cc', 2);
  p.rot = null;
}
// mouth: beat-level string ('o' | 'O' | 'smirk' | 'smile' | null) — ENV se KABHI nahi.
function drawChar(card, seed, outfit, expr, R, L, f, camPos, x, y, z, s = 1.03, step = 0, lift = null, tilt = 0, mouth = null, props = false) {
  const idl = idle(f, seed), blink = blinkAt(f, seed);
  const liftQ = lift === null ? '' : q(lift, 1);
  const tiltBody = Math.round(idl.tilt + tilt * 3);
  const tiltHead = Math.round(idle(f, seed + 2).headTilt + tilt * 6);
  const key = `${seed}|${expr}|${R}|${L}|${blink}|${q(idl.bob, 2)}|${tiltBody}|${q(step, 2)}|${liftQ}|${mouth || ''}`;
  // FIX 26 Nov (s41 seekh): sar ke props (toque/tuft) ko WAHI rotation do jo romanFront sar ko deta hai —
  // angle Ah = tiltBody + tiltHead, pivot (300, chin), plus body-tilt se pivot-shift (dx, dy).
  // Static props bow karne par sir se alag tairte the (sample v2 f353/f360).
  let headRot = null;
  const Ah = tiltBody + tiltHead;
  if (Ah) {
    const Hb0 = T.headBlob(seed, 118, 0);
    const chinR = T.headCenter(seed) + Hb0.b - 0.08 * Hb0.b; // romanFront chin ≈ props chin - 0.04*HH (bob ±1.5 ignored)
    const lever = ((outfit.stout ? 1.12 : 1.08) - 0.12) * 2 * Hb0.b; // hipY - chin
    const rB = (tiltBody * Math.PI) / 180;
    headRot = [(Ah * Math.PI) / 180, 300, chinR, lever * Math.sin(rB), lever * (1 - Math.cos(rB))];
  }
  card.draw(key, (p) => {
    T.romanFront(p, outfit, {
      seed, expr, R, L, blink, bob: q(idl.bob, 2), tilt: tiltBody,
      headTilt: tiltHead, wv: f * 0.18, step, lift: lift === null ? 0 : lift, mouth,
    });
    if (props === 'chef') drawChefProps(p, seed, headRot);
    else if (props === 'sonu') drawSonuProps(p, seed, headRot);
  });
  card.place(x, y, z, camPos, s);
}
const sonuCard = new Card(), chefCard = new Card(), peonCard = new Card();
const custAuntyCard = new Card(), custManCard = new Card(), custKidCard = new Card();
const off1Card = new Card(), off2Card = new Card();
const ALL_CARDS = [sonuCard, chefCard, peonCard, custAuntyCard, custManCard, custKidCard, off1Card, off2Card];
// FRESH character — SONU (~25, NO moochh, side tuft): terracotta apron + cream kurta + safed gamchha (toga sash).
// Skin warm #b0703a (Press Raju #c88848 se gehra — alag lage).
const SONU = { tunic: '#c2410c', shirt: '#f5e9d0', skin: '#b0703a', hair: '#1e1a20', hairStyle: 'side', apron: '#c2410c', toga: '#f8fafc', togaPrint: true };
// CHEF (~50, lamba, WITHHELD b11 tak): safed coat + toque (card prop) + moonchh. Skin #a06a3c.
const CHEF = { tunic: '#f8fafc', shirt: '#fef3c7', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick', moustache: '#241a14', stout: true };
// PEON (office boy): halki neeli shirt, dark trouser (legCol mix se).
const PEON = { tunic: '#7aa3c2', shirt: '#f8fafc', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick' };
// CUSTOMERS (background bheed): aunty gulabi dress, office man hara kurta, kid.
const CUST_AUNTY = { tunic: '#c25a7a', shirt: '#fef3c7', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick', dress: '#c25a7a' };
const CUST_MAN = { tunic: '#5d7a4a', shirt: '#fef3c7', skin: '#9a6a42', hair: '#2b211c', hairStyle: 'thick' };
const CUST_KID = { tunic: '#d97706', shirt: '#fef3c7', skin: '#b0703a', hair: '#1e1a20', hairStyle: 'thick' };
// OFFICE WALE (b08, desk par khush): 2 men.
const OFF1 = { tunic: '#3f6a6f', shirt: '#f8fafc', skin: '#9a6a42', hair: '#14100c', hairStyle: 'thick' };
const OFF2 = { tunic: '#8a5d3b', shirt: '#fef3c7', skin: '#a06a3c', hair: '#2b211c', hairStyle: 'thick', moustache: '#241a14' };

// ---- MUNH, beat-level (frame numbers; line shuru → khula hold ~0.5s → pause par band) ----
// Narration 100% voiceover — narration ke beech munh band + expression badle.
// b02 (hansi) aur b11 (shock 'O') me munh expr se aata hai — mouthFor wahan null deta hai.
function mouthFor(f) {
  // WORLD V3 SAMPLE — munh timing v4 ke 3 shots se map ki (acting same, look-only compare):
  // w1 (b04, f0-60): full s16 me munh band tha poora shot; w2 (b03, f60-105): full s12
  // me pehle 12f 'o' phir band; w3 (b09, f105-165): full s35 me band poora shot.
  if (f < 60) return null;                    // w1 b04 — munh band (full s16 jaisa)
  if (f < 105) { if (f < 72) return 'o'; return null; } // w2 b03 — pehle 12f 'o' (full s12 jaisa)
  return null;                                // w3 b09 — munh band (full s35 jaisa)
}

// =====================================================================
// ENVS — shaam (gali) / subah (b07) / din (office) / raat (hotel)
// =====================================================================
const ENVS = {
  // Shaam: neeche garam suraj (lambi chhaon) + thanda bounce; lamp ON.
  evening: { bg: 0xe8b078, fogC: 0xe8c098, fogNear: 8, fogFar: 38, hemi: 1.0, hemiC: 0xffe0b8, hemiG: 0x8a6a4a, sun: 1.6, sunC: 0xff8a3d, sunPos: [-11, 2.6, 4], bounce: 0.35, bounceC: 0xffd9a0, expo: 1.12, sky: 'evening', lamp: 4.5, sunDisc: [-16, 4, -27], sunDiscC: 0xffb060, sunDiscR: 2.0, winC: 0xffd9a0, litWinC: 0xffd98a }, // WORLD V3: warmer+lower sun (long shadows), tighter fog (depth), stronger lamp pool
  // Subah (b07, 7 baje): halki garam subah, lamp OFF, bhaap saaf dikhe.
  morning: { bg: 0xd8e8ee, fogC: 0xd8e4e0, fogNear: 10, fogFar: 46, hemi: 1.05, hemiC: 0xffe8c8, hemiG: 0x8a7a5a, sun: 1.7, sunC: 0xffd9a0, sunPos: [-10, 4.5, 6], bounce: 0.4, bounceC: 0x9db8d9, expo: 1.12, sky: 'morning', lamp: 0, sunDisc: [-16, 7, -27], sunDiscC: 0xfff3c8, sunDiscR: 1.6, winC: 0x9db8c4, litWinC: 0x7a8a80 },
  // Din (office interior): thanda ujala, khidki se sheher.
  day: { bg: 0xc8dcec, fogC: 0xd0dde6, fogNear: 12, fogFar: 48, hemi: 1.0, hemiC: 0xffe8c8, hemiG: 0x8a7a5a, sun: 1.6, sunC: 0xfff0c8, sunPos: [-9, 6, 5], bounce: 0.35, bounceC: 0x9db8d9, expo: 1.13, sky: 'day', lamp: 0, sunDisc: [-16, 9, -27], sunDiscC: 0xfff3c8, sunDiscR: 1.4, winC: 0x9db8c4, litWinC: 0x7a8a80 },
  // Raat (hotel): gehra neela + garam lamp/jhoomar; khidkiyan jalti hain.
  night: { bg: 0x2a3550, fogC: 0x3a4666, fogNear: 10, fogFar: 44, hemi: 0.7, hemiC: 0x9db8d9, hemiG: 0x3a2f28, sun: 0.5, sunC: 0x9db8d9, sunPos: [-8, 8, 4], bounce: 0.2, bounceC: 0xffd9a0, expo: 1.05, sky: 'night', lamp: 5, sunDisc: [-16, 6, -27], sunDiscC: 0xfff3c8, sunDiscR: 1.2, winC: 0xffd98a, litWinC: 0xffd98a },
};
const winGlassMat = lam({ color: 0x9db8c4, fog: false }); // WORLD V3: glass catches warm light
const litWinMat = lam({ color: 0x7a8a80, fog: false }); // WORLD V3
const lampBulbMat = bas({ color: 0xfff7cc, fog: false });
const lampGlow = mkGlint(-0.2, 2.42, -3.95, 1.1);
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
  lampGlow.material.opacity = (e.lamp || 0) > 0 ? 0.7 : 0; // WORLD V3
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
// ---------- DISTANT SKYLINE (background depth): hazy buildings peeche, har shot me ----------
const skylineG = new THREE.Group(); scene.add(skylineG);
{
  const skyCols = [0xb8a888, 0xa89a80, 0x9a8f7a, 0xc4b49a, 0x8a7f6e];
  const skySpots = [[-22.5, 7], [-17.5, 9], [-12.5, 6], [-7.5, 8], [-2.5, 10], [2.5, 7], [7.5, 9], [12.5, 6], [17.5, 8], [22.5, 7]];
  skySpots.forEach(([sx, sh], i) => {
    const b = box(5.5, sh, 1.2, lam({ map: tex(plaster(71, 36), 1, 2), color: skyCols[i % skyCols.length] }));
    b.position.set(sx, sh / 2, -19); skylineG.add(b);
    for (let r = 0; r < Math.floor(sh / 1.6); r++) for (let cix = 0; cix < 3; cix++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.6), litWinMat);
      win.position.set(sx - 1.2 + cix * 1.2, 1.2 + r * 1.6, -18.35); skylineG.add(win);
    }
  });
  const silCols = [0x8a6f7a, 0x7a5f6e, 0x9a7f72, 0x6e5a6a];
  [[-24, 11], [-15, 8.5], [-6, 12], [3, 9], [12, 11.5], [21, 9.5]].forEach(([sx, sh], i) => {
    const b = box(6.5, sh, 1.0, lam({ color: silCols[i % silCols.length] }));
    b.position.set(sx, sh / 2, -27); skylineG.add(b);
  });
}
// L2 beech: makaan row z=-8 — tank + antenna + khidki (shaam/raat me jalti hain) — World V2
const midG = new THREE.Group(); scene.add(midG);
{
  [[-7.5, 4.0, 0xb8a888], [0.5, 3.6, 0xc4b49a], [7.0, 4.6, 0xa8a49a]].forEach(([mx, mh, mcol]) => {
    const m = box(3.2, mh, 0.5, lam({ map: tex(plaster(74, 38), 1, 1), color: mcol })); m.position.set(mx, mh / 2, -8); midG.add(m);
    const mw = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.7), litWinMat);
    mw.position.set(mx + 0.7, 2.0, -7.72); midG.add(mw);
    const mw2 = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.7), litWinMat);
    mw2.position.set(mx - 0.7, 1.3, -7.72); midG.add(mw2);
    const par = box(3.3, 0.18, 0.55, lam({ color: 0x8a7a5a })); par.position.set(mx, mh + 0.09, -8); midG.add(par);
  });
  // FIX 26 Nov LAYOUT LOCK (D): pehle kaala gumbad (tank + hemisphere dome, 0x374151/0x4b5563) har chhat par
  // random kaala blob lagta tha. Ab SAHI water tank: halka slate-blue body + safed band + chapta dhakkan + knob
  // + deewaar ke saamne down-pipe (tank zameen se juda dikhe, hawa me nahi).
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
// SETS — GALI (thela) | OFFICE (din) | HOTEL (raat)
// =====================================================================
const galiG = new THREE.Group(); scene.add(galiG);
const officeG = new THREE.Group(); scene.add(officeG);
const hotelG = new THREE.Group(); scene.add(hotelG);
let motes = [];
let galiTrees = [], officeTrees = [], hotelTrees = [];
const swayCloths = [];

// ---- shared board textures ----
// "SONU MOMOS" sign — thele ke upar (terracotta + cream, HERO sign, frame 1 se)
const sonuSignTex = textBoard(1024, 170, (g, w, h) => {
  g.fillStyle = '#7f1d1d'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fef3c7'; g.font = 'bold 88px "Arial Narrow", Arial'; g.textAlign = 'center';
  g.fillText('SONU MOMOS', w / 2, 112);
});
// Menu board — thele par: VEG ₹50 / PANEER ₹70 / CHUTNEY FREE
const menuTex = textBoard(512, 384, (g, w, h) => {
  g.fillStyle = '#134e4a'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#facc15'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
  g.textAlign = 'center';
  g.fillStyle = '#fde047'; g.font = 'bold 64px Arial'; g.fillText('VEG  ₹50', w / 2, 110);
  g.fillStyle = '#f8fafc'; g.font = 'bold 56px Arial'; g.fillText('PANEER  ₹70', w / 2, 200);
  g.fillStyle = '#86efac'; g.font = 'bold 56px Arial'; g.fillText('CHUTNEY FREE', w / 2, 290);
});
// "SONU'S MOMOS" hotel menu board — marble + gold (b13-b14, ending freeze)
const hotelMenuTex = textBoard(768, 384, (g, w, h) => {
  g.fillStyle = '#1e293b'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#facc15'; g.lineWidth = 10; g.strokeRect(12, 12, w - 24, h - 24);
  g.textAlign = 'center'; g.fillStyle = '#facc15';
  g.font = 'bold 72px Arial'; g.fillText("SONU'S MOMOS", w / 2, 130);
  g.fillStyle = '#f8fafc'; g.font = 'bold 52px Arial'; g.fillText('★ 5-STAR MENU ★', w / 2, 220);
  g.fillStyle = '#fde047'; g.font = 'bold 60px Arial'; g.fillText('VEG  ₹50', w / 2, 310);
});
// "KIRANA" sign — gali ke paar wali dukaan par (muted, background)
const kiranaTex = textBoard(768, 200, (g, w, h) => {
  g.fillStyle = '#e2e8f0'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#475569'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16);
  g.textAlign = 'center'; g.fillStyle = '#475569';
  g.font = 'bold 100px Arial'; g.fillText('KIRANA', w / 2, 118);
  g.fillStyle = '#334155'; g.font = 'bold 40px Arial'; g.fillText('STORE • CHAI', w / 2, 172);
});
// Wall clock face — ghadi (recurring prop; hands alag meshes, beat par set hote hain)
const clockTex = textBoard(256, 256, (g, w, h) => {
  g.fillStyle = '#fef9ec'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
  g.strokeStyle = '#1e293b'; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.stroke();
  g.fillStyle = '#1e293b'; g.textAlign = 'center'; g.font = 'bold 40px Arial';
  g.fillText('12', 128, 52); g.fillText('6', 128, 224); g.fillText('3', 210, 142); g.fillText('9', 46, 142);
});

// ---------- GALI: dhool sadak, momos thela, paar KIRANA, ped, taar ----------
{
  const S = galiG;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 34), lam({ map: tex(dirt(17), 10, 10), color: 0xa89878 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, 3); ground.receiveShadow = true; S.add(ground);
  // ---- ZAMEEN V2: 14 layered patches + geele daag + 20 kankar ----
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
      peb.position.set(px, -0.005, pz); peb.rotation.y = rnd() * 3; S.add(peb); // FIX 26 Nov LAYOUT LOCK (B): pehle y=0.02 — zameen (y=-0.02) se 0.025 upar tairta dikhta tha (t14 cube); ab zameen me dhansa hua.
    }
  }
  const road = new THREE.Mesh(new THREE.PlaneGeometry(40, 3.4), lam({ map: tex(wetConcrete(61), 6, 1), color: 0xbfb8a8 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, 1.8); S.add(road);
  for (let i = 0; i < 8; i++) {
    const dash = box(1.1, 0.012, 0.14, lam({ color: 0xe2e8f0 })); // WORLD V3
    dash.position.set(-14 + i * 4, 0.008, 1.8); S.add(dash);
  }
  [1.15, 2.45].forEach((tz) => {
    const tr = new THREE.Mesh(new THREE.PlaneGeometry(40, 0.35), new THREE.MeshBasicMaterial({ color: 0x2e2a26, transparent: true, opacity: 0.55, depthWrite: false }));
    tr.rotation.x = -Math.PI / 2; tr.position.set(0, 0.004, tz); S.add(tr);
  });
  // peeche ki deewaar (thele ke peeche, neechi — upar aasmaan + skyline dikhe)
  const dwall = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 3.2), lam({ map: wallV2Tex(), color: 0xffffff }));
  dwall.position.set(-1.5, 1.6, -4.3); dwall.receiveShadow = true; S.add(dwall);
  for (const px of [-4.6, 1.6]) {
    const pil = box(0.28, 3.2, 0.28, lam({ color: 0xd8c49a })); pil.position.set(px, 1.6, -4.15); S.add(pil);
  }
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), winGlassMat); win.position.set(0.3, 1.9, -4.22); S.add(win);
  const winBar = box(0.06, 1.0, 0.12, lam({ color: 0x2f4a4a })); winBar.position.set(0.3, 1.9, -4.2); S.add(winBar);
  const winBar2 = box(1.0, 0.06, 0.12, lam({ color: 0x2f4a4a })); winBar2.position.set(0.3, 1.9, -4.2); S.add(winBar2);
  // ---- POSTERS (deewaar khaali nahi) ----
  const chaiTex = textBoard(256, 320, (g, w, h) => {
    g.fillStyle = '#fef3c7'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#dc2626'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
    g.textAlign = 'center'; g.fillStyle = '#dc2626';
    g.font = 'bold 72px Arial'; g.fillText('CHAI', w / 2, 100);
    g.fillStyle = '#1e293b'; g.font = 'bold 88px Arial'; g.fillText('₹5', w / 2, 210);
    g.fillStyle = '#92400e'; g.fillRect(w / 2 - 40, 240, 80, 44);
    g.fillStyle = '#f8fafc'; g.fillRect(w / 2 - 40, 240, 80, 10);
  });
  const chaiPoster = boardMesh(0.55, 0.7, chaiTex); chaiPoster.position.set(1.15, 1.6, -4.24); S.add(chaiPoster); // FIX 26 Nov FIX ROUND 4: x 1.4 -> 1.15 — khamba (pillar x=1.6) poster ka 'AI' + '₹5' dhak raha tha (f417/f745, 25% cover, 3D ray se verify); poster ab khambhe se saaf (right edge 1.425 < pillar 1.46) + khidki se saaf (left edge 0.875 > window 0.8). s01 aerial me chhat-fascia 8% corner (f0, clear hota hai f12 tak) — acceptable, poster chhota hai.
  const momosPosterTex = textBoard(256, 320, (g, w, h) => {
    g.fillStyle = '#7f1d1d'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#facc15'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16);
    g.textAlign = 'center'; g.fillStyle = '#fde047';
    g.font = 'bold 52px Arial'; g.fillText('MOMOS', w / 2, 96);
    g.fillStyle = '#f8fafc'; g.font = 'bold 80px Arial'; g.fillText('₹50', w / 2, 200);
    g.font = 'bold 30px Arial'; g.fillText('GARAM-GARAM', w / 2, 260);
  });
  const momosPoster = boardMesh(0.6, 0.75, momosPosterTex); momosPoster.position.set(-4.0, 1.5, -4.24); S.add(momosPoster);
  // KIRANA dukaan — gali ke paar, muted (background depth)
  const kir = box(3.4, 3.6, 1.2, lam({ map: tex(plaster(73, 210), 1, 1), color: 0xcfd8dc })); kir.position.set(4.6, 1.8, -4.6); S.add(kir);
  const kirBase = box(3.6, 0.3, 1.4, lam({ color: 0x94a3b8 })); kirBase.position.set(4.6, 0.15, -4.6); S.add(kirBase);
  for (let r = 0; r < 2; r++) for (let cix = 0; cix < 2; cix++) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.9), lam({ color: r === 1 ? 0xd8c49a : 0x9db8c4 }));
    w.position.set(3.9 + cix * 1.4, 1.4 + r * 1.2, -3.98); S.add(w);
  }
  const kirDoor = box(1.0, 1.9, 0.1, lam({ color: 0x475569 })); kirDoor.position.set(4.6, 0.95, -3.98); S.add(kirDoor);
  const kirSign = boardMesh(1.9, 0.5, kiranaTex); kirSign.position.set(4.6, 3.15, -3.95); S.add(kirSign);
  const sack2 = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), lam({ color: 0xd6c9a8 }));
  sack2.scale.set(1, 0.8, 0.9); sack2.position.set(3.4, 0.22, -3.9); S.add(sack2);
  const kbox = box(0.4, 0.35, 0.4, lam({ color: 0x8a6844 })); kbox.position.set(5.9, 0.17, -3.9); S.add(kbox);
  // peeche ki kataar (midground) — duniya gehri lage
  [[-7.5, 4.0, 0xb8a888], [7.0, 4.6, 0xa8a49a], [0.5, 3.6, 0xc4b49a]].forEach(([mx, mh, mcol]) => {
    const m = box(3.2, mh, 0.5, lam({ map: tex(plaster(72, 38), 1, 1), color: mcol })); m.position.set(mx, mh / 2, -7); S.add(m);
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
  [-6.5, 6.5].forEach((px) => {
    const arm = box(0.9, 0.05, 0.05, lam({ color: 0x39434c })); arm.position.set(px, 3.9, -3.6); S.add(arm);
  });
  [[3.9, -3.5], [3.55, -3.9], [3.2, -3.2]].forEach(([wy, wz]) => {
    S.add(bar2D(-6.5, wy, 0, wy - 0.35, wz, wireMat, 0.015));
    S.add(bar2D(0, wy - 0.35, 6.5, wy, wz, wireMat, 0.015));
  });
  // ---- THELA (momos cart) — lakdi, pahiye, chhat, steamer, sign, menu ----
  const thela = new THREE.Group(); thela.position.set(-1.2, 0, -2.8); thela.rotation.y = 0.12; S.add(thela);
  {
    const bed = box(1.8, 0.1, 1.0, lam({ map: tex(planks(41), 2, 1) })); bed.position.y = 0.55; thela.add(bed);
    [-0.48, 0.48].forEach((rz) => {
      const rail = box(1.8, 0.12, 0.04, lam({ color: 0x6d3d1a })); rail.position.set(0, 0.64, rz); thela.add(rail);
    });
    [-0.52, 0.52].forEach((rz) => {
      const wh = cyl(0.32, 0.32, 0.06, lam({ color: 0x1f2937 }), 16); wh.rotation.x = Math.PI / 2; wh.position.set(0, 0.32, rz); thela.add(wh);
      const hub = cyl(0.08, 0.08, 0.08, lam({ color: 0x9ca3af }), 10); hub.rotation.x = Math.PI / 2; hub.position.set(0, 0.32, rz); thela.add(hub);
    });
    thela.add(bar2D(-0.9, 0.55, -1.5, 0.12, 0.35, lam({ color: 0x6d3d1a }), 0.03));
    thela.add(bar2D(-0.9, 0.55, -1.5, 0.12, -0.35, lam({ color: 0x6d3d1a }), 0.03));
    // chhat — 4 khambe + tin chhat
    [[-0.85, -0.45], [0.85, -0.45], [-0.85, 0.45], [0.85, 0.45]].forEach(([px, pz]) => {
      const pole = cyl(0.03, 0.03, 1.5, lam({ color: 0x6d3d1a }), 8); pole.position.set(px, 1.35, pz); thela.add(pole);
    });
    const roof = box(2.0, 0.06, 1.2, lam({ map: tex(tinRoof(53), 2, 1), color: 0x9a3412 })); roof.position.set(0, 2.10, 0); thela.add(roof); // FIX 26 Nov LAYOUT LOCK (B): pehle rotation.z=0.06 + y=2.12 — chhat tedhi tairti thi, ek taraf khambhe se upar (t2); ab seedhi, khambhon par baithi (pole top 2.10, roof bottom 2.07).
    // 3-tier steamer — steel cylinders, upar se bhaap
    for (let i = 0; i < 3; i++) {
      const tier = cyl(0.28, 0.28, 0.16, lam({ color: 0x9aa5ad }), 16); tier.position.set(-0.45, 0.68 + i * 0.17, 0); thela.add(tier);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.015, 8, 20), lam({ color: 0x6b7280 }));
      rim.rotation.x = Math.PI / 2; rim.position.set(-0.45, 0.76 + i * 0.17, 0); thela.add(rim);
    }
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: 0x7a8288 }));
    lid.position.set(-0.45, 1.10, 0); thela.add(lid); // FIX 26 Nov LAYOUT LOCK (B): pehle y=1.19 — upar wale tier ke rim (1.10) se 0.09 upar hawa me tairta tha (t22); ab rim par baitha.
    // sign — chhat ke neeche, saamne (frame 1 se readable)
    const sign = boardMesh(1.7, 0.35, sonuSignTex); sign.position.set(0, 1.92, 0.62); thela.add(sign);
    // menu board — thele ke saamne (VEG ₹50)
    const menu = boardMesh(0.85, 0.64, menuTex); menu.position.set(0.45, 0.95, 0.52); menu.rotation.x = -0.08; thela.add(menu);
    // plate ke dher (counter par) + chutney dabbe (laal + hari)
    for (let i = 0; i < 3; i++) {
      const pl = cyl(0.16, 0.16, 0.03, lam({ color: i % 2 ? 0xf8fafc : 0xdbeafe }), 14);
      pl.position.set(0.55, 0.62 + i * 0.035, -0.25); thela.add(pl);
    }
    const chRed = cyl(0.09, 0.08, 0.16, lam({ color: 0xdc2626 }), 12); chRed.position.set(0.15, 0.68, 0.28); thela.add(chRed);
    const chGrn = cyl(0.09, 0.08, 0.16, lam({ color: 0x16a34a }), 12); chGrn.position.set(0.38, 0.68, 0.28); thela.add(chGrn);
    const chLidR = cyl(0.095, 0.095, 0.02, lam({ color: 0x991b1b }), 12); chLidR.position.set(0.15, 0.77, 0.28); thela.add(chLidR);
    const chLidG = cyl(0.095, 0.095, 0.02, lam({ color: 0x14532d }), 12); chLidG.position.set(0.38, 0.77, 0.28); thela.add(chLidG);
    // steamer basket (Sonu ke haath ke paas) + momos ki plate
    const basket = cyl(0.2, 0.16, 0.12, lam({ color: 0x8a6844 }), 12); basket.position.set(0.55, 0.66, 0.25); thela.add(basket);
    for (let i = 0; i < 4; i++) {
      const mo = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), lam({ color: 0xf8f0dc }));
      mo.position.set(0.48 + (i % 2) * 0.12, 0.74, 0.2 + Math.floor(i / 2) * 0.1); thela.add(mo);
    }
  }
  // ---- GAS CYLINDER + CRATES + CYCLE + LAMP + STOOL ----
  {
    const gas = cyl(0.22, 0.22, 0.65, lam({ color: 0xdc2626 }), 14); gas.position.set(1.6, 0.30, -3.6); S.add(gas); // FIX 26 Nov LAYOUT LOCK (B): sab zameen wale props 0.02 neeche — base zameen (y=-0.02) ko chhooye (pehle 0.015-0.02 tairte the)
    const gasTop = cyl(0.08, 0.08, 0.1, lam({ color: 0x9ca3af }), 10); gasTop.position.set(1.6, 0.68, -3.6); S.add(gasTop);
    const hose = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 8, 16, Math.PI), lam({ color: 0x1f2937 }));
    hose.position.set(1.35, 0.5, -3.4); hose.rotation.y = Math.PI / 2; S.add(hose);
    const c1 = box(0.55, 0.45, 0.55, lam({ map: tex(planks(46), 1, 1) })); c1.position.set(-4.3, 0.20, -2.2); S.add(c1);
    const c1e = box(0.57, 0.06, 0.57, lam({ color: 0x6d5136 })); c1e.position.set(-4.3, 0.43, -2.2); S.add(c1e);
    const c2 = box(0.45, 0.4, 0.45, lam({ map: tex(planks(47), 1, 1) })); c2.position.set(-4.28, 0.65, -2.2); c2.rotation.y = 0.3; S.add(c2);
    const sack = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), lam({ color: 0xc2b280 }));
    sack.scale.set(1, 0.75, 0.9); sack.position.set(-3.6, 0.20, -2.3); S.add(sack);
    const cy = new THREE.Group(); cy.position.set(1.7, -0.02, -3.85); cy.rotation.y = -0.35; cy.rotation.z = 0.1; S.add(cy);
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
    // lamp (deewaar par, shaam ON)
    const bracket = box(0.06, 0.06, 0.25, lam({ color: 0x1f2937 })); bracket.position.set(-0.2, 2.62, -4.05); S.add(bracket);
    const shade = cyl(0.08, 0.22, 0.18, lam({ color: 0x166534 }), 12); shade.position.set(-0.2, 2.52, -3.95); S.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), lampBulbMat); bulb.position.set(-0.2, 2.42, -3.95); S.add(bulb);
    // stool + folded stack (thele ke paas)
    const stool = cyl(0.28, 0.32, 0.42, lam({ color: 0x6d4a2c }), 12); stool.position.set(0.9, 0.19, -3.55); S.add(stool);
    const sf1 = box(0.4, 0.08, 0.3, lam({ color: 0xfca5a5 })); sf1.position.set(0.9, 0.44, -3.55); sf1.rotation.y = 0.1; S.add(sf1);
    const sf2 = box(0.38, 0.08, 0.28, lam({ color: 0x86efac })); sf2.position.set(0.9, 0.51, -3.55); sf2.rotation.y = -0.15; S.add(sf2);
    // gamle wala paudha
    const pp = cyl(0.18, 0.14, 0.3, lam({ color: 0x9a5a34 }), 12); pp.position.set(1.3, 0.13, -3.8); S.add(pp);
    [[0, 0.45, 0, 0.16], [-0.1, 0.38, 0.08, 0.12], [0.1, 0.4, -0.06, 0.13]].forEach(([px, py, pz, r]) => {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), lam({ color: 0x4a6b2f }));
      leaf.position.set(1.3 + px, py, -3.8 + pz); S.add(leaf);
    });
  }
  // dhoop me tairte dust motes (World V2 — roshni dikhti hai)
  for (let i = 0; i < 8; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffe9b0 }));
    sp.position.set(-3 + (i * 0.9) % 4.5, 1.2 + (i % 3) * 0.7, -3 + (i % 2) * 1.2);
    sp.scale.setScalar(0.12 + (i % 3) * 0.05);
    scene.add(sp); motes.push(sp);
  }
}

// ---------- OFFICE: desk, phone, plate stacks, files, wall clock, khidki se sheher ----------
{
  const S = officeG;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 34), lam({ map: tex(tiles(52), 8, 8), color: 0xb8b0a0 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.02, 3); S.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 3.0), lam({ map: tex(plaster(43, 40), 2, 1), color: 0xd8e0e4 }));
  wall.position.set(0, 1.5, -3.8); S.add(wall);
  // khidki se sheher (right) — neela aasmaan + building silhouettes
  const winBg = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.6), lam({ color: 0x9db8d9 }));
  winBg.position.set(2.2, 1.9, -3.72); S.add(winBg);
  [[1.6, 0.9], [2.2, 1.3], [2.8, 0.7]].forEach(([bx, bh]) => {
    const b = box(0.5, bh, 0.05, lam({ color: 0x7a8a9a })); b.position.set(bx, 1.1 + bh / 2 - 0.3, -3.7); S.add(b);
  });
  const winFrameV = box(0.06, 1.6, 0.05, lam({ color: 0x475569 })); winFrameV.position.set(2.2, 1.9, -3.68); S.add(winFrameV);
  const winFrameH = box(2.2, 0.06, 0.05, lam({ color: 0x475569 })); winFrameH.position.set(2.2, 1.9, -3.68); S.add(winFrameH);
  // wall clock (ghadi — recurring prop)
  const clock = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.55), lam({ map: clockTex }));
  clock.position.set(0, 2.3, -3.72); S.add(clock);
  // desk + 2 chairs
  const desk = box(3.2, 0.08, 1.2, lam({ color: 0x6d4a2c })); desk.position.set(0, 0.78, -2.6); S.add(desk);
  [[-1.5, -3.1], [1.5, -3.1], [-1.5, -2.1], [1.5, -2.1]].forEach(([lx, lz]) => {
    const leg = box(0.08, 0.78, 0.08, lam({ color: 0x4a3220 })); leg.position.set(lx, 0.37, lz); S.add(leg);
  });
  // FIX 26 Nov LAYOUT LOCK (I): desk ka saamne wala panel (modesty panel) — pehle desk khula tha, characters ki
  // taangein neeche latakti dikhti thi (t18/t26); ab panel (y 0.06-0.78) taangein dhakta hai, sirf upar ka hissa dikhega.
  const deskPanel = box(3.2, 0.72, 0.06, lam({ color: 0x6d4a2c })); deskPanel.position.set(0, 0.42, -2.0); S.add(deskPanel);
  [-1.2, 1.2].forEach((cx) => {
    const seat = box(0.55, 0.08, 0.55, lam({ color: 0x4b5563 })); seat.position.set(cx, 0.5, -1.7); S.add(seat);
    const back = box(0.55, 0.7, 0.08, lam({ color: 0x4b5563 })); back.position.set(cx, 0.9, -1.42); S.add(back);
    // FIX 26 Nov LAYOUT LOCK (I): kursi ki 4 taangein — pehle bina taang ke kaale slab tairte lagte the (t18/t26).
    [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]].forEach(([ox, oz]) => {
      const chairLeg = box(0.05, 0.5, 0.05, lam({ color: 0x4a3220 })); chairLeg.position.set(cx + ox, 0.24, -1.7 + oz); S.add(chairLeg);
    });
  });
  // plate stacks (momos plates — steel carrier ke paas)
  for (let i = 0; i < 3; i++) {
    const pl = cyl(0.18, 0.18, 0.03, lam({ color: 0xd6dde3 }), 14);
    pl.position.set(-0.9, 0.84 + i * 0.035, -2.6); S.add(pl);
    const pl2 = cyl(0.18, 0.18, 0.03, lam({ color: 0xd6dde3 }), 14);
    pl2.position.set(0.9, 0.84 + i * 0.035, -2.6); S.add(pl2);
  }
  // desk par asli cheezein — momos ki plate + glass + file stack (FIX 26 Nov LAYOUT LOCK (C): pehle laal/neele/hare
  // flat blocks (0.3x0.05x0.4) bachchon ke khilone lagte the (t18/t26); ab plate + glass + halke rang ki files.)
  const momosPlate = cyl(0.16, 0.16, 0.03, lam({ color: 0xf8fafc }), 14); momosPlate.position.set(-0.3, 0.835, -2.9); S.add(momosPlate);
  for (let i = 0; i < 4; i++) {
    const mo = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), lam({ color: 0xf8f0dc }));
    mo.position.set(-0.36 + (i % 2) * 0.12, 0.875, -2.95 + Math.floor(i / 2) * 0.1); S.add(mo);
  }
  const glassCup = cyl(0.05, 0.045, 0.12, lam({ color: 0x9db8d9 }), 12); glassCup.position.set(0.05, 0.88, -2.9); S.add(glassCup);
  const fileA = box(0.3, 0.05, 0.4, lam({ color: 0xd6c9a8 })); fileA.position.set(0.4, 0.845, -2.9); fileA.rotation.y = 0.1; S.add(fileA);
  const fileB = box(0.28, 0.05, 0.38, lam({ color: 0xc9b896 })); fileB.position.set(0.4, 0.895, -2.9); fileB.rotation.y = -0.08; S.add(fileB);
  const penCup = cyl(0.06, 0.05, 0.14, lam({ color: 0x1d4ed8 }), 10); penCup.position.set(1.35, 0.9, -2.9); S.add(penCup);
  const plant = cyl(0.16, 0.12, 0.28, lam({ color: 0x9a5a34 }), 12); plant.position.set(-1.7, 0.95, -2.9); S.add(plant);
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), lam({ color: 0x4a6b2f }));
  leaf.position.set(-1.7, 1.2, -2.9); S.add(leaf);
  // notice board (office deewaar par)
  const noticeTex = textBoard(512, 320, (g, w, h) => {
    g.fillStyle = '#fef3c7'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#92400e'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
    g.textAlign = 'center'; g.fillStyle = '#92400e';
    g.font = 'bold 56px Arial'; g.fillText('LUNCH  1 PM', w / 2, 110);
    g.fillStyle = '#1e293b'; g.font = 'bold 48px Arial'; g.fillText('MOMOS DAY', w / 2, 200);
  });
  const notice = boardMesh(0.9, 0.56, noticeTex); notice.position.set(-2.2, 1.9, -3.72); S.add(notice);
  const t1 = mkTree(-4.5, -3.0, 1.2); S.add(t1); officeTrees.push(t1);
}

// ---------- HOTEL: marble counter, "SONU'S MOMOS" board, wall lamps, plants, carpet ----------
{
  const S = hotelG;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 34), lam({ map: tex(marble(10), 6, 6), color: 0xd8cfc0 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.02, 3); S.add(floor);
  // laal kaaleen (carpet) — counter tak
  const carpet = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 6.0), lam({ color: 0x7f1d1d }));
  carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.005, 0.2); S.add(carpet);
  const carpetEdge = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.2), lam({ color: 0xfacc15 }));
  carpetEdge.rotation.x = -Math.PI / 2; carpetEdge.position.set(0, 0.008, 3.1); S.add(carpetEdge);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 3.4), lam({ map: tex(plaster(43, 40), 2, 1), color: 0xe8dcc0 }));
  wall.position.set(0, 1.7, -3.8); S.add(wall);
  // marble counter + gold trim
  const counter = box(3.4, 1.05, 0.9, lam({ map: tex(marble(10), 2, 1), color: 0xf5f0e6 })); counter.position.set(0, 0.52, -2.8); S.add(counter);
  const trim = box(3.44, 0.08, 0.94, lam({ color: 0xfacc15 })); trim.position.set(0, 1.08, -2.8); S.add(trim);
  const counterBase = box(3.5, 0.12, 1.0, lam({ color: 0x1e293b })); counterBase.position.set(0, 0.04, -2.8); S.add(counterBase); // FIX 26 Nov LAYOUT LOCK (B): base zameen (y=-0.02) ko chhooye
  // hotel menu board — deewaar par, bada (b13-b14 hero)
  const hBoard = boardMesh(2.0, 1.0, hotelMenuTex); hBoard.position.set(-0.2, 2.15, -3.72); S.add(hBoard); // FIX 26 Nov: x 0 -> -0.2 — s42 me chef se board clear rahe (board text vs chef card overlap khatam).
  // FIX 26 Nov LAYOUT LOCK (E): chandelier HATAYA — sone ka ring (0,3.2,-2.0) + chain (3.2-4.0, deewaar 3.4 se upar)
  // hawa me tairta tha, raat ke aasmaan ke saamne latka dikhta tha (t38/t42/t46). Jagah par 2 deewaar-lamp (board ke dono taraf,
  // deewaar se jude hue). chandLight (point light, intensity 4 hotel me) wahi hai — garam roshni ab bhi aayegi.
  [[-1.35, 2.6], [1.2, 2.6]].forEach(([lx, ly]) => { // FIX 26 Nov LAYOUT LOCK (E): left lamp x -1.6 -> -1.35 — s42 me kinare aadha kata tha (probe)
    const wallLampShade = cyl(0.07, 0.15, 0.14, lam({ color: 0x1e293b }), 10); wallLampShade.position.set(lx, ly, -3.68); S.add(wallLampShade);
    const wallLampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), bas({ color: 0xffe9a8 })); wallLampBulb.position.set(lx, ly - 0.08, -3.68); S.add(wallLampBulb);
  });
  // plants (2 bade gamle) + side table + bell
  [[-2.2, -3.2], [2.2, -3.2]].forEach(([px, pz]) => {
    const pot = cyl(0.25, 0.2, 0.45, lam({ color: 0x7f1d1d }), 12); pot.position.set(px, 0.20, pz); S.add(pot); // FIX 26 Nov LAYOUT LOCK (B): gamle zameen ko chhooye
    [[0, 0.85, 0, 0.3], [-0.2, 0.65, 0.1, 0.22], [0.2, 0.7, -0.1, 0.24]].forEach(([ox, oy, oz, r]) => {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), lam({ color: 0x2f5c2a }));
      leaf.position.set(px + ox, oy, pz + oz); S.add(leaf);
    });
  });
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: 0xfacc15 }));
  bell.position.set(1.2, 1.05, -2.8); S.add(bell); // FIX 26 Nov LAYOUT LOCK (B): pehle y=1.12 — counter top (1.045) se 0.075 upar tairti thi
  const bellBase = cyl(0.11, 0.11, 0.02, lam({ color: 0x1e293b }), 12); bellBase.position.set(1.2, 1.05, -2.8); S.add(bellBase);
  // hotel ke saamne thela (ending — thela hotel me khada hoga): chhota thela silhouette, s52/s56 me dikhe
  const t2 = mkTree(5.5, -3.2, 1.0); S.add(t2); hotelTrees.push(t2);
}

// ---------- WORLD V3 — SHADOWS: thela/props/ped ki asli chhaon ----------
// v4 me sirf character proxy cast karte the — thela/crate/gas/cycle/ped ki chhaon
// zameen par padti hi nahi thi, isliye duniya flat lagti thi. Ab gali + midground
// ke meshes cast + receive karte hain. Coplanar decals (patches, tyre strips,
// dashes — zameen se 0.004-0.008 upar) ki chhaon khud par padti hai, dikhti nahi.
// Skyline (z=-19/-27) shadow camera se bahar hai — skip. Characters (toon cards)
// Basic hain — unki chhaon proxy cylinders se aati hai (pehle jaisi).
galiG.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
midG.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

// =====================================================================
// PROPS — plate dher, ₹30 tag, phone, galla, counter, calendar, clock, bhaap
// =====================================================================
// plate dher (ginne wala — b04 me beat progress se badhta hai)
const pilePlates = [];
for (let i = 0; i < 8; i++) {
  const pl = cyl(0.17, 0.17, 0.03, lam({ color: i % 2 ? 0xf8fafc : 0xdbeafe }), 14);
  pl.position.set(-0.55, 0.615 + i * 0.035, -2.45); // FIX 26 Nov LAYOUT LOCK (B): pehle base 0.66 — neeche wali plate ka bottom (0.645) thela bed top (0.60) se 0.045 upar tairta tha (t10); ab bottom 0.60 = bed top.
  pl.visible = false; scene.add(pl); pilePlates.push(pl);
}
// ---- ₹30 BACHAT TAG (b04) — sunehra gol tag, bada ----
const tag30Tex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#facc15'; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.fill();
  g.strokeStyle = '#a16207'; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 102, 0, 7); g.stroke();
  g.fillStyle = '#451a03'; g.textAlign = 'center';
  g.font = 'bold 62px Arial'; g.fillText('₹30', 128, 118);
  g.font = 'bold 40px Arial'; g.fillText('BACHAT', 128, 170);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const tag30 = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.65), new THREE.MeshLambertMaterial({ map: tag30Tex, transparent: true, depthWrite: false }));
tag30.position.set(0.3, 1.3, -2.0); tag30.visible = false; scene.add(tag30);
const tag30String = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.3), lam({ color: 0x7f1d1d }));
tag30String.position.set(0.3, 1.68, -2.01); tag30String.visible = false; scene.add(tag30String);

// ---- PHONE (b05) — screen par "60 PLATE" bada ----
const phoneScreenTex = textBoard(512, 960, (g, w, h) => {
  g.fillStyle = '#fef9ec'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#7f1d1d'; g.fillRect(0, 0, w, 110);
  g.fillStyle = '#f8fafc'; g.font = 'bold 58px Arial'; g.textAlign = 'center'; g.fillText('SONU MOMOS', w / 2, 76);
  g.fillStyle = '#1e293b'; g.font = 'bold 52px Arial'; g.fillText('ORDER AAYA!', w / 2, 220);
  g.fillStyle = '#c2410c'; g.font = 'bold 110px Arial'; g.fillText('60 PLATE', w / 2, 380);
  g.fillStyle = '#1e293b'; g.font = 'bold 48px Arial'; g.fillText('ROZ • OFFICE', w / 2, 480);
  g.fillStyle = '#16a34a'; g.fillRect(24, 560, w - 48, 130);
  g.fillStyle = '#f8fafc'; g.font = 'bold 64px Arial'; g.fillText('✓ ACCEPT', w / 2, 650);
  g.fillStyle = '#64748b'; g.font = 'bold 40px Arial'; g.fillText('Kaun hai ye?', w / 2, 780);
});
const phoneG = new THREE.Group(); scene.add(phoneG);
{
  const body = box(0.8, 1.5, 0.06, lam({ color: 0x1f2937 })); phoneG.add(body);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 1.42), lam({ map: phoneScreenTex }));
  screen.position.z = 0.035; phoneG.add(screen);
  phoneG.position.set(-0.75, 1.85, -1.3); phoneG.rotation.y = -0.15; phoneG.visible = false;
}
// ---- STEEL CARRIER (peon — plates le jaata hai; b05/b06/b12) ----
const carrierG = new THREE.Group(); scene.add(carrierG);
const carrierPlates = [];
{
  const boxC = box(0.5, 0.3, 0.35, lam({ color: 0x9ca3af })); boxC.position.y = 0.15; carrierG.add(boxC);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 16, Math.PI), lam({ color: 0x4b5563 }));
  handle.position.y = 0.32; carrierG.add(handle);
  for (let i = 0; i < 3; i++) {
    const pl = cyl(0.14, 0.14, 0.03, lam({ color: 0xf8fafc }), 12);
    pl.position.set(-0.12 + i * 0.12, 0.32, 0); carrierG.add(pl); carrierPlates.push(pl);
  }
  carrierG.visible = false;
}
// ---- GALLA (b04 s16, b09) — lakdi ka box + khulne wala dhakkan + andar note ----
const gallaG = new THREE.Group(); scene.add(gallaG);
let gallaLid = null;
{
  const gbox = box(0.55, 0.28, 0.4, lam({ map: tex(planks(43), 1, 1) })); gbox.position.set(-0.05, 0.78, -2.62); gallaG.add(gbox); // FIX 26 Nov FIX ROUND 5: (-0.2,-2.5) -> (-0.05,-2.62) — galla ka saamne wala kinara (z -2.30) menu board ke dayein kinare (z -2.389) se AAGE tha, isliye s16/s35 me "CHUTNEY FR" + "PANEER ₹7" dhaka tha (f417/f958, 3D ray 13.6%/10.4%); ab front z -2.42 < menu -2.389, menu 0.0% (ray se verify). G4 (-0.05) G2 (+0.05) se behtar: note 65% vs 30% dikhta (s16), galla combined (Sonu+menu) s16 50% / s35 45% / s33 35% (v3 s33 me 10% tha); thela bed ke dayein kinare (-0.246) se chipka hai, counter par baitha lagta hai.
  const gtop = box(0.57, 0.03, 0.42, lam({ map: tex(planks(44), 1, 1) })); gtop.position.set(-0.05, 0.93, -2.62); gallaG.add(gtop); // FIX ROUND 5: galla ke saath (-0.2,-2.5) -> (-0.05,-2.62).
  const lidGeo = new THREE.BoxGeometry(0.55, 0.04, 0.4); lidGeo.translate(0, 0, 0.2);
  gallaLid = new THREE.Mesh(lidGeo, lam({ map: tex(planks(45), 1, 1) }));
  gallaLid.position.set(-0.05, 0.94, -2.82); gallaG.add(gallaLid); // FIX ROUND 5: galla ke saath (-0.2,-2.7) -> (-0.05,-2.82) — khula dhakkan menu ke peeche rahe.
  for (let i = 0; i < 3; i++) {
    const n = box(0.3, 0.015, 0.2, lam({ color: i % 2 ? 0xd9f99d : 0xbbf7d0 }));
    n.position.set(-0.05 + (i - 1) * 0.02, 0.94 + i * 0.018, -2.62); n.rotation.y = (i - 1) * 0.12; gallaG.add(n); // FIX ROUND 5: galla ke saath (-0.2,-2.5) -> (-0.05,-2.62).
  }
  gallaG.visible = false;
}
// ---- GINNE WALA NOTE (b04 s16) — haath se galle me dalta hai ----
const countNote = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.14), lam({ color: 0xd9f99d, side: THREE.DoubleSide }));
countNote.visible = false; scene.add(countNote);
// ---- NOTE-DHER (b09 s35 HOLD) — galle ke paas bharra dher ----
const notesHeapG = new THREE.Group(); scene.add(notesHeapG);
{
  for (let i = 0; i < 6; i++) {
    const n = box(0.32, 0.02, 0.22, lam({ color: i % 2 ? 0xd9f99d : 0xbbf7d0 }));
    n.position.set(0.55 + (i % 2 ? 0.03 : -0.02), 0.66 + i * 0.022, -2.5); n.rotation.y = (i % 2 ? 0.12 : -0.1) * (i + 1) * 0.4; notesHeapG.add(n); // FIX ROUND 5: base x 0.45 -> 0.55 — galla dayein (-0.05) aaya to ghume hue note ka kona (0.236 tak) galle ke dayein kinare (0.225) se takra sakta tha; ab base 0.55 par bayein kona 0.336 — 0.11 saaf, phir bhi "galle ke paas".
  }
  notesHeapG.visible = false;
}
// ---- COUNTER BOARD (b09) — "₹90,000" gin kar badhta hai + HOLD ----
const counterCanvas = document.createElement('canvas'); counterCanvas.width = 512; counterCanvas.height = 360;
const counterCtx = counterCanvas.getContext('2d');
const counterTex = new THREE.CanvasTexture(counterCanvas); counterTex.colorSpace = THREE.SRGBColorSpace;
let lastCounterVal = -1;
function drawCounter(v) {
  // Press fix jaisa: 500-step (5000-step se final value kabhi display nahi hota tha — run #186 seekh).
  const qv = Math.floor(v / 500) * 500;
  if (qv === lastCounterVal) return; lastCounterVal = qv;
  const g = counterCtx;
  g.fillStyle = '#134e4a'; g.fillRect(0, 0, 512, 360);
  g.strokeStyle = '#facc15'; g.lineWidth = 8; g.strokeRect(10, 10, 492, 340);
  g.textAlign = 'center'; g.fillStyle = '#f8fafc';
  g.font = 'bold 40px Arial'; g.fillText('MAHINE KA GALLA', 256, 70);
  g.fillStyle = '#facc15'; g.font = 'bold 84px Arial'; g.fillText('₹' + qv.toLocaleString('en-IN'), 256, 190);
  g.fillStyle = '#f8fafc'; g.font = 'bold 36px Arial'; g.fillText('MUNAFA • MOMOS', 256, 280);
  counterTex.needsUpdate = true;
}
const counterBoard = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.85), lam({ map: counterTex }));
counterBoard.position.set(-1.3, 2.35, -4.22); counterBoard.visible = false; scene.add(counterBoard); // FIX 26 Nov: x 0.6 -> -1.3 — khidki ki salakh (winBar) board dhak rahi thi (f_6.5s, render #198). FIX 26 Nov: y 2.0 -> 2.35 — push-in me number kaale thela-roof band se aadha kata tha (sample v2 f162/f180); ab count ke dauraan bhi number roof se upar saaf dikhega.
// ---- CALENDAR BOARD + PAID STAMP (b07 s27) — "15 DIN PEHLE" ----
const calendarTex = textBoard(512, 384, (g, w, h) => {
  g.fillStyle = '#fef9ec'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1e293b'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
  g.textAlign = 'center'; g.fillStyle = '#1e293b';
  g.font = 'bold 64px Arial'; g.fillText('15 DIN', w / 2, 130);
  g.font = 'bold 64px Arial'; g.fillText('PEHLE', w / 2, 210);
  g.fillStyle = '#64748b'; g.font = 'bold 40px Arial'; g.fillText('PAISA PEHLE', w / 2, 300);
});
const calendarBoard = boardMesh(1.0, 0.75, calendarTex);
calendarBoard.position.set(1.6, 1.9, -4.22); calendarBoard.visible = false; scene.add(calendarBoard);
const paidTex = textBoard(256, 128, (g, w, h) => {
  g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h);
  g.strokeStyle = '#dc2626'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
  g.fillStyle = '#dc2626'; g.font = 'bold 64px Arial'; g.textAlign = 'center'; g.fillText('PAID ✓', w / 2, 88);
});
const paidStamp = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.28), new THREE.MeshLambertMaterial({ map: paidTex, transparent: true, depthWrite: false }));
paidStamp.position.set(1.6, 1.55, -4.18); paidStamp.rotation.z = -0.15; paidStamp.visible = false; scene.add(paidStamp);
// ---- WALL CLOCK (ghadi — gali deewaar par; hands beat par set hote hain) ----
const clockG = new THREE.Group(); scene.add(clockG);
let clockHour = null, clockMin = null;
{
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.55), lam({ map: clockTex }));
  clockG.add(face);
  const hourGeo = new THREE.BoxGeometry(0.03, 0.16, 0.01); hourGeo.translate(0, 0.07, 0);
  clockHour = new THREE.Mesh(hourGeo, lam({ color: 0x1e293b })); clockHour.position.z = 0.01; clockG.add(clockHour);
  const minGeo = new THREE.BoxGeometry(0.02, 0.24, 0.01); minGeo.translate(0, 0.11, 0);
  clockMin = new THREE.Mesh(minGeo, lam({ color: 0x1e293b })); clockMin.position.z = 0.015; clockG.add(clockMin);
  clockG.position.set(0.55, 2.70, -4.22); // FIX 26 Nov FIX ROUND 5: (-1.6,2.6) -> (0.55,2.70) — ghadi counter board (-1.3,2.35; x -1.9..-0.7, y 1.925..2.775) ke upar-left kone par aa gayi thi, "MAHINE" 45.8% dhaka (f958, coplanar z=-4.22 isliye 2D NDC overlap se verify); ab board se dayein 0.975 saaf (boardCov 0.0%, titleCov 0.0%). Upar bhi: bottom 2.425 > sign top 2.095 + roof 2.13 + khidki top 2.40 (strip 0.0) — khidki/winBar se bhi saaf; top 2.975 < deewaar top 3.2; lamp (x -0.2) se 0.255 saaf. Wide shots me IN (s01 end par push-in exit — transient, checker me darj). s12 camera + glint bhi nayi jagah par.
  clockG.visible = false;
}
// ---- CHUTNEY CLOSE-UP DABBE (b07 s26 / b10 s37) — bade laal + hari dabbe ----
const chutneyCloseG = new THREE.Group(); scene.add(chutneyCloseG);
{
  const dR = cyl(0.16, 0.14, 0.28, lam({ color: 0xdc2626 }), 14); dR.position.set(-0.2, 0.14, 0); chutneyCloseG.add(dR);
  const dG = cyl(0.16, 0.14, 0.28, lam({ color: 0x16a34a }), 14); dG.position.set(0.2, 0.14, 0); chutneyCloseG.add(dG);
  const lR = cyl(0.17, 0.17, 0.03, lam({ color: 0x991b1b }), 14); lR.position.set(-0.2, 0.29, 0); chutneyCloseG.add(lR);
  const lG = cyl(0.17, 0.17, 0.03, lam({ color: 0x14532d }), 14); lG.position.set(0.2, 0.29, 0); chutneyCloseG.add(lG);
  const lbl = textBoard(256, 96, (g, w, h) => {
    g.fillStyle = '#fef3c7'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#dc2626'; g.font = 'bold 52px Arial'; g.textAlign = 'center'; g.fillText('EK DABBA', w / 2, 66);
  });
  const lblM = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.19), lam({ map: lbl }));
  lblM.position.set(0, 0.45, 0.01); chutneyCloseG.add(lblM);
  chutneyCloseG.position.set(0.3, 1.05, -2.0);
  chutneyCloseG.visible = false;
}
// ---- EK PLATE MOMOS (chef taste — b12) ----
const plateSingleG = new THREE.Group(); scene.add(plateSingleG);
{
  const pl = cyl(0.2, 0.2, 0.03, lam({ color: 0xf8fafc }), 14); plateSingleG.add(pl);
  for (let i = 0; i < 4; i++) {
    const mo = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), lam({ color: 0xf8f0dc }));
    mo.position.set(-0.08 + (i % 2) * 0.14, 0.04, -0.05 + Math.floor(i / 2) * 0.1); plateSingleG.add(mo);
  }
  plateSingleG.visible = false;
}
// ---- HOTEL THELA (ending — thela hotel me khada hoga; b14 s52/s56) ----
const hotelThelaG = new THREE.Group(); scene.add(hotelThelaG);
{
  const bed = box(1.8, 0.1, 1.0, lam({ map: tex(planks(41), 2, 1) })); bed.position.y = 0.55; hotelThelaG.add(bed);
  [-0.52, 0.52].forEach((rz) => {
    const wh = cyl(0.32, 0.32, 0.06, lam({ color: 0x1f2937 }), 16); wh.rotation.x = Math.PI / 2; wh.position.set(0, 0.32, rz); hotelThelaG.add(wh);
  });
  [[-0.85, -0.45], [0.85, -0.45], [-0.85, 0.45], [0.85, 0.45]].forEach(([px, pz]) => {
    const pole = cyl(0.03, 0.03, 1.5, lam({ color: 0x6d3d1a }), 8); pole.position.set(px, 1.35, pz); hotelThelaG.add(pole);
  });
  const roof = box(2.0, 0.06, 1.2, lam({ color: 0x9a3412 })); roof.position.set(0, 2.10, 0); hotelThelaG.add(roof); // FIX 26 Nov LAYOUT LOCK (B): y 2.12 -> 2.10, khambhon (top 2.10) par baithi
  for (let i = 0; i < 3; i++) {
    const tier = cyl(0.28, 0.28, 0.16, lam({ color: 0x9aa5ad }), 16); tier.position.set(-0.45, 0.68 + i * 0.17, 0); hotelThelaG.add(tier);
  }
  const sign = boardMesh(1.7, 0.35, sonuSignTex); sign.position.set(0, 1.92, 0.62); hotelThelaG.add(sign);
  hotelThelaG.position.set(1.7, -0.02, -2.4); hotelThelaG.rotation.y = -0.35; // FIX 26 Nov LAYOUT LOCK (B): y -0.02 — pahiye zameen ko chhooyein
  hotelThelaG.visible = false;
}
// ---- BHAAP (steamer se) ----
const steamMat = () => new THREE.SpriteMaterial({ map: FX.puffTexture([[0, 'rgba(255,255,255,0.85)'], [1, 'rgba(255,255,255,0)']]), transparent: true, opacity: 0, depthWrite: false });
const steamSprites = [];
for (let i = 0; i < 3; i++) { const sp = new THREE.Sprite(steamMat()); sp.scale.setScalar(0.3); scene.add(sp); steamSprites.push(sp); }
// ---- BHAAP BADAL (b02 joke — bada badal jaisa) ----
const steamCloud = [];
for (let i = 0; i < 3; i++) { const sp = new THREE.Sprite(steamMat()); sp.scale.setScalar(0.8); scene.add(sp); steamCloud.push(sp); }
// ---- CHIDIYA (b02 me badal ke paas se guzarti — background movement) ----
const bird = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.07), bas({ color: 0x1f2937, side: THREE.DoubleSide }));
bird.visible = false; scene.add(bird);
// board chamak
const glintBoard = mkGlint(-1.2, 2.1, -2.1, 0.5);
const glintGalla = mkGlint(0.6, 2.1, -4.0, 0.5);
const glintHotel = mkGlint(0, 2.3, -3.5, 0.6);

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
  officeG.visible = (shot.set === 'office');
  hotelG.visible = (shot.set === 'hotel');
  lampLight.intensity = (shot.set === 'gali') ? (env.lamp || 0) : 0;
  chandLight.intensity = (shot.set === 'hotel') ? 4 : 0;
  officeLight.intensity = (shot.set === 'office') ? 2.5 : 0;
  // ---- hamesha zinda background: ped + kapde hilte ----
  galiTrees.forEach((t, i) => { t.rotation.z = Math.sin(f * 0.03 + i * 1.7) * 0.018; });
  officeTrees.forEach((t, i) => { t.rotation.z = Math.sin(f * 0.03 + i * 2.3) * 0.018; });
  hotelTrees.forEach((t, i) => { t.rotation.z = Math.sin(f * 0.03 + i * 1.9) * 0.018; });
  swayCloths.forEach((c, i) => { c.rotation.x = Math.sin(f * 0.05 + i * 1.3) * 0.08; });
  // ---- props default band (har shot me reset — sirf apne shot me dikhe) ----
  glintBoard.material.opacity = 0; glintGalla.material.opacity = 0; glintHotel.material.opacity = 0;
  pilePlates.forEach((m) => { m.visible = false; });
  tag30.visible = false; tag30String.visible = false;
  phoneG.visible = false;
  carrierG.visible = false; carrierPlates.forEach((m) => { m.visible = true; });
  gallaG.visible = false; if (gallaLid) gallaLid.rotation.x = 0;
  countNote.visible = false;
  notesHeapG.visible = false;
  counterBoard.visible = false;
  calendarBoard.visible = false; paidStamp.visible = false;
  clockG.visible = (shot.set === 'gali');
  chutneyCloseG.visible = false;
  plateSingleG.visible = false;
  hotelThelaG.visible = false;
  steamSprites.forEach((sp) => { sp.material.opacity = 0; });
  steamCloud.forEach((sp) => { sp.material.opacity = 0; });
  bird.visible = false;
  const fl = FLASH[id];
  flashPlane.material.opacity = fl ? Math.max(0, 1 - Math.abs(f - fl.at) / (fl.dur / 2)) : 0;
  // ghadi ki suiyaan — b03: 5 baje (shaam 5), b07: 7 baje (subah 7); baaki 5 baje hi
  if (clockHour && clockMin) {
    const hr = (shot.beat === 'b07') ? 7 : 5;
    clockHour.rotation.z = -(hr / 12) * Math.PI * 2;
    clockMin.rotation.z = 0;
  }
  // bhaap — steamer se, gali set me hamesha halki (loop); b07/b02 me tez
  if (shot.set === 'gali') {
    const boost = (shot.beat === 'b07' || shot.beat === 'b02') ? 1.6 : 1.0;
    steamSprites.forEach((sp, i) => {
      const p = ((f * 0.008 + i * 0.33) % 1);
      sp.material.opacity = Math.min(0.7, (1 - p) * 0.45 * boost);
      sp.position.set(-1.65 + Math.sin(f * 0.05 + i * 2) * 0.08, 1.35 + p * 0.7, -2.8);
      sp.scale.setScalar(0.25 + p * 0.35);
    });
  }

  // ---- beat dispatch (56 shots, 14 beats) ----
  // u = shot ke andar 0..1; bu = poori beat par 0..1 (beat-spanning actions: counter, lid, plate dher).
  // sub = beat ke andar shot ka index (0-based). Har sub-shot me alag angle (story.js CAMS) + alag action-step.
  const beat = BEAT_OF[id], bu = beatU(f), sub = shot.sub;
  switch (beat) {
    case 'b01': { // HOOK paradox — sub0 aerial (padosi gali paar karta hai), sub1 sign push-in, sub2 board+bhaap, sub3 Sonu wonder, sub4 KHAALI thela wide (koi grahak nahi)
      if (sub === 4) {
        // khaali thela — Sonu frame me nahi, sirf thela + bhaap + sign
        glintBoard.position.set(-1.2, 2.1, -2.1);
        glintBoard.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3);
      } else {
        drawChar(sonuCard, 61, SONU, 'wonder', 'hang', 'hang', f, cp, -0.2, 0, -1.4, 1.05, 0, null, 0, mouthFor(f), 'sonu');
        if (sub === 0) {
          const nx = 3.5 - 2.0 * u;
          drawChar(custManCard, 63, CUST_MAN, 'neutral', 'hang', 'hang', f, cp, nx, 0, -3.2, 0.85, 0.5 + 0.08 * Math.sin(f * 0.15), null, 0, null, false);
        }
        glintBoard.position.set(-1.2, 2.1, -2.1);
        glintBoard.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3);
      }
      break;
    }
    case 'b02': { // BHAAP JOKE — sub0 badal jaisa bhaap + chidiya, sub1 Sonu hansi CU, sub2 aunty upar dekh kar hansi
      if (sub === 0) {
        steamCloud.forEach((sp, i) => {
          const p = ((f * 0.01 + i * 0.33) % 1);
          sp.material.opacity = (1 - p) * 0.6;
          sp.position.set(-1.65 + Math.sin(f * 0.04 + i * 2) * 0.3, 1.6 + p * 0.9, -2.6);
          sp.scale.setScalar(0.7 + p * 0.8);
        });
        bird.visible = true;
        bird.position.set(-4 + 8 * u, 5.5 + Math.sin(f * 0.1) * 0.2, -12);
        bird.rotation.z = Math.sin(f * 0.2) * 0.2;
      } else if (sub === 1) {
        drawChar(sonuCard, 61, SONU, 'laugh', 'hang', 'hang', f, cp, -0.2, 0, -1.4, 1.6, 0, null, 2, null, 'sonu'); // FIX 26 Nov LAYOUT LOCK (A): pehle scale 2.0 — chehra upar+dayein kata tha (t6, s07); ab 1.6 + camera peeche (story.js s07)
      } else {
        drawChar(custAuntyCard, 69, CUST_AUNTY, 'laugh', 'hang', 'hang', f, cp, 1.2, 0, -1.8, 1.0, 0, null, -3, null, false);
        drawChar(sonuCard, 61, SONU, 'laugh', 'hang', 'hang', f, cp, -0.2, 0, -1.4, 0.9, 0, null, 0, null, 'sonu');
      }
      break;
    }
    case 'b03': { // SONU INTRO — sub0 thela wide + menu, sub1 Sonu medium (apron+towel), sub2 plate stack close, sub3 ghadi 5 baje
      // FIX 26 Nov LAYOUT LOCK (A): sub2 (plate stack close) me Sonu camera aur pile ke beech me tha — camera uske
      // chehre ke 0.73 peeche tha, chehra poora frame bhar gaya tha (t10, s11). Ab sub2 me Sonu pile ke dayein-peeche
      // khada hai (0.9, -1.9), camera seedha pile par — chehra frame se bahar, sirf pile ka close-up.
      if (sub === 2) {
        drawChar(sonuCard, 61, SONU, 'smile', 'reach', 'hang', f, cp, 0.9, 0, -1.9, 0.9, 0, 0.3, 0, mouthFor(f), 'sonu');
        pilePlates.forEach((m, i) => { m.visible = i < 4; });
      } else {
        drawChar(sonuCard, 61, SONU, 'smile', 'reach', 'hang', f, cp, -0.2, 0, -1.4, 1.05, 0, 0.3, 0, mouthFor(f), 'sonu');
      }
      if (sub === 3) {
        glintBoard.position.set(0.55, 2.85, -4.0); // FIX 26 Nov FIX ROUND 5: ghadi nayi jagah (0.55,2.70) — chamak uske upar (FIX ROUND 4: -1.6,2.75 tha).
        glintBoard.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3);
      }
      break;
    }
    case 'b04': { // 40 PLATE / ₹30 — sub0 plates ginna (dher bu se badhta hai), sub1 tag pop, sub2 Sonu serve, sub3 galle me note
      if (sub === 0) {
        const n = 1 + Math.floor(bu * 7);
        pilePlates.forEach((m, i) => { m.visible = i < n; });
        drawChar(sonuCard, 61, SONU, 'smile', 'reach', 'hang', f, cp, -0.2, 0, -1.4, 1.0, 0, 0.35, 0, mouthFor(f), 'sonu');
      } else if (sub === 1) {
        const pop = clamp(u * 4, 0, 1);
        tag30.visible = true; tag30String.visible = true;
        tag30.scale.setScalar(Math.max(0.01, pop)); tag30.material.opacity = pop;
        tag30.rotation.z = Math.sin(f * 0.05) * 0.05;
        tag30String.material.opacity = pop;
        drawChar(sonuCard, 61, SONU, 'smile', 'hang', 'hang', f, cp, -0.2, 0, -1.4, 0.9, 0, null, 0, mouthFor(f), 'sonu');
      } else if (sub === 2) {
        const lift = 0.3 + 0.15 * Math.sin(f * 0.5);
        drawChar(sonuCard, 61, SONU, 'smile', 'reach', 'hang', f, cp, -0.2, 0, -1.4, 1.0, 0, lift, 0, mouthFor(f), 'sonu');
        drawChar(custManCard, 63, CUST_MAN, 'smile', 'reach', 'hang', f, cp, 1.2, 0, -1.8, 0.95, 0, 0.2, 0, null, false);
        plateSingleG.visible = true;
        plateSingleG.position.set(0.6, 1.15, -1.6);
      } else {
        drawChar(sonuCard, 61, SONU, 'smile', 'reach', 'hang', f, cp, 0.1, 0, -1.4, 1.0, 0, 0.3, 0, mouthFor(f), 'sonu'); // FIX 26 Nov FIX ROUND 4: Sonu x -0.2 -> 0.1 — menu board ki teesri line "CHUTNEY FREE" Sonu ke peeche dhaki thi (f417, 15% cover, 3D ray se verify); ab board poora readable (menu-vs-Sonu 0%)
        gallaG.visible = true;
        if (gallaLid) gallaLid.rotation.x = -1.9 * M.surge(clamp(u * 2, 0, 1));
        countNote.visible = true;
        countNote.position.set(-0.05, 1.15 + 0.08 * Math.abs(Math.sin(f * 0.5)), -2.42); // FIX ROUND 5: galla ke saath (-0.2,-2.3) -> (-0.05,-2.42) — note menu ke dayein kinare (z -2.389) ke saamne tha, upar-dayein kona dhak raha tha (1.1% ray cover); ab menu ke peeche + dayein.
        countNote.rotation.set(-0.5, 0, Math.sin(f * 0.5) * 0.15);
      }
      break;
    }
    case 'b05': { // PHONE 60 PLATE — sub0 phone bajta (shake), sub1 Sonu sunta (sawal), sub2 screen ECU, sub3 peon le jaata, sub4 office desk
      if (sub === 0) {
        phoneG.visible = true;
        phoneG.position.set(-0.75, 1.85, -1.3);
        phoneG.rotation.z = Math.sin(f * 0.6) * 0.08;
        drawChar(sonuCard, 61, SONU, 'wonder', 'hang', 'hang', f, cp, -0.2, 0, -1.4, 1.0, 0, null, 0, mouthFor(f), 'sonu');
      } else if (sub === 1) {
        phoneG.visible = true;
        phoneG.position.set(-0.55, 1.95, -1.25);
        phoneG.rotation.z = 0.15;
        drawChar(sonuCard, 61, SONU, 'wonder', 'hang', 'hang', f, cp, -0.2, 0, -1.4, 1.0, 0, null, 0, mouthFor(f), 'sonu');
      } else if (sub === 2) {
        phoneG.visible = true;
        phoneG.position.set(0, 1.7, -1.2);
        phoneG.scale.setScalar(1.6);
        phoneG.rotation.set(0, 0, 0);
      } else if (sub === 3) {
        const px = -1.0 + 2.6 * u;
        drawChar(peonCard, 67, PEON, 'smile', 'reach', 'hang', f, cp, px, 0, -2.0, 1.0, (f * 0.12) % 1, 0.35, 0, null, false);
        carrierG.visible = true;
        carrierG.position.set(px + 0.35, 1.0, -1.8);
      } else {
        drawChar(off1Card, 73, OFF1, 'smile', 'hang', 'hang', f, cp, -0.8, 0, -3.0, 1.0, 0, null, 0, null, false);
        drawChar(off2Card, 75, OFF2, 'smile', 'hang', 'hang', f, cp, 0.8, 0, -3.0, 1.0, 0, null, 0, null, false);
        drawChar(peonCard, 67, PEON, 'smile', 'reach', 'hang', f, cp, 1.6, 0, -2.0, 1.0, 0, 0.35, 0, null, false);
        carrierG.visible = true;
        carrierG.position.set(1.95, 1.0, -1.8);
      }
      break;
    }
    case 'b06': { // KAUN HAI YE? — sub0 Sonu sochta (shaant sawal), sub1 khaali sadak, sub2 peon wapas (khaali carrier)
      if (sub === 0) {
        drawChar(sonuCard, 61, SONU, 'wonder', 'hang', 'cheek', f, cp, -0.2, 0, -1.4, 1.5, 0, null, 0, mouthFor(f), 'sonu');
      } else if (sub === 2) {
        const px = 2.6 - 2.0 * u;
        drawChar(peonCard, 67, PEON, 'neutral', 'hang', 'hang', f, cp, px, 0, -2.0, 1.0, (f * 0.12) % 1, null, 0, null, false);
        carrierG.visible = true;
        carrierG.position.set(px - 0.35, 1.0, -1.8);
        carrierPlates.forEach((m) => { m.visible = false; }); // khaali carrier — plates de diye
      }
      break;
    }
    case 'b07': { // TEEN NIYAM (SUBAH) — sub0 fresh batch steamer, sub1 chutney "ek dabba", sub2 calendar + PAID stamp, sub3 Sonu 3 ungli, sub4 subah thela wide
      if (sub === 0) {
        const lift = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(f * 0.42));
        drawChar(sonuCard, 61, SONU, 'smile', 'reach', 'hang', f, cp, -0.2, 0, -1.4, 1.0, 0, lift, 0, mouthFor(f), 'sonu');
      } else if (sub === 1) {
        chutneyCloseG.visible = true;
        drawChar(sonuCard, 61, SONU, 'smile', 'reach', 'hang', f, cp, -0.2, 0, -1.4, 0.9, 0, 0.3, 0, mouthFor(f), 'sonu');
      } else if (sub === 2) {
        calendarBoard.visible = true;
        paidStamp.visible = true;
        paidStamp.scale.setScalar(Math.max(0.01, clamp(u * 3, 0, 1)));
        paidStamp.material.opacity = clamp(u * 3, 0, 1);
      } else if (sub === 3) {
        drawChar(sonuCard, 61, SONU, 'smile', 'up', 'hang', f, cp, -0.2, 0, -1.4, 1.05, 0, null, 0, mouthFor(f), 'sonu');
      } else {
        drawChar(sonuCard, 61, SONU, 'smile', 'hang', 'hang', f, cp, -0.2, 0, -1.4, 1.0, 0, null, 0, mouthFor(f), 'sonu');
      }
      break;
    }
    case 'b08': { // OFFICE KHUSH — sub0 desk par 2 men khush, sub1 peon plates deta, sub2 khidki sheher
      if (sub === 0) {
        drawChar(off1Card, 73, OFF1, 'laugh', 'hang', 'hang', f, cp, -0.8, 0, -3.0, 1.0, 0, null, 0, null, false);
        drawChar(off2Card, 75, OFF2, 'laugh', 'hang', 'hang', f, cp, 0.8, 0, -3.0, 1.0, 0, null, 0, null, false);
      } else if (sub === 1) {
        drawChar(peonCard, 67, PEON, 'smile', 'reach', 'hang', f, cp, 1.6, 0, -2.0, 1.0, 0, 0.35, 0, null, false);
        carrierG.visible = true;
        carrierG.position.set(1.95, 1.0, -1.8);
        drawChar(off1Card, 73, OFF1, 'smile', 'reach', 'hang', f, cp, -0.8, 0, -3.0, 1.0, 0, 0.2, 0, null, false);
      } else {
        drawChar(off1Card, 73, OFF1, 'smile', 'hang', 'hang', f, cp, 1.6, 0, -2.4, 1.0, 0, null, 0, null, false);
      }
      break;
    }
    case 'b09': { // GALLA ₹90,000 — sub0 lid khulta (bu se), sub1 counter gin kar badhe, sub2 HOLD wide + note dher
      drawChar(sonuCard, 61, SONU, 'smile', 'reach', 'hang', f, cp, -0.2, 0, -1.4, 1.0, 0, 0.3, 0, mouthFor(f), 'sonu');
      gallaG.visible = true;
      if (gallaLid) gallaLid.rotation.x = -1.9 * M.surge(bu);
      counterBoard.visible = true;
      // FIX (Press run #186 seekh): BEAT-u se, u>=0.75 par full + HOLD; 500-step (drawCounter me).
      const cp09 = clamp(bu / 0.75, 0, 1);
      drawCounter(90000 * (cp09 * cp09 * (3 - 2 * cp09)));
      glintGalla.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3);
      if (sub === 2) notesHeapG.visible = true;
      break;
    }
    case 'b10': { // KHUD-CHECK — sub0 Sonu camera ki taraf point, sub1 chutney dabba close, sub2 customer chutney leta, sub3 thela wide
      if (sub === 0) {
        drawChar(sonuCard, 61, SONU, 'smile', 'point', 'hang', f, cp, -0.2, 0, -1.4, 1.5, 0, null, 0, mouthFor(f), 'sonu');
      } else if (sub === 1) {
        // FIX 26 Nov LAYOUT LOCK (A/H): thela ke dabbe close-up hain — Sonu camera aur dabbon ke beech me tha, chehra
        // kinare kata dikhta tha; ab Sonu dayein-peeche (0.9, -1.9). chutneyCloseG yahan NAHI (wo sub2 aunty scene ka
        // hai — yahan uska kinara frame ke dayein kata dikhta tha).
        drawChar(sonuCard, 61, SONU, 'smile', 'hang', 'hang', f, cp, 0.9, 0, -1.9, 0.9, 0, null, 0, mouthFor(f), 'sonu');
      } else if (sub === 2) {
        drawChar(custAuntyCard, 69, CUST_AUNTY, 'smile', 'reach', 'hang', f, cp, 1.2, 0, -1.8, 1.0, 0, 0.3, 0, null, false);
        drawChar(sonuCard, 61, SONU, 'smile', 'reach', 'hang', f, cp, -0.2, 0, -1.4, 1.0, 0, 0.35, 0, mouthFor(f), 'sonu');
        chutneyCloseG.visible = true;
        chutneyCloseG.position.set(0.85, 0.45, -1.85); // FIX 26 Nov: y 1.05 -> 0.45 — dabba aunty ka chehra dhak raha tha (f_9.5s, 62% cover).
      } else {
        drawChar(sonuCard, 61, SONU, 'smile', 'hang', 'hang', f, cp, -0.2, 0, -1.4, 1.0, 0, null, 0, mouthFor(f), 'sonu');
        drawChar(custManCard, 63, CUST_MAN, 'smile', 'hang', 'hang', f, cp, 1.4, 0, -2.0, 0.95, 0, null, 0, null, false);
        drawChar(custKidCard, 71, CUST_KID, 'smile', 'hang', 'hang', f, cp, 1.9, 0, -1.6, 0.7, 0, null, 0, null, false);
      }
      break;
    }
    case 'b11': { // CHEF AAYA (RAAT) — sub0 hotel bahar (Sonu darwaze par), sub1 peeche se safed coat+toque, sub2 turn CHEF FACE reveal 'O', sub3 Sonu shock 'O'
      if (sub === 0) {
        drawChar(sonuCard, 61, SONU, 'wonder', 'hang', 'hang', f, cp, -0.6, 0, -1.6, 1.0, 0, null, 0, null, 'sonu');
      } else if (sub === 1) {
        // peeche se: chef door khada, toque+coat pehchan; card camera-facing hai isliye scale chhota + headTilt se peeche ka ehsaas
        drawChar(chefCard, 65, CHEF, 'neutral', 'hang', 'hang', f, cp, 0.6, 0.30, -2.6, 0.9, 0, null, 0, null, 'chef'); // FIX 26 Nov: bow HATAYA (tilt 4->0, aadha chehra + tairti toque) + chef 0.30 upar uthaya (counter trim se chehra kata tha) — ab seedha khada, poora chehra + toque
      } else if (sub === 2) {
        drawChar(chefCard, 65, CHEF, 'shock', 'hang', 'hang', f, cp, 1.25, 0, -2.2, 2.0, 0, null, 0, null, 'chef'); // FIX 26 Nov: x 0.6 -> 1.25 — chef board dhak raha tha (f_13.0s, 50% cover).
        glintHotel.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3);
      } else {
        drawChar(sonuCard, 61, SONU, 'shock', 'hang', 'hang', f, cp, -0.6, 0, -1.6, 1.1, 0, null, 0, null, 'sonu'); // FIX 26 Nov LAYOUT LOCK (F): pehle scale 2.0 — Sonu chef se 2x bada tha, uska sir chef ke poore shareer jitna (t38, s43); ab 1.1 ~ chef 0.9
        drawChar(chefCard, 65, CHEF, 'shock', 'hang', 'hang', f, cp, 0.6, 0, -2.2, 0.9, 0, null, 0, null, 'chef');
      }
      break;
    }
    case 'b12': { // 2 SAAL TASTE — sub0 chef plate uthata, sub1 FLASHBACK peon 60 plate (gali), sub2 chef khata (taste), sub3 Sonu wonder
      if (sub === 0) {
        drawChar(chefCard, 65, CHEF, 'smile', 'reach', 'hang', f, cp, 0.6, 0, -2.2, 1.05, 0, 0.35, 0, mouthFor(f), 'chef');
        plateSingleG.visible = true;
        plateSingleG.position.set(0.9, 1.15, -2.0);
      } else if (sub === 1) {
        // flashback: set gali (story.js) — peon carrier le jaata hai, Sonu thele par
        drawChar(peonCard, 67, PEON, 'smile', 'reach', 'hang', f, cp, 1.0, 0, -2.0, 1.0, (f * 0.12) % 1, 0.35, 0, null, false);
        carrierG.visible = true;
        carrierG.position.set(1.35, 1.0, -1.8);
        drawChar(sonuCard, 61, SONU, 'smile', 'reach', 'hang', f, cp, -0.2, 0, -1.4, 0.9, 0, 0.3, 0, mouthFor(f), 'sonu');
      } else if (sub === 2) {
        drawChar(chefCard, 65, CHEF, 'smile', 'reach', 'hang', f, cp, 0.6, 0, -2.2, 1.5, 0, 0.25, 0, null, 'chef');
        plateSingleG.visible = true;
        plateSingleG.position.set(0.75, 1.55, -2.0);
      } else {
        drawChar(sonuCard, 61, SONU, 'wonder', 'hang', 'hang', f, cp, -0.6, 0, -1.6, 1.05, 0, null, 0, mouthFor(f), 'sonu');
        drawChar(chefCard, 65, CHEF, 'smile', 'hang', 'hang', f, cp, 0.6, 0, -2.2, 0.95, 0, null, 0, null, 'chef');
      }
      break;
    }
    case 'b13': { // HOTEL MENU — sub0 board reveal, sub1 handshake, sub2 Sonu smile hold
      if (sub === 0) {
        drawChar(chefCard, 65, CHEF, 'smile', 'hang', 'hang', f, cp, 0.6, 0, -2.2, 1.0, 0, null, 0, null, 'chef');
        drawChar(sonuCard, 61, SONU, 'smile', 'hang', 'hang', f, cp, -0.6, 0, -1.6, 1.0, 0, null, 0, mouthFor(f), 'sonu');
        glintHotel.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3);
      } else if (sub === 1) {
        drawChar(chefCard, 65, CHEF, 'smile', 'reach', 'hang', f, cp, 0.6, 0, -2.2, 1.05, 0, 0.4, 0, null, 'chef');
        drawChar(sonuCard, 61, SONU, 'smile', 'reach', 'hang', f, cp, -0.6, 0, -1.6, 1.05, 0, 0.4, 0, mouthFor(f), 'sonu');
      } else {
        drawChar(sonuCard, 61, SONU, 'smile', 'hang', 'hang', f, cp, -0.6, 0, -1.6, 1.35, 0, null, 0, mouthFor(f), 'sonu'); // FIX 26 Nov LAYOUT LOCK (A): pehle scale 2.0 — smile CU me chehra frame bhar jata tha (s50); ab 1.35 + camera peeche
      }
      break;
    }
    case 'b14': { // LOOP ENDING — sub0 travelling hotel se thela, sub1 thela hotel ke saamne, sub2 two-shot, sub3 board push-in, sub4 relief smile, sub5 FREEZE
      if (sub === 0) {
        const px = 1.6 - 2.2 * u;
        drawChar(sonuCard, 61, SONU, 'smile', 'hang', 'hang', f, cp, px, 0, -1.8, 1.0, (f * 0.12) % 1, null, 0, mouthFor(f), 'sonu');
        drawChar(chefCard, 65, CHEF, 'smile', 'hang', 'hang', f, cp, px + 0.7, 0, -2.0, 1.0, (f * 0.12 + 0.5) % 1, null, 0, null, 'chef');
      } else if (sub === 1) {
        hotelThelaG.visible = true;
        drawChar(sonuCard, 61, SONU, 'smile', 'hang', 'hang', f, cp, 0.6, 0, -1.6, 1.0, 0, null, 0, mouthFor(f), 'sonu');
      } else if (sub === 2) {
        // FIX 26 Nov LAYOUT LOCK (G): hotelThelaG yahan VISIBLE NAHI — two-shot me thela ka laal banner dayein kinare
        // aadha kata dikhta tha ("SO...", t46, s53) — set leak lagta tha. Thela s52 (saamne) aur s56 (freeze) me
        // poora dikhega; two-shot sirf Sonu + chef ka hai.
        drawChar(sonuCard, 61, SONU, 'smile', 'hang', 'hang', f, cp, -0.6, 0, -1.6, 1.0, 0, null, 0, mouthFor(f), 'sonu');
        drawChar(chefCard, 65, CHEF, 'smile', 'hang', 'hang', f, cp, 0.6, 0, -2.2, 1.0, 0, null, 0, null, 'chef');
      } else if (sub === 3) {
        // FIX 26 Nov LAYOUT LOCK (G): board push-in me bhi thela nahi — banner kinare kata dikhta tha; sirf board + Sonu.
        glintHotel.material.opacity = 0.3 + 0.3 * Math.sin(f * 0.3);
        drawChar(sonuCard, 61, SONU, 'smile', 'hang', 'hang', f, cp, -0.6, 0, -1.6, 0.9, 0, null, 0, null, 'sonu');
      } else if (sub === 4) {
        drawChar(sonuCard, 61, SONU, 'relief', 'up', 'hang', f, cp, -0.6, 0, -1.6, 1.35, 0, null, 0, null, 'sonu'); // FIX 26 Nov LAYOUT LOCK (A): pehle scale 2.0 — relief CU me chehra frame bhar jata tha (s55); ab 1.35 + camera peeche
      } else {
        // FREEZE — chehra + thela + hotel board teeno frame me, kuch kata nahi
        hotelThelaG.visible = true;
        drawChar(sonuCard, 61, SONU, 'relief', 'up', 'hang', f, cp, -0.6, 0, -1.6, 1.05, 0, null, 0, null, 'sonu');
        drawChar(chefCard, 65, CHEF, 'smile', 'hang', 'hang', f, cp, 0.6, 0, -2.2, 1.0, 0, null, 0, null, 'chef');
      }
      break;
    }
  }
  updateProxiesW();
  renderer.render(scene, camera);
};
window.TOTAL = TOTAL;
window.ready = Promise.resolve();
