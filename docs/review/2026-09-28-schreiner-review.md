# Schreiner-Review: DIY Furniture

Stand 28.09.2026, geprüft auf `main` @ `35cb9f3`. Sicht: erfahrener Möbel- und Holzbauer. Frage: Hält die App ihr Versprechen «Konfiguriere ein Sideboard / einen Reduit-Ausbau, der Sinn macht und DIY zu machen ist»? Und: Sind die Ecken der L- und U-Form richtig konstruiert?

Detailpapiere in diesem Ordner:

- `2026-09-28-eck-urteil.md` – Ecken je Bauweise, empfohlene Eckdetails mit Massen, Codeänderungen, Tests
- `2026-09-28-eingrenzung-bauweisen.md` – Eingrenzung über feste Bauweisen (Rezepte)
- `2026-09-28-eingrenzung-regeln.md` – Eingrenzung über ein Regelwerk (50 Regeln)
- `2026-09-28-befunde.md` – alle 172 Befunde einzeln, mit Beleg, Gegenprüfung und Kombinationsmatrix

## Kurzurteil

Das Versprechen ist **teilweise eingelöst**.

- **Sideboard:** Die Grundkonstruktion stimmt: Seiten, Boden, Deckel, Mittelwände, aufgeschraubte Rückwand, Topfscharniere mit richtiger Kröpfung, Schiebetüren im Korpus. Die Standardkonfiguration (Birke 18, Taschenloch, Drehtüren, Rückwand) ist sauber baubar. Die Fehler liegen in den Rändern der freien Kombination: 12-mm-Korpus mit Exzenter oder Dübel, Drehtüren an 22–27-mm-Korpussen, Spannweiten ohne Materialfaktor, Bohrbilder und Details bei Schiebetüren.
- **Reduit:** Die Raumlogik ist sauber: Segmente, Masskette an der Ecke, Spiegelung links/rechts. Die Tragwerke sind unterschiedlich reif. Wandschienen und Tablarwinkel sind im Kern richtig, bei Leisten fehlt der Innenecke ein Auflager, Wangen und selbststehende Module erzeugen Blindecken. Der **Pfostenrahmen**, den die Karte mit «trägt am meisten» anpreist, ist **so nicht baubar**.
- **Quer durch beide Möbel:** Schrauben sind mit fixen Längen geplant (4 × 35, 4 × 16, 4,5 × 50). Je nach Stärke kommen sie oben aus dem Tablar oder erreichen es gar nicht.
- **Ursache:** Die App lässt jede Stärke mit jeder Verbindung, jeder Bauart und jeder Rückwand zu. Grenzen stehen verstreut als Warnungstexte. «Zufall» filtert diese Texte über einen Regex (`HARMLOS`, `konfig.js:37`), der drei ernste Fälle als harmlos durchlässt.

**Methode:** 8 Fachprüfungen mit je eigener Sicht (Ecken-Geometrie, Ecken-Praxis, Reduit-Tragwerk, Raum und Montage, Sideboard-Korpus, Fronten, Material-Beschlag-Matrix, DIY-Anleitung). Jede Prüfung hat mit den echten Modulen in Node nachgerechnet, jeder Befund wurde von einem zweiten Prüfer gegengeprüft. Ergebnis: 172 Befunde, keiner widerlegt, 45 in Mass oder Schwere korrigiert; 9 kritisch, 49 hoch, 81 mittel, 33 niedrig. Viele Punkte haben mehrere Prüfer unabhängig gefunden (Pfosten im Tablar fünfmal). Die kritischen Punkte habe ich zusätzlich selbst nachgerechnet.

---

## 1. Die Ecken der L- und U-Form

**Die Geometrie der Ecke stimmt überall, die Konstruktion nicht bei allen Bauweisen.**

Richtig ist: Das Seitenregal beginnt genau an der Vorderkante des hinteren Regals (`reduit.js:82`), kein Tablar überschneidet ein anderes, und links/rechts sind in allen 168 geprüften Paaren deckungsgleich gespiegelt.

