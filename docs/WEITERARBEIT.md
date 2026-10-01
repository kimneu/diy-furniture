# Weiterarbeit – Stand 01.10.2026

Notizen, um an einer anderen Maschine weiterzumachen. Design und Plan des Reduit-Features:

- Spec: `docs/superpowers/specs/2026-09-25-reduit-design.md`
- Umsetzungsplan: `docs/superpowers/plans/2026-09-25-reduit.md`

## Schreiner-Review (28.09.2026) – hier weitermachen

Prüfung der ganzen App aus Sicht eines Möbel- und Holzbauers: Konstruktion Sideboard/Reduit, Ecken der L-/U-Form, Material- und Beschlagkombinationen, Vorschlag zur Eingrenzung. Branch `schreiner-review` auf dem Fork (noch nicht in `main`).

- Einstieg: `docs/review/2026-09-28-schreiner-review.md` (Kurzurteil, Ecken, Befunde nach Thema, Vorschlag, Vorgehen, offene Entscheide)
- Details: `docs/review/2026-09-28-eck-urteil.md`, `…-eingrenzung-bauweisen.md`, `…-eingrenzung-regeln.md`, alle 172 Befunde in `…-befunde.md`
- Prüfskripte zum Nachrechnen: `docs/review/skripte/` (`node docs/review/skripte/main_check.js`)

Wichtigste Punkte:

- **Pfostenrahmen so nicht baubar** (Pfosten stehen in den Tablaren, kein Eckpfosten, Rahmen unverbunden, Reihenfolge unmöglich) – sperren oder umbauen (Pfosten vor die Querlatte).
- **Schrauben fix statt nach Stärke** (4 × 35 kommt durch Konsolen/Winkel oben aus dem Tablar, erreicht es bei Leisten nicht) – `screwFor(anbau, t)`.
- **Harte Sperren fehlen:** 12-mm-Korpus, Exzenter ausserhalb 16–22 mm, Drehtüren ab 22 mm Korpus, «Verschraubt» mit OSB/Leimholz, Tür nach innen gegen hinteres Regal.
- **Ecken:** Geometrie richtig; Innenecke ohne Auflager bei Leisten/Pfosten, Blindecke bei Wangen/Modulen, Tablare 9 mm in den Wandschienen.
- **Eingrenzung:** Empfehlung «Bauweisen vorne (5 Sideboard, 6 Reduit), Regeln dahinter» statt freier Kombination und `HARMLOS`-Regex.

Entschieden am 28.09.2026:

- **Pfostenrahmen: Variante A** – Pfosten vor der Querlatte, Tablare rechteckig, Eckpfosten an jeder Innenecke.
- **Eingrenzung: Bauweisen vorne, Regeln dahinter.** Der Filter folgt aus der Konstruktion, nicht aus der Optik (der frühere Entscheid gegen einen Materialfilter unter «Ideen» betraf die Optik).
- **Exzenter bei 15 mm: warnen**, nicht sperren (Minifix 15 ist vom Hersteller zugelassen, rund 3 mm Rest).

Entschieden am 28.09.2026 (zweite Runde):

- **Eckfach** bei Wangen und selbststehenden Modulen: ab 350 mm Öffnung nutzen (Eckfach zuerst bestücken), darunter bleibt das Eckquadrat leer.
- **Ecke:** Seiten höchstens 100 mm tiefer als hinten (Grenze mit Grund), hinten läuft weiter durch.
- **Tür:** neue Eingaben Türlage (links, mittig, rechts mit Abstand) und Türhöhe (Standard 2000).
- **Reduit-Standard:** Pfostenrahmen mit Sperrholz Fichte 18 (keine Warnung, ca. CHF 547 statt 674).
- **Sideboard-Korpus ab 18 mm** (Seekiefer nur noch als Front und im Reduit), **Wangen und Module über 1,2 m ab 18 mm**.
- **Lack auf beschichteter Spanplatte:** warnen (anschleifen, Haftgrund), nicht sperren.
- Pull Request später, alles zusammen.

Entschieden am 30.09.2026 (Bauweisen, nach dem Entwurf):

- **Auswahl:** 6 Sideboard-Bauweisen – die 5 aus dem Review plus **«Sperrholz zerlegbar»** (Sperrholz mit Exzenter) – und 6 fürs Reduit.
- **Leisten:** gesperrt, wenn die Tablare vorne weiter frei liegen, als das Material trägt; der Grund verweist auf den Pfostenrahmen.
- **Preis auf den Karten:** live für die aktuellen Masse.
- **Ältere Einträge der Sammlung:** beim Laden fragen – «An Bauweise anpassen» oder «Unverändert ansehen».

Entschieden am 01.10.2026:

- **Ständerraster bei Gipskarton: Die Sperre S16 bleibt.** Wandschienen und Tablarwinkel sind auf Gipskarton weiter gesperrt; ein Feld für das Ständerraster (Abstand, Versatz je Wand) kommt nicht. Gründe: Auf Gipskarton gehen Pfostenrahmen (Standard), Leisten, Wangen und Module, die über Latten oder in den Boden tragen; ein Raster bräuchte Abstand und Versatz für jede der drei Wände, Ständer sitzen neben Tür und Ecken oft unregelmässig, und Metallständer (CW) halten den Zug der Konsolen schlecht. Nur der Sperrgrund auf der Karte ist präziser («… hielten nur in den Ständern»). Offen bleibt DY-11/W10: Holzschrauben für die Punkte auf den Ständern bei Leisten und Latten auf der Kaufliste.

