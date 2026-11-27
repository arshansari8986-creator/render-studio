// LOCATIONS A (street) + C (home) — Gym Wala v2.
// ANTI-GLITCH RULES (user, 27 Nov 2026 — v1 me glitching tha):
// - Koi do surfaces COPLANAR nahi: deewaar par lagne wala har plane/board/frame deewaar
//   se >=0.01 aage; floor par bichhne wali har cheez floor plane se >=0.003 upar; jo bhi
//   do planes overlap karte hain unke beech hamesha gap hai (neeche har offset comment me).
// - Koi per-frame random / incremental state nahi: shutter sirf shutterOpen(f) se scale
//   hota hai (pure function), bulb glow static hai, koi Math.random / Date.now nahi.
// - Sab kuch deterministic: wahi frame dobara render ho to wahi pixels.
import * as THREE from 'three';
import { tex, planks, plaster, tiles, stone, grass } from './paint.js';

const lam = (o) => new THREE.MeshLambertMaterial(o);
const bas = (o) => new THREE.MeshBasicMaterial(o);
const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
const cyl = (rt, rb, h, mat, seg = 12) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
function bar2D(x0, y0, x1, y1, z, mat, r = 0.02) {
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
  const m = cyl(r, r, len, mat, 6);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, z);
  m.rotation.z = -Math.atan2(dx, dy);
  return m;
}
function textBoard(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
const boardMesh = (w, h, texB) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), lam({ map: texB }));
function dawnSkyTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256;
  const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#7fa8c9'); gr.addColorStop(0.55, '#f6c890'); gr.addColorStop(1, '#ffe0b0');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function duskSkyTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256;
  const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#5a6a8a'); gr.addColorStop(0.6, '#c98a5a'); gr.addColorStop(1, '#e8b078');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// v3: ghar ki khidki se SUBAH ki halki roshni (pale gold morning) — v2 ka dull-evening sky hata.
function morningSkyTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256;
  const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#a8c4d8'); gr.addColorStop(0.55, '#f6d9a0'); gr.addColorStop(1, '#ffedbe');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// Fee board texture — wahi text jo gym ke andar wale board par hai (alag mesh, text ek hi).
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
const gymSignTex = textBoard(640, 160, (g, w, h) => {
  g.fillStyle = '#3f4a44'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#f8fafc'; g.font = 'bold 64px Arial'; g.textAlign = 'center';
  // SMOKE FIX (round 3, f1950): "GYM • FITNESS CENTRE" 72px me 640px canvas se chauda tha —
  // texture ke kinaro par "GY" aur "TRE" kate the (board par "M • FITNE" dikhta tha).
  // Ab "GYM • FITNESS" 64px — poora text canvas ke andar.
  g.fillText('GYM • FITNESS', w / 2, 102);
});