| Bauweise | L | U | Kern |
|---|---|---|---|
| Leisten | mit Mängeln | mit Mängeln | Seitentablar liegt am Eckende nur 20 mm auf der Eckleiste; die Eckleiste hängt an der freien Vorderkante des hinteren Tablars. Kein wandfestes Auflager an der Innenecke. Eckleiste 15 mm zu lang (steckt in der Seitenwandleiste), Schrauben 4 × 35 lassen bei 18 + 18 mm nur 1 mm Holz, bei 12–16 mm Tablar brechen sie durch. |
| Wandschienen | mit Mängeln | mit Mängeln | Ecke trägt richtig (erste Konsole 50 mm hinter dem Stoss). Aber die Tablare stecken 9 mm in den Schienen (Schiene 12 mm tief, Tablar ab 3 mm): an die Schiene geschoben ist die Kette an der Ecke 9–12 mm zu lang, das Seitentablar passt nicht mehr. Bei Tiefe hinten ≤ 210 mm kreuzen sich die Konsolen. |
| Tablarwinkel | mit Mängeln | mit Mängeln | Ecke richtig (erster Winkel 60 mm hinter dem Stoss). Mängel ausserhalb der Ecke treffen auch sie: unterste Winkel stecken im Boden, Schrauben kommen oben heraus. |
| Wangen | mit Mängeln | mit Mängeln (2 Blindecken) | Eckwange trägt sauber, verdeckt aber das hintere Eckfach: Standard (Birke 18, Seite 300) 278 von 768 mm, Öffnung 490 mm. Bei MDF 19 bleiben 227 mm, bei ganzen Brettern mit Seite 400 nur 127 mm – das Fach ist bezahlt, aber kaum nutzbar. |
| Pfostenrahmen | **falsch** | **falsch** | Pfosten stehen in den Tablaren (siehe 2.1). An der Innenecke kein Pfosten: die hintere Querlatte kragt 508 mm aus, die seitliche 478 mm; bei Raumtiefe unter 1200 mm hat die Seite gar keinen Pfosten. Die Eckleiste liegt in drei Latten. |
| Selbststehend | mit Mängeln | mit Mängeln (2 Blindecken) | 2 mm Eckfuge, eigene Rückwand und Kippsicherung je Modul: gut. Das Seitenmodul verdeckt 36–49 % des hinteren Eckmoduls; die Verbindung im T-Stoss und die Reihenfolge fehlen. Mit ganzen Brettern überlappen die Module 8–11 mm. |

Keiner dieser Mängel löst heute eine Meldung aus, darum nimmt auch «Zufall» solche Varianten an.

**Grundsatz «hinten durchlaufend, seitlich stumpf davor»:** als Standard richtig. Das durchlaufende Tablar hat drei Wandauflager (Rückwand, beide Stirnwände), die Stossfuge und die Blindecke bleiben so lang wie das flachere Regal tief ist, und ein stumpfer Stoss verzeiht nicht rechtwinklige Wände – eine Gehrung nicht. Genauer gefasst: **Das tiefere Regal läuft durch.** Sind die Seiten mindestens 100 mm tiefer als hinten, sollten die Seiten durchlaufen (oder die Seitentiefe begrenzt werden). Statisch zählt die Richtung wenig; das eigentliche Problem ist das **fehlende Auflager der Innenecke**. Im Plattenmodell (Leisten, Standard-U) biegt sich die Innenecke ohne Eckleiste 23,3 mm, mit Eckleiste 9,0 mm, mit Eckstütze 0 mm.

**Empfohlene Eckdetails** (Masse und Montage im Eck-Urteil):

- **Leisten:** Leisten aus Dachlatte 24 × 48 statt 40-mm-Plattenstreifen (21 statt 15 mm Auflage, im Standard-U CHF 32.58 statt 96.60). Seitenwandleiste von der Rück- bis zur Vorderwand durchgehend. Eckleiste als flache Dachlatte, nur noch Verbinder. Eine Eckstütze 45 × 45 vor beiden Tablarkanten an der Innenecke, mit Winkeln.
- **Pfostenrahmen:** Pfosten *vor* die Querlatte statt dahinter – die Tablare bleiben rechteckig. Ein Eckpfosten im Schnittpunkt der beiden Vorderkanten trägt beide Querlatten; keine Eckleiste mehr. Querlatten-Enden mit Winkel an die Endlatte, Tablare verschraubt. Pfostenabstand nach der Querlatte (höchstens ca. 1200 mm) statt nach der Tablar-Spannweite: im Standard-U 2 statt 4 Pfosten.
- **Wandschienen:** Tablar erst 2 mm vor der Schiene beginnen lassen (Tiefe − 14 mm). In L/U erst ab 260 mm Tiefe.
- **Tablarwinkel:** unterstes Tablar mindestens Wandschenkel + 10 mm über dem Boden.
- **Wangen und selbststehend:** Öffnung des Eckfachs prüfen. Ab 350 mm: Eckfach zuerst bestücken, dann Eckwange bzw. Seitenmodul stellen und im T-Stoss mit 3 × 4 × 40 verschrauben. Unter 350 mm: das Eckquadrat leer lassen (Eckwangen-Paar bzw. hintere Modulreihe erst ab Seitentiefe + 2 mm).

---

## 2. Befunde nach Thema

IDs verweisen auf `2026-09-28-befunde.md`.

