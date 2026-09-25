const test = require('node:test');
const assert = require('node:assert');
Object.assign(globalThis, require('../shared.js'));
const R = require('../reduit.js');

const cfg = over => R.normReduit({ ...R.REDUIT_DEFAULTS, ...over });
const lay = over => R.layoutReduit(cfg(over).cfg);
const seg = (l, id) => l.segs.find(s => s.id === id);

test('Segmente je Form', () => {
  assert.deepStrictEqual(lay({ shape:'I' }).segs.map(s => s.id), ['back']);
  assert.deepStrictEqual(lay({ shape:'L', corner:'L' }).segs.map(s => s.id), ['back', 'left']);
  assert.deepStrictEqual(lay({ shape:'L', corner:'R' }).segs.map(s => s.id), ['back', 'right']);
  assert.deepStrictEqual(lay({ shape:'U' }).segs.map(s => s.id), ['back', 'left', 'right']);
});

test('hinteres Segment über volle Breite, Seiten stossen davor an', () => {
  const l = lay({ shape:'U', rw:1600, rd:1400, dBack:400 });
  assert.deepStrictEqual([seg(l, 'back').u0, seg(l, 'back').u1], [0, 1600]);
  assert.deepStrictEqual(seg(l, 'back').ends, ['wall', 'wall']);
  assert.deepStrictEqual([seg(l, 'left').u0, seg(l, 'left').u1], [400, 1400]);
  assert.deepStrictEqual(seg(l, 'left').ends, ['corner', 'wall']);
});

test('Tür nach innen verkürzt das Seitenregal auf der Bandseite', () => {
  const l = lay({ shape:'U', rd:1400, doorW:800, doorIn:true, hinge:'L' });
  assert.strictEqual(seg(l, 'left').u1, 600);
  assert.strictEqual(seg(l, 'left').ends[1], 'free');
  assert.strictEqual(seg(l, 'right').u1, 1400);
});

test('Seitentiefe grösser als Wandstück neben der Tür gibt Warnung', () => {
  const l = lay({ shape:'L', corner:'L', rw:1200, doorW:800, dLeft:300 });
  assert.ok(l.warn.some(w => w.includes('Türöffnung')));
  assert.ok(!lay({ shape:'L', corner:'L', rw:1600, doorW:800, dLeft:300 }).warn.some(w => w.includes('Türöffnung')));
});

test('Durchgang unter 600 mm gibt Warnung', () => {
  assert.ok(lay({ shape:'U', rw:1400, dLeft:450, dRight:450 }).warn.some(w => w.includes('Durchgang')));
  assert.ok(!lay({ shape:'U', rw:1600, dLeft:300, dRight:300 }).warn.some(w => w.includes('Durchgang')));
});

test('Nische am vorderen Ende des Seitenregals', () => {
  const s = seg(lay({ shape:'U', nicheL:true, nicheLW:450, nicheLH:1300 }), 'left');
  assert.deepStrictEqual(s.niche, { at:'end', w:450, h:1300 });
});

test('Tablarhöhen gleichmässig zwischen Boden- und Deckenabstand', () => {
  assert.deepStrictEqual(R.shelfLevels(3, 100, 400, 2400), [100, 1050, 2000]);
});

test('toWorld: Wandkoordinaten in Raumkoordinaten', () => {
  const W = 1600, D = 1400;
  assert.deepStrictEqual(R.toWorld({ id:'back' }, W, D, 0, 5, 0), [-800, 5, -700]);
  assert.deepStrictEqual(R.toWorld({ id:'left' }, W, D, 400, 5, 100), [-700, 5, -300]);
  assert.deepStrictEqual(R.toWorld({ id:'right' }, W, D, 400, 5, 100), [700, 5, -300]);
});

