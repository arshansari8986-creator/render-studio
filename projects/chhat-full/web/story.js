// "Chhat Wala" — scene plan + proof stills (28 shots, 1323f @30fps, 44.09 s).
// Voice: Chhat_Voice_Final.wav (Bunty punchy + eleven_v4). NO captions.
// Sets: 'gali' (ek hi duniya — gali + ghar + chhat + tower; camera + env badalte hain).
// Envs: evening (hook/intro/gossip) | day (din bhar) | night (laal batti/b09-live/galla) |
//   powercut (bijli gayi — sab andhera, sirf laal batti + phone screens) | morning (subah/loop).
// Timing: final voice se map (raw Take 1 whisper segments → gap-compression + atempo 1.03).
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 1323;

// ---------- shots: [id, a, b, set, env, beat, sub] ----------
export const SHOTS = [
  ['s01', 0, 52, 'gali', 'evening', 'b01', 0],
  ['s02', 52, 103, 'gali', 'evening', 'b01', 1],
  ['s03', 103, 164, 'gali', 'evening', 'b01', 2],
  ['s04', 164, 200, 'gali', 'evening', 'b02', 0],
  ['s05', 200, 240, 'gali', 'evening', 'b02', 1],
  ['s06', 240, 286, 'gali', 'evening', 'b03', 0],
  ['s07', 286, 331, 'gali', 'evening', 'b03', 1],
  ['s08', 331, 385, 'gali', 'day', 'b04', 0],
  ['s09', 385, 431, 'gali', 'day', 'b04', 1],
  ['s10', 431, 474, 'gali', 'day', 'b04', 2],
  ['s11', 474, 523, 'gali', 'evening', 'b05', 0],
  ['s12', 523, 571, 'gali', 'evening', 'b05', 1],
  ['s13', 571, 607, 'gali', 'evening', 'b05', 2],
  ['s14', 607, 661, 'gali', 'night', 'b06', 0],
  ['s15', 661, 704, 'gali', 'night', 'b06', 1], // FIX 27 Nov: whisper L16 23.46s → s15 704 par khatm (was 716)
  ['s16', 704, 749, 'gali', 'powercut', 'b07', 0], // FIX 27 Nov: L16 23.46–24.98s = f704–749 (was 716–766)
  ['s17', 749, 795, 'gali', 'powercut', 'b07', 1], // FIX 27 Nov: L17 24.98–26.50s = f749–795 (was 766–811)
  ['s18', 795, 852, 'gali', 'powercut', 'b07', 2], // FIX 27 Nov: L18 26.50–28.38s = f795–852 (was 811–852)
  ['s19', 852, 901, 'gali', 'powercut', 'b08', 0],
  ['s20', 901, 938, 'gali', 'powercut', 'b08', 1],
  ['s21', 938, 988, 'gali', 'night', 'b09', 0],
  ['s22', 988, 1036, 'gali', 'night', 'b09', 1],
  ['s23', 1036, 1084, 'gali', 'night', 'b09', 2],
  ['s24', 1084, 1136, 'gali', 'night', 'b10', 0],
  ['s25', 1136, 1189, 'gali', 'night', 'b10', 1],
  ['s26', 1189, 1239, 'gali', 'morning', 'b11', 0],
  ['s27', 1239, 1286, 'gali', 'morning', 'b11', 1],
  ['s28', 1286, 1323, 'gali', 'morning', 'b11', 2],
];
export const BEAT_OF = {}; SHOTS.forEach(([id, , , , , beat]) => { BEAT_OF[id] = beat; });
export const BEAT_SPAN = {
  b01: [0, 164], b02: [164, 240], b03: [240, 331], b04: [331, 474], b05: [474, 607],
  b06: [607, 704], b07: [704, 852], b08: [852, 938], b09: [938, 1084], b10: [1084, 1189], b11: [1189, 1323], // FIX 27 Nov: b06/b07 whisper timings par
};
const SHOTMAP = {}; SHOTS.forEach(([id, a, b, set, env, beat, sub]) => { SHOTMAP[id] = { id, a, b, set, env, beat, sub, len: b - a }; });
export const shotAt = (f) => {
  for (const [id, a, b] of SHOTS) if (f >= a && f < b) { const s = SHOTMAP[id]; return { ...s, u: clamp((f - a) / s.len) }; }
  const s = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...s, u: 1 };
};
export const beatU = (f) => { const s = shotAt(f), [a, b] = BEAT_SPAN[s.beat]; return clamp((f - a) / (b - a)); };
export const FLASH = {};