### 2.1 Kritisch

**Pfostenrahmen nicht baubar** (EP-1, TR-1, RM-1, EG-4, DY-1, EG-18, EG-3; Ecke: EG-2, EP-2, TR-2, RM-7; Verbindung: RM-E1, EP-17)
- Die Kanthölzer 45 × 45 stehen hinter der Querlatte, also in der Tablarfläche (Tiefe − 69 … − 24 mm, `reduit.js:479–480`), vom Boden bis zum obersten Tablar. Die Tablare sind als volle Rechtecke gelistet, ohne Ausklinkung, ohne Stichsäge im Werkzeug. Nachgerechnet: Standard-U → 4 Pfosten, 20 Durchdringungen Pfosten × Tablar.
- Der Bauablauf setzt zuerst Latten und Pfosten, dann die Tablare (`reduit.js:702`, `:704`). Danach lässt sich ausser dem obersten kein Tablar mehr einlegen – auch ausgeklinkt nicht.
- Der vordere Rahmen ist mit nichts verbunden: Pfosten lose auf dem Boden, Querlatten-Enden stumpf an Hirnholz, Tablare nicht verschraubt. Er hält nur durch Reibung.
- Dasselbe «Stütze im Tablar» gilt für die Stützen an freien Enden (Tür nach innen, Nischenkante) und die Stosspfosten bei Leisten mit ganzen Brettern.

**Verbinder und Bohrtiefen ohne Bezug zur Plattenstärke** (SK-2, MX-1, DY-2, SK-6, MX-2)
- Exzenter Ø 15 (Gehäuse ca. 12,5 mm tief) wird auch für 12-mm-Platten geplant und bohrt durch die Sichtseite. Nachgerechnet: Birke 12 + Exzenter → keine Warnung, Beschlagzeile «für 16–19 mm Platten». Die Warnung kommt erst ab 26 mm (`sideboard.js:171`).
- Dübel «10 mm tief in der Fläche» und Lochreihe 10 mm tief lassen in 12 mm nur 2 mm stehen.
- Ein 12-mm-Korpus ist bis 2400 × 1400 × 650 ohne Grenze wählbar.

**Drehtüren an dicken Korpussen** (SF-1, SK-E1)
- Der Aufschlag wird als Korpusstärke − 1,5 mm gerechnet. Standard-Topfscharniere schaffen aussen etwa 18 mm plus 2 mm Verstellung: bei 21 mm am Anschlag, ab 22 mm nicht erreichbar. Keine Warnung.

**Schiebetüren: vordere Bodenträger tragen nicht** (SK-1; auch SF-2, DY-28 als hoch)
- Bei Schiebetüren ist der Einlegeboden kürzer und liegt hinten an. Nachgerechnet: Seite 397 mm tief, Boden 335 mm, Vorderkante 62 mm zurück. Die Anleitung lässt die Lochreihe «40 mm von vorne» bohren – die vordere Reihe liegt 22 mm vor dem Boden und in der Bahn der hinteren Tür. Richtig wäre slideSet + 40 mm (92 mm bei 18-mm-Türen).

### 2.2 Hoch

**Schraubenlängen fix statt nach Stärke** (EG-1, TR-3, DY-3, RM-6, EP-15, MX-3; Eckleiste EG-7, EP-3, TR-4, DY-4; Leisten TR-11, DY-9; Füsse SK-5, DY-7; Dübel TR-12, RM-14, DY-10, MX-E2)
- 4 × 35 von unten durch Konsole oder Blechwinkel (ca. 2 mm) in ein 18-mm-Tablar: die Spitze steht 13–15 mm oben vor. Im Standard-U mit Schienen 130 Stück.
- «Tablare von unten mit 4 × 35 an Leisten fixieren»: Die Leiste steht hochkant 40 mm hoch – die Schraube erreicht das Tablar nicht, und auf der Liste steht sie auch nicht.
- Füsse und Sockelwinkel 4 × 16, während der eigene Tipp sagt «nicht länger als Bodenstärke − 3 mm» (bei 18 mm also 15).
- Dübelschraube 4,5 × 50 durch eine 24-mm-Latte: zu kurz für den Dübel 6 × 30.
- Vorschlag: Eine Funktion `screwFor(anbau, t)` und Kaufteile je Länge (Tabelle im Eck-Urteil und im Regelwerk, K04), z. B. Konsole/Winkel → 4 × 16 bei 18/19 mm, 4 × 12 bei 15/16 mm.

