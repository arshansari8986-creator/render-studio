// "WORLD V2 SAMPLE" — Press ke 3 shots NAYE look me (7.39 s, 222 frames @30fps).
// Shot boundaries words_final.json se (whisper word timings, ±0.1 s):
//   w01 0-83    (orig s01: "Is press wale ne ek mahine me do lakh kamaye." 0.00-2.76)
//   w02 83-156  (orig s14+s15: "Tab ek suit aata hai — shaadi ka suit, ₹350." 21.68-24.10;
//                24.56 tak ka 0.60 s pause tail NAHI — max-gap ≤0.4 s spec)
//   w03 156-222 (orig s22: "Press ₹10 ki thi, ghar suit se chalta hai." 38.32-40.53;
//                38.00 se start NAHI — 38.02-38.20 "ka hai," pichli line ka tail hai)
// CAMERAS: w01 = full s01 EXACT, w03 = full s22 EXACT (side-by-side compare ke liye);
//   w02 = full s14 cam (walk-in, u<0.35) → full s15 cam (reveal, u≥0.35), dono EXACT.
// NO captions — captionAt hamesha khaali. NO phoneme lip-sync — munh sirf beat par
// (main.js me mouthFor(); ENV reference ke liye hai).
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 222;

// ---------- shots: [id, a, b, set, env] ----------
// set: 'gali' (ek hi duniya — press dukaan wali gali, V2 look)
// env: sunwarm (hook — garam dhoop + lambi chhaon) | evening (suit — narangi + lamp)
//      sunset (ending — gehra narangi horizon + lamp glow)
export const SHOTS = [
  ['w01', 0, 83, 'gali', 'sunwarm'],    // HOOK: aerial wide → tez push-in, board "₹2,00,000" bada, Raju bagal me
  ['w02', 83, 156, 'gali', 'evening'],  // SUIT REVEAL: graahak suit latkaye aata hai → glow + "₹350" tag, Raju smile
  ['w03', 156, 222, 'gali', 'sunset'],  // ENDING: travelling → push-in, Raju suit uthata hai → FREEZE sabse badi smile. Loop, koi CTA nahi.
];
const SHOTMAP = {}; SHOTS.forEach(([id, a, b, set, env]) => { SHOTMAP[id] = { id, a, b, set, env, len: b - a }; });
export const shotAt = (f) => {
  for (const [id, a, b] of SHOTS) if (f >= a && f < b) { const s = SHOTMAP[id]; return { ...s, u: clamp((f - a) / s.len) }; }
  const s = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...s, u: 1 };
};
export const FLASH = {};

// CAMS: [posStart, lookStart, fovStart, rollStart, posEnd, lookEnd, fovEnd, rollEnd]
// w01 = full s01, w03 = full s22 (EXACT copy — compare ke liye framing same).
// w02: do cameras — [s14 start, s14 end] phir [s15 start, s15 end] (full se EXACT).
export const CAMS = {
  w01: [[-7.5, 6.5, 9.5], [-1.0, 0.8, -3.0], 58, 0, [-3.2, 2.8, 4.2], [-1.9, 1.65, -3.9], 52, 0],
  w02a: [[-1.0, 1.9, 2.6], [-1.1, 1.5, -3.0], 50, 0, [-1.0, 1.88, 2.5], [-1.0, 1.5, -3.0], 48, 0],
  w02b: [[-0.6, 1.8, 1.4], [-0.5, 1.5, -2.2], 48, 0, [-0.6, 1.78, 1.1], [-0.3, 1.5, -2.2], 46, 0],
  w03: [[4.5, 2.2, 3.0], [-1.0, 1.4, -1.8], 56, 0, [-1.7, 2.1, 4.0], [-1.6, 1.65, -1.9], 56, 0],
};
export const camFor = (shot, u) => {
  // w02: u<0.35 walk-in (s14 cam), u≥0.35 reveal (s15 cam) — beech me hard cut jaisa switch nahi,
  // dono cameras ke beech smooth blend nahi chahiye (Gullak: cut hi camera move) — isliye phase boundary par
  // camera ek frame me badalta hai, bilkul full video ke s14→s15 cut jaisa.
  let c, e;
  if (shot.id === 'w02') {
    if (u < 0.35) { c = CAMS.w02a; e = u / 0.35; } else { c = CAMS.w02b; e = (u - 0.35) / 0.65; }
  } else {
    c = CAMS[shot.id]; e = u * u * (3 - 2 * u);
  }
  const L = (a, b) => a + (b - a) * e;
  const L3 = (a, b) => a.map((v, i) => L(v, b[i]));
  return { pos: L3(c[0], c[4]), look: L3(c[1], c[5]), fov: L(c[2], c[6]), roll: L(c[3], c[7]) };
};

export const captionAt = () => '';
