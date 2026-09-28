const { K, CFG, FORM } = require('./DY_cfg.js');
function ffd(lens, L, kerf=4){ const bins=[]; for (const l of lens.slice().sort((a,b)=>b-a)) { if (l > L) return null; const b = bins.find(b=>b+kerf+l<=L); if (b!=null) bins[bins.indexOf(b)] += kerf+l; else bins.push(l);} return bins.length; }
for (const k of ['RD7','RD6']) {
  const R = K.computeData(CFG[k]);
  const lat = [], kh = [];
  for (const r of R.rows) if (r.kind==='solid') for (let i=0;i<r.qty;i++) (/Kantholz/.test(r.name)?kh:lat).push(r.L);
  const m = lat.reduce((a,b)=>a+b,0)/1000;
  const n = ffd(lat, 2000), nk = ffd(kh, 2500);
  console.log(k, 'Latten', lat.length, 'Stück,', m.toFixed(2), 'm → FFD', n, '× 2 m Latte = CHF', (n*2.4).toFixed(2), '| Rechnung per m CHF', (m*1.2).toFixed(2), '| Kantholz', kh.length, '→', nk, '× 2.5 m = CHF', (nk*10.95).toFixed(2), 'per m CHF', (kh.reduce((a,b)=>a+b,0)/1000*4.4).toFixed(2));
  console.log('  solidCost', R.solidCost.toFixed(2));
}
