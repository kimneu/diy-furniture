const { K, FORM, sb, rd, hard } = require('./MX-verify-lib.js');
for (const [mat, front] of [['eiche','hinged'],['fichte','hinged'],['eiche','sliding'],['dreischicht','hinged'],['fichte','sliding']]) {
  const { R } = sb({ mat, t:'18', w:'1000', h:'1400', d:'400', base:'plinth', baseH:'80', front, sections:'2', shelves:'2', handle: front==='sliding'?'shell':'hole' });
  const dr = R.rows.filter(r=>r.kind==='front').map(r=>`${r.qty}× ${r.name} ${r.L}×${r.B}×${r.t}`);
  console.log('MX9', mat, front, dr.join('; '), '| hard', JSON.stringify(hard(R)));
}
// MX-10
{ const { R } = sb({ mat:'dekorspan', t:'19', room:'bath', back:'ply6' });
  console.log('MX10 warn', JSON.stringify(R.warn));
  console.log('   finish', JSON.stringify(R.finish.map(f=>f[1])));
  console.log('   steps', R.steps.map(s=>s[0]).join(' > '));
  const s = R.steps.find(s=>/versiegeln/.test(s[0])); console.log('   ', s[1]);
}
// MX-14
for (const [fm, ft, color] of [['osb','18','salbei'],['dekorspan','16','salbei'],['eiche','18','salbei'],['seekiefer','12','weiss']]) {
  const { R } = sb({ mat:'birke', t:'18', frontMat:fm, frontT:ft, color });
  console.log('MX14', fm, ft, color, 'tf', R.tf, 'hard', JSON.stringify(hard(R)), '| finish', R.finish.map(f=>f[1]).join(' / '));
  const st = R.steps.find(s=>/ölen|lackieren|Kanten/.test(s[0])); console.log('    step', st[0], '::', st[1].slice(-110));
}
{ const { R } = sb({ mat:'dekorspan', t:'19', frontMat:'korpus', color:'salbei' });
  console.log('MX14 dekorspan korpus painted: finish', R.finish.map(f=>f[1]).join(' / '));
  const st = R.steps.find(s=>/Kanten/.test(s[0])); console.log('    step', st[0], '::', st[1]); }
