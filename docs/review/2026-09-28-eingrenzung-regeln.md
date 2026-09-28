# Eingrenzung über Regeln (bottom-up)

## Kurzfassung

- **Heute:** Die Grenzen sind über viele Stellen verteilt: `sideboard.js:120–173`, `normReduit`/`SUPPORTS` in `reduit.js`, und einige Regeln, die nur der Zufall kennt (`konfig.js:94, 108, 109, 112, 113`). Das Formular erlaubt jede Katalogstärke, jede Verbindung, jede Bauart und jede Rückwand (`index.html:998–1002, 808–811, 589–594, 956–959`). `zufall()` lässt nur Warnungstexte weg, und zwar über einen Regex (`konfig.js:37, 77`). Drei Klassen fallen dabei fälschlich unter «harmlos»:
  - selbststehende Module ohne Rückwand (Text enthält «eingeplant», `reduit.js:614`),
  - Wandschienen aus zwei Stücken mit 50-mm-Stummel (`reduit.js:377`),
  - Schienen und Winkel auf Gipskarton (`^Gipskarton`, `reduit.js:619`).
- **Vorschlag:** Eine deklarative Tabelle `REGELN` in `konfig.js` mit **50 Regeln**: 17 sperren, 23 korrigieren, 10 warnen. Dazu gehört eine Funktion `pruefeRegeln(d, fest)`. Sie liefert die korrigierten Formularwerte, die gesperrten Optionen mit Grund und die Meldungen, getrennt nach Art (Warnung, Korrektur, Hinweis). Formular, `computeData` und `zufall()` nutzen dieselbe Funktion. Prüfungen, die von der Geometrie abhängen, bleiben in `computeSideboard`/`computeReduit`, melden aber mit Regel-ID.
- **Wirkung, nachgerechnet mit Prototyp** (`skripte/RG_regeln.js`, `RG_wirkung.js`):
  - Sideboard-Matrix: 2016 Kombinationen, davon 1180 heute ohne harte Warnung. Davon sperrt das Regelwerk 550.
  - Reduit-Matrix: 1008 Kombinationen, davon 768 ohne harte Warnung. Davon sperrt es 300 (ohne S17).
  - Zufall: Heute würfelt er beim Sideboard 23 von 400 und beim Reduit 49 von 400 gesperrte Varianten (126 von 400, wenn man den Pfostenrahmen mitzählt).
- **Grenze des Regelwerks:** Zwei kritische Konstruktionsfehler behebt keine Regel. Die Pfosten stehen im Tablar (Pfostenrahmen, Stützen an freien Enden). Das muss man umbauen (U1, U2). Bis U1 umgesetzt ist, sperrt S17 den Pfostenrahmen.

## 1. Aufbau des Regelwerks

**Drei Wirkungen**

| Wirkung | Im Formular | In der Berechnung | Im Zufall |
|---|---|---|---|
| sperren | Option `disabled`. Der Grund steht sichtbar in einer `.hint`-Zeile der Gruppe, nicht nur im `title`, weil der auf dem Handy nicht erscheint. Bei Zahlenfeldern: `min`/`max` mit Grund | Ist der Wert trotzdem gesetzt (alter Entwurf, Sammlung), weicht die Berechnung auf den nächsten erlaubten Wert aus und meldet das als `korrektur` | Würfelt nur aus erlaubten Optionen |
| korrigieren | Der Wert wird zurück ins Formular geschrieben, dazu ein Hinweis «angepasst: …» | Wert oder abgeleiteter Beschlag wird angepasst | erlaubt |
| warnen | Warnung (rot) | Meldung `art:'warnung'` | Variante wird verworfen |

**Feste Abhängigkeitsreihenfolge.** Sie macht die Regeln eindeutig und sorgt für einen Fixpunkt. Eine Sperre trifft immer das spätere Feld:

`kind → room → wall → build → sys → shape/corner → mat → t → frontMat → frontT → front → doorsPer/slideN → handle → color → back → joint → grain → Zahlenfelder (dBack, dLeft, dRight, gapBottom, gapTop, nShelves)`

Beispiele:
- Die Drehtüren-Karte ist bei 27-mm-Korpus gesperrt (S10). Die Stärke 27 wird dagegen nicht gesperrt, weil Drehtüren gewählt sind.
- Bei Tablarwinkeln sinkt das `max` der Tiefe auf 375 mm (S14). Die Karte bleibt wählbar.

**Schloss:** Ein festgehaltenes Feld korrigiert der Zufall nie. Verletzt es eine Regel, wird aus Sperre oder Korrektur eine Warnung mit derselben Regel-ID.

**Meldungen:** `{ regel, art:'warnung'|'korrektur'|'hinweis', text }`. `HARMLOS` fällt weg. Heutige harmlose Texte (Kippschutz, «Bad:», «zusätzliche … eingeplant», «Tiefe … gesetzt») werden `hinweis`.

## 2. Regeltabelle

### 2.1 Sperren (17)

