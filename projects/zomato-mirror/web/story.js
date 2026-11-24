// "Zomato ₹500 Order Ka Hisaab" — Mirror kit + Gullak grammar (word = visual).
// NO CAPTIONS (user order). Sirf scenes, characters, scene-ke-andar boards/screens.
// Voice: voice_slow.wav 60.72s = 1822 frames @30fps. Word timings:
// ~/workspace/render-studio-repo/projects/zomato-mirror/word_timings.json se verified.
// ⚠️ GULLAK RULE: jo shabd bola, screen par EXACT wahi cheez usi pal.
// ⚠️ Har shot 27-50 frames (0.9-1.67s). ⚠️ CAMERA: har shot alag angle+move, static NAHI.
// ⚠️ SAFE-FRAME: boards/chehre kinare se kate NAHI.
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 1822;

// ---------- shots: [id, a, b, set, env?] ----------
// set: dhaba | street | desk | phone ; env default neeche ENV_DEFAULT
export const SHOTS = [
  ['z01', 0, 42, 'dhaba'],               // HOOK: biryani plate MACRO + board "₹500 KI BIRYANI" (0.00-1.40 "Paanch sau ki biryani bechi")
  ['z02', 42, 72, 'dhaba'],              // board MACRO "BAACHE SIRF ₹185?" (1.40-2.40)
  ['z03', 72, 101, 'dhaba'],             // Mohan SHOCK close (2.40-3.37 "...ek sau pachyaasi!")
  ['z04', 101, 145, 'dhaba'],            // Mohan cheek-soch "Kaise? Suno." push-in (3.37-4.83)
  ['z05', 145, 194, 'street'],           // DHABA WIDE establish — "MOHAN DHABA" signboard, subah (4.83-6.47 "Mohan ne naya dhaba khola tha")
  ['z06', 194, 240, 'street'],           // Seth apne dhabe se POINT + salah (6.47-8.00 "Seth ji bole — Zomato par lag jao")
  ['z07', 240, 285, 'street'],           // Seth LAUGH close "note chapenge!" + note (8.00-9.50)
  ['z08', 285, 320, 'phone'],            // PHONE MACRO: "NAYA ORDER! ₹500 BIRYANI" pop (9.50-10.67 "Pehla order aaya")
  ['z09', 320, 353, 'dhaba'],            // Mohan khush phone dekhta GRIN (10.67-11.77)
  ['z10', 353, 386, 'dhaba'],            // Mohan LADDOO baant'ta graahak ko (11.77-12.87)
  ['z11', 386, 418, 'dhaba'],            // laddoo plate close + graahak khush, Seth peeche hasi (12.87-13.93)
  ['z12', 418, 452, 'dhaba'],            // KADHAI me biryani, dhuaan, kalchhi (13.93-14.87 "Khana bana")
  ['z13', 452, 486, 'dhaba'],            // DABBA pack hota, tape (14.87-16.20 "pack hua, rider le gaya" shuru)
  ['z14', 486, 521, 'street'],           // RIDER ko ₹50 note milta — note MACRO (16.20-17.38 "use mile pachaas rupaye")
  ['z15', 521, 555, 'street'],           // Rider petrol pump par — tanki me petrol (17.38-18.50 "petrol bhi usi me se")
  ['z16', 555, 594, 'dhaba'],            // CALENDAR panne palatte — 7 DIN (18.50-19.80 "Saat din baad")
  ['z17', 594, 632, 'phone'],            // PHONE: "PAISA AAYA ₹335" + kata "₹500?" Mohan confused side me (19.80-21.07)
  ['z18', 632, 668, 'desk', 'deskEve'],  // HISAAB kagaz khulta hai top-down (21.07-22.27 "Hisaab khula")
  ['z19', 668, 705, 'desk', 'deskEve'],  // kagaz par "ORDER ₹500" + pen point (22.27-23.50 "paisa ek-ek karke kata hua mila")
  ['z20', 705, 745, 'desk', 'deskEve'],  // COMMISSION: kagaz ka tukda KAT ke girta "−₹110" (23.50-24.83)
  ['z21', 745, 793, 'desk', 'deskEve'],  // TAX STAMP THAP "−₹20 TAX" (24.83-26.43)
  ['z22', 793, 827, 'dhaba', 'dhabaEve'],// Mohan SHOCK close "commission par bhi tax?!" (26.43-27.57)
  ['z23', 827, 874, 'dhaba', 'dhabaEve'],// SAR GHOOM: temple pose + swirl taare, camera roll (27.57-29.13)
  ['z24', 874, 911, 'desk', 'deskEve'],  // kagaz phir — "AUR BAAKI HAI..." (29.13-30.37 "aur abhi khatm nahi hua")
  ['z25', 911, 942, 'desk', 'deskEve'],  // DABBA stack "−₹25 DABBA" (30.37-31.40)
  ['z26', 942, 973, 'desk', 'deskEve'],  // RECEIPT "−₹10 PAYMENT" (31.40-32.43)
  ['z27', 973, 1016, 'desk', 'deskEve'], // "MILE SIRF ₹335" — sikke ginte hue (32.43-33.87)
  ['z28', 1016, 1046, 'dhaba', 'dhabaEve'], // kadhai/sabzi kharcha visual (33.87-34.87 "Khana banane ke")
  ['z29', 1046, 1072, 'desk', 'deskEve'],// kagaz "−₹150 KHANA" kat (34.87-35.73 "dedh sau aur gaye")
  ['z30', 1072, 1122, 'desk', 'deskEve'],// "BAACHE ₹185" sikke+note, camera pan (35.73-37.40)
  ['z31', 1122, 1167, 'desk', 'deskEve'],// kagaz list: KIRAYA + BIJLI icon pop (37.40-38.90)
  ['z32', 1167, 1203, 'desk', 'deskEve'],// STAFF + GAS icon pop (38.90-40.10)
  ['z33', 1203, 1236, 'dhaba', 'dhabaEve'], // LADDOO khaali plate close (40.10-41.20 "laddoo ke paise bhi")
  ['z34', 1236, 1271, 'dhaba', 'dhabaEve'], // Mohan udaas plate dekhta (41.20-42.37 "usi me se gaye the")
  ['z35', 1271, 1318, 'street', 'streetEve'], // Seth DHEERE se bolta — hasi gayab (42.37-43.93 "Seth ji dheere se bole")
  ['z36', 1318, 1348, 'street', 'streetEve'], // Seth Mohan ke dhabe ki taraf aata hai (43.93-44.93)
  ['z37', 1348, 1378, 'street', 'streetEve'], // TWO-SHOT: Seth haara "mera hisaab bhi nikaal de" (44.93-45.93)
  ['z38', 1378, 1410, 'dhaba', 'dhabaEve'],   // "ASLI JHATKA YE HAI" Mohan stern close (45.93-47.00)
  ['z39', 1410, 1440, 'street'],              // NAYA DIN subah — dhaba phir khulta (47.00-48.00 "Mohan kal phir")
  ['z40', 1440, 1470, 'phone'],               // PHONE phir DING — naya order (48.00-49.00 "order lega")
  ['z41', 1470, 1518, 'dhaba'],               // Mohan ghata jaante hue kaam par (49.00-50.60 "Ghata jaante hue bhi")
  ['z42', 1518, 1559, 'street'],              // BAND DARWAZA close — "graahak ghar nahi aata" (50.60-51.97)
  ['z43', 1559, 1601, 'phone', 'phoneEve'],   // APP screen: graahak avatars "SAB APP PAR" (51.97-53.37 "graahak app par khada hai")
  ['z44', 1601, 1654, 'phone', 'phoneEve'],   // BILL screen khulta hai (53.37-55.13 "apna aakhri bill khol ke dekho")
  ['z45', 1654, 1701, 'phone', 'phoneEve'],   // "PLATFORM FEE ₹15" line HIGHLIGHT zoom (55.13-56.70)
  ['z46', 1701, 1748, 'dhaba', 'dhabaEve'],   // Mohan viewer ki taraf POINT "tumse bhi kate hain" (56.70-58.27)
  ['z47', 1748, 1785, 'dhaba', 'sunset'],     // Mohan shaant close "Mohan ki jagah tum hote" (58.27-59.50)
  ['z48', 1785, 1822, 'street', 'sunset'],    // SUNSET WIDE pull-back dono dhabe (59.50-60.73 "to kya karte?")
];
const SHOTMAP = {}; SHOTS.forEach(([id, a, b, set, env]) => { SHOTMAP[id] = { id, a, b, set, env, len: b - a }; });
export const shotAt = (f) => {
  for (const [id, a, b] of SHOTS) if (f >= a && f < b) { const s = SHOTMAP[id]; return { ...s, u: clamp((f - a) / s.len) }; }
  const s = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...s, u: 1 };
};