test('boxOf dreht Masse und Explosion für Seitensegmente', () => {
  const b = R.boxOf({ id:'left' }, 1600, 1400, { u0:400, u1:1400, y0:0, y1:18, v0:0, v1:300 }, 'y', 'u', {}, [0, 0, 200]);
  assert.deepStrictEqual(b.size, [300, 18, 1000]);
  assert.deepStrictEqual(b.pos, [-650, 9, 200]);
  assert.strictEqual(b.grain, 'z');
  assert.deepStrictEqual(b.ex, [200, 0, 0]);
});

test('Randfall: U mit zu tiefen Seiten wird begrenzt', () => {
  const n = cfg({ shape:'U', rw:800, dLeft:600, dRight:600 });
  assert.ok(n.cfg.dLeft + n.cfg.dRight <= 800 - 300);
  assert.ok(n.warn.some(w => w.includes('begrenzt')));
});

test('Randfall: Nische breiter als Segment wird begrenzt', () => {
  const s = seg(lay({ shape:'U', rd:1000, dBack:400, nicheL:true, nicheLW:1000 }), 'left');
  assert.ok(s.niche.w <= (s.u1 - s.u0) - 200);
});

test('Randfall: ein einziges Tablar', () => {
  assert.deepStrictEqual(R.shelfLevels(1, 150, 300, 2400), [150]);
});

test('Randfall: Tür breiter als Seitenregal lang – Segment entfällt', () => {
  const l = lay({ shape:'U', rd:1000, dBack:400, doorW:800, doorIn:true, hinge:'R' });
  assert.deepStrictEqual(l.segs.map(s => s.id), ['back', 'left']);
  assert.ok(l.warn.some(w => w.includes('entfällt')));
});

/* ---------- Bauarten ---------- */
const base = { mat:'birke', t:18, back:'hdf3', joint:'pocket', room:'living', sheetL:2500, sheetB:1250, kerf:4, grain:true, price:55 };
const run = over => R.computeReduit({ ...R.REDUIT_DEFAULTS, ...base, ...over });
const qtyOf = (Rr, text) => Rr.hw.filter(h => h[1].startsWith(text)).reduce((a, h) => a + h[0], 0);
const rowsNamed = (Rr, name) => Rr.rows.filter(r => r.name === name);

test('Spannweiten-Tabelle', () => {
  assert.strictEqual(R.maxSpan('birke', 18), 800);
  assert.strictEqual(R.maxSpan('mdf', 19), 550);
  assert.strictEqual(R.maxSpan('unbekannt', 18), 700);
});

test('Schienen: Anzahl aus Spannweite (1600 mm, 50 mm eingerückt, max 800 → 3 Schienen à 750 mm)', () => {
  const Rr = run({ shape:'I', rw:1600, rh:2000, sys:'rails' });
  assert.strictEqual(qtyOf(Rr, 'Wandschiene'), 3);
  assert.strictEqual(qtyOf(Rr, 'Konsole'), 3 * 5);
  assert.ok(Rr.warn.some(w => w.includes('Spannweite')));
});

test('Leisten: frei gespannte Vorderkante ≥ max gibt Warnung', () => {
  assert.ok(run({ shape:'I', rw:1600, sys:'battens' }).warn.some(w => w.includes('biegen')));
  assert.ok(!run({ shape:'I', rw:700, rd:900, doorW:600, sys:'battens' }).warn.some(w => w.includes('biegen')));
});

test('Wangen: Nischenkante ist eine Wangenposition', () => {
  const s = { id:'left', depth:300, u0:400, u1:1400, ends:['corner', 'wall'], niche:{ at:'end', w:450, h:1300 } };
  const pos = R.cheekPositions(s, 18, 800);
  assert.ok(pos.some(p => Math.abs(p + 9 - (1400 - 450)) < 1), JSON.stringify(pos));
  assert.strictEqual(pos[0], 400);
});

test('Selbststehend: Modul-Aufteilung', () => {
  assert.deepStrictEqual(R.moduleSplit(1580, 800, 18).m, 2);
  const mdf = R.moduleSplit(1580, 550, 19);
  assert.strictEqual(mdf.m, 3);
  assert.ok(mdf.w - 2 * 19 < 550);
});

