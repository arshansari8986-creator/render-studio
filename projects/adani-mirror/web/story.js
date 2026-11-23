// "Adani Crash FULL — Tum Gautam Adani ho" — Mirror kit + Gullak grammar.
// NO CAPTIONS (user order). Sirf scenes, characters, scene-ke-andar boards/screens.
// Voice timing (voice_fast.wav, 30fps — voice_final verified starts / 1.04):
// L1 0-142 | L2 142-260 | L3 260-463 | L4 463-721 | L5 721-857 | L6 857-1055
// L7 1055-1107 | L8 1107-1252 | L9 1252-1370 | L10 1370-1522 | L11 1522-1541
// L12 1541-1621 | L13 1621-1769 (TOTAL 1769 = 58.95s)
// ⚠️ GATI NIYAM: har shot 30-60 frames (1-2s) — ek bhi shot 60 se bada NAHI.
// ⚠️ CAMERA NIYAM: har shot alag DISHA + ANGLE, lagatar do shots me same angle NAHI,
//    camera kabhi static nahi.
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 1769;

export const LINES = [[0, 142], [142, 260], [260, 463], [463, 721], [721, 857], [857, 1055], [1055, 1107], [1107, 1252], [1252, 1370], [1370, 1522], [1522, 1541], [1541, 1621], [1621, 1769]];

// ---------- shots: [id, a, b, set, env?] — har shot 30-60 frames, contiguous ----------
// set: office | port | airport | power | screen(office set, bazaar env)
// env: office | port | airport | power | screen | evening (default = set)
export const SHOTS = [
  ['s01', 0, 48, 'office'],    // L1 LOW-ANGLE saamne se — Adani khidki ke saamne, garv
  ['s02', 48, 95, 'office'],   // L1 TOP-DOWN (upar se) — desk: chai, akhbaar, phone
  ['s03', 95, 142, 'office'],  // L1 PEECHE se (over-shoulder) — khidki bahar bandar-gah, push-in
  ['s04', 142, 182, 'port'],   // L2 PORT — uncha diagonal FLY-IN, cranes + jahaz
  ['s05', 182, 222, 'airport'],// L2 AIRPORT — LOW-ANGLE neeche se, jahaz upar se guzarta
  ['s06', 222, 260, 'power'],  // L2 BIJLI — kone se DUTCH TILT, towers + taar, dolly
  ['s07', 260, 305, 'office'], // L3 PHONE MACRO — desk par phone bajta hai, push-in tez
  ['s08', 305, 350, 'office'], // L3 POV — Adani ki nazar se phone screen: AMERICA SE REPORT
  ['s09', 350, 405, 'office'], // L3 SIDE se close-up — chehra garv -> CHAUK (sannata)
  ['s10', 405, 463, 'office'], // L3 KONE se DUTCH wide — Adani khidki paas, phone haath me
  ['s11', 463, 510, 'screen'], // L4 PEECHE se push-in — badi screen par graph GIRTA hua
  // ---- L4 cont. (bazaar crash) ----
  ['s12', 510, 558, 'screen', 'screen'],  // SCREEN MACRO kone se — crash graph + -20% zoom
  ['s13', 558, 606, 'office'],            // SIDE close-up (dusri taraf) — shock -> nervous, phone haath me
  ['s14', 606, 651, 'office'],            // TOP-DOWN desk — akhbaar + report phone + bikhre kagaz
  ['s15', 651, 691, 'screen', 'screen'],  // LOW-ANGLE saamne — screen par 3 LOWER CIRCUIT badges
  ['s16', 691, 721, 'office'],            // PEECHE se wide — screen ke saamne akela, kandhe jhuke
  // ---- L5: shaam ka number ----
  ['s17', 721, 769, 'screen', 'evening'], // KONE se — screen par -22 BILLION DOLLAR, shaam ki roshni
  ['s18', 769, 817, 'office', 'evening'], // GHADI MACRO — shaam ke 6 baje, second hand ghoomti
  ['s19', 817, 857, 'office', 'evening'], // SIDE close-up — chehra girta hua (pained)
  // ---- L6: do din / rank ----
  ['s20', 857, 905, 'office'],            // TOP-DOWN wide — akhbaaron ki barsaat girti hui
  ['s21', 905, 953, 'screen', 'screen'],  // SAAMNE LOW-ANGLE — rank board #3 -> #7 + 48 BILLION
  ['s22', 953, 1001, 'screen', 'screen'], // KONE se MACRO — "48 BILLION DOLLAR" par push-in
  ['s23', 1001, 1055, 'office'],          // PEECHE se wide — khidki paas akela, farsh par akhbaar
  // ---- L7: asli jhatka (suspense) ----
  ['s24', 1055, 1107, 'office', 'screen'],// SAAMNE close-up slow push-in — nervous, gehra mahaul
  // ---- L8: FPO ----
  ['s25', 1107, 1155, 'office'],          // TOP-DOWN kone — FPO form macro desk par
  ['s26', 1155, 1203, 'office'],          // SIDE se — bheed kagaz wapas karti hui, Adani peeche stern
  ['s27', 1203, 1252, 'office'],          // MACRO kone — laal stamp "FPO BAND" jhatke se padta hai
  // ---- L9: ek mahina ----
  ['s28', 1252, 1292, 'office'],          // TOP-DOWN — calendar ke panne udte hue
  ['s29', 1292, 1332, 'screen', 'evening'],// KONE se — screen par aadha graph + #25
  ['s30', 1332, 1370, 'office', 'evening'],// PEECHE se wide — khaali office, khidki paas akela
  // ---- L10: wapasi ----
  ['s31', 1370, 1410, 'office'],          // MACRO top-down kone — karz kagaz par laal line kat-ti hui
  ['s32', 1410, 1450, 'port'],            // PORT — neeche-side se dolly, crane ka container uthta hua
  ['s33', 1450, 1490, 'port'],            // LOW-ANGLE paani kinare — chhoti kashti/jahaz chalta hua
  ['s34', 1490, 1522, 'office'],          // SAAMNE — muskurahat wapas, screen par BHARAT #1
  // ---- L11+L12: seekh ----
  ['s35', 1522, 1570, 'office'],          // SIDE se — desk board: DAULAT = KAGAZ / TIKTI = BHAROSA
  ['s36', 1570, 1621, 'office'],          // SAAMNE LOW close — shaant smile, board side me
  // ---- L13: sawal ----
  ['s37', 1621, 1669, 'office'],          // KONE se 3/4 — viewer ki taraf POINT, stern sawal
  ['s38', 1669, 1717, 'office'],          // UNCHA KONE wide — ek taraf laal screen, dusri taraf report phone
  ['s39', 1717, 1769, 'office'],          // PEECHE-UPAR se WIDE PULL-BACK — ant, garam roshni
];
const SHOTMAP = {}; SHOTS.forEach(([id, a, b, set, env]) => { SHOTMAP[id] = { id, a, b, set, env, len: b - a }; });
export const shotAt = (f) => {
  for (const [id, a, b] of SHOTS) if (f >= a && f < b) { const s = SHOTMAP[id]; return { ...s, u: clamp((f - a) / s.len) }; }
  const s = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...s, u: 1 };
};

