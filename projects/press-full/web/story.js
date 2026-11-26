// "Press Wala" — FULL VIDEO (40.53 s, 1216 frames @30fps). 22 shots.
// Voice FINAL (40.53 s, Press_Voice_Final.wav). s01–s05 SAMPLE se EXACT copy
// (frames, cams, sets) — sirf TOTAL badla (259 → 1216).
// Shot boundaries words_final.json se (whisper word timings, ±0.1 s) — research §4:
//   s01 0-83    ("Is press wale ne ek mahine me do lakh kamaye." 0.00-2.76)
//   s02 83-123  ("Lekin press karke nahi." 2.76-4.10)
//   s03 123-179 ("Ye Raju hai — mohalle ki press dukaan." 4.10-5.98)
//   s04 179-223 ("Kapdon ka dher, bhaap, har kapde par ₹10." 5.98-7.44)
//   s05 223-259 (wahi line, tail — ₹10 tag ECU 7.44-8.62)
//   s06 259-318 ("February me post viral hui —" 8.62-10.60) — phone screen, ₹2,37,500 saaf
//   s07 318-382 ("— Raju ₹2,37,500 kamata hai!" 10.60-12.72) — number board, slow push-in
//   s08 382-449 ("Poora mohalla hairan — ₹10 ki press se itna?" 12.72-14.98) — 3× "O" munh
//   s09 449-493 ("Raju shaam ko galla kholta hai —" 14.98-16.42) — shaam, galla khulta hai
//   s10 493-519 ("— note ginta hai." 16.42-17.30) — note ginna close-up
//   s11 519-566 ("Din bhar ki mehnat —" 17.30-18.88) — khaali galla, deflation
//   s12 566-599 ("— galle me sirf ₹3,500." 18.88-19.98) — chhota number, chhota tag
//   s13 599-650 ("To do lakh kahan se aaya?" 19.98-21.68) — sawal closeup, push-in
//   s14 650-677 ("Tab ek suit aata hai —" 21.68-22.58) — graahak suit latkaye darwaze se
//   s15 677-737 ("— shaadi ka suit, ₹350." 22.58-23.96 + 0.60 s pause tail) — suit glow + ₹350 tag
//   s16 737-791 ("Roz aise 20 suit aate hain —" 24.56-26.36) — 20 suit ka dher, bina cut badhta
//   s17 791-838 ("— suit hi asli kamai hai." 26.36-27.92) — Raju proud medium
//   s18 838-920 ("Badi laundry ka manager hansta hai — ₹10 me kya kamayega?" 27.92-30.66) — hansi loop
//   s19 920-1022 ("Mahine me galla ₹2,83,500 ka bharta hai." 30.66-33.88 + 0.20 s pause tail) — counter + suit pahaad, pull-back
//   s20 1022-1088 ("Press bheed laati hai, suit ghar chalata hai." 34.08-36.28) — NOTEBOOK khulta hai (withheld reveal)
//   s21 1088-1150 ("Tum press wale se poochho — suit kitne ka hai?" 36.28-38.20 + 0.12 s pause tail) — two-shot khud-check
//   s22 1150-1216 ("Press ₹10 ki thi, ghar suit se chalta hai." 38.32-40.53) — ENDING travelling → push-in closeup, FREEZE, loop, KOI CTA NAHI
// WITHHELD: notebook shot 3 me sirf jhalak (dukaan ki deewaar ke paas rakhi), shot 9/11 me Raju ka haath us par,
//   poora khulta hai shot 20 (34.08 s) par — 34 second ka wait (research §5 rule 6).
// NUMBERS-AS-OBJECTS: s01 board "₹2,00,000"; s03 board "RAJU PRESS"; s05 laal tag "₹10";
//   s06 phone screen "₹2,37,500"; s07 bada board "₹2,37,500"; s12 chhota tag "₹3,500";
//   s15 sunehra tag "₹350"; s19 counter "₹2,83,500" (gin kar badhta hai); s20 notebook "PRESS = BHEED · SUIT = GHAR".
// NO captions — captionAt hamesha khaali. NO phoneme lip-sync — munh sirf beat par
// (main.js me mouthFor(); ENV is build me munh ke liye use NAHI hota).
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 1216;