// =====================================================================
// LOC A — STREET (sadak x-axis par; gym facade z=-2; dawn)
// Depth layers: road/pavement foreground | hero + A-board + cycle mid | facade/sky deep.
// =====================================================================
export function buildStreet() {
  const S = new THREE.Group();
  // --- SKY (z=-9, sabse peeche; v1 gym skyOut jaisa bas plane) ---
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(26, 9), bas({ map: dawnSkyTex(), fog: false }));
  sky.position.set(0, 3.5, -9); S.add(sky);
  // Hazy distant buildings (sky se 0.5+ aage, ek dusre se alag z — koi coplanar nahi)
  [[-6, 2.4, 0x9a8f7a, -8.2], [1, 3.2, 0x8a9aaa, -8.4], [6.5, 2.8, 0xb08a7a, -8.2]].forEach(([bx, bh, col, bz]) => {
    const b = box(3.4, bh, 0.7, lam({ color: col })); b.position.set(bx, bh / 2, bz); S.add(b);
  });
  // --- ROAD (y=0 plane, z 0.5..5.0) + PAVEMENT (box, top y=0.06) + KERB ---
  const road = new THREE.Mesh(new THREE.PlaneGeometry(16, 4.5), lam({ color: 0x3a3f46 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, 2.75); road.receiveShadow = true; S.add(road);
  // Dashed centre line — thin boxes, road plane se 0.003 upar (coplanar nahi)
  for (let i = 0; i < 5; i++) {
    const dash = box(0.12, 0.01, 0.7, lam({ color: 0xe8e8e8 }));
    dash.position.set(-5 + i * 2.5, 0.008, 2.75); S.add(dash);
  }
  const pave = box(14, 0.06, 2.5, lam({ map: tex(tiles(53), 10, 2), color: 0x8a8378 }));
  pave.position.set(0, 0.03, -0.75); pave.receiveShadow = true; S.add(pave);
  const kerb = box(14, 0.1, 0.12, lam({ color: 0x6b7280 })); kerb.position.set(0, 0.05, 0.5); S.add(kerb);

  // --- GYM FACADE (muted terracotta brick #a9705a + slate-blue band, x -5..5, y 0..4.5, face z=-2) ---
  const facade = new THREE.Mesh(new THREE.PlaneGeometry(10, 4.5), lam({ color: 0xa9705a }));
  facade.position.set(0, 2.25, -2); facade.receiveShadow = true; S.add(facade);
  // Slate-blue band — box, back face facade se 0.01 aage (centre -1.96, depth 0.06 -> -1.99..-1.93)
  const band = box(10, 0.5, 0.06, lam({ color: 0x5b7a8c })); band.position.set(0, 0.95, -1.94); S.add(band);
  // Gym sign board — plane facade se 0.08 aage (z=-1.92)
  const sign = boardMesh(3.6, 0.9, gymSignTex); sign.position.set(0, 3.7, -1.92); S.add(sign);
  // Sign frame — 4 thin boxes, sign plane se 0.01 peeche (z=-1.93), facade se 0.07 aage
  [[0, 4.17, 3.7, 0.06], [0, 3.23, 3.7, 0.06], [-1.83, 3.7, 0.06, 1.0], [1.83, 3.7, 0.06, 1.0]].forEach(([fx, fy, fw, fh]) => {
    const f = box(fw, fh, 0.02, lam({ color: 0x3f4a44 })); f.position.set(fx, fy, -1.93); S.add(f);
  });

  // --- SHUTTER (x -2.5..0.5, y 0..3.0, z=-1.95) — rolling shutter, upar khulta hai ---
  // Interior (dark) — plane shutter se 0.15 peeche (z=-2.10); shutter band ho to dikhta nahi.
  const interior = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.0), lam({ color: 0x2a2118 }));
  interior.position.set(-1.0, 1.5, -2.10); S.add(interior);
  // Interior warm glow strip (andar ki roshni) — interior plane se 0.02 aage, static opacity.
  const innerGlow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.5), bas({ color: 0xffc27a, transparent: true, opacity: 0.5, fog: false }));
  innerGlow.position.set(-1.0, 2.5, -2.08); S.add(innerGlow);
  // Interior counter silhouette (andar jhaankne par kuch dikhe) — interior se aage, floor par.
  const innerCounter = box(1.6, 0.9, 0.5, lam({ color: 0x8a6844 })); innerCounter.position.set(-1.0, 0.45, -2.3); S.add(innerCounter);
  // Shutter slats — ONE textured panel (alag slat planes overlap karte to z-fight hota).
  const slatTex = textBoard(256, 256, (g, w, h) => {
    g.fillStyle = '#5b7a8c'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16) { g.fillStyle = '#46606e'; g.fillRect(0, y, w, 3); g.fillStyle = '#7d95a5'; g.fillRect(0, y + 3, w, 2); }
  });
  slatTex.wrapS = slatTex.wrapT = THREE.RepeatWrapping; slatTex.repeat.set(1, 3);
  const shutterGeo = new THREE.BoxGeometry(3.0, 3.0, 0.06); shutterGeo.translate(0, -1.5, 0); // origin = top edge
  const shutter = new THREE.Mesh(shutterGeo, lam({ map: slatTex }));
  shutter.position.set(-1.0, 3.0, -1.95); S.add(shutter);
  // Shutter side rails — thin boxes, shutter se 0.02 aage (z=-1.91), facade se 0.09 aage
  [-2.55, 0.55].forEach((rx) => {
    const rail = box(0.08, 3.0, 0.04, lam({ color: 0x374151 })); rail.position.set(rx, 1.5, -1.91); S.add(rail);
  });
  // Doormat (shutter ke saamne, pavement top se 0.005 upar — thin box, coplanar nahi)
  const mat = box(1.4, 0.01, 0.6, lam({ color: 0x7c2d12 })); mat.position.set(-1.0, 0.065, -1.4); S.add(mat);

  // --- A-BOARD (outdoor fee board, pavement par, (-3.0, 0, -0.8), rot.y 0.35) ---
  const aboardG = new THREE.Group();
  const aFront = boardMesh(1.1, 1.4, feeBoardTex); aFront.position.set(0, 0.75, 0.02); aFront.rotation.x = -0.12; aboardG.add(aFront);
  const aBack = boardMesh(1.1, 1.4, feeBoardTex); aBack.position.set(0, 0.75, -0.02); aBack.rotation.x = 0.12; aBack.rotation.y = Math.PI; aboardG.add(aBack);
  aboardG.position.set(-3.0, 0.06, -0.8); aboardG.rotation.y = 0.35; S.add(aboardG);

  // --- NEIGHBOUR LEFT: chai stall (-6.2, 0, -2) — front z=-2.2 (facade se 0.2 peeche) ---
  const stall = box(2.2, 2.2, 0.9, lam({ color: 0xcbb98a }));
  stall.position.set(-6.2, 1.1, -2.65); S.add(stall);
  // Awning — sloped thin box, stall front se aage, upar (hero face-line se upar)
  const awn = box(2.4, 0.05, 1.0, lam({ color: 0xb45309 })); awn.position.set(-6.2, 2.5, -1.9); awn.rotation.x = 0.35; S.add(awn);
  // Crates (grounded, stall ke saamne) + kettle (crate par)
  const crate1 = box(0.6, 0.6, 0.6, lam({ map: tex(planks(47), 1, 1) })); crate1.position.set(-5.6, 0.36, -1.2); S.add(crate1);
  const crate2 = box(0.45, 0.45, 0.45, lam({ map: tex(planks(48), 1, 1) })); crate2.position.set(-5.6, 0.885, -1.2); S.add(crate2);
  const kettle = cyl(0.09, 0.12, 0.22, lam({ color: 0x9ca3af }), 10); kettle.position.set(-5.6, 1.22, -1.2); S.add(kettle);
  const kettleSpout = cyl(0.02, 0.03, 0.18, lam({ color: 0x9ca3af }), 6);
  kettleSpout.position.set(-5.45, 1.22, -1.2); kettleSpout.rotation.z = -0.7; S.add(kettleSpout);
  // --- NEIGHBOUR RIGHT: building (6.0, 0, -2) — band dukaan shutter + poster ---
  const rBuild = box(2.6, 3.6, 0.9, lam({ color: 0x8a9a8b }));
  rBuild.position.set(6.0, 1.8, -2.65); S.add(rBuild);
  const rShutter = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.2), lam({ color: 0x64748b }));
  rShutter.position.set(6.0, 1.1, -2.14); S.add(rShutter); // building front (-2.2) se 0.06 aage
  const rPosterTex = textBoard(256, 320, (g, w, h) => {
    g.fillStyle = '#f8fafc'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#9c6644'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#9c6644'; g.font = 'bold 44px Arial'; g.textAlign = 'center';
    g.fillText('CHAI', w / 2, 130); g.fillText('₹10', w / 2, 200);
  });
  const rPoster = boardMesh(0.7, 0.88, rPosterTex); rPoster.position.set(5.0, 2.2, -2.13); S.add(rPoster);

  // --- LAMP POST (-4.6, 0, 0.2), height 3.2, arm road ki taraf (subah band, glow nahi) ---
  const pole = cyl(0.05, 0.07, 3.2, lam({ color: 0x1f2937 }), 10); pole.position.set(-4.6, 1.6, 0.2); S.add(pole);
  const arm = cyl(0.035, 0.035, 0.9, lam({ color: 0x1f2937 }), 8);
  arm.rotation.x = Math.PI / 2; arm.position.set(-4.6, 3.15, 0.6); S.add(arm);
  const lampHead = box(0.22, 0.12, 0.3, lam({ color: 0x374151 })); lampHead.position.set(-4.6, 3.1, 1.0); S.add(lampHead);
  // Lamp glass — Lambert (unlit, subah band), head se 0.01 neeche, koi glow nahi
  const lampGlass = box(0.16, 0.06, 0.24, lam({ color: 0x9ca3af })); lampGlass.position.set(-4.6, 3.03, 1.0); S.add(lampGlass);

  // --- PARKED CYCLE (3.6, 0, -1.7), facade ke paas — dono wheels zameen par ---
  const cycleG = new THREE.Group();
  const wheelMat = lam({ color: 0x1f2937 });
  [-0.45, 0.45].forEach((dx) => {
    const wh = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 8, 18), wheelMat);
    wh.position.set(dx, 0.3, 0); cycleG.add(wh);
  });
  const cFrame = lam({ color: 0x5b7a8c });
  cycleG.add(bar2D(-0.45, 0.3, 0.05, 0.7, 0, cFrame, 0.025));
  cycleG.add(bar2D(0.45, 0.3, 0.05, 0.7, 0, cFrame, 0.025));
  cycleG.add(bar2D(0.05, 0.7, -0.1, 0.62, 0, cFrame, 0.025));
  const cSeat = box(0.22, 0.04, 0.1, lam({ color: 0x451a03 })); cSeat.position.set(-0.1, 0.75, 0); cycleG.add(cSeat);
  cycleG.position.set(3.6, 0.06, -1.7); S.add(cycleG); // pavement top (0.06) par khada
  // --- DUSTBIN (4.4, 0, -1.5) + THELA (parked, -4.9, 0, 1.2) ---
  const bin = cyl(0.28, 0.24, 0.7, lam({ color: 0x365314 }), 12); bin.position.set(4.4, 0.41, -1.5); S.add(bin);
  const binLid = cyl(0.3, 0.3, 0.05, lam({ color: 0x1f2937 }), 12); binLid.position.set(4.4, 0.78, -1.5); S.add(binLid);
  const thelaG = new THREE.Group();
  const bed = box(1.6, 0.08, 0.9, lam({ map: tex(planks(49), 1, 1) })); bed.position.y = 0.55; thelaG.add(bed);
  [-0.7, 0.7].forEach((dx) => {
    const w = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 8, 16), lam({ color: 0x1f2937 }));
    w.position.set(dx, 0.28, 0.48); thelaG.add(w);
  });
  const handle = cyl(0.025, 0.025, 0.9, lam({ color: 0x4b5563 }), 6);
  handle.rotation.x = 0.9; handle.position.set(0, 0.75, 1.0); thelaG.add(handle);
  const sack = box(0.9, 0.35, 0.6, lam({ color: 0xd6c49a })); sack.position.set(-0.2, 0.77, 0); thelaG.add(sack);
  thelaG.position.set(-4.9, 0, 1.2); thelaG.rotation.y = 0.3; S.add(thelaG);
  // --- POTTED PLANT (facade ke paas, dressing) ---
  const pot = cyl(0.22, 0.16, 0.35, lam({ color: 0xb45309 }), 10); pot.position.set(2.2, 0.235, -1.7); S.add(pot);
  const bush = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), lam({ color: 0x365314 }));
  bush.position.set(2.2, 0.62, -1.7); S.add(bush);

  S.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  // Shutter control — PURE function of shutterOpen(f): scale.y = 1 - open (origin top edge).
  S.userData.applyShutter = (open) => { shutter.scale.y = Math.max(0.02, 1 - open); };
  S.userData.applyShutter(0);
  return S;
}

