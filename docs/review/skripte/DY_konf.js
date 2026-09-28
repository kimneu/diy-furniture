const { K, FORM } = require('./DY_cfg.js');
const R = K.computeData(K.withCatalog({ ...FORM, mat:'mdf', t:'19', joint:'screws', top:'between' }));
console.log(R.steps.find(s=>/Schraub/.test(s[0])));
console.log(R.hw.filter(h=>/Konfirmat|Abdeck/.test(h[1])), R.tools.filter(t=>/Stufen|Senker/.test(t)));
