const { K, BASE, bb, collisions } = require(__dirname + '/RM-verify-lib.js');
// RM-3 frei: Modulmasse
let R = computeReduit({ ...BASE, build:'free' });
const sides = R.rows.filter(r=>r.name==='Seite'); console.log('frei U Seiten', sides.map(r=>r.qty+'x '+r.L+'x'+r.B).join(', '), 'Module', R.modules, 'doorH', R.room.doorH);
console.log('Rows', R.rows.filter(r=>r.kind!=='solid').map(r=>r.qty+'x '+r.name+' '+r.L+'x'+r.B).join('; '));
// Modulbreiten aus boxes: Seiten
for (const b of R.boxes) { const r=R.rows.find(r=>r.key===b.key); if (r.name==='Seite') { const B=bb(b); console.log('  Seite x',B.x0,B.x1,'z',B.z0,B.z1); } }
// Kippmass je Orientierung
for (const [h,d,w] of [[2118,390,789],[2118,290,493]]) console.log('Modul',h,d,w,'Diag h/d',Math.hypot(h,d).toFixed(0),'Diag h/w',Math.hypot(h,w).toFixed(0));
// Leiter-Methode: Modul liegend durch Tuer (Querschnitt 390 x 789), innen an Rueckwand aufrichten, Raumtiefe 1400
function ladder(L, th, roomD, doorH){ let worst=0; for (let x=L; x>=Math.sqrt(Math.max(0,L*L-(2400-5)**2)); x-=5){ const h=Math.sqrt(L*L-x*x); const phi=Math.atan2(h,x); let hDoor = x>roomD ? h*(x-roomD)/x + th/Math.cos(phi) : 0; worst=Math.max(worst,hDoor);} return worst.toFixed(0); }
console.log('Leitermethode max. Hoehe in Tuerebene (Dicke 390):', ladder(2118,390,1400,2000), ' (Dicke 789):', ladder(2118,789,1400,2000), ' Ueberstand aussen beim Start', 2118-1400);
// RM-4 Wangen
for (const [rh, d] of [[2400,400],[2400,300],[2400,200],[2300,400]]) {
  const R2 = computeReduit({ ...BASE, sys:'cheeks', shape:'I', rh, dBack:d });
  const w = R2.rows.find(r=>r.name==='Wange');
  console.log('rh',rh,'Tiefe',d,'Wange',w.L,'x',w.B,'Diag Ebene',Math.hypot(w.L,w.B).toFixed(0),'Diag hochkant',Math.hypot(w.L,18).toFixed(1),'oberstes Tablar OK', Math.max(...R2.boxes.map(b=>bb(b).y1).filter(y=>y<w.L-5)));
}
