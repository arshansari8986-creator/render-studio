// "Golgappa Thela — Seth Ji Ka Raaz" — Mirror kit + Gullak grammar (word = visual).
// Voice: voice_hamara.wav 63.69s = 1911 frames @30fps. Word timings:
// projects/golgappa-thela/word_timings.json se verified (sentence boundaries).
// ⚠️ GULLAK RULE: jo shabd bola, screen par EXACT wahi cheez usi pal.
// ⚠️ 45 shots / 44 cuts (avg 1.42s — Gullak Muft Zameen 1.44s). Hard cut default.
// ⚠️ Ek khaas TOP angle sirf raaz shot (g37) par + white-flash wahi.
// ⚠️ SAFE-FRAME: boards/chehre kinare se kate NAHI. Captions: word-by-word Roman.
import { clamp } from './motion.js';

export const FPS = 30;
export const TOTAL = 1911;

// ---------- shots: [id, a, b, set, env] ----------
// set: gali | school | office | park
// env: dusk (gehri shaam) | day | noon (tez dopahar) | eve (shaam, lamp) |
//      morning (school subah) | sunset (park shaam)
export const SHOTS = [
  ['g01', 0, 40, 'gali', 'dusk'],        // HOOK WIDE: thela (left) + Seth cafe (right), gehri shaam — "Is ladke ka thela"
  ['g02', 40, 100, 'gali', 'dusk'],      // THELA close: aakhri golgappa bika, thaali khaali — "shaam saat baje khaali ho jata hai"
  ['g03', 100, 150, 'gali', 'dusk'],     // CAFE front bada: board+AC+khaali bahar — "aur saamne wale bade cafe ka"
  ['g04', 150, 185, 'gali', 'dusk'],     // GALLA macro: khaali galla khulta hai — "galla din bhar"
  ['g05', 185, 219, 'gali', 'dusk'],     // cafe ki khaali kursiyan row — "khaali rehta hai"
  ['g06', 219, 250, 'gali', 'day'],      // Chunnu ke haath golgappa bharte hue (thela macro) — "Ladka golgappe"
  ['g07', 250, 302, 'gali', 'day'],      // Chunnu close smile + thela board CHUNNU — "bechta hai, naam hai Chunnu"
  ['g08', 302, 345, 'gali', 'day'],      // Seth cafe WIDE establish — "Uske saamne hai Seth ji ka cafe"
  ['g09', 345, 370, 'gali', 'day'],      // AC unit close, thandi hawa — "AC"
  ['g10', 370, 410, 'gali', 'day'],      // cafe kursiyan + Seth khada — "kursiyan"
  ['g11', 410, 436, 'gali', 'day'],      // bada BOARD tilt-up "SETH CAFE" — "bada sa board"
  ['g12', 436, 487, 'gali', 'day'],      // Seth medium, hasi shuru — "Ek din Seth ji haskar bole"
  ['g13', 487, 530, 'gali', 'day'],      // Seth thele ki taraf POINT — "Ye thela hai"
  ['g14', 530, 565, 'gali', 'day'],      // Seth LAUGH close — "ya ghumakkad?"
  ['g15', 565, 600, 'gali', 'day'],      // Seth do disha point, Chunnu peeche shaant — "Aaj yahan, kal wahan!"
  ['g16', 600, 652, 'school', 'morning'],// SCHOOL gate wide + ghanti bajti — "Subah school ki chhutti ki ghanti baji"
  ['g17', 652, 682, 'school', 'morning'],// bachche gate se bhaagte bahar — "aur bheed"
  ['g18', 682, 733, 'school', 'morning'],// thele par bheed toot padi — "Chunnu ke thele par toot padi"
  ['g19', 733, 800, 'gali', 'noon'],     // Seth cafe se bahar dekhta (tez dhoop) — "Lekin dopahar ko Seth ji ne dekha"
  ['g20', 800, 830, 'gali', 'noon'],     // KHAALI JAGAH: thela gayab, sirf nishan — "thela gayab!"
  ['g21', 830, 888, 'gali', 'noon'],     // Seth SHOCK bada close — "Thela gaya kahan?"
  ['g22', 888, 915, 'office', 'noon'],   // OFFICE building low-angle wide, thela neeche — "Thela khada tha office"
  ['g23', 915, 955, 'office', 'noon'],   // thela office ke bahar, log aane lage — "ke bahar — lunch"
  ['g24', 955, 996, 'office', 'noon'],   // lambi LINE thele par (side) — "ki bheed wahan line me khadi thi"
  ['g25', 996, 1030, 'park', 'sunset'],  // PARK gate wide sunset — "Shaam ko wahi thela"
  ['g26', 1030, 1085, 'park', 'sunset'], // park ki bheed thele par — "park ke saamne... aur"
  ['g27', 1085, 1115, 'park', 'sunset'], // aakhri golgappa uth'ta (plate macro) — "saat baje, aakhri golgappa"
  ['g28', 1115, 1152, 'park', 'sunset'], // GALLA BHARA macro: sikke+note — "bhi bik gaya"
  ['g29', 1152, 1211, 'gali', 'eve'],    // Seth cafe darwaze par udaas wide — "Udhar Seth ji ke darwaze par"
  ['g30', 1211, 1244, 'gali', 'eve'],    // KIRAYA wala darwaze par khada — "kiraya wala khada tha"
  ['g31', 1244, 1295, 'gali', 'eve'],    // BIJLI wala bill thama raha (bill close) — "bijli wala bill de gaya"
  ['g32', 1295, 1330, 'gali', 'eve'],    // DO LADKE khaali kursiyon par baithe — "aur do ladke"
  ['g33', 1330, 1382, 'gali', 'eve'],    // cafe khaali wide, Seth dekhta reh gaya — "khaali kursiyon par baithe rahe"
  ['g34', 1382, 1436, 'gali', 'eve'],    // Seth close: raaz samajh aaya (bhaav badlav) — "Tab Seth ji ko raaz samajh aaya"
  ['g35', 1436, 1470, 'gali', 'eve'],    // Chunnu thela samet'ta/band karta — "Chunnu golgappe nahi"
  ['g36', 1470, 1502, 'gali', 'eve'],    // Chunnu bheed ki taraf dekhta hai — "bech raha tha"
  ['g37', 1502, 1562, 'gali', 'eve'],    // ⭐ TOP ANGLE + FLASH: bheed aage, thela peeche-peeche — "wo bheed ke peeche chal raha tha"
  ['g38', 1562, 1622, 'gali', 'eve'],    // side track: bheed jaati hai, thela saath — "Jahan bheed, wahan thela"
  ['g39', 1622, 1670, 'gali', 'dusk'],   // Seth shaant smile close — "Seth ji sahi kehte the"
  ['g40', 1670, 1712, 'gali', 'dusk'],   // Seth thele ki taraf dekhta, halki hasi — "dukaan ghumakkad hi thi"
  ['g41', 1712, 1762, 'gali', 'dusk'],   // Seth soch close shaant — "Bas wo ye nahi jaante the..."
  ['g42', 1762, 1800, 'gali', 'dusk'],   // thela gali me chalta hua (side) — "ghumakkad dukaan kabhi"
  ['g43', 1800, 1837, 'gali', 'dusk'],   // thele ke aas-paas phir log — "khaali nahi rehti"
  ['g44', 1837, 1870, 'gali', 'dusk'],   // WIDE loop frame (g01 jaisa) — "Shaam saat baje"
  ['g45', 1870, 1911, 'gali', 'dusk'],   // thela khaali close, shaant ant — "thela phir khaali tha"
];
const SHOTMAP = {}; SHOTS.forEach(([id, a, b, set, env]) => { SHOTMAP[id] = { id, a, b, set, env, len: b - a }; });
export const shotAt = (f) => {
  for (const [id, a, b] of SHOTS) if (f >= a && f < b) { const s = SHOTMAP[id]; return { ...s, u: clamp((f - a) / s.len) }; }
  const s = SHOTMAP[SHOTS[SHOTS.length - 1][0]]; return { ...s, u: 1 };
};
// white-flash cuts: {frame: kitne frame flash} — sirf raaz khulne par (g37 start)
export const FLASH = { 1502: 5 };

