const { K, FORM, run, hard } = require('./MX_lib.js');
const fm = Object.keys(MATS).filter(k => !MATS[k].boards && frontTs(MATS[k]).length);
console.log('Frontmaterialien:', fm.map(k => `${k}[${frontTs(MATS[k])}]`).join(' '));
const key = w => w.replace(/\d+/g,'#').slice(0,80);
// Fronten: Korpus Birke 18, Drehtür/Schiebetür, Höhe 720 (Sideboard) und 1400 ohne Untergestell (Highboard)
for (const [label, dims] of [['Sideboard 1200x720 Füsse 160', {}], ['Highboard 1000x1400 Sockel 80', { w:'1000', h:'1400', base:'plinth', baseH:'80', sections:'2' }]]) {
  console.log('\n==', label);
  for (const front of ['hinged','sliding']) for (const f of fm) for (const ft of frontTs(MATS[f])) for (const color of ['korpus','salbei']) {
    const d = { ...FORM, ...dims, front, frontMat:f, frontT:String(ft), color, handle: front==='sliding'?'shell':'hole' };
    const R = run(d);
    const h = hard(R);
    const hw = R.hw.filter(x => /Topf|Schiebe/.test(x[1])).map(x => x[1].slice(0,40));
    const fin = R.finish.map(x => x[1].slice(0,30)).join('; ');
    const door = R.rows.filter(r => r.kind === 'front')[0];
    console.log(front, f, ft, color, '| Tür', door ? `${door.L}x${door.B}` : '-', '|', h.length ? h.map(key).join(' // ') : 'OK', '|', hw.join(', '), '|', fin);
  }
}
