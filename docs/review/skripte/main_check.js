const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
const base = { mat:'birke', t:18, back:'hdf3', joint:'pocket', sheetL:1500, sheetB:3000, kerf:4, grain:true, price:88.95 };
const ov = (a,b) => [0,1,2].every(i => Math.abs(a.pos[i]-b.pos[i]) < (a.size[i]+b.size[i])/2 - 0.5);
// 1 Pfosten im Tablar
let R = computeReduit({ ...REDUIT_DEFAULTS, ...base, shape:'U', sys:'posts' });
const rowOf = k => R.rows.find(r => r.key === k);
const posts = R.boxes.filter(b => rowOf(b.key).name.startsWith('Kantholz')), shelves = R.boxes.filter(b => rowOf(b.key).name === 'Tablar');
console.log('1 Pfosten', posts.length, 'Überschneidungen Pfosten×Tablar', posts.reduce((a,q)=>a+shelves.filter(s=>ov(q,s)).length,0));
console.log('  Plattengruppe', R.groups[0].sheet, 'warn', R.warn.length);
// 2 Tür nach innen, hinteres Regal
R = computeReduit({ ...REDUIT_DEFAULTS, ...base, shape:'I', rd:1000, dBack:400, doorIn:true, sys:'rails' });
console.log('2 I rd1000 dBack400 Tür innen 800: frei vor Regal', 1000-400, 'mm → Öffnung ca.', Math.round(Math.asin(600/800)*180/Math.PI), '°; Warnungen:', R.warn);
// 3 Exzenter 12 mm
R = K.computeData({ ...{kind:'sideboard', w:'1200', h:'720', d:'400', room:'living', mat:'birke', t:'12', back:'hdf3', top:'over', sections:'2', shelves:'1', base:'legs', baseH:'160', legShape:'cone', taper:'35', legColor:'oak', joint:'cam', front:'hinged', doorsPer:'auto', slideN:'auto', handle:'hole', color:'korpus', frontMat:'korpus', sheetL:'1500', sheetB:'3000', kerf:'4', grain:true, price:'64' } });
console.log('3 Sideboard Birke 12 Exzenter: warn', R.warn, '| hw', R.hw.find(h => /Exzenter/.test(h[1])).slice(1,3).join(' – '));
// 4 Schrauben Konsolen
R = computeReduit({ ...REDUIT_DEFAULTS, ...base, shape:'U', sys:'rails' });
console.log('4', R.hw.filter(h => /4 × 35|200 cm|100 cm/.test(h[1])).map(h => h.slice(0,3).join(' | ')));
// 5 Wangenhöhe
R = computeReduit({ ...REDUIT_DEFAULTS, ...base, shape:'U', sys:'cheeks' });
const w = R.rows.find(r => r.name === 'Wange'); console.log('5 Wange', w.L, '×', w.B, 'Kippmass', Math.round(Math.hypot(w.L, w.B)), 'bei Raumhöhe 2400');
// 6 Schiebetüren Tablar vs Seite
R = K.computeData({ kind:'sideboard', w:'1800', h:'720', d:'400', room:'living', mat:'birke', t:'18', back:'hdf3', top:'over', sections:'3', shelves:'2', base:'legs', baseH:'160', legShape:'cone', taper:'35', legColor:'oak', joint:'pocket', front:'sliding', doorsPer:'auto', slideN:'auto', handle:'shell', color:'korpus', frontMat:'korpus', sheetL:'1500', sheetB:'3000', kerf:'4', grain:true, price:'88.95' });
const side = R.rows.find(r => r.name === 'Seite'), sh = R.rows.find(r => r.name === 'Einlegeboden');
console.log('6 Schiebetür: Seite tief', side.B, 'Einlegeboden tief', sh.B, '→ Vorderkante', side.B - sh.B, 'mm zurück; Lochreihe laut Anleitung 40 mm von vorne');
