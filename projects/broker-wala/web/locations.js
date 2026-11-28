// LOCATIONS — Broker Wala (FRESH, sirf is video ke liye).
// A bazaar gali | C flat interior + society exterior (x~10 offset) | D rental street | E rented room.
// ANTI-GLITCH RULES (gym locations.js header se — copy):
// - Koi do surfaces COPLANAR nahi: deewaar par lagne wala har plane/board/frame deewaar
//   se >=0.01 aage; floor par bichhne wali har cheez floor plane se >=0.003 upar; jo bhi
//   do planes overlap karte hain unke beech hamesha gap hai.
// - Koi per-frame random / incremental state nahi: shutter sirf shutterOpen(f) se scale
//   hota hai (pure function), bulb glow static hai, koi Math.random / Date.now nahi.
// - Sab kuch deterministic: wahi frame dobara render ho to wahi pixels.
// Palette: MUTED mitti — dusty ochre, sage, terracotta, wood, stone-grey. NO bright
// red/orange walls anywhere. Tez rang SIRF hero par (dusty-teal shirt, brass keys).
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
function goldenSkyTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256;
  const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#8a7a9a'); gr.addColorStop(0.55, '#e8a05a'); gr.addColorStop(1, '#f6c890');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function daySkyTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256;
  const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#7fb2d9'); gr.addColorStop(0.6, '#cfe4ef'); gr.addColorStop(1, '#f6e8c8');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
  // FIX R1/R2 (still-04): society skyline in the WINDOW — tall dark buildings
  // with lit windows filling the bottom half, so the window is a view, not sky.
  // (R1 put this in dawnSkyTex by a bad anchor; it belongs here, in daySkyTex.)
  const bcols = ['#5a6a8a', '#7a5a4a', '#4a5a7a', '#8a6a5a'];
  [[1, 128, 15, 128], [17, 108, 15, 148], [33, 136, 14, 120], [48, 116, 15, 140]].forEach(([bx, by, bw, bh], bi) => {
    g.fillStyle = bcols[bi % 4]; g.fillRect(bx, by, bw, bh);
    g.fillStyle = '#ffd98a';
    for (let wy = by + 8; wy < 248; wy += 12) for (let wx = bx + 3; wx < bx + bw - 3; wx += 6) {
      if ((wx + wy + bi) % 2) g.fillRect(wx, wy, 3, 4);
    }
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// BROKER sign texture — "BROKER" + "FLAT • KIRAYA • DUKAAN" (hero ka naam NAHI).
const brokerSignTex = textBoard(640, 200, (g, w, h) => {
  g.fillStyle = '#4a4238'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#f8f3e8'; g.font = 'bold 84px Arial'; g.textAlign = 'center';
  g.fillText('BROKER', w / 2, 92);
  g.fillStyle = '#d9a845'; g.font = 'bold 40px Arial';
  g.fillText('FLAT  •  KIRAYA  •  DUKAAN', w / 2, 160);
});
const toLetTex = textBoard(256, 192, (g, w, h) => {
  g.fillStyle = '#f8f3e8'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#5d4127'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = '#5d4127'; g.font = 'bold 64px Arial'; g.textAlign = 'center';
  g.fillText('TO LET', w / 2, 88);
  g.fillStyle = '#8a6a3a'; g.font = 'bold 34px Arial'; g.fillText('KIRAYA', w / 2, 148);
});
const forSaleTex = textBoard(640, 320, (g, w, h) => {
  g.fillStyle = '#f8f3e8'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#5d4127'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
  g.textAlign = 'center';
  g.fillStyle = '#5d4127'; g.font = 'bold 56px Arial'; g.fillText('FLAT FOR SALE', w / 2, 84);
  g.fillStyle = '#8a6a3a'; g.font = 'bold 96px Arial'; g.fillText('₹1 CRORE', w / 2, 200);
  g.fillStyle = '#5d4127'; g.font = 'bold 36px Arial'; g.fillText('3 BHK  •  SOCIETY', w / 2, 276);
});

// =====================================================================
// LOC A — BAZAAR GALI (sadak x-axis par; broker dukaan facade z=-2; dawn)
// Depth: road/pavement foreground | hero + shutter + cycle mid | facade/sky deep.
// =====================================================================
export function buildStreet() {
  const S = new THREE.Group();
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(36, 9), bas({ map: dawnSkyTex(), fog: false }));
  sky.position.set(0, 3.5, -9); S.add(sky);
  // FIX R1 (S1): dawn clouds — soft blobs so the sky is not an empty wash.
  [[-7, 5.6, -8.6], [3, 6.2, -8.8], [8, 5.2, -8.5]].forEach(([cx2, cy2, cz2]) => {
    const cl = new THREE.Mesh(new THREE.SphereGeometry(1.1, 10, 8), lam({ color: 0xf8e8d0 }));
    cl.scale.set(1.6, 0.45, 0.5); cl.position.set(cx2, cy2, cz2); S.add(cl);
  });
  [[-6, 2.4, 0x9a8f7a, -8.2], [1, 3.2, 0x8a9aaa, -8.4], [6.5, 2.8, 0xb08a7a, -8.2]].forEach(([bx, bh, col, bz]) => {
    const b = box(3.4, bh, 0.7, lam({ color: col })); b.position.set(bx, bh / 2, bz); S.add(b);
  });
  // FIX R1 (S1): road was a near-black void — now textured stone-grey pavement
  // with visible tiles + warm dawn tint, so the lower band reads as a road.
  const road = new THREE.Mesh(new THREE.PlaneGeometry(16, 4.5), lam({ map: tex(tiles(53), 10, 3), color: 0x9a8f80 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, 2.75); road.receiveShadow = true; S.add(road);
  for (let i = 0; i < 5; i++) {
    const dash = box(0.12, 0.01, 0.7, lam({ color: 0xe8e8e8 }));
    dash.position.set(-5 + i * 2.5, 0.008, 2.75); S.add(dash);
  }
  const pave = box(14, 0.06, 2.5, lam({ map: tex(tiles(53), 10, 2), color: 0x8a8378 }));
  pave.position.set(0, 0.03, -0.75); pave.receiveShadow = true; S.add(pave);
  const kerb = box(14, 0.1, 0.12, lam({ color: 0x6b7280 })); kerb.position.set(0, 0.05, 0.5); S.add(kerb);

  // --- FACADE (dusty ochre #b08a5a, x -5..5, y 0..4.5, face z=-2) + sage band ---
  const facade = new THREE.Mesh(new THREE.PlaneGeometry(10, 4.5), lam({ color: 0xb08a5a }));
  facade.position.set(0, 2.25, -2); facade.receiveShadow = true; S.add(facade);
  const band = box(10, 0.5, 0.06, lam({ color: 0x7a8a6a })); band.position.set(0, 0.95, -1.94); S.add(band);
  // BROKER sign — plane facade se 0.08 aage (z=-1.92), upar (y 3.7, face-line se upar)
  // FIX QA-full (f0075): sign centre -0.4 par SB cam me right edge kata tha — -0.6 par
  // shift (SA/SA5 cams me bhi poora rehta hai, text ke dono taraf margin).
  const sign = boardMesh(2.6, 0.75, brokerSignTex); sign.position.set(-0.6, 3.7, -1.92); S.add(sign);
  [[-0.6, 4.1, 2.7, 0.06], [-0.6, 3.3, 2.7, 0.06], [-1.98, 3.7, 0.06, 0.86], [0.78, 3.7, 0.06, 0.86]].forEach(([fx, fy, fw, fh]) => {
    const f = box(fw, fh, 0.02, lam({ color: 0x4a4238 })); f.position.set(fx, fy, -1.93); S.add(f);
  });

  // --- SHUTTER (x -2.5..0.5, y 0..3.0, z=-1.95) — rolling shutter, upar khulta hai ---
  // FIX R1 (still-03): interior MUST sit in front of the solid facade plane
  // (facade z=-2.0) or a lifted shutter shows wall, not the shop. Thin counter
  // slab + warm glow strip sit at the bottom of the opening, where the shutter
  // lifts first.
  const interior = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.0), lam({ color: 0x6b4a2f })); // FIX R2: warmer, so the half-open shutter reads as warm light, not a black hole.
  interior.position.set(-1.0, 1.5, -1.99); S.add(interior);
  const innerGlow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.7), bas({ color: 0xffc27a, transparent: true, opacity: 0.7, fog: false })); // FIX R2 (still-03): taller warm wash so the half-open shutter spills light.
  innerGlow.position.set(-1.0, 0.8, -1.98); S.add(innerGlow);
  // FIX R2b (still-03): warm light SPILL on the pavement in front of the shutter —
  // the glow strip sits behind the sage band + counter, so the opening read dark.
  // This additive pool reads unmistakably as light spilling OUT of the shop.
  const spillMat = bas({ color: 0xffb45e, transparent: true, opacity: 0, fog: false, blending: THREE.AdditiveBlending, depthWrite: false });
  const spill = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), spillMat);
  spill.rotation.x = -Math.PI / 2; spill.position.set(-1.0, 0.085, -1.15); S.add(spill);
  const innerCounter = box(1.6, 0.9, 0.04, lam({ color: 0x8a6844 })); innerCounter.position.set(-1.0, 0.45, -1.985); S.add(innerCounter);
  // (shelf/jars removed in R1 fix: they sat behind the shutter and poked through it)
  const slatTex = textBoard(256, 256, (g, w, h) => {
    g.fillStyle = '#6a7a5a'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16) { g.fillStyle = '#4a5a3a'; g.fillRect(0, y, w, 3); g.fillStyle = '#8a9a7a'; g.fillRect(0, y + 3, w, 2); }
  });
  slatTex.wrapS = slatTex.wrapT = THREE.RepeatWrapping; slatTex.repeat.set(1, 3);
  const shutterGeo = new THREE.BoxGeometry(3.0, 3.0, 0.06); shutterGeo.translate(0, -1.5, 0);
  const shutter = new THREE.Mesh(shutterGeo, lam({ map: slatTex }));
  shutter.position.set(-1.0, 3.0, -1.95); S.add(shutter);
  [-2.55, 0.55].forEach((rx) => {
    const rail = box(0.08, 3.0, 0.04, lam({ color: 0x374151 })); rail.position.set(rx, 1.5, -1.91); S.add(rail);
  });
  const mat = box(1.4, 0.01, 0.6, lam({ color: 0x7a5a3a })); mat.position.set(-1.0, 0.065, -1.4); S.add(mat);

  // --- NEIGHBOUR LEFT: chai stall (-6.2, 0, -2) ---
  const stall = box(2.2, 2.2, 0.9, lam({ color: 0xcbb98a }));
  stall.position.set(-6.2, 1.1, -2.65); S.add(stall);
  const awn = box(2.4, 0.05, 1.0, lam({ color: 0x8a6a3a })); awn.position.set(-6.2, 2.5, -1.9); awn.rotation.x = 0.35; S.add(awn);
  const crate1 = box(0.6, 0.6, 0.6, lam({ map: tex(planks(47), 1, 1) })); crate1.position.set(-5.6, 0.36, -1.2); S.add(crate1);
  const crate2 = box(0.45, 0.45, 0.45, lam({ map: tex(planks(48), 1, 1) })); crate2.position.set(-5.6, 0.885, -1.2); S.add(crate2);
  const kettle = cyl(0.09, 0.12, 0.22, lam({ color: 0x9ca3af }), 10); kettle.position.set(-5.6, 1.22, -1.2); S.add(kettle);
  const kettleSpout = cyl(0.02, 0.03, 0.18, lam({ color: 0x9ca3af }), 6);
  kettleSpout.position.set(-5.45, 1.22, -1.2); kettleSpout.rotation.z = -0.7; S.add(kettleSpout);
  // --- NEIGHBOUR RIGHT: building (6.0, 0, -2) — band dukaan shutter + poster ---
  const rBuild = box(2.6, 3.6, 0.9, lam({ color: 0x8a9a8b }));
  rBuild.position.set(6.0, 1.8, -2.65); S.add(rBuild);
  const rShutter = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.2), lam({ color: 0x64748b }));
  rShutter.position.set(6.0, 1.1, -2.14); S.add(rShutter);
  const rPosterTex = textBoard(256, 320, (g, w, h) => {
    g.fillStyle = '#f8f3e8'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#5d4127'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#5d4127'; g.font = 'bold 44px Arial'; g.textAlign = 'center';
    g.fillText('CHAI', w / 2, 130); g.fillText('₹10', w / 2, 200);
  });
  const rPoster = boardMesh(0.7, 0.88, rPosterTex); rPoster.position.set(5.0, 2.2, -2.13); S.add(rPoster);

  // --- LAMP POST (-4.6, 0, 0.2) ---
  const pole = cyl(0.05, 0.07, 3.2, lam({ color: 0x1f2937 }), 10); pole.position.set(-4.6, 1.6, 0.2); S.add(pole);
  const arm = cyl(0.035, 0.035, 0.9, lam({ color: 0x1f2937 }), 8);
  arm.rotation.x = Math.PI / 2; arm.position.set(-4.6, 3.15, 0.6); S.add(arm);
  const lampHead = box(0.22, 0.12, 0.3, lam({ color: 0x374151 })); lampHead.position.set(-4.6, 3.1, 1.0); S.add(lampHead);
  const lampGlass = box(0.16, 0.06, 0.24, lam({ color: 0x9ca3af })); lampGlass.position.set(-4.6, 3.03, 1.0); S.add(lampGlass);

  // --- PARKED CYCLE (3.6, 0, -1.7) ---
  const cycleG = new THREE.Group();
  const wheelMat = lam({ color: 0x1f2937 });
  [-0.45, 0.45].forEach((dx) => {
    const wh = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 8, 18), wheelMat);
    wh.position.set(dx, 0.3, 0); cycleG.add(wh);
  });
  const cFrame = lam({ color: 0x6a7a5a });
  cycleG.add(bar2D(-0.45, 0.3, 0.05, 0.7, 0, cFrame, 0.025));
  cycleG.add(bar2D(0.45, 0.3, 0.05, 0.7, 0, cFrame, 0.025));
  cycleG.add(bar2D(0.05, 0.7, -0.1, 0.62, 0, cFrame, 0.025));
  const cSeat = box(0.22, 0.04, 0.1, lam({ color: 0x451a03 })); cSeat.position.set(-0.1, 0.75, 0); cycleG.add(cSeat);
  cycleG.position.set(3.6, 0.06, -1.7); S.add(cycleG);
  // --- DUSTBIN (4.4, 0, -1.5) + THELA (-4.9, 0, 1.2) ---
  const bin = cyl(0.28, 0.24, 0.7, lam({ color: 0x4a5a3a }), 12); bin.position.set(4.4, 0.41, -1.5); S.add(bin);
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
  const pot = cyl(0.22, 0.16, 0.35, lam({ color: 0x8a5a3a }), 10); pot.position.set(2.2, 0.235, -1.7); S.add(pot);
  const bush = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), lam({ color: 0x4a5a3a }));
  bush.position.set(2.2, 0.62, -1.7); S.add(bush);

  S.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  S.userData.applyShutter = (open) => { shutter.scale.y = Math.max(0.02, 1 - open); spillMat.opacity = open > 0.05 ? 0.32 : 0; };
  S.userData.applyShutter(0);
  return S;
}

