# Ansichten und Ablauf Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Der Konfigurator bekommt vier Orte (Entwerfen · Einkaufen · Bauen · Sammlung) mit Hash-Navigation, einen Entwurf pro Möbeltyp, eine abhakbare Einkaufsliste, «Rückgängig» beim Laden und Zufall, eine Sammlung als Variantenliste und die Möbelwahl «Was baust du?» im Kopf.

**Architecture:** Logik ohne DOM kommt in `konfig.js` (Entwürfe, Gesamtkosten, Vergleich, Sortierung, Ort aus Hash) und in die neue Datei `einkauf.js` (Einkaufsliste, Text, Haken). Beide werden mit `node --test` getestet. `index.html` verdrahtet nur: Speicher, Panels, Router, Leiste, Dialog. DOM-Schritte werden im Browser geprüft (kein DOM-Testsetup im Repo).

**Tech Stack:** Vanilla JS ohne Build, three.js r128 vom CDN, `node --test` (Node 18+), localStorage.

**Spec:** `docs/superpowers/specs/2026-09-26-ansichten-design.md`

## Global Constraints

- Kein Build, keine Abhängigkeiten. Neue JS-Dateien laden per `<script src>` und exportieren für Node mit `if (typeof module !== 'undefined') module.exports = {…}` (Muster wie `konfig.js`).
- Tests: `node --test` im Repo-Stamm. Vor jedem Commit müssen alle Tests laufen (Stand vor dem Plan: 71 Tests grün). `test/sideboard.snapshot.test.js` darf sich nicht ändern.
- Lokal prüfen: `python3 -m http.server 8000` → http://localhost:8000/, nach JS-Änderungen **Ctrl+Shift+R**. Handy-Ansicht über DevTools mit ≤ 920 px Breite.
- Texte auf Deutsch (Schweiz): «ss» statt «ß», Anführungszeichen «…».
- Schmal = `matchMedia('(max-width: 920px)')` (gleich wie heute `narrow`).
- Hashes der Orte, wörtlich: `#entwerfen`, `#einkaufen`, `#bauen`, `#sammlung`.
- localStorage-Schlüssel: bestehend `sideboard-werkbank-v2` (nur noch lesen zur Migration), `…-sammlung` (unverändert). Neu: `…-entwuerfe`, `…-aktiv`, `…-haken`, `…-bau`, `…-sort`. `…-tab` entfällt.
- Jeder Zugriff auf localStorage in `try { … } catch (e) {}` (Muster im Bestand).
- Commit-Nachrichten im Stil des Repos (`feat: …`, `fix: …`, `docs: …`), am Ende `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.

## Review Focus

1. **Bestehender Nutzer mit altem Speicher** (nur `sideboard-werkbank-v2`, z. B. ein Reduit): Er soll ohne Auswahl-Dialog direkt in seinem Reduit landen. Getestet in Task 1 (`entwuerfeLaden` migriert), im Browser in Task 8 Schritt «alter Speicher».
2. **Typwechsel mit Brett-Material:** Reduit auf go/on Fichte → Sideboard → zurück zum Reduit. go/on Fichte muss wieder da sein, und es darf kein Hinweis «Material gesetzt» erscheinen. Getestet in Task 1 (`entwurfSetzen` hält beide Typen getrennt) und im Browser in Task 1.
3. **Einkaufsliste bei gleichem Inhalt:** Nach einer Änderung, die eine Zeile nicht betrifft (z. B. Frontfarbe), müssen deren Haken bleiben. Geänderte Zeilen (andere Menge) werden frei. Getestet in Task 5 (`hakenFiltern`, ids aus dem Zeileninhalt).
4. **Rückgängig nach dem Laden einer Variante des anderen Typs:** Beide Entwürfe müssen wieder genau wie vorher sein. Getestet im Browser in Task 3 (Schritt «anderer Typ»).
5. **Zurück-Taste auf dem Handy:** Einkaufen → Bauen → Zurück → Einkaufen → Zurück → Entwerfen. Ein offener Auswahl-Dialog schliesst mit Zurück, ohne den Ort zu wechseln. Getestet in Task 7 (`ortAusHash`) und im Browser in Task 7 und Task 8.

---

## Dateien

| Datei | Änderung |
|---|---|
| `konfig.js` | + `entwuerfeLaden`, `entwurfSetzen`, `kostenGesamt`, `geaendert`, `sortiere`, `ortAusHash`. `sammlungEintrag` nutzt `kostenGesamt`. |
| `einkauf.js` (neu) | `einkaufsliste(R)`, `listeText(liste, titel)`, `hakenFiltern(haken, liste)` |
| `index.html` | Speicher pro Typ, Rückgängig, Sammlung, Panels Einkaufen/Bauen, Router, Leiste, Dialog «Was baust du?» |
| `test/konfig.test.js` | Tests zu den neuen Funktionen in `konfig.js` |
| `test/einkauf.test.js` (neu) | Tests zu `einkauf.js` |
| `docs/WEITERARBEIT.md` | Tabelle «Aufbau» und Speicher-Schlüssel nachführen |

Die Zeilennummern unten beziehen sich auf `index.html` bei `eb3a08b`. Nach früheren Tasks verschieben sie sich, darum immer über den zitierten Code suchen.

---

### Task 1: Ein Entwurf pro Möbeltyp

**Files:**
- Modify: `konfig.js` (vor `/* ---------- Sammlung ---------- */`, Export am Ende)
- Modify: `index.html` (Formular-Speicher ~Z. 800–915, `onInput` ~Z. 1325–1345, `applyData` ~Z. 1476, Start ~Z. 1553)
- Test: `test/konfig.test.js`

**Interfaces:**
- Produces: `entwuerfeLaden(neu, alt) → { kind, [kind]: data, … } | null`, `entwurfSetzen(e, data) → e'` (neues Objekt). In `index.html`: `let entwuerfe`, `const DEFAULTS`, `const ENTW = STORE + '-entwuerfe'`, `function wechsleTyp(kind)`, `function placePills()`.

- [ ] **Step 1: Failing tests schreiben** (ans Ende von `test/konfig.test.js`)

```js
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
```

- [ ] **Step 2: Tests laufen lassen, sie müssen scheitern**

Run: `node --test test/konfig.test.js`
Expected: FAIL mit `K.entwuerfeLaden is not a function`

- [ ] **Step 3: Implementieren in `konfig.js`** (vor dem Sammlung-Block)

```js
/* ---------- Entwürfe ---------- */
// Ein Entwurf pro Möbeltyp: { kind: aktueller Typ, sideboard: Formularwerte, reduit: Formularwerte }.
// alt = der frühere Einzelentwurf (localStorage sideboard-werkbank-v2); er wird unter seinem Typ abgelegt.
function entwuerfeLaden(neu, alt){
  if (neu && neu.kind && neu[neu.kind]) return neu;
  if (alt && typeof alt === 'object') { const kind = alt.kind || 'sideboard'; return { kind, [kind]: { ...alt, kind } }; }
  return null;
}
function entwurfSetzen(e, data){
  const kind = data.kind || 'sideboard';
  return { ...(e || {}), kind, [kind]: data };
}
```

Export ergänzen: `module.exports = { cfgFromData, withCatalog, computeData, zufall, sammlungEintrag, HARMLOS, entwuerfeLaden, entwurfSetzen };`

- [ ] **Step 4: Tests laufen lassen**

Run: `node --test`
Expected: alle PASS (74)

- [ ] **Step 5: `index.html` auf Entwürfe umstellen**

a) Unter `const STORE = 'sideboard-werkbank-v2';` einfügen:

```js
const ENTW = STORE + '-entwuerfe';
let entwuerfe = null;   // { kind, sideboard, reduit } – siehe entwuerfeLaden in konfig.js
let DEFAULTS = null;    // Formularwerte beim Laden der Seite, Start für einen Typ ohne Entwurf
```

b) `save()` ersetzen:

```js
function save(){
  entwuerfe = entwurfSetzen(entwuerfe, formData());
  try { localStorage.setItem(ENTW, JSON.stringify(entwuerfe)); } catch (e) {}
}
```

c) `stored()` bleibt, ist aber nur noch für die Migration da. Kommentar darüber: `// Früherer Einzelentwurf, nur noch zum Übernehmen in ENTW.` `restore` bekommt keinen Standardwert mehr: `function restore(data){`.

d) `matMsg` entfernen, weil jeder Typ sein Material mitbringt:
- `let matMsg = '';` löschen.
- In `syncMaterials()` die Zeile `if (MATS[cur]) matMsg = …;` löschen. Die Rückfallebene (Material nicht wählbar → erstes Material) bleibt für kaputte Daten.
- In `syncVisibility()`: `` $('#matNote').textContent = `${priceNote} · ${MATS[mat].note}`; ``
- In `onInput()` die Zeilen `// Der Hinweis nach einem Typwechsel …`, `matMsg = '';` und `if (el.name === 'kind') syncMaterials();` löschen.

e) Typwechsel. Ganz oben in `onInput(e)`, direkt nach `const el = e.target;`:

```js
  // Typwechsel: der Entwurf des alten Typs ist schon gespeichert (save() bei jeder Eingabe).
  if (el.name === 'kind') { wechsleTyp(el.value); return; }
```

