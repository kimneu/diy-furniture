# Task 1 – Bericht: Doctype und Dokumentgerüst (A1)

Status: DONE_WITH_CONCERNS (Funktion wie verlangt; eine kleine Abweichung vom wörtlichen Prüfcode, siehe «Abweichungen»)

Commit: `9cb2bbf Doctype: Standards Mode und lang de-CH` auf `ux-review`, nicht gepusht. Nur die drei Dateien aus Step 7, keine `tools/ui-shots`, keine `tools/node_modules`.

## Umgesetzt

- **Step 1:** `PRUEFUNGEN.a1` in `tools/ui-pruefung.mjs` direkt nach `t0` eingefügt, Code wie im Brief, dazu eine Kommentarzeile im Stil von `t0`.
- **Step 3:** `index.html` an genau vier Stellen geändert:
  1. Vor `<meta charset="utf-8">`: `<!doctype html>` / `<html lang="de-CH">` / `<head>`
  2. Leerzeile zwischen `</style>` und `<svg width="0" …>` ersetzt durch `</head>` / `<body>`
  3. Nach dem letzten `</script>`: `</body>` / `</html>` (Datei endet mit `\n`)
  4. `table{width:100%;border-collapse:collapse;font-size:14px;line-height:normal} /* normal: Zeilenhöhe wie vor dem Doctype (Quirks Mode) */`

  Prüfbefehl `sed -n '1,4p;279p;496,499p;2284,2286p' index.html` zeigt genau die Zeilen aus dem Brief: 2286 Zeilen, `table{` auf 279, `</style>` 496, `</head>` 497, `<body>` 498, `<svg width="0"` 499, `</script>` 2284, `</body>` 2285, `</html>` 2286. `git diff index.html`: 8 Zeilen dazu, 2 ersetzt, sonst nichts.
- **Step 6:** Satz wörtlich als letzter Punkt in Kapitel 11 von `docs/review/2026-10-02-ux-review.md` (neue Zeile 329).
- **Step 6b:** In `a1`, Desktop-Teil, nach dem Bild `a1-desktop-bauen-*` und vor `d.close()`: `d.setViewportSize({ width:1200, height:640 })`, `ctx.oeffne(d, 'entwerfen')` + `zu(d)`, Mausrad über `.top` (400/30, wie bei 1440×900), dann `scrollY === 0 && getComputedStyle(document.body).overflow === 'hidden'`. Text: «1200×640 – Seite scrollt nicht (scrollY …, body overflow …)».

## Abweichungen vom Brief

1. **Präfix «a1: » aus den Prüftexten entfernt.** Mit dem Code wörtlich aus dem Brief druckt das Skript `FEHLT a1: a1: Standards Mode …`, weil `ctx.pruefe` die id schon selbst voranstellt (`${ok ? 'ok' : 'FEHLT'} ${id}: ${text}`, T0-Vertrag). Die erwarteten Zeilen im Brief (Step 2, «FEHLT a1: Standards Mode (compatMode BackCompat)») und die Texte von `t0` haben kein Präfix. Darum steht in den Texten kein «a1: », sonst ist alles wörtlich. Die Ausgabe entspricht jetzt Zeichen für Zeichen dem Brief. Beim ersten roten Lauf (noch mit Präfix) gab es 3 FEHLT / 7 ok mit doppeltem Präfix. Danach habe ich das Präfix entfernt und neu laufen lassen (unten).
2. **Zählung mit Step 6b:** Der Brief nennt «a1: 10 Prüfungen» (Step 2: 3 FEHLT/7 ok, Step 4: 10 ok). Ohne 6b stimmt das genau. Mit der Prüfung aus Step 6b sind es 11. Ich habe die Steps in der Reihenfolge des Briefs gemacht: Rot- und Grünlauf mit 10 Prüfungen, danach 6b. Danach lief a1 mit 11 Prüfungen noch einmal gegen Quirks (3 FEHLT/8 ok) und gegen Standards (11 ok).

## Tests und Ergebnisse

**Step 2, rot (vor dem Gerüst, Arbeitsbaum = Stand `b8c281c`):**
```
$ node tools/ui-pruefung.mjs a1; echo "exit=$?"
FEHLT a1: Standards Mode (compatMode BackCompat)
FEHLT a1: <html lang="de-CH">
FEHLT a1: Quelltext-Gerüst doctype/html/head/body
ok a1: Desktop 1440×900 scrollt nicht (.app unten 900, scrollY 0)
ok a1: .num input 62 px breit (62)
ok a1: Tabelle Desktop line-height normal
ok a1: .nogl füllt #stage (594/594)
ok a1: Handy ohne Querscrollen (390/390)
ok a1: Formular-Ende über der Leiste (689/735)
ok a1: Tabelle Handy line-height normal
7 ok, 3 FEHLT
exit=1
```
Danach lagen die vier Vorher-Bilder `tools/ui-shots/a1-{desktop,handy}-{entwerfen,bauen}-quirks.png` vor.

