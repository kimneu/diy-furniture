const { run, overlaps, rng, nm } = require('./TR-verify-lib.js');
function show(label, o, A, B){ const R = run(o); const x = overlaps(R,A,B); console.log(label, A,'x',B,'->',x.length); if (x[0]) console.log('   z.B.', nm(x[0].a), rng(x[0].a), ' / ', nm(x[0].b), rng(x[0].b), ' ov', x[0].o); return R; }
let R = show('posts U', {shape:'U', sys:'posts'}, 'Tablar', 'Kantholz');
console.log('  max', R.max, 'levels', shelfLevels(5,150,300,2400));
for (const b of R.boxes.filter(b=>b.key.startsWith('Kantholz'))) console.log('  Pfosten', rng(b));
console.log('  tools:', R.tools.join(' ; '));
console.log('  Schritte:', R.steps.map(s=>s[0]).join(' / '));
console.log('  Text mit ausklink/Stichs:', JSON.stringify(R).match(/ausklink|Stichs|Aussparung|Ausschnitt/gi));
show('rails U Tür innen L', {shape:'U', sys:'rails', doorIn:true, hinge:'L'}, 'Tablar', 'Kantholz');
show('battens gon 2400 I', {shape:'I', sys:'battens', mat:'gon_fichte', t:18, rw:2400}, 'Tablar', 'Kantholz');
show('battens gon 2400 U', {shape:'U', sys:'battens', mat:'gon_fichte', t:18, rw:2400}, 'Tablar', 'Kantholz');
show('posts U', {shape:'U', sys:'posts'}, 'Eckleiste', 'Latte');
show('battens U', {shape:'U', sys:'battens'}, 'Eckleiste', 'Leiste');
R = show('rails U', {shape:'U', sys:'rails'}, 'Tablar', 'METAL');
for (const r of R.rows.filter(r=>r.name==='Tablar')) console.log('  ', r.qty, r.name, r.L,'x',r.B,'x',r.t, r.note);
show('brackets U', {shape:'U', sys:'brackets'}, 'Tablar', 'METAL');
R = show('battens gon U Eckleiste', {shape:'U', sys:'battens', mat:'gon_fichte', t:18}, 'Eckleiste', 'Leiste');
for (const r of R.rows.filter(r=>r.name==='Eckleiste')) console.log('  row', r.qty, r.name, r.L,'x',r.B,'x',r.t, r.note);
for (const b of R.boxes.filter(b=>b.key.startsWith('Eckleiste')).slice(0,1)) console.log('  box size', b.size);
