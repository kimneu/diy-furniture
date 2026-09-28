const { run, bb } = require('./EP_lib.js');
// Blindecke: Öffnung des ersten hinteren Fachs neben dem Seitenregal (Wangen und selbststehend)
function blind(o){
  const R = run(o);
  const lv = R.boxes.filter(b => /^(Tablar|Einlegeboden)/.test(b.key)).map(b => bb(b, R));
  const y = Math.min(...lv.filter(q=>q.lo[1] > 400).map(q => q.lo[1]));
  const backShelves = lv.filter(q => q.lo[1] === y && q.lo[2] < 20 && q.hi[2] <= o.dBack + 1);
  const first = backShelves.sort((a,b)=>a.lo[0]-b.lo[0])[0];
  const dS = R.rows ? o.dLeft : 0;
  const sidePanel = R.boxes.map(b=>bb(b,R)).filter(q => q.lo[1] <= 1 && q.hi[1] > 1500 && (q.hi[0]-q.lo[0]) > 100 && q.lo[0] < 20 && q.lo[2] > 100).sort((a,b)=>a.lo[2]-b.lo[2])[0];
  const cover = sidePanel ? sidePanel.hi[0] : 0;
  const open = first.hi[0] - Math.max(first.lo[0], cover);
  return { shelf: +(first.hi[0]-first.lo[0]).toFixed(0), hidden: +(Math.max(0, cover - first.lo[0])).toFixed(0), open: +open.toFixed(0), depth: +(first.hi[2]-first.lo[2]).toFixed(0) };
}
for (const build of ['built','free']) for (const [mat,t] of [['birke',18],['mdf',19]]) {
  console.log('==', build === 'built' ? 'Wangen' : 'selbststehend', mat, t);
  for (const [rw, dB, dS] of [[1600,400,300],[1600,300,300],[1600,300,400],[2000,200,600],[2000,300,500],[2400,400,400],[1800,250,500]]) {
    const r = blind({ sys:'cheeks', build, mat, t, rw, dBack:dB, dLeft:dS, dRight:dS });
    console.log(`  B ${rw}, hinten ${dB}, Seiten ${dS}: 1. hinteres Fach ${r.shelf} × ${r.depth}, davon ${r.hidden} verdeckt, Öffnung ${r.open} mm`);
  }
}
