// "Khaali Dukaan" — FULL story RE-CUT v2 (ZERO-KAMI GATE, 2026-11-27).
// 58 shots, 1379f @30fps, 45.98 s. Avg 23.8f = 0.79 s/shot (Sona-Chandi ~0.8 s).
// Voice: Dukaan_Voice_Final.wav — timings raw Take 3 whisper segments se map ki
// (gap-compression + atempo 1.12; map kul 45.978 s vs asal 45.98 s).
// BEAT_SPAN UNCHANGED from v1 — voice timing locked. Har frame 0..1378 covered
// exactly once — v1 ke gaps (832-840, 935-943, 1112-1122, 1232-1241) ab
// padosi shots me absorb ho gaye (s19b, s21b, s24c, s27b).
// Set: sirf 'gali' (dono dukaan + tempo + parcels ek hi set me); env se samay.
// Beats: b01 hook | b02 subah khaali | b03 shaam galla | b04 Salim intro | b05 joke
// | b06 tempo 20 | b07 phone 50 | b08 crowd 100 | b09 do dukaan | b10 twist galle
// | b11 galla 40000 | b12 subah phir | b13 loop. NO captions.
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 1379;

// ---------- shots: [id, a, b, set, env, beat, sub] ----------
export const SHOTS = [
  ['s01a', 0, 20, 'gali', 'morning', 'b01', 0],   // hook: Salim walks IN (medium-wide — Salim ~21% tall, not 15%)
  ['s01b', 20, 40, 'gali', 'morning', 'b01', 1],  // hook wide: dono dukaan + skyline (taller buildings fill top)
  ['s02a', 40, 58, 'gali', 'morning', 'b01', 2],  // Salim CU + tag40 pops in
  ['s02b', 58, 75, 'gali', 'morning', 'b01', 3],  // tag macro + wonder face
  ['s03a', 75, 93, 'gali', 'morning', 'b01', 4],  // shutter OPENING (fast — fully open by f84)
  ['s03b', 93, 111, 'gali', 'morning', 'b01', 5], // shutter open, Salim smiling inside
  ['s04a', 111, 133, 'gali', 'morning', 'b02', 0], // interior wide: lamp+ghadi+almari, COBWEB visible (time passed)
  ['s04b', 133, 155, 'gali', 'morning', 'b02', 1], // MIRROR hero: mirror fully clear, Salim reaching
  ['s05a', 155, 178, 'gali', 'morning', 'b02', 2], // register macro: Salim writing
  ['s05b', 178, 200, 'gali', 'morning', 'b02', 3], // register macro other side: PEN visible
  ['s06a', 200, 226, 'gali', 'morning', 'b02', 4], // mez saaf: cloth wipes left, BELL on mez
  ['s06b', 226, 251, 'gali', 'morning', 'b02', 5], // mez saaf other side: lone box on shelf
  ['s07a', 251, 270, 'gali', 'evening', 'b03', 0], // shutter closing, lamp ON
  ['s07b', 270, 290, 'gali', 'evening', 'b03', 1], // LIGHT-CONE still: Salim alone in the lamp cone
  ['s08a', 290, 308, 'gali', 'evening', 'b03', 2], // shutter-gap CU: Salim face + galla
  ['s08b', 308, 325, 'gali', 'evening', 'b03', 3], // galla close: notes visible, lid half-open
  ['s09a', 325, 350, 'gali', 'day', 'b04', 0],     // Salim medium
  ['s09b', 350, 375, 'gali', 'day', 'b04', 1],     // Salim medium right side, khaali almari behind
  ['s10a', 375, 401, 'gali', 'day', 'b04', 2],     // Salim points at empty shelf
  ['s10b', 401, 427, 'gali', 'day', 'b04', 3],     // MIRROR hero: mirror + Salim + shelf one frame
  ['s11a', 427, 453, 'gali', 'day', 'b05', 0],     // two-shot: aunty asks
  ['s11b', 453, 480, 'gali', 'day', 'b05', 1],     // two-shot behind aunty: Salim's face big
  ['s12a', 480, 510, 'gali', 'day', 'b05', 2],     // Salim GRIN CU push-in
  ['s12b', 510, 540, 'gali', 'day', 'b05', 3],     // grin CU tighter + BIRD crosses frame
  ['s13a', 540, 568, 'gali', 'day', 'b05', 4],     // aunty with parcel laughing
  ['s13b', 568, 595, 'gali', 'day', 'b05', 5],     // aunty + Salim laughing, parcel in hand
  ['s14a', 595, 618, 'gali', 'day', 'b06', 0],     // tempo drives IN, wide
  ['s14b', 618, 640, 'gali', 'day', 'b06', 1],     // tempo arriving, Salim watching (wonder)
  ['s15a', 640, 669, 'gali', 'day', 'b06', 2],     // unload WIDE (high angle), pile 1->7
  ['s15b', 669, 697, 'gali', 'day', 'b06', 3],     // unload medium: man hands parcel to Salim, pile 8->12
  ['s16a', 697, 714, 'gali', 'day', 'b07', 0],     // phone rings, Salim medium
  ['s16b', 714, 730, 'gali', 'day', 'b07', 1],     // Salim picks up phone, closer
  ['s17a', 730, 745, 'gali', 'day', 'b07', 2],     // phone ECU + Salim face
  ['s17b', 745, 759, 'gali', 'day', 'b07', 3],     // phone screen + pile 14 behind
  ['s18a', 759, 780, 'gali', 'evening', 'b08', 0], // crowd wide: people walk in
  ['s18b', 780, 800, 'gali', 'evening', 'b08', 1], // crowd medium: aunty/man/kid taking parcels
  ['s19a', 800, 816, 'gali', 'evening', 'b08', 2], // pile + crowd, Salim laughing
  ['s19b', 816, 840, 'gali', 'evening', 'b08', 3], // SCALE-SHIFT: high cam, tiny Salim beside PARCEL MOUNTAIN (2.2 m)
  ['s20a', 840, 865, 'gali', 'evening', 'b09', 0], // two-shop wide (tighter, skyline fills top)
  ['s20b', 865, 890, 'gali', 'evening', 'b09', 1], // two-shop wide from left, thela at frame edge (foreground)
  ['s21a', 890, 913, 'gali', 'evening', 'b09', 2], // Seth counting coins, lid opens PARTWAY
  ['s21b', 913, 943, 'gali', 'evening', 'b09', 3], // Seth close: coins in hand, lid still partway
  ['s22a', 943, 968, 'gali', 'evening', 'b10', 0], // twist wide: both gallas open
  ['s22b', 968, 993, 'gali', 'evening', 'b10', 1], // twist wide front-left: both faces + lids
  ['s23a', 993, 1022, 'gali', 'evening', 'b10', 2], // Seth galla push-in: only 3 coins, PAINED + SWEAT + SLUMP
  ['s23b', 1022, 1050, 'gali', 'evening', 'b10', 3], // Seth galla tighter: coins macro + pained face
  ['s24a', 1050, 1078, 'gali', 'evening', 'b10', 4], // Salim galla push-in: notes overflow, GRIN
  ['s24b', 1078, 1100, 'gali', 'evening', 'b10', 5], // Salim galla: notes macro + grin face
  ['s24c', 1100, 1122, 'gali', 'evening', 'b10', 6], // Salim galla wide hold (fills v1 gap 1112-1122)
  ['s25a', 1122, 1150, 'gali', 'evening', 'b11', 0], // board counts UP 0->~26000
  ['s26a', 1150, 1179, 'gali', 'evening', 'b11', 1], // HOLD wide: Salim + board + galla, count ->40000
  ['s27a', 1179, 1206, 'gali', 'morning', 'b12', 0], // shutter opens FAST (fully open by f1192 — clock never covered)
  ['s27b', 1206, 1241, 'gali', 'morning', 'b12', 1], // shutter open: Salim smiling, clock + mirror in frame
  ['s28a', 1241, 1271, 'gali', 'morning', 'b13', 0], // Salim + dher medium
  ['s28b', 1271, 1300, 'gali', 'morning', 'b13', 1], // Salim + dher from right, tempo behind
  ['s29a', 1300, 1326, 'gali', 'morning', 'b13', 2], // loop medium: Salim + dher + tempo
  ['s29b', 1326, 1355, 'gali', 'morning', 'b13', 3], // AERIAL PULL-BACK wide (rhymes with s01b)
  ['s29c', 1355, 1379, 'gali', 'morning', 'b13', 4], // push-in closeup, Salim's biggest smile, FREEZE
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
  // whip-pan SIRF shock par (yahan koi shock beat nahi — whip-pan NAHI use hua);
  // NO low angle, NO orbit; aerial pull-back ending (s29b). High-angle 4x: s15a, s19b, s20a, s29b.
  // Har shot ka angle + move ka REASON: wide = jagah, medium = kaam, CU = bhaav, macro = number.
  // Wides me look-y neeche (1.2-1.6) rakha gaya hai taaki upar khaali aasmaan kam dikhe —
  // upar ki taraf ab 10-13 m unchi skyline + baadal + taar hain.
  s01a: [[0.2, 2.0, 4.2], [-2.6, 1.4, -2.6], 56, 0, [0.0, 1.9, 3.8], [-2.6, 1.4, -2.6], 54, 0], // HOOK medium-wide — Salim walk-in, ~21% tall
  s01b: [[-0.5, 2.6, 9.0], [0, 1.6, -3.8], 64, 0, [-0.5, 2.5, 8.6], [0, 1.6, -3.8], 62, 0], // hook wide — dono dukaan + skyline
  s02a: [[-2.2, 1.8, 2.6], [-2.2, 1.6, -2.8], 56, 0, [-2.2, 1.7, 2.1], [-2.2, 1.6, -2.8], 52, 0], // PUSH-IN tag par — ₹40,000 + sign poora frame me
  s02b: [[-1.8, 2.0, 1.4], [-1.9, 2.0, -2.4], 48, 0, [-1.8, 1.95, 1.1], [-1.9, 2.0, -2.4], 46, 0], // tag macro + wonder face — v3: Salim ka kaan frame se kata tha, camera left
  s03a: [[-2.2, 1.6, 1.6], [-2.2, 1.5, -3.8], 55, 0, [-2.2, 1.6, 1.4], [-2.2, 1.5, -3.8], 54, 0], // shutter khulta — static, kaam dikhe
  s03b: [[-1.4, 1.5, 1.2], [-2.2, 1.4, -3.8], 52, 0, [-1.5, 1.5, 1.1], [-2.2, 1.4, -3.8], 51, 0], // shutter open, Salim smiling inside
  s04a: [[-2.0, 1.5, -0.6], [-2.05, 0.9, -4.2], 58, 0, [-2.0, 1.5, -0.7], [-2.05, 0.9, -4.2], 57, 0], // interior wide — lamp + ghadi + almari + cobweb
  s04b: [[-0.4, 1.5, 0.2], [-1.6, 1.3, -4.0], 60, 0, [-0.5, 1.5, 0.1], [-1.6, 1.3, -4.0], 58, 0], // MIRROR hero — sheesha poora saaf
  s05a: [[-1.2, 1.5, -1.0], [-2.3, 1.0, -3.85], 50, 0, [-1.3, 1.5, -1.1], [-2.3, 1.0, -3.85], 48, 0], // register MACRO — naam likhna = kaam
  s05b: [[-3.4, 1.5, -1.0], [-2.3, 1.0, -3.85], 50, 0, [-3.3, 1.5, -1.1], [-2.3, 1.0, -3.85], 48, 0], // register macro other side — PEN dikhe
  s06a: [[-1.0, 1.5, -0.4], [-2.3, 1.2, -3.85], 52, 0, [-1.1, 1.5, -0.5], [-2.3, 1.2, -3.85], 50, 0], // mez saaf — medium, haath + BELL dikhe
  s06b: [[-3.6, 1.5, -0.8], [-2.1, 1.2, -3.78], 56, 0, [-3.5, 1.5, -0.9], [-2.1, 1.2, -3.78], 54, 0], // mez saaf other side — lone box on shelf — v3.1 FIX 27 Nov: look +0.1 screen-right, fov 52->56/50->54 (Salim ka sir right edge se kata tha, f240)
  s07a: [[-2.2, 1.7, 2.2], [-2.2, 1.6, -3.8], 55, 0, [-2.2, 1.7, 2.0], [-2.2, 1.6, -3.8], 54, 0], // shutter band — static, lamp ON
  s07b: [[-1.6, 1.6, 1.4], [-2.4, 1.4, -3.6], 50, 0, [-1.7, 1.6, 1.3], [-2.4, 1.4, -3.6], 49, 0], // LIGHT-CONE — Salim akela lamp cone me
  s08a: [[-1.2, 1.35, -0.8], [-2.5, 1.25, -3.8], 56, 0, [-1.3, 1.35, -0.9], [-2.5, 1.25, -3.8], 55, 0], // shutter-gap CU — Salim ka chehra + khula galla
  s08b: [[-1.6, 1.4, -1.2], [-2.2, 1.05, -3.85], 52, 0, [-1.7, 1.4, -1.3], [-2.2, 1.05, -3.85], 50, 0], // galla close — notes + lid half-open
  s09a: [[-2.2, 1.6, 1.2], [-2.2, 1.4, -2.6], 52, 0, [-2.2, 1.6, 1.0], [-2.2, 1.4, -2.6], 51, 0], // Salim intro medium
  s09b: [[-0.8, 1.6, 0.6], [-2.3, 1.3, -3.4], 52, 0, [-0.9, 1.6, 0.5], [-2.3, 1.3, -3.4], 51, 0], // Salim medium right side, khaali almari behind
  s10a: [[-1.2, 1.6, 0.2], [-2.05, 0.65, -3.8], 55, 0, [-1.3, 1.6, 0.1], [-2.05, 0.65, -3.8], 54, 0], // point — look neeche taaki kata top sign upar se bahar rahe
  s10b: [[-0.4, 1.5, 0.8], [-1.85, 1.1, -4.0], 62, 0, [-0.5, 1.5, 0.7], [-1.85, 1.1, -4.0], 60, 0], // MIRROR hero — mirror + Salim + shelf ek frame me — v3.1 FIX 27 Nov: look -0.15 Salim ki taraf, fov 58->62/56->60 (chehra left edge se kata tha, f420; sheesha margin check karna)
  s11a: [[-0.6, 1.6, 1.4], [-1.8, 1.3, -2.8], 56, 0, [-0.7, 1.6, 1.3], [-1.8, 1.3, -2.8], 55, 0], // two-shot — aunty ka sawal
  s11b: [[0.2, 1.7, 0.4], [-2.0, 1.4, -2.6], 52, 0, [0.1, 1.7, 0.3], [-2.0, 1.4, -2.6], 51, 0], // two-shot behind aunty — Salim's face big
  s12a: [[-2.2, 1.7, 2.6], [-2.2, 1.6, -2.4], 54, 0, [-2.2, 1.7, 2.0], [-2.2, 1.6, -2.4], 50, 0], // PUSH-IN grin CU — joke ka punchline chehre par
  s12b: [[-2.2, 1.7, 2.0], [-2.2, 1.55, -2.4], 50, 0, [-2.2, 1.65, 1.7], [-2.2, 1.55, -2.4], 47, 0], // grin CU tighter + BIRD crosses frame
  s13a: [[-0.2, 1.7, 2.0], [-1.6, 1.2, -2.6], 56, 0, [-0.3, 1.7, 1.9], [-1.6, 1.2, -2.6], 55, 0], // two-shot — aunty parcel haath me, hasti
  s13b: [[-0.9, 1.6, 1.2], [-1.5, 1.2, -2.4], 52, 0, [-1.0, 1.6, 1.1], [-1.5, 1.2, -2.4], 51, 0], // aunty + Salim laughing, parcel in hand
  s14a: [[2.0, 2.4, 6.0], [-1.5, 1.0, -1.0], 62, 0, [1.8, 2.3, 5.6], [-1.5, 1.0, -1.0], 60, 0], // tempo aata — wide, gaadi chalti hui
  s14b: [[-3.0, 2.0, 4.5], [-0.2, 1.0, -0.9], 60, 0, [-2.9, 2.0, 4.3], [-0.2, 1.0, -0.9], 58, 0], // tempo arriving, Salim watching (wonder)
  s15a: [[-0.5, 2.8, 8.0], [0.2, 0.9, -1.8], 62, 0, [-0.5, 2.7, 7.6], [0.2, 0.9, -1.8], 60, 0], // unload WIDE high angle — dher badhta dikhe
  s15b: [[-2.6, 1.8, 2.6], [-1.4, 0.9, -1.8], 54, 0, [-2.5, 1.8, 2.4], [-1.4, 0.9, -1.8], 53, 0], // unload medium — man hands parcel to Salim
  s16a: [[-2.2, 1.6, 0.8], [-2.2, 1.5, -2.8], 50, 0, [-2.2, 1.6, 0.7], [-2.2, 1.5, -2.8], 49, 0], // phone bajta — Salim medium, phone haath me
  s16b: [[-1.6, 1.6, 0.4], [-2.0, 1.5, -2.6], 52, 0, [-1.7, 1.6, 0.3], [-2.0, 1.5, -2.6], 51, 0], // Salim picks up phone, closer — v3.1 FIX 27 Nov: look +0.2, fov 48->52/47->51 (ghadi right edge se kati thi, f720)
  s17a: [[-1.2, 1.7, 0.9], [-2.0, 1.5, -2.3], 52, 0, [-1.3, 1.7, 0.8], [-2.0, 1.5, -2.3], 51, 0], // phone + Salim — medium, screen chhoti, chehra bada
  s17b: [[-1.8, 1.7, 0.6], [-1.9, 1.4, -2.2], 50, 0, [-1.8, 1.7, 0.5], [-1.9, 1.4, -2.2], 49, 0], // phone screen + pile 14 behind
  s18a: [[0.5, 2.4, 5.5], [-1.0, 1.1, -2.4], 60, 0, [0.4, 2.3, 5.2], [-1.0, 1.1, -2.4], 59, 0], // crowd wide — bheed aati hui
  s18b: [[-1.8, 2.0, 3.4], [-1.2, 1.0, -2.0], 56, 0, [-1.7, 2.0, 3.2], [-1.2, 1.0, -2.0], 55, 0], // crowd medium — aunty/man/kid taking parcels
  s19a: [[-1.2, 2.2, 5.0], [-1.4, 1.0, -2.4], 58, 0, [-1.2, 2.1, 4.8], [-1.4, 1.0, -2.4], 57, 0], // pile + crowd — dher + haath me parcel
  s19b: [[-1.0, 4.2, 3.2], [-1.2, 0.8, -2.2], 56, 0, [-1.0, 4.0, 3.0], [-1.2, 0.8, -2.2], 55, 0], // SCALE SHIFT high angle — tiny Salim + parcel mountain
  s20a: [[0.2, 2.3, 7.0], [0.2, 1.7, -4.0], 60, 0, [0.0, 2.2, 6.6], [0.2, 1.7, -4.0], 58, 0], // two-shop wide — contrast ek frame me
  s20b: [[-3.2, 2.2, 6.0], [0.6, 1.6, -3.8], 58, 0, [-3.0, 2.1, 5.6], [0.6, 1.6, -3.8], 57, 0], // two-shop wide from left, thela at frame edge
  s21a: [[2.6, 1.7, 0.6], [2.6, 1.6, -3.2], 48, 0, [2.6, 1.7, 0.5], [2.6, 1.6, -3.2], 47, 0], // Seth close — sikke ginta, lid PARTWAY
  s21b: [[2.2, 1.6, 0.0], [2.7, 1.4, -3.4], 46, 0, [2.2, 1.6, -0.1], [2.7, 1.4, -3.4], 45, 0], // Seth closer — coins in hand, lid still partway
  s22a: [[0.2, 2.0, 5.8], [0.2, 1.4, -3.7], 60, 0, [0.2, 1.9, 5.4], [0.2, 1.4, -3.7], 58, 0], // TWIST wide — dono galle + dono chehre
  s22b: [[-2.2, 2.0, 5.2], [-0.2, 1.1, -3.6], 60, 0, [-2.1, 2.0, 5.0], [-0.2, 1.1, -3.6], 58, 0], // twist wide front-left — both faces + lids
  s23a: [[2.6, 1.6, -0.2], [2.6, 1.1, -3.85], 48, 0, [2.6, 1.6, -0.7], [2.6, 1.0, -3.85], 44, 0], // PUSH-IN Seth galla — sirf 3 sikke
  s23b: [[2.6, 1.5, -1.0], [2.6, 1.0, -3.85], 44, 0, [2.6, 1.5, -1.1], [2.6, 1.0, -3.85], 42, 0], // Seth galla tighter — coins macro + pained face
  s24a: [[-1.4, 1.7, 1.2], [-2.3, 0.95, -3.6], 54, 0, [-1.6, 1.5, 0.2], [-2.1, 0.8, -3.85], 48, 0], // PUSH-IN Salim galla — look neeche taaki kata sign upar se bahar rahe
  s24b: [[-2.0, 1.5, 0.4], [-2.2, 0.9, -3.85], 48, 0, [-2.0, 1.5, 0.3], [-2.2, 0.9, -3.85], 44, 0], // Salim galla — notes macro + grin face
  s24c: [[-1.2, 1.8, 2.2], [-2.1, 1.0, -3.6], 56, 0, [-1.3, 1.8, 2.0], [-2.1, 1.0, -3.6], 55, 0], // Salim galla wide hold
  s25a: [[-1.0, 2.1, 1.6], [-2.0, 1.6, -3.2], 52, 0, [-1.0, 2.1, 1.1], [-2.0, 1.6, -3.2], 48, 0], // PUSH-IN board — ₹40,000 gin kar badhe
  s26a: [[-1.5, 2.0, 3.4], [-1.6, 1.3, -3.2], 56, 0, [-1.5, 2.0, 3.2], [-1.6, 1.3, -3.2], 55, 0], // HOLD wide — Salim + board + galla
  s27a: [[-2.2, 1.7, 2.4], [-2.2, 1.5, -3.8], 55, 0, [-2.2, 1.7, 2.2], [-2.2, 1.5, -3.8], 54, 0], // subah phir — shutter FAST khulta, ghadi saaf
  s27b: [[-1.5, 1.6, 1.6], [-2.1, 1.5, -3.9], 52, 0, [-1.6, 1.6, 1.5], [-2.1, 1.5, -3.9], 51, 0], // shutter open — Salim smiling, clock + mirror in frame
  s28a: [[-0.5, 1.8, 4.0], [-1.8, 1.1, -2.6], 60, 0, [-0.5, 1.8, 3.8], [-1.8, 1.1, -2.6], 59, 0], // Salim + dher medium
  s28b: [[1.6, 1.8, 3.4], [-2.0, 1.1, -2.4], 58, 0, [1.5, 1.8, 3.2], [-2.0, 1.1, -2.4], 57, 0], // Salim + dher from right, tempo behind
  s29a: [[-0.5, 2.2, 5.0], [-0.6, 1.2, -2.6], 60, 0, [-0.5, 2.1, 4.8], [-0.6, 1.2, -2.6], 59, 0], // loop medium — Salim + dher + tempo
  s29b: [[-0.5, 2.6, 6.0], [0.0, 1.2, -3.0], 60, 0, [-0.5, 4.2, 10.0], [0.0, 1.0, -3.0], 64, 0], // AERIAL PULL-BACK ending — poori gali, loop rhyme with s01b
  s29c: [[-2.2, 1.7, 2.2], [-2.2, 1.55, -2.4], 50, 0, [-2.2, 1.65, 1.6], [-2.2, 1.55, -2.4], 46, 0], // push-in closeup, Salim's biggest smile, FREEZE
};
export const camFor = (shot, u) => {
  const c = CAMS[shot.id];
  const e = u * u * (3 - 2 * u);
  const L = (a, b) => a + (b - a) * e;
  const L3 = (a, b) => a.map((v, i) => L(v, b[i]));
  return { pos: L3(c[0], c[4]), look: L3(c[1], c[5]), fov: L(c[2], c[6]), roll: L(c[3], c[7]) };
};

export const captionAt = () => '';
