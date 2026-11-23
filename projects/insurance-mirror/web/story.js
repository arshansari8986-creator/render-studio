// "Insurance Agent — EP-9 FULL (Mirror Trick Tales style)"
// Frame math only: line timing (verified from voice sentence_starts.md), shot table,
// per-shot camera keys, captions. Sets/cast/props live in main.js.
// Voice segments: L1 0 | L2 99 | L3 199 | L4 274 | L5 376 | L6 485 | L7 572 (kagaz)
// L8 691 (sapna) | L9 865 (dus saal baad) | L10 998 (agent dialogue) | L11 1187 (ek line)
// L12 1279 (free-look) | L13 1408 (IRDAI+khel) | L14 1502 (26,667 shikayatein)
// L15 1608 (yaad karo/mirror) | L16 1699 (binary) | L17 1806 (tease) | end 1888
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 1888;

export const LINES = [
  [0, 99], [99, 199], [199, 274], [274, 376], [376, 485], [485, 572], [572, 691],
  [691, 865], [865, 998], [998, 1187], [1187, 1279], [1279, 1408], [1408, 1502],
  [1502, 1608], [1608, 1699], [1699, 1806], [1806, 1888],
];

// ---------- shots: [id, a, b, set] — every shot <= 66 frames, contiguous ----------
// set: office | paper | home | time | complaint | mirror | dark
export const SHOTS = [
  ['s01', 0, 50, 'office'],      // L1 low-angle wide, push-in
  ['s02', 50, 99, 'office'],     // L1 agent CU
  ['s03', 99, 149, 'office'],    // L2 top-down desk: coin stacks
  ['s04', 149, 199, 'office'],   // L2 side two-shot
  ['s05', 199, 238, 'office'],   // L3 OTS behind customer
  ['s06', 238, 274, 'office'],   // L3 customer CU
  ['s07', 274, 326, 'office'],   // L4 crore board hero
  ['s08', 326, 376, 'office'],   // L4 coin macro (₹4,000 tiny)
  ['s09', 376, 431, 'office'],   // L5 lakh board hero
  ['s10', 431, 485, 'office'],   // L5 customer shock CU
  ['s11', 485, 529, 'office'],   // L6 dutch two-shot, shrug
  ['s12', 529, 572, 'office'],   // L6 dive to desk paper
  ['s13', 572, 625, 'paper'],    // L7 paper macro: ₹7,00,000 line
  ['s14', 625, 691, 'paper'],    // L7 paper snatched away
  ['s15', 691, 756, 'home'],     // L8 dream home wide
  ['s16', 756, 820, 'home'],     // L8 family + golden dream board
  ['s17', 820, 865, 'home'],     // L8 beti close, warm orbit
  ['s18', 865, 925, 'time'],     // L9 calendar flips + clock spins
  ['s19', 925, 998, 'office'],   // L9 buddha enters (aged office)
  ['s20', 998, 1062, 'office'],  // L10 money bundles macro
  ['s21', 1062, 1125, 'office'], // L10 buddha angry two-shot
  ['s22', 1125, 1187, 'office'], // L10 agent smug CU
  ['s23', 1187, 1233, 'paper'],  // L11 tiny line glows (dark paper)
  ['s24', 1233, 1279, 'office'], // L11 agent nervous CU
  ['s25', 1279, 1345, 'paper'],  // L12 magnifier over tiny line
  ['s26', 1345, 1408, 'office'], // L12 FREE-LOOK gold board reveal
  ['s27', 1408, 1455, 'complaint'], // L13 letters begin to fall
  ['s28', 1455, 1502, 'complaint'], // L13 letters rain
  ['s29', 1502, 1560, 'complaint'], // L14 26,667 board scales in
  ['s30', 1560, 1608, 'complaint'], // L14 board hero push-in
  ['s31', 1608, 1660, 'mirror'], // L15 mirror wide
  ['s32', 1660, 1699, 'mirror'], // L15 mirror CU, point at viewer
  ['s33', 1699, 1755, 'office'], // L16 COVER BADA? board
  ['s34', 1755, 1806, 'office'], // L16 COMMISSION BADA? + agent CU point
  ['s35', 1806, 1852, 'dark'],   // L17 dark office, glowing ? door
  ['s36', 1852, 1888, 'dark'],   // L17 ? macro
];
const SHOTMAP = {}; SHOTS.forEach(([id, a, b, set]) => { SHOTMAP[id] = { id, a, b, set, len: b - a }; });
export const shotAt = (f) => {
  for (const [id, a, b] of SHOTS) if (f >= a && f < b) { const s = SHOTMAP[id]; return { ...s, u: clamp((f - a) / s.len) }; }
  const s = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...s, u: 1 };
};

