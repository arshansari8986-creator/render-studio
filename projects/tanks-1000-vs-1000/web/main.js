// "1000 Tanks vs 1000 Tanks" — three.js film, driven ENTIRELY by story.js frame math.
// Contract (render.mjs): window.ready, window.renderFrame(f), canvas #c 1080x1920.
import * as THREE from 'three';
import * as FX from './fx.js';
import * as T from './toon.js';
import { idle, blinkAt, q } from './motion.js';
import {
  TOTAL, secAt, camAt, envAt, mistBankAt, tankPoseAt, heroPoseAt, heroBarrelTip,
  muzzleAt, burnAt, boardAt, TANK_COUNT, SIDE_COUNT, HERO_K, abramsCentroid,
} from './story.js';

const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 3000);
const rx = (a) => a * Math.PI / 180;
scene.fog = new THREE.Fog(0xcfa87e, 20, 230);

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

// ---------- lights (hemi + sun + ONE point light for muzzle flashes) ----------
const hemi = new THREE.HemisphereLight(0xe8d2b8, 0x6b5a44, 0.85); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffdf9e, 1.6); scene.add(sun); scene.add(sun.target);
const muzzleLight = new THREE.PointLight(0xffc46b, 0, 40, 1.6); scene.add(muzzleLight);

// ---------- ground: dusty plain + dirt road along the advance axis ----------
const lam = (o) => new THREE.MeshLambertMaterial(o);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(520, 520), lam({ color: 0x8a7a58 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = 0; scene.add(ground);
const road = new THREE.Mesh(new THREE.PlaneGeometry(190, 7), lam({ color: 0x6e5f45 }));
road.rotation.x = -Math.PI / 2; road.position.y = 0.01; scene.add(road);
const rockM = lam({ color: 0x6d6250 });
for (let k = 0; k < 12; k++) {
  const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + (k % 3) * 0.35), rockM);
  const edge = k % 2 ? 1 : -1;
  r.position.set(-120 + (k * 23) % 240, 0.25, edge * (78 + (k % 4) * 4));
  r.rotation.set(k, k * 2, k * 0.5); r.scale.y = 0.65; scene.add(r);
}
const bushM = lam({ color: 0x5d5a33 });
for (let k = 0; k < 14; k++) {
  const b = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.9, 6), bushM);
  b.position.set(-110 + (k * 17.3) % 220, 0.4, (k % 2 ? 1 : -1) * (74 + (k % 5) * 3));
  scene.add(b);
}
// ---------- atmosphere pools ----------
const clouds = new FX.Clouds(scene, { count: 8, y: 55, opacity: 0.5, color: 0xe8dcc8 });
clouds.group.traverse((o) => { if (o.isSprite) o.userData.op0 = o.material.opacity; });
function makeDustBand(n, xr, yr, zr, sScale) {
  const g = FX.mistBand(scene, { y: yr[0], opacity: 0.3, count: n });
  g.traverse((o) => {
    if (!o.isSprite) return;
    o.userData.f = 0.7 + Math.random() * 0.6;
    o.position.set(xr[0] + Math.random() * (xr[1] - xr[0]), yr[0] + Math.random() * (yr[1] - yr[0]), zr[0] + Math.random() * (zr[1] - zr[0]));
    o.scale.x *= sScale; o.scale.y *= 1.15;
  });
  scene.add(g); return g;
}
const dust = makeDustBand(14, [-90, 90], [0.5, 2.0], [-70, 70], 1.4);
const smoke = new FX.Smoke(scene, 130);
const fire = new FX.Fire(scene, { max: 36, rate: 20, scale: 0.9, light: false });
fire.on = false;
const muzzle = new FX.Muzzle(scene, muzzleLight);

// smoke emitters: T-90 smoke screen (fire section), centre smoke field (smoke section), burn smoke (ring+)
const smokeEmitters = [];
for (let k = 0; k < 6; k++) {
  smokeEmitters.push({ e: smoke.addEmitter(4 + k * 1.5, 1.2, -30 + k * 12, { rate: 5, life: 3.2, scale: 1.6, opacity: 0.42, color: 0xd8d4cc, vy: 1.0 }), kind: 'screen' });
}
for (let k = 0; k < 4; k++) {
  smokeEmitters.push({ e: smoke.addEmitter(-4 + k * 4, 1.0, -18 + k * 12, { rate: 6, life: 3.6, scale: 2.0, opacity: 0.5, color: 0xb8b0a2, vy: 0.9 }), kind: 'field' });
}
const burnEmitter = smoke.addEmitter(0, 1.5, 0, { rate: 7, life: 3.0, scale: 1.4, opacity: 0.55, color: 0x2e2a26, vy: 1.4 });