// =====================================================================
// LOC C — FLAT INTERIOR (x~0, cream walls, big window, FOR SALE board)
// + SOCIETY EXTERIOR (x~10 offset: building facade, 3 lit windows, ground).
// Dono ek hi group me — camera sub-area chun-ta hai (q07/q08 interior, q23-q25 exterior).
// =====================================================================
export function buildFlat() {
  const S = new THREE.Group();
  // --- INTERIOR: floor (light wood), cream walls, ceiling ---
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), lam({ map: tex(planks(54), 3, 3) }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -1.5); floor.receiveShadow = true; S.add(floor);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), lam({ color: 0x8a7a5a }));
  rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.015, -2.0); rug.receiveShadow = true; S.add(rug);
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), lam({ color: 0xe8dcc0 }));
  backWall.position.set(0, 1.6, -5); backWall.receiveShadow = true; S.add(backWall);
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), lam({ color: 0xd8ccb0 }));
  leftWall.rotation.y = Math.PI / 2; leftWall.position.set(-4, 1.6, -1.5); S.add(leftWall);
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), lam({ color: 0xd8ccb0 }));
  rightWall.rotation.y = -Math.PI / 2; rightWall.position.set(4, 1.6, -1.5); S.add(rightWall);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), lam({ color: 0xf0e8d8 }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 3.2, -1.5); S.add(ceil);
  // --- BIG WINDOW (back wall right, 2.6, 1.9) — bright day sky + city view ---
  const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.6), new THREE.MeshPhongMaterial({ map: daySkyTex(), shininess: 60, specular: 0x554433 }));
  winGlass.position.set(2.6, 1.9, -4.96); S.add(winGlass);
  const winMat = lam({ color: 0x4a3428 });
  [[2.6, 2.72, 2.4, 0.08], [2.6, 1.08, 2.4, 0.08], [1.42, 1.9, 0.08, 1.72], [3.78, 1.9, 0.08, 1.72]].forEach(([wx, wy, ww, wh]) => {
    const f = box(ww, wh, 0.04, winMat); f.position.set(wx, wy, -4.93); S.add(f);
  });
  const winBarV = box(0.05, 1.56, 0.04, winMat); winBarV.position.set(2.6, 1.9, -4.93); S.add(winBarV);
  const winBarH = box(2.32, 0.05, 0.04, winMat); winBarH.position.set(2.6, 1.9, -4.93); S.add(winBarH);
  // Curtain rod + side curtain (latka, side me)
  const rod = cyl(0.015, 0.015, 2.8, lam({ color: 0x374151 }), 6);
  rod.rotation.z = Math.PI / 2; rod.position.set(2.6, 2.85, -4.88); S.add(rod);
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1.7), lam({ color: 0x7a8a6a }));
  curtain.position.set(1.3, 1.95, -4.88); S.add(curtain);
  // --- FOR SALE BOARD (left wall area, back wall -2.2, 2.1) — hero se clear, poora ---
  const saleBoard = boardMesh(1.3, 0.65, forSaleTex); saleBoard.position.set(-1.7, 2.1, -4.94); S.add(saleBoard);
  const saleFrame = box(1.4, 0.75, 0.03, lam({ color: 0x4a3428 })); saleFrame.position.set(-1.7, 2.1, -4.96); S.add(saleFrame);
  // --- EMPTY FLAT furniture (kuch hi — khaali flat): 1 chair, 1 small table, floor lamp ---
  const chairSeat = box(0.45, 0.05, 0.45, lam({ color: 0x6b4a2f })); chairSeat.position.set(-2.0, 0.45, -2.7); S.add(chairSeat);
  const chairBack = box(0.45, 0.6, 0.05, lam({ color: 0x6b4a2f })); chairBack.position.set(-2.0, 0.8, -2.9); S.add(chairBack);
  [[-2.2, -2.5], [-1.8, -2.5], [-2.2, -2.9], [-1.8, -2.9]].forEach(([lx, lz]) => {
    const leg = box(0.05, 0.43, 0.05, lam({ color: 0x6b4a2f })); leg.position.set(lx, 0.215, lz); S.add(leg);
  });
  const tableTop = box(0.9, 0.05, 0.6, lam({ map: tex(planks(46), 1, 1) })); tableTop.position.set(1.8, 0.75, -3.6); S.add(tableTop);
  [[1.4, -3.85], [2.2, -3.85], [1.4, -3.35], [2.2, -3.35]].forEach(([lx, lz]) => {
    const leg = box(0.06, 0.73, 0.06, lam({ color: 0x6b4a2f })); leg.position.set(lx, 0.365, lz); S.add(leg);
  });
  const lampPole = cyl(0.02, 0.03, 1.5, lam({ color: 0x374151 }), 8); lampPole.position.set(3.4, 0.75, -2.2); S.add(lampPole);
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.2, 12, 1, true), lam({ color: 0xe8dcc0, side: THREE.DoubleSide }));
  lampShade.position.set(3.4, 1.55, -2.2); S.add(lampShade);
  // Wall clock (interior, -0.9, 2.9) — static 10:00 hands
  const clockTex = textBoard(256, 256, (g, w, h) => {
    g.fillStyle = '#fef9ec'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
    g.strokeStyle = '#1e293b'; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.stroke();
    g.fillStyle = '#1e293b'; g.textAlign = 'center'; g.font = 'bold 40px Arial';
    g.fillText('12', 128, 52); g.fillText('6', 128, 224); g.fillText('3', 210, 142); g.fillText('9', 46, 142);
  });
  const clockFace = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.45), lam({ map: clockTex }));
  clockFace.position.set(-0.9, 2.9, -4.94); S.add(clockFace);

  // --- SOCIETY EXTERIOR (x~10): ground, building facade, 3 LIT windows, gate ---
  // FIX R1 (still-10): ground was a flat brown plane — textured pavement now.
  const socGround = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), lam({ map: tex(tiles(53), 8, 5), color: 0x9a938a }));
  socGround.rotation.x = -Math.PI / 2; socGround.position.set(10, 0.005, -0.5); socGround.receiveShadow = true; S.add(socGround);
  const socPath = box(4.5, 0.05, 2.2, lam({ map: tex(tiles(54), 3, 2), color: 0xb0a890 }));
  socPath.position.set(10, 0.03, -1.2); S.add(socPath);
  const socSky = new THREE.Mesh(new THREE.PlaneGeometry(20, 8), bas({ map: daySkyTex(), fog: false }));
  socSky.position.set(10, 3.5, -9); S.add(socSky);
  const socBuild = box(7, 6, 1.0, lam({ color: 0xd8ccb0 })); socBuild.position.set(10, 3.0, -4.5); S.add(socBuild);
  const socBand = box(7, 0.4, 0.06, lam({ color: 0x7a8a6a })); socBand.position.set(10, 1.2, -3.97); S.add(socBand);
  // FIX R1 (still-10): roofline — parapet + sloped roof slab + cornice, so the
  // building has a top, not a cut-off wall.
  const socParapet = box(7.3, 0.35, 1.1, lam({ color: 0xc8b898 })); socParapet.position.set(10, 6.15, -4.5); S.add(socParapet);
  const socRoof = box(7.3, 0.12, 1.4, lam({ color: 0x8a5a40 })); socRoof.position.set(10, 6.35, -4.5); socRoof.rotation.x = 0.12; S.add(socRoof);
  const socCornice = box(7.2, 0.18, 0.08, lam({ color: 0xb0a080 })); socCornice.position.set(10, 5.75, -3.96); S.add(socCornice);
  // Entrance — door + steps + canopy, ground centre.
  const socDoor = box(1.3, 2.1, 0.08, lam({ color: 0x4a3220 })); socDoor.position.set(10, 1.05, -3.96); S.add(socDoor);
  const socDoorWin = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.7), lam({ color: 0x5a6a7a }));
  socDoorWin.position.set(10, 1.5, -3.91); S.add(socDoorWin);
  const socCanopy = box(1.9, 0.08, 0.7, lam({ color: 0x7a8a6a })); socCanopy.position.set(10, 2.3, -3.7); S.add(socCanopy);
  const socSteps = box(1.9, 0.12, 0.6, lam({ color: 0x8a8378 })); socSteps.position.set(10, 0.06, -3.6); S.add(socSteps);
  // 3 LIT windows (warm glow, MeshBasicMaterial — bulb glow exception, small surfaces)
  [[8.2, 4.2], [10.0, 4.2], [11.8, 4.2]].forEach(([wx, wy]) => {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.1), bas({ color: 0xffc24d, fog: false }));
    win.position.set(wx, wy, -3.96); S.add(win);
    const fr = box(1.0, 1.2, 0.03, lam({ color: 0x4a3428 })); fr.position.set(wx, wy, -3.98); S.add(fr);
    // FIX R1 (still-10): balcony slab + railing + sill under each lit window.
    const balc = box(1.2, 0.08, 0.5, lam({ color: 0x8a8378 })); balc.position.set(wx, wy - 0.68, -3.75); S.add(balc);
    const rail = box(1.2, 0.5, 0.04, lam({ color: 0x4a3428 })); rail.position.set(wx, wy - 0.4, -3.52); S.add(rail);
    for (let rx2 = -0.5; rx2 <= 0.51; rx2 += 0.25) {
      const bar = box(0.04, 0.5, 0.04, lam({ color: 0x4a3428 })); bar.position.set(wx + rx2, wy - 0.4, -3.52); S.add(bar);
    }
    const sill = box(1.1, 0.06, 0.08, lam({ color: 0x8a8378 })); sill.position.set(wx, wy - 0.62, -3.94); S.add(sill);
    const cross = box(0.05, 1.1, 0.02, lam({ color: 0x4a3428 })); cross.position.set(wx, wy, -3.95); S.add(cross);
  });
  // 3 dark windows (neeche ki manzil — 3 flat me se sirf upar wale lit)
  [[8.2, 2.4], [11.8, 2.4]].forEach(([wx, wy]) => {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.1), lam({ color: 0x5a6a7a }));
    win.position.set(wx, wy, -3.96); S.add(win);
    const fr = box(1.0, 1.2, 0.03, lam({ color: 0x4a3428 })); fr.position.set(wx, wy, -3.98); S.add(fr);
    const sill = box(1.1, 0.06, 0.08, lam({ color: 0x8a8378 })); sill.position.set(wx, wy - 0.62, -3.94); S.add(sill);
  });
  // Gate + boundary wall + 2 trees + society name board
  const gatePost1 = box(0.3, 1.6, 0.3, lam({ color: 0x8a7a5a })); gatePost1.position.set(7.6, 0.8, -1.0); S.add(gatePost1);
  const gatePost2 = box(0.3, 1.6, 0.3, lam({ color: 0x8a7a5a })); gatePost2.position.set(12.4, 0.8, -1.0); S.add(gatePost2);
  // Gate bar HATA diya (round-1 audit: y1.5 ki bar chaaro characters ke chehre kaat rahi thi).
  // FIX QA-full (f1091): single-sphere canopies read as green blobs cut by the
  // frame edges. Clustered canopies (3 spheres, varied greens) + trees moved
  // inward so the full crown is in frame.
  [[7.9, -3.2], [12.1, -3.0]].forEach(([tx, tz]) => {
    const trunk = cyl(0.09, 0.12, 1.9, lam({ color: 0x5d4127 }), 8); trunk.position.set(tx, 0.95, tz); S.add(trunk);
    [[0, 2.25, 0, 0.62, 0x7a9a6d], [-0.45, 1.95, 0.1, 0.42, 0x5a7a4a], [0.45, 2.0, -0.08, 0.4, 0x8aaa7a]].forEach(([ox, oy, oz, r, col]) => {
      const can = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), lam({ color: col }));
      can.position.set(tx + ox, oy, tz + oz); S.add(can);
    });
  });
  const socNameTex = textBoard(512, 128, (g, w, h) => {
    g.fillStyle = '#4a4238'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f8f3e8'; g.font = 'bold 52px Arial'; g.textAlign = 'center';
    g.fillText('SHANTI SOCIETY', w / 2, 82);
  });
  const socName = boardMesh(2.2, 0.55, socNameTex); socName.position.set(10, 5.4, -3.96); S.add(socName);

  S.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return S;
}

