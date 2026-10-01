const { K, CFG } = require('./DY_cfg.js');
for (const sys of ['battens','rails','posts']) {
  const R = K.computeData({ ...CFG.RD7, wall:'drywall', sys });
  console.log(sys, R.hw.filter(h=>/dübel|Dübel/i.test(h[1])).map(h=>h.join(' | ')), R.tools.filter(t=>/Bohr/.test(t)));
  console.log('  ', R.warn.filter(w=>/Gipskarton/.test(w)));
  console.log('  ', R.steps.filter(s=>/Hohlraum|Ständer/.test(s[1])).map(s=>s[0]+': '+s[1]));
}
