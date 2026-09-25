# Prompt: Ansichten und Ablauf des Konfigurators

Für eine neue Session. Einfügen, nachdem `/layers-interaction-flow` geladen ist (oder mit «Nutze /layers-interaction-flow» davor).

---

Nutze /layers-interaction-flow. Ich möchte den Ablauf des Konfigurators in `index.html` (Repo diy-furniture, Branch `formular-ansichten` oder main, falls gemergt) neu durchdenken. **Noch nichts umsetzen.** Zuerst Varianten als Breadboards ausarbeiten, mit mir diskutieren und entscheiden. Code erst, wenn ich eine Variante gewählt habe.

## Job Story

Wenn ich ein Möbel selber bauen will (Sideboard fürs Wohnzimmer oder Regal im Reduit), möchte ich es an meine Masse und meinen Raum anpassen, die Kosten sehen und Varianten vergleichen können. Am Ende will ich mit einer Einkaufsliste in den Baumarkt (Jumbo) und mit Plattenplan und Bauablauf in die Werkstatt.

Nutzung: meist auf dem **Handy** (auch im Baumarkt), zum Entwerfen auch am Desktop.

## Ist-Zustand (Stand 25.09.2026, nach Commit `6dd1067`)

**Kopf** (immer oben, festes Raster): Titel · Umschalter **Sideboard / Reduit** · Zusammenfassung (Masse, Teile, Platten, Holzpreis, beim Reduit Kaufteile) · Desktop: Knopf «In Sammlung».

**Desktop**: links das Formular (sticky, scrollt für sich), rechts 3D-Vorschau → Warnungen → Ergebnis-Reiter.
**Handy** (≤ 920 px): alles untereinander. 3D-Vorschau klebt oben (38 % der Höhe), darunter Warnungen, Formular (Gruppen einklappbar, offen: Masse, Raum, Bauart, Material, Niveau), dann Ergebnis. Leiste unten: Holzpreis (+ Kaufteile) · «Sammeln» · «Ergebnis ↓» / «Konfigurieren ↑» (springt, keine echte Navigation).

**Formular** (Reihenfolge, je Möbeltyp ausgeblendet, was nicht passt):
Zufall · Masse (Sideboard) / Raum (Reduit: Breite, Tiefe, Höhe, Tür, Wände) · Bauart (Reduit: eingebaut/selbststehend + 5 Einbau-Arten) · Form (Reduit: hinten/L/U) · Tablare · Nische · Aufbau (Sideboard) · Front (Sideboard) · Material (Einsatzort, Platte, Stärke, Rückwand) · Verbindung · Platten & Preise · Niveau (nur Anzeige).

**Ergebnis-Reiter**: Materialliste · Plattenplan · Beschläge & Werkzeug · Bauablauf · **Sammlung**.

**Sammlung**: Liste gespeicherter Konfigurationen (localStorage), je Eintrag Name (editierbar), Masse, Material, Kosten beim Speichern; Aktionen Laden (überschreibt die aktuelle Konfiguration ohne Rückfrage), Überschreiben, Entfernen (mit Rückgängig). Summe aller Einträge.

**Zufall**: würfelt eine Konfiguration ohne Warnungen; beim Reduit bleiben Raum, Tür und Wände stehen.

Code-Anker: `syncVisibility()` (Ein-/Ausblenden), `selectTab()`, `applyNarrow()` + `OPEN` (Handy-Gruppen), `.mbar` (Leiste unten), `#kindBar` (Umschalter, Radios mit `form="cfg"`), `sammeln` / `.js-sammeln`, `renderColl()`, `konfig.js` (`zufall`, `sammlungEintrag`).

## Bisheriger Vorschlag (von mir, noch nicht entschieden)

Drei Orte:

```
Entwerfen
- Möbeltyp wählen → Entwerfen (Formular passt sich an)
- Zufall → Entwerfen (neue Konfiguration)
- Sammeln → bleibt hier, Meldung «gesammelt · Zur Sammlung»
- Bauplan → Bauplan
[ Formular, 3D, Warnungen, Preis ]

Bauplan
- Reiter: Materialliste | Plattenplan | Beschläge & Werkzeug | Bauablauf
- Liste kopieren → Zwischenablage
- Zurück zum Entwurf → Entwerfen
[ Ergebnis der aktuellen Konfiguration ]

Sammlung
- Laden → Entwerfen (mit dieser Konfiguration)
- Überschreiben → bleibt hier
- Entfernen → bleibt hier (Rückgängig)
[ gespeicherte Möbel, Summe ]
```

Begründung:
- Die Sammlung ist ein eigenes Objekt (mehrere Möbel) und kein Ergebnis der aktuellen Konfiguration. Darum gehört sie nicht zwischen die Ergebnis-Reiter.
- Auf dem Handy ist heute alles eine lange Seite. Die Leiste unten würde zur echten Navigation Entwerfen · Bauplan · Sammlung, mit Preis.
- Auf dem Desktop Entwerfen und Bauplan **nicht** trennen: Dass sich Materialliste und Plattenplan beim Verstellen live ändern, ist dort der grösste Nutzen. Nur die Sammlung wird eine eigene Ansicht.

Offen im Vorschlag:
- leere Sammlung (Zustand und Weg zurück)
- Laden bei ungespeicherten Änderungen: fragen, automatisch sichern oder rückgängig anbieten?
- Wohin nach Sammeln?
- Bauplan bei Warnungen: trotzdem zeigen oder zuerst auf die Warnungen hinweisen?

## Was ich diskutieren will

1. **Möbelwahl als eigener Schritt vorne.** Statt Umschalter im Kopf ein Einstieg: «Was baust du?» → Sideboard / Reduit (später weitere), dazu «Aus Sammlung laden» und evtl. «Zufall». Dann erst Entwerfen. Fragen:
   - Wie kommt man später zurück und wechselt den Typ?
   - Was passiert beim Wechsel mit den Werten? Heute bleiben beide Typen im Formular erhalten.
   - Wiederkehrende Nutzer: jedes Mal diesen Schritt oder direkt in den letzten Entwurf?
   - Wird die Sammlung damit zum Startpunkt?
2. **Varianten der Ansichten**, jeweils als Breadboard, mit Vor- und Nachteilen für Handy und Desktop:
   - A: mein Vorschlag oben
   - B: nur die Sammlung auslagern, sonst wie heute
   - C: Möbelwahl vorne + Entwerfen + Bauplan + Sammlung
   - D: Bauplan weiter aufteilen in «Einkaufen» (Materialliste, Beschläge, Kosten, für den Baumarkt) und «Bauen» (Plattenplan, Bauablauf)
   - Weitere Varianten, falls dir eine sinnvoll scheint
3. **Einkaufen als eigener Ort?** Im Baumarkt will ich eine abhakbare Liste: Platten/Zuschnitt, Kaufteile, Werkzeug.
4. **Randfälle** je Variante durchgehen (Walk the flow): erster Besuch, wiederkehrender Besuch, leere Sammlung, Laden über ungespeicherte Änderungen, Warnungen vorhanden, Typwechsel mitten im Entwurf, Zurück-Taste des Browsers (sollen die Ansichten eine URL/Hash haben?).

Vorgehen: Ist-Zustand kurz bestätigen (Code lesen, nicht raten). Dann die Varianten als Breadboards mit offenen Entscheiden. Mir **eine Empfehlung** geben, keine blosse Aufzählung. Stell mir die Fragen, die nur ich entscheiden kann, einzeln. Am Ende das Ergebnis als Spec in `docs/superpowers/specs/` festhalten.
