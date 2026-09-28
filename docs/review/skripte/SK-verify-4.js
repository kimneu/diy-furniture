const { run } = require('./SK-verify-lib.js');
for (const mat of ['eiche','fichte','birke']) {
  const R = run({mat, t:18, grain:false, W:1200, H:720, D:400, sections:2});
  const g = R.groups[0];
  const rot = g.sheets.flatMap(s=>s.parts).filter(p=>p.rot).map(p=>`${p.it.name} ${p.it.L}x${p.it.B}`);
  console.log(mat, 'rotate', g.rotate, 'gedreht:', rot, 'warn', R.warn);
}
const R = run({mat:'eiche', t:18, grain:true, W:1200, H:720, D:400, sections:2});
console.log('grain on: rotated', R.groups[0].sheets.flatMap(s=>s.parts).filter(p=>p.rot).length, R.warn);
console.log(R.steps[0][1]);