// =====================================================================
// LOC D — RENTAL STREET (terracotta + mitti ghar, 10 TO LET boards, golden-hour)
// Street x-axis, facades z=-2, hero z~0.3. Boards gine ja sakein: 10 alag facades par.
// =====================================================================
export function buildRental() {
  const S = new THREE.Group();
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), bas({ map: goldenSkyTex(), fog: false }));
  sky.position.set(0, 6.0, -10); S.add(sky);
  // FIX R1 (still-09): sky detail — clouds + overhead wires so the sky is not empty.
  // FIX QA-full (f0981): 2-puff discs read as beige UFOs; 4-puff wide clusters
  // read as white streaks. Compact 3-puff lumpy clouds (x-scale 1.5, tight dx).
  [[-6, 6.2, -8.6], [1, 6.6, -8.8], [7, 5.8, -8.5]].forEach(([cx2, cy2, cz2]) => {
    [[0, 0, 0.7], [0.75, 0.12, 0.5], [1.4, 0, 0.38]].forEach(([dx, dy, r]) => {
      const cl = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), lam({ color: 0xf8e8d0 }));
      cl.scale.set(1.5, 0.3, 0.4); cl.position.set(cx2 + dx, cy2 + dy, cz2); S.add(cl);
    });
  });
  const wire1 = box(24, 0.03, 0.03, lam({ color: 0x2a2118 })); wire1.position.set(0, 4.6, -7.6); S.add(wire1);
  const wire2 = box(24, 0.025, 0.025, lam({ color: 0x2a2118 })); wire2.position.set(0, 4.15, -7.4); S.add(wire2);
  const wirePole = cyl(0.04, 0.05, 1.2, lam({ color: 0x2a2118 }), 8); wirePole.position.set(-8.5, 4.0, -7.5); S.add(wirePole);
  [[-7, 2.2, 0x9a8f7a, -8.2], [2, 3.0, 0x8a9aaa, -8.4], [8, 2.6, 0xb08a7a, -8.2]].forEach(([bx, bh, col, bz]) => {
    const b = box(3.4, bh, 0.7, lam({ color: col })); b.position.set(bx, bh / 2, bz); S.add(b);
  });
  // FIX R1 (S1): rental road was a flat dark-brown plane — textured + lighter.
  const road = new THREE.Mesh(new THREE.PlaneGeometry(18, 4.5), lam({ map: tex(tiles(53), 10, 3), color: 0xa89880 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, 2.75); road.receiveShadow = true; S.add(road);
  const pave = box(16, 0.06, 2.5, lam({ map: tex(tiles(53), 10, 2), color: 0x9a8a72 }));
  pave.position.set(0, 0.03, -0.75); pave.receiveShadow = true; S.add(pave);
  const kerb = box(16, 0.1, 0.12, lam({ color: 0x6b6258 })); kerb.position.set(0, 0.05, 0.5); S.add(kerb);

  // --- 10 HOUSES (x -7.5..7.5, facades z=-2, muted terracotta/mitti/sage alternating) ---
  const houseCols = [0xb08a5a, 0x9a7a5a, 0x8a9a6a, 0xc09a6a, 0xa87a5a, 0x8a8a5a, 0xb09a7a, 0x9a6a4a, 0x7a8a5a, 0xc08a5a];
  const houseX = [-5.4, -4.2, -3.0, -1.8, -0.6, 0.6, 1.8, 3.0, 4.2, 5.4];
  houseX.forEach((hx, i) => {
    const h = 2.6 + (i % 3) * 0.4;
    // FIX R1 (still-09): houses were featureless toy blocks. Staggered depth
    // (every other house 0.45 deeper) + pyramid roof + parapet + framed windows.
    const hz = -2.45 - (i % 2) * 0.45;
    const house = box(1.5, h, 0.9, lam({ color: houseCols[i] }));
    house.position.set(hx, h / 2, hz); S.add(house);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.05, 0.5, 4), lam({ color: 0x7a4a30 }));
    roof.rotation.y = Math.PI / 4; roof.position.set(hx, h + 0.25, hz); S.add(roof);
    const parapet = box(1.56, 0.14, 0.96, lam({ color: houseCols[i] })); parapet.position.set(hx, h + 0.02, hz); S.add(parapet);
    const fz = hz + 0.46;
    // door (dark wood, facade front se 0.01 aage)
    const door = box(0.5, 1.1, 0.04, lam({ color: 0x4a3220 })); door.position.set(hx, 0.55, fz + 0.01); S.add(door);
    const step = box(0.7, 0.08, 0.4, lam({ color: 0x8a8378 })); step.position.set(hx, 0.04, fz + 0.24); S.add(step);
    // windows, both sides of the door, with frames + sills
    [[hx - 0.52, 1.6], [hx + 0.52, 1.6], [hx - 0.52, 2.35]].forEach(([wx, wy]) => {
      if (wy > h - 0.3) return;
      const fr = box(0.48, 0.58, 0.03, lam({ color: 0x4a3428 })); fr.position.set(wx, wy, fz + 0.005); S.add(fr);
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.48), lam({ color: 0x5a6a7a }));
      win.position.set(wx, wy, fz + 0.025); S.add(win);
      const bar = box(0.03, 0.48, 0.02, lam({ color: 0x4a3428 })); bar.position.set(wx, wy, fz + 0.035); S.add(bar);
      const sill = box(0.52, 0.05, 0.06, lam({ color: 0x8a8378 })); sill.position.set(wx, wy - 0.31, fz + 0.03); S.add(sill);
    });
    // TO LET board — har ghar par ek (10 total), door ke upar, facade se 0.06 aage
    const board = boardMesh(0.55, 0.42, toLetTex); board.position.set(hx, 1.55, fz + 0.06); S.add(board);
    // potted plant kuch gharon ke paas
    if (i % 3 === 0) {
      const pot = cyl(0.14, 0.1, 0.22, lam({ color: 0x8a5a3a }), 10); pot.position.set(hx - 0.6, 0.17, fz + 0.25); S.add(pot);
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), lam({ color: 0x4a5a3a }));
      bush.position.set(hx - 0.6, 0.4, fz + 0.25); S.add(bush);
    }
  });
  // --- LAMP POST + cycle + dustbin (dressing, below face-line) ---
  const pole = cyl(0.05, 0.07, 3.0, lam({ color: 0x1f2937 }), 10); pole.position.set(-5.0, 1.5, 0.2); S.add(pole);
  const lampHead = box(0.22, 0.12, 0.3, lam({ color: 0x374151 })); lampHead.position.set(-5.0, 2.95, 0.5); S.add(lampHead);
  const bin = cyl(0.26, 0.22, 0.65, lam({ color: 0x4a5a3a }), 12); bin.position.set(5.8, 0.38, -1.5); S.add(bin);
  const binLid = cyl(0.28, 0.28, 0.05, lam({ color: 0x1f2937 }), 12); binLid.position.set(5.8, 0.72, -1.5); S.add(binLid);
  // tree (right end)
  const trunk = cyl(0.09, 0.12, 1.8, lam({ color: 0x5d4127 }), 8); trunk.position.set(8.4, 0.9, -1.6); S.add(trunk);
  const can = new THREE.Mesh(new THREE.SphereGeometry(0.8, 10, 8), lam({ color: 0x7a9a6d }));
  can.position.set(8.4, 2.2, -1.6); S.add(can);

  S.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return S;
}

