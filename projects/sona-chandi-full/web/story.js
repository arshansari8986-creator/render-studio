// "Sona-Chandi Crash" — FULL VIDEO (61.62s, 1849 frames @30fps). Gullak density.
// Voice: voice_fenrir_sonachandi_final2.wav (61.62s). Word timings:
// shorts/sona-chandi-crash/audio/word_timings_final2.json se verified.
// 45.5-56.2s me Whisper ne shabd chhode (RMS se speech confirmed) — beats wahan
// script-order + RMS peaks se rakhe hain (slow, weighty delivery).
// Beats: 0.00 hook '10 lakh ki chaandi' | 2.36 'aaj wahi 3.8 lakh' | 5.00 'January'
// | 7.92 'board par chamak ₹4,20,000' | 12.06 'Ramesh bhi pahuncha' | 14.70 dost
// 'Mat le, gubbara hai, phootega!' | 17.85 'Ramesh has pada' | 18.40 'Tu rehne de,
// chaandi 5 lakh jayegi' | 21.36 'dibba ghar aaya, almari me band' | 23.00 'sapna:
// ek saal me dugna' | 25.50 'Lekin phir din badal gaye' | 26.66 'board har hafte
// neeche' | 27.82 '₹3,40,000' | 29.10 '₹2,60,000' | 29.86 '₹2,00,000' | 31.48
// '₹1,60,000!' | 33.22 'Ramesh roz dukaan ke saamne se guzarta' | 36.82 'dibba
// uthaya, sunar ke paas pahuncha — dukaan khaali' | 39.68 'sunar ne dibba taula,
// calculator chalaya' | 42.66 '₹3 lakh 80 hazaar' | 44.38 'chaandi ek gram bhi
// kam nahi hui thi...' | 45.5-56.2 'gaya tha to sirf board ka number. Tab samajh
// aaya —' (slow) | 56.20 'chaandi kabhi badli hi nahi thi, badla tha to bas
// board' | 59.06 'aaj bhi Ramesh roz usi dukaan ke saamne se guzarta hai...' LOOP.
// 47 shots / 46 cuts (avg ~1.32s). NO captions. In-scene board hi text hai.
// QA FIX (sample se): board push-ins (s01, s08, s26, s41) me camera peeche / FOV
// chauda — board text frame kinare se kabhi nahi kata (≥8% margin). s05/s47 wide
// me neeche khaali sadak nahi — cycle + walker foreground me.
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 1849;

