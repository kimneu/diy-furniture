const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
const base = { kind:'reduit', rw:'1600', rd:'1400', rh:'2400', doorW:'800', doorIn:false, hinge:'L', wall:'solid',
  shape:'U', corner:'L', build:'built', sys:'battens', dBack:'400', dLeft:'300', dRight:'300', nShelves:'5', gapBottom:'150', gapTop:'300',
  nicheL:false, nicheLW:'450', nicheLH:'1300', nicheR:false, nicheRW:'450', nicheRH:'1300', back:'hdf3', joint:'pocket', kerf:'4', grain:true };
const run = (id, o) => {
  const d = K.withCatalog({ ...base, ...o });
  const R = K.computeData(d);
  const hard = R.warn.filter(w => !K.HARMLOS.test(w));
  const posts = R.rows.filter(r => r.name.startsWith('Kantholz')).reduce((a, r) => a + r.qty, 0);
  const cheeks = R.rows.filter(r => r.name === 'Wange').reduce((a, r) => a + r.qty, 0);
  console.log(id.padEnd(34), 'Holz', Math.round(K.kostenGesamt(R) - (R.buyCost||0)), 'Kaufteile', Math.round(R.buyCost||0), 'Total', Math.round(K.kostenGesamt(R)), 'Pfosten', posts, 'Wangen', cheeks, 'Module', R.modules, '| hart:', hard.map(w => w.slice(0, 90)).join(' || '));
};
run('R1 Leisten Birke 18 (Standard)', { sys:'battens', mat:'birke' });
run('R1 Leisten OSB 18 I 800x1200', { sys:'battens', mat:'osb', shape:'I', rw:'800', rd:'1200' });
run('R1 Leisten OSB 18 L 1200x1200', { sys:'battens', mat:'osb', shape:'L', rw:'1200', rd:'1200' });
run('R2 Pfosten OSB 18', { sys:'posts', mat:'osb' });
run('R2 Pfosten Sperrholz Fichte 18', { sys:'posts', mat:'fichtesp' });
run('R2 Pfosten go/on 18', { sys:'posts', mat:'gon_fichte' });
run('R2 Pfosten OSB 12', { sys:'posts', mat:'osb', t:12 });
run('R3 Schienen Sperrholz Fichte 18', { sys:'rails', mat:'fichtesp' });
run('R3 Schienen Birke 18', { sys:'rails', mat:'birke' });
run('R4 Winkel Fichte-Sp 18 300/250', { sys:'brackets', mat:'fichtesp', dBack:'300', dLeft:'250', dRight:'250', gapBottom:'260' });
run('R5 Wangen Birke 18', { sys:'cheeks', mat:'birke' });
run('R5 Wangen Dreischicht 19', { sys:'cheeks', mat:'dreischicht' });
run('R6 Module Sperrholz Fichte 18', { build:'free', mat:'fichtesp', joint:'pocket', back:'hdf3' });
run('R6 Module Spanplatte 19', { build:'free', mat:'dekorspan', joint:'cam', back:'hdf3' });
// Pfostenabstand nach Querlatte (TR-E1): POST_MAX 1200
for (const [mat, t] of [['birke',18],['osb',12],['osb',18],['dekorspan',16]]) {
  const m = maxSpan(mat,t);
  const kSpan = Math.floor(1600/m), kLatte = Math.floor(1600/1200);
  console.log(`Pfosten hinten 1600 mm, ${mat} ${t}: SPAN ${m} → Zwischenpfosten ${kSpan}; nach Querlatte 1200 → ${kLatte}`);
}
// Winkel: Wandschenkel und nötiger Bodenabstand
for (const dep of [200, 225, 250, 300, 350, 375]) {
  const want = dep*2/3, size = [150,200,250].find(l => l >= want) || 250;
  const wand = { 150:200, 200:250, 250:300 }[size];
  console.log(`Tiefe ${dep}: Winkel ${size} × ${wand}, gapBottom ≥ ${wand + 10}, lichte Höhe ≥ ${wand}`);
}
// Lichte Höhe bei 2400, gapBottom 260, gapTop 300 für n Tablare, t 18
for (const n of [4,5,6,7]) { const lv = shelfLevels(n, 260, 300, 2400); console.log(n, 'Tablare (unten 260): lichte Höhe', lv[1]-lv[0]-18); }
