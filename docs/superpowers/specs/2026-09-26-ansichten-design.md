# Ansichten und Ablauf des Konfigurators – Design

Datum: 2026-09-26 · Basis: `main` bei `eb3a08b` (PR #6 `formular-ansichten`) · Methode: `/layers-interaction-flow` (Breadboards, Walk the flow)

Nur Ablauf und Orte, keine Gestaltung. Code erst nach diesem Entscheid.

## Job Story

Wenn ich ein Möbel selber bauen will (Sideboard fürs Wohnzimmer oder Regal im Reduit), möchte ich es an meine Masse und meinen Raum anpassen, die Kosten sehen und Varianten vergleichen können. Am Ende will ich mit einer Einkaufsliste in den Baumarkt (Jumbo) und mit Plattenplan und Bauablauf in die Werkstatt.

Meist auf dem Handy (auch im Baumarkt), zum Entwerfen auch am Desktop.

Die Job Story hat drei Situationen: **zu Hause entwerfen**, **im Baumarkt einkaufen**, **in der Werkstatt bauen**. Die Orte folgen diesen Situationen.

## Ist-Zustand (aus dem Code geprüft)

Wie im Prompt `docs/prompts/ansichten-flow.md` beschrieben, dazu:

1. Der Entwurf speichert sich bei jeder Eingabe selbst (`save()` → localStorage `sideboard-werkbank-v2`), der letzte Reiter auch. Beim nächsten Besuch öffnet der letzte Entwurf.
2. Beim Typwechsel bleiben die Gruppen des jeweiligen Typs stehen. Material, Stärke, Rückwand, Verbindung sowie Platten & Preise teilen sich aber beide Typen. `syncMaterials()` ersetzt ein Brett-Material beim Wechsel zum Sideboard. Beim Zurückwechseln kommt es nicht wieder.
3. Es gibt keinen Hash und keine History. Die Zurück-Taste verlässt die Seite, und «Ergebnis ↓» scrollt nur.
4. «Laden» überschreibt den Entwurf ohne Rückgängig. `aktiv` merkt sich nur im Speicher, welcher Eintrag geladen ist. Eine Anzeige «geändert seit» gibt es nicht.
5. Warnungen blockieren nichts, das Ergebnis wird immer gerechnet.
6. Kopf und Leiste zeigen den Holzpreis (Kaufteile getrennt). Die Sammlung zeigt Holz + Kaufteile, eingefroren beim Speichern.
7. Die Sammlung zeigt «zusammen ca. CHF …». Das passt zu einem Projekt, nicht zu Varianten.

## Entscheide

| Frage | Entscheid |
|---|---|
| Was ist die Sammlung? | **Varianten** eines Möbels bzw. mehrerer Ideen zum Vergleichen, kein Projekt. Die **Summe fällt weg**. Eingekauft wird immer für den geladenen Entwurf. |
| Varianten vergleichen | **Die Liste reicht** (Masse, Material, Kosten), **sortierbar nach Preis**. Vergleichen heisst laden, anschauen, zurück. Keine Ansicht nebeneinander. |
| Möbelwahl | **Auswahl im Kopf, ohne Pflicht-Schritt.** Beim ersten Besuch ist «Was baust du?» der Leerzustand von Entwerfen. Später öffnet «Sideboard ▾» im Kopf dieselbe Auswahl. Wer wiederkommt, landet direkt im letzten Entwurf. |
| Orte | **Variante E, vier Orte:** Entwerfen · Einkaufen · Bauen · Sammlung. Auf dem Handy als Leiste unten. Auf dem Desktop bleiben Einkaufen und Bauen live als Reiter neben dem Entwurf, nur die Sammlung ist eine eigene Ansicht. |
| Zuschnitt | **Je nach Material.** Zuschnitt-Platten bestelle ich bei Jumbo als Zuschnitt, ihre Zuschnittliste und der Plattenplan gehören zu **Einkaufen**. Ganze Bretter (`MATS[mat].boards`) länge ich selbst ab: Einkaufen zeigt Anzahl × Format, der Ablängplan gehört zu **Bauen**. |

### Verworfene Varianten

- **A (Entwerfen · Bauplan · Sammlung):** Der Bauplan mischt Baumarkt und Werkstatt, und eine abhakbare Einkaufsliste fehlt. E übernimmt das Gerüst von A.
- **B (nur Sammlung auslagern):** Auf dem Handy, dem Hauptgerät, bliebe die lange Seite.
- **C (Start-Schritt vorne):** Wer wiederkommt, hätte bei jedem Besuch einen Tipp mehr, obwohl die automatische Speicherung schon in den Entwurf führt. Übernommen wird nur die Auswahl «Was baust du?», als Leerzustand und im Kopf.
- **D (Einkaufen / Bauen)**: Die Aufteilung ist in E aufgegangen.

## Modell (die Objekte hinter den Orten)

- **Möbeltyp**: Sideboard, Reduit, später weitere.
- **Entwurf**: die aktuelle Konfiguration, **einer pro Möbeltyp** (neu). Er speichert sich selbst. Der Entwurf des gewählten Typs ist der aktuelle.
- **Ergebnis**: wird aus dem Entwurf abgeleitet (Teile, Platten/Bretter, Kaufteile, Beschläge, Werkzeug, Bauablauf, Warnungen). Einkaufen und Bauen sind zwei Sichten darauf.
- **Variante** (Eintrag der Sammlung): eine Kopie eines Entwurfs mit Name, Datum und Kosten beim Speichern.
- **Haken** (neu): abgehakte Zeilen der Einkaufsliste. Jeder Haken hängt am Inhalt seiner Zeile, nicht an einer Nummer.

## Breadboard

```
Entwerfen
- Möbel «Sideboard ▾» → Auswahl «Was baust du?» (Sheet über Entwerfen)
- Zufall → hier (neuer Entwurf dieses Typs; Reduit behält Raum, Tür, Wände)
- Sammeln → hier, Meldung «gesammelt · Zur Sammlung»
    wenn eine Variante geladen und geändert ist: zwei Knöpfe, «Als neue Variante» | «Überschreiben»
- Einkaufen → Einkaufen          (Desktop: Reiter rechts)
- Bauen → Bauen                  (Desktop: Reiter rechts)
- Sammlung → Sammlung
[ Formular, 3D, Warnungen, Preis Holz + Kaufteile ]
[ «Variante «X» · geändert», wenn der Entwurf von der geladenen Variante abweicht ]

Auswahl «Was baust du?»
- Sideboard / Reduit → Entwerfen mit dem letzten Entwurf dieses Typs (sonst Standardwerte)
- Zufall → Entwerfen mit neuem Zufallsentwurf des gewählten Typs
- Aus Sammlung laden → Sammlung   (nur wenn die Sammlung nicht leer ist)
- Schliessen → Entwerfen          (nicht beim ersten Besuch, dort gibt es noch keinen Entwurf)
[ Typen mit kleinem Bild; beim Typ «zuletzt: 1600 × 1400 mm, ca. CHF …» ]

Einkaufen
- Zeile abhaken → hier (Haken bleiben gespeichert)
- Haken zurücksetzen → hier
- Liste kopieren / teilen → Teilen-Menü (Handy), sonst Zwischenablage
- Warnhinweis «n Warnungen · Zum Entwurf» → Entwerfen
[ Möbel, Masse, Kosten gesamt ]
[ Zuschnitt bestellen: je Material und Stärke die Teile (Anz., L × B, Maserung), Plattenzahl; Plattenplan aufklappbar ]
[ Ganze Bretter: Anzahl × Format, Stückpreis ]
[ Rückwand · Kaufteile (Reduit) · Beschläge & Kleinteile · Oberfläche · Werkzeug ]

Bauen
- Reiter: Teile | Ablängplan (nur bei ganzen Brettern) | Bauablauf
- Warnhinweis «n Warnungen · Zum Entwurf» → Entwerfen
[ Teile mit Position zum Beschriften; Ablängplan; Bauablauf ]

Sammlung
- Sortieren: Datum | Preis → hier
- Name bearbeiten → hier
- Laden → Entwerfen, Meldung «X geladen · Rückgängig»
- Überschreiben → hier (mit dem aktuellen Entwurf)
- Entfernen → hier, «Rückgängig»
- leer: «Aktuellen Entwurf sammeln» → hier · «Zum Entwurf» → Entwerfen
[ Varianten: Name, Typ, Masse, Material, Kosten beim Speichern, Datum; die geladene markiert ]
```

### Handy (≤ 920 px)

- Leiste unten: **Entwerfen · Einkaufen · Bauen · Sammlung**, darüber eine schmale Zeile mit dem Preis und, wenn nötig, «Sammeln». Der Preis bleibt in jedem Ort sichtbar.
- Jeder Ort ist eine eigene Ansicht und nicht mehr ein Abschnitt der langen Seite. In Entwerfen bleiben 3D oben (klebend), Warnungen und das einklappbare Formular.

### Desktop

- Links das Formular, rechts 3D, Warnungen und die Reiter **Einkaufen | Bauen**, live wie heute. Die Sammlung ist eine eigene Ansicht und wird über den Kopf erreicht.
- `#einkaufen` und `#bauen` öffnen auf dem Desktop Entwerfen mit dem passenden Reiter.

## Randfälle (Walk the flow)

| Fall | Verhalten |
|---|---|
| Erster Besuch | Kein gespeicherter Entwurf, darum öffnet die Auswahl «Was baust du?» ohne «Schliessen». Die Wahl führt zu Entwerfen mit Standardwerten. |
| Wiederkehrender Besuch | Letzter Typ, sein Entwurf und der letzte Ort (Hash). Keine Auswahl. |
| Leere Sammlung | Kurze Erklärung («Varianten merken und vergleichen»), dazu «Aktuellen Entwurf sammeln» und «Zum Entwurf». Keine Sackgasse. |
| Laden über ungespeicherte Änderungen | Keine Rückfrage und kein automatisches Sichern. Die Meldung «X geladen · Rückgängig» stellt den vorherigen Entwurf wieder her (gleiches Muster wie Entfernen). |
| Geladene Variante geändert | Entwerfen zeigt «Variante X · geändert». Sammeln bietet «Als neue Variante» oder «Überschreiben» an. |
| Warnungen vorhanden | Einkaufen und Bauen zeigen trotzdem alles, oben aber «n Warnungen · Zum Entwurf». Es blockiert nichts (der Zufall lässt harmlose Warnungen wie Kippschutz und Bad ohnehin zu). |
| Typwechsel mitten im Entwurf | Jeder Typ hat seinen eigenen Entwurf, inklusive Material, Stärke, Rückwand, Verbindung und Preise. Wer zurückwechselt, findet ihn genau so wieder. Der Hinweis «Ganze Bretter gibt es nur beim Reduit …» fällt weg. |
| Laden einer Variante eines anderen Typs | Der Typ wechselt, der geladene Entwurf ersetzt den Entwurf dieses Typs (Rückgängig stellt ihn wieder her). Der Entwurf des anderen Typs bleibt unberührt. |
| Zufall | Ersetzt nur den Entwurf des aktuellen Typs, Rückgängig wie beim Laden. |
| Entwurf ändert sich nach dem Abhaken | Haken hängen am Inhalt der Zeile (z. B. «Birke 18 · 2 × 720 × 400»). Unveränderte Zeilen bleiben abgehakt, geänderte werden frei. |
| Zurück-Taste des Browsers | Ein Hash pro Ort (`#entwerfen`, `#einkaufen`, `#bauen`, `#sammlung`). Der Wechsel des Orts legt einen History-Eintrag an, der Wechsel des Reiters innerhalb eines Orts nutzt `replaceState`. Die Auswahl «Was baust du?» legt einen Eintrag an, Zurück schliesst sie. |
| Neu laden der Seite | Gleicher Ort (Hash), gleicher Entwurf. |
| Im Baumarkt ohne Netz | Listen und Haken kommen aus localStorage. Einkaufen darf nicht von three.js abhängen. |

## Code-Anker für die Umsetzung

- `#kindBar` (Radios mit `form="cfg"`) → Knopf «Sideboard ▾» mit Auswahl-Sheet. Die Auswahl setzt weiterhin das Feld `kind`.
- `save()` / `stored()` / `restore()` → ein Entwurf pro Typ: `{ kind, sideboard:{…}, reduit:{…} }`. Migration: Den heutigen Wert unter seinem `kind` ablegen.
- `syncMaterials()` → setzt das Material beim Typwechsel nicht mehr um, weil der Entwurf des Typs sein eigenes Material mitbringt.
- `selectTab()`, `.tabs` → Reiter **Einkaufen | Bauen** (Desktop), die Orte als Ansichten (Handy). `#tab-coll` / `#p-coll` wird zur eigenen Ansicht Sammlung.
- `.mbar`, `#bJump`, IntersectionObserver → Leiste mit vier Orten und Preiszeile. Der Sprung per Scroll fällt weg.
- `applyNarrow()` / `OPEN` → bleibt für das Formular in Entwerfen.
- `renderCut`, `renderSheets`, `renderHw` → neu aufgeteilt: Einkaufen (Zuschnitt je Material mit Plattenplan, ganze Bretter, Kaufteile, Beschläge, Werkzeug) und Bauen (Teile, Ablängplan, Bauablauf).
- `renderColl()` → ohne Summe, mit Sortierung, Leerzustand mit Aktionen. `aktiv` wird gespeichert (heute nur im Speicher), dazu ein Vergleich Entwurf ↔ `aktiv.data` für «geändert».
- `applyData()` → merkt sich den vorherigen Entwurf für «Rückgängig» (Laden, Zufall).
- `sammlungEintrag()` in `konfig.js` → bleibt so.
- Neu: Hash-Router (ein Ort ↔ `location.hash`, `popstate`) und der Speicher für Haken (`STORE + '-haken'`, Schlüssel = Zeilentext).

## Annahmen (bitte beim Umsetzen prüfen)

- Der Preis in Kopf und Leiste heisst neu **gesamt = Holz + Kaufteile**, die Aufschlüsselung steht darunter. So zeigen Leiste und Sammlung dieselbe Zahl.
- Werkzeug steht in der Einkaufsliste, aber ohne Preis. Es ist abhakbar, falls es jemand kaufen muss.
- Eine Variante zeigt weiterhin die Kosten beim Speichern, nicht die aktuellen Preise.

## Nicht im Umfang

- Einkaufsliste über mehrere Varianten oder Möbel (Sammlung als Projekt).
- Varianten nebeneinander vergleichen.
- Konfiguration in der URL oder ein Teilen-Link.
- Offline-Fähigkeit mit Service Worker.
- Visuelle Gestaltung der Leiste und des Sheets (Layer Surface, nach diesem Entscheid).
