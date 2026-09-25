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
| `shared.js` | Plattenkatalog `MATS` (Preise, Formate, Stärken), Rückwände `BACKS`, Zuschnitt-Packer `pack`, Verbindungsbeschläge, `matPrice`, `sheetCosts` |
| `sideboard.js` | Sideboard-Berechnung (1:1 aus der alten `index.html` verschoben) |
| `reduit.js` | Reduit: Raumlayout, 5 Einbau-Arten + selbststehend, Nischen, Spannweiten-Tabelle `SPAN`, Kaufteil-Preise `BUY` |
| `test/sideboard.snapshot.test.js` | Snapshot: Sideboard rechnet wie vor dem Umbau |
| `test/reduit.test.js`, `test/shared.test.js` | Reduit-Geometrie, Bauarten, Randfälle, Preise |

Wenn sich Katalogdaten ändern, schlägt der Snapshot-Test fehl. Dann prüfen, dass sich nur `R.M` (das Materialobjekt) unterscheidet, und die Fixture neu schreiben (siehe Commit `b424766`).

## Preise

- Plattenpreise sind **Jumbo-Zuschnittpreise pro m²**. Jumbo verlangt im Zuschnitt denselben m²-Preis wie für die ganze Platte, darum zeigt die Summary beides: «Holz Zuschnitt» (nur Teilefläche) und «Holz ganze Platten» (Plattenzahl × Plattenfläche).
- Preise pro Stärke: `MATS[k].prices = { Stärke: CHF/m² }`, `price` = Preis der Standardstärke (für die Sortierung).
- jumbo.ch sperrt automatische Abfragen (403, auch mit Playwright). Preise darum von Hand erfassen oder die Jumbo-Suchseite kopieren (Ctrl+A, Ctrl+C) und Claude einfügen.

### Erfasst (von Hand, 25.09.2026)

| Material | Stärke → CHF/m² | Plattenformat (Maserung zuerst) |
|---|---|---|
| Multiplex Birke | 12 → 69.95 · 18 → 99.95 · 21 → 149.90 (9 mm = 59.95, nicht aufgenommen) | 1500 × 3000 |
| Eiche Leimholz | 18 → 109 · 20 → 129 · 27 → 149 | **offen** (noch 2400 × 600) |
| Fichte Leimholz (Zuschnitt) | 18 → 60 · 21 → 80 · 27 → 95 | 2500 × 1210 |
| Sperrholz Seekiefer | 12 → 36.95 · 15 → 47.95 | 2500 × 1250 (angenommen) |
| Sperrholz Fichte | 12 → 45 · 15 → 53 · 18 → 65 · 21 → 73 · 24 → 85 | 2500 × 1250 (angenommen) |

Aus der Jumbo-Suche (Subagent, reguläre Preise): Schaltafel 27 mm 32 CHF/m² (2500 × 500), OSB-3 30 CHF/m² (2770 × 2070), Dreischicht Fichte 19 mm 70 CHF/m² (2525 × 675), Spanplatte weiss 25 CHF/m² (2800 × 2070).

### Noch offen

- [ ] **MDF roh** (zum Lackieren): Stärken, CHF/m², Format – Jumbo hat viele Varianten, nur rohes MDF ist relevant.
- [ ] **Rückwände:** HDF weiss 3 mm und Sperrholz Pappel 5 mm.
- [ ] **Plattenformat Eiche Leimholz.**
- [ ] Kaufteile in `reduit.js` → `BUY`: Wandschienen, Konsolen, Blechkonsolen, Winkelverbinder, Dübel, Schrauben 4 × 35 sind **Schätzungen** (`est:true`, in der Beschlägeliste als «Preis geschätzt» markiert).
- [ ] Richtpreise für Sideboard-Beschläge (Scharniere, Schiebetürbeschlag, Füsse) fehlen ganz.

## Ideen (noch nicht entschieden)

- **Leimholzbrett Fichte in Standardbreiten** als eigenes Material. Jumbo-Preise 18 mm: 2000 × 400 = 20.50, 1200 × 400 = 12.50, 2000 × 200 = 10.20, 1200 × 200 = 5.60 → ca. **CHF 26/m²** statt 60 im Zuschnitt. Für Reduit-Tablare mit 200/400 mm Tiefe viel günstiger. Der Konfigurator müsste Tablare aus ganzen Brettern rechnen (Länge ablängen, Breite = Brettbreite).
- **Materialauswahl mit Filter** (Optik wählen, dann passende Platten; beim Sideboard die rustikalen ausblenden): besprochen, vorerst verworfen – die nach Preis sortierte Liste reicht.
- **Maserung pro Bauteil wählbar**: verworfen; die Richtung wird automatisch festgelegt und in der Materialliste ausgewiesen.

## Bekannte Eigenheiten

- Birke-Platte hat die Maserung über die 1500er-Seite: Teile über ca. 1480 mm mit Maserung längs passen nicht. Der Konfigurator warnt; Lösung: Checkbox «Maserungsrichtung einhalten» aus (quer schneiden).
- Jumbo-Wandschienen gibt es nur bis 200 cm; bei 2,4 m Raumhöhe plant der Konfigurator zwei Stücke übereinander.
- Ein eigentliches Möbel-Kippschutz-Set führt Jumbo nicht; eingeplant ist die Abus-Kippsicherung mit Gurt.
- Die hintere Nische wurde bewusst entfernt (beim U immer gesperrt).
