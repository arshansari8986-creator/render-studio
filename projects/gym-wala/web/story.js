// "Gym Wala" — SCENE PLAN v4 (53 shots, 2025f @30fps = 67.49 s).
// Title: "Gym Khaali, ₹5 Lakh Kamai!" — Hero v4: red tee #dc2626, yellow towel #facc15,
// skin #96603a, flat-top hair, thick brows, moustache (v1 navy hero SUPERSEDED).
// v4 = v3 + SPEAKER-VISIBLE RULE (user, 27 Nov ~18:18 IST: "Jo character bolega vah
// hona chahie seen mein live"): shot table me Speaker + In-frame? columns — 53/53 YES
// (hero 40, orange* 9, purple* 4). Koi merge nahi — 53 shots, frames 0-2025, line
// timings EXACT v3 jaisi. 15 framing/cam fixes: q10 D->D2, q18/q22 HB->HB2, q20/q33
// HA/HB->HW, q27 HC->GB (hero 2.0,-4.3), q41 GB (hero 2.0,-4.3) + 9 framing notes.
// NAYA ADD (27 Nov, "har bar naya add karna"): q04 C->TW (through-window), q25 HC->TD
// (top-down, STATIC — isiliye move count badla), q52 SA->LA (low-angle).
// Move count: 17 push-in / 36 static (68% static). loc 'D' KHATAM — counter shots loc 'B'.
// Voice (LOCKED, regenerate nahi): gym-narration-tight.mp3 — 67.49 s, speed-125 tight.
// Line windows (frames @30fps, faster-whisper base re-verified 27 Nov 2026 against the
// TIGHT mp3 — max drift 0.21 s at the L17/L18 boundary, all others ≤0.07 s; no change):
// L1 0-46 | L2 47-104 | L3 104-173 | L4 173-227 | L5 227-313 | L6 313-412 | L7 412-501
// | L8 501-551 | L9 551-635 | L10 635-703 | L11 703-773 | L12 773-841 | L13 841-911
// | L14 911-988 | L15 988-1021 | L16 1021-1091 | L17 1091-1141 | L18 1141-1190
// | L19 1190-1279 | L20 1279-1344 | L21 1344-1428 | L22 1428-1510 | L23 1510-1576
// | L24 1576-1621 | L25 1621-1679 | L26 1679-1727 | L27 1727-1794 | L28 1794-1864
// | L29 1864-1931 | L30 1931-2021.
// Beats (12, CONTIGUOUS, 0-2024, no gaps): b01 HOOK street dawn (L1-L2) | b02 DEFINITION
// gym day (L3-L4) | b03 KHOLA street dawn (L5) | b04 JANUARY gym day (L6-L9) |
// b05 FEB/MARCH home morning (L10-L12) | b06 GALLA counter warm evening (L13-L16) |
// b07 RULE office/home (L17-L19) | b08 OFFER AGAIN street (L20-L21) | b09 EMPTY AGAIN gym/park (L22) |
// b10 GALLA AGAIN counter (L23-L24) | b11 WHAT-IF gym/home (L25-L27) | b12 CHECK+LOOP park/street (L28-L30).
// Shots: 53, avg 38f (1.27 s), range 28-49f — har line 1-3 shots me, shot kabhi line ke
// beech me nahi kata (split sirf line ke andar, natural midpoint par).
// NO captions. Numbers as objects: fee board (indoor B + A-board street A), galla + till (B).
// "67%" NEVER used. Galla ₹5,00,000 sirf DIKHA (board + cash), guna-bhaag bola nahi.
// LIP-SYNC: envelope.js (tight master se per-frame ENV) — mouth = smoothed ENV,
// gain 1.7, 0.035 se neeche = band. Lip-sync SIRF speaker='hero' shots me; member shots me
// mouth null (narration hero ki voiceover hai, Gullak style).
// OCCLUDERS (props between camera and hero text/face — checked per still, see SCENE_PLAN.md):
// B (v1 jaisi): light cone (additive, behind hero), foreground dumbbells/kettlebells
// (bottom, below face line), yoga mats (floor, below face line); fee board (left, clear of
// hero), queue members (beside hero, never in front of face), bikes (right); till lid
// (open, below face), cash stacks (on counter, below face), galla board (above counter,
// above face line), wall shelf + bottles (above board, above face line).
// + CARDS DHER (counter par, face-line se neeche — q30).
// A (street): outdoor A-board (left, clear of hero), lamp post (left edge, off face-line),
// parked cycle (right, below face-line), chai-stall awning (above), dustbin/thela (edges).
// C (home): table + cup (below face-line), shelf (above), bed headboard (behind hero),
// curtain (side, off face-line), hanging bulb + wire (above, ceiling to bulb),
// gym bag (farsh par, face-line se neeche), alarm clock (bedside, face-line se neeche).
// HB2 (v4): bedside table / alarm clock (face-line se neeche).
// D2 (v4): calendar frame (face-line se upar, hero ke haath se door).
// O (office): desk files/mug/laptop (face-line se neeche), colleague desk (peeche,
// face-line se door), window frame (side).
// P (park): benches (face-line se neeche), tree trunks (side, face-line se door),
// lamp post (kinara).
// NO sub-remapping: every shot's sub is explicit below (sub 0 each); no remap helper exists.
import { clamp } from './motion.js';
import { ENV } from './envelope.js';

export const FPS = 30;
export const TOTAL = 2025;

