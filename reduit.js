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

/* ---------- Statik & Kaufteile ---------- */
// Maximale freie Spannweite (mm) eines belasteten Tablars (ca. 30–40 kg/m, Durchbiegung ≤ ca. 1/200).
// Daumenregel; MDF kriecht unter Dauerlast und liegt deshalb tiefer.
const SPAN = {
  birke:     { 15:650, 18:800, 21:950 },
  eiche:     { 18:700, 20:800, 26:1000 },
  fichte:    { 18:600, 28:950 },
  seekiefer: { 15:550 },
  fichtesp:  { 18:700 },
  mdf:       { 16:450, 19:550, 22:650 }
};
function maxSpan(mat, t){ return (SPAN[mat] && SPAN[mat][t]) || 700; }

// Richtpreise in CHF (Stück bzw. pro Laufmeter bei unit 'm'), Jumbo (jumbo.ch), recherchiert 25.09.2026.
// est:true = Jumbo führt das Produkt, der Preis war aber nicht abrufbar (Bot-Schutz) – Schätzung, im Laden prüfen.
const BUY = {
  kant45:     { name:'Kantholz Fichte 45 × 45 mm', unit:'m', price:4.4 },        // Jumbo: Oecoplan Latte gehobelt 45x45 mm 2.5 m, CHF 10.95
  latte:      { name:'Dachlatte Fichte 24 × 48 mm', unit:'m', price:1.2 },       // Jumbo: Oecoplan Latte roh 24x48 mm 2 m, CHF 2.40
  rail1000:   { name:'Wandschiene Element System, 100 cm', price:12, est:true }, // Jumbo: Element-System Wandschiene Weiss 100 cm (2er-Pack)
  rail1500:   { name:'Wandschiene Element System, 150 cm', price:17, est:true }, // Jumbo: Element-System Wandschiene Weiss 150 cm (2er-Pack)
  rail2000:   { name:'Wandschiene Element System, 200 cm', price:22, est:true }, // Jumbo: Element System Wandschiene Weiss 200 cm (2er-Pack)
  konsole250: { name:'Konsole Element System, 25 cm', price:7, est:true },       // Jumbo: Element-System Konsole Weiss 25 cm
  konsole300: { name:'Konsole Element System, 30 cm', price:8, est:true },       // Jumbo: Konsole 30 cm weiss
  konsole350: { name:'Konsole Element System, 35 cm', price:9, est:true },       // Jumbo: Konsole 35 cm weiss
  konsole400: { name:'Konsole Element System, 40 cm', price:10, est:true },      // Jumbo: Element System Konsole Weiss 40 cm
  konsole470: { name:'U-Träger Element System, 47 cm', price:13, est:true },     // Jumbo: Element System U-Träger zu Wandschiene 47 cm
  winkel150:  { name:'Blechkonsole weiss 150 × 200 mm', price:3.5, est:true },   // Jumbo: Blechkonsole weiss 150 x 200 mm RAL 9016
  winkel200:  { name:'Blechkonsole weiss 200 × 250 mm', price:4.5, est:true },   // Jumbo: Blechkonsole weiss 200 x 250 mm RAL 9016
  winkel250:  { name:'Blechkonsole weiss 250 × 300 mm', price:5.5, est:true },   // Jumbo: Coop Blechkonsole Weiss 25 x 30 cm
  shelfpin:   { name:'Steckbodenträger Ø 5 mm (Hettich)', price:0.34 },          // Jumbo: Hettich Steckbodenträger 20 Stück, CHF 6.75
  angle40:    { name:'Winkelverbinder 40 × 40 mm inkl. Schrauben', price:1, est:true }, // Jumbo: Ayce Winkelverbinder 40 x 40 mm
  dowel6:     { name:'Spreizdübel 6 mm + Schraube 4,5 × 50 mm', price:0.2, est:true }, // Jumbo: Fischer Dübel SX 6x30 S
  hollow:     { name:'Hohlraumdübel HM 5 × 52 inkl. Schraube (Fischer)', price:1.6 },  // Jumbo: Fischer HM 5 x 52 S, 4 Stück CHF 6.30
  screw35:    { name:'Holzschrauben 4 × 35 mm', price:0.08, est:true },          // Jumbo: Spax Senkkopf Torx 4 x 35 mm, 25 Stück
  screw70:    { name:'Holzschrauben 5 × 70 mm', price:0.19 },                    // Jumbo: SPAX 5 x 70 mm, 50 Stück CHF 9.50
  tipguard:   { name:'Kippsicherung mit Gurt, 2 Stück (Abus Isa)', price:22.5 }  // Jumbo: Abus TV-Kippsicherung Isa, 2 Stück; eigentliches Möbel-Kippschutz-Set nicht im Sortiment
};
const RAIL_LENS = [1000, 1500, 2000];
const KONSOLE_LENS = [250, 300, 350, 400, 470];
const WINKEL_LENS = [150, 200, 250];
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

