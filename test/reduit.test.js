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
  const lines = Rr.hw.filter(h => h[1].startsWith('Leimholz Fichte (go/on)'));
  assert.strictEqual(lines.reduce((a, h) => a + h[0], 0), g.sheets.length);
  // Bretter zählen nicht als Kaufteile
  const buyWithout = Rr.hw.filter(h => !h[1].includes('(go/on)')).reduce((a, h) => a + (h[3] ? h[0] * h[3] : 0), 0);
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
  assert.ok(w && w.includes('Leimholz Fichte A (Mood)'), JSON.stringify(Rr.warn));
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

/* ---------- Pfostenrahmen (Schreiner-Review, Variante A) ---------- */
const postBoxes = Rr => Rr.boxes.filter(b => b.key.startsWith('Kantholz'));
const postRun = over => run({ sys:'posts', ...over });
const lo = (b, i) => b.pos[i] - b.size[i] / 2, hi = (b, i) => b.pos[i] + b.size[i] / 2;
// Auflager einer Querlatte: Wand an einem Ende (Winkel auf die Endlatte) oder ein Pfosten, der sie von vorne berührt.
function querlattenAuflager(Rr, q){
  const ax = q.size[0] > q.size[2] ? 0 : 2, px = 2 - ax;
  const walls = ax === 0 ? [-Rr.W / 2, Rr.W / 2] : [-Rr.D / 2, Rr.D / 2];
  let n = walls.filter(w => Math.abs(lo(q, ax) - w) < 6 || Math.abs(hi(q, ax) - w) < 6).length;
  for (const p of postBoxes(Rr)) {
    const touch = Math.abs(lo(p, px) - hi(q, px)) < 1 || Math.abs(hi(p, px) - lo(q, px)) < 1;
    if (touch && hi(p, ax) > lo(q, ax) + 1 && lo(p, ax) < hi(q, ax) - 1 && hi(p, 1) >= hi(q, 1) - 1) n++;
  }
  return n;
}
const postCases = [];
for (const shape of ['I', 'L', 'U']) for (const rd of [1100, 1400, 2600])
  for (const extra of [{}, { corner:'R' }, { doorIn:true, hinge:'L' }, { nicheL:true, nicheR:true }, { mat:'gon_fichte', t:18, rw:2400 }, { mat:'regalbau', t:16 }, { mat:'osb', t:12 }])
    postCases.push({ shape, rd, ...extra });

test('Pfostenrahmen: Pfosten stehen vor den Tablaren, nicht darin', () => {
  for (const o of postCases) {
    const Rr = postRun(o), posts = postBoxes(Rr);
    assert.ok(posts.length || o.shape === 'I', JSON.stringify(o));
    for (const p of posts) for (const b of Rr.boxes) if (b !== p) assert.ok(!overlaps(p, b), JSON.stringify(o) + ' ' + b.key);
  }
});

test('Pfostenrahmen: jede Querlatte hat mindestens zwei Auflager', () => {
  for (const o of [...postCases, { shape:'I', rw:790, rd:900, doorW:600 }, { shape:'U', rd:1100 }]) {
    const Rr = postRun(o);
    for (const q of Rr.boxes.filter(b => b.key.includes('|Querlatte vorne'))) assert.ok(querlattenAuflager(Rr, q) >= 2, JSON.stringify(o) + ' ' + JSON.stringify(q.pos));
  }
});

test('Pfostenrahmen: Eckpfosten an jeder Innenecke, keine Eckleiste', () => {
  for (const [shape, n] of [['I', 0], ['L', 1], ['U', 2]]) for (const rd of [1100, 1400]) {
    const Rr = postRun({ shape, rd });
    assert.strictEqual(Rr.rows.filter(r => r.note.startsWith('Eckpfosten')).reduce((a, r) => a + r.qty, 0), n, shape + rd);
    assert.ok(!Rr.rows.some(r => r.name === 'Eckleiste'), shape);
  }
});

test('Pfostenrahmen: Pfostenzahl richtet sich nach der Querlatte, nicht nach dem Tablarmaterial', () => {
  const count = over => postRun(over).rows.filter(r => r.name.startsWith('Kantholz')).reduce((a, r) => a + r.qty, 0);
  assert.strictEqual(count({}), 2);                 // Standard-U: nur die Eckpfosten
  assert.strictEqual(count({ mat:'osb', t:12 }), 2);
  assert.strictEqual(count({ mat:'dekorspan', t:16 }), 2);
  assert.strictEqual(count({ shape:'L' }), 2);      // Eckpfosten + einer im 1255 mm langen Feld hinten
  assert.ok(postRun({ shape:'L' }).warn.some(w => w.includes('Zwischenpfosten')));
});

