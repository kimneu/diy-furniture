# Task 3 – Bericht: Kopf schrumpfen, Steckbrief, Leiste (A3)

Status: DONE_WITH_CONCERNS. Alles ist wörtlich nach Brief umgesetzt, in der Reihenfolge der Steps. Keine Abweichung im Code. Die Bedenken betreffen nur Messwerte, die anders sind als in Brief/Auftrag angenommen (Leistenhöhe), siehe «Bedenken».

Commits auf `ux-review`, nicht gepusht:
- `ed6152b Steckbrief: Masse, Teile und Preis-Aufschlüsselung in konfig.js` – `konfig.js`, `test/steckbrief.test.js`
- `ca7d5a7 Kopf: Steckbrief unter der Bühne, Masse beschriftet, Leiste mit Preis-Blitz und Aufschlüsselung` – `index.html`, `tools/ui-pruefung.mjs`

Nicht im Commit: `tools/ui-shots`, `tools/node_modules`. Wegwerf-Messskripte lagen kurz unter `tools/_mess-a3*.mjs` und sind gelöscht.

## Umgesetzt (je Step)

- **Step 1:** `PRUEFUNGEN.a3` wörtlich aus dem Brief, direkt nach `a2`, darüber eine Kommentarzeile im Stil von `t0`/`a1`/`a2`. Die Prüftexte im Brief haben kein «a3: »-Präfix, nichts zu entfernen.
- **Step 3:** `test/steckbrief.test.js` wörtlich aus dem Brief.
- **Step 5:** In `konfig.js` direkt nach `kostenGesamt` drei Funktionen, je mit einer Kommentarzeile darüber:
  - `masseText(R)`: Reduit (nur `R.kind === 'reduit'`) `Raum B … · T … · H … mm`, sonst `B … · H … · T(Dtot) … mm`.
  - `steckbriefText(R, d)`: `BW[d.bw || bauweiseVon(d)].name`, Teile (Summe `qty`), Platten (Gruppen ohne `boards`, Rückwand eingeschlossen), Bretter (Gruppen mit `boards`); Einzahl bei 1, Nullen fallen weg, Verbindung « · ».
  - `preisAufschluesselung(R)`: Felder exakt nach Tabelle, ungerundet.
  - Export hinten an `module.exports` nach `planAusCode`.
- **Step 8 (HTML):** (a) `<div>` mit h1 und Untertitel ersetzt durch `<h1>Martylko</h1>`, svg bleibt. (b) `dl#summary` und alte `.hacts` ersetzt durch `p.kopfbrief.js-steckbrief` und neue `.hacts` (kPrice, ▸-Knopf, Sammeln/Link/Überschreiben, Sammlung, js-msg) – wörtlich. (c) `p#steckbrief.steckbrief.js-steckbrief` nach `.stage-wrap`, vor `</section>`. (d) `.mprice` der Leiste wörtlich ersetzt (Sammeln ohne `ghost`, `.mzeile` mit `button#mMeta.metabtn[popovertarget=aufschl]` und `.js-msg`). (e) `<div class="aufschl" id="aufschl" popover></div>` direkt nach `#mbar` im body.
- **Step 9 (CSS):** Alle Ersetzungen und Löschungen nach Brief, jeweils über den wörtlichen alten Text gefunden (Skript mit Assertion «genau ein Treffer» je Stelle):
  - `.top` neu (vier Spalten, `"brand kind brief acts"`), gelöscht `.brand p`, `.summary`, `@media (max-width:920px){.kindpick…}`, `.variante`, `.variante b`, alle `.summary …` bis `.summary small`.
  - `.hacts` flex; `.hacts .copied:empty` ersetzt durch den Block `.js-msg` … `.aufschl .hint` (wörtlich).
  - Desktop-Block `min-width:1200px`: `.top`, `.brand p`, vier `.summary`-Regeln und `.hacts` gelöscht; `.brand svg`, `.brand h1` bleiben.
  - Orte: `body:not([data-ort="entwerfen"]) .mbtns{display:none}`.
  - Bühne Handy: `height:30svh;min-height:200px`.
  - Handy-Leiste: `.mprice`-Raster plus sechs Folgeregeln (wörtlich); gelöscht `.mbar > div:first-child`, `.mbar .copied:empty`, `.mbar .copied:not(:empty)`, `.mbar div:has(…) #mMeta`; `.mbar #mMeta` und `.mbtns` ersetzt; `.hacts`/`.top` des Handy-Kopfs ersetzt durch die drei Zeilen aus dem Brief. Stehen geblieben: `.mbar b` (beide), `.mbar span`, `.mbar .nm`, `.mbar .copied:not(:empty)::before`.
  - Block `max-width:640px`: `.top`, `.brand p`, `.summary`, `.summary .wide` gelöscht; `.brand svg`, `.brand h1` bleiben.
  - Reduced Motion: `.js-preis.blitz{transform:none}` nach `:active{transform:none!important}`.
