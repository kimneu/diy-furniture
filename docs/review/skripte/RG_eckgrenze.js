require('./RG_lib.js');
// Grösste Seitentiefe, bei der ein Eckfach mit ≥ 350 mm Öffnung unter der Spannweite bleibt.
for (const [k, t] of [['birke', 18], ['fichtesp', 18], ['osb', 18], ['dreischicht', 19], ['mdf', 19], ['dekorspan', 19], ['eiche', 18], ['fichte', 18]]) {
  const max = maxSpan(k, t);
  let wange = 0, modul = 0;
  for (let dS = 150; dS <= 600; dS++) {
    if (dS + 350 - (3 + t) < max) wange = dS;          // Fach von Wandwange bis Eckwange bei x = dS + 350
    const w = dS + 350 + t - 10; if (w - 2 * t < max) modul = dS; // Modul ab x = 10, Innenraum bis w - t
  }
  console.log(`${k} ${t}: max ${max} → Wangen bis dSeite ${wange}, Module bis dSeite ${modul}`);
}
