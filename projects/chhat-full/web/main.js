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
const pho = (o) => new THREE.MeshPhongMaterial(o); // REAL PROPS: dhatu/sheesha ki chamak (specular)
// sheeshe ki chamak — khidki ka kaanch: halka gradient + tirchhi chamak (env ka rang is par tint karta hai)
const glassTex = (() => {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, '#e8f0f4'); gr.addColorStop(0.55, '#c8d8de'); gr.addColorStop(1, '#9fb4bc');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  g.fillStyle = 'rgba(255,255,255,0.55)';
  g.beginPath(); g.moveTo(18, 128); g.lineTo(78, 0); g.lineTo(100, 0); g.lineTo(40, 128); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.28)';
  g.beginPath(); g.moveTo(62, 128); g.lineTo(112, 0); g.lineTo(122, 0); g.lineTo(72, 128); g.closePath(); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
// FIX 27 Nov REAL: skyline ki khidkiyan — flat rang ke sticker nahi, kaanch (gradient + chamak)
// lit wali halki (env rang tint karega), band wali gehri neeli-grey
function winGlassCanvas(lit) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 96;
  const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 96);
  if (lit) { gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.55, '#e8eef0'); gr.addColorStop(1, '#c8d4d8'); }
  else { gr.addColorStop(0, '#6a7a8c'); gr.addColorStop(0.55, '#3a4656'); gr.addColorStop(1, '#232c38'); }
  g.fillStyle = gr; g.fillRect(0, 0, 64, 96);
  g.fillStyle = lit ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.10)';
  g.beginPath(); g.moveTo(8, 96); g.lineTo(38, 0); g.lineTo(50, 0); g.lineTo(20, 96); g.closePath(); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const litWinTex = winGlassCanvas(true);