// ---------- per-shot camera keys: [posA, lookA, fovA, rollA, posB, lookB, fovB, rollB] ----------
// World: office desk top y≈1.09 at z=0, agent card at (0,~,-1.55), customer chair (1.7,~,2.7),
// boards at (±1.3, 1.72, -0.28), back wall z=-3.2. Portrait 1080x1920 (aspect 0.5625).
export const CAMS = {
  // office
  s01: [[0.0, 0.55, 10.6], [0.0, 1.9, -0.6], 54, 0, [0.0, 0.8, 8.6], [0.0, 1.8, -0.7], 50, 0],       // floor-level low angle, push-in
  s02: [[0.15, 1.95, 3.4], [0.0, 1.75, -1.4], 44, 0, [0.1, 1.9, 2.2], [0.0, 1.8, -1.5], 40, 0],        // agent CU push
  s03: [[-0.1, 7.0, 2.6], [0.0, 1.0, 0.32], 46, 0, [0.0, 6.6, 2.2], [0.0, 1.0, 0.32], 44, 6],           // top-down desk coins
  s04: [[4.4, 2.2, 8.8], [0.2, 1.45, -0.3], 46, 0, [3.9, 2.0, 8.2], [0.25, 1.4, -0.35], 44, 0],           // front-right diagonal two-shot
  s05: [[2.9, 2.2, 7.4], [0.0, 1.55, -0.8], 47, 0, [2.75, 2.1, 7.0], [0.0, 1.5, -0.8], 45, 0],           // OTS (customer back at right fg)
  s06: [[1.85, 1.75, 6.3], [1.7, 1.35, 2.7], 42, 0, [1.8, 1.7, 5.4], [1.7, 1.4, 2.7], 38, 0],           // customer CU push
  s07: [[-2.7, 2.1, 7.4], [-1.2, 1.6, -0.3], 47, 0, [-2.3, 2.0, 6.2], [-1.25, 1.65, -0.3], 44, 0],      // crore board swing
  s08: [[-1.7, 2.1, 3.4], [-0.92, 1.12, 0.35], 38, 0, [-1.45, 1.9, 2.6], [-0.93, 1.14, 0.35], 34, 0],   // coin macro dolly
  s09: [[2.7, 2.1, 7.4], [1.2, 1.6, -0.3], 47, 0, [2.3, 2.0, 6.2], [1.25, 1.65, -0.3], 44, 0],           // lakh board swing
  s10: [[1.8, 1.8, 5.9], [1.7, 1.4, 2.7], 40, 0, [1.75, 1.75, 4.9], [1.7, 1.45, 2.7], 35, 0],            // shock CU hard push
  s11: [[0.0, 2.3, 9.4], [0.0, 1.5, -0.4], 50, -7, [0.0, 2.2, 8.6], [0.0, 1.55, -0.5], 48, -5],         // dutch two-shot
  s12: [[0.4, 2.0, 5.2], [0.1, 1.2, 0.2], 46, 0, [0.15, 1.45, 2.4], [0.0, 1.1, 0.3], 40, 0],            // dive to desk paper
  s19: [[3.0, 2.0, 8.6], [2.2, 1.5, 1.2], 46, 0, [2.2, 1.9, 8.4], [0.9, 1.45, 0.2], 44, 0],         // buddha enters, wide
  s20: [[-1.6, 2.3, 4.4], [-1.02, 1.15, 0.35], 42, 0, [1.6, 2.3, 4.4], [1.02, 1.15, 0.35], 42, 0],           // money pan: ₹5L pile -> ₹3L pile
  s21: [[3.1, 2.0, 6.8], [0.25, 1.5, -0.2], 47, 0, [2.8, 1.95, 6.0], [0.25, 1.55, -0.3], 44, 0],           // angry two-shot
  s22: [[-0.2, 1.95, 3.2], [0.0, 1.8, -1.5], 42, 0, [-0.1, 1.9, 2.3], [0.0, 1.82, -1.5], 38, 0],        // agent smug CU
  s24: [[0.1, 1.9, 2.9], [0.0, 1.8, -1.5], 40, 0, [0.05, 1.88, 2.4], [0.0, 1.8, -1.5], 37, 3],          // agent nervous CU, slight dutch
  s26: [[0.0, 2.3, 10.6], [0.0, 1.8, -0.6], 48, 0, [0.0, 2.2, 9.6], [0.0, 1.8, -0.6], 46, 0],           // free-look reveal wide
  s33: [[-2.5, 2.05, 7.2], [-1.15, 1.6, -0.3], 46, 0, [-2.2, 2.0, 6.3], [-1.2, 1.65, -0.3], 43, 0],     // COVER BADA?
  s34: [[0.3, 2.0, 5.2], [0.85, 1.75, -0.4], 42, 0, [0.45, 1.95, 4.6], [0.9, 1.75, -0.4], 40, -3],       // COMMISSION BADA? + agent point
  // paper set (world: giant desk y=0, paper centre (0,0.02,0) size 7x9, camera above/front)
  s13: [[0.3, 5.4, 8.8], [0.0, 0.0, -0.5], 42, 0, [0.15, 4.8, 7.6], [0.0, 0.0, -0.3], 40, 0],
  s14: [[1.4, 4.5, 8.8], [0.0, 0.1, -0.3], 44, 0, [0.9, 4.1, 7.8], [-0.2, 0.1, -0.3], 41, -2],
  s23: [[0.0, 2.6, 5.4], [0.0, 0.0, -0.3], 42, 0, [0.0, 2.2, 4.4], [0.0, 0.02, -0.35], 38, 0],
  s25: [[0.0, 2.8, 5.8], [0.0, 0.0, -0.3], 43, 0, [0.0, 2.3, 4.5], [0.0, 0.02, -0.35], 37, 0],
  // home set (sofa centre (0,0,-1), family in front)
  s15: [[0.0, 2.3, 10.6], [0.0, 1.5, -0.8], 52, 0, [0.0, 2.15, 8.8], [0.0, 1.5, -0.9], 49, 0],
  s16: [[-1.4, 2.0, 7.2], [-0.2, 1.5, -0.8], 46, 0, [-1.1, 1.95, 6.2], [-0.15, 1.55, -0.85], 43, 0],
  s17: [[1.7, 1.7, 5.6], [0.45, 1.1, -0.4], 42, 0, [1.35, 1.6, 4.8], [0.4, 1.15, -0.45], 39, 2],
  // time set (calendar left (-1.1,2.6,-2.9), clock right (1.5,2.7,-2.9))
  s18: [[0.0, 2.4, 6.4], [0.1, 2.2, -2.9], 50, 0, [0.3, 2.35, 5.2], [0.1, 2.25, -2.9], 46, 4],
  // complaint set (board centre (0,2.3,-3))
  s27: [[0.0, 2.2, 9.8], [0.0, 2.0, -3.0], 52, 0, [0.0, 2.15, 8.8], [0.0, 2.05, -3.0], 50, 0],
  s28: [[-0.8, 2.5, 8.6], [0.0, 2.0, -3.0], 50, -3, [-0.4, 2.4, 7.8], [0.0, 2.05, -3.0], 48, -2],
  s29: [[0.0, 2.3, 10.4], [0.0, 2.25, -3.0], 52, 0, [0.0, 2.25, 9.2], [0.0, 2.3, -3.0], 49, 0],
  s30: [[0.0, 2.35, 8.8], [0.0, 2.3, -3.0], 48, 0, [0.0, 2.3, 7.4], [0.0, 2.3, -3.0], 44, 0],
  // mirror set (mirror centre (0,2.5,-2.9))
  s31: [[0.0, 2.4, 7.4], [0.0, 2.35, -2.9], 50, 0, [0.0, 2.35, 6.6], [0.0, 2.32, -2.9], 47, 0],
  s32: [[0.15, 2.4, 5.4], [0.0, 2.35, -2.9], 42, 0, [0.1, 2.38, 4.3], [0.0, 2.36, -2.9], 38, 0],
  // dark (office geometry, door on back wall right (3.4,0,-3.1))
  s35: [[-0.6, 1.9, 10.8], [3.2, 1.7, -3.1], 52, 0, [-0.2, 1.85, 9.0], [3.3, 1.7, -3.1], 49, 0],
  s36: [[2.2, 1.85, 3.4], [3.4, 1.75, -3.1], 44, 0, [2.7, 1.8, 1.6], [3.4, 1.78, -3.1], 40, 0],
};
export const camFor = (shot, u) => {
  const c = CAMS[shot.id];
  const e = u * u * (3 - 2 * u); // smoothstep within the shot
  const L = (a, b) => a + (b - a) * e;
  const L3 = (a, b) => a.map((v, i) => L(v, b[i]));
  return { pos: L3(c[0], c[4]), look: L3(c[1], c[5]), fov: L(c[2], c[6]), roll: L(c[3], c[7]) };
};