// ---------- THE ARMIES: 4 InstancedMeshes x 2000 instances = exactly 2000 tanks ----------
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _v3 = new THREE.Vector3(), _s3 = new THREE.Vector3(1, 1, 1);
const _up = new THREE.Vector3(0, 1, 0);
const ZERO_M = new THREE.Matrix4().makeScale(0, 0, 0);
const trackGeo = new THREE.BoxGeometry(3.2, 0.55, 2.1);
const hullGeo = new THREE.BoxGeometry(2.9, 0.8, 1.8);
const turretGeo = new THREE.BoxGeometry(1.5, 0.55, 1.2);
const barrelGeo = new THREE.CylinderGeometry(0.09, 0.11, 2.4, 8);
barrelGeo.rotateZ(-Math.PI / 2); barrelGeo.translate(1.9, 0, 0); // axis along +x, base at turret centre
const abramsCol = new THREE.Color(0xb59a5e), abramsTur = new THREE.Color(0xa8894f);
const t90Col = new THREE.Color(0x5d6b40), t90Tur = new THREE.Color(0x4e5c36);
const trackCol = new THREE.Color(0x3a352c);
function makeInstanced(geo, mat) {
  const m = new THREE.InstancedMesh(geo, mat, TANK_COUNT);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.frustumCulled = false;
  scene.add(m);
  return m;
}
const trackMesh = makeInstanced(trackGeo, lam({ color: 0xffffff }));
const hullMesh = makeInstanced(hullGeo, lam({ color: 0xffffff }));
const turretMesh = makeInstanced(turretGeo, lam({ color: 0xffffff }));
const barrelMesh = makeInstanced(barrelGeo, lam({ color: 0xffffff }));
for (let i = 0; i < TANK_COUNT; i++) {
  const side = i < SIDE_COUNT ? 0 : 1;
  trackMesh.setColorAt(i, trackCol);
  hullMesh.setColorAt(i, side === 0 ? abramsCol : t90Col);
  turretMesh.setColorAt(i, side === 0 ? abramsTur : t90Tur);
  barrelMesh.setColorAt(i, side === 0 ? new THREE.Color(0x8a744a) : new THREE.Color(0x3f4c2e));
}
trackMesh.instanceColor.needsUpdate = true; hullMesh.instanceColor.needsUpdate = true;
turretMesh.instanceColor.needsUpdate = true; barrelMesh.instanceColor.needsUpdate = true;

// ---------- hero tanks (grid members HERO_K of each side, drawn in detail) ----------
function flagTexture(kind) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 84;
  const g = c.getContext('2d');
  if (kind === 'us') {
    for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? '#f2ead8' : '#b22234'; g.fillRect(0, i * 12, 128, 12); }
    g.fillStyle = '#3c3b6e'; g.fillRect(0, 0, 52, 48);
    g.fillStyle = '#ffffff';
    for (let r = 0; r < 4; r++) for (let s = 0; s < 5; s++) { g.beginPath(); g.arc(6 + s * 10, 7 + r * 11, 2, 0, 7); g.fill(); }
  } else {
    g.fillStyle = '#f2f2f2'; g.fillRect(0, 0, 128, 28);
    g.fillStyle = '#1e4fa3'; g.fillRect(0, 28, 128, 28);
    g.fillStyle = '#c0392b'; g.fillRect(0, 56, 128, 28);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function buildHeroTank(side) {
  const g = new THREE.Group(); g.rotation.order = 'YXZ';
  const abrams = side === 0;
  const hullMat = lam({ color: abrams ? 0xb59a5e : 0x5d6b40 });
  const turMat = lam({ color: abrams ? 0xa8894f : 0x4e5c36 });
  const darkMat = lam({ color: 0x3a352c });
  const add = (geo, mat, x, y, z, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  add(new THREE.BoxGeometry(3.3, 0.55, 2.15), darkMat, 0, 0.28, 0); // tracks
  add(new THREE.BoxGeometry(3.0, 0.85, 1.85), hullMat, 0, 0.95, 0); // hull
  add(new THREE.BoxGeometry(1.2, 0.35, 1.9), hullMat, 1.1, 1.15, 0); // sloped glacis
  const tur = new THREE.Group(); tur.position.set(-0.2, 1.55, 0); g.add(tur);
  add(new THREE.BoxGeometry(1.7, 0.6, 1.3), turMat, 0, 0, 0, tur); // turret
  const barrelLen = abrams ? 3.4 : 2.6;
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, barrelLen, 8), darkMat);
  barrel.rotation.z = -Math.PI / 2; barrel.position.set(0.85 + barrelLen / 2, 0.08, 0); tur.add(barrel);
  // hatch + antenna + details
  add(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 10), darkMat, -0.4, 0.36, 0.3, tur);
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 1.6, 5), darkMat);
  ant.position.set(-0.9, 0.9, -0.5); tur.add(ant);
  if (!abrams) { // T-90 reactive armour bricks on the turret
    for (let k = 0; k < 4; k++) add(new THREE.BoxGeometry(0.28, 0.22, 0.28), lam({ color: 0x46532f }), -0.6 + k * 0.4, 0.38, 0.55, tur);
  } else { // Abrams bustle rack
    add(new THREE.BoxGeometry(0.5, 0.3, 1.1), darkMat, -1.0, 0.1, 0, tur);
  }
  // flag on a pole at the rear
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.7, 5), darkMat);
  pole.position.set(-1.35, 2.2, -0.7); g.add(pole);
  const flagGeo = new THREE.PlaneGeometry(1.15, 0.75, 8, 3); flagGeo.translate(-0.575, 0, 0);
  const flag = new THREE.Mesh(flagGeo, lam({ map: flagTexture(abrams ? 'us' : 'ru'), side: THREE.DoubleSide }));
  flag.position.set(-1.35, 2.95, -0.7); FX.clothInit(flag, { amp: 0.16, freq: 3, speed: 7 });
  g.add(flag);
  scene.add(g);
  return { g, tur, flag, barrelLen };
}
const heroAbrams = buildHeroTank(0);
const heroT90 = buildHeroTank(1);

