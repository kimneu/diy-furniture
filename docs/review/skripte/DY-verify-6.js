const { RD, SB, dump, bb, E } = require('./DY-verify-lib.js');
function ffd(lens, L, kerf=4){ const bins=[]; for (const l of lens.slice().sort((a,b)=>b-a)) { if (l > L) return 'zu lang '+l; let i = bins.findIndex(b=>b+kerf+l<=L); if (i>=0) bins[i]+=kerf+l; else bins.push(l);} return bins.length; }
console.log('=== DY-12');
const cfgs = { RD7:{ sys:'posts', mat:'osb', t:18, price:29.95, sheetL:2770, sheetB:2070 },
  posts2400:{ sys:'posts', rw:2400 }, posts3000:{ sys:'posts', rw:3000, rh:3000, gapTop:100, rd:1400 }, battensGon2400:{ sys:'battens', mat:'gon_fichte', t:18, rw:2400 } };
for (const [k,o] of Object.entries(cfgs)) {
  const R = RD(o);
  const lat=[], kh=[]; for (const r of R.rows) if (r.kind==='solid') for (let i=0;i<r.qty;i++) (/Kantholz/.test(r.name)?kh:lat).push(r.L);
  const m = lat.reduce((a,b)=>a+b,0)/1000;
  console.log(k, 'Latten', lat.length, m.toFixed(1),'m → 2m-Latten', ffd(lat,2000), '| max Latte', Math.max(...lat), '| Kantholz', kh.length, kh.length? 'max '+Math.max(...kh)+' → 2.5m '+ffd(kh,2500):'', '| solidCost', R.solidCost.toFixed(2));
  console.log('   warn lang?', R.warn.filter(w=>/Latte|Kantholz|länger/.test(w)));
  const L = E.einkaufsliste(R); const s = L.find(x=>x.titel==='Massivholz Fichte'); if (s) console.log('   Einkauf:', s.zeilen.slice(0,3).map(z=>z.text).join(' / '));
}
console.log('=== DY-13');
const R6 = RD({ sys:'rails', mat:'gon_fichte', t:18, shape:'L', corner:'L' });
for (const s of E.einkaufsliste(R6)) if (/Bretter|Beschläge/.test(s.titel)) console.log(s.titel, '::', s.zeilen.slice(0,3).map(z=>z.text+' ('+z.sub+')').join(' / '));
console.log('buyCost', R6.buyCost.toFixed(2), 'boards cost', R6.groups[0].sheets.reduce((a,s)=>a+s.price,0));
