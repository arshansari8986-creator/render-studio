// "Adani Crash SAMPLE — Tum Gautam Adani ho" — Mirror kit + Gullak grammar.
// Real three.js sets (office / port / airport / bijli ghar) + kit toon card
// + scene-ke-andar boards/screens. NO CAPTIONS (user order).
// Har shot 1-2s, har shot alag disha+angle, camera kabhi static nahi (story.js CAMS).
// Contract (render.mjs): window.ready, window.renderFrame(f), canvas #c 1080x1920.
import * as THREE from 'three';
import * as FX from './fx.js';
import * as T from './toon.js';
import { idle, blinkAt, q, M, clamp } from './motion.js';
import { tex, planks, plaster, stone, weave } from './paint.js';
import { TOTAL, shotAt, camFor } from './story.js';

const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 300);
const lam = (o) => new THREE.MeshLambertMaterial(o);
const bas = (o) => new THREE.MeshBasicMaterial(o);

// ---------- global lights (per-set intensity in applyEnv) ----------
const hemi = new THREE.HemisphereLight(0xffe7c4, 0x5a4632, 0.95); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffd9a0, 1.8);
sun.position.set(-6, 6, 4.5); scene.add(sun); scene.add(sun.target);

// ---------- canvas-texture helper ----------
function textBoard(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
const boardMesh = (w, h, texB, basic = false) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic ? bas({ map: texB }) : lam({ map: texB }));
const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);

