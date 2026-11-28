// "Kirana Udhaar" — FULL BUILD (49 shots, 1805f @30fps = 60.16 s).
// Title: "Dukaan Khaali, Khata ₹50,000!" — Hero RAJU (~28, muted teal kurta,
// NARANGI GAMCHHA (toga + togaPrint, signature prop), gol chehra, moochh, garam skin).
// Voice (LOCKED): kirana-narration.mp3 — 60.16 s, Jovial 118 mastered, -15.91 LUFS.
// Line windows (frames @30fps, faster-whisper VERIFIED 28 Nov 2026 against the real
// mp3 — max drift vs plan estimate 0.21 s):
// L1 0-94 | L2 94-193 | L3 193-269 | L4 269-342 | L5 342-413 | L6 413-493
// | L7 493-557 | L8 557-627 | L9 627-691 | L10 691-783 | L11 783-871 | L12 871-936
// | L13 936-1047 | L14 1047-1155 | L15 1155-1231 | L16 1231-1307 | L17 1307-1387
// | L18 1387-1459 | L19 1459-1511 | L20 1511-1600 | L21 1600-1691 | L22 1691-1801.
// Beats (15, CONTIGUOUS, 0-1804, no gaps): b01 HOOK dukaan subah (L1) | b02 DEFINITION
// dukaan (L2) | b03 KHOLA dukaan-front (L3) | b04 BAZAAR mandi (L4) | b05 UDHAAR counter
// (L5) | b06 DIN tarazu (L6) | b07 KHAALI GALLA counter (L7-L8) | b08 GHABRAHAT ghar
// (L9) | b09 KHATA REVEAL counter (L10) | b10 NIYAM counter (L11-L12) | b11 KHATA BADA
// gali (L13) | b12 RIVAL supermarket (L14-L15) | b13 ROZ AATA gali (L16) | b14 TANKHWAAH
// dukaan queue (L17-L18) | b15 GALLA + LOOP counter (L19-L22).
// Shots: 49, avg 37f (1.23 s), range 26-52f — har line 1-3 shots me, shot boundaries
// LINE boundaries par (split sirf line ke andar, natural midpoint par); pace lock
// 1-1.5 s/shot (user, 27 Nov) — L19 ek 52f push-in (galla reveal, ek hi saans me),
// L22 aakhri shot 40f. 9 push-in (number/chehre par) / 40 static (~82% static).
// NO captions. Numbers as objects: bori dher + "₹4,00,000" rate board (₹4 lakh), khata
// line (₹10,000), galla + cash + GALLA board (₹50,000). "₹4 lakh" kabhi board par nahi.
// LIP-SYNC: envelope.js (kirana master se per-frame RMS) — mouth = smoothed ENV,
// gain 1.7, 0.035 se neeche = band. Lip-sync SIRF hero shots me (sab 49 hero shots hain).
// STILLS RESIDUALS (28 Nov, full build me fix — SCENE_PLAN.md R2 + parent audit):
// - 06/09 dark counter front aadha frame khata tha → DT2/KC2: camera upar (y 2.0/2.1),
//   look upar (y 1.35/1.0), push-in — counter front ab neeche ki patti bhar hai.
// - 07 "NA STORE" board upar-bayein kata tha → DG2: camera peeche (z 3.5) + look
//   (2.0,1.3,-3.6), fov 54 — hisaab se board (x 0.3..1.7) poora frame ke andar,
//   ghadi (-2.3,3.4) frame se poori bahar (35° off-axis). Visual QA me verify.
// - 12 farsh ~35% khaali tiles → SW2: closer (z 3.0, fov 50), look neeche (y 1.35);
//   b12 me 5 shots, sirf 1 wide — farsh kabhi dominate nahi karta.
// - 14 4th queue face peeking + clock kinare kata → D-queue layout BADLA (main.js):
//   4 chehre fan-out (2.0,-2.0)->(0.8,-3.5), koi kisi ke peeche nahi; PQ2 look
//   (1.4,1.5,-4.0) — clock frame se poori bahar (exclude = valid fix).
// - 15 pointing finger crisp nahi → DL4: pointcam CLOSE (hero 4.3m, fov 46) —
//   bada haath + lambi ungli frame me saaf; q49 loop me bhi pointcam.
// OCCLUDERS (props between camera and hero text/face — checked per shot, see QA log):
// D (dukaan interior): counter + galla lid (below face line), tarazu (below face line,
// q13/q14 me hero ke saamne lekin chehre se neeche), khata (counter par, face-line se neeche;
// q21 KC2 me khata neeche, chehra upar), shelves + dabbe (behind hero), bori sacks
// (floor, below face line), hanging bulb + wire (above, ceiling se), "KIRANA STORE" board
// (above shelves, above face line — q15 DG2 me poora frame ke andar), GALLA board
// (above counter, above face line, b15), calendar (above, face-line se upar), wall clock
// (above — q38 PQ2 me frame se bahar).
// F (dukaan front): shutter slats (behind hero jab khula), sign board (above face line —
// q08 DS2 me frame se bahar, shutter + hero par focus), bori stack (left, below face
// line), thela (right edge, below face line), lamp post (left edge, off face-line),
// parked cycle (right, below face-line).
// Z (bazaar): bori dher (behind hero, below face line), thela (side), sabzi tokre
// (floor, below face line), tarpaulin poles (sides, off face-line), rate board
// (dher ke saamne, hero se bayein, face-line se neeche).
// C (ghar): table + cup + khata (below face line), bed headboard (behind hero),
// wall calendar + ghadi (above face line), hanging bulb + wire (above), light cone
// (additive, behind hero), shelf (above).
// S (supermarket): steel shelves + packets (behind hero), UPI board (above, face-line se
// upar), trolley (below face line, hero ke bagal me — q31 SW me door), rival manager
// (beside hero, never in front of face), fluorescent panels (ceiling, above).
// G (gali): houses (behind), cycle (side, below face line), kapde ki rassi (above,
// face-line se upar), baccha/walkers (background, off face-line).
// NO sub-remapping: every shot's sub is explicit below (sub 0 each); no remap helper exists.
import { clamp } from './motion.js';
import { ENV } from './envelope.js';

