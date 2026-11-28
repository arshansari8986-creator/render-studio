// LOCATIONS F (dukaan front) + Z (bazaar) + C (ghar) + S (supermarket) + G (gali) — Kirana Udhaar.
// ANTI-GLITCH RULES (Gym v1 se seekh):
// - Koi do surfaces COPLANAR nahi: deewaar par lagne wala har plane/board/frame deewaar
//   se >=0.01 aage; floor par bichhne wali har cheez floor plane se >=0.003 upar; jo bhi
//   do planes overlap karte hain unke beech hamesha gap hai (neeche har offset comment me).
// - Koi per-frame random / incremental state nahi: shutter sirf shutterOpen(f) se scale
//   hota hai (pure function), bulb glow static hai, koi Math.random / Date.now nahi.
// - Sab kuch deterministic: wahi frame dobara render ho to wahi pixels.
// PALETTE (plan lock): muted mitti — cream, lakdi-bhoora, sage, dhul-neela. Tez rang SIRF
// hero par (narangi gamchha, khata cover, sunehra cash). Gym ka koi set/character/prop reuse NAHI.
import * as THREE from 'three';
import { tex, planks, plaster, tiles, stone, dirt } from './paint.js';

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
function morningSkyTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256;
  const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#a8c4d8'); gr.addColorStop(0.55, '#f6d9a0'); gr.addColorStop(1, '#ffedbe');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function eveningSkyTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256;
  const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#8a6a9a'); gr.addColorStop(0.55, '#e8a06a'); gr.addColorStop(1, '#f6d8a8');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function dustySkyTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256;
  const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#c8b898'); gr.addColorStop(0.55, '#e8d8b0'); gr.addColorStop(1, '#f6e8c8');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// Bori (jute sack) — F3 FIX (main.js jaisa): gol "ball" NAHI — lambi bandhi bori:
// lamba body (0.88 x 1.3), cinched gardan + gaanth + rassi. Base farsh ko chhooti hai.
// (ROUND-2: seams hata diye — "taang/stick" lagte the.)
function sack(x, y, z, ry = 0, s = 1) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.3 * s, 12, 10), lam({ color: 0xc9b184 }));
  body.scale.set(0.88, 1.3, 0.88); body.position.y = 0.36 * s; g.add(body);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09 * s, 0.16 * s, 0.16 * s, 10), lam({ color: 0xb09868 }));
  neck.position.y = 0.72 * s; g.add(neck);
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.07 * s, 8, 6), lam({ color: 0xb09868 }));
  knot.position.y = 0.81 * s; g.add(knot);
  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.11 * s, 0.02 * s, 6, 12), lam({ color: 0x8a6a3a }));
  tie.rotation.x = Math.PI / 2; tie.position.y = 0.66 * s; g.add(tie);
  // ROUND-2: seams HATA (main.js jaisa — "taang/stick" lagte the).
  g.position.set(x, y, z); g.rotation.y = ry;
  return g;
}
// Cycle — dono wheels zameen par, frame + seat + handlebar.
function cycle(x, z, ry = 0) {
  const g = new THREE.Group();
  const wheelMat = lam({ color: 0x1f2937 });
  [-0.45, 0.45].forEach((dx) => {
    const wh = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 8, 18), wheelMat);
    wh.position.set(dx, 0.3, 0); g.add(wh);
  });
  const cFrame = lam({ color: 0x5b6e7a });
  g.add(bar2D(-0.45, 0.3, 0.05, 0.7, 0, cFrame, 0.025));
  g.add(bar2D(0.45, 0.3, 0.05, 0.7, 0, cFrame, 0.025));
  g.add(bar2D(0.05, 0.7, -0.1, 0.62, 0, cFrame, 0.025));
  const seat = box(0.22, 0.04, 0.1, lam({ color: 0x451a03 })); seat.position.set(-0.1, 0.75, 0); g.add(seat);
  const bars = cyl(0.02, 0.02, 0.4, lam({ color: 0x9ca3af }), 6);
  bars.rotation.x = Math.PI / 2; bars.position.set(0.15, 0.85, 0); g.add(bars);
  g.position.set(x, 0.06, z); g.rotation.y = ry;
  return g;
}
const kiranaSignTex = textBoard(640, 160, (g, w, h) => {
  g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#6b4a2f'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
  g.fillStyle = '#6b4a2f'; g.font = 'bold 68px Arial'; g.textAlign = 'center';
  g.fillText('KIRANA STORE', w / 2, 104);
});

