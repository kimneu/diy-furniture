const { K, BASE, run } = require('./RM_lib.js');
const R = run({ shape:'U', rw:1200, doorW:800, doorIn:true, hinge:'L', dLeft:300, dRight:150, sys:'posts' });
console.log(R.warn);
const l = layoutReduit(normReduit({ ...BASE, shape:'U', rw:1200, doorW:800, doorIn:true, hinge:'L', dLeft:300, dRight:150 }).cfg);
console.log('wf', l.wf, l.segs.map(s=>[s.id, s.depth, s.u0, s.u1, s.ends.join('/')].join(' ')));
