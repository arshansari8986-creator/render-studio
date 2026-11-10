// "1000 Tanks vs 1000 Tanks" — coded cartoon Short.
// Pure frame math only (no THREE, no DOM): TIMING, cameras, environment,
// the literal 1000+1000 tanks, the flank, the encirclement, the payoff.
// main.js renders; sweep verifies. Every pose is an analytic function
// of the frame. Timing from the finished voice stem (47.900958 s).
import { clamp, lerp, lerp3, ramp, kf, kf3, spline } from './motion.js';

export const FPS = 30;
export const TOTAL = 1437; // frames 0..1436 — final stem 47.900958s x 30fps
// TIMING [id, startFrame, endFrame] — one section per phrase, CONTIGUOUS.
export const TIMING = [
  ['hook', 0, 206], ['abrams', 206, 336], ['t90', 336, 508], ['count', 508, 653],
  ['advance', 653, 772], ['fire', 772, 916], ['smoke', 916, 1037], ['twist', 1037, 1081],
  ['ring', 1081, 1274], ['payoff', 1274, 1437],
];
const SEG = {}; TIMING.forEach(([id, a, b]) => { SEG[id] = { id, a, b, len: b - a }; });
export const secAt = (f) => {
  let s = SEG[TIMING[0][0]];
  for (const [id, a] of TIMING) { if (f >= a) s = SEG[id]; else break; }
  return { id: s.id, a: s.a, b: s.b, u: clamp((f - s.a) / s.len) };
};
const sf = (id, u) => SEG[id].a + (SEG[id].b - SEG[id].a) * u;
export const smooth = (u) => u * u * (3 - 2 * u);
const hash = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
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

