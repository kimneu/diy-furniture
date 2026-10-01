const p=require('path').join(__dirname, '../../..') + '/';
const { run } = require('./TR_base.js');
const R0 = require(p+'reduit.js');
for (const [mat, t, price, sL, sB] of [['birke',18,88.95,3000,1500],['eiche',18,109,2500,1200],['osb',18,29.95,2770,2070],['dekorspan',19,27.5,2800,2070]]) {
  const R = run({ shape:'U', sys:'battens', build:'built', mat, t, price, sheetL:sL, sheetB:sB });
  const strips = R.rows.filter(r => r.kind === 'korpus' && r.B === 40);
  const len = strips.reduce((a, r) => a + r.qty * r.L, 0) / 1000;
  const area = strips.reduce((a, r) => a + r.qty * r.L * r.B, 0) / 1e6;
  const cuts = strips.reduce((a, r) => a + r.qty, 0);
  console.log(`${mat} ${t}: ${cuts} Streifen 40 mm, ${len.toFixed(1)} m, ${area.toFixed(2)} m² → CHF ${(area*price).toFixed(2)} (Zuschnittpreis) vs Dachlatte 24×48: CHF ${(len*1.2).toFixed(2)}; Auflage Tablar ${t-3} mm`);
}
// Fichte-SPAN: was kostet der tiefe Richtwert? (nur im Speicher geändert)
function tally(o){ const R = run({ build:'built', ...o }); const n = k => R.rows.filter(r => r.name === k).reduce((a, r) => a + r.qty, 0);
  return { wangen:n('Wange'), pfosten:n('Kantholz 45 × 45'), schienen:R.hw.filter(h=>h[1].startsWith('Wandschiene')).reduce((a,h)=>a+h[0],0), winkel:R.hw.filter(h=>h[1].startsWith('Blech')).reduce((a,h)=>a+h[0],0), buy:R.buyCost.toFixed(0), warn:R.warn.filter(w=>/frei|biegen/.test(w)).length } }
const F = { mat:'fichte', t:18, price:59.95, sheetL:2500, sheetB:1210 };
for (const [label, o] of [['U Wangen', { shape:'U', sys:'cheeks' }], ['U Schienen', { shape:'U', sys:'rails' }], ['U Pfosten', { shape:'U', sys:'posts' }], ['I 1000 Leisten', { shape:'I', rw:1000, rd:1000, doorW:700, sys:'battens' }], ['I 800 Leisten', { shape:'I', rw:800, rd:1000, doorW:600, sys:'battens' }], ['U Winkel', { shape:'U', sys:'brackets', dBack:300 }]]) {
  const a = tally({ ...F, ...o }); R0.SPAN.fichte[18] = 850; const b = tally({ ...F, ...o }); R0.SPAN.fichte[18] = 600;
  console.log('Fichte 18', label, '| SPAN 600:', JSON.stringify(a), '| SPAN 850:', JSON.stringify(b));
}
