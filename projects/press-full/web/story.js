// "Press Wala" — FULL VIDEO v3 FAST-CUT REBUILD (40.53 s, 1216 frames @30fps). 51 shots, avg ~0.79 s/shot.
// v2 (22 shots, 1.84 s/shot) se rebuild — user order 2026-11-26: Sona-Chandi cutting (~0.77 s/cut)
// + World V2 duniya ISI Press video me. BEATS WAHI 22 (research §4) — sirf shots badhe (har beat 1-4 shots).
// Voice FINAL (40.53 s) + envelope (1216) + audio mix SAME — kuch nahi badla.
// Shot boundaries: beat boundaries words_final.json se (v2 jaisi); beat ke andar barabar hisse.
// Cameras: v2 CAMS path ko sub-shots me interpolate (verified path) + hand overrides (board close,
//   pencil tight, middle-face O, aunty, tag close, sawal tight, smile hold, manager CU, ending travelling/freeze).
// Har cut par ALAG angle (cut hi camera move hai — Gullak grammar). NO phoneme lip-sync (mouthFor beat-level),
// NO walk cycle, NO low angle, NO orbit. Camera ~60% static, push-in number/chehre par, whip-pan sirf shock par.
// WITHHELD: notebook s03-equivalent (s06/s07) me sirf jhalak, s20/s21 (b09/b11) me haath us par,
//   poora khulta hai b20 (s44-s46, 34.08 s) par — 34 second ka wait.
// NUMBERS-AS-OBJECTS: board "₹2,00,000" (s01-s03, s51 freeze); "RAJU PRESS" (s06-s07); laal tag "₹10" (s10-s11);
//   phone "₹2,37,500" (s12-s13); bada board "₹2,37,500" (s14-s16); chhota tag "₹3,500" (s25-s26);
//   sunehra tag "₹350" (s30-s32); counter "₹2,83,500" (s40-s43, beat progress se gin kar badhta hai, u>=0.75 par HOLD);
//   notebook "PRESS = BHEED · SUIT = GHAR" (s44-s46).
// NO captions — captionAt hamesha khaali. NO guna-bhaag, NO ghata beat, ant = loop freeze, KOI CTA NAHI.
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 1216;

