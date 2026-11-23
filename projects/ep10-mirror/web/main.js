// "EP-10 Finale SAMPLE — Ramesh ka din" — Mirror kit + Gullak grammar.
// Real three.js sets (subah ka kamra / petrol pump / ghar ka kona)
// + kit toon cards + scene-ke-andar signboards. NO CAPTIONS (user order).
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
// SET 1 — SUBAH KA KAMRA (room)
// =====================================================================
const roomG = new THREE.Group(); scene.add(roomG);
const WALL_Z = -3.2;
{
  const S = roomG;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), lam({ map: tex(planks(7), 5, 5) }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 4); S.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 7), lam({ map: tex(plaster(11, 38), 4, 1) }));
  wall.position.set(0, 3.5, WALL_Z); S.add(wall);
  for (const s of [-1, 1]) {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(20, 7), lam({ map: tex(plaster(13, 36), 3, 1), color: 0xdcc39c }));
    sw.position.set(s * 7.4, 3.5, 3); sw.rotation.y = -s * Math.PI / 2; S.add(sw);
  }
  const trimM = lam({ color: 0x6d4a2e });
  const skirt = box(30, 0.28, 0.06, trimM); skirt.position.set(0, 0.14, WALL_Z + 0.03); S.add(skirt);

  // khidki (left) — subah ki garam roshni
  const winG = new THREE.Group(); winG.position.set(-3.4, 2.7, WALL_Z + 0.06); S.add(winG);
  winG.add(box(2.3, 2.9, 0.1, lam({ color: 0x5d3f24 })));
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.95, 2.55), FX.glassMat(0xffc46b, 0.92)); glass.position.z = 0.06; winG.add(glass);
  const barV = box(0.07, 2.55, 0.04, lam({ color: 0x5d3f24 })); barV.position.z = 0.09; winG.add(barV);
  const barH = box(1.95, 0.07, 0.04, lam({ color: 0x5d3f24 })); barH.position.z = 0.09; winG.add(barH);
  const gl = FX.glint(0.9); gl.position.set(-0.4, 0.5, 0.12); winG.add(gl);

  // bistar (left) — mattress, takiya, kambal
  const bedG = new THREE.Group(); bedG.position.set(-1.8, 0, -1.5); S.add(bedG);
  const bedBase = box(2.3, 0.4, 1.15, lam({ map: FX.woodTexture(), color: 0x8a6844 })); bedBase.position.y = 0.2; bedG.add(bedBase);
  const mattress = box(2.2, 0.18, 1.05, lam({ color: 0xf3ead6 })); mattress.position.y = 0.49; bedG.add(mattress);
  const pillow = box(0.55, 0.13, 0.42, lam({ color: 0xffffff })); pillow.position.set(-0.75, 0.62, 0); pillow.rotation.z = 0.06; bedG.add(pillow);
  const blanket = box(1.25, 0.09, 1.06, lam({ color: 0xc4502e })); blanket.position.set(0.42, 0.6, 0); blanket.rotation.y = 0.05; bedG.add(blanket);
  const blanket2 = box(0.7, 0.07, 1.06, lam({ color: 0xe0a33c })); blanket2.position.set(0.75, 0.66, 0); bedG.add(blanket2);

  // calendar (deewar, right of centre)
  const calTex = textBoard(512, 640, (g, w, h) => {
    g.fillStyle = '#f7f1e2'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b3372a'; g.fillRect(0, 0, w, 108);
    g.fillStyle = '#ffffff'; g.font = 'bold 54px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('NOVEMBER', w / 2, 42); g.font = 'bold 30px Arial'; g.fillText('2 0 2 6', w / 2, 84);
    g.fillStyle = '#8a7a5f'; g.font = 'bold 26px Arial';
    'S M T W T F S'.split(' ').forEach((d, i) => g.fillText(d, 52 + i * 68, 140));
    g.font = '30px Arial'; g.fillStyle = '#3a2c1c';
    let day = 1;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
      if (day > 30) break;
      g.fillText(String(day), 52 + c * 68, 195 + r * 66);
      if (day === 23) { g.strokeStyle = '#d23b2a'; g.lineWidth = 6; g.beginPath(); g.arc(52 + c * 68, 195 + r * 66, 26, 0, 7); g.stroke(); }
      day++;
    }
    g.fillStyle = '#b3372a'; g.font = 'bold 30px Arial'; g.fillText('★ AAJ KA DIN ★', w / 2, h - 42);
  });
  const calFrame = box(1.02, 1.27, 0.05, lam({ color: 0x5d3f24 })); calFrame.position.set(1.9, 2.75, WALL_Z + 0.02); S.add(calFrame);
  const cal = boardMesh(0.95, 1.19, calTex); cal.position.set(1.9, 2.75, WALL_Z + 0.05); S.add(cal);

  // ghadi (chhoti, deewar par)
  const clockTex = textBoard(256, 256, (g, w, h) => {
    g.fillStyle = '#f7f1e2'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
    g.strokeStyle = '#3a2c1c'; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 116, 0, 7); g.stroke();
    g.lineWidth = 9; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 62); g.stroke();
    g.lineWidth = 6; g.beginPath(); g.moveTo(128, 128); g.lineTo(96, 168); g.stroke();
    g.fillStyle = '#a33327'; g.beginPath(); g.arc(128, 128, 10, 0, 7); g.fill();
  });
  const clock = new THREE.Mesh(new THREE.CircleGeometry(0.4, 24), lam({ map: clockTex }));
  clock.position.set(-0.7, 3.15, WALL_Z + 0.06); S.add(clock);

  // photo frame (chhota, deewar)
  const photoTex = textBoard(512, 400, (g, w, h) => {
    g.fillStyle = '#ffe9b8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f2a541'; g.beginPath(); g.arc(90, 80, 34, 0, 7); g.fill();
    g.fillStyle = '#b3372a'; g.beginPath(); g.moveTo(150, 210); g.lineTo(256, 130); g.lineTo(362, 210); g.fill();
    g.fillStyle = '#f3e5c3'; g.fillRect(180, 210, 152, 110);
    g.fillStyle = '#5d3f24'; g.fillRect(236, 258, 40, 62);
    g.fillStyle = '#4d7c4d'; g.fillRect(0, 320, w, 80);
  });
  const phF = box(0.68, 0.55, 0.04, lam({ color: 0x5d3f24 })); phF.position.set(0.55, 2.95, WALL_Z + 0.02); S.add(phF);
  const photo = boardMesh(0.6, 0.47, photoTex); photo.position.set(0.55, 2.95, WALL_Z + 0.05); S.add(photo);

  // table (right) — phone yahin rakha hai
  const tableG = new THREE.Group(); tableG.position.set(2.3, 0, 0.5); S.add(tableG);
  const tTop = box(1.3, 0.07, 0.8, lam({ map: FX.woodTexture(), color: 0x9a724e })); tTop.position.y = 0.76; tableG.add(tTop);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = box(0.07, 0.76, 0.07, lam({ color: 0x6d4a2e }));
    leg.position.set(sx * 0.55, 0.38, sz * 0.3); tableG.add(leg);
  }
  const book = box(0.34, 0.05, 0.26, lam({ color: 0x2e5da8 })); book.position.set(-0.32, 0.82, -0.12); book.rotation.y = 0.3; tableG.add(book);
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.11, 12), lam({ color: 0xd9d3c3 }));
  mug.position.set(0.42, 0.85, 0.18); tableG.add(mug);

  // almirah (right-back) + darwaza (back wall right)
  const alm = box(1.15, 2.3, 0.55, lam({ map: FX.woodTexture(), color: 0x7d5a38 })); alm.position.set(4.6, 1.15, -2.55); alm.rotation.y = -0.25; S.add(alm);
  const doorF = box(1.06, 2.26, 0.09, lam({ color: 0x4c3421 })); doorF.position.set(3.6, 1.13, WALL_Z + 0.03); S.add(doorF);
  const doorP = box(0.88, 2.08, 0.05, lam({ map: FX.woodTexture(), color: 0x96684a })); doorP.position.set(3.6, 1.06, WALL_Z + 0.08); S.add(doorP);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), lam({ color: 0xd9b84c })); knob.position.set(3.28, 1.05, WALL_Z + 0.14); S.add(knob);

  // rug + plant
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.9), lam({ map: tex(weave(21), 2, 2) }));
  rug.rotation.x = -Math.PI / 2; rug.rotation.z = 0.04; rug.position.set(0.3, 0.012, 0.9); S.add(rug);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.23, 0.45, 10), lam({ color: 0xa3542e }));
  pot.position.set(4.7, 0.23, -0.9); S.add(pot);
  const leafM = lam({ color: 0x3f7a3a });
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.27, 1.0 + (i % 3) * 0.22, 6), leafM);
    const a = i / 5 * Math.PI * 2;
    leaf.position.set(4.7 + Math.cos(a) * 0.16, 0.95 + (i % 3) * 0.15, -0.9 + Math.sin(a) * 0.16);
    leaf.rotation.set(Math.sin(a) * 0.35, 0, Math.cos(a) * 0.35); S.add(leaf);
  }
}

