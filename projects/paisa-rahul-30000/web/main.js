// "Paisa + Life Value #2 — Rahul ₹30,000 Salary Story" — three.js film, driven ENTIRELY by story.js frame math.
// Contract (render.mjs): window.ready, window.renderFrame(f), canvas #c 1080x1920.
import * as THREE from 'three';
import * as FX from './fx.js';
import * as T from './toon.js';
import { idle, blinkAt, q } from './motion.js';
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import {
  TOTAL, secAt, camAt, envAt, rahulAt, friendAt, pileAt, potAt,
  expenseAt, barsAt, growthValueAt, growthBarsAt, captionAt, heroAt, flowActive, flowU,
} from './story.js';

const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 3000);
const rx = (a) => a * Math.PI / 180;
scene.fog = new THREE.Fog(0xf2d49a, 18, 220);

// ---------- embedded Devanagari font (boards render identically everywhere) ----------
const DEV_FONT = '"Noto Sans Devanagari"';
let fontOK = false;
const fontReady = (async () => {
  try {
    const face = new FontFace('Noto Sans Devanagari', `url(data:font/ttf;base64,${DEVANAGARI_BOLD_B64})`, { weight: '700' });
    await face.load();
    document.fonts.add(face);
    await document.fonts.load(`700 100px ${DEV_FONT}`, '₹30,000');
    fontOK = true;
  } catch (e) { console.log('FONT ERR ' + e.message); window.fontErr = String(e); }
})();

