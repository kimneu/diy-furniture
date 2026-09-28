// EP-3: Schraubenlänge Eckleiste je Material/Stärke; Zusatz: Konsolen-/Winkelschrauben, Winkel unter Boden
const L = require('./EP-verify-lib.js');
const out = [];
for (const [k, M] of Object.entries(MATS)) {
  const ts = M.boards ? [M.tDef] : (M.ts || Object.keys(M.prices || {}).map(Number));
  for (const t of ts) {
    let r; try { r = L.R({ sys:'battens', mat:k, t }); } catch (e) { out.push([k, t, 'ERR ' + e.message]); continue; }
    const row = r.rows.find(x => x.name === 'Eckleiste');
    const lt = row ? row.t : null; // Dicke der Eckleiste (liegt flach)
    const s = r.hw.find(h => /4 × 35/.test(h[1]));
    out.push([k, t, 'Leiste ' + (row ? row.B + '×' + row.t : '-'), 'in Tablar ' + (35 - lt), 'Rest/durch ' + (t - (35 - lt)), s ? s[0] + ' Stk' : '']);
  }
}
console.log(out.map(x => x.join(' | ')).join('\n'));
// Konsolen / Winkel: Schrauben von unten durch Blech (≈2 mm) ins Tablar
for (const sys of ['rails', 'brackets']) {
  const r = L.R({ sys });
  console.log(sys, r.hw.filter(h => /4 × 35|Konsole|Blechkonsole/.test(h[1])).map(h => h.slice(0, 3).join(' ')), '→ 35 − 2 Blech − 18 Tablar =', 35 - 2 - 18, 'mm Spitze oben heraus');
}
console.log(L.R({ sys:'brackets' }).steps.find(s => s[0] === 'Tablare auflegen')[1]);
// Winkel am untersten Tablar: tiefster Punkt der Metallteile
for (const gb of [0, 100, 150, 200, 250]) {
  const r = L.R({ sys:'brackets', gapBottom:gb });
  const ys = r.extras.filter(e => e.type === 'metal').map(e => e.pos[1] - e.size[1]/2);
  const w = r.hw.filter(h => /Blechkonsole/.test(h[1])).map(h => h[1]);
  console.log('brackets gapBottom', gb, 'tiefster Winkel y', Math.round(Math.min(...ys)), w, 'warn', r.warn.filter(x => /Boden|Winkel/.test(x)));
}
for (const gb of [0, 30, 60]) for (const sys of ['battens', 'posts', 'rails']) {
  const r = L.R({ sys, gapBottom:gb });
  const ys = [...r.boxes, ...r.extras.filter(e => e.type === 'metal')].map(e => e.pos[1] - e.size[1]/2);
  console.log(sys, 'gapBottom', gb, 'min y', Math.round(Math.min(...ys)), 'Eckleiste y0', (() => { const e = r.boxes.find(b => b.key.startsWith('Eckleiste')); return e ? Math.round(e.pos[1] - e.size[1]/2) : '-'; })(), 'warn', r.warn.length);
}
// Zufall: gapBottom Bereich
