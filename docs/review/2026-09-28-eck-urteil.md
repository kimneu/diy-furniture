# Eck-Urteil: U-Form und L-Form

**Kurz gesagt:** Nicht bei allen Bauweisen. Die Geometrie der Ecke stimmt überall. Das hintere Tablar endet bei «Tiefe hinten», dort beginnt das Seitentablar, kein Tablar überschneidet sich mit einem anderen, und links und rechts sind sauber gespiegelt. Die Konstruktion der Ecke ist aber nur bei Wandschienen und Tablarwinkeln im Kern richtig:

- **Pfostenrahmen:** falsch, so nicht baubar.
- **Leisten:** Der Innenecke fehlt ein eigenes Auflager.
- **Wangen und selbststehend:** Es entsteht eine Blindecke, die niemand prüft.

Keiner dieser Mängel löst heute eine Meldung aus. Pfostenrahmen, Wangen, Schienen und selbststehend melden in L und U nur Texte mit «eingeplant» oder gar nichts. «Zufall» nimmt solche Varianten deshalb an (konfig.js:37, :77).

Bezugsraum: Standard-U 1600 × 1400 × 2400, Tür 800 nach aussen, Tiefe hinten 400, Seiten 300, Birke 18, 5 Tablare mit Unterkante (UK) 150 / 638 / 1125 / 1613 / 2100. Die Masse gelten für die linke Innenecke, rechts gespiegelt. Die L-Form entspricht einer Ecke des U. Masse ab Rückwand = **R**, ab Seitenwand = **S**. Skripte liegen in `skripte/`: `EU_corner.js`, `EU_corner2.js`, `EU_cheek.js`, `EU_grain2.js` und `EU_plate.js` (Plattenmodell aus EP_7.js, Kurzzeit, 35 kg/m, E 8500).

## 1. Urteil je Bauweise und Form