**Tür nach innen** (RM-2, EG-6, EG-10, RM-12, RM-5, RM-11, RM-E2)
- Ob die Tür ans **hintere** Regal schlägt, wird nicht geprüft. Nachgerechnet: I-Form, Raumtiefe 1000, Tiefe hinten 400, Tür 800 nach innen → 600 mm frei, die Tür öffnet nur ca. 49°, keine Meldung dazu.
- Das Seitenregal auf der Bandseite wird immer um die ganze Türbreite gekürzt (`reduit.js:83`). Das Türband sitzt aber an der Laibung; geöffnet steht das Blatt parallel zur Seitenwand, im Abstand des Wandstücks neben der Tür. Ein Regal mit Tiefe ≤ Wandstück − ca. 110 mm (Blatt und Drücker) wird gar nicht getroffen. Im Standard-U bleibt so ein 200-mm-Stummel mit raumhoher Stütze.
- Die Tür wird immer mittig angenommen, die Zarge nicht berücksichtigt.

**Wandschienen** (EG-8, TR-6, TR-13, DY-8)
- Tablare stecken 9 mm in den Schienen (siehe Ecke).
- Bei 2400 mm Raumhöhe braucht jede Schiene 2050 mm. Die App kauft je Position eine 200er- und eine 100er-Schiene, von der 100er werden 50 mm genutzt – im Standard-U 9 zusätzliche Schienen. Dass gestapelt wird, ist bekannt (WEITERARBEIT), aber mit einem 50 mm tieferen obersten Tablar (gapTop 350) reicht eine 200er.

**Unterste Auflagen im Boden** (EG-9, EP-16, RM-10, EP-14)
- Bei Tablarwinkeln mit 150 mm Bodenabstand steckt der Wandschenkel (200–300 mm) bis 150 mm unter dem Boden. Ebenso Latten und Eckleisten bei kleinem Bodenabstand.

**Leisten weit über dem Richtwert** (TR-5, TR-E2)
- Bei Leisten liegt die Vorderkante frei. Über dem Richtwert gibt es nur einen Hinweis. Nachgerechnet (TR): I 1600 mm mit MDF 19 → ca. 48 mm sofort, ca. 120 mm unter Dauerlast (L/13) – das ist Versagen. Standard-U Birke 18 hinten: 17 mm sofort, 31–46 mm Dauer.
- Schon der Reduit-Standard löst diese Warnung aus, die Karte verspricht «günstig und stabil».

**Wangen** (RM-4, EG-14, DY-31, TR-8, EP-4, EG-5)
- Wangenhöhe = Raumhöhe − 10 mm. Nachgerechnet: 2390 × 400 hat ein Kippmass von 2423 mm bei 2400 Raumhöhe – in ihrer Ebene lässt sich die Wange nicht aufrichten, nur flach mit 10 mm Luft, und dafür ist ein 1600 × 1400-Raum zu klein. Besser: oberstes Tablar + t + 50 mm (Standard 2168).
- Am freien Ende (Tür nach innen) ist die Knickreserve nur das 1,1- bis 1,5-Fache; es fehlen feste Böden.
- Blindecke siehe Kapitel 1.

**Gipskarton** (TR-7, RM-13, DY-11)
- Schienen und Winkel werden gleichmässig verteilt statt auf die Ständer; die Last je Hohlraumdübel wird nicht geprüft. `HARMLOS` lässt alles mit «Gipskarton» pauschal durch.

**Sideboard: Spannweite und Bohrbilder** (SK-3, MX-4; SK-8, MX-E1, DY-19; SK-12, DY-30; SK-10, MX-6; SK-E2; SK-11, MX-7)
- Einlegeböden: Grenze pauschal 700/800/900 mm nach Stärke. Spanplatte 19 darf 800 mm spannen (Reduit-Tabelle: 500), MDF 19 ebenso (550). Deckel und Boden werden bei mehreren Fächern gar nicht geprüft.
- Konfirmat: die Seite wird nur Ø 5 statt Ø 7 durchgebohrt; 5 × 60 in Ø 4.
- Dübellöcher sind zusammen genau so tief wie der Dübel lang – kein Platz für Leim.
- «Verschraubt» in Spanplatte und OSB mit normalen Holzschrauben in die Kante; in Leimholz gehen alle Schrauben ins Hirnholz; Taschenloch in Eiche mit Grobgewinde.

**Sideboard: Material und Umfeld** (SK-4, SK-7, MX-10, SK-9, MX-9, SF-E3, SF-E1)
- Bei Leimholz lässt sich «Maserung einhalten» abschalten – dann werden Teile quer zur Faser geschnitten.
- Bad mit Spanplatte weiss ohne Hinweis; der Bauablauf verlangt Klarlack auf Melamin.
- Ohne Rückwand steifen 4 Winkel 40 × 40 den Korpus nicht aus; besser zwei Traversen.
- Leimholztüren über 900 mm Höhe ohne Hinweis.
- Die Anleitung lässt beschichtete Flächen mit Körnung 120/180 schleifen.

