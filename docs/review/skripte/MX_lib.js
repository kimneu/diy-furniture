const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
const FORM = {
  kind:'sideboard', w:'1200', h:'720', d:'400', room:'living', mat:'birke', t:'18', back:'hdf3', top:'over',
  sections:'2', shelves:'1', base:'legs', baseH:'160', legShape:'cone', taper:'35', legColor:'oak', joint:'pocket',
  front:'hinged', doorsPer:'auto', slideN:'auto', handle:'hole', color:'korpus', frontMat:'korpus', frontT:'18',
  sheetL:'1500', sheetB:'3000', kerf:'4', grain:true, price:'100',
  rw:'1600', rd:'1400', rh:'2400', doorW:'800', doorIn:false, hinge:'L', wall:'solid',
  shape:'U', corner:'L', build:'built', sys:'battens', dBack:'400', dLeft:'300', dRight:'300',
  nShelves:'5', gapBottom:'150', gapTop:'300',
  nicheL:false, nicheLW:'450', nicheLH:'1300', nicheR:false, nicheRW:'450', nicheRH:'1300'
};
const withCat = d => { const M = MATS[d.mat], t = M.t.includes(Number(d.t)) ? Number(d.t) : M.tDef; return { ...d, t, price:matPrice(M, t), sheetL:M.sheet[0], sheetB:M.sheet[1] }; };
const run = d => K.computeData(withCat(d));
const hard = R => R.warn.filter(w => !K.HARMLOS.test(w));
function seeded(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function lcg(seed){ let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
module.exports = { K, FORM, withCat, run, hard, seeded, lcg };
