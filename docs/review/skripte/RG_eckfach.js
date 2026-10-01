require('./RG_lib.js');
// Öffnung des hinteren Eckfachs (von vorne sichtbar) bei Wangen und selbststehend, L/U, Ecke links.
const mats = Object.entries(MATS).filter(([, M]) => !M.boards);
const rows = [];
let n = 0, lt350 = { cheeks:0, free:0 }, le0 = { cheeks:0, free:0 };
for (const [k, M] of mats) for (const t of M.t.filter(v => v >= 15)) for (const W of [1200, 1600, 2000, 2400]) for (const dS of [200, 300, 400, 500]) {
  const max = maxSpan(k, t);
  const pos = cheekPositions({ u0:0, u1:W, ends:['wall', 'wall'], niche:null }, t, max);
  const oC = pos[1] - dS;                          // Wangen: Fach bis zur nächsten Wange minus Seitenregal
  const { w } = moduleSplit(W - 20, max, t);
  const oF = (10 + w - t) - dS;                    // Module: Innenraum des ersten Moduls minus Seitenmodul
  n++;
  if (oC < 350) lt350.cheeks++; if (oF < 350) lt350.free++;
  if (oC <= 0) le0.cheeks++; if (oF <= 0) le0.free++;
  const fixOk = dS + 350 + t - 3 - t < max;        // Eckfach mit 350 Öffnung bleibt unter der Spannweite
  if (W === 1600 && [300, 400].includes(dS) && t === M.tDef) rows.push(`${k} ${t}: max ${max}, Fach ${pos[1] - pos[0] - t}, Öffnung Wangen ${oC}, Module ${oF}; Eckfach 350 möglich: ${fixOk}`);
}
console.log(rows.join('\n'));
console.log({ n, lt350, le0 });
// Grenze dSeite für feste Eckwange mit 350 Öffnung: dS + 347 < max
for (const [k, t] of [['birke', 18], ['mdf', 19], ['dekorspan', 19], ['osb', 18], ['fichtesp', 18], ['dreischicht', 19]]) console.log(k, t, 'dSeite max für Eckfach ≥ 350:', maxSpan(k, t) - 347 - 1);
