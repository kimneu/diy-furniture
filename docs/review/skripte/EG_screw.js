const { mk, f } = require('./EG_lib.js');
const out = [];
for (const [mat, M] of Object.entries(MATS)) for (const t of M.t) {
  const { R, items } = mk({ sys:'battens', shape:'U', mat, t, price: M.prices ? M.prices[t] : 0 });
  const eck = R.rows.find(r => r.name === 'Eckleiste');
  if (!eck) continue;
  const strip = M.boards ? 24 : eck.t;       // Dachlatte 24 bei ganzen Brettern
  const drawn = items.find(i => i.name === 'Eckleiste');
  const pen = 35 - strip, rest = t - pen;
  out.push(`${mat.padEnd(12)} t ${String(t).padStart(2)} | Eckleiste Liste ${eck.L} × ${eck.B} × ${eck.t} (${eck.qty}×), gezeichnet ${f(drawn.size[0])}×${f(drawn.size[1])}×${f(drawn.size[2])} | 4×35 durch ${strip} → ${pen} mm ins Tablar, Rest ${rest} mm ${rest <= 0 ? 'DURCH' : rest < 5 ? 'knapp' : 'ok'}`);
}
console.log(out.join('\n'));
const { R } = mk({ sys:'battens', shape:'U' });
console.log(R.hw.filter(h => /4 × 35/.test(h[1])));
console.log(R.steps.find(s => s[0].includes('Eckstösse')));
for (const sys of ['rails','brackets']) { const X = mk({ sys, shape:'U' }).R; console.log(sys, X.hw.filter(h => /4 × 35/.test(h[1]))); }
