// "Momos Wala" — FULL VIDEO v2 REAL (49.19 s, 1476 frames @30fps). 61 shots, avg ~0.81 s/shot.
// RE-ANCHORED 26 Nov 2026: Momos_Voice_Final.wav (49.19 s, -15.08 LUFS, TP -1.35) ke real word-timings se.
// Beat spans = analytic line windows (voice/time_map.py), final transcription se validated (±0.2 s).
// 5 shots ADDED (s06b, s25b, s29b, s30b, s34b — duplicate sub, naya angle) taaki har shot <=30f rahe.
// Script APPROVED (script_v1.txt, 158 words, 14 lines) — ek shabd nahi badla.
// Beats b01..b14 = shotplan.md; sets 'gali' (shaam) | 'office' (din) | 'hotel' (raat).
// Env: evening (b01-b06, b08-b10) | morning (b07 subah 7 baje) | day (b08 office) | night (b11-b14 hotel).
// Cameras: har cut par ALAG angle, ~60% static + push-in number/chehre par, whip-pan sirf shock par.
// NO low angle (camera y >= 1.5, hamesha subject ke barabar ya upar), NO orbit, NO phoneme lip-sync.
// WITHHELD: chef sirf b11-b13 me dikhe (pehle phone/peon only); galla counter b09 me gin kar badhe + HOLD.
// NUMBERS-AS-OBJECTS: menu "VEG ₹50" (b03), tag "₹30 BACHAT" (b04), phone "60 PLATE" (b05),
//   galla counter "₹90,000" (b09, beat progress se, u>=0.75 par HOLD, 500-step), hotel board "SONU'S MOMOS" (b13-b14).
// NO captions — captionAt hamesha khaali. NO guna-bhaag, NO ghata beat, ant = loop freeze, KOI CTA NAHI.
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 1476;

