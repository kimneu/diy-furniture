# Task 0 – Bericht: UI-Prüfskript `tools/ui-pruefung.mjs` (T0)

Status: DONE_WITH_CONCERNS (zwei kleine Abweichungen vom Brief, siehe unten; Funktion wie verlangt)

Commit: `b8c281c UI-Prüfung: Prüfskript mit Patchright (t0)` auf `ux-review`, nicht gepusht.

## Umgesetzt

- **Step 1:** `cd tools && npm install` → patchright 1.63.0 (`tools/node_modules/patchright/package.json` vorhanden). `google-chrome --version` → `Google Chrome 154.0.8037.57`. Kein `npx patchright install` nötig, `channel:'chrome'` funktioniert.
- **Step 2:** `.gitignore` Zeile 4 `tools/ui-shots`. `git check-ignore tools/ui-shots/x.png tools/node_modules/x` gibt beide Pfade aus.
- **Step 3:** `tools/ui-pruefung.mjs` (ESM) wie im Brief:
  - Kopfkommentar (Einrichten, Aufruf alle/einzeln, eigener Server auf freiem Port, Bilder in `tools/ui-shots/`, Internet für three.js/Fonts, Exit 1 bei FEHLT, beide Patchright-Eigenheiten).
  - Konstanten `ROOT`, `SHOTS`, `SPEICHER` wörtlich.
  - `PRUEFUNGEN.t0` wörtlich aus dem Brief, `fehlerSammeln` wörtlich.
  - `freierPort`, `warteAuf` (50 × 100 ms), Server `python3 -m http.server <port> --bind 127.0.0.1` mit `cwd:ROOT, stdio:'ignore'`, Browser einmal `chromium.launch({ channel:'chrome', headless:true, args:['--enable-unsafe-swiftshader'] })`.
  - `neueSeite(optionen)`: `newContext` → `addInitScript(fehlerSammeln)` → `newPage`; Netzliste in `WeakMap`, `response` ≥ 400 und `requestfailed`, beide ohne `/favicon.ico`.
  - Volles `ctx`: `handy`, `desktop`, `oeffne`, `pruefe`, `screenshot`, `haupt`, `fehler` (Methoden mit Patchright-Bezug wörtlich aus dem Brief).
  - Schleife je id mit eigenem `ctx`, `catch` → `FEHLT <id>: Abbruch – <erste Zeile>`, `finally` schliesst alle `browser.contexts()`; äusseres `finally` mit `browser?.close()` und `server.kill()`, danach Schlusszeile `<n> ok, <m> FEHLT`, Rückgabe 1/0 als `process.exitCode`.
- **Step 7:** README-Block nach dem Tests-Block, WEITERARBEIT: Zeile nach «- Tests: …» und Tabellenzeile nach `tools/jumbo-preise.mjs`, Texte wörtlich.
- **Step 8:** Commit nur der vier genannten Dateien.

## Tests und Ergebnisse

Gegenprobe (Step 4), `index.html` mit eingefügtem `<script>console.error('gegenprobe')</script>`:
```
$ node tools/ui-pruefung.mjs t0; echo "exit $?"
ok t0: Titel «Martylko»
ok t0: Handy: pointer:coarse, hover:none, 390 px breit (true, true, 390)
FEHLT t0: Handy ohne Fehler: console.error: gegenprobe
ok t0: Desktop dunkel: prefers-color-scheme dark greift
FEHLT t0: Desktop ohne Fehler: console.error: gegenprobe
3 ok, 2 FEHLT
exit 1

$ node tools/ui-pruefung.mjs zz; echo "exit $?"
FEHLT zz: unbekannte Prüfung
0 ok, 1 FEHLT
exit 1
```
Danach `git checkout index.html`, `git status` zeigt `index.html` nicht mehr.