Nach `applyData` (Block «Zufall und Sammlung») einfügen:

```js
// Wechselt zum Entwurf des Typs; ohne Entwurf mit den Startwerten der Seite.
function wechsleTyp(kind){
  applyData(entwuerfe && entwuerfe[kind] || { ...DEFAULTS, kind });
}
```

f) Markierung der Auswahlfelder nach programmatischem Setzen. Neben `placePill` einfügen:

```js
function placePills(){ for (const seg of document.querySelectorAll('.seg')) placePill(seg, false); }
```

und in `applyData` nach `render();` `placePills();` aufrufen:

```js
function applyData(data){
  restore(data); syncMaterials(); syncVisibility();
  three.userMoved = false;
  render(); save(); placePills();
}
```

g) Start (unten, `/* ---------- Start ---------- */`) ersetzen:

```js
fillMaterials();
restore(null);
DEFAULTS = formData();
try { entwuerfe = entwuerfeLaden(JSON.parse(localStorage.getItem(ENTW) || 'null'), stored()); } catch (e) { entwuerfe = entwuerfeLaden(null, stored()); }
const erstBesuch = !entwuerfe;   // Task 8 öffnet dann «Was baust du?»
restore(entwuerfe && entwuerfe[entwuerfe.kind]);
syncMaterials();
syncVisibility();
try { const tb = localStorage.getItem(STORE + '-tab'); if (tb && $('#' + tb)) selectTab(tb); } catch (e) {}
initThree();
render();
save();          // ab hier gibt es immer einen Entwurf (Rückgängig und Typwechsel verlassen sich darauf)
renderColl();
requestAnimationFrame(() => form.classList.add('ready'));
```

(Die Zeile mit `-tab` fällt erst in Task 7 weg.)

- [ ] **Step 6: Im Browser prüfen**

`python3 -m http.server 8000`, http://localhost:8000/, Ctrl+Shift+R.
1. Reduit wählen, Material «go/on Fichte · ganze Bretter», Breite 1800.
2. Sideboard wählen → Material ist das Sideboard-Material, **kein** Hinweis «Ganze Bretter gibt es nur …».
3. Reduit wählen → go/on Fichte und Breite 1800 sind wieder da, die Markierung der Auswahlfelder sitzt auf den richtigen Optionen.
4. Seite neu laden → der Reduit-Entwurf ist offen.
5. DevTools → Application → localStorage: `sideboard-werkbank-v2-entwuerfe` hat `kind`, `sideboard`, `reduit`.

- [ ] **Step 7: Commit**

```bash
git add konfig.js index.html test/konfig.test.js
git commit -m "feat: ein Entwurf pro Möbeltyp, Material bleibt beim Typwechsel"
```

---

### Task 2: Gesamtpreis (Holz + Kaufteile) überall gleich

**Files:**
- Modify: `konfig.js` (`sammlungEintrag`, Export)
- Modify: `index.html` (`renderSummary` ~Z. 931–955)
- Test: `test/konfig.test.js`

**Interfaces:**
- Produces: `kostenGesamt(R) → Number` (CHF, ungerundet) = `sheetCosts(R.groups).cut + (R.solidCost || 0) + (R.buyCost || 0)`.

- [ ] **Step 1: Failing test**

```js
test('kostenGesamt = Holz im Zuschnitt + Latten + Kaufteile, gleich wie in der Sammlung', () => {
  const R = K.computeData({ ...FORM, kind:'reduit' });
  const { cut } = sheetCosts(R.groups);
  assert.strictEqual(K.kostenGesamt(R), cut + R.solidCost + R.buyCost);
  assert.ok(R.buyCost > 0);
  assert.strictEqual(K.sammlungEintrag(FORM, K.computeData(FORM)).info.kosten, Math.round(K.kostenGesamt(K.computeData(FORM))));
});
```

- [ ] **Step 2: Laufen lassen** – `node --test test/konfig.test.js` → FAIL `K.kostenGesamt is not a function`

- [ ] **Step 3: Implementieren in `konfig.js`**

Vor `sammlungEintrag`:

```js
// Was das Möbel kostet: Holz im Zuschnitt bzw. ganze Bretter, Latten und Kaufteile (Reduit).
function kostenGesamt(R){
  return sheetCosts(R.groups).cut + (R.solidCost || 0) + (R.buyCost || 0);
}
```

In `sammlungEintrag` die zwei Zeilen `const { cut } = …` und `const kosten = …` ersetzen durch `const kosten = Math.round(kostenGesamt(R));`. `kostenGesamt` exportieren.

- [ ] **Step 4: `renderSummary` in `index.html`**

Der Preis in der Leiste und der Hauptpreis im Kopf zeigen das Total. Holz und Kaufteile stehen darunter. Diese Zeilen ersetzen:

```js
    (boards ? item('Holz ganze Bretter ca.', `<b>${chf(woodWhole)}</b>`, 'price')
            : item('Holz Zuschnitt ca.', `<b>${chf(wood)}</b><small>ganze Platten ${chf(woodWhole)}</small>`, 'price')) +
    (reduit ? item('Kaufteile ca.', `<b>${chf(R.buyCost)}</b>`, 'price') : '');
  $('#mPrice').textContent = chf(wood);
  $('#mMeta').textContent = reduit ? `+ ${chf(R.buyCost)} Kaufteile · ${woodName}` : `${woodName} · ${parts} Teile`;
```

durch:

```js
    item('Total ca.', `<b>${chf(kostenGesamt(R))}</b><small>${woodName} ${chf(wood)}${reduit ? ` · Kaufteile ${chf(R.buyCost)}` : ''}${boards ? '' : ` · ganze Platten ${chf(woodWhole)}`}</small>`, 'price');
  $('#mPrice').textContent = chf(kostenGesamt(R));
  $('#mMeta').textContent = reduit ? `${woodName} ${chf(wood)} · Kaufteile ${chf(R.buyCost)}` : `${woodName} · ${parts} Teile`;
```

- [ ] **Step 5: Tests + Browser**

`node --test` → alle PASS. Browser: Reduit U-Form → «Total ca.» = Holz + Kaufteile (nachrechnen, auf 5 gerundet). Ein Eintrag in der Sammlung zeigt denselben Betrag wie «Total».

- [ ] **Step 6: Commit**

```bash
git add konfig.js index.html test/konfig.test.js
git commit -m "feat: Gesamtpreis Holz + Kaufteile in Kopf, Leiste und Sammlung"
```

---

### Task 3: Rückgängig für Laden und Zufall

**Files:**
- Modify: `index.html` (Block «Zufall und Sammlung» ~Z. 1470–1550, Kopf ~Z. 396, Leiste ~Z. 773)

**Interfaces:**
- Consumes: `entwuerfe`, `applyData`, `wechsleTyp` (Task 1).
- Produces: `applyData(data, { undo })`, `function rueckgaengig()`, `let vorher`, CSS-Klasse `.js-msg` (ersetzt `.js-sammelmsg`).

- [ ] **Step 1: Meldungsfeld umbenennen**

In `index.html` jedes `js-sammelmsg` durch `js-msg` ersetzen (Kopf `.hacts`, Leiste `.mbar`, `flash('.js-sammelmsg', …)`, `document.querySelectorAll('.js-sammelmsg')`). Die Meldungen gelten jetzt für mehr als das Sammeln.

- [ ] **Step 2: `applyData` merkt sich den Zustand davor**

```js
// Formular komplett neu setzen (Laden, Zufall, Typwechsel) und Kamera neu ausrichten.
// undo: Zustand davor merken, damit «Rückgängig» ihn zurückholt (beide Entwürfe und die geladene Variante).
let vorher = null;
function applyData(data, { undo = false } = {}){
  if (undo) vorher = { entwuerfe: JSON.parse(JSON.stringify(entwuerfe)), aktiv };
  restore(data); syncMaterials(); syncVisibility();
  three.userMoved = false;
  render(); save(); placePills();
}
function rueckgaengig(){
  if (!vorher) return;
  const v = vorher; vorher = null;
  entwuerfe = v.entwuerfe; aktiv = v.aktiv;
  applyData(entwuerfe[entwuerfe.kind]);
  renderColl();
  flash('.js-msg', 'Wiederhergestellt.');
}
```

`let coll = [], aktiv = null, entfernt = null;` muss **vor** `applyData` stehen. Die Zeile an den Anfang des Blocks «Zufall und Sammlung» verschieben (die `COLL`-Konstante und das Laden aus localStorage mit).

- [ ] **Step 3: Zufall und Laden mit Rückgängig**

```js
const undoBtn = '<button type="button" class="linkbtn" data-undo>Rückgängig</button>';
$('#bZufall').addEventListener('click', () => {
  applyData(zufall(formData()), { undo:true });
  flash('.js-msg', `Neu gewürfelt. ${undoBtn}`);
});
```

Im Klick-Handler von `#collList`, Zweig `laden`:

```js
  if (act === 'laden') {
    applyData(e.data, { undo:true }); aktiv = e.id;
    flash('.js-msg', `«${esc(e.name)}» geladen. ${undoBtn}`);
  }
```

(Reihenfolge wichtig: Zuerst `applyData` mit dem alten `aktiv` im Rückgängig-Speicher, danach `aktiv` setzen.)