// =====================================================================
// SET 1 — ADANI KA OFFICE (garam sunehri roshni, khidki bahar bandar-gah)
// =====================================================================
const officeG = new THREE.Group(); scene.add(officeG);
const WALL_Z = -3.2;
let graphRedraw = null; // (mode, p) => void — bazaar screen
{
  const S = officeG;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), lam({ map: tex(planks(7), 5, 5), color: 0xcfa06a }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 4); S.add(floor);
  // back wall — khidki ke liye asal hole (x -1.4..2.2, y 1.2..4.0), 4 hisso me
  const wallM = lam({ map: tex(plaster(11, 38), 4, 1), color: 0xe8cf9e });
  const mkWall = (w2, h2, x, y) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w2, h2), wallM); m.position.set(x, y, WALL_Z); S.add(m); };
  mkWall(13.6, 7.5, -8.2, 3.75); mkWall(12.8, 7.5, 8.6, 3.75);
  mkWall(3.6, 1.2, 0.4, 0.6); mkWall(3.6, 3.5, 0.4, 5.75);
  for (const s of [-1, 1]) {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(20, 7.5), lam({ map: tex(plaster(13, 36), 3, 1), color: 0xdcc39c }));
    sw.position.set(s * 7.4, 3.75, 3); sw.rotation.y = -s * Math.PI / 2; S.add(sw);
  }
  const trimM = lam({ color: 0x6d4a2e });
  const skirt = box(30, 0.28, 0.06, trimM); skirt.position.set(0, 0.14, WALL_Z + 0.03); S.add(skirt);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.4), lam({ map: tex(weave(21), 2, 2), color: 0xb84a3a }));
  rug.rotation.x = -Math.PI / 2; rug.rotation.z = 0.03; rug.position.set(0.3, 0.012, 0.6); S.add(rug);

  // ---- khidki ke bahar: bandar-gah ka nazara (port view, z < WALL_Z) ----
  const pv = new THREE.Group(); S.add(pv);
  const skyTex = textBoard(512, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#8ec9e8'); gr.addColorStop(0.62, '#cfe8f2'); gr.addColorStop(0.78, '#f7d9a0'); gr.addColorStop(1, '#f7d9a0');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#5e9ec4'; g.fillRect(0, h * 0.78, w, h * 0.22);
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(420, 90, 34, 0, 7); g.fill();
  });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), bas({ map: skyTex }));
  sky.position.set(0.4, 3.4, -7.5); pv.add(sky);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(16, 3.4), lam({ color: 0x3f8fbf }));
  sea.rotation.x = -Math.PI / 2; sea.position.set(0.4, 0.55, -5.6); pv.add(sea);
  const quay = box(16, 0.55, 1.6, lam({ color: 0x9aa0a3 })); quay.position.set(0.4, 0.28, -4.35); pv.add(quay);
  const craneM = lam({ color: 0x274b5e });
  const mkCrane = (x, s) => {
    const cg = new THREE.Group(); cg.position.set(x, 0.55, -4.4); cg.scale.setScalar(s); pv.add(cg);
    for (const sx of [-0.8, 0.8]) { const leg = box(0.14, 2.6, 0.14, craneM); leg.position.set(sx, 1.3, 0); cg.add(leg); }
    const beam = box(2.6, 0.16, 0.16, craneM); beam.position.set(0.3, 2.6, 0); cg.add(beam);
    const boom = box(2.2, 0.12, 0.12, craneM); boom.position.set(1.4, 2.95, 0); boom.rotation.z = 0.5; cg.add(boom);
    const cab = box(0.34, 0.3, 0.3, lam({ color: 0xf5d76a })); cab.position.set(0.9, 2.38, 0); cg.add(cab);
  };
  mkCrane(-1.6, 1.0); mkCrane(2.6, 0.8);
  // jahaz (chhota, paani par)
  const shipG = new THREE.Group(); shipG.position.set(3.4, 0.62, -5.9); pv.add(shipG);
  const hull = box(1.9, 0.32, 0.5, lam({ color: 0x8e2f26 })); hull.position.y = 0.1; shipG.add(hull);
  const deck = box(1.5, 0.14, 0.4, lam({ color: 0x39434c })); deck.position.y = 0.33; shipG.add(deck);
  for (let i = 0; i < 3; i++) {
    const cb = box(0.4, 0.2, 0.34, lam({ color: [0x2e5da8, 0xd97b29, 0x3f7a4a][i] }));
    cb.position.set(-0.5 + i * 0.5, 0.5, 0); shipG.add(cb);
  }
  // khidki frame + saraakhen (view ke saamne)
  const winG = new THREE.Group(); winG.position.set(0.4, 2.6, WALL_Z + 0.06); S.add(winG);
  const frameM = lam({ color: 0x5d3f24 });
  for (const fy of [-1.4, 1.4]) { const fb = box(3.74, 0.15, 0.1, frameM); fb.position.y = fy; winG.add(fb); }
  for (const fx of [-1.8, 1.8]) { const fb = box(0.15, 2.95, 0.1, frameM); fb.position.x = fx; winG.add(fb); }
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 2.5), FX.glassMat(0xcfe8f2, 0.16)); glass.position.z = 0.06; winG.add(glass);
  const barV = box(0.07, 2.5, 0.04, lam({ color: 0x5d3f24 })); barV.position.z = 0.09; winG.add(barV);
  const barH = box(3.3, 0.07, 0.04, lam({ color: 0x5d3f24 })); barH.position.z = 0.09; winG.add(barH);
  const gl = FX.glint(0.35); gl.position.set(-0.9, 0.7, 0.12); winG.add(gl);

  // ---- badi screen (back-left) — bazaar graph, dynamic ----
  const scrFrame = box(2.5, 1.8, 0.09, lam({ color: 0x141a22 })); scrFrame.position.set(-2.75, 2.45, WALL_Z + 0.03); S.add(scrFrame);
  const graphCanvas = document.createElement('canvas'); graphCanvas.width = 512; graphCanvas.height = 384;
  const graphTex = new THREE.CanvasTexture(graphCanvas); graphTex.colorSpace = THREE.SRGBColorSpace;
  const drawGraph = (mode, p) => {
    const g = graphCanvas.getContext('2d'), w = 512, h = 384;
    g.fillStyle = '#0c1420'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#1d2c3f'; g.lineWidth = 2;
    for (let x = 0; x <= w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y <= h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.fillStyle = '#e8eef4'; g.font = 'bold 25px Arial'; g.textAlign = 'left';
    g.fillText('ADANI GROUP — SHARE BAZAAR', 18, 36);
    // line path: x 20..492; calm = halki chadhai; crash = 45% tak chadhai, phir tez girawat
    const yAt = (t) => 250 - 130 * t;
    const yCrash = (t) => t <= 0.45 ? 250 - 182 * t : 168 + (t - 0.45) / 0.55 * 195;
    g.lineWidth = 6; g.lineJoin = 'round'; g.beginPath();
    const N = 60, upto = Math.max(2, Math.floor(N * p));
    for (let i = 0; i <= upto; i++) {
      const t = i / N, x = 20 + t * 472, y = mode === 'crash' ? yCrash(t) : yAt(t);
      if (mode === 'crash' && t > 0.45) { /* rang neeche badlega */ }
      i === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.strokeStyle = '#57d977'; g.stroke();
    if (mode === 'crash') {
      g.beginPath();
      for (let i = Math.floor(N * 0.45); i <= upto; i++) {
        const t = i / N, x = 20 + t * 472, y = yCrash(t);
        i === Math.floor(N * 0.45) ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.strokeStyle = '#ff5347'; g.stroke();
      if (p > 0.72) {
        g.fillStyle = '#ff5347'; g.font = 'bold 74px Arial'; g.textAlign = 'right';
        g.fillText('-20%', w - 22, 110);
        g.font = 'bold 26px Arial'; g.fillText('LOWER CIRCUIT', w - 22, 148);
      }
    } else {
      g.fillStyle = '#57d977'; g.font = 'bold 34px Arial'; g.textAlign = 'right';
      g.fillText('▲ SAB BADHIYA', w - 20, 84);
    }
    graphTex.needsUpdate = true;
  };
  // ---- naye screen modes (FULL build): wealth / circuits / rank / low / back ----
  const drawBoard2 = (mode, p) => {
    const g = graphCanvas.getContext('2d'), w = 512, h = 384;
    g.fillStyle = '#0c1420'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#1d2c3f'; g.lineWidth = 2;
    for (let x = 0; x <= w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y <= h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.textAlign = 'center';
    if (mode === 'wealth') {
      g.fillStyle = '#e8eef4'; g.font = 'bold 25px Arial';
      g.fillText('SHAAM 6 BAJE — DAULAT', w / 2, 52);
      g.fillStyle = '#ff5347'; g.font = 'bold 62px Arial';
      g.fillText('-22 BILLION', w / 2, 148);
      g.fillText('DOLLAR', w / 2, 216);
      g.fillStyle = '#f5d76a'; g.font = 'bold 40px Arial';
      g.fillText('≈ ₹2,00,000 CRORE', w / 2, 292);
      g.fillStyle = '#e8eef4'; g.font = 'bold 27px Arial';
      g.fillText('— EK DIN ME GAYAB —', w / 2, 340);
    } else if (mode === 'circuits') {
      g.fillStyle = '#e8eef4'; g.font = 'bold 25px Arial';
      g.fillText('TEEN COMPANIYAN BAND', w / 2, 48);
      const rows = [['ADANI ENTERPRISES', 96], ['ADANI GREEN ENERGY', 188], ['ADANI TOTAL GAS', 280]];
      rows.forEach(([nm, y], i) => {
        g.fillStyle = '#141f2e'; g.fillRect(22, y, w - 44, 76);
        g.fillStyle = '#e8eef4'; g.font = 'bold 27px Arial'; g.textAlign = 'left';
        g.fillText(nm, 40, y + 34);
        if (p > 0.2 + i * 0.26) {
          g.fillStyle = '#d21f14'; g.fillRect(40, y + 44, 218, 26);
          g.fillStyle = '#ffffff'; g.font = 'bold 19px Arial';
          g.fillText('▼ LOWER CIRCUIT', 50, y + 64);
        }
        g.textAlign = 'center';
      });
    } else if (mode === 'rank') {
      g.fillStyle = '#e8eef4'; g.font = 'bold 25px Arial';
      g.fillText('DUNIYA KE SABSE AMEER', w / 2, 50);
      if (p < 0.45) {
        g.fillStyle = '#57d977'; g.font = 'bold 130px Arial';
        g.fillText('#3', w / 2, 205);
      } else {
        g.fillStyle = '#8a8f98'; g.font = 'bold 64px Arial';
        g.fillText('#3', w / 2 - 118, 168);
        g.fillStyle = '#ff5347'; g.font = 'bold 84px Arial';
        g.fillText('→', w / 2, 172);
        g.font = 'bold 130px Arial';
        g.fillText('#7', w / 2 + 118, 205);
      }
      if (p > 0.3) {
        g.fillStyle = '#f5d76a'; g.font = 'bold 36px Arial';
        g.fillText('48 BILLION DOLLAR', w / 2, 292);
        g.fillStyle = '#e8eef4'; g.font = 'bold 26px Arial';
        g.fillText('— 2 DIN ME SAAF —', w / 2, 332);
      }
    } else if (mode === 'low') {
      g.fillStyle = '#e8eef4'; g.font = 'bold 25px Arial';
      g.fillText('EK MAHINA BAAD', w / 2, 50);
      g.strokeStyle = '#ff5347'; g.lineWidth = 6; g.beginPath();
      g.moveTo(30, 130); g.lineTo(200, 268); g.lineTo(482, 282); g.stroke();
      g.fillStyle = '#ff5347'; g.font = 'bold 120px Arial';
      g.fillText('#25', w / 2 + 88, 190);
      g.fillStyle = '#e8eef4'; g.font = 'bold 28px Arial';
      g.fillText('DAULAT AADHI SE BHI KAM', w / 2, 338);
    } else if (mode === 'back') {
      g.fillStyle = '#e8eef4'; g.font = 'bold 25px Arial';
      g.fillText('AAJ — SABSE UPAR PHIR', w / 2, 50);
      g.strokeStyle = '#57d977'; g.lineWidth = 7; g.beginPath();
      g.moveTo(30, 300); g.lineTo(220, 235); g.lineTo(482, 105); g.stroke();
      g.fillStyle = '#57d977'; g.font = 'bold 84px Arial';
      g.fillText('BHARAT #1', w / 2, 168);
      g.fillStyle = '#f5d76a'; g.font = 'bold 26px Arial';
      g.fillText('AMEERON KI LIST ME PHIR NUMBER EK', w / 2, 340);
    }
    graphTex.needsUpdate = true;
  };
  drawGraph('calm', 1);
  graphRedraw = (mode, p) => { (mode === 'calm' || mode === 'crash') ? drawGraph(mode, p) : drawBoard2(mode, p); };
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.34, 1.64), bas({ map: graphTex }));
  scr.position.set(-2.75, 2.45, WALL_Z + 0.09); S.add(scr);

  // ---- desk (centre-front) ----
  const deskG = new THREE.Group(); deskG.position.set(0.3, 0, -0.55); S.add(deskG);
  const dTop = box(2.0, 0.08, 1.0, lam({ map: FX.woodTexture(), color: 0x7d5230 })); dTop.position.y = 0.74; deskG.add(dTop);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = box(0.08, 0.74, 0.08, lam({ color: 0x54371f }));
    leg.position.set(sx * 0.88, 0.37, sz * 0.4); deskG.add(leg);
  }
  const front = box(1.84, 0.55, 0.05, lam({ map: FX.woodTexture(), color: 0x6d4525 })); front.position.set(0, 0.42, 0.46); deskG.add(front);
  // chai ka cup + saucer
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.042, 0.09, 12), lam({ color: 0xf2ede2 }));
  cup.position.set(-0.55, 0.83, 0.05); deskG.add(cup);
  const chai = new THREE.Mesh(new THREE.CircleGeometry(0.048, 12), lam({ color: 0xb5762e }));
  chai.rotation.x = -Math.PI / 2; chai.position.set(-0.55, 0.878, 0.05); deskG.add(chai);
  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.06, 0.02, 12), lam({ color: 0xe2dac8 }));
  saucer.position.set(-0.55, 0.79, 0.05); deskG.add(saucer);
  // akhbaar (desk par khula)
  const newsTex = textBoard(512, 340, (g, w, h) => {
    g.fillStyle = '#f7f2e4'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#22252c'; g.font = 'bold 40px Georgia'; g.textAlign = 'center';
    g.fillText('THE DAILY NEWS', w / 2, 52);
    g.strokeStyle = '#22252c'; g.lineWidth = 3; g.beginPath(); g.moveTo(20, 70); g.lineTo(w - 20, 70); g.stroke();
    g.fillStyle = '#8a8f98'; g.fillRect(28, 92, 200, 130);
    g.fillStyle = '#274b73'; g.beginPath(); g.arc(128, 140, 30, 0, 7); g.fill();
    g.fillStyle = '#b8bcc2';
    for (let r = 0; r < 9; r++) { g.fillRect(248, 96 + r * 24, 236, 10); }
    for (let r = 0; r < 6; r++) { g.fillRect(28, 240 + r * 15, 200, 7); }
    g.fillStyle = '#22252c'; g.font = 'bold 24px Arial'; g.textAlign = 'left';
    g.fillText('Bazaar me tezi...', 248, 116);
  });
  const news = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.41), lam({ map: newsTex }));
  news.rotation.x = -Math.PI / 2; news.rotation.z = 0.22; news.position.set(-0.08, 0.785, 0.02); deskG.add(news);
  // kagaz + pen + file
  const file = box(0.4, 0.035, 0.3, lam({ color: 0x8e2f26 })); file.position.set(-0.62, 0.8, -0.25); file.rotation.y = -0.2; deskG.add(file);
  const pen = box(0.16, 0.015, 0.015, lam({ color: 0xd9b84c })); pen.position.set(0.1, 0.79, 0.28); pen.rotation.y = 0.7; deskG.add(pen);
  // kursi — desk ke side me (camera ke raaste me nahi)
  const chairB = box(0.62, 0.85, 0.09, lam({ color: 0x4a2f1c })); chairB.position.set(2.15, 0.95, -1.7); chairB.rotation.y = -0.5; S.add(chairB);
  const chairS = box(0.62, 0.08, 0.55, lam({ color: 0x5d3a22 })); chairS.position.set(2.0, 0.5, -1.45); chairS.rotation.y = -0.5; S.add(chairS);

  // bookshelf (right wall paas) + ghadi + photo frame
  const shelf = box(0.36, 2.0, 1.3, lam({ map: FX.woodTexture(), color: 0x6d4525 })); shelf.position.set(3.15, 1.0, -2.2); S.add(shelf);
  [0xb3372a, 0x2e5da8, 0x3f7a4a, 0xd9a441, 0x7a1fa2, 0x274b73].forEach((c, i) => {
    const bk = box(0.24, 0.42, 0.14, lam({ color: c }));
    bk.position.set(3.12, 0.55 + (i % 3) * 0.5, -2.62 + Math.floor(i / 3) * 0.55); bk.rotation.y = 0.12; S.add(bk);
  });
  const clockTex = textBoard(256, 256, (g, w, h) => {
    g.fillStyle = '#f7f1e2'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
    g.strokeStyle = '#3a2c1c'; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 116, 0, 7); g.stroke();
    g.lineWidth = 9; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 58); g.stroke();
    g.lineWidth = 6; g.beginPath(); g.moveTo(128, 128); g.lineTo(172, 150); g.stroke();
    g.fillStyle = '#a33327'; g.beginPath(); g.arc(128, 128, 10, 0, 7); g.fill();
  });
  const clock = new THREE.Mesh(new THREE.CircleGeometry(0.36, 24), lam({ map: clockTex }));
  clock.position.set(2.6, 3.2, WALL_Z + 0.06); S.add(clock);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.4, 10), lam({ color: 0xa3542e }));
  pot.position.set(-3.3, 0.2, -1.2); S.add(pot);
  const leafM = lam({ color: 0x3f7a3a });
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.9 + (i % 3) * 0.2, 6), leafM);
    const a = i / 5 * Math.PI * 2;
    leaf.position.set(-3.3 + Math.cos(a) * 0.14, 0.85 + (i % 3) * 0.13, -1.2 + Math.sin(a) * 0.14);
    leaf.rotation.set(Math.sin(a) * 0.35, 0, Math.cos(a) * 0.35); S.add(leaf);
  }
}

