// EP-4/5/8: Öffnung des ersten hinteren Fachs hinter der Seitenwange / dem Seitenmodul
const L = require('./EP-verify-lib.js');
function open(o, free){
  const r = L.R({ sys:'cheeks', ...o, ...(free ? { build:'free' } : {}) });
  const W = r.W, D = r.D;
  const X = b => L.bb(b)[0].map(x => x + W/2), Z = b => L.bb(b)[2].map(z => z + D/2);
  const dL = r.boxes.length && (o.dLeft ?? 300);
  // Seitenteil links an der Ecke: Wange/Seite, deren z-Bereich direkt vor dem hinteren Regal beginnt und x ab linker Wand
  const vert = r.boxes.filter(b => /^(Wange|Seite)\|/.test(b.key));
  const backDepth = Math.max(...r.boxes.filter(b => /^(Tablar|Einlegeboden)\|/.test(b.key) && Z(b)[0] < 20).map(b => Z(b)[1]));
  const cheekL = vert.filter(b => Z(b)[0] >= backDepth - 1 && Z(b)[0] < backDepth + 5 && X(b)[0] < 20).sort((a, b) => X(b)[1] - X(a)[1])[0];
  const shelvesBack = r.boxes.filter(b => /^(Tablar|Einlegeboden)\|/.test(b.key) && Z(b)[0] < 20 && X(b)[0] < 60);
  const s = shelvesBack[0];
  if (!s || !cheekL) return { err:'nicht gefunden', warn:r.warn };
  const len = X(s)[1] - X(s)[0], openW = X(s)[1] - X(cheekL)[1];
  const alpha = Math.acos(Math.min(1, openW / len)) * 180 / Math.PI;
  const hNeed = len * Math.sin(alpha * Math.PI / 180) + r.t * Math.cos(alpha * Math.PI / 180);
  return { fach: `${Math.round(X(s)[0])}..${Math.round(X(s)[1])}`, len: Math.round(len), verdecktBis: Math.round(X(cheekL)[1]), oeffnung: Math.round(openW), kippWinkel: Math.round(alpha), hoeheNoetig: Math.round(hNeed), anzahl: shelvesBack.length, warn: r.warn };
}
const cases = [
  ['Standard birke', {}],
  ['300/400 birke', { dBack:300, dLeft:400, dRight:400 }],
  ['2000 300/500 birke', { rw:2000, dBack:300, dLeft:500, dRight:500 }],
  ['2000 200/600 birke', { rw:2000, dBack:200, dLeft:600, dRight:600 }],
  ['Standard MDF19', { mat:'mdf', t:19 }],
  ['2400 400/400 MDF19', { rw:2400, dLeft:400, dRight:400, mat:'mdf', t:19 }],
  ['2000 300/500 MDF19', { rw:2000, dBack:300, dLeft:500, dRight:500, mat:'mdf', t:19 }],
];
for (const [lab, o] of cases) { console.log('WANGEN', lab, JSON.stringify(open(o, false))); console.log('FREI  ', lab, JSON.stringify(open(o, true))); }
// Levels / Lichte
const r = L.R({ sys:'cheeks' }); console.log('levels', r.steps.find(s => /Tablarhöhen/.test(s[0])));
