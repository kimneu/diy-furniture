const { run, bb, nameOf, overlaps } = require('./EP_lib.js');
const mats = Object.keys(MATS);
const res = new Map(); let n=0;
for (const mat of mats) for (const t of MATS[mat].t) for (const sys of ['battens','rails','brackets','cheeks','posts']) for (const shape of ['L','U'])
 for (const [rw, rd, dBack, dLeft, dRight] of [[1600,1400,400,300,300],[2400,2000,300,400,400],[2000,1400,200,600,600],[1200,2500,600,200,200],[3000,1800,400,300,300]]) {
  const R = run({ mat, t, sys, shape, rw, rd, dBack, dLeft, dRight });
  n++;
  for (const o of overlaps(R)) {
    const A=o.a.split('|')[0].replace(/ \d+$/,''), B=o.b.split('|')[0].replace(/ \d+$/,'');
    if (!/Eck|Stoss/.test(A+B)) continue;
    const k = `${sys} | ${A} <> ${B}`;
    const e = res.get(k) || { n:0, ex:null }; e.n++; if (!e.ex) e.ex = `${mat} ${t} ${shape} ${rw}x${rd} d${dBack}/${dLeft}: ${o.a} <> ${o.b} ov ${o.ov}`; res.set(k, e);
  }
}
console.log('Konfigurationen', n);
for (const [k, e] of [...res].sort()) console.log(k.padEnd(60), e.n, '\n    z.B.', e.ex);