const darkWinTex = winGlassCanvas(false);
// charpai ki bunai — rassi ka cross-hatch (lakdi ke takhte NAHI, asli bunai)
function weaveCanvas() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#c9b489'; g.fillRect(0, 0, 256, 256);
  g.lineWidth = 7;
  for (let i = -8; i < 16; i++) {
    g.strokeStyle = i % 2 ? '#a68f66' : '#dccda6';
    g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32 + 256, 256); g.stroke();
    g.strokeStyle = i % 2 ? '#dccda6' : '#a68f66';
    g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32 - 256, 256); g.stroke();
  }
  return c;
}
// dhaari-daar kapda (kambal / taar ke kapde) — base rang + halki dhaariyan, taaki kapda dabba na lage
function stripeCanvas(base, stripeCol) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 128, 128);
  g.fillStyle = stripeCol;
  for (let y = 0; y < 128; y += 32) g.fillRect(0, y, 128, 10);
  return c;
}
// khidki ka frame (chaaron taraf) + sill — asli khidki, kaagaz-jaisi plane nahi
function winFrame(x, y, z, w, h, parent) {
  const fm = lam({ color: 0x4a3a28 });
  const sm = lam({ color: 0xd8c8a8 });
  const ft = 0.06;
  [[0, h / 2 + ft / 2, w + 2 * ft, ft], [0, -h / 2 - ft / 2, w + 2 * ft, ft], [-w / 2 - ft / 2, 0, ft, h], [w / 2 + ft / 2, 0, ft, h]].forEach(([dx, dy, fw, fh]) => {
    const f = box(fw, fh, 0.04, fm); f.position.set(x + dx, y + dy, z + 0.01); parent.add(f);
  });
  const sill = box(w + 0.18, 0.05, 0.1, sm); sill.position.set(x, y - h / 2 - 0.04, z + 0.03); parent.add(sill);
}

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
lampLight.position.set(4.2, 2.85, -1.5); scene.add(lampLight); // CHHAT: street lamp
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
// ---- Ramesh ke signature props — side tuft + hara gamchha ka latakta sira ----
function drawRameshProps(p, seed, headRot = null) {
  const Hb = T.headBlob(seed, 118, 0), hc = T.headCenter(seed);
  const cx = 300, chin = hc + Hb.b;
  p.rot = headRot;
  p.stroke([[cx + 18, hc - Hb.b * 0.95], [cx + 34, hc - Hb.b * 1.28]], 10, '#1e1a20');
  p.stroke([[cx + 30, hc - Hb.b * 0.95], [cx + 52, hc - Hb.b * 1.18]], 8, '#1e1a20');
  p.rot = null;
  const HH = 2 * Hb.b, bandY = chin + 0.22 * HH;
  p.poly([[cx - 96, bandY - 6], [cx - 72, bandY - 6], [cx - 72, bandY + 0.55 * HH], [cx - 96, bandY + 0.55 * HH]], '#3f6212', 2);
  p.stroke([[cx - 90, bandY + 0.1 * HH], [cx - 78, bandY + 0.1 * HH]], 2, '#f5e9d0');
  p.stroke([[cx - 90, bandY + 0.3 * HH], [cx - 78, bandY + 0.3 * HH]], 2, '#f5e9d0');
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
    else if (props === 'ramesh') drawRameshProps(p, seed, headRot);
  });
  card.place(x, y, z, camPos, s);
}
const sonuCard = new Card(), chefCard = new Card(), peonCard = new Card(), rameshCard = new Card();
const custAuntyCard = new Card(), custManCard = new Card(), custKidCard = new Card();
const off1Card = new Card(), off2Card = new Card();
const companyCard = new Card(), roofWomanCard = new Card();
const ALL_CARDS = [sonuCard, chefCard, peonCard, rameshCard, custAuntyCard, custManCard, custKidCard, off1Card, off2Card, companyCard, roofWomanCard];
// FRESH character — SONU (~25, NO moochh, side tuft): terracotta apron + cream kurta + safed gamchha (toga sash).
// Skin warm #b0703a (Press Raju #c88848 se gehra — alag lage).
const SONU = { tunic: '#c2410c', shirt: '#f5e9d0', skin: '#b0703a', hair: '#1e1a20', hairStyle: 'side', apron: '#c2410c', toga: '#f8fafc', togaPrint: true };
// RAMESH (~32, NO moochh, side tuft): cream kurta + olive vest + hara gamchha (toga sash).
const RAMESH = { tunic: '#6b7c3f', shirt: '#f5e9d0', skin: '#a06a3c', hair: '#1e1a20', hairStyle: 'side', toga: '#3f6212', togaPrint: false };
// CHEF (~50, lamba, WITHHELD b11 tak): safed coat + toque (card prop) + moonchh. Skin #a06a3c.
const CHEF = { tunic: '#f8fafc', shirt: '#fef3c7', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick', moustache: '#241a14', stout: true };
// PEON (office boy): halki neeli shirt, dark trouser (legCol mix se).
const PEON = { tunic: '#7aa3c2', shirt: '#f8fafc', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick' };
// CUSTOMERS (background bheed): aunty gulabi dress, office man hara kurta, kid.
const CUST_AUNTY = { tunic: '#c25a7a', shirt: '#fef3c7', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick', dress: '#c25a7a' };
const CUST_MAN = { tunic: '#5d7a4a', shirt: '#fef3c7', skin: '#9a6a42', hair: '#2b211c', hairStyle: 'thick' };
const CUST_KID = { tunic: '#d97706', shirt: '#fef3c7', skin: '#b0703a', hair: '#1e1a20', hairStyle: 'thick' };
// OFFICE WALE (b08, desk par khush): 2 men. OFF1 = subah wala office man (formal grey shirt + tiffin).
const OFF1 = { tunic: '#94a3b8', shirt: '#f8fafc', skin: '#9a6a42', hair: '#14100c', hairStyle: 'thick' };
const OFF2 = { tunic: '#8a5d3b', shirt: '#fef3c7', skin: '#a06a3c', hair: '#2b211c', hairStyle: 'thick', moustache: '#241a14' };
// COMPANY MAN (tower company ka aadmi — b09): safed formal shirt + file. Skin #9a6a42.
// ROOF WOMAN (pados ki chhat par gossip — b05): narangi dress + baalon ka jooda.
const COMPANY = { tunic: '#f8fafc', shirt: '#f8fafc', skin: '#9a6a42', hair: '#14100c', hairStyle: 'thick' };
const ROOF_WOMAN = { tunic: '#b45309', shirt: '#fef3c7', skin: '#a06a3c', hair: '#14100c', hairStyle: 'thick', dress: '#b45309' };

// ---- MUNH, beat-level (frame numbers; line shuru → khula hold ~0.5s → pause par band) ----
// Narration 100% voiceover — narration ke beech munh band + expression badle.
// b02 (hansi) aur b11 (shock 'O') me munh expr se aata hai — mouthFor wahan null deta hai.
function mouthFor(f) {
  // Chhat: narration 100% voiceover — munh band; sirf s20 (b08) ke shuru me 'o' (wonder).
  if (f >= 901 && f < 913) return 'o';
  return null;
}

// =====================================================================
// ENVS — shaam (gali) / subah (b07) / din (office) / raat (hotel)
// =====================================================================
const ENVS = {
  // Shaam: neeche garam suraj (lambi chhaon) + thanda bounce; lamp ON.
  evening: { bg: 0xe8b078, fogC: 0xe8c098, fogNear: 8, fogFar: 38, hemi: 1.0, hemiC: 0xffe0b8, hemiG: 0x8a6a4a, sun: 1.6, sunC: 0xff8a3d, sunPos: [-11, 2.6, 4], bounce: 0.35, bounceC: 0xffd9a0, expo: 1.12, sky: 'evening', lamp: 4.5, sunDisc: [-16, 4, -27], sunDiscC: 0xffb060, sunDiscR: 2.0, winC: 0xffd9a0, litWinC: 0xffd98a }, // WORLD V3: warmer+lower sun (long shadows), tighter fog (depth), stronger lamp pool
  // Subah (b07, 7 baje): halki garam subah, lamp OFF, bhaap saaf dikhe.
  morning: { bg: 0xd8e8ee, fogC: 0xd8e4e0, fogNear: 10, fogFar: 46, hemi: 1.05, hemiC: 0xdfeaf2, hemiG: 0x8a7a5a, sun: 1.7, sunC: 0xffe2bb, sunPos: [-10, 4.5, 6], bounce: 0.4, bounceC: 0x9db8d9, expo: 1.12, sky: 'morning', lamp: 0, sunDisc: [-16, 7, -27], sunDiscC: 0xfff3c8, sunDiscR: 1.6, winC: 0x9db8c4, litWinC: 0x7a8a80 }, // FIX 27 Nov REAL: subah THANDI — hemi/sun ka garam tint hata (shaam se alag mood)
  // Din (office interior): thanda ujala, khidki se sheher.
  day: { bg: 0xc8dcec, fogC: 0xd0dde6, fogNear: 12, fogFar: 48, hemi: 1.0, hemiC: 0xffe8c8, hemiG: 0x8a7a5a, sun: 1.6, sunC: 0xfff0c8, sunPos: [-9, 6, 5], bounce: 0.35, bounceC: 0x9db8d9, expo: 1.13, sky: 'day', lamp: 0, sunDisc: [-16, 9, -27], sunDiscC: 0xfff3c8, sunDiscR: 1.4, winC: 0x9db8c4, litWinC: 0x7a8a80 },
  // Raat (hotel): gehra neela + garam lamp/jhoomar; khidkiyan jalti hain.
  night: { bg: 0x2a3550, fogC: 0x3a4666, fogNear: 10, fogFar: 44, hemi: 0.7, hemiC: 0x9db8d9, hemiG: 0x3a2f28, sun: 0.5, sunC: 0x9db8d9, sunPos: [-8, 8, 4], bounce: 0.2, bounceC: 0xffd9a0, expo: 1.05, sky: 'night', lamp: 5, sunDisc: [-16, 6, -27], sunDiscC: 0xfff3c8, sunDiscR: 1.2, winC: 0xffd98a, litWinC: 0xffd98a },
  // Power-cut (b07/b08): sab andhera — khidkiyan band, street lamp bujha, sirf laal batti + phone screens.
  powercut: { bg: 0x111a2e, fogC: 0x1a2438, fogNear: 8, fogFar: 36, hemi: 0.65, hemiC: 0x9db8d9, hemiG: 0x232830, sun: 0.28, sunC: 0xa8c4e0, sunPos: [-8, 8, 4], bounce: 0.2, bounceC: 0x8a9bb8, expo: 1.1, sky: 'night', lamp: 0, sunDisc: [-16, 9, -27], sunDiscC: 0xe8eef8, sunDiscR: 1.2, winC: 0x4a5a78, litWinC: 0x232c40 }, // FIX 27 Nov v3: power-cut me PADOS ki khidkiyan bhi band — poora mohalla andhera (v2 me litWinC garam tha, pados jal raha tha); chaandni + laal batti se scene padhta hai
};
const winGlassMat = lam({ map: glassTex, color: 0x9db8c4, fog: false }); // REAL: kaanch — gradient + chamak, env rang tint karta hai
const litWinMat = lam({ map: litWinTex, color: 0x7a8a80, fog: false }); // FIX 27 Nov REAL: jalti khidki bhi kaanch — gradient + chamak, env rang tint karega
const darkWinMat = lam({ map: darkWinTex, color: 0xffffff, fog: false }); // FIX 27 Nov REAL: band khidki — gehri kaanch, flat sticker nahi
const lampBulbMat = bas({ color: 0xfff7cc, fog: false });
const lampGlow = mkGlint(4.2, 2.88, -1.5, 1.1); // CHHAT: street lamp
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
  sunGlow.material.opacity = { evening: 0.5, morning: 0.35, day: 0.3, night: 0.25, powercut: 0.3 }[name] || 0.4; // FIX 27 Nov REAL: din/subah me suraj ki chamak halki — aasmaan me bada safed taara nahi
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
// ---------- TAARE (sirf raat / power-cut me — still-10 ka khaali aasmaan bhare) ----------
const starsG = new THREE.Group(); scene.add(starsG);
{
  const starMat = new THREE.SpriteMaterial({ map: starTex, transparent: true, opacity: 0.9, depthWrite: false, fog: false });
  for (let i = 0; i < 42; i++) {
    const sp = new THREE.Sprite(starMat);
    sp.position.set(-26 + ((i * 37) % 52), 8 + ((i * 53) % 12), -26 - ((i * 29) % 4));
    sp.scale.setScalar(0.25 + ((i * 7) % 3) * 0.15);
    starsG.add(sp);
  }
  starsG.visible = false;
}
// ---------- DISTANT SKYLINE (background depth): hazy buildings peeche, har shot me ----------
const skylineG = new THREE.Group(); scene.add(skylineG);
{
  const skyCols = [0xb8a888, 0xa8685a, 0x8a9a7a, 0xc4b49a, 0x7a8a9a, 0xa89a80, 0x9a8f7a, 0xb0705a, 0x8a7f6e, 0x7a8a7a]; // FIX 27 Nov: beige dabbe nahi — eent/sage/slate mix
  const skySpots = [[-22.5, 7], [-17.5, 10.5], [-12.5, 6], [-7.5, 8.5], [-2.5, 11], [2.5, 7], [7.5, 9.5], [12.5, 6.5], [17.5, 8], [22.5, 7.5]];
  skySpots.forEach(([sx, sh], i) => {
    const b = box(5.5, sh, 1.2, lam({ map: tex(plaster(71, 36), 1, 2), color: skyCols[i % skyCols.length] }));
    b.position.set(sx, sh / 2, -19); skylineG.add(b);
    for (let r = 0; r < Math.floor(sh / 1.6); r++) for (let cix = 0; cix < 3; cix++) {
      const dark = ((r * 3 + cix + i) % 3 === 0);
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.6), dark ? darkWinMat : litWinMat);
      win.position.set(sx - 1.2 + cix * 1.2, 1.2 + r * 1.6, -18.35); skylineG.add(win);
    }
    // chhat ki pehchan — parapet / tank / antenna (har building ek jaisi nahi)
    if (i % 3 === 0) { const par = box(5.6, 0.18, 1.3, lam({ color: 0x8a7a5a })); par.position.set(sx, sh + 0.09, -19); skylineG.add(par); }
    if (i === 4) { const tk = cyl(0.45, 0.45, 0.8, lam({ map: tex(plaster(76, 40), 1, 1), color: 0x64748b }), 12); tk.position.set(sx + 1.2, sh + 0.4, -19); skylineG.add(tk); } // FIX 27 Nov REAL: weathering
    if (i === 7) { const an = cyl(0.02, 0.02, 1.8, lam({ color: 0x39434c }), 6); an.position.set(sx - 1.2, sh + 0.9, -19); skylineG.add(an); }
  });
  const silCols = [0x8a6f7a, 0x7a5f6e, 0x9a7f72, 0x6e5a6a];
  [[-24, 11], [-15, 8.5], [-6, 12], [3, 9], [12, 11.5], [21, 9.5]].forEach(([sx, sh], i) => {
    const b = box(6.5, sh, 1.0, lam({ map: tex(plaster(78, 40), 1, 2), color: silCols[i % silCols.length] })); // FIX 27 Nov REAL: door ki silhouette bhi plaster — flat dabba nahi
    b.position.set(sx, sh / 2, -27); skylineG.add(b);
  });
}
// L2 beech: makaan row z=-8 — tank + antenna + khidki (shaam/raat me jalti hain) — World V2
const midG = new THREE.Group(); scene.add(midG);
{
  [[-7.5, 4.0, 0xa8765e], [0.5, 3.6, 0x8a9a8a], [7.0, 4.6, 0xb8a888]].forEach(([mx, mh, mcol]) => { // FIX 27 Nov: eent / sage-grey / tan — alag rang
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
  const tank = cyl(0.5, 0.5, 0.9, lam({ map: tex(plaster(76, 40), 1, 1), color: 0x64748b }), 14); tank.position.set(0.5, 4.05, -8); midG.add(tank); // FIX 27 Nov REAL: weathering
  const tankBand = cyl(0.51, 0.51, 0.08, lam({ color: 0xf1f5f9 }), 14); tankBand.position.set(0.5, 4.05, -8); midG.add(tankBand);
  const tankLid = cyl(0.52, 0.52, 0.1, lam({ color: 0x475569 }), 14); tankLid.position.set(0.5, 4.55, -8); midG.add(tankLid);
  const tankKnob = cyl(0.06, 0.06, 0.08, lam({ color: 0x334155 }), 8); tankKnob.position.set(0.5, 4.62, -8); midG.add(tankKnob);
  const tankPipe = cyl(0.035, 0.035, 3.6, lam({ color: 0x475569 }), 6); tankPipe.position.set(0.5, 1.8, -7.72); midG.add(tankPipe);
  const ant = cyl(0.02, 0.02, 1.6, lam({ color: 0x39434c }), 6); ant.position.set(-7.5, 4.8, -8); midG.add(ant);
  const antBar = cyl(0.015, 0.015, 0.9, lam({ color: 0x39434c }), 6); antBar.rotation.z = Math.PI / 2; antBar.position.set(-7.5, 5.3, -8); midG.add(antBar);
  const antBar2 = cyl(0.015, 0.015, 0.6, lam({ color: 0x39434c }), 6); antBar2.rotation.z = Math.PI / 2; antBar2.position.set(-7.5, 5.0, -8); midG.add(antBar2);
  // FIX 27 Nov: beech wale makaanon par bhi chhat ka saaman — chhota tank + chhoti dish
  const midTank = cyl(0.35, 0.35, 0.6, lam({ map: tex(plaster(76, 40), 1, 1), color: 0x7a8a9a }), 12); midTank.position.set(-7.5, 4.3, -8); midG.add(midTank); // FIX 27 Nov REAL: weathering
  const midDish = new THREE.Mesh(new THREE.SphereGeometry(0.35, 14, 8, 0, Math.PI * 2, 0, 0.6), pho({ color: 0xd7dde3, shininess: 80, side: THREE.DoubleSide }));
  midDish.rotation.x = Math.PI * 0.72; midDish.position.set(7.0, 4.85, -8); midG.add(midDish);
}
function mkTree(x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s);
  const trunk = cyl(0.09, 0.13, 1.6, lam({ color: 0x6d4a2c })); trunk.position.y = 0.8; trunk.castShadow = true; g.add(trunk); // FIX 27 Nov REAL: ped ki chhaya zameen par
  const cols = [0x4a6b2f, 0x5a7a35, 0x3d5c2a];
  [[0, 2.2, 0, 0.85], [-0.55, 1.85, 0.1, 0.6], [0.55, 1.9, -0.1, 0.65], [0.1, 2.6, 0, 0.55]].forEach(([px, py, pz, r], i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), lam({ color: cols[i % 3] }));
    m.position.set(px, py, pz); m.castShadow = true; g.add(m); // FIX 27 Nov REAL: ped ki chhaya zameen par
  });
  return g;
}

