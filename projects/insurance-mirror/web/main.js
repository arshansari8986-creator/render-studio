// "Insurance Agent — EP-9 FULL" — Mirror Trick Tales style.
// Real three.js sets (office / paper / home / time / complaint / mirror / dark)
// + kit toon cards + word-by-word Roman captions. Scene-by-scene, Zack-style cuts.
// Contract (render.mjs): window.ready, window.renderFrame(f), canvas #c 1080x1920.
import * as THREE from 'three';
import * as FX from './fx.js';
import * as T from './toon.js';
import { idle, blinkAt, q, M, kf, kf3 } from './motion.js';
import { tex, planks, plaster, weave } from './paint.js';
import { TOTAL, shotAt, camFor, captionAt } from './story.js';

const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 300);
const lam = (o) => new THREE.MeshLambertMaterial(o);
const bas = (o) => new THREE.MeshBasicMaterial(o);

// ---------- global lights (intensities tuned per set in applyEnv) ----------
const hemi = new THREE.HemisphereLight(0xffe7c4, 0x5a4632, 0.9); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffd9a0, 1.7);
sun.position.set(-5, 6.5, 4); scene.add(sun); scene.add(sun.target);

// ---------- canvas-texture helper ----------
function textBoard(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
const boardMesh = (w, h, texB, basic = false) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic ? bas({ map: texB }) : lam({ map: texB }));