Den Klick-Handler der Meldungen erweitern:

```js
for (const m of document.querySelectorAll('.js-msg')) m.addEventListener('click', ev => {
  if (ev.target.hasAttribute('data-undo')) return rueckgaengig();
  const id = ev.target.dataset.go;
  if (id) { selectTab(id); $('#' + id).scrollIntoView({ block:'nearest', behavior:'smooth' }); }
});
```

(`data-go` wird in Task 7 auf Orte umgestellt.)

- [ ] **Step 4: Im Browser prüfen**

1. Sideboard 1200 breit, Zufall → Meldung «Neu gewürfelt. Rückgängig» → Rückgängig → wieder 1200, Meldung «Wiederhergestellt.».
2. Variante sammeln, Breite ändern, in der Sammlung «Laden» → Meldung «… geladen. Rückgängig» → Rückgängig → geänderte Breite ist zurück.
3. **Anderer Typ:** Sideboard-Variante sammeln. Zum Reduit wechseln, Breite 2000. Die Sideboard-Variante laden (Typ springt auf Sideboard) → Rückgängig → Reduit mit 2000 offen. Zum Sideboard wechseln → der Sideboard-Entwurf ist der von vor dem Laden.

- [ ] **Step 5: Tests + Commit**

Run: `node --test` → alle PASS

```bash
git add index.html
git commit -m "feat: Rückgängig nach Laden und Zufall"
```

---

### Task 4: Sammlung als Varianten (ohne Summe, sortierbar, «geändert»)

**Files:**
- Modify: `konfig.js` (+ `geaendert`, `sortiere`)
- Modify: `index.html` (Sammlung-Panel ~Z. 764, `renderColl`, `sammeln`, Kopf `.hacts`, Leiste)
- Test: `test/konfig.test.js`

**Interfaces:**
- Produces: `geaendert(a, b) → Boolean` (vergleicht Formularwerte ohne `katalog`, Werte als String), `sortiere(coll, nach) → Array` (neue Liste; `nach` = `'datum'` (neueste zuerst) | `'preis'` (günstigste zuerst)). In `index.html`: `function renderVariante()`, `const AKTIV = STORE + '-aktiv'`, `const SORT = STORE + '-sort'`.

- [ ] **Step 1: Failing tests**

```js
test('geaendert: gleiche Werte (auch Zahl vs. Text) sind nicht geändert, katalog zählt nicht', () => {
  assert.strictEqual(K.geaendert({ ...FORM, katalog:{ price:1 } }, { ...FORM, w:1200, katalog:{ price:2 } }), false);
  assert.strictEqual(K.geaendert(FORM, { ...FORM, w:'1300' }), true);
  assert.strictEqual(K.geaendert(FORM, { ...FORM, neu:'x' }), true);
});

test('sortiere: Datum = neueste zuerst, Preis = günstigste zuerst, Original bleibt', () => {
  const c = [{ id:'a', info:{ kosten:300 } }, { id:'b', info:{ kosten:100 } }, { id:'c', info:{ kosten:200 } }];
  assert.deepStrictEqual(K.sortiere(c, 'datum').map(e => e.id), ['c', 'b', 'a']);
  assert.deepStrictEqual(K.sortiere(c, 'preis').map(e => e.id), ['b', 'c', 'a']);
  assert.deepStrictEqual(c.map(e => e.id), ['a', 'b', 'c']);
});
```

- [ ] **Step 2: Laufen lassen** → FAIL `K.geaendert is not a function`

- [ ] **Step 3: Implementieren in `konfig.js`** (im Block Sammlung)

```js
// Weicht der Entwurf von der geladenen Variante ab? Katalogwerte zählen nicht, Zahlen und Texte gelten als gleich.
function geaendert(a, b){
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  keys.delete('katalog');
  for (const k of keys) if (String(a[k]) !== String(b[k])) return true;
  return false;
}
// Sammlung in Anzeige-Reihenfolge: neueste zuerst (die Liste ist nach Speicherzeit geordnet) oder günstigste zuerst.
function sortiere(coll, nach){
  const c = [...coll].reverse();
  return nach === 'preis' ? c.sort((x, y) => x.info.kosten - y.info.kosten) : c;
}
```

Beide exportieren. `node --test` → alle PASS.

- [ ] **Step 4: Markup Sammlung-Panel** (`#p-coll`) ersetzen

```html
      <div class="panel" role="tabpanel" id="p-coll" aria-labelledby="tab-coll" hidden>
        <div class="toolbar">
          <p id="collSum"></p>
          <div class="seg collsort" role="radiogroup" aria-label="Sortieren" id="collSort"><input type="radio" name="collsort" id="cs-datum" value="datum" checked><label for="cs-datum">Neueste</label><input type="radio" name="collsort" id="cs-preis" value="preis"><label for="cs-preis">Preis</label></div>
          <span class="copied" id="collMsg" aria-live="polite"></span>
        </div>
        <div class="acts" id="collLeer" hidden><button type="button" class="btn js-sammeln">Aktuellen Entwurf sammeln</button><button type="button" class="btn ghost" data-go="entwerfen" id="bZumEntwurf">Zum Entwurf</button></div>
        <ul class="coll" id="collList"></ul>
      </div>
```

CSS (bei `.coll`): `.collsort{width:200px}`

- [ ] **Step 5: `renderColl` ohne Summe, mit Sortierung und Leerzustand**

```js
const SORT = STORE + '-sort', AKTIV = STORE + '-aktiv';
let sortNach = 'datum';
try { sortNach = localStorage.getItem(SORT) || 'datum'; aktiv = localStorage.getItem(AKTIV); } catch (e) {}
$('#cs-' + sortNach).checked = true;
$('#collSort').addEventListener('change', ev => {
  sortNach = ev.target.value; placePill(ev.currentTarget, true);
  try { localStorage.setItem(SORT, sortNach); } catch (e) {}
  renderColl();
});
function storeAktiv(){ try { aktiv ? localStorage.setItem(AKTIV, aktiv) : localStorage.removeItem(AKTIV); } catch (e) {} }

function renderColl(){
  $('#cnt-coll').textContent = coll.length || '';
  $('#collSum').textContent = coll.length
    ? `${coll.length} Varianten · Kosten beim Speichern (Holz und Kaufteile)`
    : 'Noch keine Varianten. Sammle den aktuellen Entwurf, um ihn später mit anderen zu vergleichen.';
  $('#collSort').hidden = coll.length < 2;
  $('#collLeer').hidden = !!coll.length;
  $('#collList').innerHTML = sortiere(coll, sortNach).map(e => `
    <li data-id="${e.id}"${e.id === aktiv ? ' class="on"' : ''}>
      <input value="${esc(e.name)}" aria-label="Name" maxlength="60">
      <div class="meta">${esc(e.info.typ)} · <b>${esc(e.info.masse)}</b> mm · ${esc(e.info.material)} · ca. <b>${chf5(e.info.kosten)}</b> · ${esc(e.gespeichert)}</div>
      <div class="do">
        <button type="button" class="btn ghost" data-act="laden">Laden</button>
        <button type="button" class="btn ghost" data-act="update" title="Mit dem aktuellen Entwurf überschreiben">Überschreiben</button>
        <button type="button" class="btn ghost" data-act="weg">Entfernen</button>
      </div>
    </li>`).join('');
  renderVariante();
}
```

(Die `<li>`-Vorlage ist die bisherige, nur `coll.map` wird `sortiere(coll, sortNach).map`.) Bei jeder Änderung von `aktiv` (`sammeln`, `laden`, `update`, `weg`, `rueckgaengig`) `storeAktiv()` aufrufen.

- [ ] **Step 6: Anzeige «Variante X · geändert» und Sammeln-Knöpfe**

Kopf `.hacts` ersetzen:

```html
    <div class="hacts"><p class="variante" id="variante" hidden></p><div class="acts"><button type="button" class="btn js-sammeln">In Sammlung</button><button type="button" class="btn ghost js-ueberschreiben" hidden>Überschreiben</button></div><span class="copied js-msg" aria-live="polite"></span></div>
```

In der Leiste neben dem Knopf `.js-sammeln` einen Knopf `<button type="button" class="btn ghost js-ueberschreiben" hidden>Überschreiben</button>` einfügen.

CSS: `.variante{margin:0;font-size:12.5px;color:var(--muted);text-align:right}` und `.variante b{color:var(--ink);font-weight:600}`

```js
// Zeigt die geladene Variante und ob der Entwurf davon abweicht; passt die Sammeln-Knöpfe an.
function renderVariante(){
  const e = coll.find(x => x.id === aktiv);
  const passt = e && e.data.kind === formData().kind;
  const anders = passt && geaendert(formData(), e.data);
  $('#variante').hidden = !passt;
  if (passt) $('#variante').innerHTML = `Variante <b>«${esc(e.name)}»</b>${anders ? ' · geändert' : ''}`;
  for (const b of document.querySelectorAll('.js-sammeln')) {
    if (b.closest('#collLeer')) continue;
    b.disabled = passt && !anders;
    b.textContent = passt && !anders ? 'Gesammelt ✓' : anders ? 'Als neue Variante' : b.closest('.mbar') ? 'Sammeln' : 'In Sammlung';
  }
  for (const b of document.querySelectorAll('.js-ueberschreiben')) b.hidden = !anders;
}
for (const b of document.querySelectorAll('.js-ueberschreiben')) b.addEventListener('click', () => {
  const i = coll.findIndex(x => x.id === aktiv);
  if (i < 0) return;
  coll[i] = { ...sammlungEintrag(formData(), R), id:coll[i].id, name:coll[i].name };
  storeColl(); renderColl();
  flash('.js-msg', `«${esc(coll[i].name)}» überschrieben.`);
});
```

