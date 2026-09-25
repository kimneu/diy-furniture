# Feste Formate (ganze Bretter) im Reduit – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Das Reduit rechnet auch mit ganzen Brettern in festen Formaten (go/on, Mood, Regalbauplatte, Schaltafel …). Es wählt die günstigsten Formate, stösst lange Tablare über einer Stütze und gibt Stückzahlen und Stückpreise aus.

**Architecture:** Formate und Stückpreise liegen in `preise.js` → `bretter`. `shared.js` setzt daraus Brett-Materialien (`boards:true`) zusammen und bekommt den reinen 1D-Packer `packBoards`. `reduit.js` rastet Tiefen auf Brettbreiten ein, ersetzt 40er-Leisten durch Latten, stösst lange Tablare (`shelfJoints`/`splitShelf`) und packt mit `packBoards`. `index.html` filtert die Materialliste nach Möbeltyp und zeigt Formate, Bretter und Kosten an. Das Jumbo-Skript liest den «Best Price» ganzer Bretter und führt ihn nach.

**Tech Stack:** Vanilla JS (keine Module, kein Build), `node --test` (Node 24), Patchright (nur `tools/`, sichtbares Chrome) für Jumbo und den Browser-Check.

**Spec:** `docs/superpowers/specs/2026-09-25-feste-formate-design.md`

## Global Constraints

- Keine Build-Stufe. `preise.js`, `shared.js`, `sideboard.js`, `reduit.js` sind klassische Scripts, im Browser Globals, Node-Export nur über `if (typeof module !== 'undefined') module.exports = {…}`.
- Einzige erlaubte `require`-Stelle in Website-Dateien bleibt `shared.js` → `require('./preise.js')` (nur wenn `PREISE` fehlt).
- Schweizer Rechtschreibung in UI-Texten (kein «ß»), Masse in mm, Preise in CHF.
- **Nur ablängen:** Teilbreite = Brettbreite, Toleranz `BOARD_SLACK = 15` mm (Teil b bekommt kleinste Breite B mit b ≤ B ≤ b + 15).
- **Brett-Materialien nur beim Reduit.** Das Sideboard rechnet unverändert, `test/sideboard.snapshot.test.js` bleibt grün, ohne die Fixture neu zu schreiben.
- Plattenmaterialien (ohne `boards`) rechnen im Reduit exakt wie vorher: keine Stösse, gleiche Teile.
- `preise.js` behält seine Form (ein Eintrag pro Zeile, `tools/preise-datei.cjs` → `format`), und `test/preise.test.js` prüft das.
- Jumbo schonend: eine Seite nach der anderen, 4–5,5 s Pause.
- Branch `feste-formate` (baut auf `jumbo-preise` auf). Commit nach jedem Task. Kein Push ohne Rückfrage.

## Review Focus

1. **Kleiner Raum mit breiten Brettern** (go/on 3-Schicht nur 600, Raumbreite 1000): Das Abrunden der Tiefe findet keine Breite innerhalb der Begrenzung. Erwartet: Die begrenzte Tiefe bleibt (keine überlappenden Regale), die Teile erscheinen als «passt auf kein Brett», es kommt keine Exception. → Test in Task 3.
2. **Nische kürzt das Tablar** unter der Nischenhöhe: Oberhalb braucht es einen Stoss, unterhalb nicht. Erwartet: Beide Längen werden korrekt gestossen, und kein Stück ist > Lmax. → Test in Task 4.
3. **Tür nach innen (freies Ende) und Stoss am selben Tablar:** Die Stütze am freien Ende und die Stoss-Stütze existieren beide, und die Enden-Logik (`ends`) bleibt korrekt (erstes Stück behält `ends[0]`, letztes `ends[1]`). → Test in Task 4.
4. **Wechsel Reduit → Sideboard mit Brett-Material** und danach ein Neuladen der Seite: Das Material fällt auf ein Plattenmaterial zurück, Preis- und Formatfelder sind wieder sichtbar, und der Hinweis erscheint einmal. → Browser-Check in Task 5.
5. **Brett-Material, aber alle Teile passen nicht** (Wangen 2390 lang aus Regalbauplatte 1150): Die Summary zeigt CHF 0 für Holz und keine NaN, die Warnung nennt Alternativen. → Test in Task 3.

---

### Task 1: Daten – `bretter` in `preise.js`

**Files:**
- Modify: `preise.js` (Schaltafel aus `platten` entfernen, Gruppe `bretter` anhängen)
- Modify: `tools/preise-datei.cjs` (Kopfkommentar: Zeile zu `bretter`)
- Modify: `test/preise.test.js` (Prüfungen für `bretter`)

**Interfaces:**
- Produces: `PREISE.bretter[key] = { t:Number, formate:[{ L, B, price }], stand, quelle, est? }` für `gon_fichte`, `gon_3s`, `mood_fichte`, `regalbau`, `schaltafel`.

- [ ] **Step 1: Test für `bretter` schreiben** – in `test/preise.test.js` den Test «Einträge in preise.js sind vollständig» ersetzen durch:

```js
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
```

- [ ] **Step 2: Test laufen lassen** – `node --test test/preise.test.js`. Erwartet: FAIL («Schaltafel ist ein ganzes Brett …»).

- [ ] **Step 3: Kopfkommentar** – in `tools/preise-datei.cjs` in `HEAD` nach der Zeile, die mit `   rueckwaende:` beginnt, einfügen:

```
   bretter:     ganze Bretter (nur ablängen): t = Stärke, formate = [{ L = Länge, B = Breite in mm, price = CHF pro Stück }]
```

- [ ] **Step 3b: Daten schreiben** – mit einem Node-Einzeiler, damit die Form stimmt (schreibt auch den neuen Kopf):

```bash
node -e '
const { FILE, format } = require("./tools/preise-datei.cjs");
const P = require("./preise.js");
delete P.platten.schaltafel;
const s = "2026-09-25", f = (L, B, price) => ({ L, B, price });
P.bretter = {
  gon_fichte: { t:18, formate:[f(1200,200,5.6), f(2000,200,10.2), f(1200,400,12.5), f(2000,400,20.5)], stand:s, quelle:"Go/on Leimholzplatte Fichte, Best Price" },
  gon_3s: { t:19, formate:[f(1200,600,29.95), f(2500,600,59.9)], stand:s, quelle:"Go/on 3-Schicht Fichte C+/C, Best Price" },
  mood_fichte: { t:18, formate:[f(800,300,11.5), f(800,400,15.5), f(800,600,21.5), f(1200,200,10.95), f(1200,300,15.95), f(1200,400,21.95), f(1200,500,27.95), f(1200,600,32.95), f(2000,200,18.5), f(2000,300,27.95), f(2000,400,36.5), f(2000,500,43.95), f(2000,600,54.95), f(2500,300,33.95), f(2500,400,44.95), f(2500,600,68.95)], stand:s, quelle:"Mood Leimholzplatte Fichte A" },
  regalbau: { t:16, formate:[f(1150,200,8.25), f(1150,250,9.5), f(1150,300,10.5), f(1150,400,14.95), f(1150,500,17.5), f(1150,600,20.5)], stand:s, quelle:"Regalbauplatte weiss FSC 100%" },
  schaltafel: { t:27, formate:[f(2000,500,29.5)], stand:s, quelle:"Schalungstafel 3-S 27 x 2000 x 500 mm" }
};
require("fs").writeFileSync(FILE, format(P));'
```

- [ ] **Step 4: Tests laufen lassen** – `node --test`. Erwartet: `test/preise.test.js` PASS. `test/reduit.test.js` kann FAIL melden («jede Material-Stärke …», Schaltafel-Tests), weil `MATS.schaltafel` jetzt fehlt. Das behebt Task 2. Der Snapshot ist PASS.

- [ ] **Step 5: Commit**

```bash
git add preise.js tools/preise-datei.cjs test/preise.test.js
git commit -m "feat: ganze Bretter in preise.js (go/on, Mood Fichte A, Regalbauplatte, Schaltafel)"
```

---

### Task 2: Brett-Materialien und Packer in `shared.js`

**Files:**
- Modify: `shared.js` (MAT_INFO, Zusammensetzen von MATS, `boardWidthFor`, `packBoards`, `sheetCosts`, Export)
- Modify: `reduit.js:112-124` (SPAN-Werte der neuen Materialien)
- Test: `test/shared.test.js`, `test/preise.test.js`

**Interfaces:**
- Consumes: `PREISE.bretter` (Task 1).
- Produces:
  - `MATS[k]` für Brett-Materialien: `{ …MAT_INFO[k], boards:[{L,B,price}] (nach B, dann L sortiert), widths:[B…] aufsteigend, t:[t], tDef:t, sheet:[L,B] des grössten Formats, price: günstigster CHF/m² (2 Stellen), est:Boolean }`. Plattenmaterialien sehen aus wie bisher (kein `boards`).
  - `BOARD_SLACK = 15`
  - `boardWidthFor(widths, b) → Number | null`
  - `packBoards(items, boards, kerf) → { sheets:[{ L, B, price, parts:[{ it, x, y:0, w, h, rot:false }] }], unplaced:[it], used, partArea, total }`
  - `sheetCosts(groups)`: Gruppen mit `boards:true` → `cut = whole = Summe sheets[].price`.

