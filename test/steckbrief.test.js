const test = require('node:test');
const assert = require('node:assert');
Object.assign(globalThis, require('../shared.js'));
Object.assign(globalThis, require('../sideboard.js'), require('../reduit.js'));
const K = require('../konfig.js');

// Formularwerte wie beim ersten Besuch (wie in konfig.test.js).
const FORM = {
  kind:'sideboard', w:'1200', h:'720', d:'400', room:'living', mat:'birke', t:'18', back:'hdf3', top:'over',
  sections:'2', shelves:'1', base:'legs', baseH:'160', legShape:'cone', taper:'35', legColor:'oak', joint:'pocket',
  front:'hinged', doorsPer:'auto', slideN:'auto', handle:'hole', color:'korpus',
  sheetL:'1500', sheetB:'3000', kerf:'4', grain:true, price:'100',
  rw:'1600', rd:'1400', rh:'2400', doorW:'800', doorIn:false, hinge:'L', wall:'solid',
  shape:'U', corner:'L', build:'built', sys:'battens', dBack:'400', dLeft:'300', dRight:'300',
  nShelves:'5', gapBottom:'150', gapTop:'300',
  nicheL:false, nicheLW:'450', nicheLH:'1300', nicheR:false, nicheRW:'450', nicheRH:'1300'
};
const rechne = d => { const P = K.pruefeRegeln(d); return { R:K.computeData(P.d), d:P.d }; };
const sideboard = rechne(K.startwerte(FORM, 'sideboard'));
const reduit = rechne(K.startwerte(FORM, 'reduit'));
const schaltafel = () => { const d = K.withCatalog({ ...K.startwerte(FORM, 'reduit'), bw:'R2', mat:'schaltafel' }); return rechne({ ...d, t:String(d.t) }); };

test('masseText beschriftet die Masse je Möbel', () => {
  assert.strictEqual(K.masseText(sideboard.R), 'B 1200 · H 720 · T 419 mm');
  assert.strictEqual(K.masseText(reduit.R), 'Raum B 1600 · T 1400 · H 2400 mm');
});

test('steckbriefText: Bauweise · Teile · Platten bzw. Bretter', () => {
  assert.strictEqual(K.steckbriefText(sideboard.R, sideboard.d), 'Sperrholz geölt · 10 Teile · 2 Platten');
  assert.strictEqual(K.steckbriefText(reduit.R, reduit.d), 'Pfostenrahmen · 67 Teile · 4 Platten');
  const b = schaltafel();
  assert.strictEqual(K.steckbriefText(b.R, b.d), 'Pfostenrahmen · 67 Teile · 10 Bretter');
  // ohne gewählte Bauweise: bauweiseVon(d) entscheidet (verschraubt → S5)
  const { bw, ...ohneBw } = sideboard.d;
  assert.strictEqual(K.steckbriefText(sideboard.R, { ...ohneBw, joint:'screws' }), 'Sperrholz verschraubt · 10 Teile · 2 Platten');
  // Einzahl; Platten vor Bretter; was 0 ist, fällt weg
  const eins = { rows:[{ qty:1 }], groups:[{ sheets:[{}] }, { sheets:[{}, {}, {}], boards:true }] };
  assert.strictEqual(K.steckbriefText(eins, { bw:'R2' }), 'Pfostenrahmen · 1 Teil · 1 Platte · 3 Bretter');
  assert.strictEqual(K.steckbriefText({ rows:[{ qty:2 }], groups:[{ sheets:[{}], boards:true }] }, { bw:'R1' }), 'Leisten · 2 Teile · 1 Brett');
});

test('preisAufschluesselung: Sideboard ohne Kaufteile und «ohne Beschläge»', () => {
  const A = K.preisAufschluesselung(sideboard.R);
  assert.strictEqual(A.total, K.kostenGesamt(sideboard.R));
  assert.strictEqual(A.holzName, 'Holz Zuschnitt');
  assert.strictEqual(A.holz, A.total);
  assert.strictEqual(A.kaufteile, null);
  assert.ok(A.ganzePlatten > A.holz);
  assert.strictEqual(A.ohneBeschlaege, true);
});

test('preisAufschluesselung: Reduit = Holz + Kaufteile, ganze Bretter ohne Plattenpreis', () => {
  const A = K.preisAufschluesselung(reduit.R);
  assert.ok(Math.abs(A.holz + A.kaufteile - A.total) < 1e-9);
  assert.ok(A.kaufteile > 0);
  assert.strictEqual(A.ohneBeschlaege, false);
  const B = K.preisAufschluesselung(schaltafel().R);
  assert.strictEqual(B.holzName, 'Holz ganze Bretter');
  assert.strictEqual(B.ganzePlatten, null);
});