| Bauweise | L | U | Kernbegründung (Beleg) |
|---|---|---|---|
| Leisten | korrekt mit Mängeln | korrekt mit Mängeln | Das Seitentablar liegt am Eckende nur auf der Eckleiste 40 × 18 auf, 20 mm je Tablar. Die Eckleiste hängt an der freien Vorderkante des hinteren Tablars (reduit.js:243–244, :352). Plattenmodell: Innenecke 9,0 mm, Mitte der hinteren Vorderkante 16,0 mm; ohne Eckleiste 23,3 mm (EU_plate.js). Die Eckleiste ist 297 mm lang und steckt 15 × 20 × 18 mm in der seitlichen Wandleiste: 5 Überschneidungen in L, 10 in U (EU_corner.js). 4 × 35 durch 18 + 18 mm lässt 1 mm Holz, bei 12–16 mm Platte kommt die Spitze durch (EG-7). Unterschied L/U: Auch mit Eckpfosten bleiben in L 1252 mm freie Vorderkante bis zur Wand, in U 910 mm. |
| Wandschienen | korrekt mit Mängeln | korrekt mit Mängeln | Die Ecke trägt richtig: erste Seitenkonsole 50 mm hinter dem Stoss (Z. 361), Innenecke 58 mm vom nächsten Auflager. Die Masskette stimmt aber nicht: Die Schiene liegt bei v 0–12 (Z. 379), das Tablar beginnt bei v 3 (Z. 239). An die Schienen geschoben steht das hintere Tablar 9 mm weiter vorne (bei ganzen Brettern 12 mm), Vorderkante z −291 statt −300. Das Seitentablar 997 passt dann nicht mehr. 30 bzw. 45 Überschneidungen Schiene × Tablar (EU_corner2.js). Bei dHinten ≤ 210 kreuzen sich die Konsolen in der Ecke; die Meldung «kürzeste Konsole steht vor» kommt zwar, nennt die Kollision aber nicht. |
| Tablarwinkel | korrekt mit Mängeln | korrekt mit Mängeln | Die Ecke stimmt: erster Seitenwinkel 60 mm hinter dem Stoss (Z. 400), nichts kreuzt. Drei Mängel treffen auch die Ecke. Erstens die untersten Winkel: gezeichnet y −50 bzw. −10, real mindestens 100 mm im Boden (EG-9, EP-16). Zweitens kommt 4 × 35 durch Blech und 18 mm 13–15 mm oben heraus (EG-1). Drittens die Eckleiste wie bei Leisten. |
| Wangen | korrekt mit Mängeln | korrekt mit Mängeln (2 Blindecken) | Das Auflager ist sauber, die Eckwange (R 400–418) trägt die Seitentablare. Sie verdeckt aber das erste hintere Fach: bei Birke 18 und Seite 300 sind 278 von 768 mm verdeckt, die Öffnung misst 490 mm. **Falsch** wird es bei MDF 19 (Öffnung 227 mm bei Seite 300, 127 mm bei Seite 400) und bei ganzen Brettern mit Seite 400 (127 mm). Dort ist das Fach bezahlt, aber praktisch nicht nutzbar (EU_corner2.js). Der Bauablauf nennt keine Reihenfolge (Z. 701). |
| Pfostenrahmen | **falsch** | **falsch** | Die Pfosten stehen in den Tablaren (v Tiefe −69 … −24, Z. 479–480): 15 bzw. 20 Durchdringungen Kantholz × Tablar, je ein geschlossenes Loch 45 × 45 mit 24-mm-Steg davor. An der Ecke steht kein Pfosten (Z. 445–451). Die seitliche Querlatte kragt deshalb 478 mm aus, die hintere 508 mm. Bei Raumtiefe 1100 bekommt die Seite gar keinen Pfosten (EU_corner2.js). Die Eckleiste liegt in drei Latten (15 bzw. 30 Überschneidungen). Die Querlatten-Enden stossen stumpf an Hirnholz und sind nicht verbunden; der Rahmen hängt an keiner Wand (EP-17). Nach dem Bauablauf (Z. 702, dann 704) lässt sich kein Tablar einlegen (EG-18). |
| Selbststehend | korrekt mit Mängeln | korrekt mit Mängeln (2 Blindecken) | Sauber gelöst: 2 mm Eckfuge, jedes Modul mit eigener Rückwand und Kippsicherung. Das Seitenmodul verdeckt aber 272 von 753 mm des hinteren Eckmoduls; Öffnung 481 mm, bei MDF 19 nur 216, bei ganzen Brettern 400 nur 117. Die Verbindung im T-Stoss ist nicht beschrieben (Z. 692). Mit ganzen Brettern überlappen die Module 8–11 mm (EG-13). |

Schwere: Pfostenrahmen kritisch. Leisten, Schienen und Winkel hoch (Schrauben, Masskette). Wangen und selbststehend mittel, bei einer Öffnung unter 350 mm hoch.

## 2. Grundsatz «hinten durchlaufend, seitlich stumpf davor»

**Als Standard richtig, aber genauer gefasst:** Das tiefere Regal läuft durch, das flachere stösst stumpf davor. Bei gleicher Tiefe läuft das hintere durch.

Warum das richtig ist:
- **Eine Regel für beide Ecken:** Im U verbindet das hintere Regal beide Ecken. Die Masskette bleibt einfach, weil die Seite bei dHinten beginnt (reduit.js:82).
- **Drei Wandauflager:** Das durchlaufende Tablar liegt an der Rückwand und an beiden Stirnwänden auf.
- **Kleine Blindecke:** Die Länge der Stossfuge und die verdeckte Länge bei Wangen und Modulen entsprechen der Tiefe des *stossenden* Regals. Bei Seite 200 / 300 / 400 / 450 / 500 sind 178 / 278 / 378 / 428 / 478 mm verdeckt (EU_corner2.js). Stösst das flachere, bleibt beides klein.
- **Stumpf statt Gehrung:** Wände sind selten rechtwinklig, eine Gehrung verlangt einen exakten Winkel. Für DIY ist der stumpfe Stoss richtig.