// =====================================================================
// LOC F — DUKAAN FRONT (shutter + facade; s03 "dukaan kholi")
// Depth layers: road/pavement foreground | hero + shutter + bori mid | facade/sky deep.
// =====================================================================
export function buildDukaanFront() {
  const S = new THREE.Group();
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(26, 9), bas({ map: morningSkyTex(), fog: false }));
  sky.position.set(0, 3.5, -9); S.add(sky);
  [[-6, 2.4, 0x9a8f7a, -8.2], [1, 3.2, 0x8a9aaa, -8.4], [6.5, 2.8, 0xb08a7a, -8.2]].forEach(([bx, bh, col, bz]) => {
    const b = box(3.4, bh, 0.7, lam({ color: col })); b.position.set(bx, bh / 2, bz); S.add(b);
  });
  // ROAD + PAVEMENT + KERB
  const road = new THREE.Mesh(new THREE.PlaneGeometry(16, 4.5), lam({ color: 0x4a4640 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, 2.75); road.receiveShadow = true; S.add(road);
  for (let i = 0; i < 5; i++) {
    const dash = box(0.12, 0.01, 0.7, lam({ color: 0xe8e8e8 }));
    dash.position.set(-5 + i * 2.5, 0.008, 2.75); S.add(dash);
  }
  const pave = box(14, 0.06, 2.5, lam({ map: tex(stone(61, 36, 12, 62, 128, 64), 10, 2), color: 0x9a938a }));
  pave.position.set(0, 0.03, -0.75); pave.receiveShadow = true; S.add(pave);
  const kerb = box(14, 0.1, 0.12, lam({ color: 0x6b7280 })); kerb.position.set(0, 0.05, 0.5); S.add(kerb);

  // --- FACADE (cream-mitti plaster #d8cbb2, x -5..5, y 0..4.5, face z=-2) ---
  // ROUND-3 (F2): shutter opening (x -2.5..0.5, y 0..3.0) me ASLI khula darwaza
  // hai — pehle ek solid plane tha, isliye shutter uthne par bhi andar ki
  // roshni/shelves kabhi nahi dikhte the (gap me plaster dikhta tha, "dukaan
  // kholi" padhta hi nahi tha). Ab 3 panels (bayein/dayein/upar) — gap se andar
  // ki garam roshni + bori dikhti hai.
  const facadeMat = lam({ map: tex(plaster(62, 38), 4, 2) });
  const facadeL = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 4.5), facadeMat);
  facadeL.position.set(-3.75, 2.25, -2); facadeL.receiveShadow = true; S.add(facadeL);
  const facadeR = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 4.5), facadeMat);
  facadeR.position.set(2.75, 2.25, -2); facadeR.receiveShadow = true; S.add(facadeR);
  const facadeT = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.5), facadeMat);
  facadeT.position.set(-1.0, 3.75, -2); facadeT.receiveShadow = true; S.add(facadeT);
  // Lakdi band (wainscot strip) — opening ke dono taraf (darwaze se nahi guzarta)
  const bandL = box(2.5, 0.5, 0.06, lam({ color: 0x6b4a2f })); bandL.position.set(-3.75, 0.95, -1.94); S.add(bandL);
  const bandR = box(4.5, 0.5, 0.06, lam({ color: 0x6b4a2f })); bandR.position.set(2.75, 0.95, -1.94); S.add(bandR);
  const threshold = box(3.0, 0.12, 0.12, lam({ color: 0x8a6a3a })); threshold.position.set(-1.0, 0.06, -1.94); S.add(threshold);
  // "KIRANA STORE" sign — plane facade se 0.08 aage (z=-1.92), frame peeche
  const sign = boardMesh(3.6, 0.9, kiranaSignTex); sign.position.set(0, 3.7, -1.92); S.add(sign);
  [[0, 4.17, 3.7, 0.06], [0, 3.23, 3.7, 0.06], [-1.83, 3.7, 0.06, 1.0], [1.83, 3.7, 0.06, 1.0]].forEach(([fx, fy, fw, fh]) => {
    const f = box(fw, fh, 0.02, lam({ color: 0x6b4a2f })); f.position.set(fx, fy, -1.93); S.add(f);
  });

  // --- SHUTTER (x -2.5..0.5, y 0..3.0, z=-1.95) — rolling shutter, upar khulta hai ---
  const interior = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.0), lam({ color: 0x3a2f22 }));
  interior.position.set(-1.0, 1.5, -2.10); S.add(interior);
  const innerGlow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.5), bas({ color: 0xffc27a, transparent: true, opacity: 0.5, fog: false }));
  innerGlow.position.set(-1.0, 2.5, -2.08); S.add(innerGlow);
  // ROUND-4: opacity 0.45->0.7, size 2.6x1.2->2.8x1.5 — round-3 me roshni halki
  // thi (gap me andhera dikhta tha); ab gap se garam roshni saaf dikhegi.
  const innerGlowLow = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.5), bas({ color: 0xffc27a, transparent: true, opacity: 0.7, fog: false }));
  innerGlowLow.position.set(-1.0, 0.7, -2.08); S.add(innerGlowLow);
  // Andar jhaankne par: shelves ki silhouette + bori
  const innerShelf = box(2.4, 0.06, 0.3, lam({ color: 0x6b4a2f })); innerShelf.position.set(-1.0, 1.6, -2.3); S.add(innerShelf);
  [[-1.8, 0x8a5a2e], [-1.0, 0x5a6b3a], [-0.2, 0x7a6a4a]].forEach(([bx, col]) => {
    const d = box(0.35, 0.4, 0.25, lam({ color: col })); d.position.set(bx, 1.83, -2.3); S.add(d);
  });
  S.add(sack(-1.6, 0, -2.05, 0.4, 0.9)); // ROUND-3: darwaze ke andar, bayein — gap se bori ki silhouette dikhti hai (pehle -2.4 par interior plane ke peeche chhupi thi).
  const slatTex = textBoard(256, 256, (g, w, h) => {
    g.fillStyle = '#7a6a4a'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16) { g.fillStyle = '#5d4f36'; g.fillRect(0, y, w, 3); g.fillStyle = '#94845c'; g.fillRect(0, y + 3, w, 2); }
  });
  slatTex.wrapS = slatTex.wrapT = THREE.RepeatWrapping; slatTex.repeat.set(1, 3);
  const shutterGeo = new THREE.BoxGeometry(3.0, 3.0, 0.06); shutterGeo.translate(0, -1.5, 0);
  const shutter = new THREE.Mesh(shutterGeo, lam({ map: slatTex }));
  shutter.position.set(-1.0, 3.0, -1.95); S.add(shutter);
  [-2.55, 0.55].forEach((rx) => {
    const rail = box(0.08, 3.0, 0.04, lam({ color: 0x374151 })); rail.position.set(rx, 1.5, -1.91); S.add(rail);
  });
  const mat = box(1.4, 0.01, 0.6, lam({ color: 0x7c2d12 })); mat.position.set(-1.0, 0.065, -1.4); S.add(mat);

  // --- BORI STACK (shutter ke bayein, -3.4, 0, -1.2) — 3 bori, sab ki base farsh/dusri bori par ---
  S.add(sack(-3.6, 0, -1.2, 0.2));
  S.add(sack(-3.0, 0, -1.3, -0.3));
  S.add(sack(-3.3, 0.55, -1.25, 0.9, 0.95));
  // --- THELA (dayein, 3.8, 0, 1.0) — sabzi ke tokre ke saath ---
  const thelaG = new THREE.Group();
  const bed = box(1.6, 0.08, 0.9, lam({ map: tex(planks(63), 1, 1) })); bed.position.y = 0.55; thelaG.add(bed);
  [-0.7, 0.7].forEach((dx) => {
    const w = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 8, 16), lam({ color: 0x1f2937 }));
    w.position.set(dx, 0.28, 0.48); thelaG.add(w);
  });
  const handle = cyl(0.025, 0.025, 0.9, lam({ color: 0x4b5563 }), 6);
  handle.rotation.x = 0.9; handle.position.set(0, 0.75, 1.0); thelaG.add(handle);
  // sabzi tokra thele par
  const basket = cyl(0.28, 0.22, 0.18, lam({ color: 0x8a6a3a }), 10); basket.position.set(-0.3, 0.68, 0); thelaG.add(basket);
  [[-0.4, 0.78, 0x5d8a3a], [-0.2, 0.78, 0xb8452a], [-0.3, 0.78, 0x7a9a3a]].forEach(([vx, vy, col]) => {
    const v = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), lam({ color: col }));
    v.position.set(vx, vy, 0); thelaG.add(v);
  });
  thelaG.position.set(3.8, 0, 1.0); thelaG.rotation.y = -0.3; S.add(thelaG);
  // --- PARKED CYCLE (2.6, 0, -1.5) + LAMP POST + DUSTBIN + POTTED PLANT ---
  S.add(cycle(2.6, -1.5, 0.2));
  const pole = cyl(0.05, 0.07, 3.2, lam({ color: 0x1f2937 }), 10); pole.position.set(-4.6, 1.6, 0.2); S.add(pole);
  const arm = cyl(0.035, 0.035, 0.9, lam({ color: 0x1f2937 }), 8);
  arm.rotation.x = Math.PI / 2; arm.position.set(-4.6, 3.15, 0.6); S.add(arm);
  const lampHead = box(0.22, 0.12, 0.3, lam({ color: 0x374151 })); lampHead.position.set(-4.6, 3.1, 1.0); S.add(lampHead);
  const bin = cyl(0.28, 0.24, 0.7, lam({ color: 0x4a5a3a }), 12); bin.position.set(4.4, 0.41, -1.5); S.add(bin);
  const binLid = cyl(0.3, 0.3, 0.05, lam({ color: 0x1f2937 }), 12); binLid.position.set(4.4, 0.78, -1.5); S.add(binLid);
  const pot = cyl(0.22, 0.16, 0.35, lam({ color: 0xa85b3f }), 10); pot.position.set(2.2, 0.235, -1.7); S.add(pot);
  const bush = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), lam({ color: 0x5d7a4a }));
  bush.position.set(2.2, 0.62, -1.7); S.add(bush);
  // --- NEIGHBOUR LEFT: band dukaan (chai stall jaisa, -6.4) + RIGHT: makaan (6.2) ---
  const stall = box(2.2, 2.2, 0.9, lam({ color: 0xcbb98a }));
  stall.position.set(-6.4, 1.1, -2.65); S.add(stall);
  const awn = box(2.4, 0.05, 1.0, lam({ color: 0x8a5a2e })); awn.position.set(-6.4, 2.5, -1.9); awn.rotation.x = 0.35; S.add(awn);
  const rBuild = box(2.6, 3.6, 0.9, lam({ color: 0x9a9a8a }));
  rBuild.position.set(6.2, 1.8, -2.65); S.add(rBuild);
  const rWin = box(0.8, 0.9, 0.04, lam({ color: 0x3a4a5a })); rWin.position.set(6.2, 2.4, -2.18); S.add(rWin);

  S.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  S.userData.applyShutter = (open) => { shutter.scale.y = Math.max(0.02, 1 - open); };
  S.userData.applyShutter(0);
  return S;
}