**Step 4, grün (nach dem Gerüst, vor 6b):**
```
$ node tools/ui-pruefung.mjs t0 a1; echo "exit=$?"
ok t0: Titel «Martylko»
ok t0: Handy: pointer:coarse, hover:none, 390 px breit (true, true, 390)
ok t0: Handy ohne Fehler
ok t0: Desktop dunkel: prefers-color-scheme dark greift
ok t0: Desktop ohne Fehler
ok a1: Standards Mode (compatMode CSS1Compat)
ok a1: <html lang="de-CH">
ok a1: Quelltext-Gerüst doctype/html/head/body
ok a1: Desktop 1440×900 scrollt nicht (.app unten 900, scrollY 0)
ok a1: .num input 62 px breit (62)
ok a1: Tabelle Desktop line-height normal
ok a1: .nogl füllt #stage (594/594)
ok a1: Handy ohne Querscrollen (390/390)
ok a1: Formular-Ende über der Leiste (704/735)
ok a1: Tabelle Handy line-height normal
15 ok, 0 FEHLT
exit=0

$ node --test
ℹ tests 198
ℹ pass 198
ℹ fail 0
```

**Step 6b, a1 mit 1200×640, gegen beide Modi:**
- Quirks: Kopie von `HEAD` vor dem Commit (`git archive b8c281c`-Stand in `/tmp/a1mess/quirks-root`, Prüfskript dorthin kopiert, `node_modules` verlinkt; das Repo blieb unberührt):
  ```
  FEHLT a1: Standards Mode (compatMode BackCompat)
  FEHLT a1: <html lang="de-CH">
  FEHLT a1: Quelltext-Gerüst doctype/html/head/body
  ok a1: Desktop 1440×900 scrollt nicht (.app unten 900, scrollY 0)
  ok a1: .num input 62 px breit (62)
  ok a1: Tabelle Desktop line-height normal
  ok a1: 1200×640 – Seite scrollt nicht (scrollY 0, body overflow hidden)
  ok a1: .nogl füllt #stage (594/594)
  ok a1: Handy ohne Querscrollen (390/390)
  ok a1: Formular-Ende über der Leiste (689/735)
  ok a1: Tabelle Handy line-height normal
  8 ok, 3 FEHLT
  exit=1
  ```
- Standards (Arbeitsbaum): `node tools/ui-pruefung.mjs t0 a1` → `16 ok, 0 FEHLT`, exit 0 (alle 5 t0 und 11 a1 ok, darunter «ok a1: 1200×640 – Seite scrollt nicht (scrollY 0, body overflow hidden)»).
- Gegenprobe zum Prüfmuster (Wegwerfskript, Standards): 1199×640 → scrollY 800, overflow visible; 1200×639 → scrollY 800, overflow visible; 1200×640 → scrollY 0, overflow hidden, Mauspunkt 400/30 liegt in `.top`. Das Muster erkennt Scrollen also wirklich.
- `node --test` nach 6b und vor dem Commit noch einmal: 198 tests, 198 pass, 0 fail.

## Sichttest (Step 5)

Verglichen habe ich alle vier Bildpaare `tools/ui-shots/a1-<geraet>-<ort>-quirks.png` gegen `…-standards.png`, angeschaut im Bildbetrachter. Dazu kam eine Wegwerf-Messung (`/tmp/a1mess/mess.mjs`, nicht im Repo): Sie hält die Masse fest und vergleicht `getBoundingClientRect` aller 1282 Elemente unter `body`, Quirks (HEAD-Kopie) gegen Standards (Arbeitsbaum), je Ansicht.

| Paar | Befund |
|---|---|
| desktop-entwerfen | Nur (a) und (b). `.top` 71.7 → 75 px (+3.3). Alles in `.layout` liegt 3.3 px tiefer (gerundet 3 oder 4). `.layout`/`.viewer`/`.output` unten unverändert (886/876/886) und darum 3.3 px niedriger. `#stage` bleibt 594 px hoch (530 breit). `#cfg` unten 871 → 886, jetzt bündig mit `.output` (886), vorher 15 px kürzer. Kein Element ändert x oder Breite. Das 3D-Modell ist gleich gross und gleich platziert. |
| desktop-bauen | Wie oben. Dazu `#cutTable` 633 → 633 px, Zeilenhöhen identisch (33/76/75/36), nur 3.3 px tiefer. `td` line-height `normal` in beiden Modi. |
| handy-entwerfen | Kopf `.top` 310.7 → 312.2 px (+1.5). Darum liegt alles darunter 1.5 px tiefer (Bühne 320.7 px hoch, unverändert). `.app` 3218.8 → 3205.3 (−13.5 = «14 px kürzer»). Formular-Ende nach Scrollen ans Ende 689/735 → 704/735, also 31 px über `#mbar`. `#mbar` und Breiten unverändert, kein Querscrollen (390/390). |
| handy-bauen | PNG byte-identisch (`cmp`), alle 1282 Elemente gleich. `#cutTable` 633 px in beiden. |
| 1200×640 (nur gemessen) | Wie Desktop: `.top` +3.3, `#cfg` unten 611 → 626 bündig mit `.output` 626, `#stage` 422.4 px unverändert, `.app` unten 640. |