// Selbststehend: Anzahl und Breite der Module, damit die Böden unter max bleiben.
function moduleSplit(len, max, t){
  const mw = Math.min(900, max + 2*t - 1);
  const m = Math.max(1, Math.ceil(len / mw));
  return { m, w: (len - (m - 1) * 2) / m };
}

/* ---------- Bauarten (eingebaut) ---------- */
function addShelf(ctx, seg, p, note){
  ctx.add('Tablar', p.b - p.a, seg.depth - 3, ctx.t, ctx.gMain, note, 'korpus',
    ctx.box(seg, { u0:p.a, u1:p.b, y0:p.y, y1:p.y + ctx.t, v0:3, v1:seg.depth }, 'y', 'u', ctx.fin, [0, 0, 200]));
}
// Eckleiste unter dem Stoss zum hinteren Regal.
function addCornerBatten(ctx, seg, p){
  ctx.add('Eckleiste', seg.depth - 3, 40, ctx.t, ctx.gMain, 'unter dem Eckstoss, an beide Tablare geschraubt', 'korpus',
    ctx.box(seg, { u0:p.a - 20, u1:p.a + 20, y0:p.y - ctx.t, y1:p.y, v0:3, v1:seg.depth }, 'y', 'v', ctx.fin, [0, -60, 0]));
  ctx.buy('screw35', 4, 'Eckleisten');
}
// Kantholz vorne; at = linke Kante entlang u.
function addPost(ctx, seg, at, height, note, v1){
  const vb = v1 == null ? seg.depth : v1;
  ctx.add('Kantholz 45 × 45', height, 45, 45, ctx.gSolid, note, 'solid',
    ctx.box(seg, { u0:at, u1:at + 45, y0:0, y1:height, v0:vb - 45, v1:vb }, 'u', 'y', SOLID_FIN, [0, 0, 120]), BUY.kant45.price);
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
    addPost(ctx, seg, u, h, 'Stütze am freien Ende, Tablare mit Winkeln verschraubt');
    ctx.buy('angle40', n, 'Tablare an die Stütze');
  }
}
// Gleichartige Meldungen mehrerer Wände zu einer zusammenfassen.
function groupWarn(ctx, key, part, text){
  const g = ctx.grouped.get(key) || { parts:[], text };
  g.parts.push(part);
  ctx.grouped.set(key, g);
}
const joinDe = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' und ' + a[a.length - 1] : a[0];
function spanWarn(ctx, seg, len, text){
  groupWarn(ctx, 'span|' + text, `${SIDE_NAME[seg.id]} (${r0(len)} mm)`, p => `Die Tablare ${p} ${text}`);
}
function extraWarn(ctx, seg, what){
  groupWarn(ctx, 'extra|' + what, SIDE_NAME[seg.id], p => `Spannweite ${p} ≥ ${ctx.max} mm – ${what} eingeplant.`);
}

