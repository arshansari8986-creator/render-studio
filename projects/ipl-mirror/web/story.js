// "IPL — Ek Ball 49 Lakh" — Mirror kit + Gullak grammar, PROFESSIONAL level.
// NO CAPTIONS (user order). Sirf scenes, characters, scene-ke-andar boards/screens.
// Voice timing (voice_final.wav verified starts, 30fps):
// L1 0 | L2 94 | L3 129 | L4 320 | L5 356 | L6 390 | L7 567 | L8 741 | L9 940
// L10 1035 | L11 1127 | L12 1256 | L13 1351 | END 1494 (49.78s)
// ⚠️ GATI: har shot 30-60 frames (1-2s). ⚠️ CAMERA: har shot alag disha+angle,
//    lagatar same angle NAHI, camera kabhi static nahi.
// ⚠️ SAFE-FRAME: boards/screens/chehre kinare se kate NAHI — CAMS usi hisaab se.
// ⚠️ WITHHELD REVEAL: paisa deta kaun hai — sirf L10-11 (s28-s32) me khulta hai.
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 1494;

export const LINES = [[0, 94], [94, 129], [129, 320], [320, 356], [356, 390], [390, 567], [567, 741], [741, 940], [940, 1035], [1035, 1127], [1127, 1256], [1256, 1351], [1351, 1494]];

// ---------- shots: [id, a, b, set, env?] ----------
// set: stadium | home | old | auction | office ; env default = set
export const SHOTS = [
  ['s01', 0, 31, 'stadium'],              // L1 SCREEN MACRO kone — "EK BALL = ₹49,00,000?" (PEHLA FRAME HOOK)
  ['s02', 31, 62, 'stadium'],             // L1 TOP-DOWN AERIAL — poora stadium, camera utarta hua
  ['s03', 62, 94, 'stadium'],             // L1 LOW-ANGLE pitch wide — floodlights + bheed leher
  ['s04', 94, 129, 'home'],               // L2 KONE se medium — ladka point, dost smile
  ['s05', 129, 167, 'stadium'],           // L3 SIDE low — bowler run-up + release
  ['s06', 167, 205, 'stadium'],           // L3 BALL TRACK — camera ball ke saath, counter board saath
  ['s07', 205, 243, 'stadium'],           // L3 TOP-DOWN pitch — ball bounce, fielder rokta hai
  ['s08', 243, 281, 'stadium'],           // L3 PEECHE se — bheed ke upar screen, counter chadhta
  ['s09', 281, 320, 'stadium'],           // L3 SCREEN MACRO — counter ₹49,00,000 par rukta, cheer
  ['s10', 320, 356, 'home'],              // L4 SAAMNE close push-in — ladka SHOCK, dost peeche LAUGH
  ['s11', 356, 390, 'home'],              // L5 TOP-DOWN desk — HISAAB kagaz + pen, ladka point
  ['s12', 390, 434, 'old'],               // L6 WIDE faded kamra — CRT TV, purana mahaul, dolly-in
  ['s13', 434, 478, 'old'],               // L6 CRT MACRO — screen par 2008 + match + static
  ['s14', 478, 522, 'old'],               // L6 KONE se board — "₹8,200 CRORE"
  ['s15', 522, 567, 'old'],               // L6 SAAMNE board — "POORE 10 SAAL KE LIYE" + ghadi
  ['s16', 567, 611, 'auction'],           // L7 UNCHA KONE wide — sunehra hall, bidders, stage
  ['s17', 611, 655, 'auction'],           // L7 SIDE — bidders ke haath uthte hue, paddles
  ['s18', 655, 698, 'auction'],           // L7 GAVEL MACRO — gavel + peeche board counter
  ['s19', 698, 741, 'auction'],           // L7 SAAMNE LOW — board "₹48,390 CRORE" + "SIRF 5 SAAL"
  ['s20', 741, 781, 'stadium'],           // L8 LOW-ANGLE screen — "EK MATCH = ₹118 CRORE"
  ['s21', 781, 821, 'stadium'],           // L8 SAAMNE screen — "1 OVER = ₹3 CRORE" + 6 ball dots
  ['s22', 821, 861, 'stadium'],           // L8 BALL MACRO — ghumti ball + counter tik-tik final
  ['s23', 861, 900, 'home'],              // L8 TOP-DOWN desk — kagaz par seedhi likhti jaati
  ['s24', 900, 940, 'home'],              // L8 SIDE close — dost SOCH me (cheek), ladka smile_closed
  ['s25', 940, 972, 'home', 'homeDark'],  // L9 KONE slow push — roshni bujhti, TV neeli chamak
  ['s26', 972, 1004, 'home', 'homeDark'], // L9 LADKA close — stern shaant, suspense
  ['s27', 1004, 1035, 'home', 'homeDark'],// L9 TV MACRO andhera — "PAISA DETA KAUN HAI?"
  ['s28', 1035, 1081, 'office', 'officeD'], // L10 SAAMNE screen — COMPANY → BCCI paisa flow (REVEAL)
  ['s29', 1081, 1127, 'office', 'officeD'], // L10 PEECHE-UNCHA — BCCI board par rakam full
  ['s30', 1127, 1170, 'home'],            // L11 BILL MACRO — subscription kagaz haath me
  ['s31', 1170, 1213, 'home'],            // L11 TV AD kone — naachta SABUN ad, dono dekhte
  ['s32', 1213, 1256, 'home'],            // L11 SIDE two-shot — ladka receipt, dost SHOCK
  ['s33', 1256, 1303, 'stadium'],         // L12 BALL callback — ball hawa me + counter, cheer
  ['s34', 1303, 1351, 'home'],            // L12 LOW-ANGLE — ladka jeb dekhta smile_closed, dost DAZED chup
  ['s35', 1351, 1398, 'stadium'],         // L13 SCREEN — "₹70,000 CRORE?" YA "₹1,00,000 CRORE?"
  ['s36', 1398, 1446, 'home'],            // L13 KONE 3/4 — ladka viewer ki taraf POINT, shaant smile
  ['s37', 1446, 1494, 'stadium', 'stadiumSunset'], // L13 PEECHE-UPAR WIDE PULL-BACK — sunset + TEASE board
];
const SHOTMAP = {}; SHOTS.forEach(([id, a, b, set, env]) => { SHOTMAP[id] = { id, a, b, set, env, len: b - a }; });
export const shotAt = (f) => {
  for (const [id, a, b] of SHOTS) if (f >= a && f < b) { const s = SHOTMAP[id]; return { ...s, u: clamp((f - a) / s.len) }; }
  const s = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...s, u: 1 };
};

