// REAL 3D animation sample — Rahul ₹30,000 opening (P0 hook + P1), 18.13 s, 544 frames.
// Pure frame math only: TIMING, beats, walk path, coin rain, drain, wallet, camera.
// NOT a slideshow: Rahul walks, gestures, coins rain and fly away, camera never stops.
import { clamp, lerp, lerp3, ramp, kf, kf3, spline, walk } from './motion.js';

export const FPS = 30;
export const TOTAL = 544; // frames 0..543 — 18.133 s @30fps
// TIMING [id, startFrame, endFrame] — contiguous, matches the full film's P0/P1 boundaries.
export const TIMING = [
  ['p0', 0, 317], ['p1', 317, 544],
];
const SEG = {}; TIMING.forEach(([id, a, b]) => { SEG[id] = { id, a, b, len: b - a }; });
export const secAt = (f) => {
  let s = SEG[TIMING[0][0]];
  for (const [id, a] of TIMING) { if (f >= a) s = SEG[id]; else break; }
  return { id: s.id, a: s.a, b: s.b, u: clamp((f - s.a) / s.len) };
};
const sf = (id, u) => SEG[id].a + (SEG[id].b - SEG[id].a) * u;
export const smooth = (u) => u * u * (3 - 2 * u);
const k1 = (keys, f) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (f <= keys[i][0]) { const [f0, v0] = keys[i - 1], [f1, v1] = keys[i]; return lerp(v0, v1, (f - f0) / Math.max(1, f1 - f0)); }
  }
  return keys[keys.length - 1][1];
};
const k3 = (keys, f) => {
  if (f <= keys[0][0]) return [...keys[0][1]];
  for (let i = 1; i < keys.length; i++) {
    if (f <= keys[i][0]) { const [f0, v0] = keys[i - 1], [f1, v1] = keys[i]; return lerp3(v0, v1, (f - f0) / Math.max(1, f1 - f0)); }
  }
  return [...keys[keys.length - 1][1]];
};

// ---------- beats: b1 walk-in [0,90] | b2 salary rain [90,210] | b3 drain + empty wallet [210,317] | b4 salary day walk [317,544] ----------
export const beatAt = (f) => {
  if (f < 90) return { id: 'b1', u: clamp(f / 90) };
  if (f < 210) return { id: 'b2', u: clamp((f - 90) / 120) };
  if (f < 317) return { id: 'b3', u: clamp((f - 210) / 107) };
  return { id: 'b4', u: clamp((f - 317) / 227) };
};

