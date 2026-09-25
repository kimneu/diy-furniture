const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const { FILE, format } = require('../tools/preise-datei.cjs');
const PREISE = require('../preise.js');
Object.assign(globalThis, require('../shared.js'));
const R = require('../reduit.js');

test('preise.js hat die Form, die das Jumbo-Skript schreibt', () => {
  assert.strictEqual(fs.readFileSync(FILE, 'utf8'), format(PREISE));
});

test('jedes Material, jede Rückwand und jedes Kaufteil hat einen Preis', () => {
  const src = fs.readFileSync(require.resolve('../shared.js'), 'utf8');
  for (const k of src.match(/const MAT_INFO = \{([\s\S]*?)\n\};/)[1].match(/^  (\w+):/gm).map(s => s.trim().slice(0, -1)))
    assert.ok(MATS[k], `${k} fehlt in preise.js → platten`);
  for (const [k, B] of Object.entries(BACKS)) if (k !== 'none') assert.ok(B.price > 0 && B.sheet.length === 2, k);
  for (const [k, e] of Object.entries(PREISE.bretter)) assert.ok(MATS[k] && MATS[k].boards, `bretter.${k} ohne Material in MAT_INFO`);
  for (const [k, b] of Object.entries(R.BUY)) assert.ok(PREISE.kaufteile[k] && b.price > 0, `${k} fehlt in preise.js → kaufteile`);
});

test('Einträge in preise.js sind vollständig', () => {
  for (const [g, entries] of Object.entries(PREISE)) for (const [k, e] of Object.entries(entries)) {
    assert.match(e.stand, /^\d{4}-\d{2}-\d{2}$/, `${g}.${k} stand`);
    assert.ok(e.quelle, `${g}.${k} quelle`);
    if (g === 'platten') assert.ok(Object.values(e.prices).every(p => p > 0), `${g}.${k} prices`);
    if (g === 'platten' || g === 'rueckwaende') assert.ok(e.sheet.every(v => v > 0), `${g}.${k} sheet`);
    if (g === 'bretter') {
      assert.ok(e.t > 0, `${g}.${k} t`);
      assert.ok(e.formate.length > 0, `${g}.${k} formate`);
      for (const f of e.formate) assert.ok(f.L > 0 && f.B > 0 && f.price > 0, `${g}.${k} ${JSON.stringify(f)}`);
      assert.strictEqual(new Set(e.formate.map(f => `${f.L}x${f.B}`)).size, e.formate.length, `${g}.${k} doppeltes Format`);
    }
  }
});

test('Schaltafel ist ein ganzes Brett, keine Zuschnittplatte', () => {
  assert.ok(!PREISE.platten.schaltafel);
  assert.deepStrictEqual(PREISE.bretter.schaltafel.formate, [{ L:2000, B:500, price:29.5 }]);
});

test('Stärken und Standardpreis kommen aus preise.js', () => {
  assert.deepStrictEqual(MATS.fichtesp.t, [12, 15, 18, 21, 24]);
  assert.strictEqual(MATS.birke.price, PREISE.platten.birke.prices[18]);
  assert.deepStrictEqual(MATS.birke.sheet, PREISE.platten.birke.sheet);
});