// =====================================================================
// PHONE PROP (screen textures: chat / product)
// =====================================================================
const phoneG = new THREE.Group(); scene.add(phoneG);
const chatTex = textBoard(256, 512, (g, w, h) => {
  g.fillStyle = '#ece5dd'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#075e54'; g.fillRect(0, 0, w, 64);
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(34, 32, 17, 0, 7); g.fill();
  g.fillStyle = '#075e54'; g.font = 'bold 24px Arial'; g.textAlign = 'center'; g.fillText('D', 34, 41);
  g.fillStyle = '#ffffff'; g.font = 'bold 25px Arial'; g.textAlign = 'left'; g.fillText('Dost', 62, 33);
  g.font = '17px Arial'; g.fillStyle = '#cfe8e2'; g.fillText('online', 62, 55);
  // Ramesh ka bubble (right, green)
  g.fillStyle = '#dcf8c6'; g.beginPath(); g.roundRect(96, 92, 148, 52, 10); g.fill();
  g.fillStyle = '#222'; g.font = '21px Arial'; g.fillText('Good morning', 108, 114);
  g.fillStyle = '#5aa469'; g.font = '15px Arial'; g.fillText('✓✓', 216, 136);
  // dost ka bubble (left, white) — "sab free hai bhai"
  g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(12, 168, 196, 84, 10); g.fill();
  g.fillStyle = '#222'; g.font = 'bold 24px Arial'; g.fillText('sab free', 26, 202);
  g.fillText('hai bhai', 26, 232);
  g.fillStyle = '#999'; g.font = '15px Arial'; g.fillText('7:02', 168, 244);
  // neeche input bar
  g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(10, h - 52, w - 68, 40, 20); g.fill();
  g.fillStyle = '#999'; g.font = '19px Arial'; g.fillText('Message', 26, h - 26);
  g.fillStyle = '#25d366'; g.beginPath(); g.arc(w - 26, h - 32, 19, 0, 7); g.fill();
});
const productTex = textBoard(256, 512, (g, w, h) => {
  g.fillStyle = '#1d2733'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#e8b64c'; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20);
  // chehra (Ramesh)
  g.fillStyle = '#e8b184'; g.beginPath(); g.arc(128, 150, 74, 0, 7); g.fill();
  g.fillStyle = '#1e1714'; g.beginPath(); g.arc(128, 128, 74, Math.PI * 1.02, Math.PI * 1.98); g.fill();
  g.beginPath(); g.arc(128, 108, 74, 0, 7); g.fill(); g.fillStyle = '#e8b184'; g.beginPath(); g.arc(128, 158, 66, 0, 7); g.fill();
  g.fillStyle = '#241726'; g.beginPath(); g.arc(102, 148, 7, 0, 7); g.fill(); g.beginPath(); g.arc(154, 148, 7, 0, 7); g.fill();
  g.strokeStyle = '#241726'; g.lineWidth = 6; g.beginPath(); g.arc(128, 168, 30, 0.25, Math.PI - 0.25); g.stroke();
  // kurta hint
  g.fillStyle = '#d97b29'; g.beginPath(); g.arc(128, 268, 52, Math.PI, 0); g.fill();
  // price tag
  g.save(); g.translate(128, 352); g.rotate(-0.06);
  g.fillStyle = '#e8b64c'; g.beginPath(); g.roundRect(-92, -34, 184, 68, 10); g.fill();
  g.fillStyle = '#1d2733'; g.beginPath(); g.arc(-80, 0, 7, 0, 7); g.fill();
  g.font = 'bold 30px Arial'; g.textAlign = 'center'; g.fillText('PRODUCT', 16, 11); g.restore();
  g.fillStyle = '#ffffff'; g.font = 'bold 27px Arial'; g.textAlign = 'center';
  g.fillText('RAMESH', 128, 448);
  g.fillStyle = '#9fb4c4'; g.font = '20px Arial'; g.fillText('price: your data', 128, 478);
});
{
  const body = box(0.36, 0.7, 0.045, lam({ color: 0x14181d }));
  phoneG.add(body);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.325, 0.65), bas({ map: chatTex }));
  scr.position.z = 0.026; scr.name = 'screen'; phoneG.add(scr);
}
const phoneScreen = phoneG.children.find((o) => o.name === 'screen');

// =====================================================================
// SET 2 — PETROL PUMP (din ki safed roshni)
// =====================================================================
const pumpG = new THREE.Group(); scene.add(pumpG);
let meterRedraw = null; // (rupees) => void, set inside pump build
{
  const S = pumpG;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), lam({ map: tex(stone(4, 30, 10, 78), 6, 6), color: 0xcfd4d2 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, 4); S.add(ground);
  // peeche ki building strip (gehrai ke liye)
  const bldg = box(18, 1.7, 0.3, lam({ color: 0xd8cfc0 })); bldg.position.set(0, 0.85, -5.2); S.add(bldg);
  for (let i = 0; i < 6; i++) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), lam({ color: 0x5a6a72 }));
    win.position.set(-6.5 + i * 2.6, 1.0, -5.03); S.add(win);
  }
  const bldg2 = box(10, 2.6, 0.3, lam({ color: 0xcac0ae })); bldg2.position.set(-8.5, 1.3, -3.4); bldg2.rotation.y = 0.5; S.add(bldg2);

  // canopy: khambhe + chhat + bada board
  const pillarM = lam({ color: 0xb3372a });
  for (const px of [-2.4, 3.4]) {
    const pil = box(0.2, 3.5, 0.2, pillarM); pil.position.set(px, 1.75, -1.2); S.add(pil);
    const pil2 = box(0.2, 3.5, 0.2, pillarM); pil2.position.set(px, 1.75, 0.6); S.add(pil2);
  }
  const roof = box(7.0, 0.16, 3.0, lam({ color: 0xe8e2d4 })); roof.position.set(0.5, 3.56, -0.3); S.add(roof);
  const pumpBoardTex = textBoard(1024, 160, (g, w, h) => {
    g.fillStyle = '#b3372a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(86, 80, 44, 0, 7); g.fill();
    g.fillStyle = '#b3372a'; g.beginPath(); g.moveTo(86, 48); g.quadraticCurveTo(112, 88, 86, 108); g.quadraticCurveTo(60, 88, 86, 48); g.fill();
    g.font = 'bold 96px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#ffffff'; g.fillText('PETROL  PUMP', w / 2 + 40, h / 2 + 4);
  });
  const pBoard = boardMesh(5.2, 0.92, pumpBoardTex, true); pBoard.position.set(0.35, 3.02, 1.22); S.add(pBoard);
  const pBoardBack = box(5.3, 1.0, 0.06, lam({ color: 0x8e2a20 })); pBoardBack.position.set(0.35, 3.02, 1.18); S.add(pBoardBack);

  // island slab
  const island = box(3.0, 0.12, 1.9, lam({ color: 0xb9beb9 })); island.position.set(1.1, 0.06, -0.7); S.add(island);

  // pump machine
  const machG = new THREE.Group(); machG.position.set(1.1, 0.12, -0.8); S.add(machG);
  const mBody = box(0.74, 1.5, 0.5, lam({ color: 0xf0ece2 })); mBody.position.y = 0.75; machG.add(mBody);
  const mStripe = box(0.76, 0.3, 0.52, lam({ color: 0xb3372a })); mStripe.position.y = 0.32; machG.add(mStripe);
  const mTop = box(0.78, 0.1, 0.54, lam({ color: 0xb3372a })); mTop.position.y = 1.53; machG.add(mTop);
  const mLabelTex = textBoard(256, 64, (g, w, h) => {
    g.fillStyle = '#274b73'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.font = 'bold 38px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('PETROL', w / 2, h / 2 + 2);
  });
  const mLabel = boardMesh(0.56, 0.14, mLabelTex, true); mLabel.position.set(0, 1.36, 0.26); machG.add(mLabel);
  // meter (dynamic canvas — ₹ ginati)
  const meterCanvas = document.createElement('canvas'); meterCanvas.width = 256; meterCanvas.height = 176;
  const meterTex = new THREE.CanvasTexture(meterCanvas); meterTex.colorSpace = THREE.SRGBColorSpace;
  const drawMeter = (rupees) => {
    const g = meterCanvas.getContext('2d');
    g.fillStyle = '#10151c'; g.fillRect(0, 0, 256, 176);
    g.fillStyle = '#5a6a72'; g.font = 'bold 17px Arial'; g.textAlign = 'left';
    g.fillText('AMOUNT ₹', 10, 24);
    g.fillStyle = '#8ef0b2'; g.font = 'bold 52px monospace'; g.textAlign = 'right';
    g.fillText(rupees.toFixed(2), 246, 78);
    g.fillStyle = '#5a6a72'; g.font = 'bold 17px Arial'; g.textAlign = 'left';
    g.fillText('LITRE', 10, 112);
    g.fillStyle = '#f5d76a'; g.font = 'bold 40px monospace'; g.textAlign = 'right';
    g.fillText((rupees / 106.48).toFixed(2) + ' L', 246, 156);
    meterTex.needsUpdate = true;
  };
  drawMeter(0); meterRedraw = drawMeter;
  const meter = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.37), bas({ map: meterTex }));
  meter.position.set(0, 1.06, 0.257); machG.add(meter);
  // keypad dots
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const k = box(0.07, 0.05, 0.02, lam({ color: 0x39434c }));
    k.position.set(-0.14 + c * 0.14, 0.62 - r * 0.11, 0.26); machG.add(k);
  }
  // hose (machine ke side se loop)
  const hoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.48, 1.25, -0.8), new THREE.Vector3(1.86, 0.95, -0.62),
    new THREE.Vector3(1.9, 0.42, -0.5), new THREE.Vector3(1.66, 0.28, -0.42),
    new THREE.Vector3(1.52, 0.62, -0.48), new THREE.Vector3(1.5, 0.98, -0.52),
  ]);
  const hose = new THREE.Mesh(new THREE.TubeGeometry(hoseCurve, 32, 0.032, 8), lam({ color: 0x22262b }));
  S.add(hose);
  const nozzle = box(0.07, 0.3, 0.09, lam({ color: 0xb3372a })); nozzle.position.set(1.5, 1.05, -0.52); nozzle.rotation.z = 0.15; S.add(nozzle);

  // props: barrel, cone, cans
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.92, 14), lam({ color: 0x2e5da8 }));
  barrel.position.set(-2.7, 0.46, -1.3); S.add(barrel);
  const barrel2 = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.92, 14), lam({ color: 0x707880 }));
  barrel2.position.set(-3.35, 0.46, -1.15); S.add(barrel2);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.23, 0.58, 12), lam({ color: 0xe06a1e }));
  cone.position.set(-1.7, 0.29, 0.9); S.add(cone);
  const coneBase = box(0.44, 0.04, 0.44, lam({ color: 0xc4531a })); coneBase.position.set(-1.7, 0.02, 0.9); S.add(coneBase);
  for (let i = 0; i < 3; i++) {
    const can = box(0.22, 0.3, 0.16, lam({ color: [0xd9a441, 0x3f7a4a, 0xb3372a][i] }));
    can.position.set(2.9 + (i % 2) * 0.26, 0.15 + Math.floor(i / 2) * 0.31, -1.5); S.add(can);
  }
}

