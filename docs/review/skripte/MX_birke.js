const { K, FORM } = require('./MX_lib.js');
for (const [w,h] of [[1200,720],[1800,880],[2000,720]]) {
  const R = K.computeData({ ...FORM, w:String(w), h:String(h), mat:'birke', t:'18', sheetL:'1500', sheetB:'3000', price:'88.95' });
  const g = R.groups[0]; const items = []; for (const r of R.rows) if (r.group === g.label && r.kind !== 'back') for (let q = 0; q < r.qty; q++) items.push(r);
  const real = pack(items, 1500, 3000, 4, 10, false);
  console.log(`${w}x${h}: App ${g.sheet.join('x')} → ${g.sheets.length} Platten, unplaced ${g.unplaced.length}, ganze Platten CHF ${sheetCosts([g]).whole.toFixed(0)} | real 1500x3000 → ${real.sheets.length} Platten, unplaced ${real.unplaced.length}, CHF ${(real.sheets.length*4.5*88.95).toFixed(0)}`);
}
