const { run, K, FORM } = require('./SK-verify-lib.js');
const M = MATS.dekorspan;
const R = run({room:'bath', mat:'dekorspan', t:19, back:'ply6', sheetL:M.sheet[0], sheetB:M.sheet[1], price:matPrice(M,19)});
console.log('warn', R.warn); console.log('finish', R.finish);
console.log(R.steps.map(s=>s[0]));
console.log(R.steps.find(s=>/versiegeln/.test(s[0]))[1]);
console.log(R.hw.map(h=>h.join(' | ')));
// Zufall bath
function seeded(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = seeded(5); const m={};
for (let i=0;i<1000;i++){ const d=K.zufall({...FORM, room:'bath'}, rnd); m[d.mat]=(m[d.mat]||0)+1; }
console.log(m);
