const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
const FORM = {
  kind:'sideboard', w:'1200', h:'720', d:'400', room:'living', mat:'birke', t:'18', back:'hdf3', top:'over',
  sections:'2', shelves:'1', base:'legs', baseH:'160', legShape:'cone', taper:'35', legColor:'oak', joint:'pocket',
  front:'hinged', doorsPer:'auto', slideN:'auto', handle:'hole', color:'korpus',
  sheetL:'1500', sheetB:'3000', kerf:'4', grain:true, price:'100',
  rw:'1600', rd:'1400', rh:'2400', doorW:'800', doorIn:false, hinge:'L', wall:'solid',
  shape:'U', corner:'L', build:'built', sys:'battens', dBack:'400', dLeft:'300', dRight:'300',
  nShelves:'5', gapBottom:'150', gapTop:'300',
  nicheL:false, nicheLW:'450', nicheLH:'1300', nicheR:false, nicheRW:'450', nicheRH:'1300'
};
function run(label, over){
  const d = K.withCatalog({ ...FORM, ...over });
  if (over.t) d.t = Number(over.t);
  const R = K.computeData(d);
  const hard = R.warn.filter(w => !K.HARMLOS.test(w)), soft = R.warn.filter(w => K.HARMLOS.test(w));
  console.log(`\n## ${label}  ${JSON.stringify(over)}\n  hart ${hard.length}: ${hard.map(w=>w.slice(0,110)).join(' || ')}\n  harmlos ${soft.length}: ${soft.map(w=>w.slice(0,110)).join(' || ')}`);
  return R;
}
module.exports = { K, FORM, run };
