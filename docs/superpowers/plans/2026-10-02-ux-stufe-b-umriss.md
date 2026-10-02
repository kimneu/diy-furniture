# UX Stufe B und Einkaufen/Bauen – Umriss (kein Plan)

> Umriss für die Tasks nach Stufe A: Files, Interfaces, Kernentscheide, Teststrategie, Aufwand. Kein Schritt-Detail; der eigentliche Plan entsteht nach dem iPhone-Test von Stufe A mit `superpowers:writing-plans`. Spec: `docs/review/2026-10-02-ux-review.md` Kapitel 6–7 (Stufe B) und «Ausserhalb der Richtung» (E1–E4). Stufe-A-Plan: `2026-10-02-ux-stufe-a.md`.

**Stand der Zeilenangaben:** Code-Stand `e5f3fa4`. HEAD `0d85b4c` ändert nur Docs und Bilder. Alle Bereiche habe ich mit `sed -n` am Code nachgelesen. Nach A1 (Doctype, +4 Zeilen) verschieben sich alle `index.html`-Zeilen um +4. Durch A2 bis A6 verschieben sie sich weiter, darum vor jedem B-Task neu greppen (Funktionsnamen sind angegeben). `konfig.js`, `reduit.js`, `sideboard.js`, `shared.js` und `einkauf.js` berührt Stufe A nicht (nur A6 berührt `index.html`), ihre Zeilen gelten also auch nach Stufe A.

**Korrekturen an den Zeilenangaben der Spec (Kapitel 7):**
- `applyNarrow` steht in 1934–1941, nicht in 1920–1941. `OPEN` und `heads` stehen in 1920–1933.
- `renderWarns` geht bis 1412, mit dem Klick-Listener.
- `restore` steht in 1193–1231, nicht in 1193–1216.
- `FELDNAME` steht in 305–306, `wertName` in 290–304.
- `HARMLOS` steht in 418, `zufall` in 449–466.

**Gezählt am Code:**
- `warn.push`-Anweisungen: sideboard.js 23, reduit.js 23 (davon 3 als `ctx.warn.push`; 654 und 698 sammeln nur), konfig.js 4 (`warnungen.push`).
- Dazu 2 Warn-Regeln (W03, W06) und in reduit.js 10 Texte über `groupWarn`, `spanWarn` und `extraWarn` (5 + 2 + 3 Aufrufe).
- Zusammen etwa 60 Textstellen, 50 Push-Anweisungen. Die Spec nennt «ca. 45».
- Tests mit Bezug auf `warn` oder `HARMLOS`: 84 Zeilen (reduit 37, regeln 17, sideboard 15, bauweisen 6, kombinationen 6, konfig 4). Dazu 14 Zeilen mit `korrekturen`.
- `test/fixtures/sideboard-snapshot.json` enthält `warn` als Strings (10 Fälle, zusammen 29 Meldungen).
- Basis: `node --test` ergibt 198 grün.

**Nebenbefunde, die die Tasks beeinflussen:**
- `render()` (index.html 1336–1375) ruft **nicht** `computeData` auf. Es wiederholt das Zusammenführen `R.warn = [...P.warnungen, ...R.warn]` (Zeile 1360).
- `renderWarns` setzt Meldungstexte per `innerHTML` (1402), ohne Escaping.
- Der Ladeknopf «Überschreiben» in der Sammlung (`data-act="update"`, 2218–2220) prüft den Möbeltyp nicht.
- Der Test «Standardformulare: keine Warnung» (kombinationen.test.js 168–180) ist heute schon grün: `startwerte(…,'reduit')` liefert `warn: []`. Die «2 Warnungen» im Bild `handy-reduit-entwerfen.png` kommen aus einem Reduit-Zustand mit Birke und Wandschienen. Davon ist eine eine echte Warnung («Teil A … passt nicht auf die Platte 1500 × 3000 mm»), nicht eine Notiz.

---

## Reihenfolge

1. **E2** (Bug, unabhängig von Stufe A, kann sofort laufen)
2. **B1** Wörterbuch, nach A5, weil es Gruppentitel umbenennt
3. **B2** `R.warn` typisieren
4. **B3** Begrenzungen zurückschreiben
5. **B5** Tokens und Meldung
6. **B4** Entwurf-Zustand
7. **B6** Aufklapper mit Einzeiler

E1 und E4 kommen nach A3 bzw. A6, E3 nach dem Entscheid aus Kapitel 9.

**Abweichung von der Spec-Reihenfolge:** B5 vor B4. B4 verlangt «Rückgängig bis zur nächsten Eingabe», und das braucht die Meldung ohne 6-s-Timer aus B5. Die Logik von B4 in `konfig.js` (Zustand, Ergänzen) kann parallel zu B5 entstehen.

**Was vom iPhone-Test nach Stufe A abhängt (Kapitel 10):**
- **B5:** die Lage der Meldung in der Leiste (Tastatur, Safari-Leiste unten), die Dialog-Blende (Safari ≥ 17.4, `@starting-style`) und der Puls.
- **B6:** welche Aufklapper standardmässig offen sind («Breite» über dem Falz) und die Höhe von Regler und Daumen (44 px).
- **B2:** wo die Rückmeldungszeile steht (in der sticky Bühne oder darunter; sie macht die Bühne höher, und das beeinflusst «erster Wisch auf dem Canvas»).