// ---------- per-shot camera keys: [posA, lookA, fovA, rollA, posB, lookB, fovB, rollB] ----------
// Office world: back wall z=-3.2; khidki centre (0.4, 2.6, -3.14) bahar port view;
// desk (0.3, top 0.78, -0.55); screen back-left (-2.75, 2.45, -3.15);
// Adani khidki ke saamne (0.3, 0, -1.6); phone desk par (0.55, 0.815, -0.35);
// ghadi-6 nayi deewar ghadi (-4.35, 2.7, -3.14); FPO form desk par (0.68, 0.795, -0.5).
export const CAMS = {
  s01: [[0.3, 0.5, 3.6], [0.3, 1.8, -1.6], 46, 0, [0.3, 0.72, 2.55], [0.3, 1.85, -1.6], 42, 0],      // LOW-ANGLE dolly-in (neeche se upar)
  s02: [[0.3, 4.4, 1.5], [0.3, 0.7, -0.6], 42, 0, [0.72, 4.15, 1.05], [0.32, 0.72, -0.58], 40, 0],  // TOP-DOWN halka orbit (upar se desk)
  s03: [[-2.2, 1.6, 3.3], [0.85, 1.7, -3.2], 52, 0, [-1.6, 1.55, 2.1], [0.8, 1.78, -3.3], 48, 0], // PEECHE/over-shoulder push-in khidki ki taraf
  s04: [[-5.5, 5.0, 10.5], [-1.2, 1.5, -2.5], 55, 0, [-3.4, 3.8, 7.8], [-0.9, 1.5, -2.2], 50, 0],          // PORT uncha diagonal FLY-IN
  s05: [[-3.2, 0.5, 7.8], [-2.0, 2.4, -3.5], 52, 0, [-2.8, 0.55, 7.4], [2.2, 2.7, -3.5], 50, 0],       // AIRPORT LOW-ANGLE, pan jahaz ke saath
  s06: [[4.6, 1.1, 6.8], [0, 1.7, -1.2], 48, 7, [3.6, 1.28, 6.1], [0, 1.75, -1.2], 46, 5],          // BIJLI kone se DUTCH TILT + dolly
  s07: [[1.05, 1.7, 1.15], [0.55, 0.8, -0.35], 36, 0, [0.86, 1.36, 0.4], [0.55, 0.81, -0.35], 32, 0], // PHONE MACRO tez push-in
  s08: [[0.3, 1.64, 1.4], [0.3, 1.02, 0.12], 38, 0, [0.37, 1.59, 1.22], [0.31, 1.0, 0.1], 36, 0],    // POV phone — halka haath-sway + push
  s09: [[2.35, 1.62, 0.65], [0.3, 1.45, -1.55], 40, 0, [1.92, 1.56, 0.12], [0.3, 1.47, -1.55], 37, 0], // SIDE se close-up push-in
  s10: [[-3.4, 2.2, 5.6], [0.3, 1.3, -1.4], 50, -6, [-2.9, 2.05, 4.9], [0.3, 1.32, -1.4], 47, -8],   // KONE se DUTCH wide dolly
  s11: [[0.6, 1.35, 4.3], [-2.3, 1.9, -3.15], 50, 0, [0.45, 1.32, 3.5], [-2.4, 1.95, -3.15], 46, 0], // PEECHE se push-in — screen par girta graph
  s12: [[-1.15, 2.95, 0.7], [-2.75, 2.4, -3.15], 34, 0, [-1.5, 2.78, 0.05], [-2.78, 2.42, -3.15], 30, 0],   // SCREEN MACRO kone se push-in
  s13: [[-1.95, 1.62, 0.55], [0.3, 1.45, -1.55], 40, 0, [-1.6, 1.56, 0.1], [0.3, 1.47, -1.55], 37, 0],      // SIDE close-up (bayein taraf se)
  s14: [[0.35, 4.35, 0.95], [0.3, 0.78, -0.5], 42, 4, [0.62, 4.1, 0.6], [0.32, 0.78, -0.5], 40, 2],          // TOP-DOWN desk, halka roll
  s15: [[-2.6, 0.7, 2.7], [-2.75, 2.3, -3.15], 48, 0, [-2.65, 0.88, 2.25], [-2.75, 2.32, -3.15], 45, 0],     // LOW-ANGLE saamne — screen badges
  s16: [[0.9, 1.9, 4.6], [-1.6, 1.7, -3.0], 52, 0, [0.8, 1.85, 4.2], [-1.65, 1.68, -3.0], 50, 0],            // PEECHE se wide dolly
  s17: [[0.45, 1.5, 3.4], [-2.6, 2.2, -3.15], 50, 0, [0.3, 1.45, 3.0], [-2.65, 2.22, -3.15], 46, 0],         // KONE se — wealth screen + Adani side
  s18: [[-3.55, 2.95, 0.45], [-4.35, 2.7, -3.14], 36, 0, [-3.98, 2.78, -0.65], [-4.35, 2.7, -3.14], 30, 0],  // GHADI MACRO push-in
  s19: [[2.25, 1.58, 0.35], [0.3, 1.42, -1.55], 40, 0, [1.95, 1.52, 0.05], [0.3, 1.44, -1.55], 38, 0],       // SIDE close-up shaam
  s20: [[0.2, 5.3, 2.3], [0.2, 0.4, -0.6], 46, -3, [0.5, 5.05, 1.85], [0.22, 0.4, -0.6], 44, -2],            // TOP-DOWN wide — akhbaar barsaat
  s21: [[-2.7, 0.8, 2.85], [-2.75, 2.35, -3.15], 50, 0, [-2.72, 0.95, 2.45], [-2.75, 2.36, -3.15], 47, 0],   // SAAMNE LOW-ANGLE rank board
  s22: [[-4.3, 2.3, 2.5], [-2.78, 2.1, -3.15], 36, 0, [-4.05, 2.28, 1.85], [-2.78, 2.1, -3.15], 32, 0],    // KONE MACRO — 48 BILLION hissa
  s23: [[-0.6, 1.8, 4.8], [0.5, 1.6, -3.0], 52, 0, [-0.45, 1.75, 4.4], [0.48, 1.62, -3.0], 50, 0],           // PEECHE se wide — khidki paas akela
  s24: [[0.3, 1.5, 1.65], [0.3, 1.45, -1.55], 42, 0, [0.3, 1.48, 1.05], [0.3, 1.46, -1.55], 34, 0],          // SAAMNE close slow push-in (suspense)
  s25: [[1.36, 2.6, 1.15], [0.68, 0.79, -0.5], 38, 3, [1.2, 2.2, 0.72], [0.68, 0.79, -0.5], 33, 2],       // TOP-DOWN kone FPO form macro
  s26: [[4.0, 1.85, 2.8], [-0.1, 1.15, -0.7], 44, 0, [3.75, 1.75, 2.45], [-0.1, 1.15, -0.7], 42, 0],            // SIDE se bheed + desk
  s27: [[1.62, 2.3, 1.35], [0.68, 0.8, -0.5], 34, 0, [1.46, 2.0, 0.98], [0.68, 0.8, -0.5], 30, 0],          // MACRO kone stamp
  s28: [[-0.08, 2.65, 0.92], [-0.32, 0.85, -0.66], 40, 3, [0.02, 2.25, 0.56], [-0.32, 0.85, -0.66], 36, 2],  // TOP-DOWN calendar panne
  s29: [[0.25, 1.3, 3.25], [-2.7, 2.3, -3.15], 48, 0, [0.12, 1.28, 2.9], [-2.72, 2.3, -3.15], 45, 0],        // KONE se screen #25
  s30: [[1.4, 2.1, 5.2], [0.3, 1.7, -2.8], 54, 0, [1.3, 2.05, 4.85], [0.3, 1.7, -2.8], 52, 0],               // PEECHE wide shaam — khaali office
  s31: [[1.44, 2.6, 1.2], [0.7, 0.79, -0.48], 38, -3, [1.28, 2.2, 0.75], [0.7, 0.79, -0.48], 34, -2],     // MACRO top-down karz kagaz
  s32: [[-6.6, 1.25, 6.6], [1.5, 1.9, -2.6], 52, 0, [-4.2, 1.4, 6.25], [1.6, 1.95, -2.6], 50, 0],            // PORT neeche-side dolly — crane chalta hua
  s33: [[-3.4, 1.3, 13.2], [-5.2, 0.75, 7.6], 48, 0, [3.2, 1.35, 12.9], [4.8, 0.75, 7.6], 46, 0],           // LOW-ANGLE paani kinare — kashti chalti hui (dolly boat ke saath, same smooth curve)
  s34: [[1.95, 1.55, 3.35], [-1.95, 2.0, -3.15], 48, 0, [1.75, 1.5, 3.05], [-2.0, 2.02, -3.15], 45, 0],             // KONE se — BHARAT #1 screen + muskurahat
  s35: [[4.1, 1.75, 2.5], [0.35, 1.05, -0.6], 42, 0, [3.8, 1.65, 2.15], [0.35, 1.05, -0.6], 40, 0],      // SIDE se desk board + Adani
  s36: [[1.5, 1.02, 1.75], [1.5, 1.38, -0.45], 42, 0, [1.5, 1.08, 1.38], [1.5, 1.4, -0.45], 38, 0],          // SAAMNE LOW close — shaant
  s37: [[-1.75, 1.5, 2.65], [0.3, 1.4, -1.5], 46, 0, [-1.5, 1.46, 2.3], [0.3, 1.42, -1.5], 42, 0],           // KONE 3/4 — POINT sawal
  s38: [[-3.15, 3.15, 4.65], [-0.7, 1.2, -2.2], 54, -4, [-2.95, 3.0, 4.35], [-0.7, 1.22, -2.2], 52, -3],     // UNCHA KONE wide — screen vs phone
  s39: [[0.5, 2.2, 3.4], [0.3, 1.4, -1.8], 50, 0, [0.7, 3.05, 6.5], [0.3, 1.3, -1.6], 54, 0],                // PEECHE-UPAR WIDE PULL-BACK — ant
};
export const camFor = (shot, u) => {
  const c = CAMS[shot.id];
  const e = u * u * (3 - 2 * u); // smoothstep within the shot
  const L = (a, b) => a + (b - a) * e;
  const L3 = (a, b) => a.map((v, i) => L(v, b[i]));
  return { pos: L3(c[0], c[4]), look: L3(c[1], c[5]), fov: L(c[2], c[6]), roll: L(c[3], c[7]) };
};
