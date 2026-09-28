const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
const BASE = { W:1200, H:720, D:400, room:'living', mat:'birke', t:18, back:'hdf3', top:'over', sections:2, shelves:1,
  base:'legs', baseH:160, legShape:'cone', taper:35, legColor:'oak', joint:'pocket', front:'hinged', doorsPer:'auto',
  slideN:'auto', handle:'hole', color:'korpus', sheetL:1500, sheetB:3000, kerf:4, grain:true, price:88.95 };
const run = o => computeSideboard({ ...BASE, ...o });
function doorsInfo(R){
  const n = R.n, t=R.t, W=R.W;
  // divider extents
  const divs = R.boxes.filter(b=>R.rows.find(r=>r.key===b.key).name==='Mittelwand').map(b=>[b.pos[0]-b.size[0]/2, b.pos[0]+b.size[0]/2]);
  return { W, t, tf:R.tf, divs, doors:R.doors.map(d=>({side:d.side, x0:+(d.cx-d.dw/2).toFixed(2), x1:+(d.cx+d.dw/2).toFixed(2), dw:+d.dw.toFixed(2), dh:d.dh, yb:d.yc-d.dh/2, yt:d.yc+d.dh/2})) };
}
for (const cfg of [{}, {sections:3}, {sections:1, W:1300}, {sections:2, W:1600}, {sections:3, W:2000, doorsPer:'2'}, {mat:'dreischicht', t:27, price:84.95}, {mat:'birke', t:12, price:63.95}]) {
  const R = run(cfg);
  const I = doorsInfo(R);
  console.log(JSON.stringify(cfg), 'W',I.W,'t',I.t,'tf',I.tf,'Hc',R.Hc,'bh',R.bh);
  console.log('  divs', JSON.stringify(I.divs));
  for (const d of I.doors) {
    // overlay on sides / dividers
    console.log('  door', JSON.stringify(d));
  }
  console.log('  hw', R.hw.filter(h=>/Topf|Push|Knopf/.test(h[1])).map(h=>h[0]+'× '+h[1]).join(' | '));
  console.log('  rows', R.rows.filter(r=>r.kind==='front').map(r=>`${r.qty}× ${r.name} ${r.L}×${r.B}×${r.t} ${r.note}`).join(' | '));
}
