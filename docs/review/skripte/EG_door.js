const { mk, f } = require('./EG_lib.js');
// Türflügel nach innen: Band an der Laibung x = ∓doorW/2, Radius doorW, Blatt 40 mm; 90°-Lage und Schwenkbereich
function door(R, c){
  const W = R.W, D = R.D, dw = c.doorW || 800, sgn = c.hinge === 'R' ? 1 : -1;
  const hx = sgn * dw / 2, hz = D / 2 - 40;
  const shelves = R.boxes.filter(b => true).map(b => ({ x0:b.pos[0]-b.size[0]/2, x1:b.pos[0]+b.size[0]/2, z0:b.pos[2]-b.size[2]/2, z1:b.pos[2]+b.size[2]/2 }));
  // max. Öffnungswinkel bis zur ersten Berührung (Blattkante als Strecke, 1°-Schritte)
  let maxA = 0;
  for (let a = 1; a <= 120; a++) {
    const r = a * Math.PI / 180, ux = -sgn * Math.cos(r) * 0 + (sgn < 0 ? Math.cos(r) : -Math.cos(r)), uz = -Math.sin(r);
    let hit = false;
    for (let s = 0; s <= dw; s += 10) { const x = hx + ux * s, z = hz + uz * s; if (shelves.some(b => x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1)) { hit = true; break; } }
    if (hit) break; maxA = a;
  }
  return maxA;
}
for (const over of [
  { shape:'U', doorIn:true, hinge:'L' },
  { shape:'U', doorIn:true, hinge:'R' },
  { shape:'U', doorIn:false },
  { shape:'U', doorIn:true, hinge:'L', rd:1000 },
  { shape:'I', doorIn:true, hinge:'L', rd:1000 },
  { shape:'U', doorIn:true, hinge:'L', rd:1100, dBack:400 },
  { shape:'L', corner:'L', doorIn:true, hinge:'L', rd:1200 },
]) {
  const { R, c } = mk({ sys:'battens', ...over });
  const segs = layoutReduit(normReduit(c).cfg).segs.map(s => `${s.id} ${s.u0}..${s.u1} ${s.ends.join('/')}`);
  const lefts = R.rows.filter(r => r.name === 'Tablar').map(r => `${r.qty}× ${r.L}×${r.B}`);
  console.log(JSON.stringify(over), '| Segmente', segs.join('; '), '| Tablare', lefts.join(', '), '| Tür öffnet bis', door(R, c), '°');
  const w = R.warn.filter(w => /Tür|entfällt/.test(w)); if (w.length) console.log('   WARN', w.join(' || '));
}
