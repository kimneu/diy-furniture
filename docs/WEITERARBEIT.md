# Weiterarbeit – Stand 25.09.2026

Notizen, um an einer anderen Maschine weiterzumachen. Design und Plan des Reduit-Features:

- Spec: `docs/superpowers/specs/2026-09-25-reduit-design.md`
- Umsetzungsplan: `docs/superpowers/plans/2026-09-25-reduit.md`

## Repo & Setup

- Fork: `github.com/kimneu/diy-furniture` (Upstream: `github.com/m-hertig/diy-furniture`).
  Auf einer neuen Maschine: `git clone git@github.com:kimneu/diy-furniture.git` und optional `git remote add upstream git@github.com:m-hertig/diy-furniture.git`.
- Kein Build. Lokal testen: `python3 -m http.server 8000` → http://localhost:8000/
  In einer VM mit `--bind 0.0.0.0` starten, sonst ist der Server vom Host aus nicht erreichbar.
  Nach Änderungen an den `.js`-Dateien im Browser **Ctrl+Shift+R** (sonst bleibt die alte Version im Cache).
- Tests: `node --test` (Node 18+, keine Abhängigkeiten).

## Aufbau

| Datei | Inhalt |
|---|---|
| `index.html` | Formular, Renderer, 3D (three.js r128) |
| `preise.js` | **Nur Daten:** Preise, Stärken, Plattenformate, Stand und Quelle für Platten, Rückwände, ganze Bretter und Kaufteile (JSON in Script-Hülle, ohne Build ladbar) |
| `shared.js` | Produktbeschreibungen `MAT_INFO`/`BACK_INFO`, daraus mit `preise.js` die Kataloge `MATS`/`BACKS`; Zuschnitt-Packer `pack`, Brett-Packer `packBoards`, Verbindungsbeschläge, `matPrice`, `sheetCosts` |
| `sideboard.js` | Sideboard-Berechnung (1:1 aus der alten `index.html` verschoben) |
| `reduit.js` | Reduit: Raumlayout, 5 Einbau-Arten + selbststehend, Nischen, Spannweiten-Tabelle `SPAN`, Kaufteile `BUY` (Namen hier, Preise in `preise.js`) |
| `test/sideboard.snapshot.test.js` | Snapshot: Sideboard rechnet wie vor dem Umbau (mit eingefrorenen Preisen `test/fixtures/preise.json`) |
| `test/preise.test.js` | Form und Vollständigkeit von `preise.js` |
| `test/reduit.test.js`, `test/shared.test.js` | Reduit-Geometrie, Bauarten, Randfälle, Preise |
| `tools/jumbo-preise.mjs`, `tools/jumbo-quellen.json`, `tools/preise-datei.cjs` | Jumbo-Preise lesen, mit `preise.js` vergleichen und nachführen (siehe «Preise nachführen») |

Preis-Updates in `preise.js` brechen den Snapshot nicht mehr (er rechnet mit `test/fixtures/preise.json`). Ändert sich eine Produktbeschreibung in `MAT_INFO`, schlägt er fehl: prüfen, dass sich nur `R.M` unterscheidet, und die Fixture neu schreiben (siehe Commit `b424766`).

## Preise

- Plattenpreise sind **Jumbo-Zuschnittpreise pro m²**. Jumbo verlangt im Zuschnitt denselben m²-Preis wie für die ganze Platte, darum zeigt die Summary beides: «Holz Zuschnitt» (nur Teilefläche) und «Holz ganze Platten» (Plattenzahl × Plattenfläche).
- Alle Preise und Formate stehen in `preise.js`, jeder Eintrag mit `stand` (Datum der letzten Kontrolle) und `quelle`. Der Code enthält keine Preise mehr.
- Preise pro Stärke: `platten[k].prices = { Stärke: CHF/m² }`. Die angebotenen Stärken ergeben sich daraus; `MATS[k].price` = Preis der Standardstärke (für die Sortierung). Eine neue Stärke braucht zusätzlich einen `SPAN`-Wert in `reduit.js` (Test prüft das).
- Gespeicherte Konfigurationen merken sich die Katalogwerte beim Speichern (`katalog`). Beim Laden gelten die aktuellen Katalogwerte, ausser Preis oder Format wurden von Hand geändert.
- **Ganze Bretter:** `preise.js` → `bretter` (Stärke, Formate mit Stückpreis): go/on Leimholz Fichte 18, go/on 3-Schicht 19, Mood Fichte A 18, Regalbauplatte weiss 16, Möbelplatte weiss 18, Schaltafel 27. Nur ablängen, Teilbreite = Brettbreite (Toleranz 15 mm), nur beim Reduit. Die Regaltiefe rastet auf die Brettbreite ein; 40er-Leisten werden Dachlatten; lange Tablare werden 45 mm neben einer Stütze gestossen (Stossleiste darunter, bei «Leisten» ein Pfosten vorne). Packer `packBoards` in `shared.js`.
- Bretter nachführen: `node jumbo-preise.mjs --schreiben gon_fichte mood_fichte regalbau moebel_weiss` (Schlüssel «material LxB» in `jumbo-quellen.json`; der «Best Price» steht nur auf der Produktseite, nicht in der Suchliste).
- Rückwände: `hdf3` = Oecoplan MDF Lack Line 1-seitig weiss 3 mm (ersetzt «HDF weiss»), `hf3` = Hartfaserplatte roh 3 mm, `ply6` = Oecoplan Sperrholz Pappel A/B 5 mm.