**Plattenformat gekappt** (SK-16, MX-11, DY-14)
- `clamp(c.sheetB, 300, 2100)` (`sideboard.js:179`, `reduit.js:589`) macht aus Birke 1500 × 3000 eine Platte 1500 × 2100, die es nicht gibt. Nachgerechnet: Im Standard-Reduit meldet das hintere Tablar deshalb «passt nicht auf die Platte 1500 × 2100».

**Anleitung unvollständig** (DY-5, MX-12, MX-E3, DY-29, DY-6, RM-17, DY-22, DY-23, RM-19, DY-18)
- Selbststehende Module: kein Schritt «Lochreihen bohren» und keiner für die gewählte Verbindung – die Bodenträger stecken ohne Löcher.
- Kippschutz steht auf der Liste, aber in keinem Schritt bzw. erst nach allen Modulen statt sofort beim Aufstellen.
- Stosspfosten und Winkel auf der Liste, in keinem Schritt; Schrauben für die Modulverbindung fehlen.
- «Am einfachsten vor der Montage ölen» steht als letzter Schritt.

**Zufall erzeugt Unbaubares** (RM-18, MX-5, TR-16, EP-11)
- `zufall()` verwirft nur Varianten mit Warnungstext. «eingeplant» lässt 2 m hohe Module ohne Rückwand und zweiteilige Schienen durch, «^Gipskarton» alles auf Gipskarton. Gewürfelt werden u. a. Wangen aus OSB und Seekiefer 15 (39 von 300 Würfen) und Tablarwinkel mit Winkel im Boden (30 von 32). Der Pfostenrahmen geht in 77 von 77 Würfen «ohne Warnung» durch.

### 2.3 Mittel und niedrig (Auswahl)

- Leisten aus 40er-Plattenstreifen: 15 mm Auflage, teuer, viele Zuschnitte (TR-10, MX-8, DY-15).
- 3 mm Wandluft und 0 mm am Eckstoss sind für alte Wände knapp; das kleinste gemessene Mass fliesst nicht in die Liste zurück (RM-15, DY-20).
- Selbststehende Module: passen teils weder aufrecht durch die Tür noch liegend in den Raum; aus einem 200-mm-Rest wird ein 198 mm breiter, 2,1 m hoher Turm (RM-3, DY-26, RM-E2, RM-9).
- Fronten: Scharnierzahl nur nach Höhe, nicht nach Gewicht; Montageplatten beidseits einer Mittelwand auf gleicher Höhe; Einlegeboden auf Scharnierhöhe; Push-to-open bei Doppeltür ohne Mittelwand ohne Montageort; Schiebetürzahl nicht an die Fächer gekoppelt (SF-4, SF-5, SK-15, SF-E2, SF-6, SF-7).
- Oberfläche: Lack und Haftgrund je Material, Kantenband-Mengen (SF-9, DY-16, DY-17).
- Einkaufsliste nennt nur Schnittlängen, keine Handelslängen; ganze Bretter stehen doppelt (DY-12, DY-13).
- Werkzeugliste lückenhaft (Holzbohrer, Senker, lange Wasserwaage, lange Zwingen) (DY-21).
- SPAN-Tabelle: passt für Sperrholz, MDF und Spanplatte; zu vorsichtig bei Leimholz und Dreischicht, zu optimistisch bei OSB (TR-14).
- Sprachfehler: «von den Boden», «7.5 mm», «Grifffseite» (SK-20, DY-27).

### 2.4 Gut gelöst

- Die Rechnung hat kein DOM und läuft in Node; der Snapshot schützt das Sideboard. Das macht jede Korrektur testbar.
- Ecken: Masskette und Spiegelung sauber; Schienen und Winkel tragen den Eckbereich richtig; die Idee der Eckleiste stimmt (Innenecke 23,3 → 9,0 mm).
- Sideboard: Faserrichtung im Korpus durchgehend richtig, Rückwand 1 mm zurück und alle 15 cm verschraubt (laientaugliche Alternative zur Nut), Fugenbild und Kröpfung der Drehtüren bei 16–19 mm richtig, Mittelwand-Lochreihen 8 mm tief und versetzt, Topf Ø 26 für dünne Türen, `FRONT_MAX` 19.
- Schiebetüren grundsätzlich richtig: doppelspurig, 30 mm Überlappung, nur bündige Griffe, «Türen erst nach dem Beschlag zuschneiden».
- Reduit: materialabhängige Spannweiten; Schienen, Winkel und Wangen werden automatisch verdichtet; `normReduit` begrenzt mit Meldung – genau das Muster für automatische Korrekturen.
- Bad-Modus fachlich richtig: D4-Leim, A2-Schrauben, MDF MR, AW 100, alles vor der Montage versiegeln.
- Bauablauf Reduit mit konkreten Tablarhöhen ab Boden, Messen auf drei Höhen, Leitungssucher.

