/* Gemeinsame Kataloge und reine Helfer (ohne DOM) – im Browser Globals, in Node per module.exports. */
'use strict';
const clamp = (v, a, b) => Math.min(b, Math.max(a, isFinite(v) ? v : a));
const r0 = v => Math.round(v);

/* ---------- Kataloge ---------- */
// Preise, Stärken und Plattenformate stehen in preise.js (im Browser vorher geladen, in Node per require).
// Birke-Platte 1500 × 3000 mit Maserung über die 1500er-Seite.
const PRICE_DATA = typeof PREISE !== 'undefined' ? PREISE : require('./preise.js');
// Namen einheitlich: Werkstoff, dann Holzart oder Farbe, dann Qualität; die Marke ganzer Bretter in Klammern
// (z. B. «Sperrholz Birke Premium», «Spanplatte weiss», «Leimholz Fichte (go/on)»). Ohne Holzart sagt das zweite Wort,
// wie die Oberfläche ab Händler ist: roh (ölen, lackieren oder roh lassen) oder die Farbe der Beschichtung.
const MAT_INFO = {
  birke:  { name:'Sperrholz Birke Premium', color:'#E2D3B6', ply:true,  grain:true,  tDef:18,
            note:'Sichtbare Schichtkanten sind der typisch skandinavische Look. Fast fehlerfreie Sichtseite. Einfach ölen, Kanten nur schleifen.' },
  birkesi: { name:'Sperrholz Birke Standard', color:'#E2D3B6', ply:true, grain:true, tDef:18,
            note:'Gleicher Look wie Premium, aber einfachere Sichtseite mit kleinen Ästen und Ausbesserungen – rund ein Drittel günstiger.' },
  eiche:  { name:'Leimholz Eiche', color:'#C9A26D', ply:false, grain:true,  tDef:18,
            note:'Massivholz arbeitet leicht mit der Luftfeuchtigkeit. Qualität B/C: lebendige Oberfläche mit einzelnen Ästen.' },
  fichte: { name:'Leimholz Fichte', color:'#EAD6A8', ply:false, grain:true,  tDef:18,
            note:'Günstig und leicht zu bearbeiten, aber weich. Weissöl verhindert das Nachdunkeln ins Gelbliche.' },
  seekiefer: { name:'Sperrholz Seekiefer', color:'#D8B685', ply:true, grain:true, tDef:15,
            note:'Lebhafte, rötliche Maserung und sichtbare Schichtkanten. Günstiger als Birke, Oberfläche etwas rauer – gut schleifen.' },
  fichtesp: { name:'Sperrholz Fichte', color:'#E6CF9E', ply:true, grain:true, tDef:18,
            note:'Helles Nadelholz mit sichtbaren Schichtkanten. Weicher als Birke, Weissöl hält den hellen Ton.' },
  mdf:    { name:'MDF roh', color:'#E9E7E1', ply:false, grain:false, tDef:19,
            note:'Glatt und formstabil, ideal zum Lackieren. Schrauben in MDF-Kanten immer vorbohren.' },
  // Günstige, robuste Platten – gut für Reduit, Keller und Werkstatt. coated = fertige Beschichtung, nicht ölen.
  schaltafel: { name:'Schaltafel gelb', color:'#E8C547', ply:true, grain:false, coated:true, boards:true,
            note:'Die gelbe Platte von der Baustelle: sehr robust und wasserfest, die Oberfläche ist schon fertig. Gibt es nur als ganze Tafel 2000 × 500 – die Tiefe richtet sich danach. Die Schnittkanten einmal lackieren oder ölen.' },
  osb:    { name:'OSB roh', color:'#CFAE78', ply:false, grain:false, tDef:18,
            note:'Aus grossen, gepressten Holzspänen – sieht rustikal aus, wie in einer Werkstatt. Stabil und robust. Kanten gut schleifen, dann ölen oder roh lassen.' },
  dreischicht: { name:'Dreischicht Fichte', color:'#E6CF9E', ply:true, grain:true, tDef:19,
            note:'Drei verleimte Holzschichten: sieht aus wie Massivholz, verzieht sich aber kaum. Fichte ist weich und bekommt schnell Dellen – Weissöl hält den hellen Ton.' },
  dekorspan: { name:'Spanplatte weiss', color:'#F1F0EB', ply:false, grain:false, coated:true, tDef:19,
            note:'Weiss beschichtet wie bei Fertigmöbeln – fertig, kein Streichen nötig. An den Schnittkanten sieht man die Spanplatte: mit weissem Kantenband überbügeln. Hängt als Tablar schneller durch als Sperrholz.' },
  // Ganze Bretter in festen Formaten (nur ablängen, nur Reduit). Formate und Stückpreise in preise.js → bretter.
  gon_fichte: { name:'Leimholz Fichte (go/on)', color:'#EAD6A8', ply:false, grain:true, boards:true,
            note:'Ganze Bretter 200 oder 400 breit, 1200 oder 2000 lang – viel günstiger als der Zuschnitt. Die Regaltiefe richtet sich nach der Brettbreite. Weissöl hält den hellen Ton.' },
  gon_3s: { name:'Dreischicht Fichte (go/on)', color:'#E6CF9E', ply:true, grain:true, boards:true,
            note:'Dreischichtplatte, 600 breit und 1200 oder 2500 lang. Verzieht sich kaum – nur für 60 cm tiefe Regale.' },
  mood_fichte: { name:'Leimholz Fichte A (Mood)', color:'#EAD6A8', ply:false, grain:true, boards:true,
            note:'Schöne Sichtqualität A, viele Formate von 800 bis 2500 lang und 200 bis 600 breit.' },
  regalbau: { name:'Regalbauplatte weiss', color:'#F1F0EB', ply:false, grain:false, coated:true, boards:true,
            note:'Weiss beschichtet, die Längskanten sind schon bekantet. Nur 1150 lang – lange Tablare werden über einer Stütze gestossen.' },
  moebel_weiss: { name:'Möbelplatte weiss', color:'#F1F0EB', ply:false, grain:false, coated:true, boards:true,
            note:'Weiss beschichtet, 2600 lang und 250 bis 600 breit – ähnlich günstig wie die Regalbauplatte, aber lang genug für die meisten Reduit-Wände.' }
};
const BACK_INFO = {
  hdf3: { name:'MDF weiss', t:3, color:'#F0EFEA', ply:false },
  hf3:  { name:'Hartfaser roh', t:3, color:'#9C7A55', ply:false },
  ply6: { name:'Sperrholz Pappel', t:5, color:'#E8D9B8', ply:true }
};
// Plattenmaterial: Stärken = Stärken mit Preis; price = Preis der Standardstärke (für die Sortierung).
function plateMat(M, P){
  if (!P) return null;
  const t = Object.keys(P.prices).map(Number).sort((a, b) => a - b);
  const tDef = t.includes(M.tDef) ? M.tDef : t[0];
  return { ...M, t, tDef, sheet:P.sheet, price:P.prices[tDef], prices:P.prices };
}
// Brett-Material: Formate nach Breite, dann Länge; price = günstigster m²-Preis (Sortierung, Anzeige «ab»), sheet = grösstes Format.
function boardMat(M, P){
  if (!P || !P.formate.length) return null;
  const boards = P.formate.map(f => ({ L:f.L, B:f.B, price:f.price })).sort((a, b) => a.B - b.B || a.L - b.L);
  const big = boards.reduce((a, f) => f.L > a.L || (f.L === a.L && f.B > a.B) ? f : a);
  const perM2 = Math.min(...boards.map(f => f.price / (f.L * f.B / 1e6)));
  return { ...M, t:[P.t], tDef:P.t, boards, widths:[...new Set(boards.map(f => f.B))], est:!!P.est,
    sheet:[big.L, big.B], price:Math.round(perM2 * 100) / 100 };
}
// Ohne Preis fällt ein Material weg.
const MATS = Object.fromEntries(Object.entries(MAT_INFO)
  .map(([k, M]) => [k, M.boards ? boardMat(M, (PRICE_DATA.bretter || {})[k]) : plateMat(M, PRICE_DATA.platten[k])])
  .filter(([, M]) => M));
