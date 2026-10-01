const { run } = require('./SK-verify-lib.js');
let R = run({W:1800, sections:3, shelves:2, front:'sliding'});
const side = R.rows.find(r=>r.name==='Seite'), sh = R.rows.find(r=>r.name==='Einlegeboden'), mw = R.rows.find(r=>r.name==='Mittelwand');
console.log('Seite', side.L, side.B, side.note, '| Tablar', sh.L, sh.B, '| MW', mw.L, mw.B, mw.note, 'tf', R.tf, 'Dp', R.Dp);
console.log('Tablar-VK hinter Seiten-VK:', side.B - sh.B);
R = run({W:800, sections:1, shelves:1, front:'sliding'});
console.log(R.rows.map(r=>[r.name,r.L,r.B,r.t].join(' ')), R.warn);
console.log(R.steps.find(s=>s[0].includes('Bodenträger')));
// with frontT 12
R = run({W:1800, sections:3, shelves:2, front:'sliding', frontMat:'birke', frontT:12});
const s2 = R.rows.find(r=>r.name==='Seite'), sh2 = R.rows.find(r=>r.name==='Einlegeboden');
console.log('tf', R.tf, 'diff', s2.B - sh2.B, R.warn);
// Where does track sit? slides z
R = run({W:1800, sections:3, shelves:2, front:'sliding'});
console.log('D',R.D,'slides z', R.slides.map(s=>s.z), 'track', R.extras.filter(e=>e.type==='track'));
