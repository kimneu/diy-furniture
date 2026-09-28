# Konfigurator eingrenzen mit festen Bauweisen

## Kern

- **Wie gross die Auswahl heute ist** (BW_1.js, BW_4.js):
  - Sideboard: 28 Kombinationen aus Material × Stärke, 4 Verbindungen und 4 Rückwände. Das ergibt 448 Korpusvarianten je Einsatzort.
  - Reduit: Material × Stärke × Bauart (bei selbststehend zusätzlich × Verbindung × Rückwand) × Wandart ergibt 1428 Varianten.
- **Was der Vorschlag daraus macht:**
  - Sideboard: 5 Bauweisen. Das Bad ist ein Zusatz zu 3 davon. Aus den 448 Korpusvarianten werden 28.
  - Reduit: 6 Bauweisen. Aus den 1428 Varianten werden 254 (Prototyp-Prüfung, Masse nicht mitgezählt).
- **Wie viel der heutige Zufall ausserhalb läge:** Sideboard 281 von 400 Würfen, Reduit 198 von 400 (BW_4.js, gleiche Startwerte wie bei MX).
- **Prinzip:** Die Bauweise ist eine eigene Schicht über der Rechnung.
  - `computeSideboard` und `computeReduit` rechnen weiterhin jede Eingabe. Der Snapshot `test/sideboard.snapshot.test.js` bleibt deshalb grün. Verstösse gegen die gewählte Bauweise melden sie als harte Warnung.
  - Formular, Zufall und Sammlung arbeiten nur noch mit Bauweisen.
  - Frei bleiben Masse, Aufteilung und die Optik innerhalb der Bauweise.
- **Freischalten erst nach den Korrekturen:** Eine Bauweise wird erst angeboten, wenn die Konstruktionsfehler behoben sind, von denen sie abhängt (Liste in Abschnitt 7). Eine Bauweise, die auf einer heute kritischen Konstruktion beruht, verspricht sonst mehr, als sie hält. Beispiel: Pfostenrahmen (EP-1, TR-1).

---

## 1 Sideboard: 5 Bauweisen und der Zusatz «Bad»

### 1a Aufbau

| ID | Bauweise | Für wen | Material (frei innerhalb) | Stärke Korpus / Front / Tablar | Verbindung | Rückwand | Oberfläche | Niveau (offen / mit Türen) | Holz CHF* |
|---|---|---|---|---|---|---|---|---|---|
| S1 | Sperrholz geölt | Einsteiger, Skandi-Look | Sperrholz Birke Premium, Birke Standard, Sperrholz Fichte; Dreischicht Fichte | 18 bzw. 19 / gleiches Material 18/19 oder MDF 16/19 lackiert / wie Korpus | Taschenloch 32 mm, Grobgewinde | MDF weiss 3, Hartfaser 3, Pappel 5 | Hartwachsöl; Farbe nur mit Isoliergrund (SF-9) | 1 / 2 | 170–247 |
| S2 | MDF lackiert | Farbe, glatte Fronten | MDF roh (im Bad MDF MR) | 19 / MDF 16/19 / 19 | Holzdübel 8 × 40, verleimt | MDF weiss 3 | Grundierung für MDF und Möbellack, vor dem Zusammenbau (DY-18) | 2 / 3 | 121 |
| S3 | Weiss beschichtet, zerlegbar | günstig, Mietwohnung, Fertigmöbel-Look | Spanplatte weiss | 19 / Spanplatte weiss 16/19 oder MDF 16/19 lackiert / 19 | Exzenter Ø 15 für 16–19 mm + Führungsdübel 8 × 30 | MDF weiss 3, Hartfaser 3 | Kantenband; nicht schleifen (SF-E1, DY-16); keine Farbe auf Spanplatte (SF-9, MX-14) | 2 / 3 | 88 |
| S4 | Massivholz geölt | Fortgeschrittene, Möbel «fürs Leben» | Leimholz Eiche, Leimholz Fichte | 18 / Leimholz 18 bis 900 mm Türhöhe, darüber Dreischicht 19 / 18 | Holzdübel 8 × 40, verleimt | Pappel 5, MDF weiss 3 | Öl (Fichte mit Weissöl); Eiche nie lackieren; Fichtefront mit Farbe nur mit Isoliergrund | 2 / 3 | 176–307 |
| S5 | Sperrholz sichtbar verschraubt | ohne Spezialwerkzeug, Werkstatt-Look | Sperrholz Birke Premium, Sperrholz Fichte; Dreischicht Fichte | 18 bzw. 19 / wie S1 / wie Korpus | Senkkopf 4 × 50 mit Teilgewinde; Deckel zwischen den Seiten | wie S1 | Öl | 1 / 2 | 188 (offen) |
| Bad | Zusatz zu S1 (nur Birke), S2 (MDF MR), S4 (nur Eiche) | Feuchtraum | – | wie Grundbauweise | wie Grundbauweise, Leim D4, Schrauben A2 | nur Pappel 5, beidseitig lackiert | PU-Lack, 3 Schichten, vor der Montage | +0 | Birke 254, MDF 120 |

\* Holz im Zuschnitt für 1200 × 720 × 400 mm, 1 Einlegeboden, Drehtüren, Füsse. Die Fächer sind nach der Spannweite gewählt: S2 und S3 mit 3 Fächern, alle anderen mit 2. Beschläge haben keinen Preis, weil die Richtpreise fehlen (bekannt, WEITERARBEIT «Noch offen»). Alle elf Varianten laufen in der heutigen Rechnung ohne harte Warnung durch (BW_2.js, BW_6.js).

