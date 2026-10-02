# UI/UX-Review – Befunde (Anhang)

Datum: 2026-10-02 · Basis: `main` bei `e5f3fa4` · Hauptbericht: `2026-10-02-ux-review.md`

Acht Lese-Linsen (je ein Agent) lieferten die Befunde; 57 davon (alle «hoch»/«kritisch» plus ausgewählte «mittel») prüften je zwei unabhängige Skeptiker: einer am Code, einer an der Nutzerwirkung für Kims Nutzer und Situationen. **Geprüft** = beide Prüfungen bestanden (Schwere = Urteil «Nutzerwirkung», sonst Code). **Verworfen** = mindestens ein Skeptiker hat widerlegt (Grund steht dabei). **Ungeprüft** = Phase-1-Befunde mit Schwere «tief»/«info», nicht gegengeprüft. **Nachträge** = von den Skeptikern zusätzlich gefunden. Zeilenangaben beziehen sich auf den Stand `e5f3fa4` und verschieben sich nach dem Doctype-Schritt.

Zahlen: 51 geprüft bestätigt · 6 verworfen · 74 Nachträge · 143 ungeprüft (tief/info).

## Interaktionsstruktur und Fluss

Orte, Ein- und Ausgänge, Zustände, Hauptfluss, Brüche (Layer 6).

**Kurzfassung (Phase 1):** Die vier Orte aus der Spec (Entwerfen · Einkaufen · Bauen · Sammlung) sind als Hash-Router umgesetzt; auf dem Handy je eine Ansicht mit Leiste unten, auf dem Desktop Einkaufen/Bauen als Reiter (replaceState) und nur die Sammlung als eigene Ansicht (index.html:1979-2014). Der Hauptfluss Entwurf → Einkauf → Bau funktioniert und hat an den meisten Stellen einen klaren Post-Action-State (Autosave, Haken-Zähler, «Gesammelt ✓»). Die grössten Brüche: Laden, Zufall und Link überschreiben den Arbeitsentwurf, das «Rückgängig» ist nur 6 Sekunden sichtbar und auf dem Handy fehlt die Anzeige «Variante X · geändert» ganz (index.html:451, 2071); Bauen und Einkaufen versprechen auf dem Handy eine 3D-Hervorhebung, obwohl die 3D-Ansicht dort ausgeblendet ist (924, 392); der Typwechsel aus dem Dialog bleibt am aktuellen Ort statt nach Entwerfen zu führen (2108, Spec Zeile 68). Dazu kommen kleinere Sackgassen (Überschreiben ohne Rückgängig, Scroll-Reset beim Ortswechsel, ✓-Präfix auch vor Fehlermeldungen) und veraltete Stellen in WEITERARBEIT.md.

### Geprüft

#### [hoch] Laden/Zufall/Link überschreiben den Arbeitsentwurf; Rückgängig nur 6 s, auf dem Handy ohne «geändert»-Anzeige

«Laden» (2217 → ladeVariante 2178), Zufall (2064) und ein geteilter Link (2253) rufen applyData mit undo:true; der vorherige Stand liegt nur in der Variable vorher (2043). Der einzige Zugang ist der «Rückgängig»-Knopf in der flash-Meldung, die nach 6000 ms gelöscht wird (2062, 2071). Danach ist der alte Entwurf nicht mehr erreichbar, obwohl er im Speicher läge. Vergleichen heisst laut Spec «laden, anschauen, zurück» (Spec Zeile 32) – jedes Laden ersetzt aber vorher, so dass nach zwei Ladevorgängen der ursprüngliche Arbeitsentwurf weg ist. Auf dem Handy fehlt zudem die Anzeige «Variante «X» · geändert» (siehe eigener Befund), also kein Hinweis, dass ungespeicherte Änderungen verloren gehen. Spec Zeile 127 hat «keine Rückfrage» entschieden, aber keinen Timeout.

Beleg: index.html:2042-2043, 2062-2066, 2071, 2178, 2217, 2253; docs/superpowers/specs/2026-09-26-ansichten-design.md:32, 127

- Prüfung Wirkung: Hauptfall für Kims Nutzer ist «Zufall», nicht «Laden»: Zufall ist der prominenteste Knopf im Formular und im Dialog, ersetzt den Entwurf samt Autosave, und das einzige «Rückgängig» steht 6 s lang unten in der Handy-Leiste. «Laden» (nur Kim beim Variantenvergleich) und ein geteilter Link (selten) sind Nebenfälle. Die fehlende «geändert»-Anzeige auf dem Handy ist ein eigener, kleinerer Punkt.

#### [mittel] Bauen und Einkaufen versprechen auf dem Handy eine 3D-Hervorhebung, die dort unsichtbar ist

*Phase 1: hoch → nach Prüfung mittel.*

Die Teile-Tabelle zeigt bei grobem Zeiger den Text «Tipp auf eine Zeile, um das Teil in 3D hervorzuheben» (924, .hint-touch aktiv via 403-405). Der pointerup-Handler setzt das Highlight auf Tabelle, Plattenplan und 3D (1531-1536, 1517-1528). In #bauen und #einkaufen ist aber .cfgwrap mit der 3D-Vorschau ausgeblendet (392, Viewer liegt in .cfgwrap 524-539). Der Nutzer tippt, sieht nur eine Zeilen-Markierung und keinen Effekt in 3D. Gleiches gilt für Plattenplan-Teile in Einkaufen (1522). Auch das #pick-Info beim Antippen eines 3D-Teils (1685-1691) ist nur in Entwerfen erreichbar.

Beleg: index.html:392, 524-539, 924, 1517-1536, 1685-1691

- Prüfung Code: Auf schmalen Bildschirmen (< 921 px) zeigt die Teile-Tabelle bei grobem Zeiger den Hinweis «Tipp auf eine Zeile, um das Teil in 3D hervorzuheben» (924, 403-405), obwohl .cfgwrap mit der 3D-Vorschau in #bauen/#einkaufen ausgeblendet ist (392). Sichtbar bleibt nur die Zeilenmarkierung. Das Highlight bleibt aber gesetzt und erscheint beim Wechsel nach Entwerfen in 3D (kein Neu-Render in zeigeOrt 1978-1988, Löschen erst in build3D 1805). Auf Tablets quer (≥ 921 px) stimmt der Hinweis.
- Prüfung Wirkung: Auf dem Handy (≤ 920 px) verspricht der Hinweistext in Bauen eine 3D-Hervorhebung, obwohl die 3D-Vorschau dort ausgeblendet ist; der Nutzer tippt und sieht nur die Zeilenmarkierung. Auf dem Tablet quer stimmt der Hinweis. In Einkaufen gibt es keinen Hinweis, nur eine stille Markierung im Plattenplan. Wirkung: Eindruck «unfertig», kein funktionaler Schaden.

#### [mittel] Bauen auf dem Handy ohne Kontext: welcher Entwurf, welche Masse?

In #bauen ist die Kopf-Summary ausgeblendet (395), und anders als Einkaufen (#kaufKopf mit Titel und Massen, 897, 1487) hat das Bauen-Panel keine Kopfzeile (916-933). Die Leiste zeigt nur Preis und «Holz Zuschnitt · 23 Teile» bzw. «Holz … · Kaufteile …» (1392-1393), keine Masse und keine Variante. In der Werkstatt lässt sich so nicht prüfen, ob die Teileliste zum gebauten Möbel gehört.

Beleg: index.html:395, 897, 916-933, 1392-1393, 1487

- Prüfung Wirkung: Auf dem Handy (≤ 920 px) zeigt Bauen weder Masse noch Variantennamen, während Einkaufen eine Kopfzeile mit Titel und Massen hat – ein sichtbarer Bruch zwischen zwei Nachbar-Orten in der Werkstatt-Situation. Auf dem Tablet quer bleibt die Kopf-Summary sichtbar.

#### [tief] Geladene Variante und «geändert» sind auf dem Handy nirgends benannt; «Überschreiben» in der Leiste ohne Referenz

*Phase 1: mittel → nach Prüfung tief.*

#variante («Variante «X» · geändert») sitzt in .hacts (520), und .hacts ist unter 920 px display:none (451). Die Leiste (957) hat kein Gegenstück. Sichtbar bleiben nur indirekte Signale: Knopftext «Gesammelt ✓» / «Als neue Variante» (2162) und ein «Überschreiben»-Knopf (2164), der nicht sagt, welche Variante überschrieben wird. Die Spec sieht die Anzeige in Entwerfen vor (Zeile 65, 128). Auch in der Sammlung ist die geladene Variante nur per Rahmenfarbe .on markiert (2141, CSS 265).

Beleg: index.html:451, 520, 957, 2153-2164; docs/superpowers/specs/2026-09-26-ansichten-design.md:65, 128

- Prüfung Wirkung: Auf dem Handy fehlt die Anzeige «Variante «X» · geändert» (Spec 65, 128); sichtbar bleiben nur die Knopftexte «Gesammelt ✓» / «Als neue Variante» und ein «Überschreiben» ohne Namen. Betrifft nur den Varianten-Workflow (praktisch Kim), Risiko gering, da «Überschreiben» die eben geladene Variante meint.

#### [tief] Typwechsel und Zufall aus dem Dialog führen nicht nach Entwerfen (Abweichung von der Spec)

*Phase 1: mittel → nach Prüfung tief.*

Der Dialog ist von jedem Ort aus über «Sideboard ▾» im Kopf erreichbar (518, 2103; Kopf bleibt in allen Orten sichtbar, nur die Summary wird ausgeblendet 395). Nach der Wahl eines Typs (2108) oder Zufall (2109-2113) wird nur schliesseWahl() aufgerufen, kein geheZu('entwerfen'). Wer auf #sammlung (Desktop oder Handy) den Typ wechselt, sieht weiterhin die Sammlung; auf #einkaufen wechselt die Einkaufsliste stillschweigend auf den anderen Typ. Spec Zeilen 68-69: «Sideboard / Reduit → Entwerfen mit dem letzten Entwurf dieses Typs», «Zufall → Entwerfen».

Beleg: index.html:395, 518, 2103, 2105-2119; docs/superpowers/specs/2026-09-26-ansichten-design.md:68-69

- Prüfung Wirkung: Aus Sammlung oder Einkaufen/Bauen heraus den Typ zu wechseln ist ein Randfall; dort fehlt nach der Wahl eine sichtbare Rückmeldung (nur der Knopftext im Kopf ändert). Vom Hauptort Entwerfen aus stimmt das Verhalten. Abweichung von Spec 68-69, aber geringe Nutzerwirkung.

#### [tief] Leiste unten setzt vor jede Meldung ein ✓, auch vor Fehler und Regel-Anpassungen

*Phase 1: mittel → nach Prüfung tief.*

.mbar .copied:not(:empty)::before{content:"✓ "} (446) gilt für alle .js-msg-Inhalte in der Leiste (957). Dadurch erscheinen «Der Link ist ungültig – …» (2250), «Angepasst – … Der Grund steht beim Feld.» (1349) und «Neu gewürfelt. Rückgängig» (2065) als Erfolgsmeldung mit Häkchen. Die Meldung ersetzt zudem für 6 s die Preis-Meta #mMeta (449).

Beleg: index.html:446, 449, 957, 1349, 2065, 2250

- Prüfung Wirkung: Das pauschale ✓ in der Handy-Leiste ist nur bei der Fehlermeldung zum ungültigen Link (selten) klar falsch; bei «Angepasst – …» ist es diskutabel, bei Zufall/geladen passend. Der Preis bleibt sichtbar, nur die Meta-Zeile wird 6 s ersetzt.

#### [tief] Doppelte Knöpfe auf einem Bildschirm: «Zum Entwurf» ×2, «Sammeln» ×2 in der leeren Sammlung

Die Toolbar der Sammlung hat immer «Zum Entwurf» (938); der Leerzustand #collLeer zeigt nochmals «Zum Entwurf» und «Aktuellen Entwurf sammeln» (944, 2139). Auf dem Handy kommen dazu «Entwerfen» und «Sammeln» in der Leiste (957, 959), auf dem Desktop «In Sammlung» im Kopf (520). Vier Wege zum selben Ziel auf einem Bildschirm.

Beleg: index.html:520, 938, 944, 957-959, 2139

