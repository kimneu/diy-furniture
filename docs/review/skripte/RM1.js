const { K, BASE, run } = require('./RM_lib.js');
const R = run({ shape:'U', sys:'battens', build:'built' });
console.log('warn', R.warn);
console.log('levels', shelfLevels(5,150,300,2400));
console.log('room', R.room);
console.log('steps'); R.steps.forEach((s,i)=>console.log(i+1, s[0]));
console.log('hw'); R.hw.forEach(h=>console.log(h));
console.log('rows'); R.rows.forEach(r=>console.log(r.pos, r.qty, r.name, r.L, r.B, r.t, r.note));
