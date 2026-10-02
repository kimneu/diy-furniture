# SDD ledger — plan: docs/superpowers/plans/2026-10-02-ux-stufe-a.md

Spec: docs/review/2026-10-02-ux-review.md (Kapitel 5, 6, 7, 10). Branch: ux-review (Fork kimneu). Base vor Task 0: f6ac650. Modelle: Kim verlangt Opus für alle Agents (Umsetzer und Prüfer).

Ruling: Arbeit in place auf Branch ux-review, kein Worktree — Kims Ablauf ist Branch im Hauptverzeichnis plus Push auf fork; Branch ist nicht main — kostet nichts, wenn falsch: Arbeitsstand bliebe bei Fehler im Hauptverzeichnis sichtbar.
Ruling: Alle Subagents auf Opus (Umsetzer, Prüfer, Re-Review), entgegen «least powerful model» — Kims ausdrückliche Anweisung — kostet mehr Tokens, kein Qualitätsrisiko.

## Vorprüfung (Konflikt-Scan vor Task 0)

| Paar / Task | Produces vs Consumes | Befund | Ruling |
|---|---|---|---|
| T0 ↔ A1 | ctx.oeffne wartet auf #cfg.ready state attached; A1 schliesst offenen Dialog selbst | konsistent | – |
| T0 ↔ A2 | A2 nutzt ctx.handy (pointer:coarse) und page.context().newCDPSession für focus-visible | konsistent; CDP für :focus-visible zulässig | – |
| T0 ↔ A3 | A3 braucht freien Port (parallel laufende http.server) – T0 wählt Port 0 | konsistent | – |
| T0 ↔ A4 | A4 definiert eigene Helfer mitFehlern/fehler/warte statt ctx.fehler | gleichwertig, doppelt | Ruling: Umsetzer darf ctx.fehler aus T0 nutzen oder lokale Helfer behalten; kein Blocker — Kosten: etwas doppelter Prüfcode. |
| T0 ↔ A6 | A6 misst rAF über CDP Runtime.evaluate statt ctx.haupt | gleichwertig | Ruling: beides erlaubt (ctx.haupt bevorzugt) — Kosten: keine. |
| A1 ↔ alle | Zeilenverschiebung +3 (1–493) / +4 (ab 495); Tasks nennen teils pauschal +4 | Anker statt Zeilen vorgeschrieben | Ruling: Anker gelten, Zeilen sind Hilfe — Kosten: keine. |
| A2 ↔ A4 | beide ändern den Block @media (prefers-reduced-motion:reduce) (488–492) | additiv (A2 behält Druck-Feedback; A4 ergänzt Dialog-Blende) | Ruling: A4 erweitert den Block, wie er nach A2 vorliegt; Druck-Feedback bleibt — Kosten: keine. |
| A2 ↔ A3 | A2 Ortsknöpfe 44 px → Leiste ~150 px; A3 Popover-Abstand 160 px setzt das voraus | konsistent in Reihenfolge | – |
| A3 ↔ A4 | A3 entfernt .brand p; A4 Step 8 prüft grep = 0; .js-msg, #bKind bleiben | konsistent | – |
| A3 ↔ A5 | A3 setzt #stage 30svh; A5 verlangt #w y < 700 und ergänzt :has(:focus)-Schrumpfen | konsistent in Reihenfolge | – |
| A4 ↔ A5 | A5 setzt voraus: kein Dialog beim Erstbesuch (A4) | konsistent in Reihenfolge | – |
| A3 ↔ A4 ↔ A5 (konfig.js) | A3: masseText/steckbriefText/preisAufschluesselung; A4: wahlZeile/linkMeldung; A5: SPERREN | verschiedene Bereiche, Export-Zeile 667 wird dreimal ergänzt | – |
| Tests | 198 → 202 (A3) → 204 (A4) → 206 (A5); A6 nennt 206 | konsistent | – |
| A1 selbst | 7 Prüfungen sind vor dem Doctype schon ok (Rückschritt-Wächter), 3 werden rot | Tests prüfen echte Werte, kein leerer Test | – |
| A2 selbst | Reduced-Motion-Umbau nach B5 verschoben, nur Druck-Feedback-Entscheid hier | konsistent mit Spec 7 | – |
| A5 selbst | SPERREN.aufteilung neu; alte Schlösser «aufbau/front» greifen anders | in Plan als offener Entscheid 10 (Vorschlag: akzeptieren) | Ruling: akzeptieren — Kosten: einmalig andere Festhalte-Wirkung für Kim. |

