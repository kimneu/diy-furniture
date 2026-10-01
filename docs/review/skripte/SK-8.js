// Grobe Durchbiegung Einlegeboden, Einfeldträger, Streckenlast q (kg/m), E (N/mm2), Kriechfaktor (1+kdef, EN 1995 NKL 1)
const d = (L, b, h, qkg, E, k) => { const q = qkg * 9.81 / 1000, I = b * h**3 / 12; const inst = 5*q*L**4/(384*E*I); return [inst, inst*k]; };
for (const [lbl, L, h, E, k] of [
  ['MDF 19 @ 772 (Sideboard ok)', 772, 19, 3000, 3.25],
  ['MDF 19 @ 550 (Reduit-SPAN)', 550, 19, 3000, 3.25],
  ['Span 16 @ 776 (Sideboard warnt ab 700)', 700, 16, 2500, 3.25],
  ['Span 19 @ 772', 772, 19, 2800, 3.25],
  ['Birke 18 @ 773', 773, 18, 7500, 1.8],
  ['OSB 12 @ 682', 682, 12, 4900, 2.5],
]) { const [i, f] = d(L, 387, h, 30, E, k); console.log(lbl.padEnd(40), 'inst', i.toFixed(1), 'mm, langzeit', f.toFixed(1), 'mm = L/' + Math.round(L/f)); }
