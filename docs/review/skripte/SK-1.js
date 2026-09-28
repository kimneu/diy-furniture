const { run, K } = require('./SK-base.js');
// Materialien und Stärken
for (const [k, M] of Object.entries(MATS)) if (!M.boards) console.log(k, M.name, 't=', M.t.join('/'), 'sheet', M.sheet.join('x'), 'SPAN', JSON.stringify(SPAN[k]));
// H10 Spannweite
console.log('\n--- H10 Einlegeboden-Spannweite');
for (const [mat, t] of [['mdf',19],['dekorspan',19],['dekorspan',16],['mdf',16],['fichte',18],['osb',18],['osb',12],['birke',12],['birke',18],['dreischicht',19],['fichtesp',15],['seekiefer',12]]) {
  for (const W of [1400, 1600, 1700]) {
    const R = run({ mat, t, W, sections:2, shelves:1 });
    const shelf = R.rows.find(r => r.name === 'Einlegeboden');
    const w = R.warn.filter(x => x.includes('Einlegeböden'));
    console.log(mat, t, 'W', W, 's=', R.s.toFixed(1), 'shelf', shelf.L, '×', shelf.B, 'SPAN(reduit)=', maxSpan(mat, t), 'warn:', w.length ? 'JA' : 'nein');
  }
}
