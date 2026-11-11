// MAX — "Tumhari Salary Har Mahine Gayab Kyun Ho Jati Hai?" — three.js film.
// Driven ENTIRELY by story.js frame math. Contract (render.mjs): window.ready,
// window.renderFrame(f), canvas #c 1080x1920.
// MAX is a NEW stickman character (white sphere head, black eyes/brows, navy
// jacket, black trousers, white sneakers, gold watch left wrist) — NOT Rahul.
import * as THREE from 'three';
import * as FX from './fx.js';
import { drawMax } from './max.js';
import { idle, blinkAt, q } from './motion.js';
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import {
  TOTAL, secAt, camAt, envAt, maxAt, pileAt,
  rainActive, rainU, drainActive, drainU,
  jarFlowActive, jarFlowU, vaultFlowActive, vaultFlowU, singleCoinAt,
  walletAt, phoneAt, expenseAt, dashboardAt, jarsAt, jarsVisible, vaultAt,
  captionAt, heroAt,
} from './story.js';

const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 3000);
const rx = (a) => a * Math.PI / 180;
scene.fog = new THREE.Fog(0x1a2438, 16, 200);

// ---------- embedded Devanagari font ----------
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
const hemi = new THREE.HemisphereLight(0xc8d4e8, 0x3a3f4a, 0.85); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffd76a, 1.1); scene.add(sun); scene.add(sun.target);
const vaultLight = new THREE.PointLight(0xffc95e, 0, 9, 1.6); vaultLight.position.set(2.6, 1.6, -1.0); scene.add(vaultLight);
const lampLight = new THREE.PointLight(0xffd9a0, 0, 8, 1.8); lampLight.position.set(-5.5, 2.6, -4.5); scene.add(lampLight);
const tableLight = new THREE.PointLight(0xffd9a0, 0, 7, 1.8); tableLight.position.set(-0.4, 2.2, 1.2); scene.add(tableLight);