test('Stütze am freien Ende (Tür nach innen)', () => {
  const Rr = run({ shape:'U', doorIn:true, hinge:'L', sys:'rails' });
  assert.ok(Rr.rows.some(r => r.kind === 'solid' && r.note.includes('freien Ende')));
});

test('Gipskarton: Hohlraumdübel und Warnung', () => {
  const Rr = run({ wall:'drywall', sys:'battens' });
  assert.ok(qtyOf(Rr, 'Hohlraumdübel') > 0);
  assert.ok(Rr.warn.some(w => w.includes('Gipskarton')));
});

test('Kosten: Holz und Kaufteile getrennt', () => {
  const Rr = run({ sys:'posts' });
  assert.ok(Rr.solidCost > 0);
  assert.ok(Rr.buyCost > 0);
  assert.strictEqual(Rr.kind, 'reduit');
});

test('alle Kombinationen liefern gültige Teile', () => {
  for (const shape of ['I', 'L', 'U']) for (const build of ['built', 'free'])
    for (const sys of ['battens', 'rails', 'brackets', 'cheeks', 'posts'])
      for (const extra of [{}, { nicheL:true, nicheR:true }, { doorIn:true, hinge:'R' }, { mat:'mdf', t:19, back:'none' },
                           { mat:'gon_fichte', t:18 }, { mat:'regalbau', t:16, nicheL:true }, { mat:'mood_fichte', t:18, doorIn:true, hinge:'L' }, { mat:'schaltafel', t:27 }]) {
        const Rr = run({ shape, build, sys, ...extra });
        const tag = JSON.stringify({ shape, build, sys, extra });
        assert.ok(Rr.rows.length > 0, tag);
        for (const r of Rr.rows) assert.ok(r.L > 0 && r.B > 0 && Number.isFinite(r.L) && Number.isFinite(r.B), tag + ' ' + JSON.stringify(r));
        for (const b of Rr.boxes) assert.ok(b.size.every(v => v > 0 && Number.isFinite(v)) && b.pos.every(Number.isFinite), tag + ' box ' + JSON.stringify(b));
        for (const h of Rr.hw) assert.ok(h[0] > 0 && Number.isFinite(h[0]), tag + ' hw ' + h[1]);
        assert.ok(Number.isFinite(Rr.buyCost) && Number.isFinite(Rr.solidCost), tag);
      }
});

test('Randfall: sehr kleiner Raum selbststehend', () => {
  const Rr = run({ rw:600, rd:600, shape:'U', build:'free' });
  assert.ok(rowsNamed(Rr, 'Seite').length > 0);
  assert.ok(Rr.rows.every(r => Number.isFinite(r.L)));
});

test('Randfall: Tür breiter als Raum erlaubt wird mit Warnung verkleinert', () => {
  const n = cfg({ rw:650, doorW:800 });
  assert.strictEqual(n.cfg.doorW, 550);
  assert.ok(n.warn.some(w => w.includes('Türbreite')));
  const ok = cfg({ rw:1600, doorW:800 });
  assert.strictEqual(ok.cfg.doorW, 800);
  assert.ok(!ok.warn.some(w => w.includes('Türbreite')));
});

test('Schienen länger als 200 cm werden aus zwei Stücken zusammengesetzt', () => {
  const Rr = run({ shape:'I', rw:1600, rh:2400, sys:'rails' });
  assert.strictEqual(qtyOf(Rr, 'Wandschiene Element System, 200'), 3);
  assert.strictEqual(qtyOf(Rr, 'Wandschiene Element System, 100'), 3);
  assert.ok(Rr.warn.some(w => w.includes('zwei Stücke')));
});

test('jede Material-Stärke hat einen Spannweiten-Wert', () => {
  for (const [k, M] of Object.entries(MATS)) for (const t of M.t) assert.ok(R.SPAN[k] && R.SPAN[k][t], `${k} ${t} mm fehlt in SPAN`);
});

