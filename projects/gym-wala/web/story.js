// "Gym Wala" — FULL FILM (53 shots, 2025f @30fps = 67.49 s).
// Title: "Gym Khaali, ₹5 Lakh Kamai!" — Hero: unnamed young gym owner (fresh design).
// Voice (LOCKED, regenerate nahi): gym-narration-tight.mp3 — 67.49 s, speed-125 tight.
// Line windows (frames @30fps, faster-whisper base re-verified 27 Nov 2026 against the
// TIGHT mp3 — max drift 0.21 s at the L17/L18 boundary, all others ≤0.07 s; no change):
// L1 0-46 | L2 47-104 | L3 104-173 | L4 173-227 | L5 227-313 | L6 313-412 | L7 412-501
// | L8 501-551 | L9 551-635 | L10 635-703 | L11 703-773 | L12 773-841 | L13 841-911
// | L14 911-988 | L15 988-1021 | L16 1021-1091 | L17 1091-1141 | L18 1141-1190
// | L19 1190-1279 | L20 1279-1344 | L21 1344-1428 | L22 1428-1510 | L23 1510-1576
// | L24 1576-1621 | L25 1621-1679 | L26 1679-1727 | L27 1727-1794 | L28 1794-1864
// | L29 1864-1931 | L30 1931-2021.
// Sections (CONTIGUOUS beats, 0-2024, no gaps): b01 HOOK morning (L1-L8) | b02 JANUARY
// day (L9-L10) | b03 MARCH dull (L11-L12) | b04 TWIST evening (L13-L30).
// Shots: 53, avg 38f (1.27 s), range 33-55f — har line 1-3 shots me, shot kabhi line ke
// beech me nahi kata (split sirf line ke andar, natural midpoint par). Har shot me
// camera move (push-in minimum, presets rotate — do lagatar shots kabhi ek angle nahi).
// NO captions. Numbers as objects: fee board (L7 + s02/s03), galla + board (s04).
// "67%" NEVER used. Galla ₹5,00,000 sirf DIKHA (board + cash), guna-bhaag bola nahi.
// LIP-SYNC: envelope.js (tight master se per-frame ENV) — mouth = smoothed ENV,
// gain 1.7, 0.035 se neeche = band. Beat-level MOUTH_BEATS HATA diya (full build).
// OCCLUDERS (props between camera and hero text/face — checked per still, see SCENE_PLAN.md):
// s01: light cone (additive, behind hero), foreground dumbbells/kettlebells (bottom, below
// face line), yoga mats (floor, below face line). s02/s03: fee board (left, clear of hero),
// queue members (beside hero, never in front of face), bikes (right, riders fully in frame).
// s04: till lid (open, below face), cash stacks (on counter, below face), galla board
// (above counter, above face line), wall shelf + bottles (above board, above face line).
// NO sub-remapping: every shot's sub is explicit below (sub 0 each); no remap helper exists.
import { clamp } from './motion.js';
import { ENV } from './envelope.js';

export const FPS = 30;
export const TOTAL = 2025;

// ---------- lines (locked script, faster-whisper re-verified) ----------
export const LINES = [
  ['L1', 0, 46], ['L2', 47, 104], ['L3', 104, 173], ['L4', 173, 227], ['L5', 227, 313],
  ['L6', 313, 412], ['L7', 412, 501], ['L8', 501, 551], ['L9', 551, 635], ['L10', 635, 703],
  ['L11', 703, 773], ['L12', 773, 841], ['L13', 841, 911], ['L14', 911, 988], ['L15', 988, 1021],
  ['L16', 1021, 1091], ['L17', 1091, 1141], ['L18', 1141, 1190], ['L19', 1190, 1279],
  ['L20', 1279, 1344], ['L21', 1344, 1428], ['L22', 1428, 1510], ['L23', 1510, 1576],
  ['L24', 1576, 1621], ['L25', 1621, 1679], ['L26', 1679, 1727], ['L27', 1727, 1794],
  ['L28', 1794, 1864], ['L29', 1864, 1931], ['L30', 1931, 2021],
];
export const LINE_STARTS = LINES.map(([, a]) => a);

