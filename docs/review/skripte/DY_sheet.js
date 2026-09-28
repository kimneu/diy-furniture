const { K, CFG } = require('./DY_cfg.js');
const R0 = K.computeData({ ...CFG.SB4, grain:false });
console.log('SB4 grain off: sheet', R0.groups[0].sheet, 'unplaced', R0.groups[0].unplaced.map(u=>u.pos+' '+u.L+'x'+u.B), R0.warn.filter(w=>/passt/.test(w)));
const R1 = K.computeData({ ...CFG.SB4, grain:false, sheetL:'3000', sheetB:'1500' });
console.log('SB4 grain off 3000x1500: sheet', R1.groups[0].sheet, 'unplaced', R1.groups[0].unplaced.length);
console.log('Birke catalog sheet', MATS.birke.sheet, 'withCatalog', K.withCatalog({ mat:'birke', t:'18' }).sheetL, K.withCatalog({ mat:'birke', t:'18' }).sheetB);
// which materials have sheet dims exceeding clamps
for (const [k,M] of Object.entries(MATS)) if (!M.boards && (M.sheet[0] > 3100 || M.sheet[1] > 2100)) console.log('clamped', k, M.sheet);