// =====================================================================
// SET 3 — GHAR KA KONA (bottle naap)
// =====================================================================
const homeG = new THREE.Group(); scene.add(homeG);
let funnelMesh;
const BOTTLE = { x: 0, baseY: 0.99, z: -0.05 };
const SCALE_Y0 = 1.043, SCALE_Y1 = 1.537; // 0 ml aur 1000 ml ki unchai (world y)
{
  const S = homeG;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), lam({ map: tex(planks(9), 5, 5), color: 0xd8bd96 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 3); S.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(24, 7), lam({ map: tex(plaster(15, 36), 4, 1) }));
  wall.position.set(0, 3.5, -2.6); S.add(wall);
  const side = new THREE.Mesh(new THREE.PlaneGeometry(16, 7), lam({ map: tex(plaster(17, 34), 3, 1), color: 0xdcc39c }));
  side.position.set(-3.4, 3.5, 1); side.rotation.y = Math.PI / 2; S.add(side);
  const skirt = box(24, 0.26, 0.06, lam({ color: 0x6d4a2e })); skirt.position.set(0, 0.13, -2.57); S.add(skirt);

  // shelf + dabbe (background bhara)
  const shelf = box(1.9, 0.06, 0.42, lam({ map: FX.woodTexture(), color: 0x8a6844 })); shelf.position.set(1.15, 2.25, -2.36); S.add(shelf);
  const dabbaCols = [0xc4502e, 0x3f7a4a, 0xd9a441, 0x2e5da8];
  dabbaCols.forEach((c, i) => {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.34, 12), lam({ color: 0xd9d3c3 }));
    d.position.set(0.45 + i * 0.44, 2.45, -2.36); S.add(d);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 12), lam({ color: c }));
    lid.position.set(0.45 + i * 0.44, 2.64, -2.36); S.add(lid);
  });
  const shelf2 = box(1.4, 0.06, 0.4, lam({ map: FX.woodTexture(), color: 0x8a6844 })); shelf2.position.set(-1.7, 2.5, -2.37); S.add(shelf2);
  for (let i = 0; i < 3; i++) {
    const bk = box(0.16, 0.5, 0.3, lam({ color: [0xb3372a, 0x2e5da8, 0x3f7a4a][i] }));
    bk.position.set(-2.15 + i * 0.42, 2.78, -2.37); bk.rotation.z = i === 2 ? -0.14 : 0; S.add(bk);
  }
  // chhoti khidki (shaam-dhalti garam roshni ka hint)
  const winG = new THREE.Group(); winG.position.set(-2.2, 2.9, -2.56); S.add(winG);
  winG.add(box(1.1, 1.3, 0.08, lam({ color: 0x5d3f24 })));
  const wglass = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 1.12), FX.glassMat(0xffb45e, 0.9)); wglass.position.z = 0.05; winG.add(wglass);

  // table
  const tTop = box(1.8, 0.08, 1.0, lam({ map: FX.woodTexture(), color: 0x8a5f36 })); tTop.position.set(0, 0.95, -0.2); S.add(tTop);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = box(0.08, 0.95, 0.08, lam({ color: 0x5d3f24 }));
    leg.position.set(sx * 0.78, 0.475, -0.2 + sz * 0.4); S.add(leg);
  }
  // steel jug + glass (props)
  const jug = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.09, 0.18, 12), lam({ color: 0xb9c0c6 }));
  jug.position.set(-0.6, 1.08, -0.4); S.add(jug);
  const tumbler = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.11, 10), lam({ color: 0xd8dee2 }));
  tumbler.position.set(0.46, 1.045, -0.38); S.add(tumbler);
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.03, 14), lam({ color: 0xe5ddca }));
  plate.position.set(-0.38, 1.005, 0.08); S.add(plate);

  // ---- BOTTLE (hero prop): glass + tel (liquid) + scale label ----
  const bG = new THREE.Group(); bG.position.set(BOTTLE.x, BOTTLE.baseY, BOTTLE.z); S.add(bG);
  const liquidTop = SCALE_Y0 + 0.94 * (SCALE_Y1 - SCALE_Y0); // 940 ml line ki unchai
  const liquidH = liquidTop - (BOTTLE.baseY + 0.03);
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.138, 0.148, liquidH, 20),
    lam({ color: 0xe89b2e, emissive: 0x6b3d08 }));
  liquid.position.y = 0.03 + liquidH / 2; liquid.renderOrder = 1; bG.add(liquid);
  const glassB = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, 0.62, 20),
    new THREE.MeshLambertMaterial({ color: 0xd6efe8, transparent: true, opacity: 0.26, depthWrite: false }));
  glassB.position.y = 0.31; glassB.renderOrder = 2; bG.add(glassB);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.1, 0.12, 14),
    new THREE.MeshLambertMaterial({ color: 0xd6efe8, transparent: true, opacity: 0.3, depthWrite: false }));
  neck.position.y = 0.67; neck.renderOrder = 2; bG.add(neck);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.05, 12), lam({ color: 0xb3372a }));
  cap.position.set(0.3, 0.025, 0.22); S.add(cap); cap.position.y = BOTTLE.baseY + 0.025; cap.position.x = BOTTLE.x - 0.34; cap.position.z = BOTTLE.z + 0.3;
  // scale label — bottle ke saamne, nishan saaf
  const scaleTex = textBoard(320, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const yOf = (ml) => h - 30 - (ml / 1000) * (h - 60);
    g.strokeStyle = '#2c2620'; g.fillStyle = '#2c2620'; g.textAlign = 'left'; g.textBaseline = 'middle';
    for (let ml = 100; ml < 1000; ml += 100) {
      const y = yOf(ml), big = ml % 500 === 0;
      g.lineWidth = big ? 5 : 3; g.beginPath(); g.moveTo(18, y); g.lineTo(big ? 74 : 56, y); g.stroke();
      g.font = 'bold 25px Arial'; g.fillText(String(ml), 86, y);
    }
    // 1 LITRE — sabse upar
    g.lineWidth = 7; g.beginPath(); g.moveTo(14, yOf(1000)); g.lineTo(96, yOf(1000)); g.stroke();
    g.font = 'bold 36px Arial'; g.fillStyle = '#173f2c'; g.fillText('1 LITRE', 106, yOf(1000));
    // 940 ml — LAAL line + bada text (WOW)
    const y9 = yOf(940);
    g.strokeStyle = '#d21f14'; g.lineWidth = 9; g.beginPath(); g.moveTo(10, y9); g.lineTo(112, y9); g.stroke();
    g.fillStyle = '#d21f14'; g.font = 'bold 46px Arial'; g.fillText('940 ml', 120, y9);
  });
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.56),
    new THREE.MeshBasicMaterial({ map: scaleTex, transparent: true }));
  label.position.set(BOTTLE.x, (SCALE_Y0 + SCALE_Y1) / 2, BOTTLE.z + 0.178); label.renderOrder = 3; S.add(label);
  // funnel (sirf s11 me dikhega)
  funnelMesh = new THREE.Group();
  const fCone = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.13, 14, 1, true), lam({ color: 0xc8ccd0, side: THREE.DoubleSide }));
  fCone.rotation.x = Math.PI; fCone.position.y = 0.1; funnelMesh.add(fCone);
  const fTube = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.1, 8), lam({ color: 0xc8ccd0 }));
  fTube.position.y = 0.0; funnelMesh.add(fTube);
  funnelMesh.position.set(BOTTLE.x, BOTTLE.baseY + 0.72, BOTTLE.z); S.add(funnelMesh);
}

