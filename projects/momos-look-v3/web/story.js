// "Momos Wala" — WORLD V3 LOOK SAMPLE (3 shots, 165f @30fps, 5.5 s).
// Same 3 shots as FULL v4 QA — same ids, beats, subs, CAMS (verbatim from full story.js).
// ONLY the look changes (main.js V3). Timing: w1 = full s16 (60f), w2 = full s12 (45f),
// w3 = full s35 (60f). BEAT_SPAN re-anchored to the sample frames so beat-driven
// animation (galla counter, lid) plays inside the sample: b09 counter counts 0→₹90,000
// and HOLDs from f150 (= bu 0.75), matching v4 s35's HOLD state (compare sample f150+
// against v4 f958). Sets/env: all 'gali' / 'evening' (V3 evening light). NO captions.
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 165;

// ---------- shots: [id, a, b, set, env, beat, sub] ----------
export const SHOTS = [
  ['s16', 0, 60, 'gali', 'evening', 'b04', 3],    // w1 thela wide — full s16 (f405-429) CAMS verbatim
  ['s12', 60, 105, 'gali', 'evening', 'b03', 3],  // w2 clock close-up — full s12 (f303-329) CAMS verbatim
  ['s35', 105, 165, 'gali', 'evening', 'b09', 2], // w3 galla board — full s35 (f947-969) CAMS verbatim
];
export const BEAT_OF = {}; SHOTS.forEach(([id, , , , , beat]) => { BEAT_OF[id] = beat; });
export const BEAT_SPAN = {};
BEAT_SPAN['b04'] = [0, 60];
BEAT_SPAN['b03'] = [60, 105];
BEAT_SPAN['b09'] = [105, 165];
const SHOTMAP = {}; SHOTS.forEach(([id, a, b, set, env, beat, sub]) => { SHOTMAP[id] = { id, a, b, set, env, beat, sub, len: b - a }; });
export const shotAt = (f) => {
  for (const [id, a, b] of SHOTS) if (f >= a && f < b) { const s = SHOTMAP[id]; return { ...s, u: clamp((f - a) / s.len) }; }
  const s = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...s, u: 1 };
};
// Beat progress (poori beat par 0..1) — beat-spanning animations ke liye (counter, galla lid).
export const beatU = (f) => { const s = shotAt(f), [a, b] = BEAT_SPAN[s.beat]; return clamp((f - a) / (b - a)); };
export const FLASH = {};

// ---------- CAMS — verbatim from FULL v4 story.js (s16 / s12 / s35) ----------
export const CAMS = {
  s16: [[-1.0, 2.2, 4.0], [-0.6, 1.3, -2.8], 60, 0, [-0.95, 2.15, 3.85], [-0.6, 1.3, -2.8], 59, 0], // FIX 26 Nov LAYOUT LOCK (H): pehle camera z=0.85 — CHAI poster dayein kata + SONU MOMOS banner baayein kata ("OS", t14); medium shot me 1.7-chauda sign fit hi nahi hota — ab WIDE shot (z 4.0, fov 60): poora thela + sign + poster + Sonu ek frame me.
  s12: [[0.40, 3.10, -1.64], [0.55, 2.70, -3.9], 42, 0, [0.43, 3.08, -1.79], [0.55, 2.70, -3.9], 41, 0], // FIX 26 Nov FIX ROUND 5: ghadi (0.55,2.70) par gayi — look + camera uske peeche (purana look (-1.6,2.6) ab khaali deewaar dikhata). Wahi offset (pos = ghadi + (-0.15,+0.40,+2.58)); ghadi frame me 27% height, max|ndc| 0.54 (ray se verify). FIX ROUND 4: (-1.75,3.0) look (-1.6,2.6) tha.
  s35: [[-3.33, 3.9, 4.65], [-0.5, 1.3, -2.2], 56, 0, [-3.3, 3.88, 4.5], [-0.5, 1.3, -2.2], 55, 0],
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