// ---------- set layouts (main.js se match) ----------
// dhaba: WALL_Z=-3.2; counter (-1.15,top1.02,-1.7); Mohan counter peeche (-1.15,0,-2.35);
//   degh/kadhai (-1.8,1.12,-1.75); biryani plate (-0.5,1.07,-1.4); rate board (-0.2,2.45,-2.7);
//   tables (1.35,0,-0.9) & (1.55,0,-2.25); menu board (1.75,2.3,-3.13); calendar (-2.65,2.2,-3.13);
//   pankha (0.2,3.55,-0.9); darwaza (2.95,1.45,-3.14).
// street: Mohan dhaba front x=-2.3 (signboard y3.25,z-3.5), Seth dhaba x=2.3; counters z-3.1;
//   road z 0.2..3.2; bike path z=0.9; petrol pump (4.9,0,-0.7); ghar darwaza (-4.9,0,-2.2).
// desk: table top y0.78 centre (0,0,-0.3); kagaz (0,0.79,-0.3) 1.05x1.35; dabba stack (-0.95,0.78,-0.55);
//   receipt (0.95,0.78,-0.55); sikke (0,0.78,0.5); stamp (0.6,0.8,0.2); lamp (1.3,1.5,-1.2).
// phone: phone body (0,1.78,-1.35) screen 1.5x2.8; table (0,0.72,-0.8); wall z=-3.2.
export const CAMS = {
  z01: [[0.55,2.0,1.8],[-0.35,1.6,-2.4],47,0,[0.45,1.95,1.35],[-0.35,1.6,-2.4],45,0], // plate ki taraf push-in (LOOK-V3: camera peeche + look oopar — rate board poora frame me margin ke saath)
  z02: [[-0.2,2.5,0.75],[-0.2,2.45,-2.7],43,0,[-0.2,2.48,0.55],[-0.2,2.45,-2.7],41,0], // board macro push
  z03: [[-1.15, 1.62, 0.4], [-1.15, 1.42, -2.35], 40, 0, [-1.15, 1.58, 0.05], [-1.15, 1.42, -2.35], 37, 0],// Mohan shock close push
  z04: [[-0.4, 1.6, 0.9], [-1.1, 1.4, -2.3], 44, 0, [-0.55, 1.58, 0.55], [-1.1, 1.4, -2.3], 41, 0],       // kone se soch push
  z05: [[1.85,2.4,7.3],[-1.3,1.5,-3.4],51,0,[1.65,2.3,6.5],[-1.3,1.5,-3.4],49,0], // street wide dhaba ki taraf dolly (LOOK-V3: camera peeche — sign aur Seth ki awning dono frame ke andar)
  z06: [[1.95,1.68,1.0],[2.3,1.35,-2.9],45,0,[1.85,1.64,0.7],[2.3,1.35,-2.9],43,0], // Seth medium
  z07: [[2.3, 1.6, 0.6], [2.3, 1.4, -2.9], 42, 0, [2.3, 1.58, 0.25], [2.3, 1.4, -2.9], 39, 0],             // Seth laugh close push
  z08: [[0.32,1.95,2.6],[0,1.78,-1.3],44,0,[0.22,1.9,2.45],[0,1.78,-1.3],43,0], // phone screen macro push
  z09: [[-1.15, 1.6, 0.5], [-1.15, 1.42, -2.35], 42, 0, [-1.15, 1.58, 0.2], [-1.15, 1.42, -2.35], 40, 0], // Mohan khush close
  z10: [[-0.55,1.7,2.6],[0.6,1.05,-0.75],50,0,[-0.58,1.67,2.35],[0.6,1.05,-0.75],48,0], // Mohan->graahak laddoo two-shot kone
  z11: [[0.15,1.85,1.9],[1.15,1.0,-0.55],45,0,[0.21,1.82,1.7],[1.15,1.0,-0.55],43,0], // table/laddoo plate ki taraf (graahak table 1.35,-0.9; plate uspar)
  z12: [[-1.68,1.88,0.6],[-1.8,1.18,-1.75],44,0,[-1.7,1.8,0.3],[-1.8,1.18,-1.75],42,0], // kadhai top-side push
  z13: [[-0.42,1.38,0.3],[-0.45,1.12,-1.5],37,0,[-0.44,1.35,0.1],[-0.45,1.12,-1.5],35,0], // pack dabba counter par
  z14: [[1.35,1.52,2.75],[1.28,1.28,0.72],44,0,[1.33,1.5,2.5],[1.28,1.28,0.72],42,0], // rider haath note macro (rider bike par 1.15,0,0.9)
  z15: [[2.9,1.6,2.7],[4.55,1.05,-0.3],44,0,[3.05,1.57,2.45],[4.55,1.05,-0.3],42,0], // petrol pump ki taraf (bike 4.35,0,0.1)
  z16: [[-2.65, 2.25, -1.2], [-2.65, 2.2, -3.13], 42, 0, [-2.65, 2.23, -1.55], [-2.65, 2.2, -3.13], 39, 0],// calendar macro push
  z17: [[0.55,1.9,2.7],[0.3,1.76,-1.3],46,0,[0.45,1.87,2.5],[0.3,1.76,-1.3],44,0], // phone paisa screen
  z18: [[0.3,3.65,0.25],[0,0.79,-0.32],43,3,[0.24,3.57,0.15],[0,0.79,-0.32],41,2], // desk top-down halka kone
  z19: [[-0.3,3.65,0.3],[0,0.79,-0.32],43,-3,[-0.24,3.57,0.2],[0,0.79,-0.32],41,-2], // dusra kone top-down
  z20: [[0.28,3.65,0.22],[0.03,0.79,-0.33],42,2,[0.22,3.57,0.12],[0.03,0.79,-0.33],40,2], // kagaz kat close
  z21: [[0.1,3.57,0.35],[0.05,0.79,-0.32],42,0,[0.08,3.49,0.23],[0.05,0.79,-0.32],40,0], // stamp upar se
  z22: [[-1.15, 1.62, 0.4], [-1.15, 1.42, -2.35], 39, 0, [-1.15, 1.6, 0.1], [-1.15, 1.42, -2.35], 36, 0],   // Mohan shock BIG close
  z23: [[-1.15,1.68,0.5],[-1.15,1.45,-2.35],41,-2,[-1.15,1.65,0.25],[-1.15,1.45,-2.35],39,3], // dizzy: roll -4 -> +5
  z24: [[-0.28,3.65,0.22],[0,0.79,-0.32],43,-2,[-0.22,3.57,0.12],[0,0.79,-0.32],41,-2],
  z25: [[-1.52,1.95,0.65],[-0.95,1.25,-0.55],42,0,[-1.45,1.88,0.45],[-0.95,1.25,-0.55],40,0], // dabba stack ki taraf
  z26: [[1.55,1.62,1.5],[0.95,0.58,0.5],42,0,[1.48,1.58,1.3],[0.95,0.58,0.5],40,0], // receipt ki taraf
  z27: [[0.22,3.5,0.8],[-0.05,0.8,0.05],43,2,[0.17,3.43,0.65],[-0.05,0.8,0.05],41,1], // sikke upar se
  z28: [[-1.68,1.88,0.6],[-1.8,1.18,-1.75],44,0,[-1.7,1.8,0.3],[-1.8,1.18,-1.75],42,0], // kadhai phir (eve rang)
  z29: [[0.28,3.65,0.22],[0.03,0.79,-0.33],42,2,[0.22,3.57,0.12],[0.03,0.79,-0.33],40,2],
  z30: [[-0.6,3.45,0.65],[-0.15,0.8,-0.05],44,0,[0.45,3.35,0.6],[0.2,0.82,0.15],42,0], // sikke par pan (left->right)
  z31: [[-0.3,3.67,0.25],[0,0.79,-0.33],43,-3,[-0.24,3.59,0.15],[0,0.79,-0.33],41,-2],
  z32: [[0.3,3.67,0.25],[0,0.79,-0.33],43,3,[0.24,3.59,0.15],[0,0.79,-0.33],41,2],
  z33: [[0.95,1.05,0.55],[1.3,0.8,-0.95],40,0,[0.99,1.02,0.35],[1.3,0.8,-0.95],38,0], // khaali laddoo plate macro (table par)
  z34: [[-0.2, 1.55, 0.9], [-0.95, 1.3, -2.0], 46, 0, [-0.32, 1.52, 0.65], [-0.95, 1.3, -2.0], 44, 0],     // Mohan udaas counter se
  z35: [[2.3, 1.62, 0.7], [2.3, 1.4, -2.9], 42, 0, [2.3, 1.6, 0.4], [2.3, 1.4, -2.9], 40, 0],               // Seth serious close
  z36: [[1.7,1.72,2.3],[0.85,1.2,-1.85],48,0,[1.55,1.68,2.0],[0.85,1.2,-1.85],46,0], // Seth sadak paar karta hua (wide follow)
  z37: [[1.0,1.62,1.7],[-0.7,1.28,-2.1],46,0,[0.9,1.6,1.5],[-0.7,1.28,-2.1],44,0], // two-shot: Seth saamne, Mohan counter peeche
  z38: [[-1.15, 1.62, 0.5], [-1.15, 1.42, -2.35], 40, 0, [-1.15, 1.6, 0.2], [-1.15, 1.42, -2.35], 38, 0],   // Mohan stern close
  z39: [[1.85,2.4,7.3],[-1.3,1.5,-3.4],51,0,[1.65,2.3,6.5],[-1.3,1.5,-3.4],49,0], // naya din wide (z05 jaisa par naya angle halka alag; LOOK-V3 framing fix z05 ke saath)
  z40: [[0.32,1.95,2.6],[0,1.78,-1.3],44,0,[0.22,1.9,2.45],[0,1.78,-1.3],43,0], // phone ding phir
  z41: [[0.5, 1.6, 1.0], [-1.0, 1.3, -2.1], 46, 0, [0.38, 1.57, 0.75], [-1.0, 1.3, -2.1], 44, 0],          // Mohan kaam par side se
  z42: [[-3.6, 1.5, 0.6], [-4.9, 1.25, -2.2], 44, 0, [-3.75, 1.47, 0.3], [-4.9, 1.25, -2.2], 42, 0],       // band darwaza push
  z43: [[0.28,1.9,2.6],[0,1.78,-1.3],44,0,[0.2,1.87,2.4],[0,1.78,-1.3],43,0], // app screen
  z44: [[0.28,1.9,2.6],[0,1.78,-1.3],44,0,[0.2,1.87,2.4],[0,1.78,-1.3],43,0], // bill screen
  z45: [[0.0,1.72,2.35],[-0.1,1.6,-1.3],42,0,[-0.04,1.68,2.25],[-0.1,1.6,-1.3],41,0], // fee line par zoom (screen ka neeche hissa)
  z46: [[-1.15, 1.6, 0.6], [-1.15, 1.4, -2.35], 43, 0, [-1.15, 1.58, 0.3], [-1.15, 1.4, -2.35], 41, 0],     // Mohan point close
  z47: [[-1.15, 1.62, 0.5], [-1.15, 1.42, -2.35], 41, 0, [-1.15, 1.6, 0.22], [-1.15, 1.42, -2.35], 39, 0],  // Mohan shaant close
  z48: [[0,3.6,11.0],[0,1.9,-3.4],52,0,[0,5.0,13.5],[0,1.8,-3.3],55,0], // sunset pull-back wide
};
export const camFor = (shot, u) => {
  const c = CAMS[shot.id];
  const e = u * u * (3 - 2 * u); // smoothstep within the shot
  const L = (a, b) => a + (b - a) * e;
  const L3 = (a, b) => a.map((v, i) => L(v, b[i]));
  return { pos: L3(c[0], c[4]), look: L3(c[1], c[5]), fov: L(c[2], c[6]), roll: L(c[3], c[7]) };
};