Umsetzung nach Kapitel 4 im Bericht, Schritt für Schritt auf dem Branch `claude/next-steps-9c8hnq` (baut auf `schreiner-review` auf):

- [x] **1. Pfostenrahmen, Variante A:** Pfosten stehen vor der Querlatte (`addPost`, v = Tiefe … Tiefe + 45), Tablare rechteckig. Eckpfosten an jeder Innenecke (beim Seitenregal gesetzt, trägt auch die hintere Querlatte), keine Eckleiste mehr. Pfostenabstand nach der Querlatte (`POST_MAX` 1200) statt nach der Tablar-Spannweite: Standard-U 2 statt 4 Pfosten, unabhängig vom Material. Verbindungen auf der Kaufliste: Winkel je Querlatten-Ende (Wand, Ecke), 5 × 60 durch die Pfosten (Eckpfosten 3 je Ebene), Tablare mit 4 × 40 von oben. Bauablauf: Latten → Tablare einschieben → Pfosten stellen → Tablare verschrauben. Durchgang wird zwischen den Pfosten gemessen (− 90 mm). Stützen an freien Enden und Stössen (Leisten, Schienen, Winkel) stehen ebenfalls vor dem Tablar. Stösse bei ganzen Brettern brauchen beim Pfostenrahmen keinen eigenen Pfosten (das Tablar liegt auf Wand- und Querlatte).
- [x] **2. Schrauben nach Stärke:** `screwFor(anbau, t)` in `shared.js` (Anwendungen `blech`, `latte`, `streifen`, `oben`, `fuss`, `kante`; längste Schraube mit höchstens 22 mm Biss und mindestens 4 mm Holz über der Spitze). Reduit: Kaufteile je Länge (`screw4x16` …, aus `SCHRAUBEN`), Konsolen/Winkel 4 × 16 statt 4 × 35 bei 18 mm, Leisten von oben verschraubt (Schrauben neu auf der Liste), Eckleiste aus Plattenstreifen 3,5 × 30. Dübelschraube nach Anbauteil (`dowelFor`: Metall und Leisten bis 20 mm 4,5 × 50, Latten 24 → 5 × 60, darüber 5 × 70). Sideboard: Füsse und Sockelwinkel nach Bodenstärke (18 mm → 4 × 12), Sockelecken nach Stärke. Gleiche Kaufteile mit verschiedenen Zwecken führen alle Zwecke in der Notiz. Snapshot neu geschrieben (nur Schraubenzeilen und der Tipp bei den Füssen geändert).
- [x] **3. Sofort-Sperren (3.4):** Regeltabelle `REGELN` in `konfig.js` mit `pruefeRegeln(d, fest)` (Fixpunkt, höchstens 5 Runden), `gesperrt(c)`, `grenzen(c)`. Drei Wirkungen: `sperren` (Option im Formular aus, Grund als `.hint.sperre` beim Feld; ein gesetzter Wert weicht nach `AUSWEICH` aus), `grenze` (min/max der Tiefenfelder, bei ganzen Brettern nur erlaubte Brettbreiten), `warnen`. Umgesetzt: S01 (Sideboard-Korpus ab 15 mm), S04 (Exzenter 15–22 mm, Dübel/Schrauben ab 15 mm) mit W03 (Exzenter bei 15 mm warnt), S05/S06 (Verschraubt nicht mit OSB/Leimholz), S07/S08 (Rückwand bei Türen und Modulen über 1,2 m), S09 (Bad: keine Spanplatte, keine MDF-/Hartfaser-Rückwand), S10 (Drehtüren bis 21 mm Korpus), S13 (Leimholz: Maserung immer), S14/S15 (Tiefe Tablarwinkel ≤ 375, Wandschienen ≥ 260; zu breite Bretter bei Tablarwinkeln gesperrt), S16 (Gipskarton: keine Schienen/Winkel; ein Ständerraster kommt nicht, Entscheid 01.10.2026), K14 (Tür nach innen: Tiefe hinten ≤ Raumtiefe − Türbreite − 50). `render()` in `index.html` schreibt Anpassungen zurück ins Formular und meldet sie kurz («Angepasst – …»). `computeData` und `zufall()` laufen über dieselben Regeln (Schloss: festgehaltene Felder werden gewarnt statt korrigiert). `HARMLOS` bleibt bis zur Bauweisen-Schicht. Tests: `test/regeln.test.js`.
- [x] **Regeln nach der zweiten Runde:** S01 und S03 mit `KORPUS_MIN` 18 (Stärken und Materialien ohne 18 mm gesperrt), W06 (Lack auf beschichteter Front). `pruefeRegeln` korrigiert je Runde nur das erste gesperrte Feld nach `REIHENFOLGE` und prüft die Grenzen erst danach.
- [x] **Reduit-Standard und Plattenformat:** Neuer Reduit-Entwurf startet mit Pfostenrahmen und Sperrholz Fichte 18 (`startwerte` in `konfig.js`, `REDUIT_DEFAULTS.sys` = `posts`, Karte im Formular vorgewählt). Plattenbreite wird nicht mehr auf 2100 mm gekappt, sondern bis 3100 (Birke 1500 × 3000; K01).
- [x] **4a. Geometrie (Schiene, Winkel, Wangen, Leisten-Ecke):** Tablare beginnen 2 mm vor der Wandschiene (`RAIL_T` 12, `RAIL_V0` 14; Platten schmaler zugeschnitten, ganze Bretter stehen 11 mm weiter vor, die Seitenregale beginnen davor – `railsVor`), Konsole endet 10 mm hinter der Vorderkante, Schienen darum ab 280 mm Tiefe (S15). Tablarwinkel mit Wandschenkel als Daten (`WINKEL_WAND`, langer Schenkel an der Wand) und Warnung, wenn er in den Boden reicht. Wangen nur bis 50 mm über das oberste Tablar (K10). Leisten: Eckstütze vor jeder Innenecke (2 Winkel je Ebene, eigener Schritt im Bauablauf); die Warnung «liegen vorne frei» misst das längste freie Feld zwischen Wand, Eckstütze und Stützen. Neue Grenzen: K09 (unterstes Tablar über der Auflage: Leiste 50, Latte 60, Schiene 70, Tablarwinkel Wandschenkel + 10), K13 (Seiten höchstens 100 mm tiefer als hinten). Grenzen gelten nur für Regale, die es in der Form gibt; ihr Grund steht beim Feld, sobald der Wert anstösst.
- [x] **4b. Eckfach bei Wangen und Modulen:** Offen ist das erste hintere Fach bzw. Eckmodul ab der Seitentiefe (`ECKFACH_MIN` 350). Genügt das, wird es genutzt: Bauablauf «Eckfach zuerst einrichten», 3 Schrauben durch Eckwange bzw. Seitenmodul in die hintere Wange bzw. Modulseite. Sonst bleibt das Eckquadrat leer: Wangen – das hintere Regal beginnt mit einer eigenen Wange bündig hinter der Eckwange; Module – die hintere Reihe beginnt neben dem Seitenregal. Hinweis «leeres Eckquadrat eingeplant». Standard-U mit Birke: 490 mm offen; MDF 19 oder Seiten ab 450: leer.
- [x] **4c. Türlage und Türhöhe:** Neue Eingaben `doorPos` (links, mittig, rechts), `doorOff` (Abstand zur Seitenwand, nur bei seitlicher Tür) und `doorH` (Standard 2000); ältere Entwürfe ohne diese Felder gelten als mittig und 2000 hoch. `normReduit` rechnet `doorX0` (linke Kante der Öffnung), `layoutReduit` die Wandstücke links und rechts, die 3D-Wände liegen entsprechend. Tür nach innen: Das Regal auf der Bandseite wird nur gekürzt, wenn das offene Blatt es trifft (Tiefe > Wandstück − 110 mm), sonst kommt ein Türstopper auf die Liste. Reststücke unter 300 mm (Wangen und Module unter 400) entfallen (K15). Module, die fertig nicht durch die Tür passen, werden im Reduit gebaut (Bauablauf); Wangen und Module warnen, wenn sie sich wegen des Kippmasses nicht aufrichten lassen.
- [x] **Vorgezogen, SK-1 (kritisch):** Schiebetüren – vordere Lochreihe der Seiten slideSet + 40 mm von vorne (bei 18-mm-Türen 92 mm), vermerkt an der Seite und im Bauablauf.
- [x] **Modulseiten:** um die Rückwand weniger tief (wie beim Sideboard), keine Überschneidung mehr mit der Rückwand.
- [x] **5. Spannweiten:** `SPAN` und `maxSpan` stehen in `shared.js`; das Sideboard rechnet damit statt pauschal 700/800/900 nach Stärke (W01) und prüft Deckel und Boden ohne Einlegeböden bei jeder Fachzahl (maxSpan + 200, W02). Die Warnungen nennen das Material. Zufall wählt die Fachbreite höchstens so gross, wie das Material spannt. Leimholz (Fichte, Eiche, go/on, Mood) und Dreischicht nach der Balkenformel neu (TR-14: 40 kg/m, 300 mm tief, Dauerlast, L/250, auf 50 mm abgerundet – z. B. Fichte 18: 850 statt 600, Dreischicht 19: 750 statt 650); Sperrholz, MDF, Spanplatte und OSB unverändert. Test rechnet die Formel nach.
- [x] **6. Anleitung:** Bohrschritte der Verbindung als `jointSteps` in `shared.js` (Sideboard und Module). Reduit: Oberfläche direkt nach dem Schleifen, vor der Montage; Höhen vom Meterriss an der höchsten Bodenstelle; Wangen bei unebenem Boden unterlegen. Module: Lochreihen und Verbindung vor «Module bauen», Leim bei Dübeln, jedes hohe Modul sofort beim Aufstellen sichern, 3 Schrauben je Modulstoss auf der Liste. Eingebaut: Eck- und Stossleisten an der Werkbank vormontieren, beim Auflegen verschrauben; ein Schritt «Stützen stellen» für freie Enden, Stösse und Innenecken. Sideboard: Schritt «Aufstellen und gegen Kippen sichern» vor dem Einräumen, MDF vor dem Zusammenbau lackieren. Snapshot neu geschrieben (nur der Bauablauf).
- [x] **7. Bauweisen-Schicht:** `BAUWEISEN` in `konfig.js` (Sideboard S1–S6 inkl. «Sperrholz zerlegbar», Reduit R1–R6), Feld `bw`. Die gewählte Bauweise sperrt über `BW_REGELN`, was nicht zu ihr gehört (Material, Stärke, Verbindung, Bauart, Rückwand, Frontmaterial, Deckel); das Regelwerk weicht auf ihre Werte aus. Gesperrte Bauweisen: Bad (S3, S5, S6), Gipskarton (R3, R4), Leisten, wenn ein Feld vorne weiter frei liegt, als das Material trägt (`leistenFrei`, rechnet wie mit Leisten gebaut). Fächer wachsen mit der Spannweite (W01 als Sperre der Fachzahl). Formular: Karten mit Live-Preis (`kartenPreise`), Details der gewählten (`bwDetails`) und Sperrgrund auf der Karte; Verbindung, Bauart und Niveau ausgeblendet (folgen aus der Karte), Einsatzort bei den Massen, «Material» heisst «Optik» und zeigt nur, was zur Bauweise gehört. Zufall würfelt zuerst die Bauweise (gewichtet), Schloss «bauweise». Sammlung: Etikett mit Bauweise, ältere Varianten fragen beim Laden («An Bauweise anpassen» / «Unverändert ansehen»); ältere Entwürfe bekommen `bauweiseVon` und werden angepasst. Entwurf: https://claude.ai/artifact/253Bd2mDPphfU8vSABtUEK (privat).
- [x] **K08, Wandschienen:** Reicht eine Schiene 2000 mm, wenn das oberste Tablar höchstens 300 mm tiefer liegt als beim Standard (Deckenabstand bis 600 mm), gilt dieser Deckenabstand als Grenze (Standard-U: 350 statt 300 mm, keine 100er-Schienen mehr). Sonst zwei Stücke, jedes mindestens 500 mm (`railParts`), Dübel nach genutzter Länge; der Bauablauf sagt, dass nur am freien Ende gekürzt wird.
- [x] **8. Tests quer über alle Kombinationen** (Branch `claude/funny-tharp-4f2212`): `test/kombinationen.test.js` spielt jede Bauweise über Form (I, L links/rechts, U), Wandart, Tür (aussen, innen mit Band links/rechts, Lage links/mittig/rechts) und vier Räume durch (Reduit 2304 Fälle plus Ränder mit 8 Tablaren, niedrigem Raum, tiefen und flachen Regalen; Sideboard 1620 Fälle über Masse, Front, Einsatzort, Unterbau) und würfelt 720-mal mit festem Seed. Geprüft: keine Überschneidung von Tablar mit Pfosten, Stütze, Wange, Schiene, Konsole oder Winkel (Sideboard: Korpusteile untereinander); keine NaN oder negativen Masse, Mengen, Kosten; jedes Tablar auf mindestens 2 Auflagen (darunter liegend oder seitlich an Wange, Modulseite, Stütze), Schwerpunkt innerhalb; Fixpunkt des Regelwerks (zweite Runde ohne Korrektur, nichts gesperrt, alles in den Grenzen); Standardformulare und jede mögliche Bauweise im Standardraum ohne Warnung ausser «eingeplant»; Zufall ohne Warnung ausser `HARMLOS`. Jede Bauweise wird in genügend Fällen wirklich gebaut, Gegenproben zeigen, dass die Prüfungen anschlagen. Gefunden und behoben:
  - **Tablarwinkel:** Bei engen Tablarabständen steckte der Wandschenkel des oberen Winkels im unteren Tablar. Neue Grenze K09 für die Tablarzahl (lichte Höhe ≥ Wandschenkel + 10 mm); das Formular zeigt das Maximum und den Grund, Meldungen ohne «mm» (`RANGES.nShelves`, `mitEinheit`).
  - **Ganze Bretter:** K08/K09 rundeten auch Boden- und Deckenabstand auf eine Brettbreite (200 statt 60 mm, 400 statt 350 mm); jetzt nur die Tiefen. Geprüft wird die auf die Brettbreite aufgerundete Tiefe (Tablarwinkel: 300 → 400 lag über 375).
  - **Rückfall der Bauweise:** Wangen und Module wichen auf Birke aus, deren Maserung raumhohe Teile nicht zulässt; jetzt zuerst Sperrholz Fichte (`SPERRHOLZ_REDUIT`).
  - **Tür nach innen:** Wandschienen gesperrt, wenn hinten weniger als 280 mm Tiefe bleiben (vorher Warnung und Regal vor der Tür).
