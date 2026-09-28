const { run } = require('./SK-verify-lib.js');
for (const [mat,t,base] of [['birke',12,'legs'],['seekiefer',15,'legs'],['birke',18,'legs'],['birke',12,'plinth'],['eiche',27,'plinth']]) {
  const R = run({mat,t,base, baseH: base==='legs'?160:80});
  console.log(mat,t,base, R.hw.filter(h=>/Holzschrauben|Stahlwinkel|Möbelfüsse/.test(h[1])).map(h=>h.join(' | ')));
  const st = R.steps.find(s=>/Füsse|Sockel/.test(s[0])); console.log('  ', st && st[1], '|', st && st[2]);
  console.log('   warn', R.warn);
}
