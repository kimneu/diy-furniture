const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
const E = require(p+'einkauf.js');
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
const wc = d => K.withCatalog(d);
const CFG = {
  SB1: FORM,
  SB2: wc({ ...FORM, mat:'mdf', t:'19', front:'sliding', handle:'shell', color:'weiss', joint:'dowels' }),
  SB3: wc({ ...FORM, mat:'eiche', t:'27', front:'hinged', frontMat:'korpus', joint:'dowels', handle:'knob' }),
  SB4: wc({ ...FORM, w:'2200', h:'500', d:'420', sections:'3', shelves:'0', base:'legs', baseH:'180', front:'sliding', handle:'hole', joint:'pocket' }),
  RD5: wc({ ...FORM, kind:'reduit', mat:'birke', t:'18', shape:'U', sys:'battens' }),
  RD6: wc({ ...FORM, kind:'reduit', mat:'gon_fichte', shape:'L', corner:'L', sys:'rails' }),
  RD7: wc({ ...FORM, kind:'reduit', mat:'osb', t:'18', shape:'U', sys:'posts' }),
  RD8: wc({ ...FORM, kind:'reduit', mat:'dekorspan', t:'19', build:'free', shape:'U', joint:'pocket', back:'hdf3' }),
};
module.exports = { K, E, CFG, FORM };
if (require.main === module) {
  const which = process.argv.slice(2);
  for (const [k, d] of Object.entries(CFG)) {
    if (which.length && !which.includes(k)) continue;
    const R = K.computeData(d);
    console.log('\n=================', k, d.kind, d.mat, d.t, d.sys||'', d.shape||'', 'level', R.level);
    console.log('--- WARN'); R.warn.forEach(w => console.log(' !', w));
    console.log('--- ROWS'); R.rows.forEach(r => console.log(` ${r.pos} ${r.qty}× ${r.name} ${r.L}×${r.B}×${r.t} [${r.kind}] ${r.group} | ${r.note}`));
    console.log('--- HW'); R.hw.forEach(h => console.log(` ${h[0]} × ${h[1]} | ${h[2]} | ${h[3]||''}`));
    console.log('--- FINISH'); R.finish.forEach(f => console.log(' ', f.join(' | ')));
    console.log('--- TOOLS'); R.tools.forEach(t => console.log(' ', t));
    console.log('--- STEPS'); R.steps.forEach((s, i) => console.log(` ${i+1}. ${s[0]}: ${s[1]}${s[2] ? ' [Tipp: '+s[2]+']' : ''}`));
    console.log('--- GROUPS'); R.groups.forEach(g => console.log(` ${g.label}: ${g.sheets.length} sheets, sheet ${g.sheet}, unplaced ${g.unplaced.length}`));
  }
}