- [x] **K05, Leisten aus Dachlatte:** Wand-, End- und Eckleisten sind bei allen Materialien Dachlatte 24 × 48 (vorher 40er-Streifen aus der Platte). Wand- und Endleisten hochkant (21 statt 15 mm Auflage), die Eckleiste flach, je 24 mm unter beiden Tablaren, ab v = Leistendicke bis 20 mm hinter die Vorderkante (keine Überschneidung mehr mit der Wandleiste). Schrauben über `screwFor('latte', t)` (bei 18 mm 4 × 35), Dübel immer 5 × 60 – der Dübel 5 × 70 fällt weg. K09: unterstes Tablar bei Leisten ab 60 mm. Bauablauf nennt Dachlatte hochkant bzw. flach; die Anwendung `streifen` in `screwFor` heisst jetzt `platte` (nur noch Modulseiten). Standard-U Birke 18 mit Leisten: Leisten CHF 31.94 statt 96.60, gesamt CHF 660 statt 712 (TR-10).

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
| `shared.js` | Produktbeschreibungen `MAT_INFO`/`BACK_INFO`, daraus mit `preise.js` die Kataloge `MATS`/`BACKS`; Zuschnitt-Packer `pack`, Brett-Packer `packBoards`, Verbindungsbeschläge, `matPrice`, `sheetCosts`, Spannweiten `SPAN`/`maxSpan`, Schrauben nach Stärke `screwFor` |
| `sideboard.js` | Sideboard-Berechnung (1:1 aus der alten `index.html` verschoben, seit dem Schreiner-Review mit Spannweiten je Material) |
| `reduit.js` | Reduit: Raumlayout, 5 Einbau-Arten + selbststehend, Nischen, Kaufteile `BUY` (Namen hier, Preise in `preise.js`) |
| `konfig.js` | Formularwerte → Berechnung (`cfgFromData`), Regelwerk `REGELN`/`pruefeRegeln` und Bauweisen `BAUWEISEN`, «Zufall» (würfelt, bis keine Warnung ausser Kippschutz/Bad bleibt; Reduit behält den Raum), Einträge der «Sammlung» (localStorage `sideboard-werkbank-v2-sammlung`, Kosten beim Speichern), Entwürfe pro Typ (`entwuerfeLaden`, `entwurfSetzen`), `kostenGesamt`, `geaendert`, `sortiere`, `ortAusHash` |
| `einkauf.js` | Einkaufsliste aus dem Ergebnis: Zuschnitt je Platte, ganze Bretter nach Format, Latten, Beschläge/Kaufteile, Oberfläche, Werkzeug; Haken hängen am Zeileninhalt (`hakenFiltern`) |
| `test/sideboard.snapshot.test.js` | Snapshot: Sideboard rechnet wie vor dem Umbau (mit eingefrorenen Preisen `test/fixtures/preise.json`) |
| `test/sideboard.test.js` | Sideboard: Fronten mit eigenem Material und eigener Stärke |
| `test/preise.test.js` | Form und Vollständigkeit von `preise.js` |
| `test/reduit.test.js`, `test/shared.test.js`, `test/einkauf.test.js` | Reduit-Geometrie, Bauarten, Randfälle, Preise; Einkaufsliste und Haken |
| `test/regeln.test.js`, `test/bauweisen.test.js` | Regelwerk (Sperren, Grenzen, Fixpunkt) und Bauweisen |
| `test/kombinationen.test.js` | Schritt 8: jede Bauweise über Form, Wand, Tür, Raum; Zufall mit festem Seed; Geometrie (Überschneidung, Auflagen), Zahlen, Fixpunkt |
| `tools/jumbo-preise.mjs`, `tools/jumbo-quellen.json`, `tools/preise-datei.cjs` | Jumbo-Preise (Platten, Bretter, Kaufteile) lesen, mit `preise.js` vergleichen und nachführen (siehe «Preise nachführen») |