// =====================================================================
// LOC E — HERO KA KIRAYE KA KAMRA (chhota kamra, ek bulb + light cone, chandni)
// Back wall z=-5, bed (-2.6,-3.8), bulb (0,2.84,-2.5), window dayein (moonlight).
// =====================================================================
export function buildRoom() {
  const S = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), lam({ map: tex(planks(54), 3, 3) }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -1.5); floor.receiveShadow = true; S.add(floor);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2), lam({ color: 0x6a5a4a }));
  rug.rotation.x = -Math.PI / 2; rug.position.set(-1.0, 0.015, -2.0); rug.receiveShadow = true; S.add(rug);
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), lam({ color: 0x8a7a6a }));
  backWall.position.set(0, 1.6, -5); backWall.receiveShadow = true; S.add(backWall);
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), lam({ color: 0x7a6a5a }));
  leftWall.rotation.y = Math.PI / 2; leftWall.position.set(-4, 1.6, -1.5); S.add(leftWall);
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), lam({ color: 0x7a6a5a }));
  rightWall.rotation.y = -Math.PI / 2; rightWall.position.set(4, 1.6, -1.5); S.add(rightWall);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), lam({ color: 0x9a8a7a }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 3.2, -1.5); S.add(ceil);

  // --- BED (bayein, -2.6, 0, -3.8) — headboard back wall se tika ---
  const headboard = box(1.5, 1.1, 0.08, lam({ color: 0x5d4127 })); headboard.position.set(-2.6, 0.55, -4.9); S.add(headboard);
  const bedFrame = box(1.5, 0.25, 2.0, lam({ color: 0x5d4127 })); bedFrame.position.set(-2.6, 0.2, -3.8); S.add(bedFrame);
  const mattress = box(1.4, 0.18, 1.9, lam({ color: 0xd8ccb0 })); mattress.position.set(-2.6, 0.42, -3.8); S.add(mattress);
  const pillow = box(0.9, 0.12, 0.45, lam({ color: 0xf8f3e8 })); pillow.position.set(-2.6, 0.55, -4.5); S.add(pillow);
  const blanket = box(1.4, 0.08, 0.9, lam({ color: 0x7a5a7a })); blanket.position.set(-2.6, 0.54, -3.3); S.add(blanket);
  // Slippers farsh par
  [-1.75, -1.45].forEach((sx) => {
    const sl = box(0.12, 0.04, 0.3, lam({ color: 0x5a4a3a })); sl.position.set(sx, 0.02, -2.8); S.add(sl);
  });
  // --- BEDSIDE TABLE + alarm + paani bottle ---
  const bedside = box(0.45, 0.5, 0.4, lam({ color: 0x5d4127 })); bedside.position.set(-1.4, 0.25, -3.9); S.add(bedside);
  const clockBody = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 16), lam({ color: 0x8a6a3a }));
  clockBody.rotation.x = Math.PI / 2; clockBody.position.set(-1.5, 0.62, -3.8); S.add(clockBody);
  const clockFaceS = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), lam({ color: 0xf8f3e8 }));
  clockFaceS.position.set(-1.5, 0.62, -3.765); S.add(clockFaceS);
  const wBottle = cyl(0.05, 0.05, 0.24, lam({ color: 0x7a9a6a }), 10); wBottle.position.set(-1.2, 0.62, -3.95); S.add(wBottle);
  // --- SMALL TABLE + chair (dayein) + register + cup ---
  const tableTop = box(1.2, 0.05, 0.7, lam({ map: tex(planks(46), 1, 1) })); tableTop.position.set(2.2, 0.75, -3.6); S.add(tableTop);
  [[1.7, -3.9], [2.7, -3.9], [1.7, -3.3], [2.7, -3.3]].forEach(([lx, lz]) => {
    const leg = box(0.06, 0.73, 0.06, lam({ color: 0x5d4127 })); leg.position.set(lx, 0.365, lz); S.add(leg);
  });
  const bookL = box(0.28, 0.02, 0.4, lam({ color: 0x7a5a3a })); bookL.position.set(2.05, 0.79, -3.6); S.add(bookL);
  const bookR = box(0.28, 0.02, 0.4, lam({ color: 0xf8f3e8 })); bookR.position.set(2.33, 0.79, -3.6); S.add(bookR);
  const cup = cyl(0.05, 0.04, 0.09, lam({ color: 0x8a6a3a }), 10); cup.position.set(2.0, 0.82, -3.5); S.add(cup);
  const seat = box(0.45, 0.05, 0.45, lam({ color: 0x5d4127 })); seat.position.set(1.8, 0.45, -2.7); S.add(seat);
  const chairBack = box(0.45, 0.6, 0.05, lam({ color: 0x5d4127 })); chairBack.position.set(1.8, 0.8, -2.9); S.add(chairBack);
  [[1.6, -2.5], [2.0, -2.5], [1.6, -2.9], [2.0, -2.9]].forEach(([lx, lz]) => {
    const leg = box(0.05, 0.43, 0.05, lam({ color: 0x5d4127 })); leg.position.set(lx, 0.215, lz); S.add(leg);
  });
  // --- RENT RECEIPT pinned on wall (0.6, 2.0, -4.94) — diegetic text ---
  const receiptTex = textBoard(256, 320, (g, w, h) => {
    g.fillStyle = '#f8f3e8'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#5d4127'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#5d4127'; g.font = 'bold 34px Arial'; g.textAlign = 'center';
    g.fillText('KIRAYA', w / 2, 60);
    g.fillStyle = '#8a6a3a'; g.font = 'bold 56px Arial'; g.fillText('₹10,000', w / 2, 140);
    g.fillStyle = '#5d4127'; g.font = '28px Arial'; g.fillText('MAHINA', w / 2, 190);
    g.fillText('PAID', w / 2, 240);
  });
  const receipt = boardMesh(0.5, 0.62, receiptTex); receipt.position.set(0.6, 2.0, -4.94); S.add(receipt);
  // --- WINDOW (dayein, 3.3, 1.9) — moonlight (cool blue glass) + curtain ---
  const moonTex = (() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 256;
    const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#1a2a4a'); gr.addColorStop(0.6, '#3a5a8a'); gr.addColorStop(1, '#6a8aaa');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
    g.fillStyle = '#e8e2ce'; g.beginPath(); g.arc(44, 40, 10, 0, 7); g.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.3), new THREE.MeshPhongMaterial({ map: moonTex, shininess: 60, specular: 0x554433 }));
  winGlass.position.set(3.3, 1.9, -4.96); S.add(winGlass);
  const winMat = lam({ color: 0x4a3428 });
  [[3.3, 2.57, 1.3, 0.08], [3.3, 1.23, 1.3, 0.08], [2.72, 1.9, 0.08, 1.42], [3.88, 1.9, 0.08, 1.42]].forEach(([wx, wy, ww, wh]) => {
    const f = box(ww, wh, 0.04, winMat); f.position.set(wx, wy, -4.93); S.add(f);
  });
  const winBarV = box(0.05, 1.26, 0.04, winMat); winBarV.position.set(3.3, 1.9, -4.93); S.add(winBarV);
  const rod = cyl(0.015, 0.015, 1.6, lam({ color: 0x374151 }), 6);
  rod.rotation.z = Math.PI / 2; rod.position.set(3.3, 2.7, -4.88); S.add(rod);
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 1.5), lam({ color: 0x5a4a3a }));
  curtain.position.set(3.85, 1.95, -4.88); S.add(curtain);
  // --- HANGING BULB (0, 3.0, -2.5) — wire ceiling se bulb tak + LIGHT CONE ---
  const wire = cyl(0.008, 0.008, 0.32, lam({ color: 0x111827 }), 6); wire.position.set(0, 3.04, -2.5); S.add(wire);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), bas({ color: 0xffe9a8, fog: false }));
  bulb.position.set(0, 2.84, -2.5); S.add(bulb);
  const bulbLight = new THREE.PointLight(0xffc27a, 1.2, 8, 1.5);
  bulbLight.position.set(0, 2.8, -2.5); S.add(bulbLight);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.8, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  cone.position.set(-1.2, 1.5, -2.8); cone.rotation.set(0.1, 0, -0.12); S.add(cone);
  // --- WALL CLOCK (-1.2, 2.6) — raat 10:00, static ---
  const clockTex = textBoard(256, 256, (g, w, h) => {
    g.fillStyle = '#fef9ec'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
    g.strokeStyle = '#1e293b'; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.stroke();
    g.fillStyle = '#1e293b'; g.textAlign = 'center'; g.font = 'bold 40px Arial';
    g.fillText('12', 128, 52); g.fillText('6', 128, 224); g.fillText('3', 210, 142); g.fillText('9', 46, 142);
  });
  const clockFace = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.45), lam({ map: clockTex }));
  clockFace.position.set(-1.2, 2.6, -4.94); S.add(clockFace);
  // --- GYM BAG nahi — hero ka suitcase (kone me, band) ---
  const suitcase = box(0.55, 0.4, 0.2, lam({ color: 0x5a4a3a })); suitcase.position.set(3.4, 0.2, -2.2); S.add(suitcase);
  const scHandle = box(0.2, 0.04, 0.04, lam({ color: 0x374151 })); scHandle.position.set(3.4, 0.42, -2.2); S.add(scHandle);

  S.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  S.userData.bulbLight = bulbLight;
  return S;
}
