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
