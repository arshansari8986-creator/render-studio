// "Broker Wala" — SCENE PLAN (35 shots, 1703f @30fps = 56.77 s).
// Title: "Ghar Kisi Ka, Lakh Uska!" — Hero: dusty-teal shirt #5a7d7a, brown trousers,
// warm skin #a67c52, small moustache, thick brows. Signature prop: BRASS KEY BUNCH
// (5 keys) — right hand or on desk in EVERY hero shot (placeKeys in main.js).
// Voice (LOCKED): broker-narration.mp3 — 56.77 s, Jovial 118 mastered, -15.84 LUFS.
// Line windows (frames @30fps, SCENE_PLAN.md — whisper transcript mapped to 20 lines):
// L1 0-101 | L2 101-209 | L3 209-305 | L4 305-394 | L5 394-479 | L6 479-535 | L7 535-595
// | L8 595-686 | L9 686-799 | L10 799-881 | L11 881-955 | L12 955-1061 | L13 1061-1121
// | L14 1121-1207 | L15 1207-1267 | L16 1267-1327 | L17 1327-1433 | L18 1433-1502
// | L19 1502-1601 | L20 1601-1703.
// Beats (11, CONTIGUOUS, 0-1703): b01 HOOK (L1) | b02 DEFINITION (L2) | b03 DUKAAN (L3)
// | b04 FIRST DEAL (L4-L7) | b05 GALTI (L8) | b06 NIYAM (L9-L10) | b07 KIRAYA (L11-L12)
// | b08 CLIMAX (L13-L15) | b09 IRONY (L16-L17) | b10 CHECK (L18-L19) | b11 LOOP (L20).
// Shots: 35, avg ~49f (1.6 s), har line 1-3 shots, shot kabhi line ke beech me nahi kata.
// NO captions. Numbers as objects: FOR SALE board (C), till cash (B), 10 TO LET boards (D),
// 3 keys + 3 lit windows (C), GALLA board + cash mountain (B q26), rent receipt (E).
// LIP-SYNC: envelope.js (broker master se per-frame ENV) — mouth = smoothed ENV,
// gain 1.7, 0.035 se neeche = band. Lip-sync SIRF hero shots me; member shots me mouth null.
// SPEAKER-VISIBLE RULE: har shot me speaker===who (assert neeche).
// OCCLUDERS (props between camera and hero text/face — checked per still):
// A (gali): BROKER sign (above shutter, above face line), shutter slats (behind hero),
// lamp post (left edge, off face-line), cycle (right, below face-line),
// chai-stall awning (above), dustbin/thela (edges, below face-line).
// B (dukaan): key board (above counter, above face line), till lid (open, below face),
// cash stacks/mountain (on counter, below face), GALLA board (above counter, above face
// line), wall clock (above, off face-line), files/phone (on counter, below face-line),
// desk (hero ke peeche/side, never in front of face).
// C (flat): big window frame (side, off face-line), FOR SALE board (left wall, clear of
// hero), society building (deep background, q23), lit windows (above face line).
// D (rental): TO LET boards (on facades, above/behind hero, never on face), tenants
// (beside hero, never in front of face), door frames (side).
// E (kamra): hanging bulb + wire (above, ceiling to bulb), bed headboard (behind hero),
// receipt on wall (side, off face-line), window frame (side).
// NO sub-remapping: every shot's sub is explicit below (sub 0 each); no remap helper exists.
import { clamp } from './motion.js';
import { ENV } from './envelope.js';

export const FPS = 30;
export const TOTAL = 1703;

// ---------- lines (approved script v3, whisper-mapped) ----------
export const LINES = [
  ['L1', 0, 101], ['L2', 101, 209], ['L3', 209, 305], ['L4', 305, 394], ['L5', 394, 479],
  ['L6', 479, 535], ['L7', 535, 595], ['L8', 595, 686], ['L9', 686, 799], ['L10', 799, 881],
  ['L11', 881, 955], ['L12', 955, 1061], ['L13', 1061, 1121], ['L14', 1121, 1207],
  ['L15', 1207, 1267], ['L16', 1267, 1327], ['L17', 1327, 1433], ['L18', 1433, 1502],
  ['L19', 1502, 1601], ['L20', 1601, 1703],
];
export const LINE_STARTS = LINES.map(([, a]) => a);

