// "Paani Wala" — FULL VIDEO FINAL (50.31s, 1509 frames @30fps). REBUILD v2 + gap-analysis fixes.
// Voice FINAL 50.31s (warp v4, TOTAL 1509f) — voice ko chheda NAHI; sirf shot boundaries move ki hain.
// Beats fixed hain (warp_out_v4 BEATS_NEW). Fix #10 (loop hold, warp v5) REJECTED — s44 0.97s hi rahega.
// Top-10 fixes applied: s01+s02 merge anchor 2.53s; ₹3 cut 115f; Deepak cut 123f; chaar-baje cut 210f;
// ₹30 cut 700f; aunty cut 1008f; shukriya cut 1120f; gin-raha cut 1353f; micro-splits s14b/s16b/s18b;
// s26 reaction cutaway; s27 over-shoulder; s28 TARP (reveal leak band); s29 tempo rukti;
// s34 tally-update "150 JAR = ₹2,700"; s37 diesel BILL; s42a white-flash (FLASH) + s42b Dutch zoom.
// 5-second rhythm: anchor ~2.5s, micro-beats 0.17–0.63s, saans+burst mix, har 5s block me device, withheld 80% tak.
// WITHHELD REVEAL: 150 jar kahan jaate hain — s30 tak chhupa (s28 tarp, s29 mod chhupa), sirf gate par khulta.
// SFX whoosh alignment: dopahar shift whoosh 19.38s = s19 start (579f); office reveal whoosh 22.56s = s22 start (674f).
// NUMBERS-AS-OBJECTS (max 2 board + tempo-side paint): s01 tempo side "₹60,000 MAHINA" frame 1 se;
// s03 jar droplet label ₹3; s11 haath me ₹20 note; s14b ghise jar par "₹9" chipka; s15 BOARD #1 chalkboard "₹12";
// s16b sikke ECU ₹8; s17 tempo side tally "50 GHAR = ₹400"; s23 reception glass "₹30";
// s34 tempo side tally-update "150 JAR = ₹2,700"; s35 gate jar-stack + sikke ₹18; s36 gine hue note ₹3,100;
// s37 diesel BILL kagaz; s39 bache note ₹2,000; s40 BOARD #2 depot deewaar painted sign "₹60,000" + jar pyramid.
// SAFAR-MAP (top-down, route line badhti): s09 30% (gaadi nikalna) / s19 65% (dopahar shift) / s30 100% (office reveal).
// QA: har shot ka camera UNIQUE (s42a/s42b ek hi beat ke do hisse hain — wahi frame se flash→zoom).
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 1509;