// ---------- word-by-word Roman Hinglish captions (even split inside each voice line) ----------
export const CAPTIONS = [
  { a: 0, b: 99, words: ['Aaj', 'tum', 'insurance', 'agent', 'ho', 'aur', 'tumhe', 'ek', 'jhooth', 'bolna', 'hai'] },
  { a: 99, b: 199, words: ['Niyam', 'simple', 'hai', 'jitni', 'mehengi', 'policy', 'utna', 'bada', 'commission'] },
  { a: 199, b: 274, words: ['Saamne', 'ek', 'aadmi', 'baitha', 'hai', 'Do', 'policy', 'hain'] },
  { a: 274, b: 376, words: ['Ek', 'mein', 'use', 'ek', 'crore', 'ka', 'cover', 'milega', 'tumhe', 'milenge', 'chaar', 'hazaar'] },
  { a: 376, b: 485, words: ['Dusri', 'mein', 'use', 'sirf', 'saat', 'lakh', 'ka', 'cover', 'milega', 'tumhe', 'milenge', 'pandrah', 'hazaar'] },
  { a: 485, b: 572, words: ['Kaunsi', 'bechoge', 'Tumne', 'bhi', 'wahi', 'chuni', 'jo', 'har', 'agent', 'chunta', 'hai'] },
  { a: 572, b: 691, words: ['Lekin', 'ek', 'dikkat', 'hai', 'kagaz', 'par', 'saat', 'lakh', 'saaf', 'likha', 'hai', 'Woh', 'padh', 'lega', 'to'] },
  { a: 691, b: 865, words: ['Isiliye', 'tum', 'use', 'kagaz', 'nahi', 'sunate', 'tum', 'use', 'sapna', 'sunate', 'ho', 'beti', 'ki', 'padhai', 'ek', 'crore', 'ka', 'future'] },
  { a: 865, b: 998, words: ['Dus', 'saal', 'baad', 'woh', 'paisa', 'nikaalne', 'aaya', 'paanch', 'lakh', 'bhare', 'the', 'mile', 'sirf', 'teen', 'lakh', 'Woh', 'gussa', 'hai'] },
  { a: 998, b: 1187, words: ['Ab', 'tum', 'kya', 'kahoge', 'Wahi', 'jo', 'har', 'agent', 'kehta', 'hai', 'Policy', 'band', 'karna', 'hi', 'galti', 'thi', 'sir', 'chalne', 'dete', 'to', 'crore', 'banta'] },
  { a: 1187, b: 1279, words: ['Lekin', 'ek', 'line', 'hai', 'jo', 'tumne', 'use', 'kabhi', 'padhne', 'hi', 'nahi', 'di'] },
  { a: 1279, b: 1408, words: ['Policy', 'milne', 'ke', 'tees', 'din', 'ke', 'andar', 'woh', 'use', 'wapas', 'karke', 'lagbhag', 'pura', 'paisa', 'le', 'sakta', 'tha'] },
  { a: 1408, b: 1502, words: ['Ye', 'IRDAI', 'ka', 'niyam', 'hai', 'Aur', 'ye', 'khel', 'ek', 'par', 'nahi', 'khela', 'gaya'] },
  { a: 1502, b: 1608, words: ['Ek', 'saal', 'mein', 'chhabbis', 'hazaar', 'se', 'zyada', 'log', 'IRDAI', 'ke', 'paas', 'yehi', 'shikayat', 'le', 'gaye'] },
  { a: 1608, b: 1699, words: ['Yaad', 'karo', 'tumhare', 'agent', 'ne', 'tumhe', 'kaunsi', 'policy', 'bechi', 'thi'] },
  { a: 1699, b: 1806, words: ['Ab', 'tum', 'batao', 'tumhari', 'policy', 'mein', 'cover', 'bada', 'hai', 'ya', 'agent', 'ka', 'commission'] },
  { a: 1806, b: 1888, words: ['Agli', 'baar', 'is', 'series', 'ka', 'aakhri', 'aur', 'sabse', 'bada', 'khulasa'] },
];
export const captionAt = (f) => {
  for (const c of CAPTIONS) {
    if (f >= c.a && f < c.b) {
      const i = Math.min(c.words.length - 1, Math.floor((f - c.a) / ((c.b - c.a) / c.words.length)));
      return c.words[i];
    }
  }
  return '';
};