// ---------- lip-sync ----------
export function mouthAt(f) {
  const a = ENV[Math.max(0, f - 1)] || 0, b = ENV[f] || 0, c = ENV[Math.min(TOTAL - 1, f + 1)] || 0;
  const s = (a + b + c) / 3;
  if (s < 0.035) return 0;
  return clamp(s * 1.7, 0, 1);
}
export function mouthKind(f) {
  const o = mouthAt(f);
  if (o <= 0) return null;
  return o < 0.6 ? 'o' : 'O';
}

// ---------- hero expression timeline (12-frame morph at each line start) ----------
// Valid expressions only: neutral, grin, smile, nervous, shock, relief.
const EXPR_KEYS = [
  [0, 'neutral'], [47, 'smile'], [101, 'smile'], [209, 'smile'], [305, 'smile'],
  [394, 'grin'], [479, 'smile'], [535, 'grin'], [595, 'nervous'], [640, 'smile'],
  [686, 'grin'], [799, 'grin'], [881, 'smile'], [955, 'smile'], [1061, 'grin'],
  [1121, 'grin'], [1207, 'grin'], [1267, 'nervous'], [1327, 'nervous'], [1380, 'smile'],
  [1433, 'smile'], [1502, 'grin'], [1601, 'relief'],
];
export function heroExprAt(f) {
  let cur = EXPR_KEYS[0][1], mix = null;
  for (let i = 1; i < EXPR_KEYS.length; i++) {
    const [kf, e2] = EXPR_KEYS[i];
    if (f >= kf + 12) { cur = e2; continue; }
    if (f >= kf) { mix = { e2, u: (f - kf) / 12 }; }
    break;
  }
  return { expr: cur, mix };
}

// ---------- member expression timeline (buyer/seller/tenant/rival share it) ----------
const MEMBER_EXPR_KEYS = [
  [0, 'neutral'], [209, 'grin'], [305, 'neutral'], [350, 'shock'], [394, 'smile'],
  [479, 'smile'], [686, 'smile'], [881, 'smile'], [955, 'smile'], [1008, 'grin'],
  [1121, 'smile'], [1207, 'shock'], [1267, 'neutral'], [1327, 'nervous'],
  [1433, 'smile'], [1502, 'grin'], [1601, 'relief'],
];
export function memberExprAt(f) {
  let cur = MEMBER_EXPR_KEYS[0][1], mix = null;
  for (let i = 1; i < MEMBER_EXPR_KEYS.length; i++) {
    const [kf, e2] = MEMBER_EXPR_KEYS[i];
    if (f >= kf + 12) { cur = e2; continue; }
    if (f >= kf) { mix = { e2, u: (f - kf) / 12 }; }
    break;
  }
  return { expr: cur, mix };
}

// ---------- till angle (0 = band, 1.2 = 69° khula) ----------
// f<479 band; 479->510 khulta; 510-1267 khula; 1267->1300 band; 1300+ band.
export function tillAngle(f) {
  if (f < 479) return 0;
  if (f < 510) return 1.2 * clamp((f - 479) / 31);
  if (f < 1267) return 1.2;
  if (f < 1300) return 1.2 * (1 - clamp((f - 1267) / 33));
  return 0;
}

// ---------- shutter openness (0 = band, 0.6 = khula, 0.25 = halka khula) ----------
// f<209 band; 209->257 khulta (0.6); 257-1601 khula; 1601->1652 halka (0.25); 1652+ 0.25.
export function shutterOpen(f) {
  if (f < 209) return 0;
  if (f < 257) return 0.6 * clamp((f - 209) / 48);
  if (f < 1601) return 0.6;
  if (f < 1652) return 0.6 - 0.35 * clamp((f - 1601) / 51);
  return 0.25;
}

