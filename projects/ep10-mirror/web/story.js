// "EP-10 Finale FULL — Ramesh ka din (Mirror kit + Gullak grammar)"
// NO CAPTIONS (user order). Sirf scenes, characters, scene-ke-andar signboards.
// Voice timing (voice_final.wav transcript se verified, 30fps):
// L1 0-215 Ramesh intro | L2 230-322 WhatsApp | L3 334-415 product
// L4 415-600 petrol/bottle | L5 612-697 toll | L6 712-882 burger/kiraya
// L7 882-1061 cinema | L8 1076-1218 Ola | L9 1235-1348 loan
// L10 1348-1493 agent | L11 1505-1571 raat | L12 1585-1662 loot har jagah
// L13 1669-1719 kagaz koi padhta nahi | L14 1719-1860 aakhri sawal
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 1864;

export const LINES = [[0, 215], [215, 322], [322, 415], [415, 600], [600, 697], [697, 882], [882, 1061], [1061, 1218], [1218, 1348], [1348, 1493], [1493, 1571], [1571, 1662], [1662, 1719], [1719, 1864]];

// ---------- shots: [id, a, b, set] — har shot <= 66 frames, contiguous ----------
// set: room | pump | home | toll | burger | cinema | car | door | night(home)
export const SHOTS = [
  ['s01', 0, 58, 'room'],     // L1 kamra wide, dheere pan — Ramesh utha, sukoon
  ['s02', 58, 118, 'room'],   // L1 dusra angle — calendar+khidki, stretch
  ['s03', 118, 180, 'room'],  // L1 push-in — "use kya pata tha"
  ['s04', 180, 230, 'room'],  // L1->L2 table par phone buzz
  ['s05', 230, 290, 'room'],  // L2 phone macro — "sab free hai bhai"
  ['s06', 290, 340, 'room'],  // L2/L3 Ramesh phone haath me, muskaan
  ['s07', 340, 395, 'room'],  // L3 phone screen: PRODUCT Ramesh
  ['s08', 395, 415, 'room'],  // L3 Ramesh darwaze ki taraf chala
  ['s09', 415, 478, 'pump'],  // L4 pump wide — PETROL PUMP board
  ['s10', 478, 530, 'pump'],  // L4 meter side angle — ₹ ginati chalti hui
  ['s11', 530, 560, 'home'],  // L4 ghar: bottle me tel naap raha hai
  ['s12', 560, 600, 'home'],  // L4 bottle MACRO — 1 LITRE / 940 ml + CHAUKA
  ['s13', 600, 648, 'toll'],  // L5 toll wide — TOLL PLAZA board, car, barrier uthta hai
  ['s14', 648, 697, 'toll'],  // L5 phone macro — FASTag do katauti messages
  ['s15', 697, 762, 'burger'], // L6 burger joint wide — counter + menu board + dost
  ['s16', 762, 824, 'burger'], // L6 counter medium — dost bolta hai, Ramesh khata hai
  ['s17', 824, 882, 'burger'], // L6 KIRAYA poster macro — building + ₹88,000 CRORE
  ['s18', 882, 944, 'cinema'], // L7 cinema wide — badi screen, seats, Ramesh + popcorn
  ['s19', 944, 1004, 'cinema'], // L7 Ramesh close — popcorn, screen ki roshni
  ['s20', 1004, 1061, 'cinema'], // L7 BILL macro — popcorn ticket se mehnga + chauka
  ['s21', 1061, 1122, 'car'],  // L8 car andar wide — driver aage, Ramesh peeche
  ['s22', 1122, 1178, 'car'],  // L8 driver close — bol raha hai
  ['s23', 1178, 1218, 'car'],  // L8 Ramesh sun raha hai — khidki se sheher beetta
  ['s24', 1218, 1272, 'home'], // L9 ghar — table par loan kagaz kholta hai
  ['s25', 1272, 1332, 'home'], // L9 kagaz MACRO — ₹50,00,000 / BYAAJ ₹95,00,000
  ['s26', 1332, 1348, 'home'], // L9 Ramesh sir pakda — pained reaction
  ['s27', 1348, 1408, 'door'], // L10 darwaza — ghanti, darwaza khulta hai, agent dikhta
  ['s28', 1408, 1462, 'door'], // L10 agent medium — "1 CRORE" kagaz aage, grin
  ['s29', 1462, 1493, 'door'], // L10 kagaz macro — andar COVER ₹7,00,000; chehre badle
  ['s30', 1493, 1556, 'night'], // L11 raat — khidki paas Ramesh, chaand roshni
  ['s31', 1556, 1618, 'night'], // L11/L12 table par bikhre kagaz — push-in
  ['s32', 1618, 1682, 'night'], // L12 Ramesh close — seekh wala bhaav
  ['s33', 1682, 1746, 'night'], // L13 kagaz uthata/padhta hai — roshni kagaz par
  ['s34', 1746, 1808, 'night'], // L14 Ramesh viewer ki taraf — aakhri sawal
  ['s35', 1808, 1864, 'night'], // L14 final wide — pull-back, khidki + chaand
];
const SHOTMAP = {}; SHOTS.forEach(([id, a, b, set]) => { SHOTMAP[id] = { id, a, b, set, len: b - a }; });
export const shotAt = (f) => {
  for (const [id, a, b] of SHOTS) if (f >= a && f < b) { const s = SHOTMAP[id]; return { ...s, u: clamp((f - a) / s.len) }; }
  const s = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...s, u: 1 };
};