// ---------- ground + stage + apartment set ----------
const lam = (o) => new THREE.MeshLambertMaterial(o);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), lam({ color: 0x141c2e }));
ground.rotation.x = -Math.PI / 2; ground.position.y = 0; scene.add(ground);
const stage = new THREE.Mesh(new THREE.CircleGeometry(10.5, 48), lam({ color: 0x1e2a44 }));
stage.rotation.x = -Math.PI / 2; stage.position.y = 0.01; scene.add(stage);
// back wall (navy) + gold trim
const backWall = new THREE.Mesh(new THREE.BoxGeometry(24, 4.2, 0.4), lam({ color: 0x1a2540 }));
backWall.position.set(0, 2.1, -8.5); scene.add(backWall);
const wallTrim = new THREE.Mesh(new THREE.BoxGeometry(24, 0.18, 0.45), lam({ color: 0xd9a441 }));
wallTrim.position.set(0, 4.25, -8.5); scene.add(wallTrim);
// sofa (left back)
{
  const sofa = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.7, 1.4), lam({ color: 0x2c3c5e })); base.position.y = 0.45; sofa.add(base);
  const back = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.1, 0.35), lam({ color: 0x2c3c5e })); back.position.set(0, 1.1, -0.6); sofa.add(back);
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 1.4), lam({ color: 0x243350 })); armL.position.set(-1.6, 0.85, 0); sofa.add(armL);
  const armR = armL.clone(); armR.position.x = 1.6; sofa.add(armR);
  const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, 1.1), lam({ color: 0xd9a441 })); cushion.position.set(-0.6, 0.9, 0.1); sofa.add(cushion);
  sofa.position.set(-6.2, 0, -6.2); sofa.rotation.y = 0.5; scene.add(sofa);
}
// floor lamp (warm, left)
{
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.4, 8), lam({ color: 0x3a3f4a })); pole.position.set(-5.5, 1.2, -4.5); scene.add(pole);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.6, 12, 1, true), lam({ color: 0xffd9a0, emissive: 0xffc06a, emissiveIntensity: 0.6 })); shade.position.set(-5.5, 2.6, -4.5); scene.add(shade);
}
// night table + chair (p3 zero balance)
const nightTable = new THREE.Group();
{
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.08, 20), lam({ color: 0x2a2118 })); top.position.y = 0.78; nightTable.add(top);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.78, 8), lam({ color: 0x1c1610 })); leg.position.y = 0.39; nightTable.add(leg);
  nightTable.position.set(-0.4, 0, 0.9); scene.add(nightTable);
}
const chair = new THREE.Group();
{
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.9), lam({ color: 0x2c3c5e })); seat.position.y = 0.55; chair.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.0, 0.1), lam({ color: 0x2c3c5e })); back.position.set(0, 1.05, -0.42); chair.add(back);
  chair.position.set(-1.2, 0, 0.45); chair.rotation.y = 0.4; scene.add(chair);
}
// planning desk (p4)
const desk = new THREE.Group();
{
  const top = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 1.4), lam({ color: 0x2a2118 })); top.position.y = 0.85; desk.add(top);
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.85, 1.2), lam({ color: 0x1c1610 })); legL.position.set(-1.5, 0.42, 0); desk.add(legL);
  const legR = legL.clone(); legR.position.x = 1.5; desk.add(legR);
  desk.position.set(-0.6, 0, -2.6); scene.add(desk);
}
// rooftop parapet + skyline (p8-p9 only)
const parapet = new THREE.Mesh(new THREE.BoxGeometry(22, 0.9, 0.5), lam({ color: 0x232f4a }));
parapet.position.set(0, 0.45, -6.5); scene.add(parapet);
const skyline = new THREE.Group();
{
  const heights = [7, 11, 9, 14, 8, 12, 10, 16, 7, 11];
  for (let i = 0; i < 10; i++) {
    const h = heights[i];
    const b = new THREE.Mesh(new THREE.BoxGeometry(2.6, h, 2.6), lam({ color: 0x16203a }));
    b.position.set(-13.5 + i * 3, h / 2, -16 - (i % 3) * 1.5); skyline.add(b);
    // a few lit gold windows
    for (let w = 0; w < 4; w++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.5), new THREE.MeshBasicMaterial({ color: 0xffc95e }));
      win.position.set(-13.5 + i * 3 + (w % 2 ? 0.5 : -0.5), 2 + w * 2.2, -16 - (i % 3) * 1.5 + 1.32);
      skyline.add(win);
    }
  }
  scene.add(skyline);
}

// ---------- clouds ----------
const clouds = new FX.Clouds(scene, { count: 7, y: 55, opacity: 0.5, color: 0x8fa0c0 });
clouds.group.traverse((o) => { if (o.isSprite) o.userData.op0 = o.material.opacity; });