test('beschichtete Platten werden nicht geölt', () => {
  for (const mat of ['schaltafel', 'dekorspan']) {
    const Rr = run({ mat, t: MATS[mat].tDef });
    assert.ok(!Rr.finish.some(f => f[1].includes('Hartwachsöl')), mat);
  }
});

test('zusammengefasste Warnungen nennen jede Wand nur einmal', () => {
  const w = run({ shape:'U', rh:2400, sys:'rails' }).warn.find(x => x.includes('zwei Stücke'));
  assert.ok(w && !w.includes('hinten, hinten'), w);
});

/* ---------- Ganze Bretter ---------- */
const boardRun = over => run({ mat:'gon_fichte', t:18, ...over });

test('Schaltafel: Tiefe rastet auf 500 mm (Tafelbreite) ein', () => {
  const n = cfg({ mat:'schaltafel', dBack:550 });
  assert.strictEqual(n.cfg.dBack, 500);
  assert.ok(n.warn.some(w => w.includes('Brettbreite')), JSON.stringify(n.warn));
});

test('Brett-Material: Tiefen rasten auf Brettbreiten ein, mit einem Hinweis', () => {
  const n = cfg({ mat:'gon_fichte', shape:'U', dBack:350, dLeft:250, dRight:400 });
  assert.deepStrictEqual([n.cfg.dBack, n.cfg.dLeft, n.cfg.dRight], [400, 400, 400]);
  const hint = n.warn.filter(w => w.includes('Brettbreite'));
  assert.strictEqual(hint.length, 1);
  assert.ok(hint[0].includes('hinten') && hint[0].includes('links') && !hint[0].includes('rechts'), hint[0]);
});

test('Brett-Material: Begrenzung rundet auf eine kleinere Brettbreite ab', () => {
  // rw 900 → Seiten zusammen max 600 → je 300 → go/on abgerundet auf 200
  const n = cfg({ mat:'gon_fichte', shape:'U', rw:900, doorW:600, dLeft:400, dRight:400 });
  assert.deepStrictEqual([n.cfg.dLeft, n.cfg.dRight], [200, 200]);
});

test('Brett-Material: keine Breite passt in die Begrenzung → begrenzte Tiefe bleibt, Teile gemeldet', () => {
  const n = cfg({ mat:'gon_3s', shape:'U', rw:1000, doorW:700, dLeft:600, dRight:600 });
  assert.ok(n.cfg.dLeft + n.cfg.dRight <= 1000 - 300, JSON.stringify(n.cfg));
  const Rr = run({ mat:'gon_3s', t:19, shape:'U', rw:1000, doorW:700, dLeft:600, dRight:600 });
  assert.ok(Rr.rows.length > 0);
  assert.ok(Rr.warn.some(w => w.includes('passt auf kein Brett')), JSON.stringify(Rr.warn));
});

test('Plattenmaterial: Tiefen bleiben frei', () => {
  assert.strictEqual(cfg({ mat:'birke', dBack:350 }).cfg.dBack, 350);
});

test('Brett-Material: Teilbreite = Brettbreite, Bretter statt Platten, Kosten = Stückpreise', () => {
  const Rr = boardRun({ shape:'I', rw:1600, dBack:400, sys:'rails' });
  const shelves = rowsNamed(Rr, 'Tablar');
  assert.ok(shelves.length && shelves.every(r => r.B === 400), JSON.stringify(shelves));
  const g = Rr.groups[0];
  assert.strictEqual(g.boards, true);
  assert.ok(g.sheets.length > 0 && g.sheets.every(s => s.B === 400 && [1200, 2000].includes(s.L)));
  const { whole } = sheetCosts(Rr.groups);
  assert.strictEqual(Math.round(whole * 100), Math.round(g.sheets.reduce((a, s) => a + s.price, 0) * 100));
  const lines = Rr.hw.filter(h => h[1].startsWith('go/on Leimholz Fichte'));
  assert.strictEqual(lines.reduce((a, h) => a + h[0], 0), g.sheets.length);
  // Bretter zählen nicht als Kaufteile
  const buyWithout = Rr.hw.filter(h => !h[1].startsWith('go/on')).reduce((a, h) => a + (h[3] ? h[0] * h[3] : 0), 0);
  assert.strictEqual(Math.round(Rr.buyCost * 100), Math.round(buyWithout * 100));
});