// =====================================================================
// PHONE PROP — screen: home / report
// =====================================================================
const phoneG = new THREE.Group(); scene.add(phoneG);
const homeTex = textBoard(256, 512, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#2c4a73'); gr.addColorStop(1, '#10151c');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffffff'; g.font = 'bold 64px Arial'; g.textAlign = 'center';
  g.fillText('9:15', w / 2, 150);
  g.font = '22px Arial'; g.fillStyle = '#cfe0ee'; g.fillText('Shukravaar', w / 2, 190);
  g.fillStyle = '#ffffff22';
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { g.beginPath(); g.roundRect(22 + c * 56, 300 + r * 66, 44, 44, 10); g.fill(); }
});
const reportTex = textBoard(256, 512, (g, w, h) => {
  g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#141a22'; g.fillRect(0, 0, w, 58);
  g.fillStyle = '#ff5347'; g.beginPath(); g.arc(26, 29, 9, 0, 7); g.fill();
  g.fillStyle = '#ffffff'; g.font = 'bold 23px Arial'; g.textAlign = 'left'; g.fillText('NEWS LIVE', 46, 37);
  g.fillStyle = '#b3231b'; g.fillRect(0, 58, w, 52);
  g.fillStyle = '#ffffff'; g.font = 'bold 30px Arial'; g.textAlign = 'center'; g.fillText('BREAKING', w / 2, 95);
  g.fillStyle = '#141a22'; g.font = 'bold 33px Arial';
  g.fillText('AMERICA SE', w / 2, 168); g.fillText('REPORT', w / 2, 208);
  g.strokeStyle = '#b8b2a2'; g.lineWidth = 2; g.beginPath(); g.moveTo(24, 236); g.lineTo(w - 24, 236); g.stroke();
  g.fillStyle = '#3a2c1c'; g.font = 'bold 25px Arial'; g.textAlign = 'left';
  g.fillText('DAAM KHUD', 24, 282); g.fillText('BADHAYE?', 24, 316);
  g.fillText('HISAAB GOL?', 24, 366);
  g.fillStyle = '#8a8f98';
  for (let r = 0; r < 3; r++) g.fillRect(24, 396 + r * 20, w - 70, 9);
  // laal AAROP stamp
  g.save(); g.translate(w / 2, 452); g.rotate(-0.13);
  g.strokeStyle = '#d21f14'; g.lineWidth = 5; g.strokeRect(-78, -26, 156, 52);
  g.fillStyle = '#d21f14'; g.font = 'bold 32px Arial'; g.textAlign = 'center'; g.fillText('⚠ AAROP', 0, 11);
  g.restore();
});
{
  const body = box(0.36, 0.7, 0.045, lam({ color: 0x14181d }));
  phoneG.add(body);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.325, 0.65), bas({ map: homeTex }));
  scr.position.z = 0.026; scr.name = 'screen'; phoneG.add(scr);
}
const phoneScreen = phoneG.children.find((o) => o.name === 'screen');
const setPhone = (texP, x, y, z, rx = 0, ry = 0, rz = 0) => {
  phoneG.visible = true;
  if (phoneScreen.material.map !== texP) { phoneScreen.material.map = texP; phoneScreen.material.needsUpdate = true; }
  phoneG.position.set(x, y, z); phoneG.rotation.set(rx, ry, rz);
};