### 1b Beschläge und Grenzen

| ID | Beschläge (zusätzlich zu den Rahmenregeln unten) | Grenzen |
|---|---|---|
| S1 | Topfscharnier Ø 35, 110°, Montageplatte 0: aussen aufliegend (16,5/17,5 mm), an der Mittelwand halb aufliegend (7,5/8,0 mm) | Fach mit Einlegeboden höchstens Birke 800, Sperrholz Fichte 700, Dreischicht 650 mm |
| S2 | Dübelloch 12 mm in der Fläche + 30 mm in der Kante (SK-12, DY-30). Korpuszwingen mit mindestens W + 100 mm Spannweite (SK-13) | Fach höchstens 550 mm. Mit Einlegeböden und 4 Fächern höchstens W 2295 mm (4 × 550 + 5 × 19) |
| S3 | Exzentergehäuse ca. 13,5–14 mm tief (MX-1) | Fach höchstens 500 mm, damit mit Einlegeböden höchstens W 2095 mm. Nicht im Bad (SK-7, MX-10) |
| S4 | Maserung immer einhalten (SK-4). Türen aus Leimholz höchstens 900 mm hoch (MX-9, SF-E3); mit 160 mm Füssen heisst das H ≤ ca. 1060 mm (Eiche, H 1100 ergibt eine Tür von 937 mm, BW_6.js) | Fach höchstens Eiche 700, Fichte 600 mm |
| S5 | Durchgangsloch Ø 4,5 mm, Kante 2,5–3 mm vorbohren (SK-8). Mittelwände unten durch den Boden schrauben, oben mit 2 Winkeln 40 × 40 (SK-14). Abdeckkappen | Deckel immer zwischen den Seiten (sideboard.js:170, konfig.js:112). Nicht im Bad (Vereinfachung) |

**Rahmenregeln für jede Sideboard-Bauweise:**

- **Fächer:** Die Fachzahl wird aus `maxSpan(mat, t)` vorbelegt; kleinere Werte sind gesperrt (SK-3, MX-4; sideboard.js:165). Ohne Einlegeboden gilt für Deckel und Boden bei jeder Fachzahl: Fach höchstens SPAN + 200 (MX-4; sideboard.js:167).
- **Drehtüren:**
  - Ab 600 mm Türbreite kommen automatisch 2 Türen, mit einer gemeinsamen Konstante (SF-11).
  - «2 Türen pro Fach» gibt es erst ab 500 mm Fachbreite (SF-13).
  - Die Zahl der Scharniere richtet sich auch nach dem Türgewicht (SF-4).
  - Kein Einlegeboden auf Scharnierhöhe (SF-E2).
  - An einer Mittelwand mit zwei Türen die Scharniere mindestens 64 mm versetzen (SF-5).
  - Push-to-open bei Doppeltüren am Deckel befestigen (SF-6).
- **Schiebetüren:**
  - Nur 16–19 mm Frontstärke (sideboard.js:145).
  - Fächer und Türen sind gekoppelt: 2 oder 3 Fächer mit ebenso vielen Türen, oder 4 Fächer mit 2 Türen (SF-7).
  - Die Lochreihe in den Seiten liegt bei slideSet + 40 mm (SK-1, SF-2, DY-28).
- **Kippschutz:** ab H > 1000 mm als eigener Schritt (DY-6).

**Frei innerhalb jeder Bauweise:** Masse und Möbeltyp, Fächer ab dem Minimum, Einlegeböden, Front (offen, Drehtür, Schiebetür), Griff, Material aus der Liste der Bauweise, Frontmaterial und Farbe (nur wo zugelassen), Rückwand aus der Liste, Untergestell, Deckel (ausser bei S5).

---

## 2 Reduit: 6 Bauweisen

### 2a Aufbau

| ID | Bauweise | Für wen | Tablarmaterial | Stärken | Tragwerk und Verbindung | Rückwand | Oberfläche | Wandart | Niveau | CHF** |
|---|---|---|---|---|---|---|---|---|---|---|
| R1 | Leisten | kurze Wände, schmale Reduits, Nischen | Platten ab 15 mm (Sperrholz, Dreischicht, OSB, Spanplatte weiss, Leimholz) und ganze Bretter, **kein MDF** | Tablar ≥ 15 | Wand- und Endleisten aus Dachlatte 24 × 48, hochkant (21 mm Auflage). Bei L/U eine Eckstütze 45 × 45 vor der Innenecke | – | roh oder geölt, vor der Montage (DY-18) | Beton/Backstein oder Gipskarton (TR-7) | 1 | I 800 × 1200, Birke Standard: 120 |
| R2 | Pfostenrahmen | Kellerregal, lange Wände, schwere Last, Gipskarton | wie R1, **zusätzlich MDF 19 und Spanplatte 19** | Tablar ≥ 15 | Kantholz 45 × 45 bündig mit der Regaltiefe, Querlatte 24 × 48 dahinter, Tablar Tiefe − 48 mm und rechteckig. Eckpfosten an jeder Innenecke. Pfosten höchstens 1200 mm auseinander | – | wie R1 | beide | 1 | OSB 309, go/on 333, Sperrholz Fichte 528 |
| R3 | Wandschienen | verstellbare Höhen, massive Wand | wie R1 | Tablar ≥ 15 | Element-System-Schienen mit Konsolen. Tablar beginnt 2 mm vor der Schiene (Tiefe − 14 mm) | – | wie R1 | nur Beton/Backstein | 1 | Sperrholz Fichte 1175 (davon Kaufteile 770, geschätzt) |
| R4 | Tablarwinkel | flache Tablare, günstig | wie R1 | Tablar ≥ 15 | Blechkonsolen, der lange Schenkel an die Wand | – | wie R1 | nur Beton/Backstein | 1 | Sperrholz Fichte, Tiefen 300/250, unterstes Tablar 260: 595 |
| R5 | Wangen mit Lochreihe | alles aus Holz, verstellbar, Gipskarton | Sperrholz Birke Premium/Standard 18, Sperrholz Fichte 18, Dreischicht 19 | Wange = Tablar, ≥ 18 | Wangen mit 32er-Lochreihe; oben ein Winkel an die Wand; je Feld das unterste Tablar als fester Boden, am freien Ende auch das oberste (TR-8) | – | Öl | beide | 2 | Dreischicht 1127; mit kürzeren Wangen (EG-14) rund 56 weniger |
| R6 | Selbststehende Module | Mietwohnung, zügelbar, Gipskarton | Sperrholz Birke/Fichte 18, Dreischicht 19 (mit Taschenloch); Spanplatte weiss 19, MDF 19 (mit Exzenter) | Seiten und Böden ≥ 18 | Korpusmodule mit Rückwand. Ab 1400 mm Modulhöhe ein fester Boden in der Mitte (RM-9) | Pflicht: MDF weiss 3, Hartfaser 3 oder Pappel 5 | je nach Material | beide | 2–3 (DY-25) | Sperrholz Fichte 1213, Spanplatte 639 |