// =====================================================================
// OFFICE SET (sample set, extended)
// =====================================================================
const officeG = new THREE.Group(); scene.add(officeG);
const WALL_Z = -3.2;
let coinsG, moneyG, paperSlip, qBoardA, qBoardB, freeG, doorG, qMark, boardCrore, boardLakh;
{
  const S = officeG;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), lam({ map: tex(planks(7), 5, 5) }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 4); S.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 7), lam({ map: tex(plaster(11, 38), 4, 1) }));
  wall.position.set(0, 3.5, WALL_Z); S.add(wall);
  for (const s of [-1, 1]) {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(20, 7), lam({ map: tex(plaster(13, 36), 3, 1), color: 0xdcc39c }));
    sw.position.set(s * 7.4, 3.5, 3); sw.rotation.y = -s * Math.PI / 2; S.add(sw);
  }
  const trimM = lam({ color: 0x6d4a2e });
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(30, 0.28, 0.06), trimM); skirt.position.set(0, 0.14, WALL_Z + 0.03); S.add(skirt);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(30, 0.09, 0.05), trimM); rail.position.set(0, 4.35, WALL_Z + 0.03); S.add(rail);

  // window (left)
  const winG = new THREE.Group(); winG.position.set(-3.1, 2.75, WALL_Z + 0.06); S.add(winG);
  winG.add(new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.9, 0.1), lam({ color: 0x5d3f24 })));
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.95, 2.55), FX.glassMat(0xffc46b, 0.92)); glass.position.z = 0.06; winG.add(glass);
  const barV = new THREE.Mesh(new THREE.BoxGeometry(0.07, 2.55, 0.04), lam({ color: 0x5d3f24 })); barV.position.z = 0.09; winG.add(barV);
  const barH = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.07, 0.04), lam({ color: 0x5d3f24 })); barH.position.z = 0.09; winG.add(barH);
  const gl = FX.glint(0.9); gl.position.set(-0.4, 0.5, 0.12); winG.add(gl);

  // sign board
  const signTex = textBoard(1024, 176, (g, w, h) => {
    g.fillStyle = '#274b73'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#e8b64c'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#ffd76a'; g.font = 'bold 92px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('SUKHDA  INSURANCE', w / 2, h / 2 + 4);
  });
  const sign = boardMesh(4.6, 0.79, signTex, true); sign.position.set(0.35, 4.0, WALL_Z + 0.05); S.add(sign);

  // poster (right)
  const posterTex = textBoard(512, 640, (g, w, h) => {
    g.fillStyle = '#f3e5c3'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#a33327'; g.font = 'bold 64px Arial'; g.textAlign = 'center';
    g.fillText('SURAKSHA', w / 2, 120); g.fillText('HI', w / 2, 200); g.fillText('DHAN', w / 2, 280); g.fillText('HAI', w / 2, 360);
    g.fillStyle = '#274b73'; g.font = 'bold 44px Arial'; g.fillText('★ ★ ★', w / 2, 500);
  });
  const pFrame = new THREE.Mesh(new THREE.BoxGeometry(1.27, 1.56, 0.05), lam({ color: 0x5d3f24 }));
  pFrame.position.set(3.35, 2.8, WALL_Z + 0.02); S.add(pFrame);
  const poster = boardMesh(1.15, 1.44, posterTex); poster.position.set(3.35, 2.8, WALL_Z + 0.05); S.add(poster);

  // wall clock (static face; animated one lives in the time set)
  const clockTex = textBoard(256, 256, (g, w, h) => {
    g.fillStyle = '#f7f1e2'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
    g.strokeStyle = '#3a2c1c'; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 116, 0, 7); g.stroke();
    g.strokeStyle = '#3a2c1c'; g.lineWidth = 8; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 52); g.stroke();
    g.lineWidth = 6; g.beginPath(); g.moveTo(128, 128); g.lineTo(178, 150); g.stroke();
    g.fillStyle = '#a33327'; g.beginPath(); g.arc(128, 128, 10, 0, 7); g.fill();
  });
  const clock = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24), lam({ map: clockTex }));
  clock.position.set(5.4, 3.1, WALL_Z + 0.06); S.add(clock);

  // file cabinet (left)
  const cab = new THREE.Group(); cab.position.set(-4.6, 0, -1.2); cab.rotation.y = 0.5; S.add(cab);
  const cabBody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.3, 0.55), lam({ map: FX.woodTexture(), color: 0x8a6844 })); cabBody.position.y = 1.15; cab.add(cabBody);
  [0xb03a2e, 0x2e5da8, 0xd9a441, 0x3f7a4a, 0x7a4a8a, 0xc96a2c].forEach((c, i) => {
    const fb = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.62, 0.4), lam({ color: c }));
    fb.position.set(-0.55 + i * 0.22, 2.62, 0); fb.rotation.z = i === 5 ? -0.18 : 0; cab.add(fb);
  });

  // plant (right corner)
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.26, 0.5, 10), lam({ color: 0xa3542e }));
  pot.position.set(4.5, 0.25, -2.0); S.add(pot);
  const leafM = lam({ color: 0x3f7a3a });
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.1 + (i % 3) * 0.25, 6), leafM);
    const a = i / 5 * Math.PI * 2;
    leaf.position.set(4.5 + Math.cos(a) * 0.18, 1.0 + (i % 3) * 0.16, -2.0 + Math.sin(a) * 0.18);
    leaf.rotation.set(Math.sin(a) * 0.35, 0, Math.cos(a) * 0.35); S.add(leaf);
  }

  // desk
  const deskM = lam({ map: FX.woodTexture(), color: 0x9a724e });
  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.14, 1.6), deskM); deskTop.position.set(0, 1.02, 0); S.add(deskTop);
  const deskFront = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.95, 0.1), lam({ map: FX.woodTexture(), color: 0x7d5a38 })); deskFront.position.set(0, 0.5, 0.75); S.add(deskFront);
  for (const s of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.95, 1.5), deskM); side.position.set(s * 2.3, 0.5, 0); S.add(side);
  }
  const plateTex = textBoard(512, 96, (g, w, h) => {
    g.fillStyle = '#1d2733'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#ffd76a'; g.lineWidth = 5; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#ffd76a'; g.font = 'bold 44px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('INSURANCE AGENT', w / 2, h / 2 + 2);
  });
  const plate = boardMesh(1.5, 0.28, plateTex, true); plate.position.set(0, 0.52, 0.81); S.add(plate);

  // desk props
  const paperM = lam({ color: 0xf5efe0 });
  for (let i = 0; i < 3; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.02, 0.85), paperM);
    p.position.set(-0.55, 1.11 + i * 0.022, 0.25); p.rotation.y = i * 0.12 - 0.1; S.add(p);
  }
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.22, 8), lam({ color: 0x333c48 }));
  stand.position.set(0.62, 1.2, 0.3); S.add(stand);
  for (let i = 0; i < 3; i++) {
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.34, 5), lam({ color: [0xb03a2e, 0x2e5da8, 0x2c7a3f][i] }));
    pen.position.set(0.58 + i * 0.045, 1.36, 0.3); pen.rotation.z = 0.16 - i * 0.13; S.add(pen);
  }
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: 0xd9a845, emissive: 0x59430e }));
  bell.position.set(0.15, 1.09, 0.45); S.add(bell);
  const chairM = lam({ color: 0x5d3f24 });
  const aChair = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.1, 0.09), chairM); aChair.position.set(0, 1.5, -1.95); S.add(aChair);
  const cSeat = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.09, 0.95), chairM); cSeat.position.set(1.7, 0.52, 3.0); S.add(cSeat);
  for (const [lx, lz] of [[1.25, 2.68], [2.15, 2.68], [1.25, 3.42], [2.15, 3.42]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.52, 0.08), chairM); leg.position.set(lx, 0.26, lz); S.add(leg);
  }
  const lampLight = new THREE.PointLight(0xffc98a, 12, 14, 1.8); lampLight.position.set(3.4, 3.1, 1.2); S.add(lampLight);

  // ---- policy boards on the desk ----
  function policyBoard(big, small, bg, fg, accent) {
    const t = textBoard(640, 480, (g, w, h) => {
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      g.strokeStyle = accent; g.lineWidth = 14; g.strokeRect(12, 12, w - 24, h - 24);
      g.fillStyle = fg; g.textAlign = 'center';
      let bigFs = 118; g.font = `bold ${bigFs}px Arial`;
      while (g.measureText(big).width > w - 72 && bigFs > 40) { bigFs -= 6; g.font = `bold ${bigFs}px Arial`; }
      g.fillText(big, w / 2, 205);
      g.font = 'bold 84px Arial'; g.fillStyle = accent; g.fillText(small, w / 2, 330);
      g.font = 'bold 40px Arial'; g.fillStyle = fg; g.fillText('POLICY', w / 2, 415);
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 1.16), lam({ map: t, side: THREE.DoubleSide }));
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.59, 1.2, 0.04), lam({ color: 0x4a3826 }));
    const g2 = new THREE.Group(); g2.add(back); m.position.z = 0.03; g2.add(m);
    return g2;
  }
  boardCrore = policyBoard('₹1 CRORE', 'COVER', '#20509e', '#ffffff', '#ffd76a');
  boardCrore.position.set(-1.3, 1.72, -0.28); boardCrore.rotation.y = 0.14; S.add(boardCrore);
  boardLakh = policyBoard('₹7 LAKH', 'COVER', '#c9930a', '#2b1d05', '#fff3c4');
  boardLakh.position.set(1.3, 1.72, -0.28); boardLakh.rotation.y = -0.14; S.add(boardLakh);
  qBoardA = policyBoard('COVER', 'BADA?', '#20509e', '#ffffff', '#ffd76a');
  qBoardA.position.copy(boardCrore.position); qBoardA.rotation.y = 0.14; S.add(qBoardA);
  qBoardB = policyBoard('COMMISSION', 'BADA?', '#8a2f6b', '#ffffff', '#ffd76a');
  qBoardB.position.copy(boardLakh.position); qBoardB.rotation.y = -0.14; S.add(qBoardB);

  // ---- commission coin stacks (s03, s08) ----
  coinsG = new THREE.Group(); S.add(coinsG);
  const coinM = lam({ color: 0xe8b64c, emissive: 0x4a3408 });
  const coinGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.038, 18);
  const stack = (x, n) => { for (let i = 0; i < n; i++) { const c = new THREE.Mesh(coinGeo, coinM); c.position.set(x, 1.11 + i * 0.04, 0.38); coinsG.add(c); } };
  stack(-0.95, 5); stack(1.05, 14);
  const coinLabel = (txt, x, col) => {
    const t = textBoard(384, 128, (g, w, h) => {
      g.fillStyle = '#1d2733'; g.fillRect(0, 0, w, h);
      g.strokeStyle = col; g.lineWidth = 6; g.strokeRect(7, 7, w - 14, h - 14);
      g.fillStyle = col; g.font = 'bold 62px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 3);
    });
    const m = boardMesh(0.78, 0.26, t, true); m.position.set(x, 1.24, 0.72); m.rotation.x = -0.15; coinsG.add(m);
  };
  coinLabel('₹4,000', -0.95, '#ffd76a'); coinLabel('₹15,000', 1.05, '#ff9a8a');

  // ---- money bundles (s20, s21): ₹5 LAKH paid vs ₹3 LAKH got ----
  moneyG = new THREE.Group(); S.add(moneyG);
  const bundleTex = textBoard(256, 128, (g, w, h) => {
    g.fillStyle = '#7fae6e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#5d8a4e'; g.fillRect(0, 10, w, 4); g.fillRect(0, h - 14, w, 4);
    g.fillStyle = '#f5f2e4'; g.fillRect(w / 2 - 26, 0, 52, h);
    g.fillStyle = '#3c5a34'; g.font = 'bold 34px Arial'; g.textAlign = 'center'; g.fillText('₹500', w / 2, 52);
    g.strokeStyle = '#4a6e42'; g.lineWidth = 5; g.strokeRect(3, 3, w - 6, h - 6);
  });
  const bundleM = lam({ map: bundleTex });
  const bundleGeo = new THREE.BoxGeometry(0.58, 0.1, 0.3);
  const pile = (x, n) => { for (let i = 0; i < n; i++) { const b = new THREE.Mesh(bundleGeo, bundleM); b.position.set(x, 1.15 + i * 0.105, 0.15); b.rotation.y = (i % 2 ? 0.06 : -0.05); moneyG.add(b); } };
  pile(-0.85, 10); pile(0.8, 6);
  const moneyLabel = (txt, x, col) => {
    const t = textBoard(512, 144, (g, w, h) => {
      g.fillStyle = '#1d2733'; g.fillRect(0, 0, w, h);
      g.strokeStyle = col; g.lineWidth = 6; g.strokeRect(7, 7, w - 14, h - 14);
      g.fillStyle = col; g.font = 'bold 58px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 3);
    });
    const m = boardMesh(1.06, 0.3, t, true); m.position.set(x, 0.62, 0.83); moneyG.add(m);
  };
  moneyLabel('₹5 LAKH BHAARE', -0.85, '#ffd76a'); moneyLabel('₹3 LAKH MILE', 0.8, '#ff9a8a');

  // ---- policy paper slip that slides on the desk (s12) ----
  const slipTex = textBoard(512, 680, (g, w, h) => {
    g.fillStyle = '#f7f2e2'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#274b73'; g.font = 'bold 40px Arial'; g.textAlign = 'center'; g.fillText('POLICY', w / 2, 62);
    g.fillStyle = '#9a917e'; for (let i = 0; i < 12; i++) g.fillRect(46, 120 + i * 38, w - 92 - (i % 3) * 40, 9);
    g.fillStyle = '#a33327'; g.font = 'bold 54px Arial'; g.fillText('₹7,00,000', w / 2, 620);
  });
  paperSlip = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 1.22), lam({ map: slipTex, side: THREE.DoubleSide }));
  paperSlip.rotation.x = -Math.PI / 2; paperSlip.rotation.z = 0.1; paperSlip.position.set(0.9, 1.1, 0.32); S.add(paperSlip);

  // ---- FREE-LOOK reveal board (s26) ----
  freeG = new THREE.Group(); S.add(freeG);
  const freeTex = textBoard(1024, 512, (g, w, h) => {
    g.fillStyle = '#8a6414'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c9930a'; g.fillRect(14, 14, w - 28, h - 28);
    g.strokeStyle = '#fff3c4'; g.lineWidth = 10; g.strokeRect(30, 30, w - 60, h - 60);
    g.fillStyle = '#ffffff'; g.textAlign = 'center';
    g.font = 'bold 150px Arial'; g.fillText('30 DIN', w / 2, 215);
    g.font = 'bold 170px Arial'; g.fillText('FREE-LOOK', w / 2, 405);
  });
  const freeBoard = boardMesh(3.3, 1.65, freeTex, true); freeBoard.position.set(0, 2.8, 0.1); freeG.add(freeBoard);
  const irdaiTex = textBoard(640, 112, (g, w, h) => {
    g.fillStyle = '#1d2733'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#ffd76a'; g.lineWidth = 5; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#ffd76a'; g.font = 'bold 52px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('IRDAI KA NIYAM', w / 2, h / 2 + 2);
  });
  const irdai = boardMesh(1.7, 0.3, irdaiTex, true); irdai.position.set(0, 1.82, 0.1); freeG.add(irdai);
  freeG.userData.board = freeBoard;

  // ---- door with glowing ? (tease, dark shots) ----
  doorG = new THREE.Group(); doorG.position.set(3.6, 0, WALL_Z + 0.08); S.add(doorG);
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 4.3, 0.12), lam({ color: 0x3a2817 }));
  doorFrame.position.y = 2.15; doorG.add(doorFrame);
  const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.7, 4.0, 0.08), lam({ map: FX.woodTexture(), color: 0x6d4a2c }));
  doorPanel.position.set(0, 2.0, 0.04); doorG.add(doorPanel);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), lam({ color: 0xd9a845, emissive: 0x59430e }));
  knob.position.set(-0.62, 1.9, 0.12); doorG.add(knob);
  const qTex = textBoard(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.font = 'bold 210px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = '#ffcf4d'; g.shadowBlur = 42; g.fillStyle = '#ffd76a';
    g.fillText('?', w / 2, h / 2 + 8); g.fillText('?', w / 2, h / 2 + 8);
  });
  qMark = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.15), bas({ map: qTex, transparent: true, depthWrite: false }));
  qMark.position.set(0, 2.6, 0.14); doorG.add(qMark);
  const doorLight = new THREE.PointLight(0xffc46b, 6, 9, 1.6); doorLight.position.set(0, 2.4, 1.4); doorG.add(doorLight);
}