- [ ] **Step 1: Failing Tests** – an `test/shared.test.js` anhängen:

```js
const F = [
  { L:1200, B:200, price:5.6 }, { L:2000, B:200, price:10.2 },
  { L:1200, B:400, price:12.5 }, { L:2000, B:400, price:20.5 }
];
const part = (L, B, pos = 'A') => ({ L, B, pos, key:`${pos}|${L}|${B}`, name:'Tablar' });

test('boardWidthFor: kleinste Brettbreite bis 15 mm breiter', () => {
  assert.strictEqual(S.boardWidthFor([200, 400], 397), 400);
  assert.strictEqual(S.boardWidthFor([200, 400], 385), 400);
  assert.strictEqual(S.boardWidthFor([200, 400], 384), null);
  assert.strictEqual(S.boardWidthFor([200, 400], 200), 200);
  assert.strictEqual(S.boardWidthFor([200, 400], 410), null);
});

test('packBoards: günstigstes Format, halb volles 2000er wird 1200er', () => {
  const r = S.packBoards([part(1500, 397, 'A'), part(900, 397, 'B')], F, 4);
  // 1500 + 4 + 900 > 2000 → zwei Bretter: 1500 → 2000er (20.50), 900 → 1200er (12.50)
  assert.deepStrictEqual(r.sheets.map(s => [s.L, s.B, s.price]), [[2000, 400, 20.5], [1200, 400, 12.5]]);
  assert.strictEqual(r.unplaced.length, 0);
  assert.strictEqual(S.sheetCosts([{ boards:true, ...r }]).whole, 33);
});

test('packBoards: Sägeschnitt zählt (2 × 1000 passt nicht auf 2000)', () => {
  const r = S.packBoards([part(1000, 200, 'A'), part(1000, 200, 'B')], F, 4);
  assert.deepStrictEqual(r.sheets.map(s => s.L), [1200, 1200]);
  const r0 = S.packBoards([part(1000, 200, 'A'), part(1000, 200, 'B')], F, 0);
  assert.deepStrictEqual(r0.sheets.map(s => s.L), [2000]);
  assert.deepStrictEqual(r0.sheets[0].parts.map(p => p.x), [0, 1000]);
});

test('packBoards: zu breit oder zu lang → unplaced, doppelte Teile nur einmal gemeldet', () => {
  const r = S.packBoards([part(500, 450, 'A'), part(2100, 400, 'B'), part(2100, 400, 'B')], F, 4);
  assert.deepStrictEqual(r.unplaced.map(u => u.pos), ['A', 'B']);
  assert.strictEqual(r.sheets.length, 0);
  assert.strictEqual(S.sheetCosts([{ boards:true, ...r }]).whole, 0);
});

test('Brett-Material in MATS', () => {
  const M = S.MATS.gon_fichte;
  assert.deepStrictEqual(M.widths, [200, 400]);
  assert.deepStrictEqual(M.t, [18]);
  assert.strictEqual(M.tDef, 18);
  assert.deepStrictEqual(M.sheet, [2000, 400]);
  assert.strictEqual(M.price, 23.33);   // 5.60 / 0.24 m²
  assert.ok(!S.MATS.birke.boards);
});
```

- [ ] **Step 2: Tests laufen lassen** – `node --test test/shared.test.js`. Erwartet: FAIL (`S.boardWidthFor is not a function`).

- [ ] **Step 3: `MAT_INFO` ergänzen** – in `shared.js` den Eintrag `schaltafel` ersetzen und nach `dekorspan` die Brett-Materialien anhängen:

```js
  schaltafel: { name:'Schaltafel 3-Schicht', short:'Schaltafel', color:'#E8C547', ply:true, grain:false, coated:true, boards:true,
            note:'Die gelbe Platte von der Baustelle: sehr robust und wasserfest, die Oberfläche ist schon fertig. Gibt es nur als ganze Tafel 2000 × 500 – die Tiefe richtet sich danach. Die Schnittkanten einmal lackieren oder ölen.' },
```

```js
  // Ganze Bretter in festen Formaten (nur ablängen, nur Reduit). Formate und Stückpreise in preise.js → bretter.
  gon_fichte: { name:'go/on Leimholz Fichte', short:'go/on Fichte', color:'#EAD6A8', ply:false, grain:true, boards:true,
            note:'Ganze Bretter 200 oder 400 breit, 1200 oder 2000 lang – viel günstiger als der Zuschnitt. Die Regaltiefe richtet sich nach der Brettbreite. Weissöl hält den hellen Ton.' },
  gon_3s: { name:'go/on 3-Schicht Fichte', short:'go/on 3-Schicht', color:'#E6CF9E', ply:true, grain:true, boards:true,
            note:'Dreischichtplatte, 600 breit und 1200 oder 2500 lang. Verzieht sich kaum – nur für 60 cm tiefe Regale.' },
  mood_fichte: { name:'Mood Leimholz Fichte A', short:'Mood Fichte', color:'#EAD6A8', ply:false, grain:true, boards:true,
            note:'Schöne Sichtqualität A, viele Formate von 800 bis 2500 lang und 200 bis 600 breit.' },
  regalbau: { name:'Regalbauplatte weiss', short:'Regalbauplatte', color:'#F1F0EB', ply:false, grain:false, coated:true, boards:true,
            note:'Weiss beschichtet, die Längskanten sind schon bekantet. Nur 1150 lang – lange Tablare werden über einer Stütze gestossen.' }
```

- [ ] **Step 4: `MATS` zusammensetzen** – in `shared.js` den Block `const MATS = Object.fromEntries(…)` (Kommentar «Stärken = Stärken mit Preis …» bis `}));`) ersetzen durch:

```js
// Plattenmaterial: Stärken = Stärken mit Preis; price = Preis der Standardstärke (für die Sortierung).
function plateMat(M, P){
  if (!P) return null;
  const t = Object.keys(P.prices).map(Number).sort((a, b) => a - b);
  const tDef = t.includes(M.tDef) ? M.tDef : t[0];
  return { ...M, t, tDef, sheet:P.sheet, price:P.prices[tDef], prices:P.prices };
}
// Brett-Material: Formate nach Breite, dann Länge; price = günstigster m²-Preis (Sortierung, Anzeige «ab»), sheet = grösstes Format.
function boardMat(M, P){
  if (!P || !P.formate.length) return null;
  const boards = P.formate.map(f => ({ L:f.L, B:f.B, price:f.price })).sort((a, b) => a.B - b.B || a.L - b.L);
  const big = boards.reduce((a, f) => f.L > a.L || (f.L === a.L && f.B > a.B) ? f : a);
  const perM2 = Math.min(...boards.map(f => f.price / (f.L * f.B / 1e6)));
  return { ...M, t:[P.t], tDef:P.t, boards, widths:[...new Set(boards.map(f => f.B))], est:!!P.est,
    sheet:[big.L, big.B], price:Math.round(perM2 * 100) / 100 };
}
// Ohne Preis fällt ein Material weg.
const MATS = Object.fromEntries(Object.entries(MAT_INFO)
  .map(([k, M]) => [k, M.boards ? boardMat(M, (PRICE_DATA.bretter || {})[k]) : plateMat(M, PRICE_DATA.platten[k])])
  .filter(([, M]) => M));
```

  `PRICE_DATA.bretter || {}` ist nötig, weil der Sideboard-Snapshot mit `test/fixtures/preise.json` rechnet, und die hat keine `bretter`.

- [ ] **Step 5: Packer und Kosten** – in `shared.js` die Funktion `sheetCosts` ersetzen und direkt danach den Block «Ganze Bretter» einfügen:

