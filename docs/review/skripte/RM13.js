const { K, BASE, run } = require('./RM_lib.js');
let n = 0, silent = 0, ex = null;
for (let rw = 600; rw <= 4000; rw += 50) for (let dw = 600; dw <= 1200; dw += 50) for (let d = 150; d <= 600; d += 50) {
  const nr = normReduit({ ...BASE, shape:'L', corner:'L', rw, doorW:dw, dLeft:d }); const c = nr.cfg;
  const l = layoutReduit(c); const pass = c.rw - c.dLeft; n++;
  const w = [...nr.warn, ...l.warn];
  if (pass < 600 && !w.some(x => /Türöffnung|Durchgang/.test(x))) { silent++; ex = ex || { rw, dw, d, pass }; }
}
console.log('L-Form: Fälle', n, 'Durchgang < 600 ohne jede Warnung:', silent, ex);
// Seitenmodul-Abdeckung beim hinteren Modul (frei, U) über verschiedene Tiefen
for (const [dL, dB] of [[300,400],[400,400],[200,300]]) {
  const R = run({ shape:'U', build:'free', dLeft:dL, dRight:dL, dBack:dB });
  const sides = R.boxes.filter(b => R.rows.find(r=>r.key===b.key).name==='Seite');
  const back = sides.filter(b => Math.abs(b.pos[2] - (-R.D/2 + 10 + (dB-10)/2)) < 1).map(b=>b.pos[0]).sort((a,b)=>a-b);
  const innerW = back[1] - back[0] - 18; const blocked = (-R.W/2 + dL) - (back[0] + 9);
  console.log(`frei U dSeite ${dL} dHinten ${dB}: hinteres Eckmodul lichte Breite ${Math.round(innerW)} mm, davon verdeckt ${Math.round(blocked)} mm (${Math.round(100*blocked/innerW)} %)`);
}
