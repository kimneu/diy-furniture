# Feste Formate (ganze Bretter) im Reduit – Design

Datum: 2026-09-25 · Branch: `feste-formate` (baut auf `jumbo-preise` / PR #2 auf)

## Ziel

Das Reduit soll auch mit **ganzen Brettern in festen Formaten** rechnen, also mit Produkten, die Jumbo in mehreren Grössen zu einem Stückpreis verkauft. Sie sind für Tablare deutlich günstiger als der Zuschnitt (go/on Leimholz Fichte ≈ CHF 26/m² statt 59.95). Der Konfigurator wählt Formate und Stückzahlen selbst, und zwar die günstigste Kombination. Er zeigt, welches Teil aus welchem Brett kommt, und gibt eine Einkaufsliste mit Stückpreisen aus.

**Erfolgskriterien**

- Reduit mit 400 mm tiefen Tablaren aus go/on: Der Konfigurator schlägt 2000 × 400 bzw. 1200 × 400 vor und nennt Stückzahl und Stückpreis.
- Tablare und Wangen passen in der Breite immer auf ein Brett, weil die Tiefe auf die Brettbreite einrastet.
- Tablare, die länger sind als das längste Brett, werden über einer Stütze gestossen, statt zu scheitern.
- Teile, die auf kein Brett passen, erscheinen als Warnung mit den verfügbaren Breiten bzw. Längen.
- Das Sideboard und die Plattenmaterialien rechnen unverändert (der Snapshot bleibt gleich).

## Entscheide

| Frage | Entscheid |
|---|---|
| Wie werden Bretter zerlegt? | **Nur ablängen.** Die Teilbreite entspricht der Brettbreite, Längsschnitte gibt es keine. |
| Wo gibt es Brett-Materialien? | **Nur im Reduit.** Das Sideboard bleibt beim Zuschnitt (Türen und Fronten haben beliebige Breiten). |
| Regaltiefe bei Brett-Material | **Rastet auf die nächste Brettbreite ein**, mit Hinweis. |
| Rechenansatz | **Eigener 1D-Packer pro Brettbreite** (nicht der 2D-Packer, der Längsschnitte planen würde; kein reiner m²-Richtpreis, weil dann Stückzahlen und Breiten falsch wären). |

## Nicht im Umfang

- Bretter beim Sideboard, auch nicht gemischt (Korpus aus Brettern, Fronten im Zuschnitt).
- Längsschnitte, auch nicht pro Produkt. Mögliche Erweiterung: `laengs:true` pro Eintrag in `bretter`, dann darf der Packer Streifen aus breiteren Brettern schneiden.
- Mood Eiche, Mood Fichte A in 27/28 mm, OSB mini, Vielzweckplatte.
- Verschnittoptimierung über Breiten hinweg (ein 400er-Brett für zwei 200er-Teile).

## Produkte der ersten Version

Stand 25.09.2026, Stückpreise in CHF. «Best Price» steht auf der Produktseite, nicht in der Suchliste.

| Schlüssel | Produkt | Stärke | Formate (L × B = Preis) | CHF/m² |
|---|---|---|---|---|
| `gon_fichte` | go/on Leimholzplatte Fichte | 18 | 1200 × 200 = 5.60 · 2000 × 200 = 10.20 · 1200 × 400 = 12.50 · 2000 × 400 = 20.50 | 23–26 |
| `gon_3s` | go/on 3-Schicht Fichte C+/C | 19 | 1200 × 600 = 29.95 · 2500 × 600 = 59.90 | 40–42 |
| `mood_fichte` | Mood Leimholzplatte Fichte A | 18 | 800 × 300 = 11.50 · 800 × 400 = 15.50 · 800 × 600 = 21.50 · 1200 × 200 = 10.95 · 1200 × 300 = 15.95 · 1200 × 400 = 21.95 · 1200 × 500 = 27.95 · 1200 × 600 = 32.95 · 2000 × 200 = 18.50 · 2000 × 300 = 27.95 · 2000 × 400 = 36.50 · 2000 × 500 = 43.95 · 2000 × 600 = 54.95 · 2500 × 300 = 33.95 · 2500 × 400 = 44.95 · 2500 × 600 = 68.95 | 44–48 |
| `regalbau` | Regalbauplatte weiss FSC | 16 | 1150 × 200 = 8.25 · 250 = 9.50 · 300 = 10.50 · 400 = 14.95 · 500 = 17.50 · 600 = 20.50 | 30–36 |
| `moebel_weiss` | Oecoplan Möbelplatte weiss | offen¹ ² | 2600 × 250 = 22.95 · 300 = 25.95 · 400 = 31.95 · 500 = 37.50 · 600 = 47.50 | 29–35 |
| `schaltafel` | Schalungstafel 3-S | 27 | 2000 × 500 = 29.50 | 29.50 |

¹ Die Stärke steht nicht im Produktnamen. Sie wird beim ersten Skriptlauf von der Produktseite gelesen und vor der Umsetzung eingetragen. Solange sie fehlt, kommt das Produkt nicht in `preise.js`.

² Jumbo führt die Möbelplatte unter «Wohn-Accessoires › Holzfotowand». Ist sie dünner als 16 mm, fällt sie weg.

Die Schaltafel wechselt von `platten` zu `bretter`. Sie gibt es ohnehin nur als ganze Tafel.

## Daten: `preise.js` → `bretter`

Neue Gruppe neben `platten`, `rueckwaende` und `kaufteile`, ein Eintrag pro Produkt und Zeile (wie bisher):

```
"gon_fichte": { "t": 18, "formate": [ { "L": 1200, "B": 200, "price": 5.6 }, … ], "stand": "2026-09-25", "quelle": "Go/on Leimholzplatte Fichte, Best Price" }
```

- `L` = Länge in Faserrichtung, `B` = Brettbreite, beides in mm.
- Optional `est:true` für nicht nachgeprüfte Preise. Die Einkaufsliste zeigt dann «Preis geschätzt».
- `tools/preise-datei.cjs` braucht keine Änderung, weil ein Eintrag pro Zeile auch für die Formatliste gilt. Der Kopfkommentar bekommt eine Zeile zu `bretter`.

## Materialien: `shared.js`

- `MAT_INFO` bekommt die Brett-Materialien mit `boards:true` sowie Name, Kurzname, Farbe, `ply`, `grain`, `coated` und Hinweis wie die übrigen.
- Beim Zusammensetzen von `MATS` gilt für Brett-Materialien:
  - `t = [bretter[k].t]` und `tDef = t[0]`,
  - `boards = formate` (sortiert nach B, dann L),
  - `widths` = die verschiedenen Brettbreiten (aufsteigend),
  - `price` = der günstigste m²-Preis der Formate (nur für die Sortierung und die Anzeige «ab CHF …/m²»).
  - Fehlt der Eintrag in `bretter`, fällt das Material weg (wie bei den Platten).
- `SPAN` in `reduit.js` bekommt Werte für die neuen Materialien. Leimholz Fichte 18 gilt wie `fichte` 18. 3-Schicht 19 gilt wie `dreischicht` 19. Regalbauplatte und Möbelplatte (Span, beschichtet) gelten wie `dekorspan` in der passenden Stärke. Der bestehende Test «jede Material-Stärke hat einen Spannweiten-Wert» deckt das ab.

## Formular: `index.html`

- **Materialauswahl:** Brett-Materialien erscheinen nur beim Möbeltyp Reduit, mit der Beschriftung «… · ganze Bretter ab CHF x/m²».
- **Wechsel zum Sideboard** mit gewähltem Brett-Material: Es gilt das günstigste Plattenmaterial, mit dem Hinweis «Ganze Bretter gibt es nur beim Reduit – Material auf … gesetzt.».
- Bei Brett-Material werden die **Felder Plattenformat und Preis Holz ausgeblendet**. An ihrer Stelle steht die Formatliste mit Stückpreisen (nur Anzeige). Der Schnittverlust (`kerf`) bleibt.
- `restore()`: Bei Brett-Material gibt es keine Format- und Preisfelder zu überdecken. Ist das gespeicherte Material im Katalog nicht mehr vorhanden, gilt Birke (wie heute).

## Rechnung: `reduit.js`

**Tiefe einrasten** (`normReduit`): Bei Brett-Material wird jede Tiefe (`dBack`, `dLeft`, `dRight`) auf die nächste Brettbreite ≥ Tiefe gesetzt. Gibt es keine, gilt die breiteste. Danach laufen die Begrenzungen wie heute (Raumbreite, Durchgang ≥ 600 mm). Kürzt eine Begrenzung eine Tiefe, wird sie auf die grösste Brettbreite **abgerundet**, die innerhalb der Begrenzung liegt, damit die Tiefe weiterhin eine Brettbreite ist. Hinweis: «Tiefe hinten auf 400 mm gesetzt (Brettbreite go/on Leimholz Fichte).» Die Wände werden zusammengefasst wie bei den übrigen Warnungen.

**Brettbreite pro Teil:** Ein Teil der Breite b bekommt die kleinste Brettbreite B mit b ≤ B ≤ b + 15 mm. Damit passen Tablare (Tiefe − 3), Wangen (Tiefe) und Seiten selbststehend (Tiefe − 10) auf dasselbe Brett. In der Materialliste steht die Brettbreite als Teilbreite, weil das Teil das ganze Brett nutzt.

**Leisten:** Bei Brett-Material werden Eckleisten und Endleisten (heute 40 mm breit aus dem Plattenmaterial) zu Dachlatten 24 × 48 (`BUY.latte`, Art `solid`), wie bei der Bauart «Pfostenrahmen».

**Stösse bei langen Tablaren:** Heute ist ein Tablar pro Wand und Höhe ein einziges Stück, nur beim System «Wangen» eines pro Feld. Ist es länger als das längste Brett seiner Breite (`Lmax`), wird es gestossen:

1. Die Anzahl Stücke ist k = ⌈Länge / Lmax⌉, also so wenige wie möglich.
2. Ideale Stossstellen liegen bei gleichmässiger Teilung. Jeder Stoss kommt **45 mm neben die nächstgelegene vorhandene Stütze**, bei der beide angrenzenden Stücke ≤ `Lmax` bleiben. Direkt über der Stütze hätte keines der beiden Stücke Auflage (Konsolen sind 12 mm breit), und die Stossleiste würde mit der Stütze kollidieren. So liegt das eine Stück auf der Stütze, und das andere hängt über die Stossleiste daran:
   - Schienen: die Schienenpositionen.
   - Tablarwinkel: die Winkelpositionen des Tablars (wie heute pro Tablar verteilt).
   - Pfostenrahmen: die Pfosten.
   - Wangen: kein Stoss nötig, die Felder sind kürzer als die Spannweite.
3. Findet sich keine passende Stütze, liegt der Stoss an der idealen Stelle, und 45 mm daneben kommt eine zusätzliche Stütze dazu (Schiene, Winkel oder Pfosten). Bei «Leisten» gibt es vorne keine Stütze. Dort kommt an jeden Stoss eine Stütze vorne (`addPost`, Kantholz 45 × 45) mit Winkeln, wie heute am freien Ende.
4. Unter jeden Stoss kommt eine **Stossleiste** (Dachlatte 24 × 48, Tablartiefe − 80 mm, damit sie nicht an Wandleisten und Pfosten stösst), an beide Stücke geschraubt, wie die Eckleiste.
5. Die Stücke heissen in der Materialliste weiter «Tablar» mit der Notiz «gestossen über Schiene/Winkel/Pfosten». Der Bauablauf bekommt einen Schritt «Stösse verbinden».

Die Spannweitenwarnungen rechnen weiter mit dem Stützenabstand, nicht mit der Stücklänge.

**Packer** `packBoards(items, boards, kerf)` in `shared.js` (rein, ohne DOM):

1. Teile nach der zugeordneten Brettbreite gruppieren. Teile ohne Brettbreite kommen in `unplaced`.
2. Pro Breite die Teile nach Länge absteigend sortieren. Die maximale Länge `Lmax` ist das längste Format dieser Breite. Teile mit L > `Lmax` kommen in `unplaced`.
3. First-Fit Decreasing auf Bretter der Länge `Lmax`: Ein Teil passt, wenn Summe(L) + (n − 1) · kerf ≤ Brettlänge.
4. Für jedes gefüllte Brett das **günstigste Format dieser Breite** wählen, dessen Länge die belegte Länge fasst.
5. Rückgabe wie `pack()`: `{ sheets, unplaced, used, partArea, total }`. Jedes Brett in `sheets` trägt zusätzlich `{ L, B, price }` seines Formats. Die Teile liegen mit `x` (Position entlang der Länge), `y = 0`, `w = L`, `h = B`, `rot = false` darin, sodass die Plattenansicht sie zeichnen kann.

**Gruppen und Kosten:** Beim Brett-Material bekommt die Hauptgruppe `boards:true`, `price` = null und die Bretter aus `packBoards`.

- `sheetCosts`: Für Brett-Gruppen gilt cut = whole = Summe der Stückpreise.
- Die Summary zeigt bei Brett-Material nur **«Holz ganze Bretter ca.»**.
- Die Plattenansicht zeigt pro Brett «2000 × 400 mm · CHF 20.50» und Teile in einer Reihe. Die Kopfzeile nennt Stückzahl pro Format und die Summe.
- Die Einkaufsliste (Beschläge & Kaufteile) bekommt pro Format eine Zeile: «3 × go/on Leimholz Fichte 2000 × 400 × 18 mm» mit Stückpreis. Bei `est` steht «Preis geschätzt» dabei.

## Fehlerfälle

| Fall | Verhalten |
|---|---|
| Teil breiter als jedes Brett bzw. keine Breite innerhalb von 15 mm | `unplaced`, Warnung: «Teil A (Wange, 1800 × 600 mm) passt auf kein Brett – Breiten: 200, 400 mm.» |
| Teil länger als das längste Brett (z. B. Wange 2000 aus Regalbauplatte 1150) | `unplaced`, Warnung mit maximaler Länge und Vorschlag «anderes Brett-Material oder Plattenmaterial wählen». |
| Preis-Update entfernt ein Format | Der Packer nimmt die verbleibenden Formate. Fehlt das ganze Produkt, fällt das Material weg. |
| Brett-Material gespeichert, Möbeltyp Sideboard | Günstigstes Plattenmaterial mit Hinweis (siehe Formular). |
| Bauart «Wangen» mit zu kurzen Brettern (Regalbauplatte 1150, go/on 2000 bei 2400 Raumhöhe) | Wangen werden nicht gestossen, also `unplaced` mit Warnung. So ist es gewollt, die Warnung nennt die nötige Länge und schlägt ein Material mit längeren Brettern vor (Mood 2500, Möbelplatte 2600). Dasselbe gilt für die Seiten bei selbststehend. |
| Tablar länger als `Lmax` | Wird gestossen (siehe «Stösse bei langen Tablaren»), keine Warnung. |

## Skript: `tools/jumbo-preise.mjs`

- **Die Suche liest den «Best Price».** Die Suchliste zeigt ihn nicht an. Die Produktseite hat ihn im Text («BEST PRICE» + Zahl) und im JSON-LD (`"price"`). Die Suche zeigt künftig für Treffer ohne Preis «Preis: Produktseite», und `--preise` bei Brett-Quellen liest die Produktseite.
- **Neue Quellenart für ganze Bretter** in `jumbo-quellen.json`: pro Format eine URL, Schlüssel `"<material> <L>x<B>"`, zum Beispiel `"gon_fichte 2000x400"`. Die Seite liefert Stückpreis, Masse und Stärke (aus dem Namen).
- `--schreiben` führt `bretter[k].formate[].price` bekannter Formate nach und setzt `stand`. Neue oder weggefallene Formate meldet es nur.
- Einmalig: die Stärke der Möbelplatte weiss lesen.

## Tests

In `node --test`. Die Packer-Tests arbeiten mit festen Formaten im Test, nicht mit `preise.js`.

- `packBoards`: Das günstigste Format wird gewählt, und ein halb volles 2000er-Brett wird zum 1200er.
- `packBoards`: Der Sägeschnitt wird eingerechnet (2 × 1000 passt nicht auf 2000 bei kerf 4).
- `packBoards`: Zu breite und zu lange Teile landen in `unplaced`.
- Brettbreite pro Teil: 397 → 400, 390 → 400, 384 → keine (bei Breiten 200/400).
- `normReduit`: Die Tiefe rastet ein und gibt den Hinweis aus, auch zusammen mit der Durchgangsbegrenzung.
- Brett-Material: Leisten werden zu Latten, keine 40er-Teile aus dem Hauptmaterial.
- Stösse: 2400 mm Wand mit go/on (Lmax 2000) ergibt 2 Stücke, der Stoss liegt auf einer Schiene, jedes Stück ≤ 2000, und es gibt 1 Stossleiste pro Höhe. Mit Regalbauplatte (1150) ergibt es 3 Stücke.
- Stösse bei «Leisten»: Pfosten an jeder Stossstelle. Bei «Tablarwinkel»: jedes Stück ist ≤ Lmax, und neben jedem Stoss sitzt ein Winkel.
- Plattenmaterial (kein Brett): keine Stösse, Teile wie bisher (der bestehende Kombinationstest und der Snapshot bleiben gleich).
- Alle Formen × Bauarten × Brett-Materialien liefern gültige Teile und endliche Kosten (Erweiterung des bestehenden Kombinationstests).
- `preise.test.js`: Die `bretter`-Einträge haben `t`, mindestens ein Format, alle Preise > 0 sowie `stand` und `quelle`. Jedes Brett-Material in `MAT_INFO` hat einen Eintrag.
- Der Sideboard-Snapshot bleibt unverändert.
- Browser (von Hand oder headless): Materialauswahl nur beim Reduit, Felder ausgeblendet, Plattenansicht und Summary für Bretter, Wechsel zum Sideboard.
