const { K, BASE, bb } = require(__dirname + '/RM-verify-lib.js');
let R = computeReduit({ ...BASE, sys:'battens' });
const tabs = R.boxes.filter(b=>{const r=R.rows.find(r=>r.key===b.key); return r.name==='Tablar' && bb(b).y0<200;});
for (const b of tabs){ const B=bb(b); console.log('Tablar x',B.x0+800,'..',B.x1+800,' z',B.z0+700,'..',B.z1+700); }
console.log('Diag flach', Math.hypot(1594,397).toFixed(0), 'hochkant', Math.hypot(1594,18).toFixed(1));
// RM-16
const f = cfg => { const R=computeReduit({ ...BASE, ...cfg }); const lv=shelfLevels(R.rows? normReduit({...BASE,...cfg}).cfg.nShelves:0, normReduit({...BASE,...cfg}).cfg.gapBottom, normReduit({...BASE,...cfg}).cfg.gapTop, normReduit({...BASE,...cfg}).cfg.rh); return [lv, R.warn]; };
console.log('rh1800 8T gB600 gT800', JSON.stringify(f({rh:1800,nShelves:8,gapBottom:600,gapTop:800,shape:'I',sys:'posts'})));
console.log('rd900 dBack600', JSON.stringify(f({rd:900,dBack:600,shape:'I',sys:'posts'})[1]));
console.log('U pass 300', JSON.stringify(f({rw:900,dLeft:300,dRight:300,shape:'U',sys:'posts'})[1]));
// RM-20 Nische
for (const [n,h] of [[5,1300],[8,1300],[5,1100]]) { const R2 = computeReduit({ ...BASE, sys:'battens', nicheL:true, nShelves:n, nicheLH:h }); const lv=shelfLevels(n,150,300,2400); const first = lv.find(y=>y>=h); const ni = R2.extras.find(e=>e.type==='niche'); console.log('Nische nShelves',n,'H',h,'-> lichte Hoehe', first, '3D bis', bb(ni).y1); }
// RM-9 / RM-23 frei
R = computeReduit({ ...BASE, build:'free', nicheL:true });
console.log(R.rows.filter(r=>r.kind!=='solid').map(r=>r.qty+'x '+r.name+' '+r.L+'x'+r.B+' ('+r.note+')').join('\n'));
console.log('HW:', R.hw.map(h=>h.slice(0,3).join(' | ')).join('\n'));
console.log('Steps:', R.steps.map((s,i)=>(i+1)+' '+s[0]).join(' / '));
const R3 = computeReduit({ ...BASE, build:'free', back:'none' }); console.log('none:', R3.hw.filter(h=>/Winkel/.test(h[1])).map(h=>h.slice(0,3).join(' | ')).join(), R3.warn.join(' || '));
// RM-17 Kippmoment Seitenmodul
const m = 2*2.118*0.29*0.018*680 + 5*0.457*0.287*0.018*680 + 0.491*2.116*0.003*800; console.log('Masse Seitenmodul', m.toFixed(1),'kg Moment', (m*9.81*0.145).toFixed(1),'Nm F oben', (m*9.81*0.145/2.118).toFixed(1),'N');
