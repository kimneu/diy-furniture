const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const BASE = { W:1200, H:720, D:400, room:'living', mat:'birke', t:18, back:'hdf3', top:'over', sections:2, shelves:1,
  base:'legs', baseH:160, legShape:'cone', taper:35, legColor:'oak', joint:'pocket', front:'hinged', doorsPer:'auto',
  slideN:'auto', handle:'hole', color:'korpus', sheetL:1500, sheetB:3000, kerf:4, grain:true, price:88.95 };
const run = o => computeSideboard({ ...BASE, ...o });
// Richtwerte Rohdichte kg/m3
const RHO = { birke:680, birkesi:680, eiche:700, fichte:470, seekiefer:530, fichtesp:480, mdf:750, osb:620, dreischicht:470, dekorspan:650 };
const blum = kg => kg <= 6 ? 2 : kg <= 12 ? 3 : kg <= 17 ? 4 : 5;
function show(label, o){
  const R = run(o);
  const hinges = R.hw.filter(h=>/Topfscharnier/.test(h[1])).reduce((a,h)=>a+h[0],0);
  const per = hinges / R.doors.length;
  const d = R.doors.reduce((a,b)=> b.dw*b.dh > a.dw*a.dh ? b : a);
  const kg = d.dw/1000 * d.dh/1000 * R.tf/1000 * RHO[R.MF === MATS[o.frontMat] ? o.frontMat : (o.mat||'birke')];
  const need = blum(kg) + (d.dw > 600 ? 1 : 0);
  console.log(`${label}: Tür ${Math.round(d.dh)}×${Math.round(d.dw)}×${R.tf} ${R.MF.name} ≈ ${kg.toFixed(1)} kg → Code ${per} Scharniere, Blum-Faustwert ${need}; warn>600: ${R.warn.some(w=>/Tür ist/.test(w))}`);
}
show('Kommode MDF 19, H 1000, Füsse 100, W 1200, 2 Fächer', { mat:'mdf', t:19, price:38.95, H:1000, baseH:100, color:'weiss' });
show('Kommode Eiche 18, H 1000, Füsse 100, W 1230, 2 Fächer', { mat:'eiche', t:18, price:109, H:1000, baseH:100, W:1230 });
show('Sideboard Birke 18, H 880, Sockel 60, W 1240', { H:880, base:'plinth', baseH:60, W:1240 });
show('Highboard MDF 19, H 1400, ohne, W 1230', { mat:'mdf', t:19, price:38.95, H:1400, base:'none', W:1230, color:'weiss' });
show('1 Tür pro Fach erzwungen, MDF, W 1200, 1 Fach, H 900', { mat:'mdf', t:19, price:38.95, H:900, sections:1, doorsPer:'1', color:'weiss', shelves:0 });
show('Birke 12 Fronten, Standard 1200/720', { frontMat:'birke', frontT:12 });
