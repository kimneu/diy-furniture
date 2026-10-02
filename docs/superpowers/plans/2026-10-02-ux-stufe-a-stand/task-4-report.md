# Task 4 (A4) – Bericht: Erstbesuch ohne Pflichtdialog, Möbel-Wahl als Sheet

Status: DONE_WITH_CONCERNS (nur Hinweise, nichts offen)

## Commits
- `6e908b6` Möbelwahl: Preiszeile und Link-Meldung in konfig.js
- `9742afc` Möbelwahl: kein Pflichtdialog, Sheet am Handy, Wahl führt nach Entwerfen

## Umsetzung je Step
1. `test/konfig.test.js`: die zwei Tests `wahlZeile …` und `linkMeldung …` wörtlich aus dem Brief, direkt nach `ortAusHash: bekannte Orte, sonst Entwerfen`.
2. Rot: `node --test test/konfig.test.js` → 2 fail (`TypeError: K.wahlZeile is not a function`, `K.linkMeldung is not a function`), 25 pass.
3. `konfig.js`: `wahlZeile(entwurf, start)` nach `entwurfSetzen`, `linkMeldung({ erstBesuch, gueltig, angepasst } = {})` nach `planAusCode`, beide mit den Kommentaren aus dem Brief. Export-Zeile: die zwei Namen ans Ende angehängt, also nach `preisAufschluesselung` aus A3: `…, masseText, steckbriefText, preisAufschluesselung, wahlZeile, linkMeldung };`.
4. `node --test`: 204 Tests, 204 pass.
5. Commit `6e908b6`.
6. `PRUEFUNGEN.a4` nach `a3` eingefügt. Den Code aus dem Brief habe ich übernommen, mit einer Abweichung: Statt der lokalen Helfer `mitFehlern`/`fehler` nutzt die Prüfung `ctx.fehler` über den Helfer `ohneFehler`. Der Controller lässt das zu. `ctx.fehler` fängt zusätzlich `console.error`, `unhandledrejection` (wichtig, weil `ladeLink` async ist) und Netzfehler. `warte` mit Abfrage ist geblieben. Dazu kommen die zwei Prüfungen aus Step 15b:
   - «reduzierte Bewegung – Wahl öffnet»: Handy, `emulateMedia({ reducedMotion:'reduce' })`, Tipp auf `#bKind`. Innerhalb von 500 ms muss `dialog#wahl[open]` da sein, mit opacity > 0.9, im Bild und mit `transform` = `none`.
   - «Erstbesuch mit Reduit-Link»: Die Formularwerte des Erstbesuchs (`…-entwuerfe`.sideboard, gleich `DEFAULTS`) liest die Prüfung aus localStorage. Dann rechnet sie in Node `planCode(startwerte(defaults, 'reduit'))` und öffnet `?plan=…#entwerfen` mit `erst:true`. Erwartet: kein `dialog[open]`, `#kindName` = «Reduit», `#dimTag` beginnt mit «Raum», `ctx.fehler` leer.
7. Rot: `node tools/ui-pruefung.mjs a4` → `FEHLT a4: Erstbesuch Handy: kein Dialog offen`, `ok a4: Erstbesuch Handy: Breite (#w) sichtbar`, `FEHLT a4: übrige Prüfungen übersprungen: der Pflichtdialog sperrt die Seite`. Ergebnis 1 ok, 2 FEHLT, Exit 1.
8. `grep -c '<p>Masse eingeben' index.html` → 0. A3 hat den Untertitel schon entfernt, es gibt keine `.brand p`-Regeln mehr.
9. `<p class="wahlsatz">…</p>` steht nach `<h2 id="h-wahl">`.
10. CSS wie im Brief: `.wahl h2` margin-bottom 4px, `.zuletzt` ohne Mono und mit tabular-nums, `.wahlsatz`, die Ein-/Ausblende 200/150 ms mit `@starting-style`, overlay/display allow-discrete samt Backdrop, das Sheet unter 640 px. Im Block `prefers-reduced-motion` steht `.wahl{transform:none!important}` als letzte Zeile. Die Regeln, die dort schon standen, sind unverändert.
11. Möbelwahl-JS: neuer Kommentar, `wahlErst` ist weg. `oeffneWahl()` hat keinen Parameter mehr. `aria-current` folgt immer dem aktuellen Typ, die Preiszeile kommt über `wahlZeile`, `#wahlZu.hidden` ist gestrichen, `pushState` läuft immer. Der `cancel`-Handler ruft `schliesseWahl()`. Der Klick-Handler ist der aus dem Brief: Backdrop-Tipp mit Rechteck-Test, Ziel `entwerfen` bzw. `sammlung`.
12. `ladeLink(code, { erstBesuch = false } = {})` wörtlich aus dem Brief, Kommentar ersetzt. `ladeVariante` ruft `ladeLink` nicht mehr auf. `ladeVariante` selbst bleibt für «Laden» aus der Sammlung.
13. Start: `const erstBesuch = !entwuerfe;   // kein Dialog …` und `if (planLink) ladeLink(planLink, { erstBesuch });`. Der Kontroll-grep `wahlErst|erst:true|oeffneWahl({|Geteilter Entwurf|zuletzt:` findet nichts (Exit 1).
14. Spec `2026-09-26-ansichten-design.md`: Zeilen 71, 72 und 124 ersetzt, wörtlich wie im Brief.
15. Prüfen: siehe unten.
16. Commit `9742afc`, nur `index.html`, `tools/ui-pruefung.mjs` und die Spec. `tools/ui-shots` und `node_modules` sind nicht dabei.