// =====================================================================
// SETS — GALI (thela) | OFFICE (din) | HOTEL (raat)
// =====================================================================
// =====================================================================
// CHHAT WALA — WORLD (fresh, sirf is video ke liye)
// gali + Ramesh ka 2-manzila ghar + chhat + tower + laal batti + galla (kagaz HATA — b09 ab live)
// Coordinates: ghar centre x=-0.5, front wall z=-4.3; chhat y=5.8-5.98; tower (-0.5, 5.98, -6.2)
// =====================================================================
const galiG = new THREE.Group(); scene.add(galiG);

// ---------- helpers (sirf is duniya ke liye) ----------
function strut(x0, y0, z0, x1, y1, z1, r, mat) {
  const dir = new THREE.Vector3(x1 - x0, y1 - y0, z1 - z0);
  const len = dir.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 6), mat);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  m.castShadow = true;
  return m;
}
const ease = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };

// ---------- zameen + sadak ----------
{
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(70, 44), lam({ map: tex(dirt(31), 10, 6) }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, -2); ground.receiveShadow = true; galiG.add(ground);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(70, 4.4), lam({ map: tex(wetConcrete(33), 10, 1), color: 0xb0a894 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0.02, 2.2); road.receiveShadow = true; galiG.add(road);
  for (let i = -8; i <= 8; i++) {
    const dash = box(0.9, 0.012, 0.14, lam({ color: 0xe8e0c8 }));
    dash.position.set(i * 3.6, 0.035, 2.2); galiG.add(dash);
  }
  // footpath kinara (ghar ke saamne)
  const walk = box(70, 0.06, 1.4, lam({ map: tex(dirt(37), 10, 1), color: 0xc4b49a })); // FIX 27 Nov REAL: footpath mitti/concrete texture — flat rang ki patti nahi
  walk.position.set(0, 0.03, -0.6); walk.receiveShadow = true; galiG.add(walk);
}

// ---------- RAMESH KA GHAR (2-manzila) ----------
const housePlaster = lam({ map: tex(plaster(71, 36), 2, 1), color: 0xe8dcc0 });
const housePlaster2 = lam({ map: tex(plaster(72, 37), 2, 1), color: 0xdcc9a0 });
{
  const gf = box(5.5, 3.0, 3.0, housePlaster); gf.position.set(-0.5, 1.5, -5.8); gf.castShadow = gf.receiveShadow = true; galiG.add(gf);
  const ff = box(5.0, 2.8, 2.8, housePlaster2); ff.position.set(-0.5, 4.4, -5.8); ff.castShadow = ff.receiveShadow = true; galiG.add(ff);
  const slab = box(5.4, 0.18, 3.2, lam({ map: tex(stone(35), 2, 1), color: 0xb8a888 })); slab.position.set(-0.5, 5.89, -5.8); slab.castShadow = slab.receiveShadow = true; galiG.add(slab);
  // parapet (chhat ki munder) — har taraf
  const parM = lam({ map: tex(plaster(73, 38), 2, 1), color: 0xd8c8a8 });
  const pf = box(5.4, 0.5, 0.15, parM); pf.position.set(-0.5, 6.22, -4.28); pf.castShadow = true; galiG.add(pf);
  const pb = box(5.4, 0.5, 0.15, parM); pb.position.set(-0.5, 6.22, -7.32); pb.castShadow = true; galiG.add(pb);
  const pl = box(0.15, 0.5, 3.2, parM); pl.position.set(-3.18, 6.22, -5.8); galiG.add(pl);
  const pr = box(0.15, 0.5, 3.2, parM); pr.position.set(2.18, 6.22, -5.8); galiG.add(pr);
  // darwaza + seedhiyan
  const door = box(0.9, 2.0, 0.1, lam({ map: tex(planks(41), 1, 2), color: 0x6d3d1a })); door.position.set(-1.8, 1.0, -4.26); galiG.add(door);
  const doorKnob = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), pho({ color: 0xc9a227, shininess: 80 })); doorKnob.position.set(-1.45, 1.0, -4.19); galiG.add(doorKnob); // peetal ka handle — chamak
  const step1 = box(1.2, 0.15, 0.5, lam({ color: 0x9a8a72 })); step1.position.set(-1.8, 0.075, -4.0); step1.receiveShadow = true; galiG.add(step1);
  const step2 = box(1.2, 0.15, 0.35, lam({ color: 0x8a7a62 })); step2.position.set(-1.8, 0.22, -4.12); galiG.add(step2);
  // khidkiyan — ground floor 2 (bayein wali kagaz ki jagah aayi), first floor 2; har khidki frame + sill
  const winBar = lam({ color: 0x3a2f28 });
  const mkWin = (x, y, z, w, h) => {
    winFrame(x, y, z, w, h, galiG);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(w, h), winGlassMat);
    win.position.set(x, y, z); galiG.add(win);
    const b1 = bar2D(x - w / 2, y, x + w / 2, y, z + 0.02, winBar, 0.02); galiG.add(b1);
    const b2 = bar2D(x, y - h / 2, x, y + h / 2, z + 0.02, winBar, 0.02); galiG.add(b2);
  };
  mkWin(0.6, 1.7, -4.26, 0.7, 1.0);
  mkWin(-2.7, 1.7, -4.26, 0.7, 1.0); // kagaz hata — uski jagah asli khidki (ghar asli lage)
  mkWin(-1.6, 4.4, -4.36, 0.7, 0.9);
  mkWin(0.6, 4.4, -4.36, 0.7, 0.9);
  // paani tank (chhat, peeche bayein) + down-pipe
  const tank = cyl(0.5, 0.5, 0.9, lam({ map: tex(plaster(76, 40), 1, 1), color: 0x8a9bb8 }), 14); tank.position.set(-2.2, 6.45, -6.8); tank.castShadow = true; galiG.add(tank); // FIX 27 Nov REAL: tank par halki weathering (daag) — plastic dabba nahi
  const tankBand = cyl(0.51, 0.51, 0.08, lam({ color: 0xf1f5f9 }), 14); tankBand.position.set(-2.2, 6.45, -6.8); galiG.add(tankBand);
  const tankLid = cyl(0.52, 0.52, 0.1, lam({ color: 0x64748b }), 14); tankLid.position.set(-2.2, 6.95, -6.8); galiG.add(tankLid);
  const tankKnob = cyl(0.06, 0.06, 0.08, lam({ color: 0x334155 }), 8); tankKnob.position.set(-2.2, 7.02, -6.8); galiG.add(tankKnob);
  const tankPipe = cyl(0.035, 0.035, 3.4, lam({ color: 0x475569 }), 6); tankPipe.position.set(-2.2, 4.3, -7.28); galiG.add(tankPipe);
}