- **Step 10 (JS):** `render`: `#dimTag` über `masseText(R)`, danach Schleife über `.js-steckbrief .sb-was` mit `steckbriefText(R, P.d)`. `renderSummary`: `let letzterPreis = null; …` davor; `main`, `cost/whole`, `item`, `wood…`, `sheets`, `boards…`, `#summary`-Block, `#mPrice`-Zeile gelöscht; `parts`, `lvlText`, `chf`, `reduit`, `why` bleiben; neuer Block (Preis in alle `.js-preis`, `.blitz` 300 ms, `#mMeta` mit ▸, `#aufschl`-Inhalt) wörtlich. `flash` ganz ersetzt (mit Kommentarzeile aus dem Brief). `renderVariante`: `zustand` in alle `.js-steckbrief .sb-zustand`; Knopftext `: 'Sammeln'`.

## Tests und Ergebnisse

**Step 2 – a3 rot** (`node tools/ui-pruefung.mjs a3`, vor der Umsetzung): Exit 1, `5 ok, 22 FEHLT` – genau wie im Brief. ok waren «.blitz nach 300 ms entfernt», «Leistenhöhe während der Meldung unverändert», «Sammeln und Link in Entwerfen sichtbar», «Preis in Einkaufen sichtbar», «Desktop: genau ein gefüllter Knopf im Kopf». FEHLT u. a.:
```
FEHLT a3: Handy: Kopf höchstens 64 px hoch
FEHLT a3: Handy: Masstafel Sideboard «B … · H … · T … mm»
FEHLT a3: Handy: Preis blitzt bei Preisänderung (.blitz)
FEHLT a3: Handy: Reduit ohne horizontalen Überlauf
FEHLT a3: Zwischenbreite 1000 px: Kopf eine Zeile mit Steckbrief, kein Überlauf
5 ok, 22 FEHLT
```

**Step 4 – Test rot** (`node --test test/steckbrief.test.js`): 4 von 4 fail.
```
not ok 1 - masseText beschriftet die Masse je Möbel          TypeError: K.masseText is not a function
not ok 2 - steckbriefText: …                                  TypeError: K.steckbriefText is not a function
not ok 3 - preisAufschluesselung: Sideboard …                 TypeError: K.preisAufschluesselung is not a function
not ok 4 - preisAufschluesselung: Reduit …                    TypeError: K.preisAufschluesselung is not a function
```

**Step 6 – grün:** `node --test test/steckbrief.test.js` 4/4 ok; `node --test` → `# tests 202 # pass 202 # fail 0`. Danach Commit `ed6152b`.

