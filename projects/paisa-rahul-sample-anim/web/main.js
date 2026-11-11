// REAL 3D animation sample — Rahul ₹30,000 opening (P0 + P1), 18.13 s, 544 frames.
// three.js film driven ENTIRELY by story.js frame math.
// Contract (render.mjs): window.ready, window.renderFrame(f), canvas #c 1080x1920.
import * as THREE from 'three';
import * as FX from './fx.js';
import * as T from './toon.js';
import { idle, blinkAt, q } from './motion.js';
import { DEVANAGARI_BOLD_B64 } from './fonts.js';
import {
  TOTAL, secAt, camAt, envAt, rahulAt, beatAt, pileAt, rainActive, rainU, rainU2,
  drainActive, drainU, walletAt, captionAt, heroAt,
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

// ---------- embedded Devanagari font ----------
const DEV_FONT = '"Noto Sans Devanagari"';
const fontReady = (async () => {
  try {
    const face = new FontFace('Noto Sans Devanagari', `url(data:font/ttf;base64,${DEVANAGARI_BOLD_B64})`, { weight: '700' });
    await face.load();
    document.fonts.add(face);
    await document.fonts.load(`700 100px ${DEV_FONT}`, '₹30,000');
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
// low teal backdrop wall
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

// ---------- RAIN coins: fall from the sky onto the pile (48 instanced) ----------
const RAIN_N = 48;
const rainMesh = new THREE.InstancedMesh(coinGeo, lam({ color: 0xf2c14e }), RAIN_N);
rainMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
rainMesh.frustumCulled = false;
scene.add(rainMesh);
const rainLayout = [];
for (let i = 0; i < RAIN_N; i++) {
  const ang = hash(i * 3 + 7) * Math.PI * 2;
  const rad = 2.6 * Math.sqrt(hash(i * 5 + 11));
  rainLayout.push({
    x: PILE_C[0] + Math.cos(ang) * rad,
    z: PILE_C[2] + Math.sin(ang) * rad * 0.8,
    spin: hash(i * 9 + 4) * Math.PI * 2,
    wob: hash(i * 13 + 6) * Math.PI * 2,
  });
}

// ---------- DRAIN coins: fly away from the pile in arcs (24 meshes) ----------
const DRAIN_N = 24;
const drainCoins = [];
for (let k = 0; k < DRAIN_N; k++) {
  const m = new THREE.Mesh(coinGeo, lam({ color: 0xd9a441 }));
  m.visible = false; scene.add(m); drainCoins.push(m);
}
const drainLayout = [];
for (let k = 0; k < DRAIN_N; k++) {
  const ang = (k / DRAIN_N) * Math.PI * 2 + hash(k * 7 + 2);
  drainLayout.push({
    dx: Math.cos(ang) * (3.5 + hash(k * 3 + 1) * 3.0),
    dz: Math.sin(ang) * 2.0 - 1.5,
    h: 2.0 + hash(k * 5 + 3) * 2.5,
    spin: hash(k * 11 + 8) * 6,
  });
}

// ---------- WALLET: opens during b3, visibly empty ----------
const wallet = new THREE.Group();
let walletFlap;
{
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.62, 0.1), lam({ color: 0x5a3b2a }));
  body.position.y = 0; wallet.add(body);
  const inner = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.5), lam({ color: 0x1c1210 }));
  inner.position.set(0, 0, 0.06); wallet.add(inner);
  // flap hinged at the top edge: pivot group at top, flap hangs down when closed
  const pivot = new THREE.Group();
  pivot.position.set(0, 0.31, 0.05);
  const flap = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.6, 0.06), lam({ color: 0x7a4f34 }));
  flap.position.y = -0.3; pivot.add(flap);
  wallet.add(pivot);
  walletFlap = pivot;
  // a couple of card slots (empty — no cash)
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.02), lam({ color: 0x8a6d4f }));
  slot.position.set(0, -0.12, 0.07); wallet.add(slot);
  wallet.visible = false;
  scene.add(wallet);
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

