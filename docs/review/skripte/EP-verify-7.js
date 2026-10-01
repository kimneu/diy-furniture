// Zufall-Scan: wie oft entstehen die Eckprobleme ohne (nicht harmlose) Warnung?
const L = require('./EP-verify-lib.js');
const K = require(require('path').join(__dirname, '../../..') + '/konfig.js');
const fs = require('fs');
const src = fs.readFileSync(require('path').join(__dirname, '../../..') + '/test/konfig.test.js', 'utf8');
const FORM = eval('(' + src.match(/const FORM = (\{[\s\S]*?\n\});/)[1] + ')');
function seeded(s){ return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
const rnd = seeded(42);
const st = { n:0, sys:{}, bracketsUnderFloor:0, brackets:0, postsInShelf:0, posts:0, cornerHiddenLt200:0, cornerCases:0, sideDeeper100:0, LU:0 };
for (let i = 0; i < 400; i++) {
  const d = K.zufall({ ...FORM, kind:'reduit', rw:1600 + Math.round(rnd()*8)*100, rd:1400, rh:2400 }, rnd);
  const R = K.computeData(d); st.n++;
  const key = d.build === 'free' ? 'free' : d.sys; st.sys[key] = (st.sys[key]||0) + 1;
  if (R.shape !== 'I') { st.LU++; if (Math.max(Number(d.dLeft), Number(d.dRight)) >= Number(d.dBack) + 100) st.sideDeeper100++; }
  if (d.build !== 'free' && d.sys === 'brackets') { st.brackets++; const m = R.extras.filter(e => e.type === 'metal'); if (Math.min(...m.map(e => e.pos[1] - e.size[1]/2)) < 0) st.bracketsUnderFloor++; }
  if (d.build !== 'free' && d.sys === 'posts') { st.posts++; if (L.overlaps(R.boxes).some(o => /Kantholz/.test(o.a+o.b) && /^Tablar/.test(o.a))) st.postsInShelf++; }
  if (R.shape !== 'I' && (d.build === 'free' || d.sys === 'cheeks')) {
    st.cornerCases++;
    const W = R.W, D = R.D, X = b => L.bb(b)[0].map(x => x + W/2), Z = b => L.bb(b)[2].map(z => z + D/2);
    const dB = Math.max(...R.boxes.filter(b => /^(Tablar|Einlegeboden)\|/.test(b.key) && Z(b)[0] < 20).map(b => Z(b)[1]));
    const vert = R.boxes.filter(b => /^(Wange|Seite)\|/.test(b.key) && Z(b)[0] >= dB - 1 && Z(b)[0] < dB + 5 && (X(b)[0] < 20 || X(b)[1] > W - 20));
    const shel = R.boxes.filter(b => /^(Tablar|Einlegeboden)\|/.test(b.key) && Z(b)[0] < 20 && (X(b)[0] < 60 || X(b)[1] > W - 60));
    let minOpen = Infinity;
    for (const c of vert) for (const s of shel) {
      if (X(c)[0] < 20 && X(s)[0] < 60) minOpen = Math.min(minOpen, X(s)[1] - X(c)[1]);
      if (X(c)[1] > W - 20 && X(s)[1] > W - 60) minOpen = Math.min(minOpen, X(c)[0] - X(s)[0]);
    }
    if (minOpen < 200) st.cornerHiddenLt200++;
  }
}
console.log(st);
// Leisten: Tablar "von unten mit 4 × 35 an Leisten" – Leiste steht hochkant
const b = L.R({ sys:'battens' });
const lei = b.boxes.find(x => x.key.startsWith('Leiste|'));
console.log('Wandleiste Box (x,y,z)', lei.size, 'Liste', b.rows.filter(r => r.name === 'Leiste').map(r => [r.qty, r.L, r.B, r.t]), 'Schrauben', b.hw.filter(h => /Holzschrauben/.test(h[1])).map(h => h.slice(0, 3).join(' ')));
// Pfostenrahmen: 5 x 70 durch Querlatte 24 in Pfosten 45
console.log('5x70: 24 + 45 =', 24 + 45, '→ Spitze', 70 - 69, 'mm hinten aus dem Pfosten');