// ---------- CHARACTER CARDS (tank commanders) ----------
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
const usCard = new Card();
const ruCard = new Card();

// ---------- title / message board ----------
const boardCanvas = document.createElement('canvas'); boardCanvas.width = 1024; boardCanvas.height = 320;
const boardTex = new THREE.CanvasTexture(boardCanvas); boardTex.colorSpace = THREE.SRGBColorSpace;
const board = new THREE.Mesh(new THREE.PlaneGeometry(11, 3.44), new THREE.MeshBasicMaterial({ map: boardTex, transparent: true, depthTest: false, fog: false }));
board.renderOrder = 10; board.visible = false; scene.add(board);
let boardKey = '';
function drawBoard(text) {
  if (text === boardKey) return; boardKey = text;
  const g = boardCanvas.getContext('2d');
  g.fillStyle = '#1d2733'; g.fillRect(0, 0, 1024, 320);
  g.strokeStyle = '#ffd76a'; g.lineWidth = 10; g.strokeRect(14, 14, 996, 292);
  g.fillStyle = '#ffd76a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  let fs = 120; g.font = `bold ${fs}px Arial`;
  while (g.measureText(text).width > 930 && fs > 28) { fs -= 7; g.font = `bold ${fs}px Arial`; }
  g.fillText(text, 512, 166); boardTex.needsUpdate = true;
}

