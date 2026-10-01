const { RD, SB, bb, ov } = require('./DY-verify-lib.js');
const R = SB({ front:'sliding', handle:'shell', sections:'2', shelves:'1' });
console.log('tf', R.tf, 'D', R.D, 'Wi', R.Wi);
R.slides.forEach(s => console.log('Schiebetür', s.idx, 'x', (s.cx - s.ws/2).toFixed(0), '..', (s.cx + s.ws/2).toFixed(0), 'z', (s.z - R.tf/2).toFixed(1), '..', (s.z + R.tf/2).toFixed(1), 'y', (s.yc - s.dh/2).toFixed(0), '..', (s.yc + s.dh/2).toFixed(0)));
const sh = R.boxes.find(b=>b.key.startsWith('Einlegeboden')); console.log('Einlegeboden y', sh.pos[1], 'z bis', sh.pos[2] + sh.size[2]/2);
console.log('Stift vorne (40 mm ab Seitenvorderkante) z =', 200 - 40, '± 2.5');
// Posts: Eckleiste
const R7 = RD({ sys:'posts' });
const eck = R7.boxes.filter(b=>b.key.startsWith('Eckleiste')), lat = R7.boxes.filter(b=>b.key.startsWith('Latte'));
const e = eck[0]; console.log('Eckleiste', bb(e).map(r=>r.map(Math.round).join('..')).join(' / '));
for (const l of lat) { const o = ov(e,l); if (o.every(x=>x>0.5)) console.log('  kollidiert mit', l.key.split('|')[5], bb(l).map(r=>r.map(Math.round).join('..')).join(' / '), 'Überlappung', o.map(Math.round)); }
console.log('Schritt Eckstösse:', R7.steps.find(s=>/Eck/.test(s[0]))[1]);
// Querlatte ends: fixed to wall?
console.log('Querlatte-Notizen:', [...new Set(R7.rows.filter(r=>/Querlatte/.test(r.note)).map(r=>r.note))], '| Tablar-Auflage auf Wandlatte:', 24-3, 'mm');
