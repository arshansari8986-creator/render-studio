// "Sona-Chandi Crash" — 17.5s DENSE SAMPLE (Gullak density).
// Voice: voice_fenrir_sonachandi_final2.wav ka pehla 17.5s (525 frames @30fps).
// Word timings: shorts/sona-chandi-crash/audio/word_timings_final2.json se verified.
// Beats: 0.00 hook '10 lakh ki chaandi khareedi thi' | 2.36 'aur aaj wahi chaandi
// sirf 3.8 lakh' | 5.00 'January ki baat hai' | 5.86 'har roz record tod rahi thi'
// | 7.92 'sunaar ke board par chamak raha tha' | 8.76 'chaar lakh bees hazaar kilo'
// | 10.02 'dukaan par bheed thi, sab khareed rahe the' | 12.06 'Ramesh bhi pahuncha,
// jeb me 10 lakh, aankhon me sapna' | 14.70 'dost ne haath pakad liya — mat le,
// gubbara hai, phootega' (17.40 par beat khatm = sample ka cliffhanger ant).
// 16 shots / 15 cuts (avg 1.09s). NO captions. In-scene board hi text hai.
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 525;

// ---------- shots: [id, a, b, set, env] — set hamesha 'bazaar' ----------
// env: day (ujla din) | noon (tez safed, present-udaas) | morning (January, sunehra)
export const SHOTS = [
  ['s01', 0, 33, 'bazaar', 'day'],        // BOARD ECU push-in, chamak flicker — hook shuru
  ['s02', 33, 71, 'bazaar', 'day'],       // Ramesh gaddi nikaalta garv se, side dolly — 'khareedi thi'
  ['s03', 71, 117, 'bazaar', 'noon'],     // TEZ pull-back + shake: board flash ₹1,60,000, Ramesh SHOCK — 'aur aaj wahi chaandi'
  ['s04', 117, 150, 'bazaar', 'noon'],    // Ramesh halka dibba, udaas closeup slow push — 'sirf 3.8 lakh ki reh gayi'
  ['s05', 150, 177, 'bazaar', 'morning'], // NAYA DIN wide establishing, crane-down — 'January ki baat hai'
  ['s06', 177, 210, 'bazaar', 'morning'], // Board number TICK-UP animation, tilt-up — 'har roz record tod rahi thi'
  ['s07', 210, 238, 'bazaar', 'day'],     // Bheed dukaan ki taraf badhti, side tracking
  ['s08', 238, 279, 'bazaar', 'day'],     // Board closeup ₹4,20,000 chamak + kirnein, push — 'board par chamak raha tha'
  ['s09', 279, 309, 'bazaar', 'day'],     // Sunar tarazu par taul raha, halka orbit — 'chaar lakh bees hazaar kilo'
  ['s10', 309, 339, 'bazaar', 'day'],     // Exchange closeup: note <-> dibba — 'dukaan par bheed thi'
  ['s11', 339, 363, 'bazaar', 'day'],     // Graahak2 thaali me bartan, showcase pan — 'sab khareed rahe the'
  ['s12', 363, 399, 'bazaar', 'day'],     // Ramesh bheed me DHAKKA comedy, handheld — 'Ramesh bhi pahuncha'
  ['s13', 399, 441, 'bazaar', 'day'],     // Ramesh counter par garv BIG closeup, gaddi — 'jeb me 10 lakh, aankhon me sapna'
  ['s14', 441, 471, 'bazaar', 'day'],     // Sunar dibba BAND karke badhata hai (dhak) — 'dost ne...' shuru
  ['s15', 471, 501, 'bazaar', 'day'],     // Ramesh dibba seene se lagaye nikalta, pull-back wide
  ['s16', 501, 525, 'bazaar', 'day'],     // DOST peeche se HAATH pakad leta — Ramesh chaunkta (cliffhanger) — 'gubbara hai, phootega'
];
const SHOTMAP = {}; SHOTS.forEach(([id, a, b, set, env]) => { SHOTMAP[id] = { id, a, b, set, env, len: b - a }; });
export const shotAt = (f) => {
  for (const [id, a, b] of SHOTS) if (f >= a && f < b) { const s = SHOTMAP[id]; return { ...s, u: clamp((f - a) / s.len) }; }
  const s = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...s, u: 1 };
};
export const FLASH = {};