// =====================================================================
// PAPER SET — giant policy sheet macro (L7 kagaz, L11 line, L12 magnifier)
// =====================================================================
const paperG = new THREE.Group(); scene.add(paperG);
let paperSheet, magG, magText, glowRing;
{
  const S = paperG;
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(46, 46), lam({ map: FX.woodTexture(), color: 0x8a6844 }));
  desk.rotation.x = -Math.PI / 2; desk.position.set(0, -0.06, 2); S.add(desk);
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(46, 16), lam({ map: tex(plaster(17, 38), 4, 1), color: 0xcbb28a }));
  backdrop.position.set(0, 6, -6.5); S.add(backdrop);

  const sheetDraw = (tinyLine) => (g, w, h) => {
    g.fillStyle = '#f8f3e4'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#c9bfa5'; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28);
    g.fillStyle = '#274b73'; g.font = 'bold 64px Arial'; g.textAlign = 'center';
    g.fillText('SUKHDA INSURANCE — POLICY', w / 2, 96);
    g.fillStyle = '#4a4436'; g.font = 'bold 40px Arial'; g.fillText('Cover Amount / रकम', w / 2, 168);
    if (!tinyLine) {
      g.fillStyle = '#8f887a';
      for (let i = 0; i < 9; i++) g.fillRect(70, 230 + i * 52, w - 140 - (i % 3) * 60, 13);
      // the printed truth: ₹7,00,000, marker-highlighted
      g.fillStyle = 'rgba(255,214,64,0.55)'; g.fillRect(184, 722, 512, 84);
      g.fillStyle = '#a33327'; g.font = 'bold 66px Arial'; g.fillText('₹7,00,000', w / 2, 786);
      g.fillStyle = '#8f887a';
      for (let i = 0; i < 4; i++) g.fillRect(70, 856 + i * 52, w - 140 - (i % 2) * 80, 13);
    } else {
      g.fillStyle = '#97907e';
      for (let i = 0; i < 17; i++) g.fillRect(70, 224 + i * 44, w - 140 - (i % 4) * 34, 9);
      // one tiny line, circled in red — the line nobody was allowed to read
      g.strokeStyle = '#c22f3d'; g.lineWidth = 7;
      g.beginPath(); g.ellipse(w / 2, 224 + 8 * 44 + 4, 300, 30, 0, 0, 7); g.stroke();
      g.fillStyle = '#3a3428'; g.font = 'bold 25px Arial';
      g.fillText('30 din me policy wapas — pura paisa', w / 2, 224 + 8 * 44 + 12);
    }
  };
  paperSheet = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 9.4),
    lam({ map: textBoard(880, 1150, sheetDraw(false)), side: THREE.DoubleSide }));
  paperSheet.rotation.x = -Math.PI / 2; paperSheet.rotation.z = 0.03; paperSheet.position.set(0, 0.02, 0);
  S.add(paperSheet);
  paperSheet.userData.texA = paperSheet.material.map;
  paperSheet.userData.texB = textBoard(880, 1150, sheetDraw(true));

  // pen resting on the sheet
  const penG = new THREE.Group(); penG.position.set(2.2, 0.1, 1.8); penG.rotation.y = 0.7; S.add(penG);
  const penBody = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.5, 8), lam({ color: 0x20509e }));
  penBody.rotation.z = Math.PI / 2; penG.add(penBody);
  const penTip = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.3, 8), lam({ color: 0xd9a845, emissive: 0x4a3408 }));
  penTip.rotation.z = -Math.PI / 2; penTip.position.x = 0.9; penG.add(penTip);

  // pulsing glow ring over the tiny line (s23)
  glowRing = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.0, 40),
    bas({ color: 0xffd76a, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false }));
  glowRing.rotation.x = -Math.PI / 2; glowRing.position.set(0, 0.06, -0.35); S.add(glowRing);

  // magnifier (s25): gold ring + glass + handle, with the magnified line under it
  magText = (() => {
    const t = textBoard(1024, 176, (g, w, h) => {
      g.fillStyle = '#f8f3e4'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#2b2118'; g.font = 'bold 84px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('30 DIN KE ANDAR', w / 2, h / 2 - 28);
      g.font = 'bold 62px Arial'; g.fillStyle = '#a33327';
      g.fillText('POLICY WAPAS = PURA PAISA', w / 2, h / 2 + 52);
    });
    const m = boardMesh(2.3, 0.4, t); m.rotation.x = -Math.PI / 2; m.position.set(0.3, 0.045, 0.55); S.add(m); return m;
  })();
  magG = new THREE.Group(); S.add(magG);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.09, 10, 36), lam({ color: 0xd9a845, emissive: 0x4a3408 }));
  ring.rotation.x = Math.PI / 2; magG.add(ring);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(1.04, 36), bas({ color: 0xcfe6ff, transparent: true, opacity: 0.16, depthWrite: false }));
  lens.rotation.x = -Math.PI / 2; lens.position.y = 0.01; magG.add(lens);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.7, 8), lam({ color: 0x5d3f24 }));
  handle.position.set(0.95, -0.12, 0.95); handle.rotation.set(0.5, 0, 0.85); magG.add(handle);
  magG.position.set(3.6, 0.38, 0.55); magG.rotation.z = -0.06;
}

