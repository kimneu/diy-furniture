# Task 5 (A5) – Bericht: Formular Stufe 1 – Masse zuerst, Aufteilung, Zufall ans Ende

**Status:** DONE_WITH_CONCERNS (nur kleine Abweichungen im Prüfcode, siehe «Abweichungen»)
**Commit:** `ae6b65c` Formular: Masse zuerst, Aufteilung, Zufall ans Ende (Basis `9742afc`, nicht gepusht)

## Umsetzung pro Step

1. **node:test-Tests** – die zwei Tests aus dem Brief unverändert ans Ende von `test/konfig.test.js` angehängt.
2. **Rot** – `node --test`: 206 Tests, 2 fail. Test 1 scheitert an `K.SPERREN.aufteilung` (`undefined`, erwartet `['sections','front','base']`). Test 2 scheitert mit «TypeError: Cannot read properties of undefined (reading 'matchAll')». Beides wie im Brief.
3. **`PRUEFUNGEN.a5`** – nach `a4` in `tools/ui-pruefung.mjs` eingefügt, Code aus dem Brief. Dazu kommt Step 10b (iPhone SE und alter Speicher), siehe unten. Das Präfix «a5: » habe ich aus allen Texten entfernt, wie im Ruling festgelegt (`ctx.pruefe` setzt die id selbst davor).
4. **Rot** – `node tools/ui-pruefung.mjs a5`: Exit 1, 5 ok, 18 FEHLT. Die erwarteten Zeilen sind alle dabei:
   - «FEHLT a5: Gruppen Sideboard: (ohne Titel) · Masse · Bauweise · Aufbau · Front · Optik · Platten & Preise»
   - «FEHLT a5: Bühne bei Fokus auf Breite 253 px (≤ 130, vorher 253)»
   - «FEHLT a5: Gruppen Reduit: (ohne Titel) · Raum · Bauweise · Form · Tablare · Nische · Optik · Platten & Preise»
   - «FEHLT a5: «Front im Detail» weg bei offenen Fächern»
   - «FEHLT … SE 375×667 – Breite über dem Falz (unten 609 < 517)» und «FEHLT … alter Speicher lädt ohne Fehler (…; Zufall nicht klickbar)»

   Schon vorher grün waren: Einsatzort als letzte Zeile, die beiden Regler-Prüfungen und die zwei y-<-700-Prüfungen. Diese standen schon bei y 618, weil A3 den Kopf verkleinert hat.
5. **`SPERREN`** – die fünf Einträge aus dem Brief übernommen, `aufteilung` zwischen `nische` und `aufbau` eingefügt, den Kommentar neu geschrieben. Danach meldete `node --test` noch 1 fail (Test 2), wie erwartet.
6. **Formular `#cfg`** – mit einem Skript umgebaut, das jede Blockgrenze per Assert prüft. Alle Blöcke sind unverändert verschoben, neu sind nur die Hüllen und Titel aus dem Brief. Die alten Hüllen sind weg: der Zufall-Kopf samt Schloss-Satz, der alte Raum-Hinweis sowie Form, Tablare, Aufbau und Front. Den Zeilen-Multiset alt gegen neu habe ich verglichen: Weggefallen und dazugekommen sind genau die Hüllen, Titel und Hinweise, sonst nichts. Ausserhalb von `<form>` hat sich nichts verändert.
7. **JS** – `OPEN` neu (Wortlaut wie im Brief). In `syncVisibility` steht `$('#grp-front').hidden = reduit || front === 'open';` direkt nach der Zeile mit `#grp-joint`, also nach der `[data-kind]`-Schleife. Den Sideboard-Text von `bwHint` habe ich auf «… Masse, Aufteilung und Front bleiben frei.» geändert. `heads`/`applyNarrow`, der Schloss-Code und `formData`/`restore` sind unverändert.
8. **CSS** – `.mehr{…}` steht nach `.group h2{…}`. `.cfgwrap:has(.controls input[type=number]:focus) #stage{height:120px;min-height:120px}` steht im Block `@media (max-width:920px)` mit `.app` als erster Regel, direkt nach `#stage`. Ohne Transition, wie vorgegeben.
9. **Grün** – `node --test`: 206 Tests, 206 pass, 0 fail. Der bestehende Test mit `['tablare']` bleibt grün.
10. **Prüfung** – `node tools/ui-pruefung.mjs a5`: 23 ok, 0 FEHLT, Exit 0. Die ganze Suite `node tools/ui-pruefung.mjs`: **116 ok, 0 FEHLT**, Exit 0. Vor dem Task waren es 93 ok, dazu kommen jetzt 23 von a5. t0 und a1–a4 sind unverändert grün.
    - Die Bilder `a5-handy-sideboard.png` und `a5-handy-reduit.png` habe ich angesehen. Unter Bühne und Steckbrief steht «MASSE» bzw. «RAUM», das erste Feld ist «Breite».
    - Dazu ein eigenes Bild vom Formular-Ende: Unter «Material» folgt «MEHR» (dunkel), darunter «PLATTEN & PREISE» und «ZUFALL» mit Knopf und kurzem Hinweis. Das Ende liegt über der Leiste.