// ---------- lip-sync: mouth openness 0..1 from the voice RMS envelope ----------
// ENV file me pehle se 3-frame smoothing hai; yahan gain 1.7 + 0.035 threshold.
export function mouthAt(f) {
  const a = ENV[Math.max(0, f - 1)] || 0, b = ENV[f] || 0, c = ENV[Math.min(TOTAL - 1, f + 1)] || 0;
  const s = (a + b + c) / 3;
  if (s < 0.035) return 0;
  return clamp(s * 1.7, 0, 1);
}
// Painter (toon.js) mouth kinds hain — openness ko kind me map karo: halki awaaz = 'o',
// zor ki awaaz = 'O', band = null (expression ka apna munh dikhe).
export function mouthKind(f) {
  const o = mouthAt(f);
  if (o <= 0) return null;
  return o < 0.6 ? 'o' : 'O';
}

// ---------- hero expression timeline (12-frame morph at each line start) ----------
// [frame, expr] — chehra 12 frames me morph karta hai (toon.js mix: brow lerp + eye switch).
const EXPR_KEYS = [
  [0, 'neutral'], [47, 'smile'], [104, 'neutral'], [173, 'neutral'], [227, 'smile'],
  [313, 'smile'], [412, 'smile'], [501, 'grin'], [551, 'grin'], [635, 'nervous'],
  [703, 'nervous'], [773, 'nervous'], [841, 'shock'], [875, 'relief'], [911, 'smile'],
  [988, 'smile'], [1021, 'grin'], [1091, 'neutral'], [1141, 'smile'], [1190, 'smile'],
  [1279, 'smile'], [1344, 'smile'], [1428, 'grin'], [1510, 'smile'], [1576, 'grin'],
  [1621, 'shock'], [1679, 'nervous'], [1727, 'smile'], [1794, 'smile'], [1864, 'smile'],
  [1931, 'grin'], [1990, 'relief'],
];
export function heroExprAt(f) {
  let cur = EXPR_KEYS[0][1], mix = null;
  for (let i = 1; i < EXPR_KEYS.length; i++) {
    const [kf, e2] = EXPR_KEYS[i];
    if (f >= kf + 12) { cur = e2; continue; }
    if (f >= kf) { mix = { e2, u: (f - kf) / 12 }; }
    break;
  }
  return { expr: cur, mix };
}