```js
// Holzkosten zweier Einkaufsarten: Zuschnitt (nur Teilefläche) oder ganze Platten. Ganze Bretter: nur Stückpreise.
function sheetCosts(groups){
  const whole = g => g.boards ? g.sheets.reduce((a, s) => a + s.price, 0) : g.sheets.length * g.sheet[0] * g.sheet[1] / 1e6 * g.price;
  return {
    cut: groups.reduce((a, g) => a + (g.boards ? whole(g) : g.partArea / 1e6 * g.price), 0),
    whole: groups.reduce((a, g) => a + whole(g), 0)
  };
}

/* ---------- Ganze Bretter ---------- */
// Nur ablängen: ein Teil der Breite b bekommt die kleinste Brettbreite B mit b ≤ B ≤ b + BOARD_SLACK, sonst null.
const BOARD_SLACK = 15;
function boardWidthFor(widths, b){
  const B = widths.find(w => w >= b && w <= b + BOARD_SLACK);
  return B == null ? null : B;
}
// 1D-Packen pro Brettbreite: längste Teile zuerst auf das längste Format (First Fit), dann je Brett das günstigste Format, das die Teile fasst.
function packBoards(items, boards, kerf){
  const widths = [...new Set(boards.map(f => f.B))].sort((a, b) => a - b);
  const sheets = [], unplaced = [], byW = new Map();
  const miss = it => { if (!unplaced.some(u => u.key === it.key)) unplaced.push(it); };
  for (const it of items) {
    const B = boardWidthFor(widths, it.B);
    if (B == null) { miss(it); continue; }
    if (!byW.has(B)) byW.set(B, []);
    byW.get(B).push(it);
  }
  for (const B of widths) {
    const fmts = boards.filter(f => f.B === B), Lmax = Math.max(...fmts.map(f => f.L));
    const bins = [];
    for (const it of (byW.get(B) || []).slice().sort((a, b) => b.L - a.L)) {
      if (it.L > Lmax) { miss(it); continue; }
      const bin = bins.find(b => b.len + kerf + it.L <= Lmax);
      if (bin) { bin.parts.push(it); bin.len += kerf + it.L; } else bins.push({ parts:[it], len:it.L });
    }
    for (const bin of bins) {
      const f = fmts.filter(f => f.L >= bin.len).reduce((a, f) => f.price < a.price ? f : a);
      let x = 0;
      const parts = bin.parts.map(it => { const p = { it, x, y:0, w:it.L, h:B, rot:false }; x += it.L + kerf; return p; });
      sheets.push({ L:f.L, B, price:f.price, parts });
    }
  }
  const used = sheets.reduce((a, s) => a + s.parts.reduce((b, p) => b + p.w * p.h, 0), 0);
  const partArea = items.reduce((a, it) => a + it.L * it.B, 0);
  return { sheets, unplaced, used, partArea, total: sheets.reduce((a, s) => a + s.L * s.B, 0) };
}
```

  Export ergänzen: `module.exports = { …, sheetCosts, BOARD_SLACK, boardWidthFor, packBoards };`

- [ ] **Step 6: SPAN** – in `reduit.js` in `const SPAN = {…}` ergänzen (Leimholz wie `fichte`, 3-Schicht wie `dreischicht`, Regalbauplatte wie `dekorspan`):

```js
  gon_fichte:{ 18:600 },
  gon_3s:    { 19:650 },
  mood_fichte:{ 18:600 },
  regalbau:  { 16:400 },
```

- [ ] **Step 7: Vollständigkeitstest** – in `test/preise.test.js` im Test «jedes Material, jede Rückwand …» die Zeile mit `MAT_INFO` so lassen (sie liest alle Schlüssel aus `MAT_INFO`, auch die neuen) und danach anfügen:

```js
  for (const [k, e] of Object.entries(PREISE.bretter)) assert.ok(MATS[k] && MATS[k].boards, `bretter.${k} ohne Material in MAT_INFO`);
```

- [ ] **Step 8: Tests laufen lassen** – `node --test`. Erwartet: alles PASS **ausser** `test/reduit.test.js` › «Schaltafel: 50 cm breit – zu tiefe Teile werden gemeldet» (die Tiefe rastet noch nicht ein, und das Reduit packt Brett-Materialien noch wie Platten). Diesen Test passt Task 3 an. Wenn noch etwas anderes fehlschlägt: anhalten und prüfen.

- [ ] **Step 9: Commit**

```bash
git add shared.js reduit.js test/shared.test.js test/preise.test.js
git commit -m "feat: Brett-Materialien und 1D-Packer packBoards"
```

---

### Task 3: Reduit rechnet mit Brettern (Tiefe, Teilbreiten, Latten, Packen, Einkaufsliste)

**Files:**
- Modify: `reduit.js` – `normReduit` (Tiefe einrasten), `SUPPORTS.battens` und `addCornerBatten` (Latten statt 40er-Leisten), `computeReduit` (ctx, Gruppen, Warnungen, Einkaufsliste, Werkzeug), `buildReduitSteps` (Einkauf statt Zuschnitt)
- Test: `test/reduit.test.js`

**Interfaces:**
- Consumes: `MATS[k].boards/widths/est/name/short`, `boardWidthFor`, `BOARD_SLACK`, `packBoards`, `sheetCosts` (Task 2).
- Produces:
  - `R.groups[0]` bei Brett-Material: `{ label, boards:true, sheet:M.sheet, price:null, rotate:false, …packBoards() }`
  - `R.hw` beginnt mit einer Zeile pro Format: `[n, '<M.name> <L> × <B> × <t> mm', note, Stückpreis]`, zählt **nicht** in `R.buyCost`.
  - `ctx.boards` (Boolean), `ctx.bm` (Material oder null), `ctx.stripFin`, Helfer `addStrip(ctx, name, L, note, box)`.

- [ ] **Step 1: Failing Tests** – in `test/reduit.test.js` den Test «Schaltafel: 50 cm breit – zu tiefe Teile werden gemeldet» ersetzen und neue Tests anhängen:

```js
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
```

  Und im Test «alle Kombinationen liefern gültige Teile» die `extra`-Liste erweitern um die Brett-Materialien:

```js
      for (const extra of [{}, { nicheL:true, nicheR:true }, { doorIn:true, hinge:'R' }, { mat:'mdf', t:19, back:'none' },
                           { mat:'gon_fichte', t:18 }, { mat:'regalbau', t:16, nicheL:true }, { mat:'mood_fichte', t:18, doorIn:true, hinge:'L' }, { mat:'schaltafel', t:27 }]) {
```

- [ ] **Step 2: Tests laufen lassen** – `node --test test/reduit.test.js`. Erwartet: FAIL bei den neuen Tests.

- [ ] **Step 3: Tiefe einrasten** – in `normReduit` direkt nach `for (const k of ['dBack', 'dLeft', 'dRight']) num(k, 150, 600);` einfügen:

```js
  // Ganze Bretter (nur ablängen): Tiefe = Brettbreite. Jetzt aufrunden, nach den Begrenzungen unten abrunden.
  const BM = MATS[c.mat] && MATS[c.mat].boards ? MATS[c.mat] : null;
  const want = { dBack:c.dBack, dLeft:c.dLeft, dRight:c.dRight };
  if (BM) for (const k of ['dBack', 'dLeft', 'dRight']) { const B = BM.widths.find(w => w >= c[k]); c[k] = B == null ? BM.widths[BM.widths.length - 1] : B; }
```

  und direkt vor `if (!hasL) c.nicheL = false;` einfügen:

```js
  if (BM) {
    const moved = [];
    for (const [k, side, on] of [['dBack', 'hinten', true], ['dLeft', 'links', hasL], ['dRight', 'rechts', hasR]]) {
      // Passt keine Brettbreite in die Begrenzung, bleibt die begrenzte Tiefe (die Teile melden dann «passt auf kein Brett»).
      const B = [...BM.widths].reverse().find(w => w <= c[k]);
      if (B != null) c[k] = B;
      if (on && c[k] !== want[k]) moved.push(`${side} ${c[k]} mm`);
    }
    if (moved.length) warn.push(`Tiefe ${joinDe(moved)} gesetzt (Brettbreite ${BM.name}: ${BM.widths.join(', ')} mm).`);
  }
```

  (`joinDe` ist weiter unten als `const` definiert. `normReduit` läuft erst nach dem Laden der Datei, das ist also in Ordnung.)

- [ ] **Step 4: Latten statt 40er-Leisten** – in `reduit.js` vor `const SUPPORTS` einfügen:

```js
// 40er-Leiste aus dem Plattenmaterial; bei ganzen Brettern (nur ablängen, keine Streifen) eine Dachlatte 24 × 48.
function addStrip(ctx, name, L, note, box){
  if (ctx.boards) ctx.add(name, L, 48, 24, ctx.gSolid, `${note}, aus Dachlatte 24 × 48`, 'solid', box, BUY.latte.price);
  else ctx.add(name, L, 40, ctx.t, ctx.gMain, note, 'korpus', box);
}
```

  In `addCornerBatten` den `ctx.add('Eckleiste', …)`-Aufruf ersetzen durch:

```js
  addStrip(ctx, 'Eckleiste', seg.depth - 3, 'unter dem Eckstoss, an beide Tablare geschraubt',
    ctx.box(seg, { u0:p.a - 20, u1:p.a + 20, y0:p.y - ctx.t, y1:p.y, v0:3, v1:seg.depth }, 'y', 'v', ctx.stripFin, [0, -60, 0]));
```

  In `SUPPORTS.battens` die beiden `ctx.add('Leiste', …)` ersetzen durch:

```js
      addStrip(ctx, 'Leiste', p.b - p.a, 'Wandleiste, alle 40 cm an die Wand',
        ctx.box(seg, { u0:p.a, u1:p.b, y0:p.y - 40, y1:p.y, v0:0, v1:t }, 'v', 'u', ctx.stripFin, [0, -40, 0]));
```

```js
        addStrip(ctx, 'Leiste', seg.depth - 20 - t, 'Endleiste an der Stirnwand',
          ctx.box(seg, { u0:u, u1:u + t, y0:p.y - 40, y1:p.y, v0:t, v1:seg.depth - 20 }, 'u', 'v', ctx.stripFin, [0, -40, 0]));
```