Offene Entscheide 1–13 aus dem Plan: ohne Antwort gilt der Vorschlag (Ruling je Entscheid = Vorschlag des Plans).

## Fortschritt
Task 0: umgesetzt b8c281c (DONE_WITH_CONCERNS: argv-Guard, Object.hasOwn, WEITERARBEIT-Anker 99/118 statt 97/116, fremde http.server-Prozesse), Review-Paket review-f6ac650..b8c281c.diff, Opus-Prüfer dispatcht.
Task 0: Review Spec ✅, Qualität Approved. ⚠️ Screenshots vom Controller gesichtet; node --test 198 laut Umsetzer.
Task 0: minor (deferred): oeffne-Timeout verschluckt Ursache – try/catch um waitForSelector, Fehler aus ctx.fehler anhängen (ui-pruefung.mjs:114/131)
Task 0: minor (deferred): Setup-Fehler (python3 fehlt, Port belegt, Chrome fehlt) enden mit Stacktrace statt FEHLT-Zeile – server.once('error'), .catch am Einstieg
Task 0: minor (deferred): Port-Race zwischen Freigabe und python-Bind (Brief-Vorgabe, Risiko gering)
Task 0: minor (deferred): Netzwerkpfad von ctx.fehler ohne Gegenprobe
Task 0: complete (commits f6ac650..b8c281c, review clean)
Task 1: umgesetzt 9cb2bbf (DONE_WITH_CONCERNS: «a1: »-Präfix aus Prüftexten entfernt weil ctx.pruefe die id schon voranstellt; 11 statt 10 Prüfungen wegen 6b; Handy-Kopf +1.5 px innerhalb der akzeptierten Abweichung), Review-Paket review-b8c281c..9cb2bbf.diff, Opus-Prüfer dispatcht. Fremde http.server-Prozesse in /tmp beendet.
Task 1: Review Spec ✅, Qualität Approved. ⚠️ Sichttest: Desktop-Standards-Bild vom Controller gesichtet.
Task 1: minor (deferred): 6b-Prüfung testet nicht, dass .app bei 1200×640 ins Fenster passt (.app bottom <= 640 ergänzen) (ui-pruefung.mjs:77-78)
Task 1: minor (deferred): Wheel-Punkt (400,30) nicht gegen .top geprüft (elementFromPoint) (ui-pruefung.mjs:65, :76)
Task 1: minor (deferred): Plan-Brief zählt a1 mit 10 Prüfungen, real 11
Ruling: Doppeltes «a1: »-Präfix im Plan war Plan-Fehler (ctx.pruefe stellt id voran); Umsetzer hat es korrekt weggelassen — gilt für alle weiteren Tasks: Prüftexte ohne «<id>: »-Präfix — Kosten: keine.
Task 1: complete (commits b8c281c..9cb2bbf, review clean)
Task 2: umgesetzt 189fb04 + e854128 (DONE_WITH_CONCERNS: favicon-Prüfung holt favicon.ico?pruefung weil Patchright /favicon.ico-Requests abbricht; «Name gespeichert» in Chromium nur über Fokus-Teil beweiskräftig; Reduit-Überlauf 434 px besteht vor und nach A2 → A3), Review-Paket review-9cb2bbf..e854128.diff, Opus-Prüfer dispatcht.
Task 2: Review Spec ✅, Qualität Approved.
Ruling: Reduced Motion schaltet :active-Transform weiterhin global ab (index.html:510), auch für die neuen Ortsknöpfe – Brief verschiebt den Umbau nach B5; Controller-Formulierung «Druck-Feedback bleibt» war ungenau — Kosten: bis B5 kein Druck-Feedback bei reduzierter Bewegung (wie heute).
Task 2: minor (deferred): backdrop-filter-Prüfung zählt nur, prüft Reihenfolge nicht (ui-pruefung.mjs:141-143, plan-mandated)
Task 2: minor (deferred): Favicon-Abort-Eigenheit von Patchright fehlt im Header-Kommentar (ui-pruefung.mjs:13)
Task 2: minor (deferred): .copybox 16px ohne Prüfung (index.html:422)
Task 2: minor (deferred): vorbestehend: .coll input:hover (index.html:280) und .lock:hover (:381) ausserhalb des Hover-Gates → B5
Task 2: minor (deferred): favicon.ico ICONDIRENTRY 32 bpp vs. PNG 24 bit (harmlos)
Task 2: complete (commits 9cb2bbf..e854128, review clean)
Task 3: umgesetzt ed6152b + ca7d5a7 (DONE_WITH_CONCERNS: Leiste 109→133.75 px statt ~150 wie Plan annahm; Abstand Formular-Ende zur Leiste nur noch ~6 px (padding-bottom 140) → Task 5 muss Padding mit Leistenhöhe mitziehen; iPhone: Popover, 30svh, :has-Blende). Kopf Handy 312→57 px, Desktop 75→53.5 px, Reduit scrollWidth 390. Review-Paket review-e854128..ca7d5a7.diff, Opus-Prüfer dispatcht.
Task 3: Review Spec ✅ für Brief, Qualität Needs fixes – 2 Important (Plan-Lücke Zustand «Variante geändert»): (1) Desktop-Kopf 53.5→71.5 px, Label «Als neue Variante» bricht um, .kopfbrief verschwindet bei 921 px, .aufschl top:64 überlappt; (2) Handy-Leiste: Preisspalte kollabiert auf ~18 px, «Als neue Variante» überdeckt Preis.
Ruling: Zustand «geändert» in Stufe A so lösen: Zustandsknopf-Label «Neue Variante» statt «Als neue Variante» (Kopf und Leiste); «Überschreiben» verschwindet aus Kopf und Leiste (bleibt in der Sammlungsliste, B4 entscheidet neu); .hacts .acts nowrap/flex:none; .mprice Spalten auto minmax(0,1fr) mit .mbtns justify-self:end; a3-Prüfungen für den Zustand bei 390, 921, 1440 — Spec 6.7 nennt nur [Sammeln-Zustandsknopf] [Link] in der Leiste — Kosten, wenn falsch: Kim muss zum Überschreiben in die Sammlung, bis B4 den Zustand neu baut.
Task 3: minor (deferred): #mMeta nur 23 px hoch, einziger Weg zur Aufschlüsselung am Handy (index.html:460) → B5/B6 Trefferflächen
Task 3: minor (deferred): .app padding-bottom 140 und Popover bottom 160 fest, Leiste 133.75 px → eine Custom Property --mbar-h (Task 5 beachten)
Task 3: minor (deferred): .mzeile > * overflow:hidden clippt Fokusring von Rückgängig/Zur Sammlung; #mMeta bei Meldung opacity 0 aber fokussierbar
Task 3: minor (deferred): a3 ohne Prüfung Desktop-Popover (öffnen, light dismiss) und Kopf-.js-msg-Blende
Task 3: fix round 1/5 (Fix 325aed5: Label «Neue Variante», Überschreiben aus Kopf/Leiste entfernt, nowrap/flex:none, .mprice auto minmax, .mbtns ellipsis, 6 neue a3-Prüfungen; Kopf 53.5/59 px, Preis frei; Zusatz: .mbtns .btn ellipsis, toter Klick-Handler entfernt) – Re-Review dispatcht über review-ca7d5a7..325aed5.diff
Task 3: minor (deferred): Meldung nach «An Bauweise anpassen» nennt «Speichern mit «Überschreiben»», Knopf gibt es nur noch in der Sammlungsliste → B1 Wörterbuch
Task 3: minor (deferred): bei 320 px bricht «Sammlung (1)» in der Leiste um (+20 px) – nicht gemessen am alten Stand
Task 3: fix round 1/5 (2 addressed, 0 open; commits ca7d5a7..325aed5)
Task 3: minor (deferred): .mbtns justify-self:end macht die Ellipsis-Regel wirkungslos; unter ~300 px Überlappung Preis/Knöpfe – justify-content:flex-end statt justify-self:end (index.html:467-468); Preis ohne Tausendertrenner (:1401)
Task 3: minor (deferred): Zustand «geändert» bei 921–1000 px im .kopfbrief abgeschnitten (134 px); Sammlung-Link unter 1000 px ausblenden würde ~105 px freigeben
Task 3: complete (commits e854128..325aed5, review clean after 1 fix round)
Task 4: umgesetzt 6e908b6 + 9742afc (DONE_WITH_CONCERNS: a4 nutzt ctx.fehler statt lokaler Helfer (erlaubt); Dialog-Schliesser in a1/a2 laufen ins Leere; vorbestehend: Link mit unbekannten Feldwerten wirft in ladeLink (JOINTS[c.joint].level); 641–920 px: Wahl als Modal, nicht Sheet (Brief)). Suite 93 ok, node --test 204. Review-Paket review-325aed5..9742afc.diff, Opus-Prüfer dispatcht.
Task 4: Review Spec ✅, Qualität Approved. ⚠️ Screenshots a4-sheet-handy/a4-erstbesuch-handy vom Controller gesichtet (Sheet bündig unten, Erstbesuch ohne Dialog).
Task 4: minor (deferred, plan-mandated): Desktop: Möbelwahl aus Einkaufen/Bauen-Reiter pusht #entwerfen, Reiter bleibt → toter Zurück-Schritt; Fix: ziel null wenn nicht narrow und nicht Sammlung (index.html:2152-2155)
Task 4: minor (deferred, plan-mandated, vorbestehend): nach Link bleibt alte Variante in der Sammlung als .on markiert – renderColl() statt renderVariante() in ladeLink (index.html:2291)
Task 4: minor (deferred): zwei Schliess-Aktionen in derselben Task → doppeltes history.back() (Flag bis popstate) (index.html:2126-2133)
Task 4: minor (deferred, vorbestehend): Link mit unbekannten Feldwerten wirft still in ladeLink – try/catch → «Link ungültig»-Meldung (index.html:2281-2295)
Task 4: minor (deferred): Reduced-Motion-Prüfung nur letzter Poll; Storage-Key hart statt SPEICHER+'-entwuerfe' (ui-pruefung.mjs:418-429)
Task 4: complete (commits 325aed5..9742afc, review clean)
Ruling: Task 6 läuft parallel zu Task 5 in einem Worktree (/home/kim/repo/diy-furniture-a6, Branch ux-a6 ab 9742afc), weil Kim Tempo will; Code-Bereiche getrennt (A5 Formular/SPERREN, A6 initThree/tick), erwarteter Konflikt nur am Ende von PRUEFUNGEN in tools/ui-pruefung.mjs (a5/a6 anhängen) – Controller führt zusammen, Review A6 auf dem zusammengeführten Stand — Kosten, wenn falsch: ein Merge-Konflikt von Hand, A6-Prüfung muss nach dem Merge nochmals laufen.
Ruling (ersetzt vorheriges): Task 5 war fertig, bevor Task 6 startete – Worktree ux-a6 ohne Commits entfernt; Task 6 läuft direkt auf ux-review ab ae6b65c, parallel zum (lesenden) Review von Task 5 — Kosten, wenn falsch: Prüfer von Task 5 könnte bei einem eigenen Prüf-Lauf halbfertige A6-Änderungen sehen (ist angewiesen, nicht neu zu laufen).
Task 5: umgesetzt ae6b65c (DONE_WITH_CONCERNS: a5-Timeouts 5/10/5 s wegen SwiftShader-Last, p.close() vor jeder Seite, Extra-Bild a5-handy-se.png; «y < 700» schon vor Umbau grün; sechs neue Gruppen-ids). #w y 497 (390), 443 (375×667), #rw 497, Bühne 253→120 px bei Fokus, Leiste 133.75 unverändert. Review-Paket review-9742afc..ae6b65c.diff, Opus-Prüfer dispatcht.
Task 5: Review abgebrochen (Kim macht Schnitt, Maschine wird heruntergefahren) – auf anderem Gerät neu dispatchen: review-package 9742afc..ae6b65c, Brief task-5-brief.md, Bericht task-5-report.md.
Task 6: Umsetzer gestoppt kurz vor dem grünen Lauf; Zwischenstand als Commit 74447d7 auf Branch ux-a6-wip (index.html +36/-5, tools/ui-pruefung.mjs +103). Beim Weiterarbeiten: ux-a6-wip auf ux-review rebasen oder Diff übernehmen, a6 und ganze Suite laufen lassen, dann Review. Bericht task-6-report.md evtl. unvollständig.
SCHNITT 2026-10-02: Stand ux-review = ae6b65c (Tasks 0–5 umgesetzt, 0–4 reviewt). Ledger und Berichte kopiert nach docs/superpowers/plans/2026-10-02-ux-stufe-a-stand/ (beim Fortsetzen zurück nach .superpowers/sdd/2026-10-02-ux-stufe-a/ kopieren; Briefs mit scripts/task-brief neu erzeugen).