// =====================================================================
// LOC C — HOME (ek MEMBER ka ghar, hero ka kamra NAHI — v3; x -4..4, back wall z=-5, ceiling y=3.2)
// Depth layers: rug/table foreground | member mid | back wall/window deep. SUBAH ka mood.
// =====================================================================
export function buildHome() {
  const S = new THREE.Group();
  // --- FLOOR (lakdi, y=0) + RUG (plane, floor se 0.015 upar — coplanar nahi) ---
  // MOVIE RULE (27 Nov): ghar ka farsh planks(54) — planks(44) Chhat me bhi tha.
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), lam({ map: tex(planks(54), 3, 3) }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -1.5); floor.receiveShadow = true; S.add(floor);
  const rugTex = textBoard(256, 170, (g, w, h) => {
    g.fillStyle = '#7c2d12'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#f8fafc'; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#f8fafc'; g.beginPath(); g.arc(w / 2, h / 2, 34, 0, 7); g.fill();
    g.fillStyle = '#7c2d12'; g.beginPath(); g.arc(w / 2, h / 2, 22, 0, 7); g.fill();
  });
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), lam({ map: rugTex }));
  rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.015, -2.0); rug.receiveShadow = true; S.add(rug);
  // --- WALLS + CEILING ---
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), lam({ color: 0x8ea2ae }));
  backWall.position.set(0, 1.6, -5); backWall.receiveShadow = true; S.add(backWall);
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), lam({ color: 0x7d939f }));
  leftWall.rotation.y = Math.PI / 2; leftWall.position.set(-4, 1.6, -1.5); S.add(leftWall);
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), lam({ color: 0x7d939f }));
  rightWall.rotation.y = -Math.PI / 2; rightWall.position.set(4, 1.6, -1.5); S.add(rightWall);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), lam({ color: 0xa8bcc8 }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 3.2, -1.5); S.add(ceil);

  // --- BED (bayein, -2.6, 0, -3.8) — headboard back wall se tika ---
  const headboard = box(1.5, 1.1, 0.08, lam({ color: 0x6b4a2f })); headboard.position.set(-2.6, 0.55, -4.9); S.add(headboard);
  const bedFrame = box(1.5, 0.25, 2.0, lam({ color: 0x6b4a2f })); bedFrame.position.set(-2.6, 0.2, -3.8); S.add(bedFrame);
  const mattress = box(1.4, 0.18, 1.9, lam({ color: 0xf8fafc })); mattress.position.set(-2.6, 0.42, -3.8); S.add(mattress);
  const pillow = box(0.9, 0.12, 0.45, lam({ color: 0xf8fafc })); pillow.position.set(-2.6, 0.55, -4.5); S.add(pillow);
  const blanket = box(1.4, 0.08, 0.9, lam({ color: 0xa85b3f })); blanket.position.set(-2.6, 0.54, -3.3); S.add(blanket);
  // Slippers (farsh par) + paani bottle (bed ke paas farsh par)
  [-1.75, -1.45].forEach((sx) => {
    const sl = box(0.12, 0.04, 0.3, lam({ color: 0x7c2d12 })); sl.position.set(sx, 0.02, -2.8); S.add(sl);
  });
  const wBottle = cyl(0.05, 0.05, 0.24, lam({ color: 0xa85b3f }), 10); wBottle.position.set(-1.5, 0.12, -3.4); S.add(wBottle);

  // --- BEDSIDE TABLE + ALARM CLOCK (NAYA v3, q17/q22) — bed ke dayein, farsh par ---
  const bedside = box(0.45, 0.5, 0.4, lam({ color: 0x6b4a2f })); bedside.position.set(-1.4, 0.25, -3.9); S.add(bedside);
  const bsTop = box(0.5, 0.04, 0.45, lam({ map: tex(planks(46), 1, 1) })); bsTop.position.set(-1.4, 0.52, -3.9); S.add(bsTop);
  // Alarm clock (ghanti wala): gol body + 2 ghantiyaan + pair — table top (0.54) par khada
  const clockBody = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 16), lam({ color: 0xb45309 }));
  clockBody.rotation.x = Math.PI / 2; clockBody.position.set(-1.6, 0.65, -3.75); S.add(clockBody);
  const clockFaceS = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), lam({ color: 0xf8fafc }));
  clockFaceS.position.set(-1.6, 0.65, -3.715); S.add(clockFaceS); // body front (z=-3.72) se 0.005 aage
  // SMOKE FIX (round 2): alarm table ke front-left kone par (-1.6,-3.75) — pehle (-1.4,-3.9)
  // par HB2 frame se bahar tha (q22 me alarm dikhna chahiye).
  [-0.06, 0.06].forEach((dx) => {
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: 0x9ca3af }));
    bell.position.set(-1.6 + dx, 0.74, -3.75); S.add(bell);
  });
  [-0.05, 0.05].forEach((dx) => {
    const leg = cyl(0.008, 0.008, 0.05, lam({ color: 0x374151 }), 6);
    leg.position.set(-1.6 + dx, 0.56, -3.71); leg.rotation.x = 0.3; S.add(leg);
  });
  // Phone bedside table par (alarm ke paas) — table top par leta. userData me expose:
  // q18/q22 me member phone UTHA ke lens ki taraf dikhata hai — us shot me bedside wala
  // phone chhupa do (ek hi phone do jagah nahi — SMOKE FIX, v4 round 1).
  const bsPhone = box(0.09, 0.015, 0.16, lam({ color: 0x111827 })); bsPhone.position.set(-1.15, 0.55, -3.85); S.add(bsPhone);
  S.userData.bsPhone = bsPhone;

  // --- GYM BAG (NAYA v3, q26/q29/q47) — kone me pada, band, dhul kha raha (unused) ---
  const gymBag = new THREE.Group();
  const bagBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.55, 6, 12), lam({ color: 0x374151 }));
  bagBody.rotation.z = Math.PI / 2; bagBody.position.y = 0.22; gymBag.add(bagBody);
  const bagStrap = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02, 6, 14, Math.PI), lam({ color: 0x1f2937 }));
  bagStrap.position.set(0, 0.32, 0); bagStrap.rotation.y = Math.PI / 2; gymBag.add(bagStrap);
  const bagZip = box(0.5, 0.02, 0.05, lam({ color: 0x9ca3af })); bagZip.position.set(0, 0.42, 0.1); gymBag.add(bagZip);
  gymBag.position.set(3.4, 0, -2.2); gymBag.rotation.y = 0.5; S.add(gymBag);

  // --- TABLE + CHAIR (dayein) ---
  const tableTop = box(1.4, 0.05, 0.8, lam({ map: tex(planks(46), 1, 1) })); tableTop.position.set(2.2, 0.75, -3.6); S.add(tableTop);
  [[1.6, -3.95], [2.8, -3.95], [1.6, -3.25], [2.8, -3.25]].forEach(([lx, lz]) => {
    const leg = box(0.06, 0.73, 0.06, lam({ color: 0x6b4a2f })); leg.position.set(lx, 0.365, lz); S.add(leg);
  });
  // Register book (khula, table top par) + pen + cup + phone — sab ki base table top (0.775) par
  const bookL = box(0.28, 0.02, 0.4, lam({ color: 0x7c2d12 })); bookL.position.set(2.05, 0.79, -3.6); bookL.rotation.z = 0.06; S.add(bookL);
  const bookR = box(0.28, 0.02, 0.4, lam({ color: 0xf8fafc })); bookR.position.set(2.33, 0.79, -3.6); bookR.rotation.z = -0.06; S.add(bookR);
  const pen = cyl(0.008, 0.008, 0.16, lam({ color: 0x1f2937 }), 6);
  pen.rotation.z = Math.PI / 2; pen.rotation.y = 0.5; pen.position.set(2.5, 0.79, -3.35); S.add(pen);
  const cup = cyl(0.05, 0.04, 0.09, lam({ color: 0xa85b3f }), 10); cup.position.set(2.0, 0.82, -3.5); S.add(cup);
  const phone = box(0.09, 0.015, 0.16, lam({ color: 0x111827 })); phone.position.set(2.6, 0.785, -3.8); S.add(phone);
  // Chair (1.8, 0, -2.7)
  const seat = box(0.45, 0.05, 0.45, lam({ color: 0x6b4a2f })); seat.position.set(1.8, 0.45, -2.7); S.add(seat);
  const chairBack = box(0.45, 0.6, 0.05, lam({ color: 0x6b4a2f })); chairBack.position.set(1.8, 0.8, -2.9); S.add(chairBack);
  [[1.6, -2.5], [2.0, -2.5], [1.6, -2.9], [2.0, -2.9]].forEach(([lx, lz]) => {
    const leg = box(0.05, 0.43, 0.05, lam({ color: 0x6b4a2f })); leg.position.set(lx, 0.215, lz); S.add(leg);
  });

  // --- WALL CALENDAR (0.6, 2.0, -4.94) — month shot ke hisaab se badalta ---
  const calCanvas = document.createElement('canvas'); calCanvas.width = 256; calCanvas.height = 320;
  const calCtx = calCanvas.getContext('2d');
  const calTex = new THREE.CanvasTexture(calCanvas); calTex.colorSpace = THREE.SRGBColorSpace;
  const calBoard = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.78), lam({ map: calTex }));
  calBoard.position.set(0.6, 2.0, -4.94); S.add(calBoard); // wall (-5) se 0.06 aage
  const setMonth = (text) => {
    const g = calCtx;
    g.fillStyle = '#f8fafc'; g.fillRect(0, 0, 256, 320);
    // MOVIE RULE: ghar ka calendar header rust-red — v1 gym wala neela #1d4ed8 NAHI.
    g.strokeStyle = '#9c6644'; g.lineWidth = 8; g.strokeRect(6, 6, 244, 308);
    g.fillStyle = '#9c6644'; g.fillRect(0, 0, 256, 64);
    g.fillStyle = '#f8fafc'; g.font = 'bold 40px Arial'; g.textAlign = 'center'; g.fillText(text, 128, 46);
    g.fillStyle = '#1e293b'; g.font = 'bold 26px Arial';
    ['S M T W T F S', '1  2  3  4  5  6', '7  8  9 10 11 12', '13 14 15 16 17 18'].forEach((row, i) => g.fillText(row, 128, 120 + i * 44));
    calTex.needsUpdate = true;
  };
  setMonth('FEBRUARY');
  // --- WALL CLOCK (-1.2, 2.6, -4.94) — 7:00 subah, static hands ---
  const clockTex = textBoard(256, 256, (g, w, h) => {
    g.fillStyle = '#fef9ec'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
    g.strokeStyle = '#1e293b'; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.stroke();
    g.fillStyle = '#1e293b'; g.textAlign = 'center'; g.font = 'bold 40px Arial';
    g.fillText('12', 128, 52); g.fillText('6', 128, 224); g.fillText('3', 210, 142); g.fillText('9', 46, 142);
  });
  const clockFace = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), lam({ map: clockTex }));
  clockFace.position.set(-1.2, 2.6, -4.94); S.add(clockFace);
  // Hour hand -> 7 (v3 subah 7:00), minute hand -> 12. Hands alag z (-4.92 / -4.91), face se 0.02/0.03 aage.
  const hGeo = new THREE.BoxGeometry(0.03, 0.15, 0.01); hGeo.translate(0, 0.065, 0);
  const hHand = new THREE.Mesh(hGeo, lam({ color: 0x1e293b }));
  hHand.position.set(-1.2, 2.6, -4.92); hHand.rotation.z = (5 / 6) * Math.PI; S.add(hHand); // 7 baje = -210° ≡ +150°
  const mGeo = new THREE.BoxGeometry(0.02, 0.22, 0.01); mGeo.translate(0, 0.1, 0);
  const mHand = new THREE.Mesh(mGeo, lam({ color: 0x1e293b }));
  mHand.position.set(-1.2, 2.6, -4.91); mHand.rotation.z = 0; S.add(mHand);

  // --- WINDOW (dayein, back wall, 3.3, 1.9, -4.94) — SUBAH ki halki roshni + side curtain ---
  // Glass (-4.96) frame boxes (-4.93, depth 0.04 -> -4.95..-4.91) se 0.01 peeche — coplanar nahi.
  const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.3), new THREE.MeshPhongMaterial({ map: morningSkyTex(), shininess: 60, specular: 0x554433 }));
  winGlass.position.set(3.3, 1.9, -4.96); S.add(winGlass);
  const winMat = lam({ color: 0x4a3428 });
  [[3.3, 2.57, 1.3, 0.08], [3.3, 1.23, 1.3, 0.08], [2.72, 1.9, 0.08, 1.42], [3.88, 1.9, 0.08, 1.42]].forEach(([wx, wy, ww, wh]) => {
    const f = box(ww, wh, 0.04, winMat); f.position.set(wx, wy, -4.93); S.add(f);
  });
  const winBarV = box(0.05, 1.26, 0.04, winMat); winBarV.position.set(3.3, 1.9, -4.93); S.add(winBarV);
  // Curtain rod + side curtain (latka hua, farsh tak nahi — rod par, side me)
  const rod = cyl(0.015, 0.015, 1.6, lam({ color: 0x374151 }), 6);
  rod.rotation.z = Math.PI / 2; rod.position.set(3.3, 2.7, -4.88); S.add(rod);
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 1.5), lam({ color: 0x7c2d12 }));
  curtain.position.set(3.85, 1.95, -4.88); S.add(curtain); // rod se latka, bottom y=1.2 (farsh tak nahi)

  // --- SHELF (3.2, 2.4, -4.9) + 2 books + 1 bottle ---
  const shelf = box(1.0, 0.05, 0.22, lam({ color: 0x6b4a2f })); shelf.position.set(3.2, 2.4, -4.86); S.add(shelf);
  [[2.95, 0x2f6b4f], [3.1, 0xb45309]].forEach(([bx, col]) => {
    const bk = box(0.1, 0.28, 0.16, lam({ color: col })); bk.position.set(bx, 2.57, -4.86); S.add(bk);
  });
  const sBottle = cyl(0.045, 0.045, 0.26, lam({ color: 0x16a34a }), 10); sBottle.position.set(3.45, 2.56, -4.86); S.add(sBottle);
  // --- FRAMED PHOTO (bayein wall, khaali deewaar na rahe) ---
  const photoTex = textBoard(200, 240, (g, w, h) => {
    g.fillStyle = '#f6d8a8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#9c6644'; g.beginPath(); g.arc(w / 2, 110, 42, 0, 7); g.fill();
    g.fillStyle = '#a85b3f'; g.fillRect(40, 170, 120, 50);
  });
  const photo = boardMesh(0.4, 0.48, photoTex); photo.position.set(-3.2, 2.2, -4.94); S.add(photo);

  // --- HANGING BULB (0, 3.0, -2.5) — wire ceiling se bulb tak, koi floating nahi ---
  const wire = cyl(0.008, 0.008, 0.32, lam({ color: 0x111827 }), 6); wire.position.set(0, 3.04, -2.5); S.add(wire);
  // Bulb glow — MeshBasicMaterial, STATIC opacity (per-frame change nahi, flicker nahi).
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), bas({ color: 0xffe9a8, fog: false }));
  bulb.position.set(0, 2.84, -2.5); S.add(bulb);
  const bulbLight = new THREE.PointLight(0xffc27a, 0.8, 8, 1.5);
  bulbLight.position.set(0, 2.8, -2.5); S.add(bulbLight);

  S.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  S.userData.setMonth = setMonth;
  S.userData.bulbLight = bulbLight;
  return S;
}

