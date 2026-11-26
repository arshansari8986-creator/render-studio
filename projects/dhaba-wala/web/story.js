// "Dhaba Wala" — FULL (46.58s, 1398 frames @30fps). v3 voice, script v2 FINAL.
// Sample ke 7 shots (0-310f) ACTION se dobara — user order: koi shot sirf-bolne wala nahi.
// Word timings: words_v3_full.json (whisper-small, v3 file) + v2 words (missing 888-938f segment).
//   s01 0-76 | s02 76-122 | s03 122-184 | s04 184-219 | s05 219-258 | s06 258-296 | s07 296-310
//   s08 310-352 "baavan cheezein" | s09 352-386 "graahak mere paas"
//   s10 386-436 "roz shaam kachre ka dabba" | s11 436-471 dabba overflow | s12 471-526 "aadhi sabzi phenkni"
//   s13 526-571 "dhai hazaar roz" | s14 571-625 "pachattar hazaar" | s15 625-676 "Tum hote to kya karte?"
//   s16 676-715 "menu ko aag laga di" | s17 715-765 "14 cheezein rakhi" | s18 765-794 "thaali jaldi mili"
//   s19 794-823 "truck rukne lage" | s20 823-856 driver khata hai | s21 856-888 doosra truck + serve
//   s22 888-938 "hisaab khula, saat hazaar" (v2 words) | s23 938-965 "pachasi hazaar"
//   s24 965-1017 "Baarah guna / khud check karo" | s25 1017-1071 "tees se zyada to kachra"
//   s26 1071-1112 "hotel wala poochta hai" (SECOND TURN) | s27 1112-1161 "raaz kya hai?"
//   s28 1161-1194 "Bada menu nahi" | s29 1194-1223 "bada hisaab"
//   s30 1223-1267 "Khana kam becha" | s31 1267-1299 "kamai baarah guna" | s32 1299-1350 "thaali se nahi"
//   s33 1350-1398 "kachre se haarta tha" (LOOP — s01 jaisi wide)
// GULLAK CHECKLIST: 33 shots / 46.58s = 1.41s avg | numbers objects bankar (₹100/₹2,500/₹75,000/₹7,000→₹85,000/14)
//   | withheld raaz (menu jalana + 12-guna hisaab) sirf climax par | hasne wala rival, taana punchline bane
//   | second turn 35.7s (video ka 77% — Gullak 40-58s ka proportional match) | loop ending, no CTA
//   | roshni se samay: morning 0-386f → shaam/evening 386f se | background depth har shot
//   | PROCESS step-by-step: kadhai→thaali→serve→truck→khana→paise ginna→menu jalna→naya menu
//   | ACTION: har shot me character KARTA hai (chalta/uthata/jalata/ginta/khilata) — sirf lip-sync kabhi nahi
//   | ZINDA: har shot me 2-3 harkatein (character action + background + camera move)
// NO captions — captionAt hamesha khaali.
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 1398;