// ---------- camera presets: [startPos, startLook, fov, endPos, endLook, endFov] ----------
// STATIC presets me end = start. PUSH-IN me end pos/fov alag. NO low angle/orbit/Dutch.
// Har shot ka preset pichle shot se alag (same location par bhi pos/fov badle).
export const CAMS = {
  // ---- LOC A — bazaar gali (facade z=-2, hero ~(-1,-0.9)) ----
  SA: [[0.3, 1.85, 4.5], [-0.8, 1.85, -1.0], 60, [0.3, 1.85, 4.5], [-0.8, 1.85, -1.0], 60],
  SB: [[0.8, 1.85, 4.2], [-0.7, 1.8, -0.9], 58, [0.8, 1.85, 4.2], [-0.7, 1.8, -0.9], 58],
  SA2: [[-2.6, 1.9, 2.4], [-1.4, 1.3, -1.0], 52, [-2.6, 1.9, 2.4], [-1.4, 1.3, -1.0], 52], // FIX R2b (still-03): left-side closer two-shot, sign OUT of frame (bina board) — the right-side angle cut the BROKER sign.
  SA3: [[2.0, 1.7, 4.3], [-1.0, 1.5, -0.9], 60, [2.0, 1.7, 4.3], [-1.0, 1.5, -0.9], 60],
  SA4: [[0.5, 1.65, 3.2], [-0.7, 1.45, -0.9], 52, [0.5, 1.65, 3.2], [-0.7, 1.45, -0.9], 52],
  SA5: [[-2.6, 1.85, 4.4], [-0.8, 1.75, -0.6], 60, [-2.6, 1.85, 4.4], [-0.8, 1.75, -0.6], 60],
  SA6: [[0.2, 1.65, 3.4], [-1.0, 1.45, -0.9], 52, [0.2, 1.65, 3.4], [-1.0, 1.45, -0.9], 52],
  SR: [[0.3, 1.85, 4.5], [-0.8, 1.85, -1.0], 60, [0.3, 1.85, 4.5], [-0.8, 1.85, -1.0], 60],
  SR2: [[0.3, 1.85, 4.5], [-0.8, 1.85, -1.0], 60, [0.3, 1.85, 4.5], [-0.8, 1.85, -1.0], 60],
  // ---- LOC B — dukaan interior (back wall z=-6, counter 2.6,-3.4) ----
  DB: [[0.2, 1.7, 2.2], [0.0, 1.35, -2.8], 58, [0.2, 1.7, 2.2], [0.0, 1.35, -2.8], 58],
  DC: [[0.4, 1.6, 1.6], [0.0, 1.35, -2.6], 50, [0.4, 1.6, 1.6], [0.0, 1.35, -2.6], 50],
  DI: [[-1.5, 2.1, 5.2], [0.0, 1.3, -3.0], 62, [-1.5, 2.1, 5.2], [0.0, 1.3, -3.0], 62],
  DB2: [[-2.0, 1.85, 1.8], [0.3, 1.05, -2.5], 56, [-2.0, 1.85, 1.8], [0.3, 1.05, -2.5], 56],
  DH: [[1.6, 1.7, 0.6], [0.8, 1.1, -3.2], 46, [1.6, 1.7, 0.6], [0.8, 1.1, -3.2], 46],
  CT: [[1.9, 1.8, 0.3], [2.0, 1.4, -3.8], 54, [1.85, 1.75, 0.15], [2.0, 1.4, -3.8], 52],
  CT2: [[2.6, 1.85, 1.0], [1.8, 1.35, -3.8], 50, [2.55, 1.8, 0.8], [1.8, 1.35, -3.8], 48],
  CT3: [[-0.3, 1.75, 1.4], [1.5, 1.3, -3.8], 52, [-0.3, 1.75, 1.4], [1.5, 1.3, -3.8], 52],
  DB3: [[-0.6, 1.7, 2.4], [0.0, 1.35, -2.8], 58, [-0.6, 1.7, 2.4], [0.0, 1.35, -2.8], 58],
  DB4: [[0.0, 1.5, 2.0], [0.0, 1.15, -2.7], 58, [0.0, 1.5, 2.0], [0.0, 1.15, -2.7], 58],
  DB5: [[1.8, 1.65, 0.4], [1.6, 1.25, -4.0], 48, [1.8, 1.65, 0.4], [1.6, 1.25, -4.0], 48],
  CT4: [[2.4, 1.85, 0.9], [1.9, 1.35, -3.8], 50, [2.35, 1.8, 0.7], [1.9, 1.35, -3.8], 48],
  DB6: [[-0.2, 1.7, 2.3], [0.0, 1.35, -2.8], 58, [-0.2, 1.7, 2.3], [0.0, 1.35, -2.8], 58],
  CT5: [[1.0, 1.9, 1.7], [1.9, 1.3, -3.6], 58, [0.95, 1.85, 1.4], [1.9, 1.3, -3.6], 54],
  // ---- LOC C — flat interior (x~0, back wall z=-5) + society exterior (x~10) ----
  CF: [[0.3, 1.5, 2.8], [0.1, 1.15, -3.5], 60, [0.3, 1.5, 2.8], [0.1, 1.15, -3.5], 60],
  CF2: [[0.6, 1.6, 0.6], [0.4, 1.35, -3.4], 48, [0.6, 1.6, 0.6], [0.4, 1.35, -3.4], 48],
  CS: [[10.0, 4.0, 6.4], [10.0, 2.0, -3.5], 56, [10.0, 4.0, 6.4], [10.0, 2.0, -3.5], 56], // FIX QA-full (f1091): z 6.8 -> 6.4 — ground share kam, building zyada.
  CS2: [[9.0, 1.65, 2.8], [10.0, 1.3, -0.5], 52, [9.0, 1.65, 2.8], [10.0, 1.3, -0.5], 52],
  CS3: [[10.5, 1.6, 1.4], [10.0, 1.3, -0.6], 46, [10.5, 1.6, 1.4], [10.0, 1.3, -0.6], 46],
  // ---- LOC D — rental street (facades z=-2, hero z~0.3) ----
  DR: [[0.5, 1.7, 4.0], [0.0, 1.35, 0.0], 56, [0.5, 1.7, 4.0], [0.0, 1.35, 0.0], 56],
  DR2: [[-6.0, 2.3, 5.0], [2.5, 1.3, -1.2], 62, [-6.0, 2.3, 5.0], [2.5, 1.3, -1.2], 62],
  DR3: [[3.2, 1.9, 2.4], [-1.8, 1.1, -1.8], 60, [3.2, 1.9, 2.4], [-1.8, 1.1, -1.8], 60], // REVERTED QA-fix1: tilt-up+closer cut the walking hero half out of the left edge — original framing (approved still-09) stands; pavement ~35% textured tiles, accepted residual.
  DR4: [[1.2, 1.6, 2.6], [0.45, 1.3, 0.1], 50, [1.2, 1.6, 2.6], [0.45, 1.3, 0.1], 50],
  // ---- LOC E — rented room (back wall z=-5, bed -2.6,-3.8, hero -2.2,-3.1) ----
  ER: [[-0.2, 1.65, 0.9], [-1.9, 1.3, -3.4], 54, [-0.2, 1.65, 0.9], [-1.9, 1.3, -3.4], 54],
  ER2: [[-0.9, 1.6, 0.0], [-1.8, 1.3, -3.2], 48, [-0.9, 1.6, 0.0], [-1.8, 1.3, -3.2], 48],
  ER3: [[-0.2, 1.65, 1.0], [-1.9, 1.3, -3.2], 54, [-0.2, 1.65, 1.0], [-1.9, 1.3, -3.2], 54],
};

