const { K, BASE, bb } = require('./RM-verify-lib.js');
const deg = x => (x*180/Math.PI).toFixed(0);
function door(cfg){
  const R = computeReduit({ ...BASE, ...cfg });
  const c = normReduit({ ...BASE, ...cfg }).cfg;
  const free = c.rd - c.dBack;
  const ang = free >= c.doorW ? 90 : deg(Math.asin(free / c.doorW));
  const lay = layoutReduit(c);
  console.log(JSON.stringify(cfg), '| frei vor hinten', free, '| Oeffnungswinkel ca.', ang, '| wf', lay.wf, '| Segmente', lay.segs.map(s=>s.id+' '+s.u0+'..'+s.u1+' '+s.ends.join('/')+' d'+s.depth).join(', '), '| warn:', R.warn.join(' || ') || '(keine)');
}
door({ shape:'I', rd:1000, dBack:400, doorW:800, doorIn:true });
door({ shape:'L', corner:'R', rd:900, dBack:500, doorIn:true, hinge:'L' });
door({ shape:'U', rd:1000, doorIn:true });
door({ shape:'U', doorIn:true });  // Standard
for (const rw of [1600,1800,2000]) door({ shape:'U', doorIn:true, hinge:'L', rw });
door({ shape:'U', rw:1200, doorW:800, dLeft:300, dRight:300, doorIn:true, hinge:'L' });
// Zufall in Raum 1200x1000, Tür 700 innen
function rnd(seed){ let s=seed; return ()=>{ s=(s*1103515245+12345)%2147483648; return s/2147483648; }; }
const FORM = { kind:'reduit', ...Object.fromEntries(Object.entries(REDUIT_DEFAULTS).map(([k,v])=>[k, typeof v==='boolean'? (v?'on':''): v])), mat:'birke', t:18, back:'hdf3', joint:'pocket', sheetL:3000, sheetB:1500, kerf:4, grain:'on', price:88.95 };
for (const room of [{rw:1200, rd:1000, doorW:700, doorIn:'on'}, {rw:1800, rd:1100, doorW:800, doorIn:'on', wall:'drywall'}]) {
  let hit=0, n=0, mins=[], full=0;
  for (let s=1; s<=150; s++) {
    const d = K.zufall({ ...FORM, ...room }, rnd(s*7919));
    const c = normReduit(K.cfgFromData(d)).cfg;
    const free = c.rd - c.dBack; n++; mins.push(free);
    if (free < c.doorW + 30) hit++;
    if (free >= c.doorW) full++;
  }
  console.log(JSON.stringify(room), 'Wuerfe', n, 'frei < doorW+30:', hit, 'frei >= doorW:', full, 'Bereich', Math.min(...mins), '..', Math.max(...mins));
}