const BACKS = { none:null, ...Object.fromEntries(Object.entries(BACK_INFO).filter(([k]) => PRICE_DATA.rueckwaende[k])
  .map(([k, B]) => [k, { ...B, sheet:PRICE_DATA.rueckwaende[k].sheet, price:PRICE_DATA.rueckwaende[k].price }])) };
const COLORS = { weiss:'#EEEDE7', salbei:'#A7B39E', taube:'#8E9FAB', anthrazit:'#3E4447' };
const COLOR_NAMES = { weiss:'Kreideweiss', salbei:'Salbei', taube:'Taubenblau', anthrazit:'Anthrazit' };
const JOINTS = {
  pocket: { name:'Taschenloch', level:1 },
  screws: { name:'Verschraubt', level:1 },
  dowels: { name:'Holzdübel', level:2 },
  cam:    { name:'Exzenter', level:2 }
};

/* ---------- Preise ---------- */
// m²-Preis einer Stärke; prices = { Stärke: CHF/m² } überschreibt den Materialpreis.
function matPrice(M, t){ return (M.prices && M.prices[t]) || M.price; }
// Holzkosten zweier Einkaufsarten: Zuschnitt (nur Teilefläche) oder ganze Platten. Ganze Bretter: nur Stückpreise.
function sheetCosts(groups){
  const whole = g => g.boards ? g.sheets.reduce((a, s) => a + s.price, 0) : g.sheets.length * g.sheet[0] * g.sheet[1] / 1e6 * g.price;
  return {
    cut: groups.reduce((a, g) => a + (g.boards ? whole(g) : g.partArea / 1e6 * g.price), 0),
    whole: groups.reduce((a, g) => a + whole(g), 0)
  };
}

