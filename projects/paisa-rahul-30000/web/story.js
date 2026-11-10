// "Paisa + Life Value #2 — Rahul ₹30,000 Salary Story" — coded cartoon Short.
// Pure frame math only: TIMING, cameras, environment, coins, expense boards,
// 50/30/20 bars, compounding growth chart, payoff. main.js renders; sweep verifies.
// Timing from the finished voice stem (98.008521 s, Epic Storyteller).
import { clamp, lerp, lerp3, ramp, kf, kf3, spline } from './motion.js';

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
// Rahul (civA, blue) walks a small arc through the story; friend (friendB) joins for p5-p6.
export const rahulAt = (f) => {
  const pos = k3([
    [0, [-0.6, 0, 1.2]], [sf('p1', 0.5), [0.4, 0, -0.6]], [sf('p2', 0.5), [-0.4, 0, 0.6]],
    [sf('p3', 0.5), [-1.6, 0, 0.8]], [sf('p4', 0.5), [-0.6, 0, 1.0]], [sf('p5', 0.5), [-1.2, 0, 0.6]],
    [sf('p6', 0.5), [-1.8, 0, 0.6]], [sf('p7', 0.5), [-0.6, 0, 0.2]], [sf('p8', 0.5), [0.2, 0, 0.6]],
    [sf('p9', 0.5), [0.4, 0, 0.8]], [sf('p10', 0.5), [0, 0, 1.0]], [TOTAL - 1, [0, 0, 1.0]],
  ], f);
  const sec = secAt(f).id;
  const expr = sec === 'p0' ? 'wonder' : sec === 'p1' ? 'grin' : sec === 'p2' ? 'shock'
    : sec === 'p3' ? 'nervous' : sec === 'p4' ? 'pained' : sec === 'p5' ? 'neutral'
    : sec === 'p6' ? 'neutral' : sec === 'p7' ? 'grin' : sec === 'p8' ? 'grin'
    : sec === 'p9' ? 'grin' : sec === 'p10' ? 'stern' : 'grin';
  const arm = sec === 'p3' ? 'point' : sec === 'p6' ? 'point' : sec === 'p11' ? 'wave' : 'hang';
  return { pos, expr, arm, visible: sec !== 'p11' ? true : true };
};
export const friendAt = (f) => {
  const sec = secAt(f).id;
  const visible = sec === 'p5' || sec === 'p6';
  const pos = k3([[SEG.p5.a, [3.0, 0, 0.4]], [sf('p5', 0.4), [1.5, 0, 0.2]], [sf('p6', 1), [1.5, 0, 0.2]]], f);
  return { pos, visible, expr: sec === 'p5' ? 'grin' : 'neutral', arm: sec === 'p5' ? 'point' : 'hang' };
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

// ---------- CAMERA: one continuous flight, voice-tracked ----------
const BK = 9;
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const CAMSEGS = [
  { a: 0, fn: (f) => ({ // HOOK — low push-in on Rahul, puzzled, coin pile behind
    pos: kf3([[0, [-1.5, 2.4, 11]], [160, [-0.8, 2.2, 8.5]], [317, [-0.4, 2.2, 7.5]]], f),
    look: kf3([[0, [-0.4, 1.6, 0]], [160, [-0.2, 1.5, -0.5]], [317, [0.2, 1.5, -1]]], f), fov: 46 }) },
  { a: SEG.p1.a, fn: (f) => { // SALARY — orbit to the coin pile as it tops up, Rahul grins
    const r = rahulAt(f).pos;
    return {
      pos: kf3([[SEG.p1.a, [-0.4, 2.2, 7.5]], [sf('p1', 0.5), [2.5, 2.6, 6.5]], [sf('p1', 1), [3.2, 2.4, 5.5]]], f),
      look: [r[0], 1.4, r[2] - 1.5], fov: 46 };
  } },
  { a: SEG.p2.a, fn: (f) => ({ // VANISH — pull back, coins draining
    pos: kf3([[SEG.p2.a, [3.2, 2.4, 5.5]], [sf('p2', 1), [0.5, 2.6, 8.5]]], f),
    look: kf3([[SEG.p2.a, [0, 1.4, -2]], [sf('p2', 1), [-0.5, 1.3, -2]]], f), fov: 48 }) },
  { a: SEG.p3.a, fn: (f) => ({ // EXPENSES — wide: all three boards in frame
    pos: kf3([[SEG.p3.a, [0.5, 2.6, 9.5]], [sf('p3', 0.4), [0, 3.4, 12.0]], [sf('p3', 1), [0, 3.0, 11.0]]], f),
    look: kf3([[SEG.p3.a, [0, 1.8, -3]], [sf('p3', 0.4), [0, 2.2, -3.5]], [sf('p3', 1), [0, 2.0, -3.5]]], f), fov: 52 }) },
  { a: SEG.p4.a, fn: (f) => ({ // EMPTY — close on Rahul, empty hands
    pos: kf3([[SEG.p4.a, [0, 3.0, 9.5]], [sf('p4', 1), [-0.6, 2.0, 6.0]]], f),
    look: kf3([[SEG.p4.a, [0, 1.8, -3.5]], [sf('p4', 1), [-0.6, 1.5, 0.8]]], f), fov: 46 }) },
  { a: SEG.p5.a, fn: (f) => { // FRIEND — two-shot, Rahul left, friend right
    return {
      pos: kf3([[SEG.p5.a, [-0.6, 2.0, 7.0]], [sf('p5', 0.5), [0.2, 2.2, 9.5]], [sf('p5', 1), [0.2, 2.2, 9.5]]], f),
      look: [0.15, 1.5, 0.2], fov: 48 };
  } },
  { a: SEG.p6.a, fn: (f) => ({ // RULE — wide on the 50/30/20 bars
    pos: kf3([[SEG.p6.a, [0.2, 2.6, 10.5]], [sf('p6', 0.4), [0, 3.0, 13.5]], [sf('p6', 1), [0, 2.8, 12.5]]], f),
    look: kf3([[SEG.p6.a, [0.2, 1.5, 0.2]], [sf('p6', 0.4), [0, 1.6, -4.5]], [sf('p6', 1), [0, 1.6, -4.5]]], f), fov: 52 }) },
  { a: SEG.p7.a, fn: (f) => ({ // INVEST — Rahul tosses coins into the pot
    pos: kf3([[SEG.p7.a, [0, 2.8, 10.0]], [sf('p7', 0.5), [1.2, 2.6, 9.5]], [sf('p7', 1), [2.6, 2.4, 7.5]]], f),
    look: kf3([[SEG.p7.a, [-0.6, 1.3, 0.2]], [sf('p7', 0.5), [1.0, 1.3, -1.5]], [sf('p7', 1), [2.6, 1.2, -3.2]]], f), fov: 50 }) },
  { a: SEG.p8.a, fn: (f) => ({ // COMPOUNDING — crane up over the rising chart
    pos: kf3([[SEG.p8.a, [3.4, 2.2, 6.0]], [sf('p8', 0.5), [1.0, 4.5, 10.0]], [sf('p8', 1), [0, 5.5, 11.5]]], f),
    look: kf3([[SEG.p8.a, [2.6, 1.2, -3.2]], [sf('p8', 0.5), [0, 2.2, -4]], [sf('p8', 1), [0, 2.4, -4]]], f), fov: 50 }) },
  { a: SEG.p9.a, fn: (f) => ({ // PAYOFF — wide golden shot of the full chart + pot
    pos: kf3([[SEG.p9.a, [0, 5.5, 11.5]], [sf('p9', 0.5), [-1.5, 6.5, 13.5]], [sf('p9', 1), [-2.5, 7.0, 15.0]]], f),
    look: kf3([[SEG.p9.a, [0, 2.4, -4]], [sf('p9', 0.5), [0, 2.6, -4]], [sf('p9', 1), [0, 2.6, -4]]], f), fov: 52 }) },
  { a: SEG.p10.a, fn: (f) => ({ // LESSON — back down to Rahul, calm
    pos: kf3([[SEG.p10.a, [-2.5, 7.0, 15.0]], [sf('p10', 0.5), [-1.0, 3.0, 9.0]], [sf('p10', 1), [-0.6, 2.2, 7.0]]], f),
    look: kf3([[SEG.p10.a, [0, 2.6, -4]], [sf('p10', 0.5), [0, 1.6, 0.5]], [sf('p10', 1), [0, 1.5, 0.8]]], f), fov: 48 }) },
  { a: SEG.p11.a, fn: (f) => ({ // FINAL — settle on the subscribe board
    pos: kf3([[SEG.p11.a, [-0.6, 2.2, 7.0]], [sf('p11', 0.5), [0, 2.4, 8.0]], [TOTAL - 1, [0, 2.4, 8.0]]], f),
    look: kf3([[SEG.p11.a, [0, 1.5, 0.8]], [sf('p11', 0.5), [0, 2.2, -2]], [TOTAL - 1, [0, 2.2, -2]]], f), fov: 48 }) },
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
  pos = [pos[0] + Math.sin(t * 0.5) * 0.1, pos[1] + Math.sin(t * 0.8) * 0.05, pos[2]];
  return { pos, look, fov };
}
