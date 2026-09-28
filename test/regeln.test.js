const test = require('node:test');
const assert = require('node:assert');
Object.assign(globalThis, require('../shared.js'));
Object.assign(globalThis, require('../sideboard.js'), require('../reduit.js'));
const K = require('../konfig.js');

// Formularwerte wie beim ersten Besuch (wie in konfig.test.js).
const FORM = {
  kind:'sideboard', w:'1200', h:'720', d:'400', room:'living', mat:'birke', t:'18', back:'hdf3', top:'over',
  sections:'2', shelves:'1', base:'legs', baseH:'160', legShape:'cone', taper:'35', legColor:'oak', joint:'pocket',
  front:'hinged', doorsPer:'auto', slideN:'auto', handle:'hole', color:'korpus', frontMat:'korpus', frontT:'18',
  sheetL:'1500', sheetB:'3000', kerf:'4', grain:true, price:'88.95',
  rw:'1600', rd:'1400', rh:'2400', doorW:'800', doorIn:false, hinge:'L', wall:'solid',
  shape:'U', corner:'L', build:'built', sys:'battens', dBack:'400', dLeft:'300', dRight:'300',
  nShelves:'5', gapBottom:'150', gapTop:'300',
  nicheL:false, nicheLW:'450', nicheLH:'1300', nicheR:false, nicheRW:'450', nicheRH:'1300'
};
const RD = { ...FORM, kind:'reduit' };
const sperre = (d, feld, wert) => (K.pruefeRegeln(d).gesperrt[feld] || {})[wert];
const cfg = d => K.cfgFromData(d);
function seeded(seed){
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

test('Regeltabelle: jede Regel hat Wirkung, Grund und Befunde', () => {
  for (const r of K.REGELN) {
    assert.ok(['sperren', 'grenze', 'warnen'].includes(r.wirkung), r.id);
    assert.ok(r.befunde.length, r.id);
    if (r.wirkung === 'sperren') assert.ok(r.feld && typeof r.werte === 'function' && typeof r.grund === 'function', r.id);
    if (r.wirkung === 'grenze') assert.ok(r.felder.length && (r.min != null || r.max != null), r.id);
    if (r.wirkung === 'warnen') assert.ok(typeof r.text === 'function', r.id);
  }
});

test('Standardformulare: nichts gesperrt, was gewählt ist, und keine Korrektur', () => {
  for (const d of [FORM, RD]) {
    const P = K.pruefeRegeln(d);
    assert.deepStrictEqual(P.korrekturen, [], d.kind);
    assert.deepStrictEqual(P.warnungen, [], d.kind);
  }
});

test('S01: Sideboard-Korpus erst ab 18 mm, Seekiefer nur als Front', () => {
  assert.strictEqual(sperre(FORM, 't', '12').regel, 'S01');
  assert.ok(!sperre(FORM, 't', '18'));
  assert.strictEqual(sperre({ ...FORM, mat:'mdf', t:'19' }, 't', '16').regel, 'S01');
  assert.strictEqual(sperre({ ...FORM, mat:'fichtesp', t:'18' }, 't', '15').regel, 'S01');
  assert.strictEqual(sperre(FORM, 'mat', 'seekiefer').regel, 'S01');
  assert.ok(!sperre(FORM, 'frontMat', 'seekiefer'));
  const sk = K.pruefeRegeln({ ...FORM, mat:'seekiefer', t:'15' });
  assert.strictEqual(sk.d.mat, 'birke');
  assert.deepStrictEqual(sk.warnungen, []);
  assert.ok(!sperre({ ...RD, build:'free', rh:'1800', gapTop:'700' }, 't', '12'));      // niedrige Reduit-Module: nicht Teil von S01
  const P = K.pruefeRegeln({ ...FORM, t:'12' });
  assert.strictEqual(P.d.t, '18');
  assert.strictEqual(Number(P.d.price), matPrice(MATS.birke, 18));
  assert.ok(P.korrekturen[0].includes('18 mm statt 12 mm'));
});

test('S04/W03: Exzenter nur 15–22 mm, bei 15 mm eine Warnung; Dübel und Schrauben ab 15 mm', () => {
  assert.strictEqual(sperre({ ...FORM, mat:'fichtesp', t:'24' }, 'joint', 'cam').regel, 'S04');
  assert.ok(!sperre({ ...FORM, mat:'fichtesp', t:'21' }, 'joint', 'cam'));
  const w15 = K.pruefeRegeln({ ...RD, build:'free', rh:'1800', gapTop:'700', mat:'fichtesp', t:'15', joint:'cam' });
  assert.strictEqual(w15.d.joint, 'cam');
  assert.ok(w15.warnungen.some(w => w.includes('Minifix 15')));
  const frei12 = { ...RD, build:'free', rh:'1800', gapTop:'700', mat:'birke', t:'12' };   // niedrige Module: S03 greift nicht
  for (const j of ['cam', 'dowels', 'screws']) assert.strictEqual(sperre(frei12, 'joint', j).regel, 'S04', j);
  assert.ok(!sperre(frei12, 'joint', 'pocket'));
  assert.ok(!sperre({ ...RD, t:'12' }, 'joint', 'cam'), 'eingebaut hat keine Korpusverbindung');
});

test('S03: Wangen und Module über 1,2 m erst ab 18 mm', () => {
  const wangen = { ...RD, sys:'cheeks', mat:'fichtesp', t:'15' };
  assert.strictEqual(sperre(wangen, 't', '15').regel, 'S03');
  assert.strictEqual(sperre(wangen, 'mat', 'seekiefer').regel, 'S03');
  assert.strictEqual(sperre(wangen, 'mat', 'regalbau').regel, 'S03');
  assert.strictEqual(K.pruefeRegeln(wangen).d.t, '18');
  assert.strictEqual(sperre({ ...RD, build:'free', mat:'fichtesp' }, 't', '15').regel, 'S03');
  assert.ok(!sperre({ ...RD, build:'free', rh:'1800', gapTop:'700', mat:'fichtesp' }, 't', '15'), 'niedrige Module');
  assert.ok(!sperre({ ...RD, sys:'battens' }, 'mat', 'seekiefer'), 'Tablare dürfen dünner sein');
});

test('W06: Lack auf beschichteter Spanplatte gibt einen Hinweis', () => {
  const P = K.pruefeRegeln({ ...FORM, mat:'dekorspan', t:'19', color:'salbei' });
  assert.ok(P.warnungen.some(w => w.includes('Haftgrund')));
  assert.deepStrictEqual(K.pruefeRegeln({ ...FORM, mat:'dekorspan', t:'19', color:'korpus' }).warnungen, []);
  assert.deepStrictEqual(K.pruefeRegeln({ ...FORM, color:'salbei' }).warnungen, []);
});

test('S05/S06: Verschraubt nicht mit OSB und Leimholz', () => {
  assert.strictEqual(sperre({ ...FORM, mat:'osb', t:'18' }, 'joint', 'screws').regel, 'S05');
  assert.strictEqual(sperre({ ...FORM, mat:'eiche', t:'18' }, 'joint', 'screws').regel, 'S06');
  assert.strictEqual(sperre({ ...FORM, mat:'fichte', t:'18' }, 'joint', 'screws').regel, 'S06');
  assert.ok(!sperre(FORM, 'joint', 'screws'));
  assert.strictEqual(K.pruefeRegeln({ ...FORM, mat:'eiche', t:'18', joint:'screws' }).d.joint, 'pocket');
});

test('S07/S08: Rückwand Pflicht bei Türen und bei hohen Modulen', () => {
  assert.strictEqual(sperre(FORM, 'back', 'none').regel, 'S07');
  assert.ok(!sperre({ ...FORM, front:'open' }, 'back', 'none'));
  assert.strictEqual(sperre({ ...RD, build:'free' }, 'back', 'none').regel, 'S08');
  assert.ok(!sperre({ ...RD, build:'free', rh:'1800', gapTop:'700' }, 'back', 'none'));
  assert.strictEqual(K.pruefeRegeln({ ...FORM, back:'none' }).d.back, 'hdf3');
});

test('S09: im Bad keine Spanplatte und keine MDF-/Hartfaser-Rückwand', () => {
  const bad = { ...FORM, room:'bath' };
  assert.strictEqual(sperre(bad, 'mat', 'dekorspan').regel, 'S09');
  assert.strictEqual(sperre(bad, 'frontMat', 'dekorspan').regel, 'S09');
  assert.strictEqual(sperre(bad, 'back', 'hdf3').regel, 'S09');
  assert.ok(!sperre(bad, 'back', 'ply6'));
  const P = K.pruefeRegeln({ ...bad, mat:'dekorspan', t:'19', back:'hdf3' });
  assert.strictEqual(P.d.mat, 'birke');
  assert.strictEqual(P.d.back, 'ply6');
  assert.ok(MATS.birke.t.includes(Number(P.d.t)));
});

test('S10: Drehtüren nur bis 21 mm Korpus', () => {
  assert.strictEqual(sperre({ ...FORM, mat:'mdf', t:'22' }, 'front', 'hinged').regel, 'S10');
  assert.ok(!sperre({ ...FORM, mat:'birke', t:'21' }, 'front', 'hinged'));
  assert.strictEqual(K.pruefeRegeln({ ...FORM, mat:'eiche', t:'27' }).d.front, 'sliding');
});

test('S13: Leimholz immer in Faserrichtung', () => {
  assert.strictEqual(sperre({ ...FORM, mat:'eiche', t:'18' }, 'grain', 'false').regel, 'S13');
  assert.ok(!sperre(FORM, 'grain', 'false'));
  assert.strictEqual(K.pruefeRegeln({ ...FORM, mat:'eiche', t:'18', grain:false }).d.grain, true);
});

test('S14/S15: Tiefe bei Tablarwinkeln bis 375, bei Wandschienen ab 260', () => {
  const w = K.pruefeRegeln({ ...RD, sys:'brackets', dBack:'400' });
  assert.strictEqual(w.d.dBack, '375');
  assert.strictEqual(w.grenzen.dBack.max, 375);
  const s = K.pruefeRegeln({ ...RD, sys:'rails', dLeft:'200' });
  assert.strictEqual(s.d.dLeft, '260');
  // Ganze Bretter: auf eine Brettbreite innerhalb der Grenze
  assert.strictEqual(K.pruefeRegeln({ ...RD, sys:'brackets', mat:'gon_fichte', t:'18', dBack:'400' }).d.dBack, '200');
  assert.strictEqual(K.pruefeRegeln({ ...RD, sys:'rails', mat:'gon_fichte', t:'18', dLeft:'200' }).d.dLeft, '400');
  // Bretter ohne passende Breite sind bei Tablarwinkeln gesperrt
  assert.strictEqual(sperre({ ...RD, sys:'brackets' }, 'mat', 'schaltafel').regel, 'S14');
  assert.ok(!sperre({ ...RD, sys:'rails' }, 'mat', 'schaltafel'));
});

test('S16: Schienen und Winkel nicht auf Gipskarton', () => {
  const gk = { ...RD, wall:'drywall' };
  assert.strictEqual(sperre(gk, 'sys', 'rails').regel, 'S16');
  assert.strictEqual(sperre(gk, 'sys', 'brackets').regel, 'S16');
  assert.ok(!sperre(gk, 'sys', 'battens'));
  assert.strictEqual(K.pruefeRegeln({ ...gk, sys:'rails' }).d.sys, 'posts');
});

test('K14: Tür nach innen – Tiefe hinten höchstens Raumtiefe − Türbreite − 50', () => {
  const P = K.pruefeRegeln({ ...RD, shape:'I', rd:'1400', dBack:'600', doorIn:true });
  assert.strictEqual(P.d.dBack, '550');
  assert.ok(P.korrekturen.some(k => k.includes('Tür')));
  const eng = K.pruefeRegeln({ ...RD, shape:'I', rd:'900', doorW:'800', dBack:'300', doorIn:true });
  assert.ok(eng.warnungen.some(w => w.includes('Tür')), 'kein Platz: Warnung statt Korrektur');
});

test('Schloss: ein festgehaltenes Feld wird nicht korrigiert, sondern gewarnt', () => {
  const P = K.pruefeRegeln({ ...FORM, mat:'eiche', t:'27', joint:'cam' }, new Set(['mat', 't', 'joint']));
  assert.strictEqual(P.d.joint, 'cam');
  assert.ok(P.warnungen.some(w => w.includes('Exzenter')));
  assert.strictEqual(P.d.front, 'sliding', 'Front ist nicht festgehalten');
});

// Kombinationen über die Felder, an denen Regeln hängen.
function* kombinationen(){
  for (const mat of Object.keys(MATS)) for (const t of MATS[mat].t) {
    if (!MATS[mat].boards) for (const room of ['living', 'bath']) for (const front of ['open', 'hinged', 'sliding']) for (const joint of ['pocket', 'screws', 'dowels', 'cam']) for (const back of ['hdf3', 'none'])
      yield { ...FORM, mat, t:String(t), room, front, joint, back, grain:false };
    for (const build of ['built', 'free']) for (const sys of ['battens', 'rails', 'brackets', 'cheeks', 'posts']) for (const wall of ['solid', 'drywall']) for (const joint of ['pocket', 'screws', 'cam'])
      yield { ...RD, mat, t:String(t), build, sys, wall, joint, back:'none', dBack:'200', dLeft:'500', doorIn:true };
  }
}

test('Fixpunkt: die angepassten Werte sind erlaubt und brauchen keine weitere Korrektur', () => {
  let n = 0;
  for (const d of kombinationen()) {
    const P = K.pruefeRegeln(d);
    const Q = K.pruefeRegeln(P.d);
    assert.deepStrictEqual(Q.korrekturen, [], JSON.stringify(d));
    for (const [feld, werte] of Object.entries(P.gesperrt)) assert.ok(!werte[String(P.d[feld])], `${feld}=${P.d[feld]} ${JSON.stringify(d)}`);
    n++;
  }
  assert.ok(n > 1000, String(n));
});

test('Keine Sackgasse: jedes Feld behält mindestens einen erlaubten Wert', () => {
  const OPT = { joint:['pocket', 'screws', 'dowels', 'cam'], front:['open', 'hinged', 'sliding'], back:['hdf3', 'hf3', 'ply6', 'none'],
    sys:['battens', 'rails', 'brackets', 'cheeks', 'posts'], grain:['true', 'false'], frontMat:['korpus', 'dekorspan'] };
  for (const d of kombinationen()) {
    const P = K.pruefeRegeln(d);
    for (const [feld, werte] of Object.entries(P.gesperrt)) {
      const opts = feld === 't' ? MATS[P.d.mat].t.map(String) : feld === 'mat' ? Object.keys(MATS) : OPT[feld];
      assert.ok(opts.some(o => !werte[o]), `${feld} ${JSON.stringify(d)}`);
    }
  }
});

for (const kind of ['sideboard', 'reduit']) test(`Zufall ${kind}: kein gesperrter Wert, keine Regelwarnung`, () => {
  const rnd = seeded(kind.length + 3);
  for (let i = 0; i < 150; i++) {
    const d = K.zufall({ ...FORM, kind }, rnd);
    const P = K.pruefeRegeln(d);
    assert.deepStrictEqual(P.korrekturen, [], JSON.stringify(d));
    assert.deepStrictEqual(P.warnungen, [], JSON.stringify(d));
  }
});

test('Zufall auf Gipskarton würfelt keine Schienen und Winkel', () => {
  const rnd = seeded(21);
  for (let i = 0; i < 60; i++) {
    const d = K.zufall({ ...RD, wall:'drywall' }, rnd);
    if (d.build === 'built') assert.ok(!['rails', 'brackets'].includes(d.sys), d.sys);
  }
});
