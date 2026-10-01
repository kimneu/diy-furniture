const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
const FORM = {
  kind:'sideboard', w:'1200', h:'720', d:'400', room:'living', mat:'birke', t:'18', back:'hdf3', top:'over',
  sections:'2', shelves:'1', base:'legs', baseH:'160', legShape:'cone', taper:'35', legColor:'oak', joint:'pocket',
  front:'hinged', doorsPer:'auto', slideN:'auto', handle:'hole', color:'korpus',
  sheetL:'1500', sheetB:'3000', kerf:'4', grain:true, price:'100',
};
const map = { W:'w', H:'h', D:'d' };
function run(o={}){
  const d = { ...FORM };
  for (const [k,v] of Object.entries(o)) d[map[k]||k] = v;
  if (o.mat && !o.t) d.t = MATS[o.mat].tDef;
  return K.computeData(d);
}
module.exports = { run, K, FORM };