// ---------- camera presets: [startPos, startLook, fov, endPos, endLook, endFov] ----------
// Har preset me push-in (pos + fov) hai — koi shot static nahi. No orbit/low-angle/Dutch.
export const CAMS = {
  // s01 HOOK (hero -0.6,-2.6)
  A: [[0.1, 1.55, 1.45], [-0.6, 1.5, -2.6], 50, [0.05, 1.55, 1.25], [-0.6, 1.5, -2.6], 48],
  B: [[-0.2, 1.55, 0.6], [-0.6, 1.35, -2.6], 46, [-0.2, 1.55, 0.55], [-0.6, 1.35, -2.6], 45],
  C: [[-1.5, 2.0, 4.5], [0, 1.3, -3.0], 60, [-1.5, 1.95, 4.2], [0, 1.3, -3.0], 58],
  D: [[1.6, 1.65, 0.2], [-0.6, 1.45, -2.6], 50, [1.4, 1.65, 0.0], [-0.6, 1.45, -2.6], 48],
  E: [[2.6, 1.7, 1.2], [-1.8, 1.5, -3.8], 52, [2.4, 1.7, 1.0], [-1.8, 1.5, -3.8], 50],
  // SMOKE QA ROUND 1 (2026-11-27) — F/F2/TM/TC/GB/HC/WE/W2R2 sab dobara hisaab se banaye:
  // F: pehle board hero ka chehra dhak raha tha + board neeche kata tha. Ab camera peeche
  // (z 3.6) — board BAYEIN poora, hero DAYEIN poora, dono ek frame me.
  F: [[-1.6, 1.7, 3.6], [-1.5, 1.1, -1.2], 56, [-1.6, 1.65, 3.8], [-1.5, 1.1, -1.2], 54],
  // F2: ROUND 2 — bayein se lene par board hero ka chehra dhak raha tha (f457). Ab DAYEIN
  // taraf se — board BAYEIN poora, hero DAYEIN poora, dono ek frame me, chehra saaf.
  F2: [[0.8, 1.6, 3.2], [-1.8, 1.1, -0.9], 58, [0.6, 1.55, 3.4], [-1.8, 1.1, -0.9], 56],
  W1: [[-0.35, 1.9, 5.3], [-1.1, 1.5, -3.2], 72, [-0.35, 1.85, 5.05], [-1.1, 1.5, -3.2], 70],
  // s02 JANUARY (wide = fix7 verified cam)
  W2: [[-0.35, 1.9, 5.3], [-1.1, 1.5, -3.2], 72, [-0.35, 1.85, 5.05], [-1.1, 1.5, -3.2], 70],
  W2L: [[-1.6, 1.9, 5.0], [-1.6, 1.4, -3.0], 68, [-1.6, 1.85, 4.8], [-1.6, 1.4, -3.0], 66],
  // W2R2: W2R me hero bayein kinare kata tha (q45 f1700). Camera dayein + look bayein —
  // hero poora andar. (W2R hata diya; q16/q37/q45 ab W2R2.)
  W2R2: [[1.8, 1.9, 4.6], [0.0, 1.4, -3.2], 68, [1.8, 1.85, 4.4], [0.0, 1.4, -3.2], 66],
  // s03 MARCH (W3 = W1 geometry, dull env)
  W3: [[-0.35, 1.9, 5.3], [-1.1, 1.5, -3.2], 72, [-0.35, 1.85, 5.05], [-1.1, 1.5, -3.2], 70],
  B3: [[-0.2, 1.55, 0.6], [-0.6, 1.35, -2.6], 46, [-0.2, 1.55, 0.55], [-0.6, 1.35, -2.6], 45],
  // TM: ROUND 2 — dayein se lene par fee board treadmill member ko dhak raha tha + frame
  // me khaali deewaar/farsh. Ab BAYEIN taraf se — window + C0 treadmill par + squat rack,
  // fee board frame se bahar. Hero is shot me frame se bahar BY DESIGN (treadmill cutaway).
  TM: [[-3.8, 1.8, 2.2], [-3.2, 1.2, -3.0], 56, [-3.6, 1.8, 2.0], [-3.2, 1.2, -3.0], 54],
  // s04 TWIST (counter 2.6,-3.4; hero 1.45,-4.3; GALLA board 2.3,2.95,-5.94)
  T: [[1.95, 1.9, 0.7], [2.15, 1.6, -3.6], 48, [2.0, 1.85, 0.45], [2.15, 1.6, -3.6], 46],
  // TC: pehle hero ka chehra bayein kinare kata tha (aadha chehra). Camera peeche + look
  // bayein — hero poora, till + GALLA board + calendar sab poore.
  TC: [[1.9, 1.8, 0.3], [2.0, 1.3, -3.6], 54, [1.85, 1.75, 0.15], [2.0, 1.3, -3.6], 52],
  // GB: pehle hero neeche-bayein kone kata + calendar dayein kata tha. Ab board + calendar
  // ke beech centre (x 2.6) — dono POORE. Hero is shot me frame se bahar BY DESIGN (board cutaway).
  GB: [[2.6, 2.5, -0.6], [2.6, 2.9, -5.94], 46, [2.6, 2.45, -0.8], [2.6, 2.9, -5.94], 45],
  // HC: ROUND 2 — dayein camera par bhi GALLA board upar-dayein kata tha (board hero ke
  // peeche, lagbhag ek hi line me hai). Ab camera NEECHE jhuka (look y 0.5) — board frame
  // ke upar bahar, hero + sheesha + counter poore. Clock/poster bhi bahar.
  HC: [[2.7, 1.7, -0.6], [1.45, 0.5, -4.3], 46, [2.75, 1.65, -0.7], [1.45, 0.5, -4.3], 45],
  // CH: look y 1.05->0.95 — GALLA board ki sunehri kinari upar jhaank rahi thi, ab bahar.
  CH: [[3.2, 1.5, -1.2], [2.9, 0.95, -3.35], 50, [3.1, 1.45, -1.4], [2.9, 0.95, -3.35], 48],
  // WE: fov 72/70 -> 74/72 — GALLA board ka dayein kinara ant me kata tha (0.2° bahar).
  WE: [[-0.35, 1.9, 5.3], [-1.1, 1.5, -3.2], 74, [-0.35, 1.85, 5.05], [-1.1, 1.5, -3.2], 72],
  LR: [[0.1, 1.55, 1.45], [-0.6, 1.5, -2.6], 50, [0.05, 1.55, 1.25], [-0.6, 1.5, -2.6], 48],
};

