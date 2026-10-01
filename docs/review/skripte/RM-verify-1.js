const { K, BASE, bb, collisions } = require('./RM-verify-lib.js');
for (const cfg of [
  {shape:'U', sys:'posts'}, {shape:'I', sys:'posts', rw:1600},
  {shape:'U', sys:'battens', doorIn:true, hinge:'L'}, {shape:'U', sys:'rails', doorIn:true, hinge:'L'}, {shape:'U', sys:'brackets', doorIn:true, hinge:'L'},
  {shape:'U', sys:'battens', nicheL:true},
  {shape:'I', sys:'battens', mat:'gon_fichte', rw:2400},
]) {
  const R = computeReduit({ ...BASE, ...cfg, ...(cfg.mat? {t:MATS[cfg.mat].tDef}:{}) });
  const c = collisions(R, (a,b)=> (a.startsWith('Tablar')&&b.startsWith('Kantholz'))||(b.startsWith('Tablar')&&a.startsWith('Kantholz')));
  const tabl = R.rows.filter(r=>r.name==='Tablar').reduce((a,r)=>a+r.qty,0);
  const posts = R.rows.filter(r=>r.name.startsWith('Kantholz'));
  console.log(JSON.stringify(cfg), 'Tablare', tabl, 'Kanthoelzer', posts.map(r=>r.qty+'x'+r.L+' '+r.note).join('; '), 'Durchdringungen', c.length, c.slice(0,2).map(x=>x[2]).join(' / '));
  const tabs = R.rows.filter(r=>r.name==='Tablar').map(r=>r.qty+'x '+r.L+'x'+r.B+' '+r.note); console.log('  ', tabs.join(' ; '));
}
// Detail: ein Pfosten und das Tablar
const R = computeReduit({ ...BASE });
const c = collisions(R, (a,b)=> a.startsWith('Tablar')&&b.startsWith('Kantholz'));
console.log(c[0]);