- [ ] **Step 5: `computeReduit` – ctx und Teilbreiten** – nach `const M = MATS[c.mat] || MATS.birke, t = c.t;` einfügen: `const BM = M.boards ? M : null;`.
  Im `ctx`-Objekt ergänzen: `boards:!!BM, bm:BM, stripFin: BM ? SOLID_FIN : fin,`.
  In `ctx.add` als erste Zeile einfügen:

```js
      if (BM && kind === 'korpus') { const w = boardWidthFor(BM.widths, B); if (w != null) B = w; }   // ganzes Brett: Teilbreite = Brettbreite
```

- [ ] **Step 6: `computeReduit` – packen und Warnungen** – den Block von `groups.push({ label: gMain, sheet:[sheetL, sheetB] …` bis zur `for (const g of groups) for (const u of g.unplaced) warn.push(…)`-Zeile ersetzen durch:

```js
  if (BM) {
    const r = packBoards(mainItems, BM.boards, kerf);
    groups.push({ label: gMain, boards:true, sheet: BM.sheet, price:null, rotate:false, ...r });
    for (const u of r.unplaced) {
      const B = boardWidthFor(BM.widths, u.B);
      if (B == null) { warn.push(`Teil ${u.pos} (${u.name}, ${u.L} × ${u.B} mm) passt auf kein Brett – Breiten: ${BM.widths.join(', ')} mm.`); continue; }
      const Lmax = Math.max(...BM.boards.filter(f => f.B === B).map(f => f.L));
      const alt = Object.values(MATS).filter(X => X.boards && X !== BM && X.boards.some(f => f.B >= u.B && f.B <= u.B + BOARD_SLACK && f.L >= u.L)).map(X => X.name);
      warn.push(`Teil ${u.pos} (${u.name}, ${u.L} mm) ist länger als das längste Brett (${Lmax} mm) – ${alt.length ? `ein Brett-Material mit längeren Brettern (${joinDe(alt)}) oder ` : ''}ein Plattenmaterial wählen.`);
    }
  } else {
    groups.push({ label: gMain, sheet:[sheetL, sheetB], price: clamp(c.price, 0, 500), rotate, ...pack(mainItems, sheetL, sheetB, kerf, 10, rotate) });
  }
  if (Bk && backItems.length) groups.push({ label: gBack, sheet: Bk.sheet, price: Bk.price, rotate: true, ...pack(backItems, Bk.sheet[0], Bk.sheet[1], kerf, 10, true) });
  for (const g of groups) if (!g.boards) for (const u of g.unplaced) warn.push(`Teil ${u.pos} (${u.name}, ${u.L} × ${u.B} mm) passt nicht auf die Platte ${g.sheet[0]} × ${g.sheet[1]} mm. Grösseres Plattenformat eintragen${g.rotate ? '' : ' oder Maserung freigeben'}.`);
```

- [ ] **Step 7: Einkaufsliste, Werkzeug, Bauablauf** – direkt **nach** der Zeile `const buyCost = …` einfügen (damit die Bretter nicht in `buyCost` zählen):

```js
  // Ganze Bretter als erste Zeilen der Einkaufsliste (Kosten laufen über «Holz», nicht über Kaufteile).
  if (BM) {
    const per = new Map();
    for (const s of groups[0].sheets) { const k = `${s.L}×${s.B}`; const e = per.get(k) || { n:0, s }; e.n++; per.set(k, e); }
    hw.unshift(...[...per.values()].map(({ n, s }) => [n, `${BM.name} ${s.L} × ${s.B} × ${t} mm`, BM.est ? 'ganzes Brett, selbst ablängen · Preis geschätzt' : 'ganzes Brett, selbst ablängen', s.price]));
  }
```

  Bei den Werkzeugen nach `const tools = new Set([…]);` einfügen: `if (BM) tools.add('Kappsäge oder Handkreissäge mit Führungsschiene zum Ablängen');`

  Den Aufruf `buildReduitSteps({ c, free, … })` um `boards: !!BM` ergänzen. In `buildReduitSteps` die Destrukturierung um `boards` ergänzen und die Zeile `st.push(['Zuschnitt organisieren', …]);` ersetzen durch:

```js
  if (o.boards) st.push(['Bretter einkaufen und ablängen', `Die ganzen Bretter stehen in der Einkaufsliste (Beschläge & Kaufteile). Zuhause mit Kapp- oder Handkreissäge auf die Längen der Materialliste ablängen – die Breite bleibt, wie sie ist.${hasSolid ? ' Kanthölzer und Latten ebenso auf Länge sägen.' : ''}`, 'Zuerst die längsten Teile anzeichnen, dann die kurzen aus den Resten.']);
  else st.push(['Zuschnitt organisieren', `Kopier die Materialliste und lass die Platten im Baumarkt zuschneiden.${hasSolid ? ' Kanthölzer und Latten gibt es in Standardlängen – selbst mit der Säge ablängen.' : ''}`, 'Frag nach dem Zuschnitt, ob die Teile beschriftet werden können.']);
```

- [ ] **Step 8: Tests laufen lassen** – `node --test`. Erwartet: alles PASS. Ein Hinweis: «Teil … länger als das längste Brett» kann im Kombinationstest für lange Tablare vorkommen, der prüft aber nur gültige Teile. Die Stösse kommen in Task 4.

- [ ] **Step 9: Commit**

```bash
git add reduit.js test/reduit.test.js
git commit -m "feat: Reduit rechnet mit ganzen Brettern (Tiefe, Latten, Packen, Einkaufsliste)"
```

---

### Task 4: Stösse bei langen Tablaren

**Files:**
- Modify: `reduit.js` – neue Helfer `shelfJoints`, `splitShelf`, `addShelf` (Notiz), `SUPPORTS.battens/rails/brackets/posts`, `buildReduitSteps` (Schritt «Stösse verbinden»), Export `shelfJoints`
- Test: `test/reduit.test.js`

**Interfaces:**
- Consumes: `ctx.boards`, `ctx.bm`, `boardWidthFor` (Task 2/3).
- Produces:
  - `JOINT_OFF = 45`
  - `shelfJoints(a, b, Lmax, cands) → { cuts:[u…], added:[u…] }` (rein; `cands` = mögliche Stossstellen = Stützen-Mitte + 45; `added` = Stösse ohne Stütze)
  - `splitShelf(ctx, seg, p, supports) → { pieces:[p…], supports:[u…] }` (`supports` = Mitten der Stützen, die dazukommen; fügt die Stossleisten selbst hinzu). Stücke haben `ends` mit `'joint'` an inneren Enden.
  - `ctx.lmax(seg)` → längstes Brett der Tablarbreite, `Infinity` ohne Brett-Material.

- [ ] **Step 1: Failing Tests** – an `test/reduit.test.js` anhängen:

```js
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
```

- [ ] **Step 2: Tests laufen lassen** – `node --test test/reduit.test.js`. Erwartet: FAIL (`R.shelfJoints is not a function`).

- [ ] **Step 3: Helfer** – in `reduit.js` nach `addStrip` einfügen:

```js
/* ---------- Stösse (ganze Bretter) ---------- */
// Stoss 45 mm neben einer Stütze: ein Stück liegt auf der Stütze, das andere hängt über die Stossleiste daran.
const JOINT_OFF = 45;
// Stossstellen für ein Tablar a..b: so wenige, möglichst gleich lange Stücke ≤ Lmax; jeder Stoss auf dem nächstgelegenen Kandidaten
// (cands = Stütze + JOINT_OFF), bei dem der Rest noch in die übrigen Stücke passt. added = Stösse ohne Stütze (dort kommt eine dazu).
function shelfJoints(a, b, Lmax, cands){
  const len = b - a;
  if (!(len > Lmax)) return { cuts:[], added:[] };
  const k = Math.ceil(len / Lmax), cuts = [], added = [];
  let prev = a;
  for (let i = 1; i < k; i++) {
    const ideal = a + len * i / k, rest = k - i;
    const ok = cands.filter(u => u > prev && u - prev <= Lmax && b - u <= rest * Lmax);
    if (ok.length) { prev = ok.reduce((x, y) => Math.abs(y - ideal) < Math.abs(x - ideal) ? y : x); cuts.push(prev); }
    else { prev = r0(Math.min(ideal, prev + Lmax)); cuts.push(prev); added.push(prev); }
  }
  return { cuts, added };
}
// Tablar p in Stücke teilen (nur bei ganzen Brettern). supports = Stützen-Mitten entlang u. Legt die Stossleisten an.
function splitShelf(ctx, seg, p, supports){
  const { cuts, added } = shelfJoints(p.a, p.b, ctx.lmax(seg), supports.map(u => u + JOINT_OFF));
  if (!cuts.length) return { pieces:[p], supports:[] };
  const edges = [p.a, ...cuts, p.b];
  const pieces = edges.slice(1).map((b, i) => ({ ...p, a:edges[i], b, ends:[i === 0 ? p.ends[0] : 'joint', i === cuts.length ? p.ends[1] : 'joint'] }));
  for (const u of cuts) {
    ctx.add('Stossleiste', seg.depth - 80, 48, 24, ctx.gSolid, 'unter dem Tablarstoss, an beide Stücke geschraubt', 'solid',
      ctx.box(seg, { u0:u - 24, u1:u + 24, y0:p.y - 24, y1:p.y, v0:30, v1:seg.depth - 50 }, 'y', 'v', SOLID_FIN, [0, -60, 0]), BUY.latte.price);
    ctx.buy('screw35', 4, 'Stossleisten');
  }
  return { pieces, supports: added.map(u => u - JOINT_OFF) };
}
// Alle Tablare eines Segments teilen; gibt die Stücke und alle zusätzlichen Stützen (sortiert, eindeutig) zurück.
function splitShelves(ctx, seg, shelves, supports){
  if (!ctx.boards) return { pieces:shelves, supports:[] };
  const pieces = [], more = [];
  for (const p of shelves) { const s = splitShelf(ctx, seg, p, supports); pieces.push(...s.pieces); more.push(...s.supports); }
  return { pieces, supports:[...new Set(more.map(r0))].sort((x, y) => x - y) };
}
```

  In `addShelf` die Notiz für Stücke ergänzen, also die erste Zeile der Funktion ersetzen durch:

```js
function addShelf(ctx, seg, p, note){
  if (p.ends.includes('joint')) note += ', am Stoss auf der Stossleiste';
  ctx.add('Tablar', p.b - p.a, seg.depth - 3, ctx.t, ctx.gMain, note, 'korpus',
```

  Im `ctx` von `computeReduit` ergänzen:

```js
    lmax(seg){
      if (!BM) return Infinity;
      const B = boardWidthFor(BM.widths, seg.depth - 3);
      return B == null ? Infinity : Math.max(...BM.boards.filter(f => f.B === B).map(f => f.L));
    },
```

  Export ergänzen: `SPAN, BUY, SYS, maxSpan, cheekPositions, moduleSplit, computeReduit, shelfJoints`.

- [ ] **Step 4: Schienen** – in `SUPPORTS.rails` die Zeile `const us = spread(…).map(r0);` ersetzen durch `let us = spread(seg.u0 + 50, seg.u1 - 50, n).map(r0);` und direkt danach einfügen:

```js
    const split = splitShelves(ctx, seg, shelves, us);
    us = [...new Set([...us, ...split.supports])].sort((x, y) => x - y);
    const list = split.pieces;
```

  Im restlichen `rails`-Code `shelves` durch `list` ersetzen: in `for (const p of shelves) addShelf(…)`, in `const on = shelves.filter(…)` und in `for (const p of shelves) if (p.ends[0] === 'corner') addCornerBatten(…)`. **Nicht** ersetzen in `freeEndPosts(ctx, seg, shelves)`, denn die freien Enden sind dieselben. `if (n > 2) extraWarn(…)` bleibt.

- [ ] **Step 5: Tablarwinkel** – in `SUPPORTS.brackets` den Inhalt der `for (const p of shelves)`-Schleife ersetzen durch:

```js
    for (const p of shelves) {
      const n = pieces(p.b - p.a - 120, ctx.max) + 1;
      if (n > 2) extra = true;
      const base = spread(p.a + 60, p.b - 60, n).map(r0);
      const split = splitShelves(ctx, seg, [p], base);
      for (const q of split.pieces) addShelf(ctx, seg, q, 'liegt auf Tablarwinkeln');
      for (const u of [...base, ...split.supports]) {
        ctx.extras.push({ type:'metal', ...ctx.box(seg, { u0:u - 10, u1:u + 10, y0:p.y - size * 0.8, y1:p.y, v0:0, v1:4 }, 'v', 'y', null) });
        ctx.extras.push({ type:'metal', ...ctx.box(seg, { u0:u - 10, u1:u + 10, y0:p.y - 4, y1:p.y, v0:4, v1:size }, 'y', 'v', null, [0, 0, 120]) });
        count++;
      }
      if (p.ends[0] === 'corner') addCornerBatten(ctx, seg, p);
    }
```

- [ ] **Step 6: Pfostenrahmen** – in `SUPPORTS.posts` den Block ab dem Kommentar `// Stützpunkte entlang der Vorderkante …` bis und mit `for (let i = 0; i < pts.length - 1; i++) {…}` (der Schleife, die Zwischenpfosten in `posts` legt) **an den Anfang der Funktion verschieben**, direkt nach `const top = …`. Danach einfügen:

```js
    const split = splitShelves(ctx, seg, shelves, posts.map(u => u + 22));
    for (const s of split.supports) posts.push(r0(s - 22));
```

  In der `for (const p of shelves)`-Schleife die Zeile `addShelf(ctx, seg, p, 'liegt auf Latten, vorne auf der Querlatte');` entfernen. Nach der Schleife einfügen:

```js
    for (const q of split.pieces) addShelf(ctx, seg, q, 'liegt auf Latten, vorne auf der Querlatte');
```

  Wand-, Quer- und Endlatten bleiben pro ursprünglichem Tablar `p`, sie sind durchgehend. Die Zeilen `const inner = …`, `for (const u of posts) addPost(…)`, `ctx.buy('screw70', …)` und `extraWarn` bleiben am Ende.

- [ ] **Step 7: Leisten** – in `SUPPORTS.battens` die Schleife `for (const p of shelves) {` beginnen mit:

```js
    const split = splitShelves(ctx, seg, shelves, []);
    for (const q of split.pieces) addShelf(ctx, seg, q, 'liegt auf Leisten');
    const jointPosts = new Map();
    for (const q of split.pieces) if (q.ends[1] === 'joint') {
      const u = r0(q.b - JOINT_OFF - 22), cur = jointPosts.get(u) || { h:0, n:0 };
      jointPosts.set(u, { h: Math.max(cur.h, q.y + ctx.t), n: cur.n + 2 });
    }
    for (const [u, { h, n }] of jointPosts) {
      addPost(ctx, seg, u, h, 'Stütze vorne unter dem Tablarstoss, Tablare mit Winkeln verschraubt');
      ctx.buy('angle40', n, 'Tablare an die Stütze beim Stoss');
    }
```

  und in der bestehenden Schleife die Zeile `addShelf(ctx, seg, p, 'liegt auf Leisten');` entfernen. Leisten, Endleisten und Eckleiste bleiben pro ursprünglichem `p`. Die Durchbiegungswarnung (`longest >= ctx.max`) bleibt unverändert.

- [ ] **Step 8: Bauablauf** – im Aufruf `buildReduitSteps({ … })` ergänzen: `hasJoints: rows.some(r => r.name === 'Stossleiste')`. In `buildReduitSteps` bei der Destrukturierung `hasJoints` ergänzen und direkt nach dem Schritt «Eckstösse verbinden» (`if (hasCorner) st.push([…])`) einfügen:

```js
    if (hasJoints) st.push(['Stösse verbinden', 'Wo ein Tablar aus zwei Brettern besteht, liegt das eine Stück auf der Stütze, das andere stösst 45 mm daneben an. Unter den Stoss eine Stossleiste legen und mit je 2 Schrauben 4 × 35 in beide Stücke schrauben.', 'Die Stossleiste zuerst am aufliegenden Stück festschrauben, dann das zweite Stück bündig anlegen.']);
```

  (Falls «Eckstösse verbinden» in einem `if (!free)`-Zweig steht, gehört der neue Schritt in denselben Zweig.)

- [ ] **Step 9: Tests laufen lassen** – `node --test`. Erwartet: alles PASS, auch der Kombinationstest mit den Brett-Materialien und der Snapshot.

- [ ] **Step 10: Commit**

```bash
git add reduit.js test/reduit.test.js
git commit -m "feat: lange Tablare aus ganzen Brettern über einer Stütze stossen"
```

---

### Task 5: Formular und Anzeige in `index.html`

**Files:**
- Modify: `index.html` – CSS (`.boardlist`), Formular «Platten & Preise» (IDs, Formatliste), `fillMaterials`, neue `syncMaterials`/`applyCatalog`, `syncVisibility`, `restore`, Start, Eingabe-Handler, `renderSummary`, `renderSheets`

**Interfaces:**
- Consumes: `MATS[k].boards/widths/price/est`, `R.groups[0].boards`, `sheets[].L/B/price` (Task 2–4).
- Produces: nichts für spätere Tasks.

- [ ] **Step 1: Markup** – im Abschnitt «Platten & Preise» (`index.html:515-529`):
  - Dem `<div class="field">` mit «Plattenformat (Länge × Breite)» `id="row-sheet"` geben.
  - Dem `<div class="field">` mit `for="price"` `id="row-price"` geben.
  - Dem `<label class="check" for="grain">` `id="row-grain"` geben.
  - Dem `<p class="hint">Kosten = Fläche …` `id="sheetHint"` geben.
  - Direkt nach `row-sheet` einfügen:

```html
        <div class="field" id="row-boards" hidden>
          <span class="lbl">Formate (ganze Bretter, Stückpreis)</span>
          <ul class="boardlist" id="boardList"></ul>
        </div>
```

  CSS nach der Regel `.hint{…}` (Zeile ~97) einfügen:

```css
.boardlist{margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:2px 12px;font-size:12.5px;font-variant-numeric:tabular-nums}
.boardlist li{color:var(--ink)}
```

- [ ] **Step 2: Materialliste nach Möbeltyp** – `fillMaterials` ersetzen und Helfer ergänzen:

```js
// Plattenmaterial nach Preis sortiert, mit m²-Preis in der Auswahl. Ganze Bretter nur beim Reduit (kind leer = alle).
function fillMaterials(kind){
  $('#mat').innerHTML = Object.entries(MATS).filter(([, M]) => !M.boards || !kind || kind === 'reduit')
    .sort((a, b) => matPrice(a[1], a[1].tDef) - matPrice(b[1], b[1].tDef))
    .map(([k, M]) => `<option value="${k}">${MAT_LABEL[k] || M.name} · ${M.boards ? `ganze Bretter ab CHF ${M.price.toFixed(2)}` : `CHF ${matPrice(M, M.tDef)}`}/m²</option>`).join('');
}
// Preis und Plattenformat des Katalogs ins Formular.
function applyCatalog(mat){
  const cat = catalogValues(mat, $('#t').value);
  for (const k in cat) $('#' + k).value = cat[k];
}
// Nach einem Typwechsel: Liste neu füllen; ist das Material nicht mehr wählbar, das günstigste Plattenmaterial nehmen.
let matMsg = '';
function syncMaterials(){
  const kind = new FormData(form).get('kind'), cur = $('#mat').value;
  fillMaterials(kind);
  if (MATS[cur] && (!MATS[cur].boards || kind === 'reduit')) { $('#mat').value = cur; return; }
  const k = $('#mat').options[0].value;
  $('#mat').value = k; fillThickness(k); applyCatalog(k);
  if (MATS[cur]) matMsg = `Ganze Bretter gibt es nur beim Reduit – Material auf ${MATS[k].name} gesetzt.`;
}
```

- [ ] **Step 3: Sichtbarkeit** – in `syncVisibility` die Zeile `$('#matNote').textContent = MATS[mat].note;` ersetzen durch:

```js
  $('#matNote').textContent = (matMsg ? matMsg + ' ' : '') + MATS[mat].note;
  const BM = MATS[mat].boards;
  $('#row-sheet').hidden = $('#row-price').hidden = $('#row-grain').hidden = !!BM;
  $('#row-boards').hidden = !BM;
  if (BM) $('#boardList').innerHTML = BM.map(f => `<li>${f.L} × ${f.B} mm · CHF ${f.price.toFixed(2)}</li>`).join('');
  $('#sheetHint').textContent = BM
    ? `Ganze Bretter zum Stückpreis${MATS[mat].est ? ' (Preise geschätzt)' : ''}, nur abgelängt – die Regaltiefe richtet sich nach der Brettbreite.`
    : 'Kosten = Fläche der zugeschnittenen Teile × Preis pro m². Richtwerte (Stand Sept. 2026) – trag den Preis deines Händlers ein.';
```

- [ ] **Step 4: Start, Restore, Eingaben**
  - In `restore()` die beiden Zeilen `const cat = catalogValues(mat, $('#t').value);` / `for (const k in cat) $('#' + k).value = cat[k];` durch `const cat = catalogValues(mat, $('#t').value); applyCatalog(mat);` ersetzen. `cat` wird unten noch gebraucht.
  - Beim Start (`/* ---------- Start ---------- */`) `fillMaterials(); restore();` so lassen und direkt danach `syncMaterials();` einfügen.
  - Im `form.addEventListener('input', …)`-Handler: die Zeile `$('#sheetL').value = M.sheet[0]; $('#sheetB').value = M.sheet[1]; $('#price').value = matPrice(…);` ersetzen durch `applyCatalog(el.value);` (die Variable `M` darüber entfällt, falls sie sonst nicht gebraucht wird), und vor `syncVisibility(); render(); save();` einfügen:

```js
  if (el.name === 'mat') matMsg = '';
  if (el.name === 'kind') syncMaterials();
```

- [ ] **Step 5: Summary** – in `renderSummary` im `R.kind === 'reduit'`-Zweig die drei Zeilen «Platten», «Holz Zuschnitt ca.», «Holz ganze Platten ca.» ersetzen durch:

```js
    ${main.boards
      ? `<div><dt>Bretter</dt><dd>${main.sheets.length} × ${R.matShort}${back ? ` + ${back.sheets.length} × ${R.Bk.name}` : ''}</dd></div>
    <div><dt>Holz ganze Bretter ca.</dt><dd>${chf(whole + R.solidCost)}</dd></div>`
      : `<div><dt>Platten</dt><dd>${main.sheets.length} × ${R.matShort}${back ? ` + ${back.sheets.length} × ${R.Bk.name}` : ''}</dd></div>
    <div><dt>Holz Zuschnitt ca.</dt><dd>${chf(cost + R.solidCost)}</dd></div>
    <div><dt>Holz ganze Platten ca.</dt><dd>${chf(whole + R.solidCost)}</dd></div>`}
```

- [ ] **Step 6: Plattenansicht** – in `renderSheets` die Zeile `const [SL, SB] = g.sheet;` und die `html += \`<div class="sheetgrp">…` Kopfzeile ersetzen durch:

```js
    const waste = g.total ? Math.round((1 - g.used / g.total) * 100) : 0;
    let meta;
    if (g.boards) {
      const per = new Map();
      for (const s of g.sheets) { const k = `${s.L} × ${s.B}`; const e = per.get(k) || { n:0, price:s.price }; e.n++; per.set(k, e); }
      meta = [...per].map(([k, e]) => `${e.n} × ${k} mm à CHF ${e.price.toFixed(2)}`).join(' · ') + ` · total CHF ${Math.round(g.sheets.reduce((a, s) => a + s.price, 0))} · Rest ${waste} % · nur ablängen`;
    } else {
      const [SL, SB] = g.sheet;
      meta = `Platte ${SL} × ${SB} mm · ${g.sheets.length} Stück · Rest ${waste} % · Zuschnitt ${(g.partArea/1e6).toFixed(2)} m² × CHF ${g.price} = CHF ${Math.round(g.partArea/1e6*g.price)} · ganze Platten ${g.sheets.length} × ${(SL*SB/1e6).toFixed(2)} m² = CHF ${Math.round(g.sheets.length*SL*SB/1e6*g.price)}${g.rotate ? ' · drehen erlaubt' : ' · Maserung längs'}`;
    }
    html += `<div class="sheetgrp"><h3>${g.label}</h3><p class="meta">${meta}</p><div class="sheetlist">`;
```

  (Die alte Zeile `const waste = …` darüber entfernen.) In `g.sheets.forEach((sh, i) => {` als erste Zeile einfügen `const [SL, SB] = g.boards ? [sh.L, sh.B] : g.sheet;` und die `figcaption` ersetzen durch:

```js
      html += `<figure class="sheet"><figcaption><span>${g.boards ? `Brett ${i + 1} · ${sh.L} × ${sh.B}` : `Platte ${i + 1}`}</span><span>${sh.parts.length} Teile${g.boards ? ` · CHF ${sh.price.toFixed(2)}` : ''}</span></figcaption>
