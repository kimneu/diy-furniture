# Task 2 – Bericht: Mobile-Native-Paket (A2)

Status: DONE_WITH_CONCERNS. Alles ist umgesetzt wie verlangt. Bei der Favicon-Abfrage in der Prüfung weiche ich bewusst vom Brief ab, siehe «Abweichungen» 1.

Commits auf `ux-review`, nicht gepusht:
- `189fb04 Handy: Mobile-Native-Paket (16 px, Manifest, Ortsknöpfe)`: genau die 9 Dateien aus Step 9
- `e854128 Weiterarbeit: iPhone-Prüfung A2`: nur `docs/WEITERARBEIT.md`

Nicht im Commit: `tools/ui-shots` und `tools/node_modules`.

## Umgesetzt (je Step)

- **Step 1:** `PRUEFUNGEN.a2` in `tools/ui-pruefung.mjs` direkt nach `a1`, darüber eine Kommentarzeile im Stil von `t0`/`a1`. Die Prüftexte im Brief haben kein «a2: »-Präfix, ich musste also nichts entfernen. Abweichung beim Favicon-Fetch: siehe unten.
- **Step 3:** 7 Kopf-Tags direkt nach `<meta name="description">`, Werte und Reihenfolge exakt wie im Brief (favicon.ico mit `sizes="32x32"` vor icon.svg). Dazu `color-scheme:light;` als erste Deklaration in `:root{`, auf eigener Zeile wie die übrigen Deklarationen. Die dunklen Zweige setzen weiterhin `dark`.
- **Step 4:** `icon.svg` wörtlich aus dem Brief. `tools/icons.mjs` ist ESM mit Patchright, Chrome headless, Viewport px×px, `setContent` mit dem verlangten Stil, `page.screenshot()` mit DPR 1. Das Root findet das Skript über `fileURLToPath(new URL('..', import.meta.url))`. Den ICO-Kopf baut es wörtlich nach Brief. Einmal ausgeführt. `file` zeigt:
  - `favicon.ico: MS Windows icon resource - 1 icon, 32x32 with PNG image data, 32 x 32 …`
  - `apple-touch-icon.png: PNG image data, 180 x 180`, `icon-192.png: … 192 x 192`, `icon-512.png: … 512 x 512`

  Angesehen habe ich das 512er und das 180er Bild: weisses Möbel auf vollflächigem Petrol `#2D5D6C`, zentriert, ohne Rundung. `app.webmanifest` ist wörtlich aus dem Brief, JSON gültig.
- **Step 5:**
  - `inputmode="numeric"` direkt nach `value="…"` an `#nicheLW`, `#nicheLH`, `#nicheRW`, `#nicheRH`, `#sheetL`, `#sheetB` und `#price`, `inputmode="decimal"` an `#kerf`. ids und names sind unverändert.
  - Im Touch-Block: `.num input{padding-block:10px;font-size:16px}` und direkt darunter `select,.coll input,.copybox{font-size:16px}`.
  - Am Namensfeld in `renderColl` hängt `enterkeyhint="done"`.
  - Nach dem change-Handler von `#collList` sitzt ein `keydown`-Handler: Bei `Enter && !isComposing && target.matches('input')` ruft er `preventDefault()` und `blur()`. Er speichert nicht selbst, mit einer deutschen Kommentarzeile.