B1, B3, B4, E1, E2, E3 und E4 hängen nicht davon ab.

---

### Task B1: Wörterbuch-Durchgang
**Files:**
- Modify `konfig.js:290-306` (`wertName`, `FELDNAME`) und `konfig.js:667` (FELDNAME und wertName exportieren).
- Modify `index.html`:
  - 4 (meta description), 548–550 (Zufall-Titel «Konfiguration», Hinweis «Schloss»)
  - 636 (h2 «Bauart»), 641 (aria-label «Einbau-Art»), 832 (h2 «Optik»)
  - 1243 (bwHint «Optik»), 1922 (`OPEN` enthält 'Optik'), 1966 («fest»)
  - 2135–2137 (collSum), 2141 («(ältere Variante)»), 2162 («In Sammlung», «Gesammelt ✓»), 2181 («Ältere Variante»), 2253 («Geteilter Entwurf»)
  - A5 kann Teile davon schon verschoben haben, darum nach Text greppen.
- Modify `docs/WEITERARBEIT.md` (11 Altbegriffe), `README.md:11` (Upstream-URL), `docs/review/2026-10-02-ux-review.md` (Zeilen nach A nachführen).
- Test: neu `test/woerterbuch.test.js`; `tools/ui-pruefung.mjs` → `b1`.

**Interfaces:**
- Consumes: Gruppenstruktur aus A5 (Titel «Masse», «Bauweise», «Aufteilung», «Material»).
- Produces:
  - `FELDNAME.build = FELDNAME.sys = 'Tragwerk'` (statt 'Regal' / 'Einbau-Art').
  - h2 der Material-Gruppe «Material», h2 von `#grp-bauart` «Tragwerk»; `data-lock` bleibt.
  - Knopftexte «Sammeln» (überall; «In Sammlung» entfällt).
  - Exporte `FELDNAME` und `wertName` aus konfig.js.

**Kernentscheide:**
1. `build` und `sys` heissen in Meldungen «Tragwerk». Das ist die Zeile auf der Bauweise-Karte, also bleibt «Bauweise» für `bw` eindeutig. Die Korrektur-Meldung lautet dann «Tragwerk: Pfostenrahmen statt Wandschienen – …».
2. Für die Zustände (Gesammelt, Ältere Variante, Geteilter Entwurf) ändert B1 nur die Wörter, nicht die Logik. Die Logik kommt in B4. Übergangstexte:
   - «Gesammelt» statt «Gesammelt ✓»
   - «Variante passt nicht zur Bauweise» statt «Ältere Variante»
   - «Entwurf von Link» statt «Geteilter Entwurf»
3. «Tipp:» im Bauablauf (`renderSteps` 1471) bleibt. Das Wörterbuch ersetzt «Tipp» nur im Formular. «Zuschnittliste» und «Materialliste» in `R.steps` (reduit.js und sideboard.js `build*Steps`) werden zu «Teile (Bauen)» und «Einkaufsliste».
4. Der localStorage-Schlüssel `sideboard-werkbank-v2-schloss` bleibt trotz Umbenennung (Bestand der Nutzer).

**Tests:**
- node: `FELDNAME` enthält keinen Wert aus `['Regal','Einbau-Art','Bauart']`. `pruefeRegeln` mit gesperrtem `sys` liefert eine Korrektur, die mit «Tragwerk:» beginnt. Die bestehenden Tests prüfen keine dieser Wörter (per grep geprüft).
- ui-pruefung `b1`: Für beide Möbel und alle vier Orte werden alle Aufklapper geöffnet. Dann prüft der Test `document.body.innerText`, alle `title`- und `aria-label`-Werte gegen `/Optik|Einbau-Art|Bauart|Schloss|Konfiguration|In Sammlung|Materialliste|Möbeltyp|ß/`. Ergebnis: keine Treffer.

**Aufwand:** 0.5 Tage.

---

### Task B2: Rückmeldung in drei Formen (`R.warn` → `{art, text, feld}`)
**Files:**
- Modify `shared.js`: nach Zeile 4 Helfer einfügen, Export in 277.
- Modify `sideboard.js`: 20–26, 120–189, 240–247, 267 (`[...new Set(warn)]`).
- Modify `reduit.js`: 14–67 (`normReduit`), 84–120 (`layout`), 253, 296–312 (`groupWarn`, `spanWarn`, `extraWarn`), 424, 433, 451–452, 501, 574, 618, 652–654, 698, 721–746, 802.
- Modify `konfig.js`:
  - 200–222 (W03 und W06 bekommen `art`)
  - 313–368 (`pruefeRegeln`: `korrekturen` und `warnungen` typisiert)
  - 372–377 (`computeData`)
  - 414–418 (`HARMLOS` entfernen)
  - 449–466 (`zufall`)
  - 667 (Export: `HARMLOS` raus)
- Modify `index.html`:
  - HTML 540–543 (`#warnBox`)
  - CSS 98–99, 127–133, 242–245, 355–356
  - `render` 1336–1375: Zeile 1360 verwendet dasselbe Zusammenführen wie `computeData`; `.js-warnhint` 1366–1369 zählt nur Warnungen
  - `renderWarns` 1399–1412
  - `ladeVariante` 2181–2183 (`k.split(' – ')` → `k.text`)
