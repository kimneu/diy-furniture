const p=require('path').join(__dirname, '../../..') + '/';
Object.assign(globalThis, require(p+'shared.js'));
Object.assign(globalThis, require(p+'sideboard.js'), require(p+'reduit.js'));
const K = require(p+'konfig.js');
const BASE = { W:1200, H:720, D:400, room:'living', mat:'birke', t:18, back:'hdf3', top:'over', sections:2, shelves:1,
  base:'legs', baseH:160, legShape:'cone', taper:35, legColor:'oak', joint:'pocket', front:'hinged', doorsPer:'auto',
  slideN:'auto', handle:'hole', color:'korpus', sheetL:1500, sheetB:3000, kerf:4, grain:true, price:88.95 };
const run = o => computeSideboard({ ...BASE, ...o });
// 1) Aufschlag je Korpusstärke (alle im Sideboard wählbaren Platten)
console.log('== Aufschlag je Korpusstärke (Blum CLIP top: Eck max 18, Mittel max 8.5 bei MP 0/C 3; +2 Seitenverst.)');
const ts = new Set(); for (const [k,M] of Object.entries(MATS)) if (!M.boards) for (const t of M.t) ts.add(t+'|'+k);
const byT = {}; for (const s of ts){ const [t,k]=s.split('|'); (byT[t]=byT[t]||[]).push(k); }
for (const t of Object.keys(byT).map(Number).sort((a,b)=>a-b)) {
  const k = byT[t][0];
  const R = run({ mat:k, t, sections:2, W:1600, price:matPrice(MATS[k],t) });   // 4 Türen: aussen + an der Mittelwand
  const outerDoor = R.doors[0], side = -R.W/2 + t;           // Innenfläche linke Seite
  const faOuter = side - (outerDoor.cx - outerDoor.dw/2);
  const div = R.boxes.find(b=>b.key.startsWith('Mittelwand'));
  const d2 = R.doors[1]; // rechte Tür im linken Fach, an der Mittelwand angeschlagen (side R)
  const faHalf = (d2.cx + d2.dw/2) - (div.pos[0]-div.size[0]/2);
  const cup = R.hw.find(h=>/Topfscharnier/.test(h[1]))[1].match(/Ø (\d+)/)[1];
  const ok = (fa, max) => fa <= max ? 'ok' : fa <= max+2 ? 'nur mit Seitenverstellung' : 'NICHT erreichbar';
  console.log(`t=${t} (${byT[t].join(',')}) tf=${R.tf} Topf Ø${cup}: Aufschlag aussen ${faOuter.toFixed(1)} [${ok(faOuter,18)}], Mittelwand ${faHalf.toFixed(1)} [${ok(faHalf,8.5)}], sides d2=${d2.side}, warn-hinge=${R.warn.filter(w=>/Scharnier|Aufschlag/i.test(w)).length}`);
}
// 2) Zufall: wie oft Korpus >= 21 oder Seekiefer 15 mit Drehtüren
function seeded(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const FORM = { kind:'sideboard', w:'1200', h:'720', d:'400', room:'living', mat:'birke', t:'18', back:'hdf3', top:'over',
  sections:'2', shelves:'1', base:'legs', baseH:'160', legShape:'cone', taper:'35', legColor:'oak', joint:'pocket',
  front:'hinged', doorsPer:'auto', slideN:'auto', handle:'hole', color:'korpus', sheetL:'1500', sheetB:'3000', kerf:'4', grain:true, price:'100' };
const rnd = seeded(42); const cnt = {}; let N=1000, hingedN=0;
for (let i=0;i<N;i++){ const d = K.zufall(FORM, rnd); if (d.front!=='hinged') continue; hingedN++;
  const R = K.computeData(d); const key = `korpus ${d.mat} ${R.t} / tf ${R.tf}`; if (R.t>=21 || R.tf<=15) cnt[key]=(cnt[key]||0)+1; }
console.log('== Zufall 1000 Würfe, davon Drehtüren', hingedN, JSON.stringify(cnt));