// ---------- shots: [id, a, b, set, env] ----------
// set: 'highway' (chaudi highway + dhaba building + paar HOTEL) | 'dhaba' (counter/thali/kadhai area)
// env: morning (0-386f) | evening (386f se — "roz shaam" line se roshni badalti hai)
export const SHOTS = [
  ['s01', 0, 76, 'highway', 'morning'],    // HOOK: Bhanu thaali lekar CHALTA hua aata hai, table par rakhta hai — "12 GUNA" board frame 1 se
  ['s02', 76, 122, 'highway', 'morning'],  // Bhanu CU: bolte hue haath se ishaara + thaali adjust (lift oscillate) + sar hile
  ['s03', 122, 184, 'dhaba', 'morning'],   // Bhanu board ki taraf BADHTA hai, ungli se items ginata hai; waiter peeche thaali lekar chalta hai
  ['s04', 184, 219, 'highway', 'morning'], // ESTABLISH wide: Bhanu haath hila kar graahak bulata hai (wave), truck guzarta hai
  ['s05', 219, 258, 'dhaba', 'morning'],   // THAALI ECU: Bhanu ka haath katori UTHA kar thaali par rakhta hai; ₹100 tag pop
  ['s06', 258, 296, 'highway', 'morning'], // RIVAL chalte hue aata hai HOTEL se, ungli dikhata hai; waiter thaali lekar guzarta hai
  ['s07', 296, 310, 'highway', 'morning'], // RIVAL belly-laugh CU: pet pakad kar hansa, sar peeche
  ['s08', 310, 352, 'highway', 'morning'], // "baavan cheezein": rival aage badhta hai, ungli se dhaba ki taraf taana; waiter serve karta hai
  ['s09', 352, 386, 'highway', 'morning'], // "graahak mere paas": rival seena thokta + pet pakad kar hansta; Bhanu table ponchhta hai
  ['s10', 386, 436, 'highway', 'evening'], // SHAAM: waiter basi sabzi kadhai se dabbe me PHENKTA hai; Bhanu chal kar aata hai, pareshaan
  ['s11', 436, 471, 'highway', 'evening'], // Dabba OVERFLOW ECU: sabzi ka dher badhta hai; Bhanu sar pakadta hai; waiter 2nd dabba lata hai
  ['s12', 471, 526, 'dhaba', 'evening'],   // "aadhi sabzi phenkni": Bhanu kadhai chalata/khurchta hai, sabzi dabbe me girti hai (aag + bhaap)
  ['s13', 526, 571, 'highway', 'evening'], // "dhai hazaar roz": Bhanu NOTE gin kar dabbe me PHENKTA hai; ₹2,500 tag pop
  ['s14', 571, 625, 'highway', 'evening'], // "pachattar hazaar": dabbon ka dher + ₹75,000 board; Bhanu SHOCK CU
  ['s15', 625, 676, 'highway', 'evening'], // "Tum hote to kya karte?": Bhanu CU sochta hai, thhodi par ungli, camera ki taraf dekhta hai
  ['s16', 676, 715, 'dhaba', 'evening'],   // "menu ko aag laga di": Bhanu machis jalata hai, kagaz wala menu JALTA hai (aag + dhuaan)
  ['s17', 715, 765, 'dhaba', 'evening'],   // "14 cheezein rakhi": Bhanu naya chhota board KEEL se lagata hai; waiter board pakadta hai
  ['s18', 765, 794, 'dhaba', 'evening'],   // "thaali jaldi mili": Bhanu kadhai se thaali lagata hai; waiter thaali lekar DAUDTA hai
  ['s19', 794, 823, 'highway', 'evening'], // "truck rukne lage": truck aakar RUKTA hai; driver utar kar dhabe ki taraf chalta hai
  ['s20', 823, 856, 'highway', 'evening'], // Driver baith kar thaali KHATA hai; Bhanu paas khada serve karta hai
  ['s21', 856, 888, 'highway', 'evening'], // Doosra truck park hota hai; waiter 2nd table serve karta hai; Bhanu truck ko haath se bulata hai
  ['s22', 888, 913, 'dhaba', 'dusk'],   // "hisaab khula": Bhanu GALLA kholta hai, NOTE ginta hai (thaali nahi — Gullak "counting notes" beat)
  ['s23', 913, 965, 'dhaba', 'dusk'],   // "saat hazaar ka munafa, pachasi hazaar, baarah guna": ₹7,000 → ₹85,000 board SLAM; Bhanu shock → grin
  ['s24', 965, 1017, 'dhaba', 'dusk'],  // "Khud check karo — menu gino": KHAAS ANGLE (low-angle push-in); Bhanu ungliyon par 14 ginata hai
  ['s25', 1017, 1071, 'highway', 'dusk'], // "tees se zyada to kachra": Bhanu KHAALI dabba utha kar dikhata hai; bhara dabba bagal me
  ['s26', 1071, 1112, 'highway', 'dusk'], // SECOND TURN: rival haath jod kar CHALTA hua aata hai; Bhanu serve karte hue nahi rukta
  ['s27', 1112, 1161, 'highway', 'dusk'], // "raaz kya hai?": rival CU jhuk kar poochta hai; Bhanu apron par haath ponchhta hai
  ['s28', 1161, 1194, 'highway', 'dusk'], // "Bada menu nahi": Bhanu muskurata hai, sar par ungli (dimaag), sar hilata hai
  ['s29', 1194, 1223, 'dhaba', 'dusk'],  // "bada hisaab": Bhanu kagaz rival ko dikhata hai; rival dheere se sar hilata hai (maan gaya)
  ['s30', 1223, 1267, 'highway', 'evening'], // "Khana kam becha": WIDE — poora dhaba bhara hua, truck khade, log kha rahe, waiter daud raha
  ['s31', 1267, 1299, 'highway', 'evening'], // "kamai baarah guna": Bhanu thaali upar uthata hai; driver + graahak haath uthakar cheer karte hain
  ['s32', 1299, 1350, 'highway', 'evening'], // "thaali se nahi": Bhanu khaali dabbe ki taraf chalta hai, use halke se thokta hai, grin
  ['s33', 1350, 1398, 'highway', 'evening'], // LOOP: Bhanu grin CU → pull-back s01 jaisi wide (golden shaam, 12 GUNA board, truck guzarta)
];
const SHOTMAP = {}; SHOTS.forEach(([id, a, b, set, env]) => { SHOTMAP[id] = { id, a, b, set, env, len: b - a }; });
export const shotAt = (f) => {
  for (const [id, a, b] of SHOTS) if (f >= a && f < b) { const s = SHOTMAP[id]; return { ...s, u: clamp((f - a) / s.len) }; }
  const s = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...s, u: 1 };
};
// FLASH: SIRF shock/reveal par (map C2.5) — s14 ₹75,000 shock, s23 ₹85,000 climax.
export const FLASH = { s14: { at: 600, dur: 8 }, s23: { at: 920, dur: 8 } };

