const { mk, f } = require('./EG_lib.js');
for (const sys of ['battens','rails','brackets','posts','cheeks']) for (const mat of ['birke','gon_fichte','moebel_weiss','regalbau']) {
  const { R, items, c } = mk({ sys, shape:'U', mat });
  const D = R.D, W = R.W, ncfg = normReduit(c).cfg;
  // hinteres Tablar (echte Breite aus der Liste) und längstes Seitentablar-Stück links am Eck
  const backShelf = items.find(i => i.name === 'Tablar' && i.z1 <= -D/2 + ncfg.dBack + 0.5);
  const sideCorner = items.filter(i => i.name === 'Tablar' && i.x1 <= -W/2 + ncfg.dLeft + 0.5 && Math.abs(i.y0 - 150) < 1).sort((a,b)=>a.z0-b.z0)[0];
  const rowB = R.rows.find(r => r.key === R.boxes[backShelf.i].key), rowS = R.rows.find(r => r.key === R.boxes[sideCorner.i].key);
  const off = sys === 'rails' ? 12 : 0;
  const real = off + rowB.B;             // Vorderkante hinteres Tablar ab Rückwand, wenn ganz an Wand/Schiene geschoben
  const sideStart = sideCorner.z0 + D/2; // Beginn Seitentablar ab Rückwand (gezeichnet)
  const clash = real - sideStart;
  console.log(`${sys.padEnd(8)} ${mat.padEnd(12)} dBack ${ncfg.dBack} dLeft ${ncfg.dLeft} | hinten Liste B ${rowB.B} (gezeichnet ${f(backShelf.size[2])}), Seite links Liste ${rowS.L}×${rowS.B} (gez. ${f(sideCorner.size[0])} tief) | hinteres Tablar reicht bis ${real} mm, Seitentablar beginnt bei ${f(sideStart)} → ${clash > 0 ? 'ÜBERLAPPUNG ' + f(clash) + ' mm' : 'Luft ' + f(-clash) + ' mm'} | Luft Rückwand ${off ? 0 : f(backShelf.z0 + D/2 - (rowB.B - backShelf.size[2]))} `);
}
