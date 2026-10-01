const { run } = require('./TR_base.js');
function posts(o, label){
  const R = run({ build:'built', sys:'posts', ...o });
  const P = R.boxes.filter(b => b.key.startsWith('Kantholz'));
  const Q = R.rows.filter(r => r.note.startsWith('Querlatte'));
  const s70 = R.hw.find(h => h[1].includes('5 × 70'));
  console.log(label, '| Pfosten', P.length, P.map(b => `(${Math.round(b.pos[0])},${Math.round(b.pos[2])})`).join(' '),
    '| Querlatten', Q.map(r => `${r.qty}×${r.L}`).join(', '), '| 5×70:', s70 ? s70[0] : 0, '| Warn:', R.warn.join(' / ') || '-');
}
posts({ shape:'U' }, 'U 1600×1400');
posts({ shape:'U', rd:1100 }, 'U 1600×1100');
posts({ shape:'L', corner:'L', rw:1200, rd:1200, doorW:700 }, 'L 1200×1200');
posts({ shape:'I', rw:790, rd:900, doorW:600 }, 'I 790');
posts({ shape:'I', rw:1500, rd:900, doorW:700 }, 'I 1500');
posts({ shape:'U', mat:'mdf', t:19 }, 'U MDF19');
posts({ shape:'U', rw:2000, rd:2000 }, 'U 2000×2000');
const R = run({ build:'built', sys:'posts', shape:'I', rw:790, rd:900, doorW:600 });
console.log(R.steps.find(s => s[0].startsWith('Latten'))[1]);
console.log(R.hw);