test('Brett-Material: Leisten werden Dachlatten, keine 40er-Teile aus dem Brett', () => {
  const Rr = boardRun({ shape:'U', sys:'battens' });
  assert.ok(!Rr.rows.some(r => r.kind === 'korpus' && r.B === 40), JSON.stringify(Rr.rows.filter(r => r.B === 40)));
  const strips = Rr.rows.filter(r => r.name === 'Leiste' || r.name === 'Eckleiste');
  assert.ok(strips.length && strips.every(r => r.kind === 'solid' && r.B === 48 && r.t === 24));
});

test('Brett-Material: zu lange Wangen → Warnung mit Alternativen, keine NaN', () => {
  const Rr = run({ mat:'regalbau', t:16, shape:'I', rw:1600, rh:2400, sys:'cheeks' });
  const w = Rr.warn.find(x => x.includes('länger als das längste Brett'));
  assert.ok(w && w.includes('Mood Leimholz Fichte A'), JSON.stringify(Rr.warn));
  const { whole } = sheetCosts(Rr.groups);
  assert.ok(Number.isFinite(whole) && Number.isFinite(Rr.buyCost));
});

test('Brett-Material: Bauablauf spricht vom Ablängen, nicht vom Zuschnitt', () => {
  const Rr = boardRun({});
  assert.ok(Rr.steps.some(s => s[1].includes('ablängen')));
  assert.ok(!Rr.steps.some(s => s[1].includes('im Baumarkt zuschneiden')));
});

/* ---------- Stösse ---------- */
test('shelfJoints: kurz genug → kein Stoss', () => {
  assert.deepStrictEqual(R.shelfJoints(0, 1900, 2000, []), { cuts:[], added:[] });
});

test('shelfJoints: ohne Stütze in der Mitte, mit Stützen neben der nächstgelegenen', () => {
  assert.deepStrictEqual(R.shelfJoints(0, 2400, 2000, []), { cuts:[1200], added:[1200] });
  assert.deepStrictEqual(R.shelfJoints(0, 2400, 2000, [845, 1645]), { cuts:[845], added:[] });
  const j = R.shelfJoints(0, 3000, 1150, [545, 1045, 1545, 2045, 2545]);
  const edges = [0, ...j.cuts, 3000];
  assert.strictEqual(j.cuts.length, 2);
  assert.ok(edges.slice(1).every((u, i) => u - edges[i] <= 1150), JSON.stringify(j));
});

const pieceLens = Rr => rowsNamed(Rr, 'Tablar').map(r => r.L);

test('Stoss über Schiene: 2400 Wand mit go/on → Stücke ≤ 2000, eine Stossleiste pro Höhe', () => {
  const Rr = run({ mat:'gon_fichte', t:18, shape:'I', rw:2400, rd:1400, doorW:800, sys:'rails', nShelves:5 });
  assert.ok(pieceLens(Rr).every(L => L <= 2000), JSON.stringify(pieceLens(Rr)));
  assert.strictEqual(Rr.rows.filter(r => r.name === 'Stossleiste').reduce((a, r) => a + r.qty, 0), 5);
  assert.ok(!Rr.warn.some(w => w.includes('länger als das längste Brett')), JSON.stringify(Rr.warn));
});

test('Stoss mit Regalbauplatte (1150): 3 Stücke pro Tablar', () => {
  const Rr = run({ mat:'regalbau', t:16, shape:'I', rw:2400, rd:1400, doorW:800, sys:'rails', nShelves:4 });
  assert.ok(pieceLens(Rr).every(L => L <= 1150));
  assert.strictEqual(Rr.rows.filter(r => r.name === 'Stossleiste').reduce((a, r) => a + r.qty, 0), 8);
});

