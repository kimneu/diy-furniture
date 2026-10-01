const { K, BASE, bb } = require(__dirname + '/RM-verify-lib.js');
const low = R => { const all=[...R.boxes, ...R.extras.filter(e=>e.type==='metal')]; return Math.min(...all.map(b=>bb(b).y0)); };
for (const cfg of [{shape:'I',sys:'brackets',gapBottom:150},{shape:'I',sys:'brackets',gapBottom:100},{shape:'U',sys:'brackets',gapBottom:150},{shape:'I',sys:'battens',gapBottom:0},{shape:'I',sys:'battens',gapBottom:30},{shape:'I',sys:'rails',gapBottom:50},{shape:'I',sys:'posts',gapBottom:30}]) {
  const R = computeReduit({ ...BASE, ...cfg });
  console.log(JSON.stringify(cfg), 'tiefster Punkt', low(R), 'warn', R.warn.filter(w=>/Boden/.test(w)).join('|')||'(keine Bodenwarnung)', '| Winkel', R.hw.filter(h=>/Blechkonsole/.test(h[1])).map(h=>h[0]+'x '+h[1]).join(', '));
}
// RM-11 Zarge
for (const cfg of [{shape:'U',rw:1400,doorW:800,dLeft:300,dRight:300,sys:'battens'},{shape:'U',rw:1300,doorW:800,dLeft:250,dRight:250,sys:'battens'}]) {
  const R = computeReduit({ ...BASE, ...cfg }); const lay = layoutReduit(normReduit({ ...BASE, ...cfg }).cfg);
  const end = R.boxes.filter(b=>{const r=R.rows.find(r=>r.key===b.key); return r.note==='Endleiste an der Stirnwand' && bb(b).z1 > 690 && bb(b).y0<200;}).map(b=>{const B=bb(b); return 'x '+(B.x0+cfg.rw/2)+'..'+(B.x1+cfg.rw/2);});
  console.log(JSON.stringify(cfg),'wf',lay.wf,'Tuer-Warnung', R.warn.filter(w=>/Türöffnung/.test(w)).length, 'Endleisten vorne', end.join(' ; '));
}
// RM-13 Schienen
for (const wall of ['solid','drywall']) { const R = computeReduit({ ...BASE, shape:'I', sys:'rails', wall }); const xs=[...new Set(R.extras.filter(e=>e.type==='metal' && e.size[1]>500).map(e=>e.pos[0]+800))]; console.log(wall,'Schienen bei', xs.join(', '), '| Warnung', R.warn.filter(w=>/Gipskarton/.test(w)).length, R.hw.filter(h=>/Dübel/.test(h[1])).map(h=>h[0]+' '+h[1]).join()); }
console.log('HARMLOS Gipskarton:', K.HARMLOS.test('Gipskarton trägt wenig: ...'));
// RM-14
const R14 = computeReduit({ ...BASE, sys:'posts' }); console.log('posts Dübel', R14.hw.filter(h=>/Dübel/.test(h[1])).map(h=>h[0]+' '+h[1]).join(), 'Latten:', R14.rows.filter(r=>r.name.startsWith('Latte')).map(r=>r.qty+'x'+r.L+' '+r.B+'x'+r.t+' '+r.note).join('; '));
