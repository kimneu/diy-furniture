const { K, FORM } = require('./RG_lib.js');
const { sperren } = require('./RG_regeln.js');
function lcg(seed){ let s = seed >>> 0; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; }
for (const [kind, seed] of [['sideboard', 12345], ['reduit', 987654]]) {
  const rnd = lcg(seed), cnt = {}; let bad = 0;
  for (let i = 0; i < 400; i++) {
    const d = K.zufall({ ...FORM, kind }, rnd);
    const s = sperren(d);
    if (s.length) bad++;
    for (const x of s) { const id = x.split(' ')[0] + ' ' + x.split(' ').slice(1).join(' ').replace(/\d+/g, '#'); cnt[id] = (cnt[id] || 0) + 1; }
  }
  console.log(kind, 'Würfe mit Sperrverstoss:', bad, '/ 400', cnt);
}
