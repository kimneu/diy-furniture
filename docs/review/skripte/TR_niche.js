const { run } = require('./TR_base.js');
const R = run({ shape:'U', sys:'posts', build:'built', nicheL:true, nicheLW:450, nicheLH:1300 });
const side = b => b.pos[0] < -400 && b.pos[2] > -300; // linke Seite
const P = R.boxes.filter(b => b.key.startsWith('Kantholz') && side(b));
for (const b of P) console.log('Pfosten links z', Math.round(b.pos[2]-22.5), '..', Math.round(b.pos[2]+22.5), 'x', Math.round(b.pos[0]-22.5),'..',Math.round(b.pos[0]+22.5), 'h', b.size[1]);
const Q = R.boxes.filter(b => b.key.includes('Querlatte') && side(b));
for (const b of Q) console.log('Querlatte links y', Math.round(b.pos[1]-24), 'z', Math.round(b.pos[2]-b.size[2]/2), '..', Math.round(b.pos[2]+b.size[2]/2));
const T = R.boxes.filter(b => b.key.startsWith('Tablar') && side(b));
for (const b of T) console.log('Tablar links y', Math.round(b.pos[1]-9), 'z', Math.round(b.pos[2]-b.size[2]/2), '..', Math.round(b.pos[2]+b.size[2]/2));
console.log(R.warn);
