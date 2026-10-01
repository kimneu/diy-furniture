const { K, BASE, bb } = require(__dirname + '/RM-verify-lib.js');
for (const cfg of [{build:'free', doorIn:true}, {sys:'cheeks', doorIn:true}, {sys:'posts', doorIn:true}, {build:'free', doorIn:true, rd:1450}]) {
  const R = computeReduit({ ...BASE, ...cfg });
  // Teile am linken Segment (x < -500)
  const left = R.boxes.filter(b => bb(b).x1 <= -500+1 && bb(b).z0 >= -700+390).map(b => { const r=R.rows.find(r=>r.key===b.key); const B=bb(b); return r.name+' '+r.L+'x'+r.B+' @z'+(B.z0+R.D/2)+'..'+(B.z1+R.D/2); });
  const uniq = {}; for (const s of left) { const k=s.replace(/ @.*/,''); uniq[k]=(uniq[k]||0)+1; }
  console.log(JSON.stringify(cfg), 'Module', R.modules, '| linkes Segment:', JSON.stringify(uniq), '| warn:', R.warn.filter(w=>!/eingeplant/.test(w)).join(' || ')||'(keine ausser eingeplant)');
  console.log('   HARMLOS-gefiltert:', R.warn.filter(w=>!K.HARMLOS.test(w)).length);
}
console.log(buildReduitSteps.toString().includes('Höhe') , 'Schritt 1:', computeReduit({...BASE, sys:'cheeks'}).steps[0][1]);
