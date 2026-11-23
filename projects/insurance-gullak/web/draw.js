// Flat 2D vector library for "Bunty" finance sample (Abhay-style LOOK,
// original art). Plain canvas-2D paths, flat fills, thick dark outlines.
// World space 2160 x 1920. Characters: feet at (x, y), scale s.
export const OUT = '#26221f'; // thick outline colour

export function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
export function circ(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }
export function ell(ctx, x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); }
export function limb(ctx, x1, y1, x2, y2, w, color) {
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}
export function poly(ctx, pts) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}
export function fillStroke(ctx, fill, lw = 5) {
  ctx.fillStyle = fill; ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke();
}
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
export const easeOutBack = (t) => { t = clamp(t, 0, 1); const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
export const blinkAt = (f, seed) => ((f + seed * 37) % 110) < 6;

// ---------- money props ----------
export function drawNote(ctx, x, y, rot = 0, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  rr(ctx, -46, -23, 92, 46, 6); fillStroke(ctx, '#8fd45e', 4);
  ctx.strokeStyle = '#4e7a2e'; ctx.lineWidth = 2.5;
  rr(ctx, -38, -16, 76, 32, 4); ctx.stroke();
  circ(ctx, 0, 0, 12); ctx.fillStyle = '#eaf7d8'; ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#3c6423'; ctx.font = '700 19px "Noto Sans Devanagari", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('₹', 0, 1);
  ctx.font = '700 13px "Noto Sans Devanagari", sans-serif';
  ctx.fillText('500', -28, 0); ctx.fillText('500', 28, 0);
  ctx.restore();
}
export function drawCoin(ctx, x, y, r, t = 0) {
  ctx.save(); ctx.translate(x, y);
  circ(ctx, 0, 0, r); fillStroke(ctx, '#ffc300', 4);
  circ(ctx, 0, 0, r * 0.68); ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = '#8a5f00'; ctx.font = `700 ${Math.round(r * 0.95)}px "Noto Sans Devanagari", sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('₹', 0, 1);
  // glint
  const gx = Math.cos(t * 0.11) * r * 0.4, gy = Math.sin(t * 0.11) * r * 0.4;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath(); ctx.moveTo(gx, gy - 6); ctx.lineTo(gx + 2.5, gy - 2.5); ctx.lineTo(gx + 6, gy);
  ctx.lineTo(gx + 2.5, gy + 2.5); ctx.lineTo(gx, gy + 6); ctx.lineTo(gx - 2.5, gy + 2.5);
  ctx.lineTo(gx - 6, gy); ctx.lineTo(gx - 2.5, gy - 2.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}
export function drawWallet(ctx, x, y, s = 1, rot = 0) {
  // open, EMPTY wallet (two flaps), held up
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); ctx.rotate(-0.16);
  rr(ctx, -64, -26, 62, 52, 8); fillStroke(ctx, '#8a5a34', 4);
  rr(ctx, -56, -18, 46, 36, 6); ctx.fillStyle = '#d9b98c'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.rotate(0.16);
  rr(ctx, 2, -26, 62, 52, 8); fillStroke(ctx, '#8a5a34', 4);
  rr(ctx, 10, -18, 46, 36, 6); ctx.fillStyle = '#d9b98c'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#5a3a1a'; ctx.font = '700 26px "Noto Sans Devanagari", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('₹0', -33, 0);
  ctx.restore();
}
export function drawPhone(ctx, x, y, s = 1, rot = 0, mode = 'credit') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  rr(ctx, -58, -98, 116, 196, 14); fillStroke(ctx, '#23262b', 5);
  rr(ctx, -49, -80, 98, 146, 8); ctx.fillStyle = mode === 'credit' ? '#eaffea' : (mode === 'call' ? '#0e2a1a' : '#ffeded'); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (mode === 'credit') {
    ctx.fillStyle = '#1d7a2f'; ctx.font = '700 16px "Noto Sans Devanagari", sans-serif';
    ctx.fillText('SALARY', 0, -54);
    ctx.fillText('CREDITED', 0, -30);
    ctx.fillStyle = '#14591f'; ctx.font = '700 22px "Noto Sans Devanagari", sans-serif';
    ctx.fillText('₹30,000', 0, 2);
    drawCoin(ctx, 0, 42, 13, 0);
  } else if (mode === 'call') {
    circ(ctx, 0, -34, 17); ctx.fillStyle = '#7fd08a'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 30, 24, Math.PI * 1.15, Math.PI * 1.85); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#eaffea'; ctx.font = '700 15px "Noto Sans Devanagari", sans-serif';
    ctx.fillText('CALLING', 0, 34);
    ctx.fillStyle = '#7fd08a';
    for (let i = -1; i <= 1; i++) { circ(ctx, i * 14, 52, 3); ctx.fill(); }
  } else {
    ctx.fillStyle = '#b02020'; ctx.font = '700 16px "Noto Sans Devanagari", sans-serif';
    ctx.fillText('EMI DUE', 0, -50);
    ctx.fillStyle = '#7a1414'; ctx.font = '700 22px "Noto Sans Devanagari", sans-serif';
    ctx.fillText('₹8,500', 0, -16);
    ctx.fillStyle = '#b02020'; ctx.font = '700 13px "Noto Sans Devanagari", sans-serif';
    ctx.fillText('PAY NOW!', 0, 12);
  }
  circ(ctx, 0, 82, 7); ctx.fillStyle = '#565b63'; ctx.fill();
  ctx.restore();
}
export function drawPlant(ctx, x, y, s = 1, t = 0) {
  // money plant: pot, stems, leaves, coin fruits that sway and glint
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const sway = Math.sin(t * 0.045) * 0.03;
  ctx.save(); ctx.rotate(sway);
  limb(ctx, 0, -60, -6, -190, 10, '#3e7d32');
  limb(ctx, -4, -140, -64, -215, 8, '#3e7d32');
  limb(ctx, -2, -160, 58, -235, 8, '#3e7d32');
  const leaf = (lx, ly, r, a) => {
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(a);
    ell(ctx, 0, 0, r, r * 0.62); fillStroke(ctx, '#57a047', 4);
    ctx.restore();
  };
  leaf(-70, -222, 30, -0.5); leaf(64, -242, 32, 0.4); leaf(-16, -262, 28, 0.1);
  leaf(-44, -168, 24, -0.9); leaf(40, -182, 24, 0.8);
  // coin fruits
  const c1 = Math.sin(t * 0.06) * 5, c2 = Math.cos(t * 0.05) * 5;
  drawCoin(ctx, -78 + c1, -196, 17, t);
  drawCoin(ctx, 74 + c2, -214, 19, t + 30);
  drawCoin(ctx, 2 + c1, -286, 16, t + 60);
  ctx.restore();
  // pot
  poly(ctx, [[-58, -64], [58, -64], [42, 0], [-42, 0]]); fillStroke(ctx, '#c96f3f', 5);
  rr(ctx, -66, -78, 132, 18, 7); fillStroke(ctx, '#a8562f', 5);
  ctx.restore();
}
export function drawQuestion(ctx, x, y, s = 1, t = 0) {
  const bob = Math.sin(t * 0.09) * 8;
  ctx.save(); ctx.translate(x, y + bob); ctx.scale(s, s);
  circ(ctx, 0, 0, 54); fillStroke(ctx, '#ffffff', 6);
  poly(ctx, [[-14, 44], [26, 44], [4, 78]]); fillStroke(ctx, '#ffffff', 5);
  ctx.fillStyle = '#e0393e'; ctx.font = '700 76px "Noto Sans Devanagari", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('?', 0, -2);
  ctx.restore();
}
export function drawLabel(ctx, x, y, text, pop = 1, color = '#ffd23f', rot = -0.03) {
  if (pop <= 0.01) return;
  const sc = easeOutBack(pop);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.font = '700 54px "Noto Sans Devanagari", sans-serif';
  const tw = ctx.measureText(text).width;
  const w = tw + 56, h = 84;
  rr(ctx, -w / 2, -h / 2, w, h, 14); fillStroke(ctx, color, 7);
  ctx.fillStyle = '#26221f'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 3);
  ctx.restore();
}
export function drawGrabHand(ctx, x, y, s = 1, dir = -1, grab = 0) {
  // big hand on a sleeve reaching in; grab 0=open, 1=closed on the note
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
  rr(ctx, -150, -26, 120, 52, 10); fillStroke(ctx, '#7a4a8c', 5); // sleeve
  rr(ctx, -158, -30, 26, 60, 8); fillStroke(ctx, '#f2e6c8', 4);  // cuff
  const skin = '#bf8250';
  ell(ctx, -12, 0, 34, 27); fillStroke(ctx, skin, 5); // palm
  const spread = (1 - grab) * 10;
  for (let i = 0; i < 4; i++) {
    const fx = 8 + i * 3, fy = -20 + i * 13;
    limb(ctx, fx - 6, fy, fx + 22 + spread * 0.4, fy - 6 + (i - 1.5) * spread * 0.5, 11, skin);
  }
  limb(ctx, 2, 22, 24 + spread * 0.3, 34, 11, skin); // thumb
  ctx.restore();
}

// ---------- fronts for the four money-takers ----------
export function drawHouse(ctx, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(ctx, -210, -300, 420, 300, 8); fillStroke(ctx, '#f6c177', 6); // walls
  poly(ctx, [[-250, -292], [0, -440], [250, -292]]); fillStroke(ctx, '#c0453e', 6); // roof
  rr(ctx, -52, -190, 104, 190, 10); fillStroke(ctx, '#7a4a21', 6); // door
  circ(ctx, 30, -95, 8); ctx.fillStyle = '#ffd23f'; ctx.fill();
  rr(ctx, -178, -240, 84, 84, 8); fillStroke(ctx, '#bfe6f5', 5); // window
  limb(ctx, -136, -240, -136, -156, 5, OUT); limb(ctx, -178, -198, -94, -198, 5, OUT);
  rr(ctx, 94, -240, 84, 84, 8); fillStroke(ctx, '#bfe6f5', 5);
  limb(ctx, 136, -240, 136, -156, 5, OUT); limb(ctx, 94, -198, 178, -198, 5, OUT);
  ctx.restore();
}
export function drawBank(ctx, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  poly(ctx, [[-260, -330], [0, -440], [260, -330]]); fillStroke(ctx, '#dfe6ee', 6); // pediment
  circ(ctx, 0, -372, 30); fillStroke(ctx, '#ffd23f', 5);
  ctx.fillStyle = '#8a5f00'; ctx.font = '700 38px "Noto Sans Devanagari", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('₹', 0, -370);
  rr(ctx, -260, -330, 520, 40, 6); fillStroke(ctx, '#b9c6d4', 5);
  for (let i = 0; i < 4; i++) {
    const cx = -195 + i * 130;
    rr(ctx, cx - 26, -290, 52, 240, 6); fillStroke(ctx, '#eef3f8', 5);
    rr(ctx, cx - 34, -298, 68, 16, 5); fillStroke(ctx, '#b9c6d4', 4);
    rr(ctx, cx - 34, -66, 68, 16, 5); fillStroke(ctx, '#b9c6d4', 4);
  }
  rr(ctx, -280, -50, 560, 22, 6); fillStroke(ctx, '#9fb2c4', 5);
  rr(ctx, -300, -28, 600, 28, 6); fillStroke(ctx, '#8799ab', 5);
  ctx.restore();
}
export function drawShop(ctx, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(ctx, -230, -320, 460, 320, 8); fillStroke(ctx, '#a8d8a8', 6); // walls
  // striped awning
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 ? '#e0393e' : '#ffffff';
    poly(ctx, [[-250 + i * 62, -320], [-188 + i * 62, -320], [-176 + i * 62, -262], [-238 + i * 62, -262]]);
    ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 4; ctx.stroke();
  }
  rr(ctx, -190, -230, 380, 120, 8); fillStroke(ctx, '#5b4632', 5); // counter
  // goods: jars + crates
  const goods = ['#ffd23f', '#e0393e', '#57a047', '#4a90d9', '#ff9d2e', '#c96f3f'];
  goods.forEach((g, i) => {
    const gx = -160 + i * 64;
    rr(ctx, gx - 20, -286, 40, 52, 8); fillStroke(ctx, g, 4);
    rr(ctx, gx - 22, -292, 44, 12, 5); fillStroke(ctx, '#d9d9d9', 3);
  });
  for (let i = 0; i < 3; i++) {
    const gx = -140 + i * 120;
    rr(ctx, gx - 44, -96, 88, 62, 6); fillStroke(ctx, '#c98a5e', 4);
    circ(ctx, gx - 18, -112, 13); ctx.fillStyle = '#e0393e'; ctx.fill();
    circ(ctx, gx + 14, -116, 13); ctx.fillStyle = '#ff9d2e'; ctx.fill();
    circ(ctx, gx, -92, 13); ctx.fillStyle = '#57a047'; ctx.fill();
  }
  ctx.restore();
}
export function drawCalendar(ctx, x, y, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(ctx, -170, -380, 340, 380, 12); fillStroke(ctx, '#ffffff', 6);
  rr(ctx, -170, -380, 340, 74, 12); ctx.fillStyle = '#e0393e'; ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.stroke();
  circ(ctx, -100, -380, 13); fillStroke(ctx, '#d9d9d9', 4);
  circ(ctx, 100, -380, 13); fillStroke(ctx, '#d9d9d9', 4);
  ctx.fillStyle = '#8a8f98';
  for (let rI = 0; rI < 4; rI++) for (let cI = 0; cI < 5; cI++) {
    circ(ctx, -120 + cI * 60, -250 + rI * 62, 9); ctx.fill();
  }
  // red ring on the due date (pulses)
  const pr = 33 + Math.sin(t * 0.15) * 3;
  circ(ctx, 0, -188, pr); ctx.strokeStyle = '#e0393e'; ctx.lineWidth = 8; ctx.stroke();
  ctx.fillStyle = '#e0393e'; ctx.font = '700 30px "Noto Sans Devanagari", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('15', 0, -186);
  ctx.restore();
}

// ---------- THE SALARY-MAN ("BUNTY") — PREMIUM v2 ----------
// Fuller, rounder cartoon look: soft radial face shading, cheek shading,
// shaped hair with scalloped fringe + side locks, bigger expressive eyes,
// volume torso with gradient + side shading, soft drop shadows, tears.
// Anchors UNCHANGED from v1 so every scene overlay stays glued:
//   hipY = y-148s, shY = y-298s, head centre hdY = y-350s, head r = 48s.
// o: {x, y(feet), s, face(0 front, 1 right, -1 left), walk(phase|null),
//     armL, armR: 'down'|'phone'|'catch'|'up'|'scratch'|'pockets'|'hold',
//     prop: null|'wallet'|'phone'|'notes', expr:
//     'worried'|'happy'|'puzzled'|'shocked'|'sad'|'calm'|'smug'|'cry',
//     blink, headDip, wink, tear, phoneMode, _t}
export function shadeC(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, Math.round(((n >> 16) & 255) * f)));
  const g = Math.max(0, Math.min(255, Math.round(((n >> 8) & 255) * f)));
  const b = Math.max(0, Math.min(255, Math.round((n & 255) * f)));
  return `rgb(${r},${g},${b})`;
}
export function softShadow(ctx, x, y, rx, ry, a = 0.26) {
  ctx.save();
  ctx.fillStyle = `rgba(24,16,10,${(a * 0.5).toFixed(3)})`;
  ell(ctx, x, y, rx * 1.22, ry * 1.55); ctx.fill();
  ctx.fillStyle = `rgba(24,16,10,${a})`;
  ell(ctx, x, y, rx, ry); ctx.fill();
  ctx.restore();
}
function skinGrad(ctx, x, y, r, skin) {
  const g = ctx.createRadialGradient(x - r * 0.38, y - r * 0.44, r * 0.12, x, y, r * 1.14);
  g.addColorStop(0, shadeC(skin, 1.15));
  g.addColorStop(0.55, skin);
  g.addColorStop(1, shadeC(skin, 0.83));
  return g;
}
// =====================================================================
// GULLAK-STYLE CHARACTER (EP-9 remake): gol bada sir, MOTI outline, flat
// rang, badi expressive aankhein. API purani wali hi: drawHero(ctx, o).
// Extra options: o.old (safed baal+moonchh), o.female (bun+bindi+dress),
// o.kurta, o.hairStyle ('cap'|'grey'|'bun'|'girl'|'bald'), o.look (-1..1).
// =====================================================================
export function drawHero(ctx, o) {
  const { x, y, s = 1 } = o;
  const face = o.face || 0, expr = o.expr || 'calm', blink = !!o.blink;
  const skin = o.skin || '#f2b183', hairC = o.hairC || (o.old ? '#d7dce1' : '#2e2a33');
  const shirt = o.shirt || '#3f7fd1', shirtD = o.shirtD || '#356cb3';
  const tie = o.tieColor || '#d2362c', pants = o.pants || '#3c4b6b', shoeC = '#33302e';
  const t = o._t || 0;
  const bob = o.walk != null ? Math.abs(Math.sin(Math.PI * 2 * o.walk)) * 8 * s : Math.sin(t * 0.12) * 2 * s;
  const dip = (o.headDip || 0) * 30 * s + (o.old ? 7 * s : 0);
  const hipY = y - 122 * s + bob * 0.4, shY = y - 270 * s + bob * 0.4;
  const hdY = y - 330 * s + bob * 0.5 + dip, hdX = x + face * 9 * s;
  const slump = (expr === 'sad' || o.old) ? 0.045 : 0;
  const R = 88 * s; // head radius — Gullak proportion (sir = height ka ~41%)

  softShadow(ctx, x, y + 5 * s, 92 * s, 15 * s, 0.25);

  // legs + shoes
  const sw = o.walk != null ? Math.sin(Math.PI * 2 * o.walk) * 0.42 : 0;
  const sw2 = o.walk != null ? Math.sin(Math.PI * 2 * o.walk + Math.PI) * 0.42 : 0;
  for (const [sd, sww] of [[-1, sw], [1, sw2]]) {
    const fx = x + sd * 26 * s + Math.sin(sww) * 34 * s;
    limb(ctx, x + sd * 23 * s, hipY + 6 * s, fx, y - 10 * s, 27 * s, pants);
    ell(ctx, fx + 4 * s, y - 6 * s, 23 * s, 10 * s); fillStroke(ctx, shoeC, 4.5 * s);
  }

  // torso (hip space): gol kandhe, flat rang, halki side-shade, MOTI outline
  ctx.save(); ctx.translate(x, hipY); ctx.rotate(slump); ctx.scale(s, s);
  const flare = o.female ? 30 : 0, longT = o.kurta ? 46 : 0;
  const tp = new Path2D();
  tp.moveTo(-64 - flare, 8 + longT); tp.lineTo(64 + flare, 8 + longT);
  tp.lineTo(58, -118); tp.quadraticCurveTo(56, -146, 26, -150);
  tp.lineTo(-26, -150); tp.quadraticCurveTo(-56, -146, -58, -118); tp.closePath();
  const tg = ctx.createLinearGradient(0, -152, 0, 10);
  tg.addColorStop(0, shadeC(shirt, 1.05)); tg.addColorStop(1, shirtD);
  ctx.fillStyle = tg; ctx.fill(tp);
  ctx.strokeStyle = OUT; ctx.lineWidth = 6.5; ctx.lineJoin = 'round'; ctx.stroke(tp);
  ctx.save(); ctx.clip(tp);
  ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(30, -152, 40, 170 + longT);
  ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(-66, -152, 16, 170 + longT);
  ctx.restore();
  if (!o.female) { ctx.fillStyle = '#6b4423'; ctx.fillRect(-64, -4, 128, 13); }
  // collar
  poly(ctx, [[-20, -150], [0, -150], [-8, -124]]); ctx.fillStyle = shirtD; ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 3.2; ctx.stroke();
  poly(ctx, [[20, -150], [0, -150], [8, -124]]); ctx.fillStyle = shirtD; ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 3.2; ctx.stroke();
  if (o.kurta) {
    ctx.fillStyle = shadeC(shirt, 0.85); ctx.fillRect(-64, -150, 128, 15);
    ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.strokeRect(-64, -150, 128, 15);
  }
  if (!o.noTie && !o.female && !o.kurta) {
    poly(ctx, [[-9, -148], [9, -148], [5, -92], [0, -78], [-5, -92]]);
    ctx.fillStyle = tie; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3.5; ctx.stroke();
  }
  if (o.female) { // dupatta diagonal band
    ctx.save(); ctx.clip(tp);
    ctx.strokeStyle = o.shirtD; ctx.lineWidth = 17;
    ctx.beginPath(); ctx.moveTo(-70, -96); ctx.lineTo(70, -8); ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = '#ffffff';
  circ(ctx, 0, -112, 3.4); ctx.fill(); circ(ctx, 0, -58, 3.4); ctx.fill(); circ(ctx, 0, -26, 3.4); ctx.fill();
  ctx.restore();

  // arms
  drawHeroArm(ctx, x, shY, -1, o.armL || 'down', o, skin, shirt);
  drawHeroArm(ctx, x, shY, 1, o.armR || 'down', o, skin, shirt);

  // props
  if (o.prop === 'wallet') drawWallet(ctx, x + face * 10 * s, shY + 128 * s, 1.15 * s, Math.sin(t * 0.1) * 0.04);
  if (o.prop === 'phone') drawPhone(ctx, x + 44 * s, shY + 58 * s, 0.95 * s, -0.08, o.phoneMode || 'credit');
  if (o.prop === 'notes') {
    for (let i = -1; i <= 1; i++) drawNote(ctx, x - 6 * s + i * 23 * s, shY + 124 * s, i * 0.28, 1.0 * s);
  }
  if (o.prop === 'book') { // beti ki kitaab — dono haathon ke saamne
    ctx.save(); ctx.translate(x, shY + 128 * s); ctx.scale(s, s);
    ctx.fillStyle = '#2e7cd6'; rr(ctx, -30, -38, 60, 74, 5); ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = 4.5; ctx.stroke();
    ctx.fillStyle = '#fdfdf6'; rr(ctx, -24, -32, 48, 62, 3); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(40,40,60,0.4)'; ctx.lineWidth = 2.4;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-17, -18 + i * 13); ctx.lineTo(17, -18 + i * 13); ctx.stroke(); }
    ctx.restore();
  }
  if (o.prop === 'pen') { // sign karne wala pen (right hand ke paas)
    ctx.save(); ctx.translate(x + 40 * s, shY + 152 * s); ctx.rotate(0.5); ctx.scale(s, s);
    ctx.fillStyle = '#274b8f'; rr(ctx, -5, -26, 10, 46, 4); ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = 3.5; ctx.stroke();
    poly(ctx, [[-5, 20], [5, 20], [0, 32]]); ctx.fillStyle = '#d9d9d9'; ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // neck
  rr(ctx, hdX - 14 * s, hdY + 52 * s, 28 * s, 40 * s, 7);
  ctx.fillStyle = shadeC(skin, 0.9); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 4 * s; ctx.stroke();

  // head
  ctx.save(); ctx.translate(hdX, hdY);
  if (expr === 'puzzled') ctx.rotate(-0.06);
  // ears
  circ(ctx, -86 * s, 6 * s, 15 * s); fillStroke(ctx, skin, 4.5 * s);
  circ(ctx, 86 * s, 6 * s, 15 * s); fillStroke(ctx, skin, 4.5 * s);
  circ(ctx, -86 * s, 6 * s, 6.5 * s); ctx.fillStyle = shadeC(skin, 0.8); ctx.fill();
  circ(ctx, 86 * s, 6 * s, 6.5 * s); ctx.fillStyle = shadeC(skin, 0.8); ctx.fill();
  // face disc — flat rang, halka radial
  circ(ctx, 0, 0, R); ctx.fillStyle = skinGrad(ctx, 0, 0, R, skin); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 6.5 * s; ctx.stroke();
  // hair
  const hs = o.hairStyle || (o.female ? 'bun' : (o.old ? 'grey' : 'cap'));
  ctx.fillStyle = hairC;
  if (hs === 'bun') {
    circ(ctx, 0, -88 * s, 21 * s); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 4 * s; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -12 * s, 89 * s, Math.PI * 1.02, Math.PI * 1.98);
    ctx.lineTo(84 * s, -42 * s); ctx.quadraticCurveTo(0, -56 * s, -84 * s, -42 * s); ctx.closePath(); ctx.fill();
    ell(ctx, -84 * s, -2 * s, 11 * s, 30 * s); ctx.fill();
    ell(ctx, 84 * s, -2 * s, 11 * s, 30 * s); ctx.fill();
  } else if (hs === 'girl') {
    ctx.beginPath(); ctx.arc(0, -12 * s, 89 * s, Math.PI * 1.02, Math.PI * 1.98);
    ctx.lineTo(84 * s, -46 * s); ctx.lineTo(-84 * s, -46 * s); ctx.closePath(); ctx.fill();
    for (const sd of [-1, 1]) {
      circ(ctx, sd * 90 * s, 30 * s, 18 * s); ctx.fill();
      circ(ctx, sd * 90 * s, 12 * s, 8 * s); ctx.fillStyle = '#e2543e'; ctx.fill(); ctx.fillStyle = hairC;
    }
  } else if (hs === 'grey') {
    ctx.beginPath(); ctx.arc(0, -14 * s, 89 * s, Math.PI * 1.08, Math.PI * 1.92);
    ctx.lineTo(80 * s, -46 * s); ctx.quadraticCurveTo(0, -62 * s, -80 * s, -46 * s); ctx.closePath(); ctx.fill();
    ell(ctx, -84 * s, -6 * s, 10 * s, 20 * s); ctx.fill();
    ell(ctx, 84 * s, -6 * s, 10 * s, 20 * s); ctx.fill();
  } else if (hs === 'bald') {
    ell(ctx, -84 * s, -4 * s, 9 * s, 16 * s); ctx.fill();
    ell(ctx, 84 * s, -4 * s, 9 * s, 16 * s); ctx.fill();
  } else { // 'cap' — agent/young man
    ctx.beginPath(); ctx.arc(0, -9 * s, 89.5 * s, Math.PI * 1.02, Math.PI * 1.98);
    ctx.lineTo(82 * s, -40 * s);
    ctx.quadraticCurveTo(58 * s, -52 * s, 38 * s, -44 * s);
    ctx.quadraticCurveTo(20 * s, -54 * s, 2 * s, -45 * s);
    ctx.quadraticCurveTo(-20 * s, -53 * s, -40 * s, -44 * s);
    ctx.quadraticCurveTo(-62 * s, -51 * s, -82 * s, -40 * s);
    ctx.closePath(); ctx.fill();
    ell(ctx, -84 * s, -16 * s, 10 * s, 18 * s); ctx.fill();
    ell(ctx, 84 * s, -16 * s, 10 * s, 18 * s); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 5 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, -10 * s, 78 * s, Math.PI * 1.25, Math.PI * 1.55); ctx.stroke();
  }
  drawFace(ctx, expr, blink, s, t, !!o.wink, o.mouth != null ? o.mouth : null, o.mix || null,
    { moustache: !!o.old, bindi: !!o.female, look: o.look || 0, browC: o.old ? '#9aa2ab' : '#38302e' });
  ctx.restore();

  // tears
  if (o.tear || expr === 'cry') {
    ctx.strokeStyle = 'rgba(126,196,240,0.85)'; ctx.lineWidth = 4.5 * s; ctx.lineCap = 'round';
    for (const sd of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(hdX + sd * 32 * s, hdY + 16 * s); ctx.lineTo(hdX + sd * 33 * s, hdY + 52 * s); ctx.stroke();
    }
    for (let i = 0; i < 2; i++) {
      const ph = ((t * 1.7 + i * 23) % 52);
      ctx.save(); ctx.translate(hdX + (i ? -38 : 38) * s, hdY + 48 * s + ph * s);
      ctx.globalAlpha = 1 - ph / 52;
      ctx.fillStyle = '#6fc3ef';
      ctx.beginPath(); ctx.moveTo(0, -9 * s);
      ctx.quadraticCurveTo(7.5 * s, 2 * s, 0, 8.5 * s);
      ctx.quadraticCurveTo(-7.5 * s, 2 * s, 0, -9 * s); ctx.fill();
      ctx.restore();
    }
  }
  // sweat
  if ((expr === 'worried' || expr === 'shocked') && o.sweat) {
    const sy = hdY - 52 * s + ((t * 1.4) % 58) * s;
    ctx.save(); ctx.translate(hdX + 100 * s, sy);
    ctx.fillStyle = '#57b6e0';
    ctx.beginPath(); ctx.moveTo(0, -10 * s);
    ctx.quadraticCurveTo(8 * s, 2 * s, 0, 9 * s);
    ctx.quadraticCurveTo(-8 * s, 2 * s, 0, -10 * s); ctx.fill();
    ctx.restore();
  }
}

function drawHeroArm(ctx, x, shY, side, pose, o, skin, shirt) {
  const s = o.s || 1, t = o._t || 0;
  const sx = x + side * 62 * s, sy = shY + 8 * s;
  let hx, hy;
  switch (pose) {
    case 'phone': hx = x + side * 36 * s; hy = shY + 52 * s; break;
    case 'hold': hx = x + side * 18 * s; hy = shY + 122 * s; break;
    case 'catch': {
      const wig = Math.sin(t * 0.55 + side) * 10 * s;
      hx = x + side * 76 * s; hy = shY - 20 * s + wig; break;
    }
    case 'up': hx = x + side * 88 * s; hy = shY - 100 * s; break;
    case 'wave': hx = x + side * 92 * s; hy = shY - 104 * s + Math.sin(t * 0.8 + side) * 10 * s; break;
    case 'shrug': hx = x + side * 118 * s; hy = shY + 34 * s; break;
    case 'scratch': hx = x + side * 30 * s; hy = shY - 118 * s + Math.sin(t * 0.4) * 5 * s; break;
    case 'point': hx = x + side * 22 * s; hy = shY + 62 * s; break;
    case 'pointSide': hx = x + side * 104 * s; hy = shY + 30 * s; break;
    case 'desk': hx = x + side * 58 * s; hy = shY + 148 * s; break;
    case 'sign': hx = x + side * 36 * s; hy = shY + 148 * s + Math.sin(t * 1.1) * 5 * s; break;
    case 'give': hx = x + side * 28 * s; hy = shY + 118 * s; break;
    case 'fold': hx = x - side * 30 * s; hy = shY + 46 * s; break;
    case 'rub': {
      const rb = Math.sin(t * 0.9 + side * 1.7) * 11 * s;
      hx = x + side * 15 * s; hy = shY + 112 * s + rb; break;
    }
    default: hx = x + side * 80 * s; hy = shY + 130 * s; // down
  }
  const ex = (sx + hx) / 2 + side * 10 * s, ey = (sy + hy) / 2 + 14 * s;
  limb(ctx, sx, sy, ex, ey, 25 * s, shirt);
  limb(ctx, ex, ey, hx, hy, 20 * s, skin);
  const wx = ex + (hx - ex) * 0.8, wy = ey + (hy - ey) * 0.8;
  circ(ctx, wx, wy, 14 * s); ctx.fillStyle = shadeC(shirt, 0.86); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 3.5 * s; ctx.stroke();
  circ(ctx, hx, hy, 13.5 * s); fillStroke(ctx, skin, 4.5 * s); // hand
}
// ---------- FULL-FILM props (saver story beats) ----------
export function drawGullak(ctx, x, y, s = 1, t = 0) {
  // piggy bank; feet at (x, y). Slot on top, tail curl, happy pig.
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const body = '#f0a0b5';
  ell(ctx, 0, -78, 108, 74); fillStroke(ctx, body, 6);
  circ(ctx, 92, -104, 40); fillStroke(ctx, body, 5); // head
  ell(ctx, 118, -100, 17, 13); fillStroke(ctx, '#e88ca0', 4); // snout
  circ(ctx, 112, -102, 3.4); ctx.fillStyle = OUT; ctx.fill();
  circ(ctx, 124, -102, 3.4); ctx.fill();
  circ(ctx, 84, -114, 6); ctx.fillStyle = OUT; ctx.fill(); // eye
  poly(ctx, [[58, -136], [76, -162], [88, -132]]); fillStroke(ctx, body, 4); // ear
  // coin slot
  rr(ctx, -18, -152, 52, 10, 5); ctx.fillStyle = '#7a4453'; ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
  // legs
  rr(ctx, -72, -18, 20, 18, 5); fillStroke(ctx, body, 4);
  rr(ctx, 44, -18, 20, 18, 5); fillStroke(ctx, body, 4);
  // tail curl
  ctx.strokeStyle = OUT; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(-112, -104, 12, Math.PI * 0.4, Math.PI * 2.1); ctx.stroke();
  ctx.restore();
}
export function drawShield(ctx, x, y, s = 1, t = 0, broken = false) {
  // protective dome shield over a hero standing at (x, y-feet)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const glow = 0.16 + Math.sin(t * 0.08) * 0.04;
  ctx.beginPath(); ctx.arc(0, -40, 235, Math.PI, 0); ctx.closePath();
  ctx.fillStyle = broken ? `rgba(120,120,130,${glow})` : `rgba(255,195,0,${glow})`; ctx.fill();
  ctx.strokeStyle = broken ? '#6e6e78' : '#e0a100'; ctx.lineWidth = 10; ctx.stroke();
  // shield emblem
  ctx.save(); ctx.translate(0, -275);
  const sh = [[0, -52], [40, -36], [40, 6], [0, 56], [-40, 6], [-40, -36]];
  poly(ctx, sh); fillStroke(ctx, broken ? '#9a9aa4' : '#ffc300', 6);
  if (broken) {
    ctx.strokeStyle = '#3c3c44'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-6, -48); ctx.lineTo(6, -18); ctx.lineTo(-8, 4); ctx.lineTo(8, 34); ctx.stroke();
  } else {
    ctx.strokeStyle = '#7a5b00'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-18, 2); ctx.lineTo(-5, 16); ctx.lineTo(20, -14); ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}
export function drawVillain(ctx, x, y, s = 1, t = 0) {
  // looming dark figure — "no FINANCIAL BUFFER" personified. Feet at (x, y).
  ctx.save(); ctx.translate(x, y + Math.sin(t * 0.05) * 8); ctx.scale(s, s);
  poly(ctx, [[-88, 0], [-64, -300], [0, -348], [64, -300], [88, 0]]); fillStroke(ctx, '#2c2c38', 6); // robe
  circ(ctx, 0, -318, 62); fillStroke(ctx, '#23232e', 6); // hood
  ell(ctx, 0, -308, 40, 34); ctx.fillStyle = '#101016'; ctx.fill(); // face void
  const gl = 0.75 + Math.sin(t * 0.12) * 0.25;
  ctx.fillStyle = `rgba(255,64,64,${gl})`;
  ell(ctx, -16, -312, 8, 5); ctx.fill();
  ell(ctx, 16, -312, 8, 5); ctx.fill();
  // claw hands
  ctx.strokeStyle = '#23232e'; ctx.lineWidth = 15; ctx.lineCap = 'round';
  for (const sd of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(sd * 76, -140); ctx.lineTo(sd * 112, -96); ctx.stroke();
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(sd * 112, -96);
      ctx.lineTo(sd * (124 + i * 4), -78 + i * 12); ctx.stroke();
    }
  }
  ctx.restore();
}
export function drawBike(ctx, x, y, s = 1, t = 0) {
  // motorbike side view, feet/ground at y. Smoking engine + flat rear tyre.
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circ(ctx, -108, -34, 35); fillStroke(ctx, '#3a3f47', 6); // front wheel
  ell(ctx, 104, -22, 40, 24); fillStroke(ctx, '#3a3f47', 6); // flat rear wheel
  ctx.fillStyle = '#d9d9d9';
  circ(ctx, -108, -34, 10); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
  poly(ctx, [[-104, -40], [-30, -108], [38, -104], [96, -34], [30, -30], [-40, -34]]); fillStroke(ctx, '#4a90d9', 6); // body
  rr(ctx, -64, -128, 92, 20, 9); fillStroke(ctx, '#26221f', 4); // seat
  limb(ctx, -34, -106, -82, -142, 10, '#26221f'); // handle stem
  limb(ctx, -98, -146, -64, -150, 9, '#26221f'); // handlebar
  circ(ctx, -88, -128, 13); fillStroke(ctx, '#ffe9a8', 4); // headlamp
  // smoke puffs from engine
  for (let i = 0; i < 3; i++) {
    const u = ((t * 0.9 + i * 26) % 78) / 78;
    const sx = 6 + u * 46, sy = -96 - u * 88, r = 10 + u * 20;
    ctx.fillStyle = `rgba(105,105,115,${0.55 * (1 - u)})`;
    circ(ctx, sx, sy, r); ctx.fill();
  }
  ctx.restore();
}
export function drawMedCross(ctx, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(ctx, -52, -52, 104, 104, 16); fillStroke(ctx, '#ffffff', 6);
  ctx.fillStyle = '#e0393e';
  ctx.fillRect(-13, -36, 26, 72); ctx.fillRect(-36, -13, 72, 26);
  ctx.restore();
}
export function drawThermo(ctx, x, y, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 0.06) * 0.05); ctx.scale(s, s);
  rr(ctx, -17, -130, 34, 108, 17); fillStroke(ctx, '#eef3f8', 5);
  circ(ctx, 0, 0, 30); fillStroke(ctx, '#e0393e', 5);
  const lvl = 58 + Math.sin(t * 0.1) * 7;
  rr(ctx, -8, -22 - lvl, 16, lvl, 8); ctx.fillStyle = '#e0393e'; ctx.fill();
  ctx.fillStyle = '#8a8f98';
  for (let i = 0; i < 4; i++) ctx.fillRect(22, -112 + i * 24, 12, 4);
  ctx.restore();
}
export function drawPercent(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  circ(ctx, 0, 0, 62); fillStroke(ctx, '#ff6b5e', 6);
  ctx.fillStyle = '#7a1414'; ctx.font = '700 74px "Noto Sans Devanagari", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('%', 0, 2);
  ctx.restore();
}
export function drawFlipCal(ctx, x, y, s = 1, num = 1) {
  // flip calendar card showing a big number (month / day)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(ctx, -105, -150, 210, 210, 12); fillStroke(ctx, '#ffffff', 6);
  rr(ctx, -105, -150, 210, 52, 12); ctx.fillStyle = '#e0393e'; ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 4; ctx.stroke();
  circ(ctx, -62, -150, 11); fillStroke(ctx, '#d9d9d9', 4);
  circ(ctx, 62, -150, 11); fillStroke(ctx, '#d9d9d9', 4);
  ctx.fillStyle = '#26221f'; ctx.font = '700 104px "Noto Sans Devanagari", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(num), 0, 8);
  ctx.restore();
}
export function drawBulb(ctx, x, y, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const pulse = 1 + Math.sin(t * 0.15) * 0.05;
  ctx.scale(pulse, pulse);
  circ(ctx, 0, 0, 40); fillStroke(ctx, '#ffe066', 5);
  rr(ctx, -13, 38, 26, 18, 4); fillStroke(ctx, '#9aa3ad', 4);
  ctx.strokeStyle = '#e0a100'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + t * 0.01;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 54, Math.sin(a) * 54);
    ctx.lineTo(Math.cos(a) * 70, Math.sin(a) * 70);
    ctx.stroke();
  }
  ctx.restore();
}
export function drawLoopArrows(ctx, x, y, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(t * 0.02);
  ctx.strokeStyle = '#4a90d9'; ctx.lineWidth = 15; ctx.lineCap = 'round';
  for (const sd of [0, Math.PI]) {
    ctx.beginPath(); ctx.arc(0, 0, 72, sd + 0.5, sd + Math.PI - 0.5); ctx.stroke();
    const a = sd + Math.PI - 0.5, hx = Math.cos(a) * 72, hy = Math.sin(a) * 72;
    const tx = -Math.sin(a), ty = Math.cos(a);
    poly(ctx, [[hx + tx * 26, hy + ty * 26], [hx - tx * 4 - Math.cos(a) * 14, hy - ty * 4 - Math.sin(a) * 14],
               [hx - tx * 4 + Math.cos(a) * 14, hy - ty * 4 + Math.sin(a) * 14]]);
    ctx.fillStyle = '#4a90d9'; ctx.fill();
  }
  ctx.restore();
}
export function drawDebtPaper(ctx, x, y, s = 1, grow = 1) {
  // a growing stack of red-stamped debt bills; grow 0..1
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const n = Math.max(1, Math.round(grow * 5));
  for (let i = 0; i < n; i++) {
    ctx.save(); ctx.translate((i % 2 ? -7 : 5) * (i * 0.4), -i * 34); ctx.rotate((i % 2 ? -1 : 1) * 0.03 * i);
    rr(ctx, -72, -46, 144, 92, 6); fillStroke(ctx, '#fdf3e3', 4);
    ctx.fillStyle = '#b02020'; ctx.font = '700 25px "Noto Sans Devanagari", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('कर्ज़', 0, -12);
    ctx.fillStyle = '#8a8f98'; ctx.font = '700 19px "Noto Sans Devanagari", sans-serif';
    ctx.fillText('₹ - - -', 0, 20);
    ctx.restore();
  }
  ctx.restore();
}

// GULLAK FACE — parametric expressions (numbers interpolate => morph via mix).
// Head-local coords, head radius = 88*s. fx = { moustache, bindi, look, browC }.
const EXPRP = {
  happy:   { lift: 0.25, tilt: -0.05, asym: 0.0, eye: 0.95, wide: 1.0, curve: 0.95, open: 0.10, pup: 0 },
  calm:    { lift: 0.0, tilt: 0.0, asym: 0.0, eye: 0.92, wide: 1.0, curve: 0.35, open: 0.03, pup: 0 },
  smug:    { lift: 0.32, tilt: 0.16, asym: 0.30, eye: 0.55, wide: 0.95, curve: 0.80, open: 0.05, pup: 1 },
  shocked: { lift: 1.0, tilt: 0.10, asym: 0.0, eye: 1.12, wide: 1.14, curve: -0.15, open: 0.62, pup: -1 },
  surprise:{ lift: 0.85, tilt: 0.05, asym: 0.0, eye: 1.08, wide: 1.08, curve: 0.0, open: 0.45, pup: -1 },
  worried: { lift: 0.55, tilt: 0.80, asym: 0.0, eye: 0.95, wide: 1.0, curve: -0.50, open: 0.15, pup: 1 },
  sad:     { lift: 0.45, tilt: 0.70, asym: 0.0, eye: 0.70, wide: 0.95, curve: -0.85, open: 0.06, pup: 2 },
  angry:   { lift: -0.35, tilt: -0.85, asym: 0.0, eye: 0.85, wide: 1.0, curve: -0.55, open: 0.22, pup: 0 },
  puzzled: { lift: 0.30, tilt: 0.20, asym: 0.85, eye: 0.95, wide: 1.0, curve: -0.10, open: 0.10, pup: 0 },
  cry:     { lift: 0.50, tilt: 0.75, asym: 0.0, eye: 0.12, wide: 0.95, curve: -0.70, open: 0.50, pup: 2 },
  speak:   { lift: 0.08, tilt: 0.0, asym: 0.0, eye: 0.95, wide: 1.0, curve: 0.30, open: 0.05, pup: 0 },
};
function drawFace(ctx, expr, blink, s, t, wink = false, mouth = null, mix = null, fx = null) {
  const P0 = EXPRP[expr] || EXPRP.calm;
  let P = P0;
  if (mix && EXPRP[mix.e2]) {
    const P1 = EXPRP[mix.e2], u = clamp(mix.u, 0, 1); P = {};
    for (const k in P0) P[k] = lerp(P0[k], P1[k], u);
  }
  const look = fx && fx.look ? fx.look : 0;
  ctx.lineCap = 'round';
  // cheeks
  ctx.fillStyle = 'rgba(244,120,110,0.30)';
  ell(ctx, -54 * s, 22 * s, 14 * s, 8.5 * s); ctx.fill();
  ell(ctx, 54 * s, 22 * s, 14 * s, 8.5 * s); ctx.fill();
  // eyes — badi safed gol aankhein, moti outline
  for (const sd of [-1, 1]) {
    const ex = sd * 34 * s, ey = -8 * s;
    let eo = P.eye; if (blink) eo = Math.min(eo, 0.07); if (wink && sd === 1) eo = Math.min(eo, 0.07);
    const rx = 20 * P.wide * s, ry = Math.max(1.6, 23 * eo) * s;
    if (ry < 4.5 * s) { // band aankh = curve line
      ctx.strokeStyle = OUT; ctx.lineWidth = 5 * s;
      ctx.beginPath(); ctx.moveTo(ex - rx * 0.8, ey); ctx.quadraticCurveTo(ex, ey + 5 * s, ex + rx * 0.8, ey); ctx.stroke();
    } else {
      ell(ctx, ex, ey, rx, ry); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.strokeStyle = OUT; ctx.lineWidth = 4.5 * s; ctx.stroke();
      const px = ex + look * 5 * s, py = ey + P.pup * 2.4 * s + Math.sin(t * 0.05 + sd) * 0.7 * s;
      circ(ctx, px, py, 9.5 * s); ctx.fillStyle = '#26221f'; ctx.fill();
      circ(ctx, px - 3.2 * s, py - 3.6 * s, 3.4 * s); ctx.fillStyle = '#ffffff'; ctx.fill();
    }
  }
  // brows — mote, expression ke hisaab se
  ctx.strokeStyle = (fx && fx.browC) || '#38302e'; ctx.lineWidth = 7.5 * s;
  for (const sd of [-1, 1]) {
    const asymAdj = sd === 1 ? P.asym * 11 : -P.asym * 5;
    const byI = (-36 - P.lift * 13 - P.tilt * 15 - asymAdj) * s;
    const byO = (-36 - P.lift * 13 + P.tilt * 7 - asymAdj * 0.4) * s;
    ctx.beginPath(); ctx.moveTo(sd * 12 * s, byI); ctx.lineTo(sd * 55 * s, byO); ctx.stroke();
  }
  // nose — chhota sa
  ell(ctx, 0, 15 * s, 9.5 * s, 7.5 * s); ctx.fillStyle = 'rgba(160,90,40,0.20)'; ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,25,0.45)'; ctx.lineWidth = 3 * s;
  ctx.beginPath(); ctx.arc(0, 12 * s, 9.5 * s, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
  // moustache (buddha) — muh ke upar safed band
  if (fx && fx.moustache) {
    ctx.fillStyle = '#e8edf1';
    ell(ctx, -17 * s, 36 * s, 19 * s, 8 * s); ctx.fill();
    ell(ctx, 17 * s, 36 * s, 19 * s, 8 * s); ctx.fill();
    ctx.strokeStyle = 'rgba(70,80,90,0.5)'; ctx.lineWidth = 2.6 * s;
    ell(ctx, -17 * s, 36 * s, 19 * s, 8 * s); ctx.stroke();
    ell(ctx, 17 * s, 36 * s, 19 * s, 8 * s); ctx.stroke();
  }
  // mouth — curve ya khula (lip-sync: mouth 0..1)
  const lip = mouth != null ? clamp(mouth, 0, 1) : 0;
  const openT = clamp(P.open + lip * 0.95, 0, 1);
  const my = (fx && fx.moustache) ? 52 * s : 46 * s;
  if (openT > 0.16) {
    const mw = (14 + openT * 7) * s, mh = (5 + openT * 19) * s;
    ell(ctx, 0, my + mh * 0.3, mw, mh); ctx.fillStyle = '#7c2d26'; ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = 4.5 * s; ctx.stroke();
    if (openT > 0.45) { // jeebh
      ctx.save(); ctx.clip();
      ell(ctx, 0, my + mh * 1.15, mw * 0.72, mh * 0.55); ctx.fillStyle = '#e2705f'; ctx.fill();
      ctx.restore();
    }
  } else {
    ctx.strokeStyle = '#4a2f28'; ctx.lineWidth = 6.5 * s;
    ctx.beginPath(); ctx.moveTo(-25 * s, my);
    ctx.quadraticCurveTo(0, my + P.curve * 23 * s, 25 * s, my); ctx.stroke();
  }
  // bindi (patni/beti)
  if (fx && fx.bindi) { circ(ctx, 0, -24 * s, 5 * s); ctx.fillStyle = '#c2261b'; ctx.fill(); }
}
export function drawSparkle(ctx, x, y, r, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y);
  ctx.fillStyle = '#fff3b0';
  ctx.beginPath();
  ctx.moveTo(0, -r); ctx.lineTo(r * 0.28, -r * 0.28); ctx.lineTo(r, 0); ctx.lineTo(r * 0.28, r * 0.28);
  ctx.lineTo(0, r); ctx.lineTo(-r * 0.28, r * 0.28); ctx.lineTo(-r, 0); ctx.lineTo(-r * 0.28, -r * 0.28);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}
export function drawNecklace(ctx, x, y, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#e8b23a'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-54, -34); ctx.quadraticCurveTo(0, 34, 54, -34); ctx.stroke();
  ctx.strokeStyle = '#c98f1b'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-54, -30); ctx.quadraticCurveTo(0, 36, 54, -30); ctx.stroke();
  // pendant: gold teardrop + red stone
  ctx.save(); ctx.translate(0, 32);
  ell(ctx, 0, 0, 13, 16); fillStroke(ctx, '#e8b23a', 3.5);
  circ(ctx, 0, 1, 6); ctx.fillStyle = '#c0272d'; ctx.fill();
  ctx.restore();
  const tw = 0.5 + 0.5 * Math.sin(t * 0.3);
  drawSparkle(ctx, -30, -6, 9 + tw * 5, 0.4 + tw * 0.6);
  drawSparkle(ctx, 36, -18, 7 + (1 - tw) * 5, 0.4 + (1 - tw) * 0.6);
  ctx.restore();
}
export function drawBangles(ctx, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const cols = ['#e8b23a', '#c03a3a', '#e8b23a', '#2e8b57', '#e8b23a'];
  cols.forEach((c, i) => {
    ell(ctx, 0, -14 + i * 8, 27, 11); ctx.strokeStyle = c; ctx.lineWidth = 5; ctx.stroke();
  });
  ctx.restore();
}
export function drawJewelBox(ctx, x, y, s = 1, open01 = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // lid (opens backwards)
  ctx.save(); ctx.translate(0, -8); ctx.rotate(-open01 * 1.85);
  rr(ctx, -80, -54, 160, 54, 9); fillStroke(ctx, '#7c2230', 5);
  rr(ctx, -68, -44, 136, 36, 6); ctx.fillStyle = '#93303f'; ctx.fill();
  ctx.strokeStyle = '#e8b23a'; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
  // base + cushion
  rr(ctx, -82, -10, 164, 54, 9); fillStroke(ctx, '#7c2230', 5);
  rr(ctx, -70, -6, 140, 30, 6); ctx.fillStyle = '#a33342'; ctx.fill();
  drawNecklace(ctx, 0, -16, 0.82, t);
  drawBangles(ctx, -52, 16, 0.55);
  drawBangles(ctx, 54, 16, 0.55);
  circ(ctx, 0, 20, 6); fillStroke(ctx, '#e8b23a', 3); // clasp
  ctx.restore();
}
export function drawSmartphone(ctx, x, y, s = 1, rot = 0, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  rr(ctx, -36, -66, 72, 132, 11); fillStroke(ctx, '#20242c', 5);
  const g = ctx.createLinearGradient(0, -56, 0, 56);
  g.addColorStop(0, '#aee6ff'); g.addColorStop(0.55, '#5fb2e8'); g.addColorStop(1, '#2e7cd6');
  rr(ctx, -29, -55, 58, 102, 7); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  poly(ctx, [[-29, -30], [6, -55], [18, -55], [-14, -30]]); ctx.fill();
  ctx.fillStyle = '#ffffff';
  rr(ctx, -20, 8, 40, 7, 3); ctx.fill(); rr(ctx, -20, 22, 28, 7, 3); ctx.fill();
  circ(ctx, 0, 58, 4.5); ctx.fillStyle = '#565b63'; ctx.fill();
  const tw = 0.5 + 0.5 * Math.sin(t * 0.25);
  drawSparkle(ctx, 30, -58, 8 + tw * 5, 0.35 + tw * 0.6);
  ctx.restore();
}
export function drawPadlock(ctx, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#8d97a3'; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.arc(0, -8, 17, Math.PI, 0); ctx.stroke();
  rr(ctx, -24, -8, 48, 40, 7); fillStroke(ctx, '#c9a227', 5);
  circ(ctx, 0, 8, 6); ctx.fillStyle = '#5e4300'; ctx.fill();
  ctx.fillRect(-3, 8, 6, 10);
  ctx.restore();
}
export function drawShutterSlats(ctx, x, y, w, h) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  for (let yy = y, i = 0; yy < y + h; yy += 27, i++) {
    ctx.fillStyle = i % 2 ? '#98a5b3' : '#aab6c2';
    ctx.fillRect(x, yy, w, 27);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x, yy, w, 4);
    ctx.fillStyle = 'rgba(30,40,55,0.4)'; ctx.fillRect(x, yy + 23, w, 4);
  }
  ctx.fillStyle = '#6e7a88'; ctx.fillRect(x, y + h - 34, w, 34);
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x, y + h - 34, w, 5);
  ctx.restore();
  ctx.strokeStyle = OUT; ctx.lineWidth = 6; ctx.strokeRect(x, y, w, h);
}
export function drawSignBoard(ctx, x, y, w, h, text, bg = '#1d4e79', fg = '#ffd23f', fontPx = 64) {
  rr(ctx, x - w / 2, y - h / 2, w, h, 14); fillStroke(ctx, bg, 7);
  ctx.strokeStyle = fg; ctx.lineWidth = 3.5;
  rr(ctx, x - w / 2 + 12, y - h / 2 + 12, w - 24, h - 24, 9); ctx.stroke();
  ctx.fillStyle = fg; ctx.font = `700 ${fontPx}px "Noto Sans Devanagari", sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 3);
}

