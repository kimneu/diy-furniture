const { run } = require('./TR_base.js');
const q = 40*9.81/1000, n = 5;
// Pfosten 45×45, 2118 hoch, unausgesteift (Pfosten + Querlatten, Tablare lose)
const Ip = 45**4/12, Lp = 2118;
for (const E of [11000, 7400]) console.log(`Pfosten Euler (E ${E}): ${(Math.PI**2*E*Ip/Lp**2/1000).toFixed(2)} kN, Dauer /1,6: ${(Math.PI**2*E*Ip/Lp**2/1600).toFixed(2)} kN`);
console.log('Last hinterer Pfosten (U, Querlatte trägt halbe Tablarlast, 2 Pfosten):', (q*1594/2/2*n/1000).toFixed(2), 'kN');
// Wangen: Knicklast unausgesteift (gelenkig oben/unten), Last Mittelwange = 2 halbe Felder
for (const [mat, t, E, cr] of [['birke', 12, 10000, 1.8], ['birke', 18, 10000, 1.8], ['seekiefer', 15, 7500, 1.8], ['osb', 18, 4200, 2.5], ['mdf', 19, 3000, 2.5]]) {
  const extra = mat === 'birke' ? {} : mat === 'seekiefer' ? { sheetL:2500, sheetB:1250 } : { sheetL:2770, sheetB:2070 };
  const R = run({ shape:'U', sys:'cheeks', build:'built', mat, t, ...extra });
  const W = R.rows.filter(r => r.name === 'Wange'), T = R.rows.filter(r => r.name === 'Tablar');
  const h = W[0].L, b = W[0].B, bay = Math.max(...T.map(r => r.L));
  const I = b * t**3 / 12, Ncr = Math.PI**2 * E * I / h**2;
  const N = q * bay * n;          // Mittelwange: 2 × halbes Feld
  const Nf = q * bay / 2 * n;     // Endwange am freien Ende: halbes Feld
  console.log(`Wange ${mat} ${t}: ${h}×${b}, Feld ${bay} | Ncr ${(Ncr/1000).toFixed(2)} kN, Dauer ${(Ncr/cr/1000).toFixed(2)} kN | Last Mittelwange ${(N/1000).toFixed(2)} kN (N/Ncr,Dauer = ${(N/(Ncr/cr)).toFixed(2)}), Endwange ${(Nf/1000).toFixed(2)} kN | Kippmass ${Math.hypot(h, b).toFixed(0)} mm (Raum ${R.H})`);
}
// Wangen mit Tür innen: freies Ende
const R = run({ shape:'U', sys:'cheeks', build:'built', doorIn:true, hinge:'L', rd:2000 });
const lw = R.boxes.filter(b => b.key.startsWith('Wange') && b.pos[0] < -400).map(b => Math.round(b.pos[2]));
console.log('Tür innen, linke Wangen z:', lw.join(', '), '(Vorderwand bei z =', R.D/2, ')');