// ---------- set layouts (main.js se match) ----------
// gali: sadak z 0.2..3.4; footpath z -1.9..0.2; deewaar line z=-4.3.
//   Seth Cafe centre x=2.6: signboard (2.6,3.35,-4.24), counter (2.6,,-3.0), galla (2.6,1.06,-2.95),
//   AC (1.35,2.62,-4.22), kursiyan (1.7/2.5/3.3, -2.15) teeno, darwaza (3.9,,-4.28).
//   Thela jagah x=-2.4, z=-2.0 (thela group yahi place hota hai; gayab shot me gayab).
//   Ped (-5.6,,-3.4) & (6.0,,-3.2); street light (0.1,,-1.2).
// school: building wall z=-4.3 x -4..4; gate pillars x=+-1.05, board (0,3.0,-4.25);
//   ghanti (-1.45,2.15,-3.9); thela (2.35,,-1.7); bachche gate (0,,-3.6) se aate hain.
// office: building wall z=-4.6, windows grid; board (0,4.4,-4.55); darwaza (0,,-4.55);
//   thela (-2.35,,-1.85); line thele se right ki taraf x badhta hua.
// park: gate pillars x=+-1.3 z=-4.0, board (0,2.9,-3.95); ghaas z -3.8..3.4; ped (-3.4,,-3), (3.8,,-2.6), (-1.5,,-3.5);
//   bench (-2.6,,-1.2); thela (1.85,,-2.0).
export const CAMS = {
  g01: [[0.1,2.35,7.6],[0.1,1.45,-3.3],55,0,[0.1,2.28,7.1],[0.1,1.45,-3.3],53,0],          // hook wide push-in (dono pure frame me)
  g02: [[-2.2,1.7,1.6],[-2.2,1.15,-2.0],44,0,[-2.2,1.62,1.1],[-2.2,1.15,-2.0],42,0], // thela close push
  g03: [[2.6,2.2,3.4],[2.6,1.7,-3.6],48,0,[2.6,2.1,2.9],[2.6,1.75,-3.6],46,0],   // cafe front push
  g04: [[2.6,1.5,-1.35],[2.6,1.12,-2.97],42,0,[2.6,1.47,-1.55],[2.6,1.12,-2.97],40,0], // Seth + galla medium (galla khulta hai)
  g05: [[1.15,1.35,0.9],[2.9,0.75,-2.3],46,0,[1.3,1.3,0.55],[2.95,0.75,-2.3],44,0],  // kursiyan low track
  g06: [[-1.5,1.6,0.75],[-2.2,1.12,-1.95],40,0,[-1.57,1.55,0.5],[-2.2,1.12,-1.95],38,0], // haath/golgappa macro
  g07: [[-2.2,1.66,0.75],[-2.2,1.42,-2.75],42,0,[-2.2,1.62,0.4],[-2.2,1.42,-2.75],40,0],     // Chunnu close push
  g08: [[0.4,2.5,7.6],[2.4,1.6,-3.8],50,0,[0.55,2.4,6.9],[2.4,1.6,-3.8],48,0],   // cafe wide dolly
  g09: [[1.35,2.6,-2.6],[1.35,2.6,-4.2],42,0,[1.35,2.6,-2.8],[1.35,2.6,-4.2],40,0], // AC macro push (paas se)
  g10: [[3.6,1.5,0.9],[2.2,1.0,-2.6],46,0,[3.45,1.46,0.6],[2.2,1.0,-2.6],44,0],   // kursiyan dusri disha se
  g11: [[2.6,1.3,3.3],[2.6,3.28,-3.9],44,0,[2.6,1.42,3.05],[2.6,3.28,-3.9],42,0], // board tilt-up
  g12: [[2.6,1.66,1.15],[2.6,1.32,-2.95],43,0,[2.6,1.63,0.85],[2.6,1.32,-2.95],41,0], // Seth medium push
  g13: [[1.35,1.6,0.9],[2.55,1.35,-2.9],45,0,[1.45,1.57,0.62],[2.55,1.35,-2.9],43,0], // Seth point (side se)
  g14: [[2.6,1.64,0.62],[2.6,1.42,-2.95],40,0,[2.6,1.62,0.32],[2.6,1.42,-2.95],37,0],  // Seth laugh BIG close
  g15: [[0.2,1.85,4.6],[0.0,1.25,-2.8],48,0,[0.28,1.8,4.25],[0.0,1.25,-2.8],46,0],    // dono: Seth point, Chunnu peeche
  g16: [[0.5,2.3,6.4],[0.45,1.8,-4.0],52,0,[0.5,2.2,5.8],[0.45,1.8,-4.0],50,0],            // school gate wide push
  g17: [[-0.4,1.5,2.6],[0.3,1.0,-3.4],46,0,[-0.3,1.46,2.25],[0.3,1.0,-3.4],44,0], // bachche bhaagte (gate ki taraf look)
  g18: [[1.95,1.6,1.7],[1.95,1.15,-1.6],44,0,[1.95,1.55,1.3],[1.95,1.15,-1.6],42,0], // bheed thele par close
  g19: [[1.5,1.7,1.6],[2.5,1.35,-2.95],46,0,[1.62,1.66,1.3],[2.45,1.35,-2.95],44,0],   // Seth dekhta (cafe se bahar ki taraf)
  g20: [[-1.45,1.2,1.2],[-2.25,0.35,-2.1],44,0,[-1.5,1.15,0.9],[-2.25,0.35,-2.1],42,0],   // khaali jagah neeche look
  g21: [[2.6,1.66,0.45],[2.6,1.42,-2.95],39,0,[2.6,1.63,0.12],[2.6,1.42,-2.95],36,0],  // Seth shock BIG close push
  g22: [[-1.1,1.15,5.6],[-0.5,1.9,-4.4],48,0,[-1.0,1.22,5.1],[-0.5,1.9,-4.4],46,0],    // office low-angle wide (thela frame me)
  g23: [[-2.35,1.6,1.5],[-2.35,1.15,-1.85],44,0,[-2.35,1.55,1.15],[-2.35,1.15,-1.85],42,0], // thela office bahar
  g24: [[1.6,1.45,1.35],[-1.5,1.05,-1.9],47,0,[1.42,1.42,1.1],[-1.5,1.05,-1.9],45,0],   // line side shot
  g25: [[0,2.4,6.8],[0.4,1.6,-3.4],50,0,[0,2.3,6.1],[0.4,1.6,-3.4],48,0],         // park gate wide sunset push
  g26: [[1.85,1.6,1.8],[1.85,1.15,-2.0],44,0,[1.85,1.55,1.4],[1.85,1.15,-2.0],42,0],   // park bheed thele par
  g27: [[1.05,1.5,0.6],[1.8,1.1,-1.95],40,0,[1.11,1.46,0.32],[1.8,1.1,-1.95],38,0],     // golgappa plate macro
  g28: [[1.3,1.42,0.3],[1.28,1.05,-1.8],40,0,[1.3,1.4,0.05],[1.28,1.05,-1.8],38,0], // galla bhara macro (thela par)
  g29: [[2.7,2.0,3.5],[2.75,1.45,-3.6],50,0,[2.7,1.94,3.15],[2.75,1.45,-3.6],48,0],     // Seth darwaza wide eve
  g30: [[3.35,1.6,0.7],[3.3,1.3,-3.3],44,0,[3.3,1.57,0.42],[3.3,1.3,-3.3],42,0],  // kiraya wala darwaze ke paas
  g31: [[2.95,1.5,0.15],[2.78,1.2,-2.6],41,0,[2.92,1.47,-0.12],[2.78,1.2,-2.6],39,0],  // bill haath macro
  g32: [[1.9,1.3,0.8],[2.55,0.85,-2.4],45,0,[2.0,1.27,0.55],[2.55,0.85,-2.4],43,0],  // do ladke kursiyon par
  g33: [[0.2,2.2,5.6],[2.5,1.3,-3.4],50,0,[0.3,2.12,5.1],[2.5,1.3,-3.4],48,0],    // cafe khaali wide eve
  g34: [[2.6,1.64,0.5],[2.6,1.42,-2.95],40,0,[2.6,1.62,0.2],[2.6,1.42,-2.95],38,0],    // Seth raaz close
  g35: [[-2.2,1.6,1.2],[-2.2,1.2,-2.05],44,0,[-2.2,1.56,0.9],[-2.2,1.2,-2.05],42,0],    // Chunnu thela samet'ta
  g36: [[-2.2,1.66,0.7],[-2.2,1.44,-2.75],42,0,[-2.2,1.63,0.42],[-2.2,1.44,-2.75],40,0], // Chunnu close dekhta
  g37: [[-0.6,4.4,3.0],[-0.4,0,-0.9],52,0,[-0.4,4.25,2.7],[-0.25,0,-0.85],52,0],  // ⭐ TOP: bheed aage, thela peeche
  g38: [[0.9,1.5,3.1],[0.9,1.0,-1.5],47,0,[0.9,1.47,2.85],[0.9,1.0,-1.5],45,0], // side track bheed+thela
  g39: [[2.6,1.64,0.55],[2.6,1.42,-2.95],41,0,[2.6,1.62,0.28],[2.6,1.42,-2.95],39,0],  // Seth shaant close
  g40: [[1.3,1.62,1.1],[2.55,1.38,-2.9],45,0,[1.42,1.59,0.82],[2.55,1.38,-2.9],43,0],  // Seth side se dekhta
  g41: [[2.6,1.65,0.5],[2.6,1.43,-2.95],41,0,[2.6,1.63,0.24],[2.6,1.43,-2.95],39,0],   // Seth soch close
  g42: [[1.6,1.4,1.6],[-2.2,1.0,-1.9],47,0,[1.35,1.37,1.35],[-2.2,1.0,-1.9],45,0],     // thela chalta side track
  g43: [[-2.2,1.55,1.9],[-2.2,1.1,-2.0],45,0,[-2.2,1.5,1.55],[-2.2,1.1,-2.0],43,0],    // thela + aas-paas log
  g44: [[0.1,2.35,7.6],[0.1,1.45,-3.3],55,0,[0.1,2.3,7.25],[0.1,1.45,-3.3],54,0],            // loop wide (= g01 framing)
  g45: [[-2.2,1.68,1.35],[-2.2,1.18,-2.0],43,0,[-2.2,1.64,1.05],[-2.2,1.18,-2.0],42,0], // thela khaali close ant
};
export const camFor = (shot, u) => {
  const c = CAMS[shot.id];
  const e = u * u * (3 - 2 * u); // smoothstep within the shot
  const L = (a, b) => a + (b - a) * e;
  const L3 = (a, b) => a.map((v, i) => L(v, b[i]));
  return { pos: L3(c[0], c[4]), look: L3(c[1], c[5]), fov: L(c[2], c[6]), roll: L(c[3], c[7]) };
};

