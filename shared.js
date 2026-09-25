/* Gemeinsame Kataloge und reine Helfer (ohne DOM) – im Browser Globals, in Node per module.exports. */
'use strict';
const clamp = (v, a, b) => Math.min(b, Math.max(a, isFinite(v) ? v : a));
const r0 = v => Math.round(v);

/* ---------- Kataloge ---------- */
const MATS = {
  birke:  { name:'Multiplex Birke', short:'Birke-Multiplex', color:'#E2D3B6', ply:true,  grain:true,  t:[15,18,21], tDef:18, sheet:[2500,1250], price:55,
            note:'Sichtbare Schichtkanten sind der typisch skandinavische Look. Einfach ölen, Kanten nur schleifen.' },
  eiche:  { name:'Eiche Leimholz',  short:'Eiche-Leimholz',  color:'#C9A26D', ply:false, grain:true,  t:[18,20,26], tDef:20, sheet:[2400,600],  price:80,
            note:'Massivholz arbeitet leicht mit der Luftfeuchtigkeit. Leimholz gibt es meist bis 600 mm, teils 1200 mm breit.' },
  fichte: { name:'Fichte Leimholz', short:'Fichte-Leimholz', color:'#EAD6A8', ply:false, grain:true,  t:[18,28],    tDef:18, sheet:[2000,600],  price:30,
            note:'Günstig und leicht zu bearbeiten, aber weich. Weissöl verhindert das Nachdunkeln ins Gelbliche.' },
  seekiefer: { name:'Sperrholz Seekiefer', short:'Seekiefer-Sperrholz', color:'#D8B685', ply:true, grain:true, t:[15], tDef:15, sheet:[2500,1250], price:48,
            note:'Lebhafte, rötliche Maserung und sichtbare Schichtkanten. Günstiger als Birke, Oberfläche etwas rauer – gut schleifen.' },
  fichtesp: { name:'Sperrholz Fichte', short:'Fichte-Sperrholz', color:'#E6CF9E', ply:true, grain:true, t:[18], tDef:18, sheet:[2500,1250], price:65,
            note:'Helles Nadelholz mit sichtbaren Schichtkanten. Weicher als Birke, Weissöl hält den hellen Ton.' },
  mdf:    { name:'MDF',            short:'MDF',             color:'#E9E7E1', ply:false, grain:false, t:[16,19,22], tDef:19, sheet:[2800,2070], price:30,
            note:'Glatt und formstabil, ideal zum Lackieren. Schrauben in MDF-Kanten immer vorbohren.' }
};
const BACKS = {
  none: null,
  hdf3: { name:'HDF weiss', t:3, sheet:[2800,2070], price:10, color:'#F0EFEA', ply:false },
  ply6: { name:'Sperrholz Pappel', t:5, sheet:[2500,1250], price:24, color:'#E8D9B8', ply:true }
};
const COLORS = { weiss:'#EEEDE7', salbei:'#A7B39E', taube:'#8E9FAB', anthrazit:'#3E4447' };
const COLOR_NAMES = { weiss:'Kreideweiss', salbei:'Salbei', taube:'Taubenblau', anthrazit:'Anthrazit' };
const JOINTS = {
  pocket: { name:'Taschenloch', level:1 },
  screws: { name:'Verschraubt', level:1 },
  dowels: { name:'Holzdübel', level:2 },
  cam:    { name:'Exzenter', level:2 }
};

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

if (typeof module !== 'undefined') module.exports = { clamp, r0, MATS, BACKS, COLORS, COLOR_NAMES, JOINTS, pack, jointHardware, jointTools };