// ---------------- MAA (saree) ----------------
// o: {x, y(feet), s, face, expr: worried|sad|calm|surprise|speak,
//     armL/armR: down|offer|hold|head|fold, blink, _t}
export function drawMaa(ctx, o) {
  const { x, y, s = 1 } = o;
  const face = o.face || 0, expr = o.expr || 'worried', blink = !!o.blink, t = o._t || 0;
  const skin = '#bd7f4e', saree = '#8a2b52', sareeD = '#6f2142', pallu = '#d1602f', blouse = '#d1602f';
  const bob = Math.sin(t * 0.13) * 1.5 * s;
  const hipY = y - 150 * s + bob * 0.4, shY = y - 272 * s + bob * 0.4;
  const hdY = y - 322 * s + bob * 0.5, hdX = x + face * 6 * s;
  // saree body: shoulders -> flared hem (drawn in torso space)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(0, bob / s * 0.4);
  poly(ctx, [[-47, -272], [47, -272], [80, 0], [-80, 0]]); fillStroke(ctx, saree, 5);
  // gold hem border
  ctx.fillStyle = '#e8b23a'; ctx.fillRect(-76, -22, 152, 9);
  ctx.fillStyle = 'rgba(232,178,58,0.5)'; ctx.fillRect(-70, -36, 140, 5);
  // pallu: diagonal sash right shoulder -> left hip
  poly(ctx, [[38, -272], [54, -258], [-30, -128], [-48, -146]]); fillStroke(ctx, pallu, 4);
  ctx.strokeStyle = '#e8b23a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(52, -260); ctx.lineTo(-32, -130); ctx.stroke();
  ctx.restore();
  // arms
  maaArm(ctx, x, shY, -1, o.armL || 'down', o, skin, blouse, hdY);
  maaArm(ctx, x, shY, 1, o.armR || 'down', o, skin, blouse, hdY);
  // head
  ctx.save(); ctx.translate(hdX, hdY);
  circ(ctx, -34 * s, -34 * s, 16 * s); fillStroke(ctx, '#2a2320', 4); // bun
  circ(ctx, 0, 0, 45 * s); fillStroke(ctx, skin);
  circ(ctx, -45 * s, 3 * s, 9 * s); fillStroke(ctx, skin, 4);
  circ(ctx, 45 * s, 3 * s, 9 * s); fillStroke(ctx, skin, 4);
  // hair cap + grey streak
  ctx.beginPath(); ctx.arc(0, -7 * s, 46 * s, Math.PI * 1.04, Math.PI * 1.96);
  ctx.lineTo(40 * s, -13 * s); ctx.quadraticCurveTo(0, -27 * s, -40 * s, -13 * s);
  ctx.closePath(); ctx.fillStyle = '#2a2320'; ctx.fill();
  ctx.strokeStyle = 'rgba(200,205,212,0.8)'; ctx.lineWidth = 3.5 * s;
  ctx.beginPath(); ctx.arc(0, -7 * s, 42 * s, Math.PI * 1.25, Math.PI * 1.5); ctx.stroke();
  // earrings + bindi
  circ(ctx, -45 * s, 14 * s, 5 * s); ctx.fillStyle = '#e8b23a'; ctx.fill();
  circ(ctx, 45 * s, 14 * s, 5 * s); ctx.fill();
  circ(ctx, 0, -13 * s, 4.2 * s); ctx.fillStyle = '#c0272d'; ctx.fill();
  maaFace(ctx, expr, blink, s, t);
  ctx.restore();
}
function maaArm(ctx, x, shY, side, pose, o, skin, blouse, hdY) {
  const s = o.s || 1, t = o._t || 0;
  const sx = x + side * 42 * s, sy = shY + 4 * s;
  let hx, hy;
  switch (pose) {
    case 'offer': hx = x + side * 15 * s; hy = shY + 92 * s; break;
    case 'hold': hx = x + side * 11 * s; hy = shY + 98 * s; break;
    case 'fold': hx = x - side * 2 * s; hy = shY + 118 * s; break;
    case 'head': hx = x + side * 33 * s; hy = hdY + 2 * s; break;
    default: hx = x + side * 58 * s; hy = shY + 112 * s;
  }
  const ex = (sx + hx) / 2 + side * 9 * s, ey = (sy + hy) / 2 + 10 * s;
  limb(ctx, sx, sy, ex, ey, 19 * s, blouse);
  limb(ctx, ex, ey, hx, hy, 15 * s, skin);
  // bangles at wrist
  ctx.strokeStyle = '#e8b23a'; ctx.lineWidth = 3.5 * s;
  for (let i = 0; i < 3; i++) {
    const bx = ex + (hx - ex) * (0.72 + i * 0.09), by = ey + (hy - ey) * (0.72 + i * 0.09);
    circ(ctx, bx, by, 9.5 * s); ctx.stroke();
  }
  circ(ctx, hx, hy, 10 * s); fillStroke(ctx, skin, 4);
}
function maaFace(ctx, expr, blink, s, t) {
  const ex = 17 * s, ey = -1 * s;
  ctx.lineCap = 'round';
  const eyeOpen = (cx) => { circ(ctx, cx, ey, 6.8 * s); ctx.fillStyle = '#241a12'; ctx.fill(); circ(ctx, cx + 2 * s, ey - 2 * s, 2.1 * s); ctx.fillStyle = '#fff'; ctx.fill(); };
  const eyeWide = (cx) => { circ(ctx, cx, ey, 9.5 * s); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3 * s; ctx.stroke(); circ(ctx, cx, ey + 1 * s, 4 * s); ctx.fillStyle = '#241a12'; ctx.fill(); };
  const eyeClosed = (cx) => { ctx.strokeStyle = OUT; ctx.lineWidth = 3.8 * s; ctx.beginPath(); ctx.moveTo(cx - 7.5 * s, ey); ctx.lineTo(cx + 7.5 * s, ey); ctx.stroke(); };
  const eyes = (wide) => { if (blink) { eyeClosed(-ex); eyeClosed(ex); } else if (wide) { eyeWide(-ex); eyeWide(ex); } else { eyeOpen(-ex); eyeOpen(ex); } };
  const brows = (l, r) => {
    ctx.strokeStyle = OUT; ctx.lineWidth = 4.6 * s;
    ctx.beginPath(); ctx.moveTo(-ex - 9 * s, ey - 18 * s + l[0]); ctx.lineTo(-ex + 9 * s, ey - 18 * s + l[1]); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex - 9 * s, ey - 18 * s + r[0]); ctx.lineTo(ex + 9 * s, ey - 18 * s + r[1]); ctx.stroke();
  };
  ctx.strokeStyle = 'rgba(90,55,30,0.65)'; ctx.lineWidth = 3.2 * s;
  ctx.beginPath(); ctx.moveTo(2 * s, ey + 5 * s); ctx.lineTo(-2 * s, ey + 14 * s); ctx.lineTo(3 * s, ey + 16 * s); ctx.stroke();
  const mouthY = ey + 29 * s;
  ctx.strokeStyle = OUT; ctx.lineWidth = 4.6 * s;
  if (expr === 'calm') {
    eyes(false); brows([-3, -3], [-3, -3]);
    ctx.beginPath(); ctx.arc(0, mouthY - 4 * s, 10 * s, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
  } else if (expr === 'surprise') {
    eyes(true); brows([-9, -9], [-9, -9]);
    ell(ctx, 0, mouthY + 2 * s, 7 * s, 9 * s); fillStroke(ctx, '#5e241d', 3.5);
  } else if (expr === 'speak') {
    eyes(false); brows([4, -4], [-4, 4]);
    const open = 4 + (Math.sin(t * 0.85) > 0 ? 4.5 : 1.2);
    ell(ctx, 0, mouthY + 1 * s, 7.5 * s, open * s); fillStroke(ctx, '#5e241d', 3.5);
  } else if (expr === 'sad') {
    eyes(false); brows([5, -5], [-5, 5]);
    ctx.beginPath(); ctx.arc(0, mouthY + 11 * s, 10 * s, Math.PI * 1.25, Math.PI * 1.75); ctx.stroke();
  } else { // worried
    eyes(false); brows([5, -5], [-5, 5]);
    ctx.beginPath();
    ctx.moveTo(-9 * s, mouthY + 2 * s);
    ctx.quadraticCurveTo(-4 * s, mouthY - 2 * s, 0, mouthY + 2 * s);
    ctx.quadraticCurveTo(4 * s, mouthY + 6 * s, 9 * s, mouthY + 2 * s);
    ctx.stroke();
  }
}