Gemessene Werte zu den akzeptierten Abweichungen:
- (a) Desktop-Kopf 71.7 → 75 px (Brief: 72→75). Ursache wie im Brief: `dl.summary`, das `dd` des Preises wird 4 px höher (`.summary .price dd b` 22 px). Am Handy bewirkt dieselbe Ursache +1.5 px (Preis-`dd` +2). Am Handy-Bauen ist `.summary` ausgeblendet (`body:not([data-ort="entwerfen"]) .top .summary{display:none}`), darum dort 0 px. Das passt zur Ursache.
- (b) Desktop: `#cfg` endet bündig mit der Ergebnisspalte (886/886; vorher 871, 15 px Quirks-Formularabstand). Handy: Seite 13.5 px kürzer (= −15 Formularabstand + 1.5 Kopf), Formular-Ende 704/735.

Eine andere Abweichung habe ich nicht gefunden. Die +1.5 px am Handy-Kopf nennt der Brief nicht ausdrücklich. Sie stammen aber aus derselben Ursache wie (a), und die «14 px kürzer» aus (b) enthalten sie schon (15 − 1.5). Darum habe ich committet und melde das hier offen.

**Messfalle unterwegs:** Mein erster Messlauf zeigte in Standards Tabellenzeilen von 36/87 px (`td` 21px). Ursache: Auf 8771 (Quirks-Kopie) und 8772 (nur `<!doctype html>`, ohne Tabellen-Fix) laufen noch zwei `python3 -m http.server` aus der Vorab-Messung zum Brief (gestartet 11:00, PIDs 1416217/1416220). Mein Wegwerfserver auf denselben Ports konnte nicht binden. Ich habe die Messung auf freien Ports wiederholt, die Zahlen oben stammen von dort. `tools/ui-pruefung.mjs` nimmt immer einen freien Port und war nicht betroffen. Die fremden Prozesse habe ich nicht beendet (dazu kommen 8765 und 34721).

## Geänderte Dateien

- `/home/kim/repo/diy-furniture/index.html` (Gerüst, 4 Stellen)
- `/home/kim/repo/diy-furniture/tools/ui-pruefung.mjs` (`PRUEFUNGEN.a1`, 11 Prüfungen)
- `/home/kim/repo/diy-furniture/docs/review/2026-10-02-ux-review.md` (Kapitel 11, ein Punkt)

## Selbstprüfung

- Vollständigkeit: alle vier Einfügungen, Prüfcode komplett inkl. 6b, Doku-Satz wörtlich, Bildnamen `a1-{desktop,handy}-{entwerfen,bauen}-{quirks,standards}.png` wie im Brief.
- Disziplin: Kein CSS ausser der `table`-Regel aus dem Brief. `git diff --stat` des Commits: 3 Dateien, +69/−2. Kein ß in neuen Zeilen.
- Tests: Der rote Lauf entspricht genau dem Brief (3 FEHLT mit den drei erwarteten Texten, 7 ok, exit 1). Grün 15/15, nach 6b 16/16. `node --test` 198/198.
- `a1` schliesst jede Seite mit `page.close()`, wie verlangt.

## Offene Punkte / Bedenken

1. Präfix «a1: » in den Prüftexten weggelassen (siehe Abweichungen). Falls der Controller den Code wörtlich will, ist das eine Suche und Ersetzung. Dann druckt das Skript aber «a1: a1: …».
2. Mit 6b hat a1 11 statt 10 Prüfungen (rot 3/8, grün 11). Spätere Briefs oder Reviews, die «10» zählen, betrifft das.
3. Handy-Kopf +1.5 px aus derselben Ursache wie (a), in (b) schon eingerechnet. Wenn Kim das als eigene Abweichung sieht: Es fällt mit `dl.summary` in A3 weg.
4. Fremde `http.server`-Prozesse auf 8765/8771/8772/34721 laufen noch (nicht von mir). Für Wegwerfskripte mit festen Ports sind das Fallen. Aufräumen nur, wenn Kim es will.