export const FPS = 30;
export const TOTAL = 1805;

// ---------- lines (locked script v3, faster-whisper verified) ----------
export const LINES = [
  ['L1', 0, 94], ['L2', 94, 193], ['L3', 193, 269], ['L4', 269, 342], ['L5', 342, 413],
  ['L6', 413, 493], ['L7', 493, 557], ['L8', 557, 627], ['L9', 627, 691], ['L10', 691, 783],
  ['L11', 783, 871], ['L12', 871, 936], ['L13', 936, 1047], ['L14', 1047, 1155],
  ['L15', 1155, 1231], ['L16', 1231, 1307], ['L17', 1307, 1387], ['L18', 1387, 1459],
  ['L19', 1459, 1511], ['L20', 1511, 1600], ['L21', 1600, 1691], ['L22', 1691, 1801],
];
export const LINE_STARTS = LINES.map(([, a]) => a);

// ---------- lip-sync: mouth openness 0..1 from the voice RMS envelope ----------
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
// [frame, expr] — chehra 12 frames me morph karta hai (toon.js mix: brow lerp + eye switch).
const EXPR_KEYS = [
  [0, 'smile'], [94, 'smile'], [193, 'grin'], [269, 'grin'], [342, 'smile'],
  [413, 'smile'], [493, 'nervous'], [627, 'nervous'], [691, 'shock'], [783, 'smile'],
  [871, 'smile'], [936, 'grin'], [1047, 'smile'], [1155, 'smile'], [1231, 'grin'],
  [1307, 'smile'], [1387, 'smile'], [1459, 'grin'], [1691, 'grin'],
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

// ---------- galla angle (radians, 0 = band, 1.2 = 69° khula) ----------
// f<493 band; 493->525 khulta (KHAALI — L7); 525-627 khula khaali; 627->660 band;
// 660-1459 band; 1459->1485 khulta (BHARA — L19); 1485+ khula bhara.
export function gallaAngle(f) {
  if (f < 493) return 0;
  if (f < 525) return 1.2 * clamp((f - 493) / 32);
  if (f < 627) return 1.2;
  if (f < 660) return 1.2 * (1 - clamp((f - 627) / 33));
  if (f < 1459) return 0;
  if (f < 1485) return 1.2 * clamp((f - 1459) / 26);
  return 1.2;
}
// Galla kab bhara hai (cash dher dikhe): sirf L19 ke baad (f>=1459).
export const gallaFull = (f) => f >= 1459;
// Galla kab khaali-khula hai (andar khaali dikhe): L7-L8 (493-627).
export const gallaEmptyOpen = (f) => f >= 493 && f < 627;

// ---------- shutter openness, dukaan front (0 = band, 0.55 = aadha khula) ----------
// f<193 band; 193->245 khulta (L3 "dukaan kholi"); f255 par HALF-RAISED (gap 0..1.65
// roshni + andar shelves dikhte) — F2 fix: pehle ramp itna dheela tha ki f255 par
// shutter aadha band lagta tha. 245+ khula (0.55).
export function shutterOpen(f) {
  if (f < 193) return 0;
  if (f < 245) return 0.55 * clamp((f - 193) / 52);
  return 0.55;
}

// ---------- camera presets: [startPos, startLook, fov, endPos, endLook, endFov] ----------
// STATIC presets me end = start. PUSH-IN presets me end pos/fov alag hain (sirf
// number/chehre par — Gullak checklist point 12). Koi pan/orbit/low/Dutch nahi.
export const CAMS = {
  // ---- LOC D — dukaan interior (back wall z=-6, counter 2.6,-3.4) ----
  // DW: WIDE — F1/F9 FIX: closer + lower + look higher (z 5.6->3.4, fov 52->50) —
  // floor ~45% -> ~25%, hero bada, aadhi shelf + counter dono frame me.
  DW: [[0.6, 1.7, 3.4], [1.2, 1.55, -4.2], 50, [0.6, 1.7, 3.4], [1.2, 1.55, -4.2], 50],
  // DW2: WIDE bayein se — aadhi shelf + hero + counter, DW se alag angle (q02).
  DW2: [[-3.2, 1.8, 2.2], [1.8, 1.4, -4.2], 55, [-3.2, 1.8, 2.2], [1.8, 1.4, -4.2], 55],
  // DHC: hero CLOSE, push-in (q03) — hook ka chehra, khata dikhata.
  DHC: [[2.1, 1.9, 0.5], [3.0, 1.3, -4.0], 46, [2.15, 1.85, 0.0], [3.0, 1.3, -4.0], 43],
  // DI: MEDIUM — F11 FIX: peeche hatha (z 1.6->2.8) taaki ghadi (-2.3) + calendar
  // dono poore frame me aayein; hero shelf se dabba uthata, bhari shelves peeche.
  // ROUND-2: look y 1.4->1.55 (farsh ~30% -> ~25%).
  DI: [[-2.6, 1.7, 2.8], [-1.0, 1.55, -4.2], 50, [-2.6, 1.7, 2.8], [-1.0, 1.55, -4.2], 50],
  // DI2: MEDIUM dayein se — hero + bhari shelves, DI se alag angle (q05).
  DI2: [[1.8, 1.7, 2.6], [-1.8, 1.4, -4.6], 50, [1.8, 1.7, 2.6], [-1.8, 1.4, -4.6], 50],
  // DSH: shelf CLOSE — hero ka haath + dabba + shelf detail (q06).
  DSH: [[-0.6, 1.9, 0.2], [-2.2, 1.7, -5.6], 44, [-0.6, 1.9, 0.2], [-2.2, 1.7, -5.6], 44],
  // DC: MEDIUM — counter dayein se: hero khata me likhta, graahak saamne.
  // ROUND-2: tighten WAPAS (round-1 DC ne aunty + board kaat diye the — regression).
  // Original geometry + look y 1.2->1.3 (farsh halka kam), aunty (1.5,-2.2) pe.
  DC: [[3.0, 1.8, 1.8], [1.8, 1.3, -3.6], 50, [3.0, 1.8, 1.8], [1.8, 1.3, -3.6], 50],
  // DC2: MEDIUM bayein se — khata + hero + aunty, DC se alag angle (q12).
  DC2: [[2.2, 2.0, -0.8], [2.45, 1.0, -3.6], 44, [2.25, 1.95, -1.0], [2.45, 1.0, -3.6], 42],
  // DT: CLOSE — F4 FIX: closer (z 1.2->0.6, fov 52->48) — khaali beige deewaar
  // upar se kati, tarazu + KHATA cover bada aur readable. (Stills s06; full build
  // me DT2 use hota hai — DT code me rehta hai.)
  DT: [[2.5, 1.85, 0.6], [2.4, 1.2, -3.6], 48, [2.5, 1.85, 0.6], [2.4, 1.2, -3.6], 48],
  // DT2: tarazu CLOSE push-in (q13) — STILLS RESIDUAL 06 FIX: camera upar
  // (y 2.0), look upar (y 1.35) — dark counter front ab neeche ki patti bhar hai.
  DT2: [[2.2, 2.6, -0.5], [2.2, 1.0, -3.6], 44, [2.25, 2.55, -0.7], [2.2, 1.0, -3.6], 42],
  // DT3: tarazu side angle bayein se (q14) — tarazu profile + hero.
  DT3: [[3.6, 1.9, 0.0], [2.5, 1.5, -3.8], 50, [3.6, 1.9, 0.0], [2.5, 1.5, -3.8], 50],
  // DG: MEDIUM — F10 FIX: closer (z 2.6->1.8, fov 54->50) — khaali deewaar/farsh kam,
  // hero galla kholta, pareshan. ROUND-2: bayein shift (pos x 0.4->0.0, look x
  // 2.4->2.0) taaki calendar poora frame me aaye ("MBER" kata tha) aur baccha
  // (1.5,-1.6) poora andar aaye. (Stills s07; full build me DG2 use hota hai.)
  DG: [[0.0, 1.6, 1.8], [2.0, 1.3, -3.6], 50, [0.0, 1.6, 1.8], [2.0, 1.3, -3.6], 50],
  // DG2: galla anchor WIDE (q15) — STILLS RESIDUAL 07 FIX: camera peeche (z 3.5),
  // fov 54 — hisaab se "KIRANA STORE" board (x 0.3..1.7, ~9.5m) poora andar
  // (left edge -13.1° vs half-fov 16°), ghadi (-2.3,3.4) 35° off-axis = bahar.
  DG2: [[0.5, 1.7, 3.5], [2.0, 1.5, -3.6], 54, [0.5, 1.7, 3.5], [2.0, 1.5, -3.6], 54],
  // DG3: galla CLOSE push-in (q16) — khaali galla andar se, hero pareshan.
  DG3: [[2.8, 1.9, 0.0], [3.0, 1.1, -3.5], 44, [2.85, 1.85, -0.2], [3.0, 1.1, -3.5], 42],
  // DG4: hero face MEDIUM bayein se (q17) — "paisa ek bhi nahi aaya" ka chehra.
  DG4: [[0.5, 1.7, 0.5], [2.8, 1.2, -3.6], 48, [0.5, 1.7, 0.5], [2.8, 1.2, -3.6], 48],
  // DG5: galla side angle dayein se (q18) — hero + khaali galla, DG2 se alag.
  DG5: [[-0.5, 1.7, 1.0], [2.8, 1.3, -3.8], 54, [-0.5, 1.7, 1.0], [2.8, 1.3, -3.8], 54],
  // KC: CLOSE — khata ECU-ish: khula khata + hero ki ungli "₹10,000" line par, chehra saaf.
  // (Stills s09; full build me KC2 use hota hai.)
  KC: [[2.6, 2.0, -0.9], [2.5, 0.95, -3.6], 46, [2.6, 2.0, -0.9], [2.5, 0.95, -3.6], 46],
  // KC2: khata ECU push-in (q21) — STILLS RESIDUAL 09 FIX: camera upar (y 2.1),
  // look y 1.0 — counter front neeche ki patti bhar, "₹10,000" bada readable.
  KC2: [[2.45, 2.6, -1.2], [2.5, 1.25, -3.7], 44, [2.45, 2.55, -1.4], [2.5, 1.25, -3.7], 42],
  // KC3: hero face + khata MEDIUM (q22) — R1 FIX: purana KC3 me dark counter
  // front ~45% frame khata tha. Tighter + upar (y 1.95, look y 1.35, fov 46) —
  // counter front neeche ki patti bhar, khata + chehra bade.
  KC3: [[1.6, 2.3, -0.2], [2.55, 1.1, -3.9], 46, [1.6, 2.3, -0.2], [2.55, 1.1, -3.9], 46],
  // KC4: khata side angle dayein se (q23) — KC3 jaisa fix (upar + look upar).
  KC4: [[3.4, 2.0, 0.9], [2.4, 1.35, -3.8], 48, [3.4, 2.0, 0.9], [2.4, 1.35, -3.8], 48],
  // DN: MEDIUM — F6 FIX: hero ki taraf (pos 0.2->0.6, z 2.2->1.6, fov 56) —
  // hero bada, aunty peeche-chhoti; khaali upar-deewaar kati.
  DN: [[0.6, 1.7, 1.6], [2.0, 1.35, -3.8], 56, [0.6, 1.7, 1.6], [2.0, 1.35, -3.8], 56],
  // DN2: niyam MEDIUM dayein se (q25) — hero khata uthata, aunty wapas.
  DN2: [[3.8, 1.7, 0.8], [1.8, 1.3, -3.8], 52, [3.8, 1.7, 0.8], [1.8, 1.3, -3.8], 52],
  // DN3: wapas-aayi aunty CLOSE (q26) — aunty + hero, chukane ka action.
  DN3: [[3.2, 1.7, 1.4], [2.2, 1.3, -3.2], 54, [3.2, 1.7, 1.4], [2.2, 1.3, -3.2], 54],
  // DN4: hero CLOSE push-in (q27) — "woh wapas aayega" ka chehra.
  DN4: [[2.2, 1.9, -0.2], [2.5, 1.2, -3.8], 46, [2.25, 1.85, -0.4], [2.5, 1.2, -3.8], 44],
  // PQ: WIDE — F8 FIX: DW jaisa frontal NAHI. ROUND-8: side PQ (dayein se) me
  // held khata hamesha hero ke chehre ya galla se ladta tha (rx 0.3/0.45/-0.05/
  // -0.2, y 1.6/1.45/1.35 — 5 koshish, har baar chehra ya kinara kata). Root
  // cause: side camera se prop ka forward-offset (+x) use galla ki taraf dhakel
  // deta hai. Ab PQ FRONTAL-CLOSE hai (pos 2.0,1.9,1.8, look 2.0,1.3,-3.8,
  // fov 58) — DW se alag (DW wide + bayein se, PQ close + dayein se, queue
  // saamne), prop seedha chest par aata hai (chehre se neeche, galla se door).
  // (Stills s14; full build me PQ2 use hota hai — clock residual fix.)
  PQ: [[2.0, 1.9, 1.8], [2.0, 1.3, -3.8], 58, [2.0, 1.9, 1.8], [2.0, 1.3, -3.8], 58],
  // PQ2: tankhwaah anchor (q38) — STILLS RESIDUAL 14 FIX: look (1.4,1.5,-4.0),
  // fov 56 — ghadi (-2.3,3.4) frame se poori bahar (exclude = valid fix);
  // queue naya fan-out layout (main.js) — 4th face peeking khatm.
  PQ2: [[1.2, 1.9, 2.2], [1.4, 1.5, -4.0], 56, [1.2, 1.9, 2.2], [1.4, 1.5, -4.0], 56],
  // PQ3: tankhwaah side angle bayein se (q39) — queue + hero khata kaat-ta.
  PQ3: [[-1.2, 1.7, 2.2], [1.4, 1.15, -3.2], 54, [-1.2, 1.7, 2.2], [1.4, 1.15, -3.2], 54],
  // PQ4: queue CLOSE push-in (q40) — 4 chehre, khata khaali hota.
  PQ4: [[0.5, 1.7, 0.0], [1.6, 1.3, -2.6], 50, [0.55, 1.65, -0.2], [1.6, 1.3, -2.6], 48],
  // PQ5: hero khata CLOSE (q41) — naam kaat-ta, khata readable.
  PQ5: [[2.4, 1.9, -0.4], [2.5, 1.15, -4.0], 46, [2.4, 1.9, -0.4], [2.5, 1.15, -4.0], 46],
  // DL: loop rhyme = DW geometry (q49, s01 jaisa angle, alag samajh).
  DL: [[0.6, 1.7, 3.4], [1.2, 1.55, -4.2], 50, [0.6, 1.7, 3.4], [1.2, 1.55, -4.2], 50],
  // DL2: galla reveal MEDIUM (q42, L19 poora 52f) — R1 FIX: purana DL2 push-in
  // (fov 44->42) me GALLA board upar kata tha. Ab STATIC fov 50, look y 1.4 —
  // board poora andar (margin ~2°), khulta galla + cash hi shot ki motion hai.
  DL2: [[2.6, 1.9, 0.2], [2.9, 1.4, -3.5], 50, [2.6, 1.9, 0.2], [2.9, 1.4, -3.5], 50],
  // DL3: GALLA board + hero MEDIUM (q48) — board poora + hero.
  DL3: [[0.8, 1.7, 1.4], [1.6, 1.6, -3.5], 52, [0.8, 1.7, 1.4], [1.6, 1.6, -3.5], 52],
  // DL4: pointcam CLOSE (q43) — STILLS RESIDUAL 15 FIX: hero 4.3m, fov 46 —
  // bada haath + lambi ungli saaf padhti hai (toon.js pointcam bigHand).
  DL4: [[1.9, 1.85, 0.3], [2.75, 1.45, -3.95], 46, [1.9, 1.85, 0.3], [2.75, 1.45, -3.95], 46],
  // DL5: khata CLOSE (q45, L21) — held khula khata, "₹10,000" line.
  DL5: [[2.3, 2.0, -0.5], [2.45, 1.0, -3.6], 44, [2.3, 2.0, -0.5], [2.45, 1.0, -3.6], 44],
  // DL7: loop left WIDE (q47) — dukaan bayein se, subah roshni.
  DL7: [[-2.8, 1.8, 2.0], [1.5, 1.4, -4.0], 54, [-2.8, 1.8, 2.0], [1.5, 1.4, -4.0], 54],
  // DL8: cash heap CLOSE push-in (q44) — ₹50,000 ka dher.
  DL8: [[2.4, 1.9, 0.2], [2.8, 1.3, -3.6], 48, [2.45, 1.85, 0.0], [2.8, 1.3, -3.6], 46],
  // DL9: hero + khata MEDIUM (q46) — "kitne log wapas aate hain".
  DL9: [[1.0, 1.8, 1.0], [2.5, 0.9, -3.6], 48, [1.0, 1.8, 1.0], [2.5, 0.9, -3.6], 48],
  // ---- LOC F — dukaan front exterior (facade z=-2) ----
  // DS: MEDIUM — F2 FIX: closer + wider (z 5.0->4.2, fov 60->64) — kaali sadak
  // neeche ~25% -> ~15%, shutter + hero + walkers sab frame me. ROUND-2: dayein
  // shift (pos x 0.3->0.6, look x -0.5->-0.2, look y 1.3->1.45) — sign ka dayein
  // kinara + baccha (z -1.2, facade ke saamne) poore frame me, sadak ~18% -> ~12%.
  DS: [[0.6, 1.6, 4.2], [-0.2, 1.45, -1.2], 64, [0.6, 1.6, 4.2], [-0.2, 1.45, -1.2], 64],
  // DS2: shutter CLOSE bayein se (q08) — hero + uthta shutter, sign frame se
  // bahar (look neeche) taaki kata sign kabhi na dikhe.
  DS2: [[-2.0, 1.5, 1.8], [-1.0, 1.0, -1.2], 46, [-2.0, 1.5, 1.8], [-1.0, 1.0, -1.2], 46],
  // ---- LOC Z — bazaar/mandi (bori dher z -3..-5) ----
  // BW: WIDE — F3 FIX: neeche + paas (y 1.55->1.1, z 5.0->1.8, fov 62->56) —
  // khaali aasmaan ~30% -> ~20%, khaali mitti ~40% -> ~29%, dher + hero bade.
  // ROUND-2: peeche + chauda (z 1.8->2.6, fov 56->60, look y 1.1->1.3) — 5 ki
  // bheed + carry-bori poori frame me, mitti ~35% -> ~25%.
  // ROUND-3: camera neechi (y 1.1->0.95) + look upar (1.3->1.4) — horizon upar,
  // khaali mitti ~30% -> ~22%.
  BW: [[-0.9, 0.95, 2.6], [-0.7, 1.4, -3.0], 60, [-0.9, 0.95, 2.6], [-0.7, 1.4, -3.0], 60],
  // BW2: bazaar dayein se (q10) — R1 FIX: purana BW2 se hero rate board ko dhak
  // raha tha (₹4,00,000 ka beech hero ke peeche). Ab camera dayein (scale/khuli
  // bori ki taraf), board frame se bahar (bayein); hero (0.8,-2.2) scale ke paas.
  BW2: [[3.0, 1.4, 2.2], [1.0, 1.2, -3.2], 50, [3.0, 1.4, 2.2], [1.0, 1.2, -3.2], 50],
  // ---- LOC C — ghar (back wall z=-5, bed bayein) ----
  // HC: MEDIUM — hero bistar ke paas baitha, khata haath me, pareshan, light cone.
  HC: [[-0.8, 1.7, 0.4], [-1.6, 1.25, -3.4], 52, [-0.8, 1.7, 0.4], [-1.6, 1.25, -3.4], 52],
  // HC2: ghar MEDIUM dayein se (q20) — hero + table + khidki, HC se alag.
  HC2: [[1.2, 1.6, 0.8], [-1.8, 1.2, -3.2], 50, [1.2, 1.6, 0.8], [-1.8, 1.2, -3.2], 50],
  // ---- LOC S — supermarket (shelves z -3..-5, cool) ----
  // SW: WIDE — F11 FIX: closer (z 5.2->4.0, fov 58->54) — khaali farsh/chhat kam,
  // rival + hero bade, UPI board saaf. ROUND-2: look y 1.3->1.4 (chhat/farsh
  // halka kam) + trolley (1.0,0,-0.6) foreground me — farsh khaali nahi lagta.
  // ROUND-3: trolley foreground me BAHUT badi thi (hero ki taangein dhak di) —
  // trolley (1.4,0,-2.6) hero ke bagal me; look y 1.4->1.15 (neeche dekho —
  // farsh ~35% -> ~30%, UPI board upar rehta hai).
  SW: [[0.3, 1.65, 4.0], [0.2, 1.15, -3.2], 54, [0.3, 1.65, 4.0], [0.2, 1.15, -3.2], 54],
  // SW2: supermarket MEDIUM (q34) — STILLS RESIDUAL 12 FIX: closer (z 3.0),
  // fov 50, look y 1.35 — farsh ~35% -> ~20%, rival + hero bade.
  SW2: [[0.3, 1.55, 3.0], [0.2, 1.35, -3.2], 50, [0.3, 1.55, 3.0], [0.2, 1.35, -3.2], 50],
  // SW3: rival CLOSE push-in (q32) — hansta manager, bhaav-graph (hansi).
  SW3: [[0.4, 1.7, 2.0], [0.7, 1.4, -2.4], 50, [0.45, 1.65, 1.8], [0.7, 1.4, -2.4], 48],
  // SW4: UPI board + hero MEDIUM (q33) — "khata band karo, UPI lo!" ka board.
  SW4: [[2.2, 1.7, 1.0], [1.2, 1.8, -5.0], 50, [2.2, 1.7, 1.0], [1.2, 1.8, -5.0], 50],
  // SW5: shopper-once MEDIUM (q35) — graahak ek baar aata hai, hero dekhta.
  SW5: [[-0.8, 1.6, 2.5], [0.5, 1.3, -3.0], 52, [-0.8, 1.6, 2.5], [0.5, 1.3, -3.0], 52],
  // ---- LOC G — mohalla gali (sadak x-axis, makaan dono taraf) ----
  // DQ: WIDE — F5 FIX: ROUND-2: pehla tight DQ FAIL tha (hero 2.3m par BAHUT bada,
  // queue uske peeche chhup gayi). Ab WIDE peeche se (z 1.8->4.2, fov 54->58) —
  // hero (0.2,-0.4) dayein, queue bayein aade-tirchhe (-2.2,-1.6)->(-1.0,-2.5),
  // sab chehre saaf, koi occlusion nahi.
  DQ: [[0.8, 1.7, 4.2], [-0.9, 1.25, -1.8], 58, [0.8, 1.7, 4.2], [-0.9, 1.25, -1.8], 58],
  // DQ2: gali WIDE dayein se (q29) — R1 FIX: purana DQ2 (bayein se, look dayein)
  // se poori queue (-2.2..-1.0) frame se bahar thi (sirf C3 kinare jhaankta tha).
  // Ab dayein se bayein dekho — queue + hero + dukaan sab andar, cycle peeche.
  DQ2: [[2.5, 1.7, 3.8], [-0.9, 1.25, -1.8], 58, [2.5, 1.7, 3.8], [-0.9, 1.25, -1.8], 58],
  // DQ3: queue CLOSE (q30) — khata me naya naam likhta, line peeche.
  DQ3: [[1.5, 1.6, 2.8], [-1.2, 1.2, -2.0], 50, [1.5, 1.6, 2.8], [-1.2, 1.2, -2.0], 50],
  // GA: MEDIUM — F7 FIX: ROUND-2: hero (-0.7->-0.5) + uncle (0.8->0.5) paas,
  // camera peeche (z 2.6->3.0, pos x 0.7->0.4, look x 0.0->-0.1, fov 54->56) —
  // dono chehre kinare se andar, cash beech me, "ORE" sign poora frame se bahar.
  GA: [[0.4, 1.55, 3.0], [-0.1, 1.25, -1.5], 56, [0.4, 1.55, 3.0], [-0.1, 1.25, -1.5], 56],
  // GA2: gali MEDIUM bayein se (q37) — uncle cash deta, hero muskurata.
  GA2: [[-1.8, 1.6, 2.5], [0.3, 1.25, -1.2], 54, [-1.8, 1.6, 2.5], [0.3, 1.25, -1.2], 54],
};

// ---------- SHOTS: [id, a, b, beat, loc, cam, who, speaker, charX, charZ, charS, R, L, tilt, crowd, board] ----------
// loc: 'D' dukaan interior | 'F' dukaan front | 'Z' bazaar | 'C' ghar | 'S' supermarket | 'G' gali.
// who: hamesha 'hero' (narration hero ki hai, speaker-visible rule — 49/49 hero on-screen).
// crowd: 'none' | 'aunty' (D: Graahak-Aunty counter par) | 'child' (D q15: baccha galla
//   dekhta) | 'return' (D b10: wahi aunty wapas, cash dene) | 'queue' (D b14: tankhwaah
//   line — naya fan-out layout; G b11: gali me line) | 'bazaar' (Z: mandi bheed 5)
//   | 'shoppers' (S: 2 shoppers) | 'uncle' (G b13: Graahak-Uncle cash deta)
//   | 'walkers' (F: background walkers + baccha).
// board: '' | 'galla' — EXPLICIT har shot me (b15 ke 8/8 me 'galla' — number ant tak
//   screen par). sub 0 har shot, koi remap helper nahi.
export const SHOTS = [
  // b01 HOOK — aadhi dukaan, phir bhi ₹50,000 (L1) — DW WIDE, subah garam.
  ['q01', 0, 31, 'b01', 'D', 'DW', 'hero', 'hero', 2.6, -3.95, 1.3, 'reach', 'hang', 0, 'aunty', ''],
  ['q02', 31, 63, 'b01', 'D', 'DW2', 'hero', 'hero', 2.6, -3.95, 1.3, 'reach', 'hang', 0, 'aunty', ''],
  ['q03', 63, 94, 'b01', 'D', 'DHC', 'hero', 'hero', 2.6, -3.95, 1.3, 'reach', 'hang', 0, 'aunty', ''],
  // b02 DEFINITION — kirana kya hai (L2) — DI MEDIUM, hero shelf se dabba uthata.
  ['q04', 94, 127, 'b02', 'D', 'DI', 'hero', 'hero', -2.5, -4.6, 1.05, 'reach', 'hang', 0, 'aunty', ''],
  ['q05', 127, 160, 'b02', 'D', 'DI2', 'hero', 'hero', -2.5, -4.6, 1.05, 'reach', 'hang', 0, 'aunty', ''],
  ['q06', 160, 193, 'b02', 'D', 'DSH', 'hero', 'hero', -2.5, -4.6, 1.05, 'reach', 'hang', 0, 'none', ''],
  // b03 KHOLA — dukaan kholi, saamaan bhar ke (L3) — DS MEDIUM, shutter khulta.
  ['q07', 193, 231, 'b03', 'F', 'DS', 'hero', 'hero', -1.0, -0.9, 1.05, 'up', 'hang', 0, 'walkers', ''],
  ['q08', 231, 269, 'b03', 'F', 'DS2', 'hero', 'hero', -1.0, -0.9, 1.05, 'up', 'hang', 0, 'none', ''],
  // b04 BAZAAR — chaar lakh ka saamaan (L4) — BW WIDE, hero mandi me bori uthata.
  ['q09', 269, 305, 'b04', 'Z', 'BW', 'hero', 'hero', -0.5, -2.0, 1.05, 'up', 'hang', 0, 'bazaar', ''],
  ['q10', 305, 342, 'b04', 'Z', 'BW2', 'hero', 'hero', 0.8, -2.2, 1.05, 'reach', 'hang', 0, 'bazaar', ''],
  // b05 UDHAAR — udhaar de diya (L5) — DC MEDIUM, hero khata me likhta, graahak saamaan le jaata.
  ['q11', 342, 377, 'b05', 'D', 'DC', 'hero', 'hero', 2.6, -4.3, 1.1, 'reach', 'hang', 0, 'aunty', ''],
  ['q12', 377, 413, 'b05', 'D', 'DC2', 'hero', 'hero', 2.6, -4.3, 1.1, 'reach', 'hang', 0, 'aunty', ''],
  // b06 DIN — subah aata, dopahar chawal, shaam tel (L6) — DT2 CLOSE push-in, tarazu hero prop.
  ['q13', 413, 453, 'b06', 'D', 'DT2', 'hero', 'hero', 2.6, -4.3, 1.1, 'reach', 'hang', 0, 'aunty', ''],
  ['q14', 453, 493, 'b06', 'D', 'DT3', 'hero', 'hero', 2.6, -4.3, 1.1, 'reach', 'hang', 0, 'aunty', ''],
  // b07 KHAALI GALLA — mahina beeta, galla khaali (L7-L8) — DG2 anchor, galla khulta.
  ['q15', 493, 525, 'b07', 'D', 'DG2', 'hero', 'hero', 2.6, -4.3, 1.1, 'reach', 'hang', 0, 'child', ''],
  ['q16', 525, 557, 'b07', 'D', 'DG3', 'hero', 'hero', 2.6, -4.3, 1.1, 'reach', 'hang', 0, 'none', ''],
  ['q17', 557, 592, 'b07', 'D', 'DG4', 'hero', 'hero', 2.6, -4.3, 1.1, 'reach', 'hang', 0, 'none', ''],
  ['q18', 592, 627, 'b07', 'D', 'DG5', 'hero', 'hero', 2.6, -4.3, 1.1, 'reach', 'hang', 0, 'none', ''],
  // b08 GHABRAHAT — dukaan band hogi (L9) — HC MEDIUM, ghar, light cone, hero pareshan.
  ['q19', 627, 659, 'b08', 'C', 'HC', 'hero', 'hero', -1.6, -2.6, 1.0, 'reach', 'hang', 0, 'none', ''],
  ['q20', 659, 691, 'b08', 'C', 'HC2', 'hero', 'hero', -1.6, -2.6, 1.0, 'reach', 'hang', 0, 'none', ''],
  // b09 KHATA REVEAL — khata khola, das hazaar (L10) — KC2 ECU push-in, ungli "₹10,000" par.
  ['q21', 691, 722, 'b09', 'D', 'KC2', 'hero', 'hero', 2.6, -4.3, 1.1, 'point', 'hang', 0, 'aunty', ''],
  ['q22', 722, 753, 'b09', 'D', 'KC3', 'hero', 'hero', 2.6, -4.3, 1.1, 'point', 'hang', 0, 'aunty', ''],
  ['q23', 753, 783, 'b09', 'D', 'KC4', 'hero', 'hero', 2.6, -4.3, 1.1, 'reach', 'hang', 0, 'aunty', ''],
  // b10 NIYAM — khata hi dukaan, wapas aayega (L11-L12) — DN MEDIUM, graahak wapas aaya.
  ['q24', 783, 827, 'b10', 'D', 'DN', 'hero', 'hero', 2.6, -4.3, 1.1, 'reach', 'hang', 0, 'return', ''],
  ['q25', 827, 871, 'b10', 'D', 'DN2', 'hero', 'hero', 2.6, -4.3, 1.1, 'reach', 'hang', 0, 'return', ''],
  ['q26', 871, 904, 'b10', 'D', 'DN3', 'hero', 'hero', 2.6, -4.3, 1.1, 'reach', 'hang', 0, 'return', ''],
  ['q27', 904, 936, 'b10', 'D', 'DN4', 'hero', 'hero', 2.6, -4.3, 1.1, 'reach', 'hang', 0, 'return', ''],
  // b11 KHATA BADA — udhaar band nahi, khata bada (L13) — DQ WIDE, gali me line.
  ['q28', 936, 973, 'b11', 'G', 'DQ', 'hero', 'hero', 0.2, -0.4, 1.05, 'reach', 'hang', 0, 'queue', ''],
  ['q29', 973, 1010, 'b11', 'G', 'DQ2', 'hero', 'hero', 0.2, -0.4, 1.05, 'reach', 'hang', 0, 'queue', ''],
  ['q30', 1010, 1047, 'b11', 'G', 'DQ3', 'hero', 'hero', 0.2, -0.4, 1.05, 'reach', 'hang', 0, 'queue', ''],
  // b12 RIVAL — supermarket hansta, ek baar aata (L14-L15) — SW WIDE, thanda fluorescent.
  ['q31', 1047, 1083, 'b12', 'S', 'SW', 'hero', 'hero', 1.2, -2.0, 1.05, 'hang', 'hang', 0, 'shoppers', ''],
  ['q32', 1083, 1119, 'b12', 'S', 'SW3', 'hero', 'hero', 1.2, -2.0, 1.05, 'hang', 'hang', 0, 'shoppers', ''],
  ['q33', 1119, 1155, 'b12', 'S', 'SW4', 'hero', 'hero', 1.2, -2.0, 1.05, 'hang', 'hang', 0, 'shoppers', ''],
  ['q34', 1155, 1193, 'b12', 'S', 'SW2', 'hero', 'hero', 1.2, -2.0, 1.05, 'hang', 'hang', 0, 'shoppers', ''],
  ['q35', 1193, 1231, 'b12', 'S', 'SW5', 'hero', 'hero', 1.2, -2.0, 1.05, 'reach', 'hang', 0, 'none', ''],
  // b13 ROZ AATA — roz aata, udhaar chukane (L16) — GA MEDIUM, graahak cash deta.
  ['q36', 1231, 1269, 'b13', 'G', 'GA', 'hero', 'hero', -0.5, -0.9, 1.05, 'reach', 'hang', 0, 'uncle', ''],
  ['q37', 1269, 1307, 'b13', 'G', 'GA2', 'hero', 'hero', -0.5, -0.9, 1.05, 'reach', 'hang', 0, 'uncle', ''],
  // b14 TANKHWAAH — pehli tareekh, khata khaali hota (L17-L18) — PQ2 anchor, queue.
  ['q38', 1307, 1347, 'b14', 'D', 'PQ2', 'hero', 'hero', 2.5, -4.3, 1.2, 'reach', 'hang', 0, 'queue', ''],
  ['q39', 1347, 1387, 'b14', 'D', 'PQ3', 'hero', 'hero', 2.5, -4.3, 1.2, 'reach', 'hang', 0, 'queue', ''],
  ['q40', 1387, 1423, 'b14', 'D', 'PQ4', 'hero', 'hero', 2.5, -4.3, 1.2, 'reach', 'hang', 0, 'queue', ''],
  ['q41', 1423, 1459, 'b14', 'D', 'PQ5', 'hero', 'hero', 2.5, -4.3, 1.2, 'reach', 'hang', 0, 'none', ''],
  // b15 GALLA + LOOP — galla ₹50,000, khud check karo, kal phir (L19-L22) — DL = DW angle.
  // q42 L19 poora (52f) ek push-in — galla khulta + cash; q43 pointcam CLOSE (finger
  // crisp); q49 DL = DW, pointcam, STATIC freeze (loop rhyme).
  ['q42', 1459, 1511, 'b15', 'D', 'DL2', 'hero', 'hero', 2.6, -3.95, 1.3, 'reach', 'hang', 0, 'aunty', 'galla'],
  ['q43', 1511, 1555, 'b15', 'D', 'DL4', 'hero', 'hero', 2.6, -3.95, 1.3, 'pointcam', 'hang', 0, 'aunty', 'galla'],
  ['q44', 1555, 1600, 'b15', 'D', 'DL8', 'hero', 'hero', 2.6, -3.95, 1.3, 'reach', 'hang', 0, 'aunty', 'galla'],
  ['q45', 1600, 1645, 'b15', 'D', 'DL5', 'hero', 'hero', 2.6, -3.95, 1.3, 'point', 'hang', 0, 'aunty', 'galla'],
  ['q46', 1645, 1691, 'b15', 'D', 'DL9', 'hero', 'hero', 2.6, -3.95, 1.3, 'reach', 'hang', 0, 'aunty', 'galla'],
  ['q47', 1691, 1728, 'b15', 'D', 'DL7', 'hero', 'hero', 2.6, -3.95, 1.3, 'reach', 'hang', 0, 'aunty', 'galla'],
  ['q48', 1728, 1765, 'b15', 'D', 'DL3', 'hero', 'hero', 2.6, -3.95, 1.3, 'reach', 'hang', 0, 'aunty', 'galla'],
  ['q49', 1765, 1805, 'b15', 'D', 'DL', 'hero', 'hero', 2.6, -3.95, 1.3, 'pointcam', 'hang', 0, 'aunty', 'galla'],
];
const SHOTMAP = {};
SHOTS.forEach(([id, a, b, beat, loc, cam, who, speaker, cx, cz, cs, R, L, tilt, crowd, board]) => {
  if (who !== speaker) throw new Error(`speaker rule violation: ${id} who=${who} speaker=${speaker}`);
  SHOTMAP[id] = { id, a, b, beat, loc, cam: CAMS[cam], camName: cam, who, speaker, cx, cz, cs, R, L, tilt, crowd, board, sub: 0, len: b - a };
});
export const BEAT_OF = {}; SHOTS.forEach((s) => { BEAT_OF[s[0]] = s[3]; });
export const BEAT_SPAN = {
  b01: [0, 94], b02: [94, 193], b03: [193, 269], b04: [269, 342], b05: [342, 413],
  b06: [413, 493], b07: [493, 627], b08: [627, 691], b09: [691, 783], b10: [783, 936],
  b11: [936, 1047], b12: [1047, 1231], b13: [1231, 1307], b14: [1307, 1459], b15: [1459, 1805],
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
