const { run, K, FORM } = require('./SK-verify-lib.js');
const show = (o) => { const R = run(o); const sh = R.rows.find(r=>r.name==='Einlegeboden'); console.log(JSON.stringify(o), sh && [sh.L, sh.B, sh.t], 's', R.s.toFixed(1), 'SPAN', maxSpan(o.mat, o.t||MATS[o.mat].tDef), R.warn); };
show({mat:'mdf', t:19, W:1600, sections:2, shelves:1});
show({mat:'dekorspan', t:16, W:1400, sections:2, shelves:1});
show({mat:'osb', t:12, W:1400, sections:2, shelves:1});
show({mat:'mdf', t:22, W:1900, sections:2, shelves:1});
// Zufall stats
function seeded(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = seeded(42); let withSh=0, over=0; const by={};
for (let i=0;i<1000;i++){ const d = K.zufall({...FORM}, rnd); const R = K.computeData(d); if (Number(d.shelves)>0){ withSh++; if (R.s > maxSpan(d.mat, Number(d.t))) { over++; const k=d.mat+' '+d.t; by[k]=(by[k]||0)+1; } } }
console.log('withShelves', withSh, 'over SPAN', over, by);
// deflection
const q=0.294; const defl=(E,t,b,L,kdef)=>{const I=b*t**3/12; return 5*q*L**4/(384*E*I)*(1+kdef)};
console.log('MDF19 772 E3000 kdef2.25', defl(3000,19,387,772,2.25).toFixed(2), 'at 550', defl(3000,19,387,550,2.25).toFixed(2));
console.log('Birke18 773 E9000 kdef0.8', defl(9000,18,387,773,0.8).toFixed(2));
console.log('Span16 674 E2500 kdef2.25', defl(2500,16,387,674,2.25).toFixed(2));
