/* Reduit: Regalausbau eines kleinen Raums. Braucht die Globals aus shared.js. */
'use strict';

const REDUIT_DEFAULTS = {
  rw:1600, rd:1400, rh:2400, doorW:800, doorPos:'M', doorOff:200, doorH:2000, doorIn:false, hinge:'L', wall:'solid',
  shape:'U', corner:'L', build:'built', sys:'posts',
  dBack:400, dLeft:300, dRight:300, nShelves:5, gapBottom:150, gapTop:300,
  nicheL:false, nicheLW:450, nicheLH:1300, nicheR:false, nicheRW:450, nicheRH:1300
};
const SIDE_NAME = { back:'hinten', left:'links', right:'rechts' };

/* ---------- Eingaben begrenzen ---------- */
function normReduit(c0){
  const c = { ...REDUIT_DEFAULTS, ...c0 }, warn = [];
  // Fehlt ein Wert (ältere Entwürfe kennen z. B. die Türlage nicht), gilt der Standard.
  const num = (k, a, b) => { const v = Number(c[k]); c[k] = r0(clamp(Number.isFinite(v) ? v : REDUIT_DEFAULTS[k], a, b)); };
  num('rw', 600, 4000); num('rd', 600, 4000); num('rh', 1800, 3000);
  num('doorW', 600, 1200); num('doorH', 1500, 2600); num('doorOff', 50, 3000);
  if (c.doorW > c.rw - 100) { c.doorW = c.rw - 100; warn.push(`Türbreite auf ${c.doorW} mm verkleinert – neben der Tür braucht es mindestens 50 mm Wand pro Seite.`); }
  if (c.doorH > c.rh) { c.doorH = c.rh; warn.push(`Türhöhe auf die Raumhöhe (${c.rh} mm) begrenzt.`); }
  if (!['L', 'M', 'R'].includes(c.doorPos)) c.doorPos = 'M';
  if (c.doorPos !== 'M' && c.doorOff > c.rw - c.doorW - 50) { c.doorOff = c.rw - c.doorW - 50; warn.push(`Abstand der Tür zur Wand auf ${c.doorOff} mm begrenzt – auf der anderen Seite braucht es mindestens 50 mm Wand.`); }
  // Linke Kante der Türöffnung ab der linken Wand.
  c.doorX0 = c.doorPos === 'L' ? c.doorOff : c.doorPos === 'R' ? c.rw - c.doorOff - c.doorW : (c.rw - c.doorW) / 2;
  for (const k of ['dBack', 'dLeft', 'dRight']) num(k, 150, 600);
  // Ganze Bretter (nur ablängen): Tiefe = Brettbreite. Jetzt aufrunden, nach den Begrenzungen unten abrunden.
  const BM = MATS[c.mat] && MATS[c.mat].boards ? MATS[c.mat] : null;
  const want = { dBack:c.dBack, dLeft:c.dLeft, dRight:c.dRight };
  if (BM) for (const k of ['dBack', 'dLeft', 'dRight']) { const B = BM.widths.find(w => w >= c[k]); c[k] = B == null ? BM.widths[BM.widths.length - 1] : B; }
  num('nShelves', 1, 8); num('gapBottom', 0, 600); num('gapTop', 100, 800);
  for (const k of ['nicheLW', 'nicheRW']) num(k, 300, 1000);
  for (const k of ['nicheLH', 'nicheRH']) num(k, 600, 1800);
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
  if (BM) {
    const moved = [];
    for (const [k, side, on] of [['dBack', 'hinten', true], ['dLeft', 'links', hasL], ['dRight', 'rechts', hasR]]) {
      // Passt keine Brettbreite in die Begrenzung, bleibt die begrenzte Tiefe (die Teile melden dann «passt auf kein Brett»).
      const B = [...BM.widths].reverse().find(w => w <= c[k]);
      if (B != null) c[k] = B;
      if (on && B != null && c[k] !== want[k]) moved.push(`${side} ${c[k]} mm`);
    }
    if (moved.length) warn.push(`Tiefe ${joinDe(moved)} gesetzt (Brettbreite ${BM.name}: ${BM.widths.join(', ')} mm).`);
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
// Tür nach innen: Das offene Blatt steht parallel zur Seitenwand, im Abstand des Wandstücks neben der Tür.
// Ein Regal auf der Bandseite wird nur gekürzt, wenn es tiefer ist als dieses Wandstück minus Blatt und Drücker.
const TUER_BLATT = 110;
function layoutReduit(c){
  const W = c.rw, D = c.rd, warn = [], segs = [];
  const x0 = c.doorX0 != null ? c.doorX0 : (W - c.doorW) / 2;
  const wand = { left:x0, right:W - x0 - c.doorW };   // Wandstück neben der Tür
  // Reststücke neben der Tür lohnen sich nicht: unter 400 mm bei Wangen und Modulen, sonst unter 300 mm (Review K15).
  const restMin = c.build === 'free' || c.sys === 'cheeks' ? 400 : 300;
  let puffer = false;
  const back = { id:'back', depth:c.dBack, u0:0, u1:W, ends:['wall', 'wall'], niche:null };
  segs.push(back);
  for (const id of ['left', 'right']) {
    if (id === 'left' ? !c.hasL : !c.hasR) continue;
    const depth = id === 'left' ? c.dLeft : c.dRight;
    const s = { id, depth, u0:c.dBack + railsVor(c), u1:D, ends:['corner', 'wall'], niche:null };
    const wf = wand[id];
    if (c.doorIn && c.hinge === (id === 'left' ? 'L' : 'R')) {
      if (depth > wf - TUER_BLATT) { s.u1 = D - c.doorW; s.ends[1] = 'free'; }
      else puffer = true;   // Das Blatt steht vor dem Regal: ein Türstopper hält die Klinke davon fern.
    }
    // Reststücke unter 400 mm lohnen sich nicht (Stummel mit zwei Stützen; Review K15).
    if (s.u1 - s.u0 < restMin) { warn.push(`Das Regal ${SIDE_NAME[id]} entfällt – neben der nach innen aufgehenden Tür blieben nur ${r0(Math.max(0, s.u1 - s.u0))} mm, zu kurz für ein Regal.`); continue; }
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
    // Beim Pfostenrahmen stehen die Pfosten 45 mm vor den Seitenregalen.
    const posts = c.build !== 'free' && c.sys === 'posts' ? 90 : 0;
    const pass = W - c.dLeft - c.dRight - posts - 2 * railsVor(c);
    if (pass < 600) warn.push(`Zwischen den Seitenregalen bleiben nur ${pass} mm Durchgang${posts ? ' (zwischen den Pfosten)' : ''} – ab etwa 600 mm lässt es sich bequem hineingehen.`);
  }
  return { segs, warn, wand, x0, puffer };
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

/* ---------- Statik & Kaufteile ---------- */
// Spannweiten SPAN und maxSpan stehen in shared.js (Sideboard und Reduit rechnen gleich).


// Kaufteile bei Jumbo. Preise (CHF pro Stück bzw. pro Laufmeter bei unit 'm') und Quellen in preise.js → kaufteile.
// est:true = Jumbo führt das Produkt, der Preis war aber nicht abrufbar (Bot-Schutz) – Schätzung, im Laden prüfen.
const BUY_INFO = {
  kant45:    { name:'Kantholz Fichte 45 × 45 mm', unit:'m' },
  latte:     { name:'Dachlatte Fichte 24 × 48 mm', unit:'m' },
  rail1000:  { name:'Wandschiene Element System, 100 cm' },
  rail1500:  { name:'Wandschiene Element System, 150 cm' },
  rail2000:  { name:'Wandschiene Element System, 200 cm' },
  konsole250: { name:'Konsole Element System, 25 cm' },
  konsole300: { name:'Konsole Element System, 30 cm' },
  konsole350: { name:'Konsole Element System, 35 cm' },
  konsole400: { name:'Konsole Element System, 40 cm' },
  konsole470: { name:'U-Träger Element System, 47 cm' },
  winkel150: { name:'Blechkonsole weiss 150 × 200 mm' },
  winkel200: { name:'Blechkonsole weiss 200 × 250 mm' },
  winkel250: { name:'Blechkonsole weiss 250 × 300 mm' },
  shelfpin:  { name:'Steckbodenträger Ø 5 mm (Hettich)' },
  angle40:   { name:'Winkelverbinder 40 × 40 mm inkl. Schrauben' },
  dowel6:    { name:'Spreizdübel 6 mm + Schraube 4,5 × 50 mm' },
  dowel6x60: { name:'Spreizdübel 6 mm + Schraube 5 × 60 mm' },
  dowel6x70: { name:'Spreizdübel 6 mm + Schraube 5 × 70 mm' },
  hollow:    { name:'Hohlraumdübel HM 5 × 52 inkl. Schraube (Fischer)' },
  screw5x60: { name:'Holzschrauben 5 × 60 mm' },
  tipguard:  { name:'Kippsicherung mit Gurt, 2 Stück (Abus Isa)' },
  doorstop:  { name:'Türstopper zum Anschrauben' },
  // Holzschrauben nach Länge (SCHRAUBEN, screwFor in shared.js)
  ...Object.fromEntries(SCHRAUBEN.map(s => [screwKey(s), { name:`Holzschrauben ${screwText(s)} mm` }]))
};
const BUY = Object.fromEntries(Object.entries(BUY_INFO).map(([k, b]) => {
  const P = PRICE_DATA.kaufteile[k] || { price:0, est:true };
  return [k, { ...b, price:P.price, ...(P.est ? { est:true } : {}) }];
}));
const RAIL_LENS = [1000, 1500, 2000], RAIL_MAX = 2000;
// Längen der Schienenstücke für `need` mm. Über 2000 mm zwei Stücke, jedes mindestens 500 mm, damit das obere
// genug Dübel und Konsolen trägt (Review TR-13). Gekürzt wird nur am freien Ende, das Lochraster läuft am Stoss durch.
const RAIL_STUECK_MIN = 500;
function railParts(need){
  if (need <= RAIL_MAX) return [r0(need)];
  const oben = Math.max(RAIL_STUECK_MIN, need - RAIL_MAX);
  return [r0(need - oben), r0(oben)];
}
// Wandschiene: so tief steht sie von der Wand ab (Annahme, am Produkt nachmessen). Das Tablar beginnt 2 mm davor.
const RAIL_T = 12, RAIL_V0 = RAIL_T + 2;
// Ganze Bretter bei Wandschienen: das Brett beginnt vor der Schiene und steht darum so viel weiter vor als die Tiefe.
const railsVor = c => c.build !== 'free' && c.sys === 'rails' && MATS[c.mat] && MATS[c.mat].boards ? RAIL_V0 - 3 : 0;
const KONSOLE_LENS = [250, 300, 350, 400, 470];
const WINKEL_LENS = [150, 200, 250];
// Blechkonsolen: Tiefenschenkel → Wandschenkel (der lange Schenkel kommt an die Wand).
const WINKEL_WAND = { 150:200, 200:250, 250:300 };
const winkelFuer = depth => WINKEL_LENS.find(l => l >= depth * 2 / 3) || WINKEL_LENS[WINKEL_LENS.length - 1];
const SYS = {
  battens:  { name:'Leisten', level:1 },
  rails:    { name:'Wandschienen', level:1 },
  brackets: { name:'Tablarwinkel', level:1 },
  cheeks:   { name:'Wangen mit Lochreihe', level:2 },
  posts:    { name:'Pfostenrahmen', level:1 }
};
const SOLID_FIN = { color:'#DDBF8E', ply:false, grain:true, plyColor:'#DDBF8E' };

// Stützenzahl: so viele Felder, dass jedes kürzer als max ist.
const pieces = (len, max) => Math.floor(len / max) + 1;
// Gleichmässig verteilte Positionen von a bis b (inkl. Enden).
const spread = (a, b, n) => n <= 1 ? [(a + b) / 2] : Array.from({ length:n }, (_, i) => a + (b - a) * i / (n - 1));
const posLabel = i => i < 26 ? String.fromCharCode(65 + i) : String.fromCharCode(64 + Math.floor(i / 26)) + String.fromCharCode(65 + i % 26);

// Tablar-Stücke eines Segments je Höhe. Unter der Nischenhöhe wird das Tablar um die Nische gekürzt.
function shelfPieces(seg, levels){
  return levels.map(y => {
    let a = seg.u0, b = seg.u1;
    const ends = seg.ends.slice();
    const inNiche = !!seg.niche && y < seg.niche.h;
    if (inNiche) {
      if (seg.niche.at === 'start') { a += seg.niche.w; ends[0] = 'free'; }
      else { b -= seg.niche.w; ends[1] = 'free'; }
    }
    if (ends[0] === 'wall') a += 3;
    if (ends[1] === 'wall') b -= 3;
    return { y, a, b, ends, inNiche };
  });
}

// Wangen: linke Kante jeder Wange entlang u (Enden, Nischenkante, Zwischenwangen).
function cheekPositions(seg, t, max){
  const start = seg.u0 + (seg.ends[0] === 'wall' ? 3 : 0);
  const end = seg.u1 - (seg.ends[1] === 'wall' ? 3 : 0) - t;
  const fixed = [start];
  if (seg.niche) fixed.push((seg.niche.at === 'end' ? seg.u1 - seg.niche.w : seg.u0 + seg.niche.w) - t/2);
  fixed.push(end);
  fixed.sort((x, y) => x - y);
  const out = [];
  for (let i = 0; i < fixed.length - 1; i++) {
    const p = fixed[i], q = fixed[i + 1];
    let nb = 1;
    while ((q - p - t - (nb - 1) * t) / nb >= max) nb++;
    const bay = (q - p - t - (nb - 1) * t) / nb;
    for (let k = 0; k < nb; k++) out.push(p + k * (bay + t));
  }
  out.push(fixed[fixed.length - 1]);
  return out.map(r0);
}

// Eckfach (Wangen, selbststehend, L/U): Das Seitenregal steht vor dem ersten hinteren Fach. Bleiben davon mindestens
// ECKFACH_MIN offen, wird das Fach genutzt und zuerst bestückt; sonst bleibt das Eckquadrat leer (Entscheid 28.09.2026).
const ECKFACH_MIN = 350;
// Seitenregale, die an der Ecke ans hintere stossen: { id, depth }.
const eckSeiten = ctx => ctx.segs.filter(s => s.ends[0] === 'corner');
function eckfachMelden(ctx, id, offen, leer){
  if (leer) groupWarn(ctx, 'eckLeer', SIDE_NAME[id], sides => `Das hintere Eckfach ${sides} wäre nur ${r0(offen)} mm offen – leeres Eckquadrat eingeplant, so bezahlst du keine Tablare, an die man nicht herankommt.`);
  (ctx.eck[leer ? 'leer' : 'fach'] = ctx.eck[leer ? 'leer' : 'fach'] || []).push(SIDE_NAME[id]);
}

// Selbststehend: Anzahl und Breite der Module, damit die Böden unter max bleiben.
function moduleSplit(len, max, t){
  const mw = Math.min(900, max + 2*t - 1);
  const m = Math.max(1, Math.ceil(len / mw));
  return { m, w: (len - (m - 1) * 2) / m };
}

/* ---------- Bauarten (eingebaut) ---------- */
// v0 = Abstand der Tablar-Hinterkante zur Wand: 3 mm Luft, bei Wandschienen vor der Schiene.
// Plattenmaterial wird entsprechend schmaler zugeschnitten; ein ganzes Brett behält seine Breite und steht weiter vor.
function addShelf(ctx, seg, p, note, v0 = 3){
  if (p.ends.includes('joint')) note += ', am Stoss auf der Stossleiste';
  const v1 = seg.depth + (ctx.boards ? v0 - 3 : 0);
  ctx.add('Tablar', p.b - p.a, v1 - v0, ctx.t, ctx.gMain, note, 'korpus',
    ctx.box(seg, { u0:p.a, u1:p.b, y0:p.y, y1:p.y + ctx.t, v0, v1 }, 'y', 'u', ctx.fin, [0, 0, 200]));
}
// Eckleiste unter dem Stoss zum hinteren Regal.
function addCornerBatten(ctx, seg, p){
  addStrip(ctx, 'Eckleiste', seg.depth - 3, 'unter dem Eckstoss, an beide Tablare geschraubt',
    ctx.box(seg, { u0:p.a - 20, u1:p.a + 20, y0:p.y - ctx.t, y1:p.y, v0:3, v1:seg.depth }, 'y', 'v', ctx.stripFin, [0, -60, 0]));
  ctx.screw(ctx.boards ? 'latte' : 'streifen', 4, 'Eckleisten');
}
// Kantholz vor der Tablarkante (v = Tiefe … Tiefe + 45), damit die Tablare rechteckig bleiben; at = linke Kante entlang u.
function addPost(ctx, seg, at, height, note){
  const f = seg.depth + railsVor(ctx.c);   // Vorderkante der Tablare
  ctx.add('Kantholz 45 × 45', height, 45, 45, ctx.gSolid, note, 'solid',
    ctx.box(seg, { u0:at, u1:at + 45, y0:0, y1:height, v0:f, v1:f + 45 }, 'u', 'y', SOLID_FIN, [0, 0, 120]), BUY.kant45.price);
}
// Stützen an freien Enden (Tür nach innen, Nischenkante) für Leisten, Schienen, Winkel.
function freeEndPosts(ctx, seg, shelves){
  const at = new Map();
  for (const p of shelves) for (const e of [0, 1]) {
    if (p.ends[e] !== 'free') continue;
    const u = e === 0 ? p.a : p.b - 45;
    const cur = at.get(u) || { h:0, n:0 };
    at.set(u, { h: Math.max(cur.h, p.y + ctx.t), n: cur.n + 1 });
  }
  for (const [u, { h, n }] of at) {
    addPost(ctx, seg, u, h, 'Stütze vor dem freien Ende, Tablare mit Winkeln verschraubt');
    ctx.buy('angle40', n, 'Tablare an die Stütze');
  }
}
// Gleichartige Meldungen mehrerer Wände zu einer zusammenfassen.
function groupWarn(ctx, key, part, text){
  const g = ctx.grouped.get(key) || { parts:[], text };
  if (!g.parts.includes(part)) g.parts.push(part);
  ctx.grouped.set(key, g);
}
const joinDe = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' und ' + a[a.length - 1] : a[0];
function spanWarn(ctx, seg, len, text){
  groupWarn(ctx, 'span|' + text, `${SIDE_NAME[seg.id]} (${r0(len)} mm)`, p => `Die Tablare ${p} ${text}`);
}
function extraWarn(ctx, seg, what){
  groupWarn(ctx, 'extra|' + what, SIDE_NAME[seg.id], p => `Spannweite ${p} ≥ ${ctx.max} mm – ${what} eingeplant.`);
}

// 40er-Leiste aus dem Plattenmaterial; bei ganzen Brettern (nur ablängen, keine Streifen) eine Dachlatte 24 × 48.
function addStrip(ctx, name, L, note, box){
  if (ctx.boards) ctx.add(name, L, 48, 24, ctx.gSolid, `${note}, aus Dachlatte 24 × 48`, 'solid', box, BUY.latte.price);
  else ctx.add(name, L, 40, ctx.t, ctx.gMain, note, 'korpus', box);
}

/* ---------- Stösse (ganze Bretter) ---------- */
// Stoss 45 mm neben einer Stütze: ein Stück liegt auf der Stütze, das andere hängt über die Stossleiste daran.
const JOINT_OFF = 45;
// Stossstellen für ein Tablar a..b: so wenige, möglichst gleich lange Stücke ≤ Lmax; jeder Stoss auf dem nächstgelegenen Kandidaten
// (cands = Stütze + JOINT_OFF), bei dem der Rest noch in die übrigen Stücke passt. added = Stösse ohne Stütze (dort kommt eine dazu).
function shelfJoints(a, b, Lmax, cands){
  const len = b - a;
  if (!(len > Lmax)) return { cuts:[], added:[] };
  const k = Math.ceil(len / Lmax), cuts = [], added = [];
  let prev = a;
  for (let i = 1; i < k; i++) {
    const ideal = a + len * i / k, rest = k - i;
    const ok = cands.filter(u => u > prev && u - prev <= Lmax && b - u <= rest * Lmax);
    if (ok.length) { prev = ok.reduce((x, y) => Math.abs(y - ideal) < Math.abs(x - ideal) ? y : x); cuts.push(prev); }
    else { prev = r0(Math.min(ideal, prev + Lmax)); cuts.push(prev); added.push(prev); }
  }
  return { cuts, added };
}
// Tablar p in Stücke teilen (nur bei ganzen Brettern). supports = Stützen-Mitten entlang u. Legt die Stossleisten an;
// v1 = vorderes Ende der Stossleiste (vor Pfosten und Querlatten zurück).
function splitShelf(ctx, seg, p, supports, v1 = seg.depth - 50){
  const { cuts, added } = shelfJoints(p.a, p.b, ctx.lmax(seg), supports.map(u => u + JOINT_OFF));
  if (!cuts.length) return { pieces:[p], supports:[] };
  const edges = [p.a, ...cuts, p.b];
  const pieces = edges.slice(1).map((b, i) => ({ ...p, a:edges[i], b, ends:[i === 0 ? p.ends[0] : 'joint', i === cuts.length ? p.ends[1] : 'joint'] }));
  for (const u of cuts) {
    ctx.add('Stossleiste', v1 - 30, 48, 24, ctx.gSolid, 'unter dem Tablarstoss, an beide Stücke geschraubt', 'solid',
      ctx.box(seg, { u0:u - 24, u1:u + 24, y0:p.y - 24, y1:p.y, v0:30, v1 }, 'y', 'v', SOLID_FIN, [0, -60, 0]), BUY.latte.price);
    ctx.screw('latte', 4, 'Stossleisten');
  }
  return { pieces, supports: added.map(u => u - JOINT_OFF) };
}
// Alle Tablare eines Segments teilen; gibt die Stücke und alle zusätzlichen Stützen (sortiert, eindeutig) zurück.
function splitShelves(ctx, seg, shelves, supports, v1){
  if (!ctx.boards) return { pieces:shelves, supports:[] };
  const pieces = [], more = [];
  for (const p of shelves) { const s = splitShelf(ctx, seg, p, supports, v1); pieces.push(...s.pieces); more.push(...s.supports); }
  return { pieces, supports:[...new Set(more.map(r0))].sort((x, y) => x - y) };
}

// Grösster Abstand der Auflager einer Querlatte beim Pfostenrahmen: 24 × 48 hochkant aus Fichte trägt die halbe
// Tablarlast über 1200 mm mit ca. L/340 Durchbiegung – unabhängig vom Tablarmaterial (Review TR-E1).
const POST_MAX = 1200;

const SUPPORTS = {
  battens(ctx, seg, shelves){
    const t = ctx.t;
    const split = splitShelves(ctx, seg, shelves, []);
    for (const q of split.pieces) {
      addShelf(ctx, seg, q, 'liegt auf Leisten, von oben verschraubt');
      ctx.screw('oben', 2 * (1 + q.ends.filter(e => e === 'wall').length), 'Tablare von oben in die Leisten, 2 pro Leiste');
    }
    const leiste = ctx.boards ? 24 : t;   // Dicke der Leiste an der Wand
    const jointPosts = new Map();
    for (const q of split.pieces) if (q.ends[1] === 'joint') {
      const u = r0(q.b - JOINT_OFF - 22), cur = jointPosts.get(u) || { h:0, n:0 };
      jointPosts.set(u, { h: Math.max(cur.h, q.y + ctx.t), n: cur.n + 2 });
    }
    for (const [u, { h, n }] of jointPosts) {
      addPost(ctx, seg, u, h, 'Stütze vor dem Tablarstoss, Tablare mit Winkeln verschraubt');
      ctx.buy('angle40', n, 'Tablare an die Stütze beim Stoss');
    }
    for (const p of shelves) {
      addStrip(ctx, 'Leiste', p.b - p.a, 'Wandleiste, alle 40 cm an die Wand',
        ctx.box(seg, { u0:p.a, u1:p.b, y0:p.y - 40, y1:p.y, v0:0, v1:t }, 'v', 'u', ctx.stripFin, [0, -40, 0]));
      ctx.dowel(leiste, Math.max(2, Math.ceil((p.b - p.a) / 400) + 1));
      for (const e of [0, 1]) {
        if (p.ends[e] !== 'wall') continue;
        const u = e === 0 ? p.a - 3 : p.b + 3 - t;
        addStrip(ctx, 'Leiste', seg.depth - 20 - t, 'Endleiste an der Stirnwand',
          ctx.box(seg, { u0:u, u1:u + t, y0:p.y - 40, y1:p.y, v0:t, v1:seg.depth - 20 }, 'u', 'v', ctx.stripFin, [0, -40, 0]));
        ctx.dowel(leiste, 2);
      }
      if (p.ends[0] === 'corner') addCornerBatten(ctx, seg, p);
    }
    freeEndPosts(ctx, seg, shelves);
    // Eckstütze vor der Innenecke: sonst hat die Ecke kein Auflager, die Eckleiste hängt nur am hinteren Tablar.
    if (seg.ends[0] === 'corner') {
      addPost(ctx, seg, seg.u0, Math.max(...shelves.map(p => p.y)) + t, 'Eckstütze vor der Innenecke, beide Tablare mit Winkeln verschraubt');
      ctx.buy('angle40', 2 * shelves.length, 'Tablare an die Eckstütze, 2 pro Ebene');
    }
    // Längstes freies Feld der Vorderkante zwischen Wand, Eckstütze und Stützen (freie Enden, Stösse).
    let longest = 0;
    for (const p of shelves) {
      const pts = [0, 1].map(e => p.ends[e] === 'wall' ? (e ? p.b : p.a) : e ? p.b - 22.5 : p.a + 22.5);
      for (const u of jointPosts.keys()) if (u > p.a && u < p.b) pts.push(u + 22.5);
      if (seg.id === 'back') for (const s of ctx.segs) if (s.ends[0] === 'corner') pts.push(s.id === 'left' ? s.depth + 22.5 : ctx.W - s.depth - 22.5);
      pts.sort((x, y) => x - y);
      for (let i = 1; i < pts.length; i++) longest = Math.max(longest, pts[i] - pts[i - 1]);
    }
    ctx.frei = Math.max(ctx.frei || 0, r0(longest));   // für die Sperre der Bauweise «Leisten»
    if (longest >= ctx.max) spanWarn(ctx, seg, longest, `liegen vorne frei – bei ${ctx.matShort} ${ctx.t} mm biegen sie sich ab ca. ${ctx.max} mm Spannweite durch. Pfostenrahmen, Wandschienen oder dickeres Material wählen.`);
  },

  rails(ctx, seg, shelves){
    const n = pieces(seg.u1 - seg.u0 - 100, ctx.max) + 1;
    let us = spread(seg.u0 + 50, seg.u1 - 50, n).map(r0);
    const split = splitShelves(ctx, seg, shelves, us);
    us = [...new Set([...us, ...split.supports])].sort((x, y) => x - y);
    const list = split.pieces;
    // Konsole endet mindestens 10 mm hinter der Vorderkante des Tablars.
    const front = seg.depth + railsVor(ctx.c), kmax = front - RAIL_T - 10;
    const kl = [...KONSOLE_LENS].reverse().find(l => l <= kmax) || KONSOLE_LENS[0];
    if (kl > kmax) ctx.warn.push(`Die kürzeste Konsole (${kl} mm) steht bei ${seg.depth} mm tiefen Tablaren ${SIDE_NAME[seg.id]} vorne vor – Tablare tiefer machen oder Tablarwinkel wählen.`);
    for (const p of list) addShelf(ctx, seg, p, 'liegt auf Konsolen vor der Schiene, von unten verschraubt', RAIL_V0);
    let konsolen = 0;
    for (const u of us) {
      const on = list.filter(p => u >= p.a + 20 && u <= p.b - 20);
      if (!on.length) continue;
      const y0 = Math.min(...on.map(p => p.y)) - 60, y1 = Math.max(...on.map(p => p.y)) + 40;
      const need = y1 - y0;
      for (const l of railParts(need)) { ctx.buy('rail' + RAIL_LENS.find(x => x >= l), 1, 'senkrecht, auf Länge kürzen'); ctx.dowel(0, Math.ceil(l / 300) + 1); }
      if (need > RAIL_MAX) { ctx.schieneZweiteilig = true; groupWarn(ctx, 'rails2', SIDE_NAME[seg.id], sides => `Die Wandschienen ${sides} brauchen ${r0(need)} mm – längste Schiene ist ${RAIL_MAX} mm, darum je zwei Stücke übereinander, jedes mindestens ${RAIL_STUECK_MIN} mm lang (eingeplant).`); }
      ctx.extras.push({ type:'metal', ...ctx.box(seg, { u0:u - 8, u1:u + 8, y0, y1: y1, v0:0, v1:RAIL_T }, 'v', 'y', null) });
      for (const p of on) {
        ctx.extras.push({ type:'metal', ...ctx.box(seg, { u0:u - 6, u1:u + 6, y0:p.y - 25, y1:p.y, v0:RAIL_T, v1:RAIL_T + kl }, 'u', 'v', null, [0, 0, 120]) });
        konsolen++;
      }
    }
    ctx.buy('konsole' + kl, konsolen, 'eine pro Tablar und Schiene');
    ctx.screw('blech', konsolen * 2, 'Tablare von unten durch die Konsolen');
    for (const p of list) if (p.ends[0] === 'corner') addCornerBatten(ctx, seg, p);
    freeEndPosts(ctx, seg, shelves);
    if (n > 2) extraWarn(ctx, seg, 'zusätzliche Schienen');
  },

  brackets(ctx, seg, shelves){
    const want = seg.depth * 2 / 3;
    const size = winkelFuer(seg.depth), wand = WINKEL_WAND[size];
    const unten = Math.min(...shelves.map(p => p.y));
    if (unten < wand + 10) groupWarn(ctx, 'winkelBoden', SIDE_NAME[seg.id], sides => `Die untersten Tablarwinkel ${sides} reichen in den Boden (Wandschenkel ${wand} mm) – unterstes Tablar mindestens ${wand + 10} mm über dem Boden.`);
    if (size < want) ctx.warn.push(`Für ${seg.depth} mm tiefe Tablare ${SIDE_NAME[seg.id]} sind Tablarwinkel knapp (grösster: ${size} mm). Wandschienen oder Pfostenrahmen tragen tiefe Tablare besser.`);
    let count = 0, extra = false;
    for (const p of shelves) {
      const n = pieces(p.b - p.a - 120, ctx.max) + 1;
      if (n > 2) extra = true;
      const base = spread(p.a + 60, p.b - 60, n).map(r0);
      const split = splitShelves(ctx, seg, [p], base);
      for (const q of split.pieces) addShelf(ctx, seg, q, 'liegt auf Tablarwinkeln');
      for (const u of [...base, ...split.supports]) {
        ctx.extras.push({ type:'metal', ...ctx.box(seg, { u0:u - 10, u1:u + 10, y0:Math.max(0, p.y - wand), y1:p.y, v0:0, v1:4 }, 'v', 'y', null) });
        ctx.extras.push({ type:'metal', ...ctx.box(seg, { u0:u - 10, u1:u + 10, y0:p.y - 4, y1:p.y, v0:4, v1:size }, 'y', 'v', null, [0, 0, 120]) });
        count++;
      }
      if (p.ends[0] === 'corner') addCornerBatten(ctx, seg, p);
    }
    ctx.buy('winkel' + size, count, 'unter die Tablare');
    ctx.dowel(0, count * 2);
    ctx.screw('blech', count * 2, 'Tablare von unten durch die Winkel');
    freeEndPosts(ctx, seg, shelves);
    if (extra) extraWarn(ctx, seg, 'zusätzliche Winkel');
  },

  cheeks(ctx, seg, shelves){
    const t = ctx.t;
    let pos = cheekPositions(seg, t, ctx.max);
    if (seg.id === 'back') {
      // Eckfach: offen ist das erste Fach von der Seitentiefe bis zur zweiten Wange.
      const leer = {};
      for (const s of eckSeiten(ctx)) {
        const offen = s.id === 'left' ? pos[1] - s.depth : (ctx.W - s.depth) - (pos[pos.length - 2] + t);
        leer[s.id] = offen < ECKFACH_MIN;
        eckfachMelden(ctx, s.id, offen, leer[s.id]);
        ctx.screw('kante', 3, 'Eckwange an die hintere Wange');
      }
      // Leeres Eckquadrat: das hintere Regal beginnt mit einer eigenen Wange bündig hinter der Eckwange.
      if (leer.left || leer.right) {
        const dS = id => eckSeiten(ctx).find(s => s.id === id).depth;
        pos = cheekPositions({ ...seg, u0:leer.left ? dS('left') - t : seg.u0, u1:leer.right ? ctx.W - dS('right') + t : seg.u1,
          ends:[leer.left ? 'corner' : 'wall', leer.right ? 'corner' : 'wall'] }, t, ctx.max);
      }
    }
    // Bis 50 mm über das oberste Tablar: so lässt sich die Wange im Raum aufrichten (raumhoch ginge sie nicht).
    const h = Math.min(ctx.H - 10, Math.max(...ctx.levels) + t + 50);
    for (const u of pos) {
      ctx.add('Wange', h, seg.depth, t, ctx.gMain, 'Lochreihen 32er-Raster, oben und unten mit Winkeln an die Wand', 'korpus',
        ctx.box(seg, { u0:u, u1:u + t, y0:0, y1:h, v0:0, v1:seg.depth }, 'u', 'y', ctx.fin, [0, 0, 80]));
    }
    // Kippmass: Eine liegend vorbereitete Wange muss sich im Raum aufrichten lassen.
    const kipp = Math.hypot(h, seg.depth);
    if (kipp > ctx.H - 10) groupWarn(ctx, 'kippWange', SIDE_NAME[seg.id], sides => `Die Wangen ${sides} (${r0(h)} × ${seg.depth} mm) lassen sich im Raum nicht aufrichten – Kippmass ${r0(kipp)} mm bei ${ctx.H} mm Raumhöhe. Deckenabstand vergrössern oder weniger tief.`);
    ctx.buy('angle40', pos.length * 3, 'Wangen an Wand und Boden');
    ctx.dowel(0, pos.length * 3);
    const nicheEdge = seg.niche ? (seg.niche.at === 'end' ? seg.u1 - seg.niche.w : seg.u0 + seg.niche.w) : null;
    let n = 0;
    for (let i = 0; i < pos.length - 1; i++) {
      const a = pos[i] + t, b = pos[i + 1];
      const mid = (a + b) / 2;
      const inNicheZone = nicheEdge != null && (seg.niche.at === 'end' ? mid > nicheEdge : mid < nicheEdge);
      for (const y of ctx.levels) {
        if (inNicheZone && y < seg.niche.h) continue;
        ctx.add('Tablar', b - a - 2, seg.depth - 3, t, ctx.gMain, '2 mm Luft, auf 4 Bodenträgern', 'korpus',
          ctx.box(seg, { u0:a + 1, u1:b - 1, y0:y, y1:y + t, v0:3, v1:seg.depth }, 'y', 'u', ctx.fin, [0, 0, 200]));
        n++;
      }
    }
    ctx.buy('shelfpin', n * 4, '4 pro Tablar');
    if (pos.length - 1 > (nicheEdge != null ? 2 : 1)) extraWarn(ctx, seg, 'Zwischenwangen');
  },

  posts(ctx, seg, shelves){
    const top = Math.max(...ctx.levels) + ctx.t;
    // Die Pfosten stehen vor der Querlatte (addPost), die Tablare bleiben rechteckig. Die Querlatte trägt die Tablare vorne;
    // Auflager hat sie an Wand-Enden (Winkel auf die Endlatte) und an den Pfosten. Pfosten: linke Kante entlang u.
    const edge = seg.niche ? (seg.niche.at === 'end' ? seg.u1 - seg.niche.w : seg.u0 + seg.niche.w) : null;
    const posts = [], pts = [];   // pts = Auflager der Querlatte (Mitten entlang u)
    const addP = (u, kind) => { posts.push({ u:r0(u), kind }); pts.push(u + 22.5); };
    if (seg.ends[0] === 'wall') pts.push(seg.u0); else addP(seg.u0, seg.ends[0]);
    if (seg.ends[1] === 'wall') pts.push(seg.u1); else addP(seg.u1 - 45, seg.ends[1]);
    if (edge != null) addP(seg.niche.at === 'end' ? edge - 45 : edge, 'niche');
    // Hinten: Die Eckpfosten der Seitenregale stehen vor der hinteren Querlatte und tragen sie mit.
    if (seg.id === 'back') for (const s of ctx.segs) if (s.ends[0] === 'corner') pts.push(s.id === 'left' ? s.depth + 22.5 : ctx.W - s.depth - 22.5);
    pts.sort((x, y) => x - y);
    const fields = pts.slice(1).map((q, i) => [pts[i], q]);
    for (const [p, q] of fields) {
      const mid = (p + q) / 2;
      if (edge != null && (seg.niche.at === 'end' ? mid > edge : mid < edge)) {
        // In der Nische steht kein Pfosten.
        if (q - p > POST_MAX) spanWarn(ctx, seg, q - p, `liegen über der Nische auf einer Querlatte ohne Pfosten – ab ca. ${POST_MAX} mm biegt sie sich durch. Nische schmaler machen.`);
        continue;
      }
      const k = Math.ceil((q - p) / POST_MAX) - 1;
      for (let j = 1; j <= k; j++) { const u = p + (q - p) * j / (k + 1) - 22.5; posts.push({ u:r0(u), kind:'mid' }); }
    }
    // Ganze Bretter: Stösse neben einen Pfosten legen. Das Tablar liegt auch am Stoss auf Wand- und Querlatte,
    // ein zusätzlicher Pfosten ist dort nicht nötig. Die Stossleiste endet vor der Querlatte.
    const split = splitShelves(ctx, seg, shelves, pts.filter(u => u > seg.u0 && u < seg.u1), seg.depth - 30);
    for (const q of split.pieces) {
      addShelf(ctx, seg, q, 'liegt auf den Latten, von oben verschraubt');
      ctx.screw('oben', 2 * (2 + q.ends.filter(e => e === 'wall').length), 'Tablare von oben auf die Latten, 2 pro Latte');
    }
    for (const p of shelves) {
      ctx.add('Latte 24 × 48', p.b - p.a, 48, 24, ctx.gSolid, 'Wandlatte, alle 40 cm an die Wand', 'solid',
        ctx.box(seg, { u0:p.a, u1:p.b, y0:p.y - 48, y1:p.y, v0:0, v1:24 }, 'v', 'u', SOLID_FIN, [0, -40, 0]), BUY.latte.price);
      ctx.dowel(24, Math.max(2, Math.ceil((p.b - p.a) / 400) + 1));
      ctx.add('Latte 24 × 48', p.b - p.a, 48, 24, ctx.gSolid, 'Querlatte vorne, trägt die Tablare, an Pfosten und Endlatten befestigt', 'solid',
        ctx.box(seg, { u0:p.a, u1:p.b, y0:p.y - 48, y1:p.y, v0:seg.depth - 24, v1:seg.depth }, 'v', 'u', SOLID_FIN, [0, -40, 60]), BUY.latte.price);
      for (const e of [0, 1]) {
        if (p.ends[e] !== 'wall') continue;
        const u = e === 0 ? p.a - 3 : p.b + 3 - 24;
        ctx.add('Latte 24 × 48', seg.depth - 48, 48, 24, ctx.gSolid, 'Endlatte an der Stirnwand', 'solid',
          ctx.box(seg, { u0:u, u1:u + 24, y0:p.y - 48, y1:p.y, v0:24, v1:seg.depth - 24 }, 'u', 'v', SOLID_FIN, [0, -40, 0]), BUY.latte.price);
        ctx.dowel(24, 2);
      }
      // Ein Winkel je Querlatten-Ende an der Wand und in der Ecke (seitliche an die hintere Querlatte).
      ctx.buy('angle40', p.ends.filter(e => e === 'wall' || e === 'corner').length, 'Querlatten an Endlatten und in der Ecke');
    }
    for (const { u, kind } of posts) addPost(ctx, seg, u, top, kind === 'corner'
      ? 'Eckpfosten vor beiden Querlatten, vom Boden bis zum obersten Tablar'
      : 'Pfosten vor der Querlatte, vom Boden bis zum obersten Tablar');
    // Je Ebene 2 Schrauben durch den Pfosten in die Querlatte, am Eckpfosten eine mehr für die seitliche Querlatte.
    const screws = posts.reduce((a, p) => a + (p.kind === 'corner' ? 3 : 2), 0) * ctx.levels.length;
    ctx.buy('screw5x60', plusTen(screws), 'Querlatten durch die Pfosten, vorbohren');
    if (posts.some(p => p.kind === 'mid')) groupWarn(ctx, 'postsMid', SIDE_NAME[seg.id], sides => `Querlatten ${sides} länger als ${POST_MAX} mm – Zwischenpfosten eingeplant.`);
  }
};
const plusTen = x => Math.ceil(x * 1.1);
// Dübel mit Schraube nach der Dicke des Anbauteils: 4,5 × 50 für Metall und Leisten bis 20 mm, 5 × 60 für Latten 24, 5 × 70 darüber.
const dowelFor = durch => durch <= 20 ? 'dowel6' : durch <= 24 ? 'dowel6x60' : 'dowel6x70';

/* ---------- Selbststehend ---------- */
function freeModules(ctx, seg){
  const t = ctx.t, Bk = ctx.Bk, bt = Bk ? Bk.t : 0;
  let u0 = seg.ends[0] === 'corner' ? seg.u0 + 2 : seg.u0 + 10;
  let u1 = seg.ends[1] === 'free' ? seg.u1 : seg.u1 - 10;
  if (seg.id === 'back' && eckSeiten(ctx).length) {
    // Eckfach: offen ist das hintere Eckmodul von der Seitentiefe bis zu seiner inneren Seite. Zu wenig offen →
    // die hintere Reihe beginnt erst neben dem Seitenregal. Die Modulbreite hängt von beiden Ecken ab, darum bis es stimmt.
    const leer = {};
    for (let i = 0; i < 3; i++) {
      const { w } = moduleSplit(u1 - u0, ctx.max, t);
      for (const s of eckSeiten(ctx)) {
        if (leer[s.id]) continue;
        const offen = s.id === 'left' ? u0 + w - t - s.depth : (ctx.W - s.depth) - (u1 - w + t);
        if (offen < ECKFACH_MIN) { leer[s.id] = offen; if (s.id === 'left') u0 = s.depth + 2; else u1 = ctx.W - s.depth - 2; }
      }
    }
    const { w } = moduleSplit(u1 - u0, ctx.max, t);
    for (const s of eckSeiten(ctx)) {
      const offen = s.id in leer ? leer[s.id] : s.id === 'left' ? u0 + w - t - s.depth : (ctx.W - s.depth) - (u1 - w + t);
      eckfachMelden(ctx, s.id, offen, s.id in leer);
      if (!(s.id in leer)) ctx.screw('kante', 3, 'Seitenmodul an das hintere Eckmodul');
    }
  }
  const v0 = 10, v1 = seg.depth, dep = v1 - v0;
  const zones = [];
  if (seg.niche) {
    const nw = Math.min(seg.niche.w, u1 - u0 - 200);
    if (seg.niche.at === 'end') zones.push([u0, u1 - nw - 2, 0], [u1 - nw, u1, seg.niche.h]);
    else zones.push([u0, u0 + nw, seg.niche.h], [u0 + nw + 2, u1, 0]);
  } else zones.push([u0, u1, 0]);
  let imSegment = 0;
  for (const [a, b, minY] of zones) {
    const { m, w } = moduleSplit(b - a, ctx.max, t);
    for (let k = 0; k < m; k++) {
      const ma = a + k * (w + 2), mb = ma + w;
      const lv = ctx.levels.filter(y => y >= minY);
      if (!lv.length) { ctx.warn.push(`Über der Nische ${SIDE_NAME[seg.id]} hat es kein Tablar mehr – Modul weggelassen.`); continue; }
      const top = Math.max(...lv) + t;
      // Die Rückwand ist hinten auf die Seiten geschraubt: Seiten um ihre Stärke weniger tief (wie beim Sideboard).
      for (const side of [ma, mb - t]) {
        ctx.add('Seite', top, dep - bt, t, ctx.gMain, 'Lochreihe innen, steht auf dem Boden', 'korpus',
          ctx.box(seg, { u0:side, u1:side + t, y0:0, y1:top, v0:v0 + bt, v1 }, 'u', 'y', ctx.fin, [side === ma ? -60 : 60, 0, 0]));
      }
      const iw = w - 2*t;
      lv.forEach((y, i) => {
        const fixed = i === 0 || i === lv.length - 1;
        const name = i === lv.length - 1 ? 'Deckel' : i === 0 ? 'Boden' : 'Einlegeboden';
        const L = fixed ? iw : iw - 2;
        ctx.add(name, L, dep - bt, t, ctx.gMain, fixed ? 'zwischen den Seiten' : '2 mm Luft, auf 4 Bodenträgern', 'korpus',
          ctx.box(seg, { u0:ma + t + (fixed ? 0 : 1), u1:ma + t + (fixed ? 0 : 1) + L, y0:y, y1:y + t, v0:v0 + bt, v1 }, 'y', 'u', ctx.fin, [0, fixed ? 0 : 0, fixed ? 0 : 200]));
        if (fixed) ctx.lens.push(dep - bt, dep - bt); else ctx.pins += 4;
      });
      if (Bk) {
        ctx.add('Rückwand', w - 2, top - 2, Bk.t, ctx.gBack, 'hinten aufgeschraubt, 1 mm rundum zurück', 'back',
          ctx.box(seg, { u0:ma + 1, u1:mb - 1, y0:1, y1:top - 1, v0, v1:v0 + bt }, 'v', 'u', ctx.backFin, [0, 0, -120]));
        ctx.backScrews += Math.ceil(2 * (w + top) / 150);
      } else ctx.buy('angle40', 4, 'ohne Rückwand: hinten in die Ecken');
      ctx.modules++; imSegment++;
      if (top > 1200) { ctx.tall++; ctx.dowel(0, 2); }
      // Fertig durch die Tür (aufrecht, schmale Seite voran) und im Raum aufrichtbar?
      if (Math.min(w, dep) > ctx.c.doorW - 20 || top > ctx.c.doorH - 20) ctx.zuGross = true;
      if (Math.hypot(top, dep) > ctx.H - 10) ctx.kipp = Math.max(ctx.kipp || 0, r0(Math.hypot(top, dep)));
    }
  }
  // Nebeneinanderstehende Module: 3 Schrauben pro Stoss, Seite an Seite (Review DY-23).
  if (imSegment > 1) ctx.screw('streifen', 3 * (imSegment - 1), 'Module untereinander verbinden, 3 pro Stoss');
}

/* ---------- Berechnung ---------- */
function computeReduit(c0){
  const { cfg:c, warn } = normReduit(c0);
  const lay = layoutReduit(c);
  warn.push(...lay.warn);
  const W = c.rw, D = c.rd, H = c.rh;
  const M = MATS[c.mat] || MATS.birke, t = c.t;
  const BM = M.boards ? M : null;
  const free = c.build === 'free';
  const Bk = free ? BACKS[c.back] : null, bt = Bk ? Bk.t : 0;
  const levels = shelfLevels(c.nShelves, c.gapBottom, c.gapTop, H);
  const max = maxSpan(c.mat, t);
  const fin = { color: c.mat === 'mdf' ? COLORS.weiss : M.color, ply:M.ply, grain:M.grain, plyColor:M.color };
  const backFin = Bk ? { color:Bk.color, ply:Bk.ply, grain:false, plyColor:Bk.color } : null;
  const gMain = `${M.name} ${t} mm`, gBack = Bk ? `${Bk.name} ${Bk.t} mm` : null, gSolid = 'Massivholz Fichte';

  const raw = [], boxes = [], extras = [], buys = new Map();
  const ctx = {
    c, W, D, H, t, max, levels, fin, backFin, Bk, gMain, gBack, gSolid, matShort:M.name, warn, extras, segs:lay.segs,
    boards:!!BM, bm:BM, stripFin: BM ? SOLID_FIN : fin,
    lmax(seg){
      if (!BM) return Infinity;
      const B = boardWidthFor(BM.widths, seg.depth - 3);
      return B == null ? Infinity : Math.max(...BM.boards.filter(f => f.B === B).map(f => f.L));
    },
    fix:0, fixBy:new Map(), eck:{}, lens:[], pins:0, backScrews:0, modules:0, tall:0, grouped:new Map(),
    // Wanddübel; durch = Dicke des Anbauteils (0 für Metall)
    dowel(durch, n){ const k = dowelFor(durch); ctx.fix += n; ctx.fixBy.set(k, (ctx.fixBy.get(k) || 0) + n); },
    screw(anbau, qty, note){ ctx.buy(screwKey(screwFor(anbau, t)), qty, note); },
    add(name, L, B, th, group, note, kind, box, pm){
      if (BM && kind === 'korpus') { const w = boardWidthFor(BM.widths, B); if (w != null) B = w; }   // ganzes Brett: Teilbreite = Brettbreite
      const key = [name, r0(L), r0(B), th, group, note].join('|');
      raw.push({ key, name, L:r0(L), B:r0(B), t:th, group, note, kind, pm });
      if (box) { box.key = key; boxes.push(box); }
    },
    box: (seg, b, thin, grain, f, ex) => boxOf(seg, W, D, b, thin, grain, f, ex),
    buy(key, qty, note){
      if (!qty) return;
      const cur = buys.get(key);
      if (!cur) buys.set(key, { qty, notes:[note] });
      else { cur.qty += qty; if (!cur.notes.includes(note)) cur.notes.push(note); }
    }
  };

  for (const seg of lay.segs) {
    if (free) freeModules(ctx, seg);
    else SUPPORTS[c.sys](ctx, seg, shelfPieces(seg, levels));
  }
  for (const g of ctx.grouped.values()) warn.push(g.text(joinDe(g.parts)));
  if (lay.puffer) ctx.buy('doorstop', 1, 'Tür nach innen: hält die Klinke vom Regal fern');

  // Aggregieren
  const rowsMap = new Map();
  for (const p of raw) {
    const r = rowsMap.get(p.key);
    if (r) r.qty++; else rowsMap.set(p.key, { ...p, qty:1 });
  }
  const order = { korpus:0, back:1, solid:2 };
  const rows = [...rowsMap.values()].sort((a, b) => order[a.kind] - order[b.kind]);
  rows.forEach((r, i) => { r.pos = posLabel(i); });

  // Zuschnitt packen (Massivholz nicht)
  const groups = [], mainItems = [], backItems = [];
  for (const r of rows) for (let q = 0; q < r.qty; q++) { if (r.kind === 'back') backItems.push(r); else if (r.kind !== 'solid') mainItems.push(r); }
  const sheetL = clamp(c.sheetL, 500, 3100), sheetB = clamp(c.sheetB, 300, 3100), kerf = clamp(c.kerf, 0, 8);
  const rotate = !(c.grain && M.grain);
  if (BM) {
    const r = packBoards(mainItems, BM.boards, kerf);
    groups.push({ label: gMain, boards:true, sheet: BM.sheet, price:null, rotate:false, ...r });
    for (const u of r.unplaced) {
      const B = boardWidthFor(BM.widths, u.B);
      if (B == null) { warn.push(`Teil ${u.pos} (${u.name}, ${u.L} × ${u.B} mm) passt auf kein Brett – Breiten: ${BM.widths.join(', ')} mm.`); continue; }
      const Lmax = Math.max(...BM.boards.filter(f => f.B === B).map(f => f.L));
      const alt = Object.values(MATS).filter(X => X.boards && X !== BM && X.boards.some(f => f.B >= u.B && f.B <= u.B + BOARD_SLACK && f.L >= u.L)).map(X => X.name);
      warn.push(`Teil ${u.pos} (${u.name}, ${u.L} mm) ist länger als das längste Brett (${Lmax} mm) – ${alt.length ? `ein Brett-Material mit längeren Brettern (${joinDe(alt)}) oder ` : ''}ein Plattenmaterial wählen.`);
    }
  } else {
    groups.push({ label: gMain, sheet:[sheetL, sheetB], price: clamp(c.price, 0, 500), rotate, ...pack(mainItems, sheetL, sheetB, kerf, 10, rotate) });
  }
  if (Bk && backItems.length) groups.push({ label: gBack, sheet: Bk.sheet, price: Bk.price, rotate: true, ...pack(backItems, Bk.sheet[0], Bk.sheet[1], kerf, 10, true) });
  for (const g of groups) if (!g.boards) for (const u of g.unplaced) warn.push(`Teil ${u.pos} (${u.name}, ${u.L} × ${u.B} mm) passt nicht auf die Platte ${g.sheet[0]} × ${g.sheet[1]} mm. Grösseres Plattenformat eintragen${g.rotate ? '' : ' oder Maserung freigeben'}.`);

  // Beschläge
  const hw = [];
  if (free && ctx.kipp) warn.push(`Die Module lassen sich liegend zusammengebaut nicht aufrichten – Kippmass ${ctx.kipp} mm bei ${H} mm Raumhöhe. Aufrecht am Platz zusammenbauen oder den Deckenabstand vergrössern.`);
  if (free) {
    hw.push(...jointHardware(c, ctx.lens, t, false, 'für Böden und Deckel'));
    if (ctx.pins) ctx.buy('shelfpin', ctx.pins, '4 pro Einlegeboden');
    if (ctx.tall) ctx.buy('tipguard', Math.ceil(ctx.tall / 2), 'ein Gurt pro Modul, oben an die Wand');
    if (Bk) hw.push([ctx.backScrews, 'Senkkopfschrauben 3 × 16 mm', 'Rückwände, alle 15 cm']);
    else warn.push('Ohne Rückwand verziehen sich die Module leicht. Metallwinkel hinten in die Ecken sind eingeplant – eine Rückwand ist stabiler.');
  }
  const drywall = c.wall === 'drywall';
  if (drywall && ctx.fix) ctx.buy('hollow', plusTen(ctx.fix), 'für Gipskarton, wenn möglich in die Ständer');
  else for (const [k, n] of ctx.fixBy) ctx.buy(k, plusTen(n), 'für Beton oder Backstein, +10 % Reserve');
  for (const [key, { qty, notes }] of buys) { const note = notes.join('; '); hw.push([qty, BUY[key].name, BUY[key].est ? `${note} · Preis geschätzt` : note, BUY[key].price]); }
  if (drywall && ctx.fix) warn.push('Gipskarton trägt wenig: Leisten, Schienen und Winkel wenn möglich in die Ständer schrauben (meist alle 60 cm) und Hohlraumdübel verwenden. Für schwere Lasten besser selbststehend bauen.');

  const buyCost = hw.reduce((a, h) => a + (h[3] ? h[0] * h[3] : 0), 0);
  // Ganze Bretter als erste Zeilen der Einkaufsliste (Kosten laufen über «Holz», nicht über Kaufteile).
  if (BM) {
    const per = new Map();
    for (const s of groups[0].sheets) { const k = `${s.L}×${s.B}`; const e = per.get(k) || { n:0, s }; e.n++; per.set(k, e); }
    hw.unshift(...[...per.values()].map(({ n, s }) => [n, `${BM.name} ${s.L} × ${s.B} × ${t} mm`, BM.est ? 'ganzes Brett, selbst ablängen · Preis geschätzt' : 'ganzes Brett, selbst ablängen', s.price]));
  }
  const solidCost = rows.filter(r => r.kind === 'solid').reduce((a, r) => a + r.qty * r.L / 1000 * (r.pm || 0), 0);

  // Oberfläche
  const plateArea = rows.filter(r => r.kind !== 'solid').reduce((a, r) => a + r.qty * r.L * r.B / 1e6, 0) * 2;
  const finish = [];
  if (c.mat === 'mdf') {
    finish.push([`${Math.max(1, Math.ceil(plateArea / 10 * 10))} dl`, 'Grundierung für MDF (Kanten 2×)', `${plateArea.toFixed(1)} m²`]);
    finish.push([`${Math.max(1, Math.ceil(plateArea * 2 / 10 * 10))} dl`, 'Möbellack seidenmatt, Weiss', '2 Schichten, Zwischenschliff Körnung 240']);
  } else if (M.coated) finish.push(['–', 'Flächen sind fertig beschichtet', c.mat === 'dekorspan' ? 'sichtbare Kanten mit Kantenband bügeln' : 'Schnittkanten mit Lack oder Öl schützen']);
  else finish.push([`${Math.max(1, Math.ceil(plateArea * 2 / 22 * 10))} dl`, 'Hartwachsöl, farblos oder weiss pigmentiert', `${plateArea.toFixed(1)} m² beidseitig, 2 Anstriche`]);
  if (rows.some(r => r.kind === 'solid')) finish.push(['–', 'Kanthölzer und Latten roh lassen oder mitölen', 'im Reduit reicht roh']);
  finish.push(['1', 'Schleifpapier Körnung 120, 180', 'Kanten leicht brechen']);

  // Werkzeug
  const tools = new Set(['Akkuschrauber mit Bit-Set', 'Doppelmeter und Bleistift', 'Wasserwaage (mind. 60 cm)']);
  if (BM) tools.add('Kappsäge oder Handkreissäge mit Führungsschiene zum Ablängen');
  if (!free || ctx.fix) {
    tools.add(drywall ? 'Bohrmaschine, Bohrer passend zu den Hohlraumdübeln' : 'Schlagbohrmaschine mit Steinbohrer Ø 6 mm');
    tools.add('Leitungssucher (Strom und Wasser in der Wand)');
  }
  if (free) { tools.add('Schraubzwingen (mind. 4)'); tools.add('Anschlagwinkel'); jointTools(c, t, tools); }
  if (free ? ctx.pins : c.sys === 'cheeks') tools.add('Lochreihen-Bohrschablone (32-mm-Raster) + Bohrer Ø 5 mm');
  if (!free && c.sys === 'rails') tools.add('Eisensäge zum Kürzen der Schienen');
  if (rows.some(r => r.kind === 'solid')) tools.add('Handsäge oder Kappsäge für Kanthölzer und Latten');
  tools.add('Schwingschleifer oder Schleifklotz');
  tools.add(c.mat === 'mdf' ? 'Schaumstoffrolle und Lackpinsel' : c.mat === 'dekorspan' ? 'Bügeleisen und Cutter für Kantenband' : M.coated ? 'Pinsel für die Kanten' : 'Baumwolllappen oder Pinsel für Öl');

  const steps = buildReduitSteps({ zuGross:!!ctx.zuGross, eck:ctx.eck, schieneZweiteilig:!!ctx.schieneZweiteilig, boards: !!BM, hasJoints: rows.some(r => r.name === 'Stossleiste'), c, free, Bk, levels, drywall, segs: lay.segs, hasSolid: rows.some(r => r.kind === 'solid'), hasCorner: rows.some(r => r.name === 'Eckleiste'),
    pins: ctx.pins, stuetzen: { frei: rows.some(r => r.note.includes('freien Ende')), stoss: rows.some(r => r.note.includes('Tablarstoss')), ecke: rows.some(r => r.note.startsWith('Eckstütze')) } });

  // Raumwände und Nischen für die 3D-Ansicht
  const WT = 100, doorH = c.doorH, { left:wfL, right:wfR } = lay.wand;
  extras.push({ type:'wall', size:[W + 2*WT, H, WT], pos:[0, H/2, -D/2 - WT/2] });
  extras.push({ type:'wall', size:[WT, H, D], pos:[-W/2 - WT/2, H/2, 0] });
  extras.push({ type:'wall', size:[WT, H, D], pos:[W/2 + WT/2, H/2, 0] });
  extras.push({ type:'wall', front:true, size:[wfL + WT, H, WT], pos:[-W/2 - WT + (wfL + WT)/2, H/2, D/2 + WT/2] });
  extras.push({ type:'wall', front:true, size:[wfR + WT, H, WT], pos:[W/2 + WT - (wfR + WT)/2, H/2, D/2 + WT/2] });
  if (H - doorH > 1) extras.push({ type:'wall', front:true, size:[c.doorW, H - doorH, WT], pos:[-W/2 + lay.x0 + c.doorW/2, doorH + (H - doorH)/2, D/2 + WT/2] });
  for (const s of lay.segs) {
    if (!s.niche) continue;
    const a = s.niche.at === 'end' ? s.u1 - s.niche.w : s.u0;
    extras.push({ type:'niche', ...boxOf(s, W, D, { u0:a + 5, u1:a + s.niche.w - 5, y0:0, y1:s.niche.h - 5, v0:5, v1:s.depth - 5 }, 'y', 'u', null) });
  }

  const level = free ? JOINTS[c.joint].level : SYS[c.sys].level;
  return {
    kind:'reduit', W, H, D, Dtot:D, t, M, Bk, rows, boxes, doors:[], slides:[], extras, groups, hw, finish,
    tools:[...tools], steps, warn:[...new Set(warn)], carcFin:fin, frontFin:fin, level, joint:c.joint, matShort:M.name,
    buyCost, solidCost, room:{ W, D, H, doorW:c.doorW, doorH, doorX0:lay.x0 }, frei:ctx.frei || 0, build:c.build, sys:c.sys, shape:c.shape, modules:ctx.modules, max
  };
}

/* ---------- Bauablauf ---------- */
function buildReduitSteps(o){
  const { c, free, Bk, drywall, hasSolid, hasCorner, hasJoints, stuetzen } = o;
  const sc = anbau => screwText(screwFor(anbau, c.t));
  const st = [];
  st.push(['Raum ausmessen und Wände prüfen', `Breite und Tiefe auf drei Höhen messen – alte Wände sind selten gerade, rechne mit dem kleinsten Mass. Mit dem Leitungssucher Strom- und Wasserleitungen markieren.${drywall ? ' Bei Gipskarton die Ständer suchen (meist alle 60 cm) und anzeichnen.' : ''}`, 'Ein Foto mit Doppelmeter an jeder Wand hilft später beim Zuschnitt.']);
  if (o.boards) st.push(['Bretter einkaufen und ablängen', `Die ganzen Bretter stehen in der Einkaufsliste (Beschläge & Kaufteile). Zuhause mit Kapp- oder Handkreissäge auf die Längen der Materialliste ablängen – die Breite bleibt, wie sie ist.${hasSolid ? ' Kanthölzer und Latten ebenso auf Länge sägen.' : ''}`, 'Zuerst die längsten Teile anzeichnen, dann die kurzen aus den Resten.']);
  else st.push(['Zuschnitt organisieren', `Kopier die Materialliste und lass die Platten im Baumarkt zuschneiden.${hasSolid ? ' Kanthölzer und Latten gibt es in Standardlängen – selbst mit der Säge ablängen.' : ''}`, 'Frag nach dem Zuschnitt, ob die Teile beschriftet werden können.']);
  st.push(['Teile beschriften und schleifen', 'Positionsbuchstabe auf die Unterseite, Kanten mit Körnung 120 und 180 schleifen und leicht brechen.', null]);
  // Oberfläche vor der Montage: danach kommt man an Rück- und Unterseiten nicht mehr heran (Review DY-18, RM-19).
  if (MATS[c.mat] && MATS[c.mat].coated) st.push(['Kanten schützen – vor der Montage', c.mat === 'dekorspan' ? 'Sichtbare Kanten mit Kantenband bügeln, Überstand mit dem Cutter abnehmen.' : 'Schnittkanten mit Lack oder Öl streichen, damit sie keine Feuchtigkeit ziehen.', null]);
  else st.push([c.mat === 'mdf' ? 'Lackieren – vor der Montage' : 'Oberfläche ölen – vor der Montage', `${c.mat === 'mdf' ? 'Kanten zweimal grundieren, zwischenschleifen, zweimal lackieren.' : 'Hartwachsöl dünn auftragen, nach 15 Minuten Überschuss abnehmen, nach dem Trocknen ein zweites Mal.'} Leim- und Verbindungsflächen frei lassen.`, 'Über Nacht trocknen lassen, bevor montiert wird.']);
  if (free) {
    // Lochreihen und Verbindung vor dem Zusammenbau bohren (Review DY-5, MX-12, MX-E3).
    if (o.pins) st.push(['Lochreihen bohren', `Mit der Lochreihen-Schablone Löcher Ø 5 mm in die Innenseiten der Modulseiten bohren, je ca. 40 mm von vorne und hinten, ${Math.min(10, c.t - 5)} mm tief. Die Schablone immer an der Unterkante anlegen – nebeneinanderstehende Seiten spiegelbildlich bohren.`, 'Tiefenstopp auf dem Bohrer setzen – ein Stück Klebeband tut es auch.']);
    st.push(...jointSteps(c, c.t, { between:'Boden und Deckel' }));
    const glue = c.joint === 'dowels' ? ' Dübel und Kontaktflächen dünn mit Leim bestreichen, zusammenschieben und mit 2 Korpuszwingen (Modulbreite + 100 mm) pressen.' : '';
    st.push(['Module bauen', `Pro Modul Boden und Deckel zwischen die Seiten setzen und mit der gewählten Verbindung (${JOINTS[c.joint].name}) verbinden. Zuerst trocken zusammenstecken, jede Ecke mit dem Winkel prüfen.${glue}${o.zuGross ? ` Fertig passen die Module nicht durch die Tür (${c.doorW} × ${c.doorH} mm) – darum im Reduit zusammenbauen.` : ''}`, 'Zu zweit geht es deutlich einfacher.']);
    if (Bk) st.push(['Rückwände montieren', 'Diagonalen messen, bis sie gleich lang sind, dann die Rückwand rundum 1 mm zurück alle 15 cm verschrauben.', null]);
    else st.push(['Module aussteifen', 'Diagonalen messen, bis sie gleich lang sind, dann hinten Metallwinkel in alle vier Ecken schrauben.', null]);
    // Hohe Module kippen leicht: jedes sofort sichern, nicht erst am Schluss (Review RM-17).
    const hoch = c.rh - c.gapTop > 1200;
    st.push(['Module stellen', `Zuerst die hinteren Module stellen und ausrichten, dann die seitlichen davor.${hoch ? ` Jedes Modul sofort nach dem Aufstellen oben mit dem Kippschutz an die Wand schrauben${drywall ? ' (bei Gipskarton in einen Ständer oder mit Hohlraumdübeln)' : ''}, erst dann das nächste stellen.` : ''} Nebeneinanderstehende Module mit 3 Schrauben ${sc('streifen')} pro Stoss verbinden.`, 'Bei unebenem Boden Unterlegkeile oder Stellfüsse verwenden.']);
    if (o.eck.fach) st.push(['Eckfach zuerst einrichten', `Hinten ${joinDe(o.eck.fach)}: Das hintere Eckmodul stellen, sofort oben sichern und seine Einlegeböden einlegen – erst dann das Seitenmodul davor stellen, danach kommt man kaum noch hinein. Das Seitenmodul mit 3 Schrauben ${sc('kante')} von innen durch seine Stirnseite in die Vorderkante der hinteren Modulseite schrauben (oben, Mitte, unten, vorbohren Ø 2,5 mm).`, null]);
    if (o.eck.leer) st.push(['Ecke leer lassen', `Hinten ${joinDe(o.eck.leer)} bleibt das Eckquadrat hinter dem Seitenmodul leer – dort käme man nicht an die Böden.`, null]);
    st.push(['Einlegeböden einlegen', 'Bodenträger in die gewünschte Höhe stecken und die Einlegeböden auflegen.', null]);
    return st;
  }
  const ank = drywall ? 'Hohlraumdübel' : 'Dübel 6 mm';
  const corner = o.segs.some(s => s.ends[0] === 'corner');
  // Waagrecht statt parallel zum Boden: Höhen von einem Meterriss aus messen (Review RM-17).
  st.push(['Tablarhöhen anzeichnen', `Die höchste Stelle des Bodens suchen und von dort einen waagrechten Meterriss rundum anzeichnen, mit Laser oder Schlauchwaage. Die Unterkanten der Tablare liegen ${o.levels.join(', ')} mm über dieser Stelle – alle Höhen vom Meterriss aus messen.`, 'Ein Laser spart hier viel Zeit.']);
  if (c.sys === 'battens') st.push(['Leisten montieren', `Wandleisten und Endleisten auf die Linien halten, alle 40 cm vorbohren und mit ${ank} befestigen. Die Oberkante der Leiste ist die Unterkante des Tablars.`, 'Erst die Enden befestigen, dann mit der Wasserwaage die Mitte ausrichten.']);
  if (c.sys === 'rails') st.push(['Wandschienen montieren', `Schienen auf Länge kürzen, senkrecht (Wasserwaage!) an den markierten Positionen mit ${ank} befestigen. Konsolen auf den Tablarhöhen einhängen.${o.schieneZweiteilig ? ` Zweiteilige Schienen nur am freien Ende kürzen (unten beim unteren, oben beim oberen Stück) und am Stoss bündig aufeinanderstellen, damit das Lochraster durchläuft; jedes Stück mindestens ${RAIL_STUECK_MIN} mm.` : ''}`, 'Die erste Schiene genau lotrecht setzen, die weiteren mit Wasserwaage und Latte auf gleiche Höhe bringen.']);
  if (c.sys === 'brackets') st.push(['Tablarwinkel montieren', `Winkel auf den Linien ausrichten und mit je 2 ${ank} an der Wand befestigen.`, null]);
  if (c.sys === 'cheeks') {
    const eck = o.eck.fach || o.eck.leer;
    st.push(['Lochreihen bohren, Wangen stellen', `Mit der Lochreihen-Schablone Löcher Ø 5 mm in die Wangen bohren (10 mm tief). Wangen senkrecht stellen – bei unebenem Boden unterlegen, bis die Lochreihen mit der Wasserwaage auf gleicher Höhe liegen – und mit je 3 Winkeln an Wand und Boden befestigen (${ank})${eck ? '. Die Eckwangen der Seitenregale erst im nächsten Schritt' : ''}.`, 'Zwischenwangen bohren beidseitig – dort nur 8 mm tief und um 16 mm versetzt.']);
    if (o.eck.fach) st.push(['Eckfach zuerst einrichten', `Hinten ${joinDe(o.eck.fach)}: Bodenträger und Tablare ins hintere Eckfach einsetzen, solange die Eckwange noch nicht steht. Dann die Eckwange stellen und mit 3 Schrauben ${sc('kante')} durch die Eckwange in die Vorderkante der hinteren Wange schrauben (oben, Mitte, unten, vorbohren Ø 2,5 mm).`, null]);
    if (o.eck.leer) st.push(['Ecke schliessen', `Hinten ${joinDe(o.eck.leer)} bleibt das Eckquadrat leer: Die Eckwange vor die hintere Wange stellen und mit 3 Schrauben ${sc('kante')} durch die Eckwange in deren Vorderkante schrauben (vorbohren Ø 2,5 mm).`, null]);
  }
  if (c.sys === 'posts') st.push(['Latten montieren', `Wandlatten und Endlatten auf die Linien schrauben (${ank}, alle 40 cm). Die vorderen Querlatten an den Wänden mit je einem Winkel auf die Endlatte schrauben${corner ? ', in der Ecke die seitliche Querlatte mit einem Winkel an die hintere' : ''}.`, 'Bis die Pfosten stehen, lange Querlatten in der Mitte mit einem Reststück abstützen.']);
  // Vormontage an der Werkbank, damit Eck- und Stossleisten beim Auflegen schon sitzen (Review EP-10, DY-22).
  if (hasCorner) st.push(['Eckleisten vormontieren', `An der Werkbank unter das Stirnende jedes Seitentablars eine Eckleiste schrauben (2 Schrauben ${sc(o.boards ? 'latte' : 'streifen')}), so dass sie rund 20 mm vorsteht – beim Auflegen greift sie unter das hintere Tablar.`, null]);
  if (hasJoints) st.push(['Stossleisten vormontieren', `Wo ein Tablar aus zwei Brettern besteht: an der Werkbank die Stossleiste unter das Ende des einen Stücks schrauben (2 Schrauben ${sc('latte')}), so dass sie zur Hälfte vorsteht.`, null]);
  if (c.sys === 'posts') {
    // Reihenfolge: Tablare einschieben, dann erst die Pfosten davor – sonst kommen die Tablare nicht mehr hinein.
    st.push(['Tablare einschieben', `Die Tablare auf ihrer Höhe von vorne auf Wand- und Querlatte schieben${corner ? ', zuerst die hinteren, dann die seitlichen' : ''}${hasJoints ? '; das zweite Stück bündig an den Stoss legen und von unten durch die Stossleiste festschrauben' : ''}. Die Pfosten kommen erst danach.`, null]);
    st.push(['Pfosten stellen', `Pfosten auf Länge sägen, vor die Querlatten stellen und lotrecht ausrichten. Jede Querlatte mit 2 Schrauben 5 × 60 von vorne durch den Pfosten anschrauben, vorbohren mit Ø 3 mm.${corner ? ' Am Eckpfosten die seitliche Querlatte mit einer Schraube von der Gangseite befestigen, 24 mm unter dem Tablar – so treffen sich die Schrauben im Pfosten nicht.' : ''}`, 'Einen Kunststoffgleiter unter jeden Pfosten legen, nicht in den Boden dübeln.']);
    st.push(['Tablare verschrauben', `Jedes Tablar von oben mit 2 Senkkopfschrauben ${sc('oben')} pro Latte an Wand-, End- und Querlatte schrauben, vorbohren. Erst dann belasten.`, 'Verschraubt wird das Tablar zur Scheibe und hält den Rahmen an der Wand.']);
    return st;
  }
  const befestigen = {
    battens: `von oben mit 2 Senkkopfschrauben ${sc('oben')} pro Leiste festschrauben, vorbohren`,
    rails: `von unten durch jede Konsole mit 2 Schrauben ${sc('blech')} festschrauben – länger nicht, sonst kommt die Spitze oben heraus`,
    brackets: `von unten durch jeden Winkel mit 2 Schrauben ${sc('blech')} festschrauben – länger nicht, sonst kommt die Spitze oben heraus`
  }[c.sys];
  if (c.sys === 'cheeks') st.push(['Tablare auflegen', 'Bodenträger stecken und die Tablare auflegen.', null]);
  else st.push(['Tablare auflegen', `Tablare auflegen${corner ? ', zuerst die hinteren, dann die seitlichen' : ''} und ${befestigen}.${hasCorner ? ` An der Ecke das Seitentablar mit 2 Schrauben ${sc(o.boards ? 'latte' : 'streifen')} von unten durch die Eckleiste ins hintere Tablar schrauben.` : ''}${hasJoints ? ` Am Stoss das zweite Stück bündig anlegen und von unten durch die Stossleiste festschrauben.` : ''}`, null]);
  // Alle Kanthölzer vor den Tablaren in einem Schritt: freie Enden, Stösse, Innenecken (Review DY-22).
  const wo = [stuetzen.frei && 'an den freien Enden', stuetzen.stoss && 'unter den Tablarstössen', stuetzen.ecke && 'an den Innenecken'].filter(Boolean);
  if (wo.length) st.push(['Stützen stellen', `Kanthölzer vor die Tablare stellen – ${joinDe(wo)} –, lotrecht ausrichten und jedes Tablar mit einem Winkel daran schrauben${stuetzen.ecke ? ' (an den Innenecken je Ebene 2 Winkel)' : ''}.`, 'Einen Kunststoffgleiter unter jede Stütze legen, nicht in den Boden dübeln.']);
  return st;
}

if (typeof module !== 'undefined') module.exports = {
  REDUIT_DEFAULTS, normReduit, shelfLevels, layoutReduit, toWorld, boxOf,
  BUY, SYS, cheekPositions, moduleSplit, computeReduit, shelfJoints,
  RAIL_T, RAIL_V0, RAIL_MAX, WINKEL_WAND, winkelFuer, railsVor, railParts
};