// =====================================================================
// FULL-BUILD PROPS (sab default HIDDEN — sirf apne shots me dikhte hain,
// taaki sample ke frames 0-509 bilkul na badlein)
// =====================================================================
// ---- ghadi-6: shaam ke 6 baje wali deewar ghadi + ghoomti second hand ----
const clock6G = new THREE.Group(); scene.add(clock6G); clock6G.visible = false;
let clock6Hand;
{
  const faceTex = textBoard(256, 256, (g, w, h) => {
    g.fillStyle = '#f7f1e2'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
    g.strokeStyle = '#3a2c1c'; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 116, 0, 7); g.stroke();
    g.fillStyle = '#3a2c1c'; g.font = 'bold 30px Arial'; g.textAlign = 'center';
    g.fillText('12', 128, 44); g.fillText('6', 128, 232); g.fillText('3', 222, 138); g.fillText('9', 34, 138);
    g.strokeStyle = '#3a2c1c'; g.lineWidth = 11; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 190); g.stroke(); // ghanta — 6 par
    g.lineWidth = 7; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 56); g.stroke(); // minute — 12 par (6:00)
  });
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.42, 28), lam({ map: faceTex }));
  clock6G.add(face);
  const handGeo = new THREE.BoxGeometry(0.022, 0.34, 0.012); handGeo.translate(0, 0.14, 0);
  clock6Hand = new THREE.Mesh(handGeo, bas({ color: 0xd21f14 }));
  clock6Hand.position.z = 0.02; clock6G.add(clock6Hand);
  const pin = new THREE.Mesh(new THREE.CircleGeometry(0.035, 10), bas({ color: 0x3a2c1c }));
  pin.position.z = 0.03; clock6G.add(pin);
  clock6G.position.set(-4.35, 2.7, WALL_Z + 0.06);
}
// ---- akhbaar barsaat: headline wale kagaz (girte / bikhre) ----
const headlineTex = textBoard(512, 340, (g, w, h) => {
  g.fillStyle = '#f7f2e4'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#22252c'; g.font = 'bold 34px Georgia'; g.textAlign = 'center';
  g.fillText('THE DAILY NEWS', w / 2, 46);
  g.strokeStyle = '#22252c'; g.lineWidth = 3; g.beginPath(); g.moveTo(20, 62); g.lineTo(w - 20, 62); g.stroke();
  g.fillStyle = '#b3231b'; g.font = 'bold 52px Arial';
  g.fillText('ADANI KE SHARE', w / 2, 138);
  g.fillText('GIRE!', w / 2, 198);
  g.fillStyle = '#22252c'; g.font = 'bold 40px Arial';
  g.fillText('-20% LOWER CIRCUIT', w / 2, 262);
  g.fillStyle = '#b8bcc2';
  for (let r = 0; r < 3; r++) g.fillRect(40, 286 + r * 16, w - 80, 8);
});
const papersG = new THREE.Group(); scene.add(papersG); papersG.visible = false;
const paperPlanes = [];
for (let i = 0; i < 7; i++) {
  const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.41), lam({ map: headlineTex, side: THREE.DoubleSide }));
  papersG.add(pm); paperPlanes.push(pm);
}
// ---- FPO form + laal stamp ----
const fpoDraw = (stamped) => (g, w, h) => {
  g.fillStyle = '#f8f4e8'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#9a917c'; g.lineWidth = 4; g.strokeRect(14, 14, w - 28, h - 28);
  g.fillStyle = '#173f5e'; g.font = 'bold 54px Arial'; g.textAlign = 'center';
  g.fillText('FPO FORM', w / 2, 84);
  g.fillStyle = '#b3231b'; g.font = 'bold 64px Arial';
  g.fillText('₹20,000 CRORE', w / 2, 168);
  g.fillStyle = '#3a2c1c'; g.font = '24px Arial';
  g.fillText('Adani Enterprises — Follow-on Public Offer', w / 2, 216);
  g.fillStyle = '#b8b2a2';
  for (let r = 0; r < 4; r++) g.fillRect(50, 252 + r * 30, w - 100, 12);
  if (stamped) {
    g.save(); g.translate(w / 2, 330); g.rotate(-0.12);
    g.strokeStyle = '#d21f14'; g.lineWidth = 9; g.strokeRect(-190, -52, 380, 104);
    g.fillStyle = '#d21f14'; g.font = 'bold 72px Arial'; g.fillText('FPO BAND', 0, 26);
    g.restore();
  }
};
const formTexA = textBoard(640, 440, fpoDraw(false));
const formTexB = textBoard(640, 440, fpoDraw(true));
const formMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.62), lam({ map: formTexA }));
formMesh.rotation.x = -Math.PI / 2; formMesh.rotation.z = 0.08;
formMesh.position.set(0.68, 0.795, -0.5); scene.add(formMesh); formMesh.visible = false;
const stampG = new THREE.Group(); scene.add(stampG); stampG.visible = false;
{
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.22, 12), lam({ color: 0x8e2f26 }));
  handle.position.y = 0.24; stampG.add(handle);
  const neck = box(0.09, 0.07, 0.09, lam({ color: 0x39434c })); neck.position.y = 0.1; stampG.add(neck);
  const baseB = box(0.4, 0.07, 0.28, lam({ color: 0x5d3a22 })); baseB.position.y = 0.035; stampG.add(baseB);
  const rubber = box(0.38, 0.02, 0.26, lam({ color: 0xd21f14 })); rubber.position.y = 0.005; stampG.add(rubber);
  stampG.position.set(0.68, 1.9, -0.5);
}
// ---- calendar (desk par khada, panne udte hue) ----
const calendarG = new THREE.Group(); scene.add(calendarG); calendarG.visible = false;
const calPivots = [];
{
  const calTex = textBoard(360, 440, (g, w, h) => {
    g.fillStyle = '#f8f4e8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b3231b'; g.fillRect(0, 0, w, 74);
    g.fillStyle = '#ffffff'; g.font = 'bold 40px Arial'; g.textAlign = 'center';
    g.fillText('JANUARY 2023', w / 2, 52);
    g.fillStyle = '#3a2c1c'; g.font = 'bold 27px Arial';
    for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
      const d = r * 7 + c + 1; if (d > 31) break;
      g.fillText(String(d), 32 + c * 48, 122 + r * 56);
    }
    g.strokeStyle = '#d21f14'; g.lineWidth = 6;
    g.beginPath(); g.arc(32 + 5 * 48, 122 + 3 * 56 - 10, 25, 0, 7); g.stroke(); // 27 par laal gola
  });
  const boardC = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.64), lam({ map: calTex, side: THREE.DoubleSide }));
  boardC.position.y = 0.32; calendarG.add(boardC);
  for (let i = 0; i < 3; i++) {
    const piv = new THREE.Group(); piv.position.set(0, 0.62, 0.012 + i * 0.004); calendarG.add(piv);
    const pgGeo = new THREE.PlaneGeometry(0.5, 0.6); pgGeo.translate(0, -0.3, 0);
    const pg = new THREE.Mesh(pgGeo, lam({ map: calTex, side: THREE.DoubleSide }));
    piv.add(pg); calPivots.push(piv);
  }
  const stand = box(0.5, 0.04, 0.2, lam({ color: 0x5d3a22 })); stand.position.set(0, 0.02, -0.04); calendarG.add(stand);
  calendarG.position.set(-0.32, 0.78, -0.68); calendarG.rotation.x = -0.1;
}
// ---- karz kagaz (dynamic laal line) ----
const karzCanvas = document.createElement('canvas'); karzCanvas.width = 640; karzCanvas.height = 440;
const karzTex = new THREE.CanvasTexture(karzCanvas); karzTex.colorSpace = THREE.SRGBColorSpace;
const karzRedraw = (p) => {
  const g = karzCanvas.getContext('2d'), w = 640, h = 440;
  g.fillStyle = '#f8f4e8'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#9a917c'; g.lineWidth = 4; g.strokeRect(14, 14, w - 28, h - 28);
  g.fillStyle = '#173f5e'; g.font = 'bold 46px Arial'; g.textAlign = 'center';
  g.fillText('KARZ KA HISAB', w / 2, 74);
  g.fillStyle = '#3a2c1c'; g.font = '30px Arial'; g.textAlign = 'left';
  const rows = ['Bank loan ......... ₹8,000 cr', 'Bond .............. ₹5,200 cr', 'Videshi karz ...... ₹6,400 cr', 'Byaaj ............. ₹1,900 cr'];
  rows.forEach((r, i) => g.fillText(r, 60, 140 + i * 56));
  if (p > 0.05) {
    g.strokeStyle = '#d21f14'; g.lineWidth = 13; g.lineCap = 'round';
    g.beginPath(); g.moveTo(44, 380); g.lineTo(44 + (w - 88) * Math.min(1, p), 96); g.stroke();
  }
  if (p > 0.85) {
    g.fillStyle = '#2e7a3a'; g.font = 'bold 40px Arial'; g.textAlign = 'center';
    g.fillText('KARZ GHATAYA ✓', w / 2, 416);
  }
  karzTex.needsUpdate = true;
};
karzRedraw(0);
const karzMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.62), lam({ map: karzTex }));
karzMesh.rotation.x = -Math.PI / 2; karzMesh.rotation.z = -0.06;
karzMesh.position.set(0.7, 0.795, -0.48); scene.add(karzMesh); karzMesh.visible = false;
// ---- seekh board (desk par khada chhota board) ----
const deskBoard = new THREE.Group(); scene.add(deskBoard); deskBoard.visible = false;
{
  const dbTex = textBoard(640, 400, (g, w, h) => {
    g.fillStyle = '#22303e'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#f5d76a'; g.lineWidth = 8; g.strokeRect(12, 12, w - 24, h - 24);
    g.fillStyle = '#ffffff'; g.font = 'bold 62px Arial'; g.textAlign = 'center';
    g.fillText('DAULAT = KAGAZ', w / 2, 150);
    g.fillStyle = '#f5d76a';
    g.fillText('TIKTI = BHAROSA', w / 2, 268);
    g.fillStyle = '#9fc4e0'; g.font = 'bold 30px Arial';
    g.fillText('— seekh —', w / 2, 348);
  });
  const db = boardMesh(0.82, 0.52, dbTex); db.position.y = 0.3; deskBoard.add(db);
  const legB = box(0.06, 0.3, 0.06, lam({ color: 0x5d3a22 })); legB.position.set(-0.3, 0.15, -0.05); deskBoard.add(legB);
  const legB2 = legB.clone(); legB2.position.x = 0.3; deskBoard.add(legB2);
  deskBoard.position.set(0.28, 0.78, -0.8); deskBoard.rotation.x = -0.08;
}