// ---------- CHARPAI (chhat par) + takiya + kambal + chai + akhbaar ----------
const swayCloths = [];
{
  const woodM = lam({ map: tex(planks(42), 2, 1), color: 0x8a5a30 });
  const frame = box(1.9, 0.08, 0.9, woodM); frame.position.set(1.2, 6.14, -5.0); frame.castShadow = true; galiG.add(frame);
  [[0.35, -5.4], [2.05, -5.4], [0.35, -4.6], [2.05, -4.6]].forEach(([lx, lz]) => {
    const leg = cyl(0.04, 0.04, 0.16, lam({ color: 0x6d3d1a }), 8); leg.position.set(lx, 6.06, lz); galiG.add(leg);
  });
  const weave = box(1.8, 0.03, 0.8, lam({ map: tex(weaveCanvas(), 3, 1), color: 0xd8c9a0 })); weave.position.set(1.2, 6.185, -5.0); galiG.add(weave); // REAL: rassi ki bunai
  const pillow = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), lam({ color: 0xf5e9d0 })); pillow.scale.set(1.15, 0.32, 0.75); pillow.position.set(0.35, 6.24, -5.0); pillow.rotation.y = 0.15; pillow.castShadow = true; galiG.add(pillow); // FIX 27 Nov: takiya charpai par, Ramesh ke sir ke neeche (leta hua) — farsh par tairta anda nahi
  const blanket = box(0.55, 0.06, 0.7, lam({ map: tex(stripeCanvas('#4a6b3a', '#d8c9a0'), 2, 1) })); blanket.position.set(1.95, 6.23, -5.0); blanket.castShadow = true; galiG.add(blanket); // FIX 27 Nov R2: kambal PAER ki taraf — torso dhakta tha, ab poora shareer dikhega
  const blanketRoll = cyl(0.035, 0.035, 0.55, lam({ color: 0x5d7a48 }), 10); blanketRoll.rotation.z = Math.PI / 2; blanketRoll.position.set(1.95, 6.26, -4.68); blanketRoll.castShadow = true; galiG.add(blanketRoll); // mudi hui kinari — asli kambal
  // chai ka glass + akhbaar (charpai ke paas, chhat par)
  const glass = cyl(0.06, 0.05, 0.14, lam({ color: 0xd97706, transparent: true, opacity: 0.85 }), 10); glass.position.set(2.0, 6.05, -4.5); galiG.add(glass);
  const paper = box(0.4, 0.015, 0.55, lam({ color: 0xf5f0dc })); paper.position.set(0.2, 5.99, -4.4); paper.rotation.y = 0.4; galiG.add(paper);
  // kapde ki taar (peeche) + 2 kapde
  const poleM = lam({ color: 0x5b4a3a });
  [[-2.6], [1.8]].forEach(([px]) => {
    const pole = cyl(0.03, 0.03, 1.0, poleM, 8); pole.position.set(px, 6.5, -6.9); galiG.add(pole);
  });
  const line = bar2D(-2.6, 6.95, 1.8, 6.95, -6.9, lam({ color: 0x2b211c }), 0.012); galiG.add(line);
  // kapde taar par — taar ke upar se mude hue (aage + peeche + fold + chimti), matlab saaf dikhe
  const clothDefs = [
    { x: -1.6, ct: tex(stripeCanvas('#f8fafc', '#a8c8d8'), 1, 1) },
    { x: -0.2, ct: tex(stripeCanvas('#d98a8a', '#f5e9d0'), 1, 1) }, // FIX 27 Nov: naram gulabi, dhaari — laal dabba nahi
  ];
  clothDefs.forEach(({ x, ct }) => {
    const cg = new THREE.Group(); cg.position.set(x, 6.95, -6.9); galiG.add(cg);
    const cm = lam({ map: ct, side: THREE.DoubleSide });
    const front = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.36), cm); front.position.set(0, -0.18, 0.018); front.castShadow = true; cg.add(front);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.36), cm); back.position.set(0, -0.18, -0.018); back.rotation.y = Math.PI; back.castShadow = true; cg.add(back);
    const fold = box(0.5, 0.04, 0.055, lam({ color: 0x8a7a62 })); fold.position.set(0, -0.01, 0); cg.add(fold);
    const pin = box(0.045, 0.1, 0.06, lam({ color: 0xd8b878 })); pin.position.set(0, 0.03, 0); cg.add(pin);
    swayCloths.push(cg);
  });
}

// ---------- TOWER (lattice mast + panels + dish + laal batti) ----------
const towerG = new THREE.Group(); scene.add(towerG);
const steelM = lam({ color: 0x5b6b7a });
const panelM = lam({ color: 0xe8e8e8 });
let dishG = null;
let redCone = null; let redCone2 = null; // FIX 27 Nov v3: light-cone mesh (module scope — renderFrame se visible hona chahiye)
let diyaG = null; let diyaLight = null; let diyaGlow = null; // FIX 27 Nov v4: diya (power-cut me darwaze ke paas jalega)
const redLight = new THREE.PointLight(0xff2222, 0, 6, 1.5); // FIX 27 Nov: distance 12→6 — laal roshni poori chhat ko gulabi na kare
const redGlow = mkGlint(-0.5, 10.6, -6.2, 0.5); // FIX 27 Nov: glow 0.8→0.5 — bada laal gola nahi
{
  const base = box(0.9, 0.12, 0.9, lam({ color: 0x475569 })); base.position.set(-0.5, 6.04, -6.2); base.castShadow = true; towerG.add(base);
  const hw = (y) => 0.35 - 0.25 * (y - 6.1) / 3.9;
  const corners = (y) => [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => [-0.5 + sx * hw(y), y, -6.2 + sz * hw(y)]);
  // 4 khambe
  corners(6.1).forEach(([x0, y0, z0], i) => {
    const [x1, , z1] = corners(10.0)[i];
    towerG.add(strut(x0, y0, z0, x1, 10.0, z1, 0.045, steelM));
  });
  // rings + diagonals (2 sections)
  [7.4, 8.6, 9.8].forEach((y) => {
    const c = corners(y);
    for (let i = 0; i < 4; i++) {
      const [x0, , z0] = c[i], [x1, , z1] = c[(i + 1) % 4];
      towerG.add(strut(x0, y, z0, x1, y, z1, 0.02, steelM));
    }
  });
  [[6.1, 8.0], [8.0, 10.0]].forEach(([y0, y1]) => {
    const c0 = corners(y0), c1 = corners(y1);
    for (let i = 0; i < 4; i++) {
      const [x0, , z0] = c0[i], [x1, , z1] = c1[(i + 1) % 4];
      towerG.add(strut(x0, y0, z0, x1, y1, z1, 0.018, steelM));
    }
  });
  // antenna panels (3 sector — asli tower) + frame + bracket
  const panelFrameM = lam({ color: 0x8a97a3 });
  const mkPanel = (x, y, z, ry) => {
    const fr = box(0.52, 1.16, 0.03, panelFrameM); fr.position.set(x, y, z); fr.rotation.y = ry; towerG.add(fr);
    const p = box(0.45, 1.1, 0.06, panelM); p.position.set(x, y, z); p.rotation.y = ry; p.castShadow = true; towerG.add(p);
    const br = box(0.08, 0.05, 0.26, steelM); br.position.set(-0.5 + (x + 0.5) * 0.5, y, -6.2 + (z + 6.2) * 0.5); br.rotation.y = ry; towerG.add(br);
  };
  mkPanel(-0.5, 9.5, -6.02, 0);
  mkPanel(-0.5, 9.5, -6.38, 0);
  mkPanel(-0.14, 9.5, -6.2, Math.PI / 2); // teesra sector (side)
  // dish — ASLI parabolic (LatheGeometry katora + rim + feed arm + horn), chaandi-dhatu, flat plate nahi
  dishG = new THREE.Group(); dishG.position.set(-1.0, 9.0, -5.95); towerG.add(dishG); // FIX 27 Nov R2: laal batti se door (gulabi wash kam) + mount arm se bandha
  towerG.add(strut(-0.66, 9.0, -6.0, -1.0, 9.0, -5.95, 0.03, steelM)); // dish ka mount arm — mast se juda, hawa me nahi
  const dishPts = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12; dishPts.push(new THREE.Vector2(0.46 * t, 0.3 * t * t)); }
  const dish = new THREE.Mesh(new THREE.LatheGeometry(dishPts, 24), pho({ color: 0xd7dde3, shininess: 90, side: THREE.DoubleSide }));
  dish.position.y = 0.25; dishG.add(dish);
  const dishRim = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.02, 8, 28), pho({ color: 0xd7dde3, shininess: 90 }));
  dishRim.rotation.x = Math.PI / 2; dishRim.position.y = 0.55; dishG.add(dishRim);
  const dishFeed = cyl(0.022, 0.022, 0.32, steelM, 8); dishFeed.position.set(0, 0.41, 0); dishG.add(dishFeed);
  const dishHorn = cyl(0.05, 0.04, 0.08, pho({ color: 0xd7dde3, shininess: 90 }), 10); dishHorn.position.set(0, 0.59, 0); dishG.add(dishHorn);
  dishG.rotation.x = 0.5; // katora upar-aage (camera ki taraf)
  // laal batti (signature prop) — housing + sphere + glow + red point light
  const mastTop = cyl(0.03, 0.03, 0.5, steelM, 6); mastTop.position.set(-0.5, 10.3, -6.2); towerG.add(mastTop);
  const lampHouse = cyl(0.07, 0.085, 0.12, lam({ color: 0x1f2937 }), 8); lampHouse.position.set(-0.5, 10.5, -6.2); towerG.add(lampHouse);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), bas({ color: 0xff2a2a, fog: false }));
  bulb.position.set(-0.5, 10.6, -6.2); towerG.add(bulb);
  const lampCap = cyl(0.05, 0.062, 0.03, lam({ color: 0x1f2937 }), 8); lampCap.position.set(-0.5, 10.66, -6.2); towerG.add(lampCap);
  redLight.position.set(-0.5, 10.7, -6.2); scene.add(redLight);
  // FIX 27 Nov v3: LIGHT-CONE — laal batti se charpai tak halka laal shankhu (sirf s14b me dikhega)
  redCone = new THREE.Mesh(
    new THREE.ConeGeometry(1.6, 4.91, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xff3020, transparent: true, opacity: 0.10, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false, fog: false })
  );
  redCone.position.set(0.35, 8.375, -5.6);
  redCone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(-1.7, 4.45, -1.2).normalize());
  redCone.visible = false;
  scene.add(redCone);
  // FIX 27 Nov REAL: cone ka kinara naram — bahar ek chauda halka cone (feather), andar wala gehra
  redCone2 = new THREE.Mesh(
    new THREE.ConeGeometry(2.2, 4.91, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xff3020, transparent: true, opacity: 0.04, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false, fog: false })
  );
  redCone2.position.copy(redCone.position);
  redCone2.quaternion.copy(redCone.quaternion);
  redCone2.visible = false;
  scene.add(redCone2);
  // guy wires (3) — asli tower ki taar, chhat se bandhi
  const wireM = lam({ color: 0x55504a });
  towerG.add(strut(-0.5, 9.0, -6.2, 3.0, 6.5, -7.0, 0.008, wireM)); // FIX v4: peeche-dayein chhat-kone par — charpai/chehre ke upar se nahi (v3 me taar sote Ramesh ke upar se guzarta tha)
  towerG.add(strut(-0.5, 9.0, -6.2, -3.2, 5.95, -4.6, 0.008, wireM));
  towerG.add(strut(-0.5, 9.0, -6.2, -0.5, 5.95, -7.4, 0.008, wireM));
}

