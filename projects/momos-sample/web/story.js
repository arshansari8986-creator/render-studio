// "Momos Wala" — SAMPLE v2 REAL (18.6 s, 559 frames @30fps). Full shots ka subset nahi —
// full shots hi, sample timeline par remapped (L1 + L9 + L10 + L11 + L14, full lines, koi mid-line cut nahi).
// RE-ANCHORED 26 Nov 2026: Momos_Voice_Final.wav ke real timings se. Segments: hook s01-s05 (L1)
// + galla s33/s34/s34b/s35 (L9 counter) + khud-check s36-s39 (L10, NAYA) + chef reveal s40-s43 (L11)
// + ending s51-s56 (L14 freeze). Audio = voice ke cut segments (L1 + L9 + L10 + L11 + L14).
// Chef sample me sirf reveal shot me dikhe — usse pehle phone/peon only (full jaisa WITHHELD).
// NO captions — captionAt hamesha khaali. NO phoneme lip-sync — munh sirf beat par (main.js me mouthFor()).
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 559;

// ---------- shots: [id, a, b, set, env, beat, sub] ----------
// s01-s05 = full s01-s05 (hook); s33/s34/s34b/s35 = full galla (L9); s36-s39 = full khud-check (L10);
// s40-s43 = full chef reveal (L11); s51-s56 = full ending (L14 freeze).
export const SHOTS = [
  ['s01', 0, 25, 'gali', 'evening', 'b01', 0],
  ['s02', 25, 50, 'gali', 'evening', 'b01', 1],
  ['s03', 50, 76, 'gali', 'evening', 'b01', 2],
  ['s04', 76, 101, 'gali', 'evening', 'b01', 3],
  ['s05', 101, 126, 'gali', 'evening', 'b01', 4],
  ['s33', 126, 150, 'gali', 'evening', 'b09', 0],
  ['s34', 150, 174, 'gali', 'evening', 'b09', 1],
  ['s34b', 174, 198, 'gali', 'evening', 'b09', 1],
  ['s35', 198, 221, 'gali', 'evening', 'b09', 2],
  ['s36', 221, 247, 'gali', 'evening', 'b10', 0],
  ['s37', 247, 272, 'gali', 'evening', 'b10', 1],
  ['s38', 272, 298, 'gali', 'evening', 'b10', 2],
  ['s39', 298, 323, 'gali', 'evening', 'b10', 3],
  ['s40', 323, 343, 'hotel', 'night', 'b11', 0],
  ['s41', 343, 363, 'hotel', 'night', 'b11', 1],
  ['s42', 363, 383, 'hotel', 'night', 'b11', 2],
  ['s43', 383, 402, 'hotel', 'night', 'b11', 3],
  ['s51', 402, 428, 'hotel', 'night', 'b14', 0],
  ['s52', 428, 454, 'hotel', 'night', 'b14', 1],
  ['s53', 454, 480, 'hotel', 'night', 'b14', 2],
  ['s54', 480, 506, 'hotel', 'night', 'b14', 3],
  ['s55', 506, 532, 'hotel', 'night', 'b14', 4],
  ['s56', 532, 559, 'hotel', 'night', 'b14', 5],
];
export const BEAT_OF = {}; SHOTS.forEach(([id, , , , , beat]) => { BEAT_OF[id] = beat; });
export const BEAT_SPAN = {};
BEAT_SPAN['b01'] = [0, 126];
BEAT_SPAN['b09'] = [126, 221];
BEAT_SPAN['b10'] = [221, 323];
BEAT_SPAN['b11'] = [323, 402];
BEAT_SPAN['b14'] = [402, 559];
const SHOTMAP = {}; SHOTS.forEach(([id, a, b, set, env, beat, sub]) => { SHOTMAP[id] = { id, a, b, set, env, beat, sub, len: b - a }; });
export const shotAt = (f) => {
  for (const [id, a, b] of SHOTS) if (f >= a && f < b) { const s = SHOTMAP[id]; return { ...s, u: clamp((f - a) / s.len) }; }
  const s = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...s, u: 1 };
};
export const beatU = (f) => { const s = shotAt(f), [a, b] = BEAT_SPAN[s.beat]; return clamp((f - a) / (b - a)); };
export const FLASH = {};

