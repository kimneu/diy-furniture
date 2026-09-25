const test = require('node:test');
const assert = require('node:assert');
Object.assign(globalThis, require('../shared.js'));
Object.assign(globalThis, require('../sideboard.js'), require('../reduit.js'));
const K = require('../konfig.js');
const E = require('../einkauf.js');

const FORM = {
  kind:'sideboard', w:'1200', h:'720', d:'400', room:'living', mat:'birke', t:'18', back:'hdf3', top:'over',
  sections:'2', shelves:'1', base:'legs', baseH:'160', legShape:'cone', taper:'35', legColor:'oak', joint:'pocket',
  front:'hinged', doorsPer:'auto', slideN:'auto', handle:'hole', color:'korpus',
  sheetL:'2500', sheetB:'1250', kerf:'4', grain:true, price:'100',
  rw:'1600', rd:'1400', rh:'2400', doorW:'800', doorIn:false, hinge:'L', wall:'solid',
  shape:'U', corner:'L', build:'built', sys:'battens', dBack:'400', dLeft:'300', dRight:'300',
  nShelves:'5', gapBottom:'150', gapTop:'300',
  nicheL:false, nicheLW:'450', nicheLH:'1300', nicheR:false, nicheRW:'450', nicheRH:'1300'
};
const titel = liste => liste.map(s => s.titel);

test('Sideboard: Zuschnitt je Plattengruppe mit allen Teilen, dann Beschläge, Oberfläche, Werkzeug', () => {
  const R = K.computeData(FORM);
  const L = E.einkaufsliste(R);
  assert.deepStrictEqual(titel(L), [...R.groups.map(g => `${g.label} · Zuschnitt`), 'Beschläge & Kleinteile', 'Oberfläche', 'Werkzeug']);
  const zu = L[0];
  const teile = R.rows.filter(r => r.group === R.groups[0].label);
  assert.strictEqual(zu.zeilen.length, teile.length);
  assert.match(zu.info, /^\d+ Platten? \d+ × \d+ mm$/);
  assert.match(zu.zeilen[0].text, /^\d+ × \d+ × \d+ mm · [A-Z]+ /);
  assert.strictEqual(L.at(-1).zeilen.length, R.tools.length);
});

test('Reduit mit ganzen Brettern: Bretter nach Format gezählt, Latten mit Länge, Kaufteile mit Preis', () => {
  const R = K.computeData({ ...FORM, kind:'reduit', mat:'gon_fichte', t:'18' });
  const L = E.einkaufsliste(R);
  const br = L.find(s => s.titel.endsWith('· ganze Bretter'));
  const n = br.zeilen.reduce((a, z) => a + Number(z.text.match(/^(\d+) ×/)[1]), 0);
  assert.strictEqual(n, R.groups[0].sheets.length);
  assert.match(br.zeilen[0].text, /^\d+ × Brett \d+ × \d+ mm$/);
  assert.match(br.zeilen[0].sub, /^à CHF \d+\.\d\d$/);
  const latten = L.find(s => s.titel === 'Massivholz Fichte');
  assert.ok(latten.zeilen.length > 0);
  assert.match(latten.zeilen[0].text, /^\d+ × \d+ mm · [A-Z]+ /);
  const hw = L.find(s => s.titel === 'Beschläge & Kaufteile');
  assert.ok(hw.zeilen.some(z => /CHF/.test(z.sub)));
});

test('ids hängen am Inhalt und sind eindeutig', () => {
  const L = E.einkaufsliste(K.computeData({ ...FORM, kind:'reduit' }));
  const ids = L.flatMap(s => s.zeilen.map(z => z.id));
  assert.strictEqual(new Set(ids).size, ids.length);
  assert.strictEqual(L[0].zeilen[0].id, `${L[0].titel}|${L[0].zeilen[0].text}`);
});

test('hakenFiltern: gleiche Zeilen bleiben, geänderte fallen weg', () => {
  const a = E.einkaufsliste(K.computeData(FORM));
  const haken = a.flatMap(s => s.zeilen.map(z => z.id));
  const b = E.einkaufsliste(K.computeData({ ...FORM, color:'salbei' }));   // Farbe ändert keine Zeile der Liste ausser Oberfläche
  const c = E.einkaufsliste(K.computeData({ ...FORM, w:'1400' }));        // Breite ändert Teilemasse
  const inB = E.hakenFiltern(haken, b), inC = E.hakenFiltern(haken, c);
  const zuschnittIds = a[0].zeilen.map(z => z.id);
  assert.ok(zuschnittIds.every(id => inB.includes(id)));
  assert.ok(zuschnittIds.some(id => !inC.includes(id)));
  assert.ok(inC.every(id => c.some(s => s.zeilen.some(z => z.id === id))));
});

test('listeText: Titel, Abschnitte, Info und Zeilen mit Hinweis', () => {
  const L = E.einkaufsliste(K.computeData(FORM));
  const t = E.listeText(L, 'Sideboard 1200 × 720 × 400 mm');
  assert.ok(t.startsWith('Sideboard 1200 × 720 × 400 mm\n'));
  assert.ok(t.includes(`\n${L[0].titel}\n${L[0].info}\n- ${L[0].zeilen[0].text}`));
});
