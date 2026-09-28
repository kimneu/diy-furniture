const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
const { SPAN } = require(p+'reduit.js');
// E-Modul-Bereich [min, max] N/mm², Kriechfaktor (1 + kdef) für Dauerlast
const PROP = {
  birke:[9000,11000,1.8,'Birke-Sperrholz (Deckfurnier längs)'], birkesi:[9000,11000,1.8,'Birke-Sperrholz'],
  fichte:[10000,11000,1.6,'Fichte-Leimholz'], gon_fichte:[10000,11000,1.6,'Fichte-Leimholz'], mood_fichte:[10000,11000,1.6,'Fichte-Leimholz'],
  eiche:[10000,12000,1.6,'Eiche-Leimholz (Annahme)'],
  dreischicht:[6000,9000,1.8,'Dreischicht'], gon_3s:[6000,9000,1.8,'Dreischicht'], schaltafel:[6000,9000,1.8,'Dreischicht (Schaltafel)'],
  osb:[3500,4900,2.5,'OSB 3 (Hauptachse)'], mdf:[2500,3500,2.5,'MDF'],
  dekorspan:[2500,3000,2.5,'Spanplatte'], regalbau:[2500,3000,2.5,'Spanplatte'], moebel_weiss:[2500,3000,2.5,'Spanplatte'],
  seekiefer:[6000,9000,1.8,'Nadelholz-Sperrholz (Annahme)'], fichtesp:[6000,9000,1.8,'Nadelholz-Sperrholz (Annahme)']
};
// Einfeldträger, Gleichlast q (N/mm entlang Tablar), Breite b = Tablartiefe
const defl = (L, q, E, b, t) => 5 * q * L**4 / (384 * E * b * t**3 / 12);
const Lmax = (q, E, b, t, k, cr) => Math.cbrt(384 * (E / cr) * b * t**3 / 12 / (5 * q * k));
const g = 9.81 / 1000; // kg/m -> N/mm
const rows = [];
for (const [m, byT] of Object.entries(SPAN)) {
  const P = PROP[m]; if (!P) continue;
  const [Emin, Emax, cr, name] = P, Em = (Emin + Emax) / 2;
  for (const [tS, span] of Object.entries(byT)) {
    const t = +tS;
    const avail = MATS[m] && MATS[m].t.includes(t) ? '' : ' (nicht im Katalog)';
    const L_mid200 = Lmax(35*g, Em, 300, t, 200, cr);
    const L_lo200 = Lmax(40*g, Emin, 300, t, 200, cr);
    const L_mid300 = Lmax(35*g, Em, 300, t, 300, cr);
    const L_lo300 = Lmax(40*g, Emin, 300, t, 300, cr);
    const L_200b = Lmax(40*g, Emin, 200, t, 300, cr);
    // Durchbiegung beim Tabellenwert (Dauer, 40 kg/m, Emin, b=300)
    const dT = defl(span, 40*g, Emin, 300, t) * cr;
    rows.push({ m, t, name, span, avail, L_mid200, L_lo200, L_mid300, L_lo300, L_200b, dT, ratio: span / dT });
  }
}
console.log('Material t | SPAN | L/200 (Emitte,35kg/m,b300) | L/200 (Emin,40kg/m,b300) | L/300 mitte | L/300 (Emin,40) | L/300 (Emin,40,b200) | f bei SPAN (Emin,40,b300,Dauer) = L/x');
for (const r of rows) console.log(`${r.m} ${r.t}${r.avail} | ${r.span} | ${r.L_mid200.toFixed(0)} | ${r.L_lo200.toFixed(0)} | ${r.L_mid300.toFixed(0)} | ${r.L_lo300.toFixed(0)} | ${r.L_200b.toFixed(0)} | ${r.dT.toFixed(1)} mm = L/${r.ratio.toFixed(0)}`);
module.exports = { PROP, defl, Lmax, g };