\*\* Standard-U 1600 × 1400 × 2400 mm mit 5 Tablaren, heutige Rechnung (BW_3.js, BW_7.js). Kaufteile sind teils geschätzt (`est` in preise.js). Für R2 mit Eckpfosten statt Zwischenpfosten habe ich nachgerechnet:

- Pfosten: heute 4 Stück = 8,47 m (CHF 37.28); künftig 2 Eckpfosten = 4,24 m (CHF 18.64).
- Dazu 20 Winkel (CHF 20, geschätzt) und etwa 60 Tablarschrauben (rund CHF 5).
- Ergebnis: Der Preis bleibt praktisch gleich (BW_7.js).

### 2b Beschläge und Grenzen

| ID | Beschläge und Befestigung | Grenzen |
|---|---|---|
| R1 | Spreizdübel 6 + Schraube 5 × 60 durch die Latte (TR-12, RM-14). Tablar von oben mit 4 × 40 in die Leiste schrauben (TR-11, DY-9) oder ausdrücklich lose auflegen. Eckleiste aus Dachlatte, flach, mit 4 × 35 | Jedes Feld der Vorderkante ≤ SPAN, gerechnet mit der Eckstütze. Sonst ist R1 nicht wählbar, und das Formular verweist auf R2 (TR-5, TR-E2). Unterstes Tablar mindestens 60 mm über dem Boden (EP-14) |
| R2 | Querlatte von hinten mit 2 × 5 × 60 an den Pfosten, vorgebohrt (DY-24, TR-17). Querlattenenden mit Winkel 40 × 40 an Endlatte oder Wand (EP-17, RM-E1, TR-2). Tablar von oben mit 4 × 40 in Wand- und Querlatte. Dübelschraube 5 × 60 | Tablartiefe (Wandlatte bis Querlatte) ≤ SPAN (TR-E1). Unterstes Tablar mindestens 60 mm über dem Boden (RM-10) |
| R3 | Konsolen an das Tablar mit 4 × 16 bei 18/19 mm, 4 × 12 bei 15 mm, 4 × 20 bei 21–24 mm, 4 × 25 bei 27 mm (TR-3, EG-1). Schiene mit Dübel 6 + 4,5 × 50 | Tiefe 264–484 mm (TR-16(4); bei L/U deckt das auch EP-9 ab). Jedes Schienenstück mindestens 500 mm; 2-m-Grenze ist bekannt (WEITERARBEIT:104, TR-13) |
| R4 | Winkel 150 × 200, 200 × 250 oder 250 × 300; Schrauben wie R3 | Tiefe ≤ 375 mm (TR-16(3)). Unterstes Tablar ≥ Wandschenkel + 10 mm, also 210 / 260 / 310 mm. Lichte Höhe zwischen den Tablaren ≥ Wandschenkel: beim 300er-Schenkel und 2400 mm Raumhöhe höchstens 6 Tablare (7 ergäben 289 mm < 300) (EG-9, EP-16, RM-10; BW_3.js) |
| R5 | Bodenträger Ø 5, Winkel 40 × 40. Wangenhöhe = oberstes Tablar + t + 50 mm (EG-14, RM-4) | Seitentiefe ≤ SPAN − 350, also Birke 450, Sperrholz Fichte 350, Dreischicht 300 mm. Sonst wird das Eckfach ein leeres Blindfach (EP-4, EP-11) |
| R6 | Taschenloch bzw. Exzenter mit Bohrschritten (MX-E3, DY-29). Lochreihen-Schritt (MX-12, DY-5). Kippsicherung beim Aufstellen jedes Moduls (RM-17). Modulstoss mit 3 × 4 × 40 (DY-23, RM-23) | Eckmodul mindestens Seitentiefe + 360 mm breit. Das geht bis zu dieser Seitentiefe: Birke 475, Sperrholz Fichte 375, Dreischicht 327, Spanplatte 177, MDF 227 mm; darüber bleibt das Eckquadrat leer (EP-5, BW_7.js). Modul höchstens Türhöhe − 50 mm, sonst teilen (RM-3). Kippmass prüfen (DY-26) |

### 2c Ecke bei L- und U-Form

