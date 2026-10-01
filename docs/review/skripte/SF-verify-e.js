const { K, FORM, seeded, sb } = require('./SF-verify-lib.js');
// E1: Mittleres Scharnier vs mittleres Einlegeboden
for (const sh of ['1','3']) { const { R } = sb({ mat:'mdf', t:'19', h:'1400', base:'none', w:'1000', sections:'2', shelves:sh, color:'weiss' });
  const d = R.doors[0]; const ys = R.boxes.filter(b=>/Einlegeboden/.test(b.key) && b.pos[0] < 0).map(b=>b.pos[1]);
  console.log('shelves', sh, 'dh', r0(d.dh), 'Tür', R.rows.find(r=>r.name==='Tür').note, 'Türmitte y', d.yc, 'Böden y', ys.join(','), 'Boden vorne ab VK', (R.D/2 - (R.boxes.find(b=>/Einlegeboden/.test(b.key)).pos[2] + R.boxes.find(b=>/Einlegeboden/.test(b.key)).size[2]/2)), 'Breite Boden', R.rows.find(r=>r.name==='Einlegeboden').L, 's', R.s, 'warn', R.warn.filter(w=>!/kippt|Füsse/.test(w))); }
// Zufall frequency
let rnd = seeded(42), n = 0, hit = 0, solidTall = 0, coatedFront = 0, ex = null, exS = null;
for (let i = 0; i < 1000; i++) { const d = K.zufall({ ...FORM }, rnd); if (d.front === 'open') continue; n++; const R = K.computeData(d);
  if (d.front === 'hinged') { const hpd = Number(R.rows.find(r=>r.name==='Tür').note[0]); if (hpd === 3 && Number(d.shelves) % 2 === 1) { hit++; ex = ex || d; } }
  const MF = R.MF; const doorH = R.doors[0] ? R.doors[0].dh : R.slides[0].dh;
  if (!MF.ply && MF.grain && !MF.coated && doorH > 900) { solidTall++; exS = exS || [MF.name, R.tf, r0(doorH), d.front]; }
  if (MF.coated) coatedFront++;
}
console.log('fronted', n, 'hinged 3 Scharniere + ungerade Böden', hit, ex && [ex.mat, ex.h, ex.shelves, ex.base]);
console.log('Massivholz-Türen > 900 mm hoch', solidTall, exS, 'beschichtete Fronten', coatedFront);
// E2: Schleifen-Schritt bei Spanplatte weiss
{ const { R } = sb({ mat:'dekorspan', t:'19' }); console.log(R.steps[1]); console.log(R.finish.find(f=>/Schleif/.test(f[1]))); }
{ const { R } = sb({ mat:'birke', t:'18', frontMat:'dekorspan', frontT:'19' }); console.log(R.steps[1][1].slice(0,120), '| Kantenband', R.finish.find(f=>/Kanten/.test(f[1]))); }
// E3: tall solid doors
for (const mat of ['fichte','eiche']) { const { R } = sb({ mat, t:'18', h:'1400', base:'none', w:'1000', sections:'2', shelves:'2' }); console.log(mat, 'Tür', r0(R.doors[0].dh), '×', r0(R.doors[0].dw), R.tf, 'warn', R.warn.filter(w=>!/kippt|Füsse/.test(w))); }
