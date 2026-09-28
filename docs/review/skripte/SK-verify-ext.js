const { run, K, FORM } = require('./SK-verify-lib.js');
// Schiebetüren: wo laufen die Türen relativ zur Seiten-Vorderkante, wo sitzt der vordere Bodenträger (40 mm)?
for (const [fm, ft] of [['korpus',18],['birke',12],['mdf',16]]) {
  const R = run({W:1600, sections:2, shelves:1, front:'sliding', frontMat:fm, frontT:ft});
  const front = R.D/2; const tf = R.tf;
  const zones = R.slides.slice(0,2).map(s => [front - (s.z + tf/2), front - (s.z - tf/2)].map(v=>+v.toFixed(1)));
  const side = R.rows.find(r=>r.name==='Seite'), sh = R.rows.find(r=>r.name==='Einlegeboden');
  console.log('tf', tf, 'Türzonen ab Seiten-VK (vorne, hinten):', zones, 'Tablar-VK', side.B - sh.B, 'mm; Bodenträger Ø5 bei 40 mm → 37,5–42,5');
}
// Leimholz + verschraubt: Stirnkante der Boden/Deckel = Hirnholz?
const R = run({mat:'eiche', t:18, joint:'screws', top:'between', sheetL:2500, sheetB:1200, price:109});
console.log(R.boxes.filter(b=>['Boden','Deckel','Mittelwand','Seite'].some(n=>b.key.startsWith(n))).map(b=>b.key.split('|')[0]+' grain '+b.grain+' size '+b.size.map(Math.round)));
console.log(R.steps.find(s=>/Schraub/.test(s[0]))[1]); console.log(R.warn);
function seeded(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = seeded(9); let c=0; for (let i=0;i<1000;i++){ const d=K.zufall({...FORM}, rnd); if ((d.mat==='eiche'||d.mat==='fichte') && d.joint==='screws') c++; }
console.log('Zufall Leimholz+verschraubt', c, 'von 1000');
// Überschlag Drehtüren je Korpusstärke
for (const [mat,t] of [['birke',18],['birke',21],['fichtesp',24],['eiche',27]]) {
  const R2 = run({mat, t, W:1600, sections:2});
  const d0 = R2.doors[0], d1 = R2.doors[1];
  const outerOverlay = (d0.cx - d0.dw/2) - (-R2.W/2); // Abstand Türkante zur Aussenkante
  const divX = 0; const gapAtDiv = (R2.doors[2].cx - R2.doors[2].dw/2) - (d1.cx + d1.dw/2);
  console.log(mat, t, 'Tür', R2.tf, 'Überschlag aussen', (t - outerOverlay).toFixed(1), 'Mittelwand je Tür', ((t - gapAtDiv)/2).toFixed(1), R2.warn.filter(w=>/Scharn/.test(w)));
}
