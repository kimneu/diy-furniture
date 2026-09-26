/* Einkaufsliste für den Baumarkt: aus dem Ergebnis R Abschnitte mit abhakbaren Zeilen. Ohne DOM. */
'use strict';

// Abschnitte: Zuschnitt je Plattengruppe (Teile) bzw. ganze Bretter (nach Format gezählt), Latten,
// Beschläge/Kaufteile, Oberfläche, Werkzeug. Jede Zeile hat eine id aus ihrem Inhalt, damit ein Haken
// stehen bleibt, solange sich die Zeile nicht ändert.
function einkaufsliste(R){
  const liste = [];
  const abschnitt = (titel, info, zeilen) => {
    if (zeilen.length) liste.push({ titel, info, zeilen: zeilen.map(([text, sub]) => ({ id:`${titel}|${text}`, text, sub: sub || '' })) });
  };
  const maserung = r => R.M.grain && (r.kind === 'korpus' || r.kind === 'front');
  for (const g of R.groups) {
    if (g.boards) {
      const per = new Map();
      for (const s of g.sheets) { const k = `${s.L} × ${s.B}`; const e = per.get(k) || { n:0, price:s.price }; e.n++; per.set(k, e); }
      abschnitt(`${g.label} · ganze Bretter`, 'selbst ablängen', [...per].map(([k, e]) => [`${e.n} × Brett ${k} mm`, `à CHF ${e.price.toFixed(2)}`]));
    } else {
      const n = g.sheets.length;
      abschnitt(`${g.label} · Zuschnitt`, `${n} Platte${n === 1 ? '' : 'n'} ${g.sheet[0]} × ${g.sheet[1]} mm`,
        R.rows.filter(r => r.group === g.label).map(r => [
          `${r.qty} × ${r.L} × ${r.B} mm · ${r.pos} ${r.name}`,
          [maserung(r) ? 'Maserung längs' : '', r.note].filter(Boolean).join(' · ')
        ]));
    }
  }
  for (const grp of [...new Set(R.rows.filter(r => r.kind === 'solid').map(r => r.group))]) {
    abschnitt(grp, '', R.rows.filter(r => r.group === grp).map(r => [`${r.qty} × ${r.L} mm · ${r.pos} ${r.name}`, r.note]));
  }
  const reduit = R.hw.some(h => h[3]);
  abschnitt(reduit ? 'Beschläge & Kaufteile' : 'Beschläge & Kleinteile', '',
    R.hw.map(([q, n, s, p]) => [`${q} × ${n}`, [s, p ? `≈ CHF ${Math.round(q * p)}` : ''].filter(Boolean).join(' · ')]));
  abschnitt('Oberfläche', '', R.finish.map(([q, n, s]) => [`${q} ${n}`, s]));
  abschnitt('Werkzeug', 'nur falls es fehlt', R.tools.map(t => [t, '']));
  return liste;
}

function listeText(liste, titel){
  const out = [titel];
  for (const s of liste) {
    out.push('', s.titel);
    if (s.info) out.push(s.info);
    for (const z of s.zeilen) out.push(`- ${z.text}${z.sub ? ` (${z.sub})` : ''}`);
  }
  return out.join('\n');
}

function hakenFiltern(haken, liste){
  const ids = new Set(liste.flatMap(s => s.zeilen.map(z => z.id)));
  return haken.filter(id => ids.has(id));
}

if (typeof module !== 'undefined') module.exports = { einkaufsliste, listeText, hakenFiltern };