const SUPPORTS = {
  battens(ctx, seg, shelves){
    const t = ctx.t;
    for (const p of shelves) {
      addShelf(ctx, seg, p, 'liegt auf Leisten');
      ctx.add('Leiste', p.b - p.a, 40, t, ctx.gMain, 'Wandleiste, alle 40 cm an die Wand', 'korpus',
        ctx.box(seg, { u0:p.a, u1:p.b, y0:p.y - 40, y1:p.y, v0:0, v1:t }, 'v', 'u', ctx.fin, [0, -40, 0]));
      ctx.fix += Math.max(2, Math.ceil((p.b - p.a) / 400) + 1);
      for (const e of [0, 1]) {
        if (p.ends[e] !== 'wall') continue;
        const u = e === 0 ? p.a - 3 : p.b + 3 - t;
        ctx.add('Leiste', seg.depth - 20 - t, 40, t, ctx.gMain, 'Endleiste an der Stirnwand', 'korpus',
          ctx.box(seg, { u0:u, u1:u + t, y0:p.y - 40, y1:p.y, v0:t, v1:seg.depth - 20 }, 'u', 'v', ctx.fin, [0, -40, 0]));
        ctx.fix += 2;
      }
      if (p.ends[0] === 'corner') addCornerBatten(ctx, seg, p);
    }
    freeEndPosts(ctx, seg, shelves);
    const longest = Math.max(...shelves.map(p => p.b - p.a));
    if (longest >= ctx.max) spanWarn(ctx, seg, longest, `liegen vorne frei – bei ${ctx.matShort} ${ctx.t} mm biegen sie sich ab ca. ${ctx.max} mm Spannweite durch. Pfostenrahmen, Wandschienen oder dickeres Material wählen.`);
  },

  rails(ctx, seg, shelves){
    const n = pieces(seg.u1 - seg.u0 - 100, ctx.max) + 1;
    const us = spread(seg.u0 + 50, seg.u1 - 50, n).map(r0);
    const kl = [...KONSOLE_LENS].reverse().find(l => l <= seg.depth - 10) || KONSOLE_LENS[0];
    if (kl > seg.depth - 10) ctx.warn.push(`Die kürzeste Konsole (${kl} mm) steht bei ${seg.depth} mm tiefen Tablaren ${SIDE_NAME[seg.id]} vorne vor – Tablare tiefer machen oder Tablarwinkel wählen.`);
    for (const p of shelves) addShelf(ctx, seg, p, 'liegt auf Konsolen, von unten verschraubt');
    let konsolen = 0;
    for (const u of us) {
      const on = shelves.filter(p => u >= p.a + 20 && u <= p.b - 20);
      if (!on.length) continue;
      const y0 = Math.min(...on.map(p => p.y)) - 60, y1 = Math.max(...on.map(p => p.y)) + 40;
      const need = y1 - y0;
      const rl = RAIL_LENS.find(l => l >= need) || RAIL_LENS[RAIL_LENS.length - 1];
      if (need > rl) ctx.warn.push(`Die Wandschienen ${SIDE_NAME[seg.id]} bräuchten ${r0(need)} mm – längste Schiene ist ${rl} mm. Zwei Schienen übereinander setzen.`);
      ctx.buy('rail' + rl, 1, 'senkrecht, auf Länge kürzen');
      ctx.fix += Math.ceil(rl / 300) + 1;
      ctx.extras.push({ type:'metal', ...ctx.box(seg, { u0:u - 8, u1:u + 8, y0, y1: y0 + Math.min(need, rl), v0:0, v1:12 }, 'v', 'y', null) });
      for (const p of on) {
        ctx.extras.push({ type:'metal', ...ctx.box(seg, { u0:u - 6, u1:u + 6, y0:p.y - 25, y1:p.y, v0:12, v1:12 + kl }, 'u', 'v', null, [0, 0, 120]) });
        konsolen++;
      }
    }
    ctx.buy('konsole' + kl, konsolen, 'eine pro Tablar und Schiene');
    ctx.buy('screw35', konsolen * 2, 'Tablare auf die Konsolen');
    for (const p of shelves) if (p.ends[0] === 'corner') addCornerBatten(ctx, seg, p);
    freeEndPosts(ctx, seg, shelves);
    if (n > 2) extraWarn(ctx, seg, 'zusätzliche Schienen');
  },

  brackets(ctx, seg, shelves){
    const want = seg.depth * 2 / 3;
    const size = WINKEL_LENS.find(l => l >= want) || WINKEL_LENS[WINKEL_LENS.length - 1];
    if (size < want) ctx.warn.push(`Für ${seg.depth} mm tiefe Tablare ${SIDE_NAME[seg.id]} sind Tablarwinkel knapp (grösster: ${size} mm). Wandschienen oder Pfostenrahmen tragen tiefe Tablare besser.`);
    let count = 0, extra = false;
    for (const p of shelves) {
      addShelf(ctx, seg, p, 'liegt auf Tablarwinkeln');
      const n = pieces(p.b - p.a - 120, ctx.max) + 1;
      if (n > 2) extra = true;
      for (const u of spread(p.a + 60, p.b - 60, n)) {
        ctx.extras.push({ type:'metal', ...ctx.box(seg, { u0:u - 10, u1:u + 10, y0:p.y - size * 0.8, y1:p.y, v0:0, v1:4 }, 'v', 'y', null) });
        ctx.extras.push({ type:'metal', ...ctx.box(seg, { u0:u - 10, u1:u + 10, y0:p.y - 4, y1:p.y, v0:4, v1:size }, 'y', 'v', null, [0, 0, 120]) });
        count++;
      }
      if (p.ends[0] === 'corner') addCornerBatten(ctx, seg, p);
    }
    ctx.buy('winkel' + size, count, 'unter die Tablare');
    ctx.fix += count * 2;
    ctx.buy('screw35', count * 2, 'Tablare auf die Winkel');
    freeEndPosts(ctx, seg, shelves);
    if (extra) extraWarn(ctx, seg, 'zusätzliche Winkel');
  },

  cheeks(ctx, seg, shelves){
    const t = ctx.t, pos = cheekPositions(seg, t, ctx.max);
    const h = ctx.H - 10;
    for (const u of pos) {
      ctx.add('Wange', h, seg.depth, t, ctx.gMain, 'Lochreihen 32er-Raster, oben und unten mit Winkeln an die Wand', 'korpus',
        ctx.box(seg, { u0:u, u1:u + t, y0:0, y1:h, v0:0, v1:seg.depth }, 'u', 'y', ctx.fin, [0, 0, 80]));
    }
    ctx.buy('angle40', pos.length * 3, 'Wangen an Wand und Boden');
    ctx.fix += pos.length * 3;
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
    for (const p of shelves) {
      addShelf(ctx, seg, p, 'liegt auf Latten, vorne auf der Querlatte');
      ctx.add('Latte 24 × 48', p.b - p.a, 48, 24, ctx.gSolid, 'Wandlatte, alle 40 cm an die Wand', 'solid',
        ctx.box(seg, { u0:p.a, u1:p.b, y0:p.y - 48, y1:p.y, v0:0, v1:24 }, 'v', 'u', SOLID_FIN, [0, -40, 0]), BUY.latte.price);
      ctx.fix += Math.max(2, Math.ceil((p.b - p.a) / 400) + 1);
      ctx.add('Latte 24 × 48', p.b - p.a, 48, 24, ctx.gSolid, 'Querlatte vorne, an die Pfosten geschraubt', 'solid',
        ctx.box(seg, { u0:p.a, u1:p.b, y0:p.y - 48, y1:p.y, v0:seg.depth - 24, v1:seg.depth }, 'v', 'u', SOLID_FIN, [0, -40, 60]), BUY.latte.price);
      for (const e of [0, 1]) {
        if (p.ends[e] !== 'wall') continue;
        const u = e === 0 ? p.a - 3 : p.b + 3 - 24;
        ctx.add('Latte 24 × 48', seg.depth - 48, 48, 24, ctx.gSolid, 'Endlatte an der Stirnwand', 'solid',
          ctx.box(seg, { u0:u, u1:u + 24, y0:p.y - 48, y1:p.y, v0:24, v1:seg.depth - 24 }, 'u', 'v', SOLID_FIN, [0, -40, 0]), BUY.latte.price);
        ctx.fix += 2;
      }
      if (p.ends[0] === 'corner') addCornerBatten(ctx, seg, p);
    }
    // Stützpunkte entlang der Vorderkante: Wand-/Eck-Enden tragen über die Latten, freie Enden und die Nischenkante brauchen Pfosten.
    const edge = seg.niche ? (seg.niche.at === 'end' ? seg.u1 - seg.niche.w : seg.u0 + seg.niche.w) : null;
    const pts = [seg.u0, seg.u1];
    const posts = [];
    if (seg.ends[0] === 'free') posts.push(seg.u0);
    if (seg.ends[1] === 'free') posts.push(seg.u1 - 45);
    if (edge != null) { pts.push(edge); posts.push(r0(edge - 22)); }
    pts.sort((x, y) => x - y);
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i], q = pts[i + 1];
      const isNiche = edge != null && (seg.niche.at === 'end' ? p >= edge : q <= edge);
      if (isNiche) { if (q - p >= ctx.max) spanWarn(ctx, seg, q - p, `liegen über der Nische vorne frei – ab ca. ${ctx.max} mm biegen sie sich durch. Nische schmaler machen.`); continue; }
      const k = Math.floor((q - p) / ctx.max);
      for (let j = 1; j <= k; j++) posts.push(r0(p + (q - p) * j / (k + 1) - 22));
    }
    const inner = seg.depth - 24;
    for (const u of posts) addPost(ctx, seg, u, top, 'Pfosten, vom Boden bis zum obersten Tablar', inner);
    ctx.buy('screw70', plusTen(posts.length * ctx.levels.length * 2), 'Querlatten an die Pfosten');
    if (posts.length > (seg.ends.includes('free') ? 1 : 0) + (edge != null ? 1 : 0)) extraWarn(ctx, seg, 'Zwischenpfosten');
  }
};
const plusTen = x => Math.ceil(x * 1.1);

