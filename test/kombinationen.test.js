const test = require('node:test');
const assert = require('node:assert');
Object.assign(globalThis, require('../shared.js'));
Object.assign(globalThis, require('../sideboard.js'), require('../reduit.js'));
const K = require('../konfig.js');

// Schreiner-Review, Schritt 8: Tests quer über alle Kombinationen. Für jede Bauweise werden Form, Wandart, Tür und
// einige Raummasse durchgespielt, dazu der Zufall mit festem Seed. Geprüft wird die Geometrie aus R.boxes und
// R.extras (keine Überschneidung, Auflagen), die Zahlen (keine NaN, nichts negativ) und das Regelwerk (Fixpunkt).

// Formularwerte wie beim ersten Besuch; startwerte setzt die Abweichungen des Typs (Reduit: Pfostenrahmen, Sperrholz Fichte).
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
const START = { sideboard:K.startwerte(FORM, 'sideboard'), reduit:K.startwerte(FORM, 'reduit') };
function seeded(seed){
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

/* ---------- Geometrie ---------- */
const lo = (b, i) => b.pos[i] - b.size[i] / 2, hi = (b, i) => b.pos[i] + b.size[i] / 2;
const ov = (a, b, i) => Math.min(hi(a, i), hi(b, i)) - Math.max(lo(a, i), lo(b, i));
const overlaps = (a, b) => [0, 1, 2].every(i => ov(a, b, i) > 0.001);
const name = b => b.key ? b.key.split('|')[0] : b.type;
const TABLAR = /^(Tablar|Einlegeboden)\|/;
const metall = R => R.extras.filter(e => e.type === 'metal');

// Auflagen eines Tablars S: Teile, auf denen es liegt (Oberkante = Unterkante des Tablars, Grundflächen überlappen),
// und Holzteile, an denen es seitlich hängt (Wange, Modulseite mit Bodenträgern, Stütze mit Winkel; höchstens 2,5 mm
// Luft, über die ganze Tablarstärke). Je Auflage die Kontaktfläche im Grundriss [x0, x1] × [z0, z1].
function auflagen(R, S){
  const out = [], holz = R.boxes.filter(b => b !== S && !TABLAR.test(b.key));
  for (const B of [...holz, ...metall(R)]) {
    if (Math.abs(hi(B, 1) - lo(S, 1)) <= 0.5 && ov(S, B, 0) >= 1 && ov(S, B, 2) >= 1) {
      out.push({ B, x0:Math.max(lo(S, 0), lo(B, 0)), x1:Math.min(hi(S, 0), hi(B, 0)), z0:Math.max(lo(S, 2), lo(B, 2)), z1:Math.min(hi(S, 2), hi(B, 2)) });
      continue;
    }
    if (B.type === 'metal' || lo(B, 1) > lo(S, 1) + 0.5 || hi(B, 1) < hi(S, 1) - 0.5) continue;
    for (const [g, o] of [[0, 2], [2, 0]]) {
      if (ov(S, B, o) < 1) continue;
      const luft = [lo(B, g) - hi(S, g), lo(S, g) - hi(B, g)], kante = [hi(S, g), lo(S, g)];
      const k = luft.findIndex(l => l >= -0.5 && l <= 2.5);
      if (k < 0) continue;
      const quer = [Math.max(lo(S, o), lo(B, o)), Math.min(hi(S, o), hi(B, o))];
      const [x, z] = g === 0 ? [[kante[k], kante[k]], quer] : [quer, [kante[k], kante[k]]];
      out.push({ B, x0:x[0], x1:x[1], z0:z[0], z1:z[1] });
    }
  }
  return out;
}

// Alle Prüfungen an einem Ergebnis; gibt die gefundenen Fehler als Texte zurück.
function geometrie(R){
  const f = [];
  for (const r of R.rows) if (!(r.L > 0 && r.B > 0 && r.t > 0 && r.qty > 0)) f.push(`Teil ${r.name}: ${r.L} × ${r.B} × ${r.t}, ${r.qty} Stk.`);
  for (const b of [...R.boxes, ...R.extras.filter(e => e.size)])
    if (!b.size.every(v => v > 0 && Number.isFinite(v)) || !b.pos.every(Number.isFinite)) f.push(`Box ${name(b)}: ${JSON.stringify(b.size)} bei ${JSON.stringify(b.pos)}`);
  for (const h of R.hw) if (!(h[0] > 0) || (h[3] != null && !(h[3] >= 0))) f.push(`Kaufteil ${h[1]}: ${h[0]} Stk. à ${h[3]}`);
  if (!Number.isFinite(R.buyCost || 0) || !Number.isFinite(R.solidCost || 0) || !Number.isFinite(K.kostenGesamt(R))) f.push('Kosten nicht endlich');
  for (const t of [...R.warn, ...R.steps.map(s => s.join(' '))]) if (/NaN|undefined|Infinity/.test(t)) f.push(`Text: ${t}`);
  // Tablare schneiden keine Pfosten, Stützen, Wangen, Schienen, Konsolen und Winkel.
  const tablare = R.boxes.filter(b => TABLAR.test(b.key));
  const hart = [...R.boxes.filter(b => /^(Kantholz|Wange)/.test(b.key)), ...metall(R)];
  for (const S of tablare) for (const B of hart) if (overlaps(S, B)) f.push(`${name(S)} schneidet ${name(B)} bei ${JSON.stringify(B.pos)}`);
  // Jedes Tablar liegt auf mindestens 2 Auflagen, und sein Schwerpunkt liegt innerhalb der Auflagen (kippt nicht).
  for (const S of tablare) {
    const a = auflagen(R, S), n = new Set(a.map(x => x.B)).size;
    if (n < 2) { f.push(`${name(S)} bei ${JSON.stringify(S.pos)}: ${n} Auflage(n) (${a.map(x => name(x.B)).join(', ')})`); continue; }
    const X0 = Math.min(...a.map(x => x.x0)), X1 = Math.max(...a.map(x => x.x1)), Z0 = Math.min(...a.map(x => x.z0)), Z1 = Math.max(...a.map(x => x.z1));
    if (S.pos[0] < X0 - 1 || S.pos[0] > X1 + 1 || S.pos[2] < Z0 - 1 || S.pos[2] > Z1 + 1) f.push(`${name(S)} bei ${JSON.stringify(S.pos)} kippt (Auflagen ${a.map(x => name(x.B)).join(', ')})`);
  }
  return f;
}

// Regelwerk: Die angepassten Werte sind erlaubt, liegen in ihren Grenzen und brauchen keine weitere Korrektur.
function fixpunkt(d){
  const f = [], P = K.pruefeRegeln(d), Q = K.pruefeRegeln(P.d);
  if (Q.korrekturen.length) f.push(`zweite Runde korrigiert: ${Q.korrekturen.join(' | ')}`);
  for (const [feld, werte] of Object.entries(P.gesperrt)) if (werte[String(P.d[feld])]) f.push(`${feld}=${P.d[feld]} ist gesperrt`);
  for (const [feld, g] of Object.entries(P.grenzen)) if (g.min <= g.max && !(Number(P.d[feld]) >= g.min && Number(P.d[feld]) <= g.max)) f.push(`${feld}=${P.d[feld]} ausserhalb ${g.min}…${g.max}`);
  return f;
}

// Läuft alle Fälle durch und meldet die ersten Fehler mit dem Fall, in dem sie auftreten.
function pruefeAlle(faelle, extra = () => []){
  const fehler = [], gebaut = {};
  for (const d of faelle) {
    const R = K.computeData(d);
    gebaut[R.form.bw] = (gebaut[R.form.bw] || 0) + 1;
    for (const x of [...fixpunkt(d), ...geometrie(R), ...extra(R, d)]) fehler.push(`${x}\n    Fall: ${JSON.stringify(Object.fromEntries(Object.entries(d).filter(([k, v]) => String(v) !== String(START[d.kind][k]))))}`);
  }
  assert.deepStrictEqual(fehler.slice(0, 5), [], `${fehler.length} Fehler`);
  return gebaut;
}

/* ---------- Reduit ---------- */
const FORMEN = [{ shape:'I' }, { shape:'L', corner:'L' }, { shape:'L', corner:'R' }, { shape:'U' }];
const TUEREN = [{}, { doorIn:true, hinge:'L' }, { doorIn:true, hinge:'R', doorPos:'R', doorOff:'100' }, { doorPos:'L', doorOff:'150' }];
// Raummasse [Breite, Tiefe, Höhe, Türbreite]: Standard, klein (dort gehen auch Leisten), gross, schmal und tief.
const RAEUME = [['1600', '1400', '2400', '800'], ['1100', '1000', '2300', '700'], ['2400', '2600', '2600', '900'], ['900', '1800', '2200', '700']];
// Material: wie die Bauweise vorschlägt, ganze Bretter, Spanplatte mit Nischen (weicht bei Wangen aus).
const MATERIAL = [{}, { mat:'gon_fichte', t:'18' }, { mat:'dekorspan', t:'19', nicheL:true, nicheR:true }];
function* reduitFaelle(){
  for (const b of K.BAUWEISEN.reduit) for (const form of FORMEN) for (const wall of ['solid', 'drywall']) for (const tuer of TUEREN)
    for (const [rw, rd, rh, doorW] of RAEUME) for (const mat of MATERIAL)
      yield { ...START.reduit, bw:b.id, rw, rd, rh, doorW, wall, ...form, ...tuer, ...mat };
}
// Ränder: viele Tablare in einem niedrigen Raum, tiefe und flache Regale, ein und zwei Tablare.
const RAENDER = [{ nShelves:'8', gapBottom:'0', gapTop:'100' }, { nShelves:'8', rh:'1800', gapBottom:'0', gapTop:'100' },
  { dBack:'600', dLeft:'600', dRight:'600' }, { dBack:'150', dLeft:'150', dRight:'150' }, { nShelves:'1' }, { nShelves:'2', gapTop:'800', gapBottom:'600' }];
function* reduitRaender(){
  for (const b of K.BAUWEISEN.reduit) for (const shape of ['I', 'L', 'U']) for (const rand of RAENDER) for (const tuer of [{}, { doorIn:true, hinge:'L', rd:'2000' }])
    for (const mat of [{}, { mat:'gon_fichte', t:'18' }, { mat:'regalbau', t:'16' }, { mat:'osb', t:'15' }])
      yield { ...START.reduit, bw:b.id, shape, ...rand, ...tuer, ...mat };
}

test('Reduit: jede Bauweise über Form, Wand, Tür und Raum – Geometrie, Zahlen, Fixpunkt', () => {
  const gebaut = pruefeAlle(reduitFaelle());
  // Jede Bauweise wird in vielen Fällen auch wirklich gebaut: Leisten nur in kleinen Räumen, Schienen und Winkel
  // nicht auf Gipskarton (die Hälfte der Fälle), sonst weicht die Bauweise aus.
  for (const b of K.BAUWEISEN.reduit) assert.ok(gebaut[b.id] >= (b.id === 'R1' ? 20 : 120), `${b.id}: ${gebaut[b.id]}`);
});

test('Reduit: Ränder – viele Tablare, niedriger Raum, tiefe und flache Regale', () => {
  pruefeAlle(reduitRaender());
});

test('Reduit: Leisten über alle Formen, auch dort, wo die Bauweise gesperrt wäre', () => {
  // Die Bauweise «Leisten» ist in den meisten Räumen gesperrt; die Geometrie muss trotzdem stimmen.
  const fehler = [];
  for (const form of FORMEN) for (const tuer of TUEREN) for (const [rw, rd, rh, doorW] of RAEUME) for (const mat of MATERIAL) {
    const c = K.cfgFromData({ ...START.reduit, bw:undefined, sys:'battens', rw, rd, rh, doorW, ...form, ...tuer, ...mat });
    for (const x of geometrie(computeReduit(c))) fehler.push(`${x} ${JSON.stringify({ rw, rd, ...form, ...tuer, ...mat })}`);
  }
  assert.deepStrictEqual(fehler.slice(0, 5), [], `${fehler.length} Fehler`);
});

/* ---------- Sideboard ---------- */
// Masse [Breite, Höhe, Tiefe]: klein, Standard, breit, gross, hoch und schmal.
const MASSE = [['600', '450', '300'], ['1200', '720', '400'], ['1800', '880', '450'], ['2400', '1400', '650'], ['800', '1200', '350']];
const UNTERBAU = [{ base:'legs', top:'over' }, { base:'plinth', top:'between' }, { base:'none', top:'over' }];
function* sideboardFaelle(){
  for (const b of K.BAUWEISEN.sideboard) for (const [w, h, d] of MASSE) for (const front of ['open', 'hinged', 'sliding'])
    for (const room of ['living', 'bath']) for (const shelves of ['0', '1', '3']) for (const u of UNTERBAU)
      yield { ...START.sideboard, bw:b.id, w, h, d, front, room, shelves, ...u };
}

test('Sideboard: jede Bauweise über Masse, Front, Einsatzort und Unterbau', () => {
  // Beim Sideboard dürfen sich auch die Korpusteile untereinander nicht schneiden.
  const korpus = R => {
    const f = [];
    for (let i = 0; i < R.boxes.length; i++) for (let j = i + 1; j < R.boxes.length; j++)
      if (overlaps(R.boxes[i], R.boxes[j])) f.push(`${name(R.boxes[i])} schneidet ${name(R.boxes[j])}`);
    return f;
  };
  const gebaut = pruefeAlle(sideboardFaelle(), korpus);
  for (const b of K.BAUWEISEN.sideboard) assert.ok(gebaut[b.id] >= 100, `${b.id}: ${gebaut[b.id]}`);
});

/* ---------- Standard und Zufall ---------- */
test('Standardformulare: keine Warnung, auch nicht mit jeder möglichen Bauweise ausser «eingeplant»', () => {
  for (const kind of ['sideboard', 'reduit']) {
    assert.deepStrictEqual(K.computeData(START[kind]).warn, [], kind);
    const c = K.cfgFromData(START[kind]);
    for (const b of K.BAUWEISEN[kind]) {
      if (K.bwSperre(b, c)) continue;
      const R = K.computeData({ ...START[kind], bw:b.id });
      assert.strictEqual(R.form.bw, b.id);
      assert.deepStrictEqual(R.warn.filter(w => !K.HARMLOS.test(w)), [], b.id);
    }
  }
});

// Räume für den Zufall beim Reduit (der Raum bleibt, gewürfelt wird das Regal darin).
const ZUFALLSRAEUME = [{}, { rw:'1100', rd:'1000', rh:'2300', doorW:'700' }, { rw:'2400', rd:'2600', rh:'2600', doorW:'900', doorIn:true, hinge:'R' },
  { rw:'900', rd:'1800', rh:'2200', doorW:'700', wall:'drywall' }, { rw:'1800', rd:'2000', rh:'2500', doorPos:'L', doorOff:'100', doorIn:true, hinge:'L', wall:'drywall' },
  { rw:'1300', rd:'1500', rh:'2000', doorPos:'R', doorOff:'150' }];

for (const [kind, n] of [['reduit', 480], ['sideboard', 240]]) test(`Zufall ${kind}: ${n} Würfe ohne Warnung ausser HARMLOS, Geometrie stimmt`, () => {
  const rnd = seeded(2026 + n), fehler = [];
  for (let i = 0; i < n; i++) {
    const base = kind === 'reduit' ? { ...START.reduit, ...ZUFALLSRAEUME[i % ZUFALLSRAEUME.length] } : START.sideboard;
    const d = K.zufall(base, rnd), R = K.computeData(d);
    const warn = R.warn.filter(w => !K.HARMLOS.test(w));
    for (const x of [...warn, ...R.korrekturen, ...fixpunkt(d), ...geometrie(R)]) fehler.push(`${x}\n    Wurf ${i}: ${JSON.stringify(d)}`);
  }
  assert.deepStrictEqual(fehler.slice(0, 3), [], `${fehler.length} Fehler`);
});

/* ---------- Gegenproben: Die Prüfungen erkennen Fehler ---------- */
test('Gegenprobe: Überschneidung und fehlende Auflage werden erkannt', () => {
  // Tablarwinkel ohne Regeln: bei 8 Tablaren in 1800 mm steckt der Wandschenkel im Tablar darunter.
  const R = computeReduit({ ...REDUIT_DEFAULTS, mat:'birke', t:18, sys:'brackets', shape:'I', nShelves:8, rh:1800, gapBottom:310, gapTop:100, dBack:375,
    sheetL:3000, sheetB:1500, kerf:4, grain:true, price:88 });
  assert.ok(geometrie(R).some(x => x.includes('schneidet metal')));
  // Ein Tablar ohne seine Endleisten liegt nur noch auf der Wandleiste.
  const L = computeReduit({ ...REDUIT_DEFAULTS, mat:'birke', t:18, sys:'battens', shape:'I', rw:700, rd:900, doorW:600, sheetL:3000, sheetB:1500, kerf:4, grain:true, price:88 });
  const ohne = { ...L, boxes:L.boxes.filter(b => !b.key.includes('Endleiste')) };
  assert.ok(geometrie(L).length === 0 && geometrie(ohne).some(x => x.includes('1 Auflage')));
});