- Prüfung Code: In der leeren Sammlung stehen pro Bildschirm bis zu drei Wege nach Entwerfen (Toolbar 938, #collLeer 944, auf dem Handy zusätzlich «Entwerfen» in der Leiste 959) und zwei Wege zum Sammeln (#collLeer 944 plus «Sammeln» in der Leiste 957 bzw. «In Sammlung» im Kopf 520). Nicht vier.

### Nachträge der Skeptiker

- (Code) Erstbesuch mit geteiltem Link: Der Start (index.html:2276-2277) macht «if (planLink) ladeLink(planLink); else if (erstBesuch) oeffneWahl({erst:true})». Öffnet ein Freund die App zum ersten Mal über einen Link, entfällt «Was baust du?» ganz – auch wenn der Link ungültig ist (ladeLink bricht bei 2250 nur mit 6-s-Meldung ab). Er landet kommentarlos im Standard-Sideboard, und weil save() (2273) schon lief, gilt er ab dann als wiederkehrend. Genau der Zielfall «Freund öffnet Link am Handy».

- (Code) Geteilter Link wird wie eine Variante behandelt: ladeLink ruft ladeVariante mit id:null (2253-2254) → aktiv=null und storeAktiv() (2179) löschen still die Markierung der zuvor geladenen Variante. Greifen Regelkorrekturen, lautet der Hinweis «Ältere Variante – «Geteilter Entwurf» passt nicht ganz zur Bauweise …» (2183) – ein frischer Link ist keine «ältere Variante», der Wortlaut führt in die Irre.

- (Code) Meldungen auf dem Handy uneinheitlich: «gesammelt» versteckt den Variantennamen per <span class="nm"> (2203, CSS .mbar .nm{display:none} 445), «X geladen. Rückgängig» (2180) und «X überschrieben.» (2220) zeigen ihn. Die Leisten-Meldung ist display:block ohne Ellipse (448), ein langer Name plus «Rückgängig» bricht um und lässt die Preiszeile wachsen – während der 6 s ist der Preis verdeckt bzw. verschoben.

- (Code) Highlight-Zustand überlebt den Ortswechsel: Tipp auf eine Tabellenzeile in Bauen setzt hlKey und das 3D-Emissive (1535, 1517-1528); zeigeOrt (1978-1988) rendert nicht neu, gelöscht wird erst in build3D (1805) beim nächsten render oder per Tipp ins Leere in 3D (1691). Wer danach nach Entwerfen wechselt, sieht ein leuchtendes Teil ohne Hinweis, warum – und ein Mass ändern löscht es dann unvermittelt. Undokumentierter Zustand zwischen Orten.

- (Code) «Überschreiben» in der Sammlungsliste (data-act=update, 2218-2221) und in Kopf/Leiste (2166-2170) ersetzt eine Variante ohne Typprüfung (eine Reduit-Variante kann zum Sideboard werden) und ohne Rückgängig, anders als «Entfernen» (2222-2230, entfernt + bUndo). Phase 1 hat das nur als offene Frage, nicht als Befund geführt.

- (Wirkung) Dialog «Was baust du?» zwingt beim Erstbesuch zur Wahl, bevor der Freund irgendein Möbel gesehen hat – ohne Bild und ohne Preis: Spec Zeile 72 sieht «Typen mit kleinem Bild; beim Typ zuletzt: … ca. CHF …» vor, umgesetzt ist nur Text (index.html:946-953, shots/handy-moebeltyp-dialog.png), und «zuletzt» wird beim Erstbesuch bewusst leer gelassen (2085: `!erst &&`). Für das 30-s-Kriterium heisst das: Der erste Bildschirm ist eine blinde Textentscheidung statt ein fertiges Beispielmöbel mit Preis. Spec 33 (Leerzustand = Wahl) ist entschieden, widerspricht aber in dieser Form dem 30-s-Kriterium.

- (Wirkung) Die Handy-Leiste zeigt «Sammeln» und «Link» an allen vier Orten (index.html:957), obwohl Spec Zeile 101 nur «wenn nötig, Sammeln» neben dem Preis vorsieht. Im Baumarkt (Einkaufen) und in der Werkstatt (Bauen) sind beide Aktionen ohne Bezug und verdrängen die Preis-Meta (beim Reduit wird «Link» abgeschnitten, shots/handy-reduit-entwerfen.png, handy-reduit-bauen.png); bei geladener, geänderter Variante kämen drei Knöpfe dazu (2162-2164). Jede Sitzung sichtbar.

- (Wirkung) Zwischen Baumarkt und Werkstatt gibt es keinen festgehaltenen Stand: Einkaufen und Bauen rechnen immer live aus dem aktuellen Entwurf (index.html:1356-1358, Spec 31 «Eingekauft wird immer für den geladenen Entwurf», Spec 49). Wer nach dem Einkauf am Entwurf spielt oder einem Freund die App zeigt, baut in der Werkstatt nach einer anderen Teileliste als eingekauft; einziges Signal sind freigegebene Haken (Spec 133), eine Warnung «Entwurf seit dem Einkauf geändert» fehlt. Bewusstes Modell, aber für die Werkstatt-Situation aus dem Interview relevant.

- (Wirkung) Der Untertitel im Kopf «Masse eingeben – Materialliste, Plattenplan und Bauablauf erhalten.» (index.html:515) nennt die alten Ergebnisnamen, während die Orte «Einkaufen» und «Bauen» heissen (959-961). Auf dem Handy steht er auf jedem der vier Bildschirme (alle shots/handy-*.png), auch in Einkaufen und Bauen – ein Vokabelbruch im Kopf, Kims Schmerzbereich. Phase 1 nannte nur den WebGL-Fehlertext (1705).

- (Wirkung) Empfänger eines geteilten Links sehen zuerst den eigenen bzw. Standard-Entwurf und erst danach den geteilten: Start rendert und speichert den Standard (index.html:2270-2273), zeigt den Ort (2275) und lädt den Link erst asynchron (2276, planAusCode mit Dekompression). Beim Reduit-Link springt 3D und Formular vom Sideboard zum Reduit um; einem Erstbesucher wird «Rückgängig» (2178) angeboten, das einen Entwurf zurückholt, den er nie gemacht hat. Betrifft die Situation «unterwegs entwerfen und Link teilen» beim ersten Eindruck des Empfängers.

### Ungeprüft (Phase 1, tief/info)

- **[mittel] «Überschreiben» ohne Rückgängig, auch über den Typ hinweg, Name bleibt stehen** – Beide Wege («Überschreiben» im Kopf/Leiste 2166-2172 und data-act=update in jeder Zeile 2146, 2218-2221) ersetzen die Daten der Variante ohne Sicherung; «Entfernen» dagegen hat Rückgängig (2222-2233). In der Liste erscheint der Knopf bei jedem Eintrag, auch bei einem anderen Möbeltyp: ein Reduit-Eintrag «Reduit U-Form 1600 mm» kann mit dem aktuellen Sideboard überschrieben werden, der Name bleibt (2219: … *(Beleg: index.html:2146, 2166-2172, 2218-2233)*

- **[mittel] Ortswechsel setzt die Scroll-Position zurück, Formularposition geht verloren** – zeigeOrt ruft bei jedem Sichtwechsel window.scrollTo(0,0) (1987). Auf dem Handy heisst das: Wer in der Gruppe «Tablare» arbeitet, kurz nach Einkaufen schaut und zurückkommt, landet oben bei der 3D-Vorschau und muss wieder hinunterscrollen. Sinnvoll ist das nur für «n Warnungen · Zum Entwurf» (Warnungen stehen oben, 540). Es gibt keine gemerkte Position pro Ort. *(Beleg: index.html:1979-1988)*

- **[mittel] Einkaufen hängt beim Laden an den CDN-Scripts von three.js; kein Offline-Pfad im Baumarkt** – three.min.js und OrbitControls.js werden als klassische, parser-blockierende Scripts vor den eigenen Scripts geladen (966-967), das App-Script folgt im selben Block (974). Bei fehlgeschlagenem Laden fängt initThree das ab (.nogl 1705), bei langsamer oder hängender Verbindung wartet die ganze App. Die Spec verlangt, dass Einkaufen nicht von three.js abhängt (Zeile 136), und schliesst einen Service Worker aus (Zeile … *(Beleg: index.html:966-974, 1642-1707; docs/superpowers/specs/2026-09-26-ansichten-design.md:136, 163)*

- **[tief] Erstbesuch: Entwurf wird vor dem Dialog gespeichert, Reload überspringt die Wahl** – erstBesuch wird aus !entwuerfe bestimmt (2265), dann rendert und speichert die App das Standard-Sideboard (2272-2273), erst danach öffnet der Dialog (2277). Wer die Seite neu lädt, bevor er gewählt hat, gilt als wiederkehrend und landet ohne Dialog im Sideboard. Die Wahl «Was baust du?» ist damit nur einmal erzwungen und leicht zu verpassen. *(Beleg: index.html:2265, 2272-2277)*

- **[tief] Rückgängig nach «Entfernen» stellt die geladene Markierung nicht wieder her; nur der letzte Eintrag** – Beim Entfernen wird aktiv auf null gesetzt, wenn die geladene Variante entfernt wird (2224). Das Rückgängig fügt den Eintrag wieder ein, setzt aktiv aber nicht zurück (2231) – der Entwurf gilt danach als ungesammelt («In Sammlung» statt «Gesammelt ✓»). entfernt hält nur einen Eintrag (2223), zwei Entfernungen hintereinander: nur die letzte ist rückgängig zu machen, 6 s lang (2071). *(Beleg: index.html:2222-2233, 2071)*

- **[tief] «An Bauweise anpassen» ohne Rückgängig; alter Rückgängig-Knopf zeigt auf den Stand vor dem Laden** – ladeVariante setzt bei einer älteren Variante vorher (undo:true, 2179) und zeigt #bwNotice. «An Bauweise anpassen» ruft applyData(box._angepasst) ohne undo (2190), vorher bleibt auf dem Stand vor dem Laden. Die neue Meldung (2191) ersetzt «geladen. Rückgängig»; der Zustand «unverändert, wie gespeichert» ist nicht mehr erreichbar, ausser durch erneutes Laden. *(Beleg: index.html:2175-2192, 2042-2043)*

- **[tief] Ungültiger Link: Meldung 6 s, URL bereits bereinigt, kein Rückweg** – ?plan= wird sofort per replaceState entfernt (2256), erst dann asynchron geladen (2276). Schlägt planAusCode fehl, bleibt nur eine 6-s-Meldung (2250, 2071) – der Link ist aus der Adresszeile verschwunden, Zurück führt nicht zu ihm, der Empfänger kann ihn nicht erneut prüfen oder kopieren. *(Beleg: index.html:2248-2256, 2276; konfig.js:652-658)*

- **[tief] Kein Lade-Zustand für 3D; Fehlertext nennt alte Ortsnamen** – #stage ist leer, bis three.js initialisiert und build3D läuft (527, 1642-1707); es gibt keinen Platzhalter. Der Fehlertext bei fehlendem WebGL lautet «Materialliste und Plattenplan funktionieren trotzdem» (1705) – die Orte heissen aber Einkaufen und Bauen (959-961). *(Beleg: index.html:527, 1705, 959-961)*

- **[tief] Gruppe «Niveau» ist ausgeblendet, wird aber weiter gerendert** – #grp-niveau wird in syncVisibility immer versteckt (1116), renderSummary schreibt trotzdem bei jedem render in #levelBox (1397). Das Niveau erscheint nur noch auf den Bauweise-Karten (1251-1252). Toter Ort im Formular (880-883). *(Beleg: index.html:880-883, 1116, 1397)*

- **[tief] Variantenname editierbar ohne Touch-Affordance; Kopf-Link «Sammlung» ohne aktiven Zustand** – Der Name ist ein <input> mit transparentem Rahmen (2142, CSS 266); der Rahmen erscheint nur bei :hover (267) – auf Touch gibt es keinen Hinweis, dass man tippen kann. Der Kopf-Link «Sammlung (n)» (520) bekommt in der Sammlung kein aria-current; nur die Leisten-Knöpfe werden markiert (1984-1986). *(Beleg: index.html:266-268, 520, 1984-1986, 2142)*

- **[info] Karte der Orte: Ein- und Ausgänge** – ENTWERFEN (#entwerfen, Standard für leeren/unbekannten Hash, konfig.js:662-665). Eingänge: Start/Reload (2275), Leiste «Entwerfen» (959), Sammlung «Zum Entwurf» (938, 944), «Laden» einer Variante (2217), Warnhinweis «Zum Entwurf» (1366; Desktop öffnet stattdessen nur die Warnbox, 1997-2005), Browser-Zurück (1994), Link ?plan= (2276). Ausgänge: Leiste Einkaufen/Bauen/Sammlung (960-962), Kopf-Link «Sammlung (n)» … *(Beleg: index.html:518-520, 937-963, 1979-2014, 2103-2119, 2217; konfig.js:661-665)*

- **[info] Zustände je Ort (leer / lade / teil / fehler)** – ENTWERFEN: Leer = Dialog «Was baust du?» beim Erstbesuch (2265, 2277), sonst immer Standardwerte (2262); Lade: keiner, 3D-Bühne bleibt leer bis three.js läuft (527, 1642); Teil: Warnbox mit Zähler (1406-1408), Regel-Anpassungen als Meldung (1349), «ältere Variante»-Hinweis #bwNotice (2180-2185); Fehler: WebGL fehlt → .nogl (1705), ungültiger Link → Meldung (2250).  EINKAUFEN: Leer: nie, Ergebnis wird immer gerechnet … *(Beleg: index.html:1356-1367, 1465, 1488-1489, 1705, 2135-2143, 2250, 2265-2277)*

- **[info] Hauptfluss «Neuer Entwurf → Einkauf → Bau» (Handy) mit Post-Action-States** – 1. Erstbesuch: Seite rendert im Hintergrund das Sideboard mit Standardwerten und speichert es (2262-2273), dann Dialog ohne Schliessen (2277, 2090); Esc wirkungslos (2102). 2. Tipp «Reduit»: wechsleTyp → applyData(startwerte) → 3D, Preis in der Leiste, Formular Reduit; Dialog zu, Ort bleibt #entwerfen (2108, 2114). Sichtbar: 3D klebend 38 svh (419-420), Gruppen Raum/Bauweise/Optik offen, Rest eingeklappt (1922). 3. … *(Beleg: index.html:1833, 1979-1988, 2011-2014, 2063-2071, 2108-2114, 2162, 2203, 2262-2277)*

- **[info] Handy vs. Desktop: strukturelle Unterschiede (nicht nur CSS)** – - Sicht-Auflösung: sicht = narrow || ort==='sammlung' ? ort : 'entwerfen' (1981) → Desktop kennt zwei Sichten (Entwerfen mit Reitern, Sammlung), Handy vier. - Navigation: Handy feste Leiste .mnav (956-963); Desktop Reiter (888-892) + Kopf-Link «Sammlung (n)» (520); .mbar display:none auf Desktop (384), .hacts display:none auf Handy (451) → Varianten-Anzeige #variante nur Desktop. - History: Handy jede Ortswahl = … *(Beleg: index.html:384, 392-395, 451, 1981-1995, 1997-2014, 2020)*

- **[info] Haken hängen am Möbeltyp, nicht an Entwurf oder Variante; alte IDs bleiben gespeichert** – haken[kind] wird pro Typ geführt (1496-1499). Zwei Sideboard-Varianten mit gleichen Beschlägen oder Werkzeug teilen die Haken: Was für Variante A gekauft wurde, erscheint bei Variante B als erledigt. hakenFiltern filtert nur die Anzeige, der gespeicherte Satz wächst (1483-1485, Kommentar). Spec Zeile 133 hat inhaltsbasierte Haken entschieden, aber nicht pro Typ vs. pro Variante. *(Beleg: index.html:1483-1485, 1495-1503; einkauf.js:48-51; docs/superpowers/specs/2026-09-26-ansichten-design.md:133)*

- **[info] Zwei «teilen»-Objekte mit ähnlichem Wortlaut: «Liste teilen» (Text) und «Link teilen» (Entwurf)** – «Liste teilen» in Einkaufen teilt den Listentext ohne Rückweg zum Entwurf (899, 2017-2030); «Link teilen»/«Link» im Kopf bzw. in der Leiste teilt den Entwurf als URL (520, 957, 2237-2245). Beide heissen «teilen», meinen aber verschiedene Objekte. Der Link enthält keinen Ort-Hash, der Empfänger landet immer auf Entwerfen (2238). *(Beleg: index.html:520, 899, 957, 2017-2030, 2237-2245)*

- **[info] localStorage-Fehler bleiben stumm** – Alle Speicherzugriffe sind in leeren try/catch (1180, 1493, 1500, 2036, 2131). Ist der Speicher gesperrt (privater Modus, volles Kontingent), scheint Sammeln und Abhaken zu funktionieren, nach dem Reload ist alles weg – ohne Hinweis. *(Beleg: index.html:1180, 1493, 1500, 2036, 2131)*

- **[info] Doku-Drift: WEITERARBEIT.md beschreibt den alten Kopf-Umschalter und nennt die Ansichten als offen** – Zeile 159 beschreibt den Möbeltyp-Umschalter als Radios in #kindBar und «Sammeln» neben «Ergebnis» – heute ist es #bKind mit Dialog (518, 2103). Zeile 169 führt «Ansichten trennen» unter «Ideen (noch nicht entschieden)», obwohl Zeile 106 die Umsetzung dokumentiert. Zeile 1 gibt den Stand mit 01.10.2026 an. *(Beleg: docs/WEITERARBEIT.md:1, 106, 159, 169; index.html:518, 2103)*

### Offene Fragen aus dieser Linse

- Soll «Rückgängig» nach Laden, Zufall und Link dauerhaft bleiben (bis zur nächsten Eingabe) statt 6 Sekunden, oder soll Laden bei ungespeicherten Änderungen doch nachfragen bzw. automatisch sichern?

- Soll der Typwechsel oder Zufall aus dem Dialog nach Entwerfen führen (wie in der Spec Zeile 68-69) oder bewusst am aktuellen Ort bleiben (z. B. Einkaufsliste des anderen Typs direkt sehen)?

- Haken pro Möbeltyp oder pro Variante/Entwurf? Sollen Werkzeug-Haken über alle Entwürfe hinweg gelten?

- Bauen auf dem Handy: Welche Kontextzeile braucht die Werkstatt (Masse, Variantenname, Bauweise)? Soll die 3D-Hervorhebung dort möglich sein (z. B. kleine Vorschau) oder der Hinweistext weg?

- Soll «Überschreiben» ein Rückgängig bekommen und auf Varianten desselben Typs beschränkt werden?

- Offline im Baumarkt: Bleibt der Service Worker ausserhalb des Umfangs, oder soll zumindest Einkaufen ohne three.js-CDN laden?

- Soll jede Ortswahl in der Leiste unten weiterhin einen History-Eintrag anlegen (Spec Zeile 134), oder soll sich die Leiste wie eine native Tab-Bar verhalten (Zurück verlässt die App)?

- Soll die Scroll-Position pro Ort gemerkt werden, so dass «Zum Entwurf» zurück in die bearbeitete Gruppe führt?

- Plattenplan in Einkaufen, Teileliste in Bauen: Passt diese Trennung zum Werkstatt-Ablauf (Teile anhand des Plattenplans beschriften), oder soll der Plattenplan auch in Bauen erreichbar sein?

- Soll die Varianten-Anzeige («Variante X · geändert») auf dem Handy in die Leiste oder in den Kopf, und was zeigt sie bei einem Entwurf, der zu keiner Variante gehört?

## Konzeptionelles Modell und Vokabular

Objekte, Zustände, Beziehungen, Wörter (Layer 5).

**Kurzfassung (Phase 1):** Das konzeptionelle Modell von Martylko hat zwei saubere Kerne (Entwurf pro Möbeltyp, Variante als eingefrorene Kopie in der Sammlung), aber das Vokabular darum herum ist nicht festgelegt: dieselbe Sache heisst je nach Ort Entwurf, Variante, Eintrag, Konfiguration oder «plan», und «Bauweise» bedeutet beim Sideboard ein Materialbündel, beim Reduit das Tragwerk (dort 1:1 die alte «Bauart»/«Einbau-Art», die als versteckte Gruppe, Schloss und Code-Begriff `SYS` weiterlebt). «Warnung» ist ein Sammelbecken für sechs verschiedene Dinge (Regel-Warnung, Schloss-Warnung, stille Berechnungs-Begrenzung, Konstruktionswarnung, Hinweis «eingeplant», Bad-Hinweis), die alle gleich aussehen und gleich gezählt werden, während «Hinweis» vier Bedeutungen hat. In der Zeit-Dimension gibt es Risse: Varianten aus älterem Schema gelten dauerhaft als «geändert», fehlende Felder erben beim Laden den vorherigen Entwurf (beim Link dagegen die Startwerte), «Ältere Variante» meint nicht alt, sondern «passt nicht zu den heutigen Regeln», und Rückgängig lebt nur sechs Sekunden in einer Sitzung. Auf dem Handy, dem Hauptgerät laut Spec, ist die Variante als Objekt unsichtbar (Kopfzeile ausgeblendet), nur Knopftexte wechseln. Die offenen Fragen betreffen Objektgrenzen (Variante = Snapshot oder lebendes Objekt, Haken = Typ oder Entwurf, Link = Entwurf oder Variante) und das verbindliche Wörterbuch.

### Geprüft

#### [hoch] Masked: «Warnung» ist ein Sammelbecken für sechs verschiedene Dinge

In `R.warn` landen und werden identisch dargestellt und gezählt: (a) Regel-Warnungen W03/W06; (b) Schloss- und «unverändert»-Warnungen aus Sperren/Grenzen, die nicht korrigiert wurden; (c) stille Berechnungs-Begrenzungen («Türbreite auf X mm verkleinert», «Tiefe … begrenzt», «Untergestell auf X mm begrenzt»); (d) echte Konstruktionswarnungen (Durchbiegung, Kippen, Türbreite); (e) Hinweise «… eingeplant» (Zwischenpfosten, zweite Schienenstücke, leeres Eckquadrat); (f) Bad-Hinweise. Die Spec unterscheidet «Meldung (Hinweis)» und «Meldung (Warnung)», die Tests kennen «ohne Warnung ausser ‹eingeplant›», `HARMLOS` nennt sie «kein Fehler» – nur das UI zeigt alles als `.warn` mit «!» und zählt alles in «n Warnungen».

Beleg: konfig.js:212-213, 221-222, 325, 340, 354, 359, 416-418; reduit.js:19-22, 49-54, 253, 311, 433, 574, 698, 746; sideboard.js:26, 120-175, 240-247; index.html:241-245, 1357, 1364-1367, 1405-1408; Spec reduit-design.md:115-116; WEITERARBEIT.md:67

#### [mittel] Shapeshifter: zwei Arten von «automatisch angepasst»

*Phase 1: hoch → nach Prüfung mittel.*

Regel-Korrekturen (`pruefeRegeln`) schreiben den neuen Wert ins Formular zurück, melden «Angepasst – Feld: Wert. Der Grund steht beim Feld.» und zeigen den Grund als `.hint.sperre`. Berechnungs-Begrenzungen (`normReduit`, Sideboard-Untergestell) ändern nur die Rechnung: das Formular zeigt weiter den eingegebenen Wert, das Möbel ist anders, und die Meldung erscheint als Warnung. Zwei Reaktionen auf dieselbe Situation «Wert nicht zulässig», ohne erkennbare Logik, welche wann greift.

Beleg: index.html:1337-1351, 1327-1331; konfig.js:341, 360; reduit.js:14, 19-22, 49, 52, 54; sideboard.js:26

- Prüfung Wirkung: Zwei Reaktionen auf «Wert nicht zulässig» gibt es, sie treffen Nutzer aber nur an den Reglergrenzen des Reduit (kleine Räume, breite Türen, wenig Deckenabstand); beim Sideboard praktisch nie. Dann zeigt das Formular einen anderen Wert als das 3D – mit Warnung, die es erklärt.

#### [mittel] Zeit: «geändert» vermischt «Entwurf weicht ab» mit «Variante aus älterem Schema»

*Phase 1: hoch → nach Prüfung mittel.*

`geaendert` vergleicht die Vereinigung der Schlüssel; fehlt der Variante ein Feld, das das Formular heute hat (z. B. doorPos/doorOff/doorH bei Varianten vor 4c), gilt sie dauerhaft als geändert – ohne Korrektur und ohne Nutzeraktion (Node-Probe: alte Variante ohne doorPos/doorH → `geaendert` true, `korrekturen` []). Folge: «Gesammelt ✓» erscheint nie, Kopf zeigt «· geändert», Knopf «Als neue Variante», «Überschreiben» eingeblendet. Das Label «(ältere Variante)» fehlt dabei, weil es nur auf Korrekturen schaut. `STANDARD` kennt nur `frontMat`.

Beleg: konfig.js:603-615; test/konfig.test.js:111, 183-186; index.html:2155-2164, 2143; WEITERARBEIT.md:60; Spec ansichten-design.md:128

- Prüfung Code: Gilt für Varianten, die vor der Einführung eines Formularfelds gespeichert wurden (heute: doorPos/doorOff/doorH vor 4c, 01.10.2026) – also Kims bestehende Sammlung, nicht neu gesammelte. Da `STANDARD` (konfig.js:603) nur frontMat kennt und `REDUIT_DEFAULTS` (reduit.js:4-7) nicht herangezogen wird, wiederholt sich das Problem bei jedem neuen Feld.
- Prüfung Wirkung: Nur Kims Varianten aus der Zeit vor einer Felderweiterung gelten dauerhaft als «geändert»; Freunde sind nicht betroffen. Für Kim wiederholt sich das bei jedem neuen Formularfeld, bis er jede Variante einmal überschreibt.

#### [mittel] Isolated: Auf dem Handy existiert die Variante nicht sichtbar

*Phase 1: hoch → nach Prüfung mittel.*

«Variante «X» · geändert» steht in `#variante` innerhalb `.hacts`, die ab ≤920 px ausgeblendet ist. In der Leiste unten wechseln nur Knopftexte («Sammeln» → «Als neue Variante» → «Gesammelt ✓») und «Überschreiben» taucht auf; der Name der geladenen Variante erscheint nur im Flash, dort aber versteckt (`.mbar .nm{display:none}`). Einzige Spur: die Markierung `.on` in der Sammlungsliste. Die Spec nennt das Handy als Hauptgerät und verlangt «Entwerfen zeigt ‹Variante X · geändert›».

Beleg: index.html:74, 78, 451, 445, 520, 957, 2158-2164, 265, 2140; Spec ansichten-design.md:128; ansichten-flow.md:13

- Prüfung Code: Auf dem Handy fehlt die dauerhafte Anzeige «Variante «X» · geändert» (#variante in .hacts, index.html:520, ausgeblendet 451). Der Name erscheint kurz beim Laden («‹X› geladen», 2178), nicht aber beim Sammeln (.nm versteckt, 445/2203). Zustand ist nur indirekt lesbar: Knopftexte «Gesammelt ✓» / «Als neue Variante», eingeblendetes «Überschreiben», Markierung .on in der Sammlung (265, 2141).
- Prüfung Wirkung: Beim Vergleichen am Handy weiss Kim nach dem Flash nicht mehr, welche Variante er ansieht; nur die Knopftexte «Gesammelt ✓»/«Als neue Variante» und die Markierung in der Sammlungsliste tragen den Zustand. Für Freunde ohne Sammlung ohne Wirkung.

#### [mittel] Vokabular: «Sperre/gesperrt» (Regel) vs «Schloss/fest/festhalten» (Zufall) – im Code beides «SPERREN/fest»

Regelseite: `wirkung:'sperren'`, `gesperrt()`, `zeigeSperren`, `.hint.sperre`, Hint «Gesperrt ist, was in diesem Raum nicht hält». Zufallsseite im UI: «Schloss», «beim Zufall festhalten», «bleibt beim Zufall», «· n fest», Speicher `-schloss`. Im Code heisst die Schloss-Tabelle aber `SPERREN` und der Parameter `fest`, und `pruefeRegeln` macht aus einer Sperre bei festem Feld eine Warnung – zwei Konzepte (Regel verbietet / Nutzer friert ein) mit einem Wortstamm.

Beleg: konfig.js:28-33, 267, 310-313, 325, 420-431; index.html:550, 1242, 1286, 1943-1946, 1952, 1963, 1966

- Prüfung Code: Im UI sind Regel-Sperre («gesperrt», index.html:1242) und Zufall-Schloss («festhalten», «fest», 1952-1966) unterscheidbar benannt. Nur der Code nennt die Schloss-Tabelle `SPERREN` und den Parameter `fest` (konfig.js:420, 310) – ein Wartungs-, kein Nutzerproblem.
- Prüfung Wirkung: Nicht die Code-Namen, sondern die Nähe von Schloss-Symbol im Gruppentitel und dem Satz «Gesperrt ist, was in diesem Raum nicht hält» (Reduit, Gruppe Bauweise) lässt Freunde die beiden Konzepte verwechseln; der Tooltip, der es erklären würde, erscheint auf dem iPhone nicht.

#### [tief] Shapeshifter: «Bauweise» bedeutet je Möbeltyp etwas anderes und überlagert Bauart / Einbau-Art / System / Tragwerk

*Phase 1: hoch → nach Prüfung tief.*

Sideboard: Bauweise = Material + Stärke + Verbindung + Rückwand + Oberfläche (Hint «legt Material, Stärke, Verbindung und Oberfläche fest»). Reduit: Bauweise = Tragwerk (Hint «legt Tragwerk und Material fest») und 1:1 die frühere Einbau-Art (`bauweiseVon`: battens→R1 … cheeks→R5, free→R6; Namen R1–R4 = `SYS`-Namen). Parallel leben: h2 «Bauart» (versteckt), aria-label «Einbau-Art», `FELDNAME` sys = «Einbau-Art», build = «Regal», Karten-Zeile «Tragwerk», Code `SYS`, Spec «Bauart (selbststehend / 5 Einbau-Arten)», WEITERARBEIT «5 Einbau-Arten + selbststehend», Summary «Eingebaut mit …». Korrektur-Meldungen nennen Felder, die der Nutzer nicht sieht («Regal: eingebaut statt selbststehend», «Einbau-Art: …»). Schloss-Gruppen `bauweise` (bw, build, sys, joint) und `bauart` (build, sys) überlappen.

Beleg: index.html:629, 636, 641, 1115-1116, 1242-1243, 1394; konfig.js:79-82, 136-144, 300, 305, 341, 420-423; reduit.js:196-202; Spec reduit-design.md:13, 71; WEITERARBEIT.md:91, 165

- Prüfung Code: «Bauweise» ist in beiden Typen dasselbe Objekt (geprüfte Kombination, konfig.js:79-82), nur mit typ-spezifischem Inhalt. Sichtbar leckt das alte Vokabular an drei Stellen: in Korrektur- und Warn-Meldungen über FELDNAME («Regal: …», «Einbau-Art: …», konfig.js:305, 325, 341; angezeigt in index.html:1349, 2182), in der Summary-Zeile «Eingebaut mit …» (1394) und in der Karten-Zeile «Tragwerk» (konfig.js:406) neben dem Hint «legt Tragwerk und Material fest» (1242). Versteckte Gruppe, aria-label und Schloss «bauart» sind unsichtbar bzw. tot.
- Prüfung Wirkung: Für Nutzer ist «Bauweise» in beiden Typen dieselbe Karte; die Hints erklären je Typ richtig, was sie festlegt. Die Altbegriffe «Bauart», «Einbau-Art», «Regal» (für build) tauchen nur in Korrektur-Texten für ältere Varianten und Schloss-Warnungen auf (selten, nur Kim) sowie in Spec/WEITERARBEIT. Nutzen eines Aufräumens: Doku und Meldungstexte, nicht der erste Moment.

#### [tief] Zeit: Laden einer Variante ist kontextabhängig – fehlende Felder erben den vorherigen Entwurf

*Phase 1: hoch → nach Prüfung tief.*

`restore(data)` setzt nur die Felder, die in `data` vorkommen; `ladeVariante` übergibt `e.data` unverändert. Fehlt einer Variante ein Feld, bleibt der Wert des zuvor geladenen Entwurfs im Formular stehen – dieselbe Variante ergibt je nach Vorzustand ein anderes Möbel. `ladeLink` füllt dagegen mit `startwerte(DEFAULTS, kind)` auf, die Rechenschicht mit `REDUIT_DEFAULTS` (Test: «fehlende Werte älterer Entwürfe gelten als mittig, 2000 hoch»). Drei Vervollständigungsregeln für ein Objekt.

Beleg: index.html:1193-1216 (restore, Schleife 1208), 2175-2178, 2251-2253; reduit.js:4-7, 14; test/reduit.test.js:618

- Prüfung Code: In der App gibt es zwei Vervollständigungsregeln: Sammlung erbt den vorherigen Formularzustand (restore, index.html:1208), Link füllt mit Startwerten (2251). Die Rechen-Defaults (`REDUIT_DEFAULTS`, reduit.js:14) greifen nur ausserhalb des Browsers, da formData() stets alle Felder liefert. Betroffen sind nur Varianten aus älterem Schema.
- Prüfung Wirkung: Nur ältere Varianten ohne ein neues Feld erben beim Laden den Wert des vorherigen Entwurfs; der Unterschied zum Speicherzeitpunkt ist meist unauffällig (Türlage, Türhöhe). Für Freunde ohne alte Varianten ohne Wirkung.

#### [tief] Shapeshifter: Masse wechseln die Achsenreihenfolge je Typ – in derselben Liste ohne Beschriftung

*Phase 1: mittel → nach Prüfung tief.*

Reduit B × T × H («1600 × 1400 × 2400»), Sideboard B × H × T («1200 × 720 × 419»), jeweils ohne Achsenlabel: `info.masse`, Summary, `kaufTitel`, `dimTag`, Dialog «zuletzt». In der Sammlung stehen beide Typen gemischt untereinander; nur `info.typ` verrät die Reihenfolge. Die Reihenfolge folgt der Formularreihenfolge (Masse: Breite, Höhe, Tiefe; Raum: Breite, Tiefe, Raumhöhe).

Beleg: konfig.js:588 (Node-Probe bestätigt); index.html:1388, 1479, 1369, 2088, 556-567, 583-595, 2143

- Prüfung Code: Reihenfolge wechselt je Typ (konfig.js:588); ohne Achsenlabel sind Sammlung (index.html:2143), Einkaufstitel (1479) und «zuletzt» (2088). Summary und dimTag kennzeichnen mit «Raum»/«Aussenmass» (1369, 1388).
- Prüfung Wirkung: Die Reihenfolge wechselt je Typ, ist im Kopf aber durch «Aussenmass» vs «Raum» erkennbar und entspricht der jeweiligen Alltagskonvention. Nur in einer gemischten Sammlungsliste fehlt eine Achsenbeschriftung – ein seltener Fall.

#### [tief] Vokabular: «Hinweis» hat vier bis fünf Bedeutungen

*Phase 1: mittel → nach Prüfung tief.*

(a) Tabellenspalte «Hinweis» = Notiz am Bauteil (`r.note`); (b) `.hint` = Hilfstexte im Formular; (c) `.hint.sperre` = Grund einer Sperre oder Grenze (CSS-Kommentar «der Grund steht in .hint.sperre»); (d) CSS-Abschnitt «/* Hinweise */» = Warnungen, und `HARMLOS` «Hinweise, die zum Möbel gehören»; (e) «Tipp:» im Bauablauf. Die Sammelfunktion heisst `hint()`, die Meldung «Der Grund steht beim Feld».

Beleg: index.html:1416, 550, 570, 625, 716, 878, 187, 1291, 1327-1331, 241, 1350; konfig.js:416-418; renderSteps index.html ca. 1465

- Prüfung Code: Im UI tritt das Wort «Hinweis» nur als Tabellenspalte für Bauteil-Notizen auf (index.html:1416); daneben stehen «Tipp:» im Bauablauf (1471) und in einer Sideboard-Warnung (sideboard.js:172) sowie unbenannte Hilfstexte (.hint). Die übrigen Bedeutungen (.hint.sperre, CSS «Hinweise» = Warnungen, HARMLOS, hint()) sind Code-intern.
- Prüfung Wirkung: Für Nutzer kommen nur «Hinweis» (Tabellenspalte), «Tipp» (Bauablauf) und «Grund» (Meldung) vor; die übrigen Bedeutungen sind Code-Namen. Nutzen: Wörterbuch für Kim, keine Wirkung auf die vier Situationen.

### Verworfen

#### ~~Vokabular: Entwurf / Variante / Eintrag / Konfiguration / plan für dieselbe Sache~~

- Widerlegt (Wirkung): Für Kims Nutzer sind nur zwei Wörter sichtbar: «Entwurf» (Zum Entwurf, Aktuellen Entwurf sammeln, Geteilter Entwurf) und «Variante» (Sammlung) – genau das Paar, das die Spec festlegt (ansichten-design.md:48-50: Entwurf = aktuelle Konfiguration pro Typ, Variante = Kopie in der Sammlung). Screenshots handy-sammlung.png/desktop-sammlung.png zeigen das konsistent («Noch keine Varianten. Sammle den aktuellen Entwurf …»). «Konfiguration» steht nur im title-Tooltip des Zufall-Knopfs (index.html:548) – auf dem Testgerät iPhone Safari gibt es keinen Hover, der Text erscheint nie. «plan» steht nur im URL-Parameter (index.html:2238), «Eintrag» nur in Code-Kommentaren und WEITERARBEIT.md:45/92. Kein Nutzer aus dem Interview (Kim, Familie, Freunde ohne Einführung) begegnet dem Konflikt; er ist eine Code-/Doku-Wörterbuchfrage.

#### ~~Shapeshifter: drei Erscheinungsformen von «gesperrt»~~

- Widerlegt (Wirkung): Die dritte Form («weg») ist ein dokumentierter Entscheid: «‹Material› heisst ‹Optik› und zeigt nur, was zur Bauweise gehört» (WEITERARBEIT.md:65) und im Code «Was nicht zur gewählten Bauweise gehört, verschwindet aus der Auswahl, statt ausgegraut dazustehen» (index.html:1305-1310); der Hint sagt es den Nutzern (index.html:1243 «legt Material, Stärke, Verbindung und Oberfläche fest»). Die beiden anderen Formen (Karte mit Verbotssymbol und Grund; Option ausgegraut mit Grund darunter) sind modellgleich «sichtbar + Grund», nur grafisch verschieden – im Bad-Fall sieht ein Freund drei gesperrte Karten mit Begründung (Probe: S3/S5/S6 im Bad), das ist verständlich. Die `top`-Ausnahme (bleibt ausgegraut, index.html:1305) ist kosmetisch. Der Entscheid widerspricht dem 30-s-Kriterium nicht, eher stützt er es (weniger Optionen). Für Kims Nutzer praktisch ohne Rolle.

### Nachträge der Skeptiker

- (Code) Zwei widersprüchliche Rückfallwerte für ein fehlendes oder unbekanntes `sys` beim Reduit: `bauweiseVon` ergibt 'R2' Pfostenrahmen (konfig.js:138 `|| 'R2'`), `normReduit` setzt 'battens' = Leisten (reduit.js:37); `START.reduit` nennt 'posts' (konfig.js:558). Je nach Pfad (Bauweise ableiten vs. rechnen) entsteht ein anderes Regal.

- (Code) Das Formular deklariert Grenzen, die nicht die wirklichen sind: zeigeSperren schreibt min/max der Regel-Grenzen in die Zahlenfelder (index.html:1314-1317; Probe: dLeft/dRight max 500), danach kürzt normReduit dieselben Werte weiter (reduit.js:44-48; Probe: auf 250). Der Nutzer sieht eine offizielle Obergrenze, die das Möbel nicht einhält.

- (Code) Folgewarnungen beziehen sich auf Werte, die der Nutzer nie eingegeben hat: nach der stillen Kürzung meldet die Rechnung «Das Regal links ist 250 mm tief … ragt in die Türöffnung», obwohl im Formular 400 steht (reduit.js:44-48 plus Türwarnungen, Probe mit rw 800). Die Warnung ist dadurch nicht am Feld überprüfbar.

- (Code) Beim Wechsel der Bauweise (eingabe === 'bw') zeigt render() nur den Bauweise-Flash und verschluckt gleichzeitig ausgelöste Regel-Korrekturen aus anderen Regeln (index.html:1342-1349: `if (eingabe === 'bw') … else if (was.length)`); die Meldung «Angepasst – … Der Grund steht beim Feld» entfällt dann, obwohl `.hint.sperre` erscheint.

- (Code) Im Modus «Unverändert ansehen» werden alle Felder als `fest` behandelt (index.html:1340), sodass Bauweise-Folgen wie «Einbau-Art Leisten: Folgt aus der Bauweise «Pfostenrahmen»» als Warnungen erscheinen und in «n Warnungen» zählen (konfig.js:325, 186-188), obwohl kein Konstruktionsproblem vorliegt und das Feld unsichtbar ist (636, 1116).

- (Wirkung) Die Tagline verspricht Objekte, die es im Modell nicht mehr gibt: «Masse eingeben – Materialliste, Plattenplan und Bauablauf erhalten.» (index.html:515; gesetzt in reduit-design.md:147, als die Reiter noch «Materialliste» hiessen). Die Orte heissen heute Entwerfen · Einkaufen · Bauen · Sammlung (ansichten-design.md:34), Bauen zeigt «Teile», eine «Materialliste» findet ein Freund nirgends. Es ist der erste Satz, den er am Handy liest (alle Screenshots, z. B. handy-entwerfen.png) – direkt im 30-s-Moment.

- (Wirkung) Eine Bauweise-Karte kann unbemerkt eine Zahl im Formular ändern: Node-Probe (scratchpad/probe-model.cjs) – Reduit Start, Karte «Wandschienen» → Korrektur «Oberstes Tablar bis Decke: 350 statt 300 mm». render() zeigt bei eingabe === 'bw' nur den Flash «‹Wandschienen›: Sperrholz … 18 mm» und unterdrückt «Angepasst – …» (index.html:1343-1350); der Grund steht als .hint.sperre in der Gruppe «Tablare», die auf dem Handy eingeklappt ist (OPEN index.html:1922). Der Nutzer hat ein anderes Möbel als eingegeben, ohne es gesagt zu bekommen – bei jedem Kartenvergleich im Reduit möglich.

- (Wirkung) «Preis» eines Entwurfs ist im UI nicht ein Objekt, sondern zwei bis drei: Kopf «Total ca. CHF 245 · Holz Zuschnitt CHF 245 · ganze Platten CHF 475» (index.html:1391-1393; handy-entwerfen.png), Reduit «Zuschnitt 500 · Kaufteile 170 · ganze Platten 410» – ganze Platten günstiger als Zuschnitt (handy-reduit-entwerfen.png). Welche Zahl man bei Jumbo zahlt, sagt nur WEITERARBEIT.md:111, nicht die App; die Sammlung friert kostenGesamt = Zuschnitt + Kaufteile ein (konfig.js:580-582). Die Spec wollte eine Zahl «gesamt = Holz + Kaufteile» (ansichten-design.md:154). Trifft den Erfolgsmoment «Preis gesehen» und den Einkauf im Baumarkt.

- (Wirkung) Das Schloss ist ein Zufall-Objekt, hängt aber als Eigenschaft an jeder Gruppe: Jeder Gruppentitel (Masse, Bauweise, Aufbau, Front, Optik, Raum, Form, Tablare, Nische) trägt ein 44-px-Schloss (index.html:1949-1953, :429), bevor der Nutzer ein einziges Feld gesehen hat (handy-entwerfen-voll.png). Erklärt wird es nur im Hint unter «Zufall» («Mit dem Schloss … beim Würfeln», index.html:550) und per title-Tooltip (index.html:1963-1964), den iPhone Safari nie zeigt; dazu zwei Wörter für dieselbe Aktion («Zufall» Knopf, «Würfeln»/«Neu gewürfelt.» index.html:548, 550, 2065). Ein Freund liest fünf Vorhängeschlösser als «gesperrte Felder».

- (Wirkung) Der Raum ist kein eigenes Objekt, obwohl die Reduit-Job-Story ihn als Konstante behandelt («für dieselben Raummasse verschiedene Varianten durchschalten», reduit-design.md:7): Jede Variante trägt eine eigene Kopie der Raummasse (sammlungEintrag speichert den ganzen Entwurf, konfig.js:584-597), Laden ersetzt den Raum mit (restore index.html:1208-1216). Misst Kim in der Werkstatt nach (z. B. 1580 statt 1600) und korrigiert den Entwurf, bleiben alle gesammelten Varianten beim alten Raum und bringen ihn beim Laden still zurück – Zufall dagegen behält den Raum (konfig.js:414-415). Zwei Zeitverhalten für dasselbe Ding, relevant für Kims echte Reduit-Planung.

### Ungeprüft (Phase 1, tief/info)

- **[mittel] Vokabular/Zeit: «Ältere Variante» heisst nicht alt, sondern «passt nicht zu den heutigen Regeln» – und «zur Bauweise» stimmt nicht immer** – Label «(ältere Variante)» = `pruefeRegeln(mitBauweise(e.data)).korrekturen.length > 0`; Dialog «Ältere Variante – «X» passt nicht ganz zur Bauweise Y. Angepasst würde: …». Die Korrekturen können aus jeder Regel stammen (S01 Korpus ≥ 18, K09/K13 Grenzen, S16 Gipskarton …), nicht nur aus `BW_REGELN`. Ein eben geteilter Link wird so zur «Ältere Variante – «Geteilter Entwurf»». Eine gestern gespeicherte Variante wird … *(Beleg: index.html:2143, 2176-2186, 2253; konfig.js:201-260, 313-369)*

- **[mittel] Masked: «Überschreiben» in der Liste ignoriert den Möbeltyp und behält den Namen** – Listen-Aktion `update` ersetzt den Eintrag durch `sammlungEintrag(formData(), R)` mit alter `id` und altem `name`; nur `info` wird neu. Ein Eintrag «Reduit U-Form 1600 mm» kann so ein Sideboard enthalten. Kopf-Überschreiben trifft nur die geladene Variante gleichen Typs (`passt`), die Listen-Variante jede. Kein Rückgängig – anders als Entfernen. *(Beleg: index.html:2218-2220, 2166-2171, 2155, 2222-2232; konfig.js:585-597)*

- **[mittel] Masked: Name und «Typ» einer Variante mischen Ebenen** – `name` = `${typ} ${R.W} mm`, wobei `typ` beim Reduit Möbeltyp + Form ist («Reduit U-Form 1600 mm»), beim Sideboard nur der Möbeltyp («Sideboard 1200 mm»); der Kopf zeigt «Reduit». Die Würfeltypen `SB_TYPES` (Lowboard, Kommode, Highboard, Regal) sind ein dritter «Typ», der nur Proportionen steuert und nie erscheint. Die Duplikat-Nummerierung per `startsWith` zählt auch umbenannte Einträge mit gleichem Präfix. *(Beleg: konfig.js:589-592, 432-439, 414-415; index.html:1368, 2198-2201)*

- **[mittel] Modell: Haken hängen am Möbeltyp, nicht am Entwurf oder an der Variante** – `haken[kind]` speichert ids aus Abschnittstitel + Zeilentext. Wechselt man zwischen Varianten desselben Typs, bleiben Haken auf gleichlautenden Zeilen stehen (Werkzeug, Oberfläche, gleiche Zuschnittzeilen); beim Typwechsel verschwinden sie aus der Sicht, bleiben aber gespeichert. Haken sind weder Teil der Variante noch des Links; «Haken zurücksetzen» löscht pro Typ. Die Spec regelt nur «hängt am Inhalt seiner … *(Beleg: index.html:1474-1504; einkauf.js:10, 48-51; konfig.js:585-597, 629-635; Spec ansichten-design.md:51)*

- **[mittel] Zeit: Variante zeigt eingefrorene Kosten neben lebender Regelbewertung; Rückgängig lebt 6 Sekunden, «aktiv» ewig** – `info.kosten` und `info.material` sind vom Speicherzeitpunkt («Kosten beim Speichern»), das Etikett Bauweise und «(ältere Variante)» werden live gerechnet – ein Eintrag mischt zwei Zeitpunkte. Der Entwurf hat keinen Zeitstempel. `vorher` (Rückgängig) ist Sitzungsspeicher, der Knopf verschwindet nach 6 s; `aktiv` ist persistent, sodass «Variante «X» · geändert» Sitzungen überlebt, das Rückgängig dazu nicht. Zweites … *(Beleg: konfig.js:593-595; index.html:2136, 2143, 2039, 2068-2073, 2124, 2222-2232)*

- **[mittel] Modell: Link = Entwurf ohne Identität, aber als Variante behandelt** – Der Link trägt nur Felder, kein id/Name/Datum. Beim Empfänger wird er als Variante «Geteilter Entwurf» geladen (Flash «‹Geteilter Entwurf› geladen»), setzt `aktiv = null` (eine zuvor geladene Variante wird still «entladen»), ersetzt den Entwurf des Typs per Autosave und heisst bei Korrekturen «Ältere Variante». Er landet nicht in der Sammlung. *(Beleg: konfig.js:622-658; index.html:2246-2258, 2177, 2181, 2048)*

- **[tief] Vokabular: «Regal» meint vier Dinge** – Beschreibung des Möbeltyps («Regal in einem kleinen Raum»), Feldlabel für `build` («Regal: eingebaut / selbststehend» → Korrekturtext «Regal: eingebaut statt …»), Form-Label («Regal an: hinten / L-Form / U-Form»), Segment in Meldungen («Das Regal links … ragt in die Türöffnung»), Würfeltyp «Regal» beim Sideboard. *(Beleg: index.html:952, 638-639, 653-654; konfig.js:305, 341, 438; reduit.js:10, 102-103)*

- **[tief] Isolated/Dead: Niveau existiert doppelt, einmal unsichtbar** – Karten zeigen `Bauweise.niveau` (Index wechselt mit Türen); `R.level` wird weiter gerechnet und in `#levelBox` als «Einsteiger / Einsteiger+ / Etwas Übung» mit Begründung gerendert – in einer Gruppe, die immer `hidden` ist. Die Punkte stehen auch auf den versteckten Einbau-Art- und Verbindungs-Karten. Zwei Berechnungen können voneinander abweichen. *(Beleg: index.html:1245-1251, 1116, 1380, 1394-1397, 642-646, 853-856, 880-883; sideboard.js:265; reduit.js:799)*

- **[tief] Dead content: versteckte Gruppen mit eigenem Vokabular und Schloss bleiben im DOM** – «Bauart» (eigene Beschreibungen der Einbau-Arten, z. B. Leisten-Karte vs `R1.desc` – zwei Texte für dasselbe), «Verbindung», «Niveau» sind immer `hidden`. Ihre Schloss-Gruppen `bauart`/`verbindung` sind nicht mehr klickbar, aber ein früher gesetztes Schloss aus `-schloss` wirkt im Dialog-Zufall weiter, weil `locksFuer` nur nach Typ filtert, `activeLocks` nach Sichtbarkeit. *(Beleg: index.html:635-648, 642, 850-858, 880-883, 1116, 1955-1958; konfig.js:115, 420-431)*

- **[tief] Vokabular: «Optik» vs «Material» vs «Plattenmaterial»; Schloss «Optik» hält auch «Platten & Preise»** – h2 «Optik» enthält «Plattenmaterial», «Stärke», «Rückwand»; die Schloss-Gruppe heisst `material` (aria «Optik beim Zufall festhalten») und hält zusätzlich price, sheetL, sheetB, kerf, grain – Felder der Gruppe «Platten & Preise», die selbst kein Schloss hat. Hint «Masse, Aufteilung und Optik bleiben frei», aber Stärke und Rückwand sind per `BW_REGELN` eingeschränkt. «Plattenmaterial» listet beim Reduit auch «Ganze … *(Beleg: index.html:831-848, 860-879, 1243, 1005-1011; konfig.js:182-183, 191-192, 429)*

- **[tief] Shapeshifter: Abschnittstitel der Einkaufsliste wechselt nach Preis, nicht nach Typ** – «Beschläge & Kaufteile» vs «Beschläge & Kleinteile» hängt an `R.hw.some(h => h[3])` (irgendein Beschlag hat einen Preis). Summary nennt «Kaufteile» nur beim Reduit. Dazu «Teile» (Summary, Reiter), «Bauteil» (Spalte), «Kaufteile», «Kleinteile» nebeneinander. *(Beleg: einkauf.js:30-31; index.html:1389-1393, 919, 1416)*

- **[tief] Zeit: Lösch- und Rücksetz-Semantik asymmetrisch** – Entfernen: Rückgängig (ein Slot). Überschreiben (Kopf und Liste), Umbenennen, Haken zurücksetzen: kein Rückgängig. Entwurf: kein «Zurücksetzen auf Startwerte»; Startwerte greifen nur, solange der Typ keinen Entwurf hat – ersetzt wird er nur durch Zufall, Laden oder Link. Alter Schlüssel `sideboard-werkbank-v2` wird gelesen, aber nie entfernt. *(Beleg: index.html:2166-2171, 2208-2232, 1504, 2059-2061, 1187-1191, 2266)*

- **[info] Inventar: Entwurf** – Definition laut Code: die Formularwerte (name → Wert) eines Möbeltyps, `formData()` inkl. `katalog`; speichert sich bei jeder Eingabe (`save()`) unter `sideboard-werkbank-v2-entwuerfe` als `{ kind, sideboard, reduit }` – genau einer pro Typ. Zustände: existiert nach dem Start immer («ab hier gibt es immer einen Entwurf»); «unveraendert»-Modus (ältere Variante ohne Korrekturen rechnen); kein Name, kein Zeitstempel, … *(Beleg: index.html:1163-1178 (formData/save), 2273, 2041-2049; konfig.js:567-577 (entwuerfeLaden/entwurfSetzen); UI index.html:520, 938, 944, 2253; Spec ansichten-desig)*

- **[info] Inventar: Variante / Eintrag** – Definition: `sammlungEintrag(d, R)` → `{ id, name, gespeichert (Datum), data (Formularwerte), info { typ, masse, material, kosten } }`; Kosten und Beschreibung sind beim Speichern eingefroren, `data` ist der komplette Entwurf. Zustände: geladen (`aktiv`, persistent in `-aktiv`), «geändert» (`geaendert(formData, e.data)`), «(ältere Variante)» (= heutige Regeln würden korrigieren), geladen aber anderer Typ (Kopf … *(Beleg: konfig.js:584-597, 598-615; index.html:2124 (-aktiv), 2135-2150 (renderColl), 2153-2165 (renderVariante), 2175-2186 (ladeVariante), 2213-2232; Spec ansichten-de)*

- **[info] Inventar: Sammlung** – Array `coll` in `-sammlung`, Reihenfolge = Speicherzeit, Anzeige neueste zuerst oder nach Preis (`sortiere`, Wahl in `-sort`). Enthält Varianten beider Möbeltypen gemischt. Zustände: leer (eigener Leerzustand mit «Aktuellen Entwurf sammeln»), 1 Eintrag (Sortierung versteckt), ≥2. Zähler «(n)» in Kopf, Handy-Leiste und Titel. Laut Spec «Varianten eines Möbels bzw. mehrerer Ideen zum Vergleichen, kein Projekt», ohne … *(Beleg: index.html:937-946, 2034-2036, 2135-2138; konfig.js:616-620; Spec ansichten-design.md:31)*

- **[info] Inventar: Möbeltyp (kind)** – `kind` ∈ {sideboard, reduit} als Hidden-Input, gewählt im Dialog «Was baust du?» oder per Kopf-Knopf «Sideboard ▾». Steuert sichtbare Gruppen (`data-kind`), den Bauweisen-Satz (`bwKind`), die Link-Felder (`LINK_FELDER`), den Haken-Satz (`haken[kind]`), Startwerte (`START`) und die Achsenreihenfolge der Masse. Daneben zwei weitere «Typ»-Begriffe: `info.typ` = «Sideboard» bzw. «Reduit U-Form» (Möbeltyp + Form) als … *(Beleg: index.html:518, 948-955, 1368; konfig.js:130, 432-439, 558, 589-592, 629-635; index.html:1478-1485)*

- **[info] Inventar: Bauweise (bw)** – `BAUWEISEN` S1–S6 / R1–R6: id, name, desc, niveau[], Sideboard: mats, joint, backs, front, top, oberflaeche; Reduit: build, sys, walls, tragwerk. Feld `bw`. Zustände: gewählt (Details `bwDetails` auf der Karte), möglich mit Live-Preis (`kartenPreise`), gesperrt mit Grund (`bwSperre`: Bad, Gipskarton, Leisten-Spannweite, Tür nach innen), «gehört zum anderen Möbeltyp». Beziehungen: sperrt über `BW_REGELN` die Felder … *(Beleg: konfig.js:78-199, 380-411; index.html:628-633, 1221-1259, 1343-1349, 2143, 2181)*

- **[info] Inventar: Bauart / Einbau-Art / System (build, sys)** – Felder `build` (eingebaut | selbststehend, Label «Regal») und `sys` (battens, rails, brackets, cheeks, posts; Karten mit aria-label «Einbau-Art»; Namen in `SYS`). Seit den Bauweisen ist die Gruppe «Bauart» dauerhaft ausgeblendet; beide Werte folgen aus der Bauweise (`BW_REGELN` build/sys) und bleiben als Formularfelder, Schloss-Gruppen (`bauart`, Teil von `bauweise`) und Korrektur-Meldungen («Regal: eingebaut statt … *(Beleg: index.html:635-648, 1115-1116, 1394; konfig.js:186-189, 300, 305, 420-423; reduit.js:196-202; Spec reduit-design.md:13, 71)*

- **[info] Inventar: Raum, Form, Ecke, Tablare, Nische (Reduit)** – Raum (rw, rd, rh, doorW, doorH, doorPos, doorOff, doorIn, hinge, wall) ist Teil des Entwurfs, bleibt beim Zufall stehen. Form `shape` I|L|U («Regal an: hinten / L-Form / U-Form») + `corner`; bestimmt, welche Tiefenfelder existieren (`tiefenFelder`) und ob eine Nische möglich ist. Tablare: dBack/dLeft/dRight (rasten bei ganzen Brettern auf Brettbreiten), nShelves, gapBottom, gapTop mit Grundgrenzen `RANGES` und … *(Beleg: index.html:580-717, 1133-1136, 1140-1160; konfig.js:50, 261, 420-426; reduit.js:4-7, 102-118)*

- **[info] Inventar: Regel → Sperre, Grenze, Warnung, Korrektur, Hinweis** – `REGELN` mit `wirkung` sperren | grenze | warnen; `pruefeRegeln` liefert korrekturen («X statt Y – Grund», zurück ins Formular + Flash «Angepasst – …») und warnungen (Schloss/fest, unlösbar, warnen-Regeln). Sperre im UI: Option disabled + `.hint.sperre` beim Feld; Bauweisen-Sperre: Option entfernt (`'weg'`) bzw. Karte mit Grund und Verbotssymbol. Grenze: min/max am Zahlenfeld, Grund nur, wenn der Wert anstösst. … *(Beleg: konfig.js:27-33, 201-260, 267-288, 313-369, 416-418; index.html:187-190, 201-205, 241-245, 1286-1333, 1337-1351, 1364-1367, 1405-1408; reduit.js:19-22, 311, 698)*

- **[info] Inventar: Zufall und Schloss** – `zufall(base, rnd, tries, locks)` würfelt bis keine Warnung ausser `HARMLOS`; Bauweise zuerst, gewichtet (`GEWICHT`); Reduit behält den Raum. Schloss: Knopf pro Gruppe (`data-lock` ↔ `SPERREN`), persistent in `-schloss`, Zähler «· n fest», aria «X beim Zufall festhalten»; festgehaltene Felder machen aus Sperre/Grenze eine Warnung (`fest`). Nur sichtbare Gruppen zählen (`activeLocks`), im Wahl-Dialog nach Typ … *(Beleg: konfig.js:413-553, 310-311, 325, 354; index.html:546-551, 1943-1973, 2063-2066, 951-952, 2107-2113)*

- **[info] Inventar: Ergebnis, Einkaufsliste, Haken, Bauen** – Ergebnis R (rows, groups, hw, finish, tools, steps, warn, level) wird live gerechnet; Einkaufen und Bauen sind zwei Sichten. Einkaufsliste: Abschnitte Zuschnitt je Platte / ganze Bretter / Massivholz / «Beschläge & Kaufteile» oder «& Kleinteile» / Oberfläche / Werkzeug; Zeilen-id = `${titel}|${text}`. Haken: `haken[kind]` (Set von ids) in `-haken`, `hakenFiltern` blendet verwaiste aus ohne zu löschen, Zähler … *(Beleg: einkauf.js:7-36, 48-51; index.html:887-933, 1354-1363, 1474-1504, 1506-1512; Spec ansichten-design.md:51)*

- **[info] Inventar: Link (?plan=)** – `planCode(d)`: Version «1» + deflate-raw + base64url der Felder des Möbeltyps (`LINK_FELDER`), Katalogwerte nur, wenn von Hand geändert. Kein id, kein Name, kein Datum, keine Haken. Empfänger: `ladeLink` → Startwerte des Typs + aktueller Katalog + Linkdaten, dann wie eine Variante geladen (`ladeVariante({ id:null, name:'Geteilter Entwurf' })`) mit Regelprüfung, Dialog bei Korrekturen und Rückgängig; ersetzt den … *(Beleg: konfig.js:622-658; index.html:520, 957, 2236-2258)*

- **[info] Inventar: Katalog (unsichtbares Objekt)** – `katalog = { price, sheetL, sheetB }` wird mit jedem Entwurf gespeichert (Werte, die der Katalog beim Speichern sagte). `folgtKatalog` entscheidet, ob ein Preis/Format «dem Katalog folgt» → zählt dann nicht als «geändert» und wandert nicht in den Link; beim Laden gelten die aktuellen Katalogwerte, es sei denn, sie wurden von Hand geändert. Wirkt auf die Felder «Preis Holz» und «Plattenformat», ist aber nirgends … *(Beleg: index.html:1171, 1180-1185, 1209; konfig.js:21-25, 598-602, 626-640; WEITERARBEIT.md:114)*

- **[info] Inventar: Niveau** – Zwei Quellen: (1) `Bauweise.niveau` [a, b] auf den Karten – Index 1, wenn Türen vorhanden; (2) `R.level` aus Verbindung + Türen (Sideboard) bzw. `SYS.level`/`JOINTS.level` (Reduit) → `#levelBox` «Einsteiger / Einsteiger+ / Etwas Übung» mit Begründung – aber `#grp-niveau` ist dauerhaft ausgeblendet. `.lvl`-Punkte stehen zusätzlich auf den versteckten Einbau-Art- und Verbindungs-Karten. *(Beleg: index.html:1245-1251, 1380, 1394-1397, 1116, 642-646, 853-856, 880-883; sideboard.js:265; reduit.js:799; konfig.js:92-126 (niveau))*

- **[info] Inventar: Orte, Reiter, Dialog** – `ORTE` entwerfen | einkaufen | bauen | sammlung als Hash; Handy: je eine Ansicht + Leiste unten (Preis, Sammeln/Link/Überschreiben, vier Orte); Desktop: Einkaufen/Bauen sind Reiter (`.tabs` aria-label «Ergebnis») mit `replaceState`, Sammlung eigene Ansicht. Dialog «Was baust du?» mit eigenem History-Eintrag; erster Besuch ohne «Schliessen». Bauen hat Unterreiter (`bau`), Sammlung hat Sortier-Segment. *(Beleg: konfig.js:660-665; index.html:384-396, 887-892, 956-964, 1976-2014, 2076-2119)*

- **[info] Inventar: Rückgängig / Historie** – Drei getrennte Mechanismen: `vorher` (ein Schritt; sichert beide Entwürfe + `aktiv`; nach Laden, Zufall, Link), `entfernt` (ein Schritt; nur Sammlung-Entfernen), History-Eintrag des Dialogs (Zurück-Taste schliesst). Der Knopf «Rückgängig» lebt im Flash 6 Sekunden; der Zustand nur im Speicher (Reload löscht ihn). Kein Rückgängig für Überschreiben, Umbenennen, Haken zurücksetzen, Typwechsel, Eingaben. *(Beleg: index.html:2037-2057, 2068-2073, 2222-2232, 2098-2104)*

- **[info] Inventar: Startwerte und «zuletzt»** – `DEFAULTS` = Formular beim Laden der Seite; `START` pro Typ (Sideboard S1; Reduit R2, posts, Sperrholz Fichte 18) → `startwerte(DEFAULTS, kind)` nur, wenn der Typ noch keinen Entwurf hat. Dialog zeigt pro Typ «zuletzt: Masse · ca. CHF» live aus dem gespeicherten Entwurf gerechnet. *(Beleg: konfig.js:555-566; index.html:988, 2059-2061, 2082-2089, 2264)*

### Offene Fragen aus dieser Linse

- Ist eine Variante eine Kopie eines Entwurfs zum Zeitpunkt X (Snapshot, wie heute) oder ein Objekt mit eigenem Leben? Was soll mit ihr geschehen, wenn Regeln oder Preise ändern: bleibt sie wie gespeichert, wird sie markiert, oder wird sie nachgeführt – und zeigt die Liste dann alte oder aktuelle Kosten?

- Gehört «Konfiguration» ins Wörterbuch oder nur «Entwurf»? Wie heisst das Objekt im Link aus Sicht des Empfängers (heute `?plan=`): Entwurf, Variante, Plan?

- Ist «Bauweise» beim Reduit dasselbe Objekt wie beim Sideboard (Bündel aus Material, Verbindung, Rückwand, Oberfläche) oder dort das Tragwerk? Bleiben «Bauart», «Einbau-Art» und `SYS` als Begriffe in Daten, Spec und Meldungen bestehen, obwohl das UI sie nicht mehr zeigt?

- Sind Hinweis («eingeplant», Bad, Kippschutz) und Warnung zwei Objekte oder eines? Zählen Hinweise zu «n Warnungen», und blockieren sie den Zufall?

- Soll eine Begrenzung durch die Berechnung (Türbreite, Tablartiefe, Deckenabstand, Untergestell) wie eine Regel-Korrektur ins Formular zurückfliessen, oder ist «Formular sagt A, Möbel ist B» gewollt?

- Was bedeutet «geändert» bei einer Variante aus älterem Schema (Felder fehlen): geändert, unverändert, oder ein dritter Zustand? Wer vervollständigt fehlende Felder beim Laden – Startwerte (wie beim Link), der vorherige Entwurf (wie heute in der Sammlung) oder die Rechen-Defaults?

- Was meint «ältere Variante» – Alter, Schema-Version oder Regelabweichung? Soll der Dialog die Ursache (Bauweise vs allgemeine Regel) unterscheiden?

- Darf «Überschreiben» den Möbeltyp eines Eintrags wechseln? Behält der Eintrag dann seinen Namen? Braucht Überschreiben ein Rückgängig wie Entfernen?

- Woran hängt ein Haken: an der Zeile im Möbeltyp (heute), am Entwurf, an der Variante oder an einem Einkauf als eigenem Objekt mit Zeitpunkt? Soll er mit Variante oder Link mitreisen?

- Welche Identität hat ein geteilter Entwurf beim Empfänger: ersetzt er den Entwurf des Typs (heute), wird er automatisch zur Variante, oder ist er ein eigener, noch nicht übernommener Zustand? Soll er eine zuvor geladene Variante «entladen»?

- Ist die Sammlung ein Behälter pro Möbeltyp oder einer für alles (heute gemischt; Spec: «Varianten eines Möbels bzw. mehrerer Ideen»)?

- Soll die geladene Variante auf dem Handy als Objekt sichtbar sein (Name, «geändert»), oder genügen die wechselnden Knopftexte?

- Braucht der Entwurf eine Zeitdimension – Rückgängig über Reload hinaus, mehrere Schritte, Zurücksetzen auf Startwerte – oder bleibt «ein Schritt, sechs Sekunden, pro Sitzung»?

- Was ist das «Niveau»: eine Eigenschaft der Bauweise (Karte) oder des Ergebnisses (R.level mit Begründung)? Soll es überhaupt noch sichtbar sein?

- Was heisst «Masse» eines Möbels: eine feste Achsenreihenfolge über alle Typen, oder je Typ wie im Formular – und wird sie beschriftet, wo beide Typen in einer Liste stehen?

- Welche Wörter gelten verbindlich und werden in Spec, UI und Code gleich verwendet: Entwurf vs Konfiguration, Variante vs Eintrag, Sperre vs Schloss, Hinweis vs Tipp vs Grund vs Notiz, Bauweise vs Bauart vs Einbau-Art vs Tragwerk, Material vs Optik vs Plattenmaterial, Kaufteile vs Kleinteile vs Beschläge?

## Oberfläche und Polish (Emil Kowalski)

Übergänge, Druck-Feedback, Hover, Meldungen, Typo, Kontrast (Layer 7).

**Kurzfassung (Phase 1):** Das CSS von Martylko ist handwerklich schon weit über dem Durchschnitt: keine `transition: all`, keine Keyframes, alle Dauern ≤ 220 ms, eigene Ease-out-Kurve, Druck-Feedback auf Knöpfen, Blur-Swap beim «Liste teilen», Hover hinter `(hover:hover) and (pointer:fine)`, `@starting-style` für Warnungen. Die Lücken liegen fast alle bei den Rückmeldungen (Toasts/«copied»-Meldungen) und bei den Elementen, die mit `all:unset` gebaut sind: Die Handy-Leiste tauscht Meta-Text und Meldung hart per `display:none`, die Ortsknöpfe unten haben weder Tap-Highlight-Unterdrückung noch Übergang noch (sehr wahrscheinlich) Fokusring, der Dialog «Was baust du?» erscheint ohne Übergang, und die Desktop-Meldung oben rechts springt rein und raus. Kleinere Punkte: Pill-Gleiten (220 ms) und Textfarbwechsel (150 ms) in den Segmenten laufen auseinander, `.btn:disabled` («Gesammelt ✓») fehlt, zwei Hover-Regeln sind nicht gegen Touch abgesichert, Tastaturaktionen animieren, und die Typo- und Abstandswerte folgen keinem Raster (12.5/13.5/15.5 px, 9/11 px Paddings). Alle Kontraste der Textpaare liegen rechnerisch ≥ 4.68:1, nur Eingabe-Rahmen (1.91:1) sind unter der 3:1-Grenze für UI-Konturen.

### Geprüft

#### [mittel] Handy-Leiste: Meldung ersetzt Meta-Text hart per display:none (Layoutsprung, kein Übergang)

*Phase 1: hoch → nach Prüfung mittel.*

Before (index.html:437-440):
`.mbar .copied:not(:empty)::before{content:"✓ "}`
`.mbar .copied:empty{display:none}`
`.mbar .copied:not(:empty){display:block;color:var(--ink)}`
`.mbar div:has(> .copied:not(:empty)) #mMeta{display:none}`
JS: `flash()` setzt `innerHTML` und löscht nach 6000 ms wieder hart (index.html:2069-2073). Auf dem Handy passiert das nach jedem Zufall, Sammeln, Link, Laden, Überschreiben – also bei den häufigsten Aktionen. Die Zeile springt zweimal (Text raus, Meldung rein, nach 6 s zurück), ohne Crossfade.

After (Vorschlag): Beide Texte im selben Grid-Feld stapeln und per Opacity/Blur blenden, wie es `.btn .swap` (index.html:352-355) schon vormacht:
`.mbar > div:first-child > div{display:grid}`
`.mbar #mMeta,.mbar .copied{grid-area:1/1;transition:opacity 180ms ease,filter 180ms ease}`
`.mbar .copied:empty,.mbar div:has(> .copied:not(:empty)) #mMeta{opacity:0;filter:blur(2px);pointer-events:none}`
(statt `display:none`; `visibility` zusätzlich über `transition-behavior:allow-discrete` falls Screenreader-Doppelung stört.)

Why: Emil: «Elements appearing or disappearing without transition feel broken» und «Use blur to mask imperfect transitions». Der Blur-Swap ist in der App bereits etabliert – gleiche Technik, gleiche 180 ms, gleiche Sprache.

Beleg: index.html:437-440 (CSS), index.html:957 (Markup), index.html:2069-2073 (flash)

- Prüfung Code: Die Handy-Leiste tauscht #mMeta und die Meldung ohne Übergang per display:none (index.html:446-449); flash() setzt innerHTML und leert nach 6 s hart (index.html:2068-2072). Auslöser auf dem Handy: Zufall, Sammeln, Laden, Überschreiben, Anpassen – «Link» nur im Clipboard-Fallback, da sonst navigator.share greift. Kein Seitensprung, da fixed; Höhe ändert sich nur bei umbrechenden Meldungen.
- Prüfung Wirkung: Nach jedem Zufall, Sammeln, Link oder Laden tauscht die zweite Zeile der Handy-Leiste («Holz Zuschnitt · 10 Teile») ohne Blende gegen die Meldung und nach 6 s zurück. Bei kurzen Meldungen ist es ein harter Textwechsel in gleicher Höhe, bei langen (z. B. «An die Bauweise angepasst …») wächst die fixe Leiste sprunghaft nach oben. Mehrmals pro Sitzung sichtbar, verstärkt den Eindruck «unfertig», behindert aber nichts.

#### [mittel] Ortsknöpfe in der Handy-Leiste: kein Tap-Highlight-Schutz, kein Übergang, kein Druck-Feedback, Fokusring vermutlich weg

*Phase 1: hoch → nach Prüfung mittel.*

Before (index.html:418-419):
`.mnav button{all:unset;text-align:center;padding:8px 2px;min-height:28px;border-radius:8px;font-size:13px;font-weight:600;color:var(--muted);cursor:pointer}`
`.mnav button[aria-current="page"]{color:var(--accent);background:var(--accent-soft)}`
Die Liste mit `-webkit-tap-highlight-color:transparent` (index.html:340) enthält `.seg label,.card,.btn,.vbtn,.tab,.gh`, aber nicht `.mnav button`, `.linkbtn`, `.wahlbtn`, `.lock`, `.kauf label`. Beim Tippen flackert auf iOS/Android also das graue Systemhighlight genau bei den am häufigsten getippten Knöpfen der App, während alle anderen Knöpfe ruhig bleiben. Es gibt keine `transition` für `color`/`background-color` und kein `:active`. Zusätzlich: `all:unset` setzt `outline` auf `none`, und `.mnav button` (0,1,1) schlägt das globale `:focus-visible{outline:…}` (index.html:49, Spezifität 0,1,0) – anders als `.gh`, `.lock`, `.wahlbtn`, `.warnhead`, die eigene `:focus-visible`-Regeln haben (index.html:70, 129, 377, 381). Im Browser zu verifizieren.

After:
`.mnav button{… ;-webkit-tap-highlight-color:transparent;transition:color 150ms ease,background-color 150ms ease,transform 160ms var(--ease-out)}`
`.mnav button:active{transform:scale(.97)}`
`.mnav button:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}`
und `.mnav button,.linkbtn,.wahlbtn,.lock,.kauf label` in die Zeile 340 aufnehmen.

Why: Emil: «Buttons must feel responsive … applies to any pressable element», plus Konsistenz – ein Tab, der anders reagiert als die restliche App, fällt genau deshalb auf.

Beleg: index.html:418-419, index.html:340, index.html:49, index.html:958-963

- Prüfung Code: .mnav button (index.html:437-438) fehlt in der Tap-Highlight-Liste (index.html:340), hat weder transition noch :active, und all:unset entfernt den Fokusring, weil die Regel spezifischer ist als das globale :focus-visible (index.html:49) – im Code sicher, aber auf dem Zielgerät (iPhone, kaum Tastatur) selten sichtbar. Ebenfalls ohne Tap-Highlight-Schutz: .linkbtn, .wahlbtn, .lock, .kauf label.
- Prüfung Wirkung: Die vier Ortsknöpfe unten sind die meistgetippten Elemente der App und die einzigen, die auf iOS beim Tippen das graue Systemhighlight zeigen und ohne Druck- oder Farbübergang umschalten – ein spürbarer Bruch zu allen anderen Knöpfen, jede Sitzung. Der fehlende Fokusring betrifft nur Tastaturbedienung am Handy/Tablet und spielt für Kims Nutzer kaum eine Rolle.

#### [mittel] Dialog «Was baust du?» erscheint und verschwindet ohne Übergang (inkl. Backdrop)

*Phase 1: hoch → nach Prüfung mittel.*

Before (index.html:66-67):
`.wahl{border:1px solid var(--line);border-radius:14px;background:var(--panel);…;box-shadow:var(--shadow)}`
`.wahl::backdrop{background:rgba(10,20,24,.35)}`
Keine `transition`, kein `@starting-style`, kein `transition-behavior`. Geöffnet per `wahl.showModal()` (index.html:2093), geschlossen per `wahl.close()` (2098, 2101, 2114). Der Dialog ist das Erste, was ein neuer Nutzer sieht (`oeffneWahl({erst:true})`, index.html:2277), und kommt bei jedem Typwechsel über `#bKind`.

After (Modal → bleibt zentriert, kein transform-origin nötig):
`.wahl{opacity:1;transform:scale(1);transition:opacity 200ms var(--ease-out),transform 200ms var(--ease-out),overlay 200ms allow-discrete,display 200ms allow-discrete}`
`.wahl::backdrop{transition:background-color 200ms ease,overlay 200ms allow-discrete,display 200ms allow-discrete}`
`@starting-style{.wahl[open]{opacity:0;transform:scale(.96)} .wahl[open]::backdrop{background:rgba(10,20,24,0)}}`
`.wahl:not([open]){opacity:0;transform:scale(.98)} .wahl:not([open])::backdrop{background:rgba(10,20,24,0)}`
Exit mit `transition-duration:150ms` kürzer als Enter.

Why: Emil: Modals sind «occasional → standard animation», 200–500 ms, ease-out, nie ab `scale(0)`; Exit schneller als Enter. Erster Eindruck der App.

Beleg: index.html:66-67, index.html:948-955, index.html:2093-2101, index.html:2277

- Prüfung Wirkung: Beim Erstbesuch steht der Dialog mit dem Seitenaufbau da, das fällt nicht auf. Spürbar ist der harte Schnitt beim Schliessen nach der ersten Wahl – das ist die erste Rückmeldung, die ein Freund von der App bekommt – und beim gelegentlichen Öffnen über «Sideboard ▾». Ein- oder zweimal pro Sitzung, prägt den ersten Eindruck, behindert nichts.

#### [mittel] flash(): fester 6-s-Timer ohne Pause bei Hover/verstecktem Tab, hartes Leeren – «Rückgängig» verschwindet unter der Hand

Before (index.html:2069-2073):
```
function flash(sel, html){
  for (const el of document.querySelectorAll(sel)) {
    el.innerHTML = html;
    clearTimeout(el._t); if (html) el._t = setTimeout(() => { el.innerHTML = ''; }, 6000);
  }
}
```
Die Meldung trägt bei Zufall/Laden/Entfernen den einzigen Weg zurück (`undoBtn`, index.html:2063; `#bUndo`, 2222). Wer die Maus zum Knopf bewegt oder kurz den Tab wechselt, verliert ihn trotzdem nach 6 s. Innerhalb von 6 s ausgelöste Folgemeldungen ersetzen den Inhalt ohne Übergang.

After (JS-Verhalten, CSS siehe Items 1 und 4): Timer bei `pointerenter`/`focusin` auf dem Element anhalten, bei `pointerleave`/`focusout` neu starten; bei `document.visibilityState === 'hidden'` pausieren (Sonner-Prinzip). Für die Rückgängig-Meldung den Timer weglassen und erst bei der nächsten Aktion ersetzen.

Why: Emil/Sonner: «Pause toast timers when the tab is hidden», «Fill gaps … to maintain hover state». Ein Toast mit Aktion ist kein Toast mehr, sondern ein Angebot – es darf nicht ablaufen, während man es gerade annimmt.

Beleg: index.html:2069-2073, index.html:2063-2066, index.html:2219-2226

- Prüfung Wirkung: Nach Zufall, Laden oder Entfernen steht der einzige Rückweg («Rückgängig») in einer Meldung, die nach fixen 6 s verschwindet – zu kurz, um am Handy das neue Möbel anzuschauen und zu entscheiden. Hover- oder Tab-Pausen sind dafür am iPhone unerheblich; der Punkt ist, dass eine Meldung mit Aktion überhaupt abläuft.

#### [tief] Desktop-Meldung oben rechts (.hacts .copied) springt rein und raus, obwohl sie wie ein Popover vom Knopf hängt

*Phase 1: mittel → nach Prüfung tief.*

Before (index.html:83-84):
`.hacts .copied{position:absolute;right:0;top:calc(100% + 6px);z-index:20;background:var(--raise);border:1px solid var(--line);border-radius:8px;padding:5px 11px;box-shadow:var(--shadow);font-size:13px;color:var(--ink)}`
`.hacts .copied:empty{display:none}`
Keine transition; `display` toggelt über `:empty`, deshalb kann es weder ein- noch ausblenden. Wird nach Zufall (2066), Sammeln (2191), Link (2242), Laden (2177), Überschreiben (2166) gezeigt.

After:
`.hacts .copied{… ;transform-origin:top right;transition:opacity 180ms var(--ease-out),transform 180ms var(--ease-out),display 180ms allow-discrete}`
`@starting-style{.hacts .copied:not(:empty){opacity:0;transform:translateY(-4px) scale(.97)}}`
`.hacts .copied:empty{display:none;opacity:0;transform:translateY(-4px) scale(.97)}`
Exit ggf. mit 120 ms (`transition-duration` auf `:empty` setzen) kürzer als Enter.

Why: Emil: Popovers scale from their trigger (`transform-origin` oben rechts, wo der Knopf sitzt), Enter mit ease-out, Exit schneller. Dieselbe Meldung trägt «Rückgängig» – sie darf nicht wie ein Fehler aufblitzen.

Beleg: index.html:83-84, index.html:520, index.html:2069-2073

- Prüfung Code: Die Desktop-Meldung .hacts .copied (index.html:76-77) wird per :empty{display:none} ein- und ausgeblendet, ohne transition. Ausgelöst von Zufall (2065), Überschreiben (2171), Laden (2178), Sammeln (2203), Link kopiert (2242) sowie Anpassen (1348-1349, 2191).
- Prüfung Wirkung: Die Desktop-Meldung unter dem Kopf hält die Spec-Vorgabe «verschiebt nichts» ein, erscheint und verschwindet aber ohne Blende. Nur am Desktop, wenige Male pro Sitzung; sinnvoll zusammen mit der Handy-Leiste zu lösen, allein kein eigenes Gewicht.

#### [tief] `.btn:disabled` fehlt – «Gesammelt ✓» sieht aus wie ein aktiver Primärknopf

*Phase 1: mittel → nach Prüfung tief.*

Before: Im ganzen CSS gibt es nur `.card:has(input:disabled)` (index.html:188) und `.seg input:disabled + label` (189); `.btn` hat keinen `:disabled`-Zustand (index.html:254-255). `renderVariante()` setzt `b.disabled = passt && !anders` und den Text «Gesammelt ✓» (index.html:2152-2153), der Knopf behält aber Akzent-Hintergrund, `cursor:pointer` und Hover-Farbe. Erscheint nach jedem Sammeln und bleibt stehen, bis etwas geändert wird.

After:
`.btn:disabled{cursor:default;background:var(--accent-soft);color:var(--accent);border-color:transparent}`
`.btn:disabled:active{transform:none}`
Oder: den Zustand als eigenes Element (`<span class="chip">Gesammelt ✓</span>`) statt als deaktivierter Knopf anzeigen – siehe offene Frage.

Why: Emil: «State indication» – der Nutzer soll ohne Nachdenken sehen, dass hier nichts mehr zu tun ist. Ein deaktivierter Knopf im Primär-Look verspricht eine Aktion, die nicht kommt.

Beleg: index.html:254-255, index.html:188-189, index.html:2150-2153

- Prüfung Code: Es gibt keinen .btn:disabled-Zustand (index.html:253-254). «Gesammelt ✓» (index.html:2161-2162) sieht auf dem Desktop wie der aktive Primärknopf aus, auf dem Handy wie der aktive Ghost-Knopf; cursor:pointer bleibt. Eine Hover-Farbe für .btn existiert nicht, sie kann also auch nicht irritieren.
- Prüfung Wirkung: Nach dem Sammeln bleibt der Knopf als «Gesammelt ✓» stehen und sieht weiter antippbar aus – auf dem Handy als umrandeter Ghost-Knopf, nur am Desktop als gefüllter Primärknopf. Wer ihn antippt, bekommt keine Reaktion. Ein- bis zweimal pro Sitzung, mild irritierend.

#### [tief] Typografie und Abstände folgen keinem Raster (12.5/13.5/15.5 px, 9/11 px Paddings)

Before (Auswahl): Schriftgrössen 10.5 (`.ticks span`, index.html:376), 11 (81, 278), 11.5 (171), 12 (145), 12.5 (161, 174, 185, 290), 13 (148, 253), 13.5 (254, 280, 306), 14 (152, 177), 15 (82, 302), 15.5 (`.steps h3`, 311), 16 (288), 20, 21, 22, 26. Paddings: `9px 11px` (`.card`, 176), `8px 12px` (`.warn`, 241), `7px 14px` (`.btn`, 254), `6px 11px` (`.vbtn`, 226), `10px 14px` (`.coll li`, 263), `12px 14px` (`.kauf section`, 300). Uppercase-Labels einmal 11 px/.08em (81, 278), einmal 12 px/.1em (145).

After: eine Skala als Tokens festlegen und konsequent nutzen, z. B. `--fs-1:11px; --fs-2:12px; --fs-3:13px; --fs-4:14px; --fs-5:15px; --fs-6:17px` und Abstände auf 4-px-Raster (`4/8/12/16/20/24`). Konkret: `.card{padding:8px 12px}`, `.vbtn{padding:6px 12px}`, `.steps h3{font-size:15px}`, `.group h2` und `.summary dt` auf identische Werte (11 px, .08em).

Why: Emil: «Unseen details compound» – niemand liest 12.5 px, aber die Summe der halben Pixel ist der Unterschied zwischen «stimmig» und «irgendwie unruhig».

Beleg: index.html:81, 145, 148, 161, 171, 174, 176, 226, 241, 253-254, 263, 278, 280, 300, 311, 376

- Prüfung Code: Schriftgrössen nutzen Halbpixel (10.5, 11.5, 12.5, 13.5, 15.5 px) und sind nicht als Tokens definiert, aber intern recht konsistent (12.5 px als wiederkehrender Kleintext, index.html:161, 183, 236, 295, 308, 337, 398). Paddings weichen vom 4-px-Raster ab (.card 9/11 in 177, .vbtn 6/11 in 228, .btn 7/14 in 253). Uppercase-Labels einmal 11 px/.08em (81, 278), einmal 12 px/.1em (145).

### Verworfen

#### ~~Segmente: Pill gleitet 220 ms, Textfarbe wechselt 150 ms – die Farben laufen dem Hintergrund voraus~~

- Widerlegt (Wirkung): Praktisch keine Nutzerwirkung. Die Pill nutzt --ease-out: cubic-bezier(.23,1,.32,1) (index.html:20, :343); bei 150 von 220 ms (x = 0.68) liegt der Bezier-Fortschritt bei ≈ 0.99 – die Pill ist also schon unter der neuen Beschriftung, wenn deren Farbe fertig gewechselt hat. Der Befund selbst räumt ein, dass es nur in DevTools-Zeitlupe sichtbar ist. Weder Kim noch Freunde nehmen das wahr, und es hat nichts mit den benannten Schmerzen (Formular überfordert, Kopf unfertig) zu tun. Wenn die Segmente ohnehin angefasst werden, kann die Dauer als Einzeiler angeglichen werden – als Review-Befund trägt es nicht.

#### ~~Preis in der Handy-Leiste ohne Tabellenziffern – Breite flackert beim Schieben~~

- Widerlegt (Code): Nachgemessen am echten Font: Die von Google Fonts ausgelieferte Latin-Teilmenge von Familjen Grotesk (v11, Link index.html:7) hat GSUB-Features pnum UND tnum, und die Standardziffern 0-9 haben alle dieselbe Vorschubbreite (680/1200 upm). Die Ziffern sind also bereits von Haus aus tabellarisch; font-variant-numeric:tabular-nums würde nichts Sichtbares ändern, ein Breitenflackern beim Schieben gibt es nicht. Zudem ist #mMeta nicht «daneben», sondern darunter (.mbar b display:block, index.html:440; #mMeta display:block, 443) und kann nicht mitrücken. Zeile: .mbar b steht in 440, nicht 423. Der Preis wird zudem auf 5 CHF gerundet (chf, index.html:1381), was Stellenwechsel seltener macht. Richtig bleibt nur, dass die Angabe tabular-nums als explizite Absicherung fehlt – ohne sichtbare Folge.

### Nachträge der Skeptiker

- (Code) Ortsknöpfe unterhalb der Touch-Zielgrösse: .mnav button hat min-height:28px (index.html:437; effektiv ca. 35 px mit Padding 8 px + 13 px × 1.5), während der Touch-Block index.html:403-415 .btn, select und .tab auf 44 px hebt und .vbtn auf 40 px. Die vier meistgetippten Knöpfe der App sind damit die kleinsten Ziele.

- (Code) Primär- und Ghost-Knöpfe (.btn) haben auf dem Desktop keinen Hover-Zustand: Der Hover-Block index.html:230-236 deckt .vbtn, .card, .seg label, .tab, nicht .btn (index.html:253-254). Sammeln, Link teilen, Zufall, Wahl-Knöpfe reagieren nur auf :active (index.html:348), was zur Wahrnehmung «uneinheitlich» beiträgt.

- (Code) Das Häkchen in der Handy-Leiste ist inhaltsblind: .mbar .copied:not(:empty)::before{content:"✓ "} (index.html:446) setzt vor jede Meldung ein Häkchen, auch vor die Fehlermeldung «Der Link ist ungültig …» (index.html:2250) und vor neutrale Meldungen wie «Neu gewürfelt.» (2065) – das Statuszeichen widerspricht dem Text.

- (Code) backdrop-filter ohne -webkit-Präfix (index.html:228 .vbtn, 434 .mbar; grep -webkit-backdrop leer): Safari vor Version 18 (iOS 17 und älter) wertet die Eigenschaft nicht aus; Leiste und 3D-Knöpfe fallen dort auf 92 %/88 % Deckkraft ohne Blur zurück. Beim Testgerät iPhone Safari hängt das Erscheinungsbild damit von der iOS-Version ab.

- (Code) Reduced-Motion-Block (index.html:488-492) ist unvollständig: Er schaltet Pill, Tab-Indikator und :active-Transform ab, lässt aber die translateY-Einblendung der Warnungen (index.html:357-358), die Pfeil-Rotation .gh svg (index.html:380), die Card-Transform (index.html:347) und den Blur-Swap (index.html:353-355) laufen. Phase 1 erwähnte nur das Druck-Feedback als offene Frage.

- (Wirkung) Preis und Kennzahlen doppelt auf dem ersten Handy-Bildschirm: Der Kopf zeigt «TOTAL CA. CHF 245 · Holz Zuschnitt CHF 245 · ganze Platten CHF 475» (index.html:519, CSS :82-86), die Leiste gleichzeitig «CHF 245 · Holz Zuschnitt · 10 Teile» (:957, :423) – handy-entwerfen.png zeigt beide auf einmal. Die Spec sichert den Preis am Handy über die Leiste («Der Preis bleibt in jedem Ort sichtbar»), der Kopf-Block ist dort redundant und schiebt das Möbel auf y≈340 und das erste Eingabefeld auf y≈880 – direkt gegen das 30-s-Kriterium (Möbel sehen, Mass ändern).

- (Wirkung) Das Formular beginnt mit «Zufall» und einem Satz über das Schloss («Mit dem Schloss bei einer Gruppe bleibt sie beim Würfeln, wie sie ist.», index.html:548-550) statt mit den Massen – auf Handy (handy-entwerfen-voll.png) und Desktop (desktop-entwerfen.png) ist das erste Bedienelement eine Meta-Funktion mit einer Erklärung, die ein Neuling nicht einordnen kann. Trifft Kims Schmerz «wo anfangen» im ersten Moment.

- (Wirkung) Die Leisten-Aktionen «Sammeln» und «Link» stehen an allen vier Orten (index.html:957), auch in Einkaufen und Bauen (handy-einkaufen.png, handy-bauen.png), also im Baumarkt und in der Werkstatt, wo sie nichts zu tun haben. Die Ansichten-Spec (Abschnitt Handy) sieht «wenn nötig «Sammeln»» vor, also kontextabhängig. Beim Reduit kostet das zusätzlich Platz, den die Leiste nicht hat (handy-reduit-entwerfen.png: «Link» abgeschnitten).

- (Wirkung) Der Kopf mit Marke, Tagline «Masse eingeben – Materialliste, Plattenplan und Bauablauf erhalten.» (index.html:515) und «Sideboard ▾» (:518) steht an jedem Ort gleich hoch; in Einkaufen beginnt die Liste erst bei y≈290 (handy-einkaufen.png). Der Erklärsatz für Erstbesucher steht bei jedem Baumarktbesuch über der Einkaufsliste, und der Typwechsel-Knopf wird dort angeboten, wo er die Liste stillschweigend tauscht.

- (Wirkung) Desktop-Kopf: Textlink «Sammlung», gefüllter Knopf «In Sammlung» und Ghost-Knopf «Link teilen» stehen direkt nebeneinander (index.html:520; desktop-entwerfen.png) – drei Knopfstile und zwei fast gleiche Wörter für zwei verschiedene Dinge (Ort öffnen vs. Variante speichern) in Kims benannter Problemzone «Kopf». Phase 1 nennt nur Umbruch, ungleiche Höhen und fehlenden aria-current, nicht die Stil- und Wortnachbarschaft.

### Ungeprüft (Phase 1, tief/info)

- **[mittel] Inline-Meldungen (#copied, #collMsg) verschieben die Toolbar, wenn sie erscheinen** – Before (index.html:257, 259-260): `.copied{font-size:13px;color:var(--muted)}` `.acts{display:flex;gap:8px;flex-wrap:wrap;align-items:center}` `.acts .copied{flex-basis:100%}` `#copied` liegt in `.acts` der Einkaufen-Toolbar (index.html:901), `#collMsg` in der Sammlung-Toolbar (942). Wird Text gesetzt, bekommt die Meldung eine ganze Zeile (`flex-basis:100%`) bzw. einen Flex-Slot – die Liste darunter rutscht nach … *(Beleg: index.html:257-260, index.html:901, index.html:942, index.html:2069-2073)*

- **[mittel] Zwei Hover-Regeln stehen ausserhalb von `@media (hover:hover) and (pointer:fine)`** – Before: `.coll input:hover{border-color:var(--line)}` (index.html:265) `.lock:hover{opacity:1}` (index.html:376) Alle anderen Hover sind korrekt gekapselt (index.html:228-234). Auf Touch bleibt nach dem Tippen auf den Namen in der Sammlung der Rahmen, bzw. das Schloss bleibt voll sichtbar («sticky hover»), bis woanders getippt wird.  After: beide Regeln in den bestehenden Block Zeile 228-234 verschieben: `@media … *(Beleg: index.html:265, index.html:376, index.html:228-234)*

- **[tief] Tastaturaktionen animieren: Pfeiltasten auf Segmenten und Reitern lösen das 220-ms-Gleiten aus** – Before: `form.addEventListener('change', pillOnChange)` ruft `placePill(seg, true)` für jedes `change` (index.html:1915-1916) – auch wenn der Radio per Pfeiltaste gewechselt wurde. Reiter: `ArrowRight/Left → n.click(); n.focus()` (index.html:1888-1892) → `selectTab` → `placeTabInd(true)` (1885). `.bausub` und `#collSort` analog (1512, 2126).  After: Eingabemodalität merken und bei Tastatur ohne Animation setzen, z. … *(Beleg: index.html:1885-1892, index.html:1904-1916, index.html:1512, index.html:2126)*

- **[tief] prefers-reduced-motion: Block ist teils wirkungslos, teils zu grob, und lässt eine echte Bewegung durch** – Before (index.html:490-494): ``` @media (prefers-reduced-motion:reduce){   *{animation:none!important}   .seg::before,.tabind{transition:none!important}   :active{transform:none!important} } ``` - `*{animation:none}` trifft nichts: es gibt keine `@keyframes` im Stylesheet (grep-leer). - `.warn` behält `transform:translateY(-4px)` beim Eintritt (index.html:344-345) – das ist Positionsbewegung. - `.gh … *(Beleg: index.html:490-494, index.html:344-345, index.html:383, index.html:1541, index.html:1696)*

- **[tief] Bauweise-Karte: Beschreibung blendet ein, Details (.bwdet) springen – Liste in Zeile 346 unvollständig** – Before (index.html:346-347): `.controls.ready :is(.group,.field,.dim,.check,.cards,.row2,.desc){transition:opacity 200ms var(--ease-out)}` `@starting-style{.controls.ready :is(…){opacity:0}}` Beim Wählen einer Bauweise wird `.desc` sichtbar (fade, 200 ms), aber `.bwdet` (`dl`, index.html:197, 201: `display:none` → `grid`) und `.grund` (202, 205) sind nicht in der Liste und erscheinen hart. Zusätzlich: innerhalb … *(Beleg: index.html:346-347, index.html:197-205, index.html:409)*

- **[tief] Warnungs-Kopf (Desktop) klappt mit Glyph-Tausch ▾/▴, Gruppen-Chevron rotiert – zwei Sprachen für dasselbe** – Before: `.warnhead::after{content:"▾"}` / `.warnbox.open .warnhead::after{content:"▴"}` (index.html:126-127), `.warnbox:not(.open) .warns{display:none}` (130) – harter Schnitt. Daneben `.gh svg{transition:transform 200ms var(--ease-out)}` und `.group.collapsed .gh svg{transform:rotate(-90deg)}` (383, 411) – weiches Drehen.  After: dasselbe Chevron-SVG wie in `.gh` verwenden und `transform:rotate(180deg)` mit 200 ms … *(Beleg: index.html:126-130, index.html:383, index.html:411, index.html:1410-1413)*

- **[tief] Totes CSS: Reiter-Styles für ≤ 640 px sind unerreichbar** – Before: `@media (max-width:640px){ .tabs{display:grid;grid-template-columns:1fr 1fr;…} .tab{border:1px solid …} .tab[aria-selected="true"]{…} .tabs.ind …{…} .tabind{display:none} }` (index.html:456-461). Aber `@media (max-width:920px){ .output .tabs{display:none} }` (index.html:391) blendet die einzige `.tabs`-Instanz (888) ab 920 px aus; die 640-px-Regeln können nie sichtbar werden.  After: Block 456-461 streichen … *(Beleg: index.html:391, index.html:456-461, index.html:888)*

- **[tief] Rahmen von Eingabefeldern unter 3:1 Kontrast (UI-Kontur), Textkontraste sonst in Ordnung** – Before: `.num{border:1px solid var(--line-strong)}` (index.html:153), `select{border:1px solid var(--line-strong)}` (159), `.seg{border:1px solid var(--line-strong)}` (168). `--line-strong:#B3BEBA` auf `--raise:#FFFFFF` ergibt rechnerisch 1.91:1 (WCAG 1.4.11 verlangt 3:1 für Komponenten-Konturen). Textpaare sind alle gut: muted/ground 5.11, muted/panel 5.59, accent/ground 6.32, warn/warn-bg 5.68, muted/accent-soft … *(Beleg: index.html:12, 153, 159, 168, 171, 374, 376 (Werte per Script aus den Tokens Zeile 10-14 gerechnet))*

- **[tief] «Liste teilen»: Fallback-Meldung «Text markiert …» wird nie geleert; Dialog-Knöpfe ohne Press-/Hover-Zustand** – Before: Bei fehlgeschlagenem Clipboard setzt `fallback()` `msg.textContent = 'Text markiert – mit Ctrl+C kopieren.'` (index.html:2023); geleert wird `#copied` nur im Erfolgsfall (2026). Der Hinweis bleibt stehen, bis ein Kopieren gelingt. Zweitens: `.wahlbtn{all:unset;…;cursor:pointer}` (69) und `.linkbtn` (261) haben keine `transition`, kein `:active`, keinen Hover – im Gegensatz zu `.btn/.vbtn` (347-348).  After: … *(Beleg: index.html:2019-2029, index.html:69-72, index.html:261, index.html:347-348)*

- **[info] Gut: Transitions nennen exakte Properties, keine Keyframes, alle Dauern ≤ 220 ms, eigene Ease-out-Kurve** – `--ease-out:cubic-bezier(.23,1,.32,1)` als Token (index.html:21) – exakt die Kurve, die Emil als «strong ease-out» empfiehlt. Keine einzige `transition: all`, kein `ease-in`, keine `@keyframes`, kein `scale(0)`-Eintritt (alle per grep bestätigt). Längste Transition 220 ms (Pill/Tabind, 343, 365), Rest 150–200 ms (176, 347, 356, 383). 3D-Türen/Explosion laufen als Lerp mit k=0.12 im rAF (1696-1698), interruptibel. … *(Beleg: index.html:21, 342-349, 365, 1696-1698)*

- **[info] Gut: Druck-Feedback, Tap-Highlight, Blur-Swap beim «Liste teilen»** – `.btn:active,.vbtn:active{transform:scale(.97)}` mit `transition:transform 160ms var(--ease-out)` (index.html:347-348) und `.card:active{transform:scale(.99)}` (349) – Lehrbuch. `-webkit-tap-highlight-color:transparent` auf den Hauptflächen (340). `.btn .swap` stapelt zwei Texte in einem Grid-Feld und blendet mit `opacity`+`filter:blur(2px)` über 180 ms (352-355), JS hält den Zustand 1800 ms (2027-2028) – genau … *(Beleg: index.html:340, 347-349, 352-355, 2027-2028)*

- **[info] Gut: Hover hinter Media-Query, Pill/Indikator ohne Animation bei Layout-Änderungen, Warnungen mit Node-Wiederverwendung** – `@media (hover:hover) and (pointer:fine){ .vbtn:hover … .card:hover … .seg label:hover … .tab:hover }` (index.html:228-234). `placePill(seg,false)`/`placeTabInd(false)` setzen `.still` bzw. `transition:none` + Reflow, damit Resize, Ortswechsel und Laden nicht animieren (1897-1912, 1986). `.warn` nutzt `@starting-style` (344-345) und `renderWarns` behält bestehende Knoten per `Map` (1400-1405), sodass unveränderte … *(Beleg: index.html:228-234, 344-347, 1400-1405, 1897-1912, 1979-1988, 2278)*

- **[info] Gut: Fokus-Zustände durchdacht, Tabellenziffern dort, wo Zahlen laufen** – Globales `:focus-visible{outline:2px solid var(--accent);outline-offset:2px}` (index.html:49). Wo der Akzent als Hintergrund liegt, wechselt der Ring auf `--ink` und nach innen: `.seg input:focus-visible + label{outline:2px solid var(--ink);outline-offset:-3px}` (173), `.swatches … .sw{outline:2px solid var(--ink);outline-offset:4px}` (213). `.num input:focus{outline:none}` + `.num:focus-within{outline…}` (156-157) … *(Beleg: index.html:49-50, 82, 156-157, 162, 166, 173, 187, 196, 213, 376)*

- **[info] Gut: Farbtokens mit ausreichendem Textkontrast in hell und dunkel** – Aus den Tokens (index.html:10-14, 23-33) gerechnet: hell muted/ground 5.11:1, muted/panel 5.59, muted/raise 5.86, accent/ground 6.32, on-accent/accent 7.26, warn/warn-bg 5.68, ink/accent-soft 12.64; dunkel muted/ground 6.92, accent/ground 8.30, on-accent/accent 8.43, warn/warn-bg 7.86. Alle über AA 4.5:1, die meisten über 5:1. Zudem `color-scheme:dark` gesetzt (25, 37), sodass native Controls (Checkbox, Select, … *(Beleg: index.html:10-14, 23-33, 37-46)*

### Offene Fragen aus dieser Linse

- Soll der Dialog «Was baust du?» eine Ein-/Ausblendung bekommen (200 ms, Modal bleibt zentriert), oder ist das sofortige Erscheinen bewusst gewählt, weil er beim ersten Besuch ohnehin blockiert?

- Ist «Gesammelt ✓» als deaktivierter Primärknopf gewollt, oder soll der Zustand als Status-Chip (nicht klickbar, dezent) dargestellt werden?

- Meldungen mit «Rückgängig» (Zufall, Laden, Entfernen): 6 s fester Timer behalten, bei Hover/Fokus pausieren, oder stehen lassen bis zur nächsten Aktion?

- Ortswechsel auf dem Handy: bewusst ohne Übergang (schnell, Raycast-Prinzip) belassen, oder eine kurze Opacity-Blende (≤ 150 ms) zwischen den Orten gewünscht?

- Soll die Typo-/Abstandsskala vereinheitlicht werden (12.5/13.5/15.5 px → 12/13/14/16; Paddings auf 4-px-Raster)? Das berührt viele Stellen in index.html:1-495 und braucht einen Sichttest auf Handy und Desktop.

- Reduced Motion: Druck-Feedback (scale .97) auch bei prefers-reduced-motion behalten? Aktuell wird es dort abgeschaltet (index.html:491).

- Hat Familjen Grotesk Tabellenziffern (tnum)? Falls nein: Preis in der Kopfzeile und der Handy-Leiste in IBM Plex Mono oder Figtree setzen?

## Mobile-Native (Handy-Gefühl)

Viewport, Eingaben, Touch, Tastatur, Trefferflächen, Manifest.

**Kurzfassung (Phase 1):** Martylko hat die mobilen Grundlagen bewusst gesetzt: korrektes Viewport-Meta ohne Zoom-Sperre, 38svh für die Bühne, 100dvh für die Desktop-Shell, safe-area an Leiste und Seitenrändern, Hover nur unter (hover:hover), Share-Sheet nur bei groben Zeigern. Was fehlt, ist die zweite Schicht, die «Website im Browser» von «installiert» trennt: Eingabefelder unter 16px (iOS zoomt beim Fokus), keine Reaktion auf die Tastatur bei einer sticky Bühne von 38-40 % Bildschirmhöhe plus fixer Leiste (im Querformat bleiben gemessen 43px fürs Formular), ein Canvas mit touch-action:none, auf dem Wischen die Seite nie scrollt, und lückenhaftes Tap-/Press-Feedback. Trefferflächen sind grösstenteils 44px, Ausnahmen sind die 3D-Knöpfe (40×40), Segmente (42), Haken (32), Slider (30), Namensfeld in der Sammlung (31) und die Textlinks «Zufall» (39×23) sowie «Rückgängig». Theme-Color, Manifest und Icon fehlen ganz (favicon.ico 404). Die Masse wurden headless mit Touch-Emulation (390×844, 375×667, 844×390) gemessen; Tastatur-, Zoom- und Doppeltipp-Verhalten sind nur am echten Gerät prüfbar.

### Geprüft

#### [hoch] Eingabefelder 14-15px: iOS zoomt beim Fokus; inputmode lückenhaft (Prüfpunkt 5)

Ist: «.num input{…font-size:14px}» (153, gemessen 14px), select erbt 15px vom body (45/48, gemessen 15px), «.coll input{font-size:15px}» (266), «.copybox{font-size:12px}» (273) wird per box.focus() fokussiert (2024). inputmode="numeric" steht an den Massfeldern (557 ff.), fehlt gemessen bei nicheLW/LH/RW/RH, sheetL, sheetB, kerf, price (807-815, 862-871); #kerf hat step 0.5 und bräuchte inputmode="decimal" (numeric blendet auf iOS das Komma aus). Kein enterkeyhint (0 Treffer); das Namensfeld der Sammlung (2142) hat keinen Enter-Handler (nur change, 2209) – Return lässt die Tastatur offen. Soll: «@media (pointer:coarse){.num input,select,.coll input,.copybox{font-size:16px}}» plus inputmode="decimal" an #kerf, inputmode="numeric" an den übrigen, enterkeyhint="done" am Namensfeld. Warum: Safari zoomt die Seite bei Fokus unter 16px; danach sitzen sticky Bühne und fixe Leiste verschoben und die Seite ist seitlich verschiebbar – trifft die Kernhandlung «Masse eingeben». Verifizierbar: Schriftgrössen am Code (gemessen), Zoom nur am iPhone.

Beleg: index.html:153 «.num input{…font-size:14px…}», index.html:266 «.coll input{…font-size:15px…}», index.html:862-863 sheetL/sheetB ohne inputmode, index.html:870 #kerf step="0.5" ohne inputmode

- Prüfung Code: Wie beschrieben, mit korrigierten Stellen: sheetL/sheetB index.html:865-866, kerf :874 (step 0.5, ohne inputmode), price :875, Nischenfelder :705-706 und :712-713, Fokus der Copybox :2023. Das Namensfeld der Sammlung (:2142) steht ausserhalb des Formulars, Enter hat dort keine Wirkung.
- Prüfung Wirkung: Kern des Befunds: die drei Massfelder und die zwei Selects zoomen auf dem iPhone beim Fokus und die Seite bleibt gezoomt – jede Sitzung, in der jemand ein Mass tippt. inputmode-Lücken (Nische, Plattenformat, Fuge, Preis), enterkeyhint und copybox sind Randfälle; die copybox erreicht am Handy niemand.

#### [hoch] Canvas touch-action:none auf 40 % des Bildschirms – Wischen scrollt nie (Prüfpunkt 6)

Ist: «#stage{…touch-action:none…}» (222, gemessen none). OrbitControls r128 (967) registriert touchstart/touchmove mit passive:false und preventDefault (Lib Zeilen 884, 948, 1003-1010) und setzt selbst kein style.touchAction – das CSS entscheidet; touches.ONE = ROTATE. Auf dem Handy ist die Bühne sticky oben (419) und misst 321px (390×844) bzw. 253px (375×667), also 38-40 % der Höhe, direkt über dem Formular. Soll: «#stage{touch-action:pan-y}» – senkrechtes Wischen scrollt, ein Finger waagrecht dreht, zwei Finger zoomen/verschieben weiter; alternativ Bühne beim Scrollen verkleinern (siehe Prüfpunkt 11). Warum: Jeder Scroll-Wisch, der auf der Vorschau startet, bewegt die Seite nicht, sondern dreht das Möbel; bei einer sticky Bühne passiert das ständig. Verifizierbar: Fläche und Deklaration am Code; ob OrbitControls unter pan-y sauber loslässt, nur am Gerät. Produktentscheid nötig (Ein-Finger-Drehen vs. Scrollen).

Beleg: index.html:222 «#stage{width:100%;aspect-ratio:16/10;max-height:66vh;min-height:280px;touch-action:none;cursor:grab}», index.html:419-420 sticky Viewer 38svh; OrbitControls.js r128 Zeile 884 «event.preventDefault(); // prevent scrolling»

- Prüfung Code: Wischen auf der Bühne scrollt nie – wegen touch-action:none (index.html:222) UND weil OrbitControls r128 touchstart/touchmove nicht-passiv abfängt und preventDefault() aufruft (Lib Zeilen 884, 948, 1005-1010). Ein reines CSS «pan-y» ändert nichts; nötig wäre ein Eingriff an den Controls (neuere Version, eigene Touch-Steuerung oder Lib-Patch) – was die Aufwandschätzung erhöht.
- Prüfung Wirkung: Nicht «jeder Scroll-Wisch», aber systematisch der erste: Beim Öffnen füllt die Bühne die Daumenzone, der Wisch zum Formular dreht das Möbel. Danach lernt man, unterhalb zu wischen. Produktentscheid bleibt bei Kim (Ein-Finger-Drehen vs. Scrollen), weil Drehen am Handy auch Teil des «Wow» im ersten Moment ist.

#### [mittel] Tap-Highlight nur auf sechs Klassen aus, text-size-adjust fehlt (Prüfpunkt 3)

Ist: «-webkit-tap-highlight-color:transparent» nur auf .seg label,.card,.btn,.vbtn,.tab,.gh (340). Gemessen Standard-Blitz (Chromium rgba(51,181,229,.4), iOS grau) auf .mnav button (437), .wahlbtn (68), .linkbtn (261), .lock (368), .kauf label (322), .pplan summary (327), tr[data-key] (285, Tipp-Handler 1535), .swatches label (212), .check (217), .warnhead (127). Kein text-size-adjust (gemessen «auto»). Soll: «button,label,summary,tr[data-key]{-webkit-tap-highlight-color:transparent}» und «html{-webkit-text-size-adjust:100%;text-size-adjust:100%}» – nur zusammen mit :active-Feedback (Prüfpunkt 10), sonst fühlt sich der Tipp tot an. Warum: Blitze auf der Leiste unten und den Haken wirken «Website»; ohne text-size-adjust bläht iOS Text beim Drehen ins Querformat auf. Verifizierbar: Code (gemessen).

Beleg: index.html:340 «.seg label,.card,.btn,.vbtn,.tab,.gh{-webkit-tap-highlight-color:transparent}»; gemessen .mnav button tap=rgba(51,181,229,0.4)

- Prüfung Wirkung: Relevant sind die Leiste unten (jede Sitzung) und die Haken im Baumarkt (jede Zeile): dort blitzt der Tipp grau, überall sonst nicht – ein spürbarer Uneinheitlichkeits-Punkt. .lock, .linkbtn, .pplan summary, tr[data-key] und .swatches sind selten getippt; text-size-adjust ist ein Querformat-Randfall. Zusammen mit dem :active-Befund als ein Thema «Touch-Feedback» behandeln.

#### [mittel] Sticky Bühne + fixe Leiste lassen mit Tastatur kaum Formular übrig (Prüfpunkt 11)

*Phase 1: hoch → nach Prüfung mittel.*

Ist: Handy «.viewer{position:sticky;top:0;z-index:5}» (419) mit «#stage{height:38svh;min-height:220px}» (420), «.mbar{position:fixed;bottom:0}» (434); keine visualViewport-Behandlung, kein Fokus-Handling, kein interactive-widget (grep). Gemessen: Viewer 339px (390×844) / 271px (375×667), Leiste 109px → ohne Tastatur bleiben 396 bzw. 287px fürs Formular; Querformat 844×390: 238 + 109 → 43px. Mit iOS-Tastatur (~260px) auf dem SE bleiben rund 130px über der Tastatur, die Leiste liegt dahinter; dazu kommt der Fokus-Zoom aus Prüfpunkt 5. Soll: «.cfgwrap:has(.controls input:focus) #stage{height:120px}» (Bühne schrumpft beim Tippen) und «@media (orientation:landscape) and (max-height:500px){.viewer{position:static}}». Warum: Masse eingeben ist die Kernhandlung – man sieht weder das Feld richtig noch, was sich in 3D ändert. Verifizierbar: Geometrie headless gemessen, Tastatur nur am Gerät.

Beleg: index.html:419-420 «.viewer{position:sticky;top:0;…} #stage{aspect-ratio:auto;height:38svh;min-height:220px;max-height:none}», index.html:434 «.mbar{…position:fixed;…bottom:0;…}»; gemessen quer: viewer 238 + mbar 109 von 390px

- Prüfung Wirkung: Beim Tippen eines Masses bleibt das 3D dank sticky Bühne sichtbar, aber vom Formular sieht man nur das Feld selbst, und der Preis ist weg (Kopf weggescrollt, Leiste hinter der Tastatur). Auf grossen iPhones eng, auf SE-Grösse knapp unbrauchbar; Querformat ist ein Randfall. Zusammen mit dem Fokus-Zoom beurteilen, der die Hauptursache für das Durcheinander ist.

#### [tief] Kein theme-color, kein color-scheme-Meta, kein Manifest, kein Icon (Prüfpunkt 2)

*Phase 1: mittel → nach Prüfung tief.*

Ist: Die einzigen <link>/<meta>-Tags sind charset, viewport, description, Preconnect und Google Fonts (Zeilen 1-7). Kein theme-color je Farbschema, kein <meta name="color-scheme">, kein apple-mobile-web-app-*, kein manifest, kein apple-touch-icon; Headless-Lauf: favicon.ico 404. CSS setzt color-scheme:dark nur in den Dunkel-Zweigen (23-24, 34-35), hell bleibt «normal» (gemessen). Soll: «<meta name="theme-color" content="#EDF0EE" media="(prefers-color-scheme: light)">» + «#131A1C» dark, «<meta name="color-scheme" content="light dark">», «<link rel="manifest">» und «<link rel="apple-touch-icon">». Warum: Safari/Chrome färben Adress- und Statusleiste; «Zum Home-Bildschirm» ergibt sonst ein Screenshot-Icon und öffnet im Browser-Chrome – gerade die Einkaufsliste im Laden lebt vom Home-Icon. Verifizierbar: Fehlen am Code, Optik nur am Gerät.

Beleg: index.html:1-7 (alle Meta/Link-Tags), index.html:24 und :35 «color-scheme:dark» nur dunkel; Konsolenlog: favicon.ico 404

- Prüfung Code: Es fehlen Manifest, apple-touch-icon und ein Favicon (Datei und Link); theme-color fehlt, wirkt auf iOS Safari aber nur als Feinschliff, weil Safari die Leiste ohnehin aus dem Seitenhintergrund ableitet. Ein <meta name="color-scheme" content="light dark"> ist NICHT zu empfehlen, weil es den Hell-Override über data-theme unterläuft; color-scheme bleibt wie heute im CSS.
- Prüfung Wirkung: Ohne Icon und Manifest bleibt Martylko ein Safari-Tab: Lesezeichen und «Zum Home-Bildschirm» zeigen ein generisches Bild, das ist für Kim allein relevant (Baumarkt, Werkstatt), nicht für Freunde über den Link. theme-color ist auf dem Testgerät iPhone Safari weitgehend kosmetisch, weil Safari den Hintergrund selbst übernimmt. Die Formulierung «die Einkaufsliste im Laden lebt vom Home-Icon» übertreibt.

#### [tief] Hover-Guard gut, aber kaum :active-Feedback (Prüfpunkt 10)

*Phase 1: mittel → nach Prüfung tief.*

Ist: Hover korrekt in «@media (hover:hover) and (pointer:fine)» (229-235). Ausserhalb des Guards: «.lock:hover{opacity:1}» (369) und «.coll input:hover{border-color:var(--line)}» (267) – kleben auf Touch. :active nur «.btn:active,.vbtn:active{transform:scale(.97)}» (348) und «.card:active{transform:scale(.99)}» (349); bei prefers-reduced-motion wird «:active{transform:none!important}» (491) – dann gar kein Feedback. Fehlt bei .seg label, .tab, .mnav button, .gh, .wahlbtn, .linkbtn, .lock, .kauf label, .pplan summary, tr[data-key]. Soll: «.seg label:active,.mnav button:active,.gh:active,.wahlbtn:active,.kauf label:active{background:var(--accent-soft)}» (Farbe statt Transform, überlebt reduced-motion) und 369/267 in den Hover-Guard ziehen. Warum: Auf .seg/.tab ist das Tap-Highlight bereits aus (340), die Pille gleitet erst 220ms später nach (342) – der Finger bekommt nichts zurück. Verifizierbar: Code.

Beleg: index.html:229-235 Hover-Guard, index.html:348-349 :active, index.html:369 «.lock:hover{opacity:1}», index.html:267 «.coll input:hover{…}», index.html:491 «:active{transform:none!important}»

- Prüfung Code: Druck-Feedback (:active) gibt es nur für .btn/.vbtn/.card und unter reduced-motion gar nicht; Loslass-Feedback ist bei Segmenten vorhanden (Farbwechsel sofort, Pille gleitet 220ms). Die beiden ungeschützten Hover (369, 267) sind sauberkeitshalber zu verschieben, fallen aber kaum auf.
- Prüfung Wirkung: Fehlendes :active fällt am Handy kaum auf, weil 3D und Preis sofort reagieren; der einzige häufig getippte Ort ohne jedes Feedback ist die Leiste unten, und der steht bereits im Tap-Highlight-Befund. Hover-Reste auf Schloss und Namensfeld sind Nischen. Als Teil eines Themas «Touch-Feedback einheitlich» mitnehmen, nicht als eigener Punkt.

#### [tief] Trefferflächen unter 44px: 3D-Knöpfe, Segmente, Haken, Slider, Textlinks (Prüfpunkt 12)

*Phase 1: mittel → nach Prüfung tief.*

Gemessen mit pointer:coarse bei 390×844: .vbtn 40×40 (423) ✗; .seg label 159×42 (173/406) ✗ knapp; .bausub label 178×42 ✗; .pplan summary 358×39 (327) ✗; .coll input 328×31 (266) ✗; «Zufall» .linkbtn im Dialog 39×23 (261, 950-951) ✗; «Rückgängig» als .linkbtn in einer 13px-Meldung (2225), die nach 6000ms verschwindet (2071) ✗; .check min-height 32px mit 22px-Box (412-413) ✗; Slider 30px (411) ✗. Erfüllt: .gh 44, .lock 44 (428-429), .mbtns .btn 44, .kauf label 56, .coll .do .btn 44, #bTeilen 44, tr[data-key] 76, .swatches label 52×59; .mnav button gemessen 44, deklariert aber nur min-height:28px (437). Soll: «@media (pointer:coarse){.vbtn{width:44px;height:44px}.seg label,.check,.pplan summary,.mnav button,.coll input{min-height:44px}}» und «Zufall»/«Rückgängig» als .btn.ghost statt .linkbtn. Warum: Die 3D-Knöpfe liegen über dem Canvas – ein Fehltipp dreht die Szene; «Rückgängig» nach «Entfernen» ist winzig und befristet. Verifizierbar: Code (gemessen).

Beleg: index.html:423 «.vbtn{width:40px;height:40px;…}», index.html:412 «.check{min-height:32px}», index.html:950 «<button … class="linkbtn" data-zufall="sideboard">Zufall</button>» (gemessen 39×23), index.html:2225 Rückgängig als .linkbtn, index.html:437 «.mnav button{…min-height:28px…}»

- Prüfung Code: Wie beschrieben; zusätzlich ist «Rückgängig» in der fixen Leiste unten 12.5px gross (index.html:442 «.mbar span{font-size:12.5px}», Meldung 2065/2112, Timeout 2071), die 13px gelten für die Desktop-Meldung (257).
- Prüfung Wirkung: Für Kim und Freunde zählen nur «Zufall» im Dialog (39×23 px, erster Moment) und «Rückgängig» in der Leiste (kleiner Textlink, 6 s). Die übrigen Abweichungen (40/42 statt 44 px, Slider 30 px, Namensfeld) sind messbar, aber nicht spürbar.

#### [tief] Möbelwahl-Dialog: zentriertes Modal, Backdrop-Tipp schliesst nicht (Prüfpunkt 13)

*Phase 1: mittel → nach Prüfung tief.*

Ist: <dialog class="wahl"> (948-955), «width:min(460px,calc(100% - 32px))» (63), showModal() (2093); gemessen 354×282 zentriert (oben 281px bei 844, 193px bei 667) – kein Sheet von unten, kein Wischen. Schliessen über Knopf #wahlZu (2104), Esc/Zurück via cancel + History (2097-2102). Der Klick-Handler (2105-2119) kehrt zurück, wenn das Ziel weder [data-kind], [data-zufall] noch #wahlColl ist – ein Tipp auf den Backdrop schliesst nicht. Beim Erstaufruf (wahlErst) ist #wahlZu versteckt (2091) und cancel unterdrückt (2102): Pflichtwahl, laut Kommentar (2076) bewusst. Soll: «wahl.addEventListener('click', e => { if (e.target === wahl && !wahlErst) schliesseWahl(); })» und «@media (max-width:640px){.wahl{margin:auto 0 0;width:100%;border-radius:16px 16px 0 0;padding-bottom:calc(18px + env(safe-area-inset-bottom))}}». Warum: Auf dem Handy erwartet man ein Sheet in Daumenreichweite und Backdrop-Tipp zum Schliessen. Verifizierbar: Code (Masse gemessen), Erreichbarkeit nur am Gerät.

Beleg: index.html:63 «.wahl{…width:min(460px,calc(100% - 32px));…}», index.html:2105-2107 «wahl.addEventListener('click', ev => { const k = …; if (!k && !z && !s) return; …», index.html:2091 «$('#wahlZu').hidden = erst;»

- Prüfung Code: Backdrop-Tipp schliesst nicht (Handler 2105-2107 behandelt target=dialog wie «nichts getroffen»); Zurück-Geste und Schliessen-Knopf funktionieren. Produktentscheid Sheet vs. Modal ist offen; eine Backdrop-Lösung muss Tipps aufs Dialog-Padding unterscheiden.
- Prüfung Wirkung: Der Dialog erscheint selten (Erstbesuch ohne Link, Typwechsel) und ist am Handy erreichbar; dass er kein Sheet ist und der Backdrop nicht schliesst, ist eine Stil-Erwartung, die die Spec selbst schon als «Sheet» formuliert hat. Die Pflichtwahl ist entschieden und kostet im 30-s-Moment einen Tipp.

### Verworfen

#### ~~Kein touch-action:manipulation auf Knöpfen und Segmenten (Prüfpunkt 6)~~

- Widerlegt (Wirkung): Für Kims Nutzer praktisch ohne Wirkung: Die App hat keine Stelle, an der man zweimal schnell dieselbe Stelle tippt. iOS zeigt an type=number keine Spin-Knöpfe (index.html:154 betrifft nur WebKit-Desktop), Segmente «Fächer 1 2 3 4» (727-732) und die Orte (959-962) sind verschiedene Stellen, Werte ändern sich per Slider. Einziger Fall wäre ein Haken, den man sofort wieder wegtippt. Dazu ist der Doppeltipp-Zoom nur am Gerät prüfbar, und Safari behandelt Taps auf klickbare Elemente seit Jahren ohne Verzögerung. Akademisch gegenüber Kims Zielen (Formular/Kopf, 30 s, Baumarkt, Werkstatt).

### Nachträge der Skeptiker

- (Code) Die fixe Leiste unten ändert für 6 Sekunden ihre Höhe, sobald eine Meldung erscheint: «.mbar .copied:not(:empty){display:block}» (index.html:448) schaltet eine zusätzliche Zeile (12.5px × 1.5 ≈ 19px, Zeile 442) in der Preiszeile ein, flash() leert sie nach 6000ms (2071). Nach Würfeln/Sammeln springt die Leiste und verdeckt kurz mehr Inhalt; der Platzhalter .app padding-bottom 140px (418) ist auf die Normalhöhe 109px gerechnet.

- (Code) Die 3D-Schleife läuft ohne Pause: requestAnimationFrame(tick) ruft jeden Frame controls.update() und renderer.render() auf (index.html:1695-1703), auch wenn die Bühne auf dem Handy per display:none ausgeblendet ist (Orte Einkaufen/Bauen, Zeile 392) oder der Tab im Hintergrund liegt – kein visibilitychange, kein IntersectionObserver (grep 0 Treffer). Mit Schattenkarte 2048² (1660) und PixelRatio bis 2 (1648) kostet das auf dem iPhone Akku und Wärme, ohne dass etwas zu sehen ist.

- (Code) Drei Fremd-Origins ohne lokalen Fallback: Google Fonts (index.html:5-7), three.min.js von cdnjs (966) und OrbitControls von jsdelivr (967). Im Baumarkt mit schlechtem Empfang fällt die 3D-Vorschau aus, und die Fehlermeldung behauptet dann «Die 3D-Vorschau braucht WebGL» (1705), obwohl nur die Lib nicht geladen wurde (throw new Error('lib') 1645 landet im selben catch). Hängt mit dem fehlenden Manifest/Offline-Konzept aus Prüfpunkt 2 zusammen.

- (Code) backdrop-filter steht nur unpräfixt (index.html:227 .vbtn, :434 .mbar; grep -webkit-backdrop-filter: 0 Treffer). iOS Safari vor Version 18 braucht das -webkit-Präfix; dort sind Leiste und 3D-Knöpfe nur 92 %/88 % transparent ohne Weichzeichnung, was auf hellem Canvas-Hintergrund die Lesbarkeit der Knöpfe mindert.

- (Code) Die Zeichnung der Bühne nimmt beim Ortswechsel keine Grösse mit: resize() (index.html:1668-1673) bricht bei clientWidth 0 ab, wenn .cfgwrap ausgeblendet ist, und wird vom ResizeObserver erst beim nächsten Einblenden erneut ausgelöst – in diesem Moment wird fitCamera nur gerufen, wenn der Nutzer die Kamera noch nie bewegt hat (three.userMoved, 1672). Wer gedreht hat und zwischen Entwerfen und Einkaufen wechselt, bekommt auf dem Handy bei geändertem Seitenverhältnis (Querformat-Wechsel während Einkaufen) eine nicht nachgeführte Kameraeinstellung – nur aus dem Code gelesen, nicht gemessen.

- (Wirkung) Safaris eigene Leiste unten stapelt sich unter die App-Leiste: Auf dem Testgerät iPhone Safari (Adressleiste standardmässig unten) liegen beim ersten Moment zwei Leisten übereinander (App ~106 px, index.html:434 position:fixed bottom:0, plus Safari ~80 px). Die Phase-1-Masse wurden headless ohne Browser-Chrome bei 844 px gemessen und überschätzen den Platz: mit Kopf 305 px bzw. sticky Bühne 38svh (420) bleiben in Safari beim Öffnen und beim Scrollen im Formular eher 250-300 px statt 400 px. Nur am Gerät prüfbar; Phase 1 nennt den Safari-Chrome in keinem Item.

- (Wirkung) Preis beim Tippen unsichtbar: Während die iOS-Tastatur offen ist, steht der Preis nur in der fixen Leiste (957, hinter der Tastatur) und im Kopf (.top nicht sticky, 75; weggescrollt, sobald die Bühne bei top:0 klebt, 419). Der Freund sieht beim Ändern eines Masses zwar das 3D reagieren, den Preis aber erst nach «Fertig» – die zweite Hälfte des 30-s-Kriteriums («3D plus Preis haben reagiert») ist genau in dem Moment nicht sichtbar, in dem er tippt. Phase 1 (Prüfpunkt 11) nennt Feld und 3D, nicht den Preis.

- (Wirkung) Bildschirm schläft in der Werkstatt ein: Die Situation «in der Werkstatt am Handy/Tablet bauen» (Interview) heisst Bauablauf lesen mit beschäftigten Händen; die Seite hält den Bildschirm nicht wach (kein wakeLock in index.html oder *.js, grep 0 Treffer), das Gerät sperrt nach der iOS-Standardzeit und muss mit Sägemehl an den Fingern entsperrt werden. Phase 1 hat die Werkstatt-Situation als Lücke benannt (intentDocs), aber kein Handy-Item daraus gemacht.

- (Wirkung) Rand-Wisch gegen Drehen (zu prüfen am iPhone): Die Bühne reicht bis 16 px an den Bildschirmrand (.viewer margin-inline:-16px, index.html:419; .app padding-inline 16 px, 418). Safaris Zurück-Geste beginnt am linken Rand; wer das Möbel mit einer Drehbewegung von links aussen anfasst, löst statt des Drehens den Zurück-Schritt aus, der dank Hash pro Ort (Ansichten-Spec «Zurück-Taste», index.html:1979-1994) zum vorherigen Ort springt oder die Seite verlässt. Plausibel, nur am Gerät verifizierbar; Phase 1 nennt die Geste nicht.

- (Wirkung) Der erste Wisch landet auf dem Canvas: Beim Öffnen am Handy liegt die Bühne (y 339-678, Screenshot handy-entwerfen.png) genau in der Daumenzone, das erste Feld «Breite» einen Bildschirm tiefer (y 880). Phase 1 nennt touch-action:none (Prüfpunkt 6) und die Lage des ersten Feldes (screenshots) getrennt; die Kombination – der Freund will zum Formular, dreht aber das Möbel – ist das konkrete Hindernis für «ein Mass geändert» in 30 Sekunden und steht so in keinem Item.

### Ungeprüft (Phase 1, tief/info)

- **[mittel] user-select:none nur auf .seg label (Prüfpunkt 9)** – Ist: «user-select:none» nur in .seg label (173, gemessen). Selektierbar bleiben .card (178; Bauweise-Karten gemessen 320×298 Text), .vbtn (227; Text .t nur visuell versteckt, 424), .mnav button (437), .wahlbtn (68, gemessen «text»), .gh (365), .kauf label (322), .tab (249). -webkit-touch-callout fehlt, ist aber ohne Links/Bilder in den Controls unkritisch. Soll: «button,.card,.gh,.kauf label,.swatches … *(Beleg: index.html:173 «.seg label{…user-select:none;…}», gemessen .card userSelect=auto, .wahlbtn userSelect=text)*

- **[mittel] «Bauen» auf dem Handy verspricht 3D-Hervorhebung, zeigt aber keine Bühne** – Ist: «body[data-ort="bauen"] .cfgwrap{display:none}» (392, gemessen none), die .viewer steckt in .cfgwrap (525-527). Der Hinweis «Tipp auf eine Zeile, um das Teil in 3D hervorzuheben.» (.hint-touch, 924) ist auf Touch sichtbar (gemessen inline), der pointerup-Handler (1535) markiert eine unsichtbare Szene. Soll: «@media (max-width:920px){body[data-ort="bauen"] .hint-touch{display:none}}» – oder (Produktfrage) die … *(Beleg: index.html:392 «body[data-ort="einkaufen"] .cfgwrap,body[data-ort="bauen"] .cfgwrap{display:none}», index.html:924 «<span class="hint-touch">Tipp auf eine Zeile)*

- **[tief] 100vh nur noch im Tablet-Bereich 921-1199px (Prüfpunkt 4)** – Ist: Handy «#stage{height:38svh}» (420) und Desktop «.app{height:100dvh}» (112) sind richtig. Verbleibend: «.controls{position:sticky;…max-height:calc(100vh - 24px);overflow:auto}» (100) und «#stage{max-height:66vh}» (222) gelten zwischen 921 und 1199px (iPad Pro 11" quer, 12.9" hoch); «.warns{max-height:33vh}» (133) nur ≥1200. Soll: Zeile 100 «max-height:calc(100dvh - 24px)», Zeile 222 «max-height:66svh». Warum: … *(Beleg: index.html:100 «max-height:calc(100vh - 24px)», index.html:222 «max-height:66vh», index.html:112 «height:100dvh», index.html:420 «height:38svh»)*

- **[tief] Range-Slider 30px hoch mit nativem Daumen (Prüfpunkt 6/12)** – Ist: «input[type=range]{height:30px}» (411, gemessen 320×30), nur accent-color (159), keine Thumb-Styles (::-webkit-slider-thumb 0 Treffer). touch-action bleibt auto – senkrechtes Wischen auf dem Slider scrollt, das ist richtig. Soll: «@media (pointer:coarse){input[type=range]{height:44px}}» oder «::-webkit-slider-thumb{width:28px;height:28px}». Warum: Android-Daumen ist ~20px; Treffer daneben wirken als Scroll. … *(Beleg: index.html:411 «input[type=range]{height:30px}», index.html:159 «input[type=range]{width:100%;accent-color:var(--accent);margin:0}»)*

- **[tief] overscroll-behavior nirgends gesetzt (Prüfpunkt 7)** – Ist: 0 Treffer; gemessen html/body «auto». Innere Scroll-Container: .controls (100, Tablet sticky), .panel/.warns/#collList (136/133/138, nur ≥1200 mit body{overflow:hidden} 111), .tablewrap overflow-x (275). Soll: «html,body{overscroll-behavior-y:none}» gegen Pull-to-Refresh, «.controls,.panel,#collList{overscroll-behavior:contain}». Warum: Chrome Android lädt beim Ziehen nach unten neu; der Zustand liegt zwar in … *(Beleg: grep overscroll in index.html: 0 Treffer; index.html:100 «.controls{…overflow:auto…}», index.html:275 «.tablewrap{overflow-x:auto…}»)*

- **[tief] safe-area weitgehend sauber, nur sticky Viewer ohne inset-top (Prüfpunkt 8)** – Ist: .app seitlich «max(16px,env(safe-area-inset-left))» (418), .mbar unten «calc(6px + env(safe-area-inset-bottom))» plus seitlich (434), .controls oben mit Fallback (100). Toast .mbar .copied liegt innerhalb der Leiste (447-449), der Dialog wird vom UA zentriert. .app padding-bottom 140px (418) deckt die gemessene Leiste von 109px. Fehlt: «.viewer{position:sticky;top:0}» (419) ohne env(safe-area-inset-top). Soll: … *(Beleg: index.html:418 «.app{padding-inline:max(16px,env(safe-area-inset-left)) …;padding-bottom:calc(140px + env(safe-area-inset-bottom))}», index.html:419 «.viewer{po)*

- **[tief] .pick-Overlay fängt Touch auf dem Canvas ab** – Ist: «.pick{position:absolute;…}» (237) ohne pointer-events:none (gemessen auto), auf dem Handy oben links über dem Canvas (426), bis 100 % minus 16px breit. .dimtag hat pointer-events:none (236, gemessen). Soll: «.pick{pointer-events:none}». Warum: Nach einem Teil-Tipp startet eine Drehgeste auf der Infobox ins Leere. Verifizierbar: Code. *(Beleg: index.html:237 «.pick{position:absolute;left:14px;bottom:12px;…max-width:calc(100% - 28px)}» ohne pointer-events, index.html:426 Handy-Position)*

- **[tief] Scrollposition geht bei jedem Ortswechsel verloren** – Ist: «if (neu) { window.scrollTo(0, 0); … }» (1987) bei jedem Wechsel von Entwerfen/Einkaufen/Bauen/Sammlung; wer von der Einkaufsliste kurz zum Entwurf und zurück geht, beginnt oben. Soll: Scrollposition pro Ort merken (Map ort→scrollY vor dem Wechsel sichern, nach dem Wechsel setzen) – oder bewusst so lassen. Warum: native Tab-Leisten behalten die Position pro Tab; das ist ein Signal für «App». Verifizierbar: … *(Beleg: index.html:1987 «if (neu) { window.scrollTo(0, 0); placeTabInd(false); placePills(); }»)*

- **[info] Viewport-Meta korrekt, nur interactive-widget offen (Prüfpunkt 1)** – Ist: width=device-width, initial-scale=1, viewport-fit=cover; kein user-scalable/maximum-scale (richtig so). Fehlt einzig interactive-widget. Soll: erst zusammen mit Prüfpunkt 11 entscheiden; «interactive-widget=resizes-content» würde die Leiste über die Tastatur heben und svh verkleinern, nimmt aber ~109px Platz. Warum: Standard (resizes-visual) lässt die fixe Leiste hinter der Tastatur – unauffällig, aber die … *(Beleg: index.html:2 «<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">»)*

- **[info] Share-Sheet richtig gegated; title-Tooltips auf Touch unsichtbar** – Positiv: navigator.share nur bei «(pointer: coarse)» (2020, 2239), AbortError sauber behandelt, Fallback Clipboard bzw. prompt() (2245). Hinweis: Erklärungen stecken in title-Attributen (#bKind 518, #bZufall 547, Überschreiben 2148, js-link 958) – auf Touch gibt es keine Tooltips, diese Hilfe fehlt dort ganz. Verifizierbar: Code. *(Beleg: index.html:2020 «if (navigator.share && matchMedia('(pointer: coarse)').matches)», index.html:547 title="Würfelt eine stimmige Konfiguration …")*

### Offene Fragen aus dieser Linse

- 3D auf dem Handy: Soll ein Finger die Szene drehen (heute, touch-action:none) oder die Seite scrollen (pan-y: ein Finger nur waagrecht drehen, zwei Finger zoomen)?

- Soll Martylko installierbar sein (Manifest, Icon, Standalone)? Ist «Einkaufsliste im Baumarkt auf dem Handy» ein Zielszenario, das das rechtfertigt?

- Soll die Bühne beim Tippen in ein Massfeld schrumpfen (mehr Formular, kleinere Vorschau) oder bleibt die Vorschau gross, auch wenn mit Tastatur wenig Formular sichtbar ist?

- Querformat am Handy: unterstützen (Bühne nicht sticky) oder bewusst nicht?

- Möbelwahl-Dialog: Pflichtwahl beim ersten Besuch beibehalten? Soll er auf dem Handy als Sheet von unten erscheinen und per Backdrop-Tipp schliessen?

- «Bauen» auf dem Handy: Bühne mitzeigen, damit das Teil-Highlight sichtbar wird, oder den Hinweis dort streichen?

- Scrollposition pro Ort merken (wie native Tabs) oder bewusst immer oben beginnen?

- Welche echten Geräte stehen zum Testen bereit (iPhone/Android, Safari/Chrome)? Tastatur, Fokus-Zoom, Doppeltipp und OrbitControls unter pan-y lassen sich nur dort prüfen.

## Ergebnis-Inhalte (Einkaufen, Bauen)

Was der Nutzer mitnimmt: Listen, Preise, Texte, Feedback.

**Kurzfassung (Phase 1):** Die App liefert aus einem Entwurf fünf Ergebnis-Sichten: Kopf/Leiste mit Preis und Mass, Warnungen unter der 3D-Vorschau, eine abhakbare Einkaufsliste mit eingeklapptem Plattenplan (Ort Einkaufen), Teiletabelle/Ablängplan/Bauablauf (Ort Bauen) und die Sammlung zum Vergleichen. Struktur und Reihenfolge stimmen mit der Spec überein, und Abhaken, Teilen als Text und Link funktionieren. Die grössten Schwächen aus Sicht «was nimmt der Nutzer mit»: Das «Total» beim Sideboard enthält keine Beschläge, ohne dass die Einkaufsansicht das sagt; ganze Bretter stehen beim Reduit doppelt auf der Liste; Latten werden als Schnittstücke statt als Kaufeinheiten gelistet; Preis-Stand und Quelle (in preise.js vorhanden) erscheinen in der Einkaufsansicht nicht; es gibt weder Druck-CSS noch Offline-Fähigkeit noch Export ausser Text/Link. Dazu kommen unerklärte Fachwörter in Bauablauf und Liste, gemischte Rundungen und Einheiten, ein Touch-Hinweis auf eine 3D-Ansicht, die im Ort Bauen auf dem Handy gar nicht sichtbar ist, und ein Niveau-Text, der in eine dauerhaft versteckte Gruppe gerendert wird. Feedback ist grundsätzlich vorhanden (aria-live bei Warnungen und Meldungen, Einblend-Animation bei Warnungen, Zähler bei Haken), Preisänderungen selbst bleiben aber stumm.

### Geprüft

#### [hoch] «Total ca.» beim Sideboard ist nur Holz – die Einkaufsansicht sagt das nicht

kostenGesamt = Zuschnitt + solidCost + buyCost. Beim Sideboard haben die Beschlagzeilen keinen Preis (3-elementige Einträge ohne p), buyCost ist undefined – Node-Probe: Standard-Sideboard Total CHF 247 ohne Scharniere, Füsse, Schrauben. Im Kopf steht gross «Total ca.», nur das Kleingedruckte nennt «Holz Zuschnitt CHF …»; der Einkaufen-Kopf «Sideboard … · ca. CHF 247» hat gar keinen Zusatz. Einzig der Hint unter den Bauweise-Karten sagt «ohne Beschläge – Richtwert». Beim Reduit dagegen sind Kaufteile mit «≈ CHF» pro Zeile dabei – die beiden Typen bedeuten mit «Total» also Verschiedenes.

Beleg: konfig.js:581-583; sideboard.js:192-220 (hw ohne Preis); index.html:1392, 1487, 1261-1263; einkauf.js:32

- Prüfung Code: Kleine Korrektur: Die UI zeigt nicht 247, sondern gerundet CHF 245 (Screenshot handy-bauen.png, index.html:1381 rundet auf 5). Zusätzlich fehlt in der Einkaufsliste beim Sideboard jeder Preis- oder «ohne Preis»-Hinweis im Abschnitt «Beschläge & Kleinteile» (einkauf.js:31-32), während derselbe Abschnitt beim Reduit «≈ CHF» pro Zeile zeigt.
- Prüfung Wirkung: Zusätzlich zur Phase-1-Fassung: Auch der Dialog «Was baust du?» zeigt Sideboard «ca. CHF 245» und Reduit «ca. CHF 675» ohne Zusatz nebeneinander, obwohl nur die zweite Zahl Kaufteile enthält. Das Kleingedruckte im Kopf, das es erklären würde, ist am Desktop abgeschnitten («Holz Zuschnitt CHF 245 · ganze Platt…», desktop-einkaufen.png).

#### [hoch] Latten und Kanthölzer werden als Schnittstücke gelistet, nicht als Kaufeinheiten

Der Abschnitt «Massivholz Fichte» listet die Teile wie Zuschnitt: «5 × 1594 mm · C Latte 24 × 48», «10 × 352 mm · E Latte». Gekauft werden aber Dachlatten in Standardlängen (Quelle in preise.js: «Latte roh 24x48 mm 2 m», «Latte gehobelt 45x45 mm 2.5 m»). Wie viele Latten man in den Wagen legt, muss der Nutzer im Laden selbst ausrechnen; nur die Teiletabelle zeigt Laufmeter pro Gruppe. Kosten laufen pro Laufmeter (solidCost), nicht pro Latte. Der offene Punkt «Packungen in der Einkaufsliste» in WEITERARBEIT nennt Schrauben/Schienen, nicht Latten.

Beleg: einkauf.js:27-29; reduit.js:755 (solidCost pro m), preise.js kaufteile kant45/latte (quelle); index.html:1424 (Laufmeter nur in Tabelle); docs/WEITERARBEIT.md:153

#### [mittel] Ganze Bretter stehen beim Reduit doppelt auf der Einkaufsliste

*Phase 1: hoch → nach Prüfung mittel.*

einkauf.js baut für Brett-Gruppen den Abschnitt «… · ganze Bretter» (z. B. «10 × Brett 2000 × 400 mm (à CHF 20.50)»). Zusätzlich schiebt computeReduit dieselben Bretter per hw.unshift vorne in die Kaufteile, die einkauf.js als «Beschläge & Kaufteile» ausgibt («10 × Leimholz Fichte (go/on) 2000 × 400 × 18 mm (ganzes Brett … ≈ CHF 205)»). Node-Probe mit go/on bestätigt beide Zeilen. Zwei Haken für denselben Kauf, und wer nur die Kaufteile abhakt, zählt die Bretter mit dem Total mit (buyCost wird allerdings vor dem unshift gerechnet, die Kosten stimmen).

Beleg: einkauf.js:14-17 und 31-32; reduit.js:748-753; Bauablauf verweist auf «Einkaufsliste (Beschläge & Kaufteile)» reduit.js:813

- Prüfung Code: Ergänzung: Durch die Doppelung ergibt die sichtbare Summe der «≈ CHF»-Zeilen im Abschnitt «Beschläge & Kaufteile» 205 + 4 + 30 + 8 + 35 = CHF 282, während der Kopf «Kaufteile CHF 75» nennt (index.html:1393, R.buyCost 76.52) – ein sichtbarer Widerspruch im selben Ort.
- Prüfung Wirkung: Betrifft nur das Reduit mit Brett-Material, dort aber Kims wahrscheinlichsten Fall. Folgen: zwei Haken für denselben Kauf und ein Kaufteile-Abschnitt, dessen Zeilen (mit ≈ CHF 205 Brettern) nicht zur Kopfzahl «Kaufteile CHF 245» passen. Doppelt gekauft wird kaum, weil Stückzahl und Preis gleich sind.

#### [mittel] Rundungen widersprechen sich zwischen Kopf, Liste und Plattenplan

Total im Kopf, Einkaufen-Kopf, Bauweise-Karten und Sammlung: auf 5 CHF gerundet. Kaufteil-Zeilen: «≈ CHF» auf 1 CHF. Ganze Bretter: «à CHF 20.50» auf Rappen. Plattenplan-Chips: Zuschnitt und ganze Platten auf 1 CHF. Wer Zeilen zusammenzählt, landet nicht beim Total; der Kleingedruckte «ganze Platten CHF …» im Kopf ist ebenfalls auf 5 gerundet, die Chips darunter nicht.

Beleg: index.html:1381, 1487, 2117 (÷5), 1441-1444 (Chips), einkauf.js:17, 32

- Prüfung Code: Uneinheitliche Rundungsstufen (5 CHF im Kopf, 1 CHF in Zeilen und Chips, Rappen bei Brettern). Wer Zeilen addiert, landet um wenige Franken neben dem «ca.»-Total; echte Widersprüche entstehen nur durch die Bretter-Doppelung (Befund 2).
- Prüfung Wirkung: Am sichtbarsten im Kopf: Beim Reduit addiert sich die Aufschlüsselung nicht zum Total («Holz Zuschnitt CHF 500 · Kaufteile CHF 170» unter «CHF 675», handy-reduit-entwerfen.png), weil jede Zahl einzeln auf 5 gerundet wird. Die Unterschiede zwischen Zeilen, Chips und Brettpreisen fallen nur beim Nachrechnen auf.

#### [mittel] Fachwörter in Bauablauf und Liste ohne Erklärung; Erklärungen gibt es nur auf Formular-Karten

In den Ausgaben stehen ohne Erklärung: Meterriss, Dachlatte/Kantholz, Stossleiste/Eckleiste, Topfbohrung, «aufliegend/halb aufliegend», Lochreihe/Bodenträger, Forstnerbohrer, Konfirmat, Hirnholz, Hartwachsöl, Kantenband, Hohlraumdübel. Erklärende Sätze gibt es nur auf den Karten für Verbindung und Einbau-Art im Formular (Taschenloch, Exzenter, Wangen, Pfostenrahmen) – im Ort Einkaufen/Bauen sind sie nicht sichtbar. Zusätzlich zwei Wörter für dasselbe: «Länge = Faserrichtung» (Toolbar, Text-Export) vs. «Länge (Maserung) × Breite» (Tabellenkopf) vs. «Maserung längs» (Liste). Ein Glossar oder Erklären per Tipp existiert nicht.

Beleg: reduit.js:838 (Meterriss), 150-151, 283, 318 (Dachlatte/Kantholz), 268, 272 (Stoss-/Eckleiste); sideboard.js:113 (Topfbohrung, aufliegend), 61, 71 (Lochreihe), 257, 304 (Forstner), 232 (Hartwachsöl); shared.js:214 (Konfirmat); konfig.js:226 (Hirnholz); index.html:642-646, 853-856 (Karten), 924, 1416, 2018; einkauf.js:23

- Prüfung Code: Zeilen korrigiert: Eckleiste reduit.js:273/850, Topfbohrung/aufliegend sideboard.js:118/301, Konfirmat shared.js:204. Ein Teil der Begriffe wird im Bauablauf-Satz selbst umschrieben; in Teiletabelle und Einkaufsliste (Hinweis-Spalte, Zeilen-Sub) stehen sie dagegen nackt.
- Prüfung Wirkung: In der Einkaufsliste sind Begriffe wie «Topfscharnier Ø 35, aufliegend, Softclose» die Produktbezeichnungen fürs Regal – dort kein Problem. Es trifft den Bauablauf in der Werkstatt (Meterriss, Konfirmat, Hirnholz, Forstnerbohrer) und die drei Wörter für Faserrichtung/Maserung.

#### [mittel] Warnungen haben eine Stufe für alles – Bestätigungen sehen aus wie Probleme

R.warn ist eine flache Liste aus Regel-Warnungen und Berechnungs-Warnungen, alle im gleichen Stil mit «!». Darunter sind Blocker («Teil A passt nicht auf die Platte»), Sicherheit («Kippschutz»), Tipps («Schraubenköpfe sichtbar») und blosse Bestätigungen («Tiefe links 400 mm gesetzt (Brettbreite …)», «leeres Eckquadrat eingeplant»). Der Code kennt den Unterschied (HARMLOS-Regex), nutzt ihn aber nur fürs Würfeln, nicht für die Anzeige. Der Zähler «n Warnungen» in Einkaufen/Bauen zählt Bestätigungen mit.

Beleg: index.html:1357, 1399-1409, 244-245 (eine Klasse .warn), 1364-1367; konfig.js:404 (HARMLOS nur in zufall); reduit.js:63, 248; sideboard.js:172, 174, 189

- Prüfung Code: Zeilen korrigiert: HARMLOS definiert konfig.js:418, genutzt nur konfig.js:460 (zufall); Eckquadrat-Warnung reduit.js:253 (248 ist Kommentar).
- Prüfung Wirkung: Die Standardbeispiele sind warnungsfrei; der Befund greift ab der ersten Bauweise- oder Materialänderung beim Reduit und dann in jeder Sitzung über den orangen Zähler in Einkaufen/Bauen. Die Stufen sind bereits beschlossen (eingrenzung-regeln.md:36), aber nicht umgesetzt.

#### [mittel] Preisänderung ist unsichtbar: kein Hervorheben, keine Transition am Total

*Phase 1: tief → nach Prüfung mittel.*

Bei jeder Eingabe wird das Total in Kopf und Leiste neu geschrieben, aber ohne jede Hervorhebung (keine Transition auf .summary/.mbar b, kein Flash). Beim Verschieben eines Reglers ändert sich die Zahl stumm; dass ein Materialwechsel das Total verdoppelt, muss man selbst bemerken. Beim Bauweisewechsel gibt es immerhin die Textmeldung, aber ohne Preisdifferenz.

Beleg: index.html:72-85, 1381, 1393 (textContent), 1340-1348 (flash ohne Preis); grep «transition» auf .summary/mPrice leer

- Prüfung Code: CSS-Belege: .summary index.html:60, 80-88; .mbar 434-444. Eine Preisangabe gibt es bei Bauweise-Änderung nur im Sammlungs-Pfad «An die Bauweise angepasst – ca. CHF …» (index.html:2191), nicht beim Wechsel im Formular (1348).
- Prüfung Wirkung: Trifft das 30-s-Kriterium direkt: Am Handy steht der Preis in der fixen Leiste unten, ändert stumm und – auf 5 CHF gerundet – bei kleinen Massänderungen gar nicht. Ob «der Preis reagiert hat», sieht der Freund dann nicht.

#### [tief] Preis-Stand und Quelle sind in preise.js, erscheinen aber nicht in der Einkaufsansicht

*Phase 1: mittel → nach Prüfung tief.*

preise.js führt pro Position «stand» (z. B. 2026-10-01) und «quelle» (Jumbo-Produktname). Gerendert wird davon nichts: Das einzige Datum ist der Formular-Hint «Richtwerte (Stand Sept. 2026) – trag den Preis deines Händlers ein» unter «Platten & Preise», dazu «Richtwert» unter den Bauweise-Karten und «Preis geschätzt» pro Kaufteil-Zeile. Im Ort Einkaufen – wo der Nutzer den Bon vergleicht – steht weder Datum noch Händler; «Jumbo» kommt in der UI nirgends vor. In der Sammlung wird «Kosten beim Speichern» immerhin benannt.

Beleg: preise.js:1-7 und alle Einträge; index.html:878, 1110, 1261-1263, 2136; reduit.js:745; grep «jumbo|quelle» in index.html/konfig.js nur Kommentar/Meta

- Prüfung Code: Ergänzung: Das Datum «Sept. 2026» ist fest im HTML/JS (index.html:878, 1110) und schon jetzt veraltet – preise.js hat Einträge mit stand 2026-10-01 (Schienen, Konsolen, Spax). Der echte Stand aus den Daten wird nirgends ausgelesen.
- Prüfung Wirkung: Datum und Händlername sind für Kim, Familie und Freunde kaum spürbar – alles ist «ca.». Spürbar ist nur, dass die Liste Dinge anders nennt als das Jumbo-Regal (z. B. «Dachlatte 24 × 48» vs. «Latte roh 24x48 mm 2 m», preise.js:28); das gehört zum Befund «Abschnittstitel benennt nicht, was man im Regal sucht».

#### [tief] Plattenplan-Beschriftungen sind auf dem Handy zu klein zum Lesen

*Phase 1: mittel → nach Prüfung tief.*

Das SVG hat eine viewBox von Plattenlänge + 24 (z. B. 2524 Einheiten) und wird auf dem Handy einspaltig ca. 330 px breit, Skalierung ≈ 0.13. Positionsbuchstabe max. 90 Einheiten ≈ 12 px, Massangabe 0.55 × 90 ≈ 6.5 px, bei kleinen Teilen 26 Einheiten ≈ 3.4 px. Auch in der dritten Desktop-Spalte (~450 px) bleiben Masse bei ~9 px und kleine Teile bei ~4.6 px. Die Chips (Platte, Stück, Rest %) sind lesbar, die Zuordnung Teil → Platte im Baumarkt nicht.

Beleg: index.html:1451-1462 (fs = max(26, min(90, …)), showDim), 481 (.sheetlist einspaltig unter 600 px Container), 303-306 (SVG width 100 %)

- Prüfung Code: Bei 2500–2800 mm breiten Platten (Fichte, MDF, OSB, Reduit-Standard) werden Masse auf dem Handy ≈ 6 px und kleine Teile ≈ 3 px gross; bei der hochkanten Birke-Platte 1500 × 3000 (Sideboard-Standard) sind sie ≈ 11–20 px. Der Plan ist zoombar (Vektor, Pinch nicht gesperrt) und sitzt zugeklappt unter der Einkaufsliste (index.html:906), nicht im Ort Bauen.
- Prüfung Wirkung: Im Baumarkt ist der Plattenplan nebensächlich (Zuschnitt macht Jumbo, Plattenzahl steht lesbar in den Chips) und per Pinch-Zoom lesbar. Eng wird es nur beim Ablängplan in der Werkstatt am Handy (Reduit mit Brettern); am Tablet nicht.

### Verworfen

#### ~~Kein Druck, kein Offline, kein Export ausser Text und Link~~

- Widerlegt (Wirkung): Offline ist ein dokumentierter Verzicht: docs/superpowers/specs/2026-09-26-ansichten-design.md:163 «Nicht im Umfang: Offline-Fähigkeit mit Service Worker». Der Randfall :136 verlangt nur, dass Listen und Haken aus localStorage kommen, wenn die Seite offen ist – das ist erfüllt. Druck kommt in keiner der vier Situationen aus dem Interview vor (Baumarkt am Handy, Werkstatt am Handy/Tablet), und keine Spec erwähnt ihn. Export: «Liste teilen» (index.html:2018, einkauf.js:38-46) enthält alle Zuschnittzeilen mit Masse, Position und Maserung – das, was der Jumbo-Zuschnitt braucht; Bauablauf und Teiletabelle werden in der Werkstatt in der App gelesen. Übrig bleibt: Ohne Netz lädt die Seite im Jumbo nur aus dem Browser-Cache (Fonts und three.js von CDNs, index.html:5-8) – real, aber bewusst ausgeklammert und ohne Bezug zum 30-s-Kriterium. Für Kims Nutzer praktisch keine Rolle; wenn Kim das will, ist es ein neuer Entscheid, kein Fehler.

### Nachträge der Skeptiker

- (Code) Desktop ab 1200 px schneidet das Kleingedruckte unter «Total ca.» ab: `.summary .price dd{max-width:210px}` und `small{text-overflow:ellipsis}` (index.html:119-120). Screenshot desktop-bauen.png zeigt «Holz Zuschnitt CHF 245 · ganze Platt…» – genau die Aufschlüsselung (beim Reduit «Kaufteile CHF …»), die das Total erklären würde, ist auf dem Desktop unlesbar. Auf dem Handy ebenso `#mMeta` mit ellipsis (443).

- (Code) Der Bauablauf fordert «Kopier die Zuschnittliste» (sideboard.js:282) bzw. «Kopier die Materialliste» (reduit.js:814), aber die Teiletabelle hat keinen Kopier-Knopf; der einzige Export heisst «Liste teilen» und liegt im anderen Ort Einkaufen (index.html:899). Begriffe stimmen nicht überein: Zuschnittliste / Materialliste / Teile / Einkaufsliste.

- (Code) Die Oberfläche-Zeile «– Kanthölzer und Latten roh lassen oder mitölen» ist ein Hinweistext, wird aber wie eine Kaufzeile mit Menge «–» und Haken gerendert (einkauf.js:33 `${q} ${n}`, Node-Probe-Ausgabe; Quelle reduit.js finish-Eintrag mit q = '–').

- (Code) Der Text-Export der Einkaufsliste trägt immer den Titel-Zusatz «Länge = Faserrichtung» (index.html:2017), auch bei Material ohne Maserung (MDF, Spanplatte); der Tabellenkopf ist dagegen bedingt (`R.M.grain ? 'Länge (Maserung) × Breite' : 'Länge × Breite'`, index.html:1416) und die Listen-Zeilen lassen «Maserung längs» korrekt weg (einkauf.js:12, 23).

- (Code) Der Plattenplan ist nur über ein zugeklapptes <details> unter der Einkaufsliste erreichbar (index.html:906-907 «Plattenplan für den Zuschnitt») und fehlt im Ort Bauen (Segmente nur Teile/Ablängplan/Bauablauf, index.html:919-921); der Ablängplan für Bretter liegt dagegen in Bauen (1360-1363). Dieselbe Darstellung (renderSheets) ist damit auf zwei Orte mit unterschiedlicher Sichtbarkeit verteilt.

- (Wirkung) Kaufteile und Oberfläche sind in Stück bzw. dl gerechnet, gekauft werden Packungen und Dosen: Die Liste sagt «100 × Holzschrauben 4 × 40 mm ≈ CHF 4», «116 × Spreizdübel 6 mm», «12 dl Hartwachsöl» (Node-Probe Standard-Reduit; einkauf.js:32-33). Im Jumbo muss man Packungen selbst ausrechnen, und das Budget liegt unter dem Bon – docs/WEITERARBEIT.md:153 belegt es selbst (60 Schrauben: CHF 2.34 gerechnet, CHF 19.45 bezahlt; Schienen nur im 2er). Phase 1 nennt das nur als Nebensatz in Befund 3, nicht als Befund. Trifft jeden Baumarkt-Gang, Sideboard wie Reduit.

- (Wirkung) Das Kleingedruckte im Kopf ist abgeschnitten – genau die Zeile, die erklärt, was «Total» enthält: Desktop «Holz Zuschnitt CHF 245 · ganze Platt…» (desktop-einkaufen.png; index.html:119-120 max-width 210px + text-overflow), Handy Reduit «… · ganze Platten CHF 41» läuft aus dem Bild (handy-reduit-entwerfen.png), ebenso «Platten 1 × Sperrholz Birke Premium 18 mm + 1 …» (index.html:84). Kopf ist Kims Schmerzpunkt; die Erklärung zu Befund 1 ist faktisch unlesbar.

- (Wirkung) Auf dem Handy steht der Preis in Entwerfen zweimal untereinander mit zwei verschiedenen Unterzeilen: Kopf «Total ca. CHF 245 – Holz Zuschnitt CHF 245 · ganze Platten CHF 475» und Leiste «CHF 245 – Holz Zuschnitt · 10 Teile» (handy-entwerfen.png; index.html:1380-1393). Die Spec entschied nur, dass die Leiste den Preis in jedem Ort zeigt (ansichten-design.md:101), nicht die Doppelung im Kopf. Für den Freund im 30-s-Moment zwei Preisblöcke, die sich verschieden erklären – «uneinheitlich» im Kopf.

- (Wirkung) Ein Hinweis steht als abhakbare Kaufzeile mit Menge «–»: Unter «Oberfläche» rendert jedes Reduit mit Latten «– Kanthölzer und Latten roh lassen oder mitölen» mit Checkbox (Node-Probe; einkauf.js:33 nimmt jede finish-Zeile als Kauf). Klein, aber ein sichtbares «unfertig»-Signal in der Liste, die man im Baumarkt abhakt.

### Ungeprüft (Phase 1, tief/info)

- **[mittel] Abschnittstitel «Massivholz Fichte» benennt nicht, was man im Regal sucht** – Die Latten-Gruppe heisst in Teiletabelle und Einkaufsliste «Massivholz Fichte» (gSolid). Die Teile heissen «Latte 24 × 48» bzw. «Kantholz 45 × 45», der Kaufteil-Katalog nennt dasselbe «Dachlatte Fichte 24 × 48 mm», der Bauablauf sagt «Dachlatte» und «Kanthölzer». Drei Namen für zwei Produkte; «Massivholz» führt im Baumarkt eher zu Leimholzplatten als zu Dachlatten. *(Beleg: reduit.js:659 (gSolid), 283, 151, 318, 813, 838-845; einkauf.js:27-28; Node-Probe Abschnitt «Massivholz Fichte»)*

- **[mittel] Touch-Hinweis verspricht 3D-Hervorhebung, die im Ort Bauen auf dem Handy nicht sichtbar ist** – Über der Teiletabelle steht bei Touch «Tipp auf eine Zeile, um das Teil in 3D hervorzuheben». Auf dem Handy (≤ 920 px) blendet der Ort Bauen aber .cfgwrap aus, und die 3D-Vorschau liegt in .cfgwrap. Der Tipp hebt also etwas hervor, das man nicht sieht; dasselbe gilt für Pick/Highlight aus dem Plattenplan im Ort Einkaufen. Am Desktop (3 Spalten) funktioniert es. *(Beleg: index.html:924 (.hint-touch), 419 (body[data-ort=bauen] .cfgwrap{display:none}), 524-527 (viewer in .cfgwrap), 1517-1537 (highlight))*

- **[mittel] Bauablauf verweist auf Listen mit Namen, die es in der UI nicht gibt, und ohne Weg dorthin** – Schritt 1 sagt «Kopier die Zuschnittliste und lass die Platten … zuschneiden» (Sideboard) bzw. «Kopier die Materialliste» (Reduit). Die UI kennt weder «Zuschnittliste» noch «Materialliste»: Die Zuschnittteile stehen im Ort Einkaufen unter «… · Zuschnitt», die Tabelle im Ort Bauen heisst «Teile». Einen Kopierknopf gibt es nur für die ganze Einkaufsliste (#bTeilen in Einkaufen), im Ort Bauen keinen – und keinen Link … *(Beleg: sideboard.js:277; reduit.js:813-814; index.html:899 (#bTeilen nur in #p-einkaufen), 919-932 (Bauen ohne Kopier-/Teilen-Knopf), 907)*

- **[mittel] Niveau-Text wird in eine dauerhaft versteckte Gruppe gerendert** – renderSummary schreibt «Einsteiger / Einsteiger+ / Etwas Übung» plus Begründung (z. B. «Taschenloch + Drehtüren anschlagen») in #levelBox. syncVisibility setzt #grp-niveau aber immer auf hidden. Sichtbar bleibt das Niveau nur als drei Punkte auf den Bauweise-Karten (aria-label «Niveau n von 3»), ohne Legende, was die Punkte bedeuten. Für «Entscheiden zwischen Varianten» fehlt das Niveau auch in der Sammlung. *(Beleg: index.html:1115 ($('#grp-niveau').hidden = true), 1380, 1395-1397, 880-883, 1249-1250, 2140-2150)*

- **[tief] Masse: Reihenfolge je Typ anders und beim Sideboard nicht die eingegebene Tiefe** – Sideboard zeigt «B × H × T» (W × H × Dtot), Reduit «B × T × H» (W × D × H) – ohne Beschriftung der Achsen, in Kopf, Mass-Tag, Einkaufen-Titel und Sammlung. Dtot = Tiefe + Türstärke + 1 mm: Wer 400 eingibt, sieht 419. Der Formular-Hint erklärt «Tiefe inklusive Rückwand, ohne aufliegende Türen», das Ergebnis erklärt den Unterschied nicht. *(Beleg: index.html:1370-1371, 1388, 1479 (kaufTitel); sideboard.js:266 (Dtot); konfig.js:588; index.html:570 (Hint))*

- **[tief] Einheiten gemischt: mm in Listen, cm im Bauablauf, dl/m/m² in der Oberfläche** – Listen und Tabelle sind konsequent in mm («alle Masse in mm»). Der Bauablauf wechselt im selben Satz: «alle ca. 15 cm und 40 mm von vorne», «alle 40 cm vorbohren», «24 mm von der Wand», «Wasserwaage (mind. 60 cm)». Oberfläche in dl und m², Kantenband in m, Latten-Laufmeter in m. Nicht falsch, aber für Einsteiger ohne Umrechnungsroutine ein Stolperstein. *(Beleg: sideboard.js:277-313 (15 cm / 40 mm); reduit.js:838, 851 (40 cm / 24 mm), 769 (60 cm); sideboard.js:231-251 (dl, m); index.html:1430, 1424)*

- **[tief] Zwei Holzpreise (Zuschnitt vs. ganze Platten) ohne Erklärung am Ort der Ausgabe** – Kopf-Kleingedrucktes und Plattenplan-Chips zeigen beide «Zuschnitt … × CHF» und «ganze Platten … = CHF». Welcher Preis beim Zuschnittservice gilt und warum es zwei gibt, steht nur im Formular-Hint «Kosten = Fläche der zugeschnittenen Teile × Preis pro m²». In Einkaufen und Plattenplan fehlt der Satz. *(Beleg: index.html:1392, 1444, 878, 1110)*

- **[tief] Bauablauf ohne Fortschritt, ohne Bezug zu Teilen und Kaufteilen** – Der Bauablauf ist eine nummerierte Liste mit Titel, Text, Tipp. Es gibt keine Checkboxen, keinen gespeicherten Fortschritt (der Key -bau merkt nur den Unterreiter), keine Querverweise von Schritten auf Positionsbuchstaben der Teile oder auf die benötigten Kaufteile/Werkzeuge (diese stehen nur in der Einkaufsliste). Was der Nutzer in der Werkstatt braucht, ist dort nicht entschieden – siehe offene Fragen. *(Beleg: index.html:932, 1470-1472, 1507-1514 (STORE + '-bau'); sideboard.js:270-314; reduit.js:807-871)*

- **[tief] Haken-Zeilen sind auf Touch kleiner als die übrigen Bedienelemente** – Die pointer:coarse-Regeln vergrössern Segmente, Knöpfe, Selects, Zahlenfelder, Tabs, Checkboxen (.check) und Karten, nicht aber die Einkaufszeilen: .kauf label hat 14 px Schrift und 8 px Padding (≈ 37 px Zeilenhöhe), die Checkbox 20 px. Im Baumarkt mit einer Hand knapp. *(Beleg: index.html:320-323 (.kauf label/input), 406-417 (coarse-Liste ohne .kauf))*

- **[info] Inventar: Ausgaben, Reihenfolge, Form, Ort auf dem Handy** – Kopf (Desktop): dl «Aussenmass/Raum · Teile · Platten/Bretter · Total ca.» mit Kleingedrucktem (Holz, Kaufteile, ganze Platten). Handy: feste Leiste unten mit Preis + Meta, Kopf-Summary nur im Ort Entwerfen. 3D-Vorschau mit Türen/Explosion/Vorderwand/Reset, Mass-Tag rechts, Pick-Kästchen bei Antippen; auf dem Handy sticky oben (38svh), Knöpfe nur als Icons, und nur im Ort Entwerfen sichtbar (3D steckt in .cfgwrap). … *(Beleg: index.html:519, 1376-1394 (Summary), 957, 422 (Leiste/Handy), 525-539, 1370, 1686-1692, 428-433, 419, 524 (3D), 540-543, 127-133, 1399-1413, 895, 917, 1364-1367)*

- **[info] Feedback: aria-live vorhanden bei Warnungen und Meldungen, nicht bei Preis, Zählern und Einkaufen-Kopf** – aria-live=polite: #warns, .js-msg (Kopf und Leiste), #copied, #collMsg, #matInfo, #levelBox (versteckt); role=status: #bwNotice. Nicht live: #summary (Total), #mPrice/#mMeta in der Leiste, #kaufKopf, Haken-Zähler im Tab. Regel-Anpassungen melden sich per flash «Angepasst – … Der Grund steht beim Feld» (6 s), Bauweisewechsel per «‹Name›: Material, Verbindung …». Teilen-Knopf wechselt 1.8 s auf «✓ Kopiert». Warnungen … *(Beleg: index.html:520, 542, 552, 844, 882, 901, 942, 957 (live); 519, 889, 897 (nicht live); 1340-1350, 2064-2070 (flash); 899, 2027-2029; 355-356, 1400-1404)*

- **[info] Hierarchie Einkaufen: oben steht, was der Zuschnittservice braucht, nicht, was in den Wagen muss** – Reihenfolge ist fix: Zuschnittteile (A–F mit Massen) zuerst, dann Latten, Kaufteile, Oberfläche, Werkzeug. Preise pro Zuschnittgruppe stehen nur unten im eingeklappten Plattenplan. Für den Gang durch den Baumarkt (Platten → Latten → Schrauben → Öl) passt die Reihenfolge, aber der Abschnitt Zuschnitt enthält 1 Zeile pro Teil statt «1 Platte 2500 × 1250 Birke 18» als Kaufposition – die Plattenzahl steht nur in der … *(Beleg: einkauf.js:13-34; index.html:1487-1492, 906-913, 1441-1444)*

- **[info] Hierarchie Entscheiden: Sammlung und Bauweise-Karten zeigen Preis und Masse, aber weder Niveau noch Warnungen** – Die Sammlung zeigt pro Variante Typ, Bauweise, Masse, Material, Kosten beim Speichern, Datum und ist nach Preis sortierbar; «(ältere Variante)» erscheint, wenn Regeln Korrekturen hätten. Nicht gespeichert/angezeigt: Niveau, Anzahl Warnungen, Teilezahl. Die Bauweise-Karten zeigen live Preis pro Bauweise und Niveau-Punkte, Details nur für die gewählte Karte. Ein Nebeneinander fehlt bewusst (Spec: «Die Liste reicht»). *(Beleg: index.html:2140-2150, 941, 1247-1253; konfig.js:585-597 (info ohne level/warn); Spec 2026-09-26 Tabelle «Varianten vergleichen»)*

### Offene Fragen aus dieser Linse

- Wird im Baumarkt wirklich am Handy abgehakt – und wie oft ohne Netz oder mit schlechtem Empfang? (Entscheidet, ob Service Worker/Offline-Cache nötig ist.)

- Wie geht die Zuschnittliste zum Zuschnittservice: zeigst du das Handy, druckst du aus, oder tippst du die Masse am Terminal selbst ein? (Entscheidet über Druck-CSS/Export vs. Teilen-Text.)

- Soll das Sideboard-Total Beschläge enthalten (Schätzpreise wie beim Reduit), oder reicht «nur Holz», dann aber klar beschriftet in Kopf und Einkaufen?

- Latten und Kanthölzer: willst du sehen, wie viele Standardlatten (2 m / 2.5 m) du kaufen musst, oder genügen dir die Schnittlängen?

- Bauablauf in der Werkstatt: liest du ihn einmal durch, oder willst du Schritte abhaken und Positionsbuchstaben/Kaufteile pro Schritt sehen?

- Zielgruppe für die Texte: Einsteiger ohne Vorwissen (dann Glossar/Erklärung per Tipp) oder Leute mit Baumarkt-Erfahrung (dann reichen die Fachwörter)?

- Preis-Stand und Jumbo-Quelle pro Zeile anzeigen (Daten sind in preise.js), oder genügt ein globales Datum in der Einkaufsansicht?

- Warnungen: brauchst du Stufen (Problem vs. Hinweis vs. Bestätigung)? Welche Warnungen hast du bisher bewusst ignoriert?

- Masse-Reihenfolge B × H × T beim Sideboard und B × T × H beim Reduit – bewusst so, oder vereinheitlichen und beschriften?

- Ist das Niveau («Einsteiger», «Etwas Übung») fürs Entscheiden wichtig? Aktuell erscheint der Text nirgends, nur Punkte auf den Karten.

- Ganze Bretter beim Reduit: sollen sie im eigenen Abschnitt stehen oder bei den Kaufteilen – aktuell beides?

## Technik-Stack und Randbedingungen

Kein Build, Quirks Mode, three.js, Eigenbau-UI-Inventar.

**Kurzfassung (Phase 1):** Martylko ist eine bewusst build-freie Vanilla-App: sechs klassische Script-Tags liefern Globals, die Tests laden dieselben Dateien per CommonJS-Guard, und Cloudflare serviert das Repo-Root als statische Assets. Diese Randbedingung bindet nur die sechs Berechnungsdateien, nicht index.html – deshalb lassen die Optionen (a) bis (d) Tests und Hosting unverändert, nur ein echter Build (e) greift in beides ein. Zwei technische Vorbedingungen liegen vor jeder Library-Frage: Die Seite läuft ohne Doctype im Quirks Mode (im Browser verifiziert, compatMode «BackCompat»), und three.js r128 hängt am 2022 entfernten examples/js-Pfad, sodass jede Modernisierung Modul-Scripts erzwingt. Die Eigenbau-UI ist funktional reich (Pill-Animation, Dialog mit History, Container-Query-Karten, Touch- und Reduced-Motion-Medienabfragen), aber uneinheitlich: vier Feedback-Muster, drei Reiter-Muster, neun Button-Varianten, gemischte Auswahlfelder, 11 Radien- und 15 Schriftgrössen-Werte ohne Tokens. Ob eine Library hilft, hängt weniger von Technik als von Kims Zielen ab: Build ja/nein, Lernziel, Pflegebereitschaft und ob ein echtes Bottom-Sheet auf dem Handy gewollt ist.

### Geprüft

#### [mittel] Randbedingung: Kein Doctype – die Seite rendert im Quirks Mode

*Phase 1: hoch → nach Prüfung mittel.*

index.html beginnt direkt mit <meta charset>, es gibt kein <!doctype html>, kein <html>, <head> oder <body> (grep nach diesen Tags trifft nur <header> auf Zeile 504). Im Browser bestätigt: document.compatMode === 'BackCompat', document.doctype === null. Folgen: Jede CSS-Library (Pico, Shoelace/Web Awesome, Open Props, Tailwind) ist für den Standards Mode gebaut; Prozent-Höhen (html,body{height:100%} Zeile 110-112), Tabellen-Vererbung (276-287) und Box-Verhalten können nach dem Hinzufügen des Doctypes anders ausfallen. Das ist keine Option, sondern eine Vorbedingung, die vor jedem Library-Entscheid einzeln getestet gehört – unabhängig davon, welche Option gewählt wird. In docs/WEITERARBEIT.md und den Specs ist das nirgends erwähnt.

Beleg: index.html:1 («<meta charset="utf-8">» als erste Zeile); Playwright-Auswertung auf http://127.0.0.1:8765/: compatMode 'BackCompat', doctype null

- Prüfung Code: index.html hat keinen Doctype und kein <html>/<head>/<body>-Element (Zeile 1 ist <meta charset>), die Seite läuft im Quirks Mode. Vor jedem Library-Entscheid muss der Doctype ergänzt und die Seite durchgetestet werden; die sichtbaren Folgen dürften klein sein, weil box-sizing (44) und Tabellen-Schrift (277, 281) explizit gesetzt sind und .app mit 100dvh arbeitet (112) – offen bleiben Prozent-Höhen von #stage (126) und .nogl (239) sowie Formularelemente.

#### [mittel] Randbedingung: three.js r128 über zwei CDNs, OrbitControls aus dem entfernten examples/js

three.min.js r128 kommt von cdnjs, OrbitControls von jsdelivr unter three@0.128.0/examples/js (index.html:966-967). Laut three.js-Forum wurde das Verzeichnis examples/js mit r148 entfernt; Addons gibt es seither nur als ES-Module (examples/jsm bzw. «three/addons»), die offizielle Doku zeigt «import { OrbitControls } from 'three/addons/controls/OrbitControls.js'» (Context7 /websites/threejs). Aktuelle Version laut Websuche: r186 (Sept. 2026, 58 Releases weiter); dieselbe Quelle nennt für r186 die Entfernung der minifizierten Builds und von PCFSoftShadowMap – beides nutzt die App (three.min.js Zeile 966, THREE.PCFSoftShadowMap Zeile 1649). Diese r186-Details stammen aus einem Blog, nicht aus den offiziellen Release Notes – ungeprüft. Entscheidend für die UI-Frage: Ein Upgrade geht ohne Build nur über importmap plus <script type=module>; Modul-Scripts laufen aber deferred, während das Inline-Script initThree() synchron beim Laden aufruft (Zeile 2270, THREE-Global-Zugriffe 1551-1790, Guard «!window.THREE || !THREE.OrbitControls» 1645). Wer three.js anfasst, muss also dieselbe Tür öffnen wie Option (c)/(d): Module statt klassischer Scripts. Solange r128 auf cdnjs/jsdelivr liegt, läuft es weiter – die Frage ist Pflege, nicht Funktion.

Beleg: index.html:966-967, 1645, 1649, 2270; https://discourse.threejs.org/t/the-examples-js-directory-will-be-removed-with-r148/45349; Context7 /websites/threejs (OrbitControls-Import); Websuche utsubo.com «threejs-2026-what-changed» (r186, ungeprüft)

- Prüfung Code: three.min.js r128 kommt von cdnjs, OrbitControls von jsdelivr unter three@0.128.0/examples/js (index.html:967-968). examples/js wurde mit r148 entfernt; die minifizierten UMD-Builds verschwanden mit r160 (deprecated r150), PCFSoftShadowMap (1649) ist in neueren Versionen deprecated. Ein Upgrade geht ohne Build nur über importmap plus <script type=module>, das Inline-Script ruft initThree() aber synchron auf (2270, Guard 1645). Solange r128 gepinnt bleibt, läuft alles – es ist eine Pflege-, keine Funktionsfrage.

#### [mittel] Inventar der Eigenbau-UI: funktional reich, aber in Feedback, Reitern, Buttons und Tokens uneinheitlich

Komponenten (Markup 494-965, CSS 8-493, 290 Regeln zur Laufzeit): Segmente .seg 20-mal (CSS 171-176, 189; Pill-Animation 339-345 mit JS placePill/ResizeObserver 1906-1918), Karten .cards 3 Gruppen/15 Karten (177-205; .card.bw im JS gebaut, fillBauweisen 1233), Range+Zahl .dim 18-mal (149-158; Hand-Sync 1817-1820, 1838-1846; Ticks 375-378), .num 25-mal, native <select> 4-mal (808, 817, 835, 842; CSS 160), Farbmuster .swatches (821; 210-216), Dialog <dialog class=wahl> mit History-Integration (948-955; 63-72; 2077-2119), Leiste unten .mbar nur Handy (956-964; 384, 434-451), Reiter .tabs/.tab/.tabind (888-892; 248-252, 350-354; eigene Tastatursteuerung 1878-1903), Tabelle #cutTable mit Container-Query zu Karten (925; 275-287, 469-486), Haken .kauf (315-325; renderKauf 1480-1504), Warnungen (.warn 244, .warnhead 127-132, .warnhint 314, .bwnotice 206, .grund 201), Einklappen .gh nur Handy (365, 428-433; 1924-1941), Schloss .lock (368-374), Toast/Meldung (siehe unten). Rendering: 33 innerHTML-Zuweisungen mit Template-Strings und Hand-Escaping esc() (979, 20 Aufrufe), 44 addEventListener, alles in einer IIFE (975-2279) – nichts davon ist von aussen erreichbar. Wo es sich wiederholt oder widerspricht: (1) Vier Feedback-Muster: flash() 2068-2073 schreibt in .copied.js-msg (520, 957), die dreimal verschieden gestylt ist (76-77 schwebender Kasten, 257 inline, 446-449 in der Leiste); #copied 901 wird direkt gesetzt (2023, 2026); #collMsg 942; dazu der Button-Swap «✓ Kopiert» (359-362, 899, 2027-2028). (2) Drei Reiter-Muster: .tabs (Desktop), .mnav (Handy, 958-963), .seg.bausub als Unterreiter (918-922) – plus .seg.collsort fürs Sortieren (941); bei ≤640px wird .tabs zu Kacheln (461-465). (3) Auswahlfelder gemischt: «Griff» ist <select> (817), «Türen» ein Segment (784); «Material Fronten» <select> (808), «Stärke Fronten» Segment (812). (4) Neun Button-Varianten zur Laufzeit (btn, linkbtn, vbtn, warnhead, gh, lock, tab, wahlbtn, .mnav ohne Klasse), fünf davon mit all:unset (68, 127, 365, 368, 437). (5) Zwei Aufklapp-Muster: .gh-Gruppen vs. natives <details> für den Plattenplan (906). (6) Klassenkollision .dim: Formularzeile (149) und Tabellenzelle (476-478) – im Browser 24 .dim statt 18. (7) Touch-Ziele: .mnav button min-height 28px (437) gegen 44px für .btn/select/.tab (408-410) und 40px für .vbtn (407, 423). (8) Tokens nur für Farben, Schriften, Schatten, Easing (9-21); keine Abstands- oder Radius-Skala: 11 verschiedene border-radius-Werte (8px×7, 9px×6, 10px×6, 6px×5, 50%×5, 999px, 7px, 14px, 12px, 5px, 2px) und 15 verschiedene font-size-Werte (13px×19, 12.5px×14, 12px×10 … 10.5px). (9) Dark Mode via prefers-color-scheme und [data-theme] vorbereitet (22-43), aber kein Umschalter im JS (grep nach data-theme/dataset.theme ausserhalb des CSS: nichts). Was eine Library nicht besser machen würde: Pill-Animation, @starting-style, Reduced Motion (488-492), Touch-Medienabfragen (403-415), Container-Query-Karten, Dialog mit Zurück-Taste, 64 aria-label, 7 aria-live, 30 role-Attribute.

Beleg: index.html:9-21, 63-77, 127-132, 149-158, 171-205, 206-216, 244-257, 248-252, 339-378, 403-415, 434-451, 461-486, 520, 784-842, 888-964, 975-979, 1233, 1480-1504, 1878-1941, 2068-2119; Playwright: 20 .seg, 15 .card, 24 .dim, 56 Buttons in 9 Klassen, 290 CSS-Regeln

- Prüfung Code: Inventar und Zählungen stimmen im Wesentlichen. Korrekturen: Feedback läuft über drei, nicht vier Muster – flash() (2068) bedient sowohl .js-msg (520, 957) als auch #collMsg (942; Aufrufe 2220-2232), daneben #copied per textContent (901; 2019-2027) und der Button-Swap «✓ Kopiert» (359-362, 899). Die Handy-Leistenknöpfe haben min-height 28px (437), rendern aber ~36px hoch (padding 8px + Zeilenhöhe 1.5×13px); der Abstand zu den 44px von .btn/.tab (408-410) ist real, aber kleiner. Die .dim-Kollision (149 vs. td.dim 1426, 476-478) betrifft auch die Desktop-Tabelle, da .dim dort display:grid auf die Zelle legt.

### Nachträge der Skeptiker

- (Code) Kein lang-Attribut: Weil es kein <html>-Element gibt (index.html:1-4), ist die Dokumentsprache undefiniert – iPhone-Safari/VoiceOver sprechen deutsche Texte mit Systemsprache, Übersetzungsangebot und Silbentrennung richten sich nicht nach de-CH. Hängt direkt mit dem fehlenden Doctype zusammen, wird dort aber nicht genannt.

- (Code) Ausfall der CDNs zeigt eine falsche Fehlermeldung: Lädt three.min.js oder OrbitControls nicht (Funkloch im Baumarkt, Werkstatt ohne Netz, Adblocker), wirft der Guard Error('lib') (index.html:1645) und der catch (1705) schreibt «Die 3D-Vorschau braucht WebGL» – obwohl WebGL vorhanden ist. Kein Manifest, kein Service Worker (grep manifest/serviceWorker leer), Google-Fonts-Stylesheet render-blocking im Head (Zeile 7): die App ist trotz der Nutzungssituationen «Baumarkt/Werkstatt» nicht offline-fähig, und jede Stack-Option erbt diese Abhängigkeit.

- (Code) Tests decken nur Daten- und Rechenmodule ab: test/*.test.js laden konfig/shared/sideboard/reduit/einkauf/preise, keiner lädt index.html; test/konfig.test.js:18 dupliziert lediglich «Eingabegrenzen wie in index.html» als Kommentar. Die ~1300 Zeilen UI-Logik in der IIFE (index.html:975-2279) sind ungetestet und die Eingabegrenzen doppelt gepflegt (Drift-Risiko) – ein Umbau mit oder ohne Build ändert daran nichts von selbst, muss aber in der Aufwandsschätzung stehen.

- (Code) Alle Scripts sind klassisch und synchron ohne defer am Body-Ende (index.html:967-974): three.min.js r128 (mehrere hundert KB) muss vollständig geladen und ausgeführt sein, bevor die IIFE startet; erst dann wird das Formular interaktiv und bekommt .ready (2278). Auf Handy-Netz verlängert das den «ersten Moment» – unabhängig von der UI-Library-Frage; eine Stack-Bewertung sollte Ladereihenfolge/Lazy-Load des 3D-Teils als eigene Grösse führen.

- (Code) Escaping ist Konvention, nicht Struktur: Von 33 innerHTML-Zuweisungen interpolieren 13 ohne esc() (z. B. index.html:998 #mat-Optgroups, 1426 Teiletabelle mit r.name, 1471 Bauablauf-Schritte, 1490 Einkaufsliste) – heute unkritisch, weil die Strings aus den Datenmodulen kommen, aber jede neue Datenquelle (Link, Sammlung) muss das manuell beachten. esc() (979) maskiert zudem kein Apostroph; Attribute in einfachen Anführungszeichen gibt es derzeit keine (grep leer). Für die Option «Template-/Komponenten-Library» ist das ein konkretes Nutzen-Argument, das Phase 1 nicht nennt.

### Ungeprüft (Phase 1, tief/info)

- **[mittel] Randbedingung: «Kein Build» ist dokumentierter Entscheid – Kopplung über Globals und CommonJS-Guard** – Die sechs Dateien preise.js, shared.js, sideboard.js, reduit.js, konfig.js, einkauf.js werden als klassische Scripts geladen (index.html:968-973) und reden über Globals miteinander (konfig.js:1 «braucht die Globals aus shared.js, sideboard.js, reduit.js»; reduit.js:1). Für Node exportieren sie mit «if (typeof module !== 'undefined') module.exports = …» (shared.js:277, sideboard.js:315, reduit.js:872, konfig.js:667, … *(Beleg: docs/superpowers/plans/2026-09-26-ansichten.md:15; shared.js:1,9,277; konfig.js:1,667; test/konfig.test.js:3-5; index.html:968-975, 2279; README.md:33-37)*

- **[tief] Randbedingung: Hosting als statische Assets direkt aus dem Repo-Root** – wrangler.jsonc serviert mit assets.directory «.» das Repo-Root unter der Custom Domain diy.hallo.kim (Zeile 3-8); .assetsignore schliesst .git, docs, test, tools, README, LICENSE, wrangler.jsonc, node_modules aus (Zeile 1-10). Upstream läuft dieselbe Struktur auf GitHub Pages (README.md:11). Ein .github-Ordner fehlt – ob per «wrangler deploy» von Hand oder über Workers Builds deployt wird, ist aus dem Repo nicht … *(Beleg: wrangler.jsonc:3-8; .assetsignore:1-10; README.md:11; kein Verzeichnis .github)*

- **[tief] Randbedingung: Vier externe Hosts beim Laden (Google Fonts, cdnjs, jsdelivr)** – Drei Schriftfamilien in acht Schnitten kommen von fonts.googleapis.com/fonts.gstatic.com (index.html:5-7), three.js von cdnjs und jsdelivr (966-967). Im Browser gemessen: externalHosts = fonts.googleapis.com, fonts.gstatic.com, cdnjs.cloudflare.com, cdn.jsdelivr.net. Option (b) Pico und (c) Shoelace/Web Awesome liefern über jsdelivr (schon vorhanden), Option (d) Preact/htm über esm.sh käme als fünfter Host dazu. Ob … *(Beleg: index.html:5-7, 966-967; Playwright performance.getEntriesByType('resource') → 4 externe Hosts)*

- **[info] Randbedingung: Die App setzt bereits modernes CSS voraus – Browser-Support ist nicht der Engpass einer Library** – Im Inline-CSS: :has() 12-mal (z. B. 182-188, 203-205), color-mix 3-mal (227, 236, 434), @starting-style 2-mal (356, 358), @container 1-mal (469, Container-Deklaration 102), svh (420), dvh (112), text-wrap:balance (47), backdrop-filter (227, 434), env(safe-area-inset-*) 7-mal. Laut Websuche (web.dev Baseline): :has() breit verfügbar ab Chrome 105/Safari 15.4/Firefox 121; color-mix ab Chrome 111/Firefox 113/Safari … *(Beleg: index.html:47, 102, 112, 182-188, 227, 356-358, 420, 434, 469; Websuche web.dev/blog/baseline2023 u. a.)*

- **[info] Option (a): Bei Vanilla bleiben, Tokens ausbauen, zwei bis drei eigene Web Components** – Build nötig: nein. Grösse: +0 KB extern. Integration: Das CSS (Zeile 8-493) könnte in eine eigene Datei, die Token-Liste (9-21) um Abstands-, Radius- und Schriftskala wachsen (heute 11 Radien, 15 Schriftgrössen), und die drei meistwiederholten Muster – Range+Zahl .dim (18-mal, Sync-Code 1817-1820/1838-1846), Segment .seg (20-mal, placePill 1906-1918) und die Meldung (vier Muster, flash 2068) – würden je ein Custom … *(Beleg: index.html:9-21, 149-158, 171-176, 1167-1177, 1261-1277, 1817-1846, 1906-1918, 2068-2073; docs/superpowers/plans/2026-09-26-ansichten.md:15)*

- **[info] Option (b): CSS-only-Library via CDN (Pico CSS oder Open Props)** – Build nötig: nein (ein <link>). Grösse: Pico «pico.fluid.classless.min.css» ca. 20 KB laut Pico-Doku; Open Props open-props.min.css 23,5 kB plus optional normalize.min.css 8,93 kB laut unpkg-Listing. Integration Pico: klassenlos – es stylt alle nativen Elemente (button, input, select, table, dialog, details) und kollidiert damit frontal mit den 290 bestehenden Regeln und dem eigenen Mass (13-15px Schrift, eigene … *(Beleg: Context7 /picocss/pico (CDN-Link, ca. 20 KB classless, data-theme); Websuche picocss.com/docs/v2 (Komponentenliste), unpkg open-props (Grössen), github.com/Yohn)*

- **[info] Option (c): Web Components via CDN (Shoelace → Web Awesome, oder nur Lit)** – Build nötig: nein – Shoelace/Web Awesome: ein Theme-Stylesheet plus «<script type=module src=…autoloader.js>», der Komponenten lazy nachlädt (Shoelace-Doku; Web Awesome: webawesome.css + webawesome.loader.js). Stand: Shoelace ist laut eigenem GitHub «sunset, no active development»; Nachfolger ist Web Awesome (Shoelace 3.0 unter neuem Namen, Core kostenlos, Pro bezahlt; Version 3.10.0 vom Juni 2026 laut Websuche, … *(Beleg: Context7 /shoelace-style/shoelace (Autoloader, Themes, sl-drawer bottom, sl-radio-button, sl-tab-group bottom, sl-input); github.com/shoelace-style/shoelace («S)*

- **[info] Option (d): Preact + htm ohne Build über ESM-CDN** – Build nötig: nein – «import { html, render } from 'https://esm.sh/htm/preact/standalone'» (Preact-Doku «No-Build Workflows»); Grösse «ca. 5 KB» laut Blogs, ungeprüft. Was es ist: ein Rendering-Modell (Zustand → Markup), keine Komponentenbibliothek – Segmented Control, Sheet, Toast und das ganze CSS blieben Eigenbau. Was es ersetzen würde: die 33 innerHTML-Template-Strings mit Hand-Escaping (esc 979; z. B. renderKauf … *(Beleg: Websuche preactjs.com/guide/v10/no-build-workflows, gist developit «Preact Without Build Tools»; index.html:979, 1071, 1414, 1490-1492, 1812-1857, 975-2279, 153)*

- **[info] Option (e): Echter Build (Vite + Svelte oder React + shadcn/Base UI) als Umbau** – Build nötig: ja (npm, Lockfile, Vite). Grösse: je nach Framework und Komponentenwahl; nicht pauschal belegbar. Integration: Neuschreiben von index.html als Komponenten; die sechs Berechnungsdateien müssten zu ES-Modulen mit import/export werden, weil ein Bundler keine Globals zwischen Dateien kennt – damit ändern sich alle elf Testdateien von require() auf import (Node 24 kann ESM-Tests mit node --test; die … *(Beleg: shared.js:277, konfig.js:667, test/*.test.js (require in allen 11 Dateien), wrangler.jsonc:3-5, README.md:11, docs/superpowers/plans/2026-09-26-ansichten.md:15;)*

- **[info] Welche Optionen Tests und Hosting unverändert lassen** – Tests binden ausschliesslich preise.js, shared.js, sideboard.js, reduit.js, konfig.js, einkauf.js (CommonJS-Guard, Globals über Object.assign(globalThis, …)). Hosting serviert das Repo-Root. Daraus folgt: (a) Vanilla + Tokens + eigene Web Components, (b) CSS-only via CDN, (c) Web Components via CDN und (d) Preact + htm via ESM-CDN berühren nur index.html und allenfalls neue Dateien im Root – Tests und wrangler.jsonc … *(Beleg: test/konfig.test.js:3-5; test/sideboard.snapshot.test.js:4-6; wrangler.jsonc:3-5; .assetsignore:1-10; index.html:966-975, 2270)*

### Offene Fragen aus dieser Linse

- Build ja oder nein: Der Entscheid «Kein Build, keine Abhängigkeiten» steht in drei Plan-/Spec-Dokumenten. Gilt er weiterhin als harte Grenze, oder ist er verhandelbar, wenn der Nutzen (fertige Sheets, Segmented Controls, three.js-Upgrade) gross genug ist?

- Lernziel: Soll die Arbeit an Martylko etwas Bestimmtes lehren (Web Components und die Plattform selbst, ein Framework wie Svelte/React, oder gar nichts – die App ist das Ziel)? Das entscheidet zwischen (a), (d)/(e) und (c) mehr als jede Technik.

- Pflegeaufwand: Wie viel laufende Wartung von Fremdabhängigkeiten ist akzeptabel (Versions-Pinning in CDN-URLs, Migrationen wie Shoelace → Web Awesome, npm-Updates)? Ist die App ein Solo-Projekt, das auch ein Jahr unangetastet laufen soll?

- Upstream-Beziehung: Sollen Änderungen weiterhin an den Upstream-Fork m-hertig/diy-furniture zurückfliessen können? Ein Build oder Modul-Umbau macht Pull Requests dorthin praktisch unmöglich.

- Deploy-Weg: Wie wird heute deployt – «wrangler deploy» von Hand oder Workers Builds aus Git? Das Repo enthält keinen .github-Ordner. Bei einem Build müsste der Weg bekannt sein.

- Browser-Support: Welche Geräte und Browser nutzt du bzw. nutzen die Leute, die den Link bekommen (iOS-Safari-Version, Android-Chrome)? Die App setzt mit :has(), color-mix und @starting-style schon Browser ab ca. 2023 voraus – ist das die bewusste Untergrenze?

- Quirks Mode: War bekannt, dass die Seite ohne Doctype rendert? Bist du einverstanden, dass vor jedem Library-Entscheid zuerst der Standards Mode getestet wird (mit Risiko, dass sich das Layout verschiebt)?

- three.js: Reicht r128 weiterhin (läuft, ist aber 58 Releases zurück und am entfernten examples/js-Pfad), oder soll ein Upgrade Teil der UI-Entscheidung sein, weil es dieselbe Modul-Umstellung erzwingt?

- Dark Mode: Soll es einen Umschalter in der Oberfläche geben (der [data-theme]-Haken ist im CSS vorbereitet, im JS fehlt er), oder genügt das Folgen der Systemeinstellung?

- Mobile-Qualität: Welche Handy-Muster sind dir wirklich wichtig – ein echtes Bottom-Sheet mit Wischgeste, eine native anmutende Segmented Control, haptisches Feedback? Nur diese Antwort entscheidet, ob (c) oder (e) überhaupt etwas liefert, das (a) nicht kann.

- Schriften: Sollen Familjen Grotesk, Figtree und IBM Plex Mono weiterhin von Google geladen werden, oder selbst gehostet (Datenschutz, Offline)? Das ist unabhängig von der Library-Frage, aber derselbe Moment, es zu entscheiden.

## Absicht und Zielgruppe laut Docs

Was dokumentiert ist und was fehlt (Layer 3–4).

**Kurzfassung (Phase 1):** Die Docs beschreiben genau einen Nutzer: «ich» (Kim), der ein Sideboard fürs Wohnzimmer oder ein Regal im Reduit selber bauen will, in drei Situationen (zu Hause entwerfen, im Baumarkt Jumbo einkaufen, in der Werkstatt bauen), «meist auf dem Handy, zum Entwerfen auch am Desktop». Zweite Nutzerstimmen, Beobachtungen oder Feedback gibt es nicht; die einzige Fremdsicht ist der Schreiner-Review («Ein Laie entscheidet ‹wie baue ich›»). Produktseitig sind seit dem 25.09.2026 viele Entscheide gefallen und dokumentiert (Reduit, feste Formate, Ansichten-Konzept Variante E, Bauweisen vorne/Regeln dahinter, Pfostenrahmen A, Ständerraster-Sperre), und die Ansichten-Spec hat die visuelle Gestaltung (Layer Surface) ausdrücklich auf später verschoben – dort setzt das aktuelle UI/UX-Review an. Die Herkunft ist klar: m-hertig lieferte am 24.09.2026 in 6 Commits eine einzelne index.html (1359 Zeilen, Name «Martylko», Tokens, Dark Mode, Sideboard-Rechnung, Speicherkey); alles ab 25.09. (111 Commits) ist Kims Zusatz, der Upstream steht seither still. Lücken für UX-Entscheide: Zielgruppe ausserhalb von Kim, Bedeutung von «Niveau», Handy-Kontext (OS, Homescreen, offline), der konkrete Ablauf an der Zuschnitt-Theke und in der Werkstatt, Rolle der 3D-Ansicht, Zweck von Link-Teilen und Zufall, akzeptable Preisabweichung sowie das Verhältnis zum Upstream. Dazu kommen zwei veraltete Doku-Stellen (WEITERARBEIT «Ideen» nennt Ansichten noch als offen; Link-Teilen vom 02.10. fehlt, README zeigt auf die Upstream-URL).

### Geprüft

#### [mittel] 6 Lücke: Wer ausser Kim nutzt die App? Keine zweite Nutzerstimme, keine Beobachtung, kein Feedback

*Phase 1: hoch → nach Prüfung mittel.*

Alle Bedürfnisse stammen aus der Ich-Job-Story. In den Docs gibt es keinen Hinweis auf Nutzertests, Feedback, Zahlen oder Personas (Suche nach Feedback/Nutzertest/Persona/Zielgruppe in docs ohne Treffer). MIT-Lizenz und öffentlicher Link legen ein Publikum nahe, die Reduit-Spec sagt nur «allgemein nutzbar gebaut». Ohne diese Antwort lässt sich nicht entscheiden, ob Einsteiger-Führung oder Experten-Dichte Vorrang hat.

Beleg: ansichten-design.md:9 (Ich-Form); reduit-design.md:9 «Zuerst für ein konkretes Reduit gedacht, aber allgemein nutzbar gebaut.»; LICENSE:1-3; README.md:11; grep -rni 'feedback|nutzertest|persona|zielgruppe' docs README.md → 0 Treffer (nur Review-Skripte ausgenommen)

- Prüfung Code: Kein Doc nennt Nutzer, Feedback oder Tests (0 grep-Treffer in allen 15 .md). MIT-Lizenz und README-Link sind vom Upstream (m-hertig) geerbt und belegen kein Publikum. Mit dem Interview (Kim, Familie, Freunde ohne Einführung) ist die Frage Einsteiger-Führung vs. Experten-Dichte faktisch entschieden; sie fehlt nur noch in den Docs.
- Prüfung Wirkung: Die Docs nennen nur «ich»; das Interview vom 02.10.2026 schliesst die Lücke: Kim, Familie und Freunde ohne Einführung, keine Fremden – MIT-Lizenz und öffentlicher Link sind kein Hinweis auf ein Publikum. Entschieden ist damit, dass Einsteiger-Führung Vorrang hat (30-s-Kriterium). Offen bleibt nur, Zielgruppe und Erfolgskriterium in die Docs zu schreiben, weil die Ich-Job-Story bisher zu Entscheiden geführt hat, die Kims Vorwissen voraussetzen.

#### [mittel] 6 Lücke: Fähigkeiten, Werkzeug und Zeitbudget der Zielgruppe nicht definiert («Niveau», «Laie», «Einsteiger»)

*Phase 1: hoch → nach Prüfung mittel.*

Niveau 1–3, «Laie», «Einsteiger», «Fortgeschrittene», «ohne Spezialwerkzeug» kommen vor, aber kein Doc sagt, was ein Nutzer auf Niveau 1 kann oder besitzt (Akkuschrauber? Taschenloch-Lehre? Werkbank?). Die Gruppe Niveau ist ausgeblendet, die Punkte stehen weiter auf den Karten. Für UX-Entscheide (Erklärtiefe, Fachbegriffe wie Tablar, Wange, Exzenter, Kröpfung) fehlt diese Grundlage.

Beleg: shared.js:79-82; konfig.js:92-124; index.html:1116 (Niveau-Gruppe hidden); index.html:853 «Braucht eine Taschenloch-Bohrlehre.»; eingrenzung-bauweisen.md:26-30 Spalte «Für wen»; schreiner-review.md:163 «Ein Laie …»

- Prüfung Code: Niveau ist im Code definiert (Verbindung + Türen, sideboard.js:265; Tragsystem, reduit.js:799) und hat Klartext «Einsteiger/Einsteiger+/Etwas Übung» (index.html:1380), der aber nie sichtbar wird, weil #grp-niveau versteckt ist (index.html:1116); auf den Karten bleiben nur Punkte mit aria-label. Die Werkzeugliste ist pro Entwurf berechnet, nicht pro Nutzer angenommen. Was ein Niveau-1-Nutzer kann oder besitzt, definiert kein Doc.
- Prüfung Wirkung: Nicht die fehlende Definition in den Docs trifft die Nutzer, sondern ihre sichtbare Folge: Punkte ●●○ ohne Legende auf jeder der sechs standardmässig offenen Bauweise-Karten und kein Werkzeug-Hinweis auf der Karte (er steckt in der ausgeblendeten Verbindungs-Gruppe). Das Interview legt die Zielgruppe fest (Freunde ohne Einführung, also kein Vorwissen und kein Spezialwerkzeug voraussetzen); «Zeitbudget» ist für das Hobby-Projekt nebensächlich.

#### [mittel] 6 Lücke: Handy-Kontext unbestimmt – Betriebssystem/Browser, Homescreen/PWA, Offline-Anspruch

*Phase 1: hoch → nach Prüfung mittel.*

«Meist auf dem Handy» ist alles; OS und Browser (iOS Safari, Android Chrome) stehen nirgends, geprüft wurde nur per DevTools ≤ 920 px. Offline im Baumarkt ist Randfall, aber ein Service Worker ist ausgeschlossen; der Offline-Test lief nur über DevTools. Ob die App vom Homescreen geöffnet wird (Vollbild, Status-Bar, Safe Areas) ist nicht dokumentiert. Das entscheidet über Massnahmen aus /mobile-native.

Beleg: ansichten-design.md:11; :136 «Im Baumarkt ohne Netz: Listen und Haken kommen aus localStorage. Einkaufen darf nicht von three.js abhängen.»; :163 «Offline-Fähigkeit mit Service Worker» nicht im Umfang; plans/2026-09-26-ansichten.md:17 «Handy-Ansicht über DevTools mit ≤ 920 px Breite»; :1409 «DevTools → Network → Offline → neu laden»; index.html:1705 Hinweis «Die 3D-Vorschau braucht WebGL»

- Prüfung Code: Docs nennen weder OS noch Browser; geprüft wurde nur per DevTools ≤ 920 px und DevTools-Offline. Safe Areas sind im Code schon berücksichtigt (index.html:2, :100, :418, :434); Homescreen/Vollbild (manifest, apple-mobile-web-app-capable, theme-color) fehlt im Code und in den Docs. Offline-Abhängigkeiten sind three.js (index.html:966-967) und Google Fonts (:5-7). Testgerät iPhone Safari ist seit dem Interview gesetzt, steht aber in keinem Doc.
- Prüfung Wirkung: Betriebssystem und Browser sind seit dem Interview bestimmt (iPhone Safari), nur nicht dokumentiert. Homescreen/PWA kommt in keiner der vier Situationen vor, und Offline ist mit «localStorage reicht, kein Service Worker» ein bewusster Entscheid der Ansichten-Spec. Was für Kims Nutzer zählt: Die App wurde nur in DevTools geprüft, nie auf dem iPhone – Safari-Eigenheiten wie der Zoom beim Fokus auf 14-px-Zahlenfelder treffen genau den Schritt «ein Mass ändern» im 30-s-Moment.

### Nachträge der Skeptiker

- (Code) Hosting in Docs falsch: README.md:11 verlinkt https://m-hertig.github.io/diy-furniture/ (Upstream), specs/2026-09-25-reduit-design.md:29 und plans/2026-09-25-reduit.md:15 sagen «GitHub Pages»; tatsächlich läuft die App als Cloudflare-Assets auf diy.hallo.kim (wrangler.jsonc:4-8). Ein Freund, der dem README folgt, landet auf der fremden Instanz.

- (Code) Offline-Randfall aus dem Plan nicht umgesetzt: plans/2026-09-26-ansichten.md:1409 verlangt bei fehlendem window.THREE die Meldung «braucht eine Internetverbindung». Der Code wirft bei fehlender Lib Error('lib') (index.html:1645) und zeigt im catch «Die 3D-Vorschau braucht WebGL» (index.html:1705) – im Baumarkt ohne Netz also eine irreführende Meldung.

- (Code) Spec nennt drei Situationen (ansichten-design.md:13) und führt «Konfiguration in der URL oder ein Teilen-Link» unter «Nicht im Umfang» (ansichten-design.md:162); der Teilen-Link ist inzwischen gebaut (Commits b60b5b8 #12, e5f3fa4 #13, test/link.test.js). Die vierte Situation «unterwegs entwerfen und Link teilen» aus dem Interview steht in keinem Doc, die Spec ist veraltet.

- (Code) Niveau-Klartext existiert, ist aber tot: renderSummary schreibt «Einsteiger / Einsteiger+ / Etwas Übung» plus Begründung in #levelBox (index.html:1380, 1397), die Gruppe #grp-niveau wird aber in syncVisibility immer versteckt (index.html:1116). Die drei Punkte auf den Karten sind damit das einzige sichtbare Niveau-Signal, Bedeutung nur im aria-label (index.html:853-856, 1240, 1252).

- (Code) WEITERARBEIT.md ist überholt: Zeile 10 sagt «Branch schreiner-review auf dem Fork (noch nicht in main)», aber #10 (01bc228) und #11 (a6da2da) sind in main gemergt; die Datei trägt Stand 01.10.2026 (WEITERARBEIT.md:1). Als Einstiegsdoku für ein anderes Gerät führt sie in die Irre.

- (Wirkung) Erstbesuch-Dialog steht quer zum 30-s-Kriterium: Die Spec entscheidet «Erster Besuch … öffnet die Auswahl ‹Was baust du?› ohne ‹Schliessen›» (ansichten-design.md:124) und sieht «Typen mit kleinem Bild; beim Typ ‹zuletzt: …›» vor (:72). Umgesetzt zeigt der Dialog beim ersten Besuch weder Bild noch Preis – «zuletzt … ca. CHF» erscheint nur, wenn !erst (index.html:2084-2088; Screenshot handy-moebeltyp-dialog.png ohne Bild). Ein Freund ohne geteilten Link muss also wählen, bevor er irgendein Möbel oder einen Preis sieht. Das Ansichten-Konzept bleibt gesetzt; dieser Randfall-Entscheid widerspricht aber dem Kriterium «nach 30 s ein fertiges Beispielmöbel mit Preis». Mit Link entfällt der Dialog (index.html:2276-2277), dort passt es.

- (Wirkung) Gerätewechsel derselben Person ist in keinem Doc gedacht: Interview-Situation 1 (zu Hause am Desktop planen) und 2 (im Jumbo am Handy einkaufen) laufen auf zwei Geräten. Entwurf, Sammlung und Haken liegen pro Browser in localStorage (ansichten-design.md:19, :48, :136; WEITERARBEIT.md:107). Kein Doc beschreibt, wie der am Desktop geplante Entwurf aufs Handy kommt; der Link vom 02.10. ist der einzige Weg, war in der Spec ausgeschlossen (ansichten-design.md:162) und ist nirgends als «zweites Gerät» begründet. Trifft Kim bei jedem Projekt.

- (Wirkung) Leiste unten weicht von der Spec ab und läuft auf dem iPhone über: Spec :101 «schmale Zeile mit dem Preis und, wenn nötig, ‹Sammeln›»; umgesetzt stehen immer «Sammeln» und «Link» in der Zeile. Beim Reduit mit Kaufteile-Aufschlüsselung wird «Link» rechts abgeschnitten, nur «L» ist sichtbar (Screenshots handy-reduit-entwerfen.png, handy-reduit-bauen.png, 390 px). Jede Reduit-Sitzung am Handy; genau der «unfertig»-Eindruck bei Preis und Aktionen, den Kim nennt.

- (Wirkung) Bauen auf dem Handy ist für die Maus geschrieben: Der Hinweis «Fahr mit der Maus über eine Zeile, um das Teil in der 3D-Ansicht zu sehen» erscheint auch am Handy (Screenshots handy-bauen.png, handy-reduit-bauen.png), wo es weder Maus noch 3D in Bauen gibt (Spec :102: 3D nur in Entwerfen). Die Werkstatt-Situation (Handy/Tablet) hat damit keinen Weg, ein Teil in 3D zu finden; Spec :87 «Teile mit Position zum Beschriften» setzt stillschweigend den Desktop voraus.

- (Wirkung) Der Handy-Kopf ist in keiner Spec beschrieben: ansichten-design.md:113 definiert den Kopf nur für Desktop («in einer Zeile, etwa 60 px»). Auf 390 × 844 belegt er rund 40 % des ersten Bildschirms (Marke mit Untertitel, Typ-Knopf, Aussenmass, Teile, Platten mit «…» abgeschnitten, Total mit Aufschlüsselung), bevor die 3D beginnt, und der Preis steht doppelt – Kopf und Leiste, obwohl Spec :101 ihn nur in der Leiste verlangt. «Ein Mass ändern» liegt erst nach 3D und Zufall unter der Falz (Screenshot handy-entwerfen.png; Reihenfolge WEITERARBEIT.md:165). Kim nennt den Kopf ausdrücklich als Schmerzpunkt; Phase 1 hat nur die 3D-Höhe und den Zufall hinterfragt, nicht den Kopf.

### Ungeprüft (Phase 1, tief/info)

- **[hoch] 6 Lücke: Ablauf an der Zuschnitt-Theke nicht beschrieben – wer liest die Liste, in welcher Form** – Die Spec legt fest, dass Zuschnitt bei Jumbo bestellt wird und die Liste kopiert/geteilt werden kann. Offen ist, ob die Zuschnittliste am Handy dem Personal gezeigt, vorab geschickt oder gedruckt wird, ob Jumbo ein eigenes Formular/Format verlangt, und ob die Teile dort beschriftet werden. Davon hängt ab, wie Einkaufen gestaltet sein muss (Lesbarkeit für Dritte, Druck, Export). *(Beleg: ansichten-design.md:36 «Zuschnitt-Platten bestelle ich bei Jumbo als Zuschnitt, ihre Zuschnittliste und der Plattenplan gehören zu Einkaufen.»; :77 «Liste kopie)*

- **[hoch] 6 Lücke: Werkstatt-Situation nicht beschrieben – Gerät, Hände, Fortschritt im Bauablauf** – Bauen besteht aus Teile | Ablängplan | Bauablauf, der Unterreiter wird gemerkt. Nicht dokumentiert: Welches Gerät liegt in der Werkstatt (Handy, Tablet, Laptop, Ausdruck)? Werden Bauschritte abgehakt wie Einkaufszeilen? Wie werden Teile beschriftet (Klebeband, Etiketten)? Staub, Handschuhe, Abstand zum Bildschirm? Für Schriftgrössen, Tap-Ziele und Kontrast in Bauen fehlt diese Grundlage. *(Beleg: ansichten-design.md:84-87 «Bauen – Reiter: Teile | Ablängplan (nur bei ganzen Brettern) | Bauablauf … [ Teile mit Position zum Beschriften; Ablängplan; Bauablau)*

- **[hoch] 6 Lücke: Primäres Gerät fürs Entwerfen und Zweck der 3D-Ansicht** – «Meist auf dem Handy … zum Entwerfen auch am Desktop» lässt offen, wo die meisten Entwürfe entstehen. Die 3D-Ansicht hat viele Features (Raumwände, Explosionsansicht, Nischen-Umriss, klebend oben mit 38 % Höhe auf dem Handy), aber kein Doc sagt, welche Entscheidung sie dem Nutzer ermöglicht (Proportionen prüfen? Bauweise verstehen? Vorfreude?). Ohne das lässt sich nicht beurteilen, ob sie auf dem Handy so viel Platz … *(Beleg: ansichten-design.md:11; :102 «In Entwerfen bleiben 3D oben (klebend), Warnungen und das einklappbare Formular.»; ansichten-flow.md:20 «3D-Vorschau klebt oben (3)*

- **[hoch] 6 Lücke: Teilen – Empfänger und Zweck des Links unbekannt** – Link-Teilen wurde am 02.10. gebaut, entgegen der Spec. Es ist nicht dokumentiert, an wen der Link geht (Partnerin, Freund, Schreiner, zweites Gerät) und was der Empfänger damit tun soll (ansehen, ändern, einkaufen). Davon hängt ab, ob der Empfänger eine Lese-Ansicht, Erklärungen oder das volle Formular braucht und ob der Link in die Sammlung führen soll. *(Beleg: git b60b5b8 2026-10-02 «Beim Öffnen lädt er wie eine Variante aus der Sammlung (Regeln prüfen, Rückgängig)»; ansichten-design.md:162 (ausgeschlossen); index.htm)*

- **[hoch] 6 Lücke: Nutzungshäufigkeit und Lebenszyklus – einmaliges Projekt oder wiederkehrende Nutzung, Sammlung als Varianten vs. künftige Typen** – Die Sammlung wurde als Varianten eines Möbels definiert (keine Projekt-Summe), das Modell nennt aber «später weitere» Möbeltypen und die Randfälle unterscheiden ersten und wiederkehrenden Besuch. Nicht dokumentiert: Wie viele Möbel baut ein Nutzer, über welchen Zeitraum, kehrt er nach dem Bau zurück (z. B. zum Nachkaufen), und welche weiteren Typen sind gedacht? Das bestimmt, ob Sammlung/Startzustand/Onboarding … *(Beleg: ansichten-design.md:31 «Varianten eines Möbels bzw. mehrerer Ideen zum Vergleichen, kein Projekt.»; :47 «Möbeltyp: Sideboard, Reduit, später weitere.»; :124-125)*

- **[hoch] 6 Lücke: Kein Produktziel und kein Erfolgsmass auf Produktebene; Verhältnis zum Upstream ungeklärt** – Erfolgskriterien existieren nur pro Feature (Reduit, feste Formate). Was die App als Ganzes erreichen soll (ein gebautes Möbel? Zeit bis zur Einkaufsliste? Fehlkäufe vermeiden?) steht nirgends. Ebenso offen: ob Änderungen an m-hertig zurückfliessen sollen («Pull Request später, alles zusammen» nennt kein Ziel-Repo) oder diy.hallo.kim die eigenständige Linie ist – das beeinflusst, wie frei Name, Design und Sprache … *(Beleg: reduit-design.md:11-16 «Erfolgskriterien» (Feature); feste-formate-design.md:9-15 (Feature); WEITERARBEIT.md:38 «Pull Request später, alles zusammen.»; WEITERAR)*

- **[hoch] 6 Lücke: Akzeptable Preisabweichung und Rolle der Kosten im Entscheid** – Die Docs zeigen, dass Kosten eine zentrale Vergleichsgrösse sind (live auf Karten, in Kopf, Leiste, Sammlung), und dass sie systematisch zu tief liegen (Packungen, fehlende Beschläge, Schnittkosten). Nicht festgelegt ist, wie genau der Preis sein muss, damit der Nutzer ihm traut (Richtwert ±20 % oder Budget), und ob «Preis geschätzt» prominent gezeigt werden soll. *(Beleg: WEITERARBEIT.md:44 «Preis auf den Karten: live für die aktuellen Masse.»; :153 Kassenbon-Beispiel; :154-155; feste-formate-design.md:61 «Die Einkaufsliste zeigt)*

- **[hoch] 6 Lücke: Dark Mode, Barrierefreiheit und Publikum/Sprache sind nicht als Anforderungen festgehalten** – Dark Mode und die Schriftwahl stammen aus dem Upstream und wurden nie als Entscheid dokumentiert. ARIA-Attribute stehen im Code, eine Anforderung an Barrierefreiheit (Kontrast, Tastatur, Screenreader) gibt es in keinem Doc. README englisch, UI und Docs deutsch, Preise CHF/Jumbo – ob internationale Nutzer ein Ziel sind, ist offen. Für Theming, Tokens und Texte (Emil-Design-Eng, Pick-UI-Library) fehlt damit der Rahmen. *(Beleg: git show 566de76:index.html:22-45 (Dark-Mode-Tokens vom Upstream); index.html:642 aria-label «Niveau 1 von 3», :881 aria-live; README.md:1-37 englisch; plans/20)*

- **[mittel] 4 Doku-Stand: «Ansichten trennen» steht in WEITERARBEIT noch als offene Idee, obwohl am 26.09. entschieden und umgesetzt** – Der Abschnitt «Ideen (noch nicht entschieden)» führt «Ansichten trennen … vorgeschlagen am 25.09.2026, Entscheid offen», während die Spec vom 26.09. entscheidet und PR #8 es umsetzt. Wer nur WEITERARBEIT liest, könnte das Ansichten-Konzept für offen halten. *(Beleg: WEITERARBEIT.md:169 «Ansichten trennen (Entwerfen / Bauplan / Sammlung …): vorgeschlagen am 25.09.2026, Entscheid offen.»; ansichten-design.md:34 «Variante E, v)*

- **[mittel] 4 Doku-Stand: Link-Teilen (02.10.) fehlt in WEITERARBEIT und README; README zeigt auf Upstream-URL und kennt einkauf.js nicht** – WEITERARBEIT ist Stand 01.10.2026 und nennt das Link-Feature nicht. README (englisch) verweist weiterhin auf https://m-hertig.github.io/diy-furniture/, obwohl die eigene Instanz unter diy.hallo.kim läuft; die Dateiliste führt einkauf.js nicht und beschreibt konfig.js ohne Regeln und Bauweisen. Die Remotes heissen origin (m-hertig) und fork (kimneu), WEITERARBEIT empfiehlt einen Remote «upstream». *(Beleg: WEITERARBEIT.md:1 «Stand 01.10.2026»; grep «link|teilen|?plan» in WEITERARBEIT.md/README.md ohne Treffer zum Feature; README.md:11 «You can use it here: https:/)*

- **[info] 1 Nutzer: Die Job Story spricht in der Ich-Form – der dokumentierte Nutzer ist Kim selbst** – Beide Grundlagendokumente formulieren den Nutzer als «ich», der ein Möbel selber bauen will. Eine weitere Zielgruppe (Freunde, Öffentlichkeit, Einsteiger, Profis) wird nirgends benannt. Die Reduit-Spec sagt nur «Zuerst für ein konkretes Reduit gedacht, aber allgemein nutzbar gebaut.» Die einzige Fremdsicht liefert der Schreiner-Review mit dem «Laien»; das Bauweisen-Papier führt eine Spalte «Für wen» mit «Einsteiger, … *(Beleg: /home/kim/repo/diy-furniture/docs/superpowers/specs/2026-09-26-ansichten-design.md:9 «Wenn ich ein Möbel selber bauen will (Sideboard fürs Wohnzimmer oder Regal)*

- **[info] 1 Situationen: drei Situationen, aus denen die vier Orte folgen** – Die Ansichten-Spec leitet die Orte Entwerfen · Einkaufen · Bauen · Sammlung direkt aus drei Situationen ab: zu Hause entwerfen, im Baumarkt einkaufen, in der Werkstatt bauen. Der Baumarkt ist konkret Jumbo. Im Baumarkt wird Zuschnitt bestellt (Zuschnittliste und Plattenplan gehören zu Einkaufen), ganze Bretter längt der Nutzer selbst ab (Ablängplan gehört zu Bauen). Als Randfall ist «Im Baumarkt ohne Netz» … *(Beleg: ansichten-design.md:13 «Die Job Story hat drei Situationen: zu Hause entwerfen, im Baumarkt einkaufen, in der Werkstatt bauen. Die Orte folgen diesen Situatione)*

- **[info] 1 Geräte: Handy zuerst (auch im Baumarkt), Desktop zum Entwerfen; Zielmasse 920 px, 1280 × 700, 390 × 844** – Das Handy ist das Hauptgerät, der Desktop dient dem Entwerfen. Konkrete Masse: Handy ≤ 920 px (Leiste unten, jeder Ort eine Ansicht), Desktop ohne Scrollen ab 1200 × 640, Zielgerät 13″-MacBook mit Browserfenster 1280 × 700, Handy-Prüfung bei 390 × 844. OS, Browser, Homescreen-Installation oder Tablet werden nicht genannt. *(Beleg: ansichten-design.md:11 «Meist auf dem Handy (auch im Baumarkt), zum Entwerfen auch am Desktop.»; :99 «Handy (≤ 920 px)»; :35 «Auf einem MacBook (ab 1280 × 700 B)*

- **[info] 1 Kontexte im Produkt: Wohnzimmer, Badezimmer, kleiner Abstellraum, Mietwohnung/Gipskarton** – Das Produkt selbst kodiert Nutzungskontexte: Einsatzort «Wohnraum» / «Badezimmer» beim Sideboard, der Reduit als «Regal in einem kleinen Raum, eingebaut oder selbststehend», und die Bauweise R6 «zügelbar, gut für Mietwohnung und Gipskarton». Ein Doc, das diese Kontexte als Zielgruppen-Situationen beschreibt, gibt es nicht; sie stehen nur in Texten der Karten. *(Beleg: index.html:572-575 Einsatzort «Wohnraum» / «Badezimmer»; index.html:951 «Korpus mit Fächern, Türen und Füssen fürs Wohnzimmer»; :952 «Regal in einem kleinen Rau)*

- **[info] 1 Nutzer: «Niveau 1–3» ist das einzige Modell der Nutzerfähigkeiten – und nirgends definiert** – Verbindungen (Taschenloch 1, Verschraubt 1, Holzdübel 2, Exzenter 2) und Bauweisen tragen ein Niveau 1–3, angezeigt als drei Punkte. Seit den Bauweisen ist die Gruppe «Niveau» ausgeblendet; der Review wollte sie auf die Karte verlegen. Was Niveau 1, 2 oder 3 für den Nutzer bedeutet (Werkzeug, Erfahrung, Zeit), steht in keinem Doc. *(Beleg: shared.js:79-82 level 1/1/2/2; konfig.js:92-124 niveau:[1,2] … niveau:[2]; index.html:642-646 aria-label «Niveau 1 von 3»; index.html:1115-1116 «Verbindung, Bau)*

- **[info] 2 Explizite Bedürfnisse aus der Job Story: anpassen, Kosten sehen, Varianten vergleichen, Einkaufsliste, Plattenplan + Bauablauf, abhakbare Liste, Preis immer sichtbar** – Die Job Story nennt fünf Bedürfnisse: an Masse und Raum anpassen, Kosten sehen, Varianten vergleichen, Einkaufsliste für Jumbo, Plattenplan und Bauablauf für die Werkstatt. Der Prompt ergänzt die abhakbare Liste im Baumarkt (Platten/Zuschnitt, Kaufteile, Werkzeug). Die Spec legt fest, dass der Preis in jedem Ort sichtbar bleibt. *(Beleg: ansichten-design.md:9 «… an meine Masse und meinen Raum anpassen, die Kosten sehen und Varianten vergleichen können. Am Ende will ich mit einer Einkaufsliste in)*

- **[info] 2 Explizit (Reduit-Spec, Prompt): Varianten für dieselben Raummasse durchschalten; Live-Änderung ist am Desktop «der grösste Nutzen»** – Die Reduit-Spec definiert das Kernbedürfnis als Vergleich von Varianten bei gleichen Raummassen (Materialliste, Kosten, Aufwand) mit Erfolgskriterien: Raummasse einmal eingeben, Form und Bauart frei umschalten, pro Variante Materialliste, Plattenplan, Beschläge, Bauablauf, 3D, Kosten, sinnvolle Warnungen. Der Prompt begründet, warum Desktop-Entwerfen und Bauplan nicht getrennt werden: die Live-Änderung. *(Beleg: reduit-design.md:7 «Man soll für dieselben Raummasse verschiedene Varianten durchschalten und Materialliste, Kosten und Aufwand direkt vergleichen können.»; :13)*

- **[info] 2 Explizit (feste Formate): günstigste Kombination automatisch, Stückzahlen und Stückpreise sichtbar** – Der Konfigurator soll Formate und Stückzahlen selbst wählen («die günstigste Kombination»), zeigen, welches Teil aus welchem Brett kommt, und eine Einkaufsliste mit Stückpreisen ausgeben. Motiv: go/on Leimholz ≈ CHF 26/m² statt 59.95 im Zuschnitt. *(Beleg: docs/superpowers/specs/2026-09-25-feste-formate-design.md:7 «Der Konfigurator wählt Formate und Stückzahlen selbst, und zwar die günstigste Kombination. Er zeig)*

- **[info] 2 Explizit (Schreiner-Review): das Versprechen «macht Sinn und ist DIY zu machen» – Baubarkeit als Kernbedürfnis** – Der Review prüft die App gegen ein ausformuliertes Versprechen und findet es «teilweise eingelöst»; Ursache sei die freie Kombination jeder Stärke mit jeder Verbindung. Daraus folgte die Eingrenzung über Bauweisen. Für UX heisst das: Der Nutzer soll nicht konstruktiv entscheiden müssen, sondern «wie baue ich». *(Beleg: schreiner-review.md:3 «Hält die App ihr Versprechen ‹Konfiguriere ein Sideboard / einen Reduit-Ausbau, der Sinn macht und DIY zu machen ist›?»; :14 «Das Verspre)*

- **[info] 2 Implizit: Vertrauen in die Kosten – dokumentierte Abweichung zum Kassenbon, aber keine Zieltoleranz** – WEITERARBEIT belegt, dass die Rechnung pro Stück statt pro Packung deutlich unter dem Kassenbon liegt, und dass Sideboard-Beschläge, Verbindungsbeschläge und Oberfläche gar keine Preise haben. Der Review nennt Kostenvergleiche «Richtwerte». Welche Genauigkeit der Nutzer braucht, steht nirgends. *(Beleg: docs/WEITERARBEIT.md:153 «60 Schrauben 4 × 40: CHF 2.34 gerechnet, CHF 19.45 bezahlt»; :154 «Richtpreise für Sideboard-Beschläge (Scharniere, Schiebetürbeschlag)*

- **[info] 2 Implizit: Rückgängig statt Rückfrage, Haken überleben Änderungen, Warnungen blockieren nichts** – Die Randfälle der Spec legen ein Interaktionsmuster fest, das Nutzerbedürfnisse impliziert: kein Dialog beim Laden über ungespeicherte Änderungen, sondern «Rückgängig»; Haken hängen am Zeileninhalt und bleiben bei unveränderten Zeilen; Einkaufen/Bauen zeigen trotz Warnungen alles, mit Hinweis «n Warnungen · Zum Entwurf». Der Prompt hatte diese Punkte noch als offene Fragen gestellt. *(Beleg: ansichten-design.md:127 «Keine Rückfrage und kein automatisches Sichern. Die Meldung ‹X geladen · Rückgängig› …»; :129 «Es blockiert nichts»; :133 «Unveränderte)*

- **[info] 2 Implizit: Entwurf teilen – am 02.10.2026 umgesetzt, in der Spec ausgeschlossen, in keinem Doc begründet** – Die Ansichten-Spec führte «Konfiguration in der URL oder ein Teilen-Link» unter «Nicht im Umfang». Zwei PRs vom 02.10.2026 bauen genau das (Link mit ?plan=…, Knopf «Link teilen» / «Link»). Weder WEITERARBEIT (Stand 01.10.) noch README erwähnen es, und kein Doc sagt, wer den Link bekommen soll und wozu. *(Beleg: ansichten-design.md:162 «Konfiguration in der URL oder ein Teilen-Link.» (unter «Nicht im Umfang»); git b60b5b8 2026-10-02 «Entwürfe als Link teilen (#12)» – «D)*

- **[info] 2 Implizit: «Zufall» ist eine zentrale Funktion ohne dokumentiertes Nutzerbedürfnis** – Zufall würfelt eine Konfiguration ohne Warnungen, hat ein Schloss pro Gruppe, steht ganz oben im Formular und in der Möbelwahl. Kein Doc sagt, welches Bedürfnis er bedient (Inspiration, Preisvergleich, Test der Regeln). Beim Reduit bleibt der Raum stehen – das deutet auf «Varianten für meinen Raum» hin. *(Beleg: README.md:29 «the ‹Zufall› button (random configuration without warnings)»; ansichten-flow.md:29 «Zufall: würfelt eine Konfiguration ohne Warnungen; beim Reduit)*

- **[info] 2 Implizit: Teile beschriften, Zuschnitt an der Theke bestellen, Werkzeug abhakbar ohne Preis** – Die Spec sieht in Bauen «Teile mit Position zum Beschriften» vor; der Bauablauf rät, die Platten im Baumarkt zuschneiden zu lassen und nach Beschriftung zu fragen; Werkzeug steht ohne Preis, aber abhakbar in der Einkaufsliste. Das sind implizite Annahmen über den Ablauf, die nicht als Bedürfnisse begründet sind. *(Beleg: ansichten-design.md:87 «[ Teile mit Position zum Beschriften; Ablängplan; Bauablauf ]»; :36 «Zuschnitt-Platten bestelle ich bei Jumbo als Zuschnitt»; :155 «Werk)*

- **[info] 3 Entscheide 25.09.2026 (Reduit-Spec): zweiter Möbeltyp, kein Build, Sideboard unverändert, klare Umfangsgrenzen** – Entschieden: Reduit als zweiter Typ im selben Konfigurator; Vanilla ohne Build-Stufe; Snapshot-Test sichert, dass das Sideboard exakt gleich rechnet. Nicht im Umfang: frei positionierbare Tür, Tür an anderer Wand, Hindernisse (Sicherungskasten, Rohre, Dachschräge), mehrere Nischen, Tablare pro Wand verschieden, Türen/Fronten beim Reduit, Umbau auf ES-Module. *(Beleg: reduit-design.md:3 «Datum: 2026-09-25»; :16 «Das Sideboard verhält sich nach dem Umbau exakt gleich wie vorher.»; :20-25 «Nicht im Umfang»; :29 «Keine Build-Stu)*

- **[info] 3 Entscheide 25.09.2026 (feste Formate): nur ablängen, nur im Reduit, Tiefe rastet ein, 1D-Packer** – Vier Entscheide in Tabellenform: Bretter werden nur abgelängt (keine Längsschnitte); Brett-Materialien nur im Reduit, das Sideboard bleibt beim Zuschnitt; die Regaltiefe rastet auf die nächste Brettbreite ein, mit Hinweis; eigener 1D-Packer. Ausgeschlossen: Bretter beim Sideboard (auch gemischt), Verschnittoptimierung über Breiten. *(Beleg: feste-formate-design.md:19-24 Tabelle «Entscheide»: «Nur ablängen», «Nur im Reduit», «Rastet auf die nächste Brettbreite ein, mit Hinweis», «Eigener 1D-Packer p)*

- **[info] 3 Entscheide (WEITERARBEIT, 25.–28.09.2026): Materialfilter nach Optik verworfen, Maserung pro Bauteil verworfen, hintere Nische entfernt** – Zwei Ideen wurden ausdrücklich verworfen: Materialauswahl mit Optik-Filter («die nach Preis sortierte Liste reicht») und Maserung pro Bauteil. Am 28.09. wurde präzisiert, dass der Bauweisen-Filter aus der Konstruktion folgt und dieser frühere Entscheid die Optik betraf. Die hintere Nische wurde bewusst entfernt. *(Beleg: WEITERARBEIT.md:171 «Materialauswahl mit Filter … besprochen, vorerst verworfen – die nach Preis sortierte Liste reicht.»; :172 «Maserung pro Bauteil wählbar: v)*

- **[info] 3 Entscheide 26.09.2026 (Ansichten-Spec): Variante E, Sammlung = Varianten ohne Summe, Liste statt Nebeneinander, Möbelwahl im Kopf, drei Spalten, Zuschnitt je Material** – Sechs Entscheide in der Tabelle: Sammlung sind Varianten (keine Projekt-Summe, eingekauft wird für den geladenen Entwurf); Vergleich über sortierbare Liste, kein Nebeneinander; Möbelwahl «Was baust du?» im Kopf ohne Pflichtschritt, beim ersten Besuch als Leerzustand; vier Orte, Desktop behält Einkaufen/Bauen als Live-Reiter; Desktop drei Spalten ohne Scrollen; Zuschnitt zu Einkaufen, Ablängplan zu Bauen. Verworfen: … *(Beleg: ansichten-design.md:3 «Datum: 2026-09-26»; :29-36 Tabelle «Entscheide»; :38-43 «Verworfene Varianten»; :47-51 Modell (Möbeltyp, Entwurf einer pro Typ, Ergebnis,)*

- **[info] 3 Entscheide 28.09.2026 (Schreiner-Review, zwei Runden)** – Runde 1: Pfostenrahmen Variante A; Eingrenzung «Bauweisen vorne, Regeln dahinter»; Exzenter bei 15 mm warnen, nicht sperren. Runde 2: Eckfach ab 350 mm; Ecke Seiten höchstens 100 mm tiefer als hinten; neue Eingaben Türlage und Türhöhe (Standard 2000); Reduit-Standard Pfostenrahmen mit Sperrholz Fichte 18; Sideboard-Korpus ab 18 mm (Seekiefer nur Front/Reduit), Wangen und Module über 1,2 m ab 18 mm; Lack auf … *(Beleg: WEITERARBEIT.md:24-28 «Entschieden am 28.09.2026»; :30-38 «Entschieden am 28.09.2026 (zweite Runde)»; schreiner-review.md:240-248 «5. Entscheide bei dir» (Vorla)*

- **[info] 3 Entscheide 30.09. und 01.10.2026 (Bauweisen, Ständerraster) und daraus folgende Formularstruktur** – 30.09.: 6 Sideboard-Bauweisen (5 aus dem Review plus «Sperrholz zerlegbar») und 6 fürs Reduit; Leisten gesperrt, wenn Tablare vorne weiter frei liegen, als das Material trägt; Preis auf den Karten live; ältere Sammlungseinträge fragen beim Laden. 01.10.: Sperre S16 bleibt, kein Feld für Ständerraster. Formular seither: Sideboard «Zufall · Masse und Einsatzort · Bauweise · Aufbau · Front · Optik · Platten & Preise», … *(Beleg: WEITERARBEIT.md:40-45 «Entschieden am 30.09.2026»; :47-49 «Entschieden am 01.10.2026: Ständerraster bei Gipskarton: Die Sperre S16 bleibt.»; :165 Reihenfolge im)*

- **[info] 3 Entscheid: Layer Surface (visuelle Gestaltung) wurde ausdrücklich aufgeschoben – dort setzt das heutige Review an** – Die Ansichten-Spec beschränkt sich auf Ablauf und Orte und verschiebt die Gestaltung von Leiste und Sheet auf später. Damit ist Layer 5 (Interaction Flow) entschieden und dokumentiert, die Oberfläche selbst ist kein eingefrorener Entscheid. Die Bauweise-Karten haben einen privaten Entwurf als Referenz. *(Beleg: ansichten-design.md:5 «Nur Ablauf und Orte, keine Gestaltung. Code erst nach diesem Entscheid.»; :164 «Visuelle Gestaltung der Leiste und des Sheets (Layer Surf)*

- **[info] 4 Backlog Rechnung und Preise (WEITERARBEIT «Noch offen», 01.10.2026)** – Offen mit Beispielen: Stösse nach Brettpreis statt nach Stützen legen (CHF 40 Unterschied bei 5 Tablaren); Tiefe nach Seitenbegrenzung besser verteilen (400/200 statt 200/200); Notiz am Tablarstück nach Spec; Sideboard mit Brettern, Längsschnitte, Mood Eiche, go/on 3-Schicht Quelle; Kaufteile ohne Quelle (konsole300, winkel150, angle40, dowel6, Holzschrauben, doorstop); Packungen statt Stückpreise in Einkaufsliste … *(Beleg: WEITERARBEIT.md:144 «Stösse nach Brettpreis statt nach Stützen legen»; :146 «Tiefe nach der Seitenbegrenzung besser verteilen»; :147; :143 «Offen: Sideboard mit)*

- **[info] 4 Backlog aus «Nicht im Umfang» der Specs und «später weitere» Möbeltypen** – Potenzielle Erweiterungen, die bewusst ausgeklammert wurden: Reduit mit freier Tür, Hindernissen (Dachschräge, Rohre), mehreren Nischen, Tablaren pro Wand verschieden, Türen/Fronten beim Reduit; Bretter beim Sideboard, Längsschnitte, Verschnittoptimierung; Projekt-Einkaufsliste über mehrere Varianten, Nebeneinander-Vergleich, Offline mit Service Worker. Das Modell nennt «Möbeltyp: Sideboard, Reduit, später weitere». … *(Beleg: reduit-design.md:20-25; feste-formate-design.md:28-31; ansichten-design.md:160-163 «Einkaufsliste über mehrere Varianten oder Möbel (Sammlung als Projekt). Vari)*

- **[info] 4 Annahmen der Ansichten-Spec, die zur Prüfung markiert sind** – Drei Annahmen stehen mit «bitte beim Umsetzen prüfen»: Preis in Kopf und Leiste = Holz + Kaufteile mit Aufschlüsselung darunter; Werkzeug in der Einkaufsliste ohne Preis, abhakbar; Varianten zeigen die Kosten beim Speichern, nicht aktuelle Preise. Ob sie nach der Umsetzung geprüft wurden, ist nicht festgehalten. *(Beleg: ansichten-design.md:152-156 «Annahmen (bitte beim Umsetzen prüfen)»; WEITERARBEIT.md:114 «Gespeicherte Konfigurationen merken sich die Katalogwerte beim Speiche)*

- **[info] 5 Upstream m-hertig: 6 Commits am 24.09.2026, eine einzige index.html (1359 Zeilen), MIT-Lizenz** – Der Upstream lieferte am 24.09.2026 Initial commit, index.html und drei README-Anpassungen. Schon dort stammen: der Name «Martylko», der Untertitel «Masse eingeben – Zuschnitt, Beschläge und Bauablauf erhalten.», der localStorage-Key sideboard-werkbank-v2, die Farbtokens inkl. Dark Mode und die Schriften Familjen Grotesk / Figtree / IBM Plex Mono, die Sideboard-Rechnung (compute), Zuschnittliste, Plattenplan, … *(Beleg: git log: f57749e, 566de76 «add index.html» (1359 Zeilen), 526fa6f, be5b894, 5e1f728, b2c5406 – alle 2026-09-24, Autor m-hertig; LICENSE:3 «Copyright (c) 2026 m-)*

- **[info] 5 Kims Zusatz: 111 Commits ab 25.09.2026; Upstream steht seit dem Fork still** – Autoren: kimneu 75, Claude 23, Kim Schläpfer 13 (Merges), m-hertig 6. origin/main steht auf b2c5406, also hat sich der Upstream seit dem Fork nicht bewegt. Kims Linie: Reduit (Spec 3464f78 bis b4c1168, 25.09.), Jumbo-Preise und preise.js (c8fb623, c36fe9a), Deploy diy.hallo.kim via Cloudflare (ee7ce3a), Sammlung und Zufall (330760a), Handy-Oberfläche (67911b9), feste Formate (PR #5), Formular/Möbeltyp im Kopf (PR … *(Beleg: git shortlog -sn --all: kimneu 75, Claude 23, Kim Schläpfer 13, m-hertig 6; git log origin/main: HEAD = b2c5406 2026-09-24; git log 3464f78 2026-09-25 «docs: ad)*

- **[info] 5 Sprache: README und Upstream englisch, alles von Kim Deutsch (Schweiz), Preise nur CHF/Jumbo** – Die Nutzeroberfläche war schon im Upstream deutsch, README und Commit-Messages des Upstreams englisch. Kims Docs, Commits und der Plan schreiben Deutsch (Schweiz) vor. Preise und Produkte sind an jumbo.ch und CHF gebunden. Ob die App ein internationales (MIT, englisches README) oder ein Schweizer Publikum hat, ist nicht festgelegt. *(Beleg: README.md:1-37 (englisch); docs/superpowers/plans/2026-09-26-ansichten.md:18 «Texte auf Deutsch (Schweiz): ‹ss› statt ‹ß›, Anführungszeichen «…».»; index.html:4)*

### Offene Fragen aus dieser Linse

- Für wen ist Martylko gedacht: nur für dich, für Freunde und Bekannte, oder öffentlich (MIT-Lizenz, Link im README)? Hat ausser dir schon jemand damit etwas geplant oder gebaut, und was hast du dabei beobachtet?

- Was bedeutet «Niveau 1/2/3» konkret für die Zielperson (Werkzeug wie Akkuschrauber, Taschenloch-Lehre, Forstnerbohrer; Erfahrung; Zeit)? Soll der Nutzer sein Niveau wählen, oder genügt die Anzeige auf der Bauweise-Karte?

- Welches Handy und welchen Browser nutzt du (iOS Safari, Android Chrome)? Öffnest du die App vom Homescreen? Soll sie im Baumarkt ohne Netz vollständig funktionieren (Service Worker), oder reicht localStorage?

- Wie läuft der Einkauf bei Jumbo ab: Zeigst du die Zuschnittliste am Handy an der Theke, schickst du sie vorab, druckst du sie? Verlangt Jumbo ein eigenes Format, und lassen sie die Teile beschriften?

- In der Werkstatt: Handy, Tablet, Laptop oder Ausdruck? Willst du Bauschritte abhaken wie Einkaufszeilen? Wie beschriftest du Teile?

- Wo entstehen die meisten Entwürfe – am Desktop (drei Spalten) oder am Handy? Welche Entscheidung triffst du mit der 3D-Ansicht, und verdient sie auf dem Handy 38 % der Höhe?

- Link teilen (02.10.): An wen schickst du den Link und wozu (Meinung einholen, Schreiner prüfen lassen, zweites Gerät)? Soll der Empfänger ändern können oder nur ansehen? Soll das in WEITERARBEIT nachgeführt werden?

- Wozu nutzt du «Zufall» (Inspiration, Preisvergleich, Regeltest)? Ist er für fremde Nutzer gedacht, und gehört er weiterhin ganz oben ins Formular?

- Wie genau müssen die Kosten sein, damit du ihnen traust (Richtwert ±20 % oder Budget auf CHF 10)? Sollen Packungen aufgerundet und «geschätzt» sichtbar hervorgehoben werden?

- Ist die Sammlung für dich Varianten eines Möbels oder ein Projekt (dein Reduit und dein Sideboard zusammen)? Welche «weiteren Möbeltypen» sind gedacht, und wie oft kehrst du nach einem gebauten Möbel zurück?

- Zielt die App auf die Schweiz und Jumbo allein, oder soll sie international nutzbar sein (englisches README)? Ist der Dark Mode gewollt, und gibt es Anforderungen an Barrierefreiheit?

- Soll etwas an den Upstream m-hertig zurückfliessen (Name, Design, Struktur dann eher bewahren), oder ist diy.hallo.kim die eigenständige Linie? Darf README auf diy.hallo.kim zeigen und die veraltete Idee «Ansichten trennen» in WEITERARBEIT als erledigt markiert werden?

## Screenshots (Ist-Zustand)

Bilder unter docs/review/bilder/2026-10-02/.

**Kurzfassung (Phase 1):** 15 Screenshots der laufenden App (Sideboard und Reduit, hell und dunkel, Handy 390×844, Desktop 1440×900 und 1024×768) liegen unter /tmp/claude-1000/-home-kim-repo-diy-furniture/1b146d0f-c1df-41c5-bb8d-2d55ea1fa3f6/scratchpad/shots/: handy-entwerfen.png, handy-entwerfen-voll.png, handy-einkaufen.png, handy-bauen.png, handy-sammlung.png, handy-moebeltyp-dialog.png, handy-reduit-entwerfen.png, handy-reduit-bauen.png, handy-entwerfen-dunkel.png, handy-moebeltyp-dialog-dunkel.png, desktop-entwerfen.png, desktop-einkaufen.png, desktop-bauen.png, desktop-sammlung.png, desktop-klein-entwerfen.png (alle Masse per PNG-Header geprüft). Wichtigster Bildbefund: Beim Reduit läuft das Handy-Layout horizontal über (Kopfkennzahlen «Teile» ausserhalb des Bildschirms, Dokumentbreite 441 statt 390 px, «Link»-Button in der unteren Leiste abgeschnitten); Ursache sind nowrap-Werte in 1fr-Spalten (index.html:82, :459) und ein fehlendes min-width:0 am Preisblock der Leiste (index.html:436, :442-443, :957). Auf dem Handy belegen Kopf plus 3D-Vorschau den ganzen ersten Bildschirm, das Formular beginnt erst bei y≈880; die Sammlung ist im Leerzustand eine fast leere Seite mit drei gleichwertigen Einstiegen. Konsole: kein JS-Fehler, nur favicon.ico 404 und WebGL-Treiberwarnungen des Headless-Browsers. Einschränkung: Die Handy-Aufnahmen entstanden mit Desktop-Chromium (pointer:fine, hover:hover, DPR 1), darum sind die Touch-Regeln aus index.html:403-415 (44-px-Mindesthöhen, «Tipp auf eine Zeile») in den Bildern nicht aktiv; echte Geräte zeigen dort grössere Bedienelemente.

### Geprüft

#### [hoch] handy-entwerfen.png

*Phase 1: mittel → nach Prüfung hoch.*

Ort #entwerfen, Sideboard, 390×844. Oberhalb des Falzes: Logo, h1 «Martylko», Untertitel, Button «Sideboard ▾», Kennzahlenraster (Aussenmass 1200 × 720 × 419 mm, Teile 10, Platten «1 × Sperrholz Birke Premium 18 mm + 1 …» mit Ellipse abgeschnitten, Total ca. CHF 245 mit Zeile «Holz Zuschnitt CHF 245 · ganze Platten CHF 475»), dann 3D-Karte (y 339-678) mit Masstafel oben rechts und drei 40×40-Icon-Buttons unten; der erste Bedienknopf «Zufall» ragt unter die fixe Leiste und ist nur halb sichtbar. Untere Leiste 106 px hoch (y 738-844): Preis «CHF 245 / Holz Zuschnitt · 10 Teile», Buttons «Sammeln» (87×36) und «Link» (55×36), Navigation Entwerfen/Einkaufen/Bauen/Sammlung (je 87×44). Der Kopf belegt 305 px, das erste Eingabefeld «Breite» liegt bei y 880, also einen ganzen Bildschirm tiefer. Weil die 3D-Vorschau sticky ist (339 px) und die Leiste fix (106 px), bleiben rechnerisch rund 400 px Höhe fürs Formular beim Scrollen. Auffällig: Eingabe «Tiefe 400» vs. Kopf «419 mm» (Türen aufliegend, laut Hinweistext unter den Massen) – zwei Zahlen für «Tiefe» gleichzeitig sichtbar.

Beleg: bilder/2026-10-02/handy-entwerfen.png; Boxen aus Accessibility-Snapshot (banner 16,14,358,305; region 3D-Vorschau 0,339,390,339; Leiste 0,738,390,106; spinbutton Breite 261,881); index.html:419 (.viewer position:sticky), index.html:420 (#stage height:38svh), index.html:418 (padding-bottom 140px), index.html:434 (.mbar fixed)

- Prüfung Code: Alle Boxen und die Rechnung stimmen. Der Knopf «Zufall» (#bZufall, index.html:548) wird beim Laden nicht halb, sondern zu rund einem Viertel (9 von 36 px) von der fixen Leiste verdeckt. Die zwei Tiefen-Zahlen sind beabsichtigt (Dtot = Tiefe + aufliegende Türen, index.html:1388, Hinweis :570), bleiben aber ohne Erklärung im Kopf nebeneinander sichtbar.
- Prüfung Wirkung: Der erste Teil des 30-s-Kriteriums (Beispielmöbel mit Preis sehen) ist auf dem ersten Bildschirm erfüllt: 3D-Sideboard und «CHF 245» sind sichtbar. Der zweite Teil (ein Mass ändern) scheitert am Aufbau: Kopf mit Kennzahlen (305 px, Preis dort und nochmals in der Leiste) plus klebende 3D-Vorschau schieben das Formular unter den Falz, der einzige sichtbare Hinweis auf ein Formular ist der halb verdeckte Knopf «Zufall». «Tiefe 400» im Feld gegen «419 mm» im Kopf bleibt eine echte, aber zweitrangige Irritation.

#### [hoch] handy-reduit-entwerfen.png

Ort #entwerfen Reduit (Standardwerte Raum 1600 × 1400 × 2400), 390×844. Horizontaler Überlauf: Dokumentbreite 441 px bei 390 px Viewport. Kopf: «Raum 1600 × 1400 × 2400 mm» (dd 377 px breit, nowrap) sprengt die erste 1fr-Spalte, «Teile 26» liegt bei x 409-441 ausserhalb des Bildschirms und ist im Bild nicht zu sehen; Zeile «Holz Zuschnitt CHF 500 · Kaufteile CHF 170 · ganze Platten CHF 410» abgeschnitten. Untere Leiste: Preisblock 247 px breit («Holz Zuschnitt CHF 500 · Kaufteile CHF 170» wird nicht gekürzt), «Sammeln» rutscht auf x 275, «Link» auf x 370-425 → nur «L» sichtbar. Ursache gemessen: .mprice > div hat min-width:auto; die Regel .mbar > div:first-child{min-width:0} trifft .mprice selbst, nicht den Preisblock, darum wirkt die Ellipse von #mMeta nicht. 3D zeigt U-förmiges Reduit mit zwei Icon-Buttons (ohne Türen/Explosion). Unter der 3D-Karte zwei Warnboxen schon in der Startkonfiguration: «Spannweite hinten, links und rechts ≥ 800 mm – zusätzliche Schienen eingeplant.» und «Teil A (Tablar, 1594 × 386 mm) passt nicht auf die Platte 1500 × 3000 mm. Grösseres Plattenformat eintragen oder Maserung freigeben.» Gruppe «Raum» hat kein Schloss; Label «Stärke mm» wird zu «Stärkemm».

Beleg: bilder/2026-10-02/handy-reduit-entwerfen.png; evaluate: scrollW 441, Boxen Teile 409,148,32; Platten 16,197,425; .mprice>div 16,747,247; Link 370,750,55; getComputedStyle(.mprice > div).minWidth = "auto", .mprice minWidth "0px"; index.html:82 (.summary dd white-space:nowrap), index.html:459 (.summary grid-template-columns:1fr 1fr in @media max-width:640px), index.html:436 (.mprice display:flex), index.html:442-443 (.mbar > div:first-child{min-width:0}; #mMeta ellipsis), index.html:957 (<div class="mprice"><div><b id="mPrice">…)

- Prüfung Code: Horizontaler Überlauf am Handy beim Reduit bestätigt (scrollWidth 434 px auch mit echten Startwerten). Ursache Kopf: die nowrap-Preiszeile im .price-dd («Holz Zuschnitt … · Kaufteile … · ganze Platten …», index.html:1391) sprengt die erste 1fr-Spalte auf 370 px; Raum-dd ist nur Mitläufer. Ursache Leiste: .mprice > div ohne min-width:0 (index.html:442 trifft .mprice, nicht den Preisblock). Die zwei Warnungen im Bild stammen aus einem gespeicherten Entwurf (Birke + Wandschienen), nicht aus der Startkonfiguration (R2 Fichte, 0 Warnungen). 3D zeigt drei Knöpfe (Explosion, Vorderwand aus, Zurücksetzen), nur «Türen» fehlt. «Stärkemm» gilt für den Textinhalt (Screenreader/Snapshot), visuell 4 px Abstand. Fehlendes Schloss bei «Raum» ist Absicht, da der Raum nie gewürfelt wird.
- Prüfung Wirkung: Beim Reduit läuft das Handy-Layout horizontal über (Dokument 441 statt 390 px): «Teile» im Kopf ist ausserhalb des Bildschirms, die Preiszeile ist abgeschnitten, in der Leiste bleibt von «Link» nur «L». Das passiert in jeder Reduit-Sitzung auf dem Handy und unabhängig von der Bauweise. Die zwei Warnboxen im Bild stammen aus einem gespeicherten Entwurf (Birke + Wandschienen), nicht aus der Startkonfiguration – die entschiedene Startkonfiguration (Pfostenrahmen, Sperrholz Fichte 18) hat keine Warnung.

#### [tief] handy-moebeltyp-dialog.png

*Phase 1: mittel → nach Prüfung tief.*

Dialog «Was baust du?» nach Klick auf #bKind, 390×844, über #sammlung. Zwei Karten: «Sideboard – Korpus mit Fächern, Türen und Füssen fürs Wohnzimmer – zuletzt: 1200 × 720 × 419 mm · ca. CHF 245» (markiert) und «Reduit – Regal in einem kleinen Raum, eingebaut oder selbststehend – zuletzt: 1600 × 1400 × 2400 mm · ca. CHF 675»; neben jeder Karte ein Text-Button «Zufall» mit nur 39×23 px Trefferfläche (deutlich unter 44 px, auch die Touch-Regeln in index.html:403-415 setzen hier keine Mindesthöhe). Button «Schliessen» (316×36) unten. Nach Wahl «Reduit» bleibt die URL bei #sammlung; der Wechsel nach #entwerfen passiert nicht automatisch.

Beleg: bilder/2026-10-02/handy-moebeltyp-dialog.png; Snapshot: button "Zufall" [box=314,339,39,23]; index.html:63-72 (.wahl/.wahllist/.wahlbtn); Klick auf Reduit → Page URL http://127.0.0.1:8765/#sammlung

- Prüfung Code: Befund stimmt. Ergänzung: Das Bild zeigt den Wiederbesuch. Beim Erstbesuch (kein Entwurf gespeichert, index.html:2265) fehlt «Schliessen» und Esc/cancel ist blockiert (index.html:2091, :2102) – der Dialog lässt sich nur durch eine Wahl verlassen.
- Prüfung Wirkung: Zwei kleine, aber echte Abweichungen: Nach der Typwahl bleibt man im aktuellen Ort statt in Entwerfen zu landen (Spec verlangt Entwerfen); aus der Sammlung heraus wirkt die Wahl darum folgenlos. Der Textknopf «Zufall» neben jeder Karte ist auf dem Handy klein und ohne Erklärung – ein Nebenpfad, der Freunde eher verwirrt als behindert.

#### [tief] desktop-sammlung.png

*Phase 1: mittel → nach Prüfung tief.*

1440×900, #sammlung leer. Kopfzeile wie überall, darunter Überschrift «Sammlung» mit Button «Zum Entwurf» ganz rechts, Leertext, dann zwei je 696 px breite Buttons über die volle Breite: «Aktuellen Entwurf sammeln» (gefüllt) und nochmals «Zum Entwurf». Darunter ca. 650 px leere Fläche. Zusammen mit «Sammlung» (Textlink) und «In Sammlung» im Kopf gibt es vier Bedienelemente für «sammeln/zurück» auf einem leeren Bildschirm; die eigentliche Funktion (Varianten vergleichen) ist im Leerzustand nicht erahnbar.

Beleg: bilder/2026-10-02/desktop-sammlung.png; Snapshot: button "Aktuellen Entwurf sammeln" [box=20,199,696,36], button "Zum Entwurf" [box=724,199,696,36], button "Zum Entwurf" [box=1309,100,111,36], list [box=20,235,1400,651]; index.html:938, :944, :2137

- Prüfung Code: Im Leerzustand stehen fünf Bedienelemente für «sammeln/zurück» im Bild: «Sammlung» (Textlink auf die aktuelle Ansicht, index.html:520), «In Sammlung» (Kopf), «Zum Entwurf» (Toolbar :938) sowie «Aktuellen Entwurf sammeln» und nochmals «Zum Entwurf» (:944). Die 651 px leere Liste ergibt sich aus dem Vollhöhen-Layout ab 1200 px (index.html:111–112).
- Prüfung Wirkung: Der Leerzustand ist so entschieden und erklärt die Funktion im Text. Störend bleibt die Dopplung: «Zum Entwurf» zweimal (Toolbar und Leerzustand), dazu «Sammlung» und «In Sammlung» im Kopf – vier Bedienelemente für zwei Aktionen auf einer sonst leeren Seite, auf dem Desktop als zwei bildschirmbreite Knöpfe. Tritt nur bei leerer Sammlung auf.

#### [tief] desktop-klein-entwerfen.png

*Phase 1: mittel → nach Prüfung tief.*

1024×768 (Zwischenbreite, zwischen den Breakpoints 920 und 1200), #entwerfen Sideboard. Kopf zweizeilig: Logo, «Martylko» mit Untertitel, «Sideboard ▾» rechts; zweite Zeile Kennzahlen («Platten 1 × Sperrholz Birk…» gekürzt) plus Textlink «Sammlung», «In Sammlung» (zweizeilig, 101×57) und «Link teilen» (36 hoch). Zweispaltig: links Formular 340 px, rechts oben 3D 620×388 mit beschrifteten Buttons, darunter Reiter «Einkaufen | Bauen» ab y 616 und Segment «Teile | Bauablauf» ab y 675 – der Ergebnisinhalt beginnt unterhalb des Falzes (Viewport 768, Seite 1349 px hoch, Seite scrollt). Die Teiletabelle ist hier eine echte Spaltentabelle (Pos, Bauteil, Anz., Länge (Maserung), …, Hinweis) und ragt bis x 1051 über den 1024-px-Viewport hinaus; sie wird vom .tablewrap-Container gescrollt (kein Seitenüberlauf, scrollW 1024), ist aber nicht komplett sichtbar.

Beleg: bilder/2026-10-02/desktop-klein-entwerfen.png; evaluate: scrollH 1349, scrollW 1024, TABLE right 1051, TH "Hinweis" right 1051; Snapshot banner [box=20,14,984,172], region 3D-Vorschau [box=384,206,620,388], tablist [box=384,616,620,43]; index.html:925 (<div class="tablewrap"><table id="cutTable">), index.html:73/103/109 (Breakpoints 920 und 1200)

- Prüfung Code: Befund stimmt; Teiletabelle beginnt bei y 773 und damit knapp unter dem Falz (768), 48 von 666 px Tabellenbreite liegen ausserhalb des .tablewrap und sind nur per horizontalem Scroll im Container erreichbar.
- Prüfung Wirkung: Unter 1200 px scrollt die Seite laut Spec bewusst; neu ist nur, dass dieser Fall mit einem iPad quer in der Werkstatt zum Alltag wird: Teileliste erst nach Scrollen unter dem 3D, und die Spaltentabelle ist 27 px breiter als ihre Spalte, sodass «Hinweis» angeschnitten ist. Kleine Wirkung, weil Tablet Nebengerät ist.

### Nachträge der Skeptiker

- (Code) Erster Moment für Freunde: Beim Erstbesuch (kein gespeicherter Entwurf, index.html:2265 erstBesuch) öffnet «Was baust du?» ohne «Schliessen» (index.html:2091 `$('#wahlZu').hidden = erst`) und mit unterdrücktem Esc/cancel (index.html:2102). Der Dialog ist nur durch Typwahl oder Zufall verlassbar; Zufall dort setzt ohne Rückgängig (index.html:2111 `undo: !wahlErst`). Phase 1 hat nur den Wiederbesuch fotografiert.

- (Code) Die Preiszeile im Kopf (index.html:1391, `<small>` im .price-dd) erbt white-space:nowrap von .summary dd (index.html:82) und hat anders als .wide keine Ellipse (:84). Sie ist der eigentliche Treiber des Überlaufs bei 1fr-Spalten (<640 px) und wird bei jedem genügend langen Text (Reduit immer, Sideboard nur bei langen Materialnamen) zum Problem – Phase 1 hat den Raum-dd verdächtigt.

- (Code) .hacts hat eine feste Breite von 220 px (index.html:74). Dadurch bricht «In Sammlung» bei jeder Desktopbreite zweizeilig um (gemessen 101×57 bei 1024 und 1440 px, Nachbarn 36 px hoch) – Phase 1 hat das nur bei 1024 px als Zwischenbreiten-Effekt notiert.

- (Code) Auf #sammlung zeigt der Kopf-Textlink «Sammlung» (index.html:520, data-go="sammlung") auf die Ansicht, in der man schon ist, ohne Markierung als aktuell; am Desktop gibt es anders als in der Handy-Leiste (aria-current, index.html:1984) keinen Ortsindikator.

- (Code) Reduit-Startkonfiguration ist tatsächlich warnungsfrei (konfig.js:558 R2/posts/fichtesp, probe-model.cjs: 0 Warnungen; Browser frisch: warns=[]); die in Phase 1 als «Start» gezeigten Warnungen und das Material «Birke Premium» kamen aus localStorage (sideboard-werkbank-v2-entwuerfe) des Testprofils. Screenshots, die den Startzustand belegen sollen, brauchen ein leeres Profil.

- (Wirkung) Erster Moment beim Freund: Beim Erstbesuch öffnet sich sofort der modale Dialog «Was baust du?» (index.html:2277), bevor ein Möbel oder Preis klar sichtbar ist – die Spec sieht dafür «Typen mit kleinem Bild» vor (docs/superpowers/specs/2026-09-26-ansichten-design.md:72), umgesetzt sind reine Textkarten ohne Bild (index.html:951-952, handy-moebeltyp-dialog.png). Ein Freund ohne Einführung muss zwischen «Sideboard» und «Reduit» wählen, ohne eines gesehen zu haben; das kostet Sekunden des 30-s-Budgets.

- (Wirkung) «Wo anfangen»: Das erste Element im Formular ist nicht ein Mass, sondern der Knopf «Zufall» mit dem Hinweis «Mit dem Schloss bei einer Gruppe bleibt sie beim Würfeln, wie sie ist.» (index.html:545-550; handy-entwerfen-voll.png oben, desktop-entwerfen.png linke Spalte oben). Für einen Freund ist das Fachjargon vor der ersten Eingabe; die Reihenfolge ist in docs/WEITERARBEIT.md:165 nur als Ist-Stand notiert, nicht als Entscheid begründet.

- (Wirkung) Werkstatt am Handy: Im Ort «Bauen» ist die 3D-Vorschau ausgeblendet (.viewer liegt in .cfgwrap, index.html:524-525; versteckt durch index.html:392), der Hinweis über der Teileliste sagt aber «Tipp auf eine Zeile, um das Teil in 3D hervorzuheben.» (index.html:924, Touch-Variante). Auf dem Handy zeigt der Hinweis ins Leere, und wer beim Bauen sehen will, wo Teil «D Mittelwand» sitzt, muss nach Entwerfen wechseln, wo die Liste fehlt (handy-bauen.png, handy-reduit-bauen.png).

- (Wirkung) Baumarkt am Handy: Auf dem Ort «Einkaufen» stehen zwei Teilen-Knöpfe gleichzeitig auf dem Bildschirm – «Liste teilen» (Einkaufstext, #bTeilen) oben und «Link» (Entwurfs-URL, .js-link, index.html:957) in der Leiste – ohne erkennbaren Unterschied (handy-einkaufen.png, y ca. 242 und 768). Dazu bleibt «Sammeln» in jedem Ort sichtbar, obwohl die Spec die Leiste mit «Preis und, wenn nötig, ‹Sammeln›» beschreibt (ansichten-design.md, Abschnitt Handy); im Baumarkt braucht niemand Sammeln.

- (Wirkung) Kopf in Einkaufen, Bauen und Sammlung auf dem Handy: Nur die Kennzahlen werden ausgeblendet (index.html:395), Logo, Titel, Untertitel «Masse eingeben – Materialliste, Plattenplan und Bauablauf erhalten.», Typ-Knopf und Trennlinie bleiben – rund 190 px, also knapp ein Viertel des Bildschirms, bevor die Einkaufsliste oder Teileliste beginnt (handy-einkaufen.png, handy-bauen.png: Inhalt ab y ca. 190). Im Baumarkt und in der Werkstatt ist das Werbetext statt Inhalt; Phase 1 hat den Kopf nur für Entwerfen bemessen.

### Ungeprüft (Phase 1, tief/info)

- **[mittel] handy-reduit-bauen.png** – Ort #bauen Reduit, 390×844. Oben gelbe Box «2 Warnungen · Zum Entwurf» (Link-Button 81×20 px, kleine Trefferfläche), Segment «Teile | Bauablauf», Hinweistext, Karten-Tabelle: «Sperrholz Birke Premium 18 mm 15 Teile» mit Zeilen A/B/C Tablar (A 1594 × 386 5×, B 550 × 286 3×, C 997 × 286 7×, je «liegt auf Konsolen vor der Schiene, von unten verschraubt»), Zeile A ist blau hinterlegt (Hervorhebung), dann «Massivholz … *(Beleg: bilder/2026-10-02/handy-reduit-bauen.png; index.html:1366 (`${R.warn.length} Warnung… · <button class="linkbtn" data-go="entwerfen">Zum Entwurf</button>`); Snap)*

- **[tief] handy-entwerfen-voll.png** – Ganze Seite #entwerfen Sideboard, 390×3010 px (≈3,6 Bildschirme). Reihenfolge: Kopf, 3D, Karte «Zufall» mit Hinweis zum Schloss, Gruppe «Masse» (Breite/Höhe/Tiefe je Zahlenfeld + Slider, Hinweistext, Segment «Einsatzort» Wohnraum/Badezimmer), Gruppe «Bauweise» (Erklärtext, 6 Karten; gewählte Karte «Sperrholz geölt» aufgeklappt mit Material/Stärke/Verbindung/Rückwand/Oberfläche, die anderen kompakt mit Preis; Hinweis … *(Beleg: bilder/2026-10-02/handy-entwerfen-voll.png; Snapshot: generic "Niveau 2 von 3" [box=307,1331,30,8]; combobox "Plattenmaterialgünstigste zuerst"; index.html:430 )*

- **[tief] handy-einkaufen.png** – Ort #einkaufen Sideboard, 390×844. Kopf ohne Kennzahlen (nur Marke + «Sideboard ▾»), Trennlinie, Zeile «Sideboard 1200 × 720 × 419 mm · ca. CHF 245», gefüllter Button «Liste teilen» (mit verstecktem «✓ Kopiert»-Zustand), Karte «Sperrholz Birke Premium 18 mm · Zuschnitt / 1 Platte 1500 × 3000 mm» mit 6 Checkbox-Zeilen (Mass · Position, darunter Maserung/Hinweis). Seitenlänge 2361 px; weitere Karten MDF, Beschläge & … *(Beleg: bilder/2026-10-02/handy-einkaufen.png; index.html:907 (<summary>Plattenplan für den Zuschnitt</summary>); DOM: <li><label><input type="checkbox" data-id=…><span)*

- **[tief] handy-bauen.png** – Ort #bauen Sideboard, 390×844. Segment «Teile | Bauablauf» (Teile aktiv), Hinweistext, Teiletabelle als Karten (Container-Query): Gruppenkopf «Sperrholz Birke Premium 18 mm 9 Teile», Zeilen A Seite 2× 542 × 397 18 mm …, bis G Tür; zweiter Gruppenkopf «MDF weiss 3 mm 1 Teile» (grammatisch «1 Teile»), Fuss «Plattenfläche total 3.35 m²». Im Accessibility-Baum fehlt der Trenner zwischen Material und Anzahl («Sperrholz … *(Beleg: bilder/2026-10-02/handy-bauen.png; index.html:924 (span.hint-fine / span.hint-touch), index.html:403-405 (@media (hover:none),(pointer:coarse) .hint-fine{displa)*

- **[tief] handy-sammlung.png** – Ort #sammlung, leer, 390×844. Überschrift «Sammlung» mit Button «Zum Entwurf» rechts, Text «Noch keine Varianten. Sammle den aktuellen Entwurf, um ihn später mit anderen zu vergleichen.», darunter zwei Buttons nebeneinander: «Aktuellen Entwurf sammeln» (gefüllt, umbricht auf zwei Zeilen, 175×57) und nochmals «Zum Entwurf» (175×36) – ungleiche Höhen, versetzt. Danach ca. 390 px leere Fläche bis zur Leiste. Drei … *(Beleg: bilder/2026-10-02/handy-sammlung.png; index.html:938 (toolbar «Zum Entwurf»), index.html:944 (#collLeer «Aktuellen Entwurf sammeln» + «Zum Entwurf»), index.html)*

- **[tief] handy-entwerfen-dunkel.png** – Ort #entwerfen Sideboard mit prefers-color-scheme: dark, 390×844. Dunkles Thema greift durchgängig: Seitenhintergrund rgb(19,26,28), Kopf, 3D-Karte (dunkler Canvas-Hintergrund, Holz bleibt hell), Icon-Buttons, Leiste und Navigation sind angepasst, Akzentfarbe hellblau, Text gut lesbar. Kein Problem im Bild erkennbar. Fehlend: <meta name="theme-color"> – der Browser-/Statusbalken passt sich bei Safari/PWA nicht an … *(Beleg: bilder/2026-10-02/handy-entwerfen-dunkel.png; evaluate: dark true, bodyBg rgb(19, 26, 28), themeColor undefined; index.html:1-4 (Meta-Tags), index.html:22 (@med)*

- **[tief] desktop-entwerfen.png** – 1440×900, #entwerfen Sideboard, Seite scrollt nicht (body overflow:hidden), drei Spalten: links Formular 300 px breit mit eigenem Scroll (Zufall, Masse mit Slidern, Einsatzort-Segment, Bauweise-Karten – die erste Karte wird unten abgeschnitten), Mitte 3D-Vorschau 532×784 mit beschrifteten Buttons «Türen öffnen», «Explosionsansicht», «Ansicht zurücksetzen» oben und Masstafel unten rechts (das Möbel füllt grob ein … *(Beleg: bilder/2026-10-02/desktop-entwerfen.png; evaluate scrollH 900; Snapshot: generic e53 [box=20,92,300,779], region 3D-Vorschau [box=338,92,532,784], tablist Ergeb)*

- **[tief] desktop-einkaufen.png** – 1440×900, Reiter «Einkaufen» im rechten Panel (URL wechselt auf #einkaufen). Oben Zeile «Sideboard 1200 × 720 × 419 mm · ca. CHF 245» mit gefülltem Button «Liste teilen» rechts; Karte «Sperrholz Birke Premium 18 mm · Zuschnitt / 1 Platte 1500 × 3000 mm» mit 6 Checkbox-Zeilen (56 px hoch, gestrichelte Trenner), Karte «MDF weiss 3 mm · Zuschnitt» (1 Zeile), Beginn «Beschläge & Kleinteile» («27 × Taschenlochschrauben … *(Beleg: bilder/2026-10-02/desktop-einkaufen.png; Snapshot tabpanel "Einkaufen" [box=888,157,532,729], group [ref=e387] [box=888,1949,532,39] "Plattenplan für den Zuschn)*

- **[tief] Accessibility-Snapshot #entwerfen (Handy)** – Landmarks: banner (Kopf), region «3D-Vorschau», navigation «Orte» (untere Leiste); auf Desktop zusätzlich tablist «Ergebnis» mit tabpanels «Einkaufen»/«Bauen». Kein main-Landmark – Formular und Ergebnis liegen in unbenannten generic-Containern. Überschriften: h1 «Martylko»; h2 «Masse», «Bauweise», «Aufbau», «Front», «Optik», «Platten & Preise» (jede h2 enthält einen Button mit aria-expanded sowie einen … *(Beleg: Snapshot der Seite http://127.0.0.1:8765/#entwerfen bei 390×844 (banner [ref=e3], region "3D-Vorschau" [ref=e32], navigation "Orte" [ref=e230]; text: "! ▾" / "!)*

- **[tief] Konsole (alle Navigationen)** – 6 Meldungen, kein JavaScript-Fehler. 2 Errors, beide favicon.ico: einmal «net::ERR_CONNECTION_REFUSED» (entstand, weil mein erster Server-Prozess beim Ende des Shell-Aufrufs beendet wurde – Umgebungsproblem, nicht die App), einmal «404 (File not found)» – im Repo liegt kein favicon.ico (Verzeichnislisting: docs/, einkauf.js, index.html, konfig.js, LICENSE, preise.js, README.md, reduit.js, shared.js, sideboard.js, … *(Beleg: browser_console_messages (all): "Total messages: 6 (Errors: 2, Warnings: 4)"; /home/kim/repo/diy-furniture/.playwright-mcp/console-2026-10-02T09-53-45-171Z.log;)*

- **[info] handy-moebeltyp-dialog-dunkel.png** – Dialog «Was baust du?» im dunklen Thema über #bauen Reduit, 390×844: Dialogfläche dunkelgrau, Karten abgesetzt, gewählte Karte «Reduit» mit hellblauem Rand, Backdrop abgedunkelt, Warnbox darunter in gedämpftem Braun. Konsistent zum hellen Dialog; kein Problem erkennbar. Trefferfläche «Zufall» bleibt 39×23 px (siehe heller Dialog). *(Beleg: bilder/2026-10-02/handy-moebeltyp-dialog-dunkel.png; index.html:64 (.wahl::backdrop), index.html:69 (.wahlbtn[aria-current]))*

- **[info] desktop-bauen.png** – 1440×900, #bauen, Reiter «Bauen» aktiv. Rechtes Panel: Segment «Teile | Bauablauf», Hinweis «Länge = Faserrichtung … Fahr mit der Maus über eine Zeile …» (auf Desktop korrekt), Teiletabelle als Karten (Container 532 px < 600 px → Kartenmodus statt Spaltentabelle, Spaltenköpfe ausgeblendet): A Seite 2× 542 × 397 18 mm … bis F Rückwand 1198 × 558 3 mm; Fuss «Plattenfläche total 3.35 m² · alle Masse in mm» am unteren … *(Beleg: bilder/2026-10-02/desktop-bauen.png; evaluate selectedTab "Bauen", hash #bauen; index.html:102 (.output container:ergebnis / inline-size), index.html:470-471 (@)*

- **[info] Methodik und Einschränkungen der Aufnahmen** – (1) Das Playwright-Screenshot-Werkzeug durfte nur nach /home/kim/repo/diy-furniture/.playwright-mcp schreiben (Fehlermeldung: «File access denied: … is outside allowed roots. Allowed roots: /home/kim/repo/diy-furniture/.playwright-mcp, /home/kim/repo/diy-furniture»); der Ordner ist git-ignoriert und existierte schon. Alle PNGs wurden sofort in den shots-Ordner verschoben; das Werkzeug legte dort zusätzlich … *(Beleg: Fehlertext des Screenshot-Tools; evaluate bei 390 px: pointerCoarse false, hoverNone false, hintFine "inline", hintTouch "none"; index.html:403-415; konfig.js:5)*

### Offene Fragen aus dieser Linse

- Soll die Reduit-Startkonfiguration (Raum 1600 × 1400 × 2400 mm, Tablar A 1594 × 386 mm) bewusst mit zwei Warnungen starten, oder soll der Standardentwurf warnungsfrei sein?

- Welches Gerät ist der Hauptfall: Handy im Baumarkt/in der Werkstatt (Einkaufen, Bauen) oder Desktop beim Planen (Entwerfen)? Davon hängt ab, wie viel Platz Kopfkennzahlen und 3D-Vorschau auf dem Handy belegen dürfen.

- Wird die Sammlung (Varianten vergleichen) tatsächlich gebraucht, oder genügt «Link teilen»? Drei bis vier gleichwertige Einstiege plus leere Seite sprechen für eine offene Entscheidung.

- Auf welchen echten Geräten/Browsern wird getestet (iPhone Safari, Android Chrome)? Die Touch-Regeln (hover:none/pointer:coarse) und theme-color lassen sich nur dort beurteilen.

- Was soll die Punkt-Anzeige «Niveau x von 3» bei den Bauweisen aussagen (Schwierigkeit? Werkzeugbedarf?) und soll sie für Einsteiger erklärt werden?

- Ist gewollt, dass «Tiefe 400» im Formular und «419 mm» im Kopf gleichzeitig sichtbar sind (Tiefe ohne vs. mit aufliegenden Türen)?