In `render()` am Ende `renderVariante();` aufrufen. `render()` läuft erst im Start-Block, und dann sind `coll`, `esc` und `renderVariante` (alles weiter oben auf oberster Ebene) schon definiert.

`sammeln` nach `coll.push(e); aktiv = e.id;` `storeAktiv();` aufrufen. Die Meldung bleibt («gesammelt · Zur Sammlung»).

- [ ] **Step 7: Im Browser prüfen**

1. Leere Sammlung: Erklärung und die Knöpfe «Aktuellen Entwurf sammeln» und «Zum Entwurf» sind sichtbar, die Sortierung nicht. («Zum Entwurf» funktioniert erst ab Task 6/7.)
2. Sammeln → Kopf «Variante «Sideboard 1200 mm»», Knopf «Gesammelt ✓» deaktiviert.
3. Breite ändern → «· geändert», Knöpfe «Als neue Variante» und «Überschreiben». Überschreiben → wieder «Gesammelt ✓».
4. Drei Varianten mit unterschiedlichem Preis → «Preis» sortiert aufsteigend. Neu laden → die Sortierung bleibt, die geladene Variante ist markiert.
5. Keine Zeile «zusammen ca. CHF» mehr.

- [ ] **Step 8: Tests + Commit**

`node --test` → alle PASS

```bash
git add konfig.js index.html test/konfig.test.js
git commit -m "feat: Sammlung als Varianten – sortierbar, «geändert», ohne Summe"
```

---

### Task 5: Einkaufsliste als Daten (`einkauf.js`)

**Files:**
- Create: `einkauf.js`
- Create: `test/einkauf.test.js`

**Interfaces:**
- Consumes: Ergebnis `R` aus `computeSideboard`/`computeReduit`: `R.groups[]` (`label`, `boards`, `sheet [L,B]`, `sheets[]` mit `L,B,price` bei Brettern), `R.rows[]` (`group`, `kind` `'korpus'|'front'|'back'|'solid'`, `pos`, `name`, `qty`, `L`, `B`, `t`, `note`), `R.M.grain`, `R.hw[] = [menge, name, hinweis, preis?]`, `R.finish[] = [menge, name, hinweis]`, `R.tools[] = string`.
- Produces:
  - `einkaufsliste(R) → [{ titel, info, zeilen:[{ id, text, sub }] }]`. `id` = `titel + '|' + text` (am Inhalt, siehe Spec «Haken»). `info` = Text ohne Haken (z. B. Plattenzahl) oder `''`.
  - `listeText(liste, titel) → string` (für Teilen / Zwischenablage)
  - `hakenFiltern(haken, liste) → string[]` (nur ids, die es in der Liste noch gibt)

- [ ] **Step 1: Failing tests** – `test/einkauf.test.js`

```js
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
```

- [ ] **Step 2: Laufen lassen** – `node --test test/einkauf.test.js` → FAIL `Cannot find module '../einkauf.js'`

- [ ] **Step 3: `einkauf.js` schreiben**

```js
/* Einkaufsliste für den Baumarkt: aus dem Ergebnis R Abschnitte mit abhakbaren Zeilen. Ohne DOM. */
'use strict';

// Abschnitte: Zuschnitt je Plattengruppe (Teile) bzw. ganze Bretter (nach Format gezählt), Latten,
// Beschläge/Kaufteile, Oberfläche, Werkzeug. Jede Zeile hat eine id aus ihrem Inhalt, damit ein Haken
// stehen bleibt, solange sich die Zeile nicht ändert.
function einkaufsliste(R){
  const liste = [];
  const abschnitt = (titel, info, zeilen) => {
    if (zeilen.length) liste.push({ titel, info, zeilen: zeilen.map(([text, sub]) => ({ id:`${titel}|${text}`, text, sub: sub || '' })) });
  };
  const maserung = r => R.M.grain && (r.kind === 'korpus' || r.kind === 'front');
  for (const g of R.groups) {
    if (g.boards) {
      const per = new Map();
      for (const s of g.sheets) { const k = `${s.L} × ${s.B}`; const e = per.get(k) || { n:0, price:s.price }; e.n++; per.set(k, e); }
      abschnitt(`${g.label} · ganze Bretter`, 'selbst ablängen', [...per].map(([k, e]) => [`${e.n} × Brett ${k} mm`, `à CHF ${e.price.toFixed(2)}`]));
    } else {
      const n = g.sheets.length;
      abschnitt(`${g.label} · Zuschnitt`, `${n} Platte${n === 1 ? '' : 'n'} ${g.sheet[0]} × ${g.sheet[1]} mm`,
        R.rows.filter(r => r.group === g.label).map(r => [
          `${r.qty} × ${r.L} × ${r.B} mm · ${r.pos} ${r.name}`,
          [maserung(r) ? 'Maserung längs' : '', r.note].filter(Boolean).join(' · ')
        ]));
    }
  }
  for (const grp of [...new Set(R.rows.filter(r => r.kind === 'solid').map(r => r.group))]) {
    abschnitt(grp, '', R.rows.filter(r => r.group === grp).map(r => [`${r.qty} × ${r.L} mm · ${r.pos} ${r.name}`, r.note]));
  }
  const reduit = R.hw.some(h => h[3]);
  abschnitt(reduit ? 'Beschläge & Kaufteile' : 'Beschläge & Kleinteile', '',
    R.hw.map(([q, n, s, p]) => [`${q} × ${n}`, [s, p ? `≈ CHF ${Math.round(q * p)}` : ''].filter(Boolean).join(' · ')]));
  abschnitt('Oberfläche', '', R.finish.map(([q, n, s]) => [`${q} ${n}`, s]));
  abschnitt('Werkzeug', 'nur falls es fehlt', R.tools.map(t => [t, '']));
  return liste;
}

function listeText(liste, titel){
  const out = [titel];
  for (const s of liste) {
    out.push('', s.titel);
    if (s.info) out.push(s.info);
    for (const z of s.zeilen) out.push(`- ${z.text}${z.sub ? ` (${z.sub})` : ''}`);
  }
  return out.join('\n');
}

function hakenFiltern(haken, liste){
  const ids = new Set(liste.flatMap(s => s.zeilen.map(z => z.id)));
  return haken.filter(id => ids.has(id));
}

if (typeof module !== 'undefined') module.exports = { einkaufsliste, listeText, hakenFiltern };
```

Hinweis zu den Tests: Der Titel `'Beschläge & Kaufteile'` im Reduit-Test setzt voraus, dass mindestens ein `hw`-Eintrag einen Preis hat. Das stimmt für das Standard-Reduit mit `sys:'battens'` (Spreizdübel, Schrauben).

- [ ] **Step 4: Laufen lassen** – `node --test` → alle PASS. Scheitert ein Regex, die tatsächliche Zeile mit `console.log(E.einkaufsliste(R))` ansehen und **den Code** an das Format im Interface-Block angleichen, nicht den Test.

- [ ] **Step 5: Commit**

```bash
git add einkauf.js test/einkauf.test.js
git commit -m "feat: Einkaufsliste als Daten mit Haken am Zeileninhalt"
```

---

### Task 6: Panels Einkaufen und Bauen

**Files:**
- Modify: `index.html` (Ausgabe-Markup ~Z. 725–770, `render`, `renderSheets`, Kopieren ~Z. 1453–1470, Hervorheben ~Z. 1030, Script-Tags ~Z. 776, CSS)

**Interfaces:**
- Consumes: `einkaufsliste`, `listeText`, `hakenFiltern` (Task 5); `R`.
- Produces: Reiter `#tab-einkaufen` / `#tab-bauen` mit Panels `#p-einkaufen` / `#p-bauen`; `#tab-coll` / `#p-coll` bleibt vorerst (Task 7 zieht ihn heraus). `function renderKauf(R)`, `function renderSheets(groups, el)`, `const HAKEN = STORE + '-haken'` (Speicher: `{ sideboard:[ids], reduit:[ids] }`), Bau-Unterreiter per Radio `name="bau"` (`teile`, `ablaengen`, `ablauf`), gespeichert unter `STORE + '-bau'`.

- [ ] **Step 1: Script laden** – nach `<script src="konfig.js"></script>`: `<script src="einkauf.js"></script>`

- [ ] **Step 2: Reiter und Panels ersetzen**

Die `.tabs` und die Panels `#p-cut`, `#p-sheet`, `#p-hw`, `#p-steps` ersetzen durch (das Panel `#p-coll` bleibt dahinter):

