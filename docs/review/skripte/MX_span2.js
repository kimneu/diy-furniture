const { K, FORM, run, hard } = require('./MX_lib.js');
for (const [mat,t,W,sec,sh] of [['dekorspan',16,2000,2,0],['dekorspan',16,1100,1,0],['mdf',16,2000,2,0],['osb',12,2400,2,0],['birke',18,2000,2,0]]) {
  const R = run({ ...FORM, mat, t:String(t), w:String(W), sections:String(sec), shelves:String(sh), front:'sliding', handle:'shell' });
  console.log(mat, t, 'W', W, 'sec', sec, 'sh', sh, '| Feld s', Math.round(R.s), '| SB-span', t<=16?700:t<=19?800:900, 'SPAN', maxSpan(mat,t), '|', hard(R).map(w=>w.slice(0,90)).join(' // ') || 'OK');
}
// Birke 1500x3000: Klemmung auf 2100
const d = { ...FORM, mat:'birke', t:'18' };
const R = K.computeData({ ...d, sheetL:'1500', sheetB:'3000', price:'88.95' });
const items = []; for (const r of R.rows) if (r.kind === 'korpus') for (let q = 0; q < r.qty; q++) items.push(r);
const a = pack(items, 1500, 2100, 4, 10, false), b = pack(items, 1500, 3000, 4, 10, false);
console.log('\nBirke Sideboard 1200x720: Platten bei 1500x2100:', a.sheets.length, `(${(a.sheets.length*1.5*2.1).toFixed(2)} m²)`, '| bei 1500x3000:', b.sheets.length, `(${(b.sheets.length*1.5*3).toFixed(2)} m²)`);
const g = R.groups[0]; console.log('App rechnet mit', g.sheet, 'ganze Platten', g.sheets.length, 'Kosten ganze Platten', sheetCosts([g]).whole.toFixed(2));
