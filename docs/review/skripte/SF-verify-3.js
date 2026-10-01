const { K, FORM, seeded, sb } = require('./SF-verify-lib.js');
const rho = { mdf:750, birke:680, birkesi:680, eiche:700, fichte:470, fichtesp:480, dreischicht:470, dekorspan:650, seekiefer:550, osb:620 };
const show = (lbl, o) => { const { R } = sb(o); const d0 = R.doors[0]; const kg = d0.dw*d0.dh*R.tf*rho[R.MF === MATS.mdf ? 'mdf' : Object.keys(MATS).find(k=>MATS[k]===R.MF)]/1e9;
  console.log(lbl, 'tf', R.tf, 'doors', R.doors.length, 'dh×dw', r0(d0.dh), '×', r0(d0.dw), 'kg', kg.toFixed(1), 'hinges/door', R.rows.find(r=>r.name==='Tür').note, '| warn', R.warn.filter(w=>!/kippt/.test(w)).map(w=>w.slice(0,60)));
  console.log('   hw', R.hw.filter(h=>/Topf/.test(h[1])).map(h=>h[0]+'× '+h[1]+' | '+h[2]).join(' || ')); return R; };
show('SF3 seekiefer15', { mat:'seekiefer', t:'15' });
show('SF3 birke front 12', { frontMat:'birke', frontT:'12' });
show('SF4 Kommode MDF19', { mat:'mdf', t:'19', h:'1000', baseH:'100', w:'1200', sections:'2', color:'weiss' });
show('SF4 Sideboard Birke', { mat:'birke', t:'18', h:'880', base:'plinth', baseH:'60', w:'1240', sections:'2' });
show('SF4 Highboard MDF', { mat:'mdf', t:'19', h:'1400', base:'none', w:'1230', sections:'2', color:'weiss' });
show('SF4 forced 1 door', { mat:'mdf', t:'19', h:'900', w:'1200', sections:'1', doorsPer:'1', color:'weiss' });
show('SF4 forced 1 door birke', { mat:'birke', t:'18', h:'900', w:'1200', sections:'1', doorsPer:'1' });
// SF-5
{ const { R } = sb({ w:'1600', sections:'2' }); console.log('SF5', R.doors.map(d=>[d.side, r0(d.cx-d.dw/2), r0(d.cx+d.dw/2)].join(' ')), R.hw.filter(h=>/Topf/.test(h[1])).map(h=>h[0]+'× '+h[1]));
  console.log('   step', R.steps.find(s=>/Türen anschlagen/.test(s[0]))[1]); }
{ const { R } = sb({ w:'1800', sections:'3', doorsPer:'2' }); console.log('SF5 n3 dp2', R.hw.filter(h=>/Topf/.test(h[1])).map(h=>h[0]+'× '+h[1])); }
// SF-6
{ const { R } = sb({ w:'1300', sections:'1', handle:'push' }); console.log('SF6', R.doors.map(d=>d.side+' '+r0(d.dw)), R.boxes.filter(b=>/Mittelwand/.test(b.key)).length, R.hw.filter(h=>/Push/.test(h[1])), R.steps.find(s=>/Push/.test(s[0]))[1]); }
// SF-11
{ const { R } = sb({ w:'1230', sections:'2' }); console.log('SF11', R.doors.map(d=>r0(d.dw)), R.warn.filter(w=>/breit/.test(w))); }
// SF-12
{ const { R } = sb({}); const top = R.boxes.find(b=>/^Deckel/.test(b.key)); console.log('SF12 top y', top.pos[1]-top.size[1]/2, top.pos[1]+top.size[1]/2, 'top front z', top.pos[2]+top.size[2]/2, 'door top', R.doors[0].yc + R.doors[0].dh/2, 'D', R.D); }
// SF-13
{ const { R } = sb({ w:'1200', sections:'4', doorsPer:'2' }); console.log('SF13', R.doors.length, R.doors.map(d=>r0(d.dw)).join(','), 'warn', R.warn, R.hw.filter(h=>/Topf/.test(h[1])).map(h=>h[0])); }
// SF-15
{ const { R } = sb({ w:'2600', front:'sliding', sections:'3' }); console.log('SF15', R.W, R.Wi, R.steps.find(s=>/Schiebetüren einsetzen/.test(s[0]))[1].match(/auf \d+ mm/)[0], R.hw.find(h=>/Schiebe/.test(h[1]))[2]); }
// SF-14
{ const { R } = sb({ front:'sliding', handle:'shell' }); console.log('SF14 shell step', R.steps.find(s=>/Griffmuschel/.test(s[0]))[1]); }
{ const { R } = sb({ handle:'hole' }); console.log('SF14 hole step', R.steps.find(s=>/Griffl/.test(s[0]))[1]); }