```html
      <div class="tabs" role="tablist" aria-label="Ergebnis">
        <button class="tab" role="tab" id="tab-einkaufen" aria-controls="p-einkaufen" aria-selected="true">Einkaufen<span class="count" id="cnt-kauf"></span></button>
        <button class="tab" role="tab" id="tab-bauen" aria-controls="p-bauen" aria-selected="false">Bauen</button>
        <button class="tab" role="tab" id="tab-coll" aria-controls="p-coll" aria-selected="false">Sammlung<span class="count" id="cnt-coll"></span></button>
        <span class="tabind" aria-hidden="true"></span>
      </div>

      <div class="panel" role="tabpanel" id="p-einkaufen" aria-labelledby="tab-einkaufen">
        <p class="warnhint js-warnhint" hidden></p>
        <div class="toolbar">
          <p id="kaufKopf"></p>
          <div class="acts">
            <button type="button" class="btn" id="bTeilen"><span class="swap"><span>Liste teilen</span><span aria-hidden="true">✓ Kopiert</span></span></button>
            <button type="button" class="btn ghost" id="bHakenWeg" hidden>Haken zurücksetzen</button>
            <span class="copied" id="copied" aria-live="polite"></span>
          </div>
        </div>
        <textarea class="copybox" id="copyBox" readonly hidden aria-label="Einkaufsliste als Text"></textarea>
        <div class="kauf" id="kaufListe"></div>
        <details class="pplan" id="pplan">
          <summary>Plattenplan für den Zuschnitt</summary>
          <div class="toolbar">
            <p>Vorschlag mit durchgehenden Schnitten, wie sie eine Plattensäge macht. Der Zuschnittservice optimiert oft noch selbst.</p>
            <div class="legend"><span><i style="background:var(--part)"></i>Korpus</span><span><i style="background:var(--part-front)"></i>Front</span><span><i style="background:var(--part-back)"></i>Rückwand</span><span><i style="background:repeating-linear-gradient(45deg,var(--waste) 0 2px,transparent 2px 6px)"></i>Rest</span></div>
          </div>
          <div class="sheets" id="sheets"></div>
        </details>
      </div>

      <div class="panel" role="tabpanel" id="p-bauen" aria-labelledby="tab-bauen" hidden>
        <p class="warnhint js-warnhint" hidden></p>
        <div class="seg bausub" role="radiogroup" aria-label="Bauen">
          <input type="radio" name="bau" id="bau-teile" value="teile" checked><label for="bau-teile">Teile</label>
          <input type="radio" name="bau" id="bau-ablaengen" value="ablaengen"><label for="bau-ablaengen" id="lbl-ablaengen">Ablängplan</label>
          <input type="radio" name="bau" id="bau-ablauf" value="ablauf"><label for="bau-ablauf">Bauablauf</label>
        </div>
        <div class="bau" id="b-teile">
          <div class="toolbar"><p>Länge = Faserrichtung. Teile mit der Position beschriften. <span class="hint-fine">Fahr mit der Maus über eine Zeile, um das Teil in der 3D-Ansicht zu sehen.</span><span class="hint-touch">Tipp auf eine Zeile, um das Teil in 3D hervorzuheben.</span></p></div>
          <div class="tablewrap"><table id="cutTable"></table></div>
        </div>
        <div class="bau" id="b-ablaengen" hidden>
          <div class="toolbar"><p>Ganze Bretter nur ablängen. Jedes Teil ist so breit wie sein Brett.</p></div>
          <div class="sheets" id="ablaengen"></div>
        </div>
        <div class="bau" id="b-ablauf" hidden><ol class="steps" id="steps"></ol></div>
      </div>
```

CSS (nach `/* Beschläge */`):

```css
/* Einkaufen */
.warnhint{margin:0 0 12px;padding:8px 12px;border:1px solid var(--warn-line);background:var(--warn-bg);border-radius:9px;font-size:13.5px}
.kauf{display:grid;gap:14px}
.kauf section{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px 14px}
.kauf h3{font-size:15px;font-weight:600}
.kauf .info{margin:2px 0 6px;font-size:13px;color:var(--muted);font-family:var(--f-mono)}
.kauf ul{list-style:none;margin:0;padding:0;display:grid}
.kauf li{border-bottom:1px dashed var(--line)}
.kauf li:last-child{border-bottom:0}
.kauf label{display:grid;grid-template-columns:22px 1fr;gap:10px;padding:8px 0;cursor:pointer;font-size:14px}
.kauf input{accent-color:var(--accent);width:20px;height:20px;margin:1px 0 0}
.kauf small{display:block;color:var(--muted);font-size:12.5px}
.kauf input:checked + span{color:var(--muted);text-decoration:line-through}
.pplan{margin-top:18px}
.pplan summary{cursor:pointer;font-family:var(--f-display);font-weight:600;font-size:15px;padding-block:8px}
.bausub{max-width:420px;margin-bottom:14px}
```

- [ ] **Step 3: `renderSheets` auf Gruppen und Ziel umstellen**

Signatur `function renderSheets(R){` → `function renderSheets(groups, el){`, Schleife `for (const g of R.groups)` → `for (const g of groups)`, am Ende `$('#sheets').innerHTML = html;` → `el.innerHTML = html;`.

- [ ] **Step 4: `render()` anpassen**

```js
  renderSummary(R); renderWarns(R); renderCut(R); renderSteps(R); renderKauf(R);
  const zu = R.groups.filter(g => !g.boards), br = R.groups.filter(g => g.boards);
  renderSheets(zu, $('#sheets')); renderSheets(br, $('#ablaengen'));
  $('#pplan').hidden = !zu.length;
  $('#bau-ablaengen').hidden = $('#lbl-ablaengen').hidden = !br.length;
  if (!br.length && $('#bau-ablaengen').checked) { $('#bau-teile').checked = true; zeigeBau(); }
  for (const w of document.querySelectorAll('.js-warnhint')) {
    w.hidden = !R.warn.length;
    w.innerHTML = `${R.warn.length} Warnung${R.warn.length === 1 ? '' : 'en'} · <button type="button" class="linkbtn" data-go="entwerfen">Zum Entwurf</button>`;
  }
```

`renderHw` löschen (Inhalt steckt in der Einkaufsliste). In `renderSummary` die Zeilen `$('#cnt-cut')…` und `$('#cnt-sheet')…` löschen.

- [ ] **Step 5: `renderKauf`, Haken, Bau-Unterreiter**

Nach `renderSteps`:

```js
const HAKEN = STORE + '-haken';
let haken = {};
try { haken = JSON.parse(localStorage.getItem(HAKEN) || '{}'); } catch (e) {}
let kaufListe = [];
const kaufTitel = R => R.kind === 'reduit' ? `Reduit ${R.W} × ${R.D} × ${R.H} mm` : `Sideboard ${R.W} × ${R.H} × ${R.Dtot} mm`;
function renderKauf(R){
  kaufListe = einkaufsliste(R);
  const kind = R.kind === 'reduit' ? 'reduit' : 'sideboard';
  const an = new Set(haken[kind] = hakenFiltern(haken[kind] || [], kaufListe));
  const total = kaufListe.reduce((a, s) => a + s.zeilen.length, 0);
  $('#kaufKopf').textContent = `${kaufTitel(R)} · ca. CHF ${Math.round(kostenGesamt(R) / 5) * 5}`;
  $('#cnt-kauf').textContent = an.size ? `${an.size}/${total}` : '';
  $('#bHakenWeg').hidden = !an.size;
  $('#kaufListe').innerHTML = kaufListe.map(s => `<section><h3>${s.titel}</h3>${s.info ? `<p class="info">${s.info}</p>` : ''}<ul>${
    s.zeilen.map(z => `<li><label><input type="checkbox" data-id="${esc(z.id)}"${an.has(z.id) ? ' checked' : ''}><span>${z.text}${z.sub ? `<small>${z.sub}</small>` : ''}</span></label></li>`).join('')
  }</ul></section>`).join('');
  try { localStorage.setItem(HAKEN, JSON.stringify(haken)); } catch (e) {}
}
$('#kaufListe').addEventListener('change', ev => {
  const id = ev.target.dataset.id, kind = R.kind === 'reduit' ? 'reduit' : 'sideboard';
  const s = new Set(haken[kind] || []);
  ev.target.checked ? s.add(id) : s.delete(id);
  haken[kind] = [...s];
  try { localStorage.setItem(HAKEN, JSON.stringify(haken)); } catch (e) {}
  $('#bHakenWeg').hidden = !s.size;
  $('#cnt-kauf').textContent = s.size ? `${s.size}/${kaufListe.reduce((a, x) => a + x.zeilen.length, 0)}` : '';
});
$('#bHakenWeg').addEventListener('click', () => { haken[R.kind === 'reduit' ? 'reduit' : 'sideboard'] = []; renderKauf(R); });

// Bauen: Unterreiter Teile | Ablängplan | Bauablauf
function zeigeBau(){
  const v = document.querySelector('input[name=bau]:checked').value;
  for (const k of ['teile', 'ablaengen', 'ablauf']) $('#b-' + k).hidden = k !== v;
  try { localStorage.setItem(STORE + '-bau', v); } catch (e) {}
}
$('.bausub').addEventListener('change', ev => { placePill(ev.currentTarget, true); zeigeBau(); });
try { const b = localStorage.getItem(STORE + '-bau'); if (b && $('#bau-' + b)) $('#bau-' + b).checked = true; } catch (e) {}
```

