const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
const FORM = {
  kind:'sideboard', w:'1200', h:'720', d:'400', room:'living', mat:'birke', t:'18', back:'hdf3', top:'over',
  sections:'2', shelves:'1', base:'legs', baseH:'160', legShape:'cone', taper:'35', legColor:'oak', joint:'pocket',
  front:'hinged', doorsPer:'auto', slideN:'auto', handle:'hole', color:'korpus',
  sheetL:'1500', sheetB:'3000', kerf:'4', grain:true, price:'100'};
const HARM = K.HARMLOS;
// Sideboard-Rezepte: [id, mat, t, joint, back, frontMat, frontT, color, room]
const R = [
 ['S1 Sperrholz Birke Taschenloch', 'birke', 18, 'pocket', 'hdf3', 'korpus', 18, 'korpus', 'living'],
 ['S1 Sperrholz Birke Standard', 'birkesi', 18, 'pocket', 'hdf3', 'korpus', 18, 'korpus', 'living'],
 ['S1 Sperrholz Fichte', 'fichtesp', 18, 'pocket', 'hdf3', 'korpus', 18, 'korpus', 'living'],
 ['S1 Dreischicht', 'dreischicht', 19, 'pocket', 'hdf3', 'korpus', 19, 'korpus', 'living'],
 ['S2 MDF Dübel lackiert', 'mdf', 19, 'dowels', 'hdf3', 'korpus', 19, 'salbei', 'living'],
 ['S3 Spanplatte Exzenter', 'dekorspan', 19, 'cam', 'hdf3', 'korpus', 19, 'korpus', 'living'],
 ['S4 Eiche Dübel', 'eiche', 18, 'dowels', 'ply6', 'korpus', 18, 'korpus', 'living'],
 ['S4 Fichte Dübel', 'fichte', 18, 'dowels', 'ply6', 'korpus', 18, 'korpus', 'living'],
 ['S5 Birke verschraubt offen', 'birke', 18, 'screws', 'hdf3', 'korpus', 18, 'korpus', 'living'],
 ['S6 Bad Birke', 'birke', 18, 'dowels', 'ply6', 'korpus', 18, 'korpus', 'bath'],
 ['S6 Bad MDF', 'mdf', 19, 'dowels', 'ply6', 'korpus', 19, 'weiss', 'bath'],
];
for (const [id, mat, t, joint, back, frontMat, frontT, color, room] of R) {
  let d = K.withCatalog({ ...FORM, mat, t, joint, back, frontMat, frontT, color, room });
  if (id.startsWith('S5')) d = { ...d, front:'open', top:'between' };
  const Rr = K.computeData(d);
  const hard = Rr.warn.filter(w => !HARM.test(w));
  console.log(id.padEnd(30), 'Holz CHF', Math.round(K.kostenGesamt(Rr)), 'Niveau', Rr.level, 'Warn', hard.length, hard.map(w=>w.slice(0,70)).join(' | '));
}
// Fachbreite und SPAN: min. Fächer je Breite
console.log('\nMin. Fächer mit Einlegeböden (Fach < SPAN):');
for (const [mat, t] of [['birke',18],['fichtesp',18],['dreischicht',19],['mdf',19],['dekorspan',19],['eiche',18],['fichte',18]]) {
  const max = maxSpan(mat, t), out = [];
  for (const W of [1200, 1800, 2400]) {
    const Wi = W - 2*t; let n = 1; while ((Wi - (n-1)*t)/n > max) n++;
    out.push(`${W}: ${n} (Fach ${Math.round((Wi-(n-1)*t)/n)})`);
  }
  console.log(`${mat} ${t} SPAN ${max}:`, out.join(' · '), '· heute Sideboard-Grenze', t <= 16 ? 700 : t <= 19 ? 800 : 900);
}
// Standardformular: Fachbreite je Material bei 2 Fächern
for (const [mat, t] of [['mdf',19],['dekorspan',19],['fichte',18]]) {
  const d = K.withCatalog({ ...FORM, mat, t });
  const Rr = K.computeData(d);
  console.log(mat, t, 'Fach', Math.round(Rr.s), 'SPAN', maxSpan(mat,t), 'Warnung Einlegeboden?', Rr.warn.some(w=>/Einlegeböden/.test(w)));
}
