const { K } = require('./SK-base.js');
function seeded(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const FORM = { kind:'sideboard', w:'1200', h:'720', d:'400', room:'living', mat:'birke', t:'18', back:'hdf3', top:'over', sections:'2', shelves:'1', base:'legs', baseH:'160', legShape:'cone', taper:'35', legColor:'oak', joint:'pocket', front:'hinged', doorsPer:'auto', slideN:'auto', handle:'hole', color:'korpus', sheetL:'1500', sheetB:'3000', kerf:'4', grain:true, price:'100', frontMat:'korpus' };
const rnd = seeded(99); const N = 1000; const c = { legsThin:0, plinthThin:0, eichePocket:0, spanScrews:0, doorsOnDiv:0, slideShelfSec1:0, grainOffSolid:0 };
for (let i = 0; i < N; i++) {
  const d = K.zufall({ ...FORM }, rnd), cf = K.cfgFromData(d), R = computeSideboard(cf);
  if (cf.base === 'legs' && cf.t < 18) c.legsThin++;
  if (cf.base === 'plinth' && cf.t < 18) c.plinthThin++;
  if (cf.mat === 'eiche' && cf.joint === 'pocket') c.eichePocket++;
  if (cf.mat === 'dekorspan' && cf.joint === 'screws') c.spanScrews++;
  if (R.hw.some(h => /halb aufliegend/.test(h[1])) && R.doors.length >= 2*cf.sections) c.doorsOnDiv++;
}
console.log(N, JSON.stringify(c));
