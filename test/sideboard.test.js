const test = require('node:test');
const assert = require('node:assert');
Object.assign(globalThis, require('../shared.js'));
const { computeSideboard, frontMaterial, frontTs } = require('../sideboard.js');

const BASE = { W:1200, H:720, D:400, room:'living', mat:'birke', t:18, back:'hdf3', top:'over', sections:2, shelves:1,
  base:'legs', baseH:160, legShape:'cone', taper:35, legColor:'oak', joint:'pocket', front:'hinged', doorsPer:'auto',
  slideN:'auto', handle:'hole', color:'korpus', sheetL:1500, sheetB:3000, kerf:4, grain:true, price:88.95 };
const run = o => computeSideboard({ ...BASE, ...o });
const fronts = R => R.rows.filter(r => r.kind === 'front');

test('frontMaterial: ohne Angabe wie der Korpus, sonst gewählte oder passende Stärke', () => {
  assert.deepStrictEqual(frontMaterial(BASE), { fmat:'birke', MF:MATS.birke, tf:18 });
  assert.strictEqual(frontMaterial({ ...BASE, frontMat:'korpus', frontT:12 }).tf, 18);
  assert.strictEqual(frontMaterial({ ...BASE, frontMat:'birke', frontT:12 }).tf, 12);
  assert.strictEqual(frontMaterial({ ...BASE, frontMat:'eiche', frontT:12 }).tf, 18);   // 12 gibt es nicht, 18 wie Korpus
  assert.strictEqual(frontMaterial({ ...BASE, frontMat:'mdf', frontT:NaN }).tf, 19);    // 18 gibt es nicht → Standard
  assert.strictEqual(frontMaterial({ ...BASE, frontMat:'gon_fichte' }).fmat, 'birke');  // ganze Bretter nicht für Fronten
});

test('Fronten wie Korpus: eine Plattengruppe, Türen in Korpusstärke', () => {
  const R = run({});
  assert.strictEqual(R.groups.length, 2);   // Korpus + Rückwand
  assert.ok(fronts(R).every(r => r.t === 18 && r.group === 'Sperrholz Birke Premium 18 mm'));
  assert.strictEqual(R.Dtot, 400 + 18 + 1);
});

test('Dünnere Türen aus demselben Material: eigene Gruppe mit Katalogpreis der Stärke', () => {
  const R = run({ frontMat:'birke', frontT:12 });
  const g = R.groups.find(g => g.label === 'Sperrholz Birke Premium 12 mm');
  assert.ok(g, R.groups.map(g => g.label).join(', '));
  assert.strictEqual(g.price, MATS.birke.prices[12]);
  assert.ok(fronts(R).length && fronts(R).every(r => r.t === 12 && r.group === g.label));
  assert.ok(R.rows.filter(r => r.kind === 'korpus').every(r => r.t === 18));
  assert.strictEqual(R.Dtot, 400 + 12 + 1);
  assert.strictEqual(R.tf, 12);
  // 12 mm: kleiner Topf, Werkzeug und Beschlag passen dazu
  assert.ok(R.hw.some(h => /Topfscharnier Ø 26 mm/.test(h[1])));
  assert.ok(R.tools.some(x => x.startsWith('Forstnerbohrer Ø 26 mm')));
  assert.ok(fronts(R).every(r => r.note.includes('Topfbohrung Ø 26')));
});

test('Schiebetüren: Schienen und Mittelwände richten sich nach der Frontstärke', () => {
  const same = run({ front:'sliding', sections:3 }), thin = run({ front:'sliding', sections:3, frontMat:'birke', frontT:12 });
  const depth = R => R.rows.find(r => r.name === 'Mittelwand').B;
  assert.strictEqual(depth(thin) - depth(same), 2 * (18 - 12));
  assert.ok(!same.warn.some(w => w.includes('Schiebetürbeschläge')));
});

test('Hinweis: Schiebetüren unter 16 mm passen oft nicht in den Beschlag', () => {
  const hat = o => run({ front:'sliding', sections:3, ...o }).warn.some(w => w.includes('Schiebetürbeschläge'));
  assert.ok(hat({ frontMat:'birke', frontT:12 }));
  assert.ok(hat({ frontMat:'seekiefer', frontT:15 }));
  assert.ok(!hat({ frontMat:'mdf', frontT:16 }));
  assert.ok(!hat({ frontMat:'birke', frontT:12, front:'hinged' }));
});

test('Hinweis: dünne Türen über dem Richtwert verziehen sich', () => {
  const warnt = o => run(o).warn.some(w => w.includes('verziehen sie sich leicht'));
  // BASE: Korpus 720 mit 160 mm Füssen → Drehtüren 557 mm hoch
  assert.ok(!warnt({ frontMat:'birke', frontT:12 }));
  assert.ok(warnt({ frontMat:'birke', frontT:12, H:900 }));                 // 737 mm > 600
  assert.ok(!warnt({ frontMat:'seekiefer', frontT:15, H:900 }));            // 15 mm bis 900 ok
  assert.ok(warnt({ frontMat:'seekiefer', frontT:15, H:1200 }));            // 1037 mm > 900
  assert.ok(!warnt({ H:1200 }));                                            // 18 mm immer ok
  assert.ok(!warnt({ frontMat:'birke', frontT:12, H:900, front:'open' }));  // offen: keine Türen
  const R = run({ frontMat:'birke', frontT:12, H:900 });
  assert.ok(R.warn.some(w => w.startsWith('Die Türen sind 737 mm hoch')), JSON.stringify(R.warn));
});