// ---------- SHOTS: [id, a, b, beat, cam, heroX, heroZ, heroS, R, L, tilt, crowd, board] ----------
// crowd: 'none' | 'arrive' (3 queue) | 'jan' (13) | 'mar' (4). board: '' | 'fee' | 'galla'
// (beat default: b02/b03 -> fee board, b04 -> galla board; b01 me board sirf shot.board='fee' par.)
export const SHOTS = [
  // s01 HOOK — khaali gym, subah (L1-L8)
  ['q01', 0, 47, 'b01', 'A', -0.6, -2.6, 1.05, 'hang', 'hang', 0, 'none', ''],
  ['q02', 47, 76, 'b01', 'B', -0.6, -2.6, 1.05, 'hang', 'hang', 0, 'none', ''],
  ['q03', 76, 104, 'b01', 'C', -0.6, -2.6, 1.05, 'hang', 'hang', 0, 'none', ''],
  ['q04', 104, 139, 'b01', 'D', -0.6, -2.6, 1.05, 'hang', 'hang', 0, 'none', ''],
  ['q05', 139, 173, 'b01', 'A', -0.6, -2.6, 1.05, 'reach', 'hang', 0, 'none', ''],
  ['q06', 173, 227, 'b01', 'B', -0.6, -2.6, 1.05, 'up', 'hang', 0, 'none', ''],
  ['q07', 227, 270, 'b01', 'C', -0.6, -2.6, 1.05, 'hang', 'hang', 0, 'none', ''],
  ['q08', 270, 313, 'b01', 'A', -0.6, -2.6, 1.05, 'reach', 'hang', 0, 'none', ''],
  // SMOKE QA ROUND 1: q09 ka camera A tha — q08 bhi A (lagatar ek hi angle). q09 ab B
  // (close-up, L6b reaction) — q08 A, q09 B, q10 D, sab alag.
  ['q09', 313, 346, 'b01', 'B', -0.6, -2.6, 1.05, 'hang', 'point', 0, 'none', ''],
  ['q10', 346, 379, 'b01', 'D', -0.6, -2.6, 1.05, 'hang', 'hang', 0, 'none', ''],
  ['q11', 379, 412, 'b01', 'E', -0.6, -2.6, 1.05, 'reach', 'hang', 0, 'none', ''],
  ['q12', 412, 457, 'b01', 'F', -1.2, -1.6, 1.05, 'hang', 'point', 0, 'none', 'fee'],
  ['q13', 457, 501, 'b01', 'F2', -1.2, -1.6, 1.05, 'hang', 'point', 0, 'none', 'fee'],
  ['q14', 501, 551, 'b01', 'W1', -1.2, -1.6, 1.05, 'hang', 'point', 0, 'arrive', 'fee'],
  // s02 JANUARY — bhara gym, din (L9-L10)
  ['q15', 551, 593, 'b02', 'W2', -1.2, -1.6, 1.05, 'hang', 'point', 0, 'jan', 'fee'],
  // SMOKE QA ROUND 2: q16 W2R2 me fee board bayein kata + JANUARY calendar dayein kata
  // tha (dayein angle se board bayein kinare padta hai). q16 ab W2L (bayein angle — board
  // + hero dono poore, calendar frame se bahar). q37/q45 W2R2 shaam me sahi hain (GALLA
  // board dayein poora, calendar bahar).
  ['q16', 593, 635, 'b02', 'W2L', -1.2, -1.6, 1.05, 'reach', 'hang', 0, 'jan', 'fee'],
  ['q17', 635, 670, 'b02', 'W2', -1.2, -1.6, 1.05, 'hang', 'hang', 0, 'jan', 'fee'],
  ['q18', 670, 703, 'b02', 'W2L', -1.2, -1.6, 1.05, 'hang', 'hang', -1, 'mar', 'fee'],
  // s03 MARCH — wahi gym, khaali, dull (L11-L12)
  ['q19', 703, 739, 'b03', 'W3', -0.6, -2.6, 1.05, 'hang', 'hang', -1, 'mar', 'fee'],
  ['q20', 739, 773, 'b03', 'B3', -0.6, -2.6, 1.05, 'hang', 'hang', -1, 'none', 'fee'],
  ['q21', 773, 808, 'b03', 'TM', -0.6, -2.6, 1.05, 'hang', 'hang', -1, 'mar', 'fee'],
  ['q22', 808, 841, 'b03', 'A', -0.6, -2.6, 1.05, 'hang', 'hang', -1, 'none', 'fee'],
  // s04 TWIST — counter/galla, shaam (L13-L30)
  ['q23', 841, 876, 'b04', 'T', 1.45, -4.3, 1.1, 'reach', 'hang', 0, 'none', 'galla'],
  ['q24', 876, 911, 'b04', 'TC', 1.45, -4.3, 1.1, 'reach', 'hang', 0, 'none', 'galla'],
  ['q25', 911, 951, 'b04', 'HC', 1.45, -4.3, 1.1, 'hang', 'hang', 0, 'none', 'galla'],
  ['q26', 951, 988, 'b04', 'T', 1.45, -4.3, 1.1, 'hang', 'point', 0, 'none', 'galla'],
  ['q27', 988, 1021, 'b04', 'HC', 1.45, -4.3, 1.1, 'hang', 'hang', 0, 'none', 'galla'],
  ['q28', 1021, 1057, 'b04', 'T', 1.45, -4.3, 1.1, 'reach', 'hang', 0, 'none', 'galla'],
  ['q29', 1057, 1091, 'b04', 'CH', 1.45, -4.3, 1.1, 'hang', 'hang', 0, 'none', 'galla'],
  // SMOKE QA ROUND 1: WE shots me hero (-0.6,-2.6) queue ke peeche chhup jata tha (q36 f1360)
  // — hero ab (-1.2,-1.6) queue ke BAYEIN, saaf dikhe. q44 'janE' (C1/C2 hata — bayein
  // kinare chehra kata tha). q37/q45 W2R2 (W2R me hero kata tha).
  ['q30', 1091, 1141, 'b04', 'WE', -1.2, -1.6, 1.05, 'hang', 'hang', 0, 'mar', 'galla'],
  ['q31', 1141, 1190, 'b04', 'GB', 1.45, -4.3, 1.1, 'hang', 'point', 0, 'none', 'galla'],
  ['q32', 1190, 1235, 'b04', 'TC', 1.45, -4.3, 1.1, 'reach', 'hang', 0, 'none', 'galla'],
  ['q33', 1235, 1279, 'b04', 'T', 1.45, -4.3, 1.1, 'hang', 'hang', 0, 'none', 'galla'],
  ['q34', 1279, 1312, 'b04', 'HC', 1.45, -4.3, 1.1, 'hang', 'point', 0, 'none', 'galla'],
  ['q35', 1312, 1344, 'b04', 'T', 1.45, -4.3, 1.1, 'reach', 'hang', 0, 'none', 'galla'],
  ['q36', 1344, 1387, 'b04', 'WE', -1.2, -1.6, 1.05, 'hang', 'point', 0, 'arrive', 'galla'],
  ['q37', 1387, 1428, 'b04', 'W2R2', -1.2, -1.6, 1.05, 'hang', 'hang', 0, 'arrive', 'galla'],
  ['q38', 1428, 1470, 'b04', 'WE', -1.2, -1.6, 1.05, 'hang', 'hang', 0, 'mar', 'galla'],
  ['q39', 1470, 1510, 'b04', 'HC', 1.45, -4.3, 1.1, 'hang', 'hang', 0, 'none', 'galla'],
  ['q40', 1510, 1544, 'b04', 'T', 1.45, -4.3, 1.1, 'hang', 'point', 0, 'none', 'galla'],
  ['q41', 1544, 1576, 'b04', 'GB', 1.45, -4.3, 1.1, 'hang', 'hang', 0, 'none', 'galla'],
  ['q42', 1576, 1621, 'b04', 'TC', 1.45, -4.3, 1.1, 'reach', 'hang', 0, 'none', 'galla'],
  ['q43', 1621, 1651, 'b04', 'HC', 1.45, -4.3, 1.1, 'hang', 'hang', 0, 'none', 'galla'],
  ['q44', 1651, 1680, 'b04', 'WE', -1.2, -1.6, 1.05, 'hang', 'hang', 0, 'janE', 'galla'],
  ['q45', 1680, 1727, 'b04', 'W2R2', -1.2, -1.6, 1.05, 'hang', 'hang', -1, 'jan', 'galla'],
  ['q46', 1727, 1761, 'b04', 'HC', 1.45, -4.3, 1.1, 'hang', 'hang', 0, 'none', 'galla'],
  ['q47', 1761, 1794, 'b04', 'T', 1.45, -4.3, 1.1, 'hang', 'point', 0, 'none', 'galla'],
  ['q48', 1794, 1830, 'b04', 'HC', 1.45, -4.3, 1.1, 'hang', 'point', 0, 'none', 'galla'],
  ['q49', 1830, 1864, 'b04', 'WE', -1.2, -1.6, 1.05, 'hang', 'point', 0, 'mar', 'galla'],
  ['q50', 1864, 1898, 'b04', 'CH', 1.45, -4.3, 1.1, 'hang', 'hang', 0, 'none', 'galla'],
  ['q51', 1898, 1931, 'b04', 'T', 1.45, -4.3, 1.1, 'reach', 'hang', 0, 'none', 'galla'],
  ['q52', 1931, 1976, 'b04', 'HC', 1.45, -4.3, 1.1, 'hang', 'hang', 0, 'none', 'galla'],
  ['q53', 1976, 2021, 'b04', 'LR', -0.6, -2.6, 1.05, 'hang', 'hang', 0, 'none', 'galla'],
];
const SHOTMAP = {};
SHOTS.forEach(([id, a, b, beat, cam, hx, hz, hs, R, L, tilt, crowd, board]) => {
  SHOTMAP[id] = { id, a, b, beat, cam: CAMS[cam], camName: cam, hx, hz, hs, R, L, tilt, crowd, board, sub: 0, len: b - a };
});
export const BEAT_OF = {}; SHOTS.forEach((s) => { BEAT_OF[s[0]] = s[3]; });
export const BEAT_SPAN = { b01: [0, 551], b02: [551, 703], b03: [703, 841], b04: [841, 2025] };
export const shotAt = (f) => {
  for (const s of SHOTS) {
    if (f >= s[1] && f < s[2]) { const sh = SHOTMAP[s[0]]; return { ...sh, u: clamp((f - s[1]) / sh.len) }; }
  }
  const sh = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...sh, u: 1 };
};
export const beatU = (f) => { const s = shotAt(f), [a, b] = BEAT_SPAN[s.beat]; return clamp((f - a) / (b - a)); };
export const FLASH = {};

// ---------- CAMS (compat: shot-id -> cam array) ----------
export const CAMS_BY_SHOT = {}; SHOTS.forEach((s) => { CAMS_BY_SHOT[s[0]] = CAMS[s[4]]; });
export const camFor = (shot, u) => {
  const c = shot.cam;
  const e = u * u * (3 - 2 * u);
  const L = (a, b) => a + (b - a) * e;
  const L3 = (a, b) => a.map((v, i) => L(v, b[i]));
  return { pos: L3(c[0], c[3]), look: L3(c[1], c[4]), fov: L(c[2], c[5]), roll: 0 };
};

export const captionAt = () => '';
