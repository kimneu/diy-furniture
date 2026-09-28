const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
function seeded(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const FORM = { kind:'sideboard', w:'1200', h:'720', d:'400', room:'living', mat:'birke', t:'18', back:'hdf3', top:'over',
  sections:'2', shelves:'1', base:'legs', baseH:'160', legShape:'cone', taper:'35', legColor:'oak', joint:'pocket',
  front:'hinged', doorsPer:'auto', slideN:'auto', handle:'hole', color:'korpus', sheetL:'1500', sheetB:'3000', kerf:'4', grain:true, price:'100' };
const rnd = seeded(7); let sl=0; const combos={}; let shelvesSl=0;
// kleinste Zugangsbreite je Fach: Fach vollständig durch Verschieben EINER Tür erreichbar?
function minAccess(R){
  // Öffnungen: für jede Tür die Lücke, wenn man sie ganz über die Nachbarin schiebt = [left,right] des Türfeldes minus Überlappung
  const ov=30, ws=R.slides[0].ws, Wi=R.Wi, ns=R.slides.length;
  const opens=[]; for(let i=0;i<ns;i++){ const l=-Wi/2+i*(ws-ov); opens.push([l+(i>0?ov:0), l+ws-(i<ns-1?ov:0)]); }
  const bounds=[-Wi/2, ...R.boxes.filter(b=>b.key.startsWith('Mittelwand')).map(b=>b.pos[0]).sort((a,b)=>a-b), Wi/2];
  let worst=Infinity;
  for(let j=0;j<bounds.length-1;j++){ const a=bounds[j]+(j?R.t/2:0), b=bounds[j+1]-(j<bounds.length-2?R.t/2:0);
    let best=0; for(const [l,r] of opens) best=Math.max(best, Math.min(b,r)-Math.max(a,l));
    worst=Math.min(worst, best/(b-a)); }
  return worst;
}
for (let i=0;i<2000;i++){ const d=K.zufall(FORM,rnd); if(d.front!=='sliding') continue; sl++;
  const R=K.computeData(d); const n=R.n, ns=R.slides.length; const k=`n${n}/Türen${ns}`; combos[k]=(combos[k]||0)+1;
  if (R.rows.some(r=>r.name==='Einlegeboden')) shelvesSl++;
}
console.log('Zufall Schiebetüren', sl, JSON.stringify(combos), 'davon mit Einlegeböden', shelvesSl);
const BASE = { W:1200, H:720, D:400, room:'living', mat:'birke', t:18, back:'hdf3', top:'over', sections:2, shelves:1,
  base:'legs', baseH:160, legShape:'cone', taper:35, legColor:'oak', joint:'pocket', front:'sliding', doorsPer:'auto',
  slideN:'auto', handle:'shell', color:'korpus', sheetL:1500, sheetB:3000, kerf:4, grain:true, price:88.95 };
for (const o of [{sections:2},{sections:3},{sections:3,W:1400},{sections:2,W:1800},{sections:3,W:1800},{sections:4,W:1800}]) {
  const R=computeSideboard({...BASE,...o}); console.log(JSON.stringify(o), `n${R.n}/Türen${R.slides.length}`, 'schlechtestes Fach: max. offener Anteil bei einer verschobenen Tür', (minAccess(R)*100).toFixed(0)+'%', 'warn:', R.warn.length);
}
