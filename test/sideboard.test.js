const test = require('node:test');
const assert = require('node:assert');
Object.assign(globalThis, require('../shared.js'));
const { computeSideboard, frontMaterial } = require('../sideboard.js');

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
  assert.ok(!thin.warn.some(w => w.includes('Schiebetürbeschläge')));
  assert.ok(run({ front:'sliding', frontMat:'birke', frontT:21 }).warn.some(w => w.includes('dünnere Fronten')));
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
  assert.ok(R.steps.some(([titel, text]) => titel === 'Grundieren und lackieren' && text.includes('Die Fronten mit Hartwachsöl')));
});

test('Bad: Hinweise auch für das Frontmaterial', () => {
  const R = run({ room:'bath', mat:'eiche', frontMat:'seekiefer', frontT:15 });
  assert.ok(R.warn.some(w => w.includes('wasserfest verleimtes Sperrholz Seekiefer')));
});