// ---------- set layout (centre ~ (0,0,-3)) ----------
// highway: sadak z=1.8 (x -8..8); dhaba building x=-1.5 (deewaar z=-4.3, 6.5 chaudi, 3.2 unchi),
//   "BHANU DHABA" sign (-1.5, 2.95), "12 GUNA" board (-2.4, 1.9), tables (0.6,-2.2) & (2.2,-2.0);
//   HOTEL building x=4.6 (z=-4.6, 3.4 chaudi, 4.5 unchi), "HOTEL" sign y=4.0;
//   kachra dabbe (-3.6,-3.3) & (-3.0,-3.3); ped (-6.2,-3.6) & (6.4,-3.4); khambe + taar (sag); mid-row makaan z=-7; skyline z=-19.
// dhaba: counter (0.3, -2.6), thaali stack counter par, bhaap, latakte bulb, bada menu board (1.25, 1.8, -3.72),
//   naya 14-board (1.25, 1.8, -3.68) s17 se, hisaab board (-2.2, 1.5, -3.70) s23 me,
//   kadhai + stove (-2.0, -3.0), dabba (-0.9, -3.0), galla counter par (-0.7, 1.06, -2.6),
//   deewaar z=-3.8 (neechi — upar aasmaan + skyline dikhe), side table (2.4,-2.0).
export const CAMS = {
  // s01 ANCHOR: low-angle tracking sadak ke saath (y~0.7) → dhaba ki taraf push-in; "12 GUNA" board frame 1 se
  s01: [[-5.2, 1.9, 7.2], [-1.5, 1.4, -3.0], 55, 0, [-4.2, 1.8, 6.4], [-1.2, 1.3, -3.2], 50, 0],
  // s02 CLOSE-UP: Bhanu s 2.1 — camera door (dist ~7.8) taaki chehra frame ka ~65% le, margin ke saath
  s02: [[-1.5, 2.3, 6.2], [-1.5, 2.2, -1.6], 42, 0, [-1.3, 2.25, 5.7], [-1.5, 2.2, -1.6], 40, 0],
  // s03 MENU BOARD: Bhanu left, board right — dono frame ke andar
  s03: [[-0.6, 2.0, 1.8], [0.5, 1.35, -3.4], 52, 0, [-0.5, 1.95, 1.5], [0.7, 1.35, -3.4], 50, 0],
  // s04 DRONE high-angle: upar se highway + dhaba + HOTEL (map beat 3, Muft s03 jaisa) — halka descend, orbit NAHI
  s04: [[-4.5, 4.6, 6.5], [-0.3, 1.4, -3.0], 55, 0, [-3.6, 4.3, 6.0], [-0.3, 1.4, -3.2], 53, 0],
  // s05 THAALI ECU: counter par thaali frame bhar, ₹100 tag upar-left (board text par NAHI)
  s05: [[0.3, 1.9, 0.7], [0.3, 1.35, -2.8], 42, 0, [0.28, 1.88, 0.5], [0.3, 1.35, -2.8], 40, 0],
  // s06 RIVAL + HOTEL: camera peeche + look upar, taaki HOTEL sign poora dikhe — FIX: fov 50, z 3.4
  s06: [[1.6, 2.0, 3.4], [4.0, 1.8, -3.4], 50, 0, [1.9, 1.95, 3.0], [3.2, 1.7, -2.8], 48, 0],
  // s07 RIVAL LAUGH close-up: s ~2.0, camera door, sar peeche tilt
  s07: [[3.2, 2.2, 5.0], [3.2, 2.1, -2.8], 42, 0, [3.1, 2.15, 4.6], [3.2, 2.1, -2.8], 40, 0],
  // s08 RIVAL taunt: rival aage badhta hai, camera uske saath track kare
  s08: [[2.6, 2.0, 3.2], [3.4, 1.6, -2.8], 48, 0, [2.2, 1.95, 2.6], [2.8, 1.6, -2.6], 46, 0],
  // s09 RIVAL laugh + Bhanu table ponchhta: dono ek frame me
  s09: [[0.8, 2.0, 3.4], [1.2, 1.4, -2.4], 50, 0, [0.6, 1.95, 3.0], [1.0, 1.4, -2.4], 48, 0],
  // s10 SHAAM dabba: waiter phenkta hai, Bhanu aata hai — dabba left, dhaba peeche
  s10: [[-4.6, 2.0, 1.8], [-3.2, 1.1, -3.2], 50, 0, [-4.2, 1.95, 1.4], [-3.0, 1.1, -3.2], 48, 0],
  // s11 Dabba OVERFLOW ECU: dabba frame bhar, Bhanu peeche sar pakde
  s11: [[-3.4, 2.0, 0.6], [-2.8, 1.0, -3.2], 48, 0, [-3.3, 1.9, 0.2], [-2.8, 1.0, -3.2], 46, 0],
  // s12 KADHAI scrape: dhaba set, kadhai + dabba + Bhanu ek frame me
  s12: [[-1.4, 1.9, 0.6], [-1.5, 1.2, -3.0], 48, 0, [-1.2, 1.85, 0.3], [-1.5, 1.2, -3.0], 46, 0],
  // s13 ₹2,500: dabba + Bhanu + tag — tag frame ke andar, margin ke saath
  s13: [[-4.4, 2.1, 1.6], [-3.2, 1.2, -3.2], 50, 0, [-4.0, 2.05, 1.2], [-3.1, 1.2, -3.2], 48, 0],
  // s14 ₹75,000: dabba dher + board wide, Bhanu shock CU ke liye camera paas
  s14: [[-3.8, 2.2, 2.6], [-2.2, 1.4, -3.4], 52, 0, [-3.2, 2.1, 1.8], [-2.0, 1.4, -3.4], 48, 0],
  // s15 Bhanu CU thinking: s 2.2, camera door, chehra ~70%
  s15: [[-1.5, 2.2, 4.6], [-1.5, 2.0, -1.6], 42, 0, [-1.4, 2.15, 4.2], [-1.5, 2.0, -1.6], 40, 0],
  // s16 MENU JALANA: dhaba set, menu board + aag — board poora frame me
  s16: [[-0.6, 2.0, 1.8], [0.8, 1.4, -3.5], 52, 0, [-0.4, 1.9, 1.1], [0.9, 1.35, -3.5], 46, 0],
  // s17 NAYA BOARD: Bhanu board lagata hai — board + Bhanu + waiter ek frame me
  s17: [[-0.4, 2.0, 1.6], [0.7, 1.5, -3.5], 50, 0, [-0.3, 1.95, 1.3], [0.8, 1.5, -3.5], 48, 0],
  // s18 TOP-DOWN thaali: upar se counter — Bhanu kadhai se thaali lagata hai, waiter thaali lekar daudta hai (map beat 10)
  s18: [[-0.4, 3.8, 0.6], [-0.6, 1.2, -2.6], 52, 0, [-0.2, 3.6, 0.2], [-0.6, 1.2, -2.6], 50, 0],
  // s19 TRUCK RUKTA: highway wide, truck aata hai + driver utarta hai
  s19: [[-4.6, 2.4, 6.0], [0.0, 1.2, -1.0], 54, 0, [-3.8, 2.3, 5.2], [0.6, 1.2, -1.4], 52, 0],
  // s20 DRIVER KHATA: table par driver + thaali, Bhanu paas
  s20: [[0.2, 1.9, 1.6], [0.8, 1.2, -2.2], 48, 0, [0.4, 1.85, 1.2], [0.9, 1.2, -2.2], 46, 0],
  // s21 2nd TRUCK + serve: wide, dono truck + waiter
  s21: [[-5.0, 2.8, 7.5], [0.5, 1.2, -2.0], 56, 0, [-4.2, 2.7, 6.8], [1.0, 1.2, -2.2], 54, 0],
  // s22 GALLA: dhaba set, counter + Bhanu + galla — note ginna dikhe
  s22: [[0.3, 1.9, 0.8], [0.1, 1.2, -2.7], 46, 0, [0.25, 1.85, 0.5], [0.1, 1.2, -2.7], 44, 0],
  // s23 ₹85,000 SLAM: hisaab board ECU-ish, Bhanu shock
  s23: [[-1.2, 1.9, 0.8], [-1.6, 1.5, -3.6], 46, 0, [-1.0, 1.85, 0.5], [-1.6, 1.5, -3.6], 44, 0],
  // s24 KHAAS ANGLE — LOW ANGLE push-in: Bhanu + 14-board, golden shaam
  s24: [[-1.8, 0.6, 3.2], [-0.8, 2.2, -3.2], 55, 0, [-1.2, 0.7, 2.6], [-0.8, 2.1, -3.2], 52, 0],
  // s25 KHAALI DABBA: Bhanu dabba uthata hai — dabba + Bhanu + bhara dabba ek frame me
  s25: [[-4.4, 2.0, 1.4], [-3.2, 1.1, -3.2], 50, 0, [-4.0, 1.95, 1.0], [-3.1, 1.1, -3.2], 48, 0],
  // s26 RIVAL WAPAS: HOTEL se chal kar aata hai, haath jode
  s26: [[2.2, 2.0, 3.6], [1.8, 1.5, -3.0], 52, 0, [2.0, 1.9, 3.2], [1.8, 1.5, -2.8], 50, 0],
  // s27 RIVAL CU "raaz kya hai?": s 2.1, jhuk kar poochta hai
  s27: [[2.8, 2.2, 4.4], [2.8, 2.0, -2.2], 42, 0, [2.7, 2.15, 4.0], [2.8, 2.0, -2.2], 40, 0],
  // s28 BHANU "Bada menu nahi": Bhanu CU smile, sar par ungli
  s28: [[-1.5, 2.2, 4.6], [-1.5, 2.0, -1.6], 42, 0, [-1.4, 2.15, 4.2], [-1.5, 2.0, -1.6], 40, 0],
  // s29 "bada hisaab": dhaba set, Bhanu 14-board ki taraf, rival peeche maan gaya
  s29: [[-0.4, 2.0, 1.6], [0.7, 1.5, -3.5], 50, 0, [-0.3, 1.95, 1.3], [0.8, 1.5, -3.5], 48, 0],
  // s30 HIGH-ANGLE wide: upar se bhara dhaba — truck, log, waiter, Bhanu (map beat 15 aerial)
  s30: [[-4.5, 5.5, 7.0], [0.5, 0.9, -2.5], 58, 0, [-4.0, 5.2, 6.6], [0.8, 0.9, -2.5], 56, 0],
  // s31 BHANU THAALI UPAR: Bhanu + cheer karte graahak
  s31: [[-1.0, 2.0, 3.4], [-0.6, 1.5, -2.2], 50, 0, [-0.8, 1.95, 3.0], [-0.6, 1.5, -2.2], 48, 0],
  // s32 BHANU DABBE KI TARAF: chalta hua, dabba thokta hai
  s32: [[-4.2, 2.0, 1.8], [-3.2, 1.1, -3.2], 50, 0, [-3.8, 1.95, 1.4], [-3.0, 1.1, -3.2], 48, 0],
  // s33 LOOP aerial wide: upar se dhaba + highway + truck (sunset sunehri) — Bhanu thaali uthaye chalta hua, s01 jaisa frame
  s33: [[-4.0, 6.5, 7.5], [0.0, 0.8, -2.5], 56, 0, [-3.0, 6.0, 7.0], [0.5, 0.8, -2.5], 54, 0],
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
