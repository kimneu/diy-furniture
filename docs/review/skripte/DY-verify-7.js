const { RD, SB, dump, bb, E, K, FORM } = require('./DY-verify-lib.js');
const P = require(require('path').join(__dirname, '../../..') + '/preise.js');
console.log('birke sheet', P.platten.birke.sheet, 'birkesi', P.platten.birkesi.sheet, 'MATS.birke.sheet', MATS.birke.sheet);
const d0 = K.withCatalog({ ...FORM }); console.log('withCatalog sheetL/B', d0.sheetL, d0.sheetB);
const R0 = K.computeData(d0);
const whole = g => g.sheets.length * g.sheet[0]*g.sheet[1]/1e6*g.price;
console.log('Standard-SB: group sheet', R0.groups[0].sheet, 'sheets', R0.groups[0].sheets.length, 'whole CHF', whole(R0.groups[0]).toFixed(0), sheetCosts(R0.groups));
const c = K.cfgFromData(d0); c.sheetB = 3000; // bypass clamp? clamp applies inside; emulate by patching
// Emulate unclamped: pack directly
const items = []; for (const r of R0.rows) for (let q=0;q<r.qty;q++) if (r.group === R0.groups[0].label && r.kind!=='back') items.push(r);
const pk = pack(items, 1500, 3000, 4, 10, false); console.log('pack 1500x3000 grain on: sheets', pk.sheets.length, 'unplaced', pk.unplaced.length, 'whole CHF', (pk.sheets.length*4.5*88.95).toFixed(0));
const pk2 = pack(items, 1500, 2100, 4, 10, false); console.log('pack 1500x2100: sheets', pk2.sheets.length, 'unplaced', pk2.unplaced.length);
console.log('Einkauf info:', E.einkaufsliste(R0).find(s=>/Zuschnitt/.test(s.titel)).info);
// Lowboard 2200
const RL = SB({ w:'2200', h:'500', d:'420', sections:'3', shelves:'0', grain:false });
console.log('Lowboard 2200 birke grain off: warn', RL.warn.filter(w=>/passt nicht/.test(w)));
const RLb = SB({ w:'2200', h:'500', d:'420', sections:'3', shelves:'0', grain:false, mat:'birkesi', t:'18' });
console.log('Lowboard 2200 birkesi: warn', RLb.warn.filter(w=>/passt nicht/.test(w)));
// Reduit cheeks + free in birke
for (const o of [{ sys:'cheeks', sheetL:1500, sheetB:3000, grain:false }, { build:'free', sheetL:1500, sheetB:3000, grain:false }, { build:'free', sheetL:1500, sheetB:3000, grain:true }]) {
  const R = RD(o); console.log(JSON.stringify(o), R.warn.filter(w=>/passt nicht/.test(w)).slice(0,2), 'sheet', R.groups[0].sheet);
}
