const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
const FORM = {
  kind:'sideboard', w:'1200', h:'720', d:'400', room:'living', mat:'birke', t:'18', back:'hdf3', top:'over',
  sections:'2', shelves:'1', base:'legs', baseH:'160', legShape:'cone', taper:'35', legColor:'oak', joint:'pocket',
  front:'hinged', doorsPer:'auto', slideN:'auto', handle:'hole', color:'korpus',
  sheetL:'1500', sheetB:'3000', kerf:'4', grain:true, price:'100', frontMat:'korpus'
};
function seeded(seed){
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const sb = o => { const d = K.withCatalog({ ...FORM, ...o }); if (o.t) d.t = Number(o.t); return { d, R: K.computeData(d) }; };
module.exports = { K, FORM, seeded, sb };