// ---------- shots: [id, a, b, set, env, beat, sub] ----------
export const SHOTS = [
  ['s01', 0, 25, 'gali', 'evening', 'b01', 0],
  ['s02', 25, 50, 'gali', 'evening', 'b01', 1],
  ['s03', 50, 76, 'gali', 'evening', 'b01', 2],
  ['s04', 76, 101, 'gali', 'evening', 'b01', 3],
  ['s05', 101, 126, 'gali', 'evening', 'b01', 4],
  ['s06', 126, 150, 'gali', 'evening', 'b02', 0],
  ['s06b', 150, 173, 'gali', 'evening', 'b02', 0],
  ['s07', 173, 197, 'gali', 'evening', 'b02', 1],
  ['s08', 197, 220, 'gali', 'evening', 'b02', 2],
  ['s09', 220, 248, 'gali', 'evening', 'b03', 0],
  ['s10', 248, 275, 'gali', 'evening', 'b03', 1],
  ['s11', 275, 303, 'gali', 'evening', 'b03', 2],
  ['s12', 303, 330, 'gali', 'evening', 'b03', 3],
  ['s13', 330, 355, 'gali', 'evening', 'b04', 0],
  ['s14', 355, 380, 'gali', 'evening', 'b04', 1],
  ['s15', 380, 405, 'gali', 'evening', 'b04', 2],
  ['s16', 405, 430, 'gali', 'evening', 'b04', 3],
  ['s17', 430, 453, 'gali', 'evening', 'b05', 0],
  ['s18', 453, 476, 'gali', 'evening', 'b05', 1],
  ['s19', 476, 499, 'gali', 'evening', 'b05', 2],
  ['s20', 499, 522, 'gali', 'evening', 'b05', 3],
  ['s21', 522, 544, 'office', 'day', 'b05', 4],
  ['s22', 544, 568, 'gali', 'evening', 'b06', 0],
  ['s23', 568, 592, 'gali', 'evening', 'b06', 1],
  ['s24', 592, 615, 'gali', 'evening', 'b06', 2],
  ['s25', 615, 639, 'gali', 'morning', 'b07', 0],
  ['s25b', 639, 663, 'gali', 'morning', 'b07', 0],
  ['s26', 663, 687, 'gali', 'morning', 'b07', 1],
  ['s27', 687, 710, 'gali', 'morning', 'b07', 2],
  ['s28', 710, 734, 'gali', 'morning', 'b07', 3],
  ['s29', 734, 757, 'gali', 'morning', 'b07', 4],
  ['s29b', 757, 780, 'gali', 'morning', 'b07', 4],
  ['s30', 780, 804, 'office', 'day', 'b08', 0],
  ['s30b', 804, 828, 'office', 'day', 'b08', 0],
  ['s31', 828, 852, 'office', 'day', 'b08', 1],
  ['s32', 852, 875, 'office', 'day', 'b08', 2],
  ['s33', 875, 899, 'gali', 'evening', 'b09', 0],
  ['s34', 899, 923, 'gali', 'evening', 'b09', 1],
  ['s34b', 923, 947, 'gali', 'evening', 'b09', 1],
  ['s35', 947, 970, 'gali', 'evening', 'b09', 2],
  ['s36', 970, 996, 'gali', 'evening', 'b10', 0],
  ['s37', 996, 1021, 'gali', 'evening', 'b10', 1],
  ['s38', 1021, 1047, 'gali', 'evening', 'b10', 2],
  ['s39', 1047, 1072, 'gali', 'evening', 'b10', 3],
  ['s40', 1072, 1092, 'hotel', 'night', 'b11', 0],
  ['s41', 1092, 1112, 'hotel', 'night', 'b11', 1],
  ['s42', 1112, 1132, 'hotel', 'night', 'b11', 2],
  ['s43', 1132, 1151, 'hotel', 'night', 'b11', 3],
  ['s44', 1151, 1172, 'hotel', 'night', 'b12', 0],
  ['s45', 1172, 1193, 'gali', 'evening', 'b12', 1],
  ['s46', 1193, 1214, 'hotel', 'night', 'b12', 2],
  ['s47', 1214, 1235, 'hotel', 'night', 'b12', 3],
  ['s48', 1235, 1263, 'hotel', 'night', 'b13', 0],
  ['s49', 1263, 1291, 'hotel', 'night', 'b13', 1],
  ['s50', 1291, 1319, 'hotel', 'night', 'b13', 2],
  ['s51', 1319, 1345, 'hotel', 'night', 'b14', 0],
  ['s52', 1345, 1371, 'hotel', 'night', 'b14', 1],
  ['s53', 1371, 1397, 'hotel', 'night', 'b14', 2],
  ['s54', 1397, 1423, 'hotel', 'night', 'b14', 3],
  ['s55', 1423, 1449, 'hotel', 'night', 'b14', 4],
  ['s56', 1449, 1476, 'hotel', 'night', 'b14', 5],
];
export const BEAT_OF = {}; SHOTS.forEach(([id, , , , , beat]) => { BEAT_OF[id] = beat; });
export const BEAT_SPAN = {};
BEAT_SPAN['b01'] = [0, 126];
BEAT_SPAN['b02'] = [126, 220];
BEAT_SPAN['b03'] = [220, 330];
BEAT_SPAN['b04'] = [330, 430];
BEAT_SPAN['b05'] = [430, 544];
BEAT_SPAN['b06'] = [544, 615];
BEAT_SPAN['b07'] = [615, 780];
BEAT_SPAN['b08'] = [780, 875];
BEAT_SPAN['b09'] = [875, 970];
BEAT_SPAN['b10'] = [970, 1072];
BEAT_SPAN['b11'] = [1072, 1151];
BEAT_SPAN['b12'] = [1151, 1235];
BEAT_SPAN['b13'] = [1235, 1319];
BEAT_SPAN['b14'] = [1319, 1476];
const SHOTMAP = {}; SHOTS.forEach(([id, a, b, set, env, beat, sub]) => { SHOTMAP[id] = { id, a, b, set, env, beat, sub, len: b - a }; });
export const shotAt = (f) => {
  for (const [id, a, b] of SHOTS) if (f >= a && f < b) { const s = SHOTMAP[id]; return { ...s, u: clamp((f - a) / s.len) }; }
  const s = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...s, u: 1 };
};
// Beat progress (poori beat par 0..1) — beat-spanning animations ke liye (counter, galla lid, plate dher).
export const beatU = (f) => { const s = shotAt(f), [a, b] = BEAT_SPAN[s.beat]; return clamp((f - a) / (b - a)); };
export const FLASH = {};

