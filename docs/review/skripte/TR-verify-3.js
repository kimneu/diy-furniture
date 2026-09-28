const { run } = require('./TR-verify-lib.js');
for (const [label,o] of [['rails U',{shape:'U',sys:'rails'}],['brackets U',{shape:'U',sys:'brackets'}],['battens U',{shape:'U',sys:'battens'}],['rails I gon 2400',{shape:'I',sys:'rails',mat:'gon_fichte',t:18,rw:2400}], ['brackets I regalbau 2400',{shape:'I',sys:'brackets',mat:'regalbau',t:16,rw:2400}]]) {
  const R = run(o);
  console.log('=====', label, 'max', R.max);
  for (const h of R.hw) console.log('   hw', h[0], '|', h[1], '|', h[2], '|', h[3]);
  for (const w of R.warn) console.log('   warn', w);
  const rs = R.extras.filter(e=>e.type==='metal' && e.size[1] > 500);
  if (rs.length) console.log('   Schienen-Boxen', rs.length, 'y', rs[0].pos[1]-rs[0].size[1]/2, '..', rs[0].pos[1]+rs[0].size[1]/2, 'Positionen x/z', rs.map(b=>Math.round(label.includes('I')?b.pos[0]:(Math.abs(b.pos[2]+700)<20? b.pos[0]: b.pos[2]))).join(','));
  for (const r of R.rows.filter(r=>/Stossleiste|Tablar|Eckleiste/.test(r.name))) console.log('   row', r.qty, r.name, r.L,'x',r.B,'x',r.t,'|',r.note);
}
