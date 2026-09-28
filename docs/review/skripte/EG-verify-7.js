const {run,s,hit,inter,r1}=require('./EG-verify-lib.js');
for (const mat of ['birke','gon_fichte']) {
  const {R,bx,mt,c}=run({sys:'rails',mat});
  const sh=bx.filter(b=>b.name==='Tablar'), rails=mt.filter(m=>m.y1-m.y0>500);
  let n=0, ex=null; for (const r of rails) for (const t of sh) if (hit(r,t)) { n++; ex=[s(r),s(t),inter(r,t).map(r1)]; }
  console.log(mat,'dBack',c.dBack,'dLeft',c.dLeft,'rails',rails.length,'Schiene∩Tablar',n, ex);
  const back=sh.find(b=>b.z1<=-299), left=sh.find(b=>b.x1<=-400&&b.z0>=-305);
  const rowB = R.rows.find(r=>r.name==='Tablar' && r.L>1500);
  console.log('  hinteres Tablar Liste', rowB.L, rowB.B, 'gezeichnet z', r1(back.z0), r1(back.z1), '→ an Schiene (v=12): Vorderkante bei', 12+rowB.B, '; Seitentablar beginnt bei v', r1(left.z0 + c.rd/2), 'Länge', r1(left.z1-left.z0), 'Vorderwand bei', c.rd);
  const kons = R.hw.find(h=>/Konsole/.test(h[1])); console.log('  ', kons.slice(0,2));
}
// EG-9 Winkel
for (const [d,gb] of [[200,150],[225,150],[226,150],[300,150],[400,150],[300,310]]) {
  const {mt,R}=run({sys:'brackets',shape:'I',dBack:d,gapBottom:gb});
  const v=mt.filter(m=>m.y1-m.y0>50); console.log('Winkel Tiefe',d,'gapBottom',gb,'tiefster Punkt', r1(Math.min(...v.map(m=>m.y0))), R.hw.filter(h=>/Blechkonsole/.test(h[1])).map(h=>h[0]+'× '+h[1]).join(), R.warn.filter(w=>/Winkel/.test(w)));
}
// untere Ebene Winkel-Zahl im Standard-U
{ const {mt}=run({sys:'brackets'}); const v=mt.filter(m=>m.y1-m.y0>50 && m.y0<0); console.log('U Standard: Winkel mit Schenkel unter Boden', v.length); }
// 8 Tablare: Abstand
{ const {R,c}=run({sys:'brackets',nShelves:8}); const lv=shelfLevels(8,c.gapBottom,c.gapTop,c.rh); console.log('8 Tablare Stufen', lv.join(','), 'lichte Höhe', r1(lv[1]-lv[0]-18)); }