- Test: alle `test/*.test.js` mit warn und korrekturen (84 + 14 Zeilen); `test/sideboard.snapshot.test.js:10-14`; neu `test/meldungen.test.js`; ui-pruefung `b2`.

**Interfaces:**
- Produces (shared.js):
  - `meldung(art, text, feld)` → `{ art, text, feld? }`
  - `warnung(text, feld)`, `notiz(text, feld)`, `anpassung(text, feld)`
  - `einmal(liste)`: entfernt Doppelte nach `art + '|' + text`, die erste Meldung bleibt
  - `nurArt(liste, art)`
- Produces (Datenformen):
  - `R.warn: Array<{art:'warnung'|'notiz'|'anpassung', text, feld?}>`
  - `pruefeRegeln(...).korrekturen: Array<{art:'anpassung', text, feld}>`
  - `pruefeRegeln(...).warnungen: Array<{art:'warnung'|'notiz', text, feld}>`
  - REGELN mit `wirkung:'warnen'` tragen `art:'notiz'|'warnung'`
- Produces (Oberfläche):
  - `#warnHead` enthält `<span class="chip warnung">! 2 Warnungen</span>` und `<span class="chip notiz">i 1 Notiz</span>`
  - Die Listeneinträge in `#warns` sind `div.warn` (Warnung, «!»), `div.notiz` (Notiz, «i») und `div.anp` (Anpassung, «✎») mit `data-feld`. Text per `textContent`.
  - `#warnBox` ist nur sichtbar, wenn mindestens eine Meldung da ist. Der Zähler in `.js-warnhint` zählt nur `art === 'warnung'`.
- Consumes: Steckbrief-Zeile und Bühnenhöhe aus A3/A5. Die ids `#warnBox`, `#warnHead` und `#warns` bleiben, weil der Desktop-Sprung `warnGo` in 1995–2003 sie nutzt.

**Kernentscheide:**
1. **Einteilung**, verbindlich für die Umsetzung:
   - **notiz:**
     - sideboard 172 (Schraubenköpfe), 174 (kippt leicht), 240–247 (alle «Bad:»)
     - reduit 253 (eckLeer), `extraWarn` (311), 433 (rails2), 574 (postsMid), 740 (Winkel eingeplant), 746 (Gipskarton)
     - W03 (Minifix 15) und W06 (Haftgrund)
   - **anpassung:**
     - sideboard 26 (`feld:'baseH'`)
     - reduit 19 (doorW), 20 (doorH), 22 (doorOff), 49 (dLeft, dRight), 52 (dBack), 54 (gapTop), 63 (Tiefe auf Brettbreite), 111 und 112 (nicheL/R, nicheLW/RW)
   - **warnung:** alles andere, darunter `spanWarn`, «passt nicht», Kippmass, «entfällt», «weggelassen» (618), Durchgang und die vier Warnungen aus Sperren mit festgehaltenen Feldern (konfig 325, 340, 354, 359).
   - `groupWarn(ctx, key, part, text, art = 'warnung')` merkt sich `art` je Gruppe.
2. **Dieselben Meldungs-Objekte für `korrekturen`** (mit `feld`). B5 braucht `feld` für den Anpassungs-Chip, und die Leiste braucht `text`. Die Korrekturen landen nicht in `R.warn`; `R.korrekturen` bleibt eine eigene Liste.
3. **`HARMLOS` entfällt.** `zufall` verwirft einen Wurf, wenn `nurArt(R.warn, 'warnung').length > 0` ist. Folge: W03, W06, Schraubenköpfe und Bad blockieren den Zufall nicht mehr. Das ist Absicht (6.3: «Notiz blockiert Zufall nicht»). Der Test in regeln.test.js 201–207 filtert dann nach `art`.
4. **Migration der Tests mechanisch:**
   - `w => w.includes(` wird zu `w => w.text.includes(`, ebenso für `startsWith`, `find` und `filter`.
   - `deepStrictEqual(X.warn, [])` bleibt.
   - `K.HARMLOS.test(w)` wird zu `w.art !== 'warnung'`.
   - Der Snapshot-Test vergleicht `{ ...R, warn: R.warn.map(w => w.text) }`; die Fixture bleibt unverändert.
5. **Anpassungen aus der Berechnung** stehen bis B3 als `div.anp` mit «✎» in der Liste. Ein Chip «✎ 1 Anpassung» erscheint nur, wenn es welche gibt. Nach B3 bleibt die Zahl beim Standard null.

**Tests:**
- node `test/meldungen.test.js`:
  - Jede Meldung aus den Kombinations-Fällen hat `art` aus den drei Werten und einen nicht leeren `text`. Hier reicht ein Haken in `geometrie()` in kombinationen.test.js 67, das `t.text` prüft.
  - Bad-Sideboard: Alle «Bad:»-Meldungen sind Notizen.
  - Reduit `{sys:'posts', shape:'L'}`: «Zwischenpfosten eingeplant» ist eine Notiz.
  - Ein festgehaltenes Feld ergibt eine Warnung.
  - `einmal` entfernt Doppelte.
  - `zufall` liefert bei 240 Würfen keine `warnung` (ersetzt den HARMLOS-Test in kombinationen.test.js 186–195).