// =====================================================================
// LOC Z — BAZAAR / MANDI (s04, ₹4 lakh = bori ka dher + thela)
// Depth layers: mitti farsh foreground | hero + bori dher mid | tarpaulin + buildings deep.
// =====================================================================
export function buildBazaar() {
  const S = new THREE.Group();
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(26, 9), bas({ map: dustySkyTex(), fog: false }));
  sky.position.set(0, 3.5, -9); S.add(sky);
  [[-6, 2.2, 0xa89888, -8.2], [1, 3.0, 0x98a0a8, -8.4], [6.5, 2.6, 0xb09888, -8.2]].forEach(([bx, bh, col, bz]) => {
    const b = box(3.4, bh, 0.7, lam({ color: col })); b.position.set(bx, bh / 2, bz); S.add(b);
  });
  // MITTI GROUND (dirt texture, y=0)
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 12), lam({ map: tex(dirt(64), 4, 4) }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, -1); ground.receiveShadow = true; S.add(ground);
  // --- BORI KA DHER (vishal, -1.5, 0, -3.8) — 4+3+2 = 9 bori, scale shift: Raju chhota, dher vishal ---
  const dher = [[-2.6, -3.6, 0.1], [-1.9, -3.8, -0.2], [-1.2, -3.6, 0.3], [-0.5, -3.8, -0.1]];
  dher.forEach(([bx, bz, ry]) => S.add(sack(bx, 0, bz, ry, 1.15)));
  [[-2.3, -3.7, 0.4], [-1.5, -3.7, -0.3], [-0.8, -3.7, 0.2]].forEach(([bx, bz, ry]) => S.add(sack(bx, 0.5, bz, ry, 1.1)));
  [[-1.9, -3.7, 0.2], [-1.2, -3.7, -0.4]].forEach(([bx, bz, ry]) => S.add(sack(bx, 1.0, bz, ry, 1.05)));
  // Ek khuli bori (aage, anaaj dikhta hai)
  const openSack = sack(0.6, 0, -3.2, 0.5, 1.0); S.add(openSack);
  const grain = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 6), lam({ color: 0xd8c49a }));
  grain.position.set(0.6, 0.52, -3.2); grain.scale.y = 0.5; S.add(grain);
  // --- ₹4,00,000 RATE BOARD (FIX R2 — still-04: number object bankar) ---
  // Mandi rate board: dark green + gold border + gold "₹4,00,000" (GALLA board
  // jaisa style, main.js gallaBoardTex). Bori dher ke saamne zameen par khada —
  // base takhta farsh ko chhoota hai; hero (-0.5,-2.0) se bayein, sab chehron se
  // neeche; BW camera se poora frame ke andar (margin ke saath).
  const rateTex = textBoard(640, 360, (g, w, h) => {
    g.fillStyle = '#14532d'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#facc15'; g.lineWidth = 14; g.strokeRect(10, 10, w - 20, h - 20);
    g.textAlign = 'center'; g.fillStyle = '#f8fafc';
    g.font = 'bold 52px Arial'; g.fillText('SAAMAAN', w / 2, 84);
    g.fillStyle = '#facc15'; g.font = 'bold 96px Arial'; g.fillText('₹4,00,000', w / 2, 210);
    g.fillStyle = '#f8fafc'; g.font = 'bold 40px Arial'; g.fillText('CHAAR LAKH • MANDI', w / 2, 300);
  });
  const rateBoard = boardMesh(1.3, 0.72, rateTex);
  rateBoard.position.set(-1.35, 0.42, -3.0);
  rateBoard.rotation.x = -0.06; // halka peeche jhuka, dher ki taraf
  S.add(rateBoard);
  const rateBase = box(1.0, 0.05, 0.28, lam({ color: 0x6b4a2f }));
  rateBase.position.set(-1.35, 0.025, -2.98); S.add(rateBase);
  // --- TARPAULIN (dher ke upar, 4 khambe + kapda) — khambe tarp ke konon par, hero (-0.5,-2.0) se saaf ---
  [[-3.6, -5.1], [0.0, -5.1], [-3.6, -2.5], [0.0, -2.5]].forEach(([px, pz]) => {
    const p = cyl(0.05, 0.05, 2.6, lam({ color: 0x6b4a2f }), 8); p.position.set(px, 1.3, pz); S.add(p);
  });
  const tarp = box(3.8, 0.04, 2.8, lam({ color: 0x7a8a6a })); tarp.position.set(-1.8, 2.65, -3.8); tarp.rotation.x = 0.08; tarp.rotation.z = -0.05; S.add(tarp);
  // --- SABZI TOKRE (foreground, farsh par) ---
  const vegCols = [0x5d8a3a, 0xb8452a, 0xd8a03a, 0x7a9a3a];
  [[2.2, -1.6], [2.9, -2.2], [1.6, -2.4]].forEach(([tx, tz], i) => {
    const basket = cyl(0.32, 0.26, 0.2, lam({ color: 0x8a6a3a }), 10); basket.position.set(tx, 0.1, tz); S.add(basket);
    for (let k = 0; k < 4; k++) {
      const v = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), lam({ color: vegCols[(i + k) % 4] }));
      v.position.set(tx + (k % 2 - 0.5) * 0.22, 0.22, tz + (Math.floor(k / 2) - 0.5) * 0.22); S.add(v);
    }
  });
  // --- THELA (dayein, 3.6, 0, 0.6) — bori lada hua ---
  const thelaG = new THREE.Group();
  const bed = box(1.6, 0.08, 0.9, lam({ map: tex(planks(65), 1, 1) })); bed.position.y = 0.55; thelaG.add(bed);
  [-0.7, 0.7].forEach((dx) => {
    const w = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 8, 16), lam({ color: 0x1f2937 }));
    w.position.set(dx, 0.28, 0.48); thelaG.add(w);
  });
  const handle = cyl(0.025, 0.025, 0.9, lam({ color: 0x4b5563 }), 6);
  handle.rotation.x = 0.9; handle.position.set(0, 0.75, 1.0); thelaG.add(handle);
  thelaG.add(sack(-0.3, 0.59, 0, 0.3, 0.9));
  thelaG.add(sack(0.4, 0.59, -0.1, -0.4, 0.9));
  thelaG.position.set(3.6, 0, 0.6); thelaG.rotation.y = -0.5; S.add(thelaG);
  // --- DUST / HAZE band (peeche, halka) + weighing scale (bada tarazu, mandi wala) ---
  const haze = new THREE.Mesh(new THREE.PlaneGeometry(12, 1.2), bas({ color: 0xe8dcc0, transparent: true, opacity: 0.35, fog: false }));
  haze.position.set(0, 0.9, -7.5); S.add(haze);
  // Bada tarazu (mandi): lakdi base + khamba + beam + 2 lohe ke palde
  const scaleBase = box(0.7, 0.1, 0.7, lam({ color: 0x6b4a2f })); scaleBase.position.set(2.6, 0.05, -3.4); S.add(scaleBase);
  const scalePole = cyl(0.04, 0.04, 1.4, lam({ color: 0x6b4a2f }), 8); scalePole.position.set(2.6, 0.8, -3.4); S.add(scalePole);
  const scaleBeam = box(1.1, 0.05, 0.05, lam({ color: 0x8a6a3a })); scaleBeam.position.set(2.6, 1.45, -3.4); S.add(scaleBeam);
  [-0.5, 0.5].forEach((dx) => {
    const pan = cyl(0.28, 0.2, 0.06, lam({ color: 0x4a4a48 }), 12); pan.position.set(2.6 + dx, 1.15, -3.4); S.add(pan);
    [-0.12, 0.12].forEach((ox) => {
      const wire = cyl(0.008, 0.008, 0.3, lam({ color: 0x2f3437 }), 4);
      wire.position.set(2.6 + dx + ox, 1.3, -3.4); S.add(wire);
    });
  });

  S.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return S;
}