// ---------- CAMS: [pos0, look0, fov0, roll0, pos1, look1, fov1, roll1] ----------
export const CAMS = {
  s01: [[5.8, 9.0, 9.5], [-0.5, 3.8, -5.0], 58, 0, [5.5, 8.7, 9.1], [-0.5, 3.8, -5.0], 57, 0],
  s02: [[1.8, 7.6, -1.2], [-0.5, 8.2, -6.2], 50, 0, [1.5, 7.5, -1.6], [-0.5, 8.3, -6.2], 48, 0],
  s03: [[4.2, 9.2, -0.8], [0.8, 7.0, -5.4], 55, 0, [4.0, 9.1, -1.2], [0.8, 7.0, -5.4], 54, 0], // FIX 27 Nov R3: door + uncha crane shot — poori charpai + leta Ramesh + tower ek frame me, parapet sirf patli patti
  s04: [[0.8, 8.8, -3.4], [-0.8, 9.6, -6.2], 42, 0, [0.7, 8.7, -3.7], [-0.8, 9.6, -6.2], 41, 0],
  s05: [[2.4, 2.0, 1.6], [1.3, 1.35, -0.8], 50, 0, [2.3, 1.95, 1.3], [1.3, 1.35, -0.8], 49, 0],
  s06: [[2.2, 7.4, -2.6], [0.2, 7.0, -5.2], 48, 0, [2.1, 7.35, -2.9], [0.2, 7.0, -5.2], 47, 0],
  s07: [[3.6, 8.2, 1.4], [0.3, 7.0, -5.8], 56, 0, [3.4, 8.1, 1.0], [0.3, 7.0, -5.8], 55, 0],
  s08: [[4.2, 9.2, -0.8], [0.8, 7.0, -5.4], 55, 0, [4.0, 9.1, -1.2], [0.8, 7.0, -5.4], 54, 0], // FIX 27 Nov R3: door + uncha crane shot — leta Ramesh (din) poora dikhe
  s09: [[1.4, 8.4, -2.6], [-0.5, 9.0, -6.2], 42, 0, [1.3, 8.3, -2.9], [-0.5, 9.0, -6.2], 41, 0],
  s10: [[4.6, 8.4, 1.8], [-0.2, 6.8, -5.6], 56, 0, [4.4, 8.3, 1.4], [-0.2, 6.8, -5.6], 55, 0],
  s11: [[4.0, 3.0, 9.0], [-1.0, 2.0, -4.0], 58, 0, [3.8, 2.9, 8.6], [-1.0, 2.0, -4.0], 57, 0], // LIVE: uncha mohalla wide — gossip + chhat par aurat + ghar/tower
  s12: [[1.5, 1.9, 4.4], [1.2, 1.6, 2.2], 46, 0, [1.45, 1.88, 4.1], [1.2, 1.6, 2.2], 45, 0],
  s13: [[2.6, 7.6, -3.0], [0.6, 7.2, -5.2], 50, 0, [2.5, 7.55, -3.3], [0.6, 7.2, -5.2], 49, 0], // ROOF MEDIUM — Ramesh shrug + grin, tower peeche
  s14: [[1.4, 10.4, -1.6], [-0.5, 9.7, -6.2], 46, 0, [1.35, 10.35, -1.9], [-0.5, 9.7, -6.2], 45, 0], // FIX 27 Nov: reframe — mast/panels zyada, khaali aasmaan kam + taare
  s15: [[4.8, 7.0, 3.0], [-0.5, 5.8, -5.5], 56, 0, [4.6, 6.9, 2.6], [-0.5, 5.8, -5.5], 55, 0],
  s16: [[2.2, 2.0, 3.2], [0.0, 1.6, -2.6], 50, 0, [2.1, 1.95, 2.9], [0.0, 1.6, -2.6], 49, 0],
  s17: [[5.5, 6.5, 7.5], [-0.5, 4.0, -5.0], 58, 0, [5.3, 6.4, 7.1], [-0.5, 4.0, -5.0], 57, 0],
  s18: [[1.6, 8.0, -1.8], [-0.5, 9.8, -6.2], 46, 0, [1.4, 7.9, -2.2], [-0.5, 9.8, -6.2], 45, 0],
  s19: [[1.8, 2.1, 3.8], [1.0, 1.5, -0.8], 47, 0, [1.2, 1.8, 2.6], [1.0, 1.5, -0.8], 46, 0], // FIX 27 Nov: shock par TEZ push-in (whip-pan ki jagah) — pos 3.8→2.6
  s20: [[2.6, 7.6, -3.0], [0.0, 6.9, -5.4], 50, 0, [2.5, 7.55, -3.3], [0.0, 6.9, -5.4], 49, 0],
  s21: [[0.8, 1.9, 0.2], [-1.8, 1.4, -3.5], 50, 0, [0.7, 1.85, -0.1], [-1.8, 1.4, -3.5], 49, 0], // LIVE b09: darwaze par company man + patla stack
  s22: [[0.6, 1.8, 0.4], [-1.6, 1.35, -3.1], 50, 0, [0.55, 1.78, 0.1], [-1.6, 1.35, -3.1], 49, 0], // FIX 27 Nov R2: camera peeche (z 0.4) + fov 50 — dono aadmi poore frame me, Ramesh kata nahi
  s23: [[1.5, 2.2, 1.0], [-1.8, 1.3, -3.5], 52, 0, [1.4, 2.15, 0.7], [-1.8, 1.3, -3.5], 51, 0], // LIVE b09: handshake wide
  s24: [[2.1, 1.9, -0.4], [1.1, 1.2, -3.3], 52, 0, [2.0, 1.85, -0.7], [1.1, 1.2, -3.3], 51, 0],
  s25: [[1.4, 1.9, 0.8], [1.3, 1.5, -3.6], 50, 0, [1.3, 1.85, 0.4], [1.3, 1.5, -3.6], 49, 0],
  s26: [[5.5, 6.0, 8.0], [-0.5, 4.5, -6.0], 56, 0, [5.3, 5.9, 7.6], [-0.5, 4.5, -6.0], 55, 0],
  s27: [[3.0, 2.0, 3.2], [3.5, 1.3, 0.5], 50, 0, [2.8, 1.95, 2.8], [0.68, 1.3, 0.5], 49, 0], // FIX5: PAN — look OFF1 ke saath (3.5→0.68), warna woh 2/3 shot frame se bahar tha
  s28: [[2.6, 7.6, -3.0], [0.4, 6.9, -5.4], 50, 0, [3.2, 8.1, -1.9], [0.5, 6.9, -5.4], 53, 0], // FIX 27 Nov R2: look Ramesh par (0.6, -5.2) — tower legs se alag; pull-back ending
};
export const camFor = (shot, u) => {
  const c = CAMS[shot.id];
  const e = u * u * (3 - 2 * u);
  const L = (a, b) => a + (b - a) * e;
  const L3 = (a, b) => a.map((v, i) => L(v, b[i]));
  return { pos: L3(c[0], c[4]), look: L3(c[1], c[5]), fov: L(c[2], c[6]), roll: L(c[3], c[7]) };
};

// NO captions is video me — captionAt hamesha khaali.
export const captionAt = () => '';