// ---------- shots: [id, a, b, set, env] ----------
// set: 'gali' (press dukaan wali gali — dukaan bahar, sadak, taar, ped)
//      'dukaan' (press dukaan interior — counter, kapdon ka dher, bhaap)
// env: morning (subah — natural, muted) | day (din — halka neela aasmaan)
//      evening (shaam — narangi roshni, lamp) | sunset (ant — gehra narangi horizon)
export const SHOTS = [
  ['s01', 0, 83, 'gali', 'morning'],     // HOOK (2.76s): HIGH-ANGLE aerial gali wide → tez push-in press dukaan par → board "₹2,00,000" bada. Raju dukaan ke bahar khada, halki smile
  ['s02', 83, 123, 'gali', 'morning'],   // Raju CLOSE-UP static, sly smile, aankhein aadhi (squint), sar halka tilt; kaan peeche PEELI PENCIL pehli baar saaf
  ['s03', 123, 179, 'gali', 'morning'],  // Raju intro MEDIUM, eye-level, halka push-in. Board "RAJU PRESS", peeche kapdon ki kataar; gale me NAAPNE WALA TAPE; haath me press, press uthata hai
  ['s04', 179, 223, 'dukaan', 'morning'], // Process CLOSE-UP static — kapdon ka dher + BHAAP uthti hui; Raju press chala raha hai (haath upar-neeche, kabhi khaali nahi)
  ['s05', 223, 259, 'dukaan', 'morning'], // ₹10 TAG EXTREME CLOSE-UP static — kapde par bandha LAAL tag "₹10" bada; peeche bhaap halki
  ['s06', 259, 318, 'gali', 'morning'],  // PHONE CLOSE-UP — Raju phone dikhata hai (side me, chehra khula); screen par post "FEBRUARY" + "₹2,37,500" bada saaf; like/share badhte hain
  ['s07', 318, 382, 'gali', 'morning'],  // ₹2,37,500 BOARD slow push-in — bada board deewaar par; peeche Raju ki aankhein badi (hairani); number se pehle pause
  ['s08', 382, 449, 'gali', 'morning'],  // MOHALLA SHOCK — 3 chehre ek frame me, sabke munh gol "O", aankhein badi; beech wale ke maathe par paseene ki boond
  ['s09', 449, 493, 'dukaan', 'evening'], // SHAAM: Raju galla kholta hai — roshni din se shaam (narangi) badli; lakdi ka galla khulta hai (dhakkan upar); peeche lamp jalta hai
  ['s10', 493, 519, 'dukaan', 'evening'], // NOTE GINNA CLOSE-UP — haath ek-ek note gin raha hai (note upar-neeche); galle me note kam dikhte hain
  ['s11', 519, 566, 'dukaan', 'evening'], // DEFLATION — Raju khaali galle me jhaankta hai, andar sirf 3–4 note; chehra dheela, haath gaal par; halka push-in
  ['s12', 566, 599, 'dukaan', 'evening'], // ₹3,500 CHHOTA — note ka chhota dher + chhota tag "₹3,500" (bada number bada, chhota number chhota); Raju ka haath dher par
  ['s13', 599, 650, 'dukaan', 'evening'], // SAWAL CLOSEUP push-in — Raju ka chehra bada hota hai; bhaavein upar, munh halka khula — asli sawal
  ['s14', 650, 677, 'gali', 'evening'],  // SUIT AATA HAI — darwaze se graahak suit latkaye aata hai (chhote kadam + bob); Raju dekhta hai, aankhein badi
  ['s15', 677, 737, 'gali', 'evening'],  // SUIT REVEAL GLOW — suit par sunehri glow + tag "₹350" bada; peeche Raju ki smile aati hai; 0.60 s pause tail me glow hold
  ['s16', 737, 791, 'gali', 'day'],      // 20 SUIT KA DHER — dukaan me suiton ka dher BINA CUT badhta dikhe (ek-ek suit aata hai); Raju dher ke peeche, haath dher par
  ['s17', 791, 838, 'gali', 'day'],      // RAJU PROUD MEDIUM — seena chauda, halki smirk, haath kamar par; peeche dher
  ['s18', 838, 920, 'gali', 'day'],      // MANAGER KI HANSI (loop) — mota manager (sunehri chain, safed kurta) hansta hai, munh bada gol khula ~0.5 s cycle; Raju side me shaant khada
  ['s19', 920, 1022, 'dukaan', 'evening'], // COUNTER ₹2,83,500 + SUIT KA PAHAAD (pull-back) — counter gin kar badhta hai → pull-back: peeche suiton ka pahaad (rack + dher), Raju chhota; number bada; 0.20 s pause tail me hold
  ['s20', 1022, 1088, 'dukaan', 'evening'], // NOTEBOOK ZOOM+PAN (withheld reveal) — page hi hero hai ("PRESS = BHEED · SUIT = GHAR", neeli syahi, cream page); Raju is insert me frame se bahar (s05 jaisa) taaki page poora + bada dikhe
  ['s21', 1088, 1150, 'gali', 'day'],    // TWO-SHOT KHUD-CHECK — Raju + graahak (viewer ki jagah); Raju graahak ki taraf dekh kar bolta hai, suit ki taraf ishaara; graahak haath me suit pakde
  ['s22', 1150, 1216, 'gali', 'sunset'], // ENDING TRAVELLING — camera sadak par lateral track karta hai (dukaan, gali, taar) → Raju par push-in — woh suit uthata hai, muskura kar camera ki taraf dekhta hai → FREEZE sabse badi smile par. Loop punchline — koi CTA nahi.
];
const SHOTMAP = {}; SHOTS.forEach(([id, a, b, set, env]) => { SHOTMAP[id] = { id, a, b, set, env, len: b - a }; });
export const shotAt = (f) => {
  for (const [id, a, b] of SHOTS) if (f >= a && f < b) { const s = SHOTMAP[id]; return { ...s, u: clamp((f - a) / s.len) }; }
  const s = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...s, u: 1 };
};
// FLASH: is video me white-flash device nahi chahiye.
export const FLASH = {};

