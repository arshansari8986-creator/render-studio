// "Paisa + Life Value #2 — Rahul ₹30,000 Salary Story" — FINAL-ANIM-V2, coded cartoon Short.
// Pure frame math only: TIMING, cameras, environment, coins, expense boards,
// 50/30/20 bars, compounding growth chart, payoff. main.js renders; sweep verifies.
// Timing from the finished voice stem (98.008521 s, Epic Storyteller).
// v2 changes vs the first full film:
//  - Rahul WALKS (leg-cycle step phase) in the travel beats, arms up/reach/wave per beat.
//  - Salary RAIN during p1, DRAIN coins flying away during p2-p3, open EMPTY WALLET in p4.
//  - Friend wears GREEN (civC green shirt) + glasses, per the approved Design B scene.
//  - Camera: 10 DISTINCT SETUPS with HARD CUTS at phrase/beat boundaries (no blending),
//    each setup keeps moving inside its beat (dolly/orbit/push-in + drift).
//  - Every second animates: camera drift + clouds + idle + coins/flow never freeze.
import { clamp, lerp, lerp3, ramp, kf, kf3, spline, walk } from './motion.js';

export const FPS = 30;
export const TOTAL = 2940; // frames 0..2939 — final stem 98.008521s x 30fps
// TIMING [id, startFrame, endFrame] — one section per phrase, CONTIGUOUS.
export const TIMING = [
  ['p0', 0, 317], ['p1', 317, 544], ['p2', 544, 647], ['p3', 647, 1074],
  ['p4', 1074, 1159], ['p5', 1159, 1361], ['p6', 1361, 1762], ['p7', 1762, 1911],
  ['p8', 1911, 2047], ['p9', 2047, 2503], ['p10', 2503, 2714], ['p11', 2714, 2940],
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

// ---------- environment: warm golden morning, deeper gold at the lesson, teal-gold evening payoff ----------
const C = (h) => { const n = parseInt(h.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
const ENV_KEYS = [
  [0,              { top: '#f7c873', hor: '#ffe9b8', fog: '#f2d49a', fn: 18, ff: 220, az: 100, el: 32, sun: '#ffdf9e', sunI: 1.5, hSky: '#ffe9c0', hGnd: '#b09a68', hemi: 0.9, mist: 0.18, cloud: '#fff3d6', cop: 0.5 }],
  [sf('p3', 0.5),  { top: '#f2bd60', hor: '#ffe3a6', fog: '#eed096', fn: 18, ff: 220, az: 100, el: 30, sun: '#ffdf9e', sunI: 1.5, hSky: '#ffe6bc', hGnd: '#ac9662', hemi: 0.88, mist: 0.20, cloud: '#fff0cf', cop: 0.5 }],
  [sf('p5', 0.5),  { top: '#eeb254', hor: '#ffdf9c', fog: '#eacb8c', fn: 18, ff: 220, az: 101, el: 28, sun: '#ffdf9e', sunI: 1.5, hSky: '#ffe2b4', hGnd: '#a8945e', hemi: 0.88, mist: 0.20, cloud: '#ffedc6', cop: 0.5 }],
  [sf('p6', 0.5),  { top: '#e8a94e', hor: '#ffdd96', fog: '#e6c684', fn: 18, ff: 220, az: 101, el: 26, sun: '#ffdf9e', sunI: 1.55, hSky: '#ffdfb0', hGnd: '#a48d5a', hemi: 0.9, mist: 0.18, cloud: '#ffecc2', cop: 0.5 }],
  [sf('p9', 0.5),  { top: '#2e6f6a', hor: '#f7c873', fog: '#d8b878', fn: 18, ff: 240, az: 103, el: 16, sun: '#ffd27a', sunI: 1.8, hSky: '#ffe9c0', hGnd: '#7a6a48', hemi: 0.9, mist: 0.16, cloud: '#ffe9c0', cop: 0.5 }],
  [sf('p11', 0.5), { top: '#1f5f5a', hor: '#f2bd60', fog: '#d2b478', fn: 18, ff: 240, az: 103, el: 14, sun: '#ffd27a', sunI: 1.8, hSky: '#ffe6bc', hGnd: '#74644a', hemi: 0.9, mist: 0.16, cloud: '#ffe6bc', cop: 0.5 }],
  [TOTAL - 1,      { top: '#1f5f5a', hor: '#f2bd60', fog: '#d2b478', fn: 18, ff: 240, az: 103, el: 14, sun: '#ffd27a', sunI: 1.8, hSky: '#ffe6bc', hGnd: '#74644a', hemi: 0.9, mist: 0.16, cloud: '#ffe6bc', cop: 0.5 }],
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

// ---------- characters ----------
// Rahul (civA, blue) walks a small arc through the story; friend (green shirt + glasses) joins for p5-p6.
// Walk segments [startFrame, endFrame, speed]: leg-cycle step phase drives the walk while travelling.
const WALK_SEGS = [
  [0, 200, 1.35], [317, 544, 1.25], [647, 800, 0.9], [1159, 1250, 1.0],
  [1762, 1850, 1.1], [1911, 2047, 1.1], [2503, 2600, 1.0],
];
export const rahulAt = (f) => {
  const pos = k3([
    [0, [-4.2, 0, 2.0]], [100, [-3.0, 0, 1.6]], [200, [-0.9, 0, 0.9]], [317, [-0.6, 0, 1.0]],
    [430, [0.0, 0, 0.2]], [544, [0.4, 0, -0.6]], [647, [-0.4, 0, 0.6]], [800, [-1.2, 0, 0.8]],
    [1074, [-1.6, 0, 0.8]], [1159, [-1.5, 0, 1.3]], [1250, [-1.2, 0, 0.6]], [1361, [-1.8, 0, 0.6]],
    [1762, [-1.2, 0, 0.4]], [1850, [-0.6, 0, 0.2]], [1911, [-0.2, 0, 0.4]], [2047, [0.2, 0, 0.6]],
    [2503, [0.4, 0, 0.8]], [2600, [0, 0, 1.0]], [TOTAL - 1, [0, 0, 1.0]],
  ], f);
  const sec = secAt(f).id;
  const expr = sec === 'p0' ? 'wonder' : sec === 'p1' ? 'grin' : sec === 'p2' ? 'shock'
    : sec === 'p3' ? 'nervous' : sec === 'p4' ? 'pained' : sec === 'p5' ? 'neutral'
    : sec === 'p6' ? 'neutral' : sec === 'p7' ? 'grin' : sec === 'p8' ? 'grin'
    : sec === 'p9' ? 'grin' : sec === 'p10' ? 'stern' : 'grin';
  let armL = 'hang', armR = 'hang';
  if (sec === 'p1' && f > 500) { armL = 'wave'; armR = 'wave'; }
  else if (sec === 'p2') { armL = 'reach'; armR = 'reach'; }
  else if (sec === 'p3') { armR = 'point'; }
  else if (sec === 'p4') { armL = 'reach'; armR = 'reach'; }
  else if (sec === 'p6') { armR = 'point'; }
  else if (sec === 'p7') { armR = 'point'; }
  else if (sec === 'p8' || sec === 'p9') { armL = 'up'; armR = 'up'; }
  else if (sec === 'p11') { armL = 'wave'; armR = 'wave'; }
  let step = 0, walking = false;
  for (const [a, b, sp] of WALK_SEGS) {
    if (f >= a && f <= b) { step = walk(f, a, sp, 0.8).phase; walking = true; break; }
  }
  return { pos, expr, armL, armR, step, walking, visible: true };
};
export const friendAt = (f) => {
  const sec = secAt(f).id;
  const visible = sec === 'p5' || sec === 'p6';
  const pos = k3([[SEG.p5.a, [3.0, 0, 0.4]], [sf('p5', 0.4), [1.5, 0, 0.2]], [sf('p6', 1), [1.5, 0, 0.2]]], f);
  const walking = f >= SEG.p5.a && f <= sf('p5', 0.4);
  const step = walking ? walk(f, SEG.p5.a, 1.0, 0.8).phase : 0;
  return { pos, visible, expr: sec === 'p5' ? 'grin' : 'neutral', armL: 'hang', armR: sec === 'p5' ? 'point' : 'hang', step, walking };
};

// ---------- coins: the salary pile drains away, then a monthly flow into the pot ----------
// pile level 0..1: full at hook, topped up at salary, drained through p2-p3, empty at p4.
export const pileAt = (f) => k1([
  [0, 0.85], [sf('p1', 0.3), 1.0], [sf('p1', 1), 1.0],
  [sf('p2', 0.5), 0.62], [sf('p3', 0.35), 0.38], [sf('p3', 0.7), 0.22],
  [sf('p3', 1), 0.08], [sf('p4', 0.5), 0.0], [sf('p7', 0.5), 0.0],
  [sf('p9', 1), 0.0], [TOTAL - 1, 0.0],
], f);
// monthly investment flow (p7-p9): a continuous stream of coins, one full
// flight per 90 frames, staggered — coins keep arcing into the pot.
export const flowActive = (f) => ['p7', 'p8', 'p9'].includes(secAt(f).id);
export const flowU = (f, k, n) => {
  const ph = ((f - SEG.p7.a) / 90 - k / n) % 1;
  return ph < 0 ? ph + 1 : ph;
};
// the investment pot fills up (p7 -> p9)
export const potAt = (f) => k1([
  [0, 0], [sf('p7', 0.2), 0.06], [sf('p8', 0.5), 0.4], [sf('p9', 0.6), 0.85], [sf('p9', 1), 1.0], [TOTAL - 1, 1.0],
], f);

// ---------- salary RAIN (p1): gold coins fall from the sky onto the pile ----------
// n coins, each falls ~75 frames from y=13 to the pile, then restarts while active.
export const rainActive = (f) => f >= SEG.p1.a && f < SEG.p1.b;
export const rainU = (f, k, n) => {
  const cycle = 75;
  const ph = (((f - SEG.p1.a) / cycle) - k / n) % 1;
  return ph < 0 ? ph + 1 : ph;
};
// ---------- DRAIN coins (p2-p3): coins fly AWAY from the pile in arcs (money vanishing) ----------
export const drainActive = (f) => f >= SEG.p2.a && f < SEG.p3.b;
export const drainU = (f, k, n) => {
  const ph = (((f - SEG.p2.a) / 55) - k / n) % 1;
  return ph < 0 ? ph + 1 : ph;
};
// ---------- WALLET: opens during p4, visibly empty ----------
// {visible, flap 0..1 (0 closed, 1 fully open), pos}
export const walletAt = (f) => {
  const r = rahulAt(f);
  const visible = f >= SEG.p4.a && f < SEG.p5.a + 51;
  const flap = smooth(ramp(f, SEG.p4.a + 11, SEG.p4.a + 61));
  const pos = [r.pos[0] + 0.6, 0.95, r.pos[2] + 0.5];
  return { visible, flap, pos };
};

// ---------- expense boards (p3): three boards pop in one by one ----------
// returns [{pop 0..1}, ...] for [rent 10000, shopping 5000, EMI 5000]
export const expenseAt = (f) => {
  const a = SEG.p3.a, b = SEG.p3.b, len = b - a;
  const pop = (u0) => smooth(ramp(f, a + len * u0, a + len * (u0 + 0.08)));
  return [pop(0.02), pop(0.34), pop(0.66)];
};

// ---------- 50/30/20 bars (p6): heights grow one by one ----------
// returns [h50, h30, h20] each 0..1 of its full height (full = 50/30/20 proportional)
export const barsAt = (f) => {
  const a = SEG.p6.a, b = SEG.p6.b, len = b - a;
  const g = (u0) => smooth(ramp(f, a + len * u0, a + len * (u0 + 0.14)));
  return [g(0.05), g(0.36), g(0.67)];
};

// ---------- compounding growth chart (p8-p9): 10 bars, value counter ----------
// FV of SIP: 6000/month, 1% per month, end-of-period. n=240 -> ~59.36 lakh.
export const growthValueAt = (f) => {
  const u = smooth(ramp(f, sf('p8', 0.05), sf('p9', 0.85)));
  const n = u * 240;
  const fv = 6000 * ((Math.pow(1.01, n) - 1) / 0.01);
  return { u, lakh: fv / 100000, months: Math.round(n) };
};
export const growthBarsAt = (f) => {
  const { u } = growthValueAt(f);
  const bars = [];
  for (let k = 0; k < 10; k++) {
    const bk = (k + 1) / 10;
    const fvK = 6000 * ((Math.pow(1.01, bk * 240) - 1) / 0.01);
    const full = 6000 * ((Math.pow(1.01, 240) - 1) / 0.01);
    bars.push(clamp(u / bk) * (fvK / full));
  }
  return bars;
};

// ---------- captions: bottom band, one per phrase (short lines, gold keywords) ----------
// lines: [{ t, gold: [substrings to paint gold] }]
const CAPTIONS = {
  p0: [{ t: '₹30,000 कमाते थे…', gold: ['₹30,000'] }, { t: 'महीने के अंत में ₹100 भी नहीं बचे!', gold: ['₹100'] }],
  p1: [{ t: 'राहुल — हर महीने 1 तारीख को', gold: ['राहुल'] }, { t: 'सैलरी आती, और वह खुश हो जाता', gold: ['सैलरी'] }],
  p2: [{ t: 'लेकिन कुछ ही दिनों में', gold: [] }, { t: 'पैसा गायब होने लगता…', gold: ['पैसा'] }],
  p3: [{ t: '₹10,000 किराया • ₹5,000 शॉपिंग', gold: ['₹10,000', '₹5,000'] }, { t: '₹5,000 EMI • बाकी छोटे खर्चे', gold: ['₹5,000'] }],
  p4: [{ t: 'महीने के अंत में', gold: [] }, { t: 'राहुल के पास कुछ नहीं बचा', gold: [] }],
  p5: [{ t: 'दोस्त ने कहा — समस्या कमाई नहीं,', gold: [] }, { t: 'पैसे इस्तेमाल करने का तरीका है!', gold: ['तरीका'] }],
  p6: [{ t: '50% ज़रूरी • 30% इच्छाएँ', gold: ['50%', '30%'] }, { t: '20% बचत / निवेश', gold: ['20%'] }],
  p7: [{ t: 'राहुल ने हर महीने ₹6,000', gold: ['₹6,000'] }, { t: 'निवेश करना शुरू कर दिया', gold: ['निवेश'] }],
  p8: [{ t: 'समय के साथ पैसा बढ़ने लगा —', gold: ['पैसा'] }, { t: 'यही है Compounding की ताकत!', gold: ['Compounding'] }],
  p9: [{ t: '₹6,000/महीना • 12% • 20 साल', gold: ['₹6,000', '12%', '20 साल'] }, { t: '≈ ₹59.5 लाख!', gold: ['₹59.5 लाख'] }],
  p10: [{ t: 'अमीर बनने के लिए सिर्फ कमाना', gold: [] }, { t: 'काफी नहीं — संभालना भी सीखो', gold: ['संभालना'] }],
  p11: [{ t: 'पैसे के पीछे मत भागो,', gold: [] }, { t: 'पैसे को संभालना सीखो!', gold: ['संभालना'] }],
};
export const captionAt = (f) => {
  const sec = secAt(f);
  if (sec.id === 'p11') return { lines: CAPTIONS[sec.id], alpha: 0 }; // final hero board carries p11
  const fade = smooth(ramp(f, sec.a + 2, sec.a + 14)) * (1 - smooth(ramp(f, sec.b - 12, sec.b - 2)));
  return { lines: CAPTIONS[sec.id], alpha: fade };
};

// ---------- hero boards: big centre numbers ----------
// {lines:[{t, gold, small}], alpha} — null when none
export const heroAt = (f) => {
  const fade = (a, b, c, d) => smooth(ramp(f, a, b)) * (1 - smooth(ramp(f, c, d)));
  if (f >= sf('p0', 0.08) && f < sf('p0', 0.5)) return { lines: [{ t: '₹30,000', gold: true }, { t: 'हर महीने कमाते थे', gold: false }], alpha: fade(sf('p0', 0.08), sf('p0', 0.16), sf('p0', 0.42), sf('p0', 0.5)) };
  if (f >= sf('p0', 0.5) && f < sf('p0', 0.97)) return { lines: [{ t: '₹100 भी नहीं बचे!', gold: true }, { t: 'आखिर पैसा जाता कहाँ था?', gold: false }], alpha: fade(sf('p0', 0.5), sf('p0', 0.58), sf('p0', 0.88), sf('p0', 0.97)) };
  if (f >= sf('p4', 0.25) && f < sf('p4', 0.95)) return { lines: [{ t: '₹0 बचा', gold: true }, { t: 'महीने के अंत में कुछ नहीं', gold: false }], alpha: fade(sf('p4', 0.25), sf('p4', 0.35), sf('p4', 0.85), sf('p4', 0.95)) };
  if (f >= sf('p9', 0.3) && f < sf('p9', 0.98)) return {
    lines: [{ t: '₹59.5 लाख!', gold: true }, { t: '20 साल में • 12% रिटर्न', gold: false }, { t: 'रिटर्न की कोई गारंटी नहीं', gold: false, small: true }],
    alpha: fade(sf('p9', 0.3), sf('p9', 0.4), sf('p9', 0.88), sf('p9', 0.98)),
  };
  if (f >= sf('p11', 0.05) && f < TOTAL - 2) return {
    lines: [{ t: 'पैसे के पीछे मत भागो,', gold: false }, { t: 'पैसे को संभालना सीखो!', gold: true }, { t: 'Subscribe करो • Paisa + Life Value', gold: false, small: true }],
    alpha: fade(sf('p11', 0.05), sf('p11', 0.15), TOTAL - 18, TOTAL - 4),
  };
  return null;
};

// ---------- CAMERA: 10 DISTINCT SETUPS with HARD CUTS at phrase/beat boundaries ----------
// Each setup moves inside its beat (dolly/orbit/push-in) + continuous drift, so no
// two frames are ever identical. No blending across cuts — the cut IS the transition.
export const CAM_SETUPS = [
  { id: 'S1-hook', a: 0, b: 317 },
  { id: 'S2-salary', a: 317, b: 647 },
  { id: 'S3-expenses', a: 647, b: 1074 },
  { id: 'S4-wallet', a: 1074, b: 1159 },
  { id: 'S5-friend', a: 1159, b: 1361 },
  { id: 'S6-bars', a: 1361, b: 1762 },
  { id: 'S7-invest', a: 1762, b: 1911 },
  { id: 'S8-crane', a: 1911, b: 2503 },
  { id: 'S9-lesson', a: 2503, b: 2714 },
  { id: 'S10-final', a: 2714, b: 2940 },
];
export function camAt(f) {
  const r = rahulAt(f);
  let pos, look, fov;
  if (f < 317) {
    // S1 HOOK — low push-in wide as Rahul walks in, camera TRACKS him (he stays in frame)
    pos = kf3([[0, [-1.5, 2.4, 11]], [160, [-0.8, 2.2, 8.5]], [317, [-0.4, 2.2, 7.5]]], f);
    look = kf3([[0, [-3.4, 1.5, 1.8]], [100, [-2.0, 1.5, 1.0]], [200, [-0.5, 1.5, 0.5]], [317, [0.2, 1.5, -1]]], f);
    fov = 46;
  } else if (f < 647) {
    // S2 SALARY — medium from the opposite side, rain falling, pile topping up
    pos = kf3([[317, [3.2, 2.4, 6.5]], [480, [2.0, 2.8, 7.5]], [647, [0.5, 2.6, 8.5]]], f);
    look = kf3([[317, [-0.6, 1.4, 0.6]], [480, [0, 1.4, -1.5]], [647, [-0.5, 1.3, -2]]], f);
    fov = 47;
  } else if (f < 1074) {
    // S3 EXPENSES — wide: all three boards in frame
    pos = kf3([[647, [0.5, 2.6, 9.5]], [860, [0, 3.4, 12.0]], [1074, [0, 3.0, 11.0]]], f);
    look = kf3([[647, [0, 1.8, -3]], [860, [0, 2.2, -3.5]], [1074, [0, 2.0, -3.5]]], f);
    fov = 52;
  } else if (f < 1159) {
    // S4 WALLET — close-up on shocked Rahul + his open empty wallet
    pos = kf3([[1074, [-0.4, 1.9, 5.4]], [1159, [-0.8, 2.1, 6.2]]], f);
    look = kf3([[1074, [-1.5, 1.5, 1.0]], [1159, [-1.5, 1.5, 1.1]]], f);
    fov = 46;
  } else if (f < 1361) {
    // S5 FRIEND — two-shot, Rahul left, friend (green + glasses) right
    pos = kf3([[1159, [-0.6, 2.0, 7.0]], [1250, [0.2, 2.2, 9.5]], [1361, [0.2, 2.2, 9.5]]], f);
    look = [0.15, 1.5, 0.2];
    fov = 48;
  } else if (f < 1762) {
    // S6 BARS — wide on the 50/30/20 bars as they grow
    pos = kf3([[1361, [0.2, 2.6, 10.5]], [1560, [0, 3.0, 13.5]], [1762, [0, 2.8, 12.5]]], f);
    look = kf3([[1361, [0.2, 1.5, 0.2]], [1560, [0, 1.6, -4.5]], [1762, [0, 1.6, -4.5]]], f);
    fov = 52;
  } else if (f < 1911) {
    // S7 INVEST — Rahul tosses coins into the pot, stream arcing
    pos = kf3([[1762, [0, 2.8, 10.0]], [1830, [1.2, 2.6, 9.5]], [1911, [2.6, 2.4, 7.5]]], f);
    look = kf3([[1762, [-0.6, 1.3, 0.2]], [1830, [1.0, 1.3, -1.5]], [1911, [2.6, 1.2, -3.2]]], f);
    fov = 50;
  } else if (f < 2503) {
    // S8 CRANE — crane up over the rising compounding chart; starts low enough that
    // Rahul stays in frame (he is the one watching his money grow), ends wide so
    // all 10 chart bars fit (fov 54, 17 m back).
    pos = kf3([[1911, [1.5, 2.8, 7.5]], [2200, [0, 5.5, 11.5]], [2503, [-2.5, 7.0, 17.0]]], f);
    look = kf3([[1911, [0.8, 1.6, -2.5]], [2200, [0, 2.4, -4]], [2503, [0, 2.6, -4]]], f);
    fov = 54;
  } else if (f < 2714) {
    // S9 LESSON — back down to Rahul, calm
    pos = kf3([[2503, [-2.5, 7.0, 17.0]], [2600, [-1.0, 3.0, 9.0]], [2714, [-0.6, 2.2, 7.0]]], f);
    look = kf3([[2503, [0, 2.6, -4]], [2600, [0, 1.6, 0.5]], [2714, [0, 1.5, 0.8]]], f);
    fov = 48;
  } else {
    // S10 FINAL — settle on the subscribe board, slow push-in to the very last frame
    pos = kf3([[2714, [-0.6, 2.2, 7.0]], [2820, [0, 2.4, 8.0]], [2940, [0, 2.3, 7.2]]], f);
    look = kf3([[2714, [0, 1.5, 0.8]], [2820, [0, 2.2, -2]], [2940, [0, 2.3, -2.5]]], f);
    fov = 48;
  }
  // continuous drift: camera breathes so no two frames are ever identical
  const t = f / FPS;
  pos = [pos[0] + Math.sin(t * 0.6) * 0.12, pos[1] + Math.sin(t * 0.9) * 0.06, pos[2] + Math.cos(t * 0.45) * 0.08];
  return { pos, look, fov };
}