| ID | Bedingung | Gesperrt (Feld) und Grund im Formular | Heute / Code | Befunde |
|---|---|---|---|---|
| S01 | Sideboard, Korpus < 15 mm | `t` 12 aus (Birke, Birke Standard, Seekiefer, Sperrholz Fichte, OSB): «12 mm nur für Fronten, Korpus ab 15 mm.» | frei wählbar; nur der Zufall filtert (`konfig.js:94`). `fillThickness` (`index.html:998`) nach Möbeltyp | SK-6, MX-2, MX-1, DY-2 |
| S02 | Reduit, t < 15 | `t` 12 aus: «12 mm trägt als Tablar nur 450–500 mm, und die Schrauben kommen oben durch. Ab 15 mm.» | SPAN 12 mm = 450/500 (`reduit.js:127–135`) | TR-16 (2), EG-7, DY-4, MX-8 |
| S03 | Wangen, oder selbststehend mit Modulhöhe (rh − gapTop) > 1200; t < 16 | `t` 12/15 aus. Hat das Material keine Stärke ≥ 16 (Seekiefer), ist es in der Liste gesperrt: «2,1 m hohe Seiten brauchen mindestens 16 mm.» | Node: Wangen Seekiefer 15 → 0 harte Warnungen; selbststehend Seekiefer 12 (I) → 0 Warnungen (`RG_check.js`) | MX-2, TR-16, TR-8 |
| S04 | Exzenter bei t < 15 oder t > 22; Holzdübel oder Verschraubt bei t < 15 | `joint`-Karte aus: «Exzenter gibt es für 15–22 mm Platten» bzw. «Dübel und Schrauben erst ab 15 mm». Gilt auch für selbststehend | Warnung erst ab 26 mm (`sideboard.js:171`), im Reduit gar keine. Node: Birke 12, Seekiefer 15, Sperrholz Fichte 24 mit Exzenter → 0 Warnungen | SK-2, MX-1, DY-2, SK-10 |
| S05 | Verschraubt × OSB | «Verschraubt» aus: «OSB-Kanten reissen zwischen den Spänen aus. Taschenloch oder Dübel.» | Node: OSB 18 verschraubt → 0 Warnungen | SK-10, MX-Matrix |
| S06 | Verschraubt × Leimholz (`grain && !ply && !coated`: Eiche, Fichte) | «Verschraubt» aus: «Die Schrauben gingen ins Hirnholz von Boden, Deckel und Mittelwänden. Taschenloch oder Dübel.» | Node: Eiche 18 verschraubt → 0 Warnungen; Zufall 23/400 | SK-E2 |
| S07 | Sideboard mit Dreh- oder Schiebetüren | `back` «keine» aus: «Mit Türen braucht der Korpus eine Rückwand.» | heute harte Warnung `sideboard.js:169`, das Formular erlaubt es aber | SK-9 |
| S08 | selbststehend, Modulhöhe > 1200 | `back` «keine» aus: «Hohe Module ohne Rückwand schieben sich schräg.» | `reduit.js:614` gilt wegen «eingeplant» als harmlos. Node: U selbststehend ohne Rückwand → Meldung unter harmlos | MX-5, RM-9 |
| S09 | Bad | `mat`/`frontMat` Spanplatte weiss aus («quillt an Kanten und Bohrungen»). `back` MDF weiss und Hartfaser aus, ausgewichen wird auf Sperrholz Pappel (wie `konfig.js:113`) | Node: Bad mit Spanplatte weiss → nur der Pappel-Hinweis; `sideboard.js:242–243` bleiben harmlos | SK-7, MX-10, SK-21 (5) |
| S10 | Korpus ≥ 22 mm (MDF 22, Sperrholz Fichte 24, 27er) | `front` «Drehtüren» aus: «Topfscharniere erreichen bei 22 mm den Überschlag nicht (aussen 20,5 mm, Scharnier 18 + 2 mm). Korpus 16–21 mm, Schiebetüren oder offen.» | Node: MDF 22 und Eiche 27 mit Drehtüren → 0 Warnungen | SF-1, SK-E1, SF-10 |
| S11 | Frontstärke < 16 (eigene Front 12/15 oder «wie Korpus» bei 15-mm-Korpus) | `front` «Schiebetüren» aus: «Schiebetürbeschläge sind für 16–19 mm Türen.» | heute harte Warnung `sideboard.js:145` | SF-10 (5) |
| S12 | Frontmaterial Eiche oder OSB | `color`-Farbfelder aus: «Eiche bleibt natur» / «Die OSB-Struktur zeichnet durch. Für Farbe MDF wählen.» | Node: Eiche und OSB in Salbei → 0 Warnungen; nur der Zufall meidet das (`konfig.js:108`) | SF-9, MX-14 |
| S13 | Leimholz | `grain` angehakt und gesperrt, `rotate = false` in `computeSideboard`: «Massivholz nur in Faserrichtung schneiden.» | gesperrt nur bei Material ohne Maserung (`index.html:1040`) | SK-4 |
| S14 | Tablarwinkel | Tiefe hinten/links/rechts: `max` 375 statt 600: «Tablarwinkel tragen bis 375 mm (grösster Winkel 250 mm = ⅔).» | heute harte Warnung `reduit.js:393–395` | TR-16 (3) |
| S15 | Wandschienen | Tiefe `min` 260 statt 150: «Die kürzeste Konsole ist 250 mm. Für flachere Tablare Tablarwinkel.» Verhindert auch, dass sich bei dHinten ≤ 210 die Konsolen in der Ecke kreuzen | heute harte Warnung `reduit.js:365–366` | EP-9, TR-16 (4) |
| S16 | Gipskarton ohne eingegebenes Ständerraster | `sys` Wandschienen und Tablarwinkel aus: «Schienen und Winkel ziehen an den Dübeln. Nur mit Ständerraster (neues Feld Abstand/Versatz, Standard 625), sonst Leisten, Wangen oder selbststehend.» | gilt heute als harmlos (`^Gipskarton`). Schienen bei x −750/0/750 (TR-7) | TR-7, RM-13, TR-16 (7) |
| S17 | vorläufig, bis U1 | `sys` Pfostenrahmen aus: «Wird überarbeitet.» | Pfosten 45 × 45 stecken in jedem Tablar, die Tablare lassen sich nicht einlegen | EP-1, TR-1, RM-1, DY-1, EG-18 |

### 2.2 Korrigieren (23)