// ---------------- MAKAN MALIK (kurta landlord) ----------------
// o: {x, y(feet), s, face, expr: angry|stern, armL/armR: down|point|cross|hips,
//     walk(phase|null), blink, _t, shout 0..1 (mouth open amount)}
export function drawLandlord(ctx, o) {
  const { x, y, s = 1 } = o;
  const face = o.face || 0, expr = o.expr || 'angry', blink = !!o.blink, t = o._t || 0;
  const skin = '#a06a38', kurta = '#e2d0a4', kurtaD = '#c9b384', pajama = '#f0ead8';
  const bob = o.walk != null ? Math.abs(Math.sin(Math.PI * 2 * o.walk)) * 7 * s : Math.sin(t * 0.12) * 1.6 * s;
  const hipY = y - 148 * s + bob * 0.4, shY = y - 298 * s + bob * 0.4;
  const hdY = y - 350 * s + bob * 0.5, hdX = x + face * 7 * s;
  // legs (pajama) + sandals
  const sw = o.walk != null ? Math.sin(Math.PI * 2 * o.walk) * 0.4 : 0;
  const sw2 = o.walk != null ? Math.sin(Math.PI * 2 * o.walk + Math.PI) * 0.4 : 0;
  limb(ctx, x - 18 * s, hipY, x - 20 * s + Math.sin(sw) * 30 * s, y - 10 * s, 26 * s, pajama);
  limb(ctx, x + 18 * s, hipY, x + 20 * s + Math.sin(sw2) * 30 * s, y - 10 * s, 26 * s, pajama);
  for (const sd of [-1, 1]) {
    const fx = x + sd * 20 * s + Math.sin(sd < 0 ? sw : sw2) * 30 * s;
    ell(ctx, fx, y - 6 * s, 21 * s, 8 * s); fillStroke(ctx, '#7a4a21', 4);
    limb(ctx, fx - 8 * s, y - 10 * s, fx + 8 * s, y - 10 * s, 4 * s, '#5e3a18');
  }
  // kurta: long tunic, hip at 0 in torso space, hangs to +62
  ctx.save(); ctx.translate(x, hipY);
  poly(ctx, [[-68, 62], [68, 62], [54, -150], [-54, -150]]);
  ctx.fillStyle = kurta; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.strokeStyle = kurtaD; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(0, -146); ctx.lineTo(0, 40); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-66, 62); ctx.lineTo(-50, 26); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(66, 62); ctx.lineTo(50, 26); ctx.stroke();
  ctx.fillStyle = '#8a6d3b';
  for (const by of [-118, -84, -50]) { circ(ctx, 0, by, 3.6); ctx.fill(); }
  ctx.restore();
  // arms
  landlordArm(ctx, x, shY, -1, o.armL || 'down', o, skin, kurta, hipY);
  landlordArm(ctx, x, shY, 1, o.armR || 'down', o, skin, kurta, hipY);
  // head
  ctx.save(); ctx.translate(hdX, hdY);
  circ(ctx, 0, 0, 50 * s); fillStroke(ctx, skin);
  circ(ctx, -50 * s, 2 * s, 10 * s); fillStroke(ctx, skin, 4);
  circ(ctx, 50 * s, 2 * s, 10 * s); fillStroke(ctx, skin, 4);
  // grey hair: receding cap + side patches
  ctx.beginPath(); ctx.arc(0, -10 * s, 51 * s, Math.PI * 1.12, Math.PI * 1.88);
  ctx.lineTo(38 * s, -22 * s); ctx.quadraticCurveTo(0, -34 * s, -38 * s, -22 * s);
  ctx.closePath(); ctx.fillStyle = '#c9ccd1'; ctx.fill();
  ell(ctx, -46 * s, -8 * s, 8 * s, 16 * s); ctx.fillStyle = '#c9ccd1'; ctx.fill();
  ell(ctx, 46 * s, -8 * s, 8 * s, 16 * s); ctx.fill();
  landlordFace(ctx, expr, blink, s, t, o.shout || 0);
  ctx.restore();
}
function landlordArm(ctx, x, shY, side, pose, o, skin, kurta, hipY) {
  const s = o.s || 1, t = o._t || 0, face = o.face || 0;
  const sx = x + side * 48 * s, sy = shY + 6 * s;
  let hx, hy;
  switch (pose) {
    case 'point': {
      const dir = face !== 0 ? face : side;
      const jab = Math.sin(t * 0.7) * 5 * s;
      hx = x + dir * (128 * s) + jab; hy = shY + 2 * s; break;
    }
    case 'cross': hx = x - side * 26 * s; hy = shY + 62 * s; break;
    case 'hips': hx = x + side * 56 * s; hy = hipY - 4 * s; break;
    default: hx = x + side * 66 * s; hy = shY + 116 * s;
  }
  const ex = (sx + hx) / 2 + side * 10 * s, ey = (sy + hy) / 2 + 10 * s;
  limb(ctx, sx, sy, ex, ey, 23 * s, kurta);
  limb(ctx, ex, ey, hx, hy, 18 * s, skin);
  circ(ctx, hx, hy, 11.5 * s); fillStroke(ctx, skin, 4);
  if (pose === 'point') {
    const dir = face !== 0 ? face : side;
    limb(ctx, hx, hy, hx + dir * 20 * s, hy - 3 * s, 8 * s, skin); // pointing finger
  }
}
function landlordFace(ctx, expr, blink, s, t, shout) {
  const ex = 19 * s, ey = -2 * s;
  ctx.lineCap = 'round';
  // eyes: narrowed slits with pupils (angry) / normal (stern)
  for (const sd of [-1, 1]) {
    const cx = sd * ex;
    if (blink) {
      ctx.strokeStyle = OUT; ctx.lineWidth = 4 * s;
      ctx.beginPath(); ctx.moveTo(cx - 8 * s, ey); ctx.lineTo(cx + 8 * s, ey); ctx.stroke();
    } else if (expr === 'angry') {
      ctx.strokeStyle = OUT; ctx.lineWidth = 4.2 * s;
      ctx.beginPath(); ctx.moveTo(cx - 9 * s, ey - 2 * s); ctx.lineTo(cx + 9 * s, ey - 2 * s); ctx.stroke();
      circ(ctx, cx, ey + 3.5 * s, 4.6 * s); ctx.fillStyle = '#241a12'; ctx.fill();
    } else {
      circ(ctx, cx, ey, 7 * s); ctx.fillStyle = '#241a12'; ctx.fill();
      circ(ctx, cx + 2.4 * s, ey - 2.4 * s, 2.3 * s); ctx.fillStyle = '#fff'; ctx.fill();
    }
  }
  // thick brows (dark grey)
  ctx.strokeStyle = '#4c4f55'; ctx.lineWidth = 7 * s;
  if (expr === 'angry') { // slant down toward centre
    ctx.beginPath(); ctx.moveTo(-ex - 11 * s, ey - 22 * s); ctx.lineTo(-ex + 11 * s, ey - 13 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex + 11 * s, ey - 22 * s); ctx.lineTo(ex - 11 * s, ey - 13 * s); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(-ex - 11 * s, ey - 19 * s); ctx.lineTo(-ex + 11 * s, ey - 18 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex - 11 * s, ey - 18 * s); ctx.lineTo(ex + 11 * s, ey - 19 * s); ctx.stroke();
  }
  // nose
  ctx.strokeStyle = 'rgba(80,48,22,0.7)'; ctx.lineWidth = 3.6 * s;
  ctx.beginPath(); ctx.moveTo(2 * s, ey + 6 * s); ctx.lineTo(-2 * s, ey + 16 * s); ctx.lineTo(3 * s, ey + 18 * s); ctx.stroke();
  // thick grey mustache
  ctx.fillStyle = '#c9ccd1';
  ctx.save(); ctx.translate(-11 * s, ey + 24 * s); ctx.rotate(0.16); ell(ctx, 0, 0, 14 * s, 6.5 * s); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(11 * s, ey + 24 * s); ctx.rotate(-0.16); ell(ctx, 0, 0, 14 * s, 6.5 * s); ctx.fill(); ctx.restore();
  // mouth under mustache
  const mouthY = ey + 38 * s;
  if (expr === 'angry') {
    const open = (7 + shout * 7) * s;
    ell(ctx, 0, mouthY, 12 * s, open); fillStroke(ctx, '#5e241d', 4);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(-10 * s, mouthY - open + 1 * s, 20 * s, 4.5 * s);
  } else {
    ctx.strokeStyle = OUT; ctx.lineWidth = 5 * s;
    ctx.beginPath(); ctx.moveTo(-11 * s, mouthY); ctx.lineTo(11 * s, mouthY); ctx.stroke();
  }
}

