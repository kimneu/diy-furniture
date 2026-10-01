const { K, BASE, run } = require('./RM_lib.js');
const R = run({ shape:'U', build:'free' });
console.log('modules', R.modules, 'warn', R.warn);
const sides = R.boxes.filter(b => R.rows.find(r=>r.key===b.key && r.name==='Seite'));
// Module aus Seiten rekonstruieren: Seiten-Boxen gruppieren
for (const b of sides) console.log('Seite size', b.size.map(Math.round), 'pos', b.pos.map(Math.round), 'x', [b.pos[0]-b.size[0]/2, b.pos[0]+b.size[0]/2].map(Math.round), 'z', [b.pos[2]-b.size[2]/2, b.pos[2]+b.size[2]/2].map(Math.round));
console.log('rows'); R.rows.forEach(r=>console.log(r.pos, r.qty, r.name, r.L, r.B, r.t, r.note));
console.log('hw'); R.hw.forEach(h=>console.log(h[0], h[1], '|', h[2]));
console.log('steps'); R.steps.forEach((s,i)=>console.log(i+1, s[0], '–', s[1]));
const top = Math.max(...sides.map(b=>b.size[1]));
console.log('Modulhöhe', top, 'Türhöhe (3D)', R.room.doorH, 'Raumtiefe', R.D, 'Raumbreite', R.W, 'Raumdiagonale', Math.round(Math.hypot(R.W,R.D)));
for (const dep of [290, 390, 590]) console.log('Kippmass Modul', top, '×', dep, '=', Math.round(Math.hypot(top, dep)), 'Raumhöhe', R.H);