10b. **iPhone SE und alter Speicher** (beide in `PRUEFUNGEN.a5`):
    - «SE 375×667 – Breite über dem Falz»: `#w` unten 487 < 517 (ok). Zusätzlich das Bild `a5-handy-se.png`.
    - «alter Speicher lädt ohne Fehler»: Gesetzt sind `sideboard-werkbank-v2-schloss = ["aufbau","front"]` und ein Entwurf `{kind:'sideboard', sideboard:{kind, bw:'S1', sections:'3', front:'hinged', base:'legs', top:'between', shelves:'2', handle:'knob', color:'salbei'}}`. Geprüft wird:
      - `ctx.fehler` ist nach dem Laden und nach dem Würfeln leer,
      - die Gruppen stehen in der neuen Reihenfolge (SB),
      - die Gruppe «Zufall» lässt sich aufklappen, `#bZufall` ist echt klickbar (`page.click`), danach erscheint die Meldung «Neu gewürfelt».

      Ergebnis: ok.
11. **Commit** – Nachricht aus dem Brief. Nur die vier Dateien sind gestagt, `tools/ui-shots` und `tools/node_modules` nicht.

## Gruppen-Reihenfolge, wie gerendert

- **Sideboard** (Handy und Desktop): Masse · Bauweise · Aufteilung · Aufbau im Detail · Front im Detail · Material · [«Mehr»] · Platten & Preise · Zufall
- **Reduit** (Handy): Raum · Bauweise · Form & Tablare · Tür · Tiefen & Abstände · Nische · Material · [«Mehr»] · Platten & Preise · Zufall
- Versteckt bleiben Bauart, Verbindung und Niveau. Verbindung und Niveau stehen vor «Mehr».
- Am Handy offen sind Masse/Raum, Bauweise, Aufteilung bzw. Form & Tablare, alle anderen sind zu, auch «Zufall». Am Desktop ist alles offen.

## Messungen (Chromium headless, Patchright)

| Messung | Wert |
|---|---|
| `#w` y, 390×844, Erstbesuch | 497 (unten 541), Leiste oben bei 710 |
| `#w` y, 375×667, Erstbesuch | 443 (unten 487), Leiste oben bei 533, Abstand 46 px |
| `#rw` y, Reduit 390×844 | 497 |
| `#stage` ohne / mit Fokus auf `#w` (390×844) | 253 / 120 px |
| `#stage` ohne / mit Fokus (375×667) | 200 / 120 px |
| `#stage` mit Fokus auf Regler `#w-r` | 253 (bleibt) |
| Leiste `.mbar` | 133.75 px, unverändert. Formular-Ende 703.9 bei Leiste oben 710.25 (Zufall aufgeklappt) |

Die Leiste ist nicht höher geworden, darum habe ich `padding-bottom:140px` von `.app` nicht angefasst.

## Geänderte Dateien

- `konfig.js` – Kommentar und `SPERREN`
- `index.html` – CSS `.mehr` und die Fokus-Regel, Formular `#cfg`, `syncVisibility` (eine Zeile), `bwHint` (Sideboard), `OPEN`
- `test/konfig.test.js` – zwei neue Tests am Ende
- `tools/ui-pruefung.mjs` – `PRUEFUNGEN.a5` (Brief-Code plus Step 10b)

## Selbstprüfung