// =====================================================================
// SET 2 — PORT (aasmani rang: paani, cranes, containers, jahaz)
// =====================================================================
const portG = new THREE.Group(); scene.add(portG);
{
  const S = portG;
  const water = new THREE.Mesh(new THREE.PlaneGeometry(40, 22), lam({ color: 0x3f8fbf }));
  water.rotation.x = -Math.PI / 2; water.position.set(0, 0, 9); S.add(water);
  const quay = box(30, 0.5, 9, lam({ map: tex(stone(4, 30, 10, 78), 6, 2), color: 0xb9beb9 }));
  quay.position.set(0, 0.25, -3.5); S.add(quay);
  const edge = box(30, 0.54, 0.3, lam({ color: 0xf5d76a })); edge.position.set(0, 0.26, 1.05); S.add(edge);
  // PORT board
  const portBoardTex = textBoard(1024, 256, (g, w, h) => {
    g.fillStyle = '#173f5e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(110, 128, 62, 0, 7); g.fill();
    g.fillStyle = '#173f5e'; g.font = 'bold 84px Arial'; g.textAlign = 'center'; g.fillText('⚓', 110, 152);
    g.fillStyle = '#ffffff'; g.font = 'bold 130px Arial'; g.fillText('PORT', w / 2 + 60, 158);
    g.fillStyle = '#f5d76a'; g.font = 'bold 34px Arial'; g.fillText('— bandar-gah —', w / 2 + 60, 216);
  });
  const pb = boardMesh(5.6, 1.4, portBoardTex, true); pb.position.set(-1.6, 2.3, -6.2); S.add(pb);
  const pbBack = box(5.7, 1.5, 0.08, lam({ color: 0x10293e })); pbBack.position.set(-1.6, 2.3, -6.26); S.add(pbBack);
  for (const px of [-4.0, 0.8]) { const post = box(0.16, 2.2, 0.16, lam({ color: 0x39434c })); post.position.set(px, 0.9, -6.2); S.add(post); }
  // cranes (bade)
  const craneM = lam({ color: 0x1f6f6f }), craneD = lam({ color: 0x185454 });
  const mkCrane = (x, z, s, flip) => {
    const cg = new THREE.Group(); cg.position.set(x, 0.5, z); cg.scale.set(s * flip, s, s); S.add(cg);
    for (const sx of [-1.1, 1.1]) for (const sz of [-0.5, 0.5]) {
      const leg = box(0.18, 3.4, 0.18, craneM); leg.position.set(sx, 1.7, sz); cg.add(leg);
    }
    const top = box(2.9, 0.22, 1.3, craneD); top.position.y = 3.45; cg.add(top);
    const boom = box(4.6, 0.18, 0.18, craneM); boom.position.set(1.2, 3.85, 0); boom.rotation.z = 0.22; cg.add(boom);
    const cab = box(0.44, 0.4, 0.44, lam({ color: 0xf5d76a })); cab.position.set(0.6, 3.1, 0.3); cg.add(cab);
    const cable = box(0.03, 1.5, 0.03, lam({ color: 0x22262b })); cable.position.set(2.2, 2.9, 0); cg.add(cable);
    const cont = box(1.1, 0.5, 0.45, lam({ color: 0xd97b29 })); cont.position.set(2.2, 1.9, 0); cg.add(cont);
  };
  mkCrane(1.8, -2.6, 1.15, 1); mkCrane(-4.6, -3.4, 0.9, -1);
  // container stacks
  const contCols = [0xc23b2e, 0x2e5da8, 0x3f7a4a, 0xd97b29, 0x7a1fa2, 0x1f6f6f];
  const stack = (x, z, n, seedO) => {
    for (let i = 0; i < n; i++) {
      const c = box(1.7, 0.62, 0.8, lam({ color: contCols[(seedO + i) % 6] }));
      c.position.set(x, 0.81 + i * 0.64, z); c.rotation.y = (i % 2) * 0.04; S.add(c);
    }
  };
  stack(-3.4, -1.4, 3, 0); stack(-1.4, -1.6, 2, 2); stack(4.6, -1.2, 3, 4); stack(6.3, -1.8, 2, 1);
  // jahaz (bada, paani par)
  const ship = new THREE.Group(); ship.position.set(-0.6, 0, 4.6); ship.rotation.y = 0.15; S.add(ship);
  const hull = box(5.2, 0.9, 1.4, lam({ color: 0x8e2f26 })); hull.position.y = 0.55; ship.add(hull);
  const bow = box(1.1, 0.9, 1.0, lam({ color: 0x8e2f26 })); bow.position.set(3.0, 0.55, 0); bow.rotation.y = 0.6; ship.add(bow);
  const deckH = box(0.8, 1.1, 0.9, lam({ color: 0xf0ece2 })); deckH.position.set(-2.0, 1.5, 0); ship.add(deckH);
  for (let i = 0; i < 5; i++) {
    const cb = box(1.05, 0.55, 1.15, lam({ color: contCols[(i * 2 + 1) % 6] }));
    cb.position.set(-0.9 + i * 1.12, 1.28, 0); ship.add(cb);
    if (i % 2) { const cb2 = box(1.05, 0.55, 1.15, lam({ color: contCols[(i + 3) % 6] })); cb2.position.set(-0.9 + i * 1.12, 1.85, 0); ship.add(cb2); }
  }
  // chhoti kashti + boyaa
  const buoy = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.5, 10), lam({ color: 0xd23b2a }));
  buoy.position.set(-2.8, 0.18, 4.4); S.add(buoy);
}
// ---- FULL: chalta crane-load (s32) + chalti kashti (s33), default hidden ----
const craneAnim = new THREE.Group(); portG.add(craneAnim); craneAnim.visible = false;
let craneLoad, craneCable;
{
  const armM = lam({ color: 0x185454 });
  const arm = box(3.4, 0.18, 0.18, armM); arm.position.set(0, 4.6, 0); craneAnim.add(arm);
  const post = box(0.2, 4.6, 0.2, armM); post.position.set(-1.6, 2.3, 0); craneAnim.add(post);
  craneCable = box(0.035, 1.6, 0.035, lam({ color: 0x22262b }));
  craneCable.position.set(1.2, 3.8, 0); craneAnim.add(craneCable);
  craneLoad = box(1.25, 0.58, 0.5, lam({ color: 0xc23b2e }));
  craneLoad.position.set(1.2, 2.7, 0); craneAnim.add(craneLoad);
  craneAnim.position.set(3.2, 0.5, -1.1);
}
const boatG = new THREE.Group(); portG.add(boatG); boatG.visible = false;
{
  const hull = box(2.6, 0.5, 0.8, lam({ color: 0x274b73 })); hull.position.y = 0.3; boatG.add(hull);
  const cabB = box(0.6, 0.5, 0.6, lam({ color: 0xf0ece2 })); cabB.position.set(-0.7, 0.8, 0); boatG.add(cabB);
  const cont1 = box(1.0, 0.45, 0.62, lam({ color: 0xd97b29 })); cont1.position.set(0.55, 0.78, 0); boatG.add(cont1);
  const cont2 = box(1.0, 0.45, 0.62, lam({ color: 0x3f7a4a })); cont2.position.set(0.55, 1.24, 0); boatG.add(cont2);
  boatG.position.set(-6, 0.05, 7.6);
}

