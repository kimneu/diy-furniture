const { K, FORM } = require('./RG_lib.js');
const { sperren } = require('./RG_regeln.js');
function lcg(seed){ let s = seed >>> 0; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; }
const tally = (o, ids) => { for (const i of ids) o[i] = (o[i] || 0) + 1; };
for (const [kind, seed] of [['sideboard', 12345], ['reduit', 987654]]) {
  const rnd = lcg(seed), cnt = {}; let bad = 0, badOhne17 = 0;
  for (let i = 0; i < 400; i++) { const s = sperren(K.zufall({ ...FORM, kind }, rnd)); if (s.length) bad++; if (s.filter(x => x !== 'S17').length) badOhne17++; tally(cnt, s); }
  console.log('Zufall', kind, { bad, badOhne17, cnt });
}
const plates = Object.entries(MATS).filter(([, M]) => !M.boards);
{ let tot = 0, ok = 0, b = 0; const why = {};
  for (const [mat, M] of plates) for (const t of M.t) for (const joint of ['pocket', 'screws', 'dowels', 'cam'])
  for (const front of ['open', 'hinged', 'sliding']) for (const back of ['hdf3', 'ply6', 'none']) for (const room of ['living', 'bath']) {
    const d = { ...K.withCatalog({ ...FORM, mat, t:String(t) }), t, joint, front, back, room, handle: front === 'sliding' ? 'shell' : 'hole', top: joint === 'screws' ? 'between' : 'over', grain:true };
    tot++;
    if (K.computeData(d).warn.some(w => !K.HARMLOS.test(w))) continue;
    ok++; const s = sperren(d); if (s.length) { b++; tally(why, s); }
  }
  console.log('Matrix Sideboard', { tot, ohneHarteWarnung: ok, davonGesperrt: b, why });
}
{ let tot = 0, ok = 0, b = 0; const why = {};
  for (const [mat, M] of plates) for (const t of M.t) for (const sys of ['battens', 'rails', 'brackets', 'cheeks', 'posts', 'FREE'])
  for (const shape of ['I', 'L', 'U']) for (const wall of ['solid', 'drywall']) {
    const free = sys === 'FREE';
    const d = { ...K.withCatalog({ ...FORM, kind:'reduit', mat, t:String(t) }), t, build: free ? 'free' : 'built', sys: free ? 'battens' : sys, shape, wall, grain:false, dBack:'300', joint:'pocket', back:'hdf3' };
    tot++;
    if (K.computeData(d).warn.some(w => !K.HARMLOS.test(w))) continue;
    ok++; const s = sperren(d).filter(x => x !== 'S17'); if (s.length) { b++; tally(why, s); }
  }
  console.log('Matrix Reduit (ohne S17)', { tot, ohneHarteWarnung: ok, davonGesperrt: b, why });
}
