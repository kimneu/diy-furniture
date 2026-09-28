const { K, FORM, run, hard } = require('./MX_lib.js');
for (const mat of ['dekorspan','osb','mdf','birke','eiche','fichte']) {
  const R = run({ ...FORM, mat, t:String(MATS[mat].tDef), room:'bath', back:'ply6' });
  console.log(mat, '| Bad-Hinweise:', R.warn.filter(w => /^Bad/.test(w)).map(w => w.slice(0,70)), '| hart', hard(R).length, '| Oberfläche:', R.finish.map(f => f[1].slice(0,40)).join('; '));
}
