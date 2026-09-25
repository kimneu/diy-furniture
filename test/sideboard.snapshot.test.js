const test = require('node:test');
const assert = require('node:assert');
// Eingefrorene Preise: ein Preis-Update in preise.js soll den Snapshot nicht brechen.
globalThis.PREISE = require('./fixtures/preise.json');
Object.assign(globalThis, require('../shared.js'));
const { computeSideboard } = require('../sideboard.js');
const cfgs = require('./fixtures/sideboard-configs.json');
const snap = require('./fixtures/sideboard-snapshot.json');

test('computeSideboard entspricht dem Snapshot vor dem Umbau', () => {
  cfgs.forEach((c, i) => {
    assert.deepStrictEqual(JSON.parse(JSON.stringify(computeSideboard(c))), snap[i], `Konfiguration ${i}`);
  });
});
