// "Khaali Dukaan" — FULL story (29 shots, 1379f @30fps, 45.98 s).
// Voice: Dukaan_Voice_Final.wav — timings raw Take 3 whisper segments se map ki
// (gap-compression + atempo 1.12; map kul 45.978 s vs asal 45.98 s).
// Set: sirf 'gali' (dono dukaan + tempo + parcels ek hi set me); env se samay.
// Beats: b01 hook | b02 subah khaali | b03 shaam galla | b04 Salim intro | b05 joke
// | b06 tempo 20 | b07 phone 50 | b08 crowd 100 | b09 do dukaan | b10 twist galle
// | b11 galla 40000 | b12 subah phir | b13 loop. NO captions.
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 1379;

// ---------- shots: [id, a, b, set, env, beat, sub] ----------
export const SHOTS = [
  ['s01', 0, 40, 'gali', 'morning', 'b01', 0],
  ['s02', 40, 75, 'gali', 'morning', 'b01', 1],
  ['s03', 75, 111, 'gali', 'morning', 'b01', 2],
  ['s04', 111, 155, 'gali', 'morning', 'b02', 0],
  ['s05', 155, 200, 'gali', 'morning', 'b02', 1],
  ['s06', 200, 251, 'gali', 'morning', 'b02', 2],
  ['s07', 251, 290, 'gali', 'evening', 'b03', 0],
  ['s08', 290, 325, 'gali', 'evening', 'b03', 1],
  ['s09', 325, 375, 'gali', 'day', 'b04', 0],
  ['s10', 375, 427, 'gali', 'day', 'b04', 1],
  ['s11', 427, 480, 'gali', 'day', 'b05', 0],
  ['s12', 480, 540, 'gali', 'day', 'b05', 1],
  ['s13', 540, 595, 'gali', 'day', 'b05', 2],
  ['s14', 595, 640, 'gali', 'day', 'b06', 0],
  ['s15', 640, 697, 'gali', 'day', 'b06', 1],
  ['s16', 697, 730, 'gali', 'day', 'b07', 0],
  ['s17', 730, 759, 'gali', 'day', 'b07', 1],
  ['s18', 759, 800, 'gali', 'evening', 'b08', 0],
  ['s19', 800, 832, 'gali', 'evening', 'b08', 1],
  ['s20', 840, 890, 'gali', 'evening', 'b09', 0],
  ['s21', 890, 935, 'gali', 'evening', 'b09', 1],
  ['s22', 943, 993, 'gali', 'evening', 'b10', 0],
  ['s23', 993, 1050, 'gali', 'evening', 'b10', 1],
  ['s24', 1050, 1112, 'gali', 'evening', 'b10', 2],
  ['s25', 1122, 1150, 'gali', 'evening', 'b11', 0],
  ['s26', 1150, 1179, 'gali', 'evening', 'b11', 1],
  ['s27', 1179, 1232, 'gali', 'morning', 'b12', 0],
  ['s28', 1241, 1300, 'gali', 'morning', 'b13', 0],
  ['s29', 1300, 1379, 'gali', 'morning', 'b13', 1],
];
export const BEAT_OF = {}; SHOTS.forEach(([id, , , , , beat]) => { BEAT_OF[id] = beat; });
export const BEAT_SPAN = {};
BEAT_SPAN['b01'] = [0, 111];
BEAT_SPAN['b02'] = [111, 251];
BEAT_SPAN['b03'] = [251, 325];
BEAT_SPAN['b04'] = [325, 427];
BEAT_SPAN['b05'] = [427, 595];
BEAT_SPAN['b06'] = [595, 697];
BEAT_SPAN['b07'] = [697, 759];
BEAT_SPAN['b08'] = [759, 832];
BEAT_SPAN['b09'] = [840, 935];
BEAT_SPAN['b10'] = [943, 1112];
BEAT_SPAN['b11'] = [1122, 1179];
BEAT_SPAN['b12'] = [1179, 1232];
BEAT_SPAN['b13'] = [1241, 1379];
const SHOTMAP = {}; SHOTS.forEach(([id, a, b, set, env, beat, sub]) => { SHOTMAP[id] = { id, a, b, set, env, beat, sub, len: b - a }; });
export const shotAt = (f) => {
  for (const [id, a, b] of SHOTS) if (f >= a && f < b) { const s = SHOTMAP[id]; return { ...s, u: clamp((f - a) / s.len) }; }
  const s = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...s, u: 1 };
};
export const beatU = (f) => { const s = shotAt(f), [a, b] = BEAT_SPAN[s.beat]; return clamp((f - a) / (b - a)); };
export const FLASH = {};