/* ---------- Ganze Bretter ---------- */
// Nur ablängen: ein Teil der Breite b bekommt die kleinste Brettbreite B mit b ≤ B ≤ b + BOARD_SLACK, sonst null.
const BOARD_SLACK = 15;
function boardWidthFor(widths, b){
  const B = widths.find(w => w >= b && w <= b + BOARD_SLACK);
  return B == null ? null : B;
}
// 1D-Packen pro Brettbreite: längste Teile zuerst auf das längste Format (First Fit), dann je Brett das günstigste Format, das die Teile fasst.
function packBoards(items, boards, kerf){
  const widths = [...new Set(boards.map(f => f.B))].sort((a, b) => a - b);
  const sheets = [], unplaced = [], byW = new Map();
  const miss = it => { if (!unplaced.some(u => u.key === it.key)) unplaced.push(it); };
  for (const it of items) {
    const B = boardWidthFor(widths, it.B);
    if (B == null) { miss(it); continue; }
    if (!byW.has(B)) byW.set(B, []);
    byW.get(B).push(it);
  }
  for (const B of widths) {
    const fmts = boards.filter(f => f.B === B), Lmax = Math.max(...fmts.map(f => f.L));
    const bins = [];
    for (const it of (byW.get(B) || []).slice().sort((a, b) => b.L - a.L)) {
      if (it.L > Lmax) { miss(it); continue; }
      const bin = bins.find(b => b.len + kerf + it.L <= Lmax);
      if (bin) { bin.parts.push(it); bin.len += kerf + it.L; } else bins.push({ parts:[it], len:it.L });
    }
    for (const bin of bins) {
      const f = fmts.filter(f => f.L >= bin.len).reduce((a, f) => f.price < a.price ? f : a);
      let x = 0;
      const parts = bin.parts.map(it => { const p = { it, x, y:0, w:it.L, h:B, rot:false }; x += it.L + kerf; return p; });
      sheets.push({ L:f.L, B, price:f.price, parts });
    }
  }
  const used = sheets.reduce((a, s) => a + s.parts.reduce((b, p) => b + p.w * p.h, 0), 0);
  const partArea = items.reduce((a, it) => a + it.L * it.B, 0);
  return { sheets, unplaced, used, partArea, total: sheets.reduce((a, s) => a + s.L * s.B, 0) };
}