Statisch zählt die Richtung wenig. Plattenmodell, Leisten, Innenecke (EU_plate.js):

| hinten / Seite | hinten durch | Seiten durch |
|---|---|---|
| 400 / 300 (Standard) | 9,0 mm | 9,2 mm |
| 400 / 400 | 12,4 mm | 9,2 mm |
| 200 / 600 (B 2000) | 18,3 mm | 4,2 mm |
| 600 / 200 | 5,2 mm | 10,3 mm |
| 400 / 300 mit Eckpfosten | 0 mm (Mitte Vorderkante hinten 1,5 mm, seitlich 1,9 mm) | – |

Das eigentliche Problem ist das fehlende Auflager der Innenecke, nicht die Durchlaufrichtung. Mit Eckpfosten spielt die Richtung statisch keine Rolle mehr.

Wann die Regel nicht passt:

| Fall | Folge heute | Regel |
|---|---|---|
| max(dLinks, dRechts) ≥ dHinten + 100 | lange Stossfuge, grosse Blindecke; Leisten bei 200/600: 18,3 mm | Seiten laufen durch (EP-8); die Schwelle +100 ist ein Ermessenswert |
| Wangen oder selbststehend mit Öffnung des Eckfachs < 350 mm | Fach bezahlt, aber nicht nutzbar | tote Ecke statt Blindfach (Abschnitt 3) |
| Wandschienen mit Tiefe < 260 mm | Konsole steht vor; bei ≤ 210 kreuzen sich die Konsolen | Schienen in L/U sperren, Tablarwinkel anbieten |
| Leisten und Pfostenrahmen | Innenecke hängt frei | Eckpfosten immer |
| Längstes Teil länger als das Material | Standard-U: hinteres Tablar 1594 × 397 passt mit Maserung nicht auf die Birkenplatte (Meldung schon im Standard, EU_grain2.js; bekannt aus WEITERARBEIT, «Bekannte Eigenheiten») | Maserung freigeben; als Option bei Raumtiefe < Raumbreite die Seiten durchlaufen lassen (1394 mm) |

## 3. Empfohlene Eckdetails

### Für alle eingebauten Bauweisen

- **Eckfuge 2 mm** (RM-15): Das Seitentablar beginnt bei R 402. Länge = Raumtiefe − dHinten − 5 = 995 mm.
- **Leisten und Latten aus Dachlatte 24 × 48** statt aus 40er-Plattenstreifen (TR-10): 21 statt 15 mm Auflage, im Standard-U CHF 32.58 statt 96.60.
- **Dübel an Latten 24 mm:** Spreizdübel 6 mm mit Schraube 4,5 × 60 (TR-12).
- **Schraubenlängen nach Stärke** (EG-1, EG-7, EP-3, TR-3):

| Tablar t | Eckleiste Dachlatte flach (24 + t − 4, abgerundet) | Holz über der Spitze | durch 2 mm Blech (Konsole, Winkel) | Holz über der Spitze |
|---|---|---|---|---|
| 12 | 3,5 × 30 | 6 mm | 3,5 × 10 | 4 mm |
| 15 / 16 | 4 × 35 | 4 / 5 mm | 4 × 12 | 5 / 6 mm |
| 18 / 19 | 4 × 35 | 7 / 8 mm | 4 × 16 | 4 / 5 mm |
| 21 / 22 | 4 × 40 | 5 / 6 mm | 4 × 20 | 3 / 4 mm |
| 24 | 4 × 40 | 8 mm | 4 × 20 | 6 mm |
| 27 | 4 × 45 | 6 mm | 4 × 25 | 4 mm |

### Leisten