// ---------- FLANKING HOUSES (gali ki gehrai) ----------
{
  const mkHouse = (x, w, h, col, z = -5.5) => {
    const b = box(w, h, 2.5, lam({ map: tex(plaster(74, 39), 1, 1), color: col }));
    b.position.set(x, h / 2, z); b.castShadow = b.receiveShadow = true; galiG.add(b);
    const par = box(w + 0.1, 0.18, 2.6, lam({ color: 0x8a7a5a })); par.position.set(x, h + 0.09, z); galiG.add(par);
    [-w / 4, w / 4].forEach((dx) => {
      winFrame(x + dx, 1.8, z + 1.26, 0.6, 0.7, galiG);
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.7), winGlassMat);
      win.position.set(x + dx, 1.8, z + 1.26); galiG.add(win);
    });
    return b;
  };
  mkHouse(-5.6, 4.0, 3.4, 0xb98a6a); // FIX 27 Nov: terracotta — bayein makaan
  mkHouse(4.4, 4.5, 4.2, 0x9aa88a); // FIX 27 Nov: sage — dayein makaan
  // AC box (dayein makaan ki deewaar par)
  const acBox = box(0.55, 0.38, 0.2, lam({ color: 0xd8dce0 })); acBox.position.set(5.6, 2.6, -4.18); acBox.castShadow = true; galiG.add(acBox);
  const acFan = cyl(0.13, 0.13, 0.03, lam({ color: 0x64748b }), 12); acFan.rotation.x = Math.PI / 2; acFan.position.set(5.6, 2.6, -4.07); galiG.add(acFan);
  // ped + taar (gali)
  galiG.add(mkTree(-4.2, -1.0, 1.1));
  galiG.add(mkTree(5.2, -2.0, 1.0));
  galiG.add(mkTree(-6.8, -3.0, 1.3));
  const wireM = lam({ color: 0x55504a });
  galiG.add(bar2D(-5.5, 4.4, 2.5, 4.6, -4.2, wireM, 0.010));
  galiG.add(bar2D(-5.0, 5.0, 2.0, 5.2, -2.8, wireM, 0.008));
}

// ---------- GHAR KE SAAMNE — zameen se jude props (matke, tulsi, jhaadu) ----------
{
  const clayM = lam({ color: 0xa85f3a });
  [[-2.75, -4.05, 0.24], [-2.42, -3.92, 0.19]].forEach(([mx, mz, mr]) => {
    const pot = new THREE.Mesh(new THREE.SphereGeometry(mr, 14, 10), clayM);
    pot.scale.y = 0.85; pot.position.set(mx, mr * 0.85, mz); pot.castShadow = true; galiG.add(pot);
    const neck = cyl(mr * 0.45, mr * 0.55, 0.08, clayM, 10); neck.position.set(mx, mr * 1.62, mz); galiG.add(neck);
  });
  const tulsiPot = cyl(0.13, 0.1, 0.22, clayM, 10); tulsiPot.position.set(-0.9, 0.11, -4.1); tulsiPot.castShadow = true; galiG.add(tulsiPot);
  [[0, 0.32, 0], [0.07, 0.28, 0.03], [-0.07, 0.28, -0.03]].forEach(([dx, dy, dz]) => {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), lam({ color: 0x4a6b2f }));
    leaf.position.set(-0.9 + dx, dy, -4.1 + dz); galiG.add(leaf);
  });
  // FIX 27 Nov v4: bada gamla (darwaze ke dayein, deewaar se) + diya (power-cut me jalega — s17b ka andhera-bayein hissa bharega)
  const bigPot = cyl(0.17, 0.13, 0.32, clayM, 12); bigPot.position.set(-0.35, 0.16, -3.95); bigPot.castShadow = true; galiG.add(bigPot);
  [[0, 0.42, 0], [0.09, 0.36, 0.04], [-0.09, 0.36, -0.04]].forEach(([dx, dy, dz]) => {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), lam({ color: 0x3f6128 }));
    leaf.position.set(-0.35 + dx, dy, -3.95 + dz); galiG.add(leaf);
  });
  diyaG = new THREE.Group(); diyaG.position.set(-1.3, 0, -3.7); galiG.add(diyaG);
  const diyaBowl = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 10), clayM);
  diyaBowl.scale.y = 0.45; diyaBowl.position.y = 0.04; diyaG.add(diyaBowl);
  const diyaFlame = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.09, 8), bas({ color: 0xffc861, fog: false }));
  diyaFlame.position.y = 0.12; diyaG.add(diyaFlame);
  diyaLight = new THREE.PointLight(0xff9a3d, 0, 3.5, 1.8); diyaLight.position.set(-1.3, 0.35, -3.7); scene.add(diyaLight);
  diyaG.visible = false;
  diyaGlow = mkGlint(-1.3, 0.16, -3.7, 0.55); // FIX 27 Nov REAL: diye ki lau ka glow — power-cut me garam roshni ka kendra
  // FIX 27 Nov R2: jhaadu HATA — peela cone party-hat lagta tha; matke + tulsi hi kaafi hain
}

// ---------- STREET LAMP (gali ka khamba — shaam/raat me jalega, power-cut me bujha) ----------
{
  const pole = cyl(0.05, 0.07, 3.0, lam({ color: 0x374151 }), 10); pole.position.set(4.6, 1.5, -1.5); pole.castShadow = true; galiG.add(pole);
  const arm = bar2D(4.6, 2.95, 4.2, 2.95, -1.5, lam({ color: 0x374151 }), 0.03); galiG.add(arm);
  const head = box(0.22, 0.1, 0.22, lam({ color: 0x1f2937 })); head.position.set(4.2, 2.92, -1.5); galiG.add(head);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), lampBulbMat); bulb.position.set(4.2, 2.85, -1.5); galiG.add(bulb);
}
// FIX 27 Nov REAL: street lamp ka garam light-cone — shaam/raat me sadak par roshni ka shankhu (sirf lamp ON par)
const lampCone = new THREE.Mesh(
  new THREE.ConeGeometry(0.95, 2.9, 20, 1, true),
  new THREE.MeshBasicMaterial({ color: 0xffc27a, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false, fog: false })
);
lampCone.position.set(4.2, 1.45, -1.5); lampCone.visible = false; scene.add(lampCone);