// =====================================================================
// HOME ADDITIONS — loan kagaz, raat ke bikhre kagaz, chaand
// =====================================================================
const loanTex = textBoard(512, 640, (g, w, h) => {
  g.fillStyle = '#f8f3e4'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#8a7a5f'; g.lineWidth = 4; g.strokeRect(14, 14, w - 28, h - 28);
  g.fillStyle = '#274b73'; g.font = 'bold 40px Arial'; g.textAlign = 'center';
  g.fillText('HOME LOAN', w / 2, 74);
  g.fillStyle = '#8a7a5f'; g.font = '22px Arial'; g.fillText('— bank ka hisaab kagaz —', w / 2, 112);
  g.fillStyle = '#3a2c1c'; g.font = 'bold 30px Arial'; g.textAlign = 'left';
  g.fillText('LOAN LIYA:', 44, 190);
  g.font = 'bold 64px Arial'; g.fillStyle = '#173f2c';
  g.fillText('₹50,00,000', 44, 262);
  g.strokeStyle = '#c9bda3'; g.lineWidth = 3; g.beginPath(); g.moveTo(44, 310); g.lineTo(w - 44, 310); g.stroke();
  g.fillStyle = '#3a2c1c'; g.font = 'bold 30px Arial';
  g.fillText('KUL BYAAJ:', 44, 372);
  g.font = 'bold 64px Arial'; g.fillStyle = '#b3231b';
  g.fillText('₹95,00,000', 44, 444);
  g.fillStyle = '#6a5a44'; g.font = '24px Arial';
  g.fillText('EMI  ₹40,231  ×  360 mahine', 44, 516);
  g.fillText('kul chukaya:  ₹1,44,83,000', 44, 556);
  g.fillStyle = '#b3231b'; g.font = 'bold 25px Arial';
  g.fillText('byaaj = loan ka lagbhag dugna!', 44, 600);
});
const loanPaper = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.78), lam({ map: loanTex, side: THREE.DoubleSide }));
loanPaper.position.set(0.52, 1.005, 0.02); loanPaper.rotation.x = -1.52; homeG.add(loanPaper);
// raat ke bikhre kagaz (sirf night shots me)
const nightPapers = new THREE.Group(); homeG.add(nightPapers);
{
  const mkPaper = (texP, wP, hP, x, z, ry) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(wP, hP), lam({ map: texP, side: THREE.DoubleSide }));
    p.position.set(x, 1.005, z); p.rotation.set(-1.32, 0, ry); nightPapers.add(p); return p;
  };
  const petrolBillTex = textBoard(256, 340, (g, w, h) => {
    g.fillStyle = '#f8f3e4'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b3372a'; g.font = 'bold 26px Arial'; g.textAlign = 'center'; g.fillText('PETROL', w / 2, 44);
    g.fillStyle = '#3a2c1c'; g.font = '22px Arial';
    g.fillText('₹1000.00', w / 2, 110); g.fillText('9.39 L', w / 2, 150);
    g.fillStyle = '#b3231b'; g.font = 'bold 23px Arial'; g.fillText('naapa: 940 ml', w / 2, 220);
    g.fillStyle = '#8a7a5f'; g.font = '18px Arial'; g.fillText('dhanyavaad', w / 2, 290);
  });
  mkPaper(petrolBillTex, 0.3, 0.4, 0.48, 0.08, 0.4);
  mkPaper(loanTex, 0.34, 0.43, -0.52, 0.12, -0.35);
}
// chaand (home khidki ke saamne, sirf night)
const moonG = new THREE.Group(); homeG.add(moonG);
{
  const moon = new THREE.Mesh(new THREE.CircleGeometry(0.17, 24), bas({ color: 0xf4f7ff }));
  moon.position.set(-2.2, 3.08, -2.5); moonG.add(moon);
  const glowC = document.createElement('canvas'); glowC.width = glowC.height = 128;
  const gg = glowC.getContext('2d'); const gr = gg.createRadialGradient(64, 64, 4, 64, 64, 62);
  gr.addColorStop(0, 'rgba(200,220,255,0.55)'); gr.addColorStop(1, 'rgba(200,220,255,0)');
  gg.fillStyle = gr; gg.fillRect(0, 0, 128, 128);
  const glowT = new THREE.CanvasTexture(glowC);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ map: glowT, transparent: true, depthWrite: false }));
  glow.position.set(-2.2, 3.08, -2.47); moonG.add(glow);
}
const moonLight = new THREE.PointLight(0xaac4ff, 0, 9); moonLight.position.set(-1.9, 2.6, -1.6); homeG.add(moonLight);

// =====================================================================
// SET 4 — TOLL PLAZA
// =====================================================================
const tollG = new THREE.Group(); scene.add(tollG);
let barrierArm;
const drawTollScreen = (two) => (g, w, h) => {
  g.fillStyle = '#f2f4f6'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#7a1fa2'; g.fillRect(0, 0, w, 62);
  g.fillStyle = '#ffffff'; g.font = 'bold 26px Arial'; g.textAlign = 'left'; g.fillText('FASTag', 16, 40);
  g.font = '17px Arial'; g.fillStyle = '#e6d5f0'; g.fillText('bank suchna', 130, 40);
  const msg = (y, title, sub, red) => {
    g.fillStyle = '#ffffff'; g.strokeStyle = '#d5dbe0'; g.lineWidth = 2;
    g.beginPath(); g.roundRect(12, y, w - 24, 108, 10); g.fill(); g.stroke();
    g.fillStyle = red ? '#b3231b' : '#274b73'; g.font = 'bold 23px Arial'; g.fillText(title, 26, y + 36);
    g.fillStyle = '#3a2c1c'; g.font = '21px Arial'; g.fillText(sub, 26, y + 68);
    g.fillStyle = '#8a95a0'; g.font = '16px Arial'; g.fillText('abhi-abhi', 26, y + 94);
  };
  msg(88, '₹ kata gaya', 'Toll Plaza — FASTag', false);
  if (two) msg(216, '₹ PHIR kata!', 'wahi toll, dobara', true);
  g.fillStyle = '#8a95a0'; g.font = '18px Arial'; g.textAlign = 'center';
  g.fillText(two ? 'do baar katauti!' : 'ek katauti', w / 2, h - 24);
};
const tollTexA = textBoard(256, 512, drawTollScreen(false));
const tollTexB = textBoard(256, 512, drawTollScreen(true));
{
  const S = tollG;
  const road = new THREE.Mesh(new THREE.PlaneGeometry(34, 34), lam({ map: tex(stone(6, 26, 8, 60), 6, 6), color: 0x9aa0a3 }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0, 4); S.add(road);
  for (const lx of [-1.55, 1.55]) {
    const line = box(0.09, 0.012, 16, lam({ color: 0xf5f2e8 })); line.position.set(lx, 0.008, 1); S.add(line);
  }
  const strip = box(20, 1.6, 0.3, lam({ color: 0xd8cfc0 })); strip.position.set(-3, 0.8, -5.4); S.add(strip);
  for (let i = 0; i < 4; i++) {
    const tree = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.7, 8), lam({ color: 0x3f7a3a }));
    tree.position.set(-6.5 + i * 4.6, 1.5, -4.6); S.add(tree);
    const trunk = box(0.14, 0.7, 0.14, lam({ color: 0x6d4a2e })); trunk.position.set(-6.5 + i * 4.6, 0.35, -4.6); S.add(trunk);
  }
  // gantry + TOLL PLAZA board
  const pilM = lam({ color: 0x707880 });
  for (const px of [-2.7, 2.7]) { const p = box(0.26, 3.6, 0.26, pilM); p.position.set(px, 1.8, -1.6); S.add(p); }
  const beam = box(5.9, 0.42, 0.3, pilM); beam.position.set(0, 3.62, -1.6); S.add(beam);
  const tollBoardTex = textBoard(1024, 176, (g, w, h) => {
    g.fillStyle = '#274b73'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.font = 'bold 104px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('TOLL PLAZA', w / 2, h / 2 - 14);
    g.fillStyle = '#f5d76a'; g.font = 'bold 34px Arial'; g.fillText('— FASTag LANE —', w / 2, h - 30);
  });
  const tBoard = boardMesh(5.3, 0.92, tollBoardTex, true); tBoard.position.set(0, 2.98, -1.44); S.add(tBoard);
  const tBack = box(5.4, 1.0, 0.06, lam({ color: 0x1d3a5c })); tBack.position.set(0, 2.98, -1.48); S.add(tBack);
  // booth
  const booth = box(1.15, 2.3, 1.15, lam({ color: 0xe8e2d4 })); booth.position.set(2.35, 1.15, -1.0); S.add(booth);
  const bWin = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.7), lam({ color: 0x39434c }));
  bWin.position.set(1.76, 1.5, -1.0); bWin.rotation.y = -Math.PI / 2; S.add(bWin);
  const bRoof = box(1.4, 0.1, 1.4, lam({ color: 0xb3372a })); bRoof.position.set(2.35, 2.36, -1.0); S.add(bRoof);
  const faTex = textBoard(256, 84, (g, w, h) => {
    g.fillStyle = '#f5d76a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3a2c1c'; g.font = 'bold 46px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('FASTag', w / 2, h / 2 + 2);
  });
  const fa = boardMesh(0.92, 0.3, faTex, true); fa.position.set(2.35, 1.98, -0.41); S.add(fa);
  // barrier (pivot — uthta hai)
  barrierArm = new THREE.Group(); barrierArm.position.set(1.6, 0.98, -1.6); S.add(barrierArm);
  const stripeTex = textBoard(512, 32, (g, w, h) => {
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#f2f2f2' : '#d23b2a'; g.fillRect(i * 64, 0, 64, h); }
  });
  const armMesh = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.13, 0.13), lam({ map: stripeTex }));
  armMesh.position.set(-1.65, 0, 0); barrierArm.add(armMesh);
  const bBase = box(0.34, 0.98, 0.34, lam({ color: 0x39434c })); bBase.position.set(1.6, 0.49, -1.6); S.add(bBase);
  // car (laal) — Ramesh ki gaadi
  const carG2 = new THREE.Group(); carG2.position.set(-0.7, 0, -0.85); S.add(carG2);
  const cBody = box(1.7, 0.52, 3.2, lam({ color: 0xc23b2e })); cBody.position.y = 0.56; carG2.add(cBody);
  const cCab = box(1.48, 0.5, 1.66, lam({ color: 0x39434c })); cCab.position.set(0, 1.06, -0.12); carG2.add(cCab);
  const cCabTop = box(1.54, 0.07, 1.74, lam({ color: 0xa32f24 })); cCabTop.position.set(0, 1.34, -0.12); carG2.add(cCabTop);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.18, 14), lam({ color: 0x1c1f24 }));
    wh.rotation.z = Math.PI / 2; wh.position.set(sx * 0.82, 0.33, sz * 1.05); carG2.add(wh);
  }
  for (const sx of [-1, 1]) {
    const hl = new THREE.Mesh(new THREE.CircleGeometry(0.09, 10), bas({ color: 0xfff2b0 }));
    hl.position.set(sx * 0.5, 0.62, 1.61); carG2.add(hl);
  }
}