| Teil | Querschnitt | Länge | Lage |
|---|---|---|---|
| Wandleiste hinten | Dachlatte 24 × 48 hochkant | 1594 | Rückwand, Oberkante = UK Tablar |
| Seitenwandleiste, eine durchgehende statt Endleiste hinten + Wandleiste seitlich (EP-7) | 24 × 48 hochkant | 1373 | Seitenwand, R 24–1397 |
| Endleiste Vorderwand | 24 × 48 hochkant | 256 | Vorderwand, S 24–280 |
| Tablar hinten / seitlich | t | 1594 × 397 / 995 × 297 | R 3–400 / R 402–1397 |
| Eckleiste (nur Verbinder) | Dachlatte 24 × 48 flach | 230 | unter dem Stoss, R 377–425, S 24–254 |
| **Eckpfosten** | Kantholz 45 × 45 | 2118 (bis OK oberstes Tablar) | S 300–345, R 400–445, vor beiden Tablarkanten, ohne Ausklinkung |

Verbindungen:
- **Eckleiste:** je Tablar 2 Schrauben nach Tabelle, 12 mm vom Stoss, vorbohren mit Ø 2,5 mm (bei Leimholz Pflicht, dort ist es Hirnholz).
- **Eckpfosten:** je Ebene 2 Winkel 40 × 40. Einer kommt unter das hintere Tablar an die Rückseite des Pfostens, einer unter das Seitentablar an seine Seite, bei R 425–445, damit er die Eckleiste nicht trifft. Ins Tablar Schrauben nach Tabelle (4 × 16 bei 18 mm), ins Kantholz 4 × 30. Den Fuss auf einen Kunststoffgleiter stellen, nicht in den Boden dübeln.
- **Freie Vorderkante:** U hinten 910, seitlich 950; L hinten 1252 mm. Bei L oder bei SPAN unter 900 in der Feldmitte eine Stütze gleicher Art setzen, sonst den Pfostenrahmen nehmen.

Montage:
1. Leisten anschrauben.
2. Eckleiste an der Werkbank unter das Stirnende des Seitentablars schrauben, sie steht 24 mm vor.
3. Hinteres Tablar auflegen.
4. Seitentablar auflegen, die Leiste greift unter das hintere Tablar. 2 Schrauben von unten; am untersten Tablar von oben mit 4 × 40 versenkt durch das hintere Tablar (EP-10).
5. Eckpfosten stellen, lotrecht ausrichten, Winkel anschrauben.

### Wandschienen

- **Schienen:** Tiefe 12 mm ist die Annahme des Codes. Hinten bei S 50 / 800 / 1550, seitlich bei R 450 / 900 / 1350 (unverändert).
- **Tablare:** hinten 1594 × 386 (R 14–400), seitlich 995 × 286 (S 14–300). Die Vorderkanten bleiben bei dHinten bzw. dSeite, dann schliesst die Masskette.
- **Konsolen:** hinten 350, seitlich 250, unverändert (≤ Tablartiefe − 10).
- **Konsole an Tablar:** 2 × 4 × 16 je Konsole.
- **Eckleiste:** wie bei Leisten, nur als Verbinder.
- **Regel:** Wandschienen in L/U erst ab 260 mm Tiefe, hinten und seitlich.

### Tablarwinkel

- **Tiefe:** hinten höchstens 375 mm (Winkel 250 nach der 2/3-Regel). Bei 400 mm hinten sind die Winkel knapp; die Meldung kommt (Z. 395), empfohlen sind hinten 350 mm oder Schienen. Seitlich 300 → Winkel 200.
- **Lage:** hinten 60 mm von der Seitenwand (S 63), seitlich 60 mm hinter dem Stoss (R 462).
- **Unterstes Tablar:** UK ≥ Wandschenkel + 10 mm, also 310 bei 250 × 300 und 260 bei 200 × 250. Sonst das unterste Tablar auf Leisten legen.
- **Schrauben:** 4 × 16 ins Tablar, 2 Dübel je Winkel. Eckleiste wie bei Schienen.

### Wangen