// ---------- BOARDS (in-scene text hi) ----------
// FIX 27 Nov: parapet board HATA — "TOWER KIRAYA / ₹30,000" ek hi frame me do baar tha;
// ab sirf deewaar wala counter board "MAHINE KA GALLA ₹30,000" rahega.
// ---------- GALLA (mez + tin box + dhakkan + notes) ----------
const gallaG = new THREE.Group(); scene.add(gallaG);
let gallaLid = null;
const notesHeapG = new THREE.Group(); scene.add(notesHeapG);
{
  const top = box(1.2, 0.08, 0.7, lam({ map: tex(planks(44), 2, 1), color: 0x8a5a30 })); top.position.set(1.6, 0.85, -3.2); top.castShadow = top.receiveShadow = true; gallaG.add(top);
  [[1.1, -3.5], [2.1, -3.5], [1.1, -2.9], [2.1, -2.9]].forEach(([lx, lz]) => {
    const leg = cyl(0.04, 0.04, 0.85, lam({ color: 0x6d3d1a }), 8); leg.position.set(lx, 0.425, lz); gallaG.add(leg);
  });
  const tin = box(0.55, 0.35, 0.4, pho({ color: 0x9aa8b8, shininess: 70 })); tin.position.set(1.6, 1.05, -3.2); tin.castShadow = true; gallaG.add(tin); // REAL: dhatu ki peti — chamak
  const tinBand = box(0.57, 0.05, 0.42, pho({ color: 0x64748b, shininess: 60 })); tinBand.position.set(1.6, 1.05, -3.2); gallaG.add(tinBand);
  const tinLatch = box(0.08, 0.12, 0.03, pho({ color: 0x475569, shininess: 80 })); tinLatch.position.set(1.6, 1.02, -2.99); gallaG.add(tinLatch); // kundli — asli cash-box
  const lidGeo = new THREE.BoxGeometry(0.55, 0.04, 0.4); lidGeo.translate(0, 0, 0.2);
  gallaLid = new THREE.Mesh(lidGeo, lam({ color: 0x9aa8b8, emissive: 0x232a33 })); // FIX 27 Nov REAL: dhakkan LIT tin — roshni ka asar + halka emissive (raat me kaala na ho); v5b ka Basic flat slab lagta tha (f1123)
  gallaLid.position.set(1.6, 1.24, -3.4); gallaLid.castShadow = true; gallaG.add(gallaLid);
  const lidHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 8), pho({ color: 0x94a3b8, shininess: 80 })); lidHandle.rotation.z = Math.PI / 2; lidHandle.position.set(0, 0.045, 0.28); gallaLid.add(lidHandle); // dhakkan ka handle — dhakkan ke saath khulta hai
  // andar notes (dhakkan khulte hi dikhen)
  for (let i = 0; i < 3; i++) {
    const n = box(0.28, 0.02, 0.14, lam({ color: 0xd9f99d }));
    n.position.set(1.6 - 0.08 + i * 0.08, 1.22 + i * 0.02, -3.2); n.rotation.y = (i - 1) * 0.3; gallaG.add(n);
  }
  // note ka dher (mez par)
  for (let i = 0; i < 5; i++) {
    const n = box(0.28, 0.02, 0.14, lam({ color: i % 2 ? 0xbef264 : 0xd9f99d }));
    n.position.set(1.05, 0.9 + i * 0.022, -3.2); n.rotation.y = (i - 2) * 0.25; n.castShadow = true; notesHeapG.add(n);
  }
}
// ---------- COUNTER BOARD (galla) — "MAHINE KA GALLA ₹30,000" gin kar badhta hai + HOLD ----------
const counterCanvas = document.createElement('canvas'); counterCanvas.width = 512; counterCanvas.height = 360;
const counterCtx = counterCanvas.getContext('2d');
const counterTex = new THREE.CanvasTexture(counterCanvas); counterTex.colorSpace = THREE.SRGBColorSpace;
function drawCounter(v) {
  const g = counterCtx, w = 512, h = 360;
  g.fillStyle = '#14532d'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#fbbf24'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16);
  g.fillStyle = '#fef3c7'; g.font = 'bold 44px Arial'; g.textAlign = 'center';
  g.fillText('MAHINE KA GALLA', w / 2, 78);
  const val = Math.round(v / 500) * 500;
  g.fillStyle = '#fbbf24'; g.font = 'bold 108px Arial';
  g.fillText('₹' + val.toLocaleString('en-IN'), w / 2, 218);
  g.fillStyle = '#bbf7d0'; g.font = 'bold 40px Arial';
  g.fillText('HAR MAHINA', w / 2, 300);
  counterTex.needsUpdate = true;
}
{
  const cb = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.5), lam({ map: counterTex }));
  cb.position.set(1.85, 2.3, -4.24); galiG.add(cb); // FIX 27 Nov v2: y 2.0→2.3 — s15 wide me 'HAR MAHINA' frame se kat raha tha
}

// ---------- DEEWAR GHADI (samay board se, bola nahi — 6 baje: shaam aur subah dono par chalta hai) ----------
{
  const clockTex = textBoard(256, 256, (g, w, h) => {
    g.fillStyle = '#f8fafc'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
    g.strokeStyle = '#1f2937'; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.stroke();
    g.fillStyle = '#1f2937'; g.font = 'bold 44px Arial'; g.textAlign = 'center';
    g.fillText('12', 128, 62); g.fillText('3', 210, 142); g.fillText('6', 128, 222); g.fillText('9', 46, 142);
    g.strokeStyle = '#1f2937'; g.lineWidth = 9; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 178); g.stroke(); // ghante wali — 6 ki taraf
    g.lineWidth = 6; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 82); g.stroke(); // minute wali — 12 ki taraf
    g.fillStyle = '#dc2626'; g.beginPath(); g.arc(128, 128, 8, 0, 7); g.fill();
  });
  const clk = new THREE.Mesh(new THREE.CircleGeometry(0.22, 24), lam({ map: clockTex }));
  clk.position.set(1.7, 3.25, -4.36); galiG.add(clk); // FIX 27 Nov REAL: ghadi y 3.6→3.25 — s25a me top edge par aadhi kat rahi thi; ab poori dikhegi (s24a/s03a/s15b me bhi poori)
  const clkRim = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 8, 24), lam({ color: 0x334155 }));
  clkRim.position.set(1.7, 3.25, -4.35); galiG.add(clkRim);
}

// ---------- PHONES (screen par "4G + full signal") ----------
const phoneScreenTex = textBoard(256, 480, (g, w, h) => {
  g.fillStyle = '#0f172a'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#4ade80';
  [0, 1, 2, 3].forEach((i) => g.fillRect(36 + i * 26, 120 - i * 26, 18, 30 + i * 26));
  g.fillStyle = '#ffffff'; g.font = 'bold 84px Arial'; g.textAlign = 'center';
  g.fillText('4G', w / 2, 230);
  g.fillStyle = '#4ade80'; g.font = 'bold 28px Arial';
  g.fillText('NETWORK FULL', w / 2, 300);
  g.strokeStyle = '#ffffff'; g.lineWidth = 4; g.strokeRect(88, 340, 80, 44);
  g.fillStyle = '#4ade80'; g.fillRect(92, 344, 56, 36);
  // sheeshe ki chamak — tirchhi halki lakeer (asli screen)
  g.fillStyle = 'rgba(255,255,255,0.10)';
  g.beginPath(); g.moveTo(0, 480); g.lineTo(180, 0); g.lineTo(230, 0); g.lineTo(50, 480); g.closePath(); g.fill();
});
const phoneScreenMat = bas({ map: phoneScreenTex });
const phoneScreenDarkMat = bas({ color: 0x1f2937 });
function mkPhone() {
  const g = new THREE.Group();
  const body = box(0.16, 0.32, 0.03, pho({ color: 0x1f2937, shininess: 70 })); g.add(body); // dhatu body
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.28), phoneScreenMat);
  scr.position.z = 0.017; g.add(scr); g.userData.screen = scr;
  return g;
}
const phoneA = mkPhone(); scene.add(phoneA);
const phoneB = mkPhone(); scene.add(phoneB);

// ---------- B09 PROPS (live — kagaz ki jagah): file + patla/mota note-stack + tiffin ----------
// file: company man ke haath me — safed kagaz, lines + laal stamp (count slip, deewaar par board nahi)
const fileTex = textBoard(256, 340, (g, w, h) => {
  g.fillStyle = '#f8fafc'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#94a3b8'; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = '#334155';
  for (let i = 0; i < 7; i++) g.fillRect(28, 40 + i * 30, 200 - (i % 3) * 30, 8);
  g.strokeStyle = '#dc2626'; g.lineWidth = 5; g.beginPath(); g.arc(190, 260, 34, 0, 7); g.stroke();
  g.fillStyle = '#dc2626'; g.font = 'bold 22px Arial'; g.textAlign = 'center'; g.fillText('OK', 190, 268);
});
const fileProp = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.34), lam({ map: fileTex, side: THREE.DoubleSide }));
fileProp.visible = false; scene.add(fileProp);
// note-stack: patla (pehle — 3 note) vs mota (ab — 10 note) — paisa BADHTA dikhe, kagaz par hisaab nahi
function mkStack(thick) {
  const g = new THREE.Group();
  const n = thick ? 10 : 3;
  for (let i = 0; i < n; i++) {
    const note = box(0.28, 0.018, 0.14, lam({ color: i % 2 ? '#bef264' : '#d9f99d' }));
    note.position.y = i * 0.019; note.rotation.y = (i % 3 - 1) * 0.08; g.add(note);
  }
  const band = box(0.06, n * 0.019, 0.15, lam({ color: '#92400e' })); band.position.y = (n * 0.019) / 2; g.add(band);
  g.visible = false; scene.add(g); return g;
}
const thinStack = mkStack(false); // pehle — patla
const thickStack = mkStack(true); // ab — mota
// tiffin (s27 — office wala): steel ke 2 dabbe + handle, chamak
const tiffinProp = new THREE.Group();
{
  const steel = pho({ color: 0xd7dde3, shininess: 90 });
  const t1 = cyl(0.09, 0.09, 0.09, steel, 12); t1.position.y = 0.045; tiffinProp.add(t1);
  const t2 = cyl(0.09, 0.09, 0.09, steel, 12); t2.position.y = 0.135; tiffinProp.add(t2);
  const tSep = cyl(0.092, 0.092, 0.015, lam({ color: 0x475569 }), 12); tSep.position.y = 0.09; tiffinProp.add(tSep); // FIX 27 Nov: do dabbon ke beech patli kaali patti — separation saaf
  const th = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 12, Math.PI), steel); th.position.y = 0.19; tiffinProp.add(th);
  tiffinProp.visible = false; scene.add(tiffinProp);
}

