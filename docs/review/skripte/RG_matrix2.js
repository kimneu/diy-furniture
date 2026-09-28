const { K, FORM } = require('./RG_lib.js');
const { sperren } = require('./RG_regeln.js');
const plates = Object.entries(MATS).filter(([, M]) => !M.boards);
for (const dBack of ['300', '400']) {
  let rt = 0, rok = 0, rb = 0; const rwhy = {};
  for (const [mat, M] of plates) for (const t of M.t) for (const sys of ['battens', 'rails', 'brackets', 'cheeks', 'posts'])
  for (const shape of ['I', 'L', 'U']) for (const wall of ['solid', 'drywall']) {
    const d = { ...K.withCatalog({ ...FORM, kind:'reduit', mat, t:String(t) }), t, build:'built', sys, shape, wall, grain:false, dBack };
    rt++;
    const hard = K.computeData(d).warn.filter(w => !K.HARMLOS.test(w));
    if (hard.length) continue;
    rok++;
    const s = sperren(d).filter(x => !/^S18 /.test(x));
    if (s.length) { rb++; for (const x of s) { const id = x.split(' ')[0]; rwhy[id] = (rwhy[id] || 0) + 1; } }
  }
  console.log('Reduit eingebaut dBack', dBack, { tot:rt, ohneHarteWarnung: rok, davonGesperrtOhneS18: rb, why: rwhy });
}
