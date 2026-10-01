const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
const FORM = { kind:'sideboard', w:'1200', h:'720', d:'400', room:'living', mat:'birke', t:'18', back:'hdf3', top:'over',
  sections:'2', shelves:'1', base:'legs', baseH:'160', legShape:'cone', taper:'35', legColor:'oak', joint:'pocket',
  front:'hinged', doorsPer:'auto', slideN:'auto', handle:'hole', color:'korpus', sheetL:'1500', sheetB:'3000', kerf:'4', grain:true, price:'100'};
for (const [id, o] of [['S2 MDF 3 Fächer', { mat:'mdf', t:19, joint:'dowels', color:'salbei', sections:3 }], ['S3 Span 3 Fächer', { mat:'dekorspan', t:19, joint:'cam', sections:3 }],
  ['S2 MDF 2 Fächer', { mat:'mdf', t:19, joint:'dowels', color:'salbei' }], ['S3 Span 2 Fächer', { mat:'dekorspan', t:19, joint:'cam' }]]) {
  const d = K.withCatalog({ ...FORM, ...o }); const R = K.computeData(d);
  console.log(id, 'Holz CHF', Math.round(K.kostenGesamt(R)), 'Fach', Math.round(R.s), 'Niveau', R.level, 'Warn', R.warn.filter(w => !K.HARMLOS.test(w)).length);
}
// Wieviele heutige Sideboard-Stärken/-Materialien überleben
const keep = { birke:[18], birkesi:[18], fichtesp:[18], dreischicht:[19], mdf:[19], dekorspan:[19], eiche:[18], fichte:[18] };
const gone = [];
for (const [k, M] of Object.entries(MATS)) if (!M.boards) for (const t of M.t) if (!(keep[k] || []).includes(t)) gone.push(`${k} ${t}`);
console.log('Sideboard Korpus weg:', gone.length, gone.join(', '));
// Leimholz-Türhöhe im Standard und bei Highboard
for (const H of [720, 880, 1000, 1100, 1400]) { const d = K.withCatalog({ ...FORM, mat:'eiche', t:18, joint:'dowels', h:String(H) }); const R = K.computeData(d); console.log('Eiche H', H, 'Türhöhe', R.doors[0] && Math.round(R.doors[0].dh)); }
