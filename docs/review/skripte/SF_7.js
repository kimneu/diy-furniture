const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const BASE = { W:1200, H:720, D:400, room:'living', mat:'birke', t:18, back:'hdf3', top:'over', sections:2, shelves:1,
  base:'legs', baseH:160, legShape:'cone', taper:35, legColor:'oak', joint:'pocket', front:'hinged', doorsPer:'auto',
  slideN:'auto', handle:'hole', color:'korpus', sheetL:1500, sheetB:3000, kerf:4, grain:true, price:88.95 };
const run = o => computeSideboard({ ...BASE, ...o });
let R = run({ sections:4, doorsPer:'2' });
console.log('n4 W1200 dp2:', R.doors.map(d=>Math.round(d.dw)).join(','), 'Fach s', R.s, 'warn:', R.warn);
R = run({ W:1230 });
console.log('W1230 auto:', R.doors.map(d=>Math.round(d.dw)).join(','), R.warn.filter(w=>/Tür ist/.test(w)));
// 3D-Position Scharnier/Deckel bei aufgesetztem Deckel
R = run({});
const lid = R.boxes.find(b=>b.key.startsWith('Deckel'));
console.log('Deckel Oberkante', lid.pos[1]+lid.size[1]/2, 'Unterkante', lid.pos[1]-lid.size[1]/2, 'Tür oben', R.doors[0].yc + R.doors[0].dh/2, 'Tür vorne z', R.D/2+1, '..', R.D/2+1+R.tf, 'Deckel vorne z', lid.pos[2]+lid.size[2]/2);
// Frontwahl für Seekiefer-Korpus
console.log('frontTs seekiefer', frontTs(MATS.seekiefer), 'osb', frontTs(MATS.osb), 'eiche', frontTs(MATS.eiche), 'fichte', frontTs(MATS.fichte));
