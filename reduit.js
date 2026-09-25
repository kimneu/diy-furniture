/* Reduit: Regalausbau eines kleinen Raums. Braucht die Globals aus shared.js. */
'use strict';

const REDUIT_DEFAULTS = {
  rw:1600, rd:1400, rh:2400, doorW:800, doorIn:false, hinge:'L', wall:'solid',
  shape:'U', corner:'L', build:'built', sys:'battens',
  dBack:400, dLeft:300, dRight:300, nShelves:5, gapBottom:150, gapTop:300,
  nicheL:false, nicheLW:450, nicheLH:1300, nicheR:false, nicheRW:450, nicheRH:1300,
  nicheB:'none', nicheBW:450, nicheBH:1300
};
const SIDE_NAME = { back:'hinten', left:'links', right:'rechts' };

/* ---------- Eingaben begrenzen ---------- */
function normReduit(c0){
  const c = { ...REDUIT_DEFAULTS, ...c0 }, warn = [];
  const num = (k, a, b) => { c[k] = r0(clamp(Number(c[k]), a, b)); };
  num('rw', 600, 4000); num('rd', 600, 4000); num('rh', 1800, 3000);
  num('doorW', 600, Math.min(1200, c.rw - 100));
  for (const k of ['dBack', 'dLeft', 'dRight']) num(k, 150, 600);
  num('nShelves', 1, 8); num('gapBottom', 0, 600); num('gapTop', 100, 800);
  for (const k of ['nicheLW', 'nicheRW', 'nicheBW']) num(k, 300, 1000);
  for (const k of ['nicheLH', 'nicheRH', 'nicheBH']) num(k, 600, 1800);
  if (!['I', 'L', 'U'].includes(c.shape)) c.shape = 'U';
  if (c.build !== 'free') c.build = 'built';
  if (!['battens', 'rails', 'brackets', 'cheeks', 'posts'].includes(c.sys)) c.sys = 'battens';
  c.doorIn = c.doorIn === true || c.doorIn === 'on';
  c.nicheL = c.nicheL === true || c.nicheL === 'on';
  c.nicheR = c.nicheR === true || c.nicheR === 'on';
  const hasL = c.shape === 'U' || (c.shape === 'L' && c.corner !== 'R');
  const hasR = c.shape === 'U' || (c.shape === 'L' && c.corner === 'R');
  c.hasL = hasL; c.hasR = hasR;

  // Seiten dürfen sich nicht überschneiden: mind. 300 mm frei zwischen den Seitenregalen
  const sideSum = (hasL ? c.dLeft : 0) + (hasR ? c.dRight : 0), maxSum = c.rw - 300;
  if (sideSum > maxSum) {
    const k = maxSum / sideSum;
    if (hasL) c.dLeft = Math.max(150, Math.floor(c.dLeft * k));
    if (hasR) c.dRight = Math.max(150, Math.floor(c.dRight * k));
    warn.push(`Die Seitenregale sind zu tief für ${c.rw} mm Raumbreite – Tiefe auf ${[hasL && c.dLeft, hasR && c.dRight].filter(Boolean).join(' / ')} mm begrenzt.`);
  }
  // Hinten muss vorne noch Platz bleiben
  if (c.dBack > c.rd - 300) { c.dBack = Math.max(150, c.rd - 300); warn.push(`Das hintere Regal ist zu tief für ${c.rd} mm Raumtiefe – auf ${c.dBack} mm begrenzt.`); }
  // Tablare brauchen Höhe
  if (c.rh - c.gapTop - c.gapBottom < 300) { c.gapTop = Math.max(100, c.rh - c.gapBottom - 300); warn.push(`Abstand zur Decke auf ${c.gapTop} mm reduziert, damit die Tablare Platz haben.`); }
  // Hintere Nische nur, wo kein Seitenregal davor steht
  if (!['none', 'L', 'R'].includes(c.nicheB)) c.nicheB = 'none';
  if ((c.nicheB === 'L' && hasL) || (c.nicheB === 'R' && hasR)) {
    warn.push(`Die hintere Nische ${c.nicheB === 'L' ? 'links' : 'rechts'} läge hinter dem Seitenregal und wäre nicht erreichbar – Nische weggelassen.`);
    c.nicheB = 'none';
  }
  if (!hasL) c.nicheL = false;
  if (!hasR) c.nicheR = false;
  return { cfg: c, warn };
}