// ---------- environment: warm golden morning throughout ----------
const C = (h) => { const n = parseInt(h.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
export const envAt = (f) => {
  const u = smooth(clamp((f - 317) / 227)); // slightly deeper gold in p1
  const mix3 = (a, b) => lerp3(C(a), C(b), u);
  return {
    top: mix3('#f7c873', '#f2bd60'), hor: mix3('#ffe9b8', '#ffe3a6'), fog: mix3('#f2d49a', '#eed096'),
    fn: 18, ff: 220, az: 100, el: 32 - u * 4, sun: mix3('#ffdf9e', '#ffdf9e'), sunI: 1.5,
    hSky: mix3('#ffe9c0', '#ffe6bc'), hGnd: mix3('#b09a68', '#ac9662'), hemi: 0.9, mist: 0.18,
    cloud: mix3('#fff3d6', '#fff0cf'), cop: 0.5,
  };
};

// ---------- Rahul: walks in, catches rain, recoils in shock, walks off happy ----------
// Walk phases: b1 walks 0->90, b4 walks 317->544. step is the leg-cycle phase (0..1).
export const rahulAt = (f) => {
  const beat = beatAt(f);
  let pos, expr, armL, armR, step = 0, walking = false;
  if (beat.id === 'b1') {
    // walks in from far left, diagonal toward centre, camera tracks him
    pos = k3([[0, [-6.2, 0, 2.2]], [45, [-3.6, 0, 1.6]], [90, [-0.9, 0, 0.9]]], f);
    const w = walk(f, 0, 1.35, 0.8);
    step = w.phase; walking = true;
    expr = 'wonder'; armL = 'hang'; armR = 'hang';
  } else if (beat.id === 'b2') {
    // plants his feet, looks up, BOTH arms up catching the rain
    pos = [-0.9, 0, 0.9];
    expr = f < 150 ? 'grin' : 'wonder';
    armL = 'up'; armR = 'up';
  } else if (beat.id === 'b3') {
    // steps back in shock, hands out, mouth open — money gone
    pos = k3([[210, [-0.9, 0, 0.9]], [255, [-1.5, 0, 1.3]], [317, [-1.5, 0, 1.3]]], f);
    expr = 'shock'; armL = 'reach'; armR = 'reach';
  } else {
    // salary day: walks happily toward the house, waves at the end
    pos = k3([[317, [-1.5, 0, 1.3]], [400, [0.2, 0, 0.4]], [480, [1.8, 0, -0.6]], [544, [2.4, 0, -0.9]]], f);
    const w = walk(f, 317, 1.25, 0.8);
    step = w.phase; walking = true;
    expr = 'grin';
    armL = f > 490 ? 'wave' : 'hang';
    armR = f > 490 ? 'wave' : 'hang';
  }
  return { pos, expr, armL, armR, step, walking, visible: true };
};

// ---------- salary pile: empty -> grows with the rain -> drains to zero -> small top-up ----------
// pile level 0..1
export const pileAt = (f) => k1([
  [0, 0], [90, 0], [140, 0.55], [210, 1.0],
  [240, 0.55], [275, 0.12], [300, 0.0], [317, 0.0],
  [470, 0.0], [510, 0.18], [544, 0.22],
], f);

// ---------- coin rain: coins fall from the sky in staggered cycles ----------
// n coins, each falls ~75 frames from y=13 to the pile, then restarts while active.
export const rainActive = (f) => (f >= 90 && f < 212) || (f >= 470 && f < 544);
export const rainU = (f, k, n) => {
  const cycle = 75;
  const ph = (((f - 90) / cycle) - k / n) % 1;
  return ph < 0 ? ph + 1 : ph;
};
export const rainU2 = (f, k, n) => {
  const cycle = 75;
  const ph = (((f - 470) / cycle) - k / n) % 1;
  return ph < 0 ? ph + 1 : ph;
};

// ---------- drain: coins fly AWAY from the pile in arcs (money vanishing) ----------
export const drainActive = (f) => f >= 210 && f < 317;
export const drainU = (f, k, n) => {
  const ph = (((f - 210) / 55) - k / n) % 1;
  return ph < 0 ? ph + 1 : ph;
};

// ---------- wallet: opens during b3, visibly empty ----------
// {visible, flap 0..1 (0 closed, 1 fully open), pos}
export const walletAt = (f) => {
  const r = rahulAt(f);
  const visible = f >= 215 && f < 317;
  const flap = smooth(ramp(f, 225, 275));
  // small wallet at Rahul's hand height, just in front of his torso — never covering him
  const pos = [r.pos[0] + 0.45, 1.05, r.pos[2] + 0.7];
  return { visible, flap, pos };
};

// ---------- captions: bottom band, one per phrase ----------
const CAPTIONS = {
  p0: [{ t: '₹30,000 कमाते थे…', gold: ['₹30,000'] }, { t: 'महीने के अंत में ₹100 भी नहीं बचे!', gold: ['₹100'] }],
  p1: [{ t: 'राहुल — हर महीने 1 तारीख को', gold: ['राहुल'] }, { t: 'सैलरी आती, और वह खुश हो जाता', gold: ['सैलरी'] }],
};
export const captionAt = (f) => {
  const sec = secAt(f);
  const fade = smooth(ramp(f, sec.a + 2, sec.a + 14)) * (1 - smooth(ramp(f, sec.b - 12, sec.b - 2)));
  return { lines: CAPTIONS[sec.id], alpha: fade };
};

// ---------- hero boards: big centre numbers, short appearances so motion stays visible ----------
export const heroAt = (f) => {
  const fade = (a, b, c, d) => smooth(ramp(f, a, b)) * (1 - smooth(ramp(f, c, d)));
  if (f >= 100 && f < 205) return { lines: [{ t: '₹30,000', gold: true }, { t: 'हर महीने कमाते थे', gold: false }], alpha: fade(100, 112, 192, 205) };
  if (f >= 218 && f < 312) return { lines: [{ t: '₹100 भी नहीं बचे!', gold: true }, { t: 'आखिर पैसा जाता कहाँ था?', gold: false }], alpha: fade(218, 230, 300, 312) };
  if (f >= 400 && f < 540) return { lines: [{ t: 'सैलरी आती!', gold: true }, { t: '1 तारीख को खुश हो जाता', gold: false }], alpha: fade(400, 412, 528, 540) };
  return null;
};

// ---------- CAMERA: 4 DISTINCT SETUPS with CLEAN CUTS at the beat boundaries ----------
// Setup 1 (b1): wide establishing + tracking shot. Setup 2 (b2): medium shot from the
// opposite side. Setup 3 (b3): close-up on Rahul + wallet. Setup 4 (b4): low-angle crane.
// Each setup keeps moving inside its beat (dolly/orbit/push-in + drift) — no frozen camera.
const BK = 9;
export function camAt(f) {
  const beat = beatAt(f);
  const r = rahulAt(f);
  let pos, look, fov;
  if (beat.id === 'b1') {
    // SETUP 1 — WIDE establishing: camera glides right alongside walking Rahul, dollying in
    pos = kf3([[0, [-7.5, 2.6, 12.5]], [45, [-4.6, 2.4, 10.5]], [90, [-2.2, 2.3, 9.0]]], f);
    look = kf3([[0, [-5.4, 1.6, 1.6]], [45, [-3.0, 1.5, 1.2]], [90, [-0.9, 1.5, 0.6]]], f);
    fov = 46;
  } else if (beat.id === 'b2') {
    // SETUP 2 — MEDIUM shot from the opposite (right) side: CUT at f90
    pos = kf3([[90, [3.8, 2.2, 7.8]], [150, [1.8, 2.6, 7.0]], [210, [0.4, 2.4, 6.2]]], f);
    look = kf3([[90, [-0.9, 1.5, 0.6]], [150, [-0.4, 1.6, -1.2]], [210, [0.2, 1.4, -2.2]]], f);
    fov = 47;
  } else if (beat.id === 'b3') {
    // SETUP 3 — CLOSE-UP on shocked Rahul + his open empty wallet: CUT at f210
    pos = kf3([[210, [-0.4, 1.9, 5.4]], [260, [0.2, 2.0, 5.9]], [317, [-0.8, 2.1, 6.2]]], f);
    look = kf3([[210, [-1.3, 1.5, 1.0]], [260, [-1.2, 1.5, 1.1]], [317, [-1.2, 1.5, 1.0]]], f);
    fov = 46;
  } else {
    // SETUP 4 — LOW-ANGLE crane: starts low, rises and pulls back wide: CUT at f317
    pos = kf3([[317, [3.5, 1.3, 8.5]], [400, [1.6, 2.6, 10.0]], [480, [2.0, 3.6, 11.0]], [544, [2.2, 4.0, 11.5]]], f);
    look = kf3([[317, [-1.2, 1.5, 1.0]], [400, [0.5, 1.6, 0.0]], [480, [1.4, 1.5, -0.4]], [544, [2.0, 1.5, -0.7]]], f);
    fov = 48;
  }
  // continuous drift: camera breathes so no two frames are ever identical
  const t = f / FPS;
  pos = [pos[0] + Math.sin(t * 0.6) * 0.12, pos[1] + Math.sin(t * 0.9) * 0.06, pos[2] + Math.cos(t * 0.45) * 0.08];
  return { pos, look, fov };
}
