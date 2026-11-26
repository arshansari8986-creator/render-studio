// "Press Wala" — SAMPLE (8.62s, 259 frames @30fps). Pehle ~8.62 s, 5 shots.
// Voice FINAL (40.53s) — sample sirf pehle 8.62 s.
// Shot boundaries words_final.json se (whisper word timings, ±0.1s):
//   s01 0-83  ("Is press wale ne ek mahine me do lakh kamaye." 0.00-2.76)
//   s02 83-123 ("Lekin press karke nahi." 2.76-4.10)
//   s03 123-179 ("Ye Raju hai — mohalle ki press dukaan." 4.10-5.98)
//   s04 179-223 ("Kapdon ka dher, bhaap, har kapde par ₹10." 5.98-7.44)
//   s05 223-259 (wahi line, tail — ₹10 tag ECU 7.44-8.62)
// WITHHELD: notebook ka raaz is sample me NAHI khulta (shot 20, full video me).
// NUMBERS-AS-OBJECTS: s01 board "₹2,00,000" frame 1 se dikhta hai, push-in par bada;
//   s03 board "RAJU PRESS"; s05 kapde par bandha LAAL tag "₹10".
// NO captions — captionAt hamesha khaali. NO phoneme lip-sync — munh sirf beat par
// (main.js me mouthFor(); ENV is build me munh ke liye use NAHI hota).
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 259;

// ---------- shots: [id, a, b, set, env] ----------
// set: 'gali' (press dukaan wali gali — dukaan bahar, sadak, taar, ped)
//      'dukaan' (press dukaan interior — counter, kapdon ka dher, bhaap)
// env: morning (subah ki roshni — natural, muted; dhul-mitti, halka neela aasmaan)
export const SHOTS = [
  ['s01', 0, 83, 'gali', 'morning'],    // HOOK (2.76s): HIGH-ANGLE aerial gali wide → tez push-in press dukaan par → board "₹2,00,000" bada. Raju dukaan ke bahar khada, halki smile
  ['s02', 83, 123, 'gali', 'morning'],  // Raju CLOSE-UP static, sly smile, aankhein aadhi (squint), sar halka tilt; kaan peeche PEELI PENCIL pehli baar saaf
  ['s03', 123, 179, 'gali', 'morning'], // Raju intro MEDIUM, eye-level, halka push-in. Board "RAJU PRESS", peeche kapdon ki kataar; gale me NAAPNE WALA TAPE; haath me press, press uthata hai
  ['s04', 179, 223, 'dukaan', 'morning'], // Process CLOSE-UP static — kapdon ka dher + BHAAP uthti hui; Raju press chala raha hai (haath upar-neeche, kabhi khaali nahi)
  ['s05', 223, 259, 'dukaan', 'morning'], // ₹10 TAG EXTREME CLOSE-UP static — kapde par bandha LAAL tag "₹10" bada; peeche bhaap halki
];
const SHOTMAP = {}; SHOTS.forEach(([id, a, b, set, env]) => { SHOTMAP[id] = { id, a, b, set, env, len: b - a }; });
export const shotAt = (f) => {
  for (const [id, a, b] of SHOTS) if (f >= a && f < b) { const s = SHOTMAP[id]; return { ...s, u: clamp((f - a) / s.len) }; }
  const s = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...s, u: 1 };
};
// FLASH: is sample me white-flash device nahi chahiye.
export const FLASH = {};

// ---------- set layout (centre ~ (0,0,-3)) ----------
// gali: sadak z=1.8 (x -8..8); press dukaan building x=-1.5 (deewaar z=-4.3, 6.5 chaudi, 3.2 unchi),
//   "RAJU PRESS" sign (-1.5, 2.95), "₹2,00,000" board (-2.6, 1.9, -4.22), kapdon ki kataar (rasse par, z=-3.5, y~2.2),
//   darwaza (-1.2), khidki (0.3); padosi makaan mid-row z=-7; skyline z=-19; ped (-6.2,-3.6) & (6.4,-3.4); khambe + taar;
//   Raju dukaan ke bahar (-1.5, 0, -1.6); aangan me kapdon ki tokri (2.4, -0.8) + ghada foreground.
// dukaan: counter (0.3, -2.6), kapdon ka dher counter par, press loha (0.3, -2.6), latakta bulb,
//   bada "RAJU PRESS" board deewaar par (1.25, 1.8, -3.72), deewaar z=-3.8 (neechi — upar aasmaan + skyline dikhe),
//   peeche kapdon ki kataar deewaar par; Raju counter ke peeche (-0.35, 0, -3.0).
export const CAMS = {
  // s01 HOOK: high-angle aerial wide → tez push-in dukaan par; board + Raju dono end par frame ke andar
  s01: [[-7.5, 6.5, 9.5], [-1.0, 0.8, -3.0], 58, 0, [-3.0, 2.7, 3.6], [-1.9, 1.7, -3.9], 48, 0],
  // s02 CLOSE-UP: Raju s 2.1 — camera door (dist ~7.5) taaki chehra frame ka ~65% le, margin ke saath; pencil dikhe
  s02: [[-1.35, 2.25, 5.9], [-1.5, 2.1, -1.6], 42, 0, [-1.35, 2.22, 5.5], [-1.5, 2.1, -1.6], 40, 0],
  // s03 INTRO MEDIUM: Raju left-centre, "RAJU PRESS" board upar + kapdon ki kataar peeche — sab frame ke andar
  s03: [[-1.15, 1.9, 2.6], [-1.15, 1.5, -3.6], 55, 0, [-1.1, 1.85, 2.1], [-1.15, 1.5, -3.6], 53, 0],
  // s04 PROCESS CLOSE-UP: dher + bhaap + Raju counter ke peeche — static, halka push-in
  s04: [[0.3, 1.9, 0.9], [0.0, 1.3, -2.8], 44, 0, [0.28, 1.88, 0.7], [0.0, 1.3, -2.8], 42, 0],
  // s05 TAG ECU: laal "₹10" tag frame bhar, peeche bhaap — static, halka push-in
  s05: [[0.3, 1.6, 0.2], [0.3, 1.35, -2.5], 40, 0, [0.3, 1.58, 0.0], [0.3, 1.35, -2.5], 38, 0],
};
export const camFor = (shot, u) => {
  const c = CAMS[shot.id];
  const e = u * u * (3 - 2 * u); // smoothstep within the shot
  const L = (a, b) => a + (b - a) * e;
  const L3 = (a, b) => a.map((v, i) => L(v, b[i]));
  return { pos: L3(c[0], c[4]), look: L3(c[1], c[5]), fov: L(c[2], c[6]), roll: L(c[3], c[7]) };
};

// NO captions is sample me — captionAt hamesha khaali.
export const captionAt = () => '';