// =====================================================================
// SET 3 — AIRPORT (safed-neela rang: runway, terminal, jahaz)
// =====================================================================
const airportG = new THREE.Group(); scene.add(airportG);
let planeG;
{
  const S = airportG;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), lam({ color: 0xa8b39a }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, 4); S.add(ground);
  const apron = box(26, 0.06, 9, lam({ color: 0xb9beb9 })); apron.position.set(0, 0.03, -1.5); S.add(apron);
  const runway = box(24, 0.05, 2.4, lam({ color: 0x33383e })); runway.position.set(0, 0.045, 1.8); S.add(runway);
  for (let i = 0; i < 9; i++) {
    const dash = box(1.1, 0.056, 0.16, lam({ color: 0xf2f2f2 }));
    dash.position.set(-10 + i * 2.5, 0.05, 1.8); S.add(dash);
  }
  // terminal + AIRPORT board
  const term = box(11, 2.3, 1.2, lam({ color: 0xe8eef2 })); term.position.set(-0.5, 1.15, -5.6); S.add(term);
  const winStrip = box(10.6, 0.7, 0.06, lam({ color: 0x5a7a94 })); winStrip.position.set(-0.5, 1.5, -4.97); S.add(winStrip);
  const apBoardTex = textBoard(1024, 200, (g, w, h) => {
    g.fillStyle = '#274b73'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.font = 'bold 118px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('✈ AIRPORT', w / 2, h / 2 + 4);
  });
  const ab = boardMesh(6.4, 1.25, apBoardTex, true); ab.position.set(-0.5, 3.1, -5.55); S.add(ab);
  // control tower
  const twr = box(0.7, 3.0, 0.7, lam({ color: 0xd8dee2 })); twr.position.set(5.6, 1.5, -5.2); S.add(twr);
  const cabT = box(1.15, 0.6, 1.15, lam({ color: 0x39434c })); cabT.position.set(5.6, 3.3, -5.2); S.add(cabT);
  // khade chhote jahaz (door)
  const miniPlane = (x, z, ry) => {
    const pg = new THREE.Group(); pg.position.set(x, 0.62, z); pg.rotation.y = ry; S.add(pg);
    const bd = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.9, 10), lam({ color: 0xf0f2f4 }));
    bd.rotation.z = Math.PI / 2; pg.add(bd);
    const wg = box(0.5, 0.05, 1.5, lam({ color: 0xcfd6dc })); pg.add(wg);
    const tl = box(0.4, 0.5, 0.06, lam({ color: 0x2e5da8 })); tl.position.set(-0.9, 0.25, 0); pg.add(tl);
  };
  miniPlane(-6.4, -3.4, 0.4); miniPlane(3.4, -3.8, -0.3);
  // ---- HAWAII JAHAAZ (hero, udta hua — s05 me animate hoga) ----
  planeG = new THREE.Group(); S.add(planeG);
  const pBody = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 4.6, 14), lam({ color: 0xf4f6f8 }));
  pBody.rotation.z = Math.PI / 2; planeG.add(pBody);
  const pNose = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), lam({ color: 0xf4f6f8 }));
  pNose.position.x = 2.3; pNose.scale.x = 1.5; planeG.add(pNose);
  const pCock = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), lam({ color: 0x22303e }));
  pCock.position.set(2.15, 0.18, 0); pCock.scale.set(1.2, 0.55, 0.8); planeG.add(pCock);
  const pStripe = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 4.0, 14, 1, true), lam({ color: 0x2e5da8 }));
  pStripe.rotation.z = Math.PI / 2; pStripe.position.y = -0.12; planeG.add(pStripe);
  const pWing = box(1.3, 0.07, 4.4, lam({ color: 0xd8dee2 })); pWing.position.set(0.1, -0.15, 0); planeG.add(pWing);
  const pTail = box(0.7, 1.0, 0.08, lam({ color: 0x2e5da8 })); pTail.position.set(-2.25, 0.55, 0); pTail.rotation.z = 0.35; planeG.add(pTail);
  const pFin = box(0.6, 0.07, 1.4, lam({ color: 0xd8dee2 })); pFin.position.set(-2.25, 0.1, 0); planeG.add(pFin);
  for (const sz of [-1, 1]) {
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.6, 10), lam({ color: 0x39434c }));
    eng.rotation.z = Math.PI / 2; eng.position.set(0.15, -0.42, sz * 1.15); planeG.add(eng);
  }
  planeG.position.set(-8, 3.3, -4.2);
}

// =====================================================================
// SET 4 — BIJLI GHAR (peeli garam roshni: towers, taar, cooling tower)
// =====================================================================
const powerG = new THREE.Group(); scene.add(powerG);
{
  const S = powerG;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), lam({ map: tex(stone(9, 40, 14, 110), 6, 6), color: 0xd9b878 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, 4); S.add(ground);
  const towerM = lam({ color: 0x4c4438 });
  const mkTower = (x, z, s) => {
    const tg = new THREE.Group(); tg.position.set(x, 0, z); tg.scale.setScalar(s); S.add(tg);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const leg = box(0.13, 3.6, 0.13, towerM);
      leg.position.set(sx * 0.36, 1.8, sz * 0.36);
      leg.rotation.z = -sx * 0.08; leg.rotation.x = sz * 0.08; tg.add(leg);
    }
    for (const y of [1.1, 2.1, 3.0]) { const ring = box(0.85 - y * 0.16, 0.07, 0.85 - y * 0.16, towerM); ring.position.y = y; tg.add(ring); }
    for (const [ay, aw] of [[2.75, 2.6], [3.25, 2.1], [3.7, 1.5]]) {
      const arm = box(aw, 0.09, 0.09, towerM); arm.position.y = ay; tg.add(arm);
    }
    const peak = box(0.09, 0.6, 0.09, towerM); peak.position.y = 4.1; tg.add(peak);
    return tg;
  };
  mkTower(-2.4, -2.2, 1.1); mkTower(2.6, -3.2, 1.3);
  // taar (sagging tubes, tower se tower)
  const wireM = lam({ color: 0x2c2620 });
  const wire = (a, b, sag) => {
    const mid = a.clone().lerp(b, 0.5); mid.y -= sag;
    const curve = new THREE.CatmullRomCurve3([a, mid, b]);
    S.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.022, 6), wireM));
  };
  for (const [ay, off] of [[3.03, 1.43], [3.58, 1.15], [4.0, 0.82]]) {
    wire(new THREE.Vector3(-2.4 - off * 1.1, ay * 1.1, -2.2), new THREE.Vector3(2.6 - off * 1.3, ay * 1.3, -3.2), 0.35);
    wire(new THREE.Vector3(-2.4 + off * 1.1, ay * 1.1, -2.2), new THREE.Vector3(2.6 + off * 1.3, ay * 1.3, -3.2), 0.35);
  }
  // cooling tower + bhaap
  const cool = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.25, 2.4, 16, 1, true), lam({ color: 0xcfd4d2, side: THREE.DoubleSide }));
  cool.position.set(-5.2, 1.2, -4.2); S.add(cool);
  const coolBase = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.3, 0.3, 16), lam({ color: 0xb9beb9 }));
  coolBase.position.set(-5.2, 0.15, -4.2); S.add(coolBase);
  const steamM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
  for (let i = 0; i < 4; i++) {
    const st = new THREE.Mesh(new THREE.SphereGeometry(0.4 + i * 0.16, 10, 8), steamM);
    st.position.set(-5.2 + (i % 2) * 0.4 - 0.2, 2.7 + i * 0.42, -4.2); st.scale.y = 0.7; S.add(st);
  }
  // POWER PLANT board
  const pwBoardTex = textBoard(1024, 220, (g, w, h) => {
    g.fillStyle = '#8a5a10'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f5d76a'; g.font = 'bold 104px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('⚡ POWER PLANT', w / 2, h / 2 - 12);
    g.fillStyle = '#ffffff'; g.font = 'bold 32px Arial'; g.fillText('— bijli ghar —', w / 2, h - 34);
  });
  const pwb = boardMesh(4.0, 0.95, pwBoardTex, true); pwb.position.set(0.7, 1.3, 1.0); pwb.rotation.y = 0.15; S.add(pwb);
  for (const px of [-0.9, 2.3]) { const post = box(0.12, 1.3, 0.12, lam({ color: 0x5d4a2a })); post.position.set(px, 0.65, 1.0); S.add(post); }
  // chhoti building + taank
  const bldg = box(2.6, 1.3, 1.1, lam({ color: 0xe0d6c0 })); bldg.position.set(5.2, 0.65, -3.4); S.add(bldg);
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.5, 12), lam({ color: 0xb9beb9 }));
  tank.rotation.z = Math.PI / 2; tank.position.set(5.0, 0.75, -1.6); S.add(tank);
}

// =====================================================================
// CHARACTER CARD (kit painter) — Adani
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
const adaniCard = new Card();
// Adani: safed kurta (shirt V) + gehri Nehru jacket (tunic), stout (bada aadmi)
const ADANI_OUTFIT = { tunic: '#2b3040', shirt: '#f5efe0', skin: '#dfa06b', hair: '#26222a', stout: true };

