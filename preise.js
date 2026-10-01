/* Preise und Formate (Jumbo, CHF). Nachführen mit: cd tools && node jumbo-preise.mjs --schreiben
   Von Hand ändern geht auch – Form beibehalten (JSON, ein Eintrag pro Zeile), der Test prüft sie.
   platten:     prices = { Stärke: CHF/m² im Zuschnitt }, sheet = max. Zuschnitt [Länge = Maserung, Breite] in mm
   rueckwaende: price = CHF/m², sheet in mm
   bretter:     ganze Bretter (nur ablängen): t = Stärke, formate = [{ L = Länge, B = Breite in mm, price = CHF pro Stück }]
   kaufteile:   price = CHF pro Stück (unit m: pro Meter), est = geschätzt, noch nicht nachgeprüft
   stand = Datum der letzten Kontrolle, quelle = Jumbo-Produkt */
const PREISE = {
  "platten": {
    "birke": { "prices": { "12": 63.95, "18": 88.95, "21": 99.95 }, "sheet": [ 1500, 3000 ], "stand": "2026-09-25", "quelle": "Sperrholz Birke S/BB Premium" },
    "birkesi": { "prices": { "12": 49.95, "18": 59.95, "21": 69.95 }, "sheet": [ 1250, 2500 ], "stand": "2026-09-25", "quelle": "Sperrholz Birke SI/FI" },
    "eiche": { "prices": { "18": 109, "27": 149 }, "sheet": [ 2500, 1200 ], "stand": "2026-09-25", "quelle": "Leimholzplatte Eiche B/C, ungeölt" },
    "fichte": { "prices": { "18": 59.95, "21": 79.95, "27": 94.95 }, "sheet": [ 2500, 1210 ], "stand": "2026-09-25", "quelle": "Leimholzplatte Fichte B" },
    "seekiefer": { "prices": { "12": 36.95, "15": 47.95 }, "sheet": [ 2500, 1250 ], "stand": "2026-09-25", "quelle": "Sperrholz Seekiefer Premium" },
    "fichtesp": { "prices": { "12": 44.95, "15": 52.95, "18": 64.95, "21": 72.95, "24": 84.95 }, "sheet": [ 2500, 1250 ], "stand": "2026-09-25", "quelle": "Sperrholz Fichte II/III" },
    "mdf": { "prices": { "16": 34.95, "19": 38.95, "22": 39.95 }, "sheet": [ 2800, 2070 ], "stand": "2026-09-25", "quelle": "Oecoplan MDF" },
    "osb": { "prices": { "12": 19.95, "15": 24.95, "18": 29.95 }, "sheet": [ 2770, 2070 ], "stand": "2026-09-25", "quelle": "OSB 3 V100 PEFC" },
    "dreischicht": { "prices": { "19": 74.95, "27": 84.95 }, "sheet": [ 2500, 1250 ], "stand": "2026-09-25", "quelle": "Leimholzplatte 3-Schicht Fichte B/C" },
    "dekorspan": { "prices": { "16": 24.95, "19": 27.5 }, "sheet": [ 2800, 2070 ], "stand": "2026-09-25", "quelle": "Oecoplan Span weiss PE" }
  },
  "rueckwaende": {
    "hdf3": { "price": 12.95, "sheet": [ 2800, 2070 ], "stand": "2026-09-25", "quelle": "Oecoplan MDF Lack Line 1-seitig weiss 3 mm" },
    "hf3": { "price": 11.95, "sheet": [ 2820, 2070 ], "stand": "2026-09-25", "quelle": "Hartfaserplatte roh 3 mm" },
    "ply6": { "price": 23.95, "sheet": [ 2520, 1850 ], "stand": "2026-09-25", "quelle": "Oecoplan Sperrholz Pappel A/B 5 mm" }
  },
  "kaufteile": {
    "kant45": { "price": 4.4, "stand": "2026-09-25", "quelle": "Oecoplan Latte gehobelt 45x45 mm 2.5 m, CHF 10.95" },
    "latte": { "price": 1.2, "stand": "2026-09-25", "quelle": "Oecoplan Latte roh 24x48 mm 2 m, CHF 2.40" },
    "rail1000": { "price": 4.75, "stand": "2026-10-01", "quelle": "Element-System Wandschiene Weiss | 100 cm | 2 Stück, CHF 9.50" },
    "rail1500": { "price": 6.975, "stand": "2026-10-01", "quelle": "Element-System Wandschiene Weiss | 150 cm | 2 Stück, CHF 13.95" },
    "rail2000": { "price": 6.85, "stand": "2026-10-01", "quelle": "Element System Wandschiene Weiss | 200 cm | 2 Stück, CHF 13.70" },
    "konsole250": { "price": 1.8, "stand": "2026-10-01", "quelle": "Element-System Konsole Weiss | 25 cm, CHF 1.80" },
    "konsole300": { "price": 8, "est": true, "stand": "2026-09-25", "quelle": "Konsole 30 cm weiss" },
    "konsole350": { "price": 2.5, "stand": "2026-10-01", "quelle": "Element System Konsole Weiss | 35 cm | 60 kg, CHF 2.50" },
    "konsole400": { "price": 2.8, "stand": "2026-10-01", "quelle": "Element System Konsole Weiss | 40 cm, CHF 2.80" },
    "konsole470": { "price": 9.95, "stand": "2026-10-01", "quelle": "Element System U-Träger zu Wandschiene | 47 cm, CHF 9.95" },
    "winkel150": { "price": 3.5, "est": true, "stand": "2026-09-25", "quelle": "Blechkonsole weiss 150 x 200 mm RAL 9016" },
    "winkel200": { "price": 1.8, "stand": "2026-10-01", "quelle": "Blechkonsole Weiss | 20 × 25 cm | max. 10 kg, CHF 1.80" },
    "winkel250": { "price": 1.85, "stand": "2026-10-01", "quelle": "Coop Blechkonsole Weiss | 25 × 30 cm, CHF 1.85" },
    "shelfpin": { "price": 0.34, "stand": "2026-09-25", "quelle": "Hettich Steckbodenträger 20 Stück, CHF 6.75" },
    "angle40": { "price": 1, "est": true, "stand": "2026-09-25", "quelle": "Ayce Winkelverbinder 40 x 40 mm" },
    "dowel6": { "price": 0.2, "est": true, "stand": "2026-09-25", "quelle": "Fischer Dübel SX 6x30 S" },
    "dowel6x60": { "price": 0.3, "est": true, "stand": "2026-09-28", "quelle": "Fischer Dübel SX 6x30 mit Schraube 5 x 60 mm" },
    "hollow": { "price": 1.6, "stand": "2026-09-25", "quelle": "Fischer HM 5 x 52 S, 4 Stück CHF 6.30" },
    "screw3.5x10": { "price": 0.05, "est": true, "stand": "2026-09-28", "quelle": "Spax Senkkopf 3,5 x 10 mm" },
    "screw4x12": { "price": 0.05, "est": true, "stand": "2026-09-28", "quelle": "Spax Senkkopf 4 x 12 mm" },
    "screw4x16": { "price": 0.06, "est": true, "stand": "2026-09-28", "quelle": "Spax Senkkopf 4 x 16 mm" },
    "screw4x20": { "price": 0.06, "est": true, "stand": "2026-09-28", "quelle": "Spax Senkkopf 4 x 20 mm" },
    "screw4x25": { "price": 0.07, "est": true, "stand": "2026-09-28", "quelle": "Spax Senkkopf 4 x 25 mm" },
    "screw3.5x30": { "price": 0.07, "est": true, "stand": "2026-09-28", "quelle": "Spax Senkkopf 3,5 x 30 mm" },
    "screw4x35": { "price": 0.08, "est": true, "stand": "2026-09-25", "quelle": "Spax Senkkopf Torx 4 x 35 mm, 25 Stück" },
    "screw4x40": { "price": 0.039, "stand": "2026-10-01", "quelle": "Spax TRX Senkkopf-Holzschraube | 4 × 40 mm | 500 Stück, CHF 19.45" },
    "screw4x45": { "price": 0.1, "est": true, "stand": "2026-09-28", "quelle": "Spax Senkkopf 4 x 45 mm" },
    "screw5x60": { "price": 0.23, "stand": "2026-10-01", "quelle": "Spax TRX Senkkopf | 5 × 60 mm | 50 Stück, CHF 11.50" },
    "doorstop": { "price": 8, "est": true, "stand": "2026-09-28", "quelle": "Türstopper Boden, Edelstahl" },
    "tipguard": { "price": 22.5, "stand": "2026-09-25", "quelle": "Abus TV-Kippsicherung Isa, 2 Stück; eigentliches Möbel-Kippschutz-Set nicht im Sortiment" }
  },
  "bretter": {
    "gon_fichte": { "t": 18, "formate": [ { "L": 1200, "B": 200, "price": 5.6 }, { "L": 2000, "B": 200, "price": 10.2 }, { "L": 1200, "B": 400, "price": 12.5 }, { "L": 2000, "B": 400, "price": 20.5 } ], "stand": "2026-09-25", "quelle": "Go/on Leimholzplatte Fichte, Best Price" },
    "gon_3s": { "t": 19, "formate": [ { "L": 1200, "B": 600, "price": 29.95 }, { "L": 2500, "B": 600, "price": 59.9 } ], "stand": "2026-09-25", "quelle": "Go/on 3-Schicht Fichte C+/C, Best Price" },
    "mood_fichte": { "t": 18, "formate": [ { "L": 800, "B": 300, "price": 11.5 }, { "L": 800, "B": 400, "price": 15.5 }, { "L": 800, "B": 600, "price": 21.5 }, { "L": 1200, "B": 200, "price": 10.95 }, { "L": 1200, "B": 300, "price": 15.95 }, { "L": 1200, "B": 400, "price": 21.95 }, { "L": 1200, "B": 500, "price": 27.95 }, { "L": 1200, "B": 600, "price": 32.95 }, { "L": 2000, "B": 200, "price": 18.5 }, { "L": 2000, "B": 300, "price": 27.95 }, { "L": 2000, "B": 400, "price": 36.5 }, { "L": 2000, "B": 500, "price": 43.95 }, { "L": 2000, "B": 600, "price": 54.95 }, { "L": 2500, "B": 300, "price": 33.95 }, { "L": 2500, "B": 400, "price": 44.95 }, { "L": 2500, "B": 600, "price": 68.95 } ], "stand": "2026-09-25", "quelle": "Mood Leimholzplatte Fichte A" },
    "regalbau": { "t": 16, "formate": [ { "L": 1150, "B": 200, "price": 8.25 }, { "L": 1150, "B": 250, "price": 9.5 }, { "L": 1150, "B": 300, "price": 10.5 }, { "L": 1150, "B": 400, "price": 14.95 }, { "L": 1150, "B": 500, "price": 17.5 }, { "L": 1150, "B": 600, "price": 20.5 } ], "stand": "2026-09-25", "quelle": "Regalbauplatte weiss FSC 100%" },
    "schaltafel": { "t": 27, "formate": [ { "L": 2000, "B": 500, "price": 29.5 } ], "stand": "2026-09-25", "quelle": "Schalungstafel 3-S 27 x 2000 x 500 mm" },
    "moebel_weiss": { "t": 18, "formate": [ { "L": 2600, "B": 250, "price": 22.95 }, { "L": 2600, "B": 300, "price": 25.95 }, { "L": 2600, "B": 400, "price": 31.95 }, { "L": 2600, "B": 500, "price": 37.5 }, { "L": 2600, "B": 600, "price": 47.5 } ], "stand": "2026-09-25", "quelle": "Oecoplan Möbelplatte weiss (Wohn-Accessoires)" }
  }
};
if (typeof module !== 'undefined') module.exports = PREISE;
