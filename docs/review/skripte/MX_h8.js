const { K, FORM, run, hard, lcg } = require('./MX_lib.js');
const RF = { ...FORM, kind:'reduit', build:'built', sys:'battens' };
for (const [mat, t] of [['birke',18],['eiche',18],['dreischicht',19],['osb',18],['dekorspan',19],['seekiefer',12],['mdf',19],['gon_fichte',18]]) {
  const R = run({ ...RF, mat, t:String(t), shape:'U' });
  const strips = R.rows.filter(r => r.name === 'Leiste');
  const m = strips.reduce((a, r) => a + r.qty * r.L, 0) / 1000;
  const price = MATS[mat].boards ? null : matPrice(MATS[mat], t);
  const cost = price == null ? null : strips.reduce((a, r) => a + r.qty * r.L * r.B / 1e6, 0) * price;
  // Auflage: Tablar-Box hinten vs. Wandleiste (v-Richtung) und Endleiste
  const back = R.boxes.filter(b => Math.abs(b.pos[2] - (-R.D/2)) < 600);
  const tab = R.boxes.find(b => R.rows.find(r => r.key === b.key && r.name === 'Tablar') && b.size[0] > 1000);
  const lst = R.boxes.find(b => R.rows.find(r => r.key === b.key && r.name === 'Leiste') && b.size[0] > 1000);
  const tz0 = tab.pos[2] - tab.size[2]/2, lz1 = lst.pos[2] + lst.size[2]/2;
  const tx0 = tab.pos[0] - tab.size[0]/2;
  const end = R.boxes.filter(b => R.rows.find(r => r.key === b.key && r.name === 'Leiste' && r.note.includes('Endleiste'))).find(b => b.pos[0] < 0 && b.pos[2] < -R.D/2 + 500);
  const ex1 = end ? end.pos[0] + end.size[0]/2 : NaN;
  console.log(mat.padEnd(11), t, '| Leisten', strips.map(r => `${r.qty}× ${r.L}×${r.B}×${r.t} ${r.kind}`).join(', '));
  console.log('   ', `${m.toFixed(1)} m Leisten`, cost == null ? 'Dachlatte' : `aus Platte CHF ${cost.toFixed(2)} (= ${(cost/m).toFixed(2)}/m) vs Dachlatte 24×48 CHF ${(m*1.2).toFixed(2)}`,
    `| Auflage hinten ${(lz1 - tz0).toFixed(0)} mm (Tablar ab z=${(tz0 + R.D/2).toFixed(0)}, Leiste bis ${(lz1 + R.D/2).toFixed(0)}) | Endleiste: Tablar ab x=${(tx0 + R.W/2).toFixed(0)}, Endleiste bis ${(ex1 + R.W/2).toFixed(0)} → Auflage ${(ex1 - tx0).toFixed(0)} mm`);
}
// Leistenschrauben: werden für battens screw35 gekauft?
const R = run({ ...RF, mat:'birke', t:'18', shape:'I', rw:'800', doorW:'600' });
console.log('\nI-Form 800, Leisten, Birke 18 → hard:', hard(R), '\nhw:', R.hw.map(h => `${h[0]}× ${h[1]} (${h[2]})`).join(' | '));
console.log('Schritt:', R.steps.find(s => s[0] === 'Tablare auflegen'));
