const { K, FORM, sb, rd, hard } = require('./MX-verify-lib.js');
console.log('Birke sheet', MATS.birke.sheet, 'withCatalog', JSON.stringify((({sheetL,sheetB})=>({sheetL,sheetB}))(K.withCatalog({ ...FORM }))));
{ const { R } = sb({}); const g = R.groups[0];
  console.log('SB default groups[0].sheet', g.sheet, 'sheets', g.sheets.length, 'whole CHF', (g.sheets.length*g.sheet[0]*g.sheet[1]/1e6*g.price).toFixed(0), 'price', g.price);
  const items = []; for (const r of R.rows) if (r.group === g.label && r.kind !== 'back') for (let q=0;q<r.qty;q++) items.push(r);
  const p = pack(items, 1500, 3000, 4, 10, !(true && MATS.birke.grain));
  console.log('  pack 1500x3000 ->', p.sheets.length, 'Platten, CHF', (p.sheets.length*1.5*3*g.price).toFixed(0), 'unplaced', p.unplaced.length);
}
// Birke, Maserung frei: Teile > 2100 mm
for (const w of ['2000','2200','2400']) { const { R } = sb({ w, grain:false, sections:'3' }); console.log('SB birke grain off W', w, JSON.stringify(hard(R))); }
{ const { R } = rd({ mat:'birke', t:'18', grain:false, rw:'2400', shape:'I' }); console.log('RD birke grain off rw2400', JSON.stringify(R.warn)); }
{ const { R } = rd({ mat:'birke', t:'18', grain:false, rw:'2000', shape:'I' }); console.log('RD birke grain off rw2000', JSON.stringify(R.warn)); }