Lauf (Step 5, nach dem letzten Code-Stand nochmals ausgeführt):
```
$ node tools/ui-pruefung.mjs; echo "exit $?"
ok t0: Titel «Martylko»
ok t0: Handy: pointer:coarse, hover:none, 390 px breit (true, true, 390)
ok t0: Handy ohne Fehler
ok t0: Desktop dunkel: prefers-color-scheme dark greift
ok t0: Desktop ohne Fehler
5 ok, 0 FEHLT
exit 0
```
Dauer etwa 7 s (Brief: etwa 20 s). `tools/ui-shots/t0-handy.png` (Handy, hell, Dialog «Was baust du?» über dem 3D-Sideboard, untere Leiste Entwerfen/Einkaufen/Bauen/Sammlung) und `tools/ui-shots/t0-desktop-dunkel.png` (Desktop, dunkles Thema, 3D-Sideboard gerendert, Dialog «Was baust du?») angesehen, beide wie erwartet. `git status --ignored tools` zeigt `tools/ui-shots/` und `tools/node_modules/` nur als ignoriert.

Unit-Tests (Step 6): `node --test` → `tests 198`, `pass 198`, `fail 0`.

Zusätzliche Kontrolle des `ctx`-Vertrags (nicht im Brief verlangt, mit einer temporären Kopie des Skripts mit Zusatzprüfung, danach gelöscht, nichts davon committet):
- `oeffne(p, '?x=1#sammlung')` → URL `http://127.0.0.1:<port>/?x=1#sammlung`, `form#cfg.ready` wird trotz unsichtbarem Formular gefunden.
- `page.evaluate(() => typeof THREE)` → `'undefined'` (isoliert), `ctx.haupt(p, () => typeof THREE)` → `'object'`, `ctx.haupt(p, a => a + 1, 41)` → `42`.
- Nach einem Besuch liegen `sideboard-werkbank-v2-bau`, `-haken`, `-entwuerfe` im Speicher; erneutes `oeffne` ohne `erst` → `#wahl` zu, mit `erst:true` → `#wahl` offen.
- Ausnahme `new Error('absicht\nzweite Zeile')` → `FEHLT kontrolle: Abbruch – absicht`, die folgende Prüfung t0 lief danach normal (Contexts geschlossen).
- Nach jedem Lauf bleibt kein eigener `http.server` übrig.

Patchright 1.63.0 verhält sich wie im Brief beschrieben: Signatur `evaluate(pageFunction, arg, options?, isolatedContext?)` in `patchright-core/types/types.d.ts`, Init-Script läuft in der Hauptwelt (die Gegenprobe zeigt `console.error` aus einem Inline-Script der Seite).

## Geänderte Dateien

- `tools/ui-pruefung.mjs` (neu)
- `.gitignore`
- `README.md`
- `docs/WEITERARBEIT.md`

## Self-Review

- Alle Schritte des Briefs erledigt, `ctx` vollständig (handy, desktop, oeffne, pruefe, screenshot, haupt, fehler), Namen und Texte wie im Brief.
- t0 prüft echte Werte (Titel, Medienabfragen, Breite 390, Fehlerliste leer, dunkles Farbschema); die Gegenprobe zeigt, dass der Fehlersammler greift.
- Keine ß, Kommentare deutsch.

## Abweichungen und Bedenken

1. **Einstiegsbedingung abgesichert:** `if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)`. Ohne den Zusatz wirft der Import ohne Skriptpfad (`node -e "import('./tools/ui-pruefung.mjs')"`, REPL) `TypeError [ERR_INVALID_ARG_TYPE]` in `pathToFileURL(undefined)`. Mit dem Zusatz klappt der Import ohne Start in beiden Fällen (aus `-e` und aus einer Datei). Sonst gleich wie im Brief.
2. **Unbekannte id mit `Object.hasOwn(PRUEFUNGEN, id)`** statt `!PRUEFUNGEN[id]`, damit z. B. `toString` als unbekannte Prüfung gilt und nicht abbricht. Ausgabe wie im Brief.
3. **Zeilenangaben in `docs/WEITERARBEIT.md` stimmen auf dem aktuellen Stand nicht:** Der Brief nennt 97 und 116 (Stand `e5f3fa4`), auf `ux-review` (nach `0d85b4c`/`f6ac650`) stehen die Zeilen auf 99 und 118. Ich habe nach Inhalt eingefügt (nach «- Tests: `node --test` …» und nach der Zeile `tools/jumbo-preise.mjs`), die neuen Zeilen liegen jetzt auf 100 und 120. `README.md:37` stimmte.
4. Auf der Maschine laufen fremde `python3 -m http.server` auf 8765, 8771, 8772 und 34721 (gestartet vor diesem Task, nicht von diesem Skript) und ein headless Chrome des Playwright-MCP. Nicht angefasst.
