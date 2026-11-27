// "Chhat Wala" — scene plan + proof stills (56 shots, 1323f @30fps, 44.09 s).
// v2 (27 Nov 2026): Sona-Chandi cutting — har shot ~0.8 s (28 → 56 shots, split at midpoint).
// Voice: Chhat_Voice_Final.wav (Bunty punchy + eleven_v4). NO captions. Duration/voice UNCHANGED.
// Sets: 'gali' (ek hi duniya — gali + ghar + chhat + tower; camera + env badalte hain).
// Envs: evening (hook/intro/gossip) | day (din bhar) | night (laal batti/b09-live/galla) |
//   powercut (bijli gayi — sab andhera, sirf laal batti + phone screens) | morning (subah/loop).
// Timing: final voice se map (raw Take 1 whisper segments → gap-compression + atempo 1.03).
// Checklist v2: har 'b' half ek alag angle (cut = naya angle); ~50% 'b' shots FULLY STATIC (point 11);
// push-in sirf number/chehre par (12); NO low angle / NO orbit / NO Dutch (14); pehla still = aakhri still (37).
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 1323;

// ---------- shots: [id, a, b, set, env, beat, sub] ----------
// 'a' = pehla half (purana camera, fixes ke saath), 'b' = dusra half (naya angle).
export const SHOTS = [
  ['s01a', 0, 26, 'gali', 'evening', 'b01', 0],
  ['s01b', 26, 52, 'gali', 'evening', 'b01', 0],
  ['s02a', 52, 77, 'gali', 'evening', 'b01', 1],
  ['s02b', 77, 103, 'gali', 'evening', 'b01', 1],
  ['s03a', 103, 133, 'gali', 'evening', 'b01', 2],
  ['s03b', 133, 164, 'gali', 'evening', 'b01', 2],
  ['s04a', 164, 182, 'gali', 'evening', 'b02', 0],
  ['s04b', 182, 200, 'gali', 'evening', 'b02', 0],
  ['s05a', 200, 220, 'gali', 'evening', 'b02', 1],
  ['s05b', 220, 240, 'gali', 'evening', 'b02', 1],
  ['s06a', 240, 263, 'gali', 'evening', 'b03', 0],
  ['s06b', 263, 286, 'gali', 'evening', 'b03', 0],
  ['s07a', 286, 308, 'gali', 'evening', 'b03', 1],
  ['s07b', 308, 331, 'gali', 'evening', 'b03', 1],
  ['s08a', 331, 358, 'gali', 'day', 'b04', 0],
  ['s08b', 358, 385, 'gali', 'day', 'b04', 0],
  ['s09a', 385, 408, 'gali', 'day', 'b04', 1],
  ['s09b', 408, 431, 'gali', 'day', 'b04', 1],
  ['s10a', 431, 452, 'gali', 'day', 'b04', 2],
  ['s10b', 452, 474, 'gali', 'day', 'b04', 2],
  ['s11a', 474, 498, 'gali', 'evening', 'b05', 0],
  ['s11b', 498, 523, 'gali', 'evening', 'b05', 0],
  ['s12a', 523, 547, 'gali', 'evening', 'b05', 1],
  ['s12b', 547, 571, 'gali', 'evening', 'b05', 1],
  ['s13a', 571, 589, 'gali', 'evening', 'b05', 2],
  ['s13b', 589, 607, 'gali', 'evening', 'b05', 2],
  ['s14a', 607, 634, 'gali', 'night', 'b06', 0],
  ['s14b', 634, 661, 'gali', 'night', 'b06', 0],
  ['s15a', 661, 682, 'gali', 'night', 'b06', 1],
  ['s15b', 682, 704, 'gali', 'night', 'b06', 1],
  ['s16a', 704, 726, 'gali', 'powercut', 'b07', 0],
  ['s16b', 726, 749, 'gali', 'powercut', 'b07', 0],
  ['s17a', 749, 772, 'gali', 'powercut', 'b07', 1],
  ['s17b', 772, 795, 'gali', 'powercut', 'b07', 1],
  ['s18a', 795, 823, 'gali', 'powercut', 'b07', 2],
  ['s18b', 823, 852, 'gali', 'powercut', 'b07', 2],
  ['s19a', 852, 876, 'gali', 'powercut', 'b08', 0],
  ['s19b', 876, 901, 'gali', 'powercut', 'b08', 0],
  ['s20a', 901, 919, 'gali', 'powercut', 'b08', 1],
  ['s20b', 919, 938, 'gali', 'powercut', 'b08', 1],
  ['s21a', 938, 963, 'gali', 'night', 'b09', 0],
  ['s21b', 963, 988, 'gali', 'night', 'b09', 0],
  ['s22a', 988, 1012, 'gali', 'night', 'b09', 1],
  ['s22b', 1012, 1036, 'gali', 'night', 'b09', 1],
  ['s23a', 1036, 1060, 'gali', 'night', 'b09', 2],
  ['s23b', 1060, 1084, 'gali', 'night', 'b09', 2],
  ['s24a', 1084, 1110, 'gali', 'night', 'b10', 0],
  ['s24b', 1110, 1136, 'gali', 'night', 'b10', 0],
  ['s25a', 1136, 1162, 'gali', 'night', 'b10', 1],
  ['s25b', 1162, 1189, 'gali', 'night', 'b10', 1],
  ['s26a', 1189, 1214, 'gali', 'morning', 'b11', 0],
  ['s26b', 1214, 1239, 'gali', 'morning', 'b11', 0],
  ['s27a', 1239, 1262, 'gali', 'morning', 'b11', 1],
  ['s27b', 1262, 1286, 'gali', 'morning', 'b11', 1],
  ['s28a', 1286, 1304, 'gali', 'morning', 'b11', 2],
  ['s28b', 1304, 1323, 'gali', 'morning', 'b11', 2],
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
// STATIC = pos0==pos1, look0==look1, fov0==fov1 (freeze-frame feel, point 11).
export const CAMS = {
  s01a: [[5.8, 9.0, 9.5], [-0.5, 3.8, -5.0], 58, 0, [5.8, 9.0, 9.5], [-0.5, 3.8, -5.0], 58, 0],
  s01b: [[2.8, 8.8, -1.0], [-0.5, 8.9, -6.2], 44, 0, [2.67, 8.8, -1.21], [-0.5, 8.9, -6.2], 41, 0], // FIX v6: halka push-in (tower) // FIX v5: look neeche + fov tight — khaali aasmaan kam (Gullak standard) // tower medium, roof height — scale shift
  s02a: [[1.8, 7.6, -1.2], [-0.5, 8.2, -6.2], 50, 0, [1.8, 7.6, -1.2], [-0.5, 8.2, -6.2], 50, 0],
  s02b: [[1.2, 8.8, -2.6], [-0.9, 9.3, -6.2], 46, 0, [1.2, 8.8, -2.6], [-0.9, 9.3, -6.2], 46, 0], // FIX v3: dish poori frame me (v2 me left edge kata)
  s03a: [[4.6, 11.0, 0.6], [1.0, 6.2, -5.0], 50, 0, [4.6, 11.0, 0.6], [1.0, 6.2, -5.0], 50, 0], // FIX v2: uncha crane — charpai + leta Ramesh poora, parapet sirf patli patti
  s03b: [[1.6, 8.4, -2.6], [0.95, 6.25, -5.0], 36, 0, [1.6, 8.4, -2.6], [0.95, 6.25, -5.0], 36, 0], // FIX v3b: tighter + takiya hata — chehra bada, parapet sirf kinare par (v3 me takiya phir bhi munh dhak raha tha)
  s04a: [[1.6, 8.6, -2.2], [-1.0, 9.4, -6.2], 48, 0, [1.6, 8.6, -2.2], [-1.0, 9.4, -6.2], 48, 0], // FIX v3: peeche + chauda — dish poori + blank box kam (v2 me dish kata)
  s04b: [[-2.6, 9.4, -3.0], [-0.5, 9.8, -6.2], 40, 0, [-2.52, 9.42, -3.13], [-0.5, 9.8, -6.2], 38, 0], // FIX v6b: push-in 3°→2° — dish left rim end-frame par na kate // FIX v6: halka push-in (dish) // dish dusri taraf se
  s05a: [[2.4, 2.0, 1.6], [1.3, 1.35, -0.8], 50, 0, [2.4, 2.0, 1.6], [1.3, 1.35, -0.8], 50, 0],
  s05b: [[2.0, 1.5, 0.2], [1.45, 1.15, -0.85], 38, 0, [2.0, 1.5, 0.2], [1.45, 1.15, -0.85], 38, 0], // STATIC phone ECU — 4G FULL
  s06a: [[2.2, 7.4, -2.6], [0.2, 7.0, -5.2], 48, 0, [2.12, 7.38, -2.7], [0.2, 7.0, -5.2], 45, 0], // FIX v6: halka push-in (face)
  s06b: [[-1.6, 7.2, -3.4], [0.2, 7.0, -5.2], 46, 0, [-1.6, 7.2, -3.4], [0.2, 7.0, -5.2], 46, 0], // dusri taraf se
  s07a: [[3.6, 8.2, 1.4], [0.3, 7.0, -5.8], 56, 0, [3.6, 8.2, 1.4], [0.3, 7.0, -5.8], 56, 0],
  s07b: [[-2.0, 7.4, -3.2], [0.2, 7.0, -5.2], 46, 0, [-2.0, 7.4, -3.2], [0.2, 7.0, -5.2], 46, 0], // STATIC roof-level side medium
  s08a: [[3.8, 9.0, -2.0], [1.0, 6.2, -5.2], 46, 0, [3.8, 9.0, -2.0], [1.0, 6.2, -5.2], 46, 0], // FIX v3: STATIC right-high top-down — poora shareer + chehra, parapet foreground band nahi (v2 me parapet 55% frame)
  s08b: [[-2.2, 10.4, -1.6], [1.0, 6.2, -5.0], 50, 0, [-2.07, 10.23, -1.74], [1.0, 6.2, -5.0], 47, 0], // FIX v6: halka push-in (face) // bayein se crane
  s09a: [[1.4, 8.4, -2.6], [-0.5, 9.0, -6.2], 42, 0, [1.4, 8.4, -2.6], [-0.5, 9.0, -6.2], 42, 0],
  s09b: [[1.4, 8.8, -2.4], [-0.9, 9.4, -6.2], 46, 0, [1.4, 8.8, -2.4], [-0.9, 9.4, -6.2], 46, 0], // FIX v4: peeche + bayein — dish poori frame me (v3 me dish bottom-left par kata, box bada blank) // FIX v3: look neeche — dish + tower structure frame me, khaali aasmaan kam (v2 me top 60% khaali)
  s10a: [[5.6, 10.8, 3.2], [0.3, 6.2, -5.4], 54, 0, [5.6, 10.8, 3.2], [0.3, 6.2, -5.4], 54, 0], // FIX v4: fov 58→54 + look Ramesh ki taraf — sote Ramesh ka chehra saaf (parent note) // FIX v3: peeche + chauda — tower top (laal batti) + board dono frame me (v2 me dono kate)
  s10b: [[-1.2, 8.2, -3.2], [0.95, 6.25, -5.0], 36, 0, [-1.11, 8.12, -3.27], [0.95, 6.25, -5.0], 33, 0], // FIX v6: halka push-in (face ECU) // FIX v3b: tighter left-high + takiya hata — face ECU, chehra poora
  s11a: [[4.0, 3.0, 9.0], [-1.0, 2.0, -4.0], 58, 0, [4.0, 3.0, 9.0], [-1.0, 2.0, -4.0], 58, 0], // LIVE: uncha mohalla wide — gossip + chhat par aurat + ghar/tower
  s11b: [[-2.5, 2.2, 5.5], [1.2, 1.3, 0.5], 52, 0, [-2.5, 2.2, 5.5], [1.2, 1.3, 0.5], 52, 0], // FIX v3: look group par — hasne wale teeno + peeche board/ghar (v2 me group 35° off-axis, frame me koi nahi tha)
  s12a: [[1.5, 1.9, 4.4], [1.2, 1.6, 2.2], 46, 0, [1.5, 1.9, 4.4], [1.2, 1.6, 2.2], 46, 0],
  s12b: [[2.2, 1.7, 3.4], [1.4, 1.5, 2.2], 40, 0, [2.17, 1.69, 3.35], [1.4, 1.5, 2.2], 37, 0], // FIX v6: halka push-in (face ECU) // STATIC aunty hasi close-up
  s13a: [[2.6, 7.6, -3.0], [0.6, 7.2, -5.2], 50, 0, [2.6, 7.6, -3.0], [0.6, 7.2, -5.2], 50, 0], // ROOF MEDIUM — Ramesh shrug + grin, tower peeche
  s13b: [[-1.8, 7.0, -3.6], [0.4, 7.1, -5.2], 44, 0, [-1.71, 7.0, -3.66], [0.4, 7.1, -5.2], 41, 0], // FIX v6: halka push-in (face) // saamne-bayein, tank foreground
  s14a: [[1.4, 10.4, -1.6], [-1.2, 9.3, -6.2], 46, 0, [1.4, 10.4, -1.6], [-1.2, 9.3, -6.2], 46, 0], // FIX v5: look bayein/neeche — chaand frame me, khaali raat-aasmaan kam (Gullak standard) // FIX 27 Nov: reframe — mast/panels zyada, khaali aasmaan kam + taare
  s14b: [[3.8, 7.8, -1.2], [0.5, 7.55, -5.5], 56, 0, [3.67, 7.78, -1.37], [0.5, 7.55, -5.5], 54, 0], // FIX v6b: look upar + push-in 2° — laal bulb end-frame par na kate // FIX v6: halka push-in (light-cone face) // STATIC LIGHT-CONE — raat me akele sota Ramesh, sirf laal batti
  s15a: [[5.0, 7.0, 3.4], [0.0, 5.7, -5.3], 62, 0, [4.9, 6.9, 3.2], [0.0, 5.7, -5.3], 60, 0], // FIX v2: board reframe + tower top (laal batti) frame me — fov 62, look y 5.7
  s15b: [[3.4, 1.6, 2.2], [0.8, 2.2, -4.2], 56, 0, [3.3, 1.62, 1.94], [0.8, 2.2, -4.2], 53, 0], // FIX v6: halka push-in (board) // street night wide — board + galla + darwaza
  s16a: [[2.2, 2.0, 3.2], [0.0, 1.6, -2.6], 50, 0, [2.2, 2.0, 3.2], [0.0, 1.6, -2.6], 50, 0],
  s16b: [[1.7, 1.6, 1.2], [0.45, 1.25, -0.65], 44, 0, [1.65, 1.59, 1.13], [0.45, 1.25, -0.65], 41, 0], // FIX v6: halka push-in (face ECU) // FIX v3: peeche + chauda, look chehre par — chehra poora + band phone saath (v2 me chehra left edge kata)
  s17a: [[5.5, 6.5, 7.5], [-0.5, 4.0, -5.0], 58, 0, [5.5, 6.5, 7.5], [-0.5, 4.0, -5.0], 58, 0],
  s17b: [[3.6, 3.4, 4.6], [0.5, 2.6, -4.2], 52, 0, [3.6, 3.4, 4.6], [0.5, 2.6, -4.2], 52, 0], // ghar ke saamne, andhere me board + galla
  s18a: [[1.6, 8.0, -1.8], [-0.5, 9.8, -6.2], 46, 0, [1.6, 8.0, -1.8], [-0.5, 9.8, -6.2], 46, 0],
  s18b: [[1.1, 8.9, -2.7], [-0.9, 9.5, -6.2], 45, 0, [1.1, 8.9, -2.7], [-0.9, 9.5, -6.2], 45, 0], // FIX v4: peeche + bayein — dish poori frame me (v3 me dish bottom-left par kata, box bada blank) // FIX v3: look neeche — dish + tower structure frame me, khaali raat-aasmaan kam (v2 me top 70% khaali)
  s19a: [[1.8, 2.1, 3.8], [1.0, 1.5, -0.8], 47, 0, [1.77, 2.08, 3.62], [1.0, 1.5, -0.8], 44, 0], // FIX v6: halka push-in (shock faces) // FIX 27 Nov: shock par TEZ push-in (whip-pan ki jagah) — pos 3.8→2.6
  s19b: [[2.2, 2.0, 4.2], [1.1, 1.45, -0.8], 52, 0, [2.0, 1.95, 3.8], [1.1, 1.45, -0.8], 50, 0], // FIX v4: chauda + look dayein/upar — board poora frame me (v3 me board right edge par kata '₹30,00') // FIX v3: peeche + chauda — teeno shock chehre margin ke saath poore (v2 me side chehre kinare kate)
  s20a: [[2.6, 7.6, -3.0], [0.0, 6.9, -5.4], 50, 0, [2.6, 7.6, -3.0], [0.0, 6.9, -5.4], 50, 0],
  s20b: [[3.2, 7.8, -2.2], [0.2, 7.0, -5.4], 46, 0, [3.08, 7.77, -2.33], [0.2, 7.0, -5.4], 43, 0], // FIX v6: halka push-in (face) // STATIC roof medium — Ramesh wonder
  s21a: [[0.8, 1.9, 0.2], [-1.8, 1.4, -3.5], 50, 0, [0.8, 1.9, 0.2], [-1.8, 1.4, -3.5], 50, 0], // LIVE b09: darwaze par company man + patla stack
  s21b: [[-0.4, 1.5, -1.6], [-1.1, 1.0, -3.1], 40, 0, [-0.35, 1.48, -1.8], [-1.1, 1.0, -3.1], 39, 0], // patla stack ECU (3 note)
  s22a: [[0.6, 1.8, 0.4], [-1.6, 1.35, -3.1], 50, 0, [0.6, 1.8, 0.4], [-1.6, 1.35, -3.1], 50, 0], // FIX 27 Nov R2: camera peeche (z 0.4) + fov 50 — dono aadmi poore frame me, Ramesh kata nahi
  s22b: [[-0.5, 1.6, -1.4], [-1.2, 1.1, -3.1], 38, 0, [-0.53, 1.58, -1.47], [-1.2, 1.1, -3.1], 35, 0], // FIX v6: halka push-in (stack ECU) // STATIC mota stack ECU (10 note) + Ramesh smile
  s23a: [[1.5, 2.2, 1.0], [-1.8, 1.3, -3.5], 52, 0, [1.5, 2.2, 1.0], [-1.8, 1.3, -3.5], 52, 0], // LIVE b09: handshake wide
  s23b: [[0.2, 1.6, -1.2], [-1.55, 1.1, -3.1], 42, 0, [0.2, 1.6, -1.2], [-1.55, 1.1, -3.1], 42, 0], // handshake close-up
  s24a: [[2.1, 1.9, 0.8], [1.3, 1.45, -3.5], 58, 0, [2.07, 1.88, 0.63], [1.3, 1.45, -3.5], 55, 0], // FIX v6c: look UPAR (1.2→1.45) — v6b me direction ulta tha, look neeche se ghadi aur upar gayi // FIX v6: halka push-in (board) // FIX v3: peeche + chauda — board poora frame me (v2 me board right edge kata)
  s24b: [[2.3, 1.9, -1.5], [1.6, 1.0, -3.2], 40, 0, [2.3, 1.9, -1.5], [1.6, 1.0, -3.2], 40, 0], // FIX v5b: camera upar — dhakkan foreshortened, cash hero // STATIC galla ECU — dhakkan khulta hai
  s25a: [[1.4, 1.9, 0.8], [1.3, 1.5, -3.6], 50, 0, [1.4, 1.88, 0.62], [1.3, 1.5, -3.6], 47, 0], // FIX v6: halka push-in (board)
  s25b: [[2.6, 2.2, -2.2], [1.85, 2.3, -4.24], 42, 0, [2.55, 2.18, -2.4], [1.85, 2.3, -4.24], 41, 0], // board ECU — ₹30,000 poora frame
  s26a: [[5.5, 6.0, 8.0], [-0.5, 4.5, -6.0], 56, 0, [5.5, 6.0, 8.0], [-0.5, 4.5, -6.0], 56, 0],
  s26b: [[-4.5, 2.4, 6.0], [0.5, 2.0, -4.0], 54, 0, [-4.5, 2.4, 6.0], [0.5, 2.0, -4.0], 54, 0], // STATIC subah street wide, dusri taraf se
  s27a: [[3.0, 2.0, 3.2], [3.5, 1.3, 0.5], 50, 0, [2.9, 1.98, 3.0], [2.12, 1.3, 0.5], 49, 0], // FIX5: PAN — look OFF1 ke saath (3.5→2.12), warna woh 2/3 shot frame se bahar tha
  s27b: [[2.9, 1.98, 3.0], [2.12, 1.3, 0.5], 49, 0, [2.8, 1.95, 2.8], [0.68, 1.3, 0.5], 49, 0], // PAN jaari — office man chalta hua
  s28a: [[2.6, 7.6, -3.0], [0.5, 6.9, -5.2], 50, 0, [1.7, 7.1, -4.1], [0.6, 6.8, -5.2], 44, 0], // v2 ZERO-KAMI p16: pull-back hata — PUSH-IN close-up sabse badi smile + uthe haath par; parapet neeche foreground band banta hai, sightline uske upar se (7.0 > 6.47)
  s28b: [[5.8, 9.0, 9.5], [-0.5, 3.8, -5.0], 58, 0, [5.8, 9.0, 9.5], [-0.5, 3.8, -5.0], 58, 0], // STATIC FREEZE — s01a wala wide (loop rhyme), Ramesh ab khada muskurata hua
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
