const { run } = require('./SK-verify-lib.js');
for (const [mat,t,top] of [['mdf',19,'over'],['eiche',27,'over'],['birke',18,'between'],['dekorspan',16,'between'],['osb',12,'between'],['seekiefer',15,'over']]) {
  const R = run({mat,t,joint:'screws', top});
  console.log(mat,t, R.hw.filter(h=>/chraube/.test(h[1])).slice(0,1).map(h=>h.join(' | ')));
  console.log('   ', R.steps.find(s=>/Schraub/.test(s[0])).slice(1).join(' || '));
  console.log('   tools', R.tools.filter(x=>/Senker|Stufen/.test(x)), 'warn', R.warn);
}
