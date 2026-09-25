# Reduit-Konfigurator – Design

Datum: 2026-09-25 · Branch: `feature/reduit`

## Ziel

Neuer Möbeltyp «Reduit» im bestehenden Konfigurator (`index.html`). Ein Reduit ist ein kleiner Abstellraum, der mit Regalen ausgebaut wird. Man soll für dieselben Raummasse verschiedene Varianten durchschalten und Materialliste, Kosten und Aufwand direkt vergleichen können.

Zuerst für ein konkretes Reduit gedacht, aber allgemein nutzbar gebaut.

**Erfolgskriterien**

- Raummasse einmal eingeben, dann Form (gerade / L / U) und Bauart (selbststehend / 5 Einbau-Arten) frei umschalten.
- Für jede Variante: Materialliste, Plattenplan, Beschläge & Werkzeug, Bauablauf, 3D-Ansicht, Kosten (Holz + Kaufteile).
- Sinnvolle Warnungen (Tür, Durchgang, Durchbiegung, Gipskarton).
- Das Sideboard verhält sich nach dem Umbau exakt gleich wie vorher.

## Nicht im Umfang

- Frei positionierbare Tür, Tür an anderer Wand, Hindernisse (Sicherungskasten, Rohre, Dachschräge).
- Mehrere Nischen pro Segment, Nischen mitten im Segment.
- Tablaranzahl oder -abstände pro Wand verschieden.
- Türen/Fronten beim Reduit.
- Richtpreise für Sideboard-Beschläge.
- Umbau auf ES-Module oder Build-Schritt.

## Architektur

Keine Build-Stufe, GitHub Pages lädt die Dateien direkt.

| Datei | Inhalt |
|---|---|
| `index.html` | Formular, Typ-Umschalter, `pack()`, alle `render*`-Funktionen, three.js-Szene |
| `shared.js` | gemeinsame Daten und reine Helfer ohne DOM (`MATS`, `BACKS`, `JOINTS`, `COLORS`, `clamp` …) |
| `sideboard.js` | `computeSideboard(c)` (heute `compute`), `buildSteps` – unverändert verschoben |
| `reduit.js` | `computeReduit(c)` und Hilfsfunktionen |
| `test/*.test.js` | Node-Tests (`node --test`, keine Abhängigkeiten) |

Eingebunden per klassischem `<script src>` vor dem Inline-Script. Beide Module sind im Browser Globals und exportieren am Dateiende zusätzlich für Node:

```js
if (typeof module !== 'undefined') module.exports = { computeReduit /* … */ };
```

Die gemeinsamen Daten wandern nach `shared.js`, damit die Node-Tests die Module ohne DOM laden können. Welche Symbole genau mitwandern, ergibt sich aus den Referenzen in `compute`; es wird nur verschoben, nichts geändert.

**Schnittstelle:** `computeReduit(c)` liefert dasselbe Ergebnisobjekt wie `computeSideboard(c)` (`rows`, `groups`, `boxes`, `extras`, `hw`, `tools`, `finish`, `steps`, `warn`, `level` …), ergänzt um:

- `solid`: Liste der Massivholzteile (Querschnitt, Länge, Anzahl)
- `buyCost`: Summe der Kaufteile in CHF
- `room`: Raummasse und Türöffnung für die 3D-Wände
- `kind: 'reduit'` (Sideboard: `kind: 'sideboard'`)

Die Renderer verzweigen nur dort, wo nötig (Summary, 3D-Raumwände).

### Reihenfolge

1. **Characterization-Snapshot:** Ausgabe von `compute` für ca. 10 repräsentative Sideboard-Konfigurationen als JSON festhalten.
2. **Reines Verschieben** nach `shared.js` und `sideboard.js` (Umbenennung `compute` → `computeSideboard`), eigener Commit. Snapshot-Test muss identisch bleiben.
3. Beschriftungen anpassen (siehe unten).
4. Reduit schrittweise: Formular, Geometrie, Bauarten, Ausgabe, 3D.

## UI

Oben im Formular: Umschalter **Sideboard | Reduit**.

Bei «Reduit» werden «Masse», «Aufbau», «Front» ausgeblendet. Neue Gruppen:

1. **Raum** – Breite, Tiefe, Höhe (Zahl + Slider), Türbreite, Checkbox «Tür öffnet nach innen» (Standard aus) mit Bandseite links · rechts, Wandart (Beton/Backstein · Gipskarton/Leichtbau).
2. **Form** – gerade · L · U. Bei L: Ecke links hinten · rechts hinten.
3. **Bauart** – selbststehend · eingebaut. Bei «eingebaut» Karten (wie «Verbindung») mit Niveau und Kurztext: Leisten · Schienen · Winkel · Wangen · Pfostenrahmen.
4. **Tablare** – Tiefe hinten / links / rechts (nur aktive Wände sichtbar), Anzahl Tablare, Abstand unterstes Tablar zum Boden, Abstand oberstes zur Decke.
5. **Nische** – pro Seitensegment optional am vorderen Ende; beim hinteren Segment optional links oder rechts. Je Nische: Breite, Höhe.

«Material», «Platten & Preise», «Niveau» bleiben für beide Typen. «Verbindung» nur bei «selbststehend».

Speicherung in `localStorage` getrennt pro Typ, damit ein Wechsel die andere Konfiguration nicht überschreibt.

## Geometrie

Koordinaten: Raum B (x) × T (z) × H (y), Tür mittig in der Vorderwand. Wandstück neben der Tür: `wf = (B − Türbreite) / 2`.

**Segmente je Form**

| Form | Segmente |
|---|---|
| gerade | hinten |
| L | hinten + links *oder* rechts |
| U | hinten + links + rechts |

**Ecke:** Hinteres Segment läuft über die volle Breite. Seitensegmente beginnen bei `z = Tiefe hinten` und stossen davor an. Alle Tablare liegen auf gleicher Höhe; beim Einbau liegen die Seitentablare hinten auf der hinteren Auflage auf, es braucht dort keine eigene Stütze.

**Seitensegment und Tür:** Läuft standardmässig bis zur Vorderwand (Ende an Wand).

- Seitentiefe > `wf` → Warnung «Regal ragt in die Türöffnung».
- «Tür öffnet nach innen»: Seitensegment auf der Bandseite endet `Türbreite` vor der Vorderwand → freies Ende. (Bandseite aus dem Formular, Standard links.)

**Nische:** An einem Segment-Ende, Breite × Höhe. Unterhalb der Nischenhöhe entfallen Tablare und Auflagen; darüber laufen sie durch. Die Nischenkante ist für die unteren Tablare ein freies Ende.

**Freie Enden** entstehen nur durch Tür-Aufschlag oder Nische. Regel: Liegt ein Tablar-Ende nicht an einer Wand, bekommt es eine Stütze – bei Bauart «Wangen» eine Wange, sonst einen Pfosten – plus Hinweis.

**Durchbiegung:** Maximale freie Spannweite pro Material und Stärke (Daumenregel für ein belastetes Reduit-Tablar, ca. 30–40 kg/m, Durchbiegung ≤ ca. 1/200). MDF kriecht unter Dauerlast, daher tiefer.

| Material | Stärke → max. Spannweite |
|---|---|
| Multiplex Birke | 15 → 650 · 18 → 800 · 21 → 950 |
| Eiche Leimholz | 18 → 700 · 20 → 800 · 26 → 1000 |
| Fichte Leimholz | 18 → 600 · 28 → 950 |
| Sperrholz Seekiefer | 15 → 550 |
| Sperrholz Fichte | 18 → 700 |
| MDF | 16 → 450 · 19 → 550 · 22 → 650 |

Tabelle als `SPAN` in `reduit.js`. Regeln, wenn die freie Spannweite **≥ max** ist:

- Bauarten mit Trägern (Schienen, Winkel, Wangen, Pfostenrahmen): Träger-/Stützenanzahl wird so erhöht, dass jede Spannweite < max ist. Zusätzlich Meldung (Hinweis): «Spannweite ≥ X mm – Zwischenstütze(n) eingefügt.»
- Leisten: Die Vorderkante liegt frei. Meldung (Warnung): «Tablar ≥ X mm frei gespannt – biegt sich vorne durch. Pfosten vorne oder dickeres Material wählen.»
- Selbststehend: Module sind ≤ 900 mm; ist 900 ≥ max (z. B. MDF), wird die Modulbreite auf < max begrenzt und gemeldet.

**Durchgang:** Bei U Warnung, wenn `B − Tiefe links − Tiefe rechts < 600 mm`.

**Selbststehend:** Jedes Segment wird in gleich breite Module ≤ 900 mm geteilt, 10 mm Luft zur Wand. Seitenmodule stossen vor die hinteren Module. Ab Höhe 1200 mm: Kippsicherung (Wandwinkel) in den Beschlägen.

## Bauarten