| ID | Bedingung | Korrektur (Meldung «angepasst») | Code | Befunde |
|---|---|---|---|---|
| K01 | immer | Plattenformat = Katalogformat; `sheetB` wie `sheetL` bis 3100. Node: U-Wangen Birke → «Wange 2390 × 400 passt nicht auf 1500 × 2100» | `sideboard.js:179`, `reduit.js:589`, `index.html:821` | SK-16, MX-11, DY-14 |
| K02 | Verbindung × Werkstoff | Verschraubt bei MDF und Spanplatte weiss (≥ 16): Konfirmat 7 × 50 mit Stufenbohrer 5/7/10, in einem Zug durch beide gespannten Teile. Holzschraube 4 mm: Durchgang Ø 4,5. Taschenloch in Eiche: Feingewinde. «für … mm Platten» aus t | `shared.js:151, 154, 160, 167`, `sideboard.js:285`; neues Feld `werkstoff` in `MAT_INFO` | MX-6, SK-10, SK-8, MX-E1, DY-19, SK-11, MX-7 |
| K03 | Bohrung × Stärke | Dübel: Fläche min(12, t − 5), Kante = Dübellänge − Fläche + 2. Lochreihe min(10, t − 4). Exzentergehäuse nach Datenblatt (15 mm: 12 tief) | `sideboard.js:282–287`, `reduit.js:701` | SK-6, SK-12, DY-30, MX-1 |
| K04 | Schraube × Bauteilstärke | Längen nach Tabelle 2.5, eigene Kaufteile statt fest 4 × 35 bzw. 4 × 16 | `reduit.js:245, 386, 412, 481`, `sideboard.js:211, 214–215`, `BUY_INFO` `reduit.js:148–169` | EG-1, EP-15, TR-3, MX-3, DY-3, RM-6, SK-5, DY-7, MX-E4, TR-12, RM-14, MX-E2, DY-10, DY-24, SK-18 |
| K05 | Reduit, Leisten | Wand-, End- und Eckleisten immer aus Dachlatte 24 × 48 (wie heute bei ganzen Brettern), Box 24 × 48. Eckleiste ab v = Leistendicke. Auflage 21 statt 15 mm; im Standard-U CHF 32.58 statt 96.60 (TR-10) | `addStrip` `reduit.js:282–285`, `addCornerBatten` :242–246 | TR-10, MX-8, DY-15, EG-7, EP-3, TR-4, DY-4, EG-11, EP-12, EP-13, RM-22 |
| K06 | Leisten, freies Feld ≥ max | Je Feld und an jeder Innenecke eine Stütze 45 × 45 vor dem Tablar; Meldung wird zum Hinweis «n Stützen vorne eingeplant». Braucht U2, bis dahin gilt W07 | `SUPPORTS.battens` :354–356 | TR-5, EP-7, EG-11, TR-16 (1), TR-E2 |
| K07 | Wandschienen | Tablar ab v = Schienendicke + 3 (heute 12 + 3), Tiefe − 15; Seitentablare entsprechend kürzer | `addShelf` :236–240, Schiene :379 | EG-8, TR-6, RM-22 |
| K08 | Wandschienen, Bedarf 2000 < need ≤ 2300 | Oberstes Tablar um need − 2000 tiefer; sonst beide Stücke ≥ 500 mm. Node: Standard-U braucht 2050 mm; mit gapTop 350 reicht eine 2-m-Schiene (`RG_default.js`). Dübel nach genutzter Länge | :372–378 | TR-13, DY-8 (bekannt: `WEITERARBEIT.md:104`) |
| K09 | eingebaut, Boden- und Tablarabstand | gapBottom ≥ Auflagenhöhe + 10: Latte 48 → 60, Schiene (60 unter dem Tablar) → 70, Tablarwinkel mit Wandschenkel 200/250/300 → 210/260/310. Sonst unterstes Tablar auf Dachlatte. Lichte Höhe < Wandschenkel → nShelves − 1. Schenkel als Daten statt 0,8 × Grösse. Node: U, dHinten 300, Winkel, gapBottom 150 → 0 Warnungen (Schenkel 250 reicht 100 mm unter den Boden); Zufall: 30 von 400 Würfen | `normReduit` :24, `brackets` :404, `WINKEL_LENS` :176 | EG-9, EP-16, RM-10, EP-14 |
| K10 | Wangen | Wangenhöhe = oberstes Tablar + t + 50 statt rh − 10 (Standard 2168 statt 2390) | :419 | EG-14, RM-4, DY-31, TR-8 |
| K11 | Wangen mit freiem Ende | unterstes und oberstes Tablar als feste Böden mit je 4 Winkeln 40 × 40, Wange in halber Höhe an die Wand | `SUPPORTS.cheeks` | TR-8 |
| K12 | L/U × Wangen oder selbststehend | Eckwange bzw. Modulgrenze so setzen, dass das hintere Eckfach ≥ 350 mm offen ist. Das geht bis zu diesen Seitentiefen: Birke 18 → 470, Sperrholz Fichte/Eiche 18 → 370, OSB 18 → 320, MDF 19 → 221, Spanplatte weiss 19 → 171 (Module etwa 7 mm mehr; `RG_eckgrenze.js`). Sonst wird das Eckquadrat ein Blindfach ohne Tablare. Bauablauf: Eckfach vor Eckwange bzw. Seitenmodul bestücken; T-Stoss mit 3 × 4 × 40 als Kaufteil | `cheekPositions` :209–226, `freeModules` :490–500, Schritte :692, 701 | EP-4, EP-5, EG-5, RM-8, EP-11, EG-16, DY-23 |
| K13 | L/U, max(dLinks, dRechts) ≥ dHinten + 100 | Die Seiten laufen bis zur Rückwand, das hintere Regal liegt zwischen ihnen. Meldung «Die Seitenregale laufen durch, weil sie tiefer sind» | `layoutReduit` :77–82; `ends[1]==='corner'` in :352, 387, 408, 477, 490 | EP-8, EP-11 |
| K14 | Reduit, Raumgrenzen | Tür nach innen: dHinten ≤ rd − doorW − 50. U: Durchgang ≥ 500 statt 300. Node: I und L rechts (Band links), rd 1400, dHinten 600, Tür 800 → 0 harte Warnungen (`RG_door.js`) | `normReduit` :38–46 | EG-6, RM-2, RM-16 |
| K15 | Tür nach innen, Bandseite | Nur kürzen, wenn die Tiefe > wf − 110 (Blatt 40 + Drücker 70); sonst volle Länge und Türpuffer als Kaufteil. Reststück < 400 (Wangen, selbststehend) bzw. < 300 (übrige) weglassen | :83–84, `freeModules` | EG-10, RM-12, RM-E2 |
| K16 | Drehtüren × Korpus 21 | Überschlag aussen min(t − 1,5; 17), an der Mittelwand min((t − 3)/2; 8). Türbreite daraus rechnen, in der Notiz «Seitenkante 4 mm sichtbar» | `sideboard.js:113` | SK-E1, SF-1 |
| K17 | Türen pro Fach | Eine Konstante `DOOR_MAX = 600` für Automatik und Warnung. «1» wird 2, wenn die Tür > 650 mm breit wäre; «2» wird 1 bei Fächern unter 500 mm | :111, :120 | SF-11, SF-13, SF-10 (2) |
| K18 | Schiebetüren | Türanzahl nach Fächern: 2 → 2, 3 → 3, 4 → 2. Nur passende Werte anzeigen | :130; `index.html:746–752`; `konfig.js:101` | SF-7 |
| K19 | Schiebetüren × Einlegeböden | vordere Lochreihe in den Seiten bei slideSet + 40 ab Vorderkante (92 mm bei 18-mm-Türen), in Notiz und Schritt | `sideboard.js:61, 282` | SK-1, SF-2, DY-28 |
| K20 | Drehtür-Beschläge | Scharnierzahl = max(Höhenregel, Gewicht 6/12/17 kg), + 1 über 600 mm Breite. Montageplatten beidseits einer Mittelwand ≥ 64 mm versetzt. Einlegeboden, der ≤ 40 mm an einer Scharnierhöhe liegt, 64 mm höher. Push-to-open bei Doppeltür ohne Mittelwand an Deckel bzw. Boden | :77, 108, 202, 299 | SF-4, SF-5, SK-15, SF-E2, SF-6 |
| K21 | Sideboard offen, ohne Rückwand | 2 Traversen 80 × t (oben und unten zwischen den Seiten) als Teile statt 4 Winkel | :82, 194 | SK-9 |
| K22 | Oberfläche × Material | Grundierung je Frontmaterial: MDF mit MDF-Grund, Holz mit Isoliergrund, Spanplatte weiss mit Körnung 240 anschleifen, dann Haftgrund. Beschichtete Flächen nicht schleifen, Kanten erst nach dem Bekanten brechen | `sideboard.js:233, 249, 281`; `reduit.js:639, 687` | SF-9, SF-E1, DY-16, MX-14 |
| K23 | selbststehend, Modulhöhe ≥ 1400 | mittlerer Boden fest (Konstruktionsboden); Nischenmodul unten mit 80 mm Riegel | `freeModules` :511–518 | RM-9 |