// ---------- shots: [id, a, b, set, env, beat, sub] ----------
// set: 'gali' | 'dukaan'; env: morning | day | evening | sunset
export const SHOTS = [
  ['s01', 0, 28, 'gali', 'morning', 'b01', 0],       // b01 sub1: Is press wale ne ek mahine me do lakh kamaye.
  ['s02', 28, 55, 'gali', 'morning', 'b01', 1],      // b01 sub2: Is press wale ne ek mahine me do lakh kamaye.
  ['s03', 55, 83, 'gali', 'morning', 'b01', 2],      // b01 sub3: Is press wale ne ek mahine me do lakh kamaye.
  ['s04', 83, 103, 'gali', 'morning', 'b02', 0],     // b02 sub1: Lekin press karke nahi.
  ['s05', 103, 123, 'gali', 'morning', 'b02', 1],    // b02 sub2: Lekin press karke nahi.
  ['s06', 123, 151, 'gali', 'morning', 'b03', 0],    // b03 sub1: Ye Raju hai — mohalle ki press dukaan.
  ['s07', 151, 179, 'gali', 'morning', 'b03', 1],    // b03 sub2: Ye Raju hai — mohalle ki press dukaan.
  ['s08', 179, 201, 'dukaan', 'morning', 'b04', 0],  // b04 sub1: Kapdon ka dher, bhaap, har kapde par ₹10.
  ['s09', 201, 223, 'dukaan', 'morning', 'b04', 1],  // b04 sub2: Kapdon ka dher, bhaap, har kapde par ₹10.
  ['s10', 223, 241, 'dukaan', 'morning', 'b05', 0],  // b05 sub1: (tail) ₹10 tag ECU.
  ['s11', 241, 259, 'dukaan', 'morning', 'b05', 1],  // b05 sub2: (tail) ₹10 tag ECU.
  ['s12', 259, 289, 'gali', 'morning', 'b06', 0],    // b06 sub1: February me post viral hui —
  ['s13', 289, 318, 'gali', 'morning', 'b06', 1],    // b06 sub2: February me post viral hui —
  ['s14', 318, 339, 'gali', 'morning', 'b07', 0],    // b07 sub1: — Raju ₹2,37,500 kamata hai!
  ['s15', 339, 361, 'gali', 'morning', 'b07', 1],    // b07 sub2: — Raju ₹2,37,500 kamata hai!
  ['s16', 361, 382, 'gali', 'morning', 'b07', 2],    // b07 sub3: — Raju ₹2,37,500 kamata hai!
  ['s17', 382, 404, 'gali', 'morning', 'b08', 0],    // b08 sub1: Poora mohalla hairan — ₹10 ki press se itna?
  ['s18', 404, 427, 'gali', 'morning', 'b08', 1],    // b08 sub2: Poora mohalla hairan — ₹10 ki press se itna?
  ['s19', 427, 449, 'gali', 'morning', 'b08', 2],    // b08 sub3: Poora mohalla hairan — ₹10 ki press se itna?
  ['s20', 449, 471, 'dukaan', 'evening', 'b09', 0],  // b09 sub1: Raju shaam ko galla kholta hai —
  ['s21', 471, 493, 'dukaan', 'evening', 'b09', 1],  // b09 sub2: Raju shaam ko galla kholta hai —
  ['s22', 493, 519, 'dukaan', 'evening', 'b10', 0],  // b10 sub1: — note ginta hai.
  ['s23', 519, 543, 'dukaan', 'evening', 'b11', 0],  // b11 sub1: Din bhar ki mehnat —
  ['s24', 543, 566, 'dukaan', 'evening', 'b11', 1],  // b11 sub2: Din bhar ki mehnat —
  ['s25', 566, 582, 'dukaan', 'evening', 'b12', 0],  // b12 sub1: — galle me sirf ₹3,500.
  ['s26', 582, 599, 'dukaan', 'evening', 'b12', 1],  // b12 sub2: — galle me sirf ₹3,500.
  ['s27', 599, 625, 'dukaan', 'evening', 'b13', 0],  // b13 sub1: To do lakh kahan se aaya?
  ['s28', 625, 650, 'dukaan', 'evening', 'b13', 1],  // b13 sub2: To do lakh kahan se aaya?
  ['s29', 650, 677, 'gali', 'evening', 'b14', 0],    // b14 sub1: Tab ek suit aata hai —
  ['s30', 677, 697, 'gali', 'evening', 'b15', 0],    // b15 sub1: — shaadi ka suit, ₹350.
  ['s31', 697, 717, 'gali', 'evening', 'b15', 1],    // b15 sub2: — shaadi ka suit, ₹350.
  ['s32', 717, 737, 'gali', 'evening', 'b15', 2],    // b15 sub3: — shaadi ka suit, ₹350.
  ['s33', 737, 764, 'gali', 'day', 'b16', 0],        // b16 sub1: Roz aise 20 suit aate hain —
  ['s34', 764, 791, 'gali', 'day', 'b16', 1],        // b16 sub2: Roz aise 20 suit aate hain —
  ['s35', 791, 815, 'gali', 'day', 'b17', 0],        // b17 sub1: — suit hi asli kamai hai.
  ['s36', 815, 838, 'gali', 'day', 'b17', 1],        // b17 sub2: — suit hi asli kamai hai.
  ['s37', 838, 865, 'gali', 'day', 'b18', 0],        // b18 sub1: Badi laundry ka manager hansta hai — ₹10 me kya kamayega?
  ['s38', 865, 893, 'gali', 'day', 'b18', 1],        // b18 sub2: Badi laundry ka manager hansta hai — ₹10 me kya kamayega?
  ['s39', 893, 920, 'gali', 'day', 'b18', 2],        // b18 sub3: Badi laundry ka manager hansta hai — ₹10 me kya kamayega?
  ['s40', 920, 946, 'dukaan', 'evening', 'b19', 0],  // b19 sub1: Mahine me galla ₹2,83,500 ka bharta hai.
  ['s41', 946, 971, 'dukaan', 'evening', 'b19', 1],  // b19 sub2: Mahine me galla ₹2,83,500 ka bharta hai.
  ['s42', 971, 996, 'dukaan', 'evening', 'b19', 2],  // b19 sub3: Mahine me galla ₹2,83,500 ka bharta hai.
  ['s43', 996, 1022, 'dukaan', 'evening', 'b19', 3], // b19 sub4: Mahine me galla ₹2,83,500 ka bharta hai.
  ['s44', 1022, 1044, 'dukaan', 'evening', 'b20', 0], // b20 sub1: Press bheed laati hai, suit ghar chalata hai.
  ['s45', 1044, 1066, 'dukaan', 'evening', 'b20', 1], // b20 sub2: Press bheed laati hai, suit ghar chalata hai.
  ['s46', 1066, 1088, 'dukaan', 'evening', 'b20', 2], // b20 sub3: Press bheed laati hai, suit ghar chalata hai.
  ['s47', 1088, 1109, 'gali', 'day', 'b21', 0],      // b21 sub1: Tum press wale se poochho — suit kitne ka hai?
  ['s48', 1109, 1129, 'gali', 'day', 'b21', 1],      // b21 sub2: Tum press wale se poochho — suit kitne ka hai?
  ['s49', 1129, 1150, 'gali', 'day', 'b21', 2],      // b21 sub3: Tum press wale se poochho — suit kitne ka hai?
  ['s50', 1150, 1172, 'gali', 'sunset', 'b22', 0],   // b22 sub1: Press ₹10 ki thi, ghar suit se chalta hai.
  ['s51', 1172, 1194, 'gali', 'sunset', 'b22', 1],   // b22 sub2: Press ₹10 ki thi, ghar suit se chalta hai.
  ['s52', 1194, 1216, 'gali', 'sunset', 'b22', 2],   // b22 sub3: Press ₹10 ki thi, ghar suit se chalta hai.
];
export const BEAT_OF = {}; SHOTS.forEach(([id, , , , , beat]) => { BEAT_OF[id] = beat; });
export const BEAT_SPAN = {};
BEAT_SPAN['b01'] = [0, 83];
BEAT_SPAN['b02'] = [83, 123];
BEAT_SPAN['b03'] = [123, 179];
BEAT_SPAN['b04'] = [179, 223];
BEAT_SPAN['b05'] = [223, 259];
BEAT_SPAN['b06'] = [259, 318];
BEAT_SPAN['b07'] = [318, 382];
BEAT_SPAN['b08'] = [382, 449];
BEAT_SPAN['b09'] = [449, 493];
BEAT_SPAN['b10'] = [493, 519];
BEAT_SPAN['b11'] = [519, 566];
BEAT_SPAN['b12'] = [566, 599];
BEAT_SPAN['b13'] = [599, 650];
BEAT_SPAN['b14'] = [650, 677];
BEAT_SPAN['b15'] = [677, 737];
BEAT_SPAN['b16'] = [737, 791];
BEAT_SPAN['b17'] = [791, 838];
BEAT_SPAN['b18'] = [838, 920];
BEAT_SPAN['b19'] = [920, 1022];
BEAT_SPAN['b20'] = [1022, 1088];
BEAT_SPAN['b21'] = [1088, 1150];
BEAT_SPAN['b22'] = [1150, 1216];
const SHOTMAP = {}; SHOTS.forEach(([id, a, b, set, env, beat, sub]) => { SHOTMAP[id] = { id, a, b, set, env, beat, sub, len: b - a }; });
export const shotAt = (f) => {
  for (const [id, a, b] of SHOTS) if (f >= a && f < b) { const s = SHOTMAP[id]; return { ...s, u: clamp((f - a) / s.len) }; }
  const s = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...s, u: 1 };
};
// Beat progress (poori beat par 0..1) — beat-spanning animations ke liye (counter, galla lid, pile growth).
export const beatU = (f) => { const s = shotAt(f), [a, b] = BEAT_SPAN[s.beat]; return clamp((f - a) / (b - a)); };
// FLASH: is video me white-flash device nahi chahiye.
export const FLASH = {};

