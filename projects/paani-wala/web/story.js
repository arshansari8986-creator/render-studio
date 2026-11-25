// "Paani Wala" — FULL VIDEO (50.31s, 1509 frames @30fps). Gullak density.
// Voice: Paani_Voice_Final.wav (50.31s, Fenrir). Word timings:
// shorts/paani-wala/voice/words_chunked_v4.json se verified (50.31s warp).
// Beats: hook saath hazaar 0.00 | saath hazaar zor 1.26 | sirf teen rupay 3.64 | Deepak 4.09 | bees litre jar 5.66 | subah chaar baje 7.32 | gaadi 8.24 | pachaas ghar 8.86 | har jar bees rupay 10.56 | paani teen rupay 11.78 | nau rupay 14.74 | kul baarah 15.54 | sirf aath 16.68 | chaar sau roz 17.16 | itne se kya hoga? 18.66 | asli khel dopahar 19.80 | wahi jar, wahi paani 21.62 | office tees rupay 23.34 | koi bhav nahi 24.64 | kal subah jab paani wala aaye 25.72 | usse puchhna 27.22 | kitna bachta hai 27.98 | do sau jar 29.47 | dedh sau jar sirf chaar office 31.56 | aunty paanch rupay kam 33.86 | office wala shukriya 36.68 | aathrah rupay 38.62 | kul teen hazaar ek sau 40.14 | do hazaar 42.96 | mahine ke saath hazaar 44.16 | jar nahi gin raha tha 45.10 | DUKAAN 46.98 | paani teen rupay ka tha 48.06 | keemat dukaan ki thi 49.30.
// WITHHELD REVEAL: 150 jar kahan jaate hain — s30 tak chhupa, sirf office me khulta.
// Roshni se samay: subah (sunehra) -> din -> dopahar (tez) -> shaam (garam) -> subah (loop).
// QA: board push-ins me camera peeche / FOV chauda — board text frame kinare se
// kabhi nahi kata (≥8% margin). Khaali frame nahi — har scene me 2-3 side harkatein.
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 1509;

