const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const BASE = { W:1200, H:720, D:400, room:'living', mat:'birke', t:18, back:'hdf3', top:'over', sections:2, shelves:1,
  base:'legs', baseH:160, legShape:'cone', taper:35, legColor:'oak', joint:'pocket', front:'hinged', doorsPer:'auto',
  slideN:'auto', handle:'hole', color:'korpus', sheetL:1500, sheetB:3000, kerf:4, grain:true, price:88.95 };
const run = o => computeSideboard({ ...BASE, ...o });
const show = (label, o) => { const R = run(o);
  console.log(`\n${label}: Front ${R.gFront}, painted=${!!R.frontFin.painted}`);
  for (const f of R.finish) console.log('  finish:', f.join(' | '));
  const st = R.steps.filter(s => /Oberfläche|lackieren|Kanten|ölen/i.test(s[0])); for (const s of st) console.log('  step:', s[0], '–', s[1]);
  const w = R.warn; if (w.length) console.log('  warn:', w.join(' // '));
  console.log('  cut groups:', R.groups.map(g=>g.label+' '+g.sheets.length+' Pl.').join(', '));
};
show('Spanplatte weiss Fronten, Salbei', { frontMat:'dekorspan', frontT:19, color:'salbei' });
show('Spanplatte weiss Korpus+Fronten, Anthrazit', { mat:'dekorspan', t:19, price:27.5, color:'anthrazit' });
show('Leimholz Eiche Fronten Kreideweiss', { frontMat:'eiche', frontT:18, color:'weiss' });
show('OSB Korpus + Fronten natur', { mat:'osb', t:18, price:29.95 });
show('OSB 15 Fronten', { frontMat:'osb', frontT:15 });
show('Seekiefer 15 Korpus+Fronten', { mat:'seekiefer', t:15, price:47.95 });
show('Leimholz Fichte Fronten 18, H 1400 ohne Untergestell', { frontMat:'fichte', frontT:18, H:1400, base:'none' });
