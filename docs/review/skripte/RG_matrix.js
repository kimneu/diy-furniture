const { K, FORM } = require('./RG_lib.js');
const { sperren } = require('./RG_regeln.js');
const plates = Object.entries(MATS).filter(([, M]) => !M.boards);
let tot = 0, ok = 0, okBlocked = 0; const why = {};
for (const [mat, M] of plates) for (const t of M.t) for (const joint of ['pocket', 'screws', 'dowels', 'cam'])
for (const front of ['open', 'hinged', 'sliding']) for (const back of ['hdf3', 'ply6', 'none']) for (const room of ['living', 'bath']) {
  const d = { ...K.withCatalog({ ...FORM, mat, t:String(t) }), t, joint, front, back, room, handle: front === 'sliding' ? 'shell' : 'hole', top: joint === 'screws' ? 'between' : 'over', grain:true };
  tot++;
  const hard = K.computeData(d).warn.filter(w => !K.HARMLOS.test(w));
  if (hard.length) continue;
  ok++;
  const s = sperren(d);
  const s2 = s.filter(x => !/^S0?8 |^S12 /.test(x)); if (s2.length) { okBlocked++; for (const x of s2) { const id = x.split(' ')[0]; why[id] = (why[id] || 0) + 1; } }
}
console.log('Sideboard', { tot, ohneHarteWarnung: ok, davonGesperrt: okBlocked, why });
let rt = 0, rok = 0, rb = 0; const rwhy = {};
for (const [mat, M] of plates) for (const t of M.t) for (const build of ['built', 'free']) for (const sys of build === 'free' ? ['battens'] : ['battens', 'rails', 'brackets', 'cheeks', 'posts'])
for (const shape of ['I', 'L', 'U']) for (const wall of ['solid', 'drywall']) for (const back of build === 'free' ? ['hdf3', 'none'] : ['hdf3']) for (const joint of build === 'free' ? ['pocket', 'screws', 'dowels', 'cam'] : ['pocket']) {
  const d = { ...K.withCatalog({ ...FORM, kind:'reduit', mat, t:String(t) }), t, build, sys, shape, wall, back, joint, grain:false, dBack:'300' };
  rt++;
  const hard = K.computeData(d).warn.filter(w => !K.HARMLOS.test(w));
  if (hard.length) continue;
  rok++;
  const s = sperren(d);
  if (s.length) { rb++; for (const x of s) { const id = x.split(' ')[0]; rwhy[id] = (rwhy[id] || 0) + 1; } }
}
console.log('Reduit (dBack 300, Raum 1600×1400×2400)', { tot:rt, ohneHarteWarnung: rok, davonGesperrt: rb, why: rwhy });
