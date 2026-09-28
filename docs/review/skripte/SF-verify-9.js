const { K, FORM, seeded, sb } = require('./SF-verify-lib.js');
const f = (lbl, o) => { const { R } = sb(o); console.log(lbl, JSON.stringify(R.finish)); const s = R.steps.find(x => /lackieren|ölen|versäubern/.test(x[0])); console.log('   step', s && s[0]+': '+s[1]); };
f('dekorspan front salbei', { frontMat:'dekorspan', frontT:'19', color:'salbei' });
f('dekorspan all anthrazit', { mat:'dekorspan', t:'19', color:'anthrazit' });
f('eiche front weiss', { frontMat:'eiche', frontT:'18', color:'weiss' });
f('mdf korpus eiche front weiss', { mat:'mdf', t:'19', frontMat:'eiche', frontT:'18', color:'weiss' });
f('fichte korpus weiss', { mat:'fichte', t:'18', color:'weiss' });
// Zufall: painted non-MDF fronts
const rnd = seeded(42); const c = {}; let n=0;
for (let i=0;i<1000;i++){ const d=K.zufall({...FORM}, rnd); if(d.front==='open') continue; n++; const R=K.computeData(d); const fm = Object.keys(MATS).find(k=>MATS[k]===R.MF); const painted = d.color!=='korpus'; const k = fm+(painted?' lackiert':' natur'); c[k]=(c[k]||0)+1; }
console.log(n, c);