- ui-pruefung `b2`:
  - Reduit-Start: kein `.warn`, kein Text «Warnung» im Kopf.
  - Sideboard mit `room=bath`: Chip «i n Notizen», kein «!».
  - Sideboard mit `w=2400`, `sections=2`: Chip «! 1 Warnung».
  - Ein Meldungstext mit `<` erscheint als Text, nicht als Markup.

**Aufwand:** 3 Tage (die Hälfte davon Einteilung und Testmigration).

---

### Task B3: Begrenzungen der Berechnung fliessen ins Formular zurück
**Files:**
- Modify `konfig.js`: 233–259 (REGELN: neue `grenze`-Einträge), 261 (`RANGES` erweitern), 277–288 (`grenzen`, unverändert), 313–368 (Schleife in `pruefeRegeln`, unverändert, ausser die Summe der Seitentiefen).
- Modify `index.html`:
  - `syncVisibility` 1082–1084: min/max für `baseH` entfernen
  - `syncVisibility` 1131: max für `doorOff` entfernen
  - `zeigeSperren` 1314–1322 übernimmt das über `RANGES`
- `reduit.js:19-54` und `sideboard.js:26` bleiben als Sicherheitsnetz (Meldung `anpassung`), werden aber über das Formular nicht mehr erreicht.
- Test: `test/regeln.test.js` (neue Fälle), `test/kombinationen.test.js` (`fixpunkt`, deckt die neuen Felder automatisch ab); ui-pruefung `b3`.

**Interfaces:**
- Produces:
  - `RANGES` bekommt `doorW:[600,1200]`, `doorH:[1500,2600]`, `doorOff:[50,3000]`, `baseH:[40,350]`.
  - Neue Regeln, alle mit `wirkung:'grenze'`:
    - `K16` doorW: max `rw-100`
    - `K17` doorH: max `rh`
    - `K18` doorOff: `wenn: doorPos !== 'M'`, max `rw-doorW-50`
    - `K19` dLeft/dRight: max `rw-300-(Gegenseite, falls vorhanden)`
    - `K20` dBack: max `rd-300`
    - `K21` gapTop: max `rh-gapBottom-300`
    - `K22` baseH: min/max nach `base` (Sockel 40–150, Füsse 60–350), dazu max `H-2t-150`
  - Jede Regel hat einen `grund`-Text, der heutigen Meldung entnommen. Beispiel K16: «Neben der Tür braucht es mindestens 50 mm Wand pro Seite.»
- Consumes: Meldungs-Objekte aus B2 (`korrekturen` mit `feld`).

**Kernentscheide:**
1. **Überall zurückschreiben**, kein «400 → 375» im Einzeiler. Nur ein Weg, und die min/max-Werte im Formular folgen automatisch über `zeigeSperren`. Die Variante mit Einzeiler nur, wenn der Fixpunkt-Test schwingt (er läuft höchstens 12 Runden).
2. **Seitentiefen** als zwei Grenzen mit der jeweils anderen Seite, statt wie heute anteilig zu kürzen (reduit.js 44–48). Wer zuletzt zieht, wird begrenzt. Das ist vorhersehbarer als ein Feld, das man nicht angefasst hat.
3. **IDs** K16 bis K22 (die nächsten freien sind zu prüfen: `grep "id:'K" konfig.js`). Als `befunde` jeweils die bisherigen aus `normReduit`, sonst `[]`.

**Tests:**
- node:
  - Für jede Grenze gibt `pruefeRegeln` eine `korrekturen`-Meldung mit dem richtigen `feld` und den begrenzten Wert in `P.d` zurück. Danach liefert `computeData(P.d).warn` keine `anpassung`.
  - Fälle: `{rw:1100, doorW:1200}`, `{rh:2000, doorH:2200}`, `{doorPos:'L', doorOff:900}`, `{shape:'U', rw:900, dLeft:450, dRight:450}`, `{rd:600, dBack:400}`, `{rh:1800, gapBottom:600, gapTop:800}`, Sideboard `{h:400, base:'legs', baseH:350}`.
  - Gegenprobe: `computeReduit` direkt meldet weiter «Türbreite» (reduit.test.js 165).
- ui-pruefung `b3`: Reduit, `#rw` auf 1100 setzen. Dann ist `#doorW.value` 1000, `#doorW.max` 1000 und eine Meldung erscheint in `.js-msg`. In `#warns` steht kein `div.anp`.

**Aufwand:** 1 Tag.

---

### Task B5: Tokens, eine Meldungs-Komponente, Anpassungs-Chip, Knopf-Zustände
**Files:**
- Modify `index.html`:
  - CSS `:root` 9–21 (Skalen) und alle Regeln mit `border-radius` oder `font-size` in 1–495. Heute 11 verschiedene Radien und 15 Schriftgrössen; gezählt mit `grep -o`.
  - CSS 76–77 (`.hacts .copied`), 255–260 (`.btn`), 340–356 (Übergänge), 446–449 (`.mbar .copied`, `✓`-Präfix weg, `#mMeta` nicht mehr per `display:none`), 488–492 (`prefers-reduced-motion`)
  - HTML 520 und 957 (`.js-msg`)
  - `flash` 2068–2073 → `melde`
  - alle 14 `flash('.js-msg'…)`-Aufrufe
  - `render` 1336–1352 (Text «Angepasst – …» ersetzt)
  - `onInput` 1812–1834 (Meldung bei Eingabe leeren)