test('Stoss bei Leisten: Pfosten an jeder Stossstelle', () => {
  const Rr = run({ mat:'gon_fichte', t:18, shape:'I', rw:2400, rd:1400, doorW:800, sys:'battens' });
  assert.ok(Rr.rows.some(r => r.kind === 'solid' && r.note.includes('Tablarstoss')));
  assert.ok(pieceLens(Rr).every(L => L <= 2000));
});

test('Stoss bei Tablarwinkeln und Pfostenrahmen: Stücke ≤ Lmax', () => {
  for (const sys of ['brackets', 'posts']) {
    const Rr = run({ mat:'gon_fichte', t:18, shape:'I', rw:2400, rd:1400, doorW:800, sys });
    assert.ok(pieceLens(Rr).every(L => L <= 2000), sys + ' ' + JSON.stringify(pieceLens(Rr)));
    assert.ok(Rr.rows.some(r => r.name === 'Stossleiste'), sys);
  }
});

test('Stoss mit Nische: oben und unten korrekt gestossen', () => {
  const Rr = run({ mat:'regalbau', t:16, shape:'U', rw:1800, rd:2600, doorW:800, dLeft:300, nicheL:true, nicheLW:500, nicheLH:1300, sys:'rails' });
  assert.ok(pieceLens(Rr).every(L => L <= 1150), JSON.stringify(pieceLens(Rr)));
  assert.ok(!Rr.warn.some(w => w.includes('länger als das längste Brett')), JSON.stringify(Rr.warn));
});

test('Stoss und freies Ende (Tür nach innen): Stütze am freien Ende bleibt', () => {
  const Rr = run({ mat:'regalbau', t:16, shape:'U', rw:1800, rd:2600, doorW:800, doorIn:true, hinge:'L', sys:'rails' });
  assert.ok(Rr.rows.some(r => r.kind === 'solid' && r.note.includes('freien Ende')));
  assert.ok(pieceLens(Rr).every(L => L <= 1150));
});

test('Plattenmaterial: keine Stösse', () => {
  const Rr = run({ shape:'I', rw:2400, rd:1400, doorW:800, sys:'rails' });
  assert.ok(!Rr.rows.some(r => r.name === 'Stossleiste'));
});

test('Bauablauf: Schritt «Stösse verbinden» nur mit Stössen', () => {
  assert.ok(run({ mat:'gon_fichte', t:18, shape:'I', rw:2400, rd:1400, doorW:800, sys:'rails' }).steps.some(s => s[0] === 'Stösse verbinden'));
  assert.ok(!run({ mat:'gon_fichte', t:18, shape:'I', rw:1600, sys:'rails' }).steps.some(s => s[0] === 'Stösse verbinden'));
});

/* ---------- Review-Befunde ---------- */
const overlaps = (a, b) => [0, 1, 2].every(i => Math.abs(a.pos[i] - b.pos[i]) * 2 < a.size[i] + b.size[i] - 0.001);

test('Pfostenrahmen: Stossleiste stösst nicht an den Pfosten', () => {
  for (const mat of ['schaltafel', 'gon_fichte', 'regalbau']) {
    const Rr = run({ mat, t: MATS[mat].tDef, shape:'I', rw:2400, rd:1400, doorW:800, sys:'posts' });
    const joints = Rr.boxes.filter(b => b.key.startsWith('Stossleiste|')), posts = Rr.boxes.filter(b => b.key.startsWith('Kantholz'));
    assert.ok(joints.length && posts.length, mat);
    assert.ok(!joints.some(j => posts.some(p => overlaps(j, p))), mat);
  }
});

test('Tiefenhinweis nennt nur Seiten, die wirklich auf einer Brettbreite liegen', () => {
  const n = cfg({ mat:'gon_3s', shape:'U', rw:1000, doorW:700, dLeft:600, dRight:600 });
  const hint = n.warn.find(w => w.includes('Brettbreite'));
  assert.ok(!hint || !/links 350|rechts 350/.test(hint), hint);
});
