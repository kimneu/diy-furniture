const { K, FORM, hard } = require('./MX-verify-lib.js');
function seeded(seed){ let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2**32; }; }
for (const seed of [1, 42, 2026]) {
  const rnd = seeded(seed);
  const cnt = {}; const inc = k => cnt[k] = (cnt[k]||0)+1; const ex = {};
  for (let i = 0; i < 400; i++) {
    const d = K.zufall({ ...FORM, kind:'sideboard' }, rnd);
    const R = K.computeData(d);
    const t = Number(d.t);
    if (Number(d.shelves) > 0 && R.s > maxSpan(d.mat, t)) { inc('SPAN'); inc('SPAN '+d.mat+'/'+t); const f = R.s / maxSpan(d.mat,t); if (!ex.span || f > ex.span.f) ex.span = { f:+f.toFixed(2), s:Math.round(R.s), mat:d.mat, t, W:d.w, H:d.h, D:d.d, n:d.sections }; }
    if (d.mat === 'eiche' && d.joint === 'pocket') inc('eiche+pocket');
    if (d.mat === 'dekorspan' && d.joint === 'screws') inc('dekorspan+screws');
    if (d.mat === 'osb' && d.joint === 'screws') inc('osb+screws');
    if (d.joint === 'cam' && t < 16) inc('cam t<16');
    if (d.joint === 'cam' && t > 22) inc('cam t>22');
    const MF = R.MF; const solid = !MF.ply && MF.grain && !MF.coated;
    const dh = R.doors[0] ? R.doors[0].dh : R.slides[0] ? R.slides[0].dh : 0;
    if (solid && dh > 900) inc('Leimholztür>900');
    if (hard(R).length) inc('HARD');
  }
  console.log('SB seed', seed, JSON.stringify(cnt), JSON.stringify(ex));
}
for (const seed of [1, 42, 2026]) {
  const rnd = seeded(seed);
  const cnt = {}; const inc = k => cnt[k] = (cnt[k]||0)+1;
  for (let i = 0; i < 400; i++) {
    const d = K.zufall({ ...FORM, kind:'reduit' }, rnd);
    const R = K.computeData(d);
    if (d.mat === 'seekiefer' && d.build === 'free') inc('seekiefer15 free');
    if (d.mat === 'seekiefer' && d.build !== 'free' && d.sys === 'cheeks') inc('seekiefer15 cheeks');
    if (d.mat === 'dekorspan' && d.joint === 'screws') inc('dekorspan+screws (alle)');
    if (d.mat === 'dekorspan' && d.joint === 'screws' && d.build === 'free') inc('dekorspan+screws free');
    if (d.mat === 'osb' && d.joint === 'screws' && d.build === 'free') inc('osb+screws free');
    if (d.build === 'free') inc('free');
    if (d.build === 'free' && d.back === 'none') inc('free none');
    if (d.build !== 'free' && d.sys === 'battens' && !MATS[d.mat].boards) inc('battens Plattenleiste');
  }
  console.log('RD seed', seed, JSON.stringify(cnt));
}