- Test: ui-pruefung `b5`.

**Interfaces:**
- Produces:
  - Tokens `--r-1:6px; --r-2:10px; --r-3:14px; --r-pill:999px; --s-1:4px … --s-6:32px; --fs-12 … --fs-26` (12/13/14/16/20/26)
  - `melde(text, { art = 'erfolg'|'anpassung'|'fehler', undo = false, html = null } = {})`: Icon ✓, ✎ oder ⊘, Opacity/Blur-Blende 180 ms, kein Timer
  - `meldungWeg()`: wird in `onInput` vor `render()` aufgerufen
  - Anpassungs-Chip `<p class="anp-chip" data-feld="sections">✎ Fächer: 3 statt 4 · Grund</p>` nach dem Feld-Container (dieselbe Einfügestelle wie `.hint.sperre` in `zeigeSperren`); er bleibt bis zur nächsten Eingabe.
  - Die betroffene `.group` verliert `collapsed`, das Feld bekommt für 2000 ms die Klasse `puls`.
  - `.chip.status` für «Gesammelt»; `.btn:disabled` und gegatetes `.btn:hover`
  - `--fs`/`--r`-Variablen für B6
- Consumes: `korrekturen[].feld` aus B2.

**Kernentscheide:**
1. **Der Puls als Transition, nicht als Keyframes** (Kapitel 4): `.puls{box-shadow:0 0 0 3px var(--accent-soft)}` mit `transition: box-shadow 200ms var(--ease-out)`. Die Klasse wird nach 2000 ms entfernt.
2. **«Rückgängig» bei einer Anpassung** stellt die Formularwerte vor der auslösenden Eingabe wieder her. `onInput` legt dafür eine Momentaufnahme `vorEingabe` an. Er setzt also nicht nur den angepassten Wert zurück, sonst greift sofort dieselbe Regel.
3. **Text der Meldung in der Leiste:**
   - Eine Anpassung: «Breite auf 1180 mm angepasst · Rückgängig»
   - Mehrere: «3 Werte angepasst · Rückgängig»; die Einzelheiten stehen in den Chips.
   - Der Text der Bauweise-Wahl (1343–1348) bleibt, aber als `art:'erfolg'`.
4. **Dialog-Blende:** Am Handy hat A4 das Sheet schon gebaut, B5 ergänzt nur die Desktop-Blende: `@starting-style` mit opacity und `scale(.98)`, 200 ms; Exit 150 ms mit `transition-behavior:allow-discrete` auf `display` und `overlay`. **Erst nach dem iPhone-Test festlegen**, ob das A4-Sheet so bleibt.
5. **`prefers-reduced-motion`** ergänzt `.warn` (translateY), `.gh svg` (rotate), `.card` (transform), `.swap` (filter blur) und `.puls`, jeweils mit `transition:none`.

**Tests:** ui-pruefung `b5`:
- Eine Meldung steht nach 7 s noch und ist nach einer Eingabe weg.
- `{w:2400, sections:2}` ergibt einen Chip `.anp-chip[data-feld=sections]`, die Gruppe ist offen.
- Mit `emulateMedia({reducedMotion:'reduce'})` hat `.card` eine `transition-duration` von 0s.
- Alle berechneten `font-size` sichtbarer Elemente liegen in {12, 13, 14, 16, 20, 26} px, alle `border-radius` in {0, 6, 10, 14, 999} px (ohne Canvas und SVG).
- `.btn:disabled` hat eine `opacity` unter 1.

**Aufwand:** 1.5 Tage, bei Einsprachen aus dem iPhone-Test bis 2.

---

### Task B4: Entwurf als Objekt mit Zustand
**Files:**
- Modify `konfig.js`: 556–577 (`START`, `startwerte`, `entwuerfeLaden`), 599–615 (`KATALOGFELDER`, `STANDARD`, `geaendert`), 667 (Exporte).
- Modify `index.html`:
  - `restore` 1193–1231
  - `applyData`, `rueckgaengig`, `wechsleTyp`, Zufall 2042–2066
  - `renderColl` 2133–2152 (Meta «(ältere Variante)»)
  - `renderVariante` 2153–2165, `.js-ueberschreiben` 2166–2171, `ladeVariante` 2174–2186, `bwNotice` 2187–2197
  - `sammeln` 2198–2204, `collList` 2210–2230 (Überschreiben nur bei gleichem Typ)
  - `ladeLink` 2248–2254
  - die Steckbrief-Zustandszeile aus A3
- Test: neu `test/entwurf.test.js`; `test/konfig.test.js` (geaendert); ui-pruefung `b4`.

**Interfaces:**
- Produces (konfig.js):
  - `ergaenze(d, start)` → `{ ...start, ...d }` ohne Katalog-Felder, die der Katalog setzt. `katalog` wird neu aus `d.mat` und `d.t` berechnet.
  - `entwurfZustand({ data, variante, herkunft })` → `{ art:'neu'|'gesammelt'|'geaendert'|'link', name? }`
  - `zustandText(z)` → `'Entwurf · Neu'` | `'Gesammelt als «Flur»'` | `'Gesammelt als «Flur» · Geändert'` | `'Entwurf · Von Link'`
  - `geaendert(a, b)` vergleicht nach `ergaenze(…, start)` auf beiden Seiten; `STANDARD` entfällt.
