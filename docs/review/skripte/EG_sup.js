// Auflager-Analyse: was liegt unter jedem Tablar (Oberkante = Tablar-Unterkante), mit Kontaktflächen
const { mk, ov, f } = require('./EG_lib.js');
const SHELF = new Set(['Tablar','Boden','Deckel','Einlegeboden']);
function supports(items, s){
  const out = [];
  for (const B of items) {
    if (B === s) continue;
    const ox = ov(s.x0, s.x1, B.x0, B.x1), oz = ov(s.z0, s.z1, B.z0, B.z1);
    if (ox <= 0.5 || oz <= 0.5) continue;
    if (Math.abs(B.y1 - s.y0) <= 0.6) out.push({ B, x0:Math.max(s.x0,B.x0), x1:Math.min(s.x1,B.x1), z0:Math.max(s.z0,B.z0), z1:Math.min(s.z1,B.z1) });
    else if (B.y0 < s.y1 - 0.5 && B.y1 > s.y0 + 0.5) out.push({ B, pierce:true, x0:Math.max(s.x0,B.x0), x1:Math.min(s.x1,B.x1), z0:Math.max(s.z0,B.z0), z1:Math.min(s.z1,B.z1) });
  }
  return out;
}
// Wangen/Seiten seitlich (Bodenträger): Fläche der Wange innerhalb 1.5 mm der Stirnkante
function sidePins(items, s){
  const out = [];
  for (const B of items) {
    if (!['Wange','Seite'].includes(B.name)) continue;
    if (!(B.y0 < s.y0 && B.y1 > s.y1)) continue;
    const gx = Math.max(B.x0 - s.x1, s.x0 - B.x1), gz = Math.max(B.z0 - s.z1, s.z0 - B.z1);
    const oz = ov(s.z0, s.z1, B.z0, B.z1), ox = ov(s.x0, s.x1, B.x0, B.x1);
    if (gx >= -0.5 && gx <= 1.5 && oz > 0.5) out.push({ B, side: B.x0 >= s.x1 - 0.5 ? '+x' : '-x', along:[Math.max(s.z0,B.z0), Math.min(s.z1,B.z1)] });
    if (gz >= -0.5 && gz <= 1.5 && ox > 0.5) out.push({ B, side: B.z0 >= s.z1 - 0.5 ? '+z' : '-z', along:[Math.max(s.x0,B.x0), Math.min(s.x1,B.x1)] });
  }
  return out;
}
function describe(items, s){
  const sup = supports(items, s), pins = sidePins(items, s);
  const lines = [];
  for (const q of sup) lines.push(`${q.pierce ? 'DURCH ' : ''}${q.B.name} x ${f(q.x0)}..${f(q.x1)} (${f(q.x1-q.x0)}) z ${f(q.z0)}..${f(q.z1)} (${f(q.z1-q.z0)})`);
  for (const p of pins) lines.push(`Stirn an ${p.B.name} ${p.side} über ${f(p.along[0])}..${f(p.along[1])}`);
  // Ecken: Abstand zur nächsten Auflagefläche (in der Ebene, Chebyshev)
  const corners = [[s.x0,s.z0],[s.x0,s.z1],[s.x1,s.z0],[s.x1,s.z1]];
  const cd = corners.map(([x,z]) => {
    let best = Infinity;
    for (const q of sup) if (!q.pierce) { const dx = Math.max(q.x0 - x, 0, x - q.x1), dz = Math.max(q.z0 - z, 0, z - q.z1); best = Math.min(best, Math.hypot(dx, dz)); }
    for (const p of pins) { // Bodenträger ca. 37 mm von Vorder-/Hinterkante
      const pts = p.side[1] === 'x' ? [[p.side[0]==='+'? s.x1 : s.x0, p.along[0]+37],[p.side[0]==='+'? s.x1 : s.x0, p.along[1]-37]] : [[p.along[0]+37, p.side[0]==='+'? s.z1 : s.z0],[p.along[1]-37, p.side[0]==='+'? s.z1 : s.z0]];
      for (const [px,pz] of pts) best = Math.min(best, Math.hypot(px-x, pz-z));
    }
    return f(best);
  });
  return { lines, cd, sup, pins };
}
module.exports = { supports, sidePins, describe, SHELF };
if (require.main === module) {
  const c = JSON.parse(process.argv[2] || '{}');
  const lvl = Number(process.env.Y || 150);
  const { R, items } = mk(c);
  for (const s of items.filter(i => SHELF.has(i.name) && Math.abs(i.y0 - lvl) < 1)) {
    const d = describe(items, s);
    console.log(`${s.name} ${s.pos} x ${f(s.x0)}..${f(s.x1)} z ${f(s.z0)}..${f(s.z1)} | Ecken (x0z0,x0z1,x1z0,x1z1) nächstes Auflager: ${d.cd.join(' / ')}`);
    for (const l of d.lines) console.log('    ', l);
  }
  console.log('WARN', R.warn.join(' || '));
}