// ---------- environment: dusty desert afternoon, smoke closes in, golden payoff ----------
const C = (h) => { const n = parseInt(h.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
const ENV_KEYS = [
  [0,              { top: '#7d6f5e', hor: '#e0aa72', fog: '#cfa87e', fn: 20, ff: 230, az: 100, el: 22, sun: '#ffdf9e', sunI: 1.6, hSky: '#e8d2b8', hGnd: '#6b5a44', hemi: 0.85, mist: 0.30, cloud: '#e8dcc8', cop: 0.55 }],
  [sf('abrams', 0.5), { top: '#7d6f5e', hor: '#e2ac74', fog: '#d0a980', fn: 20, ff: 230, az: 100, el: 22, sun: '#ffdf9e', sunI: 1.6, hSky: '#e8d2b8', hGnd: '#6b5a44', hemi: 0.85, mist: 0.30, cloud: '#e8dcc8', cop: 0.55 }],
  [sf('count', 0.5),  { top: '#6e6250', hor: '#d8a06a', fog: '#c8a076', fn: 60, ff: 620, az: 102, el: 30, sun: '#ffe2a8', sunI: 1.7, hSky: '#e6d0b4', hGnd: '#685844', hemi: 0.88, mist: 0.22, cloud: '#e6dac4', cop: 0.50 }],
  [sf('advance', 0.5),{ top: '#7d6f5e', hor: '#e0aa72', fog: '#cfa87e', fn: 18, ff: 210, az: 100, el: 22, sun: '#ffdf9e', sunI: 1.6, hSky: '#e8d2b8', hGnd: '#6b5a44', hemi: 0.85, mist: 0.42, cloud: '#e8dcc8', cop: 0.55 }],
  [sf('smoke', 0.5),  { top: '#6a5f52', hor: '#c89a6c', fog: '#b99a76', fn: 8,  ff: 95,  az: 100, el: 20, sun: '#f2c98a', sunI: 1.3, hSky: '#d8c2a4', hGnd: '#5d4e3c', hemi: 0.75, mist: 0.85, cloud: '#d8c8b2', cop: 0.42 }],
  [sf('twist', 0.5),  { top: '#746554', hor: '#d89e68', fog: '#c4a07a', fn: 14, ff: 170, az: 101, el: 21, sun: '#f8d294', sunI: 1.5, hSky: '#e0c8aa', hGnd: '#62543f', hemi: 0.82, mist: 0.55, cloud: '#e0d2ba', cop: 0.50 }],
  [sf('ring', 0.5),   { top: '#6e5c4a', hor: '#dd9e64', fog: '#c49e78', fn: 16, ff: 200, az: 101, el: 20, sun: '#f8d294', sunI: 1.5, hSky: '#e0c8aa', hGnd: '#62543f', hemi: 0.82, mist: 0.45, cloud: '#e0d2ba', cop: 0.50 }],
  [sf('payoff', 0.5), { top: '#7a5f46', hor: '#f0b060', fog: '#d8ac7a', fn: 22, ff: 260, az: 103, el: 14, sun: '#ffd27a', sunI: 1.9, hSky: '#ecd6b6', hGnd: '#6b563e', hemi: 0.90, mist: 0.30, cloud: '#ecdcc2', cop: 0.55 }],
  [TOTAL - 1,         { top: '#7a5f46', hor: '#f0b060', fog: '#d8ac7a', fn: 22, ff: 260, az: 103, el: 14, sun: '#ffd27a', sunI: 1.9, hSky: '#ecd6b6', hGnd: '#6b563e', hemi: 0.90, mist: 0.30, cloud: '#ecdcc2', cop: 0.55 }],
];
const COL_FIELDS = ['top', 'hor', 'fog', 'sun', 'hSky', 'hGnd', 'cloud'];
const NUM_FIELDS = ['fn', 'ff', 'az', 'el', 'sunI', 'hemi', 'mist', 'cop'];
export const envAt = (f) => {
  let i = 0;
  while (i < ENV_KEYS.length - 2 && f > ENV_KEYS[i + 1][0]) i++;
  const [f0, A] = ENV_KEYS[i], [f1, B] = ENV_KEYS[i + 1];
  const u = clamp((f - f0) / Math.max(1, f1 - f0));
  const out = {};
  for (const k of COL_FIELDS) out[k] = lerp3(C(A[k]), C(B[k]), u);
  for (const k of NUM_FIELDS) out[k] = lerp(A[k], B[k], u);
  return out;
};
// dust bank strength 0..1: calm at the start, thick in the smoke section
export const mistBankAt = (f) => k1([[0, 0.25], [sf('advance', 1), 0.5], [sf('smoke', 0.5), 0.95], [sf('twist', 1), 0.55], [sf('ring', 1), 0.4], [TOTAL - 1, 0.3]], f);

// ---------- THE ARMIES: exactly 1000 Abrams + exactly 1000 T-90 ----------
// Per side: 25 columns x 40 rows = 1000. Abrams face +x (east), T-90 face -x.
export const COLS = 25, ROWS = 40, SIDE_COUNT = 1000, TANK_COUNT = 2000;
export const HERO_K = 500; // front-centre tank of each side (col 0, row 20)
const gridBase = (side, k) => {
  const col = k % COLS, row = Math.floor(k / COLS);
  const x = side === 0 ? -12 - col * 3.0 : 12 + col * 3.0;
  const z = -66.3 + row * 3.4;
  return [x, z];
};
// advance: both armies close the gap during P4, a little more during P5-P6.
// Total +10m: front faces end ~0.8m apart — close, but never interpenetrating.
const advU = (f) => smooth(ramp(f, sf('advance', 0.05), sf('advance', 0.95)));
const adv2U = (f) => smooth(ramp(f, sf('fire', 0.1), sf('smoke', 0.6)));
// flank: during twist+ring the T-90s swing around the Abrams to a ring
const flankU = (f) => smooth(ramp(f, sf('twist', 0.05), sf('ring', 0.85)));
export const abramsCentroid = (f) => [-48 + 8 * advU(f) + 2 * adv2U(f), 0];
export const ringPos = (k) => {
  const th = (k / SIDE_COUNT) * Math.PI * 2;
  const r = 21 + (k % 7) * 2.4;
  const c = abramsCentroid(TOTAL - 1);
  return [c[0] + Math.cos(th) * r, c[1] + Math.sin(th) * r];
};
// tankPoseAt(i, f) -> { p:[x,y,z], ry (hull yaw), try (turret yaw), side, k }
export function tankPoseAt(i, f) {
  const side = i < SIDE_COUNT ? 0 : 1, k = i % SIDE_COUNT;
  const [bx, bz] = gridBase(side, k);
  const dir = side === 0 ? 1 : -1; // facing: Abrams +x, T-90 -x
  let x = bx + dir * (8 * advU(f) + 2 * adv2U(f));
  let z = bz + Math.sin(f * 0.01 + i * 1.7) * 0.15; // idle shimmer, tiny
  let ry = dir > 0 ? 0 : Math.PI; // hull yaw: 0 faces +x
  let tr = ry; // turret yaw
  if (side === 1 && flankU(f) > 0) {
    const [rx, rz] = ringPos(k);
    const u = flankU(f);
    x = lerp(x, rx, u); z = lerp(z, rz, u);
    // hull turns to face the ring centre, turret aims at the centre
    const c = abramsCentroid(f);
    const aim = Math.atan2(-(c[1] - z), c[0] - x); // yaw that faces +x rotated: ry = -atan2(dz,dx)? see note
    // Our yaw convention: ry=0 faces +x, ry=PI faces -x; facing angle a => ry = -a
    ry = lerp(ry, -Math.atan2(c[1] - z, c[0] - x), u);
    tr = -Math.atan2(c[1] - z, c[0] - x);
  }
  // engine bob while advancing
  const moving = advU(f) > 0 && advU(f) < 1 ? 1 : (flankU(f) > 0 && flankU(f) < 1 && side === 1 ? 1 : 0);
  const y = moving ? Math.abs(Math.sin(f * 0.55 + i)) * 0.06 : 0;
  return { p: [x, y, z], ry, try: tr, side, k };
}
export const tankCountAt = () => TANK_COUNT;
export function heroPoseAt(side, f) { return tankPoseAt(side * SIDE_COUNT + HERO_K, f); }
export function centroidAt(f) {
  const a = abramsCentroid(f);
  return [a[0] + 24, 1.2, 0]; // midpoint of the two armies
}
// barrel tip world position of a hero tank (for muzzle flashes)
export function heroBarrelTip(side, f) {
  const pose = heroPoseAt(side, f);
  const yaw = pose.try;
  const fx = Math.cos(-yaw), fz = Math.sin(-yaw); // forward vector for yaw convention
  const bx = pose.p[0] + fx * 4.4, bz = pose.p[2] + fz * 4.4;
  return [bx, pose.p[1] + 1.55, bz];
}
// muzzle events: {f, side} — cannon shots (Abrams P5, Abrams last shot P8)
export const MUZZLE_EVENTS = [
  { f: 792, side: 0 }, { f: 831, side: 0 }, { f: 872, side: 0 },
  { f: 1215, side: 0 }, { f: 1240, side: 1 },
];
export const muzzleAt = (f) => MUZZLE_EVENTS.filter((e) => f >= e.f && f <= e.f + 3).map((e) => heroBarrelTip(e.side, f));
// burning tank (P8): one Abrams at the ring's edge catches fire
export const burnAt = (f) => {
  if (f < sf('ring', 0.25)) return null;
  const p = tankPoseAt(37, f).p; // a front-rank Abrams
  return [p[0], p[1] + 1.0, p[2]];
};

// ---------- title / message boards ----------
export const boardAt = (f) => {
  const fade = (a, b, c, d) => smooth(ramp(f, a, b)) * (1 - smooth(ramp(f, c, d)));
  if (f > sf('count', 0.12) && f < sf('count', 0.55)) return { text: '1000 vs 1000', alpha: fade(sf('count', 0.12), sf('count', 0.22), sf('count', 0.45), sf('count', 0.55)) };
  if (f >= sf('count', 0.55) && f < sf('count', 0.98)) return { text: '2000 TANKS!', alpha: fade(sf('count', 0.55), sf('count', 0.63), sf('count', 0.88), sf('count', 0.98)) };
  if (f >= sf('payoff', 0.12) && f < sf('payoff', 0.55)) return { text: 'JEET SANKHYA KI NAHI,', alpha: fade(sf('payoff', 0.12), sf('payoff', 0.22), sf('payoff', 0.48), sf('payoff', 0.55)) };
  if (f >= sf('payoff', 0.55) && f < TOTAL - 2) return { text: 'CHAAL KI HOTI HAI', alpha: fade(sf('payoff', 0.55), sf('payoff', 0.63), TOTAL - 16, TOTAL - 4) };
  return null;
};

// ---------- CAMERA: one continuous flight, voice-tracked ----------
const BK = 9;
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const CAMSEGS = [
  { a: 0, fn: (f) => ({ // HOOK — from the gap, looking west at the Abrams line
    pos: kf3([[0, [2, 3.0, 18]], [100, [0, 3.0, 14]], [206, [-2, 3.2, 10]]], f),
    look: kf3([[0, [-30, 1.5, -15]], [100, [-22, 1.5, -10]], [206, [-14, 1.5, -5]]], f), fov: 44 }) },
  { a: SEG.abrams.a, fn: (f) => { // ABRAMS HERO — from the gap, push in on the hero tank + commander
    const h = heroPoseAt(0, f).p;
    return {
      pos: kf3([[SEG.abrams.a, [-2, 3.2, 10]], [sf('abrams', 0.5), [0, 2.8, 7]], [sf('abrams', 1), [0, 2.6, 5.5]]], f),
      look: [h[0] + 1, h[1] + 2.0, h[2]], fov: 44 };
  } },
  { a: SEG.t90.a, fn: (f) => { // T-90 HERO — arc inside the gap, eyes on the Russian hero the whole time
    const h = heroPoseAt(1, f).p;
    return {
      pos: kf3([[SEG.t90.a, [0, 2.6, 5.5]], [sf('t90', 0.45), [0, 4, 14]], [sf('t90', 1), [4, 2.6, 5.5]]], f),
      look: [h[0] - 1, h[1] + 2.0, h[2]], fov: 42 };
  } },
  { a: SEG.count.a, fn: (f) => { // COUNT — climb out east: the whole field in depth, all 2000 tanks
    return {
      pos: kf3([[SEG.count.a, [4, 2.2, 3.5]], [sf('count', 0.4), [120, 45, 90]], [sf('count', 1), [220, 125, 12]]], f),
      look: lerp3([11, 2.0, 1.7], [0, 0, 0], smooth(ramp(f, sf('count', 0.05), sf('count', 0.45)))), fov: 60 };
  } },
  { a: SEG.advance.a, fn: (f) => { // ADVANCE — dive back into the gap, track the advancing front rank
    const h = heroPoseAt(0, f).p;
    return {
      pos: lerp3([235, 110, 30], [0, 3.2, 30], smooth(ramp(f, SEG.advance.a, sf('advance', 0.45)))),
      look: lerp3([0, 0, 0], [h[0], 1.5, 0], smooth(ramp(f, sf('advance', 0.1), sf('advance', 0.4)))), fov: 50 };
  } },
  { a: SEG.fire.a, fn: (f) => { // FIRE — inside the gap: hero Abrams firing, smoke screen beyond
    return {
      pos: kf3([[SEG.fire.a, [0, 10, 30]], [sf('fire', 0.5), [1, 10, 26]], [sf('fire', 1), [2, 9, 22]]], f),
      look: kf3([[SEG.fire.a, [-2, 1.6, 1.7]], [sf('fire', 0.5), [2, 1.6, 0]], [sf('fire', 1), [8, 1.6, -2]]], f), fov: 50 };
  } },
  { a: SEG.smoke.a, fn: (f) => ({ // SMOKE — inside the gap, the two lines facing off through smoke
    pos: kf3([[SEG.smoke.a, [2, 8, 18]], [sf('smoke', 0.5), [0, 9, 24]], [sf('smoke', 1), [-2, 8, 18]]], f),
    look: kf3([[SEG.smoke.a, [14, 1.6, -2]], [sf('smoke', 0.5), [0, 1.5, 0]], [sf('smoke', 1), [4, 1.5, -2]]], f), fov: 54 }) },
  { a: SEG.twist.a, fn: (f) => { // TWIST — whip up south-east as the T-90s turn
    const h = heroPoseAt(1, f).p;
    return {
      pos: lerp3([-2, 8, 18], [24, 7, 30], smooth(ramp(f, SEG.twist.a, sf('twist', 0.9)))),
      look: lerp3([4, 1.5, -2], [h[0], 1.5, h[2]], smooth(ramp(f, SEG.twist.a, sf('twist', 0.9)))), fov: 54 };
  } },
  { a: SEG.ring.a, fn: (f) => { // RING — rise and orbit the encirclement as it closes
    const c = abramsCentroid(f);
    const ang = lerp(0.6, 1.9, smooth(ramp(f, SEG.ring.a, sf('ring', 1))));
    const r = lerp(55, 42, smooth(ramp(f, SEG.ring.a, sf('ring', 1))));
    return {
      pos: [c[0] + Math.cos(ang) * r, lerp(6, 26, smooth(ramp(f, SEG.ring.a, sf('ring', 0.6)))), c[1] + Math.sin(ang) * r],
      look: [c[0], 1.5, c[1]], fov: 52 };
  } },
  { a: SEG.payoff.a, fn: (f) => ({ // PAYOFF — pull back to a wide golden shot of the ring
    pos: kf3([[SEG.payoff.a, [-5, 26, 40]], [sf('payoff', 0.5), [-30, 42, 70]], [TOTAL - 1, [-52, 58, 96]]], f),
    look: kf3([[SEG.payoff.a, [-38, 1.5, 0]], [sf('payoff', 0.5), [-38, 1.5, 0]], [TOTAL - 1, [-38, 1.5, 0]]], f), fov: 54 }) },
];
export function camAt(f) {
  let i = 0;
  for (let k = 0; k < CAMSEGS.length; k++) if (f >= CAMSEGS[k].a) i = k;
  let c = CAMSEGS[i].fn(f);
  const blendTo = (other, w) => { c = { pos: lerp3(c.pos, other.pos, w), look: lerp3(c.look, other.look, w), fov: lerp(c.fov, other.fov, w) }; };
  if (i + 1 < CAMSEGS.length && f > CAMSEGS[i + 1].a - BK) {
    blendTo(CAMSEGS[i + 1].fn(f), smooth(clamp((f - (CAMSEGS[i + 1].a - BK)) / (2 * BK))));
  } else if (i > 0 && f < CAMSEGS[i].a + BK) {
    const p = CAMSEGS[i - 1].fn(f), w = smooth(clamp((f - (CAMSEGS[i].a - BK)) / (2 * BK)));
    c = { pos: lerp3(p.pos, c.pos, w), look: lerp3(p.look, c.look, w), fov: lerp(p.fov, c.fov, w) };
  }
  let { pos, look, fov } = c;
  const t = f / FPS;
  pos = [pos[0] + Math.sin(t * 0.5) * 0.12, pos[1] + Math.sin(t * 0.8) * 0.06, pos[2]];
  return { pos, look, fov };
}