test('Pfostenrahmen: Bauablauf – erst Tablare, dann Pfosten, dann verschrauben', () => {
  const names = postRun({}).steps.map(s => s[0]);
  const i = n => names.indexOf(n);
  assert.ok(i('Latten montieren') < i('Tablare einschieben') && i('Tablare einschieben') < i('Pfosten stellen') && i('Pfosten stellen') < i('Tablare verschrauben'), names.join(' → '));
  assert.ok(!names.includes('Tablare auflegen'));
});

test('Pfostenrahmen: Verbindungen stehen auf der Kaufliste', () => {
  const Rr = postRun({});
  assert.strictEqual(qtyOf(Rr, 'Holzschrauben 5 × 60'), 2 * Math.ceil(3 * 5 * 1.1));   // 2 Eckpfosten × 3 Schrauben × 5 Ebenen
  assert.strictEqual(qtyOf(Rr, 'Winkelverbinder'), 3 * 2 * 5);                          // je Querlatte 2 Enden (Wand oder Ecke) × 5 Ebenen
  assert.ok(qtyOf(Rr, 'Holzschrauben 4 × 40') > 0);
  assert.strictEqual(qtyOf(Rr, 'Holzschrauben 5 × 70'), 0);
});

test('Pfostenrahmen: Durchgang wird zwischen den Pfosten gemessen', () => {
  const o = { shape:'U', rw:1300, doorW:800, dLeft:320, dRight:320 };
  assert.ok(postRun(o).warn.some(w => w.includes('Durchgang') && w.includes('Pfosten')));
  assert.ok(!run({ ...o, sys:'battens' }).warn.some(w => w.includes('Durchgang')));
});

test('Stützen an freien Enden und Stössen stehen vor dem Tablar', () => {
  for (const sys of ['battens', 'rails', 'brackets'])
    for (const o of [{ shape:'U', doorIn:true, hinge:'L' }, { mat:'gon_fichte', t:18, shape:'I', rw:2400 }, { mat:'regalbau', t:16, shape:'U', nicheL:true }]) {
      const Rr = run({ sys, ...o });
      for (const p of postBoxes(Rr)) for (const b of Rr.boxes) if (b !== p) assert.ok(!overlaps(p, b), sys + JSON.stringify(o) + ' ' + b.key);
    }
});

/* ---------- Schrauben und Dübel nach Stärke (Schreiner-Review K04) ---------- */
const screwLens = Rr => Rr.hw.filter(h => /^Holzschrauben [\d,]+ × \d+ mm$/.test(h[1])).map(h => ({ n:h[0], L:Number(h[1].match(/× (\d+)/)[1]), note:h[2] }));

test('Schrauben durch Konsolen und Winkel kommen nicht oben aus dem Tablar', () => {
  for (const sys of ['rails', 'brackets']) for (const [mat, t] of [['birke', 12], ['fichtesp', 15], ['birke', 18], ['mdf', 19], ['birke', 21], ['fichte', 27]]) {
    const Rr = run({ sys, mat, t, shape:'I' });
    const s = screwLens(Rr).filter(x => x.note.includes('Konsolen') || x.note.includes('Winkel'));
    assert.ok(s.length, sys + t);
    for (const x of s) assert.ok(x.L <= 2 + t - 3, `${sys} ${mat} ${t}: ${x.L} mm`);
  }
});

test('Leisten: die Tablare werden von oben verschraubt, die Schrauben stehen auf der Liste', () => {
  const Rr = run({ sys:'battens', shape:'I' });
  const s = screwLens(Rr).find(x => x.note.includes('von oben'));
  assert.ok(s && s.L === 40 && s.n > 0, JSON.stringify(screwLens(Rr)));
  assert.ok(Rr.steps.some(st => st[0] === 'Tablare auflegen' && st[1].includes('von oben') && st[1].includes('4 × 40')));
});

test('Eckleiste aus dem Plattenmaterial: die Schraube bricht nicht durch', () => {
  for (const t of [12, 18, 21]) {
    const Rr = run({ sys:'battens', shape:'U', mat:'birke', t });
    const s = screwLens(Rr).find(x => x.note.includes('Eckleisten'));
    assert.ok(s && s.L <= 2 * t - 3, `${t}: ${JSON.stringify(s)}`);
  }
});