// ---------- per-frame ----------
let lastF = -1;
const _v = new THREE.Vector3();
function setInst(mesh, i, x, y, z, yaw) {
  _q.setFromAxisAngle(_up, yaw);
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
  clouds.group.traverse((o) => { if (o.isSprite) { o.material.color.setRGB(...env.cloud); o.material.opacity = o.userData.op0 * (env.cop / 0.55); } });
  const mb = mistBankAt(f);
  dust.traverse((o) => { if (o.isSprite) o.material.opacity = (mb * 0.25 + env.mist * 0.08) * o.userData.f; });

  // --- the armies: exactly 1000 + 1000 (heroes drawn separately, same poses) ---
  for (let i = 0; i < TANK_COUNT; i++) {
    const pose = tankPoseAt(i, f);
    if (pose.k === HERO_K) { // hero tank: hide instanced copies, drawn as a group
      trackMesh.setMatrixAt(i, ZERO_M); hullMesh.setMatrixAt(i, ZERO_M);
      turretMesh.setMatrixAt(i, ZERO_M); barrelMesh.setMatrixAt(i, ZERO_M);
      continue;
    }
    const [x, y, z] = pose.p;
    setInst(trackMesh, i, x, y + 0.28, z, pose.ry);
    setInst(hullMesh, i, x, y + 0.95, z, pose.ry);
    setInst(turretMesh, i, x - Math.cos(pose.ry) * 0.2, y + 1.5, z + Math.sin(pose.ry) * 0.2, pose.try);
    setInst(barrelMesh, i, x - Math.cos(pose.try) * 0.2, y + 1.58, z + Math.sin(pose.try) * 0.2, pose.try);
  }
  trackMesh.instanceMatrix.needsUpdate = true; hullMesh.instanceMatrix.needsUpdate = true;
  turretMesh.instanceMatrix.needsUpdate = true; barrelMesh.instanceMatrix.needsUpdate = true;

  // --- hero tanks ---
  const heroes = [[heroAbrams, 0], [heroT90, 1]];
  for (const [hero, side] of heroes) {
    const pose = heroPoseAt(side, f);
    hero.g.position.set(...pose.p);
    hero.g.rotation.set(0, pose.ry, 0);
    hero.tur.rotation.y = pose.try - pose.ry;
    FX.clothWave(hero.flag, t);
  }

  // --- smoke emitters by section ---
  for (const s of smokeEmitters) {
    s.e.on = (s.kind === 'screen' && ['fire', 'smoke'].includes(sec.id)) ||
             (s.kind === 'field' && sec.id === 'smoke');
  }
  const burn = burnAt(f);
  burnEmitter.on = !!burn;
  if (burn) { burnEmitter.x = burn[0]; burnEmitter.y = burn[1]; burnEmitter.z = burn[2]; }
  fire.on = !!burn;
  if (burn) { fire.x = burn[0]; fire.y = burn[1] + 0.4; fire.z = burn[2]; }

  // --- muzzle flashes ---
  const shots = muzzleAt(f);
  if (shots.length) {
    for (const s of shots) muzzle.pop(s[0], s[1], s[2], t, 3.4);
  }

  // --- commander cards (on the hero hatches) ---
  const cardTint = Math.min(1, 0.58 + 0.15 * env.sunI);
  const tintCard = (card) => card.mesh.material.color.setRGB(cardTint, cardTint * 0.985, cardTint * 0.96);
  const drawCommander = (card, side, outfit, seed) => {
    const pose = heroPoseAt(side, f);
    const show = ['hook', 'abrams', 't90', 'advance', 'fire', 'ring', 'payoff'].includes(sec.id) &&
      !(sec.id === 'abrams' && side === 1) && !(sec.id === 't90' && side === 0);
    if (!show) { card.hide(); return; }
    const expr = sec.id === 'payoff' ? (side === 0 ? 'grin' : 'nervous')
      : sec.id === 'ring' ? (side === 0 ? 'stern' : 'grin')
      : sec.id === 'fire' ? 'stern' : 'neutral';
    const idl = idle(f, seed), blink = blinkAt(f, seed);
    const key = `C${side}|${sec.id}|${expr}|${blink}|${q(idl.bob, 2)}|${Math.round(idl.tilt)}`;
    card.draw(key, (p) => T.romanFront(p, outfit, {
      seed, expr, R: 'hang', L: 'hang', blink, bob: q(idl.bob, 2),
      tilt: Math.round(idl.tilt), headTilt: Math.round(idle(f, seed + 2).headTilt), wv: f * 0.18, step: 0,
    }));
    card.place(pose.p[0], pose.p[1] + 1.35, pose.p[2], cam.pos, 0.92);
    tintCard(card);
  };
  drawCommander(usCard, 0, 'soldier44a', 41);
  drawCommander(ruCard, 1, 'officer44', 47);

  // --- board ---
  const bd = boardAt(f);
  board.visible = !!bd && bd.alpha > 0.01;
  if (board.visible) {
    drawBoard(bd.text);
    board.material.opacity = bd.alpha;
    _v.set(...cam.look).sub(camera.position).normalize();
    board.position.copy(camera.position).addScaledVector(_v, 17); board.position.y += 3.6;
    board.lookAt(camera.position);
    const bw = 2 * 17 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * (1080 / 1920) * 0.92;
    board.scale.set(bw / 11, bw / 11, 1);
  }

  // --- FX updates: EVERY frame, EVERY effect ---
  smoke.update(t, dt);
  clouds.update(t, dt);
  fire.update(t, dt);
  muzzle.update(t);

  renderer.render(scene, camera);
  lastF = f;
  return true;
};
window.TOTAL = TOTAL;
window.COUNTS = { abrams: SIDE_COUNT, t90: SIDE_COUNT, total: TANK_COUNT };
window.ready = true;
