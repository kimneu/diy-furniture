const { K, E, CFG, FORM } = require('./DY_cfg.js');
const wc = d => K.withCatalog(d);
// Kippschutz Sideboard
let R = K.computeData(wc({ ...FORM, h:'1300', base:'plinth', baseH:'80' }));
console.log('Highboard hw Kipp:', R.hw.filter(h=>/Kipp/.test(h[1])).map(h=>h.join(' | ')), '\n steps:', R.steps.map(s=>s[0]).join(' / '), '\n warnKipp:', R.warn.filter(w=>/kipp/i.test(w)));
// Latten/Kantholz Längen
for (const [rw, rh, gt] of [[2400,2400,300],[3000,3000,100],[1600,2800,100]]) {
  R = K.computeData(wc({ ...FORM, kind:'reduit', mat:'osb', t:'18', sys:'posts', rw:String(rw), rh:String(rh), gapTop:String(gt) }));
  const sol = R.rows.filter(r=>r.kind==='solid');
  console.log(`posts rw ${rw} rh ${rh} gapTop ${gt}: max Latte ${Math.max(...sol.filter(r=>/Latte/.test(r.name)).map(r=>r.L))} mm, Kantholz ${Math.max(...sol.filter(r=>/Kantholz/.test(r.name)).map(r=>r.L))} mm; warn about length:`, R.warn.filter(w=>/Latte|Kantholz|länger/.test(w)));
}
// Leisten aus Dachlatte bei Brettern: Länge
R = K.computeData(wc({ ...FORM, kind:'reduit', mat:'gon_fichte', sys:'battens', rw:'2400' }));
console.log('battens gon rw2400: Leisten', R.rows.filter(r=>/Leiste/.test(r.name)).map(r=>`${r.qty}×${r.name} ${r.L}`).join(', '));
console.log('  hw', R.hw.map(h=>h[0]+'× '+h[1]+' | '+h[2]).join('\n    '));
console.log('  steps', R.steps.map(s=>s[0]).join(' / '));
// Rails: rail parts per config
for (const [rh, gb, gt] of [[2400,150,300],[2400,100,300],[2500,150,300],[2400,200,350]]) {
  R = K.computeData(wc({ ...FORM, kind:'reduit', mat:'birke', t:'18', sys:'rails', rh:String(rh), gapBottom:String(gb), gapTop:String(gt) }));
  console.log(`rails rh ${rh} gb ${gb} gt ${gt}:`, R.hw.filter(h=>/Wandschiene/.test(h[1])).map(h=>`${h[0]}× ${h[1]} ≈CHF ${Math.round(h[0]*h[3])}`).join(' + '));
}
// Cheeks: Wangenlänge vs Platte
for (const m of ['birke','birkesi','fichtesp','osb','mdf','dreischicht']) {
  R = K.computeData(wc({ ...FORM, kind:'reduit', mat:m, t:String(MATS[m].tDef), sys:'cheeks' }));
  const w = R.rows.find(r=>r.name==='Wange');
  console.log(`cheeks ${m}: Wange ${w.L}×${w.B}, sheet ${R.groups[0].sheet}, unplaced ${R.groups[0].unplaced.map(u=>u.name).join(',')}`);
}