// ---------- set layout (centre ~ (0,0,-2.4)) ----------
// gali: sadak z=1.8; thela (-1.2, -2.8) lakdi+chhat, 3-tier steamer + bhaap, "SONU MOMOS" sign (-1.2, 2.9),
//   menu board "VEG ₹50" thele par, plate dher + chutney dabbe (laal/hari) thela counter par, gas cylinder (1.6,-3.6),
//   crates (-4.3,-2.2), cycle (1.7,-3.85), lamp (-0.2,2.42, shaam ON), posters, wall clock (-2.3,1.9,-3.9, 5 baje b03 / 7 baje b07),
//   L2 mid-row z=-8 (tank+antenna+jalti khidki), L3 skyline z=-19 + 2nd silhouette z=-27 + suraj disc + 2 cloud layers.
// office: desk (0,-2.6), phone (0.3,1.3,-2.4), plate stacks, files, wall clock (0,2.2,-3.7), khidki se sheher (2.2,1.8,-3.7).
// hotel: marble counter (0,-2.8), "SONU'S MOMOS" board (0,2.1,-3.7), wall lamps (board ke dono taraf), plants, carpet (0,0.01,0).
export const CAMS = {
  s01: [[-7.5, 6.5, 9.5], [-1, 0.8, -3], 58, 0, [-3.2, 2.8, 4.2], [-1.9, 1.65, -3.9], 52, 0],
  s02: [[-3.2, 3.9, 3.4], [-0.9, 1.8, -2.2], 58, 0, [-2.7, 3.55, 2.55], [-0.9, 1.8, -2.2], 56, 0], // FIX 26 Nov: end keyframe peeche + fov 56 — Sonu face end par 0.89 tha (gate 0.85).
  s03: [[-1.3, 2.2, 2.6], [-0.8, 1.35, -2.49], 56, 0, [-1.3, 2.15, 2.6], [-0.8, 1.35, -2.49], 57, 0], // FIX 26 Nov: end keyframe peeche + fov 57 — sign end par 0.87 tha (gate 0.85).
  s04: [[-1.44, 2.1, 2.11], [-0.2, 1.6, -1.4], 48, 0, [-1.41, 2.08, 1.96], [-0.2, 1.6, -1.4], 47, 0],
  s05: [[-3.64, 3.8, 4.45], [-0.8, 1.2, -2.4], 56, 0, [-3.61, 3.78, 4.3], [-0.8, 1.2, -2.4], 55, 0],
  s06: [[-1.2, 1.7, 1.3], [-1.2, 1, -2.8], 56, 0, [-1.2, 1.6, 1.15], [-1.2, 1, -2.8], 55, 0],
  s06b: [[-0.85, 1.6, 1.5], [-1.2, 1, -2.8], 56, 0, [-0.8, 1.58, 1.35], [-1.2, 1, -2.8], 55, 0],
  s07: [[-0.75, 3.0, 2.3], [-0.2, 2.4, -1.4], 46, 0, [-0.7, 2.95, 2.15], [-0.2, 2.4, -1.4], 45, 0], // FIX 26 Nov LAYOUT LOCK (A): pehle camera z=1.7 + Sonu scale 2.0 — chehra upar+dayein kata (t6); ab Sonu 1.6 + camera peeche (z 2.3) + fov 46.
  s08: [[0.68, 2.1, 0.93], [1.2, 1.7, -1.8], 42, 0, [0.71, 2.08, 0.78], [1.2, 1.7, -1.8], 41, 0],
  s09: [[-3.18, 4, 4.08], [-0.8, 1.4, -2.4], 56, 0, [-3.15, 3.98, 3.93], [-0.8, 1.4, -2.4], 55, 0],
  s10: [[-0.85, 2.1, 1.64], [-0.2, 1.6, -1.4], 48, 0, [-0.82, 2.08, 1.49], [-0.2, 1.6, -1.4], 47, 0],
  s11: [[-2.0, 1.45, -0.2], [-0.55, 0.65, -2.45], 48, 0, [-1.95, 1.43, -0.35], [-0.55, 0.65, -2.45], 47, 0], // FIX 26 Nov LAYOUT LOCK (A): pehle camera [-0.32,1.5,-0.67] Sonu ke chehre ke 0.73 peeche tha — chehra poora frame bhar gaya, ek aankh dikhti thi (t10); ab camera pile par (2.8 door, fov 48) — menu peeche poora dikhega, Sonu dayein-peeche frame se bahar (b03 sub2). Look y 0.65 — thela sign upar frame se bahar (probe).
  s12: [[-2.45, 2.3, -1.64], [-2.3, 1.9, -3.9], 42, 0, [-2.42, 2.28, -1.79], [-2.3, 1.9, -3.9], 41, 0], // FIX 26 Nov LAYOUT LOCK (H): ghadi x -2.6 -> -2.3 — look + camera uske peeche.
  s13: [[-0.99, 1.8, 0.86], [-0.4, 1.3, -2], 48, 0, [-0.96, 1.78, 0.71], [-0.4, 1.3, -2], 47, 0],
  s14: [[0.3, 1.8, 0.9], [0.3, 1.3, -2], 40, 0, [0.3, 1.75, 0.75], [0.3, 1.3, -2], 39, 0],
  s15: [[0.5, 1.95, 3.3], [0.5, 1.37, -1.6], 52, 0, [0.5, 1.9, 3.15], [0.5, 1.37, -1.6], 51, 0],
  s16: [[-1.0, 2.2, 4.0], [-0.6, 1.3, -2.8], 60, 0, [-0.95, 2.15, 3.85], [-0.6, 1.3, -2.8], 59, 0], // FIX 26 Nov LAYOUT LOCK (H): pehle camera z=0.85 — CHAI poster dayein kata + SONU MOMOS banner baayein kata ("OS", t14); medium shot me 1.7-chauda sign fit hi nahi hota — ab WIDE shot (z 4.0, fov 60): poora thela + sign + poster + Sonu ek frame me.
  s17: [[-1.25, 2.3, 1.5], [-0.75, 1.85, -1.3], 44, 0, [-1.15, 2.25, 1.35], [-0.75, 1.85, -1.3], 43, 0],
  s18: [[-0.55, 2.35, 2.3], [-0.55, 1.85, -1.35], 48, 0, [-0.55, 2.3, 2.15], [-0.55, 1.85, -1.35], 47, 0],
  s19: [[-0.25, 2.25, 1.6], [-0.75, 1.85, -1.3], 46, 0, [-0.3, 2.2, 1.45], [-0.75, 1.85, -1.3], 45, 0],
  s20: [[0.37, 2, 1.55], [1.6, 1.5, -2], 48, 0, [0.4, 1.98, 1.4], [1.6, 1.5, -2], 47, 0],
  s21: [[-2.76, 4, 4.22], [0, 1.4, -2.6], 56, 0, [-2.73, 3.98, 4.07], [0, 1.4, -2.6], 55, 0],
  s22: [[-0.84, 2.2, 1.43], [-0.2, 1.8, -1.4], 42, 0, [-0.81, 2.18, 1.28], [-0.2, 1.8, -1.4], 41, 0],
  s23: [[-3.3, 3.8, 4.2], [-0.8, 1.2, -2.4], 56, 0, [-3.27, 3.78, 4.05], [-0.8, 1.2, -2.4], 55, 0],
  s24: [[0.85, 2, 1.16], [1.6, 1.5, -2], 48, 0, [0.88, 1.98, 1.01], [1.6, 1.5, -2], 47, 0],
  s25: [[-1.65, 1.5, -0.5], [-1.65, 0.9, -2.8], 42, 0, [-1.6, 1.5, -0.65], [-1.65, 0.9, -2.8], 41, 0],
  s25b: [[-2.5, 1.4, -1.0], [-1.65, 0.9, -2.8], 41, 0, [-2.45, 1.38, -1.15], [-1.65, 0.9, -2.8], 40, 0], // FIX 26 Nov LAYOUT LOCK (H): ghadi upar-baayein kinare aadhi kati thi (t22) — saamne se camera me ghadi hamesha corner me aati thi; ab camera baayein taraf se (x -2.5), ghadi poori frame se bahar, steamer centre me.
  s26: [[-0.9, 1.55, -0.85], [-0.9, 0.68, -2.52], 42, 0, [-0.85, 1.5, -1], [-0.9, 0.68, -2.52], 41, 0],
  s27: [[1.6, 2.35, -1.35], [1.6, 1.84, -4.2], 46, 0, [1.6, 2.3, -1.5], [1.6, 1.84, -4.2], 45, 0],
  s28: [[-0.8, 2.1, 1.46], [-0.2, 1.6, -1.4], 48, 0, [-0.77, 2.08, 1.31], [-0.2, 1.6, -1.4], 47, 0],
  s29: [[-3.1, 4, 3.83], [-0.8, 1.4, -2.4], 56, 0, [-3.07, 3.98, 3.68], [-0.8, 1.4, -2.4], 55, 0],
  s29b: [[-3.67, 3.98, 3.98], [-0.8, 1.4, -2.4], 55, 0, [-3.62, 3.96, 3.83], [-0.8, 1.4, -2.4], 54, 0],
  s30: [[0, 1.95, 1.9], [0, 1.4, -3], 52, 0, [0, 1.9, 1.75], [0, 1.4, -3], 51, 0],
  s30b: [[0.25, 1.9, 2.1], [0, 1.4, -3], 56, 0, [0.3, 1.88, 1.95], [0, 1.4, -3], 55, 0],
  s31: [[-1.3, 1.9, -0.5], [-0.8, 1.4, -3], 42, 0, [-1.25, 1.85, -0.65], [-0.8, 1.4, -3], 41, 0],
  s32: [[-2.22, 4.2, 3.63], [0.5, 1.6, -3], 56, 0, [-2.19, 4.18, 3.48], [0.5, 1.6, -3], 55, 0],
  s33: [[0.15, 1.75, 0.85], [-0.2, 1.17, -1.95], 46, 0, [0.1, 1.7, 0.7], [-0.2, 1.17, -1.95], 45, 0],
  s34: [[-1.3, 3.05, -0.6], [-1.3, 2.35, -4.22], 48, 0, [-1.3, 3.0, -0.85], [-1.3, 2.35, -4.22], 47, 0], // FIX 26 Nov LAYOUT LOCK (J): pehle camera y=2.55 — board + kaali chhat + laal banner 3 stacked band bhar gaye (t30); ab camera upar (y 3.05) — board subject, chhat neeche kinare, banner frame se bahar.
  s34b: [[-0.85, 3.0, -0.85], [-1.3, 2.35, -4.22], 47, 0, [-0.8, 2.98, -1], [-1.3, 2.35, -4.22], 46, 0], // FIX 26 Nov LAYOUT LOCK (J): camera upar (y 2.5 -> 3.0), wahi wajah.
  s35: [[-3.33, 3.9, 4.65], [-0.5, 1.3, -2.2], 56, 0, [-3.3, 3.88, 4.5], [-0.5, 1.3, -2.2], 55, 0],
  s36: [[-0.94, 2.2, 1.51], [-0.2, 1.8, -1.4], 42, 0, [-0.91, 2.18, 1.36], [-0.2, 1.8, -1.4], 41, 0],
  s37: [[-0.3, 1.7, 0.8], [-0.9, 0.68, -2.52], 48, 0, [-0.32, 1.68, 0.65], [-0.9, 0.68, -2.52], 47, 0], // FIX 26 Nov LAYOUT LOCK (A/H): pehle camera z=-0.75 — menu board peeche 1.53 door, prices kate ("VEG ₹5 / PANEER ₹", t34); ab camera peeche+dayein (z 0.8, x -0.3) + fov 48 + Sonu side me (b10 sub1) — board poora + dabbe subject.
  s38: [[0.5, 1.95, 3], [0.5, 1.4, -1.6], 52, 0, [0.5, 1.9, 2.85], [0.5, 1.4, -1.6], 51, 0],
  s39: [[-3.13, 4, 4.03], [-0.8, 1.4, -2.4], 56, 0, [-3.1, 3.98, 3.88], [-0.8, 1.4, -2.4], 55, 0],
  s40: [[-2.22, 4.2, 3.5], [0, 1.6, -2.8], 56, 0, [-2.19, 4.18, 3.35], [0, 1.6, -2.8], 55, 0],
  s41: [[0.6, 1.85, 0.1], [0.6, 1.45, -2.6], 46, 0, [0.6, 1.82, -0.05], [0.6, 1.45, -2.6], 45, 0], // FIX 26 Nov: camera upar (1.65->1.85) + look uthaye hue chef ke chehre par (0.77->1.45) — pehle counter trim chehra kaat rahi thi (sample v2 f353/f360)
  s42: [[0.15, 3.0, 3.4], [0.35, 2.5, -2.7], 62, 0, [0.2, 2.95, 3.25], [0.35, 2.5, -2.7], 61, 0], // FIX 26 Nov: camera peeche + fov 62 — chef (x 1.25, s 2.0) + board (-0.2) dono poore dikhein.
  s43: [[-0.14, 2.6, 3.0], [-0.14, 2.0, -1.9], 56, 0, [-0.14, 2.55, 2.85], [-0.14, 2.0, -1.9], 55, 0], // FIX 26 Nov LAYOUT LOCK (F): Sonu 2.0 -> 1.1 + camera peeche (z 3.0) — dono ek duniya ke lagein (t38).
  s44: [[-0.12, 2.1, 0.74], [0.6, 1.6, -2.2], 48, 0, [-0.09, 2.08, 0.59], [0.6, 1.6, -2.2], 47, 0],
  s45: [[-1.66, 4, 4.16], [0.8, 1.4, -2.2], 56, 0, [-1.63, 3.98, 4.01], [0.8, 1.4, -2.2], 55, 0],
  s46: [[-0.01, 2.3, 0.41], [0.6, 1.9, -2.2], 42, 0, [0.02, 2.28, 0.26], [0.6, 1.9, -2.2], 41, 0],
  s47: [[-1.74, 2.2, 1.75], [-0.6, 1.7, -1.6], 48, 0, [-1.71, 2.18, 1.6], [-0.6, 1.7, -1.6], 47, 0],
  s48: [[-0.9, 2.6, 0.7], [-0.2, 2.15, -3.72], 55, 0, [0.9, 2.6, 0.7], [-0.2, 2.15, -3.72], 55, 0], // FIX 26 Nov: board x -0.2 — look uske peeche.
  s49: [[-1.55, 2.2, 2.34], [0, 1.6, -2], 50, 0, [-1.52, 2.18, 2.19], [0, 1.6, -2], 49, 0],
  s50: [[-0.12, 2.65, 2.9], [-0.12, 2.0, -1.9], 56, 0, [-0.12, 2.6, 2.75], [-0.12, 2.0, -1.9], 55, 0], // FIX 26 Nov LAYOUT LOCK (A): Sonu 2.0 -> 1.35 + camera peeche (z 2.9) — smile CU me chehra frame na bhare.
  s51: [[3.27, 2.6, 2.4], [0, 1.6, -2.4], 54, 0, [-3.73, 2.6, 2.4], [-0.5, 1.6, -2.4], 54, 0],
  s52: [[-3.1, 4, 4.09], [-0.5, 1.4, -2.6], 56, 0, [-3.07, 3.98, 3.94], [-0.5, 1.4, -2.6], 55, 0],
  s53: [[-1.15, 2.2, 2.06], [0, 1.6, -2], 50, 0, [-1.12, 2.18, 1.91], [0, 1.6, -2], 49, 0],
  s54: [[0.3, 2.6, 1], [-0.2, 2.15, -3.72], 56, 0, [0.3, 2.55, 0.7], [-0.2, 2.15, -3.72], 55, 0], // FIX 26 Nov: board x -0.2 — look uske peeche.
  s55: [[-1.1, 3.0, 1.9], [-0.6, 2.3, -1.6], 46, 0, [-1.05, 2.95, 1.75], [-0.6, 2.3, -1.6], 45, 0], // FIX 26 Nov LAYOUT LOCK (A): Sonu 2.0 -> 1.35 + camera peeche (z 1.9) + fov 46 — relief CU me chehra poora margin ke saath.
  s56: [[-1.5, 2.1, 3.6], [-0.5, 1.5, -2.2], 50, 0, [-1.5, 2.1, 3.6], [-0.5, 1.5, -2.2], 50, 0],
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
