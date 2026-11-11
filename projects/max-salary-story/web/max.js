// MAX — the 3D stickman hero. Character bible (identical in every scene):
// smooth WHITE spherical head, expressive BLACK eyes, THICK movable black
// eyebrows, slim athletic BLACK articulated body, dark NAVY BLUE fitted
// jacket, BLACK trousers, clean WHITE sneakers, small GOLDEN wristwatch
// on the LEFT wrist. Drawn on a 600x1000 card (feet at y=975), Pen API.
import { INK } from './toon.js';

const rad = (d) => d * Math.PI / 180;
const circlePts = (cx, cy, r, n = 48) => {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = i / n * Math.PI * 2;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
};

const NAVY = '#1f2a44', NAVY_DK = '#141d33', NAVY_LT = '#2e4066';
const GOLD = '#e8b23a', GOLD_LT = '#ffd76a';
const BLACK = '#111114', WHITE = '#ffffff';

// Eyebrow geometry per expression: lift (px, negative = raised), angles (deg).
// angle: positive = inner end raised (worried), negative = inner end lowered (serious).
const BROWS = {
  shocked:   { lift: -14, lAng: -16, rAng: 16 },
  confused:  { lift: -6,  lAng: -20, rAng: 10 },
  happy:     { lift: -5,  lAng: -10, rAng: 10 },
  worried:   { lift: -3,  lAng: 18,  rAng: -18 },
  serious:   { lift: 3,   lAng: 12,  rAng: -12 },
  confident: { lift: -9,  lAng: -18, rAng: 6 },
  sad:       { lift: -2,  lAng: 16,  rAng: -16 },
  neutral:   { lift: -5,  lAng: -6,  rAng: 6 },
};

function drawMouth(p, expr, mx, my) {
  if (expr === 'shocked') {
    p.ell(mx, my + 6, 11, 15, BLACK, 0);
  } else if (expr === 'happy' || expr === 'confident') {
    const a0 = expr === 'happy' ? 15 : 25, a1 = expr === 'happy' ? 165 : 155;
    p.arc(mx, my - 4, 26, 20, a0, a1, 7, BLACK);
  } else if (expr === 'worried' || expr === 'sad') {
    p.arc(mx, my + 16, 22, 16, 195, 345, 6, BLACK);
  } else if (expr === 'confused') {
    p.stroke([[mx - 18, my + 4], [mx - 6, my - 2], [mx + 6, my + 6], [mx + 18, my + 2]], 6, BLACK);
  } else { // serious / neutral
    p.stroke([[mx - 20, my + 4], [mx + 20, my + 4]], 6.5, BLACK);
  }
}

function drawEyes(p, expr, cx, cy, blink) {
  const ex = 38;
  for (const side of [-1, 1]) {
    const x = cx + side * ex;
    if (blink >= 1) {
      p.stroke([[x - 12, cy], [x + 12, cy]], 6, INK);
      continue;
    }
    if (expr === 'happy') {
      p.arc(x, cy + 2, 13, 11, 195, 345, 6, INK);
      continue;
    }
    const ry = expr === 'shocked' ? 21 : expr === 'worried' || expr === 'sad' ? 16 : 18;
    p.ell(x, cy, 12, ry, BLACK, 0);
    p.dot(x + 4, cy - 6, 4, '#ffffff');
  }
}

function drawBrow(p, expr, cx, cy) {
  const b = BROWS[expr] || BROWS.neutral;
  const ex = 38, by = cy - 40 + b.lift;
  for (const side of [-1, 1]) {
    const ang = (side < 0 ? b.lAng : b.rAng) * Math.PI / 180;
    const x0 = cx + side * ex - side * 15, x1 = cx + side * ex + side * 15;
    const mx = (x0 + x1) / 2, my = by;
    const rot = (x, y) => [mx + (x - mx) * Math.cos(ang) - (y - my) * Math.sin(ang), my + (x - mx) * Math.sin(ang) + (y - my) * Math.cos(ang)];
    const [ax, ay] = rot(x0, by), [bx, by2] = rot(x1, by);
    p.stroke([[ax, ay], [bx, by2]], 10, INK);
  }
}

// Arm poses. Returns [shoulder, elbow, hand] in card space.
// side -1 = character's RIGHT arm (viewer left), +1 = character's LEFT arm (viewer right).
function armPose(side, pose, wv) {
  const sx = 300 + side * 52, sy = 305;
  switch (pose) {
    case 'up': return [[sx, sy], [sx + side * 28, 205], [sx + side * 52, 118]];
    case 'wave': {
      const sway = Math.sin(wv) * 12;
      return [[sx, sy], [sx + side * 32, 198], [sx + side * 50 + sway * 0.4, 106]];
    }
    case 'reach': return [[sx, sy], [sx + side * 66, 325], [sx + side * 112, 345]];
    case 'point': return [[sx, sy], [sx + side * 62, 315], [sx + side * 122, 310]];
    case 'hold': return [[sx, sy], [sx + side * 32, 415], [300 + side * 24, 465]];
    case 'write': return [[sx, sy], [sx + side * 28, 425], [300 + side * 28, 515]];
    case 'sit': return [[sx, sy], [sx + side * 24, 465], [300 + side * 42, 555]];
    case 'hang':
    default: return [[sx, sy], [sx + side * 13, 425], [sx + side * 17, 540]];
  }
}

