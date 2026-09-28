const { K, BASE, run } = require('./RM_lib.js');
const rng = b => ({ x:[b.pos[0]-b.size[0]/2, b.pos[0]+b.size[0]/2], y:[b.pos[1]-b.size[1]/2, b.pos[1]+b.size[1]/2], z:[b.pos[2]-b.size[2]/2, b.pos[2]+b.size[2]/2] });
// Türöffnung ohne Zarge
for (const o of [{rw:1400, doorW:800, dLeft:300, dRight:300}, {rw:1300, doorW:800, dLeft:250, dRight:250}]) {
  const R = run({ shape:'U', sys:'battens', ...o });
  const wf = (o.rw - o.doorW)/2;
  const endl = R.boxes.map(b=>({b, r:R.rows.find(r=>r.key===b.key)})).filter(n=>n.r.note.startsWith('Endleiste') && rng(n.b).z[1] > R.D/2 - 30);
  console.log(JSON.stringify(o), 'wf', wf, 'Warnung Türöffnung:', R.warn.some(w=>/Türöffnung/.test(w)), '| Tablar-Vorderkante bis Öffnungskante:', wf - o.dLeft, 'mm | Endleiste an Vorderwand endet', wf - (o.dLeft - 20), 'mm vor der Öffnung');
}
// Wangen in der Ecke (U)
const R = run({ shape:'U', sys:'cheeks' });
const ch = R.boxes.map(b=>({b, r:R.rows.find(r=>r.key===b.key)})).filter(n=>n.r.name==='Wange').map(n=>rng(n.b));
ch.filter(g => g.x[0] < -400 && g.z[0] < -250).forEach(g=>console.log('Wange x', g.x.map(Math.round), 'z', g.z.map(Math.round), 'h', Math.round(g.y[1])));
const sh = R.boxes.map(b=>({b, r:R.rows.find(r=>r.key===b.key)})).filter(n=>n.r.name==='Tablar').map(n=>rng(n.b)).filter(g=>g.z[0] < -600 && g.x[0] < -700);
console.log('hinteres Tablar in der Ecke x', sh[0].x.map(Math.round), 'z', sh[0].z.map(Math.round));
console.log('steps cheeks:', R.steps.map(s=>s[0]).join(' → '));
console.log(R.steps.find(s=>/Wangen/.test(s[0])));