**Step 11 – grün:**
- `node tools/ui-pruefung.mjs a3`: `27 ok, 0 FEHLT`, Exit 0 – in drei Läufen hintereinander.
- `node tools/ui-pruefung.mjs t0 a1 a2 a3`: `65 ok, 0 FEHLT`, Exit 0.
- `node --test`: 202 pass, 0 fail (vor und nach dem Commit `ca7d5a7`).
- `grep -n "summary\b\|#variante\|In Sammlung\|Link teilen" index.html` → genau zwei Zeilen: `337:.pplan summary{…}` und `922:<summary>Plattenplan für den Zuschnitt</summary>`.

**Sichttest der Bilder** `tools/ui-shots/a3-*.png`:
- Handy (`a3-handy-aufschluesselung`, `-meldung`, `-reduit`): Kopf einzeilig, Marke links, Chip rechts. Unter der Bühne zwei Zeilen «Sperrholz geölt · 10 Teile · 2 Platten» / «Entwurf» (Reduit «Pfostenrahmen · 67 Teile · 4 Platten»). Masstafel «B 1200 · H 720 · T 419 mm» bzw. «Raum B 1600 · T 1400 · H 2400 mm». Leiste: «CHF …», [Sammeln] gefüllt, [Link] Ghost, Meta-Zeile «Holz Zuschnitt · 10 Teile ▸»; bei Meldung steht «✓ Neu gewürfelt. Rückgängig» an derselben Stelle. Popover mit Total, Holz Zuschnitt, «Ganze Platten statt Zuschnitt», «Ohne Beschläge – Richtwert.» über der Leiste.
- Desktop 1440 (`a3-desktop`) und 1000 px (`a3-zwischenbreite`): eine Zeile mit Marke, Chip, Steckbrief, «CHF 245 ▸», [Sammeln], [Link], «Sammlung». Nichts abgeschnitten, kein Überlauf. Auch dunkel (`t0-desktop-dunkel`) sauber.
- Zusätzlich (Wegwerfskript, Bild gelöscht): Desktop-▸ öffnet die Aufschlüsselung oben rechts (top 64, rechts 20, 320 px breit, unter dem Kopf mit Unterkante 61.5), Klick daneben schliesst sie (light dismiss).

## Messungen

Handy 390×844 (isMobile, DPR 2), Desktop ohne Touch. «vorher» = HEAD `e854128` als `git archive` in /tmp, «nachher» = Arbeitsbaum nach Step 10.

| Messung | vorher | nachher |
|---|---|---|
| Kopf Handy, Sideboard / Reduit | 312 / 312 px | 57 / 57 px |
| Kopf Desktop 1440 / 1200 | 75 / – px | 53.5 / 53.5 px |
| Kopf 1000 / 921 px | 172 / – px | 59 / 59 px |
| `scrollWidth` Handy Reduit | 434 | 390 |
| `scrollWidth` Handy Sideboard | 390 | 390 |
| `#mbar` Höhe vor / während Meldung | 109 / 109 px | 133.75 / 133.75 px |
| `#stage` Höhe Handy | 321 px (38svh) | 253 px (30svh) |
| `.kopfbrief` Breite 1440 / 1200 / 1000 / 921 | – | 739 / 499 / 265 / 186 px |
| `#steckbrief` Höhe Handy (zwei Zeilen) | – | 36 px |
| Popover Handy: Unterkante bis Leiste (Sideboard / Reduit) | – | 26 px / 26 px |
| Meldung nach 6.4 s | – | `.an` weg, leer, Leiste 133.75 px |

## Geänderte Dateien

- `konfig.js` – drei Funktionen nach `kostenGesamt`, Export ergänzt
- `test/steckbrief.test.js` – neu, 4 Tests
- `index.html` – HTML Kopf/Viewer/Leiste/Popover, CSS, JS (`render`, `renderSummary`, `flash`, `renderVariante`)
- `tools/ui-pruefung.mjs` – `PRUEFUNGEN.a3`

## Selbstprüfung