// =====================================================================
// LOC C — GHAR (s08, shaam naram + light cone — hero akele, pareshan)
// Depth layers: rug/table foreground | hero mid | back wall/window deep.
// =====================================================================
export function buildHome() {
  const S = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), lam({ map: tex(planks(66), 3, 3) }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -1.5); floor.receiveShadow = true; S.add(floor);
  const rugTex = textBoard(256, 170, (g, w, h) => {
    g.fillStyle = '#7c4a2e'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#e8dcc0'; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#e8dcc0'; g.beginPath(); g.arc(w / 2, h / 2, 34, 0, 7); g.fill();
    g.fillStyle = '#7c4a2e'; g.beginPath(); g.arc(w / 2, h / 2, 22, 0, 7); g.fill();
  });
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), lam({ map: rugTex }));
  rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.015, -2.0); rug.receiveShadow = true; S.add(rug);
  // WALLS (garam cream #d8cbb2 — gym ke neele-grey se alag) + CEILING
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), lam({ color: 0xd8cbb2 }));
  backWall.position.set(0, 1.6, -5); backWall.receiveShadow = true; S.add(backWall);
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), lam({ color: 0xc8bba2 }));
  leftWall.rotation.y = Math.PI / 2; leftWall.position.set(-4, 1.6, -1.5); S.add(leftWall);
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), lam({ color: 0xc8bba2 }));
  rightWall.rotation.y = -Math.PI / 2; rightWall.position.set(4, 1.6, -1.5); S.add(rightWall);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), bas({ color: 0xc8bca6 }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 3.2, -1.5); S.add(ceil);

  // --- BED (bayein, -2.6, 0, -3.8) ---
  const headboard = box(1.5, 1.1, 0.08, lam({ color: 0x6b4a2f })); headboard.position.set(-2.6, 0.55, -4.9); S.add(headboard);
  const bedFrame = box(1.5, 0.25, 2.0, lam({ color: 0x6b4a2f })); bedFrame.position.set(-2.6, 0.2, -3.8); S.add(bedFrame);
  const mattress = box(1.4, 0.18, 1.9, lam({ color: 0xf8fafc })); mattress.position.set(-2.6, 0.42, -3.8); S.add(mattress);
  const pillow = box(0.9, 0.12, 0.45, lam({ color: 0xf8fafc })); pillow.position.set(-2.6, 0.55, -4.5); S.add(pillow);
  const blanket = box(1.4, 0.08, 0.9, lam({ color: 0x8a5a3a })); blanket.position.set(-2.6, 0.54, -3.3); S.add(blanket);
  [-3.2, -2.9].forEach((sx) => {
    const sl = box(0.12, 0.04, 0.3, lam({ color: 0x7c2d12 })); sl.position.set(sx, 0.02, -2.7); S.add(sl);
  });
  // --- BEDSIDE TABLE + ALARM CLOCK ---
  const bedside = box(0.45, 0.5, 0.4, lam({ color: 0x6b4a2f })); bedside.position.set(-1.4, 0.25, -3.9); S.add(bedside);
  const bsTop = box(0.5, 0.04, 0.45, lam({ map: tex(planks(67), 1, 1) })); bsTop.position.set(-1.4, 0.52, -3.9); S.add(bsTop);
  const clockBody = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 16), lam({ color: 0xa85b3f }));
  clockBody.rotation.x = Math.PI / 2; clockBody.position.set(-1.6, 0.65, -3.75); S.add(clockBody);
  const clockFaceS = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), lam({ color: 0xf8fafc }));
  clockFaceS.position.set(-1.6, 0.65, -3.715); S.add(clockFaceS);
  [-0.06, 0.06].forEach((dx) => {
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: 0x9ca3af }));
    bell.position.set(-1.6 + dx, 0.74, -3.75); S.add(bell);
  });
  // --- TABLE + CHAIR (dayein) — khata + cup + pen, sab ki base table top par ---
  const tableTop = box(1.4, 0.05, 0.8, lam({ map: tex(planks(68), 1, 1) })); tableTop.position.set(2.2, 0.75, -3.6); S.add(tableTop);
  [[1.6, -3.95], [2.8, -3.95], [1.6, -3.25], [2.8, -3.25]].forEach(([lx, lz]) => {
    const leg = box(0.06, 0.73, 0.06, lam({ color: 0x6b4a2f })); leg.position.set(lx, 0.365, lz); S.add(leg);
  });
  const bookL = box(0.28, 0.02, 0.4, lam({ color: 0x7a2e26 })); bookL.position.set(2.05, 0.79, -3.6); bookL.rotation.z = 0.06; S.add(bookL);
  const bookR = box(0.28, 0.02, 0.4, lam({ color: 0xf3ecd8 })); bookR.position.set(2.33, 0.79, -3.6); bookR.rotation.z = -0.06; S.add(bookR);
  const pen = cyl(0.008, 0.008, 0.16, lam({ color: 0x1f2937 }), 6);
  pen.rotation.z = Math.PI / 2; pen.rotation.y = 0.5; pen.position.set(2.5, 0.79, -3.35); S.add(pen);
  const cup = cyl(0.05, 0.04, 0.09, lam({ color: 0xa85b3f }), 10); cup.position.set(2.0, 0.82, -3.5); S.add(cup);
  const seat = box(0.45, 0.05, 0.45, lam({ color: 0x6b4a2f })); seat.position.set(1.8, 0.45, -2.7); S.add(seat);
  const chairBack = box(0.45, 0.6, 0.05, lam({ color: 0x6b4a2f })); chairBack.position.set(1.8, 0.8, -2.9); S.add(chairBack);
  [[1.6, -2.5], [2.0, -2.5], [1.6, -2.9], [2.0, -2.9]].forEach(([lx, lz]) => {
    const leg = box(0.05, 0.43, 0.05, lam({ color: 0x6b4a2f })); leg.position.set(lx, 0.215, lz); S.add(leg);
  });

  // --- WALL CALENDAR (0.6, 2.0, -4.94) — NOVEMBER, "1" laal ghare me (pehli tareekh) ---
  const calTex = textBoard(256, 320, (g, w, h) => {
    g.fillStyle = '#f8fafc'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#7a2e26'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#7a2e26'; g.fillRect(0, 0, w, 64);
    g.fillStyle = '#f8fafc'; g.font = 'bold 40px Arial'; g.textAlign = 'center'; g.fillText('NOVEMBER', w / 2, 46);
    g.fillStyle = '#1e293b'; g.font = 'bold 26px Arial';
    ['S M T W T F S', '1  2  3  4  5  6', '7  8  9 10 11 12', '13 14 15 16 17 18', '19 20 21 22 23 24'].forEach((row, i) => g.fillText(row, w / 2, 120 + i * 44));
    // "1" — pehli tareekh, laal ghare me: pehli data-row ka pehla akshar, measureText se napa hua.
    const rowW = g.measureText('1  2  3  4  5  6').width;
    const oneX = w / 2 - rowW / 2 + g.measureText('1').width / 2;
    g.strokeStyle = '#dc2626'; g.lineWidth = 5; g.beginPath(); g.arc(oneX, 156, 18, 0, 7); g.stroke();
    g.fillStyle = '#dc2626'; g.font = 'bold 30px Arial'; g.fillText('1', oneX, 166);
  });
  const calBoard = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.78), lam({ map: calTex }));
  calBoard.position.set(0.6, 2.0, -4.94); S.add(calBoard);
  // --- WALL CLOCK (-1.2, 2.6, -4.94) — shaam 6:00, static hands ---
  const clockTex = textBoard(256, 256, (g, w, h) => {
    g.fillStyle = '#fef9ec'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
    g.strokeStyle = '#1e293b'; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.stroke();
    g.fillStyle = '#1e293b'; g.textAlign = 'center'; g.font = 'bold 40px Arial';
    g.fillText('12', 128, 52); g.fillText('6', 128, 224); g.fillText('3', 210, 142); g.fillText('9', 46, 142);
  });
  const clockFace = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), lam({ map: clockTex }));
  clockFace.position.set(-1.2, 2.6, -4.94); S.add(clockFace);
  const hGeo = new THREE.BoxGeometry(0.03, 0.15, 0.01); hGeo.translate(0, 0.065, 0);
  const hHand = new THREE.Mesh(hGeo, lam({ color: 0x1e293b }));
  hHand.position.set(-1.2, 2.6, -4.92); hHand.rotation.z = Math.PI; S.add(hHand); // 6 baje
  const mGeo = new THREE.BoxGeometry(0.02, 0.22, 0.01); mGeo.translate(0, 0.1, 0);
  const mHand = new THREE.Mesh(mGeo, lam({ color: 0x1e293b }));
  mHand.position.set(-1.2, 2.6, -4.91); mHand.rotation.z = 0; S.add(mHand);

  // --- WINDOW (dayein, 3.3, 1.9) — shaam ki naram roshni + side curtain ---
  const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.3), new THREE.MeshPhongMaterial({ map: eveningSkyTex(), shininess: 60, specular: 0x554433 }));
  winGlass.position.set(3.3, 1.9, -4.96); S.add(winGlass);
  const winMat = lam({ color: 0x4a3428 });
  [[3.3, 2.57, 1.3, 0.08], [3.3, 1.23, 1.3, 0.08], [2.72, 1.9, 0.08, 1.42], [3.88, 1.9, 0.08, 1.42]].forEach(([wx, wy, ww, wh]) => {
    const f = box(ww, wh, 0.04, winMat); f.position.set(wx, wy, -4.93); S.add(f);
  });
  const winBarV = box(0.05, 1.26, 0.04, winMat); winBarV.position.set(3.3, 1.9, -4.93); S.add(winBarV);
  const rod = cyl(0.015, 0.015, 1.6, lam({ color: 0x374151 }), 6);
  rod.rotation.z = Math.PI / 2; rod.position.set(3.3, 2.7, -4.88); S.add(rod);
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 1.5), lam({ color: 0x7c4a2e }));
  curtain.position.set(3.85, 1.95, -4.88); S.add(curtain);
  // --- SHELF (3.2, 2.4) + books + bottle + FRAMED PHOTO (bayein wall) ---
  const shelf = box(1.0, 0.05, 0.22, lam({ color: 0x6b4a2f })); shelf.position.set(3.2, 2.4, -4.86); S.add(shelf);
  [[2.95, 0x2f6b4f], [3.1, 0xa85b3f]].forEach(([bx, col]) => {
    const bk = box(0.1, 0.28, 0.16, lam({ color: col })); bk.position.set(bx, 2.57, -4.86); S.add(bk);
  });
  const sBottle = cyl(0.045, 0.045, 0.26, lam({ color: 0x5d8a3a }), 10); sBottle.position.set(3.45, 2.56, -4.86); S.add(sBottle);
  const photoTex = textBoard(200, 240, (g, w, h) => {
    // Framed landscape photo — aasmaan + suraj + pahad (chehra/icon jaisa kuch nahi).
    g.fillStyle = '#f6d8a8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#a8c4d8'; g.fillRect(0, 0, w, 150);
    g.fillStyle = '#f6b73c'; g.beginPath(); g.arc(150, 50, 22, 0, 7); g.fill();
    g.fillStyle = '#5d7a4a'; g.beginPath(); g.moveTo(0, 150); g.lineTo(70, 90); g.lineTo(140, 150); g.fill();
    g.fillStyle = '#7a9a5a'; g.beginPath(); g.moveTo(80, 150); g.lineTo(160, 100); g.lineTo(200, 150); g.fill();
    g.fillStyle = '#8a6a4a'; g.fillRect(0, 150, w, 90);
  });
  const photo = boardMesh(0.4, 0.48, photoTex); photo.position.set(-3.2, 2.2, -4.94); S.add(photo);

  // --- HANGING BULB (0, 3.0, -2.5) — wire ceiling se bulb tak + LIGHT CONE (hero akele) ---
  const wire = cyl(0.008, 0.008, 0.32, lam({ color: 0x111827 }), 6); wire.position.set(0, 3.04, -2.5); S.add(wire);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), bas({ color: 0xffe9a8, fog: false }));
  bulb.position.set(0, 2.84, -2.5); S.add(bulb);
  const bulbLight = new THREE.PointLight(0xffc27a, 0.8, 8, 1.5);
  bulbLight.position.set(0, 2.8, -2.5); S.add(bulbLight);
  const lightCone = new THREE.Mesh(new THREE.ConeGeometry(0.7, 3.4, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  lightCone.position.set(-2.6, 1.5, -3.6); lightCone.rotation.set(0.35, 0, 0.15); lightCone.visible = false; S.add(lightCone);

  S.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  S.userData.bulbLight = bulbLight;
  S.userData.lightCone = lightCone;
  return S;
}

// =====================================================================
// LOC S — SUPERMARKET (s12, rival — THANDI fluorescent roshni, dukaan se CONTRAST)
// Depth layers: trolley foreground | hero + rival mid | steel shelves deep.
// =====================================================================
export function buildSupermarket() {
  const S = new THREE.Group();
  // FLOOR (safed tiles, halki grey grout) + WALLS (pale cool grey) + CEILING
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), lam({ map: tex(tiles(69), 5, 5), color: 0xe8e8e8 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -1); floor.receiveShadow = true; S.add(floor);
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 4.0), lam({ color: 0xc8ccd0 }));
  backWall.position.set(0, 2.0, -6); backWall.receiveShadow = true; S.add(backWall);
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 4.0), lam({ color: 0xb8bcc0 }));
  leftWall.rotation.y = Math.PI / 2; leftWall.position.set(-5, 2.0, -1.5); S.add(leftWall);
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 4.0), lam({ color: 0xb8bcc0 }));
  rightWall.rotation.y = -Math.PI / 2; rightWall.position.set(5, 2.0, -1.5); S.add(rightWall);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), bas({ color: 0xe8eaec }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 4.0, -1.5); S.add(ceil);
  // Fluorescent panels (thande safed, ceiling par)
  [[-2, -3], [2, -3]].forEach(([lx, lz]) => {
    const panel = box(1.6, 0.04, 0.5, bas({ color: 0xf0f4f8, fog: false })); panel.position.set(lx, 3.96, lz); S.add(panel);
    const pFrame = box(1.7, 0.03, 0.6, lam({ color: 0x8a9096 })); pFrame.position.set(lx, 3.99, lz); S.add(pFrame);
  });
  // --- UPI BOARD (back wall, 1.5, 2.6) — "UPI • SCAN & PAY" ---
  const upiTex = textBoard(512, 384, (g, w, h) => {
    g.fillStyle = '#f8fafc'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#1f2937'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = '#1f2937'; g.font = 'bold 96px Arial'; g.textAlign = 'center'; g.fillText('UPI', w / 2, 130);
    g.fillStyle = '#5b21b6'; g.font = 'bold 44px Arial'; g.fillText('SCAN & PAY', w / 2, 200);
    // fake QR — deterministic squares
    let s = 7; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) {
      if (rnd() > 0.45) { g.fillStyle = '#1f2937'; g.fillRect(196 + x * 20, 230 + y * 20, 16, 16); }
    }
  });
  const upiBoard = boardMesh(1.1, 0.82, upiTex); upiBoard.position.set(1.5, 2.6, -5.94); S.add(upiBoard);
  // --- STEEL SHELVES (2 rows, z -3.4 aur -4.8) — khula frame: back panel + posts + planks,
  // packets plank par saaf dikhte hain (solid box nahi — packets andar chhupte the) ---
  const packetCols = [0x8a9a5a, 0xa85b3f, 0x5a7a8a, 0x9a8a6a, 0x7a6a8a, 0xb08a3a];
  const shelfRow = (sz) => {
    [-2.2, 0, 2.2].forEach((sx) => {
      const back = box(1.9, 1.9, 0.04, lam({ color: 0x9aa0a6 })); back.position.set(sx, 0.95, sz - 0.23); S.add(back);
      [-0.92, 0.92].forEach((dx) => {
        const post = box(0.06, 1.9, 0.5, lam({ color: 0x7a8086 })); post.position.set(sx + dx, 0.95, sz); S.add(post);
      });
      const topPlank = box(1.9, 0.04, 0.5, lam({ color: 0x7a8086 })); topPlank.position.set(sx, 1.92, sz); S.add(topPlank);
      [0.5, 1.1, 1.7].forEach((sy) => {
        const shelf = box(1.85, 0.04, 0.48, lam({ color: 0x7a8086 })); shelf.position.set(sx, sy, sz); S.add(shelf);
        for (let k = 0; k < 5; k++) {
          const pk = box(0.28, 0.34, 0.2, lam({ color: packetCols[(k + (sx > 0 ? 2 : 0)) % 6] }));
          pk.position.set(sx - 0.7 + k * 0.35, sy + 0.19, sz + 0.02); S.add(pk);
        }
      });
    });
  };
  shelfRow(-3.4); shelfRow(-4.8);
  // --- TROLLEY (foreground, 2.8, 0, -0.6) — steel wire basket + wheels ---
  const trolley = new THREE.Group();
  const basket = box(0.7, 0.4, 0.45, lam({ color: 0x9aa0a6 })); basket.position.y = 0.75; trolley.add(basket);
  const basketTop = box(0.74, 0.03, 0.49, lam({ color: 0x7a8086 })); basketTop.position.y = 0.96; trolley.add(basketTop);
  [[-0.3, -0.18], [0.3, -0.18], [-0.3, 0.18], [0.3, 0.18]].forEach(([wx, wz]) => {
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), lam({ color: 0x1f2937 }));
    w.position.set(wx, 0.05, wz); trolley.add(w);
    const leg = cyl(0.015, 0.015, 0.5, lam({ color: 0x7a8086 }), 6); leg.position.set(wx, 0.3, wz); trolley.add(leg);
  });
  const pushBar = cyl(0.02, 0.02, 0.7, lam({ color: 0x7a8086 }), 6);
  pushBar.rotation.z = Math.PI / 2; pushBar.position.set(0, 0.95, 0.28); trolley.add(pushBar);
  // trolley me 2 packets
  [[-0.15, 0x8a9a5a], [0.15, 0xa85b3f]].forEach(([px, col]) => {
    const pk = box(0.24, 0.3, 0.18, lam({ color: col })); pk.position.set(px, 0.85, 0); trolley.add(pk);
  });
  // ROUND-3: trolley (1.0,0,-0.6) SW frame me BAHUT badi thi (hero ki taangein
  // dhak di) — ab (1.4,0,-2.6) hero ke bagal me, aisle me, chehre/taangon se door.
  trolley.position.set(1.4, 0, -2.6); trolley.rotation.y = 0.3; S.add(trolley);
  // --- DISPLAY TABLE (foreground, -0.6, 0, -0.8) — promo table + boxes:
  // STILLS RESIDUAL 12 FIX (full build R2) — SW wide me farsh ~35% khaali tha.
  // Table neeche (0.45) + boxes upar (0.8 tak) — hero/rival ke chehre se neeche,
  // farsh ka khaali hissa bharta hai, kisi ko dhakta nahi. Base farsh ko chhooti hai.
  const dispTop = box(1.4, 0.06, 0.7, lam({ color: 0xd8dce0 })); dispTop.position.set(-0.6, 0.45, -0.8); S.add(dispTop);
  [[-0.65, 0.22], [0.65, 0.22], [-0.65, -0.22], [0.65, -0.22]].forEach(([lx, lz]) => {
    const leg = box(0.06, 0.45, 0.06, lam({ color: 0x7a8086 })); leg.position.set(-0.6 + lx, 0.225, -0.8 + lz); S.add(leg);
  });
  [[-0.5, 0x8a9a5a], [-0.1, 0xa85b3f], [0.3, 0x5a7a8a], [-0.3, 0xb08a3a]].forEach(([bx, col]) => {
    const pk = box(0.3, 0.32, 0.26, lam({ color: col })); pk.position.set(-0.6 + bx, 0.64, -0.8); S.add(pk);
  });
  // --- CHECKOUT COUNTER (dayein, 3.8, 0, -3.2) — safed top + scanner ---
  const coCounter = box(1.6, 0.9, 0.6, lam({ color: 0xd8dce0 })); coCounter.position.set(3.8, 0.45, -3.2); S.add(coCounter);
  const coTop = box(1.7, 0.05, 0.7, lam({ color: 0xf8fafc })); coTop.position.set(3.8, 0.93, -3.2); S.add(coTop);
  const scanner = box(0.2, 0.12, 0.2, lam({ color: 0x1f2937 })); scanner.position.set(3.8, 1.02, -3.2); S.add(scanner);

  S.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return S;
}