/* ---------- Verbindungen ---------- */
/* ---------- Spannweiten ---------- */
// Maximale freie Spannweite (mm) eines belasteten Tablars (ca. 30–40 kg/m, Durchbiegung ≤ ca. 1/200).
// Daumenregel; MDF kriecht unter Dauerlast und liegt deshalb tiefer.
const SPAN = {
  birke:     { 12:500, 15:650, 18:800, 21:950 },
  birkesi:   { 12:500, 15:650, 18:800, 21:950 },
  eiche:     { 18:700, 20:800, 26:1000, 27:1050 },
  fichte:    { 18:600, 21:720, 27:900, 28:950 },
  seekiefer: { 12:450, 15:550 },
  fichtesp:  { 12:450, 15:600, 18:700, 21:800, 24:900 },
  mdf:       { 16:450, 19:550, 22:650 },
  schaltafel:{ 27:1000 },
  osb:       { 12:450, 15:550, 18:650, 22:800 },
  dreischicht:{ 19:650, 27:950 },
  dekorspan: { 16:400, 19:500 },
  gon_fichte:{ 18:600 },
  gon_3s:    { 19:650 },
  mood_fichte:{ 18:600 },
  regalbau:  { 16:400 },
  moebel_weiss:{ 18:470 }
};
function maxSpan(mat, t){ return (SPAN[mat] && SPAN[mat][t]) || 700; }

/* ---------- Schrauben nach Stärke ---------- */
// Handelsübliche Holzschrauben [Ø, Länge] in mm.
const SCHRAUBEN = [[3.5, 10], [4, 12], [4, 16], [4, 20], [4, 25], [3.5, 30], [4, 35], [4, 40], [4, 45]];
// Längste Schraube, die durch `durch` mm (Blech, Leiste, Tablar) höchstens `biss` mm in `holz` mm Holz greift und
// mindestens 4 mm Holz über der Spitze lässt (Schreiner-Review, Tabelle im Eck-Urteil).
function schraube(durch, holz, biss = 22){
  const max = durch + Math.min(holz - 4, biss);
  return [...SCHRAUBEN].reverse().find(([, L]) => L <= max) || SCHRAUBEN[0];
}
// Schraube je Anwendung bei Bauteilstärke t:
// blech    = von unten durch Konsole oder Blechwinkel (ca. 2 mm) ins Tablar
// latte    = von unten durch eine Eck- oder Stossleiste aus Dachlatte (24 mm, flach) ins Tablar
// streifen = von unten durch eine Leiste aus dem Plattenmaterial (t, flach) ins Tablar
// oben     = von oben durch das Tablar in Leiste oder Latte
// fuss     = Anschraubplatte oder Winkel unter dem Boden (Platte nicht mitgerechnet, höchstens 16 mm Biss)
// kante    = durch ein Bauteil (t) in die Kante eines zweiten, z. B. Sockelecken (höchstens 25 mm Biss)
function screwFor(anbau, t){
  if (anbau === 'blech') return schraube(2, t);
  if (anbau === 'latte') return schraube(24, t);
  if (anbau === 'streifen') return schraube(t, t);
  if (anbau === 'oben') return schraube(t, 40);
  if (anbau === 'fuss') return schraube(0, t, 16);
  if (anbau === 'kante') return schraube(t, 100, 25);
  throw new Error('screwFor: unbekannte Anwendung ' + anbau);
}
const screwText = ([d, L]) => `${String(d).replace('.', ',')} × ${L}`;
const screwKey = ([d, L]) => `screw${d}x${L}`;

