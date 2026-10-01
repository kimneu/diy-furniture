const { K, FORM, run, hard, lcg } = require('./MX_lib.js');
const rnd = lcg(12345); const by = new Map(); let n = 0, worst = null;
const combos = new Map();
for (let i = 0; i < 400; i++) {
  const d = K.zufall({ ...FORM }, rnd); const R = K.computeData(d); const t = Number(d.t);
  combos.set(`${d.mat}/${t}/${d.joint}`, (combos.get(`${d.mat}/${t}/${d.joint}`)||0)+1);
  if (Number(d.shelves) > 0 && R.s > maxSpan(d.mat, t)) { n++; by.set(`${d.mat}/${t}`, (by.get(`${d.mat}/${t}`)||0)+1); const r = R.s / maxSpan(d.mat, t); if (!worst || r > worst.r) worst = { r, d, s:R.s }; }
}
console.log('SPAN überschritten:', n, [...by].map(([k,v])=>`${k}:${v}`).join(' '));
console.log('schlimmster:', worst.d.mat, worst.d.t, `${worst.d.w}x${worst.d.h}x${worst.d.d}`, 'sec', worst.d.sections, 'sh', worst.d.shelves, 's', Math.round(worst.s), 'SPAN', maxSpan(worst.d.mat, Number(worst.d.t)), 'Faktor', worst.r.toFixed(2));
console.log('Kombis Material/Stärke/Verbindung (Top 20 von', combos.size, '):', [...combos].sort((a,b)=>b[1]-a[1]).slice(0,20).map(([k,v])=>`${k}:${v}`).join(' '));
