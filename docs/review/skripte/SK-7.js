const { run } = require('./SK-base.js');
for (const mat of ['eiche', 'fichte']) for (const [W,H,D] of [[1200,720,400],[1800,800,450],[1000,1400,450]]) {
  const R = run({ mat, t:18, grain:false, W, H, D, sections:2 });
  const g = R.groups[0];
  const rot = []; for (const sh of g.sheets) for (const p of sh.parts) if (p.rot) rot.push(`${p.it.name} ${p.it.L}×${p.it.B}`);
  console.log(mat, W, H, D, 'rotate erlaubt:', g.rotate, '| gedrehte Teile (Maserung quer):', rot.join(', ') || '-', '| warn:', R.warn.filter(w=>/Massiv|Maserung|arbeitet/.test(w)));
}