- **Wangenhöhe:** 2168 mm (oberstes Tablar + t + 50) statt 2390 (EG-14, RM-4).
- **Öffnung prüfen:** Öffnung = linke Kante der zweiten hinteren Wange − dSeite. Im Standard: 791 − 300 = 491.
- **Fall A, Öffnung ≥ 350 mm** (Standard Birke 18, Seite 300): Die Positionen bleiben (hintere Wangen S 3 / 791 / 1579). Reihenfolge:
  1. Hintere Wangen stellen.
  2. Bodenträger und 5 Tablare 768 × 397 ins Eckfach einsetzen.
  3. Erst dann die Eckwange stellen (R 400–418, S 0–300).
  4. 3 Schrauben 4 × 40 durch die Eckwange in die Vorderkante der hinteren Endwange (S 12, auf 300 / 1200 / 2000 mm), vorbohren mit Ø 2,5 mm.
- **Fall B, Öffnung < 350 mm** (MDF 19, ganze Bretter mit Seite 400, Birke ab Seite 450) – Eckwangen-Paar:
  - Eine hintere Eckwange steht bei S (dSeite − t) … dSeite und R 0–400; die Eckwange steht davor.
  - 3 × 4 × 40 durch die Eckwange in deren Vorderkante (bei MDF 19: S 290,5).
  - Das Eckquadrat bleibt leer: keine Endwange an der Seitenwand, keine Tablare, keine Bodenträger.
  - MDF 19 im Standard-U: hintere Wangen bei S 281 / 791 / 1300, Fächer 491 / 490 mm (unter 550), 3 statt 4 hintere Wangen (EU_cheek.js).

### Pfostenrahmen: Pfosten vor die Querlatte

Hier weiche ich von EG-2 ab, das den Eckpfosten ins Seitentablar setzt. Vor der Querlatte braucht es keine Ausklinkung, und ein Pfosten trägt beide Querlatten.

| Teil | Mass | Lage |
|---|---|---|
| Wandlatte hinten | 24 × 48 hochkant, 1594 | Rückwand, Oberkante = UK Tablar |
| Endlatte an der Seitenwand | 24 × 48, 352 | R 24–376 |
| Querlatte hinten | 24 × 48, 1594 | R 376–400 |
| Wandlatte seitlich | 24 × 48, 995 | R 402–1397 |
| Querlatte seitlich | 24 × 48, 997 | S 276–300, R 400–1397 |
| Endlatte Vorderwand | 24 × 48, 252 | S 24–276 |
| Tablare | 1594 × 397 / 995 × 297 | rechteckig, keine Ausklinkung |
| **Eckpfosten** | 45 × 45 × 2118 | S 300–345, R 400–445, vor beiden Querlatten |
| Zwischenpfosten | nur bei Feld > 1200 mm (TR-E1) | U: keiner (Felder 910 / 950); L: 1 in der Mitte hinten (Feld 1252) |

Das ergibt 2 statt 4 Pfosten im U und 2 statt 3 in L. Der Durchgang im U wird an den Eckpfosten 910 statt 1000 mm. Unter 600 mm stattdessen die Pfosten bündig mit der Front setzen und die Tablare 48 mm weniger tief machen (TR-1 a).

Verbindungen:
- **Querlatte hinten an den Eckpfosten:** 2 × 5 × 60 von vorne durch den Pfosten, 12 und 36 mm unter UK Tablar, vorbohren mit Ø 3 mm.
- **Querlatte seitlich an den Eckpfosten:** 1 × 5 × 60 von der Gangseite, 24 mm unter UK. Die Höhe ist versetzt, damit sich die Schrauben im Pfosten nicht treffen. Dazu 1 Winkel 40 × 40 von der seitlichen an die hintere Querlatte, unter dem Seitentablar.
- **Querlatten-Enden an den Wänden:** je 1 Winkel 40 × 40 an die Endlatte.
- **Tablare:** je Latte 2 × 4 × 40 Senkkopf von oben, vorbohren. So wird das Tablar zur Scheibe und bindet den Rahmen an die Wand (TR-2).
- **Pfostenfuss:** Kunststoffgleiter.