// ---------- coins ----------
const COIN_N = 180;
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
const coinLayout = [];
for (let i = 0; i < COIN_N; i++) {
  const layer = Math.floor(i / 45), k = i % 45;
  const ang = (k / 45) * Math.PI * 2 + layer * 0.35;
  const rad = (2.0 - layer * 0.42) * Math.sqrt(hash(i * 3 + 1));
  coinLayout.push({
    x: PILE_C[0] + Math.cos(ang) * rad,
    z: PILE_C[2] + Math.sin(ang) * rad * 0.8,
    y: 0.05 + layer * 0.09 + hash(i * 7 + 2) * 0.03,
    tilt: (hash(i * 11 + 3) - 0.5) * 0.5,
    spin: hash(i * 13 + 5) * Math.PI * 2,
  });
}
// RAIN coins (p1, 40)
const RAIN_N = 40;
const rainMesh = new THREE.InstancedMesh(coinGeo, lam({ color: 0xf2c14e }), RAIN_N);
rainMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
rainMesh.frustumCulled = false;
scene.add(rainMesh);
const rainLayout = [];
for (let i = 0; i < RAIN_N; i++) {
  const ang = hash(i * 3 + 7) * Math.PI * 2;
  const rad = 2.4 * Math.sqrt(hash(i * 5 + 11));
  rainLayout.push({ x: PILE_C[0] + Math.cos(ang) * rad, z: PILE_C[2] + Math.sin(ang) * rad * 0.8, spin: hash(i * 9 + 4) * Math.PI * 2, wob: hash(i * 13 + 6) * Math.PI * 2 });
}
// DRAIN coins (p2-p3, 24) — fly to the six expense boards
const DRAIN_N = 24;
const drainCoins = [];
for (let k = 0; k < DRAIN_N; k++) {
  const m = new THREE.Mesh(coinGeo, lam({ color: 0xd9a441 }));
  m.visible = false; scene.add(m); drainCoins.push(m);
}
const EXPENSE_POS = [[-2.8, 3.0, -5.0], [0, 3.0, -5.0], [2.8, 3.0, -5.0], [-2.8, 1.25, -5.0], [0, 1.25, -5.0], [2.8, 1.25, -5.0]];
const drainLayout = [];
for (let k = 0; k < DRAIN_N; k++) {
  const tgt = EXPENSE_POS[k % 6];
  drainLayout.push({ tx: tgt[0] + (hash(k * 3 + 1) - 0.5) * 1.2, ty: tgt[1] + (hash(k * 5 + 2) - 0.5) * 0.6, tz: tgt[2] + 0.4, h: 1.5 + hash(k * 7 + 3) * 2.0, spin: hash(k * 11 + 8) * 6 });
}
// JAR flow coins (p5-p6, 18)
const JARFLOW_N = 18;
const jarFlowCoins = [];
for (let k = 0; k < JARFLOW_N; k++) {
  const m = new THREE.Mesh(coinGeo, lam({ color: 0xf2c14e }));
  m.visible = false; scene.add(m); jarFlowCoins.push(m);
}
const JAR_POS = [[-2.6, 0, -4.0], [0, 0, -4.0], [2.6, 0, -4.0]];
// VAULT flow coins (p7, 12)
const VAULTFLOW_N = 12;
const vaultFlowCoins = [];
for (let k = 0; k < VAULTFLOW_N; k++) {
  const m = new THREE.Mesh(coinGeo, lam({ color: 0xf2c14e }));
  m.visible = false; scene.add(m); vaultFlowCoins.push(m);
}
// single falling coin (p3)
const singleCoin = new THREE.Mesh(coinGeo, lam({ color: 0xf2c14e }));
singleCoin.visible = false; scene.add(singleCoin);

// ---------- WALLET ----------
const wallet = new THREE.Group();
let walletFlap;
{
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.62, 0.1), lam({ color: 0x5a3b2a }));
  wallet.add(body);
  const rim = new THREE.Mesh(new THREE.PlaneGeometry(1.06, 0.58), lam({ color: 0xd9a441 }));
  rim.position.set(0, 0, 0.075); wallet.add(rim);
  const inner = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.5), lam({ color: 0x1c1210 }));
  inner.position.set(0, 0, 0.09); wallet.add(inner);
  const pivot = new THREE.Group();
  pivot.position.set(0, 0.31, 0.05);
  const flap = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.6, 0.06), lam({ color: 0x7a4f34 }));
  flap.position.y = -0.3; pivot.add(flap);
  wallet.add(pivot);
  walletFlap = pivot;
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.02), lam({ color: 0x8a6d4f }));
  slot.position.set(0, -0.12, 0.10); wallet.add(slot);
  wallet.visible = false;
  scene.add(wallet);
}