Preis-Updates in `preise.js` brechen den Snapshot nicht mehr (er rechnet mit `test/fixtures/preise.json`). Ändert sich eine Produktbeschreibung in `MAT_INFO`, schlägt er fehl: prüfen, dass sich nur `R.M` unterscheidet (bei einem neuen Namen auch Gruppen, Schlüssel und `matShort`), und die Fixture neu schreiben (siehe Commit `b424766`).

## Orte und Speicher

- Orte: `#entwerfen`, `#einkaufen`, `#bauen`, `#sammlung`. Handy: je eine Ansicht mit Leiste unten. Desktop: Einkaufen/Bauen als Reiter neben dem Entwurf (Hash per `replaceState`), Sammlung als eigene Ansicht. Spec: `docs/superpowers/specs/2026-09-26-ansichten-design.md`.
- localStorage: `sideboard-werkbank-v2-entwuerfe` (ein Entwurf pro Typ; `sideboard-werkbank-v2` wird nur noch beim ersten Laden übernommen), `-sammlung`, `-aktiv` (geladene Variante), `-haken` (pro Typ), `-bau` (Unterreiter), `-sort`, `-schloss` (gesperrte Gruppen für «Zufall»).

## Preise

- Plattenpreise sind **Jumbo-Zuschnittpreise pro m²**. Jumbo verlangt im Zuschnitt denselben m²-Preis wie für die ganze Platte, darum zeigt die Summary beides: «Holz Zuschnitt» (nur Teilefläche) und «Holz ganze Platten» (Plattenzahl × Plattenfläche).
- Alle Preise und Formate stehen in `preise.js`, jeder Eintrag mit `stand` (Datum der letzten Kontrolle) und `quelle`. Der Code enthält keine Preise mehr.
- Preise pro Stärke: `platten[k].prices = { Stärke: CHF/m² }`. Die angebotenen Stärken ergeben sich daraus; `MATS[k].price` = Preis der Standardstärke (für die Sortierung). Eine neue Stärke braucht zusätzlich einen `SPAN`-Wert in `reduit.js` (Test prüft das).
- Gespeicherte Konfigurationen merken sich die Katalogwerte beim Speichern (`katalog`). Beim Laden gelten die aktuellen Katalogwerte, ausser Preis oder Format wurden von Hand geändert.
- **Ganze Bretter:** `preise.js` → `bretter` (Stärke, Formate mit Stückpreis): go/on Leimholz Fichte 18, go/on 3-Schicht 19, Mood Fichte A 18, Regalbauplatte weiss 16, Möbelplatte weiss 18, Schaltafel 27. Nur ablängen, Teilbreite = Brettbreite (Toleranz 15 mm), nur beim Reduit. Die Regaltiefe rastet auf die Brettbreite ein; lange Tablare werden 45 mm neben einer Stütze gestossen (Stossleiste darunter, bei «Leisten» ein Pfosten vorne). Packer `packBoards` in `shared.js`.
- Bretter nachführen: `node jumbo-preise.mjs --schreiben gon_fichte mood_fichte regalbau moebel_weiss` (Schlüssel «material LxB» in `jumbo-quellen.json`; der «Best Price» steht nur auf der Produktseite, nicht in der Suchliste).
- Rückwände: `hdf3` = Oecoplan MDF Lack Line 1-seitig weiss 3 mm (ersetzt «HDF weiss»), `hf3` = Hartfaserplatte roh 3 mm, `ply6` = Oecoplan Sperrholz Pappel A/B 5 mm.