Montage:
1. Wand- und Endlatten anschrauben.
2. Querlatten mit den Winkeln anschlagen.
3. Tablare auf ihrer Höhe von vorne einschieben, hinten zuerst.
4. Pfosten stellen, lotrecht ausrichten, verschrauben.
5. Tablare verschrauben, erst dann belasten.

Das Kammproblem im U (EG-3) und EG-18 fallen damit weg.

### Selbststehend

- **Fall A, Öffnung ≥ 350 mm** (Standard: 481 mm): Die Module bleiben (hinten 2 × 789, Seiten ab R 402). Reihenfolge:
  1. Hinteres Eckmodul stellen und sofort oben sichern (RM-17).
  2. Einlegeböden einlegen.
  3. Erst dann das Seitenmodul stellen.
  4. T-Stoss: 3 Schrauben 4 × 40 von innen durch die Stirnseite des Seitenmoduls in die Vorderkante der hinteren Modulseite (S 19), oben, Mitte und unten, vorbohren mit Ø 2,5 mm.
- **Fall B, Öffnung < 350 mm:** Die hintere Reihe beginnt bei S dSeite + 2 (302). Das Eckquadrat 300 × 400 bleibt leer. Im Standard-U wären es dann hinten 2 Module à 497 mm (moduleSplit 996 mm).
- **Ganze Bretter:** Modultiefe = reale Brettbreite, die Front bleibt bei dHinten (EG-13).

## 4. Codeänderungen, priorisiert