// ---- FULL: FPO bheed — 3 aam aadmi cards + unke kagaz (sirf s26) ----
const CROWD = [
  { card: new Card(), seed: 61, outfit: { tunic: '#3f7a4a', shirt: '#f2ead8', skin: '#c98a54', hair: '#1e1a20' }, expr: 'nervous', R: 'reach', L: 'hang', x: -0.55, z: 0.28 },
  { card: new Card(), seed: 62, outfit: { tunic: '#7a2e35', shirt: '#efe6d0', skin: '#a06a3c', hair: '#26222a' }, expr: 'stern', R: 'hang', L: 'reach', x: 0.38, z: 0.42 },
  { card: new Card(), seed: 63, outfit: { tunic: '#44546a', shirt: '#f5efe0', skin: '#dfa06b', hair: '#3a3230' }, expr: 'nervous', R: 'reach', L: 'reach', x: 1.3, z: 0.24 },
];
const crowdPapers = CROWD.map((c) => {
  const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), lam({ map: headlineTex, side: THREE.DoubleSide }));
  scene.add(pm); pm.visible = false; return pm;
});
const showCrowd = (f, camPos) => {
  CROWD.forEach((c, i) => {
    const idl = idle(f, c.seed), blink = blinkAt(f, c.seed);
    const key = `${c.seed}|${c.expr}|${c.R}|${c.L}|${blink}|${q(idl.bob, 2)}|${Math.round(idl.tilt)}`;
    c.card.draw(key, (p) => T.romanFront(p, c.outfit, {
      seed: c.seed, expr: c.expr, R: c.R, L: c.L, blink, bob: q(idl.bob, 2), tilt: Math.round(idl.tilt),
      headTilt: Math.round(idle(f, c.seed + 2).headTilt), wv: f * 0.18, step: 0,
    }));
    c.card.place(c.x, 0, c.z, camPos, 0.95);
    const pm = crowdPapers[i];
    pm.visible = true;
    pm.position.set(c.x + 0.18, 1.02, c.z + 0.14);
    pm.rotation.set(-0.15, Math.atan2(camPos[0] - c.x, camPos[2] - c.z), 0.1);
  });
};
const hideCrowd = () => { CROWD.forEach((c) => c.card.hide()); crowdPapers.forEach((pm) => { pm.visible = false; }); };

// ---------- environments ----------
scene.fog = new THREE.Fog(0xf2cf9a, 18, 52);
const ENVS = {
  office: { bg: 0xf2cf9a, hemi: 1.0, sun: 1.85 },   // subah ki garam sunehri roshni
  port: { bg: 0xbfe0ee, hemi: 1.15, sun: 1.95 },    // aasmani — paani wala din
  airport: { bg: 0xdceef7, hemi: 1.25, sun: 2.0, hemiCol: 0xeaf4ff, hemiGnd: 0x8a97a5 },   // safed-neela din
  power: { bg: 0xf6dc9a, hemi: 1.05, sun: 1.9 },    // peeli shaam ki roshni
  screen: { bg: 0xe6d3a3, hemi: 0.85, sun: 1.45 },  // office, screen ki taraf — halka gehra
  evening: { bg: 0xe9a869, hemi: 0.72, sun: 1.15, sunCol: 0xff8f3f, hemiCol: 0xffc9a0, hemiGnd: 0x4a3423 }, // shaam — gehri narangi roshni
};
const _bgCol = new THREE.Color();
function applyEnv(name) {
  const e = ENVS[name];
  _bgCol.setHex(e.bg); scene.background = _bgCol;
  scene.fog.color.copy(_bgCol);
  hemi.intensity = e.hemi; sun.intensity = e.sun;
  hemi.color.setHex(e.hemiCol || 0xffe7c4);
  hemi.groundColor.setHex(e.hemiGnd || 0x5a4632);
  sun.color.setHex(e.sunCol || 0xffd9a0);
}

// ---------- FULL: akhbaar layout helper ----------
// 'fall' = s20 barsaat (u se animate) | 'desk' = s14 bikhre | 'floor' = s23 farsh par
const layoutPapers = (mode, u = 0) => {
  papersG.visible = true;
  paperPlanes.forEach((pm, i) => {
    if (mode === 'fall') {
      const p = clamp((u * 1.25 - i * 0.1) / 0.75);
      const lx = [-0.1, 0.75, -1.3, 1.5, -0.7, 0.35, 1.05][i];
      const lz = [-0.55, -0.45, 0.35, 0.5, 0.75, -0.75, 0.15][i];
      const landY = i < 2 ? 0.8 : 0.03;
      pm.visible = true;
      pm.position.set(lx + Math.sin(i * 7) * 0.3 * (1 - p), landY + (1 - p) * 3.1, lz);
      pm.rotation.set(-0.3 - p * 1.27, i * 0.7, Math.sin(p * 5 + i * 2) * 0.55 * (1 - p));
    } else {
      const pos = mode === 'desk'
        ? [[-0.25, 0.8, -0.42, 0.3], [0.85, 0.8, -0.68, -0.2], [0.1, 0.8, -0.82, 0.9]]
        : [[-1.2, 0.03, 0.3, 0.4], [0.9, 0.03, 0.6, -0.7], [-0.3, 0.03, 0.9, 1.2], [1.6, 0.03, -0.1, 0.2]];
      if (i < pos.length) {
        const [x, y, z, r] = pos[i];
        pm.visible = true; pm.position.set(x, y, z); pm.rotation.set(-Math.PI / 2, 0, r);
      } else pm.visible = false;
    }
  });
};