// =====================================================================
// HOME SET — sapno ka ghar (L8): sofa, lamp, sunset window, family
// =====================================================================
const homeG = new THREE.Group(); scene.add(homeG);
let dreamG;
{
  const S = homeG;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), lam({ map: tex(planks(23), 5, 5), color: 0xd8b58e }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 4); S.add(floor);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(2.5, 28), lam({ map: tex(weave(21, [168, 44, 62]), 2, 2) }));
  rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.012, 1.4); S.add(rug);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 8), lam({ map: tex(plaster(29, 36), 4, 1), color: 0xf0d3a0 }));
  wall.position.set(0, 4, WALL_Z); S.add(wall);
  for (const s of [-1, 1]) {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(20, 8), lam({ map: tex(plaster(31, 36), 3, 1), color: 0xe4c491 }));
    sw.position.set(s * 7.4, 4, 3); sw.rotation.y = -s * Math.PI / 2; S.add(sw);
  }
  // sofa (gulabi-pink)
  const sofaM = lam({ color: 0xc75b7c }), sofaD = lam({ color: 0xa8435f });
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.72, 1.35), sofaM); base.position.set(0, 0.5, -1.15); S.add(base);
  const back = new THREE.Mesh(new THREE.BoxGeometry(3.7, 1.6, 0.34), sofaD); back.position.set(0, 1.45, -1.78); S.add(back);
  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.62, 1.35), sofaD); arm.position.set(s * 1.86, 1.05, -1.15); S.add(arm);
    const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.2, 1.1), lam({ color: 0xd9758f })); cushion.position.set(s * 0.6, 0.93, -1.1); S.add(cushion);
  }
  const cushionC = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.2, 1.1), lam({ color: 0xd9758f })); cushionC.position.set(0, 0.93, -1.1); S.add(cushionC);
  // lamp (left) with warm glow
  const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.3, 8), lam({ color: 0x5d3f24 }));
  lampPole.position.set(-3.3, 1.15, -1.7); S.add(lampPole);
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.08, 12), lam({ color: 0x5d3f24 }));
  lampBase.position.set(-3.3, 0.04, -1.7); S.add(lampBase);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.56, 0.62, 12, 1, true),
    lam({ color: 0xffd9a0, emissive: 0xa86a1e, side: THREE.DoubleSide }));
  shade.position.set(-3.3, 2.5, -1.7); S.add(shade);
  const lampLight = new THREE.PointLight(0xffbe78, 14, 13, 1.7); lampLight.position.set(-3.3, 2.4, -1.2); S.add(lampLight);
  // sunset window (right)
  const winG = new THREE.Group(); winG.position.set(3.0, 2.8, WALL_Z + 0.06); S.add(winG);
  winG.add(new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.8, 0.1), lam({ color: 0x6d4a2e })));
  const sglass = new THREE.Mesh(new THREE.PlaneGeometry(1.86, 2.46), FX.glassMat(0xff9a5c, 0.95)); sglass.position.z = 0.06; winG.add(sglass);
  const sbV = new THREE.Mesh(new THREE.BoxGeometry(0.07, 2.46, 0.04), lam({ color: 0x6d4a2e })); sbV.position.z = 0.09; winG.add(sbV);
  const sbH = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.07, 0.04), lam({ color: 0x6d4a2e })); sbH.position.z = 0.09; winG.add(sbH);
  const sgl = FX.glint(1.1); sgl.position.set(0.35, 0.6, 0.12); winG.add(sgl);
  // photo frame: sapno ka ghar drawing (left wall)
  const photoTex = textBoard(512, 400, (g, w, h) => {
    g.fillStyle = '#fdf6df'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffd76a'; g.beginPath(); g.arc(90, 84, 38, 0, 7); g.fill();
    g.fillStyle = '#f2e3ba'; g.fillRect(150, 170, 220, 140);
    g.fillStyle = '#a33327'; g.beginPath(); g.moveTo(130, 172); g.lineTo(260, 84); g.lineTo(390, 172); g.closePath(); g.fill();
    g.fillStyle = '#6d4a2e'; g.fillRect(232, 236, 56, 74);
    g.fillStyle = '#7fb069'; g.fillRect(0, 310, w, 90);
    g.fillStyle = '#274b73'; g.font = 'bold 40px Arial'; g.textAlign = 'center'; g.fillText('SAPNO KA GHAR', w / 2, 366);
  });
  const phFrame = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 0.05), lam({ color: 0x6d4a2e }));
  phFrame.position.set(-2.7, 3.1, WALL_Z + 0.02); S.add(phFrame);
  const photo = boardMesh(1.36, 1.06, photoTex); photo.position.set(-2.7, 3.1, WALL_Z + 0.06); S.add(photo);
  // plant (right corner)
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.25, 0.48, 10), lam({ color: 0xa3542e }));
  pot.position.set(4.4, 0.24, -1.9); S.add(pot);
  const leafM = lam({ color: 0x3f7a3a });
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.0 + (i % 3) * 0.22, 6), leafM);
    const a = i / 5 * Math.PI * 2;
    leaf.position.set(4.4 + Math.cos(a) * 0.16, 0.95 + (i % 3) * 0.15, -1.9 + Math.sin(a) * 0.16);
    leaf.rotation.set(Math.sin(a) * 0.35, 0, Math.cos(a) * 0.35); S.add(leaf);
  }
  // golden dream board (pops in s16)
  dreamG = new THREE.Group(); S.add(dreamG);
  const dreamTex = textBoard(1024, 300, (g, w, h) => {
    g.fillStyle = '#8a6414'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#d9a41c'; g.fillRect(12, 12, w - 24, h - 24);
    g.strokeStyle = '#fff3c4'; g.lineWidth = 8; g.strokeRect(26, 26, w - 52, h - 52);
    g.fillStyle = '#ffffff'; g.textAlign = 'center';
    g.font = 'bold 108px Arial'; g.fillText('EK CRORE KA', w / 2, 138);
    g.font = 'bold 108px Arial'; g.fillText('FUTURE', w / 2, 252);
  });
  const dreamBoard = boardMesh(3.6, 1.05, dreamTex, true); dreamBoard.position.set(0, 3.85, -2.6); dreamG.add(dreamBoard);
  dreamG.userData.board = dreamBoard;
  for (const [sx, sy] of [[-2.2, 4.3], [2.3, 4.45], [0.4, 4.7]]) {
    const sp = FX.glint(0.8); sp.position.set(sx, sy, -2.4); dreamG.add(sp);
  }
}

