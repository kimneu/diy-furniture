const test = require('node:test');
const assert = require('node:assert');
const S = require('../shared.js');

test('sheetCosts: Zuschnitt = Teilefläche, ganze Platten = Plattenfläche', () => {
  const groups = [
    { price:100, partArea:2.4e6, sheets:[{}, {}], sheet:[2500, 1250] },
    { price:10, partArea:1e6, sheets:[{}], sheet:[2800, 2070] }
  ];
  const c = S.sheetCosts(groups);
  assert.strictEqual(Math.round(c.cut), 240 + 10);
  assert.strictEqual(Math.round(c.whole), Math.round(2 * 3.125 * 100 + 5.796 * 10));
});

test('matPrice: Preis pro Stärke, sonst Materialpreis', () => {
  assert.strictEqual(S.matPrice({ price:50, prices:{ 18:99.95 } }, 18), 99.95);
  assert.strictEqual(S.matPrice({ price:50, prices:{ 18:99.95 } }, 15), 50);
  assert.strictEqual(S.matPrice({ price:50 }, 18), 50);
});

const F = [
  { L:1200, B:200, price:5.6 }, { L:2000, B:200, price:10.2 },
  { L:1200, B:400, price:12.5 }, { L:2000, B:400, price:20.5 }
];
const part = (L, B, pos = 'A') => ({ L, B, pos, key:`${pos}|${L}|${B}`, name:'Tablar' });

test('boardWidthFor: kleinste Brettbreite bis 15 mm breiter', () => {
  assert.strictEqual(S.boardWidthFor([200, 400], 397), 400);
  assert.strictEqual(S.boardWidthFor([200, 400], 385), 400);
  assert.strictEqual(S.boardWidthFor([200, 400], 384), null);
  assert.strictEqual(S.boardWidthFor([200, 400], 200), 200);
  assert.strictEqual(S.boardWidthFor([200, 400], 410), null);
});

test('packBoards: günstigstes Format, halb volles 2000er wird 1200er', () => {
  const r = S.packBoards([part(1500, 397, 'A'), part(900, 397, 'B')], F, 4);
  // 1500 + 4 + 900 > 2000 → zwei Bretter: 1500 → 2000er (20.50), 900 → 1200er (12.50)
  assert.deepStrictEqual(r.sheets.map(s => [s.L, s.B, s.price]), [[2000, 400, 20.5], [1200, 400, 12.5]]);
  assert.strictEqual(r.unplaced.length, 0);
  assert.strictEqual(S.sheetCosts([{ boards:true, ...r }]).whole, 33);
});

test('packBoards: Sägeschnitt zählt (2 × 1000 passt nicht auf 2000)', () => {
  const r = S.packBoards([part(1000, 200, 'A'), part(1000, 200, 'B')], F, 4);
  assert.deepStrictEqual(r.sheets.map(s => s.L), [1200, 1200]);
  const r0 = S.packBoards([part(1000, 200, 'A'), part(1000, 200, 'B')], F, 0);
  assert.deepStrictEqual(r0.sheets.map(s => s.L), [2000]);
  assert.deepStrictEqual(r0.sheets[0].parts.map(p => p.x), [0, 1000]);
});

test('packBoards: zu breit oder zu lang → unplaced, doppelte Teile nur einmal gemeldet', () => {
  const r = S.packBoards([part(500, 450, 'A'), part(2100, 400, 'B'), part(2100, 400, 'B')], F, 4);
  assert.deepStrictEqual(r.unplaced.map(u => u.pos), ['A', 'B']);
  assert.strictEqual(r.sheets.length, 0);
  assert.strictEqual(S.sheetCosts([{ boards:true, ...r }]).whole, 0);
});

test('Brett-Material in MATS', () => {
  const M = S.MATS.gon_fichte;
  assert.deepStrictEqual(M.widths, [200, 400]);
  assert.deepStrictEqual(M.t, [18]);
  assert.strictEqual(M.tDef, 18);
  assert.deepStrictEqual(M.sheet, [2000, 400]);
  assert.strictEqual(M.price, 23.33);   // 5.60 / 0.24 m²
  assert.ok(!S.MATS.birke.boards);
});

test('Materialnamen: Werkstoff zuerst, eindeutig, Marke in Klammern nur bei ganzen Brettern', () => {
  const WERKSTOFFE = ['Sperrholz', 'Leimholz', 'Dreischicht', 'MDF', 'OSB', 'Spanplatte', 'Schaltafel', 'Regalbauplatte', 'Möbelplatte'];
  const names = Object.values(S.MATS).map(M => M.name);
  assert.strictEqual(new Set(names).size, names.length, names.join(', '));
  for (const M of Object.values(S.MATS)) {
    assert.ok(WERKSTOFFE.includes(M.name.split(' ')[0]), M.name);
    assert.ok(!M.name.includes('(') || M.boards, `${M.name}: Marke in Klammern nur bei ganzen Brettern`);
  }
});

/* ---------- Schrauben nach Stärke (Schreiner-Review K04) ---------- */
test('screwFor: jede Schraube lässt mindestens 3 mm Holz über der Spitze und greift genug', () => {
  const ts = [...new Set(Object.values(S.MATS).flatMap(M => M.t))];
  for (const t of ts) {
    const L = a => S.screwFor(a, t)[1];
    assert.ok(L('blech') <= 2 + t - 3 && L('blech') - 2 >= 8, `blech ${t}: ${L('blech')}`);
    assert.ok(L('latte') <= 24 + t - 3 && L('latte') - 24 >= 6, `latte ${t}: ${L('latte')}`);
    assert.ok(L('streifen') <= 2 * t - 3 && L('streifen') - t >= 6, `streifen ${t}: ${L('streifen')}`);
    assert.ok(L('oben') - t >= 15 && L('oben') - t <= 22, `oben ${t}: ${L('oben')}`);
    // Füsse unter einem 12-mm-Boden gehen nicht (Regel S01 sperrt den 12-mm-Korpus beim Sideboard).
    if (t >= 15) assert.ok(L('fuss') <= t - 3, `fuss ${t}: ${L('fuss')}`);
    assert.ok(L('kante') - t >= 15, `kante ${t}: ${L('kante')}`);
  }
});

test('screwFor: Werte aus der Tabelle im Eck-Urteil', () => {
  const s = (a, t) => S.screwText(S.screwFor(a, t));
  assert.strictEqual(s('blech', 18), '4 × 16');
  assert.strictEqual(s('blech', 15), '4 × 12');
  assert.strictEqual(s('blech', 12), '3,5 × 10');
  assert.strictEqual(s('latte', 18), '4 × 35');
  assert.strictEqual(s('latte', 27), '4 × 45');
  assert.strictEqual(s('oben', 18), '4 × 40');
  assert.strictEqual(s('fuss', 18), '4 × 12');
});
