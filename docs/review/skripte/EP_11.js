const { run, bb, nameOf } = require('./EP_lib.js');
function cornerView(o, label){
  const R = run(o);
  console.log('==', label, '| warn:', R.warn.join(' / ') || '–');
  // Teile im linken hinteren Eckbereich auf Höhe des 2. Tablars
  const y = 638 + 5;
  for (const b of R.boxes) { const q = bb(b, R); if (q.lo[0] < (o.dLeft||300) + 100 && q.lo[2] < (o.dBack||400) + 150 && q.lo[1] <= y && q.hi[1] >= y - 30) console.log('  ', nameOf(R,b).padEnd(70), 'x', q.lo[0], '–', q.hi[0], ' z', q.lo[2], '–', q.hi[2], ' y', q.lo[1], '–', q.hi[1]); }
  return R;
}
let R = cornerView({ sys:'cheeks' }, 'Wangen Standard-U');
console.log('Steps:', R.steps.map(s=>s[0]).join(' · '));
R = cornerView({ build:'free' }, 'Selbststehend Standard-U');
console.log('Steps:', R.steps.map(s=>s[0]+': '+s[1]).join('\n  '));
R = cornerView({ sys:'cheeks', rw:2000, dBack:200, dLeft:600, dRight:600 }, 'Wangen dB200/Seiten600');
R = cornerView({ build:'free', rw:2000, dBack:200, dLeft:600, dRight:600 }, 'Frei dB200/Seiten600');
