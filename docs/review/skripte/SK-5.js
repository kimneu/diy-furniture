const { run } = require('./SK-base.js');
for (const [front, tf, frontMat] of [['sliding',18,'korpus'],['sliding',12,'birke'],['hinged',18,'korpus']]) {
  const R = run({ front, sections:3, shelves:2, W:1800, frontMat, frontT:tf });
  const side = R.boxes.find(b => b.key.startsWith('Seite'));
  const shelf = R.boxes.find(b => b.key.startsWith('Einlegeboden'));
  const div = R.boxes.find(b => b.key.startsWith('Mittelwand'));
  const sideFront = side.pos[2] + side.size[2]/2, shelfFront = shelf.pos[2] + shelf.size[2]/2, divFront = div.pos[2] + div.size[2]/2;
  const shelfBack = shelf.pos[2] - shelf.size[2]/2, sideBack = side.pos[2] - side.size[2]/2;
  console.log(front, 'tf', tf, 'Seite tief', side.size[2], '| Tablar tief', shelf.size[2], '| Tablar-Vorderkante hinter Seiten-Vorderkante:', (sideFront - shelfFront).toFixed(1), 'mm | Mittelwand-VK zurück', (sideFront-divFront).toFixed(1), '| Tablar hinten an Rückwand?', (shelfBack - sideBack).toFixed(1));
  console.log('   Bodenträger vorne in der Seite bei 40 mm → Abstand vor Tablar-VK:', (40 - (sideFront - shelfFront)).toFixed(1), 'mm (negativ = Träger liegt vor dem Tablar)');
  console.log('   Tablar-Note:', R.rows.find(r => r.name === 'Einlegeboden').note, '| Mittelwand-Note:', R.rows.find(r => r.name === 'Mittelwand').note);
}
