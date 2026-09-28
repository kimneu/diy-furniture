const { mk, f } = require('./EG_lib.js');
for (const mat of ['birke','gon_fichte','moebel_weiss','regalbau']) for (const back of ['hdf3','none']) {
  const { R, items, c } = mk({ build:'free', shape:'U', mat, back });
  const n = normReduit(c).cfg, D = R.D;
  const rows = R.rows.filter(r => ['Seite','Boden','Deckel','Einlegeboden','Rückwand'].includes(r.name)).map(r => `${r.qty}× ${r.name} ${r.L}×${r.B}×${r.t}`);
  const seiteBack = R.rows.find(r => r.name === 'Seite');
  const sideSeite = items.filter(i => i.name === "Seite" && i.x1 <= -R.W/2 + n.dLeft + 0.5 && i.z0 >= -D/2 + n.dBack - 1).sort((a,b)=>a.z0-b.z0)[0];
  const bt = R.Bk ? R.Bk.t : 0;
  const front10 = 10 + bt + seiteBack.B, front0 = bt + seiteBack.B;   // hinteres Modul: Wandabstand 10 (geplant) bzw. 0
  const start = sideSeite.z0 + D/2;
  console.log(`${mat.padEnd(12)} ${back.padEnd(4)} dBack ${n.dBack} | Seite hinten Liste B ${seiteBack.B} (gezeichnet ${f(items.find(i=>i.name==='Seite').size[2])}) | hint. Modul vorne bei ${front10} (10 mm Wandluft) bzw. ${front0} (an der Wand); Seitenmodul beginnt ${f(start)} → ${front10 > start ? 'Überlappung ' + (front10 - start) : 'Luft ' + (start - front10)} / ${front0 > start ? 'Überlappung ' + (front0 - start) : 'Luft ' + (start - front0)}`);
  console.log('     ', rows.join(', '));
}
