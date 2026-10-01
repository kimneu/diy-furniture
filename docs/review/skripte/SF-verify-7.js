const { K, FORM, seeded, sb } = require('./SF-verify-lib.js');
function access(w, sec){
  const { R } = sb({ front:'sliding', w:String(w), sections:String(sec), shelves:'0', handle:'shell' });
  const Wi = R.Wi, ws = R.slides[0].ws, ns = R.slides.length, t = R.t;
  const divs = R.boxes.filter(b => /Mittelwand/.test(b.key)).map(b => b.pos[0]).sort((a,b)=>a-b);
  const bnd = [-Wi/2, ...divs.flatMap(x => [x - t/2, x + t/2]), Wi/2];
  const secs = []; for (let i = 0; i < bnd.length; i += 2) secs.push([bnd[i], bnd[i+1]]);
  const step = 2; const lo = -Wi/2, hi = Wi/2 - ws;
  const best = secs.map(() => 0);
  const pos = [];
  function rec(i){
    if (i === ns) {
      secs.forEach(([a, b], j) => {
        // uncovered length in [a,b]
        const iv = pos.map(p => [Math.max(a, p), Math.min(b, p + ws)]).filter(([x, y]) => y > x).sort((u, v) => u[0] - v[0]);
        let cov = 0, cur = a; for (const [x, y] of iv) { if (y <= cur) continue; cov += y - Math.max(x, cur); cur = y; }
        const free = (b - a) - cov; if (free > best[j]) best[j] = free;
      }); return;
    }
    for (let x = lo; x <= hi + 1e-9; x += step) {
      // same track (i%2) doors keep order and no overlap
      let ok = true; for (let k = 0; k < i; k++) if (k % 2 === i % 2 && x < pos[k] + ws) ok = false;
      if (!ok) continue; pos[i] = x; rec(i + 1);
    }
  }
  rec(0);
  return `W${w} n${sec} ns${ns} ws${r0(ws)}: ` + secs.map(([a, b], j) => `Fach ${j+1} ${r0(b-a)} mm → max offen ${r0(best[j])} (${r0(100*best[j]/(b-a))} %)`).join('; ');
}
for (const [w, s] of [[1200,3],[1400,3],[1800,2],[1800,4],[1200,2],[1800,3]]) console.log(access(w, s));