// =====================================================================
// SET 5 — BURGER JOINT
// =====================================================================
const burgerG = new THREE.Group(); scene.add(burgerG);
{
  const S = burgerG;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), lam({ map: tex(stone(8, 34, 12, 96), 5, 5), color: 0xe3d5b8 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 3); S.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(26, 7), lam({ map: tex(plaster(23, 40), 4, 1), color: 0xf0dcae }));
  wall.position.set(0, 3.5, -3.1); S.add(wall);
  const sideR = new THREE.Mesh(new THREE.PlaneGeometry(18, 7), lam({ map: tex(plaster(29, 38), 3, 1), color: 0xe8d3a4 }));
  sideR.position.set(3.4, 3.5, 0.5); sideR.rotation.y = -Math.PI / 2; S.add(sideR);
  // name board + menu board
  const nameTex = textBoard(1024, 160, (g, w, h) => {
    g.fillStyle = '#b3372a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f5d76a'; g.beginPath(); g.arc(84, 80, 46, 0, 7); g.fill();
    g.fillStyle = '#8a5a20'; g.beginPath(); g.arc(84, 74, 30, Math.PI, 0); g.fill();
    g.fillStyle = '#5d3f24'; g.fillRect(56, 76, 56, 8);
    g.fillStyle = '#f5d76a'; g.beginPath(); g.arc(84, 92, 30, 0, Math.PI); g.fill();
    g.fillStyle = '#ffffff'; g.font = 'bold 92px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('BURGER BHAI', w / 2 + 40, h / 2 + 4);
  });
  const nameB = boardMesh(3.7, 0.58, nameTex, true); nameB.position.set(0, 3.42, -3.04); S.add(nameB);
  const menuTex = textBoard(1024, 300, (g, w, h) => {
    g.fillStyle = '#23272e'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#f5d76a'; g.lineWidth = 5; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#f5d76a'; g.font = 'bold 44px Arial'; g.textAlign = 'center'; g.fillText('— MENU —', w / 2, 58);
    g.font = 'bold 42px Arial'; g.fillStyle = '#ffffff'; g.textAlign = 'left';
    g.fillText('BURGER', 60, 138); g.fillText('FRIES', 60, 208); g.fillText('SHAKE', 540, 208);
    g.fillText('COMBO', 540, 138);
    g.fillStyle = '#f5d76a'; g.textAlign = 'right';
    g.fillText('₹199', 470, 138); g.fillText('₹99', 470, 208); g.fillText('₹149', 950, 208); g.fillText('₹299', 950, 138);
  });
  const menuB = boardMesh(4.5, 1.32, menuTex, true); menuB.position.set(0, 2.5, -3.03); S.add(menuB);
  // counter
  const counter = box(5.2, 1.0, 0.85, lam({ color: 0xd9a441 })); counter.position.set(0, 0.5, -0.95); S.add(counter);
  const cStripe = box(5.24, 0.22, 0.89, lam({ color: 0xb3372a })); cStripe.position.set(0, 0.82, -0.95); S.add(cStripe);
  const cTop = box(5.45, 0.07, 1.05, lam({ map: FX.woodTexture(), color: 0x9a724e })); cTop.position.set(0, 1.04, -0.95); S.add(cTop);
  // counter props: tray, cups, burger
  const tray = box(0.55, 0.03, 0.4, lam({ color: 0xb3372a })); tray.position.set(0.55, 1.09, -0.8); S.add(tray);
  const bunB = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 12), lam({ color: 0xd9a441 })); bunB.position.set(0.45, 1.13, -0.82); S.add(bunB);
  const patty = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.045, 12), lam({ color: 0x6d4226 })); patty.position.set(0.45, 1.18, -0.82); S.add(patty);
  const bunT = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: 0xe3ac4e })); bunT.position.set(0.45, 1.2, -0.82); S.add(bunT);
  for (let i = 0; i < 2; i++) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.17, 10), lam({ color: i ? 0xf2f2f2 : 0xb3372a }));
    cup.position.set(-0.5 + i * 0.35, 1.16, -1.05); S.add(cup);
  }
  const till = box(0.5, 0.34, 0.42, lam({ color: 0x39434c })); till.position.set(-1.7, 1.24, -1.0); S.add(till);
  // chhoti table + kursi (left)
  const tT = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 14), lam({ map: FX.woodTexture(), color: 0x9a724e }));
  tT.position.set(-2.2, 0.74, 0.6); S.add(tT);
  const tL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.74, 8), lam({ color: 0x5d3f24 })); tL.position.set(-2.2, 0.37, 0.6); S.add(tL);
  for (const a of [0.4, 2.6]) {
    const ch = box(0.44, 0.5, 0.06, lam({ color: 0xb3372a }));
    ch.position.set(-2.2 + Math.cos(a) * 0.62, 0.55, 0.6 + Math.sin(a) * 0.62); ch.rotation.y = -a + Math.PI / 2; S.add(ch);
  }
  // KIRAYA poster (right wall) — hisaab wala WOW
  const kirTex = textBoard(512, 640, (g, w, h) => {
    g.fillStyle = '#f7f1e2'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#8a7a5f'; g.lineWidth = 4; g.strokeRect(12, 12, w - 24, h - 24);
    // badi building
    g.fillStyle = '#9db3c8'; g.fillRect(166, 40, 180, 300);
    g.fillStyle = '#7286a0'; g.fillRect(166, 40, 180, 26);
    g.fillStyle = '#f5d76a';
    for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) g.fillRect(184 + c * 42, 84 + r * 42, 24, 26);
    // neeche chhoti dukaanen (awning wali kataar)
    const cols = ['#b3372a', '#2e5da8', '#3f7a4a', '#d9a441', '#7a1fa2'];
    cols.forEach((c, i) => {
      const x = 36 + i * 92;
      g.fillStyle = '#e8dfc8'; g.fillRect(x, 356, 80, 74);
      g.fillStyle = c; g.beginPath(); g.moveTo(x - 4, 356); g.lineTo(x + 84, 356); g.lineTo(x + 70, 332); g.lineTo(x + 10, 332); g.fill();
      g.fillStyle = '#5d3f24'; g.fillRect(x + 26, 384, 28, 46);
    });
    g.fillStyle = '#3a2c1c'; g.font = 'bold 37px Arial'; g.textAlign = 'center';
    g.fillText('har dukaan se KIRAYA', w / 2, 478);
    g.fillStyle = '#8a7a5f'; g.font = '24px Arial'; g.fillText('ek saal ki kul vasuli', w / 2, 516);
    g.fillStyle = '#b3231b'; g.font = 'bold 55px Arial'; g.fillText('₹88,000 CRORE', w / 2, 578);
  });
  const kirFrame = box(0.06, 2.24, 1.8, lam({ color: 0x5d3f24 })); kirFrame.position.set(3.36, 1.95, -0.6); S.add(kirFrame);
  const kir = boardMesh(1.7, 2.13, kirTex); kir.position.set(3.32, 1.95, -0.6); kir.rotation.y = -Math.PI / 2; S.add(kir);
}