// ---------- shots: [id, a, b, set, env] ----------
// set: 'depot' (RO plant, left-third) | 'street' (geeli sadak/gali) | 'home' (ghar ka darwaza)
//      | 'gate' (office gate + 4 towers) | 'lobby' (office reception, glass)
// env: morning (subah, halka aqua) | day | noon (dopahar, tez safed) | evening (teal shaam/dusk)
export const SHOTS = [
  ['s01', 0, 76, 'street', 'morning'],   // ANCHOR MERGE (s01+s02, 2.53s): low-angle tempo tracking → Deepak closeup, tempo side "₹60,000 MAHINA" frame 1 se
  ['s03', 76, 115, 'depot', 'morning'],  // Jar ECU nal ke neeche, droplet label ₹3 — "sirf teen rupay" (109f) isi shot me
  ['s04', 115, 123, 'street', 'morning'],// MICRO 0.27s: Deepak smile, tempo peeche — "Deepak" (123f) agle shot me
  ['s05', 123, 161, 'depot', 'morning'], // "Iska naam Deepak hai" — depot gate par haath hilata, peeche drums
  ['s06', 161, 192, 'depot', 'morning'], // Jar ghumta "20 LITRE", plant worker jar bharta — 'ye bees litre wala jar hai'
  ['s07', 192, 210, 'home', 'morning'],  // Over-shoulder: darwaze par jar deta, rival hansta — "chaar baje" (220f) agle shot me
  ['s08', 210, 244, 'street', 'morning'],// Bhor: tempo headlight ON, Deepak start — 'Subah chaar baje' (220f) isi shot me
  ['s09', 244, 277, 'street', 'morning'],// SAFAR-MAP #1 (top-down): gaadi depot se nikli, route line 30% — 'gaadi nikalti hai' (8.24s)
  ['s10', 277, 308, 'home', 'morning'],  // Darwazon ki kataar par jar, 50-jar stack + "50 GHAR" tally — 'pachaas ghar'
  ['s11', 308, 342, 'home', 'morning'],  // ₹20 note haath me, darwaze par exchange closeup — 'Har jar bees rupay'
  ['s12', 342, 372, 'depot', 'day'],     // RO plant: jar dhul kar bharna, paani ki dhaar — 'Lekin paani teen rupay' (light shift PASS)
  ['s13', 372, 409, 'street', 'day'],    // Diesel can tempo par — 'dhulai-diesel'
  ['s14a', 409, 442, 'depot', 'day'],    // Dhulai + ghisa jar, toota jar side me
  ['s14b', 442, 447, 'depot', 'day'],    // MICRO 0.17s ₹9-JHATKA ECU: ghise jar par "₹9" chipka — "nau rupay" (442f)
  ['s15', 447, 476, 'depot', 'day'],     // BOARD #1: vertical chalkboard "₹12" RO plant par — 'kul baarah padte hain'
  ['s16a', 476, 492, 'depot', 'day'],    // Hatheli wide: Deepak ₹8 sikke ginta, pained
  ['s16b', 492, 504, 'depot', 'day'],    // MICRO 0.40s ₹8-ECU: sikke bade — "sirf aath" (500f) isi shot me
  ['s17', 504, 533, 'street', 'day'],    // Tempo side tally "50 GHAR = ₹400" — 'chaar sau rupay roz'
  ['s18a', 533, 560, 'depot', 'day'],    // Deepak doubtful closeup, sar tilt
  ['s18b', 560, 579, 'depot', 'day'],    // MICRO 0.63s SAWAL-CAMERA: Deepak seedha camera ki taraf, rival hansta — "itne se kya hoga?" (560f)
  ['s19', 579, 603, 'street', 'noon'],   // SAFAR-MAP #2 (top-down): DOPAHAR SHIFT (whoosh 19.38s), route line 65% — 'asli khel dopahar me tha'
  ['s20', 603, 636, 'street', 'noon'],   // Tempo office ki taraf, tracking + shake
  ['s21', 636, 674, 'depot', 'noon'],    // Jar match-cut spin plant par — 'Wahi jar, wahi paani'
  ['s22', 674, 700, 'gate', 'noon'],     // OFFICE REVEAL (whoosh 22.56s): gate + towers wide — "₹30" (700f) agle shot me
  ['s23', 700, 739, 'lobby', 'noon'],    // Over-shoulder: reception glass par ₹30, office wala deta — 'tees rupay ka bikta hai'
  ['s24', 739, 771, 'lobby', 'noon'],    // Office wala bhav-tol mana karta, thumbs up — 'koi bhav nahi karta'
  ['s25', 771, 801, 'lobby', 'noon'],    // Deepak seedha camera se, warm — 'Kal subah jab paani wala aaye'
  ['s26', 801, 834, 'lobby', 'noon'],    // REACTION CUTAWAY: office wala sunta hua (expression badalta) + desk par jar ECU — 'usse puchhna'
  ['s27', 834, 870, 'lobby', 'noon'],    // OVER-SHOULDER dono chehre: Deepak + peeche office wala — 'ek jar par kitna bachta hai?'
  ['s28', 870, 894, 'street', 'noon'],   // TARP: tempo dhaka hua — 200 jar NA dikhe (reveal leak band) — 'do sau jar' sirf bola jaye
  ['s29', 894, 935, 'street', 'noon'],   // Tempo gali ke mod par RUKTI (mod chhupa, suspense) — 'roz ghar nahi jaate'
  ['s30', 935, 975, 'gate', 'noon'],     // SAFAR-MAP #3 (top-down): route line 100%, tempo office pahuncha — WITHHELD REVEAL 'dedh sau jar sirf chaar office'
  ['s31', 975, 1008, 'gate', 'noon'],    // TOP-DOWN jar pyramid gate par (150 JAR), guard salute — aunty-line (1016f) agle shot me
  ['s32', 1008, 1061, 'home', 'noon'],   // Aunty bhav-tol, funny — 'bees rupay me bhi paanch rupay kam' (1016f) isi shot me
  ['s33', 1061, 1120, 'lobby', 'noon'],  // WARM HOLD 1.97s: office wala 'shukriya' (1100f) isi shot me khatam — 'tees dekar shukriya kehta hai'
  ['s34', 1120, 1148, 'street', 'noon'], // TALLY-UPDATE: tempo side paint badla "150 JAR = ₹2,700" (board zinda kagaz) — dead hold khatam
  ['s35', 1148, 1178, 'gate', 'evening'],// ₹18: gate par jar-stack + sikke (light shift PASS)
  ['s36', 1178, 1231, 'depot', 'evening'],// ₹3,100: gine hue note jar-stack counter par (1.77s anchor)
  ['s37', 1231, 1257, 'street', 'evening'],// DIESEL BILL: kagaz/receipt closeup + ladka diesel bharte hue (repeat object badla)
  ['s38', 1257, 1290, 'depot', 'evening'],// Ladka + toota jar + tankhwah ke note — 'do hazaar' (1289f) shot ke aakhri frame par (note: 2f shift warp v5 me)
  ['s39', 1290, 1329, 'depot', 'evening'],// ₹2,000: kharcha nikaal kar bache note
  ['s40', 1329, 1353, 'depot', 'evening'],// BOARD #2 FLASH 0.80s: depot deewaar painted sign "₹60,000" + jar pyramid, dusk — 'jar nahi gin raha' (1353f) agle shot me
  ['s41', 1353, 1407, 'depot', 'evening'],// Deepak jar ginta, rukta — 'Wo jar nahi gin raha tha' (1353f) isi shot me
  ['s42a', 1407, 1412, 'gate', 'evening'],// MICRO 0.17s WHITE-FLASH: "DUKAAN" (1409f) par jhatka (FLASH)
  ['s42b', 1412, 1445, 'gate', 'evening'],// TWIST: Dutch tilt + FREEZE (pehle 8f) + ZOOM FOV 52→36, rival SHOCK — 'wo dukaan gin raha tha'
  ['s43', 1445, 1480, 'depot', 'evening'],// Jar closeup, paani ki boond — 'Paani teen rupay ka tha'
  ['s44', 1480, 1509, 'street', 'morning'],// LOOP: STATIC freeze-hold wide, tempo jaati — 'keemat dukaan ki thi' (Fix #10 rejected: hold 0.97s hi)
];
const SHOTMAP = {}; SHOTS.forEach(([id, a, b, set, env]) => { SHOTMAP[id] = { id, a, b, set, env, len: b - a }; });
export const shotAt = (f) => {
  for (const [id, a, b] of SHOTS) if (f >= a && f < b) { const s = SHOTMAP[id]; return { ...s, u: clamp((f - a) / s.len) }; }
  const s = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...s, u: 1 };
};
// FLASH: white-flash device — { shotId: { at: peak frame, dur: frames } }. main.js flashPlane se render karta hai.
export const FLASH = { s42a: { at: 1409, dur: 6 } };