| ID | Welches Regal läuft durch | Innenecke | Stoss an der Ecke | Reihenfolge | Befunde |
|---|---|---|---|---|---|
| R1 | hinten | Stütze 45 × 45 vor beiden Tablarkanten; die Seitenwandleiste läuft von der Rück- bis zur Vorderwand durch | Eckleiste aus Dachlatte 24 × 48, flach, von der Wandleiste bis zur Vorderkante, 4 × 35 | Leisten, dann das hintere Tablar, dann die Seitentablare. Eckleiste an der Werkbank vormontieren. Stütze zuletzt | EP-7, EG-11, TR-4, EP-12, EG-7, EP-10 |
| R2 | hinten | Eckpfosten im Schnittpunkt der beiden Vorderlinien; beide Querlatten werden daran geschraubt | keine Eckleiste; das Seitentablar beginnt an der Vorderkante des hinteren Tablars | Pfosten stellen. Dann von unten nach oben, Ebene für Ebene: Wand- und Endlatten, Querlatte, Tablar – hinten zuerst | EG-2, EP-2, TR-2, RM-7, EG-12, DY-32, EG-3, EG-18 |
| R3 | hinten | trägt über die erste Konsole 50 mm neben dem Stoss | Eckleiste aus Dachlatte, hält die Tablare nur bündig. Seitentablare um Schienentiefe + 2 mm kürzer | wie R1 | EG gut, EP gut, EG-8, TR-6, EP-9 |
| R4 | hinten | trägt über den ersten Winkel 60 mm neben dem Stoss | Eckleiste aus Dachlatte | wie R1 | EG gut, EG-9 |
| R5 | hinten | Seitenwange steht direkt vor dem hinteren Regal (bereits gelöst) | feste Wange bei Seitentiefe + 350 + t, sonst Blindfach | Tablare im Eckfach einsetzen, bevor die Seitenwange steht | TR gut, EP-4, EG-5 |
| R6 | hinten | eigenes Eckmodul oder leeres Eckquadrat | T-Stoss mit 3 × 4 × 40, vorgebohrt | Einlegeböden im Eckmodul einlegen, bevor das Seitenmodul steht | EP-5, RM-8, EG-16, DY-23 |

**Rahmenregeln für alle Reduit-Bauweisen:**

- **Tiefen:** Tablare mindestens 15 mm stark (TR-16(2)). Seitentiefe höchstens hintere Tiefe + 100 mm, mit Hinweis. Das ersetzt die Umkehr der Durchlaufrichtung aus EP-8 und ist eine Vereinfachung.
- **Tür nach innen:**
  - Tiefe hinten höchstens Raumtiefe − Türbreite − 50 mm (RM-2, EG-6).
  - Das Seitenregal auf der Bandseite nur kürzen, wenn es tiefer ist als das Wandstück − 110 mm (EG-10).
  - Reststücke unter 400 mm weglassen (EG-10, RM-E2).
- **Tür als Eingabe:** Türhöhe (RM-3) und Türlage (RM-5) aufnehmen.
- **Fächer:** lichte Fachhöhe mindestens 200 mm (RM-16).
- **Schrauben:** Tablarschrauben nach Tablarstärke (TR-3), Dübelschrauben nach Anbauteil (TR-12, MX-E2, DY-10).

**Frei innerhalb jeder Bauweise:** Form und Ecke, Tiefen im Bereich der Bauweise, Zahl der Tablare, Abstände (ab dem Minimum der Bauweise), Nische, Material und Stärke aus der Liste der Bauweise, bei R6 die Rückwand.

---

## 3 Was von den heutigen Optionen wegfällt

«Vereinfachung» heisst: baubar und kein Mangel, aber für eine kleine Zahl von Bauweisen bewusst weggelassen.

### Sideboard