// =====================================================================
// TIME SET — calendar pages flip, clock hands spin (L9)
// =====================================================================
const timeG = new THREE.Group(); scene.add(timeG);
let calPages = [], hourHand, minHand;
{
  const S = timeG;
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(26, 10), lam({ map: tex(plaster(37, 34), 4, 1), color: 0xd8bd92 }));
  wall.position.set(0, 4, -3.0); S.add(wall);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 20), lam({ map: tex(planks(41), 5, 5), color: 0xb08c5e }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 3); S.add(floor);
  // big calendar (left)
  const calG = new THREE.Group(); calG.position.set(-1.25, 0, -2.9); S.add(calG);
  const calBack = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.9, 0.08), lam({ color: 0x7a2c22 }));
  calBack.position.set(0, 2.6, -0.05); calG.add(calBack);
  const years = ['2016', '2018', '2020', '2022', '2024', '2026'];
  years.forEach((yr, i) => {
    const t = textBoard(440, 560, (g, w, h) => {
      g.fillStyle = '#f7f1e2'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#a33327'; g.fillRect(0, 0, w, 118);
      g.fillStyle = '#ffffff'; g.font = 'bold 74px Arial'; g.textAlign = 'center'; g.fillText(yr, w / 2, 84);
      g.fillStyle = '#5a5344';
      for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) { g.beginPath(); g.arc(52 + c * 56, 168 + r * 60, 11, 0, 7); g.fill(); }
      g.fillStyle = '#274b73'; g.font = 'bold 30px Arial'; g.fillText('SAAL', w / 2, h - 22);
    });
    const geo = new THREE.PlaneGeometry(1.84, 2.34); geo.translate(0, -1.17, 0); // pivot at top edge
    const page = new THREE.Mesh(geo, lam({ map: t, side: THREE.DoubleSide }));
    page.position.set(0, 3.95, 0.02 + (years.length - i) * 0.012);
    calG.add(page); calPages.push(page);
  });
  // big clock (right) with live hands
  const clockG = new THREE.Group(); clockG.position.set(1.6, 2.8, -2.9); S.add(clockG);
  const faceTex = textBoard(512, 512, (g, w, h) => {
    g.fillStyle = '#f7f1e2'; g.beginPath(); g.arc(256, 256, 246, 0, 7); g.fill();
    g.fillStyle = '#3a2c1c'; g.font = 'bold 54px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let n = 1; n <= 12; n++) { const a = n / 12 * Math.PI * 2 - Math.PI / 2; g.fillText(String(n), 256 + Math.cos(a) * 188, 256 + Math.sin(a) * 188); }
  });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.09, 10, 40), lam({ color: 0x3a2c1c }));
  clockG.add(rim);
  const face = new THREE.Mesh(new THREE.CircleGeometry(1.18, 40), lam({ map: faceTex })); face.position.z = 0.01; clockG.add(face);
  const handM = lam({ color: 0x2b2118 });
  const mkHand = (w2, len) => {
    const geo = new THREE.BoxGeometry(w2, len, 0.03); geo.translate(0, len / 2 - 0.08, 0);
    const m = new THREE.Mesh(geo, handM); m.position.z = 0.05; clockG.add(m); return m;
  };
  hourHand = mkHand(0.11, 0.62); minHand = mkHand(0.08, 0.95);
  const pin = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), lam({ color: 0xa33327 })); pin.position.z = 0.07; clockG.add(pin);
}