// ---------- PHONE (p1 salary notification) ----------
const phone = new THREE.Group();
let phoneGlowMat;
{
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.5, 0.07), lam({ color: 0x111114 }));
  phone.add(body);
  const [c, g] = [document.createElement('canvas'), null];
  c.width = 256; c.height = 512;
  const gg = c.getContext('2d');
  gg.fillStyle = '#0e1a2a'; gg.fillRect(0, 0, 256, 512);
  gg.fillStyle = '#1fae5f'; gg.beginPath(); gg.roundRect(14, 90, 228, 150, 18); gg.fill();
  gg.fillStyle = '#ffffff'; gg.textAlign = 'left'; gg.textBaseline = 'middle';
  gg.font = '700 30px sans-serif'; gg.fillText('✓ SALARY', 30, 135);
  gg.font = '700 40px sans-serif'; gg.fillText('₹30,000', 30, 180);
  gg.font = '400 24px sans-serif'; gg.fillStyle = '#d8ffe9'; gg.fillText('Credited • 1st', 30, 215);
  gg.fillStyle = '#ffd76a'; gg.font = '700 26px sans-serif'; gg.textAlign = 'center';
  gg.fillText('बैंक बैलेंस', 128, 300);
  gg.fillStyle = '#ffffff'; gg.font = '700 44px sans-serif'; gg.fillText('₹30,000', 128, 350);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 1.36), new THREE.MeshBasicMaterial({ map: t }));
  scr.position.z = 0.045; phone.add(scr);
  phoneGlowMat = new THREE.MeshBasicMaterial({ color: 0x1fae5f, transparent: true, opacity: 0.0, side: THREE.DoubleSide });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.4), phoneGlowMat);
  glow.position.z = -0.02; phone.add(glow);
  phone.visible = false;
  scene.add(phone);
}

// ---------- text texture helpers ----------
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

// ---------- expense boards (p2): six labels, NO invented amounts ----------
const EXPENSES = [
  { label: 'किराया', x: -2.8, y: 3.0 }, { label: 'राशन', x: 0, y: 3.0 }, { label: 'बिजली का बिल', x: 2.8, y: 3.0 },
  { label: 'EMI', x: -2.8, y: 1.25 }, { label: 'ऑनलाइन शॉपिंग', x: 0, y: 1.25 }, { label: 'बाहर का खाना', x: 2.8, y: 1.25 },
];
const expenseBoards = EXPENSES.map((e) => {
  const [c, g] = makeTextCanvas(512, 220);
  g.fillStyle = '#16233d'; g.fillRect(0, 0, 512, 220);
  g.strokeStyle = '#ffd76a'; g.lineWidth = 8; g.strokeRect(10, 10, 492, 200);
  g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  fitFont(g, e.label, 460, 58, DEV_FONT);
  g.fillText(e.label, 256, 110);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.03), new THREE.MeshBasicMaterial({ map: t, transparent: false, side: THREE.DoubleSide }));
  m.position.set(e.x, e.y, -5.0);
  scene.add(m);
  return m;
});

