const { run, K, FORM } = require('./SK-verify-lib.js');
const M = MATS.osb;
const R = run({mat:'osb', t:12, W:2400, H:1400, D:650, sections:4, shelves:3, front:'open', joint:'screws', top:'between', base:'legs', baseH:200, sheetL:M.sheet[0], sheetB:M.sheet[1], price:matPrice(M,12)});
console.log(R.warn);
console.log(R.rows.map(r=>`${r.qty}x ${r.name} ${r.L}x${r.B}x${r.t}`));
console.log(R.hw.map(h=>h.join(' | ')));
console.log(R.steps.filter(s=>/Bodenträger|Schraub/.test(s[0])).map(s=>s[1]));
// which mats have 12
console.log(Object.entries(MATS).filter(([k,M])=>!M.boards && M.t.includes(12)).map(([k])=>k));
// dowels 12
const R2 = run({mat:'birke', t:12, joint:'dowels'});
console.log(R2.steps.find(s=>/Dübel/.test(s[0]))[1], R2.hw.filter(h=>/Dübel/.test(h[1])));
// Zufall t=12 count
function seeded(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = seeded(3); const ts={};
for (let i=0;i<500;i++){ const d=K.zufall({...FORM}, rnd); ts[d.t]=(ts[d.t]||0)+1; }
console.log('Zufall t', ts);