- Produces (index.html):
  - Variable `herkunft` (`'link'|null`), nur im Speicher.
  - `vorher` lebt bis zur nächsten Eingabe; `onInput` setzt es auf null.
  - `ueberschrieben = { i, e }` für das Rückgängig nach «Überschreiben».
- Consumes: Steckbrief-Zustandszeile aus A3 (id dort festgelegt; hier angenommen `#zustand`), `melde(…, {undo:true})` aus B5.

**Kernentscheide:**
1. **Fehlende Felder** älterer Varianten und von Links werden mit `startwerte(DEFAULTS, kind)` ergänzt, nicht aus dem vorherigen Formular. Damit verschwindet die Vererbung in `restore` (heute 1210–1218: Felder, die in `data` fehlen, bleiben stehen). `ladeVariante` und `ladeLink` rufen beide `ergaenze`; `ladeLink` 2251–2253 wird damit kürzer.
2. **«Geändert»** heisst `geaendert(formData(), ergaenze(variante.data))`. Eine ältere Variante gilt also direkt nach dem Laden als ungeändert. Der Dialog `bwNotice` erscheint nur, wenn `pruefeRegeln` korrigiert (Kapitel 9, Vorschlag übernommen).
3. **«Von Link»** bleibt bis Sammeln, Laden, Typwechsel oder Zufall. Eine Eingabe ändert die Herkunft nicht. Nur im Speicher: Nach einem Neuladen zeigt der Entwurf «Neu».
4. **«Überschreiben»** (Leiste und Sammlung) nur bei `e.data.kind === formData().kind`. Sonst ist der Knopf `hidden`. Das behebt den Bug in 2218. Danach Meldung «««X» überschrieben · Rückgängig»».

**Tests:**
- node:
  - `ergaenze` füllt ein fehlendes `frontMat` mit 'korpus'.
  - `geaendert(ergaenze(alt), alt)` ist false für eine Variante ohne `bw` oder `frontMat`.
  - `entwurfZustand` deckt alle vier Fälle ab.
  - Dieselbe ältere Variante, geladen nach Sideboard A und nach Sideboard B, ergibt dasselbe `formData` (Test über `ergaenze`).
- ui-pruefung `b4`:
  - `?plan=` zeigt «Entwurf · Von Link», ohne «Variante passt nicht».
  - Sammeln zeigt «Gesammelt als «…»» und den Chip «Gesammelt».
  - Eine Eingabe zeigt «· Geändert».
  - Laden, warten 7 s, dann ist «Rückgängig» noch klickbar.
  - Reduit-Variante in der Sammlung bei aktivem Sideboard: «Überschreiben» ist versteckt.

**Aufwand:** 1 Tag.

---

### Task B6: Aufklapper mit Wert-Einzeiler, Bauweise als Zeilen, Festhalten-Chips, Regler-Spur
**Files:**
- Modify `konfig.js`: neue Funktion nach 306 (`FELDNAME`), Export in 667.
- Modify `index.html`:
  - HTML 545–884 (Gruppen; Struktur nach A5)
  - `fillBauweisen` 1233–1244, `zeigeBauweisen` 1245–1259
  - `zeigeSperren` 1314–1322 (Spur aus `grenzen`)
  - `OPEN`, `heads`, `applyNarrow` 1920–1941
  - Schloss und `syncLocks` 1943–1975
  - CSS 178ff (`.card`), 365–380 (`.gh`, `.lock`), 425–433
- Test: neu `test/einzeiler.test.js`; ui-pruefung `b6`.

**Interfaces:**
- Produces:
  - `einzeiler(gruppe, d)` → String, für `gruppe` ∈ `aufbau | front | material | platten | zufall | raum | form | tablare | nische`. Beispiel: «Deckel aufgesetzt · 1 Einlegeboden · Füsse 160 mm». Wie gruppiert wird, legt A5 fest.
  - `.gh` bekommt `<span class="gh-wert">` unter dem Titel.
  - localStorage `sideboard-werkbank-v2-offen` = JSON `{ gruppe: boolean }`, auch auf dem Desktop.
  - `data-folgt="front|base|legShape|doorIn|doorPos|shape|nicheL|nicheR"` an `#row-doorsPer`, `#row-slideN`, `#row-handle`, `#row-color`, `#row-frontMat`, `#row-frontT`, `#row-baseH`, `#row-legShape`, `#row-legColor`, `#row-taper`, `#row-hinge`, `#row-doorOff`, `#row-corner`, `#row-nicheL-dims`, `#row-nicheR-dims`.
  - `<ul class="festhalten">` mit `<button class="chip" data-lock="…" aria-pressed>` in der Zufall-Gruppe. `.lock` in den h2 entfällt.
  - CSS-Variablen `--lo` und `--hi` (in %) auf `input[type=range]`, gesetzt in `zeigeSperren`.
  - Bauweise-Zeile: `.card.bw` mit Swatch oder Icon, Name, Preis rechts. Gewählt: `.desc`, `<span class="niveau">Einsteiger</span>` und `<details>` «Tragwerk & Material».