// ---------- MOTES (dhool, gali me) ----------
const motes = [];
{
  const moteMat = new THREE.SpriteMaterial({ map: FX.puffTexture([[0, 'rgba(255,240,200,0.7)'], [1, 'rgba(255,240,200,0)']]), transparent: true, opacity: 0.35, depthWrite: false });
  for (let i = 0; i < 8; i++) {
    const sp = new THREE.Sprite(moteMat);
    sp.position.set(-3 + i * 0.9, 0.6 + (i % 3) * 0.7, -1.5 + (i % 2) * 1.5);
    sp.scale.setScalar(0.25 + (i % 3) * 0.1);
    scene.add(sp); motes.push(sp);
  }
}
// ---------- PAKSHI (subah) ----------
const bird = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.07), bas({ color: 0x1f2937, side: THREE.DoubleSide }));
bird.visible = false; scene.add(bird);
// ---------- board chamak ----------
const glintTower = mkGlint(-0.5, 9.6, -6.0, 0.7);
const glintGalla = mkGlint(2.05, 2.48, -4.2, 0.4); // FIX v5: board ke upar-dayein kone par + chhota — ₹ ke upar flare nahi (s25b me ₹ par tha)

// ---------- character shadow proxies (y = card ki y — chhat wale bhi chhat par) ----------
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
      p.position.set(c.mesh.position.x, c.mesh.position.y, c.mesh.position.z);
      p.scale.setScalar(c.mesh.scale.x || 1);
    } else p.visible = false;
  });
};