// ---------- shots: [id, a, b, set, env] — set hamesha 'bazaar' ----------
// env: day | noon (tez safed) | morning (January, sunehra) | evening (sunset,
// din badalna / udaas shaam) | night (lamp, andhera — realisation / thesis)
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
  ['s16', 501, 525, 'bazaar', 'day'],     // DOST peeche se HAATH pakad leta — Ramesh chaunkta — 'Mat le, gubbara hai, phootega!'
  ['s17', 525, 564, 'bazaar', 'morning'], // Ramesh HAS pada (bada laugh), haath hila kar — 'Ramesh has pada'
  ['s18', 564, 612, 'bazaar', 'morning'], // Ramesh akad: upar ungli, garv — 'Tu rehne de! Chaandi 5 lakh jayegi' (SPEAK)
  ['s19', 612, 642, 'bazaar', 'morning'], // Dost sar hilata, Ramesh dibba leke mudta — 'tu dekhta reh jayega!'
  ['s20', 642, 675, 'bazaar', 'evening'], // Dibba haathon me, ghar ki taraf chalta — 'Dibba ghar aaya'
  ['s21', 675, 705, 'bazaar', 'evening'], // ALMARI: dibba andar slide, darwaze BAND — 'almari me band'
  ['s22', 705, 744, 'bazaar', 'evening'], // Ramesh sapne me: aankhein upar, halki smile — 'sapna bas ek'
  ['s23', 744, 774, 'bazaar', 'evening'], // Dibba chamak + Ramesh khush (dream glow) — 'ek saal me dugna'
  ['s24', 774, 804, 'bazaar', 'evening'], // ROSHNI BADLI: sunset, smile dheere mit ti — 'Lekin phir din badal gaye'
  ['s25', 804, 834, 'bazaar', 'evening'], // Board wide, Ramesh upar dekhta, chinta — 'Wahi board har hafte neeche'
  ['s26', 834, 870, 'bazaar', 'evening'], // Board TICK-DOWN ₹3,40,000 (red) — 'teen lakh chaalis'
  ['s27', 870, 900, 'bazaar', 'evening'], // Board ₹2,60,000, bheed patli — 'do lakh saath'
  ['s28', 900, 930, 'bazaar', 'morning'], // Subah phir: board ₹2,00,000 — 'do lakh... aur ek subah'
  ['s29', 930, 972, 'bazaar', 'noon'],     // Board ₹1,60,000 RED FLASH + Ramesh SHOCK (s03 echo) + shake
  ['s30', 972, 1002, 'bazaar', 'noon'],    // Jamna hua beat: Ramesh frozen, khaamosh sadak — (pause)
  ['s31', 1002, 1038, 'bazaar', 'evening'],// Ramesh roz guzarta — sar jhuka walk — 'Ramesh roz dukaan ke saamne se guzarta'
  ['s32', 1038, 1074, 'bazaar', 'evening'],// Ruk kar board dekhta, tilt-up — 'board dekhta'
  ['s33', 1074, 1104, 'bazaar', 'evening'],// Peeth dikha kar chup nikal jata — 'chup chaap nikal jata'
  ['s34', 1104, 1140, 'bazaar', 'night'],  // RAAT: almari khulti, dibba uthaya — 'Ek din dibba uthaya'
  ['s35', 1140, 1176, 'bazaar', 'day'],    // KHALI DUKAAN wide: koi bheed nahi, sunar akela — 'dukaan aaj khaali thi'
  ['s36', 1176, 1212, 'bazaar', 'day'],    // Tarazu closeup: dibba pan par, beam jhoolta — 'Sunar ne dibba taula'
  ['s37', 1212, 1248, 'bazaar', 'day'],    // CALCULATOR closeup: ungli keys par — 'calculator chalaya'
  ['s38', 1248, 1284, 'bazaar', 'day'],    // Sunar shaant chehra closeup — 'aur shaant awaaz me bola'
  ['s39', 1284, 1320, 'bazaar', 'day'],    // Board FLIP ₹3,80,000 + sunar bolta (SPEAK) — 'teen lakh assi hazaar'
  ['s40', 1320, 1362, 'bazaar', 'day'],    // Dibba closeup: chandi waisi ki waisi chamakti — 'chaandi ek gram bhi kam nahi hui thi...'
  ['s41', 1362, 1440, 'bazaar', 'evening'],// Board closeup BUJHA hua, slow push — 'gaya tha to sirf board ka number'
  ['s42', 1440, 1515, 'bazaar', 'night'],  // Realisation: chehra dheere badalta (pained→calm) — (slow beat)
  ['s43', 1515, 1605, 'bazaar', 'night'],  // Ramesh board→dibba dekhta — 'Tab samajh aaya —'
  ['s44', 1605, 1686, 'bazaar', 'night'],  // Hold: khaali sadak, lamp, Ramesh akele khada — (weight landing)
  ['s45', 1686, 1764, 'bazaar', 'night'],  // THESIS two-shot: board (badla) vs dibba (waisa) — 'chaandi kabhi badli hi nahi thi, badla tha to bas board'
  ['s46', 1764, 1800, 'bazaar', 'evening'],// Loop walk shuru (s31 rhyme) — 'Aur aaj bhi Ramesh roz...'
  ['s47', 1800, 1849, 'bazaar', 'morning'],// LOOP wide (s05 rhyme): wahi dukaan, wahi sadak, mid-step ant — '...usi dukaan ke saamne se guzarta hai...'
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
//   sunar (0.3,,-3.65); pankha (-0.9,3.02,-3.2). Almari (nayi, main.js):
//   (-3.3,,-3.95) 1.2x2.1, darwaze khulte/band hote hain. Calculator (naya):
//   counter par (0.95,1.06,-2.95). Chai stall x=3.6; kirana shutter x=-3.9.
//   Ped (-5.4,,-3.2) & (5.8,,-3.0); street light (2.9,,-1.1).
export const CAMS = {
  s01: [[0, 2.72, 2.3], [0, 2.72, -2.3], 52, 0, [0, 2.72, 0.9], [0, 2.72, -2.3], 56, 0],       // QA FIX: push-in yahin rukta hai (z=0.9) — board text safe (≥11% margin)
  s02: [[-2.7, 1.72, 2.3], [-0.85, 1.3, -1.7], 46, 0, [-2.15, 1.68, 1.8], [-0.85, 1.3, -1.7], 44, 0], // Ramesh gaddi side dolly
  s03: [[-0.9, 1.72, 0.75], [-0.88, 1.42, -1.6], 42, 0, [-0.3, 2.05, 4.6], [0, 2.0, -2.6], 50, 0],  // tez pull-back (shake code me)
  s04: [[-1.5, 1.62, 0.8], [-0.9, 1.38, -1.6], 42, 0, [-1.32, 1.6, 0.42], [-0.9, 1.38, -1.6], 40, 0], // udaas closeup slow push
  s05: [[0.6, 3.1, 7.6], [0, 1.55, -3.2], 53, 0, [0.35, 2.1, 6.0], [0, 1.55, -3.2], 50, 0],          // QA FIX: neeche + paas — neeche sadak khaali nahi, cycle+walker foreground
  s06: [[0, 1.8, 2.6], [0, 1.25, -3.0], 46, 0, [0, 2.25, 2.2], [0, 2.72, -2.32], 44, 0],               // tilt-up board tick
  s07: [[0.15, 1.85, 4.9], [0, 1.05, -2.6], 48, 0, [0.1, 1.78, 4.3], [0, 1.05, -2.6], 46, 0],   // bheed depth lanes (frontal)
  s08: [[0.35, 2.66, 1.95], [0, 2.72, -2.3], 48, 0, [0.18, 2.7, 1.7], [0, 2.72, -2.3], 48, 0],     // QA FIX: push-in z=1.7 par rukta — text margin ~12%
  s09: [[1.35, 1.72, 0.7], [0.6, 1.12, -3.0], 44, 0, [0.95, 1.78, 0.25], [0.6, 1.12, -3.0], 42, 0],  // tarazu halka orbit
  s10: [[0.1, 1.6, 1.7], [-0.1, 1.1, -2.95], 44, 0, [0.15, 1.57, 1.45], [-0.1, 1.1, -2.95], 42, 0], // exchange two-shot (safe)
  s11: [[-2.6, 1.62, 1.0], [-1.7, 1.05, -3.05], 45, 0, [-2.15, 1.58, 0.72], [-1.7, 1.05, -3.05], 43, 0], // showcase pan
  s12: [[-0.5, 1.7, 2.45], [-1.6, 1.25, -1.5], 47, 0, [-0.35, 1.68, 2.3], [-1.3, 1.25, -1.6], 46, 0],  // dhakka (handheld code me)
  s13: [[-0.72, 1.7, 0.95], [-0.55, 1.42, -2.2], 41, 0, [-0.64, 1.67, 0.5], [-0.55, 1.42, -2.2], 38, 0], // garv BIG closeup push
  s14: [[0.85, 1.62, 0.35], [0.28, 1.08, -2.98], 43, 0, [0.72, 1.59, 0.08], [0.28, 1.08, -2.98], 41, 0], // dibba band close
  s15: [[-0.35, 1.92, 3.3], [-0.4, 1.15, -2.3], 49, 0, [-0.25, 2.12, 4.7], [-0.3, 1.2, -2.4], 51, 0],   // nikalta pull-back
  s16: [[0.3, 1.7, 2.0], [-0.55, 1.3, -1.65], 46, 0, [0.32, 1.67, 1.75], [-0.55, 1.3, -1.65], 44, 0], // dost haath two-shot push
  s17: [[-0.5, 1.72, 1.1], [-0.45, 1.4, -1.6], 44, 0, [-0.42, 1.7, 0.75], [-0.45, 1.4, -1.6], 41, 0], // hasi closeup push
  s18: [[-1.3, 1.75, 1.6], [-0.3, 1.5, -2.2], 46, 0, [-1.1, 1.78, 1.3], [-0.2, 1.6, -2.3], 44, 0], // akad two-shot (Ramesh + board)
  s19: [[0.3, 1.7, 1.9], [-0.8, 1.35, -1.6], 46, 0, [0.25, 1.68, 1.6], [-0.8, 1.35, -1.6], 44, 0], // dost reaction two-shot
  s20: [[-1.6, 1.7, 2.2], [-0.6, 1.2, -1.2], 47, 0, [-1.45, 1.68, 1.8], [-0.8, 1.2, -1.5], 45, 0], // dibba leke chalta, side tracking (Ramesh frame me rehta)
  s21: [[-3.3, 1.5, -0.9], [-3.3, 1.2, -3.95], 48, 0, [-3.3, 1.45, -1.2], [-3.3, 1.15, -3.95], 46, 0], // almari tight closeup (QA FIX v2: peeche + chauda — darwaze + roshni dikhe)
  s22: [[-2.6, 1.7, -1.6], [-2.6, 1.45, -3.2], 40, 0, [-2.6, 1.68, -1.9], [-2.6, 1.45, -3.2], 38, 0], // sapna closeup (ghar kona)
  s23: [[-2.2, 1.6, -1.4], [-2.6, 1.2, -3.2], 44, 0, [-2.3, 1.58, -1.7], [-2.6, 1.2, -3.2], 42, 0], // dibba chamak dream shot
  s24: [[0.4, 1.9, 4.2], [-0.4, 1.3, -2.0], 48, 0, [0.3, 1.85, 3.6], [-0.4, 1.3, -2.0], 47, 0], // roshni badli wide-ish
  s25: [[-0.9, 1.9, 3.4], [0, 2.2, -2.6], 48, 0, [-0.7, 1.85, 2.9], [0, 2.3, -2.5], 47, 0], // board wide + Ramesh neeche
  s26: [[0.3, 2.6, 2.6], [0, 2.72, -2.3], 48, 0, [0.15, 2.68, 1.9], [0, 2.72, -2.3], 48, 0], // board tick-down (safe: z=1.9)
  s27: [[-0.6, 2.5, 3.0], [0, 2.6, -2.4], 48, 0, [-0.3, 2.55, 2.4], [0, 2.65, -2.35], 47, 0], // board + patli bheed
  s28: [[0.5, 2.4, 3.2], [0, 2.6, -2.4], 48, 0, [0.2, 2.5, 2.6], [0, 2.65, -2.35], 47, 0], // subah board
  s29: [[-0.9, 1.72, 0.9], [-0.88, 1.42, -1.6], 42, 0, [-0.3, 2.05, 4.6], [0, 2.0, -2.6], 50, 0], // s03 echo pull-back (shake)
  s30: [[-1.2, 1.65, 1.4], [-0.9, 1.4, -1.6], 42, 0, [-1.15, 1.64, 1.2], [-0.9, 1.4, -1.6], 41, 0], // frozen closeup
  s31: [[0.2, 1.8, 4.4], [-0.6, 1.1, -1.8], 48, 0, [0.15, 1.78, 3.9], [-0.6, 1.1, -1.8], 47, 0], // guzarta walk, frontal
  s32: [[-1.4, 1.7, 1.6], [-0.9, 1.5, -1.8], 44, 0, [-1.25, 1.72, 1.2], [-0.7, 1.8, -2.3], 42, 0], // ruk kar board tilt-up
  s33: [[0.6, 1.85, 3.8], [-0.9, 1.2, -1.0], 48, 0, [0.5, 1.82, 3.4], [-0.9, 1.2, -1.2], 47, 0], // peeth, chup nikal jata
  s34: [[-3.3, 1.5, -0.9], [-3.3, 1.15, -3.95], 48, 0, [-3.3, 1.45, -1.2], [-3.3, 1.1, -3.95], 46, 0], // almari raat (s21 rhyme, QA FIX v2)
  s35: [[0.6, 2.6, 7.2], [0, 1.5, -3.2], 52, 0, [0.4, 2.3, 6.2], [0, 1.5, -3.2], 50, 0], // khaali dukaan wide
  s36: [[1.35, 1.75, 0.7], [0.6, 1.15, -3.0], 44, 0, [0.95, 1.78, 0.25], [0.6, 1.15, -3.0], 42, 0], // tarazu closeup (s09 rhyme)
  s37: [[1.1, 1.7, 0.6], [0.95, 1.08, -2.95], 42, 0, [0.9, 1.68, 0.3], [0.95, 1.08, -2.95], 40, 0], // calculator closeup
  s38: [[0.5, 1.7, 0.9], [0.3, 1.45, -3.6], 41, 0, [0.45, 1.68, 0.6], [0.3, 1.45, -3.6], 39, 0], // sunar shaant closeup
  s39: [[-0.3, 1.7, 1.6], [-0.1, 1.5, -2.6], 46, 0, [-0.2, 1.68, 1.3], [-0.05, 1.55, -2.6], 44, 0], // quote two-shot + board flip
  s40: [[-0.7, 1.55, 0.7], [-0.85, 0.95, -1.3], 42, 0, [-0.68, 1.53, 0.5], [-0.85, 0.95, -1.3], 40, 0], // dibba chamak closeup
  s41: [[0.3, 2.6, 2.6], [0, 2.72, -2.3], 48, 0, [0.15, 2.68, 1.9], [0, 2.72, -2.3], 48, 0], // bujha board (s26 rhyme, no glint)
  s42: [[-0.7, 1.68, 1.0], [-0.6, 1.42, -1.9], 41, 0, [-0.65, 1.66, 0.7], [-0.6, 1.42, -1.9], 39, 0], // realisation face slow push
  s43: [[-0.2, 1.8, 2.9], [-0.1, 1.45, -2.35], 48, 0, [-0.1, 1.78, 2.5], [-0.1, 1.4, -2.35], 47, 0], // board→dibba two-shot (QA FIX v2: look kendra + peeche — board number pura)
  s44: [[0.8, 2.2, 5.6], [0, 1.4, -2.8], 50, 0, [0.6, 2.05, 4.9], [0, 1.4, -2.8], 49, 0], // khaali sadak hold, lamp
  s45: [[-0.7, 1.75, 2.9], [-0.1, 1.55, -2.4], 48, 0, [-0.6, 1.72, 2.5], [-0.1, 1.55, -2.4], 47, 0], // thesis: dibba vs board (QA FIX v2: look kendra + peeche — ₹1,60,000 pura)
  s46: [[0.2, 1.8, 4.4], [-0.6, 1.1, -1.8], 48, 0, [0.15, 1.78, 3.9], [-0.6, 1.1, -1.8], 47, 0], // loop walk (s31 rhyme)
  s47: [[0.6, 3.1, 7.6], [0, 1.55, -3.2], 53, 0, [0.35, 2.1, 6.0], [0, 1.55, -3.2], 50, 0], // loop wide (s05 rhyme)
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