// ---------- CAMS: [startPos, startLook, fov, roll, endPos, endLook, fov, roll] ----------
// Dukaan layout: Salim shop centre x=-2.2 (front z=-3.6, back z=-4.3) | Kirana x=+2.6 |
// tempo parks (0.3, 0, -0.9) | parcel piles (-1.2, 0, -2.2) & street (-0.5, 0, -1.5).
// Wide = z 4.5-5.2 fov 56-60; medium = z 1-2.5 fov 50-55; close = z 0-0.8 fov 42-48.
// Card scale ≤1.6 (2.0 = chehra frame bhar jata hai — LAYOUT LOCK A).
export const CAMS = {
  // CAMERA GRAMMAR (Gullak 3-video research): ~60% static; push-in SIRF number/chehre par;
  // whip-pan SIRF shock par; NO low angle, NO orbit; aerial pull-back ending (s29).
  // Har shot ka angle + move ka REASON: wide = jagah, medium = kaam, CU = bhaav, macro = number.
  s01: [[-0.5, 3.2, 9.5], [0, 1.5, -3.8], 66, 0, [-0.5, 3.1, 8.6], [0, 1.5, -3.8], 63, 0], // HOOK wide push-in — gali + dono dukaan ek saath
  s02: [[-2.2, 1.8, 2.6], [-2.2, 1.7, -2.8], 58, 0, [-2.2, 1.7, 1.9], [-2.2, 1.5, -2.8], 54, 0], // PUSH-IN tag par — ₹40,000 + sign poora frame me
  s03: [[-2.2, 1.6, 1.6], [-2.2, 1.5, -3.8], 55, 0, [-2.2, 1.6, 1.5], [-2.2, 1.5, -3.8], 54, 0], // shutter khulta — static, kaam dikhe
  s04: [[-2.0, 1.5, -0.6], [-2.05, 0.9, -4.2], 58, 0, [-2.0, 1.5, -0.7], [-2.05, 0.9, -4.2], 57, 0], // interior wide — lamp + ghadi + almari sab frame me
  s05: [[-1.4, 1.5, -1.8], [-2.2, 0.95, -3.85], 46, 0, [-1.4, 1.5, -1.9], [-2.2, 0.95, -3.85], 45, 0], // register MACRO — naam likhna = kaam
  s06: [[-1.2, 1.4, -1.2], [-2.4, 1.0, -3.85], 50, 0, [-1.2, 1.4, -1.3], [-2.4, 1.0, -3.85], 49, 0], // mez saaf — medium, haath dikhe
  s07: [[-2.2, 1.7, 2.2], [-2.2, 1.6, -3.8], 55, 0, [-2.2, 1.7, 2.1], [-2.2, 1.6, -3.8], 54, 0], // shutter band — static, lamp ON
  s08: [[-1.2, 1.35, -0.8], [-2.5, 1.25, -3.8], 56, 0, [-1.2, 1.35, -0.9], [-2.5, 1.25, -3.8], 55, 0], // shutter-gap CU — Salim ka chehra + khula galla, dono poore
  s09: [[-2.2, 1.6, 1.2], [-2.2, 1.4, -2.6], 52, 0, [-2.2, 1.6, 1.1], [-2.2, 1.4, -2.6], 51, 0], // Salim intro medium
  s10: [[-1.2, 1.6, 0.2], [-2.05, 0.65, -3.8], 55, 0, [-1.2, 1.6, 0.1], [-2.05, 0.65, -3.8], 54, 0], // point — look neeche taaki kata top sign upar se bahar rahe (ghadi abhi bhi frame me)
  s11: [[-0.6, 1.6, 1.4], [-1.8, 1.3, -2.8], 56, 0, [-0.6, 1.6, 1.3], [-1.8, 1.3, -2.8], 55, 0], // two-shot — aunty ka sawal
  s12: [[-2.2, 1.7, 2.6], [-2.2, 1.6, -2.4], 54, 0, [-2.2, 1.7, 2.0], [-2.2, 1.6, -2.4], 50, 0], // PUSH-IN grin CU — joke ka punchline chehre par
  s13: [[-0.2, 1.7, 2.0], [-1.6, 1.2, -2.6], 56, 0, [-0.2, 1.7, 1.9], [-1.6, 1.2, -2.6], 55, 0], // two-shot — aunty parcel haath me, hasti
  s14: [[2.0, 2.4, 6.0], [-1.5, 1.0, -1.0], 62, 0, [1.8, 2.4, 5.8], [-1.3, 1.0, -1.0], 61, 0], // tempo aata — wide, gaadi chalti hui
  s15: [[-0.5, 2.8, 8.0], [0.2, 0.9, -1.8], 62, 0, [-0.5, 2.7, 7.8], [0.2, 0.9, -1.8], 61, 0], // unload wide — dher badhta dikhe
  s16: [[-2.2, 1.6, 0.8], [-2.2, 1.5, -2.8], 50, 0, [-2.2, 1.6, 0.7], [-2.2, 1.5, -2.8], 49, 0], // phone bajta — Salim medium, phone haath me
  s17: [[-1.2, 1.7, 0.9], [-2.0, 1.5, -2.3], 52, 0, [-1.3, 1.7, 0.7], [-2.0, 1.5, -2.3], 50, 0], // phone + Salim — medium, screen chhoti, chehra bada
  s18: [[0.5, 2.4, 5.5], [-1.0, 1.1, -2.4], 60, 0, [0.5, 2.4, 5.4], [-1.0, 1.1, -2.4], 59, 0], // crowd wide — bheed aati hui
  s19: [[-1.2, 2.2, 5.0], [-1.4, 1.0, -2.4], 58, 0, [-1.2, 2.2, 4.9], [-1.4, 1.0, -2.4], 57, 0], // pile + crowd — dher + haath me parcel
  s20: [[0.2, 3.0, 9.0], [0.2, 1.6, -4.0], 66, 0, [0.2, 2.95, 8.8], [0.2, 1.6, -4.0], 65, 0], // two-shop wide — contrast ek frame me
  s21: [[2.6, 1.7, 0.6], [2.6, 1.4, -3.2], 48, 0, [2.6, 1.7, 0.5], [2.6, 1.4, -3.2], 47, 0], // Seth close — sikke ginta
  s22: [[0.2, 2.2, 6.5], [0.2, 1.2, -3.7], 62, 0, [0.2, 2.1, 6.0], [0.2, 1.15, -3.7], 60, 0], // TWIST wide — dono galle + dono chehre (paas camera se kinare kat gaye the, isliye wapas wide + halka push-in)
  s23: [[2.6, 1.6, -0.2], [2.6, 1.1, -3.85], 48, 0, [2.6, 1.6, -0.7], [2.6, 1.0, -3.85], 44, 0], // PUSH-IN Seth galla — sirf 3 sikke, halka
  s24: [[-1.4, 1.7, 1.2], [-2.3, 0.95, -3.6], 54, 0, [-1.6, 1.5, 0.2], [-2.1, 0.8, -3.85], 48, 0], // PUSH-IN Salim galla — look neeche taaki kata "SALIM" sign upar se bahar rahe
  s25: [[-1.0, 2.1, 1.6], [-2.0, 1.6, -3.2], 52, 0, [-1.0, 2.1, 1.1], [-2.0, 1.6, -3.2], 48, 0], // PUSH-IN board — ₹40,000 gin kar badhe
  s26: [[-1.5, 2.0, 3.4], [-1.6, 1.3, -3.2], 56, 0, [-1.5, 2.0, 3.3], [-1.6, 1.3, -3.2], 55, 0], // HOLD wide — Salim + board + galla
  s27: [[-2.2, 1.7, 2.4], [-2.2, 1.5, -3.8], 55, 0, [-2.2, 1.7, 2.3], [-2.2, 1.5, -3.8], 54, 0], // subah phir — shutter khulta
  s28: [[-0.5, 1.8, 4.0], [-1.8, 1.1, -2.6], 60, 0, [-0.5, 1.8, 3.9], [-1.8, 1.1, -2.6], 59, 0], // Salim + dher medium
  s29: [[-0.5, 2.6, 6.0], [0.0, 1.2, -3.0], 60, 0, [-0.5, 4.2, 10.0], [0.0, 1.0, -3.0], 64, 0], // AERIAL PULL-BACK ending — poori gali, loop freeze
};
export const camFor = (shot, u) => {
  const c = CAMS[shot.id];
  const e = u * u * (3 - 2 * u);
  const L = (a, b) => a + (b - a) * e;
  const L3 = (a, b) => a.map((v, i) => L(v, b[i]));
  return { pos: L3(c[0], c[4]), look: L3(c[1], c[5]), fov: L(c[2], c[6]), roll: L(c[3], c[7]) };
};

export const captionAt = () => '';