// ---------- per-frame ----------
window.renderFrame = (f) => {
  const shot = shotAt(f), u = shot.u, id = shot.id;
  const cam = camFor(shot, u);
  camera.position.set(...cam.pos); camera.up.set(0, 1, 0); camera.lookAt(...cam.look);
  if (cam.roll) camera.rotateZ(THREE.MathUtils.degToRad(cam.roll));
  camera.fov = cam.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  sun.target.position.set(0, 1, 0);

  const set = shot.set;
  officeG.visible = set === 'office' || set === 'screen';
  portG.visible = set === 'port';
  airportG.visible = set === 'airport';
  powerG.visible = set === 'power';
  phoneG.visible = false;
  applyEnv(shot.env || set);
  adaniCard.hide();
  // FULL props — har frame pehle sab chhupao, case apna prop dikhayega
  clock6G.visible = false; papersG.visible = false;
  formMesh.visible = false; stampG.visible = false;
  calendarG.visible = false; karzMesh.visible = false; deskBoard.visible = false;
  craneAnim.visible = false; boatG.visible = false;
  hideCrowd();

  const show = (expr, R = 'hang', L = 'hang', x = 0.3, z = -1.6, s = 1.05, step = 0) => {
    const idl = idle(f, 51), blink = blinkAt(f, 51);
    const key = `51|${expr}|${R}|${L}|${blink}|${q(idl.bob, 2)}|${Math.round(idl.tilt)}|${q(step, 2)}`;
    adaniCard.draw(key, (p) => T.romanFront(p, ADANI_OUTFIT, {
      seed: 51, expr, R, L, blink, bob: q(idl.bob, 2), tilt: Math.round(idl.tilt),
      headTilt: Math.round(idle(f, 53).headTilt), wv: f * 0.18, step,
    }));
    adaniCard.place(x, 0, z, cam.pos, s);
  };

  switch (id) {
    // ---- L1: hook — office ----
    case 's01': // LOW-ANGLE: garv wala Adani, khidki ke saamne khada
      if (graphRedraw) graphRedraw('calm', 1);
      setPhone(homeTex, 0.55, 0.815, -0.35, -1.25, 0, 0);
      show('grin', 'hang', 'hang', 0.3, -1.6, 1.12);
      break;
    case 's02': // TOP-DOWN: desk — chai, akhbaar, phone; Adani desk ke side
      setPhone(homeTex, 0.55, 0.815, -0.35, -1.25, 0, 0);
      show('smile', 'belly', 'hang', 1.45, -0.5, 1.0);
      break;
    case 's03': // PEECHE/over-shoulder: khidki se bandar-gah, push-in
      show('grin', 'hang', 'hang', 0.35, -1.05, 1.06);
      break;
    // ---- L2: samrajya — tez cuts ----
    case 's04': break; // PORT fly-in — sirf set
    case 's05': // AIRPORT: jahaz camera ke upar se guzarta hai
      planeG.position.x = -8 + 16 * M.smooth(u);
      planeG.position.y = 3.3 + 0.3 * Math.sin(u * Math.PI);
      planeG.position.z = -4.2;
      planeG.rotation.z = 0.06;
      break;
    case 's06': break; // BIJLI dutch — sirf set
    // ---- L3: report ----
    case 's07': // PHONE MACRO: desk par phone bajta hai (hilta hua)
      setPhone(reportTex, 0.55 + Math.sin(f * 2.1) * 0.005, 0.815, -0.35, -1.25, 0, Math.sin(f * 2.1) * 0.045);
      break;
    case 's08': // POV: Adani ki nazar se phone — screen par REPORT
      setPhone(reportTex, 0.3, 1.02, 0.15);
      break;
    case 's09': { // SIDE close-up: garv -> CHAUK
      setPhone(reportTex, 0.88, 1.04, -1.08);
      show(u < 0.45 ? 'smile' : 'shock', 'reach', 'hang', 0.3, -1.6, 1.16);
      break;
    }
    case 's10': // DUTCH wide: khidki paas khada, phone haath me, sannata
      setPhone(reportTex, 0.88, 1.04, -1.08);
      show('nervous', 'reach', 'hang', 0.3, -1.6, 1.05);
      break;
    // ---- L4: bazaar khulta hai ----
    case 's11': // PEECHE se push-in: badi screen par graph tez girta hai
      if (graphRedraw) graphRedraw('crash', clamp(0.3 + u * 0.85));
      show('shock', 'hang', 'hang', -0.9, -0.6, 1.02);
      break;
    // ---- L4 cont.: bazaar crash ----
    case 's12': // SCREEN MACRO kone — crash pura, -20% bada
      if (graphRedraw) graphRedraw('crash', 1);
      break;
    case 's13': // SIDE close-up (bayein taraf) — shock -> nervous
      setPhone(reportTex, 0.88, 1.04, -1.08);
      show(u < 0.4 ? 'shock' : 'nervous', 'reach', 'hang', 0.3, -1.6, 1.16);
      break;
    case 's14': // TOP-DOWN desk — bikhre akhbaar + report phone
      setPhone(reportTex, 0.55, 0.815, -0.35, -1.25, 0, 0);
      layoutPapers('desk');
      show('nervous', 'belly', 'hang', 1.5, -0.45, 0.98);
      break;
    case 's15': // LOW-ANGLE screen — teen LOWER CIRCUIT badges ek-ek karke
      if (graphRedraw) graphRedraw('circuits', clamp(0.15 + u * 0.95));
      break;
    case 's16': // PEECHE wide — screen ke saamne akela, kandhe jhuke
      if (graphRedraw) graphRedraw('crash', 1);
      show('dazed', 'hang', 'hang', -1.2, -0.9, 1.0);
      break;
    // ---- L5: shaam ka number ----
    case 's17': // KONE se — wealth screen, shaam ki roshni
      if (graphRedraw) graphRedraw('wealth', u);
      show('dazed', 'hang', 'hang', -0.9, -1.15, 1.05);
      break;
    case 's18': // GHADI MACRO — shaam ke 6, second hand ghoomti hui
      clock6G.visible = true;
      clock6Hand.rotation.z = -(f / 90) * Math.PI * 2;
      break;
    case 's19': // SIDE close-up shaam — chehra girta hua
      show('pained', 'hang', 'hang', 0.3, -1.6, 1.14);
      break;
    // ---- L6: do din / rank ----
    case 's20': // TOP-DOWN wide — akhbaaron ki barsaat
      layoutPapers('fall', u);
      break;
    case 's21': // SAAMNE LOW-ANGLE — rank board #3 -> #7
      if (graphRedraw) graphRedraw('rank', clamp(u * 1.15));
      break;
    case 's22': // KONE MACRO — "48 BILLION DOLLAR" par push-in
      if (graphRedraw) graphRedraw('rank', 1);
      break;
    case 's23': // PEECHE wide — khidki paas akela, farsh par akhbaar
      layoutPapers('floor');
      show('dazed', 'hang', 'hang', 0.35, -1.05, 1.04);
      break;
    // ---- L7: asli jhatka ----
    case 's24': // SAAMNE close slow push-in — nervous, peeche laal screen
      if (graphRedraw) graphRedraw('crash', 1);
      show('nervous', 'hang', 'hang', 0.3, -1.6, 1.15);
      break;
    // ---- L8: FPO ----
    case 's25': // TOP-DOWN kone — FPO form macro
      formMesh.visible = true;
      if (formMesh.material.map !== formTexA) { formMesh.material.map = formTexA; formMesh.material.needsUpdate = true; }
      break;
    case 's26': // SIDE se — bheed kagaz wapas karti hui, Adani peeche stern
      showCrowd(f, cam.pos);
      show('stern', 'hang', 'hang', 0.3, -1.5, 0.98);
      break;
    case 's27': { // MACRO kone — laal stamp jhatke se padta hai
      formMesh.visible = true;
      const hit = 0.46;
      const wantTex = u >= hit ? formTexB : formTexA;
      if (formMesh.material.map !== wantTex) { formMesh.material.map = wantTex; formMesh.material.needsUpdate = true; }
      stampG.visible = true;
      let sy;
      if (u < hit) { const k = M.smooth(clamp(u / hit)); sy = 1.9 - k * 1.03; }
      else if (u < hit + 0.1) sy = 0.87 + Math.sin((u - hit) / 0.1 * Math.PI) * 0.012;
      else sy = 0.87 + M.smooth(clamp((u - hit - 0.1) / 0.3)) * 0.1;
      stampG.position.set(0.68, sy, -0.5);
      if (u >= hit && u < hit + 0.14) {
        const dec = 1 - (u - hit) / 0.14;
        camera.position.y += (Math.random() - 0.5) * 0.035 * dec;
        camera.position.x += (Math.random() - 0.5) * 0.02 * dec;
      }
      break;
    }
    // ---- L9: ek mahina ----
    case 's28': // TOP-DOWN — calendar ke panne udte hue
      calendarG.visible = true;
      calPivots.forEach((piv, i) => {
        const lp = clamp((u - i * 0.28) / 0.3);
        piv.rotation.x = -2.35 * M.smooth(lp);
      });
      break;
    case 's29': // KONE se — screen par aadha graph + #25
      if (graphRedraw) graphRedraw('low', u);
      show('dazed', 'hang', 'hang', -1.4, -1.1, 1.0);
      break;
    case 's30': // PEECHE wide shaam — khaali office, khidki paas akela
      show('dazed', 'hang', 'hang', 0.35, -1.05, 1.02);
      break;
    // ---- L10: wapasi ----
    case 's31': // MACRO top-down kone — karz kagaz par laal line kat-ti hui
      karzMesh.visible = true;
      karzRedraw(clamp(u * 1.1));
      break;
    case 's32': // PORT neeche-side dolly — crane ka container uthta hua
      craneAnim.visible = true;
      {
        const lift = M.smooth(u);
        craneLoad.position.y = 1.15 + lift * 1.85;
        const topY = craneLoad.position.y + 0.29, armY = 4.6;
        craneCable.scale.y = (armY - topY) / 1.6;
        craneCable.position.y = (armY + topY) / 2;
      }
      break;
    case 's33': // LOW-ANGLE paani kinare — kashti chalti hui
      boatG.visible = true;
      boatG.position.x = -6 + 10.5 * M.smooth(u);
      boatG.position.y = 0.05 + Math.sin(f * 0.25) * 0.03;
      boatG.rotation.z = Math.sin(f * 0.2) * 0.015;
      break;
    case 's34': // SAAMNE — screen par BHARAT #1, muskurahat wapas
      if (graphRedraw) graphRedraw('back', u);
      show(u < 0.35 ? 'smile' : 'relief', 'hang', 'hang', 0.3, -1.6, 1.1);
      break;
    // ---- L11+L12: seekh ----
    case 's35': // SIDE se — desk board (DAULAT = KAGAZ) + shaant Adani
      deskBoard.visible = true;
      show('smile_closed', 'belly', 'hang', 1.5, -0.45, 1.02);
      break;
    case 's36': // SAAMNE LOW close — shaant smile, board side me
      deskBoard.visible = true;
      show('smile_closed', 'hang', 'hang', 1.5, -0.45, 1.08);
      break;
    // ---- L13: sawal ----
    case 's37': // KONE 3/4 — viewer ki taraf POINT, stern sawal
      show('stern', 'point', 'hang', 0.3, -1.55, 1.1);
      break;
    case 's38': // UNCHA KONE wide — ek taraf laal screen, dusri taraf report phone; dono taraf point
      if (graphRedraw) graphRedraw('crash', 1);
      setPhone(reportTex, 0.55, 0.815, -0.35, -1.25, 0, 0);
      show('stern', u < 0.5 ? 'hang' : 'point', u < 0.5 ? 'point' : 'hang', -0.7, -1.2, 1.02);
      break;
    case 's39': // PEECHE-UPAR se WIDE PULL-BACK — ant, garam roshni
      if (graphRedraw) graphRedraw('calm', 1);
      show('smile', 'point', 'hang', 0.3, -1.55, 1.05);
      break;
  }
  renderer.render(scene, camera);
};
window.TOTAL = TOTAL;
window.ready = true;
