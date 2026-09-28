const { K, FORM, run, hard } = require('./MX_lib.js');
for (const [mat, t, joint] of [['osb',12,'dowels'],['seekiefer',12,'cam'],['seekiefer',15,'cam'],['fichtesp',24,'cam'],['dekorspan',16,'screws'],['osb',18,'screws'],['eiche',18,'pocket'],['birke',12,'pocket']]) {
  const R = run({ ...FORM, mat, t:String(t), joint, shelves:'1', sections:'2' });
  console.log(`\n## ${mat} ${t} ${joint} | hard: ${hard(R).length}`);
  for (const s of R.steps) if (/Dübel|Exzenter|Bodenträger|Schraub|Taschen/.test(s[0])) console.log(' -', s[0], ':', s[1].slice(0, 330));
  for (const h of R.hw.slice(0,3)) console.log('   hw:', h.slice(0,3).join(' | '));
  console.log('   tools:', R.tools.filter(x => /Bohr|Senk|Lehre|Dübel/.test(x)).join('; '));
}