- Vollständigkeit: Jede HTML-, CSS- und JS-Stelle aus Step 8–10 per Skript mit «genau ein Treffer»-Assertion ersetzt; keine Stelle fehlte oder traf doppelt. Alle 27 `pruefe` aus dem Brief stehen in `a3` (Funktion wörtlich übernommen). Beide Commits mit den Brief-Meldungen.
- Namen wie im Brief: `#steckbrief`, `.steckbrief`, `.kopfbrief`, `.js-steckbrief`, `.sb-was`, `.sb-zustand`, `#kPrice`/`#mPrice` mit `.js-preis`, `.blitz`, `#mMeta.metabtn`, `#aufschl.aufschl[popover]`, `.mzeile`, `.js-msg.an`, `letzterPreis`, `masseText`, `steckbriefText`, `preisAufschluesselung`. Keine id und kein `name` eines Formularfelds geändert; `#kind`, `#bKind`, `#kindName` unverändert.
- Disziplin: nichts über den Brief hinaus; Wortschatz unverändert («Variante «…» · geändert», «Entwurf»), nur die zwei Knopftexte «Sammeln»/«Link» wie verlangt. `zeigeOrt` nicht angefasst (nur konsumiert).
- «Was gut ist»: neue Übergänge nennen exakte Properties (`opacity`, `filter`, `color`, `transform`), Dauern 80–220 ms, `--ease-out` bei Preis und Popover; kein neues `:hover`. Reduced Motion schaltet den Blitz-Transform ab.
- Keine Namenskollision der neuen Globals in `index.html` (vorher per grep geprüft).
- `#collMsg` nutzt die neue `flash`: bekommt `.an` ohne Wirkung (nicht `.js-msg`), leert sich jetzt 180 ms nach dem Ausblenden statt sofort – unsichtbar, wie im Brief beschrieben.

## Bedenken / Abweichungen

1. **Leistenhöhe anders als angenommen.** Der Auftrag nannte «Leiste nach Task 2 etwa 150 px», der Brief «Popover nach A2 rund 8 px über der Leiste». Gemessen: Leiste nach A2 109 px (wie im Task-2-Bericht), nach A3 133.75 px, weil die Meta-Zeile jetzt eine eigene Rasterzeile unter Preis/Knöpfen hat (+25 px). Die Ortsknöpfe waren schon vor A2 44 px hoch (content-box 28 + 16), A2 hat die Höhe also nicht verändert. Darum liegt das Popover (Abstand 160 px vom unteren Rand) 26 px über der Leiste statt 8 px – Prüfung grün, Bild sauber. Kein Handlungsbedarf, nur die Zahl im Plan stimmt nicht.
2. **Puffer Formular/Leiste kleiner.** `.app` hat am Handy `padding-bottom:calc(140px + safe-area)`; die Leiste ist jetzt 133.75 px hoch, der Puffer schrumpft von 31 auf rund 6 px. `a1` «Formular-Ende über der Leiste» bleibt grün. Mit Safe-Area am iPhone wachsen Polster und Leiste gleich (beide `+ env(safe-area-inset-bottom)`). Falls A5 die Leiste noch höher macht, muss das Polster mit.
3. **Nur am echten iPhone prüfbar:** Popover-API und `@starting-style` (iOS ≥ 17 bzw. 17.4; ältere iPhones ohne Blende), `30svh` mit ein-/ausgeblendeter Safari-Leiste, Lage des Popovers mit `env(safe-area-inset-bottom)` über der Leiste, Blende der Meldung über der Meta-Zeile (`:has()`), Light-Dismiss per Tipp daneben.
4. Kleinigkeit ausserhalb des Briefs, nicht geändert: Das Popover blendet nur ein, nicht aus (kein `transition-behavior:allow-discrete` für `display`/`overlay`); so verlangt der Brief.

---

## Fix-Runde 1 (Review: Zustand «geändert»)

Commit `325aed5 Kopf und Leiste: Zustand «geändert» ohne Umbruch, Überschreiben nur in der Sammlung` (`index.html`, `tools/ui-pruefung.mjs`), nicht gepusht.