// =====================================================================
// SET 6 — CINEMA HALL
// =====================================================================
const cinemaG = new THREE.Group(); scene.add(cinemaG);
let billMesh, cinemaLight;
{
  const S = cinemaG;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), lam({ color: 0x2a2438 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 2); S.add(floor);
  const wallB = new THREE.Mesh(new THREE.PlaneGeometry(30, 9), lam({ color: 0x191423 }));
  wallB.position.set(0, 4.5, -6.4); S.add(wallB);
  for (const sx of [-1, 1]) {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(24, 9), lam({ color: 0x1e1830 }));
    sw.position.set(sx * 5.4, 4.5, -1); sw.rotation.y = -sx * Math.PI / 2; S.add(sw);
    const stripL = box(0.06, 0.05, 14, bas({ color: 0xd9a441 })); stripL.position.set(sx * 5.32, 0.5, -1); S.add(stripL);
  }
  // badi screen — film chal rahi hai (sunset scene)
  const scrTex = textBoard(1024, 460, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#3a2a5e'); gr.addColorStop(0.55, '#c65a8a'); gr.addColorStop(0.8, '#f59e4c'); gr.addColorStop(1, '#7a3a3a');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffd98a'; g.beginPath(); g.arc(512, 268, 62, 0, 7); g.fill();
    g.fillStyle = '#4a2a52'; g.beginPath(); g.moveTo(0, 340); g.lineTo(240, 210); g.lineTo(470, 340); g.fill();
    g.beginPath(); g.moveTo(360, 340); g.lineTo(640, 180); g.lineTo(900, 340); g.fill();
    g.fillStyle = '#2c1c38'; g.beginPath(); g.moveTo(700, 340); g.lineTo(880, 240); g.lineTo(1024, 330); g.lineTo(1024, 460); g.lineTo(0, 460); g.lineTo(0, 340); g.fill();
    g.fillStyle = '#ffe9b8'; g.font = 'bold 30px Arial'; g.textAlign = 'center'; g.fillText('★ PREMIERE ★', w / 2, 52);
  });
  const scrFrame = box(8.1, 3.9, 0.15, lam({ color: 0x0c0a14 })); scrFrame.position.set(0, 2.7, -6.05); S.add(scrFrame);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(7.7, 3.5), bas({ map: scrTex }));
  scr.position.set(0, 2.7, -5.95); S.add(scr);
  cinemaLight = new THREE.PointLight(0xffc9a0, 0.7, 14); cinemaLight.position.set(0, 2.5, -4.2); S.add(cinemaLight);
  // seat rows (maroon) — peeche wali rows camera ki taraf
  const seatM = lam({ color: 0x7a1f2b }), seatD = lam({ color: 0x5d1620 });
  for (const rz of [-1.7, -0.35, 1.0]) {
    for (let i = 0; i < 5; i++) {
      const x = -1.7 + i * 0.85;
      if (rz === 1.0 && i === 3) continue; // Ramesh front row me baitha hai
      const back = box(0.66, 0.78, 0.16, seatM); back.position.set(x, 0.62, rz); S.add(back);
      const cush = box(0.66, 0.14, 0.55, seatD); cush.position.set(x, 0.3, rz + 0.3); S.add(cush);
    }
  }
  // Ramesh ki seat ka back (uske peeche) + armrest par popcorn tub
  const rBack = box(0.7, 0.8, 0.16, seatM); rBack.position.set(1.1, 0.6, 0.72); S.add(rBack);
  const arm = box(0.14, 0.3, 0.6, seatD); arm.position.set(0.42, 0.32, 1.3); S.add(arm);
  const tubTex = textBoard(128, 128, (g, w, h) => {
    for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#f2f2f2' : '#d23b2a'; g.fillRect(i * 22, 0, 22, h); }
    g.fillStyle = '#3a2c1c'; g.font = 'bold 21px Arial'; g.textAlign = 'center'; g.fillText('POP', 64, 74);
  });
  const tub = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.125, 0.32, 14), lam({ map: tubTex }));
  tub.position.set(0.42, 0.63, 1.3); S.add(tub);
  for (let i = 0; i < 7; i++) {
    const pc = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), lam({ color: 0xf7e3ae }));
    const a = i / 7 * Math.PI * 2;
    pc.position.set(0.42 + Math.cos(a) * 0.09, 0.8, 1.3 + Math.sin(a) * 0.09); S.add(pc);
  }
  // BILL (sirf s20) — ticket se mehnga popcorn
  const billTex = textBoard(256, 384, (g, w, h) => {
    g.fillStyle = '#fbf8ef'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3a2c1c'; g.font = 'bold 27px Arial'; g.textAlign = 'center'; g.fillText('PVR CINEMAS', w / 2, 40);
    g.font = '16px Arial'; g.fillStyle = '#8a7a5f'; g.fillText('- - - - - - - - - - - - -', w / 2, 66);
    g.font = '22px Arial'; g.fillStyle = '#3a2c1c'; g.textAlign = 'left';
    g.fillText('TICKET', 18, 116); g.fillText('POPCORN (L)', 18, 176); g.fillText('COKE', 18, 224);
    g.textAlign = 'right'; g.fillText('₹300', w - 18, 116); g.fillText('₹150', w - 18, 224);
    g.fillStyle = '#b3231b'; g.font = 'bold 26px Arial'; g.fillText('₹450', w - 18, 176);
    g.strokeStyle = '#b3231b'; g.lineWidth = 3; g.strokeRect(10, 146, w - 20, 48);
    g.fillStyle = '#3a2c1c'; g.font = '22px Arial'; g.textAlign = 'left'; g.fillText('TOTAL', 18, 292);
    g.textAlign = 'right'; g.font = 'bold 24px Arial'; g.fillText('₹900', w - 18, 292);
    g.fillStyle = '#8a7a5f'; g.font = '15px Arial'; g.textAlign = 'center'; g.fillText('dhanyavaad!', w / 2, 348);
  });
  billMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.57), bas({ map: billTex, side: THREE.DoubleSide }));
  billMesh.position.set(0.3, 1.04, 1.55); billMesh.rotation.set(-0.22, 0.1, 0.04); S.add(billMesh);
}

// =====================================================================
// SET 7 — CAR (Ola) — andar ka mahaul, khidkiyon se beetta sheher
// =====================================================================
const carG = new THREE.Group(); scene.add(carG);
let cityTexC;
{
  const S = carG;
  cityTexC = textBoard(1024, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#7a86b8'); gr.addColorStop(0.6, '#d98a5e'); gr.addColorStop(1, '#5e4a3a');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const bw = [90, 130, 70, 150, 100, 80, 140, 95, 120];
    let bx = 0;
    bw.forEach((wd, i) => {
      const bh = 90 + (i * 37) % 90;
      g.fillStyle = '#2c3040'; g.fillRect(bx, h - bh, wd, bh);
      g.fillStyle = '#f5d76a';
      for (let r = 0; r < Math.floor(bh / 26); r++) for (let c = 0; c < Math.floor(wd / 24); c++)
        if ((r * 7 + c * 3 + i) % 3) g.fillRect(bx + 8 + c * 24, h - bh + 10 + r * 26, 10, 12);
      bx += wd + 6;
    });
    g.fillStyle = '#3a3230'; g.fillRect(0, h - 14, w, 14);
  });
  cityTexC.wrapS = THREE.RepeatWrapping; cityTexC.repeat.x = 1.6;
  const cityMat = bas({ map: cityTexC });
  const shield = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 1.05), cityMat); shield.position.set(0, 1.52, -1.95); S.add(shield);
  for (const sx of [-1, 1]) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 0.85), cityMat);
    win.position.set(sx * 1.72, 1.5, 0.1); win.rotation.y = sx * Math.PI / 2; S.add(win);
  }
  const floorC = box(3.5, 0.1, 4.8, lam({ color: 0x2e2a33 })); floorC.position.y = -0.06; S.add(floorC);
  const roofC = box(3.5, 0.09, 4.6, lam({ color: 0x5d2432 })); roofC.position.set(0, 1.98, 0); S.add(roofC);
  for (const sx of [-1, 1]) for (const zz of [-1.85, 1.95]) {
    const pil = box(0.09, 0.6, 0.09, lam({ color: 0x5d2432 }));
    pil.position.set(sx * 1.66, 1.68, zz); S.add(pil);
  }
  const dash = box(3.3, 0.5, 0.65, lam({ color: 0x3a3644 })); dash.position.set(0, 0.92, -1.55); S.add(dash);
  const dashTop = box(3.3, 0.06, 0.7, lam({ color: 0x2c2833 })); dashTop.position.set(0, 1.19, -1.55); S.add(dashTop);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.045, 10, 20), lam({ color: 0x1c1f24 }));
  wheel.position.set(-0.85, 1.1, -1.18); wheel.rotation.x = 1.15; S.add(wheel);
  const mirror = box(0.3, 0.1, 0.04, lam({ color: 0x1c1f24 })); mirror.position.set(0, 1.82, -1.78); S.add(mirror);
  const seatM2 = lam({ color: 0x4a3a52 });
  for (const sx of [-0.85, 0.85]) {
    const cush = box(0.64, 0.13, 0.62, seatM2); cush.position.set(sx, 0.42, -0.5); S.add(cush);
    const back = box(0.64, 0.88, 0.15, seatM2); back.position.set(sx, 0.86, -0.86); back.rotation.x = 0.1; S.add(back);
  }
  const bench = box(3.0, 0.6, 0.16, seatM2); bench.position.set(0, 0.68, 1.6); S.add(bench);
  const benchC = box(3.0, 0.13, 0.7, seatM2); benchC.position.set(0, 0.4, 1.25); S.add(benchC);
}

