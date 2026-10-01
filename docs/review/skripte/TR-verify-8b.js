const { run } = require('./TR-verify-lib.js');
const q = 40*9.81/1000;
// Faktor Einzelwange (Lasten auf 5 Tablarhöhen) aus TR-verify-8.js: Knicklast = f * Last, f je Material bei gleicher Lastverteilung
const lam = { mdf:1.50/0.36, birke18:3.34/0.75, birke12:1.99/0.37, osb:2.71/0.36 }; // Knicklast kN = lam*... -> Pcr in kN:
const Pcr = { mdf:1.50*0.36, birke18:3.34*0.75, birke12:1.99*0.37, osb:2.71*0.36 };
for (const [lab,key,o] of [['MDF 19','mdf',{mat:'mdf',t:19,sheetL:2800,sheetB:2070}],['Birke 18','birke18',{}],['Birke 12','birke12',{t:12}],['OSB 18','osb',{mat:'osb',t:18,sheetL:2500,sheetB:1250}]]) {
  const R = run({shape:'U',sys:'cheeks',doorIn:true,hinge:'L',rd:2000,...o});
  // linke Seite: Wangen mit x-Mitte > -800+t (nicht die hintere Endwange) und x < -400
  const W = R.boxes.filter(b=>b.key.startsWith('Wange') && b.pos[0] < -400 && b.pos[2] > -700);
  const T = R.boxes.filter(b=>b.key.startsWith('Tablar') && b.pos[0] < -400 && b.pos[2] > -700);
  const tabLen = T.reduce((a,b)=>a+b.size[2],0); // alle Tablare links, alle Ebenen
  const P = q*tabLen/1000; // kN gesamt auf die linken Wangen
  const n = W.length;
  console.log(`${lab}: linke Wangen ${n} (z ${W.map(b=>Math.round(b.pos[2])).join(', ')}), Last gesamt ${P.toFixed(2)} kN, Summe Knicklasten ${(n*Pcr[key]).toFixed(2)} kN -> Faktor gemeinsames Ausweichen ${(n*Pcr[key]/P).toFixed(2)}`);
}
// Vergleich: Segment zwischen zwei Wänden (Standard-U links, ohne Tür innen) – dort Kette Wand-Wange-Tablar-...-Wand