// ---------- holographic dashboard (p4) ----------
const dashCanvas = document.createElement('canvas'); dashCanvas.width = 1024; dashCanvas.height = 512;
const dashTex = new THREE.CanvasTexture(dashCanvas); dashTex.colorSpace = THREE.SRGBColorSpace;
const dashBoard = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 2.4), new THREE.MeshBasicMaterial({ map: dashTex, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
dashBoard.position.set(0, 2.9, -4.6); dashBoard.visible = false; scene.add(dashBoard);
let dashKey = '';
const DASH_ROWS = [['किराया', 0.85], ['राशन', 0.6], ['EMI', 0.55], ['बचत', 0.2]];
function drawDashboard(bars) {
  const key = bars.map((b) => b.toFixed(2)).join(',');
  if (key === dashKey) return; dashKey = key;
  const g = dashCanvas.getContext('2d');
  g.clearRect(0, 0, 1024, 512);
  g.fillStyle = 'rgba(16,32,52,0.88)'; roundRect(g, 8, 8, 1008, 496, 26); g.fill();
  g.strokeStyle = '#35e0c0'; g.lineWidth = 5; roundRect(g, 8, 8, 1008, 496, 26); g.stroke();
  g.textAlign = 'left'; g.textBaseline = 'middle';
  g.fillStyle = '#35e0c0'; g.font = `700 52px ${DEV_FONT}`; g.fillText('खर्च डैशबोर्ड', 44, 62);
  DASH_ROWS.forEach((row, i) => {
    const y = 140 + i * 92;
    g.fillStyle = '#ffffff'; g.font = `700 44px ${DEV_FONT}`;
    g.fillText(row[0], 44, y);
    g.fillStyle = 'rgba(255,255,255,0.18)'; roundRect(g, 300, y - 22, 620, 44, 22); g.fill();
    g.fillStyle = i === 3 ? '#ffd76a' : '#35e0c0';
    if (bars[i] > 0.01) { roundRect(g, 300, y - 22, 620 * bars[i], 44, 22); g.fill(); }
  });
  dashTex.needsUpdate = true;
}
// two small side panels
const sidePanels = [['खर्च लिखो', -2.4], ['50 • 30 • 20', 2.0]].map(([txt, x]) => {
  const [c, g] = makeTextCanvas(512, 160);
  g.fillStyle = 'rgba(16,32,52,0.9)'; roundRect(g, 6, 6, 500, 148, 20); g.fill();
  g.strokeStyle = '#ffd76a'; g.lineWidth = 5; roundRect(g, 6, 6, 500, 148, 20); g.stroke();
  g.fillStyle = '#ffd76a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  fitFont(g, txt, 470, 56, DEV_FONT);
  g.fillText(txt, 256, 80);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  m.position.set(x, 1.2, -4.4); m.visible = false; scene.add(m); // below the dashboard: no overlap, fully in frame
  return m;
});

// ---------- 50/30/20 jars (p5-p6) ----------
const JAR_DEFS = [
  { label: '50% ज़रूरी', x: -2.6, color: 0x35b5a0 },
  { label: '30% इच्छाएँ', x: 0, color: 0xd9a441 },
  { label: '20% बचत', x: 2.6, color: 0x6a9a3a },
];
const jars = JAR_DEFS.map((d) => {
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.85, 2.4, 20, 1, true),
    new THREE.MeshLambertMaterial({ color: 0x9fd4ff, transparent: true, opacity: 0.28, side: THREE.DoubleSide }),
  );
  glass.position.set(d.x, 1.2, -4.0); scene.add(glass);
  const bottom = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.08, 20), lam({ color: 0x2a3448 }));
  bottom.position.set(d.x, 0.04, -4.0); scene.add(bottom);
  const fillGeo = new THREE.CylinderGeometry(0.78, 0.78, 1, 20); fillGeo.translate(0, 0.5, 0);
  const fill = new THREE.Mesh(fillGeo, lam({ color: d.color }));
  fill.position.set(d.x, 0.08, -4.0); fill.scale.y = 0.001; scene.add(fill);
  const [c, g] = makeTextCanvas(512, 150);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 10; g.strokeStyle = 'rgba(10,14,22,0.9)';
  fitFont(g, d.label, 480, 60, DEV_FONT);
  g.strokeText(d.label, 256, 75); g.fillStyle = '#ffffff'; g.fillText(d.label, 256, 75);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const lm = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.67), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  lm.position.set(d.x, 0.4, -2.95); scene.add(lm); // nameplate on the floor in front of each jar: clear of the coin arc and the hero board
  return { glass, bottom, fill, label: lm, def: d };
});