test('Dübelschraube nach Anbauteil: 4,5 × 50 für Metall, 5 × 60 für Latten 24', () => {
  const posts = run({ sys:'posts' }), rails = run({ sys:'rails' });
  assert.ok(qtyOf(posts, 'Spreizdübel 6 mm + Schraube 5 × 60') > 0);
  assert.strictEqual(qtyOf(posts, 'Spreizdübel 6 mm + Schraube 4,5 × 50'), 0);
  assert.ok(qtyOf(rails, 'Spreizdübel 6 mm + Schraube 4,5 × 50') > 0);
  assert.strictEqual(qtyOf(rails, 'Spreizdübel 6 mm + Schraube 5 × 60'), 0);
  assert.ok(qtyOf(run({ sys:'battens', mat:'fichte', t:27 }), 'Spreizdübel 6 mm + Schraube 5 × 70') > 0);
  assert.ok(qtyOf(run({ sys:'posts', wall:'drywall' }), 'Hohlraumdübel') > 0);
});

/* ---------- Geometrie (Schreiner-Review, Schritt 4) ---------- */
test('Wandschienen: Tablar beginnt 2 mm vor der Schiene, die Ecke schliesst', () => {
  const Rr = run({ sys:'rails', shape:'U', dBack:400, dLeft:300 });
  const back = rowsNamed(Rr, 'Tablar').find(r => r.L === 1594), side = rowsNamed(Rr, 'Tablar').find(r => r.L !== 1594);
  assert.strictEqual(back.B, 400 - R.RAIL_V0);
  assert.strictEqual(side.B, 300 - R.RAIL_V0);
  const rails = Rr.extras.filter(e => e.type === 'metal' && e.size[1] > 500);
  for (const s of Rr.boxes.filter(b => b.key.startsWith('Tablar'))) for (const r of rails) assert.ok(!overlaps(s, r), 'Tablar steckt in der Schiene');
  for (const s of Rr.boxes) for (const t of Rr.boxes) if (s !== t && s.key.startsWith('Tablar') && t.key.startsWith('Tablar')) assert.ok(!overlaps(s, t));
});

test('Wandschienen mit ganzen Brettern: Seitenregal beginnt vor dem vorstehenden Brett', () => {
  const Rr = run({ sys:'rails', shape:'U', mat:'gon_fichte', t:18, dBack:400, dLeft:400, dRight:400, rw:2000 });
  const shelves = Rr.boxes.filter(b => b.key.startsWith('Tablar'));
  for (const a of shelves) for (const b of shelves) if (a !== b) assert.ok(!overlaps(a, b));
});

test('Tablarwinkel: Wandschenkel als Daten, reicht nicht in den Boden', () => {
  const Rr = run({ sys:'brackets', shape:'I', dBack:300, gapBottom:260 });
  assert.ok(Rr.extras.filter(e => e.type === 'metal').every(e => e.pos[1] - e.size[1] / 2 >= 0));
  assert.ok(!Rr.warn.some(w => w.includes('in den Boden')));
  assert.ok(run({ sys:'brackets', shape:'I', dBack:300, gapBottom:150 }).warn.some(w => w.includes('in den Boden')));
});

test('Wangen: Höhe bis 50 mm über das oberste Tablar statt raumhoch', () => {
  const Rr = run({ sys:'cheeks', shape:'I', rh:2400, gapTop:300, nShelves:5 });
  const top = Math.max(...R.shelfLevels(5, 150, 300, 2400));
  assert.ok(rowsNamed(Rr, 'Wange').every(r => r.L === top + 18 + 50), JSON.stringify(rowsNamed(Rr, 'Wange').map(r => r.L)));
});

test('Leisten: Eckstütze vor jeder Innenecke, Warnung misst das freie Feld', () => {
  for (const [shape, n] of [['I', 0], ['L', 1], ['U', 2]]) {
    const Rr = run({ sys:'battens', shape });
    assert.strictEqual(Rr.rows.filter(r => r.note.startsWith('Eckstütze')).reduce((a, r) => a + r.qty, 0), n, shape);
    for (const p of postBoxes(Rr)) for (const b of Rr.boxes) if (b !== p) assert.ok(!overlaps(p, b), shape + b.key);
  }
  const U = run({ sys:'battens', shape:'U' });
  const w = U.warn.find(x => x.includes('vorne frei'));
  assert.ok(w && w.includes('hinten (955 mm)') && !w.includes('1594'), w);
  assert.ok(U.steps.some(s => s[0] === 'Eckstützen stellen'));
  // Stoss mit Stütze: das freie Feld ist rund die halbe Wand, nicht die ganze Tablarlänge
  const J = run({ sys:'battens', mat:'gon_fichte', t:18, shape:'I', rw:2400, rd:1400, doorW:800 }).warn.find(x => x.includes('vorne frei'));
  assert.ok(J && !J.includes('2394'), J);
});