| Heutige Option | Künftig | Grund |
|---|---|---|
| Korpus 12 mm (Birke, Birke Standard, Seekiefer, Sperrholz Fichte, OSB) | fällt weg | SK-6, MX-1, MX-2, DY-2: 2 mm Rest unter den Bohrungen, Exzenter bohrt durch |
| Korpus 15 mm (Seekiefer, Sperrholz Fichte, OSB) | fällt weg | Vereinfachung. Baubar (MX-1: Minifix ab 15 mm zugelassen; SK-6), bräuchte aber eigene Werte für Dübel, Taschenloch und Exzenter. Damit fällt Seekiefer beim Sideboard ganz weg, es gibt sie nur in 12 und 15 mm (preise.js:14); im Reduit bleibt sie |
| Korpus 21–27 mm (Birke 21, Fichte 21/27, Sperrholz Fichte 21/24, Eiche 27, Dreischicht 27, MDF 22) | fällt weg | Drehtür-Überschlag bei 21 mm am Anschlag, ab 22 mm nicht erreichbar (SF-1, SK-E1); Exzenter über 22 mm (MX-1). Offene Möbel wären baubar: Vereinfachung |
| Korpus MDF 16, Spanplatte 16 | fällt weg | Vereinfachung: SPAN 450/400 (reduit.js:126–144); 19 mm deckt das ab. Als Front bleiben sie |
| OSB als Korpus und als Front | fällt weg | Matrix «grenzwertig», Topfbohrung franst aus (MX-14, SF-10(6)). Der Zufall lässt OSB schon heute weg (konfig.js:58) |
| Verschraubt × Spanplatte oder OSB | fällt weg | MX-6, SK-10 |
| Verschraubt × Leimholz | fällt weg | SK-E2 (Schrauben ins Hirnholz) |
| Verschraubt × MDF (Konfirmat) | fällt weg, MDF geht zu S2 | Bohrbild falsch (MX-E1, DY-19); Vereinfachung |
| Verschraubt × Sperrholz | S5 | mit SK-8 und SK-14, Deckel zwischen den Seiten |
| Taschenloch × Eiche | fällt weg (S4 mit Dübel) | MX-7, SK-11 |
| Dübel oder Exzenter × Sperrholz; Exzenter × MDF oder Leimholz | fällt weg | Vereinfachung, laut Matrix «sinnvoll». Je Werkstoff bleibt eine Verbindung. Eine 6. Bauweise «Sperrholz zerlegbar» wäre möglich |
| Exzenter × 12, 15 oder ab 22 mm | fällt weg | SK-2, MX-1, DY-2 |
| Dübel 6 × 30 | fällt weg (kein Korpus unter 18 mm) | – |
| Rückwand «keine» | fällt weg | SK-9, MX-5 |
| Bad × Spanplatte weiss | fällt weg | SK-7, MX-10 |
| Bad × Fichte, Dreischicht, Sperrholz Fichte | fällt weg | Hinweis in sideboard.js:241, MX-E5; Vereinfachung |
| Farbe auf Spanplatte weiss, OSB, Eiche | fällt weg | SF-9, MX-14, Matrix |
| Farbe auf Sperrholz oder Fichte | nur mit Isoliergrund | SF-9 |
| Fronten 12 und 15 mm | fällt weg | SF-3, SF-10: nur mit Dünntürscharnier und höchstens 450 mm breit |
| Leimholzfront über 900 mm Höhe | Front aus Dreischicht 19 | MX-9, SF-E3 |
| «Maserung einhalten» abschalten bei Leimholz | gesperrt | SK-4 |
| Fach breiter als SPAN mit Einlegeboden | mehr Fächer, automatisch | SK-3, MX-4 |
| «1 Tür» bei einem Fach über 600 mm; Schiebetürzahl frei | automatisch bzw. an die Fächer gekoppelt | SF-11, SF-7 |

### Reduit

| Heutige Option | Künftig | Grund |
|---|---|---|
| Tablare 12 mm (alle Materialien) | fällt weg | TR-16(2), Matrix |
| Leisten aus 40er-Plattenstreifen | Dachlatte 24 × 48 | TR-10, MX-8, DY-15. Standard-U mit Birke: CHF 96.60 statt 32.58 |
| Leisten mit Feld über SPAN | nicht wählbar, Verweis auf R2 | TR-5, TR-E2 (betrifft schon die Standardkonfiguration). Die Stosspfosten-Spannweite ist bekannt (WEITERARBEIT «Noch offen») |
| Pfostenrahmen mit Pfosten im Tablar | Pfosten vor dem Tablar, Tablar 48 mm weniger tief | EP-1, TR-1, RM-1, DY-1, EG-4, EG-18 |
| Pfostenrahmen ohne Eckpfosten, aber mit Eckleiste | Eckpfosten, keine Eckleiste | EG-2, EP-2, TR-2, RM-7, EG-12, DY-32 |
| Pfostenabstand nach der Tablarspannweite | höchstens 1200 mm, bestimmt durch die Querlatte | TR-E1 (OSB 12 heute 7 statt 4 Pfosten) |
| Schienen oder Winkel auf Gipskarton | fällt weg, bis es ein Ständerraster gibt | TR-7, RM-13. HARMLOS lässt «^Gipskarton» heute pauschal durch (konfig.js:37, TR-16) |
| Schienen bei Tiefe unter 264 oder über 484 mm | fällt weg | TR-16(4), EP-9 |
| Winkel bei Tiefe über 375 mm | fällt weg | TR-16(3) |
| Winkel mit unterstem Tablar unter Schenkel + 10 mm | Mindestabstand wird automatisch angehoben | EG-9, EP-16, RM-10 |
| Wangen unter 18 mm, aus OSB, Spanplatte, MDF oder ganzen Brettern | fällt weg | MX-2; Matrix (OSB); EP-4, EP-11 (Eckfach, Spanplatte nur bis 150 mm Seitentiefe); EG-5 |
| Wangen auf Raumhöhe − 10 mm | oberstes Tablar + t + 50 mm | EG-14, RM-4, DY-31 |
| Selbststehend unter 18 mm, aus OSB, Seekiefer oder ganzen Brettern | fällt weg | MX-2, Matrix, EG-13, EG-5 |
| Selbststehend ohne Rückwand | fällt weg | MX-5, RM-9 |
| Selbststehend mit Verschraubt oder Dübel; Exzenter bei Sperrholz | nur Taschenloch bzw. Exzenter je Material | MX-6 (Spanplatte); sonst Vereinfachung |
| MDF roh bei R1, R3, R4 und R5 | fällt weg, bleibt bei R2 und R6 | Matrix «grenzwertig»: SPAN 450–650 mm, also etwa doppelt so viele Stützen |
| Birke Standard mit Maserung | nur mit «Maserung frei» | MX-13 (Maserlänge 1250 mm). Die Birke-Premium-Maserung über 1500 mm ist bekannt (WEITERARBEIT:103) |

### Heutiger Zufall gegen die neuen Regeln geprüft

- **Sideboard:** 281 von 400 Würfen lägen ausserhalb (BW_4.js):
  - Material oder Stärke: 151
  - Verbindung: 118. Das ist eine Folge der Bindung einer Verbindung je Bauweise, kein Mangel.
  - Fach breiter als SPAN: 52 (gleiche Zahl wie in MX).
- **Reduit:** aufgeschlüsselt nach der gewürfelten Bauart (BW_5.js):

