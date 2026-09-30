const test = require('node:test');
const assert = require('node:assert');
Object.assign(globalThis, require('../shared.js'));
Object.assign(globalThis, require('../sideboard.js'), require('../reduit.js'));
const K = require('../konfig.js');

const FORM = {
  kind:'sideboard', w:'1200', h:'720', d:'400', room:'living', mat:'birke', t:'18', back:'hdf3', top:'over',
  sections:'2', shelves:'1', base:'legs', baseH:'160', legShape:'cone', taper:'35', legColor:'oak', joint:'pocket',
  front:'hinged', doorsPer:'auto', slideN:'auto', handle:'hole', color:'korpus', frontMat:'korpus', frontT:'18',
  sheetL:'1500', sheetB:'3000', kerf:'4', grain:true, price:'88.95',
  rw:'1600', rd:'1400', rh:'2400', doorW:'800', doorPos:'M', doorOff:'200', doorH:'2000', doorIn:false, hinge:'L', wall:'solid',
  shape:'U', corner:'L', build:'built', sys:'posts', dBack:'400', dLeft:'300', dRight:'300',
  nShelves:'5', gapBottom:'150', gapTop:'300',
  nicheL:false, nicheLW:'450', nicheLH:'1300', nicheR:false, nicheRW:'450', nicheRH:'1300'
};
const SB = { ...FORM, bw:'S1' };
const RD = { ...FORM, kind:'reduit', mat:'fichtesp', t:'18', price:'64.95', sheetL:'2500', sheetB:'1250', grain:false, bw:'R2' };
const P = d => K.pruefeRegeln(d);
const sperre = (d, feld, wert) => (P(d).gesperrt[feld] || {})[wert];

