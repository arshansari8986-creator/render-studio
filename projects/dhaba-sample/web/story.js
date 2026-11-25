// "Dhaba Wala" — SAMPLE (10.2s, 306 frames @30fps). Pehle ~10.2 s, 7 shots.
// Voice FINAL v3 firstfast (46.58s) — sample sirf pehle 10.2 s.
// Shot boundaries words_v3_head.json se word boundary par refine (parent-verified):
//   s01 0-76 | s02 76-122 ("baarah guna" 90-114f andar) | s03 122-184 ("kam kar diya" 184f par khatam)
//   s04 184-219 ("Highway kinare dhaba" 184-219) | s05 219-258 ("thaali sau rupay ki" 219-258)
//   s06 258-296 ("Paas wala hotel malik" 258-296) | s07 296-306 ("hansa" 296-310, sample 306 par khatam — mid-word acceptable)
// WITHHELD: menu jalaana + 12-guna ka raaz abhi NAHI khulta — sirf "12 GUNA" board frame 1 se.
// NUMBERS-AS-OBJECTS: s01 dhaba deewaar "12 GUNA" frame 1 se; s03 menu board "52 CHEEZEIN";
//   s05 thaali par "₹100" tag pop; s06 HOTEL sign sadak ke paar.
// NO captions — captionAt hamesha khaali.
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 306;

// ---------- shots: [id, a, b, set, env] ----------
// set: 'highway' (chaudi highway + dhaba building + paar HOTEL) | 'dhaba' (counter/thali area)
// env: morning (subah ki roshni — natural, muted)
export const SHOTS = [
  ['s01', 0, 76, 'highway', 'morning'],   // ANCHOR (2.53s): low-angle tracking sadak ke saath → dhaba push-in; truck guzarta, Bhanu khada, deewaar par "12 GUNA" frame 1 se
  ['s02', 76, 122, 'highway', 'morning'], // Bhanu CLOSE-UP (s ~2.1), grin, lip-sync ON, haath me thaali, garv — "baarah guna" 90-114f isi shot me
  ['s03', 122, 184, 'dhaba', 'morning'],  // Bhanu + bada MENU BOARD "52 CHEEZEIN", board ki taraf ishaara — "kam kar diya" 184f par khatam
  ['s04', 184, 219, 'highway', 'morning'],// Highway ESTABLISH wide — truck guzarta, dhool, "BHANU DHABA" sign, peeche skyline/ped/taar
  ['s05', 219, 258, 'dhaba', 'morning'],  // THAALI ECU — bhaap uthti thaali counter par, "₹100" tag pop — "thaali sau rupay ki"
  ['s06', 258, 296, 'highway', 'morning'],// RIVAL hotel-wala — sadak ke paar HOTEL building, rival smug, peeche "HOTEL" sign
  ['s07', 296, 306, 'highway', 'morning'],// Rival LAUGH close-up (s ~2.0), laugh expression, sar peeche — "hansa" 296-310, sample 306 par khatam
];
const SHOTMAP = {}; SHOTS.forEach(([id, a, b, set, env]) => { SHOTMAP[id] = { id, a, b, set, env, len: b - a }; });
export const shotAt = (f) => {
  for (const [id, a, b] of SHOTS) if (f >= a && f < b) { const s = SHOTMAP[id]; return { ...s, u: clamp((f - a) / s.len) }; }
  const s = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...s, u: 1 };
};
// FLASH: is sample me white-flash device nahi chahiye.
export const FLASH = {};

// ---------- set layout (centre ~ (0,0,-3)) ----------
// highway: sadak z=1.8 (x -8..8); dhaba building x=-1.5 (deewaar z=-4.3, 6.5 chaudi, 3.2 unchi),
//   "BHANU DHABA" sign (-1.5, 2.95), "12 GUNA" board (-3.6, 1.85), menu board bahar (1.4, -3.5),
//   tables (0.6,-2.2) & (2.2,-2.0); HOTEL building x=4.6 (z=-4.6, 3.4 chaudi, 4.5 unchi), "HOTEL" sign y=4.0;
//   ped (-6.2,-3.6) & (6.4,-3.4); khambe + taar (sag); mid-row makaan z=-7; skyline z=-19.
// dhaba: counter (0.3, -2.6), thaali stack counter par, bhaap, latakte bulb, bada menu board (0.9, 1.7, -3.72),
//   deewaar z=-3.8 (neechi — upar aasmaan + skyline dikhe), side table (2.4,-2.0).
export const CAMS = {
  // s01 ANCHOR: low-angle tracking sadak ke saath (y~0.7) → dhaba ki taraf push-in; "12 GUNA" board frame 1 se
  s01: [[-6.5, 1.8, 8.0], [-1.5, 1.4, -3.0], 55, 0, [-3.0, 1.6, 6.0], [-1.0, 1.2, -3.5], 50, 0],
  // s02 CLOSE-UP: Bhanu s 2.1 — camera door (dist ~7.8) taaki chehra frame ka ~65% le, margin ke saath
  s02: [[-1.5, 2.3, 6.2], [-1.5, 2.2, -1.6], 42, 0, [-1.3, 2.25, 5.7], [-1.5, 2.2, -1.6], 40, 0],
  // s03 MENU BOARD: Bhanu left, board right — dono frame ke andar
  s03: [[-0.6, 2.0, 1.8], [0.5, 1.35, -3.4], 52, 0, [-0.5, 1.95, 1.5], [0.7, 1.35, -3.4], 50, 0],
  // s04 ESTABLISH wide: poori highway + dhaba + HOTEL ek frame me
  s04: [[-5.5, 2.6, 6.5], [0.0, 1.2, -3.0], 55, 0, [-3.5, 2.4, 5.5], [1.0, 1.2, -3.5], 52, 0],
  // s05 THAALI ECU: counter par thaali frame bhar, ₹100 tag upar
  s05: [[0.3, 1.9, 0.7], [0.3, 1.35, -2.8], 42, 0, [0.28, 1.88, 0.5], [0.3, 1.35, -2.8], 40, 0],
  // s06 RIVAL + HOTEL: camera sadak ke is paar se, rival + HOTEL sign ek frame me
  s06: [[2.0, 1.9, 2.6], [3.6, 1.5, -3.2], 46, 0, [2.3, 1.85, 2.2], [3.6, 1.5, -3.2], 44, 0],
  // s07 RIVAL LAUGH close-up: s ~2.0, camera door, sar peeche tilt
  s07: [[3.2, 2.2, 5.0], [3.2, 2.1, -2.8], 42, 0, [3.1, 2.15, 4.6], [3.2, 2.1, -2.8], 40, 0],
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
