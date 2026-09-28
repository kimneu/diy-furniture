const { run, overlaps, rng, nm } = require('./TR-verify-lib.js');
function dump(label, o){
  const R = run(o);
  console.log('=====', label, 'max', R.max);
  for (const r of R.rows) if (/Latte|Kantholz|Eckleiste|Leiste|Tablar/.test(r.name)) console.log('  ', r.pos, r.qty, r.name, r.L,'x',r.B,'x',r.t,'|',r.note);
  for (const h of R.hw) console.log('   hw', h[0], h[1], '|', h[2]);
  for (const w of R.warn) console.log('   warn', w);
  const st = R.steps.find(s=>/Pfosten/.test(s[0])); if (st) console.log('   step', st[1]);
  const st2 = R.steps.find(s=>/Tablare auflegen/.test(s[0])); if (st2) console.log('   step', st2[1]);
  return R;
}
let R = dump('posts U std', {shape:'U', sys:'posts'});
// Querlatten an der Ecke, Ebene 150
for (const b of R.boxes.filter(b => /Querlatte|Endlatte/.test(b.key) && Math.abs(b.pos[1]-126)<1)) console.log('  y150', nm(b), rng(b));
dump('posts U 1600x1100', {shape:'U', sys:'posts', rd:1100});
dump('posts I 790x900', {shape:'I', sys:'posts', rw:790, rd:900});
R = dump('posts U Nische L', {shape:'U', sys:'posts', nicheL:true});
for (const b of R.boxes.filter(b => /Kantholz/.test(b.key))) console.log('  Pfosten', rng(b));
for (const b of R.boxes.filter(b => /Querlatte/.test(b.key) && b.pos[0]<-400)) console.log('  QL links', rng(b));
console.log('  Nischenkante z =', -700 + 1400 - 450);