// ---------- CHARACTER CARD (Rahul) ----------
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
    const px = ln.small ? 52 : (n === 1 ? 150 : 110);
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
  const sec = secAt(f), env = envAt(f), beat = beatAt(f);

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

  // --- salary pile ---
  const pileN = Math.round(pileAt(f) * COIN_N);
  for (let i = 0; i < COIN_N; i++) {
    if (i >= pileN) { coinMesh.setMatrixAt(i, ZERO_M); continue; }
    const L = coinLayout[i];
    setInst(coinMesh, i, L.x, L.y, L.z, L.spin, L.tilt);
  }
  coinMesh.instanceMatrix.needsUpdate = true;

  // --- RAIN coins falling from the sky ---
  const raining = rainActive(f);
  for (let i = 0; i < RAIN_N; i++) {
    if (!raining) { rainMesh.setMatrixAt(i, ZERO_M); continue; }
    const u = f < 470 ? rainU(f, i, RAIN_N) : rainU2(f, i, RAIN_N);
    const L = rainLayout[i];
    const y = 13 - u * 12.6; // falls from sky to the pile
    const x = L.x + Math.sin(t * 2 + L.wob) * 0.25; // slight sideways drift
    setInst(rainMesh, i, x, y, L.z, L.spin + t * 4 + i, 0.4);
  }
  rainMesh.instanceMatrix.needsUpdate = true;

  // --- DRAIN coins flying away ---
  const draining = drainActive(f);
  for (let k = 0; k < DRAIN_N; k++) {
    const m = drainCoins[k];
    if (!draining) { m.visible = false; continue; }
    const u = drainU(f, k, DRAIN_N);
    const L = drainLayout[k];
    m.visible = u > 0.02 && u < 0.98;
    const sx = PILE_C[0], sy = 0.4, sz = PILE_C[2];
    const x = sx + L.dx * u;
    const y = sy + (L.h * 2.2) * u - 3.0 * u * u + Math.sin(u * Math.PI) * L.h * 0.6;
    const z = sz + L.dz * u;
    m.position.set(x, y, z);
    m.rotation.set(t * 5 + k, t * 3 + k, L.spin * u);
    const s = 1 - 0.55 * u; // shrinks as it flies away
    m.scale.setScalar(Math.max(0.1, s));
  }

  // --- WALLET opens, empty ---
  const w = walletAt(f);
  wallet.visible = w.visible;
  if (w.visible) {
    wallet.position.set(w.pos[0], w.pos[1], w.pos[2]);
    wallet.rotation.set(0, Math.atan2(cam.pos[0] - w.pos[0], cam.pos[2] - w.pos[2]), 0);
    walletFlap.rotation.x = -w.flap * 1.9; // flap swings open
    const pulse = 0.5 * (1 + Math.sin(t * 3) * 0.02); // small wallet, held at hand height
    wallet.scale.setScalar(pulse);
  }

  // --- Rahul: walks, gestures, reacts — step phase drives the leg cycle ---
  const r = rahulAt(f);
  if (r.visible) {
    const idl = idle(f, 31), blink = blinkAt(f, 31);
    const key = `${sec.id}|${beat.id}|${r.expr}|${r.armL}|${r.armR}|${blink}|${q(idl.bob, 2)}|${Math.round(idl.tilt)}|${r.walking ? q(r.step, 2) : 'x'}`;
    rahulCard.draw(key, (p) => T.romanFront(p, 'civA', {
      seed: 31, expr: r.expr, R: r.armR, L: r.armL, blink, bob: q(idl.bob, 2),
      tilt: Math.round(idl.tilt), headTilt: Math.round(idle(f, 33).headTilt), wv: f * 0.18, step: r.walking ? r.step : 0,
    }));
    // walk bob: body rises/falls with the step cycle; standing bob from idle
    const walkBob = r.walking ? Math.abs(Math.sin(Math.PI * 2 * r.step)) * 0.05 : 0;
    rahulCard.place(r.pos[0], r.pos[1] + walkBob, r.pos[2], cam.pos, 1.0);
    const cardTint = Math.min(1, 0.58 + 0.15 * env.sunI);
    rahulCard.mesh.material.color.setRGB(cardTint, cardTint * 0.985, cardTint * 0.96);
  } else rahulCard.hide();

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
window.COUNTS = { coins: COIN_N, rainCoins: RAIN_N, drainCoins: DRAIN_N };
fontReady.then(() => { window.ready = true; });