// =====================================================================
// LOC O — OFFICE (NAYA v3; member desk par kaam karta hai, fees auto-cut hoti hai)
// Kamra x -4..4, back wall z=-5, ceiling y=3.2, grey carpet farsh. Din ~11:00.
// Palette: walls muted cool grey #8b9096, desk dark walnut #6b4a2f, chair dark grey,
// mustard accent #b5892e (files/mug, chhota). C se farq: C ki deewaar neeli-grey hai,
// O ki grey + carpet + desks, bistar nahi.
// =====================================================================
export function buildOffice() {
  const S = new THREE.Group();
  // Phone notification texture — DIEGETIC prop text (caption nahi): debit notification.
  const phoneNotifTex = textBoard(256, 400, (g, w, h) => {
    g.fillStyle = '#111827'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1f2937'; g.fillRect(0, 0, w, 52);
    g.fillStyle = '#9ca3af'; g.font = 'bold 26px Arial'; g.textAlign = 'center';
    g.fillText('1 MARCH  •  11:00', w / 2, 36);
    g.fillStyle = '#f8fafc'; g.fillRect(16, 76, w - 32, 150);
    g.fillStyle = '#dc2626'; g.font = 'bold 30px Arial'; g.fillText('₹1,000 DEBITED', w / 2, 138);
    g.fillStyle = '#1e293b'; g.font = 'bold 34px Arial'; g.fillText('GYM FEES', w / 2, 188);
    g.fillStyle = '#6b7280'; g.font = '28px Arial'; g.fillText('AUTO-DEBIT • GYM', w / 2, 268);
    g.fillStyle = '#374151'; g.font = '28px Arial'; g.fillText('Balance: ₹12,450', w / 2, 320);
  });
  // Laptop screen texture — static glow (koi per-frame change nahi).
  const laptopScreenTex = textBoard(256, 160, (g, w, h) => {
    g.fillStyle = '#dbeafe'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#93c5fd'; g.fillRect(0, 0, w, 34);
    g.fillStyle = '#1e3a5f'; g.font = 'bold 20px Arial'; g.textAlign = 'left'; g.fillText('WORK — MARCH', 12, 24);
    g.fillStyle = '#ffffff';
    for (let r = 0; r < 5; r++) g.fillRect(12, 52 + r * 20, 180 - r * 22, 10);
    g.fillStyle = '#f59e0b'; g.fillRect(12, 52, 60, 10);
  });
  // Calendar texture — MARCH (office me hamesha MARCH). Header MUSTARD (office accent) —
  // v1 gym wala neela #1d4ed8 NAHI.
  const calTexO = textBoard(256, 320, (g, w, h) => {
    g.fillStyle = '#f8fafc'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#b5892e'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#b5892e'; g.fillRect(0, 0, w, 64);
    g.fillStyle = '#f8fafc'; g.font = 'bold 40px Arial'; g.textAlign = 'center'; g.fillText('MARCH', w / 2, 46);
    g.fillStyle = '#1e293b'; g.font = 'bold 26px Arial';
    ['S M T W T F S', '1  2  3  4  5  6', '7  8  9 10 11 12', '13 14 15 16 17 18'].forEach((row, i) => g.fillText(row, w / 2, 120 + i * 44));
  });
  // Clock face texture (11:00 hands static — geometry neeche).
  const clockTexO = textBoard(256, 256, (g, w, h) => {
    g.fillStyle = '#fef9ec'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
    g.strokeStyle = '#1e293b'; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.stroke();
    g.fillStyle = '#1e293b'; g.textAlign = 'center'; g.font = 'bold 40px Arial';
    g.fillText('12', 128, 52); g.fillText('6', 128, 224); g.fillText('3', 210, 142); g.fillText('9', 46, 142);
  });
  // Day sky (window ke peeche) — halki neeli din roshni.
  const daySkyTex = (() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 256;
    const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#7fb2d9'); gr.addColorStop(0.6, '#cfe4ef'); gr.addColorStop(1, '#f6e8c8');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();

  // --- FLOOR (grey carpet, y=0) ---
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), lam({ color: 0x6b7280 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -1.5); floor.receiveShadow = true; S.add(floor);
  // --- WALLS + CEILING — EK HI flat surface har deewaar (koi plaster texture nahi) ---
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), lam({ color: 0x8b9096 }));
  backWall.position.set(0, 1.6, -5); backWall.receiveShadow = true; S.add(backWall);
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), lam({ color: 0x7d8288 }));
  leftWall.rotation.y = Math.PI / 2; leftWall.position.set(-4, 1.6, -1.5); S.add(leftWall);
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), lam({ color: 0x7d8288 }));
  rightWall.rotation.y = -Math.PI / 2; rightWall.position.set(4, 1.6, -1.5); S.add(rightWall);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), lam({ color: 0xd6d9dc }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 3.2, -1.5); S.add(ceil);
  // Ceiling fluorescent panel (static, unlit-white Lambert — glow nahi, din ki roshni ka hissa)
  const fluor = box(1.6, 0.04, 0.5, lam({ color: 0xf8fafc })); fluor.position.set(0.5, 3.17, -2.5); S.add(fluor);

  // --- MEMBER DESK (beech-dayein, 0.5, 0, -3.4) — walnut top 1.8×0.75, 2 drawers ---
  const deskTop = box(1.8, 0.06, 0.75, lam({ map: tex(planks(46), 1, 1) })); deskTop.position.set(0.5, 0.75, -3.4); S.add(deskTop);
  [[-0.3, -3.7], [1.3, -3.7], [-0.3, -3.1], [1.3, -3.1]].forEach(([lx, lz]) => {
    const leg = box(0.06, 0.72, 0.06, lam({ color: 0x6b4a2f })); leg.position.set(lx, 0.36, lz); S.add(leg);
  });
  // 2 drawers (dayein taraf, desk top ke neeche)
  [0.42, 0.62].forEach((dy) => {
    const dr = box(0.5, 0.16, 0.6, lam({ color: 0x5d3d24 })); dr.position.set(1.05, dy, -3.4); S.add(dr);
    const handle = box(0.16, 0.02, 0.02, lam({ color: 0x9ca3af })); handle.position.set(1.05, dy, -3.09); S.add(handle);
  });
  // Laptop (khula, desk top par) — base + khadi screen (static glow texture)
  const lapBase = box(0.42, 0.03, 0.3, lam({ color: 0x374151 })); lapBase.position.set(0.35, 0.795, -3.5); S.add(lapBase);
  const lapScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.26), lam({ map: laptopScreenTex }));
  lapScreen.position.set(0.35, 0.94, -3.63); lapScreen.rotation.x = -0.15; S.add(lapScreen);
  const lapBack = box(0.42, 0.28, 0.02, lam({ color: 0x1f2937 })); lapBack.position.set(0.35, 0.94, -3.645); lapBack.rotation.x = -0.15; S.add(lapBack);
  // Phone (notification wala) — desk par tika hua, screen camera ki taraf (leaning back).
  // x=1.15: kursi ki peeth (x 0.27..0.73) se dayein — OA/OB me phone kabhi chair se nahi dhakta.
  const phoneG = new THREE.Group();
  const phoneBody = box(0.16, 0.28, 0.02, lam({ color: 0x111827 })); phoneG.add(phoneBody);
  const phoneScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.24), lam({ map: phoneNotifTex }));
  phoneScreen.position.set(0, 0, 0.012); phoneG.add(phoneScreen);
  phoneG.position.set(1.15, 0.92, -3.2); phoneG.rotation.x = -0.3; S.add(phoneG);
  // Files ka stack (mustard folder upar) + coffee mug (mustard) + pen stand — sab desk top par
  [[0.0, 0.02], [0.02, 0.05], [-0.01, 0.08]].forEach(([ox, oy], i) => {
    const f = box(0.3, 0.015, 0.22, lam({ color: i === 2 ? 0xb5892e : 0xf8fafc }));
    f.position.set(1.25 + ox, 0.79 + oy, -3.6); f.rotation.y = (i - 1) * 0.12; S.add(f);
  });
  const mug = cyl(0.045, 0.04, 0.1, lam({ color: 0xb5892e }), 10); mug.position.set(0.1, 0.83, -3.5); S.add(mug);
  const mugHandle = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 6, 12, Math.PI), lam({ color: 0xb5892e }));
  mugHandle.position.set(0.145, 0.83, -3.5); mugHandle.rotation.z = -Math.PI / 2; S.add(mugHandle);
  const penStand = cyl(0.04, 0.04, 0.09, lam({ color: 0x374151 }), 10); penStand.position.set(0.05, 0.825, -3.15); S.add(penStand);
  [-0.015, 0.015].forEach((dx) => {
    const pen = cyl(0.006, 0.006, 0.12, lam({ color: 0xdc2626 }), 6);
    pen.position.set(0.05 + dx, 0.9, -3.15); pen.rotation.z = dx * 8; S.add(pen);
  });
  // Desk lamp (chhota, garam) — base + arm + shade, desk top par
  const lampBase = cyl(0.07, 0.09, 0.03, lam({ color: 0x1f2937 }), 10); lampBase.position.set(-0.25, 0.795, -3.65); S.add(lampBase);
  const lampArm = cyl(0.012, 0.012, 0.35, lam({ color: 0x1f2937 }), 6);
  lampArm.position.set(-0.25, 0.95, -3.65); lampArm.rotation.z = 0.25; S.add(lampArm);
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.1, 12, 1, true), lam({ color: 0xb5892e, side: THREE.DoubleSide }));
  lampShade.position.set(-0.2, 1.12, -3.65); lampShade.rotation.z = 0.25; S.add(lampShade);

  // --- CHAIR (0.5, 0, -2.5) — dark grey, wheels wali ---
  const seat = box(0.48, 0.06, 0.46, lam({ color: 0x4a4a48 })); seat.position.set(0.5, 0.46, -2.5); S.add(seat);
  const chairBack = box(0.46, 0.55, 0.06, lam({ color: 0x4a4a48 })); chairBack.position.set(0.5, 0.8, -2.72); S.add(chairBack);
  const post = cyl(0.03, 0.03, 0.4, lam({ color: 0x9ca3af }), 8); post.position.set(0.5, 0.23, -2.5); S.add(post);
  [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(([dx, dz]) => {
    const wh = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), lam({ color: 0x1f2937 }));
    wh.position.set(0.5 + dx, 0.04, -2.5 + dz); S.add(wh);
  });

  // --- COLLEAGUE DESK (bayein, background, -2.6, 0, -3.6) + laptop ---
  const cDeskTop = box(1.4, 0.06, 0.7, lam({ map: tex(planks(47), 1, 1) })); cDeskTop.position.set(-2.6, 0.75, -3.6); S.add(cDeskTop);
  [[-3.2, -3.9], [-2.0, -3.9], [-3.2, -3.3], [-2.0, -3.3]].forEach(([lx, lz]) => {
    const leg = box(0.06, 0.72, 0.06, lam({ color: 0x6b4a2f })); leg.position.set(lx, 0.36, lz); S.add(leg);
  });
  const cLapBase = box(0.4, 0.03, 0.28, lam({ color: 0x374151 })); cLapBase.position.set(-2.6, 0.795, -3.65); S.add(cLapBase);
  const cLapScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.24), lam({ map: laptopScreenTex }));
  cLapScreen.position.set(-2.6, 0.93, -3.78); cLapScreen.rotation.x = -0.15; S.add(cLapScreen);
  const cMug = cyl(0.04, 0.035, 0.09, lam({ color: 0x6b7280 }), 10); cMug.position.set(-2.2, 0.825, -3.4); S.add(cMug);
  const cChairSeat = box(0.46, 0.06, 0.44, lam({ color: 0x4a4a48 })); cChairSeat.position.set(-2.6, 0.46, -2.7); S.add(cChairSeat);
  const cChairBack = box(0.44, 0.5, 0.06, lam({ color: 0x4a4a48 })); cChairBack.position.set(-2.6, 0.78, -2.9); S.add(cChairBack);
  const cPost = cyl(0.03, 0.03, 0.4, lam({ color: 0x9ca3af }), 8); cPost.position.set(-2.6, 0.23, -2.7); S.add(cPost);

  // --- WALL CLOCK (1.8, 2.5, -4.95) — 11:00, static hands ---
  const clockFace = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), lam({ map: clockTexO }));
  clockFace.position.set(1.8, 2.5, -4.95); S.add(clockFace);
  const hGeo = new THREE.BoxGeometry(0.03, 0.15, 0.01); hGeo.translate(0, 0.065, 0);
  const hHand = new THREE.Mesh(hGeo, lam({ color: 0x1e293b }));
  hHand.position.set(1.8, 2.5, -4.93); hHand.rotation.z = -(11 / 12) * Math.PI * 2; S.add(hHand); // 11 baje
  const mGeo = new THREE.BoxGeometry(0.02, 0.22, 0.01); mGeo.translate(0, 0.1, 0);
  const mHand = new THREE.Mesh(mGeo, lam({ color: 0x1e293b }));
  mHand.position.set(1.8, 2.5, -4.925); mHand.rotation.z = 0; S.add(mHand);
  // --- WALL CALENDAR (-0.6, 2.0, -4.95) — MARCH ---
  const calBoard = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.78), lam({ map: calTexO }));
  calBoard.position.set(-0.6, 2.0, -4.95); S.add(calBoard);
  // --- NOTICE BOARD (-3.4, 2.0, -4.95) — pinned papers (blank, koi text error nahi) ---
  const notice = box(0.95, 0.7, 0.03, lam({ color: 0xb5892e })); notice.position.set(-3.4, 2.0, -4.95); S.add(notice);
  [[-3.6, 2.1, 0.1], [-3.25, 2.12, -0.08], [-3.45, 1.85, 0.05]].forEach(([px, py, rz]) => {
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.3), lam({ color: 0xf8fafc }));
    paper.position.set(px, py, -4.93); paper.rotation.z = rz; S.add(paper);
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 6), lam({ color: 0xdc2626 }));
    pin.position.set(px, py + 0.12, -4.925); S.add(pin);
  });
  // --- WINDOW (dayein, 3.3, 1.9, -4.95) — din ki roshni + bahar buildings ---
  const skyOut = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.2), bas({ map: daySkyTex, fog: false }));
  skyOut.position.set(3.3, 1.9, -5.8); S.add(skyOut);
  [[2.9, 1.0, 0x8a9aaa], [3.8, 1.4, 0x9a8f7a]].forEach(([bx, bh, col]) => {
    const b = box(0.7, bh, 0.4, lam({ color: col })); b.position.set(bx, bh / 2 + 0.8, -5.6); S.add(b);
  });
  const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.3), new THREE.MeshPhongMaterial({ color: 0x9fc8d9, shininess: 80, specular: 0xcfeaff, transparent: true, opacity: 0.22 }));
  winGlass.position.set(3.3, 1.9, -4.96); S.add(winGlass);
  const winMat = lam({ color: 0x4a3428 });
  [[3.3, 2.57, 1.3, 0.08], [3.3, 1.23, 1.3, 0.08], [2.72, 1.9, 0.08, 1.42], [3.88, 1.9, 0.08, 1.42]].forEach(([wx, wy, ww, wh]) => {
    const f = box(ww, wh, 0.04, winMat); f.position.set(wx, wy, -4.93); S.add(f);
  });
  const winBarV = box(0.05, 1.26, 0.04, winMat); winBarV.position.set(3.3, 1.9, -4.93); S.add(winBarV);

  S.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  S.userData.phone = phoneG;
  return S;
}