- Consumes: `FELDNAME` und `wertName` (B1), Tokens (B5), Gruppen aus A5.

**Kernentscheide:**
1. **`einzeiler` liegt in `konfig.js`** (rein, testbar) und spiegelt die Sichtbarkeitsbedingungen aus `syncVisibility` 1071–1137 (zum Beispiel `front==='open'` ohne Griff und Farbe). Die Doppelung ist bewusst. Ein Test pro Bedingung schützt sie.
2. **Das Niveau-Wort** kommt aus `['', 'Einsteiger', 'Einsteiger+', 'Etwas Übung']`, heute lokal in `renderSummary` (1380). Es zieht als `NIVEAU_TEXT` nach konfig.js um. Die Punkte `.lvl` entfallen auf der Karte; `#grp-niveau` bleibt `hidden`.
3. **Welche Gruppen standardmässig offen sind:** `OPEN` nach A5. Der gespeicherte Zustand pro Gruppe hat Vorrang. **Erst nach dem iPhone-Test festlegen**, weil «Breite» über dem Falz bleiben muss.
4. **Die Regler-Spur** zeigt den erlaubten Bereich nur für `RANGES`-Felder mit aktiver Grenze. Gemacht mit `background: linear-gradient(...)` auf der Spur, ohne zusätzliches Element.

**Tests:**
- node: `einzeiler` je Gruppe mit Startwerten und mit `front:'open'`, `base:'none'`, `shape:'I'` (Nische). Er liefert keinen leeren String und nennt keine Werte, die gerade verborgen sind.
- ui-pruefung `b6`:
  - Desktop: Material zuklappen, neu laden, die Gruppe bleibt zu.
  - Handy: `.gh-wert` von Aufbau ändert sich nach einer Eingabe im Feld `shelves`.
  - Kein `.lock` mehr in den h2; Festhalten-Chip «Masse» umschalten, dann steht im Zufall-Titel «· 1 fest».
  - Eine nicht gewählte Bauweise-Zeile ist höchstens 56 px hoch.

**Aufwand:** 2 Tage.

---

## Einkaufen und Bauen (Punkte 1–4 aus «Ausserhalb der Richtung»)

### Task E1: «ohne Beschläge» beim Sideboard beschriften
**Files:**
- Modify `index.html`: `renderKauf` 1487 (`#kaufKopf`) und `bwPreisHint` 1256–1258 (sagt es heute schon).
- Modify `einkauf.js:27-29` (Abschnitt «Beschläge & Kleinteile»).
- Test: `test/einkauf.test.js`; ui-pruefung `e1`.

**Interfaces:**
- Produces: `#kaufKopf` beim Sideboard «Sideboard 1200 × 720 × 419 mm · ca. CHF 245 ohne Beschläge». Info zum Abschnitt «nicht im Total» beim Sideboard, beim Reduit leer.
- Consumes: Preis-Aufschlüsselung hinter `▸` aus A3 (dort «ohne Beschläge (Sideboard)»).

**Kernentscheide:**
1. Beschriften statt schätzen (Kapitel 9, Vorschlag). Eine Schätzung wäre ein eigener Task mit Preisen für Topfscharniere und Griffe in `preise.js`.
2. Woran erkannt wird: `R.kind !== 'reduit'`, nicht `R.hw.some(h => h[3])` (einkauf.js 27). Wenn ein Sideboard-Kaufteil einmal einen Preis bekommt, kippt der Titel sonst still.

**Tests:**
- node: `einkaufsliste(sideboard)`: Abschnitt «Beschläge & Kleinteile» mit `info === 'nicht im Total'`; Reduit mit `info === ''`.
- ui-pruefung `e1`: `#kaufKopf` endet beim Sideboard auf «ohne Beschläge», beim Reduit nicht.

**Aufwand:** 0.25 Tage. Kommt nach A3.

### Task E2: Ganze Bretter beim Reduit nur einmal auf der Liste
**Files:**
- Modify `reduit.js:748-753` (das `hw.unshift` der Bretter streichen).
- Modify `test/reduit.test.js:244-248`: Die Bretter-Zeilen prüft der Test neu über `einkaufsliste` im Abschnitt «· ganze Bretter»; der Teil «Bretter zählen nicht als Kaufteile» wird zu `buyCost === Summe(hw)`.
- Test: `test/einkauf.test.js` (neuer Fall).

**Interfaces:**
- Produces: `R.hw` enthält keine Brett-Zeilen mehr. `einkaufsliste` zeigt die Bretter nur im Abschnitt `${g.label} · ganze Bretter` (einkauf.js 14–17).
- Consumes: nichts. `R.hw` mit Brettern liest sonst niemand: im Repo per grep geprüft, index.html greift nur über `einkaufsliste` darauf zu.

**Kernentscheide:**
1. Gestrichen wird in `reduit.js`, nicht in `einkauf.js`. `buyCost` wird schon vor dem `unshift` berechnet (742), die Kosten ändern sich also nicht.
2. Die Haken-ids der Brett-Zeilen in «Beschläge & Kaufteile» verfallen. `hakenFiltern` blendet sie ohne Migration aus.

**Tests:**
- node: Reduit mit `mat:'gon_fichte'`. In der ganzen `einkaufsliste` kommt «Brett» bzw. «ganzes Brett» nur im Abschnitt «ganze Bretter» vor. `kostenGesamt` ist vorher und nachher gleich (Wert festhalten).
- Kein UI-Test nötig.