// ---------- shots: [id, a, b, set, env] ----------
// set: 'gali' (mohalla + depot) | 'office' (office building + lobby)
// env: morning (subah, sunehra) | day | noon (dopahar, tez safed) | evening (shaam, garam)
export const SHOTS = [
  ['s01', 0, 38, 'gali', 'morning'],      // BOARD ECU "₹60,000 MAHINA" push-in, chamak — hook
  ['s02', 38, 76, 'gali', 'morning'],     // Deepak BIG closeup grin, jar haath me — 'saath hazaar'
  ['s03', 76, 109, 'gali', 'morning'],    // Jar ECU + paani ki boond — 'paani to sirf teen rupay ka tha'
  ['s04', 109, 133, 'gali', 'morning'],   // Deepak smile, peeche tempo — naam ki taraf
  ['s05', 133, 161, 'gali', 'morning'],   // "Iska naam Deepak hai" — Deepak haath hilata, tempo board "DEEPAK PAANI SEVA"
  ['s06', 161, 192, 'gali', 'morning'],   // Jar ghumta, "20 LITRE" mark — 'ye bees litre wala jar hai'
  ['s07', 192, 220, 'gali', 'morning'],   // Ghar ke darwaze, Deepak jar deta — 'har ghar me aata hai'
  ['s08', 220, 244, 'gali', 'morning'],   // Bhor: tempo ki headlight, Deepak start — 'Subah chaar baje'
  ['s09', 244, 277, 'gali', 'morning'],   // Tempo chalti, side tracking, jar bhare — 'gaadi nikalti hai'
  ['s10', 277, 308, 'gali', 'morning'],   // Darwazon par jar, tally "50 GHAR" — 'pachaas ghar jar pahunchati hai'
  ['s11', 308, 342, 'gali', 'morning'],   // ₹20 note + jar exchange closeup — 'Har jar bees rupay ka bikta hai'
  ['s12', 342, 372, 'gali', 'day'],       // Paani ki boond board "₹3 PAANI" — 'Lekin paani teen rupay'
  ['s13', 372, 409, 'gali', 'day'],       // Diesel can + tempo — 'dhulai-diesel'
  ['s14', 409, 447, 'gali', 'day'],       // Dhulai + ghisa jar — 'jar ki ghisai nau rupay'
  ['s15', 447, 476, 'gali', 'day'],       // Board "KUL ₹12" — 'kul baarah padte hain'
  ['s16', 476, 504, 'gali', 'day'],       // Deepak ₹8 ginta, deflation pained — 'bachte hain sirf aath'
  ['s17', 504, 533, 'gali', 'day'],       // Tally board "50 GHAR = ₹400" — 'Pachaas ghar, chaar sau rupay roz'
  ['s18', 533, 579, 'gali', 'day'],       // Deepak doubtful closeup, sar tilt — 'itne se kya hoga?' + pause
  ['s19', 579, 603, 'gali', 'noon'],      // Roshni badli dopahar, conspiratorial — 'Lekin asli khel...'
  ['s20', 603, 636, 'gali', 'noon'],      // Tempo mudti, suraj upar — 'asli khel dopahar me tha'
  ['s21', 636, 674, 'gali', 'noon'],      // Jar match-cut spin — 'Wahi jar, wahi paani'
  ['s22', 674, 713, 'office', 'noon'],    // Office building wide reveal — 'office me tees rupay'
  ['s23', 713, 739, 'office', 'noon'],    // Office wala ₹30 deta, smile — 'tees rupay ka bikta hai'
  ['s24', 739, 771, 'office', 'noon'],   // Office wala bhav-tol mana karta, thumbs up — 'koi bhav nahi karta'
  ['s25', 771, 801, 'office', 'noon'],  // Deepak seedha camera se, warm — 'Kal subah jab paani wala aaye'
  ['s26', 801, 834, 'office', 'noon'],  // Ungli se ishara — 'usse puchhna'
  ['s27', 834, 870, 'office', 'noon'],  // Deepak curious closeup — 'ek jar par kitna bachta hai?'
  ['s28', 870, 894, 'gali', 'noon'],    // Tempo jar se bhari wide — 'Isiliye Deepak ke do sau jar'
  ['s29', 894, 935, 'gali', 'noon'],    // Tempo gharon se mudti — 'roz ghar nahi jaate'
  ['s30', 935, 975, 'office', 'noon'],  // 4 office blocks, jar behte — 'dedh sau jar sirf chaar office' (REVEAL)
  ['s31', 975, 1016, 'office', 'noon'],  // Office gate jar pyramid, guard salute — 'chaar office me jaate hain'
  ['s32', 1016, 1061, 'gali', 'noon'],    // Aunty bhav-tol, funny — 'bees rupay me bhi paanch rupay kam'
  ['s33', 1061, 1105, 'office', 'noon'],  // Office wala 'shukriya' warm — 'tees dekar shukriya kehta hai'
  ['s34', 1105, 1148, 'office', 'noon'],  // Deepak smile_closed, sochta — contrast hold
  ['s35', 1148, 1178, 'gali', 'evening'], // Board "150 × ₹18" — 'Dedh sau jar par aathrah rupay bachat'
  ['s36', 1178, 1231, 'gali', 'evening'], // Board "₹3,100 ROZ" drumbeat — 'kul teen hazaar ek sau roz'
  ['s37', 1231, 1257, 'gali', 'evening'], // Diesel can closeup — 'diesel'
  ['s38', 1257, 1290, 'gali', 'evening'], // Ladka + toota jar — 'ladka-toote jar nikaal kar'
  ['s39', 1290, 1329, 'gali', 'evening'], // Board "₹2,000 ROZ" — 'do hazaar bachte hain'
  ['s40', 1329, 1366, 'gali', 'evening'], // Board "₹60,000 MAHINA" BIG gold glints — 'mahine ke saath hazaar' (climax)
  ['s41', 1366, 1407, 'gali', 'evening'], // Deepak jar ginta, rukta — 'Wo jar nahi gin raha tha'
  ['s42', 1407, 1445, 'office', 'evening'], // TWIST: slow push 4 office buildings — 'wo dukaan gin raha tha'
  ['s43', 1445, 1480, 'gali', 'evening'], // Jar closeup, paani ki boond — 'Paani teen rupay ka tha'
  ['s44', 1480, 1509, 'gali', 'morning'], // LOOP wide: subah gali, tempo jaati (s07 rhyme) — 'keemat dukaan ki thi'
];
const SHOTMAP = {}; SHOTS.forEach(([id, a, b, set, env]) => { SHOTMAP[id] = { id, a, b, set, env, len: b - a }; });
export const shotAt = (f) => {
  for (const [id, a, b] of SHOTS) if (f >= a && f < b) { const s = SHOTMAP[id]; return { ...s, u: clamp((f - a) / s.len) }; }
  const s = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...s, u: 1 };
};
export const FLASH = {};

