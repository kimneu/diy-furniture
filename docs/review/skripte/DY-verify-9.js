const { RD, SB, dump, bb, E } = require('./DY-verify-lib.js');
const R6 = RD({ sys:'rails', mat:'gon_fichte', t:18, shape:'L', corner:'L' });
console.log('RD6 hw 4x35:', R6.hw.filter(h=>/4 × 35/.test(h[1])).map(h=>h.join(' | ')), 'Konsolen', R6.hw.filter(h=>/Konsole/.test(h[1])).map(h=>h[0]).join('+'), 'Eckleisten', R6.rows.filter(r=>r.name==='Eckleiste').reduce((a,r)=>a+r.qty,0));
console.log('RD6 tools:', R6.tools.join(' / '));
const Sp = SB({ joint:'pocket', top:'over' }); console.log('pocket step:', Sp.steps.find(s=>/Taschen/.test(s[0]))[1].slice(0,140));
// Reduit battens tools
const R5 = RD({}); console.log('RD5 tools:', R5.tools.join(' / '));
// DY-20 Tablar
console.log('RD5 Tablar:', R5.rows.filter(r=>r.name==='Tablar').map(r=>`${r.qty}x ${r.L}×${r.B}`).join(' / '));
console.log('Step1:', R5.steps[0][1]); console.log('Step2:', R5.steps[1][1]);
// DY-22 go/on battens 2400
const Rj = RD({ sys:'battens', mat:'gon_fichte', t:18, rw:2400 });
console.log('Rj hw:', Rj.hw.filter(h=>/Winkel|4 × 35/.test(h[1])).map(h=>h.join(' | ')).join(' / '));
console.log('Rj Stoss steps:', Rj.steps.filter(s=>/Stoss|Stütz/.test(s[0])).map(s=>s.join(' | ')).join(' // '));
// Pfosten posts: Querlatte to wall connection?
const R7 = RD({ sys:'posts' });
console.log('R7 posts notes:', [...new Set(R7.rows.map(r=>r.note))].join(' / '));
console.log('R7 step Latten:', R7.steps.find(s=>/Pfosten/.test(s[0])).join(' | '));