/* ---------- Selbststehend ---------- */
function freeModules(ctx, seg){
  const t = ctx.t, Bk = ctx.Bk, bt = Bk ? Bk.t : 0;
  const u0 = seg.ends[0] === 'corner' ? seg.u0 + 2 : seg.u0 + 10;
  const u1 = seg.ends[1] === 'free' ? seg.u1 : seg.u1 - 10;
  const v0 = 10, v1 = seg.depth, dep = v1 - v0;
  const zones = [];
  if (seg.niche) {
    const nw = Math.min(seg.niche.w, u1 - u0 - 200);
    if (seg.niche.at === 'end') zones.push([u0, u1 - nw - 2, 0], [u1 - nw, u1, seg.niche.h]);
    else zones.push([u0, u0 + nw, seg.niche.h], [u0 + nw + 2, u1, 0]);
  } else zones.push([u0, u1, 0]);
  for (const [a, b, minY] of zones) {
    const { m, w } = moduleSplit(b - a, ctx.max, t);
    for (let k = 0; k < m; k++) {
      const ma = a + k * (w + 2), mb = ma + w;
      const lv = ctx.levels.filter(y => y >= minY);
      if (!lv.length) { ctx.warn.push(`Über der Nische ${SIDE_NAME[seg.id]} hat es kein Tablar mehr – Modul weggelassen.`); continue; }
      const top = Math.max(...lv) + t;
      for (const side of [ma, mb - t]) {
        ctx.add('Seite', top, dep, t, ctx.gMain, 'Lochreihe innen, steht auf dem Boden', 'korpus',
          ctx.box(seg, { u0:side, u1:side + t, y0:0, y1:top, v0, v1 }, 'u', 'y', ctx.fin, [side === ma ? -60 : 60, 0, 0]));
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
      ctx.modules++;
      if (top > 1200) { ctx.tall++; ctx.fix += 2; }
    }
  }
}

/* ---------- Berechnung ---------- */
function computeReduit(c0){
  const { cfg:c, warn } = normReduit(c0);
  const lay = layoutReduit(c);
  warn.push(...lay.warn);
  const W = c.rw, D = c.rd, H = c.rh;
  const M = MATS[c.mat] || MATS.birke, t = c.t;
  const free = c.build === 'free';
  const Bk = free ? BACKS[c.back] : null, bt = Bk ? Bk.t : 0;
  const levels = shelfLevels(c.nShelves, c.gapBottom, c.gapTop, H);
  const max = maxSpan(c.mat, t);
  const fin = { color: c.mat === 'mdf' ? COLORS.weiss : M.color, ply:M.ply, grain:M.grain, plyColor:M.color };
  const backFin = Bk ? { color:Bk.color, ply:Bk.ply, grain:false, plyColor:Bk.color } : null;
  const gMain = `${M.short} ${t} mm`, gBack = Bk ? `${Bk.name} ${Bk.t} mm` : null, gSolid = 'Massivholz Fichte';

  const raw = [], boxes = [], extras = [], buys = new Map();
  const ctx = {
    c, W, D, H, t, max, levels, fin, backFin, Bk, gMain, gBack, gSolid, matShort:M.short, warn, extras,
    fix:0, lens:[], pins:0, backScrews:0, modules:0, tall:0, grouped:new Map(),
    add(name, L, B, th, group, note, kind, box, pm){
      const key = [name, r0(L), r0(B), th, group, note].join('|');
      raw.push({ key, name, L:r0(L), B:r0(B), t:th, group, note, kind, pm });
      if (box) { box.key = key; boxes.push(box); }
    },
    box: (seg, b, thin, grain, f, ex) => boxOf(seg, W, D, b, thin, grain, f, ex),
    buy(key, qty, note){
      if (!qty) return;
      const cur = buys.get(key);
      if (cur) cur.qty += qty; else buys.set(key, { qty, note });
    }
  };

  for (const seg of lay.segs) {
    if (free) freeModules(ctx, seg);
    else SUPPORTS[c.sys](ctx, seg, shelfPieces(seg, levels));
  }
  for (const g of ctx.grouped.values()) warn.push(g.text(joinDe(g.parts)));

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
  const sheetL = clamp(c.sheetL, 500, 3100), sheetB = clamp(c.sheetB, 300, 2100), kerf = clamp(c.kerf, 0, 8);
  const rotate = !(c.grain && M.grain);
  groups.push({ label: gMain, sheet:[sheetL, sheetB], price: clamp(c.price, 0, 500), rotate, ...pack(mainItems, sheetL, sheetB, kerf, 10, rotate) });
  if (Bk && backItems.length) groups.push({ label: gBack, sheet: Bk.sheet, price: Bk.price, rotate: true, ...pack(backItems, Bk.sheet[0], Bk.sheet[1], kerf, 10, true) });
  for (const g of groups) for (const u of g.unplaced) warn.push(`Teil ${u.pos} (${u.name}, ${u.L} × ${u.B} mm) passt nicht auf die Platte ${g.sheet[0]} × ${g.sheet[1]} mm. Grösseres Plattenformat eintragen${g.rotate ? '' : ' oder Maserung freigeben'}.`);

  // Beschläge
  const hw = [];
  if (free) {
    hw.push(...jointHardware(c, ctx.lens, t, false, 'für Böden und Deckel'));
    if (ctx.pins) ctx.buy('shelfpin', ctx.pins, '4 pro Einlegeboden');
    if (ctx.tall) ctx.buy('tipguard', Math.ceil(ctx.tall / 2), 'ein Gurt pro Modul, oben an die Wand');
    if (Bk) hw.push([ctx.backScrews, 'Senkkopfschrauben 3 × 16 mm', 'Rückwände, alle 15 cm']);
    else warn.push('Ohne Rückwand verziehen sich die Module leicht. Metallwinkel hinten in die Ecken sind eingeplant – eine Rückwand ist stabiler.');
  }
  const drywall = c.wall === 'drywall';
  if (ctx.fix) ctx.buy(drywall ? 'hollow' : 'dowel6', plusTen(ctx.fix), drywall ? 'für Gipskarton, wenn möglich in die Ständer' : 'für Beton oder Backstein, +10 % Reserve');
  for (const [key, { qty, note }] of buys) hw.push([qty, BUY[key].name, BUY[key].est ? `${note} · Preis geschätzt` : note, BUY[key].price]);
  if (drywall && ctx.fix) warn.push('Gipskarton trägt wenig: Leisten, Schienen und Winkel wenn möglich in die Ständer schrauben (meist alle 60 cm) und Hohlraumdübel verwenden. Für schwere Lasten besser selbststehend bauen.');

  const buyCost = hw.reduce((a, h) => a + (h[3] ? h[0] * h[3] : 0), 0);
  const solidCost = rows.filter(r => r.kind === 'solid').reduce((a, r) => a + r.qty * r.L / 1000 * (r.pm || 0), 0);

  // Oberfläche
  const plateArea = rows.filter(r => r.kind !== 'solid').reduce((a, r) => a + r.qty * r.L * r.B / 1e6, 0) * 2;
  const finish = [];
  if (c.mat === 'mdf') {
    finish.push([`${Math.max(1, Math.ceil(plateArea / 10 * 10))} dl`, 'Grundierung für MDF (Kanten 2×)', `${plateArea.toFixed(1)} m²`]);
    finish.push([`${Math.max(1, Math.ceil(plateArea * 2 / 10 * 10))} dl`, 'Möbellack seidenmatt, Weiss', '2 Schichten, Zwischenschliff Körnung 240']);
  } else finish.push([`${Math.max(1, Math.ceil(plateArea * 2 / 22 * 10))} dl`, 'Hartwachsöl, farblos oder weiss pigmentiert', `${plateArea.toFixed(1)} m² beidseitig, 2 Anstriche`]);
  if (rows.some(r => r.kind === 'solid')) finish.push(['–', 'Kanthölzer und Latten roh lassen oder mitölen', 'im Reduit reicht roh']);
  finish.push(['1', 'Schleifpapier Körnung 120, 180', 'Kanten leicht brechen']);

  // Werkzeug
  const tools = new Set(['Akkuschrauber mit Bit-Set', 'Doppelmeter und Bleistift', 'Wasserwaage (mind. 60 cm)']);
  if (!free || ctx.fix) {
    tools.add(drywall ? 'Bohrmaschine, Bohrer passend zu den Hohlraumdübeln' : 'Schlagbohrmaschine mit Steinbohrer Ø 6 mm');
    tools.add('Leitungssucher (Strom und Wasser in der Wand)');
  }
  if (free) { tools.add('Schraubzwingen (mind. 4)'); tools.add('Anschlagwinkel'); jointTools(c, t, tools); }
  if (free ? ctx.pins : c.sys === 'cheeks') tools.add('Lochreihen-Bohrschablone (32-mm-Raster) + Bohrer Ø 5 mm');
  if (!free && c.sys === 'rails') tools.add('Eisensäge zum Kürzen der Schienen');
  if (rows.some(r => r.kind === 'solid')) tools.add('Handsäge oder Kappsäge für Kanthölzer und Latten');
  tools.add('Schwingschleifer oder Schleifklotz');
  tools.add(c.mat === 'mdf' ? 'Schaumstoffrolle und Lackpinsel' : 'Baumwolllappen oder Pinsel für Öl');

  const steps = buildReduitSteps({ c, free, Bk, levels, drywall, segs: lay.segs, hasSolid: rows.some(r => r.kind === 'solid'), hasFreeEnds: rows.some(r => r.kind === 'solid' && r.note.includes('freien Ende')), hasCorner: rows.some(r => r.name === 'Eckleiste') });

  // Raumwände und Nischen für die 3D-Ansicht
  const WT = 100, doorH = Math.min(2000, H - 150);
  extras.push({ type:'wall', size:[W + 2*WT, H, WT], pos:[0, H/2, -D/2 - WT/2] });
  extras.push({ type:'wall', size:[WT, H, D], pos:[-W/2 - WT/2, H/2, 0] });
  extras.push({ type:'wall', size:[WT, H, D], pos:[W/2 + WT/2, H/2, 0] });
  const wf = lay.wf;
  extras.push({ type:'wall', front:true, size:[wf + WT, H, WT], pos:[-W/2 - WT + (wf + WT)/2, H/2, D/2 + WT/2] });
  extras.push({ type:'wall', front:true, size:[wf + WT, H, WT], pos:[W/2 + WT - (wf + WT)/2, H/2, D/2 + WT/2] });
  extras.push({ type:'wall', front:true, size:[c.doorW, H - doorH, WT], pos:[0, doorH + (H - doorH)/2, D/2 + WT/2] });
  for (const s of lay.segs) {
    if (!s.niche) continue;
    const a = s.niche.at === 'end' ? s.u1 - s.niche.w : s.u0;
    extras.push({ type:'niche', ...boxOf(s, W, D, { u0:a + 5, u1:a + s.niche.w - 5, y0:0, y1:s.niche.h - 5, v0:5, v1:s.depth - 5 }, 'y', 'u', null) });
  }

  const level = free ? JOINTS[c.joint].level : SYS[c.sys].level;
  return {
    kind:'reduit', W, H, D, Dtot:D, t, M, Bk, rows, boxes, doors:[], slides:[], extras, groups, hw, finish,
    tools:[...tools], steps, warn:[...new Set(warn)], carcFin:fin, frontFin:fin, level, joint:c.joint, matShort:M.short,
    buyCost, solidCost, room:{ W, D, H, doorW:c.doorW, doorH }, build:c.build, sys:c.sys, shape:c.shape, modules:ctx.modules, max
  };
}

/* ---------- Bauablauf ---------- */
function buildReduitSteps(o){
  const { c, free, Bk, drywall, hasSolid, hasFreeEnds, hasCorner } = o;
  const st = [];
  st.push(['Raum ausmessen und Wände prüfen', `Breite und Tiefe auf drei Höhen messen – alte Wände sind selten gerade, rechne mit dem kleinsten Mass. Mit dem Leitungssucher Strom- und Wasserleitungen markieren.${drywall ? ' Bei Gipskarton die Ständer suchen (meist alle 60 cm) und anzeichnen.' : ''}`, 'Ein Foto mit Doppelmeter an jeder Wand hilft später beim Zuschnitt.']);
  st.push(['Zuschnitt organisieren', `Kopier die Materialliste und lass die Platten im Baumarkt zuschneiden.${hasSolid ? ' Kanthölzer und Latten gibt es in Standardlängen – selbst mit der Säge ablängen.' : ''}`, 'Frag nach dem Zuschnitt, ob die Teile beschriftet werden können.']);
  st.push(['Teile beschriften und schleifen', 'Positionsbuchstabe auf die Unterseite, Kanten mit Körnung 120 und 180 schleifen und leicht brechen.', null]);
  if (free) {
    st.push(['Module bauen', `Pro Modul Boden und Deckel zwischen die Seiten setzen und mit der gewählten Verbindung (${JOINTS[c.joint].name}) verbinden. Zuerst trocken zusammenstecken, jede Ecke mit dem Winkel prüfen.`, 'Zu zweit geht es deutlich einfacher.']);
    if (Bk) st.push(['Rückwände montieren', 'Diagonalen messen, bis sie gleich lang sind, dann die Rückwand rundum 1 mm zurück alle 15 cm verschrauben.', null]);
    else st.push(['Module aussteifen', 'Diagonalen messen, bis sie gleich lang sind, dann hinten Metallwinkel in alle vier Ecken schrauben.', null]);
    st.push(['Module stellen', 'Zuerst die hinteren Module stellen und ausrichten, dann die seitlichen davor. Nebeneinanderstehende Module mit 2–3 Schrauben pro Seite verbinden.', 'Bei unebenem Boden Unterlegkeile oder Stellfüsse verwenden.']);
    if (c.rh - c.gapTop > 1200) st.push(['Kippschutz montieren', `Jedes Modul oben mit dem Kippschutz an die Wand schrauben${drywall ? ' – bei Gipskarton in einen Ständer oder mit Hohlraumdübeln' : ''}.`, null]);
    st.push(['Einlegeböden einlegen', 'Bodenträger in die gewünschte Höhe stecken und die Einlegeböden auflegen.', null]);
  } else {
    const ank = drywall ? 'Hohlraumdübel' : 'Dübel 6 mm';
    st.push(['Tablarhöhen anzeichnen', `Die Unterkanten der Tablare auf ${o.levels.join(', ')} mm ab Boden an allen Wänden mit Wasserwaage anzeichnen.`, 'Ein Laser spart hier viel Zeit.']);
    if (c.sys === 'battens') st.push(['Leisten montieren', `Wandleisten und Endleisten auf die Linien halten, alle 40 cm vorbohren und mit ${ank} befestigen. Die Oberkante der Leiste ist die Unterkante des Tablars.`, 'Erst die Enden befestigen, dann mit der Wasserwaage die Mitte ausrichten.']);
    if (c.sys === 'rails') st.push(['Wandschienen montieren', `Schienen auf Länge kürzen, senkrecht (Wasserwaage!) an den markierten Positionen mit ${ank} befestigen. Konsolen auf den Tablarhöhen einhängen.`, 'Die erste Schiene genau lotrecht setzen, die weiteren mit Wasserwaage und Latte auf gleiche Höhe bringen.']);
    if (c.sys === 'brackets') st.push(['Tablarwinkel montieren', `Winkel auf den Linien ausrichten und mit je 2 ${ank} an der Wand befestigen.`, null]);
    if (c.sys === 'cheeks') st.push(['Lochreihen bohren, Wangen stellen', `Mit der Lochreihen-Schablone Löcher Ø 5 mm in die Wangen bohren (10 mm tief). Wangen senkrecht stellen und mit je 3 Winkeln an Wand und Boden befestigen (${ank}).`, 'Zwischenwangen bohren beidseitig – dort nur 8 mm tief und um 16 mm versetzt.']);
    if (c.sys === 'posts') st.push(['Latten und Pfosten montieren', `Wandlatten und Endlatten auf die Linien schrauben (${ank}, alle 40 cm). Pfosten ablängen, lotrecht stellen und die vorderen Querlatten mit je 2 Schrauben 5 × 70 an die Pfosten schrauben.`, 'Pfosten zuerst oben mit einer Schraube fixieren, lotrecht ausrichten, dann festschrauben.']);
    if (hasFreeEnds) st.push(['Stützen an den freien Enden', 'Kanthölzer an die freien Tablar-Enden stellen, lotrecht ausrichten und jedes Tablar mit einem Winkel an die Stütze schrauben.', null]);
    st.push(['Tablare auflegen', c.sys === 'cheeks' ? 'Bodenträger stecken und die Tablare auflegen.' : 'Tablare auflegen und von unten mit Schrauben 4 × 35 an Leisten, Konsolen oder Winkeln fixieren.', null]);
    if (hasCorner) st.push(['Eckstösse verbinden', 'Unter jedem Stoss zwischen hinterem und seitlichem Tablar eine Eckleiste anschrauben – je 2 Schrauben in jedes Tablar.', null]);
  }
  st.push([c.mat === 'mdf' ? 'Lackieren' : 'Oberfläche ölen', c.mat === 'mdf' ? 'Kanten zweimal grundieren, zwischenschleifen, zweimal lackieren – am besten vor der Montage.' : 'Hartwachsöl dünn auftragen, nach 15 Minuten Überschuss abnehmen, nach dem Trocknen ein zweites Mal – am einfachsten vor der Montage.', null]);
  return st;
}

if (typeof module !== 'undefined') module.exports = {
  REDUIT_DEFAULTS, normReduit, shelfLevels, layoutReduit, toWorld, boxOf,
  SPAN, BUY, SYS, maxSpan, cheekPositions, moduleSplit, computeReduit
};