- **id/name-Diff** gegen `HEAD~1`:
  - `name="…"`: keine Ausgabe, also identisch.
  - `id="…"`: genau sechs neue Zeilen, `grp-aufteilung`, `grp-front`, `grp-tiefen`, `grp-tuer`, `grp-zufall` und `mehr`. Sonst keine Änderung.
- **Titel** wie im Brief: «Aufteilung», «Aufbau im Detail», «Front im Detail», «Material», «Form & Tablare», «Tür», «Tiefen & Abstände», «Zufall». «Optik» gibt es im Formular nicht mehr, das prüft a5.
- **`data-lock` gegen `SPERREN`**: Die Schlüssel sind identisch, und jede der sechs geprüften Gruppen hält genau ihre Felder (node-Test 2).
- **`syncVisibility`**: Keine sichtbare Gruppe ist leer.
  - Aufteilung: Fächer, Türen und Untergestell sind immer sichtbar.
  - Aufbau im Detail: Deckel und Einlegeböden sind immer sichtbar.
  - Front im Detail: Bei `open` ist die ganze Gruppe weg, sonst stehen dort Türen pro Fach oder Anzahl Schiebetüren sowie Material, Hinweis, Griff und Farbe.
  - Form & Tablare: «Regal an» und die Anzahl sind immer sichtbar.
  - Tür: Breite, Höhe, Lage und «nach innen» sind immer sichtbar.
  - Tiefen & Abstände: «Tiefe hinten», «ab Boden» und «bis Decke» sind immer sichtbar.
  - Nische: wie bisher weg bei `shape I`.

  Versteckte Zeilen stehen nirgends am falschen Ort.
- **Zurückhaltung**: nichts über den Brief hinaus im App-Code. «Was gut ist» bleibt unberührt: keine neuen Transitions, `placePill`/ResizeObserver, Hover-Gating.

## Abweichungen und Bedenken

1. **Prüfcode a5, kleine Abweichungen vom Brief-Code:**
   - **Präfix:** «a5: » fehlt in den Texten (Ruling).
   - **`await p.close()`:** steht vor jeder neuen Seite in a5. Jede offene Seite hält eine WebGL-Schleife in SwiftShader am Laufen.
   - **Timeouts:** Für das Würfeln in 10b habe ich sie erhöht, auf 5 s fürs Aufklappen, 10 s für `#bZufall` und 5 s für die Meldung. Der Grund: Beim ersten Lauf mit 2 s meldete Patchright «performing click action … Timeout 2000ms exceeded». Würfeln samt 3D-Neuaufbau dauerte unter der Last mehrerer offener Seiten länger als 2 s. Einzeln lief der Klick sofort durch, die Funktion war also nie das Problem.
   - **Bild:** zusätzlich `a5-handy-se.png`.
2. **Gelöste Prüfungen:** «Breite ohne Scrollen» und «Raumbreite ohne Scrollen» waren schon vor dem Umbau grün (y 618, weil A3 den Kopf verkleinert hat). Rot wurden sie also nicht, sie wirken als Wächter gegen Rückschritte. Jetzt liegen sie bei y 497.
3. **Alte Schlösser** (Entscheid 10): «aufbau» und «front» halten jetzt nur noch die kleineren Gruppen fest, eine Migration gibt es nicht. 10b zeigt, dass das ohne Fehler lädt und würfelt.
4. **Nur am echten iPhone prüfbar** (Spec Kapitel 10):
   - Schrumpft die Bühne beim Tippen in «Breite» von 253 bzw. 200 auf 120 px?
   - Bleibt der Preis über der Tastatur sichtbar?
   - Scrollt iOS das fokussierte Feld nach dem harten Umschalten richtig in den Blick?
   - Steht «Breite» mit der Safari-Leiste unten noch über dem Falz?
   - Landet der erste Wisch auf dem Canvas?
   - Bei Querformat ≤ 920 px schrumpft die (dort statische) Bühne ebenfalls, wie im Brief vorgesehen (nur ≤ 920 px). Harmlos, aber ungeprüft am Gerät.
5. **Desktop:** «Zufall» steht jetzt am Ende des scrollbaren Formulars statt oben. Das verlangt der Brief so, ist aber für Desktop-Nutzer eine spürbare Änderung (Aufklapper erst in B6).