Gemeinsam (eingebaut): Tablare 3 mm Luft zur Wand, Tiefe = Wandtiefe. Wandart bestimmt Dübel/Schrauben; bei Gipskarton Warnung zur Traglast.

Intern eine Funktion pro Art mit gleicher Signatur:

```js
supports[art](segment, shelves, cfg) → { parts, solid, hw, extras, warn }
```

| Art | Holzteile (Platte) | Massivholz | Kaufteile | Spannweite / freies Ende |
|---|---|---|---|---|
| Leisten | Tablare; Leisten 18 × 40 mm aus Plattenmaterial längs geschnitten, 3 Seiten je Tablar | – | Schrauben, Dübel alle 400 mm | zu lang: Warnung + Vorschlag Pfosten; freies Ende: Pfosten |
| Schienen | Tablare | – | Wandschienen, Konsolen (Länge ≈ Tiefe) | Schienenanzahl aus Spannweite; freies Ende: Pfosten |
| Winkel | Tablare | – | Tablarwinkel | Winkelanzahl aus Spannweite; freies Ende: Pfosten |
| Wangen | Tablare; Wangen (Tiefe × Raumhöhe − 10), Lochreihe 32er-Raster, an jedem Segment-Ende + Zwischenwangen | – | Bodenträger (4 pro Tablar), Wandwinkel | Zwischenwange; freies Ende: Wange |
| Pfostenrahmen | Tablare | Kanthölzer 45 × 45 (Pfosten), Latten (vorne quer + Wandleisten) | Schrauben, Dübel | Zwischenpfosten |

**Selbststehend:** Eigener Modul-Builder in `reduit.js` (nicht `computeSideboard`, das auf H ≤ 1400 und ≤ 3 Böden begrenzt ist). Modul = 2 Seiten, Boden, Deckel, Tablare, optional Rückwand; Verbindung aus der bestehenden Auswahl, Texte aus `JOINTS`. Nische = eigenes Modul in Nischenbreite, Seiten bis zum Boden, kein Boden unten, erstes Tablar auf Nischenhöhe.

## Ausgabe und Beschriftungen

| heute | neu |
|---|---|
| Untertitel «… Zuschnitt, Beschläge und Bauablauf erhalten.» | «Masse eingeben – Materialliste, Plattenplan und Bauablauf erhalten.» |
| Tab «Zuschnittliste» | «Materialliste» |
| Tab «Plattenplan» | unverändert |
| Tab «Beschläge & Werkzeug» | unverändert |
| Gruppe «Zuschnitt» | «Platten & Preise», neues Feld «Preis Massivholz CHF/m» |
| Summary «Aussenmass» | Reduit: «Raum» |
| Summary «Material ca.» | «Holz ca.»; Reduit zusätzlich «Kaufteile ca.» |
| «Liste kopieren» | unverändert, kopiert inkl. Massivholz |

Materialliste: Gruppen pro Plattenmaterial wie heute, plus Gruppe «Massivholz» (Querschnitt, Länge, Anzahl, Laufmeter total). Massivholz erscheint nicht im Plattenplan.

## Preise

Richtpreise für Reduit-Kaufteile (Wandschienen, Konsolen, Tablarwinkel, Bodenträger, Kanthölzer, Latten, Dübel/Schrauben) werden **bei Jumbo (jumbo.ch) recherchiert**, wie die bestehenden Plattenpreise. Jeder Preis bekommt im Code einen Kommentar mit Produkt und Recherchedatum. Wo Jumbo ein Teil nicht führt, wird das vermerkt und ein vergleichbares Jumbo-Produkt gewählt.

## 3D

- Raumwände (Boden, Rück-, Seitenwände, Vorderwand mit Türöffnung) als halbtransparente graue Boxen; Vorderwand ausblendbar (Button).
- Neue `extras`-Typen: `rail`, `bracket`, `post`. Leisten und Wangen sind normale Holzboxen.
- Explosionsansicht: Tablare fahren nach vorne.
- Nische als gestrichelte Umriss-Box.

## Tests

- `test/sideboard.snapshot.test.js`: Characterization-Snapshot vor und nach dem Verschieben, Ausgabe identisch.
- `test/reduit.test.js`: Segmente je Form, Ecke, Tür-Aufschlag, Nische, freie Enden, Spannweiten und Trägeranzahl, Durchgang-Warnung, Modul-Aufteilung selbststehend.
- Ausführen mit `node --test`.
- Abschliessend Durchklicken im Browser (Playwright): Typwechsel, alle Form × Bauart-Kombinationen rendern ohne Konsolenfehler.