// =====================================================================
// LOC G — MOHALLA GALI (s11/s13, shaam garam roshni)
// Depth layers: mitti sadak foreground | hero + cycle mid | makaan + haze deep.
// =====================================================================
export function buildGali() {
  const S = new THREE.Group();
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(26, 9), bas({ map: eveningSkyTex(), fog: false }));
  sky.position.set(0, 3.5, -9); S.add(sky);
  [[-6, 2.4, 0xa89888, -8.2], [1, 3.0, 0x98a0a8, -8.4], [6.5, 2.6, 0xb09888, -8.2]].forEach(([bx, bh, col, bz]) => {
    const b = box(3.4, bh, 0.7, lam({ color: col })); b.position.set(bx, bh / 2, bz); S.add(b);
  });
  // MITTI SADAK (dirt, y=0) + kinare ki patti
  const road = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), lam({ map: tex(dirt(70), 4, 2) }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, 0.5); road.receiveShadow = true; S.add(road);
  // --- MAKAAAN BAYEIN (-5.5, 0, -2.5) — ochre deewaar + darwaza + khidki ---
  const houseL = box(2.6, 3.4, 2.0, lam({ color: 0xc8a878 })); houseL.position.set(-5.5, 1.7, -2.5); S.add(houseL);
  const doorL = box(0.9, 1.9, 0.06, lam({ color: 0x5d3a22 })); doorL.position.set(-5.5, 0.95, -1.47); S.add(doorL);
  const winL = box(0.8, 0.8, 0.06, lam({ color: 0x3a4a5a })); winL.position.set(-5.5, 2.5, -1.47); S.add(winL);
  const roofL = box(3.0, 0.15, 2.4, lam({ color: 0x7a4a3a })); roofL.position.set(-5.5, 3.45, -2.5); S.add(roofL);
  // --- MAKAAAN DAYEIN (5.5, 0, -2.5) — sage deewaar + darwaza + khidki + chhajja ---
  const houseR = box(2.6, 3.2, 2.0, lam({ color: 0x9aaa8a })); houseR.position.set(5.5, 1.6, -2.5); S.add(houseR);
  const doorR = box(0.9, 1.9, 0.06, lam({ color: 0x4a3220 })); doorR.position.set(5.5, 0.95, -1.47); S.add(doorR);
  const winR = box(0.8, 0.8, 0.06, lam({ color: 0x3a4a5a })); winR.position.set(5.5, 2.5, -1.47); S.add(winR);
  const chhajja = box(1.4, 0.08, 0.7, lam({ color: 0x8a7a6a })); chhajja.position.set(5.5, 2.1, -1.2); S.add(chhajja);
  // --- DUKAAN KA BAHARI HISSA (peeche bayein, -3.5, 0, -4.5) — chhota board + shutter jhalak ---
  const shopBack = box(3.0, 3.0, 0.8, lam({ color: 0xd8cbb2 })); shopBack.position.set(-3.5, 1.5, -4.5); S.add(shopBack);
  const shopSign = boardMesh(2.2, 0.55, kiranaSignTex); shopSign.position.set(-3.5, 2.6, -4.08); S.add(shopSign);
  const shopShutter = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.2), lam({ color: 0x7a6a4a }));
  shopShutter.position.set(-3.5, 1.1, -4.08); S.add(shopShutter);
  // --- KAPDE KI RASSI (upar, -3.8..3.8, y 2.1, z -3) — rassi + 3 kapde, sab latke hue ---
  // F5/F7 FIX — kapde ab x -3.8 / 1.8 / 2.8 par: queue (x -1.5..-2.7) aur hero/uncle
  // (x -0.7..0.8) ki face-line se poori tarah door — koi kapda kisi chehre ko
  // kabhi nahi dhakta (pehle beech wala grey kapda purple graahak ka chehra + s13
  // me hero-uncle ke beech tairta tha). Rassi neechi rakhi hai taaki kapde dukaan
  // ke sign (y 2.6) ko kabhi na dhakein.
  const rope = cyl(0.012, 0.012, 7.6, lam({ color: 0x3a2f22 }), 6);
  rope.rotation.z = Math.PI / 2; rope.position.set(0, 2.1, -3.0); S.add(rope);
  [[-3.8, 0xc8b8a8], [1.8, 0x9aaac8], [2.8, 0xd8a05a]].forEach(([cx, col]) => {
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.9), lam({ color: col, side: THREE.DoubleSide }));
    cloth.position.set(cx, 1.62, -3.0); S.add(cloth);
    const pin = box(0.06, 0.06, 0.04, lam({ color: 0x8a6a3a })); pin.position.set(cx, 2.08, -3.0); S.add(pin);
  });
  // --- PARKED CYCLE (3.2, 0, -1.8) + POTTED PLANT + GHASS KE GUCCHE (kinare) ---
  S.add(cycle(3.2, -1.8, -0.4));
  const pot = cyl(0.22, 0.16, 0.35, lam({ color: 0xa85b3f }), 10); pot.position.set(-4.2, 0.175, -1.2); S.add(pot);
  const bush = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), lam({ color: 0x5d7a4a }));
  bush.position.set(-4.2, 0.55, -1.2); S.add(bush);
  [[-5.0, 1.8], [4.6, 2.2], [-1.5, 3.0]].forEach(([gx, gz]) => {
    const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), lam({ color: 0x7a9a5a }));
    tuft.position.set(gx, 0.12, gz); tuft.scale.y = 0.6; S.add(tuft);
  });
  // --- LAMP POST (-4.6, 0, 0.8) — shaam, halka glow (static) ---
  const pole = cyl(0.05, 0.07, 3.0, lam({ color: 0x1f2937 }), 10); pole.position.set(-4.6, 1.5, 0.8); S.add(pole);
  const lampHead = box(0.22, 0.12, 0.3, lam({ color: 0x374151 })); lampHead.position.set(-4.6, 2.95, 0.8); S.add(lampHead);
  const lampGlow = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), bas({ color: 0xffe9a8, fog: false }));
  lampGlow.position.set(-4.6, 2.86, 0.8); S.add(lampGlow);

  S.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return S;
}