export const CAMS = {
  s01: [[-7.5, 6.5, 9.5], [-1, 0.8, -3], 58, 0, [-3.2, 2.8, 4.2], [-1.9, 1.65, -3.9], 52, 0],
  s02: [[-2.7, 3.7, 2.6], [-1.13, 1.92, -2.18], 54, 0, [-2.1, 3.2, 1.6], [-1.13, 1.92, -2.18], 50, 0],
  s03: [[-1.15, 2.05, 2.1], [-1.15, 1.35, -2.49], 50, 0, [-1.15, 1.95, 2], [-1.15, 1.35, -2.49], 50, 0],
  s04: [[-1.44, 2.1, 2.11], [-0.2, 1.6, -1.4], 48, 0, [-1.41, 2.08, 1.96], [-0.2, 1.6, -1.4], 47, 0],
  s05: [[-3.64, 3.8, 4.45], [-0.8, 1.2, -2.4], 56, 0, [-3.61, 3.78, 4.3], [-0.8, 1.2, -2.4], 55, 0],
  s33: [[0.15, 1.75, 0.85], [-0.2, 1.17, -1.95], 46, 0, [0.1, 1.7, 0.7], [-0.2, 1.17, -1.95], 45, 0],
  s34: [[0.6, 2.55, -0.6], [0.6, 2, -4.22], 48, 0, [0.6, 2.5, -0.85], [0.6, 2, -4.22], 47, 0],
  s34b: [[1.05, 2.5, -0.85], [0.6, 2, -4.22], 47, 0, [1.1, 2.48, -1], [0.6, 2, -4.22], 46, 0],
  s35: [[-3.33, 3.9, 4.65], [-0.5, 1.3, -2.2], 56, 0, [-3.3, 3.88, 4.5], [-0.5, 1.3, -2.2], 55, 0],
  s36: [[-0.94, 2.2, 1.51], [-0.2, 1.8, -1.4], 42, 0, [-0.91, 2.18, 1.36], [-0.2, 1.8, -1.4], 41, 0],
  s37: [[-0.5, 1.55, -0.75], [-0.9, 0.68, -2.52], 42, 0, [-0.55, 1.5, -0.9], [-0.9, 0.68, -2.52], 41, 0],
  s38: [[0.5, 1.95, 3], [0.5, 1.4, -1.6], 52, 0, [0.5, 1.9, 2.85], [0.5, 1.4, -1.6], 51, 0],
  s39: [[-3.13, 4, 4.03], [-0.8, 1.4, -2.4], 56, 0, [-3.1, 3.98, 3.88], [-0.8, 1.4, -2.4], 55, 0],
  s40: [[-2.22, 4.2, 3.5], [0, 1.6, -2.8], 56, 0, [-2.19, 4.18, 3.35], [0, 1.6, -2.8], 55, 0],
  s41: [[0.6, 1.65, 0.1], [0.6, 0.77, -2.6], 46, 0, [0.6, 1.6, -0.05], [0.6, 0.77, -2.6], 45, 0],
  s42: [[0.1, 3.15, 0.8], [0.6, 2.8, -2.2], 42, 0, [0.15, 3.1, 0.65], [0.6, 2.8, -2.2], 41, 0],
  s43: [[-0.14, 2.65, 2.5], [-0.14, 2.2, -1.9], 58, 0, [-0.14, 2.6, 2.35], [-0.14, 2.2, -1.9], 57, 0],
  s51: [[3.27, 2.6, 2.4], [0, 1.6, -2.4], 54, 0, [-3.73, 2.6, 2.4], [-0.5, 1.6, -2.4], 54, 0],
  s52: [[-3.1, 4, 4.09], [-0.5, 1.4, -2.6], 56, 0, [-3.07, 3.98, 3.94], [-0.5, 1.4, -2.6], 55, 0],
  s53: [[-1.15, 2.2, 2.06], [0, 1.6, -2], 50, 0, [-1.12, 2.18, 1.91], [0, 1.6, -2], 49, 0],
  s54: [[0.3, 2.6, 1], [0, 2.15, -3.72], 56, 0, [0.3, 2.55, 0.7], [0, 2.15, -3.72], 55, 0],
  s55: [[-1.1, 3.15, 1.4], [-0.6, 2.8, -1.6], 42, 0, [-1.05, 3.1, 1.25], [-0.6, 2.8, -1.6], 41, 0],
  s56: [[-1.5, 2.1, 3.6], [-0.5, 1.5, -2.2], 50, 0, [-1.5, 2.1, 3.6], [-0.5, 1.5, -2.2], 50, 0],
};
export const camFor = (shot, u) => {
  const c = CAMS[shot.id];
  const e = u * u * (3 - 2 * u);
  const L = (a, b) => a + (b - a) * e;
  const L3 = (a, b) => a.map((v, i) => L(v, b[i]));
  return { pos: L3(c[0], c[4]), look: L3(c[1], c[5]), fov: L(c[2], c[6]), roll: L(c[3], c[7]) };
};

// NO captions is sample me — captionAt hamesha khaali.
export const captionAt = () => '';