// ---------- word-by-word Roman captions (insurance-mirror pattern) ----------
// segments: [a, b, "Roman words space separated"] — shabd segment me barabar phailte hain.
const CAPSEG = [
  [0, 100, 'Is ladke ka thela shaam saat baje khaali ho jata hai'],
  [100, 219, 'aur saamne wale bade cafe ka galla din bhar khaali rehta hai'],
  [219, 302, 'Ladka golgappe bechta hai — naam hai Chunnu'],
  [302, 436, 'Uske saamne hai Seth ji ka cafe — AC, kursiyan, bada sa board'],
  [436, 487, 'Ek din Seth ji haskar bole'],
  [487, 600, 'Ye thela hai ya ghumakkad? Aaj yahan, kal wahan!'],
  [600, 652, 'Subah school ki chhutti ki ghanti baji'],
  [652, 733, 'aur bheed Chunnu ke thele par toot padi'],
  [733, 830, 'Lekin dopahar ko Seth ji ne dekha — thela gayab!'],
  [830, 888, 'Thela gaya kahan?'],
  [888, 996, 'Thela khada tha office ke bahar — lunch ki bheed wahan line me khadi thi'],
  [996, 1085, 'Shaam ko wahi thela park ke saamne'],
  [1085, 1152, 'aur saat baje, aakhri golgappa bhi bik gaya'],
  [1152, 1244, 'Udhar Seth ji ke darwaze par kiraya wala khada tha'],
  [1244, 1295, 'bijli wala bill de gaya'],
  [1295, 1382, 'aur do ladke khaali kursiyon par baithe rahe'],
  [1382, 1436, 'Tab Seth ji ko raaz samajh aaya'],
  [1436, 1502, 'Chunnu golgappe nahi bech raha tha'],
  [1502, 1562, 'wo bheed ke peeche chal raha tha'],
  [1562, 1622, 'Jahan bheed, wahan thela'],
  [1622, 1712, 'Seth ji sahi kehte the — dukaan ghumakkad hi thi'],
  [1712, 1762, 'Bas wo ye nahi jaante the'],
  [1762, 1837, 'ghumakkad dukaan kabhi khaali nahi rehti'],
  [1837, 1911, 'Shaam saat baje, thela phir khaali tha'],
];
export const CAPTIONS = CAPSEG.map(([a, b, s]) => ({ a, b, words: s.split(' ').filter(Boolean) }));
export const captionAt = (f) => {
  for (const c of CAPTIONS) {
    if (f >= c.a && f < c.b) {
      const i = Math.min(c.words.length - 1, Math.floor((f - c.a) / ((c.b - c.a) / c.words.length)));
      return c.words[i];
    }
  }
  return '';
};
