const {SB,RD,passtSB,passtRD,K}=require('./BW_lib.js'); Object.assign(globalThis, require(require('path').join(__dirname, '../../..') + '/shared.js'));
function lcg(seed){ let s = seed >>> 0; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2**32; }
const FORM = { kind:'reduit', w:'1200', h:'720', d:'400', room:'living', mat:'birke', t:'18', back:'hdf3', top:'over',
  sections:'2', shelves:'1', base:'legs', baseH:'160', legShape:'cone', taper:'35', legColor:'oak', joint:'pocket',
  front:'hinged', doorsPer:'auto', slideN:'auto', handle:'hole', color:'korpus', sheetL:'1500', sheetB:'3000', kerf:'4', grain:true, price:'100',
  rw:'1600', rd:'1400', rh:'2400', doorW:'800', doorIn:false, hinge:'L', wall:'solid', shape:'U', corner:'L', build:'built', sys:'battens',
  dBack:'400', dLeft:'300', dRight:'300', nShelves:'5', gapBottom:'150', gapTop:'300', nicheL:false, nicheLW:'450', nicheLH:'1300', nicheR:false, nicheRW:'450', nicheRH:'1300' };
const rnd = lcg(987654), cnt = {}, fails = {};
for (let i = 0; i < 400; i++) {
  const d = K.zufall({ ...FORM }, rnd);
  const id = d.build === 'free' ? 'R6' : { battens:'R1', posts:'R2', rails:'R3', brackets:'R4', cheeks:'R5' }[d.sys];
  const R = RD[id], v = [];
  if (!R.mats.includes(d.mat) || Number(d.t) < R.minT) v.push(`${d.mat} ${d.t}`);
  if (R.depth) for (const k of ['dBack', ...(d.shape === 'U' || (d.shape === 'L' && d.corner !== 'R') ? ['dLeft'] : []), ...(d.shape === 'U' || (d.shape === 'L' && d.corner === 'R') ? ['dRight'] : [])]) if (Number(d[k]) < R.depth[0] || Number(d[k]) > R.depth[1]) { v.push('Tiefe ' + k + ' ' + d[k]); break; }
  if (id === 'R6') { const j = ['dekorspan','mdf'].includes(d.mat) ? 'cam' : 'pocket'; if (d.joint !== j) v.push('Verbindung ' + d.joint); }
  if (id === 'R4' && Number(d.gapBottom) < ({150:210,200:260,250:310})[[150,200,250].find(l => l >= Number(d.dBack)*2/3) || 250]) v.push('gapBottom ' + d.gapBottom);
  cnt[id] = (cnt[id] || 0) + 1;
  if (v.length) { fails[id] = fails[id] || { n:0, why:{} }; fails[id].n++; for (const x of v) { const key = x.replace(/ \d+$/, ''); fails[id].why[key] = (fails[id].why[key] || 0) + 1; } }
}
console.log('Würfe je Bauweise', JSON.stringify(cnt));
console.log('davon ausserhalb', JSON.stringify(fails));