// ---------- set layout (centre ~ (0,0,-3)) ----------
// gali: sadak z=1.8 (x -8..8); press dukaan building x=-1.5 (deewaar z=-4.3, 6.5 chaudi, 3.2 unchi),
//   "RAJU PRESS" sign (-1.5, 2.95), "₹2,00,000" board (-2.7, 1.85, -4.22, 1.8x1.08 — bada),
//   "₹2,37,500" viral board (-2.7, 1.85, -4.22, 1.6x1.0 — sirf s07 me dikhe, s01 board se alag mesh),
//   kapdon ki kataar (rasse par x -1.6..1.2, z=-3.5, y~2.2 — BOARD se door),
//   darwaza (-1.2), khidki (0.3); padosi makaan mid-row z=-7; skyline z=-19; ped (-6.2,-3.6) & (6.4,-3.4); khambe + taar;
//   Raju dukaan ke bahar (-1.5, 0, -1.6); aangan me kapdon ki tokri (2.4, -0.8) + ghada foreground.
// dukaan: counter (0.3, -2.6), kapdon ka dher counter par, press loha (0.3, -2.6), latakta bulb,
//   bada "RAJU PRESS" board deewaar par (1.25, 1.8, -3.72), counter board "₹2,83,500" (0.6, 2.0, -3.72, 1.2x0.85 — sirf s19),
//   deewaar z=-3.8 (neechi — upar aasmaan + skyline dikhe),
//   peeche kapdon ki kataar deewaar par; Raju counter ke peeche (-0.35, 0, -3.0);
//   galla counter par (0.3, 1.06, -2.6); notebook chhoti counter par (1.3, 1.08, -2.6) s09/s11 me;
//   suit rack (-0.9, 0, -3.4) sirf s19 me (pahaad); notebook page (0.3, 1.35, -2.2) sirf s20 me.
export const CAMS = {
  // s01 HOOK: high-angle aerial wide → tez push-in dukaan par; board + Raju dono end par frame ke andar (board left, Raju uske bagal right)
  s01: [[-7.5, 6.5, 9.5], [-1.0, 0.8, -3.0], 58, 0, [-3.2, 2.8, 4.2], [-1.9, 1.65, -3.9], 52, 0],
  // s02 CLOSE-UP: Raju s 2.1 — camera door (dist ~7.5) taaki chehra frame ka ~65% le, margin ke saath; pencil dikhe
  s02: [[-1.35, 2.25, 5.9], [-1.5, 2.1, -1.6], 42, 0, [-1.35, 2.22, 5.5], [-1.5, 2.1, -1.6], 40, 0],
  // s03 INTRO MEDIUM: Raju left-centre, "RAJU PRESS" board upar + kapdon ki kataar peeche — sab frame ke andar
  s03: [[-1.15, 1.9, 2.6], [-1.15, 1.5, -3.6], 55, 0, [-1.1, 1.85, 2.1], [-1.15, 1.5, -3.6], 53, 0],
  // s04 PROCESS CLOSE-UP: dher + bhaap + Raju counter ke peeche — static, halka push-in
  s04: [[0.3, 1.9, 0.9], [0.0, 1.3, -2.8], 44, 0, [0.28, 1.88, 0.7], [0.0, 1.3, -2.8], 42, 0],
  // s05 TAG ECU: laal "₹10" tag frame bhar, peeche bhaap — static, halka push-in
  s05: [[0.3, 1.6, 0.2], [0.3, 1.35, -2.5], 40, 0, [0.3, 1.58, 0.0], [0.3, 1.35, -2.5], 38, 0],
  // s06 PHONE: phone Raju ke SIDE me (chehra khula rahe) — phone bada, number saaf; Raju ka chehra left me dikhe
  s06: [[-1.0, 2.0, 3.0], [-1.1, 1.8, -1.4], 46, 0, [-1.0, 1.98, 2.7], [-1.1, 1.8, -1.4], 44, 0],
  // s07 VIRAL BOARD: slow push-in "₹2,37,500" board par; Raju board ke bagal right (board ko cover na kare)
  s07: [[-2.4, 2.2, 4.4], [-2.2, 1.8, -4.2], 50, 0, [-2.3, 2.0, 2.6], [-2.2, 1.8, -4.2], 44, 0],
  // s08 MOHALLA SHOCK: 3 chehre ek frame me (x -1.85/-0.9/0.05, z -2.2) — static, halka push-in
  s08: [[-0.9, 1.9, 4.0], [-0.9, 1.6, -2.2], 48, 0, [-0.9, 1.88, 3.9], [-0.9, 1.6, -2.2], 47, 0],
  // s09 GALLA SHAAM: Raju counter ke peeche galla kholta hai; galla + Raju dono frame me (look beech me)
  s09: [[0.0, 1.9, 0.9], [-0.05, 1.35, -2.7], 46, 0, [0.0, 1.88, 0.7], [-0.05, 1.35, -2.7], 44, 0],
  // s10 NOTE GINNA: ginne wala note + galla close-up — Raju ka chehra is insert me frame se bahar reh sakta hai (haath/note hi hero hain, s05 jaisa)
  s10: [[0.1, 1.75, 0.2], [0.0, 1.35, -2.6], 50, 0, [0.1, 1.72, 0.1], [0.0, 1.35, -2.6], 49, 0],
  // s11 DEFLATION: Raju khaali galle me jhaankta hai — medium, halka push-in (look beech me, galla + chehra dono andar)
  s11: [[0.0, 1.85, 0.6], [-0.05, 1.35, -2.7], 48, 0, [0.0, 1.82, 0.5], [-0.05, 1.35, -2.7], 47, 0],
  // s12 ₹3,500 CHHOTA: chhota tag + chhota note-dher close-up — chehra is insert me bahar reh sakta hai (tag/dher hi hero hain)
  s12: [[0.35, 1.65, 0.4], [0.4, 1.3, -2.5], 46, 0, [0.35, 1.62, 0.2], [0.4, 1.3, -2.5], 44, 0],
  // s13 SAWAL CLOSEUP: Raju ka chehra bada — push-in (dukaan, counter ke peeche, s 1.5); end me bhi chehra poora andar (camera zyada peeche)
  s13: [[0.0, 2.3, 0.6], [-0.2, 2.2, -3.0], 42, 0, [0.0, 2.25, 0.1], [-0.2, 2.2, -3.0], 40, 0],
  // s14 SUIT AATA HAI: graahak darwaze se aata hai (z -4.0 → -2.6), Raju left me dekhta hai
  s14: [[-1.0, 1.9, 2.6], [-1.1, 1.5, -3.0], 50, 0, [-1.0, 1.88, 2.5], [-1.0, 1.5, -3.0], 48, 0],
  // s15 SUIT REVEAL GLOW: suit close-up + "₹350" tag; Raju peeche right me smile karta dikhe (look end me right shift; end camera thoda peeche)
  s15: [[-0.6, 1.8, 1.4], [-0.5, 1.5, -2.2], 48, 0, [-0.6, 1.78, 1.1], [-0.3, 1.5, -2.2], 46, 0],
  // s16 20 SUIT KA DHER: wide — dher (x -0.6..1.2) + Raju peeche left, sab frame me (end look thoda left)
  s16: [[0.3, 2.2, 3.4], [0.3, 1.2, -2.8], 52, 0, [0.3, 2.15, 3.0], [0.15, 1.2, -2.8], 50, 0],
  // s17 PROUD MEDIUM: Raju centre-left, dher peeche right — static, halka push-in
  s17: [[-0.2, 1.9, 2.8], [-0.1, 1.5, -2.7], 50, 0, [-0.2, 1.88, 2.5], [-0.1, 1.5, -2.7], 48, 0],
  // s18 MANAGER HANSI: manager close-up (x 2.9) + Raju side me shaant (x 1.4) — camera peeche + chauda, dono chehre andar
  s18: [[2.3, 2.0, 2.6], [2.15, 1.7, -2.6], 52, 0, [2.3, 1.98, 2.3], [2.15, 1.7, -2.6], 50, 0],
  // s19 COUNTER PULL-BACK: counter board close se shuru → pull-back wide: board + Raju + suit pahaad (rack) sab end par frame me
  s19: [[0.3, 1.9, 0.2], [0.5, 1.5, -2.8], 44, 0, [0.3, 2.4, 3.0], [-0.3, 1.3, -2.9], 56, 0],
  // s20 NOTEBOOK: page poora frame me (zoom + halka neeche pan, line 1 → line 2); page 1.1x0.8, camera door taaki kinare na katen (end z 1.2)
  s20: [[0.3, 1.6, 1.2], [0.3, 1.35, -2.2], 46, 0, [0.3, 1.55, 1.2], [0.35, 1.28, -2.2], 44, 0],
  // s21 TWO-SHOT: Raju (-1.5) + graahak (0.2) dono frame me; Raju suit ki taraf ishaara karta hai (camera peeche + chauda)
  s21: [[-0.6, 1.9, 3.4], [-0.65, 1.5, -1.9], 54, 0, [-0.6, 1.88, 3.1], [-0.65, 1.5, -1.9], 52, 0],
  // s22 ENDING TRAVELLING: sadak par lateral track (x 4.5 → -1.7) → Raju par settle — FIX run 2: end camera
  // peeche + chauda (z 1.6 → 4.0, fov 42 → 56) taaki peeche hook board ka "₹2,00,000" POORA + Raju ka chehra +
  // suit teeno freeze frame me andar aayein (f1210 me ₹ left edge se kata tha, suit chehra dhak raha tha).
  s22: [[4.5, 2.2, 3.0], [-1.0, 1.4, -1.8], 56, 0, [-1.7, 2.1, 4.0], [-1.6, 1.65, -1.9], 56, 0],
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
