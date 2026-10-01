require('./TR-verify-lib.js'); const { SPAN } = globalThis;
const g = 9.81/1000, q = 40*g;
// Mittelwerte E (Biegung längs Deckschicht) und kdef Nutzungsklasse 1 (EN 1995-1-1 Tab. 3.2)
const P = { birke:[9000,0.8], fichte:[10000,0.6], gon_fichte:[10000,0.6], mood_fichte:[10000,0.6], eiche:[11000,0.6],
  dreischicht:[8000,0.8], gon_3s:[8000,0.8], osb:[4930,1.5], osb_min:[3500,1.5], mdf:[3000,2.25], dekorspan:[2800,2.25], regalbau:[2800,2.25], moebel_weiss:[2800,2.25] };
const Lmax = (E, kd, b, t, k) => Math.cbrt(384 * E * b * t**3 / 12 / (5 * q * k * (1 + kd)));
const ratio = (L, E, kd, b, t) => L / (5*q*L**4/(384*E*b*t**3/12)*(1+kd));
console.log('Material t | SPAN | L/200-Grenze (b300) | Verhältnis beim SPAN-Wert (b300) | (b400)');
for (const [m, [E, kd]] of Object.entries(P)) {
  const tab = SPAN[m.replace('_min','')]; if (!tab) continue;
  for (const [tS, sp] of Object.entries(tab)) { const t=+tS;
    console.log(`${m} ${t} | ${sp} | ${Lmax(E,kd,300,t,200).toFixed(0)} | L/${ratio(sp,E,kd,300,t).toFixed(0)} | L/${ratio(sp,E,kd,400,t).toFixed(0)}`);
  }
}
// TR-5: Leisten, vorne frei. Balkenwert (b = Tablartiefe) und x1,5 (Platte, 3 Seiten gelenkig, vorne frei, Näherung ohne Torsion)
const f = (L, E, b, t) => 5*q*L**4/(384*E*b*t**3/12);
for (const [lab, L, b, t, E, kd] of [['I1600 MDF19 1594x397',1594,397,19,3000,2.25], ['U Birke18 hinten 1594x397',1594,397,18,9000,0.8], ['U Birke18 seitlich 997x297',997,297,18,9000,0.8], ['I1000 Fichte18 994x397',994,397,18,10000,0.6]]) {
  const w = f(L,E,b,t);
  console.log(`${lab}: sofort ${w.toFixed(1)}..${(1.5*w).toFixed(1)} mm, Dauer ${(w*(1+kd)).toFixed(1)}..${(1.5*w*(1+kd)).toFixed(1)} mm = L/${(L/(w*(1+kd))).toFixed(0)}..L/${(L/(1.5*w*(1+kd))).toFixed(0)}`);
}
// Spannung MDF 19 bei 1594 (Festigkeit)
const M = q*1594**2/8, Wm = 397*19**2/6; console.log('MDF 19 1594: sigma', (M/Wm).toFixed(1), '..', (1.5*M/Wm).toFixed(1), 'N/mm2 (fm,k MDF ca. 20-30)');
// Querlatte 24x48 hochkant, Fichte, Last halbe Tablarlast
const I = 24*48**3/12, Ef = 11000, qh = q/2;
for (const L of [800, 1000, 1200, 1500]) { const w = 5*qh*L**4/(384*Ef*I)*1.6; console.log(`Querlatte Feld ${L}: Dauer ${w.toFixed(1)} mm = L/${(L/w).toFixed(0)}`); }
const Lc = 530, wc = qh*Lc**4/(8*Ef*I)*1.6; console.log('Querlatte Kragarm 530: Dauer', wc.toFixed(2), 'mm');
