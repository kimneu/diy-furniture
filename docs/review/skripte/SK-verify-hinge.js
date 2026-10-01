const { run, K, FORM } = require('./SK-verify-lib.js');
for (const [mat,t] of [['mdf',22],['fichte',21],['fichte',27],['dreischicht',27],['eiche',27]]) {
  const R = run({mat, t, W:1600, sections:2, doorsPer:'1'});
  const d = R.doors; const tf = R.tf;
  const outer = t - ((d[0].cx - d[0].dw/2) - (-R.W/2));
  const mid = (t - ((d[1].cx - d[1].dw/2) - (d[0].cx + d[0].dw/2)))/2;
  console.log(mat, t, 'Türen', tf, 'mm', d.map(x=>x.side), 'Überschlag aussen', outer.toFixed(1), 'an Mittelwand', mid.toFixed(1), '| hw', R.hw.filter(h=>/Topf/.test(h[1])).map(h=>h[0]+'× '+h[1]), '| warn', R.warn);
}
function seeded(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = seeded(13); let c=0;
for (let i=0;i<1000;i++){ const d=K.zufall({...FORM}, rnd); if (d.front==='hinged' && Number(d.t) >= 21) c++; }
console.log('Zufall Drehtüren bei t >= 21:', c, 'von 1000');
