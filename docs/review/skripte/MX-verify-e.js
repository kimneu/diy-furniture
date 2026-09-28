const { K, FORM, sb, rd, hard } = require('./MX-verify-lib.js');
// E1 Konfirmat
for (const top of ['over','between']) { const { R } = sb({ mat:'mdf', t:'19', joint:'screws', top, color:'weiss' });
  console.log('E1', top, R.hw[0][1], '|', R.steps.find(s=>s[0]==='Schraublöcher vorbohren')[1]); console.log('   tools', R.tools.filter(t=>/Stufen|Kegel/.test(t))); }
{ const { R } = rd({ mat:'mdf', t:'19', build:'free', joint:'screws' }); console.log('E1 RD free mdf', R.hw[0][1], '| steps', R.steps.map(s=>s[0]).join(' > ')); }
// E2 Dübel + Schraube 4,5x50
for (const [mat,t,sys] of [['birke','18','posts'],['gon_fichte','18','battens'],['birke','18','battens'],['eiche','27','battens'],['birke','18','rails']]) {
  const { R } = rd({ mat, t, sys });
  const dw = R.hw.find(h=>/Spreizdübel/.test(h[1]));
  const wall = R.rows.filter(r=>/Wandlatte|Wandleiste/.test(r.note)).map(r=>`${r.name} ${r.B}×${r.t}`);
  const anb = sys==='posts' || MATS[mat].boards ? 24 : sys==='battens' ? Number(t) : 2;
  console.log('E2', mat, t, sys, dw && dw[0]+'× '+dw[1], '| Wandteil', [...new Set(wall)].join(','), '| Anbauteil', anb, 'mm → Schraube im Dübel', 50-anb, 'mm, nötig 30+4,5 = 34,5 → fehlt', (34.5-(50-anb)).toFixed(1));
}
// E3 Füsse/Sockel 4x16
for (const [mat,t] of [['seekiefer','12'],['seekiefer','15'],['dekorspan','16'],['birke','18']]) for (const base of ['legs','plinth']) {
  const { R } = sb({ mat, t, base, baseH: base==='legs'?'160':'80' });
  const s = R.hw.filter(h=>/4 × 16/.test(h[1])).map(h=>h[0]+'× '+h[1]+' – '+h[2]);
  const tip = R.steps.find(x=>/Füsse montieren/.test(x[0]));
  console.log('E3', mat, t, base, JSON.stringify(s), tip ? '| Tipp: '+tip[2] : '', '| Rest bei 2,5 mm Platte:', (Number(t) - (16-2.5)).toFixed(1));
}
// E4 free steps
{ const { R } = rd({ mat:'birke', t:'18', build:'free', joint:'dowels' }); console.log('E4 free dowels steps:', R.steps.map(s=>s[0]).join(' > ')); console.log('   Module bauen:', R.steps.find(s=>s[0]==='Module bauen')[1]); console.log('   hw', R.hw.slice(0,2).map(h=>h[0]+'× '+h[1])); }
// E5 Dreischicht Bad
{ const { R } = sb({ mat:'dreischicht', t:'19', room:'bath', back:'ply6' }); console.log('E5', R.warn.filter(w=>/EN 314/.test(w))); }
// posts 5x70
{ const { R } = rd({ mat:'birke', t:'18', sys:'posts' }); console.log('posts', R.hw.filter(h=>/5 × 70/.test(h[1])).map(h=>h[0]+'× '+h[1]+' – '+h[2]), 'Querlatte 24 + Pfosten 45 =', 69); }
