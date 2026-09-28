const { RD, SB, dump, bb, E } = require('./DY-verify-lib.js');
console.log('=== E: Schiebetür + Lochreihe');
for (const o of [{ front:'sliding', handle:'shell', sections:'2', shelves:'1' }, { front:'sliding', handle:'shell', sections:'1', w:'900', shelves:'2' }, { front:'hinged' }, { front:'sliding', handle:'shell', frontMat:'birke', frontT:'12', sections:'2' }]) {
  const R = SB(o);
  const side = R.boxes.find(b=>b.key.startsWith('Seite')), shelf = R.boxes.find(b=>b.key.startsWith('Einlegeboden'));
  const sF = side.pos[2] + side.size[2]/2, sB = side.pos[2] - side.size[2]/2, eF = shelf.pos[2] + shelf.size[2]/2, eB = shelf.pos[2]-shelf.size[2]/2;
  const pinFront = sF - 40, pinBack = sB + 40;
  console.log(JSON.stringify(o), `Seite z ${sB}..${sF} | Einlegeboden z ${eB}..${eF} | Stift vorne bei ${pinFront} → ${pinFront > eF ? (pinFront-eF)+' mm VOR der Bodenvorderkante' : (eF-pinFront)+' mm unter dem Boden'} | hinten ${pinBack - eB} mm unter dem Boden`);
  console.log('   Schritt:', R.steps.find(s=>/Bodenträger bohren/.test(s[0]))[1].slice(0,170));
}
console.log('=== E: Reduit selbststehend: Bohrschritte je Verbindung');
for (const joint of ['pocket','dowels','cam','screws']) {
  const R = RD({ build:'free', joint });
  console.log(joint, '| Schritte:', R.steps.map(s=>s[0]).join(' / '));
  console.log('    Module bauen:', R.steps.find(s=>s[0]==='Module bauen')[1]);
  console.log('    HW:', R.hw.slice(0,2).map(h=>`${h[0]} × ${h[1]} | ${h[2]}`).join(' / '), '| Tools:', R.tools.filter(t=>/Dübel|Taschen|Forstner|Senker|Zwingen|Holzbohrer/.test(t)).join(' / '));
}
console.log('=== E: Dübeltiefen');
for (const t of ['12','18','27']) { const mat = t==='27' ? 'eiche' : 'birke'; const R = SB({ mat, t, joint:'dowels' }); console.log(t, R.hw.find(h=>/Holzdübel/.test(h[1])).slice(0,2).join(' × '), '|', R.steps.find(s=>/Dübel/.test(s[0]))[1].match(/In der Plattenfläche.*$/)[0]); }
console.log('=== E: Wangen H-10');
const Rc = RD({ sys:'cheeks' });
const w = Rc.rows.filter(r=>r.name==='Wange'); console.log(w.map(r=>`${r.qty}x ${r.L}×${r.B}×${r.t}`).join(' / '), 'Raumhöhe', 2400, 'Luft', 2400 - w[0].L, 'Kipp-Radius flach', Math.hypot(w[0].L, w[0].t).toFixed(1), 'hochkant', Math.hypot(w[0].L, w[0].B).toFixed(0), '| Tür', Rc.room.doorH);
console.log('Schritt 1:', Rc.steps[0][1]); console.log('Wangen-Schritt:', Rc.steps.find(s=>/Wangen/.test(s[0]))[1]);
const Rc2 = RD({ sys:'cheeks', rh:2600 }); console.log('rh 2600 Wange', Rc2.rows.find(r=>r.name==='Wange').L);