// ---------- savings VAULT (p7) ----------
const vault = new THREE.Group();
let vaultDoor;
{
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.8, 1.8), lam({ color: 0x2a3448 }));
  body.position.y = 1.4; vault.add(body);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.14, 1.9), lam({ color: 0xd9a441 }));
  trim.position.y = 2.82; vault.add(trim);
  const trim2 = trim.clone(); trim2.position.y = 0.07; vault.add(trim2);
  const inner = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.4), lam({ color: 0x0e1420 }));
  inner.position.set(0, 1.4, 0.92); vault.add(inner);
  // gold glow panel inside
  const glowPanel = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.2), new THREE.MeshBasicMaterial({ color: 0xffc95e, transparent: true, opacity: 0 }));
  glowPanel.position.set(0, 1.4, 1.05); glowPanel.visible = false; vault.add(glowPanel); // in FRONT of the closed door: the glow wash stays visible after it shuts
  vault.userData.glowPanel = glowPanel;
  const pivot = new THREE.Group();
  pivot.position.set(1.15, 1.4, 0.95); // hinged on the RIGHT edge: door swings
  const door = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.6, 0.12), lam({ color: 0x3a4a6a })); // away from MAX (who stands on the left)
  door.position.x = -1.15; pivot.add(door);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 8, 16), lam({ color: 0xd9a441 }));
  handle.position.set(-2.0, 0, 0.1); pivot.add(handle);
  vault.add(pivot);
  vaultDoor = pivot;
  vault.position.set(2.6, 0, -2.6);
  vault.visible = false;
  scene.add(vault);
}

