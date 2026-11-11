// MAX — "Tumhari Salary Har Mahine Gayab Kyun Ho Jati Hai?" — coded 3D stickman Short.
// Pure frame math only: TIMING, cameras, environment, coins, phone, wallet,
// expense boards, holographic dashboard, 50/30/20 jars, savings vault, rooftop.
// main.js renders; sweep verifies. Voice stem 69.4685 s, Deep Storyteller.
// 50/30/20 is staged as a GUIDELINE (script line P6 says so) — no return
// promise, no wealth claim anywhere.
import { clamp, lerp, lerp3, ramp, kf, kf3, spline, walk } from './motion.js';

export const FPS = 30;
export const TOTAL = 2084; // frames 0..2083 — stem 69.4685s x 30fps
export const TIMING = [
  ['p0', 0, 180], ['p1', 180, 333], ['p2', 333, 582], ['p3', 582, 790],
  ['p4', 790, 959], ['p5', 959, 1249], ['p6', 1249, 1551], ['p7', 1551, 1710],
  ['p8', 1727, 1950], ['p9', 1950, 2084],
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

// ---------- environment: dark navy / charcoal with golden highlights ----------
// p0-p2 apartment (navy evening), p3 night (deep blue, moon), p4-p7 planning room
// (teal-navy, warm gold), p8-p9 rooftop sunrise (warm gold horizon, navy sky).
const C = (h) => { const n = parseInt(h.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
const ENV_KEYS = [
  [0,              { top: '#141d33', hor: '#2c3c5e', fog: '#1a2438', fn: 16, ff: 200, az: 100, el: 38, sun: '#ffd76a', sunI: 1.1, hSky: '#c8d4e8', hGnd: '#3a3f4a', hemi: 0.85, mist: 0.22, cloud: '#8fa0c0', cop: 0.4 }],
  [sf('p2', 0.5),  { top: '#101827', hor: '#26324e', fog: '#161f30', fn: 16, ff: 200, az: 100, el: 34, sun: '#ffd76a', sunI: 1.0, hSky: '#b8c4d8', hGnd: '#34383f', hemi: 0.8, mist: 0.24, cloud: '#7e8fb0', cop: 0.4 }],
  [sf('p3', 0.3),  { top: '#0a1020', hor: '#1a2540', fog: '#0e1526', fn: 14, ff: 180, az: 105, el: 48, sun: '#cfe0ff', sunI: 0.55, hSky: '#8a9cc0', hGnd: '#1e222c', hemi: 0.7, mist: 0.3, cloud: '#5a6a90', cop: 0.3 }],
  [sf('p4', 0.3),  { top: '#14283c', hor: '#2e6f6a', fog: '#182634', fn: 16, ff: 200, az: 100, el: 32, sun: '#ffd76a', sunI: 1.2, hSky: '#c8d4e8', hGnd: '#3a3f4a', hemi: 0.9, mist: 0.2, cloud: '#8fa0c0', cop: 0.4 }],
  [sf('p6', 0.5),  { top: '#12233a', hor: '#2c4a6a', fog: '#16222f', fn: 16, ff: 200, az: 100, el: 30, sun: '#ffd76a', sunI: 1.25, hSky: '#c8d4e8', hGnd: '#3a3f4a', hemi: 0.9, mist: 0.2, cloud: '#8fa0c0', cop: 0.4 }],
  [sf('p8', 0.1),  { top: '#1f3a5e', hor: '#f7b95c', fog: '#c98f4e', fn: 18, ff: 240, az: 95, el: 12, sun: '#ffb84d', sunI: 1.9, hSky: '#ffe9c0', hGnd: '#6a5a42', hemi: 1.0, mist: 0.16, cloud: '#ffd9a0', cop: 0.5 }],
  [sf('p9', 0.5),  { top: '#2e5a8a', hor: '#ffc95e', fog: '#d8a05e', fn: 18, ff: 240, az: 95, el: 16, sun: '#ffcf6a', sunI: 2.0, hSky: '#ffe9c0', hGnd: '#6a5a42', hemi: 1.0, mist: 0.14, cloud: '#ffe0a8', cop: 0.5 }],
  [TOTAL - 1,      { top: '#2e5a8a', hor: '#ffc95e', fog: '#d8a05e', fn: 18, ff: 240, az: 95, el: 16, sun: '#ffcf6a', sunI: 2.0, hSky: '#ffe9c0', hGnd: '#6a5a42', hemi: 1.0, mist: 0.14, cloud: '#ffe0a8', cop: 0.5 }],
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

// ---------- MAX ----------
// Walks a small arc through the sets; expressions + arms per phrase.
// Arms: hang / reach / up / wave / point / hold / write / sit (see max.js).
const WALK_SEGS = [
  [0, 90, 1.0], [180, 260, 1.1], [333, 420, 0.9], [790, 850, 1.0],
  [1551, 1620, 0.9], [1727, 1820, 1.0], [1950, 2000, 0.8],
];
export const maxAt = (f) => {
  const pos = k3([
    [0, [-0.6, 0, 1.2]], [90, [-0.4, 0, 0.9]], [180, [-0.5, 0, 1.0]],
    [260, [0.2, 0, 0.4]], [333, [0.4, 0, 0.0]], [420, [-0.6, 0, 0.8]],
    [582, [-1.2, 0, 0.6]], [790, [-1.0, 0, 0.8]], [850, [-0.6, 0, 0.6]],
    [959, [-0.8, 0, 0.6]], [1249, [-0.8, 0, 0.6]], [1551, [-0.4, 0, 0.4]],
    [1620, [0.2, 0, 0.2]], [1710, [0.2, 0, 0.2]], [1727, [0.2, 0, 0.8]],
    [1820, [0.0, 0, 1.0]], [1950, [0.0, 0, 1.2]], [TOTAL - 1, [0, 0, 1.2]],
  ], f);
  const sec = secAt(f).id;
  const expr = sec === 'p0' ? 'shocked' : sec === 'p1' ? 'happy' : sec === 'p2' ? 'worried'
    : sec === 'p3' ? 'sad' : sec === 'p4' ? 'serious' : sec === 'p5' ? 'confident'
    : sec === 'p6' ? 'serious' : sec === 'p7' ? 'confident' : sec === 'p8' ? 'confident' : 'happy';
  let armL = 'hang', armR = 'hang';
  if (sec === 'p0') { armL = 'hold'; armR = 'hold'; }
  else if (sec === 'p1') { armL = 'up'; armR = 'up'; }
  else if (sec === 'p2') { armL = 'reach'; armR = 'reach'; }
  else if (sec === 'p3') { armL = 'sit'; armR = 'sit'; }
  else if (sec === 'p4') { armL = 'write'; armR = 'write'; }
  else if (sec === 'p5') { armR = 'point'; }
  else if (sec === 'p6') { armL = 'hang'; armR = 'point'; }
  else if (sec === 'p7') { armL = 'hold'; armR = 'hold'; }
  else if (sec === 'p8') { armL = 'up'; armR = 'up'; }
  else if (sec === 'p9') { armL = 'wave'; armR = 'wave'; }
  let step = 0, walking = false;
  for (const [a, b, sp] of WALK_SEGS) {
    if (f >= a && f <= b) { step = walk(f, a, sp, 0.8).phase; walking = true; break; }
  }
  const sit = sec === 'p3';
  return { pos, expr, armL, armR, step, walking, sit, visible: true };
};

// ---------- coins: salary pile (full at p1, drains through p2-p3, empty at p4+) ----------
export const pileAt = (f) => k1([
  [0, 0.55], [sf('p1', 0.3), 1.0], [sf('p1', 1), 1.0],
  [sf('p2', 0.5), 0.55], [sf('p3', 0.5), 0.18], [sf('p3', 1), 0.0],
  [TOTAL - 1, 0.0],
], f);
// salary RAIN (p1)
export const rainActive = (f) => f >= SEG.p1.a && f < SEG.p1.b;
export const rainU = (f, k, n) => {
  const cycle = 70;
  const ph = (((f - SEG.p1.a) / cycle) - k / n) % 1;
  return ph < 0 ? ph + 1 : ph;
};
// DRAIN coins (p2-p3): fly away from the pile toward the expense boards
export const drainActive = (f) => f >= SEG.p2.a && f < SEG.p3.b;
export const drainU = (f, k, n) => {
  const ph = (((f - SEG.p2.a) / 55) - k / n) % 1;
  return ph < 0 ? ph + 1 : ph;
};
// JAR flow (p5-p6): coins arc from MAX into the three jars, staggered
export const jarFlowActive = (f) => ['p5', 'p6'].includes(secAt(f).id);
export const jarFlowU = (f, k, n) => {
  const ph = (((f - SEG.p5.a) / 75) - k / n) % 1;
  return ph < 0 ? ph + 1 : ph;
};
// VAULT flow (p7): coins arc from MAX into the vault
export const vaultFlowActive = (f) => secAt(f).id === 'p7';
export const vaultFlowU = (f, k, n) => {
  const ph = (((f - SEG.p7.a) / 60) - k / n) % 1;
  return ph < 0 ? ph + 1 : ph;
};
// single falling coin (p3 zero balance): one coin drops onto the table, once
export const singleCoinAt = (f) => {
  if (f < SEG.p3.a + 40 || f >= SEG.p3.b) return { visible: false, y: 0 };
  const u = clamp((f - (SEG.p3.a + 40)) / 45);
  const y = 2.6 - u * 2.6 + (u >= 1 ? 0 : 0);
  const bounce = u >= 1 ? Math.abs(Math.sin((f - (SEG.p3.a + 85)) * 0.35)) * 0.12 * Math.exp(-(f - (SEG.p3.a + 85)) / 25) : 0;
  return { visible: true, y: y + bounce, landed: u >= 1 };
};

// ---------- WALLET: extreme close-up in the hook (p0), then on the table at night (p3) ----------
// {visible, flap 0..1, pos, scale, faceCam}
export const walletAt = (f) => {
  const r = maxAt(f);
  if (f < SEG.p0.b) {
    // hook: wallet floats at MAX's side (never in front of his face), flap opens,
    // then camera pushes to his shocked face
    const flap = smooth(ramp(f, 12, 55));
    const u = smooth(ramp(f, 60, SEG.p0.b));
    const pos = [lerp(r.pos[0] + 1.0, r.pos[0] + 0.95, u), lerp(1.0, 0.9, u), lerp(r.pos[2] + 0.7, r.pos[2] + 0.5, u)];
    return { visible: true, flap, pos, scale: lerp(0.5, 0.38, u) };
  }
  if (secAt(f).id === 'p3') {
    return { visible: true, flap: 1, pos: [-0.4, 0.95, 0.9], scale: 0.42 };
  }
  return { visible: false, flap: 0, pos: [0, 0, 0], scale: 0.4 };
};

// ---------- PHONE (p1): salary notification ----------
// {visible, glow 0..1, pos}
export const phoneAt = (f) => {
  const r = maxAt(f);
  const visible = secAt(f).id === 'p1';
  const glow = smooth(ramp(f, SEG.p1.a + 5, SEG.p1.a + 25));
  return { visible, glow, pos: [r.pos[0] + 0.95, 1.15, r.pos[2] + 0.5] };
};

// ---------- expense boards (p2): six labels, pop in one by one (NO amounts invented) ----------
// returns [pop 0..1 x6] for [किराया, राशन, बिजली का बिल, EMI, ऑनलाइन शॉपिंग, बाहर का खाना]
export const expenseAt = (f) => {
  const a = SEG.p2.a, b = SEG.p2.b, len = b - a;
  const pop = (u0) => smooth(ramp(f, a + len * u0, a + len * (u0 + 0.07)));
  return [pop(0.02), pop(0.17), pop(0.32), pop(0.47), pop(0.62), pop(0.77)];
};

// ---------- holographic dashboard (p4): panels fade in, bars animate ----------
// {visible, alpha, bars [0..1 x4]}
export const dashboardAt = (f) => {
  const a = SEG.p4.a, b = SEG.p4.b, len = b - a;
  const alpha = smooth(ramp(f, a + 4, a + 30)) * (1 - smooth(ramp(f, b - 18, b - 2)));
  const bar = (u0) => smooth(ramp(f, a + len * u0, a + len * (u0 + 0.12)));
  return { visible: alpha > 0.01, alpha, bars: [bar(0.1), bar(0.3), bar(0.5), bar(0.7)] };
};

// ---------- 50/30/20 jars (p5-p6): fill levels grow one by one ----------
// returns [fill50, fill30, fill20] each 0..1
export const jarsAt = (f) => {
  const a = SEG.p5.a, b = SEG.p5.b, len = b - a;
  const g = (u0) => smooth(ramp(f, a + len * u0, a + len * (u0 + 0.16)));
  return [g(0.04), g(0.38), g(0.7)];
};
export const jarsVisible = (f) => ['p5', 'p6'].includes(secAt(f).id);

// ---------- savings VAULT (p7 only): door opens, coins in, door closes + glows ----------
// {visible, door 0..1 (0 closed, 1 open), glow 0..1}
export const vaultAt = (f) => {
  const sec = secAt(f);
  if (sec.id !== 'p7') return { visible: false, door: 0, glow: 0 };
  const a = SEG.p7.a, b = SEG.p7.b;
  const door = smooth(ramp(f, a + 6, a + 30)) * (1 - smooth(ramp(f, a + 62, b - 8)));
  const glow = smooth(ramp(f, a + 62, b - 2));
  return { visible: true, door, glow };
};

// ---------- captions: bottom band, one per phrase (short lines, gold keywords) ----------
const CAPTIONS = {
  p0: [{ t: 'हर महीने ₹30,000 कमाते हो…', gold: ['₹30,000'] }, { t: 'फिर भी आखिर में जेब खाली क्यों?', gold: ['जेब खाली'] }],
  p1: [{ t: 'पहली तारीख को सैलरी आती है,', gold: ['सैलरी'] }, { t: 'और तुम खुश हो जाते हो।', gold: ['खुश'] }],
  p2: [{ t: 'किराया • राशन • बिजली का बिल', gold: [] }, { t: 'EMI • शॉपिंग • बाहर का खाना', gold: ['EMI'] }],
  p3: [{ t: 'धीरे-धीरे पूरा पैसा खत्म…', gold: ['पैसा'] }, { t: 'बैंक बैलेंस लगभग ज़ीरो!', gold: ['ज़ीरो'] }],
  p4: [{ t: 'समाधान है — पहले हर खर्च', gold: ['खर्च'] }, { t: 'लिखना शुरू करो।', gold: [] }],
  p5: [{ t: '50% ज़रूरी • 30% इच्छाएँ', gold: ['50%', '30%'] }, { t: '20% बचत के लिए', gold: ['20%'] }],
  p6: [{ t: 'ये गाइडलाइन है,', gold: ['गाइडलाइन'] }, { t: 'कोई सख्त नियम नहीं।', gold: [] }],
  p7: [{ t: 'बचत महीने के अंत में नहीं,', gold: ['बचत'] }, { t: 'सैलरी आते ही अलग करो।', gold: ['सैलरी'] }],
  p8: [{ t: 'ज़्यादा कमाना ही सब कुछ नहीं,', gold: [] }, { t: 'पैसे को संभालना भी सीखो।', gold: ['संभालना'] }],
  p9: [{ t: 'ऐसी ही Money की बातें', gold: ['Money'] }, { t: 'सीखने के लिए Subscribe करो।', gold: ['Subscribe'] }],
};
export const captionAt = (f) => {
  const sec = secAt(f);
  if (sec.id === 'p9') return { lines: CAPTIONS[sec.id], alpha: 0 }; // final hero board carries p9
  const fade = smooth(ramp(f, sec.a + 2, sec.a + 14)) * (1 - smooth(ramp(f, sec.b - 12, sec.b - 2)));
  return { lines: CAPTIONS[sec.id], alpha: fade };
};

// ---------- hero boards: big centre numbers ----------
// {lines:[{t, gold, small}], alpha} — null when none
export const heroAt = (f) => {
  const fade = (a, b, c, d) => smooth(ramp(f, a, b)) * (1 - smooth(ramp(f, c, d)));
  if (f >= sf('p0', 0.08) && f < sf('p0', 0.5)) return { lines: [{ t: '₹30,000', gold: true }, { t: 'हर महीने कमाते हो', gold: false }], alpha: fade(sf('p0', 0.08), sf('p0', 0.16), sf('p0', 0.42), sf('p0', 0.5)) };
  if (f >= sf('p0', 0.5) && f < sf('p0', 0.97)) return { lines: [{ t: 'जेब खाली क्यों?', gold: true }, { t: 'महीने के आखिर में', gold: false }], alpha: fade(sf('p0', 0.5), sf('p0', 0.58), sf('p0', 0.88), sf('p0', 0.97)) };
  if (f >= sf('p1', 0.2) && f < sf('p1', 0.95)) return { lines: [{ t: 'SALARY आई!', gold: true }, { t: '₹30,000 CREDITED', gold: false }], alpha: fade(sf('p1', 0.2), sf('p1', 0.3), sf('p1', 0.85), sf('p1', 0.95)) };
  if (f >= sf('p3', 0.3) && f < sf('p3', 0.95)) return { lines: [{ t: 'बैलेंस ≈ ₹0', gold: true }, { t: 'महीने के आखिर में', gold: false }], alpha: fade(sf('p3', 0.3), sf('p3', 0.4), sf('p3', 0.85), sf('p3', 0.95)) };
  if (f >= sf('p5', 0.35) && f < sf('p6', 0.5)) return { lines: [{ t: '50% • 30% • 20%', gold: true }, { t: 'तीन हिस्सों में बाँटो', gold: false }], alpha: fade(sf('p5', 0.35), sf('p5', 0.45), sf('p6', 0.4), sf('p6', 0.5)) };
  if (f >= sf('p7', 0.3) && f < sf('p7', 0.98)) return { lines: [{ t: 'SAVE FIRST!', gold: true }, { t: 'सैलरी आते ही अलग करो', gold: false }], alpha: fade(sf('p7', 0.3), sf('p7', 0.4), sf('p7', 0.88), sf('p7', 0.98)) };
  if (f >= sf('p9', 0.05) && f < TOTAL - 2) return {
    lines: [{ t: 'पैसे को संभालना सीखो!', gold: true }, { t: 'Subscribe करो • Paisa + Life Value', gold: false, small: true }],
    alpha: fade(sf('p9', 0.05), sf('p9', 0.15), TOTAL - 18, TOTAL - 4),
  };
  return null;
};

// ---------- CAMERA: 10 DISTINCT SETUPS with HARD CUTS at phrase/beat boundaries ----------
// Each setup moves inside its beat (dolly/orbit/push-in) + continuous drift, so no
// two frames are ever identical. Composition changes every 2–4 seconds.
export const CAM_SETUPS = [
  { id: 'S1-wallet-ecu', a: 0, b: 90 },
  { id: 'S2-hook-face', a: 90, b: 180 },
  { id: 'S3-salary', a: 180, b: 333 },
  { id: 'S4-expenses', a: 333, b: 582 },
  { id: 'S5-zero-night', a: 582, b: 790 },
  { id: 'S6-dashboard', a: 790, b: 959 },
  { id: 'S7-jars', a: 959, b: 1249 },
  { id: 'S8-jars-close', a: 1249, b: 1551 },
  { id: 'S9-vault', a: 1551, b: 1710 },
  { id: 'S10-rooftop', a: 1710, b: 2084 },
];
export function camAt(f) {
  const r = maxAt(f);
  let pos, look, fov;
  if (f < 90) {
    // S1 WALLET ECU — close-up of the open empty wallet at MAX's side, slow push
    pos = kf3([[0, [0.6, 1.6, 6.6]], [90, [0.3, 1.5, 5.6]]], f);
    look = kf3([[0, [0.0, 1.7, 1.6]], [90, [-0.3, 1.7, 1.3]]], f);
    fov = 42;
  } else if (f < 180) {
    // S2 HOOK FACE — push toward MAX's shocked face (camera back so the hero
    // board never covers his head)
    pos = kf3([[90, [-0.2, 1.8, 6.8]], [180, [-0.4, 1.9, 5.8]]], f);
    look = kf3([[90, [-0.5, 1.6, 1.0]], [180, [-0.5, 1.7, 1.0]]], f);
    fov = 44;
  } else if (f < 333) {
    // S3 SALARY — medium on MAX + phone at his side, coins raining
    pos = kf3([[180, [2.6, 2.2, 7.0]], [260, [1.2, 2.6, 8.0]], [333, [0.4, 2.4, 8.4]]], f);
    look = kf3([[180, [-0.4, 1.4, 0.6]], [260, [0, 1.4, 0.2]], [333, [-0.2, 1.4, 0.0]]], f);
    fov = 47;
  } else if (f < 582) {
    // S4 EXPENSES — wide orbit: all six expense boards in frame
    pos = kf3([[333, [0.4, 2.6, 12.0]], [460, [3.5, 3.2, 10.5]], [582, [-2.5, 3.0, 11.5]]], f);
    look = kf3([[333, [0, 1.8, -2.5]], [460, [0, 2.0, -3.0]], [582, [0, 1.9, -2.8]]], f);
    fov = 52;
  } else if (f < 790) {
    // S5 ZERO NIGHT — low close on seated MAX, single coin falls
    pos = kf3([[582, [-0.2, 1.6, 6.4]], [700, [-0.8, 1.4, 5.8]], [790, [-0.6, 1.5, 6.2]]], f);
    look = kf3([[582, [-1.1, 1.25, 0.7]], [700, [-1.1, 1.2, 0.7]], [790, [-1.0, 1.25, 0.7]]], f);
    fov = 46;
  } else if (f < 959) {
    // S6 DASHBOARD — medium on MAX + floating holographic panels
    pos = kf3([[790, [1.8, 2.2, 7.8]], [880, [0.6, 2.4, 8.8]], [959, [0.2, 2.3, 9.0]]], f);
    look = kf3([[790, [-0.4, 1.6, -1.0]], [880, [-0.2, 1.7, -2.0]], [959, [-0.2, 1.7, -2.2]]], f);
    fov = 48;
  } else if (f < 1249) {
    // S7 JARS — wide on the three jars as they fill
    pos = kf3([[959, [0.2, 2.4, 10.0]], [1100, [0, 3.0, 12.5]], [1249, [0, 2.8, 11.5]]], f);
    look = kf3([[959, [-0.4, 1.4, -3.0]], [1100, [0, 1.6, -3.5]], [1249, [0, 1.6, -3.5]]], f);
    fov = 52;
  } else if (f < 1551) {
    // S8 JARS CLOSE — closer, MAX points at the jars, guideline line
    pos = kf3([[1249, [0, 2.8, 11.5]], [1400, [0.5, 2.4, 9.5]], [1551, [0.8, 2.2, 9.5]]], f);
    look = kf3([[1249, [0, 1.6, -3.5]], [1400, [0, 1.5, -3.0]], [1551, [0, 1.5, -3.0]]], f);
    fov = 50;
  } else if (f < 1710) {
    // S9 VAULT — MAX places coins in the vault, door closes + glows
    pos = kf3([[1551, [2.2, 2.2, 8.5]], [1630, [1.6, 2.6, 9.5]], [1710, [1.0, 2.4, 10.0]]], f);
    look = kf3([[1551, [0.6, 1.3, 0.2]], [1630, [1.2, 1.4, -2.0]], [1710, [1.4, 1.4, -2.5]]], f);
    fov = 50;
  } else {
    // S10 ROOFTOP — wide sunrise over the skyline, MAX confident, slow push-in
    pos = kf3([[1710, [0.5, 2.6, 9.0]], [1900, [0, 3.2, 10.5]], [2084, [0, 2.8, 6.8]]], f);
    look = kf3([[1710, [0.1, 1.6, 0.8]], [1900, [0, 1.8, 0.5]], [2084, [0, 1.9, 0.2]]], f);
    fov = 50;
  }
  // continuous drift: camera breathes so no two frames are ever identical
  const t = f / FPS;
  pos = [pos[0] + Math.sin(t * 0.6) * 0.12, pos[1] + Math.sin(t * 0.9) * 0.06, pos[2] + Math.cos(t * 0.45) * 0.08];
  return { pos, look, fov };
}
