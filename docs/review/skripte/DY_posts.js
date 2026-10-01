const { K, CFG } = require('./DY_cfg.js');
const R = K.computeData(CFG.RD7);
const bb = b => [0,1,2].map(i => [b.pos[i]-b.size[i]/2, b.pos[i]+b.size[i]/2]);
const ov = (a,b) => bb(a).map((r,i)=>Math.min(r[1],bb(b)[i][1]) - Math.max(r[0],bb(b)[i][0]));
const posts = R.boxes.filter(b=>b.key.startsWith('Kantholz')), shelves = R.boxes.filter(b=>b.key.startsWith('Tablar'));
let n=0; for (const p of posts) for (const s of shelves) { const o = ov(p,s); if (o.every(x=>x>0.5)) { n++; if (n<=4) console.log('Pfosten', bb(p).map(r=>r.map(Math.round).join('..')).join(' / '), 'schneidet Tablar', bb(s).map(r=>r.map(Math.round).join('..')).join(' / '), 'Überlappung', o.map(Math.round)); } }
console.log('Anzahl Pfosten×Tablar-Durchdringungen:', n, 'Pfosten', posts.length, 'Tablare', shelves.length);
console.log('Notes Tablar:', [...new Set(R.rows.filter(r=>r.name==='Tablar').map(r=>r.note))], 'Werkzeug Stichsäge?', R.tools.some(t=>/Stichsäge/.test(t)));
