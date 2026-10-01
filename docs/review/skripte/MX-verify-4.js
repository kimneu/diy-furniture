const { K, sb, rd, hard } = require('./MX-verify-lib.js');
const show = (lbl, o) => { const { R } = sb(o); console.log(lbl, 's=', Math.round(R.s), 'SPAN=', maxSpan(o.mat, Number(o.t)), 'warn=', JSON.stringify(hard(R))); return R; };
show('dekorspan19 W1640 n2 sh1', { mat:'dekorspan', t:'19', w:'1640', sections:'2', shelves:'1' });
show('mdf19 W1640 n2 sh1', { mat:'mdf', t:'19', w:'1640', sections:'2', shelves:'1', color:'weiss' });
show('osb12 W1420 n2 sh1', { mat:'osb', t:'12', w:'1420', sections:'2', shelves:'1' });
show('dekorspan16 W2000 n2 sh0', { mat:'dekorspan', t:'16', w:'2000', sections:'2', shelves:'0' });
show('osb12 W2400 n2 sh0', { mat:'osb', t:'12', w:'2400', sections:'2', shelves:'0' });
show('dekorspan19 750x890x400 n1 sh1', { mat:'dekorspan', t:'19', w:'750', h:'890', d:'400', sections:'1', shelves:'1' });
show('birke18 W1640 n2 sh1', { mat:'birke', t:'18', w:'1640', sections:'2', shelves:'1' });
// Sideboard 'span' rule by t only
console.log('SPAN table', JSON.stringify({dekorspan:SPAN.dekorspan, mdf:SPAN.mdf, osb:SPAN.osb, fichte:SPAN.fichte}));
// Deflection estimate (rough): q=0.35 N/mm, b=380
const defl = (E, t, L, b=380, q=0.35) => 5*q*L**4/(384*E*b*t**3/12);
for (const [n,E,kdef,t,L] of [['Span P2 19',2500,2.25,19,792],['Span P2 19',2500,2.25,19,500],['MDF 19',3000,2.25,19,792],['Birke 18',8000,0.8,18,800],['Span 16',2500,2.25,16,976],['OSB12 (E ~4000 längs)',4000,1.5,12,692]])
  console.log(n, 'L', L, 'w_inst', defl(E,t,L).toFixed(1), 'w_fin', (defl(E,t,L)*(1+kdef)).toFixed(1), 'L/200', L/200);
