require('./TR-verify-lib.js');
const K = require(require('path').join(__dirname, '../../..') + '/konfig.js');
const { overlaps } = require('./TR-verify-lib.js');
function seeded(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const FORM = { kind:'reduit', sheetL:'1500', sheetB:'3000', kerf:'4', grain:true, price:'100', rw:'1600', rd:'1400', rh:'2400', doorW:'800', doorIn:false, hinge:'L', wall:'solid',
  shape:'U', corner:'L', build:'built', sys:'battens', dBack:'400', dLeft:'300', dRight:'300', nShelves:'5', gapBottom:'150', gapTop:'300', mat:'birke', t:'18', back:'hdf3', joint:'pocket',
  nicheL:false, nicheLW:'450', nicheLH:'1300', nicheR:false, nicheRW:'450', nicheRH:'1300' };
const rnd = seeded(42); const c = { n:0, built:0, sys:{}, notch:0, notchSys:{}, soft:0, eck16:0, postsLU:0, screwOut:0, warnLeft:0 };
for (let i=0;i<300;i++){
  const d = K.zufall({ ...FORM }, rnd); c.n++;
  const R = K.computeData(d);
  if (d.build !== 'built') continue; c.built++;
  c.sys[d.sys] = (c.sys[d.sys]||0)+1;
  const o = overlaps(R, 'Tablar', 'Kantholz'); if (o.length) { c.notch++; c.notchSys[d.sys]=(c.notchSys[d.sys]||0)+1; }
  if (d.sys==='cheeks' && ['osb','mdf','dekorspan','seekiefer','regalbau','moebel_weiss'].includes(d.mat)) c.soft++;
  if (R.rows.some(r=>r.name==='Eckleiste' && r.kind==='korpus' && r.t<=16)) c.eck16++;
  if (d.sys==='posts' && d.shape!=='I') c.postsLU++;
  if (['rails','brackets'].includes(d.sys) && R.hw.some(h=>/4 × 35/.test(h[1]))) c.screwOut++;
  if (R.warn.filter(w=>!K.HARMLOS.test(w)).length) c.warnLeft++;
}
console.log(JSON.stringify(c));