### 2.3 Warnen (10)

| ID | Bedingung | Warnung | Code | Befunde |
|---|---|---|---|---|
| W01 | Sideboard-Einlegeboden breiter als maxSpan(mat, t) | «Einlegeböden aus Spanplatte weiss 19 mm biegen sich ab ca. 500 mm durch.» Node: Spanplatte 19, 750 × 890, 1 Fach, s 712 → 0 Warnungen; Zufall 52/400 | `sideboard.js:165–166` | SK-3, MX-4 |
| W02 | Deckel/Boden ohne Einlegeboden bei jeder Fachzahl, s > maxSpan + 200 | «Der Deckel spannt … mm frei.» Node: Spanplatte 16, 2000 breit, 2 Fächer, s 976 → 0 Warnungen | :167 (heute nur bei 1 Fach) | MX-4 |
| W03 | Exzenter bei 15 mm | «Gehäuse 12 mm tief, Variante für 15 mm kaufen, 3 mm Rest.» | `shared.js:160` | MX-1 |
| W04 | Verschraubt mit Mittelwänden | Köpfe auf dem Deckel sichtbar, auch bei Deckel zwischen den Seiten; der Schritt nennt die Mittelwände | :170, :285 | SK-14 |
| W05 | Leimholz-Tür höher als 900 mm | «Leimholztüren über 900 mm werfen sich. Dreischicht, Sperrholz oder MDF.» Node: Eiche 18 mit 1244 mm hohen Schiebetüren → nur Kippschutz; Zufall 11/400 | :150–152 | SF-E3, MX-9 |
| W06 | Front-Details | Front < 15 mm: «Scharnier für diese Türstärke, Ø 26 nur bis 450 mm Türbreite.» OSB oder Seekiefer als Front: Hinweis «rustikal, Topfbohrung an einem Reststück testen». Farbe auf Spanplatte weiss: «anschleifen, Haftgrund» | :48, 198 | SF-3, MX-14, SF-10 |
| W07 | Leisten, freies Feld ≥ max (bis K06 da ist) | mit Zahl: «hängt nach einiger Zeit ca. X mm durch, Richtwert L/200 = Y mm». Kartentext «bis ca. 80 cm Wand (Birke 18)» statt «Günstig und stabil» | `reduit.js:356`, `index.html:590` | TR-5, TR-E2 |
| W08 | Tür nach aussen, Seitentiefe > wf − 60 | «Das Regal sitzt auf der Türzarge.» Endleiste ≥ 60 mm vor der Öffnung enden lassen | :85 | RM-11 |
| W09 | selbststehend: hypot(top, Tiefe) > rh − 20 oder top > Türhöhe − 50 | «Module im Reduit stehend bauen.» Neues Feld Türhöhe (Standard 2000) | `freeModules` :505 | DY-26, RM-3 |
| W10 | Gipskarton × Leisten, Wangen, selbststehend | als Hinweis (nicht über Regex): «Schraubpunkte auf die Ständer, dort Holzschrauben 5 × 80, dazwischen Hohlraumdübel», dazu der Kaufteil | :617–619 | TR-7, DY-11, RM-13 |

