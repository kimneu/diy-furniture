const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
const E = require(p+'einkauf.js');
const FORM = {
  kind:'sideboard', w:'1200', h:'720', d:'400', room:'living', mat:'birke', t:'18', back:'hdf3', top:'over',
  sections:'2', shelves:'1', base:'legs', baseH:'160', legShape:'cone', taper:'35', legColor:'oak', joint:'pocket',
  front:'hinged', doorsPer:'auto', slideN:'auto', handle:'hole', color:'korpus',
  sheetL:'3000', sheetB:'1500', kerf:'4', grain:true, price:'88.95',
  rw:'1600', rd:'1400', rh:'2400', doorW:'800', doorIn:false, hinge:'L', wall:'solid',
  shape:'U', corner:'L', build:'built', sys:'battens', dBack:'400', dLeft:'300', dRight:'300',
  nShelves:'5', gapBottom:'150', gapTop:'300',
  nicheL:false, nicheLW:'450', nicheLH:'1300', nicheR:false, nicheRW:'450', nicheRH:'1300'
};
const RD = o => computeReduit({ ...REDUIT_DEFAULTS, mat:'birke', t:18, back:'hdf3', joint:'pocket', sheetL:3000, sheetB:1500, kerf:4, grain:true, price:88.95, ...o });
const SB = o => K.computeData(K.withCatalog({ ...FORM, ...o }));
const bb = b => [0,1,2].map(i => [b.pos[i]-b.size[i]/2, b.pos[i]+b.size[i]/2]);
const ov = (a,b) => { const A=bb(a), B=bb(b); return A.map((r,i)=>Math.min(r[1],B[i][1]) - Math.max(r[0],B[i][0])); };
const dump = (R, what='all') => {
  if (what==='all'||what.includes('w')) { console.log('--- WARN'); R.warn.forEach(w => console.log(' !', w)); }
  if (what==='all'||what.includes('r')) { console.log('--- ROWS'); R.rows.forEach(r => console.log(` ${r.pos} ${r.qty}× ${r.name} ${r.L}×${r.B}×${r.t} [${r.kind}] ${r.group} | ${r.note}`)); }
  if (what==='all'||what.includes('h')) { console.log('--- HW'); R.hw.forEach(h => console.log(` ${h[0]} × ${h[1]} | ${h[2]} | ${h[3]||''}`)); }
  if (what==='all'||what.includes('f')) { console.log('--- FINISH'); R.finish.forEach(f => console.log(' ', f.join(' | '))); }
  if (what==='all'||what.includes('t')) { console.log('--- TOOLS'); R.tools.forEach(t => console.log(' ', t)); }
  if (what==='all'||what.includes('s')) { console.log('--- STEPS'); R.steps.forEach((s, i) => console.log(` ${i+1}. ${s[0]}: ${s[1]}${s[2] ? ' [Tipp: '+s[2]+']' : ''}`)); }
  if (what==='all'||what.includes('g')) { console.log('--- GROUPS'); R.groups.forEach(g => console.log(` ${g.label}: ${g.sheets.length} sheets, sheet ${g.sheet}, unplaced ${g.unplaced.length}`)); }
};
module.exports = { K, E, RD, SB, bb, ov, dump, FORM };