- **Step 6:**
  - Nach `*{box-sizing:border-box}`: die `html`-Regel (Tap-Highlight, text-size-adjust) und `html,body{overscroll-behavior-y:none}`.
  - Die alte Tap-Highlight-Liste `.seg label,.card,…` ist gelöscht.
  - `.controls{…;overscroll-behavior:contain}`.
  - `-webkit-backdrop-filter` steht vor `backdrop-filter` bei `.vbtn` (6px) und `.mbar` (10px).
  - Die Querformat-Regel mit Kommentar steht nach dem Block `@media (max-width:640px)` und vor «/* Teiletabelle als Karten», also nach `.viewer{position:sticky}`.
  - Die user-select-Regel mit Kommentar steht nach `@container ergebnis` und vor `@media (prefers-reduced-motion:reduce)`, also nach allen `all:unset`-Regeln.
- **Step 7:** `.mnav button` ist wörtlich ersetzt: border-box, `padding:12px 2px`, `min-height:44px`, `line-height:20px`, Übergang `color 150ms ease,background-color 150ms ease,transform 160ms var(--ease-out)`. Nach `[aria-current="page"]` folgen `:active{transform:scale(.97)}` und `:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}`, alles im Block `@media (max-width:920px)`.
- **Step 8:** Läufe siehe unten.
- **Step 9:** Commit wie im Brief.
- **Step 10:** In `docs/WEITERARBEIT.md` steht der neue Abschnitt «### iPhone-Prüfung A2» im UI/UX-Review-Teil, nach «Nächste Schritte»: eine Zeile für die iOS-Version (Global Constraints) und die 8 Punkte aus dem Brief, je mit «– offen» zum Ersetzen durch Ja/Nein. Separat committet mit der Nachricht aus dem Brief. Die Prüfung am iPhone selbst macht Kim.

Den Block `@media (prefers-reduced-motion:reduce)` habe ich nicht angefasst, wie der Brief verlangt. Das Druck-Feedback bleibt also wie bisher: Unter reduced motion schaltet `:active{transform:none!important}` das Einsinken ab, auch bei den Ortsknöpfen. Für A4 ist der Block unverändert und lässt sich erweitern.

## Abweichungen vom Brief

1. **Favicon-Fetch in `a2`: `fetch('favicon.ico?pruefung')` statt `fetch('favicon.ico')`.**
   - Was passiert: Der erste rote Lauf mit dem Code wörtlich aus dem Brief brach die ganze Prüfung ab: `FEHLT a2: Abbruch – page.evaluate: TypeError: Failed to fetch` (0 ok, 1 FEHLT).
   - Ursache (in `tools/node_modules/patchright-core/lib/coreBundle.js` nachgelesen): Patchright markiert jede Anfrage, deren URL auf `/favicon.ico` endet, als `_isFavicon`. Solche Anfragen bricht `requestStarted` sofort ab (`route.abort("aborted")`).
   - Das gilt auch für einen `fetch()` der Seite, in der isolierten Welt und in der Hauptwelt (`ctx.haupt`), mit und ohne vorhandene Datei (gemessen mit einer Wegwerf-Prüfung). `icon.svg`, `/` und unbekannte Dateien liefern normal 404 oder 200.
   - Lösung: Mit der Query `?pruefung` endet die URL nicht mehr auf `/favicon.ico`. `python3 -m http.server` ignoriert die Query und liefert dieselbe Datei. Gemessen: ohne Datei `404`, mit Datei `200`.
   - Im Code steht ein Kommentar mit der Begründung. Der Prüftext ist unverändert, und der erwartete Wert ist weiter `200 0,0,1,0`.
   - Das ist die Unzuverlässigkeit, die der Plan-Prüfer erwähnt hatte. Der Brief nennt keine Alternative, darum habe ich diesen kleinsten Eingriff gewählt.
2. Sonst keine. `color-scheme:light;` steht in `:root{` auf eigener Zeile statt auf der Zeile von `:root{`, wegen des mehrzeiligen Stils. Der Inhalt ist gleich.

## Tests und Ergebnisse

**Step 2, rot** (Prüfung geschrieben, `index.html` noch auf `9cb2bbf`, mit Favicon-Query):
```
$ node tools/ui-pruefung.mjs a2; echo "exit=$?"
FEHLT a2: theme-color hell/dunkel (–)
FEHLT a2: meta color-scheme «light dark»
FEHLT a2: link rel=icon favicon.ico + icon.svg (–)
FEHLT a2: favicon.ico lädt, ICO-Kopf (404 )
FEHLT a2: PNG-Icons 180/192/512 (0/0/0)
FEHLT a2: Manifest lädt: Martylko, standalone, start_url ./
FEHLT a2: Manifest-Icons laden (–)
FEHLT a2: -webkit-backdrop-filter vor jedem backdrop-filter (0/2)
FEHLT a2: Eingaben ≥ 16 px (#w 14, select 15)
FEHLT a2: inputmode an allen Zahlfeldern (fehlt: nicheLW,nicheLH,nicheRW,nicheRH,sheetL,sheetB,kerf,price)
FEHLT a2: #kerf inputmode decimal
FEHLT a2: Tap-Highlight transparent (blitzt: html, .mnav button, .wahlbtn, .lock, .gh, .linkbtn)
ok a2: Ortsknöpfe 44 px (44/44/44/44)
FEHLT a2: Ortsknopf-Übergang (all)
FEHLT a2: user-select auf Bedienelementen, nicht auf body (auto/auto/auto/auto)
FEHLT a2: overscroll html y none, x auto, .controls contain (auto/auto/auto)
FEHLT a2: Ortsknopf :active scale(.97)
FEHLT a2: Ortsknopf :focus-visible Ring innen
FEHLT a2: color-scheme folgt System (normal/dark)
FEHLT a2: Bühne quer static, hoch sticky (sticky/sticky)
FEHLT a2: Namensfeld enterkeyhint done, 15 px
FEHLT a2: Enter im Namensfeld: Tastatur zu, Name gespeichert ({"fokus":true,"gespeichert":true})
1 ok, 21 FEHLT
exit=1
```
Das entspricht dem Brief: alles FEHLT ausser «Ortsknöpfe 44 px», und favicon zeigt «404».

**Step 8, grün:**
```
$ node tools/ui-pruefung.mjs a2      → 22 ok, 0 FEHLT, exit 0
$ node tools/ui-pruefung.mjs t0 a1 a2; echo "exit=$?"
ok t0: … (5 ok)
ok a1: … (11 ok, darunter «Formular-Ende über der Leiste (704/735)», unverändert gegenüber A1)
ok a2: theme-color hell/dunkel ((prefers-color-scheme: dark)=#131A1C (prefers-color-scheme: light)=#EDF0EE)
ok a2: meta color-scheme «light dark»
ok a2: link rel=icon favicon.ico + icon.svg (favicon.ico icon.svg)
ok a2: favicon.ico lädt, ICO-Kopf (200 0,0,1,0)
ok a2: PNG-Icons 180/192/512 (180/192/512)
ok a2: Manifest lädt: Martylko, standalone, start_url ./
ok a2: Manifest-Icons laden (200,200,200)
ok a2: -webkit-backdrop-filter vor jedem backdrop-filter (2/2)
ok a2: Eingaben ≥ 16 px (#w 16, select 16)
ok a2: inputmode an allen Zahlfeldern (fehlt: –)
ok a2: #kerf inputmode decimal
ok a2: Tap-Highlight transparent (blitzt: –)
ok a2: Ortsknöpfe 44 px (44/44/44/44)
ok a2: Ortsknopf-Übergang (color, background-color, transform)
ok a2: user-select auf Bedienelementen, nicht auf body (none/none/none/auto)
ok a2: overscroll html y none, x auto, .controls contain (none/auto/contain)
ok a2: Ortsknopf :active scale(.97)
ok a2: Ortsknopf :focus-visible Ring innen
ok a2: color-scheme folgt System (light/dark)
ok a2: Bühne quer static, hoch sticky (static/sticky)
ok a2: Namensfeld enterkeyhint done, 16 px
ok a2: Enter im Namensfeld: Tastatur zu, Name gespeichert ({"fokus":false,"gespeichert":true})
38 ok, 0 FEHLT
exit=0

$ node --test
ℹ tests 198
ℹ pass 198
ℹ fail 0
```

**Step 8.4, Sichttest:** In `tools/ui-shots/a2-handy-sammlung.png` sind Leiste und Namensfeld «Prüfung Enter» vollständig sichtbar, nichts ist abgeschnitten.

Dazu kam eine Wegwerf-Messung vorher/nachher (HEAD `9cb2bbf` als `git archive` in /tmp gegen den Arbeitsbaum, Handy 390×844, je Fall ein neuer Kontext; inzwischen gelöscht):

| Messung | vorher | nachher |
|---|---|---|
| `#mbar` Höhe / oben (Sideboard) | 109 / 735 | 109 / 735 |
| `.mnav button` Höhe | 44 ×4 (content-box 28 + 16) | 44 ×4 (border-box) |
| `.num input` Schrift / Höhe | 14 px / 41 | 16 px / 44 |
| `.num input` Breite (normal / wide) | 62 / 56 | 62 / 56 |
| Text in den Zahlfeldern läuft über | nein | nein (scrollWidth = clientWidth bei allen 9 Sideboard- und 19 Reduit-Feldern, inkl. «88.95», «1300») |
| `select` Schrift / Höhe | 15 px / 44 | 16 px / 44 |
| `#cfg` Höhe Sideboard / Reduit mit 2 Nischen | 3782 / 3812 | 3803 / 3857 (+3 px je Zahlfeld) |
| Namensfeld Sammlung Schrift / Höhe / li | 15 px / 31 / 167 | 16 px / 32 / 169 |

Ich habe die Bilder «Platten & Preise» und «Nische» (Reduit) vorher und nachher verglichen. Die Zahlen sind etwas grösser, das Layout bleibt gleich, nichts ist abgeschnitten.

## Geänderte Dateien

- `/home/kim/repo/diy-furniture/index.html`
- `/home/kim/repo/diy-furniture/app.webmanifest` (neu)
- `/home/kim/repo/diy-furniture/icon.svg` (neu)
- `/home/kim/repo/diy-furniture/favicon.ico` (neu, 489 B)
- `/home/kim/repo/diy-furniture/apple-touch-icon.png` (neu, 1854 B)
- `/home/kim/repo/diy-furniture/icon-192.png` (neu, 1995 B)
- `/home/kim/repo/diy-furniture/icon-512.png` (neu, 5152 B)
- `/home/kim/repo/diy-furniture/tools/icons.mjs` (neu)
- `/home/kim/repo/diy-furniture/tools/ui-pruefung.mjs` (`PRUEFUNGEN.a2`, 22 Prüfungen)
- `/home/kim/repo/diy-furniture/docs/WEITERARBEIT.md` (Abschnitt «iPhone-Prüfung A2»)

## Selbstprüfung

- **Vollständigkeit:** Alle Tags, Deklarationen, Attribute und der JS-Handler aus «Produces» sind drin. Alle 22 `pruefe` aus dem Brief sind in `a2` (Vergleich Zeile für Zeile). `git diff --numstat` von `index.html`: 35 Zeilen dazu, 15 entfernt. Die 15 sind genau die ersetzten oder gelöschten Zeilen aus dem Brief: 7 Inputs, 1 Tap-Highlight-Liste, `.controls`, `.vbtn`, `.mbar`, `.mnav button`, `.num input`, `renderColl`, und eine Zeile ist gelöscht.
- **Qualität:** Kein `transition: all`. Keine neue `:hover`-Regel. Die `.mnav button`-Regeln stehen im Block `(max-width:920px)`. Die user-select-Regel steht nach allen `all:unset`-Regeln, das hat die Prüfung bestätigt (none/none/none/auto). Kein ß in neuen Zeilen. Kommentare auf Deutsch.
- **Disziplin:** Reduced-motion-Block unverändert, kein weiteres CSS, keine Änderung an ids und names. Die Wegwerf-Skripte (`tools/dbg.tmp.mjs`, /tmp) sind gelöscht. Kein fremder `http.server` läuft mehr von mir.
- **Tests:** Rot 1 ok / 21 FEHLT wie erwartet, grün 38/38 (t0 a1 a2), `node --test` 198/198.

## Bedenken und Hinweise

1. **Favicon-Abfrage:** Abweichung 1 oben. Ohne die Query bricht `a2` in Patchright immer ab, auch wenn die Datei vorhanden ist. Spätere Prüfungen, die `/favicon.ico` direkt laden, laufen in dieselbe Falle. `ctx.fehler` blendet `/favicon.ico` schon aus, das ist konsistent.
2. **Teilprüfung «Name gespeichert» unterscheidet in Chromium nicht:** Im roten Lauf war `gespeichert` schon `true`, weil Chromium bei Enter in einem Textfeld selbst ein `change` auslöst. Der Fokus-Teil (`fokus:false` erst mit dem neuen Handler) ist der eigentliche Nachweis. Ob iOS bei «Fertig» ebenso speichert, zeigt erst Punkt 8 am iPhone.
3. **Bekannter Zustand, nicht von A2:** Am Handy mit Reduit ist das Layout-Viewport 434 statt 390 px breit, vor und nach A2 gleich. Ursache ist das `dl.summary` im Kopf: Die Zeile «Platten» (dt/dd, `div.wide`) reicht bis 434 px, deshalb wird auch `#mbar` 434 breit. `a1` prüft das Querscrollen nur mit dem Sideboard. A3 baut den Kopf und das Steckbrief-`dl.summary` um und sollte das beheben. Bitte dort mit Reduit nachmessen.
4. **Nur am iPhone prüfbar** (Liste in `docs/WEITERARBEIT.md`):
   - Fokus-Zoom und Komma-Tastatur bei «Schnittfuge» (`decimal`)
   - Tap-Blitz und spürbares Einsinken
   - theme-color: neuere iOS-Versionen ignorieren es eventuell
   - Home-Bildschirm-Icon und standalone (getrennter Speicher)
   - Gummiband am Seitenanfang und Pull-to-Refresh (`overscroll-behavior-y` erst ab iOS 16)
   - Bühne im Querformat
   - «Fertig»-Taste schliesst die Tastatur

   `-webkit-backdrop-filter` wirkt nur auf iOS vor 18, Chromium prüft nur den Quelltext.