// ---------- CHARACTER CARD (MAX) ----------
const CARD_CW = 1200, CARD_CH = 2000, CARD_M = 2.25;
const cardGeo = new THREE.PlaneGeometry(CARD_M * 0.6, CARD_M); cardGeo.translate(0, CARD_M / 2 - CARD_M * 0.025, 0);
const blobTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  gr.addColorStop(0, 'rgba(10,14,26,0.5)'); gr.addColorStop(1, 'rgba(10,14,26,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
})();
import { Pen } from './toon.js';

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
    fn(new Pen(g));
    this.t.needsUpdate = true;
  }
  place(x, y, z, camPos, s = 1) {
    this.mesh.visible = this.blob.visible = true;
    this.mesh.position.set(x, y, z); this.mesh.scale.setScalar(s);
    this.mesh.rotation.set(0, Math.atan2(camPos[0] - x, camPos[2] - z), 0);
    this.blob.position.set(x, y + 0.03, z); this.blob.scale.setScalar(s);
  }
  hide() { this.mesh.visible = this.blob.visible = false; }
}
const maxCard = new Card();

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
  // night lamp on during p3; warm table light for the zero-balance scene;
  // skyline + parapet glow only at the rooftop ending
  lampLight.intensity = sec.id === 'p3' ? 1.6 : 0;
  tableLight.intensity = sec.id === 'p3' ? 1.5 : 0;
  const rooftop = sec.id === 'p8' || sec.id === 'p9';
  skyline.visible = rooftop;
  parapet.visible = rooftop;

  // --- salary pile ---
  const pileN = Math.round(pileAt(f) * COIN_N);
  for (let i = 0; i < COIN_N; i++) {
    if (i >= pileN) { coinMesh.setMatrixAt(i, ZERO_M); continue; }
    const L = coinLayout[i];
    setInst(coinMesh, i, L.x, L.y, L.z, L.spin, L.tilt);
  }
  coinMesh.instanceMatrix.needsUpdate = true;

  // --- RAIN coins (p1) ---
  const raining = rainActive(f);
  for (let i = 0; i < RAIN_N; i++) {
    if (!raining) { rainMesh.setMatrixAt(i, ZERO_M); continue; }
    const u = rainU(f, i, RAIN_N);
    const L = rainLayout[i];
    const y = 13 - u * 12.6;
    const x = L.x + Math.sin(t * 2 + L.wob) * 0.25;
    setInst(rainMesh, i, x, y, L.z, L.spin + t * 4 + i, 0.4);
  }
  rainMesh.instanceMatrix.needsUpdate = true;

  // --- DRAIN coins (p2-p3): fly from the pile to the expense boards ---
  const draining = drainActive(f);
  for (let k = 0; k < DRAIN_N; k++) {
    const m = drainCoins[k];
    if (!draining) { m.visible = false; continue; }
    const u = drainU(f, k, DRAIN_N);
    const L = drainLayout[k];
    m.visible = u > 0.02 && u < 0.98;
    const sx = PILE_C[0], sy = 0.4, sz = PILE_C[2];
    const x = sx + (L.tx - sx) * u;
    const y = sy + (L.ty - sy) * u + Math.sin(u * Math.PI) * L.h * 0.5;
    const z = sz + (L.tz - sz) * u;
    m.position.set(x, y, z);
    m.rotation.set(t * 5 + k, t * 3 + k, L.spin * u);
    m.scale.setScalar(Math.max(0.1, 1 - 0.4 * u));
  }

  // --- JAR flow coins (p5-p6): arc up OVER MAX's head, never through his face ---
  const jarFlowing = jarFlowActive(f);
  const maxPos = maxAt(f).pos;
  for (let k = 0; k < JARFLOW_N; k++) {
    const m = jarFlowCoins[k];
    if (!jarFlowing) { m.visible = false; continue; }
    const u = jarFlowU(f, k, JARFLOW_N);
    const tgt = JAR_POS[k % 3];
    m.visible = u > 0.02 && u < 0.98;
    const x = (maxPos[0] + 0.3) + (tgt[0] - (maxPos[0] + 0.3)) * u;
    const y = 2.0 + (2.6 - 2.0) * u + Math.sin(u * Math.PI) * 0.6;
    const z = (maxPos[2] - 0.3) + (tgt[2] - (maxPos[2] - 0.3)) * u;
    m.position.set(x, y, z);
    m.rotation.set(t * 5 + k, t * 3 + k, 0);
  }

  // --- VAULT flow coins (p7) ---
  const vaultFlowing = vaultFlowActive(f);
  for (let k = 0; k < VAULTFLOW_N; k++) {
    const m = vaultFlowCoins[k];
    if (!vaultFlowing) { m.visible = false; continue; }
    const u = vaultFlowU(f, k, VAULTFLOW_N);
    m.visible = u > 0.02 && u < 0.98;
    const from = [maxPos[0] + 0.5, 1.1, maxPos[2] + 0.4], to = [2.6, 1.5, -1.65];
    const x = from[0] + (to[0] - from[0]) * u;
    const y = from[1] + (to[1] - from[1]) * u + Math.sin(u * Math.PI) * 1.2;
    const z = from[2] + (to[2] - from[2]) * u;
    m.position.set(x, y, z);
    m.rotation.set(t * 5 + k, t * 3 + k, 0);
  }

  // --- single falling coin (p3) ---
  const sc = singleCoinAt(f);
  singleCoin.visible = sc.visible;
  if (sc.visible) {
    singleCoin.position.set(-0.4, 0.82 + sc.y, 0.9);
    singleCoin.rotation.set(Math.PI / 2 + t * 6, t * 2, 0);
  }

  // --- WALLET ---
  const w = walletAt(f);
  wallet.visible = w.visible;
  if (w.visible) {
    wallet.position.set(w.pos[0], w.pos[1], w.pos[2]);
    wallet.rotation.set(0, Math.atan2(cam.pos[0] - w.pos[0], cam.pos[2] - w.pos[2]), 0);
    walletFlap.rotation.x = w.flap * 1.9;
    wallet.scale.setScalar(w.scale);
  }

  // --- PHONE (p1) ---
  const ph = phoneAt(f);
  phone.visible = ph.visible;
  if (ph.visible) {
    phone.position.set(ph.pos[0], ph.pos[1] + Math.sin(t * 2) * 0.03, ph.pos[2]);
    phone.rotation.set(0, Math.atan2(cam.pos[0] - ph.pos[0], cam.pos[2] - ph.pos[2]), Math.sin(t * 1.5) * 0.05);
    phoneGlowMat.opacity = 0.12 + 0.08 * Math.sin(t * 4) * ph.glow;
    phone.scale.setScalar(0.62 + 0.03 * ph.glow);
  }

  // --- expense boards (p2) ---
  const showExpenses = sec.id === 'p2';
  const pops = expenseAt(f);
  expenseBoards.forEach((m, i) => {
    const p = pops[i];
    m.visible = showExpenses && p > 0.01;
    m.scale.setScalar(Math.max(0.01, 0.6 + 0.4 * p));
    m.position.y = EXPENSES[i].y + Math.sin(t * 1.2 + i * 2) * 0.05 * p;
  });

  // --- holographic dashboard (p4) ---
  const db = dashboardAt(f);
  dashBoard.visible = db.visible;
  if (db.visible) {
    drawDashboard(db.bars);
    dashBoard.material.opacity = db.alpha;
    dashBoard.position.y = 2.9 + Math.sin(t * 0.8) * 0.06;
  }
  sidePanels.forEach((m) => { m.visible = db.visible; if (db.visible) m.material.opacity = db.alpha; });
  desk.visible = sec.id === 'p4';

  // --- 50/30/20 jars (p5-p6) ---
  const showJars = jarsVisible(f);
  const fills = jarsAt(f);
  jars.forEach((j, i) => {
    j.glass.visible = showJars; j.bottom.visible = showJars; j.label.visible = showJars;
    j.fill.visible = showJars && fills[i] > 0.01;
    j.fill.scale.y = Math.max(0.001, fills[i] * 2.2);
    j.label.position.y = 0.4 + Math.sin(t * 1.0 + i * 2) * 0.02;
  });

  // --- savings VAULT (p7-p8) ---
  const vt = vaultAt(f);
  vault.visible = vt.visible;
  if (vt.visible) {
    vaultDoor.rotation.y = -vt.door * 1.85;
    vault.userData.glowPanel.visible = vt.glow > 0.05;
    vault.userData.glowPanel.material.opacity = vt.glow * 0.4;
    vaultLight.intensity = vt.glow * 3.5 + vt.door * 0.4;
  }

  // --- night table + chair visible in p3 ---
  nightTable.visible = sec.id === 'p3';
  chair.visible = sec.id === 'p3';

  // --- MAX card ---
  const r = maxAt(f);
  const idl = idle(f, 31), blink = blinkAt(f, 31);
  const bob = q(idl.bob, 2), tilt = Math.round(idl.tilt), headTilt = Math.round(idle(f, 33).headTilt);
  const key = `max|${sec.id}|${r.expr}|${r.armL}|${r.armR}|${blink}|${bob}|${tilt}|${r.walking ? q(r.step, 2) : 'x'}|${r.sit ? 'sit' : ''}|${(r.armL === 'wave' || r.armR === 'wave') ? q(Math.sin(f * 0.18), 2) : 'x'}`;
  maxCard.draw(key, (p) => {
    drawMax(p, {
      expr: r.expr, L: r.armL, R: r.armR, blink, bob, tilt, headTilt,
      wv: f * 0.18, step: r.walking ? r.step : 0, sit: r.sit,
    });
  });
  const walkBob = r.walking ? Math.abs(Math.sin(Math.PI * 2 * r.step)) * 0.05 : 0;
  const sitDrop = r.sit ? -0.5 : 0; // seated MAX sits lower, on the chair
  maxCard.place(r.pos[0], r.pos[1] + walkBob + sitDrop, r.pos[2], cam.pos, 1.0);
  const cardTint = Math.min(1, 0.58 + 0.15 * env.sunI);
  maxCard.mesh.material.color.setRGB(cardTint, cardTint * 0.985, cardTint * 0.96);

  // --- hero board ---
  const hb = heroAt(f);
  hero.visible = !!hb && hb.alpha > 0.01;
  if (hero.visible) {
    drawHero(hb.lines);
    hero.material.opacity = hb.alpha;
    _v.set(...cam.look).sub(camera.position).normalize();
    hero.position.copy(camera.position).addScaledVector(_v, 17); hero.position.y += 4.0;
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

// Pen class lives in toon.js (imported at the top with the Card class).
window.TOTAL = TOTAL;
window.COUNTS = { coins: COIN_N, rainCoins: RAIN_N, drainCoins: DRAIN_N, jarFlowCoins: JARFLOW_N, vaultFlowCoins: VAULTFLOW_N };
fontReady.then(() => { window.ready = true; });
