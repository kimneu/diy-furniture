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

// Passt die gelesene Produktseite zum Format in preise.js? null = ja, sonst der Grund (dann nicht schreiben).
function checkBoardPage(page, want){
  const d = page.dims || [];
  if (!d.includes(want.L) || !d.includes(want.B)) return `Masse der Seite (${d.join(' × ') || '–'}) passen nicht zu ${want.L} × ${want.B}`;
  const t = page.thick != null ? page.thick : d.length === 3 ? Math.min(...d) : null;
  if (t != null && want.t != null && t !== want.t) return `Stärke der Seite (${t} mm) passt nicht zu ${want.t} mm`;
  return null;
}

// Kaufteile: Packungsgrösse aus dem Produktnamen oder der URL («2 Stück», «…--50-stueck»), null = nicht erkennbar.
function packungAus(name, url){
  const m = String(name || '').match(/(\d+)\s*(?:Stück|Stk\b)/i) || String(url || '').match(/-(\d+)-stueck(?:[/?#]|$)/);
  return m ? Number(m[1]) : null;
}

// Passt die gelesene Kaufteil-Seite zur Quelle (want = Eintrag in jumbo-quellen.json)? null = ja, sonst der Grund.
function checkKaufteilPage(page, want){
  if (!page.price) return 'kein Preis gelesen (Bot-Prüfung?)';
  const soll = want.stueck || 1;
  if (page.stueck != null && page.stueck !== soll) return `Packung der Seite (${page.stueck} Stück) passt nicht zu ${soll} Stück in jumbo-quellen.json`;
  return null;
}

// Preis pro Stück aus dem Packungspreis; bei Meterware (laenge = Meter pro Stück) pro Meter. Auf 0,001 CHF gerundet.
const stueckPreis = (price, want) => Math.round(price / (want.stueck || 1) / (want.laenge || 1) * 1000) / 1000;

module.exports = { FILE, format, checkBoardPage, packungAus, checkKaufteilPage, stueckPreis };
