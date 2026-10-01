const { mk, f } = require('./EG_lib.js');
for (const over of [
  { shape:'U' }, { shape:'L', corner:'L' }, { shape:'L', corner:'R' },
  { shape:'U', rd:1000 }, { shape:'U', rd:1200 }, { shape:'L', corner:'L', rw:1200, rd:1100 },
  { shape:'U', mat:'regalbau' }, { shape:'U', mat:'gon_fichte' }, { shape:'U', nicheL:true }, { shape:'U', doorIn:true, hinge:'L' },
]) {
  const { R, items, c } = mk({ sys:'posts', ...over });
  const W = R.W, D = R.D;
  const posts = items.filter(i => i.name === 'Kantholz 45 × 45');
  const ql = items.filter(i => i.note && i.note.startsWith('Querlatte') && Math.abs(i.y0 - (150 - 48)) < 1);
  const back = posts.filter(p => p.z1 <= -D/2 + c.dBack - 23 && p.z0 < -D/2 + c.dBack);
  const lefts = posts.filter(p => p.x1 < -W/2 + (c.dLeft || 0) + 1 && p.z0 >= -D/2 + c.dBack - 1);
  const rights = posts.filter(p => p.x0 > W/2 - (c.dRight || 0) - 1 && p.z0 >= -D/2 + c.dBack - 1);
  const fmt = a => a.map(p => `x ${f(p.x0)}..${f(p.x1)} z ${f(p.z0)}..${f(p.z1)}`).join(' | ') || 'KEINER';
  console.log(JSON.stringify(over), '→ Pfosten total', posts.length);
  console.log('   hinten:', fmt(back));
  console.log('   links :', fmt(lefts));
  console.log('   rechts:', fmt(rights));
  for (const q of ql) {
    // freie Kragarm-/Endlängen der Querlatte bis zum nächsten Pfosten
    const along = q.x1 - q.x0 > q.z1 - q.z0 ? 'x' : 'z';
    const lo = along === 'x' ? q.x0 : q.z0, hi = along === 'x' ? q.x1 : q.z1;
    const onit = posts.filter(p => along === 'x' ? (p.z1 <= q.z0 + 0.5 && p.z1 >= q.z0 - 0.5) : (Math.abs(p.x1 - q.x0) < 0.6 || Math.abs(p.x0 - q.x1) < 0.6)).map(p => along === 'x' ? [p.x0, p.x1] : [p.z0, p.z1]).sort((a,b)=>a[0]-b[0]);
    const firstGap = onit.length ? onit[0][0] - lo : hi - lo, lastGap = onit.length ? hi - onit[onit.length-1][1] : hi - lo;
    console.log(`   Querlatte ${along} ${f(lo)}..${f(hi)} (${f(hi-lo)}): Pfosten ${onit.length}, frei am Anfang ${f(firstGap)}, am Ende ${f(lastGap)}`);
  }
  console.log('   screw70', R.hw.filter(h => /5 × 70/.test(h[1])).map(h => h[0] + ' ' + h[2]).join(';'));
}