### Preise nachführen: `tools/jumbo-preise.mjs`

jumbo.ch sperrt normale Automatisierung (403, auch mit Playwright). Das Skript nutzt darum **Patchright** (getarntes Playwright) mit einem sichtbaren Chrome-Fenster und eigenem Profil (`tools/.jumbo-profile`, nicht im Repo).

```sh
cd tools && npm install                                  # einmalig
node jumbo-preise.mjs suche "OSB" "Sperrholz Pappel"     # Produkte + URLs finden (Z = Zuschnitt)
node jumbo-preise.mjs                                    # alle Quellen: Preis pro Stärke + max. Zuschnitt, Vergleich mit shared.js
node jumbo-preise.mjs osb ply6                           # nur einzelne
node jumbo-preise.mjs kaufteile                          # Stückpreise aller Kaufteile mit Quelle
node jumbo-preise.mjs --schreiben [osb …]               # lesen und preise.js nachführen
```

- Quellen: `tools/jumbo-quellen.json`, Schlüssel = Material aus `MATS`/`BACKS`, optional `birke~Variante` für Alternativen. Pro Material genügt eine Produkt-URL; die übrigen Stärken liest das Skript aus der Stärke-Auswahl.
- Ohne `--schreiben` vergleicht das Skript nur. Mit `--schreiben` übernimmt es Preise und max. Zuschnitt bekannter Stärken in `preise.js` und setzt `stand` auf heute. Neue oder weggefallene Stärken meldet es nur, Varianten (`~`) werden nie geschrieben, und bei je Stärke verschiedenem Zuschnittmass bleibt das Format stehen. Danach `node --test` und den Diff prüfen.
- Schonend: eine Seite nach der anderen, 4–5,5 s Pause. `tools/` ist in `.assetsignore`, wird also nicht deployt.
- Kaufteile: Schlüssel aus `preise.js` → `kaufteile`, in `jumbo-quellen.json` mit `stueck` (Stück pro Packung) und bei Meterware `laenge` (Meter pro Stück). Geschrieben wird der Preis pro Stück bzw. Meter, `est` fällt weg, `quelle` nennt Produkt, Packung und Packungspreis. Passt die Packung auf der Seite (Name oder URL, z. B. «2 Stück») nicht zu `stueck`, oder fehlt der Preis, wird nichts geschrieben.
- Stand 25.09.2026: alle Platten und Rückwände gelesen und übernommen. Schaltafel gibt es nicht im Zuschnitt (ganze Tafel 27 × 2000 × 500, CHF 29.50), OSB 22 mm nicht mehr im Angebot.