## Tests und Ergebnisse
- `node --test`: 204 Tests, 0 fail (vorher 202).
- `node tools/ui-pruefung.mjs a4`: 22 ok, 0 FEHLT, Exit 0. Das sind die 20 Prüfungen aus dem Brief und 2 aus Step 15b. Messwerte: Sheet unten 844/844, Breite 390/390. Reduzierte Bewegung: transform none, sichtbar nach 243 ms. Reduit-Link: Masstafel «Raum B 1600 · T 1400 · H 2400 mm».
- `node tools/ui-pruefung.mjs` (alle): 93 ok, 0 FEHLT, Exit 0 (t0, a1, a2, a3 und a4).
- Screenshots angesehen:
  - `a4-sheet-handy.png`: Das Sheet sitzt bündig unten über die volle Breite, die oberen Ecken sind rund. Der Satz steht unter dem Titel. Die Karten zeigen «Dein Entwurf · ca. CHF 245» und «ab ca. CHF 545», darunter steht «Schliessen».
  - `a4-wahl-desktop.png`: Die Wahl steht mittig, rund 460 px breit.
  - `a4-erstbesuch-handy.png`: Beim Erstbesuch erscheint das Beispiel-Sideboard ohne Dialog.
- Zusätzlich lief eine eigene Prüfung über eine temporäre Kopie des Skripts (danach gelöscht, nicht committet). Alle 16 Punkte ok:
  - «Schliessen», Zurück (`history.back()`) und Esc schliessen aus Bauen, der Ort bleibt.
  - Ein Tipp in den Innenabstand der Wahl schliesst sie nicht.
  - Zufall Reduit führt nach #entwerfen, mit «Neu gewürfelt.» und Rückgängig.
  - Zurück nach der Wahl führt wieder nach Bauen.
  - «Aus Sammlung laden» führt nach #sammlung.
  - Link bei einem wiederkehrenden Besuch: «Entwurf von Link geladen.» mit Rückgängig, `aktiv` leer, Zustand «Entwurf». Rückgängig holt die vorher geladene Reduit-Variante samt `aktiv` zurück.
  - Ein Link, der von den Regeln abweicht (S1 mit joint `cam`), gibt «… und an die Bauweise angepasst.» mit Rückgängig. `#bwNotice` bleibt verborgen.
  - Auf der Seite gibt es keine Fehler.

## Frühere Prüfungen und der fehlende Erstbesuch-Dialog
Ich musste keine frühere Prüfung anpassen. `a1` (`zu()`) und `a2` (`if (w.open) …click()`) schliessen den Dialog nur, wenn er offen ist. Das läuft jetzt ins Leere und schadet nicht. `a3` (`waehle`) öffnet die Wahl über `#bKind`, wenn sie zu ist. Das ist jetzt immer so. Danach führt der Klick zusätzlich nach #entwerfen, wo `a3` ohnehin steht. `a3` bleibt grün. Den toten Code in `a1` und `a2` habe ich stehen lassen, das war nicht Teil des Briefs.

## Geänderte Dateien
- `konfig.js`
- `test/konfig.test.js`
- `index.html`
- `tools/ui-pruefung.mjs`
- `docs/superpowers/specs/2026-09-26-ansichten-design.md`

## Selbstprüfung
- Die Namen stimmen mit dem Brief überein: `wahlZeile`, `linkMeldung`, `.wahlsatz`, `oeffneWahl()` ohne Parameter, `ladeLink(code, { erstBesuch })`. `.zuletzt`/`data-zuletzt` bleiben.
- Was gut ist, bleibt erhalten:
  - Die Transitions nennen genaue Properties, mit `--ease-out`.
  - Die Dauern sind 200 ms beim Öffnen und 150 ms beim Schliessen.
  - Es gibt kein neues `:hover`.
  - Die History-Anbindung (pushState/popstate) ist unverändert.
  - Die `id`/`name` der Formularfelder sind unverändert.
- Es gibt kein Vokabular aus Stufe B und keine Änderung ausserhalb des Briefs.
- Die Texte sind in Schweizer Rechtschreibung, ohne ß.

## Hinweise und Bedenken
- Abweichung: `ctx.fehler` statt `mitFehlern`/`fehler`, wie oben begründet. Der Controller lässt das zu.
- Step 15b: Die Prüfung der reduzierten Bewegung verlangt zusätzlich `transform: none`. Das belegt, dass die neue Regel im Block greift, nicht nur, dass der Dialog öffnet. Die Blende (opacity 200 ms) bleibt bei reduzierter Bewegung, nur das Gleiten fällt weg, wie es der Brief vorsieht.
- Vorbestehend, nicht in diesem Task: Ein von Hand gebauter Link mit unbekannten Feldwerten (z. B. `joint:'dowel'`) wirft in `computeData` (`JOINTS[c.joint].level`) ein unbehandeltes Promise-Rejection in `ladeLink`. `planAusCode` prüft nur `kind` und `MATS[d.mat]`. Das alte `ladeLink` → `ladeVariante` hatte dasselbe Verhalten. Links aus der App selbst enthalten nur gültige Werte.
- Zwischen 641 und 920 px gilt das Handy-Layout (`narrow`), die Wahl ist dort aber ein mittiges Modal (Brief: Sheet nur unter 640 px). So steht es im Brief, ich halte es nur fest.
- Nur am iPhone prüfbar (Kapitel 10):
  - `@starting-style` gibt es erst ab Safari 17.4. Ohne `overlay` in Safari fehlt nur die Ausblende.
  - Der Backdrop-Tipp schliesst das Sheet.
  - Der Zurück-Wisch schliesst die Wahl.
  - `env(safe-area-inset-bottom)` greift im Sheet.