// =====================================================================
// COMPLAINT SET — letters rain + 26,667 board (L13-L14)
// =====================================================================
const compG = new THREE.Group(); scene.add(compG);
let letters = [], bigBoard;
{
  const S = compG;
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(34, 14), lam({ color: 0x331016 }));
  backdrop.position.set(0, 4.5, -4.2); S.add(backdrop);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(34, 22), lam({ color: 0x241014 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 3); S.add(floor);
  const glow = new THREE.PointLight(0xff8a6b, 10, 20, 1.6); glow.position.set(0, 3.4, 1.5); S.add(glow);
  const envTex = textBoard(256, 176, (g, w, h) => {
    g.fillStyle = '#f5efe0'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#c22f3d'; g.lineWidth = 10; g.strokeRect(6, 6, w - 12, h - 12);
    g.strokeStyle = '#8f887a'; g.lineWidth = 6;
    g.beginPath(); g.moveTo(10, 12); g.lineTo(w / 2, h * 0.62); g.lineTo(w - 10, 12); g.stroke();
    g.fillStyle = '#c22f3d'; g.font = 'bold 30px Arial'; g.textAlign = 'center'; g.fillText('SHIKAYAT', w / 2, h - 26);
  });
  const envGeo = new THREE.PlaneGeometry(0.66, 0.46);
  const envM = lam({ map: envTex, side: THREE.DoubleSide });
  let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 26; i++) {
    const m = new THREE.Mesh(envGeo, envM);
    m.userData = { x: -4.6 + rnd() * 9.2, z: -2.6 + rnd() * 4.2, off: rnd() * 8, sp: 0.028 + rnd() * 0.03, rs: (rnd() - 0.5) * 0.05, ph: rnd() * 6.28 };
    S.add(m); letters.push(m);
  }
  const boardTex = textBoard(1024, 512, (g, w, h) => {
    g.fillStyle = '#7e1f24'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#a33327'; g.fillRect(14, 14, w - 28, h - 28);
    g.strokeStyle = '#ffd76a'; g.lineWidth = 9; g.strokeRect(30, 30, w - 60, h - 60);
    g.textAlign = 'center';
    g.fillStyle = '#ffd76a'; g.font = 'bold 215px Arial'; g.fillText('26,667', w / 2, 268);
    g.fillStyle = '#ffffff'; g.font = 'bold 104px Arial'; g.fillText('SHIKAYATEIN', w / 2, 418);
  });
  bigBoard = boardMesh(5.9, 2.95, boardTex, true); bigBoard.position.set(0, 2.4, -3.0); S.add(bigBoard);
}

// =====================================================================
// MIRROR SET — golden frame, agent inside (L15)
// =====================================================================
const mirrorG = new THREE.Group(); scene.add(mirrorG);
{
  const S = mirrorG;
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(26, 10), lam({ map: tex(plaster(43, 38), 4, 1), color: 0xe2c491 }));
  wall.position.set(0, 4, -3.2); S.add(wall);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 20), lam({ map: tex(planks(47), 5, 5) }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 3); S.add(floor);
  // mirror glass: pale gradient + sheen streak
  const glassTex = textBoard(512, 720, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#cfdde8'); gr.addColorStop(0.5, '#aebfcc'); gr.addColorStop(1, '#93a9ba');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.35)';
    g.beginPath(); g.moveTo(120, 0); g.lineTo(300, 0); g.lineTo(180, h); g.lineTo(40, h); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.18)';
    g.beginPath(); g.moveTo(330, 0); g.lineTo(400, 0); g.lineTo(300, h); g.lineTo(240, h); g.closePath(); g.fill();
  });
  const glass = boardMesh(2.95, 4.15, glassTex); glass.position.set(0, 2.52, -3.1); S.add(glass);
  // golden frame: 4 rails + inner bevel
  const goldM = lam({ color: 0xc9930a, emissive: 0x4a3408 });
  const railT = new THREE.Mesh(new THREE.BoxGeometry(3.45, 0.3, 0.14), goldM); railT.position.set(0, 4.72, -3.04); S.add(railT);
  const railB = railT.clone(); railB.position.y = 0.32; S.add(railB);
  const railL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.7, 0.14), goldM); railL.position.set(-1.72, 2.52, -3.04); S.add(railL);
  const railR = railL.clone(); railR.position.x = 1.72; S.add(railR);
  // side shelves with books (mirror-room dressing)
  for (const s of [-1, 1]) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.07, 0.4), lam({ color: 0x6d4a2e }));
    shelf.position.set(s * 2.9, 1.7, -3.0); S.add(shelf);
    [0xb03a2e, 0x2e5da8, 0xd9a441, 0x3f7a4a].forEach((c, i) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.62, 0.3), lam({ color: c }));
      b.position.set(s * 2.9 - 0.42 + i * 0.27, 2.05, -3.0); S.add(b);
    });
  }
}

// =====================================================================
// CHARACTER CARDS (kit painters)
// =====================================================================
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
    this.blob.position.set(x, Math.max(0.02, y + 0.03), z); this.blob.scale.setScalar(s);
  }
  hide() { this.mesh.visible = this.blob.visible = false; }
}
const agentCard = new Card(), custCard = new Card(), buddhaCard = new Card(),
  patniCard = new Card(), betiCard = new Card(), backCard = new Card();
const ALL_CARDS = [agentCard, custCard, buddhaCard, patniCard, betiCard, backCard];
const AGENT_OUTFIT = { tunic: '#2e5da8', skin: '#f5c9a0', hair: '#241a14' };
const CUST_OUTFIT = { tunic: '#c96a2c', skin: '#c99067', hair: '#1e1714', stout: true };
const BUDDHA_OUTFIT = { tunic: '#b98a5e', skin: '#c99067', hair: '#e9e5db', moustache: '#f4f1ea', brows: '#f4f1ea', stout: true };
const PATNI_OUTFIT = { tunic: '#c94f72', dress: '#d6336c', skin: '#f5c9a0', hair: '#1e1714' };
const BETI_OUTFIT = { tunic: '#e8c33a', skin: '#f5c9a0', hair: '#1e1714' };

// ---------- word caption (screen-space plane, MTT style) ----------
const capCanvas = document.createElement('canvas'); capCanvas.width = 1024; capCanvas.height = 256;
const capTex = new THREE.CanvasTexture(capCanvas); capTex.colorSpace = THREE.SRGBColorSpace;
const capPlane = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), new THREE.MeshBasicMaterial({ map: capTex, transparent: true, depthTest: false, fog: false }));
capPlane.renderOrder = 20; scene.add(capPlane);
let capKey = '';
function drawCaption(word) {
  if (word === capKey) return; capKey = word;
  const g = capCanvas.getContext('2d');
  g.clearRect(0, 0, 1024, 256);
  if (word) {
    g.font = 'bold 138px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    let fs = 138;
    while (g.measureText(word).width > 950 && fs > 60) { fs -= 8; g.font = `bold ${fs}px Arial`; }
    g.lineWidth = 26; g.strokeStyle = '#14100c'; g.lineJoin = 'round';
    g.strokeText(word, 512, 132); g.fillStyle = '#ffffff'; g.fillText(word, 512, 132);
  }
  capTex.needsUpdate = true;
}

