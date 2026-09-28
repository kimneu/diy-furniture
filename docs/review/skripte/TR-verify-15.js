const { run, rng } = require('./TR-verify-lib.js');
const q = 40*9.81/1000;
for (const [lab,o] of [['rails I gon 2400',{shape:'I',sys:'rails',mat:'gon_fichte',t:18,rw:2400}],['brackets I regalbau 2400',{shape:'I',sys:'brackets',mat:'regalbau',t:16,rw:2400}],['brackets I gon 2400',{shape:'I',sys:'brackets',mat:'gon_fichte',t:18,rw:2400}]]) {
  const R = run(o);
  const lvl = 150;
  const sup = [...new Set(R.extras.filter(e=>e.type==='metal' && Math.abs(e.pos[1]-(lvl-(o.sys==='rails'?12.5:2)))<1).map(e=>Math.round(e.pos[0])))].sort((a,b)=>a-b);
  const sl = R.boxes.filter(b=>b.key.startsWith('Stossleiste') && Math.abs(b.pos[1]-(lvl-12))<1).map(b=>Math.round(b.pos[0]));
  console.log(lab, '| Stützen x', sup.join(','), '| Stoss x', sl.join(','));
  for (const j of sl) { const nxt = sup.filter(x => x > j).concat(sup.filter(x=>x<j)); const d = Math.min(...sup.map(x=>Math.abs(x-j)).filter(v=>v>50)); console.log('   Stoss', j, 'nächste weitere Stütze in', d, 'mm -> Auflagerkraft Stoss ca.', (q*d/2).toFixed(0), 'N (Einfeld), durchlaufend ca.', (0.4*q*d).toFixed(0),'N'); }
}
const G = run({shape:'U', sys:'rails', wall:'drywall'});
console.log('GK rails U: Schienen x/z', [...new Set(G.extras.filter(e=>e.type==='metal'&&e.size[1]>1000).map(e=>Math.round(e.pos[0])+'/'+Math.round(e.pos[2])))].join(' '));
console.log('   warn', G.warn.filter(w=>/Gipskarton/.test(w)).join(' | '));
console.log('   hw', G.hw.filter(h=>/Hohlraum/.test(h[1])).map(h=>h[0]+' '+h[1]+' | '+h[2]).join(''));
const B = run({shape:'U', sys:'brackets', wall:'drywall'});
const bx = [...new Set(B.extras.filter(e=>e.type==='metal' && e.size[1]>100 && Math.abs(e.pos[2]+698)<3).map(e=>Math.round(e.pos[0])))].sort((a,b)=>a-b);
console.log('GK brackets U: Winkel hinten x', bx.join(','), 'Abstände', bx.slice(1).map((x,i)=>x-bx[i]).join(','));
