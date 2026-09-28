const { run } = require('./SK-verify-lib.js');
const M = MATS.birke;
console.log('birke sheet', M.sheet, 'price18', matPrice(M,18));
let R = run({sheetL:M.sheet[0], sheetB:M.sheet[1], price:matPrice(M,18)});
const g = R.groups[0]; console.log('sheet', g.sheet, 'n', g.sheets.length, 'whole CHF', Math.round(g.sheets.length*g.sheet[0]*g.sheet[1]/1e6*g.price), 'cut', Math.round(g.partArea/1e6*g.price));
const items = []; for (const r of R.rows) if (r.group===g.label && r.kind!=='back') for (let q=0;q<r.qty;q++) items.push(r);
const p3 = pack(items, 1500, 3000, 4, 10, false); console.log('1500x3000 sheets', p3.sheets.length, 'CHF', Math.round(p3.sheets.length*4.5*g.price), 'unplaced', p3.unplaced.length);
R = run({mat:'birke', t:12, W:2400, grain:false, sheetL:M.sheet[0], sheetB:M.sheet[1], price:matPrice(M,12)});
console.log(R.warn.filter(w=>/passt nicht/.test(w)));
// SK-11
for (const t of [18,27]) { R = run({mat:'eiche', t, joint:'pocket'}); console.log('eiche',t, R.hw[0]); }
// SK-15
R = run({W:1600, sections:2}); console.log(R.doors.map(d=>d.side+'@'+Math.round(d.cx)), R.hw.filter(h=>/Topf/.test(h[1])).map(h=>h.slice(0,2).join('× ')));
// SK-17
R = run({joint:'cam', top:'over'}); console.log(R.steps.find(s=>/Exzenter/.test(s[0]))[1]);
// SK-20
R = run({mat:'seekiefer', t:15, joint:'screws'}); console.log(R.steps.find(s=>/Schraub/.test(s[0]))[1].slice(0,70));
R = run({joint:'pocket', top:'over'}); console.log(R.steps.find(s=>/Taschen/.test(s[0]))[1].slice(0,120));
