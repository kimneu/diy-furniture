const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
const { run } = require('./TR_base.js');
// Welche Schrauben landen wo? Default-U je System, Birke 18
for (const sys of ['battens','rails','brackets','cheeks','posts']) {
  const R = run({ shape:'U', sys, build:'built' });
  console.log(sys.padEnd(9), R.hw.map(h => `${h[0]}× ${h[1]} (${h[2].replace(' · Preis geschätzt','')})`).join(' | '));
}
console.log('\nEindringtiefe Schraube 4 × 35 ins Tablar (Rest bis Oberseite, negativ = Spitze ragt heraus)');
console.log('Material t | Eckleiste (Streifen dick) | durch Blech 2 mm (Konsole/Winkel) | durch Latte 24 (Stoss-/Eckleiste Brett)');
for (const [k, M] of Object.entries(MATS)) for (const t of M.t) {
  const strip = M.boards ? 24 : t;
  const e = 35 - strip, b = 35 - 2, l = 35 - 24;
  console.log(`${k} ${t} | Streifen ${strip}: ${e} mm ins Tablar, Rest ${t - e} | ${b} mm, Rest ${t - b} | ${l} mm, Rest ${t - l}`);
}