### Noch offen

- [x] **Preise aus dem Code nehmen:** erledigt – `preise.js`, Skript mit `--schreiben`, Snapshot mit eingefrorenen Preisen.
- [x] **Gespeicherte Konfiguration überschreibt neue Katalogpreise:** erledigt (siehe «Preise»). Nebenbei: beim ersten Besuch standen Preis 55 und Format 2500 × 1250 statt der Birke-Werte im Formular.
- [x] **Ganze Bretter in festen Formaten:** erledigt fürs Reduit (Spec `docs/superpowers/specs/2026-09-25-feste-formate-design.md`). Offen: Sideboard mit Brettern, Längsschnitte (`laengs:true` pro Produkt), Mood Eiche; go/on 3-Schicht hat noch keine Skript-Quelle (Suche findet sie nicht, URLs von Hand in `jumbo-quellen.json` eintragen).
- [ ] **Stösse nach Brettpreis statt nach Stützen legen:** Heute kommt der Stoss neben die Stütze, die der gleichmässigen Teilung am nächsten liegt (`shelfJoints` in `reduit.js`). Das ergibt gültige Stücke, aber nicht immer die günstigsten Bretter. Beispiel: 2400 mm Wand, go/on, Wandschienen → Stücke 1242 + 1152 mm → Bretter 2000 + 1200 = CHF 33.00 pro Tablar. Mit dem Stoss so, dass beide Stücke ≤ 1200 bleiben, wären es 2 × 1200 = CHF 25.00 (bei 5 Tablaren CHF 40 weniger). Idee: alle gültigen Stossstellen (Stützen + 45 mm) durchprobieren und die mit den kleinsten Brettkosten wählen (`packBoards` pro Variante rechnen); bei Gleichstand die gleichmässigere. Wenn keine Stütze passt, eine Stütze an der günstigsten Stelle dazunehmen.
- [x] **Spannweitenwarnung bei «Leisten» mit Stosspfosten rechnen** (erledigt 28.09.2026, misst jetzt das freie Feld): Bei ganzen Brettern kommt an jeden Stoss ein Pfosten vorne, die Warnung rechnet aber mit der ganzen Tablarlänge (`longest` in `SUPPORTS.battens`, `reduit.js`). Beispiel: 2400 mm Wand, go/on → «Tablare hinten (2394 mm) liegen vorne frei», tatsächlich frei sind je rund 1200 mm. Hier bleibt die Warnung trotzdem berechtigt (Richtwert go/on 18 mm: 600 mm). Kosten spart der Fix nur, wo die Felder zwischen Wand und Pfosten unter den Richtwert fallen: Dann entfällt eine Warnung, die sonst zu Wandschienen rät (Beispiel oben: Kaufteile CHF 415 statt 24). Idee: freie Feldlängen zwischen Wand, freien Enden und Stosspfosten messen und die längste melden; optional statt der Warnung zusätzliche Pfosten vorschlagen (wie beim Pfostenrahmen).
- [ ] **Tiefe nach der Seitenbegrenzung besser verteilen:** Sind die Seitenregale zu tief für die Raumbreite, werden beide anteilig gekürzt und danach auf eine Brettbreite abgerundet (`normReduit`, `reduit.js`). Beispiel: go/on, U, Raumbreite 1000, Seiten 400/400 → 350/350 → 200/200, obwohl 400 + 200 in die erlaubten 700 mm passen würden. Das kostet kein Geld, sondern Stauraum (400/200 ist sogar etwas teurer, aber eine Seite doppelt so tief). Idee: bei Brett-Material die Kombination aus Brettbreiten suchen, die die erlaubte Summe möglichst ausschöpft und den gewünschten Tiefen am nächsten liegt; Hinweis nennt, welche Seite wie tief wird.
- [ ] Notiz am Tablarstück lautet «am Stoss auf der Stossleiste» statt wie in der Spec «gestossen über Schiene/Winkel/Pfosten».
  - Sicher dabei: **go/on Leimholzbrett Fichte** 18 mm (200/400 × 1200/2000).
  - Vorschlag, noch offen: Regalbauplatte weiss 16 mm (1150 × 200…600, Kanten beschichtet), Mood Eiche 18 mm 2000 × 600 (Sideboard-Tiefe, ≈ 76 statt 109/m²), evtl. Mood Fichte A 18 mm. Schaltafel ist schon ein festes Format und gehört ins neue Modell. Nicht: OSB mini, Vielzweckplatte.
  - Reihenfolge: zuerst Preise in die Datendatei auslagern, dann die festen Formate dort mit erfassen.