// ---------- per-shot camera keys: [posA, lookA, fovA, rollA, posB, lookB, fovB, rollB] ----------
// Room world: back wall z=-3.2, bed left (-1.8,*,-1.5), Ramesh home pos (0.2,0,-0.8),
// calendar (1.9,2.75,-3.17), table (2.3,0,0.5) phone on top y~0.83, door right (3.6,*,-3.15).
// Pump world: machine (1.1,*,-0.8), canopy board y~3.15 z=0.42, attendant (2.1,0,-0.7).
// Home world: table centre (0,0,-0.2) top y=0.99, bottle (0,0.99,-0.05), Ramesh peeche z=-1.15.
// Toll world: gantry board (0,3.2,-1.6), booth (2.3,*,-1.0), car (-0.7,0,-0.9), barrier z=-1.6.
// Burger world: counter z=-0.9 (top y=1.05), menu board (0,2.6,-3.0), kiraya poster right wall x=3.15.
// Cinema world: screen (0,2.6,-6), seats rows z=-1.5/-0.2/1.1, Ramesh seat (1.1,-0.5,-0.1).
// Car world: dashboard z=-1.5, driver (-0.85,-0.42,-0.75), Ramesh (0.8,-0.3,0.75), windshield z=-1.9.
// Door world: darwaza centre (0.9,*,-2.2), agent bahar (0.9,0,-3.0), Ramesh andar (-0.9,0,-0.6).
export const CAMS = {
  s01: [[-3.6, 1.5, 7.8], [-0.2, 1.35, -1.0], 52, 0, [-2.4, 1.45, 7.1], [-0.1, 1.35, -1.0], 50, 0],   // room wide slow pan
  s02: [[3.8, 1.95, 6.2], [0.0, 1.5, -1.3], 47, 0, [3.3, 1.9, 5.6], [0.05, 1.5, -1.25], 45, 0],       // calendar side angle
  s03: [[0.35, 1.7, 4.7], [0.2, 1.45, -0.8], 44, 0, [0.28, 1.66, 3.1], [0.2, 1.48, -0.8], 39, 0],     // push-in
  s04: [[0.4, 1.6, 4.6], [1.9, 1.0, 0.4], 46, 0, [0.6, 1.55, 4.1], [1.95, 0.98, 0.42], 43, 0],      // Ramesh + table/phone dono frame me
  s05: [[2.32, 1.5, 2.3], [2.3, 0.8, 0.5], 36, 0, [2.31, 1.38, 1.6], [2.3, 0.82, 0.5], 32, 0],        // phone macro push
  s06: [[0.62, 1.62, 4.3], [0.25, 1.3, -0.6], 44, 0, [0.56, 1.58, 3.8], [0.25, 1.32, -0.6], 42, 0],   // Ramesh + phone medium
  s07: [[0.46, 1.42, 1.5], [0.48, 1.18, -0.28], 34, 0, [0.47, 1.39, 1.18], [0.5, 1.19, -0.28], 32, 0], // product screen macro
  s08: [[-0.6, 1.6, 7.0], [0.9, 1.3, -0.6], 48, 0, [-0.25, 1.56, 6.5], [1.0, 1.32, -0.6], 46, 0],    // chalta hua wide
  s09: [[-3.1, 1.9, 9.9], [0.5, 1.78, -0.7], 53, 0, [-2.7, 1.85, 9.1], [0.5, 1.75, -0.7], 50, 0],   // pump wide (board pura frame me)
  s10: [[3.0, 1.55, 4.15], [1.05, 1.05, -0.7], 42, 0, [2.7, 1.5, 3.55], [1.1, 1.06, -0.72], 38, 0],    // meter side angle
  s11: [[0.95, 1.72, 4.5], [0.0, 1.02, -0.3], 46, 0, [0.82, 1.68, 4.05], [0.0, 1.04, -0.3], 43, 0],   // bottle medium
  s12: [[0.55, 1.45, 3.15], [0.32, 1.3, -0.35], 40, 0, [0.52, 1.42, 2.75], [0.34, 1.31, -0.35], 38, 0], // bottle MACRO + shock chehra
  s13: [[-4.3, 2.1, 8.8], [0.1, 1.6, -1.0], 52, 0, [-3.7, 2.0, 7.9], [0.15, 1.58, -1.0], 50, 0],   // toll wide
  s14: [[0.12, 1.42, 2.75], [0.0, 1.12, 0.8], 35, 0, [0.06, 1.33, 2.25], [0.0, 1.1, 0.8], 32, 0],    // FASTag phone macro
  s15: [[0.0, 1.85, 7.7], [0.0, 1.6, -1.2], 52, 0, [0.0, 1.75, 6.9], [0.0, 1.58, -1.2], 50, 0],    // burger wide
  s16: [[1.2, 1.65, 5.3], [0.05, 1.32, -0.7], 46, 0, [1.0, 1.6, 4.6], [0.05, 1.34, -0.7], 44, 0], // counter medium
  s17: [[-0.55, 1.95, 0.75], [3.3, 1.9, -0.6], 44, 0, [-0.4, 1.93, 0.35], [3.3, 1.9, -0.6], 42, 0],   // kiraya poster macro
  s18: [[0.4, 1.95, 7.0], [0.0, 2.2, -4.0], 55, 0, [0.35, 1.9, 6.4], [0.0, 2.18, -4.0], 52, 0],    // cinema wide
  s19: [[1.55, 1.4, 3.6], [1.08, 0.98, 1.0], 42, 0, [1.45, 1.34, 3.0], [1.08, 1.0, 1.0], 39, 0], // Ramesh close popcorn
  s20: [[0.55, 1.5, 4.3], [0.5, 1.05, 1.3], 40, 0, [0.52, 1.44, 3.7], [0.5, 1.07, 1.3], 37, 0],    // bill macro
  s21: [[0.1, 1.78, 3.9], [0.02, 1.12, -0.7], 52, 0, [0.08, 1.74, 3.45], [0.02, 1.14, -0.7], 49, 0],  // car wide
  s22: [[-0.3, 1.47, 1.2], [-0.85, 1.12, -0.75], 40, 0, [-0.4, 1.43, 0.82], [-0.85, 1.14, -0.75], 37, 0], // driver close
  s23: [[0.32, 1.42, 2.65], [0.8, 1.08, 0.75], 40, 0, [0.4, 1.38, 2.25], [0.8, 1.1, 0.75], 37, 0],  // Ramesh close car
  s24: [[1.5, 1.72, 3.9], [0.0, 1.08, -0.4], 44, 0, [1.35, 1.64, 3.4], [0.0, 1.1, -0.4], 42, 0],    // loan kagaz medium (home)
  s25: [[1.3, 2.0, 1.55], [0.52, 1.0, 0.02], 38, 0, [1.18, 1.88, 1.3], [0.52, 1.0, 0.02], 36, 0], // loan kagaz MACRO
  s26: [[0.55, 1.5, 3.0], [0.3, 1.3, -1.1], 42, 0, [0.5, 1.47, 2.7], [0.3, 1.31, -1.1], 40, 0],     // Ramesh pained close
  s27: [[-1.85, 1.62, 4.7], [0.62, 1.25, -2.2], 48, 0, [-1.65, 1.57, 4.15], [0.62, 1.27, -2.2], 46, 0], // darwaza wide
  s28: [[0.1, 1.62, 3.1], [0.55, 1.25, -2.3], 46, 0, [0.08, 1.57, 2.6], [0.55, 1.26, -2.3], 43, 0],   // agent medium + kagaz
  s29: [[0.2, 1.5, 2.2], [0.15, 1.2, -0.9], 40, 0, [0.17, 1.45, 1.8], [0.15, 1.21, -0.9], 38, 0], // policy fine-print macro
  s30: [[-0.35, 1.62, 4.9], [-0.9, 1.4, -1.6], 46, 0, [-0.5, 1.57, 4.35], [-0.9, 1.41, -1.6], 44, 0], // raat khidki wide
  s31: [[1.65, 2.25, 3.5], [0.0, 1.0, -0.2], 44, 0, [1.38, 2.02, 2.85], [0.0, 1.01, -0.2], 40, 0],  // bikhre kagaz push-in
  s32: [[-1.12, 1.52, 1.65], [-1.5, 1.35, -1.6], 40, 0, [-1.18, 1.48, 1.18], [-1.5, 1.36, -1.6], 37, 0], // Ramesh night close
  s33: [[0.98, 1.62, 2.25], [0.22, 1.05, -0.3], 40, 0, [0.88, 1.52, 1.75], [0.22, 1.06, -0.3], 37, 0], // kagaz uthata hai
  s34: [[1.2, 1.85, 2.7], [0.8, 1.35, -0.8], 42, 0, [1.12, 1.8, 2.45], [0.8, 1.36, -0.8], 40, 0],  // aakhri sawal medium
  s35: [[-2.7, 2.05, 7.8], [-0.7, 1.5, -1.2], 50, 0, [-2.2, 1.92, 6.5], [-0.7, 1.51, -1.2], 47, 0],  // final pull-back
};
export const camFor = (shot, u) => {
  const c = CAMS[shot.id];
  const e = u * u * (3 - 2 * u); // smoothstep within the shot
  const L = (a, b) => a + (b - a) * e;
  const L3 = (a, b) => a.map((v, i) => L(v, b[i]));
  return { pos: L3(c[0], c[4]), look: L3(c[1], c[5]), fov: L(c[2], c[6]), roll: L(c[3], c[7]) };
};