```

  `if (!g.sheets.length)` → Text bei Brettern: `${g.boards ? 'Kein Teil passt auf diese Bretter.' : 'Keine Teile auf diesem Format.'}`.

- [ ] **Step 7: Tests laufen lassen** – `node --test`. Erwartet: alles PASS (die Node-Tests prüfen `index.html` nicht, sie dürfen aber auch nicht brechen).

- [ ] **Step 8: Browser-Check** – Server starten: `python3 -m http.server 8765 &`. Dann dieses Skript als `$CLAUDE_JOB_DIR/tmp/ui-bretter.mjs` (oder `/tmp/ui-bretter.mjs`) speichern und ausführen:

```js
import { chromium } from '/Users/kim/repo/diy-furniture/tools/node_modules/patchright/index.mjs';
const b = await chromium.launch({ channel:'chrome', headless:true });
const p = await b.newPage(); const errs = [];
p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
const set = (sel, v) => p.evaluate(([s, v]) => { const el = document.querySelector(s); if (el.type === 'radio') el.checked = true; else el.value = v; el.dispatchEvent(new Event('input', { bubbles:true })); }, [sel, v]);
const opts = () => p.evaluate(() => [...document.querySelectorAll('#mat option')].map(o => o.value));
const vis = id => p.evaluate(i => !document.getElementById(i).closest('[hidden]'), id);
await p.goto('http://localhost:8765/'); await p.waitForTimeout(800);
console.log('Sideboard ohne Bretter:', !(await opts()).includes('gon_fichte'));
await set('#kind-reduit'); await p.waitForTimeout(300);
console.log('Reduit mit Brettern:', (await opts()).includes('gon_fichte'));
await set('#mat', 'gon_fichte'); await p.waitForTimeout(500);
console.log('Felder ausgeblendet:', !(await vis('sheetL')) && !(await vis('price')) && await vis('boardList'));
console.log('Summary:', await p.evaluate(() => document.getElementById('summary').innerText.replace(/\s+/g, ' ')));
console.log('Plattenansicht:', await p.evaluate(() => document.querySelector('#sheets .meta')?.textContent));
await set('#kind-sideboard'); await p.waitForTimeout(300);
console.log('Zurück zum Sideboard:', await p.evaluate(() => [document.getElementById('mat').value, document.getElementById('matNote').textContent.slice(0, 60)]));
await p.reload(); await p.waitForTimeout(800);
console.log('Nach Reload:', await p.evaluate(() => [document.querySelector('input[name=kind]:checked').value, document.getElementById('mat').value, !document.getElementById('row-price').hidden]));
console.log('Fehler:', errs.length ? errs : 'keine');
await b.close();
```

  Erwartet: Sideboard ohne Bretter `true`, Reduit mit Brettern `true`, Felder ausgeblendet `true`, die Summary enthält «Holz ganze Bretter ca.», die Plattenansicht beginnt mit «n × 2000 × 400 mm à CHF 20.50» oder ähnlich. «Zurück zum Sideboard» zeigt ein Plattenmaterial und den Hinweis «Ganze Bretter gibt es nur beim Reduit», «Nach Reload» zeigt `sideboard`, ein Plattenmaterial und `true`. Fehler: keine. Danach den Server beenden: `pkill -f "http.server 8765"`.

- [ ] **Step 9: Commit**

```bash
git add index.html
git commit -m "feat: Brett-Materialien im Formular, Summary und Plattenansicht"
```

---

### Task 6: Jumbo-Skript für ganze Bretter

**Files:**
- Modify: `tools/jumbo-preise.mjs` (Best-Price-Leser, Brett-Quellen, Schreiben)
- Modify: `tools/jumbo-quellen.json` (eine URL pro Format)

**Interfaces:**
- Consumes: `PREISE.bretter` (Task 1), `tools/preise-datei.cjs`.
- Produces: `node jumbo-preise.mjs [--schreiben] [schlüssel …]` behandelt Schlüssel der Form `"<material> <L>x<B>"` als Brett-Quelle. Die Suche zeigt «Preis: Produktseite», wenn die Liste keinen Preis nennt.

- [ ] **Step 1: Quellen eintragen** – in `tools/jumbo-quellen.json` vor der schliessenden Klammer ergänzen (URLs aus der Suche vom 25.09.2026):

```json
  "gon_fichte 1200x200":  { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/massivholzplatten/goon-leimholzplatte-fichte-1200-x-200-x-18-mm/p/6901089" },
  "gon_fichte 1200x400":  { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/massivholzplatten/goon-leimholzplatte-fichte-1200-x-400-x-18-mm/p/6901087" },
  "gon_fichte 2000x200":  { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/massivholzplatten/goon-leimholzplatte-fichte-2000-x-200-x-18-mm/p/6901083" },
  "gon_fichte 2000x400":  { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/massivholzplatten/goon-leimholzplatte-fichte-2000-x-400-x-18-mm/p/6901081" },
  "regalbau 1150x200":    { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/regalbauplatte-weiss-fsc-100-16x-1150-x-200-mm/p/7335166" },
  "regalbau 1150x250":    { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/regalbauplatte-weiss-fsc-100-16x-1150-x-250-mm/p/7335167" },
  "regalbau 1150x300":    { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/regalbauplatte-weiss-fsc-100-16x-1150-x-300-mm/p/7335168" },
  "regalbau 1150x400":    { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/regalbauplatte-weiss-fsc-100-16x-1150-x-400-mm/p/7335169" },
  "regalbau 1150x500":    { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/regalbauplatte-weiss-fsc-100-16x-1150-x-500-mm/p/7335170" },
  "regalbau 1150x600":    { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/regalbauplatte-weiss-fsc-100-16x-1150-x-600-mm/p/7335171" },
  "mood_fichte 800x300":  { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/massivholzplatten/mood-leimholzplatte-fichte-a-800-x-300-x-18-mm/p/6901185" },
  "mood_fichte 800x400":  { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/massivholzplatten/mood-leimholzplatte-fichte-a-800-x-400-x-18-mm/p/6895153" },
  "mood_fichte 800x600":  { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/massivholzplatten/mood-leimholzplatte-fichte-a-800-x-600-x-18-mm/p/6901189" },
  "mood_fichte 1200x200": { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/massivholzplatten/mood-leimholzplatte-fichte-a-1200-x-200-x-18-mm/p/6901191" },
  "mood_fichte 1200x300": { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/massivholzplatten/mood-leimholzplatte-fichte-a-1200-x-300-x-18-mm/p/6901193" },
  "mood_fichte 1200x400": { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/massivholzplatten/mood-leimholzplatte-fichte-a-1200-x-400-x-18-mm/p/6903870" },
  "mood_fichte 1200x500": { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/massivholzplatten/mood-leimholzplatte-fichte-a-1200-x-500-x-18-mm/p/6901197" },
  "mood_fichte 1200x600": { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/massivholzplatten/mood-leimholzplatte-fichte-a-1200-x-600-x-18-mm/p/6901199" },
  "mood_fichte 2000x200": { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/massivholzplatten/mood-leimholzplatte-fichte-a-2000-x-200-x-18-mm/p/6901201" },
  "mood_fichte 2000x300": { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/massivholzplatten/mood-leimholzplatte-fichte-a-2000-x-300-x-18-mm/p/6901203" },
  "mood_fichte 2000x400": { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/massivholzplatten/mood-leimholzplatte-fichte-a-2000-x-400-x-18-mm/p/6901350" },
  "mood_fichte 2000x500": { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/massivholzplatten/mood-leimholzplatte-fichte-a-2000-x-500-x-18-mm/p/6901205" },
  "mood_fichte 2000x600": { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/massivholzplatten/mood-leimholzplatte-fichte-a-2000-x-600-x-18-mm/p/6901207" },
  "mood_fichte 2500x300": { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/massivholzplatten/mood-leimholzplatte-fichte-a-2500-x-300-x-18-mm/p/6901209" },
  "mood_fichte 2500x400": { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/massivholzplatten/mood-leimholzplatte-fichte-a-2500-x-400-x-18-mm/p/6901211" },
  "mood_fichte 2500x600": { "url": "https://www.jumbo.ch/de/bauen-renovieren/holz/holzplatten/massivholzplatten/mood-leimholzplatte-fichte-a-2500-x-600-x-18-mm/p/6901213" }
```

  Die go/on-3-Schicht-URLs sind noch unbekannt. Step 5 sucht sie.

- [ ] **Step 2: Best-Price-Leser** – in `tools/jumbo-preise.mjs` nach `perM2` einfügen:

```js
// Produktseite eines ganzen Bretts: Stückpreis («BEST PRICE» im Text oder JSON-LD), Masse aus dem Namen.
async function readBoardPage(page, url) {
  await open(page, url);
  await page.waitForSelector('h1', { timeout:30000 });
  await page.waitForTimeout(1500);
  return page.evaluate(() => {
    const name = document.querySelector('h1')?.textContent.trim() || '';
    const text = document.body.innerText;
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent).join(' ').match(/"price"\s*:\s*"?([\d.]+)/);
    const best = text.match(/BEST\s*PRICE\s*([\d'.]+)/i) || text.match(/([\d'.]+)(?:\.-)?\s*\n+\s*(?:inkl\.|Mit Supercard)/);
    const price = Number((ld && ld[1]) || (best && best[1].replace(/'/g, ''))) || null;
    const d = name.match(/(\d+)\s*x\s*(\d+)(?:\s*x\s*(\d+))?\s*(mm|cm)/i);
    const f = d && /cm/i.test(d[4]) ? 10 : 1;
    const dims = d ? [d[1], d[2], d[3]].filter(Boolean).map(Number).map(v => v * f) : [];
    const thick = text.match(/(?:Stärke|Dicke|Plattenstärke)[^\d]{0,20}(\d+(?:[.,]\d+)?)\s*mm/i);
    return { name, price, dims, thick: thick ? Number(thick[1].replace(',', '.')) : null };
  });
}
```

  In `search()` die Ausgabezeile so ändern, dass leere Preise «Preis: Produktseite» zeigen: `${(r.price || 'Preis: Produktseite').padStart(8)}`.

- [ ] **Step 3: Brett-Quellen lesen und vergleichen** – nach `prices()` einfügen:

```js
// Ganze Bretter: Schlüssel «<material> <L>x<B>», eine Produktseite pro Format.
async function boardPrices(page, keys) {
  const rows = [];
  for (const key of keys) {
    const [mat, fmt] = key.split(' '), [L, B] = fmt.split('x').map(Number);
    const E = DATA.bretter && DATA.bretter[mat];
    if (!E) console.warn(`«${mat}» gibt es in preise.js noch nicht unter bretter – nur lesen`);
    const cur = E && E.formate.find(f => f.L === L && f.B === B);
    const p = await readBoardPage(page, SOURCES[key].url);
    rows.push({ key, mat, L, B, price:p.price, was:cur ? cur.price : undefined, name:p.name, thick:p.thick, note: p.price ? null : 'kein Preis gelesen (Bot-Prüfung?) – später nochmals' });
    await sleep(PAUSE);
  }
  console.log('\nBrett                    Jumbo CHF   preise.js   Stärke  Produkt');
  for (const r of rows) {
    const flag = r.price !== r.was ? '*' : ' ';
    console.log(`${flag}${r.key.padEnd(24)} ${String(r.price ?? '–').padStart(9)}   ${String(r.was ?? 'neu').padStart(9)}   ${String(r.thick ?? '–').padStart(6)}  ${r.name}${r.note ? '  · ' + r.note : ''}`);
  }
  return rows;
}
```

- [ ] **Step 4: Schreiben** – in `write(rows)` ganz am Anfang der Schleife über die Schlüssel Brett-Zeilen überspringen: `if (key.includes(' ')) continue;`. Vor `writeFileSync(FILE, format(DATA));` einfügen:

```js
  for (const r of rows.filter(r => r.mat && r.price)) {
    const E = DATA.bretter[r.mat], f = E && E.formate.find(x => x.L === r.L && x.B === r.B);
    if (!E) continue;
    if (!f) { console.warn(`${r.key}: Format fehlt in preise.js – von Hand aufnehmen`); continue; }
    if (f.price !== r.price) changed.push(`${r.key}: ${f.price} → ${r.price}`);
    f.price = r.price; E.stand = today;
  }
```

  Den Aufruf unten ersetzen durch:

```js
  else {
    const all = cmd ? [cmd, ...args] : Object.keys(SOURCES);
    // Ein Material-Schlüssel ohne Format («mood_fichte») wählt alle seine Formate.
    const expand = k => k.includes(' ') || SOURCES[k] ? [k] : Object.keys(SOURCES).filter(s => s.startsWith(k + ' '));
    const keys = all.flatMap(expand);
    const rows = [...await prices(page, keys.filter(k => !k.includes(' '))), ...await boardPrices(page, keys.filter(k => k.includes(' ')))];
    if (doWrite) write(rows);
  }
```

  `prices()` mit leerer Liste muss funktionieren: Die Tabelle wird dann trotzdem gedruckt, das ist in Ordnung. Den Kopfkommentar des Skripts um diese Zeile ergänzen: `Bretter:     node jumbo-preise.mjs gon_fichte                          → alle Formate eines Brett-Materials (Schlüssel «material LxB» in jumbo-quellen.json)`.

- [ ] **Step 5: Lauf und go/on 3-Schicht** (sichtbares Chrome, einige Minuten):

```bash
cd tools
node jumbo-preise.mjs suche "Go/on 3-Schicht Fichte"
```

  Die zwei URLs (1200 × 600 und 2500 × 600) als `"gon_3s 1200x600"` / `"gon_3s 2500x600"` in `jumbo-quellen.json` eintragen. Dann:

```bash
node jumbo-preise.mjs --schreiben gon_fichte gon_3s regalbau mood_fichte
cd .. && git diff preise.js && node --test
```

  Erwartet: Die Preise stimmen mit Task 1 überein, oder die Abweichungen sind mit `*` markiert und nachgeführt. Seiten, auf denen kein Preis gelesen wurde, erscheinen mit Hinweis und bleiben unverändert. `node --test` ist PASS.

- [ ] **Step 6: Commit**

```bash
git add tools/jumbo-preise.mjs tools/jumbo-quellen.json preise.js
git commit -m "feat: Jumbo-Skript liest Best Price ganzer Bretter und führt preise.js nach"
```

---

### Task 7: Oecoplan Möbelplatte weiss (nach Stärkenprüfung)

**Files:**
- Modify: `tools/jumbo-quellen.json`, `preise.js`, `shared.js` (MAT_INFO), `reduit.js` (SPAN)

**Interfaces:**
- Consumes: `readBoardPage`/`boardPrices` (Task 6), `boardMat` (Task 2).
- Produces: Material `moebel_weiss` (nur wenn die Stärke ≥ 16 mm ist).

- [ ] **Step 1: Quellen eintragen** – in `tools/jumbo-quellen.json`:

```json
  "moebel_weiss 2600x250": { "url": "https://www.jumbo.ch/de/wohnen-licht/wohn-accessoires/holzfotowand/oecoplan-moebelplatte-260x25-cm-weiss/p/6416987" },
  "moebel_weiss 2600x300": { "url": "https://www.jumbo.ch/de/wohnen-licht/wohn-accessoires/holzfotowand/oecoplan-moebelplatte-260x30-cm-weiss/p/6416988" },
  "moebel_weiss 2600x400": { "url": "https://www.jumbo.ch/de/wohnen-licht/wohn-accessoires/holzfotowand/oecoplan-moebelplatte-260x40-cm-weiss/p/6416989" },
  "moebel_weiss 2600x500": { "url": "https://www.jumbo.ch/de/wohnen-licht/wohn-accessoires/holzfotowand/oecoplan-moebelplatte-260x50-cm-weiss/p/6416990" },
  "moebel_weiss 2600x600": { "url": "https://www.jumbo.ch/de/wohnen-licht/wohn-accessoires/holzfotowand/oecoplan-moebelplatte-260x60-cm-weiss/p/6416991" }
```

- [ ] **Step 2: Stärke lesen** – `cd tools && node jumbo-preise.mjs "moebel_weiss 2600x400"`. `boardPrices` liest auch Produkte, die noch nicht in `preise.js` stehen, und druckt die Spalte «Stärke».

  **Entscheid:** Ist die Stärke < 16 mm oder «–» (nicht erkennbar) → **anhalten und die Person fragen**, ob die Möbelplatte wegfällt. Fällt sie weg, die Einträge aus Step 1 wieder entfernen und direkt mit Task 8 weitermachen.

- [ ] **Step 3: Daten und Material** (nur bei Stärke ≥ 16, hier `T` = gelesene Stärke):

```bash
cd .. && node -e '
const { FILE, format } = require("./tools/preise-datei.cjs"); const P = require("./preise.js");
const T = Number(process.argv[1]), f = (B, price) => ({ L:2600, B, price });
P.bretter.moebel_weiss = { t:T, formate:[f(250,22.95), f(300,25.95), f(400,31.95), f(500,37.5), f(600,47.5)], stand:"2026-09-25", quelle:"Oecoplan Möbelplatte weiss (Wohn-Accessoires)" };
require("fs").writeFileSync(FILE, format(P));' T
```

  In `shared.js` → `MAT_INFO` nach `regalbau`:

```js
  moebel_weiss: { name:'Möbelplatte weiss', short:'Möbelplatte', color:'#F1F0EB', ply:false, grain:false, coated:true, boards:true,
            note:'Weiss beschichtet, 2600 lang und 250 bis 600 breit – ähnlich günstig wie die Regalbauplatte, aber lang genug für die meisten Reduit-Wände.' },
```

  In `reduit.js` → `SPAN`: `moebel_weiss:{ T:<Wert> },` mit dem Wert von `dekorspan` bei gleicher Stärke (16 → 400, 19 → 500), sonst linear dazwischen bzw. 18 → 470.

- [ ] **Step 4: Tests** – `node --test`. Erwartet: PASS. Die Tests «jede Material-Stärke hat einen Spannweiten-Wert» und «bretter.x ohne Material» decken den neuen Eintrag ab.

- [ ] **Step 5: Commit**

```bash
git add tools/jumbo-quellen.json preise.js shared.js reduit.js
git commit -m "feat: Oecoplan Möbelplatte weiss als Brett-Material"
```

---

### Task 8: Doku

**Files:**
- Modify: `docs/WEITERARBEIT.md`, `README.md`

- [ ] **Step 1: WEITERARBEIT.md** – den Punkt «**Ganze Bretter/Platten in festen Formaten**» unter «Noch offen» auf `[x]` setzen und kürzen auf: «erledigt fürs Reduit (Spec `docs/superpowers/specs/2026-09-25-feste-formate-design.md`). Offen: Sideboard mit Brettern, Längsschnitte (`laengs:true` pro Produkt), Mood Eiche.» Unter «Preise» ergänzen:

```md
- Ganze Bretter: `preise.js` → `bretter` (Stärke, Formate mit Stückpreis). Nur ablängen, Teilbreite = Brettbreite (Toleranz 15 mm), nur beim Reduit. Die Regaltiefe rastet auf die Brettbreite ein; lange Tablare werden 45 mm neben einer Stütze gestossen (Stossleiste darunter).
- Nachführen: `node jumbo-preise.mjs --schreiben gon_fichte mood_fichte …` (Schlüssel «material LxB» in `jumbo-quellen.json`, «Best Price» steht nur auf der Produktseite).
```

  Im Abschnitt «Ideen» die Einträge «Günstige ganze Platten» und «Leimholzbrett Fichte in Standardbreiten» entfernen (erledigt).

- [ ] **Step 2: README.md** – bei `preise.js` ergänzen: `(… including whole boards in fixed sizes for the Reduit)`.

- [ ] **Step 3: Tests und Commit**

```bash
node --test
git add docs/WEITERARBEIT.md README.md
git commit -m "docs: ganze Bretter im Reduit"
```
