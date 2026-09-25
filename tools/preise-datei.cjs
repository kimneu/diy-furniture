/* preise.js lesen und schreiben. Die Datei ist JSON in einer Script-Hülle (damit sie ohne Build im Browser lädt):
   ein Eintrag pro Zeile, damit Diffs nach einem Preis-Update lesbar bleiben. */
'use strict';
const path = require('node:path');

const FILE = path.join(__dirname, '..', 'preise.js');
const HEAD = `/* Preise und Formate (Jumbo, CHF). Nachführen mit: cd tools && node jumbo-preise.mjs --schreiben
   Von Hand ändern geht auch – Form beibehalten (JSON, ein Eintrag pro Zeile), der Test prüft sie.
   platten:     prices = { Stärke: CHF/m² im Zuschnitt }, sheet = max. Zuschnitt [Länge = Maserung, Breite] in mm
   rueckwaende: price = CHF/m², sheet in mm
   bretter:     ganze Bretter (nur ablängen): t = Stärke, formate = [{ L = Länge, B = Breite in mm, price = CHF pro Stück }]
   kaufteile:   price = CHF pro Stück (unit m: pro Meter), est = geschätzt, noch nicht nachgeprüft
   stand = Datum der letzten Kontrolle, quelle = Jumbo-Produkt */
`;
const TAIL = `if (typeof module !== 'undefined') module.exports = PREISE;\n`;

const line = v => JSON.stringify(v, null, 1).replace(/\n\s*/g, ' ');

function format(data){
  const groups = Object.entries(data).map(([g, entries]) =>
    `  ${JSON.stringify(g)}: {\n` + Object.entries(entries).map(([k, v]) => `    ${JSON.stringify(k)}: ${line(v)}`).join(',\n') + '\n  }');
  return HEAD + 'const PREISE = {\n' + groups.join(',\n') + '\n};\n' + TAIL;
}

module.exports = { FILE, format };