// ---------- per-shot camera keys: [posA, lookA, fovA, rollA, posB, lookB, fovB, rollB] ----------
// Stadium: screen centre (0, 5.9, -15.6) size 8.0x5.0; pitch centre (0,0,-0.5);
// bowler (1.6,0,-4.6); batsman (-0.9,0,3.6); ball path z -4.3 -> 3.3.
// Home: TV centre (-0.75, 1.95, -3.13); ladka (-0.6,0,-0.45); dost (0.85,0,-0.45); desk (2.35,0,-0.7).
// Old: CRT screen (0,1.17,-2.0); board (2.2,2.05,-3.14) 1.5x1.0; ghadi (1.0,2.75,-3.14).
// Auction: board (0,3.55,-4.7) 3.4x1.33; desk/gavel (0.9,~1.3,-3.5); bidders z -0.6/0.6.
// Office: screen (0,2.2,-3.14) 1.9x2.2 (portrait board); officer (1.9,0,-1.5).
export const CAMS = {
  s01: [[1.3, 5.5, 2.6], [0, 5.7, -15.6], 46, 0, [1.0, 5.65, 1.2], [0, 5.7, -15.6], 43, 0],
  s02: [[0, 16, 15.2], [0, 1.2, -2.8], 55, 0, [0, 13.5, 13.2], [0, 1.2, -2.8], 53, 0],
  s03: [[3.6, 0.65, 9.8], [-0.5, 2.4, -8], 55, 0, [3.2, 0.8, 9.0], [-0.4, 2.5, -8], 52, 0],
  s04: [[2.9, 1.7, 2.6], [0.1, 1.25, -0.6], 50, 0, [2.6, 1.62, 2.2], [0.1, 1.25, -0.6], 47, 0],
  s05: [[5.6, 1.5, -0.2], [2.2, 1.1, -4.5], 46, 0, [5.2, 1.45, -0.8], [2.0, 1.1, -4.5], 44, 0],
  s06: [[4.8, 1.7, -5.2], [0.8, 0.9, -4.3], 44, 0, [4.8, 1.7, 4.6], [0, 0.75, 3.25], 42, 0],
  s07: [[1.8, 7.5, -6.5], [0.2, 0.2, -0.5], 46, 0, [1.4, 6.5, -5.2], [0.1, 0.2, 0.8], 44, 0],
  s08: [[-3.0, 1.6, 8.2], [-0.4, 5.6, -15.6], 52, 0, [-2.6, 1.75, 7.4], [-0.4, 5.6, -15.6], 50, 0],
  s09: [[-1.8, 5.5, 3.0], [0, 5.9, -15.6], 48, 0, [-1.2, 5.7, 1.4], [0, 5.9, -15.6], 43, 0],
  s10: [[0.05, 1.52, 3.3], [0.05, 1.33, -0.45], 46, 0, [0.05, 1.5, 2.9], [0.05, 1.33, -0.45], 43, 0],
  s11: [[2.35, 3.3, 0.15], [2.32, 0.78, -0.68], 40, 3, [2.42, 3.1, -0.05], [2.32, 0.78, -0.68], 38, 2],
  s12: [[-2.85, 1.85, 3.0], [0.15, 1.12, -2.2], 50, 0, [-2.55, 1.8, 2.65], [0.15, 1.12, -2.2], 47, 0],
  s13: [[0.3, 1.5, 0.55], [-0.02, 1.2, -2.0], 40, 0, [0.26, 1.45, 0.3], [-0.02, 1.2, -2.0], 38, 0],
  s14: [[0.35, 1.6, 0.75], [2.2, 2.02, -3.14], 48, 0, [0.55, 1.62, 0.45], [2.2, 2.02, -3.14], 45, 0],
  s15: [[2.2, 2.0, 0.55], [2.2, 2.03, -3.14], 48, 0, [2.2, 2.0, 0.3], [2.2, 2.03, -3.14], 46, 0],
  s16: [[4.4, 3.9, 4.6], [0, 1.5, -3.4], 54, 0, [4.0, 3.6, 4.1], [0, 1.5, -3.4], 52, 0],
  s17: [[3.7, 1.75, 3.0], [-0.6, 1.25, -0.7], 46, 0, [3.4, 1.7, 2.7], [-0.6, 1.25, -0.7], 43, 0],
  s18: [[2.5, 2.3, -0.8], [0.8, 1.35, -3.5], 42, 0, [2.3, 2.15, -1.1], [0.8, 1.35, -3.5], 40, 0],
  s19: [[0, 1.5, 1.8], [0, 3.55, -4.7], 58, 0, [0, 1.6, 1.4], [0, 3.6, -4.7], 56, 0],
  s20: [[0, 1.0, 4.6], [0, 5.6, -15.6], 52, 0, [0, 1.25, 3.8], [0, 5.6, -15.6], 49, 0],
  s21: [[0, 5.9, 2.2], [0, 5.9, -15.6], 46, 0, [0, 5.9, 1.2], [0, 5.9, -15.6], 44, 0],
  s22: [[3.4, 1.3, 6.8], [0, 0.7, 3.4], 42, 0, [3.0, 1.2, 6.2], [0, 0.7, 3.4], 40, 0],
  s23: [[2.2, 3.15, 0.35], [2.32, 0.78, -0.66], 40, -3, [2.32, 3.0, 0.1], [2.32, 0.78, -0.66], 38, -2],
  s24: [[3.3, 1.65, 1.9], [0.25, 1.35, -0.5], 44, 0, [3.05, 1.6, 1.6], [0.25, 1.35, -0.5], 42, 0],
  s25: [[-2.85, 1.8, 3.0], [0.3, 1.3, -0.7], 50, 0, [-2.5, 1.72, 2.45], [0.3, 1.3, -0.7], 46, 0],
  s26: [[0.0, 1.55, 2.0], [-0.55, 1.4, -0.5], 40, 0, [-0.08, 1.53, 1.75], [-0.55, 1.4, -0.5], 38, 0],
  s27: [[-0.5, 1.9, 2.4], [-0.75, 1.95, -3.13], 44, 0, [-0.55, 1.92, 1.9], [-0.75, 1.95, -3.13], 41, 0],
  s28: [[0.3, 1.9, 1.5], [0, 2.15, -3.14], 48, 0, [0.22, 1.88, 1.15], [0, 2.15, -3.14], 45, 0],
  s29: [[-3.2, 3.4, 2.8], [0.6, 1.65, -2.7], 52, 0, [-2.95, 3.25, 2.5], [0.6, 1.65, -2.7], 50, 0],
  s30: [[0.55, 1.3, 1.75], [0.12, 1.02, 0.3], 36, 0, [0.45, 1.24, 1.45], [0.12, 1.02, 0.3], 33, 0],
  s31: [[2.9, 1.65, 2.9], [-0.5, 1.6, -2.2], 50, 0, [2.7, 1.6, 2.6], [-0.5, 1.6, -2.2], 47, 0],
  s32: [[3.1, 1.55, 1.15], [0.1, 1.3, -0.5], 46, 0, [2.85, 1.5, 0.85], [0.1, 1.3, -0.5], 43, 0],
  s33: [[-4.8, 1.7, -5.2], [-0.8, 0.9, -4.3], 44, 0, [-4.8, 1.7, 4.6], [0, 0.75, 3.25], 42, 0],
  s34: [[-0.2, 0.7, 3.6], [0.1, 1.32, -0.5], 50, 0, [-0.15, 0.78, 3.3], [0.1, 1.32, -0.5], 48, 0],
  s35: [[0.9, 5.7, 2.8], [0, 5.9, -15.6], 48, 0, [0.6, 5.8, 1.8], [0, 5.9, -15.6], 45, 0],
  s36: [[-2.5, 1.55, 3.1], [0.05, 1.33, -0.5], 46, 0, [-2.3, 1.5, 2.8], [0.05, 1.33, -0.5], 44, 0],
  s37: [[0, 6.5, 12.5], [0, 4.2, -10], 52, 0, [0, 12, 23], [0, 3.6, -8], 55, 0],
};
export const camFor = (shot, u) => {
  const c = CAMS[shot.id];
  const e = u * u * (3 - 2 * u); // smoothstep within the shot
  const L = (a, b) => a + (b - a) * e;
  const L3 = (a, b) => a.map((v, i) => L(v, b[i]));
  return { pos: L3(c[0], c[4]), look: L3(c[1], c[5]), fov: L(c[2], c[6]), roll: L(c[3], c[7]) };
};
