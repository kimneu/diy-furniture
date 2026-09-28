const { run } = require('./TR_base.js');
const { PROP, defl } = require('./TR_span.js');
const g = 9.81/1000, Q = 40*g; // 40 kg/m
const EI = (E, b, t) => E * b * t**3 / 12;
// Tablar als Einfeldträger über Feld L, Dauerlast (Emitte, Kriechfaktor)
function shelf(mat, t, L, b, k = 1){
  const [Emin, Emax, cr] = PROP[mat]; const Em = (Emin+Emax)/2;
  const d0 = 5*Q*L**4/(384*EI(Em, b, t));
  return { inst:d0*k, dauer:d0*k*cr, ratio: L/(d0*k*cr) };
}
const fmt = (o) => `${o.inst.toFixed(1)} mm sofort, ${o.dauer.toFixed(1)} mm Dauer (L/${o.ratio.toFixed(0)})`;
function supports(R, key){ return R.extras.filter(e => e.type==='metal'); }
const cases = [];
function show(label, o, extra){
  const R = run({ build:'built', ...o });
  console.log('\n## ' + label, JSON.stringify(o));
  console.log('   Warnungen:', R.warn.join(' / ') || '-');
  if (extra) extra(R);
}
// 1 Leisten U Birke 18
show('1 Leisten U Birke 18', { shape:'U', sys:'battens' }, R => {
  console.log('   hinten 1594×397 vorne frei, Balken:', fmt(shelf('birke',18,1594,397)), '| ×1,5 vorne frei:', fmt(shelf('birke',18,1594,397,1.5)));
  console.log('   seitlich 997×297, Balken:', fmt(shelf('birke',18,997,297)), '| ×1,5:', fmt(shelf('birke',18,997,297,1.5)));
});
// 2 Wandschienen U Birke 18 – Konsolenabstand
show('2 Wandschienen U Birke 18', { shape:'U', sys:'rails' }, R => {
  const xs = [...new Set(R.extras.filter(e => e.type==='metal' && e.size[1] > 1000).map(e => Math.round(e.pos[0]) + '/' + Math.round(e.pos[2])))];
  console.log('   Schienen (x/z):', xs.join(' '));
  console.log('   hinten Feld 750:', fmt(shelf('birke',18,750,397)), '| seitlich Feld 450:', fmt(shelf('birke',18,450,297)));
});
show('3 Tablarwinkel U Birke 18', { shape:'U', sys:'brackets' }, R => {
  console.log('   hinten Feld 734 (1594-120)/2:', fmt(shelf('birke',18,734,397)), '| seitlich (997-120)/2=439:', fmt(shelf('birke',18,439,297)));
});
show('4 Wangen U Birke 18', { shape:'U', sys:'cheeks' }, R => {
  const T = R.rows.filter(r => r.name==='Tablar'); console.log('   Tablare:', T.map(r => `${r.qty}× ${r.L}×${r.B}`).join(', '));
  for (const r of T) console.log('   ', r.L, 'x', r.B, fmt(shelf('birke',18,r.L,r.B)));
});
show('5 Pfostenrahmen U Birke 18 – Querlatte 24×48 hochkant', { shape:'U', sys:'posts' }, R => {
  const E = 11000, I = 24*48**3/12, cr = 1.6, q = Q/2; // halbe Tablarlast auf die Querlatte
  const ss = L => 5*q*L**4/(384*E*I)*cr, cant = a => q*a**4/(8*E*I)*cr;
  console.log(`   I Latte = ${I} mm⁴; Feld 533 zwischen Pfosten: ${ss(533).toFixed(2)} mm; Kragarm 530 bis Wand (ohne Auflager): ${cant(530).toFixed(2)} mm; seitlich Kragarm 478: ${cant(478).toFixed(2)} mm`);
  const Lq = Math.cbrt(384*E/cr*I/(5*q*300)); console.log(`   Querlatte allein: L/300 bei ${Lq.toFixed(0)} mm Pfostenabstand (Dauer, halbe Last 40 kg/m)`);
  const Lq2 = Math.cbrt(384*E/cr*I/(5*q*200)); console.log(`   Querlatte allein: L/200 bei ${Lq2.toFixed(0)} mm`);
  // Tablar spannt nur in der Tiefe (Wandlatte → Querlatte, ca. 350 mm)
  const p = Q/397; const Ls = 397-24-24+24; // lichte Spannweite ca 373
  const [Emn,Emx,crb] = PROP.mdf; const dm = 5*p*373**4/(384*((Emn+Emx)/2)*19**3/12)*crb;
  console.log(`   Tablar spannt in der Tiefe (ca. 373 mm), sogar MDF 19: ${dm.toFixed(2)} mm Dauer`);
});
show('6 Leisten I 1600 MDF 19', { shape:'I', sys:'battens', mat:'mdf', t:19, sheetL:2800, sheetB:2070, price:38.95 }, R => {
  console.log('   1594×397:', fmt(shelf('mdf',19,1594,397)), '| ×1,5:', fmt(shelf('mdf',19,1594,397,1.5)));
});
show('7 Wandschienen U OSB 18', { shape:'U', sys:'rails', mat:'osb', t:18, sheetL:2770, sheetB:2070, price:29.95 }, R => {
  const xs = [...new Set(R.extras.filter(e => e.type==='metal' && e.size[1] > 1000).map(e => Math.round(e.pos[0]) + '/' + Math.round(e.pos[2])))];
  console.log('   Schienen:', xs.join(' '), '→ hinten 4 Schienen, Feld 500:', fmt(shelf('osb',18,500,397)));
  console.log('   OSB 18 bei SPAN 650 (Wangen-Feld):', fmt(shelf('osb',18,649,397)), '| b=300:', fmt(shelf('osb',18,649,300)));
});
show('8 Wangen U OSB 18', { shape:'U', sys:'cheeks', mat:'osb', t:18, sheetL:2770, sheetB:2070, price:29.95 }, R => {
  const T = R.rows.filter(r => r.name==='Tablar'); for (const r of T) console.log('   ', r.qty, '×', r.L, 'x', r.B, fmt(shelf('osb',18,r.L,r.B)));
});
show('9 Leisten I 1000 Fichte-Leimholz 18', { shape:'I', rw:1000, rd:1000, doorW:700, sys:'battens', mat:'fichte', t:18, sheetL:2500, sheetB:1210, price:59.95 }, R => {
  console.log('   994×397:', fmt(shelf('fichte',18,994,397)), '| ×1,5 vorne frei:', fmt(shelf('fichte',18,994,397,1.5)));
});
show('10 Leisten I 2400 go/on 18, Stosspfosten', { shape:'I', rw:2400, rd:1400, doorW:800, sys:'battens', mat:'gon_fichte', t:18 }, R => {
  const T = R.rows.filter(r => r.name==='Tablar'); console.log('   Stücke:', T.map(r => `${r.qty}× ${r.L}×${r.B}`).join(', '));
  console.log('   Feld ~1200 vorne frei (b=400):', fmt(shelf('gon_fichte',18,1200,400)), '| ×1,5:', fmt(shelf('gon_fichte',18,1200,400,1.5)));
});
show('11 Tablarwinkel I 1200 Seekiefer 15 (Zufall-Material)', { shape:'I', rw:1200, rd:1200, doorW:700, sys:'brackets', mat:'seekiefer', t:15, sheetL:2500, sheetB:1250, price:47.95, dBack:300 }, R => {
  const W = R.hw.find(h => h[1].startsWith('Blech')); console.log('   Winkel:', W && W[0], W && W[1]);
  console.log('   Feld (1194-120)/2=537:', fmt(shelf('seekiefer',15,537,297)));
});
show('12 Wangen I 1600 Regalbau 16 (Brett 1150)', { shape:'I', rw:1600, rd:1400, sys:'cheeks', mat:'regalbau', t:16, dBack:400 }, R => {
  const T = R.rows.filter(r => r.name==='Tablar'); for (const r of T) console.log('   ', r.qty, '×', r.L, 'x', r.B, fmt(shelf('regalbau',16,r.L,r.B)));
});