**Aufwand:** 0.5 Tage, sofort umsetzbar (unabhängig von Stufe A).

### Task E3: Latten und Kleinteile in Kaufeinheiten (Entscheid offen, Kapitel 9)
**Files:**
- Modify `reduit.js:150-151` (`BUY_INFO` kant45 und latte mit `laengen`), 679–690 (`ctx.add` mit `pm`), 755 (`solidCost`).
- Modify `einkauf.js:24-26` (Abschnitt Massivholz).
- Modify `preise.js` (Kaufteile: Packungsgrössen).
- Modify `shared.js:105-139` (`packBoards` wiederverwenden).
- Test: `test/einkauf.test.js`, `test/reduit.test.js`.

**Interfaces:**
- Produces:
  - `BUY_INFO.latte.laengen = [2000, 2500]` und `kant45.laengen`.
  - `R.lattenKauf = [{ key, L, n, price }]`.
  - Abschnitt «Massivholz Fichte» mit Zeilen «3 × Dachlatte 24 × 48 mm, 2,5 m» und als Unterzeile «daraus: 4 × 1180, 2 × 600 mm».
  - `preise.js` → `kaufteile[k].pack` (Stück pro Packung). Hardware-Zeilen zeigen dann «2 Pack à 100 (davon 140 nötig)».
- Consumes: E2 (gleiche Datei, gleiche Stelle).

**Kernentscheide:**
1. `solidCost` aus den gekauften Längen (n × L × Preis/m) statt aus dem Verschnitt-freien Laufmeter. Der Preis wird ehrlicher, aber `kostenGesamt` ändert sich. Snapshot und Kosten-Tests im Reduit ziehen nach (beim Sideboard nicht betroffen).
2. Für Packungsgrössen braucht es Jumbo-Daten (`tools/jumbo-preise.mjs`, `jumbo-quellen.json`). Ohne Daten nur die Latten, Packungen später.

**Tests:**
- node: Latten-Stücke über 2500 mm werden nicht gekauft (die Regel kürzt sie vorher). Die Summe der Stücke plus Schnittfugen ist pro Kauflatte höchstens L. Die Zeilen-ids bleiben bei gleicher Eingabe gleich.

**Aufwand:** 1 Tag für die Latten, plus 0.5 Tage für Packungen. Erst nach Kims Entscheid und nach E2.

### Task E4: Bauen mit Kontext, Hinweis nur bei sichtbarer Bühne
**Files:**
- Modify `index.html`: HTML 916–924 (`#p-bauen`: Kopfzeile, `.hint-touch`), CSS 383 und 390–396 (Orte-Media-Query), `renderKauf` 1487 (Text teilen).
- Test: ui-pruefung `e4`.

**Interfaces:**
- Produces: `<p id="bauKopf">` in `#p-bauen`, Text gleich `#kaufKopf` ohne Preis, plus «· Variante «X»», wenn eine geladen ist. Funktion `ergebnisKopf(R, { preis })`, die `#kaufKopf` und `#bauKopf` speist. CSS `@media (max-width:920px){ body[data-ort="bauen"] .hint-touch{display:none} }`.
- Consumes: `kaufTitel` (1478), Steckbrief und Zustand aus A3/B4 (wenn B4 vorher kommt, `zustandText`).

**Kernentscheide:**
1. Der Hinweis auf die 3D-Hervorhebung wird am Handy im Ort Bauen ausgeblendet, weil `.cfgwrap` mit der Bühne dort `display:none` ist (392). Die Hervorhebung in Tabelle und Plattenplan bleibt.
2. Eine Funktion für beide Kopfzeilen, damit Einkaufen und Bauen nicht auseinanderlaufen.

**Tests:** ui-pruefung `e4` am Handy unter `#bauen`:
- `#bauKopf` ist sichtbar und enthält «Sideboard» und «mm».
- `.hint-touch` hat `offsetParent === null`.
- Unter `#entwerfen` am Desktop ist `.hint-fine` sichtbar.

**Aufwand:** 0.5 Tage. Kommt nach A3 und A6.

---

## Aufwand gesamt

| Task | Tage | Kommt nach | Wartet auf iPhone-Test |
|---|---|---|---|
| E2 | 0.5 | – | nein |
| B1 | 0.5 | A5 | nein |
| B2 | 3 | B1 | Platz der Rückmeldungszeile |
| B3 | 1 | B2 | nein |
| B5 | 1.5–2 | B2 | Meldung in der Leiste, Dialog-Blende |
| B4 | 1 | B5 (Logik ab B1) | nein |
| B6 | 2 | B1, B5, A5 | offene Aufklapper, Regler 44 px |
| E1 | 0.25 | A3 | nein |
| E4 | 0.5 | A3, A6 | nein |
| E3 | 1–1.5 | E2, Entscheid | nein |
| **Summe** | **11.25–12.25** | | |

Ohne E3 ergibt das 10.25 bis 10.75 Tage. Die Spec rechnet für B 7 bis 9 Tage. Der Mehraufwand kommt aus der Testmigration in B2 (etwa 60 statt «ca. 45» Stellen, dazu Snapshot und Korrekturen).