// Ramesh sota hua — charpai par LETA (khada nahi): card 90° letao (sir takiye ki taraf, -X),
// blob lamba karo; proxy bhi letao (rotation updateProxiesW me nahi badalti, isliye yahan set karo).
function drawLyingRamesh(f, cp, mouth) {
  drawChar(rameshCard, 11, RAMESH, 'snore', 'hang', 'hang', f, cp, 2.2, 6.24, -5.0, 1.0, 0, null, 0, mouth, 'ramesh');
  rameshCard.mesh.rotation.set(0, 0, Math.PI / 2);
  rameshCard.blob.position.set(1.2, 6.22, -5.0);
  rameshCard.blob.scale.set(1.7, 1, 1);
  proxiesW[3].rotation.z = Math.PI / 2;
}

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
  lampCone.visible = (env.lamp || 0) > 0; // FIX 27 Nov REAL: lamp ka light-cone sirf jab lamp jal raha ho (shaam/raat, power-cut me nahi)
  for (const k in skyMeshes) skyMeshes[k].visible = (k === env.sky);
  clouds.forEach((sp, i) => {
    sp.position.x = -22 + i * 7.5 + Math.sin(f * 0.004 + i) * 0.6;
  });
  farClouds.forEach((sp, i) => { sp.position.x = -18 + i * 12 + Math.sin(f * 0.002 + i * 2) * 0.8; });
  motes.forEach((sp, i) => {
    sp.visible = (shot.set === 'gali' && shot.env !== 'night' && shot.env !== 'powercut');
    sp.position.y += Math.sin(f * 0.05 + i * 2.1) * 0.0012;
    sp.position.x += Math.cos(f * 0.02 + i) * 0.0009;
  });
  skylineG.visible = true;
  midG.visible = true;
  galiG.visible = true;
  towerG.visible = true;
  ALL_CARDS.forEach((c) => c.hide());
  proxiesW.forEach((p) => { p.rotation.z = 0; }); // leta proxy ka rotation har frame reset — sirf sota Ramesh letaata hai
  const cp = cam.pos;
  const bu = beatU(f);
  const mouth = mouthFor(f);
  // ---- laal batti — hamesha jalti hai; raat me tez ----
  const isNight = (shot.env === 'night' || shot.env === 'powercut');
  const pulse = 0.75 + 0.25 * Math.sin(f * 0.3);
  redLight.intensity = shot.env === 'powercut' ? 1.8 * pulse : (isNight ? 1.0 * pulse : 1.2 * pulse); // FIX 27 Nov v2: power-cut me laal batti sabse tez — wahi ek roshni jo jal rahi hai
  redGlow.material.opacity = 0.25 + 0.15 * Math.sin(f * 0.3); // FIX 27 Nov: 0.35+0.2 → halka glow, gola nahi
  redCone.visible = (id === 's14b'); // FIX 27 Nov v3: light-cone sirf s14b (raat me akela sota Ramesh)
  redCone2.visible = (id === 's14b'); // FIX 27 Nov REAL: feather cone bhi sirf s14b
  const diyaOn = (shot.env === 'powercut'); // FIX 27 Nov v4: diya sirf power-cut me — bijli gayi to diya jala
  diyaG.visible = diyaOn;
  diyaLight.intensity = diyaOn ? (0.85 + 0.15 * Math.sin(f * 0.5)) : 0; // halki flicker — asli lau
  diyaGlow.material.opacity = diyaOn ? (0.45 + 0.15 * Math.sin(f * 0.5)) : 0; // FIX 27 Nov REAL: lau ka glow flicker ke saath
  starsG.visible = isNight; // taare sirf raat / power-cut me (still-10: khaali aasmaan nahi)
  cloudMat.opacity = isNight ? 0.22 : 0.8; // FIX 27 Nov: raat me baadal halke
  farCloudMat.opacity = isNight ? 0.15 : 0.45;
  const cloudTint = { evening: 0xffd9b0, morning: 0xf2f6fa, day: 0xffffff, night: 0x8a94b8, powercut: 0x6a7488 }[shot.env] || 0xffffff; // FIX 27 Nov REAL: baadal bhi mood ke rang me — shaam me garam, raat me neele
  cloudMat.color.set(cloudTint); farCloudMat.color.set(cloudTint);
  // ---- dish halka ghumta hai, kapde halke hilte hain ----
  dishG.rotation.y = 0.3 + Math.sin(f * 0.008) * 0.2;
  swayCloths.forEach((cl, i) => { cl.rotation.x = Math.sin(f * 0.05 + i * 1.7) * 0.06; });
  // ---- pakshi sirf subah ----
  bird.visible = (id === 's26a' || id === 's26b');
  if (bird.visible) { bird.position.set(-10 + (f - 1189) * 0.25, 8.5 + Math.sin(f * 0.1) * 0.2, -8); bird.rotation.z = 0.2; }
  // ---- defaults ----
  phoneA.visible = false; phoneB.visible = false;
  fileProp.visible = false; thinStack.visible = false; thickStack.visible = false; tiffinProp.visible = false;
  gallaLid.rotation.x = 0;
  [glintTower, glintGalla].forEach((g) => { g.material.opacity = 0; });
  // ---- galla counter: b10 me gin kar badhta hai, baaki hamesha ₹30,000 ----
  if (shot.beat === 'b10') {
    const cp09 = clamp(bu / 0.75, 0, 1);
    drawCounter(30000 * ease(cp09));
  } else drawCounter(30000);

  // ---- beat dispatch ----
  switch (shot.beat) {
    case 'b01': {
      if (id === 's03a' || id === 's03b') drawLyingRamesh(f, cp, mouth); // FIX 27 Nov: charpai par LETA, aankhein band (snore) — khada + spiral nahi
      break;
    }
    case 'b02': {
      if (id === 's04a' || id === 's04b') glintTower.material.opacity = 0.7;
      if (id === 's05a' || id === 's05b') {
        drawChar(peonCard, 21, PEON, 'smile', 'reach', 'hang', f, cp, 1.2, 0, -0.8, 1.0, 0, null, 0, mouth);
        phoneA.visible = true; phoneA.position.set(1.48, 1.12, -0.88); phoneA.rotation.set(0, 0.5, 0); phoneA.scale.setScalar(1.0); // FIX 27 Nov: phone haath par
        phoneA.userData.screen.material = phoneScreenMat;
      }
      break;
    }
    case 'b03': {
      if (id === 's06a' || id === 's06b') drawChar(rameshCard, 11, RAMESH, 'smile', 'up', 'hang', f, cp, 0.2, 5.98, -5.2, 1.0, 0, null, 0, mouth, 'ramesh');
      if (id === 's07a' || id === 's07b') drawChar(rameshCard, 11, RAMESH, 'smile', 'point', 'hang', f, cp, 0.2, 5.98, -5.2, 1.0, 0, null, 0, mouth, 'ramesh');
      break;
    }
    case 'b04': {
      if (id === 's08a' || id === 's08b') drawLyingRamesh(f, cp, mouth); // FIX 27 Nov: din bhar sota — LETA
      if (id === 's09a' || id === 's09b') glintTower.material.opacity = 0.7;
      if (id === 's10a' || id === 's10b') drawLyingRamesh(f, cp, mouth); // FIX 27 Nov: sota + tower, dopahar
      break;
    }
    case 'b05': {
      if (id === 's11a' || id === 's11b') {
        drawChar(custAuntyCard, 31, CUST_AUNTY, 'laugh', 'point', 'hang', f, cp, 1.4, 0, 2.2, 1.0, 0, null, 0, mouth);
        drawChar(off2Card, 32, OFF2, 'laugh', 'hang', 'hang', f, cp, 1.9, 0, 1.2, 1.0, 0, null, 0, mouth);
        drawChar(custKidCard, 33, CUST_KID, 'laugh', 'hang', 'hang', f, cp, 2.4, 0, 0.2, 0.9, 0, null, 0, mouth);
        drawChar(roofWomanCard, 35, ROOF_WOMAN, 'laugh', 'point', 'hang', f, cp, -5.6, 3.4, -4.6, 0.95, 0, null, 0, mouth); // pados ki chhat par aurat — mohalla upar se
      }
      if (id === 's12a' || id === 's12b') {
        drawChar(custAuntyCard, 31, CUST_AUNTY, 'laugh', 'point', 'hang', f, cp, 1.4, 0, 2.2, 1.0, 0, null, 0, mouth);
      }
      if (id === 's13a' || id === 's13b') drawChar(rameshCard, 11, RAMESH, 'grin', 'up', 'up', f, cp, 0.2, 5.98, -5.2, 1.0, 0, null, 1, mouth, 'ramesh');
      break;
    }
    case 'b06': {
      if (id === 's14b') drawLyingRamesh(f, cp, mouth); // v2: LIGHT-CONE — raat me akele sota Ramesh, sirf laal batti
      break;
    }
    case 'b07': {
      if (id === 's16a' || id === 's16b') {
        drawChar(peonCard, 21, PEON, 'nervous', 'hang', 'hang', f, cp, 0.4, 0, -0.6, 1.0, 0, null, 0, mouth); // intzaar/pareshani — bijli gayi, phone band
        phoneB.visible = true; phoneB.position.set(0.65, 1.12, -0.7); phoneB.rotation.set(0, 0.5, 0); phoneB.scale.setScalar(0.85); // FIX 27 Nov: phone latke haath par
        phoneB.userData.screen.material = phoneScreenDarkMat; // screen band — bijli gayi
      }
      break;
    }
    case 'b08': {
      if (id === 's19a' || id === 's19b') {
        drawChar(peonCard, 21, PEON, 'shock', 'reach', 'hang', f, cp, 0.4, 0, -0.6, 1.0, 0, null, 0, mouth);
        drawChar(custManCard, 34, CUST_MAN, 'wonder', 'reach', 'hang', f, cp, 1.0, 0, -0.9, 1.0, 0, null, 0, mouth);
        phoneA.visible = true; phoneA.position.set(0.66, 1.2, -0.62); phoneA.rotation.set(0, 0.5, 0); phoneA.scale.setScalar(1.0); // FIX 27 Nov: phone uthe haath par
        phoneA.userData.screen.material = phoneScreenMat;
        phoneB.visible = true; phoneB.position.set(1.28, 1.2, -0.88); phoneB.rotation.set(0, 0.4, 0); phoneB.scale.setScalar(1.0); // FIX 27 Nov: phone uthe haath par
        phoneB.userData.screen.material = phoneScreenMat;
      }
      if (id === 's19b') {
        drawChar(custAuntyCard, 31, CUST_AUNTY, 'shock', 'hang', 'hang', f, cp, 1.55, 0, -0.35, 1.0, 0, null, 0, mouth); // v2: rival graph — jo b05 me hasi thi, ab shock me
      }
      if (id === 's20a' || id === 's20b') drawChar(rameshCard, 11, RAMESH, 'wonder', 'point', 'hang', f, cp, 0.2, 5.98, -5.4, 1.0, 0, null, 0, mouth, 'ramesh');
      break;
    }
    case 'b09': {
      // LIVE — kagaz ki seedhi NAHI: company man aaya + paisa BADHA (patla stack → mota stack)
      if (id === 's21a' || id === 's21b') {
        // pehle — patla stack, company man file liye khada (Ramesh neutral, sauda sun raha hai)
        drawChar(rameshCard, 11, RAMESH, 'neutral', 'belly', 'reach', f, cp, -1.2, 0, -3.3, 1.0, 0, null, 0, mouth, 'ramesh'); // FIX 27 Nov: R='belly' — patla stack haath me
        drawChar(companyCard, 36, COMPANY, 'smile', 'reach', 'hang', f, cp, -2.05, 0, -3.3, 1.0, 0, null, 0, mouth); // FIX 27 Nov: -2.4→-2.05 — frame ke andar
        fileProp.visible = true; fileProp.position.set(-1.7, 1.05, -3.05); fileProp.rotation.set(0, 0.4, -0.15); // FIX 27 Nov: file company man ke badhe haath par
        thinStack.visible = true; thinStack.position.set(-1.05, 0.98, -3.05); // FIX 27 Nov: patla stack Ramesh ke pet/haath par — tairta nahi
      }
      if (id === 's22a' || id === 's22b') {
        // ab — MOTA stack (₹30,000), Ramesh khush, ginta hua
        drawChar(rameshCard, 11, RAMESH, 'smile', 'belly', 'belly', f, cp, -1.2, 0, -3.3, 1.0, 0, null, 0, mouth, 'ramesh'); // FIX 27 Nov: dono haath stack par
        drawChar(companyCard, 36, COMPANY, 'smile', 'hang', 'hang', f, cp, -2.05, 0, -3.3, 1.0, 0, null, 0, mouth); // FIX 27 Nov: -2.4→-2.05
        thickStack.visible = true; thickStack.position.set(-1.2, 0.98, -3.05); // FIX 27 Nov: mota stack haathon me
      }
      if (id === 's23a') {
        // sauda pakka — wide: dono muskurate, file + mota stack (reach NAHI — v3 me badha haath dono chehre kaat raha tha)
        drawChar(rameshCard, 11, RAMESH, 'grin', 'belly', 'hang', f, cp, -1.35, 0, -3.3, 1.0, 0, null, 0, mouth, 'ramesh');
        drawChar(companyCard, 36, COMPANY, 'grin', 'hang', 'hang', f, cp, -1.75, 0, -2.95, 1.0, 0, null, 0, mouth);
        fileProp.visible = true; fileProp.position.set(-1.95, 1.05, -2.8); fileProp.rotation.set(0, 0.4, -0.15);
        thickStack.visible = true; thickStack.position.set(-1.35, 0.98, -3.05); // FIX 27 Nov: stack Ramesh ke haath me
      }
      if (id === 's23b') {
        // sauda pakka — close-up: handshake reach (yahan chehre saaf hain)
        drawChar(rameshCard, 11, RAMESH, 'grin', 'belly', 'reach', f, cp, -1.35, 0, -3.3, 1.0, 0, null, 0, mouth, 'ramesh'); // FIX 27 Nov: R='belly' (stack), L='reach' (handshake)
        drawChar(companyCard, 36, COMPANY, 'grin', 'reach', 'hang', f, cp, -1.75, 0, -2.95, 1.0, 0, null, 0, mouth); // FIX 27 Nov: paas aaya — handshake frame me
        fileProp.visible = true; fileProp.position.set(-1.95, 1.05, -2.8); fileProp.rotation.set(0, 0.4, -0.15);
        thickStack.visible = true; thickStack.position.set(-1.35, 0.98, -3.05); // FIX 27 Nov: stack Ramesh ke haath me
      }
      break;
    }
    case 'b10': {
      // dhakkan khulta hai (b10 ke pehle hisse me)
      gallaLid.rotation.x = -1.6 * ease((bu - 0.1) / 0.5); // FIX v5: -1.9→-1.6 — dhakkan kam loom kare
      if (id === 's24a' || id === 's24b') drawChar(rameshCard, 11, RAMESH, 'smile', 'reach', 'hang', f, cp, 0.75, 0, -3.4, 1.0, 0, null, 0, mouth, 'ramesh');
      if (id === 's25a' || id === 's25b') {
        drawChar(rameshCard, 11, RAMESH, 'smile', 'hang', 'hang', f, cp, 0.75, 0, -3.4, 1.0, 0, null, 0, mouth, 'ramesh');
        glintGalla.material.opacity = 0.6;
      }
      break;
    }
    case 'b11': {
      if (id === 's27a' || id === 's27b') {
        const ox = 3.5 - (f - 1239) * 0.06;
        drawChar(off1Card, 41, OFF1, 'neutral', 'hang', 'hang', f, cp, ox, 0, 1.0, 1.0, f * 0.5, null, 0, mouth);
        tiffinProp.visible = true; tiffinProp.position.set(ox + 0.28, 0.68, 1.0); // FIX 27 Nov: tiffin latke haath par (neeche)
        drawChar(rameshCard, 11, RAMESH, 'smile', 'hang', 'hang', f, cp, 0.2, 5.98, -5.2, 0.9, 0, null, 0, mouth, 'ramesh');
      }
      if (id === 's28a' || id === 's28b') drawChar(rameshCard, 11, RAMESH, 'grin', 'up', 'up', f, cp, 0.6, 5.98, -5.2, 1.0, 0, null, 0, mouth, 'ramesh'); // FIX 27 Nov R2: tower legs se hatkar — beech chhat par; FIX v3: grin — sabse badi smile (smile chhota pad raha tha)
      break;
    }
  }
  updateProxiesW();
  renderer.render(scene, camera);
};

window.TOTAL = TOTAL;
window.ready = Promise.resolve();