### 2.4 Eine Spannweitentabelle für beide Möbel

`SPAN` und `maxSpan` wandern aus `reduit.js:126–144` nach `shared.js`. Das Sideboard rechnet heute pauschal nach der Stärke (`sideboard.js:165`):

| Material | Stärke | Sideboard heute | SPAN (Reduit) |
|---|---|---|---|
| Sperrholz Birke | 12 / 18 / 21 | 700 / 800 / 900 | 500 / 800 / 950 |
| Leimholz Eiche | 18 / 27 | 800 / 900 | 700 / 1050 |
| Leimholz Fichte | 18 / 21 / 27 | 800 / 900 / 900 | 600 / 720 / 900 |
| Sperrholz Seekiefer | 12 / 15 | 700 / 700 | 450 / 550 |
| Sperrholz Fichte | 15 / 18 / 21 / 24 | 700 / 800 / 900 / 900 | 600 / 700 / 800 / 900 |
| MDF roh | 16 / 19 / 22 | 700 / 800 / 900 | 450 / 550 / 650 |
| OSB roh | 12 / 15 / 18 | 700 / 700 / 800 | 450 / 550 / 650 |
| Dreischicht Fichte | 19 / 27 | 800 / 900 | 650 / 950 |
| Spanplatte weiss | 16 / 19 | 700 / 800 | 400 / 500 |

`maxSpan` gilt dann überall:
- **Sideboard:** Einlegeboden (W01), Deckel und Boden (W02).
- **Reduit:** Leisten, Schienen, Winkel, Wangen und die Modulbreite (`moduleSplit`).

Ausnahme ist der Pfostenrahmen. Dort spannt das Tablar nur über die Tiefe; den Pfostenabstand bestimmt die Querlatte (`POST_MAX = 1200`, TR-E1, Teil von U1). Für Sperrholz, MDF und Spanplatte ist SPAN nachgerechnet (TR «gut»). Bei Leimholz und Dreischicht ist er zu vorsichtig (TR-14, niedrig). Das kostet nur Kaufteile.

### 2.5 Schraubentabelle zu K04

| Anwendung | 15/16 | 18/19 | 21–24 | 27 | Befunde |
|---|---|---|---|---|---|
| Tablar auf Blechwinkel oder Konsole, von unten, Flach- oder Linsenkopf | 4 × 12 | 4 × 16 | 4 × 20 | 4 × 25 | TR-3, DY-3, EG-1, EP-15 |
| Eck- und Stossleiste (Dachlatte 24, K05) in das Tablar | 4 × 35 | 4 × 35 | 4 × 35 | 4 × 40 | TR-4, EG «gut» |
| Tablar von oben in Leiste oder Latte (oder bewusst lose auflegen) | t + 22, abgerundet | 4 × 40 | t + 22 | – | TR-11, DY-9 |
| Anschraubplatte Füsse, Sockelwinkel | 4 × 12 | 4 × 16 | 4 × 16 | 4 × 16 | SK-5, DY-7, MX-E4 |
| Querlatte an Pfosten | 5 × 60, vorbohren | | | | DY-24, TR-17 |
| Spreizdübel 6 × 30 | Metall 4,5 × 50 · Latte 24 → 5 × 60 · 27 → 5 × 70 | | | | TR-12, RM-14, MX-E2, DY-10 |
| Sockelecken | t + 25 (18 → 4 × 45, 27 → 5 × 50) | | | | SK-18 |

## 3. Was keine Regel lösen kann

- **U1 Pfostenrahmen neu bauen** (hebt S17 auf):
  - Pfosten vor die Querlatte stellen (v = Tiefe … Tiefe + 45) oder die Querlatte hinter den Pfosten schrauben; die Tablare bleiben rechteckig.
  - Eckpfosten an jeder Innenecke statt einer Eckleiste.
  - Querlatten-Enden mit Winkel 40 × 40 an Endlatte oder Wand, Tablare verschraubt.
  - `POST_MAX = 1200`; die Durchgangsprüfung rechnet + 2 × 45.
  - Neuer Bauablauf: Latten → Tablare → Pfosten → Querlatten.
  - Befunde: EP-1, TR-1, RM-1, DY-1, EG-2, EG-3, EG-4, EG-12, EG-18, EP-2, EP-17, RM-7, RM-E1, TR-2, TR-9, TR-E1, TR-17, DY-32.
