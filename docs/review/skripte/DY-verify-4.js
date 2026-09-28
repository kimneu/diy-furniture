const { RD, SB, dump, bb } = require('./DY-verify-lib.js');
console.log('=== DY-8 rails');
for (const o of [{ sys:'rails' }, { sys:'rails', gapBottom:200 }, { sys:'rails', gapTop:350 }, { sys:'rails', gapBottom:200, gapTop:350 }, { sys:'rails', mat:'gon_fichte', t:18, shape:'L', corner:'L' }]) {
  const R = RD(o);
  const rails = R.hw.filter(h=>/Wandschiene|Spreiz/.test(h[1])).map(h=>`${h[0]} × ${h[1]} (${h[3]}) ≈ ${Math.round(h[0]*h[3])}`);
  const railBoxes = R.extras.filter(e=>e.type==='metal' && e.size[1]>500).map(e=>Math.round(e.size[1]));
  console.log(JSON.stringify(o), rails.join(' / '), '| rail heights', [...new Set(railBoxes)], 'levels', shelfLevels(o.nShelves||5, o.gapBottom??150, o.gapTop??300, 2400));
  console.log('   warn:', R.warn.filter(w=>/Schiene/.test(w)).join(' | '));
}
// how many dowels from the 1000 stub: count fix
const R = RD({ sys:'rails' });
console.log('konsolen', R.hw.filter(h=>/Konsole/.test(h[1])).map(h=>h[0]+' × '+h[1]).join(' / '));