// ---------- environments ----------
scene.fog = new THREE.Fog(0xe9cfa3, 20, 55);
const ENVS = {
  office: { bg: 0xe9cfa3, hemi: 0.9, sun: 1.7 },
  aged: { bg: 0xe3c298, hemi: 0.78, sun: 1.4 },
  paper: { bg: 0xd9b98a, hemi: 1.0, sun: 1.5 },
  paperDark: { bg: 0x77643f, hemi: 0.5, sun: 0.7 },
  home: { bg: 0xf6d9a8, hemi: 1.0, sun: 1.55 },
  time: { bg: 0xdcc09a, hemi: 0.85, sun: 1.3 },
  complaint: { bg: 0x2a0f12, hemi: 0.5, sun: 0.35 },
  mirror: { bg: 0xe9cfa3, hemi: 0.95, sun: 1.6 },
  dark: { bg: 0x14101c, hemi: 0.12, sun: 0.05 },
};
const _bgCol = new THREE.Color();
function applyEnv(name) {
  const e = ENVS[name];
  _bgCol.setHex(e.bg); scene.background = _bgCol;
  scene.fog.color.copy(_bgCol);
  hemi.intensity = e.hemi; sun.intensity = e.sun;
}

// ---------- per-frame ----------
const _v = new THREE.Vector3();
window.renderFrame = (f) => {
  const shot = shotAt(f), u = shot.u, id = shot.id;
  const cam = camFor(shot, u);
  camera.position.set(...cam.pos); camera.up.set(0, 1, 0); camera.lookAt(...cam.look);
  if (cam.roll) camera.rotateZ(THREE.MathUtils.degToRad(cam.roll));
  camera.fov = cam.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  sun.target.position.set(0, 1, 0);

  // ---- set + env selection ----
  const set = shot.set;
  officeG.visible = set === 'office' || set === 'dark';
  paperG.visible = set === 'paper';
  homeG.visible = set === 'home';
  timeG.visible = set === 'time';
  compG.visible = set === 'complaint';
  mirrorG.visible = set === 'mirror';
  const agedOffice = ['s19', 's20', 's21', 's22', 's24', 's26'].includes(id);
  applyEnv(set === 'office' ? (agedOffice ? 'aged' : 'office')
    : set === 'paper' ? (id === 's23' ? 'paperDark' : 'paper') : set);
  // dark tease shots: kill the office lamp, keep only the door glow
  if (!window.__pl) {
    window.__pl = [];
    officeG.traverse((o) => { if (o.isPointLight) window.__pl.push({ l: o, i: o.intensity, door: false }); });
    doorG.traverse((o) => { if (o.isPointLight) window.__pl.forEach((p) => { if (p.l === o) p.door = true; }); });
  }
  window.__pl.forEach((p) => { p.l.intensity = (set === 'dark' && !p.door) ? p.i * 0.12 : p.i; });

  // ---- defaults: everything extra hidden ----
  coinsG.visible = moneyG.visible = paperSlip.visible = false;
  qBoardA.visible = qBoardB.visible = freeG.visible = doorG.visible = false;
  boardCrore.visible = boardLakh.visible = true;
  magG.visible = magText.visible = glowRing.visible = dreamG.visible = false;
  paperSheet.position.x = 0;
  ALL_CARDS.forEach((c) => c.hide());

  const show = (card, outfit, seed, x, y, z, s, expr, R = 'hang', L = 'hang') => {
    const idl = idle(f, seed), blink = blinkAt(f, seed);
    const key = `${seed}|${expr}|${R}|${L}|${blink}|${q(idl.bob, 2)}|${Math.round(idl.tilt)}`;
    card.draw(key, (p) => T.romanFront(p, outfit, {
      seed, expr, R, L, blink, bob: q(idl.bob, 2), tilt: Math.round(idl.tilt),
      headTilt: Math.round(idle(f, seed + 2).headTilt), wv: f * 0.18,
    }));
    card.place(x, y, z, cam.pos, s);
  };
  const AG = (expr, R, L) => show(agentCard, AGENT_OUTFIT, 5, 0, 0.12, -1.55, 1.0, expr, R, L);
  const CU = (expr, R, L) => show(custCard, CUST_OUTFIT, 9, 1.7, -0.18, 2.7, 0.95, expr, R, L);

  switch (id) {
    // ---- L1 hook ----
    case 's01': AG('grin', 'point', 'hang'); CU('neutral'); break;
    case 's02': AG('grin', 'point', 'hang'); break;
    // ---- L2 niyam: coins ----
    case 's03': coinsG.visible = true; boardCrore.visible = boardLakh.visible = false; break;
    case 's04': AG('grin', 'up', 'hip'); CU('neutral'); break;
    // ---- L3 aadmi ----
    case 's05': {
      AG('neutral', 'point', 'hang');
      backCard.draw('back', (p) => {
        p.ell(300, 330, 148, 168, '#1e1714', 10);
        p.poly([[258, 440], [342, 440], [356, 560], [244, 560]], '#c99067', 0);
        p.poly([[110, 1000], [168, 545], [432, 545], [490, 1000]], '#c96a2c', 12);
      });
      backCard.place(2.7, 0.05, 5.2, cam.pos, 1.12);
      break;
    }
    case 's06': show(custCard, CUST_OUTFIT, 9, 1.7, -0.1, 2.7, 1.06, u < 0.5 ? 'neutral' : 'nervous'); break;
    // ---- L4 crore ----
    case 's07': AG('grin', 'point', 'hip'); CU('neutral'); break;
    case 's08': coinsG.visible = true; boardCrore.visible = boardLakh.visible = false; break;
    // ---- L5 lakh ----
    case 's09': AG(u < 0.7 ? 'grin' : 'laugh', 'up', 'hip'); CU('nervous'); break;
    case 's10': show(custCard, CUST_OUTFIT, 9, 1.7, -0.08, 2.7, 1.12, 'shock'); AG('laugh', 'up', 'hip'); break;
    // ---- L6 kaunsi ----
    case 's11': AG('grin', 'up', 'up'); CU('nervous'); break;
    case 's12': {
      boardCrore.visible = boardLakh.visible = false;
      paperSlip.visible = true;
      paperSlip.position.x = 0.95 + (0.1 - 0.95) * M.smooth(u);
      AG('grin', 'reach', 'hang'); CU('nervous');
      break;
    }
    // ---- L7 kagaz ----
    case 's13':
      paperSheet.material.map = paperSheet.userData.texA; paperSheet.material.needsUpdate = true;
      break;
    case 's14': {
      paperSheet.material.map = paperSheet.userData.texA; paperSheet.material.needsUpdate = true;
      paperSheet.position.x = -2.3 * M.smooth(Math.max(0, Math.min(1, (u - 0.35) / 0.5)));
      show(custCard, CUST_OUTFIT, 9, 2.75, -0.55, 2.1, 1.05, 'nervous', 'reach', 'hang');
      show(agentCard, AGENT_OUTFIT, 5, -2.85, -0.55, 1.5, 1.05, 'stern', 'hang', 'reach');
      break;
    }
    // ---- L8 sapna ----
    case 's15':
      show(custCard, CUST_OUTFIT, 9, -0.95, 0, 0.2, 1.0, 'smile');
      show(patniCard, PATNI_OUTFIT, 21, 0.95, 0, 0.2, 1.0, 'smile');
      show(betiCard, BETI_OUTFIT, 31, 0.15, -0.02, 1.25, 0.55, 'smile');
      break;
    case 's16': {
      dreamG.visible = true;
      dreamG.userData.board.scale.setScalar(Math.max(0.01, M.back(Math.min(1, u / 0.45))));
      show(custCard, CUST_OUTFIT, 9, -0.95, 0, 0.2, 1.0, 'grin', 'up', 'hang');
      show(patniCard, PATNI_OUTFIT, 21, 0.95, 0, 0.2, 1.0, 'grin');
      show(betiCard, BETI_OUTFIT, 31, 0.15, -0.02, 1.25, 0.55, 'grin', 'wave', 'hang');
      break;
    }
    case 's17':
      dreamG.visible = true; dreamG.userData.board.scale.setScalar(1);
      show(betiCard, BETI_OUTFIT, 31, 0.45, 0, 0.35, 0.85, 'grin');
      show(patniCard, PATNI_OUTFIT, 21, 1.5, 0, -0.3, 0.95, 'smile');
      show(custCard, CUST_OUTFIT, 9, -1.55, 0, -0.3, 0.95, 'smile');
      break;
    // ---- L9 dus saal baad ----
    case 's18': {
      calPages.forEach((page, i) => {
        if (i >= calPages.length - 1) { page.rotation.x = 0; return; }
        const p = Math.max(0, Math.min(1, (f - (shot.a + 4 + i * 9)) / 11));
        page.rotation.x = -1.88 * M.easeInOut(p);
      });
      minHand.rotation.z = -f * 0.5; hourHand.rotation.z = -f * 0.11;
      break;
    }
    case 's19': {
      const bp = kf3([[shot.a, [3.1, 0, 2.2]], [shot.b, [2.5, 0, 1.9]]], f);
      show(buddhaCard, BUDDHA_OUTFIT, 41, bp[0], bp[1], bp[2], 1.0, 'stern');
      AG('nervous', 'hang', 'hang');
      break;
    }
    // ---- L10 agent ka jhootha jawab ----
    case 's20': moneyG.visible = true; boardCrore.visible = boardLakh.visible = false; break;
    case 's21':
      moneyG.visible = true;
      show(buddhaCard, BUDDHA_OUTFIT, 41, 1.95, 0, 1.65, 1.0, 'stern', 'point', 'hang');
      AG('nervous', 'hang', 'hip');
      break;
    case 's22': AG('grin', 'thumb', 'hip'); break;
    // ---- L11 ek line ----
    case 's23':
      paperSheet.material.map = paperSheet.userData.texB; paperSheet.material.needsUpdate = true;
      glowRing.visible = true;
      glowRing.position.set(0, 0.06, 0.02);
      glowRing.scale.setScalar(1 + 0.13 * Math.sin(f * 0.3));
      glowRing.material.opacity = 0.6 + 0.3 * Math.sin(f * 0.3);
      break;
    case 's24': AG('nervous', 'temple', 'hang'); break;
    // ---- L12 free-look ----
    case 's25': {
      paperSheet.material.map = paperSheet.userData.texB; paperSheet.material.needsUpdate = true;
      const t = M.easeOut(Math.min(1, u / 0.35));
      magG.visible = true; magText.visible = true;
      magText.position.set(0.15, 0.045, 0.1);
      magG.position.set(3.6 + (0.15 - 3.6) * t, 0.38, 0.55 + (0.1 - 0.55) * t);
      break;
    }
    case 's26': {
      freeG.visible = true;
      freeG.userData.board.scale.setScalar(0.2 + 0.8 * M.back(Math.min(1, u / 0.4)));
      show(agentCard, AGENT_OUTFIT, 5, -2.3, 0.12, -0.6, 0.95, 'shock', 'up', 'up');
      show(buddhaCard, BUDDHA_OUTFIT, 41, 2.3, 0, -0.5, 0.95, 'relief');
      break;
    }
    // ---- L13-L14 shikayatein ----
    case 's27': case 's28': case 's29': case 's30': {
      const count = id === 's27' ? 12 : id === 's30' ? 15 : 26;
      letters.forEach((m, i) => {
        if (i >= count) { m.visible = false; return; }
        m.visible = true;
        const d = m.userData;
        const y = 6.9 - ((f * d.sp + d.off) % 8.4);
        m.position.set(d.x + Math.sin(f * 0.045 + d.ph) * 0.25, y, d.z);
        m.rotation.set(Math.sin(f * 0.07 + d.ph) * 0.35, d.ph, Math.sin(f * 0.05 + d.ph * 2) * 0.4);
      });
      if (id === 's29' || id === 's30') {
        bigBoard.visible = true;
        bigBoard.scale.setScalar(id === 's29' ? 0.55 + 0.45 * M.back(Math.min(1, u / 0.5)) : 1);
      } else bigBoard.visible = false;
      break;
    }
    // ---- L15 mirror ----
    case 's31': show(agentCard, AGENT_OUTFIT, 5, 0, 0.55, -2.9, 1.1, 'smile'); break;
    case 's32': show(agentCard, AGENT_OUTFIT, 5, 0, 0.3, -2.9, 1.16, u < 0.4 ? 'smile' : 'grin', u < 0.4 ? 'hang' : 'point', 'hang'); break;
    // ---- L16 binary sawal ----
    case 's33': qBoardA.visible = true; boardCrore.visible = false; AG('grin', 'point', 'hip'); break;
    case 's34': qBoardB.visible = true; boardLakh.visible = false; AG('grin', 'point', 'hang'); break;
    // ---- L17 tease ----
    case 's35': case 's36': {
      doorG.visible = true;
      const pulse = id === 's35' ? 1 + 0.06 * Math.sin(f * 0.15) : 1.12 + 0.1 * Math.sin(f * 0.22);
      qMark.scale.setScalar(pulse);
      break;
    }
  }

  // caption: pinned in front of camera, lower third
  drawCaption(captionAt(f));
  _v.set(...cam.look).sub(camera.position).normalize();
  capPlane.position.copy(camera.position).addScaledVector(_v, 16);
  capPlane.position.y -= 4.35;
  capPlane.lookAt(camera.position);
  const visW = 2 * 16 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * (W / H);
  const cs = (visW * 0.96) / 8; capPlane.scale.set(cs, cs, 1);

  renderer.render(scene, camera);
  return true;
};
window.TOTAL = TOTAL;
window.ready = true;