- **U2 Stützen an freien Enden und Stössen** neben oder vor das Tablar stellen und das Tablar um 45 mm kürzen. Sonst die Ausklinkung 45 × 45 in Notiz, Werkzeug und Bauablauf aufnehmen. U2 ist Voraussetzung für K06 und betrifft heute Tür nach innen und Nischen bei Leisten, Schienen und Winkeln sowie Leisten aus ganzen Brettern. Befunde: EP-1, RM-1, DY-1, TR-1, EG-4, DY-22.
- **Reine Anleitung oder Einkauf, nicht im Regelwerk:** MX-12/DY-5, MX-E3/DY-29, DY-6, RM-17, RM-19/DY-18, EG-19/TR-11, DY-12, DY-13, DY-17, DY-20, DY-21, DY-25, SF-8, SF-12, SF-14, SF-15, SK-13, SK-17, SK-19, SK-20/DY-27, RM-5, RM-15, RM-20, RM-21, RM-23, EG-13, EG-15, TR-15, MX-E5.

## 4. Heute zu schwache oder fehlende Warnungen

| Stelle | Heute | Beleg (Node, `skripte/RG_*.js`) | Regel |
|---|---|---|---|
| `konfig.js:37` «eingeplant» | `reduit.js:614` (ohne Rückwand) und `:377` (Schiene zweiteilig) gelten als harmlos | U selbststehend ohne Rückwand; U Schienen → beide Meldungen im harmlosen Teil (`RG_check.js`) | S08, K08, Meldungsarten |
| `konfig.js:37` `^Gipskarton` | Schienen und Winkel auf Gipskarton gelten als warnungsfrei | U Schienen Gipskarton → Gipskarton-Meldung harmlos | S16, W10 |
| `sideboard.js:165–166` | Spannweite nur nach Stärke | Spanplatte 19, s 712 → 0; Zufall 52/400 | W01 |
| `sideboard.js:167` | Deckel/Boden nur bei 1 Fach geprüft | Spanplatte 16, 2 Fächer, s 976 → 0 | W02 |
| `sideboard.js:171` | Exzenter erst ab 26 mm, im Reduit nie | Birke 12 / Seekiefer 15 / Sperrholz Fichte 24 → 0 | S04, W03 |
| `sideboard.js:170` | Köpfe nur beim aufgesetzten Deckel | Mittelwände fehlen (SK-14) | W04 |
| `sideboard.js:150–152` | Leimholz ohne Höhengrenze | Eiche 18, Schiebetüren 1244 hoch → nur Kippschutz | W05 |
| `sideboard.js:111` gegen `:120` | Automatik ab 620, Warnung ab 600 | SF-11 | K17 |
| `sideboard.js:236–246` | Bad ohne Spanplatte weiss | Bad mit Spanplatte weiss → nur Pappel-Hinweis | S09 |
| fehlt (Sideboard) | Drehtür-Überschlag, Verschraubt × Leimholz/OSB, Lack auf Eiche/OSB | MDF 22/Eiche 27 mit Drehtüren, Eiche/OSB verschraubt, Salbei auf Eiche/OSB → alle 0 | S10, S05, S06, S12 |
| `reduit.js:356` | Leisten-Warnung ohne Mass; der Standard löst sie selbst aus | Standard-Reduit: 3 harte Warnungen (Leisten + 2 × «passt nicht», bekannte Birke-Eigenheit `WEITERARBEIT.md:103` und Klemmung K01) | W07, K06, Abschnitt 5.5 |
| `reduit.js:393–395` | «knapp», Bodenabstand ungeprüft | U, dHinten 300, Winkel, gapBottom 150 → 0 | K09 |
| `reduit.js:83–85` | Tür nach innen nur gegen die Bandseite geprüft, ohne Zarge | I bzw. L rechts, dHinten 600, rd 1400 → 0 harte | K14, W08 |
| `reduit.js:84` | Reststück ab 200 mm bleibt | Standard-U mit Tür nach innen: 200er-Stummel (RM-E2) | K15 |
| fehlt (Reduit) | Eckfach | Birke 18, U 1600, Seite 300: 491 (Wangen) / 481 mm (Module) offen; Fichte 18, Seite 400: 128/117; Spanplatte 19, Seite 400: −3 (ganz verdeckt). Im Raster (Platten ≥ 15, B 1200–2400, Seite 200–500): 257 bzw. 269 von 368 unter 350 mm, 36/33 ganz verdeckt (`RG_eckfach.js`) | K12 |
| fehlt (Reduit) | dünne Wangen und Module | Seekiefer-15-Wangen, Seekiefer-12-Module → 0 | S02, S03 |

## 5. Einbau

### 5.1 `konfig.js`: Tabelle und Prüfung