/* ---------- Geometrie ---------- */
// Unterkante jedes Tablars, gleichmässig vom Boden- bis zum Deckenabstand.
function shelfLevels(n, gapBottom, gapTop, H){
  if (n <= 1) return [gapBottom];
  const top = H - gapTop;
  return Array.from({ length:n }, (_, i) => r0(gapBottom + (top - gapBottom) * i / (n - 1)));
}

// Segmente je Form. u = Koordinate entlang der Wand: hinten ab linker Wand, seitlich ab Rückwand.
// ends: 'wall' (liegt an einer Wand), 'corner' (stösst ans hintere Regal), 'free' (endet im Raum).
function layoutReduit(c){
  const W = c.rw, D = c.rd, warn = [], segs = [];
  const wf = (W - c.doorW) / 2;
  const back = { id:'back', depth:c.dBack, u0:0, u1:W, ends:['wall', 'wall'], niche:null };
  if (c.nicheB !== 'none') back.niche = { at: c.nicheB === 'L' ? 'start' : 'end', w:c.nicheBW, h:c.nicheBH };
  segs.push(back);
  for (const id of ['left', 'right']) {
    if (id === 'left' ? !c.hasL : !c.hasR) continue;
    const depth = id === 'left' ? c.dLeft : c.dRight;
    const s = { id, depth, u0:c.dBack, u1:D, ends:['corner', 'wall'], niche:null };
    if (c.doorIn && c.hinge === (id === 'left' ? 'L' : 'R')) { s.u1 = D - c.doorW; s.ends[1] = 'free'; }
    if (s.u1 - s.u0 < 200) { warn.push(`Das Regal ${SIDE_NAME[id]} entfällt – die nach innen aufgehende Tür braucht den Platz.`); continue; }
    if (s.ends[1] === 'wall' && depth > wf) warn.push(`Das Regal ${SIDE_NAME[id]} ist ${depth} mm tief, neben der Tür bleiben aber nur ${r0(wf)} mm Wand – es ragt in die Türöffnung.`);
    const on = id === 'left' ? c.nicheL : c.nicheR;
    if (on) s.niche = { at:'end', w: id === 'left' ? c.nicheLW : c.nicheRW, h: id === 'left' ? c.nicheLH : c.nicheRH };
    segs.push(s);
  }
  for (const s of segs) {
    if (!s.niche) continue;
    const maxW = s.u1 - s.u0 - 200;
    if (maxW < 300) { warn.push(`Das Regal ${SIDE_NAME[s.id]} ist zu kurz für eine Nische – Nische weggelassen.`); s.niche = null; continue; }
    if (s.niche.w > maxW) { s.niche.w = maxW; warn.push(`Nische ${SIDE_NAME[s.id]} auf ${maxW} mm Breite begrenzt.`); }
  }
  if (c.hasL && c.hasR) {
    const pass = W - c.dLeft - c.dRight;
    if (pass < 600) warn.push(`Zwischen den Seitenregalen bleiben nur ${pass} mm Durchgang – ab etwa 600 mm lässt es sich bequem hineingehen.`);
  }
  return { segs, warn, wf };
}

// Wandkoordinaten (u entlang, v von der Wand in den Raum) in Raumkoordinaten.
function toWorld(seg, W, D, u, y, v){
  if (seg.id === 'back') return [-W/2 + u, y, -D/2 + v];
  if (seg.id === 'left') return [-W/2 + v, y, -D/2 + u];
  return [W/2 - v, y, -D/2 + u];
}
function worldAxis(seg, local){
  if (local === 'y') return 'y';
  return (seg.id === 'back') === (local === 'u') ? 'x' : 'z';
}
// Box im R.boxes-Format aus lokalen Grenzen. thin/grain lokal ('u'|'v'|'y'), ex = [entlang, hoch, in den Raum].
function boxOf(seg, W, D, b, thin, grain, fin, ex){
  const lu = b.u1 - b.u0, ly = b.y1 - b.y0, lv = b.v1 - b.v0;
  const pos = toWorld(seg, W, D, (b.u0 + b.u1) / 2, (b.y0 + b.y1) / 2, (b.v0 + b.v1) / 2);
  const size = seg.id === 'back' ? [lu, ly, lv] : [lv, ly, lu];
  const [eu, ey, ev] = ex || [0, 0, 0];
  const exW = seg.id === 'back' ? [eu, ey, ev] : seg.id === 'left' ? [ev, ey, eu] : [-ev, ey, eu];
  return { size, pos, thin: worldAxis(seg, thin), grain: worldAxis(seg, grain), fin, ex: exW };
}

if (typeof module !== 'undefined') module.exports = { REDUIT_DEFAULTS, normReduit, shelfLevels, layoutReduit, toWorld, boxOf };