- [ ] **Kaufteile nachprüfen** (`preise.js` → `kaufteile`, `est:true`, in der Beschlägeliste «Preis geschätzt»). Das Skript liest seit 01.10.2026 Stückpreise (siehe «Preise nachführen»); gelaufen ist es noch nicht – jumbo.ch sperrt Abrufe ohne Browser (403) und zeigt sonst eine Bot-Prüfung, darum auf deiner Maschine starten: `cd tools && node jumbo-preise.mjs kaufteile --schreiben`, danach `node --test` und den Diff prüfen.
  - **Mit Quelle (das Skript liest sie):** `rail1000`, `rail1500`, `rail2000` (2er-Pack), `konsole250`, `konsole350`, `konsole400`, `konsole470` (U-Träger), `winkel200`, `winkel250`, `screw4x40` (500er-Pack), `screw5x60` (50er-Pack). URLs per Websuche gefunden; ob Packung und Produkt stimmen, prüft das Skript beim Lesen.
  - **Ohne Quelle, von Hand prüfen:** `konsole300` (keine weisse 30-cm-Konsole gefunden – gibt es sie nicht, `KONSOLE_LENS` ohne 300), `winkel150` (keine Blechkonsole 150 × 200 gefunden), `angle40` (Winkelverbinder 40 × 40: Packung unklar), `dowel6` und `dowel6x60` (SX 6 × 30 mit Schraube: Set mit passender Schraube suchen), Holzschrauben `screw3.5x10`, `screw4x12`, `screw4x16`, `screw4x20`, `screw4x25`, `screw3.5x30`, `screw4x35`, `screw4x45`, `doorstop`. Gefundene URLs mit `stueck` in `jumbo-quellen.json` eintragen (`node jumbo-preise.mjs suche "…"` hilft).
  - **Hinweise aus der Websuche (nicht von der Produktseite, nicht übernommen):** Wandschiene 100 cm 2er-Pack ca. CHF 9.50 (≈ 4.75/Stk, geschätzt 12), Blechkonsole 150 × 200 ca. CHF 1.75 (geschätzt 3.50), Spax 5 × 60 50 Stück CHF 11.50 (0.23, geschätzt 0.18), Spax 4 × 40 500 Stück CHF 25.95 (0.05, geschätzt 0.09). Die Schätzungen der Schienen liegen vermutlich deutlich zu hoch – die Karte «Wandschienen» ist darum wohl zu teuer.
- [ ] Richtpreise für Sideboard-Beschläge (Scharniere, Schiebetürbeschlag, Füsse) fehlen ganz; ebenso Verbindungsbeschläge und Rückwandschrauben (beide Möbel) und Oberfläche (Öl, Grundierung, Lack).
- [ ] Ungenau, aber keine Preise: Spannweiten `SPAN` (Daumenregel), Ergiebigkeit von Farbe/Öl (10 bzw. 22 m²/l), Schnittkosten beim Zuschnitt nicht eingerechnet.

## Oberfläche