`esc` muss vor `renderKauf` definiert sein: die Zeile `const esc = …` aus dem Sammlung-Block an den Anfang des Scripts (unter `const form = $('#cfg');`) verschieben. `zeigeBau()` einmal beim Start vor `render()` aufrufen.

- [ ] **Step 6: Kopieren wird Teilen**

Den Block `$('#bCopy').addEventListener(…)` samt `grainOf` ersetzen:

```js
$('#bTeilen').addEventListener('click', async () => {
  const text = listeText(kaufListe, `${kaufTitel(R)} – Einkaufsliste (Masse in mm, Länge = Faserrichtung)`);
  const box = $('#copyBox'), msg = $('#copied');
  if (navigator.share && matchMedia('(pointer: coarse)').matches) {
    try { await navigator.share({ title:kaufTitel(R), text }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const fallback = () => { box.hidden = false; box.value = text; box.focus(); box.select(); msg.textContent = 'Text markiert – mit Ctrl+C kopieren.'; };
  try {
    await navigator.clipboard.writeText(text);
    box.hidden = true; msg.textContent = '';
    const b = $('#bTeilen'); b.classList.add('done'); clearTimeout(b._t);
    b._t = setTimeout(() => b.classList.remove('done'), 1800);
  } catch (e) { fallback(); }
});
```

- [ ] **Step 7: Hervorheben auch im Ablängplan**

`for (const sel of ['#cutTable', '#sheets'])` → `for (const sel of ['#cutTable', '#sheets', '#ablaengen'])`.

- [ ] **Step 8: `data-go="entwerfen"` vorläufig**

Bis Task 7 springt der Warnhinweis zum Formular. Einen Handler am Ende des Blocks «Kopieren» einfügen:

```js
document.addEventListener('click', ev => {
  const go = ev.target.closest('[data-go]');
  if (go && go.dataset.go === 'entwerfen') $('.cfgwrap').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block:'start' });
});
```

(Task 7 ersetzt ihn durch `geheZu`.)

- [ ] **Step 9: Im Browser prüfen**

1. Sideboard Birke: Einkaufen zeigt «Birke-Multiplex 18 mm · Zuschnitt» mit Plattenzahl, alle Teile mit Masse, «MDF … · Zuschnitt», Beschläge, Oberfläche, Werkzeug. Der Plattenplan lässt sich aufklappen.
2. Zwei Zeilen abhaken → Reiter «Einkaufen 2/…». Frontfarbe ändern → die Haken bleiben. Breite ändern → die Haken der geänderten Teile sind weg, «Haken zurücksetzen» leert den Rest.
3. Reduit mit go/on Fichte: «… · ganze Bretter» mit Anzahl × Format und Stückpreis, «Massivholz Fichte», «Beschläge & Kaufteile» mit CHF. Kein Plattenplan in Einkaufen, dafür in Bauen «Ablängplan».
4. Reduit mit Plattenmaterial: kein Unterreiter «Ablängplan».
5. Mit Warnung (z. B. Sideboard 2400 breit, 1 Fach): Hinweis «n Warnungen · Zum Entwurf» in Einkaufen und Bauen.
6. «Liste teilen» am Desktop → Zwischenablage, «✓ Kopiert». Der Text beginnt mit «Sideboard … – Einkaufsliste».
7. Hover über eine Teilezeile hebt das Teil in 3D hervor.

- [ ] **Step 10: Tests + Commit**

`node --test` → alle PASS

```bash
git add index.html
git commit -m "feat: Reiter Einkaufen (abhakbar, teilen) und Bauen (Teile, Ablängplan, Bauablauf)"
```

---

### Task 7: Orte mit Hash, Leiste auf dem Handy, Sammlung als eigene Ansicht

**Files:**
- Modify: `konfig.js` (+ `ortAusHash`)
- Modify: `index.html` (Kopf, Layout, `#p-coll`, `.mbar`, Sprung-Logik ~Z. 1440–1451, CSS Raster und ≤ 920 px, Start)
- Test: `test/konfig.test.js`

**Interfaces:**
- Produces: `ortAusHash(hash) → 'entwerfen'|'einkaufen'|'bauen'|'sammlung'`. In `index.html`: `function zeigeOrt(ort)`, `function geheZu(ort)`, `document.body.dataset.ort` (sichtbarer Ort), `#ortSammlung` (Sammlung-Ansicht), Leiste `.mbar nav button[data-ort]`.

- [ ] **Step 1: Failing test**

```js
test('ortAusHash: bekannte Orte, sonst Entwerfen', () => {
  assert.strictEqual(K.ortAusHash('#einkaufen'), 'einkaufen');
  assert.strictEqual(K.ortAusHash('#sammlung'), 'sammlung');
  assert.strictEqual(K.ortAusHash('bauen'), 'bauen');
  assert.strictEqual(K.ortAusHash(''), 'entwerfen');
  assert.strictEqual(K.ortAusHash('#tab-cut'), 'entwerfen');
});
```

- [ ] **Step 2: Laufen lassen** → FAIL

- [ ] **Step 3: `konfig.js`**

```js
/* ---------- Orte ---------- */
const ORTE = ['entwerfen', 'einkaufen', 'bauen', 'sammlung'];
function ortAusHash(hash){
  const o = String(hash || '').replace(/^#/, '');
  return ORTE.includes(o) ? o : 'entwerfen';
}
```

`ortAusHash` exportieren. `node --test` → PASS.

- [ ] **Step 4: Sammlung aus den Reitern lösen**

Den Reiter `#tab-coll` aus `.tabs` löschen. Das Panel `#p-coll` aus `.output` herausnehmen und als eigene Ansicht direkt nach `</div>` von `.layout` einsetzen:

```html
  <section class="sammlung" id="ortSammlung" aria-labelledby="h-sammlung">
    <div class="toolbar"><h2 id="h-sammlung">Sammlung<span class="count" id="cnt-coll"></span></h2><button type="button" class="btn ghost" data-go="entwerfen">Zum Entwurf</button></div>
    <div class="toolbar">
      <p id="collSum"></p>
      <div class="seg collsort" role="radiogroup" aria-label="Sortieren" id="collSort"><input type="radio" name="collsort" id="cs-datum" value="datum" checked><label for="cs-datum">Neueste</label><input type="radio" name="collsort" id="cs-preis" value="preis"><label for="cs-preis">Preis</label></div>
      <span class="copied" id="collMsg" aria-live="polite"></span>
    </div>
    <div class="acts" id="collLeer" hidden><button type="button" class="btn js-sammeln">Aktuellen Entwurf sammeln</button><button type="button" class="btn ghost" data-go="entwerfen">Zum Entwurf</button></div>
    <ul class="coll" id="collList"></ul>
  </section>
```

Im Kopf `.hacts` einen Knopf für Desktop ergänzen (vor `.acts`): `<button type="button" class="linkbtn" data-go="sammlung">Sammlung <span class="js-anzahl"></span></button>`. In `renderColl` `$('#cnt-coll').textContent = …` ersetzen durch:

```js
  for (const el of document.querySelectorAll('#cnt-coll, .js-anzahl')) el.textContent = coll.length ? `(${coll.length})` : '';
```

`selectTab` und die Pfeiltasten arbeiten weiter mit `tabs` (jetzt nur Einkaufen und Bauen). In `selectTab` die Zeile `localStorage.setItem(STORE + '-tab', id)` löschen.

- [ ] **Step 5: Leiste auf dem Handy**

`.mbar` ersetzen:

```html
<div class="mbar" id="mbar">
  <div class="mprice"><div><b id="mPrice"></b><span id="mMeta"></span><span class="copied js-msg" aria-live="polite"></span></div><div class="mbtns"><button type="button" class="btn ghost js-sammeln" title="Aktuellen Entwurf in die Sammlung legen">Sammeln</button><button type="button" class="btn ghost js-ueberschreiben" hidden>Überschreiben</button></div></div>
  <nav class="mnav" aria-label="Orte">
    <button type="button" data-ort="entwerfen">Entwerfen</button>
    <button type="button" data-ort="einkaufen">Einkaufen<span class="count" id="mCntKauf"></span></button>
    <button type="button" data-ort="bauen">Bauen</button>
    <button type="button" data-ort="sammlung">Sammlung <span class="js-anzahl"></span></button>
  </nav>
</div>
```

In `renderKauf` und im `change`-Handler von `#kaufListe` den Zähler auch in `#mCntKauf` schreiben (gleicher Text wie `#cnt-kauf`).

CSS: `.mbar{display:none}` bleibt für breit. Den Block `@media (max-width:920px)` für `.mbar` ersetzen:

```css
  .mbar{display:grid;gap:6px;position:fixed;z-index:10;left:0;right:0;bottom:0;padding:8px max(16px,env(safe-area-inset-right)) calc(6px + env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));background:color-mix(in srgb,var(--raise) 92%,transparent);backdrop-filter:blur(10px);border-top:1px solid var(--line)}
  .mprice{display:flex;align-items:center;justify-content:space-between;gap:12px}
  .mnav{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}
  .mnav button{all:unset;text-align:center;padding:8px 2px;min-height:28px;border-radius:8px;font-size:13px;font-weight:600;color:var(--muted);cursor:pointer}
  .mnav button[aria-current="page"]{color:var(--accent);background:var(--accent-soft)}
  .mnav .count{font-family:var(--f-mono);font-weight:400;font-size:11px;margin-left:3px}
```