// ---------- set layout ----------
// gali: sadak z 0.2..3.4 (centre 1.8); footpath z -1.9..0.2; depot deewaar z=-4.3.
//   Depot centre x=0: board (0,3.02,-2.38) 1.9x1.05; counter (0,,-3.0);
//   jarstack (1.35,,-3.0); tempo parked (-5.6,,-2.8) — far left-back corner, kisi closeup ki sightline me nahi;
//   Chai stall x=3.6; kirana shutter x=-3.9. Ped (-5.4,,-3.2) & (5.8,,-3.0); street light (2.9,,-1.1).
// office: building facade z=-6.5; glass door (0,,-6.4); reception counter (0,,-4.6);
//   4 towers x=-6,-2,2,6 z=-10; plant (-1.6,,-5.2); guard (2.2,,-5.2).
export const CAMS = {
  s01: [[0, 2.72, 2.3], [0, 2.72, -2.3], 52, 0, [0, 2.72, 0.9], [0, 2.72, -2.3], 56, 0],
  s02: [[-0.55, 1.68, 0.9], [-0.55, 1.25, -1.6], 38, 0, [-0.5, 1.66, 0.55], [-0.55, 1.28, -1.6], 36, 0],
  s03: [[0.1, 1.5, 1.2], [-0.1, 1.0, -2.2], 42, 0, [0.05, 1.45, 0.9], [-0.1, 1.0, -2.2], 40, 0],
  s04: [[-0.9, 1.7, 1.6], [-0.7, 1.2, -1.4], 44, 0, [-0.8, 1.68, 1.3], [-0.7, 1.2, -1.4], 42, 0],
  s05: [[-1.1, 1.72, 1.4], [-1.0, 1.2, -1.6], 40, 0, [-1.0, 1.7, 1.1], [-1.0, 1.22, -1.6], 38, 0],
  s06: [[0.05, 1.55, 1.1], [0, 1.05, -2.0], 42, 0, [0, 1.5, 0.85], [0, 1.05, -2.0], 40, 0],
  s07: [[-2.2, 1.9, 2.6], [-2.7, 1.15, -2.8], 52, 0, [-2.0, 1.85, 2.2], [-2.6, 1.12, -2.8], 50, 0],
  s08: [[-3.0, 1.6, 3.4], [-2.8, 1.1, -2.0], 60, 0, [-2.8, 1.55, 3.0], [-2.7, 1.05, -1.9], 58, 0],
  s09: [[-3.4, 2.1, 4.6], [-1.2, 1.15, 0.0], 52, 0, [-2.6, 1.9, 3.6], [0.5, 1.15, 1.0], 50, 0],
  s10: [[0.4, 1.9, 3.6], [-0.5, 1.2, -2.6], 49, 0, [0.3, 1.85, 3.0], [-0.5, 1.2, -2.6], 48, 0],
  s11: [[0.15, 1.6, 1.5], [-0.1, 1.1, -2.5], 44, 0, [0.12, 1.58, 1.25], [-0.1, 1.1, -2.5], 42, 0],
  s12: [[0.2, 1.9, 2.2], [0, 2.1, -2.4], 48, 0, [0.1, 1.95, 1.9], [0, 2.1, -2.4], 48, 0],
  s13: [[-1.3, 1.6, 1.0], [-1.5, 0.9, -1.8], 42, 0, [-1.2, 1.58, 0.75], [-1.5, 0.9, -1.8], 40, 0],
  s14: [[0.9, 1.6, 1.0], [1.2, 0.9, -2.6], 42, 0, [0.85, 1.58, 0.75], [1.2, 0.9, -2.6], 40, 0],
  s15: [[0.3, 2.6, 2.6], [0, 2.72, -2.3], 48, 0, [0.15, 2.68, 1.9], [0, 2.72, -2.3], 48, 0],
  s16: [[-0.6, 1.68, 0.95], [-0.6, 1.2, -1.9], 38, 0, [-0.55, 1.66, 0.7], [-0.6, 1.22, -1.9], 36, 0],
  s17: [[0.3, 2.6, 2.6], [0, 2.72, -2.3], 48, 0, [0.15, 2.68, 1.9], [0, 2.72, -2.3], 48, 0],
  s18: [[-0.55, 1.7, 0.9], [-0.55, 1.25, -1.6], 38, 0, [-0.5, 1.68, 0.65], [-0.55, 1.28, -1.6], 36, 0],
  s19: [[-0.4, 1.85, 2.6], [-0.5, 1.3, -1.8], 48, 0, [-0.35, 1.8, 2.2], [-0.5, 1.3, -1.8], 47, 0],
  s20: [[-3.0, 2.1, 4.6], [-1.2, 1.15, 0.4], 52, 0, [-2.4, 1.9, 3.6], [0.4, 1.15, 1.4], 50, 0],
  s21: [[0.05, 1.55, 1.1], [0, 1.05, -2.0], 42, 0, [0, 1.5, 0.85], [0, 1.05, -2.0], 40, 0],
  s22: [[0.3, 1.9, 5.0], [0, 2.2, -6.5], 48, 0, [0.25, 1.7, 4.2], [0, 2.2, -6.5], 46, 0],
  s23: [[0.35, 1.7, 1.3], [0.2, 1.15, -4.4], 42, 0, [0.3, 1.68, 1.0], [0.2, 1.15, -4.4], 40, 0],
  s24: [[-0.3, 1.68, 1.2], [-0.2, 1.15, -4.4], 40, 0, [-0.25, 1.66, 0.95], [-0.2, 1.15, -4.4], 38, 0],
  s25: [[-0.5, 1.68, 0.9], [-0.5, 1.25, -2.0], 38, 0, [-0.45, 1.66, 0.65], [-0.5, 1.28, -2.0], 36, 0],
  s26: [[-0.55, 1.7, 1.0], [-0.55, 1.2, -2.0], 38, 0, [-0.5, 1.68, 0.75], [-0.55, 1.22, -2.0], 36, 0],
  s27: [[-0.5, 1.68, 0.9], [-0.5, 1.25, -1.8], 38, 0, [-0.45, 1.66, 0.65], [-0.5, 1.28, -1.8], 36, 0],
  s28: [[0.9, 2.1, 5.6], [-2.9, 1.3, 0.2], 50, 0, [0.6, 1.95, 4.8], [-2.7, 1.25, 0.0], 48, 0],
  s29: [[-3.2, 2.1, 4.8], [-1.2, 1.15, 0.2], 52, 0, [-2.6, 1.9, 3.8], [0.4, 1.15, 1.0], 50, 0],
  s30: [[0.5, 2.2, 7.2], [0, 4.5, -9.0], 54, 0, [0.35, 2.0, 6.2], [0, 5.0, -9.0], 52, 0],
  s31: [[0.6, 1.9, 3.4], [0.3, 1.3, -5.4], 48, 0, [0.45, 1.85, 2.9], [0.3, 1.3, -5.4], 47, 0],
  s32: [[-2.5, 1.75, 1.5], [-2.7, 1.2, -3.2], 42, 0, [-2.4, 1.72, 1.2], [-2.65, 1.18, -3.2], 40, 0],
  s33: [[0.3, 1.68, 1.1], [0.2, 1.15, -4.4], 40, 0, [0.25, 1.66, 0.85], [0.2, 1.15, -4.4], 38, 0],
  s34: [[-0.5, 1.7, 1.3], [-0.5, 1.25, -2.2], 42, 0, [-0.45, 1.68, 1.0], [-0.5, 1.25, -2.2], 40, 0],
  s35: [[0.3, 2.6, 2.6], [0, 2.72, -2.3], 48, 0, [0.15, 2.68, 1.9], [0, 2.72, -2.3], 48, 0],
  s36: [[0.3, 2.6, 2.6], [0, 2.72, -2.3], 48, 0, [0.15, 2.68, 1.9], [0, 2.72, -2.3], 48, 0],
  s37: [[-1.3, 1.6, 1.0], [-1.5, 0.9, -1.8], 42, 0, [-1.2, 1.58, 0.75], [-1.5, 0.9, -1.8], 40, 0],
  s38: [[0.9, 1.6, 1.0], [1.2, 0.9, -2.6], 42, 0, [0.85, 1.58, 0.75], [1.2, 0.9, -2.6], 40, 0],
  s39: [[0.3, 2.6, 2.6], [0, 2.72, -2.3], 48, 0, [0.15, 2.68, 1.9], [0, 2.72, -2.3], 48, 0],
  s40: [[0.35, 2.66, 1.95], [0, 2.72, -2.3], 48, 0, [0.18, 2.7, 1.7], [0, 2.72, -2.3], 48, 0],
  s41: [[-0.6, 1.68, 0.95], [-0.6, 1.2, -1.9], 38, 0, [-0.55, 1.66, 0.7], [-0.6, 1.22, -1.9], 36, 0],
  s42: [[0.5, 2.0, 6.8], [0, 4.0, -10.0], 52, 0, [0.35, 1.8, 5.8], [0, 4.8, -10.0], 50, 0],
  s43: [[0.1, 1.5, 1.2], [-0.1, 1.0, -2.2], 42, 0, [0.05, 1.45, 0.9], [-0.1, 1.0, -2.2], 40, 0],
  s44: [[0.6, 3.1, 7.6], [0, 1.55, -3.2], 53, 0, [0.35, 2.1, 6.0], [0, 1.55, -3.2], 50, 0],
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