// Beschläge für die gewählte Korpusverbindung. lens = Längen aller Stösse (mm), what = wofür die Schrauben sind.
function jointHardware(c, lens, t, bath, what){
  const hw = [];
  const ss = bath ? ', Edelstahl A2' : '';
  const glueName = bath ? 'Holzleim D4 (wasserfest)' : 'Holzleim D3';
  const per = len => {
    switch (c.joint) {
      case 'screws': case 'pocket': return Math.max(2, Math.ceil((len - 80) / 150) + 1);
      case 'dowels': return Math.max(3, Math.ceil((len - 80) / 120) + 1);
      default: return len < 350 ? 2 : 3;
    }
  };
  const conn = lens.reduce((a, l) => a + per(l), 0);
  const plus = x => Math.ceil(x * 1.1);
  if (c.joint === 'screws') {
    hw.push([plus(conn), c.mat === 'mdf' ? 'Konfirmat-Schrauben 7 × 50 mm' + ss : `Holzschrauben Senkkopf ${t <= 16 ? '4 × 40' : t >= 26 ? '5 × 60' : '4 × 50'} mm${ss}`, `${what}, +10 % Reserve`]);
    hw.push([plus(conn), 'Abdeckkappen (optional)', 'passend zur Holzfarbe']);
  } else if (c.joint === 'pocket') {
    hw.push([plus(conn), `Taschenlochschrauben ${t <= 16 ? '25' : t >= 26 ? '38' : '32'} mm, Grobgewinde${bath ? ', rostfrei beschichtet' : ''}`, c.mat === 'mdf' ? 'für MDF/Plattenwerkstoffe' : 'für Holz/Plattenwerkstoffe']);
    hw.push([1, glueName, 'optional für zusätzliche Festigkeit']);
  } else if (c.joint === 'dowels') {
    hw.push([plus(conn), `Holzdübel ${t <= 16 ? '6 × 30' : '8 × 40'} mm, geriffelt`, 'Buche, +10 % Reserve']);
    hw.push([1, glueName, '500 g reichen für mehrere Möbel']);
  } else {
    hw.push([plus(conn), 'Exzenterverbinder Ø 15 mm inkl. Verbindungsbolzen', `für ${t <= 19 ? '16–19' : '19–22'} mm Platten`]);
    hw.push([plus(conn), 'Holzdübel 8 × 30 mm', 'als Führung zwischen den Exzentern, ohne Leim (bleibt zerlegbar)']);
  }
  return hw;
}
// Bohrschritte für die Korpusverbindung (Sideboard und selbststehende Module). mittel = Mittelwände vorhanden,
// topOver = Deckel liegt auf den Seiten; between = was zwischen die Seiten kommt.
function jointSteps(c, t, { topOver = false, mittel = false, between = topOver ? 'den Boden' : 'Deckel und Boden' } = {}){
  const st = [], mdf = c.mat === 'mdf';
  if (c.joint === 'pocket') st.push(['Taschenlöcher bohren', `Bohrlehre auf ${t} mm Plattenstärke einstellen. Taschenlöcher an beiden Enden von ${between}${mittel ? ' und der Mittelwände' : ''} bohren, alle ca. 15 cm und 40 mm von vorne und hinten.${topOver ? ' Für den aufgesetzten Deckel die Taschenlöcher oben innen in die Seiten bohren.' : ''} Die Löcher kommen immer auf Innen- oder Unterseiten – beim Boden auf die Unterseite.`, null]);
  if (c.joint === 'screws') st.push(['Schraublöcher vorbohren', `Schraubpositionen anreissen: ${t/2} mm von der Plattenkante, alle ca. 15 cm, 40 mm von vorne und hinten. In ${topOver ? 'Deckel (von oben) und Seiten' : 'die Seiten'} Ø ${mdf ? '5' : '4'} mm durchbohren und ansenken. In die Stirnkante des Gegenstücks Ø ${mdf ? '5 mm mit Stufenbohrer (Konfirmat)' : '2,5–3 mm'} vorbohren.`, mdf ? 'MDF reisst ohne Vorbohren an den Kanten auf.' : 'Mittig in die Kante bohren – ein Anschlag an der Bohrmaschine hilft.']);
  if (c.joint === 'dowels') st.push(['Dübellöcher bohren', `Dübel alle ca. 12 cm setzen, 40 mm von vorne und hinten. Mit Dübellehre oder Dübelmarkierern die Positionen übertragen. In der Plattenfläche ${t <= 16 ? '10' : '12'} mm tief bohren (nie durch!), in der Stirnkante ${t <= 16 ? '20' : '28'} mm.`, 'Erst eine Probeverbindung mit Reststücken machen.']);
  if (c.joint === 'cam') st.push(['Bohrungen für Exzenter', `Exzentergehäuse Ø 15 mm mit dem Forstnerbohrer in die Innenseiten von ${between}${mittel ? ' und die Mittelwände' : ''} bohren, Tiefe und Randabstand gemäss Hersteller (meist 12,5 mm tief, 24 oder 34 mm von der Kante). Passende Löcher für die Bolzen in die Gegenstücke.`, 'Eine Bohrschablone spart viel Anreissen und Fehler.']);
  return st;
}