// ---------- set layout (centre ~ (0,0,-3)) — v2 jaisa + World V2 props ----------
// gali: sadak z=1.8; press dukaan x=-1.5 (deewaar z=-4.3, wallV2 texture); "RAJU PRESS" sign (-1.5, 2.95);
//   "₹2,00,000" board (-2.7, 1.85, -4.22); "₹2,37,500" viral board (wahi jagah, sirf b07 me);
//   kapdon ki kataar x -1.6..1.2 z=-3.5 + DUSRI line x -4.6..-3.7 (board se door); posters CHAI ₹5 (0.9,1.6) + PRESS ₹10 (-4.0,1.5);
//   thela (2.7,-1.0), crates (-4.3,-2.2), balti (1.9,-0.6), cycle (1.7,-3.85), nalka (-3.9,-2.8), lamp (-0.2,2.42);
//   shelf (0.3,1.15,-4.1) bottles+dibba; kirana (4.6,-4.6) + bori/dabba; L2 mid-row z=-8 (tank+antenna+jalti khidki);
//   L3 skyline z=-19 + 2nd silhouette z=-27 + suraj disc + 2 cloud layers; zameen: 14 patches + 20 kankar + tyre-tracks.
// dukaan: counter (0.3,-2.6); "₹2,83,500" counter board (0.6, 2.0, -3.72, sirf b19); kapdon ki kataar x -3.0..-0.6
//   (board x 0.0..1.2 se door — FIX run 2); shelf (2.3,1.3,-3.7) + poster (2.2,1.6,-3.72); zameen patches/pebbles.
export const CAMS = {
  s01: [[-7.5, 6.5, 9.5], [-1, 0.8, -3], 58, 0, [-6.39, 5.54, 8.13], [-1.23, 1.02, -3.23], 56.4, 0],
  s02: [[-6.39, 5.54, 8.13], [-1.23, 1.02, -3.23], 56.4, 0, [-4.31, 3.76, 5.57], [-1.67, 1.43, -3.67], 53.6, 0],
  s03: [[-3.2, 2.8, 4.2], [-1.9, 1.65, -3.9], 52, 0, [-2.75, 2.2, 2.9], [-2.3, 1.8, -4.2], 46, 0],
  s04: [[-1.35, 2.25, 5.9], [-1.5, 2.1, -1.6], 42, 0, [-1.35, 2.24, 5.7], [-1.5, 2.1, -1.6], 41, 0],
  s05: [[-1.35, 2.25, 5.2], [-1.5, 2.1, -1.6], 40, 0, [-1.35, 2.22, 4.6], [-1.5, 2.1, -1.6], 38, 0],
  s06: [[-1.15, 1.9, 2.6], [-1.15, 1.5, -3.6], 55, 0, [-1.12, 1.88, 2.35], [-1.15, 1.5, -3.6], 54, 0],
  s07: [[-1.12, 1.88, 2.35], [-1.15, 1.5, -3.6], 54, 0, [-1.1, 1.85, 2.1], [-1.15, 1.5, -3.6], 53, 0],
  s08: [[0.3, 1.9, 0.9], [0, 1.3, -2.8], 44, 0, [0.29, 1.89, 0.8], [0, 1.3, -2.8], 43, 0],
  s09: [[0.29, 1.89, 0.8], [0, 1.3, -2.8], 43, 0, [0.28, 1.88, 0.7], [0, 1.3, -2.8], 42, 0],
  s10: [[0.3, 1.6, 0.2], [0.3, 1.35, -2.5], 40, 0, [0.3, 1.59, 0.1], [0.3, 1.35, -2.5], 39, 0],
  s11: [[0.3, 1.59, 0.1], [0.3, 1.35, -2.5], 39, 0, [0.3, 1.58, 0], [0.3, 1.35, -2.5], 38, 0],
  s12: [[-1, 2, 3], [-1.1, 1.8, -1.4], 46, 0, [-1, 1.99, 2.85], [-1.1, 1.8, -1.4], 45, 0],
  s13: [[-1, 1.99, 2.85], [-1.1, 1.8, -1.4], 45, 0, [-1, 1.98, 2.7], [-1.1, 1.8, -1.4], 44, 0],
  s14: [[-2.4, 2.2, 4.4], [-2.2, 1.8, -4.2], 50, 0, [-2.37, 2.15, 3.93], [-2.2, 1.8, -4.2], 48.4, 0],
  s15: [[-2.37, 2.15, 3.93], [-2.2, 1.8, -4.2], 48.4, 0, [-2.33, 2.05, 3.07], [-2.2, 1.8, -4.2], 45.6, 0],
  s16: [[-2.2, 2.1, 3.4], [-2, 1.8, -4], 48, 0, [-2, 2, 3], [-1.7, 1.85, -3.9], 44, 0],
  s17: [[-0.9, 1.9, 4], [-0.9, 1.6, -2.2], 48, 0, [-0.9, 1.89, 3.97], [-0.9, 1.6, -2.2], 47.7, 0],
  s18: [[-0.9, 1.9, 3.4], [-0.9, 1.6, -2.2], 46, 0, [-0.9, 1.88, 3], [-0.9, 1.6, -2.2], 44, 0],
  s19: [[-0.5, 1.9, 3.8], [-0.3, 1.6, -2.2], 48, 0, [-0.4, 1.88, 3.5], [-0.25, 1.6, -2.2], 46, 0],
  s20: [[0, 1.9, 0.9], [-0.05, 1.35, -2.7], 46, 0, [0, 1.89, 0.8], [-0.05, 1.35, -2.7], 45, 0],
  s21: [[0, 1.89, 0.8], [-0.05, 1.35, -2.7], 45, 0, [0, 1.88, 0.7], [-0.05, 1.35, -2.7], 44, 0],
  s22: [[0.1, 1.75, 0.2], [0, 1.35, -2.6], 50, 0, [0.1, 1.72, 0.1], [0, 1.35, -2.6], 49, 0],
  s23: [[0, 1.85, 0.6], [-0.05, 1.35, -2.7], 48, 0, [0, 1.83, 0.55], [-0.05, 1.35, -2.7], 47.5, 0],
  s24: [[0, 1.83, 0.55], [-0.05, 1.35, -2.7], 47.5, 0, [0, 1.82, 0.5], [-0.05, 1.35, -2.7], 47, 0],
  s25: [[0.35, 1.65, 0.4], [0.4, 1.3, -2.5], 46, 0, [0.35, 1.64, 0.3], [0.4, 1.3, -2.5], 45, 0],
  s26: [[0.35, 1.65, 0.3], [0.45, 1.3, -2.45], 44, 0, [0.35, 1.62, 0.1], [0.45, 1.3, -2.45], 42, 0],
  s27: [[0, 2.3, 0.6], [-0.2, 2.2, -3], 42, 0, [0, 2.27, 0.35], [-0.2, 2.2, -3], 41, 0],
  s28: [[0, 2.3, 0.35], [-0.2, 2.2, -3], 41, 0, [0, 2.25, 0.12], [-0.2, 2.2, -3], 39, 0],
  s29: [[-1, 1.9, 2.6], [-1.1, 1.5, -3], 50, 0, [-1, 1.88, 2.5], [-1, 1.5, -3], 48, 0],
  s30: [[-0.6, 1.8, 1.4], [-0.5, 1.5, -2.2], 48, 0, [-0.6, 1.79, 1.32], [-0.45, 1.5, -2.2], 47.5, 0],
  s31: [[-0.6, 1.79, 1.32], [-0.45, 1.5, -2.2], 47.5, 0, [-0.6, 1.79, 1.18], [-0.35, 1.5, -2.2], 46.5, 0],
  s32: [[-0.5, 1.85, 1.6], [-0.2, 1.55, -2.4], 48, 0, [-0.6, 1.78, 1.1], [-0.3, 1.5, -2.2], 46, 0],
  s33: [[0.3, 2.2, 3.4], [0.3, 1.2, -2.8], 52, 0, [0.3, 2.17, 3.2], [0.22, 1.2, -2.8], 51, 0],
  s34: [[0.3, 2.17, 3.2], [0.22, 1.2, -2.8], 51, 0, [0.3, 2.15, 3], [0.15, 1.2, -2.8], 50, 0],
  s35: [[-0.2, 1.9, 2.8], [-0.1, 1.5, -2.7], 50, 0, [-0.2, 1.89, 2.65], [-0.1, 1.5, -2.7], 49, 0],
  s36: [[-0.2, 1.89, 2.65], [-0.1, 1.5, -2.7], 49, 0, [-0.2, 1.88, 2.5], [-0.1, 1.5, -2.7], 48, 0],
  s37: [[2.3, 2, 2.6], [2.15, 1.7, -2.6], 52, 0, [2.3, 1.99, 2.52], [2.15, 1.7, -2.6], 51.5, 0],
  s38: [[2.6, 2, 1.8], [2.75, 1.75, -2.6], 48, 0, [2.6, 1.98, 1.5], [2.8, 1.75, -2.6], 46, 0],
  s39: [[2.3, 1.99, 2.38], [2.15, 1.7, -2.6], 50.5, 0, [2.3, 1.98, 2.3], [2.15, 1.7, -2.6], 50, 0],
  s40: [[0.3, 1.9, 0.2], [0.5, 1.5, -2.8], 44, 0, [0.3, 1.98, 0.64], [0.38, 1.47, -2.82], 45.9, 0],
  s41: [[0.3, 1.98, 0.64], [0.38, 1.47, -2.82], 45.9, 0, [0.3, 2.15, 1.6], [0.1, 1.4, -2.85], 50, 0],
  s42: [[0.3, 2.15, 1.6], [0.1, 1.4, -2.85], 50, 0, [0.3, 2.32, 2.56], [-0.18, 1.33, -2.88], 54.1, 0],
  s43: [[0.3, 2.32, 2.56], [-0.18, 1.33, -2.88], 54.1, 0, [0.3, 2.4, 3], [-0.3, 1.3, -2.9], 56, 0],
  s44: [[0.3, 1.6, 1.2], [0.3, 1.35, -2.2], 46, 0, [0.3, 1.59, 1.2], [0.31, 1.33, -2.2], 45.5, 0],
  s45: [[0.3, 1.59, 1.2], [0.31, 1.33, -2.2], 45.5, 0, [0.3, 1.56, 1.2], [0.34, 1.3, -2.2], 44.5, 0],
  s46: [[0.3, 1.56, 1.2], [0.34, 1.3, -2.2], 44.5, 0, [0.3, 1.55, 1.2], [0.35, 1.28, -2.2], 44, 0],
  s47: [[-0.6, 1.9, 3.4], [-0.65, 1.5, -1.9], 54, 0, [-0.6, 1.89, 3.32], [-0.65, 1.5, -1.9], 53.5, 0],
  s48: [[-0.6, 1.89, 3.32], [-0.65, 1.5, -1.9], 53.5, 0, [-0.6, 1.89, 3.18], [-0.65, 1.5, -1.9], 52.5, 0],
  s49: [[-0.6, 1.89, 3.18], [-0.65, 1.5, -1.9], 52.5, 0, [-0.6, 1.88, 3.1], [-0.65, 1.5, -1.9], 52, 0],
  s50: [[4.5, 2.2, 3], [-1, 1.4, -1.8], 56, 0, [1.5, 2.2, 3.2], [-1.2, 1.45, -1.85], 56, 0],
  s51: [[1.5, 2.2, 3.2], [-1.2, 1.45, -1.85], 56, 0, [-1.7, 2.1, 4], [-1.6, 1.65, -1.9], 56, 0],
  s52: [[-1.7, 2.1, 4], [-1.6, 1.65, -1.9], 56, 0, [-1.7, 2.1, 4], [-1.6, 1.65, -1.9], 56, 0],
};
export const camFor = (shot, u) => {
  const c = CAMS[shot.id];
  const e = u * u * (3 - 2 * u); // smoothstep within the shot
  const L = (a, b) => a + (b - a) * e;
  const L3 = (a, b) => a.map((v, i) => L(v, b[i]));
  return { pos: L3(c[0], c[4]), look: L3(c[1], c[5]), fov: L(c[2], c[6]), roll: L(c[3], c[7]) };
};

// NO captions is video me — captionAt hamesha khaali.
export const captionAt = () => '';