| Bauart | Würfe | Davon ausserhalb | Gründe |
|---|---|---|---|
| Tablarwinkel | 32 | 30 | unterstes Tablar zu tief |
| Wangen | 90 | 52 | OSB 42, Seekiefer 10 |
| Wandschienen | 61 | 12 | Tiefe hinten 500 mm, also über 484 |
| Selbststehend | 140 | 124 | Verbindung 99 (Bindung), OSB 43, Seekiefer 24, Schaltafel 3 |
| Pfostenrahmen | 77 | 0 | – |
| Leisten | 0 | – | wird im Standardraum nie gewürfelt (wie in MX) |

---

## 4 Reihenfolge der Entscheidungen im Formular

Heute (WEITERARBEIT): Zufall · Masse/Raum · Bauart · Form · Tablare · Nische · Aufbau · Front · Material · Verbindung · Platten & Preise · Niveau.

**Sideboard, neu:**

1. **Rahmen:** Masse und Einsatzort. Wohnraum/Bad zieht aus der Gruppe Material (index.html:781–785) nach oben.
2. **Bauweise:** 5 Karten mit Name, Farbmuster, Niveau, Preisniveau und einem Satz zu den Grenzen. Unpassende Karten sind ausgegraut, mit Grund im `title` (z. B. «Bad: Spanplatte quillt – SK-7»).
3. **Aufbau:**
   - Fächer: Das Minimum aus der Spannweite ist vorbelegt, kleinere Werte sind gesperrt.
   - Einlegeböden.
   - Deckel: bei S5 fest.
   - Untergestell: im Bad Pflicht.
4. **Front:** Art, Türen pro Fach, Griff, jeweils mit den Rahmenregeln aus Abschnitt 1b.
5. **Optik:** Material innerhalb der Bauweise, Frontmaterial, Farbe (nur wo zugelassen), Rückwand.
6. **Platten & Preise**

**Reduit, neu:**

1. **Raum:** Breite, Tiefe, Höhe, Tür (Breite, neu Höhe, nach innen, Bandseite), Wandart.
2. **Bauweise:** 6 Karten, gesperrt mit Grund. Zum Beispiel sind bei Gipskarton R3 und R4 gesperrt, und R1 ist gesperrt, wenn ein Feld länger ist als die Spannweite.
3. **Form:** I, L oder U, Eckseite. Die Eckregeln von R5 und R6 stehen als Hinweis.
4. **Tablare:**
   - Tiefen im Bereich der Bauweise; die Schieberegler bekommen min/max aus `grenzen(d)`.
   - Anzahl der Tablare.
   - Bodenabstand ab dem Minimum der Bauweise.
5. **Nische**
6. **Optik:** Material und Stärke aus der Liste, bei R6 die Rückwand.
7. **Platten & Preise**

**Was entfällt:**

- Die Gruppen «Verbindung» (index.html:805) und «Niveau» (index.html:836). Beides steht künftig auf der Karte der Bauweise.
- Die Stärke-Knöpfe beim Sideboard-Korpus. Jede Bauweise lässt je Material nur eine Stärke zu; die Knöpfe werden ausgeblendet wie heute bei ganzen Brettern (index.html:998).
- In `OPEN` (index.html:1727) ersetzt «Bauweise» die Einträge «Bauart» und «Niveau».

**Begründung der Reihenfolge:**

- Der Rahmen ist physisch vorgegeben. Wandart und Einsatzort sperren Bauweisen (TR-7, SK-7).
- Form und Tablare hängen von den Bereichen der Bauweise ab (TR-16(3)/(4), EP-4).
- Die Optik ändert die Konstruktion nicht mehr und kommt deshalb zuletzt.

---

## 5 Zufall

- **Ablauf:** `zufall` würfelt zuerst die Bauweise aus denen, die der Rahmen zulässt. Danach würfelt es nur freie Felder, und zwar nur aus den Listen der Bauweise. Das ersetzt:
  - `SB_MATS` und `RD_MATS` (konfig.js:58–59)
  - den Stärkenfilter (konfig.js:94)
  - die Wahl der Verbindung (konfig.js:109, :143)
  - die Wahl der Bauart (konfig.js:142)
- **Gewichte (Vorschlag ohne Beleg):**
  - Sideboard: S1 35 %, S2 20 %, S3 15 %, S4 20 %, S5 10 %.
  - Reduit: R2 30 %, R6 20 %, R5 15 %, R3 15 %, R4 10 %, R1 10 %, jeweils nur, wenn die Bauweise zulässig ist.
- **Prüfung:** `pruefeBauweise(d)` muss leer sein, und es darf keine harte Warnung bleiben. Die Warnungsschleife bleibt nur als letzte Kontrolle.
- **HARMLOS enger fassen:** «eingeplant» lässt heute die Rückwandwarnung durch (MX-5), und «^Gipskarton» nimmt pauschal alles aus (TR-16).
- **Schlösser:**
  - `SPERREN`: Aus «bauart» und «verbindung» wird die Gruppe «bauweise» (Feld `bw`), aus «material» wird «optik» (`mat`, `t`, `back`, `color`, `frontMat`, `frontT`).
  - Alte Schlossnamen in `sideboard-werkbank-v2-schloss` werden beim Laden umgeschrieben.
  - Ist eine Optik gesperrt, die zu keiner Bauweise passt (z. B. OSB beim Sideboard), meldet der Zufall das mit Grund, statt 60 Versuche zu verbrauchen.

---

## 6 Sammlung und Entwürfe