### Preise nachführen: `tools/jumbo-preise.mjs`

jumbo.ch sperrt normale Automatisierung (403, auch mit Playwright). Das Skript nutzt darum **Patchright** (getarntes Playwright) mit einem sichtbaren Chrome-Fenster und eigenem Profil (`tools/.jumbo-profile`, nicht im Repo).

```sh
cd tools && npm install                                  # einmalig
node jumbo-preise.mjs suche "OSB" "Sperrholz Pappel"     # Produkte + URLs finden (Z = Zuschnitt)
node jumbo-preise.mjs                                    # alle Quellen: Preis pro Stärke + max. Zuschnitt, Vergleich mit shared.js
node jumbo-preise.mjs osb ply6                           # nur einzelne
node jumbo-preise.mjs --schreiben [osb …]               # lesen und preise.js nachführen
```

- Quellen: `tools/jumbo-quellen.json`, Schlüssel = Material aus `MATS`/`BACKS`, optional `birke~Variante` für Alternativen. Pro Material genügt eine Produkt-URL; die übrigen Stärken liest das Skript aus der Stärke-Auswahl.
- Ohne `--schreiben` vergleicht das Skript nur. Mit `--schreiben` übernimmt es Preise und max. Zuschnitt bekannter Stärken in `preise.js` und setzt `stand` auf heute. Neue oder weggefallene Stärken meldet es nur, Varianten (`~`) werden nie geschrieben, und bei je Stärke verschiedenem Zuschnittmass bleibt das Format stehen. Danach `node --test` und den Diff prüfen.
- Schonend: eine Seite nach der anderen, 4–5,5 s Pause. `tools/` ist in `.assetsignore`, wird also nicht deployt.
- Stand 25.09.2026: alle Platten und Rückwände gelesen und übernommen. Schaltafel gibt es nicht im Zuschnitt (ganze Tafel 27 × 2000 × 500, CHF 29.50), OSB 22 mm nicht mehr im Angebot.

### Noch offen

- [x] **Preise aus dem Code nehmen:** erledigt – `preise.js`, Skript mit `--schreiben`, Snapshot mit eingefrorenen Preisen.
- [x] **Gespeicherte Konfiguration überschreibt neue Katalogpreise:** erledigt (siehe «Preise»). Nebenbei: beim ersten Besuch standen Preis 55 und Format 2500 × 1250 statt der Birke-Werte im Formular.
- [x] **Ganze Bretter in festen Formaten:** erledigt fürs Reduit (Spec `docs/superpowers/specs/2026-09-25-feste-formate-design.md`). Offen: Sideboard mit Brettern, Längsschnitte (`laengs:true` pro Produkt), Mood Eiche; go/on 3-Schicht hat noch keine Skript-Quelle (Suche findet sie nicht, URLs von Hand in `jumbo-quellen.json` eintragen); Stösse richten sich nach den Stützen, nicht nach den günstigsten Brettlängen.
  - Sicher dabei: **go/on Leimholzbrett Fichte** 18 mm (200/400 × 1200/2000).
  - Vorschlag, noch offen: Regalbauplatte weiss 16 mm (1150 × 200…600, Kanten beschichtet), Mood Eiche 18 mm 2000 × 600 (Sideboard-Tiefe, ≈ 76 statt 109/m²), evtl. Mood Fichte A 18 mm. Schaltafel ist schon ein festes Format und gehört ins neue Modell. Nicht: OSB mini, Vielzweckplatte.
  - Reihenfolge: zuerst Preise in die Datendatei auslagern, dann die festen Formate dort mit erfassen.
- [ ] Kaufteile in `preise.js` → `kaufteile`: Wandschienen, Konsolen, Blechkonsolen, Winkelverbinder, Dübel, Schrauben 4 × 35 sind **Schätzungen** (`est:true`, in der Beschlägeliste als «Preis geschätzt» markiert). Skript um Stückpreise erweitern.
- [ ] Richtpreise für Sideboard-Beschläge (Scharniere, Schiebetürbeschlag, Füsse) fehlen ganz; ebenso Verbindungsbeschläge und Rückwandschrauben (beide Möbel) und Oberfläche (Öl, Grundierung, Lack).
- [ ] Ungenau, aber keine Preise: Spannweiten `SPAN` (Daumenregel), Ergiebigkeit von Farbe/Öl (10 bzw. 22 m²/l), Schnittkosten beim Zuschnitt nicht eingerechnet.

## Ideen (noch nicht entschieden)

- **Materialauswahl mit Filter** (Optik wählen, dann passende Platten; beim Sideboard die rustikalen ausblenden): besprochen, vorerst verworfen – die nach Preis sortierte Liste reicht.
- **Maserung pro Bauteil wählbar**: verworfen; die Richtung wird automatisch festgelegt und in der Materialliste ausgewiesen.

## Bekannte Eigenheiten

- Birke-Platte hat die Maserung über die 1500er-Seite: Teile über ca. 1480 mm mit Maserung längs passen nicht. Der Konfigurator warnt; Lösung: Checkbox «Maserungsrichtung einhalten» aus (quer schneiden).
- Jumbo-Wandschienen gibt es nur bis 200 cm; bei 2,4 m Raumhöhe plant der Konfigurator zwei Stücke übereinander.
- Ein eigentliches Möbel-Kippschutz-Set führt Jumbo nicht; eingeplant ist die Abus-Kippsicherung mit Gurt.
- Die hintere Nische wurde bewusst entfernt (beim U immer gesperrt).
