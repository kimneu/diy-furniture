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
| `preise.js` | **Nur Daten:** Preise, Stärken, Plattenformate, Stand und Quelle für Platten, Rückwände und Kaufteile (JSON in Script-Hülle, ohne Build ladbar) |
| `shared.js` | Produktbeschreibungen `MAT_INFO`/`BACK_INFO`, daraus mit `preise.js` die Kataloge `MATS`/`BACKS`; Zuschnitt-Packer `pack`, Verbindungsbeschläge, `matPrice`, `sheetCosts` |
| `sideboard.js` | Sideboard-Berechnung (1:1 aus der alten `index.html` verschoben) |
| `reduit.js` | Reduit: Raumlayout, 5 Einbau-Arten + selbststehend, Nischen, Spannweiten-Tabelle `SPAN`, Kaufteile `BUY` (Namen hier, Preise in `preise.js`) |
| `konfig.js` | Formularwerte → Berechnung (`cfgFromData`), «Zufall» (würfelt, bis keine Warnung ausser Kippschutz/Bad bleibt; Reduit behält den Raum), Einträge der «Sammlung» (localStorage `sideboard-werkbank-v2-sammlung`, Kosten beim Speichern) |
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
- [ ] **Ganze Bretter/Platten in festen Formaten** (siehe Ideen): entschieden, dass der Konfigurator Bretter in mehreren Breiten richtig rechnen soll – aber nur mit sinnvollen Produkten (z. B. keine OSB-Platten mit Nut und Feder). Zuerst gemeinsam entwerfen.
  - Sicher dabei: **go/on Leimholzbrett Fichte** 18 mm (200/400 × 1200/2000).
  - Vorschlag, noch offen: Regalbauplatte weiss 16 mm (1150 × 200…600, Kanten beschichtet), Mood Eiche 18 mm 2000 × 600 (Sideboard-Tiefe, ≈ 76 statt 109/m²), evtl. Mood Fichte A 18 mm. Schaltafel ist schon ein festes Format und gehört ins neue Modell. Nicht: OSB mini, Vielzweckplatte.
  - Reihenfolge: zuerst Preise in die Datendatei auslagern, dann die festen Formate dort mit erfassen.
- [ ] Kaufteile in `preise.js` → `kaufteile`: Wandschienen, Konsolen, Blechkonsolen, Winkelverbinder, Dübel, Schrauben 4 × 35 sind **Schätzungen** (`est:true`, in der Beschlägeliste als «Preis geschätzt» markiert). Skript um Stückpreise erweitern.
- [ ] Richtpreise für Sideboard-Beschläge (Scharniere, Schiebetürbeschlag, Füsse) fehlen ganz; ebenso Verbindungsbeschläge und Rückwandschrauben (beide Möbel) und Oberfläche (Öl, Grundierung, Lack).
- [ ] Ungenau, aber keine Preise: Spannweiten `SPAN` (Daumenregel), Ergiebigkeit von Farbe/Öl (10 bzw. 22 m²/l), Schnittkosten beim Zuschnitt nicht eingerechnet.

## Ideen (noch nicht entschieden)

- **Günstige ganze Platten** (Jumbo «Holzplatten», nach Preis sortiert, 25.09.2026, CHF/m² aus Stückpreis): Regalbauplatte weiss 16 mm 1150 × 200…600 ≈ 30–36 (Kanten schon beschichtet), Mood Leimholz Fichte A 18 mm 800…2500 × 200…600 ≈ 44–48 (Zuschnitt Fichte B: 59.95), Mood Eiche 18 mm 2000 × 600 ≈ 76 (Zuschnitt B/C: 109), Vielzweckplatte 1500 × 500 × 20 ≈ 22, OSB mini 1220 × 610 × 15 ≈ 11. Go/on-Fichtenbretter online ohne Preis.
- **Leimholzbrett Fichte in Standardbreiten** als eigenes Material. Jumbo-Preise 18 mm: 2000 × 400 = 20.50, 1200 × 400 = 12.50, 2000 × 200 = 10.20, 1200 × 200 = 5.60 → ca. **CHF 26/m²** statt 60 im Zuschnitt. Für Reduit-Tablare mit 200/400 mm Tiefe viel günstiger. Der Konfigurator müsste Tablare aus ganzen Brettern rechnen (Länge ablängen, Breite = Brettbreite).
- **Materialauswahl mit Filter** (Optik wählen, dann passende Platten; beim Sideboard die rustikalen ausblenden): besprochen, vorerst verworfen – die nach Preis sortierte Liste reicht.
- **Maserung pro Bauteil wählbar**: verworfen; die Richtung wird automatisch festgelegt und in der Materialliste ausgewiesen.

## Bekannte Eigenheiten

- Birke-Platte hat die Maserung über die 1500er-Seite: Teile über ca. 1480 mm mit Maserung längs passen nicht. Der Konfigurator warnt; Lösung: Checkbox «Maserungsrichtung einhalten» aus (quer schneiden).
- Jumbo-Wandschienen gibt es nur bis 200 cm; bei 2,4 m Raumhöhe plant der Konfigurator zwei Stücke übereinander.
- Ein eigentliches Möbel-Kippschutz-Set führt Jumbo nicht; eingeplant ist die Abus-Kippsicherung mit Gurt.
- Die hintere Nische wurde bewusst entfernt (beim U immer gesperrt).
