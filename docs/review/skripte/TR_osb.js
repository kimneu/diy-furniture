const { run } = require('./TR_base.js');
const p=require('path').join(__dirname, '../../..') + '/';
for (const [mat, t, sL, sB] of [['osb',18,2770,2070],['mdf',19,2800,2070],['birke',18,1500,3000],['birke',18,3000,1500]]) {
  for (const grain of [true, false]) {
    const R = run({ shape:'U', sys:'rails', build:'built', mat, t, sheetL:sL, sheetB:sB, grain });
    const g = R.groups[0];
    let rot = 0, tot = 0;
    for (const s of g.sheets) for (const q of s.parts) if (q.it.name === 'Tablar') { tot++; if (q.rot) rot++; }
    console.log(mat, t, `Platte ${sL}×${sB}`, 'grain', grain, '| Tablare', tot, 'davon quer (rot)', rot, '| nicht platziert', g.unplaced.map(u => u.name + ' ' + u.L).join(', ') || '-', '| warn:', R.warn.filter(w=>w.includes('passt')).join(' / ') || '-');
  }
}
