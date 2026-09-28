# Prüfskripte zum Schreiner-Review (28.09.2026)

Node-Skripte, mit denen die Befunde in `../2026-09-28-befunde.md` belegt wurden. Sie laden die echten Module (`shared.js`, `sideboard.js`, `reduit.js`, `konfig.js`) relativ zum Repo und ändern nichts.

```sh
node docs/review/skripte/main_check.js     # Stichprobe der kritischen Befunde
node docs/review/skripte/EG_pen.js         # Überschneidungen Holz/Metall über viele Konfigurationen
```

Präfix = Prüfung, aus der das Skript stammt:

| Präfix | Prüfung |
|---|---|
| EG | Ecken-Geometrie |
| EP | Ecken-Schreinerpraxis |
| EU | Eck-Urteil |
| TR | Reduit-Tragwerk |
| RM | Reduit-Raum und Montage |
| SK | Sideboard-Korpus |
| SF | Sideboard-Fronten |
| MX | Material- und Beschlag-Matrix |
| DY | DIY-Machbarkeit und Anleitung |
| BW | Eingrenzung über Bauweisen (Prototyp `BAUWEISEN`) |
| RG | Eingrenzung über Regeln (Prototyp `REGELN`) |

`*-verify-*` sind die Skripte der Gegenprüfung, `*_lib.js` / `*-lib.js` gemeinsame Helfer. `SF-verify-pdf.js` las ein Blum-Datenblatt, das hier nicht mitgeliefert wird. Nach Korrekturen am Code zeigen die Skripte, ob ein Befund behoben ist; die Zahlen in den Befunden gelten für `main` @ `35cb9f3`.
