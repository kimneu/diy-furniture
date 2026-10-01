const { run } = require('./SK-verify-lib.js');
for (const [mat,t] of [['birke',12],['seekiefer',15],['fichtesp',24],['eiche',27],['birke',21],['mdf',16]]) {
  const R = run({mat, t, joint:'cam'});
  console.log(mat,t, 'warn', R.warn, R.hw.filter(h=>/Exzenter|Dübel/.test(h[1])).map(h=>h.join(' | ')));
}
const R = run({mat:'birke', t:12, joint:'cam'});
console.log(R.steps.find(s=>/Exzenter/.test(s[0])));
// sheet check for birke 12 default: which parts unplaced?