```js
const LEIMHOLZ = k => { const M = MATS[k]; return !!M && M.grain && !M.ply && !M.coated; };
const sb = c => c.kind !== 'reduit', frei = c => c.kind === 'reduit' && c.build === 'free';
// Ausweichreihenfolge, wenn der gewählte Wert gesperrt ist (Stärke: nächste erlaubte Stärke des Materials).
const AUSWEICH = { joint:['pocket', 'dowels', 'cam', 'screws'], front:['hinged', 'sliding', 'open'],
  back:['hdf3', 'ply6', 'hf3', 'none'], sys:['rails', 'cheeks', 'battens', 'brackets', 'posts'], color:['korpus'] };
const REGELN = [
  { id:'S06', wirkung:'sperren', feld:'joint', werte:c => (sb(c) || frei(c)) && LEIMHOLZ(c.mat) ? ['screws'] : [],
    grund:'Die Schrauben gingen ins Hirnholz – Taschenloch oder Dübel.', befunde:['SK-E2'] },
  { id:'S10', wirkung:'sperren', feld:'front', werte:c => sb(c) && c.t >= 22 ? ['hinged'] : [],
    grund:'Topfscharniere erreichen bei diesem Korpus den Überschlag nicht – 16–21 mm.', befunde:['SF-1', 'SK-E1'] },
  { id:'K14', wirkung:'korrigieren', wenn:c => c.kind === 'reduit' && c.doorIn && c.rd - c.dBack < c.doorW + 50,
    setze:c => ({ dBack:c.rd - c.doorW - 50 }), text:v => `Tür öffnet nach innen – Tiefe hinten auf ${v.dBack} mm begrenzt.`,
    befunde:['EG-6', 'RM-2'] },
  // … S01–S17, K01, K08, K09, K14, K17, K18 (Korrekturen an Formularfeldern); die übrigen K/W in der Berechnung
];
function gesperrt(c){
  const g = {};
  for (const r of REGELN) if (r.wirkung === 'sperren') for (const w of r.werte(c)) (g[r.feld] ||= {})[w] ??= { regel:r.id, grund:r.grund };
  return g;
}
// d = Formularwerte, fest = Felder aus gesperrten Gruppen (SPERREN). Läuft bis zum Fixpunkt, höchstens 4 Runden.
function pruefeRegeln(d, fest = new Set()){
  let x = { ...d }; const m = [];
  for (let i = 0; i < 4; i++) {
    const c = cfgFromData(x), g = gesperrt(c); let neu = null;
    for (const [feld, werte] of Object.entries(g)) {
      const hit = werte[x[feld]]; if (!hit) continue;
      if (fest.has(feld)) { m.push({ regel:hit.regel, art:'warnung', text:hit.grund }); continue; }
      const alt = (feld === 't' ? MATS[c.mat].t.map(String) : AUSWEICH[feld] || []).find(w => !werte[w]);
      if (alt != null) { neu = { ...neu, [feld]:alt }; m.push({ regel:hit.regel, art:'korrektur', text:hit.grund }); }
    }
    for (const r of REGELN) if (r.wirkung === 'korrigieren' && r.wenn(c)) {
      const s = r.setze(c), art = Object.keys(s).some(k => fest.has(k)) ? 'warnung' : 'korrektur';
      m.push({ regel:r.id, art, text:r.text(s) }); if (art === 'korrektur') neu = { ...neu, ...s };
    }
    if (!neu) break;
    x = { ...x, ...neu };
  }
  return { d:x, gesperrt:gesperrt(cfgFromData(x)), meldungen:[...new Map(m.map(e => [e.regel + e.text, e])).values()] };
}
function computeData(d, fest){
  const P = pruefeRegeln(d, fest), c = cfgFromData(P.d);
  const R = c.kind === 'reduit' ? computeReduit(c) : computeSideboard(c);
  R.meldungen = [...P.meldungen, ...R.meldungen]; R.warn = R.meldungen.map(e => e.text);
  R.form = P.d; R.gesperrt = P.gesperrt;
  return R;
}
```

### 5.2 Berechnung

- **Meldungen mit Regel-ID:** `computeSideboard` und `computeReduit` schreiben ihre Meldungen über `meld(regel, art, text)` nach `R.meldungen`. Das gilt für W01, W02, W05, W07–W09 und die Korrekturen, die von der Geometrie abhängen: K02–K07, K10–K13, K15, K16, K19–K23. `R.warn` bleibt als Textliste für `renderWarns`.
- **Verschieben nach `shared.js`:** `SPAN`, `maxSpan`, `FRONT_MAX`, `frontTs` und `LEIMHOLZ`. `MAT_INFO` bekommt `werkstoff` (sperrholz, dreischicht, leimholz, mdf, span, osb) und `hart` für Eiche (K02).

### 5.3 `zufall()`

- `wuerfelSideboard` und `wuerfelReduit` würfeln in der Abhängigkeitsreihenfolge und nur aus den erlaubten Werten: `pick(AUSWEICH.joint.filter(v => !gesperrt(cfgFromData(d)).joint?.[v]))`.
- Damit entfallen die Sonderregeln `konfig.js:94` (Stärke 15–22), `:108` (Farbe), `:112` (Deckel bei Verschraubt) und `:113` (Bad-Rückwand).
- Im Reduit zuerst `build` und `sys` würfeln, dann das Material mit erlaubter Stärke. Heute setzt `konfig.js:143` fest `tDef` und würfelt so Seekiefer 15 in Wangen und Module (34 von 400 Würfen).
- dHinten bei Tür nach innen aus [300, rd − doorW − 50] (K14), gapBottom ab Auflage + 10 (K09).
- Schleife: `computeData(d, fest)`, verworfen wird nur bei `art === 'warnung'`. Zurückgegeben wird `R.form`, also die korrigierten Werte.

### 5.4 `index.html`

- `render()` (`index.html:1166`) ruft `computeData(formData())` statt `computeReduit`/`computeSideboard`. Weicht `R.form` von den Formularwerten ab, schreibt es die geänderten Felder zurück (wie `restore`, `index.html:1136`) und zeigt die Korrekturen per `flash`.
- `syncVisibility()` (`index.html:1026`) setzt nach `R.gesperrt` das `disabled` für Radios, Karten und `<option>`. Die Gründe stehen in einer `.hint`-Zeile je Gruppe; die Zahlenfelder bekommen `min`/`max` (S14, S15).
- `index.html:1040` hakt die Maserung bei Leimholz an und sperrt sie (S13).
- Die Warnzahl (`index.html:1173–1175`) zählt nur `art === 'warnung'`; Hinweise und Korrekturen erscheinen grau.

### 5.5 Standardwerte

- **Sideboard:** Der Standard bleibt ohne Warnung (Node).
- **Reduit:** Der Standard hat heute 3 harte Warnungen. Vorschlag: `sys:'rails'`, `gapTop:350` und entweder «Maserung einhalten» im Reduit standardmässig aus oder Sperrholz Fichte 18 als Material. Beides ergibt 0 harte Warnungen, nur noch den Hinweis «zusätzliche Schienen» (`RG_default.js`; TR-E2).