// opts: { expr, L, R, blink, bob, tilt, headTilt, wv, step, sit }
// step: 0..1 walk phase (0 = standing). sit: true = seated.
export function drawMax(p, opts = {}) {
  const {
    expr = 'neutral', L = 'hang', R = 'hang', blink = 0,
    bob = 0, tilt = 0, headTilt = 0, wv = 0, step = 0, sit = false,
  } = opts;
  const cx = 300, sole = 975;
  p.rot = null;
  const bobY = bob * 40;

  // ---- legs (black trousers) ----
  const hipY = sit ? 690 : 560;
  for (const side of [-1, 1]) {
    const hx = cx + side * 16, fx = cx + side * 30;
    let fy = sole - 8, kx = (hx + fx) / 2, ky = (hipY + fy) / 2;
    if (step) {
      const sw = Math.sin(Math.PI * 2 * (step + (side > 0 ? 0.5 : 0)));
      fy = sole - 8 - Math.max(0, sw) * 24;
      kx = (hx + fx) / 2 + sw * 9;
    }
    if (sit) { // seated: thigh forward, shin down
      p.stroke([[hx, hipY], [cx + side * 34, hipY + 28], [cx + side * 30, sole - 8]], 15, BLACK);
    } else {
      p.stroke([[hx, hipY], [kx, ky], [fx, fy]], 15, BLACK);
    }
    // white sneaker
    p.ell(cx + side * 32, fy + 12, 32, 14, WHITE, 5);
    p.stroke([[cx + side * 32 - 28, fy + 22], [cx + side * 32 + 28, fy + 22]], 4, INK);
  }

  // ---- torso: navy fitted jacket ----
  const torsoTop = 292, torsoBot = sit ? 690 : 560;
  const jacket = [
    [cx - 60, torsoTop + 6], [cx - 56, torsoTop - 6],
    [cx - 32, torsoTop - 12], [cx + 32, torsoTop - 12],
    [cx + 56, torsoTop - 6], [cx + 60, torsoTop + 6],
    [cx + 50, torsoBot], [cx - 50, torsoBot],
  ];
  p.shadedFill(jacket, NAVY, NAVY_DK, rad(-120), 120);
  p.inkRing(jacket, 8, rad(-120));
  // jacket V opening (black shirt) + lapels + gold buttons
  p.poly([[cx - 24, torsoTop - 6], [cx + 24, torsoTop - 6], [cx, torsoTop + 84]], BLACK, 0);
  p.poly([[cx - 24, torsoTop - 6], [cx - 6, torsoTop + 28], [cx, torsoTop + 84]], NAVY_LT, 0);
  p.poly([[cx + 24, torsoTop - 6], [cx + 6, torsoTop + 28], [cx, torsoTop + 84]], NAVY_LT, 0);
  p.dot(cx, torsoTop + 104, 5, GOLD);
  p.dot(cx, torsoTop + 150, 5, GOLD);
  // pocket square
  p.poly([[cx + 34, torsoTop + 40], [cx + 50, torsoTop + 40], [cx + 50, torsoTop + 52], [cx + 34, torsoTop + 52]], GOLD_LT, 0);

  // ---- arms (navy sleeves) + hands + gold watch on LEFT wrist ----
  for (const side of [-1, 1]) {
    const pose = side < 0 ? R : L; // viewer-left arm = character's right
    const [sh, el, ha] = armPose(side, pose, wv);
    p.stroke([sh, el, ha], 15, NAVY);
    p.dot(ha[0], ha[1], 12, BLACK); // hand: small black articulated fist
    if (side > 0) { // golden wristwatch on the character's LEFT wrist (viewer right)
      const wx = (el[0] + ha[0]) / 2, wy = (el[1] + ha[1]) / 2;
      p.dot(wx, wy, 11, GOLD);
      p.dot(wx, wy, 5, '#fff8e0');
    }
  }

  // ---- neck + head (white sphere) ----
  p.stroke([[cx, torsoTop - 10], [cx, torsoTop - 30]], 16, BLACK);
  const hcY = 168 - bobY * 0.4, hcX = cx + headTilt * 1.2;
  p.shadedFill(circlePts(hcX, hcY, 88, 48), '#ffffff', '#c9ccd4', rad(-120), 88);
  p.inkRing(circlePts(hcX, hcY, 88, 48), 9, rad(-120));
  // subtle cheek shading
  p.ell(hcX - 50, hcY + 32, 15, 9, 'rgba(200,205,215,0.35)', 0);
  p.ell(hcX + 50, hcY + 32, 15, 9, 'rgba(200,205,215,0.35)', 0);

  // ---- face ----
  drawEyes(p, expr, hcX, hcY - 6, blink);
  drawBrow(p, expr, hcX, hcY - 6);
  drawMouth(p, expr, hcX, hcY + 42);
}