Damit wird die bisherige `.mbar`-Regel (Z. 317) ersetzt; Hintergrund, Unschärfe und Rahmen sind übernommen. Die Regeln `.mbar b`, `.mbar span`, `.mbar .copied…` und `.mbtns` bleiben. `.app` braucht unten mehr Platz: In der Regel `.app{…}` im selben Media-Block `padding-bottom:calc(96px + …)` auf `calc(140px + env(safe-area-inset-bottom))` setzen.

- [ ] **Step 6: Orte per CSS zeigen**

```css
/* Orte */
body:not([data-ort="sammlung"]) .sammlung{display:none}
body[data-ort="sammlung"] .layout{display:none}
.sammlung{margin-top:20px}
.sammlung h2{font-size:20px}
@media (max-width:920px){
  body[data-ort="einkaufen"] .cfgwrap,body[data-ort="bauen"] .cfgwrap{display:none}
  body[data-ort="entwerfen"] .output{display:none}
  .output .tabs{display:none}
  body:not([data-ort="entwerfen"]) .top .summary{display:none}
}
```

`.sammlung` bekommt auf dem Desktop keinen `data-go`-Knopf in der Leiste, dafür «Zum Entwurf» in der eigenen Toolbar (Step 4).

- [ ] **Step 7: Router**

Den Block «Schmal: Leiste unten springt zum Ergebnis und zurück» (IntersectionObserver, `#bJump`) löschen, ebenso den vorläufigen `data-go`-Handler aus Task 6 Step 8. Einfügen:

```js
// Orte: Entwerfen · Einkaufen · Bauen · Sammlung. Handy: jeder Ort eine Ansicht. Desktop: Einkaufen und Bauen
// sind Reiter neben dem Entwurf, nur die Sammlung ist eine eigene Ansicht.
function zeigeOrt(ort){
  if (ort === 'einkaufen' || ort === 'bauen') selectTab('tab-' + ort);
  const sicht = narrow.matches || ort === 'sammlung' ? ort : 'entwerfen';
  const neu = document.body.dataset.ort !== sicht;
  document.body.dataset.ort = sicht;
  for (const b of document.querySelectorAll('.mnav button')) {
    if (b.dataset.ort === ort) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  }
  if (neu) { window.scrollTo(0, 0); placeTabInd(false); placePills(); }
}
// Ortswechsel legt einen History-Eintrag an (Zurück-Taste); hashchange ruft zeigeOrt.
function geheZu(ort){
  if (ortAusHash(location.hash) === ort && location.hash) zeigeOrt(ort);
  else location.hash = ort;
}
window.addEventListener('hashchange', () => zeigeOrt(ortAusHash(location.hash)));
narrow.addEventListener('change', () => zeigeOrt(ortAusHash(location.hash)));
document.addEventListener('click', ev => {
  const go = ev.target.closest('[data-go], .mnav button');
  if (!go) return;
  geheZu(go.dataset.go || go.dataset.ort);
});
// Desktop-Reiter: Ort im Hash nachführen, ohne History-Eintrag.
for (const t of tabs) t.addEventListener('click', () => {
  history.replaceState(null, '', '#' + t.id.replace('tab-', ''));
  zeigeOrt(ortAusHash(location.hash));
});
```

Pfeiltasten in den Reitern sollen den Hash auch nachführen. Im bestehenden `keydown`-Handler der Reiter `selectTab(n.id); n.focus();` durch `n.click(); n.focus();` ersetzen (der Klick löst beide Listener aus).

Hinweis: `narrow` ist heute im Block «Schmal: Gruppen einklappbar» definiert, **vor** dem Router. Das bleibt so.

Den Meldungs-Handler aus Task 3 anpassen. Er braucht keinen eigenen `data-go`-Zweig mehr, weil der globale Klick-Handler oben das übernimmt:

```js
for (const m of document.querySelectorAll('.js-msg')) m.addEventListener('click', ev => {
  if (ev.target.hasAttribute('data-undo')) rueckgaengig();
});
```

In `sammeln` die Meldung auf den Ort umstellen: `… gesammelt. <button type="button" class="linkbtn" data-go="sammlung">Zur Sammlung</button>`.

Laden führt zu Entwerfen: im Zweig `laden` von `#collList` nach `flash(…)` `geheZu('entwerfen');` aufrufen.

- [ ] **Step 8: Start**

In `/* ---------- Start ---------- */` die Zeile mit `STORE + '-tab'` durch `zeigeOrt(ortAusHash(location.hash));` ersetzen, **nach** `renderColl();`.

- [ ] **Step 9: Im Browser prüfen (DevTools, 390 px breit)**

1. Leiste unten: Preis, Sammeln, darunter Entwerfen · Einkaufen · Bauen · Sammlung. Entwerfen ist markiert, 3D und Formular sind sichtbar, keine Ergebnis-Reiter.
2. Einkaufen → nur die Einkaufsliste, URL `#einkaufen`. Bauen → `#bauen`. **Zurück** → Einkaufen. **Zurück** → Entwerfen.
3. Neu laden auf `#bauen` → Bauen ist offen.
4. Sammlung → eigene Ansicht, Laden → Entwerfen mit dem geladenen Entwurf und «Rückgängig» in der Leiste.
5. Warnhinweis «Zum Entwurf» → Entwerfen.
6. Nach dem Wechsel zurück zu Entwerfen erscheint das 3D sofort in richtiger Grösse (ResizeObserver).
7. Desktop (1280 px): Formular links, 3D, Reiter Einkaufen | Bauen rechts. Ein Klick auf Bauen ändert die URL auf `#bauen`, **Zurück** verlässt dabei nicht den Reiter (replaceState). «Sammlung (n)» im Kopf → eigene Ansicht, Zurück → Entwurf.
8. Fenster von 1280 auf 390 ziehen, während `#bauen` offen ist → Bauen als Ort.

- [ ] **Step 10: Tests + Commit**

`node --test` → alle PASS

```bash
git add konfig.js index.html test/konfig.test.js
git commit -m "feat: Orte Entwerfen · Einkaufen · Bauen · Sammlung mit Hash und Leiste unten"
```

---

### Task 8: Möbelwahl «Was baust du?» im Kopf, erster Besuch

**Files:**
- Modify: `index.html` (Kopf `#kindBar` ~Z. 394, CSS Kopf, `onInput`, Start)

**Interfaces:**
- Consumes: `wechsleTyp`, `entwuerfe`, `zufall`, `applyData(…, { undo })`, `geheZu`, `sammlungEintrag`, `computeData`, `coll`.
- Produces: `<input type="hidden" name="kind" id="kind" form="cfg">` statt der Radios, `<dialog id="wahl">`, `function oeffneWahl({ erst })`, `function schliesseWahl()`.

- [ ] **Step 1: Markup**

`#kindBar` ersetzen:

```html
    <div class="kindpick"><input type="hidden" name="kind" id="kind" value="sideboard" form="cfg"><button type="button" class="btn ghost" id="bKind" aria-haspopup="dialog"><span id="kindName">Sideboard</span> ▾</button></div>
```

Vor `<div class="mbar"` einfügen:

```html
<dialog class="wahl" id="wahl" aria-labelledby="h-wahl">
  <h2 id="h-wahl">Was baust du?</h2>
  <ul class="wahllist">
    <li><button type="button" class="wahlbtn" data-kind="sideboard"><b>Sideboard</b><small>Korpus mit Fächern, Türen und Füssen fürs Wohnzimmer</small><small class="zuletzt" data-zuletzt="sideboard"></small></button><button type="button" class="linkbtn" data-zufall="sideboard">Zufall</button></li>
    <li><button type="button" class="wahlbtn" data-kind="reduit"><b>Reduit</b><small>Regal in einem kleinen Raum, eingebaut oder selbststehend</small><small class="zuletzt" data-zuletzt="reduit"></small></button><button type="button" class="linkbtn" data-zufall="reduit">Zufall</button></li>
  </ul>
  <div class="acts"><button type="button" class="btn ghost" id="wahlColl">Aus Sammlung laden</button><button type="button" class="btn ghost" id="wahlZu">Schliessen</button></div>
</dialog>
```

CSS (bei «Kopf»; `.kindbar`-Regeln löschen, auch die in den Media-Queries):

```css
.kindpick{grid-area:kind;justify-self:end}
#bKind{font-size:15px}
.wahl{border:1px solid var(--line);border-radius:14px;background:var(--panel);color:var(--ink);padding:18px;width:min(460px,calc(100% - 32px));box-shadow:var(--shadow)}
.wahl::backdrop{background:rgba(10,20,24,.35)}
.wahl h2{font-size:20px;margin-bottom:12px}
.wahllist{list-style:none;margin:0 0 14px;padding:0;display:grid;gap:8px}
.wahllist li{display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px}
.wahlbtn{all:unset;display:grid;gap:2px;padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:var(--raise);cursor:pointer}
.wahlbtn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.wahlbtn[aria-current]{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}
.wahlbtn small{color:var(--muted);font-size:12.5px}
.wahlbtn .zuletzt{font-family:var(--f-mono);color:var(--ink)}
@media (max-width:920px){.kindpick{justify-self:start}}
```

