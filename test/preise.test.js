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

test('checkBoardPage: nur schreiben, wenn Masse und Stärke zum Format passen', () => {
  const { checkBoardPage } = require('../tools/preise-datei.cjs');
  assert.strictEqual(checkBoardPage({ dims:[2000, 400, 18], thick:18 }, { L:2000, B:400, t:18 }), null);
  assert.strictEqual(checkBoardPage({ dims:[2600, 400], thick:18 }, { L:2600, B:400, t:18 }), null);
  assert.strictEqual(checkBoardPage({ dims:[2000, 400, 18], thick:null }, { L:2000, B:400, t:18 }), null);
  assert.match(checkBoardPage({ dims:[1200, 400, 18], thick:18 }, { L:2000, B:400, t:18 }), /Masse/);
  assert.match(checkBoardPage({ dims:[], thick:18 }, { L:2000, B:400, t:18 }), /Masse/);
  assert.match(checkBoardPage({ dims:[2000, 400, 19], thick:19 }, { L:2000, B:400, t:18 }), /Stärke/);
});

test('Kaufteile: Packung erkennen, Seite prüfen, Preis pro Stück', () => {
  const { packungAus, checkKaufteilPage, stueckPreis } = require('../tools/preise-datei.cjs');
  assert.strictEqual(packungAus('Element System Wandschiene Weiss', 'https://x/element-system-wandschiene-weiss--200-cm--2-stueck/p/3191634'), 2);
  assert.strictEqual(packungAus('Spax TRX Senkkopf | 5 × 60 mm | 50 Stück', ''), 50);
  assert.strictEqual(packungAus('Konsole 35 cm weiss', 'https://x/konsole-35-cm-weiss/p/3191638'), null);
  assert.strictEqual(checkKaufteilPage({ price:9.5, stueck:2 }, { stueck:2 }), null);
  assert.strictEqual(checkKaufteilPage({ price:7.95, stueck:null }, {}), null);
  assert.match(checkKaufteilPage({ price:9.5, stueck:2 }, { stueck:1 }), /Packung/);
  assert.match(checkKaufteilPage({ price:null, stueck:2 }, { stueck:2 }), /kein Preis/);
  assert.strictEqual(stueckPreis(9.5, { stueck:2 }), 4.75);
  assert.strictEqual(stueckPreis(25.95, { stueck:500 }), 0.052);
  assert.strictEqual(stueckPreis(2.4, { laenge:2 }), 1.2);   // Meterware: Latte 2 m
});

test('jumbo-quellen.json: jede Quelle gehört zu einem Eintrag in preise.js', () => {
  const Q = JSON.parse(fs.readFileSync(require.resolve('../tools/jumbo-quellen.json'), 'utf8'));
  const { packungAus } = require('../tools/preise-datei.cjs');
  for (const [k, q] of Object.entries(Q)) {
    assert.match(q.url, /^https:\/\/www\.jumbo\.ch\/de\/.+\/p\/\d+$/, k);
    if (k.includes(' ')) {
      const [mat, fmt] = k.split(' '), [L, B] = fmt.split('x').map(Number);
      assert.ok(PREISE.bretter[mat] && PREISE.bretter[mat].formate.some(f => f.L === L && f.B === B), k);
    } else if (PREISE.kaufteile[k]) {
      assert.ok(Number.isInteger(q.stueck) && q.stueck >= 1, `${k}: stueck`);
      const n = packungAus('', q.url);
      assert.ok(n == null || n === q.stueck, `${k}: URL sagt ${n} Stück`);
    } else assert.ok(PREISE.platten[k.split('~')[0]] || PREISE.rueckwaende[k.split('~')[0]], k);
  }
});