| Prio | Ort | Änderung | behebt |
|---|---|---|---|
| 1 | `addPost` reduit.js:248–252 | Pfosten standardmässig vor die Kante: v = seg.depth … seg.depth + 45. Aufrufe anpassen in `SUPPORTS.posts` (Z. 479–480), `freeEndPosts` (Z. 263) und bei den Stosspfosten (Z. 338) | EP-1, TR-1, RM-1, EG-4 |
| 1 | `SUPPORTS.posts` Z. 447–451 | Seitensegment: `if (seg.ends[0] === 'corner') posts.push(seg.u0)`. Das hintere Segment bekommt aus `layoutReduit` die Eckpunkte (dLeft, W − dRight − 45) als Stützpunkte in `pts`, ohne den Pfosten ein zweites Mal zu setzen | EG-2, EP-2, TR-2, RM-7, TR-9 |
| 1 | `SUPPORTS.posts` Z. 457, 477, 481 | `POST_MAX = 1200` statt `ctx.max`. `addCornerBatten` streichen. `screw70` → neuer Eintrag 5 × 60. Neu `angle40` je Querlatten-Ende (Wand und Ecke) × Ebene, neu 4 × 40 für die Tablare (2 je Latte) | TR-E1, EG-12, EP-17, RM-E1 |
| 1 | `buildReduitSteps` Z. 702/704 | Reihenfolge wie in Abschnitt 3 und eigener Text für Pfostenrahmen | EG-3, EG-18 |
| 1 | `layoutReduit` Z. 96–99 | Bei Pfostenrahmen den Durchgang minus 90 mm prüfen | Folge von Prio 1 |
| 2 | `SUPPORTS.battens` Z. 352–356 | Bei `ends[0] === 'corner'` Eckpfosten vor der Kante plus 2 × `angle40` je Ebene. `spanWarn` mit den freien Feldern zwischen Wand, Eckpfosten und Stützen rechnen; das löst den bekannten Punkt «Spannweitenwarnung bei Leisten mit Stosspfosten» (WEITERARBEIT) gleich mit | EP-7, EG-11, TR-5 |
| 2 | `addCornerBatten` Z. 242–246, `addStrip` Z. 281–285 | Eckleiste immer Dachlatte 24 × 48 flach: Box u ±24, y p.y − 24 … p.y, v 24 … depth − 46, L = depth − 70. Box bei Brettern ebenfalls 48 × 24 | EG-7, EP-12, EP-13, TR-4 |
| 2 | neu `screwFor(dicke, t)`, `BUY_INFO` Z. 148–169 | Kaufteile je Länge. Aufrufe in Z. 245, 386, 412; Text in Z. 704 je Bauweise | EG-1, EP-3, EP-15, TR-3, RM-6 |
| 3 | `addShelf` Z. 236–240, `rails` Z. 365 | Parameter `v0`. Bei Schienen v0 = RAIL_T + 2 (RAIL_T = 12 neben RAIL_LENS Z. 174), Tablartiefe depth − v0, Konsole ≤ depth − v0 − 10 | EG-8, TR-6, RM-22 |
| 3 | `normReduit` | Schienen in L/U nur ab 260 mm Tiefe, sonst Meldung ohne «eingeplant» mit Rat «Tablarwinkel» | EP-9 |
| 3 | `SUPPORTS.cheeks` Z. 417–441, `cheekPositions` Z. 209–226 | Hinteres Segment bei L/U: Öffnung = pos[1] − dSeite. Unter 350 mm das Segment ab dSeite − t anlegen (Eckwangen-Paar, keine Endwange an der Seitenwand), sonst Schritt «Eckfach zuerst». 3 × 4 × 40 je Ecke. Z. 419: h = oberstes Tablar + t + 50 | EG-5, EP-4, RM-8, EG-14 |
| 3 | `freeModules` Z. 490–492, Schritt Z. 692 | Öffnung des Eckmoduls prüfen; unter 350 mm u0 = dSeite + 2. T-Stoss-Schrauben als Kaufteil; Reihenfolge im Text. Bei Brettern dep = Brettbreite | EP-5, RM-8, EG-16, EG-13 |
| 4 | `shelfPieces` Z. 202 | `if (ends[0] === 'corner') a += 2` (Eckfuge) | RM-15 |
| 4 | `buildReduitSteps` Z. 705 | «Eckstösse verbinden» nur bei Leisten, Schienen und Winkeln, vor «Tablare auflegen» als Vormontage | EP-10 |
| 4 | `layoutReduit` Z. 77–88 | Durchlaufrichtung: ist max(dL, dR) ≥ dB + 100, laufen die Seiten durch (hinten `['corner','corner']`). Dann müssen Z. 352, 387, 408, 477, 490 und 491 auch `ends[1]` behandeln | EP-8 |
| 4 | konfig.js:37, :121–142 | Eckmeldungen ohne «eingeplant» formulieren, damit HARMLOS sie nicht schluckt. `wuerfelReduit`: Schienen nur ab Tiefe 260 | EP-11, RM-18 |

## 5. Tests für test/reduit.test.js