function jointTools(c, t, tools){
  if (c.joint === 'pocket') tools.add('Taschenloch-Bohrlehre mit Stufenbohrer');
  if (c.joint === 'screws') { tools.add('Kegelsenker'); if (c.mat === 'mdf') tools.add('Stufenbohrer für Konfirmat'); }
  if (c.joint === 'dowels') { tools.add('Dübellehre oder Dübelmarkierer Ø ' + (t <= 16 ? 6 : 8)); tools.add('Gummihammer'); }
  if (c.joint === 'cam') { tools.add('Forstnerbohrer Ø 15 mm'); tools.add('Bohrschablone für Exzenter (empfohlen)'); }
}

/* ---------- Guillotine-Packen ---------- */
function pack(items, SL, SB, kerf, margin, rotate){
  const UW = SL - 2*margin + kerf, UH = SB - 2*margin + kerf;
  const list = items.slice().sort((a, b) => b.L*b.B - a.L*a.B || Math.max(b.L, b.B) - Math.max(a.L, a.B));
  const sheets = [], unplaced = [];
  const fits = (it, w, h) => it.L + kerf <= w && it.B + kerf <= h;
  for (const it of list) {
    const canFitEmpty = fits(it, UW, UH) || (rotate && it.B + kerf <= UW && it.L + kerf <= UH);
    if (!canFitEmpty) { if (!unplaced.some(u => u.key === it.key)) unplaced.push(it); continue; }
    let placed = false;
    for (const sh of sheets) { if (place(sh, it)) { placed = true; break; } }
    if (!placed) { const sh = { free:[{ x:0, y:0, w:UW, h:UH }], parts:[] }; sheets.push(sh); place(sh, it); }
  }
  function place(sh, it){
    let best = null;
    for (let i = 0; i < sh.free.length; i++) {
      const f = sh.free[i];
      const opts = [[it.L + kerf, it.B + kerf, false]];
      if (rotate && it.L !== it.B) opts.push([it.B + kerf, it.L + kerf, true]);
      for (const [w, h, rot] of opts) {
        if (w <= f.w && h <= f.h) {
          const score = f.w*f.h - w*h;
          if (!best || score < best.score) best = { i, w, h, rot, score };
        }
      }
    }
    if (!best) return false;
    const f = sh.free.splice(best.i, 1)[0];
    sh.parts.push({ it, x: f.x + margin, y: f.y + margin, w: best.w - kerf, h: best.h - kerf, rot: best.rot });
    const lw = f.w - best.w, lh = f.h - best.h;
    let a, b;
    if (lw < lh) { a = { x:f.x + best.w, y:f.y, w:lw, h:best.h }; b = { x:f.x, y:f.y + best.h, w:f.w, h:lh }; }
    else { a = { x:f.x + best.w, y:f.y, w:lw, h:f.h }; b = { x:f.x, y:f.y + best.h, w:best.w, h:lh }; }
    for (const r of [a, b]) if (r.w > kerf && r.h > kerf) sh.free.push(r);
    return true;
  }
  const used = sheets.reduce((a, s) => a + s.parts.reduce((b, p) => b + p.w*p.h, 0), 0);
  const partArea = items.reduce((a, it) => a + it.L * it.B, 0);
  return { sheets, unplaced, used, partArea, total: sheets.length * SL * SB };
}

if (typeof module !== 'undefined') module.exports = { PRICE_DATA, clamp, r0, MATS, BACKS, COLORS, COLOR_NAMES, JOINTS, pack, jointHardware, jointSteps, jointTools, matPrice, sheetCosts, BOARD_SLACK, boardWidthFor, packBoards, SPAN, maxSpan, SCHRAUBEN, schraube, screwFor, screwText, screwKey };