// ---------- set layout (main.js se match) ----------
// bazaar: sadak z 0.2..3.4 (centre 1.8); footpath z -1.9..0.2; dukaan deewaar z=-4.3.
//   Sunar dukaan centre x=0: board (0,3.02,-2.38) 1.9x1.05; counter (0,,-3.0);
//   tarazu (0.62,1.03,-3.0); galla (-0.72,1.1,-3.05); showcase (-1.75,,-3.15);
//   sunar (0.3,,-3.65); pankha (-0.9,3.02,-3.2).
//   Chai stall x=3.6 (table 3.6,,-3.3; ketli 3.45,0.95,-3.3); kirana shutter x=-3.9.
//   Ped (-5.4,,-3.2) & (5.8,,-3.0); street light (2.9,,-1.1).
export const CAMS = {
  s01: [[0, 2.72, 2.3], [0, 2.72, -2.3], 52, 0, [0, 2.72, 1.55], [0, 2.72, -2.3], 47, 0],       // board ECU push-in
  s02: [[-2.7, 1.72, 2.3], [-0.85, 1.3, -1.7], 46, 0, [-2.15, 1.68, 1.8], [-0.85, 1.3, -1.7], 44, 0], // Ramesh gaddi side dolly
  s03: [[-0.9, 1.72, 0.75], [-0.88, 1.42, -1.6], 42, 0, [-0.3, 2.05, 4.6], [0, 2.0, -2.6], 50, 0],  // tez pull-back (shake code me)
  s04: [[-1.5, 1.62, 0.8], [-0.9, 1.38, -1.6], 42, 0, [-1.32, 1.6, 0.42], [-0.9, 1.38, -1.6], 40, 0], // udaas closeup slow push
  s05: [[0.6, 3.7, 8.6], [0, 1.4, -3.2], 53, 0, [0.35, 2.35, 6.7], [0, 1.45, -3.2], 50, 0],          // wide crane-down
  s06: [[0, 1.8, 2.6], [0, 1.25, -3.0], 46, 0, [0, 2.25, 2.2], [0, 2.72, -2.32], 44, 0],               // tilt-up board tick
  s07: [[0.15, 1.85, 4.9], [0, 1.05, -2.6], 48, 0, [0.1, 1.78, 4.3], [0, 1.05, -2.6], 46, 0],   // bheed depth lanes (frontal)
  s08: [[0.35, 2.66, 1.95], [0, 2.72, -2.3], 48, 0, [0.18, 2.7, 1.3], [0, 2.72, -2.3], 44, 0],     // board chamak push
  s09: [[1.35, 1.72, 0.7], [0.6, 1.12, -3.0], 44, 0, [0.95, 1.78, 0.25], [0.6, 1.12, -3.0], 42, 0],  // tarazu halka orbit
  s10: [[0.1, 1.6, 1.7], [-0.1, 1.1, -2.95], 44, 0, [0.15, 1.57, 1.45], [-0.1, 1.1, -2.95], 42, 0], // exchange two-shot (safe)
  s11: [[-2.6, 1.62, 1.0], [-1.7, 1.05, -3.05], 45, 0, [-2.15, 1.58, 0.72], [-1.7, 1.05, -3.05], 43, 0], // showcase pan
  s12: [[-0.5, 1.7, 2.45], [-1.6, 1.25, -1.5], 47, 0, [-0.35, 1.68, 2.3], [-1.3, 1.25, -1.6], 46, 0],  // dhakka (handheld code me)
  s13: [[-0.72, 1.7, 0.95], [-0.55, 1.42, -2.2], 41, 0, [-0.64, 1.67, 0.5], [-0.55, 1.42, -2.2], 38, 0], // garv BIG closeup push
  s14: [[0.85, 1.62, 0.35], [0.28, 1.08, -2.98], 43, 0, [0.72, 1.59, 0.08], [0.28, 1.08, -2.98], 41, 0], // dibba band close
  s15: [[-0.35, 1.92, 3.3], [-0.4, 1.15, -2.3], 49, 0, [-0.25, 2.12, 4.7], [-0.3, 1.2, -2.4], 51, 0],   // nikalta pull-back
  s16: [[0.3, 1.7, 2.0], [-0.55, 1.3, -1.65], 46, 0, [0.32, 1.67, 1.75], [-0.55, 1.3, -1.65], 44, 0], // dost haath two-shot push
};
export const camFor = (shot, u) => {
  const c = CAMS[shot.id];
  const e = u * u * (3 - 2 * u); // smoothstep within the shot
  const L = (a, b) => a + (b - a) * e;
  const L3 = (a, b) => a.map((v, i) => L(v, b[i]));
  return { pos: L3(c[0], c[4]), look: L3(c[1], c[5]), fov: L(c[2], c[6]), roll: L(c[3], c[7]) };
};

// NO captions is build me — captionAt hamesha khaali.
export const captionAt = () => '';