// ---------- SHOTS: [id, a, b, beat, loc, cam, who, speaker, charX, charZ, charS, R, L, tilt, crowd, board] ----------
// loc: 'A' gali | 'B' dukaan | 'C' flat/society | 'D' rental street | 'E' kamra.
// who: on-screen main character; speaker===who har shot me (assert neeche).
// crowd: 'none' | 'walkers' (A: 3 walkers) | 'walkers6' (A: 6) | 'rival' (A: mustard rival
//   peeche hansta) | 'deal' (B: buyer+seller desk par) | 'buyer' (C: buyer hero ke paas)
//   | 'heroBehind' (C: hero buyer ke peeche) | 'family' (C: 3 flat-viewing family)
//   | 'tenants' (D: 4 tenants darwaze par) | 'tenant' (D: tenant woman + child)
//   | 'passersby' (A: 2 walkers). board: '' | 'galla' | 'till1lakh' (q12 only) — EXPLICIT har shot me, sub 0.
export const SHOTS = [
  // b01 HOOK — L1, gali dawn
  ['q01', 0, 50, 'b01', 'A', 'SA', 'hero', 'hero', -1.0, -0.9, 1.05, 'reach', 'hang', 0, 'walkers', ''],
  ['q02', 50, 101, 'b01', 'A', 'SB', 'hero', 'hero', -1.0, -0.9, 1.05, 'reach', 'hang', 0, 'walkers', ''],
  // b02 DEFINITION — L2, dukaan
  ['q03', 101, 155, 'b02', 'B', 'DB', 'hero', 'hero', 0.0, -2.2, 1.05, 'reach', 'reach', 0, 'deal', ''],
  ['q04', 155, 209, 'b02', 'B', 'DC', 'hero', 'hero', 0.0, -2.2, 1.05, 'point', 'point', 0, 'none', ''],
  // b03 DUKAAN — L3, gali + dukaan
  ['q05', 209, 257, 'b03', 'A', 'SA2', 'hero', 'hero', -1.0, -0.9, 1.05, 'up', 'hang', 0, 'rival', ''],
  ['q06', 257, 305, 'b03', 'B', 'DI', 'hero', 'hero', 0.0, -2.0, 1.05, 'reach', 'hang', 0, 'none', ''],
  // b04 FIRST DEAL — L4-L7
  ['q07', 305, 350, 'b04', 'C', 'CF', 'hero', 'hero', -0.6, -2.6, 1.05, 'point', 'hang', 0, 'buyer', ''],
  ['q08', 350, 394, 'b04', 'C', 'CF2', 'buyer', 'buyer', 0.5, -3.2, 1.0, 'reach', 'hang', 0, 'heroBehind', ''],
  ['q09', 394, 436, 'b04', 'B', 'DB2', 'hero', 'hero', 0.0, -2.2, 1.05, 'belly', 'hang', 0, 'deal', ''],
  ['q10', 436, 479, 'b04', 'B', 'DH', 'hero', 'hero', 0.8, -3.0, 1.05, 'reach', 'hang', 0, 'none', ''],
  ['q11', 479, 535, 'b04', 'B', 'CT', 'hero', 'hero', 1.45, -4.3, 1.1, 'reach', 'hang', 0, 'none', ''],
  ['q12', 535, 595, 'b04', 'B', 'CT2', 'hero', 'hero', 1.45, -4.3, 1.1, 'reach', 'hang', 0, 'none', 'till1lakh'],
  // b05 GALTI — L8
  ['q13', 595, 640, 'b05', 'B', 'CT3', 'hero', 'hero', 1.45, -3.95, 1.1, 'hang', 'hang', 0, 'none', ''],
  ['q14', 640, 686, 'b05', 'B', 'DB3', 'hero', 'hero', 0.0, -2.2, 1.05, 'temple', 'hang', -1, 'none', ''],
  // b06 NIYAM — L9-L10
  ['q15', 686, 743, 'b06', 'B', 'DB4', 'hero', 'hero', 0.0, -2.2, 1.05, 'reach', 'reach', 0, 'deal', ''],
  ['q16', 743, 799, 'b06', 'B', 'DB5', 'hero', 'hero', 1.45, -4.3, 1.1, 'reach', 'reach', 0, 'none', ''],
  ['q17', 799, 840, 'b06', 'B', 'CT4', 'hero', 'hero', 1.45, -4.3, 1.1, 'reach', 'hang', 0, 'none', ''],
  ['q18', 840, 881, 'b06', 'B', 'DB6', 'hero', 'hero', 0.0, -2.2, 1.05, 'point', 'hang', 0, 'none', ''],
  // b07 KIRAYA — L11-L12
  ['q19', 881, 918, 'b07', 'D', 'DR', 'hero', 'hero', 0.0, 0.3, 1.05, 'reach', 'hang', 0, 'walkers', ''],
  ['q20', 918, 955, 'b07', 'D', 'DR2', 'hero', 'hero', 0.0, 0.3, 1.05, 'wave', 'hang', 0, 'tenants', ''],
  ['q21', 955, 1008, 'b07', 'D', 'DR3', 'hero', 'hero', -1.0, 0.2, 1.05, 'point', 'hang', 0, 'tenants', ''],
  ['q22', 1008, 1061, 'b07', 'D', 'DR4', 'hero', 'hero', 0.0, 0.3, 1.05, 'reach', 'hang', 0, 'tenant', ''],
  // b08 CLIMAX — L13-L15
  ['q23', 1061, 1121, 'b08', 'C', 'CS', 'hero', 'hero', 10.0, -0.5, 1.05, 'up', 'hang', 0, 'family', ''],
  ['q24', 1121, 1164, 'b08', 'C', 'CS2', 'hero', 'hero', 10.0, -0.5, 1.05, 'reach', 'hang', 0, 'none', ''],
  ['q25', 1164, 1207, 'b08', 'C', 'CS3', 'hero', 'hero', 10.0, -0.5, 1.05, 'reach', 'hang', 0, 'none', ''],
  ['q26', 1207, 1267, 'b08', 'B', 'CT5', 'hero', 'hero', 1.45, -4.3, 1.1, 'reach', 'hang', 0, 'none', 'galla'],
  // b09 IRONY — L16-L17, kamra raat
  ['q27', 1267, 1327, 'b09', 'E', 'ER', 'hero', 'hero', -1.7, -2.6, 1.0, 'hang', 'hang', 0, 'none', ''],
  ['q28', 1327, 1380, 'b09', 'E', 'ER2', 'hero', 'hero', -1.7, -2.6, 1.0, 'reach', 'hang', 0, 'none', ''],
  ['q29', 1380, 1433, 'b09', 'E', 'ER3', 'hero', 'hero', -1.7, -2.6, 1.0, 'reach', 'reach', 0, 'none', ''],
  // b10 CHECK — L18-L19, gali
  ['q30', 1433, 1468, 'b10', 'A', 'SA3', 'hero', 'hero', -1.0, -0.9, 1.05, 'reach', 'hang', 0, 'walkers', ''],
  ['q31', 1468, 1502, 'b10', 'A', 'SA4', 'hero', 'hero', -0.7, -0.9, 1.05, 'reach', 'hang', 0, 'none', ''],
  ['q32', 1502, 1551, 'b10', 'A', 'SA5', 'hero', 'hero', -1.0, -0.9, 1.05, 'reach', 'point', 0, 'passersby', ''],
  ['q33', 1551, 1601, 'b10', 'A', 'SA6', 'hero', 'hero', -1.0, -0.9, 1.05, 'up', 'hang', 0, 'none', ''],
  // b11 LOOP — L20, gali subah
  ['q34', 1601, 1652, 'b11', 'A', 'SR', 'hero', 'hero', -1.0, -0.9, 1.05, 'up', 'hang', 0, 'walkers', ''],
  ['q35', 1652, 1703, 'b11', 'A', 'SR2', 'hero', 'hero', -1.0, -0.9, 1.05, 'pray', 'pray', 0, 'walkers', ''],
];
const SHOTMAP = {};
SHOTS.forEach(([id, a, b, beat, loc, cam, who, speaker, cx, cz, cs, R, L, tilt, crowd, board]) => {
  if (who !== speaker) throw new Error(`speaker rule violation: ${id} who=${who} speaker=${speaker}`);
  SHOTMAP[id] = { id, a, b, beat, loc, cam: CAMS[cam], camName: cam, who, speaker, cx, cz, cs, R, L, tilt, crowd, board, sub: 0, len: b - a };
});
export const BEAT_OF = {}; SHOTS.forEach((s) => { BEAT_OF[s[0]] = s[3]; });
export const BEAT_SPAN = {
  b01: [0, 101], b02: [101, 209], b03: [209, 305], b04: [305, 595], b05: [595, 686],
  b06: [686, 881], b07: [881, 1061], b08: [1061, 1267], b09: [1267, 1433],
  b10: [1433, 1601], b11: [1601, 1703],
};
export const shotAt = (f) => {
  for (const s of SHOTS) {
    if (f >= s[1] && f < s[2]) { const sh = SHOTMAP[s[0]]; return { ...sh, u: clamp((f - s[1]) / sh.len) }; }
  }
  const sh = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...sh, u: 1 };
};
export const beatU = (f) => { const s = shotAt(f), [a, b] = BEAT_SPAN[s.beat]; return clamp((f - a) / (b - a)); };
export const FLASH = {};

// ---------- CAMS (compat: shot-id -> cam array) ----------
export const CAMS_BY_SHOT = {}; SHOTS.forEach((s) => { CAMS_BY_SHOT[s[0]] = CAMS[s[6]]; });
export const camFor = (shot, u) => {
  const c = shot.cam;
  const e = u * u * (3 - 2 * u);
  const L = (a, b) => a + (b - a) * e;
  const L3 = (a, b) => a.map((v, i) => L(v, b[i]));
  return { pos: L3(c[0], c[3]), look: L3(c[1], c[4]), fov: L(c[2], c[5]), roll: 0 };
};

export const captionAt = () => '';