// ---------- lines (locked script, faster-whisper re-verified) ----------
export const LINES = [
  ['L1', 0, 46], ['L2', 47, 104], ['L3', 104, 173], ['L4', 173, 227], ['L5', 227, 313],
  ['L6', 313, 412], ['L7', 412, 501], ['L8', 501, 551], ['L9', 551, 635], ['L10', 635, 703],
  ['L11', 703, 773], ['L12', 773, 841], ['L13', 841, 911], ['L14', 911, 988], ['L15', 988, 1021],
  ['L16', 1021, 1091], ['L17', 1091, 1141], ['L18', 1141, 1190], ['L19', 1190, 1279],
  ['L20', 1279, 1344], ['L21', 1344, 1428], ['L22', 1428, 1510], ['L23', 1510, 1576],
  ['L24', 1576, 1621], ['L25', 1621, 1679], ['L26', 1679, 1727], ['L27', 1727, 1794],
  ['L28', 1794, 1864], ['L29', 1864, 1931], ['L30', 1931, 2021],
];
export const LINE_STARTS = LINES.map(([, a]) => a);

// ---------- lip-sync: mouth openness 0..1 from the voice RMS envelope ----------
// ENV file me pehle se 3-frame smoothing hai; yahan gain 1.7 + 0.035 threshold.
export function mouthAt(f) {
  const a = ENV[Math.max(0, f - 1)] || 0, b = ENV[f] || 0, c = ENV[Math.min(TOTAL - 1, f + 1)] || 0;
  const s = (a + b + c) / 3;
  if (s < 0.035) return 0;
  return clamp(s * 1.7, 0, 1);
}
// Painter (toon.js) mouth kinds hain — openness ko kind me map karo: halki awaaz = 'o',
// zor ki awaaz = 'O', band = null (expression ka apna munh dikhe).
export function mouthKind(f) {
  const o = mouthAt(f);
  if (o <= 0) return null;
  return o < 0.6 ? 'o' : 'O';
}