### Was geändert ist

- **Knopftext:** In `renderVariante` heisst der Zustandsknopf im Zustand «geändert» jetzt «Neue Variante» statt «Als neue Variante», im Kopf und in der Leiste. «Sammeln» und «Gesammelt ✓» bleiben.
- **Überschreiben:** Den Knopf `.js-ueberschreiben` gibt es im Kopf (`.hacts .acts`) und in der Leiste (`.mbtns`) nicht mehr. In `renderVariante` ist die Schleife entfernt, die ihn ein- und ausblendete. Entfernt ist auch der Klick-Handler `for (… '.js-ueberschreiben') addEventListener('click', …)`: Ohne die Knöpfe war er toter Code. In der Sammlungsliste (`data-act="update"`, Handler von `#collList`) ist nichts geändert.
- **Kopf (CSS):** Nach `.hacts{…}` stehen jetzt, mit einer Kommentarzeile, `.hacts .acts{flex-wrap:nowrap}` und `.hacts .acts .btn{flex:none;white-space:nowrap}`. Sie haben Vorrang vor den allgemeinen `.acts{flex-wrap:wrap}` und `.acts .btn{flex:1}`.
- **Leiste (CSS):**
  - `.mprice{grid-template-columns:auto minmax(0,1fr)}`
  - `.mbtns{…;justify-self:end;min-width:0}`
  - Ergänzt: `.mbtns .btn{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}`. Ohne diese Zeile würden die Knöpfe bei Platzmangel über `.mbtns` hinauslaufen statt sich zu kürzen. Erst damit wirkt das «shrink/ellipsize» aus dem Ruling.
- **Sammlungslink im Kopf:** Bleibt sichtbar. Bei 921 px läuft nichts über (Kopf 59 px, `.kopfbrief` 134 px), die Ausweichregel unter 1000 px ist also nicht nötig.
- **`PRUEFUNGEN.a3`:** Zwei neue Helfer:
  - `aendern(page, sel)`: sammelt über den sichtbaren Sammeln-Knopf, ändert dann `#w` um +400 und meldet true, sobald der Knopf «Neue Variante» heisst.
  - `kopfMass(page)`
  
  Neue Prüfungen, ohne «a3: »-Präfix:
  - Handy (frische Seite, Sideboard): «Handy geändert: Knopf «Neue Variante», kein Überschreiben in Kopf und Leiste»
  - «Handy geändert: #mPrice und Knöpfe überschneiden sich nicht (Preis …)»
  - «Handy geändert: #mPrice ganz im Bild»
  - Desktop: «Desktop geändert: Knopf «Neue Variante»»
  - «Desktop geändert 1440 px / 921 px: Kopf höchstens 64 px, Steckbrief mindestens 120 px breit (…)»
  
  Neue Bilder: `a3-handy-geaendert`, `a3-desktop-geaendert-1440`, `a3-desktop-geaendert-921`. Die Kommentarzeile über `a3` nennt den Zustand «geändert».

### Prüfungen und Ausgabe

**Rot vor dem Fix** (`node tools/ui-pruefung.mjs a3`, neue Prüfungen, alter Code): Exit 1, `28 ok, 5 FEHLT`.
```
FEHLT a3: Handy geändert: Knopf «Neue Variante», kein Überschreiben in Kopf und Leiste
FEHLT a3: Handy geändert: #mPrice und Knöpfe überschneiden sich nicht (Preis 16–90)
ok a3: Handy geändert: #mPrice ganz im Bild
FEHLT a3: Desktop geändert: Knopf «Neue Variante»
FEHLT a3: Desktop geändert 1440 px: Kopf höchstens 64 px, Steckbrief mindestens 120 px breit (71.5 px, 540 px)
FEHLT a3: Desktop geändert 921 px: Kopf höchstens 64 px, Steckbrief mindestens 120 px breit (71.5 px, 0 px)
```
Damit sind beide Befunde nachgestellt: Kopf 71.5 px, Steckbrief bei 921 px weg, Preis unter den Knöpfen.