---

## 3. Vorschlag: nur sinnvolle Varianten

Zwei Modelle wurden unabhängig ausgearbeitet: **feste Bauweisen** (top-down) und ein **Regelwerk** (bottom-up). Meine Empfehlung ist eine Kombination: **Bauweisen vorne, Regeln dahinter.**

**Warum Bauweisen vorne:** Ein Laie entscheidet «wie baue ich», nicht «welche Verbindung zu welcher Stärke». Eine Bauweise bündelt Materialklasse, Stärken, Verbindung, Rückwand, Beschläge, Oberfläche und Niveau zu einer geprüften Kombination. Frei bleiben Masse, Aufteilung und die Optik innerhalb der Bauweise. Das trifft das Versprechen «macht Sinn und ist DIY» am direktesten und senkt die Korpusvarianten beim Sideboard von 448 auf 28, beim Reduit von 1428 auf 254. Vom heutigen Zufall lägen beim Sideboard 281 von 400 Würfen ausserhalb.

**Warum Regeln dahinter:** Auch innerhalb einer Bauweise bleibt Geometrie, die geprüft werden muss: Spannweiten, Tür, Tiefen, Bodenabstand, Eckfach, Schraubenlängen. Dafür eine Tabelle `REGELN` mit einer Funktion `pruefeRegeln(d)`, die Formular, Berechnung und `zufall()` gemeinsam nutzen. Sie ersetzt den `HARMLOS`-Regex und liefert je Option «gesperrt mit Grund», «angepasst» oder «Warnung».

**Grundsatz:** Eine Bauweise wird erst angeboten, wenn die Konstruktionsfehler behoben sind, von denen sie abhängt. Sonst verspricht sie mehr, als sie hält (Beispiel Pfostenrahmen).

### 3.1 Sideboard: 5 Bauweisen und der Zusatz «Bad»

| ID | Bauweise | Material | Stärke Korpus / Front | Verbindung | Rückwand | Oberfläche | Grenzen |
|---|---|---|---|---|---|---|---|
| S1 | Sperrholz geölt | Birke Premium/Standard, Sperrholz Fichte, Dreischicht | 18/19 · Front gleich oder MDF 16/19 lackiert | Taschenloch | MDF weiss 3, Hartfaser 3, Pappel 5 | Öl; Farbe nur mit Isoliergrund | Fach ≤ SPAN (Birke 800, Sperrholz Fichte 700, Dreischicht 650) |
| S2 | MDF lackiert | MDF roh (Bad: MDF MR) | 19 · MDF 16/19 | Dübel 8 × 40, verleimt | MDF weiss 3 | Grundierung + Möbellack vor dem Zusammenbau | Fach ≤ 550 mm |
| S3 | Weiss beschichtet, zerlegbar | Spanplatte weiss | 19 · Spanplatte oder MDF lackiert | Exzenter für 16–19 mm | MDF weiss 3, Hartfaser 3 | Kantenband, nicht schleifen, keine Farbe | Fach ≤ 500 mm, nicht im Bad |
| S4 | Massivholz geölt | Leimholz Eiche, Leimholz Fichte | 18 · Leimholz bis 900 mm Türhöhe, darüber Dreischicht 19 | Dübel 8 × 40, verleimt | Pappel 5, MDF weiss 3 | Öl, Eiche nie lackieren | Maserung immer einhalten; Fach ≤ Eiche 700, Fichte 600 |
| S5 | Sperrholz sichtbar verschraubt | Birke Premium, Sperrholz Fichte, Dreischicht | 18/19 · wie S1 | Senkkopf 4 × 50, Durchgang Ø 4,5 | wie S1 | Öl | Deckel zwischen den Seiten; nicht im Bad |
| Bad | Zusatz zu S1 (Birke), S2 (MDF MR), S4 (Eiche) | – | wie Grundbauweise | + Leim D4, Schrauben A2 | nur Pappel 5, beidseitig lackiert | PU-Lack, 3 Schichten, vor der Montage | – |

Für alle: Fachzahl aus `maxSpan(mat, t)` vorbelegt; Schiebetüren nur 16–19 mm Front, Türzahl an die Fächer gekoppelt, vordere Lochreihe bei slideSet + 40; Kippschutz ab H > 1000 als eigener Schritt.

### 3.2 Reduit: 6 Bauweisen