// =====================================================================
// SET 8 — GHAR KA DARWAZA (agent wala scene)
// =====================================================================
const doorG = new THREE.Group(); scene.add(doorG);
let doorPanel, bellG, policyHero, policyFine;
{
  const S = doorG;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), lam({ map: tex(planks(11), 5, 5), color: 0xd8bd96 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 3); S.add(floor);
  const wallM = lam({ map: tex(plaster(31, 36), 4, 1) });
  const wallL = new THREE.Mesh(new THREE.PlaneGeometry(12.3, 7), wallM); wallL.position.set(-5.85, 3.5, -2.2); S.add(wallL);
  const wallR = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 7), wallM); wallR.position.set(6.75, 3.5, -2.2); S.add(wallR);
  const wallT = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 4.62), wallM); wallT.position.set(0.9, 4.69, -2.2); S.add(wallT);
  // bahar ki roshni (darwaze ke peeche)
  const outside = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.2), bas({ color: 0xffe9bb }));
  outside.position.set(0.9, 1.6, -3.7); S.add(outside);
  const outFl = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 3.2), lam({ color: 0xbfb49a }));
  outFl.rotation.x = -Math.PI / 2; outFl.position.set(0.9, 0.01, -3.4); S.add(outFl);
  // darwaza frame + khulne wala panel (hinge left)
  const frameL = box(0.1, 2.36, 0.12, lam({ color: 0x4c3421 })); frameL.position.set(0.32, 1.18, -2.19); S.add(frameL);
  const frameR = box(0.1, 2.36, 0.12, lam({ color: 0x4c3421 })); frameR.position.set(1.48, 1.18, -2.19); S.add(frameR);
  const frameT = box(1.26, 0.12, 0.12, lam({ color: 0x4c3421 })); frameT.position.set(0.9, 2.32, -2.19); S.add(frameT);
  doorPanel = new THREE.Group(); doorPanel.position.set(0.4, 0, -2.14); S.add(doorPanel);
  const panel = box(1.0, 2.2, 0.06, lam({ map: FX.woodTexture(), color: 0x96684a })); panel.position.set(0.5, 1.1, 0); doorPanel.add(panel);
  const knob2 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), lam({ color: 0xd9b84c })); knob2.position.set(0.9, 1.05, 0.06); doorPanel.add(knob2);
  // nameplate + ghanti
  const plateTex = textBoard(256, 80, (g, w, h) => {
    g.fillStyle = '#c9a44e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3a2c1c'; g.font = 'bold 34px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('RAMESH KUMAR', w / 2, h / 2 + 2);
  });
  const plate = boardMesh(0.74, 0.23, plateTex, true); plate.position.set(-0.12, 1.52, -2.14); S.add(plate);
  bellG = new THREE.Group(); bellG.position.set(1.78, 1.52, -2.12); S.add(bellG);
  const bMount = box(0.1, 0.16, 0.05, lam({ color: 0x5d3f24 })); bellG.add(bMount);
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), lam({ color: 0xd9b84c, emissive: 0x4a3808 }));
  bell.scale.y = 0.8; bell.position.y = -0.13; bellG.add(bell);
  // agent ka kagaz — HERO (s28): "₹1 CRORE COVER"
  const heroTex = textBoard(512, 640, (g, w, h) => {
    g.fillStyle = '#fbf8ef'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#274b73'; g.fillRect(0, 0, w, 92);
    g.fillStyle = '#ffffff'; g.font = 'bold 38px Arial'; g.textAlign = 'center'; g.fillText('SUKHDA INSURANCE', w / 2, 58);
    g.fillStyle = '#8a7a5f'; g.font = '24px Arial'; g.fillText('jeevan suraksha policy', w / 2, 140);
    g.fillStyle = '#3a2c1c'; g.font = 'bold 44px Arial'; g.fillText('COVER', w / 2, 226);
    g.fillStyle = '#173f2c'; g.font = 'bold 104px Arial'; g.fillText('₹1 CRORE', w / 2, 330);
    g.strokeStyle = '#173f2c'; g.lineWidth = 5; g.strokeRect(70, 396, w - 140, 92);
    g.fillStyle = '#3a2c1c'; g.font = '26px Arial'; g.fillText('premium: sirf ₹999 / mahina*', w / 2, 450);
    g.fillStyle = '#a39a86'; g.font = '17px Arial';
    g.fillText('* niyam va shartein laagu. kagaz ke', w / 2, 540);
    g.fillText('neeche chhota print zaroor padhein.', w / 2, 566);
  });
  policyHero = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.68), lam({ map: heroTex, side: THREE.DoubleSide }));
  policyHero.position.set(0.68, 1.26, -2.5); policyHero.rotation.y = 0.14; S.add(policyHero);
  // agent ka kagaz — FINE PRINT (s29): asal cover ₹7,00,000
  const fineTex = textBoard(512, 640, (g, w, h) => {
    g.fillStyle = '#fbf8ef'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#274b73'; g.fillRect(0, 0, w, 64);
    g.fillStyle = '#ffffff'; g.font = 'bold 28px Arial'; g.textAlign = 'center'; g.fillText('SUKHDA INSURANCE', w / 2, 42);
    g.fillStyle = '#6a5a44'; g.font = '21px Arial'; g.textAlign = 'left';
    const lines = ['policy no: SK-2026-8841', 'naam: graahak', 'prakaar: endowment plan', 'avadhi: 20 varsh', 'premium: ₹999 / mahina'];
    lines.forEach((t, i) => g.fillText(t, 36, 116 + i * 36));
    g.fillStyle = '#a39a86'; g.font = '15px Arial';
    for (let i = 0; i < 5; i++) g.fillText('shartein laagu — vistrit vivaran patra par uplabdh hai...', 36, 330 + i * 24);
    // asal rakam — highlight + laal ghera
    g.fillStyle = '#fdf0a8'; g.fillRect(28, 452, w - 56, 84);
    g.fillStyle = '#3a2c1c'; g.font = 'bold 27px Arial'; g.fillText('asal cover rakam:', 40, 488);
    g.fillStyle = '#b3231b'; g.font = 'bold 47px Arial'; g.fillText('₹7,00,000', 40, 528);
    g.strokeStyle = '#d21f14'; g.lineWidth = 6; g.beginPath(); g.ellipse(w / 2, 494, w / 2 - 22, 56, 0, 0, 7); g.stroke();
    g.fillStyle = '#8a7a5f'; g.font = '17px Arial'; g.fillText('upar wala ₹1 crore = adhiktam seema*', 36, 584);
  });
  policyFine = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.7), lam({ map: fineTex, side: THREE.DoubleSide }));
  policyFine.position.set(0.1, 1.12, -0.9); policyFine.rotation.set(-0.06, 0.08, 0); S.add(policyFine);
  // andar ke props: chhota table + paudha
  const sTable = box(0.9, 0.05, 0.6, lam({ map: FX.woodTexture(), color: 0x8a6844 })); sTable.position.set(-1.9, 0.72, -1.6); S.add(sTable);
  const pot2 = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.2, 10), lam({ color: 0xa3542e }));
  pot2.position.set(-1.9, 0.85, -1.6); S.add(pot2);
  const leaf2 = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.4, 6), lam({ color: 0x3f7a3a }));
  leaf2.position.set(-1.9, 1.12, -1.6); S.add(leaf2);
}

// =====================================================================
// CHARACTER CARDS (kit painters) — EP-9 wala hi Card system
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
const rameshCard = new Card(), attCard = new Card(), dostCard = new Card(), drvCard = new Card(), agentCard = new Card();
const ALL_CARDS = [rameshCard, attCard, dostCard, drvCard, agentCard];
const RAMESH_OUTFIT = { tunic: '#d97b29', skin: '#e8b184', hair: '#1e1714' };       // kesariya kurta
const ATT_OUTFIT = { tunic: '#38618f', skin: '#c99067', hair: '#241a14' };          // pump uniform
const DOST_OUTFIT = { tunic: '#3f7a4a', skin: '#d99e6b', hair: '#14100e' };         // dost — hari shirt
const DRV_OUTFIT = { tunic: '#e6e0d2', skin: '#b57e52', hair: '#201812' };          // Ola driver — safed shirt
const AGENT_OUTFIT = { tunic: '#2e4a8f', skin: '#e0aa7e', hair: '#191410' };        // EP-9 wala neela agent