// ---------- set layout (har set apna local layout, centre ~ (0,0,-3)) ----------
// depot: deewaar left-third x=-2.2 (5.2 wide, z=-4.3); RO plant right x=1.6..4.2 (drums, steel tank, pipes, nal);
//   tin chhat + kaala tank upar; jar pyramid x=1.35; chalkboard x=-3.9 (s15 only); wall-sign x=-2.2 (s40 only).
// street: geeli sadak z=1.8 (x -8..8); puddles; ghar facades z=-4; lamp pole (2.9,,-1.1); ped (-5.4) & (5.8).
// home: ghar ki deewaar z=-3.8, darwaza x=-0.8, khidki x=1.6, seedhi, balti, ghada, house no. "12".
// gate: pillars x=+-1.6 z=-4, lohe ka gate, guard booth x=2.6, 4 towers z=-10, granite plaza.
// lobby: back wall z=-6, glass deewaar, reception desk (0,,-4.2), latakte lamp, lift doors x=2.5, plant.
export const CAMS = {
  // s01 ANCHOR: low-angle tempo tracking (y~0.65) → Deepak closeup + tempo side paint
  s01: [[-4.6, 0.7, 6.8], [-4.6, 1.0, 1.0], 55, 0, [-0.6, 0.85, 6.2], [-0.6, 1.05, 1.0], 52, 0],
  s03: [[0.35, 1.35, 0.4], [0.1, 1.0, -2.6], 40, 0, [0.3, 1.3, 0.2], [0.1, 1.0, -2.6], 38, 0],
  s04: [[-1.6, 1.75, 2.2], [-0.9, 1.2, -1.0], 46, 0, [-1.45, 1.72, 1.9], [-0.9, 1.2, -1.0], 44, 0],
  s05: [[-3.6, 1.85, 1.8], [-2.2, 1.35, -3.4], 50, 0, [-3.4, 1.8, 1.5], [-2.2, 1.35, -3.4], 48, 0],
  s06: [[0.5, 1.5, 0.9], [0.2, 1.05, -2.4], 43, 0, [0.45, 1.48, 0.65], [0.2, 1.05, -2.4], 41, 0],
  // s07 OVER-THE-SHOULDER: camera Deepak ke peeche se darwaze ki taraf
  s07: [[-2.9, 1.95, -0.6], [-1.4, 1.15, -3.6], 47, 0, [-2.75, 1.9, -0.9], [-1.35, 1.12, -3.6], 45, 0],
  s08: [[-1.0, 1.4, 3.6], [-3.4, 1.0, -0.6], 58, 0, [-0.8, 1.35, 3.2], [-3.2, 1.0, -0.6], 56, 0],
  // s09 SAFAR-MAP #1 top-down (route 30%)
  s09: [[0, 12.0, 1.2], [0, 0, -0.6], 52, 0, [0, 11.7, 0.9], [0, 0, -0.6], 50, 0],
  s10: [[0.9, 2.0, 3.4], [-1.2, 1.1, -3.0], 50, 0, [0.75, 1.95, 2.9], [-1.2, 1.1, -3.0], 49, 0],
  s11: [[0.1, 1.6, 1.7], [-0.9, 1.05, -3.0], 45, 0, [0.05, 1.58, 1.45], [-0.9, 1.05, -3.0], 43, 0],
  s12: [[1.9, 1.6, 0.6], [2.4, 1.0, -3.2], 44, 0, [1.8, 1.58, 0.4], [2.4, 1.0, -3.2], 42, 0],
  s13: [[-1.6, 1.6, 1.6], [-1.55, 0.9, -1.4], 42, 0, [-1.55, 1.58, 1.35], [-1.55, 0.9, -1.4], 40, 0],
  s14a: [[1.0, 1.6, 1.4], [1.2, 0.9, -2.8], 46, 0, [0.95, 1.58, 1.15], [1.2, 0.9, -2.8], 44, 0],
  // s14b ₹9-JHATKA ECU: ghisa jar frame bhar
  s14b: [[1.3, 1.35, 0.3], [1.5, 0.9, -2.7], 32, 0, [1.28, 1.33, 0.2], [1.5, 0.9, -2.7], 30, 0],
  // s15 BOARD #1 chalkboard: camera thoda side se, board frame ke andar (>=8% margin)
  s15: [[-2.6, 2.1, 0.6], [-3.9, 1.5, -3.6], 46, 0, [-2.45, 2.08, 0.35], [-3.9, 1.5, -3.6], 44, 0],
  s16a: [[-0.45, 1.5, 1.0], [-0.6, 1.05, -2.0], 38, 0, [-0.4, 1.48, 0.8], [-0.6, 1.05, -2.0], 36, 0],
  // s16b ₹8-ECU: sikke frame bhar
  s16b: [[-0.4, 1.35, 0.3], [-0.4, 1.0, -2.5], 30, 0, [-0.38, 1.33, 0.2], [-0.4, 1.0, -2.5], 28, 0],
  s17: [[-3.4, 1.9, 5.8], [-2.4, 0.95, 1.2], 48, 0, [-2.8, 1.85, 5.4], [-1.4, 0.95, 1.2], 47, 0],
  s18a: [[-0.7, 1.72, 1.0], [-0.6, 1.25, -1.8], 37, 0, [-0.65, 1.7, 0.78], [-0.6, 1.28, -1.8], 35, 0],
  // s18b SAWAL-CAMERA: Deepak seedha camera ki taraf (s18a se nazdeek + neeche)
  s18b: [[-0.6, 1.62, 0.85], [-0.6, 1.22, -1.8], 35, 0, [-0.58, 1.6, 0.7], [-0.6, 1.25, -1.8], 33, 0],
  // s19 SAFAR-MAP #2 top-down (route 65%)
  s19: [[0.3, 12.2, 1.5], [0, 0, -0.6], 52, 0, [0.25, 11.9, 1.2], [0, 0, -0.6], 50, 0],
  s20: [[-6.0, 1.7, 6.5], [-5.0, 1.0, 0.8], 46, 0, [-0.5, 1.7, 6.5], [1.0, 1.0, 0.8], 46, 0],
  s21: [[0.2, 1.5, 0.9], [0, 1.05, -2.4], 42, 0, [0.15, 1.48, 0.65], [0, 1.05, -2.4], 40, 0],
  s22: [[0.4, 2.0, 5.4], [0, 2.4, -6.0], 47, 0, [0.3, 1.8, 4.4], [0, 2.4, -6.0], 45, 0],
  // s23 OVER-THE-SHOULDER: Deepak ke kandhe ke upar se reception glass
  s23: [[-1.6, 1.9, -1.2], [0.3, 1.45, -4.6], 43, 0, [-1.5, 1.88, -1.4], [0.3, 1.45, -4.6], 41, 0],
  s24: [[0.3, 1.68, 0.8], [-0.2, 1.15, -4.0], 40, 0, [0.28, 1.66, 0.6], [-0.2, 1.15, -4.0], 38, 0],
  s25: [[-0.6, 1.66, 0.85], [-0.5, 1.25, -2.2], 37, 0, [-0.55, 1.64, 0.62], [-0.5, 1.28, -2.2], 35, 0],
  // s26 REACTION CUTAWAY: office wala sunta hua (camera us par)
  s26: [[0.45, 1.68, 0.8], [0.2, 1.15, -4.6], 40, 0, [0.4, 1.66, 0.55], [0.2, 1.15, -4.6], 38, 0],
  // s27 OVER-SHOULDER dono chehre: Deepak ke peeche se, office wala bhi frame me
  s27: [[1.4, 1.7, 1.2], [-0.2, 1.25, -4.5], 46, 0, [1.35, 1.68, 1.0], [-0.2, 1.25, -4.5], 44, 0],
  s28: [[1.2, 2.2, 5.8], [-3.0, 1.2, 0.0], 51, 0, [0.9, 2.05, 4.9], [-2.8, 1.15, 0.2], 49, 0],
  s29: [[-3.4, 2.05, 5.0], [-4.0, 1.0, 0.6], 53, 0, [-2.5, 1.9, 3.9], [-3.2, 1.0, 0.6], 51, 0],
  // s30 SAFAR-MAP #3 top-down (route 100%)
  s30: [[-0.3, 12.0, 1.0], [0, 0, -0.6], 52, 0, [-0.25, 11.7, 0.8], [0, 0, -0.6], 50, 0],
  // s31 TOP-DOWN jar pyramid: camera upar se neeche
  s31: [[0, 6.0, 1.8], [0.3, 0, -1.8], 46, 0, [0, 5.8, 1.5], [0.3, 0, -1.8], 44, 0],
  s32: [[-2.2, 1.5, 0.6], [-1.2, 1.05, -3.0], 46, 0, [-2.1, 1.48, 0.4], [-1.2, 1.05, -3.0], 44, 0],
  // s33 OVER-THE-SHOULDER (dusra): Deepak ke peeche se office wala
  s33: [[-0.6, 1.7, 1.2], [0.2, 1.25, -4.5], 42, 0, [-0.55, 1.68, 1.0], [0.2, 1.25, -4.5], 40, 0],
  // s34 TALLY-UPDATE: tempo side paint frame me (street) — camera tempo side par
  s34: [[-3.4, 1.9, 4.6], [-2.2, 1.0, 1.2], 48, 0, [-3.1, 1.85, 4.1], [-2.2, 1.0, 1.2], 46, 0],
  s35: [[1.1, 1.9, 0.9], [0.9, 0.9, -4.8], 45, 0, [1.0, 1.85, 0.6], [0.9, 0.9, -4.8], 43, 0],
  s36: [[0.3, 1.6, 0.7], [0.4, 1.0, -2.6], 40, 0, [0.25, 1.58, 0.5], [0.4, 1.0, -2.6], 38, 0],
  s37: [[-0.9, 1.3, 0.6], [-0.75, 1.1, -1.45], 40, 0, [-0.85, 1.28, 0.4], [-0.75, 1.1, -1.45], 38, 0],
  s38: [[1.5, 1.55, 0.7], [1.5, 0.9, -2.7], 41, 0, [1.4, 1.52, 0.5], [1.5, 0.9, -2.7], 39, 0],
  s39: [[0.2, 1.58, 0.8], [0.3, 1.0, -2.7], 40, 0, [0.15, 1.56, 0.58], [0.3, 1.0, -2.7], 38, 0],
  // s40 BOARD #2 wall-sign: depot deewaar + jar pyramid, dusk
  s40: [[-1.4, 2.3, 1.6], [-2.2, 1.9, -4.2], 48, 0, [-1.25, 2.25, 1.3], [-2.2, 1.9, -4.2], 46, 0],
  s41: [[-0.7, 1.68, 1.0], [-0.6, 1.2, -2.0], 38, 0, [-0.65, 1.66, 0.78], [-0.6, 1.22, -2.0], 36, 0],
  // s42a WHITE-FLASH: static, wahi frame (s42b se flash→zoom)
  s42a: [[0.6, 2.1, 6.6], [0, 4.2, -10.0], 52, 8, [0.6, 2.1, 6.6], [0, 4.2, -10.0], 52, 8],
  // s42b TWIST: Dutch tilt roll 8 -> 6 + FREEZE (pehle 8f, main.js) + ZOOM FOV 52 -> 36
  s42b: [[0.6, 2.1, 6.6], [0, 4.2, -10.0], 52, 8, [0.45, 1.9, 5.6], [0, 4.8, -10.0], 36, 6],
  s43: [[0.3, 1.45, 0.5], [-0.1, 1.0, -2.4], 41, 0, [0.25, 1.42, 0.3], [-0.1, 1.0, -2.4], 39, 0],
  // s44 LOOP: STATIC freeze-hold (camera bilkul na hile — Fix #10 rejected, hold 0.97s hi)
  s44: [[0.8, 3.2, 7.8], [-0.5, 1.5, -2.6], 54, 0, [0.8, 3.2, 7.8], [-0.5, 1.5, -2.6], 54, 0],
};
export const camFor = (shot, u) => {
  const c = CAMS[shot.id];
  const e = u * u * (3 - 2 * u); // smoothstep within the shot
  const L = (a, b) => a + (b - a) * e;
  const L3 = (a, b) => a.map((v, i) => L(v, b[i]));
  return { pos: L3(c[0], c[4]), look: L3(c[1], c[5]), fov: L(c[2], c[6]), roll: L(c[3], c[7]) };
};

// NO captions is build me — captionAt hamesha khaali.
export const captionAt = () => '';
