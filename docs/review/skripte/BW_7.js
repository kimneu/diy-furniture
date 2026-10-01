const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
const base = { kind:'reduit', rw:'1600', rd:'1400', rh:'2400', doorW:'800', doorIn:false, hinge:'L', wall:'solid',
  shape:'U', corner:'L', build:'built', sys:'battens', dBack:'400', dLeft:'300', dRight:'300', nShelves:'5', gapBottom:'150', gapTop:'300',
  nicheL:false, nicheLW:'450', nicheLH:'1300', nicheR:false, nicheRW:'450', nicheRH:'1300', back:'hdf3', joint:'pocket', kerf:'4', grain:true };
const show = (id, o) => { const d = K.withCatalog({ ...base, ...o }); const R = K.computeData(d);
  const strips = R.rows.filter(r => r.name === 'Leiste' || r.name === 'Eckleiste'); const m = strips.reduce((a, r) => a + r.qty * r.L, 0) / 1000;
  console.log(id, 'Total', Math.round(K.kostenGesamt(R)), 'Leisten m', m.toFixed(1), 'hart', R.warn.filter(w => !K.HARMLOS.test(w)).map(w => w.slice(0, 60))); return R; };
show('R1 I 800x1200 Birke Std 18', { shape:'I', rw:'800', rd:'1200', doorW:'700', sys:'battens', mat:'birkesi', grain:false });
show('R1 I 800x1200 OSB 18', { shape:'I', rw:'800', rd:'1200', doorW:'700', sys:'battens', mat:'osb' });
show('R1 I 1000x1200 go/on 18', { shape:'I', rw:'1000', rd:'1200', doorW:'700', sys:'battens', mat:'gon_fichte' });
// R2: Pfosten heute vs mit Eckpfosten und POST_MAX 1200 (Standard-U)
const R = show('R2 OSB 18 U', { sys:'posts', mat:'osb' });
const posts = R.rows.filter(r => r.name.startsWith('Kantholz')); const pl = posts.reduce((a, r) => a + r.qty * r.L, 0) / 1000;
console.log('R2 Pfosten heute', posts.reduce((a, r) => a + r.qty, 0), 'Stück', pl.toFixed(2), 'm, CHF', (pl * BUY.kant45.price).toFixed(2));
// neu: 2 Eckpfosten; Felder: hinten zwischen den Eckpfosten 1600-300-300 = 1000 ≤ 1200, Seiten Eckpfosten→Vorderwand 1000 ≤ 1200 → 0 Zwischenpfosten
const top = 2100 + 18, neuM = 2 * top / 1000;
const levels = 5, winkel = (2 + 1 + 1) * levels; // Querlatten-Enden an Wänden: hinten 2, links 1, rechts 1
const tablare = 5 + 5 + 5, tabSchr = tablare * 4;
console.log('R2 neu: 2 Eckpfosten', neuM.toFixed(2), 'm, CHF', (neuM * BUY.kant45.price).toFixed(2), '| Winkel', winkel, 'CHF', (winkel * BUY.angle40.price).toFixed(2), '(geschätzt) | Tablarschrauben', tabSchr, 'CHF ~', (tabSchr * BUY.screw35.price).toFixed(2), '(Preis 4×35 als Näherung)');
// R5 Wangen Dreischicht: Fläche heute vs Wangenhöhe top + t + 50
const d5 = K.withCatalog({ ...base, sys:'cheeks', mat:'dreischicht' }); const R5 = K.computeData(d5);
const w = R5.rows.filter(r => r.name === 'Wange'); const a0 = w.reduce((a, r) => a + r.qty * r.L * r.B, 0) / 1e6;
const hNeu = 2100 + 19 + 50; const a1 = w.reduce((a, r) => a + r.qty * hNeu * r.B, 0) / 1e6;
console.log('R5 Wangen', w.reduce((a, r) => a + r.qty, 0), 'Stück, Fläche heute', a0.toFixed(2), 'm², neu', a1.toFixed(2), 'm², Ersparnis CHF', ((a0 - a1) * matPrice(MATS.dreischicht, 19)).toFixed(0));
// R5: Eckfach-Grenze dSeite ≤ SPAN − 350; R6: Eckmodul dSeite ≤ min(900, SPAN + 2t − 1) − 360
for (const [m, t] of [['birke',18],['fichtesp',18],['dreischicht',19],['dekorspan',19],['mdf',19]]) {
  const s = maxSpan(m, t); console.log(m, t, 'SPAN', s, '→ R5 dSeite ≤', s - 350, '· R6 Eckmodul dSeite ≤', Math.min(900, s + 2*t - 1) - 360);
}