- **Zuordnung:** `bauweiseVon(d)` prüft zuerst den Einsatzort, dann das Material, dann die Verbindung, und liefert `{ bw, abweichungen }`. Material ohne Bauweise geht zum nächsten Material derselben Klasse, z. B. Seekiefer zu Sperrholz Fichte.
- **Probe mit den 10 Snapshot-Konfigurationen** (BW_9.js):
  - 1 passt: Birke 18, Taschenloch, S1.
  - Beispiele für die übrigen 9:
    - Eiche 26 mit Dübel und ohne Rückwand wird S4: Stärke 18, Rückwand Pappel.
    - MDF 22 verschraubt wird S2: Stärke 19, Dübel, Rückwand MDF weiss.
  - Eine Korrektur für die Umsetzung: Birke 15 im Bad landet mit der reinen Materialregel bei S5, richtig wäre S1 im Bad. Die Reihenfolge Einsatzort → Material ist also nötig.
  - Die Fixture enthält Stärken, die der Katalog nicht mehr führt (Birke 15, Eiche 20/26). `anBauweise` muss deshalb auf die nächste zugelassene Stärke gehen.
- **Anzeige in der Sammlung:** ein Etikett «S4 Massivholz» oder «Ältere Variante – passt nicht zur Bauweise S4: Stärke 26 mm, keine Rückwand».
- **Laden:** Ein Hinweis bietet zwei Wege an:
  - «An Bauweise anpassen»: setzt `anBauweise`, zeigt die Liste der Änderungen und die neuen Kosten.
  - «Unverändert ansehen»: rechnet wie gespeichert und zeigt die Abweichungen als harte Warnung mit Befund-ID.
- **Speichern:** «Sammeln» und «Überschreiben» speichern erst die angepasste Fassung. Bis dahin bleiben `data` und `info.kosten` unverändert, die Kosten also wie beim Speichern.
- **`geaendert`** (konfig.js:190–191) vergleicht nach `mitBauweise(d)`. So gilt ein geladener alter Eintrag nicht nur deshalb als «geändert», weil `bw` fehlt. `STANDARD` braucht dafür einen abgeleiteten Wert statt einer Konstante.
- **Entwürfe:** `entwuerfeLaden` (konfig.js:155) migriert auf dieselbe Weise und zeigt denselben Hinweis.

---

## 7 Umsetzung

**Datenstruktur** in shared.js:

```js
const BAUWEISEN = {
  sideboard: [
    { id:'S1', name:'Sperrholz geölt', niveau:[1, 2],
      mats:{ birke:[18], birkesi:[18], fichtesp:[18], dreischicht:[19] },
      front:{ mats:['korpus', 'mdf'], t:[16, 18, 19], farbe:'isoliergrund' },
      joint:'pocket', backs:['hdf3', 'hf3', 'ply6'], finish:'oil',
      bad:{ mats:['birke', 'birkesi'] } },
    // S2 … S5
  ],
  reduit: [
    { id:'R2', name:'Pfostenrahmen', build:'built', sys:'posts', niveau:[1],
      mats:{ klasse:'tablar', minT:15, plus:['mdf', 'dekorspan'], bretter:true },
      walls:['solid', 'drywall'], grenzen:{ postMax:1200, tablarTiefe:'span', gapBottomMin:60 },
      ecke:'eckpfosten', pfosten:'vorne' },
    // R1, R3 … R6
  ]
};
```

**Funktionen in shared.js:**

- `SPAN` und `maxSpan` aus reduit.js:126–144 hierher verschieben (SK-3, MX-4).
- `bauweise(kind, id)`
- `pruefeBauweise(d)`: liefert `[{ feld, ist, soll, grund:'SK-6' }]`.
- `anBauweise(d, id)`: liefert `{ d, aenderungen }`.
- `bauweiseVon(d)`
- `grenzen(d)`: Minimum und Maximum für Fächer, Tiefen, Bodenabstand und Tablarzahl.

**Anpassungen in den anderen Dateien:**

- **konfig.js:** `cfgFromData` liest `bw`; dazu `zufall`, `SPERREN`, `HARMLOS`, `STANDARD`/`geaendert` und `entwuerfeLaden` wie oben.
- **sideboard.js und reduit.js:**
  - Am Anfang die Verstösse aus `pruefeBauweise` als harte Warnung ausgeben.
  - Felder der Bauweise steuern künftig die Konstruktion: Schraubenlängen, Scharniertyp, Querschnitt der Leisten (`addStrip`, reduit.js:282), Lage der Pfosten (reduit.js:443ff.), Wangenhöhe (reduit.js:419).
  - Die Konstruktionskorrekturen verändern die Rechnung. Den Snapshot deshalb nach dem bekannten Verfahren neu schreiben (WEITERARBEIT, Commit `b424766`), getrennt von der Bauweisen-Schicht.
- **index.html:**
  - Gruppe «Bauweise» mit Karten aus `BAUWEISEN`; unzulässige Karten `disabled`, mit Grund im `title`.
  - `fillMaterials(kind, bw)` (index.html:948), `fillThickness` (:998), `fillFrontMats`, Farbe und Fächer in `syncVisibility` (:1026) nach der Bauweise filtern.
  - `#grain` bei Leimholz sperren (:1040).
  - `#grp-joint` und die Gruppe «Niveau» entfernen.

**Tests:**