test('Bauweisen: 6 fürs Sideboard, 6 fürs Reduit, Daten vollständig', () => {
  assert.deepStrictEqual(K.BAUWEISEN.sideboard.map(b => b.id), ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']);
  assert.strictEqual(K.BAUWEISEN.reduit.length, 6);
  for (const b of [...K.BAUWEISEN.sideboard, ...K.BAUWEISEN.reduit]) {
    assert.ok(b.name && b.desc && b.niveau.length, b.id);
    for (const [m, ts] of Object.entries(b.mats)) {
      assert.ok(MATS[m], `${b.id}: ${m}`);
      for (const t of ts) assert.ok(MATS[m].t.includes(t), `${b.id}: ${m} ${t}`);
    }
    for (const m of b.bad || []) assert.ok(b.mats[m], `${b.id} Bad: ${m}`);
  }
});

test('Standard mit Bauweise: keine Korrektur, keine Warnung', () => {
  for (const d of [SB, RD]) {
    const X = P(d);
    assert.deepStrictEqual(X.korrekturen, [], d.bw);
    assert.deepStrictEqual(X.warnungen, [], d.bw);
    assert.deepStrictEqual(K.computeData(d).warn, [], d.bw);
  }
});

test('Die Bauweise legt Material, Stärke, Verbindung und Rückwand fest', () => {
  const s3 = P({ ...SB, bw:'S3' }).d;
  assert.deepStrictEqual([s3.mat, String(s3.t), s3.joint], ['dekorspan', '19', 'cam']);
  assert.strictEqual(Number(s3.price), matPrice(MATS.dekorspan, 19));
  const s4 = P({ ...SB, bw:'S4', mat:'fichte', t:'27', joint:'screws', back:'hf3' }).d;
  assert.deepStrictEqual([s4.mat, String(s4.t), s4.joint, s4.back], ['fichte', '18', 'dowels', 'ply6']);
  assert.strictEqual(P({ ...SB, bw:'S5' }).d.top, 'between');
  assert.strictEqual(P({ ...SB, bw:'S6' }).d.joint, 'cam');
  assert.ok(sperre(SB, 'mat', 'eiche') && sperre(SB, 't', '21') && sperre(SB, 'joint', 'dowels'));
  assert.ok(!sperre(SB, 'mat', 'fichtesp'));
  // Fronten: nur die Frontmaterialien der Bauweise, ab 16 mm
  assert.ok(sperre(SB, 'frontMat', 'eiche') && !sperre(SB, 'frontMat', 'mdf'));
  assert.strictEqual(P({ ...SB, frontMat:'birke', frontT:'12' }).d.frontMat, 'korpus');
  assert.strictEqual(P({ ...SB, frontMat:'mdf', frontT:'16' }).d.frontT, '16');
});

test('Reduit: Bauweise legt Bauart fest', () => {
  const r6 = P({ ...RD, bw:'R6', mat:'dekorspan', t:'19', back:'none' }).d;
  assert.deepStrictEqual([r6.build, r6.joint], ['free', 'cam']);
  assert.notStrictEqual(r6.back, 'none');
  assert.strictEqual(P({ ...RD, bw:'R6', joint:'screws' }).d.joint, 'pocket');
  assert.deepStrictEqual((({ build, sys }) => [build, sys])(P({ ...RD, bw:'R5' }).d), ['built', 'cheeks']);
  assert.ok(sperre({ ...RD, bw:'R1', shape:'I', rw:'700', rd:'900', doorW:'600' }, 'mat', 'mdf'), 'MDF nur beim Pfostenrahmen');
  assert.ok(!sperre(RD, 'mat', 'mdf'));
  assert.ok(sperre({ ...RD, bw:'R5' }, 'mat', 'osb'));
});

test('Sperren der Bauweise: Bad, Gipskarton, Leisten über der Spannweite', () => {
  const bad = { ...SB, room:'bath' };
  for (const id of ['S3', 'S5', 'S6']) assert.ok(sperre(bad, 'bw', id), id);
  for (const id of ['S1', 'S2', 'S4']) assert.ok(!sperre(bad, 'bw', id), id);
  assert.ok(sperre(bad, 'mat', 'fichtesp'), 'S1 im Bad nur Birke');
  assert.strictEqual(P({ ...bad, bw:'S4', mat:'fichte' }).d.mat, 'eiche');
  const gk = { ...RD, wall:'drywall' };
  assert.ok(sperre(gk, 'bw', 'R3').grund.includes('Gipskarton') && sperre(gk, 'bw', 'R4'));
  assert.ok(!sperre(gk, 'bw', 'R2') && !sperre(gk, 'bw', 'R6'));
  // Leisten: im Standard-U zu weit frei, in einem kleinen Raum möglich
  const s = sperre(RD, 'bw', 'R1');
  assert.ok(s && s.grund.includes('Pfostenrahmen'), JSON.stringify(s));
  assert.ok(!sperre({ ...RD, shape:'I', rw:'700', rd:'900', doorW:'600' }, 'bw', 'R1'));
  // gesperrt gewählt → weicht auf den Pfostenrahmen aus
  const X = P({ ...RD, bw:'R1', sys:'battens' });
  assert.deepStrictEqual([X.d.bw, X.d.sys], ['R2', 'posts']);
});

test('Bauweise des anderen Möbeltyps weicht aus', () => {
  assert.strictEqual(P({ ...SB, bw:'R2' }).d.bw, 'S1');
  assert.strictEqual(P({ ...RD, bw:'S1' }).d.bw, 'R2');
});

test('bauweiseVon: ältere Werte finden ihre Bauweise', () => {
  assert.strictEqual(K.bauweiseVon(FORM), 'S1');
  assert.strictEqual(K.bauweiseVon({ ...FORM, mat:'eiche', joint:'cam' }), 'S4');
  assert.strictEqual(K.bauweiseVon({ ...FORM, mat:'mdf' }), 'S2');
  assert.strictEqual(K.bauweiseVon({ ...FORM, joint:'screws' }), 'S5');
  assert.strictEqual(K.bauweiseVon({ ...FORM, joint:'cam' }), 'S6');
  assert.strictEqual(K.bauweiseVon({ ...FORM, room:'bath', joint:'screws' }), 'S1');
  assert.strictEqual(K.bauweiseVon({ ...FORM, kind:'reduit', sys:'rails' }), 'R3');
  assert.strictEqual(K.bauweiseVon({ ...FORM, kind:'reduit', build:'free' }), 'R6');
});

// Kombinationen über die Felder, an denen Bauweisen hängen
function* kombi(){
  for (const b of K.BAUWEISEN.sideboard) for (const room of ['living', 'bath']) for (const [mat, t] of [['birke', '18'], ['eiche', '27'], ['dekorspan', '16'], ['seekiefer', '12'], ['mdf', '22']])
    for (const joint of ['pocket', 'screws', 'cam', 'dowels']) for (const front of ['open', 'hinged', 'sliding']) for (const back of ['hdf3', 'none'])
      yield { ...SB, bw:b.id, room, mat, t, joint, front, back, frontMat:'korpus', grain:false };
  for (const b of K.BAUWEISEN.reduit) for (const wall of ['solid', 'drywall']) for (const shape of ['I', 'U']) for (const [mat, t] of [['fichtesp', '18'], ['mdf', '16'], ['gon_fichte', '18'], ['seekiefer', '12'], ['schaltafel', '27']])
    yield { ...RD, bw:b.id, wall, shape, mat, t, back:'none', joint:'screws' };
}

test('Bauweisen: Fixpunkt, nichts Gesperrtes gewählt, keine Sackgasse', () => {
  let n = 0;
  for (const d of kombi()) {
    const X = P(d);
    assert.deepStrictEqual(P(X.d).korrekturen, [], JSON.stringify(d));
    for (const [feld, werte] of Object.entries(X.gesperrt)) assert.ok(!werte[String(X.d[feld])], `${feld}=${X.d[feld]} ${JSON.stringify(d)}`);
    assert.deepStrictEqual(X.warnungen.filter(w => !w.includes('Haftgrund') && !w.includes('Minifix')), [], JSON.stringify(d));
    n++;
  }
  assert.ok(n > 1000, String(n));
});

test('Karten: Preis je Bauweise für die aktuellen Masse, gesperrte ohne Preis', () => {
  const p = K.kartenPreise(SB);
  assert.deepStrictEqual(Object.keys(p), ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']);
  assert.ok(Object.values(p).every(v => v > 0));
  assert.ok(p.S3 < p.S1, 'Spanplatte ist günstiger als Birke');
  assert.ok(K.kartenPreise({ ...SB, w:'1800' }).S1 > p.S1, 'breiter kostet mehr');
  const bad = K.kartenPreise({ ...SB, room:'bath' });
  assert.deepStrictEqual([bad.S3, bad.S5, bad.S6], [null, null, null]);
  const gk = K.kartenPreise({ ...RD, wall:'drywall' });
  assert.deepStrictEqual([gk.R1, gk.R3, gk.R4], [null, null, null]);
  assert.ok(gk.R2 > 0 && gk.R6 > 0);
});

test('Karten: Details der Bauweise, im Bad mit den Bad-Regeln', () => {
  const d = Object.fromEntries(K.bwDetails(K.BW.S1, K.cfgFromData(SB)));
  assert.strictEqual(d.Verbindung, 'Taschenloch');
  assert.strictEqual(d['Stärke'], '18 mm, Dreischicht Fichte 19 mm');
  const bad = Object.fromEntries(K.bwDetails(K.BW.S1, K.cfgFromData({ ...SB, room:'bath' })));
  assert.ok(!bad.Material.includes('Fichte') && bad.Rückwand === 'Sperrholz Pappel' && bad['Im Bad']);
  assert.ok(Object.fromEntries(K.bwDetails(K.BW.S5, K.cfgFromData(SB))).Verbindung.includes('Deckel zwischen den Seiten'));
  assert.strictEqual(Object.fromEntries(K.bwDetails(K.BW.R3, K.cfgFromData(RD))).Wand, 'nur Beton oder Backstein');
});
