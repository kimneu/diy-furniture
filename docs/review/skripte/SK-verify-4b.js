const { run } = require('./SK-verify-lib.js');
for (const mat of ['eiche','fichte']) for (const W of [1200, 1600, 2000]) {
  const M = MATS[mat];
  const R = run({mat, t:18, grain:false, W, H:720, D:400, sections:2, sheetL:M.sheet[0], sheetB:M.sheet[1], price:matPrice(M,18)});
  const g = R.groups[0];
  const rot = g.sheets.flatMap(s=>s.parts).filter(p=>p.rot).map(p=>`${p.it.name} ${p.it.L}x${p.it.B}`);
  console.log(mat, W, 'sheets', g.sheets.length, 'gedreht:', rot, 'warn', R.warn.length);
  const R2 = run({mat, t:18, grain:true, W, H:720, D:400, sections:2, sheetL:M.sheet[0], sheetB:M.sheet[1], price:matPrice(M,18)});
  console.log('   grain on sheets', R2.groups[0].sheets.length, R2.warn);
}
