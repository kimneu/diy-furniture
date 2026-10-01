const { K, BASE, run } = require('./RM_lib.js');
for (const sys of ['battens','rails','posts']) {
  const R = run({ shape:'U', doorIn:true, hinge:'L', sys });
  console.log('==', sys, 'warn', R.warn.length);
  R.rows.filter(r => r.L <= 300 || /freien|Stütze/.test(r.note)).forEach(r=>console.log(' ', r.pos, r.qty, r.name, r.L, '×', r.B, '×', r.t, '|', r.note));
  const lay = layoutReduit(normReduit({ ...BASE, shape:'U', doorIn:true, hinge:'L', sys }).cfg);
  console.log('  Segment links', lay.segs.find(s=>s.id==='left'));
}
// Schienen bei Gipskarton: Positionen gleich wie bei Beton?
for (const wall of ['solid','drywall']) {
  const R = run({ shape:'I', sys:'rails', wall });
  const xs = [...new Set(R.extras.filter(e=>e.type==='metal' && e.size[1] > 500).map(e=>Math.round(e.pos[0] + R.W/2)))];
  console.log(wall, 'Schienen ab linker Wand (Mitte):', xs.join(', '), 'mm', '| Dübel:', R.hw.filter(h=>/Dübel/.test(h[1])).map(h=>h[0]+' '+h[1]).join());
}
// Nische: angezeigte vs tatsächliche lichte Höhe
for (const o of [{ nicheL:true, nicheLH:1300 }, { nicheL:true, nicheLH:1300, nShelves:8 }, { nicheL:true, nicheLH:1100 }]) {
  const R = run({ shape:'U', sys:'battens', ...o }); const n = normReduit({ ...BASE, shape:'U', ...o }).cfg;
  const lv = shelfLevels(n.nShelves, n.gapBottom, n.gapTop, n.rh);
  const first = lv.find(y => y >= n.nicheLH);
  const nb = R.extras.find(e=>e.type==='niche');
  console.log(JSON.stringify(o), 'lichte Höhe unter erstem durchlaufendem Tablar:', first, 'mm; 3D-Nische bis', Math.round(nb.pos[1]+nb.size[1]/2), 'mm; Nischentiefe', n.dLeft);
}
