const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
const base = { kind:'reduit', rw:1600, rd:1400, rh:2400, doorW:800, doorIn:false, hinge:'L', wall:'solid', mat:'birke', t:18, back:'hdf3', joint:'pocket', sheetL:1500, sheetB:3000, kerf:4, grain:'on', price:88.95,
  shape:'U', corner:'L', build:'built', sys:'battens', dBack:400, dLeft:300, dRight:300, nShelves:5, gapBottom:150, gapTop:300, nicheL:false, nicheLW:450, nicheLH:1300, nicheR:false, nicheRW:450, nicheRH:1300 };
const N = 300, cnt = {};
let softCheeks = 0, thinCorner = 0, postsNoCorner = 0, clean = 0, rails2 = 0;
for (let i = 0; i < N; i++) {
  const d = K.zufall(base, rnd, 60);
  const R = K.computeData(d);
  const warn = R.warn.filter(w => !K.HARMLOS.test(w));
  if (!warn.length) clean++;
  const key = d.build === 'free' ? 'free' : d.sys; cnt[key] = (cnt[key] || 0) + 1;
  if (d.build === 'built' && d.sys === 'cheeks' && ['osb','mdf','dekorspan','seekiefer','regalbau'].includes(d.mat)) softCheeks++;
  if (R.rows.some(r => r.name === 'Eckleiste' && r.kind === 'korpus' && r.t <= 16)) thinCorner++;
  if (d.build === 'built' && d.sys === 'posts' && d.shape !== 'I') postsNoCorner++;
  if (R.warn.some(w => w.includes('zwei Stücke'))) rails2++;
}
console.log('Zufall', N, 'Läufe, ohne Warnung', clean, '| Bauarten', JSON.stringify(cnt));
console.log('Wangen aus OSB/MDF/Span/Seekiefer:', softCheeks, '| Eckleiste ≤ 16 mm aus Platte (Schraube 4×35 bricht durch):', thinCorner, '| Pfostenrahmen L/U ohne Eckpfosten:', postsNoCorner, '| Schienen gestapelt:', rails2);