/* ---------- Eckfach bei Wangen und Modulen (350 mm) ---------- */
// Offene Breite des hintersten Fachbodens, der im linken Eckquadrat beginnt; Infinity = Ecke leer.
function eckOffen(Rr, dL, dB){
  const xc = -Rr.W / 2 + dL, zc = -Rr.D / 2 + dB;
  let min = Infinity;
  for (const b of Rr.boxes) if (/^(Tablar|Einlegeboden|Boden|Deckel)\|/.test(b.key) && lo(b, 0) < xc - 1 && hi(b, 2) <= zc + 1) min = Math.min(min, hi(b, 0) - xc);
  return min;
}

test('Eckfach: mindestens 350 mm offen oder leer (Wangen und Module, L und U)', () => {
  for (const build of ['built', 'free']) for (const shape of ['L', 'U'])
    for (const [mat, t] of [['birke', 18], ['mdf', 19], ['dekorspan', 19], ['gon_fichte', 18], ['osb', 18]]) for (const side of [200, 300, 400, 450, 500]) {
      const Rr = run({ build, sys:'cheeks', shape, corner:'L', mat, t, dLeft:side, dRight:side, dBack:Math.min(600, side + 100) });
      const dL = Rr.boxes.length && R.normReduit({ ...R.REDUIT_DEFAULTS, ...base, mat, t, shape, dLeft:side, dBack:Math.min(600, side + 100) }).cfg;
      const offen = eckOffen(Rr, dL.dLeft, dL.dBack);
      assert.ok(offen >= 345, `${build} ${shape} ${mat} Seite ${side}: ${offen}`);
      for (const a of Rr.boxes) for (const b of Rr.boxes) if (a !== b && a.key.startsWith('Wange') && !b.key.startsWith('Wange')) assert.ok(!overlaps(a, b), b.key);
    }
});

test('Eckfach: Standard-U mit Wangen wird genutzt und zuerst bestückt', () => {
  const Rr = run({ sys:'cheeks', shape:'U', dLeft:300, dRight:300 });
  assert.ok(Math.abs(eckOffen(Rr, 300, 400) - 490) < 5);
  assert.ok(Rr.steps.some(s => s[0] === 'Eckfach zuerst einrichten'));
  assert.strictEqual(qtyOf(Rr, 'Holzschrauben 4 × 40'), 6);   // 3 je Ecke
  assert.ok(!Rr.warn.some(w => w.includes('Eckfach')));
});

test('Eckfach: MDF 19 lässt das Eckquadrat leer und sagt es', () => {
  const Rr = run({ sys:'cheeks', shape:'U', mat:'mdf', t:19, dLeft:300, dRight:300 });
  assert.strictEqual(eckOffen(Rr, 300, 400), Infinity);
  assert.ok(Rr.warn.some(w => w.includes('leeres Eckquadrat eingeplant')));
  assert.ok(Rr.steps.some(s => s[0] === 'Ecke schliessen'));
  const M = run({ build:'free', shape:'U', mat:'mdf', t:19, dLeft:300, dRight:300 });
  assert.strictEqual(eckOffen(M, 300, 400), Infinity);
  assert.ok(M.steps.some(s => s[0] === 'Ecke leer lassen'));
});

test('Selbststehend: Seiten, Böden und Rückwand überschneiden sich nicht', () => {
  for (const shape of ['I', 'L', 'U']) for (const [mat, t, back] of [['birke', 18, 'hdf3'], ['mdf', 19, 'ply6'], ['birke', 18, 'none']]) {
    const Rr = run({ build:'free', shape, mat, t, back });
    for (let i = 0; i < Rr.boxes.length; i++) for (let j = i + 1; j < Rr.boxes.length; j++)
      assert.ok(!overlaps(Rr.boxes[i], Rr.boxes[j]), `${shape} ${mat} ${Rr.boxes[i].key} × ${Rr.boxes[j].key}`);
  }
});