| ID | Bauweise | Tablarmaterial | Tragwerk | Wand | Grenzen |
|---|---|---|---|---|---|
| R1 | Leisten | Platten ab 15 mm und ganze Bretter, kein MDF | Wand- und Endleisten aus Dachlatte 24 × 48; bei L/U Eckstütze 45 × 45 | Beton/Backstein, Gipskarton | Jedes freie Feld ≤ SPAN (mit Eckstütze gerechnet), sonst nicht wählbar mit Verweis auf R2; unterstes Tablar ≥ 60 mm |
| R2 | Pfostenrahmen | wie R1, zusätzlich MDF 19 und Spanplatte 19 | Pfosten vor der Querlatte, Tablare rechteckig, Eckpfosten an jeder Innenecke, Pfosten ≤ 1200 mm auseinander, alles verschraubt | beide | Tablartiefe ≤ SPAN |
| R3 | Wandschienen | wie R1 | Element-System; Tablar ab 2 mm vor der Schiene; Schrauben 4 × 16 | nur Beton/Backstein | Tiefe 264–484 mm; kein Schienenstück unter 500 mm |
| R4 | Tablarwinkel | wie R1 | Blechkonsolen, langer Schenkel an der Wand | nur Beton/Backstein | Tiefe ≤ 375 mm; unterstes Tablar ≥ Wandschenkel + 10 mm |
| R5 | Wangen mit Lochreihe | Sperrholz Birke/Fichte 18, Dreischicht 19 | Wangenhöhe = oberstes Tablar + t + 50; je Feld unterstes Tablar fest; am freien Ende auch das oberste | beide | Eckfach ≥ 350 mm offen, sonst leer |
| R6 | Selbststehende Module | Sperrholz/Dreischicht (Taschenloch), Spanplatte weiss/MDF 19 (Exzenter) | Korpusmodule mit Pflicht-Rückwand; ab 1400 mm ein fester Mittelboden; Kippsicherung beim Aufstellen | beide | Eckmodul ≥ Seitentiefe + 360 mm, sonst Eckquadrat leer; Modul ≤ Türhöhe − 50 |

Für alle: Tablare ≥ 15 mm; Seitentiefe ≤ hintere Tiefe + 100; bei Tür nach innen Tiefe hinten ≤ Raumtiefe − Türbreite − 50 und Bandseite nur kürzen, wenn das Regal tiefer ist als Wandstück − 110 mm; Reststücke unter 400 mm weglassen; Türlage und Türhöhe als neue Eingaben.

### 3.3 Was wegfällt (Auszug, vollständig im Bauweisen-Papier)

- Sideboard-Korpus 12 mm (Bohrungen brechen durch) und 21–27 mm (Drehtür-Aufschlag nicht erreichbar); 15 mm und 16 mm als Vereinfachung. Seekiefer fällt beim Sideboard damit ganz weg.
- OSB als Sideboard-Korpus und -Front.
- «Verschraubt» mit Spanplatte, OSB oder Leimholz; Taschenloch in Eiche; Exzenter ausserhalb 16–22 mm.
- «Keine Rückwand» bei Türen und bei hohen Modulen; Spanplatte im Bad; Farbe auf Spanplatte, OSB und Eiche.
- Reduit-Tablare 12 mm; Leisten aus Plattenstreifen; Schienen und Winkel auf Gipskarton ohne Ständerraster; Wangen und Module unter 18 mm, aus OSB, Spanplatte (Wangen) oder ganzen Brettern; Module ohne Rückwand.

### 3.4 Sofort gültige Sperren (auch ohne Bauweisen)

Diese Regeln aus dem Regelwerk lassen sich einzeln und sofort einbauen, weil sie klare Konstruktionsfehler verhindern:

| Regel | Wirkung |
|---|---|
| S01 | Sideboard-Korpus erst ab 15 mm |
| S04 | Exzenter nur 15/16–22 mm, Dübel und Schrauben ab 15 mm (auch selbststehend) |
| S05, S06 | «Verschraubt» nicht mit OSB und Leimholz |
| S07, S08 | Rückwand Pflicht bei Türen und bei Modulen über 1200 mm |
| S09 | Bad: keine Spanplatte, keine MDF-/Hartfaser-Rückwand |
| S10 | Drehtüren nur bis 21 mm Korpus |
| S13 | Leimholz: Maserung immer einhalten |
| S14, S15 | Tiefe bei Tablarwinkeln ≤ 375, bei Wandschienen ≥ 260 |
| S16 | Schienen und Winkel auf Gipskarton nur mit Ständerraster |
| S17 | Pfostenrahmen vorläufig sperren, bis er umgebaut ist |
| K14 | Tür nach innen: Tiefe hinten ≤ Raumtiefe − Türbreite − 50 |