| Test | Prüft | heute |
|---|---|---|
| Keine Überschneidung von Holzteilen: L (Ecke links und rechts) und U × 5 Bauweisen + selbststehend × {birke 18, mdf 19, gon_fichte 18, regalbau 16, schaltafel 27}, Helfer `overlaps` Z. 335 | alle Paare in `R.boxes` | fällt durch bei Leisten, Pfosten und selbststehend (EU_corner.js) |
| Metall überschneidet weder Holz noch anderes Metall | `extras` vom Typ 'metal' gegen `boxes` und untereinander, auch dHinten 200 | fällt durch bei Schienen (Tablar) und bei Konsolen mit dHinten ≤ 210 |
| Keine Box unter dem Boden | y0 ≥ 0 für alle Boxen und Extras | fällt durch bei Tablarwinkeln (−50 / −10) |
| Innenecke hat ein Auflager | auf jeder Ebene liegt ein tragendes Teil (Kantholz, Konsole, Winkel, Wange) höchstens 120 mm von (x = −W/2 + dL, z = −D/2 + dB) | fällt durch bei Leisten (283 mm) und Pfosten (211 / 478 mm) |
| Pfostenrahmen: Eckpfosten | genau 1 (L) bzw. 2 (U) Pfosten an den Innenecken, keine Eckleiste, jede Querlatte mit mindestens 2 Auflagern, auch bei rd 1100 | fällt durch |
| Masskette in der Ecke | Vorderkante hinteres Tablar inkl. Schiene + 2 mm = Beginn Seitentablar; Seitentablar + Fuge + 3 mm = rd − dB | fällt durch bei Schienen (9 mm) |
| Schrauben brechen nicht durch | für jede Stärke in MATS lassen Eckleisten- und Konsolenschrauben mindestens 3 mm Holz über der Spitze | fällt durch |
| Blindecke | Wangen und selbststehend in L/U: Öffnung ≥ 350 mm oder keine Tablare im Eckfach (Birke, MDF, Bretter × Seite 200–500) | fällt durch bei MDF und Brettern |
| Module mit Brettern | Seitenmodul überschneidet das hintere Modul nicht, gerechnet mit realer Brettbreite | fällt durch (EG-13) |
| Bauablauf | Pfostenrahmen: «Tablare» vor «Pfosten»; Wangen und Module in L/U: Eckfach vor Eckwange bzw. Seitenmodul; «Eckstösse» nicht bei Pfosten, Wangen, selbststehend | fällt durch |
| Spiegelung (Regression) | L links und L rechts ergeben deckungsgleich gespiegelte Seitenteile | besteht (EG_mirror.js) |
| Zufall | 200 Würfe L/U ergeben keine Variante, die an einem der Tests oben scheitert | heute nicht prüfbar |

## gut

- Masskette und Spiegelung sind sauber: Seiten beginnen genau bei dHinten, kein Tablar überschneidet sich mit einem anderen, 168 Paare sind deckungsgleich gespiegelt (EG).
- Schienen und Winkel tragen die Ecke richtig: erste Konsole bzw. erster Winkel 50 / 60 mm hinter dem Stoss (reduit.js:361, :400).
- Bei Wangen trägt die Eckwange die Seitentablare sauber auf Bodenträgern (Z. 210).
- Selbststehend: 2 mm Fuge, eigene Rückwand und eigene Kippsicherung je Modul.
- Die Idee der Eckleiste stimmt: Bei Leisten senkt sie die Durchbiegung der Innenecke von 23,3 auf 9,0 mm.
- Der Code setzt die Spec (Z. 91) treu um. Der Fehler beim Pfostenrahmen steckt schon im Plan: «Pfosten … (nicht am Eck-Ende)» (plans/2026-09-25-reduit.md:130).

## offen

- **Schienentiefe:** 12 mm ist eine Annahme (reduit.js:379), am Produkt messen.
- **Blechkonsole 250 × 300:** Welcher Schenkel an die Wand kommt, steht nicht fest; die Mindest-UK von 260 bzw. 310 mm hängt daran.
- **Schrauben der Winkelverbinder:** Das Mass der mitgelieferten Schrauben im Kaufteil «Winkelverbinder 40 × 40 inkl. Schrauben» ist nicht bekannt.
- **Plattenmodell:** nur Kurzzeit, 35 kg/m, ohne Kriechen. Die Last auf den Eckpfosten habe ich nicht einzeln ausgewertet; Knicken ist nach TR unkritisch (3,5 kN Knicklast gegen 0,78 kN).
- **Schwelle für die Durchlaufrichtung:** +100 mm ist Ermessen.
- **Nebenbefund ausserhalb der Ecke:** Das Birkenformat 1500 × 3000 wird in `computeReduit` (Z. 589) auf 1500 × 2100 begrenzt, die Plattengruppe im Standard zeigt 1500 × 2100 (EU_grain2.js). Ob das als maximaler Zuschnitt gewollt ist, habe ich nicht geprüft.
- **EG-3:** Die Aussage «ebenenweise gehen 150 und 1125» ist nicht nachvollzogen.
- **WEITERARBEIT.md** führt keinen Punkt zur Ecke. Bekannt und hier nur eingeordnet sind die Spannweitenwarnung bei Leisten mit Stosspfosten und die Maserungsgrenze der Birke.