## 6. Tests (`test/regeln.test.js`, Anpassungen in `test/konfig.test.js`)

1. **Tabelle:** IDs eindeutig, `wirkung` gültig, `befunde` nicht leer, jede Sperre hat `feld` und `grund`, jedes `feld` ist ein Formularname.
2. **Je Regel ein Positiv- und ein Negativfall** (tabellengetrieben). Beispiele:
   - Eiche + Verschraubt → `gesperrt.joint.screws.regel === 'S06'`; Birke + Verschraubt → frei.
   - I-Form, rd 1400, dHinten 600, Tür nach innen → dHinten 550 (K14).
3. **Fixpunkt:** `pruefeRegeln(pruefeRegeln(d).d)` bringt keine neue Korrektur, für 400 Würfe und die Matrix aus `RG_wirkung.js`.
4. **Keine Sackgasse:** In jeder Matrix-Kombination bleibt je Feld mindestens ein erlaubter Wert.
5. **Formular = Berechnung = Zufall:** 400 Würfe je Typ, kein gewählter Wert gesperrt, keine `warnung`. Ersetzt `konfig.test.js:33–45`, das mit `HARMLOS` filtert.
6. **Schloss:** Eiche 27 + Exzenter fest (`konfig.test.js:153–166`) → Werte bleiben, Meldung `warnung` mit S04 und S10.
7. **Keine versteckten «harmlos»-Fälle mehr:**
   - selbststehend ohne Rückwand über 1200 mm → gesperrt;
   - Standard-U mit Schienen → kein Zweiteiler (K08);
   - Gipskarton + Schienen → gesperrt.
8. **Standardformulare** Sideboard und Reduit ohne `warnung` (TR-E2).
9. **Geometrie:**
   - keine Überschneidung von Holzteilen in `R.boxes` über Form × Bauart × Material (Prüfroutine aus EP-1; nach U1 und U2);
   - unterste Auflage ≥ 10 mm über Boden (K09);
   - Eckfach ≥ 350 mm offen oder leer (K12);
   - der Schwenkkreis der Tür trifft keine Box (K14);
   - nach U1: Pfostenzahl bei OSB 12 = bei Birke 18, jede Querlatte hat mindestens 2 Auflager (TR-E1, TR-9).
10. **Schrauben:** Für jede Tablarschraube gilt Länge ≤ Blech bzw. Leiste + t − 2, über alle Stärken (K04).
11. **SPAN:** `maxSpan` kommt aus `shared.js`, Sideboard und Reduit liefern denselben Wert. `reduit.test.js:181` wandert nach `shared.test.js`.
12. **Snapshot:** `sideboard.snapshot.test.js` bei K02/K04 neu schreiben; prüfen, dass sich nur Beschlagzeilen und Notizen ändern.

## Gut

- `FRONT_MAX`, Topf Ø 26 bei dünnen Türen und bündige Griffe bei Schiebetüren (`sideboard.js:6, 48`; `index.html:936–937`) sind schon Regeln, nur verstreut.
- `normReduit` begrenzt mit Meldung (`reduit.js:37–48`). Das ist genau das Muster für «korrigieren».
- Die SPAN-Verdichtung bei Schienen, Winkeln und Wangen (`reduit.js:360, 398, 418`) ist fachlich richtig und bleibt.
- Mechanismus Schloss/`SPERREN` (`konfig.js:39–49`) passt direkt als `fest` für `pruefeRegeln`.

## Bekannt (WEITERARBEIT.md)

- Birke-Maserung über die 1500er-Seite (:103): der Grund für 2 der 3 Warnungen im Reduit-Standard.
- Zweiteilige Schienen (:104): behoben durch K08.
- Leisten-Warnung mit Stosspfosten (:74): geht in W07/K06 auf.
- SPAN als Daumenregel (:82): siehe TR-14.
- Kippsicherung mit Gurt (:105): RM-23, nicht Teil des Regelwerks.

## Offen

- **S03:** Schwelle 16 mm (TR-16) oder 18 mm (MX-2).
- **Exzenter bei 15 mm:** sperren (SK-2, App-Text «16–22») oder warnen (MX-1, Hersteller). Übernommen ist «warnen» (W03).
- **Lack auf Spanplatte weiss:** sperren (SF-9) oder mit Haftgrund erlaubt (MX-14). Übernommen ist «warnen» (W06).
- **Wandschienen über 484 mm Tiefe:** Obergrenze aus TR-16 (4) nicht übernommen, weil statisch nicht belegt. Echte Schienendicke nachmessen (TR-6).
- **Last beim Sideboard:** Ob die Einlegeböden wegen geringerer Last einen Zuschlag auf SPAN vertragen (MX-4), ist nicht belegt.
- **Eckfach-Schwelle:** 350 mm (EP-4, EP-11) oder ½ Fachlänge (EG-5).
- **Zargenbreite 60 mm** (RM-11) ist ein Richtwert. Die Türhöhe gibt es noch nicht als Eingabe (W09).
- **Birke-Tablare quer zur Faser:** Ob sie die SPAN-Werte halten, wenn die Maserung im Reduit aus ist (5.5), ist nicht belegt.
- **U1:** Ob der Pfostenrahmen die Variante A (Pfosten vor dem Tablar) oder B (Ausklinkung plus neuer Bauablauf) bekommt, ist noch zu entscheiden.

Skripte (Repo unverändert): `skripte/RG_lib.js`, `RG_check.js`, `RG_default.js`, `RG_door.js`, `RG_eckfach.js`, `RG_eckgrenze.js`, `RG_regeln.js`, `RG_wirkung.js`, `RG_zufall2.js`.