// ---------- hero expression timeline (12-frame morph at each line start) ----------
// [frame, expr] — chehra 12 frames me morph karta hai (toon.js mix: brow lerp + eye switch).
const EXPR_KEYS = [
  [0, 'neutral'], [47, 'wink'], [59, 'smile'], [104, 'neutral'], [173, 'neutral'], [227, 'smile'],
  [313, 'smile'], [412, 'smile'], [501, 'grin'], [551, 'grin'], [635, 'nervous'],
  [703, 'nervous'], [773, 'nervous'], [841, 'shock'], [875, 'relief'], [911, 'smile'],
  [988, 'smile'], [1021, 'grin'], [1091, 'neutral'], [1141, 'smile'], [1190, 'smile'],
  [1279, 'smile'], [1344, 'grin'], [1428, 'grin'], [1510, 'smile'], [1576, 'grin'],
  [1621, 'shock'], [1679, 'nervous'], [1727, 'smile'], [1794, 'smile'], [1864, 'smile'],
  [1931, 'grin'], [1990, 'relief'],
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

// ---------- member expression timeline (12-frame morph; mouth hamesha null) ----------
// Sirf tab lagu jab who==='orange' ya 'purple'. Hero keys wahan apply nahi hoti.
const MEMBER_EXPR_KEYS = [
  [635, 'neutral'], [703, 'nervous'], [739, 'nervous'], [808, 'neutral'],
  [951, 'neutral'], [1057, 'smile'], [1141, 'shock'], [1165, 'neutral'],
  [1190, 'smile'], [1235, 'smile'], [1387, 'grin'], [1470, 'smile'],
  [1761, 'smile'], [1794, 'smile'], [1898, 'smile'],
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

// ---------- till angle (radians, 0 = band, 1.2 = 69° khula) ----------
// f<841 band; 841->881 khulta; 881-1510 khula rehta; 1510-1576 phir band (q40/q41);
// 1576->1600 dobara khulta; 1600+ khula.
export function tillAngle(f) {
  if (f < 841) return 0;
  if (f < 881) return 1.2 * clamp((f - 841) / 40);
  if (f < 1510) return 1.2;
  if (f < 1576) return 0;
  if (f < 1600) return 1.2 * clamp((f - 1576) / 24);
  return 1.2;
}

// ---------- shutter openness (0 = band, 0.6 = khula, 0.25 = halka khula) ----------
// f<227 band; 227->270 khulta (0.6); 270-1794 khula; 1794-1931 agli subah phir band;
// 1931->1976 halka khulta (0.25); 1976+ halka khula (q53 freeze, q01 se farq).
export function shutterOpen(f) {
  if (f < 227) return 0;
  if (f < 270) return 0.6 * clamp((f - 227) / 43);
  if (f < 1794) return 0.6;
  if (f < 1931) return 0;
  if (f < 1976) return 0.25 * clamp((f - 1931) / 45);
  return 0.25;
}

// ---------- month for a shot (calendar texture/label swap, geometry nahi) ----------
// Gym (B): b04 tak JANUARY, b09 se MARCH. Counter (B + counter cam): hamesha MARCH.
// Home (C): q17-q18 FEBRUARY, q19 se MARCH. Office (O): MARCH. Street (A) / Park (P): ''.
export function monthFor(shot) {
  if (shot.loc === 'C') return (shot.id === 'q17' || shot.id === 'q18') ? 'FEBRUARY' : 'MARCH';
  if (shot.loc === 'O') return 'MARCH';
  if (shot.loc === 'B') return (shot.beat === 'b04') ? 'JANUARY' : 'MARCH';
  return '';
}

// ---------- camera presets: [startPos, startLook, fov, endPos, endLook, endFov] ----------
// STATIC presets me end = start (koi move nahi). PUSH-IN presets me end pos/fov alag hain.
// Koi pan/tracking/orbit/low angle/Dutch nahi, roll 0.
export const CAMS = {
  // ---- LOC O — office (back wall z=-5, desk z=-3.4) — NAYE v3 ----
  OA: [[0.5, 1.6, 0.4], [0.5, 1.2, -3.2], 50, [0.5, 1.6, 0.4], [0.5, 1.2, -3.2], 50],
  OB: [[0.5, 1.55, -0.2], [0.7, 1.05, -3.2], 46, [0.5, 1.55, -0.4], [0.7, 1.05, -3.2], 45],
  // SMOKE FIX (round 2, f1160): OB me member ka chehra frame se bada tha (bayein/upar
  // kata) + held phone dayein kinare kata tha — camera 0.8m peeche (z -0.2/-0.4).
  OC: [[-0.5, 2.0, 1.2], [0, 1.3, -3.5], 66, [-0.5, 2.0, 1.2], [0, 1.3, -3.5], 66],
  // ---- LOC P — park (path z 0..1.5, camera path ki taraf) — NAYE v3 ----
  // PA: REMAKE FIX (27 Nov ~20:40 IST) — purana PA (z 2.8, fov 50) me member frame
  // bhar me tha, park (path/bench/ped) dikhta hi nahi tha — f1490 audit FAIL.
  // Camera peeche (z 4.2) + fov 60: member ~44% frame, path neeche + bench/ped peeche
  // dikhte hain. q39 + q51 dono park-walk shots hain, dono ko fayda. STATIC.
  PA: [[0.3, 1.7, 4.2], [0, 1.25, 0.3], 60, [0.3, 1.7, 4.2], [0, 1.25, 0.3], 60],
  PB: [[0.2, 1.55, 1.6], [0, 1.25, 0.4], 46, [0.2, 1.55, 1.4], [0, 1.25, 0.4], 45],
  PC: [[-0.5, 2.0, 5.2], [0, 1.3, -2.5], 68, [-0.5, 2.0, 5.2], [0, 1.3, -2.5], 68],
  // ---- LOC A — street (facade z=-2, camera sadak ki taraf z+) — v2 se, STATIC ----
  SA: [[0.3, 1.6, 2.2], [-1.0, 1.4, -0.9], 50, [0.3, 1.6, 2.2], [-1.0, 1.4, -0.9], 50],
  SB: [[-0.6, 1.55, 0.9], [-1.0, 1.35, -0.9], 46, [-0.6, 1.55, 0.8], [-1.0, 1.35, -0.9], 45],
  // SB2: STILLS FIX (27 Nov, f0060) — SB me hero bahut bada + note dayein kata tha
  // (camera 1.8m, fov 46). Ab camera peeche (z 2.6) + fov 52 — hero + note poore,
  // sadak ka context bhi. STATIC. Sirf q02.
  SB2: [[0.3, 1.6, 2.6], [-0.7, 1.3, -0.9], 52, [0.3, 1.6, 2.6], [-0.7, 1.3, -0.9], 52],
  SC: [[1.8, 1.65, 1.0], [-1.0, 1.45, -0.9], 50, [1.8, 1.65, 1.0], [-1.0, 1.45, -0.9], 50],
  // SC2: NAYA (round 5, f0395 q11 FAIL fix) — q11 me hero (-2.4,-0.4) + Member-Purple
  // (-1.7,0.2) + A-board (-3.0,-0.8) ek diagonal par hain; SC camera (dayein) se hero
  // bayein kinare kata aur member ka sirf haath dikha. Camera bayein-saamne se
  // (-4.85,1.6,2.95), look (-2.5,1.3,-0.3) — teeno alag-alag jagah: member bayein,
  // hero beech, board dayein. fov 55 (margin ke liye). STATIC.
  // SMOKE FIX (round 6, f0395 r6): board ka "N" bayein kinare kata tha — look -2.35→-2.5
  // (camera thoda aur bayein dekhe, board frame ke andar aaye).
  SC2: [[-4.85, 1.6, 2.95], [-2.5, 1.3, -0.3], 55, [-4.85, 1.6, 2.95], [-2.5, 1.3, -0.3], 55],
  // SC3: NAYA (round 5, f1400 q37 FAIL fix) — q37 me hero (-1.0,-0.9) + Member-Purple
  // (-0.2,0.5): SC se member ka chehra bayein kinare kata (sirf haath + card dikha).
  // SMOKE FIX (round 6, f1400 r6): pehla SC3 (1.2,1.6,1.6) se member camera ke bahut
  // paas tha (1.8m) — frame me vishal, hero uske peeche chhupa. Naya camera (2.5,1.6,1.0),
  // look (-0.6,1.3,-0.2) — member dayein (2.75m), hero bayein (3.98m), side-by-side,
  // koi occlusion nahi; A-board beech-peeche dikhta hai. fov 55. STATIC.
  SC3: [[2.5, 1.6, 1.0], [-0.6, 1.3, -0.2], 55, [2.5, 1.6, 1.0], [-0.6, 1.3, -0.2], 55],
  SW: [[-0.5, 2.0, 5.2], [-0.5, 1.4, -2.0], 70, [-0.5, 2.0, 5.2], [-0.5, 1.4, -2.0], 70],
  // SR: loop-rhyme = SA geometry, dawn (q53, q01 jaisa angle, alag preset).
  SR: [[0.3, 1.6, 2.2], [-1.0, 1.4, -0.9], 50, [0.3, 1.6, 2.2], [-1.0, 1.4, -0.9], 50],
  // ---- LOC C — home (back wall z=-5, camera kamre ki taraf z+) — v2 se, STATIC ----
  HA: [[-1.2, 1.6, -0.6], [-2.2, 1.3, -3.2], 50, [-1.2, 1.6, -0.6], [-2.2, 1.3, -3.2], 50],
  HB: [[1.0, 1.6, -0.9], [1.8, 1.25, -3.0], 46, [1.05, 1.6, -1.1], [1.8, 1.25, -3.0], 45],
  // HB2: NAYA v4 — bedside phone close-up (q18/q22): bedside table + bistar par lete
  // Orange ka chehra + phone ek frame me.
  // SMOKE FIX (v4 round 1, f0685): purana HB2 me chehra BAYEIN kinare kata tha + phone
  // chehre ko dhak raha tha + alarm dayein kata tha. Ab camera bayein/peeche, look
  // member par — chehra centre, alarm neeche-dayein, phone chehre ke bagal me (upar nahi).
  // SMOKE FIX (round 2, f0820): alarm frame se bahar tha (bedside table dayein kone me
  // kata) — camera aur peeche (z 0.2) taaki chehra + phone + alarm teeno fit hon; alarm
  // table ke front-left kone par (-1.6,-3.75) — bistar ke paas, camera ki taraf.
  HB2: [[-1.3, 1.5, 0.2], [-2.0, 1.1, -3.4], 46, [-1.35, 1.5, 0.0], [-2.0, 1.1, -3.4], 45],
  HW: [[-0.5, 2.0, 1.2], [0, 1.3, -3.5], 66, [-0.5, 2.0, 1.2], [0, 1.3, -3.5], 66],
  HD: [[2.2, 1.7, -0.8], [-0.5, 1.4, -4.0], 52, [2.2, 1.7, -0.8], [-0.5, 1.4, -4.0], 52],
  // ---- LOC B / counter — v1 se, STATIC me badle (sirf B/F/TC/GB/HC push-in) ----
  A: [[0.1, 1.55, 1.45], [-0.6, 1.5, -2.6], 50, [0.1, 1.55, 1.45], [-0.6, 1.5, -2.6], 50],
  B: [[-0.2, 1.55, 0.6], [-0.6, 1.35, -2.6], 46, [-0.2, 1.55, 0.55], [-0.6, 1.35, -2.6], 45],
  // B2: STILLS FIX (27 Nov, f0790) — B cam me hero (-1.2,-1.6) bayein kinare kata tha
  // (sirf haath + kaan dikhte). B ko bayein shift + peeche — hero centre me poora.
  // q09/q21/q46 (hero -1.2,-1.6); q06 (-0.6,-2.6) B par hi rehta hai.
  B2: [[-0.8, 1.6, 1.4], [-1.2, 1.35, -2.6], 48, [-0.8, 1.6, 1.4], [-1.2, 1.35, -2.6], 48],
  C: [[-1.5, 2.0, 4.5], [0, 1.3, -3.0], 60, [-1.5, 2.0, 4.5], [0, 1.3, -3.0], 60],
  D: [[1.6, 1.65, 0.2], [-0.6, 1.45, -2.6], 50, [1.6, 1.65, 0.2], [-0.6, 1.45, -2.6], 50],
  // D2: NAYA v4 — gym calendar close-up (q10): hero (3.0,-4.6) + JANUARY calendar ek frame me.
  // SMOKE FIX (v4 round 1, f0360): purana D2 (camera seedha calendar ki taraf) me counter
  // hero ke beech me aa raha tha — hero counter ke peeche jhaankta dikhta tha, haath kata.
  // Ab camera BAYEIN se (counter frame se bahar) — hero + calendar dono poore.
  // SMOKE FIX (round 2, f0360): chehra neeche kinare par tha (70% down, body kata) —
  // camera aur peeche/upar, look beech me (chehra 66%, calendar 36% down).
  D2: [[0.5, 1.9, -1.0], [3.1, 2.3, -5.5], 46, [0.5, 1.9, -1.0], [3.1, 2.3, -5.5], 46],
  // TD: NAYA v4 — top-down/high-angle (q25, naya add 27 Nov): counter par notes fan upar se.
  // Camera chhat ke paas se neeche — hero ke haath + notes + chehra (upar se) ek frame me.
  // STATIC (push-in nahi) — move count ab 17 push-in / 36 static.
  // SMOKE FIX (round 2, f0930): frame andhera + neeche aadha khaali farsh tha — camera
  // upar/peeche, fov 42 (tighter), aur TD counter rig (warm evening) me hai (COUNTER_CAMS).
  TD: [[2.0, 4.5, -1.8], [1.9, 0.9, -3.6], 42, [2.0, 4.5, -1.8], [1.9, 0.9, -3.6], 42],
  E: [[2.6, 1.7, 1.2], [-1.8, 1.5, -3.8], 52, [2.6, 1.7, 1.2], [-1.8, 1.5, -3.8], 52],
  // SMOKE QA ROUND 1 (2026-11-27) — F/F2/TM/TC/GB/HC/WE/W2R2 sab dobara hisaab se banaye:
  // F: pehle board hero ka chehra dhak raha tha + board neeche kata tha. Ab camera peeche
  // (z 3.6) — board BAYEIN poora, hero DAYEIN poora, dono ek frame me.
  // STILLS FIX (27 Nov, f0435) — board bayein kata ("NEW YEAR OFFER" ka N) + bahut bada
  // tha. Camera peeche (z 4.8) + fov 50 — board poora, margin ke saath.
  F: [[-1.7, 1.7, 4.8], [-1.7, 1.1, -1.2], 50, [-1.7, 1.65, 5.0], [-1.7, 1.1, -1.2], 48],
  // F2: ROUND 2 — bayein se lene par board hero ka chehra dhak raha tha (f457). Ab DAYEIN
  // taraf se — board BAYEIN poora, hero DAYEIN poora, dono ek frame me, chehra saaf.
  F2: [[0.8, 1.6, 3.2], [-1.8, 1.1, -0.9], 58, [0.8, 1.6, 3.2], [-1.8, 1.1, -0.9], 58],
  W1: [[-0.35, 1.9, 5.3], [-1.1, 1.5, -3.2], 72, [-0.35, 1.9, 5.3], [-1.1, 1.5, -3.2], 72],
  // s02 JANUARY (wide = fix7 verified cam)
  W2: [[-0.35, 1.9, 5.3], [-1.1, 1.5, -3.2], 72, [-0.35, 1.9, 5.3], [-1.1, 1.5, -3.2], 72],
  W2L: [[-1.6, 1.9, 5.0], [-1.6, 1.4, -3.0], 68, [-1.6, 1.9, 5.0], [-1.6, 1.4, -3.0], 68],
  // W2R2: W2R me hero bayein kinare kata tha (q45 f1700). Camera dayein + look bayein —
  // hero poora andar. (W2R hata diya; sirf q45 W2R2.) ROUND 2 (27 Nov): look [0.0,-3.2] hero (-1.2) se 2.0 door tha, f1700 me phir kata — look [-1.2,-3.2] (hero par).
  W2R2: [[1.8, 1.9, 4.6], [-1.2, 1.4, -3.2], 68, [1.8, 1.9, 4.6], [-1.2, 1.4, -3.2], 68],
  // s03 MARCH (W3 = W1 geometry, dull env) — v4 me use nahi, code me rehta hai.
  W3: [[-0.35, 1.9, 5.3], [-1.1, 1.5, -3.2], 72, [-0.35, 1.9, 5.3], [-1.1, 1.5, -3.2], 72],
  B3: [[-0.2, 1.55, 0.6], [-0.6, 1.35, -2.6], 46, [-0.2, 1.55, 0.55], [-0.6, 1.35, -2.6], 45],
  // TW: NAYA v4 — through-window (q04, naya add 27 Nov): camera gym ke BAHAR, peeche ki
  // deewaar ke peeche se khidki ke beech wale pane se andar — hero + treadmill frame me.
  // Back wall DoubleSide hai (main.js), isliye bahar se deewaar dikhti hai, khidki ke
  // frame ke saath. STATIC. (Khidki ke beech wale pane se — vertical bars chehra nahi kaat-te.)
  // SMOKE FIX (round 2, f0120): pehla TW solid brown frame tha — deewaar me khidki ka
  // opening hi nahi tha (solid plane). Ab back wall 4 segments (khidki khuli hai), sky +
  // buildings peeche (z -13/-12.2), camera 5.5m peeche (z -11.5), fov 40 — khidki ka frame
  // + hero dono frame me.
  // SMOKE FIX (round 4, f0120): camera (-5.8,3.0,-9.4) se hero ka chehra bench ki peeli
  // barbell plate (0,1.35,-4.05) ke peeche chhupa tha — plate seedha face ke saamne thi.
  // Naya camera (-6.2,3.6,-10.0), look (-0.6,1.6,-2.6): sightline plate ke upar (y ~1.99
  // plate-z par, plate top 1.63) se nikalti hai; khidki ke beech wale pane (-3.17,2.52)
  // se hokar hero tak jati hai. Face frame centre me, plate neeche.
  TW: [[-6.2, 3.6, -10.0], [-0.6, 1.6, -2.6], 40, [-6.2, 3.6, -10.0], [-0.6, 1.6, -2.6], 40],
  // LA: NAYA v4 — low-angle (q52, naya add 27 Nov; checklist point 14 — low-angle
  // punctuation ke liye 'no low angle' rule SUPERSEDED): sadak se neeche se upar — hero
  // shutter ke saamne, facade + dawn sky upar. STATIC.
  // SMOKE FIX (round 2, f1950): sign "GYM" kata ("M • FITNESS" dikhta) + hero ke paer
  // kate — look bayein/neeche (-1.3,1.5,-1.2): "GYM •" poora, paer frame me.
  LA: [[-0.5, 0.4, 1.8], [-1.3, 1.5, -1.2], 60, [-0.5, 0.4, 1.8], [-1.3, 1.5, -1.2], 60],
  // TM: ROUND 2 — dayein se lene par fee board treadmill member ko dhak raha tha + frame
  // me khaali deewaar/farsh. Ab BAYEIN taraf se — window + C0 treadmill par + squat rack,
  // fee board frame se bahar. (v4 me use nahi.)
  TM: [[-3.8, 1.8, 2.2], [-3.2, 1.2, -3.0], 56, [-3.8, 1.8, 2.2], [-3.2, 1.2, -3.0], 56],
  // s04 TWIST (counter 2.6,-3.4; hero 1.45,-4.3; GALLA board 2.3,2.95,-5.94)
  T: [[1.95, 1.9, 0.7], [2.15, 1.6, -3.6], 48, [1.95, 1.9, 0.7], [2.15, 1.6, -3.6], 48],
  // TC: pehle hero ka chehra bayein kinare kata tha (aadha chehra). Camera peeche + look
  // bayein — hero poora, till + GALLA board + calendar sab poore.
  TC: [[1.9, 1.8, 0.3], [2.0, 1.3, -3.6], 54, [1.85, 1.75, 0.15], [2.0, 1.3, -3.6], 52],
  // GB: pehle hero neeche-bayein kone kata + calendar dayein kata tha. Ab board + calendar
  // ke beech centre (x 2.6) — dono POORE. q27/q41 me hero (2.0,-4.3) neeche frame me.
  // SMOKE FIX (v4 round 1, f1005): purana GB (look seedha board par, y 2.9) me hero ka
  // chehra neeche kinare kata tha + ishara karta haath frame se bahar tha. Ab look NEECHE
  // (y 2.3) — board upar poora, hero ka chehra + haath neeche frame me.
  // STILLS FIX (27 Nov, f1005) — hero neeche kata + beech me khaali deewaar. Camera neeche
  // (y 1.9) + look neeche (y 1.7) + fov 50 — hero poora, board poora, deewaar kam.
  GB: [[2.6, 1.9, 0.0], [2.4, 1.7, -5.0], 50, [2.6, 1.85, -0.2], [2.4, 1.7, -5.0], 48],
  // HC: ROUND 2 — dayein camera par bhi GALLA board upar-dayein kata tha (board hero ke
  // peeche, lagbhag ek hi line me hai). Ab camera NEECHE jhuka (look y 0.5) — board frame
  // ke upar bahar, hero + sheesha + counter poore. Clock/poster bhi bahar.
  HC: [[2.7, 1.7, -0.6], [1.45, 0.5, -4.3], 46, [2.75, 1.65, -0.7], [1.45, 0.5, -4.3], 45],
  // CH: look y 1.05->0.95 — GALLA board ki sunehri kinari upar jhaank rahi thi, ab bahar.
  CH: [[3.2, 1.5, -1.2], [2.9, 0.95, -3.35], 50, [3.2, 1.5, -1.2], [2.9, 0.95, -3.35], 50],
  // WE: fov 72/70 -> 74/72 — GALLA board ka dayein kinara ant me kata tha (0.2° bahar).
  // v4 me use nahi, code me rehta hai.
  WE: [[-0.35, 1.9, 5.3], [-1.1, 1.5, -3.2], 74, [-0.35, 1.9, 5.3], [-1.1, 1.5, -3.2], 74],
};

// ---------- SHOTS: [id, a, b, beat, loc, cam, who, speaker, charX, charZ, charS, R, L, tilt, crowd, board] ----------
// loc: 'A' street | 'B' gym (counter shots bhi B — counter cams T/TC/GB/HC) | 'C' home
//   | 'O' office | 'P' park. loc 'D' v4 me KHATAM.
// who: screen par kaun hai ('hero'|'orange'|'purple'); speaker: beat ka malik — v4 me
//   har shot me speaker===who (assert neeche; alag hua to rule violation).
// crowd: 'none' | 'arrive' (B: 3 queue gym; A: 3 walkers street, q43 me 6 walkers)
//   | 'jan' (13) | 'mar' (4) | 'janE' (11) | 'purple' (A: Member-Purple hero ke paas,
//   q11/q37) | 'colleague' (O: seed 211 colleague apni desk par, q31-q32)
//   | 'walkers' (P: 2 distant walkers, q39/q51).
// board: '' | 'fee' | 'galla' — EXPLICIT har shot me (table SCENE_PLAN_v4.md §4 hi
// source of truth hai). sub 0 har shot, koi remap helper nahi.
export const SHOTS = [
  // b01 HOOK — khaali sadak, dawn (L1-L2)
  ['q01', 0, 47, 'b01', 'A', 'SA', 'hero', 'hero', -1.0, -0.9, 1.05, 'reach', 'hang', 0, 'none', ''],
  ['q02', 47, 76, 'b01', 'A', 'SB2', 'hero', 'hero', -1.0, -0.9, 1.05, 'reach', 'hang', 0, 'none', ''],
  ['q03', 76, 104, 'b01', 'A', 'SC', 'hero', 'hero', -1.0, -0.9, 1.05, 'wave', 'hang', 0, 'none', ''],
  // b02 DEFINITION — gym kya hai, din (L3-L4)
  // q04: STILLS FIX (27 Nov, f0120) — TW me barbell plate hero ka chehra dhak rahi thi
  // (round-4 fix kaam nahi kiya — render proof). Ab 'A' (interior medium, q05 jaisa) —
  // plate hero ke peeche chhupi, chehra saaf. TW ab use nahi.
  ['q04', 104, 139, 'b02', 'B', 'A', 'hero', 'hero', -0.6, -2.6, 1.05, 'reach', 'hang', 0, 'none', ''],
  ['q05', 139, 173, 'b02', 'B', 'A', 'hero', 'hero', -0.6, -2.6, 1.05, 'lift', 'hang', 0, 'none', ''],
  ['q06', 173, 227, 'b02', 'B', 'B', 'hero', 'hero', -0.6, -2.6, 1.05, 'point', 'hang', 0, 'none', ''],
  // b03 KHOLA — shutter uthata hai, dawn (L5)
  ['q07', 227, 270, 'b03', 'A', 'SW', 'hero', 'hero', -1.0, -0.9, 1.05, 'up', 'hang', 0, 'none', ''],
  ['q08', 270, 313, 'b03', 'A', 'SA', 'hero', 'hero', -1.0, -0.9, 1.05, 'wave', 'hang', 0, 'none', ''],
  // b04 JANUARY — offer + bheed, din (L6-L9)
  ['q09', 313, 346, 'b04', 'B', 'B2', 'hero', 'hero', -1.2, -1.6, 1.05, 'reach', 'hang', 0, 'none', 'fee'],
  ['q10', 346, 379, 'b04', 'B', 'D2', 'hero', 'hero', 3.0, -4.6, 1.05, 'reach', 'hang', 0, 'none', 'fee'],
  ['q11', 379, 412, 'b04', 'A', 'SC2', 'hero', 'hero', -2.4, -0.4, 1.05, 'reach', 'hang', 0, 'purple', 'fee'],
  ['q12', 412, 457, 'b04', 'B', 'F', 'hero', 'hero', -1.2, -1.6, 1.05, 'point', 'hang', 0, 'none', 'fee'],
  ['q13', 457, 501, 'b04', 'B', 'F2', 'hero', 'hero', -1.2, -1.6, 1.05, 'point', 'hang', 0, 'none', 'fee'],
  ['q14', 501, 551, 'b04', 'A', 'SW', 'hero', 'hero', 0.0, 0.5, 1.05, 'wave', 'hang', 0, 'arrive', 'fee'],
  ['q15', 551, 593, 'b04', 'B', 'W2', 'hero', 'hero', -1.2, -1.6, 1.05, 'reach', 'hang', 0, 'jan', 'fee'],
  ['q16', 593, 635, 'b04', 'B', 'W2L', 'hero', 'hero', -1.2, -1.6, 1.05, 'point', 'hang', 0, 'jan', 'fee'],
  // b05 FEB/MARCH — ghar, chinta, subah 7:00 (L10-L12)
  ['q17', 635, 670, 'b05', 'C', 'HA', 'orange', 'orange', -2.2, -3.1, 1.0, 'hang', 'hang', 0, 'none', ''],
  ['q18', 670, 703, 'b05', 'C', 'HB2', 'orange', 'orange', -2.2, -3.1, 1.0, 'reach', 'hang', 0, 'none', ''],
  ['q19', 703, 739, 'b05', 'B', 'W2', 'hero', 'hero', -1.2, -1.6, 1.05, 'reach', 'hang', 0, 'mar', 'fee'],
  ['q20', 739, 773, 'b05', 'C', 'HB2', 'orange', 'orange', -2.2, -3.1, 1.0, 'temple', 'hang', -1, 'none', ''],
  ['q21', 773, 808, 'b05', 'B', 'B2', 'hero', 'hero', -1.2, -1.6, 1.05, 'temple', 'hang', -1, 'none', ''],
  ['q22', 808, 841, 'b05', 'C', 'HB2', 'orange', 'orange', -2.2, -3.1, 1.0, 'reach', 'hang', 0, 'none', ''],
  // b06 GALLA — twist, warm evening (L13-L16)
  ['q23', 841, 876, 'b06', 'B', 'T', 'hero', 'hero', 1.45, -4.3, 1.1, 'reach', 'hang', 0, 'none', 'galla'],
  ['q24', 876, 911, 'b06', 'B', 'TC', 'hero', 'hero', 1.45, -4.3, 1.1, 'reach', 'hang', 0, 'none', 'galla'],
  // q25: NAYA ADD (27 Nov) — top-down/high-angle (TD, STATIC): notes fan upar se.
  ['q25', 911, 951, 'b06', 'B', 'TD', 'hero', 'hero', 1.45, -4.3, 1.1, 'up', 'hang', 0, 'none', 'galla'],
  ['q26', 951, 988, 'b06', 'C', 'HB2', 'orange', 'orange', -2.2, -3.1, 1.0, 'hang', 'hang', 0, 'none', ''],
  ['q27', 988, 1021, 'b06', 'B', 'GB', 'hero', 'hero', 2.0, -4.3, 1.1, 'up', 'hang', 0, 'none', 'galla'],
  ['q28', 1021, 1057, 'b06', 'B', 'T', 'hero', 'hero', 1.45, -4.3, 1.1, 'belly', 'hang', 0, 'none', 'galla'],
  ['q29', 1057, 1091, 'b06', 'C', 'HD', 'purple', 'purple', -0.5, -3.6, 1.0, 'hang', 'hang', 0, 'none', ''],
  // b07 RULE — ghar/office, niyam (L17-L19)
  ['q30', 1091, 1141, 'b07', 'B', 'TC', 'hero', 'hero', 1.45, -4.3, 1.1, 'reach', 'hang', 0, 'none', ''],
  ['q31', 1141, 1190, 'b07', 'O', 'OB', 'purple', 'purple', 0.5, -2.6, 1.0, 'reach', 'hang', 0, 'colleague', ''],
  ['q32', 1190, 1235, 'b07', 'O', 'OA', 'purple', 'purple', 0.5, -2.6, 1.0, 'reach', 'hang', 0, 'colleague', ''],
  ['q33', 1235, 1279, 'b07', 'C', 'HW', 'orange', 'orange', 0.6, -4.0, 1.0, 'reach', 'hang', 0, 'none', ''],
  // b08 OFFER AGAIN — sadak, phir board (L20-L21)
  ['q34', 1279, 1312, 'b08', 'A', 'SA', 'hero', 'hero', -1.0, -0.9, 1.05, 'up', 'hang', 0, 'none', 'fee'],
  ['q35', 1312, 1344, 'b08', 'A', 'SB2', 'hero', 'hero', -0.7, -0.9, 1.05, 'reach', 'hang', 0, 'none', 'fee'],
  ['q36', 1344, 1387, 'b08', 'A', 'SW', 'hero', 'hero', 0.0, 0.5, 1.05, 'wave', 'hang', 0, 'arrive', 'fee'],
  ['q37', 1387, 1428, 'b08', 'A', 'SC3', 'hero', 'hero', -1.0, -0.9, 1.05, 'point', 'hang', 0, 'purple', 'fee'],
  // b09 EMPTY AGAIN — gym phir khaali / park (L22)
  ['q38', 1428, 1470, 'b09', 'B', 'W2', 'hero', 'hero', -1.2, -1.6, 1.05, 'reach', 'hang', 0, 'mar', 'fee'],
  ['q39', 1470, 1510, 'b09', 'P', 'PA', 'orange', 'orange', 0, 0.5, 1.0, 'hang', 'hang', 0, 'walkers', ''],
  // b10 GALLA AGAIN — offer badha, galla bhara (L23-L24)
  ['q40', 1510, 1544, 'b10', 'B', 'T', 'hero', 'hero', 1.45, -4.3, 1.1, 'reach', 'hang', 0, 'none', 'fee'],
  ['q41', 1544, 1576, 'b10', 'B', 'GB', 'hero', 'hero', 2.0, -4.3, 1.1, 'point', 'hang', 0, 'none', 'galla'],
  ['q42', 1576, 1621, 'b10', 'B', 'TC', 'hero', 'hero', 1.45, -4.3, 1.1, 'reach', 'hang', 0, 'none', 'galla'],
  // b11 WHAT-IF — packed gym (L25-L27)
  ['q43', 1621, 1651, 'b11', 'A', 'SW', 'hero', 'hero', -1.6, 0.3, 1.05, 'up', 'up', 0, 'arrive', ''],
  ['q44', 1651, 1679, 'b11', 'B', 'W2', 'hero', 'hero', -1.2, -1.6, 1.05, 'reach', 'hang', 0, 'jan', 'galla'],
  ['q45', 1679, 1727, 'b11', 'B', 'W2R2', 'hero', 'hero', -1.2, -1.6, 1.05, 'hang', 'hang', 0, 'jan', 'galla'],
  ['q46', 1727, 1761, 'b11', 'B', 'B2', 'hero', 'hero', -1.2, -1.6, 1.05, 'up', 'hang', 0, 'none', 'galla'],
  ['q47', 1761, 1794, 'b11', 'C', 'HD', 'purple', 'purple', -0.5, -3.6, 1.0, 'hang', 'hang', 0, 'none', ''],
  // b12 CHECK + LOOP — sadak, kal subah phir (L28-L30)
  ['q48', 1794, 1830, 'b12', 'P', 'PB', 'orange', 'orange', 0, 0.5, 1.0, 'reach', 'hang', 0, 'none', ''],
  ['q49', 1830, 1864, 'b12', 'A', 'SB2', 'hero', 'hero', -1.0, -0.9, 1.05, 'reach', 'hang', 0, 'none', ''],
  ['q50', 1864, 1898, 'b12', 'A', 'SC', 'hero', 'hero', -1.0, -0.9, 1.05, 'up', 'hang', 0, 'none', ''],
  ['q51', 1898, 1931, 'b12', 'P', 'PA', 'orange', 'orange', 0, 0.5, 1.0, 'up', 'hang', 0, 'walkers', ''],
  // q52: NAYA ADD (27 Nov) — low-angle (LA, STATIC): sadak se upar, hero shutter peek.
  ['q52', 1931, 1976, 'b12', 'A', 'LA', 'hero', 'hero', -1.0, -0.9, 1.05, 'up', 'hang', 0, 'none', ''],
  ['q53', 1976, 2025, 'b12', 'A', 'SR', 'hero', 'hero', -1.0, -0.9, 1.05, 'cross', 'cross', 0, 'none', ''],
];
const SHOTMAP = {};
SHOTS.forEach(([id, a, b, beat, loc, cam, who, speaker, cx, cz, cs, R, L, tilt, crowd, board]) => {
  if (who !== speaker) throw new Error(`v4 speaker rule violation: ${id} who=${who} speaker=${speaker}`);
  SHOTMAP[id] = { id, a, b, beat, loc, cam: CAMS[cam], camName: cam, who, speaker, cx, cz, cs, R, L, tilt, crowd, board, sub: 0, len: b - a };
});
export const BEAT_OF = {}; SHOTS.forEach((s) => { BEAT_OF[s[0]] = s[3]; });
export const BEAT_SPAN = {
  b01: [0, 104], b02: [104, 227], b03: [227, 313], b04: [313, 635], b05: [635, 841],
  b06: [841, 1091], b07: [1091, 1279], b08: [1279, 1428], b09: [1428, 1510],
  b10: [1510, 1621], b11: [1621, 1794], b12: [1794, 2025],
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