test('Fronten höchstens 19 mm, auch «wie Korpus» bei dickem Korpus', () => {
  assert.strictEqual(frontMaterial({ ...BASE, frontMat:'birke', frontT:21 }).tf, 18);
  assert.strictEqual(frontMaterial({ ...BASE, t:21 }).tf, 18);
  assert.strictEqual(frontMaterial({ ...BASE, t:15 }).tf, 15);   // bis 19 mm bleibt es die Korpusstärke
  assert.strictEqual(frontMaterial({ ...BASE, mat:'dreischicht', t:27 }).tf, 19);
  assert.strictEqual(frontMaterial({ ...BASE, frontMat:'eiche', frontT:27 }).tf, 18);
  for (const M of Object.values(MATS)) if (!M.boards) assert.ok(frontTs(M).length, M.name);   // jede Platte taugt als Front
  const R = run({ t:21, front:'sliding', sections:3, price:MATS.birke.prices[21] });
  assert.ok(fronts(R).every(r => r.t === 18 && r.group === 'Sperrholz Birke Premium 18 mm'));
  assert.ok(R.rows.filter(r => r.kind === 'korpus').every(r => r.t === 21));
  assert.ok(!R.warn.some(w => w.includes('Schiebetürbeschläge')));
});

test('Lackierte MDF-Fronten am geölten Korpus: Öl nur für den Korpus, Lack für die Fronten', () => {
  const R = run({ frontMat:'mdf', frontT:19, color:'salbei' });
  assert.strictEqual(R.frontFin.color, COLORS.salbei);
  assert.ok(R.groups.some(g => g.label === 'MDF roh 19 mm'));
  assert.ok(R.finish.some(f => f[1].startsWith('Hartwachsöl')));
  assert.ok(R.finish.some(f => f[1] === 'Grundierung für MDF (Kanten 2×)'));
  const alle = run({ frontMat:'mdf', frontT:19, color:'salbei', front:'open' });
  assert.ok(!alle.groups.some(g => g.label.startsWith('MDF roh')));   // offene Front: keine Fronten, keine Gruppe
});

test('Geölte Fronten an einem MDF-Korpus: eigener Satz im Bauablauf', () => {
  const R = run({ mat:'mdf', t:19, frontMat:'eiche', frontT:18 });
  assert.strictEqual(R.frontFin.color, MATS.eiche.color);
  assert.ok(R.steps.some(([titel, text]) => titel.startsWith('Grundieren und lackieren') && text.includes('Die Fronten mit Hartwachsöl')));
});

test('Bad: Hinweise auch für das Frontmaterial', () => {
  const R = run({ room:'bath', mat:'eiche', frontMat:'seekiefer', frontT:15 });
  assert.ok(R.warn.some(w => w.includes('wasserfest verleimtes Sperrholz Seekiefer')));
});

test('Schiebetüren: vordere Lochreihe liegt unter dem Einlegeboden (SK-1)', () => {
  const R = run({ front:'sliding', sections:2, shelves:1 });
  const seite = R.rows.find(r => r.name === 'Seite'), boden = R.rows.find(r => r.name === 'Einlegeboden');
  const vorn = Number(seite.note.match(/vorne (\d+) mm/)[1]);
  assert.ok(vorn >= seite.B - boden.B, `${vorn} < ${seite.B - boden.B}`);   // Loch hinter der Vorderkante des Bodens
  assert.ok(R.steps.find(s => s[0].startsWith('Löcher für Bodenträger'))[1].includes(`${vorn} mm von vorne`));
});

test('Spannweite je Material: Einlegeböden (W01) und Deckel/Boden bei jeder Fachzahl (W02)', () => {
  const span = R => R.warn.filter(w => w.includes('biegen sich'));
  // Spanplatte 19 spannt ca. 500 mm: 750 breit, 1 Fach → Warnung; Birke 18 (800) nicht
  assert.ok(span(run({ mat:'dekorspan', t:19, W:750, sections:1, shelves:1 })).some(w => w.includes('Spanplatte weiss 19 mm') && w.includes('500 mm')));
  assert.deepStrictEqual(span(run({ W:750, sections:1, shelves:1 })), []);
  // Deckel und Boden ohne Einlegeböden: auch bei 2 Fächern geprüft
  assert.ok(run({ mat:'dekorspan', t:16, W:2000, sections:2, shelves:0 }).warn.some(w => w.startsWith('Deckel und Boden spannen')));
  assert.ok(!run({ W:1200, sections:2, shelves:0 }).warn.some(w => w.includes('spannen')));
});

test('Anleitung Sideboard: Kippschutz vor dem Einräumen, MDF vor dem Zusammenbau lackieren', () => {
  const hoch = run({ H:1300, D:350 }).steps.map(s => s[0]);
  assert.ok(hoch.includes('Aufstellen und gegen Kippen sichern'));
  assert.ok(hoch.indexOf('Aufstellen und gegen Kippen sichern') < hoch.indexOf('Einlegeböden einlegen'));
  assert.ok(!run({}).steps.some(s => s[0] === 'Aufstellen und gegen Kippen sichern'));
  const mdf = run({ mat:'mdf', t:19 }).steps.map(s => s[0]);
  assert.ok(mdf.indexOf('Grundieren und lackieren – vor dem Zusammenbau') < mdf.indexOf('Korpus zusammenbauen'), mdf.join(' → '));
});