// ---------- environments ----------
scene.fog = new THREE.Fog(0xf2d5a0, 18, 52);
const ENVS = {
  room: { bg: 0xf2d5a0, hemi: 1.0, sun: 1.85 },   // subah ki garam roshni
  pump: { bg: 0xd7e6ec, hemi: 1.15, sun: 1.95 },  // din ki safed roshni
  home: { bg: 0xeed9ae, hemi: 0.95, sun: 1.6 },   // ghar ka garam kona
  toll: { bg: 0xd7e6ec, hemi: 1.15, sun: 1.95 },  // din ki safed roshni
  burger: { bg: 0xf0d9a8, hemi: 1.05, sun: 1.5 }, // joint ki garam roshni
  cinema: { bg: 0x14101f, hemi: 0.35, sun: 0.25, hemiCol: 0x8a7ab8, hemiGnd: 0x1c1626 }, // andhera hall
  car: { bg: 0xe8d9b0, hemi: 1.0, sun: 1.7 },     // shaam ki gaadi
  door: { bg: 0xf2d5a0, hemi: 1.0, sun: 1.8 },    // din — ghar ka darwaza
  night: { bg: 0x16222e, hemi: 0.3, sun: 0.35, hemiCol: 0x91a7c4, hemiGnd: 0x11161d, sunCol: 0xaac4ff }, // raat — chaand
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

// ---------- per-frame ----------
window.renderFrame = (f) => {
  const shot = shotAt(f), u = shot.u, id = shot.id;
  const cam = camFor(shot, u);
  camera.position.set(...cam.pos); camera.up.set(0, 1, 0); camera.lookAt(...cam.look);
  if (cam.roll) camera.rotateZ(THREE.MathUtils.degToRad(cam.roll));
  camera.fov = cam.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  sun.target.position.set(0, 1, 0);

  const set = shot.set;
  roomG.visible = set === 'room';
  pumpG.visible = set === 'pump';
  homeG.visible = set === 'home' || set === 'night';
  tollG.visible = set === 'toll';
  burgerG.visible = set === 'burger';
  cinemaG.visible = set === 'cinema';
  carG.visible = set === 'car';
  doorG.visible = set === 'door';
  phoneG.visible = false;
  funnelMesh.visible = false;
  loanPaper.visible = id === 's24' || id === 's25' || id === 's26' || set === 'night';
  nightPapers.visible = set === 'night';
  moonG.visible = set === 'night';
  moonLight.intensity = set === 'night' ? 0.55 : 0;
  billMesh.visible = id === 's20';
  policyHero.visible = id === 's28';
  policyFine.visible = id === 's29';
  if (set === 'cinema') cinemaLight.intensity = 0.65 + 0.1 * Math.sin(f * 2.3) + 0.05 * Math.sin(f * 7.7);
  if (set === 'car') cityTexC.offset.x = -((f * 0.0045) % 1);
  applyEnv(set);
  ALL_CARDS.forEach((c) => c.hide());

  const show = (card, outfit, seed, x, y, z, s, expr, R = 'hang', L = 'hang', step = 0) => {
    const idl = idle(f, seed), blink = blinkAt(f, seed);
    const key = `${seed}|${expr}|${R}|${L}|${blink}|${q(idl.bob, 2)}|${Math.round(idl.tilt)}|${q(step, 2)}`;
    card.draw(key, (p) => T.romanFront(p, outfit, {
      seed, expr, R, L, blink, bob: q(idl.bob, 2), tilt: Math.round(idl.tilt),
      headTilt: Math.round(idle(f, seed + 2).headTilt), wv: f * 0.18, step,
    }));
    card.place(x, y, z, cam.pos, s);
  };
  const RM = (expr, R, L, x = 0.2, z = -0.8, s = 1.0, step = 0) => show(rameshCard, RAMESH_OUTFIT, 9, x, 0, z, s, expr, R, L, step);

  switch (id) {
    // ---- L1: subah ka kamra ----
    case 's01': RM('smile', 'hang', 'hang', -0.7, -0.9); break;
    case 's02': RM('smile', 'up', 'hang', 0.1, -1.0); break;
    case 's03': RM('smile', 'hang', 'hang'); break;
    case 's04': {
      RM('smile', 'hang', 'hang', 1.45, 0.0);
      phoneG.visible = true;
      phoneScreen.material.map = chatTex; phoneScreen.material.needsUpdate = true;
      phoneG.position.set(2.3, 0.845 + Math.abs(Math.sin(f * 1.7)) * 0.006, 0.5);
      phoneG.rotation.set(-1.05, 0, Math.sin(f * 1.7) * 0.07);
      break;
    }
    // ---- L2: WhatsApp ----
    case 's05': {
      phoneG.visible = true;
      phoneScreen.material.map = chatTex; phoneScreen.material.needsUpdate = true;
      phoneG.position.set(2.3, 0.845, 0.5);
      phoneG.rotation.set(-1.05, 0, 0);
      break;
    }
    case 's06': {
      RM('grin', 'reach', 'hang');
      phoneG.visible = true;
      phoneScreen.material.map = chatTex; phoneScreen.material.needsUpdate = true;
      phoneG.position.set(0.66, 1.06, -0.26);
      phoneG.rotation.set(0, 0, 0);
      break;
    }
    // ---- L3: product woh khud tha ----
    case 's07': {
      RM('grin', 'reach', 'hang');
      phoneG.visible = true;
      phoneScreen.material.map = productTex; phoneScreen.material.needsUpdate = true;
      phoneG.position.set(0.66, 1.06, -0.26);
      phoneG.rotation.set(0, 0, 0);
      break;
    }
    case 's08': {
      const wx = 0.6 + (2.0 - 0.6) * M.smooth(u);
      RM('smile', 'hang', 'hang', wx, -0.6, 1.0, (f - 395) * 0.09);
      break;
    }
    // ---- L4: petrol pump ----
    case 's09': {
      if (meterRedraw) meterRedraw(0);
      RM('smile', 'hang', 'hang', -0.9, -0.1);
      show(attCard, ATT_OUTFIT, 21, 2.15, 0, -0.72, 1.0, 'smile');
      break;
    }
    case 's10': {
      if (meterRedraw) meterRedraw(Math.round(1000 * M.smooth(u)));
      RM('smile', 'hang', 'hang', 0.3, 0.2);
      show(attCard, ATT_OUTFIT, 21, 1.82, 0, -0.45, 1.0, 'smile', 'reach', 'hang');
      break;
    }
    // ---- L4: ghar — bottle naap ----
    case 's11': {
      funnelMesh.visible = true;
      show(rameshCard, RAMESH_OUTFIT, 9, 0.15, 0, -1.15, 1.0, 'smile', 'belly', 'belly');
      break;
    }
    case 's12': {
      show(rameshCard, RAMESH_OUTFIT, 9, 0.8, 0, -1.05, 1.12, 'shock', 'hang', 'hang');
      break;
    }
    // ---- L5: toll plaza ----
    case 's13': {
      barrierArm.rotation.z = -1.05 * M.smooth(clamp((u - 0.3) / 0.5));
      RM('smile', 'reach', 'hang', -2.1, 0.95);
      phoneG.visible = true;
      phoneScreen.material.map = tollTexA; phoneScreen.material.needsUpdate = true;
      phoneG.position.set(-1.48, 1.07, 1.1);
      phoneG.rotation.set(0, 0, 0);
      break;
    }
    case 's14': {
      phoneG.visible = true;
      phoneScreen.material.map = u < 0.45 ? tollTexA : tollTexB; phoneScreen.material.needsUpdate = true;
      phoneG.position.set(0, 1.15, 0.8);
      phoneG.rotation.set(0, 0, 0);
      break;
    }
    // ---- L6: burger joint ----
    case 's15': {
      RM('smile', 'hang', 'hang', 0.55, 0.75);
      show(dostCard, DOST_OUTFIT, 17, -0.55, 0, 0.8, 1.0, 'grin', 'belly', 'hang');
      break;
    }
    case 's16': {
      RM('smile', 'belly', 'belly', 0.55, 0.75);
      show(dostCard, DOST_OUTFIT, 17, -0.55, 0, 0.8, 1.0, 'grin', 'reach', 'hang');
      break;
    }
    case 's17': break; // kiraya poster macro — sirf poster
    // ---- L7: cinema ----
    case 's18': {
      show(rameshCard, RAMESH_OUTFIT, 9, 1.1, -0.5, 1.02, 1.0, 'smile', 'belly', 'belly');
      break;
    }
    case 's19': {
      show(rameshCard, RAMESH_OUTFIT, 9, 1.1, -0.5, 1.02, 1.05, 'grin', 'belly', 'belly');
      break;
    }
    case 's20': {
      show(rameshCard, RAMESH_OUTFIT, 9, 0.95, -0.3, 1.05, 0.95, 'shock', 'hang', 'hang');
      break;
    }
    // ---- L8: Ola car ----
    case 's21': {
      show(drvCard, DRV_OUTFIT, 31, -0.85, -0.42, -0.6, 0.98, 'smile', 'reach', 'hang');
      show(rameshCard, RAMESH_OUTFIT, 9, 0.72, -0.3, 0.75, 1.0, 'smile', 'hang', 'hang');
      break;
    }
    case 's22': {
      show(drvCard, DRV_OUTFIT, 31, -0.85, -0.42, -0.6, 1.05, (f % 48 < 24) ? 'grin' : 'smile', 'reach', 'hang');
      break;
    }
    case 's23': {
      show(rameshCard, RAMESH_OUTFIT, 9, 0.72, -0.3, 0.75, 1.05, 'dazed', 'hang', 'hang');
      break;
    }
    // ---- L9: ghar — loan kagaz ----
    case 's24': RM('smile', 'belly', 'belly', 0.3, -1.15); break;
    case 's25': break; // kagaz macro — numbers saaf
    case 's26': RM('pained', 'cheek', 'hang', 0.3, -1.15); break;
    // ---- L10: darwaza — agent ----
    case 's27': {
      doorPanel.rotation.y = -3.02 * M.smooth(clamp((u - 0.3) / 0.4));
      bellG.rotation.z = u < 0.28 ? Math.sin(f * 2.3) * 0.45 * (1 - u / 0.28) : 0;
      const wx = -0.95 + 0.55 * M.smooth(clamp(u / 0.55));
      RM(u < 0.55 ? 'smile' : 'smile', 'hang', 'hang', wx, -0.55, 1.0, u < 0.5 ? (f - 1348) * 0.09 : 0);
      show(agentCard, AGENT_OUTFIT, 41, 0.92, 0, -2.95, 1.0, 'grin', 'hang', 'hang');
      break;
    }
    case 's28': {
      doorPanel.rotation.y = -3.02;
      show(agentCard, AGENT_OUTFIT, 41, 1.05, 0, -2.95, 1.02, 'grin', 'reach', 'hang');
      RM('smile', 'hang', 'hang', -0.5, -1.2);
      break;
    }
    case 's29': {
      doorPanel.rotation.y = -3.02;
      RM('stern', 'belly', 'hang', -0.38, -1.25, 1.0);
      show(agentCard, AGENT_OUTFIT, 41, 0.78, 0, -1.5, 0.95, 'nervous', 'hang', 'hang');
      break;
    }
    // ---- L11-L14: raat ka ant ----
    case 's30': RM('smile_closed', 'hang', 'hang', -1.55, -1.7); break;
    case 's31': {
      phoneG.visible = true;
      phoneScreen.material.map = chatTex; phoneScreen.material.needsUpdate = true;
      phoneG.position.set(0.66, 1.04, 0.34);
      phoneG.rotation.set(-1.35, 0, 0.3);
      break;
    }
    case 's32': RM('smile_closed', 'hang', 'hang', -1.55, -1.7); break;
    case 's33': RM('smile', 'reach', 'hang', 0.35, -1.15); break;
    case 's34': RM('smile', 'point', 'hang', 0.95, -0.9); break;
    case 's35': RM('smile_closed', 'hang', 'hang', -1.3, -1.55, 0.92); break;
  }
  renderer.render(scene, camera);
};
window.TOTAL = TOTAL;
window.ready = true;