// ---------------- HERO SITTING (Rinku on the ground) ----------------
// o: drawHero opts + slump 0..1, tear bool, armMode: knees|gesture|support
export function drawHeroSitting(ctx, o) {
  const { x, y, s = 1 } = o;
  const face = o.face || 0, expr = o.expr || 'sad', blink = !!o.blink, t = o._t || 0;
  const skin = o.skin || '#bf8250', hairC = o.hairC || '#20242c';
  const shirt = o.shirt || '#2e7cd6', shirtD = o.shirtD || '#2568b5', pants = o.pants || '#33415c';
  const slump = o.slump || 0, dip = (o.headDip || 0) * s + slump * 14 * s;
  // ground shadow
  ell(ctx, x, y + 6 * s, 128 * s, 17 * s); ctx.fillStyle = 'rgba(20,16,30,0.28)'; ctx.fill();
  // seat wedge (hips/thigh base resting on the ground — no floating)
  const hipX = x, hipY = y - 80 * s;
  ctx.save(); ctx.translate(hipX, y); ctx.scale(s, s);
  poly(ctx, [[-48, -78], [48, -78], [60, -4], [-60, -4]]);
  ctx.fillStyle = pants; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
  // legs: knees UP (knees higher than hips), feet flat in front
  for (const sd of [-1, 1]) {
    const kneeX = x + sd * 60 * s, kneeY = y - 150 * s + slump * 5 * s;
    const ankX = x + sd * 76 * s, ankY = y - 10 * s;
    limb(ctx, hipX + sd * 13 * s, hipY, kneeX, kneeY, 28 * s, pants);
    limb(ctx, kneeX, kneeY, ankX, ankY, 24 * s, pants);
    ell(ctx, ankX, y - 5 * s, 20 * s, 8 * s); fillStroke(ctx, '#2b2b2b', 4);
  }
  // torso (leans forward with slump)
  const shX = x + slump * 12 * s, shY = y - 206 * s + slump * 8 * s;
  ctx.save(); ctx.translate(hipX, hipY); ctx.rotate(slump * 0.1);
  poly(ctx, [[-47, 4], [47, 4], [41, -126], [-41, -126]]);
  ctx.fillStyle = shirt; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.fillStyle = '#6b4423'; ctx.fillRect(-47, -8, 94, 13);
  rr(ctx, 14, -122, 24, 26, 3); ctx.strokeStyle = shirtD; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#ffffff';
  circ(ctx, 0, -110, 3); ctx.fill(); circ(ctx, 0, -60, 3); ctx.fill();
  ctx.restore();
  // arms
  const armMode = o.armMode || 'knees';
  for (const sd of [-1, 1]) {
    const sxp = shX + sd * 40 * s, syp = shY + 6 * s;
    let hx, hy;
    if (armMode === 'gesture' && sd === 1) { hx = x + 90 * s; hy = y - 176 * s + Math.sin(t * 0.3) * 4 * s; }
    else if (armMode === 'support' && sd === -1) { hx = x - 86 * s; hy = y - 14 * s; }
    else { hx = x + sd * 57 * s; hy = y - 152 * s + slump * 5 * s; } // hands resting on knees
    const ex = (sxp + hx) / 2 + sd * 10 * s, ey = (syp + hy) / 2 + 10 * s;
    limb(ctx, sxp, syp, ex, ey, 21 * s, shirt);
    limb(ctx, ex, ey, hx, hy, 17 * s, skin);
    circ(ctx, hx, hy, 11 * s); fillStroke(ctx, skin, 4);
  }
  // head
  const hdX = shX + face * 6 * s, hdY = shY - 62 * s + dip;
  ctx.save(); ctx.translate(hdX, hdY);
  circ(ctx, 0, 0, 48 * s); fillStroke(ctx, skin);
  circ(ctx, -48 * s, 2 * s, 10 * s); fillStroke(ctx, skin, 4);
  circ(ctx, 48 * s, 2 * s, 10 * s); fillStroke(ctx, skin, 4);
  ctx.beginPath(); ctx.arc(0, -8 * s, 49 * s, Math.PI * 1.03, Math.PI * 1.97);
  ctx.lineTo(42 * s, -14 * s); ctx.quadraticCurveTo(10 * s, -30 * s, -20 * s, -16 * s);
  ctx.lineTo(-42 * s, -14 * s); ctx.closePath();
  ctx.fillStyle = hairC; ctx.fill();
  ctx.beginPath(); ctx.arc(14 * s, -34 * s, 20 * s, Math.PI * 1.1, Math.PI * 1.9);
  ctx.lineTo(30 * s, -40 * s); ctx.closePath(); ctx.fillStyle = hairC; ctx.fill();
  ctx.save(); ctx.scale(48 / 88, 48 / 88); drawFace(ctx, expr, blink, s, t); ctx.restore();
  ctx.restore();
  // tears: streaks + falling drops
  if (o.tear) {
    ctx.strokeStyle = 'rgba(140,200,240,0.75)'; ctx.lineWidth = 3.5 * s;
    for (const sd of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(hdX + sd * 18 * s, hdY + 6 * s); ctx.lineTo(hdX + sd * 18 * s, hdY + 26 * s); ctx.stroke();
    }
    for (let i = 0; i < 2; i++) {
      const ph = ((t * 0.045 + i * 0.5) % 1);
      const dx = hdX + (i ? 18 : -18) * s, dy = hdY + 10 * s + ph * 52 * s;
      ctx.save(); ctx.globalAlpha = 1 - ph; ctx.translate(dx, dy);
      ctx.fillStyle = '#7cc4ec';
      ctx.beginPath(); ctx.moveTo(0, -8 * s);
      ctx.quadraticCurveTo(6 * s, 2 * s, 0, 7 * s);
      ctx.quadraticCurveTo(-6 * s, 2 * s, 0, -8 * s); ctx.fill();
      ctx.restore();
    }
  }
}