- [ ] **Step 2: Typ-Radios ersetzen im Code**

- `$('#kindBar').addEventListener('input', onInput);` und `$('#kindBar').addEventListener('change', pillOnChange);` löschen.
- In `onInput` die Zeile `if (el.name === 'kind') { wechsleTyp(el.value); return; }` löschen (ein Hidden-Feld löst kein `input` aus).
- `restore` setzt `els.value = v` für das Hidden-Feld, `formData` liest `kind` über `el.value`. Das funktioniert ohne Änderung.
- In `render()` ergänzen: `$('#kindName').textContent = reduit ? 'Reduit' : 'Sideboard';`

- [ ] **Step 3: Dialog-Logik**

```js
/* ---------- Möbelwahl ---------- */
// Beim ersten Besuch ohne Schliessen. Sonst legt Öffnen einen History-Eintrag an, damit Zurück den Dialog schliesst.
const wahl = $('#wahl');
let wahlErst = false;
function oeffneWahl({ erst = false } = {}){
  wahlErst = erst;
  const aktuell = formData().kind;
  for (const b of wahl.querySelectorAll('[data-kind]')) b.toggleAttribute('aria-current', !erst && b.dataset.kind === aktuell);
  for (const z of wahl.querySelectorAll('[data-zuletzt]')) {
    const d = !erst && entwuerfe && entwuerfe[z.dataset.zuletzt];
    if (!d) { z.textContent = ''; continue; }
    const info = sammlungEintrag(d, computeData(d)).info;
    z.textContent = `zuletzt: ${info.masse} mm · ca. CHF ${Math.round(info.kosten / 5) * 5}`;
  }
  $('#wahlZu').hidden = erst;
  $('#wahlColl').hidden = !coll.length;
  if (!erst) history.pushState({ wahl:true }, '', location.hash || '#entwerfen');
  wahl.showModal();
}
function schliesseWahl(){
  if (!wahl.open) return;
  if (history.state && history.state.wahl) history.back();   // popstate schliesst
  else wahl.close();
}
window.addEventListener('popstate', () => { if (wahl.open && !(history.state && history.state.wahl)) wahl.close(); });
wahl.addEventListener('cancel', ev => { ev.preventDefault(); if (!wahlErst) schliesseWahl(); });
$('#bKind').addEventListener('click', () => oeffneWahl());
$('#wahlZu').addEventListener('click', schliesseWahl);
wahl.addEventListener('click', ev => {
  const k = ev.target.closest('[data-kind]'), z = ev.target.closest('[data-zufall]'), s = ev.target.closest('#wahlColl');
  if (!k && !z && !s) return;
  if (k) wechsleTyp(k.dataset.kind);
  if (z) {
    const basis = entwuerfe[z.dataset.zufall] || { ...DEFAULTS, kind:z.dataset.zufall };
    applyData(zufall(basis), { undo: !wahlErst });
    if (!wahlErst) flash('.js-msg', `Neu gewürfelt. ${undoBtn}`);
  }
  if (wahlErst) { wahlErst = false; wahl.close(); if (s) geheZu('sammlung'); return; }
  // history.back() läuft asynchron: erst nach dem Zurück-Schritt zur Sammlung, sonst überholt der neue Hash ihn.
  if (s && history.state && history.state.wahl) addEventListener('popstate', () => geheZu('sammlung'), { once:true });
  schliesseWahl();
  if (s && !wahl.open) geheZu('sammlung');
});
```

`wechsleTyp` wechselt auch dann, wenn der gewählte Typ schon aktiv ist. `applyData` mit demselben Entwurf ändert aber nichts Sichtbares, das ist gewollt. `entwuerfe` ist nie `null`, weil der Start-Block aus Task 1 `save()` aufruft.

Die letzte Zeile (`if (s && !wahl.open)`) greift nur, wenn `schliesseWahl()` synchron geschlossen hat (kein History-Eintrag). Nach `history.back()` ist der Dialog an dieser Stelle noch offen, dann übernimmt der `popstate`-Listener.

- [ ] **Step 4: Erster Besuch**

Im Start nach `zeigeOrt(…)`:

```js
if (erstBesuch) oeffneWahl({ erst:true });
```

(`erstBesuch` setzt Task 1 vor dem ersten `save()`. `entwuerfe` selbst ist danach nie mehr `null`.)

- [ ] **Step 5: Im Browser prüfen**

1. **Erster Besuch:** DevTools → localStorage leeren → neu laden → Dialog «Was baust du?» ohne «Schliessen» und ohne «Aus Sammlung laden». Esc schliesst nicht. «Reduit» → Reduit mit Standardwerten.
2. Kopf «Reduit ▾» → Dialog mit «zuletzt: 1600 × 1400 × 2400 mm · ca. CHF …» beim Reduit, Reduit ist markiert. Esc → zu, der Ort bleibt.
3. Dialog öffnen, Zurück-Taste → Dialog zu, Ort unverändert (z. B. weiter `#einkaufen`).
4. Mit mindestens einer Variante: Dialog → «Aus Sammlung laden» → Sammlung-Ansicht. Zurück → Entwerfen, der Dialog ist **nicht** wieder offen.
5. Dialog → «Zufall» beim Sideboard (aktuell Reduit) → Sideboard gewürfelt, «Neu gewürfelt. Rückgängig» → Rückgängig → Reduit wie vorher.
6. **Alter Speicher (Review Focus 1):** localStorage leeren, dann `localStorage.setItem('sideboard-werkbank-v2', JSON.stringify({kind:'reduit', rw:'1800', mat:'fichtesp', t:'19'}))` → neu laden → **kein** Dialog, Reduit mit 1800 breit.

- [ ] **Step 6: Tests + Commit**

`node --test` → alle PASS

```bash
git add index.html
git commit -m "feat: Möbelwahl «Was baust du?» im Kopf, beim ersten Besuch als Einstieg"
```

---

### Task 9: Doku und Durchgang durch alle Randfälle

**Files:**
- Modify: `docs/WEITERARBEIT.md` (Tabelle «Aufbau», Speicher)
- Modify: `README.md`, falls dort Reiter oder Bedienung beschrieben sind (`grep -n -i 'reiter\|sammlung\|materialliste' README.md`)

- [ ] **Step 1: WEITERARBEIT.md nachführen**

In der Tabelle «Aufbau» eine Zeile für `einkauf.js` ergänzen:

```
| `einkauf.js` | Einkaufsliste aus dem Ergebnis: Zuschnitt je Platte, ganze Bretter nach Format, Latten, Beschläge/Kaufteile, Oberfläche, Werkzeug; Haken hängen am Zeileninhalt (`hakenFiltern`) |
```

Die Zeile zu `konfig.js` um «Entwürfe pro Typ (`entwuerfeLaden`, `entwurfSetzen`), `kostenGesamt`, `geaendert`, `sortiere`, `ortAusHash`» ergänzen. Ausserdem `test/einkauf.test.js` in der Zeile der Tests nennen.

Neuer Abschnitt:

```markdown
## Orte und Speicher

- Orte: `#entwerfen`, `#einkaufen`, `#bauen`, `#sammlung`. Handy: je eine Ansicht mit Leiste unten. Desktop: Einkaufen/Bauen als Reiter neben dem Entwurf (Hash per `replaceState`), Sammlung als eigene Ansicht. Spec: `docs/superpowers/specs/2026-09-26-ansichten-design.md`.
- localStorage: `sideboard-werkbank-v2-entwuerfe` (ein Entwurf pro Typ; `sideboard-werkbank-v2` wird nur noch beim ersten Laden übernommen), `-sammlung`, `-aktiv` (geladene Variante), `-haken` (pro Typ), `-bau` (Unterreiter), `-sort`.
```

- [ ] **Step 2: Randfälle der Spec durchgehen**

Jede Zeile der Tabelle «Randfälle» in der Spec einmal am Handy (390 px) und am Desktop durchspielen und das Ergebnis ins Commit schreiben. Bekannte Stellen: Task 1 Step 6, Task 3 Step 4, Task 4 Step 7, Task 6 Step 9, Task 7 Step 9, Task 8 Step 5. Neu hier:
- **Im Baumarkt ohne Netz:** DevTools → Network → Offline → neu laden. three.js lädt nicht (erwartet). Einkaufen muss aber funktionieren, Haken setzen muss gehen. Für fehlendes WebGL gibt es schon den Hinweis `.nogl` (in `initThree`, Text «Die 3D-Vorschau braucht WebGL …»). Ob `initThree` auch ohne `window.THREE` sauber zurückkehrt, in der Konsole prüfen. Bricht das Script ab, den Anfang von `initThree` mit `if (!window.THREE) { $('#stage').innerHTML = '<div class="nogl">Die 3D-Vorschau braucht eine Internetverbindung. Einkaufsliste und Bauplan funktionieren trotzdem.</div>'; return; }` absichern.

- [ ] **Step 3: Tests + Commit**

`node --test` → alle PASS

```bash
git add docs/WEITERARBEIT.md README.md
git commit -m "docs: Orte, Einkaufsliste und Speicher in WEITERARBEIT"
```
