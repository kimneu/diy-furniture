/* Gemeinsame Kataloge und reine Helfer (ohne DOM) – im Browser Globals, in Node per module.exports. */
'use strict';
const clamp = (v, a, b) => Math.min(b, Math.max(a, isFinite(v) ? v : a));
const r0 = v => Math.round(v);

/* ---------- Kataloge ---------- */
// Preise, Stärken und Plattenformate stehen in preise.js (im Browser vorher geladen, in Node per require).
// Birke-Platte 1500 × 3000 mit Maserung über die 1500er-Seite.
const PRICE_DATA = typeof PREISE !== 'undefined' ? PREISE : require('./preise.js');
const MAT_INFO = {
  birke:  { name:'Multiplex Birke Premium', short:'Birke-Multiplex', color:'#E2D3B6', ply:true,  grain:true,  tDef:18,
            note:'Sichtbare Schichtkanten sind der typisch skandinavische Look. Fast fehlerfreie Sichtseite. Einfach ölen, Kanten nur schleifen.' },
  birkesi: { name:'Multiplex Birke Standard', short:'Birke-Multiplex', color:'#E2D3B6', ply:true, grain:true, tDef:18,
            note:'Gleicher Look wie Premium, aber einfachere Sichtseite mit kleinen Ästen und Ausbesserungen – rund ein Drittel günstiger.' },
  eiche:  { name:'Eiche Leimholz',  short:'Eiche-Leimholz',  color:'#C9A26D', ply:false, grain:true,  tDef:18,
            note:'Massivholz arbeitet leicht mit der Luftfeuchtigkeit. Qualität B/C: lebendige Oberfläche mit einzelnen Ästen.' },
  fichte: { name:'Fichte Leimholz', short:'Fichte-Leimholz', color:'#EAD6A8', ply:false, grain:true,  tDef:18,
            note:'Günstig und leicht zu bearbeiten, aber weich. Weissöl verhindert das Nachdunkeln ins Gelbliche.' },
  seekiefer: { name:'Sperrholz Seekiefer', short:'Seekiefer-Sperrholz', color:'#D8B685', ply:true, grain:true, tDef:15,
            note:'Lebhafte, rötliche Maserung und sichtbare Schichtkanten. Günstiger als Birke, Oberfläche etwas rauer – gut schleifen.' },
  fichtesp: { name:'Sperrholz Fichte', short:'Fichte-Sperrholz', color:'#E6CF9E', ply:true, grain:true, tDef:18,
            note:'Helles Nadelholz mit sichtbaren Schichtkanten. Weicher als Birke, Weissöl hält den hellen Ton.' },
  mdf:    { name:'MDF',            short:'MDF',             color:'#E9E7E1', ply:false, grain:false, tDef:19,
            note:'Glatt und formstabil, ideal zum Lackieren. Schrauben in MDF-Kanten immer vorbohren.' },
  // Günstige, robuste Platten – gut für Reduit, Keller und Werkstatt. coated = fertige Beschichtung, nicht ölen.
  schaltafel: { name:'Schaltafel 3-Schicht', short:'Schaltafel', color:'#E8C547', ply:true, grain:false, coated:true, tDef:27,
            note:'Die gelbe Platte von der Baustelle: sehr robust und wasserfest, die Oberfläche ist schon fertig. Gibt es nur 50 cm breit – tiefere Teile passen nicht darauf. Die Schnittkanten einmal lackieren oder ölen.' },
  osb:    { name:'OSB-Platte', short:'OSB', color:'#CFAE78', ply:false, grain:false, tDef:18,
            note:'Aus grossen, gepressten Holzspänen – sieht rustikal aus, wie in einer Werkstatt. Stabil und robust. Kanten gut schleifen, dann ölen oder roh lassen.' },
  dreischicht: { name:'Dreischichtplatte Fichte', short:'Dreischicht-Fichte', color:'#E6CF9E', ply:true, grain:true, tDef:19,
            note:'Drei verleimte Holzschichten: sieht aus wie Massivholz, verzieht sich aber kaum. Fichte ist weich und bekommt schnell Dellen – Weissöl hält den hellen Ton.' },
  dekorspan: { name:'Spanplatte weiss beschichtet', short:'Dekorspan weiss', color:'#F1F0EB', ply:false, grain:false, coated:true, tDef:19,
            note:'Weiss beschichtet wie bei Fertigmöbeln – fertig, kein Streichen nötig. An den Schnittkanten sieht man die Spanplatte: mit weissem Kantenband überbügeln. Hängt als Tablar schneller durch als Sperrholz.' }
};
const BACK_INFO = {
  hdf3: { name:'MDF weiss beschichtet', t:3, color:'#F0EFEA', ply:false },
  hf3:  { name:'Hartfaser roh', t:3, color:'#9C7A55', ply:false },
  ply6: { name:'Sperrholz Pappel', t:5, color:'#E8D9B8', ply:true }
};
// Stärken = Stärken mit Preis; ohne Preis fällt ein Material weg. price = Preis der Standardstärke (für die Sortierung).
const MATS = Object.fromEntries(Object.entries(MAT_INFO).filter(([k]) => PRICE_DATA.platten[k]).map(([k, M]) => {
  const { prices, sheet } = PRICE_DATA.platten[k], t = Object.keys(prices).map(Number).sort((a, b) => a - b);
  const tDef = t.includes(M.tDef) ? M.tDef : t[0];
  return [k, { ...M, t, tDef, sheet, price:prices[tDef], prices }];
}));
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
// Holzkosten zweier Einkaufsarten: Zuschnitt (nur Teilefläche) oder ganze Platten.
function sheetCosts(groups){
  return {
    cut: groups.reduce((a, g) => a + g.partArea / 1e6 * g.price, 0),
    whole: groups.reduce((a, g) => a + g.sheets.length * g.sheet[0] * g.sheet[1] / 1e6 * g.price, 0)
  };
}

/* ---------- Verbindungen ---------- */
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

if (typeof module !== 'undefined') module.exports = { PRICE_DATA, clamp, r0, MATS, BACKS, COLORS, COLOR_NAMES, JOINTS, pack, jointHardware, jointTools, matPrice, sheetCosts };
