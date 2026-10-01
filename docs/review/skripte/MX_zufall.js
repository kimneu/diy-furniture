const { K, FORM, run, hard, lcg } = require('./MX_lib.js');
const N = 400;
const cnt = (m, k) => m.set(k, (m.get(k) || 0) + 1);
const show = (title, m) => console.log(title, [...m].sort((a,b)=>b[1]-a[1]).map(([k,v]) => `${k}:${v}`).join('  '));
// ---------- Sideboard ----------
{
  const rnd = lcg(12345); const mt = new Map(), mj = new Map(), fr = new Map(), fm = new Map(), col = new Map(), bk = new Map(), rest = [];
  const bad = { screwSpan:[], pocketEiche:[], spanMat:[], camThin:[], solidTall:[], screwOSB:[], lochreihe:[] , dowelFace:[]};
  for (let i = 0; i < N; i++) {
    const d = K.zufall({ ...FORM }, rnd);
    const R = K.computeData(d);
    const h = hard(R); if (h.length) rest.push({ i, d, h });
    const t = Number(d.t);
    cnt(mt, `${d.mat}/${t}`); cnt(mj, d.joint); cnt(fr, d.front); cnt(fm, d.front === 'open' ? 'open' : `${d.frontMat}${d.frontMat!=='korpus'?'/'+d.frontT:''}`); cnt(col, d.front==='open'?'-':d.color); cnt(bk, d.back);
    const tag = `#${i} ${d.mat} ${t} ${d.joint} ${d.w}x${d.h}x${d.d} sec${d.sections} sh${d.shelves} ${d.front}`;
    if (d.joint === 'screws' && MATS[d.mat].coated) bad.screwSpan.push(tag);
    if (d.joint === 'pocket' && d.mat === 'eiche') bad.pocketEiche.push(tag);
    if (Number(d.shelves) > 0 && R.s > maxSpan(d.mat, t)) bad.spanMat.push(`${tag} s=${Math.round(R.s)} SPAN=${maxSpan(d.mat,t)}`);
    if (d.joint === 'cam' && t < 16) bad.camThin.push(tag);
    const door = R.rows.find(r => r.kind === 'front'); const MF = R.MF;
    if (door && !MF.ply && MF.grain && !MF.coated && door.L > 900) bad.solidTall.push(`${tag} Tür ${door.L}x${door.B} ${MF.name} ${R.tf}`);
  }
  console.log('=== Sideboard', N, 'Würfe (LCG 12345)');
  show('Material/Stärke:', mt); show('Verbindung:', mj); show('Front:', fr); show('Frontmaterial:', fm); show('Farbe:', col); show('Rückwand:', bk);
  console.log('Würfe mit verbleibender harter Warnung (Fallback best.d):', rest.length, rest.slice(0,3).map(r => r.h[0].slice(0,90)));
  for (const [k, v] of Object.entries(bad)) console.log(`\n[${k}] ${v.length}×`, v.slice(0, 4).join(' || '));
}
// ---------- Reduit ----------
{
  const rnd = lcg(987654); const mt = new Map(), bw = new Map(), jt = new Map(), sh = new Map(), combo = new Map(), rest = [];
  const bad = { screwsCoated:[], thinFree:[], thinCheeks:[], stripsFromPlate:[], bearing:[], freeTallNoGuard:[] };
  for (let i = 0; i < N; i++) {
    const d = K.zufall({ ...FORM, kind:'reduit' }, rnd);
    const R = K.computeData(d); const h = hard(R); if (h.length) rest.push({ i, d, h });
    const t = Number(d.t);
    cnt(mt, `${d.mat}/${t}`); const b = d.build === 'free' ? 'free' : d.sys; cnt(bw, b); cnt(sh, d.shape);
    if (d.build === 'free') cnt(jt, d.joint);
    cnt(combo, `${d.mat}+${b}`);
    const tag = `#${i} ${d.mat} ${t} ${d.shape} ${b}${d.build==='free'?'/'+d.joint:''} tiefen ${d.dBack}/${d.dLeft}/${d.dRight}`;
    if (d.build === 'free' && d.joint === 'screws' && MATS[d.mat].coated && !MATS[d.mat].boards) bad.screwsCoated.push(tag);
    const side = R.rows.find(r => r.name === 'Seite');
    if (d.build === 'free' && t <= 15) bad.thinFree.push(`${tag} Seite ${side ? side.L + 'x' + side.B : ''}`);
    if (d.build !== 'free' && d.sys === 'cheeks' && t <= 15) bad.thinCheeks.push(tag);
    const strips = R.rows.filter(r => r.name === 'Leiste' && r.kind === 'korpus');
    if (strips.length) { const m = strips.reduce((a, r) => a + r.qty * r.L, 0) / 1000; bad.stripsFromPlate.push(`${tag} ${m.toFixed(1)} m Streifen 40×${t} aus ${MATS[d.mat].name}`); }
    if (d.build !== 'free' && d.sys === 'battens' && t - 3 <= 12) bad.bearing.push(`${tag} Auflage ${t-3} mm`);
  }
  console.log('\n=== Reduit', N, 'Würfe (LCG 987654), Raum 1600x1400x2400');
  show('Material/Stärke:', mt); show('Bauweise:', bw); show('Verbindung (free):', jt); show('Form:', sh);
  show('Material+Bauweise:', combo);
  console.log('Würfe mit verbleibender harter Warnung:', rest.length, rest.slice(0,3).map(r => r.h[0].slice(0,90)));
  for (const [k, v] of Object.entries(bad)) console.log(`\n[${k}] ${v.length}×`, v.slice(0, 4).join(' || '));
}