1. Jede Bauweise × jedes zugelassene Material × Frontart × Einsatzort im Standardmass ergibt keine harte Warnung. Beim Reduit zusätzlich × Form I/L/U × Wandart.
2. Kollisionstest: Holzteile und Metallteile in `R.boxes`/`R.extras` überschneiden sich nicht, für jede Bauweise × Form (EP-1, EP-11(6)). Das deckt auch EG-8, EG-12, EP-12 und die neue Eck-Geometrie von R2 ab.
3. Jede Querlatte hat mindestens 2 Auflager (TR-9).
4. Zu jedem Material × Stärke jeder Bauweise gibt es einen SPAN-Wert (analog reduit.test.js:181).
5. Zufall mit 400 Würfen je Typ: `pruefeBauweise` leer, keine harte Warnung, mindestens 4 verschiedene Bauweisen gewürfelt.
6. Das Standardformular beider Typen ergibt keine Warnung (TR-E2). Neuer Reduit-Standard: R2 mit Sperrholz Fichte 18.
7. Migration: Die 10 Fixture-Konfigurationen ergeben die erwartete Bauweise und die erwarteten Abweichungen. `anBauweise` ist idempotent und erfüllt `pruefeBauweise`. `geaendert(alt, mitBauweise(alt))` ist `false`.
8. Snapshot bleibt grün, solange nur die Bauweisen-Schicht dazukommt.

**Voraussetzungen, bevor eine Bauweise angeboten wird:**

| Bauweise | Zu behebende Befunde |
|---|---|
| S1 | SK-1/SF-2/DY-28, SF-4, SF-5, SF-E2 |
| S2 | SK-12/DY-30, SK-13, DY-18 |
| S3 | SF-E1/DY-16, DY-17 |
| S4 | SK-4, MX-9/SF-E3, SK-12 |
| S5 | SK-8, SK-14 |
| R1 | TR-10, TR-5, EP-7, TR-4/EP-12, TR-11/DY-9, TR-12 |
| R2 | EP-1/TR-1, EG-2/TR-2, EG-12, EP-17/RM-E1, TR-E1, EG-18/EG-3, DY-24 |
| R3 | EG-1/TR-3, EG-8/TR-6, TR-13, TR-4 |
| R4 | EG-9/EP-16, EG-1, TR-4 |
| R5 | EG-14, EP-4/EG-5, TR-8 |
| R6 | MX-5, MX-12/DY-5, MX-E3/DY-29, EP-5/RM-8, RM-17, RM-9, RM-3, DY-23 |

**Vorgehen in Schritten:**

1. SPAN nach shared.js verschieben, Sideboard auf `maxSpan` umstellen.
2. `BAUWEISEN` und `pruefeBauweise` mit Tests, noch ohne Oberfläche.
3. Die Korrekturen je Bauweise, nach Schwere. Zuerst R2, weil dort kritische Befunde liegen.
4. Formular.
5. Zufall und Migration der Sammlung.

---

## gut

- Das Material hat schon Merkmale (`ply`, `grain`, `coated`, `boards` in MAT_INFO, shared.js:13ff.). Daraus lassen sich die Materialklassen der Bauweisen ohne neue Daten bilden.
- Die Karten für Bauart und Verbindung mit Niveau (index.html:590–594, :808–811) lassen sich direkt als Bauweise-Karten weiterverwenden.
- Das Schloss (`SPERREN`) und `withCatalog` lassen sich übernehmen.
- Der Zufall nimmt schon heute OSB, 12 mm und «keine Rückwand» aus (konfig.js:58, :94, :113). Damit nimmt er einen Teil der Eingrenzung vorweg.
- `FRONT_MAX` und `frontMaterial` (sideboard.js:6–17) passen zur Bindung der Frontstärke.
- Die Rechnung hat kein DOM und läuft in Node. Die Bauweisen-Schicht lässt sich deshalb vollständig testen, und der Snapshot schützt die Rechnung.
- Alle 11 Sideboard-Varianten in Abschnitt 1a laufen schon mit der heutigen Rechnung ohne harte Warnung durch (BW_2.js, BW_6.js). Der Pfostenrahmen tut das in 77 von 77 Zufallswürfen (BW_5.js).

## offen

- Die Schienentiefe von 12 mm (TR-6) ist am Produkt nachzumessen. Die Obergrenze 484 mm bei R3 (TR-16(4)) habe ich übernommen, aber nicht nachgerechnet, ob Tablare über die 470er-Konsole hinaus stehen dürfen.
- Der Bauablauf von R2 (Ebene für Ebene von unten) und der Beginn des Seitentablars an der Vorderkante des hinteren Tablars sind aus der Geometrie in EG-18 und TR-1(a) abgeleitet, nicht simuliert. Der Kollisionstest (Test 2) muss sie bestätigen.
- Preise nach den Korrekturen sind nur für R1 (TR-10), R2 (ungefähr gleich) und R5 (rund CHF 56 weniger) abgeschätzt. Die Sideboard-Preise sind ohne Beschläge.
- Die Gewichte im Zufall sind ein Vorschlag ohne Beleg.
- 15-mm-Korpus, 21–27-mm-Korpus bei offenen Möbeln, Sperrholz mit Dübel oder Exzenter sowie Leimholzplatten im Reduit sind bewusst weggelassen, ohne Befund dagegen. Jede davon lässt sich später als eigene Bauweise ergänzen.
- Die Lochreihe in OSB ist nicht belegt (Matrix); ohne Beleg ist OSB bei den Wangen ausgeschlossen.
- Das Materialfilter wurde früher verworfen (WEITERARBEIT «Ideen»). Der Vorschlag nimmt es in veränderter Form wieder auf: Der Filter folgt jetzt aus der Konstruktion, nicht aus der Optik. Das müsstest du bewusst neu entscheiden.

Skripte: skripte/BW_1.js bis BW_9.js und BW_lib.js (Prototyp für `BAUWEISEN` und `passt`).