// ---------- sky dome ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0.004 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize; varying vec3 vP;
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .55)); if(vP.y<0.) c = hor;
      float s = dot(normalize(vP), normalize(sunDir)); c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.6, s) + .16*pow(max(s,0.), 42.)*step(.001,sunSize));
      gl_FragColor = vec4(c,1.); }`,
}));
scene.add(sky);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight(0xffe9c0, 0xb09a68, 0.9); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffdf9e, 1.5); scene.add(sun); scene.add(sun.target);

// ---------- ground + stage + props ----------
const lam = (o) => new THREE.MeshLambertMaterial(o);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), lam({ color: 0xdcc08a }));
ground.rotation.x = -Math.PI / 2; ground.position.y = 0; scene.add(ground);
const stage = new THREE.Mesh(new THREE.CircleGeometry(10.5, 48), lam({ color: 0xc9a86a }));
stage.rotation.x = -Math.PI / 2; stage.position.y = 0.01; scene.add(stage);
// house (left back)
const house = new THREE.Group();
{
  const wall = new THREE.Mesh(new THREE.BoxGeometry(4.4, 3.0, 3.6), lam({ color: 0xf2e3c2 })); wall.position.y = 1.5; house.add(wall);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.8, 4), lam({ color: 0xb05a2e })); roof.position.y = 3.9; roof.rotation.y = Math.PI / 4; house.add(roof);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.9), lam({ color: 0x6b4423 })); door.position.set(0, 0.95, 1.81); house.add(door);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), lam({ color: 0x9fd4ff })); win.position.set(-1.3, 1.9, 1.81); house.add(win);
  const win2 = win.clone(); win2.position.set(1.3, 1.9, 1.81); house.add(win2);
  house.position.set(-8.5, 0, -9); scene.add(house);
}
// tree (right back)
{
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2.2, 8), lam({ color: 0x6b4423 })); trunk.position.set(8.5, 1.1, -8); scene.add(trunk);
  const c1 = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 10), lam({ color: 0x4e7a32 })); c1.position.set(8.5, 3.2, -8); scene.add(c1);
  const c2 = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 10), lam({ color: 0x5d8a3a })); c2.position.set(7.4, 2.5, -7.6); scene.add(c2);
}
// low teal backdrop wall behind the chart area
const backWall = new THREE.Mesh(new THREE.BoxGeometry(24, 3.2, 0.4), lam({ color: 0x2e6f6a }));
backWall.position.set(0, 1.6, -8.5); scene.add(backWall);
const wallTrim = new THREE.Mesh(new THREE.BoxGeometry(24, 0.18, 0.45), lam({ color: 0xd9a441 }));
wallTrim.position.set(0, 3.25, -8.5); scene.add(wallTrim);

// ---------- clouds ----------
const clouds = new FX.Clouds(scene, { count: 7, y: 55, opacity: 0.5, color: 0xfff3d6 });
clouds.group.traverse((o) => { if (o.isSprite) o.userData.op0 = o.material.opacity; });

// ---------- coins: the salary pile (240 instanced gold discs) ----------
const COIN_N = 240;
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _v3 = new THREE.Vector3(), _s3 = new THREE.Vector3(1, 1, 1);
const _up = new THREE.Vector3(0, 1, 0);
const ZERO_M = new THREE.Matrix4().makeScale(0, 0, 0);
const hash = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const coinGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.07, 18);
const coinMesh = new THREE.InstancedMesh(coinGeo, lam({ color: 0xd9a441 }), COIN_N);
coinMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
coinMesh.frustumCulled = false;
scene.add(coinMesh);
const PILE_C = [0.5, 0, -3.2];
// deterministic mound layout: 4 layers of 60, shrinking radius
const coinLayout = [];
for (let i = 0; i < COIN_N; i++) {
  const layer = Math.floor(i / 60), k = i % 60;
  const ang = (k / 60) * Math.PI * 2 + layer * 0.35;
  const rad = (2.1 - layer * 0.45) * Math.sqrt(hash(i * 3 + 1));
  const x = PILE_C[0] + Math.cos(ang) * rad;
  const z = PILE_C[2] + Math.sin(ang) * rad * 0.8;
  const y = 0.05 + layer * 0.09 + hash(i * 7 + 2) * 0.03;
  const tilt = (hash(i * 11 + 3) - 0.5) * 0.5;
  coinLayout.push({ x, y, z, tilt, spin: hash(i * 13 + 5) * Math.PI * 2 });
}
// investment pot (gold pot at right) + coins inside it
const pot = new THREE.Group();
{
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.7, 1.15, 20), lam({ color: 0x8a6d2f })); body.position.y = 0.58; pot.add(body);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.09, 10, 24), lam({ color: 0xd9a441 })); rim.rotation.x = Math.PI / 2; rim.position.y = 1.15; pot.add(rim);
  pot.position.set(2.8, 0, -3.2); scene.add(pot);
}
const POT_COINS = 24;
const potCoinMesh = new THREE.InstancedMesh(coinGeo, lam({ color: 0xf2c14e }), POT_COINS);
potCoinMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
potCoinMesh.frustumCulled = false;
scene.add(potCoinMesh);
const potCoinLayout = [];
for (let i = 0; i < POT_COINS; i++) {
  const ang = (i / POT_COINS) * Math.PI * 2 * 2.3;
  const rad = 0.55 * Math.sqrt(hash(i * 5 + 9));
  potCoinLayout.push({ x: 2.8 + Math.cos(ang) * rad, z: -3.2 + Math.sin(ang) * rad, y: 1.18 + Math.floor(i / 8) * 0.08 });
}
// flying coins: Rahul -> pot (p7-p9)
const FLOW_N = 14;
const flowCoins = [];
for (let k = 0; k < FLOW_N; k++) {
  const m = new THREE.Mesh(coinGeo, lam({ color: 0xf2c14e }));
  m.visible = false; scene.add(m); flowCoins.push(m);
}

// ---------- text texture helpers (Devanagari via embedded font) ----------
function fitFont(g, text, maxW, startPx, family) {
  let px = startPx;
  g.font = `700 ${px}px ${family}`;
  while (g.measureText(text).width > maxW && px > 20) { px -= 4; g.font = `700 ${px}px ${family}`; }
  return px;
}
function drawRichLine(g, text, goldSubs, cx, y, maxW, px, family) {
  g.font = `700 ${px}px ${family}`;
  const w = Math.min(g.measureText(text).width, maxW);
  let x0 = cx - w / 2;
  g.textAlign = 'left'; g.textBaseline = 'middle';
  g.fillStyle = '#ffffff';
  g.fillText(text, x0, y);
  // repaint gold substrings in gold at their measured offsets
  g.fillStyle = '#ffd76a';
  for (const sub of goldSubs) {
    const idx = text.indexOf(sub);
    if (idx < 0) continue;
    const off = g.measureText(text.slice(0, idx)).width;
    g.fillText(sub, x0 + off, y);
  }
  g.textAlign = 'center';
}
function makeTextCanvas(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}
function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

// ---------- expense boards (3D planes, pop in during p3) ----------
const EXPENSES = [
  { label: 'घर + किराया', amt: '₹10,000', x: -2.9 },
  { label: 'शॉपिंग + खाना', amt: '₹5,000', x: 0 },
  { label: 'EMI', amt: '₹5,000', x: 2.9 },
];
const expenseBoards = EXPENSES.map((e) => {
  const [c, g] = makeTextCanvas(512, 340);
  g.fillStyle = '#143c3a'; g.fillRect(0, 0, 512, 340);
  g.strokeStyle = '#ffd76a'; g.lineWidth = 10; g.strokeRect(12, 12, 488, 316);
  g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  fitFont(g, e.label, 440, 62, DEV_FONT);
  g.fillText(e.label, 256, 110);
  g.fillStyle = '#ffd76a';
  fitFont(g, e.amt, 440, 96, DEV_FONT);
  g.fillText(e.amt, 256, 235);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 2.06), new THREE.MeshBasicMaterial({ map: t, transparent: false, side: THREE.DoubleSide }));
  m.position.set(e.x, 2.7, -4.6);
  scene.add(m);
  return m;
});

// ---------- 50/30/20 bars ----------
const BAR_DEFS = [
  { label: '50% ज़रूरी', pct: '50%', x: -2.8, full: 3.2, color: 0x35b5a0 },
  { label: '30% इच्छाएँ', pct: '30%', x: 0, full: 1.9, color: 0xd9a441 },
  { label: '20% बचत / निवेश', pct: '20%', x: 2.8, full: 1.3, color: 0x6a9a3a },
];
const barMeshes = BAR_DEFS.map((b) => {
  const geo = new THREE.BoxGeometry(2.0, 1, 1.4); geo.translate(0, 0.5, 0);
  const m = new THREE.Mesh(geo, lam({ color: b.color }));
  m.position.set(b.x, 0, -5.2); m.scale.y = 0.001; scene.add(m);
  const [c, g] = makeTextCanvas(512, 160);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 10; g.strokeStyle = 'rgba(20,20,16,0.85)';
  fitFont(g, b.label, 480, 62, DEV_FONT);
  g.strokeText(b.label, 256, 80); g.fillStyle = '#ffffff'; g.fillText(b.label, 256, 80);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const lm = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.81), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  lm.position.set(b.x, 0.4, -4.4); scene.add(lm);
  return { mesh: m, label: lm, def: b };
});

// ---------- compounding growth chart (10 bars) ----------
const GROW_N = 10;
const growBars = [];
{
  const geo = new THREE.BoxGeometry(0.85, 1, 0.9); geo.translate(0, 0.5, 0);
  for (let k = 0; k < GROW_N; k++) {
    const m = new THREE.Mesh(geo, lam({ color: k < 5 ? 0xd9a441 : 0xf2c14e }));
    m.position.set(-4.95 + k * 1.1, 0, -5.2); m.scale.y = 0.001; scene.add(m);
    growBars.push(m);
  }
}
// value board above the chart: "₹X.X लाख • N महीने"
const valueCanvas = document.createElement('canvas'); valueCanvas.width = 768; valueCanvas.height = 220;
const valueTex = new THREE.CanvasTexture(valueCanvas); valueTex.colorSpace = THREE.SRGBColorSpace;
const valueBoard = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.49), new THREE.MeshBasicMaterial({ map: valueTex, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
valueBoard.position.set(0, 7.6, -5.4); valueBoard.visible = false; scene.add(valueBoard);
let valueKey = '';
function drawValueBoard(lakh, months) {
  const key = `${lakh.toFixed(1)}|${months}`;
  if (key === valueKey) return; valueKey = key;
  const g = valueCanvas.getContext('2d');
  g.clearRect(0, 0, 768, 220);
  g.fillStyle = 'rgba(20,32,44,0.92)'; roundRect(g, 8, 8, 752, 204, 28); g.fill();
  g.strokeStyle = '#ffd76a'; g.lineWidth = 6; roundRect(g, 8, 8, 752, 204, 28); g.stroke();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#ffd76a';
  fitFont(g, `₹${lakh.toFixed(1)} लाख`, 700, 92, DEV_FONT);
  g.fillText(`₹${lakh.toFixed(1)} लाख`, 384, 82);
  g.fillStyle = '#ffffff';
  fitFont(g, `${months} महीने • ₹6,000/महीना`, 700, 52, DEV_FONT);
  g.fillText(`${months} महीने • ₹6,000/महीना`, 384, 168);
  valueTex.needsUpdate = true;
}

// ---------- CHARACTER CARDS (Rahul + friend) ----------
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
    this.blob.position.set(x, y + 0.03, z); this.blob.scale.setScalar(s);
  }
  hide() { this.mesh.visible = this.blob.visible = false; }
}
const rahulCard = new Card();
const friendCard = new Card();

// ---------- hero board (screen-space, big centre numbers) ----------
const heroCanvas = document.createElement('canvas'); heroCanvas.width = 1024; heroCanvas.height = 640;
const heroTex = new THREE.CanvasTexture(heroCanvas); heroTex.colorSpace = THREE.SRGBColorSpace;
const hero = new THREE.Mesh(new THREE.PlaneGeometry(11, 6.875), new THREE.MeshBasicMaterial({ map: heroTex, transparent: true, depthTest: false, fog: false }));
hero.renderOrder = 10; hero.visible = false; scene.add(hero);
let heroKey = '';
function drawHero(lines) {
  const key = JSON.stringify(lines);
  if (key === heroKey) return; heroKey = key;
  const g = heroCanvas.getContext('2d');
  g.clearRect(0, 0, 1024, 640);
  g.fillStyle = '#141f2c'; roundRect(g, 10, 10, 1004, 620, 36); g.fill();
  g.strokeStyle = '#ffd76a'; g.lineWidth = 10; roundRect(g, 10, 10, 1004, 620, 36); g.stroke();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const n = lines.length;
  const ys = n === 1 ? [320] : n === 2 ? [250, 420] : [190, 340, 500];
  lines.forEach((ln, i) => {
    const small = ln.small;
    const px = small ? 52 : (n === 1 ? 150 : 110);
    g.font = `700 ${px}px ${DEV_FONT}`;
    let fs = px;
    while (g.measureText(ln.t).width > 920 && fs > 26) { fs -= 6; g.font = `700 ${fs}px ${DEV_FONT}`; }
    g.fillStyle = ln.gold ? '#ffd76a' : '#ffffff';
    g.fillText(ln.t, 512, ys[i]);
  });
  heroTex.needsUpdate = true;
}

// ---------- caption band (screen-space bottom) ----------
const capCanvas = document.createElement('canvas'); capCanvas.width = 1024; capCanvas.height = 300;
const capTex = new THREE.CanvasTexture(capCanvas); capTex.colorSpace = THREE.SRGBColorSpace;
const capBand = new THREE.Mesh(new THREE.PlaneGeometry(10.4, 3.05), new THREE.MeshBasicMaterial({ map: capTex, transparent: true, depthTest: false, fog: false }));
capBand.renderOrder = 11; capBand.visible = false; scene.add(capBand);
let capKey = '';
function drawCaption(lines) {
  const key = JSON.stringify(lines);
  if (key === capKey) return; capKey = key;
  const g = capCanvas.getContext('2d');
  g.clearRect(0, 0, 1024, 300);
  g.fillStyle = '#101822'; roundRect(g, 14, 14, 996, 272, 30); g.fill();
  g.strokeStyle = '#ffd76a'; g.lineWidth = 5; roundRect(g, 14, 14, 996, 272, 30); g.stroke();
  const ys = [100, 205];
  lines.forEach((ln, i) => {
    let px = 68;
    g.font = `700 ${px}px ${DEV_FONT}`;
    while (g.measureText(ln.t).width > 920 && px > 26) { px -= 4; g.font = `700 ${px}px ${DEV_FONT}`; }
    drawRichLine(g, ln.t, ln.gold || [], 512, ys[i], 920, px, DEV_FONT);
  });
  capTex.needsUpdate = true;
}

// ---------- per-frame ----------
let lastF = -1;
const _v = new THREE.Vector3();
function setInst(mesh, i, x, y, z, ry, tilt) {
  _q.setFromAxisAngle(_up, ry);
  // tilt the coin a little around x for a natural pile look
  const q2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), tilt || 0);
  _q.multiply(q2);
  _v3.set(x, y, z);
  _m4.compose(_v3, _q, _s3);
  mesh.setMatrixAt(i, _m4);
}
window.renderFrame = (f) => {
  const t = f / 30;
  const dt = lastF < 0 ? 1 / 30 : Math.min(0.1, Math.max(0, (f - lastF) / 30));
  const sec = secAt(f), env = envAt(f);

  // --- environment ---
  skyU.top.value.setRGB(...env.top); skyU.hor.value.setRGB(...env.hor); skyU.sunCol.value.setRGB(...env.sun);
  scene.fog.color.setRGB(...env.fog); scene.fog.near = env.fn; scene.fog.far = env.ff;
  hemi.color.setRGB(...env.hSky); hemi.groundColor.setRGB(...env.hGnd); hemi.intensity = env.hemi;
  sun.color.setRGB(...env.sun); sun.intensity = env.sunI;
  const cam = camAt(f);
  camera.position.set(...cam.pos); camera.up.set(0, 1, 0); camera.lookAt(...cam.look); camera.fov = cam.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const sunDir = _v.set(Math.cos(rx(env.el)) * Math.cos(rx(env.az)), Math.sin(rx(env.el)), Math.cos(rx(env.el)) * Math.sin(rx(env.az))).normalize().clone();
  skyU.sunDir.value.copy(sunDir);
  sun.position.set(cam.look[0] + sunDir.x * 140, sunDir.y * 140 + 10, cam.look[2] + sunDir.z * 140);
  sun.target.position.set(...cam.look);
  sky.position.copy(camera.position);
  clouds.group.traverse((o) => { if (o.isSprite) { o.material.color.setRGB(...env.cloud); o.material.opacity = o.userData.op0 * (env.cop / 0.5); } });

  // --- salary pile: visible count follows pileAt ---
  const pileN = Math.round(pileAt(f) * COIN_N);
  for (let i = 0; i < COIN_N; i++) {
    if (i >= pileN) { coinMesh.setMatrixAt(i, ZERO_M); continue; }
    const L = coinLayout[i];
    setInst(coinMesh, i, L.x, L.y, L.z, L.spin, L.tilt);
  }
  coinMesh.instanceMatrix.needsUpdate = true;

  // --- pot coins fill ---
  const potN = Math.round(potAt(f) * POT_COINS);
  for (let i = 0; i < POT_COINS; i++) {
    if (i >= potN) { potCoinMesh.setMatrixAt(i, ZERO_M); continue; }
    const L = potCoinLayout[i];
    setInst(potCoinMesh, i, L.x, L.y, L.z, i * 1.7, 0);
  }
  potCoinMesh.instanceMatrix.needsUpdate = true;

  // --- flying coins Rahul -> pot (continuous stream during p7-p9) ---
  const flActive = flowActive(f);
  const from = [-0.6, 1.0, 0.9], to = [2.8, 1.5, -3.2];
  for (let k = 0; k < FLOW_N; k++) {
    const u = flowU(f, k, FLOW_N);
    if (!flActive || u <= 0.02 || u >= 0.99) { flowCoins[k].visible = false; continue; }
    const m = flowCoins[k];
    m.visible = true;
    const x = from[0] + (to[0] - from[0]) * u;
    const y = from[1] + (to[1] - from[1]) * u + Math.sin(u * Math.PI) * 2.2;
    const z = from[2] + (to[2] - from[2]) * u;
    m.position.set(x, y, z);
    m.rotation.set(Math.PI / 2 + t * 3 + k, t * 2 + k, 0);
  }

  // --- expense boards pop ---
  const showExpenses = sec.id === 'p3';
  const pops = expenseAt(f);
  expenseBoards.forEach((m, i) => {
    const p = pops[i];
    m.visible = showExpenses && p > 0.01;
    const s = 0.6 + 0.4 * p;
    m.scale.setScalar(Math.max(0.01, s));
    m.material.opacity = 1;
    m.position.y = 2.7 + Math.sin(t * 1.2 + i * 2) * 0.05 * p;
  });

  // --- 50/30/20 bars grow ---
  const hs = barsAt(f);
  const showBars = sec.id === 'p6';
  barMeshes.forEach((b, i) => {
    const h = Math.max(0.001, hs[i]);
    b.mesh.scale.y = h * b.def.full;
    b.mesh.visible = showBars && hs[i] > 0.01;
    b.label.visible = showBars && hs[i] > 0.25;
    b.label.position.y = 0.4 + h * b.def.full + 0.35;
  });

  // --- compounding chart ---
  const showChart = ['p8', 'p9', 'p10'].includes(sec.id);
  const gBars = growthBarsAt(f);
  const gv = growthValueAt(f);
  growBars.forEach((m, k) => {
    const h = Math.max(0.001, gBars[k] * 6.0);
    m.scale.y = h;
    m.visible = showChart && gBars[k] > 0.005;
  });
  valueBoard.visible = showChart && gv.u > 0.02 && !(sec.id === 'p9' && sec.u >= 0.3); // hero board takes over mid-p9
  if (valueBoard.visible) drawValueBoard(gv.lakh, gv.months);

  // --- characters ---
  const cardTint = Math.min(1, 0.58 + 0.15 * env.sunI);
  const tintCard = (card) => card.mesh.material.color.setRGB(cardTint, cardTint * 0.985, cardTint * 0.96);
  const drawChar = (card, who, outfit, seed, pos, expr, arm) => {
    const idl = idle(f, seed), blink = blinkAt(f, seed);
    const key = `${who}|${sec.id}|${expr}|${arm}|${blink}|${q(idl.bob, 2)}|${Math.round(idl.tilt)}`;
    card.draw(key, (p) => T.romanFront(p, outfit, {
      seed, expr, R: arm === 'point' ? 'point' : arm === 'wave' ? 'wave' : 'hang', L: 'hang', blink, bob: q(idl.bob, 2),
      tilt: Math.round(idl.tilt), headTilt: Math.round(idle(f, seed + 2).headTilt), wv: f * 0.18, step: 0,
    }));
    card.place(pos[0], pos[1], pos[2], cam.pos, 1.0);
    tintCard(card);
  };
  const r = rahulAt(f);
  if (r.visible) drawChar(rahulCard, 'rahul', 'civA', 31, r.pos, r.expr, r.arm);
  else rahulCard.hide();
  const fr = friendAt(f);
  if (fr.visible) drawChar(friendCard, 'friend', 'friendB', 47, fr.pos, fr.expr, fr.arm);
  else friendCard.hide();

  // --- hero board ---
  const hb = heroAt(f);
  hero.visible = !!hb && hb.alpha > 0.01;
  if (hero.visible) {
    drawHero(hb.lines);
    hero.material.opacity = hb.alpha;
    _v.set(...cam.look).sub(camera.position).normalize();
    hero.position.copy(camera.position).addScaledVector(_v, 17); hero.position.y += 3.4;
    hero.lookAt(camera.position);
    const bw = 2 * 17 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * (1080 / 1920) * 0.94;
    hero.scale.set(bw / 11, bw / 11, 1);
  }

  // --- caption band ---
  const cap = captionAt(f);
  capBand.visible = cap.alpha > 0.01;
  if (capBand.visible) {
    drawCaption(cap.lines);
    capBand.material.opacity = cap.alpha;
    _v.set(...cam.look).sub(camera.position).normalize();
    capBand.position.copy(camera.position).addScaledVector(_v, 17); capBand.position.y += -5.6;
    capBand.lookAt(camera.position);
    const bw = 2 * 17 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * (1080 / 1920) * 0.98;
    capBand.scale.set(bw / 10.4, bw / 10.4, 1);
  }

  // --- FX updates ---
  clouds.update(t, dt);

  renderer.render(scene, camera);
  lastF = f;
  return true;
};
window.TOTAL = TOTAL;
window.COUNTS = { coins: COIN_N, potCoins: POT_COINS, flowCoins: FLOW_N, growthBars: GROW_N };
fontReady.then(() => { window.ready = true; });
