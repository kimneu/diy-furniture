const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const base = { ...REDUIT_DEFAULTS, mat:'birke', t:18, back:'hdf3', joint:'pocket', sheetL:3000, sheetB:1500, kerf:4, grain:true, price:88.95 };
const run = o => computeReduit({ ...base, ...o });
const rng = b => b.pos.map((c,i)=>[Math.round(c-b.size[i]/2), Math.round(c+b.size[i]/2)]);
// 1. Pfosten
for (const o of [{shape:'U'},{shape:'L'},{shape:'U', rd:1100},{shape:'L', rd:1100}]) {
  const R = run({ sys:'posts', ...o });
  const posts = R.boxes.filter(b=>b.key.startsWith('Kantholz')).map(rng).map(r=>`x${r[0]} z${r[2]}`);
  console.log('posts', JSON.stringify(o), posts.join(' ; '));
}
// 2. Blindecke Wangen und selbststehend
console.log('\nBlindecke: mat t dSide -> Wangen: Fach, verdeckt, offen | selbststehend: Boden, verdeckt, offen');
for (const [mat,t] of [['birke',18],['mdf',19],['gon_fichte',18]]) for (const dS of [200,300,400,450,500]) {
  const out = [];
  for (const build of ['built','free']) {
    const R = run({ mat, t, shape:'L', corner:'L', dLeft:dS, build, sys:'cheeks' });
    const cz = -R.D/2 + (R.warn, 0);
    // side's first cheek / side module wall: find the box that is at the corner
    const lvl0 = 150;
    const back = R.boxes.filter(b => /^(Tablar|Boden|Einlegeboden)/.test(b.key) && Math.abs(b.pos[1] - (lvl0 + t/2)) < 1 && rng(b)[2][0] < -R.D/2 + 50).map(rng).sort((a,b)=>a[0][0]-b[0][0])[0];
    const sideX = -R.W/2 + (normReduit({ ...base, mat, t, shape:'L', dLeft:dS }).cfg.dLeft);
    out.push(`${back[0][1]-back[0][0]} / ${Math.max(0, Math.min(sideX, back[0][1]) - back[0][0])} / ${Math.max(0, back[0][1] - sideX)}`);
  }
  const dL = normReduit({ ...base, mat, t, shape:'L', dLeft:dS }).cfg.dLeft;
  console.log(`${mat} ${t} dLeft ${dS}->${dL}:  Wangen ${out[0]}  |  frei ${out[1]}`);
}
// 3. Schienen: Tablar in Schiene
for (const o of [{}, {mat:'gon_fichte', t:18}]) {
  const R = run({ shape:'L', sys:'rails', ...o });
  const rail = R.extras.filter(e=>e.type==='metal').map(rng).find(r => r[1][1]-r[1][0] > 1000 && r[2][0] === -700);
  const sh = R.boxes.filter(b=>b.key.startsWith('Tablar')).map(rng).find(r=>r[2][0] < -600);
  const side = R.boxes.filter(b=>b.key.startsWith('Tablar')).map(rng).find(r=>r[2][0] >= -310);
  console.log('rails', JSON.stringify(o), 'Schiene z', rail[2], 'Tablar hinten z', sh[2], 'Tablar seitlich z', side[2], '-> hinten angeschoben Vorderkante z', rail[2][1] + (sh[2][1]-sh[2][0]), 'Überlappung', rail[2][1] + (sh[2][1]-sh[2][0]) - side[2][0]);
}
// 4. Konsolen kreuzen bei flachem Hinterregal
for (const dB of [150,200,210,220,250,260]) {
  const R = run({ shape:'L', sys:'rails', dBack:dB });
  const m = R.extras.filter(e=>e.type==='metal').map(rng).filter(r => r[1][0] >= 100 && r[1][1] <= 160 && r[1][1]-r[1][0] < 30);
  const backK = m.filter(r => r[2][1]-r[2][0] > r[0][1]-r[0][0]).sort((a,b)=>a[0][0]-b[0][0])[0];
  const sideK = m.filter(r => r[0][1]-r[0][0] > r[2][1]-r[2][0]).sort((a,b)=>a[2][0]-b[2][0])[0];
  const cross = backK && sideK && backK[0][0] < sideK[0][1] && backK[0][1] > sideK[0][0] && backK[2][0] < sideK[2][1] && backK[2][1] > sideK[2][0];
  console.log('dBack', dB, 'Konsole hinten', JSON.stringify(backK), 'seitlich', JSON.stringify(sideK), cross ? 'KREUZEN' : 'frei', R.warn.filter(w=>w.includes('kürzeste')).length ? '(Warnung vorhanden)' : '');
}
// 5. Seitentiefe > hintere Tiefe im Zufall? nur zählen, wie oft Handeingabe erlaubt
// 6. Eckleiste Überschneidung mit seitl. Wandleiste und Länge
const R = run({ shape:'L', sys:'battens' });
const eck = R.rows.find(r=>r.name==='Eckleiste'); console.log('\nEckleiste Zeile', eck.L, eck.B, eck.t, eck.qty, eck.note);
const Rb = run({ shape:'L', sys:'battens', mat:'gon_fichte', t:18 });
const eckb = Rb.rows.find(r=>r.name==='Eckleiste'); const eckbox = Rb.boxes.find(b=>b.key.startsWith('Eckleiste'));
console.log('Eckleiste Bretter Zeile', eckb.L, eckb.B, eckb.t, 'Box', JSON.stringify(rng(eckbox)));
// 7. Bauablauf-Schritte posts U
console.log('\nSchritte posts U:'); run({ shape:'U', sys:'posts' }).steps.forEach((s,i)=>console.log(' ', i+1, s[0], '–', s[1].slice(0,160)));
console.log('\nSchritte free U:'); run({ shape:'U', build:'free' }).steps.forEach((s,i)=>console.log(' ', i+1, s[0], '–', s[1].slice(0,120)));