### 3.5 Formular, Zufall, Sammlung

- **Reihenfolge im Formular:** Rahmen (Masse, Raum, Tür, Wandart, Einsatzort) → **Bauweise** (Karten, unpassende ausgegraut mit sichtbarem Grund) → Form → Tablare bzw. Aufbau → Front → Optik (Material innerhalb der Bauweise, Farbe, Rückwand) → Platten & Preise. Die Gruppen «Verbindung» und «Niveau» entfallen; beides steht auf der Bauweise-Karte.
- **Zufall:** würfelt zuerst eine zulässige Bauweise, dann nur freie Felder aus deren Listen, geprüft mit `pruefeRegeln`. `SB_MATS`, `RD_MATS`, die Stärken- und Verbindungsfilter und `HARMLOS` fallen weg.
- **Sammlung:** `bauweiseVon(d)` ordnet alte Einträge zu (Einsatzort → Material → Verbindung). Beim Laden: «An Bauweise anpassen» (mit Liste der Änderungen und neuen Kosten) oder «Unverändert ansehen» (mit harten Warnungen). Gespeichert wird erst die angepasste Fassung.

---

## 4. Vorgehen

1. **Pfostenrahmen** sperren (S17) oder gleich umbauen: Pfosten vor die Querlatte, Eckpfosten, Verbindungen, Pfostenabstand ≤ 1200, neuer Bauablauf. Ebenso Stützen an freien Enden und Stössen vor das Tablar.
2. **Schraubentabelle** `screwFor` und Kaufteile je Länge.
3. **Sofort-Sperren** aus 3.4.
4. **Geometrie:** Tür-Schwenkkreis, Bandseite, Wangenhöhe, Bodenabstand bei Tablarwinkeln, Tablar vor der Schiene, Eckstütze bei Leisten, Eckfach bei Wangen und Modulen, Plattenformat nicht mehr kappen.
5. **SPAN** nach `shared.js`, Sideboard rechnet mit `maxSpan(mat, t)`.
6. **Anleitung** ergänzen (Lochreihen und Verbindung bei Modulen, Kippschutz, Reihenfolge an der Ecke, Ölen vor der Montage).
7. **Bauweisen-Schicht**, Formular, Zufall, Migration der Sammlung.
8. **Tests:** keine Überschneidung von Holz und Metall über Form × Bauweise × Material; Auflager an jeder Innenecke; keine Box unter dem Boden; Schrauben lassen mindestens 3 mm Holz über der Spitze; 400 Zufallswürfe ohne Regelverstoss; beide Standardformulare ohne Warnung.

## 5. Entscheide bei dir

- **Pfostenrahmen:** Variante A (Pfosten vor der Querlatte, Tablare rechteckig, Durchgang je Seite 45 mm schmaler) oder B (Ausklinkung 45 × 69 mm und neue Reihenfolge). Empfehlung A.
- **Eingrenzung:** Bauweisen vorne mit Regeln dahinter (Empfehlung) oder nur Regeln bei freier Auswahl. Achtung: Ein Materialfilter wurde früher verworfen (WEITERARBEIT «Ideen»). Hier folgt der Filter aus der Konstruktion, nicht aus der Optik – das müsstest du neu entscheiden.
- **Exzenter bei 15 mm:** sperren oder warnen (Minifix 15 ist vom Hersteller zugelassen, 3 mm Rest).
- **Schwellen:** Eckfach-Öffnung 350 mm; Seiten laufen durch ab + 100 mm Tiefe; Zargenzugabe 60 mm.
- **Sideboard ohne Seekiefer:** Folge der Korpus-Untergrenze 18 mm.
- **Neue Eingaben:** Türlage und Türhöhe beim Reduit.
- **Reduit-Standard:** Heute meldet schon der Standard Warnungen. Vorschlag: Wandschienen mit gapTop 350 und Sperrholz Fichte 18, oder nach dem Umbau der Pfostenrahmen.

## Grenzen dieser Prüfung

- Durchbiegungen sind Näherungen (Balken- und Plattenmodell, Kriechfaktoren), keine Bemessung nach Norm.
- Die Schienentiefe 12 mm ist die Annahme des Codes, nicht am Produkt gemessen. Scharnierdaten stammen aus einem Blum-Datenblatt; andere Hersteller weichen ab.
- Kaufteilpreise sind teils geschätzt (`est` in `preise.js`); Kostenvergleiche sind Richtwerte.
- Die Belege nennen Prüfskripte (`skripte/…`). Sie liegen in `docs/review/skripte/` und laufen mit `node docs/review/skripte/<name>.js` gegen den aktuellen Code – nach Korrekturen eignen sie sich zum Nachprüfen.
