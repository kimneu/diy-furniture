const test = require('node:test');
const assert = require('node:assert');
Object.assign(globalThis, require('../shared.js'));
Object.assign(globalThis, require('../sideboard.js'), require('../reduit.js'));
const K = require('../konfig.js');

// Formularwerte wie beim ersten Besuch (Namen der Formularfelder).
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
// Eingabegrenzen wie in index.html
const RANGE = { w:[300, 2400], h:[300, 1400], d:[250, 650], baseH:[40, 350], taper:[10, 60],
  dBack:[150, 600], dLeft:[150, 600], dRight:[150, 600], nShelves:[1, 8], gapBottom:[0, 600], gapTop:[100, 800],
  nicheLW:[300, 1000], nicheLH:[600, 1800] };

function seeded(seed){
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

test('cfgFromData liest Zahlen und Checkboxen', () => {
  const c = K.cfgFromData(FORM);
  assert.strictEqual(c.W, 1200); assert.strictEqual(c.grain, true); assert.strictEqual(c.doorIn, false);
  assert.strictEqual(K.cfgFromData({ ...FORM, doorIn:'on' }).doorIn, true);
});

for (const kind of ['sideboard', 'reduit']) test(`Zufall ${kind}: 200 Würfe ohne Warnungen und in den Eingabegrenzen`, () => {
  const rnd = seeded(kind.length), seen = new Set();
  for (let i = 0; i < 200; i++) {
    const d = K.zufall({ ...FORM, kind }, rnd);
    const warn = K.computeData(d).warn.filter(w => !K.HARMLOS.test(w));
    assert.deepStrictEqual(warn, [], JSON.stringify(d));
    for (const [k, [a, b]] of Object.entries(RANGE)) assert.ok(d[k] >= a && d[k] <= b, `${k}=${d[k]}`);
    assert.ok(MATS[d.mat].t.includes(d.t));
    assert.strictEqual(d.price, matPrice(MATS[d.mat], d.t));
    seen.add(kind === 'reduit' ? d.shape + d.sys : d.front + d.base);
  }
  assert.ok(seen.size >= 5, 'Würfe sollen sich unterscheiden');
});

test('Zufall Reduit lässt den Raum stehen', () => {
  const room = { rw:'1300', rd:'2000', rh:'2500', doorW:'700', doorIn:true, hinge:'R', wall:'drywall' };
  const d = K.zufall({ ...FORM, kind:'reduit', ...room }, seeded(7));
  for (const k in room) assert.strictEqual(d[k], room[k], k);
  assert.notStrictEqual(d.shape, 'U', 'U-Form braucht Platz');
});

for (const wall of ['solid', 'drywall']) test(`Zufall Reduit (${wall}) würfelt meist eingebaute Regale`, () => {
  const rnd = seeded(11), n = { built:0, free:0 };
  for (let i = 0; i < 100; i++) n[K.zufall({ ...FORM, kind:'reduit', wall }, rnd).build]++;
  assert.ok(n.built >= 50, JSON.stringify(n));
});

test('Zufall Sideboard behält Einsatzort und Masse des Bads', () => {
  const d = K.zufall({ ...FORM, room:'bath' }, seeded(3));
  assert.strictEqual(d.room, 'bath');
  assert.strictEqual(d.back, 'ply6');
});

test('Sammlungseintrag beschreibt das Möbel mit Kosten', () => {
  const d = { ...FORM };
  const e = K.sammlungEintrag(d, K.computeData(d), new Date('2026-09-25T10:00:00Z'));
  assert.strictEqual(e.name, 'Sideboard 1200 mm');
  assert.strictEqual(e.gespeichert, '2026-09-25');
  assert.strictEqual(e.info.material, 'Birke-Multiplex 18 mm');
  assert.ok(e.info.kosten > 0);
  const r = K.sammlungEintrag({ ...FORM, kind:'reduit' }, K.computeData({ ...FORM, kind:'reduit' }));
  assert.strictEqual(r.info.typ, 'Reduit U-Form');
  assert.ok(r.info.kosten > 0);
});

test('kostenGesamt = Holz im Zuschnitt + Latten + Kaufteile, gleich wie in der Sammlung', () => {
  const R = K.computeData({ ...FORM, kind:'reduit' });
  const { cut } = sheetCosts(R.groups);
  assert.strictEqual(K.kostenGesamt(R), cut + R.solidCost + R.buyCost);
  assert.ok(R.buyCost > 0);
  assert.strictEqual(K.sammlungEintrag(FORM, K.computeData(FORM)).info.kosten, Math.round(K.kostenGesamt(K.computeData(FORM))));
});

test('Entwürfe: alter Einzelentwurf landet unter seinem Typ', () => {
  const e = K.entwuerfeLaden(null, { ...FORM, kind:'reduit', rw:'1800' });
  assert.strictEqual(e.kind, 'reduit');
  assert.strictEqual(e.reduit.rw, '1800');
  assert.strictEqual(e.sideboard, undefined);
});

test('Entwürfe: neuer Speicher hat Vorrang; ohne Entwurf null', () => {
  const neu = { kind:'sideboard', sideboard:{ ...FORM } };
  assert.strictEqual(K.entwuerfeLaden(neu, { ...FORM, kind:'reduit' }), neu);
  assert.strictEqual(K.entwuerfeLaden(null, null), null);
  assert.strictEqual(K.entwuerfeLaden({ kind:'reduit' }, null), null);
});

test('Entwürfe: Setzen ersetzt nur den Entwurf des eigenen Typs', () => {
  let e = K.entwurfSetzen(null, { ...FORM, kind:'reduit', mat:'gon_fichte' });
  e = K.entwurfSetzen(e, { ...FORM, kind:'sideboard', mat:'eiche' });
  assert.strictEqual(e.kind, 'sideboard');
  assert.strictEqual(e.reduit.mat, 'gon_fichte');
  assert.strictEqual(e.sideboard.mat, 'eiche');
});