**Grün nach dem Fix:**
- `node tools/ui-pruefung.mjs a3`: `33 ok, 0 FEHLT`, Exit 0
- `node tools/ui-pruefung.mjs t0 a1 a2 a3`: `71 ok, 0 FEHLT`, Exit 0. Die neuen Zeilen:
```
ok a3: Handy geändert: Knopf «Neue Variante», kein Überschreiben in Kopf und Leiste
ok a3: Handy geändert: #mPrice und Knöpfe überschneiden sich nicht (Preis 16–90)
ok a3: Handy geändert: #mPrice ganz im Bild
ok a3: Desktop geändert: Knopf «Neue Variante»
ok a3: Desktop geändert 1440 px: Kopf höchstens 64 px, Steckbrief mindestens 120 px breit (53.5 px, 687 px)
ok a3: Desktop geändert 921 px: Kopf höchstens 64 px, Steckbrief mindestens 120 px breit (59 px, 134 px)
```
- `node --test`: `# tests 202 # pass 202 # fail 0`
- `grep -n "ueberschreiben\|Als neue Variante" index.html`: kein Treffer.

**Nachgemessen im Zustand «geändert»** (Wegwerfskript, gelöscht):

| Breite | Kopf | `.kopfbrief` | Knopf «Neue Variante» | `scrollWidth` |
|---|---|---|---|---|
| 1440 | 53.5 px | 687 px | 118×36 | 1440 |
| 1200 | 53.5 px | 447 px | 118×36 | 1200 |
| 1000 | 59 px | 213 px | 118×36 | 1000 |
| 921 | 59 px | 134 px | 118×36 | 921 |

Der Kopf ist so hoch wie im Zustand «Entwurf» (53.5 bzw. 59 px), es gibt also keinen Sprung mehr.

Handy 390, Leiste:
- «Sammeln»: Preis x 16–90, Knöpfe 224–374
- «geändert»: Preis 16–90, Knöpfe 193–374, «Neue Variante» 118 px, nicht abgeschnitten
- Leiste in beiden Fällen 133.75 px, `scrollWidth` 390
- Bei 320 px: Preis 16–95, Knöpfe 123–304, kein Überlauf

### Bedenken

1. **Bei 921 px ist der Zustand kaum zu lesen.** `.kopfbrief` erfüllt mit 134 px die Grenze von ≥ 120 px, zeigt aber nur «Sperrholz geölt · 12 T…». Den Zustand «Variante «…» · geändert» sieht man bei 1440 px ganz. Ab welcher Breite genau, habe ich nicht gemessen. Bei 1000 px bleiben 213 px. Wenn der Zustand auch bei 921–1000 px lesbar sein soll, wäre die vorgesehene Ausweichregel eine Option: Sammlungslink im Kopf unter 1000 px ausblenden, das bringt rund 105 px. Ich habe sie nicht gesetzt, weil ihre Bedingung (Überlauf) nicht erfüllt ist.
2. **Meldungstext mit Verweis auf «Überschreiben».** Nach «An Bauweise anpassen» erscheint weiter «Speichern mit «Überschreiben».». Der Knopf steht jetzt nur noch je Zeile in der Sammlung. Ich habe den Text nicht geändert, der Wortschatz gehört zu Stufe B. Er stimmt weiterhin, verlangt aber den Weg in die Sammlung.
3. **Nebenbefund ausserhalb des Auftrags:** Bei 320 px Breite bricht der Ortsknopf «Sammlung (1)» um, sobald die Sammlung einen Eintrag hat. Die Leiste wächst dann von 133.75 auf 153.75 px. A3 ändert weder Markup noch CSS von `.mnav`, der Befund bestand also schon vorher. Am alten Stand gemessen habe ich ihn nicht.
