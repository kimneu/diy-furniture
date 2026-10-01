const { run } = require('./SK-base.js');
const stepOf = (R, re) => (R.steps.find(s => re.test(s[0])) || [])[1];
for (const [mat, t] of [['birke',12],['seekiefer',15],['osb',12],['mdf',16],['dekorspan',16],['birke',18],['mdf',19],['fichtesp',24],['eiche',27]]) {
  for (const joint of ['pocket','screws','dowels','cam']) {
    const R = run({ mat, t, joint, shelves:1, base:'legs' });
    const jh = R.hw.filter(h => /Taschen|Holzschrauben Senk|Konfirmat|Dübel|Exzenter/.test(h[1])).map(h => `${h[0]}× ${h[1]} (${h[2]})`);
    const st = { pocket:/Taschenl/, screws:/Schraubl/, dowels:/Dübell/, cam:/Exzenter/ }[joint];
    console.log(`\n## ${mat} ${t} ${joint}: warn=${JSON.stringify(R.warn.filter(w=>/Exzenter|Dübel|Schraub|Platte/.test(w)))}`);
    console.log('  HW:', jh.join(' | '));
    console.log('  STEP:', stepOf(R, st));
  }
  const R = run({ mat, t, joint:'pocket', shelves:1, base:'legs', sections:2 });
  console.log('  Bodenträger-Step:', stepOf(R, /Bodenträger/));
  console.log('  Füsse:', JSON.stringify(R.hw.filter(h => /Füsse|4 × 16/.test(h[1]))), '| Tipp:', (R.steps.find(s => /Füsse/.test(s[0]))||[])[2]);
  const P = run({ mat, t, joint:'pocket', base:'plinth', baseH:80 });
  console.log('  Sockel:', JSON.stringify(P.hw.filter(h => /Sockel|Stahlwinkel/.test(h[2]+h[1]))));
}
