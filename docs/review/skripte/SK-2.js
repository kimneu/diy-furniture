const { K } = require('./SK-base.js');
function seeded(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const FORM = {
  kind:'sideboard', w:'1200', h:'720', d:'400', room:'living', mat:'birke', t:'18', back:'hdf3', top:'over',
  sections:'2', shelves:'1', base:'legs', baseH:'160', legShape:'cone', taper:'35', legColor:'oak', joint:'pocket',
  front:'hinged', doorsPer:'auto', slideN:'auto', handle:'hole', color:'korpus',
  sheetL:'1500', sheetB:'3000', kerf:'4', grain:true, price:'100', frontMat:'korpus' };
for (const room of ['living', 'bath']) {
  const rnd = seeded(42 + room.length); const N = 1000;
  const cnt = { shelvesOver:0, shelves:0, camThin:0, screwsDiv:0, bathSpan:0, slideShelves:0, hiLow:0, exmpl:[] };
  const byMat = {};
  for (let i = 0; i < N; i++) {
    const d = K.zufall({ ...FORM, room }, rnd);
    const c = K.cfgFromData(d); const R = computeSideboard(c);
    if (c.shelves) { cnt.shelves++; const lim = maxSpan(c.mat, c.t); if (R.s > lim) { cnt.shelvesOver++; byMat[c.mat+c.t] = (byMat[c.mat+c.t]||0)+1; if (cnt.exmpl.length < 3) cnt.exmpl.push(`${c.mat} ${c.t} W${c.W} n${c.sections} s=${R.s.toFixed(0)} lim=${lim}`); } }
    if (c.joint === 'cam' && c.t < 16) cnt.camThin++;
    if (c.joint === 'screws' && c.sections > 1) cnt.screwsDiv++;
    if (room === 'bath' && c.mat === 'dekorspan') cnt.bathSpan++;
    if (c.front === 'sliding' && c.shelves) cnt.slideShelves++;
    if (R.Hi < 250) cnt.hiLow++;
  }
  console.log(room, N, JSON.stringify(cnt), JSON.stringify(byMat));
}
