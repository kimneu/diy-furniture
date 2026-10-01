const { mk, f } = require('./EG_lib.js');
const SYSS = ['battens','rails','brackets','cheeks','posts','free'];
const MATSEL = ['birke','gon_fichte','moebel_weiss','regalbau'];
const key = (it, m) => { const x0 = m ? -it.x1 : it.x0, x1 = m ? -it.x0 : it.x1; return [it.name, f(x0), f(x1), f(it.y0), f(it.y1), f(it.z0), f(it.z1)].join('|'); };
function ms(items, m){ const M = new Map(); for (const it of items) { const k = key(it, m); M.set(k, (M.get(k)||0)+1); } return M; }
function diff(A, B){ const out = []; for (const [k,v] of A) if ((B.get(k)||0) !== v) out.push('A:'+k+' x'+v+' vs '+(B.get(k)||0)); for (const [k,v] of B) if (!A.has(k)) out.push('B:'+k+' x'+v); return out; }
let bad = 0, tot = 0;
for (const sys of SYSS) for (const mat of MATSEL) {
  const b = sys === 'free' ? { build:'free' } : { build:'built', sys };
  const pairs = [
    [{ shape:'L', corner:'L' }, { shape:'L', corner:'R' }],
    [{ shape:'L', corner:'L', doorIn:true, hinge:'L' }, { shape:'L', corner:'R', doorIn:true, hinge:'R' }],
    [{ shape:'L', corner:'L', nicheL:true }, { shape:'L', corner:'R', nicheR:true }],
    [{ shape:'U', doorIn:true, hinge:'L' }, { shape:'U', doorIn:true, hinge:'R' }],
    [{ shape:'U', nicheL:true }, { shape:'U', nicheR:true }],
    [{ shape:'U', nicheL:true, doorIn:true, hinge:'R' }, { shape:'U', nicheR:true, doorIn:true, hinge:'L' }],
    [{ shape:'U' }, { shape:'U' }],
  ];
  for (const [a, bb] of pairs) {
    tot++;
    const A = mk({ ...b, mat, ...a }), B = mk({ ...b, mat, ...bb });
    const d = diff(ms(A.items, false), ms(B.items, true));
    // hw/rows compare
    const rowsA = A.R.rows.map(r => [r.name, r.L, r.B, r.t, r.qty].join('|')).sort().join(';');
    const rowsB = B.R.rows.map(r => [r.name, r.L, r.B, r.t, r.qty].join('|')).sort().join(';');
    const hwA = A.R.hw.map(h => h.slice(0,2).join('|')).sort().join(';'), hwB = B.R.hw.map(h => h.slice(0,2).join('|')).sort().join(';');
    if (d.length || rowsA !== rowsB || hwA !== hwB) { bad++; console.log(sys, mat, JSON.stringify(a), 'vs', JSON.stringify(bb), 'boxdiff', d.length, 'rows', rowsA === rowsB, 'hw', hwA === hwB); d.slice(0,6).forEach(x => console.log('   ', x)); }
  }
}
console.log('Paare', tot, 'abweichend', bad);
