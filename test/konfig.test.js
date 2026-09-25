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

test('snapBreite rastet auf die nächste Brettbreite, bei Gleichstand die breitere', () => {
  assert.strictEqual(K.snapBreite([200, 400], 335), 400);
  assert.strictEqual(K.snapBreite([200, 400], 290), 200);
  assert.strictEqual(K.snapBreite([200, 400], 300), 400);
  assert.strictEqual(K.snapBreite([200, 400], 600), 400);
  assert.strictEqual(K.snapBreite([500], 150), 500);
});

test('Zufall Reduit mit Brettmaterial würfelt nur Brettbreiten als Tiefe', () => {
  const rnd = seeded(5);
  for (let i = 0; i < 50; i++) {
    const d = K.zufall({ ...FORM, kind:'reduit', mat:'gon_fichte', t:'18' }, rnd, 60, ['material']);
    for (const k of ['dBack', 'dLeft', 'dRight']) assert.ok([200, 400].includes(Number(d[k])), `${k}=${d[k]}`);
  }
});

test('Zufall hält gesperrte Gruppen fest', () => {
  const rnd = seeded(9);
  const sb = { ...FORM, mat:'eiche', t:'27', back:'ply6', price:'77', joint:'cam', w:'1500', h:'750', d:'420' };
  for (let i = 0; i < 30; i++) {
    const d = K.zufall(sb, rnd, 60, ['material', 'verbindung', 'masse']);
    for (const k of ['mat', 't', 'back', 'price', 'joint', 'w', 'h', 'd']) assert.strictEqual(d[k], sb[k], k);
  }
  const rd = { ...FORM, kind:'reduit', mat:'osb', t:'18', build:'free', sys:'posts', nicheL:true, nicheLW:'480', nicheLH:'1250' };
  for (let i = 0; i < 30; i++) {
    const d = K.zufall(rd, rnd, 60, ['material', 'bauart', 'nische']);
    for (const k of ['mat', 't', 'build', 'sys', 'nicheL', 'nicheLW', 'nicheLH']) assert.strictEqual(d[k], rd[k], k);
    assert.ok(d.shape === 'U' || (d.shape === 'L' && d.corner === 'L'), 'Nische links braucht ein Regal links');
  }
});

test('Zufall ohne Sperren würfelt weiterhin alles', () => {
  const rnd = seeded(13), mats = new Set();
  for (let i = 0; i < 30; i++) mats.add(K.zufall({ ...FORM, kind:'reduit' }, rnd).mat);
  assert.ok(mats.size >= 3);
});

test('Feste Tablartiefen: Zufall wählt kein Brettmaterial, das sie verschieben würde', () => {
  const rnd = seeded(17);
  for (let i = 0; i < 40; i++) {
    const d = K.zufall({ ...FORM, kind:'reduit', dBack:'350', dLeft:'250', dRight:'250' }, rnd, 60, ['tablare']);
    assert.strictEqual(d.dBack, '350');
    assert.ok(!MATS[d.mat].boards, d.mat);
  }
});
