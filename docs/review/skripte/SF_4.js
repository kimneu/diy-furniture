const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
const BASE = { W:1200, H:720, D:400, room:'living', mat:'birke', t:18, back:'hdf3', top:'over', sections:2, shelves:1,
  base:'legs', baseH:160, legShape:'cone', taper:35, legColor:'oak', joint:'pocket', front:'hinged', doorsPer:'auto',
  slideN:'auto', handle:'hole', color:'korpus', sheetL:1500, sheetB:3000, kerf:4, grain:true, price:88.95 };
const run = o => computeSideboard({ ...BASE, ...o });
const step = (R, t) => (R.steps.find(s => s[0] === t) || [])[1];
// Push-to-open, Doppeltür ohne Mittelwand
let R = run({ sections:1, W:1300, handle:'push' });
console.log('PUSH 1 Fach W1300: Türen', R.doors.map(d=>d.side+' '+Math.round(d.dw)).join(', '), '| Mittelwände', R.rows.filter(r=>r.name==='Mittelwand').length);
console.log('  hw:', R.hw.filter(h=>/Push|Topf/.test(h[1])).map(h=>h[0]+'× '+h[1]+' – '+h[2]).join(' | '));
console.log('  Schritt:', step(R,'Push-to-open einbauen'));
// Schiebetüren: Tiefe der Schienen / Türen / Mittelwand / Einlegeböden / Lochreihe
for (const o of [{ sections:2 }, { sections:3 }, { sections:2, W:1800 }, { sections:4, W:1800 }, { sections:3, W:1400 }]) {
  R = run({ front:'sliding', handle:'shell', ...o });
  const tf = R.tf, D = R.D;
  const fromFront = z => +(D/2 - z).toFixed(1);
  const fd = R.slides.find(s=>s.idx===0), bd = R.slides.find(s=>s.idx===1);
  const div = R.boxes.find(b=>b.key.startsWith('Mittelwand'));
  const sh = R.boxes.find(b=>b.key.startsWith('Einlegeboden'));
  const tr = R.extras.find(e=>e.type==='track');
  const divX = R.boxes.filter(b=>b.key.startsWith('Mittelwand')).map(b=>Math.round(b.pos[0]));
  const doorsX = R.slides.map(s=>`${s.z===fd.z?'v':'h'}[${Math.round(s.cx-s.ws/2)}..${Math.round(s.cx+s.ws/2)}]`);
  console.log(`\nSCHIEBE ${JSON.stringify(o)} Wi=${R.Wi} ns=${R.slides.length} ws=${Math.round(R.slides[0].ws)} tf=${tf}`);
  console.log(`  vordere Tür ab Vorderkante ${fromFront(fd.z + tf/2)}..${fromFront(fd.z - tf/2)} mm, hintere Tür ${fromFront(bd.z + tf/2)}..${fromFront(bd.z - tf/2)} mm`);
  console.log(`  Schiene (3D) ${fromFront(tr.z + tr.depth/2)}..${fromFront(tr.z - tr.depth/2)} mm (Tiefe ${tr.depth}), Mittelwand-Vorderkante ${div ? fromFront(div.pos[2] + div.size[2]/2) : '-'} mm, Einlegeboden-Vorderkante ${sh ? fromFront(sh.pos[2] + sh.size[2]/2) : '-'} mm`);
  console.log(`  Mittelwände x=${divX.join(', ')} | Türen ${doorsX.join(' ')}`);
  console.log('  Schritt Bodenträger:', (step(R,'Löcher für Bodenträger bohren')||'').slice(0,140));
  console.log('  Schritt Schiebetüren:', step(R,'Schiebetüren einsetzen'));
  console.log('  hw:', R.hw.filter(h=>/Schiebe|Griff/.test(h[1])).map(h=>h[0]+'× '+h[1]+' – '+h[2]).join(' | '));
}
// Schritt mit W ausserhalb des Bereichs
R = computeSideboard({ ...BASE, W:2600, front:'sliding', handle:'shell', sections:3 });
console.log('\nW=2600 → R.W', R.W, 'Wi', R.Wi, '| Schritt:', step(R,'Schiebetüren einsetzen').match(/auf (\d+) mm/)[0], '| hw:', R.hw.find(h=>/Schiebe/.test(h[1]))[2]);