// =====================================================================
// LOC P — PARK SUBAH (NAYA v3; member subah park me chalta hai, gym khaali hai)
// Khula set: ground x -6..6, z -5..5; ghass + path (x-axis, z 0..1.5);
// peeche trees line z=-3..-4.5; pale gold morning sky. Subah ~6:00, sunehri.
// =====================================================================
export function buildPark() {
  const S = new THREE.Group();
  // --- GROUND (ghass, y=0) + PATH (warm grey, y=0.01 — floor se 0.01 upar) ---
  // Grass texture ka apna rang hi kaafi hai — color tint lagaya to ghass kaala-hari ho jata hai.
  // Ground z -9 tak (sky plane tak) — peeche ki buildings ghass par khadi lagein, hawa me nahi.
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(13, 15), lam({ map: tex(grass(6), 4, 4) }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, -1.75); ground.receiveShadow = true; S.add(ground);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(13, 1.5), lam({ color: 0x9a938a }));
  path.rotation.x = -Math.PI / 2; path.position.set(0, 0.01, 0.75); path.receiveShadow = true; S.add(path);
  // Path edge stones — thin boxes, path se 0.005 upar, kinare par
  for (let i = 0; i < 7; i++) {
    [-0.05, 1.55].forEach((pz) => {
      const st = box(0.3, 0.015, 0.12, lam({ color: 0x8a8378 })); st.position.set(-5.5 + i * 1.8, 0.018, pz); S.add(st);
    });
  }
  // --- SKY (pale gold morning, z=-9) + hazy buildings ---
  // Buildings CHHOTI + halki (top y~2.0, horizon ke paas) — badi grey slab nahi; sky se 0.4 aage.
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(26, 9), bas({ map: morningSkyTex(), fog: false }));
  sky.position.set(0, 3.5, -9); S.add(sky);
  [[-6, 1.9, 0xb8a894, -8.6], [1, 2.3, 0xa8b0b8, -8.6], [6.5, 2.0, 0xc0a894, -8.6]].forEach(([bx, bh, col, bz]) => {
    const b = box(2.4, bh, 0.6, lam({ color: col })); b.position.set(bx, bh / 2, bz); S.add(b);
  });
  // --- TREES — trunk farsh se + 2-3 canopy spheres (muted green #7a9a6d) ---
  const tree = (tx, tz, s = 1) => {
    const g = new THREE.Group();
    const trunk = cyl(0.09 * s, 0.12 * s, 1.6 * s, lam({ color: 0x5d4127 }), 8);
    trunk.position.y = 0.8 * s; g.add(trunk);
    [[0, 1.9, 0, 0.75], [0.45, 1.6, 0.15, 0.55], [-0.4, 1.65, -0.1, 0.5]].forEach(([cx, cy, cz, r]) => {
      const c = new THREE.Mesh(new THREE.SphereGeometry(r * s, 10, 8), lam({ color: 0x7a9a6d }));
      c.position.set(cx * s, cy * s, cz * s); g.add(c);
    });
    g.position.set(tx, 0, tz); S.add(g);
  };
  tree(-4.0, -3.5, 1.0); tree(3.5, -3.8, 1.15); tree(-1.5, -4.2, 0.9); tree(5.5, -3.0, 1.0);
  // --- BENCHES (dark wood #5d4127) — path se peeche, farsh par ---
  const bench = (bx, bz, ry = 0) => {
    const g = new THREE.Group();
    const seat = box(1.6, 0.07, 0.5, lam({ color: 0x5d4127 })); seat.position.y = 0.45; g.add(seat);
    const back = box(1.6, 0.5, 0.06, lam({ color: 0x5d4127 })); back.position.set(0, 0.75, -0.24); g.add(back);
    [[-0.7, -0.18], [0.7, -0.18], [-0.7, 0.18], [0.7, 0.18]].forEach(([lx, lz]) => {
      const leg = box(0.06, 0.42, 0.06, lam({ color: 0x3f4a44 })); leg.position.set(lx, 0.21, lz); g.add(leg);
    });
    g.position.set(bx, 0, bz); g.rotation.y = ry; S.add(g);
  };
  bench(2.2, -2.6, 0.1); bench(-3.0, -2.4, -0.08);
  // --- LAMP POST (-5.0, 0, 0.5), height 3.0 (subah band, glow nahi) ---
  const pole = cyl(0.05, 0.07, 3.0, lam({ color: 0x1f2937 }), 10); pole.position.set(-5.0, 1.5, 0.5); S.add(pole);
  const arm = cyl(0.035, 0.035, 0.8, lam({ color: 0x1f2937 }), 8);
  arm.rotation.x = Math.PI / 2; arm.position.set(-5.0, 2.95, 0.85); S.add(arm);
  const lampHead = box(0.22, 0.12, 0.3, lam({ color: 0x374151 })); lampHead.position.set(-5.0, 2.9, 1.2); S.add(lampHead);
  // --- BUSHES (dressing, farsh par) ---
  [[-5.2, -2.8], [4.8, -2.2], [1.2, -4.4]].forEach(([bx, bz]) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), lam({ color: 0x5d7a4a }));
    b.position.set(bx, 0.3, bz); b.scale.y = 0.75; S.add(b);
  });

  S.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return S;
}