- Möbeltyp-Umschalter steht im Kopf (Radios mit `form="cfg"`, Ereignisse laufen über `#kindBar` in dieselben Handler). «In Sammlung»: Handy in der Leiste unten («Sammeln» neben «Ergebnis»), Desktop im Kopf neben dem Preis (`.js-sammeln`, Meldung `.js-sammelmsg`).
- Schloss pro Gruppe (`data-lock` an der `section`, Felder in `SPERREN` in `konfig.js`): Gesperrte, sichtbare Gruppen bleiben bei «Zufall», wie sie sind; `zufall(base, rnd, tries, locks)` richtet den Rest danach (feste Nische → Form mit Regal an dieser Seite, feste Tablartiefen → kein Brettmaterial, das sie verschiebt). Gemerkt pro Browser in `sideboard-werkbank-v2-schloss`.
- Tablartiefe bei ganzen Brettern: Regler und Zahlenfeld rasten auf die Brettbreiten ein (`snapBreite`), Pfeiltasten springen eine Breite weiter, darunter Markierungen und ein Hinweis (`syncDepths` in `index.html`).
- Gruppe «Material»: Auswahl in zwei Gruppen («Zuschnitt ab Platte», «Ganze Bretter, nur ablängen»), je nach m²-Preis sortiert, nur Namen (ein Preis würde im schmalen Formular abgeschnitten). Stärke als Knöpfe, ausgeblendet bei nur einer Stärke (ganze Bretter). Rückwände aus `BACKS`. Darunter ein Kasten mit Farbmuster, Richtpreis der gewählten Stärke, den anderen Stärken zum Vergleich, eigenem Preis (falls geändert), max. Zuschnitt, Merkmalen und Beschreibung.
- Materialnamen einheitlich (`MAT_INFO` in `shared.js`, Test in `test/shared.test.js`): Werkstoff, dann Holzart oder Farbe, dann Qualität, Marke ganzer Bretter in Klammern – «Sperrholz Birke Premium», «Leimholz Eiche», «MDF roh», «Spanplatte weiss», «Leimholz Fichte (go/on)». Es gibt nur noch `name` (kein `short`); Einkaufsliste, Plattenplan und Sammlung zeigen denselben Namen wie die Auswahl.
- Fronten (Sideboard, Gruppe «Front»): `frontMat` = «wie Korpus» (`korpus`) oder eine Zuschnittplatte, `frontT` = Stärke als Knöpfe, **höchstens 19 mm** (`FRONT_MAX`, `frontTs` in `sideboard.js`); «wie Korpus» bei einem dickeren Korpus nimmt dasselbe Material in der dicksten Stärke bis 19 mm. Wer das Korpusmaterial eigens wählt, bekommt die nächstdünnere Stärke vorgeschlagen. `frontMaterial(c)` in `sideboard.js` löst das auf (`fmat`, `MF`, `tf`). Abweichende Fronten bekommen eine eigene Plattengruppe mit Katalogformat und -preis der Stärke (der Preis im Formular gilt nur für den Korpus). Frontstärke steuert Schiebetür-Schienen und Mittelwandtiefe, Gesamttiefe, Scharniere (unter 15 mm Topf Ø 26 statt 35), Frontfarbe «natur», Öl/Lack/Kantenband, Bad-Hinweise und Bauablauf. Hinweise: Schiebetüren unter 16 mm (Beschläge meist für 16–19 mm), dünne Türen über dem Richtwert (12 mm bis 600 mm Türhöhe, 15 mm bis 900 mm, Leimholz erst ab 18 mm – Daumenregeln, keine Norm). Zufall: meist wie Korpus, sonst dünner aus demselben Material oder MDF lackiert. Ältere Einträge ohne `frontMat` gelten als «wie Korpus» (`STANDARD` in `konfig.js`).
- Reihenfolge im Formular (seit den Bauweisen): Sideboard: Zufall · Masse und Einsatzort · Bauweise · Aufbau · Front · Optik · Platten & Preise. Reduit: Zufall · Raum · Bauweise · Form · Tablare · Nische · Optik · Platten & Preise. Die Gruppen «Bauart», «Verbindung» und «Niveau» sind ausgeblendet (die Felder bleiben im Formular, ihre Werte folgen aus der Bauweise).

## Ideen (noch nicht entschieden)

- **Ansichten trennen** (Entwerfen / Bauplan / Sammlung, evtl. Möbelwahl als erster Schritt): vorgeschlagen am 25.09.2026, Entscheid offen. Prompt für die Diskussion: `docs/prompts/ansichten-flow.md`.

- **Materialauswahl mit Filter** (Optik wählen, dann passende Platten; beim Sideboard die rustikalen ausblenden): besprochen, vorerst verworfen – die nach Preis sortierte Liste reicht.
- **Maserung pro Bauteil wählbar**: verworfen; die Richtung wird automatisch festgelegt und in der Materialliste ausgewiesen.

## Bekannte Eigenheiten

- Birke-Platte hat die Maserung über die 1500er-Seite: Teile über ca. 1480 mm mit Maserung längs passen nicht. Der Konfigurator warnt; Lösung: Checkbox «Maserungsrichtung einhalten» aus (quer schneiden).
- Jumbo-Wandschienen gibt es nur bis 200 cm; bis ca. 2,65 m Raumhöhe setzt der Konfigurator das oberste Tablar so, dass eine Schiene reicht (K08), darüber zwei Stücke übereinander.
- Ein eigentliches Möbel-Kippschutz-Set führt Jumbo nicht; eingeplant ist die Abus-Kippsicherung mit Gurt.
- Die hintere Nische wurde bewusst entfernt (beim U immer gesperrt).
