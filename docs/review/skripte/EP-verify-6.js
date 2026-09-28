// EP-6 Wandwangen-Kosten, EP-9 Konsolen-Kreuzung
const L = require('./EP-verify-lib.js');
const K = require(require('path').join(__dirname, '../../..') + '/konfig.js');
const r = L.R({ sys:'cheeks' });
const W = r.W, D = r.D;
const wangen = r.boxes.filter(b => b.key.startsWith('Wange|'));
const X = b => L.bb(b)[0].map(x => Math.round(x + W/2)), Z = b => L.bb(b)[2].map(z => Math.round(z + D/2));
let flat = 0, flatA = 0, cornerA = 0;
for (const b of wangen) {
  const x = X(b), z = Z(b); const thinX = b.size[0] < 30; // Wange parallel zur Seitenwand
  const atWall = thinX ? (x[0] <= 3 || x[1] >= W - 3) : (z[0] <= 3 || z[1] >= D - 3);
  const A = b.size[1] * (thinX ? b.size[2] : b.size[0]) / 1e6;
  if (atWall) { flat++; flatA += A; if (thinX) cornerA += A; }
  console.log('Wange', 'x', x.join('..'), 'z', z.join('..'), atWall ? 'FLACH AN WAND' : '', A.toFixed(3));
}
const price = r.groups[0].price;
const sc = sheetCosts(r.groups);
console.log({ n: wangen.length, flat, flatA: flatA.toFixed(2), cornerA: cornerA.toFixed(2), price, flatCHF: (flatA * price).toFixed(0), cornerCHF: (cornerA * price).toFixed(0), holzZuschnitt: sc.cut.toFixed(0), holzPlatten: sc.whole.toFixed(0), buy: r.buyCost.toFixed(0), total: K.kostenGesamt(r).toFixed(0) });
// Ersatz durch 2 Lochleisten 60 breit je Wandende
const hL = r.H - 10; const leistA = flat * 2 * 60 * hL / 1e6;
console.log('Lochleisten', leistA.toFixed(2), 'm² → Ersparnis', ((flatA - leistA) * price).toFixed(0), 'CHF', 'Anteil am Holz Zuschnitt', ((flatA) / (r.groups[0].partArea/1e6)).toFixed(2));
// EP-9
for (const dB of [150, 200, 210, 220, 250, 260, 300]) {
  const rr = L.R({ sys:'rails', rw:2000, dBack:dB, dLeft:600, dRight:600 });
  const m = rr.extras.filter(e => e.type === 'metal');
  let n = 0, ex = null;
  for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) { const d = L.ov(m[i], m[j]); if (d) { n++; ex = ex || [L.bb(m[i]).map(q => q.map(v => Math.round(v))), L.bb(m[j]).map(q => q.map(v => Math.round(v)))]; } }
  console.log('rails dBack', rr.c ? '' : dB, 'Kollisionen Metall', n, ex ? JSON.stringify(ex) : '', rr.warn.filter(w => /Konsole/.test(w)));
}
